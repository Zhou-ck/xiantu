/* v92 批次 + 版本同步冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

['b01','b02','b03'].forEach(function(p){
  const errs=vm.runInContext('contentByBatch("'+p+'")',ctx);
  assert(Array.isArray(errs)&&errs.length===0,'批次 '+p+' 0 错误'+(errs.length?(' → '+errs.join(' | ')):""));
});

const counts=vm.runInContext(`({
  b01: DATA.events.filter(e=>String(e.id||'').indexOf('b01_')===0).length,
  b02: STORY_EVENTS.filter(e=>String(e.id||'').indexOf('b02_')===0).length,
  b03m: MEDITATION_EVENTS.filter(e=>String(e.id||'').indexOf('b03_')===0).length,
  b03r: REGION_EVENTS.filter(e=>String(e.id||'').indexOf('b03_')===0).length,
  b03t: TITLES.filter(e=>String(e.id||'').indexOf('b03_')===0).length
})`,ctx);
assert(counts.b01===30,'B01 社交 30 条（'+counts.b01+'）');
assert(counts.b02===24,'B02 故事 24 条（'+counts.b02+'）');
assert(counts.b03m===6,'B03 顿悟 6 条（'+counts.b03m+'）');
assert(counts.b03r===4,'B03 区域 4 条（'+counts.b03r+'）');
assert(counts.b03t===6,'B03 称号 6 条（'+counts.b03t+'）');

assert(vm.runInContext('GAME_VERSION==="92"',ctx),'GAME_VERSION===92');

const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('js/core/content-audit.js?v=92'),'index 含 content-audit?v=92');
assert(html.includes('js/data/batches/b01-social.js?v=92'),'index 含 b01');
assert(html.includes('js/data/batches/b02-story.js?v=92'),'index 含 b02');
assert(html.includes('js/data/batches/b03-cult.js?v=92'),'index 含 b03');
assert(!html.includes('?v=91'),'index 无残留 v=91');

const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(sw.includes("xiantu2-v92"),'sw CACHE v92');
assert(sw.includes('content-audit.js'),'sw ASSETS 含 content-audit');
assert(sw.includes('b01-social.js')&&sw.includes('b02-story.js')&&sw.includes('b03-cult.js'),'sw ASSETS 含三批次');

assert(js.includes('CONTENT_CATALOG')&&js.includes('b01_visit_01')&&js.includes('b02_calm_1')&&js.includes('b03_med_1'),'build 产物含目录与批次内容');

const pipe=vm.runInContext(`(function(){
  var r=aiReviewImport({id:'ai_pipe_test_1',n:'管线测',type:'chat',t:'测',opts:[{txt:'好'}]},'social');
  return r.ok===true && r.pool==='social';
})()`,ctx);
assert(pipe,'aiReviewImport 走 contentImport');

console.log(fails===0?'smoke119: ALL PASS':'smoke119 FAILS: '+fails);
process.exit(fails?1:0);
