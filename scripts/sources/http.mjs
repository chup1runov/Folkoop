/* Bounded fetch INCLUDING the body. Only transient failures are retried. */
export async function fetchBounded(url,options={},attempts=3){
  let last;
  for(let attempt=0;attempt<attempts;attempt++){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(url,{...options,signal:controller.signal});
      const body=await response.arrayBuffer();
      if(response.status===429||response.status>=500)throw new Error(`TRANSIENT_HTTP_${response.status}`);
      const copy=new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
      Object.defineProperty(copy,'url',{value:response.url});
      return copy;
    }catch(error){last=error;}finally{clearTimeout(timer);}
    if(attempt+1<attempts)await new Promise(resolve=>setTimeout(resolve,750*(attempt+1)));
  }
  throw last;
}
