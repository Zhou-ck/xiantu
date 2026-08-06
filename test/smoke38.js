/* 内容扩充冒烟：寒渊冰宫秘境 + 新事件链（山神香火 / 旧账因果） */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 冰宫秘境
vm.runInContext(`S=newState('测试辰',BACKGROUNDS[0]);`,ctx);
assert(vm.runInContext('DUNGEONS.ice&&DUNGEONS.ice.rooms.length',ctx)===3,'冰宫秘境三室');
vm.runInContext('enterDungeon("ice");',ctx);
assert(vm.runInContext('S.dungeon&&S.dungeon.kind',ctx)==='ice','进入冰宫');
vm.runInContext('S.dungeon=null; recordDungeonDone("ice"); exploreTome();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('1/6 类')>=0,'秘境册含冰宫（1/6）');
// ---- T2 山神香火链
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[]; S.merit=0;
  chainStart('shanshen'); PENDING=0; chainTick();
`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===3,'山神三选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.merit',ctx)===10,'立庙功德 +10');
assert(vm.runInContext('S.flag.chain.shanshen',ctx)===3,'山神链推进');
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'香火回响两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.merit',ctx)===15,'题字功德 +5');
assert(vm.runInContext('S.flag.chain.shanshen',ctx)===-1,'山神链收束');
// ---- T3 旧账因果链
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[]; S.items=[{name:'聚灵丹',type:'consumable',quality:1,count:1,use:'pill'}]; S.stones=1000;
  chainStart('jiuzhang'); PENDING=0; chainTick();
`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'旧账两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.stones',ctx)===800,'还账扣 200 灵石');
assert(vm.runInContext('S.flag.jiuzhang',ctx)==='pay','旧账清偿');
vm.runInContext('PENDING=0; chainTick();',ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'重诺回响两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.stones',ctx)>800,'共探灵矿得灵石');
assert(vm.runInContext('S.flag.chain.jiuzhang',ctx)===-1,'旧账链收束');

console.log(fails===0?'smoke38: ALL PASS':'smoke38 FAILS: '+fails);
process.exit(fails?1:0);
