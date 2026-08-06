/* v42 区域记忆冒烟：
   · 新增灵溪幽谷 / 古战场遗迹区域且门槛正确
   · 每个区域 ≥2 条重访事件、权重可用
   · 效果执行器（灵石/功德/材料/物品/一次性）正确
   · 新区域首访世界观补白存在 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
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
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 新区域：灵溪幽谷（炼气二层）、古战场遗迹（合体期）
vm.runInContext(`window.__rids=REGIONS.map(r=>r.id); window.__valley=REGIONS.find(r=>r.id==='valley'); window.__ruin=REGIONS.find(r=>r.id==='ruin');`,ctx);
assert(vm.runInContext('window.__rids.indexOf("valley")>=0&&window.__rids.indexOf("ruin")>=0',ctx),'REGIONS 含灵溪幽谷与古战场遗迹');
assert(vm.runInContext('window.__valley.minRealm===1&&window.__ruin.minRealm===25',ctx),'新区域境界门槛正确（1 / 25）');

// T2 每区域 ≥2 条重访事件
const cover=vm.runInContext('regionEventCoverage()',ctx);
const bad=Object.keys(cover).filter(k=>cover[k]<2);
assert(!bad.length,'每个区域至少 2 条区域记忆事件（'+JSON.stringify(cover)+'）');

// T3 加权随机可抽到池内事件
vm.runInContext(`window.__pool=REGION_EVENTS.filter(e=>e.region==='near'); window.__picked=weightedPick(window.__pool);`,ctx);
assert(vm.runInContext('window.__picked&&window.__pool.indexOf(window.__picked)>=0',ctx),'weightedPick 返回池内事件');

// T4 效果执行器：灵石/功德/材料/物品/一次性
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={};
  const before={stones:S.stones,merit:S.merit,herb:S.mats.herb||0};
  const a1=applyEventEffects({stones:60,merit:2,mat:{herb:2}});
  const a2=applyEventEffects({item:{name:'千年灵乳',type:'consumable',quality:3,count:1,desc:'x',use:'essence',sell:600}});
  window.__o1=[a1,a2,before];
  window.__d={s:S.stones-before.stones,m:S.merit-before.merit,h:(S.mats.herb||0)-before.herb}; window.__hasItem=S.items.some(i=>i.name==='千年灵乳');
`,ctx);
assert(vm.runInContext('window.__d.s===60&&window.__d.m===2&&window.__d.h===2',ctx),'效果执行器正确发放灵石/功德/材料');
assert(vm.runInContext('window.__hasItem',ctx),'效果执行器正确发放物品');

// T5 once 一次性：第二次不重复发放
vm.runInContext(`
  S.flag.regionOnce={};
  const f={insight:1,once:'once_test'};
  const first=applyEventEffects(f);
  const second=applyEventEffects(_onceFx(f));
  window.__once=[first,second,S.flag.insights];`,ctx);
const once=vm.runInContext('window.__once',ctx);
assert(once[0].indexOf('悟道 +1')>=0&&once[1].indexOf('悟道 +1')<0&&once[2]===1,'once 一次性奖励只发一次');

// T6 新区域首访补白存在
assert(vm.runInContext('typeof REGION_LORE.valley==="string"&&typeof REGION_LORE.ruin==="string"&&REGION_LORE.valley.length>0',ctx),'灵溪幽谷/古战场遗迹首访补白存在');

// T7 行迹图鉴接入故地回响区块
vm.runInContext(`S.flag.regionEvents={rv_near_1:2}; S.flag.exploreLog=[]; S.flag.encTypes={}; S.flag.regions={}; S.flag.exploreCount=3; S.flag.exploreMiles=[]; window.__mem=regionMemoryHtml();`,ctx);
assert(vm.runInContext('window.__mem.indexOf("故地回响")>=0&&window.__mem.indexOf("破庙香火")>=0',ctx),'行迹图鉴展示故地回响记录');

console.log(fails===0?'smoke55: ALL PASS':'smoke55 FAILS: '+fails);
process.exit(fails?1:0);
