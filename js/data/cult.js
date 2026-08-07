/* ======================================================
  仙途 · 修行深化数据表（v55）
  说明：CULT_METHODS 修炼法门 / CULT_SCENES 修炼场景 /
        MEDITATION_EVENTS 顿悟演出事件池
  法门与场景在闭关面板每次选择；低特效/托管自动走默认（以气养神 · 洞府）
====================================================== */
'use strict';
const CULT_METHODS=[
  {id:'qi',n:'以气养神',i:'🧘',mult:1.0,dao:2,imp:0,insight:0.05,desc:'温养真元，稳中求进',note:'顿悟概率 +5%'},
  {id:'body',n:'以体炼气',i:'💪',mult:1.3,dao:1,imp:10,fire:0.05,spirit:0.2,desc:'筋骨齐炼，进境迅猛，但速修易积浊气',note:'灵浊 +10 · 走火 +5% · 耗真元 20%'},
  {id:'war',n:'以战悟道',i:'⚔️',mult:1.2,dao:3,needTech:2,desc:'以战养道，把战意消化成修为',note:'需战意 ×2'},
  {id:'wen',n:'以文入道',i:'📜',mult:0.8,dao:1,cost:30,book:true,desc:'著书立说，文气入道',note:'耗灵石 30 · 产「修行手札」'},
];
const CULT_SCENES=[
  {id:'cave',n:'洞府',i:'🏡',mult:1,need:0,desc:'洞府灵脉温养，四平八稳'},
  {id:'spring',n:'灵泉',i:'💧',mult:1.1,impClean:5,need:1,desc:'灵泉涤尘：修为 +10% · 每次排灵浊 5'},
  {id:'peak',n:'山巅',i:'⛰️',mult:1.15,insight:0.02,need:3,desc:'罡风洗练：修为 +15% · 顿悟 +2%'},
  {id:'snow',n:'雪山',i:'❄️',mult:0.9,daoX:1.1,need:9,desc:'寒潮静思：道基 +10% · 修为 -10%'},
  {id:'abyss',n:'禁地',i:'🌑',mult:1.3,need:13,danger:true,desc:'禁地险修：修为 +30% · 凶险事件缠身'},
];
/* 顿悟演出事件池：闭关中随机触发，数据化 + 抉择；低特效自动走第一项 */
const MEDITATION_EVENTS=[
  {id:'med_1',t:'灵气如潮，你忽见识海中浮现一轮明月，清辉漫洒。',opts:[
    {txt:'🌙 静观月华（悟道 +1）',fx:{insight:1,cult:80}},
    {txt:'🧘 借月洗炼道基（道基 +3）',fx:{dao:3}},
  ]},
  {id:'med_2',t:'一声鹤唳破空而来，天地灵气为之一凝——大道真意自鹤唳中传来。',opts:[
    {txt:'🕊️ 循声而悟（修为 +120）',fx:{cult:120}},
    {txt:'🌿 感悟生灵之机（悟道 +1）',fx:{insight:1,mood:8}},
  ]},
  {id:'med_3',t:'闭关日久，你与自身心魔骤然对视——魔影竟露出一个苦涩的笑。',opts:[
    {txt:'🤝 与魔和解（道基 +3 · 心魔 -1）',fx:{dao:3,heart:-1}},
    {txt:'⚔️ 斩却此念（修为 +100 · 心性判定）',fx:{cult:100}},
  ]},
  {id:'med_4',t:'一缕丹香自鼻尖飘过，你蓦然想起某味药材的药性——丹道与道法本出一源。',opts:[
    {txt:'⚗️ 循香悟丹（炼丹造诣 +8 · 悟道 +1）',fx:{profExp:8,insight:1}},
    {txt:'🧠 借药性观想经脉（修为 +90）',fx:{cult:90}},
  ]},
  {id:'med_5',t:'山外传来樵歌，粗犷却自在。你忽然明白：道不在云端，也在市井炊烟里。',opts:[
    {txt:'🏮 品味人间烟火（心境 +12 · 道基 +2）',fx:{mood:12,dao:2}},
    {txt:'🧘 返照自身（悟道 +1）',fx:{insight:1}},
  ]},
  {id:'med_6',t:'雷雨夜，一道惊雷劈在洞外古松上。焦木之下，新芽倔强地探出头来。',opts:[
    {txt:'🌱 观枯木逢春（道基 +4）',fx:{dao:4}},
    {txt:'⚡ 引雷气淬体（修为 +110 · 走火 +2%）',fx:{cult:110,imp:4}},
  ]},
  {id:'med_7',t:'你于入定中「看见」自己的寿数如烛火摇曳，忽然悲从中来。',opts:[
    {txt:'🕯️ 视死如归，道心愈坚（心性 +1 · 道基 +2）',fx:{wil:1,dao:2}},
    {txt:'⏳ 惜时如金，加倍苦修（修为 +130 · 灵浊 +5）',fx:{cult:130,imp:5}},
  ]},
  {id:'med_8',t:'一阵微风卷着花瓣掠过指尖，你捕捉到一线「无常」的真意。',opts:[
    {txt:'🌸 悟无常（悟道 +1 · 心境 +8）',fx:{insight:1,mood:8}},
    {txt:'🍃 任其来去（道基 +3）',fx:{dao:3}},
  ]},
  {id:'med_9',t:'丹田气旋中，一粒微尘般的金色光点忽然亮起——那是你无数次闭关累积的「道种」。',opts:[
    {txt:'✨ 凝神护种（道基 +5 · 修为 +60）',fx:{dao:5,cult:60}},
    {txt:'🔥 燃种壮气（修为 +160 · 道基 -1）',fx:{cult:160,dao:-1}},
  ]},
  {id:'med_10',t:'云海之上，一座若隐若现的仙山向你颔首——那是天机对你勤修的回应。',opts:[
    {txt:'🙏 回礼致意（气运 +1 · 悟道 +1）',fx:{luck:1,insight:1}},
    {txt:'🧭 记下仙山方位（游历修行加成 · 悟道 +1）',fx:{insight:1,wander:1}},
  ]},
];
function cultMethod(id){return CULT_METHODS.find(m=>m.id===id)||CULT_METHODS[0]}
function cultScene(id){return CULT_SCENES.find(s=>s.id===id)||CULT_SCENES[0]}
