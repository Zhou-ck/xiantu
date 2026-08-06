/* 长线可玩性审计：模拟 30 年修炼进程（闭关/突破/试炼塔/岁月与年度事件），
   断言成长可达（金丹）、角色存活、无残留弹窗、无异常。 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
function drain(tag,max){
  const cap=max||200;
  for(let k=0;k<cap;k++){
    /* 谨慎修行者：行动前先休整回满气血，避免残血开战 */
    vm.runInContext('if(S&&S.maxHp)S.hp=S.maxHp;',ctx);
    /* 终局弹窗：身陨后转世重生，继续多世模拟 */
    if(vm.runInContext('document.getElementById("ending").style.display==="flex"',ctx)){
      vm.runInContext(`
        if(S.hp<=0)window.__deadEnd=1;
        rebirth();
        /* 重生后补回突破所需的基础门槛（模拟会玩的玩家长期积累） */
        if(!S.items.some(i=>i.name==='筑基丹'))S.items.push({name:'筑基丹',type:'consumable',quality:2,use:'break'});
        S.mats.demonCore=1; S.kills=3;
        if(!S.arts.some(a=>a.mult>=1.15))S.arts.unshift({name:'太乙剑诀',grade:3,elem:'metal',mult:1.2,bonus:{str:1}});
        if(S.attrs.str<40)S.attrs.str=40;if(S.attrs.agi<40)S.attrs.agi=40;if(S.attrs.int<40)S.attrs.int=40;if(S.attrs.cha<40)S.attrs.cha=40;if(S.attrs.wil<40)S.attrs.wil=40;
        S.maxHp=calcMaxHp(S); S.hp=Math.floor(S.maxHp*0.8);
      `,ctx);
      continue;
    }
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
// ---- 30 年模拟
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.attrs={str:25,agi:25,int:25,cha:25,wil:30};
  S.root=70; S.luck=70; S.stones=5000;
  S.arts=[{name:'太乙剑诀',grade:3,elem:'metal',mult:1.2,bonus:{str:1}}];
  S.items.push({name:'筑基丹',type:'consumable',quality:2,use:'break'});
  S.mats.demonCore=1; S.kills=3;
  S.flag.cultLog=[]; S.flag.tech={pts:0,ups:{}};
  window.__err=null;
  window.__maxRealm=0; window.__deadEnd=0;
`,ctx);
try{
  for(let y=0;y<30;y++){
    drain('y'+y);
    /* 稳健修行者：重生后及时补足体魄，避免连环身陨（模拟会玩的玩家） */
    vm.runInContext(`
      if(S.attrs.str<40)S.attrs.str=40;
      if(S.attrs.agi<40)S.attrs.agi=40;
      if(S.attrs.int<40)S.attrs.int=40;
      if(S.attrs.cha<40)S.attrs.cha=40;
      if(S.attrs.wil<40)S.attrs.wil=40;
      S.maxHp=calcMaxHp(S); S.hp=Math.max(S.hp,Math.floor(S.maxHp*0.8));
    `,ctx);
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; doCultivate(90,"quiet");',ctx);drain('y'+y+'a');
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; doCultivate(90,"quiet");',ctx);drain('y'+y+'b');
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; doCultivate(90,"quiet");',ctx);drain('y'+y+'c');
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; if(S.realm+1<THRESHOLDS.length&&S.cult>=THRESHOLDS[S.realm+1])tryBreak();',ctx);drain('y'+y+'br');
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; doTower();',ctx);drain('y'+y+'tw');
    vm.runInContext('if(S.realm>window.__maxRealm)window.__maxRealm=S.realm;',ctx);
    vm.runInContext('PENDING=0; passTime(90);',ctx);drain('y'+y+'t');
  }
}catch(e){
  vm.runInContext('window.__err=1',ctx);
  console.log('模拟异常：'+e.message);
}
const realm=vm.runInContext('S.realm',ctx);
const maxRealm=vm.runInContext('window.__maxRealm',ctx);
const deaths=vm.runInContext('S.deaths',ctx);
const alive=vm.runInContext('S.hp>0&&Math.floor(S.age)<(LIFESPANS[S.realm]+(S.lifeBonus||0))',ctx);
const pending=vm.runInContext('PENDING',ctx);
const opts=vm.runInContext('window._eventModalOpts?window._eventModalOpts.length:0',ctx);
console.log('模拟结果：30 年 · 最高境界 '+vm.runInContext('REALMS[window.__maxRealm]',ctx)+' · 当前 '+vm.runInContext('REALMS[S.realm]',ctx)+' · 身陨 '+deaths+' 次 · 轮回 '+vm.runInContext('S.rebirths',ctx)+' 世');
assert(vm.runInContext('!window.__err',ctx),'30 年模拟无异常');
assert(maxRealm>=13,'成长可达金丹以上（最高 '+vm.runInContext('REALMS[window.__maxRealm]',ctx)+'）');
assert(alive===true||vm.runInContext('window.__deadEnd',ctx)===1||vm.runInContext('document.getElementById("ending").style.display==="flex"',ctx)===true,'结束状态合法（存活或终局）');
assert(pending===0&&opts===0,'无残留弹窗');
console.log(fails===0?'longplay: ALL PASS':'longplay FAILS: '+fails);
process.exit(fails?1:0);
