/* 完善与打磨冒烟：修仙志新系统说明 / 去重后 rankIdx 行为不变 / 引导存在 */
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

// ---- T1 修仙志覆盖新系统
vm.runInContext(`S=newState('测试卯',BACKGROUNDS[0]); openHelp();`,ctx);
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
for(const k of ['战技参悟','论道台','真元','收藏图鉴','妖潮守卫战','自建宗门'])assert(html.indexOf(k)>=0,'修仙志含「'+k+'」');
// ---- T2 rankIdx 去重后行为不变（显式职位）
vm.runInContext('S.sect={id:"sword",name:"剑宗",dark:false}; S.rank=3;',ctx);
assert(vm.runInContext('rankIdx(S)',ctx)===3,'显式职位 rank 生效');
assert(vm.runInContext('secRank(S)',ctx)==='真传弟子','职位名正确');
// ---- T3 新手引导渲染与新增步骤
vm.runInContext('GUIDE_IDX=0; showGuide(0);',ctx);
assert(vm.runInContext('document.getElementById("guideTitle").textContent.indexOf("仙途 · 入门")>=0',ctx)===true,'引导渲染正常');
assert(vm.runInContext('GUIDE_STEPS.length',ctx)>=5,'引导含修行辅助步骤');
assert(vm.runInContext('GUIDE_STEPS[4].body.indexOf("真元")>=0',ctx)===true,'引导说明新系统');

console.log(fails===0?'smoke37: ALL PASS':'smoke37 FAILS: '+fails);
process.exit(fails?1:0);
