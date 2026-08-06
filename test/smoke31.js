/* 论道系统深化 Phase 2h 冒烟：论道台（道韵共鸣 / 三题辩道 / 胜负 / 论道点入道） */
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

// ---- T1 道韵共鸣
vm.runInContext(`
  S=newState('测试辛',BACKGROUNDS[0]);
  S.rootElem='fire'; S.npcs[0].rootElem='wood';
`,ctx);
assert(vm.runInContext('daolunResonance(S.npcs[0])',ctx)===true,'木生火·道韵共鸣');
vm.runInContext('S.npcs[1].rootElem="fire";',ctx);
assert(vm.runInContext('daolunResonance(S.npcs[1])',ctx)===true,'同属灵根·道韵共鸣');
vm.runInContext('S.npcs[2].rootElem="metal";',ctx);
assert(vm.runInContext('daolunResonance(S.npcs[2])',ctx)===false,'火克金·无共鸣');
// ---- T2 论道台面板
vm.runInContext('S.npcs.forEach((n,i)=>{if(i<3)n.met=true}); panelDaolun();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('论道台')>=0||vm.runInContext('document.getElementById("panelTitle").textContent',ctx).indexOf('论道台')>=0,'论道台面板打开');
assert(html.indexOf('论道战绩')>=0,'面板含战绩');
assert(html.indexOf('论道点')>=0,'面板含论道点');
assert(html.indexOf('道韵共鸣')>=0,'面板显示共鸣标记');
// ---- T3 三题辩道获胜（共鸣）
vm.runInContext(`
  Math.random=()=>0.99;
  S.attrs={str:40,agi:40,int:40,cha:40,wil:40};
  S.npcs[0].rootElem='wood'; S.npcs[0].stage=5; S.npcs[0].cd={}; S.npcs[0].favor=20;
  S.cult=0; S.flag.daolunWins=0; S.flag.daolunScore=0;
  daolunWith(0);
`,ctx);
assert(vm.runInContext('S.flag.daolunWins',ctx)===1,'论道获胜 +1 胜');
assert(vm.runInContext('S.flag.daolunScore',ctx)===2,'共鸣获胜论道点 +2');
assert(vm.runInContext('S.cult>0',ctx)===true,'论道获得修为');
assert(vm.runInContext('S.npcs[0].cd.daolun>0',ctx)===true,'论道冷却生效');
// ---- T4 论道点入道
vm.runInContext('S.flag.daolunScore=5; S.flag.insights=0; daolunEnlighten();',ctx);
assert(vm.runInContext('S.flag.daolunScore',ctx)===2,'消耗 3 论道点');
assert(vm.runInContext('S.flag.insights',ctx)===1,'悟道 +1');
// ---- T5 论道点不足拦截
vm.runInContext('S.flag.daolunScore=2; S.flag.insights=1; daolunEnlighten();',ctx);
assert(vm.runInContext('S.flag.daolunScore',ctx)===2&&vm.runInContext('S.flag.insights',ctx)===1,'论道点不足不消耗');
// ---- T6 论道落败结算
vm.runInContext(`
  S.attrs={str:1,agi:1,int:1,cha:1,wil:1};
  S.npcs[1].rootElem='fire'; S.npcs[1].stage=8; S.npcs[1].cd={}; S.npcs[1].favor=20;
  Math.random=()=>0.01;
  daolunWith(1);
`,ctx);
assert(vm.runInContext('S.flag.daolunLosses',ctx)===1,'论道落败 +1 负');
assert(vm.runInContext('S.npcs[1].favor',ctx)>=21,'落败亦增好感');

console.log(fails===0?'smoke31: ALL PASS':'smoke31 FAILS: '+fails);
process.exit(fails?1:0);
