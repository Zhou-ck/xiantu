/* v90 触屏安全动态化（纯透明度动效）冒烟 */
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

// T1 纯透明度动效关键帧（GPU 安全）
assert(css.indexOf('@keyframes fadeInOnly{from{opacity:0}to{opacity:1}}')>=0,'弹层/日志纯透明度淡入关键帧');
assert(css.indexOf('@keyframes cardFade{from{opacity:0}to{opacity:1}}')>=0,'卡片纯透明度浮现关键帧');
assert(css.indexOf('@keyframes barPulse')>=0,'进度条流光呼吸关键帧（仅透明度）');

// T2 触屏动态化规则（覆盖 v83 的 animation:none）
assert(css.indexOf('html.fx-touch .log{animation:fadeInOnly .22s ease-out!important}')>=0,'触屏日志逐条淡入');
assert(css.indexOf('html.fx-touch .mod-card{animation:cardFade .26s ease-out both!important}')>=0,'触屏模块卡淡入');
assert(css.indexOf('html.fx-touch #panel.fx-in')>=0&&css.indexOf('animation:fadeInOnly .18s ease-out both!important')>=0,'触屏弹层淡入');
assert(css.indexOf('html.fx-touch .bar>i::after{display:block!important;transform:none!important')>=0,'触屏进度条流光呼吸（无 transform）');
assert(css.indexOf('html.fx-touch .qi-ambient{display:block!important;opacity:.65}')>=0,'触屏修炼灵气氛围恢复');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='90','版本号 v90');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke116: ALL PASS':'smoke116 FAILS: '+fails);
process.exit(fails?1:0);
