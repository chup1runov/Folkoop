import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeOAuthCallback} from '../../apps/web/auth-callback.mjs';

function execute(hash,{opener=true,closed=false}={}){
  const status={textContent:''};
  const messages=[];
  const replaced=[];
  let didClose=false;
  const openerObject=opener?{
    closed,
    postMessage(payload,targetOrigin){messages.push({payload,targetOrigin});}
  }:null;
  const windowObject={
    opener:openerObject,
    close(){didClose=true;}
  };
  const document={
    documentElement:{lang:'',dir:''},
    title:'',
    getElementById(id){assert.equal(id,'oauthStatus');return status;}
  };
  const env={
    document,
    localStorage:{getItem(){return null;}},
    navigator:{language:'en-US'},
    location:{
      hash,
      pathname:'/Folkoop/auth-callback.html',
      origin:'https://example.test'
    },
    history:{replaceState(...args){replaced.push(args);}},
    window:windowObject,
    setTimeout(fn){fn();}
  };
  completeOAuthCallback(env);
  return {status:status.textContent,messages,replaced,didClose};
}

test('OAuth callback clears fragment and posts valid token only to same-origin opener',()=>{
  const token='a'.repeat(32);
  const r=execute('#access_token='+token+'&expires_in=3600&refresh_token=must-not-forward');
  assert.equal(r.replaced.length,1);
  assert.equal(r.replaced[0][2],'/Folkoop/auth-callback.html');
  assert.equal(r.messages.length,1);
  assert.equal(r.messages[0].targetOrigin,'https://example.test');
  assert.deepEqual(
    r.messages[0].payload,
    {type:'folkoop-oauth',ok:true,accessToken:token,expiresIn:3600}
  );
  assert(!JSON.stringify(r.messages[0].payload).includes('refresh_token'));
  assert.equal(r.didClose,true);
});

test('OAuth callback forwards provider failure without token material',()=>{
  const r=execute('#error=access_denied&error_description=cancelled');
  assert.equal(r.messages.length,1);
  assert.deepEqual(
    r.messages[0].payload,
    {type:'folkoop-oauth',ok:false,error:'access_denied',errorDescription:'cancelled'}
  );
  assert(!('accessToken' in r.messages[0].payload));
  assert.equal(r.didClose,true);
});

test('OAuth callback refuses to deliver credentials without a live opener',()=>{
  for(const options of [{opener:false},{opener:true,closed:true}]){
    const r=execute('#access_token='+('b'.repeat(32))+'&expires_in=3600',options);
    assert.equal(r.messages.length,0);
    assert.match(r.status,/Return to the FOLKOOP tab/);
    assert.equal(r.didClose,false);
  }
});

test('OAuth callback never upgrades malformed fragment to success',()=>{
  const r=execute('#access_token=short&expires_in=3600');
  assert.equal(r.messages.length,1);
  assert.equal(r.messages[0].payload.ok,false);
  assert.equal(r.messages[0].payload.error,'invalid_callback');
  assert(!('accessToken' in r.messages[0].payload));
});
