/* v55 修行深化冒烟 3：破障三选 / 游历修行 / 心得转化 / 丹火入道 */
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

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:30,agi:30,int:30,cha:20,wil:40}; S.root=70; S.realm=9; S.flag={}; S.flag.npcVisitCd=100; S.flag.teaCd=100; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.stones=500; S.mats={}; S.wis=0;`,ctx);
// T1 破障三选·悟道碑：高心性必得悟性
vm.runInContext(`PENDING=0; bottleneckStele(); window.__wis=S.wis;`,ctx);
assert(vm.runInContext('window.__wis>=1',ctx),'悟道碑破障：心性判定成功悟性 +1');
// T2 破障三选·实战：进入连战（战斗选择锁定）
vm.runInContext(`PENDING=0; bottleneckBattle(); window.__p=PENDING;`,ctx);
assert(vm.runInContext('window.__p===1',ctx),'实战破障：连战开启');
// T3 游历修行：择路弹窗 → 结算修为/道基/冷却
vm.runInContext(`PENDING=0; wanderCultivate(); window.__o=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__o===3',ctx),'云游悟道：三条路径可选');
vm.runInContext(`const c0=S.cult,d0=S.flag.daoBase||0; resolveEventModal(0); window.__g=S.cult-c0; window.__d=(S.flag.daoBase||0)-d0; window.__cd=S.flag.wanderCd;`,ctx);
assert(vm.runInContext('window.__g>0&&window.__d>=1&&window.__cd>=10',ctx),'游历修行结算：修为+道基+1 · 冷却生效');
// T4 心得转化（以战悟道）：扣战意、闭关自动完成
vm.runInContext(`PENDING=0; _cult=null; S.flag.tech={pts:2,ups:{}}; S.flag.cultMethod='war'; doCultivate(30,'quiet'); window.__pts=S.flag.tech.pts; window.__m=S.flag.cultMethod; window.__pending=PENDING;`,ctx);
assert(vm.runInContext('window.__pts===0&&window.__m==="war"&&window.__pending===0',ctx),'以战悟道：消耗战意 2 并完成闭关');
// T5 丹火入道：炼丹成功概率触发修为回流
vm.runInContext(`PENDING=0; _cult=null; S.prof='alchemy'; S.profLevel=5; S.profExp=0; S.flag={npcVisitCd:100,teaCd:100,cultMethod:'qi',cultScene:'cave',daoBase:0,impurity:0,craftLog:{}}; const m=Math.random; Math.random=()=>0.01; const c1=S.cult; craftResolve({name:'回春丹',dc:1,q:1,need:{herb:1},eff:'heal'},0,10); Math.random=m; window.__g2=S.cult-c1;`,ctx);
assert(vm.runInContext('window.__g2>0',ctx),'丹火入道：炼丹成功引修为回流');

console.log(fails===0?'smoke80: ALL PASS':'smoke80 FAILS: '+fails);
process.exit(fails?1:0);
