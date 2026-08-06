/* v51 社交向交互冒烟：茶会诗会 / 结伴云游 / NPC 来访 */
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

vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.stones=9999; S.attrs={str:20,agi:20,int:30,cha:30,wil:30}; S.realm=5; S.flag={}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0;
  S.npcs=[{name:'林霜',role:'剑阁女侠',gender:'女',favor:70,stage:3,met:true,foe:false,cd:{}},{name:'苏婉',role:'采药女',gender:'女',favor:60,stage:2,met:true,foe:false,cd:{}},{name:'云瑶',role:'丹房女修',gender:'女',favor:55,stage:2,met:true,foe:false,cd:{}}];
`,ctx);
// T1 茶会/诗会：三席走完、年冷却、声望
vm.runInContext(`S.flag.teaYear=-1; S.flag.teaCd=0; PENDING=0; panelTea();`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length>=2',ctx),'茶会开启首席');
vm.runInContext(`for(let k=0;k<3&&window._eventModalOpts&&window._eventModalOpts.length;k++)resolveEventModal(0); window.__teaYear=S.flag.teaYear; window.__teaCd=S.flag.teaCd; window.__fame=(S.fame&&S.fame.san)||0;`,ctx);
assert(vm.runInContext('window.__teaYear>=0&&window.__teaCd>0&&window.__fame>=5',ctx),'茶会三席走完：年度冷却 + 散修声望 +5');
// T2 结伴云游：择地→事件链→好感修为
vm.runInContext(`PENDING=0; panelTravel(); window.__t=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__t.indexOf("结伴云游")>=0',ctx),'结伴云游面板可开');
vm.runInContext(`const f0=S.npcs[0].favor; const c0=S.cult; travelStart(0); resolveEventModal(1); resolveEventModal(0); resolveEventModal(0); window.__f1=S.npcs[0].favor; window.__c1=S.cult; window.__comp=S.companion&&S.companion.name;`,ctx);
assert(vm.runInContext('window.__f1>f0&&window.__c1>c0',ctx),'云游事件链完成：好感与修为提升');
// T3 NPC 来访：触发事件池并完成
vm.runInContext(`S.flag.npcVisitCd=0; PENDING=0; const __pick2=pick; pick=()=>NPC_VISITS[0]; maybeNpcVisit(); pick=__pick2; window.__visit=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__visit>=2',ctx),'NPC 来访触发事件弹窗');
vm.runInContext(`if(window._eventModalOpts&&window._eventModalOpts.length)resolveEventModal(0); window.__after=PENDING;`,ctx);
assert(vm.runInContext('window.__after===0',ctx),'来访事件选择后无残留阻塞');

console.log(fails===0?'smoke75: ALL PASS':'smoke75 FAILS: '+fails);
process.exit(fails?1:0);
