/* ======================================================
  仙途 · 宗门事件池（v93 B04 数据化）
  说明：sectEvent() 从本池随机读取（talkModal 演出，同门登场），
        选项效果由 fx 解释器 runSectFx 执行。
  fx 键白名单：
    favor   : 同门好感（favorChange）
    bond    : 羁绊（addBond）
    contrib / contribVal : 贡献点 / 贡献值
    merit   : 功德
    insight : 悟性（addWis）
    roll    : {attr,dc,prelude?,hit,miss,hitFx,missFx}
    combat  : {name,atk,def,hp,elem,style,winTxt?,winFx?,loseTxt?}
    stones/cult/mood : 数值
  文本占位符：{p} = 随机同门名，{s} = 宗门名
====================================================== */
'use strict';
const SECT_EVENTS=[
  /* ============ 门中事宜（9 新 + 3 迁移 = 12） ============ */
  {id:'b04_s_e01',t:'{p} 鬼鬼祟祟在藏经阁外徘徊，怀里鼓鼓囊囊，见你看来转身便走。',opts:[
    {txt:'🕵️ 上前盘问',fx:{roll:{attr:'int',dc:13,prelude:'你拦住{p}：',hit:'原来只是想借本功法抄录，怕被责罚。你替他通融登记，{p} 千恩万谢。',miss:'{p} 心虚跑掉，你只看到一片衣角。',hitFx:{merit:1,contrib:5},missFx:{}}}},
    {txt:'👀 记下此事，禀报执事',fx:{merit:1,contrib:3}},
  ]},
  {id:'b04_s_e02',t:'长老寿宴将至，掌事弟子正为贺礼发愁：「送轻了不像话，送重了库房吃紧……」',opts:[
    {txt:'🎁 出主意：合全门之力集一份厚礼',fx:{roll:{attr:'cha',dc:13,prelude:'你提出倡议，众人纷纷响应：',hit:'寿宴当日贺礼由你牵头献上，长老抚须而笑，连称「门中齐心」。',miss:'大家兴致缺缺，你只好自己多添了些。',hitFx:{contrib:8,favor:3},missFx:{contrib:3}}}},
    {txt:'🍶 献上一坛自酿灵酒',fx:{stones:-40,contrib:4}},
  ]},
  {id:'b04_s_e03',t:'门中灵田一夜之间被毁了半片，田埂上留着巨大的爪印。',opts:[
    {txt:'🕵️ 循爪印追查',fx:{roll:{attr:'agi',dc:14,prelude:'你沿爪印追进山林：',hit:'在一处洞穴堵住了作乱的妖兽，一场恶战后将其逐走，灵田之祸遂解。',miss:'妖兽狡猾，你追丢了。只好回门上报。',hitFx:{combat:{name:'毁田妖兽',atk:6,def:3,hp:35,elem:'wood',style:'burst'},contrib:6,merit:2},missFx:{}}}},
    {txt:'📜 上报长老，申请布阵防护',fx:{contrib:4}},
  ]},
  {id:'b04_s_e04',t:'丹房里传出一声闷响，紧接着浓烟滚滚——{p} 炼丹炸炉了，正灰头土脸地咳嗽。',opts:[
    {txt:'🤣 上前帮忙收拾，递上清水',fx:{roll:{attr:'cha',dc:12,prelude:'你笑着递过水囊：',hit:'{p} 接过水囊灌了几口，苦笑道谢，你顺手指点了他几个控火要诀。',miss:'{p} 羞愧难当，你安慰了几句，他总算缓过来。',hitFx:{favor:3,contrib:4},missFx:{favor:2}}}},
    {txt:'😏 揶揄两句：「丹房要重建咯」',fx:{favor:-1}},
  ]},
  {id:'b04_s_e05',t:'山门外来了个新弟子，怯生生地攥着拜帖，不知该往哪去。',opts:[
    {txt:'🧭 亲自引路，交代门中规矩',fx:{roll:{attr:'cha',dc:12,prelude:'你耐心引路：',hit:'新弟子记下你的恩情，日后处处以你为榜样。',miss:'你讲得太快，他似懂非懂，但总算安顿下来。',hitFx:{merit:2,contrib:3},missFx:{merit:1}}}},
    {txt:'🙋 指个方向便走',fx:{}},
  ]},
  {id:'b04_s_e06',t:'入夜，演武场传来阵阵金石之声——有人在偷偷加练，被你撞见了。',opts:[
    {txt:'🥊 下场陪练几招',fx:{roll:{attr:'str',dc:13,prelude:'你下场接招：',hit:'几招下来，对方受益匪浅，坦言是你在榜上的下一名对手。',miss:'对方身手竟在你之上，你讨了个没趣。',hitFx:{favor:4,cult:60},missFx:{cult:30}}}},
    {txt:'👏 站桩看了会儿便走',fx:{cult:20}},
  ]},
  {id:'b04_s_e07',t:'宗门法会，各峰弟子齐聚听道。讲经长老讲到一半，忽然点名让你作答。',opts:[
    {txt:'🧘 从容作答，引经据典',fx:{roll:{attr:'int',dc:14,prelude:'你起身作答：',hit:'你答得精妙，长老抚掌称善，满座皆惊。',miss:'你支吾半晌，长老叹口气让你坐下，面上无光。',hitFx:{contrib:8,insight:1},missFx:{}}}},
    {txt:'🙏 如实道：「弟子愚钝，请长老开示」',fx:{insight:1,merit:1}},
  ]},
  {id:'b04_s_e08',t:'库房盘点，发现少了两瓶聚灵丹。执事弟子脸色难看，众人面面相觑。',opts:[
    {txt:'🕵️ 主动请缨查证',fx:{roll:{attr:'int',dc:14,prelude:'你连夜查账：',hit:'查明是外门弟子偷拿，你劝其自首，追回丹药，息事宁人。',miss:'查无实据，你只得如实回报，气氛微妙。',hitFx:{contrib:6,merit:2},missFx:{}}}},
    {txt:'🤷 不掺和这浑水',fx:{}},
  ]},
  {id:'b04_s_e09',t:'传功堂要选一名弟子领新入门功法试炼，长老把目光投向了你。',opts:[
    {txt:'🗡️ 自荐领衔，带队试炼',fx:{roll:{attr:'str',dc:13,prelude:'你上前领命：',hit:'你带队完成试炼，新弟子们受益匪浅，长老颇为满意。',miss:'试炼凶险，你勉强带队折返，多少有些狼狈。',hitFx:{contrib:7,favor:3},missFx:{contrib:2}}}},
    {txt:'🙇 谦让：「弟子资历尚浅」',fx:{merit:1}},
  ]},
  /* —— 迁移：演武劝和 —— */
  {id:'b04_s_m01',t:'后山演武场上，两名同门切磋到一半起了真火，其中一人已拔剑出鞘。',opts:[
    {txt:'🛡️ 上前劝和',fx:{roll:{attr:'cha',dc:14,prelude:'你横身挡在两人之间：',hit:'你三言两语化解干戈，众人对你愈发敬重。',miss:'两人打得兴起，你被误伤了一下（气血-5%）。',hitFx:{merit:1,favor:4},missFx:{hp:-5}}}},
    {txt:'⚔️ 以武压场',fx:{roll:{attr:'str',dc:15,prelude:'你纵身跃入场中：',hit:'你一招分开两人，技惊四座（正道声望+3）。',miss:'你出手太重，反被两人联手逼退，面子上有些挂不住。',hitFx:{fame:3},missFx:{}}}},
    {txt:'👀 站在一旁看热闹',fx:{}},
  ]},
  /* —— 迁移：弟子遇险 —— */
  {id:'b04_s_m02',t:'一名外门弟子采药时误入妖兽领地，此刻正被围在山坳里。',opts:[
    {txt:'🦸 仗义出手相救',fx:{combat:{name:'山中妖兽',atk:6,def:2,hp:30,elem:'wood',style:'guard',winTxt:'你救出同门，对方千恩万谢。',loseTxt:'妖兽凶猛，你拼死才把同门背出来，自己也挂了彩。',winFx:{merit:3}}}},
    {txt:'📜 通报长老，请宗门定夺',fx:{merit:1,contribVal:30}},
  ]},
  /* —— 迁移：围炉论道 —— */
  {id:'b04_s_m03',t:'入夜，门中几名弟子围炉夜话，正论到「道为何物」。',opts:[
    {txt:'🧘 坐下参与论道',fx:{roll:{attr:'int',dc:14,prelude:'你于炉边落座：',hit:'你一言点醒众人，自己也悟得一线天机（悟性+1，修为+80）。',miss:'你听得入神，插不上话，却也记下几句。',hitFx:{insight:1,cult:80},missFx:{cult:20}}}},
    {txt:'🍶 温一壶酒与大家同饮',fx:{mood:5,favor:3}},
  ]},
  /* ============ 任务链（8 新） ============ */
  {id:'b04_s_t01',t:'宗门接下一单押运灵矿的差事，长老点了几名弟子随行，你也在列。',opts:[
    {txt:'🛡️ 主动请缨押尾',fx:{roll:{attr:'str',dc:13,prelude:'你押尾而行：',hit:'途中果然遇袭，你断后搏杀贼人，灵矿分毫未损。',miss:'贼人声东击西，被抢走一小箱，你深以为耻。',hitFx:{contrib:8,stones:60},missFx:{contrib:1}}}},
    {txt:'🤝 与同门结伴看护',fx:{contrib:4}},
  ]},
  {id:'b04_s_t02',t:'巡山任务轮到你。山道深处传来求救声，听声音像是采药人。',opts:[
    {txt:'🏃 循声赶去',fx:{combat:{name:'拦路山匪',atk:5,def:2,hp:28,elem:'metal',style:'aggressive',winTxt:'你击退山匪，救下采药人，对方千恩万谢。',loseTxt:'山匪人多势众，你护着采药人且战且退。',winFx:{merit:3,contrib:5}}}},
    {txt:'📣 先发信号再过去',fx:{merit:1,contrib:2}},
  ]},
  {id:'b04_s_t03',t:'长老命你护送一位前来讲学的贵客回山。途中贵客忽然问起你对道法的见解。',opts:[
    {txt:'💬 坦诚相告，不卑不亢',fx:{roll:{attr:'cha',dc:13,prelude:'你如实作答：',hit:'贵客赞你「后生可畏」，回山后在长老面前替你美言。',miss:'你答得浅了，贵客一笑而过。',hitFx:{contrib:6,favor:3},missFx:{contrib:2}}}},
    {txt:'🙏 谦虚道：「弟子尚在摸索」',fx:{merit:1}},
  ]},
  {id:'b04_s_t04',t:'门中丹房缺一味主药，长老把采药任务交给你：「山下幽谷有，但那里常有妖兽出没。」',opts:[
    {txt:'🌿 领命下山采药',fx:{roll:{attr:'agi',dc:14,prelude:'你入谷采药：',hit:'你避开妖兽，满载而归，丹房上下喜出望外。',miss:'你与妖兽周旋许久才得手，狼狈归山。',hitFx:{contrib:6,stones:40},missFx:{contrib:3}}}},
    {txt:'🧾 托人从坊市代购',fx:{stones:-60,contrib:2}},
  ]},
  {id:'b04_s_t05',t:'护山大阵出现松动，阵基处灵光不稳。长老命你前去查看。',opts:[
    {txt:'🔧 入阵检修',fx:{roll:{attr:'int',dc:14,prelude:'你循着阵纹排查：',hit:'你找到损毁的阵眼，以灵力补全，护山大阵重放光华。',miss:'阵势复杂，你险些被困，幸得同门接应。',hitFx:{contrib:7,insight:1},missFx:{}}}},
    {txt:'📜 记录异常，回报长老',fx:{contrib:3}},
  ]},
  {id:'b04_s_t06',t:'山脚村庄来报：夜里常有黑影掠过，家畜接连失踪。长老命你带队查探。',opts:[
    {txt:'🕵️ 夜伏村口守株待兔',fx:{combat:{name:'夜行妖物',atk:7,def:3,hp:38,elem:'dark',style:'rapid',winTxt:'你当场擒获作祟妖物，村民奔走相告。',loseTxt:'妖物狡诈，突围逃遁，你只好留下警示符。',winFx:{merit:4,contrib:6}}}},
    {txt:'🌙 布下陷阱，天明再查',fx:{contrib:3}},
  ]},
  {id:'b04_s_t07',t:'大比在即，门中气氛紧绷。长老唤你到跟前：「这几日，带带新入门的师弟师妹。」',opts:[
    {txt:'🥋 倾囊相授，陪练到底',fx:{roll:{attr:'cha',dc:13,prelude:'你带练数日：',hit:'师弟师妹们进步神速，大比上崭露头角，众人都念你的好。',miss:'你教得认真，奈何天赋有别，成绩平平。',hitFx:{favor:4,contrib:5},missFx:{favor:2}}}},
    {txt:'📖 指点几句便让他们自行摸索',fx:{contrib:2}},
  ]},
  {id:'b04_s_t08',t:'门中发现一名弟子私通外敌的线索，长老命你暗中查证。',opts:[
    {txt:'🕵️ 顺藤摸瓜',fx:{roll:{attr:'int',dc:15,prelude:'你悄然查证：',hit:'你坐实其罪证，为门中清除隐患，长老许你重赏。',miss:'打草惊蛇，线索断了，此事不了了之。',hitFx:{contrib:10,merit:2},missFx:{}}}},
    {txt:'🤝 先与那弟子当面谈一次',fx:{roll:{attr:'cha',dc:13,prelude:'你邀其夜谈：',hit:'竟是误会一场，对方主动交代，化干戈为玉帛。',miss:'对方讳莫如深，你只得如实回报。',hitFx:{contrib:5},missFx:{}}}},
  ]},
  /* ============ 大比（4 新） ============ */
  {id:'b04_s_b01',t:'宗门大比报名截止在即，同门们都在观望：「今年高手如云，你上不上？」',opts:[
    {txt:'🥊 报名参赛，扬我门威',fx:{contrib:3,flag:'bigSignUp'}},
    {txt:'🙈 先观望一轮，明年再战',fx:{}},
  ]},
  {id:'b04_s_b02',t:'大比前夕，演武场灯火通明。你睡不着，到场一看，{p} 正在那里独自挥汗。',opts:[
    {txt:'🤜 与{p}对练到深夜',fx:{roll:{attr:'str',dc:13,prelude:'你们切磋到月上中天：',hit:'几轮下来各有精进，互道「赛场上见」。',miss:'你状态不佳，被{p}压着打，只好悻悻收场。',hitFx:{favor:3,cult:70},missFx:{cult:30}}}},
    {txt:'🫖 提一壶茶过去，陪{p}说说话',fx:{favor:3}},
  ]},
  {id:'b04_s_b03',t:'大比落幕，你夺得好名次。同门簇拥上来道贺，闹着要你请客。',opts:[
    {txt:'🍻 大手一挥，山下摆酒请全门',fx:{stones:-80,favor:5,merit:1}},
    {txt:'🙏 笑称「侥幸」，把彩头散给后进弟子',fx:{favor:4,merit:2}},
  ]},
  {id:'b04_s_b04',t:'大比失利，你闷闷不乐地坐在后山。{p} 拎着两壶酒找了过来，什么也没说，放在你身边。',opts:[
    {txt:'🍶 接过酒壶，一饮而尽',fx:{roll:{attr:'wil',dc:12,prelude:'酒过三巡：',hit:'你释然一笑：「明年再来。」{p} 点头：「我陪你练。」',miss:'你越想越气，{p} 也不劝，就这么陪你坐了一夜。',hitFx:{favor:3,mood:8},missFx:{mood:4}}}},
    {txt:'🤝 拍拍{p}的肩：「谢了」',fx:{favor:2}},
  ]},
];
