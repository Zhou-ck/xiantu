/* v44 突破保底 + 择道节点冒烟 */
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
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(document.getElementById('story'),el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 前世执念：新局生成且合法
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.quest={main:{ch:0,step:0,done:[],chDone:[],log:[]},side:{},sideStep:{},sideDone:{}};
  S.flag.karmaGoal=pick(KARMA_GOALS).id;
  window.__goal=S.flag.karmaGoal; window.__ok=!!KARMA_GOALS.find(g=>g.id===S.flag.karmaGoal);
`,ctx);
assert(vm.runInContext('window.__ok',ctx),'新局生成合法前世执念（'+vm.runInContext('window.__goal',ctx)+'）');

// T2 突破失败保底累计
vm.runInContext(`
  S.cult=5000; S.insight=0; S.mood=60; S.temp={break:0}; S.flag.breakPity=0;
  PENDING=0; applyBreakFail(1000,{t:0,mod:0},false);
  window.__pity=S.flag.breakPity; window.__ins=S.insight;
`,ctx);
assert(vm.runInContext('window.__pity===1',ctx),'突破失败后保底 +1');
assert(vm.runInContext('window.__ins>0',ctx),'失败仍保留渡劫感悟');

// T3 择道节点：三选一、选定后流派生效
vm.runInContext(`
  S.flag.flowChosen=false; S.flag.flowChoice=null; S.flag.insights=0;
  PENDING=0; flowChoice(); window.__p=PENDING;
`,ctx);
assert(vm.runInContext('window.__p===1',ctx),'择道节点触发三选一抉择');
clickChoice(0);
vm.runInContext(`window.__flow=S.flag.flowChoice; window.__ok2=!!FLOW_DEFS[window.__flow]; window.__chosen=S.flag.flowChosen; window.__ins2=S.flag.insights;`,ctx);
assert(vm.runInContext('window.__ok2&&window.__chosen',ctx),'选定流派写入并记录（'+vm.runInContext('window.__flow',ctx)+'）');
assert(vm.runInContext('window.__ins2>=1',ctx),'择道附带悟道 +1');

// T4 同流派主修功法修炼效率 +5%
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.root=50; S.days=0; S.cultStreak=0; S.pillBuff=0; S.sect=null; S.pet=null; S.daoPartner=null;
  S.arts=[{name:'太乙剑诀',elem:'metal',mult:1.2,flow:'sword'}];
  S.realm=9; window.__m0=cultMult(S);
  S.flag.flowChoice='sword'; window.__m1=cultMult(S);
  S.flag.flowChoice='dan'; window.__m2=cultMult(S);
`,ctx);
const m0=vm.runInContext('window.__m0',ctx),m1=vm.runInContext('window.__m1',ctx),m2=vm.runInContext('window.__m2',ctx);
assert(Math.abs(m1/m0-1.05)<1e-9&&Math.abs(m2/m0-1)<1e-9,'同流派主修效率 ×1.05，异流派无加成');

// T5 境界开放表含择道与试炼塔
assert(vm.runInContext('unlockListAt(9).indexOf("择道")>=0&&unlockListAt(2).indexOf("试炼塔")>=0',ctx),'境界开放表更新（筑基·择道 / 炼气三层·试炼塔）');

console.log(fails===0?'smoke61: ALL PASS':'smoke61 FAILS: '+fails);
process.exit(fails?1:0);
