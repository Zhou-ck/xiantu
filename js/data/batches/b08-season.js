/* ======================================================
  仙途 · 内容批次 B08 赛季主题 + 季节 + 年度（v95）
  只 push。id 前缀 b08_
  主题 +24（feng/lei/huo/shui 各 +6）/ 季节 +10 / 年度 +10
====================================================== */
'use strict';
(function(){
  /* —— 赛季主题 +24 —— */
  if(typeof THEME_EVENTS!=='undefined'&&Array.isArray(THEME_EVENTS)){
    THEME_EVENTS.push(
      /* feng +6 */
      {id:'b08_th_feng_1',theme:'feng',weight:2,title:'风眼悟道',t:'风季的风眼难得平静，你在风眼中央盘坐，四周狂风如墙，唯独此处一片空明。',opts:[{txt:'🧘 风眼入定',cls:'primary',fx:{insight:1,cult:100,once:'b08_th_feng_1'}},{txt:'🌪️ 逆风而行，磨炼身法',fx:{cult:80}}]},
      {id:'b08_th_feng_2',theme:'feng',weight:2,title:'风蚀石林',t:'风季过后，石林被风蚀出千奇百怪的形状，其中一块竟像极了一尊打坐的仙人。',opts:[{txt:'🗿 对石参悟',cls:'primary',fx:{insight:1,once:'b08_th_feng_2'}},{txt:'🪨 敲下一块风化石',fx:{mat:{iron:1}}}]},
      {id:'b08_th_feng_3',theme:'feng',weight:1,title:'风信子',t:'一株风信子被风连根拔起，滚到你脚边，花瓣却还完完整整。',opts:[{txt:'🌸 种回土里，压上一块石头',cls:'primary',fx:{merit:2}},{txt:'🫙 收下风信子作标本',fx:{mood:3}}]},
      {id:'b08_th_feng_4',theme:'feng',weight:1,title:'风磨坊',t:'山间的老风磨坊转得正欢，磨盘发出吱呀的声响，像在唱歌。',opts:[{txt:'🌾 帮忙磨一袋粮',cls:'primary',fx:{merit:1,mood:3}},{txt:'🎵 听磨坊的歌声',fx:{mood:4,cult:40}}]},
      {id:'b08_th_feng_5',theme:'feng',weight:1,title:'纸船',t:'一只纸船被风吹着，一路跌跌撞撞飞到你面前，船帆上画着一朵小云。',opts:[{txt:'✈️ 替它放飞到天上',cls:'primary',fx:{luck:1,once:'b08_th_feng_5'}},{txt:'📄 拆开看看',fx:{stones:40}}]},
      {id:'b08_th_feng_6',theme:'feng',weight:1,title:'风铃',t:'山寺檐角挂着一串风铃，风过时叮当作响，铃声里似有梵音。',opts:[{txt:'🛎️ 驻足听铃',cls:'primary',fx:{merit:1,mood:4}},{txt:'🧘 循铃入定',fx:{cult:90}}]},
      /* lei +6 */
      {id:'b08_th_lei_1',theme:'lei',weight:2,title:'雷后新晴',t:'雷雨过后，天边挂起一道彩虹，空气里满是泥土与雷电的气息。',opts:[{txt:'🌈 观虹悟道',cls:'primary',fx:{insight:1,cult:80,once:'b08_th_lei_1'}},{txt:'💧 收集雷后灵雨',fx:{mat:{herb:2}}}]},
      {id:'b08_th_lei_2',theme:'lei',weight:2,title:'引雷木',t:'一根焦黑的引雷木插在山巅，是雷季前修士立下的，此刻正滋滋冒着青烟。',opts:[{txt:'⚡ 以手触木，感受雷意',cls:'danger',fx:{fight:{name:'残余雷意',atk:8,def:1,hp:38,elem:'thunder',style:'burst'},winFx:{root:2}}},{txt:'🪵 收走引雷木',fx:{mat:{jade:1}}}]},
      {id:'b08_th_lei_3',theme:'lei',weight:1,title:'雷雨夜行',t:'雷雨夜赶路，闪电一道接一道，把前路照得忽明忽暗。',opts:[{txt:'🏃 借闪电赶路',cls:'primary',fx:{cult:90}},{txt:'🛡️ 寻岩洞避雨',fx:{mood:3}}]},
      {id:'b08_th_lei_4',theme:'lei',weight:1,title:'雷池',t:'雷季的低洼地积了一汪雷池，水面上跳动着细碎的雷弧。',opts:[{txt:'⚡ 引雷池淬体',cls:'danger',fx:{fight:{name:'雷池之怒',atk:9,def:1,hp:42,elem:'thunder',style:'burst'},winFx:{root:2,cult:60}}},{txt:'🫙 装一瓶雷池水',fx:{mat:{jade:1}}}]},
      {id:'b08_th_lei_5',theme:'lei',weight:1,title:'雷鼓',t:'闷雷滚滚如鼓点，一声紧似一声，像在为谁擂鼓助威。',opts:[{txt:'🥁 和着雷鼓练拳',cls:'primary',fx:{cult:100}},{txt:'🧘 听雷鼓入定',fx:{insight:1,once:'b08_th_lei_5'}}]},
      {id:'b08_th_lei_6',theme:'lei',weight:1,title:'避雷亭',t:'山巅立着一座石亭，匾额写着「避雷」二字，亭中却空无一人。',opts:[{txt:'🧘 亭中静坐观雷',cls:'primary',fx:{insight:1,cult:80,once:'b08_th_lei_6'}},{txt:'📜 记下匾额笔迹',fx:{mood:3}}]},
      /* huo +6 */
      {id:'b08_th_huo_1',theme:'huo',weight:2,title:'熔岩河',t:'火季的地缝里涌出熔岩，如赤红的河，缓慢而坚定地流向远方。',opts:[{txt:'🔥 循熔岩河而行',cls:'primary',fx:{mat:{iron:2}}},{txt:'🧘 观熔岩悟「静水流深」',fx:{insight:1,once:'b08_th_huo_1'}}]},
      {id:'b08_th_huo_2',theme:'huo',weight:2,title:'地火莲',t:'地缝火眼中生着一株赤莲，花瓣如火，根须扎进熔岩——是地火莲。',opts:[{txt:'🪷 采下地火莲',cls:'primary',fx:{mat:{sherb:2}}},{txt:'🔥 引一缕地火淬体',fx:{fight:{name:'地火',atk:8,def:1,hp:40,elem:'fire',style:'burst'},winFx:{root:2}}}]},
      {id:'b08_th_huo_3',theme:'huo',weight:1,title:'火山温泉',t:'火山脚下竟有一汪温泉，热气蒸腾，泉边还生了些喜热的灵草。',opts:[{txt:'♨️ 泡泉解乏',cls:'primary',fx:{mood:5}},{txt:'🌿 采泉边灵草',fx:{mat:{herb:2}}}]},
      {id:'b08_th_huo_4',theme:'huo',weight:1,title:'火把节',t:'山民们举着火把绕山而行，火光连成一条长龙，为火季祈福。',opts:[{txt:'🔥 加入火把队伍',cls:'primary',fx:{merit:2,mood:3}},{txt:'🏮 站在高处看火龙',fx:{mood:4}}]},
      {id:'b08_th_huo_5',theme:'huo',weight:1,title:'烬中余温',t:'野火烧过的山坡上，灰烬里竟拱出一丛嫩芽，绿得晃眼。',opts:[{txt:'🌱 护住嫩芽',cls:'primary',fx:{merit:2,insight:1,once:'b08_th_huo_5'}},{txt:'🔥 观「野火烧不尽」',fx:{cult:80}}]},
      {id:'b08_th_huo_6',theme:'huo',weight:1,title:'炼丹房火',t:'火季的丹房格外忙碌，炉火日夜不熄，药香混着热气飘满半山。',opts:[{txt:'⚗️ 借丹房学两手',cls:'primary',fx:{profExp:4,cult:50}},{txt:'🧘 闻药香入定',fx:{cult:70}}]},
      /* shui +6 */
      {id:'b08_th_shui_1',theme:'shui',weight:2,title:'水涨船高',t:'水季涨潮，渡口的水位一夜涨了三尺，船家们忙着把船系牢。',opts:[{txt:'🛶 帮忙加固渡船',cls:'primary',fx:{merit:1,mood:3}},{txt:'💧 观水势悟道',fx:{insight:1,once:'b08_th_shui_1'}}]},
      {id:'b08_th_shui_2',theme:'shui',weight:2,title:'水底石桥',t:'水位退去，露出一座被淹没多年的石桥，桥面刻着看不懂的古文。',opts:[{txt:'📜 拓下桥上古文',cls:'primary',fx:{insight:1,once:'b08_th_shui_2'}},{txt:'🌉 桥上走个来回',fx:{stones:40}}]},
      {id:'b08_th_shui_3',theme:'shui',weight:1,title:'泉眼',t:'雨后山脚涌出一眼新泉，泉水清冽甘甜，泉眼处聚着几尾透明的小鱼。',opts:[{txt:'💧 掬饮泉水',cls:'primary',fx:{mood:3,cult:60}},{txt:'🐟 观察透明小鱼',fx:{insight:1,once:'b08_th_shui_3'}}]},
      {id:'b08_th_shui_4',theme:'shui',weight:1,title:'水磨坊',t:'水季的水磨坊转得飞快，磨盘声和着水声，叮叮咚咚。',opts:[{txt:'🌾 帮忙搬粮',cls:'primary',fx:{merit:1,mood:3}},{txt:'🎵 听水磨之歌',fx:{mood:4}}]},
      {id:'b08_th_shui_5',theme:'shui',weight:1,title:'雨亭',t:'水季的雨说来就来。你躲进路边雨亭，亭中已有一位老翁在煮茶。',opts:[{txt:'🍵 讨一杯茶喝',cls:'primary',fx:{mood:4,merit:1}},{txt:'🌧️ 亭中听雨',fx:{mood:5,cult:40}}]},
      {id:'b08_th_shui_6',theme:'shui',weight:1,title:'溪涨',t:'暴涨的溪水冲来一截浮木，木上趴着一只湿漉漉的小兽，正拼命蹬腿。',opts:[{txt:'🫳 捞起小兽',cls:'primary',fx:{merit:2}},{txt:'🪵 只捞浮木',fx:{mat:{iron:1}}}]},
    );
  }
  /* —— 季节事件 +10（函数型） —— */
  if(typeof SEASONAL_EVENTS!=='undefined'&&Array.isArray(SEASONAL_EVENTS)){
    SEASONAL_EVENTS.push(
      {n:'惊蛰雷动',run:()=>{
        scene('惊蛰 · 雷动');
        log('<p>惊蛰这天，第一声春雷炸响，沉睡的万物一齐醒来。山间灵草疯长，正是采药的好时节。</p>');
        logChoices([
          {txt:'🌿 趁雷后采药（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',14);log('<p>你趁雷后湿润进山：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.mats.sherb=(S.mats.sherb||0)+1;S.mats.herb=(S.mats.herb||0)+2;log('<p class="loot">雷后灵草格外精神（灵草 +1，草药 +2）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.08));log('<p class="danger">春雷未歇，你被惊雷擦了一下（气血-8%）。</p>')}passTime(2);renderAll()}},
          {txt:'🧘 于雷声中静坐',fn:()=>{const g=Math.floor(70+S.root/3);S.cult+=g;log('<p>你在雷声里静坐半日，心反而静了下来（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
        ]);
      }},
      {n:'谷雨茶会',run:()=>{
        scene('谷雨 · 茶会');
        log('<p>谷雨时节，茶山新芽初展。山下茶庄办起茶会，邀过往修士品新茶。</p>');
        logChoices([
          {txt:'🍵 赴会品茶（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',14);log('<p>你于茶会落座：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(1);S.luck=clamp(S.luck+1,1,100);log('<p class="good">你与茶主相谈甚欢，得赠一罐新茶，还说近日山中有异象（功德+1，气运+1）。</p>')}else{log('<p>你光顾着喝茶，错过了茶主的言外之意。</p>')}passTime(2);renderAll()}},
          {txt:'🍃 采一篓新茶自用',fn:()=>{S.mats.herb=(S.mats.herb||0)+1;log('<p>你亲手采了一篓新茶，晾晒收好（草药 +1）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'芒种祭田',run:()=>{
        scene('芒种 · 祭田');
        log('<p>芒种时节，山下农夫们举行祭田仪式，祈愿五谷丰登。田埂上摆满供品，锣鼓喧天。</p>');
        logChoices([
          {txt:'🌾 帮忙耕一垄田（力量判定）',cls:'primary',fn:()=>{const R=doRoll('str',13);log('<p>你卷起裤管下田：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(3);log('<p class="good">你犁完一垄田，农人们捧来新米相谢（功德+3）。</p>')}else{log('<p>你犁得歪歪扭扭，惹得众人发笑，倒也和乐。</p>')}passTime(1);renderAll()}},
          {txt:'🕯️ 替他们上一炷祭香',fn:()=>{addMerit(1);log('<p>你于祭坛前上了一炷香，农人们连声道谢（功德+1）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'小暑试炼',run:()=>{
        scene('小暑 · 试炼');
        log('<p>小暑酷热，山中妖兽也躲进阴凉。有老修士说：此时正是淬炼心性的好时候。</p>');
        logChoices([
          {txt:'🔥 烈日下打坐（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',15);log('<p>你于烈日下盘坐：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(100+S.root/3);S.cult+=g;log('<p class="good">汗流浃背处，道心愈坚（修为 +'+g+'）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.06));log('<p class="danger">你晒得头晕眼花，中了几分暑气（气血-6%）。</p>')}passTime(2);renderAll()}},
          {txt:'🌿 进山采消暑灵草',fn:()=>{S.mats.herb=(S.mats.herb||0)+2;log('<p>你采得几株薄荷、金银花（草药 +2）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'立秋祭月',run:()=>{
        scene('立秋 · 祭月');
        log('<p>立秋夜凉如水，山民在晒谷场上摆起祭月供桌，瓜果飘香，孩童追逐嬉闹。</p>');
        logChoices([
          {txt:'🌕 一同祭月（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',14);log('<p>你与众人在月下祭拜：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.luck=clamp(S.luck+1,1,100);log('<p class="good">月华入怀，你只觉周身气机通泰（气运+1）。</p>')}else{log('<p>月饼太甜，你吃得有些撑。</p>')}passTime(1);renderAll()}},
          {txt:'🧘 于月下打坐',fn:()=>{const g=Math.floor(80+S.root/3);S.cult+=g;log('<p>秋月澄澈，你于月光下吐纳，修为微进（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
        ]);
      }},
      {n:'霜降试剑',run:()=>{
        scene('霜降 · 试剑');
        log('<p>霜降之后，草木凝霜。山巅剑台上，有剑修以霜试剑，剑气过处，寒霜尽落。</p>');
        logChoices([
          {txt:'🗡️ 上台一试（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',15);log('<p>你提剑上台：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(90+S.root/3);S.cult+=g;log('<p class="good">霜随剑落，你悟得一丝寒锋真意（修为 +'+g+'）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.08));log('<p class="danger">霜滑剑偏，你摔了一跤，被众人扶起（气血-8%）。</p>')}passTime(2);renderAll()}},
          {txt:'👀 台下观剑',fn:()=>{S.mats.iron=(S.mats.iron||0)+1;log('<p>你旁观良久，捡走一块被剑气崩落的铁屑（铁矿石 +1）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'小雪围炉',run:()=>{
        scene('小雪 · 围炉');
        log('<p>小雪初落，山间一片白。洞府里生起炉火，你翻出陈年灵酿，温了一壶。</p>');
        logChoices([
          {txt:'🍶 独酌温酒',cls:'primary',fn:()=>{const g=Math.floor(50+S.root/4);S.cult+=g;S.mood=clamp((S.mood||0)+5,0,100);log('<p>酒香与炉火交织，你喝得微醺，心境也松弛了几分（修为 +'+g+'，心境+5）。</p>');passTime(1);renderAll()}},
          {txt:'📖 借炉火夜读一卷残经',fn:()=>{const g=Math.floor(70+S.root/3);S.cult+=g;log('<p>炉火噼啪，你读完半卷残经，意犹未尽（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'大雪封径',run:()=>{
        scene('大雪 · 封径');
        log('<p>大雪连下三日，山径尽没。猎户们窝在家里，只有雪里的妖兽还在觅食。</p>');
        logChoices([
          {txt:'🏹 冒雪巡山（力量判定）',cls:'primary',fn:()=>{const R=doRoll('str',15);log('<p>你踏雪巡山：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.mats.pelt=(S.mats.pelt||0)+1;addMerit(1);log('<p class="good">你救下一队被雪困住的猎户，还分得一张好皮子（妖皮+1，功德+1）。</p>')}else{applyInjury('jiqiao');log('<p class="danger">雪下暗坑，你摔伤了腿（气血-10%）。</p>')}passTime(2);renderAll()}},
          {txt:'🧘 闭门清修',fn:()=>{const g=Math.floor(100+S.root/3);S.cult+=g;log('<p>大雪封山，正好清修（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
        ]);
      }},
      {n:'冬至炼心',run:()=>{
        scene('冬至 · 炼心');
        log('<p>冬至一阳生。这一夜，天地间阴阳交接，据说此时入定，最易窥见本心。</p>');
        logChoices([
          {txt:'🕯️ 彻夜打坐观心（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',16);log('<p>你于冬至夜入定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(120+S.root/3);S.cult+=g;S.mood=clamp((S.mood||0)+8,0,100);log('<p class="good">一阳来复，你窥见本心一角（修为 +'+g+'，心境+8）。</p>')}else{log('<p>你越想入定越心浮气躁，鸡鸣时分才迷迷糊糊睡去。</p>')}passTime(3);renderAll()}},
          {txt:'🥟 下山与山民同食饺子',fn:()=>{addMerit(2);log('<p>你下山与山民同乐，吃了一大碗热饺子（功德+2）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'除夕守岁',run:()=>{
        scene('除夕 · 守岁');
        log('<p>除夕夜，山下爆竹声声，山民们守着岁，等着新一年的第一缕曙光。</p>');
        logChoices([
          {txt:'🏮 下山与山民同守岁',cls:'primary',fn:()=>{addMerit(2);S.luck=clamp(S.luck+1,1,100);log('<p class="good">你与山民们守到天明，讨了个好彩头（功德+2，气运+1）。</p>');passTime(1);renderAll()}},
          {txt:'🧘 于洞府静坐迎新',fn:()=>{const g=Math.floor(80+S.root/3);S.cult+=g;log('<p>你在静坐中送走旧岁，迎来新年（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
        ]);
      }},
    );
  }
  /* —— 年度事件 +10（函数型） —— */
  if(typeof YEARLY_EXTRA!=='undefined'&&Array.isArray(YEARLY_EXTRA)){
    YEARLY_EXTRA.push(
      {n:'论道大会',run:()=>{
        scene('论道大会');
        log('<p>这一年，各大宗门在山巅举办论道大会，天下修士云集，各抒己见。</p>');
        logChoices([
          {txt:'🧘 上台论道（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',16);log('<p>你登台开讲：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.daolunWins=(S.flag.daolunWins||0)+1;const g=Math.floor(120+S.root/3);S.cult+=g;S.fame=S.fame||{};S.fame.zheng=(S.fame.zheng||0)+3;log('<p class="good">你一言惊四座，赢得满堂彩（修为 +'+g+'，正道声望+3）。</p>')}else{log('<p>你讲得中规中矩，台下掌声稀落。</p>')}passTime(2);renderAll()}},
          {txt:'👂 台下听讲',fn:()=>{const g=Math.floor(60+S.root/4);S.cult+=g;log('<p>你旁听半日，记下几句妙语（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
        ]);
      }},
      {n:'坊市灯会',run:()=>{
        scene('坊市灯会');
        log('<p>这一年坊市大办灯会，万盏花灯映得长街如昼，猜灯谜、赏花灯，好不热闹。</p>');
        logChoices([
          {txt:'🏮 猜灯谜（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',14);log('<p>你挤进灯谜摊：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(80,200);S.stones+=g;log('<p class="loot">你连中三元，抱回一盏琉璃灯与一袋灵石（灵石 +'+g+'）。</p>')}else{log('<p>你苦思半晌，只猜中一个「拆」字谜。</p>')}passTime(1);renderAll()}},
          {txt:'🎇 只看灯，不凑热闹',fn:()=>{S.mood=clamp((S.mood||0)+6,0,100);log('<p>你在灯海里慢慢走，心也跟着亮了（心境+6）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'秘境现世',run:()=>{
        scene('秘境现世');
        log('<p>这一年，东海之滨忽然灵光冲天——一座上古秘境现世，引得八方修士齐聚。</p>');
        logChoices([
          {txt:'🗺️ 入秘境一探（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',16);log('<p>你趁乱冲入秘境：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const it=randItem(3);addItem(it);S.mats.jade=(S.mats.jade||0)+1;log('<p class="loot">你在秘境深处拾得「'+it.name+'」与一块寒玉（寒玉+1）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));log('<p class="danger">秘境入口争夺激烈，你被挤落悬崖（气血-15%）。</p>')}passTime(2);renderAll()}},
          {txt:'🌊 在岸边观潮',fn:()=>{const g=Math.floor(70+S.root/3);S.cult+=g;log('<p>你于岸边看众人争抢，倒也悟出「不争」二字（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'灵脉觉醒',run:()=>{
        scene('灵脉觉醒');
        log('<p>这一年，宗门后山的灵脉忽然苏醒，灵气喷涌如泉，全门上下修为都涨了一截。</p>');
        logChoices([
          {txt:'🧘 于灵脉泉眼修炼（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',15);log('<p>你抢占泉眼：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(200+S.root/2);S.cult+=g;log('<p class="good">灵脉之力灌体，你修为大涨（修为 +'+g+'）。</p>')}else{log('<p>泉眼旁修士太多，你只分到一杯羹。</p>')}passTime(3);renderAll()}},
          {txt:'🫙 以玉瓶收集灵液',fn:()=>{S.mats.sherb=(S.mats.sherb||0)+1;log('<p>你灌满一瓶灵液（灵草 +1）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'兽潮前兆',run:()=>{
        scene('兽潮前兆');
        log('<p>这一年深秋，林中兽吼彻夜不休，野兽成群结队向南迁徙——像是有什么在驱赶它们。</p>');
        logChoices([
          {txt:'🛡️ 随宗门设防（功德+4）',cls:'primary',fn:()=>{if(S.sect){addMerit(4);S.contrib+=8;S.contribVal+=25;log('<p class="good">你随门中布防，加固了东面防线（功德+4，贡献点+8，贡献值+25）。</p>')}else{addMerit(4);log('<p class="good">你与散修们共同设防，护住了山下村庄（功德+4）。</p>')}passTime(3);renderAll()}},
          {txt:'🦌 逆兽潮而上查探',fn:()=>{log('<p>你逆着兽潮深入……</p>');startCombat({name:'兽潮先锋',atk:7+rl()*2,def:2+rl(),hp:30+rl()*13,elem:'wood'})}},
        ]);
      }},
      {n:'师门大比',run:()=>{
        scene('师门大比');
        log('<p>这一年宗门举办大比，各峰弟子同台竞技，胜者可入藏经阁顶层。</p>');
        logChoices([
          {txt:'🥊 报名参赛（力量判定）',cls:'primary',fn:()=>{if(!S.sect){log('<p>你无门无派，只能站在台下看热闹。</p>');passTime(1);renderAll();return}const R=doRoll('str',15);log('<p>你登上擂台：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.contrib+=15;S.contribVal+=50;log('<p class="good">你连胜三轮，夺得好名次（贡献点+15，贡献值+50）。</p>')}else{log('<p>你首轮便败下阵来，只得铩羽而归。</p>')}passTime(2);renderAll()}},
          {txt:'👀 台下观战',fn:()=>{const g=Math.floor(50+S.root/4);S.cult+=g;log('<p>你旁观切磋，记下几招（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'老友诀别',run:()=>{
        scene('老友诀别');
        log('<p>这一年，一位故人前来道别——他要远行，去追寻传说中的仙缘，此去或许不再相见。</p>');
        logChoices([
          {txt:'🍶 置酒相送（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',15);log('<p>你摆酒为故人饯行：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(1);S.mood=clamp((S.mood||0)+6,0,100);log('<p class="good">你们对饮到天明，他说：「认识你，不虚此行。」（心境+6）</p>')}else{log('<p>你话到嘴边又咽下，只拍了拍他的肩。</p>')}passTime(1);renderAll()}},
          {txt:'📿 赠他一枚护身符',fn:()=>{addMerit(2);log('<p>你赠出一枚护身符，他郑重系在颈间（功德+2）。</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'天象异变',run:()=>{
        scene('天象异变');
        log('<p>这一年仲夏，白日忽然见星，红月当空，天象异变引得人人自危。</p>');
        logChoices([
          {txt:'🔭 观星推演（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',17);log('<p>你登高观星：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.luck=clamp(S.luck+1,1,100);const g=Math.floor(100+S.root/3);S.cult+=g;log('<p class="good">星象暗合天机，你窥得一丝先机（气运+1，修为 +'+g+'）。</p>')}else{S.heartDemons++;log('<p class="danger">红月入眼，你心浮气躁，添了一道心魔（心魔+1）。</p>')}passTime(2);renderAll()}},
          {txt:'🧘 闭门不出，静观其变',fn:()=>{log('<p>你封了洞府，任天象变幻，只守本心。</p>');passTime(2);renderAll()}},
        ]);
      }},
      {n:'仙迹传闻',run:()=>{
        scene('仙迹传闻');
        log('<p>这一年，市井流传一桩奇闻：有人在云梦泽见到仙人踏波而行，留下一串仙迹。</p>');
        logChoices([
          {txt:'🧭 循传闻寻访（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',16);log('<p>你赶到云梦泽：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(150+S.root/3);S.cult+=g;S.mats.jade=(S.mats.jade||0)+1;log('<p class="loot">你循着仙迹寻到一枚温润的玉片（修为 +'+g+'，寒玉+1）。</p>')}else{log('<p>你找了三天，只找到一行野鸭的脚印。</p>')}passTime(2);renderAll()}},
          {txt:'🌫️ 一笑置之',fn:()=>{log('<p>你听过便罢：「仙人若真显迹，何须让人知道。」</p>');passTime(1);renderAll()}},
        ]);
      }},
      {n:'寿宴逢敌',run:()=>{
        scene('寿宴逢敌');
        log('<p>这一年，山下老寿星摆百岁宴，你受邀赴宴，却在席间遇到一位旧日仇家。</p>');
        logChoices([
          {txt:'🍷 举杯一笑，往事作罢（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',16);log('<p>你举杯走向那人：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(3);S.mood=clamp((S.mood||0)+8,0,100);log('<p class="good">对方愣住，半晌也举起了杯：「……罢了。」（功德+3，心境+8）</p>')}else{log('<p>对方冷哼一声，拂袖而去。席间众人面面相觑。</p>')}passTime(1);renderAll()}},
          {txt:'⚔️ 剑出鞘，做个了断',cls:'danger',fn:()=>{log('<p>宴席瞬间剑拔弩张……</p>');startCombat({name:'旧日仇家',atk:8+rl()*2,def:3+rl(),hp:32+rl()*13,elem:'metal'})}},
        ]);
      }},
    );
  }
})();
