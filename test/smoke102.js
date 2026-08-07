/* v76 战斗挥砍弧光 + 克敌印记 + 闭关灵气氛围冒烟 */
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

// T1 战斗挥砍弧光 + 克敌印记接线
const fx=fs.readFileSync(path.join(root,'js','ui','fx.js'),'utf8');
assert(fx.indexOf('function fxSlash(')>=0,'特效库含挥砍弧光函数');
const combat=fs.readFileSync(path.join(root,'js','systems','combat.js'),'utf8');
assert(combat.indexOf("fxSlash('enemy'")>=0&&combat.indexOf("fxSlash('player'")>=0,'攻击/受击均触发挥砍弧光');
assert(combat.indexOf("fxFloatText('⚡ 克敌'")>=0,'五行克敌时飘克敌印记');

// T2 样式与闭关氛围
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.fx-slash')>=0&&css.indexOf('@keyframes fxSlashL')>=0,'挥砍弧光样式与动画存在');
assert(css.indexOf('.qi-ambient')>=0&&css.indexOf('html.fx-touch .qi-ambient')>=0,'闭关灵气氛围存在且触屏隐藏');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('class="qi-ambient"')>=0,'修炼窗口含灵气氛围层');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='76','版本号 v76');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke102: ALL PASS':'smoke102 FAILS: '+fails);
process.exit(fails?1:0);
