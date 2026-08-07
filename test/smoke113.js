/* v87 游戏内闪屏自检工具冒烟 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
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
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0;`,ctx);

// T1 设置页含闪屏自检入口
vm.runInContext(`panelSettings(); window.__st=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__st',ctx).indexOf('闪屏自检')>=0,'设置页含闪屏自检区');
assert(vm.runInContext('window.__st',ctx).indexOf('flashDiag()')>=0,'设置页含自检按钮');

// T2 自检输出：面板打开 + 检查项齐全 + 无异常
vm.runInContext(`flashDiag(); window.__dg=document.getElementById('panelBody')._html;`,ctx);
const dg=vm.runInContext('window.__dg',ctx);
assert(dg.indexOf('diag-box')>=0&&dg.indexOf('diag-row')>=0,'自检面板渲染检查行');
assert(vm.runInContext('document.getElementById("panel").style.display',ctx)==='flex','自检面板打开');
const sj=fs.readFileSync(path.join(root,'js','ui','settings.js'),'utf8');
for(const k of ['场景层无动画','场景层无滤镜','场景层无过渡','场景层低透明','无整屏闪光层','弹层无模糊','按钮过渡收敛']){
  assert(sj.indexOf("chk('"+k)>=0,'自检实现含「'+k+'」');
}
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.diag-row')>=0&&css.indexOf('.diag-row.no')>=0,'自检行样式存在');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='88','版本号 v88');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke113: ALL PASS':'smoke113 FAILS: '+fails);
process.exit(fails?1:0);
