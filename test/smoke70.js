/* 地图与内容一致性冒烟：地图 10 点全部可执行 / 事件总量 / 赛季节奏 */
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

// T1 地图 10 点：7 区域与 REGIONS 一一对应
vm.runInContext(`window.__reg=MAP_LOCS.filter(l=>l.kind==='region').map(l=>l.action.split(':')[1]).sort().join(','); window.__all=REGIONS.map(r=>r.id).sort().join(',');`,ctx);
assert(vm.runInContext('window.__reg===window.__all',ctx),'地图 7 个区域与探索区域表完全一致');
assert(vm.runInContext('MAP_LOCS.length===11',ctx),'地图共 11 个可交互地点');

// T2 事件总量 ≥300 且结构合法
assert(vm.runInContext('eventTotalCount()>=300',ctx),'事件总量 ≥300（'+vm.runInContext('eventTotalCount()',ctx)+'）');
assert(vm.runInContext('validateAll().length===0',ctx),'全部数据表校验 0 错误');

// T3 赛季事件各主题 4 条、可抽取
vm.runInContext(`window.__miss=THEMES.filter(t=>THEME_EVENTS.filter(e=>e.theme===t.id).length<4).map(t=>t.id);`,ctx);
assert(vm.runInContext('window.__miss.length===0',ctx),'每主题 ≥4 条赛季事件（v95 已扩至 10/主题）');

// T4 故事事件五类齐全、有战斗与无战斗分支
vm.runInContext(`window.__cats=[...new Set(STORY_EVENTS.map(e=>e.cat))].sort().join(','); window.__fights=STORY_EVENTS.filter(e=>e.opts.some(o=>o.fx&&o.fx.fight)).length;`,ctx);
assert(vm.runInContext('window.__cats==="calm,danger,epic,herb,rare"&&window.__fights>=5',ctx),'故事事件覆盖五类且含战斗型事件');

console.log(fails===0?'smoke70: ALL PASS':'smoke70 FAILS: '+fails);
process.exit(fails?1:0);
