/* 天下大势冒烟：世界纪事记录 / 面板展示 / 节日事件写入 */
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

// ---- T1 世界纪事记录与上限
vm.runInContext(`
  S=newState('测试酉',BACKGROUNDS[0]);
  S.years=5; S.flag.worldLog=[];
  recordWorldEvent('第一条大事');
  for(let i=0;i<12;i++)recordWorldEvent('大事'+i);
`,ctx);
assert(vm.runInContext('S.flag.worldLog.length',ctx)<=8,'纪事上限 8 条');
assert(vm.runInContext('S.flag.worldLog[0].t',ctx)==='大事11','最新在前');
assert(vm.runInContext('S.flag.worldLog[0].y',ctx)===5,'记录年份');
// ---- T2 天下大势面板
vm.runInContext(`
  S.flag.eraDone={1:true,2:true}; S.fame={zheng:30,mo:10,san:15};
  S.sect={id:'sword',name:'剑宗',dark:false}; S.flag.tideWins=2; S.flag.tideFails=1;
  worldPanel();
`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
for(const k of ['🕰️ 时代','⚖️ 声望格局','🌊 妖潮守城','📜 天下大事纪'])assert(html.indexOf(k)>=0,'天下大势含「'+k+'」');
assert(html.indexOf('大事11')>=0,'纪事条目展示');
// ---- T3 节日事件写入纪事
vm.runInContext(`
  S.flag.festDone={}; S.flag.lastYear=3; S.flag.worldLog=[];
  festivalEvent('chunjie');
`,ctx);
assert(vm.runInContext('S.flag.worldLog[0].t.indexOf("春节")>=0',ctx)===true,'春节写入天下大事纪');
// ---- T4 仙途录入口
vm.runInContext('openTome();',ctx);
const html2=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html2.indexOf('天下')>=0,'仙途录含天下入口');

console.log(fails===0?'smoke43: ALL PASS':'smoke43 FAILS: '+fails);
process.exit(fails?1:0);
