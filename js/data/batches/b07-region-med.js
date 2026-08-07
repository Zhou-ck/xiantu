/* ======================================================
  仙途 · 内容批次 B07 区域记忆 + 顿悟（v95）
  只 push。id 前缀 b07_
  区域 +14（7 区各 +2）/ 顿悟 +14
====================================================== */
'use strict';
(function(){
  /* —— 区域记忆 +14 —— */
  if(typeof REGION_EVENTS!=='undefined'&&Array.isArray(REGION_EVENTS)){
    REGION_EVENTS.push(
      /* near ×2 */
      {id:'b07_rv_near_1',region:'near',minVisits:2,weight:2,title:'山神旧约',t:'破庙供桌前多了一盏长明灯，灯油是新的。你忽然想起山神当年说过的话。',opts:[
        {txt:'🙏 续上灯油，再添一炷香',cls:'primary',fx:{merit:2,cult:60}},
        {txt:'🧘 庙前静坐，想山神的话',fx:{insight:1,once:'b07_rv_near_1'}},
      ]},
      {id:'b07_rv_near_2',region:'near',minVisits:3,weight:2,title:'溪畔石阵',t:'溪边不知何时多了一堆摆成阵势的石子，不似人迹，倒像谁在推演什么。',opts:[
        {txt:'🔍 依阵势推演',cls:'primary',fx:{insight:1,once:'b07_rv_near_2'}},
        {txt:'🪨 添一枚石子入阵',fx:{luck:1,merit:1}},
      ]},
      /* hill ×2 */
      {id:'b07_rv_hill_1',region:'hill',minVisits:2,weight:2,title:'夜枭盘桓',t:'荒山夜枭盘桓不去，叫声凄厉。猎户说，夜枭不落无因之地。',opts:[
        {txt:'🕯️ 循夜枭盘旋处查探',cls:'primary',fx:{mat:{iron:1},stones:50}},
        {txt:'🧘 不为所动，继续赶路',fx:{merit:1}},
      ]},
      {id:'b07_rv_hill_2',region:'hill',minVisits:3,weight:2,title:'旧猎屋灯火',t:'那间塌了半边的猎户旧屋，今夜竟亮着灯。窗口映出一道佝偻的身影。',opts:[
        {txt:'🚪 叩门一问',cls:'primary',fx:{merit:2,mat:{pelt:1}}},
        {txt:'👀 远远看着，不打扰',fx:{insight:1,once:'b07_rv_hill_2'}},
      ]},
      /* forest ×2 */
      {id:'b07_rv_forest_1',region:'forest',minVisits:2,weight:2,title:'苔径新痕',t:'林间青苔小径上多了一串新脚印，浅而稳，一直通向密林深处。',opts:[
        {txt:'🦶 循脚印前行',cls:'primary',fx:{mat:{sherb:1,herb:1}}},
        {txt:'🚶 不追，原路返回',fx:{merit:1}},
      ]},
      {id:'b07_rv_forest_2',region:'forest',minVisits:3,weight:2,title:'药园灯影',t:'废弃药园的木屋里亮起灯，一个老妪正在灯下翻晒药草——这园子，竟又有人打理了。',opts:[
        {txt:'🌿 上前搭话，请教药经',cls:'primary',fx:{mat:{herb:2,sherb:1}}},
        {txt:'🙏 默默替她挑满一缸水',fx:{merit:2,insight:1,once:'b07_rv_forest_2'}},
      ]},
      /* cliff ×2 */
      {id:'b07_rv_cliff_1',region:'cliff',minVisits:2,weight:2,title:'崖畔新痕',t:'断魂崖的旧剑痕旁，多了一道极浅的新痕——像是有人隔空临摹过。',opts:[
        {txt:'🗡️ 以指代剑，补全那道痕',cls:'primary',fx:{cult:150,mat:{iron:1}}},
        {txt:'🧘 崖边静立，感受剑意',fx:{insight:1,once:'b07_rv_cliff_1'}},
      ]},
      {id:'b07_rv_cliff_2',region:'cliff',minVisits:3,weight:2,title:'雾中铃响',t:'云海深处传来一串若有若无的铃声，像有马车在雾里赶路。',opts:[
        {txt:'🛎️ 循声查探',cls:'primary',fx:{stones:80,merit:1}},
        {txt:'🌫️ 记下方位，退开',fx:{insight:1,once:'b07_rv_cliff_2'}},
      ]},
      /* abyss ×2 */
      {id:'b07_rv_abyss_1',region:'abyss',minVisits:2,weight:2,title:'焦土余温',t:'禁地深处那片焦土，如今竟透出一点温意——像有什么要破土而出。',opts:[
        {txt:'🔍 掘开焦土查看',cls:'primary',fx:{mat:{jade:1},stones:60}},
        {txt:'🧘 静观其变，不惊动',fx:{merit:2,insight:1,once:'b07_rv_abyss_1'}},
      ]},
      {id:'b07_rv_abyss_2',region:'abyss',minVisits:3,weight:2,title:'古修背影',t:'禁地雾中，那道古修残影背对着你站了很久，忽然抬手，指向禁地更深处。',opts:[
        {txt:'🧭 朝所指方向前行',cls:'danger',fx:{fight:{name:'禁地雾灵',atk:10,def:4,hp:52,elem:'dark',style:'guard'},winFx:{cult:160,insight:1}}},
        {txt:'🙏 回以一礼，目送其散去',fx:{merit:2,insight:1,once:'b07_rv_abyss_2'}},
      ]},
      /* valley ×2 */
      {id:'b07_rv_valley_1',region:'valley',minVisits:2,weight:2,title:'谷中石碑',t:'灵溪边露出一角青石碑，碑文被水磨得发亮，只有「药仙」二字依稀可辨。',opts:[
        {txt:'📜 拓下碑文',cls:'primary',fx:{insight:1,once:'b07_rv_valley_1'}},
        {txt:'🌿 依碑意寻药',fx:{mat:{sherb:2,herb:1}}},
      ]},
      {id:'b07_rv_valley_2',region:'valley',minVisits:3,weight:2,title:'琴音又起',t:'谷中又传来琴音，这次曲调与往日不同，像在诉说一段未完的旧事。',opts:[
        {txt:'🎶 循琴音听完',cls:'primary',fx:{cult:160,merit:1}},
        {txt:'🧘 席地静坐，任琴音入心',fx:{insight:1,once:'b07_rv_valley_2'}},
      ]},
      /* ruin ×2 */
      {id:'b07_rv_ruin_1',region:'ruin',minVisits:2,weight:2,title:'焦土旗帜',t:'古战场深处，一面残破的战旗插在焦土上，旗面竟无一丝血迹——是后来人插的。',opts:[
        {txt:'🏳️ 在旗下埋一壶酒',cls:'primary',fx:{merit:3,insight:1,once:'b07_rv_ruin_1'}},
        {txt:'⚔️ 拔旗而起，感受当年战意',fx:{cult:120,mat:{iron:1}}},
      ]},
      {id:'b07_rv_ruin_2',region:'ruin',minVisits:3,weight:2,title:'磷火引路',t:'夜里，一点磷火在前方明灭，不散不走，像在等你跟上。',opts:[
        {txt:'🕯️ 跟随磷火',cls:'primary',fx:{mat:{jade:1},stones:80}},
        {txt:'🧘 原地不动，等它自行散去',fx:{merit:2,insight:1,once:'b07_rv_ruin_2'}},
      ]},
    );
  }
  /* —— 顿悟 +14 —— */
  if(typeof MEDITATION_EVENTS!=='undefined'&&Array.isArray(MEDITATION_EVENTS)){
    MEDITATION_EVENTS.push(
      {id:'b07_med_1',t:'识海中一粒金色道种缓缓舒展，生出第一片嫩叶。',opts:[
        {txt:'✨ 温养道种（道基 +4 · 修为 +80）',fx:{dao:4,cult:80}},
        {txt:'🔥 催芽拔节（修为 +150 · 灵浊 +3）',fx:{cult:150,imp:3}},
      ]},
      {id:'b07_med_2',t:'心魔化作孩童模样，拉着你的衣角：「你修行这么久，可还记得最初为什么修仙？」',opts:[
        {txt:'🤝 蹲下认真回答（道基 +3 · 心魔 -1）',fx:{dao:3,heart:-1}},
        {txt:'🪞 反问心魔：「你又为什么存在」',fx:{insight:1,cult:90}},
      ]},
      {id:'b07_med_3',t:'洞外雷雨交加，一道闪电恰好照亮你面前的一滴雨珠，里面映着一整个世界。',opts:[
        {txt:'💧 观雨珠世界（悟道 +1 · 道基 +3）',fx:{insight:1,dao:3}},
        {txt:'⚡ 借雷光淬炼经脉（修为 +140）',fx:{cult:140,imp:2}},
      ]},
      {id:'b07_med_4',t:'山下传来迎亲的唢呐声。你闭着眼，却能「看见」新娘子红盖头下羞红的脸。',opts:[
        {txt:'🏮 品味人间喜乐（心境 +10 · 道基 +2）',fx:{mood:10,dao:2}},
        {txt:'🧘 收回神识（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_5',t:'丹田丹火轻轻跳动，一缕药香与道韵交织，你忽觉丹道与大道本是一炉。',opts:[
        {txt:'⚗️ 以丹火温养（造诣 +7 · 修为 +70）',fx:{profExp:7,cult:70}},
        {txt:'🧠 观药性悟道（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_6',t:'你看见自己的寿烛在风中摇曳，烛油滴落，在桌上凝成一朵小小的莲花。',opts:[
        {txt:'🕯️ 护烛静坐（心性 +1 · 道基 +3）',fx:{wil:1,dao:3}},
        {txt:'🪷 摘取烛油莲花（悟道 +1 · 心境 +6）',fx:{insight:1,mood:6}},
      ]},
      {id:'b07_med_7',t:'一只蜘蛛在洞顶结网，网被风吹破，它便重新织，周而复始，不厌其烦。',opts:[
        {txt:'🕸️ 观蛛结网（道基 +4 · 心境 +4）',fx:{dao:4,mood:4}},
        {txt:'🧘 悟「不厌其烦」四字（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_8',t:'你想起很久以前在山下遇见的一个孩子，他问你：「仙人是不是不会哭？」',opts:[
        {txt:'🫂 在心中回答他（道基 +3 · 心境 +6）',fx:{dao:3,mood:6}},
        {txt:'🧘 一笑了之（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_9',t:'丹田气海中浮起一粒微尘般的光点，那是无数次闭关累积的道种，正缓缓旋转。',opts:[
        {txt:'✨ 凝神护种（道基 +5 · 修为 +60）',fx:{dao:5,cult:60}},
        {txt:'🔥 燃种壮气（修为 +170 · 道基 -1）',fx:{cult:170,dao:-1}},
      ]},
      {id:'b07_med_10',t:'你「听见」山下一对老夫妻拌嘴，一个说菜咸了，一个说正好下饭，说着说着都笑了。',opts:[
        {txt:'🏮 品味相守（道基 +3 · 心境 +8）',fx:{dao:3,mood:8}},
        {txt:'🧘 返照自身（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_11',t:'一缕晨光斜斜照进洞府，光柱里尘埃飞舞，像无数微小的星辰。',opts:[
        {txt:'✨ 观尘埃星辰（悟道 +1 · 道基 +2）',fx:{insight:1,dao:2}},
        {txt:'🧘 借晨光温养（修为 +120）',fx:{cult:120}},
      ]},
      {id:'b07_med_12',t:'你于入定中「看见」一条河，河里有无数游鱼逆流而上，年年如此。',opts:[
        {txt:'🐟 观鱼逆流（道基 +4 · 心境 +4）',fx:{dao:4,mood:4}},
        {txt:'🧘 悟「知其不可而为之」（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_13',t:'丹田丹火温润如春，你想起初学炼丹时炸过的第一炉丹，满屋黑灰，却也笑得开怀。',opts:[
        {txt:'⚗️ 回味初心（造诣 +8 · 修为 +60）',fx:{profExp:8,cult:60}},
        {txt:'🧠 悟「失败也是道」（悟道 +1）',fx:{insight:1}},
      ]},
      {id:'b07_med_14',t:'寿烛之火忽然大亮，照亮洞府四壁，你看见墙上自己刻下的两个字：不悔。',opts:[
        {txt:'🕯️ 凝视「不悔」（心性 +1 · 道基 +3）',fx:{wil:1,dao:3}},
        {txt:'🔥 借烛火修行（修为 +150）',fx:{cult:150}},
      ]},
    );
  }
})();
