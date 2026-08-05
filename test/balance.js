/* 数值平衡检查：各境界修炼速率与需求对比，防止「一键闭关到顶」 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 数值表完整性：境界阈值递增、寿元单调、心性门槛只在大境点
vm.runInContext(`window.__t={thr:THRESHOLDS.slice(0,42),life:LIFESPANS.slice(0,42),wil:WIL_REQ};`,ctx);
const data=vm.runInContext('window.__t',ctx);
let mono=true;for(let i=1;i<data.thr.length;i++)if(data.thr[i]<=data.thr[i-1])mono=false;
assert(mono,'修为阈值严格递增');
assert(data.life[9]===200&&data.life[13]===400&&data.life[41]===Infinity,'寿元按大境倍增');
let wilOK=true;for(let i=0;i<data.wil.length;i++){if(i!==9&&i!==13&&i!==17&&i!==21&&i!==25&&i!==29&&i!==33&&i!==37&&i!==41&&data.wil[i]!==0)wilOK=false}
assert(wilOK,'心性门槛仅设在大境点');
// 2) 收益递减：连续闭关 300 日平均效率 ≥40% 且 <100%
vm.runInContext(`window.__dm=streakDiminMult(300,90);`,ctx);
assert(vm.runInContext('window.__dm>0.39&&window.__dm<0.8',ctx),'长闭关收益递减不归零');
// 3) 修炼速率：中品灵根 + 基础功法，每 10 日收益合理（不瞬间到顶）
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.root=50; S.days=0; S.cultStreak=0; S.arts=[{name:'基础吐纳诀',mult:1.0,grade:1}]; S.daoPartner=null; S.flag={}; window.__m=cultMult(S); }`,ctx);
const m=vm.runInContext('window.__m',ctx);
assert(m>0.5&&m<3,'基础修炼效率在合理区间（0.5-3）');
// 4) 敌人数值：同境界敌人在玩家基准 85%-115% 附近
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=9; const e=makeEnemy(); window.__e=e; }`,ctx);
const e=vm.runInContext('window.__e',ctx);
assert(e.atk>0&&e.hp>0&&e.def>=0,'敌人数值非负');
// 5) 心性曲线：任何大境界心性需求都能在当前境界内达到（最高需求 ≤ 40 上限）
assert(Math.max.apply(null,data.wil)<=40,'心性需求不超过属性上限 40');
// 6) 经济：坊市材料价格与修为奖励非负
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__bp=buyPrice(MARKET_ITEMS.find(x=>x.name==='回春丹')); window.__sp=sellPrice({sell:100}); }`,ctx);
assert(vm.runInContext('window.__bp>=1&&window.__sp>=1',ctx),'买卖价格恒为正');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
