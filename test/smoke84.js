/* v59 主线推进冒烟：四/六/七章新剧情步 / 新场景图 / 社交事件 / 事件 ≥373 */
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

// T1 四/六/七章新剧情步
vm.runInContext(`window.__s={m4:MAIN_STORY.find(c=>c.id==='ch4').steps.some(s=>s.id==='m4s5'),m6:MAIN_STORY.find(c=>c.id==='ch6').steps.some(s=>s.id==='m6s5'),m7:MAIN_STORY.find(c=>c.id==='ch7').steps.some(s=>s.id==='m7s4')};`,ctx);
assert(vm.runInContext('window.__s.m4&&window.__s.m6&&window.__s.m7',ctx),'新增「山门夜哨」「封魔印成」「星图刻痕」剧情步');
assert(vm.runInContext('validateAll().length===0',ctx),'主线/事件扩充过 schema 校验 0 错误');
// T2 新场景图 + 映射 + 台账 + SW
for(const s of ['sectnight','seal']){
  assert(fs.existsSync(path.join(root,'assets','scenes',s+'.jpg')),'场景图 '+s+'.jpg 存在');
}
const uiJs=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(uiJs.indexOf('sectnight.jpg')>=0&&uiJs.indexOf('seal.jpg')>=0,'SCENE_IMG 已接入山门夜哨/封魔印成');
assert(lic.indexOf('sectnight.jpg')>=0&&lic.indexOf('seal.jpg')>=0,'LICENSES 已登记两张新场景图');
assert(sw.indexOf('"./assets/scenes/sectnight.jpg"')>=0&&sw.indexOf('"./assets/scenes/seal.jpg"')>=0,'SW 离线缓存包含两张新场景图');
// T3 事件 ≥373 且社交事件 +4
vm.runInContext(`window.__ev=eventTotalCount(); window.__social=DATA.events.filter(e=>String(e.id).indexOf('v59')>=0).length;`,ctx);
assert(vm.runInContext('window.__ev>=373&&window.__social===4',ctx),'事件库 ≥373（当前 '+vm.runInContext('window.__ev',ctx)+'）· 社交事件 +4');

console.log(fails===0?'smoke84: ALL PASS':'smoke84 FAILS: '+fails);
process.exit(fails?1:0);
