/* v62 宗门经营/道侣进阶事件冒烟 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`window.__st=STORY_EVENTS.filter(e=>String(e.id).indexOf('v62')>=0).length; window.__soc=DATA.events.filter(e=>String(e.id).indexOf('v62')>=0).length; window.__ev=eventTotalCount();`,ctx);
assert(vm.runInContext('window.__st===6&&window.__soc===4',ctx),'宗门经营/道侣进阶向故事事件 +6 · 社交事件 +4');
assert(vm.runInContext('window.__ev>=395',ctx),'事件库 ≥395（当前 '+vm.runInContext('window.__ev',ctx)+'）');
assert(vm.runInContext('validateAll().length===0',ctx),'新增事件过 schema 校验 0 错误');
assert(vm.runInContext('STORY_EVENTS.filter(e=>String(e.id).indexOf("v6")>=0).every(e=>JSON.stringify(e.opts).indexOf("favor")<0)',ctx),'v6x 事件均不使用不支持的 favor 字段');

console.log(fails===0?'smoke88: ALL PASS':'smoke88 FAILS: '+fails);
process.exit(fails?1:0);
