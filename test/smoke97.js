/* v71 探索事件台词条化 + 突破跃迁横幅 + 渡劫演出冒烟 */
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

// T1 探索故事事件台词条化（说话人 + 引文气泡 + 抉择保留）
vm.runInContext(`runStoryEvent({id:'v71_t',title:'夜半荒山',t:'一位神秘道人立于坟前：「天机不可泄。」随即隐入夜色。',cat:'rare',opts:[{txt:'跟上',fn:()=>{}}]}); window.__se=document.getElementById('story')._html;`,ctx);
const se=vm.runInContext('window.__se',ctx);
assert(se.indexOf('story-line')>=0&&se.indexOf('sl-quote')>=0&&se.indexOf('天机不可泄')>=0,'探索事件以台词条演出（引文气泡）');
assert(se.indexOf('sl-speaker')>=0&&se.indexOf('神秘道人')>=0,'探索事件识别说话人并挂立绘徽章');
assert(vm.runInContext('PENDING',ctx)===1,'探索事件保留抉择（PENDING=1）');

// T2 突破跃迁横幅 + 渡劫演出接线
const bt=fs.readFileSync(path.join(root,'js','systems','breakthrough.js'),'utf8');
assert(bt.indexOf('bt-realm-up')>=0&&bt.indexOf('realm-jump')>=0,'突破成功渲染跃迁横幅（弹窗+故事流）');
assert(bt.indexOf('trib-fire')>=0,'渡劫小游戏带天雷演出');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.bt-realm-up')>=0&&css.indexOf('.realm-jump')>=0&&css.indexOf('.trib-fire')>=0,'跃迁横幅与天雷演出样式存在');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(typeof vm.runInContext('GAME_VERSION',ctx)==='string'&&/^\d+$/.test(vm.runInContext('GAME_VERSION',ctx)),'版本号为数字字符串 v'+vm.runInContext('GAME_VERSION',ctx));
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke97: ALL PASS':'smoke97 FAILS: '+fails);
process.exit(fails?1:0);
