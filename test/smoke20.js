const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
/* 固定随机：避免 8%/12% 的随机事件分支打断主流程，测试确定化 */
vm.runInContext('Math.random=function(){return 0.5}',ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) 关系阶段：好感与心动共同决定
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2}; window.__st=partnerStage(S.daoPartner); }`,ctx);
assert(vm.runInContext('window.__st.lv===3&&window.__st.name==="两心相知"',ctx),'关系阶段按好感+心动判定');
// 2) 约会：地点选择 → 进入情境 → 记录初游与心动记忆
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; S.days=10; PENDING=0; daoDate(); window.__n=window._eventModalOpts.length; window.__disp=document.getElementById('panel').style.display; }`,ctx);
assert(vm.runInContext('window.__n>=4&&window.__disp==="flex"',ctx),'约会地点选择弹窗');
vm.runInContext(`{ window.__spot=window._eventModalOpts[0].txt; window._eventModalOpts[0].fn(); }`,ctx);
assert(vm.runInContext('window._eventModalOpts.length>=2',ctx),'选择地点后进入该地点的约会选项');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__mems=(S.daoPartner.memories||[]).length; window.__fd=S.daoPartner.firstDate; }`,ctx);
assert(vm.runInContext('window.__mems>=1&&window.__fd&&window.__fd.spot',ctx),'约会结束记录心动记忆与初游地点');
// 3) 多幕双修：四幕推进并结算修为/情缘/次数
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; S.cult=0; S.flag.dualCount=0; PENDING=0; doDualCultivate(); window.__st2=_dual?_dual.st:0; }`,ctx);
assert(vm.runInContext('window.__st2===1&&window._eventModalOpts.length>=3',ctx),'双修进入第一幕并弹出选项');
vm.runInContext(`{ var guard=0; while(_dual&&guard<8){ var o=window._eventModalOpts||[]; if(o.length)o[0].fn(); guard++; } window.__g=S.cult; window.__dc=S.flag.dualCount; window.__fav=S.daoPartner.favor; }`,ctx);
assert(vm.runInContext('window.__g>0&&window.__dc===1&&window.__fav>80',ctx),'双修完成：修为增加、次数+1、情缘提升');
// 4) 提亲：满足条件可提亲，扣除彩礼并结缡
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.stones=600; S.mats={demonCore:2,jade:2}; S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:92,affinity:92,stage:2,hp:30,atk:6,cd:{}}; PENDING=0; daoPropose(); window.__opts=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__opts>=2',ctx),'条件满足时可提亲');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__m=S.daoPartner.married; window.__st=S.stones; window.__dc2=S.mats.demonCore; window.__title=S.titles.indexOf('married')>=0; }`,ctx);
assert(vm.runInContext('window.__m===true&&window.__st===100&&window.__dc2===1&&window.__title',ctx),'提亲扣除彩礼、结为结缡道侣并获得称号');
// 5) 纪念日：临近可触发，获取昵称并加深情缘
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:90,affinity:90,stage:2,hp:30,atk:6,cd:{},anniv:0,memories:[]}; S.days=365; window.__near=daoAnnivNear(S.daoPartner); daoAnniv(); window.__opts2=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__near===true&&window.__opts2>=2',ctx),'纪念日临近可触发纪念事件');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__nn=S.daoPartner.nickname; window.__fav2=S.daoPartner.favor; }`,ctx);
assert(vm.runInContext('window.__nn&&window.__fav2>90',ctx),'纪念日可获得昵称并加深情缘');
// 6) 双修增益：结缡后提升，且随心动增长
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:50,affinity:50,stage:2}; window.__m1=dualCultMult(S.daoPartner); S.daoPartner.married=true; window.__m2=dualCultMult(S.daoPartner); S.daoPartner.affinity=100; window.__m3=dualCultMult(S.daoPartner); }`,ctx);
assert(vm.runInContext('window.__m2>window.__m1&&window.__m3>window.__m2',ctx),'结缡后双修增益提升，心动越高增益越高');
// 7) 聊天：多选项弹窗，情话判定不崩溃
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; S.days=10; PENDING=0; daoChat(); window.__opts3=window._eventModalOpts.length; window.__t=document.getElementById('panelTitle')._txt; }`,ctx);
assert(vm.runInContext('window.__opts3>=4&&window.__t.indexOf("闲谈")>=0',ctx),'聊天弹窗提供多个话题');
vm.runInContext(`{ window._eventModalOpts[0].fn(); window.__fav3=S.daoPartner.favor; window.__pend=PENDING; }`,ctx);
assert(vm.runInContext('window.__pend===0&&window.__fav3>=80',ctx),'聊天选择后正常结算');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
