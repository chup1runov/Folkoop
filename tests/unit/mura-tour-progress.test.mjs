import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile('apps/web/folkoop.js','utf8');
function harness(saved){
 const storage={value:saved,getItem(){return this.value;},setItem(key,value){this.value=value;}};
 const context=vm.createContext({storage});
 vm.runInContext(source.slice(source.indexOf('const TOUR_STORIES='),source.indexOf('let tourProgress='))+
 source.slice(source.indexOf('function nextUnopenedStory(){'),source.indexOf('const storyProgressCopy='))+
 source.slice(source.indexOf('function storyPosition(){'),source.indexOf('const tourFinaleCopy=')),context);
 return {storage,run:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context)))};
}
test('all 18 stories are traversed once, replay does not inflate progress',()=>{
 const h=harness();
 for(let i=0;i<18;i++){
  const next=h.run('nextUnopenedStory()');assert(next);
  h.run(`rememberTour(${next.chapter},${JSON.stringify(next.story)});storyPosition().remaining`);
 }
 assert.equal(h.run('nextUnopenedStory()'),null);
 h.run("rememberTour(0,'interests');storyPosition().remaining");
 assert.equal(h.run('tourMap.stories.length'),18);
 assert.equal(h.run('storyPosition().previous'),null);
});
test('next skips visited stories and wraps to gaps after an arbitrary jump',()=>{
 const h=harness();
 h.run("rememberTour(0,'skills');rememberTour(4,'project');tourMap.last");
 assert.deepEqual(h.run('nextUnopenedStory()'),{chapter:0,story:'interests'});
 h.run("rememberTour(0,'interests');tourMap.last");
 assert.deepEqual(h.run('nextUnopenedStory()'),{chapter:0,story:'connections'});
});
test('stored story resumes exactly; chapter pause preserves the opened set',()=>{
 const h=harness();h.run("rememberTour(3,'city-transport');tourMap.last");
 const restored=harness(h.storage.value);
 assert.deepEqual(restored.run('tourMap.last'),{chapter:3,story:'city-transport'});
 assert.deepEqual(restored.run('storyPosition().previous'),{chapter:3,story:'city-services'});
 restored.run('rememberTour(3);tourMap.last');
 assert.equal(restored.run('tourMap.stories.length'),1);
 assert.deepEqual(restored.run('tourMap.last'),{chapter:3,story:null});
});
test('invalid storage and invalid story selections cannot corrupt progress',()=>{
 const h=harness('{broken');
 h.run("rememberTour(-1,'project');rememberTour(4,'unknown');tourMap.last");
 assert.deepEqual(h.run('tourMap'),{chapters:[],stories:[],last:null});
 const restored=harness(JSON.stringify({chapters:[0,0,99],stories:['0:interests','0:interests','9:bad'],last:{chapter:7,story:'bad'}}));
 assert.deepEqual(restored.run('tourMap'),{chapters:[0],stories:['0:interests'],last:null});
});
