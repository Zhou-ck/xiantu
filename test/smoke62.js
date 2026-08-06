/* v43/v44 经济与副业冒烟：材料闭环 / 专精分流 / 洞府装饰 / 宗门捐资 / 执念结算 */
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

// T1 材料闭环表：全部 8 类材料有 产出/流通/出口
vm.runInContext(`window.__mats=Object.keys(MAT_NAMES); window.__missing=Object.keys(MAT_NAMES).filter(k=>!MATERIAL_ECONOMY[k]||!MATERIAL_ECONOMY[k].in||!MATERIAL_ECONOMY[k].out);`,ctx);
assert(vm.runInContext('window.__missing.length===0',ctx),'8 类材料均有产出→流通→出口闭环（缺：'+vm.runInContext('window.__missing.join(",")',ctx)+'）');

// T2 副业专精分流
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.prof='alchemy'; window.__sp1=craftSpecialty();
  S.prof='forge'; window.__sp2=craftSpecialty();
  S.prof='talisman'; window.__sp3=craftSpecialty();
  S.prof='array'; window.__sp4=craftSpecialty();
`,ctx);
assert(vm.runInContext('window.__sp1.double>0&&window.__sp2.pityCap===3&&window.__sp3.refund>0.5&&window.__sp4.insight>0',ctx),'四艺专精加成各不同（双份/保底/返材/顿悟）');

// T3 洞府装饰：购买出口 + 永久加成
vm.runInContext(`
  S.flag.decor=[]; S.stones=3000; S.spirit=30;
  buyDecor('pingfeng'); window.__decor1=S.flag.decor; window.__stones1=S.stones;
  window.__db=decorBonus();
`,ctx);
assert(vm.runInContext('window.__decor1.indexOf("pingfeng")>=0&&window.__stones1===2200',ctx),'购置云纹屏风扣除 800 灵石');
assert(vm.runInContext('window.__db.spirit===5',ctx),'屏风永久提升真元上限 +5');

// T4 宗门捐资：灵石 → 贡献值
vm.runInContext(`
  S.stones=1000; S.sect={name:'剑宗',id:'sword',dark:false}; S.contribVal=0; S.flag.donateCount=0;
  donateSect();
  window.__st=S.stones; window.__cv=S.contribVal;
`,ctx);
assert(vm.runInContext('window.__st===500&&window.__cv===25',ctx),'捐资 500 灵石换贡献值 +25');

// T5 前世执念判定与道途统计入口
vm.runInContext(`
  S.flag.karmaGoal='kill'; S.kills=120; window.__met=karmaGoalMet();
  S.flag.karmaGoal='merit'; S.merit=10; window.__unmet=karmaGoalMet();
  S.quest={main:{ch:0,step:0,done:[],chDone:['ch0'],log:[]},side:{sq_pomiao:'done'},sideStep:{},sideDone:{}};
  S.flag.flowChoice='sword';
  PENDING=0; daoPathPage(); window.__path=document.getElementById('panelBody')._html;
`,ctx);
assert(vm.runInContext('window.__met===true&&window.__unmet===false',ctx),'执念达成/未达成判定正确');
assert(vm.runInContext('window.__path.indexOf("前世执念")>=0&&window.__path.indexOf("道途统计")>=0',ctx),'道途页展示前世执念与道途统计');

// T6 心境调控卡渲染
vm.runInContext(`
  S.mood=40; S.items.push({name:'安神香',type:'consumable',quality:1,use:'mood'});
  PENDING=0; panelCult(); window.__cult=document.getElementById('panelBody')._html;
`,ctx);
assert(vm.runInContext('window.__cult.indexOf("心境调控")>=0&&window.__cult.indexOf("焚安神香")>=0',ctx),'修炼面板展示心境调控卡与快捷按钮');

console.log(fails===0?'smoke62: ALL PASS':'smoke62 FAILS: '+fails);
process.exit(fails?1:0);
