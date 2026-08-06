/* v40 存档加固 smoke：rev 预留 + 签名哈希 + 旧档迁移 + 导入校验 + 音效/特效降级 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// ---- T1 rev 预留：随保存递增
vm.runInContext('S=newState("测试甲",BACKGROUNDS[0]); SLOT=0; S.rev=0; save(); window.__r1=S.rev; save(); window.__r2=S.rev;',ctx);
assert(vm.runInContext('window.__r1===1&&window.__r2===2',ctx)===true,'rev 随保存递增');

// ---- T2 签名写入并可读回
assert(vm.runInContext('typeof S.flag.sig==="string"&&S.flag.sig.length>0',ctx)===true,'保存写入签名');
vm.runInContext('S=load(); window.__ok=S&&S.name==="测试甲";',ctx);
assert(vm.runInContext('window.__ok===true',ctx)===true,'签名存档可正常读取');

// ---- T3 篡改主档被拒绝（回退备份）
vm.runInContext('{ const raw=JSON.parse(localStorage.getItem("xiantu_save_0")); raw.stones=99999; localStorage.setItem("xiantu_save_0",JSON.stringify(raw)); window.__L=load(); }',ctx);
assert(vm.runInContext('window.__L===null||window.__L.stones!==99999',ctx)===true,'篡改存档被拒绝');

// ---- T4 旧档无签名：仍可迁移读取，rev 默认 0
vm.runInContext('{ const old=newState("旧档",BACKGROUNDS[0]); if(old.flag)delete old.flag.sig; localStorage.setItem("xiantu_save_0",JSON.stringify(old)); window.__L2=load(); }',ctx);
assert(vm.runInContext('window.__L2&&window.__L2.name==="旧档"&&window.__L2.rev===0',ctx)===true,'旧档迁移且 rev 默认 0');

// ---- T5 导入路径校验：合法通过，篡改被拒
vm.runInContext('{ const s=newState("乙",BACKGROUNDS[0]); window.__imp=importRaw(s); }',ctx);
assert(vm.runInContext('window.__imp===true',ctx)===true,'合法存档 importRaw 通过');
vm.runInContext('{ const s2=newState("乙",BACKGROUNDS[0]); save(); const t=JSON.parse(JSON.stringify(S)); t.stones=(t.stones||0)+1; window.__imp2=importRaw(t); }',ctx);
assert(vm.runInContext('window.__imp2===false',ctx)===true,'篡改存档 importRaw 被拒');

// ---- T6 音效/特效降级：关闭音频 + 低档特效安全无异常
vm.runInContext('S.set.audio=false; sfx("hit"); fxSetLevel("low");',ctx);
assert(true,'音频关闭 + 低档特效无异常');

console.log(fails===0?'smoke49: ALL PASS':'smoke49 FAILS: '+fails);
process.exit(fails?1:0);
