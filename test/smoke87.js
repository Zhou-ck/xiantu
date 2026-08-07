/* v61 宗门/道侣事件扩充冒烟：数量 / schema / 效果字段合法（favor 已替换为受支持键） */
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

// T1 宗门/道侣向事件数量
vm.runInContext(`window.__st=STORY_EVENTS.filter(e=>String(e.id).indexOf('v61')>=0).length; window.__soc=DATA.events.filter(e=>String(e.id).indexOf('v61')>=0).length; window.__ev=eventTotalCount();`,ctx);
assert(vm.runInContext('window.__st===8&&window.__soc===4',ctx),'宗门/道侣向故事事件 +8 · 社交事件 +4');
assert(vm.runInContext('window.__ev>=389',ctx),'事件库 ≥389（当前 '+vm.runInContext('window.__ev',ctx)+'）');
// T2 schema 合法
assert(vm.runInContext('validateAll().length===0',ctx),'新增事件过 schema 校验 0 错误');
// T3 v60 道侣事件 favor 已修正为受支持键（不残留 favor）
vm.runInContext(`window.__bad=STORY_EVENTS.filter(e=>String(e.id).indexOf('v60')>=0||String(e.id).indexOf('v61')>=0).some(e=>JSON.stringify(e.opts).indexOf('favor')>=0);`,ctx);
assert(vm.runInContext('window.__bad===false',ctx),'v60/v61 事件效果字段不再使用不支持的 favor');

console.log(fails===0?'smoke87: ALL PASS':'smoke87 FAILS: '+fails);
process.exit(fails?1:0);
