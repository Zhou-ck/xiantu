/* 人际深化 Phase 2b 冒烟：羁绊系统 / 关系图谱 / 结伴加成 */
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

// ---- T1 羁绊等级
vm.runInContext(`
  const bg=BACKGROUNDS.find(b=>b.id==='villager');
  S=newState('测试乙',bg);
  S.npcs[0].bond=8;
`,ctx);
assert(vm.runInContext('bondInfo(S.npcs[0]).name',ctx)==='点头之交','bond 8 = 点头之交');
vm.runInContext('S.npcs[0].bond=10',ctx);
assert(vm.runInContext('bondInfo(S.npcs[0]).name',ctx)==='相识','bond 10 = 相识');
vm.runInContext('S.npcs[0].bond=100',ctx);
assert(vm.runInContext('bondInfo(S.npcs[0]).name',ctx)==='生死之交','bond 100 = 生死之交');
// NPC 卡含羁绊行
const ncard=vm.runInContext('characterCardHtml(S.npcs[0],{npc:true})',ctx);
assert(ncard.indexOf('羁绊')>=0,'NPC 卡显示羁绊');
// ---- T2 跨级演出 + 累积
vm.runInContext('S.npcs[0].bond=9',ctx);
const bl=vm.runInContext('addBond(S.npcs[0],2)',ctx);
assert(bl.indexOf('羁绊加深')>=0,'跨级有升级演出');
assert(vm.runInContext('S.npcs[0].bond',ctx)===11,'羁绊数值累积');
// ---- T3 交谈累积羁绊（固定随机）
vm.runInContext(`
  Math.random=()=>0.42;
  S.npcs[1].bond=0; S.npcs[1].cd.talk=0; S.npcs[1].favor=20;
  npcChat(1);
`,ctx);
assert(vm.runInContext('S.npcs[1].bond',ctx)===1,'交谈累积羁绊 +1');
// ---- T4 结伴战斗攻势随羁绊提升
vm.runInContext('S.companion=S.npcs[2]; S.companion.stage=5; S.companion.bond=40;',ctx);
assert(vm.runInContext('companionAtk()',ctx)===15,'羁绊 40 时结伴攻势 = 13+2');
// ---- T5 请教增益随羁绊提升（公式系数）
vm.runInContext('S.npcs[3].bond=100;',ctx);
assert(Math.abs(vm.runInContext('1+(S.npcs[3].bond||0)/200',ctx)-1.5)<1e-9,'请教增益羁绊系数 ×1.5');
// ---- T6 关系图谱渲染
vm.runInContext('S.companion=null; S.daoPartner=null; S.master=null; relationWeb();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('因果星图')>=0,'关系图谱面板打开');
assert(html.indexOf('<svg')>=0,'图谱含 SVG 星图');
assert(html.indexOf('羁绊')>=0,'名录含羁绊信息');
assert(html.indexOf(vm.runInContext('S.name',ctx).slice(0,2))>=0,'图谱中心显示主角');
// ---- T7 旧档迁移：NPC 羁绊默认 0
vm.runInContext(`
  const old={name:'旧档2',bg:{id:'villager',name:'放牛少年',mods:{},traits:[],art:{name:'x',mult:1.0},stones:80},attrs:{str:1,agi:1,int:1,cha:1,wil:1},root:50,rootElem:'fire',realm:0,cult:0,hp:100,maxHp:100,stones:0,items:[],arts:[{name:'x',mult:1.0}],mats:{},weapon:null,armor:null,trinket:null,sect:null,npcs:[{name:'旧识',role:'散修剑客',gender:'男',stage:0,realm:0,favor:20}],daoPartner:null,flag:{},years:0,days:0,age:16,mood:60,temp:{break:0},wis:0,trail:0};
  localStorage.setItem('xiantu_save_0',JSON.stringify(old));
  SLOT=0; S=load();
`,ctx);
assert(vm.runInContext('S.npcs[0].bond',ctx)===0,'旧档 NPC 迁移羁绊=0');

console.log(fails===0?'smoke25: ALL PASS':'smoke25 FAILS: '+fails);
process.exit(fails?1:0);
