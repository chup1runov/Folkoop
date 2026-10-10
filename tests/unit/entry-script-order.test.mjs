import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('apps/web/folkoop.html','utf8');
const tags=[...html.matchAll(/<script\b([^>]*\bsrc="\.\/([^"]+)"[^>]*)>/g)];
const scripts=tags.map(match=>match[2]);
function before(provider,consumer){
 assert.equal(scripts.filter(path=>path===provider).length,1,provider+' must load once');
 assert.equal(scripts.filter(path=>path===consumer).length,1,consumer+' must load once');
 assert(scripts.indexOf(provider)<scripts.indexOf(consumer),provider+' must execute before '+consumer);
}
test('entry shell starts after its copy provider and guest-event listeners',()=>{
 for(const provider of ['folkoop-core.js','folkoop-copy.js','first-contact-preview.js','network-ui.js'])before(provider,'folkoop.js');
 before('network-client.js','network-ui.js');
 before('network-mura-home.js','network-ui.js');
 before('mura-presentation.js','network-ui.js');
 before('folkoop.js','home-welcome.js');
});
test('entry dependencies remain ordered defer scripts, never async or duplicated',()=>{
 assert.equal(new Set(scripts).size,scripts.length);
 for(const match of tags){assert.match(match[1],/\bdefer\b/);assert.doesNotMatch(match[1],/\basync\b/);}
 assert.match(html,/script-src 'self'/);
 assert.doesNotMatch(html,/unsafe-eval/);
});
