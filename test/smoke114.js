/* v88 明亮模式（用户可控亮度开关）冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.set=S.set||{}; PENDING=0;`,ctx);

// T1 设置页含明亮模式开关
vm.runInContext(`panelSettings(); window.__st=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__st',ctx).indexOf('明亮模式')>=0&&vm.runInContext('window.__st',ctx).indexOf("setOpt('bright')")>=0,'设置页含明亮模式开关');

// T2 开关生效：S.set.bright 切换 + 状态持久化
vm.runInContext(`setOpt('bright'); window.__b1=S.set.bright; setOpt('bright'); window.__b2=S.set.bright;`,ctx);
assert(vm.runInContext('window.__b1===true&&window.__b2===false',ctx),'明亮模式开关可切换并持久化');

// T3 样式：html.xt-bright 提亮规则存在（纯色阶，无滤镜）
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('html.xt-bright body{background:radial-gradient')>=0,'明亮模式 body 提亮');
assert(css.indexOf('html.xt-bright #story{background:')>=0,'明亮模式主区域提亮');
assert(css.indexOf('html.xt-bright button{background:')>=0,'明亮模式按钮提亮');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='90','版本号 v90');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke114: ALL PASS':'smoke114 FAILS: '+fails);
process.exit(fails?1:0);
