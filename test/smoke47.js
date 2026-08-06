/* 守关试炼修复冒烟：bossOf 带 desc（文案无 undefined）、bossArt 未定义不崩溃 */
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
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function drain(max){
  const cap=max||40;
  for(let k=0;k<cap;k++){
    if(vm.runInContext('document.getElementById("battleResult").style.display==="block"&&typeof window._battleResolve==="function"',ctx)){
      vm.runInContext('{ const r=window._battleResolve; window._battleResolve=null; if(r)r(); }',ctx);
      continue;
    }
    let clicked=false;
    walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0&&el.children&&el.children.length){clicked=true;el.children[0].onclick&&el.children[0].onclick()}});
    if(!clicked)break;
  }
}

// ---- T1 bossOf 带 desc
vm.runInContext(`S=newState('测',BACKGROUNDS[0]);`,ctx);
assert(vm.runInContext('bossOf(0).desc===BOSSES[0].desc',ctx)===true,'bossOf 携带 desc');
assert(vm.runInContext('String(bossOf(3).desc).indexOf("undefined")<0',ctx)===true,'desc 不含 undefined');
// ---- T2 守关文案无 undefined
vm.runInContext('S.flag.bosses={}; S.flag.bossArt=null; PENDING=0; bossBattle(0);',ctx);
assert(vm.runInContext('document.getElementById("story").innerHTML.indexOf("undefined")<0',ctx)===true,'守关试炼文案无 undefined');
assert(vm.runInContext('document.getElementById("story").innerHTML.indexOf("青鳞蟒")>=0',ctx)===true,'文案含守关大妖名');
// ---- T3 胜利回调（bossArt 未定义）不崩溃
vm.runInContext(`
  S.attrs={str:40,agi:40,int:40,cha:40,wil:40};
  S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
  S.flag.bosses={}; S.flag.bossArt=null;
  PENDING=0; bossBattle(2);
`,ctx);
drain(60);
assert(vm.runInContext('S.flag.bosses[2]===true',ctx)===true,'守关胜利记录');
assert(vm.runInContext('S.flag.bossArt&&typeof S.flag.bossArt==="object"',ctx)===true,'bossArt 已初始化且未崩溃');
assert(vm.runInContext('PENDING',ctx)===0,'战斗链路无残留');

console.log(fails===0?'smoke47: ALL PASS':'smoke47 FAILS: '+fails);
process.exit(fails?1:0);
