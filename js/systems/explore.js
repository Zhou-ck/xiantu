/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 探索 ================
====================================================== */
'use strict';
/* ================= 探索 ================= */
const REGIONS=[
  {id:'near',name:'青石小径·周边',days:3,desc:'破庙周遭的丘陵与溪谷，尚算太平。',minRealm:0,common:70,beast:10,herb:50,rare:8,danger:5},
  {id:'hill',name:'荒山野岭',days:5,desc:'乱石嶙峋，时有妖兽出没，也藏着散修的旧洞。',minRealm:0,common:55,beast:28,herb:35,rare:12,danger:12},
  {id:'forest',name:'暮色深林',days:7,desc:'古木参天，瘴气弥漫，传闻林中有一处上古药园。',minRealm:3,common:42,beast:35,herb:55,rare:16,danger:18},
  {id:'cliff',name:'断魂崖',days:8,desc:'悬崖千仞，云雾之下隐约有龙吟声传来。',minRealm:6,common:30,beast:45,herb:25,rare:25,danger:35},
  {id:'abyss',name:'荒古禁地',days:12,desc:'九界禁区，上古大能陨落之地，一步一劫。',minRealm:17,common:15,beast:55,herb:60,rare:45,danger:60},
];
function panelExplore(){
  const tower=(S.realm>=2?'<div class="item-card"><div class="nm">🧗 试炼塔 <span style="font-size:12px;color:#6f7a94">（已通 '+(S.flag.tower||0)+' 层）</span></div><div class="ds">古修留下的历练之塔，一层一关，越往上越凶险，奖励也越丰厚。每五层有守塔统领。</div><div style="margin-top:8px"><button class="small primary" onclick="doTower()">挑战第 '+((S.flag.tower||0)+1)+' 层</button></div></div>':'');
  const bossStage=bigStage(S.realm);
  const bossBeat=!!(S.flag.bosses&&S.flag.bosses[bossStage]);
  const bossCard='<div class="item-card"><div class="nm">⛩️ 守关试炼 · '+STAGE_NAMES[bossStage]+'</div><div class="ds">'+(bossBeat?'守关已破（可再次挑战刷取机缘，已破关卡无功法遗宝）。':'当前境界的守关大妖，击败可得重赏，金丹以上另有功法遗宝。')+'</div><div style="margin-top:8px"><button class="small primary" onclick="bossBattle('+bossStage+')">'+(bossBeat?'再次挑战':'前往挑战')+'</button></div></div>';
  const html='<p>山野之间，机缘与凶险并存。气运暗藏天机，奇谈传闻与天降奇遇也常隐于山水之间。</p>'+
    tower+
    bossCard+
    REGIONS.filter(r=>S.realm>=r.minRealm).map(r=>
      '<div class="item-card"><div class="nm">'+r.name+' <span style="font-size:12px;color:#6f7a94">（约 '+r.days+' 日）</span></div><div class="ds">'+r.desc+'</div><div style="margin-top:8px"><button class="small" onclick="doExplore(\''+r.id+'\')">前往</button></div></div>'
    ).join('')+
    (REGIONS.some(r=>S.realm<r.minRealm)?'<p style="font-size:13px;color:#6f7a94">另有去处被迷雾笼罩，需更高境界方可踏入。</p>':'');
  openPanel('🗺️ 外出探索',html);
}
function doTower(){
  closePanel();
  if(S.realm<2){toast('炼气三层后开启试炼塔');return}
  const floor=(S.flag.tower||0)+1;
  let e={name:'试炼塔 · 第'+floor+'层守关',atk:4+floor*3+rl(),def:1+Math.floor(floor/2)+Math.floor(rl()/3),hp:25+floor*12+rl()*8};
  if(floor%5===0){e={name:'试炼塔 · 第'+floor+'层统领',atk:e.atk+4,def:e.def+2,hp:e.hp+40}}
  scene('试炼塔 · 第 '+floor+' 层');
  log('<p>塔门轰然开启，肃杀之气扑面而来。<b>'+e.name+'</b> 拦住了去路。</p>');
  startCombat(e,res=>{
    if(res.win){
      S.flag.tower=floor;
      addTrail(1);
      recordScore('tower',floor);
      const stones=Math.floor(50+floor*20),cult=Math.floor(40+floor*25+rl()*8);
      S.stones+=stones;S.cult+=cult;
      log('<p class="loot">登上一层：灵石 +'+stones+'，修为 +'+cult+'。</p>');
      if(floor%5===0){S.luck=clamp(S.luck+1,1,100);log('<p class="loot">🏆 你击败了守塔统领，气运 +1。</p>')}
      logChoices([
        {txt:'🧗 继续挑战第 '+(floor+1)+' 层',cls:'primary',fn:()=>doTower()},
        {txt:'🏃 见好就收，出塔修整',fn:()=>{log('<p>你退出试炼塔，回望塔尖，仍觉热血未凉。</p>');renderAll()}}
      ]);
    }else if(res.draw){
      const g=Math.floor(10+floor*5);S.stones+=g;
      log('<p class="sys">十回合力竭，你被塔灵送出塔外（灵石 +'+g+'）。</p>');
      renderAll();
    }else{
      if(S.hp<=0)S.hp=1;
      log('<p class="danger">你败下阵来，被塔灵轻柔地送出塔外。养精蓄锐，他日再战。</p>');
      renderAll();
    }
  },true);
}
function doExplore(rid){
  closePanel();
  const r=REGIONS.find(x=>x.id===rid);
  if(S.realm<r.minRealm){log('<p class="sys">迷雾锁路，你现在的境界还进不去。</p>');return}
  scene('外出探索 · '+r.name);
  log('<p class="sys">（时令：'+seasonLabel()+' · '+seasonDesc()+'）</p>');
  const se=seasonOf();
  let d=r.danger,b=r.beast,ra=r.rare,h=r.herb;
  if(se===0)h+=10;
  else if(se===1)b+=10;
  else if(se===2){ra+=8;d+=8}
  else{ra=Math.max(0,ra-5);h=Math.max(0,h-5)}
  d=Math.max(4,d-Math.floor(attrVal(S,'agi')/8));
  if(S.flag.dao==='array')d=Math.max(4,d-5); /* 阵道问道：探索避凶 */
  /* 8.3 轻功赶路：身法 ≥15 探索耗时减半 */
  const trav=attrVal(S,'agi')>=15?Math.max(1,Math.floor(r.days/2)):r.days;
  if(trav<r.days)log('<p class="sys">你身法轻灵，足下生风，此番行程省了一半时日。</p>');
  let trav2=trav;
  if(S.pet&&petAlive()&&S.pet.talent==='speed')trav2=Math.max(1,Math.floor(trav*0.8)); /* 14.4 迅捷灵兽坐骑 */
  if(trav2<trav)log('<p class="sys">灵兽驮你而行，日行千里（行程再省两成）。</p>');
  ra+=insightBonus(S);
  h+=Math.floor(attrVal(S,'int')/10);
  const luckMod=(S.bg.traits.some(t=>t.id==='luckUp')?5:0)+Math.floor(S.luck/4)+(petAlive()&&S.pet.talent==='luck'?5:0)+(S.companion?companionLuck():0);
  const sg=signNow();
  if(sg){if(sg.explore)luckMod+=sg.explore;if(sg.danger)d+=sg.danger}
  const roll=rand(1,100)+luckMod;
  let outcome;
  if(roll<=d)outcome='danger';
  else if(roll<=d+b)outcome='beast';
  else if(roll<=d+b+ra)outcome='rare';
  else if(roll<=d+b+ra+h)outcome='herb';
  else outcome='calm';
  if(roll>=95)outcome='epic';
  if(outcome==='danger'&&S.companion&&chance(0.55)){
    outcome=pick(['herb','rare','calm']);
    log('<p class="good">'+esc(S.companion.name)+'目光一凝，抢先一步拦住你：「前方有诈，绕道！」你二人避开凶险，反有所获。</p>');
  }
  if((S.flag.maze||S.bg.traits.some(t=>t.id==='wild'))&&outcome==='danger'){outcome='herb';log('<p>'+(S.flag.maze?'迷踪阵悄然发动，你避开了前方的一处凶险，绕入一片灵草丰茂之地。':'你凭着多年山林直觉，绕开了一处凶险之地，反而撞见一片灵草。')+'</p>')}
  /* 2J 声望回响：魔道声望高→正道截杀；正道声望高→善缘相助 */
  if(outcome==='calm'||outcome==='herb'||outcome==='rare'){
    const fm=S.fame||{};
    if((fm.mo||0)>=80&&chance(0.35)){fameHuntEvent();return}
    if((fm.zheng||0)>=80&&chance(0.35)){fameBlessEvent();}
  }
  if(treasureChain()){
    if(PENDING>0){renderAll();return}
  S.flag.explored=true;
  S.flag.exploreCount=(S.flag.exploreCount||0)+1;
  dC().c.explore++;
  addTrail(1);
    maybeInsight('寻宝途中');
    const tg1=growAttr('agi',0.06,'探幽寻踪，身法渐长'),tg2=growAttr('int',0.06,'推演机关，眼界渐开');
    if(tg1||tg2)log(tg1+tg2);
    if(!passTime(trav2)){renderAll();return}
    maybeBreakHint();checkQuests();if(PENDING===0&&chance(0.3))encounterEvent();renderAll();
    if(PENDING===0&&chance(0.06))petEvent();
    return;
  }
  const enc=ENCOUNTERS[outcome](r);
  if(enc)log(enc);
  S.flag.explored=true;
  S.flag.exploreCount=(S.flag.exploreCount||0)+1;
  dC().c.explore++;
  addTrail(1);
  maybeInsight('山水之间');
  const g1=growAttr('agi',0.08,'山川跋涉，身法渐长'),g2=growAttr('int',0.06,'旅途见闻，眼界渐开');
  if(g1||g2)log(g1+g2);
  if(!passTime(trav2)){renderAll();return}
  maybeBreakHint();checkQuests();if(PENDING===0&&chance(0.3))encounterEvent();renderAll();
  if(PENDING===0&&chance(0.06))petEvent();
}
/* 2J 声望回响 · 正道截杀：魔道声望高时，正道中人前来问罪 */
function fameHuntEvent(){
  openEventModal('🌩️ 声望回响 · 正道问罪','<p>你正行至山道，忽有一道剑光破空而至，一名青衫剑修拦在路前：「魔道凶名，如雷贯耳——今日特来会会你！」</p>',[
    {txt:'⚔️ 拔剑应战',fn:()=>{log('<p>你冷笑一声，不退反进。剑修凝重：「倒是条汉子！」</p>');startCombat({name:'正道剑修',atk:8+rl()*2,def:3+rl(),hp:40+rl()*15,style:'rapid'},res=>{if(res.win){log('<p class="good">你击败来者，魔名更盛（魔道声望 +10）。</p>');S.fame=S.fame||{};S.fame.mo=(S.fame.mo||0)+10}else{log('<p class="danger">你负伤败退，对方收剑而立：「既知天外有天，收敛些吧。」（魔道声望 -5）</p>');S.fame=S.fame||{};S.fame.mo=Math.max(0,(S.fame.mo||0)-5)}renderAll()})}},
    {txt:'🏃 避开锋芒，绕道而行',fn:()=>{log('<p>你懒得纠缠，身法一展没入林间。剑修冷哼一声：「逃得了一时，逃不了一世。」</p>');S.fame=S.fame||{};S.fame.mo=Math.max(0,(S.fame.mo||0)-3);passTime(2);renderAll()}},
    {txt:'🤝 报出字号，以言语周旋（魅力判定）',fn:()=>{const R=doRoll('cha',15);log('<p>你拱手笑道：「道友留步，我与贵派有位故交。」'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">对方将信将疑，终究抱拳而去。</p>');passTime(2);renderAll()}else{log('<p class="danger">对方看穿你的拖延，一剑削来。</p>');startCombat({name:'正道剑修',atk:8+rl()*2,def:3+rl(),hp:40+rl()*15,style:'rapid'})}}},
  ]);
}
/* 2J 声望回响 · 善缘相助：正道声望高时，江湖人以礼相待 */
function fameBlessEvent(){
  openEventModal('🌟 声望回响 · 善缘','<p>山道茶棚中，一位老修士认出你，忙起身让座：「恩公侠名，如雷贯耳！今日茶钱，小老儿请了。」</p>',[
    {txt:'🙏 拱手致谢，随缘攀谈',fn:()=>{const g=rand(30,80);S.stones+=g;log('<p class="loot">对方敬你一杯灵茶，又悄悄塞来一袋灵石（灵石 +'+g+'）。</p>');S.fame=S.fame||{};S.fame.zheng=(S.fame.zheng||0)+2;passTime(2);renderAll()}},
    {txt:'😊 婉拒好意，只论道心',fn:()=>{const gw=growWil(0.15,'受人之敬，更知持身之重');if(gw)log(gw);log('<p>你笑道：「修行之人，一盏茶足矣。」对方肃然起敬。</p>');S.fame=S.fame||{};S.fame.zheng=(S.fame.zheng||0)+3;passTime(2);renderAll()}},
    {txt:'🚶 谢过便走',fn:()=>{log('<p>你拱手作别，继续赶路。</p>');passTime(2);renderAll()}},
  ]);
}
/* 14.4 灵兽事件：闯祸 / 寻宝 / 助修 */
function petEvent(){
  if(!S.pet||S.pet.faint>0)return;
  const r=rand(1,100);
  if(r<=40){
    const loss=rand(20,80);S.stones=Math.max(0,S.stones-loss);
    log('<p class="danger">🐾 '+esc(S.pet.name)+' 闯了祸——它偷吃了坊市商贩的灵果，你赔了 '+loss+' 灵石。</p>');
  }else if(r<=75){
    const m=pick(['herb','sherb','iron','jade']);S.mats[m]=(S.mats[m]||0)+1;
    log('<p class="loot">🐾 '+esc(S.pet.name)+' 叼回一份'+MAT_NAMES[m]+'，邀功似的直摇尾巴。</p>');
  }else{
    const g=Math.floor(30+S.root/4);S.cult+=g;
    log('<p class="good">🐾 '+esc(S.pet.name)+' 于你打坐时依偎身侧，灵气流转（修为 +'+g+'）。</p>');
  }
}
/* 藏宝图因果链：市井传闻 → 残破藏宝图 → 遗藏寻踪（可遇不可求） */
function treasureChain(){
  if(!S)return false;
  if(S.flag.rumor&&!S.flag.mapFound){
    if(!chance(0.35))return false;
    S.flag.mapFound=true;
    log('<p class="loot">🗺️ 你想起市井间那则传说，循迹寻去，竟在一具枯骨手中摸到半张<b>残破藏宝图</b>！</p>');
    return true;
  }
  if(S.flag.mapFound&&!S.flag.treasureDone){
    if(!chance(0.5))return false;
    S.flag.treasureDone=true;
    scene('遗藏寻踪');
    log('<p>你按藏宝图所指，寻至乱葬岗深处。月光下，一座石室门户洞开，匾额上书「有缘者入」。</p>');
    const R=doRoll('int',16);
    log('<p>你凝神破解石室禁制：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){
      const it=randItem(3);addItem(it);
      const g=rand(200,500);S.stones+=g;
      log('<p class="loot">禁制应声而开：灵石 +'+g+'，还有一件「'+it.name+'」（'+QNAMES[it.quality]+'）。</p>');
    }else{
      log('<p>禁制轰然炸开，一具守库尸傀扑面而来！</p>');
      startCombat({name:'守库尸傀',atk:6+rl()*2,def:2+rl(),hp:30+rl()*12});
    }
    return true;
  }
  return false;
}
function maybeInsight(src){
  if(!S)return;
  let p=0.05+Math.floor(S.luck/30)*0.03+(petAlive()&&S.pet.talent==='luck'?0.04:0);
  p+=insightBonus(S)*0.005;
  if(S.realm>=13)p*=0.85;
  if(demonDoubt(S))p*=0.5; /* 道疑烙印：悟道效率 -50% */
  if(!chance(p))return;
  const g=Math.floor((80+rl()*12)*rand(8,12)/10);
  S.cult+=g;
  S.flag.insights=(S.flag.insights||0)+1;
  log('<p class="good">🧠 行至'+src+'，你忽有所悟，灵台一点清明乍现（悟道 +1，修为 +'+g+'）。</p>');
  if(chance(0.35)){S.attrs.wil=clamp(S.attrs.wil+1,1,40);log('<p class="good">道心随之圆融一分（心性+1）。</p>')}
}
/* ===== 9.1 事件链框架：埋设→推进→收束（多条因果链） ===== */
const CHAINS={
  yaoyu:{n:'妖域盟约链',desc:'狐族报恩之缘，月圆赴约',steps:[
    {stage:1,txt:'月圆之夜，狐丘林间雾气翻涌，一道苍老的声音自雾中传来：「恩公既来，便是有缘。」',fn:()=>{
      S.flag.chain.yaoyu=2;
      openEventModal('🦊 妖域盟约','<p>狐族长老幻化人形，拱手道：「近岁人族魔潮将起，我狐族欲与正道修好，恩公可愿做这引线之人？」</p>',[
        {txt:'🤝 应下盟约（功德+10）',cls:'primary',fn:()=>{addMerit(10);S.luck=clamp(S.luck+1,1,100);log('<p class="good">盟约既成：日后妖域秘境与狐族奇遇于你更亲（功德+10，气运+1）。</p>');S.flag.chain.yaoyu=3;passTime(2);renderAll()}},
        {txt:'🌬️ 婉拒，不想卷入两族之事',fn:()=>{log('<p>狐族长老颔首：「也罢。」雾气散去，仿佛从未发生过。</p>');S.flag.chain.yaoyu=-1;passTime(1);renderAll()}},
      ]);
    }},
  ]},
  lingshou:{n:'灵兽认主链',desc:'灵兽相伴，共历生死',steps:[
    {stage:1,txt:'灵兽日渐通灵，某夜竟以爪在你掌心画下一枚印记——那是「共命契」的雏形。',fn:()=>{
      S.flag.chain.lingshou=2;
      openEventModal('🐾 共命契','<p>你与灵兽四目相对，它低低呜咽，似在请求你的认可。</p>',[
        {txt:'🤝 割血结契，生死与共',cls:'primary',fn:()=>{if(S.pet){S.pet.bond=true;S.pet.bonus+=1;log('<p class="good">共命契成：灵兽与你的羁绊更深，战斗助战之力提升，危急时有概率舍身相护。</p>')}S.flag.chain.lingshou=3;passTime(1);renderAll()}},
        {txt:'🚶 摇头婉拒，仍是主仆',fn:()=>{log('<p>灵兽耷拉着耳朵退开，却仍寸步不离地跟着你。</p>');S.flag.chain.lingshou=-1;passTime(1);renderAll()}},
      ]);
    }},
    {stage:2,txt:'——',fn:()=>{}},
    {stage:3,txt:'——',fn:()=>{}},
  ]},
  jiazu:{n:'家族兴衰链',desc:'世家血脉，一荣俱荣',steps:[
    {stage:1,txt:'一只信鸽衔着族中急信落在你肩头：家族产业被对头吞并，长辈们盼你回乡主持大局。',fn:()=>{
      S.flag.chain.jiazu=2;
      openEventModal('🏮 家族急信','<p>信上字迹潦草：「孙儿亲启——族库亏空、矿脉易主，若你再不归来，百年基业将尽。」</p>',[
        {txt:'🏮 返乡主持大局（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',16);log('<p>你连夜赶回族中：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(300,800);S.stones+=g;addMerit(5);log('<p class="loot">你重振旗鼓，夺回矿脉（灵石+'+g+'，功德+5）。</p>')}else{log('<p class="danger">族中积弊已深，你虽尽力回天，仍折损了不少产业。</p>');S.stones+=rand(50,150)}S.flag.chain.jiazu=3;passTime(5);renderAll()}},
        {txt:'📜 遥寄一封书信，不亲身回返',fn:()=>{addMerit(2);S.stones+=rand(20,60);log('<p>你修书一封，附上灵石若干。族中回信千恩万谢，你却知道，有些担子终究躲不掉。</p>');S.flag.chain.jiazu=-1;passTime(2);renderAll()}},
      ]);
    }},
  ]},
  wodao:{n:'魔道卧底线',desc:'黑旗之下，暗流涌动',steps:[
    {stage:1,txt:'一名魔修找到你，递来一道「任务」：混入正道坊市，窃取一份情报。',fn:()=>{
      S.flag.chain.wodao=2;
      openEventModal('🌑 魔道任务','<p>那人压低嗓音：「做成了，魔道自有你的位置；做不成，令牌上的因果你躲不掉。」</p>',[
        {txt:'🤐 假意应下，实则向正道告发（功德+12）',cls:'primary',fn:()=>{addMerit(12);log('<p class="good">你转头便将消息递给了正道联盟。那人再寻你时，已被围杀于乱葬岗（功德+12）。</p>');S.flag.chain.wodao=-1;passTime(2);renderAll()}},
        {txt:'🌑 真替魔道办事（业力+12）',cls:'danger',fn:()=>{addKarma(12);S.stones+=200;log('<p class="danger">你办成了这桩脏事，魔道信物上又多了一枚印记（业力+12，灵石+200）。</p>');S.flag.chain.wodao=3;passTime(2);renderAll()}},
      ]);
    }},
    {stage:2,txt:'——',fn:()=>{}},
    {stage:3,txt:'——',fn:()=>{}},
  ]},
  danfang:{n:'丹方传承链',desc:'一卷残方，一脉丹香',steps:[
    {stage:1,txt:'破庙残卷上的字迹渐次亮起，指向一处荒废的丹府。',fn:()=>{
      S.flag.chain.danfang=2;
      openEventModal('⚗️ 荒废丹府','<p>丹府石门半掩，丹炉中犹有余温。案上摆着半卷丹方与一枚玉简。</p>',[
        {txt:'⚗️ 依方炼丹（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',15);log('<p>你引动炉火：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.insights=(S.flag.insights||0)+1;const g=Math.floor(120+S.root/2);S.cult+=g;log('<p class="loot">一炉古丹出炉，你借此窥见丹道一脉真传（悟道+1，修为+'+g+'）。</p>')}else{log('<p>火候差了三分，丹药炸炉，你灰头土脸地退了出来。</p>')}S.flag.chain.danfang=3;passTime(2);renderAll()}},
        {txt:'📜 抄下丹方，留待后日',fn:()=>{log('<p>你抄录丹方收好，合上石门。此缘已结，此线已了。</p>');S.flag.chain.danfang=-1;passTime(1);renderAll()}},
      ]);
    }},
  ]},
  qingbao:{n:'情报网线',desc:'消息即财富',steps:[
    {stage:1,txt:'会盟时搭上的线人传来急讯：有人出高价收买你的行踪。',fn:()=>{
      S.flag.chain.qingbao=2;
      openEventModal('🕵️ 线人急讯','<p>线人压低声音：「背后是魔道的人，出价三百灵石。要不要我把你卖了，再黑吃黑？」</p>',[
        {txt:'🕵️ 将计就计，设局反钓',cls:'primary',fn:()=>{const R=doRoll('int',15);log('<p>你布下疑阵：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.stones+=300;addMerit(3);log('<p class="loot">魔道探子一头撞进你的局里，人财两空（灵石+300，功德+3）。</p>')}else{log('<p class="danger">计谋被识破，你险些暴露行踪。</p>')}S.flag.chain.qingbao=3;passTime(2);renderAll()}},
        {txt:'🚶 掐断这条线，明哲保身',fn:()=>{log('<p>你付了封口费，与线人两清。有些消息，知道得越少越好。</p>');S.flag.chain.qingbao=-1;passTime(1);renderAll()}},
      ]);
    }},
  ]},
};
function chainStart(id){
  const c=CHAINS[id];
  if(!c)return;
  S.flag.chain=S.flag.chain||{};
  if(S.flag.chain[id])return;
  S.flag.chain[id]=1;
  addForeshadow(c.n);
  log('<p class="sys">🔗 一段因果悄然埋下：「'+c.n+'」（'+c.desc+'）。日后自会因缘相续。</p>');
}
function chainTick(){
  if(PENDING>0)return;
  const open=Object.keys(S.flag.chain||{});
  if(!open.length)return;
  const id=pick(open);
  const c=CHAINS[id];
  if(!c)return;
  const st=S.flag.chain[id];
  if(st<=0)return;
  const step=c.steps.find(x=>x.stage===st);
  if(!step||typeof step.fn!=='function')return;
  scene('因果相续 · '+c.n);
  log('<p>'+step.txt+'</p>');
  step.fn();
}
/* ===== 探索事件池（多变体） ===== */
const CALM_V=[
  {t:'一路清风徐来，山鸟相鸣。你在溪边掬水而饮，只觉尘心尽洗。',eff:()=>{const n=Math.floor(5+S.root/12);S.cult+=n;return '修为 +'+n}},
  {t:'你路过一座山间小村，借宿一宿。村中老人絮絮讲起山神的传说，你听得入神。',eff:()=>{const n=Math.floor(4+S.root/15);S.cult+=n;return '修为 +'+n}},
  {t:'天边晚霞如烧，你于山巅静立良久，胸中郁气一扫而空。',eff:()=>{const n=Math.floor(6+S.root/10);S.cult+=n;return '修为 +'+n}},
  {t:'细雨微茫，你在树下避雨，竟于雨声中听出一丝韵律，不自觉运起了功法。',eff:()=>{const n=Math.floor(8+S.root/8);S.cult+=n;return '修为 +'+n}},
  {t:'你在古道上遇见一队行商，闲聊几句，得知前方坊市近日有奇珍现世。',eff:()=>''},
  {t:'一只灵鹿从你身旁掠过，驻足回望片刻，又消失在林间。你疑心自己看错了。',eff:()=>''},
  {t:'你遇见一位挑柴的老樵夫，他笑说山中有只白猿会数数，你摇头失笑，山风过耳，倒也惬意。',eff:()=>''},
  {t:'路旁茶棚，老板娘请你喝了一碗粗茶。闲谈间，你知道了山下坊市的一句买卖暗语。',eff:()=>{S.flag.teaLore=true;return '知悉坊市暗语（日后购物更顺）'}},
  {t:'雨后初晴，一道彩虹横跨山涧。你驻足良久，胸中块垒随之消融。',eff:()=>{const n=Math.floor(6+S.root/12);S.cult+=n;return '修为 +'+n}},
  {t:'一只彩蝶落在你肩头，翅上斑纹竟如星河流转。你心神微动，似有所感。',eff:()=>{if(chance(0.5)){S.attrs.wil=clamp(S.attrs.wil+1,1,40);return '心有所悟，心性 +1'}const n=Math.floor(10+S.root/8);S.cult+=n;return '修为 +'+n}},
  {t:'你帮一只坠巢的雏鸟放回巢中，鸟鸣啾啾，似在道谢。',eff:()=>{addMerit(1);return '功德 +1'}},
  {t:'山路上一块万斤巨石横亘当道，你单手便将它掀下了山崖——力拔山兮！',eff:()=>{if(attrVal(S,'str')>=18){const g=rand(1,2);S.attrs.str=clamp(S.attrs.str+g,1,40);return '力拔山兮：力量 +'+g}return '你使出吃奶的劲也没推动它，只得绕行'}},
  {t:'一位路过的女修邀你同赴山中雅集，席间觥筹交错，众人皆赞你谈吐不凡。',eff:()=>{if(attrVal(S,'cha')>=18){const g=rand(1,2);S.attrs.cha=clamp(S.attrs.cha+g,1,40);S.stones+=rand(30,80);return '群仙宴请：魅力 +'+g+'，灵石 +'+'若干'}return '你坐在席末，只觉插不上话'}},
];
const HERB_V=[
  {t:'你在溪谷边寻到一片灵草丛。',eff:()=>{const n=rand(1,3)+(S.bg.traits.some(t=>t.id==='herb')?rand(1,2):0);S.mats.herb=(S.mats.herb||0)+n;return '采得 草药 ×'+n}},
  {t:'你发现一处荒废药园的残迹，几株灵草在瓦砾间倔强生长。',eff:()=>{const n=rand(1,2);S.mats.sherb=(S.mats.sherb||0)+n;return '采得 灵草 ×'+n}},
  {t:'一株色如玛瑙的灵芝生在枯木之上。',eff:()=>{S.mats.sherb=(S.mats.sherb||0)+1;const n=Math.floor(20+S.root/5);S.cult+=n;return '采得 灵草 ×1，修为 +'+n}},
  {t:'你遇着一位采药老农，听他指点了几处灵脉方位。',eff:()=>{S.mats.herb=(S.mats.herb||0)+2;return '采得 草药 ×2'}},
  {t:'你发现一株会跑的「人形何首乌」，正往土里钻！',eff:()=>{const R=doRoll('agi',15);if(R.hit){S.mats.sherb=(S.mats.sherb||0)+2;return '捉住何首乌，灵草 ×2'}S.mats.herb=(S.mats.herb||0)+1;return '它遁地而逃，你只薅到一撮须（草药 ×1）'}},
  {t:'崖壁石缝间垂下一串金色蜂巢，蜜香四溢。',eff:()=>{const n=rand(2,4);S.mats.herb=(S.mats.herb||0)+n;const g=rand(20,60);S.stones+=g;return '采得灵蜜，草药 ×'+n+'，灵石 +'+g}},
  {t:'枯木之下露出一角青石，上面刻着一个「药」字。',eff:()=>{S.mats.sherb=(S.mats.sherb||0)+1;S.mats.jade=(S.mats.jade||0)+1;return '寻得药王遗藏：灵草 ×1、寒玉 ×1'}},
];
const RARE_V=[
  {t:'你在山神庙废墟里拾到半卷残破丹方，墨迹古旧，药香犹存。',eff:()=>{chainStart('danfang');return '揭开丹方传承之缘'}},
  {t:'你在枯骨旁拾得一枚玉简，灵光未散。',eff:()=>{const a=Object.assign({},pick(ARTS));if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);return '习得功法「'+a.name+'」'}return '可惜其中功法你早已习得'}},
  {t:'你误入一处修士遗府，石室内堆着散落的灵石。',eff:()=>{const g=rand(100,500);S.stones+=g;return '灵石 +'+g}},
  {t:'你在一处水潭底摸到一枚圆润的妖丹。',eff:()=>{const p=rand(1,2);S.mats.demonCore=(S.mats.demonCore||0)+p;return '妖丹 ×'+p}},
  {t:'你在水潭边拾起一件被淤泥裹住的遗物。',eff:()=>{const it=randItem(2);addItem(it);return '获得「'+it.name+'」（'+QNAMES[it.quality]+'）'}},
  {t:'你饮下一捧灵泉，暖流涤荡全身。',eff:()=>{S.hp=Math.min(S.maxHp,S.hp+Math.floor(S.maxHp*0.3));return '气血尽复'}},
  {t:'一块半埋土中的道韵石映入眼帘，其上纹路似有天地至理。',eff:()=>{if(chance(0.5)){S.attrs.int=clamp(S.attrs.int+1,1,40);return '灵光一闪，智慧 +1'}const n=Math.floor(100+S.root/3);S.cult+=n;return '参悟片刻，修为 +'+n}},
  {t:'一截断碑上刻着先贤论道之言，字迹潦草却直指本心。',eff:()=>{if(chance(0.5)){S.attrs.wil=clamp(S.attrs.wil+1,1,40);return '心有戚戚，心性 +1'}const n=Math.floor(80+S.root/4);S.cult+=n;return '修为 +'+n}},
  {t:'你在树洞中发现一枚温热的兽卵，蛋壳上流转着朦胧灵光。',eff:()=>{addItem({name:'神秘兽卵',type:'egg',quality:3,use:'hatch',desc:'蛋壳上的灵光若有生命，似有灵兽即将破壳，可在行囊中使用孵化。',sell:600});return '获得「神秘兽卵」'}},
  {t:'你遇上一支神秘的商队，首领竟肯与你交易一枚灵丹。',eff:()=>{addItem(Object.assign({},MARKET_ITEMS[1]));return '获得「聚灵丹」'}},
  {t:'山巅石缝中生着一株九叶玄参，旁搁一枚琥珀色的丹丸，药香千年不散。',eff:()=>{addItem({name:'延寿丹',type:'consumable',quality:3,count:1,desc:'服之增寿 30-80 载（在境界寿元之上）。',use:'lifespan',sell:700});return '获得「延寿丹」'}},
  {t:'一只灵鹤衔着一卷帛书落在你面前，翅羽间似有星辉流转。',eff:()=>{const n=Math.floor(120+S.root/2);S.cult+=n;return '参悟帛书，修为 +'+n}},
  {t:'你倚树小憩，梦见自己化作蝴蝶，翩翩于花间。醒来时，道心竟澄澈如洗。',eff:()=>{S.heartDemons=Math.max(0,(S.heartDemons||0)-1);if(chance(0.5)){S.attrs.wil=clamp(S.attrs.wil+1,1,40);return '庄周梦蝶，心性 +1'}return '一场大梦，心魔尽消'}},
  {t:'山间古庙，一位老僧正扫落叶。见你前来，他递来一碗清水：「施主，喝口凉茶再上路。」',eff:()=>{addMerit(5);S.hp=Math.min(S.maxHp,S.hp+Math.floor(S.maxHp*0.4));return '功德 +5，气血尽复'}},
  {t:'远方乌云翻滚，一条蛟龙正渡化形天劫！你远远观望，雷霆与龙吟之间，隐有大道真意流转。',eff:()=>{const n=Math.floor(200+rl()*30);S.cult+=n;if(chance(0.3)){S.luck=clamp(S.luck+1,1,100);return '观龙渡劫，修为 +'+n+'，气运 +1'}return '观龙渡劫，修为 +'+n}},
  {t:'夜宿破庙，梦里一位白须仙人抚顶而笑：「小子，你我有一面之缘。」',eff:()=>{const r=rand(1,3);if(r===1){S.root=clamp(S.root+5,1,100);return '仙人抚顶，灵根 +5'}if(r===2){S.luck=clamp(S.luck+2,1,100);return '仙人抚顶，气运 +2'}const n=Math.floor(300+S.root);S.cult+=n;return '仙人抚顶，修为 +'+n}},
  {t:'断崖上立着一块无字剑碑，碑身剑意纵横，四周草木皆伏。',eff:()=>{if(!S.arts.some(x=>x.name==='太乙剑诀')){S.arts.push(ARTS.find(x=>x.name==='太乙剑诀'));return '观碑悟剑，习得「太乙剑诀」'}const n=Math.floor(150+S.root/2);S.cult+=n;return '剑意入心，修为 +'+n}},
  {t:'你发现一处废弃丹炉，炉底还残着三粒丹丸，药香未散。',eff:()=>{const d=pick(['聚灵丹','破境丹','回春丹']);addItem(Object.assign({},MARKET_ITEMS.find(x=>x.name===d)));return '拾得「'+d+'」'}},
  {t:'月圆之夜，一只白狐对月吐纳。它瞥见你，竟衔来一枚温润的狐火石放在你脚边。',eff:()=>{S.luck=clamp(S.luck+1,1,100);S.mats.demonCore=(S.mats.demonCore||0)+1;return '狐赠狐火石：气运 +1、妖丹 ×1'}},
  {t:'路边酒肆，一位醉醺醺的剑客拉住你：「小友，陪我喝一杯，这柄剑就归你！」',eff:()=>{const R=doRoll('cha',14);if(R.hit){addItem({name:'青锋醉剑',type:'weapon',quality:2,bonus:3,desc:'剑客醉后所赠，剑身犹带三分酒香。',sell:350});return '陪剑客痛饮三坛，得「青锋醉剑」'}const lose=rand(10,40);S.stones=Math.max(0,S.stones-lose);return '你拼酒不敌，趴在桌上，赔了灵石 '+lose}},
  {t:'市井间流传着一则传说：乱葬岗深处有前人洞府，唯有缘者得见。你默默记下了这个传闻。',eff:()=>{S.flag.rumor=true;return '听闻「乱葬岗遗藏」传说（日后探索或有机缘寻得线索）'}},
  {t:'山道尽头立着一座半坍的古传送阵，符文在暮色中明明灭灭。',eff:()=>{openEventModal('✨ 古传送阵','<p>阵纹残破，灵光时明时灭——有人以血饲阵，有人以灵石续灵。你如何抉择？</p>',[
    {txt:'🔮 以灵石激活（80灵石）',fn:()=>{if(S.stones<80){log('<p>你摸遍行囊，灵石不足，只得悻悻离去。</p>')}else{S.stones-=80;const r=rand(1,100);if(r<=30){const g=rand(100,300);S.cult+=g;log('<p class="loot">阵光暴涨，将你卷入一处灵机充沛的古地，修为 +'+g+'！</p>')}else if(r<=65){const it=randItem(2);addItem(it);log('<p class="loot">传送尽头是一间尘封石室，你拾得「'+it.name+'」（'+QNAMES[it.quality]+'）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));log('<p class="danger">阵纹失控，空间乱流把你甩出十里外（气血-20%）。</p>')}}}},
    {txt:'📖 参悟符文（智慧判定）',fn:()=>{const R=doRoll('int',16);log('<p>你以灵识描摹阵纹：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.attrs.int=clamp(S.attrs.int+1,1,40);log('<p class="good">你悟透一角古阵道则（智慧 +1）。</p>')}else{applyInjury('shenhun');log('<p class="danger">阵纹反噬识海，你头晕目眩，只能作罢。</p>')}}},
    {txt:'🚶 绕道而行',fn:()=>{log('<p>你记下方位，决定来日境界更高时再探此阵。</p>')}}
  ]);return ''}},
  {t:'雷云低垂的山谷深处，一座天然雷池翻涌着电浆，灵光灼目。',eff:()=>{
    if(rootFused(S)){const n=Math.floor(150+S.root/3);S.cult+=n;return '雷池淬体，你已灵根两系相融，只觉通体舒泰（修为 +'+n+'）'}
    openEventModal('⚡ 天然雷池','<p>雷池电浆翻涌，灼热的气浪扑面而来。传说在雷池中淬体，有极小概率引雷觉醒变异灵根；若以双系灵根入池，或可熔炼为<b>融合灵根</b>。</p>',[
      {txt:'⚡ 入池淬体（凶险）',cls:'danger',fn:()=>{const R=doRoll('wil',18);log('<p>你咬牙踏入雷池：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){
        const r=rand(1,100);
        if(r<=15){S.rootElem='thunder';log('<p class="loot">雷光贯体，你痛得几乎昏死过去——醒来时，灵根已蜕变为<b>雷灵根（变异）</b>！</p>')}
        else if(r<=40){const b=S.rootElem;const fuse=pick(['metal','wood','water','fire','earth'].filter(e=>e!==b));fuseRoot(S,b,fuse);log('<p class="loot">两股灵根在雷光中纠缠熔炼，竟凝为一体——你觉醒了<b>融合灵根</b>「'+S.rootFuseName+'」！</p>')}
        else{S.root=clamp(S.root+3,1,100);log('<p class="good">雷光淬体，灵根 +3。</p>')}
        S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));log('<p>你踉跄爬出雷池，浑身焦黑（气血-20%）。</p>');
      }else{applyInjury('neijing');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.3));log('<p class="danger">雷光灌体，你被击飞出去，经脉受损、气血大损。</p>')}passTime(3);renderAll()}},
      {txt:'🚶 敬而远之，绕行',fn:()=>{log('<p>你望着翻涌的雷池，终究压下了贪念。</p>');passTime(1);renderAll()}},
    ]);
    return ''}},
  {t:'一处上古洞府残骸中，一卷染血的混沌残卷静静躺在蒲团上。',eff:()=>{
    if(rootFused(S)||S.root<60){const n=Math.floor(100+S.root/3);S.cult+=n;return '参悟残卷，可惜你灵根未合，只得了些修为（修为 +'+n+'）'}
    openEventModal('📜 混沌残卷','<p>残卷上字迹斑驳，却隐隐有两道灵光流转。传闻此卷可助双灵根者熔炼归一——你如今的灵根，可愿一试？</p>',[
      {txt:'☯️ 以本命灵根引动残卷（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',20);log('<p>你以灵识浸入残卷：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const b=S.rootElem;const fuse=pick(['metal','wood','water','fire','earth'].filter(e=>e!==b));fuseRoot(S,b,fuse);log('<p class="loot">两系灵根在残卷灵光中交织相融——你觉醒了<b>融合灵根</b>「'+S.rootFuseName+'」！</p>')}else{applyInjury('shenhun');log('<p class="danger">残卷灵光反噬，你神魂震荡（神魂受创）。</p>')}passTime(2);renderAll()}},
      {txt:'📿 郑重收好，日后再说',fn:()=>{log('<p>你将残卷收入怀中，直觉此物缘分未至。</p>');passTime(1);renderAll()}},
    ]);
    return ''}},
];
const DANGER_V=[
  {run:()=>{log('<p>你脚下一空，跌入一处毒瘴深谷！</p>');const R=doRoll('wil',18);log('<p>生死判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));return '<p class="good">你屏息凝神，硬闯出瘴谷，虽受些伤，性命无虞（气血 -15%）。</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.5));
    if(S.hp<=1){die('瘴气噬体');return false}
    return '<p class="danger">毒气入体，你挣扎三日方脱困，气血折损过半！</p>'}},
  {run:()=>{log('<p>悬崖边生着一株朱果，娇艳欲滴，崖下深不见底。</p>');
    logChoices([{txt:'🍒 伸手去摘（暗藏凶险）',fn:()=>{
      const r=d20();
      if(r<=2){die('失足坠崖');return}
      if(r<=8){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.3));log('<p class="danger">指尖堪堪触到朱果，脚下碎石崩落，你坠了数丈，被枯藤挂住，气血大损。</p>')}
      else{const g=rand(60,150);S.cult+=g;log('<p class="loot">你摘下朱果囫囵吞下，一股暖流直灌丹田，修为 +'+g+'！</p>')}
      renderAll();}}]);
    return '<p>你停步崖前。</p>'}},
  {run:()=>{log('<p>你误入一座荒坟，阴风阵阵，一道鬼影扑面而来！</p>');startCombat({name:'荒坟厉鬼',atk:6+rl()*2,def:2+rl(),hp:22+rl()*12});return ''}},
  {run:()=>{log('<p>天色将晚，你借宿一座荒村，村中竟无一人。</p>');const R=doRoll('wil',18);log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.cult+=80;return '<p class="good">夜半鬼哭，你心若磐石，反而于静寂中悟得一丝修为（修为 +80）。</p>'}
    S.heartDemons++;return '<p class="danger">噩梦缠身，你惊醒时满身冷汗，心魔留下烙印（心魔+1）。</p>'}},
  {run:()=>{log('<p>山道轰然塌陷，你被卷入地底裂缝！</p>');const R=doRoll('agi',16);log('<p>身法判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const g=rand(60,200);S.stones+=g;return '<p class="loot">你于裂缝中寻到一处矿脉，撬得灵石 '+g+' 块。</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));return '<p class="danger">乱石压身，你费尽气力才爬出，气血大损。</p>'}},
  {run:()=>{log('<p>两道血色身影从暗处掠出——是血魔宗弟子，竟在此设伏！</p>');startCombat({name:'血魔宗伏杀者',atk:8+rl()*2,def:3+rl(),hp:30+rl()*14,elem:'fire'});return ''}},
  {run:()=>{log('<p>林中雾气渐浓，你忽觉眼前景象扭曲——心魔幻境，不请自来。</p>');const R=doRoll('wil',20);log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.attrs.wil=clamp(S.attrs.wil+1,1,40);return '<p class="good">幻境破碎，你道心愈发圆满（心性+1）。</p>'}
    S.heartDemons++;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));return '<p class="danger">幻境噬心，你凭一线清明挣出（心魔+1，气血-15%）。</p>'}},
  {run:()=>{log('<p>迷雾骤起，你误入一座阴气森森的「鬼市」——摊位上的人脸灯笼正朝你眨眼睛。</p>');
    logChoices([
      {txt:'💎 破财消灾（50灵石）',fn:()=>{if(S.stones>=50){S.stones-=50;log('<p class="sys">你丢下一袋灵石，趁雾遁走。身后传来窃窃笑声。</p>')}else{const it=S.items.shift();log('<p class="danger">你囊中羞涩，被摊主揪住袖子，夺走了一件随身之物'+(it?'：「'+it.name+'」':'')+'！</p>')}renderAll()}},
      {txt:'🧭 壮胆穿行（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',17);log('<p>你目不斜视，大步穿过鬼市：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(80,200);S.cult+=g;log('<p class="loot">你竟在鬼市角落拾得一枚聚魂玉，参悟其中残念（修为 +'+g+'）。</p>')}else{S.heartDemons++;log('<p class="danger">鬼哭入耳，你心神失守，添了一道心魔烙印（心魔+1）。</p>')}renderAll()}}
    ]);
    return ''}},
  {run:()=>{log('<p>一株血色食人藤从暗处暴起，藤蔓缠向你的脚踝！</p>');const R=doRoll('str',15);log('<p>力量判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.mats.sherb=(S.mats.sherb||0)+1;return '<p class="loot">你扯断藤蔓，发现藤心竟结着一枚血色灵果（灵草 ×1）。</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));return '<p class="danger">藤蔓缠身，你挣扎半日方脱困（气血-20%）。</p>'}},
  {run:()=>{log('<p>眼前古墓洞开，一具披甲尸傀直挺挺跳了出来，尸气扑面！</p>');startCombat({name:'披甲尸傀',atk:7+rl()*2,def:3+rl(),hp:32+rl()*13,elem:'earth'});return ''}},
  {run:()=>{log('<p>暴雨倾盆，山洪裹挟着碎石轰然冲下，避无可避！</p>');const R=doRoll('agi',16);log('<p>身法判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));return '<p class="sys">你攀住崖壁老藤，躲过洪峰，只湿了半身（气血-10%）。</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.3));const inj=applyInjury('jiqiao');return '<p class="danger">洪流把你卷入乱石滩，磕得头破血流（气血-30%）。</p>'+(inj||'')}},
  {run:()=>{log('<p>瘴雾漫过山道，你只觉四肢发沉，呼吸急促——毒瘴入体！</p>');const R=doRoll('wil',17);log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));return '<p class="sys">你以灵力护体硬闯而出，只受了些皮肉苦（气血-15%）。</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));const inj=applyInjury('neijing');return '<p class="danger">毒气攻入经脉，你挣扎数日才寻得解药（气血-25%）。</p>'+(inj||'')}},
  {run:()=>{log('<p>心魔趁你心神松懈骤然反扑，识海剧震，眼前幻象丛生！</p>');const R=doRoll('wil',19);log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const g=Math.floor(60+S.root/3);S.cult+=g;return '<p class="good">你咬牙斩断幻象，反从心魔处夺回一缕真元（修为 +'+g+'）。</p>'}
    S.heartDemons++;const inj=applyInjury('shenhun');return '<p class="danger">心魔噬魂，你虽挣出，神魂却受了重创（心魔+1）。</p>'+(inj||'')}},
  {run:()=>{log('<p>暴雨如注，一道天雷竟直直劈向你的头顶！</p>');const R=doRoll('agi',18);log('<p>身法判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const n=Math.floor(60+S.root/4);S.cult+=n;return '<p class="good">你于电光火石间侧身避开，余雷淬体，修为反涨（修为 +'+n+'）。</p>'}
    if(chance(0.15)){S.root=clamp(S.root+2,1,100);S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.3));return '<p class="danger">雷光贯体，你皮开肉绽（气血-30%），却意外引雷淬体（灵根 +2）！</p>'}
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.35));return '<p class="danger">你被雷劈了个正着，气血大损（气血-35%）。</p>'}},
  {run:()=>{log('<p>山道转角，一伙凡人山贼拦路，为首的却满脸赔笑：「仙、仙长，小的们有眼不识泰山……」</p>');
    logChoices([
      {txt:'😄 教训一顿，放他们走（功德+1）',cls:'primary',fn:()=>{addMerit(1);log('<p>你随手挥出一道灵光，山贼们连滚带爬逃下山去。</p>');renderAll()}},
      {txt:'💰 让他们交出孝敬（灵石+80）',fn:()=>{S.stones+=80;log('<p class="loot">山贼们凑了一袋碎银灵石，恭恭敬敬奉上（灵石 +80）。</p>');renderAll()}},
      {txt:'🖐️ 化作清风飘然离去',fn:()=>{log('<p>你足尖一点，踏风而去。山贼们跪了一地，直呼神仙。</p>');renderAll()}}
    ]);
    return ''}},
  {run:()=>{log('<p>一缕幽魂飘至你面前，自称三百年前的散修，想借你肉身「暂住」数日。</p>');
    logChoices([
      {txt:'🧘 坚定拒绝，驱逐幽魂（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',18);log('<p>你凝神一喝：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const n=Math.floor(150+S.root/3);S.cult+=n;log('<p class="loot">幽魂喟叹一声，消散前留下一缕生前感悟（修为 +'+n+'）。</p>')}else{S.heartDemons++;log('<p class="danger">幽魂趁隙而入，你费尽心力才将其驱出，却留下心魔烙印（心魔+1）。</p>')}renderAll()}},
      {txt:'🙏 与之约定，结一段善缘',fn:()=>{if(chance(0.5)){const a=Object.assign({},pick(ARTS));if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);log('<p class="loot">幽魂感你诚意，传你一篇功法《'+a.name+'》。</p>')}else{const n=Math.floor(100+S.root/4);S.cult+=n;log('<p class="good">幽魂传你一段口诀（修为 +'+n+'）。</p>')}}else{S.heartDemons++;log('<p class="danger">幽魂食言而肥，反噬你一道心神（心魔+1）。</p>')}renderAll()}}
    ]);
    return ''}},
];

