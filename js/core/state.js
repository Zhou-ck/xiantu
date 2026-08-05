/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 游戏状态 ================
====================================================== */
'use strict';
/* ================= 游戏状态 ================= */
let S=null;
let ROLL_LOG=[];

function newState(name,bg,gender){
  const s={
    name:name,bg:bg,gender:gender||'男',attrs:{str:0,agi:0,int:0,cha:0,wil:0},
    root:0,luck:0,realm:0,cult:0,hp:100,maxHp:100,stones:0,
    items:[],arts:[],mats:{},weapon:null,armor:null,trinket:null,
    sect:null,sectStage:null,contrib:0,contribVal:0,rank:0,tasks:null,bigCd:0,sectNpcs:[],companion:null,
    persona:null,daoPath:null,
    prof:null,profLevel:0,profExp:0,
    npcs:[],daoPartner:null,affairs:[],disciples:[],children:[],master:null,enemy:null,
    quests:{cult:false,explore:false,realm3:false,zhuji:false},daily:null,
    merit:0,karma:0,pet:null,titles:[],
    fame:{zheng:0,mo:0,san:0},
    seenE:{},seenI:{},wins:0,heartTrains:0,
    heartDemons:0,kills:0,deaths:0,rebirths:0,memories:[],
    demonMarks:[],
    set:{fx:'med',autoTrib:false,autoCraft:false,audio:true,shake:true},
    age:16,years:0,days:0,pillBuff:0,temp:{break:0},mood:60,
    cultStreak:0,lifeBonus:0,
    flag:{},dungeon:null,eventChain:null,logCount:0,endings:[],
  };
  s.attrs={str:rand(1,20),agi:rand(1,20),int:rand(1,20),cha:rand(1,20),wil:rand(1,20)};
  s.root=clamp(rand(1,100)+(bg.root||0),1,100);
  s.rootElem=pickRootElem();
  s.injuries=[];
  s.weaponMaster={};
  s.luck=rand(1,100);
  for(const k in bg.mods)s.attrs[k]=clamp(s.attrs[k]+bg.mods[k],1,30);
  s.stones=rand(50,200)+bg.stones;
  s.arts=[Object.assign({},bg.art)];
  if(bg.traits.some(t=>t.id==='smith'))s.mats.iron=2;
  if(bg.traits.some(t=>t.id==='herb')||bg.traits.some(t=>t.id==='healer'))s.mats.herb=2;
  const it=Object.assign({},pick(STARTER_ITEMS));
  if(it.type==='weapon')s.weapon=it;else if(it.type==='armor')s.armor=it;
  else if(it.type==='trinket')s.trinket=it;else s.items.push(it);
  s.maxHp=calcMaxHp(s);s.hp=s.maxHp;
  s.npcs=genNPCs(s);
  /* 家族兴衰链：世家嫡女出身即埋下因果 */
  if(bg.id==='family'){
    s.flag.chain={jiazu:1};
    s.flag.foreshadow=[{name:'家族兴衰链',at:0,resolver:null}];
  }
  return s;
}

