import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

function rgb(hex){const h=hex.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)}
function lum(hex){const c=rgb(hex).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]}
function contrast(a,b){const x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+0.05)/(lo+0.05)}

test('Civic Teal core color pairs meet WCAG AA for normal text',async()=>{
 const css=await readFile('apps/web/folkoop.css','utf8');
 for(const token of ['--ink:#1F2933','--muted:#667085','--paper:#F7F5F1','--accent:#176B6B','--orange:#A94F36','--focus:#0B6FA4','--danger:#9E3530','--success:#2F6F4E'])assert(css.includes(token),token);
 const pairs=[
  ['#1F2933','#F7F5F1','primary text'],
  ['#667085','#F7F5F1','secondary text'],
  ['#176B6B','#FFFFFF','primary action/link'],
  ['#A94F36','#FFFFFF','warm accent'],
  ['#0B6FA4','#FFFFFF','focus'],
  ['#9E3530','#FFFFFF','danger'],
  ['#2F6F4E','#FFFFFF','success'],
  ['#246B7A','#FFFFFF','need intent'],
  ['#526C73','#FFFFFF','project intent'],
  ['#8B5C2C','#FFFFFF','purchase intent']
 ];
 for(const [fg,bg,label] of pairs)assert(contrast(fg,bg)>=4.5,label+' contrast '+contrast(fg,bg).toFixed(2));
});

test('warm accent stays distinct from destructive action color',async()=>{
 const css=await readFile('apps/web/folkoop.css','utf8');
 assert.match(css,/--warm:#A94F36/);
 assert.match(css,/\.text-button\.danger\{color:#9e3530\}/i);
});
