/* App 化基础冒烟：版本 / 原生检测降级 / 更新检查 / 设置页 App 区 */
const fs=require('fs'),path=require('path'),vm=require('vm');
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

// ---- T1 版本与模式检测
assert(vm.runInContext('GAME_VERSION',ctx)==='66','版本号 v66');
const swText=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
assert(swText.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');
assert(vm.runInContext('isNativeApp()',ctx)===false,'非原生环境降级 false');
assert(vm.runInContext('isStandalone()',ctx)===false,'非 PWA 独立模式 false');
// ---- T2 壳初始化安全降级
vm.runInContext('initAppShell();',ctx);
assert(true,'壳初始化无异常（安全降级）');
// ---- T3 更新检查安全降级
vm.runInContext('checkGameUpdate();',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.indexOf("不支持")>=0',ctx)===true,'无 SW 环境提示不支持更新');
// ---- T4 设置页 App 与更新区
vm.runInContext(`S=newState('测试丑',BACKGROUNDS[0]); panelSettings();`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('App 与更新')>=0,'设置页含 App 与更新区');
assert(html.indexOf('检查更新')>=0,'设置页含检查更新按钮');
assert(html.indexOf('v66')>=0,'设置页显示版本号');
assert(html.indexOf('浏览器 / PWA 模式')>=0,'显示当前运行模式');

console.log(fails===0?'smoke35: ALL PASS':'smoke35 FAILS: '+fails);
process.exit(fails?1:0);
