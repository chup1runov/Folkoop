import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('apps/web/network-stories.js','utf8');
function setup(lang='ru'){const c={document:{documentElement:{lang}}};vm.runInNewContext(source,c);return c.FolkoopStories;}
test('stories expire at exact bound and withdrawn/future/invalid records are not active',()=>{
 const f=setup(),now=10000,row={id:'a',created_at:new Date(9000).toISOString(),expires_at:new Date(11000).toISOString()};
 assert.equal(f.active([row],now).length,1);
 for(const patch of [{expires_at:new Date(now).toISOString()},{created_at:new Date(now+1).toISOString()},{withdrawn_at:'yes'},{expires_at:'invalid'}])assert.equal(f.active([{...row,...patch}],now).length,0);
});
test('author groups prioritize unseen, preserve each author series and do not use popularity',()=>{
 const f=setup(),rows=[{id:'a',author_id:'A',author_name:'A',created_at:'2026-11-09T12:00:00Z'},{id:'b',author_id:'B',author_name:'B',created_at:'2026-11-09T10:00:00Z'},{id:'c',author_id:'B',author_name:'B',created_at:'2026-11-09T09:00:00Z'}];
 const groups=f.groups(rows,{a:100});assert.equal(groups[0].id,'B');assert.equal(groups[0].items.length,2);assert.equal(groups[1].unseen,false);assert.equal(rows.length,3);
});
test('story copy covers eleven locales and all action labels',()=>{
 const f=setup();assert.equal(Object.keys(f.copy).length,11);
 for(const lang of Object.keys(f.copy)){const values=f.copy[lang].split('|');assert.equal(values.length,43,lang);assert.ok(values.every(x=>x.trim()),lang);}
});
