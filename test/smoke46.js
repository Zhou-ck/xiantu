/* 更多页去重冒烟：移除与顶部重复的入口（任务/仙途录/存档/修仙志），新增检查更新 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
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

// ---- T1 更多页条目去重
vm.runInContext('window.__names=TABS.find(t=>t.k==="more").items.map(x=>x.n);',ctx);
const names=vm.runInContext('window.__names',ctx);
for(const dup of ['每日修行','仙途录','存档','修仙志'])assert(names.indexOf(dup)<0,'更多页已移除重复入口「'+dup+'」');
assert(names.indexOf('检查更新')>=0,'更多页含「检查更新」');
// ---- T2 渲染检查
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0; tabHome('more');`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('检查更新')>=0,'更多页渲染检查更新按钮');
for(const dup of ['每日修行','仙途录','存档','修仙志'])assert(html.indexOf(dup)<0,'更多页渲染不含「'+dup+'」');
// ---- T3 检查更新可用
assert(vm.runInContext('typeof checkGameUpdate==="function"',ctx)===true,'checkGameUpdate 存在');
vm.runInContext('checkGameUpdate();',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.length>0',ctx)===true,'检查更新有响应提示');

console.log(fails===0?'smoke46: ALL PASS':'smoke46 FAILS: '+fails);
process.exit(fails?1:0);
