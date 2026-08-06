/* v46 AI 内容生产面板冒烟：面板渲染 / 本地生成 / 入库 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 面板渲染
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; PENDING=0; panelAiStudio(); window.__h=document.getElementById('panelBody')._html; window.__t=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__t.indexOf("内容生产")>=0&&window.__h.indexOf("生成并校验")>=0&&window.__h.indexOf("审核入库")>=0',ctx),'内容生产面板渲染（类型/生成/入库）');

// T2 本地生成草稿写入面板（排空微任务后校验）
vm.runInContext(`aiGenerate();`,ctx);
setImmediate(()=>{
  assert(vm.runInContext('document.getElementById("aiDraft")._html.indexOf("校验通过")>=0',ctx),'本地生成草稿通过校验并展示');
  // T3 入库：事件表 +1
  vm.runInContext(`
    const before=DATA.events.length;
    window.__imp=aiImportDraft();
    window.__n=DATA.events.length-before;
  `,ctx);
  assert(vm.runInContext('window.__imp===undefined&&window.__n===1',ctx),'审核入库使社交事件表 +1');
  console.log(fails===0?'smoke69: ALL PASS':'smoke69 FAILS: '+fails);
  process.exit(fails?1:0);
});
