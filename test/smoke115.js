/* v89 缓存强刷（全资源版本号参数）冒烟：根治旧 CSS/JS 顶替新版本的陈旧缓存问题 */
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
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

// T1 全部 CSS/JS 带版本号参数（缓存强刷）
assert(html.indexOf('href="css/main.css?v=89"')>=0,'CSS 带版本号参数');
const scripts=(html.match(/src="js\/[^"]+\.js\?v=89"/g)||[]).length;
assert(scripts>=50,'全部 '+scripts+' 个 JS 带版本号参数');
assert(html.indexOf('src="js/app-shell.js?v=89"')>=0&&html.indexOf('src="js/app.js?v=89"')>=0,'首尾脚本均带版本号');

// T2 自检页显示游戏版本（下次截图可核对）
const sj=fs.readFileSync(path.join(root,'js','ui','settings.js'),'utf8');
assert(sj.indexOf("chk('游戏版本'")>=0,'自检页显示游戏版本');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='90','版本号 v90');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke115: ALL PASS':'smoke115 FAILS: '+fails);
process.exit(fails?1:0);
