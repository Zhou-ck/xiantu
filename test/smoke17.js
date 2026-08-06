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
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();g.children[i].onclick()}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// T1 天雷符出现在战斗选项
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.items=[{name:'天雷符',type:'consumable',quality:3,use:'thunder'}]; PENDING=0; startCombat({name:'测试',atk:5,def:2,hp:50});`,ctx);
assert(lastChoices().children.map(b=>b.innerHTML).join('|').indexOf('天雷符')>=0,'天雷符出现在战斗选项');
lastChoices().children[0].onclick();
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
lastChoices().children[0].onclick();
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
lastChoices().children[0].onclick();
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
// T2 力量成长同步 maxHp
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs.str=10; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.attrs.str=20; renderAll(); window.__sync=(S.maxHp===calcMaxHp(S));`,ctx);
assert(vm.runInContext('window.__sync',ctx),'力量成长后 maxHp 同步');
// T3 旧档死亡不再崩溃
vm.runInContext(`
  S={name:'旧档',attrs:{str:5,agi:5,int:5,cha:5,wil:5},root:30,luck:30,realm:0,cult:50,hp:100,maxHp:100,stones:10,items:[],arts:[],mats:{},weapon:null,armor:null,trinket:null,sect:null,contrib:0,prof:null,profLevel:0,profExp:0,npcs:[],daoPartner:null,master:null,enemy:null,quests:{},merit:0,karma:0,pet:null,titles:[],seenE:{},seenI:{},wins:0,heartTrains:0,heartDemons:0,kills:0,age:16,years:0,days:0,pillBuff:0,temp:{break:0},flag:{}};
  window.__err=''; try{ die('测试死亡'); }catch(e){ window.__err=e.message; }
`,ctx);
assert(vm.runInContext('window.__err===""',ctx),'旧档死亡结算不崩溃');
// T4 切磋败而不死
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.attrs={str:1,agi:1,int:5,cha:5,wil:5}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  S.npcs=[{name:'强者',role:'散修',desc:'',style:'str',favor:30,realm:5,atk:99,hp:500}]; S.flag={}; PENDING=0;
  npcDuel(0);
`,ctx);
clickChoice(0);
vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
assert(vm.runInContext('S.hp===1&&S.deaths===0',ctx),'切磋败北重伤不死亡');
assert(vm.runInContext('document.getElementById("ending").style.display',ctx)!=='flex','切磋败北未触发身陨');
// T5 试炼塔败而不死
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext('document.getElementById("ending").style.display="none"; window._battleResolve=null;',ctx);
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.attrs={str:1,agi:1,int:5,cha:5,wil:5}; S.weapon=null; S.armor=null; S.trinket=null; S.maxHp=calcMaxHp(S); S.hp=Math.max(1,Math.floor(S.maxHp*0.2));
  S.flag={}; S.realm=2; S.flag.tower=0; PENDING=0; doTower();
`,ctx);
clickChoice(0);
vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
assert(vm.runInContext('S.hp===1&&S.flag.tower===0',ctx),'试炼塔败北重伤不死亡不涨层');
// T6 拍卖行无坊市同款
const auc=vm.runInContext(`AUCTION_POOL.map(x=>x.name).join('|')`,ctx);
assert(auc.indexOf('筑基丹')<0&&auc.indexOf('洗髓丹')<0&&auc.indexOf('破境丹')<0&&auc.indexOf('延寿丹')<0,'拍卖行不再卖坊市同款');
// T7 新珍品服用
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); const c0=S.cult; S.items.push({name:'千年灵乳',type:'consumable',quality:3,use:'essence'}); PENDING=0; consume(S.items.length-1); window.__g=S.cult-c0;`,ctx);
assert(vm.runInContext('window.__g>=500',ctx),'千年灵乳修为 +500~1000');
vm.runInContext(`S.flag={insights:0}; S.arts=[{name:'基础吐纳诀',mult:1.0}]; S.items.push({name:'无字天书',type:'consumable',quality:4,use:'art'}); consume(S.items.length-1); window.__arts=S.arts.length;`,ctx);
assert(vm.runInContext('window.__arts>=2',ctx),'无字天书习得功法');
vm.runInContext(`S.root=50; S.items.push({name:'洗灵露',type:'consumable',quality:2,use:'root3'}); consume(S.items.length-1); window.__root=S.root;`,ctx);
assert(vm.runInContext('window.__root===53',ctx),'洗灵露灵根 +3');
// T8 面板按钮 PENDING 锁（虚拟 DOM 用 createElement 造按钮，updatePendingUI 应使其禁用/恢复）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; panelRest(); PENDING=1; updatePendingUI();`,ctx);
vm.runInContext(`document.getElementById('panelBody').children.push(document.createElement('button')); document.querySelectorAll=function(q){return q.indexOf('panelBody')>=0?document.getElementById('panelBody').children:[]};`,ctx);
vm.runInContext(`const btn=document.getElementById('panelBody').children[0]; btn.disabled=false; PENDING=1; updatePendingUI(); window.__disabled=btn.disabled; PENDING=0; updatePendingUI(); window.__enabled=!btn.disabled;`,ctx);
assert(vm.runInContext('window.__disabled===true&&window.__enabled===true',ctx),'面板按钮随 PENDING 锁定/解锁');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);