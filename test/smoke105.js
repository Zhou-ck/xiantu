/* v79 收藏图鉴图标化（物品图标+品质色 / 敌人立绘缩略图）冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.flag={}; S.prof='alchemy'; S.profLevel=2; PENDING=0;`,ctx);

// T1 物品册：图标 + 品质色边框
vm.runInContext(`{ S.seenI={回春丹:3,聚灵丹:1}; S.seenE={荒坟厉鬼:2,妖狼:1}; collectionAtlas(); window.__ca=document.getElementById('panelBody')._html; }`,ctx);
const ca=vm.runInContext('window.__ca',ctx);
assert(ca.indexOf('atlas-item')>=0&&ca.indexOf('ai-ico')>=0,'物品册条目图标化');
assert(ca.indexOf('🌿')>=0&&ca.indexOf('回春丹')>=0,'物品带专属图标（回春丹→🌿）');
assert(ca.indexOf('qc1')>=0,'物品册条目带品质色边框');

// T2 敌人册：立绘缩略图 / emoji 兜底
assert(ca.indexOf('atlas-enemy')>=0&&ca.indexOf('has-art')>=0&&ca.indexOf('death.jpg')>=0,'已知敌人带立绘缩略图');
assert(ca.indexOf('ae-emoji')>=0&&ca.indexOf('妖狼')>=0,'未知敌人 emoji 兜底');

// T3 样式
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.tome-cell.atlas-item')>=0&&css.indexOf('.atlas-enemy .ae-img')>=0,'图鉴图标样式存在');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='88','版本号 v88');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke105: ALL PASS':'smoke105 FAILS: '+fails);
process.exit(fails?1:0);
