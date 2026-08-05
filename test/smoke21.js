const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 性格复合身份：模板库、标签、判定加成、道心漂移
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__n=PERSONALITIES.length; window.__p=pickPersona(BACKGROUNDS[0]); S.persona=Object.assign({},window.__p,{drift:0}); window.__has=personaHas(S,'霸道'); S.persona.tags=['霸道']; window.__has2=personaHas(S,'霸道'); window.__bonus=personaBonus(S,'str'); addDrift(10); window.__d=S.persona.drift; }`,ctx);
assert(vm.runInContext('window.__n>=16&&window.__p.tags.length>=2&&window.__has===false&&window.__has2===true',ctx),'16 性格模板 + 标签判定生效');
assert(vm.runInContext('window.__bonus>=0&&window.__d===1',ctx),'性格判定加成与道心漂移');
// 2) 心境：默认可调、影响判定、突破节点快照/回溯
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__m0=S.mood; window.__mod0=moodMod(); addMood(25); window.__m1=S.mood; window.__mod1=moodMod(); S.cult=5000; S.stones=900; S.items=[{name:'回溯符',type:'consumable',use:'rewind'}]; S.flag.tribSave=tribSnapshot(); S.cult=100; S.stones=10; tribRestore(); window.__c=S.cult; window.__st=S.stones; }`,ctx);
assert(vm.runInContext('window.__m0===60&&window.__mod0===0&&window.__m1===85&&window.__mod1===2',ctx),'心境状态与判定修正');
assert(vm.runInContext('window.__c===5000&&window.__st===900',ctx),'渡劫节点快照与回溯还原');
// 3) 心魔叙事库：30+ 段、类型可抽取
vm.runInContext(`{ window.__n2=DEMON_NARR.length; window.__t=pickDemonNarr('fear'); }`,ctx);
assert(vm.runInContext('window.__n2>=30&&window.__t.length>5',ctx),'心魔叙事库 30+ 段');
// 4) 特效层：测试桩下不崩溃、fxOn 自动关闭
vm.runInContext(`{ fxSetLevel('high'); window.__on=fxOn(); fxShake(3); fxHitstop(100); fxFloatText('x'); fxBurst(10); fxFlash('#fff'); window.__p=fxPaused(); }`,ctx);
assert(vm.runInContext('window.__on===false',ctx),'无真实 DOM 时特效微操自动关闭');
// 5) 道途页：三层目标可打开
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); daoPathPage(); window.__h=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__h.indexOf("当前目标")>=0&&window.__h.indexOf("长期目标")>=0',ctx),'道途页显示三层目标');
// 6) 副业微操自动路径：测试桩直接结算
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.prof='alchemy'; S.profLevel=1; S.profExp=0; S.attrs.int=40; S.mats={herb:5}; S.stones=500; S.items=[]; PENDING=0; craft(0); window.__items=S.items.length; window.__herb=S.mats.herb; }`,ctx);
assert(vm.runInContext('window.__items===1&&window.__herb===4',ctx),'副业炼制（自动路径）正常结算');
// 7) 渡劫小游戏：可弹三波选项、结算回调返回分档
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__cb=null; tribMiniGame(function(b){window.__cb=b}); window.__opts=window._eventModalOpts?window._eventModalOpts.length:0; }`,ctx);
assert(vm.runInContext('window.__opts>=3',ctx),'渡劫小游戏弹出三波选项');
vm.runInContext(`{ window._eventModalOpts[0].fn(); if(window._eventModalOpts&&window._eventModalOpts.length)window._eventModalOpts[1].fn(); if(window._eventModalOpts&&window._eventModalOpts.length)window._eventModalOpts[0].fn(); window.__cb2=window.__cb; }`,ctx);
assert(vm.runInContext('typeof window.__cb2==="number"',ctx),'渡劫小游戏结算回调返回分档');
// 8) 自动路径：测试桩 fxOn 关闭，天雷劫突破不卡流程
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=40; S.cult=3500; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; S.flag.tribType='thunder'; PENDING=0; tryBreak(); window.__opts0=window._eventModalOpts?window._eventModalOpts.length:0; }`,ctx);
vm.runInContext(`{ window._eventModalOpts=[]; S=newState('测',BACKGROUNDS[0]); S.attrs.wil=40; S.cult=3500; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; S.flag.tribType='thunder'; PENDING=0; tryBreak(); window.__opts0=window._eventModalOpts?window._eventModalOpts.length:0; }`,ctx);
assert(vm.runInContext('window.__opts0===0&&S.flag.tribType==="thunder"',ctx),'天雷劫自动路径不弹微操窗口、预告保留至结算');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
