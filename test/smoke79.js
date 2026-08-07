/* v55 修行深化冒烟 2：场景效果 / 顿悟事件池 / 低特效自动结算 */
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

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs={str:20,agi:20,int:30,cha:20,wil:35}; S.root=60; S.realm=13; S.flag={}; S.flag.npcVisitCd=100; S.flag.teaCd=100; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; S.stones=500;`,ctx);
// T1 场景数据
assert(vm.runInContext('CULT_SCENES.length===5&&cultScene("spring").impClean===5&&cultScene("abyss").danger===true&&cultScene("snow").daoX===1.1',ctx),'五个场景数据齐全（灵泉排浊/雪山道基/禁地凶险）');
// T2 场景结算：灵泉排浊、雪山加道基
vm.runInContext(`S.flag.impurity=10; S.flag.daoBase=0; _cult={method:cultMethod('qi'),scene:cultScene('spring')}; _cultResult(30,'quiet',true); window.__imp1=S.flag.impurity; S.flag.impurity=0; S.flag.daoBase=0; _cult={method:cultMethod('qi'),scene:cultScene('snow')}; _cultResult(30,'quiet',true); window.__dao2=S.flag.daoBase;`,ctx);
assert(vm.runInContext('window.__imp1===5&&window.__dao2===3',ctx),'灵泉每次排灵浊 5 · 雪山道基加成生效（以气养神2+雪山1）');
// T3 顿悟事件池 + 效果器
assert(vm.runInContext('MEDITATION_EVENTS.length>=8',ctx),'顿悟事件池 ≥8 条');
vm.runInContext(`const c0=S.cult,i0=S.flag.insights||0,d0=S.flag.daoBase||0; applyMeditationFx({insight:1,cult:100,dao:2}); window.__fx=(S.cult-c0===100)&&((S.flag.insights||0)-i0===1)&&((S.flag.daoBase||0)-d0===2);`,ctx);
assert(vm.runInContext('window.__fx',ctx),'顿悟效果器正确结算（修为/悟道/道基）');
// T4 低特效自动结算：测试环境（无 setInterval/立即计时器）闭关同步跑完、无残留阻塞；缺战意自动回退
vm.runInContext(`S.flag.cultMethod='qi'; S.flag.cultScene='cave'; window.__c0=S.cult; PENDING=0; _cult=null; doCultivate(30,'quiet'); window.__gain=S.cult-window.__c0; window.__pending=PENDING; window.__cultNull=(_cult===null);`,ctx);
assert(vm.runInContext('window.__gain>0&&window.__pending===0&&window.__cultNull',ctx),'低特效/测试环境闭关自动结算完成且无残留弹窗');
vm.runInContext(`PENDING=0; _cult=null; S.flag.tech={pts:0,ups:{}}; S.flag.cultMethod='war'; doCultivate(30,'quiet'); window.__fb=S.flag.cultMethod;`,ctx);
assert(vm.runInContext('window.__fb==="qi"',ctx),'战意不足时以战悟道自动回退以气养神');

console.log(fails===0?'smoke79: ALL PASS':'smoke79 FAILS: '+fails);
process.exit(fails?1:0);
