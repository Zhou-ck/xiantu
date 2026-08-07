/* v58 中期主线冒烟：三/五章新剧情步 / 新场景图 / 天衍遗策支线 / 事件 ≥359 */
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

// T1 中期末期新剧情步 + 天衍遗策支线
vm.runInContext(`window.__m3=MAIN_STORY.find(c=>c.id==='ch3').steps.some(s=>s.id==='m3s5'); window.__m5=MAIN_STORY.find(c=>c.id==='ch5').steps.some(s=>s.id==='m5s4'); window.__sq=SIDE_QUESTS.some(q=>q.id==='sq_tianjue');`,ctx);
assert(vm.runInContext('window.__m3&&window.__m5&&window.__sq',ctx),'新增「剑冢回响」「战魂誓约」剧情步与「天衍遗策」支线');
assert(vm.runInContext('validateAll().length===0',ctx),'主线/支线/事件扩充过 schema 校验 0 错误');
// T2 新场景图 + 映射 + 台账 + SW
for(const s of ['swordtomb','warcry']){
  assert(fs.existsSync(path.join(root,'assets','scenes',s+'.jpg')),'场景图 '+s+'.jpg 存在');
}
const uiJs=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(uiJs.indexOf('swordtomb.jpg')>=0&&uiJs.indexOf('warcry.jpg')>=0,'SCENE_IMG 已接入剑冢回响/战魂誓约');
assert(lic.indexOf('swordtomb.jpg')>=0&&lic.indexOf('warcry.jpg')>=0,'LICENSES 已登记两张新场景图');
assert(sw.indexOf('"./assets/scenes/swordtomb.jpg"')>=0&&sw.indexOf('"./assets/scenes/warcry.jpg"')>=0,'SW 离线缓存包含两张新场景图');
// T3 事件 ≥359 且故事事件 ≥92
vm.runInContext(`window.__ev=eventTotalCount(); window.__story=STORY_EVENTS.length;`,ctx);
assert(vm.runInContext('window.__ev>=359&&window.__story>=92',ctx),'事件库 ≥359（当前 '+vm.runInContext('window.__ev',ctx)+'）· 故事事件 ≥92 条');
// T4 天衍遗策支线可在日志列出
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={regions:{ruin:3}}; S.quest={main:{ch:0,step:0,done:[],chDone:[],log:[]},side:{},sideStep:{},sideDone:{}}; PENDING=0; questTick('visit','ruin'); panelQuests(); window.__h=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__h',ctx);
assert(html.indexOf('天衍遗策')>=0,'支线「天衍遗策」满足条件后在任务日志显示');

console.log(fails===0?'smoke83: ALL PASS':'smoke83 FAILS: '+fails);
process.exit(fails?1:0);
