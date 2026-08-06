/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 秘境副本 ================
====================================================== */
'use strict';
/* ================= 秘境副本 ================= */
const DUNGEONS={
  cave:{
    name:'古修士洞府',
    rooms:[
      {desc:'石门半掩，青苔覆阶。门内传出一股若有若无的药香。',
       opts:[{txt:'推门而入',dc:12,stat:'agi',succ:'你侧身闪入，避开门口的机关飞针。',fail:'你触动禁制，被一道灵光轰出，气血受损。',eff:s=>{if(!s.flag.d1)s.flag.d1=true;return ['hp',-10]}}]},
      {desc:'洞中石桌上摆着三只玉匣，一只刻着「药」，一只刻着「兵」，一只无字。',
       opts:[{txt:'取「药」匣',dc:0,succ:'',fail:'',eff:s=>{s.mats.sherb=(s.mats.sherb||0)+3;return ['mat','灵草 ×3']}},
             {txt:'取「兵」匣',dc:0,succ:'',fail:'',eff:s=>{addItem(randItem(2));return ['item','一件法器']}},
             {txt:'取无字匣（暗藏凶险）',dc:16,stat:'wil',succ:'匣中是一枚古朴玉简，记载着失传功法！',fail:'匣中窜出一道怨灵，噬你气血！',eff:s=>{if(Math.random()<0.5){s.arts.push(pick(ARTS));return ['art','随机功法']}s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.3));return ['hp',-30]}}]},
      {desc:'洞府深处，一具枯骨盘坐蒲团之上，膝前放着一盏灯，灯芯竟还在燃烧。',
       opts:[{txt:'向枯骨叩首参拜',dc:0,succ:'',fail:'',eff:s=>{s.cult+=180;return ['cult','修为 +180']}},
             {txt:'吹熄那盏灯',dc:18,stat:'wil',succ:'灯火熄灭的刹那，一道金光没入你眉心——是那位前辈的毕生感悟！',fail:'灯焰暴涨，焚毁了你的一缕发丝与心神。',eff:s=>{if(Math.random()<0.5){s.attrs.wil=clamp(s.attrs.wil+2,1,40);return ['wil','心性 +2']}s.heartDemons++;return ['demon','心魔 +1']}}]}
    ],
    final:'你携宝而出，回望洞府，石门缓缓合拢，仿佛从未存在过。'
  },
  ruin:{
    name:'荒古遗迹',
    rooms:[
      {desc:'残垣断壁间立着一根石柱，柱上刻满上古符文。',
       opts:[{txt:'以指临摹符文',dc:14,stat:'int',succ:'符文在你指下逐一亮起，一道灵光没入识海。',fail:'符文反噬，你眼前一黑。',eff:s=>{s.cult+=150;return ['cult','修为 +150']}}]},
      {desc:'遗迹中央是一方祭坛，坛上悬浮着一团明灭不定的光。',
       opts:[{txt:'伸手触碰光团',dc:0,succ:'',fail:'',eff:s=>{const g=rand(200,600);s.stones+=g;return ['stone',g+' 灵石']}},
             {txt:'以灵根引动祭坛',dc:15,stat:'wil',succ:'祭坛轰鸣，一道传承灌入你体内！',fail:'祭坛崩裂，你被气浪掀飞。',eff:s=>{if(Math.random()<0.5){s.root=clamp(s.root+3,1,100);return ['root','灵根 +3']}s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.2));return ['hp',-20]}}]}
    ],
    final:'遗迹在身后轰然坍塌，你于尘土中拾回此行收获。'
  },
  nest:{
    name:'妖兽巢穴',
    rooms:[
      {desc:'巢穴入口堆满白骨，深处传来低沉的呼吸声。',
       opts:[{txt:'潜行进入',dc:13,stat:'agi',succ:'你贴着岩壁无声潜入。',fail:'你踩断枯骨，惊动了巢穴主人！',eff:s=>{s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.15));return ['hp',-15]}}]},
      {desc:'巢穴深处卧着一头幼年妖蛟，身下压着一枚流光溢彩的蛋。',
       opts:[{txt:'取走妖蛋',dc:0,succ:'',fail:'',eff:s=>{addItem({name:'神秘妖蛋',type:'egg',quality:3,use:'hatch',desc:'蛋壳上流转着龙纹，似有不凡来历，可在行囊中使用孵化。'});return ['item','神秘妖蛋']}},
             {txt:'尝试与妖蛟沟通',dc:16,stat:'cha',succ:'妖蛟竟通人言，认你为主，赠你一缕蛟血！',fail:'妖蛟暴起，你仓皇而逃。',eff:s=>{if(Math.random()<0.5){s.root=clamp(s.root+5,1,100);return ['root','灵根 +5']}s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.25));return ['hp',-25]}}]}
    ],
    final:'你退出巢穴时，那头幼蛟在洞中发出一声长啸，似在为谁送行。'
  },
  sword:{
    name:'上古剑冢',
    rooms:[
      {desc:'万剑插地，剑意如潮。每一柄残剑都在低吟，仿佛在等一个能听懂的人。',
       opts:[{txt:'拔起最近的那柄锈剑',dc:12,stat:'agi',succ:'你侧身避开剑意反噬，将锈剑拔出。',fail:'剑意凛冽如割，划破了你的手臂。',eff:s=>['hp',-12]},
             {txt:'盘坐剑冢中央，静心感受剑意',dc:15,stat:'int',succ:'万剑剑意灌入识海，你对兵刃之道豁然开朗。',fail:'剑意驳杂如刃，刺得你气血翻涌。',eff:s=>{if(Math.random()<0.6){s.cult+=220;return ['cult','修为 +220']}return ['hp',-15]}}]},
      {desc:'剑冢尽头，一柄古剑悬浮于祭坛之上，剑灵化作朦胧人形，静静凝视着你。',
       opts:[{txt:'以剑意回应剑灵之约',dc:18,stat:'wil',succ:'剑灵长鸣，古剑化作流光入你掌中，认你为主！',fail:'剑灵轻轻摇头，剑光一闪，将你送出剑冢。',eff:s=>{if(Math.random()<0.6){addItem({name:'太初古剑',type:'weapon',quality:4,bonus:6,desc:'上古剑冢之主，剑出则天地色变。',sell:3000});return ['item','太初古剑（神品）']}return ['hp',-20]}},
             {txt:'转身离去，不贪此剑',dc:0,succ:'',fail:'',eff:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40);return ['wil','心性 +1']}}]
      }
    ],
    final:'你走出剑冢，身后万剑齐鸣，似在为这一段缘分送行。'
  },
  dream:{
    name:'上古残梦',
    rooms:[
      {desc:'眼前是无边荒原，一轮血月悬空。风中传来若有若无的呼唤，似是自己的名字。',
       opts:[{txt:'循声而去',dc:16,stat:'wil',succ:'你在梦中斩碎一重幻影，道心更坚。',fail:'幻影趁隙而入，在你心间留下一道裂痕。',eff:s=>{if(Math.random()<0.6){s.attrs.wil=clamp(s.attrs.wil+1,1,40);return ['wil','心性 +1']}s.heartDemons++;return ['demon','心魔 +1']}},
              {txt:'静坐不动，抱元守一',dc:14,stat:'int',succ:'你于梦魇中悟出一段修行至理。',fail:'梦魇缠身，你惊醒时已是一身冷汗。',eff:s=>{s.cult+=260;return ['cult','修为 +260']}}]},
      {desc:'荒原尽头立着一座天衍古碑，碑文流转，恰似你在破庙中见过的那半截石碑。',
       opts:[{txt:'参悟碑文',dc:18,stat:'int',succ:'碑文入心，你只觉灵台前所未有的清明。',fail:'碑文反噬，你头痛欲裂。',eff:s=>{if(Math.random()<0.5){s.root=clamp(s.root+3,1,100);return ['root','灵根 +3']}s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.2));return ['hp',-20]}},
             {txt:'长跪叩首，以诚动天',dc:18,stat:'wil',succ:'古碑震颤，一缕金气没入你的眉心。',fail:'天地不仁，一股戾气反噬道心。',eff:s=>{if(Math.random()<0.5){s.luck=clamp(s.luck+2,1,100);return ['luck','气运 +2']}s.heartDemons++;return ['demon','心魔 +1']}}]}
    ],
    final:'你缓缓睁眼，仍坐在青石小径旁。手中木牌已碎成齑粉，随风散入尘埃。'
  },
  ice:{
    name:'寒渊冰宫',
    rooms:[
      {desc:'冰宫入口悬着一座寒冰桥，桥下是深不见底的寒渊，雾气凝霜，寒意刺骨。',
       opts:[
         {txt:'御风踏冰而过',dc:14,stat:'agi',succ:'你足尖点冰，如燕掠过寒渊。',fail:'冰桥震颤，你滑落半丈，撞在桥沿（气血受损）。',eff:s=>['hp',-12]},
         {txt:'以真元暖身，稳步前行',dc:0,succ:'',fail:'',eff:s=>{if(useSpirit(20)){s.mats.jade=(s.mats.jade||0)+1;return ['mat','寒玉 ×1']}return ['hp',-8]}}
       ]},
      {desc:'冰宫深处悬着一具玄冰棺，棺中女子眉目如画，怀中抱着一枚流光玉简。',
       opts:[
         {txt:'取走玉简（谨慎）',dc:16,stat:'int',succ:'玉简入怀，冰棺悄然合拢。',fail:'棺中女子睁眼，一缕寒息直入识海！',eff:s=>{if(Math.random()<0.55){s.cult+=300;return ['cult','修为 +300']}s.heartDemons++;return ['demon','心魔 +1']}},
         {txt:'郑重一礼，不取一物',dc:0,succ:'',fail:'',eff:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40);return ['wil','心性 +1']}}
       ]},
      {desc:'冰宫尽头立着一座万年寒心，寒气凝成实质，沁入骨髓。',
       opts:[
         {txt:'引寒心入体淬体（力量判定）',dc:17,stat:'str',succ:'寒心化作暖流，你的体魄为之一变！',fail:'寒气反噬，你冻僵当场。',eff:s=>{if(Math.random()<0.5){s.attrs.str=clamp(s.attrs.str+2,1,40);return ['str','力量 +2']}s.hp=Math.max(1,s.hp-Math.floor(s.maxHp*0.2));return ['hp',-20]}},
         {txt:'取走寒心，留待炼器',dc:0,succ:'',fail:'',eff:s=>{s.mats.jade=(s.mats.jade||0)+2;s.mats.demonCore=(s.mats.demonCore||0)+1;return ['mat','寒玉 ×2 · 妖丹 ×1']}}
       ]}
    ],
    final:'你退出冰宫，身后寒气如幕缓缓合拢。此行收获，尽付一壶温酒。'
  },
};
/* 秘境册：按类型记录通关（行迹图鉴展示） */
function recordDungeonDone(kind){
  if(!S||!kind)return;
  S.flag.dungeonDone=S.flag.dungeonDone||{};
  S.flag.dungeonDone[kind]=true;
}
function enterDungeon(kind){
  const d=DUNGEONS[kind];
  S.dungeon={kind,depth:0};
  log('<p class="sys">【秘境副本 · '+d.name+'】共 '+d.rooms.length+' 重险关，选择将决定你的收获。</p>');
  dungeonRoom();
}
function optIcon(t){
  const map=[[/取|拔|夺|偷|摘/,'🖐️'],[/参|悟|读|看|临摹|感受/,'📖'],[/盘坐|静坐|静心|抱元|打坐/,'🧘'],[/叩|拜/,'🙏'],
    [/吹|触|按|推|开|回应/,'✋'],[/走|离去|转身|退/,'🚶'],[/战|应战/,'⚔️'],[/潜/,'🕵️']];
  for(const [re,i] of map)if(re.test(t))return i;
  return '🧭';
}
function dungeonRoom(){
  if(!S.dungeon||!DUNGEONS[S.dungeon.kind])return;
  const d=DUNGEONS[S.dungeon.kind];
  const room=d.rooms[S.dungeon.depth];
  S.dungeon.depth++;
  scene(d.name+' · 第 '+S.dungeon.depth+' 重');
  log('<p>'+room.desc+'</p>');
  const btns=room.opts.map(o=>({txt:optIcon(o.txt)+' '+o.txt,fn:()=>{
    if(o.dc>0){
      const R=doRoll(o.stat,o.dc);
      log('<p>判定（'+({str:'力量',agi:'身法',int:'智慧',cha:'魅力',wil:'心性'})[o.stat]+'）：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
      if(R.hit)log('<p class="good">'+o.succ+'</p>');else log('<p class="danger">'+o.fail+'</p>');
    }
    const [kind,val]=o.eff(S);
    if(kind==='item')log('<p class="loot">获得：'+val+'</p>');
    else if(kind==='mat')log('<p class="loot">获得：'+val+'</p>');
    else if(kind==='art')log('<p class="loot">习得功法：'+val+'</p>');
    else if(kind==='stone')log('<p class="loot">获得：'+val+'</p>');
    else if(kind==='cult')log('<p class="good">'+val+'</p>');
    else if(kind==='wil')log('<p class="good">'+val+'</p>');
    else if(kind==='root')log('<p class="good">'+val+'</p>');
    else if(kind==='luck')log('<p class="good">'+val+'</p>');
    else if(kind==='demon')log('<p class="danger">'+val+'</p>');
    else if(kind==='hp')log('<p class="danger">'+val+'</p>');
    if(S.dungeon.depth<d.rooms.length){
      if(S.hp<=1){die('重伤不治');return}
      dungeonRoom();
    }else{
      if(S.dungeon.kind==='dream'){S.trinket=null;S.cult+=500;log('<p class="good">梦醒时分，木牌化作齑粉，一段因果就此了结（修为 +500）。</p>')}
      log('<p class="loot">'+d.final+'</p>');
      recordDungeonDone(S.dungeon.kind);
      S.dungeon=null;
      S.flag.dungeons=(S.flag.dungeons||0)+1;
      const g=Math.floor(eventGift()*0.05+rl()*5);S.cult+=g;
      log('<p class="loot">天地灵气灌体，此番秘境之行化作实打实的修为（修为 +'+g+'）。</p>');
      maybeInsight('秘境险关');
      if(!passTime(3)){renderAll();return}
      maybeBreakHint();renderAll();
    }
  }}));
  logChoices(btns);
}
