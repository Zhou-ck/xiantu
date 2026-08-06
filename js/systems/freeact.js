/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 自由行动 ================
====================================================== */
'use strict';
/* ================= 自由行动 ================= */
function freeAct(raw){
  if(PENDING>0){toast('⚠️ 眼前之事未了，请先做出选择');return}
  const t=String(raw||'').trim();
  if(!t){toast('请描述你的行动');return}
  const rules=[
    [/(苦修)/,()=>doCultivate(parseNum(t)||30,'bitter')],
    [/(静修)/,()=>doCultivate(parseNum(t)||30,'quiet')],
    [/(修炼|闭关|打坐)/,()=>doCultivate(parseNum(t)||30)],
    [/(探索|游历|外出|走走|巡山)/,()=>panelExplore()],
    [/(坊市|市场|买卖|购物|摊位)/,()=>panelMarket()],
    [/(宗门|门派|回宗)/,()=>panelSect()],
    [/(人际|社交|拜访|友人|朋友)/,()=>panelSocial()],
    [/(师尊|师父|师门|请教.*师)/,()=>panelMaster()],
    [/(道侣|约会|同游|双修|相处)/,()=>S.daoPartner?panelPartner():doDualCultivate()],
    [/(家族|子嗣|孩子|儿女)/,()=>panelFamily()],
    [/(炼丹|炼器|制符|布阵|副业|炼制)/,()=>panelCraft()],
    [/(突破|冲击)/,()=>tryBreak()],
    [/(静心|养神|涤心|驱除心魔|清心)/,()=>settleMind()],
    [/(休息|休整|疗伤|睡觉)/,()=>doRest()],
    [/(双修)/,()=>doDualCultivate()],
    [/(行囊|背包|物品|装备|看看.*东西)/,()=>panelInventory()],
    [/(帮|帮助|修仙志|规则|怎么玩)/,()=>openHelp()],
    [/(存档|保存)/,()=>panelSave()],
    [/(灵兽|宠物|喂养|喂食|孵化|兽卵)/,()=>petPanel()],
    [/(求签|天机签|月签|焚香)/,()=>panelRest()],
    [/(功德|业力|因果|善恶)/,()=>{toast('功德 '+S.merit+' · 业力 '+S.karma);openTome()}],
    [/(称号|成就|荣誉)/,()=>openTome()],
    [/(季节|时令)/,()=>toast(seasonLabel()+'：'+seasonDesc())],
    [/(自杀|求死|圆寂)/,()=>die('自绝心脉')],
  ];
  for(const [re,fn] of rules)if(re.test(t)){fn();return}
  /* 2L AI 辅助：非标准输入先尝试 AI 意图理解，无 AI 则本地兜底 */
  if(aiEnabled()&&typeof Promise==='function'){
    toast('🤖 AI 推演中…');
    aiAsk('玩家自由行动输入：「'+t+'」').then(txt=>{
      if(!txt){log('<p class="sys">天道昭昭，你这一念（「'+esc(t)+'」）尚未得法。</p>');return}
      const intentMap=[
        [/修炼|闭关|打坐|静修|苦修/,()=>doCultivate(parseNum(t)||30)],
        [/探索|游历|外出/,()=>panelExplore()],
        [/坊市|买卖/,()=>panelMarket()],
        [/宗门/,()=>panelSect()],
        [/人际|聊天|拜访/,()=>panelSocial()],
        [/副业|炼丹|炼器|制符/,()=>panelCraft()],
        [/突破/,()=>tryBreak()],
        [/休整|休息|疗伤/,()=>doRest()],
        [/双修/,()=>doDualCultivate()],
      ];
      for(const [re,fn] of intentMap)if(re.test(txt)){fn();return}
      log('<p class="sys">🤖 天道推演：'+esc(txt)+'</p>');
      passTime(1);renderAll();
    });
    return;
  }
  log('<p class="sys">天道昭昭，你这一念（「'+esc(t)+'」）尚未得法。修仙者常见行止：修炼、探索、坊市、宗门、人际、副业、突破、休整。</p>');
}
function parseNum(t){
  const m=t.match(/\d+/);
  return m?clamp(parseInt(m[0]),1,365):0;
}
