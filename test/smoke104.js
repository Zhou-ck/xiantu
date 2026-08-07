/* v78 战利品金条 + 探索回执横幅冒烟 */
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

// T1 战利品金条：图标映射 + 渲染接线
vm.runInContext(`window.__c1=lootChip('灵石 +80'); window.__c2=lootChip('修为 +120'); window.__c3=lootChip('妖丹 ×1');`,ctx);
assert(vm.runInContext('window.__c1',ctx).indexOf('loot-chip')>=0&&vm.runInContext('window.__c1',ctx).indexOf('💰')>=0,'灵石战利配钱袋图标');
assert(vm.runInContext('window.__c2',ctx).indexOf('✨')>=0,'修为战利配修为图标');
assert(vm.runInContext('window.__c3',ctx).indexOf('🎒')>=0,'材料战利配行囊图标');
const combat=fs.readFileSync(path.join(root,'js','systems','combat.js'),'utf8');
assert(combat.indexOf('function lootChip')>=0&&combat.indexOf('loot-strip')>=0,'战斗胜利战利以金条渲染');
const q=fs.readFileSync(path.join(root,'js','systems','quests.js'),'utf8');
const se=fs.readFileSync(path.join(root,'js','data','storyEvents.js'),'utf8');
const re=fs.readFileSync(path.join(root,'js','data','exploreEvents.js'),'utf8');
assert(q.indexOf('loot-strip')>=0&&se.indexOf('loot-strip')>=0&&re.indexOf('loot-strip')>=0,'剧情/故事/区域事件战利统一金条');

// T2 探索回执横幅
const ex=fs.readFileSync(path.join(root,'js','systems','explore.js'),'utf8');
assert(ex.indexOf('exp-banner')>=0,'探索出发渲染回执横幅');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.loot-chip')>=0&&css.indexOf('@keyframes lootIn')>=0&&css.indexOf('.exp-banner')>=0,'金条与回执横幅样式存在');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='82','版本号 v82');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke104: ALL PASS':'smoke104 FAILS: '+fails);
process.exit(fails?1:0);
