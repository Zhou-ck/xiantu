/* v47 通用故事事件执行器冒烟：抽取 / 效果 / once / 战斗 */
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

// T1 每类 ≥12 条，抽取结果类别正确
for(const cat of ['calm','herb','rare','epic','danger']){
  assert(vm.runInContext('storyEventPool("'+cat+'").length>=12',ctx),cat+' 类故事事件 ≥12 条');
}
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; S.realm=0; window.__ev=rollStoryEvent('rare');`,ctx);
assert(vm.runInContext('window.__ev&&window.__ev.cat==="rare"',ctx),'rollStoryEvent 返回对应类别事件');

// T2 效果执行器：灵石 / 材料 / hp / root / mood
vm.runInContext(`
  const before={st:S.stones,hp:S.hp,root:S.root,mood:S.mood};
  applyEventEffects({stones:100,mat:{herb:2},hp:-10,root:3,mood:5});
  window.__d={st:S.stones-before.st,hp:before.hp-S.hp,root:S.root-before.root,mood:S.mood-before.mood};
`,ctx);
assert(vm.runInContext('window.__d.st===100&&window.__d.hp===10&&window.__d.root===3&&window.__d.mood===5',ctx),'故事事件 fx（灵石/气血/灵根/心境）正确执行');

// T3 once 一次性：只发一次
vm.runInContext(`
  S.flag.regionOnce={};
  const f={insight:1,once:'t_once'};
  const a1=applyEventEffects(f);
  const a2=applyEventEffects(_onceFx(f));
  window.__once=[a1,a2,S.flag.insights];
`,ctx);
assert(vm.runInContext('window.__once[0].indexOf("悟道 +1")>=0&&window.__once[1].indexOf("悟道 +1")<0&&window.__once[2]===1',ctx),'故事事件 once 一次性语义生效');

// T4 战斗型事件：runStoryEvent 触发抉择（PENDING=1）
vm.runInContext(`PENDING=0; window.__ev2=rollStoryEvent('danger'); runStoryEvent(window.__ev2); window.__p=PENDING;`,ctx);
assert(vm.runInContext('window.__p===1',ctx),'凶险类故事事件触发抉择演出');

console.log(fails===0?'smoke67: ALL PASS':'smoke67 FAILS: '+fails);
process.exit(fails?1:0);
