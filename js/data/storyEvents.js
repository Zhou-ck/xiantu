/* ======================================================
  仙途 · 通用故事事件池（v47，60 条）
  五类：calm 平静 / herb 采药 / rare 奇遇 / epic 天降奇缘 / danger 凶险
  结构：{id, cat, weight, minRealm?, title, t, opts:[{txt, cls?, fx?}]}
  fx 复用 exploreEvents.applyEventEffects 语义（含 fight / once）
====================================================== */
'use strict';
const STORY_EVENTS=[
  /* —— calm 平静（12）—— */
  {id:'st_calm_1',cat:'calm',weight:2,title:'山亭避雨',t:'骤雨忽至，你于半山亭中避雨。檐角滴水成帘，远处山色如洗。',opts:[{txt:'☔ 静立听雨',cls:'primary',fx:{cult:60}},{txt:'🫖 取水煮茶，独酌一盏',fx:{mood:3}}]},
  {id:'st_calm_2',cat:'calm',weight:2,title:'晚钟',t:'暮色四合，山下古寺传来晚钟。钟声悠远，涤荡尘心。',opts:[{txt:'🛎️ 驻足听完',cls:'primary',fx:{merit:1}},{txt:'🚶 继续赶路',fx:{cult:40}}]},
  {id:'st_calm_3',cat:'calm',weight:2,title:'枯井',t:'路边一口枯井，井壁上青苔斑驳，井底传来细碎的滴水声。',opts:[{txt:'🪣 探头细看',cls:'primary',fx:{stones:45}},{txt:'🚶 不作停留',fx:{}}]},
  {id:'st_calm_4',cat:'calm',weight:2,title:'石上棋局',t:'两块青石上刻着一局残棋，棋子早已风化，棋路却依稀可辨。',opts:[{txt:'♟️ 依记忆复盘此局',cls:'primary',fx:{insight:1,once:'st_calm_4'}},{txt:'🚶 拂袖而去',fx:{cult:50}}]},
  {id:'st_calm_5',cat:'calm',weight:2,title:'渔翁',t:'溪边渔翁垂钓，钓竿弯如满月，桶中却空无一鱼。',opts:[{txt:'🎣 陪他坐等',cls:'primary',fx:{merit:1,mood:3}},{txt:'🤔 问其为何空钓',fx:{insight:1,once:'st_calm_5'}}]},
  {id:'st_calm_6',cat:'calm',weight:2,title:'萤火',t:'入夜，漫山萤火浮动，如星河倒泻，落在你衣襟上。',opts:[{txt:'✨ 伸手接住一只',cls:'primary',fx:{luck:1,once:'st_calm_6'}},{txt:'🦋 任其飞舞，静观片刻',fx:{cult:70}}]},
  {id:'st_calm_7',cat:'calm',weight:2,title:'老槐',t:'村口老槐树下坐着几个老人，正讲着当年山里的妖怪故事。',opts:[{txt:'👂 听他们讲完',cls:'primary',fx:{insight:1,once:'st_calm_7'}},{txt:'🚶 一笑而过',fx:{}}]},
  {id:'st_calm_8',cat:'calm',weight:2,title:'晒经',t:'古寺檐下晾着半卷旧经，墨迹洇开处自成一篇。',opts:[{txt:'📜 默诵一遍',cls:'primary',fx:{cult:55}},{txt:'🙏 替它遮雨',fx:{merit:2}}]},
  {id:'st_calm_9',cat:'calm',weight:2,title:'磨刀',t:'山道上有人磨刀霍霍，火星四溅。他抬头冲你一笑：「赶路？刀快，路才稳。」',opts:[{txt:'🗡️ 请他代为开锋',cls:'primary',fx:{mat:{iron:1}}},{txt:'🤝 谢过，继续赶路',fx:{merit:1}}]},
  {id:'st_calm_10',cat:'calm',weight:2,title:'云海',t:'你在崖畔望见云海翻涌，一轮红日自云层中浮起，天地为之一亮。',opts:[{txt:'🌅 静立观日出',cls:'primary',fx:{mood:5}},{txt:'🧘 就着晨光打坐',fx:{cult:80}}]},
  {id:'st_calm_11',cat:'calm',weight:2,title:'草鞋',t:'路旁挂着一串新编的草鞋，旁边木牌写着「自取，缘者留三文」。',opts:[{txt:'👟 取一双，留下三文',cls:'primary',fx:{merit:1}},{txt:'🚶 不便取用',fx:{}}]},
  {id:'st_calm_12',cat:'calm',weight:2,title:'琴声断续',t:'深林里琴声断续，时有时无，像有人在隔着重山练习一首新曲。',opts:[{txt:'🎶 驻足倾听',cls:'primary',fx:{mood:4}},{txt:'🚶 循声而去又止步',fx:{cult:45}}]},
  /* —— herb 采药（12）—— */
  {id:'st_herb_1',cat:'herb',weight:2,title:'石斛',t:'陡崖石缝间生着一丛石斛，叶如碧玉，正是入药好材。',opts:[{txt:'🧗 攀崖采之',cls:'primary',fx:{mat:{herb:2}}},{txt:'🚶 崖险，不取',fx:{}}]},
  {id:'st_herb_2',cat:'herb',weight:2,title:'药香引路',t:'一阵药香引你拐入一条人迹罕至的小径，尽头竟是一片野生药圃。',opts:[{txt:'🌿 小心采撷',cls:'primary',fx:{mat:{herb:3,sherb:1}}},{txt:'⚠️ 留一半，敬天地',fx:{merit:2,mat:{herb:2}}}]},
  {id:'st_herb_3',cat:'herb',weight:2,title:'露珠',t:'晨露未干，草叶上的露珠圆润如珠。有经验的老农说，这露水能养药。',opts:[{txt:'💧 以玉瓶收集',cls:'primary',fx:{mat:{sherb:1}}},{txt:'🙅 不夺草木之露',fx:{merit:1}}]},
  {id:'st_herb_4',cat:'herb',weight:2,title:'菌菇',t:'雨后腐木下冒出一片菌菇，伞盖肥厚，香气扑鼻。',opts:[{txt:'🍄 采下辨识',cls:'primary',fx:{mat:{herb:2}}},{txt:'🤔 先请教识药之人',fx:{mat:{herb:1}}}]},
  {id:'st_herb_5',cat:'herb',weight:2,title:'藤果',t:'一根古藤攀上巨树，藤上挂着三枚朱红果实，熟透欲坠。',opts:[{txt:'🍒 摘下一枚',cls:'primary',fx:{mat:{sherb:1},cult:30}},{txt:'🚶 留它自然落果',fx:{merit:1}}]},
  {id:'st_herb_6',cat:'herb',weight:2,title:'药锄',t:'你捡到一把半埋的药锄，锄柄刻着「山氏」。不远处有新翻的土。',opts:[{txt:'🔍 顺着药锄挖掘',cls:'primary',fx:{mat:{herb:2,sherb:1}}},{txt:'📜 记下方位，物归原位',fx:{merit:1}}]},
  {id:'st_herb_7',cat:'herb',weight:2,title:'灵蜂',t:'一群灵蜂嗡嗡飞过，落在某株野花上。蜂多之处，常有灵蜜。',opts:[{txt:'🐝 循蜂觅蜜',cls:'primary',fx:{mat:{herb:2},stones:30}},{txt:'🚶 不扰其巢',fx:{}}]},
  {id:'st_herb_8',cat:'herb',weight:2,title:'药王谷口',t:'两山夹峙处立着一块古碑：「药王谷」。谷口藤蔓垂密，深不见底。',opts:[{txt:'🌿 拨藤而入',cls:'primary',fx:{mat:{sherb:2}}},{txt:'⚠️ 谷深莫入，记下方位',fx:{insight:1,once:'st_herb_8'}}]},
  {id:'st_herb_9',cat:'herb',weight:2,title:'雪莲',t:'高山雪线上一株雪莲迎风而开，花瓣晶莹，药力内敛。',opts:[{txt:'❄️ 采下雪莲',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🙏 合掌一礼，让它开完这一季',fx:{merit:2,insight:1,once:'st_herb_9'}}]},
  {id:'st_herb_10',cat:'herb',weight:2,title:'换药',t:'山中猎户想以兽骨换你的疗伤药。他手上有新鲜的妖皮。',opts:[{txt:'🤝 交换',cls:'primary',fx:{mat:{pelt:2}}},{txt:'🙏 白送他一卷伤药',fx:{merit:3}}]},
  {id:'st_herb_11',cat:'herb',weight:2,title:'百草谱',t:'你在溪石下压着的一页残谱上认出几味药名，墨迹犹新。',opts:[{txt:'📖 临摹药谱',cls:'primary',fx:{insight:1,once:'st_herb_11'}},{txt:'🌿 照谱采药',fx:{mat:{herb:3}}}]},
  {id:'st_herb_12',cat:'herb',weight:2,title:'药田守望',t:'一片荒废药田里，一个老农拄锄而立，望着满田野草叹气。',opts:[{txt:'🤝 帮他翻一畦田',cls:'primary',fx:{merit:2,mat:{herb:2}}},{txt:'🚶 匆匆路过',fx:{}}]},
  /* —— rare 奇遇（12）—— */
  {id:'st_rare_1',cat:'rare',weight:2,title:'断碑残文',t:'一块断碑半埋土中，碑面文字多已漫漶，唯「道不可闻」四字清晰。',opts:[{txt:'📖 以指描摹',cls:'primary',fx:{insight:1,once:'st_rare_1'}},{txt:'🧘 于碑前静坐',fx:{cult:150}}]},
  {id:'st_rare_2',cat:'rare',weight:2,title:'古井映月',t:'荒村古井中水波不兴，月影沉底，井壁刻着「汲此水者，三日内有奇遇」。',opts:[{txt:'🪣 打水一饮',cls:'primary',fx:{luck:1,once:'st_rare_2'}},{txt:'⚠️ 恐有蹊跷，不饮',fx:{insight:1,once:'st_rare_2b'}}]},
  {id:'st_rare_3',cat:'rare',weight:2,title:'石中剑',t:'溪心巨石上插着一柄古剑，剑柄缠着褪色的红绸，剑身没入石中三寸。',opts:[{txt:'🗡️ 拔剑一试',cls:'primary',fx:{fight:{name:'石中剑意',atk:7,def:3,hp:40,elem:'metal',style:'guard'},winFx:{item:{name:'青锋古剑',type:'weapon',quality:2,bonus:3,desc:'自溪心巨石拔出的古剑，剑鸣清越。',sell:380}}}},{txt:'🙏 向古剑一礼，转身而去',fx:{insight:1,once:'st_rare_3'}}]},
  {id:'st_rare_4',cat:'rare',weight:2,title:'鹤唳',t:'天际一声鹤唳，一只白鹤自云中降下，爪上缚着一只锦囊。',opts:[{txt:'🎁 取锦囊查看',cls:'primary',fx:{stones:200}},{txt:'🕊️ 解开锦囊放鹤归',fx:{merit:3,luck:1,once:'st_rare_4'}}]},
  {id:'st_rare_5',cat:'rare',weight:2,title:'丹炉遗迹',t:'深谷里散落着几座废弃丹炉，炉身焦黑，地上一摊银白药渣仍泛着微光。',opts:[{txt:'⚗️ 刮取药渣',cls:'primary',fx:{mat:{sherb:2,jade:1}}},{txt:'🔍 研究炉文',fx:{insight:1,once:'st_rare_5'}}]},
  {id:'st_rare_6',cat:'rare',weight:2,title:'无名碑林',t:'一片碑林立在山腰，碑上无字，碑底却各压着一枚铜钱。',opts:[{txt:'🪙 取一枚铜钱',cls:'primary',fx:{stones:150}},{txt:'🙏 合掌一礼，不取',fx:{merit:2,luck:1,once:'st_rare_6'}}]},
  {id:'st_rare_7',cat:'rare',weight:2,title:'夜明珠',t:'渔人网起一枚夜明珠，珠光温润，映得满船生辉。他愿低价出手。',opts:[{txt:'💰 买下（120 灵石）',cls:'primary',fx:{stones:-120,item:{name:'夜明珠',type:'trinket',quality:2,bonus:1,desc:'渔人网起的夜明珠，温润生辉，佩戴者心神安宁。',sell:200}}},{txt:'🚶 不夺人所获',fx:{merit:1}}]},
  {id:'st_rare_8',cat:'rare',weight:2,title:'古画',t:'破庙墙上挂着一幅褪色古画，画中仙人在云海对弈。你多看了几眼，画中棋子似在移动。',opts:[{txt:'🎨 凝神观画',cls:'primary',fx:{insight:1,once:'st_rare_8'}},{txt:'🚶 唯恐入画，移开目光',fx:{cult:100}}]},
  {id:'st_rare_9',cat:'rare',weight:2,title:'山腹灵矿',t:'崩塌的山壁上露出晶亮的一角——是灵石原矿，灵气四溢。',opts:[{txt:'⛏️ 凿取灵石',cls:'primary',fx:{stones:300}},{txt:'🙏 记下方位，不竭泽而渔',fx:{merit:1,insight:1,once:'st_rare_9'}}]},
  {id:'st_rare_10',cat:'rare',weight:2,title:'异兽足迹',t:'雪地上有一串从未见过的兽足印，每个足印边缘都凝着细碎的灵光。',opts:[{txt:'🦌 循迹追踪',cls:'primary',fx:{fight:{name:'灵角兽',atk:8,def:4,hp:45,elem:'wood',style:'rapid'},winFx:{mat:{demonCore:1},stones:80}}},{txt:'🚶 止步，不惊其踪',fx:{merit:1}}]},
  {id:'st_rare_11',cat:'rare',weight:2,title:'流星',t:'夜里一道流星划过天际，落在远山之后，久久有火光不熄。',opts:[{txt:'🌠 记下方位，明日去寻',cls:'primary',fx:{flag:{meteorSite:1}}},{txt:'🌌 静观其落，任其消逝',fx:{insight:1,once:'st_rare_11'}}]},
  {id:'st_rare_12',cat:'rare',weight:2,title:'古卷残页',t:'风从山脊吹来一张焦黄的残页，上书半阙剑诀，笔力虬劲。',opts:[{txt:'📜 收下参悟',cls:'primary',fx:{insight:1,once:'st_rare_12'}},{txt:'🔥 任它随风而去',fx:{merit:1}}]},
  /* —— epic 天降奇缘（12）—— */
  {id:'st_epic_1',cat:'epic',weight:1,title:'灵泉圣水',t:'一道灵泉自石缝中涌出，泉眼处泛着五色灵光——是传说中的圣泉。',opts:[{txt:'💧 掬饮三口',cls:'primary',fx:{root:3}},{txt:'🫙 以玉瓶盛满带走',fx:{item:{name:'圣泉灵水',type:'consumable',quality:4,count:1,desc:'五色灵泉所凝，服之灵根 +3。',use:'root3',sell:900}}}]},
  {id:'st_epic_2',cat:'epic',weight:1,title:'仙人指路',t:'云海中浮现一位仙人虚影，抬手一点，一道灵光没入你眉心。',opts:[{txt:'🙏 行大礼谢恩',cls:'primary',fx:{insight:2,once:'st_epic_2'}},{txt:'🧘 就地打坐消化',fx:{cult:500}}]},
  {id:'st_epic_3',cat:'epic',weight:1,title:'万剑归宗',t:'剑冢残响于天地间共鸣，万剑虚影朝你俯首。',opts:[{txt:'🗡️ 承接剑意',cls:'primary',fx:{insight:1,once:'st_epic_3',flag:{swordIntent2:1}}},{txt:'🚶 敛锋藏锐',fx:{merit:2}}]},
  {id:'st_epic_4',cat:'epic',weight:1,title:'龙宫遗宝',t:'潮水退去，滩涂上露出一只螺壳，壳中传来海浪声——龙宫遗宝。',opts:[{txt:'🐚 拾起螺壳',cls:'primary',fx:{item:{name:'海螺灵宝',type:'trinket',quality:3,bonus:2,desc:'潮中拾得的龙宫遗宝，隐隐有海浪声。',sell:800}}},{txt:'🌊 放回海中',fx:{merit:4,luck:1,once:'st_epic_4'}}]},
  {id:'st_epic_5',cat:'epic',weight:1,title:'天书一卷',t:'一只白鹤衔来一卷天书，落地化作光点，只留卷首一字：「道」。',opts:[{txt:'📖 参悟此字',cls:'primary',fx:{insight:2,once:'st_epic_5'}},{txt:'🧘 闭目入定三日',fx:{cult:800}}]},
  {id:'st_epic_6',cat:'epic',weight:1,title:'灵根重铸',t:'一道神雷劈落身旁，雷火过处，你竟感到灵根松动、似有新芽。',opts:[{txt:'⚡ 迎雷淬体',cls:'danger',fx:{fight:{name:'淬体神雷',atk:12,def:0,hp:60,elem:'thunder',style:'burst'},winFx:{root:5}}},{txt:'🚶 避其锋芒',fx:{root:2}}]},
  {id:'st_epic_7',cat:'epic',weight:1,title:'福地洞天',t:'迷路间，你闯入一处灵气充沛的福地，洞壁刻着「有缘者得」。',opts:[{txt:'🏞️ 于福地闭关三日',cls:'primary',fx:{cult:900}},{txt:'🔍 仔细勘察洞壁',fx:{item:{name:'福地玉简',type:'consumable',quality:4,count:1,desc:'福地洞天所藏，参悟可得一门功法。',use:'art',sell:1200}}}]},
  {id:'st_epic_8',cat:'epic',weight:1,title:'天降机缘',t:'一朵七彩祥云降下，云中落下一枚流转灵光的道果。',opts:[{txt:'🍑 摘取道果服下',cls:'primary',fx:{root:3,cult:400}},{txt:'🌱 种下道果，留待来世',fx:{merit:5,luck:1,once:'st_epic_8'}}]},
  {id:'st_epic_9',cat:'epic',weight:1,title:'仙鹤报恩',t:'你曾救过的那只白鹤衔来一只锦盒，盒中是一枚温润的兽卵。',opts:[{txt:'🥚 收下兽卵',cls:'primary',fx:{item:{name:'仙鹤蛋',type:'egg',quality:3,use:'hatch',desc:'仙鹤报恩所赠，可孵化灵宠。',sell:700}}},{txt:'🕊️ 让白鹤带走',fx:{merit:3,luck:1,once:'st_epic_9'}}]},
  {id:'st_epic_10',cat:'epic',weight:1,title:'悟道石',t:'溪中一方青石浮沉，石上天然生着道纹，似有若无。',opts:[{txt:'🧘 坐石悟道',cls:'primary',fx:{insight:2,once:'st_epic_10'}},{txt:'💪 抱石淬体',fx:{merit:2}}]},
  {id:'st_epic_11',cat:'epic',weight:1,title:'五色祥云',t:'五色祥云聚于头顶，云中垂下一缕灵光，直入你的天灵。',opts:[{txt:'☁️ 承接灵光',cls:'primary',fx:{luck:1,root:2}},{txt:'🛐 三拜九叩',fx:{merit:4,insight:1,once:'st_epic_11'}}]},
  {id:'st_epic_12',cat:'epic',weight:1,title:'地脉灵眼',t:'你脚下土地忽然透出灵光——此处竟是地脉灵眼，灵气如泉涌。',opts:[{txt:'🧘 就地修炼',cls:'primary',fx:{cult:1000}},{txt:'🗺️ 记下灵眼方位',fx:{insight:1,once:'st_epic_12'}}]},
  /* —— danger 凶险（12）—— */
  {id:'st_danger_1',cat:'danger',weight:2,title:'流沙',t:'你一脚踏入流沙，沙面如活物般蠕动，正将你往下吞。',opts:[{txt:'💨 御气挣扎',cls:'danger',fx:{fight:{name:'流沙之口',atk:6,def:2,hp:30,elem:'earth',style:'guard'},winFx:{stones:60}}},{txt:'🪢 借树枝攀出',fx:{hp:-15}}]},
  {id:'st_danger_2',cat:'danger',weight:2,title:'毒瘴',t:'前方山谷瘴气弥漫，隐约可见白骨。',opts:[{txt:'😤 闭气强闯',cls:'danger',fx:{fight:{name:'毒瘴',atk:7,def:0,hp:35,elem:'wood',style:'poison'},winFx:{mat:{herb:2}}}},{txt:'🌀 绕行三日',fx:{hp:-10}}]},
  {id:'st_danger_3',cat:'danger',weight:2,title:'塌桥',t:'山涧木桥年久失修，你行至桥心，桥板应声而裂。',opts:[{txt:'🏃 提气飞掠',cls:'danger',fx:{fight:{name:'断桥',atk:5,def:0,hp:25,elem:'metal',style:'burst'},winFx:{}}},{txt:'🤸 抱树荡过',fx:{hp:-12}}]},
  {id:'st_danger_4',cat:'danger',weight:2,title:'野火',t:'山火自南坡蔓延而来，浓烟滚滚，前路被火墙截断。',opts:[{txt:'🔥 以水灵根压火开路',cls:'danger',fx:{fight:{name:'山火之墙',atk:8,def:2,hp:40,elem:'fire',style:'burst'},winFx:{mat:{pelt:1}}}},{txt:'🏃 逆风回撤，另寻出路',fx:{hp:-15}}]},
  {id:'st_danger_5',cat:'danger',weight:2,title:'马蜂',t:'你惊动了一窝灵蜂，嗡鸣如雷，遮天蔽日地扑来。',opts:[{txt:'💨 全力奔逃',cls:'danger',fx:{fight:{name:'灵蜂群',atk:6,def:1,hp:30,elem:'wood',style:'rapid'},winFx:{mat:{herb:2}}}},{txt:'🫥 伏地屏息',fx:{hp:-10}}]},
  {id:'st_danger_6',cat:'danger',weight:2,title:'地陷',t:'脚下山体轰然塌陷，你连人带土坠入一处幽暗深坑。',opts:[{txt:'🕳️ 御气缓冲落地',cls:'danger',fx:{fight:{name:'深坑',atk:6,def:0,hp:35,elem:'earth',style:'guard'},winFx:{stones:80}}},{txt:'🧗 攀壁而上',fx:{hp:-18}}]},
  {id:'st_danger_7',cat:'danger',weight:2,title:'雪崩',t:'一声巨响，山顶积雪如幕倾泻而下，轰鸣震耳。',opts:[{txt:'⛷️ 御雪而行',cls:'danger',fx:{fight:{name:'雪崩',atk:9,def:2,hp:45,elem:'ice',style:'burst'},winFx:{mat:{jade:1}}}},{txt:'🕳️ 就近找岩缝躲避',fx:{hp:-20}}]},
  {id:'st_danger_8',cat:'danger',weight:2,title:'拦路劫修',t:'三名蒙面修士拦住去路：「留下灵石，饶你不死。」',opts:[{txt:'⚔️ 拔剑应战',cls:'danger',fx:{fight:{name:'拦路劫修',atk:8,def:3,hp:40,elem:'dark',style:'aggressive'},winFx:{stones:150}}},{txt:'💎 破财消灾（200 灵石）',fx:{stones:-200}}]},
  {id:'st_danger_9',cat:'danger',weight:2,title:'瘴泉',t:'你误饮了一捧瘴泉，腹中如火烧，眼前景物晃动。',opts:[{txt:'💊 运功逼毒',cls:'danger',fx:{fight:{name:'瘴毒',atk:5,def:0,hp:30,elem:'wood',style:'poison'},winFx:{}}},{txt:'🩹 服疗伤丹压住',fx:{hp:-15,mat:{herb:-1}}}]},
  {id:'st_danger_10',cat:'danger',weight:2,title:'鬼打墙',t:'你在原地转了三圈，回到同一棵歪脖子树下——是鬼打墙。',opts:[{txt:'🔦 破咒而行',cls:'danger',fx:{fight:{name:'迷障鬼影',atk:7,def:2,hp:35,elem:'dark',style:'guard'},winFx:{merit:2}}},{txt:'🧘 席地静坐等天亮',fx:{hp:-10}}]},
  {id:'st_danger_11',cat:'danger',weight:2,title:'凶兽巢穴',t:'你误入凶兽巢穴，兽吼如雷，腥风扑面。',opts:[{txt:'🐾 迎战巢穴之主',cls:'danger',fx:{fight:{name:'巢穴凶兽',atk:10,def:4,hp:50,elem:'wood',style:'burst'},winFx:{mat:{demonCore:1}}}},{txt:'🏃 夺路而逃',fx:{hp:-15}}]},
  {id:'st_danger_12',cat:'danger',weight:2,title:'落石',t:'山壁上碎石如雨，一路滚落，砸得草木俱断。',opts:[{txt:'🏃 闪避穿行',cls:'danger',fx:{fight:{name:'落石雨',atk:7,def:1,hp:32,elem:'earth',style:'rapid'},winFx:{mat:{iron:1}}}},{txt:'🛡️ 抱头缩于岩后',fx:{hp:-12}}]},
  /* —— v55 扩充（12 条）—— */
  {id:'st_v55_1',cat:'calm',weight:2,title:'山雾聚散',t:'行至山腰，浓雾忽至又忽散，雾中隐有樵歌，歌声一起雾便淡了三分。',opts:[{txt:'🎵 循歌而行',cls:'primary',fx:{mood:4,cult:50}},{txt:'🧘 雾中静立，观聚散',fx:{cult:70}}]},
  {id:'st_v55_2',cat:'calm',weight:2,title:'老茶棚',t:'山道旁一个草棚茶摊，老板是个瞎眼老人，茶却泡得极好。',opts:[{txt:'🫖 付三文钱喝茶',cls:'primary',fx:{merit:1,mood:3}},{txt:'🤫 放下茶钱，悄然离去',fx:{merit:2}}]},
  {id:'st_v55_3',cat:'calm',weight:2,title:'枯荷听雨',t:'一方枯荷塘，雨打残荷，声声入耳。你忽然想起一句旧诗。',opts:[{txt:'📜 默念全诗',cls:'primary',fx:{insight:1,once:'st_v55_3'}},{txt:'🌧️ 静听一场雨',fx:{mood:5,cult:40}}]},
  {id:'st_v55_4',cat:'calm',weight:2,title:'星垂平野',t:'夜宿旷野，四野无声，星河低得仿佛伸手可触。',opts:[{txt:'✨ 观星一夜',cls:'primary',fx:{cult:90}},{txt:'🌠 向流星许一个愿',fx:{luck:1,once:'st_v55_4'}}]},
  {id:'st_v55_5',cat:'herb',weight:2,title:'千年茯苓',t:'老松根下一块茯苓大如人头，药香沉沉，怕有千年火候。',opts:[{txt:'⛏️ 小心掘取',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🙏 留它继续长',fx:{merit:2,mat:{herb:1}}}]},
  {id:'st_v55_6',cat:'herb',weight:2,title:'药泉',t:'石缝中涌出一泉，泉边草木格外葱茏，泉水带淡淡药香。',opts:[{txt:'🫙 盛满一瓶',cls:'primary',fx:{mat:{herb:2},cult:40}},{txt:'💧 取水浇灌药圃',fx:{merit:1,mat:{herb:1}}}]},
  {id:'st_v55_7',cat:'herb',weight:2,title:'云母',t:'断崖云气缭绕处，一片云母石晶莹剔透，隐隐有灵光流转。',opts:[{txt:'💎 凿下一片',cls:'primary',fx:{mat:{jade:1}}},{txt:'📿 记下此地，留待有缘',fx:{insight:1,once:'st_v55_7'}}]},
  {id:'st_v55_8',cat:'rare',weight:2,title:'古碑残文',t:'乱草丛中一方古碑，碑文大半磨灭，仅存八字：「道不可见，见者非道」。',opts:[{txt:'🧘 盘坐悟碑',cls:'primary',fx:{insight:1,once:'st_v55_8'}},{txt:'📝 拓下残文',fx:{cult:60}}]},
  {id:'st_v55_9',cat:'rare',weight:2,title:'白猿献果',t:'一只白猿从树上跃下，将一枚朱果放在你脚边，叩首而去。',opts:[{txt:'🍒 收下朱果',cls:'primary',fx:{mat:{sherb:1},luck:1}},{txt:'🕊️ 还果，结个善缘',fx:{merit:3}}]},
  {id:'st_v55_10',cat:'epic',weight:1,title:'灵光垂幕',t:'一道灵光自云隙垂下，如幕如瀑，正落在你身前丈许。',opts:[{txt:'✨ 承接入体',cls:'primary',fx:{root:2}},{txt:'🧘 观想其意',fx:{insight:1,cult:150}}]},
  {id:'st_v55_11',cat:'danger',weight:2,title:'阴风过岗',t:'荒岗阴风骤起，风中有细碎的嚎哭声，一队黑影自雾中逼近。',opts:[{txt:'⚔️ 拔剑相迎',cls:'danger',fx:{fight:{name:'荒岗阴兵',atk:8,def:3,hp:42,elem:'dark',style:'guard'},winFx:{mat:{demonCore:1}}}},{txt:'🏃 贴地急遁',fx:{hp:-15}}]},
  {id:'st_v55_12',cat:'danger',weight:2,title:'流沙陷阱',t:'脚下的沙地忽然下陷，流沙裹着碎石向你涌来！',opts:[{txt:'🌀 借力翻滚',cls:'danger',fx:{fight:{name:'流沙漩涡',atk:6,def:1,hp:36,elem:'earth',style:'rapid'},winFx:{stones:80}}},{txt:'🧗 抓住岩缝攀出',fx:{hp:-12}}]},
  /* —— v57 扩充（10 条）—— */
  {id:'st_v57_1',cat:'calm',weight:2,title:'石桥驮影',t:'石桥下，一位老修士背着一个凡童淌水而过，凡童咯咯直笑。',opts:[{txt:'🫡 侧身让路，目送他们',cls:'primary',fx:{merit:2}},{txt:'🧘 静立桥头，看流水',fx:{cult:55}}]},
  {id:'st_v57_2',cat:'calm',weight:2,title:'晒书人',t:'秋阳下，有人把满架的书搬到院中晾晒，书页泛黄，字迹犹新。',opts:[{txt:'📖 借阅一卷',cls:'primary',fx:{insight:1,once:'st_v57_2'}},{txt:'🤝 帮忙搬书',fx:{merit:2}}]},
  {id:'st_v57_3',cat:'calm',weight:2,title:'井台晨话',t:'清晨井台边，村妇们一边洗衣一边说笑，惊起一滩白鹭。',opts:[{txt:'🕊️ 静静听一段家常',cls:'primary',fx:{mood:4}},{txt:'🚶 不扰清早，绕道而行',fx:{cult:45}}]},
  {id:'st_v57_4',cat:'herb',weight:2,title:'苔衣',t:'古井壁上的青苔肥厚如毡，药铺的人说这是「井泉苔」，能配安神方。',opts:[{txt:'🪣 刮下一片苔衣',cls:'primary',fx:{mat:{herb:2}}},{txt:'🙏 留它在井中养水',fx:{merit:1,mood:2}}]},
  {id:'st_v57_5',cat:'herb',weight:2,title:'野栗',t:'栗子树下落了一层刺球，裂开的栗子饱满油亮，捡起来能当干粮。',opts:[{txt:'🌰 捡一袋野栗',cls:'primary',fx:{mat:{herb:1},stones:25}},{txt:'🫙 分给路过的猎户',fx:{merit:2}}]},
  {id:'st_v57_6',cat:'rare',weight:2,title:'残局之约',t:'山亭石桌上摆着一局未完的残棋，旁边压着一张字条：「解此局者，可于亭柱第三孔取一物。」',opts:[{txt:'♟️ 落子解局',cls:'primary',fx:{mat:{jade:1}}},{txt:'📜 只取字条，不作局中人',fx:{insight:1,once:'st_v57_6'}}]},
  {id:'st_v57_7',cat:'rare',weight:2,title:'雾中渡口',t:'浓雾锁江，渡口只有一条小船。船夫戴着斗笠，声音沙哑：「过不过？雾里有雾里的走法。」',opts:[{txt:'⛵ 上船渡江',cls:'primary',fx:{cult:120,luck:1,once:'st_v57_7'}},{txt:'🧭 沿江寻桥',fx:{cult:80}}]},
  {id:'st_v57_8',cat:'epic',weight:1,title:'天外琴音',t:'云层之上，隐约传来一段琴音，如诉如慕，竟与灵溪谷的曲调同源。',opts:[{txt:'🎶 盘坐听音',cls:'primary',fx:{insight:1,cult:160}},{txt:'🌫️ 循音而望，记下方位',fx:{flag:{tianSound:1},insight:1,once:'st_v57_8'}}]},
  {id:'st_v57_9',cat:'danger',weight:2,title:'断桥残雪',t:'雪后断桥，桥板覆冰，一具樵夫的尸体横在桥头，似是被冻毙。',opts:[{txt:'🧣 掩埋遗骸，立碑为记',cls:'primary',fx:{merit:5}},{txt:'⚔️ 疑有凶手，循迹查探',fx:{fight:{name:'雪地妖物',atk:8,def:3,hp:44,elem:'ice',style:'burst'},winFx:{mat:{pelt:1}}}}]},
  {id:'st_v57_10',cat:'danger',weight:2,title:'地陷',t:'前方地面忽然塌陷，露出一个深不见底的地洞，洞中传来嗡嗡声。',opts:[{txt:'🕳️ 入洞一探',cls:'danger',fx:{fight:{name:'地穴妖蜂',atk:7,def:2,hp:38,elem:'wood',style:'rapid'},winFx:{mat:{sherb:1}}}},{txt:'🚶 绕开地洞',fx:{hp:-10}}]},
  /* —— v58 扩充（10 条）—— */
  {id:'st_v58_1',cat:'calm',weight:2,title:'檐下避雨',t:'骤雨，你于屋檐下避雨，檐角的铜铃被风吹得叮当响，像在数雨点。',opts:[{txt:'🔔 听铃听雨',cls:'primary',fx:{mood:4,cult:45}},{txt:'🧘 雨中观檐滴入洼',fx:{cult:60}}]},
  {id:'st_v58_2',cat:'calm',weight:2,title:'荷锄而归',t:'暮色里，老农荷锄而归，身后跟着一条黄狗，影子被夕阳拉得很长。',opts:[{txt:'🌾 目送他们进村',cls:'primary',fx:{merit:1,mood:3}},{txt:'🚶 错身而过',fx:{cult:40}}]},
  {id:'st_v58_3',cat:'herb',weight:2,title:'断肠草',t:'溪边长着一丛断肠草，叶面泛着幽幽紫光——剧毒，却也是一味猛药引子。',opts:[{txt:'🧤 以布裹手采下',cls:'primary',fx:{mat:{herb:2}}},{txt:'⚠️ 记下位置，提醒路人',fx:{merit:2}}]},
  {id:'st_v58_4',cat:'herb',weight:2,title:'蜂巢',t:'悬崖下挂着一个斗大的野蜂巢，蜜香隔着老远都能闻到。',opts:[{txt:'🍯 以烟熏取蜜',cls:'primary',fx:{mat:{herb:1},stones:35}},{txt:'🚶 不扰蜂家',fx:{merit:1}}]},
  {id:'st_v58_5',cat:'rare',weight:2,title:'水底剑影',t:'深潭底部，隐约有一道剑影静静悬浮，水光粼粼间似有灵性。',opts:[{txt:'🌊 入水一探',cls:'primary',fx:{mat:{iron:1},insight:1,once:'st_v58_5'}},{txt:'🧘 临渊观剑',fx:{cult:70}}]},
  {id:'st_v58_6',cat:'rare',weight:2,title:'药王遗炉',t:'藤蔓深处露出一尊锈迹斑斑的丹炉，炉腹上刻着「丹成之日，炉鸣九声」。',opts:[{txt:'🔥 引火试炉',cls:'primary',fx:{profExp:15,insight:1,once:'st_v58_6'}},{txt:'📜 拓下炉文',fx:{cult:60}}]},
  {id:'st_v58_7',cat:'epic',weight:1,title:'月宫桂影',t:'中秋月明，天边竟浮起一片桂树的虚影，桂香隔着云层都能闻到。',opts:[{txt:'🌕 接一片桂叶',cls:'primary',fx:{luck:1,mood:6}},{txt:'🧘 沐月静修',fx:{cult:150,insight:1,once:'st_v58_7'}}]},
  {id:'st_v58_8',cat:'danger',weight:2,title:'荒村夜哭',t:'一座荒村，入夜后隐隐传来哭声。村口井边坐着个披发的白衣女子。',opts:[{txt:'🕯️ 秉烛上前探问',cls:'primary',fx:{merit:4}},{txt:'⚔️ 疑为邪祟，拔剑相向',fx:{fight:{name:'井边怨灵',atk:8,def:3,hp:40,elem:'dark',style:'guard'},winFx:{merit:3}}}]},
  {id:'st_v58_9',cat:'danger',weight:2,title:'山火',t:'远处山火蔓延，浓烟滚滚，风向却正朝着一座村庄吹去。',opts:[{txt:'🌊 御水灭火，护村而行',cls:'primary',fx:{merit:6,stones:40}},{txt:'🚶 绕路而行',fx:{hp:-10,karma:3}}]},
  {id:'st_v58_10',cat:'danger',weight:2,title:'断崖裂隙',t:'断崖上裂开一道新缝，缝隙深处传来低沉的呼吸声，仿佛有什么东西在岩层下翻身。',opts:[{txt:'⚔️ 探入裂隙',cls:'danger',fx:{fight:{name:'岩下蛰物',atk:9,def:4,hp:48,elem:'earth',style:'burst'},winFx:{mat:{jade:1}}}},{txt:'🚶 记下方位，从长计议',fx:{insight:1,once:'st_v58_10'}}]},
  /* —— v59 扩充（10 条）—— */
  {id:'st_v59_1',cat:'calm',weight:2,title:'晒盐',t:'海边盐田如镜，晒盐人赤脚走在田埂上，身后跟着一串深深浅浅的脚印。',opts:[{txt:'👣 陪他走一段田埂',cls:'primary',fx:{mood:4}},{txt:'🧂 帮忙收一筐盐',fx:{merit:2,stones:20}}]},
  {id:'st_v59_2',cat:'calm',weight:2,title:'老井',t:'村里老井的水格外甜，打水的人说这井从没枯过——井底有一块刻着「谢」字的青石。',opts:[{txt:'💧 打一瓢尝尝',cls:'primary',fx:{mood:3,cult:40}},{txt:'🪨 看看那块青石',fx:{merit:1,insight:1,once:'st_v59_2'}}]},
  {id:'st_v59_3',cat:'herb',weight:2,title:'岩蜜',t:'崖壁缝隙里渗出一线金黄蜜浆，甜香混着山岩的气息。',opts:[{txt:'🍯 以竹筒接取',cls:'primary',fx:{mat:{sherb:1}}},{txt:'🐝 循蜜寻蜂巢',fx:{mat:{herb:2}}}]},
  {id:'st_v59_4',cat:'herb',weight:2,title:'灵草籽',t:'风过处，几粒萤火般的草籽飘落掌心，认得是灵草的种子。',opts:[{txt:'🌱 收下草籽，回洞府种下',cls:'primary',fx:{mat:{sherb:1},mood:2}},{txt:'🌬️ 任其随风去',fx:{merit:1}}]},
  {id:'st_v59_5',cat:'rare',weight:2,title:'水月镜',t:'湖心倒映着一轮完整的月亮，水面却无一丝风。传言此湖每逢月圆，可见「前尘」。',opts:[{txt:'🌕 静观水月',cls:'primary',fx:{insight:1,luck:1,once:'st_v59_5'}},{txt:'💧 掬一捧湖水',fx:{cult:80}}]},
  {id:'st_v59_6',cat:'rare',weight:2,title:'古剑鞘',t:'枯藤下露出一段剑鞘，鞘上花纹繁复，非当世之物。',opts:[{txt:'🗡️ 拔出试锋',cls:'primary',fx:{mat:{iron:1},insight:1,once:'st_v59_6'}},{txt:'🙏 埋回原处，留待有缘',fx:{merit:2}}]},
  {id:'st_v59_7',cat:'epic',weight:1,title:'天外飞石',t:'一颗流星划破夜空，坠在百里外的山坳。天亮前，你或许能赶到。',opts:[{txt:'🧭 连夜赶去',cls:'primary',fx:{mat:{jade:1},luck:1,once:'st_v59_7'}},{txt:'🌠 就地观星，不争此物',fx:{insight:1,cult:100}}]},
  {id:'st_v59_8',cat:'danger',weight:2,title:'雾中灯',t:'浓雾里亮着一盏惨白的灯，灯下立着一道模糊人影，正朝你招手。',opts:[{txt:'🕯️ 提灯上前探看',cls:'primary',fx:{merit:4}},{txt:'⚔️ 疑为引路邪祟，拍灯示警',fx:{fight:{name:'雾中提灯人',atk:8,def:3,hp:42,elem:'dark',style:'guard'},winFx:{merit:3,stones:50}}}]},
  {id:'st_v59_9',cat:'danger',weight:2,title:'夜半敲门',t:'夜宿破庙，三更时分，门外响起不紧不慢的敲门声——可这荒山，哪来的过路人？',opts:[{txt:'🧘 装作未闻，守住心神',cls:'primary',fx:{insight:1,once:'st_v59_9'}},{txt:'🚪 开门一探',fx:{fight:{name:'叩门夜影',atk:9,def:4,hp:46,elem:'dark',style:'burst'},winFx:{stones:60}}}]},
  {id:'st_v59_10',cat:'danger',weight:2,title:'毒瘴谷',t:'谷口立着褪色的木牌：「毒瘴入骨，勿入」。谷中却隐约有灵光闪烁。',opts:[{txt:'🌿 闭息入谷一探',cls:'danger',fx:{fight:{name:'瘴谷毒蟾',atk:8,def:3,hp:40,elem:'wood',style:'poison'},winFx:{mat:{sherb:1}}}},{txt:'🚶 木牌既立，转身便走',fx:{hp:-8}}]},
  /* —— v60 宗门/道侣向扩充（8 条）—— */
  {id:'st_v60_1',cat:'calm',weight:2,title:'宗门夜巡',t:'夜巡宗门，檐角的铜铃被风摇响。巡夜的师兄递来一壶热茶：「值守苦，喝口热的。」',opts:[{txt:'🍵 接过热茶，聊几句',cls:'primary',fx:{mood:4}},{txt:'🤝 谢过，替他多巡半圈',fx:{merit:2}}]},
  {id:'st_v60_2',cat:'calm',weight:2,title:'藏经阁守书人',t:'藏经阁的守书老人正逐册晒书，忽然抬头看你：「书晒久了会脆，人心也一样。」',opts:[{txt:'📖 陪他晒一日书',cls:'primary',fx:{insight:1,once:'st_v60_2'}},{txt:'🫡 鞠一躬，轻声告退',fx:{mood:3,cult:40}}]},
  {id:'st_v60_3',cat:'rare',weight:2,title:'宗门论剑',t:'宗门演武场上，两位师兄正以竹代剑过招。围观人群里，有人低声议论着「天衍」二字。',opts:[{txt:'🗡️ 下场试剑，以武会友',cls:'primary',fx:{cult:120,insight:1,once:'st_v60_3'}},{txt:'👂 竖起耳朵听那议论',fx:{flag:{sectRumor:1},insight:1}}]},
  {id:'st_v60_4',cat:'rare',weight:2,title:'掌门传功',t:'掌门闭关前唤你到静室，将一枚温润的木牌放在你掌心：「宗门之重，不在楼阁，在人。此牌，认得你的剑。」',opts:[{txt:'🙏 双手接过木牌',cls:'primary',fx:{flag:{sectToken:1},luck:1}},{txt:'🤝 谢掌门，言明愿以剑护宗',fx:{merit:3,flag:{sectToken:2}}}]},
  {id:'st_v60_5',cat:'calm',weight:2,title:'道侣煮茶',t:'洞府檐下，道侣正守着茶炉，见你回来，眉眼弯弯：「火候刚好，来尝。」',opts:[{txt:'🍵 接过茶，并肩坐下',cls:'primary',fx:{mood:6,favor:3}},{txt:'🙈 偷捏一下她的袖子',fx:{mood:4,favor:5}}]},
  {id:'st_v60_6',cat:'calm',weight:2,title:'道侣观星',t:'夜风微凉，道侣靠在廊柱边看星，忽然指着天际：「那颗星，三百年前也这么亮。」',opts:[{txt:'✨ 陪她看一整夜',cls:'primary',fx:{mood:6,insight:1,once:'st_v60_6'}},{txt:'🌠 讲一段星象传说',fx:{favor:5}}]},
  {id:'st_v60_7',cat:'rare',weight:2,title:'道侣手书',t:'行囊里多了一封叠得整整齐齐的信，字迹是道侣的：「出门在外，平安为要。勿念，盼归。」',opts:[{txt:'💌 贴身收好，回信一封',cls:'primary',fx:{favor:4,mood:4}},{txt:'🕊️ 折成纸鹤寄回',fx:{favor:6,insight:1,once:'st_v60_7'}}]},
  {id:'st_v60_8',cat:'rare',weight:2,title:'道侣剑穗',t:'临别前，道侣将一枚亲手编的红绳剑穗系上你的剑柄：「剑有鞘，我有你。」',opts:[{txt:'🗡️ 系好剑穗，郑重应诺',cls:'primary',fx:{favor:6,luck:1,once:'st_v60_8'}},{txt:'🙏 谢过，将剑穗收进怀里',fx:{favor:8,merit:1}}]},
];
/* v48 赛季主题：风 / 雷 / 火 / 水（每 3 游戏年轮换） */
const THEMES=[
  {id:'feng',n:'风季',i:'🌪️',desc:'风起云涌，机缘随风而至'},
  {id:'lei',n:'雷季',i:'⚡',desc:'雷雨交加，淬体之机频现'},
  {id:'huo',n:'火季',i:'🔥',desc:'赤地千里，灵火与凶险并生'},
  {id:'shui',n:'水季',i:'🌊',desc:'水泽丰盈，灵泉与龙影出没'},
];
function themeOf(){
  const y=S?Math.floor(S.years||0):0;
  return THEMES[Math.floor(y/3)%THEMES.length];
}
function themeLabel(){const t=themeOf();return t?t.i+' '+t.n+'（'+t.desc+'）':''}
const THEME_EVENTS=[
  {id:'th_feng_1',theme:'feng',weight:2,title:'御风而行',t:'风季的狂风卷起漫天落叶，你逆风而行，衣袂猎猎。',opts:[{txt:'🌪️ 御风加速赶路',cls:'primary',fx:{insight:1,once:'th_feng_1'}},{txt:'🧘 就着风声打坐',fx:{cult:90}}]},
  {id:'th_feng_2',theme:'feng',weight:2,title:'风眼灵果',t:'飓风过境后，风眼处竟长出一株通体莹白的灵果。',opts:[{txt:'🍐 摘取风灵果',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🌬️ 任它随风而逝',fx:{merit:2}}]},
  {id:'th_feng_3',theme:'feng',weight:1,title:'风刃',t:'狂风如刃，切过山石，石面上留下蛛网般的细纹。',opts:[{txt:'🗡️ 以风刃磨砺剑意',cls:'primary',fx:{insight:1,once:'th_feng_3'}},{txt:'🚶 避开风口',fx:{}}]},
  {id:'th_feng_4',theme:'feng',weight:1,title:'纸鸢',t:'一只纸鸢被风送来，线上系着一封书信，落款是一朵梅花印。',opts:[{txt:'📜 展信一读',cls:'primary',fx:{stones:120}},{txt:'🪁 放飞纸鸢，让它继续飞',fx:{merit:2}}]},
  {id:'th_lei_1',theme:'lei',weight:2,title:'雷池淬体',t:'雷季的云层压得极低，一道落雷劈在不远处，雷火未熄。',opts:[{txt:'⚡ 引雷淬体',cls:'danger',fx:{fight:{name:'落雷',atk:9,def:0,hp:40,elem:'thunder',style:'burst'},winFx:{root:2}}},{txt:'🏃 远离雷区',fx:{}}]},
  {id:'th_lei_2',theme:'lei',weight:2,title:'雷击木',t:'被雷劈过的古木焦黑如炭，芯中却透出一点碧绿生机。',opts:[{txt:'🪵 剖开雷击木',cls:'primary',fx:{mat:{jade:1,iron:1}}},{txt:'🌱 浇一杯水，护其生机',fx:{merit:2}}]},
  {id:'th_lei_3',theme:'lei',weight:1,title:'雷音',t:'雷声滚滚，你却于雷音中听出一丝韵律，仿佛天地在诵经。',opts:[{txt:'🧘 循雷音入定',cls:'primary',fx:{insight:1,once:'th_lei_3'}},{txt:'🎵 以雷音为节拍练剑',fx:{cult:120}}]},
  {id:'th_lei_4',theme:'lei',weight:1,title:'避雷符',t:'雷电交加中，一位老修士赠你一道避雷符：「雷季行山，带着它安心些。」',opts:[{txt:'🙏 收下符箓',cls:'primary',fx:{item:{name:'避雷符',type:'consumable',quality:2,count:1,desc:'老修士所赠，雷季护身。',use:'thunder',sell:260}}},{txt:'🤝 谢过，婉拒',fx:{merit:2}}]},
  {id:'th_huo_1',theme:'huo',weight:2,title:'赤地灵火',t:'火季的荒野焦黄龟裂，地缝中却窜出一簇幽蓝灵火，灼而不燃。',opts:[{txt:'🔥 引一缕灵火入体',cls:'danger',fx:{fight:{name:'幽蓝灵火',atk:8,def:0,hp:38,elem:'fire',style:'burst'},winFx:{root:2}}},{txt:'🫙 以玉瓶收一缕',fx:{mat:{jade:1}}}]},
  {id:'th_huo_2',theme:'huo',weight:2,title:'熔岩灵果',t:'火山口旁生着一株赤红灵果，果皮如熔岩流动，热浪灼人。',opts:[{txt:'🍒 摘取熔岩果',cls:'primary',fx:{mat:{sherb:2},cult:60}},{txt:'⛰️ 敬火山一礼，转身而去',fx:{merit:2}}]},
  {id:'th_huo_3',theme:'huo',weight:1,title:'锻炉',t:'火季的荒野上，一尊上古锻炉兀自燃烧，炉火千年不熄。',opts:[{txt:'🔨 借炉火淬炼兵器',cls:'primary',fx:{mat:{iron:2}}},{txt:'⚗️ 借炉火炼丹',fx:{mat:{herb:2}}}]},
  {id:'th_huo_4',theme:'huo',weight:1,title:'凤凰虚影',t:'一道火光掠过天际，隐约是凤凰的轮廓，尾羽拖曳如赤虹。',opts:[{txt:'🔥 朝火光方向拜了三拜',cls:'primary',fx:{luck:1,once:'th_huo_4'}},{txt:'🚶 目送它消失在天际',fx:{merit:2}}]},
  {id:'th_shui_1',theme:'shui',weight:2,title:'灵泉涌出',t:'水季的大雨过后，山脚涌出一眼新泉，泉水清冽带甘。',opts:[{txt:'💧 掬饮泉水',cls:'primary',fx:{mat:{sherb:1},cult:80}},{txt:'🫙 盛满水囊带走',fx:{item:{name:'灵泉水',type:'consumable',quality:2,count:1,desc:'新涌灵泉所盛，服之修为小进。',use:'essence',sell:300}}}]},
  {id:'th_shui_2',theme:'shui',weight:2,title:'湖中龙影',t:'水泽深处，一道青影蜿蜒而过，鳞片在月光下泛着银光。',opts:[{txt:'🌊 循影而望',cls:'primary',fx:{insight:1,once:'th_shui_2'}},{txt:'🚶 不惊其踪，悄然离去',fx:{merit:1}}]},
  {id:'th_shui_3',theme:'shui',weight:1,title:'水月洞天',t:'湖心倒映着一座亭台，与现实相反——那是传说中的水月洞天入口。',opts:[{txt:'🌕 纵身跃入湖心月影',cls:'primary',fx:{fight:{name:'水月幻境',atk:8,def:3,hp:42,elem:'water',style:'guard'},winFx:{stones:200}}},{txt:'🌊 谨记方位，改日再来',fx:{}}]},
  {id:'th_shui_4',theme:'shui',weight:1,title:'河伯之礼',t:'水面上漂来一只木匣，随波逐流，恰好停在你的脚边。',opts:[{txt:'📦 捞起木匣',cls:'primary',fx:{mat:{jade:1},stones:100}},{txt:'🙏 合掌一礼，任它漂走',fx:{merit:2}}]},
];
function rollThemeEvent(){
  const th=themeOf();
  if(!th)return null;
  return weightedPick(THEME_EVENTS.filter(e=>e.theme===th.id))||null;
}
function storyEventPool(cat,realm){
  realm=realm===undefined?(S?S.realm:0):realm;
  return STORY_EVENTS.filter(e=>e.cat===cat&&(!e.minRealm||realm>=e.minRealm));
}
function rollStoryEvent(cat){
  const pool=storyEventPool(cat);
  if(!pool.length)return null;
  return weightedPick(pool);
}
/* 事件执行：标题 + 正文 + 抉择（fx 复用区域记忆语义，含 fight / once） */
function runStoryEvent(ev){
  if(!S||!ev)return false;
  S.flag.storyEvents=S.flag.storyEvents||{};
  S.flag.storyEvents[ev.id]=(S.flag.storyEvents[ev.id]||0)+1;
  scene(ev.title);
  log('<p>'+esc(ev.t)+'</p>');
  logChoices((ev.opts||[]).map(o=>({
    txt:o.txt,cls:o.cls||'',
    fn:()=>{
      const fx=_onceFx(o.fx||{});
      const out=applyEventEffects(fx);
      if(fx.fight){
        const e=Object.assign({},fx.fight);
        e.atk=(e.atk||0)+Math.floor(rl()/3);
        e.def=(e.def||0)+Math.floor(rl()/4);
        e.hp=(e.hp||0)+rl()*6;
        startCombat(e,res=>{
          if(res.win){
            const w=applyEventEffects(fx.winFx||{stones:30});
            if(w.length)log('<p class="loot">战利：'+w.join(' · ')+'。</p>');
          }else{
            log('<p class="danger">你败下阵来，负伤退走。</p>');
          }
          if(typeof afterEvent==='function')afterEvent();
          renderAll();
        },true);
        return;
      }
      if(out.length)log('<p class="loot">'+out.join(' · ')+'。</p>');
      if(fx.afterFx){const a=applyEventEffects(fx.afterFx);if(a.length)log('<p class="good">'+a.join(' · ')+'。</p>')}
      if(typeof afterEvent==='function')afterEvent();
      passTime(1);renderAll();
    }
  })));
}
function afterEvent(){}
