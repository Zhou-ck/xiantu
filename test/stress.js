/* 卡死/软锁压力测试：依次触发各入口，自动消化弹窗与抉择，
   断言 PENDING 最终归零、无异常、无残留未决弹窗。 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise,btoa:s=>Buffer.from(String(s),'utf8').toString('base64'),atob:s=>Buffer.from(String(s),'base64').toString('utf8')};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
/* 消化弹窗/抉择：事件弹窗 resolve 第 0 项；战斗结算点继续；logChoices 点第一个按钮 */
function drain(tag,max){
  const cap=max||40;
  for(let k=0;k<cap;k++){
    vm.runInContext('window.__br=document.getElementById("battleResult").style.display',ctx);
    if(vm.runInContext('window.__br==="block"&&typeof window._battleResolve==="function"',ctx)){
      vm.runInContext('{ const r=window._battleResolve; window._battleResolve=null; if(r)r(); }',ctx);
      continue;
    }
    const n=vm.runInContext('window._eventModalOpts?window._eventModalOpts.length:0',ctx);
    if(n>0){vm.runInContext('resolveEventModal(0)',ctx);continue}
    const p=vm.runInContext('PENDING',ctx);
    if(p>0){
      /* 找 story 里最后一个 choices 按钮并点击 */
      let clicked=false;
      (function walk(el){if(!el||!el.children)return;for(const c of el.children){
        if(String(c.className||'').indexOf('choices')>=0&&c.children&&c.children.length){clicked=true;c.children[0].onclick&&c.children[0].onclick()}
        else walk(c);
      }})(ids['story']);
      if(!clicked)break;
      continue;
    }
    break;
  }
}
function scenario(name,code){
  try{
    vm.runInContext(code,ctx);
    drain(name);
    const p=vm.runInContext('PENDING',ctx);
    const opts=vm.runInContext('window._eventModalOpts?window._eventModalOpts.length:0',ctx);
    if(p>0||opts>0){fails++;console.log('FAIL: '+name+' 残留 PENDING='+p+' opts='+opts)}
    else console.log('ok  : '+name);
  }catch(e){
    fails++;console.log('FAIL: '+name+' 异常 '+e.message);
  }
}
/* 1) 各标签页与面板入口 */
scenario('tabHome 全页签','{ S=newState("测",BACKGROUNDS[0]); PENDING=0; tabHome("cult"); tabHome("world"); tabHome("sect"); tabHome("social"); tabHome("more"); openTome(); daoPathPage(); titleWall(); panelMarket(); panelRest(); panelCraft(); panelDaily(); panelSave(); panelSettings(); loopShop(); panelInventory(); }');
/* 2) 修炼/托管/静心/心魔历练 */
scenario('修炼托管与静心','{ S=newState("测",BACKGROUNDS[0]); S.realm=9; S.attrs.wil=40; S.stones=1000; PENDING=0; doCultivate(30,"quiet",{auto:false,noEvents:true}); var n=0; while(_cult&&!_cult.done&&n<300){_cultTick();n++} settleMind(); heartTraining(); readBooks(); doRest(); }');
/* 3) 突破全链路：小境界 + 金丹大境界（含心魔试炼） */
scenario('突破至金丹','{ S=newState("测",BACKGROUNDS[0]); S.attrs.wil=40; S.cult=4000; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; PENDING=0; tryBreak(); }');
/* 4) 渡劫期天道之劫与终局战 */
scenario('天道之劫与宿命之战','{ S=newState("测",BACKGROUNDS[0]); S.realm=37; PENDING=0; tianGazeEvent(); tianFateBattle(); tianStage2(); tianStage3(); }');
/* 5) 战斗：遭遇战 + 试炼塔 + 道侣出战 */
scenario('战斗链路','{ S=newState("测",BACKGROUNDS[0]); S.attrs={str:30,agi:20,int:10,cha:10,wil:20}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0; startCombat({name:"试剑石",atk:3,def:2,hp:80,style:"guard"}); doTower(); }');
/* 6) 浪漫链路：聊天/约会/多幕双修/提亲/子女 */
scenario('道侣与子女链路','{ S=newState("测",BACKGROUNDS[0]); S.attrs.cha=40; S.daoPartner={name:"苏婉",role:"采药女",gender:"女",married:true,favor:95,affinity:95,stage:3,hp:40,atk:8,cd:{},root:60,rootElem:"water"}; S.flag.childCd=0; PENDING=0; daoChat(); daoDate(); doDualCultivate(); daoPropose(); askChild(); childCheck(); }');
/* 7) 宗门：入宗/任务/晋升/开宗/建筑/外交/人事 */
scenario('宗门链路','{ S=newState("测",BACKGROUNDS[0]); S.attrs.cha=30; S.attrs.str=30; S.attrs.wil=30; PENDING=0; joinSect(0); for(var k=0;k<3;k++){PENDING=0;doTask(0)} sectSalary(); bigCompetition(); foundOwnSect(); ownBuildUp("lingtian"); ownDiplo(); ownMoodAct("pay"); }');
/* 8) 节日/年度/时代/事件链 */
scenario('年度与事件链','{ S=newState("测",BACKGROUNDS[0]); S.flag.lastYear=1; PENDING=0; festivalEvent("chunjie"); yearlyEvent(); yearlyExtra(); eraEvent(2); chainStart("danfang"); chainTick(); }');
/* 9) 自由行动关键词 + 设置/存档/分享码 */
scenario('自由行动与存档','{ S=newState("测",BACKGROUNDS[0]); PENDING=0; freeAct("修炼30天"); freeAct("探索"); freeAct("坊市"); freeAct("突破"); shareCode(); importRaw(JSON.parse(JSON.stringify(S))); }');
/* 10) 极端状态：寿元将尽、心魔满、重伤 */
scenario('极端状态','{ S=newState("测",BACKGROUNDS[0]); S.age=95; S.heartDemons=4; S.hp=5; S.injuries=[{id:"neijing",left:10},{id:"neishang",left:5}]; S.flag.qingjie=20; PENDING=0; tryBreak(); passTime(20); }');
/* 11) 边缘：孕期分手后仍可胎息检查并诞子 */
scenario('孕期分手边缘','{ S=newState("测",BACKGROUNDS[0]); S.daoPartner=null; S.flag.childPreg={left:30,strength:0,mom:"苏婉"}; PENDING=0; childCheck(); }');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
