/* ======================================================
  仙途 · 主线 / 支线任务数据表（v42）
  说明：MAIN_STORY 为十章主线；SIDE_QUESTS 为十条支线链。
  目标类型：story / realm / visit / explore / kill / collect / collectMat
           / tower / dungeon / talk / craft / insight
  剧情步骤：lines 为台词数组，opts 为抉择（fx 效果见 exploreEvents.applyEventEffects，
           支持 stones/cult/cultPct/merit/karma/mat/item/luck/insight/fight/flag/once）
  schema 校验：js/core/schema.js validateQuests()
====================================================== */
'use strict';
const MAIN_STORY=[
  {id:'ch0',icon:'🏚️',title:'破庙惊变',summary:'一张残卷入梦，山神夜话点破天机。',realm:0,
   steps:[
     {type:'story',id:'m0s0',title:'残卷托梦',go:'quests',
      lines:['这一夜，你梦见破庙供桌下压着的半卷残经自行展开，字字如萤火浮空：「天衍将倾，九幽复燃。得经者，当承此劫。」','你猛地惊醒，怀中多了一枚温润的残玉——梦中的字，竟还印在眼前。'],
      opts:[
        {txt:'🙏 对残玉起誓，承此因果',cls:'primary',fx:{merit:2}},
        {txt:'🧐 将残玉收好，静观其变',fx:{insight:1,once:'m0s0_b'}},
      ]},
     {type:'realm',param:3,hint:'先安心修炼，让气感稳固。炼气三层后，你才有力气揭开残经之谜。',go:'cult'},
     {type:'visit',param:'near',hint:'去青石小径走走——破庙、溪谷与山神，都在等你回来。',go:'map'},
     {type:'story',id:'m0s3',title:'山神夜话',go:'quests',
      lines:['夜色里，破庙的山神像竟微微转动了头颅：「你来了。当年把残经托付给这庙的老道，等了三百年。」','山神指尖一点，你看见一幅画卷：九幽裂隙、古战场、天衍祭坛……最后定格在一扇青铜巨门上。'],
      opts:[
        {txt:'🤝 谢过山神，谨记此誓',cls:'primary',fx:{merit:2,luck:1}},
        {txt:'📜 追问老道的下落',fx:{insight:1,once:'m0s3_b'}},
      ]},
   ]},
  {id:'ch1',icon:'🌊',title:'灵溪初遇',summary:'幽谷琴音，老道赠符，天衍之劫初露端倪。',realm:1,
   steps:[
     {type:'visit',param:'valley',hint:'灵溪幽谷灵气盎然——山神说，那里有人在等你。',go:'map'},
     {type:'story',id:'m1s1',title:'幽谷琴音',go:'quests',
      lines:['灵溪尽头，一袭白衣背对而坐，指尖琴音如溪水入海。「你身上的残玉……是从破庙来的？」琴师没有回头。','琴音骤止，他留下一枚木符：「天衍之劫现世，有人借琴音传讯。持此符去坊市，找那位卖茶的老妪。」'],
      opts:[
        {txt:'🙏 郑重收下木符',cls:'primary',fx:{item:{name:'传讯木符',type:'trinket',quality:1,count:1,desc:'琴师所赠木符，暗藏坊市茶棚的暗语。',sell:30}}},
        {txt:'🎶 求一曲终了再走',fx:{merit:1,insight:1,once:'m1s1_b'}},
      ]},
     {type:'explore',param:2,hint:'多出去走走吧——传讯之人说，线索藏在山野之间。',go:'map'},
     {type:'story',id:'m1s3',title:'老道赠符',go:'quests',
      lines:['坊市茶棚的老妪接过木符，浑浊的眼里精光一闪：「是那老东西的信物。」她塞给你一只旧锦囊：「剑宗覆灭那夜，有人偷走了半卷天衍经。锦囊里的东西，能保你筑基无忧。」'],
      opts:[
        {txt:'🎁 收下锦囊，道谢离去',cls:'primary',fx:{item:{name:'筑基丹',type:'consumable',quality:2,count:1,desc:'凝炼丹基所需，坊市售价不菲。',use:'break',sell:400}}},
        {txt:'🕵️ 打听剑宗覆灭的旧事',fx:{merit:1,insight:1,once:'m1s3_b'}},
      ]},
   ]},
  {id:'ch2',icon:'🌲',title:'坊市迷局',summary:'筑基功成，暮色深林里的药园女主人道出一桩旧案。',realm:2,
   steps:[
     {type:'collect',param:'筑基丹',hint:'炼制或购得一枚筑基丹，为冲击筑基做准备。',go:'market'},
     {type:'realm',param:9,hint:'筑基功成——你已真正踏上仙途。',go:'cult'},
     {type:'visit',param:'forest',hint:'暮色深林有座上古药园，园中女主人似乎与天衍经有关。',go:'map'},
     {type:'story',id:'m2s3',title:'药园女主人',go:'quests',
      lines:['药园深处的竹屋里，一位白发女修正在晒药。她抬头看你，微微一怔：「你怀里……是那半卷残经的传人？」','她翻出一片焦黄的残页：「三百年前剑宗覆灭，天衍经被一分为三。这一页是药园所藏——拿去吧，替我们这些老人，看看这个世道还能不能好起来。」'],
      opts:[
        {txt:'🤝 接过残页，郑重承诺',cls:'primary',fx:{merit:3,insight:1,once:'m2s3_a'}},
        {txt:'🍵 先陪她喝一盏茶',fx:{merit:1,luck:1}},
      ]},
   ]},
  {id:'ch3',icon:'🗡️',title:'剑冢遗音',summary:'断魂崖剑痕问剑，百年前剑宗覆灭的真相浮出水面。',realm:3,
   steps:[
     {type:'realm',param:13,hint:'金丹一成，方可踏入断魂崖的剑意风暴。',go:'cult'},
     {type:'visit',param:'cliff',hint:'断魂崖的剑痕，是剑宗覆灭之夜留下的。',go:'map'},
     {type:'story',id:'m3s2',title:'剑痕问剑',go:'quests',
      lines:['崖壁剑痕前，你闭目凝神。一道苍老的声音在识海响起：「小辈，你身上有药园那丫头的药香。可是为天衍经而来？」','剑意凝成一柄虚影：「剑宗覆灭那夜，叛徒偷走了剑宗所藏的那一卷。持此剑意，魔道中人见了自会心虚。」'],
      opts:[
        {txt:'🗡️ 参悟剑痕，收下剑意',cls:'primary',fx:{insight:1,once:'m3s2_a',flag:{swordIntent:1}}},
        {txt:'🫡 向剑痕深鞠一躬',fx:{merit:2,luck:1}},
      ]},
     {type:'kill',param:3,hint:'以战养剑——击败三名敌人，让剑意见见血。',go:'map'},
     {type:'story',id:'m3s4',title:'剑宗旧事',go:'quests',
      lines:['深夜的破庙里，山神又开了口：「剑宗的叛徒……如今已是一派掌门。他化名藏身正道，手里攥着第二卷天衍经。」','山神低声道：「宗门大会将至，这是你混进去的最好时机。」'],
      opts:[
        {txt:'🗡️ 以剑意开路，踏入宗门',cls:'primary',fx:{merit:2}},
        {txt:'🤔 先拜入宗门，徐徐图之',fx:{insight:1,once:'m3s4_b'}},
      ]},
     {type:'story',id:'m3s5',title:'剑冢回响',go:'quests',
      lines:['入宗前夜，你重回断魂崖。月色下的剑痕竟发出低鸣，像是在与你说最后的嘱托。','「叛徒的剑，是从这里偷走的。这一截断剑你带着——它认得那柄剑的杀气。」剑意凝成一截断剑，落入你掌心。'],
      opts:[
        {txt:'🗡️ 收下断剑信物',cls:'primary',fx:{flag:{swordToken:1},insight:1,once:'m3s5_a'}},
        {txt:'🪨 将断剑留在剑痕旁',fx:{merit:3,luck:1}},
      ]},
   ]},
  {id:'ch4',icon:'🏯',title:'宗门风云',summary:'古战遗信指向宗门内鬼，藏经阁密语揭开半卷天衍经下落。',realm:4,
   steps:[
     {type:'realm',param:17,hint:'元婴已成，你在宗门中已是举足轻重的人物。',go:'cult'},
     {type:'visit',param:'hill',hint:'荒山野岭的古战遗信，藏着叛徒的线索。',go:'map'},
     {type:'story',id:'m4s2',title:'古战遗信',go:'quests',
      lines:['你在荒山猎户旧屋的暗格里，找到一封染血的信：「……阵眼已破，剑宗必亡。事成之后，天衍经分我一半。」落款是一枚魔纹印。','信纸背面画着宗门藏经阁的地形图——叛徒，就在你身边。'],
      opts:[
        {txt:'📜 收好信件，不动声色',cls:'primary',fx:{merit:2,flag:{traitorLetter:1}}},
        {txt:'🕯️ 将信件焚毁，另寻证据',fx:{karma:1,insight:1,once:'m4s2_b'}},
      ]},
     {type:'talk',param:3,hint:'多与人交谈，打探藏经阁与叛徒的蛛丝马迹。',go:'social'},
     {type:'story',id:'m4s4',title:'藏经阁密语',go:'quests',
      lines:['藏经阁顶层的旧书架后，你发现一行以剑意刻下的小字：「天衍三卷，药园、剑宗各一。第三卷在天衍祭坛，被古修用九幽锁链封存。」','落款处画着一只飞升的鹤——是那位守关古修的笔迹。'],
      opts:[
        {txt:'🔍 拓印密语，收好证物',cls:'primary',fx:{insight:1,once:'m4s4_a',flag:{scriptRubbing:1}}},
        {txt:'🧘 于藏经阁静坐，参悟片刻',fx:{cult:220}},
      ]},
     {type:'story',id:'m4s5',title:'山门夜哨',go:'quests',
      lines:['宗门外松林夜哨，你握着断剑信物守到三更。剑身忽然发烫——那柄偷自剑宗的魔剑，正在靠近。','一名蒙面人自阴影中走出，怀里鼓鼓囊囊。断剑在你掌心低鸣，如认出了旧敌。'],
      opts:[
        {txt:'🗡️ 持断剑现身，喝破其行藏',cls:'danger',fx:{fight:{name:'魔道暗桩',atk:11,def:5,hp:55,elem:'dark',style:'rapid',boss:true},winFx:{merit:4,stones:150,flag:{spyCaught:1}}}},
        {txt:'🤫 尾随其后，摸清接应之人',fx:{insight:1,once:'m4s5_b'}},
      ]},
   ]},
  {id:'ch5',icon:'⚔️',title:'荒原魔影',summary:'古战场战魂低语，魔潮源头浮出水面。',realm:5,
   steps:[
     {type:'visit',param:'ruin',hint:'古战场遗迹——那里埋着上一次天衍之劫的真相。',go:'map'},
     {type:'story',id:'m5s1',title:'战魂低语',go:'quests',
      lines:['残阳下的焦土上，磷火聚成一名披甲战魂：「三百年前，我等以身填住九幽裂隙。如今锁链松动，魔潮将起。」','战魂抬手，你看见裂隙深处立着一座青铜祭坛：「天衍经的第三卷，就在祭坛之下。但封印之人，早已成魔。」'],
      opts:[
        {txt:'🤝 向战魂立誓，续其未竟之志',cls:'primary',fx:{merit:3,luck:1}},
        {txt:'🕯️ 燃香祭拜，记下祭坛方位',fx:{insight:1,once:'m5s1_b'}},
      ]},
     {type:'kill',param:5,hint:'魔潮前哨已现——斩敌 5 名，稳住阵脚。',go:'map'},
     {type:'story',id:'m5s3',title:'魔潮初现',go:'quests',
      lines:['远方黑云压境，魔修斥候的身影在山影间若隐若现。「来了。」战魂低语，「这一次，比三百年前更凶。」','你握紧残玉，剑意与药香在体内共鸣——天衍经的传人，该上场了。'],
      opts:[
        {txt:'⚔️ 提剑迎向黑云',cls:'danger',fx:{fight:{name:'魔潮前哨统领',atk:10,def:5,hp:60,elem:'dark',style:'burst',boss:true},winFx:{merit:5,stones:120}}},
        {txt:'🕵️ 隐匿身形，探清魔潮部署',fx:{insight:1,once:'m5s3_b'}},
      ]},
     {type:'story',id:'m5s4',title:'战魂誓约',go:'quests',
      lines:['击退前哨后，战魂飘至你面前，将一面残破战旗按入你手中：「旗在，志在。若有一日裂隙失守，凭此旗号令残魂，为你断后。」','你接过战旗，战魂的身影淡了几分，嘴角却微微上扬——它等这句话，等了三百年。'],
      opts:[
        {txt:'🪧 立下誓约，扛起战旗',cls:'primary',fx:{flag:{warVow:1},merit:3,once:'m5s4_a'}},
        {txt:'🔥 燃旗为誓，不留退路',fx:{karma:-1,luck:1,flag:{warVow:2}}},
      ]},
   ]},
  {id:'ch6',icon:'🌑',title:'幽冥之门',summary:'荒古禁地古修残影托付封魔印，九幽裂隙由此开启。',realm:6,
   steps:[
     {type:'realm',param:21,hint:'化神期，方有资格踏入荒古禁地深处。',go:'cult'},
     {type:'visit',param:'abyss',hint:'荒古禁地——封存天衍经第三卷的地方。',go:'map'},
     {type:'story',id:'m6s2',title:'古修残影',go:'quests',
      lines:['禁地深处的古修残影这次主动开了口：「三百年前我以身封印，却挡不住心魔入体。祭坛下的第三卷经书，是钥匙，也是囚笼。」','残影凝出一枚封魔印：「带着它去天衍祭坛。记住——经书可以拿，魔，不能放。」'],
      opts:[
        {txt:'🤝 接过封魔印',cls:'primary',fx:{item:{name:'封魔印',type:'trinket',quality:3,count:1,desc:'古修残影所托，可镇九幽魔气。',sell:100},merit:2}},
        {txt:'🫡 向残影行大礼',fx:{merit:2,insight:1,once:'m6s2_b'}},
      ]},
     {type:'dungeon',param:1,hint:'以秘境历练磨砺道心——秘境中的天衍古碑与祭坛同源。',go:'map'},
     {type:'story',id:'m6s4',title:'九幽裂隙',go:'quests',
      lines:['从秘境归来那夜，你在梦中和残影重逢。他指尖点在你眉心：「裂隙的钥匙，其实一直跟着你。」','你低头——怀中那块残玉，正幽幽发光。'],
      opts:[
        {txt:'💠 以残玉触碰裂隙幻影',cls:'primary',fx:{cultPct:2,flag:{keyFragment:1}}},
        {txt:'🧘 定住心神，默诵天衍经',fx:{insight:1,once:'m6s4_b'}},
      ]},
     {type:'story',id:'m6s5',title:'封魔印成',go:'quests',
      lines:['你以真元炼化残玉中的封魔印，印上古文逐一亮起，如群星归位。裂隙的阴风被压回三分。','守关古修的残影郑重一礼：「印成，则裂隙可守百年；印碎，则魔潮无阻。此印与你的命数相连——它认主了。」'],
      opts:[
        {txt:'🔏 歃血立契，与印同命',cls:'primary',fx:{flag:{sealBound:1},luck:1,insight:1,once:'m6s5_a'}},
        {txt:'🤝 以道心立约，不用血契',fx:{merit:4,flag:{sealBound:2}}},
      ]},
   ]},
  {id:'ch7',icon:'⛩️',title:'天衍祭坛',summary:'祭坛异动，试炼塔顶暗藏天道碎片。',realm:7,
   steps:[
     {type:'realm',param:29,hint:'合体期——你已接近天衍之劫的风暴中心。',go:'cult'},
     {type:'story',id:'m7s1',title:'祭坛异动',go:'quests',
      lines:['你按封魔印的指引来到天衍祭坛废墟。祭坛正中，三卷经书的位置有两卷已空——有人捷足先登。','残影的声音在风中响起：「去试炼塔顶。天道碎片在那里，它是打开祭坛的最后一把钥匙。」'],
      opts:[
        {txt:'🔍 勘查祭坛遗迹',cls:'primary',fx:{insight:1,once:'m7s1_a',flag:{altarScouted:1}}},
        {txt:'🧘 于祭坛废墟静坐，感受天衍之力',fx:{cultPct:2}},
      ]},
     {type:'tower',param:20,hint:'攀上试炼塔第 20 层——塔顶藏着天道碎片。',go:'tower'},
     {type:'story',id:'m7s3',title:'天道碎片',go:'quests',
      lines:['试炼塔顶的虚空里，一枚暗金色碎片静静悬浮。你伸手触碰的瞬间，无数画面涌入识海——三百年前的天衍之劫，正是有人在祭坛上打开了九幽之门。','碎片在你掌心化开，与残玉融为一体。这一次，你终于知道敌人是谁了。'],
      opts:[
        {txt:'💠 收下天道碎片',cls:'primary',fx:{luck:1,flag:{heavenShard:1}}},
        {txt:'🧐 先问清碎片来历再取',fx:{insight:1,once:'m7s3_b'}},
      ]},
     {type:'story',id:'m7s4',title:'星图刻痕',go:'quests',
      lines:['碎片与残玉融合后，祭坛地面的刻痕忽然亮起，连成一片星图——三百年前，有人以血为墨，在祭坛上记下了九幽裂隙的九重结构。','星图的尽头指向一处空白，像是被人刻意抹去：「第九重之下……锁着不该存在的东西。」'],
      opts:[
        {txt:'🔭 拓下星图，补全空白一角',cls:'primary',fx:{insight:1,flag:{starMap:1},merit:2}},
        {txt:'🧘 闭目观想星图，静待其变',fx:{cult:120,insight:1,once:'m7s4_b'}},
      ]},
   ]},
  {id:'ch8',icon:'🌪️',title:'九幽裂隙',summary:'裂隙镇压，无面战魂，天机老人道破最后一步。',realm:8,
   steps:[
     {type:'realm',param:33,hint:'大乘期——天衍之劫的终章已至。',go:'cult'},
     {type:'visit',param:'ruin',hint:'古战场遗址的裂隙，比三百年前更宽了。',go:'map'},
     {type:'story',id:'m8s2',title:'裂隙镇压',go:'quests',
      lines:['裂隙前，魔气如潮水般翻涌。战魂们的身影已淡得几乎透明：「我们的时间不多了。带着封魔印，镇住裂隙，祭坛上的经书就会自己认主。」','你握紧封魔印，踏前一步——身后，是三百年的执念。'],
      opts:[
        {txt:'🛡️ 以封魔印镇压裂隙',cls:'primary',fx:{merit:5,cultPct:2}},
        {txt:'🤔 先问战魂三百年前的事',fx:{insight:1,once:'m8s2_b'}},
      ]},
     {type:'kill',param:10,hint:'裂隙中的魔物已倾巢而出——斩敌 10 名，守住阵线。',go:'map'},
     {type:'story',id:'m8s4',title:'天机老人',go:'quests',
      lines:['魔潮退去的清晨，一名白眉老道拄杖立于废墟之上：「三百年前，我也是站在这里的人。」他是守关古修的旧友，也是天机阁最后一任阁主。','老道叹道：「祭坛需要三卷经书合一才能开启天门。药园与剑宗的两卷在你手中——第三卷，在幽冥之门后。渡劫之日，便是开门之时。」'],
      opts:[
        {txt:'🙏 请教渡劫之法',cls:'primary',fx:{insight:1,once:'m8s4_a'}},
        {txt:'🤝 约定劫后再见',fx:{merit:2,luck:1}},
      ]},
   ]},
  {id:'ch9',icon:'🧘',title:'天道问心',summary:'问心三问，道心抉择，天门钥匙自此铸成。',realm:9,
   steps:[
     {type:'realm',param:37,hint:'渡劫期——天门之前，先问本心。',go:'cult'},
     {type:'story',id:'m9s1',title:'问心三问',go:'quests',
      lines:['渡劫前夜，你于灵溪谷中打坐。琴师、山神、老道、药园女主人、战魂……所有因果之人皆至，化作三道心问。','「你的执念，是什么？」「你的善恶，凭什么定？」「你求的长生，为的是谁？」'],
      opts:[
        {txt:'🤝 执念为苍生，善恶凭本心，长生为相逢',cls:'primary',fx:{merit:5,insight:1,once:'m9s1_a'}},
        {txt:'🗡️ 执念为道，善恶为剑，长生为我',fx:{karma:3,luck:1}},
      ]},
     {type:'story',id:'m9s2',title:'道心抉择',go:'quests',
      lines:['问心之后，你看见两条路：一是飞升成仙，从此不问凡尘；二是留下，守这方天地直到天衍之劫彻底终结。','残玉在你掌心发烫——它记得你最初的誓言。'],
      opts:[
        {txt:'🕊️ 心向天门',cls:'primary',fx:{flag:{daoChoice:'ascend'}}},
        {txt:'🌍 心向凡尘',fx:{flag:{daoChoice:'stay'}}},
      ]},
     {type:'story',id:'m9s3',title:'天门钥匙',go:'quests',
      lines:['残玉、剑意、药香、封魔印、天道碎片——五件信物在你体内合一，凝成一枚钥匙的虚影。','「天门，开了。」琴师的声音从很远的地方传来。'],
      opts:[
        {txt:'💠 握住天门钥匙',cls:'primary',fx:{flag:{heavenKey:1},insight:1,once:'m9s3_a'}},
      ]},
     {type:'story',id:'m9s4',title:'三生石前',go:'quests',
      lines:['入天门前，你于灵溪尽头见到一方青石，石上水纹如镜，映出三生：前世持卷的老道、今生破庙里惊醒的少年、来世白发执琴的故人。','镜中人齐齐望向你，异口同声：「记得你是谁，就不会走丢。」'],
      opts:[
        {txt:'🪨 抚石立誓，勿忘来路',cls:'primary',fx:{insight:1,luck:1,once:'m9s4_a'}},
        {txt:'🤝 将三生之诺刻入残玉',fx:{merit:3,flag:{tianVow:1}}},
      ]},
   ]},
  {id:'ch10',icon:'☁️',title:'天门之约',summary:'天门开启，仙凡两别——你兑现了三百年前的约定。',realm:10,
   steps:[
     {type:'realm',param:40,hint:'渡劫圆满——天门已在眼前。',go:'cult'},
     {type:'story',id:'m10s1',title:'天门开启',go:'quests',
      lines:['天门轰然洞开，仙光如瀑。身后，凡尘的炊烟、宗门的钟声、灵溪的琴音，一切历历在目。','天门后，一名白衣仙人负手而立：「三百年前，我们也这样开过一次门。进来吧——天衍之劫，从来不是一个人的事。」'],
      opts:[
        {txt:'☁️ 踏入天门',cls:'primary',fx:{merit:5}},
      ]},
     {type:'story',id:'m10s2',title:'仙凡永隔',go:'quests',
      lines:['你在天门与凡尘之间站了很久。','最终，你转身对白衣仙人一笑：「天门我记下了。但这方天地，还有我许过的愿——等我把它守完，再来。」'],
      opts:[
        {txt:'🌍 转身，守此天地（凡尘线）',cls:'primary',fx:{flag:{tianEnding:'stay'}}},
        {txt:'☁️ 头也不回，踏门而去（飞升线）',fx:{flag:{tianEnding:'ascend'}}},
      ]},
     {type:'story',id:'m10s4',title:'人间相送',go:'quests',
      lines:['临别那夜，灵溪谷的琴声彻夜未歇；破庙的山神像前，多了一炷新香；宗门的钟声敲过三巡，为你送行。','你忽然明白：仙凡之别，隔的从来不是天与地，而是你有没有把人间放进心里。'],
      opts:[
        {txt:'🎶 以琴音回礼，辞别故人',cls:'primary',fx:{merit:3,insight:1,once:'m10s4_a'}},
        {txt:'🤫 不回头，让山风替你道别',fx:{karma:-1,flag:{tianVow:1}}},
      ]},
     {type:'story',id:'m10s3',title:'飞升',go:'quests',
      lines:['无论你作何选择，三百年的因果都在这一刻画上句点。残玉化作流光，飞回破庙的供桌之下——等待下一位有缘人。','【主线 · 天门之约 完结】你的名字，被写进了天衍的注脚。'],
      opts:[
        {txt:'✨ 了却因果',cls:'primary',fx:{}},
      ]},
   ]},
];
const SIDE_QUESTS=[
  {id:'sq_pomiao',icon:'🏚️',title:'破庙香火',area:'near',summary:'山神三百年的香火，终于等来一个诚心人。',
   start:{visits:['near',3]},
   steps:[
     {type:'story',title:'山神现身',lines:['第三次回到破庙，山神像的眼睛竟动了：「三百年了，你是第一个回来上香的人。」','山神叹息：「当年老道把残经托付于此，我便欠他一份因果。今日见你，因果该还了。」'],opts:[
       {txt:'🙏 诚心叩拜',cls:'primary',fx:{merit:2,luck:1}},
       {txt:'🤝 与山神立约，替他了却旧愿',fx:{merit:3,insight:1,once:'sq_pomiao'}},
     ]},
   ],
   reward:{stones:150,title:'山神眷顾'}},
  {id:'sq_liehu',icon:'🏹',title:'猎户遗物',area:'hill',summary:'一封家书，牵出一段三十年前的旧事。',
   start:{visits:['hill',2]},
   steps:[
     {type:'story',title:'猎户家书',lines:['猎户旧屋的家书写着：「若有人见此信，烦请将柜底虎牙葬回后山虎穴——那是我与老伙计的约定。」'],opts:[
       {txt:'📜 收下虎牙，前往后山',cls:'primary',fx:{mat:{pelt:1}}},
     ]},
     {type:'kill',param:2,hint:'后山妖虎盘踞——击败 2 名妖兽，为虎牙寻个归处。',go:'map'},
     {type:'story',title:'还剑归山',lines:['你将虎牙葬入虎穴，山风呜咽如诉。远处，一头老虎远远望了你一眼，俯首为礼。','你忽然明白：猎户当年的约定，守的是人与山的情分。'],opts:[
       {txt:'🫡 还礼，转身离去',cls:'primary',fx:{merit:3,insight:1,once:'sq_liehu'}},
     ]},
   ],
   reward:{stones:150,insight:1}},
  {id:'sq_yaoyuan',icon:'🌿',title:'药园之谜',area:'forest',summary:'上古药园的残碑之下，埋着女主人师父的遗愿。',
   start:{visits:['forest',2]},
   steps:[
     {type:'story',title:'残碑遗愿',lines:['药园女主人指着残碑：「这是我师父的衣冠冢。她临终前说，想在碑前种满灵草——可我试了三十年，始终种不活。」'],opts:[
       {txt:'🔍 查看碑下土壤',cls:'primary',fx:{insight:1,once:'sq_yaoyuan_a'}},
     ]},
     {type:'collectMat',param:'sherb',count:3,hint:'收集 3 株灵草，种满残碑四周。',go:'map'},
     {type:'story',title:'灵草成荫',lines:['灵草种下的第十日，残碑竟生出一株从未见过的银花。药园女主人泪落如雨：「师父，你等的灵根，终于来了。」','她折下一枝银花赠你：「此花名唤「思归」，可入丹，也可入心。」'],opts:[
       {txt:'🌼 收下银花',cls:'primary',fx:{merit:3,luck:1,item:{name:'思归花',type:'consumable',quality:2,count:1,desc:'药园残碑所生银花，服之悟道（悟道 +1）。',use:'insight',sell:300}}},
     ]},
   ],
   reward:{insight:1,mat:{herb:3}}},
  {id:'sq_longyin',icon:'🐉',title:'龙吟断魂',area:'cliff',summary:'断魂崖的龙吟，是一段未竟的守护之约。',
   start:{visits:['cliff',2]},
   steps:[
     {type:'story',title:'雾中蛟影',lines:['断魂崖的雾里，你终于看清那道青影的真身——一头被锁链缚住的青蛟。它已在此守了三百年：「崖下有我的龙蛋。若我死后无人照看，它便要枯死。」'],opts:[
       {txt:'🤝 答应照看龙蛋',cls:'primary',fx:{merit:2}},
     ]},
     {type:'kill',param:3,hint:'崖下妖物觊觎龙蛋——击败 3 名敌人，守住蛟巢。',go:'map'},
     {type:'story',title:'蛟龙之托',lines:['青蛟以最后一缕灵气化开锁链，将龙蛋推到你怀中：「带它走吧。待它破壳，替我告诉它——它的父亲，守了这座崖三百年。」'],opts:[
       {txt:'🥚 收下龙蛋',cls:'primary',fx:{item:{name:'青蛟龙蛋',type:'egg',quality:3,count:1,desc:'断魂崖青蛟所托，可孵化灵宠。',use:'hatch',sell:800}}},
     ]},
   ],
   reward:{merit:3,title:'蛟龙之托'}},
  {id:'sq_guxiu',icon:'🏛️',title:'禁地古修',area:'abyss',summary:'古修残影的遗物，藏在秘境最深处。',
   start:{visits:['abyss',2]},
   steps:[
     {type:'story',title:'残影遗言',lines:['古修残影这次没有动手，只望着你：「我这一生，最放不下的不是修为，是年轻时从秘境里带出的那卷手札——它记着我师父的药方。」'],opts:[
       {txt:'📜 应下寻回手札',cls:'primary',fx:{merit:2}},
     ]},
     {type:'dungeon',param:1,hint:'通关一座秘境，寻回古修手札。',go:'map'},
     {type:'story',title:'手札归主',lines:['你在秘境深处寻回那卷发黄的手札。残影接过，指尖抚过纸页，竟落下两行灵泪。','「多谢。」他抬袖一拂，一道传承没入你识海。'],
      opts:[
       {txt:'📖 收下传承',cls:'primary',fx:{insight:1,once:'sq_guxiu'}},
     ]},
   ],
   reward:{cultPct:3,title:'古修传人'}},
  {id:'sq_valley',icon:'🎶',title:'幽谷琴师',area:'valley',summary:'谷中琴音，是一位琴师等了三百年的人。',
   start:{visits:['valley',2]},
   steps:[
     {type:'story',title:'琴音之约',lines:['白衣琴师终于转过头——那是一张清瘦的脸，眉间一点朱砂。「你听过我的琴，却不知我在等人。」','他说，三百年前他与人约定，在此处等一封回信。'],
      opts:[
       {txt:'🎶 问明回信去处',cls:'primary',fx:{insight:1,once:'sq_valley_a'}},
     ]},
     {type:'insight',param:1,hint:'以悟证琴——获得一次顿悟，方懂曲中之意。',go:'cult'},
     {type:'story',title:'知音',lines:['你于琴音中顿悟，睁眼时，琴师已收起琴：「三百年了，你是第一个听懂的人。」','他将琴赠你，飘然而去。自此，灵溪幽谷再无琴音——只剩满谷的风，替他继续等。'],
      opts:[
       {txt:'🎸 收下古琴',cls:'primary',fx:{item:{name:'断水古琴',type:'weapon',quality:3,bonus:4,desc:'幽谷琴师所赠，弦动则道韵流转。',sell:1200}}},
     ]},
   ],
   reward:{insight:1,cha:1}},
  {id:'sq_ruin',icon:'⚔️',title:'战魂安息',area:'ruin',summary:'让三百年的执念，归于尘土。',
   start:{visits:['ruin',2]},
   steps:[
     {type:'story',title:'执念未散',lines:['古战场的战魂们认出了你身上的剑意：「小辈，你带着剑宗的剑意。替我们做一件事——当年战死的人，有些还困在裂隙里，回不了家。」'],
      opts:[
       {txt:'🤝 应下此事',cls:'primary',fx:{merit:3}},
     ]},
     {type:'kill',param:4,hint:'裂隙中的战魂执念已化为魔物——击败 4 名，接引亡魂。',go:'map'},
     {type:'story',title:'归于尘土',lines:['你于裂隙前燃起灵香。点点磷火自焦土中升起，盘旋三匝，终于散去。','战魂们最后的声音如释重负：「多谢。来世若再逢，当以烈酒相待。」'],
      opts:[
       {txt:'🕯️ 目送魂归',cls:'primary',fx:{merit:5,insight:1,once:'sq_ruin'}},
     ]},
   ],
   reward:{stones:300,title:'魂归故里'}},
  {id:'sq_qinji',icon:'🎼',title:'琴姬断弦',area:'npc',summary:'月下琴姬的断弦，藏着一桩未了的心事。',
   start:{npc:'月下琴姬',talks:2},
   steps:[
     {type:'story',title:'断弦之约',lines:['月下琴姬抚琴时弦声一断，怔了半晌：「这弦……是他送我的。他说等我琴艺大成之日，便回来听我弹一曲。」','三十年过去，人未归，弦已断。'],
      opts:[
       {txt:'🤝 答应寻回那人下落',cls:'primary',fx:{merit:2}},
     ]},
     {type:'collectMat',param:'jade',count:1,hint:'寻一块寒玉，重续断弦。',go:'market'},
     {type:'story',title:'续弦',lines:['你将寒玉打磨成弦，替她续上。琴声再起时，竟比从前更清亮。','琴姬含泪而笑：「原来三十年的等待，等的不是那个人，而是这一刻的释然。」'],
      opts:[
       {txt:'🎼 陪她弹完一曲',cls:'primary',fx:{merit:2,luck:1}},
     ]},
   ],
   reward:{favor:15,insight:1}},
  {id:'sq_huxian',icon:'🦊',title:'狐仙报恩',area:'npc',summary:'狐仙苏苏的报恩，是三百年前一场雨里结下的善缘。',
   start:{npc:'狐仙苏苏',talks:1},
   steps:[
     {type:'story',title:'报恩之约',lines:['狐仙苏苏歪头看你：「你身上有破庙的味道。三百年前，庙里的小道士替我挡过一场雷劫——是你转世吗？」'],
      opts:[
       {txt:'🦊 应下这份因果',cls:'primary',fx:{merit:2}},
     ]},
     {type:'kill',param:2,hint:'苏苏说，追她的猎妖人快到了——击败 2 名敌人，护她周全。',go:'map'},
     {type:'story',title:'狐火与灵草',lines:['你替苏苏挡下猎妖人，她甩尾绕你三圈：「这份恩，记下了。」','她咬下一撮尾毛化作灵光：「带着它，灵草自会亲近你。」'],
      opts:[
       {txt:'🦊 收下狐毛信物',cls:'primary',fx:{merit:3,mat:{sherb:3},flag:{foxToken:1}}},
     ]},
   ],
   reward:{favor:20,title:'狐缘'}},
  {id:'sq_mozong',icon:'🌑',title:'魔道卧底',area:'chain',summary:'一枚魔道令牌，把你在正魔之间推向深渊。',
   start:{chain:['wodao',1]},
   steps:[
     {type:'story',title:'接令',lines:['黑市递来的魔道令牌上刻着暗纹：三日后，魔潮前哨会有一场密会。','接令，便是入了魔道的局；不接，线索便断了。'],
      opts:[
       {txt:'🌑 接下令牌（业力 +5）',cls:'danger',fx:{karma:5,flag:{moToken:1}}},
       {txt:'🕵️ 只探不接，记下密会地点',fx:{insight:1,once:'sq_mozong_a'}},
     ]},
     {type:'kill',param:2,hint:'密会之前，先清理前哨的暗桩——击败 2 名魔道斥候。',go:'map'},
     {type:'story',title:'传递密信',lines:['密会上，魔道统领交给你一封密信：「送去幽冥教。若泄漏半个字，你知道后果。」','信封上的火漆，印着与古战遗信上一模一样的魔纹——叛徒，果然是他。'],
      opts:[
       {txt:'📜 原封不动，送出密信（卧底线加深）',cls:'danger',fx:{karma:5,flag:{spyDeep:1}}},
       {txt:'🕊️ 截下密信，连夜送去正道',fx:{merit:5,flag:{traitorCaught:1}}},
     ]},
   ],
   reward:{stones:200,title:'卧底'}},
  {id:'sq_vine',icon:'🌉',title:'幽谷藤桥',area:'valley',summary:'一座将断的藤桥，一段过桥人的承诺。',
   start:{visits:['valley',2]},
   steps:[
     {type:'story',title:'藤桥将断',lines:['幽谷藤桥年久失修，桥身只剩几股老藤。一个背柴的樵夫在桥头踌躇：「过了桥，就是我家。」','你自告奋勇：「我替你过去。」'],opts:[
       {txt:'🪢 加固藤桥，扶樵夫过桥',cls:'primary',fx:{merit:2}},
     ]},
     {type:'kill',param:2,hint:'桥下溪涧有妖兽出没——击败 2 名妖兽，护住这段山路。',go:'map'},
     {type:'story',title:'灵藤之种',lines:['樵夫千恩万谢，从怀里掏出一枚青翠的藤种：「这是我家祖传的灵藤种，种在洞府，年年可收灵藤。」','你接过种子，仿佛握住了山野的一缕生机。'],opts:[
       {txt:'🌱 郑重收下',cls:'primary',fx:{mat:{sherb:1},insight:1,once:'sq_vine'}},
     ]},
   ],
   reward:{stones:150}},
  {id:'sq_crane',icon:'🕊️',title:'灵鹤衔书',area:'cliff',summary:'断魂崖上，一只灵鹤衔来半卷残书。',
   start:{visits:['cliff',2]},
   steps:[
     {type:'story',title:'鹤来',lines:['断魂崖雾气未散，一只丹顶灵鹤落在你肩头，衔着一卷残书，书角焦黑。','鹤鸣一声，像是催促。'],opts:[
       {txt:'📜 接下残书',cls:'primary',fx:{insight:1}},
     ]},
     {type:'collectMat',param:'sherb',need:2,hint:'残书记着一种药引——集齐 2 株灵草，助鹤疗伤。',go:'map'},
     {type:'story',title:'丹方线索',lines:['你将灵草碾碎喂给灵鹤，它振翅而起，在你头顶盘旋三匝。','残书尾页竟亮出一行小字：「青焰丹，需灵鹤羽为引。」——一条丹方线索，就此入怀。'],opts:[
       {txt:'🪶 收好丹方线索',cls:'primary',fx:{mat:{jade:1},insight:1,once:'sq_crane'}},
     ]},
   ],
   reward:{stones:300}},
  {id:'sq_tianjue',icon:'📜',title:'天衍遗策',area:'ruin',summary:'古战场深处的铜匣里，藏着一页天衍经的残策。',
   start:{visits:['ruin',3]},
   steps:[
     {type:'story',title:'残影托信',lines:['第三回到古战场，一处焦土下露出半截铜匣。战魂的残影浮现：「三百年前我埋下此匣，等的就是天衍经的传人。」','「匣中是一页残策——天衍经第三卷的开篇。持之可解祭坛禁制，亦可辨魔修真身。」'],opts:[
       {txt:'📜 郑重取出残策',cls:'primary',fx:{insight:1}},
     ]},
     {type:'kill',param:3,hint:'魔潮斥候正搜山寻此匣——击败 3 名敌人，护住遗策。',go:'map'},
     {type:'story',title:'残策入怀',lines:['你将残策贴身收好，焦土之上风声渐歇。','战魂残影散去前低语：「记住——天衍经的最后一页，不在书里，在人心里。」'],opts:[
       {txt:'🤝 向焦土郑重一礼',cls:'primary',fx:{merit:3,insight:1,once:'sq_tianjue'}},
     ]},
   ],
   reward:{stones:250,mat:{jade:1}}},
];
/* 主线/支线对账：校验用（章节步骤数 / 支线步骤数） */
function questCoverage(){
  return {
    mainChapters:MAIN_STORY.length,
    mainSteps:MAIN_STORY.reduce((a,c)=>a+c.steps.length,0),
    sideQuests:SIDE_QUESTS.length,
    sideSteps:SIDE_QUESTS.reduce((a,c)=>a+c.steps.length,0),
    storySteps:MAIN_STORY.reduce((a,c)=>a+c.steps.filter(s=>s.type==='story').length,0)+SIDE_QUESTS.reduce((a,c)=>a+c.steps.filter(s=>s.type==='story').length,0),
  };
}
