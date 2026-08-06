/* 集成验收：同一局内走遍 19 个深化系统的面板与结算链路，
   断言 PENDING 归零、无异常、无残留弹窗（复用 stress 的 drain 框架）。 */
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
function drain(tag,max){
  const cap=max||60;
  for(let k=0;k<cap;k++){
    if(vm.runInContext('document.getElementById("battleResult").style.display==="block"&&typeof window._battleResolve==="function"',ctx)){
      vm.runInContext('{ const r=window._battleResolve; window._battleResolve=null; if(r)r(); }',ctx);
      continue;
    }
    const n=vm.runInContext('window._eventModalOpts?window._eventModalOpts.length:0',ctx);
    if(n>0){vm.runInContext('resolveEventModal(0)',ctx);continue}
    const p=vm.runInContext('PENDING',ctx);
    if(p>0){
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
/* 1) 新系统面板全链路：角色档案/关系图谱/论道/战技/图鉴/生涯/行迹/手札/宗门/淬体/守城/自由行动 */
scenario('新系统面板全链路','{ S=newState("测",BACKGROUNDS[0]); S.realm=8; S.cult=950; S.wis=5; S.trail=3; S.prof="alchemy"; S.profLevel=3; S.profExp=40; S.mats={herb:5,sherb:3,demonCore:1,iron:3,jade:2,paper:2,cinnabar:1}; S.flag.tech={pts:6,ups:{agg:2,agi:1}}; S.flag.daolunWins=3; S.flag.tideWins=2; S.flag.craftLog={"回春丹":{count:3,best:"上品"}}; S.flag.exploreCount=30; S.sect={id:"own",name:"青云宗",dark:false,own:true}; S.flag.ownSect=true; S.flag.ownBuild={lingtian:2,danfang:1,qi:0,cangjing:1,shou:0,huike:1}; S.spirit=40; PENDING=0; openCharPanel(); relationWeb(); panelDaolun(); panelBattleArts(); collectionAtlas(); careerWall(); exploreTome(); craftTome(); panelSect(); spiritQuench(); beastTideEvent(); freeAct("论道"); freeAct("战技"); freeAct("图鉴"); freeAct("图谱"); freeAct("真元"); }');
/* 2) 新系统结算链路：论道/战技/淬体/入道/秘境册/图鉴里程碑 */
scenario('新系统结算链路','{ S=newState("测",BACKGROUNDS[0]); S.attrs={str:40,agi:40,int:40,cha:40,wil:40}; S.npcs[0].met=true; S.npcs[0].cd={}; S.npcs[0].rootElem="fire"; S.rootElem="fire"; S.flag.tech={pts:3,ups:{}}; S.flag.daolunScore=2; PENDING=0; daolunWith(0); learnTech("agg"); spiritQuench(); daolunEnlighten(); recordDungeonDone("cave"); checkAtlasMiles(); }');
/* 3) 妖潮守城完整链路（三波→全胜/撤退） */
scenario('妖潮守城链路','{ S=newState("测",BACKGROUNDS[0]); S.attrs={str:40,agi:40,int:40,cha:40,wil:40}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0; beastTideEvent(); }');
console.log(fails===0?'integration: ALL PASS':'integration FAILS: '+fails);
process.exit(fails?1:0);
