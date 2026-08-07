/* ======================================================
  仙途 · 内容批次 B09 新支线 ×10（v96 收官）
  只 push。id 前缀 sq_b09_
  每条 2-3 步（story + 行动），连接 ≥2 旧系统
====================================================== */
'use strict';
(function(){
  if(typeof SIDE_QUESTS==='undefined'||!Array.isArray(SIDE_QUESTS))return;
  SIDE_QUESTS.push(
    {id:'sq_b09_qiaotou',icon:'🎣',title:'桥头旧约',area:'near',summary:'老翁守着一枚玉坠，等了四十年。',
     start:{visits:['near',3]},
     steps:[
       {type:'story',title:'桥头老翁',lines:['石桥头，一个白发老翁坐在桥墩上，摩挲着一枚温润的玉坠：「这是我师父留下的。他说，等一个能解开玉坠机关的人。」','老翁把玉坠递给你：「你灵光内蕴，怕是那有缘人。」'],opts:[
         {txt:'🔍 接过玉坠端详',cls:'primary',fx:{merit:1}},
       ]},
       {type:'insight',param:1,hint:'以悟性破解玉坠机关——获得一次顿悟。',go:'cult'},
       {type:'story',title:'玉坠开启',lines:['你于灵光乍现间以神识探入玉坠，机括应声而开——里面是一卷泛黄的剑谱。','老翁老泪纵横：「四十年了……师父，你的剑谱，终于有了传人。」'],opts:[
         {txt:'📜 收下剑谱',cls:'primary',fx:{merit:2,insight:1,once:'sq_b09_qiaotou'}},
       ]},
     ],
     reward:{insight:1,stones:120}},
    {id:'sq_b09_chapeng',icon:'🍵',title:'茶棚往事',area:'forest',summary:'老板娘茶棚下埋着一坛三十年的女儿红。',
     start:{visits:['forest',3]},
     steps:[
       {type:'story',title:'茶棚老板娘',lines:['你常来喝茶，老板娘今日却欲言又止：「小兄弟，我年轻时也是个修士……后来为一人弃了仙途。」','她掀开茶棚地板：「这坛女儿红埋了三十年。他说会回来娶我——你再帮我看看，他还会回来吗？」'],opts:[
         {txt:'🍵 斟一杯茶，听她讲完',cls:'primary',fx:{merit:2}},
       ]},
       {type:'talk',param:3,hint:'多方打听当年那位修士的下落（交谈 3 次）。',go:'social'},
       {type:'story',title:'三十年的等待',lines:['你终于打听到：那位修士三十年前便在渡劫中身陨，只留下一句话：「告诉她，别等了。」','你把话带到。老板娘沉默良久，忽然笑了，把女儿红拍开：「那就不等了——这坛酒，请你喝。」'],opts:[
         {txt:'🍶 陪她饮尽这坛酒',cls:'primary',fx:{merit:3,mood:5,once:'sq_b09_chapeng'}},
       ]},
     ],
     reward:{stones:150,cha:1}},
    {id:'sq_b09_huofeng',icon:'⚒️',title:'炉火余温',area:'hill',summary:'铁匠铺炉火不熄，只为再打一柄剑。',
     start:{visits:['hill',3]},
     steps:[
       {type:'story',title:'铁匠的心愿',lines:['铁匠铺里，老师傅捶打着坯铁：「我年轻时答应亡妻，为她打一柄「凤鸣剑」。可惜火候总差一线——差一味寒玉铁。」','他望着你：「你若能寻来寒玉，我便把压箱底的锤法传你。」'],opts:[
         {txt:'🤝 应下寻玉',cls:'primary',fx:{merit:1}},
       ]},
       {type:'collectMat',param:'jade',count:2,hint:'收集 2 块寒玉，交与铁匠。',go:'map'},
       {type:'story',title:'凤鸣剑成',lines:['炉火足足烧了七天七夜。第八日清晨，一声清越剑鸣响彻山野——凤鸣剑成。','老师傅捧着剑，老泪纵横：「老婆子，你看，成了。」他执意把锤法口诀传你。'],opts:[
         {txt:'🔨 学得锤法',cls:'primary',fx:{insight:1,mat:{iron:2},once:'sq_b09_huofeng'}},
       ]},
     ],
     reward:{stones:120,mat:{jade:1}}},
    {id:'sq_b09_qiushi',icon:'🎼',title:'寻琴人',area:'valley',summary:'琴师走后，有人循着琴音追来。',
     start:{visits:['valley',3]},
     steps:[
       {type:'story',title:'月下访客',lines:['这一夜，灵溪谷外来了个背剑的少年，见你便问：「听说这里的琴师，弹得一手《广陵散》？」','他自称是琴师的故人之徒：「师伯说过，若听到琴音，便来寻他。」'],opts:[
         {txt:'🎶 如实相告琴师已去',cls:'primary',fx:{merit:1}},
       ]},
       {type:'talk',param:2,hint:'与少年交谈，弄清他与琴师的渊源（交谈 2 次）。',go:'social'},
       {type:'story',title:'琴剑之约',lines:['少年听完前因后果，抱剑久久不语：「原来师伯等的人，从来不是信使。」','他朝谷中深揖一礼，转身离去前留下一枚琴徽：「若见师伯，告诉他——故人之后，剑已大成。」'],opts:[
         {txt:'🪕 收下琴徽',cls:'primary',fx:{merit:2,insight:1,once:'sq_b09_qiushi'}},
       ]},
     ],
     reward:{insight:1,stones:100}},
    {id:'sq_b09_huxian',icon:'🦊',title:'狐族信物',area:'forest',summary:'白狐衔来的玉牌，牵出狐族一桩旧案。',
     start:{visits:['forest',3]},
     steps:[
       {type:'story',title:'白狐引路',lines:['那只白狐再次出现，这次它咬着一枚玉牌，引你深入林间——林深处，有一座被藤蔓吞没的狐族祠堂。','祠堂供桌上放着一封兽皮信，墨迹斑驳。'],opts:[
         {txt:'📜 展开兽皮信',cls:'primary',fx:{merit:1}},
       ]},
       {type:'explore',param:2,hint:'在暮色深林探索 2 次，寻找狐族遗失的镇族印。',go:'map'},
       {type:'story',title:'镇族印归位',lines:['你在深林古潭底寻回那枚青铜镇族印。白狐化作人形，盈盈下拜：「三十年前族人内乱，此印遗失，族中灵气日衰。」','她将信物收入祠堂，回望你时眼中有光：「此恩，狐族永记。」'],opts:[
         {txt:'🦊 还礼：「举手之劳」',cls:'primary',fx:{merit:3,luck:1,once:'sq_b09_huxian'}},
       ]},
     ],
     reward:{merit:2,mat:{sherb:1}}},
    {id:'sq_b09_canfang',icon:'📖',title:'半页丹方',area:'abyss',summary:'古修手札缺了半页，丹方不全，药性难成。',
     start:{visits:['abyss',3]},
     steps:[
       {type:'story',title:'丹方之缺',lines:['你在禁地石壁夹缝里拾到半页残卷——字迹与古修手札同源，却只记着丹方后半：缺了君臣佐使的头一味。','石壁上刻着一行小字：「余以一生寻此丹方之首，未果。」'],opts:[
         {txt:'🔍 记下残卷内容',cls:'primary',fx:{insight:1}},
       ]},
       {type:'craft',param:2,hint:'炼制 2 次丹药，以丹道补全丹方之首。',go:'craft'},
       {type:'story',title:'丹方补全',lines:['你反复推演，终于以一味「寒玉引」补全丹方之首。残卷上的字迹竟微微发光，自行补全了整张丹方。','这是上古「凝魂丹」的完整丹方——传说可凝神魂、续命元。'],opts:[
         {txt:'⚗️ 收入丹经',cls:'primary',fx:{insight:1,merit:2,once:'sq_b09_canfang'}},
       ]},
     ],
     reward:{insight:1,stones:150}},
    {id:'sq_b09_keep',icon:'🪦',title:'无名之墓',area:'ruin',summary:'古战场那座无名墓，碑文只剩半句。',
     start:{visits:['ruin',3]},
     steps:[
       {type:'story',title:'半句碑文',lines:['古战场深处立着一座无名墓，墓碑只剩半句：「吾名已忘，唯记……」后半截被战火削去。','墓前石坛上放着一只旧碗，碗里盛着半碗黄土。'],opts:[
         {txt:'🙏 添一抔土，拭净碑面',cls:'primary',fx:{merit:2}},
       ]},
       {type:'kill',param:3,hint:'古战场战魂不散——击败 3 名敌人，镇其怨气。',go:'map'},
       {type:'story',title:'碑文重现',lines:['怨气消散后，墓碑上的残字竟缓缓浮现：「吾名已忘，唯记此战为苍生。」','风过古战场，千军万马的虚影齐齐朝这座墓俯首——原来无名者，才是此战之首。'],opts:[
         {txt:'🫡 长揖一礼',cls:'primary',fx:{merit:4,insight:1,once:'sq_b09_keep'}},
       ]},
     ],
     reward:{merit:3,title:'无名英雄'}},
    {id:'sq_b09_wan',icon:'🥣',title:'破碗藏图',area:'near',summary:'老乞丐那只破碗，碗底另有乾坤。',
     start:{visits:['near',3]},
     steps:[
       {type:'story',title:'碗底玄机',lines:['老乞丐咂咂嘴：「后生，你看我这碗，是不是比寻常碗厚了些？」','他把碗翻过来——碗底夹层里，露出一角泛黄的舆图。'],opts:[
         {txt:'🔍 细看碗底夹层',cls:'primary',fx:{merit:1}},
       ]},
       {type:'explore',param:3,hint:'循舆图在青石小径探索 3 次，寻找图中标记。',go:'map'},
       {type:'story',title:'图中旧藏',lines:['你按舆图找到山溪拐角的一块青石——石下埋着一只陶罐，罐里是一袋灵石与一卷残经。','老乞丐笑得见牙不见眼：「这罐子是我师父埋的，说是留给有缘人。你拿去吧。」'],opts:[
         {txt:'📦 收下陶罐',cls:'primary',fx:{stones:200,insight:1,once:'sq_b09_wan'}},
       ]},
     ],
     reward:{stones:150,insight:1}},
    {id:'sq_b09_binggong',icon:'❄️',title:'冰宫旧信',area:'cliff',summary:'冰宫仙子的一封信，寄往三十年前的雪山。',
     start:{visits:['cliff',3]},
     steps:[
       {type:'story',title:'雪山来信',lines:['冰宫仙子拦下你，递来一封冰封的信：「三十年了，这封信始终送不出去——寄信人已随雪崩而去。」','收信人曾是雪山之巅的守灯人，如今灯还在，人却早已不在。'],opts:[
         {txt:'📜 接下送信之托',cls:'primary',fx:{merit:2}},
       ]},
       {type:'collectMat',param:'jade',count:2,hint:'取 2 块寒玉，作冰封信匣，保书信不腐。',go:'map'},
       {type:'story',title:'守灯人',lines:['你登上雪山之巅，将信放在长明灯下。灯焰一跳，信纸自行展开——只有一行字：「灯不灭，等君归。」','冰宫仙子闻之良久：「原来这盏灯，是替他守的。」她对着雪山，深鞠一躬。'],opts:[
         {txt:'🕯️ 替信添一缕灯油',cls:'primary',fx:{merit:3,insight:1,once:'sq_b09_binggong'}},
       ]},
     ],
     reward:{merit:2,mat:{jade:1}}},
    {id:'sq_b09_zhang',icon:'🧮',title:'旧账本',area:'hill',summary:'行商大贾的旧账本上，有一笔三十年的亏欠。',
     start:{visits:['hill',3]},
     steps:[
       {type:'story',title:'一笔旧账',lines:['行商大贾翻出一本发黄的账本：「这笔账欠了三十年，当年送货的镖队在山里失了踪，货没了，人也没了。」','他合上账本：「我总梦见他们在山里等着。」'],opts:[
         {txt:'🤝 应下走一趟镖路',cls:'primary',fx:{merit:1}},
       ]},
       {type:'talk',param:2,hint:'向山民与猎户打听三十年前镖队的下落（交谈 2 次）。',go:'social'},
       {type:'story',title:'镖队遗物',lines:['你在荒山坳里寻到镖队的遗物：一箱锈蚀的货，和一座垒起的石坟。','你依诺把货送回，大贾当众开箱，箱中是三十年前的山货——他红着眼眶，把整箱货钱都散给了山中猎户。'],opts:[
         {txt:'🧮 见证这桩旧账两清',cls:'primary',fx:{merit:3,stones:100,once:'sq_b09_zhang'}},
       ]},
     ],
     reward:{stones:150,merit:2}},
  );
})();
