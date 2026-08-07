/* v85 整站提亮一档（主体/侧栏/弹层/按钮/导航底色）+ 实测亮度验证冒烟 */
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
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');

// T1 整站底色提亮（按钮/头部/侧栏/导航/弹层/卡片）
assert(css.indexOf('background:linear-gradient(180deg,#343b5f,#252b46)')>=0,'按钮底色提亮');
assert(css.indexOf('background:linear-gradient(180deg,#262d4a,#1b2036)')>=0,'头部底色提亮');
assert(css.indexOf('background:linear-gradient(180deg,#222840,#1a1e32)')>=0,'底部导航底色提亮');
assert(css.indexOf('background:linear-gradient(180deg,#2b3250,#1e2336)')>=0,'弹层底色提亮');
assert(css.indexOf('background:linear-gradient(180deg,#262c48,#1e2338)')>=0,'卡片底色提亮');
assert(css.indexOf('radial-gradient(ellipse at 50% -10%,#454f7d 0%,#222842 48%,#111527 100%)')>=0,'body 底色提亮');

// T2 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='86','版本号 v86');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke111: ALL PASS':'smoke111 FAILS: '+fails);
process.exit(fails?1:0);
