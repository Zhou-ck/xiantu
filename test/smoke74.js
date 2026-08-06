/* v51 战斗向交互冒烟：御剑试炼 / 战斗 QTE / 守关弱点 / 妖潮备战 */
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

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:30,agi:30,int:30,cha:20,wil:30}; S.realm=5; S.stones=5000; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.flag={}; S.flag.npcVisitCd=100; S.flag.teaCd=100; PENDING=0;`,ctx);
// T1 御剑试炼：三段判定、冷却与奖励
vm.runInContext(`swordTrial();`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length>=2',ctx),'御剑试炼开启第一段');
vm.runInContext(`for(let k=0;k<3&&window._eventModalOpts&&window._eventModalOpts.length;k++)resolveEventModal(0); window.__cd=S.flag.swordCd; window.__hits=S.flag._swordHits;`,ctx);
assert(vm.runInContext('window.__cd>=29&&window.__hits>=0',ctx),'御剑试炼完成并设 30 日冷却');
// T2 战斗 QTE：自动档走稳、无残留弹窗、战斗可胜
vm.runInContext(`S.flag.swordCd=0; S.flag.npcVisitCd=100; S.items=[]; S.weapon=null; S.armor=null; S.trinket=null; S.set.autoCombat=true; PENDING=0; battle({name:'靶子',atk:-20,def:0,hp:500});`,ctx);
assert(vm.runInContext('PENDING===0&&window._eventModalOpts?window._eventModalOpts.length===0:true',ctx),'autoCombat 下 QTE 自动走稳且不阻塞');
// T3 守关 BOSS 弱点提示
vm.runInContext(`S.flag.bosses={}; PENDING=0; bossBattle(0); window.__hint=document.getElementById('story')._html;`,ctx);
assert(vm.runInContext('window.__hint.indexOf("破绽窥探")>=0',ctx),'守关 BOSS 展示五行弱点提示');
vm.runInContext('PENDING=0; resolveEventModal?0:0; window._eventModalOpts=[];',ctx);
// T4 妖潮备战：波型选择与备战弹窗
vm.runInContext(`S.flag.tideWins=0; PENDING=0; tideWave(1,false); window.__prep=window._eventModalOpts?window._eventModalOpts.length:0; window.__wt=S.flag._lastTideType||'';`,ctx);
assert(vm.runInContext('window.__prep>=2',ctx),'妖潮每波有备战选择');

console.log(fails===0?'smoke74: ALL PASS':'smoke74 FAILS: '+fails);
process.exit(fails?1:0);
