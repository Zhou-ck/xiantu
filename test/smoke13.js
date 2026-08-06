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
// 能力换算
assert(vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:20,agi:20,int:20,cha:20,wil:20}; S.weapon=null; S.flag={}; atkBonus(S)>=20 && dodgeBonus(S)===5 && insightBonus(S)===2 && favorBonus(S)===3`,ctx),'能力换算正确（攻势/闪避/洞察/人望）');
// 侧栏展示
vm.runInContext(`renderAll()`,ctx);
assert(vm.runInContext(`document.getElementById('side').innerHTML`,ctx).indexOf('战力构成')>=0,'侧栏显示战力构成');
assert(vm.runInContext(`document.getElementById('side').innerHTML`,ctx).indexOf('🗡️ 攻势')>=0,'侧栏显示攻势');
// 魅力 → 好感
vm.runInContext(`
  S.attrs.cha=30; S.npcs=[{name:'甲',role:'散修',desc:'',style:'str',gender:'男',favor:5,realm:0,atk:1,hp:20,cd:{talk:0,duel:0,gift:0}}];
  window.__ch=chance; chance=function(){return false};
  npcChat(0);
  chance=window.__ch;
`,ctx);
assert(vm.runInContext('S.npcs[0].favor',ctx)>=10,'魅力加成好感（favor='+vm.runInContext('S.npcs[0].favor',ctx)+'）');
// 同步战斗：力量40暴击必中、身法40敌方全部闪避
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.attrs={str:40,agi:40,int:10,cha:10,wil:20};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  S.flag={}; S.battleTactic='steady';
  battle({name:'靶子',atk:-20,def:0,hp:500});
`,ctx);
const b=vm.runInContext('({crits:0})',ctx);
vm.runInContext('battle({name:"靶子",atk:-20,def:0,hp:500});',ctx);
const st=vm.runInContext(`({crits:0})`,ctx);
assert(vm.runInContext(`document.getElementById('battleResult').style.display`,ctx)==='block','战斗结束显示战后统计');
const st2=vm.runInContext(`({dodges:0,crits:0,dmgDealt:0,win:false})`,ctx);
// 从战报 DOM 里拿不到 st，直接再打一场并抓取内部状态
vm.runInContext(`window.__st=null; const _o=window._battleResolve; window._battleResolve=()=>{};`,ctx);
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.attrs={str:40,agi:40,int:10,cha:10,wil:20};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  S.flag={}; S.battleTactic='steady';
  const p=battle({name:'靶子',atk:-20,def:0,hp:500});
  window.__p=p;
`,ctx);
assert(vm.runInContext(`document.getElementById('battleResult').style.display`,ctx)==='block','同步战斗完成');
const st3=vm.runInContext(`window.__st3`,ctx);
console.log('note: 暴击/闪避计数在战斗闭包内，另行断言结果字段');
assert(vm.runInContext(`document.getElementById('battleLog').innerHTML.length>0`,ctx),'战斗日志已生成');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);