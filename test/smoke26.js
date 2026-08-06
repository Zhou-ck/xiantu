/* 副业深化 Phase 2c 冒烟：配方门槛 / 丹方手札 / 造诣加成 / 炼制记录 / 材料来源 */
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
const $=id=>ctx.document.getElementById(id);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 习得副业 + 配方门槛
vm.runInContext(`
  const bg=BACKGROUNDS.find(b=>b.id==='villager');
  S=newState('测试丙',bg);
  S.stones=1000; learnProf('alchemy');
`,ctx);
assert(vm.runInContext('S.prof',ctx)==='alchemy','习得炼丹');
assert(vm.runInContext('recipeKnown(RECIPES.alchemy[0])',ctx)===true,'入门配方已掌握');
assert(vm.runInContext('recipeKnown(RECIPES.alchemy[4])',ctx)===false,'洗髓丹需高阶造诣');
assert(vm.runInContext('RECIPES.alchemy.find(r=>r.name==="洗髓丹").lv',ctx)===5,'洗髓丹门槛 5 阶');
// ---- T2 门槛拦截：未掌握配方不可炼制且不扣材料
vm.runInContext('S.mats={sherb:5,demonCore:5}; S.stones=2000; craft(4);',ctx);
assert(vm.runInContext('S.mats.sherb',ctx)===5,'未掌握配方不消耗材料');
assert(vm.runInContext('S.stones',ctx)===2000,'未掌握配方不扣灵石');
// ---- T3 炼制成功：手札记录 + 造诣升级解锁下一阶配方
vm.runInContext(`
  Math.random=()=>0.99;
  S.attrs.int=40; S.mats={herb:10}; S.stones=1000; S.profExp=95; S.flag.craftLog={};
  craft(0);
`,ctx);
assert(vm.runInContext('S.flag.craftLog["回春丹"]&&S.flag.craftLog["回春丹"].count===1',ctx)===true,'手札记录炼制次数');
assert(vm.runInContext('S.flag.craftLog["回春丹"].best',ctx)!==null,'手札记录最佳品质');
assert(vm.runInContext('S.profLevel',ctx)===2,'造诣升级至 2 阶');
assert(vm.runInContext('recipeKnown(RECIPES.alchemy[2])',ctx)===true,'升级后解锁聚灵丹（2 阶）');
assert(vm.runInContext('S.profExp',ctx)===20,'升级后经验结转（95+25-100）');
// ---- T4 造诣判定加成
assert(vm.runInContext('S.profLevel=1; craftLvBonus()',ctx)===0,'1 阶判定加成 0');
assert(vm.runInContext('S.profLevel=3; craftLvBonus()',ctx)===2,'3 阶判定加成 +2');
assert(vm.runInContext('S.profLevel=5; craftLvBonus()',ctx)===6,'5 阶宗师判定加成 +6');
// ---- T5 手札面板 + 材料来源提示
vm.runInContext('S.profLevel=3; S.mats={herb:3,iron:2}; craftTome();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert($('panelTitle').textContent.indexOf('手札')>=0,'手札面板打开');
assert(html.indexOf('材料仓')>=0,'手札含材料仓');
assert(html.indexOf('采药')>=0,'材料来源提示存在');
assert(html.indexOf('未掌握')>=0,'手札显示未掌握配方');
// ---- T6 旧档迁移：craftLog 默认 {}
vm.runInContext(`
  const old={name:'旧档3',bg:{id:'villager',name:'放牛少年',mods:{},traits:[],art:{name:'x',mult:1.0},stones:80},attrs:{str:1,agi:1,int:1,cha:1,wil:1},root:50,rootElem:'fire',realm:0,cult:0,hp:100,maxHp:100,stones:0,items:[],arts:[{name:'x',mult:1.0}],mats:{},weapon:null,armor:null,trinket:null,sect:null,npcs:[],daoPartner:null,flag:{},years:0,days:0,age:16,mood:60,temp:{break:0},wis:0,trail:0};
  localStorage.setItem('xiantu_save_0',JSON.stringify(old));
  SLOT=0; S=load();
`,ctx);
assert(vm.runInContext('S.flag.craftLog&&typeof S.flag.craftLog==="object"',ctx)===true,'旧档迁移 craftLog={}');

console.log(fails===0?'smoke26: ALL PASS':'smoke26 FAILS: '+fails);
process.exit(fails?1:0);
