/* smoke52：流派数据化 —— ARTS.flow 字段完整性 / flowType 字段优先 / 正则兜底不回归 */
const fs=require('fs'),vm=require('vm');
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
const VALID=['sword','demon','body','dan','spirit','law'];
// T1 ARTS 每条都有合法 flow 字段
const bad=vm.runInContext(`ARTS.filter(a=>!a.flow||${JSON.stringify(VALID)}.indexOf(a.flow)<0).map(a=>a.name)`,ctx);
assert(bad.length===0,'ARTS 每条均有合法 flow 字段'+(bad.length?('，缺失/非法:'+bad.join(',')):''));
// T2 字段优先于正则：同名功法但 flow 字段不同的，返回字段值而非正则结果
assert(vm.runInContext(`flowType({arts:[{name:'心魔淬体功',flow:'body'}]}).id`,ctx)==='body','心魔淬体功 flow=body → 返回 body（正则会判 demon）');
assert(vm.runInContext(`flowType({arts:[{name:'太乙剑诀',flow:'law'}]}).id`,ctx)==='law','太乙剑诀 flow=law → 返回 law（正则会判 sword）');
assert(vm.runInContext(`flowType({arts:[{name:'丹火诀',flow:'law'}]}).id`,ctx)==='law','丹火诀 flow=law → 返回 law（正则会判 dan）');
assert(vm.runInContext(`flowType({arts:[{name:'龙象体诀',flow:'sword'}]}).id`,ctx)==='sword','龙象体诀 flow=sword → 返回 sword（正则会判 body）');
// T3 字段与正则一致时同样生效
assert(vm.runInContext(`flowType({arts:[{name:'太乙剑诀',flow:'sword'}]}).id`,ctx)==='sword','太乙剑诀 flow=sword → 返回 sword');
assert(vm.runInContext(`flowType({arts:[{name:'丹火诀',flow:'dan'}]}).id`,ctx)==='dan','丹火诀 flow=dan → 返回 dan');
// T4 无 flow 字段：正则兜底仍工作（临时造旧结构功法）
assert(vm.runInContext(`flowType({arts:[{name:'心魔淬体功'}]}).id`,ctx)==='demon','旧结构心魔淬体功（无 flow）→ 正则兜底判 demon');
assert(vm.runInContext(`flowType({arts:[{name:'太乙剑诀'}]}).id`,ctx)==='sword','旧结构太乙剑诀（无 flow）→ 正则兜底判 sword');
assert(vm.runInContext(`flowType({arts:[{name:'不知名新功法'}]}).id`,ctx)==='law','未知功法（无 flow）→ 正则兜底判 law');
assert(vm.runInContext(`flowType({arts:[{name:'遁光术'}]}).id`,ctx)==='law','旧结构遁光术（无 flow）→ 正则兜底判 law');
// T5 流派加成依赖 flowType，字段优先后照常工作
assert(vm.runInContext(`(function(){const b=flowCombatBonus({arts:[{name:'太乙剑诀',flow:'sword'}]});return b.atk===1&&Math.abs(b.multi-0.12)<1e-9})()`,ctx),'字段驱动 sword → flowCombatBonus 返回剑修加成');
assert(vm.runInContext(`flowCombatBonus({arts:[{name:'心魔淬体功',flow:'body'}]}).hpMul===1.15`,ctx),'字段驱动 body → flowCombatBonus 返回体修加成');
assert(vm.runInContext(`flowCombatBonus({arts:[{name:'惊雷诀',flow:'demon'}]}).drain===0.3`,ctx),'字段驱动 demon → flowCombatBonus 返回魔修吸血');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
