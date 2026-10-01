import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,join,normalize,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(process.cwd(),'_site');
const PORT=Number(process.env.PORT||3000);
if(!Number.isInteger(PORT)||PORT<1||PORT>65535)throw new Error('Invalid PORT');

const TYPES=new Map([
  ['.html','text/html; charset=utf-8'],
  ['.js','text/javascript; charset=utf-8'],
  ['.mjs','text/javascript; charset=utf-8'],
  ['.css','text/css; charset=utf-8'],
  ['.json','application/json; charset=utf-8'],
  ['.webmanifest','application/manifest+json; charset=utf-8'],
  ['.svg','image/svg+xml'],
  ['.png','image/png'],
  ['.webp','image/webp'],
  ['.txt','text/plain; charset=utf-8'],
  ['.md','text/markdown; charset=utf-8']
]);

function safePath(pathname){
  let decoded;
  try{decoded=decodeURIComponent(pathname);}catch{return null;}
  const relative=normalize(decoded).replace(/^([/\\])+/, '');
  if(!relative||relative==='.')return 'index.html';
  if(relative==='..'||relative.startsWith('..'+sep)||relative.includes(sep+'..'+sep))return null;
  const target=resolve(ROOT,relative);
  if(target!==ROOT&&!target.startsWith(ROOT+sep))return null;
  return relative;
}

async function sendFile(res,relative){
  const path=join(ROOT,relative);
  const info=await stat(path);
  if(!info.isFile())throw new Error('NOT_FILE');
  const body=await readFile(path);
  res.writeHead(200,{
    'content-type':TYPES.get(extname(path).toLowerCase())||'application/octet-stream',
    'cache-control':'no-store'
  });
  res.end(body);
}

export function createDevServer(){
  return createServer(async(req,res)=>{
    if(!req.url||!['GET','HEAD'].includes(req.method||'')){res.writeHead(405);res.end();return;}
    const url=new URL(req.url,'http://127.0.0.1');
    const relative=safePath(url.pathname);
    if(relative===null){res.writeHead(400);res.end('Bad request');return;}
    try{
      if(req.method==='HEAD'){
        const path=join(ROOT,relative);
        const info=await stat(path);
        if(!info.isFile())throw new Error('NOT_FILE');
        res.writeHead(200,{'content-type':TYPES.get(extname(path).toLowerCase())||'application/octet-stream','cache-control':'no-store'});
        res.end();
        return;
      }
      await sendFile(res,relative);
    }catch{
      const acceptsHtml=(req.headers.accept||'').includes('text/html');
      if(acceptsHtml){
        try{await sendFile(res,'index.html');return;}catch{}
      }
      res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
      res.end('Not found');
    }
  });
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=createDevServer();
  server.listen(PORT,'127.0.0.1',()=>{
    console.log(`FOLKOOP local server: http://127.0.0.1:${PORT}`);
  });
}
