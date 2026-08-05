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
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();g.children[i].onclick()}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0;`,ctx);
// act('rest') → panelRest
vm.runInContext(`act('rest')`,ctx);
assert(vm.runInContext(`document.getElementById('panel').style.display`,ctx)==='flex','休整面板打开');
assert(vm.runInContext(`document.getElementById('panelBody').innerHTML`,ctx).indexOf('天机签')>=0,'休整面板含天机签');
// 长闭关不报错（可能触发扰动，强制选择后继续）
vm.runInContext(`S.cult=0; S.cultStreak=0; S.days=0; PENDING=0; doCultivate(365,'bitter')`,ctx);
const pend=vm.runInContext('PENDING',ctx);
assert(pend<=4,'长闭关正常返回（PENDING='+pend+'，含年度/节日事件）');
// 逐组精确点击一次（虚拟 DOM 不校验 disabled，需按组点击，若解析中又冒出战斗选项则继续）
function clickAllGroups(limit){
  let step=0;
  while(vm.runInContext('PENDING',ctx)>0&&step++<limit){
    const groups=[];
    walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0&&el.children&&el.children.length)groups.push(el)});
    const before=vm.runInContext('PENDING',ctx);
    for(const g of groups){if(g.children[0])g.children[0].onclick()}
    if(vm.runInContext('PENDING',ctx)===before)break;
  }
}
clickAllGroups(40);
assert(vm.runInContext('PENDING',ctx)===0,'闭关后事件全部选择完毕');
// 签运季换签消
vm.runInContext(`S.days=0; drawSign()`,ctx);
assert(vm.runInContext(`!!signNow()`,ctx),'签运生效');
vm.runInContext(`S.days+=91`,ctx);
assert(vm.runInContext(`!signNow()`,ctx),'过季签消');
vm.runInContext(`S.days-=91`,ctx);
assert(vm.runInContext(`!!signNow()`,ctx),'回季签复');
// 帮助可渲染
vm.runInContext(`openHelp()`,ctx);
assert(vm.runInContext(`document.getElementById('panelBody').innerHTML`,ctx).indexOf('收益递减')>=0,'帮助页含收益递减说明');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);