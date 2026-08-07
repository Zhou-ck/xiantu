/* v60 触屏闪黄修复冒烟：静态规则 + 手机/桌面特效行为对比 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){
  const el={_html:'',_txt:'',style:{setProperty(){},getPropertyValue(){return ''},set cssText(v){},get cssText(){return ''}},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,
    classList:{add(){},remove(){},toggle(){}},
    set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},
    set textContent(v){this._txt=String(v)},get textContent(){return this._txt},
    appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},
    querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};
  return el;
}
const ids={};
const bodyEl=makeEl(),docEl=makeEl();
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},body:bodyEl,documentElement:docEl};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
let ctx={document,localStorage,window:{innerWidth:400,innerHeight:800},console,setTimeout:fn=>fn(),Math,navigator:{maxTouchPoints:5},screen:{width:400}};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 静态断言：CSS 触屏收敛规则
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('#ink-mist{display:none!important}')>=0&&css.indexOf('#dust{display:none!important}')>=0,'CSS 触屏段隐藏金色雾/尘常驻层');
assert(css.indexOf('#sceneLayer{display:none!important}')>=0,'CSS 触屏段彻底不渲染场景背景层（杜绝换图/合成闪黄）');
assert(css.indexOf('html.fx-touch #panel')>=0&&css.indexOf('html.fx-touch button::after{display:none!important}')>=0,'CSS 混合设备 fx-touch 兜底（blur/金箔流光）');
assert(css.indexOf('animation:overlayIn .18s ease-out both!important')>=0,'CSS 触屏弹层仅淡入（≤0.18s）');
// T2 静态断言：JS 收敛分支
const fx=fs.readFileSync(path.join(root,'js','ui','fx.js'),'utf8');
assert(fx.indexOf('if(fxMobile())return; /* v60 手机端不创建整屏闪光层')>=0,'fxFlash 手机端直退（不建整屏层）');
assert(fx.indexOf('if(fxMobile())n=Math.min(n,3);')>=0&&fx.indexOf("'#d8b558'")>=0,'fxBurst 手机端 ≤3 且偏暗金');
assert(fx.indexOf('Math.max(1,Math.round(amp0*0.5))')>=0,'fxShake 手机端振幅减半');
const tr=fs.readFileSync(path.join(root,'js','ui','transition.js'),'utf8');
assert(tr.indexOf("if(typeof fxMobile==='function'&&fxMobile())return; /* v60 手机端不创建金色雾/尘常驻层 */")>=0,'initAmbient 手机端不建雾/尘层');
const ui=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
assert(ui.indexOf('img.onload')>=0&&ui.indexOf('fxMobile')>=0,'setSceneImg 手机端预载两段式切图');

// T3 行为断言：手机端
vm.runInContext(`_fxMobile=null; _fxLastBurst=0; window.__before=document.body.children.length; fxFlash('#ffffff',100); window.__after=document.body.children.length; _fxLastBurst=0; fxBurst(10,'#ffd76a'); window.__burst=document.body.children.length-window.__after; window.__dots=[].filter.call(document.body.children,function(c){return String(c.className).indexOf('fx-dot')>=0}).length;`,ctx);
assert(vm.runInContext('window.__after===window.__before',ctx),'手机端 fxFlash 不创建整屏层');
assert(vm.runInContext('window.__burst<=3&&window.__dots===window.__burst',ctx),'手机端 fxBurst 粒子 ≤3 且均为 fx-dot');
// T4 行为断言：桌面端维持原逻辑
ctx.navigator={maxTouchPoints:0};ctx.screen={width:1280};
vm.runInContext(`_fxMobile=null; _fxLastBurst=0; window.__b0=document.body.children.length; fxFlash('#ffffff',100); window.__b1=document.body.children.length; _fxLastBurst=0; fxBurst(4,'#ffd76a'); window.__b2=document.body.children.length;`,ctx);
assert(vm.runInContext('window.__b2-window.__b1===4',ctx),'桌面端 fxBurst 4 粒子保留（stub 下 getElementById 自动建节点，整屏层以静态断言覆盖）');
assert(fx.indexOf("el.id='fxFlash'")>=0,'桌面端 fxFlash 仍保留整屏层创建分支');

console.log(fails===0?'smoke85: ALL PASS':'smoke85 FAILS: '+fails);
process.exit(fails?1:0);