const ENCOUNTERS={
  calm:()=>{const v=pick(CALM_V);const s=v.eff();log('<p>'+v.t+'</p>'+(s?'<p class="good">'+s+'。</p>':''));},
  herb:()=>{const v=pick(HERB_V);let s=v.eff();if(petAlive()&&S.pet.talent==='herb'){S.mats.herb=(S.mats.herb||0)+1;s+='，灵宠还寻得一株暗藏灵草'};log('<p class="good">'+v.t+' <b>'+s+'</b>。</p>');},
  beast:()=>{
    if(exHateAmbush())return '';
    const foe=S.npcs.find(n=>n.foe);
    if(foe&&!S.flag.foeAmbush&&chance(0.35)){
      S.flag.foeAmbush=true;
      log('<p>林深处忽然传来一声冷笑——<b>'+esc(foe.name)+'</b> 竟一路追到了这里！</p>');
      startCombat({name:foe.name,atk:foe.atk,def:2+Math.floor(foe.realm/3),hp:foe.hp});
      return '';
    }
    const nm=enemyName();
    log('<p>林深处腥风骤起，一头 <b>'+nm+'</b> 拦住了去路！</p>');
    startCombat(makeEnemy());
    return '';
  },
  rare:()=>{
    if(S.trinket&&S.trinket.name==='无字木牌'&&S.realm>=9&&!S.flag.dreamDone){
      log('<p>怀中那枚无字木牌突然滚烫，你眼前一黑——一段尘封的因果将你卷入梦境……</p>');
      S.flag.dreamDone=true;
      enterDungeon('dream');
      return '';
    }
    const v=pick(RARE_V);
    const s=v.eff();
    log('<p class="loot">'+v.t+' <b>'+s+'</b>。</p>');
    return '';
  },
  epic:()=>{
    log('<p>前方灵光冲天，分明是秘境现世之兆！你强压心潮，向前走去……</p>');
    enterDungeon(pick(['cave','ruin','nest','sword']));
    return '';
  },
  danger:()=>{
    const v=pick(DANGER_V);
    return v.run();
  },
};
function enemyName(){
  const pool=['野狼','赤目妖狼','铁背妖熊','花斑毒蟒','血纹蜘蛛','山魈','尸傀','鬼面鸦'];
  return pick(pool);
}
function makeEnemy(){
  const ri=rl();
  const pool=[
    ['野狼',4,1,20],['赤目妖狼',6,2,35],['铁背妖熊',8,3,55],['花斑毒蟒',10,4,80],
    ['血纹蜘蛛',12,5,110],['山魈',14,6,150],['尸傀',16,7,200],['鬼面鸦',18,8,260],
  ];
  const e=pool[clamp(Math.floor(ri/2),0,pool.length-1)];
  return {name:e[0],atk:e[1]+ri,def:e[2]+Math.floor(ri/3),hp:e[3]+ri*8,elem:pick(['metal','wood','water','fire','earth']),style:pick(['rapid','guard','poison','burst'])};
}