function calcMaxHp(s){return Math.max(1,40+s.attrs.str*3+Math.floor(powR(s.realm)*15)-injuryHpPenalty(s))}
function attrVal(s,k){return s.attrs[k]+bonusAttr(s,k)+injuryAttrPenalty(s,k)}
function bonusAttr(s,k){let b=0;for(const a of s.arts)b+=(a.bonus&&a.bonus[k])||0;return b}
/* 属性成长：使用即成长。属性越高，成长概率越低（边际递减，上限 40） */
function growChance(v,base){return base*clamp(1.2-(v||0)/25,0.25,1)}
function growAttr(k,base,src){
  if(!S)return '';
  const v=S.attrs[k]||0;
  if(v>=40)return '';
  if(chance(growChance(v,base))){
    S.attrs[k]=clamp(v+1,1,40);
    if(k==='str'){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
    return '<p class="good">'+src+'（'+ATTR_NAMES[k]+' +1，现 '+S.attrs[k]+'）。</p>';
  }
  return '';
}
/* 心性专属成长：道心勤修必有所得，递减曲线比通用属性温和得多 */
function growWil(base,src){
  if(!S)return '';
  const v=S.attrs.wil||0;
  if(v>=40)return '';
  /* 炼气期道心未定，可塑性更强，成长提速 50%；筑基后回归常规 */
  const mult=S.realm<9?1.5:1;
  const p=base*clamp(1.5-v/32,0.3,1)*mult;
  if(chance(p)){
    S.attrs.wil=clamp(v+1,1,40);
    return '<p class="good">'+src+'（心性 +1，现 '+S.attrs.wil+'）。</p>';
  }
  return '';
}
/* 属性 → 实际能力换算（数值成长会同步强化这些能力） */
/* 恐惧烙印：战斗先手 -1/道 */
function atkBonus(s){return attrVal(s,'str')+weaponAtk(s)+(s.bg&&s.bg.traits.some(t=>t.id==='combat')?2:0)-demonFearAtk(s)+(s.bond?1+s.bond.level:0)}
function dodgeBonus(s){return Math.floor(attrVal(s,'agi')/4)}
function insightBonus(s){return Math.floor(attrVal(s,'int')/8)}
function favorBonus(s){return Math.floor(attrVal(s,'cha')/6)}
function weaponAtk(s){let b=(s.weapon&&s.weapon.bonus)||0;if(s.flag.combatBuff)b+=s.flag.combatBuff;if(s.flag.tAttack)b+=s.flag.tAttack;b+=elemWeaponBonus(s)+weaponMasterBonus(s);return b}
function armorDef(s){return (s.armor&&s.armor.bonus)||0}
function trinketAll(s){return (s.trinket&&s.trinket.bonus)||0}
function cultMult(s){
  /* 主修（第一门）全额，辅修 50%；品阶与灵根品质修正 */
  let m=1;
  for(let i=0;i<s.arts.length;i++){
    const a=s.arts[i];
    const role=i===0?1:0.5;
    m*=(a.mult+((a.level||1)-1)*0.05)*artGradeMult(a)*elemArtMult(s,a)*role;
  }
  m*=rootQualityMult(s.root);
  if(s.root>=70)m*=1.05; /* 8.3 吐纳加速 */
  if(s.realm<=2)m*=1.2; /* 新人加成：炼气三层前修炼效率 +20% */
  if(s.pillBuff>0)m*=1.5;
  if(s.daoPartner)m*=1.2;
  if(s.flag.matrix)m*=1.15;
  const sg=signNow();
  if(sg&&sg.cult)m*=sg.cult;
  if(s.sect&&s.sect.dark&&(s.bg.traits.some(t=>t.id==='dark')||s.bg.traits.some(t=>t.id==='dark2')))m*=1.1;
  if(s.prof==='alchemy'&&s.sect&&s.sect.id==='dan')m*=1.08;
  if(s.sect)m*=1+sectCultBonus(s);
  if(s.flag.dao==='dark')m*=1.1; /* 魔道问道：魔功更盛 */
  if(s.flag.caveLv)m*=1+(s.flag.caveLv||0)*0.08; /* 3.2 洞府灵脉等级 */
  if(s.flag.caveRooms&&s.flag.caveRooms.jing)m*=1.05; /* 11 静室 */
  if(s.days%12<2)m*=1.1; /* 3.2 子时静修 +10% */
  const se=Math.floor(s.days/90)%4;
  if(se===0)m*=1.05;
  if(se===3)m*=0.95;
  if(s.pet&&s.pet.faint<=0&&(s.pet.talent==='root'||s.pet.talent==='speed'))m*=1.05;
  return m;
}
function effWil(s){
  const sg=signNow();
  const qj=(s.flag&&s.flag.qingjie)>0?-2:0;
  return attrVal(s,'wil')-Math.min(s.heartDemons,4)+s.temp.break+qj+(sg&&sg.wil?sg.wil:0);
}
function lifespanStr(s){const l=LIFESPANS[s.realm]+(s.lifeBonus||0);return isFinite(l)?l+' 岁':'∞'}
/* 连续闭关收益递减：满 60 日后每 30 日 -10%，最低 40% */
function streakDiminMult(streak,days){
  let total=0,n=0;
  for(let d=0;d<days;d+=10){
    const pos=(streak||0)+d;
    let m=1;
    if(pos>=60)m=Math.max(0.4,1-0.1*(1+Math.floor((pos-60)/30)));
    total+=m;n++;
  }
  return n?total/n:1;
}

function passTime(days){
  if(arguments[1]!==true)S.cultStreak=0;
  S.days+=days;S.age+=days/365;S.years=S.days/365;
  if(S.pillBuff>0)S.pillBuff=Math.max(0,S.pillBuff-days);
  if(S.flag.clearCd>0)S.flag.clearCd=Math.max(0,S.flag.clearCd-days);
  if(S.flag.hardshipCd>0)S.flag.hardshipCd=Math.max(0,S.flag.hardshipCd-days);
  if(S.flag.readCd>0)S.flag.readCd=Math.max(0,S.flag.readCd-days);
  if(S.flag.qixiLeft>0)S.flag.qixiLeft=Math.max(0,S.flag.qixiLeft-days);
  if(S.flag.qingjie>0)S.flag.qingjie=Math.max(0,S.flag.qingjie-days);
  if(S.bigCd>0)S.bigCd=Math.max(0,S.bigCd-days);
  if(S.flag.trialCd>0)S.flag.trialCd=Math.max(0,S.flag.trialCd-days);
  if(S.pet&&S.pet.faint>0)S.pet.faint=Math.max(0,S.pet.faint-days);
  if(S.flag.farm&&S.flag.farm.crop&&S.flag.farm.planted+S.flag.farm.days<=S.days&&!S.flag.farm.notified){
    S.flag.farm.notified=true;
    log('<p class="loot">🌾 灵田中飘来阵阵药香——你种下的<b>'+CROP_NAMES[S.flag.farm.crop]+'</b>成熟了，可前往【洞府】收获。</p>');
  }
  if(S.heartDemons>0&&chance(Math.min(0.14,0.08+S.karma*0.002))){
    const r=d20()+attrVal(S,'wil')*1.5;
    if(r<14){S.cult=Math.max(0,Math.floor(S.cult*0.95));S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));
      log('<span class="danger">【心魔作祟】</span>你眉心发烫，耳边响起低语，修为竟散去了些许……','danger');}
    else log('<span class="good">【心魔暂退】</span>你稳住道心，将心魔镇压了下去。','good');
  }
  let life=LIFESPANS[S.realm]+(S.lifeBonus||0);
  if(S.flag.gateLife)life=Math.floor(life*0.7);
  if(isFinite(life)&&S.age>life*0.8&&!S.flag.lifeWarn){S.flag.lifeWarn=true;log('<p class="danger">你忽觉岁月如刀——寿元已过大半（'+Math.floor(S.age)+'/'+life+' 岁）。若不能尽快突破大境界，此生恐将止步于此。</p>')}
  if(S.age>=life){die('寿元耗尽');return false}
  const newYear=Math.floor(S.years);
  if(newYear>(S.flag.lastYear||0)){
    S.flag.lastYear=newYear;
    log('<span class="center">— 岁序更新 · 第 '+newYear+' 年 —</span>','center');
    /* 2K 年度大事预告：让时间流逝有规划张力 */
    const yearPlan=['🏯 宗门大比之年，各宗广发英雄帖','🏆 坊市奇珍拍卖会将在春末开槌','🗺️ 传闻有秘境现世，灵光冲天三夜','⚡ 天机有异，雷云盘踞东方不散'];
    const picks=[];
    const pool=yearPlan.slice();
    for(let k=0;k<3&&pool.length;k++)picks.push(pool.splice(rand(0,pool.length-1),1)[0]);
    log('<p class="sys">📅 本年大事：'+picks.join('；')+'。</p>');
    /* 2I 天道之劫：渡劫期起进入终局倒计时 */
    if(S.realm>=37){
      if(!S.flag.tianDeadline)S.flag.tianDeadline=newYear+15;
      const left=S.flag.tianDeadline-newYear;
      if(left>0){
        log('<p class="danger">☄️ 天道之劫：剩余 <b>'+left+' 年</b>。这是天道给你的最后期限——把渡劫准备度拉满，或在此前了结因果。</p>');
        if(chance(0.6))tianGazeEvent();
      }else if(!S.flag.tianDone){
        S.flag.tianDone=true;
        log('<p class="danger">☄️ 天道之劫 · 期限已至！天穹裂开一道口子，劫光如瀑倒灌而下！</p>');
        tianFateBattle();
      }
    }
    /* 2K 年龄节点事件：百岁未筑基，凡间故人渐凋零 */
    if(Math.floor(S.age)>=100&&S.realm<9&&!S.flag.ageHundred){
      S.flag.ageHundred=true;
      log('<p class="sys">转眼已是百岁之身。你回到旧日村落，故人大多化作黄土，只剩几个孩童问你从何而来。你忽然明白，凡人百年，不过修士一瞬。</p>');
      if(chance(0.5)){const gw=growWil(0.3,'白发故人尽，道心愈坚');if(gw)log(gw)}
    }
    if(chance(0.45))yearlyEvent();
    if(chance(0.35))yearlyExtra();
    if(chance(0.6))eraEvent(newYear);
    resolveForeshadow(newYear);
    if(typeof chainTick==='function'&&chance(0.25))chainTick();
  if(S.realm>=21&&chance(0.4))heavenlyErosion();
  }
  /* 节日事件：按游戏内年份触发（春节/七夕/中元/中秋） */
  const doy=S.days%365;
  const fest=FESTIVALS.find(f=>doy>=f.doy[0]&&doy<=f.doy[1]);
  /* 开局第一年（第 0 年）不触发节日，避免刚启程就被打断；自第二年起每年按日期段触发 */
  if(fest&&S.flag.lastYear>0){
    const fy=newYear;
    if(!S.flag.festDone||!S.flag.festDone[fy+'-'+fest.id]){
      festivalEvent(fest.id);
    }
  }
  const nowSeason=seasonOf();
  if((S.flag.lastSeason===undefined?nowSeason:S.flag.lastSeason)!==nowSeason){
    S.flag.lastSeason=nowSeason;
    if(chance(0.45))seasonalEvent();
  }
  if(chance(0.7))npcGrow(days);
  if(typeof discipleTick==='function')discipleTick(days);
  tickInjuries(days);
  tickHates(days);
  if(typeof demonTick==='function')demonTick(days);
  return true;
}
/* 2I 天道注视：每年一次的终局准备事件 */
function tianGazeEvent(){
  scene('天道注视');
  log('<p>天穹之上，一道无悲无喜的目光落在你身上。那不是敌意，却比敌意更令人窒息——天道，在审视你。</p>');
  openEventModal('☄️ 天道注视','<p>它不言语，只静静看着你，等你给出答案。</p>',[
    {txt:'🧘 以道心回应（心性判定）',fn:()=>{const R=doRoll('wil',20);log('<p>你抬头，与那道目光对视：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(100+rl()*20);S.cult+=g;log('<p class="good">天道微微颔首，一股玄奥气机垂落（修为 +'+g+'）。</p>')}else{addMood(-8);log('<p class="danger">那目光洞穿你的心虚，你冷汗涔涔（心境 -8）。</p>')}passTime(1);renderAll()}},
    {txt:'🕯️ 焚香敬天，献上功德',fn:()=>{if(S.merit>=30){S.merit-=30;addDrift(5);log('<p class="good">你散尽一月功德敬天，目光缓和了几分（功德-30，道心 +）。</p>');passTime(1);renderAll()}else{log('<p class="danger">你囊中空空，无以敬天，那目光冷了几分。</p>');addMood(-5);passTime(1);renderAll()}}},
    {txt:'😤 傲然立于天地间，不肯低头（凶险）',cls:'danger',fn:()=>{const R=doRoll('wil',24);log('<p>你负手而立，冷声道：「天道，也不过如此。」'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">天道沉默良久，竟敛去了目光——这一世，你与它结下了一段奇缘（渡劫难度小降）。</p>');S.flag.tianFriend=true}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));S.flag.tianAngry=true;log('<p class="danger">话音未落，一道劫光劈头落下！你狼狈躲闪（气血-25%，天道与你结了梁子）。</p>')}passTime(1);renderAll()}},
  ]);
}
/* 2I 宿命之战：三阶段终局战 */
function tianFateBattle(){
  S.flag.tianDone=true;
  scene('天道之劫 · 宿命之战');
  openEventModal('☄️ 宿命之战 · 第一重：天道化身','<p>劫光中走出一道身影——面容与你一般无二，眼神却如万古寒潭。那是天道以你为蓝本凝成的化身，手持与你相同的法器。</p>',[
    {txt:'⚔️ 与天道化身正面一战',fn:()=>{const R=doRoll('str',24+((S.flag.tianAngry)?2:0));log('<p>你低喝一声，倾尽一身所学轰然出手：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">天道化身裂开一道缝，随即轰然崩解！</p>');tianStage2()}else{log('<p class="danger">你被一击震退，气血翻涌。</p>');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));tianStage2()}}},
    {txt:'🤝 以理服之，与化身论道（智慧判定）',fn:()=>{const R=doRoll('int',22);log('<p>你盘膝而坐，与化身论起天地至理：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">化身沉默半晌，化作一道清气归入你体内（修为 +500）。</p>');S.cult+=500;tianStage2()}else{log('<p class="danger">论道不敌，化身一掌将你拍落云端。</p>');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));tianStage2()}}},
  ]);
}
function tianStage2(){
  openEventModal('☄️ 宿命之战 · 第二重：心魔投影','<p>你面前的虚空裂开，一道与你一模一样、却通体漆黑的身影缓缓走出——那是你此生所有执念的投影。</p>',[
    {txt:'🧘 抱元守一，以道心渡心魔（心性判定）',fn:()=>{const R=doRoll('wil',22+((S.heartDemons||0)>0?2:0));log('<p>魔影扑来，你阖上双眼：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">魔影在你心底轰然炸开，化作满天星屑——你终于与自己和解。</p>');tianStage3()}else{S.heartDemons=(S.heartDemons||0)+1;log('<p class="danger">魔影噬心，你在剧痛中挣出（心魔+1）。</p>');tianStage3()}}},
    {txt:'🗡️ 以杀止魔，斩却本我（凶险）',cls:'danger',fn:()=>{const R=doRoll('str',26);log('<p>你拔剑斩向自己的影子：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">你斩却本我，却也因此窥见了魔道的一角（飞升偏向堕魔）。</p>');S.flag.tianDemon=true;tianStage3()}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.3));S.flag.tianDemon=true;log('<p class="danger">那一剑伤敌一千自损八百（气血-30%，魔道之路渐显）。</p>');tianStage3()}}},
  ]);
}
function tianStage3(){
  openEventModal('☄️ 宿命之战 · 第三重：本我之战','<p>劫光散尽，天地寂静。最后一道门扉矗立在云海尽头——推开它，便是飞升；回头，便是人间。</p>',[
    {txt:'🌅 推开天门，飞升成仙',cls:'primary',fn:()=>{
      if(S.flag.tianDemon){endEnding('堕入魔道','你以魔道之法推开天门，天地变色，仙凡两界为你侧目。自此九界之中，无人不知魔尊之名。','你终以魔证道，踏碎仙门。')}
      else if(S.flag.tianAngry){endEnding('以身合道','天门之后，天道化身再度现身。这一次，你没有战，而是将道心融入天地——你成为了天道的一部分，从此万古长存，亦万古孤寂。','你以身合道，与天地同寿。')}
      else{endEnding('飞升成仙','你一步踏入天门，霞光万丈，诸天仙乐齐鸣。自此长生久视，逍遥九界之外。','你以 '+Math.floor(S.years)+' 载岁月登临仙位。')}
    }},
    {txt:'🌊 转身回头，散尽修为重归人间（寂灭）',fn:()=>{endEnding('寂灭归尘','你望了一眼天门，终究转身。散尽一身修为，如露亦如电，如梦幻泡影。山下的炊烟，比仙界的霞光更让你心安。','你放弃了飞升，只求人间一碗热汤。')}},
  ]);
}
function heavenlyErosion(){
  scene('天道侵蚀');
  log('<p>你端坐云端，忽觉身周虚空寸寸扭曲——境界越高，与天道秩序的冲突便越发尖锐。那审视的目光如芒在背，要将你的道基一寸寸磨去。</p>');
  logChoices([
    {txt:'⚔️ 运功硬撼天道（心性判定）',cls:'primary',fn:()=>{
      const R=doRoll('wil',22);
      log('<p>你以道心为剑，逆斩天威：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){const g=Math.floor(120+rl()*15);S.cult+=g;log('<p class="good">天威破碎，你反而借此更上层楼（修为 +'+g+'）。</p>')}
      else if((S.lifeBonus||0)>=8){S.lifeBonus-=8;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));log('<p class="danger">天道无情，你的寿元被生生削去 8 载，气血亦受创（寿元-8，气血-20%）。</p>')}
      else{S.age+=3;S.lifeBonus=0;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));log('<p class="danger">天道磨灭道体，岁月被强行夺去 3 载，气血亦受创（岁数+3，气血-20%）。</p>')}
      renderAll();}},
    {txt:'🙏 敛息自守，避其锋芒',fn:()=>{
      if((S.lifeBonus||0)>=3){S.lifeBonus-=3;log('<p class="danger">你收敛气息，蛰伏数月，仍被削去 3 载寿元。</p>')}
      else if(chance(0.5)){S.age+=1;log('<p class="danger">天威无孔不入，你虽藏匿不出，仍被夺去 1 载光阴。</p>')}
      else log('<p>你蛰伏潜修，风头过去，此番有惊无险。</p>');
      renderAll();}}
  ]);
}
function yearlyEvent(){
  if(S.realm>=9&&chance(0.16)){
    scene('延寿奇遇');
    if(chance(0.5)){
      addItem({name:'延寿丹',type:'consumable',quality:3,count:1,desc:'服之增寿 30-80 载（在境界寿元之上）。',use:'lifespan',sell:700});
      log('<p class="loot">这一年，你在深山偶遇一株万年灵芝旁盘坐的仙人遗蜕，得<b>延寿丹</b>一枚。</p>');
    }else{
      const g=rand(30,80);S.lifeBonus=(S.lifeBonus||0)+g;
      log('<p class="good">这一年，你误饮一捧传说中的不老泉，命轮凭空多了 <b>'+g+' 载</b>光阴。</p>');
    }
    passTime(2);renderAll();return;
  }
  const t=rand(1,100);
  if(t<=14){
    scene('妖兽潮');
    S.flag.marketShock=Math.floor(S.years); /* 10.1 妖兽潮：本年疗伤类物价上涨 */
    log('<p>今年秋，山林间妖兽暴动，冲入附近村落。宗门与散修齐出，你也在其中。</p>');
    logChoices([
      {txt:'⚔️ 参战除妖（功德+5）',cls:'primary',fn:()=>{S.flag.pendingMerit=5;startCombat({name:'妖潮首领',atk:6+rl()*2,def:2+rl(),hp:35+rl()*14})}},
      {txt:'🙈 避入深山，明哲保身',fn:()=>{addKarma(5);log('<p class="danger">你于深山中避了数月，出山时村落已是一片焦土。</p>');passTime(2);renderAll();}}
    ]);
  }else if(t<=28){
    scene('魔道袭村');
    log('<p>这一夜，血魔宗弟子洗劫山脚村落，火光冲天，哭喊声隔着山脊都听得真切。</p>');
    logChoices([
      {txt:'⚔️ 出手相救（功德+10）',cls:'primary',fn:()=>{S.flag.pendingMerit=10;startCombat({name:'魔道修士',atk:5+rl()*2,def:2+rl(),hp:28+rl()*12})}},
      {txt:'🙈 袖手旁观，明哲保身',fn:()=>{S.heartDemons++;addKarma(10);log('<p class="danger">你听着村中的惨叫转身离去，心魔落下烙印（心魔+1），业力缠身（业力+10）。</p>');passTime(2);renderAll();}}
    ]);
  }else if(t<=42){
    scene('论道大会');
    const R=doRoll('int',18);
    log('<p>这一年，几位散修大能于无名山顶开坛论道，你恰好赶上。'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const g=rand(150,350);S.cult+=g;log('<p class="good">你于论道中窥见一线天机（修为 +'+g+'）。</p>');const lw=growWil(0.15,'闻道而悟');if(lw)log(lw)}
    else log('<p>你听得云里雾里，只觉自己所学浅薄，却也明了几分前路。</p>');
    passTime(3);renderAll();
  }else if(t<=56){
    scene('坊市奇珍');
    if(chance(0.5)){const g=rand(120,350);S.stones+=g;log('<p class="loot">你在坊市淘到一件被错认成废物的珍材，转手卖出，得灵石 '+g+'。</p>')}
    else{const it=randItem(3);addItem(it);log('<p class="loot">你在坊市淘得一件奇物：'+it.name+'（'+QNAMES[it.quality]+'）。</p>')}
    passTime(2);renderAll();
  }else if(t<=68){
    scene('秘境现世');
    log('<p>这一年，天边灵光骤亮，一处秘境在众目睽睽之下现世。你随人流涌入……</p>');
    enterDungeon(pick(['cave','ruin','nest','sword']));
  }else if(t<=78){
    scene('灵潮涌动');
    S.flag.boostNext=true;
    log('<p class="good">这一年天地灵气异常浓郁，正是修炼的大好时机（下一次闭关修炼效率 ×1.5）。</p>');
  }else if(t<=86){
    scene('天狗食月');
    log('<p>这一夜天地异象——天狗噬月，血光染遍九霄。凡间人心惶惶，修真界却有人暗中雀跃：阴煞最盛之时，正是炼心与摄取太阴精华的良机。</p>');
    logChoices([
      {txt:'🌑 仰观天象，参悟太阴之道（智慧判定）',cls:'primary',fn:()=>{
        const R=doRoll('int',17);
        log('<p>你凝望血月，心神沉入浩瀚夜空：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){const g=Math.floor(150+rl()*10);S.cult+=g;log('<p class="good">月华入体，你窥见一丝太阴真意（修为 +'+g+'）。</p>');if(chance(0.3)){S.attrs.int=clamp(S.attrs.int+1,1,40);log('<p class="good">观月悟道（智慧+1）。</p>')}}
        else{const g=Math.floor(50+rl()*5);S.cult+=g;log('<p>你虽未悟透，却也沾得一丝月华（修为 +'+g+'）。</p>')}
        passTime(3);renderAll();}},
      {txt:'🧘 借太阴之力涤荡心魔（心性判定）',fn:()=>{
        const R=doRoll('wil',16);
        log('<p>你盘坐月下，任阴煞冲刷识海：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){S.heartDemons=Math.max(0,(S.heartDemons||0)-1);log('<p class="good">血月之下，一道心魔烙印悄然消融（心魔-1）。</p>');if(chance(0.3)){S.attrs.wil=clamp(S.attrs.wil+1,1,40);log('<p class="good">道心在阴煞中愈发坚韧（心性+1）。</p>')}}
        else{S.heartDemons++;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));log('<p class="danger">阴煞噬心，你惊醒时满身冷汗（心魔+1，气血-15%）。</p>')}
        passTime(3);renderAll();}},
      {txt:'🛌 闭门不出，静待月食过去',fn:()=>{log('<p>你门窗紧闭，一夜安睡。血月之事，与你无关。</p>');passTime(1);renderAll();}}
    ]);
  }else if(t<=93){
    scene('苦行僧讲经');
    log('<p>这一年，一位赤足苦行僧于山门外讲经三日，听者如堵。他讲得并非高深道法，而是最朴素的因果与慈悲。</p>');
    logChoices([
      {txt:'📿 听经三日（功德+5）',cls:'primary',fn:()=>{addMerit(5);const g=growWil(0.25,'闻经悟道');if(g)log(g);log('<p class="good">经声入耳，你心头尘垢为之一洗（功德+5）。</p>');passTime(3);renderAll()}},
      {txt:'💰 布施灵石 100（功德+12）',fn:()=>{if(S.stones>=100){S.stones-=100;addMerit(12);log('<p class="good">你奉上灵石百枚，老僧合十称谢（功德+12）。</p>')}else{addMerit(2);log('<p>你身无余财，只得施了一碗斋饭（功德+2）。</p>')}passTime(1);renderAll()}},
      {txt:'🚶 一笑而过，继续赶路',fn:()=>{S.flag.helpfulSoon=true;log('<p>你与老僧擦肩而过。他忽然道：「施主印堂发亮，三日内有贵人相助。」</p>');passTime(1);renderAll()}}
    ]);
  }else if(t<=97){
    scene('凡人招亲');
    log('<p>这一日，山下王侯在城中设下招亲擂台——榜文上说，胜者可将千金迎娶，附赠一座灵矿山的三成红利。修士们嗤笑，你却若有所思：红尘俗缘，未必不是一条道。</p>');
    logChoices([
      {txt:'💐 登台招亲（魅力判定）',cls:'primary',fn:()=>{
        const R=doRoll('cha',16);
        log('<p>你束衣登台，对面是膀大腰圆的武举人：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){S.stones+=300;S.attrs.cha=clamp(S.attrs.cha+1,1,40);log('<p class="loot">你谈吐风雅，技压群雄。'+(S.gender==='女'?'王家公子愿随你修行':'千金愿随你修行')+'，王侯奉上灵石三百（灵石+300，魅力+1）。</p>');if(!S.daoPartner&&chance(0.3)){S.daoPartner=S.gender==='女'?{name:'王家公子',role:'道侣',desc:'凡间王侯之子，器宇轩昂，一心向道。',style:'str',gender:'男',stage:0,realm:0,atk:1,hp:10,favor:60,affinity:60,rootElem:pickRootElem()}:{name:'王家千金',role:'道侣',desc:'凡间王侯之女，慧黠过人，一心向道。',style:'cha',gender:'女',stage:0,realm:0,atk:1,hp:10,favor:60,affinity:60,rootElem:pickRootElem()};log('<p class="good">一段凡尘姻缘就此结下（道侣「'+S.daoPartner.name+'」）。</p>')}}
        else{log('<p class="danger">你被武举人三招撂下擂台，灰头土脸，只换来满场哄笑。</p>')}
        passTime(3);renderAll();}},
      {txt:'🫖 台下品茶看热闹',fn:()=>{log('<p>你在茶楼看了一日热闹，倒也有趣。只是那擂台上，终究少了一分仙气。</p>');passTime(1);renderAll();}}
    ]);
  }else{
    scene('天降奇缘');
    log('<p>这一年，机缘竟不请自来——天边灵光一闪，正落向你身前。</p>');
    const r=rand(1,5);
    if(r===1){addItem({name:'神秘兽卵',type:'egg',quality:3,use:'hatch',desc:'蛋壳上的灵光若有生命，似有灵兽即将破壳，可在行囊中使用孵化。',sell:600});log('<p class="loot">一枚流光溢彩的<b>兽卵</b>滚到你脚边。</p>')}
    else if(r===2){const a=Object.assign({},pick(ARTS));if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);log('<p class="loot">一卷残破玉简没入你识海，习得功法《'+a.name+'》。</p>')}else{const g=rand(150,300);S.cult+=g;log('<p class="good">玉简中竟是你熟知的功法，反哺为精纯修为（修为 +'+g+'）。</p>')}}
    else if(r===3){const g=rand(200,600);S.stones+=g;log('<p class="loot">一场灵雨过后，你于路边拾得灵石 '+g+' 块。</p>')}
    else if(r===4){S.luck=clamp(S.luck+2,1,100);S.root=clamp(S.root+2,1,100);log('<p class="good">灵光灌顶，你只觉五感通明（气运 +2，灵根 +2）。</p>')}
    else{const it=randItem(3);addItem(it);log('<p class="loot">一件天外遗宝落于林间：「'+it.name+'」（'+QNAMES[it.quality]+'）。</p>')}
    if(S.flag.helpfulSoon){S.flag.helpfulSoon=false;const g2=rand(100,250);S.stones+=g2;log('<p class="good">苦行僧的话应验了——这桩机缘格外顺遂，还附赠灵石 '+g2+'。</p>')}
    passTime(2);renderAll();
  }
}
/* ================= 随时间的自动事件（季节 / 年度补充） ================= */
const SEASONAL_EVENTS=[
  {n:'春汛灵潮',run:()=>{
    scene('春汛 · 灵潮');
    log('<p>春汛过后，山洪退去，河滩上露出大片湿润的灵砂矿脉，在晨光下闪着幽蓝的光。</p>');
    logChoices([
      {txt:'⛏️ 下滩采掘（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',15);log('<p>你卷起裤管踏入河滩：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(80,200);S.stones+=g;S.mats.iron=(S.mats.iron||0)+1;log('<p class="loot">你采得一段灵砂矿脉（灵石 +'+g+'，铁矿石 ×1）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.12));log('<p class="danger">滩涂暗流涌来，你连人带筐被冲了个趔趄（气血-12%）。</p>')}passTime(2);renderAll()}},
      {txt:'🌊 观潮悟水（心性判定）',fn:()=>{const R=doRoll('wil',15);log('<p>你于潮头静坐：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(80+S.root/3);S.cult+=g;log('<p class="good">潮起潮落，你悟得水之柔韧（修为 +'+g+'）。</p>')}else{log('<p>潮声入耳，你昏昏欲睡，一无所获。</p>')}passTime(2);renderAll()}},
    ]);
  }},
  {n:'夏夜妖星',run:()=>{
    scene('夏夜 · 妖星');
    log('<p>这一夜妖星当空，林间妖气大盛，时有绿幽幽的兽瞳在暗处闪烁。</p>');
    logChoices([
      {txt:'⚔️ 提剑巡山，除妖积德',cls:'primary',fn:()=>{S.flag.pendingMerit=6;startCombat({name:'妖星下妖兽',atk:7+rl()*2,def:2+rl(),hp:30+rl()*13})}},
      {txt:'🌌 观星参玄（智慧判定）',fn:()=>{const R=doRoll('int',16);log('<p>你仰望妖星，思绪飘入星河：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(120+S.root/3);S.cult+=g;log('<p class="good">星象暗合天机，你修为精进（修为 +'+g+'）。</p>')}else{log('<p>妖星乱象，你观之半宿，只觉头晕目眩。</p>')}passTime(2);renderAll()}},
    ]);
  }},
  {n:'秋收盗影',run:()=>{
    scene('秋收 · 盗影');
    log('<p>秋收时节，坊市的粮仓与药圃接连失窃，有修士说是个惯偷「夜猫子」所为。</p>');
    logChoices([
      {txt:'🔍 布下陷阱，守株待兔（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',15);log('<p>你于粮仓外布下迷踪阵：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(100,250);S.stones+=g;addMerit(3);log('<p class="loot">夜猫子撞进阵中，交出赃物求饶（灵石 +'+g+'，功德+3）。</p>')}else{log('<p>夜猫子识破了你的阵脚，还在墙上留了个鬼脸。</p>')}passTime(2);renderAll()}},
      {txt:'🍚 设一桌酒菜，以礼相待',fn:()=>{log('<p>你夜半置酒，果然等来了那夜猫子。对方大笑着与你对饮三杯，留下一条坊市秘闻后飘然而去。</p>');S.flag.teaLore=true;log('<p class="good">你得知一条坊市暗语（日后购物更顺）。</p>');passTime(1);renderAll()}},
    ]);
  }},
  {n:'冬雪封山',run:()=>{
    scene('冬雪 · 封山');
    log('<p>大雪封山，山下村子传来求助——商路断绝，村中断粮，老人孩子都等着米下锅。</p>');
    logChoices([
      {txt:'🧊 破雪开路，护送粮队（力量判定）',cls:'primary',fn:()=>{const R=doRoll('str',16);log('<p>你以力破雪：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(8);const g=rand(60,150);S.stones+=g;log('<p class="good">粮队顺利进村，村民跪了一地（功德+8，灵石 +'+g+'）。</p>')}else{applyInjury('jiqiao');log('<p class="danger">雪崩突至，你拼死护住粮车，却伤了筋骨。</p>')}passTime(3);renderAll()}},
      {txt:'🔥 闭关御寒，不问世事',fn:()=>{log('<p>你堵死洞府，烧起丹火，任凭风雪交加。开春时听闻，山下村子饿死了几户人家。</p>');addKarma(4);S.heartDemons++;log('<p class="danger">你闭关数月，心头却莫名发堵（业力+4，心魔+1）。</p>');passTime(2);renderAll()}},
    ]);
  }},
  {n:'阴月鬼市',run:()=>{
    scene('阴月 · 鬼市');
    log('<p>阴月之夜，山脚下凭空多出一座灯火幽绿的鬼市，摊上摆着阴阳两界的物什。</p>');
    logChoices([
      {txt:'💎 以寿元换奇物（-10 载寿元）',fn:()=>{const it=randItem(3);addItem(it);S.lifeBonus=(S.lifeBonus||0)-10;log('<p class="loot">摊主取走你十年命轮，递来一件「'+it.name+'」（'+QNAMES[it.quality]+'，寿元-10载）。</p>');passTime(1);renderAll()}},
      {txt:'🧭 壮胆穿行，只逛不买（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',17);log('<p>你目不斜视，穿过鬼市：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(80,200);S.cult+=g;log('<p class="loot">你于鬼市角落拾得一枚聚魂玉（修为 +'+g+'）。</p>')}else{S.heartDemons++;log('<p class="danger">鬼市低语入耳，你添了一道心魔烙印（心魔+1）。</p>')}passTime(1);renderAll()}},
    ]);
  }},
  {n:'灵雨润泽',run:()=>{
    scene('灵雨 · 三日夜');
    log('<p class="good">一场灵雨连下三日，草木疯长，天地灵气前所未有的充沛。</p>');
    S.flag.boostNext=true;
    S.mats.herb=(S.mats.herb||0)+2;
    log('<p>你于雨中采集灵草 ×2，且灵雨之力未散——下一次闭关修炼效率 ×1.5。</p>');
    passTime(2);renderAll();
  }},
  {n:'剑冢异动',run:()=>{
    scene('剑冢 · 剑气冲霄');
    log('<p>深山剑冢异动，万剑齐鸣，一道剑气直冲九霄。有剑修断言：冢中无主神剑即将认主。</p>');
    logChoices([
      {txt:'🗡️ 入冢一试（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',18);log('<p>你步入剑冢，剑气如潮：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){if(!S.arts.some(x=>x.name==='太乙剑诀')){S.arts.push(ARTS.find(x=>x.name==='太乙剑诀'));log('<p class="loot">神剑之意灌入识海，你悟得「太乙剑诀」！</p>')}else{const g=Math.floor(150+S.root/2);S.cult+=g;log('<p class="good">剑意入心，你剑道更进一步（修为 +'+g+'）。</p>')}}else{applyInjury('shenhun');log('<p class="danger">万剑齐攻，你被剑气震出冢外，神魂受创。</p>')}passTime(3);renderAll()}},
      {txt:'🫡 立于冢外，观剑悟道',fn:()=>{const g=Math.floor(60+S.root/4);S.cult+=g;log('<p>你在冢外远观剑气纵横，倒也悟出一分锋芒（修为 +'+g+'）。</p>');passTime(2);renderAll()}},
    ]);
  }},
  {n:'白狐报恩',run:()=>{
    scene('白狐 · 报恩');
    log('<p>一只通体雪白的灵狐叼着一枚温润玉牌，轻轻放在你脚边，冲你三点头。</p>');
    chainStart('yaoyu');
    logChoices([
      {txt:'🎁 收下玉牌（气运+1）',fn:()=>{S.luck=clamp(S.luck+1,1,100);log('<p class="good">玉牌入手微温，你只觉冥冥中气运流转（气运 +1）。</p>');passTime(1);renderAll()}},
      {txt:'🕊️ 还玉牌与狐，结一段善缘',fn:()=>{addMerit(3);S.luck=clamp(S.luck+1,1,100);log('<p class="good">白狐衔回玉牌，回望你一眼，化作一道流光离去（功德+3，气运+1）。</p>');passTime(1);renderAll()}},
    ]);
  }},
];
function seasonalEvent(){
  const e=pick(SEASONAL_EVENTS);
  if(e.run)e.run();
}
/* 年度补充事件：频率不高，但丰富阅历 */
const YEARLY_EXTRA=[
  {n:'仙门开山',run:()=>{
    scene('仙门开山收徒');
    if(S.sect){log('<p>这一年各大仙门开山收徒，你已在宗内，只当是看了场热闹。山门外人头攒动，少年们眼中有光。</p>');passTime(1);renderAll();return}
    logChoices([
      {txt:'🏯 前往山门，择派拜入',cls:'primary',fn:()=>{panelSect();}},
      {txt:'🚶 自认散修逍遥，一笑而过',fn:()=>{log('<p>你望着山门前的长队，摇了摇头：「宗门虽好，终究不如一人一剑来得自在。」</p>');passTime(1);renderAll()}},
    ]);
  }},
  {n:'流星坠地',run:()=>{
    scene('流星坠地');
    log('<p>这一夜，一颗流星拖着长尾坠入南山，火光冲天。天亮后，许多人涌向坠星之地。</p>');
    logChoices([
      {txt:'🧭 抢先寻宝（身法判定）',cls:'primary',fn:()=>{const R=doRoll('agi',16);log('<p>你御风疾行：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const it=randItem(3);addItem(it);const g=rand(100,250);S.stones+=g;log('<p class="loot">你抢在众人之前挖出星陨灵铁（灵石 +'+g+'，得「'+it.name+'」）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));log('<p class="danger">你被后来的修士推搡，跌落深坑（气血-15%）。</p>')}passTime(2);renderAll()}},
      {txt:'🌠 原地观星，不争不抢',fn:()=>{const g=Math.floor(80+S.root/3);S.cult+=g;log('<p>你于山巅看流星坠落，心中忽然空明（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
    ]);
  }},
  {n:'凡间瘟疫',run:()=>{
    scene('凡间瘟疫');
    log('<p>这一年山下瘟疫横行，村村挂白。有修士趁机发灾难财，也有修士逆流而行。</p>');
    logChoices([
      {txt:'💊 炼药施诊（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',16);log('<p>你于村口设棚施药：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(15);log('<p class="good">药到病除，村民把你当活菩萨供着（功德+15）。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));log('<p class="danger">你日夜奔波，自己也染上了时疫，休养月余方愈（气血-10%）。</p>')}passTime(3);renderAll()}},
      {txt:'🏔️ 避入深山，等瘟疫过去',fn:()=>{log('<p>你避入深山修炼，出山时瘟疫已过。村口新添了许多坟。</p>');addKarma(6);passTime(2);renderAll()}},
    ]);
  }},
  {n:'故人来访',run:()=>{
    scene('故人来访');
    const friends=S.npcs.filter(n=>!n.foe&&n.favor>=40);
    if(!friends.length){log('<p>这一年无人登门。你望着院中落叶，忽觉仙途确实有些寂寞。</p>');passTime(1);renderAll();return}
    const n=pick(friends);
    const g=rand(3,6);
    n.favor=clamp(n.favor+g,0,100);
    log('<p>这一日，<b>'+esc(n.name)+'</b>（'+(n.role||'故人')+'）携着一坛灵酿登门拜访，与你在月下谈至三更。</p>');
    log('<p class="good">故人情谊更厚（'+esc(n.name)+' 好感 +'+g+'）。</p>');
    if(chance(0.4)){const g2=Math.floor(50+S.root/4);S.cult+=g2;log('<p class="good">闲谈间偶得一句点拨，修为 +'+g2+'。</p>')}
    passTime(1);renderAll();
  }},
  {n:'龙女湖畔',run:()=>{
    scene('龙女湖畔');
    log('<p>这一年你途经青阳湖，湖心忽然水光潋滟，一位明艳少女踏浪而来，正是龙族公主出游。</p>');
    logChoices([
      {txt:'🌊 施礼相见（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',16);log('<p>你长揖一礼：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(100,300);S.stones+=g;log('<p class="loot">龙女展颜一笑，抛来一捧鲛珠（灵石 +'+g+'）。</p>');if(chance(0.25)){S.luck=clamp(S.luck+1,1,100);log('<p class="good">龙女看了你一眼：「你这人倒有趣，气运送你一缕。」（气运+1）</p>')}}else{log('<p class="danger">龙女哼了一声，掀起浪头泼了你一身，扬长而去。</p>')}passTime(2);renderAll()}},
      {txt:'🚶 远远观望，不作打扰',fn:()=>{log('<p>你见龙女在湖心戏水，便远远驻足，看了片刻转身离去，只当是场奇景。</p>');passTime(1);renderAll()}},
    ]);
  }},
  {n:'魔潮压境',run:()=>{
    scene('魔潮压境');
    log('<p>这一年魔域异动，黑云自西方压来，正道宗门纷纷戒备，山雨欲来。</p>');
    logChoices([
      {txt:'🛡️ 随宗门布防（功德+6）',cls:'primary',fn:()=>{if(S.sect){addMerit(6);S.contrib+=10;S.contribVal+=30;log('<p class="good">你随门中布防三月，得了嘉许（功德+6，贡献点+10，贡献值+30）。</p>')}else{addMerit(6);log('<p class="good">你加入散修联防，与同道一起布下防线（功德+6）。</p>')}passTime(3);renderAll()}},
      {txt:'⚔️ 深入魔域边缘打探（凶险）',cls:'danger',fn:()=>{log('<p>你隐匿气息潜入魔域边缘，窥见魔修大举调动……</p>');startCombat({name:'魔域斥候',atk:8+rl()*2,def:3+rl(),hp:32+rl()*13,elem:'fire'})}},
    ]);
  }},
];
function yearlyExtra(){
  const e=pick(YEARLY_EXTRA);
  if(e.run)e.run();
}
/* ===== 9.2 时代主线：按游戏年推进，错过则世界继续 ===== */
const ERAS=[
  {year:1,id:'moyi',n:'魔道蠢动',run:()=>{
    scene('时代 · 魔道蠢动');
    log('<p>第 1 年，魔域边缘的妖气比往年浓重了三分。边境坊市接连传来「魔修掳人」的传言，正道宗门开始加派巡山弟子。</p>');
    logChoices([
      {txt:'🛡️ 随正道巡山布防（功德+8）',cls:'primary',fn:()=>{addMerit(8);if(S.sect)S.contrib+=10;log('<p class="good">你随巡山队守了数月，驱退几拨魔道斥候（功德+8'+(S.sect?'，贡献点+10':'')+'）。</p>');passTime(3);renderAll()}},
      {txt:'🗺️ 深入魔域边缘打探（凶险）',cls:'danger',fn:()=>{log('<p>你隐匿气息潜入魔域边缘……</p>');startCombat({name:'魔道斥候',atk:8+rl()*2,def:3+rl(),hp:32+rl()*13,elem:'dark',style:'rapid'})}},
      {txt:'🚶 事不关己，专心修行',fn:()=>{log('<p>你闭关自守，任外界风起云涌。</p>');passTime(1);renderAll()}},
    ]);
  }},
  {year:2,id:'sanmo',n:'魔道结盟',run:()=>{
    scene('时代 · 魔道结盟');
    log('<p>第 2 年，血魔宗、万蛊门、幽冥教三宗结盟，黑旗蔽日。修真界人心惶惶，坊市流言四起。</p>');
    logChoices([
      {txt:'⚔️ 截杀一支魔道补给队',cls:'primary',fn:()=>{S.flag.pendingMerit=10;startCombat({name:'魔道补给统领',atk:9+rl()*2,def:3+rl(),hp:40+rl()*14,elem:'dark',style:'burst'})}},
      {txt:'🤝 与魔道中人暗中往来（堕魔伏笔）',cls:'danger',fn:()=>{addKarma(8);S.flag.chain=S.flag.chain||{};S.flag.chain.wodao=1;addForeshadow('魔道令牌');log('<p class="danger">你在黑市接下一枚魔道令牌，一段因果就此埋下（业力+8，魔道卧底线开启）。</p>');passTime(1);renderAll()}},
      {txt:'🏔️ 闭关不出，静观其变',fn:()=>{log('<p>你封锁山门，数月后出关，世界已变了模样。</p>');passTime(1);renderAll()}},
    ]);
  }},
  {year:3,id:'zhenghui',n:'正道会盟',run:()=>{
    scene('时代 · 正道会盟');
    log('<p>第 3 年，五大正道宗门会盟于云台山，共商抗魔大计。天下修士云集，你也在受邀之列。</p>');
    logChoices([
      {txt:'🏯 代表宗门出战',cls:'primary',fn:()=>{if(S.sect){addMerit(10);S.contrib+=30;S.contribVal+=60;log('<p class="good">你代表'+esc(S.sect.name)+'在会盟演武中崭露头角（功德+10，贡献点+30，贡献值+60）。</p>')}else{addMerit(6);log('<p class="good">你以散修身份旁听会盟，结识了几位同道（功德+6）。</p>')}passTime(3);renderAll()}},
      {txt:'🕵️ 暗中刺探各家底细（情报线）',fn:()=>{const R=doRoll('agi',16);log('<p>你混在人群中打探消息：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.chain=S.flag.chain||{};S.flag.chain.qingbao=1;addForeshadow('会盟情报网');log('<p class="loot">你摸清了几家底细，一条情报线就此铺开。</p>')}else{log('<p>你差点被护法逮住，灰溜溜地退了出来。</p>')}passTime(2);renderAll()}},
      {txt:'🚶 不掺和，远远观礼',fn:()=>{log('<p>你在山下茶摊听了三天的会盟热闹，倒也有趣。</p>');passTime(2);renderAll()}},
    ]);
  }},
  {year:4,id:'mijing',n:'秘境现世',run:()=>{
    scene('时代 · 秘境现世');
    log('<p>第 4 年，一座上古秘境在东海之滨现世，正道魔道闻风而动，争夺战一触即发。</p>');
    logChoices([
      {txt:'🗺️ 抢先入秘境',cls:'primary',fn:()=>enterDungeon(pick(['cave','ruin','nest','sword']))},
      {txt:'🛡️ 据守入口，收取过路费（名声两极）',fn:()=>{addKarma(6);S.stones+=300;log('<p class="danger">你守住入口三日，向各路人马收取「买路财」（业力+6，灵石+300）。</p>');passTime(3);renderAll()}},
      {txt:'🚶 自知实力不足，隔岸观火',fn:()=>{log('<p>你远远观望这场争夺，心知有些机缘强求不得。</p>');passTime(2);renderAll()}},
    ]);
  }},
  {year:5,id:'mochao',n:'魔潮爆发',run:()=>{
    scene('时代 · 魔潮爆发');
    log('<p>第 5 年，魔潮全面爆发！黑云压城，魔修大军分三路入侵正道疆域，烽火遍地。</p>');
    logChoices([
      {txt:'⚔️ 投身前线，死战不退',cls:'primary',fn:()=>{S.flag.pendingMerit=20;startCombat({name:'魔潮先锋将',atk:12+rl()*3,def:5+rl(),hp:60+rl()*16,elem:'dark',style:'boss'})}},
      {txt:'🛡️ 护送百姓撤离（功德+15）',fn:()=>{addMerit(15);const g=rand(80,200);S.stones+=g;log('<p class="good">你护着一村百姓翻山越岭，脱离战火（功德+15，灵石+'+g+'）。</p>');passTime(3);renderAll()}},
      {txt:'🌑 趁乱投身魔道（堕魔线收束）',cls:'danger',fn:()=>{if(S.flag.chain&&S.flag.chain.wodao){addKarma(30);endEnding('堕入魔道','你在魔潮中接过黑旗，自此与正道为敌。','你于第 5 年魔潮中正式堕入魔道，九界再无一盏灯为你而亮。');}else{addKarma(20);S.flag.chain=S.flag.chain||{};S.flag.chain.wodao=2;log('<p class="danger">你于乱世中动了邪念，业力缠身（业力+20）。</p>');passTime(1);renderAll()}}},
    ]);
  }},
];
function eraEvent(year){
  const e=ERAS.find(x=>x.year===year);
  if(!e)return;
  S.flag.eraDone=S.flag.eraDone||{};
  if(S.flag.eraDone[e.id])return;
  S.flag.eraDone[e.id]=true;
  e.run();
}
/* ===== 9.3 伏笔管理：埋设、展示、年末结算 ===== */
function addForeshadow(name,resolver){
  S.flag.foreshadow=S.flag.foreshadow||[];
  if(S.flag.foreshadow.some(f=>f.name===name))return;
  S.flag.foreshadow.push({name:name,at:Math.floor(S.years),resolver:resolver||null});
}
function resolveForeshadow(year){
  const fs=S.flag.foreshadow||[];
  if(!fs.length)return;
  const f=fs.shift();
  log('<p class="sys">📜 尘封的伏笔「'+esc(f.name)+'」被时间翻了出来……</p>');
  if(typeof f.resolver==='function'){
    try{f.resolver()}catch(e){console.error('伏笔结算异常',e)}
  }
}
function foreshadowHtml(){
  const fs=S.flag.foreshadow||[];
  if(!fs.length)return '<h4>📜 因果印记</h4><p style="color:#6f7a94">暂无未了之缘。</p>';
  return '<h4>📜 因果印记</h4><p>'+(S.flag.foreshadow||[]).map(f=>esc(f.name)+'（埋于第 '+f.at+' 年）').join('；')+'</p>';
}
function checkQuests(){
  const q=S.quests||(S.quests={});
  if(S.cult>0&&!q.cult){q.cult=true;S.stones+=50;log('<p class="good">【新手任务】初入修炼——灵石 +50。</p>')}
  if(S.flag.explored&&!q.explore){q.explore=true;S.mats.herb=(S.mats.herb||0)+2;log('<p class="good">【新手任务】迈出探索第一步——草药 ×2。</p>')}
  if(S.realm>=2&&!q.realm3){q.realm3=true;addItem({name:'回春丹',type:'consumable',quality:1,count:1,desc:'服之气血尽复（恢复 60% 气血）。',use:'heal',sell:60});log('<p class="good">【新手任务】炼气三层——获得 回春丹。</p>')}
  if(S.realm>=9&&!q.zhuji){q.zhuji=true;addItem({name:'聚灵丹',type:'consumable',quality:1,count:1,desc:'30 日内修炼效率 ×1.5。',use:'pill',sell:120});log('<p class="good">【新手任务】筑基功成——获得 聚灵丹。</p>')}
}
function questHtml(){
  const q=S.quests||{};
  const list=[['cult','首次修炼','灵石+50'],['explore','首次探索','草药×2'],['realm3','炼气三层','回春丹'],['zhuji','筑基功成','聚灵丹']];
  return list.map(([k,t,r])=>'<div class="quest-item'+(q[k]?' done':'')+'"><span>'+(q[k]?'✅':'⬜')+' '+t+'</span><b>'+r+'</b></div>').join('');
}
