/* 称号成就冒烟：新增系统挂钩称号自动结算与加成 */
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

// ---- T1 达成条件并自动结算
vm.runInContext(`
  S=newState('测试巳',BACKGROUNDS[0]);
  S.flag.tech={pts:0,ups:{agg:2,agi:1,def:1,skl:1}};
  S.flag.daolunWins=10; S.flag.tideWins=5;
  for(let i=1;i<=25;i++)S.seenI['物'+i]=1;
  for(let i=1;i<=15;i++)S.seenE['敌'+i]=1;
  S.flag.ownSect=true;
  S.realm=21; S.attrs.int=30;
  checkTitles();
`,ctx);
for(const id of ['tech5','daolun10','tide5','atlas40','ownSect','spirit100'])assert(vm.runInContext('S.titles.indexOf("'+id+'")>=0',ctx)===true,'获得称号 '+id);
assert(vm.runInContext('S.flag.tAttack',ctx)>=1,'战技宗师攻势 +1');
assert(vm.runInContext('S.attrs.cha',ctx)>=2,'魅力称号加成');
// ---- T2 称号墙展示
vm.runInContext('titleWall();',ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('战技宗师')>=0&&html.indexOf('论道无双')>=0&&html.indexOf('开宗立派')>=0,'称号墙列出新称号');

console.log(fails===0?'smoke39: ALL PASS':'smoke39 FAILS: '+fails);
process.exit(fails?1:0);
