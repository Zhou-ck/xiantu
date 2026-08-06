/* AI 意图路由冒烟：新系统命令可经 AI 路径路由 */
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
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}
const title=()=>vm.runInContext('document.getElementById("panelTitle").textContent',ctx);

vm.runInContext(`S=newState('测试戌',BACKGROUNDS[0]); PENDING=0;`,ctx);
// 论道 / 战技 / 图鉴 / 图谱 / 真元 / 守城
vm.runInContext('routeAIIntent("去论道台坐坐");',ctx);
assert(title().indexOf('论道台')>=0,'AI 路由「论道」');
vm.runInContext('routeAIIntent("参悟战技");',ctx);
assert(title().indexOf('战技参悟')>=0,'AI 路由「战技」');
vm.runInContext('routeAIIntent("查看收藏图鉴");',ctx);
assert(title().indexOf('收藏图鉴')>=0,'AI 路由「图鉴」');
vm.runInContext('routeAIIntent("看看关系图谱");',ctx);
assert(vm.runInContext('document.getElementById("panelBody").innerHTML.indexOf("因果星图")>=0',ctx)===true,'AI 路由「图谱」');
vm.runInContext('routeAIIntent("真元淬体");',ctx);
assert(title().indexOf('闭关修炼')>=0,'AI 路由「真元」');
vm.runInContext('routeAIIntent("守城去");',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.indexOf("妖潮守城战")>=0',ctx)===true,'AI 路由「守城」提示');
// 未匹配返回 false 且不弹面板
vm.runInContext('routeAIIntent("随便走走逛逛");',ctx);
assert(vm.runInContext('routeAIIntent("随便走走逛逛")===false',ctx)===true,'未匹配意图返回 false');
// 旧命令仍可用
vm.runInContext('routeAIIntent("我想闭关修炼");',ctx);
assert(vm.runInContext('PENDING',ctx)>0||title().indexOf('闭关修炼')>=0,'旧命令仍路由');

console.log(fails===0?'smoke44: ALL PASS':'smoke44 FAILS: '+fails);
process.exit(fails?1:0);
