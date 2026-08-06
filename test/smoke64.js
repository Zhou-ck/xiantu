/* v46 AI 扩写流水线冒烟：本地模板 / JSON 解析 / 校验 / 审核入库 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math,Promise};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 本地模板草稿：无 AI 也可用，字段合法
const draft=vm.runInContext(`localEventDraft('invite','雨夜借宿荒村');`,ctx);
assert(draft.ok&&draft.entry&&draft.entry.type==='invite'&&draft.entry.opts.length>=1,'本地模板草稿生成且字段完整');
assert(vm.runInContext('validateAiEvent('+JSON.stringify(draft.entry)+').ok===true',ctx),'草稿通过校验');

// T2 AI 输出解析：合法 JSON / 非法文本
assert(vm.runInContext(`parseAiEvent('{"id":"ai_1","n":"雨夜借宿","type":"chat","t":"荒村借宿，遇老妪讲古。","opts":[{"txt":"听她讲完"}]}').ok===true`,ctx),'合法 JSON 解析通过');
assert(vm.runInContext(`parseAiEvent('这不是JSON').ok===false`,ctx),'非法文本被拒绝');

// T3 校验器：非法 type / 空 opts 报错
assert(vm.runInContext(`validateAiEvent({id:'x',n:'y',type:'yodel',t:'z',opts:[{txt:'a'}]}).ok===false`,ctx),'非法 type 被校验拒绝');
assert(vm.runInContext(`validateAiEvent({id:'x',n:'y',type:'chat',t:'z',opts:[]}).ok===false`,ctx),'空 opts 被校验拒绝');

// T4 审核入库：并入 DATA.events、重复 id 拒绝
vm.runInContext(`
  const before=DATA.events.length;
  window.__imp=aiReviewImport({id:'ai_test_1',n:'测试事件',type:'chat',t:'一段测试文本。',opts:[{txt:'好的'}]});
  window.__n=DATA.events.length;
  window.__dup=aiReviewImport({id:'ai_test_1',n:'重复',type:'chat',t:'重复文本。',opts:[{txt:'好'}]});
  window.__b=before;
`,ctx);
assert(vm.runInContext('window.__imp.ok===true&&window.__n===window.__b+1',ctx),'审核通过并入社交事件表');
assert(vm.runInContext('window.__dup.ok===false',ctx),'重复 id 拒绝入库');

// T5 管线（无 AI）resolve 成功
vm.runInContext(`
  window.__pipe=null;
  aiContentPipeline('chat','').then(r=>{window.__pipe=r});
`,ctx);
setImmediate(()=>{
  assert(vm.runInContext('window.__pipe&&window.__pipe.ok',ctx),'AI 内容管线本地模式返回合法草稿');
  console.log(fails===0?'smoke64: ALL PASS':'smoke64 FAILS: '+fails);
  process.exit(fails?1:0);
});
