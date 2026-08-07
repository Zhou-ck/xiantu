/* v56 内容扩充冒烟：事件库 ≥335 / 支线 ≥12 / 修炼场景图完整 / 台账与 SW 覆盖 */
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

// T1 事件库扩充 + 支线扩充
vm.runInContext(`window.__ev=eventTotalCount(); window.__sq=SIDE_QUESTS.length; window.__story=STORY_EVENTS.length;`,ctx);
assert(vm.runInContext('window.__ev>=335',ctx),'事件库 ≥335（当前 '+vm.runInContext('window.__ev',ctx)+'）');
assert(vm.runInContext('window.__sq>=12&&window.__story>=72',ctx),'支线 ≥12 条 · 通用故事事件 ≥72 条');
assert(vm.runInContext('validateAll().length===0',ctx),'新增事件/支线过 schema 校验 0 错误');
// T2 新支线结构合法
assert(vm.runInContext('SIDE_QUESTS.some(q=>q.id==="sq_vine")&&SIDE_QUESTS.some(q=>q.id==="sq_crane")',ctx),'新增支线「幽谷藤桥」「灵鹤衔书」');
// T3 修炼场景图完整
const scenes=['spring','peak','snow','abyss','cave'];
const miss=scenes.filter(s=>!fs.existsSync(path.join(root,'assets','scenes','cult_'+s+'.jpg')));
assert(miss.length===0,'五张修炼场景图存在（缺失：'+miss.join(',')+'）');
// T4 台账登记 + SW 覆盖
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const licScenes=scenes.filter(s=>lic.indexOf('cult_'+s+'.jpg')>=0).length;
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const swScenes=scenes.filter(s=>sw.indexOf('"./assets/scenes/cult_'+s+'.jpg"')>=0).length;
assert(licScenes===5&&swScenes===5,'场景图登记台账并纳入 SW 离线缓存');
// T5 场景选择 UI 带缩略图兜底
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.realm=13; PENDING=0; panelCult(); window.__h=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__h',ctx);
assert(html.indexOf('assets/scenes/cult_spring.jpg')>=0&&html.indexOf('scn-thumb')>=0&&html.indexOf('onerror')>=0,'修炼面板场景选择渲染缩略图 + 兜底');

console.log(fails===0?'smoke81: ALL PASS':'smoke81 FAILS: '+fails);
process.exit(fails?1:0);
