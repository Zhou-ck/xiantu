/* v43 保命道具冒烟：致死转重伤 / 携带上限 / 寿元不救 / 面板显示 */
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
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 坊市出售保命道具（use:'save'）
vm.runInContext(`window.__saves=MARKET_ITEMS.filter(m=>m.use==='save').map(m=>m.name);`,ctx);
assert(vm.runInContext('window.__saves.indexOf("保命符")>=0&&window.__saves.indexOf("替身傀儡")>=0',ctx),'坊市出售保命符与替身傀儡');

// T2 携带上限：最多两件
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={}; S.stones=100000; PENDING=0;
  buyItem(MARKET_ITEMS.findIndex(m=>m.name==='保命符'));
  buyItem(MARKET_ITEMS.findIndex(m=>m.name==='保命符'));
  buyItem(MARKET_ITEMS.findIndex(m=>m.name==='保命符'));
  window.__n=S.items.filter(i=>i.use==='save').length; window.__toast=document.getElementById('toast').textContent;
`,ctx);
assert(vm.runInContext('window.__n===2',ctx),'保命道具最多携带两件（实际 '+vm.runInContext('window.__n',ctx)+'）');
assert(vm.runInContext('window.__toast.indexOf("最多携带两件")>=0',ctx),'超出上限时提示');

// T3 致死转重伤：不死亡、不进入结局、消耗一件
vm.runInContext(`
  S.hp=0; S.flag.saveUsed=0; S.flag.lifeSaves=0; S.deaths=0;
  const before=S.items.filter(i=>i.use==='save').length;
  window.__b=before;
  PENDING=0; die('战死沙场');
  window.__hp=S.hp; window.__deaths=S.deaths; window.__left=S.items.filter(i=>i.use==='save').length;
  window.__lifeSaves=S.flag.lifeSaves; window.__ending=document.getElementById('ending').style.display;
`,ctx);
assert(vm.runInContext('window.__hp===1',ctx),'致死时以重伤存活（hp=1）');
assert(vm.runInContext('window.__deaths===0&&window.__left===window.__b-1&&window.__lifeSaves===1',ctx),'不结算死亡、消耗一件保命道具、保命次数 +1');
assert(vm.runInContext('window.__ending!=="flex"',ctx),'不弹出身陨结局');

// T4 寿元耗尽不救
vm.runInContext(`
  S.hp=1; S.deaths=0; S.flag.lifeSaves=1; S.endings=[];
  PENDING=0; die('寿元耗尽');
  window.__d2=S.deaths; window.__left2=S.items.filter(i=>i.use==='save').length; window.__end2=document.getElementById('ending').style.display;
`,ctx);
assert(vm.runInContext('window.__d2===1&&window.__left2===1',ctx),'寿元耗尽时保命道具不生效（死亡结算、道具未消耗）');
assert(vm.runInContext('window.__end2==="flex"',ctx),'寿元耗尽进入身陨结局');

// T5 修炼面板苦修区显示保命符持有数
vm.runInContext(`
  S.deaths=0; S.flag={}; S.stones=1000; S.realm=0;
  S.items=S.items.filter(i=>i.use!=='save');
  S.items.push({name:'保命符',type:'consumable',quality:2,count:1,use:'save'});
  PENDING=0; panelCult(); window.__ph=document.getElementById('panelBody')._html;
`,ctx);
assert(vm.runInContext('window.__ph.indexOf("保命符 ×1")>=0',ctx),'苦修区标注保命符持有数');

console.log(fails===0?'smoke60: ALL PASS':'smoke60 FAILS: '+fails);
process.exit(fails?1:0);
