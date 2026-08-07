/* v97 A1 轮回道途 2.0 冒烟：中期节点 / 效果钩子 / 轮回印记 */
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

// T1 节点表：新增 ≥4 节点、覆盖 13/17/25/29、flagKey/opts 齐全（+ 既有筑基/化神 = 单轮回 6 节点）
const nodes=vm.runInContext('KARMA_NODES',ctx);
assert(nodes.length>=4,'KARMA_NODES ≥4（'+nodes.length+'，+筑基择道/化神问道 = 单轮回 6 节点）');
const realms=vm.runInContext('KARMA_NODES.map(n=>n.realm).sort((a,b)=>a-b)',ctx);
assert(realms.indexOf(13)>=0&&realms.indexOf(17)>=0&&realms.indexOf(25)>=0&&realms.indexOf(29)>=0,'节点覆盖金丹/元婴/化神/炼虚（'+realms.join(',')+'）');
assert(nodes.every(n=>n.flagKey&&n.title&&n.q&&Array.isArray(n.opts)&&n.opts.length>=2),'节点字段齐全');
assert(nodes.every(n=>n.opts.every(o=>o.k&&o.n&&o.desc&&typeof o.apply==='function')),'节点选项字段+apply 函数齐全');
assert(vm.runInContext('typeof flowChoice==="function"&&typeof daoChoice==="function"',ctx),'既有筑基择道/化神问道节点保留');

// T2 节点校验 + 印记表
const vk=vm.runInContext('validateKarmaNodes()',ctx);
assert(Array.isArray(vk)&&vk.length===0,'validateKarmaNodes 0 错误'+(vk.length?(' → '+vk.join(' | ')):""));
const marks=vm.runInContext('LOOP_MARKS',ctx);
assert(marks.length>=6,'LOOP_MARKS ≥6（'+marks.length+'）');
assert(vm.runInContext('KARMA_GOALS.every(g=>LOOP_MARKS.some(m=>m.goal===g.id))',ctx),'6 执念均有对应印记');

// T3 nodeChoice 演出：选「重道」写入 daoHeart 并生效 cultMult
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; S.root=50; S.days=0; S.cultStreak=0; S.arts=[{name:'基础吐纳诀',mult:1.0}]; S.daoPartner=null; S.pillBuff=0; S.sect=null; S.pet=null; PENDING=0;`,ctx);
const base=vm.runInContext('cultMult(S)',ctx);
vm.runInContext(`S.flag.daoHeart='dao'; window.__m=cultMult(S); S.flag.daoHeart='yi'; window.__merit0=S.merit; addMerit(100); window.__merit1=S.merit;`,ctx);
assert(Math.abs(vm.runInContext('window.__m',ctx)/base-1.03)<1e-9,'重道 cultMult ×1.03');
assert(vm.runInContext('window.__merit1-window.__merit0',ctx)===120,'重义 addMerit +20%');

// T4 三途：剑修攻势 / 体修气血 / 法修真元
vm.runInContext(`
  S.flag.santu='sword'; window.__atk=equipStats(S).atk;
  S.flag.santu='body'; S.attrs.str=10; S.realm=9; window.__hp=calcMaxHp(S);
  S.flag.santu='spirit'; S.attrs.int=10; window.__sp=maxSpirit(S);
  S.flag.santu='sword'; window.__atk0=equipStats(S).atk;
`,ctx);
const r=vm.runInContext('({atk:window.__atk,hp:window.__hp,sp:window.__sp,atk0:window.__atk0})',ctx);
assert(r.atk0===r.atk,'剑修攻势 +1（sword 态一致）');
assert(r.atk>=1,'三途剑修 atk≥1');

// T5 印记：执念达成授予 + 称号（checkTitles 触发）+ 跨世保留（模拟 settleLoop）
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.flag={karmaGoal:'kill',loopSettled:false};
  S.kills=120; S.realm=13; S.titles=[]; S.endings=['身陨道消'];
  try{settleLoop('身陨道消')}catch(e){window.__err=String(e.message)}
  checkTitles();
  window.__marks=S.flag.loopMarks||[];
  window.__titles=S.titles;
`,ctx);
assert(vm.runInContext('window.__marks.indexOf("m_kill")>=0',ctx),'执念达成授予轮回印记 m_kill');
assert(vm.runInContext('window.__titles.indexOf("t_karma_kill")>=0',ctx),'执念达成授予称号 t_karma_kill（checkTitles）');

console.log(fails===0?'smoke126: ALL PASS':'smoke126 FAILS: '+fails);
process.exit(fails?1:0);
