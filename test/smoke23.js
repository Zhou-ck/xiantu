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
// 1) 宗门额外弟子有名有姓、不重名
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.sect=SECTS[0]; S.sectNpcs=genSectPeople(S.sect); window.__noNames=S.sectNpcs.filter(p=>!p.name).length; window.__names=new Set(S.sectNpcs.map(p=>p.name));`,ctx);
assert(vm.runInContext('window.__noNames===0',ctx),'宗门人物全部有名有姓');
assert(vm.runInContext('window.__names.size===S.sectNpcs.length',ctx),'宗门人物无重名');
// 2) 宗门大比冷却：bigCd>0 不可再赛
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.sect=SECTS[0]; S.bigCd=100; S.contrib=0; PENDING=0; bigCompetition(); window.__c=S.contrib;`,ctx);
assert(vm.runInContext('window.__c===0&&S.bigCd===100',ctx),'大比冷却期内不可参赛（不结算奖励）');
// 3) 突破后修为重算：炼气三层后从 0 重新积累
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs.wil=20; S.cult=250; S.realm=0; PENDING=0; tryBreak(); window.__r={realm:S.realm,cult:S.cult};`,ctx);
assert(vm.runInContext('window.__r.realm===2&&window.__r.cult===0',ctx),'突破后修为重算（realm=2，修为归 0 结转）');
// 4) 瓶颈系统：90% 触发，悟性+历练达标后解除
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.realm=8; S.cult=THRESHOLDS[9]*0.95; S.wis=0; S.trail=0; window.__a=bottleneckInfo(S).active; S.wis=100; S.trail=100; window.__b=bottleneckInfo(S).active;`,ctx);
assert(vm.runInContext('window.__a===true',ctx),'修为九成后触发瓶颈');
assert(vm.runInContext('window.__b===false',ctx),'悟性历练达标后瓶颈解除');
// 5) 师尊面板：有师尊时 panelMaster 打开面板
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.master={name:'风无涯',role:'长老',gender:'男',title:'执剑长老',desc:'剑道通神',stage:5,favor:70,cd:{}}; panelMaster(); window.__d=document.getElementById('panel').style.display;`,ctx);
assert(vm.runInContext('window.__d==="flex"',ctx),'师尊面板可打开');
// 6) 家族面板：独立系统可打开，子嗣使用幼童立绘
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.children=[{name:'小澜',gender:'男',root:60,rootElem:'metal',stage:0,progress:0,favor:70,parent:'测',mom:'苏婉'}]; window.__h=childrenHtml(); panelFamily(); window.__d2=document.getElementById('panel').style.display;`,ctx);
assert(vm.runInContext('window.__h.indexOf("child_m.jpg")>=0',ctx),'子嗣使用幼童立绘（非成人立绘）');
assert(vm.runInContext('window.__d2==="flex"&&document.getElementById("panelTitle")._txt.indexOf("家族")>=0',ctx),'家族独立面板可打开');
// 7) 道侣日常相处：有道侣时可打开互动
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,married:false,cd:{}}; PENDING=0; daoDaily(); window.__o=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__o>=2',ctx),'道侣「相处」日常互动可触发');
// 8) 副业两段式交互：炼器/符箓/布阵均有「选材 → 微操」
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.prof='forge'; S.profLevel=2; S.mats={iron:5,jade:2,demonCore:2}; S.stones=5000; S.arts=[{name:'基础吐纳诀',mult:1.0}]; const r=RECIPES.forge[0]; craftPrep(r,0); window.__p1=window._eventModalOpts?window._eventModalOpts.length:0; window._eventModalOpts[0].fn(); window.__p2=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__p1>=4&&window.__p2>=4',ctx),'炼器：选料+锻打两段交互');
vm.runInContext(`S.prof='talisman'; S.mats={paper:2,cinnabar:2,demonCore:2}; const r2=RECIPES.talisman[0]; craftPrep(r2,0); window.__p3=window._eventModalOpts?window._eventModalOpts.length:0; window._eventModalOpts[2].fn(); window.__p4=window._eventModalOpts?window._eventModalOpts.length:0; window.__bonus=r2._prepBonus;`,ctx);
assert(vm.runInContext('window.__p3>=4&&window.__p4>=4&&window.__bonus===3',ctx),'符箓：调墨（妖丹点睛 +3）+连笔两段交互');
vm.runInContext(`S.prof='array'; S.mats={iron:2,paper:1,jade:2,demonCore:2}; const r3=RECIPES.array[0]; craftPrep(r3,0); window.__p5=window._eventModalOpts?window._eventModalOpts.length:0; window._eventModalOpts[0].fn(); window.__p6=window._eventModalOpts?window._eventModalOpts.length:0;`,ctx);
assert(vm.runInContext('window.__p5>=4&&window.__p6>=4',ctx),'布阵：选基+引灵两段交互');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
