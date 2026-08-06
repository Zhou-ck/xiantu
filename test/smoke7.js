const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 无道侣时「双修」「道侣」锁定并提示
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); PENDING=0; tabHome('cult'); window.__h1=document.getElementById('panelBody')._html; tabHome('social'); window.__h2=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__h1.indexOf("双修")>=0&&window.__h1.indexOf("需先有道侣")>=0&&window.__h1.indexOf("locked")>=0',ctx),'修炼页双修无伴侣时锁定并提示');
assert(vm.runInContext('window.__h2.indexOf("道侣")>=0&&window.__h2.indexOf("需先有道侣")>=0',ctx),'人际页道侣无伴侣时锁定并提示');
// 2) 有道侣后解锁并可进入道侣面板
vm.runInContext(`{ S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:70,stage:2,hp:30,atk:6,desc:'采药为生'}; tabHome('social'); window.__h3=document.getElementById('panelBody')._html; tabGo('social',3); window.__h4=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__h3.indexOf("需先有道侣")<0',ctx),'有道侣后道侣项解锁');
assert(vm.runInContext('window.__h4.indexOf("情缘")>=0',ctx),'点击进入道侣面板');
// 3) 宗门：未入宗锁定大比/月俸；入宗后解锁
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); tabHome('sect'); window.__h5=document.getElementById('panelBody')._html; S.sect={name:'剑宗',dark:false,art:{name:'太乙剑诀',mult:1.2},id:'sword'}; S.contrib=0; S.rank=0; tabHome('sect'); window.__h6=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__h5.indexOf("需先拜入宗门")>=0&&window.__h6.indexOf("需先拜入宗门")<0',ctx),'宗门选项入宗前后正确锁定/解锁');
// 4) 心魔历练与试炼塔境界门槛
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=0; tabHome('cult'); window.__h7=document.getElementById('panelBody')._html; S.realm=9; tabHome('cult'); window.__h8=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__h7.indexOf("筑基之后")>=0&&window.__h8.indexOf("筑基之后")<0',ctx),'心魔历练境界门槛锁定/解锁');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=0; PENDING=0; doTower(); window.__p1=PENDING; S.realm=3; doTower(); window.__p2=PENDING; }`,ctx);
assert(vm.runInContext('window.__p1===0&&window.__p2===1',ctx),'试炼塔低境界拦截、达标后开启战斗');
// 5) 自动存档到第 1 格
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.stones=999; SLOT=2; autoSaveNow(); window.__raw=JSON.parse(localStorage.getItem('xiantu_save_0')); window.__meta=JSON.parse(localStorage.getItem('xiantu_save_meta')); }`,ctx);
assert(vm.runInContext('window.__raw.stones===999&&window.__meta.last===0',ctx),'自动存档固定写入第 1 格');
// 6) 每日/每周任务新数值
vm.runInContext('window.__q={cult:DAILY_QUESTS.find(x=>x.id==="d_cult").target,kill:DAILY_QUESTS.find(x=>x.id==="d_kill").target,talk:DAILY_QUESTS.find(x=>x.id==="d_talk").target,tower:WEEKLY_QUESTS.find(x=>x.id==="w_tower").target};',ctx);
assert(vm.runInContext('window.__q.cult===15&&window.__q.kill===3&&window.__q.talk===2&&window.__q.tower===5',ctx),'每日/每周任务目标按短流程适配');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
