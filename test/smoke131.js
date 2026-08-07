/* 朱果事件修复 + 死亡/结局 PENDING 重置 冒烟（回归守护） */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0;`,ctx);

// T1 朱果事件三选项：硬摘/谨慎摘取/转身离开，即死降至 5%（r<=1）
const ex=fs.readFileSync(path.join(root,'js','systems','explore.js'),'utf8');
assert(ex.indexOf('伸手去摘（凶险 · 生死判定）')>=0,'硬摘选项保留（凶险判定）');
assert(ex.indexOf('系上藤蔓谨慎摘取（身法判定）')>=0,'新增谨慎摘取（身法判定）选项');
assert(ex.indexOf('转身离开，不冒此险')>=0,'新增转身离开选项');
assert(ex.indexOf('if(r<=1){die(\'失足坠崖\')')>=0,'即死概率降至 5%（r<=1）');

// T2 行为验证：离开选项可正常解除锁定且不掉血
vm.runInContext(`
  PENDING=0;
  var ev=DANGER_V.find(function(e){return String(e.run).indexOf('朱果')>=0});
  var ret=ev.run();
  window.__pend1=PENDING; window.__ret=ret; window.__hp0=S.hp;
  var story=document.getElementById('story'); var btns=[];
  (function walk(el){ if(!el||!el.children)return; for(var i=0;i<el.children.length;i++){ var c=el.children[i]; if(String(c.className||'').indexOf('choices')>=0 && c.children){ for(var j=0;j<c.children.length;j++) if(c.children[j].onclick) btns.push(c.children[j]); } walk(c); } })(story);
  if(btns.length) btns[btns.length-1].onclick();
  window.__pend2=PENDING; window.__hp1=S.hp;
`,ctx);
assert(vm.runInContext('window.__pend1===1',ctx),'事件弹出触发抉择锁定');
assert(vm.runInContext('window.__pend2===0&&window.__hp1===window.__hp0',ctx),'转身离开解除锁定且不掉血');

// T3 死亡/结局路径重置 PENDING（系统级防卡死）
const dj=fs.readFileSync(path.join(root,'js','systems','death.js'),'utf8');
assert(dj.indexOf('function die(reason){')>=0&&dj.indexOf('PENDING=0')>=0,'die() 起始重置 PENDING');
assert(dj.indexOf('结局弹出即解除一切抉择锁定')>=0,'endEnding 重置 PENDING');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(/^\d+$/.test(vm.runInContext('GAME_VERSION',ctx)),'版本号为数字（当前 v'+vm.runInContext('GAME_VERSION',ctx)+'）');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke131: ALL PASS':'smoke131 FAILS: '+fails);
process.exit(fails?1:0);
