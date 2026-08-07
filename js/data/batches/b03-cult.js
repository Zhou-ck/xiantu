/* ======================================================
  仙途 · 内容批次 B03 顿悟/区域/称号（v92）
  只 push。id 前缀 b03_
  MEDITATION +6 / REGION +4 / TITLES +6
====================================================== */
'use strict';
(function(){
  /* —— 顿悟 +6 —— */
  if(typeof MEDITATION_EVENTS!=='undefined'&&Array.isArray(MEDITATION_EVENTS)){
    MEDITATION_EVENTS.push(
      {id:'b03_med_1',t:'识海深处浮起一粒金色道种，它轻轻脉动，像一颗尚未醒来的心。',opts:[
        {txt:'✨ 温养道种（道基 +4 · 修为 +70）',fx:{dao:4,cult:70}},
        {txt:'🔥 催种破壳（修为 +140 · 灵浊 +3）',fx:{cult:140,imp:3}},
      ]},
      {id:'b03_med_2',t:'心魔披着你的面孔坐在对面，安静地问：「你修仙，是为了什么？」',opts:[
        {txt:'🪞 认真作答（道基 +3 · 心魔 -1）',fx:{dao:3,heart:-1}},
        {txt:'⚔️ 一剑斩影（修为 +100）',fx:{cult:100}},
      ]},
      {id:'b03_med_3',t:'洞外星河低垂，一颗星忽然亮得刺眼，随即沉入你的眉心。',opts:[
        {txt:'🌟 承接星意（悟道 +1 · 气运 +1）',fx:{insight:1,luck:1}},
        {txt:'🧘 化星为修为（修为 +130）',fx:{cult:130}},
      ]},
      {id:'b03_med_4',t:'你「听见」山下村落的犬吠与婴啼，一时竟分不清自己身在洞府还是人间。',opts:[
        {txt:'🏮 品味烟火（心境 +10 · 道基 +2）',fx:{mood:10,dao:2}},
        {txt:'🧘 收回神识（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b03_med_5',t:'丹田内一缕丹火无故跳动，药香与道韵交织——丹道与大道本同源。',opts:[
        {txt:'⚗️ 以丹火温养经脉（造诣 +6 · 修为 +80）',fx:{profExp:6,cult:80}},
        {txt:'🧠 观想药性入道（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b03_med_6',t:'你看见自己的寿烛在风中摇曳，烛泪滴落的地方长出一朵小白花。',opts:[
        {txt:'🕯️ 护烛不灭（心性 +1 · 道基 +3）',fx:{wil:1,dao:3}},
        {txt:'🌸 摘花一观（悟道 +1 · 心境 +6）',fx:{insight:1,mood:6}},
      ]}
    );
  }
  /* —— 区域记忆 +4 —— */
  if(typeof REGION_EVENTS!=='undefined'&&Array.isArray(REGION_EVENTS)){
    REGION_EVENTS.push(
      {id:'b03_rv_ruin_1',region:'ruin',minVisits:2,weight:2,title:'焦土新芽',t:'古战场焦土裂缝里，竟钻出一株嫩绿的草芽。生死之间，原来总有缝隙。',opts:[
        {txt:'🌱 小心移栽草芽',cls:'primary',fx:{mat:{herb:1},merit:2}},
        {txt:'🙏 原地护芽，浇一捧清水',fx:{merit:3,insight:1,once:'b03_rv_ruin_1'}},
      ]},
      {id:'b03_rv_abyss_1',region:'abyss',minVisits:2,weight:2,title:'禁地回响',t:'禁地深处传来一声极轻的叹息，像有人在很远的地方叫你的名字。',opts:[
        {txt:'👂 循声深入三步',cls:'danger',fx:{fight:{name:'禁地残响',atk:11,def:4,hp:55,elem:'dark',style:'guard'},winFx:{cult:180,insight:1}}},
        {txt:'🧘 原地静听，不追',fx:{insight:1,once:'b03_rv_abyss_1'}},
      ]},
      {id:'b03_rv_valley_1',region:'valley',minVisits:2,weight:2,title:'谷底玉简',t:'灵溪冲刷下露出半截玉简，简上道纹被水磨得温润，触手微凉。',opts:[
        {txt:'📜 捞起参悟',cls:'primary',fx:{insight:1,once:'b03_rv_valley_1'}},
        {txt:'💧 以溪水洗简后收藏',fx:{cult:160,stones:40}},
      ]},
      {id:'b03_rv_forest_1',region:'forest',minVisits:2,weight:2,title:'古树年轮',t:'一棵被雷劈过的古树倒下，年轮断面上竟刻着两行小字——像是某位前辈的留言。',opts:[
        {txt:'📖 拓印留言',cls:'primary',fx:{insight:1,once:'b03_rv_forest_1'}},
        {txt:'🪵 取一截雷击木',fx:{mat:{iron:1,jade:1}}},
      ]}
    );
  }
  /* —— 称号 +6（函数型，必须手写） —— */
  if(typeof TITLES!=='undefined'&&Array.isArray(TITLES)){
    TITLES.push(
      {id:'b03_t_daolun20',name:'论道宗师',desc:'论道胜 20 场，智慧 +1',
        check:function(s){return (s.flag&&s.flag.daolunWins||0)>=20},
        effect:function(s){s.attrs.int=clamp(s.attrs.int+1,1,40)}},
      {id:'b03_t_dungeon6',name:'秘境常客',desc:'通关秘境 6 座，气运 +1',
        check:function(s){return (s.flag&&s.flag.dungeons||0)>=6},
        effect:function(s){s.luck=clamp(s.luck+1,1,100)}},
      {id:'b03_t_tide10',name:'镇潮者',desc:'妖潮全胜 10 次，力量 +1',
        check:function(s){return (s.flag&&s.flag.tideWins||0)>=10},
        effect:function(s){s.attrs.str=clamp(s.attrs.str+1,1,40)}},
      {id:'b03_t_atlas80',name:'博物君子',desc:'图鉴收集达 80，魅力 +1',
        check:function(s){return Object.keys(s.seenI||{}).length+Object.keys(s.seenE||{}).length>=80},
        effect:function(s){s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
      {id:'b03_t_year200',name:'两百年身',desc:'这一世活过两百年，心性 +1',
        check:function(s){return (s.years||0)>=200},
        effect:function(s){s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
      {id:'b03_t_explore80',name:'云游散仙',desc:'探索累计 80 次，身法 +1',
        check:function(s){return (s.flag&&s.flag.exploreCount||0)>=80},
        effect:function(s){s.attrs.agi=clamp(s.attrs.agi+1,1,40)}}
    );
  }
})();
