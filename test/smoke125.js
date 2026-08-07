/* v96 B09/B10 批次 + 800 收官里程碑（≥800） */
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

// B09 支线 10 条 + story 步骤计数
const b09=vm.runInContext('SIDE_QUESTS.filter(q=>String(q.id||"").indexOf("sq_b09_")===0).length',ctx);
assert(b09===10,'B09 新支线 10 条（'+b09+'）');
const b09steps=vm.runInContext('SIDE_QUESTS.filter(q=>String(q.id||"").indexOf("sq_b09_")===0).reduce((a,q)=>a+q.steps.filter(s=>s.type==="story").length,0)',ctx);
assert(b09steps>=16,'B09 story 步骤 ≥16（'+b09steps+'）');
// 每条支线 start/steps/reward 齐全
const b09bad=vm.runInContext('SIDE_QUESTS.filter(q=>String(q.id||"").indexOf("sq_b09_")===0).filter(q=>!q.start||!Array.isArray(q.steps)||q.steps.length<2||!q.reward).length',ctx);
assert(b09bad===0,'B09 支线 start/steps/reward 齐全');

// B10 道侣 +20 / 宗门 +20
const b10p=vm.runInContext('PARTNER_EVENTS.filter(e=>String(e.id||"").indexOf("b10_")===0).length',ctx);
assert(b10p===20,'B10 道侣 20 条（'+b10p+'）');
const b10s=vm.runInContext('SECT_EVENTS.filter(e=>String(e.id||"").indexOf("b10_")===0).length',ctx);
assert(b10s===20,'B10 宗门 20 条（'+b10s+'）');

// 池校验
const vp=vm.runInContext('validatePartnerEvents()',ctx);
assert(Array.isArray(vp)&&vp.length===0,'validatePartnerEvents 0 错误'+(vp.length?(' → '+vp.join(' | ')):""));
const vs=vm.runInContext('validateSectEvents()',ctx);
assert(Array.isArray(vs)&&vs.length===0,'validateSectEvents 0 错误'+(vs.length?(' → '+vs.join(' | ')):""));

// 收官里程碑：≥800
const total=vm.runInContext('eventTotalCount()',ctx);
assert(total>=800,'事件总量 ≥800（实际 '+total+'）——800+ 收官达成！');

// 全局校验
const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll 0 错误');
const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck 0 错误'+(cc.length?(' → '+cc.slice(0,6).join(' | ')):""));

// 支线总数
const sideN=vm.runInContext('SIDE_QUESTS.length',ctx);
assert(sideN>=23,'支线总数 ≥23（'+sideN+'）');

console.log(fails===0?'smoke125: ALL PASS':'smoke125 FAILS: '+fails);
process.exit(fails?1:0);
