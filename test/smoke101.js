/* v75 突破天象分层：境界场景图 + 天劫色调冒烟 */
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

// T1 境界→场景图映射
assert(vm.runInContext("breakSceneKey(8)",ctx)==='cult.jpg','炼气突破→闭关场景图');
assert(vm.runInContext("breakSceneKey(9)",ctx)==='tribulation.jpg','筑基→天劫场景图');
assert(vm.runInContext("breakSceneKey(13)",ctx)==='heart.jpg','金丹→心魔场景图');
assert(vm.runInContext("breakSceneKey(17)",ctx)==='faceless.jpg','元婴→无面天象');
assert(vm.runInContext("breakSceneKey(21)",ctx)==='ghostgate.jpg','化神→九幽之门');
assert(vm.runInContext("breakSceneKey(41)",ctx)==='tianmen.jpg','飞升→天门');

// T2 弹窗接线：breakOpen 设置背景图
const bt=fs.readFileSync(path.join(root,'js','systems','breakthrough.js'),'utf8');
assert(bt.indexOf('function breakSceneKey')>=0&&bt.indexOf("url('assets/scenes/\"")>=0,'突破弹窗按境界设置天象背景');
assert(bt.indexOf("setAttribute('data-trib'")>=0,'天劫类型色调接线');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('id="breakScene"')>=0,'突破壳含天象背景层');

// T3 样式：天象层 + 四劫色调 + 触屏压暗
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('#breakScene.break-scene')>=0,'天象背景层样式存在');
assert(css.indexOf('[data-trib="thunder"]')>=0&&css.indexOf('[data-trib="xinmo"]')>=0&&css.indexOf('[data-trib="yehuo"]')>=0&&css.indexOf('[data-trib="feng"]')>=0,'四类天劫色调齐全');
assert(css.indexOf('html.fx-touch #breakScene.break-scene')>=0,'触屏压暗天象背景');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='79','版本号 v79');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke101: ALL PASS':'smoke101 FAILS: '+fails);
process.exit(fails?1:0);
