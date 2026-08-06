/* 宗门同门事件冒烟：门中事宜事件池 / 冷却 / 记录 / 生涯统计 */
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
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 触发门中事宜
vm.runInContext(`
  S=newState('测试申',BACKGROUNDS[0]);
  S.sect={id:'sword',name:'剑宗',dark:false};
  S.sectNpcs=[{name:'林晚',title:'首席弟子',role:'传功弟子',gender:'女',stage:4,favor:60,mood:70}];
  S.flag.sectEvents=0; PENDING=0;
  sectEvent();
`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length>=2&&window._eventModalOpts.length<=3',ctx)===true,'门中事宜事件弹出');
assert(vm.runInContext('S.flag.sectEventCd>0',ctx)===true,'冷却开始计时');
// ---- T2 处置后记录
vm.runInContext('window._eventModalOpts[0].fn();',ctx);
assert(vm.runInContext('S.flag.sectEvents',ctx)===1,'事件计数 +1');
// ---- T3 冷却拦截
vm.runInContext('S.flag.sectEventCd=10; sectEvent();',ctx);
assert(vm.runInContext('document.getElementById("toast").textContent.indexOf("门中诸事安好")>=0',ctx)===true,'冷却期提示');
assert(vm.runInContext('S.flag.sectEvents',ctx)===1,'冷却期不触发新事件');
// ---- T4 宗门面板入口
vm.runInContext('S.flag.sectEventCd=0; panelSect();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('门中事宜')>=0,'宗门面板含门中事宜入口');
// ---- T5 生涯统计
vm.runInContext('S.flag.sectTasks=5; careerWall();',ctx);
const html2=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html2.indexOf('🏯 宗门')>=0&&html2.indexOf('1 件')>=0,'生涯统计含宗门区块与事件数');

console.log(fails===0?'smoke42: ALL PASS':'smoke42 FAILS: '+fails);
process.exit(fails?1:0);
