/* v48 赛季主题轮换冒烟：风雷火水每 3 年轮换 / 事件包 / 地图展示 */
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

// T1 四个主题 + 16 个赛季事件
vm.runInContext(`window.__th=THEMES.map(t=>t.id); window.__n=THEME_EVENTS.length;`,ctx);
assert(vm.runInContext('window.__th.join(",")==="feng,lei,huo,shui"&&window.__n===16',ctx),'风雷火水四季主题各 4 事件（共 16）');

// T2 每 3 游戏年轮换
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={};
  S.years=0; window.__t0=themeOf().id;
  S.years=3; window.__t3=themeOf().id;
  S.years=6; window.__t6=themeOf().id;
  S.years=9; window.__t9=themeOf().id;
  S.years=12; window.__t12=themeOf().id;
`,ctx);
assert(vm.runInContext('window.__t0==="feng"&&window.__t3==="lei"&&window.__t6==="huo"&&window.__t9==="shui"&&window.__t12==="feng"',ctx),'赛季主题每 3 年轮换一周');

// T3 事件抽取：返回当前主题事件
vm.runInContext(`S.years=3; window.__ev=rollThemeEvent();`,ctx);
assert(vm.runInContext('window.__ev&&window.__ev.theme==="lei"',ctx),'雷季抽取雷主题事件');

// T4 地图展示赛季标签
vm.runInContext(`S.years=3; S.realm=1; S.flag={}; PENDING=0; mapHtml(); window.__map=document.getElementById("panelBody")?document.getElementById("panelBody")._html:''; window.__map2=(function(){openPanel('x','');return document.getElementById('panelBody')._html})();`,ctx);
// 直接用 mapHtml 返回值校验
vm.runInContext(`window.__mh=mapHtml();`,ctx);
assert(vm.runInContext('window.__mh.indexOf("赛季：")>=0&&window.__mh.indexOf("雷季")>=0',ctx),'地图面板展示当前赛季（雷季）');

// T5 探索日志赛季行（doExplore 首行不测随机流程，校验 themeLabel 文本）
assert(vm.runInContext('themeLabel().indexOf("雷季")>=0',ctx),'赛季标签文本正确');

console.log(fails===0?'smoke66: ALL PASS':'smoke66 FAILS: '+fails);
process.exit(fails?1:0);
