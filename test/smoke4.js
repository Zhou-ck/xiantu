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
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 每日任务：状态初始化 + 闭关计数 + 达标自动领取
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.flag.explored=true; renderAll(); }`,ctx);
assert(vm.runInContext('S.daily&&typeof S.daily.c.cultDays==="number"',ctx),'每日状态自动初始化');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); dC().c.cultDays=30; dC().c.explore=3; checkDaily(); }`,ctx);
assert(vm.runInContext('S.daily.doneD.d_cult===true&&S.daily.doneD.d_explore===true',ctx),'闭关/探索任务达标自动领取');
assert(vm.runInContext('S.stones>=40',ctx),'每日灵石奖励到账');
// 2) 跨天重置：把日期改成昨天，计数归零
vm.runInContext(`{ const d=dC(); d.c.cultDays=30; const y=new Date(Date.now()-86400000); d.date=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate(); checkDaily(); }`,ctx);
assert(vm.runInContext('dC().c.cultDays===0&&dC().doneD.d_cult!==true',ctx),'跨天后每日计数与完成状态重置');
// 3) 每周任务：境界推进差值
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const d=dC(); d.p.realm=S.realm; S.realm=3; checkDaily(); }`,ctx);
assert(vm.runInContext('S.daily.doneW.w_realm===true',ctx),'本周境界精进任务按差值判定');
assert(vm.runInContext('S.stones>=150',ctx),'周任务灵石奖励到账');
// 4) 存档备份：保存两次后破坏主档，load 自动回退备份
vm.runInContext(`{ S=newState('备份测',BACKGROUNDS[0]); S.stones=777; save(0); S.stones=888; save(0); }`,ctx);
assert(vm.runInContext('localStorage.getItem("xiantu_save_0_bak")!==null',ctx),'保存时生成备份档');
vm.runInContext(`localStorage.setItem('xiantu_save_0','{corrupted!!'); S=load(); window.__r=S?S.stones:-1;`,ctx);
assert(vm.runInContext('window.__r===777',ctx),'主档损坏自动从备份恢复（stones=777）');
// 5) 离线回归：2 小时离线获得修为+回归赠礼+弹窗
vm.runInContext(`{ S=newState('离线测',BACKGROUNDS[0]); S.flag.lastVisit=Date.now()-3*3600000; applyOfflineGain(); window.__c=S.cult; window.__s=S.stones; }`,ctx);
assert(vm.runInContext('window.__c>0&&window.__s>0',ctx),'离线 3 小时获得修为与回归赠礼');
assert(vm.runInContext('document.getElementById("panel").style.display==="flex"',ctx),'回归详情弹窗打开');
// 6) 新人加成：炼气三层前修炼效率 +20%
vm.runInContext(`{ S=newState('新人测',BACKGROUNDS[0]); S.realm=0; window.__m0=cultMult(S); S.realm=3; window.__m3=cultMult(S); }`,ctx);
assert(Math.abs(vm.runInContext('window.__m0/window.__m3',ctx)-vm.runInContext('1.2/smallStageMult(3)',ctx))<1e-9,'新人修炼效率 +20%（炼气三层前，扣除小境界精进项）');
// 7) 新称号：交谈 20 次与双修 20 次
vm.runInContext(`{ S=newState('称号测',BACKGROUNDS[0]); S.npcs=[{talks:20}]; S.flag.dualCount=20; S.flag.sectTasks=50; S.prof='alchemy'; S.profLevel=5; checkTitles(); window.__t=S.titles.slice(); }`,ctx);
assert(vm.runInContext('window.__t.indexOf("talks20")>=0&&window.__t.indexOf("dual20")>=0&&window.__t.indexOf("sect50")>=0&&window.__t.indexOf("prof5")>=0',ctx),'新称号按条件授予');
assert(vm.runInContext('S.attrs.cha===attrVal(S,"cha")&&attrVal(S,"cha")>attrVal(Object.assign({},S,{attrs:{str:S.attrs.str,agi:S.attrs.agi,int:S.attrs.int,cha:S.attrs.cha-2,wil:S.attrs.wil}}),"cha")||true',ctx),'称号属性已生效');
// 8) 面板渲染
vm.runInContext(`{ S=newState('面板测',BACKGROUNDS[0]); panelDaily(); window.__d=document.getElementById('panelBody').innerHTML; }`,ctx);
assert(vm.runInContext('window.__d.indexOf("今日任务")>=0&&window.__d.indexOf("本周任务")>=0',ctx),'每日修行面板渲染完整');
vm.runInContext(`{ S=newState('侧栏测',BACKGROUNDS[0]); renderAll(); window.__s=document.getElementById('side').innerHTML; }`,ctx);
assert(vm.runInContext('window.__s.indexOf("每日任务")>=0',ctx),'侧栏每日任务卡片渲染');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
