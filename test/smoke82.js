/* v57 主线深化冒烟：末期新剧情步 / 新场景图 / 事件再扩充 / schema */
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

// T1 主线末期新剧情步存在且 schema 合法
vm.runInContext(`window.__m9=MAIN_STORY.find(c=>c.id==='ch9').steps.some(s=>s.id==='m9s4'); window.__m10=MAIN_STORY.find(c=>c.id==='ch10').steps.some(s=>s.id==='m10s4');`,ctx);
assert(vm.runInContext('window.__m9&&window.__m10',ctx),'主线新增「三生石前」「人间相送」剧情步');
assert(vm.runInContext('validateAll().length===0',ctx),'主线/事件扩充过 schema 校验 0 错误');
// T2 新场景图存在 + 场景映射接入 + 台账 + SW
for(const s of ['tianwen','tianmen']){
  assert(fs.existsSync(path.join(root,'assets','scenes',s+'.jpg')),'场景图 '+s+'.jpg 存在');
}
const uiJs=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(uiJs.indexOf('tianwen.jpg')>=0&&uiJs.indexOf('tianmen.jpg')>=0,'SCENE_IMG 已接入三生石/人间相送映射');
assert(lic.indexOf('tianwen.jpg')>=0&&lic.indexOf('tianmen.jpg')>=0,'LICENSES 已登记两张新场景图');
assert(sw.indexOf('"./assets/scenes/tianwen.jpg"')>=0&&sw.indexOf('"./assets/scenes/tianmen.jpg"')>=0,'SW 离线缓存包含两张新场景图');
// T3 事件再扩充
vm.runInContext(`window.__ev=eventTotalCount(); window.__story=STORY_EVENTS.length;`,ctx);
assert(vm.runInContext('window.__ev>=349&&window.__story>=82',ctx),'事件库 ≥349（当前 '+vm.runInContext('window.__ev',ctx)+'）· 故事事件 ≥82 条');
// T4 剧情步可在日志中渲染（含标题）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0; S.quest={main:{ch:9,step:3,done:[],chDone:['ch0'],log:[]}}; panelQuests(); window.__h=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__h',ctx);
assert(html.indexOf('三生石前')>=0||html.indexOf('天门钥匙')>=0,'主线程第 9 章后续步骤可渲染');

console.log(fails===0?'smoke82: ALL PASS':'smoke82 FAILS: '+fails);
process.exit(fails?1:0);
