/* 战斗深化 Phase 2e 冒烟：战技参悟（战意累积 / 点化 / 冷却 / 面板 / 迁移） */
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

// ---- T1 默认战技状态
vm.runInContext(`S=newState('测试戊',BACKGROUNDS[0]);`,ctx);
assert(vm.runInContext('techPts()',ctx)===0,'默认战意 0');
assert(vm.runInContext('techLevel("agg")',ctx)===0,'默认破军诀 0 级');
assert(vm.runInContext('skillCd()',ctx)===3,'默认技能冷却 3 回合');
// ---- T2 战斗胜利获得战意
vm.runInContext(`
  S.attrs={str:40,agi:20,int:10,cha:10,wil:10};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  S.arts=[{name:'炎阳诀',mult:1.2,elem:'fire'}]; S.weapon=null; S.items=[];
  battle({name:'靶子',atk:-20,def:0,hp:100});
`,ctx);
assert(vm.runInContext('S.flag.tech.pts',ctx)===1,'胜利获得战意 +1');
// ---- T3 参悟与不足拦截
vm.runInContext('S.flag.tech.pts=5; learnTech("agg");',ctx);
assert(vm.runInContext('S.flag.tech.pts',ctx)===4,'参悟扣除战意');
assert(vm.runInContext('techLevel("agg")',ctx)===1,'破军诀升至 1 级');
assert(Math.abs(vm.runInContext('1+0.05*techLevel("agg")',ctx)-1.05)<1e-9,'伤害加成 ×1.05');
vm.runInContext('S.flag.tech.pts=2; learnTech("agg");',ctx);
assert(vm.runInContext('techLevel("agg")',ctx)===2,'二次参悟（cost 2）');
vm.runInContext('S.flag.tech.pts=0; learnTech("agg");',ctx);
assert(vm.runInContext('techLevel("agg")',ctx)===2,'战意不足拦截（不升级）');
// ---- T4 百战通神缩短冷却
vm.runInContext('S.flag.tech.ups.skl=2;',ctx);
assert(vm.runInContext('skillCd()',ctx)===2,'百战通神后冷却 2 回合');
// ---- T5 战技面板
vm.runInContext('S.flag.tech.ups.skl=0; panelBattleArts();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('战技参悟')>=0||vm.runInContext('document.getElementById("panelTitle").textContent',ctx).indexOf('战技参悟')>=0,'战技面板打开');
assert(html.indexOf('破军诀')>=0&&html.indexOf('游龙身法')>=0,'面板列出全部战技');
assert(html.indexOf('战意')>=0,'面板显示战意');
// ---- T6 带战技再战不崩溃、战意继续累积
vm.runInContext(`
  S.hp=S.maxHp; S.flag.combatBuff=0; PENDING=0;
  battle({name:'靶子2',atk:-20,def:0,hp:100});
`,ctx);
assert(vm.runInContext('S.flag.tech.pts',ctx)===1,'再次获胜战意累积（0→1）');
// ---- T7 旧档迁移：战技默认
vm.runInContext(`
  const old={name:'旧档4',bg:{id:'villager',name:'放牛少年',mods:{},traits:[],art:{name:'x',mult:1.0},stones:80},attrs:{str:1,agi:1,int:1,cha:1,wil:1},root:50,rootElem:'fire',realm:0,cult:0,hp:100,maxHp:100,stones:0,items:[],arts:[{name:'x',mult:1.0}],mats:{},weapon:null,armor:null,trinket:null,sect:null,npcs:[],daoPartner:null,flag:{},years:0,days:0,age:16,mood:60,temp:{break:0},wis:0,trail:0};
  localStorage.setItem('xiantu_save_0',JSON.stringify(old));
  SLOT=0; S=load();
`,ctx);
assert(vm.runInContext('S.flag.tech.pts',ctx)===0&&vm.runInContext('typeof S.flag.tech.ups==="object"',ctx)===true,'旧档迁移战技默认');

console.log(fails===0?'smoke28: ALL PASS':'smoke28 FAILS: '+fails);
process.exit(fails?1:0);
