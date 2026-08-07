/* v91 新手指引一键跳过冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.flag={}; PENDING=0;`,ctx);

// T1 引导页含跳过按钮
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('id="guideSkip"')>=0&&html.indexOf('onclick="guideSkip()"')>=0,'引导页含「跳过引导」按钮');
const hj=fs.readFileSync(path.join(root,'js','ui','help.js'),'utf8');
assert(hj.indexOf('function guideSkip()')>=0,'跳过处理函数存在');

// T2 跳过即关闭引导
vm.runInContext(`showGuide(0); window.__b0=document.getElementById('guide').style.display; guideSkip(); window.__b1=document.getElementById('guide').style.display; window.__sk=S.flag.guideSkipped;`,ctx);
assert(vm.runInContext('window.__b0==="flex"&&window.__b1==="none"',ctx),'跳过引导后引导页关闭');
assert(vm.runInContext('window.__sk===true',ctx),'跳过状态已记录');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(typeof vm.runInContext('GAME_VERSION',ctx)==='string'&&/^\d+$/.test(vm.runInContext('GAME_VERSION',ctx)),'版本号为数字字符串 v'+vm.runInContext('GAME_VERSION',ctx));
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke117: ALL PASS':'smoke117 FAILS: '+fails);
process.exit(fails?1:0);
