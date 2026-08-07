/* ======================================================
  仙途 · 物品统一目录（v45）
  说明：itemCatalog() 在运行时汇总全游戏物品来源
        （坊市 / 任务奖励 / 拍卖 / 新手 / 副业 / 剧情与区域事件 fx），
        供 schema 校验引用完整性；不改变任何既有数据源。
====================================================== */
'use strict';
function itemCatalog(){
  const cat={};
  const add=it=>{if(it&&it.name&&!cat[it.name])cat[it.name]={type:it.type||'item',quality:it.quality!=null?it.quality:0}};
  (typeof MARKET_ITEMS!=='undefined'?MARKET_ITEMS:[]).forEach(add);
  if(typeof GEM_DEFS!=='undefined')GEM_DEFS.forEach(g=>add({name:g.name,type:'gem',quality:2}));
  (typeof ITEM_REWARDS!=='undefined'?Object.keys(ITEM_REWARDS).map(k=>ITEM_REWARDS[k]):[]).forEach(add);
  (typeof AUCTION_POOL!=='undefined'?AUCTION_POOL:[]).forEach(add);
  (typeof STARTER_ITEMS!=='undefined'?STARTER_ITEMS:[]).forEach(add);
  if(typeof RECIPES!=='undefined')for(const k in RECIPES)(RECIPES[k]||[]).forEach(r=>{if(r&&r.name)add({name:r.name,type:'craft',quality:r.q})});
  if(typeof RESEARCH_RECIPES!=='undefined')RESEARCH_RECIPES.forEach(r=>{if(r&&r.name)add({name:r.name,type:'craft',quality:r.q})});
  add({name:'朱果',type:'consumable',quality:3});
  add({name:'修行手札',type:'consumable',quality:2});
  const fxItems=[];
  const scan=(steps,where)=>{
    (steps||[]).forEach(st=>{
      if(st&&st.type==='collect'&&st.param)fxItems.push({name:st.param,type:'collect',quality:0});
      if(st&&st.type==='story')(st.opts||[]).forEach(o=>{if(o&&o.fx&&o.fx.item)fxItems.push(o.fx.item);if(o&&o.fx&&o.fx.winFx&&o.fx.winFx.item)fxItems.push(o.fx.winFx.item)});
    });
  };
  if(typeof MAIN_STORY!=='undefined')MAIN_STORY.forEach(ch=>scan(ch.steps,'main'));
  if(typeof SIDE_QUESTS!=='undefined')SIDE_QUESTS.forEach(q=>scan(q.steps,'side'));
  const pushFx=o=>{if(o&&o.fx){if(o.fx.item)fxItems.push(o.fx.item);if(o.fx.winFx&&o.fx.winFx.item)fxItems.push(o.fx.winFx.item)}};
  if(typeof REGION_EVENTS!=='undefined')REGION_EVENTS.forEach(ev=>(ev.opts||[]).forEach(pushFx));
  if(typeof STORY_EVENTS!=='undefined')STORY_EVENTS.forEach(ev=>(ev.opts||[]).forEach(pushFx));
  if(typeof THEME_EVENTS!=='undefined')THEME_EVENTS.forEach(ev=>(ev.opts||[]).forEach(pushFx));
  fxItems.forEach(add);
  return cat;
}
function itemExists(name){return !!name&&!!itemCatalog()[name]}
