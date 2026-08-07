/* v81 图片亮化 + 闪黄彻底加固 + 强敌/心魔登场卡冒烟 */
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

// T1 图片亮化：触屏档位整体上调
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.page-hero-img.ld{opacity:.68}')>=0,'页横幅亮化至 .68');
assert(css.indexOf('html.fx-touch .mod-img{filter:none!important}')>=0,'触屏模块图去掉滤镜层（防合成闪）');
assert(css.indexOf('html.fx-touch .loc-img{filter:none!important}')>=0,'触屏地点图去掉滤镜层');
assert(css.indexOf('html.fx-touch #breakScene.break-scene{opacity:.5!important')>=0,'突破天象亮化至 .5（无滤镜）');

// T2 闪黄彻底加固：全局点击高亮透明 / 按钮即时反馈无过渡 / 面板去暖色内辉 / 滚动防回弹 / 触屏切屏免卷帘
assert(css.indexOf('*{-webkit-tap-highlight-color:transparent!important}')>=0,'触屏全局点击高亮透明');
assert(css.indexOf('html.fx-touch button:active{transform:scale(.97);transition:none!important}')>=0,'触屏按钮按压即时反馈（无 transition 合成）');
assert(css.indexOf('html.fx-touch #panelBox')>=0,'触屏面板去暖色内辉阴影');
assert(css.indexOf('html.fx-touch #panelBody,html.fx-touch #cultLog')>=0,'触屏滚动容器防回弹');
const tr=fs.readFileSync(path.join(root,'js','ui','transition.js'),'utf8');
assert(tr.indexOf("fxMobile()){swap();return}")>=0,'触屏切屏跳过墨晕卷帘');

// T3 强敌/心魔登场卡
const combat=fs.readFileSync(path.join(root,'js','systems','combat.js'),'utf8');
assert(combat.indexOf('boss-intro')>=0&&combat.indexOf('破绽窥探')>=0,'守关大妖登场卡（含破绽窥探）');
const bt=fs.readFileSync(path.join(root,'js','systems','breakthrough.js'),'utf8');
assert(bt.indexOf('heart-intro')>=0,'心魔现身卡接线');
assert(css.indexOf('.boss-intro')>=0&&css.indexOf('.heart-intro')>=0,'登场卡样式存在');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='91','版本号 v91');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke107: ALL PASS':'smoke107 FAILS: '+fails);
process.exit(fails?1:0);
