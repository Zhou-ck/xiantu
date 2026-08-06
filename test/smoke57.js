/* v42 主线冒烟：章节步进 / 剧情回顾 / 章节奖励 / 剧情不自动打断 */
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

// T1 初始状态：主线第 0 章第 0 步为剧情，且不自动打断（PENDING 保持 0）
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; PENDING=0;
  initQuestState(); questTick();
  window.__st=mainStep(); window.__p=PENDING;
`,ctx);
assert(vm.runInContext('window.__st&&window.__st.type==="story"&&window.__st.id==="m0s0"',ctx),'主线初始步骤为剧情「残卷托梦」');
assert(vm.runInContext('window.__p===0',ctx),'剧情步骤不会在行动中自动打断（PENDING=0）');

// T2 点击「继续剧情」演出并推进到 realm(3) 步骤
vm.runInContext(`PENDING=0; questContinueStory(); window.__p1=PENDING;`,ctx);
assert(vm.runInContext('window.__p1===1',ctx),'继续剧情触发抉择（PENDING=1）');
clickChoice(0);
vm.runInContext(`window.__st2=mainStep();`,ctx);
assert(vm.runInContext('window.__st2.type==="realm"&&window.__st2.param===3',ctx),'剧情选择后主线推进至 realm(3) 步骤');
assert(vm.runInContext('(S.quest.main.done||[]).indexOf("m0s0")>=0',ctx),'剧情步骤已标记完成');

// T3 达成境界 → 推进到 visit(near)
vm.runInContext(`S.realm=3; PENDING=0; questTick(); window.__st3=mainStep();`,ctx);
assert(vm.runInContext('window.__st3.type==="visit"&&window.__st3.param==="near"',ctx),'炼气三层后主线推进至 visit(near)');

// T4 到访区域 → 推进至剧情 m0s3；完成章节 0 获得里程碑奖励
vm.runInContext(`
  S.flag.regions={near:1}; PENDING=0; questTick();
  window.__st4=mainStep();
  const before=S.stones; const beforeIns=S.flag.insights||0;
  PENDING=0; questContinueStory(); PENDING=1; /* 模拟已演出中 */
`,ctx);
assert(vm.runInContext('window.__st4.id==="m0s3"',ctx),'到访近郊后主线推进至「山神夜话」');
// 演出（直接调 runMainStoryStep 并选择）
vm.runInContext(`
  /* 隔离周任务「境界精进」的自动发放，只测章节里程碑 */
  dC().doneW.w_realm=true; dC().p.realm=S.realm;
  S.quest.main.done=[]; S.quest.main.step=3; PENDING=0;
  questContinueStory();
`,ctx);
assert(vm.runInContext('PENDING',ctx)===1,'山神夜话触发抉择');
vm.runInContext(`window.__beforeStones=S.stones; window.__beforeIns=S.flag.insights||0;`,ctx);
clickChoice(0);
vm.runInContext(`window.__after=mainStep(); window.__chDone=S.quest.main.chDone||[]; window.__ch=S.quest.main.ch; window.__log=S.quest.main.log||[]; window.__stDone=(S.quest.main.done||[]).indexOf("m0s3")>=0;`,ctx);
assert(vm.runInContext('window.__stDone&&window.__ch===1',ctx),'章节 0 完结并进入第 1 章');
assert(vm.runInContext('window.__chDone.indexOf("ch0")>=0',ctx),'章节 0 记入完成列表');
assert(vm.runInContext('window.__log.length===1&&window.__log[0].title==="破庙惊变"',ctx),'剧情回顾记录「破庙惊变」');
assert(vm.runInContext('S.stones-window.__beforeStones===80',ctx),'章节里程碑灵石 +80');
assert(vm.runInContext('(S.flag.insights||0)-window.__beforeIns>=1',ctx),'章节里程碑悟道 +1');

// T5 主线目标联动地图 📌
vm.runInContext(`window.__tgt=mainVisitTarget();`,ctx);
assert(vm.runInContext('window.__tgt==="valley"',ctx),'第 1 章首个目标为灵溪幽谷（visit）');

console.log(fails===0?'smoke57: ALL PASS':'smoke57 FAILS: '+fails);
process.exit(fails?1:0);
