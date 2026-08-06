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
function resolveAll(){
  let guard=0;
  while(vm.runInContext('PENDING',ctx)>0&&guard++<10)clickChoice(0);
  if(vm.runInContext(`document.getElementById('battleResult').style.display`,ctx)==='block'){
    vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
  }
}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:12,agi:12,int:20,cha:12,wil:20}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0;`,ctx);
// T1 新奇遇 eff 全部可运行
vm.runInContext(`
  for(let i=10;i<RARE_V.length;i++){ RARE_V[i].eff() }
`,ctx);
resolveAll();
assert(vm.runInContext('PENDING',ctx)===0,'10 条新奇遇全部可运行');
// T2 新凶险逐个闭环
for(let i=7;i<=12;i++){
  vm.runInContext(`PENDING=0; DANGER_V[${i}].run();`,ctx);
  resolveAll();
  assert(vm.runInContext('PENDING',ctx)===0,'新凶险 #'+i+' 可运行且选择闭环');
}
// T3 新年度事件（Math.random 固定 t）
for(const rnd of [0.86,0.91,0.96,0.99]){
  vm.runInContext(`{ S.flag.helpfulSoon=false; S.days=0; S.age=16; S.flag.lastYear=999; PENDING=0; const m=Math.random; Math.random=()=>${rnd}; yearlyEvent(); Math.random=m; }`,ctx);
  resolveAll();
  assert(vm.runInContext('PENDING',ctx)===0,'年度事件 t≈'+Math.round(rnd*100)+' 可运行（含抉择）');
}
// T4 藏宝图因果链
vm.runInContext(`{ S.flag={rumor:true}; const m=Math.random; Math.random=()=>0; window.__r1=treasureChain(); Math.random=m; }`,ctx);
assert(vm.runInContext('S.flag.mapFound===true&&window.__r1===true',ctx),'传闻→藏宝图');
vm.runInContext(`{ S.flag={mapFound:true}; S.stones=0; const m=Math.random; Math.random=()=>0; window.__r2=treasureChain(); Math.random=m; }`,ctx);
assert(vm.runInContext('S.flag.treasureDone===true&&window.__r2===true&&S.stones>0',ctx),'藏宝图→遗藏得宝（灵石+）');
vm.runInContext(`{ S.attrs.int=5; S.flag={mapFound:true}; const m=Math.random; Math.random=()=>0; window.__r3=treasureChain(); Math.random=m; }`,ctx);
assert(vm.runInContext('window.__r3===true&&PENDING===1',ctx),'遗藏禁制失败→尸傀战斗（强制选择）');
resolveAll();
// T5 茶棚暗语折扣
vm.runInContext(`S.days=0; S.attrs.cha=5; S.fame={zheng:0}; S.stones=1000; S.flag={teaLore:true}; buyItem(0);`,ctx);
assert(vm.runInContext('S.stones===929',ctx),'茶棚暗语折扣 + 春季行情（80×0.97×0.92=71）');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
