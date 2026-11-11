/* Parse only the Supabase OAuth callback fragment. No persistence. */
export function parse(hash){
 const raw=typeof hash==='string'?hash.replace(/^#/,''):'';
 const p=new URLSearchParams(raw);
 const error=p.get('error');
 if(error)return {ok:false,error,errorDescription:p.get('error_description')||''};
 const accessToken=p.get('access_token')||'';
 const expiresIn=Number(p.get('expires_in'));
 const refreshToken=p.get('refresh_token');
 if(refreshToken!==null&&(refreshToken.length<10||refreshToken.length>12000))return {ok:false,error:'invalid_callback',errorDescription:''};
 if(accessToken.length<20||accessToken.length>12000||!Number.isFinite(expiresIn)||expiresIn<=0||expiresIn>86400){
  return {ok:false,error:'invalid_callback',errorDescription:''};
 }
 return {ok:true,accessToken,expiresIn,...(refreshToken!==null?{refreshToken}:{})};
}
