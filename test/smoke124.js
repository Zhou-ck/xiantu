/* v95 B07/B08 批次 + 800 里程碑（≥752） */
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

// B07 区域 +14 / 顿悟 +14
const b07r=vm.runInContext('REGION_EVENTS.filter(e=>String(e.id||"").indexOf("b07_")===0).length',ctx);
assert(b07r===14,'B07 区域 14 条（'+b07r+'）');
const b07m=vm.runInContext('MEDITATION_EVENTS.filter(e=>String(e.id||"").indexOf("b07_")===0).length',ctx);
assert(b07m===14,'B07 顿悟 14 条（'+b07m+'）');
// 每区域覆盖 ≥4
const regCov=vm.runInContext('JSON.stringify(REGION_EVENTS.reduce((a,e)=>{a[e.region]=(a[e.region]||0)+1;return a},{}))',ctx);
const rc=JSON.parse(regCov);
['near','hill','forest','cliff','abyss','valley','ruin'].forEach(r=>{
  assert(rc[r]>=4,'区域 '+r+' ≥4（'+rc[r]+'）');
});

// B08 主题 +24 / 季节 +10 / 年度 +10
const b08t=vm.runInContext('THEME_EVENTS.filter(e=>String(e.id||"").indexOf("b08_")===0).length',ctx);
assert(b08t===24,'B08 主题 24 条（'+b08t+'）');
const thCov=vm.runInContext('JSON.stringify(THEME_EVENTS.reduce((a,e)=>{a[e.theme]=(a[e.theme]||0)+1;return a},{}))',ctx);
const tc=JSON.parse(thCov);
['feng','lei','huo','shui'].forEach(t=>{assert(tc[t]>=10,'主题 '+t+' ≥10（'+tc[t]+'）')});
const b08s=vm.runInContext('SEASONAL_EVENTS.length',ctx);
assert(b08s>=18,'季节事件 ≥18（'+b08s+'）');
const b08y=vm.runInContext('YEARLY_EXTRA.length',ctx);
assert(b08y>=16,'年度事件 ≥16（'+b08y+'）');

// 函数型事件 run 可执行（seasonalEvent/yearlyExtra 不炸）
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0;`,ctx);
const noThrow=vm.runInContext(`(function(){try{seasonalEvent();yearlyExtra();return true}catch(e){return String(e.message)}})()`,ctx);
assert(noThrow===true,'seasonalEvent/yearlyExtra 执行无异常'+(noThrow!==true?(' → '+noThrow):""));

// 里程碑
const total=vm.runInContext('eventTotalCount()',ctx);
assert(total>=752,'事件总量 ≥752（实际 '+total+'）——v95 里程碑');

// 全局校验
const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll 0 错误');
const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck 0 错误'+(cc.length?(' → '+cc.slice(0,6).join(' | ')):""));

console.log(fails===0?'smoke124: ALL PASS':'smoke124 FAILS: '+fails);
process.exit(fails?1:0);
