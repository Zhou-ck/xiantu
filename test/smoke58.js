/* v42 支线冒烟：触发 → 进行 → 完成 → 一次性奖励 */
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

// T1 支线数据完整性
vm.runInContext(`window.__cov=questCoverage();`,ctx);
const cov=vm.runInContext('window.__cov',ctx);
assert(cov.sideQuests>=23&&cov.sideSteps>=55,'支线 ≥23 条、≥55 步（v96 收官 B09 扩至 23 条）');
assert(cov.mainChapters===11&&cov.mainSteps>=36,'主线 11 章（第零至第十章）、≥36 步');

// T2 触发条件未满足 → 不开启
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.flag.regions={near:2};
  PENDING=0; questTick();
  window.__sideState=S.quest.side.sq_pomiao||0; window.__step=S.quest.sideStep.sq_pomiao;
`,ctx);
assert(vm.runInContext('window.__sideState===0&&window.__step===undefined',ctx),'到访不足时不开启支线');

// T3 满足触发 → 自动开启
vm.runInContext(`
  S.flag.regions.near=3; PENDING=0; questTick();
  window.__sideState2=S.quest.side.sq_pomiao; window.__step2=S.quest.sideStep.sq_pomiao; window.__log=document.getElementById('story')._html;
`,ctx);
assert(vm.runInContext('window.__sideState2===1&&window.__step2===0',ctx),'到访 3 次后支线「破庙香火」自动开启');
assert(vm.runInContext('window.__log.indexOf("破庙香火")>=0',ctx),'开启提示写入故事日志');

// T4 剧情步骤点击推进 → 完成 → 奖励只发一次
vm.runInContext(`
  const before=S.stones, beforeLuck=S.luck;
  PENDING=0; questContinueStory('sq_pomiao');
  window.__p=PENDING; window.__b=[before,beforeLuck];
`,ctx);
assert(vm.runInContext('window.__p===1',ctx),'支线剧情触发抉择');
clickChoice(0);
vm.runInContext(`
  window.__done=S.quest.side.sq_pomiao; window.__titles=S.titles;
  window.__stDelta=S.stones-window.__b[0]; window.__luckDelta=S.luck-window.__b[1];
`,ctx);
assert(vm.runInContext('window.__done==="done"',ctx),'支线完成后标记 done');
assert(vm.runInContext('window.__stDelta===150&&window.__luckDelta===1',ctx),'支线奖励灵石 +150 · 气运 +1');
assert(vm.runInContext('window.__titles.indexOf("t_quest_pomiao")>=0',ctx),'称号「山神眷顾」入册（id 解析）');

// T5 完成态不重复发放
vm.runInContext(`
  const b2=S.stones;
  questTick(); questTick();
  window.__delta2=S.stones-b2;
`,ctx);
assert(vm.runInContext('window.__delta2===0',ctx),'已完成支线不重复发放奖励');

// T6 称号表存在且 checkTitles 不二次发放
vm.runInContext(`window.__titleDef=!!TITLES.find(t=>t.id==='t_quest_pomiao'); const b3=S.luck; checkTitles(); window.__lt2=S.luck-b3;`,ctx);
assert(vm.runInContext('window.__titleDef',ctx),'TITLES 含「山神眷顾」定义');
assert(vm.runInContext('window.__lt2===0',ctx),'checkTitles 不重复授予已得称号效果');

console.log(fails===0?'smoke58: ALL PASS':'smoke58 FAILS: '+fails);
process.exit(fails?1:0);
