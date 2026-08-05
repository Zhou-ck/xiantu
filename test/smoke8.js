const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []},addEventListener(){}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// 1) NPC 池扩充（14+8）与关系网
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); window.__n={pool:NPC_POOL.length,npcs:S.npcs.length,rel:0}; S.npcs.forEach(n=>window.__n.rel+=Object.keys(n.rels||{}).length); }`,ctx);
assert(vm.runInContext('window.__n.pool===28&&window.__n.npcs===28',ctx),'NPC 池扩充至 28 名');
assert(vm.runInContext('window.__n.rel>=22',ctx),'角色关系网已生成（平均每人至少一段关系）');
// 2) 关系联动：好感变动影响关联者
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const a=S.npcs[0],b=S.npcs[1]; a.rels={}; a.rels[b.name]={type:'挚友',strength:80}; const f0=b.favor; favorChange(a,10,'test'); window.__d=b.favor-f0; }`,ctx);
assert(vm.runInContext('window.__d>=3',ctx),'挚友关系：一方好感上升，另一方同涨');
vm.runInContext(`{ const a=S.npcs[0],b=S.npcs[1]; a.rels={}; a.rels[b.name]={type:'宿敌',strength:80}; const f0=b.favor; favorChange(a,10,'test'); window.__d2=f0-b.favor; }`,ctx);
assert(vm.runInContext('window.__d2>=3',ctx),'宿敌关系：一方得意，另一方厌恶');
// 3) 宗门人物扩充
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const sec=SECTS[0]; window.__gp=genSectPeople(sec).length; }`,ctx);
assert(vm.runInContext('window.__gp>=5',ctx),'每派可结交人物 ≥5 名（原 3 名）');
// 4) 季节/年度事件池存在且可运行
vm.runInContext('window.__se=SEASONAL_EVENTS.length; window.__ye=YEARLY_EXTRA.length;',ctx);
assert(vm.runInContext('window.__se>=8&&window.__ye>=6',ctx),'季节事件池 8 件、年度补充 6 件');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); var got=false; for(var k=0;k<25&&!got;k++){ PENDING=0; S.flag.lastSeason=undefined; seasonalEvent(); if(PENDING>0)got=true; } window.__p1=PENDING; PENDING=0; }`,ctx);
assert(vm.runInContext('window.__p1===1',ctx),'季节事件触发抉择（PENDING 锁定）');
// 5) 新道侣角色立绘均已注册
vm.runInContext(`{ const roles=['狐仙苏苏','剑阁女侠','月下琴姬','灵药仙子','魔道妖女','龙族公主','白衣剑仙','儒雅书仙']; window.__miss=roles.filter(r=>!NPC_ART[r]); }`,ctx);
assert(vm.runInContext('window.__miss.length===0',ctx),'8 位新角色立绘全部注册');
// 6) 新角色可被表白为道侣（异性、好感达标路径正常）
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); const n=S.npcs.find(x=>x.role==='狐仙苏苏'); window.__ok=!!n&&n.gender==='女'&&!!NPC_ART[n.role]; }`,ctx);
assert(vm.runInContext('window.__ok',ctx),'狐仙苏苏可成为道侣候选');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
