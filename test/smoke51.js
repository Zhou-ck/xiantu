/* 问题4 战斗深化冒烟：4a 战前五行克制预览 / 4b 10 回合加时赛（伤害 ×1.2，15 回合封顶平局） */
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
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
function story(){return vm.runInContext('document.getElementById("story").innerHTML',ctx)}

// ---- T1 五行克制预览：金克木（武器带五行 + 敌人带五行）
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.weapon={name:'庚金剑',type:'weapon',bonus:4,elem:'metal'};
  S.arts=[{name:'太乙剑诀',elem:'metal',mult:1.2}];
  PENDING=0; startCombat({name:'木妖',atk:1,def:0,hp:30,elem:'wood'});
`,ctx);
assert(story().indexOf('五行窥探')>=0,'战前日志出现五行窥探');
assert(story().indexOf('我克敌方')>=0&&story().indexOf('伤害 ×1.25')>=0,'金克木 → 我克敌方（伤害 ×1.25）');
// ---- T2 被克：火克金
vm.runInContext(`PENDING=0; startCombat({name:'火魈',atk:1,def:0,hp:30,elem:'fire'});`,ctx);
assert(story().indexOf('我受克制')>=0,'火克金 → 我受克制');
// ---- T3 无克制：水与金不相克
vm.runInContext(`PENDING=0; startCombat({name:'水灵',atk:1,def:0,hp:30,elem:'water'});`,ctx);
assert(story().indexOf('无克制')>=0,'水与金 → 无克制');
// ---- T4 敌人无五行 → 属性未知
vm.runInContext(`PENDING=0; startCombat({name:'无名兽',atk:1,def:0,hp:30});`,ctx);
assert(story().indexOf('属性未知')>=0,'敌人缺失五行显示属性未知');
// ---- T5 加时赛获胜：高血量持久战 13 回合（第 11-15 伤害 ×1.2）取胜
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.attrs={str:3,agi:3,int:3,cha:3,wil:3};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.flag={};
  S.arts=[]; S.weapon=null; S.armor=null; S.pet=null; S.companion=null;
  window.__res=null;
  {const m=Math.random; Math.random=()=>0.5;
   battle({name:'木人桩',atk:-20,def:0,hp:150},r=>{window.__res=r},true);
   Math.random=m;}
  window._battleResolve&&window._battleResolve();
`,ctx);
const res5=vm.runInContext('window.__res',ctx);
assert(res5&&res5.win===true,'高血量对局在加时赛获胜');
assert(res5&&res5.st.rounds>=11&&res5.st.rounds<=15,'胜场回合落在加时赛区间（第 '+res5.st.rounds+' 回合）');
assert(vm.runInContext('document.getElementById("battleLog").innerHTML.indexOf("加时赛")>=0',ctx),'战斗日志标注加时赛');
// ---- T6 加时赛封顶平局：15 回合仍不胜 → 平局
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.attrs={str:3,agi:3,int:3,cha:3,wil:3};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.flag={};
  S.arts=[]; S.weapon=null; S.armor=null; S.pet=null; S.companion=null;
  window.__res=null;
  {const m=Math.random; Math.random=()=>0.5;
   battle({name:'铁桶',atk:-20,def:0,hp:1000},r=>{window.__res=r},true);
   Math.random=m;}
  window._battleResolve&&window._battleResolve();
`,ctx);
const res6=vm.runInContext('window.__res',ctx);
assert(res6&&res6.draw===true,'加时赛 5 回合仍不胜 → 平局');
assert(res6&&res6.st.rounds===15,'平局时回合数封顶第 15 回合');
// ---- T7 试炼塔敌人已带五行 → 预览非属性未知
vm.runInContext(`document.getElementById('story').innerHTML='';`,ctx);
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.realm=2; S.flag={tower:0}; PENDING=0; doTower();
`,ctx);
assert(story().indexOf('五行窥探')>=0&&story().indexOf('属性未知')<0,'试炼塔敌人带五行，预览非属性未知');
// ---- T8 makeEnemy 带五行（野怪遭遇预览可用）
assert(vm.runInContext(`['metal','wood','water','fire','earth'].indexOf(makeEnemy().elem)>=0`,ctx)===true,'makeEnemy 带五行属性');

console.log(fails===0?'smoke51: ALL PASS':'smoke51 FAILS: '+fails);
process.exit(fails?1:0);
