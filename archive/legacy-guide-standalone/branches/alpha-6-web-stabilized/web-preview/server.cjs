'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const types = {
  '.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.webp':'image/webp','.gif':'image/gif','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'
};
function safeJoin(base, rel){
  const p=path.resolve(base, rel);
  return p.startsWith(path.resolve(base)+path.sep) || p===path.resolve(base) ? p : null;
}
function serve(res,file){
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
    res.writeHead(200,{
      'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream',
      'Cache-Control':file.includes(path.sep+'assets'+path.sep)?'public, max-age=3600':'no-cache',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    });
    fs.createReadStream(file).pipe(res);
  });
}
http.createServer((req,res)=>{
  let u;
  try{u=new URL(req.url,'http://localhost');}catch{res.writeHead(400);return res.end('Bad request');}
  if(u.pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok');}
  if(u.pathname==='/'||u.pathname==='/index.html') return serve(res,path.join(__dirname,'index.html'));
  if(u.pathname==='/style.css') return serve(res,path.join(__dirname,'style.css'));
  if(u.pathname==='/app.js') return serve(res,path.join(__dirname,'app.js'));
  if(u.pathname==='/assets.js') return serve(res,path.join(__dirname,'assets.js'));
  if(u.pathname==='/model.js') return serve(res,path.join(__dirname,'model.js'));
  if(u.pathname.startsWith('/web-preview/')){
    const f=safeJoin(__dirname,u.pathname.slice('/web-preview/'.length)); return f?serve(res,f):(res.writeHead(403),res.end('Forbidden'));
  }
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');
}).listen(port,'0.0.0.0',()=>console.log('Mura web preview listening on',port));
