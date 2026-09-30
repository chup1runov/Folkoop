import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const PUBLISHABLE=/^sb_publishable_[A-Za-z0-9_-]{10,200}$/;

export async function loadPublicNetworkConfig(
  url=new URL('../../network-config.js',import.meta.url)
){
  const code=await readFile(url,'utf8');
  const context=vm.createContext({globalThis:{}});
  vm.runInContext(code,context,{filename:'network-config.js'});
  const raw=context.globalThis.FolkoopNetworkConfig;
  if(!raw||typeof raw!=='object')throw new Error('AUTH_PREFLIGHT_CONFIG_MISSING');
  let projectUrl,redirect;
  try{
    projectUrl=new URL(raw.url);
    redirect=new URL(raw.oauthRedirectUrl);
  }catch{
    throw new Error('AUTH_PREFLIGHT_CONFIG_URL');
  }
  if(raw.enabled!==true
    || projectUrl.protocol!=='https:'
    || !/^\w{20}\.supabase\.co$/.test(projectUrl.hostname)
    || projectUrl.pathname!=='/'
    || projectUrl.search
    || projectUrl.hash
    || !PUBLISHABLE.test(raw.publishableKey||'')
    || redirect.protocol!=='https:'
    || redirect.username
    || redirect.password
    || redirect.search
    || redirect.hash
    || !redirect.pathname.endsWith('/auth-callback.html')){
    throw new Error('AUTH_PREFLIGHT_CONFIG_INVALID');
  }
  return Object.freeze({
    enabled:true,
    projectUrl:projectUrl.origin,
    projectHost:projectUrl.hostname,
    publishableKey:raw.publishableKey,
    googleOAuthEnabled:raw.googleOAuthEnabled===true,
    oauthRedirectUrl:redirect.href
  });
}

export function summarizeAuthSettings(settings,config){
  if(!settings||typeof settings!=='object')throw new Error('AUTH_PREFLIGHT_SETTINGS_INVALID');
  const external=settings.external&&typeof settings.external==='object'?settings.external:{};
  const googleProviderEnabled=external.google===true;
  const emailProviderEnabled=external.email===true;
  const phoneProviderEnabled=external.phone===true;
  const signupDisabled=settings.disable_signup===true;
  const blockers=[];
  if(!googleProviderEnabled)blockers.push('hosted_google_provider_disabled');
  if(!config.googleOAuthEnabled)blockers.push('app_google_oauth_flag_disabled');
  return Object.freeze({
    projectHost:config.projectHost,
    oauthRedirectUrl:config.oauthRedirectUrl,
    hosted:{
      googleProviderEnabled,
      emailProviderEnabled,
      phoneProviderEnabled,
      signupDisabled
    },
    application:{
      networkEnabled:config.enabled,
      googleOAuthEnabled:config.googleOAuthEnabled
    },
    hostedGoogleReady:googleProviderEnabled&&!signupDisabled,
    googlePilotReady:googleProviderEnabled&&config.googleOAuthEnabled&&!signupDisabled,
    blockers
  });
}

export async function probeHostedAuth(config,{fetchImpl=globalThis.fetch}={}){
  if(typeof fetchImpl!=='function')throw new Error('AUTH_PREFLIGHT_FETCH_UNAVAILABLE');
  const endpoint=new URL('/auth/v1/settings',config.projectUrl);
  const response=await fetchImpl(endpoint,{
    method:'GET',
    headers:{apikey:config.publishableKey,accept:'application/json'},
    redirect:'error',
    cache:'no-store'
  });
  if(!response.ok)throw new Error('AUTH_PREFLIGHT_SETTINGS_HTTP_'+response.status);
  if(!/\bjson\b/i.test(response.headers.get('content-type')||'')){
    throw new Error('AUTH_PREFLIGHT_SETTINGS_NOT_JSON');
  }
  return summarizeAuthSettings(await response.json(),config);
}

export function safePrintableReport(report){
  return {
    projectHost:report.projectHost,
    oauthRedirectUrl:report.oauthRedirectUrl,
    hosted:report.hosted,
    application:report.application,
    hostedGoogleReady:report.hostedGoogleReady,
    googlePilotReady:report.googlePilotReady,
    blockers:[...report.blockers]
  };
}

async function main(){
  const config=await loadPublicNetworkConfig();
  const report=await probeHostedAuth(config);
  console.log(JSON.stringify(safePrintableReport(report),null,2));
  if(process.argv.includes('--require-hosted-google')&&!report.hostedGoogleReady){
    process.exitCode=2;
  }
  if(process.argv.includes('--require-google-ready')&&!report.googlePilotReady){
    process.exitCode=2;
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{
    console.error(error instanceof Error?error.message:String(error));
    process.exitCode=1;
  });
}
