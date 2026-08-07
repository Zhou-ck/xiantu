/* v92 内容目录/审计冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

const va=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(va)&&va.length===0,'validateAll() 0 错误'+(va.length?(' → '+va.slice(0,5).join(' | ')):""));

const cc=vm.runInContext('contentCheck()',ctx);
assert(Array.isArray(cc)&&cc.length===0,'contentCheck() 0 错误'+(cc.length?(' → '+cc.slice(0,8).join(' | ')):""));

const sum=vm.runInContext('contentSummary()',ctx);
assert(sum.social&&sum.social.count>=127,'社交 ≥127（'+sum.social.count+'）');
assert(sum.story&&sum.story.count>=140,'故事 ≥140（'+sum.story.count+'）');
['calm','herb','rare','epic','danger'].forEach(function(cat){
  const n=sum.story.cats[cat].count;
  assert(n>=18,'故事 '+cat+' ≥18（'+n+'）');
});
assert(sum.meditation&&sum.meditation.count>=16,'顿悟 ≥16（'+sum.meditation.count+'）');
assert(sum.region&&sum.region.count>=16,'区域 ≥16（'+sum.region.count+'）');
assert(sum.titles&&sum.titles.count>=40,'称号 ≥40（'+sum.titles.count+'）');
assert(sum.npc&&sum.npc.count>=26,'NPC ≥26');
assert(sum.items&&sum.items.count>=60,'物品 ≥60');
assert(sum.arts&&sum.arts.count>=10,'功法 ≥10');
assert(sum._thresholds===42,'THRESHOLDS 42');
assert(sum._totalEvents>=470,'eventTotalCount ≥470（'+sum._totalEvents+'）');

const imp=vm.runInContext(`(function(){
  var r=contentImport('social',[{id:'b_test_tmp_1',n:'测试',type:'chat',t:'测',opts:[{txt:'好'}]}]);
  var r2=contentImport('social',[{id:'b_test_tmp_1',n:'测试',type:'chat',t:'测',opts:[{txt:'好'}]}]);
  var bad=contentImport('titles',[{id:'x'}]);
  return {ok:r.ok&&r.added===1, skip:r2.ok&&r2.skipped===1, bad:!bad.ok};
})()`,ctx);
assert(imp.ok,'contentImport 社交可入库');
assert(imp.skip,'contentImport 重复 id 跳过');
assert(imp.bad,'contentImport 拒绝不可导入池');

console.log(fails===0?'smoke118: ALL PASS':'smoke118 FAILS: '+fails);
process.exit(fails?1:0);
