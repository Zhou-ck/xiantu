/* v45 数据表全面化冒烟：物品目录 / NPC 表 / 世界观表 / 事件总量 */
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

// T1 物品目录汇总：坊市 / 任务 / 剧情 / 区域事件物品均可解析
vm.runInContext(`window.__cat=itemCatalog();`,ctx);
for(const name of ['筑基丹','保命符','青锋古剑','千年灵乳','圣泉灵水','断水古琴','封魔印']){
  assert(vm.runInContext('!!window.__cat["'+name+'"]',ctx),'物品目录包含「'+name+'」');
}
// T2 全量引用校验 0 错误
const errs=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(errs)&&errs.length===0,'validateAll()（含物品/NPC/世界观）0 错误');
// T3 数据表完整性：NPC ≥26 位、ARTS 带 flow、阈值 42 档
vm.runInContext(`window.__npcN=NPC_POOL.length; window.__artBad=ARTS.filter(a=>!a.flow).length; window.__thrN=THRESHOLDS.length;`,ctx);
assert(vm.runInContext('window.__npcN>=26&&window.__artBad===0&&window.__thrN===42',ctx),'NPC_POOL ≥26 · ARTS 全带 flow · THRESHOLDS 42 档');
// T4 事件库总量 ≥300（含通用故事事件池/赛季事件包/年度与季节事件）
assert(vm.runInContext('eventTotalCount()>=300',ctx),'事件条目总量 ≥300（实际 '+vm.runInContext('eventTotalCount()',ctx)+'）');

console.log(fails===0?'smoke63: ALL PASS':'smoke63 FAILS: '+fails);
process.exit(fails?1:0);
