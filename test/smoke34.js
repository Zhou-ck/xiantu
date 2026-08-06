/* 内容深化 Phase 2j 冒烟：秘境册 + 新事件链（灵泉/故人）推进与回响 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){
  const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,
    classList:{add(){},remove(){},toggle(){}},
    set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},
    set textContent(v){this._txt=String(v)},get textContent(){return this._txt},
    appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},
    querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};
  return el;
}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 秘境册记录 + 图鉴展示
vm.runInContext(`
  S=newState('测试子',BACKGROUNDS[0]);
  S.flag.dungeons=3; S.flag.dungeonDone={};
  recordDungeonDone('cave'); recordDungeonDone('sword');
  exploreTome();
`,ctx);
assert(vm.runInContext('S.flag.dungeonDone.cave',ctx)===true&&vm.runInContext('S.flag.dungeonDone.sword',ctx)===true,'秘境册按类型记录');
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('2/6 类')>=0,'图鉴显示秘境完成进度');
// ---- T2 灵泉链 · 自饮淬体 → 泉灵回响
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[];
  S.root=50;
  chainStart('lingquan');
`,ctx);
assert(vm.runInContext('S.flag.chain.lingquan',ctx)===1,'灵泉链埋设');
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===3,'灵泉三选项');
vm.runInContext(`
  const r0=S.root; window._eventModalOpts[1].fn();
  window.__r=S.root-r0; window.__ch=S.flag.chain.lingquan;
`,ctx);
assert(vm.runInContext('window.__r',ctx)===2,'自饮灵根 +2');
assert(vm.runInContext('window.__ch',ctx)===3,'灵泉链推进');
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'泉灵回响两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.flag.chain.lingquan',ctx)===-1,'灵泉链收束');
// ---- T3 故人链 · 解囊 → 三倍奉还回响
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[]; S.stones=1000;
  chainStart('guren');
`,ctx);
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===3,'故人三选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.stones',ctx)===700,'解囊 300 灵石');
assert(vm.runInContext('S.flag.chain.guren',ctx)===3,'故人链推进');
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'故人回响两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.stones',ctx)===1600,'三倍奉还（+900）');
assert(vm.runInContext('S.flag.chain.guren',ctx)===-1,'故人链收束');
// ---- T4 灵泉链 · 济村 → 乡里回响
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[]; S.merit=0; S.fame={zheng:0,mo:0,san:0};
  chainStart('lingquan');
`,ctx);
vm.runInContext('PENDING=0; chainTick();',ctx);
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.merit',ctx)===8,'济村功德 +8');
vm.runInContext('PENDING=0; chainTick();',ctx);
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.merit',ctx)===13,'乡里回响功德 +5');
assert(vm.runInContext('S.fame.zheng',ctx)===18,'乡里回响声望 +5（两段功德联动共 +18）');

console.log(fails===0?'smoke34: ALL PASS':'smoke34 FAILS: '+fails);
process.exit(fails?1:0);
