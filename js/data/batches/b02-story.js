/* ======================================================
  仙途 · 内容批次 B02 通用故事（v92）
  只 push。id 前缀 b02_
  calm/herb/rare/epic/danger 共 +24
====================================================== */
'use strict';
(function(){
  if(typeof STORY_EVENTS==='undefined'||!Array.isArray(STORY_EVENTS))return;
  STORY_EVENTS.push(
    /* —— calm ×5 —— */
    {id:'b02_calm_1',cat:'calm',weight:2,title:'渡口炊烟',t:'渡口人家升起炊烟，锅里咕嘟着野菜粥。船家招呼你：「喝一碗再走？」',opts:[{txt:'🥣 喝碗热粥再上路',cls:'primary',fx:{mood:4,merit:1}},{txt:'🙏 谢过，继续赶路',fx:{cult:40}}]},
    {id:'b02_calm_2',cat:'calm',weight:2,title:'石桥听蛙',t:'雨后石桥下蛙声一片。你靠着桥栏，忽然觉得这喧闹比闭关时的寂静更近大道。',opts:[{txt:'🐸 听蛙半晌',cls:'primary',fx:{mood:5}},{txt:'🧘 借蛙声入定',fx:{cult:70}}]},
    {id:'b02_calm_3',cat:'calm',weight:2,title:'村塾读书声',t:'路过村塾，孩童齐声朗读「天地玄黄」。你驻足片刻，想起自己也曾是凡人。',opts:[{txt:'📖 在窗外听完一课',cls:'primary',fx:{insight:1,once:'b02_calm_3'}},{txt:'🎁 留下几文钱作束脩',fx:{merit:2}}]},
    {id:'b02_calm_4',cat:'calm',weight:2,title:'陶匠拉坯',t:'窑边陶匠拉着泥坯，转轮吱呀。泥在他指间渐渐成器。',opts:[{txt:'🏺 驻足观其成器',cls:'primary',fx:{mood:3,cult:50}},{txt:'💬 请教「器以载道」',fx:{insight:1,once:'b02_calm_4'}}]},
    {id:'b02_calm_5',cat:'calm',weight:2,title:'雪人未化',t:'春雪将融，村口雪人歪着脑袋，胡萝卜鼻子掉在泥里。',opts:[{txt:'🥕 替它把鼻子插回去',cls:'primary',fx:{merit:1,mood:3}},{txt:'📸 看一眼，记下这人间小景',fx:{cult:45}}]},
    /* —— herb ×5 —— */
    {id:'b02_herb_1',cat:'herb',weight:2,title:'崖缝灵芝',t:'半崖石缝里探出一柄小灵芝，伞盖未全开，药香却已扑鼻。',opts:[{txt:'🧗 小心采下',cls:'primary',fx:{mat:{sherb:1,herb:1}}},{txt:'🙏 等它长成再来',fx:{merit:1}}]},
    {id:'b02_herb_2',cat:'herb',weight:2,title:'药农换种',t:'药农摊开几包草籽：「换你一株灵草种，如何？」',opts:[{txt:'🌱 换种回家',cls:'primary',fx:{mat:{herb:3}}},{txt:'🤝 白送他几味常用药',fx:{merit:2,mat:{herb:1}}}]},
    {id:'b02_herb_3',cat:'herb',weight:2,title:'夜露药苗',t:'月光下药苗叶尖凝着夜露，老辈说此时采的草「带月华」。',opts:[{txt:'🌙 趁夜采一篮',cls:'primary',fx:{mat:{herb:2,sherb:1}}},{txt:'🪷 只取露水入瓶',fx:{mat:{herb:1},cult:30}}]},
    {id:'b02_herb_4',cat:'herb',weight:2,title:'虫蛀药圃',t:'一片药圃被虫蛀得七零八落，药农蹲在田埂上叹气。',opts:[{txt:'🐛 帮忙捉虫半日',cls:'primary',fx:{merit:2,mat:{herb:2}}},{txt:'📜 教他驱虫符简法',fx:{merit:1,insight:1,once:'b02_herb_4'}}]},
    {id:'b02_herb_5',cat:'herb',weight:2,title:'古藤灵液',t:'粗如臂的古藤被风折断，断口渗出淡金色汁液，气味清苦。',opts:[{txt:'🫙 以瓶接取灵液',cls:'primary',fx:{mat:{sherb:1},cult:40}},{txt:'🩹 替古藤包扎断口',fx:{merit:2}}]},
    /* —— rare ×5 —— */
    {id:'b02_rare_1',cat:'rare',weight:2,title:'沉水古铃',t:'溪底隐约有金属反光。捞起一看，是一枚锈蚀的古铃，摇时无声却令心神一静。',opts:[{txt:'🔔 收下古铃',cls:'primary',fx:{item:{name:'聚灵玉佩',type:'trinket',quality:2,bonus:1,desc:'溪底捞起的古铃改作玉佩，佩之神安。',sell:220}}},{txt:'🙏 洗净放回溪中',fx:{merit:2,luck:1,once:'b02_rare_1'}}]},
    {id:'b02_rare_2',cat:'rare',weight:2,title:'石室残阵',t:'山腹石室中残留半个阵盘，阵纹黯淡，中心嵌着一粒碎玉。',opts:[{txt:'🔷 取下碎玉',cls:'primary',fx:{mat:{jade:1},stones:80}},{txt:'📐 临摹阵纹',fx:{insight:1,once:'b02_rare_2'}}]},
    {id:'b02_rare_3',cat:'rare',weight:2,title:'狐火引路',t:'三团狐火在林间跳跃，似在引路。深处隐有药香。',opts:[{txt:'🦊 跟随狐火',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🚶 不入深处',fx:{merit:1}}]},
    {id:'b02_rare_4',cat:'rare',weight:2,title:'古剑匣',t:'枯树洞中藏着一只剑匣，匣锁已锈死，匣内隐隐有剑鸣。',opts:[{txt:'🗡️ 破匣取剑一观',cls:'primary',fx:{fight:{name:'匣中剑意',atk:8,def:3,hp:42,elem:'metal',style:'guard'},winFx:{mat:{iron:2},stones:100}}},{txt:'🔒 不动剑匣，记下方位',fx:{insight:1,once:'b02_rare_4'}}]},
    {id:'b02_rare_5',cat:'rare',weight:2,title:'天外陨铁',t:'昨夜火光落地处，焦土中埋着一块黝黑陨铁，触手冰凉。',opts:[{txt:'⛏️ 掘出陨铁',cls:'primary',fx:{mat:{iron:2,jade:1}}},{txt:'🙏 祭一炷香再取',fx:{merit:1,mat:{iron:1}}}]},
    /* —— epic ×5 —— */
    {id:'b02_epic_1',cat:'epic',weight:1,title:'道韵残章',t:'风卷来半页金箔残章，字迹入眼即化，唯「一念」二字烙入识海。',opts:[{txt:'📜 闭目消化道韵',cls:'primary',fx:{insight:2,once:'b02_epic_1'}},{txt:'🧘 就地打坐三日',fx:{cult:700}}]},
    {id:'b02_epic_2',cat:'epic',weight:1,title:'灵根新芽',t:'你在灵泉边打坐，忽觉丹田微痒——灵根竟生出一丝新芽。',opts:[{txt:'🌱 小心护芽',cls:'primary',fx:{root:2,cult:200}},{txt:'💧 以灵泉浇灌',fx:{root:3}}]},
    {id:'b02_epic_3',cat:'epic',weight:1,title:'古修馈礼',t:'禁地边缘，一缕残魂向你一揖，化作光点没入你掌心，留下温热。',opts:[{txt:'🙏 回礼致谢',cls:'primary',fx:{insight:1,luck:1,once:'b02_epic_3'}},{txt:'💎 运功消化馈礼',fx:{cult:600,stones:150}}]},
    {id:'b02_epic_4',cat:'epic',weight:1,title:'天河倒影',t:'高山湖面映出整条天河。你伸手触水，指尖竟沾上点点星光。',opts:[{txt:'✨ 引星光入体',cls:'primary',fx:{root:2,insight:1,once:'b02_epic_4'}},{txt:'🌌 跪拜天河',fx:{merit:4,luck:1}}]},
    {id:'b02_epic_5',cat:'epic',weight:1,title:'道果清香',t:'崖顶一株无名果树只结一枚果，清香十里。果皮上天然生着道纹。',opts:[{txt:'🍑 摘果服下',cls:'primary',fx:{root:2,cult:500}},{txt:'🌱 取一粒种子带走',fx:{luck:1,insight:1,once:'b02_epic_5'}}]},
    /* —— danger ×4 —— */
    {id:'b02_danger_1',cat:'danger',weight:2,title:'黑风寨',t:'山口竖着「此路是我开」的木牌，数名黑衣修士拦住去路。',opts:[{txt:'⚔️ 杀开一条路',cls:'danger',fx:{fight:{name:'黑风寨众',atk:8,def:3,hp:44,elem:'dark',style:'aggressive'},winFx:{stones:160}}},{txt:'💎 留下买路财（180 灵石）',fx:{stones:-180}}]},
    {id:'b02_danger_2',cat:'danger',weight:2,title:'噬魂雾',t:'谷中灰雾蠕动如活物，踏入者神识隐隐刺痛。',opts:[{txt:'🛡️ 以灵力开路强闯',cls:'danger',fx:{fight:{name:'噬魂雾',atk:7,def:1,hp:36,elem:'dark',style:'poison'},winFx:{mat:{jade:1}}}},{txt:'↩️ 原路退回',fx:{hp:-12}}]},
    {id:'b02_danger_3',cat:'danger',weight:2,title:'地裂',t:'脚下轰然开裂，一道深渊横在眼前，对岸隐约有灵光。',opts:[{txt:'💨 御气飞掠',cls:'danger',fx:{fight:{name:'裂隙罡风',atk:7,def:2,hp:38,elem:'wind',style:'rapid'},winFx:{stones:90}}},{txt:'🪢 寻藤蔓攀越',fx:{hp:-14}}]},
    {id:'b02_danger_4',cat:'danger',weight:2,title:'夺宝散修',t:'你刚拾起一枚灵石原矿，三名散修便围了上来，眼中全是贪婪。',opts:[{txt:'⚔️ 护矿而战',cls:'danger',fx:{fight:{name:'夺宝散修',atk:9,def:3,hp:46,elem:'metal',style:'burst'},winFx:{stones:220}}},{txt:'💎 扔出矿石脱身',fx:{stones:40}}]}
  );
})();
