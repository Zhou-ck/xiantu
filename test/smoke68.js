/* v48 赛季与软重启补充冒烟：赛季事件 fx / 软重启保留轮回账户与新执念 */
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

// T1 赛季事件执行器：主题事件 fx 正确结算
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.years=0;
  const before=S.stones;
  const ev=THEME_EVENTS.find(e=>e.id==='th_feng_4');
  applyEventEffects(ev.opts[0].fx);
  window.__d=S.stones-before; window.__ev=ev;
`,ctx);
assert(vm.runInContext('window.__d===120',ctx),'赛季事件 fx（风季·纸鸢 +120 灵石）正确');

// T2 软重启：轮回账户保留 + 新执念生成
vm.runInContext(`
  const lo=loopLoad(); lo.points=100; loopSave(lo);
  S.realm=13; S.titles=['zhuji']; S.npcs.forEach(n=>n.met=true);
  const oldGoal=S.flag.karmaGoal;
  PENDING=0; softReset();
  window.__loop=loopLoad().points; window.__goal=S.flag.karmaGoal; window.__oldGoal=oldGoal;
  window.__titles=S.titles.length; window.__realm=S.realm;
`,ctx);
assert(vm.runInContext('window.__loop===100',ctx),'软重启保留全局轮回账户');
assert(vm.runInContext('!!KARMA_GOALS.find(g=>g.id===window.__goal)',ctx),'软重启后生成新前世执念');
assert(vm.runInContext('window.__titles===1&&window.__realm===0',ctx),'软重启保留称号并重置境界');

// T3 赛季标签随年份轮换（连续 12 年）
vm.runInContext(`
  const seq=[];
  for(let y=0;y<=12;y++){S.years=y;seq.push(themeOf().id)}
  window.__seq=seq.join(',');
`,ctx);
assert(vm.runInContext('window.__seq==="feng,feng,feng,lei,lei,lei,huo,huo,huo,shui,shui,shui,feng"',ctx),'赛季每 3 年轮换且循环正确');

console.log(fails===0?'smoke68: ALL PASS':'smoke68 FAILS: '+fails);
process.exit(fails?1:0);
