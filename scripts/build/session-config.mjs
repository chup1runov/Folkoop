// Opt in only on the configured Cloudflare host; GitHub remains static.
export function sessionConfig(source,env=process.env){
 if(env.FOLKOOP_SERVER_SESSION!=='1')return source;
 if(env.CF_PAGES!=='1')throw new Error('Server sessions require Cloudflare Pages');
 if(!/^https:\/\/\w{20}\.supabase\.co$/.test(env.SUPABASE_URL||'')||!/^sb_publishable_/.test(env.SUPABASE_PUBLISHABLE_KEY||'')||!/^[a-f0-9]{64}$/i.test(env.SESSION_KEY||''))throw new Error('Server session configuration incomplete');
 if(!source.includes("url:'"+env.SUPABASE_URL+"'")||!source.includes("publishableKey:'"+env.SUPABASE_PUBLISHABLE_KEY+"'"))throw new Error('Server and browser Supabase configuration differ');
 if(!source.includes('serverSession:false'))throw new Error('Server session flag missing');
 return source.replace('serverSession:false','serverSession:true');
}
