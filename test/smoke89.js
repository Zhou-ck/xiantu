/* v64 触屏背景层收敛冒烟：sceneLayer 触屏彻底不渲染、fx-touch 类真正生效 */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('#sceneLayer{display:none!important}')>=0,'触屏媒体查询：sceneLayer 彻底不渲染（杜绝暖图换图闪黄）');
assert(css.indexOf('html.fx-touch #sceneLayer{display:none!important}')>=0,'fx-touch 兜底同样不渲染 sceneLayer');
const fx=fs.readFileSync(path.join(root,'js','ui','fx.js'),'utf8');
assert(fx.indexOf("classList.add('fx-touch')")>=0,'fxInit 为触屏设备添加 html.fx-touch');

console.log(fails===0?'smoke89: ALL PASS':'smoke89 FAILS: '+fails);
process.exit(fails?1:0);
