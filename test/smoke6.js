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
// 1) 五行灵根：创建必有属性，功法相性 ×1.15
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__e=S.rootElem; S.arts=[{name:'同属',mult:1.0,elem:S.rootElem}]; window.__m1=cultMult(S); S.arts=[{name:'异属',mult:1.0,elem:ELEMS[S.rootElem].beats}]; window.__m2=cultMult(S); }`,ctx);
assert(vm.runInContext('!!ELEMS[window.__e]',ctx),'角色拥有五行/变异灵根');
assert(Math.abs(vm.runInContext('window.__m1/window.__m2',ctx)-1.15)<1e-9,'同属功法修炼效率 ×1.15');
// 2) 武器相性 + 熟练
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.rootElem='fire'; S.armor=null; S.trinket=null; S.weapon={name:'火云剑',bonus:3,elem:'fire'}; window.__w1=weaponAtk(S); weaponGainMastery(S); weaponGainMastery(S); window.__w2=weaponAtk(S); }`,ctx);
assert(vm.runInContext('window.__w1===4',ctx),'同属法器攻势 +1');
assert(vm.runInContext('window.__w2===5',ctx),'兵器熟练 +1 攻势');
// 3) 受伤：属性/气血惩罚 + 丹药与静养治疗
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__base=attrVal(S,'agi'); applyInjury('neijing'); window.__low=attrVal(S,'agi'); window.__max1=calcMaxHp(S); applyInjury('neishang'); window.__max2=calcMaxHp(S); }`,ctx);
assert(vm.runInContext('window.__low===window.__base-2',ctx),'经脉受损身法 -2');
assert(vm.runInContext('window.__max2<window.__max1',ctx),'内伤降低气血上限');
vm.runInContext(`{ cureInjury('neijing','疗伤丹'); window.__cur=attrVal(S,'agi'); }`,ctx);
assert(vm.runInContext('window.__cur===window.__base',ctx),'疗伤丹治愈经脉受损');
vm.runInContext(`{ S.injuries=[{id:'jiqiao',left:5},{id:'shenhun',left:10}]; restCure(6); window.__left=(S.injuries||[]).map(i=>i.id+':'+i.left).join(','); }`,ctx);
assert(vm.runInContext('window.__left.indexOf("jiqiao")<0&&window.__left.indexOf("shenhun:")>=0',ctx),'洞府静养按日减少伤势');
// 4) 道侣决裂 + 仇视
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',stage:2,favor:14,affinity:60,hp:30,atk:6,cold:0}; S.npcs=[S.daoPartner]; favorChange(S.daoPartner,-3,'test'); window.__b={dp:S.daoPartner,ex:S.flag.exHate}; }`,ctx);
assert(vm.runInContext('window.__b.dp===null&&window.__b.ex&&window.__b.ex.name==="苏婉"&&window.__b.ex.days>0',ctx),'好感跌破阈值姻缘断绝并进入仇视');
// 5) 普通角色交恶
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const n={name:'张三',gender:'男',favor:5,hp:20,atk:4,stage:1}; S.npcs=[n]; favorChange(n,-10,'test'); window.__n={foe:n.foe,hate:n.hate,favor:n.favor}; }`,ctx);
assert(vm.runInContext('window.__n.foe===true&&window.__n.hate>0&&window.__n.favor<0',ctx),'好感归零普通角色交恶仇视');
// 6) 仇杀埋伏
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.flag.exHate={name:'苏婉',role:'采药女',stage:2,atk:6,hp:30,days:20}; window.__amb=false; for(var k=0;k<25&&!window.__amb;k++){PENDING=0; if(exHateAmbush())window.__amb=true;} window.__p=PENDING; }`,ctx);
assert(vm.runInContext('window.__amb===true&&window.__p===1',ctx),'仇视期间探索可能触发寻仇');
// 7) 道侣事件弹窗
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',stage:2,favor:80,affinity:70,hp:30,atk:6}; partnerEvent(); window.__opts=window._eventModalOpts.length; window.__disp=document.getElementById('panel').style.display; }`,ctx);
assert(vm.runInContext('window.__opts>=2&&window.__disp==="flex"',ctx),'道侣事件弹出抉择窗口');
// 8) 护送任务（弹窗 + 结算）
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.tasks=[{name:'护送商队',cost:6,point:14,val:42,stones:60,kind:'escort'}]; PENDING=0; doTask(0); window.__n2=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__n2===2&&document.getElementById("panel").style.display==="flex"',ctx),'护送任务弹出抉择窗口');
vm.runInContext(`{ resolveEventModal(0); window.__c=S.contrib; window.__v=S.contribVal; window.__st=S.flag.sectTasks; }`,ctx);
assert(vm.runInContext('window.__c>=14&&window.__v>=42&&window.__st===1',ctx),'任务抉择后贡献结算正确');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
