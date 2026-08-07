/* v42 小阶段反馈 + 功法相生推荐冒烟：
   · 小境界精进系数随境界单调递增、大境交界归位
   · cultMult / cultMultParts / 修炼面板一致展示
   · 功法相生推荐卡片：相合/相生/相克关系正确 */
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

// T1 小境界精进系数：大境交界归位、境内递增
const vals=vm.runInContext('[smallStageMult(0),smallStageMult(8),smallStageMult(9),smallStageMult(12),smallStageMult(13),smallStageMult(40)]',ctx);
assert(Math.abs(vals[0]-1)<1e-9&&Math.abs(vals[1]-1.096)<1e-9,'炼气一层 ×1.00、炼气九层 ×1.096');
assert(Math.abs(vals[2]-1)<1e-9&&Math.abs(vals[3]-1.036)<1e-9,'筑基前期 ×1.00、筑基圆满 ×1.036');
assert(Math.abs(vals[4]-1)<1e-9&&Math.abs(vals[5]-1.036)<1e-9,'金丹前期归位、渡劫圆满 ×1.036');

// T2 cultMult 实际计入小境界系数（同大境、无新人加成时：炼气四层→炼气九层）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.root=50; S.days=0; S.cultStreak=0; S.pillBuff=0; S.sect=null; S.pet=null; S.daoPartner=null; S.flag={};
  S.realm=3; window.__m3=cultMult(S); S.realm=8; window.__m8=cultMult(S); S.realm=13; window.__m13=cultMult(S);`,ctx);
const m3=vm.runInContext('window.__m3',ctx),m8=vm.runInContext('window.__m8',ctx),m13=vm.runInContext('window.__m13',ctx);
assert(Math.abs(m8/m3-1.096/1.036)<1e-6,'cultMult 计入小境界系数（炼气四层→九层 = 1.096/1.036）');
assert(Math.abs(m13/m3-(1.7/1.0)*(1/1.036))<1e-6,'大境界交界小境界归位（金丹前期相对炼气四层仅含大境系数）');

// T3 cultMultParts 含「小境界精进」项
vm.runInContext(`S.realm=8; window.__parts=cultMultParts(S); window.__has=window.__parts.some(p=>p.n.indexOf('小境界精进')>=0); window.__part=window.__parts.find(p=>p.n.indexOf('小境界精进')>=0);`,ctx);
assert(vm.runInContext('window.__has',ctx),'cultMultParts 包含小境界精进分解项');
assert(Math.abs(vm.runInContext('window.__part.m',ctx)-1.096)<1e-9,'小境界精进分解值 = smallStageMult');

// T4 修炼面板展示小境界精进（闭关页）与功法相生卡片（v97 起在盘点页）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; S.root=50; S.days=0; panelCult(); window.__ph=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__ph.indexOf("小境界精进 ×1.00")>=0',ctx),'修炼面板展示「小境界精进 ×1.00」');
vm.runInContext(`panelCult('stats'); window.__ps=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__ps.indexOf("功法相生")>=0',ctx),'修炼面板展示功法相生卡片（盘点页）');

// T5 功法相生：同属相合 / 五行相生 / 相克
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.rootElem='fire';
  S.arts=[{name:'丹火诀',elem:'fire',mult:1.0},{name:'青木长生诀',elem:'wood',mult:1.0},{name:'玄冰诀',elem:'ice',mult:1.0}];
  window.__html=artSynergyHtml();`,ctx);
const ah=vm.runInContext('window.__html',ctx);
assert(ah.indexOf('相合')>=0,'同属功法（火）显示相合');
assert(ah.indexOf('相生')>=0,'木生火：木属功法显示相生');

console.log(fails===0?'smoke54: ALL PASS':'smoke54 FAILS: '+fails);
process.exit(fails?1:0);
