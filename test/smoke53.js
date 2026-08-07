/* v41 数据表地基 smoke：DATA.events 数量 / schema 校验 0 错误 / 坏数据能报错 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
function loadJs(rel){
  return fs.readFileSync(path.join(root,rel),'utf8');
}
const ctx={console,window:{}};
vm.createContext(ctx);
vm.runInContext(loadJs('js/data/events.js'),ctx);
vm.runInContext(loadJs('js/core/schema.js'),ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 DATA.events 存在且 ≥50 条，且每条含关键字段
const cnt=vm.runInContext('Array.isArray(DATA.events)?DATA.events.length:-1',ctx);
assert(cnt>=50,'DATA.events 至少 50 条（实际 '+cnt+'）');
const badShape=vm.runInContext(`DATA.events.filter(e=>!e.id||typeof e.n!=='string'||typeof e.type!=='string'||typeof e.t!=='string'||!Array.isArray(e.opts)||!e.opts.length).length`,ctx);
assert(badShape===0,'每条事件含 id/n/type/t/opts 关键字段');

// ---- T2 真实校验：0 错误
const errs=vm.runInContext('validateEvents()',ctx);
assert(Array.isArray(errs)&&errs.length===0,'validateEvents() 返回 0 错误（实际 '+errs.length+' 条：'+errs.slice(0,3).join('|')+'）');

// ---- T3 坏数据能报错（逐个注入后恢复）
function expectErrors(code,keyword,label){
  const r=vm.runInContext(code,ctx);
  assert(Array.isArray(r)&&r.length>0&&r[0].indexOf(keyword)>=0,label+'（'+r[0]+'）');
}
// 3a 缺失必填字段（id）
expectErrors(`(function(){DATA.events.push({n:'坏事件',type:'chat',t:'x',opts:[{txt:'a'}]});const r=validateEvents();DATA.events.pop();return r})()`,'id','缺 id 被报错');
// 3b 重复 id
expectErrors(`(function(){DATA.events.push({id:'chat_001',n:'重复',type:'chat',t:'x',opts:[{txt:'a'}]});const r=validateEvents();DATA.events.pop();return r})()`,'重复','重复 id 被报错');
// 3c 未知资源引用（物品名）
expectErrors(`(function(){DATA.events.push({id:'bad_001',n:'坏',type:'chat',t:'x',opts:[{txt:'a'}],refs:{item:'不存在的仙丹'}});const r=validateEvents();DATA.events.pop();return r})()`,'不存在','未知物品引用被报错');
// 3d 非法 type
expectErrors(`(function(){DATA.events.push({id:'bad_002',n:'坏',type:'yodel',t:'x',opts:[{txt:'a'}]});const r=validateEvents();DATA.events.pop();return r})()`,'非法','非法 type 被报错');

// ---- T4 坏数据全部恢复后，再次校验 0 错误
const errs2=vm.runInContext(`(function(){const before=DATA.events.length;const e=validateEvents();return {n:before,errs:e.length}})()`,ctx);
assert(errs2.n===cnt&&errs2.errs===0,'坏数据恢复后 DATA.events 数量不变且校验 0 错误');

// ---- T5 index.html 脚本顺序：events.js / schema.js 须在 content.js 之前
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const order=[];
const re=/<script src="([^"]+?\.js)(?:\?[^"]*)?"><\/script>/g;
let m;
while((m=re.exec(html)))order.push(m[1]);
const iEvents=order.indexOf('js/data/events.js');
const iSchema=order.indexOf('js/core/schema.js');
const iContent=order.indexOf('js/core/content.js');
assert(iEvents>=0&&iSchema>=0,'index.html 已引入 events.js 与 schema.js');
assert(iEvents<iContent&&iSchema<iContent,'data/schema 脚本位于 content.js 之前（'+iEvents+'/'+iSchema+'/'+iContent+'）');
assert(iEvents<iSchema,'events.js 先于 schema.js 加载');

console.log(fails===0?'smoke53: ALL PASS':'smoke53 FAILS: '+fails);
process.exit(fails?1:0);
