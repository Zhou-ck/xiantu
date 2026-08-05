const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
// 1) 初始仅 3 位相识
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__met=S.npcs.filter(n=>n.met).length; window.__all=S.npcs.length; }`,ctx);
assert(vm.runInContext('window.__met===3&&window.__all===28',ctx),'开局仅 3 位相识（共 28 位）');
// 2) 社交面板只显示相识者 + 偶遇入口
vm.runInContext(`{ panelSocial(); window.__h=document.getElementById('panelBody')._html; window.__cards=(window.__h.match(/item-card/g)||[]).length; }`,ctx);
assert(vm.runInContext('window.__h.indexOf("游历偶遇")>=0&&window.__h.indexOf("未曾谋面")>=0',ctx),'社交面板含偶遇入口与未识提示');
// 3) 偶遇解锁新角色
vm.runInContext(`{ window.__before=S.npcs.filter(n=>n.met).length; var k=0; while(k<40&&S.npcs.filter(n=>n.met).length===window.__before){encounterEvent();k++;} window.__after=S.npcs.filter(n=>n.met).length; window.__trys=k; }`,ctx);
assert(vm.runInContext('window.__after>window.__before',ctx),'偶遇可解锁新角色');
// 4) 交谈冷却：防刷好感
vm.runInContext(`{ const n=S.npcs.find(x=>x.met&&!x.foe); n.favor=30; n.talks=0; n.cd={talk:0,duel:0,gift:0}; npcChat(S.npcs.indexOf(n)); window.__cd=n.cd.talk; window.__f0=n.favor; window.__t0=n.talks; n.cd.talk=10; npcChat(S.npcs.indexOf(n)); window.__f2=n.favor; window.__t2=n.talks; }`,ctx);
assert(vm.runInContext('window.__cd>0&&window.__f2===window.__f0&&window.__t2===window.__t0',ctx),'成功交谈必设冷却；冷却期交谈不加好感不计数');
// 5) 切磋冷却
vm.runInContext(`{ const n=S.npcs.find(x=>x.met&&!x.foe); n.cd=n.cd||{talk:0,duel:0,gift:0}; n.cd.duel=10; const f0=n.favor; npcDuel(S.npcs.indexOf(n)); window.__d1=n.favor; window.__p1=PENDING; window.__f0=f0; }`,ctx);
assert(vm.runInContext('window.__d1===window.__f0&&window.__p1===0',ctx),'切磋冷却期直接婉拒（不加好感不开战）');
// 6) 冷却随时间递减
vm.runInContext(`{ const n=S.npcs.find(x=>x.met); n.cd=n.cd||{talk:0,duel:0,gift:0}; n.cd.talk=20; tickHates(12); window.__left=n.cd.talk; }`,ctx);
assert(vm.runInContext('window.__left===8',ctx),'冷却随时间递减');
// 7) 突破动画：小境界弹窗自动完成
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=20; S.cult=250; S.realm=0; PENDING=0; tryBreak(); window.__r={realm:S.realm,disp:document.getElementById('breakthrough').style.display,pend:PENDING}; }`,ctx);
assert(vm.runInContext('window.__r.realm===2&&window.__r.disp==="none"&&window.__r.pend===0',ctx),'小境界突破：弹窗动画完成并关闭（炼气三层）');
// 8) 突破动画：大境界含天劫流程
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=40; S.cult=3500; S.realm=12; S.kills=3; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; PENDING=0; tryBreak(); window.__p1=PENDING; }`,ctx);
assert(vm.runInContext('window.__p1>0',ctx),'金丹突破先进入心魔试炼');
for(let k=0;k<3;k++)clickChoice(0);
vm.runInContext(`window.__r2={realm:S.realm,disp:document.getElementById('breakthrough').style.display,pend:PENDING};`,ctx);
assert(vm.runInContext('window.__r2.realm===13&&window.__r2.disp==="none"&&window.__r2.pend===0',ctx),'金丹突破：天劫动画流程完成并晋升');
// 9) 飞升：心魔劫动画后成仙
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=45; S.cult=1000000; S.realm=40; S.merit=300; S.heartDemons=0; S.demonMarks=[]; S.temp={break:0}; PENDING=0; tryBreak(); window.__p2=PENDING; }`,ctx);
assert(vm.runInContext('window.__p2>0',ctx),'飞升先进入心魔试炼');
for(let k=0;k<3;k++)clickChoice(0);
vm.runInContext(`window.__r3={realm:S.realm,ending:S.endings.indexOf('飞升成仙')>=0};`,ctx);
assert(vm.runInContext('window.__r3.realm===41&&window.__r3.ending',ctx),'飞升：心魔劫动画后登仙');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
