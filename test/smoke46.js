/* v53 六页结构冒烟：更多页拆为百业/我；页头专属入口（每日修行/修仙志）不重复进模块 */
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

// ---- T1 结构：百业/我两页承接原「更多」，页头专属入口不重复
vm.runInContext(`window.__all=TABS.reduce((a,t)=>a.concat(t.items.map(x=>x.n)),[]); window.__biz=TABS.find(t=>t.k==='biz').items.map(x=>x.n); window.__me=TABS.find(t=>t.k==='me').items.map(x=>x.n);`,ctx);
const all=vm.runInContext('window.__all',ctx);
for(const dup of ['每日修行','修仙志'])assert(all.indexOf(dup)<0,'页头专属入口未重复进模块「'+dup+'」');
for(const need of ['检查更新','存档','仙途录','角色档案'])assert(vm.runInContext('window.__me',ctx).indexOf(need)>=0,'「我」页含「'+need+'」');
for(const need of ['坊市','副业','装备工坊','行囊','洞府'])assert(vm.runInContext('window.__biz',ctx).indexOf(need)>=0,'「百业」页含「'+need+'」');
// ---- T2 渲染检查
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0; tabHome('me');`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('检查更新')>=0,'「我」页渲染检查更新模块');
assert(html.indexOf('每日修行')<0,'「我」页渲染不含页头专属「每日修行」');
// ---- T3 检查更新可用
assert(vm.runInContext('typeof checkGameUpdate==="function"',ctx)===true,'checkGameUpdate 存在');
vm.runInContext('checkGameUpdate();',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.length>0',ctx)===true,'检查更新有响应提示');

console.log(fails===0?'smoke46: ALL PASS':'smoke46 FAILS: '+fails);
process.exit(fails?1:0);
