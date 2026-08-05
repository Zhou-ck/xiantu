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
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
assert(vm.runInContext('THRESHOLDS.length===42&&REALMS.length===42&&LIFESPANS.length===42&&WIL_REQ.length===42&&DIFFS.length===42',ctx),'常量表均为42档');
assert(vm.runInContext("REALMS[9]==='筑基前期'&&REALMS[12]==='筑基圆满'&&REALMS[13]==='金丹前期'&&REALMS[41]==='仙人'",ctx),'境界名称正确');
assert(vm.runInContext('THRESHOLDS[9]===1000&&THRESHOLDS[12]===2500&&THRESHOLDS[13]===3000&&THRESHOLDS[41]===1000000',ctx),'修为阈值正确');
assert(vm.runInContext('LIFESPANS[9]===200&&LIFESPANS[13]===400&&LIFESPANS[41]===Infinity',ctx),'寿元按大境');
assert(vm.runInContext('WIL_REQ[9]===15&&WIL_REQ[10]===0&&WIL_REQ[13]===18&&DIFFS[41]===46',ctx),'心性门槛仅在大境点');
assert(vm.runInContext('bigStage(0)===0&&bigStage(9)===1&&bigStage(40)===8&&bigStage(41)===9',ctx),'bigStage 正确');
assert(vm.runInContext('isBigBreak(9)&&isBigBreak(13)&&!isBigBreak(10)&&isBigBreak(41)&&!isBigBreak(8)',ctx),'大境突破点判定');
assert(Math.abs(vm.runInContext('powR(9)',ctx)-9)<1e-9&&Math.abs(vm.runInContext('powR(12)',ctx)-9.75)<1e-9&&Math.abs(vm.runInContext('powR(41)',ctx)-41)<1e-9,'powR 强度等级');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=9; S.cult=2600; PENDING=0; tryBreak(); }`,ctx);
assert(vm.runInContext('S.realm===12',ctx),'筑基中期/后期/圆满自动晋升');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=9; S.cult=1600; PENDING=0; tryBreak(); }`,ctx);
assert(vm.runInContext('S.realm===10',ctx),'修为只够中期时只升一段');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=12; S.cult=3500; S.kills=3; S.attrs.wil=40; S.heartDemons=0; S.temp={break:0}; PENDING=0; tryBreak(); }`,ctx);
for(let k=0;k<3;k++)clickChoice(0);
assert(vm.runInContext('S.realm===13',ctx),'筑基圆满→金丹前期判定成功');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=40; S.cult=1000000; S.attrs.wil=45; S.merit=300; S.heartDemons=0; S.temp={break:0}; PENDING=0; tryBreak(); }`,ctx);
for(let k=0;k<3;k++)clickChoice(0);
assert(vm.runInContext('S.realm===41&&S.endings.indexOf("飞升成仙")>=0',ctx),'渡劫圆满→飞升成仙');
const old={name:'旧档',realm:10,cult:3000,attrs:{str:5,agi:5,int:5,cha:5,wil:5},root:30,luck:30,hp:100,maxHp:100,stones:10,items:[],arts:[],mats:{},weapon:null,armor:null,trinket:null,sect:null,contrib:0,prof:null,profLevel:0,profExp:0,npcs:[],daoPartner:null,master:null,enemy:null,quests:{},merit:0,karma:0,pet:null,titles:[],seenE:{},seenI:{},wins:0,heartTrains:0,heartDemons:0,kills:0,age:16,years:0,days:0,pillBuff:0,temp:{break:0},flag:{}};
vm.runInContext('localStorage.setItem("xiantu_save_0",'+JSON.stringify(JSON.stringify(old))+'); S=load(); window.__m={realm:S.realm,ver:S.version};',ctx);
assert(vm.runInContext('window.__m.realm===13&&window.__m.ver===2',ctx),'旧档金丹期迁移为金丹前期(13)');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
