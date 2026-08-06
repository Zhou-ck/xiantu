/* v49 装备系统冒烟：套装 / 耐久 / 词条 / 宝石 / 迁移 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.stones=9999; S.mats.jade=5; S.flag={};`,ctx);
// T1 套装：2 件/3 件效果
vm.runInContext(`
  S.weapon={name:'精铁剑',type:'weapon',quality:2,bonus:2,setId:'jianxin'};
  S.armor={name:'星纹软甲',type:'armor',quality:3,bonus:4,setId:'jianxin'};
  ensureEquip(S.weapon); ensureEquip(S.armor);
  window.__c2=equipSetCount(S); window.__b2=equipSetBonuses(S);
  S.trinket={name:'寒铁剑佩',type:'trinket',quality:2,bonus:1,setId:'jianxin'};
  ensureEquip(S.trinket);
  window.__b3=equipSetBonuses(S);
`,ctx);
assert(vm.runInContext('window.__c2.jianxin===2&&window.__b2.atk===2&&window.__b2.tech===1',ctx),'套装 2 件激活攻势+2/战意+1');
assert(vm.runInContext('window.__b3.atk===2&&window.__b3.first===0.3',ctx),'套装 3 件激活首击 ×1.3');

// T2 耐久：损耗/归零失效/修理
vm.runInContext(`
  S.weapon.affixes=[{id:'fengrui',name:'锋锐'}];
  window.__atkBefore=weaponAtk(S);
  wearEquip(S,100);
  window.__broken=equipUsable(S.weapon);
  window.__atkAfter=weaponAtk(S);
  window.__cost=equipRepairCost(S.weapon);
  repairEquip('weapon',false);
  window.__dur= S.weapon.durability; window.__stonesAfter=S.stones;
`,ctx);
assert(vm.runInContext('window.__broken===false&&window.__atkAfter<window.__atkBefore',ctx),'耐久归零后词条与基础加成失效');
assert(vm.runInContext('window.__dur===100&&window.__stonesAfter===9999-window.__cost',ctx),'坊市修理回满耐久并扣灵石');

// T3 词条洗练：数量不变、扣灵石与寒玉
vm.runInContext(`
  S.weapon.quality=4;
  S.weapon.affixes=rollAffixes(4);
  window.__n0=S.weapon.affixes.length;
  window.__s0=S.stones; window.__j0=S.mats.jade;
  rerollAffix('weapon');
  window.__n1=S.weapon.affixes.length;
  window.__s1=S.stones; window.__j1=S.mats.jade;
`,ctx);
assert(vm.runInContext('window.__n0===2&&window.__n1===2&&window.__s1===window.__s0-200&&window.__j1===window.__j0-1',ctx),'词条洗练保持条数并扣 200 灵石+1 寒玉');

// T4 宝石：镶嵌/拆卸
vm.runInContext(`
  S.items.push({name:'金灵石',type:'gem',gemId:'g_metal',quality:2,sell:150});
  S.items.push({name:'沧海珠',type:'gem',gemId:'g_pearl',quality:2,sell:200});
  window.__atkBeforeGem=weaponAtk(S);
  socketGem('weapon','g_metal');
  window.__gemIn=S.weapon.gems.indexOf('g_metal')>=0;
  window.__gemBag=S.items.some(x=>x.gemId==='g_metal');
  window.__atkGem=weaponAtk(S);
  socketGem('weapon','g_pearl');
  window.__hpGem=equipHpBonus(S);
  unsocketGem('weapon',1);
  window.__gemBack=S.items.some(x=>x.gemId==='g_pearl');
`,ctx);
assert(vm.runInContext('window.__gemIn&&!window.__gemBag&&window.__atkGem>=window.__atkBeforeGem+1',ctx),'镶嵌宝石入装备并贡献攻势');
assert(vm.runInContext('window.__hpGem>=15&&window.__gemBack',ctx),'沧海珠加气血，拆卸返回行囊');

// T5 旧档装备迁移：ensureEquip 补耐久/词条/宝石字段
vm.runInContext(`
  const old={name:'寒铁剑',type:'weapon',quality:3,bonus:3};
  ensureEquip(old);
  window.__mig=old.durability===100&&old.maxDur===100&&Array.isArray(old.affixes)&&Array.isArray(old.gems);
`,ctx);
assert(vm.runInContext('window.__mig',ctx),'旧装备迁移补齐耐久/词条/宝石字段');

console.log(fails===0?'smoke71: ALL PASS':'smoke71 FAILS: '+fails);
process.exit(fails?1:0);
