/* v83 触屏关闭全部入场动画层（闪黄根治）+ 亮化档位 冒烟 */
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

// T1 触屏关闭全部入场动画层（日志行/场景标题/模块卡/弹层/奖励条）
for(const sel of ['.log','.scene','.mod-card','.loot-chip','.craft-result','.bt-realm-up','.realm-jump']){
  assert(css.indexOf('html.fx-touch '+sel+'{animation:none!important}')>=0,'触屏关闭动画层 '+sel);
}
assert(css.indexOf('html.fx-touch #panel.fx-in,html.fx-touch #battle.fx-in')>=0,'触屏弹层入场动画关闭');
assert(css.indexOf('html.fx-touch #panel.fx-in #panelBox,html.fx-touch #cultivate.fx-in #cultBox')>=0,'触屏弹层内容动画关闭');

// T2 亮化档位
assert(css.indexOf('html.fx-touch .mod-img.ld{opacity:.95}')>=0,'模块图亮化 .95');
assert(css.indexOf('html.fx-touch .page-hero-img.ld{opacity:.62}')>=0,'横幅亮化 .62');
assert(css.indexOf('html.fx-touch #breakScene.break-scene{opacity:.42!important')>=0,'突破天象亮化 .42');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='83','版本号 v83');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke109: ALL PASS':'smoke109 FAILS: '+fails);
process.exit(fails?1:0);
