/* v77 区域事件台词条化 + 成丹品质演出卡冒烟 */
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

// T1 区域记忆事件台词条化（说话人徽章 + 引文气泡 + 抉择保留）
vm.runInContext(`runRegionEvent({id:'v77_t',title:'山中奇遇',t:'一位采药女于溪边轻声道：「此物与你有缘。」递来一株灵草。',opts:[{txt:'收下',fn:()=>{}}]}); window.__re=document.getElementById('story')._html;`,ctx);
const re=vm.runInContext('window.__re',ctx);
assert(re.indexOf('story-stage')>=0&&re.indexOf('story-line')>=0&&re.indexOf('sl-quote')>=0,'区域事件以台词条演出');
assert(re.indexOf('sl-speaker')>=0&&re.indexOf('采药女')>=0,'区域事件识别说话人并挂立绘徽章');
assert(vm.runInContext('PENDING',ctx)===1,'区域事件保留抉择（PENDING=1）');

// T2 成丹品质演出卡接线
const craft=fs.readFileSync(path.join(root,'js','systems','craft.js'),'utf8');
assert(craft.indexOf('craft-result')>=0&&craft.indexOf("fxFloatText(qTier")>=0,'炼制成功渲染品质演出卡+飘字');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.craft-result')>=0&&css.indexOf('@keyframes craftIn')>=0,'品质演出卡样式与动画存在');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='78','版本号 v78');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke103: ALL PASS':'smoke103 FAILS: '+fails);
process.exit(fails?1:0);
