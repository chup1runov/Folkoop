import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const ui=await readFile('apps/web/network-ui.js','utf8');
const focus=await readFile('apps/web/network-form-focus.js','utf8');
const browser=await readFile('tests/e2e/meeting-browser.py','utf8');

test('a shared render can only ADD a busy restriction, never clear a domain-disabled button',()=>{
 assert.match(ui,/if\(!guestDemo&&busy\)host\.querySelectorAll\('button'\)\.forEach\(b=>\{b\.disabled=true;\}\)/);
 assert.doesNotMatch(ui,/b\.disabled=busy/);
 assert.match(browser,/to_be_disabled\(\)/);
 assert.match(browser,/to_be_enabled\(\)/);
});
test('meeting disclosure state belongs only to the same user, route and cooperation',()=>{
 assert.match(ui,/const meetingScope=\(!guestDemo&&selectedCoop&&u\)\?r\+':'\+u\.id\+':'\+selectedCoop:''/);
 assert.match(ui,/host\.dataset\.meetingScope===meetingScope/);
 assert.match(ui,/for\(const id of \['netMeetingTerms','netMeetingRepeat'\]\)/);
 assert.match(browser,/await expect\(repeat\)\.to_be_visible\(\)/);
});
test('meeting form focus recovery respects the object and navigation boundary',()=>{
 for(const id of ['netCoopCreate','netMeetingTerms','netMeetingRepeat','netMeetingOutcome']){
  assert(focus.includes("'"+id+"'"),id);
 }
 assert.match(focus,/saved\.hash!==location\.hash/);
 assert.match(focus,/host\.dataset\.meetingScope\|\|''\)!==saved\.meetingScope/);
 assert.match(browser,/to_be_focused\(\)/);
 assert.doesNotMatch(focus,/localStorage|sessionStorage/);
});
