/* v84 亮度最终档（主区域背景提亮 / 遮罩近无 / 天象 .5）+ 触屏稳定图层 冒烟 */
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

// T1 主区域背景提亮（手机看不到场景图后的偏暗主因）
assert(css.indexOf('radial-gradient(ellipse at 50% -20%,rgba(130,150,215,.42),transparent 58%)')>=0,'主区域背景提亮');
assert(css.indexOf('repeating-linear-gradient(0deg,rgba(201,162,75,.05) 0 1px')>=0,'主区域金线提亮');

// T2 遮罩近无 + 天象 .5 + 地点图全亮
assert(css.indexOf('html.fx-touch .mod-imgwrap::after{content:\'\';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(8,11,20,.06),rgba(8,11,20,.16))}')>=0,'模块图遮罩近无');
assert(css.indexOf('html.fx-touch #breakScene.break-scene{opacity:.5!important')>=0,'突破天象亮化 .5');
assert(css.indexOf('.loc-img.ld{opacity:1}')>=0,'地点图全亮');

// T3 触屏弹层稳定图层（translateZ 规避安卓合成闪）
assert(css.indexOf('html.fx-touch #panelBox,html.fx-touch #cultBox,html.fx-touch #battleBox,html.fx-touch #guideBox,html.fx-touch #breakBox{transform:translateZ(0);backface-visibility:hidden}')>=0,'触屏弹层稳定图层');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='91','版本号 v91');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke110: ALL PASS':'smoke110 FAILS: '+fails);
process.exit(fails?1:0);
