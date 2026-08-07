/* v98 灵兽进化分支 + 事件池冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 进化表：6 天赋 × 4 阶 × 分支
const forms=vm.runInContext('PET_FORMS',ctx);
assert(Object.keys(forms).length===6,'PET_FORMS 覆盖 6 天赋');
['combat','luck','herb','speed','alchemy','root'].forEach(t=>{
  assert(forms[t]&&forms[t].stages&&forms[t].stages.length===4,'天赋 '+t+' 4 阶进化');
  assert(forms[t].branch&&forms[t].branch.a&&forms[t].branch.b,'天赋 '+t+' 双分支');
});
assert(vm.runInContext('petFormStage({talent:"combat",form:0}).n==="战兽"',ctx),'进化阶名正确（战兽）');
assert(vm.runInContext('petFormStage({talent:"combat",form:2}).n==="兽王"',ctx),'进化阶名正确（兽王）');

// T2 事件池 ≥10 + 目录配额 + 进总量
const pe=vm.runInContext('PET_EVENTS.length',ctx);
assert(pe>=10,'PET_EVENTS ≥10（'+pe+'）');
assert(vm.runInContext('eventTotalCount()',ctx)>=920,'eventTotalCount ≥920（含 PET_EVENTS，实际 '+vm.runInContext('eventTotalCount()',ctx)+'）');

// T3 进化触发：10 级蜕变弹分支选择（PENDING 或分支窗）
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={};
  S.pet={name:'阿白',species:'灵狐',talent:'combat',level:9,exp:petLevelNeed({level:9})-1,form:1,bonus:2,faint:0};
  PENDING=0; petGain(30);
  window.__lvl=S.pet.level; window.__form=S.pet.form; window.__branch=S.pet.branch;
`,ctx);
assert(vm.runInContext('window.__lvl',ctx)===10&&vm.runInContext('window.__form',ctx)===2,'10 级蜕变 form=2');
assert(vm.runInContext('window.__branch',ctx)===undefined,'分支未选前为空');

// T4 分支效果：狂兽助战 +1 / 风兽修炼 +3% / 丹兽判定 +2
vm.runInContext(`
  S.pet.branch='kuang'; window.__cb=petCombatBonus();
  S.pet.talent='speed'; S.pet.branch=null; S.root=50; S.days=0; S.cultStreak=0; S.arts=[{name:'基础吐纳诀',mult:1.0,grade:1}]; S.daoPartner=null; S.pillBuff=0; S.sect=null; window.__mb=cultMult(S);
  S.pet.branch='feng'; window.__m0=cultMult(S);
  S.pet.branch='ling'; window.__m1=cultMult(S);
  S.pet.talent='herb'; S.pet.branch=null; window.__mb2=cultMult(S);
  S.pet.branch='feng'; window.__m2=cultMult(S);
  S.pet.talent='alchemy'; S.pet.branch='dan'; S.prof='alchemy'; window.__b0=craftBonus();
  S.pet.branch='qi'; S.prof='forge'; window.__b1=craftBonus();
  S.pet.branch='yao'; S.pet.talent='herb';
`,ctx);
const r=vm.runInContext('({cb:window.__cb,mb:window.__mb,m0:window.__m0,m1:window.__m1,mb2:window.__mb2,m2:window.__m2,b0:window.__b0,b1:window.__b1})',ctx);
assert(r.cb>=3,'狂兽助战 +1（bonus2+1=3）');
assert(Math.abs(r.m0/r.mb-1.03)<0.01,'风兽修炼 ×1.03（相对基准）');
assert(Math.abs(r.m1/r.mb-1.03)<0.01,'灵兽修炼 ×1.03（相对基准）');
assert(Math.abs(r.m2/r.mb2-1.03)<0.01,'风兽非 speed 天赋时仍 ×1.03（相对基准）');
assert(r.b0>=2&&r.b1>=2,'丹兽/器兽判定 +2');
// 药兽：探索采药分支真实逻辑（源码级断言，explore.js）
const exSrc=fs.readFileSync(path.join(__dirname,'..','js','systems','explore.js'),'utf8');
assert(exSrc.indexOf("branch==='yao'")>=0&&exSrc.indexOf('S.mats.herb=(S.mats.herb||0)+2')>=0,'explore.js 药兽采药 +2 逻辑存在');

// T5 runPetFx：exp 走 petGain
vm.runInContext(`
  S.pet={name:'阿白',species:'灵狐',talent:'combat',level:1,exp:0,form:0,bonus:1,faint:0};
  runPetFx({exp:10});
  window.__e=S.pet.exp;
`,ctx);
assert(vm.runInContext('window.__e',ctx)===10,'runPetFx exp → petGain');

console.log(fails===0?'smoke128: ALL PASS':'smoke128 FAILS: '+fails);
process.exit(fails?1:0);
