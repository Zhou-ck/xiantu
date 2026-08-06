/* 深化 Phase 1/2 冒烟：角色档案/卡面 / 存档迁移 / 瓶颈 / 突破感悟 / 修炼档案与熟练度 */
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

// ---- T1 档案建模：profile 与 renderAll 数值一致
vm.runInContext(`
  const bg=BACKGROUNDS.find(b=>b.id==='villager');
  S=newState('测试甲',bg);
`,ctx);
assert(vm.runInContext('characterProfile(S).attrs.str.total',ctx)===vm.runInContext('attrVal(S,"str")',ctx),'档案力量与 attrVal 一致');
assert(vm.runInContext('characterProfile(S).attrs.wil.total',ctx)===vm.runInContext('effWil(S)',ctx),'档案心性与 effWil 一致');
assert(vm.runInContext('characterProfile(S).combat.atk',ctx)===vm.runInContext('atkBonus(S)',ctx),'档案攻势与 atkBonus 一致');
assert(vm.runInContext('characterProfile(S).arts[0].mlv',ctx)===0,'新功法熟练度默认 0 级');
assert(vm.runInContext('characterProfile(S).identity.realm',ctx)==='炼气一层','档案境界名正确');

// ---- T2 角色卡生成（主角 + NPC）
const name=vm.runInContext('S.name',ctx);
const card=vm.runInContext('characterCardHtml(S)',ctx);
assert(card.indexOf('undefined')<0&&card.indexOf('NaN')<0,'主角卡无 undefined/NaN');
assert(card.indexOf(name)>=0,'主角卡含姓名');
assert(card.indexOf('六维')>=0&&card.indexOf('灵根')>=0,'主角卡含六维与灵根区块');
assert(card.indexOf('战力构成')>=0,'主角卡含战力构成');
const nname=vm.runInContext('S.npcs[0].name',ctx);
const ncard=vm.runInContext('characterCardHtml(S.npcs[0],{npc:true})',ctx);
assert(ncard.indexOf(nname)>=0,'NPC 卡含姓名');
assert(ncard.indexOf('undefined')<0&&ncard.indexOf('NaN')<0,'NPC 卡无 undefined/NaN');

// ---- T3 旧档迁移：insight / 功法熟练度 / 闭关档案
vm.runInContext(`
  const old={name:'旧档',bg:{id:'villager',name:'放牛少年',mods:{},traits:[],art:{name:'旧功法',mult:1.0},stones:80},attrs:{str:1,agi:1,int:1,cha:1,wil:1},root:50,rootElem:'fire',realm:0,cult:0,hp:100,maxHp:100,stones:0,items:[],arts:[{name:'旧功法',mult:1.0}],mats:{},weapon:null,armor:null,trinket:null,sect:null,npcs:[],daoPartner:null,flag:{},years:0,days:0,age:16,mood:60,temp:{break:0},wis:0,trail:0};
  localStorage.setItem('xiantu_save_0',JSON.stringify(old));
  SLOT=0;
  S=load();
`,ctx);
assert(vm.runInContext('S.insight',ctx)===0,'旧档迁移 insight=0');
assert(vm.runInContext('S.arts[0].mastery',ctx)===0,'旧档迁移功法熟练度=0');
assert(Array.isArray(vm.runInContext('S.flag.cultLog',ctx)),'旧档迁移闭关档案=[]');
assert(vm.runInContext('S.version',ctx)===2,'旧档迁移版本号=2');

// ---- T4 瓶颈深化：触发 → 双达标解除 → 演出
vm.runInContext(`
  S.realm=8; S.cult=950; S.wis=0; S.trail=0; S.flag.bnActive=false;
`,ctx);
assert(vm.runInContext('bottleneckInfo(S).active',ctx)===true,'修为95%触发瓶颈');
assert(Math.abs(vm.runInContext('bottleneckMult(S)',ctx)-0.6)<1e-9,'瓶颈效率 ×0.6');
assert(vm.runInContext('bottleneckInfo(S).missingWis',ctx)===12,'瓶颈提示缺悟性');
vm.runInContext('addWis(20); addTrail(20);',ctx);
assert(vm.runInContext('bottleneckInfo(S).active',ctx)===false,'悟性历练双达标后瓶颈解除');
assert(Math.abs(vm.runInContext('bottleneckMult(S)',ctx)-1)<1e-9,'解除后效率恢复 ×1');
assert(vm.runInContext('$("story").innerHTML.indexOf("瓶颈已破")>=0',ctx),'瓶颈解除有演出文案');

// ---- T5 小境界突破成功 + 突破后修为重算
vm.runInContext(`
  S.realm=0; S.cult=300; S.arts=[{name:'基础吐纳诀',mult:1.0,level:1,mastery:0}]; S.stones=0; PENDING=0; S.flag.cultLog=[];
  tryBreak();
`,ctx);
assert(vm.runInContext('S.realm',ctx)===3,'小境界连破至炼气四层');
assert(vm.runInContext('S.cult',ctx)===0,'突破后修为重算（扣除门槛、不累加）');
assert(vm.runInContext('S.wis',ctx)>=1,'突破增加悟性');
assert(vm.runInContext('$("story").innerHTML.indexOf("境界质变")>=0',ctx),'小境界突破有质变对比');

// ---- T6 渡劫感悟：失败保留部分修为并转化为感悟
vm.runInContext(`
  S.cult=2000; S.insight=0; S.stones=0; S.flag.tribSave=null; S.items=[]; PENDING=0;
  applyBreakFail(300,{r:1,mod:0,t:1,dc:20},false);
`,ctx);
assert(vm.runInContext('S.cult',ctx)===1700,'突破失败保留部分修为（仅扣 300）');
assert(vm.runInContext('S.insight',ctx)===Math.max(1,Math.floor(300/80)),'失败转化为渡劫感悟');

// ---- T7 修炼档案 + 功法熟练度成长
vm.runInContext(`
  S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; S.hp=S.maxHp; PENDING=0; S.flag.cultLog=[];
  doCultivate(30,'quiet');
`,ctx);
assert(vm.runInContext('S.flag.cultLog.length',ctx)===1,'闭关记录写入档案');
assert(vm.runInContext('S.flag.cultLog[0].days',ctx)===30,'档案记录闭关时长');
assert(vm.runInContext('S.arts[0].mastery',ctx)>=90,'闭关积累功法熟练度');
assert(vm.runInContext('S.flag.cultDaysTotal',ctx)===30,'闭关总日数统计');

// ---- T8 突破筹备清单
const prep=vm.runInContext(`
  S.realm=8; S.cult=1000; S.wis=20; S.trail=20;
  breakPrepHtml(9)
`,ctx);
assert(prep&&prep.indexOf('突破筹备')>=0,'突破筹备清单生成');
assert(prep.indexOf('✅')>=0,'清单含达标项');
assert(prep.indexOf('❌')>=0,'清单提示缺口项');

console.log(fails===0?'smoke24: ALL PASS':'smoke24 FAILS: '+fails);
process.exit(fails?1:0);
