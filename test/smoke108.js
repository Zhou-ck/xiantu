/* v82 触屏滤镜层/大阴影移除（闪黄根治）+ 亮化保持 冒烟 */
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
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');

// T1 触屏大图层滤镜层全部移除（导航图/地点图/横幅/天象/锁定卡）
for(const sel of ['.page-hero-img','.mod-img','.loc-img','.cult-banner-img']){
  assert(css.indexOf('html.fx-touch '+sel+'{filter:none!important}')>=0,'触屏移除滤镜层 '+sel);
}
assert(css.indexOf('html.fx-touch #breakScene.break-scene{opacity:.5!important;filter:none!important}')>=0,'触屏移除滤镜层 #breakScene.break-scene');
assert(css.indexOf('html.fx-touch .mod-card.locked .mod-imgwrap')>=0,'锁定卡改用透明度（无滤镜）');

// T2 触屏面板大阴影移除（大盒阴影是首帧闪光元凶）
assert(css.indexOf('html.fx-touch #panelBox,html.fx-touch #cultBox,html.fx-touch #battleBox,html.fx-touch #guideBox,html.fx-touch #breakBox{box-shadow:none!important}')>=0,'触屏面板大阴影移除');

// T3 亮化档位保持
assert(css.indexOf('html.fx-touch .mod-img.ld{opacity:.95}')>=0,'模块图亮化档位 .95');
assert(css.indexOf('html.fx-touch .page-hero-img.ld{opacity:.62}')>=0,'横幅亮化档位 .62');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='89','版本号 v89');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke108: ALL PASS':'smoke108 FAILS: '+fails);
process.exit(fails?1:0);
