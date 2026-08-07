/* v64 触屏暖图闪黄收敛：场景层不渲染 / 导航图加载后淡入 / 触屏压暗 + 深色面纱 / 金箔流光关闭 */
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

const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
// T1 场景背景层触屏不渲染（媒体查询 + fx-touch 兜底）
assert(css.indexOf('#sceneLayer{display:none!important}')>=0,'触屏媒体查询：场景层不渲染');
assert(css.indexOf('html.fx-touch #sceneLayer{display:none!important}')>=0,'fx-touch 兜底：场景层不渲染');
// T2 导航图加载成功后才淡入（暗底先呈现，杜绝暖图突现）
assert(css.indexOf('.page-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .45s ease')>=0,'页横幅图默认透明 + 淡入过渡');
assert(css.indexOf('.page-hero-img.ld{opacity:.68}')>=0,'页横幅图加载后淡入到 .68');
assert(css.indexOf('.mod-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s ease}')>=0,'模块图默认透明 + 淡入过渡');
assert(css.indexOf('.mod-img.ld{opacity:.9}')>=0,'模块图加载后淡入到 .9');
// T3 触屏压暗 + 深色面纱 + 关金箔流光 + 突破金环低亮
assert(css.indexOf('html.fx-touch .mod-img{filter:saturate(.82) brightness(.84)}')>=0,'fx-touch 模块图轻度压暗（亮化）');
assert(css.indexOf('html.fx-touch .mod-imgwrap::after')>=0,'fx-touch 模块图深色面纱');
assert(css.indexOf('html.fx-touch .page-hero::after')>=0,'fx-touch 横幅深色面纱');
assert(css.indexOf('html.fx-touch .bar>i::after{display:none!important}')>=0,'fx-touch 关闭进度条金箔流光');
assert(css.indexOf('html.fx-touch #btAura.on{animation:auraBurstT 1s ease-out}')>=0,'fx-touch 突破金环低亮');
// T4 渲染钩子：导航图带 onload 淡入类
vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0; tabHome('cult'); window.__h=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__h',ctx);
assert(html.indexOf("onload=\"this.classList.add('ld')\"")>=0,'模块图渲染带 onload 淡入钩子');
assert(html.indexOf("onerror=\"this.classList.add('gone');this.nextElementSibling.classList.remove('gone')\"")>=0,'模块图渲染保留 onerror 兜底');
// T5 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke90: ALL PASS':'smoke90 FAILS: '+fails);
process.exit(fails?1:0);
