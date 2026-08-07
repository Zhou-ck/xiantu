/* v53 六页导航冒烟：6 页模块数 / 双列图卡 / 锁定态 / tabGo 路由 / emoji 兜底 / 新页路由 */
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

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0;`,ctx);
// T1 六页结构 + 模块数
vm.runInContext(`window.__keys=PAGE_KEYS.join(','); window.__counts=TABS.map(t=>t.items.length).join(','); window.__imgs=TABS.every(t=>t.hero)&&TABS.every(t=>t.items.every(it=>!!it.img));`,ctx);
assert(vm.runInContext('window.__keys==="cult,world,sect,social,biz,me"',ctx),'底部导航为 6 大页（修行/云游/宗门/尘缘/百业/我）');
assert(vm.runInContext('window.__counts==="8,7,3,6,5,7"',ctx),'六页模块数 8/7/3/6/5/7（共 36 模块）');
assert(vm.runInContext('window.__imgs',ctx),'每页含横幅字段、每模块含 img 字段（v54 落图）');
// T2 双列图卡渲染
vm.runInContext(`tabHome('cult'); window.__html=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__html',ctx);
assert(html.indexOf('page-hero')>=0&&html.indexOf('mod-grid')>=0&&html.indexOf('mod-emoji')>=0,'页面渲染横幅 + 双列图卡 + emoji 兜底');
assert((html.match(/class="mod-card/g)||[]).length===8,'修行页渲染 8 张模块卡');
assert(html.indexOf('onerror')>=0,'图卡图片带加载失败兜底');
// T3 锁定态
vm.runInContext(`S.daoPartner=null; tabHome('social'); window.__h3=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__h3.indexOf("mod-card locked")>=0&&window.__h3.indexOf("需先有道侣")>=0',ctx),'锁定模块显示 🔒 与条件提示');
// T4 tabGo 路由
vm.runInContext(`tabGo('me',4); window.__t4=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__t4.indexOf("存档")>=0',ctx),'tabGo 打开「我」页存档模块');
vm.runInContext(`PENDING=0; tabHome('world'); window.__w=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__w.indexOf("御剑试炼")>=0&&window.__w.indexOf("守关试炼")>=0',ctx),'云游页含地图 POI 提升模块（守关/秘境/御剑）');
// T5 自由输入新页路由
vm.runInContext(`PENDING=0; freeAct('看看我的面板'); window.__t5=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__t5.indexOf("我")>=0',ctx),'自由输入「我的」路由到我页');
vm.runInContext(`PENDING=0; freeAct('打开百业'); window.__t6=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__t6.indexOf("百业")>=0',ctx),'自由输入「百业」路由到百业页');

console.log(fails===0?'smoke76: ALL PASS':'smoke76 FAILS: '+fails);
process.exit(fails?1:0);
