/* ======================================================
  仙途 · 内容批次 B11 玩法向扩产（v98）
  只 push。id 前缀 b11_
  社交 +20 / 故事 +30 / 道侣 +20 / 宗门 +20 = 90
====================================================== */
'use strict';
(function(){
  /* —— 社交 +20 —— */
  if(typeof DATA!=='undefined'&&Array.isArray(DATA.events)){
    DATA.events.push(
      {id:'b11_visit_01',n:'渔舟唱晚',type:'visit',t:'暮色江上，{npc} 摇着一叶渔舟靠岸，船头挂着一盏昏黄的灯。',opts:[{txt:'⛵ 登舟同渡一程',cls:'primary'},{txt:'🙏 岸边目送'}],npc:'云游医修'},
      {id:'b11_visit_02',n:'晒书',type:'visit',t:'{npc} 把藏书一册册摊在日头下晒，见你路过，招手：「来，挑一本看看？」',opts:[{txt:'📖 挑一卷就着日光读',cls:'primary'},{txt:'🙏 谢过，继续赶路'}],npc:'书阁执事'},
      {id:'b11_visit_03',n:'山涧洗剑',type:'visit',t:'{npc} 蹲在山涧边，仔仔细细擦拭剑锋，剑光映着水色。',opts:[{txt:'🗡️ 借水磨剑，闲话几句',cls:'primary'},{txt:'🚶 不打扰'}],npc:'剑阁女侠'},
      {id:'b11_visit_04',n:'夜宿破庙',type:'visit',t:'夜宿破庙，你与 {npc} 各占一角。{g} 捡了干柴生起火，火光映着两人影子。',opts:[{txt:'🔥 同坐烤火，聊到深夜',cls:'primary'},{txt:'🧘 各自安歇'}],npc:'散修剑客'},
      {id:'b11_visit_05',n:'采蜜',type:'visit',t:'{npc} 正小心翼翼地割取野蜂巢里的蜜，手背上被蛰了一个包。',opts:[{txt:'🍯 帮忙打下手',cls:'primary'},{txt:'😄 笑道：「手都肿了」'}],npc:'妖族狐女'},
      {id:'b11_visit_06',n:'山道背柴',type:'visit',t:'山道上，{npc} 背着一大捆柴，见你便放下歇脚。',opts:[{txt:'🤝 帮忙分担一程',cls:'primary'},{txt:'🙏 点头致意'}],npc:'老乞丐'},
      {id:'b11_chat_01',n:'论茶',type:'chat',t:'{npc} 摆弄着茶具：「同一片茶园，晨露采与午时采，味道大不相同。」',opts:[{txt:'🍵 请教其中门道',cls:'primary'},{txt:'☕ 讨一杯尝尝'}],npc:'酒馆掌柜'},
      {id:'b11_chat_02',n:'论剑势',type:'chat',t:'{npc} 以指代剑比划：「剑势不在快，在于「势」未起时，对手已输了三分。」',opts:[{txt:'🗡️ 若有所思，请教细节',cls:'primary'},{txt:'👏 赞叹不已'}],npc:'散修剑客'},
      {id:'b11_chat_03',n:'灵草传说',type:'chat',t:'{npc} 神秘兮兮：「听说南山深处有一种草，夜里会发光，能医百病。」',opts:[{txt:'🌿 追问具体位置',cls:'primary'},{txt:'🤨 传言未必可信'}],npc:'采药女'},
      {id:'b11_chat_04',n:'符道',type:'chat',t:'{npc} 画着符箓：「画符讲究一笔呵成，心念稍杂，符便废了。」',opts:[{txt:'🖌️ 请教运笔心法',cls:'primary'},{txt:'🧘 若有所思'}],npc:'书阁执事'},
      {id:'b11_chat_05',n:'月下论道',type:'chat',t:'月下对坐，{npc} 忽然问：「你说，月亮上可有人家？」',opts:[{txt:'🌙 认真想了想：「许是有的」',cls:'primary'},{txt:'😄 笑道：「上去看看便知」'}],npc:'神秘道人'},
      {id:'b11_chat_06',n:'江湖夜雨',type:'chat',t:'夜雨敲窗，{npc} 温着酒：「江湖夜雨十年灯——这十年，你变了许多。」',opts:[{txt:'🍶 举杯：「你也一样」',cls:'primary'},{txt:'🧘 默然，各饮各的'}],npc:'剑阁女侠'},
      {id:'b11_chat_07',n:'丹火',type:'chat',t:'{npc} 盯着丹炉火苗：「火候这东西，差一分是药，差十分是毒。」',opts:[{txt:'⚗️ 深有同感',cls:'primary'},{txt:'📖 请教控火诀窍'}],npc:'丹房女修'},
      {id:'b11_invite_01',n:'江边垂钓',type:'invite',t:'{npc} 提着钓竿：「江里的鱼肥了，一起去钓两尾，晚上炖汤？」',opts:[{txt:'🎣 欣然同往',cls:'primary'},{txt:'🙏 改日再约'}],npc:'云游医修'},
      {id:'b11_invite_02',n:'品新茗',type:'invite',t:'{npc} 晃着一罐新茶：「刚焙好的春茶，头一道最香——来尝尝？」',opts:[{txt:'🍵 登门品茶',cls:'primary'},{txt:'🙏 谢过，改日'}],npc:'酒馆掌柜'},
      {id:'b11_invite_03',n:'夜观星',type:'invite',t:'{npc} 指着天际：「今夜有双星相会，百年难遇。同去山巅看看？」',opts:[{txt:'✨ 同登山巅',cls:'primary'},{txt:'🌙 谢过，各自赏月'}],npc:'古琴乐师'},
      {id:'b11_invite_04',n:'学画符',type:'invite',t:'{npc} 铺开符纸：「教你画一道平安符？保证比坊市卖的强。」',opts:[{txt:'🖌️ 跟着学',cls:'primary'},{txt:'🙏 手拙，怕浪费符纸'}],npc:'书阁执事'},
      {id:'b11_invite_05',n:'进山采药',type:'invite',t:'{npc} 挎着药篓：「后山冒了新笋，还有几味早春药——去不去？」',opts:[{txt:'🌿 结伴进山',cls:'primary'},{txt:'📜 记下，来日再往'}],npc:'采药女'},
      {id:'b11_invite_06',n:'夜话家常',type:'invite',t:'{npc} 提着一壶酒上门：「长夜漫漫，来聊聊天，说说你这十年的故事。」',opts:[{txt:'🍶 温酒夜谈',cls:'primary'},{txt:'🙏 改日再叙'}],npc:'老乞丐'},
      {id:'b11_invite_07',n:'切磋',type:'invite',t:'{npc} 拔剑相邀：「许久未与你过招了，来，让我看看你长进没有。」',opts:[{txt:'🗡️ 拔剑应战',cls:'primary'},{txt:'🙅 近日不便，改日'}],npc:'剑阁女侠'},
    );
  }
  /* —— 故事 +30（五类各 6） —— */
  if(typeof STORY_EVENTS!=='undefined'&&Array.isArray(STORY_EVENTS)){
    STORY_EVENTS.push(
      {id:'b11_calm_1',cat:'calm',weight:2,title:'烟雨渡口',t:'烟雨蒙蒙，渡口停着一条乌篷船。船家披着蓑衣，慢悠悠地煮着茶。',opts:[{txt:'🛶 上船躲雨',cls:'primary',fx:{mood:4,merit:1}},{txt:'🚶 雨中赶路',fx:{cult:40}}]},
      {id:'b11_calm_2',cat:'calm',weight:2,title:'早市',t:'天刚亮，早市已热闹起来。卖豆腐的、卖菜的、卖包子的，此起彼伏。',opts:[{txt:'🥟 买几个热包子',cls:'primary',fx:{stones:-5,mood:4}},{txt:'👀 看了一会儿热闹',fx:{mood:3}}]},
      {id:'b11_calm_3',cat:'calm',weight:2,title:'老槐树',t:'村口老槐树下，几个孩子正仰头望着树上的鸟窝。',opts:[{txt:'🐦 帮他们把雏鸟放回窝里',cls:'primary',fx:{merit:2,mood:3}},{txt:'🌳 靠着树歇了会儿脚',fx:{mood:3,cult:30}}]},
      {id:'b11_calm_4',cat:'calm',weight:2,title:'戏台',t:'镇上搭了戏台，锣鼓喧天。台上演着才子佳人，台下嗑着瓜子。',opts:[{txt:'🎭 看了一出戏',cls:'primary',fx:{mood:5}},{txt:'🚶 听了两耳朵便走',fx:{cult:30}}]},
      {id:'b11_calm_5',cat:'calm',weight:2,title:'秋千',t:'溪边的秋千架吱呀作响，一个孩子荡得老高，笑声清脆。',opts:[{txt:'🎠 看着孩子荡了会儿',cls:'primary',fx:{mood:4}},{txt:'🧘 溪边坐下，听水声',fx:{cult:50}}]},
      {id:'b11_calm_6',cat:'calm',weight:2,title:'雪后初晴',t:'雪后初晴，屋檐下的冰凌在日光里闪着细碎的光，一滴一滴融着。',opts:[{txt:'❄️ 摘一根冰凌把玩',cls:'primary',fx:{mood:3}},{txt:'🧘 看冰雪消融',fx:{insight:1,once:'b11_calm_6'}}]},
      {id:'b11_herb_1',cat:'herb',weight:2,title:'金银花',t:'田埂边金银花开得正盛，黄白相间，清香扑鼻，是清热解毒的好药。',opts:[{txt:'🌸 采一把晾干',cls:'primary',fx:{mat:{herb:2}}},{txt:'🌿 摘几朵泡茶',fx:{mood:3}}]},
      {id:'b11_herb_2',cat:'herb',weight:2,title:'野山参',t:'林间腐叶下露出一截人参须——仔细一看，竟是一株野山参。',opts:[{txt:'⛏️ 小心掘取',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🌱 系上红绳，留它再长',fx:{merit:2,insight:1,once:'b11_herb_2'}}]},
      {id:'b11_herb_3',cat:'herb',weight:2,title:'药香引蜂',t:'你采的药草引来一群蜜蜂，嗡嗡绕着你转。',opts:[{txt:'🐝 循蜂找到蜜源',cls:'primary',fx:{mat:{herb:1},stones:30}},{txt:'🚶 放下药草，任蜂散去',fx:{merit:1}}]},
      {id:'b11_herb_4',cat:'herb',weight:2,title:'溪边菖蒲',t:'溪边菖蒲丛生，叶如长剑。端午将至，村民正采来挂门。',opts:[{txt:'🌿 采一把相赠',cls:'primary',fx:{merit:1,mat:{herb:1}}},{txt:'🌊 只取一株，顺流放下',fx:{mood:3}}]},
      {id:'b11_herb_5',cat:'herb',weight:2,title:'山莓',t:'山坡上一片山莓红得发紫，酸甜的香气在风里飘。',opts:[{txt:'🍓 摘一捧尝尝',cls:'primary',fx:{mood:4,mat:{herb:1}}},{txt:'🌱 采几株移回洞府',fx:{mat:{herb:2}}}]},
      {id:'b11_herb_6',cat:'herb',weight:2,title:'药碾',t:'路旁石屋前架着一具药碾，碾槽里还残留着药渣——是采药人歇脚的地方。',opts:[{txt:'🔍 细看药渣辨药',cls:'primary',fx:{insight:1,once:'b11_herb_6'}},{txt:'🌿 借碾碾药',fx:{mat:{herb:2}}}]},
      {id:'b11_rare_1',cat:'rare',weight:2,title:'古泉印',t:'泉边石壁上有一枚掌印，深达寸许，边缘却被磨得圆润——不知多少年岁了。',opts:[{txt:'🖐️ 覆手其上，感受余韵',cls:'primary',fx:{insight:1,cult:80,once:'b11_rare_1'}},{txt:'💧 掬泉水洗净双手',fx:{mood:3}}]},
      {id:'b11_rare_2',cat:'rare',weight:2,title:'锦囊',t:'树梢挂着一只褪色的锦囊，针脚细密，绣着半朵莲花。',opts:[{txt:'🎁 取锦囊查看',cls:'primary',fx:{stones:90}},{txt:'🙏 替原主系好，原样挂回',fx:{merit:2}}]},
      {id:'b11_rare_3',cat:'rare',weight:2,title:'灵龟',t:'潭边趴着一只磨盘大的灵龟，甲壳上生着青苔，见你不躲不避。',opts:[{txt:'🐢 与它对坐片刻',cls:'primary',fx:{insight:1,once:'b11_rare_3'}},{txt:'🪷 取一片龟甲（不可取，只取苔）',fx:{merit:1,cult:50}}]},
      {id:'b11_rare_4',cat:'rare',weight:2,title:'青铜灯',t:'岩缝里卡着一盏青铜灯，灯油早已干涸，灯身却擦得锃亮。',opts:[{txt:'🕯️ 添上灯油点燃',cls:'primary',fx:{luck:1,once:'b11_rare_4'}},{txt:'📜 记下方位，转身离开',fx:{}}]},
      {id:'b11_rare_5',cat:'rare',weight:2,title:'剑痕石',t:'一块巨石从中裂开，断面光滑如镜——是一剑之威。',opts:[{txt:'🗡️ 以指临摹剑痕',cls:'primary',fx:{cult:120,insight:1,once:'b11_rare_5'}},{txt:'🪨 取一块断面碎石',fx:{mat:{iron:1}}}]},
      {id:'b11_rare_6',cat:'rare',weight:2,title:'灵泉鱼',t:'灵泉里游着几尾通体透明的小鱼，鳞片在光下泛着彩。',opts:[{txt:'🐟 以灵力引一尾上来',cls:'primary',fx:{stones:60,luck:1,once:'b11_rare_6'}},{txt:'🌊 任它们在泉中游',fx:{merit:1}}]},
      {id:'b11_epic_1',cat:'epic',weight:1,title:'月华洗髓',t:'月圆之夜，你于山顶沐浴月华，体内杂质随呼吸缓缓排出。',opts:[{txt:'🌙 彻夜吸纳月华',cls:'primary',fx:{root:2,cult:200}},{txt:'🧘 静坐观月',fx:{insight:1,cult:150}}]},
      {id:'b11_epic_2',cat:'epic',weight:1,title:'道音入梦',t:'你于梦中听见一位仙人讲道，字字如钟，醒来犹有余音。',opts:[{txt:'📖 梦中记下只言片语',cls:'primary',fx:{insight:2,once:'b11_epic_2'}},{txt:'🧘 循余音入定',fx:{cult:500}}]},
      {id:'b11_epic_3',cat:'epic',weight:1,title:'灵根如泉',t:'丹田深处，灵根忽然如泉眼般涌出灵气，将经脉洗刷一新。',opts:[{txt:'✨ 顺其自然',cls:'primary',fx:{root:2,cult:250}},{txt:'💧 引导灵气淬体',fx:{root:1,cult:350}}]},
      {id:'b11_epic_4',cat:'epic',weight:1,title:'天降宝匣',t:'一朵祥云落在面前，云中托着一只玉匣，匣上封着灵符。',opts:[{txt:'📦 开启玉匣',cls:'primary',fx:{mat:{jade:2},stones:200}},{txt:'🙏 合匣还礼，任云散去',fx:{merit:3,luck:1,once:'b11_epic_4'}}]},
      {id:'b11_epic_5',cat:'epic',weight:1,title:'悟道茶香',t:'不知何处飘来一缕茶香，你循香入定，竟于茶香中悟得一段真意。',opts:[{txt:'🍵 细品茶香',cls:'primary',fx:{insight:2,once:'b11_epic_5'}},{txt:'🧘 借香入定',fx:{cult:400}}]},
      {id:'b11_epic_6',cat:'epic',weight:1,title:'前辈馈赠',t:'路遇一位鹤发童颜的老者，观你良久，忽然笑道：「有缘。」抛来一只储物袋。',opts:[{txt:'🎁 接住储物袋',cls:'primary',fx:{stones:300,mat:{sherb:1}}},{txt:'🙏 追上去推辞',fx:{merit:2,insight:1,once:'b11_epic_6'}}]},
      {id:'b11_danger_1',cat:'danger',weight:2,title:'断桥',t:'暴雨冲断了木桥，桥下激流翻滚，对岸传来求救声。',opts:[{txt:'💨 御气过河救人',cls:'danger',fx:{fight:{name:'激流',atk:7,def:1,hp:36,elem:'water',style:'rapid'},winFx:{merit:3}}},{txt:'🪢 寻下游浅滩绕行',fx:{hp:-10}}]},
      {id:'b11_danger_2',cat:'danger',weight:2,title:'蜂群',t:'你无意间捅了马蜂窝，嗡鸣震天，黑压压一片扑来。',opts:[{txt:'💨 全力奔逃',cls:'danger',fx:{fight:{name:'马蜂群',atk:6,def:1,hp:30,elem:'wood',style:'rapid'},winFx:{mat:{herb:1}}}},{txt:'🫥 卧倒屏息装死',fx:{hp:-12}}]},
      {id:'b11_danger_3',cat:'danger',weight:2,title:'夜枭袭',t:'夜里赶路，一只夜枭无声扑下，利爪直取你的天灵。',opts:[{txt:'🗡️ 拔剑格挡',cls:'danger',fx:{fight:{name:'夜枭',atk:7,def:2,hp:32,elem:'dark',style:'burst'},winFx:{mat:{pelt:1}}}},{txt:'🛡️ 缩身避让',fx:{hp:-8}}]},
      {id:'b11_danger_4',cat:'danger',weight:2,title:'瘴溪',t:'溪水泛着浑浊的绿光，岸边白骨森森——是瘴溪。',opts:[{txt:'😤 闭息涉水强渡',cls:'danger',fx:{fight:{name:'瘴溪之气',atk:6,def:1,hp:32,elem:'wood',style:'poison'},winFx:{mat:{herb:2}}}},{txt:'↩️ 沿溪上游绕行',fx:{hp:-10}}]},
      {id:'b11_danger_5',cat:'danger',weight:2,title:'落石坡',t:'碎石坡上，头顶传来滚石声——山体正在松动。',opts:[{txt:'🏃 贴地疾行',cls:'danger',fx:{fight:{name:'滚石',atk:7,def:1,hp:34,elem:'earth',style:'rapid'},winFx:{mat:{iron:1}}}},{txt:'🪨 躲在巨岩后',fx:{hp:-12}}]},
      {id:'b11_danger_6',cat:'danger',weight:2,title:'劫道',t:'两名蒙面修士拦住去路，一左一右包抄而来。',opts:[{txt:'⚔️ 先发制人',cls:'danger',fx:{fight:{name:'蒙面劫修',atk:8,def:3,hp:44,elem:'dark',style:'aggressive'},winFx:{stones:140}}},{txt:'💎 破财消灾（160 灵石）',fx:{stones:-160}}]},
    );
  }
  /* —— 道侣 +20 —— */
  if(typeof PARTNER_EVENTS!=='undefined'&&Array.isArray(PARTNER_EVENTS)){
    PARTNER_EVENTS.push(
      {id:'b11_p_d01',t:'{g} 在院子里种了一株桃树，日日浇水，宝贝得不行。',opts:[{txt:'🌸 帮忙松土，夸{g}会养',fx:{aff:3,mem:'共种桃树'}},{txt:'😏 逗{g}：「等结果，先让我尝」',fx:{aff:2}}]},
      {id:'b11_p_d02',t:'你从坊市回来，{g} 迎上来，第一句不是问你买了什么，而是「累不累」。',opts:[{txt:'💞 心头一暖：「有你，不累」',fx:{aff:5,mem:'一句累不累'}},{txt:'🛍️ 献宝似的拿出买的东西',fx:{aff:3}}]},
      {id:'b11_p_d03',t:'{g} 看着你练剑，忽然说：「你挥剑的样子，和初见时一模一样。」',opts:[{txt:'🗡️ 收剑笑道：「心没变过」',fx:{aff:4}},{txt:'😳 有些不好意思',fx:{aff:3}}]},
      {id:'b11_p_d04',t:'夜里，{g} 梦见你受伤，惊醒后摸黑到你房门外，听了半晌才放心离开。',opts:[{txt:'🚪 开门拉住{g}：「我没事」',fx:{aff:5,mem:'夜半惊梦'}},{txt:'🛌 装作不知，心里却热热的',fx:{aff:3}}]},
      {id:'b11_p_d05',t:'{g} 学会了一道你爱吃的菜，端来给你尝，紧张地看着你的表情。',opts:[{txt:'🍲 认真尝了，竖起拇指',fx:{aff:4}},{txt:'🤨 尝了一口：「……盐多了点」',fx:{aff:1,favor:-1}}]},
      {id:'b11_p_d06',t:'山涧边，{g} 赤脚踩水，回头朝你笑：「下来呀，水可凉了。」',opts:[{txt:'💧 卷起裤脚同踩',fx:{aff:4,mem:'山涧踩水'}},{txt:'😌 坐在岸边看{g}玩',fx:{aff:3}}]},
      {id:'b11_p_d07',t:'{g} 难得露出孩子气，非要和你比谁先跑到山顶。',opts:[{txt:'🏃 陪{g}跑上去',fx:{aff:3,mood:5}},{txt:'🤝 故意放慢，让{g}赢',fx:{aff:4}}]},
      {id:'b11_p_d08',t:'你连日忙宗门事务，{g} 不吵不闹，只在你案头放了一盏热茶。',opts:[{txt:'🍵 端起茶：「委屈你了」',fx:{aff:4,mem:'案头一盏茶'}},{txt:'🤝 拉着{g}的手：「忙完这阵陪你」',fx:{aff:5}}]},
      {id:'b11_p_d09',t:'{g} 忽然说要给你绣个护腕，针脚虽丑，却一针一线都认真。',opts:[{txt:'🧵 接过护腕，当场系上',fx:{aff:4,mem:'一针一线的护腕'}},{txt:'😄 笑{g}手艺，却小心收好',fx:{aff:3}}]},
      {id:'b11_p_d10',t:'深秋，{g} 与你并肩走在落叶里，沙沙的声响像一首曲子。',opts:[{txt:'🍂 捡一片好看的叶子给{g}',fx:{aff:3}},{txt:'🤝 握住{g}的手慢慢走',fx:{aff:4}}]},
      {id:'b11_p_mr1',stage:'married',t:'结缡多年，{g} 忽然说：「我给你留了一坛酒，埋在当年那棵桃树下。」',opts:[{txt:'🍶 掘出来共饮',fx:{aff:5,mem:'桃树下的酒'}},{txt:'🌳 摸着桃树：「你还记得」',fx:{aff:5}}]},
      {id:'b11_p_mr2',stage:'married',t:'你受伤回来，{g} 没问缘由，只默默替你换药，手稳得不像话。',opts:[{txt:'💊 握紧{g}的手：「有你在」',fx:{aff:5,mem:'默默换药'}},{txt:'🧘 闭目养伤，把感激记在心里',fx:{aff:3}}]},
      {id:'b11_p_mr3',stage:'married',t:'{g} 看着你鬓角的白发，轻轻拨了拨：「我们老了，好像又没老。」',opts:[{txt:'🤝 笑道：「心里那团火，还年轻」',fx:{aff:5,mem:'白发与少年心'}},{txt:'😌 相视一笑，什么也不必说',fx:{aff:4}}]},
      {id:'b11_p_mr4',stage:'married',t:'你与{g} 同游旧地，指着当年相遇的山亭：「就是这儿。」',opts:[{txt:'🏔️ 并肩站定，恍如昨日',fx:{aff:5,mem:'重游初遇地'}},{txt:'💞 握住手：「往后的路，还一起走」',fx:{aff:5}}]},
      {id:'b11_p_mr5',stage:'married',t:'{g} 为你打理琐事多年，今日却认真地看你：「下辈子，还嫁你。」',opts:[{txt:'💍 郑重道：「生生世世」',fx:{aff:6,mem:'来世之诺'}},{txt:'🤝 笑道：「那得提前约好」',fx:{aff:5}}]},
      {id:'b11_p_mr6',stage:'married',t:'宗门夜宴，{g} 坐在你身侧，席间悄悄往你碗里夹你爱吃的菜。',opts:[{txt:'🥢 低头吃完，心里热热的',fx:{aff:4}},{txt:'😳 低声：「这么多人呢」',fx:{aff:3}}]},
      {id:'b11_p_u1',stage:'unmarried',t:'你与{g} 并肩走了很远，谁也没说话。临别时，{g} 忽然回头：「下次……还一起走吗？」',opts:[{txt:'🤝 笑道：「当然」',fx:{aff:4,mem:'未说出口的约定'}},{txt:'😳 点头，快步走开',fx:{aff:3}}]},
      {id:'b11_p_u2',stage:'unmarried',t:'{g} 递来一方帕子，上面绣着你的名字：「上次看你擦汗用衣袖，顺手绣的。」',opts:[{txt:'🧣 郑重收下帕子',fx:{aff:4,mem:'一方绣名帕'}},{txt:'😳 耳根发热：「你绣的？」',fx:{aff:4}}]},
      {id:'b11_p_u3',stage:'unmarried',t:'雨夜里，{g} 与你共躲一处屋檐，雨声很大，心跳声更大。',opts:[{txt:'☔ 把外袍披到{g}身上',fx:{aff:4,mem:'雨夜屋檐'}},{txt:'🤝 往{g}那边挪了挪',fx:{aff:3}}]},
      {id:'b11_p_u4',stage:'unmarried',t:'{g} 生辰，你没送什么贵重物，只陪{g}走了一天山路。',opts:[{txt:'🌄 日落时摘一朵野花相赠',fx:{aff:5,mem:'生辰野花'}},{txt:'🤝 握着手看晚霞',fx:{aff:4}}]},
    );
  }
  /* —— 宗门 +20 —— */
  if(typeof SECT_EVENTS!=='undefined'&&Array.isArray(SECT_EVENTS)){
    SECT_EVENTS.push(
      {id:'b11_s_e01',t:'后山发现一条新灵脉，长老正盘算如何开发，问谁愿去勘察。',opts:[{txt:'🧭 自荐勘察',fx:{roll:{attr:'int',dc:13,prelude:'你入后山勘察：',hit:'你勘明灵脉走向，还标出了几个富矿点。',miss:'灵脉藏在岩层深处，你只摸清了个大概。',hitFx:{contrib:7,stones:50},missFx:{contrib:3}}}},{txt:'🤷 等长老安排',fx:{}}]},
      {id:'b11_s_e02',t:'门中一名弟子被妖兽所伤，缺一味续骨灵药。',opts:[{txt:'🌿 主动去寻药',fx:{roll:{attr:'agi',dc:13,prelude:'你进山寻药：',hit:'你寻得续骨草，弟子伤愈，感激不尽。',miss:'药难寻，你寻了半日才得一小株。',hitFx:{merit:3,contrib:4,mat:{herb:1}},missFx:{merit:1}}}},{txt:'💊 以门中库存先顶着',fx:{contrib:2}}]},
      {id:'b11_s_e03',t:'山门来报：山脚村落被妖兽袭扰，村民来求援。',opts:[{txt:'🛡️ 领命下山除妖',fx:{roll:{attr:'str',dc:13,prelude:'你下山除妖：',hit:'你击退妖兽，村民感恩戴德。',miss:'妖兽狡猾逃遁，你留下警示符。',hitFx:{merit:4,contrib:5},missFx:{merit:1}}}},{txt:'📣 上报长老调派',fx:{contrib:2}}]},
      {id:'b11_s_e04',t:'藏经阁添了一批新功法，长老让你帮忙校录。',opts:[{txt:'📖 细心校录',fx:{roll:{attr:'int',dc:12,prelude:'你校录功法：',hit:'你校出错漏多处，顺手抄录了心法要诀。',miss:'你校得头晕，好在没出大错。',hitFx:{contrib:4,insight:1},missFx:{contrib:2}}}},{txt:'🧘 只挑一卷参读',fx:{insight:1}}]},
      {id:'b11_s_e05',t:'门中弟子切磋，一名弟子出手过重，伤了同门，正不知所措。',opts:[{txt:'🤝 上前调和，劝其道歉',fx:{roll:{attr:'cha',dc:13,prelude:'你出面调解：',hit:'双方握手言和，门中风气为之一正。',miss:'两人都不服气，你只能请长老定夺。',hitFx:{merit:2,contrib:4,favor:2},missFx:{}}}},{txt:'👀 旁观不语',fx:{}}]},
      {id:'b11_s_e06',t:'宗门灵田丰收，掌事弟子正愁人手分装药材。',opts:[{txt:'🌾 帮忙分装',fx:{roll:{attr:'str',dc:12,prelude:'你撸袖上阵：',hit:'你手脚麻利，半日分完，还多得一份药材。',miss:'你毛手毛脚，撒了些许。',hitFx:{contrib:3,mat:{herb:1}},missFx:{contrib:2}}}},{txt:'💰 出灵石雇人',fx:{stones:-40,contrib:2}}]},
      {id:'b11_s_e07',t:'夜半，你巡山时撞见一名弟子偷偷出山，行踪诡秘。',opts:[{txt:'🕵️ 悄悄跟上',fx:{roll:{attr:'agi',dc:14,prelude:'你尾随其后：',hit:'原来是下山私会家人，并无不轨，你放下心来。',miss:'对方警觉，你跟丢了，只好上报。',hitFx:{contrib:3,merit:1},missFx:{}}}},{txt:'📜 记下此事，明日上报',fx:{contrib:2}}]},
      {id:'b11_s_e08',t:'门中老辈讲道，讲到一半忽然考较起众弟子。',opts:[{txt:'🧘 从容作答',fx:{roll:{attr:'int',dc:13,prelude:'你起身作答：',hit:'你答得在理，老辈点头赞许。',miss:'你一时语塞，只答了个皮毛。',hitFx:{contrib:5,insight:1},missFx:{cult:30}}}},{txt:'🙏 请老辈开示',fx:{insight:1}}]},
      {id:'b11_s_t01',t:'长老命你押送一批丹药去友宗，路上要多加小心。',opts:[{txt:'🗺️ 亲自押送',fx:{roll:{attr:'wil',dc:13,prelude:'你押送丹药：',hit:'一路太平，丹药平安送达，友宗回礼相谢。',miss:'途中遇劫修，你力战护住丹药，还是损了一瓶。',hitFx:{contrib:6,stones:40},missFx:{contrib:2}}}},{txt:'🤝 与同门结伴同往',fx:{contrib:4}}]},
      {id:'b11_s_t02',t:'山脚矿井报来急讯：矿洞塌方，有矿工被困。',opts:[{txt:'🦸 赶去救人',fx:{roll:{attr:'str',dc:14,prelude:'你赶往矿洞：',hit:'你以灵力撑住塌方，救出全部矿工。',miss:'你拼力挖开通道，救出大半，仍有伤者。',hitFx:{merit:5,contrib:6},missFx:{merit:2}}}},{txt:'📣 组织人手救援',fx:{merit:2,contrib:3}}]},
      {id:'b11_s_t03',t:'门中要立一块碑，纪念历代祖师，长老让你去选石。',opts:[{txt:'⛏️ 亲赴石场选石',fx:{roll:{attr:'int',dc:12,prelude:'你选石：',hit:'你选得一方上好的青石，纹理如云。',miss:'石头成色平平，长老倒也不在意。',hitFx:{contrib:4,favor:2},missFx:{contrib:2}}}},{txt:'💰 托人采买',fx:{stones:-50,contrib:2}}]},
      {id:'b11_s_t04',t:'友宗送来一箱灵果，长老让你分给门中弟子。',opts:[{txt:'🍎 公平分派',fx:{roll:{attr:'cha',dc:12,prelude:'你分派灵果：',hit:'分得公道，众弟子念你的好。',miss:'你分了半天，还有人嫌少。',hitFx:{favor:4,contrib:2},missFx:{favor:1}}}},{txt:'🍎 留一份给长老，其余平分',fx:{favor:2,contrib:2}}]},
      {id:'b11_s_t05',t:'门中后山禁地边缘灵光闪烁，长老命你前去查看。',opts:[{txt:'🧭 入内查探',fx:{roll:{attr:'int',dc:14,prelude:'你入禁地边缘：',hit:'原是灵脉自涌的灵泉，你记下方位回报。',miss:'灵光转瞬即逝，你一无所获。',hitFx:{contrib:6,mat:{jade:1}},missFx:{contrib:2}}}},{txt:'📜 回报长老定夺',fx:{contrib:3}}]},
      {id:'b11_s_t06',t:'宗门接了一单为凡人村庄布雨的差事，长老点你随行。',opts:[{txt:'🌧️ 施展呼风唤雨',fx:{roll:{attr:'int',dc:13,prelude:'你施法布雨：',hit:'甘霖普降，村民跪地叩谢。',miss:'雨势太小，你只得再施一次。',hitFx:{merit:4,contrib:4},missFx:{merit:1}}}},{txt:'💰 捐些灵石助村中修渠',fx:{stones:-60,merit:2}}]},
      {id:'b11_s_t07',t:'长老让你去坊市采买一批炼丹辅料，预算有限。',opts:[{txt:'🛒 货比三家',fx:{roll:{attr:'int',dc:13,prelude:'你逛遍坊市：',hit:'你省下一笔灵石，还摸清了行情。',miss:'你被掌柜绕晕，多花了些。',hitFx:{contrib:4,stones:30},missFx:{contrib:2}}}},{txt:'🏪 就近买齐',fx:{stones:-30,contrib:3}}]},
      {id:'b11_s_t08',t:'门中老辈寿辰，长老让你准备贺礼。',opts:[{txt:'🎁 亲手备礼',fx:{roll:{attr:'cha',dc:12,prelude:'你备礼：',hit:'你备得合心意，老辈抚须而笑。',miss:'礼物平平，好在心意到了。',hitFx:{favor:4,contrib:3},missFx:{favor:1}}}},{txt:'💰 出灵石合礼',fx:{stones:-80,contrib:3}}]},
      {id:'b11_s_b01',t:'大比在即，长老宣布今年胜者可入藏经阁顶层参悟一日。',opts:[{txt:'🥊 志在必得',fx:{contrib:3,flag:'bigSignUp'}},{txt:'🤔 量力而行',fx:{}}]},
      {id:'b11_s_b02',t:'大比前夜，你温习招式至深夜。{p} 提着一盏灯过来：「明日一起加油。」',opts:[{txt:'🕯️ 接过灯：「好」',fx:{favor:3}},{txt:'🤜 与{p}击掌为誓',fx:{favor:3,cult:40}}]},
      {id:'b11_s_b03',t:'大比夺魁后，长老嘉奖，还问你愿不愿代表本门参加宗门大会。',opts:[{txt:'🏔️ 欣然应下',fx:{contrib:6,favor:3}},{txt:'🙏 推辞：「弟子资历尚浅」',fx:{merit:1}}]},
      {id:'b11_s_b04',t:'大比落幕，{p} 惜败于你，却坦然道贺：「明年，我会赢回来。」',opts:[{txt:'🤝 笑道：「我等着」',fx:{favor:3,mood:4}},{txt:'🏆 把彩头分{p}一半',fx:{favor:4,merit:1}}]},
    );
  }
})();
