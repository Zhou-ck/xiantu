/* v80 修仙志分节折叠卡冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0;`,ctx);

// T1 修仙志分节折叠卡（内容与关键词全保留）
vm.runInContext(`openHelp(); window.__h=document.getElementById('panelBody')._html;`,ctx);
const h=vm.runInContext('window.__h',ctx);
assert(h.indexOf('help-sec')>=0&&h.indexOf('<summary>')>=0,'修仙志以分节折叠卡呈现');
for(const k of ['战技参悟','论道台','真元','收藏图鉴','妖潮守卫战','自建宗门','境界','五行灵根'])assert(h.indexOf(k)>=0,'修仙志保留章节「'+k+'」');

// T2 实现与样式
const hj=fs.readFileSync(path.join(root,'js','ui','help.js'),'utf8');
assert(hj.indexOf('function helpSectionsHtml')>=0,'修仙志分节转换器存在');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.help-sec')>=0&&css.indexOf('.help-sec summary::after')>=0,'折叠卡样式与箭头存在');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(typeof vm.runInContext('GAME_VERSION',ctx)==='string'&&/^\d+$/.test(vm.runInContext('GAME_VERSION',ctx)),'版本号为数字字符串 v'+vm.runInContext('GAME_VERSION',ctx));
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke106: ALL PASS':'smoke106 FAILS: '+fails);
process.exit(fails?1:0);
