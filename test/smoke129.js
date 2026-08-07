/* v98 B11 批次 + 里程碑 ≥900 */
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

// B11 批次：社交 20 / 故事 30 / 道侣 20 / 宗门 20
const b11s=vm.runInContext('DATA.events.filter(e=>String(e.id||"").indexOf("b11_")===0).length',ctx);
assert(b11s===20,'B11 社交 20 条（'+b11s+'）');
const b11st=vm.runInContext('STORY_EVENTS.filter(e=>String(e.id||"").indexOf("b11_")===0).length',ctx);
assert(b11st===30,'B11 故事 30 条（'+b11st+'）');
const b11p=vm.runInContext('PARTNER_EVENTS.filter(e=>String(e.id||"").indexOf("b11_")===0).length',ctx);
assert(b11p===20,'B11 道侣 20 条（'+b11p+'）');
const b11sc=vm.runInContext('SECT_EVENTS.filter(e=>String(e.id||"").indexOf("b11_")===0).length',ctx);
assert(b11sc===20,'B11 宗门 20 条（'+b11sc+'）');

// 里程碑 ≥900
const total=vm.runInContext('eventTotalCount()',ctx);
assert(total>=900,'事件总量 ≥900（实际 '+total+'）——v98 里程碑');

// 全局校验
const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll 0 错误');
const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck 0 错误'+(cc.length?(' → '+cc.slice(0,6).join(' | ')):""));

// 池校验
const vp=vm.runInContext('validatePartnerEvents()',ctx);
assert(Array.isArray(vp)&&vp.length===0,'validatePartnerEvents 0 错误');
const vs=vm.runInContext('validateSectEvents()',ctx);
assert(Array.isArray(vs)&&vs.length===0,'validateSectEvents 0 错误');

console.log(fails===0?'smoke129: ALL PASS':'smoke129 FAILS: '+fails);
process.exit(fails?1:0);
