/* 生涯统计墙冒烟：聚合展示 + 新计数器（瓶颈破关/大境界突破） */
const fs=require('fs'),vm=require('vm');
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 生涯统计墙聚合展示
vm.runInContext(`
  S=newState('测试未',BACKGROUNDS[0]);
  S.flag.cultDaysTotal=360; S.flag.insights=3; S.flag.bigBreaks=4; S.flag.bottleneckBreaks=2;
  S.flag.exploreCount=60; S.flag.dungeons=5; S.flag.tower=18; S.flag.tideWins=3; S.flag.tideFails=1;
  S.kills=45; S.wins=40; S.flag.tech={pts:6,ups:{agg:2,agi:1}};
  S.flag.partnerCount=1; S.flag.dualCount=15; S.flag.dualDays=300; S.flag.daolunWins=8; S.flag.daolunLosses=2;
  S.prof='alchemy'; S.profLevel=4; S.flag.enhanceCount=7;
  S.flag.craftLog={'回春丹':{count:12,best:'上品'}};
  S.seenI={a:1,b:1}; S.seenE={c:1}; S.titles=['kills10']; S.endings=['飞升成仙']; S.rebirths=2;
  S.merit=120; S.karma=5;
  careerWall();
`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
for(const k of ['修炼','历练','战斗','人际','副业','收藏','善恶'])assert(html.indexOf(k)>=0,'生涯统计含「'+k+'」区块');
assert(html.indexOf('360 日')>=0,'闭关总日数显示');
assert(html.indexOf('18 层')>=0,'试炼塔显示');
assert(html.indexOf('8 胜')>=0,'论道战绩显示');
// ---- T2 瓶颈破关计数器
vm.runInContext(`
  S.realm=8; S.cult=950; S.wis=0; S.trail=0; S.flag.bnActive=true; S.flag.bottleneckBreaks=0;
  addWis(20); addTrail(20);
`,ctx);
assert(vm.runInContext('S.flag.bottleneckBreaks',ctx)===1,'瓶颈破关计数 +1');
// ---- T3 大境界突破计数器（直接结算路径）
vm.runInContext(`
  S.realm=13; S.flag.bigBreaks=0; S.attrs={str:30,agi:10,int:10,cha:10,wil:30}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  applyBreakSuccess(13,{r:20,mod:20,t:40,dc:18},0,{thunderFails:[],heartFail:false,xinmoFails:[]});
`,ctx);
assert(vm.runInContext('S.flag.bigBreaks',ctx)===1,'大境界突破计数 +1');

console.log(fails===0?'smoke41: ALL PASS':'smoke41 FAILS: '+fails);
process.exit(fails?1:0);
