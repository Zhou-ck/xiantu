/* v94 B05/B06 批次 + 800 里程碑（≥680） */
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

// B05 社交 60 条
const b05=vm.runInContext('DATA.events.filter(e=>String(e.id||"").indexOf("b05_")===0).length',ctx);
assert(b05===60,'B05 社交 60 条（'+b05+'）');
const b05t=vm.runInContext('JSON.stringify(DATA.events.filter(e=>String(e.id||"").indexOf("b05_")===0).reduce((a,e)=>{a[e.type]=(a[e.type]||0)+1;return a},{}))',ctx);
const t5=JSON.parse(b05t);
assert(t5.visit===20&&t5.chat===20&&t5.invite===20,'B05 访/谈/约各 20（'+b05t+'）');

// B06 故事 90 条
const b06=vm.runInContext('STORY_EVENTS.filter(e=>String(e.id||"").indexOf("b06_")===0).length',ctx);
assert(b06===90,'B06 故事 90 条（'+b06+'）');
const b06c=vm.runInContext('JSON.stringify(STORY_EVENTS.filter(e=>String(e.id||"").indexOf("b06_")===0).reduce((a,e)=>{a[e.cat]=(a[e.cat]||0)+1;return a},{}))',ctx);
const c6=JSON.parse(b06c);
assert(c6.calm===18&&c6.herb===18&&c6.rare===18&&c6.epic===18&&c6.danger===18,'B06 五类各 18（'+b06c+'）');

// 里程碑
const total=vm.runInContext('eventTotalCount()',ctx);
assert(total>=680,'事件总量 ≥680（实际 '+total+'）——v94 里程碑');

// 全局校验
const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll 0 错误');
const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck 0 错误'+(cc.length?(' → '+cc.slice(0,6).join(' | ')):""));

// 故事类配额（各 ≥36 现在）
const sum=vm.runInContext('contentSummary()',ctx);
assert(sum.story&&sum.story.count>=238,'故事总量 ≥238（'+sum.story.count+'）');
assert(sum.social&&sum.social.count>=187,'社交 ≥187（'+sum.social.count+'）');

console.log(fails===0?'smoke123: ALL PASS':'smoke123 FAILS: '+fails);
process.exit(fails?1:0);
