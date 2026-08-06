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
vm.createContext(ctx);
vm.runInContext(js,ctx);
const $=id=>ctx.document.getElementById(id);
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk($('story'),el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}
const ctx2=vm.createContext(ctx); // shared
// ---- T1 streak math
assert(Math.abs(vm.runInContext('streakDiminMult(0,90)',ctx)-8.7/9)<1e-9,'streakDiminMult(0,90)=8.7/9');
assert(Math.abs(vm.runInContext('streakDiminMult(60,30)',ctx)-0.9)<1e-9,'streakDiminMult(60,30)=0.9');
assert(Math.abs(vm.runInContext('streakDiminMult(300,30)',ctx)-0.4)<1e-9,'streakDiminMult(300,30)=0.4');
// ---- T2 new state + 筑基门槛
vm.runInContext(`
  const bg=BACKGROUNDS.find(b=>b.id==='villager');
  S=newState('测试',bg);
  S.realm=8; S.cult=2000; S.items=[]; S.arts=[{name:'基础吐纳诀',mult:1.0}];
`,ctx);
assert(vm.runInContext('S.realm',ctx)===8,'state created realm 8');
vm.runInContext('tryBreak()',ctx);
assert(vm.runInContext('PENDING',ctx)===1,'筑基门槛触发选择锁定 PENDING=1');
assert($('story').innerHTML.indexOf('尚缺')>=0,'突破面板提示“尚缺”');
clickChoice(0);
assert(vm.runInContext('PENDING',ctx)===0,'点击跳转后 PENDING 归零');
assert(vm.runInContext('document.getElementById("panel").style.display',ctx)==='flex','跳转打开面板');
// ---- T3 修炼
vm.runInContext(`
  S.cult=0; S.cultStreak=0; S.days=0; S.realm=0; S.hp=S.maxHp;
  PENDING=0;
  doCultivate(30,'quiet');
`,ctx);
assert(vm.runInContext('S.cultStreak',ctx)===30,'闭关30日 streak=30');
assert(vm.runInContext('S.cult>0',ctx),'闭关获得修为');
// 连续闭关后递减生效
const g1=vm.runInContext('S.cult',ctx);
vm.runInContext('doCultivate(30,"quiet")',ctx);
assert(vm.runInContext('S.cultStreak',ctx)===60,'连续闭关 streak=60');
// 外出行动重置 streak
vm.runInContext('passTime(5)',ctx);
assert(vm.runInContext('S.cultStreak',ctx)===0,'非闭关行动重置 streak');
// ---- T4 苦修
vm.runInContext('PENDING=0; doCultivate(30,"bitter")',ctx);
assert(vm.runInContext('S.cultStreak',ctx)===30,'苦修 streak=30');
// ---- T5 天机签
vm.runInContext('S.days=0; PENDING=0; drawSign()',ctx);
assert(vm.runInContext('!!(S.flag.sign&&S.flag.sign.season===seasonOf())',ctx),'天机签已生效');
// 本季不能重复求
const kind=vm.runInContext('S.flag.sign.kind',ctx);
vm.runInContext('drawSign()',ctx);
assert(vm.runInContext('S.flag.sign.kind',ctx)===kind,'同季不重复求签');
// ---- T6 天道扰动
vm.runInContext('PENDING=0; heavenlyDisturbance(90)',ctx);
assert(vm.runInContext('PENDING',ctx)===1,'天道扰动触发选择');
clickChoice(0);
assert(vm.runInContext('PENDING',ctx)===0,'扰动选择后继续');
// ---- T7 天道侵蚀
vm.runInContext('S.realm=12; PENDING=0; heavenlyErosion()',ctx);
assert(vm.runInContext('PENDING',ctx)===1,'天道侵蚀触发选择');
clickChoice(0);
assert(vm.runInContext('PENDING',ctx)===0,'侵蚀选择后继续');
// ---- T8 延寿丹
const lb=vm.runInContext('S.lifeBonus||0',ctx);
vm.runInContext(`S.items.push({name:'延寿丹',type:'consumable',quality:3,use:'lifespan'}); PENDING=0; consume(S.items.length-1)`,ctx);
assert(vm.runInContext('(S.lifeBonus||0)>'+lb,ctx),'延寿丹增加寿元上限');
// ---- T9 突破成功路径（满足门槛）
vm.runInContext(`
  S.realm=8; S.cult=5000; S.attrs.wil=25; S.heartDemons=0; S.temp={break:0};
  S.items=[{name:'筑基丹',type:'consumable',quality:2,use:'break'}];
  S.arts=[{name:'太乙剑诀',mult:1.2}];
  PENDING=0; tryBreak();
`,ctx);
for(let k=0;k<3;k++)clickChoice(0); /* 心魔试炼三回合 */
const realmAfter=vm.runInContext('S.realm',ctx);
assert(realmAfter>=9,'满足门槛后筑基成功（realm='+realmAfter+'）');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);
process.exit(fails===0?0:1);
