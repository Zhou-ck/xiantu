/* 入口整合冒烟：自由行动识别新系统 + 论道每日任务 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}
const body=()=>vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
const title=()=>vm.runInContext('document.getElementById("panelTitle").textContent',ctx);

// ---- T1 自由行动识别新系统
vm.runInContext(`S=newState('测试午',BACKGROUNDS[0]); PENDING=0;`,ctx);
vm.runInContext('freeAct("与人论道");',ctx);
assert(title().indexOf('论道台')>=0,'自由行动「论道」直达论道台');
vm.runInContext('freeAct("参悟战技");',ctx);
assert(title().indexOf('战技参悟')>=0,'自由行动「战技」直达战技参悟');
vm.runInContext('freeAct("看看收藏图鉴");',ctx);
assert(title().indexOf('收藏图鉴')>=0,'自由行动「图鉴」直达收藏图鉴');
vm.runInContext('freeAct("查看关系图谱");',ctx);
assert(body().indexOf('因果星图')>=0,'自由行动「图谱」直达关系图谱');
vm.runInContext('freeAct("真元淬体");',ctx);
assert(title().indexOf('闭关修炼')>=0,'自由行动「真元」直达修炼页');
vm.runInContext('freeAct("妖潮守城");',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.indexOf("妖潮守城战")>=0',ctx)===true,'自由行动「守城」给出提示');
// ---- T2 论道每日任务
vm.runInContext(`
  S.stones=0; S.daily=newDailyState();
  S.daily.c.daolun=1;
  checkDaily();
`,ctx);
assert(vm.runInContext('S.daily.doneD.d_daolun',ctx)===true,'论道每日任务达成');
assert(vm.runInContext('S.stones',ctx)>=20,'论道任务奖励灵石');
// ---- T3 论道计数接入
vm.runInContext(`
  S.npcs[0].met=true; S.npcs[0].cd={}; S.npcs[0].rootElem='fire';
  S.rootElem='fire'; S.attrs={str:40,agi:40,int:40,cha:40,wil:40};
  S.daily=newDailyState(); Math.random=()=>0.99;
  daolunWith(0);
`,ctx);
assert(vm.runInContext('S.daily.c.daolun',ctx)===1,'论道计数写入每日统计');

console.log(fails===0?'smoke40: ALL PASS':'smoke40 FAILS: '+fails);
process.exit(fails?1:0);
