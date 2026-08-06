/* 收藏图鉴深化 Phase 2i 冒烟：物品/敌人/配方三册 + 收集里程碑 */
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

// ---- T1 收集计数
vm.runInContext(`
  S=newState('测试壬',BACKGROUNDS[0]);
  S.seenI={回春丹:2,聚灵丹:1}; S.seenE={妖狼:1}; S.flag.atlasMiles=[];
`,ctx);
assert(vm.runInContext('atlasCounts().items',ctx)===2,'物品计数');
assert(vm.runInContext('atlasCounts().enemies',ctx)===1,'敌人计数');
// ---- T2 物品品质查询
assert(vm.runInContext('atlasItemQuality("回春丹")',ctx)===1,'坊市物品品质');
assert(vm.runInContext('atlasItemQuality("灵犀佩")',ctx)===4,'炼制物品品质');
// ---- T3 物品里程碑（addItem 触发）
vm.runInContext(`
  S.stones=0; S.items=[]; S.seenI={};
  for(let i=1;i<=14;i++)S.seenI['奇物'+i]=1;
  addItem({name:'奇物15',type:'consumable',quality:1,count:1,use:'heal',desc:'x'});
`,ctx);
assert(vm.runInContext('S.flag.atlasMiles.indexOf("item:15")>=0',ctx)===true,'物品 15 种里程碑');
assert(vm.runInContext('S.stones',ctx)>=200,'里程碑奖励灵石');
// ---- T4 敌人里程碑
vm.runInContext(`
  S.seenE={}; S.flag.insights=0;
  for(let i=1;i<=10;i++)S.seenE['妖'+(i)+'兽']=1;
  checkAtlasMiles();
`,ctx);
assert(vm.runInContext('S.flag.atlasMiles.indexOf("enemy:10")>=0',ctx)===true,'敌人 10 类里程碑');
assert(vm.runInContext('S.flag.insights',ctx)>=1,'敌人里程碑悟道 +1');
// ---- T5 配方计数与里程碑
vm.runInContext(`
  S.prof='alchemy'; S.profLevel=2; S.flag.atlasMiles=[];
  checkAtlasMiles();
`,ctx);
assert(vm.runInContext('atlasRecipeCount()',ctx)===4,'2 阶炼丹掌握 4 配方');
assert(vm.runInContext('S.flag.atlasMiles.indexOf("recipe:3")>=0',ctx)===true,'配方 3 份里程碑');
// ---- T6 收藏图鉴渲染
vm.runInContext('S.seenI={回春丹:3,聚灵丹:1}; S.seenE={妖狼:2,妖豹:1}; collectionAtlas();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('收藏图鉴')>=0||vm.runInContext('document.getElementById("panelTitle").textContent',ctx).indexOf('收藏图鉴')>=0,'图鉴面板打开');
assert(html.indexOf('物品册')>=0&&html.indexOf('敌人册')>=0&&html.indexOf('配方册')>=0,'三册齐全');
assert(html.indexOf('收集里程碑')>=0,'图鉴含里程碑');
assert(html.indexOf('回春丹')>=0,'图鉴列出已获物品');

console.log(fails===0?'smoke32: ALL PASS':'smoke32 FAILS: '+fails);
process.exit(fails?1:0);
