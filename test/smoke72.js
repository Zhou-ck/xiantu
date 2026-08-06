/* v50 丹药系统冒烟：丹毒 / 研创 / 丹经 / 新丹方 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.stones=9999; S.mats.jade=5; S.mats.herb=10; S.mats.sherb=10; S.mats.demonCore=5; S.mats.iron=5; S.flag={}; S.attrs.int=40; S.attrs.wil=30; S.realm=9; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;`,ctx);
// T1 丹毒累积与阈值惩罚
vm.runInContext(`addDanTox(20,'测试'); addDanTox(15,'测试'); window.__tox=S.flag.danTox; window.__pen30=danToxCultPenalty(S); window.__hp0=calcMaxHp(S); addDanTox(30,'测试'); window.__pen60=danToxCultPenalty(S); window.__hp1=calcMaxHp(S);`,ctx);
assert(vm.runInContext('window.__tox===35&&window.__pen30===0.95',ctx),'丹毒 30 档修炼效率 -5%');
assert(vm.runInContext('window.__pen60===0.9&&window.__hp1<window.__hp0',ctx),'丹毒 60 档再 -5% 且气血 -10%');
// T2 丹毒反噬：≥80 每 30 日触发弹窗
vm.runInContext(`addDanTox(50,'测试'); S.flag.danToxRageAt=-1; S.days=90; PENDING=0; passTime(1); window.__rage=window._eventModalOpts?window._eventModalOpts.length:0; window.__rageAt=S.flag.danToxRageAt;`,ctx);
assert(vm.runInContext('window.__rage>0&&window.__rageAt===3',ctx),'丹毒 ≥80 触发反噬事件（每 30 日一次）');
// T3 聚灵丹连服毒性翻倍 + 排毒丹
vm.runInContext(`resolveEventModal(0); S.flag.danTox=0; S.days=100; S.flag.pillTaken=false; S.flag.pillTakenDay=-99; S.flag.pillResist=0; S.pillBuff=0; S.items=[{name:'聚灵丹',type:'consumable',quality:2,count:1,use:'pill',desc:'x'}]; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0; consume(0); window.__tox1=S.flag.danTox; S.days=101; S.items=[{name:'聚灵丹',type:'consumable',quality:2,count:1,use:'pill',desc:'x'}]; consume(0); window.__tox2=S.flag.danTox; window.__resist=S.flag.pillResist;`,ctx);
assert(vm.runInContext('window.__tox1===6&&window.__tox2===18&&window.__resist===1',ctx),'聚灵丹首次 +6，7 日内连服翻倍再 +12');
vm.runInContext(`S.items=[{name:'排毒丹',type:'consumable',quality:2,count:1,use:'detox',desc:'x'}]; consume(0); window.__toxAfter=S.flag.danTox;`,ctx);
assert(vm.runInContext('window.__toxAfter===3',ctx),'排毒丹 -15 丹毒');
// T4 丹方研创：成功解锁新丹方
vm.runInContext(`S.prof='alchemy'; S.profLevel=5; S.profExp=0; S.mats.herb=10; S.mats.sherb=10; S.mats.demonCore=5; researchTry('tonic'); window.__opts=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__opts>=3',ctx),'研创弹出火候选择');
vm.runInContext(`resolveEventModal(1); window.__done=Object.keys(S.flag.researchDone||{}); window.__known=RECIPES.alchemy.filter(r=>r.name==='排毒丹').length>0&&recipeKnown(RECIPES.alchemy.find(r=>r.name==='排毒丹'));`,ctx);
assert(vm.runInContext('window.__done.length>=1&&RECIPES.alchemy.some(r=>r.name===window.__done[0])&&recipeKnown(RECIPES.alchemy.find(r=>r.name===window.__done[0]))',ctx),'研创成功解锁新丹方并可在手札炼制');
// T5 新丹方入物品目录 + schema 校验
assert(vm.runInContext('itemCatalog()["回天丹"]&&itemCatalog()["五行丹"]&&itemCatalog()["排毒丹"]',ctx),'新丹方全部入物品目录');
assert(vm.runInContext('validatePills().length===0&&validateAll().length===0',ctx),'丹药数据表 schema 校验 0 错误');
// T6 丹经收录
vm.runInContext(`S.seenI['聚灵丹']=1; panelDanJing(); window.__jing=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__jing.indexOf("聚灵丹")>=0&&window.__jing.indexOf("丹毒")>=0',ctx),'丹经展示丹药与丹毒信息');

console.log(fails===0?'smoke72: ALL PASS':'smoke72 FAILS: '+fails);
process.exit(fails?1:0);
