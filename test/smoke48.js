/* 前端视觉深化 v39 冒烟：转场工具在低档/假 DOM 下同步安全；弹层语义不变 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,_flag:{n:0}};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// ---- T1 转场工具已定义
assert(vm.runInContext('typeof T!=="undefined"&&typeof T.switchScreen==="function"&&typeof T.reveal==="function"&&typeof T.conceal==="function"&&typeof T.initAmbient==="function"',ctx)===true,'T 转场工具已定义');

// ---- T2 低档下 switchScreen 同步直切
vm.runInContext('fxSetLevel("low");T.switchScreen("screen-title","screen-create");',ctx);
assert(vm.runInContext('document.getElementById("screen-title").style.display==="none"',ctx)===true,'低档 title 已隐藏');
assert(vm.runInContext('document.getElementById("screen-create").style.display==="flex"',ctx)===true,'低档 create 已显示');
assert(vm.runInContext('T._veilEl===null',ctx)===true,'低档未创建墨晕蒙层');

// ---- T3 低档 after 回调同步执行
vm.runInContext('T.switchScreen("screen-create","screen-game",{after(){_flag.n++}});',ctx);
assert(ctx._flag.n===1,'低档 after 回调同步执行');
assert(vm.runInContext('document.getElementById("screen-create").style.display==="none"',ctx)===true,'create 已隐藏');
assert(vm.runInContext('document.getElementById("screen-game").style.display==="flex"',ctx)===true,'game 已显示');

// ---- T4 reveal/conceal 假 DOM 不抛错
vm.runInContext('T.reveal(document.getElementById("panel"));T.conceal(document.getElementById("panel"),null);T.reveal(document.getElementById("battle"));',ctx);
assert(true,'reveal/conceal 假 DOM 不抛错');

// ---- T5 弹层语义不变：openPanel 入场动画不改变 pending，closePanel 同步关闭
vm.runInContext('S=newState("测试甲",BACKGROUNDS[0]);PENDING=0;openPanel("测试", "<p>内容</p>");',ctx);
assert(vm.runInContext('document.getElementById("panel").style.display==="flex"',ctx)===true,'openPanel 正常打开');
assert(vm.runInContext('PENDING',ctx)===0,'openPanel 不改变 PENDING');
vm.runInContext('closePanel();',ctx);
assert(vm.runInContext('document.getElementById("panel").style.display==="none"',ctx)===true,'closePanel 同步关闭');

// ---- T6 initAmbient 在假 DOM / 低档下安全无副作用
vm.runInContext('fxSetLevel("med");T.initAmbient();fxSetLevel("low");T.initAmbient();',ctx);
assert(true,'initAmbient 低档/假 DOM 无异常');

console.log(fails===0?'smoke48: ALL PASS':'smoke48 FAILS: '+fails);
process.exit(fails?1:0);
