/* 事件池完整性：跳转目标存在、关键函数可运行 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 季节事件可运行
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); PENDING=0; var ok=0; for(var k=0;k<20;k++){PENDING=0;S.flag.lastSeason=undefined;try{seasonalEvent();ok++}catch(e){window.__err=e.message}} window.__ok=ok; }`,ctx);
assert(vm.runInContext('window.__ok===20',ctx),'季节事件池 20 连抽无异常');
// 2) 年度事件池可运行
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); PENDING=0; var ok=0; for(var k=0;k<20;k++){PENDING=0;try{yearlyEvent();ok++}catch(e){window.__err2=e.message}} window.__ok2=ok; }`,ctx);
assert(vm.runInContext('window.__ok2===20',ctx),'年度事件池 20 连抽无异常');
// 3) 时代主线 ERAS 覆盖第 1-5 年且不重复
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__era=ERAS.map(e=>e.year).join(','); }`,ctx);
assert(vm.runInContext('window.__era==="1,2,3,4,5"',ctx),'时代主线覆盖第 1-5 年');
// 4) 事件链 CHAINS 的 id 与 chainStart 可运行
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.flag.chain={}; var ids2=Object.keys(CHAINS); var errs=[]; for(var k=0;k<ids2.length;k++){try{chainStart(ids2[k])}catch(e){errs.push(ids2[k])}} window.__ch={ids:ids2,errs:errs}; }`,ctx);
assert(vm.runInContext('window.__ch.ids.length>=6&&window.__ch.errs.length===0',ctx),'事件链注册 6 条且可开启');
// 5) 突破跳转目标存在
for(const k of ['market','explore','social','craft','sect','cult','bag'])assert(vm.runInContext('typeof BREAK_GO_MAP["'+k+'"][1]==="function"',ctx),'突破跳转目标存在：'+k);
// 6) 守关 BOSS 全阶可生成
vm.runInContext(`{ var bad=[]; for(var st=0;st<9;st++){var b=bossOf(st); if(!b.name||b.hp<=0)bad.push(st)} window.__bad=bad; }`,ctx);
assert(vm.runInContext('window.__bad.length===0',ctx),'九阶守关 BOSS 均可生成');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
