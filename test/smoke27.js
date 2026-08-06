/* 探索历练深化 Phase 2d 冒烟：行迹图鉴 / 里程碑 / 新事件链（青莲剑冢）因果回响 */
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

// ---- T1 足迹记录
vm.runInContext(`
  const bg=BACKGROUNDS.find(b=>b.id==='villager');
  S=newState('测试丁',bg);
  S.flag.exploreCount=0; S.flag.exploreLog=[]; S.flag.regions={}; S.flag.encTypes={};
  recordExplore(REGIONS[0],'rare');
`,ctx);
assert(vm.runInContext('S.flag.regions.near',ctx)===1,'记录到访地区');
assert(vm.runInContext('S.flag.encTypes.rare',ctx)===1,'记录际遇类型');
assert(vm.runInContext('S.flag.exploreLog.length',ctx)===1,'记录最近足迹');
// ---- T2 里程碑
vm.runInContext(`
  S.stones=0; S.flag.exploreCount=10; S.flag.exploreMiles=[];
  checkExploreMiles();
`,ctx);
assert(vm.runInContext('S.flag.exploreMiles.indexOf(10)>=0',ctx)===true,'10 次里程碑发放');
assert(vm.runInContext('S.stones',ctx)>=100,'里程碑奖励灵石');
vm.runInContext('S.flag.exploreCount=100; checkExploreMiles();',ctx);
assert(vm.runInContext('S.flag.exploreMiles.length',ctx)===4,'100 次集齐全部里程碑');
// ---- T3 行迹图鉴面板
vm.runInContext(`
  S.flag.tower=12; S.flag.dungeons=3; S.flag.bosses={0:true}; S.flag.insights=2;
  exploreTome();
`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('行迹图鉴')>=0||vm.runInContext('document.getElementById("panelTitle").textContent',ctx).indexOf('行迹图鉴')>=0,'行迹图鉴面板打开');
assert(html.indexOf('里程碑')>=0,'图鉴含里程碑');
assert(html.indexOf('到访之地')>=0,'图鉴含到访之地');
assert(html.indexOf('试炼塔')>=0,'图鉴含试炼塔');
// ---- T4 新事件链：埋设
vm.runInContext(`
  S.flag.chain={}; S.flag.foreshadow=[];
  chainStart('jianzhong');
`,ctx);
assert(vm.runInContext('S.flag.chain.jianzhong',ctx)===1,'剑冢链埋设 stage 1');
assert(vm.runInContext('S.flag.foreshadow.some(f=>f.name==="青莲剑冢链")',ctx)===true,'伏笔登记');
// ---- T5 事件链推进：剑冢悟剑
vm.runInContext(`
  Math.random=()=>0.99;
  S.attrs.int=40; S.flag.jianYi=false; PENDING=0;
  chainTick();
`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===3,'剑冢事件三选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.flag.tAttack',ctx)===1,'悟剑碑得攻势 +1');
assert(vm.runInContext('S.flag.chain.jianzhong',ctx)===3,'剑冢链推进至回响');
// ---- T6 因果回响：独臂剑修还剑
vm.runInContext(`
  S.merit=0; S.luck=50; S.stones=100; PENDING=0;
  chainTick();
`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length',ctx)===2,'回响事件两选项');
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.merit',ctx)>=10,'还剑功德 +10');
assert(vm.runInContext('S.flag.chain.jianzhong',ctx)===-1,'剑冢链收束');

console.log(fails===0?'smoke27: ALL PASS':'smoke27 FAILS: '+fails);
process.exit(fails?1:0);
