/* 周期大事件深化 Phase 2g 冒烟：妖潮守卫战（三波守城 / 备战 / 奖励 / 胜负 / 图鉴联动） */
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 波次敌人逐波增强
vm.runInContext(`S=newState('测试庚',BACKGROUNDS[0]);`,ctx);
assert(vm.runInContext('tideEnemy(1).hp',ctx)<vm.runInContext('tideEnemy(3).hp',ctx),'第三波敌人更强');
assert(vm.runInContext('tideEnemy(3).name.indexOf("首领")>=0',ctx)===true,'第三波为妖潮首领');
// ---- T2 备战开启
vm.runInContext('PENDING=0; beastTideEvent();',ctx);
assert(vm.runInContext('PENDING',ctx)===1,'妖潮守卫战触发选择');
assert(vm.runInContext('document.getElementById("story").innerHTML.indexOf("妖潮守卫战")>=0',ctx)===true,'故事含守城标题');
// ---- T3 波次奖励
vm.runInContext(`
  const s0=S.stones, c0=S.cult, m0=S.merit;
  tideWaveReward(2,1);
  window.__dS=S.stones-s0; window.__dC=S.cult-c0; window.__dM=S.merit-m0;
`,ctx);
assert(vm.runInContext('window.__dS>0&&window.__dC>0',ctx)===true,'波次奖励灵石与修为');
assert(vm.runInContext('window.__dM',ctx)===2,'波次功德 +2');
// ---- T4 全胜结算
vm.runInContext(`
  S.flag.tideWins=2; S.fame={zheng:0,mo:0,san:0}; S.luck=50; S.merit=0;
  tideVictory();
`,ctx);
assert(vm.runInContext('S.flag.tideWins',ctx)===3,'全胜累计守城次数');
assert(vm.runInContext('S.fame.zheng',ctx)===16,'全胜正道声望 +10（功德联动共 +16）');
assert(vm.runInContext('S.merit',ctx)===6,'全胜功德 +6');
assert(vm.runInContext('S.luck',ctx)===51,'第 3 次全胜气运 +1');
// ---- T5 溃败结算
vm.runInContext(`
  S.fame={zheng:10,mo:0,san:0}; S.flag.tideFails=0; S.flag.tideWins=3;
  tideEnd(false);
`,ctx);
assert(vm.runInContext('S.flag.tideFails',ctx)===1,'溃败累计失败次数');
assert(vm.runInContext('S.fame.zheng',ctx)===5,'溃败正道声望 -5');
// ---- T6 行迹图鉴联动
vm.runInContext('exploreTome();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('妖潮守城')>=0,'图鉴含妖潮守城模块');
assert(html.indexOf('胜 3 · 负 1')>=0,'图鉴显示守城战绩');

console.log(fails===0?'smoke30: ALL PASS':'smoke30 FAILS: '+fails);
process.exit(fails?1:0);
