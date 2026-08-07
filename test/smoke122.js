/* v93 事件总量里程碑 ≥524（800+ 路线：v93 起步） */
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

// 里程碑链：v93 ≥524 → v94 ≥674 → v95 ≥746 → v96 ≥800
const total=vm.runInContext('eventTotalCount()',ctx);
assert(total>=524,'事件总量 ≥524（实际 '+total+'）——800+ 路线 v93 里程碑');
const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll 0 错误');
const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck 0 错误'+(cc.length?(' → '+cc.slice(0,6).join(' | ')):""));

console.log(fails===0?'smoke122: ALL PASS':'smoke122 FAILS: '+fails);
process.exit(fails?1:0);
