/* v55 修行深化冒烟 1：法门收益 / 灵浊阈值 / 道基加成 / 闭关结算 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:20,agi:20,int:30,cha:20,wil:35}; S.root=60; S.realm=5; S.flag={}; S.flag.npcVisitCd=100; S.flag.teaCd=100; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;`,ctx);
// T1 法门数据与倍率
assert(vm.runInContext('CULT_METHODS.length>=4&&cultMethod("body").mult===1.3&&cultMethod("war").needTech===2&&cultMethod("wen").cost===30',ctx),'四种法门数据齐全（以体×1.3/以战耗战意2/以文耗灵石30）');
// T2 灵浊阈值惩罚
vm.runInContext(`S.flag.impurity=0; window.__m0=cultMult(S); S.flag.impurity=30; window.__p30=impurityCultPenalty(S); window.__hp0=calcMaxHp(S); S.flag.impurity=60; window.__p60=impurityCultPenalty(S); window.__hp1=calcMaxHp(S);`,ctx);
assert(vm.runInContext('window.__p30===0.95&&window.__p60===0.9',ctx),'灵浊 30/60 档修炼效率 -5%/-10%');
assert(vm.runInContext('window.__hp1<window.__hp0',ctx),'灵浊 ≥60 气血上限 -10%');
// T3 道基：上限/突破加成/战力
vm.runInContext(`S.flag.impurity=0; S.flag.daoBase=5; window.__cap=daoBaseCap(S); window.__b50=daoBaseBreakBonus(S); S.flag.daoBase=2; window.__bLow=daoBaseBreakBonus(S); S.flag.daoBase=8; window.__combat=daoBaseCombat(S);`,ctx);
assert(vm.runInContext('window.__cap===10&&window.__b50===1&&window.__bLow===-1&&window.__combat>=8',ctx),'道基≥50%突破+1 / <30% -1 / 同境界战力随道基');
// T4 闭关结算：以体炼气 → 修为+灵浊+道基；以文入道 → 产手札
vm.runInContext(`S.flag.daoBase=0; S.flag.impurity=0; _cult={method:cultMethod('body'),scene:cultScene('cave')}; window.__r=_cultResult(30,'quiet',true); window.__imp=S.flag.impurity; window.__dao=S.flag.daoBase;`,ctx);
assert(vm.runInContext('window.__r.gain>0&&window.__imp===10&&window.__dao===1',ctx),'以体炼气：收益生效 + 灵浊+10 + 道基+1');
vm.runInContext(`S.flag.daoBase=0; _cult={method:cultMethod('wen'),scene:cultScene('cave')}; _cultResult(30,'quiet',true); window.__book=S.items.some(x=>x.name==='修行手札');`,ctx);
assert(vm.runInContext('window.__book',ctx),'以文入道产出「修行手札」');
// T5 迁移默认：缺字段按 0/qi/cave 兜底
vm.runInContext(`S.flag={}; window.__d={dao:daoBaseCap(S),b:daoBaseBreakBonus(S),m:cultMethod('x').id,s:cultScene('x').id};`,ctx);
assert(vm.runInContext('window.__d.b===-1&&window.__d.m==="qi"&&window.__d.s==="cave"',ctx),'缺字段兜底：道基 0（突破 -1）、法门 qi、场景 cave');

console.log(fails===0?'smoke78: ALL PASS':'smoke78 FAILS: '+fails);
process.exit(fails?1:0);
