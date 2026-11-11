// Loopback-only synthetic provider + real SQLite/session handler. Never production.
import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {createSessionHandler} from '../../server/auth/session.mjs';
const db=new DatabaseSync(':memory:');db.exec(await readFile('cloudflare/migrations/0001_sessions.sql','utf8'));
const uid='11111111-1111-4111-8111-111111111111';
const env={SESSION_KEY:Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''),SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic_only',SESSIONS:{prepare(s){return {bind(...args){return {async first(){return db.prepare(s).get(...args)||null;},async run(){return {meta:{changes:Number(db.prepare(s).run(...args).changes)}};}};}};}}};
const handle=createSessionHandler({fetch:async url=>url.includes('/token?')?Response.json({access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_in:3600}):url.endsWith('/user')?Response.json({id:uid,email_confirmed_at:'2026-01-01'}):url.includes('/logout')?new Response(null,{status:204}):Response.json(url.includes('/fk_profiles?')?[{id:uid,name:'Synthetic session person',skills:'',about:'',listed:true}]:url.includes('/fk_claim_pilot_invite')?true:[])});
const root=resolve('_site');
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost:4490');
 if(url.pathname.startsWith('/api/network/')){let body='';for await(const chunk of req)body+=chunk;const r=await handle(new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body}: {})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;}
 if(url.pathname.endsWith('/network-config.js')){res.setHeader('Content-Type','application/javascript');res.end('globalThis.FolkoopNetworkConfig='+JSON.stringify({enabled:true,serverSession:true,googleOAuthEnabled:true,oauthRedirectUrl:'https://example.test/auth-callback.html',url:env.SUPABASE_URL,publishableKey:env.SUPABASE_PUBLISHABLE_KEY})+';');return;}
 const path=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 const data=await readFile(path);res.setHeader('Content-Type',({'.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(data);
}catch{res.writeHead(404);res.end();}}).listen(4490,'127.0.0.1',()=>console.log('Synthetic session server ready'));
