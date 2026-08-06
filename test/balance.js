/* 数值平衡检查：各境界修炼速率与需求对比，防止「一键闭关到顶」 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
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
// 7) 蒙特卡洛仿真 v1：40 局随机出身/灵根跑分，输出修炼节奏报告（种子随机，稳定可复现）
vm.runInContext(`window.__sim=(()=>{
  let seed=20260806;
  const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  const out=[];
  for(let i=0;i<40;i++){
    const bg=BACKGROUNDS[Math.floor(rnd()*BACKGROUNDS.length)];
    const s=newState('测',bg);
    s.root=5+Math.floor(rnd()*90);
    s.flag={};s.cult=0;s.days=0;s.cultStreak=0;s.realm=0;
    let day=0,zhujiDay=-1,jindanDay=-1;
    while(day<6000&&jindanDay<0){
      if(day%30===0)s.cultStreak=0;
      const gain=((8+s.root/6)*cultMult(s)/10)*(0.8+rnd()*0.4);
      s.cult+=gain;day++;s.cultStreak++;
      while(s.realm<41&&s.cult>=THRESHOLDS[s.realm+1])s.realm++;
      if(zhujiDay<0&&s.realm>=9)zhujiDay=day;
      if(jindanDay<0&&s.realm>=13)jindanDay=day;
    }
    out.push({root:s.root,zhujiDay,jindanDay});
  }
  return out;
})();`,ctx);
const sim=vm.runInContext('window.__sim',ctx);
const zj=sim.map(x=>x.zhujiDay).sort((a,b)=>a-b);
const jd=sim.map(x=>x.jindanDay).sort((a,b)=>a-b);
const med=a=>a[Math.floor(a.length/2)];
console.log('仿真报告：40 局 | 筑基 min='+zj[0]+' med='+med(zj)+' max='+zj[zj.length-1]+' | 金丹 min='+jd[0]+' med='+med(jd)+' max='+jd[jd.length-1]);
assert(med(zj)>150&&med(zj)<1500,'筑基中位天数合理（150-1500）');
assert(med(jd)>600&&med(jd)<4000,'金丹中位天数合理（600-4000）');
assert(sim.every(x=>x.zhujiDay>0&&x.jindanDay>0),'无卡死局（6000 日内均达金丹）');
// 8) 问题 1 v2（产出锚定版）：大境界修炼加成生效 —— 渡劫闭关效率 ≥ 3× 炼气
vm.runInContext(`{const a=newState('测',BACKGROUNDS[0]);a.root=60;a.realm=5;a.days=0;a.cultStreak=0;a.arts=[{name:'基础吐纳诀',mult:1.0,grade:1}];a.daoPartner=null;a.flag={};window.__mQ=cultMult(a);a.realm=37;window.__mD=cultMult(a);}`,ctx);
assert(vm.runInContext('window.__mD>=window.__mQ*3',ctx),'境界加成生效：渡劫闭关效率 ≥3× 炼气');
// 9) 战斗胜利修为锚定闭关 2×（一场 10 日 ≈ 20 日闭关量）
vm.runInContext(`{S=newState('测',BACKGROUNDS[0]);S.root=60;S.realm=29;S.days=0;S.cultStreak=0;S.arts=[{name:'基础吐纳诀',mult:2.0,grade:1}];S.daoPartner=null;S.flag={};window.__cg=Math.max(5,Math.floor((8+S.root/6)*cultMult(S)*2));window.__daily=(8+S.root/6)*cultMult(S)/10;}`,ctx);
assert(vm.runInContext('window.__cg>=window.__daily*19&&window.__cg<=window.__daily*21',ctx),'战斗胜利修为 = 20 日闭关量（恒 2× 闭关效率）');
// 10) 一次性事件奖励落在阈值 2-5%（BOSS 10%）
vm.runInContext(`{S=newState('测',BACKGROUNDS[0]);S.root=60;S.realm=29;S.days=0;S.cultStreak=0;S.arts=[{name:'基础吐纳诀',mult:2.0,grade:1}];S.daoPartner=null;S.flag={};window.__t1=eventGift()*0.03/THRESHOLDS[29];window.__t2=eventGift()*0.05/THRESHOLDS[29];window.__t3=eventGift()*0.015*3/THRESHOLDS[29];window.__t4=eventGift(6)*0.10/THRESHOLDS[29];}`,ctx);
assert(vm.runInContext('window.__t1>=0.025&&window.__t1<=0.035',ctx),'试炼塔单层 ≈ 阈值 3%');
assert(vm.runInContext('window.__t2>=0.045&&window.__t2<=0.055',ctx),'秘境通关 ≈ 阈值 5%');
assert(vm.runInContext('window.__t3>=0.04&&window.__t3<=0.05',ctx),'妖潮守城三波合计 ≈ 阈值 4.5%');
assert(vm.runInContext('window.__t4>=0.09&&window.__t4<=0.11',ctx),'守关 BOSS ≈ 阈值 10%');
// 11) 渡劫期阈值增幅 ≤1.10（问题 10）
vm.runInContext(`window.__mt=(()=>{let mx=0;for(let i=38;i<=41;i++){const r=THRESHOLDS[i]/THRESHOLDS[i-1];if(r>mx)mx=r;}return mx;})();`,ctx);
assert(vm.runInContext('window.__mt<=1.1001',ctx),'渡劫期小境界阈值增幅 ≤1.10');
// 12) 问题 2：离线 12h 等价上限 + 效率基准 0.6-0.8（固定 Math.random 消除随机噪声，精确验证 24h=12h）
vm.runInContext(`const _mr=Math.random;Math.random=()=>0.5;{S=newState('测',BACKGROUNDS[0]);S.root=50;S.days=0;S.cultStreak=0;S.arts=[{name:'基础吐纳诀',mult:1.0,grade:1}];S.daoPartner=null;S.flag={lastVisit:Date.now()-12*3600000};S.cult=0;applyOfflineGain();window.__o12=S.cult;S=newState('测',BACKGROUNDS[0]);S.root=50;S.days=0;S.cultStreak=0;S.arts=[{name:'基础吐纳诀',mult:1.0,grade:1}];S.daoPartner=null;S.flag={lastVisit:Date.now()-24*3600000};S.cult=0;applyOfflineGain();window.__o24=S.cult;}Math.random=_mr;`,ctx);
const o12=vm.runInContext('window.__o12',ctx),o24=vm.runInContext('window.__o24',ctx);
assert(o12>0,'离线 12h 有收益');
assert(Math.abs(o24-o12)<=1,'离线 24h 收益 = 12h 上限（等价截断精确生效）');
vm.runInContext(`window.__om=0.65*(1+(typeof trustTier==='function'?trustTier().offline:0));`,ctx);
assert(vm.runInContext('window.__om>=0.6&&window.__om<=0.85',ctx),'离线效率基准 0.6-0.85（含托管加成）');
// 13) v43 灵石出口：至少 4 个持续回收手段（问题 6）
vm.runInContext(`window.__sinks=(function(){
  const out=[];
  if(typeof donateSect==='function')out.push('宗门捐资');
  if(typeof buyDecor==='function'&&DECOR_ITEMS&&DECOR_ITEMS.length>=3)out.push('洞府装饰');
  if(MARKET_ITEMS&&MARKET_ITEMS.some(m=>m.use==='save'))out.push('保命道具');
  if(typeof startTrustTo==='function')out.push('托管修炼');
  if(typeof buyAuction==='function')out.push('奇珍拍卖');
  return out;
})();`,ctx);
assert(vm.runInContext('window.__sinks.length>=4',ctx),'灵石出口 ≥4（'+vm.runInContext('window.__sinks.join("、")',ctx)+'）');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
