const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 托管 tier 效率传递：trustMult 生效，_cultResult 使用传入效率而非固定 0.65
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; S.stones=500; S.items=[{name:'千年灵乳',type:'consumable',quality:3,use:'essence'}]; PENDING=0; doCultivate(30,'quiet',{auto:false,noEvents:true,trust:true,trustMult:1.05}); window.__tm=_cult.trustMult; }`,ctx);
assert(vm.runInContext('_cult&&_cult.trust===true&&Math.abs(_cult.trustMult-1.05)<1e-9',ctx),'灵乳托管 trustMult=1.05 传递');
vm.runInContext(`{ _cult.elapsed=_cult.realMs; _cultFinish(1); window.__g=S.cult; }`,ctx);
assert(vm.runInContext('window.__g>0',ctx),'托管结算获得修为');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; S.stones=500; S.items=[{name:'千年灵乳',type:'consumable',quality:3,use:'essence'}]; PENDING=0; startTrust(30,'elixir'); window.__left=S.items.length; window.__g2=S.cult; }`,ctx);
assert(vm.runInContext('window.__left===0&&window.__g2>0',ctx),'startTrust 消耗资源并完成托管');
// 2) 托管至目标：toRealm 设定、修为攒够自动停转
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=50; S.root=50; S.cultStreak=0; S.days=0; S.realm=0; S.stones=500; PENDING=0; doCultivate(365,'quiet',{auto:false,noEvents:true,trust:true,trustMult:0.4,toRealm:3}); }`,ctx);
assert(vm.runInContext('_cult&&_cult.toRealm===3',ctx),'托管至目标设定目标境界');
vm.runInContext(`{ S.cult=THRESHOLDS[3]-10; S.flag.boostNext=false; S.flag.eraDone={}; S.flag.lastYear=1; _cult.elapsed=_cult.realMs; _cultFinish(1); window.__cult=S.cult; window.__log=document.getElementById('story')._html; }`,ctx);
assert(vm.runInContext('window.__cult===THRESHOLDS[3]',ctx),'目标达成：修为恰好到目标门槛即停');
assert(vm.runInContext('window.__log.indexOf("托管目标达成")>=0',ctx),'托管目标达成提示');
// 3) 暂存待处理：托管事件可暂存，出关前统一处理
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; PENDING=0; doCultivate(30,'quiet',{auto:false,noEvents:true,trust:true,trustMult:0.4}); _cultFireEvent(); }`,ctx);
let hadDefer=false;
(function scan(el){if(!el||!el.children)return;for(const c of el.children){if(c.id==='cultChoices'&&c.children)for(const b of c.children){if(String(b.textContent||b._txt||'').indexOf('暂存')>=0)hadDefer=true}scan(c)}})(ids['cultLog']);
assert(hadDefer,'托管事件提供「暂存待处理」按钮');
vm.runInContext(`{ _cultDefer({txt:'灵气潮汐忽然涌动，如江河倒灌、经脉胀痛！',opts:[{txt:'守心',fn:()=>{}}]}); window.__q=_cult.queued.length; window.__paused=_cult.paused; }`,ctx);
assert(vm.runInContext('window.__q>=1&&window.__paused===false',ctx),'暂存后不打断修炼');
vm.runInContext(`{ window.__before=_cult.queued.length; _cultOpenQueued(); window.__p2=_cult.paused; window.__q2=_cult.queued.length; }`,ctx);
assert(vm.runInContext('window.__p2===true&&window.__q2<window.__before',ctx),'出关前可处理暂存异动');
// 4) 暧昧：好感≥60 可结暧昧（异性），结为道侣后暧昧保留
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.gender='男'; const n={name:'苏婉',role:'采药女',gender:'女',desc:'',style:'int',persona:'温婉',taste:'材',favor:70,realm:2,stage:2,atk:7,hp:30,mood:70,talks:0,gifts:0,growth:0,rootElem:'water',cd:{talk:0,duel:0,gift:0},chat:['草木']}; S.npcs=[n]; S.affairs=[]; S.attrs.cha=18; affairOffer(n); window.__affair=(S.affairs||[]).indexOf(n)>=0; }`,ctx);
assert(vm.runInContext('window.__affair',ctx),'好感≥60 可结下暧昧（红颜/蓝颜）');
vm.runInContext(`{ const n=S.npcs[0]; n.favor=88; n.cd={talk:0,duel:0,gift:0}; confessLove(n); window.__dp=S.daoPartner&&S.daoPartner.name==='苏婉'; }`,ctx);
assert(vm.runInContext('window.__dp',ctx),'好感≥85 且无道侣可结为道侣');
// 5) 修罗场：道侣+暧昧存在时风险>0，事件弹窗
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'林霜',role:'剑阁女侠',gender:'女',favor:80,affinity:70,stage:2,hp:30,atk:6}; S.affairs=[{name:'苏婉',role:'采药女',gender:'女',favor:70,stage:1,hp:20,atk:4},{name:'云瑶',role:'丹房女修',gender:'女',favor:65,stage:2,hp:25,atk:5}]; window.__risk=shuraRisk(); shuraField(); window.__opts=window._eventModalOpts?window._eventModalOpts.length:0; window.__disp=document.getElementById('panel').style.display; }`,ctx);
assert(vm.runInContext('window.__risk>0.1',ctx),'道侣+暧昧越多修罗场风险越高');
assert(vm.runInContext('window.__opts>=2&&window.__disp==="flex"',ctx),'修罗场事件弹出抉择');
// 6) 善恶值显性：netMerit 与侧栏展示
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.merit=60; S.karma=10; window.__net=netMerit(); window.__gi=goodEvilInfo()[0]; renderAll(); window.__side=document.getElementById('side')._html; }`,ctx);
assert(vm.runInContext('window.__net===50&&window.__gi==="善行昭昭"',ctx),'善恶值=功德-业力（显性）');
assert(vm.runInContext('window.__side.indexOf("善恶值")>=0&&window.__side.indexOf("善行昭昭")>=0',ctx),'侧栏常驻显示善恶值与档位');
// 7) 节日：第 0 年不触发；跨年后按日期段每年触发一次
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.days=3; S.flag.lastYear=0; S.flag.festDone={}; PENDING=0; try{passTime(1);}catch(e){window.__y0err=e.message} window.__y0=PENDING===0; window.__days=S.days; window.__fd=JSON.stringify(S.flag.festDone); }`,ctx);
assert(vm.runInContext('window.__y0',ctx),'第 0 年不触发节日');
vm.runInContext(`{ S.flag.lastYear=1; S.days=1; PENDING=0; passTime(1); window.__fired=(S.flag.festDone['1-chunjie']||false); window.__p2=PENDING; }`,ctx);
assert(vm.runInContext('window.__fired===true&&window.__p2===1',ctx),'第二年春节触发一次并弹出抉择');
// 8) 道统传承：化神收徒、传功成长、身陨转生为弟子
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=21; S.disciples=[]; panelSocial(); window.__has=document.getElementById('panelBody')._html.indexOf('道统传承')>=0; }`,ctx);
assert(vm.runInContext('window.__has',ctx),'化神后人际面板出现道统传承');
vm.runInContext(`{ const n={name:'小石头',gender:'男',role:'散修剑客',desc:'',style:'str',favor:70,realm:1,stage:1,atk:7,hp:30,root:50,rootElem:'metal',mood:70,talks:0,gifts:0,growth:0,met:true,cd:{talk:0,duel:0,gift:0}}; S.npcs=[n]; takeDisciple(); const opts=window._eventModalOpts||[]; window.__opt0=opts[0]?opts[0].txt:''; opts[0].fn(); window.__disc=S.disciples.length; }`,ctx);
assert(vm.runInContext('window.__disc===1&&S.disciples[0].name==="小石头"',ctx),'收相识为徒');
vm.runInContext(`{ const d=S.disciples[0]; const p0=d.progress||0; discipleAct(0,'art'); window.__prog=(d.progress||0)>p0; }`,ctx);
assert(vm.runInContext('window.__prog',ctx),'传功增加弟子修行进度');
vm.runInContext(`{ const old=S; S.deaths=0; S.disciples=[{name:'小石头',gender:'男',root:60,stage:1,progress:10,favor:70,art:{name:'太乙剑诀',mult:1.2},talent:{n:'剑心通明'}}]; S.endings=[]; rebirthAsDisciple(); window.__ns=S.name; window.__arts=S.arts.some(a=>a.name==='太乙剑诀'); }`,ctx);
assert(vm.runInContext('window.__ns==="小石头"&&window.__arts',ctx),'身陨可转生为弟子且继承功法');
// 9) 心性途径：读书抄经 / 功德累计
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.attrs.wil=5; S.attrs.int=16; S.flag.readCd=0; S.days=0; PENDING=0; readBooks(); window.__wil1=S.attrs.wil; window.__cd=S.flag.readCd; }`,ctx);
console.log('dbg readBooks',JSON.stringify(vm.runInContext('({wil:window.__wil1,cd:window.__cd,pend:PENDING,story:document.getElementById("story")._html.slice(-120)})',ctx)));
assert(vm.runInContext('window.__wil1===7',ctx),'读书抄经养道心（智慧≥15 收益×2）');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
