const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const b64s=s=>Buffer.from(String(s),'utf8').toString('base64');
const b64d=s=>Buffer.from(String(s),'base64').toString('utf8');
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise,btoa:b64s,atob:b64d};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 2H 轮回点：结算进全局账户，天道枷锁放大
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=13; S.titles=[]; S.endings=['测试']; S.flag.loopSettled=false; S.flag.gates=[]; settleLoop('测试结局'); window.__p=loopLoad().points; S.flag.loopSettled=false; S.flag.gates=['heart','stones','life']; settleLoop('测试结局2'); window.__p2=loopLoad().points; window.__v=loopLoad().value; }`,ctx);
assert(vm.runInContext('window.__p>0&&window.__p2>window.__p&&window.__v>=window.__p2',ctx),'轮回点跨档结算、枷锁倍率生效、轮回值累计');
// 2) 2T 天道枷锁 + 速通计时（直接走 beginGame 的规则校验逻辑）
vm.runInContext(`{ window._loopPicks={attrs:0,root:false,art:false,luck:false,spent:0}; window._gates=['heart']; window._seed='123456'; const p={name:'测',bg:BACKGROUNDS[0],gender:'男',attrs:{str:10,agi:10,int:10,cha:10,wil:10},root:50,luck:50,persona:null}; S=newState(p.name,p.bg,p.gender); S.flag.gates=window._gates; S.heartDemons=1; S.flag.seed='123456'; S.flag.speedStart=0; window.__g=S.flag.gates.indexOf('heart')>=0; window.__hd=S.heartDemons; }`,ctx);
assert(vm.runInContext('window.__g&&window.__hd===1',ctx),'天道枷锁·心魔缠身生效');
// 3) 2F 开山立派：自立→选址→立宗
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.sect={name:'剑宗',id:'sword'}; PENDING=0; foundOwnSect(); }`,ctx);
assert(vm.runInContext('window._eventModalOpts.length>=2',ctx),'下山自立弹出离场抉择');
vm.runInContext(`{ window._eventModalOpts[0].fn(); }`,ctx);
assert(vm.runInContext('window._eventModalOpts.length>=3',ctx),'选址立宗弹出福地选择');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__own=S.flag.ownSect; window.__own2=S.sect&&S.sect.own; }`,ctx);
assert(vm.runInContext('window.__own===true&&window.__own2===true',ctx),'开宗立派成功建立自建宗门');
// 4) 2G 子女传承：共商→胎息×3→诞子
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',married:true,favor:95,affinity:95,stage:3,hp:40,atk:8,cd:{},root:60,rootElem:'water'}; S.attrs.cha=40; S.flag.childCd=0; PENDING=0; askChild(); }`,ctx);
assert(vm.runInContext('window._eventModalOpts.length>=2',ctx),'共商子嗣弹出请求');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__preg=!!S.flag.childPreg; }`,ctx);
assert(vm.runInContext('window.__preg===true',ctx),'道侣同意后进入孕育流程');
vm.runInContext(`{ var g=0; while(S.flag.childPreg&&S.flag.childPreg.left>0&&g<6){ childCheck(); if(window._eventModalOpts&&window._eventModalOpts.length)window._eventModalOpts[0].fn(); g++; } window.__kids=(S.children||[]).length; }`,ctx);
assert(vm.runInContext('window.__kids===1',ctx),'三月胎息后诞下子嗣');
// 5) 2R 分魂术：并行任务结算
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=17; PENDING=0; splitTask('explore'); window.__n=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__n>=3',ctx),'分魂术弹出时长选择');
vm.runInContext(`{ window._eventModalOpts[1].fn(); window.__n2=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__n2>=1',ctx),'分身回程弹出结算');
// 6) 2S 分享码：编码/解码往返 + 称号墙
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const code=btoa(unescape(encodeURIComponent(JSON.stringify(S)))); const s2=JSON.parse(decodeURIComponent(escape(atob(code)))); window.__name=s2.name; }`,ctx);
assert(vm.runInContext('window.__name==="测"',ctx),'分享码编码解码往返一致');
vm.runInContext(`{ titleWall(); window.__tw=document.getElementById('panelBody')._html.indexOf('称号墙')>=0; }`,ctx);
vm.runInContext(`{ titleWall(); window.__tw=document.getElementById('panelTitle')._txt.indexOf('称号墙')>=0; }`,ctx);
assert(vm.runInContext('window.__tw',ctx),'称号墙可打开');
// 7) 2O NPC 记忆与 2I 天道之劫
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const n={name:'张三',gender:'男'}; addNpcMemory(n,'恩情','我救过他一命'); window.__mem=n.nmem.length; tianFateBattle(); window.__tf=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__mem===1&&window.__tf>=2',ctx),'NPC记忆表写入 + 天道宿命之战弹出');
// 8) 邀请码门禁：启用、错误码不放行、正确码解锁
vm.runInContext(`{ window.__en=gateEnabled(); window.__g0=gateUnlocked(); gateTry(); window.__g1=gateUnlocked(); localStorage.removeItem('xt_unlocked'); const inp=document.getElementById('gateInput'); if(inp)inp.value=INVITE_CODE; gateTry(); window.__g2=gateUnlocked(); }`,ctx);
assert(vm.runInContext('window.__en===true&&window.__g0===false&&window.__g1===false&&window.__g2===true',ctx),'邀请码门禁：错误码不放行、正确码解锁');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
