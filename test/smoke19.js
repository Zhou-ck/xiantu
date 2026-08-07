const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 宗门入门流程：记名→杂役→考核→外门
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.cha=20; S.attrs.str=30; S.gender='男'; PENDING=0; joinSect(0); window.__stage=S.sectStage; window.__tasks=S.tasks.map(t=>t.kind).join(','); }`,ctx);
assert(vm.runInContext('window.__stage==="probation"&&window.__tasks.indexOf("chore")>=0',ctx),'拜山先为记名弟子并领杂役');
vm.runInContext(`{ S.attrs.wil=30; S.attrs.str=30; for(var k=0;k<3;k++){ doTask(0); if(S.sectStage==='outer')break; } window.__st2=S.sectStage; window.__hasArt=S.arts.some(a=>a.name===S.sect.art.name); }`,ctx);
assert(vm.runInContext('window.__st2==="outer"&&window.__hasArt',ctx),'三件杂役后考核通过入外门并授功法');
// 2) 心魔试炼：大境界突破先试炼，胜场影响突破
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=40; S.cult=3500; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; PENDING=0; tryBreak(); window.__p=PENDING; }`,ctx);
assert(vm.runInContext('window.__p>0',ctx),'金丹突破进入心魔试炼');
for(let k=0;k<3;k++)clickChoice(0);
if(lastChoices())clickChoice(0); /* v97 道心三问节点 */
assert(vm.runInContext('S.realm===13&&PENDING===0',ctx),'试炼通过后晋升金丹');
// 3) 烙印类型化
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.heartDemons=0; addDemonMark('obsess',60); window.__m={marks:S.demonMarks.length,hd:S.heartDemons,pen:demonObsessPenalty(S)}; removeDemonMark('obsess'); window.__m2={marks:S.demonMarks.length,hd:S.heartDemons}; }`,ctx);
assert(vm.runInContext('window.__m.marks===1&&window.__m.hd===1&&window.__m.pen===2&&window.__m2.marks===0&&window.__m2.hd===0',ctx),'执念烙印：登记、突破-2、可消除');
// 4) 天劫类型化
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=40; S.cult=3500; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; S.flag.tribType='thunder'; PENDING=0; tryBreak(); }`,ctx);
for(let k=0;k<3;k++)clickChoice(0);
if(lastChoices())clickChoice(0); /* v97 道心三问节点 */
assert(vm.runInContext('S.realm===13&&S.flag.tribType===null',ctx),'指定天雷劫类型后突破正常');
// 5) 守关 BOSS
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__b=bossOf(0); bossBattle(0); window.__opts=0; }`,ctx);
const bossChoices=lastChoices();
assert(vm.runInContext('!!window.__b.name&&window.__b.boss===true',ctx),'守关 BOSS 生成');
assert(!!bossChoices&&bossChoices.children.length>=2,'守关 BOSS 弹出挑战选项');
// 6) 时代主线
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); PENDING=0; eraEvent(1); window.__p1=PENDING; window.__done1=!!S.flag.eraDone.moyi; PENDING=0; eraEvent(1); window.__p2=PENDING; }`,ctx);
assert(vm.runInContext('window.__done1===true&&window.__p1===1&&window.__p2===0',ctx),'时代事件每年触发一次不重复');
// 7) 事件链
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.flag.chain={}; chainStart('danfang'); window.__c=S.flag.chain.danfang; PENDING=0; chainTick(); window.__opts2=window._eventModalOpts?window._eventModalOpts.length:0; }`,ctx);
assert(vm.runInContext('window.__c===1&&window.__opts2>=2',ctx),'事件链开启并可推进');
// 8) 战斗功法技能
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.arts=[{name:'炎阳诀',mult:1.2,elem:'fire'}]; window.__sk=artSkill(S.arts[0]); S.attrs={str:20,agi:10,int:10,cha:10,wil:10}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.weapon=null; S.items=[]; PENDING=0; startCombat({name:'试剑石',atk:1,def:1,hp:60,elem:'wood',style:'guard'}); }`,ctx);
assert(vm.runInContext('window.__sk&&window.__sk.n==="焚天诀"',ctx),'火系功法解锁焚天诀');
clickChoice(0);
vm.runInContext(`{ var n=0; while(PENDING>0&&n<50){ n++; } window._battleResolve&&window._battleResolve(); }`,ctx);
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
