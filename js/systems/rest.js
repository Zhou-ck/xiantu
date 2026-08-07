/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 物品使用 / 休整 ================
====================================================== */
'use strict';
/* ================= 物品使用 / 休整 ================= */
function panelInventory(){
  const inv=S.items.map((it,i)=>{
    const useBtn=(it.use&&it.use!=='fire'&&it.use!=='escape'&&it.use!=='thunder'&&it.use!=='rewind')?'<button class="small" onclick="consume('+i+')">使用</button> ':''; 
    const eqBtn=(it.type==='weapon'||it.type==='armor'||it.type==='trinket')?'<button class="small" onclick="equipItem('+i+')">装备</button> ':''; 
    return itemCardHtml(it,useBtn+eqBtn+'<button class="small" onclick="sellItem('+i+')">出售</button>'); 
  }).join('');
  const arts=S.arts.map(a=>'<span class="tag">'+esc(a.name)+'</span>').join('');
  const eq='<p>装备中：法器 <b>'+(S.weapon?esc(S.weapon.name):'—')+'</b> · 防具 <b>'+(S.armor?esc(S.armor.name):'—')+'</b> · 佩饰 <b>'+(S.trinket?esc(S.trinket.name):'—')+'</b></p>';
  openPanel('🎒 行囊',
    '<p style="color:#a99a72">丹药点「使用」；法器/防具/佩饰点「装备」；火球符、遁地符、天雷符会在战斗时自动出现在选项中；草药等材料用于副业炼制或在坊市出售。</p>'+
    eq+'<h4>📖 功法（被动生效）</h4><p>'+arts+'</p><h4>📦 物品</h4>'+(inv||'<p style="color:#6f7a94">空空如也</p>'));
}
function equipItem(i){
  const it=S.items[i];
  if(it.type==='weapon'){const old=S.weapon;S.weapon=it;if(old)S.items[i]=old;else S.items.splice(i,1)}
  else if(it.type==='armor'){const old=S.armor;S.armor=it;if(old)S.items[i]=old;else S.items.splice(i,1)}
  else if(it.type==='trinket'){const old=S.trinket;S.trinket=it;if(old)S.items[i]=old;else S.items.splice(i,1)}
  else return;
  toast('已装备：'+it.name);
  panelInventory();renderAll();
}
function consume(i){
  const it=S.items[i];
  if(!it){toast('此物已不存在');return}
  if(!it.use){toast('此物不可用');return}
  /* v72 服丹演出：服用任何物品都有灵光飘字反馈（低特效/测试桩自动跳过） */
  try{
    if(typeof fxFloatText==='function')fxFloatText('服用 '+it.name,'#e8c86a',false);
    if(typeof fxBurst==='function')fxBurst(5,'#d8b558');
  }catch(e){}
  if(it.use==='heal'){
    const heal=Math.floor(S.maxHp*0.6*(it.qMult||1))+(S.bg.traits.some(t=>t.id==='healer')?Math.floor(S.maxHp*0.2):0);
    S.hp=Math.min(S.maxHp,S.hp+heal);
    log('<p class="good">你服下回春丹，气血翻涌，伤势尽复（气血 +'+heal+'）。</p>');
    cureInjury('neishang','回春丹');
  }else if(it.use==='pill'){
    const now=S.days;
    const pillDays=Math.floor(30*(it.qMult||1));
    if(S.flag.pillTaken&&(now-(S.flag.pillTakenDay||-99))<7){
      S.flag.pillResist=Math.min(3,(S.flag.pillResist||0)+1);
      const r=[1,0.7,0.5,0.3][S.flag.pillResist-1];
      S.pillBuff+=Math.floor(pillDays*r);
      if(typeof addDanTox==='function')addDanTox(pillTox('聚灵丹')*2,'聚灵丹（7 日内连服）');
      log('<p class="sys">药力耐受：7 日内再服聚灵丹，效果降至 ×'+(r*1.5).toFixed(2)+'（剩余 '+Math.floor(pillDays*r)+' 日）。欲速不达，且待药力化尽。</p>');
    }else{
      S.flag.pillResist=0;
      S.pillBuff+=pillDays;
      if(typeof addDanTox==='function')addDanTox(pillTox('聚灵丹'),'聚灵丹');
      log('<p class="good">聚灵丹入腹，丹田暖意融融，30 日内修炼效率 ×1.5。</p>');
    }
    S.flag.pillTaken=true;S.flag.pillTakenDay=now;
    it._toxDone=true;
  }else if(it.use==='clear'){
    S.heartDemons=0;
    S.demonMarks=[];
    log('<p class="good">清心丹化作一道清流，涤尽心头魔障（心魔烙印尽消）。</p>');
    addMood(15);
    if(S.flag.clearCd>0){log('<p class="sys">药力尚有耐受，未能增益道心。</p>')}
    else{S.flag.clearCd=30;const gw=growWil(0.95,'清心宁神，道心明澈');if(gw)log(gw)}
  }else if(it.use==='mood'){
    addMood(15);
    log('<p class="good">安神香袅袅升起，你闭目调息，心境渐渐澄明（心境 +15，现 '+S.mood+'）。</p>');
  }else if(it.use==='rewind'){
    log('<p class="sys">回溯符灵光内敛，已被你随身收好——大境界突破失败时，可凭此符天机回溯。</p>');
    toast('回溯符已备好');
  }else if(it.use==='save'){
    log('<p class="sys">'+esc(it.name)+'灵光内敛，贴肉而藏——遇致命一击时，它会替你做那最后一道防线。</p>');
    toast('护身之物已备好');
  }else if(it.use==='break'){
    S.temp.break+=3;
    log('<p class="good">破境丹力沉入丹田，下一次突破心性判定 +3。</p>');
  }else if(it.use==='root'){
    S.root=clamp(S.root+5,1,100);
    log('<p class="good">洗髓丹伐毛洗髓，灵根资质 +5（现 '+S.root+'）。</p>');
    cureInjury('gendi','洗髓丹');
  }else if(it.use==='cure_neijing'){
    let c=0;
    if(cureInjury('neijing','疗伤丹'))c++;
    if(cureInjury('jiqiao','疗伤丹'))c++;
    if(!c)log('<p class="sys">你并无经脉、筋骨之伤，药力化作暖流消散。</p>');
  }else if(it.use==='cure_shenhun'){
    if(!cureInjury('shenhun','安神丹'))log('<p class="sys">你神魂无恙，药力沉入识海，化为一丝清明。</p>');
  }else if(it.use==='root3'){
    S.root=clamp(S.root+3,1,100);
    if((S.flag.impurity||0)>0){S.flag.impurity=Math.max(0,(S.flag.impurity||0)-20);log('<p class="good">洗灵露涤荡周身浊气，灵浊 -20（现 '+(S.flag.impurity||0)+'/100）。</p>')}
    log('<p class="good">洗灵露涤荡灵根，灵根资质 +3（现 '+S.root+'）。</p>');
  }else if(it.use==='notebook'){
    const g=rand(200,400)+Math.floor(S.root/3);
    S.cult+=g;
    S.fame=S.fame||{zheng:0,mo:0,san:0};
    S.fame.san=(S.fame.san||0)+2;
    log('<p class="loot">你展读自己闭关时著成的修行手札，笔下的心得以另一种方式回馈于你（修为 +'+g+'，散修声望 +2）。</p>');
    if(chance(0.2)){const gw=growWil(0.15,'著书自省，道心愈坚');if(gw)log(gw)}
  }else if(it.use==='lifespan'){
    const g=rand(30,80);S.lifeBonus=(S.lifeBonus||0)+g;
    log('<p class="good">延寿丹入口化作一股暖流，你只觉命轮之上凭空多了 <b>'+g+' 载</b>光阴（寿元上限 +'+g+'）。</p>');
  }else if(it.use==='essence'){
    const g=Math.floor(rand(500,1000)*(it.qMult||1));S.cult+=g;
    log('<p class="good">千年灵乳入喉，如饮月华，修为 +'+g+'！</p>');
  }else if(it.use==='insight'){
    S.flag.insights=(S.flag.insights||0)+1;
    const g=Math.floor(150+S.root/2);S.cult+=g;
    const si=growWil(0.35,'品悟道茶');
    log('<p class="good">一盏悟道茶入腹，灵台清明（悟道 +1，修为 +'+g+'）。</p>'+(si||''));
  }else if(it.use==='art'){
    const a=Object.assign({},pick(ARTS));
    if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);log('<p class="loot">无字天书泛起灵光，化作《'+a.name+'》没入识海！</p>')}
    else{const g=rand(200,400);S.cult+=g;log('<p class="good">天书所载功法你已习得，反哺为精纯修为（修为 +'+g+'）。</p>')}
  }else if(it.use==='str'||it.use==='agi'||it.use==='int'){
    const nm=ATTR_NAMES[it.use];
    S.attrs[it.use]=clamp(S.attrs[it.use]+1,1,40);
    log('<p class="good">'+it.name+'入腹，药力淬体伐髓，'+nm+' +1（现 '+S.attrs[it.use]+'）。</p>');
  }else if(it.use==='fruit'){
    const g=rand(300,600);S.cult+=g;
    log('<p class="good">朱果入口化作甘泉，直灌丹田，修为 +'+g+'！</p>');
  }else if(it.use==='detox'){
    if(typeof addDanTox==='function')addDanTox(-15,'排毒丹');
    log('<p class="good">排毒丹入腹，药力裹挟着丹毒自毛孔丝丝渗出（丹毒 -15）。</p>');
    addMood(5);
    it._toxDone=true;
  }else if(it.use==='mood2'){
    addMood(20);
    S.temp.break=(S.temp.break||0)+2;
    log('<p class="good">凝神丹化作一道清凉灵流，心境澄明（心境 +20，下一次突破判定 +2）。</p>');
  }else if(it.use==='blood'){
    S.flag.bloodBuff=6;
    log('<p class="danger">暴血丹入腹，气血翻涌如沸——下一场战斗攻击 +6！</p>');
    S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.05));
  }else if(it.use==='guben'){
    S.flag.guben=true;
    log('<p class="good">固本丹力沉入丹田，化作一层无形的护膜——下一次突破失败不损修为。</p>');
  }else if(it.use==='wuxing'){
    S.flag.wuxingBuff=60;
    log('<p class="good">五行丹入腹，五行之力在经脉中轮转不息（60 日内五行克敌伤害 +10%）。</p>');
  }else if(it.use==='essence2'){
    const g=rand(300,500);
    S.cult+=g;
    log('<p class="good">聚气散化开，灵气如百川归海汇入丹田（修为 +'+g+'）。</p>');
  }else if(it.use==='huitian'){
    S.hp=S.maxHp;
    S.injuries=[];
    addMood(10);
    log('<p class="loot">回天丹入口，一股磅礴生机洗刷全身——气血尽复，百伤俱愈！</p>');
  }else if(it.use==='hatch'){
    if(S.pet){toast('已有灵兽相伴');return}
    S.pet=rollPet();
    log('<p class="loot">蛋壳裂开，一只<b>'+S.pet.species+'「'+S.pet.name+'」</b>钻了出来，亲昵地蹭着你的手。天赋：'+PET_TALENT_DESC[S.pet.talent]+'。</p>');
    chainStart('lingshou');
  }else{
    toast('此物不可用');return;
  }
  if(!it._toxDone&&typeof pillTox==='function'){
    const tx=pillTox(it.name);
    if(tx&&typeof addDanTox==='function')addDanTox(tx,it.name);
  }
  S.items.splice(i,1);
  panelInventory();
  passTime(1);renderAll();
}
function doRest(){
  closePanel();
  const heal=Math.floor(S.maxHp*0.35);
  S.hp=Math.min(S.maxHp,S.hp+heal);
  const sp=addSpirit(Math.floor(maxSpirit(S)*0.3));
  scene('休整');
  log('<p>你寻了一处山洞，燃起篝火，调息打坐，气血恢复 '+heal+(sp>0?'，真元回满 '+sp:'')+'。</p>');
  passTime(1);renderAll();
}
function restHeal(days){
  closePanel();
  const rc=restCure(days);
  const heal=Math.floor(S.maxHp*(0.08+days/60));
  S.hp=Math.min(S.maxHp,S.hp+heal);
  /* v50 静养排毒：每 10 日 -3，丹房再减 1 */
  if((S.flag.danTox||0)>0&&days>=10){
    let detox=Math.floor(days/10)*3;
    if(S.flag.caveRooms&&S.flag.caveRooms.dan)detox+=Math.floor(days/30);
    if(typeof addDanTox==='function')addDanTox(-detox,'静养排毒');
  }
  /* v55 静养排浊：每 10 日 -5 */
  if((S.flag.impurity||0)>0&&days>=10){
    const clean=Math.floor(days/10)*5;
    S.flag.impurity=Math.max(0,(S.flag.impurity||0)-clean);
    log('<p class="good">静养排浊：灵浊 -'+clean+'（现 '+(S.flag.impurity||0)+'/100）。</p>');
  }
  scene('洞府静养');
  log('<p>你在洞府中静养 <b>'+days+' 日</b>，运功调息，药石温养。</p>'+
    (rc.cured>0?'<p class="good">静养有成，'+rc.cured+' 处伤势痊愈。</p>':'<p class="sys">伤势略有起色（气血 +'+heal+'）。</p>'));
  passTime(days);renderAll();
}
/* 读书抄经：30 日养道心，智慧 ≥15 收益 ×2 */
function readBooks(){
  closePanel();
  if(S.flag.readCd>0){log('<p class="sys">你方抄读完一卷，且待时日再读（'+(S.flag.readCd)+' 日后可再来）。</p>');renderAll();return}
  scene('读书抄经');
  let gain=1;
  if(S.attrs.int>=15){gain=2;log('<p class="good">你过目不忘，读一卷胜过旁人两卷。</p>')}
  const before=S.attrs.wil;
  S.attrs.wil=clamp(S.attrs.wil+gain,1,40);
  const got=S.attrs.wil-before;
  log('<p>你于书斋/藏经阁中静心抄读三十日，胸中块垒渐消。</p>'+(got>0?'<p class="good">道心更为沉凝（心性 +'+got+'，现 '+S.attrs.wil+'）。</p>':'<p class="sys">道心已至上限，读之无益。</p>'));
  S.flag.readCd=30;
  addWis(1);
  log('<p class="sys">书卷气养灵台，悟性 +1。</p>');
  passTime(30);renderAll();
}
const TRUST_TIERS={free:{n:'免费托管',mult:0.4},stones:{n:'灵石托管',mult:0.65},pill:{n:'聚灵丹托管',mult:0.85},elixir:{n:'灵乳托管',mult:1.05}};
/* 2E 自动化分层：托管能力随境界解锁，离线收益随层级提升 */
function trustTier(){
  const r=S.realm||0;
  if(r>=21)return {lv:4,n:'弟子委任',offline:0.30,desc:'分身与弟子并行产出资源'};
  if(r>=17)return {lv:3,n:'分魂术',offline:0.30,desc:'元婴分魂，多线并行'};
  if(r>=13)return {lv:2,n:'托管策略',offline:0.15,desc:'可配置自动服药、突破提醒等规则'};
  if(r>=9)return {lv:1,n:'免费托管',offline:0,desc:'筑基后洞府法阵可代你运转'};
  return {lv:0,n:'手动闭关',offline:0,desc:'炼气期需亲力亲为，一步一印'};
}
function toggleAutoRule(k){
  S.flag.autoRules=S.flag.autoRules||{pill:false,warn:false};
  S.flag.autoRules[k]=!S.flag.autoRules[k];
  save();panelRest();
}
/* 2R 分魂术：元婴起，分身并行产出资源（回程结算弹窗） */
function splitTask(kind){
  if((S.realm||0)<17){toast('元婴期方可施展分魂术');return}
  closePanel();
  const opts=[
    {txt:'🕐 短程（10 日 · 稳妥）',fn:()=>splitResolve(kind,10)},
    {txt:'🕒 中程（20 日 · 收获更丰）',fn:()=>splitResolve(kind,20)},
    {txt:'🕗 长程（30 日 · 富贵险中求）',fn:()=>splitResolve(kind,30)},
  ];
  openEventModal('🧬 分魂术 · '+(kind==='explore'?'分身探索':kind==='alchemy'?'分身炼丹':'分身跑商'),
    '<p>你自识海分出一缕神魂，化作与你一般无二的身影，向门外走去。临行前，'+(S.daoPartner?S.daoPartner.name:'洞府中')+'似乎多看了那道身影一眼。</p><p class="sys">分身行动期间，本体仍可照常操作。</p>',opts);
}
function splitResolve(kind,days){
  scene('分魂 · '+(kind==='explore'?'探索归来':kind==='alchemy'?'炼丹归来':'跑商归来'));
  let txt='';
  if(kind==='explore'){
    const r=rand(1,100);
    if(r<=55){const g=Math.floor((20+rl()*15)*(1+days/40));S.cult+=g;txt='分身踏遍青山，带回一缕天地灵气（修为 +'+g+'）。'}
    else if(r<=85){const m=pick(['herb','iron','pelt','sherb']);const n=rand(1,2);S.mats[m]=(S.mats[m]||0)+n;txt='分身采回一批材料：'+MAT_NAMES[m]+' ×'+n+'。'}
    else{const it=randItem(rand(1,3));addItem(it);txt='分身撞上一处遗藏，拾得「'+it.name+'」（'+QNAMES[it.quality]+'）。'}
  }else if(kind==='alchemy'){
    if(S.prof==='alchemy'){const g=Math.floor((60+rl()*25)*(1+days/50));S.profExp+=Math.floor(days/10);txt='分身于丹房连炼数日，丹术精进（造诣经验 +'+Math.floor(days/10)+'，丹药若干）。';S.mats.herb=(S.mats.herb||0)+1;}
    else{const g=Math.floor((30+rl()*10)*(1+days/40));S.cult+=g;txt='分身虽不通丹术，却也采回灵草、记下丹理（灵草×1，修为 +'+g+'）。';S.mats.herb=(S.mats.herb||0)+1;}
  }else{
    const invest=Math.min(300,S.stones);
    const g=Math.floor(invest*rand(5,15)/100*(1+days/50));
    S.stones+=g;
    txt=invest>0?'分身押着货队走了一趟，净赚 <b>'+g+'</b> 灵石。':'分身两手空空归来，连本钱都没有。';
  }
  openEventModal('🧬 分魂归来','<p>洞府外传来脚步声，分身推门而入，与你的本体缓缓合一。</p><p class="good">'+txt+'</p>',[
    {txt:'✅ 收下收获',fn:()=>{log('<p class="good">分魂归位，'+txt+'</p>');passTime(days);renderAll()}},
  ]);
}
/* 托管资源消耗：免费 0；灵石每10日5；聚灵丹每30日1枚+每10日3灵石；灵乳每30日1枚 */
function _trustCost(days,tier){
  days=Math.max(1,days||1);
  const c={stones:0,pill:0,elixir:0};
  if(tier==='stones')c.stones=Math.ceil(days/10)*5;
  else if(tier==='pill'){c.stones=Math.ceil(days/10)*3;c.pill=Math.ceil(days/30);}
  else if(tier==='elixir')c.elixir=Math.ceil(days/30);
  return c;
}
/* 扣取托管资源；不足则返回提示文字，成功返回 null */
function _consumeTrustResources(days,tier){
  const cost=_trustCost(days,tier);
  if(tier==='pill'||tier==='elixir'){
    const use=tier==='pill'?'pill':'essence';
    const nm=tier==='pill'?'聚灵丹':'千年灵乳';
    const cnt=cost[tier];
    let left=cnt;
    for(let i=0;i<S.items.length&&left>0;i++){
      if(S.items[i]&&S.items[i].use===use){S.items.splice(i,1);left--;i--}
    }
    if(left>0)return '需要'+nm+' ×'+cnt+'（每 30 日 1 枚）';
  }
  if(S.stones<cost.stones)return '托管灵石不足（需 '+cost.stones+'）';
  S.stones-=cost.stones;
  return null;
}
/* 修炼托管台：免费自动托管（40%），或投入资源加速（灵石 65% / 聚灵丹 85% / 灵乳 105%） */
function startTrust(days,tier){
  closePanel();
  tier=tier||'free';
  const T=TRUST_TIERS[tier]||TRUST_TIERS.free;
  const err=_consumeTrustResources(days,tier);
  if(err){toast(err);return}
  log('<p class="sys">你在洞府设下托管法阵'+(tier==='free'?'，任功法自行缓慢运转':'，投入资源换得灵气加速')+'（效率 ×'+T.mult.toFixed(2)+'）。</p>');
  doCultivate(days,'quiet',{trust:true,trustMult:T.mult});
}
/* 托管至目标：设定境界目标，修为攒够自动停转（同样可投入资源加速） */
function startTrustTo(target,tier){
  closePanel();
  target=+target;
  tier=tier||'free';
  const T=TRUST_TIERS[tier]||TRUST_TIERS.free;
  if(!target||target<=S.realm||target>=REALMS.length){toast('目标境界无效');return}
  const need=Math.max(1,THRESHOLDS[target]-S.cult);
  const per10=Math.max(1,Math.floor((8+S.root/6)*cultMult(S)*T.mult));
  const days=Math.min(3650,Math.max(30,Math.ceil(need/per10*10)));
  const err=_consumeTrustResources(days,tier);
  if(err){toast(err);return}
  log('<p class="sys">你在洞府设下托管法阵，目标锁定「'+REALMS[target]+'」，修为攒够即自动停转'+(tier==='free'?'，任功法自行缓慢运转':'，投入资源换得灵气加速')+'（效率 ×'+T.mult.toFixed(2)+'，约 '+days+' 日）。</p>');
  doCultivate(days,'quiet',{trust:true,trustMult:T.mult,toRealm:target});
}
function panelRest(){
  const sg=signNow();
  const canSign=!sg;
  const farm=ensureFarm();
  const slots=farmSlots();
  let farmHtml='<p>灵田共 <b>'+slots+'</b> 块（洞府扩建 / 自建宗门灵田可加块）。种下种子，静待成熟；途中或有虫害、灵雨、妖兽滋扰。</p>';
  farmHtml+='<div class="farm-grid">';
  for(let i=0;i<slots;i++){
    const p=farm.plots[i]||null;
    if(!p||!p.crop){
      farmHtml+='<div class="farm-plot empty"><span class="fp-ico">🌱</span><div class="fp-tx"><b>第 '+(i+1)+' 块 · 空置</b><small>择一种子播种</small><div class="fp-btns">'+
        '<button class="small" onclick="plantCrop(\'herb\','+i+')">灵草 30·7日</button>'+
        '<button class="small" onclick="plantCrop(\'sherb\','+i+')">灵参 80·15日</button>'+
        '<button class="small" onclick="plantCrop(\'fruit\','+i+')">朱果 200·30日</button>'+
        '<button class="small" onclick="plantCrop(\'xucan\','+i+')">玄参 120·20日</button>'+
        '<button class="small" onclick="plantCrop(\'zizhi\','+i+')">紫芝 260·40日</button></div></div></div>';
    }else{
      const left=(p.planted||0)+(p.days||0)-S.days;
      const ready=left<=0;
      const pct=clamp(Math.floor(((p.days||1)-Math.max(0,left))/(p.days||1)*100),0,100);
      const CROP_EMOJI={herb:'🌿',sherb:'🌾',fruit:'🍒',xucan:'🌿',zizhi:'🍄'};
      farmHtml+='<div class="farm-plot'+(ready?' ready':'')+'"><span class="fp-ico">'+(CROP_EMOJI[p.crop]||'🌿')+'</span><div class="fp-tx"><b>'+CROP_NAMES[p.crop]+'</b><small>'+(ready?'已成熟':'还需 '+Math.max(0,left)+' 日')+(p.evt?' · <span class="tag" style="color:#e08a6a">⚠️ '+({pest:'虫害',rain:'灵雨',thief:'妖兽出没'})[p.evt]+'</span>':'')+'</small><div class="bar" style="height:6px;margin:4px 0 0"><i style="width:'+pct+'%"></i></div></div>'+(ready?'<div class="fp-btns"><button class="small primary" onclick="harvestCrop('+i+')">收获</button></div>':'')+'</div>';
    }
  }
  farmHtml+='</div>';
  const artsHtml=S.arts.map((a,i)=>{
    const lv=a.level||1;
    const maxLv=Math.min(5,bigStage(S.realm)+1);
    const eff=((a.mult+(lv-1)*0.05)*artGradeMult(a)*(i===0?1:0.5)).toFixed(2);
    const tags='<span class="tag">'+artGradeName(a)+'</span>'+(a.elem?' <span class="tag" style="color:'+elemInfo(a.elem).c+'">'+elemInfo(a.elem).i+' '+elemInfo(a.elem).n+'</span>':' <span class="tag">无属</span>')+' <span class="tag">第'+lv+'重</span>'+(lv>=maxLv?' <span class="tag">圆满</span>':'')+(i===0?' <span class="tag" style="color:#d8b45a">主修</span>':' <span class="tag">辅修×0.5</span>');
    return qcardHtml({name:a.name,icon:artIcon(a),quality:Math.min(4,artGrade(a)-1),elem:a.elem,showQ:false,tags:tags,sub:'效率 ×'+eff,desc:esc(a.desc),foot:(lv<maxLv?'<button class="small" onclick="cultivateArt('+i+')">参悟 · 30日（'+(100*lv)+'灵石）</button>':'')});
  }).join('');
  openPanel('🏡 洞府',
    '<p>山中方一日，世上已千年。此处是你的道场：歇息、种药、参悟功法、求问天机。</p>'+
    '<h4>📜 天机签（每季一签）</h4><div id="signBox">'+
    '<p>'+(canSign?'焚香祝祷，可窥本季天机——吉凶由命，签意自现，亦可凭此趋吉避凶。':'<span style="color:#e8c86a">本季已求：'+signDesc(sg.k)+'</span>'+(S.flag.signChain?'<br><span style="color:#e08a6a">⚠️ 凶签未解：宜尽快应劫化运。</span>':''))+'</p>'+
    (canSign?'<div class="row"><button class="small primary" onclick="drawSign()">🪷 焚香求签（一日）</button></div>':'')+
    '</div>'+
    '<h4>😴 歇息</h4><div class="row"><button onclick="doRest()">休整一日（恢复气血 35%）</button></div>'+
    '<h4>📖 读书抄经</h4>'+
    (S.flag.readCd>0?'<p style="color:#6f7a94">你近来抄读已多（'+(30-S.flag.readCd)+' 日后可再读）。</p>':'<div class="row"><button onclick="readBooks()">静读抄经 30 日（养道心）</button></div>')+
    '<h4>⚙️ 修炼托管台</h4>'+
    '<p style="font-size:12.5px;color:#a99a72">托管期间功法自动运转，途中或遇异动可「暂存待处理」，出关前统一抉择。免费托管效率较低，投入资源可加速；亦可设定境界目标，修为攒够自动停转。<br>当前自动化：<b>'+trustTier().n+'</b>（离线收益 +'+Math.round(trustTier().offline*100)+'%）</p>'+
    (S.realm>=9?'<h5 style="color:var(--gold2);margin:8px 0 4px">🕊️ 免费托管（×0.40）</h5>'+
    '<div class="row"><button onclick="startTrust(30,\'free\')">30 日</button><button onclick="startTrust(60,\'free\')">60 日</button></div>':'<p class="sys">🔒 免费托管需<b>筑基</b>后方可开启（当前：'+REALMS[S.realm]+'）。炼气期亲力亲为，亦是磨砺。</p>')+
    '<h5 style="color:var(--gold2);margin:8px 0 4px">💎 灵石托管（×0.65 · 每10日5灵石）</h5>'+
    '<div class="row"><button onclick="startTrust(30,\'stones\')">30 日</button><button onclick="startTrust(90,\'stones\')">90 日</button><button onclick="startTrust(365,\'stones\')">一年</button></div>'+
    '<h5 style="color:var(--gold2);margin:8px 0 4px">⚗️ 聚灵丹托管（×0.85 · 每30日1枚+每10日3灵石）</h5>'+
    '<div class="row"><button onclick="startTrust(30,\'pill\')">30 日</button><button onclick="startTrust(90,\'pill\')">90 日</button></div>'+
    '<h5 style="color:var(--gold2);margin:8px 0 4px">🌌 灵乳托管（×1.05 · 每30日1枚千年灵乳）</h5>'+
    '<div class="row"><button onclick="startTrust(30,\'elixir\')">30 日</button></div>'+
    '<h5 style="color:var(--gold2);margin:10px 0 4px">🎯 托管至目标（自动执行到停）</h5>'+
    '<p style="font-size:12.5px;color:#a99a72">选定目标境界，法阵自动运转至修为攒够即停，并通知你准备突破。途中异动可暂存待处理。</p>'+
    '<select id="trustTarget" style="width:100%;padding:9px;margin:4px 0 8px;background:#151a2b;color:#e8e4d8;border:1px solid #2a3150;border-radius:8px">'+
    (()=>{let o='';const maxR=Math.min(REALMS.length-1,S.realm+6);for(let r=S.realm+1;r<=maxR;r++)o+='<option value="'+r+'">'+REALMS[r]+'（需修为 '+THRESHOLDS[r]+'）</option>';return o})()+
    '</select>'+
    '<div class="row"><button onclick="startTrustTo(document.getElementById(\'trustTarget\').value,\'free\')">🕊️ 免费</button>'+
    '<button onclick="startTrustTo(document.getElementById(\'trustTarget\').value,\'stones\')">💎 灵石</button>'+
    '<button onclick="startTrustTo(document.getElementById(\'trustTarget\').value,\'pill\')">⚗️ 聚灵丹</button>'+
    '<button onclick="startTrustTo(document.getElementById(\'trustTarget\').value,\'elixir\')">🌌 灵乳</button></div>'+
    (S.realm>=13?'<h5 style="color:var(--gold2);margin:10px 0 4px">🧠 托管策略（金丹解锁）</h5>'+
      '<p style="font-size:12.5px;color:#a99a72">为托管法阵配置规则，自动化挂机更省心：</p>'+
      '<div class="row"><button class="small'+(S.flag.autoRules&&S.flag.autoRules.pill?' primary':'')+'" onclick="toggleAutoRule(\'pill\')">💊 灵石≥500时自动购聚灵丹：'+(S.flag.autoRules&&S.flag.autoRules.pill?'开':'关')+'</button>'+
      '<button class="small'+(S.flag.autoRules&&S.flag.autoRules.warn?' primary':'')+'" onclick="toggleAutoRule(\'warn\')">🔔 修为满90%时提醒突破：'+(S.flag.autoRules&&S.flag.autoRules.warn?'开':'关')+'</button></div>':'')+
    (S.realm>=17?'<h5 style="color:var(--gold2);margin:10px 0 4px">🧬 分魂术（元婴解锁）</h5>'+
      '<p style="font-size:12.5px;color:#a99a72">分出一缕神魂代你奔走，本体现在便可专心闭关——多线并行，效率翻倍。</p>'+
      '<div class="row"><button class="small primary" onclick="splitTask(\'explore\')">🗺️ 分身探索</button>'+
      '<button class="small primary" onclick="splitTask(\'alchemy\')">⚗️ 分身炼丹</button>'+
      '<button class="small primary" onclick="splitTask(\'trade\')">🚚 分身跑商</button></div>':'')+
    '<h4>🌾 灵田</h4>'+farmHtml+
    '<h4>⛰️ 灵脉（灵气浓度）</h4>'+
    '<p>洞府灵脉 Lv.'+(S.flag.caveLv||0)+' · 当前修炼效率 ×'+(1+(S.flag.caveLv||0)*0.08).toFixed(2)+'</p>'+
    ((S.flag.caveLv||0)<5?'<div class="row"><button onclick="upgradeCave()">升级灵脉 · '+caveCost()+' 灵石</button></div>':'<p style="color:#6f7a94">灵脉已至顶级，灵气充沛如海。</p>')+
    '<h4>🏠 房间扩建</h4>'+caveRoomsHtml()+
    '<h4>🪞 洞府装饰（灵石出口 · 永久加成）</h4>'+decorHtml()+
    '<h4>📖 功法参悟</h4>'+(artsHtml||'<p style="color:#6f7a94">无功法可参。</p>')+
    '<h4>🩹 静养疗伤</h4>'+
    ((S.injuries||[]).length?'<p>你身上还有 <b>'+(S.injuries||[]).length+' 处</b>伤势，静养可徐徐图之。</p><div class="row">'+
      '<button onclick="restHeal(3)">静养 3 日</button>'+
      '<button onclick="restHeal(10)">静养 10 日</button>'+
      '<button onclick="restHeal(30)">静养 30 日</button></div>'
      :'<p style="color:#6f7a94">身上并无伤势，休整即可。</p>')+
    '<p style="font-size:12.5px;color:#6f7a94">灵田成熟需自然流逝时间；试炼塔与秘境在「探索」中开启；离线期间可挂机修行（上限 12 小时）。</p>');
}
/* 11 洞府房间化：各房间强化对应玩法 */
const CAVE_ROOMS=[
  {id:'jing',n:'静室',i:'🧘',cost:400,desc:'修炼效率 +5%'},
  {id:'dan',n:'丹房',i:'⚗️',cost:500,desc:'炼丹判定 +4'},
  {id:'qi',n:'器坊',i:'🔨',cost:500,desc:'炼器判定 +4'},
  {id:'tian',n:'灵田扩建',i:'🌾',cost:500,desc:'灵田收获 +1'},
  {id:'shou',n:'灵兽园',i:'🐾',cost:500,desc:'灵兽成长 +25%'},
  {id:'cang',n:'藏经阁',i:'📖',cost:600,desc:'功法参悟判定 +2'},
  {id:'ke',n:'会客厅',i:'🏮',cost:600,desc:'偶遇/来访事件更频繁'},
];
function caveRoomsHtml(){
  const rooms=S.flag.caveRooms||{};
  return CAVE_ROOMS.map(r=>{
    const built=!!rooms[r.id];
    return '<div class="item-card"><div class="nm">'+r.i+' '+r.n+(built?' <span class="tag" style="color:#a8d5a8">已建</span>':'')+'</div><div class="ds">'+r.desc+'</div>'+
      (built?'':'<div style="margin-top:6px"><button class="small" onclick="upgradeRoom(\''+r.id+'\')">扩建 · '+r.cost+' 灵石</button></div>')+'</div>';
  }).join('');
}
function upgradeRoom(id){
  const r=CAVE_ROOMS.find(x=>x.id===id);
  if(!r)return;
  if(S.stones<r.cost){toast('灵石不足');return}
  S.stones-=r.cost;
  S.flag.caveRooms=S.flag.caveRooms||{};
  S.flag.caveRooms[id]=true;
  scene('洞府扩建');
  log('<p class="loot">你请工匠凿石立柱，'+(r.n==='灵田扩建'?'将灵田向外扩了三亩':'新起了一间'+r.n)+'。自此洞府气象更胜从前（'+r.desc+'）。</p>');
  panelRest();renderAll();
}
/* 3.2 洞府灵脉：等级提升灵气浓度（修炼效率 +8%/级） */
function caveCost(){return ((S.flag.caveLv||0)+1)*500}
function upgradeCave(){
  const lv=S.flag.caveLv||0;
  if(lv>=5){toast('灵脉已至顶级');return}
  const cost=caveCost();
  if(S.stones<cost){toast('灵石不足（需 '+cost+'）');return}
  S.stones-=cost;
  S.flag.caveLv=lv+1;
  scene('灵脉升级');
  log('<p class="loot">你引动阵法，将地底灵脉又贯通了一重。灵气如泉涌出，洞府为之一新（灵脉 Lv.'+(lv+1)+'，修炼效率 ×'+(1+(lv+1)*0.08).toFixed(2)+'）。</p>');
  panelRest();renderAll();
}
/* v43 洞府装饰：持续灵石出口，永久小增益 */
const DECOR_ITEMS=[
  {id:'pingfeng',name:'云纹屏风',icon:'🪞',cost:800,desc:'真元上限 +5'},
  {id:'xianglu',name:'鎏金香炉',icon:'🕯️',cost:900,desc:'心境判定 +1（永久）'},
  {id:'jiange',name:'灵木剑架',icon:'🗡️',cost:1100,desc:'修炼效率 +2%'},
];
function decorHtml(){
  const own=S.flag.decor=S.flag.decor||[];
  return '<div class="bd-box">'+DECOR_ITEMS.map(d=>{
    const bought=own.indexOf(d.id)>=0;
    return '<div class="bd-row'+(bought?' ok':'')+'"><span>'+d.icon+' '+esc(d.name)+'（'+esc(d.desc)+'）</span>'+
      (bought?'<b>已陈设</b>':'<b><button class="small" onclick="buyDecor(\''+d.id+'\')">购置 · '+d.cost+' 灵石</button></b>')+'</div>';
  }).join('')+'</div>';
}
function decorBonus(){
  const own=(S&&S.flag&&S.flag.decor)||[];
  return {spirit:own.indexOf('pingfeng')>=0?5:0,mood:own.indexOf('xianglu')>=0?1:0,cult:own.indexOf('jiange')>=0?0.02:0};
}
function buyDecor(id){
  const d=DECOR_ITEMS.find(x=>x.id===id);
  if(!d)return;
  if((S.flag.decor||[]).indexOf(id)>=0){toast('此物已陈设');return}
  if(S.stones<d.cost){toast('灵石不足');return}
  S.stones-=d.cost;
  S.flag.decor=S.flag.decor||[];
  S.flag.decor.push(id);
  if(id==='pingfeng')S.spirit=Math.min(maxSpirit(S),S.spirit+5);
  log('<p class="loot">🪞 你在洞府陈设了「'+d.name+'」：'+d.desc+'（灵石 -'+d.cost+'）。</p>');
  panelRest();renderAll();
}
/* v51 灵田多块：基础 1 + 洞府扩建 1 + 自建宗门灵田 1 */
const CROPS={
  herb:{name:'灵草',cost:30,days:7},
  sherb:{name:'灵参',cost:80,days:15},
  fruit:{name:'朱果',cost:200,days:30},
  xucan:{name:'玄参',cost:120,days:20},
  zizhi:{name:'紫芝',cost:260,days:40},
};
function ensureFarm(){
  if(!S.flag.farm||!Array.isArray(S.flag.farm.plots)){
    const old=S.flag.farm;
    S.flag.farm={plots:[]};
    if(old&&old.crop)S.flag.farm.plots.push({crop:old.crop,planted:old.planted||0,days:old.days||7,notified:!!old.notified,evt:null});
  }
  while(S.flag.farm.plots.length<farmSlots())S.flag.farm.plots.push(null);
  while(S.flag.farm.plots.length>farmSlots())S.flag.farm.plots.pop();
  return S.flag.farm;
}
function farmSlots(){
  let n=1;
  if(S.flag.caveRooms&&S.flag.caveRooms.tian)n+=1;
  if(typeof ownSectHarvestBonus==='function'&&ownSectHarvestBonus()>0)n+=1;
  return n;
}
function plantCrop(k,slot){
  const cfg=CROPS[k];
  if(!cfg)return;
  const farm=ensureFarm();
  if(slot===undefined)slot=farm.plots.findIndex(p=>!p||!p.crop);
  if(slot<0||slot>=farm.plots.length||(farm.plots[slot]&&farm.plots[slot].crop)){toast('该块灵田已被占用');return}
  if(S.stones<cfg.cost){toast('灵石不足');return}
  S.stones-=cfg.cost;
  farm.plots[slot]={crop:k,planted:S.days,days:cfg.days,notified:false,evt:null};
  scene('灵田耕种');
  log('<p>你翻开第 '+(slot+1)+' 块灵田沃土，播下'+cfg.name+'种子，浇上灵泉水。此后每过一日，田中都多一分生机。</p>');
  panelRest();renderAll();
}
function farmHarvest(c){
  const bonus=(S.flag.caveRooms&&S.flag.caveRooms.tian)?1:0;
  const ownL=(typeof ownSectHarvestBonus==='function')?ownSectHarvestBonus():0;
  const total=bonus+ownL;
  let loot='';
  if(c==='herb'){const n=rand(3,5)+total;S.mats.herb=(S.mats.herb||0)+n;loot='草药 ×'+n}
  else if(c==='sherb'){const n=rand(2,3)+total;S.mats.sherb=(S.mats.sherb||0)+n;loot='灵草 ×'+n;if(chance(0.3)){S.mats.demonCore=(S.mats.demonCore||0)+1;loot+='、妖丹 ×1'}}
  else if(c==='fruit'){addItem({name:'朱果',type:'consumable',quality:3,count:1,desc:'灵田所育朱果，服之修为大进（修为 +300~600）。',use:'fruit',sell:500});loot='朱果 ×1'}
  else if(c==='xucan'){const n=rand(2,3)+total;S.mats.sherb=(S.mats.sherb||0)+n;loot='玄参（灵草 ×'+n+'）';if(chance(0.25)){S.mats.jade=(S.mats.jade||0)+1;loot+='、寒玉 ×1'}}
  else if(c==='zizhi'){const n=rand(2,3)+total;S.mats.sherb=(S.mats.sherb||0)+n;S.mats.demonCore=(S.mats.demonCore||0)+1;loot='紫芝（灵草 ×'+n+'、妖丹 ×1）'}
  else{loot='无'}
  return loot;
}
function harvestCrop(slot){
  const farm=ensureFarm();
  if(slot===undefined)slot=farm.plots.findIndex(p=>p&&p.crop&&(p.planted||0)+(p.days||0)<=S.days);
  const p=farm.plots[slot];
  if(!p||!p.crop||(p.planted||0)+(p.days||0)>S.days){toast('尚未成熟');panelRest();return}
  if(p.evt==='pest'){
    openEventModal('🐛 灵田虫害','<p>灵田间爬满噬灵虫，正啃噬即将成熟的'+CROP_NAMES[p.crop]+'！</p>',[
      {txt:'🧠 布药驱虫（智慧判定）',cls:'primary',fn:()=>{const R=doRoll('int',14);log('<p>你洒下药粉：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const loot=farmHarvest(p.crop);log('<p class="good">虫害尽除，收成无损（'+loot+'）。</p>')}else{const loot=farmHarvest(p.crop);const half=Math.max(0,(S.mats.herb||0)-Math.floor(S.mats.herb/3));log('<p class="danger">药力不足，仍损了三成（'+loot+'）。</p>')}p.crop=null;p.evt=null;passTime(1);renderAll();panelRest();}},
      {txt:'🔥 一把灵火焚虫（凶险）',fn:()=>{const R=doRoll('str',14);log('<p>你引动丹火：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const loot=farmHarvest(p.crop);log('<p class="loot">火势精准，虫害尽灭，收成无损（'+loot+'）。</p>')}else{const loot=farmHarvest(p.crop);log('<p class="danger">火势失控，烧焦了一半（'+loot+'）。</p>');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.05));}p.crop=null;p.evt=null;passTime(1);renderAll();panelRest();}},
    ]);
    return;
  }
  if(p.evt==='thief'){
    openEventModal('🐗 妖兽偷吃','<p>一头贪吃的山魈正蹲在田里，大口嚼着你的'+CROP_NAMES[p.crop]+'！</p>',[
      {txt:'⚔️ 驱赶妖兽',cls:'primary',fn:()=>{startCombat({name:'偷食山魈',atk:4+rl()*2,def:2+rl(),hp:26+rl()*10,style:'rapid'},res=>{if(res.win){const loot=farmHarvest(p.crop);log('<p class="good">山魈落荒而逃，收成保住（'+loot+'）。</p>')}else{log('<p class="danger">你被山魈掀了个跟头，它叼着灵药跑了。</p>')}p.crop=null;p.evt=null;renderAll()},true)}},
      {txt:'🪙 丢几枚灵果引开它',fn:()=>{if(S.stones>=20){S.stones-=20;const loot=farmHarvest(p.crop);log('<p class="sys">你抛出一把灵果，山魈追着跑了（灵石-20，'+loot+'）。</p>')}else{const loot=farmHarvest(p.crop);log('<p class="danger">你囊中空空，山魈白吃了半亩（'+loot+'）。</p>')}p.crop=null;p.evt=null;passTime(1);renderAll();panelRest();}},
    ]);
    return;
  }
  if(p.evt==='rain'){
    const loot=farmHarvest(p.crop);
    S.mats.herb=(S.mats.herb||0)+1;
    log('<p class="loot">一场灵雨润泽，收成格外丰硕（'+loot+'、草药 +1）。</p>');
  }else{
    const loot=farmHarvest(p.crop);
    log('<p class="loot">你小心采下成熟的'+CROP_NAMES[p.crop]+'（'+loot+'）。</p>');
  }
  p.crop=null;p.evt=null;
  scene('灵田收获');
  panelRest();renderAll();
}
function cultivateArt(i){
  const a=S.arts[i];
  if(!a)return;
  const lv=a.level||1;
    const maxLv=Math.min(5,bigStage(S.realm)+1);
  if(lv>=maxLv){toast('此功法已参悟至当前境界的极限');panelRest();return}
  const cost=100*lv;
  if(S.stones<cost){toast('灵石不足');return}
  S.stones-=cost;
  const R=doRoll('int',15+lv*2-(S.flag.caveRooms&&S.flag.caveRooms.cang?2:0)); /* 11 藏经阁 */
  scene('参悟功法 · '+a.name);
  log('<p>你于洞府中摊开《'+a.name+'》的玉简，心神沉入字里行间：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    a.level=lv+1;
    addWis(1);
    log('<p class="good">灵光一闪，你将《'+a.name+'》参悟至<b>第 '+(lv+1)+' 重</b>（修炼效率 ×'+((a.mult+lv*0.05)).toFixed(2)+'，悟性 +1）。</p>');
  }else{
    addWis(1);
    log('<p class="sys">功法深奥晦涩，你参悟良久虽未破关，却对道之玄奥多了一分体悟（灵石已耗，悟性 +1）。</p>');
    if(R.fumble&&chance(0.3)){S.heartDemons++;log('<p class="danger">强参功法，你气血逆行，添了一道心魔烙印（心魔+1）。</p>')}
  }
  passTime(30);renderAll();
}
function drawSign(){
  if(signNow()){toast('本季已求签');panelRest();return}
  const sg=pick(SIGNS);
  S.flag.sign={season:seasonOf(),kind:sg.k};
  scene('焚香求签');
  const cls=(sg.k==='great'||sg.k==='war'||sg.k==='calm'||sg.k==='wealth'||sg.k==='cult'||sg.k==='luck')?'good':(sg.k==='sorrow'?'danger':'sys');
  log('<p>你于洞府净手焚香，诚心祝祷。签筒轻摇，一支竹签「啪」地落于案上。</p><p class="'+cls+'">【'+sg.n+'】'+sg.d+'</p>');
  if(sg.k==='trial'||sg.k==='sorrow'){
    S.flag.signChain=true;
    S.flag.signChainStep=1;
    log('<p class="danger">竹签入手的刹那，一阵阴风穿堂而过——凶签有劫，宜早化解。</p>');
    signChainFlow();
    return;
  }
  panelRest();passTime(1);renderAll();
  toast('求得【'+sg.n+'】');
  try{
    const pb=document.getElementById('panelBody'),sb=document.getElementById('signBox');
    if(pb&&sb)pb.scrollTop=Math.max(0,sb.offsetTop-12);
  }catch(e){}
}
/* v51 凶签化解奇遇链：避祸 → 应劫 → 转运（三步） */
function signChainFlow(){
  if(!S||!S.flag.signChain)return;
  const st=S.flag.signChainStep||1;
  if(st===1){
    openEventModal('🔮 凶签化解 · 避祸','<p>签示此季有劫，先避其锋，再图后计。</p>',[
      {txt:'🏔️ 封山闭户，静观其变（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',14);log('<p>你封了洞门，于静室盘坐：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');S.flag.signChainStep=2;if(R.hit)log('<p class="good">心静如水，劫气难侵。</p>');signChainFlow();}},
      {txt:'🧭 主动出击，抢占先机（身法判定）',fn:()=>{const R=doRoll('agi',15);log('<p>你御风而起，先行查探：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');S.flag.signChainStep=2;if(R.hit)log('<p class="good">你窥破劫气来路，心中已有计较。</p>');signChainFlow();}},
    ]);
  }else if(st===2){
    openEventModal('🔮 凶签化解 · 应劫','<p>劫气如期而至——一道阴风卷着残叶扑向你，心口随之发紧。</p>',[
      {txt:'🛡️ 以道心硬撼此劫（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',16);log('<p>你阖目而立，任劫气冲刷：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.signChainStep=3;log('<p class="good">劫气轰然散开，你毫发无伤！</p>');signChainFlow()}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));S.flag.signChainStep=3;log('<p class="danger">劫气入体，你闷哼一声（气血 -15%），却终究挺了过来。</p>');signChainFlow()}}},
      {txt:'⚔️ 拔剑斩劫，以攻代守（力量判定）',fn:()=>{const R=doRoll('str',16);log('<p>你拔剑斩向那道阴风：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.signChainStep=3;log('<p class="loot">剑光过处，劫气应声而断！</p>');signChainFlow()}else{S.flag.signChainStep=3;log('<p class="danger">剑势落空，你被阴风掀了个趔趄（气血 -10%）。</p>');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));signChainFlow()}}},
    ]);
  }else if(st>=3){
    S.flag.signChain=false;
    S.flag.signChains=(S.flag.signChains||0)+1;
    const g=Math.floor(120+rl()*15);
    S.cult+=g;
    S.luck=clamp(S.luck+1,1,100);
    log('<p class="loot">劫消运转——你于险中证得一线天机（修为 +'+g+'，气运 +1）。此后本季凶险稍减。</p>');
    S.flag.sign.kind='calm';
    passTime(1);renderAll();
    toast('凶签化解，劫后福生');
  }
}
