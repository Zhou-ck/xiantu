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
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:30,agi:30,int:20,cha:12,wil:20}; S.stones=2000; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.flag={}; PENDING=0;`,ctx);
// T1 洞府面板
vm.runInContext(`panelRest()`,ctx);
const ph=vm.runInContext(`document.getElementById('panelBody').innerHTML`,ctx);
assert(ph.indexOf('灵田')>=0&&ph.indexOf('功法参悟')>=0&&ph.indexOf('天机签')>=0,'洞府面板含灵田/参悟/天机签');
// T2 灵田种植→成熟通知→收获
vm.runInContext(`plantCrop('herb')`,ctx);
assert(vm.runInContext(`S.flag.farm&&S.flag.farm.crop==='herb'&&S.stones===1970`,ctx),'种灵草扣灵石并记录农事');
vm.runInContext(`S.days+=8; passTime(0)`,ctx);
assert(vm.runInContext(`S.flag.farm.notified===true`,ctx),'成熟自动通知');
const herbBefore=vm.runInContext(`S.mats.herb||0`,ctx);
vm.runInContext(`harvestCrop()`,ctx);
assert(vm.runInContext(`(S.mats.herb||0)>=${herbBefore}+3&&!S.flag.farm.crop`,ctx),'收获灵草并清空灵田');
// T3 功法参悟
vm.runInContext(`S.realm=9; S.root=50; S.arts=[{name:'基础吐纳诀',mult:1.0}]; S.stones=1000; S.days=0; {const m=Math.random; Math.random=()=>0.99; cultivateArt(0); Math.random=m;}`,ctx);
assert(vm.runInContext(`S.arts[0].level===2`,ctx),'功法参悟至第 2 重');
assert(Math.abs(vm.runInContext('cultMult(S)',ctx)-1.1025)<1e-9,'参悟后修炼效率 ×1.05（含春季加成）');
// T4 装备强化
vm.runInContext(`S.weapon={name:'精铁剑',type:'weapon',bonus:2}; S.mats.iron=3; S.stones=500; {const m=Math.random; Math.random=()=>0.99; forgeStrengthen('weapon'); Math.random=m;}`,ctx);
assert(vm.runInContext(`S.weapon.bonus===3&&S.weapon.strengthen===1`,ctx),'强化成功 bonus+1');
assert(vm.runInContext(`S.mats.iron===2&&S.stones===350`,ctx),'强化消耗材料与灵石');
// T5 试炼塔
vm.runInContext(`S.realm=2; S.flag.tower=0; PENDING=0; doTower()`,ctx);
assert(vm.runInContext('PENDING',ctx)===1,'试炼塔战斗选择锁定');
clickChoice(0);
vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
assert(vm.runInContext('S.flag.tower===1',ctx),'试炼塔第 1 层通关');
assert(vm.runInContext('PENDING',ctx)===1,'通关后出现继续/收手选择');
clickChoice(1);
assert(vm.runInContext('PENDING',ctx)===0,'见好就收后闭环');
// T6 离线挂机
vm.runInContext(`const cb=S.cult; S.flag.lastVisit=Date.now()-2*3600000; applyOfflineGain(); window.__gain=S.cult-cb;`,ctx);
assert(vm.runInContext('window.__gain>0',ctx),'离线 2 小时获得修为');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
