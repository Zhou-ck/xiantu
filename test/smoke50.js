/* 问题 9 负反馈透明化冒烟：修炼面板当前收益倍率 / 苦修走火概率 / 心魔历练与心魔试炼风险标注 */
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
// T1 苦修走火概率公式：22% 基础，本季忧思签 +8%
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; window.__bc=bitterFireChance();`,ctx);
assert(Math.abs(vm.runInContext('window.__bc',ctx)-0.22)<1e-9,'苦修走火基础概率 22%');
vm.runInContext(`S.flag.sign={season:seasonOf(),k:'sorrow',demon:1}; window.__bc2=bitterFireChance();`,ctx);
assert(Math.abs(vm.runInContext('window.__bc2',ctx)-0.30)<1e-9,'忧思签期间走火概率升至 30%');
// T2 cultMultDisplay 与 cultMult 一致（两位小数）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.root=50; S.days=0; S.cultStreak=0; S.arts=[{name:'基础吐纳诀',mult:1.0}]; S.daoPartner=null; S.flag={}; S.pillBuff=0; S.sect=null; S.pet=null; window.__m=cultMult(S); window.__md=cultMultDisplay();`,ctx);
assert(vm.runInContext('window.__md===window.__m.toFixed(2)',ctx),'cultMultDisplay 显示 cultMult 两位小数');
// T3 修炼面板实时显示「基准收益 ×N.NN」且与 cultMult 一致
vm.runInContext(`window.__mval=cultMultDisplay(); panelCult(); window.__ph=document.getElementById('panelBody').innerHTML;`,ctx);
const mval=vm.runInContext('window.__mval',ctx);
assert(vm.runInContext('window.__ph.indexOf("基准收益")>=0&&window.__ph.indexOf("×'+mval+'")>=0',ctx),'修炼面板显示基准收益 ×'+mval);
// T4 苦修按钮旁标注走火概率
assert(vm.runInContext('window.__ph.indexOf("走火 ≈22%")>=0',ctx),'修炼面板苦修区标注走火 ≈22%');
// T5 心魔历练入口标注致死风险（筑基后可进，realm>=9）
vm.runInContext(`S.realm=9; S.hp=S.maxHp; PENDING=0; panelCult(); window.__ph2=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__ph2.indexOf("判定大失败可致死")>=0',ctx),'修炼面板心魔历练按钮标注致死风险');
// T6 突破·心魔试炼入口标注失败后果（影子战，失败重伤不致死）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; heartTrialStart(9,16,0); window.__st=document.getElementById('story')._html;`,ctx);
assert(vm.runInContext('window.__st.indexOf("三战全败将留【心魔烙印】")>=0&&window.__st.indexOf("失败重伤，不致死")>=0',ctx),'心魔试炼入口标注失败重伤不致死');
// T7 修炼标签页：突破境界与心魔历练描述含风险提示
vm.runInContext(`S.realm=9; PENDING=0; tabHome('cult'); window.__tab=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__tab.indexOf("三战全败留烙印")>=0',ctx),'修炼标签页突破境界描述含心魔试炼风险');
assert(vm.runInContext('window.__tab.indexOf("判定大失败可致死")>=0',ctx),'修炼标签页心魔历练描述含致死风险');
console.log(fails===0?'smoke50: ALL PASS':'smoke50 FAILS: '+fails);
process.exit(fails?1:0);
