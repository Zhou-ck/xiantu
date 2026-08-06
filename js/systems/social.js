/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 人际 ================
====================================================== */
'use strict';
/* ================= 人际 ================= */
function panelSocial(){
  const known=S.npcs.filter(n=>n.met);
  const unknownCount=S.npcs.filter(n=>!n.met).length;
  const npcHtml=known.map((n)=>{
    const idx=S.npcs.indexOf(n);
    const genTag=n.gender==='女'?'♀ 女':'♂ 男';
    const btns='<button class="small primary" onclick="npcDialog('+idx+')">💬 对话</button> '+
      '<button class="small" onclick="npcChat('+idx+')">交谈</button> '+
      '<button class="small" onclick="npcAsk('+idx+')">请教</button> '+
      '<button class="small" onclick="npcGift('+idx+')">赠礼</button> '+
      '<button class="small" onclick="npcDuel('+idx+')">切磋</button> '+
      '<button class="small" onclick="npcAskAbout('+idx+')">打听</button> '+
      '<button class="small" onclick="npcRequest('+idx+')">🙏 求助</button> '+
      (S.companion===n?'<span class="tag" style="color:#8fd0a0">同行中</span>':(S.daoPartner===n?'':'<button class="small" onclick="npcCompanion('+idx+')">结伴</button> '))+
      (S.daoPartner===n?'':'<button class="small" onclick="npcCourt('+idx+')">💗 情缘</button> ')+
      (S.master===n?'':'<button class="small" onclick="npcMaster('+idx+')">拜师</button>');
    return '<div class="item-card"><div class="nm">'+artImg(NPC_ART[n.role],44,44,'avatar')+esc(n.name)+' <span class="tag">'+esc(n.role)+'</span><span class="tag">'+genTag+'</span></div>'+
      '<div class="ds">'+esc(n.desc)+' · '+stageName(n.stage)+' · 好感：'+n.favor+'（'+npcFavorLabel(n.favor)+'）'+(n.sworn?' · 🤝金兰':'')+'</div>'+
      relTags(n)+
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+btns+'</div></div>';
  }).join('');
  const partner=S.daoPartner?partnerPanel():'<p style="color:#6f7a94">尚无道侣。修仙路远，得一知己相伴，或可走得从容些。</p>';
  const affairs=S.affairs&&S.affairs.length?('<div class="item-card"><div class="nm">🌸 红颜/蓝颜知己（'+(S.affairs||[]).length+'）</div>'+
    '<div class="ds">暧昧对象越多，越易触发<b style="color:#e08a8a">修罗场</b>（争风吃醋、情感抉择）。当前修罗场风险：<b>'+(shuraRisk()*100).toFixed(0)+'%</b>'+(S.flag.qixiLeft>0?' · 七夕在望':'')+'</div>'+
    S.affairs.filter(a=>a).map((a,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px"><span>'+artImg(NPC_ART[a.role],30,30,'avatar')+' <b>'+esc(a.name)+'</b> <span class="tag">'+esc(a.role)+'</span> · 好感 '+a.favor+'</span><span style="display:flex;gap:4px"><button class="small" onclick="daoAffairChat('+i+')">💬 叙话</button><button class="small" onclick="affairPart('+i+')">✂️ 断</button></span></div>').join('')+
    '</div>'):'<p style="color:#6f7a94">🌸 尚无红颜/蓝颜知己。异性角色好感 ≥60 后可结下暧昧（「人际→情缘」）。</p>';
  const master=S.master?masterPanel():'<p style="color:#6f7a94">尚未拜师。宗门长老或江湖高人，皆可为师。</p>';
  const comp=S.companion?'<div class="item-card"><div class="nm">'+artImg(NPC_ART[S.companion.role],44,44,'avatar')+'同行之人：<b>'+esc(S.companion.name)+'</b> <span class="tag">'+esc(S.companion.role)+'</span></div>'+
    '<div class="ds">'+stageName(S.companion.stage)+' · 战斗攻势 +'+companionAtk()+'，探索受其照应。</div>'+
    '<div style="margin-top:8px"><button class="small" onclick="npcCompanion(-1)">拱手作别</button></div></div>':'<p style="color:#6f7a94">🤝 无同行之人。结伴同游，可互相照应。</p>';
  const petSec=S.pet?'<p>🐾 灵兽：<b>'+esc(S.pet.species+'「'+S.pet.name+'」')+'</b>（'+S.pet.level+'级 · '+S.pet.form+'阶） <button class="small" onclick="petPanel()">查看/喂养</button></p>':'<p style="color:#6f7a94">🐾 尚无灵兽。兽卵可在坊市奇珍拍卖或探索机缘中获得。</p>';
  const disc=disciplePanel();
  openPanel('🤝 人际',
    '<p>修仙不是独行路，一饮一啄，皆是因果。</p>'+
    '<h4>🌍 游历偶遇</h4>'+
    (unknownCount>0?'<p style="color:#6f7a94">江湖辽阔，尚有 <b>'+unknownCount+'</b> 位修士未曾谋面。出门游历，或有机缘相逢。</p>':'<p style="color:#6f7a94">江湖相识已尽数结识。</p>')+
    '<div class="row"><button class="small primary" onclick="socialWander()">🌍 出门偶遇（一日）</button></div>'+
    '<h4>💞 道侣</h4>'+partner+'<h4>🧙 师门</h4>'+master+'<h4>🤝 结伴</h4>'+comp+'<h4>🐾 灵兽</h4>'+petSec+'<h4>🧒 道统传承</h4>'+disc+'<h4>👥 相识之人（'+known.length+'）</h4>'+(npcHtml||'<p style="color:#6f7a94">尚无相识之人，先出门游历吧。</p>'));
}
/* 出门游历：偶遇新角色或旧识 */
function socialWander(){
  closePanel();
  scene('游历偶遇');
  log('<p>你收起行囊，踏入山野。</p>');
  if(!passTime(1)){renderAll();return}
  encounterEvent();
  renderAll();
}
function encounterEvent(){
  if(!S)return;
  if(maybeShura())return;
  const unmet=S.npcs.filter(n=>!n.met&&!n.foe);
  const met=S.npcs.filter(n=>n.met&&!n.foe&&n.favor>=10);
  if(unmet.length&&chance(S.flag.caveRooms&&S.flag.caveRooms.ke?0.8:0.65)){
    const n=pick(unmet);
    n.met=true;
    n.favor=clamp(rand(15,30)+fameFavorBias(n)+personaFavorBias(n),5,45);
    openEventModal('✨ 初遇 · '+esc(n.name),'<p>山道转角，你与 <b>'+esc(n.name)+'</b>（'+esc(n.role)+'）不期而遇。'+(n.desc?esc(n.desc):'')+'</p>',[
      {txt:'🤝 拱手攀谈（魅力判定）',fn:()=>{const R=doRoll('cha',14+personaBonus(S,'cha'));log('<p>你上前拱手：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit)favorChange(n,6+(personaFavorBias(n)>0?2:0),'初遇投缘');else favorChange(n,-2+(personaFavorBias(n)<0?-1:0),'话不投机');log('<p>一段新的因果，自此结下。</p>')}},
      {txt:'🎁 以灵石结个善缘（50灵石）',fn:()=>{if(S.stones>=50){S.stones-=50;favorChange(n,8,'以礼相待')}else{favorChange(n,-2,'囊中羞涩，场面尴尬')}}},
      {txt:'🚶 点头致意，擦肩而过',fn:()=>{log('<p>你颔首一礼，继续赶路。相识不必深交，缘分自有安排。</p>')}},
      ...((personaHas(S,'狡诈')||personaHas(S,'霸道'))?[{txt:'🗡️ 出言试探（霸道/狡诈限定）',fn:()=>{const R=doRoll('cha',15);log('<p>你眯起眼，语气带着三分压迫：「这位道友，看你面生，不如交个底？」'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){favorChange(n,5,'威仪摄人');log('<p class="good">对方略一迟疑，竟真道出几句来历，对你多了几分忌惮。</p>')}else{favorChange(n,-8,'盛气凌人');log('<p class="danger">对方眉头一皱，冷笑拂袖：「好大的口气。」</p>')}}}]:[]),
    ]);
    return;
  }
  if(!met.length){log('<p>这一日风平浪静，山间除了鸟鸣，再无他人。</p>');return}
  const n=pick(met);
  const g=n.gender==='女'?'她':'他';
  /* 2O 因果回响：NPC 记得你施过的恩与结下的怨 */
  if((n.nmem||[]).length){
    const memo=n.nmem.filter(m=>m.type==='恩情'||m.type==='亏欠');
    if(memo.length&&chance(0.5)){
      const m=pick(memo);
      openEventModal('🌟 因果回响 · 报恩','<p>你于山道遇见 <b>'+esc(n.name)+'</b>，'+g+'远远便快步迎来，眉眼弯弯：「恩公，可算等到你了！」</p>',[
        {txt:'🎁 收下'+g+'的心意',fn:()=>{const r=rand(1,100);if(r<=40){const g2=rand(60,150);S.stones+=g2;log('<p class="loot">'+g+'塞来一袋灵石（+'+g2+'）。</p>')}else if(r<=75){S.mats.sherb=(S.mats.sherb||0)+1;log('<p class="loot">'+g+'赠你一株灵草。</p>')}else{addItem({name:'回春丹',type:'consumable',quality:1,count:1,desc:'恢复 60% 气血。',use:'heal',sell:60});log('<p class="loot">'+g+'赠你一枚回春丹。</p>')}favorChange(n,4,'知恩图报');passTime(1);renderAll()}},
        {txt:'🙏 婉谢，只道一句「有缘再会」',fn:()=>{addMerit(2);log('<p>你笑着摆手：「路见不平，不必挂怀。」'+g+'郑重行了一礼，眼里有光。</p>');favorChange(n,3,'高风亮节');passTime(1);renderAll()}},
      ]);
      return;
    }
    const hate=n.nmem.filter(m=>m.type==='仇恨');
    if(hate.length&&chance(0.4)){
      log('<p class="danger">山风骤紧——你与 <b>'+esc(n.name)+'</b> 狭路相逢，'+g+'眼中再无旧日情分，只有刀锋般的冷意：「当年的账，该清了。」</p>');
      startCombat({name:n.name+'（寻仇）',atk:n.atk+2,def:Math.max(1,2+Math.floor(n.stage/3)),hp:n.hp});
      return;
    }
  }
  /* 2O 因果触发器：行善 10 次 / 结仇 3 人 */
  if((S.flag.goodDeeds||0)>=10&&!S.flag.goodFuse){S.flag.goodFuse=true;log('<p class="good">✨ 善缘汇聚——你多年的善行引来天地气机垂青（气运 +2）。</p>');S.luck=clamp(S.luck+2,1,100)}
  if((S.flag.foesMade||0)>=3&&!S.flag.foeFuse){S.flag.foeFuse=true;log('<p class="danger">☠️ 仇家合谋——你树下三个仇敌，他们竟暗中串联，伺机而动（此后探索寻仇概率提升）。</p>');S.flag.foeConspiracy=true}
  const evs=[
    {t:'你在溪边遇见'+esc(n.name)+'，'+g+'正对着水面发呆。',opts:[
      {txt:'💬 上前问安',fn:()=>{favorChange(n,rand(1,3),'偶遇寒暄')}},
      {txt:'🤫 悄悄绕开，不打扰',fn:()=>{log('<p>你远远驻足，看了片刻，还是绕道而行。</p>')}},
    ]},
    {t:''+g+'行色匆匆，似有急事。',opts:[
      {txt:'🙋 上前相助（魅力判定）',fn:()=>{const R=doRoll('cha',14);log('<p>你快步上前：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit)favorChange(n,4,'雪中送炭');else favorChange(n,-1,'帮了倒忙')}},
      {txt:'🚶 各自赶路',fn:()=>{log('<p>你与'+esc(n.name)+'擦肩而过，各奔前程。</p>')}},
    ]},
    {t:'林间飘来一阵酒香，'+g+'正席地小酌。',opts:[
      {txt:'🍶 讨杯酒喝（魅力判定）',fn:()=>{const R=doRoll('cha',13);log('<p>你凑过去讨了杯酒：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit)favorChange(n,3,'酒逢知己');else favorChange(n,-2,'话不投机')}},
      {txt:'🚶 不扰其雅兴',fn:()=>{log('<p>你远远点了点头，继续赶路。</p>')}},
    ]},
    {t:'一道黑影掠过，'+g+'脸色微变——似是仇家寻来。',opts:[
      {txt:'🛡️ 并肩而立，一同应对',fn:()=>{favorChange(n,6,'仗义出手');addNpcMemory(n,'恩情','我曾与他并肩御敌')}},
      {txt:'🚶 明哲保身，悄然退开',fn:()=>{favorChange(n,-5,'寒了人心')}},
    ]},
  ];
  const e=pick(evs);
  openEventModal('✨ 偶遇 · '+esc(n.name),'<p>'+e.t+'</p>',e.opts);
}
/* 2O NPC 记忆表：类型=恩情/亏欠/仇恨/见证/许诺 */
function addNpcMemory(n,type,txt){
  if(!n)return;
  n.nmem=n.nmem||[];
  n.nmem.push({type:type,txt:txt,at:S.days});
  if(n.nmem.length>6)n.nmem.shift();
}
function partnerPanel(){
  const p=S.daoPartner;
  if(!p)return '<p style="color:#6f7a94">尚无道侣。修仙路远，得一知己相伴，或可走得从容些。</p>';
  const btns='<button class="small" onclick="daoChat()">💬 聊天</button> <button class="small" onclick="daoTravel()">🏞️ 同游</button> <button class="small" onclick="daoGift()">🎁 赠礼</button> <button class="small primary" onclick="doDualCultivate()">☯️ 双修</button> <button class="small" onclick="daoPart()">✂️ 缘尽</button>';
  return '<div class="item-card">'+artImg(NPC_ART[p.role]||(p.gender==='男'?SECT_PERSON_ART['传功弟子男']:ART.lady),56,56,'avatar')+
    '<div class="nm"><b>'+esc(p.name)+'</b> <span class="tag">'+esc(p.role)+'</span>'+(p.gender==='女'?'<span class="tag">♀ 女</span>':'<span class="tag">♂ 男</span>')+'</div>'+
    '<div class="ds">'+esc(p.desc)+'<br>情缘：<b>'+affectionLabel(p.favor)+'</b>（'+p.favor+'/100） · 境界 '+stageName(p.stage||0)+'<br>道侣加成：修炼效率 ×1.2，同游有悟道之机，双修增益随情缘提升。</div>'+
    '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+btns+'</div></div>';
}
function masterPanel(){
  const m=S.master;
  if(!m)return '<p style="color:#6f7a94">尚未拜师。宗门长老或江湖高人，皆可为师。</p>';
  return '<div class="item-card">'+artImg(NPC_ART[m.role]||SECT_PERSON_ART[m.role+(m.gender==='女'?'女':'男')],56,56,'avatar')+
    '<div class="nm"><b>'+esc(m.name)+'</b> <span class="tag">'+esc(m.title||m.role)+'</span></div>'+
    '<div class="ds">'+esc(m.desc)+' · '+stageName(m.stage||0)+'<br>师承：'+(m.art?esc(m.art.name):'——')+'<br>可常「请教」师尊，点拨获益更丰。</div></div>';
}
/* 师尊面板：请安 / 请教 / 传功 / 切磋 / 出师（7） */
function panelMaster(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  openPanel('🎓 师尊 · '+esc(m.name),
    '<p>一日为师，终身为父。师尊是你在修行路上的引路人——请安温养师徒情分，请教获修为点拨，传功淬炼功法与道心，切磋以武会师，缘法圆满后亦可出师。</p>'+
    masterPanel()+
    '<h4>🎓 师徒互动</h4><div class="row">'+
    '<button class="small" onclick="masterGreet()">🙏 请安（每日）</button>'+
    '<button class="small" onclick="masterAsk()">📖 请教（隔 10 日）</button>'+
    '<button class="small" onclick="masterTeach()">🪷 传功（隔 20 日 · 100灵）</button>'+
    '<button class="small" onclick="masterDuel()">⚔️ 切磋（隔 15 日）</button>'+
    '<button class="small danger" onclick="masterLeave()">🎓 出师</button></div>'+
    '<p style="font-size:12.5px;color:#6f7a94">师承如灯，照我前行。请教与传功皆可增长<b>悟性</b>，用以冲破修行瓶颈。</p>');
}
function masterGreet(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  closePanel();
  if((m.cd&&m.cd.greet||0)>0){log('<p class="sys">'+esc(m.name)+'摆摆手：「日日请安，心意到了便是，去忙你的吧。」</p>');passTime(1);renderAll();return}
  m.cd=m.cd||{};m.cd.greet=5;
  const g=rand(1,3);
  m.favor=clamp((m.favor||60)+g,0,100);
  log('<p>你于师尊座前恭恭敬敬行了一礼，奉上清茶一盏。'+esc(m.name)+'接过茶，微微颔首：「有心了。」（师徒情分 +'+g+'）</p>');
  const gw=growWil(0.06,'晨昏定省，道心渐稳');if(gw)log(gw);
  passTime(1);renderAll();
}
function masterAsk(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  closePanel();
  m.cd=m.cd||{};
  if((m.cd.ask||0)>0){log('<p class="sys">'+esc(m.name)+'捋须道：「修行贵在自悟，过犹不及。过些时日再来问吧。」</p>');passTime(1);renderAll();return}
  m.cd.ask=10;
  if(m.stage<=bigStage(S.realm)){log('<p class="sys">'+esc(m.name)+'笑道：「你的境界已不在我之下，为师能教你的，已不多了。」</p>');passTime(1);renderAll();return}
  const R=doRoll('int',15);
  const g=Math.floor((12+m.stage*8)*(0.7+(m.favor||60)/150));
  log('<p>你于师尊座前请益修行疑难：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){S.cult+=g;m.favor=clamp((m.favor||60)+1,0,100);log('<p class="good">'+esc(m.name)+'三言两语点破关隘，你如醍醐灌顶（修为 +'+g+'，悟性 +1）。</p>');addWis(1);}
  else{S.cult+=Math.floor(g*0.45);log('<p>师尊不厌其烦地讲解，你虽未全懂，也记下了大半（修为 +'+Math.floor(g*0.45)+'）。</p>');}
  const gw=growWil(0.18,'师尊言传身教，道心愈发坚定');if(gw)log(gw);
  maybeInsight('请教师尊');
  passTime(1);renderAll();
}
function masterTeach(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  closePanel();
  m.cd=m.cd||{};
  if((m.cd.teach||0)>0){log('<p class="sys">'+esc(m.name)+'道：「法不轻传，贪多无益。先把你那门功法吃透再说。」</p>');passTime(1);renderAll();return}
  if(S.stones<100){toast('传功需备 100 灵石为仪');return}
  m.cd.teach=20;S.stones-=100;
  const g=Math.floor(40+bigStage(S.realm)*18);
  S.cult+=g;
  const a=S.arts[0];
  if(a&&a.level!==undefined&&a.level<Math.min(5,bigStage(S.realm)+1)&&chance(0.35)){
    a.level=(a.level||1)+1;
    log('<p class="good">师尊亲授功法玄奥，你将《'+esc(a.name)+'》参悟至<b>第 '+a.level+' 重</b>（修炼效率 ×'+((a.mult+(a.level-1)*0.05)).toFixed(2)+'）。</p>');
  }
  log('<p>师尊于座前为你开坛传功三日，引你周天运转，道韵流转（修为 +'+g+'，悟性 +1）。</p>');
  addWis(1);
  const gw=growWil(0.22,'得师亲授，道心澄明');if(gw)log(gw);
  m.favor=clamp((m.favor||60)+2,0,100);
  passTime(3);renderAll();
}
function masterDuel(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  closePanel();
  m.cd=m.cd||{};
  if((m.cd.duel||0)>0){log('<p class="sys">'+esc(m.name)+'收剑而立：「点到为止，过些时日再试。」</p>');passTime(1);renderAll();return}
  m.cd.duel=15;
  const e={name:m.name+'（师尊）',atk:(m.atk||5+(m.stage||0)*2),def:Math.max(1,Math.floor((m.stage||0)/2)),hp:(m.hp||25+(m.stage||0)*15),boss:false};
  log('<p>演武场上，你向师尊行了一礼，拔剑相向：「请师尊指点！」</p>');
  startCombat(e,res=>{
    if(res.win){m.favor=clamp((m.favor||60)+4,0,100);addTrail(2);log('<p class="good">师尊朗声大笑：「青出于蓝！」你竟在师尊手下讨得一场胜——师徒情分 +4，历练 +2。</p>')}
    else{m.favor=clamp((m.favor||60)+2,0,100);log('<p class="sys">师尊以剑脊压住你的剑势，收手而立：「功夫尚浅，再来。」（师徒情分 +2，你败而不伤）</p>')}
    const gw=growWil(0.12,'与师切磋，道心愈坚');if(gw)log(gw);
    maybeInsight('与师尊切磋');
    renderAll();
  },true);
}
function masterLeave(){
  const m=S.master;
  if(!m){toast('尚未拜师');return}
  closePanel();
  openEventModal('🎓 出师礼','<p>你跪于师尊座前，郑重叩首：「弟子今日斗胆，请出师门。」</p><p class="sys">'+esc(m.name)+'静静看了你许久，目光里有欣慰，也有一丝不舍。</p>',[
    {txt:'🎓 行出师礼',cls:'primary',fn:()=>{const nm=m.name;S.master=null;addWis(2);const gw=growWil(0.5,'出师之礼，道心大成');log('<p class="good">'+esc(nm)+'亲手为你系上一条护身穗：「此去山高水长，好自为之。」</p>');if(gw)log(gw);log('<p class="sys">自此你出师自立，师门香火情仍在——日后江湖相遇，仍执弟子礼。悟性 +2。</p>');passTime(1);renderAll()}},
    {txt:'🫂 再留一段时间',fn:()=>{log('<p>你把话咽了回去：「弟子还想再听师尊教诲几年。」'+esc(m.name)+'笑了：「好，那便再教几年。」</p>');passTime(1);renderAll()}},
  ]);
}
function npcChat(i){
  const n=S.npcs[i];
  if(n.foe){log('<p>'+esc(n.name)+'冷眼相待：「道不同不相为谋。」</p>');passTime(1);renderAll();return}
  if((n.cd&&n.cd.talk||0)>0){log('<p>'+esc(n.name)+'摆摆手：「才聊过不久，让我歇歇吧。」</p>');passTime(1);renderAll();return}
  n.cd=n.cd||{talk:0,duel:0,gift:0};
  n.cd.talk=rand(6,12);
  if(chance(0.22)){npcEvent(n);return}
  const topics=(n.chat&&n.chat.length)?n.chat:['修行','见闻'];
  const topic=pick(topics);
  const gain=rand(2,6)+favorBonus(S)+(n.sworn?2:0);
  n.favor=clamp(n.favor+gain,0,100);
  n.talks=(n.talks||0)+1;
  dC().c.talk++;
  const moodLine=n.mood>=70?'对方眼中有光，打开了话匣子。':n.mood>=40?'对方有一搭没一搭地应着。':'对方似有心事，话到嘴边又咽了回去。';
  const pLine=chance(0.3)?npcPersona(n).lines[0]:null;
  const lines=['你与'+n.name+'聊起【'+topic+'】，'+moodLine,'你们品着灵茶说起山下趣闻，'+(chance(0.5)?'对方大笑不止。':'对方若有所思。'),'你向'+n.name+'问起【'+topic+'】的门道，对方知无不言。'];
  log('<p>'+pick(lines)+'（'+esc(n.name)+' 好感 +'+gain+'）</p>');
  if(pLine)log('<p class="sys">'+esc(n.name)+'忽而一叹：「'+esc(pLine)+'」</p>');
  if(n.mood<40&&chance(0.5)){n.favor=clamp(n.favor+2,0,100);log('<p class="sys">你耐心倾听，对方眉头渐渐舒展（好感 +2）。</p>')}
  if(chance(0.2)&&n.favor>=50&&n.stage>bigStage(S.realm)){const g=Math.floor((8+n.stage*5)*(0.6+n.favor/160));S.cult+=g;log('<p class="good">一番深谈，对方点拨了你几句，你受益良多（修为 +'+g+'）。</p>')}
  maybeInsight('与'+esc(n.name)+'的闲谈');
  const gc=growAttr('cha',0.08,'言谈之间，气度渐成');
  if(gc)log(gc);
  passTime(1);renderAll();
}
function npcAsk(i){
  const n=S.npcs[i];
  closePanel();
  if(n.foe){log('<p>仇人相见，分外眼红。对方冷笑一声，拂袖而去。</p>');passTime(1);renderAll();return}
  if(n.stage<=bigStage(S.realm)){log('<p class="sys">'+esc(n.name)+'笑道：「你境界已在我之上，倒是我该向你请教了。」</p>');passTime(1);renderAll();return}
  const R=doRoll('int',14);
  const g=Math.floor((8+n.stage*6)*(0.7+n.favor/150)*(R.hit?1:0.5));
  S.cult+=g;
  n.favor=clamp(n.favor-(R.hit?1:2),0,100);
  log('<p>你向'+esc(n.name)+'请教【'+(n.style==='int'?'修行义理':'功法心得')+'】：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  log(R.hit?'<p class="good">对方一席话如拨云见日，你当场悟透（修为 +'+g+'）。</p>':'<p>对方讲了半日，你记下大半（修为 +'+g+'）。</p>');
  if(chance(0.15)){const gw=growWil(0.08,'听君一席话，道心渐明');if(gw)log(gw)}
  maybeInsight('请教'+esc(n.name));
  passTime(1);renderAll();
}
function npcGift(i){
  const n=S.npcs[i];
  closePanel();
  if(n.foe){log('<p>'+esc(n.name)+'挥袖挡开：「少来这套。」</p>');passTime(1);renderAll();return}
  n.cd=n.cd||{talk:0,duel:0,gift:0};
  const half=(n.cd.gift||0)>0;
  const mult=half?0.5:1;
  if(n.taste==='材'){
    const mk=['herb','sherb','iron','pelt','jade','demonCore'].find(k=>(S.mats[k]||0)>0);
    if(mk){S.mats[mk]--;const g=Math.floor(rand(10,16)*mult);n.favor=clamp(n.favor+g,0,100);n.cd.gift=rand(10,20);log('<p>你以一份<b>'+MAT_NAMES[mk]+'</b>相赠，正合其意，对方眼含笑意（好感 +'+g+'）。</p>'+(half?'<p class="sys">对方近来受礼颇多，笑意淡了几分。</p>':''));passTime(1);renderAll();return}
  }
  if(n.taste==='丹'){
    const it=S.items.find(x=>x.type==='consumable'&&/丹/.test(x.name));
    if(it){S.items.splice(S.items.indexOf(it),1);const g=Math.floor(rand(10,16)*mult);n.favor=clamp(n.favor+g,0,100);n.cd.gift=rand(10,20);log('<p>你以一枚<b>'+it.name+'</b>相赠，对方爱不释手（好感 +'+g+'）。</p>'+(half?'<p class="sys">对方近来受礼颇多，笑意淡了几分。</p>':''));passTime(1);renderAll();return}
  }
  if(S.stones<50){toast('灵石不足');return}
  S.stones-=50;
  const g=Math.floor((rand(5,12)+Math.floor(attrVal(S,'cha')/3))*mult);
  n.favor=clamp(n.favor+g,0,100);
  n.cd.gift=rand(10,20);
  log('<p>你以 50 灵石相赠，'+(g>=9?'对方动容，郑重收下。':'对方道谢收下。')+'（好感 +'+g+'）</p>'+(half?'<p class="sys">对方近来受礼颇多，笑意淡了几分。</p>':''));
  const gg=growAttr('cha',0.05,'施予之道，人望渐隆');
  if(gg)log(gg);
  passTime(1);renderAll();
}
/* 6.1 说服/请求系统：魅力判定 + 关系 + 利益承诺，失败降好感 */
function npcRequest(i){
  const n=S.npcs[i];
  closePanel();
  if(n.foe){log('<p>'+esc(n.name)+'冷笑：「求我？你配么。」</p>');passTime(1);renderAll();return}
  n.cd=n.cd||{talk:0,duel:0,gift:0};
  if((n.cd.request||0)>0){log('<p>'+esc(n.name)+'摆手：「近日帮你的够多了，且让我歇歇。」（'+(n.cd.request)+' 日后再来）</p>');passTime(1);renderAll();return}
  openEventModal('🙏 向 '+esc(n.name)+' 求助','<p>你斟酌措辞，向 '+esc(n.name)+'（好感 '+n.favor+'）开口：</p>',[
    {txt:'💎 借灵石 100（事后归还）',fn:()=>npcRequestResolve(n,'lend',(R)=>{if(R.hit){S.stones+=100;n.favor=clamp(n.favor+1,0,100);log('<p class="good">对方爽快借你 100 灵石（好感 +1）。</p>')}else{log('<p class="danger">对方婉拒：「我手头也紧。」（好感 -2）</p>');n.favor=clamp(n.favor-2,0,100)}})},
    {txt:'🗺️ 打听一处秘境/坊市秘闻',fn:()=>npcRequestResolve(n,'info',(R)=>{if(R.hit){S.flag.chain=S.flag.chain||{};S.flag.chain.qingbao=S.flag.chain.qingbao||1;const g=rand(30,80);S.stones+=g;log('<p class="loot">对方压低声音，告诉你一条暗线（灵石 +'+g+'，情报线开启）。</p>')}else{log('<p class="danger">对方摇头：「此等隐秘，岂能轻言。」（好感 -2）</p>');n.favor=clamp(n.favor-2,0,100)}})},
    {txt:'🛡️ 请其护送你走一趟凶险之地',fn:()=>npcRequestResolve(n,'guard',(R)=>{if(R.hit){log('<p class="good">对方答应随行护道三日，你安心不少。</p>');S.flag.guarded=true;n.favor=clamp(n.favor+2,0,100)}else{log('<p class="danger">对方目露难色：「此去凶险，恕难从命。」（好感 -3）</p>');n.favor=clamp(n.favor-3,0,100)}})},
  ]);
}
function npcRequestResolve(n,kind,cb){
  const R=doRoll('cha',11+Math.floor(n.favor/20));
  log('<p>你开口相求：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  cb(R);
  n.cd=n.cd||{};n.cd.request=rand(20,35);
  passTime(1);renderAll();
}
function npcDuel(i){
  const n=S.npcs[i];
  closePanel();
  if(n.foe){log('<p>'+esc(n.name)+'冷笑：「要战便战，何必假惺惺切磋！」</p>');startCombat({name:n.name+'（寻仇）',atk:n.atk+2,def:Math.max(1,2+Math.floor(n.stage/3)),hp:n.hp});return}
  if((n.cd&&n.cd.duel||0)>0){log('<p>'+esc(n.name)+'摇头：「切磋伤和气，过些时日再说吧。」</p>');passTime(1);renderAll();return}
  log('<p>你向'+esc(n.name)+'抱拳邀战，对方欣然应允。</p>');
  n.cd=n.cd||{talk:0,duel:0,gift:0};
  n.cd.duel=rand(25,45);
  const e={name:n.name,atk:n.atk,def:Math.max(1,2+Math.floor(n.stage/3)),hp:n.hp};
  battle(e,res=>{
    if(res.win){
      n.favor=clamp(n.favor+10,0,100);
      log('<p class="good">切磋获胜，'+esc(n.name)+'心服口服（好感+10）。</p>');
      const gd=growAttr('str',0.08,'切磋之中，武艺渐精');if(gd)log(gd);
    }else if(res.draw){
      n.favor=clamp(n.favor+3,0,100);log('<p>双方战平收手，彼此都有所领悟。</p>');
    }else{
      n.favor=clamp(n.favor+3,0,100);
      log('<p>切磋落败，你倒在地上喘着粗气，'+(n.favor>=50?'对方连忙扶起你，好言宽慰。':'对方拱手道了声「承让」。')+'</p>');
    }
    renderAll();
  },true);
}
function npcCompanion(i){
  if(i<0){if(S.companion)log('<p>你与'+esc(S.companion.name)+'拱手作别，各自上路。</p>');S.companion=null;renderAll();return}
  const n=S.npcs[i];
  if(S.companion){toast('已有同行之人');return}
  if(n.foe){toast('仇人相见，分外眼红');return}
  if(S.daoPartner===n){toast('道侣自当同行');return}
  if(n.favor<40){log('<p class="sys">'+esc(n.name)+'摇头：「你我尚不相熟，结伴多有不便。」（需好感 ≥40）</p>');return}
  closePanel();
  const R=doRoll('cha',12);
  log('<p>你邀'+esc(n.name)+'结伴同行，彼此照应：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){S.companion=n;n.favor=clamp(n.favor-2,0,100);log('<p class="good">对方欣然应允：「江湖路远，同行一程也好。」（结伴：战斗攻势 +'+companionAtk()+'，探索受其照应）</p>');passTime(1);renderAll()}
  else{log('<p>对方婉言谢绝：「我尚有要事在身。」</p>');passTime(1);renderAll()}
}
function companionAtk(){return S.companion?Math.floor(S.companion.stage*2+3):0}
function companionLuck(){return S.companion?Math.floor(S.companion.stage*2+4):0}
function favorStage(f){return f>=85?'两情相悦（可表白）':f>=70?'情愫暗生':f>=50?'莫逆之交':f>=30?'相谈甚欢':'泛泛之交'}
function affectionLabel(f){return f>=95?'生死与共':f>=85?'情根深种':f>=70?'情投意合':f>=50?'两情相悦':f>=30?'心有所属':'初识情愫'}
function npcCourt(i){
  const n=S.npcs[i];
  if(n.foe){log('<p>对方冷眼相待，你自讨没趣。</p>');return}
  closePanel();
  if(n.gender===S.gender){
    log('<p>你与'+esc(n.name)+'对坐良久，话至投机处，不由相视而笑。同性之间，本无风月，却有肝胆。</p>');
    logChoices([
      {txt:'🤝 义结金兰（好感+10）',cls:'primary',fn:()=>{n.favor=clamp(n.favor+10,0,100);n.sworn=true;log('<p class="good">你与'+esc(n.name)+'结为异姓手足，从此江湖路上多了一个过命之交（好感 +10）。</p>');passTime(1);renderAll()}},
      {txt:'🚶 就此作罢',fn:()=>{log('<p>你岔开话头，聊了些别的。</p>');passTime(1);renderAll()}}
    ]);
    return;
  }
  const isAffair=(S.affairs||[]).indexOf(n)>=0;
  if(isAffair){
    log('<p>你与'+esc(n.name)+'已是红颜/蓝颜知己，月下相对，情愫暗生。</p>');
    logChoices([
      ...(S.daoPartner?[]:[{txt:'💍 叩问心意，求结道侣（好感 ≥85）',cls:'primary',fn:()=>{confessLove(n)}}]),
      {txt:'🌙 只谈风月，维持暧昧',fn:()=>{const g=rand(1,3);n.favor=clamp(n.favor+g,0,100);log('<p>你们说了一夜闲话，'+(n.gender==='女'?'她':'他')+'离去时，眼里的笑意比月色还亮（好感 +'+g+'）。</p>');passTime(1);renderAll()}},
      {txt:'✂️ 了断这段暧昧',cls:'danger',fn:()=>{affairPart(n)}},
    ]);
    return;
  }
  if(S.daoPartner){
    if(n.favor<60){log('<p class="sys">'+esc(n.name)+'微微侧首：「你已是有道侣的人，还是收收心吧。」（好感 ≥60 方可结为红颜/蓝颜）</p>');passTime(1);renderAll();return}
    affairOffer(n);
    return;
  }
  log('<p>你与'+esc(n.name)+'谈起了「情」字——</p><p class="sys">当前情缘：'+favorStage(n.favor)+'（好感 '+n.favor+'/100）。情缘未到深处，不宜唐突。</p>');
  if(n.favor>=85){
    confessLove(n);
  }else if(n.favor>=60){
    log('<p class="sys">'+esc(n.name)+'轻声笑道：「你我还未到那一步，却也不算外人。」</p>');
    logChoices([
      {txt:'💐 定下暧昧，结为红颜/蓝颜',cls:'primary',fn:()=>{affairOffer(n)}},
      {txt:'🚶 暂且作罢，来日方长',fn:()=>{log('<p>你按下心绪，只当一句玩笑。</p>');passTime(1);renderAll()}},
    ]);
  }else{
    log('<p class="sys">'+esc(n.name)+'微微垂眸：「你我还需更多时日相处。」（好感 ≥60 可结暧昧，≥85 可求道侣）</p>');
    passTime(1);renderAll();
  }
}
/* 结下暧昧（红颜/蓝颜）：好感 ≥60，魅力判定 */
function affairOffer(n){
  if(!n)return;
  const qixi=(S.flag.qixiLeft||0)>0?2:0;
  const R=doRoll('cha',15);
  log('<p>你于月下剖白心迹，'+(n.gender==='女'?'她':'他')+'愣了愣：'+rollBadge(R.r,R.mod,R.t,R.dc)+(qixi?'<span class="roll"> 七夕鹊桥，天意助缘</span>':'')+'</p>');
  if(R.hit||R.t>=15+qixi){
    if((S.affairs||[]).indexOf(n)<0){
      S.affairs.push(n);
      n.affair=true;
      n.affairSince=S.days;
    }
    const g=rand(4,8);
    n.favor=clamp(n.favor+g,0,100);
    log('<p class="good">'+(n.gender==='女'?'她红着脸，终是点了头。':'他深深看你一眼，算是应下。')+'自此，你二人结为红颜/蓝颜知己'+(S.daoPartner?'（⚠️ 你有道侣在侧，修罗场随时可能爆发！）':'')+'。</p>');
    if(S.daoPartner){favorChange(S.daoPartner,-4,'闻你另结知己，醋意微生')}
    passTime(1);renderAll();
  }else if(R.fumble){
    n.favor=clamp(n.favor-15,0,100);
    log('<p class="danger">此言一出，'+(n.gender==='女'?'她':'他')+'脸色骤变：「我把你当知己，你竟存了这般心思！」（好感 -15）</p>');
    passTime(2);renderAll();
  }else{
    n.favor=clamp(n.favor-5,0,100);
    log('<p class="danger">'+(n.gender==='女'?'她':'他')+'轻轻摇头：「此事，容我再想想。」（好感 -5）</p>');
    passTime(1);renderAll();
  }
}
/* 求结道侣：好感 ≥85，魅力判定（需无道侣） */
function confessLove(n){
  if(!n)return;
  if(S.daoPartner){toast('已有道侣');return}
  const R=doRoll('cha',17);
  log('<p>你鼓起勇气，于月下剖白心迹：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    if(S.companion===n)S.companion=null;
    n.affinity=70;S.daoPartner=n;
    log('<p class="good">'+(n.role==='妖族狐女'||n.role==='狐仙苏苏'?'狐女眼波流转，轻笑一声：「你倒是个有趣的人。」':'对方怔怔望你许久，终是红着脸点了点头。')+'自此，你二人结为道侣，双修共进。</p>');
    for(const a of (S.affairs||[])){
      if(a&&a!==n)favorChange(a,-6,'闻君结缡，黯然神伤');
    }
    passTime(3);renderAll();
  }else if(R.fumble){
    n.favor=clamp(n.favor-25,0,100);
    log('<p class="danger">此言一出，气氛骤然凝滞。对方沉默良久：「道途有别，此念且收。」（好感大降）</p>');
    passTime(2);renderAll();
  }else{
    n.favor=clamp(n.favor-8,0,100);
    log('<p class="danger">对方垂眸不语：「我心已有所属……此事，莫要再提。」（好感 -8）</p>');
    passTime(1);renderAll();
  }
}
/* 了断暧昧 */
function affairPart(n){
  if(typeof n==='number')n=(S.affairs||[])[n];
  const idx=(S.affairs||[]).indexOf(n);
  if(idx>=0)S.affairs.splice(idx,1);
  if(n)n.affair=false;
  if(n)favorChange(n,-20,'恩断情绝');
  log('<p>你与'+esc(n?n.name:'旧人')+'把话说开，彼此归还了信物。风起时，'+(n&&n.gender==='女'?'她':'他')+'没有再回头。</p>');
  passTime(1);renderAll();
}
/* 与暧昧对象叙话：感情细水长流，七夕翻倍 */
function daoAffairChat(idx){
  const a=(S.affairs||[])[idx===undefined?0:idx];
  if(!a){toast('缘起缘灭，此人已不在你身边');return}
  if(maybeShura())return;
  const qixi=(S.flag.qixiLeft||0)>0;
  const g=rand(2,5)+(qixi?3:0);
  a.favor=clamp(a.favor+g,0,100);
  log('<p>你与'+esc(a.name)+'于月下闲谈半宿，'+(a.gender==='女'?'她':'他')+'絮絮说着近来见闻'+(qixi?'，七夕的星光落进'+(a.gender==='女'?'她':'他')+'眼底，温柔得不像话':'')+'（好感 +'+g+'）。</p>');
  if(qixi)log('<p class="sys">七夕鹊桥在望，情意更浓。</p>');
  if(chance(0.18)&&S.daoPartner)favorChange(S.daoPartner,-1,'风闻你与'+esc(a.name)+'月下相会，心绪微乱');
  passTime(1);renderAll();
}
/* ===== 修罗场：暧昧越多，越易触发争风吃醋 ===== */
function shuraRisk(){
  const affairs=(S.affairs||[]).filter(a=>a&&!a.foe);
  if(S.daoPartner&&affairs.length>=1)return Math.min(0.30,0.10+affairs.length*0.06);
  if(affairs.length>=2)return Math.min(0.24,0.08+affairs.length*0.05);
  return 0;
}
function maybeShura(){
  if(!S)return false;
  if(!chance(shuraRisk()*100))return false;
  shuraField();
  return true;
}
function shuraPool(){
  const pool=[];
  if(S.daoPartner&&!S.daoPartner.foe)pool.push(S.daoPartner);
  for(const a of (S.affairs||[]))if(a&&!a.foe&&pool.indexOf(a)<0)pool.push(a);
  return pool;
}
function shuraField(){
  const pool=shuraPool();
  if(pool.length<2)return;
  const a=pick(pool);
  let b=pick(pool);
  if(b===a)b=pick(pool.filter(x=>x!==a));
  if(!a||!b)return;
  const qixi=(S.flag.qixiLeft||0)>0;
  const r=qixi?4:rand(1,4);
  const he=s=>s.gender==='女'?'她':'他';
  if(r===1){
    openEventModal('🌩️ 修罗场 · 狭路相逢','<p>你与<b>'+esc(a.name)+'</b>正并肩而行，迎面却撞见<b>'+esc(b.name)+'</b>。'+he(b)+'的目光在你二人之间来回扫过，空气骤然凝滞。</p>',[
      {txt:'😊 大方引见，坦然相对',fn:()=>{favorChange(a,3,'坦然相待');favorChange(b,1,'不卑不亢');log('<p>你从容介绍两人，'+he(b)+'虽仍带三分薄怒，却也被你的坦荡化解了几分。</p>')}},
      {txt:'💬 只顾与'+esc(a.name)+'说话，冷落'+esc(b.name),fn:()=>{favorChange(a,2,'受宠');favorChange(b,-6,'醋意横生');log('<p class="danger">'+he(b)+'的脸色越来越难看，最后冷笑一声拂袖而去。</p>')}},
      {txt:'🏃 借口有事，落荒而逃',fn:()=>{favorChange(a,-4,'被抛下');favorChange(b,-4,'被抛下');log('<p class="danger">你脚底抹油溜之大吉，留下两人面面相觑——你的形象一落千丈。</p>')}},
    ]);
  }else if(r===2){
    openEventModal('💥 修罗场 · 争风吃醋','<p>坊市茶楼中，<b>'+esc(a.name)+'</b>与<b>'+esc(b.name)+'</b>隔着桌子对峙，一壶灵茶被摔在地上，溅了满地。</p>',[
      {txt:'🛡️ 护住'+esc(a.name),fn:()=>{favorChange(a,5,'当众维护');favorChange(b,-8,'当众受辱');log('<p class="danger">'+he(b)+'咬牙望着你，眼中有水光一闪而逝。</p>')}},
      {txt:'🛡️ 护住'+esc(b.name),fn:()=>{favorChange(b,5,'当众维护');favorChange(a,-8,'当众受辱');log('<p class="danger">'+he(a)+'垂下眼帘，指尖微微发颤。</p>')}},
      {txt:'☯️ 各打五十大板',fn:()=>{favorChange(a,-3,'和稀泥');favorChange(b,-3,'和稀泥');log('<p>你把两人都数落了一顿，茶钱也赔了。两人虽然消停，却都记了你一笔。</p>')}},
    ]);
  }else if(r===3){
    openEventModal('🔥 情感抉择 · 水火不容','<p>山道之上，<b>'+esc(a.name)+'</b>与<b>'+esc(b.name)+'</b>同时陷入危局——左有妖兽扑向'+esc(a.name)+'，右有山崩砸向'+esc(b.name)+'。电光石火之间，你只能救一人！</p>',[
      {txt:'⚡ 救下'+esc(a.name),fn:()=>{favorChange(a,8,'生死相救');favorChange(b,-18,'被弃之痛');S.flag.qingjie=(S.flag.qingjie||0)+rand(20,40);log('<p class="danger">你抱住'+esc(a.name)+'滚出险地，再回头时，'+esc(b.name)+'已半埋于乱石之下。良久，'+he(b)+'从石缝中爬出，看你的眼神比血更冷。——你种下了一道<b>情劫</b>（'+S.flag.qingjie+' 日内心性判定 -2）。</p>')}},
      {txt:'⚡ 救下'+esc(b.name),fn:()=>{favorChange(b,8,'生死相救');favorChange(a,-18,'被弃之痛');S.flag.qingjie=(S.flag.qingjie||0)+rand(20,40);log('<p class="danger">你扑向'+esc(b.name)+'的一瞬，'+esc(a.name)+'眼里的光熄灭了。此劫入心，'+S.flag.qingjie+' 日内心性判定 -2。</p>')}},
      {txt:'🌪️ 以身为盾，双双硬抗（凶险）',cls:'danger',fn:()=>{const R=doRoll('wil',20);log('<p>你怒吼一声，撑起护体灵光冲向两人之间：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));favorChange(a,6,'以命相护');favorChange(b,6,'以命相护');log('<p class="good">千钧一发之际，你以重伤换回两人平安。三人相顾无言，却都懂了。</p>')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.5));applyInjury('neijing');favorChange(a,-6,'护之不及');favorChange(b,-6,'护之不及');log('<p class="danger">你被余波震飞，两人虽无大碍，却都怨你护得不够周全（气血-50%，经脉受损）。</p>')}}},
    ]);
  }else{
    openEventModal('🌉 七夕 · 鹊桥相会','<p>七夕之夜，银河横空，鹊鸟衔羽搭桥。<b>'+esc(a.name)+'</b>与<b>'+esc(b.name)+'</b>竟于桥头不期而遇，四目相对，又齐齐看向你。</p>',[
      {txt:'💞 执起道侣之手，共赏星河',fn:()=>{favorChange(a,8,'七夕定情');favorChange(b,-4,'怅然若失');log('<p>你与'+esc(a.name)+'十指相扣，'+(S.daoPartner===a?'道侣':'对方')+'眉眼含笑，'+(b.favor>0?'只有'+esc(b.name)+'默默转身，把一声叹息留给了鹊桥。':'')+'</p>')}},
      {txt:'🌸 与两人各赠一枝鹊羽',fn:()=>{favorChange(a,3,'雨露均沾');favorChange(b,3,'雨露均沾');log('<p>你折了两枝鹊羽，各递一枝。两人虽都接下了，目光却都藏着心事。</p>')}},
      {txt:'🏃 趁月色遁走',fn:()=>{favorChange(a,-5,'七夕失约');favorChange(b,-5,'七夕失约');log('<p class="danger">你借着月色溜走，留下两人对着鹊桥无语凝噎。</p>')}},
    ]);
  }
}
function npcMaster(i){
  const n=S.npcs[i];
  if(S.master){toast('已有师尊');return}
  if(n.favor<70){log('<p class="sys">'+esc(n.name)+'摆手道：'+"「你我缘分未到，拜师一事莫要再提。」"+'（需好感 ≥70）</p>');passTime(1);renderAll();return}
  if(n.stage<bigStage(S.realm)+2){log('<p class="sys">对方笑道：'+"「以你如今境界，我倒没什么可教你的了。」"+'</p>');passTime(1);renderAll();return}
  const R=doRoll('cha',16);
  log('<p>你长跪不起，恳请拜入门下：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    S.master=Object.assign({},n,{kind:'free'});
    if(!S.arts.some(x=>x.name===n.art.name)){S.arts.push(n.art);log('<p class="loot">师尊传你 <b>'+n.art.name+'</b>（'+n.art.desc+'）。</p>')}
    else{const gw=growWil(0.35,'师尊指点你三日三夜，你豁然开朗');if(gw)log(gw)}
    n.favor=clamp(n.favor+10,0,100);
    passTime(5);renderAll();
  }else{log('<p class="danger">师尊摇头：「你心性未定，待历练一番再来吧。」</p>');passTime(1);renderAll()}
}
/* 打听他人：了解其关系网，可牵线搭桥、投其所好 */
function npcAskAbout(i){
  const n=S.npcs[i];
  closePanel();
  const rs=n.rels||{};
  const names=Object.keys(rs);
  if(!names.length){log('<p>'+esc(n.name)+'笑道：「我孤家寡人，哪有什么故交。」</p>');passTime(1);renderAll();return}
  const opts=names.slice(0,3).map(nm=>{
    const r=rs[nm];
    return {txt:'🔗 打听【'+nm+'】',fn:()=>{
      const other=S.npcs.find(x=>x.name===nm);
      const g=rand(2,4);
      n.favor=clamp(n.favor+g,0,100);
      log('<p>你与'+esc(n.name)+'聊起'+esc(nm)+'，'+esc(n.name)+'目光微动：「'+(r.type==='宿敌'||r.type==='恩怨'?'哼，我与那人有些旧怨，不提也罢。':'你怎的提起'+esc(nm)+'……我们确实是'+relLabel(r.type)+'。')+'」（'+esc(n.name)+'好感 +'+g+'）</p>');
      if(other&&other!==n&&chance(0.5)){other.favor=clamp(other.favor+1,0,100);log('<p class="sys">这话传到了'+esc(other.name)+'耳中，对方微微颔首（好感 +1）。</p>')}
      passTime(1);renderAll();
    }};
  });
  openEventModal('🔗 打听 · '+esc(n.name),'<p>你想了解'+esc(n.name)+'与何人的过往？</p>',opts);
}
/* 6.6 对话弹窗：角色互动菜单（含冷却提示） */
function npcDialog(i){
  const n=S.npcs[i];
  if(!n)return;
  const cd=n.cd||{};
  const cool=k=>{const d=cd[k]||0;return d>0?'（'+(d)+' 日后可用）':''};
  const pTag=n.gender==='女'?'♀':'♂';
  /* 2Q 世界回响：NPC 态度随境界分三档 */
  const tier=bigStage(S.realm)-bigStage(n.stage||0);
  const greet=tier>=3?'对方见你境界高深，言语间多了几分恭敬：「前辈驾临，有何指教？」':(tier<=-2?'对方上下打量你一眼，语气带着几分居高临下：「新来的？」':'对方拱手一礼，含笑问道：「道友请了。」');
  openEventModal('💬 与 '+esc(n.name)+'（'+esc(n.role)+' '+pTag+'）','<p>'+artImg(NPC_ART[n.role],64,64,'avatar')+esc(n.desc)+'</p>'+
    '<p class="sys">'+greet+'</p>'+
    '<p class="sys">好感：'+n.favor+'（'+npcFavorLabel(n.favor)+'） · 心情：'+(n.mood>=70?'😊 佳':n.mood>=40?'😐 平':'😔 郁')+(S.flag.qixiLeft>0?' · 🌉 七夕在望':'')+'</p>',[
    {txt:'💬 闲聊'+cool('talk'),fn:()=>npcChat(i)},
    {txt:'🙏 请教'+cool('ask'),fn:()=>npcAsk(i)},
    {txt:'🎁 赠礼'+cool('gift'),fn:()=>npcGift(i)},
    {txt:'⚔️ 切磋'+cool('duel'),fn:()=>npcDuel(i)},
    {txt:'🙏 求助'+cool('request'),fn:()=>npcRequest(i)},
    ...(S.companion===n?[]:[{txt:'🤝 结伴同行',fn:()=>npcCompanion(i)}]),
    ...(S.daoPartner===n?[]:[{txt:'💗 情缘',fn:()=>npcCourt(i)}]),
    ...(S.master===n?[]:[{txt:'🎓 拜师',fn:()=>npcMaster(i)}]),
    {txt:'🚶 就此别过',fn:()=>{log('<p>你与'+esc(n.name)+'拱手作别。</p>');renderAll()}},
  ]);
}
/* 道侣事件：互动中有得有失，处置不当会伤情缘，甚至姻缘断绝 */
function partnerEvent(){
  const p=S.daoPartner;
  if(!p)return;
  const g=p.gender==='女'?'她':'他';
  const evs=[
    {t:'林间妖气骤起，'+g+'下意识将你护在身后。',opts:[
      {txt:'🤝 并肩迎敌',fn:()=>{const g2=Math.floor(20+(p.stage||0)*8);S.cult+=g2;log('<p class="good">你们背靠背合力逼退妖物，情谊更深（修为 +'+g2+'）。</p>');favorChange(p,4,'共御外敌')}},
      {txt:'⚔️ 推开道侣，独自迎战',fn:()=>{const R=doRoll('wil',15);log('<p>你不由分说把'+g+'挡在身后：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g2=rand(60,150);S.cult+=g2;log('<p class="good">你独力斩妖，回望时却见'+g+'神色复杂（修为 +'+g2+'）。</p>');favorChange(p,-3,'逞强独战，不领其情')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));p.hp=Math.max(1,(p.hp||30)-Math.floor((p.hp||30)*0.3));favorChange(p,-12,'护人不周，致道侣受伤')}}},
    ]},
    {t:'道侣练功岔气，面色苍白，冷汗涔涔。',opts:[
      {txt:'💊 以真气助'+g+'顺气（心性判定）',fn:()=>{const R=doRoll('wil',15);log('<p>你双掌抵住道侣背心：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">一股暖流导入经脉，道侣气息渐匀，望向你的眼里多了几分依赖。</p>');favorChange(p,5,'施以援手')}else{p.hp=Math.max(1,(p.hp||30)-8);favorChange(p,-8,'真气逆行，道侣伤势加重')}}},
      {txt:'😤 责备'+g+'修行不精',fn:()=>{p.hp=Math.max(1,(p.hp||30)-4);favorChange(p,-10,'言语伤人')}},
    ]},
    {t:'一位同门师兄当众出言轻佻，调笑你的道侣。',opts:[
      {txt:'🚶 挺身而出，护住道侣（魅力判定）',fn:()=>{const R=doRoll('cha',15);log('<p>你大步上前，挡在'+g+'身前：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">师兄讪讪告退，道侣握住你的手，指尖微微发颤。</p>');favorChange(p,6,'挺身相护')}else{log('<p class="danger">师兄阴阳怪气地笑了几声才走，道侣面上无光。</p>');favorChange(p,-6,'护之不及')}}},
      {txt:'😶 佯装未见，岔开话题',fn:()=>{favorChange(p,-8,'懦弱失态')}},
    ]},
    {t:'道侣旧伤复发，'+g+'靠在崖边，神色疲惫。',opts:[
      {txt:'🏕️ 就地安营，悉心照料（三日）',fn:()=>{log('<p>你寻来灵草，生火熬药，日夜守着道侣。三日后，道侣气色好转。</p>');favorChange(p,5,'悉心照料')}},
      {txt:'💸 掷下灵石让其自行寻医',fn:()=>{S.stones=Math.max(0,S.stones-100);favorChange(p,-7,'冷漠疏离')}},
    ]},
  ];
  const e=pick(evs);
  openEventModal('✨ 道侣之事','<p>'+e.t+'</p>',e.opts);
}
/* 6.2 道侣专属事件链：不同角色各有其线（狐族/剑修/医修），跨境界延续 */
const PARTNER_CHAINS={
  '狐仙苏苏':{id:'husu',steps:[
    {stage:1,txt:'苏苏自袖中取出一枚温热的狐火玉佩，塞进你手心：「这是我一缕本命狐火，你带在身上，天涯海角我都寻得到你。」',opts:[
      {txt:'💞 郑重收下，贴身佩戴',cls:'primary',fn:()=>{S.flag.pFoxfire=true;S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=2;S.luck=clamp(S.luck+1,1,100);log('<p class="good">狐火玉佩入手温热：此后道侣双修增益 +0.1，气运 +1。</p>')}},
      {txt:'😌 笑着还给她',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p>你笑道：「人在眼前，何须信物。」她眼波流转，笑而不语。</p>')}},
    ]},
    {stage:2,txt:'某夜，苏苏忽然神色郑重：「我族有一处妖域秘境，需你我同往一探。你……可愿信我？」',opts:[
      {txt:'🦊 同往妖域秘境',cls:'primary',fn:()=>{S.flag.pFoxfire=true;S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p class="loot">妖域秘境中，你与苏苏并肩破阵，得狐族秘宝（修炼效率 +3% 持续，道侣同心）。</p>');S.flag.chain=S.flag.chain||{};S.flag.chain.yaoyu=S.flag.chain.yaoyu||1;}},
      {txt:'🚶 婉拒，恐涉两族之事',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p>苏苏眼神黯了黯，随即又笑开：「也罢，来日方长。」（情缘 -2）</p>');favorChange(p,-2,'婉拒妖域之行')}},
    ]},
  ]},
  '妖族狐女':{id:'husu',steps:[
    {stage:1,txt:'狐女摘下发间一根流光狐毫，绕在你腕上：「狐族信物，见毫如见人。」',opts:[
      {txt:'💞 收下狐毫',cls:'primary',fn:()=>{S.flag.pFoxfire=true;S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=2;S.luck=clamp(S.luck+1,1,100);log('<p class="good">狐毫绕腕：道侣双修增益 +0.1，气运 +1。</p>')}},
      {txt:'🚶 婉拒',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p>她哼了一声，把狐毫收了回去。</p>')}},
    ]},
    {stage:2,txt:'她邀你夜赴狐丘，说族中长辈想见见你。',opts:[
      {txt:'🦊 赴约',cls:'primary',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p class="loot">狐丘夜宴，你与狐族结下善缘（妖域机缘 +，道侣同心）。</p>');S.flag.chain=S.flag.chain||{};S.flag.chain.yaoyu=S.flag.chain.yaoyu||1;}},
      {txt:'🚶 推辞',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.husu=-1;log('<p>她闷闷不乐了好几日。</p>');favorChange(p,-2,'失约狐丘')}},
    ]},
  ]},
  '剑阁女侠':{id:'jianxia',steps:[
    {stage:1,txt:'她抽出随身的青锋，剑尖轻点你的掌心：「剑修之道，讲究人剑合一。来，与我比过这一路剑法。」',opts:[
      {txt:'⚔️ 以剑会友',cls:'primary',fn:()=>{const R=doRoll('str',14);log('<p>剑光交错：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.pSword=true;S.flag.tAttack=(S.flag.tAttack||0)+1;log('<p class="good">一番切磋，你悟得合击剑意（战斗攻势 +1）。</p>')}else{log('<p>你剑法生涩，被她指点了半日。</p>')}S.flag.pChain=S.flag.pChain||{};S.flag.pChain.jianxia=2;}},
      {txt:'🫣 自认剑道不精，请她指点',fn:()=>{const g=Math.floor(30+rl()*6);S.cult+=g;log('<p class="good">她倾囊相授，你获益良多（修为 +'+g+'）。</p>');S.flag.pChain=S.flag.pChain||{};S.flag.pChain.jianxia=2;}},
    ]},
    {stage:2,txt:'她取出一对剑穗，递你一支：「剑穗相系，同心同剑。我这一生，认准了你这一剑。」',opts:[
      {txt:'💞 系上剑穗',cls:'primary',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.jianxia=-1;S.flag.dualCount=(S.flag.dualCount||0)+0;log('<p class="good">剑穗随风，双剑同心：双修时情缘增长 +1，战斗合击 +1。</p>');}},
      {txt:'😅 岔开话题',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.jianxia=-1;log('<p>她愣了愣，把剑穗别回腰间，只说今日风大。</p>');favorChange(p,-2,'避而不答')}},
    ]},
  ]},
  '灵药仙子':{id:'yaoxian',steps:[
    {stage:1,txt:'她捧来一株会发光的灵草：「我参透了这株「月见兰」的药性——它认生，只有你我一起照看，它才肯开花。」',opts:[
      {txt:'🌿 与她共植月见兰',cls:'primary',fn:()=>{S.mats.sherb=(S.mats.sherb||0)+2;S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=2;log('<p class="good">月见兰在你们指尖绽开：灵草 ×2，她眼中满是星光。</p>')}},
      {txt:'🌱 只在一旁看着',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;log('<p>她细心照料了一夜，你只静静看着。花开时，她回眸一笑。</p>')}},
    ]},
    {stage:2,txt:'她说药圃深处有一株万年灵药，想与你同去采摘，但那里常有妖兽盘踞。',opts:[
      {txt:'🌿 同去采药',cls:'primary',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;const e=makeEnemy();e.name='守药妖兽';log('<p>你们循着药香深入药圃……一头 <b>'+esc(e.name)+'</b> 拦在路口！</p>');startCombat(e);}},
      {txt:'🏔️ 劝她改日再去',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;log('<p>你劝她谨慎，她乖巧点头。翌日她仍偷偷去了，带回来一株灵药塞给你。</p>');S.mats.sherb=(S.mats.sherb||0)+1;}},
    ]},
  ]},
  '采药女':{id:'yaoxian',steps:[
    {stage:1,txt:'她取出一株压得整整齐齐的灵草：「我晒了七天，最饱满的一株——给你。」',opts:[
      {txt:'🌿 收下灵草',cls:'primary',fn:()=>{S.mats.sherb=(S.mats.sherb||0)+1;S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=2;log('<p class="good">灵草药香扑鼻（灵草 ×1）。</p>')}},
      {txt:'🌱 推还给她',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;log('<p>她红着脸把灵草收回药篓：「那……那我自己留着。」</p>')}},
    ]},
    {stage:2,txt:'她拉着你去看后山那片她守护多年的药田，说要把它交给你一半。',opts:[
      {txt:'🌿 与她共守药田',cls:'primary',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;S.flag.farm=S.flag.farm||{crop:null};log('<p class="good">自此洞府灵田与她共享：灵田收获 +1 份（长期）。</p>');S.flag.farmBonus=true;}},
      {txt:'🚶 婉谢好意',fn:()=>{S.flag.pChain=S.flag.pChain||{};S.flag.pChain.yaoxian=-1;log('<p>她笑了笑，没再坚持。</p>')}},
    ]},
  ]},
};
function partnerChain(){
  const p=S.daoPartner;
  if(!p)return false;
  const cfg=PARTNER_CHAINS[p.role];
  if(!cfg)return false;
  S.flag.pChain=S.flag.pChain||{};
  const st=S.flag.pChain[cfg.id]||1;
  if(st<=0||st>cfg.steps.length)return false;
  if(!chance(0.5))return false;
  const step=cfg.steps[st-1];
  scene('道侣情缘 · '+p.role);
  log('<p>'+step.txt+'</p>');
  openEventModal('💞 道侣专属 · '+p.role,step.txt,step.opts);
  return true;
}
/* 普通角色：闲谈中的利害抉择，处置失当会掉好感，甚至交恶 */
function npcEvent(n){
  const g=n.gender==='女'?'她':'他';
  const evs=[
    {t:'闲谈间，'+g+'忽然提起你当年的一桩旧事，语气微妙。',opts:[
      {txt:'🙏 坦然承认，诚恳解释（魅力判定）',fn:()=>{const R=doRoll('cha',14);log('<p>'+esc(n.name)+'目光灼灼：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit)favorChange(n,4,'坦诚相待');else favorChange(n,-5,'越描越黑')}},
      {txt:'🤐 含糊其辞，转移话题',fn:()=>{favorChange(n,-3,'遮遮掩掩')}},
    ]},
    {t:''+g+'邀你品评一桩江湖恩怨，各执一词。',opts:[
      {txt:'💬 顺着对方的话说',fn:()=>{favorChange(n,3,'相谈甚欢')}},
      {txt:'⚖️ 据理力争（智慧判定）',fn:()=>{const R=doRoll('int',14);log('<p>你引经据典：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit)favorChange(n,3,'见解独到');else favorChange(n,-5,'话不投机')}},
    ]},
    {t:''+g+'托你办一件小事，你随口应下却忘了。',opts:[
      {txt:'🎁 立刻补上一份厚礼赔罪（80灵石）',fn:()=>{if(S.stones>=80){S.stones-=80;favorChange(n,5,'礼数周全')}else{favorChange(n,-6,'言而无信')}}},
      {txt:'🙏 诚恳致歉，言明苦衷',fn:()=>{favorChange(n,1,'诚恳致歉')}},
    ]},
    {t:''+g+'与人起了争执，对方是坊市一霸，正撸着袖子要动手。',opts:[
      ...((personaHas(S,'霸道')||personaHas(S,'狡诈'))?[{txt:'🗡️ 上前一步，以气势压人（霸道/狡诈限定 · 魅力判定）',fn:()=>{const R=doRoll('cha',15+personaBonus(S,'cha'));log('<p>你大步上前，挡在'+g+'身前，目光如刀：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){favorChange(n,5,'仗义出头');log('<p class="good">那地痞被你的气势镇住，讪讪退走。</p>')}else{favorChange(n,-5,'强出头惹祸');log('<p class="danger">对方不吃这套，你反而挨了一顿奚落。</p>')}}}]:[]),
      {txt:'🤝 好言相劝，递上灵石息事（50灵石）',fn:()=>{if(S.stones>=50){S.stones-=50;favorChange(n,4,'以和为贵')}else{favorChange(n,-2,'无力调停')}}},
      {txt:'🚶 拉着'+g+'避开是非',fn:()=>{favorChange(n,1,'明哲保身')}},
    ]},
  ];
  const e=pick(evs);
  openEventModal('✨ 闲谈风波','<p>'+e.t+'</p>',e.opts);
}
function daoChat(){
  const p=S.daoPartner;
  closePanel();
  if(maybeShura())return;
  if(chance(0.2)&&partnerChain())return;
  if((p.cd&&p.cd.talk||0)>0){log('<p>'+esc(p.name)+'依偎着摇摇头：「今日话已说尽啦，改日再聊。」</p>');passTime(1);renderAll();return}
  p.cd=p.cd||{talk:0,duel:0,gift:0};
  p.cd.talk=rand(8,14);
  if(chance(0.35)){partnerEvent();return}
  const topics=['修行','风月','往事','道途'];
  const topic=pick(topics);
  const g=rand(2,5)+((S.flag.qixiLeft||0)>0?3:0);
  p.favor=clamp(p.favor+g,0,100);
  p.affinity=clamp((p.affinity||60)+g,0,100);
  if((S.flag.qixiLeft||0)>0)log('<p class="sys">七夕鹊桥在望，情话格外动人。</p>');
  const lines=[
    '你与'+p.name+'并肩坐在崖边，聊起【'+topic+'】。山风拂过，伊人含笑。',
    '你讲起早年的趣事，'+p.name+'听得入神，末了轻轻一叹：「原来你也有这样的过往。」',
    '你们就【'+topic+'】辩了半日，谁也没说服谁，却都笑了。'
  ];
  log('<p>'+pick(lines)+'（情缘 +'+g+'）</p>');
  if(chance(0.15)){const gw=growWil(0.06,'情之所至，道心愈坚');if(gw)log(gw)}
  if(chance(0.12)){S.cult+=Math.floor(10+(p.stage||0)*6);log('<p class="good">道侣言谈间暗合玄机，你修为微进。</p>')}
  passTime(1);renderAll();
}
function daoTravel(){
  const p=S.daoPartner;
  closePanel();
  if(maybeShura())return;
  if(chance(0.4)){partnerEvent();return}
  openEventModal('🏞️ 与道侣同游','<p>你携'+esc(p.name)+'踏出山门，商议此行走法：</p>',[
    {txt:'🧗 登高揽胜',fn:()=>{const g=Math.floor(20+(p.stage||0)*10);S.cult+=g;log('<p>你们登临绝顶，云海在脚下翻涌，道侣临风而立，衣袂飘飘（修为 +'+g+'）。</p>');favorChange(p,2,'同赏云海');passTime(3);renderAll()}},
    {txt:'🌊 泛舟湖上',fn:()=>{const g=rand(20,60);S.stones+=g;log('<p>你们泛舟湖心，摘荷煮茶，还从湖底捞起一枚沉了百年的储物袋（灵石 +'+g+'）。</p>');favorChange(p,2,'泛舟之乐');passTime(3);renderAll()}},
    {txt:'🛖 夜宿山寺',fn:()=>{const gw=growWil(0.2,'携手夜谈，道心愈坚');log('<p>夜宿古寺，两人于佛前对坐品茶，静默中道心相通。</p>');if(gw)log(gw);favorChange(p,3,'静夜谈心');passTime(3);renderAll()}},
    {txt:'⚔️ 结伴猎妖',fn:()=>{openEventModal('🐗 猎妖途中','<p>你们循着妖气追入深林，一头妖兽自暗处暴起！</p>',[
      {txt:'🤝 联手迎战',fn:()=>{const e=makeEnemy();log('<p>你与道侣联手，与 <b>'+esc(e.name)+'</b> 战在一处！</p>');startCombat(e);favorChange(p,3,'并肩而战')}},
      {txt:'🛡️ 掩护道侣后撤',fn:()=>{const R=doRoll('agi',15);log('<p>你一把拉住道侣，且战且退：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">你们全身而退，道侣眼中满是关切。</p>');favorChange(p,2,'患难相扶')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));p.hp=Math.max(1,(p.hp||30)-8);favorChange(p,-9,'护人不成反受创')}}},
    ]);}},
  ]);
}
function daoGift(){
  const p=S.daoPartner;
  if(S.stones<100){toast('灵石不足');return}
  closePanel();
  if(maybeShura())return;
  if(chance(0.15)){partnerEvent();return}
  S.stones-=100;
  const g=rand(6,12)+((S.flag.qixiLeft||0)>0?2:0);
  p.favor=clamp(p.favor+g,0,100);
  p.affinity=clamp((p.affinity||60)+g,0,100);
  log('<p>你为'+p.name+'寻来一枚灵玉簪'+(chance(0.5)?'与一匣蜜饯':'')+'，对方收下时，眼底笑意藏不住（情缘 +'+g+'）。</p>');
  passTime(1);renderAll();
}
function daoPart(){
  const p=S.daoPartner;
  closePanel();
  logChoices([
    {txt:'💔 郑重分手（情缘清零）',cls:'danger',fn:()=>{log('<p>你与'+p.name+'于渡口话别。对方没有回头，风却把你的话吹散在江上。</p><p class="sys">自此道侣缘尽，各自修行。</p>');S.daoPartner=null;passTime(1);renderAll()}},
    {txt:'😅 只是说说而已',fn:()=>{log('<p>你话到嘴边又咽了回去，'+p.name+'似有所觉，深深看了你一眼。</p>');passTime(1);renderAll()}}
  ]);
}
function doDualCultivate(){
  if(!S.daoPartner){toast('无道侣');return}
  closePanel();
  if(chance(0.12)){partnerEvent();return}
  const p=S.daoPartner;
  const em=dualElemMult(p);
  const rel=em>=1.5?'五行相生，阴阳和合':em>1?'灵根相契，如鱼得水':em<1?'五行相克，灵气时有抵触':'灵力流转，中正平和';
  const g=Math.floor((15+S.root/4+(p.stage||0)*8)*rand(8,12)/10*em);
  S.cult+=g;
  S.flag.dualCount=(S.flag.dualCount||0)+1;
  scene('双修');
  log('<p>你与'+esc(p.name)+'相对而坐，双掌相抵，气息交融，阴阳相济，修为如水涨船高。</p><p class="sys">'+rel+'（五行相性 ×'+em.toFixed(1)+'）。</p><p class="good">修为 +'+g+'。</p>');
  if(p.affinity!==undefined){p.affinity=clamp(p.affinity+Math.round(em),0,200);log('<p class="sys">情缘 +'+Math.round(em)+'（现 '+p.affinity+'）。</p>')}
  if(chance(0.12)&&attrVal(S,'wil')<40){S.attrs.wil=clamp(S.attrs.wil+1,1,40);log('<p class="good">情意入道，你的道心愈发圆满（心性+1）。</p>')}
  if(chance(0.1)){p.favor=clamp(p.favor+2,0,100);p.affinity=clamp((p.affinity||60)+2,0,100);log('<p class="sys">'+p.name+'依偎在你肩头：「有你真好。」</p>')}
  const gch=growAttr('cha',0.08,'双修合气，神采渐丰');
  if(gch)log(gch);
  passTime(3);renderAll();
}

/* ================= 道统传承：化神收徒，身陨转生为弟子 ================= */
const DISCIPLE_TALENTS=[
  {id:'swordheart',n:'剑心通明',d:'修炼速度 +15%'},
  {id:'danfire',n:'丹火亲和',d:'炼丹天赋异禀'},
  {id:'memory',n:'过目不忘',d:'功法参悟更快'},
  {id:'root',n:'灵根天成',d:'突破瓶颈更顺'},
  {id:'will',n:'道心坚韧',d:'心魔难以侵蚀'},
];
function disciplePanel(){
  if(!S)return '';
  if(S.realm<21)return '<p style="color:#6f7a94">🔒 道统传承需<b>化神期</b>方可开启（现：'+REALMS[S.realm]+'）。届时可收徒传道；身陨之时可转生为弟子，道统不灭。</p>';
  const list=S.disciples||[];
  const html=list.map((d,i)=>{
    const need=discipleNeed(d);
    return '<div class="item-card"><div class="nm">'+artImg(d.gender==='女'?ART.lady:ART.daoist,40,40,'avatar')+'<b>'+esc(d.name)+'</b> <span class="tag">'+(d.gender==='女'?'♀':'♂')+'</span> <span class="tag">'+stageName(d.stage)+'</span></div>'+
      '<div class="ds">天赋：'+esc(d.talent?d.talent.n:'—')+'<br>传承功法：'+(d.art?esc(d.art.name):'待传')+' · 修行进度 '+Math.floor(d.progress||0)+'/'+need+' · 向道之心 '+d.favor+'</div>'+
      '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+
      '<button class="small" onclick="discipleAct('+i+',\'art\')">📖 传功（30日）</button>'+
      '<button class="small" onclick="discipleAct('+i+',\'teach\')">🎓 指点（30日）</button>'+
      '<button class="small" onclick="discipleAct('+i+',\'train\')">🗡️ 历练（30日）</button>'+
      '<button class="small" onclick="discipleAct('+i+',\'farewell\')">🎋 出师</button>'+
      '</div></div>';
  }).join('');
  return '<p style="color:#a99a72">化神之后，道统可传。收下弟子、传功授业；身陨之时可转生为弟子，香火不灭。</p>'+
    '<div style="margin:6px 0"><button class="small primary" onclick="takeDisciple()">🧒 收徒'+(list.length?'（'+list.length+'/3）':'')+'</button></div>'+
    (html||'<p style="color:#6f7a94">尚无弟子。道统传承，总得有人承继香火。</p>');
}
function discipleNeed(d){return Math.floor(100+d.stage*150)}
function discipleProgress(d,g){
  d.progress=(d.progress||0)+g;
  const need=discipleNeed(d);
  if(d.progress>=need&&d.stage<9){
    d.progress-=need;d.stage++;
    log('<p class="good">🎉 弟子<b>'+esc(d.name)+'</b>修为大进，晋入<b>'+stageName(d.stage)+'</b>！</p>');
  }
}
function takeDisciple(){
  closePanel();
  if((S.disciples||[]).length>=3){toast('门下一徒三人已满，先送弟子出师吧');return}
  const cands=S.npcs.filter(n=>n.met&&!n.foe&&n.favor>=60);
  const opts=cands.slice(0,4).map(n=>({txt:'🎓 '+esc(n.name)+'（'+esc(n.role)+' · 好感 '+n.favor+'）',fn:()=>{
    S.disciples.push({name:n.name,gender:n.gender,root:clamp(Math.floor((S.root+(n.root||50))/2),20,95),rootElem:n.rootElem||pickRootElem(),art:Object.assign({},S.arts[0]||{name:'基础吐纳诀',mult:1.0,desc:''}),stage:0,progress:0,favor:rand(40,60),talent:pick(DISCIPLE_TALENTS),growth:0,source:n});
    n.favor=clamp(n.favor+10,0,100);
    log('<p class="good">'+esc(n.name)+'恭恭敬敬行过拜师大礼，从此列于你门下（向道之心 +10）。</p>');
    passTime(1);renderAll();
  }}));
  opts.push({txt:'🌱 收一名门中记名弟子（随机）',fn:()=>{
    const g=pick(['男','女']);
    S.disciples.push({name:uniqueName(g),gender:g,root:rand(25,80),rootElem:pickRootElem(),art:Object.assign({},S.arts[0]||{name:'基础吐纳诀',mult:1.0,desc:''}),stage:0,progress:0,favor:rand(30,50),talent:pick(DISCIPLE_TALENTS),growth:0,source:null});
    log('<p class="good">一名记名'+(g==='女'?'女':'男')+'弟子<b>'+esc(S.disciples[S.disciples.length-1].name)+'</b>跪在你面前，眼中有光。你将他收入门下，传下第一门功法。</p>');
    passTime(1);renderAll();
  }});
  opts.push({txt:'🚶 暂且作罢',fn:()=>{log('<p>你思量片刻，觉得缘分未到。</p>');passTime(1);renderAll()}});
  openEventModal('🧒 收徒','<p>你想将道统托付给谁？（最多同门三人）</p>',opts);
}
function discipleAct(i,kind){
  const d=(S.disciples||[])[i];
  if(!d){toast('弟子已出师或云游');return}
  closePanel();
  if(kind==='farewell'){
    openEventModal('🎋 送弟子出师','<p>你欲送<b>'+esc(d.name)+'</b>出师，自立门户。'+(d.stage>=2?'他已小有所成，正是闯荡之时。':'他境界尚浅，出师恐有凶险。')+'</p>',[
      {txt:'🎋 正式出师',cls:'primary',fn:()=>{S.disciples.splice(i,1);addMerit(5);log('<p class="good">'+esc(d.name)+'三拜谢师，背起行囊远行。你望着'+(d.gender==='女'?'她':'他')+'的背影，恍惚看到当年的自己（功德+5）。日后仙途偶遇，仍是一段香火情。</p>');passTime(1);renderAll()}},
      {txt:'🫂 再留一段时间',fn:()=>{log('<p>你拍拍'+(d.gender==='女'?'她':'他')+'的肩：「再练练，急什么。」</p>');passTime(1);renderAll()}},
    ]);
    return;
  }
  if(kind==='art'){
    if(!d.art)d.art=Object.assign({},S.arts[0]||{name:'基础吐纳诀',mult:1.0,desc:''});
    const g=Math.floor(60+d.root/2);
    discipleProgress(d,g);
    d.favor=clamp(d.favor+3,0,100);
    log('<p>你于洞府中为<b>'+esc(d.name)+'</b>开坛讲法，将《'+esc(d.art.name)+'》的窍要倾囊相授（修行进度 +'+g+'）。</p>');
    if(chance(0.25)){d.art.level=(d.art.level||1)+1;log('<p class="good">'+(d.gender==='女'?'她':'他')+'悟性惊人，竟将功法参到第 '+(d.art.level)+' 重！</p>')}
    if(chance(0.12)){const gw=growWil(0.08,'教学相长，道心愈明');if(gw)log(gw)}
    passTime(30);renderAll();
  }else if(kind==='teach'){
    const R=doRoll('int',14);
    log('<p>你考校<b>'+esc(d.name)+'</b>的修行：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const g=Math.floor(80+d.root/2);discipleProgress(d,g);d.favor=clamp(d.favor+5,0,100);log('<p class="good">'+(d.gender==='女'?'她':'他')+'答得头头是道，你老怀大慰（修行进度 +'+g+'，向道之心 +5）。</p>')}
    else{const g=Math.floor(30+d.root/4);discipleProgress(d,g);log('<p>'+(d.gender==='女'?'她':'他')+'有些地方没听懂，你耐着性子又讲了一遍（修行进度 +'+g+'）。</p>')}
    passTime(30);renderAll();
  }else if(kind==='train'){
    const R=doRoll('str',13);
    log('<p>你命<b>'+esc(d.name)+'</b>下山历练三十日：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){const g=Math.floor(100+d.root/2);discipleProgress(d,g);d.favor=clamp(d.favor+4,0,100);const it=randItem(2);addItem(it);log('<p class="good">'+(d.gender==='女'?'她':'他')+'满载而归，还带回一件「'+it.name+'」（修行进度 +'+g+'）。</p>')}
    else{d.progress=(d.progress||0)+40;log('<p>'+(d.gender==='女'?'她':'他')+'风尘仆仆归来，说是遇了场风雨，耽误了修行（修行进度 +40）。</p>')}
    passTime(30);renderAll();
  }
}
/* 弟子随时间成长：玩家修行越久，门下弟子亦会精进 */
function discipleTick(days){
  if(!S||!S.disciples||!S.disciples.length)return;
  const target=bigStage(S.realm);
  for(const d of S.disciples){
    d.growth=(d.growth||0)+days;
    if(d.stage<target&&d.growth>=60&&chance(0.35)){
      d.growth-=60;
      discipleProgress(d,Math.floor(80+d.root/2));
    }
  }
}
