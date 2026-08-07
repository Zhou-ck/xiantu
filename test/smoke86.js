/* v60 第八章铺垫与宗门/道侣事件冒烟（内容向，与并行闪黄修复会话互补） */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 第八章新铺垫步
vm.runInContext(`window.__s={m8a:MAIN_STORY.find(c=>c.id==='ch8').steps.some(s=>s.id==='m8s3'),m8b:MAIN_STORY.find(c=>c.id==='ch8').steps.some(s=>s.id==='m8s5')};`,ctx);
assert(vm.runInContext('window.__s.m8a&&window.__s.m8b',ctx),'第八章新增「无面战魂」「天机棋局」铺垫步');
assert(vm.runInContext('validateAll().length===0',ctx),'主线/事件扩充过 schema 校验 0 错误');
// T2 宗门/道侣向事件
vm.runInContext(`window.__st=STORY_EVENTS.filter(e=>String(e.id).indexOf('v60')>=0).length; window.__soc=DATA.events.filter(e=>String(e.id).indexOf('v60')>=0).length;`,ctx);
assert(vm.runInContext('window.__st===8&&window.__soc===4',ctx),'宗门/道侣向故事事件 +8 · 社交事件 +4');
// T3 场景图 + 映射 + 台账
for(const s of ['faceless','chess']){
  assert(fs.existsSync(path.join(root,'assets','scenes',s+'.jpg')),'场景图 '+s+'.jpg 存在');
}
const uiJs=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
assert(uiJs.indexOf('faceless.jpg')>=0&&uiJs.indexOf('chess.jpg')>=0,'SCENE_IMG 已接入无面战魂/天机棋局');
assert(lic.indexOf('faceless.jpg')>=0&&lic.indexOf('chess.jpg')>=0,'LICENSES 已登记两张新场景图');
// T4 事件总量
vm.runInContext(`window.__ev=eventTotalCount();`,ctx);
assert(vm.runInContext('window.__ev>=381',ctx),'事件库 ≥381（当前 '+vm.runInContext('window.__ev',ctx)+'）');

console.log(fails===0?'smoke86: ALL PASS':'smoke86 FAILS: '+fails);
process.exit(fails?1:0);
