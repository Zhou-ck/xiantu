/* 防刷修复冒烟：月俸周期 / 宗门任务消耗 / 祈福冷却 / 门中事宜冷却 / 道侣冷却递减 */
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

// ---- T1 月俸 30 日周期
vm.runInContext(`
  S=newState('测试亥',BACKGROUNDS[0]);
  S.sect={id:'sword',name:'剑宗',dark:false}; S.sectStage='outer'; S.rank=1; S.days=100; S.stones=0;
  sectSalary();
`,ctx);
assert(vm.runInContext('S.stones',ctx)===80,'首次领取月俸 +80');
assert(vm.runInContext('S.flag.salaryLast',ctx)===100,'记录领取日');
vm.runInContext('const s0=S.stones; sectSalary(); window.__s0=s0;',ctx);
assert(vm.runInContext('S.stones',ctx)===vm.runInContext('window.__s0',ctx),'未满 30 日不可重复领取');
assert(vm.runInContext('document.getElementById("story").innerHTML.indexOf("距下次发放")>=0',ctx)===true,'提示距下次发放天数');
vm.runInContext('S.days=130; const s1=S.stones; sectSalary(); window.__s1=s1;',ctx);
assert(vm.runInContext('S.stones',ctx)===vm.runInContext('window.__s1',ctx)+80,'满 30 日可再次领取');
// ---- T2 宗门任务消耗：同一任务不能无限重复接
vm.runInContext(`
  S.tasks=[{name:'跑腿送信',kind:'run',cost:3,point:4,val:12,stones:20}];
  PENDING=0; window.__t0=S.tasks[0]; doTask(0);
`,ctx);
assert(vm.runInContext('S.tasks.length',ctx)===3,'任务完成后刷新新一批（3 个）');
assert(vm.runInContext('S.tasks.indexOf(window.__t0)<0',ctx)===true,'旧任务对象已移除');
// ---- T3 宗门祈福冷却（防无限刷寿元）
vm.runInContext('S.stones=1000; S.flag.blessCd=0; S.lifeBonus=0; sectBless();',ctx);
assert(vm.runInContext('S.flag.blessCd>0',ctx)===true,'祈福进入冷却（含当日扣减）');
vm.runInContext('S.stones=1000; sectBless();',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.indexOf("香火有定")>=0',ctx)===true,'冷却期祈福被拦截');
vm.runInContext('S.days=150; passTime(7); sectBless();',ctx);
assert(vm.runInContext('S.stones',ctx)===800,'冷却结束后可再次祈福（-200）');
// ---- T4 门中事宜冷却随时间递减
vm.runInContext('S.flag.sectEventCd=10; S.days=200; passTime(10);',ctx);
assert(vm.runInContext('S.flag.sectEventCd',ctx)===0,'门中事宜冷却随光阴递减');
// ---- T5 道侣冷却递减（存档分裂对象也生效）
vm.runInContext(`
  S.daoPartner={name:'苏婉',gender:'女',cd:{date:10}};
  S.npcs=[];
  S.days=300; passTime(5);
`,ctx);
assert(vm.runInContext('S.daoPartner.cd.date',ctx)===5,'道侣约会冷却随光阴递减');
// ---- T6 魔道/幽冥敌人（dark 灵根不在 ELEMS）战斗不崩溃
vm.runInContext(`
  S=newState('测试子',BACKGROUNDS[0]);
  S.attrs={str:40,agi:40,int:40,cha:40,wil:40}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  PENDING=0; startCombat({name:'魔道斥候',atk:1,def:0,hp:30,elem:'dark',style:'rapid'});
`,ctx);
let clickedDark=false;
(function walk(el){if(!el||!el.children)return;for(const c of el.children){if(String(c.className||'').indexOf('choices')>=0&&c.children&&c.children.length){c.children[0].onclick&&c.children[0].onclick();clickedDark=true}walk(c);}})(ids['story']);
assert(vm.runInContext('typeof window._battleResolve==="function"',ctx)===true,'dark 灵根战斗正常开始');
vm.runInContext('{ const r=window._battleResolve; window._battleResolve=null; if(r)r(); }',ctx);
assert(vm.runInContext('S.deaths',ctx)===0&&vm.runInContext('S.wins',ctx)>=1,'dark 灵根战斗获胜且不崩溃');

console.log(fails===0?'smoke45: ALL PASS':'smoke45 FAILS: '+fails);
process.exit(fails?1:0);
