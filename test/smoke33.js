/* 真元资源系统冒烟：上限/恢复/消耗/淬体/控火/显示 */
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

// ---- T1 初始真元 = 上限
vm.runInContext(`S=newState('测试癸',BACKGROUNDS[0]);`,ctx);
assert(vm.runInContext('S.spirit',ctx)===vm.runInContext('maxSpirit(S)',ctx),'开局真元满');
assert(vm.runInContext('maxSpirit(S)',ctx)>=30,'真元上限至少 30');
// ---- T2 消耗与恢复钳制
vm.runInContext('S.spirit=100;',ctx);
assert(vm.runInContext('useSpirit(30)',ctx)===true,'消耗 30 成功');
assert(vm.runInContext('S.spirit',ctx)===70,'真元扣除');
assert(vm.runInContext('useSpirit(200)',ctx)===false,'超额消耗失败');
vm.runInContext('S.spirit=50; addSpirit(9999);',ctx);
assert(vm.runInContext('S.spirit',ctx)===vm.runInContext('maxSpirit(S)',ctx),'恢复不超过上限');
// ---- T3 真元淬体
vm.runInContext('S.spirit=60; S.cult=0; spiritQuench();',ctx);
assert(vm.runInContext('S.spirit',ctx)===32,'淬体消耗 30 真元（+2 时光恢复）');
assert(vm.runInContext('S.cult>0',ctx)===true,'淬体获得修为');
vm.runInContext(`
  S.spirit=20; const c0=S.cult;
  spiritQuench();
  window.__c0=c0; window.__sp=S.spirit; window.__c=S.cult;
`,ctx);
assert(vm.runInContext('window.__sp',ctx)===20&&vm.runInContext('window.__c',ctx)===vm.runInContext('window.__c0',ctx),'真元不足拦截（不扣不增）');
// ---- T4 时光恢复
vm.runInContext('S.spirit=10; S.days=0; passTime(5);',ctx);
assert(vm.runInContext('S.spirit',ctx)>=20,'随光阴恢复（+2/日）');
// ---- T5 炼制控火（选材新增真元选项）
vm.runInContext(`
  S.prof='alchemy'; S.spirit=60; S.mats={herb:5}; S.stones=500;
  const r=RECIPES.alchemy[0];
  craftPrep(r,0);
  window.__n=window._eventModalOpts.length;
  window._eventModalOpts[3].fn();
  window.__bonus=r._prepBonus; window.__sp=S.spirit;
`,ctx);
assert(vm.runInContext('window.__n',ctx)===5,'选材含真元控火选项');
assert(vm.runInContext('window.__bonus',ctx)===1,'控火判定 +1');
assert(vm.runInContext('window.__sp',ctx)===30,'控火消耗 30 真元');
// ---- T6 显示
vm.runInContext('renderAll();',ctx);
assert(vm.runInContext('document.getElementById("side").innerHTML.indexOf("真元")>=0',ctx)===true,'侧栏显示真元');
assert(vm.runInContext('characterCardHtml(S).indexOf("真元")>=0',ctx)===true,'角色卡显示真元');

console.log(fails===0?'smoke33: ALL PASS':'smoke33 FAILS: '+fails);
process.exit(fails?1:0);
