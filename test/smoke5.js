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
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 弹窗开启：显示、PENDING 锁定、进度条初始 0
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; doCultivate(30,'quiet',{auto:false,noEvents:true}); }`,ctx);
assert(vm.runInContext('document.getElementById("cultivate").style.display',ctx)==='flex','闭关弹窗打开');
assert(vm.runInContext('PENDING',ctx)===1,'弹窗期间锁定全局操作（PENDING=1）');
assert(vm.runInContext('document.getElementById("cultDay")._txt',ctx).indexOf('0 / 30')>=0,'进度显示 第 0 / 30 日');
// 2) 手动推进至完成：修为到账、streak 累计、PENDING 归零、弹窗关闭
vm.runInContext(`{ var n=0; while(_cult&&!_cult.done&&n<2000){_cultTick(); n++;} window.__n=n; }`,ctx);
assert(vm.runInContext('S.cult>0&&S.cultStreak===30',ctx),'手动推进完成：修为+30日 streak');
assert(vm.runInContext('PENDING===0&&document.getElementById("cultivate").style.display==="none"',ctx),'完成后解除锁定并关闭弹窗');
// 3) 事件抉择：事件弹出 → 暂停 → 选择后继续 → 完成
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; doCultivate(30,'quiet',{auto:false,noEvents:true}); _cultFireEvent(); window.__p=_cult.paused; window.__c=_cult.choices.length; }`,ctx);
assert(vm.runInContext('window.__p===true&&window.__c>=2',ctx),'事件弹出并暂停修炼');
assert(vm.runInContext('document.getElementById("cultLog")._html.indexOf("洞府异动")>=0',ctx),'事件文本显示在弹窗日志');
vm.runInContext(`{ _cultResolve(0); window.__p2=_cult.paused; }`,ctx);
assert(vm.runInContext('window.__p2===false',ctx),'选择后恢复修炼');
vm.runInContext(`{ var n=0; while(_cult&&!_cult.done&&n<2000){_cultTick(); n++;} }`,ctx);
assert(vm.runInContext('PENDING===0&&S.cultStreak===30',ctx),'事件处理后正常完成');
// 4) 提前出关：部分进度结算
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; doCultivate(90,'quiet',{auto:false,noEvents:true}); for(var k=0;k<20;k++)_cultTick(); cultAbort(); window.__c2=S.cult; window.__s=S.cultStreak; window.__p3=PENDING; }`,ctx);
assert(vm.runInContext('window.__p3===0&&document.getElementById("cultivate").style.display==="none"',ctx),'提前出关：弹窗关闭、解除锁定');
assert(vm.runInContext('window.__s>0&&window.__s<90',ctx),'提前出关：按进度结算（streak 部分累计）');
// 5) 道侣双修：默认双修、立绘入窗、可切换独修、完成后情缘+1 且双修计数+1
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; S.daoPartner={name:'苏婉',role:'采药女',stage:3,favor:70,affinity:60}; doCultivate(30,'quiet',{auto:false,noEvents:true}); }`,ctx);
assert(vm.runInContext('_cult.solo===false',ctx),'有道侣时默认双人同修');
assert(vm.runInContext('document.getElementById("cultPartner")._html.indexOf("苏婉")>=0&&document.getElementById("cultPartner")._html.indexOf("art-img")>=0',ctx),'道侣立绘与姓名显示在弹窗');
assert(vm.runInContext('document.getElementById("cultMode")._txt',ctx).indexOf('双人同修')>=0,'模式按钮显示双人同修');
vm.runInContext(`{ cultToggleMode(); window.__solo=_cult.solo; }`,ctx);
assert(vm.runInContext('window.__solo===true',ctx),'可切换为独修守心');
vm.runInContext(`{ const before=_cult.solo; cultToggleMode(); window.__blocked=_cult.solo===before; }`,ctx);
assert(vm.runInContext('window.__blocked===true',ctx),'刚切换后 10 日内不可再次切换（防频繁切换）');
vm.runInContext(`{ _cult.lastSwitchDay=-99; _cult.switches=0; _cult.solo=false; _cult.curMode='dual'; var n=0; while(_cult&&!_cult.done&&n<2000){_cultTick(); n++;} window.__f=S.daoPartner.favor; window.__dc=S.flag.dualCount; }`,ctx);
assert(vm.runInContext('window.__f===71&&window.__dc===1',ctx),'双修完成后情缘+1、双修次数+1');
// 6) 独修模式：有道侣时独修不加双修计数
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; S.daoPartner={name:'苏婉',role:'采药女',stage:3,favor:70,affinity:60}; S.flag.dualCount=0; doCultivate(30,'quiet',{auto:false,noEvents:true,solo:true}); var n=0; while(_cult&&!_cult.done&&n<2000){_cultTick(); n++;} window.__dc2=S.flag.dualCount||0; }`,ctx);
assert(vm.runInContext('window.__dc2===0',ctx),'独修模式不累计双修次数');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
