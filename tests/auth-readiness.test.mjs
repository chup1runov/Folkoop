import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  loadPublicNetworkConfig,
  summarizeAuthSettings,
  probeHostedAuth,
  safePrintableReport
} from '../scripts/auth/probe-auth-readiness.mjs';

const config={
  enabled:true,
  projectUrl:'https://abcdefghijklmnopqrst.supabase.co',
  projectHost:'abcdefghijklmnopqrst.supabase.co',
  publishableKey:'sb_publishable_example_for_tests_only',
  googleOAuthEnabled:false,
  oauthRedirectUrl:'https://example.test/Folkoop/auth-callback.html'
};

const json=(body,status=200,contentType='application/json')=>new Response(
  JSON.stringify(body),
  {status,headers:{'content-type':contentType}}
);

test('public network config is valid and contains no secret/service-role key',async()=>{
  const cfg=await loadPublicNetworkConfig();
  assert.equal(cfg.enabled,true);
  assert.match(cfg.projectHost,/^[a-z0-9]{20}\.supabase\.co$/);
  assert.match(cfg.publishableKey,/^sb_publishable_/);
  assert.equal(cfg.oauthRedirectUrl,'https://chup1runov.github.io/Folkoop/auth-callback.html');
  assert.equal(cfg.googleOAuthEnabled,true);
  assert(!/service_role|sb_secret_/i.test(JSON.stringify(cfg)));
});

test('settings summary distinguishes hosted provider from application flag',()=>{
  const report=summarizeAuthSettings(
    {external:{google:true,email:true,phone:false},disable_signup:false},
    config
  );
  assert.equal(report.hosted.googleProviderEnabled,true);
  assert.equal(report.application.googleOAuthEnabled,false);
  assert.equal(report.hostedGoogleReady,true);
  assert.equal(report.googlePilotReady,false);
  assert.deepEqual(report.blockers,['app_google_oauth_flag_disabled']);
});

test('Google readiness requires hosted provider, app flag and enabled signup',()=>{
  const enabled={...config,googleOAuthEnabled:true};
  const ready=summarizeAuthSettings(
    {external:{google:true},disable_signup:false},
    enabled
  );
  assert.equal(ready.hostedGoogleReady,true);
  assert.equal(ready.googlePilotReady,true);
  const noProvider=summarizeAuthSettings(
    {external:{google:false},disable_signup:false},
    enabled
  );
  assert.equal(noProvider.hostedGoogleReady,false);
  assert.equal(noProvider.googlePilotReady,false);
  const signupOff=summarizeAuthSettings(
    {external:{google:true},disable_signup:true},
    enabled
  );
  assert.equal(signupOff.hostedGoogleReady,false);
  assert.equal(signupOff.googlePilotReady,false);
});

test('hosted probe sends only publishable key and rejects malformed responses',async()=>{
  const calls=[];
  const report=await probeHostedAuth(config,{fetchImpl:async(url,options)=>{
    calls.push({url:String(url),options});
    return json({external:{google:false,email:true},disable_signup:false});
  }});
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://abcdefghijklmnopqrst.supabase.co/auth/v1/settings');
  assert.equal(calls[0].options.headers.apikey,config.publishableKey);
  assert(!calls[0].options.headers.Authorization);
  assert.equal(report.googlePilotReady,false);

  await assert.rejects(
    probeHostedAuth(config,{fetchImpl:async()=>json({},500)}),
    /AUTH_PREFLIGHT_SETTINGS_HTTP_500/
  );
  await assert.rejects(
    probeHostedAuth(config,{fetchImpl:async()=>json({},200,'text/html')}),
    /AUTH_PREFLIGHT_SETTINGS_NOT_JSON/
  );
});

test('printable report never includes API key or provider secrets',()=>{
  const report=summarizeAuthSettings(
    {external:{google:true,email:true},disable_signup:false},
    {...config,googleOAuthEnabled:true}
  );
  const printed=JSON.stringify(safePrintableReport(report));
  assert(!printed.includes('sb_publishable_'));
  assert(!/secret|client_id|client_secret/i.test(printed));
});
