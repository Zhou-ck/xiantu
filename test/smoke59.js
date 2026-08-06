/* v42 任务表 schema 冒烟：合法 0 错 / 坏数据报错 / 区域事件对账 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
function loadJs(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
const ctx={console,window:{}};
vm.createContext(ctx);
for(const rel of ['js/core/world.js','js/data/events.js','js/data/items.js','js/core/schema.js','js/data/quests.js','js/data/exploreEvents.js','js/data/storyEvents.js','js/systems/npc.js','js/systems/market.js','js/systems/craft.js','js/systems/explore.js','js/core/state.js']){
  vm.runInContext(loadJs(rel),ctx);
}
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// T1 任务表校验 0 错误
const errs=vm.runInContext('validateQuests()',ctx);
assert(Array.isArray(errs)&&errs.length===0,'validateQuests() 0 错误（实际 '+errs.length+'：'+errs.slice(0,3).join('|')+'）');

// T2 区域事件对账：每区域 ≥2 条 + 0 错误
const re=vm.runInContext('validateRegionEvents()',ctx);
assert(Array.isArray(re)&&re.length===0,'validateRegionEvents() 0 错误（'+re.slice(0,3).join('|')+'）');
const cover=vm.runInContext('regionEventCoverage()',ctx);
assert(Object.keys(cover).length>=7&&Object.keys(cover).every(k=>cover[k]>=2),'7 个区域每区 ≥2 条记忆事件');

// T3 全量校验 0 错误
const all=vm.runInContext('validateAll()',ctx);
assert(Array.isArray(all)&&all.length===0,'validateAll() 0 错误（事件+任务+区域事件）');

// T3b 事件库总量对账：数据驱动事件 ≥300（含新增通用故事事件池与赛季事件包）
const cnt=vm.runInContext('eventTotalCount()',ctx);
assert(cnt>=300,'数据驱动事件条目 ≥300（当前 '+cnt+'）');
assert(vm.runInContext('STORY_EVENTS.length>=60&&THEME_EVENTS.length>=16',ctx),'通用故事事件池 ≥60 · 赛季事件包 16');

// T4 坏数据报错：章节缺 title / 剧情缺 opts / 非法 type
function expectErrors(code,keyword,label){
  const r=vm.runInContext(code,ctx);
  assert(Array.isArray(r)&&r.length>0&&r[0].indexOf(keyword)>=0,label+'（'+r[0]+'）');
}
expectErrors(`(function(){MAIN_STORY.push({id:'bad_ch',steps:[{type:'realm',param:1}]});const r=validateQuests();MAIN_STORY.pop();return r})()`,'title','章节缺 title 被报错');
expectErrors(`(function(){MAIN_STORY.push({id:'bad_ch2',title:'x',steps:[{type:'story',id:'bad_s',title:'y',lines:['a'],opts:[{}]}]});const r=validateQuests();MAIN_STORY.pop();return r})()`,'txt','剧情选项缺 txt 被报错');
expectErrors(`(function(){MAIN_STORY.push({id:'bad_ch3',title:'x',steps:[{type:'yodel',param:1}]});const r=validateQuests();MAIN_STORY.pop();return r})()`,'非法','非法目标类型被报错');

// T5 剧情 fx 引用合法（fx 字段白名单检查：不报错且奖励类型受支持）
const fxBad=vm.runInContext(`
  (function(){
    const bad=[];
    MAIN_STORY.forEach(ch=>ch.steps.filter(s=>s.type==='story').forEach(s=>(s.opts||[]).forEach(o=>{
      const fx=o.fx||{};
      for(const k in fx){
        if(['stones','cult','cultPct','hp','root','mood','merit','karma','luck','insight','mat','item','fight','winFx','afterFx','flag','once'].indexOf(k)<0)bad.push(s.id+'.'+k);
      }
    })));
    SIDE_QUESTS.forEach(q=>q.steps.filter(s=>s.type==='story').forEach(s=>(s.opts||[]).forEach(o=>{
      const fx=o.fx||{};
      for(const k in fx){
        if(['stones','cult','cultPct','hp','root','mood','merit','karma','luck','insight','mat','item','fight','winFx','afterFx','flag','once'].indexOf(k)<0)bad.push(q.id+'.'+s.title+'.'+k);
      }
    })));
    return bad;
  })()
`,ctx);
assert(fxBad.length===0,'剧情 fx 字段全部在白名单内（'+fxBad.slice(0,3).join(',')+'）');

// T6 章节连续性：章节 realm 门槛单调不减
const mono=vm.runInContext(`
  (function(){
    let prev=-1;
    for(const ch of MAIN_STORY){if(ch.realm<prev)return false;prev=ch.realm}
    return true;
  })()
`,ctx);
assert(mono,'主线章节 realm 门槛单调递增');

console.log(fails===0?'smoke59: ALL PASS':'smoke59 FAILS: '+fails);
process.exit(fails?1:0);
