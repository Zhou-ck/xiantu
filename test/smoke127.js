/* v97 修炼页功能式 4 Tab 冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; S.root=50; S.days=0; PENDING=0;`,ctx);

// T1 四个子页函数存在
for(const f of ['_cultHtmlCult','_cultHtmlBreak','_cultHtmlMind','_cultHtmlStats']){
  assert(vm.runInContext('typeof '+f,ctx)==='function',f+' 存在');
}

// T2 默认页（闭关）：横幅/基准收益/静修苦修/场景选择/保命符
vm.runInContext(`panelCult(); window.__h=document.getElementById('panelBody')._html;`,ctx);
const h=vm.runInContext('window.__h',ctx);
assert(h.indexOf('cult-banner')>=0&&h.indexOf('assets/scenes/cult.jpg')>=0,'闭关页含横幅');
assert(h.indexOf('基准收益')>=0&&h.indexOf('静修（稳妥）')>=0&&h.indexOf('苦修（凶险')>=0,'闭关页含基准收益+静修+苦修');
assert(h.indexOf('scn-thumb')>=0,'闭关页含场景选择缩略图');
assert(h.indexOf('sub-tabs')>=0,'面板含 4 Tab 导航');

// T3 破境页：瓶颈/突破筹备/破障
vm.runInContext(`S.cult=999999; S.realm=8; S.attrs.wil=5; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; panelCult('break'); window.__b=document.getElementById('panelBody')._html;`,ctx);
const b=vm.runInContext('window.__b',ctx);
assert(b.indexOf('瓶颈')>=0||b.indexOf('突破筹备')>=0,'破境页含瓶颈/筹备');

// T4 养心页：心魔/静心/心境调控
vm.runInContext(`S.realm=9; S.mood=40; S.items.push({name:'安神香',type:'consumable',quality:1,use:'mood'}); panelCult('mind'); window.__m=document.getElementById('panelBody')._html;`,ctx);
const m=vm.runInContext('window.__m',ctx);
assert(m.indexOf('判定大失败可致死')>=0,'养心页含心魔历练按钮');
assert(m.indexOf('静心养神')>=0,'养心页含静心养神');
assert(m.indexOf('心境调控')>=0&&m.indexOf('焚安神香')>=0,'养心页含心境调控卡');

// T5 盘点页：真元淬体/功法相生/统计
vm.runInContext(`panelCult('stats'); window.__s=document.getElementById('panelBody')._html;`,ctx);
const st=vm.runInContext('window.__s',ctx);
assert(st.indexOf('真元淬体')>=0,'盘点页含真元淬体');
assert(st.indexOf('功法相生')>=0,'盘点页含功法相生');
assert(st.indexOf('闭关与双修统计')>=0,'盘点页含统计');

// T6 切页后默认页仍可回（状态保持）
vm.runInContext(`panelCult('cult'); window.__c2=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__c2',ctx).indexOf('静修（稳妥）')>=0,'切回闭关页正常');

console.log(fails===0?'smoke127: ALL PASS':'smoke127 FAILS: '+fails);
process.exit(fails?1:0);
