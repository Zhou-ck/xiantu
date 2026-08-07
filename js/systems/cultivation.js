/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 修炼 ================
====================================================== */
'use strict';
/* ================= 修炼 ================= */
function panelCult(){
  const dim=(S.cultStreak||0)>=60?'<p class="danger">⚠️ 你已连续闭关 '+S.cultStreak+' 日，道基渐惰——此后每闭关 30 日收益再降 10%（最低 40%）。外出探索、访友、办事可重置此状态。</p>':'';
  const sg=signNow();
  const realmTxt=S.realm<9?'炼气如溪流，缓缓汇入丹田，正是打根基之时。':S.realm<17?'道基已筑，金丹在望，灵气如潮，须步步为营。':S.realm<29?'元婴既成，念动而天地应，闭关之效远胜从前。':'合体大乘之资，每一分修为，皆是自天地间争来的造化。';
  const bn=bottleneckInfo(S);
  const nxt=S.realm+1;
  const needCult=nxt<THRESHOLDS.length?Math.max(0,THRESHOLDS[nxt]-S.cult):0;
  const progPct=nxt<THRESHOLDS.length?clamp(Math.floor(S.cult/THRESHOLDS[nxt]*100),0,100):100;
  const bnBtns=[];
  if(bn.active){
    if(bn.missingWis>0){
      bnBtns.push('<button class="small" onclick="panelRest()">📖 功法参悟 · 增悟性</button>');
      if(S.master)bnBtns.push('<button class="small" onclick="panelMaster()">🎓 请教师尊 · 增悟性</button>');
    }
    if(bn.missingTrail>0)bnBtns.push('<button class="small" onclick="panelExplore()">🗺️ 探索历练 · 增历练</button>');
  }
  const bnHtml=bn.active?'<div class="item-card"><div class="nm">⚓ 瓶颈压制 · '+bnStageText()+'</div><div class="ds">修为已至下一境界 '+(Math.floor(bn.progress*100))+'%，然<b>'+
    [bn.missingWis>0?'悟性（'+(S.wis||0)+'/'+bn.wisNeed+'）':null,bn.missingTrail>0?'历练（'+(S.trail||0)+'/'+bn.trailNeed+'）':null].filter(Boolean).join('、')+
    '</b>未足，闭关效率降至 ×0.6。'+bnStageAdvice()+'</div>'+(bnBtns.length?'<div class="row">'+bnBtns.join('')+'</div>':'')+'</div>':(bn.progress>=0.9?'<p style="color:#8fd0a0">⚓ 修为已足，悟性与历练兼备——瓶颈已破，可全力冲关，准备突破。</p>':'');
  openPanel('🧘 闭关修炼','<div class="cult-banner"><img class="cult-banner-img" src="assets/scenes/cult.jpg" alt="" loading="lazy" onload="this.classList.add(\'ld\')"><span class="cult-banner-tx">灵气汇聚 · 闭关之地</span></div>'+
    '<p>山中无甲子，寒尽不知年。'+realmTxt+'闭关可稳步增长修为，效率受<b>灵根</b>与<b>功法</b>影响'+(S.pillBuff>0?'，聚灵丹之力尚余 '+S.pillBuff+' 日（效率×1.5）':'')+'。</p>'+
    '<p style="font-size:14px;color:#e8d9a8">📈 基准收益 <b>×'+cultMultDisplay()+'</b>（灵根/功法/境界/季节/洞府等乘区合计；瓶颈压制/灵潮/苦修等临时增减见对应卡片）</p>'+
    (nxt<THRESHOLDS.length?'<div class="item-card"><div class="nm">📈 修为进度</div><div class="ds">'+fmtNum(S.cult)+' / '+fmtNum(THRESHOLDS[nxt])+'（'+progPct+'%）· 距「'+REALMS[nxt]+'」还需 '+fmtNum(needCult)+' 修为 · 小境界精进 ×'+smallStageMult(S.realm).toFixed(2)+'</div><div class="bar"><i style="width:'+progPct+'%"></i></div></div>':'')+
    artSynergyHtml()+
    moodTuneHtml()+
    '<div class="item-card"><div class="nm">🧿 真元 '+(S.spirit!==undefined?S.spirit:maxSpirit(S))+' / '+maxSpirit(S)+'</div><div class="ds">法力随休整、静心养神与时光缓缓恢复；可消耗 30 真元淬体换修为，或在炼制选材时「以真元控火」提升判定。</div><div class="row"><button class="small" onclick="spiritQuench()">🧿 真元淬体（30 真元）</button></div></div>'+
    '<p style="font-size:13px;color:#a99a72">闭关将进入<b>修炼窗口</b>：按真实时间缓缓推进，途中或有异动需当场抉择，可随时「提前出关」按进度结算；若有道侣相伴，可在窗口中切换<b>双人同修</b>。</p>'+
    bnHtml+
    (bn.progress>=0.9?breakPrepHtml(nxt):'')+
    cultMethodSceneHtml()+
    bnBreakHtml()+
    '<h4>☯️ 静修（稳妥）</h4>'+
    '<div class="row">'+
    '<button onclick="doCultivate(7,\'quiet\')">⏳ 7 日</button>'+
    '<button onclick="doCultivate(30,\'quiet\')">⏳ 30 日</button>'+
    '<button onclick="doCultivate(90,\'quiet\')">⏳ 90 日</button>'+
    '<button onclick="doCultivate(365,\'quiet\')">⏳ 一年</button>'+
    '</div>'+
    '<h4>🔥 苦修（凶险 · 效率 +40% · 走火 ≈'+Math.round(cultFireChance()*100)+'%'+(S.items.filter(i=>i.use==='save').length?' · 🛡️保命符 ×'+S.items.filter(i=>i.use==='save').length:'')+'）</h4>'+
    '<div class="row">'+
    '<button class="danger" onclick="doCultivate(7,\'bitter\')">🔥 7 日</button>'+
    '<button class="danger" onclick="doCultivate(30,\'bitter\')">🔥 30 日</button>'+
    '<button class="danger" onclick="doCultivate(90,\'bitter\')">🔥 90 日</button>'+
    '<button class="danger" onclick="doCultivate(365,\'bitter\')">🔥 一年</button>'+
    '</div>'+
    (S.realm>=9?'<div class="row"><button class="danger" onclick="heartTraining()">😈 心魔历练 · 15日（凶险 · 判定大失败可致死）</button></div>':'')+
    '<div class="row"><button onclick="settleMind()">🧘 静心养神 · 30日'+(S.heartDemons>0?'（涤心魔，养道心）':'（养道心）')+'</button></div>'+
    (S.flag.boostNext?'<p style="font-size:13px;color:#a8d5a8">灵潮涌动：下一次闭关修炼效率 ×1.5。</p>':'')+
    (sg?'<p style="font-size:13px;color:#e8c86a">📜 本季天机签：'+signDesc(sg.k)+'</p>':'')+
    dim+
    cultBreakdown()+
    '<div class="item-card"><div class="nm">📊 闭关与双修统计</div><div class="ds">闭关总计 '+(S.flag.cultDaysTotal||0)+' 日 · 双修 '+(S.flag.dualCount||0)+' 次 · 双修 '+(S.flag.dualDays||0)+' 日 · 独修 '+(S.flag.soloDays||0)+' 日'+(S.daoPartner?'<br>本次闭关可切换独修/双修（上限 3 次，间隔 ≥10 日，切换耗时 3 日）':'')+'</div></div>'+
    cultLogMini()+
    '<p style="font-size:13px;color:#6f7a94">当前效率：静修每 10 日约 '+Math.floor((8+S.root/6)*cultMult(S))+' 修为；苦修约 '+Math.floor((8+S.root/6)*cultMult(S)*1.4)+'。连续闭关越久，收益越低——出去走走，机缘与顿悟往往在天地之间。</p>');
}
/* 瓶颈文案随境界变化（14） */
function bnStageText(){
  const st=bigStage(S.realm);
  return st<=0?'根基未固':st<=2?'道基初成':st<=4?'元婴已成':st<=6?'合体在望':'大道如渊';
}
function bnStageAdvice(){
  const st=bigStage(S.realm);
  return st<=0?'炼气如掘井，一味静坐难竟全功——去行万里路，悟性自开。':st<=2?'筑基之后，须以「行」证「悟」：访名师、历险地，破境方有水到渠成之机。':st<=4?'元婴之体已明，所欠者唯道。多参玄理、多历世事，瓶颈自解。':'大道如渊，非静坐可渡。你的每一分阅历，都在为下一场天劫铺路。';
}
function cultLogMini(){
  const logs=(S.flag.cultLog||[]).slice(0,3);
  if(!logs.length)return '';
  return '<div class="item-card"><div class="nm">📜 最近闭关</div><div class="ds">'+logs.map(l=>esc(l.realm||'')+' '+l.days+'日'+(l.dual?' ☯️双修':' 🧘独修')+' +'+l.gain).join(' · ')+'</div></div>';
}
/* 3.2 速率分解：逐项列出每个乘数来源，让玩家看懂快与慢（相乘即总效率） */
function cultMultParts(s){
  s=s||S;
  const parts=[];
  for(let i=0;i<(s.arts||[]).length;i++){
    const a=s.arts[i];
    const role=i===0?1:0.5;
    const m=(a.mult+((a.level||1)-1)*0.05)*artGradeMult(a)*elemArtMult(s,a)*artMasteryMult(a)*role;
    parts.push({n:(i===0?'主修':'辅修')+'《'+a.name+'》'+(rootAffinity(s,a.elem)?'（相性）':''),m:m,note:'品阶×'+artGradeMult(a).toFixed(2)+((a.level||1)>1?' · 第'+a.level+'重':'')+(artMasteryLevel(a)?' · 熟练Lv.'+artMasteryLevel(a):'')});
  }
  let rm=rootQualityMult(s.root);
  if(s.root>=70)rm*=1.05;
  parts.push({n:'灵根品质',m:rm,note:rootTier(s.root)[0]+(s.root>=70?'（吐纳+5%已并入）':'')});
  if(s.realm<=2)parts.push({n:'✨ 新人加成',m:1.2});
  if(s.pillBuff>0)parts.push({n:'💊 聚灵丹',m:1.5,note:'余 '+s.pillBuff+' 日'});
  if(s.daoPartner)parts.push({n:'💞 道侣相伴',m:1.2});
  if(s.flag.matrix)parts.push({n:'🌀 聚灵阵',m:1.15});
  const sg=signNow();if(sg&&sg.cult)parts.push({n:'📜 天机签·'+signDesc(sg.k),m:sg.cult});
  if(s.sect&&s.sect.dark&&(s.bg.traits.some(t=>t.id==='dark')||s.bg.traits.some(t=>t.id==='dark2')))parts.push({n:'🌑 魔道亲和',m:1.1});
  if(s.prof==='alchemy'&&s.sect&&s.sect.id==='dan')parts.push({n:'⚗️ 丹修入宗',m:1.08});
  if(s.sect)parts.push({n:'🏯 宗门·'+secRank(s),m:1+sectCultBonus(s)});
  if(s.flag.dao==='dark')parts.push({n:'🌑 魔道问道',m:1.1});
  if(s.flag.caveLv)parts.push({n:'⛰️ 灵脉 Lv.'+s.flag.caveLv,m:1+s.flag.caveLv*0.08});
  if(s.flag.caveRooms&&s.flag.caveRooms.jing)parts.push({n:'🛏️ 静室',m:1.05});
  if(s.days%12<2)parts.push({n:'🌙 子时静修',m:1.1});
  const se=Math.floor(s.days/90)%4;
  if(se===0)parts.push({n:'🌸 春灵潮',m:1.05});
  if(se===3)parts.push({n:'❄️ 冬寒凝滞',m:0.95});
  if(s.pet&&s.pet.faint<=0&&(s.pet.talent==='root'||s.pet.talent==='speed'))parts.push({n:'🐾 灵兽相伴',m:1.05});
  parts.push({n:'🏔️ 境界加成',m:1+0.35*bigStage(s.realm),note:'每大境修炼根基 +35%'});
  parts.push({n:'📈 小境界精进',m:smallStageMult(s.realm),note:'大境内每层 +1.2%'});
  if(s.flag&&s.flag.flowChoice&&typeof flowType==='function'&&s.arts&&s.arts[0]&&flowType(s).id===s.flag.flowChoice)parts.push({n:'🗡️ 流派·'+FLOW_DEFS[s.flag.flowChoice].n,m:1.05,note:'同流派主修 +5%'});
  const bn=bottleneckInfo(s);
  if(bn.active)parts.push({n:'⚓ 瓶颈压制',m:0.6,note:'悟性 '+(s.wis||0)+'/'+bn.wisNeed+' · 历练 '+(s.trail||0)+'/'+bn.trailNeed});
  if((s.flag&&s.flag.impurity||0)>=30)parts.push({n:'⚠️ 灵浊压制',m:impurityCultPenalty(s),note:'速修积浊 '+(s.flag.impurity||0)+'/100'});
  if((s.flag&&s.flag.danTox||0)>=30)parts.push({n:'⚠️ 丹毒压制',m:danToxCultPenalty(s),note:'丹毒 '+(s.flag.danTox||0)+'/100'});
  return parts;
}
/* v42 功法相生推荐：灵根亲和（同属/变异主属）+ 五行相生关系一览，指引功法获取方向 */
function artSynergyHtml(){
  if(!S)return '';
  const relOf=e=>{
    if(!e||!ELEMS[e])return {t:'无属性',c:'#6f7a94'};
    if(rootAffinity(S,e))return {t:'相合',c:'#8fd0a0'};
    const r=elemOf(S);
    if(elemSheng(e,r)||elemSheng(r,e))return {t:'相生',c:'#a8d8a8'};
    if(elemBeat(e,r)||elemBeat(r,e))return {t:'相克',c:'#e08a6a'};
    return {t:'无关',c:'#6f7a94'};
  };
  const ownedRows=S.arts.map(a=>{
    const rel=relOf(a.elem);
    return '<div class="bd-row"><span>'+esc(a.name)+'（'+elemInfo(a.elem).i+'）</span><b style="color:'+rel.c+'">'+rel.t+'</b></div>';
  }).join('');
  const ownedSet={};for(const a of S.arts)ownedSet[a.name]=1;
  const rec=ARTS.filter(a=>!ownedSet[a.name]&&(rootAffinity(S,a.elem)||elemSheng(a.elem,elemOf(S)))).slice(0,3)
    .map(a=>'<div class="bd-row"><span>📖 '+esc(a.name)+'（'+elemInfo(a.elem).i+'）</span><b style="color:#8fd0a0">'+(rootAffinity(S,a.elem)?'相合':'相生')+'</b></div>').join('');
  const re=rootTier(S.root)[0]+' · '+elemInfo(elemOf(S)).n;
  return '<div class="item-card"><div class="nm">☯️ 功法相生</div><div class="ds">你为'+re+'。同属（或变异主属）功法修炼效率 ×1.15；相生之属亦有裨益。'+(rec?'<br>推荐参悟：'+rec:'<br>你已尽得相合功法，或可去坊市/宗门藏经阁/守关遗宝中寻更高品阶。')+'</div>'+(ownedRows?'<div class="bd-box" style="margin-top:6px"><div class="bd-head">已修功法</div>'+ownedRows+'</div>':'')+'</div>';
}
/* v44 心境主动微调：丹药/功法/静养多手段调控心境 */
function moodTuneHtml(){
  if(!S)return '';
  const hasClear=(S.items||[]).some(i=>i.use==='clear');
  const hasMood=(S.items||[]).some(i=>i.use==='mood');
  const calmArt=(S.arts||[]).some(a=>a.name==='清心诀');
  const sg=signNow();
  const mods=['当前心境 '+S.mood+'（突破/心魔判定 '+(moodMod()>=0?'+':'')+moodMod()+'）'];
  if(hasClear)mods.push('清心丹：涤尽心魔 · 心境 +15');
  if(hasMood)mods.push('安神香：心境 +15');
  if(calmArt)mods.push('《清心诀》相随：静心判定更稳');
  if(sg&&sg.demon)mods.push('⚠️ 本季忧思签：易生心魔');
  const btns='<div class="row">'+
    (hasMood?'<button class="small" onclick="useItemByName(\'安神香\')">🕯️ 焚安神香</button>':'')+
    (hasClear?'<button class="small" onclick="useItemByName(\'清心丹\')">💊 服清心丹</button>':'')+
    '<button class="small" onclick="settleMind()">🧘 静心养神</button></div>';
  return '<div class="item-card"><div class="nm">🪷 心境调控</div><div class="ds">'+mods.join(' · ')+'</div>'+btns+'</div>';
}
function useItemByName(name){
  if(!S)return;
  const i=(S.items||[]).findIndex(x=>x.name===name);
  if(i>=0){consume(i);panelCult();}
  else toast('行囊中没有 '+name);
}
function cultBreakdown(){
  const parts=cultMultParts(S);
  let product=1;
  const rows=parts.map(p=>{product*=p.m;return '<div class="bd-row"><span>'+esc(p.n)+'</span><b class="'+(p.m<1?'neg':'pos')+'">×'+p.m.toFixed(2)+'</b></div>'+(p.note?'<div class="bd-note">'+esc(p.note)+'</div>':'')}).join('');
  const bn=bottleneckInfo(S);
  const eff=bn.active?0.6:1;
  return '<div class="bd-box"><div class="bd-head">效率分解（静修合计 ×'+product.toFixed(2)+'）</div>'+rows+
    '<div class="bd-row total"><span>静修基准（每 10 日）</span><b>'+(8+S.root/6)+'</b></div>'+
    '<div class="bd-row total"><span>当前静修速率</span><b>约 '+Math.floor((8+S.root/6)*cultMult(S)*eff)+' / 10日</b></div>'+
    '<div class="bd-note">苦修 ×1.4、灵潮 ×1.5、托管倍率于闭关时另行计入；以上各项相乘即总效率。</div></div>';
}
/* ===== v55 修行深化：法门 / 场景 / 道基 / 灵浊 / 破障三选 ===== */
function cultDaoImpHtml(){
  const cap=daoBaseCap(S),db=S.flag.daoBase||0,imp=S.flag.impurity||0;
  const dbPct=Math.floor(daoBaseRatio(S)*100);
  const impWarn=imp>=30?('（修炼 -'+(5*Math.min(3,Math.floor((imp-30)/30)+1))+'%）'):'';
  const impHp=imp>=60?' · 气血 -10%':'';
  const bdBonus=daoBaseBreakBonus(S);
  return '<div class="item-card"><div class="nm">🪷 道基 '+db+'/'+cap+'（'+dbPct+'%） · ⚠️ 灵浊 '+imp+'/100'+impWarn+impHp+'</div><div class="ds">道基：同境界战力 +'+daoBaseCombat(S)+' · 突破判定'+(bdBonus>=1?' +'+bdBonus:bdBonus<0?' '+bdBonus:' 持平')+'（≥50% +1 · ≥80% 天劫减伤 · <30% -1）；灵浊为速修代价，静养/灵泉/洗灵露可排。</div></div>';
}
function cultMethodSceneHtml(){
  const mthId=S.flag.cultMethod||'qi',scnId=S.flag.cultScene||'cave';
  const mthBtns=CULT_METHODS.map(m=>{
    const locked=(m.id==='war'&&techPts()<(m.needTech||2))||(m.id==='wen'&&S.stones<(m.cost||30));
    return '<button class="small'+(mthId===m.id?' primary':'')+(locked?' locked':'')+'" onclick="setCultMethod(\''+m.id+'\')">'+m.i+' '+m.n+(locked?' 🔒':'')+'</button>';
  }).join('');
  const scnBtns=CULT_SCENES.map(sc=>{
    const locked=S.realm<sc.need;
    return '<button class="small scn-btn'+(scnId===sc.id?' primary':'')+(locked?' locked':'')+'" onclick="setCultScene(\''+sc.id+'\')"><img class="scn-thumb" src="assets/scenes/cult_'+sc.id+'.jpg" loading="lazy" alt="" onerror="this.style.display=\'none\'">'+sc.i+' '+sc.n+(locked?' 🔒':'')+'</button>';
  }).join('');
  const mth=cultMethod(mthId),scn=cultScene(scnId);
  return cultDaoImpHtml()+
    '<div class="item-card"><div class="nm">🧭 修炼法门 · '+mth.i+' '+mth.n+'</div><div class="ds">'+mth.desc+'（'+mth.note+'）<br>场景：'+scn.i+' '+scn.n+'（'+scn.desc+'）</div>'+
    '<div class="bd-box" style="margin-top:6px"><div class="bd-head">法门（每次闭关生效）</div><div class="row">'+mthBtns+'</div></div>'+
    '<div class="bd-box"><div class="bd-head">场景（境界解锁）</div><div class="row">'+scnBtns+'</div></div></div>';
}
function setCultMethod(id){
  const m=cultMethod(id);
  if(!m)return;
  if(m.id==='war'&&techPts()<(m.needTech||2)){toast('战意不足（需 '+(m.needTech||2)+'）');return}
  if(m.id==='wen'&&S.stones<(m.cost||30)){toast('灵石不足（需 '+(m.cost||30)+'）');return}
  S.flag.cultMethod=m.id;
  toast('修炼法门：'+m.n);
  panelCult();
}
function setCultScene(id){
  const sc=cultScene(id);
  if(!sc)return;
  if(S.realm<sc.need){toast('需 '+REALMS[Math.min(sc.need,REALMS.length-1)]+' 方可前往'+sc.n);return}
  S.flag.cultScene=sc.id;
  toast('修炼场景：'+sc.n);
  panelCult();
}
function bnBreakHtml(){
  const bn=bottleneckInfo(S);
  if(!bn.active)return '';
  const rows=[];
  if(bn.missingWis>0)rows.push('<button class="small" onclick="bottleneckStele()">🪨 悟道碑 · 10日（心性判定 · 悟性+1）</button>');
  if(bn.missingTrail>0)rows.push('<button class="small" onclick="bottleneckBattle()">⚔️ 实战破障 · 连战3场（胜+历练）</button>');
  if(bn.missingWis>0)rows.push('<button class="small" onclick="bottleneckDaolun()">📖 论道破障（论道胜场 +悟性）</button>');
  return '<div class="item-card"><div class="nm">⚡ 瓶颈破障 · 三选一</div><div class="ds">瓶颈不必干等——悟道、实战、论道，任选其一主动破障。</div><div class="row">'+rows.join('')+'</div></div>';
}
function bottleneckStele(){
  closePanel();
  scene('悟道碑前');
  log('<p>你于洞府外寻到一方残碑，盘坐碑前，以心神叩问碑上道痕。</p>');
  const R=doRoll('wil',15+Math.floor(S.realm/6),Math.floor((S.wis||0)/4));
  log('<p>静坐参碑：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){addWis(1);log('<p class="good">碑上道痕应心而亮，你只觉灵台通明（悟性 +1）。</p>')}
  else{log('<p class="sys">道痕晦暗，你参悟良久仍无所获，却也让心境沉静了几分。</p>');if(chance(0.3))addMood(5)}
  passTime(10);renderAll();
}
function bottleneckBattle(){
  closePanel();
  log('<p>你提剑出洞，于山道间连战三场，以战破障。</p>');
  const bossEnemy=n=>{const r=rl();return {name:'破障对手 · '+n,atk:6+Math.floor(r/2),def:2+Math.floor(r/4),hp:30+r*10,style:n%2?'burst':'rapid'}};
  const fight=(n)=>{
    if(n>3){addTrail(3);log('<p class="loot">三战皆捷，道心与身手同进（历练 +3）。</p>');if(typeof questTick==='function')questTick();passTime(1);renderAll();return}
    startCombat(bossEnemy(n),res=>{
      if(res.win){addTrail(1);log('<p class="good">第 '+n+' 战胜——历练 +1。</p>');fight(n+1)}
      else{log('<p class="sys">你负伤退回，此轮破障作罢（历练 +0）。</p>');passTime(1);renderAll()}
    },true);
  };
  fight(1);
}
function bottleneckDaolun(){
  panelDaolun();
  toast('论道胜场可破悟性之障');
}
function applyMeditationFx(fx){
  if(!fx||!S)return;
  const logs=[];
  if(fx.cult){S.cult+=fx.cult;logs.push('修为 +'+fx.cult)}
  if(fx.insight){S.flag.insights=(S.flag.insights||0)+1;logs.push('悟道 +1')}
  if(fx.dao){S.flag.daoBase=clamp((S.flag.daoBase||0)+fx.dao,0,daoBaseCap(S));logs.push('道基 '+(fx.dao>0?'+':'')+fx.dao)}
  if(fx.imp){S.flag.impurity=clamp((S.flag.impurity||0)+fx.imp,0,100);logs.push('灵浊 '+(fx.imp>0?'+':'')+fx.imp)}
  if(fx.mood){addMood(fx.mood);logs.push('心境 '+(fx.mood>0?'+':'')+fx.mood)}
  if(fx.wil){S.attrs.wil=clamp(S.attrs.wil+fx.wil,1,40);logs.push('心性 +1')}
  if(fx.heart&&S.heartDemons>0){S.heartDemons=Math.max(0,S.heartDemons+fx.heart);logs.push('心魔 '+(fx.heart>0?'+':'')+fx.heart)}
  if(fx.luck){S.luck=clamp(S.luck+fx.luck,1,100);logs.push('气运 '+(fx.luck>0?'+':'')+fx.luck)}
  if(fx.profExp){S.profExp=(S.profExp||0)+fx.profExp;logs.push('造诣经验 +'+fx.profExp)}
  if(fx.wander)S.flag.wanderMark=(S.flag.wanderMark||0)+fx.wander;
  if(logs.length)log('<p class="loot">顿悟所得：'+logs.join(' · ')+'。</p>');
}
function cultFireChance(){
  const m=S.flag&&S.flag.cultMethod?cultMethod(S.flag.cultMethod):null;
  return bitterFireChance()+(m&&m.fire||0);
}
/* 闭关修炼弹窗：真实时间推进 + 途中异动抉择 + 加成一览 + 道侣双修 */
const CULT_FLAVOR=[
  '灵气如溪，缓缓汇入丹田。',
  '洞外风过竹林，沙沙如诵经声。',
  '你闭目内视，经脉中灵光流转。',
  '一缕晨光透入洞府，尘埃在光柱中浮动。',
  '体内功法自转，似与天地同呼吸。',
  '远处传来山涧水声，心境愈发澄明。',
  '丹田中气旋缓缓壮大，如春芽破土。',
  '月上中天，灵气格外清冽。',
  '偶有鸟鸣入耳，却不扰半分心神。',
  '你感觉筋骨中传来阵阵暖意。',
];
const CULT_FLAVOR_MID=[
  '丹田之中灵光流转，隐隐已成气象。',
  '灵气如溪汇河，经脉中的真元愈发浑厚。',
  '闭目内视，道基之上浮起一层温润灵光。',
  '天地灵气随呼吸起伏，与你的功法暗暗相合。',
  '窗外的云海翻涌不休，你的气息却稳如磐石。',
];
const CULT_FLAVOR_HIGH=[
  '灵潮自地脉涌来，丹田如海纳百川。',
  '体内真元凝若实质，窍穴间隐有雷音。',
  '一缕道韵垂落，识海中浮现山河万里的虚影。',
  '天地灵气如潮汐涨落，你的修为随之起落。',
  '你隐约触到一线大道真意，又转瞬即逝，似有所悟。',
];
/* 14 随修为变化：异动判定难度与收益随境界提升，提示词分境界 */
function cultDc(base){return Math.min(30,base+Math.floor(S.realm/4)+(bigStage(S.realm)>=5?2:0))}
function cultGain(base){return Math.floor(base*(1+bigStage(S.realm)*0.25)*(1+S.root/140))}
let _cult=null,_cultTimer=null;
function doCultivate(days,mode,opts){
  closePanel();
  mode=mode||'quiet';
  const realMs=Math.max(4000,Math.min(60000,days*350));
  _cult={days:days,mode:mode,elapsed:0,realMs:realMs,paused:false,done:false,solo:!S.daoPartner,auto:true,tick:0,choices:null,pool:[],fired:0,want:0,trust:false,queued:[],switches:0,lastSwitchDay:-99,curMode:S.daoPartner?'solo':'solo',modeStart:0,modeDays:{solo:0,dual:0}};
  if(opts&&opts.solo!==undefined)_cult.solo=!!opts.solo;
  if(opts&&opts.auto===false)_cult.auto=false;
  if(opts&&opts.trust)_cult.trust=true;
  if(opts&&opts.trustMult!==undefined)_cult.trustMult=opts.trustMult;
  if(opts&&opts.toRealm!==undefined)_cult.toRealm=opts.toRealm;
  /* v55 法门 / 场景解析与代价扣取（不满足则自动回退以气养神） */
  let mth=cultMethod(S.flag.cultMethod||'qi');
  if(mth.id==='war'&&techPts()<(mth.needTech||2)){toast('战意不足，改用以气养神');S.flag.cultMethod='qi';mth=cultMethod('qi')}
  if(mth.id==='wen'&&S.stones<(mth.cost||30)){toast('灵石不足，改用以气养神');S.flag.cultMethod='qi';mth=cultMethod('qi')}
  if(mth.id==='body'){const need=Math.floor(maxSpirit(S)*(mth.spirit||0.2));if(!useSpirit(need)){toast('真元不足，改用以气养神');S.flag.cultMethod='qi';mth=cultMethod('qi')}}
  if(S.realm<(cultScene(S.flag.cultScene||'cave').need||0))S.flag.cultScene='cave';
  const scn=cultScene(S.flag.cultScene||'cave');
  _cult.method=mth;_cult.scene=scn;
  if(mth.id==='war')S.flag.tech.pts=(S.flag.tech.pts||0)-(mth.needTech||2);
  if(mth.id==='wen')S.stones-=(mth.cost||30);
  const eventsOn=(typeof setInterval==='function')&&!(opts&&opts.noEvents);
  if(eventsOn){
    _cult.pool=_cultEvents().map(e=>({make:e,at:0.22+Math.random()*0.55,used:false}));
    _cult.want=days>=90?2:(days>=30?(Math.random()<0.8?1:0):(Math.random()<0.55?1:0));
  }
  PENDING++;
  $('cultivate').style.display='flex';
  if(typeof T!=='undefined'&&T.reveal)T.reveal($('cultivate'));
  $('cultTitle').textContent=(_cult.trust?'🧘 修炼托管 · ':'🧘 闭关修炼 · ')+(mode==='bitter'?'苦修（走火 ≈'+Math.round(bitterFireChance()*100)+'%）':'静修（基准收益 ×'+cultMultDisplay()+'）');
  $('cultAbort').onclick=cultAbort;
  $('cultMode').onclick=cultToggleMode;
  $('cultLog').innerHTML='<div class="cult-line">你于洞府中盘膝而坐，运转'+esc(S.arts[0].name)+'，缓缓入定……</div>';
  _cultLogLine('<p class="sys">🧭 法门：'+mth.i+' '+mth.n+' · 场景：'+scn.i+' '+scn.n+'</p>');
  /* 2E 托管策略：自动购买聚灵丹 */
  if(_cult.trust&&S.flag.autoRules&&S.flag.autoRules.pill&&S.pillBuff<=0&&S.stones>=500){
    S.stones-=300;S.pillBuff+=30;
    _cultLogLine('<p class="good">💊 托管策略：自动购入聚灵丹一枚（-300灵石，30日内效率 ×1.5）。</p>');
  }
  _cultRenderBuffs();
  _cultRender(0,0);
  updatePendingUI();
  if(_cult.auto)_cultTimer=setTimeout(_cultTick,120);
}
function _cultRender(day,prog){
  if(!_cult)return;
  $('cultDay').textContent='第 '+Math.min(_cult.days,day)+' / '+_cult.days+' 日';
  $('cultBar').style.width=Math.max(0,Math.min(100,Math.floor(prog*100)))+'%';
}
function _cultRenderBuffs(){
  if(!_cult)return;
  const p=S.daoPartner;
  $('cultPartner').innerHTML=p?_cultPartnerHtml(p):'';
  const qbar=(_cult.queued&&_cult.queued.length)?'<div class="cult-qbar"><button class="small" onclick="_cultOpenQueued()">📌 处理暂存异动（'+_cult.queued.length+'）</button></div>':'';
  $('cultBuffs').innerHTML=_cultChips()+qbar;
  $('cultMode').textContent=p?(_cult.solo?'🧘 独修守心':'☯️ 双人同修'):'';
  $('cultMode').style.display=p?'':'none';
}
function _cultPartnerHtml(p){
  const solo=_cult.solo;
  const st=typeof partnerStage==='function'?partnerStage(p):null;
  return '<div class="cult-partner'+(solo?'':' dual')+'">'+artImg(NPC_ART[p.role]||ART.lady,52,52,'avatar')+
    '<div class="nm"><b>'+esc(p.name)+'</b> · '+stageName(p.stage||0)+(st?' · '+st.name:'')+'</div>'+
    '<div class="ds" style="font-size:12px;color:#a99a72">情缘 '+affectionLabel(p.favor)+'（'+p.favor+'/100） · 心动 '+(p.affinity||0)+'</div>'+
    '<div class="cult-dual-tag">'+(solo?'🧘 独修守心':'☯️ 双修同心 ×'+(typeof dualCultMult==='function'?dualCultMult(p).toFixed(2):'1.2'))+'</div></div>';
}
function _cultChips(){
  const chips=[];
  chips.push('📈 基准收益 ×'+cultMultDisplay());
  chips.push('灵根 '+rootTier(S.root)[0]);
  chips.push('功法 ×'+S.arts.reduce((a,x)=>a*(x.mult+((x.level||1)-1)*0.05)*artMasteryMult(x),1).toFixed(2));
  const bn=bottleneckInfo(S);
  if(bn.active)chips.push(['⚓ 瓶颈 ×0.6',true]);
  if(S.pillBuff>0)chips.push('聚灵丹 ×1.5');
  const sg=signNow();if(sg&&sg.cult)chips.push('📜 '+signDesc(sg.k));
  if(S.flag.matrix)chips.push('聚灵阵 ×1.15');
  if(S.pet&&petAlive()&&(S.pet.talent==='root'||S.pet.talent==='speed'))chips.push('🐾 灵兽 ×1.05');
  if(S.realm<=2)chips.push('✨ 新人 ×1.2');
  if(_cult.mode==='bitter')chips.push('🔥 苦修 ×1.4');
  if(S.daoPartner&&!_cult.solo)chips.push('☯️ 双修 ×1.2');
  if(S.daoPartner)chips.push('⇄ 切换 '+(_cult.switches||0)+'/3');
  if((S.cultStreak||0)>=60)chips.push(['⚠️ 收益递减',true]);
  return chips.map(c=>Array.isArray(c)?'<span class="cult-chip warn">'+esc(c[0])+'</span>':'<span class="cult-chip">'+esc(c)+'</span>').join('');
}
function _cultLogLine(html){
  const d=document.createElement('div');
  d.className='cult-line';
  d.innerHTML=html;
  $('cultLog').appendChild(d);
  $('cultLog').scrollTop=999999;
}
function _cultFlavor(){
  if(!_cult||_cult.done)return;
  const pool=S.realm>=17?CULT_FLAVOR_HIGH:S.realm>=9?CULT_FLAVOR_MID:CULT_FLAVOR;
  _cultLogLine('<span class="cult-line">'+pick(pool)+'</span>');
}
function _cultTick(){
  if(!_cult||_cult.done)return;
  if(_cult.paused)return;
  try{
    const now=Date.now();
    _cult.elapsed+=Math.max(120,Math.min(60000,now-(_cult.last||now)));
    _cult.last=now;
    if(_cult.elapsed>=_cult.realMs){
      if(_cult.queued&&_cult.queued.length){_cultOpenQueued();return}
      _cultFinish(1);return
    }
    const prog=_cult.elapsed/_cult.realMs;
    _cultRender(Math.floor(_cult.days*prog),prog);
    _cult.tick++;
    if(_cult.tick%10===0)_cultFlavor();
    for(const ev of _cult.pool){
      if(!ev.used&&_cult.fired<_cult.want&&prog>=ev.at){_cultFireEventAt(ev);return}
    }
  }catch(err){
    console.error('闭关 tick 异常：',err);
    _cult.elapsed+=1000;
  }
  if(_cult.auto&&!_cult.done&&!_cult.paused)_cultTimer=setTimeout(_cultTick,120);
}
function _cultFireEventAt(ev){
  ev.used=true;_cult.fired++;
  const e=ev.make();
  _cult.paused=true;
  _cultLogLine('<span class="scene">✦ 洞府异动 · '+esc(e.txt)+'</span>');
  const wrap=document.createElement('div');
  wrap.id='cultChoices';
  for(let i=0;i<e.opts.length;i++){
    const o=e.opts[i];
    const b=document.createElement('button');
    b.className=o.cls||'';
    b.textContent=o.txt;
    b.onclick=()=>_cultResolve(i);
    wrap.appendChild(b);
  }
  /* 托管模式：可选择「暂存待处理」，出关前统一抉择 */
  if(_cult.trust){
    const b=document.createElement('button');
    b.className='';
    b.textContent='📌 暂存待处理';
    b.onclick=()=>_cultDefer(e);
    wrap.appendChild(b);
  }
  $('cultLog').appendChild(wrap);
  $('cultLog').scrollTop=999999;
  _cult.choices=e.opts.map(o=>o.fn);
}
/* 托管：把洞府异动暂存，出关前再处理（不打断修炼） */
function _cultDefer(ev){
  if(!_cult||!_cult.paused)return;
  _cult.queued=_cult.queued||[];
  _cult.queued.push({txt:ev.txt,opts:ev.opts});
  _cult.paused=false;
  _cult.choices=null;
  const cp=$('cultChoices');
  if(cp)cp.innerHTML='';
  _cultLogLine('<p class="sys">📌 你将此事暂记心头，待出关后再作处置（暂存 '+_cult.queued.length+' 件）。</p>');
  _cultRenderBuffs();
  if(_cult.auto&&!_cult.done)_cultTimer=setTimeout(_cultTick,120);
}
/* 打开暂存队列：逐件抉择 */
function _cultOpenQueued(){
  if(!_cult||!_cult.queued||!_cult.queued.length)return;
  if(_cult.paused&&!_cult.resolvingQueued){toast('眼前之事未了');return}
  const ev=_cult.queued.shift();
  _cult.paused=true;
  _cult.resolvingQueued=true;
  _cultLogLine('<span class="scene">📌 暂存异动 · '+esc(ev.txt)+'</span>');
  const wrap=document.createElement('div');
  wrap.id='cultChoices';
  for(let i=0;i<ev.opts.length;i++){
    const o=ev.opts[i];
    const b=document.createElement('button');
    b.className=o.cls||'';
    b.textContent=o.txt;
    b.onclick=()=>_cultResolve(i);
    wrap.appendChild(b);
  }
  $('cultLog').appendChild(wrap);
  $('cultLog').scrollTop=999999;
  _cult.choices=ev.opts.map(o=>o.fn);
  _cultRenderBuffs();
}
function _cultFireEvent(){
  /* 测试/手动触发：立刻弹出下一件未发生之事 */
  if(!_cult||_cult.done||_cult.paused)return;
  if(!_cult.pool.length)_cult.pool=_cultEvents().map(e=>({make:e,at:0,used:false}));
  const ev=_cult.pool.find(x=>!x.used);
  if(!ev)return;
  ev.at=0;
  _cultFireEventAt(ev);
}
function _cultResolve(i){
  if(!_cult||!_cult.paused||!_cult.choices||!_cult.choices[i])return;
  const fn=_cult.choices[i];
  _cult.choices=null;_cult.paused=false;
  fn();
  const cp=$('cultChoices');
  if(cp)cp.innerHTML='';
  _cultRenderBuffs();
  if(_cult&&_cult.resolvingQueued){
    _cult.resolvingQueued=false;
    if(_cult.queued&&_cult.queued.length){_cultOpenQueued();return}
    _cult.paused=false;
    _cultLogLine('<p class="good">📌 暂存异动全部处理完毕，你再度入定。</p>');
    if(_cult.auto&&!_cult.done)_cultTimer=setTimeout(_cultTick,120);
    return;
  }
  if(_cult.auto)_cultTimer=setTimeout(_cultTick,120);
}
function cultToggleMode(){
  if(!_cult||_cult.done||_cult.paused){toast('眼前之事未了');return}
  if(!S.daoPartner){toast('并无道侣相伴');return}
  const curDay=_cult.days*(_cult.elapsed/_cult.realMs);
  if((_cult.switches||0)>=3){toast('本次闭关已切换三次，道侣轻声道：「专心修炼吧。」');return}
  if(curDay-(_cult.lastSwitchDay||-99)<10){toast('刚切换过同修方式，需再同修至少 10 日方可切换');return}
  /* 切换须双方同时收功调息，耗去 3 日，且计入统计 */
  const spent=Math.min(3,_cult.days-curDay);
  const md=_cult.modeDays;md[_cult.curMode||'solo']+=Math.max(0,curDay-(_cult.modeStart||0));
  _cult.switches=(_cult.switches||0)+1;
  _cult.lastSwitchDay=curDay+spent;
  _cult.curMode=_cult.solo?'dual':'solo';
  _cult.modeStart=curDay+spent;
  _cult.elapsed=Math.min(_cult.realMs,_cult.elapsed+spent/_cult.days*_cult.realMs);
  _cult.solo=!_cult.solo;
  _cultLogLine((_cult.solo?'<p class="sys">你与道侣相视点头，各自静坐，独修守心。':'<p class="good">道侣与你双掌相抵，灵气交融，同修共进。')+'（切换耗时 3 日 · 本次已切换 '+_cult.switches+'/3 次）</p>');
  _cultRenderBuffs();
}
function cultAbort(){
  if(!_cult||_cult.done||_cult.paused){toast('眼前之事未了');return}
  if(_cult.queued&&_cult.queued.length){toast('📌 尚有暂存异动未处理，先处理完再出关');return}
  const frac=_cult.elapsed/_cult.realMs;
  if(frac<0.05){toast('刚入定不久，再坐片刻吧');return}
  _cultFinish(frac);
}
function _cultEvents(){
  const evs=[];
  evs.push(()=>({txt:'灵气潮汐忽然涌动，如江河倒灌、经脉胀痛！',opts:[
    {txt:'⚔️ 运功强行疏导（心性判定）',cls:'primary',fn:()=>{
      const R=doRoll('wil',cultDc(16));
      _cultLogLine('灵气入体如潮：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=cultGain(40+S.root/3);S.cult+=g;_cultLogLine('<p class="good">你以道心为堤，借潮汐之力炼化真元（修为 +'+g+'）。</p>')}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));if(_cult.mode==='bitter'&&chance(0.4)){S.heartDemons++;_cultLogLine('<p class="danger">灵气逆行，气血受损，心魔烙下（气血-15%，心魔+1）。</p>')}else _cultLogLine('<p class="danger">灵气逆行，你吐出一口淤血（气血-15%）。</p>')}
    }},
    {txt:'🛡️ 抱元守一，任其来去',fn:()=>{_cultLogLine('你守住灵台，潮汐自身侧流过，毫发无伤。')}}
  ]}));
  evs.push(()=>({txt:'恍惚间，似有白须仙人抚顶而笑：「小子，可识得道为何物？」',opts:[
    {txt:'🙏 静心受教（智慧判定）',cls:'primary',fn:()=>{
      const R=doRoll('int',cultDc(15));
      _cultLogLine('仙音入耳：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=cultGain(60+S.root/2);S.cult+=g;_cultLogLine('<p class="good">一语惊醒梦中人，你悟得一线天机（修为 +'+g+'）。</p>');const gw=growWil(0.08,'闻道而悟');if(gw)_cultLogLine(gw)}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));_cultLogLine('<p class="danger">道音太深，你心神震荡，气血微亏（气血-10%）。</p>')}
    }},
    {txt:'🌬️ 不为所动，继续运功',fn:()=>{const g=cultGain(20+S.root/6);S.cult+=g;_cultLogLine('你心如止水，将幻象化去（修为 +'+g+'）。')}}
  ]}));
  evs.push(()=>({txt:'洞壁裂开一道灵光，一条漏网灵脉正喷吐灵气！',opts:[
    {txt:'⛏️ 分神采掘（身法判定）',cls:'primary',fn:()=>{
      const R=doRoll('agi',cultDc(15));
      _cultLogLine('灵光飞溅：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const st=rand(40,90);S.mats.iron=(S.mats.iron||0)+1;S.stones+=st;_cultLogLine('<p class="good">你截下一段灵脉精华：铁矿石 ×1，灵石 +'+st+'。</p>')}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.08));_cultLogLine('<p class="danger">灵脉炸裂，你被气流掀了个跟头（气血-8%）。</p>')}
    }},
    {txt:'💧 引灵入体，化为修为',fn:()=>{const g=cultGain(50+S.root/4);S.cult+=g;_cultLogLine('你引导灵脉灵气直入丹田（修为 +'+g+'）。')}}
  ]}));
  evs.push(()=>({txt:'心魔低语自识海深处响起：「你修这仙，到底为了什么？」',opts:[
    {txt:'🧘 守心不动（心性判定）',cls:'primary',fn:()=>{
      const R=doRoll('wil',cultDc(16));
      _cultLogLine('魔音贯耳：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=cultGain(30+S.root/5);S.cult+=g;_cultLogLine('<p class="good">你一声断喝，魔音尽散，道心反而更坚（修为 +'+g+'）。</p>');const gw=growWil(0.1,'直面心魔');if(gw)_cultLogLine(gw)}
      else{if(chance(0.5)){S.heartDemons++;_cultLogLine('<p class="danger">魔音趁隙而入，你添了一道心魔烙印（心魔+1）。</p>')}else _cultLogLine('<p class="danger">你惊出一身冷汗，气息微乱。</p>')}
    }},
    {txt:'📿 诵念清心诀',fn:()=>{if(S.heartDemons>0){S.heartDemons--;_cultLogLine('<p class="good">清心诀流转，一道心魔悄然消散（心魔-1）。</p>')}else{const g=cultGain(15+S.root/8);S.cult+=g;_cultLogLine('经文入心，灵台愈发明澈（修为 +'+g+'）。')}}}
  ]}));
  evs.push(()=>({txt:'一只灵鹤衔着朱红灵果落在洞前，歪头看你。',opts:[
    {txt:'🪶 接下灵果，含笑致意',cls:'primary',fn:()=>{S.mats.sherb=(S.mats.sherb||0)+1;const g=cultGain(30+S.root/6);S.cult+=g;_cultLogLine('<p class="good">灵果入手温热，灵气四溢（灵草 ×1，修为 +'+g+'）。</p>');if(chance(0.3)){const gw=growWil(0.08,'与灵鹤对望，心有所感');if(gw)_cultLogLine(gw)}}},
    {txt:'🕊️ 还果与鹤，结一段善缘',fn:()=>{addMerit(1);const g=cultGain(20+S.root/6);S.cult+=g;_cultLogLine('<p class="good">灵鹤长鸣一声，振翅而去（功德+1，修为 +'+g+'）。</p>')}}
  ]}));
  if(S.daoPartner&&!_cult.solo){
    evs.push(()=>({txt:S.daoPartner.name+'睁开眼，轻轻将一盏热茶推到你面前：「歇一歇，莫要熬坏了身子。」',opts:[
      {txt:'🍵 接过茶盏，相视一笑',cls:'primary',fn:()=>{const p=S.daoPartner;p.favor=clamp(p.favor+2,0,100);p.affinity=clamp((p.affinity||60)+2,0,100);const g=cultGain(40+S.root/5);S.cult+=g;_cultLogLine('<p class="good">茶香袅袅，情意暗涌（情缘+2，修为 +'+g+'）。</p>')}},
      {txt:'🙏 谢过道侣，继续闭关',fn:()=>{const g=cultGain(25+S.root/6);S.cult+=g;_cultLogLine('你接过茶一饮而尽，复又入定（修为 +'+g+'）。')}}
    ]}));
    evs.push(()=>({txt:'修炼至深处，'+S.daoPartner.name+'的指尖悄悄勾住你的小指，又飞快松开。',opts:[
      {txt:'💞 顺势握住，继续同修',cls:'primary',fn:()=>{const p=S.daoPartner;p.favor=clamp(p.favor+2,0,100);p.affinity=clamp((p.affinity||60)+3,0,200);_cultLogLine('<p class="good">指尖相扣，灵气相融，这一轮修炼格外顺畅（情缘+2，心动+3）。</p>')}},
      {txt:'🙈 假装不知，耳根却发烫',fn:()=>{const p=S.daoPartner;p.affinity=clamp((p.affinity||60)+1,0,200);_cultLogLine('<p class="sys">你耳根发烫，却把那只手扣得更紧了些（心动+1）。</p>')}}
    ]}));
  }
  /* v55 顿悟演出：数据化灵机事件池（低特效自动走第一项） */
  MEDITATION_EVENTS.forEach(me=>{
    evs.push(()=>{
      const e=MEDITATION_EVENTS.find(x=>x.id===me.id);
      return {txt:e.t,opts:e.opts.map(o=>({txt:o.txt,cls:o.cls||'',fn:()=>{applyMeditationFx(o.fx||{})}}))};
    });
  });
  return evs;
}
/* 苦修走火概率：与 _cultFinish 结算处的 dch 同源（22% 基础，本季忧思签再 +8%） */
function bitterFireChance(){
  return 0.22+(signNow()&&signNow().demon?0.08:0);
}
function _cultResult(days,mode,solo){
  const bitter=mode==='bitter';
  let mult=cultMult(S);
  if(solo&&S.daoPartner)mult/=1.2;
  if(_cult&&_cult.trustMult)mult*=_cult.trustMult;
  let boostLog='';
  if(S.flag.boostNext){mult*=1.5;S.flag.boostNext=false;boostLog='<p class="good">灵潮之力尚未消退，此番修炼事半功倍！</p>'}
  if(bitter)mult*=1.4;
  let methodLog='',sceneLog='',v55Log='';
  const mth=_cult&&_cult.method?cultMethod(_cult.method.id):null;
  const scn=_cult&&_cult.scene?cultScene(_cult.scene.id):null;
  if(mth&&mth.mult!==1){mult*=mth.mult;methodLog='<p class="sys">法门 '+mth.i+' '+mth.n+'：效率 ×'+mth.mult.toFixed(2)+'。</p>'}
  if(scn&&scn.mult!==1){mult*=scn.mult;sceneLog='<p class="sys">场景 '+scn.i+' '+scn.n+'：效率 ×'+scn.mult.toFixed(2)+'。</p>'}
  let bnLog='';
  const bn=bottleneckInfo(S);
  if(bn.active){
    mult*=0.6;
    const miss=[];
    if(bn.missingWis>0)miss.push('悟性缺 '+bn.missingWis);
    if(bn.missingTrail>0)miss.push('历练缺 '+bn.missingTrail);
    bnLog='<p class="sys">⚓ 瓶颈压制：修为已至下一境界 '+(Math.floor(bn.progress*100))+'%，'+miss.join('、')+'，修炼事倍功半。可去洞府<b>功法参悟</b>增悟性，或<b>探索/试炼塔</b>增历练。</p>';
  }else if(bn.progress>=0.9){
    bnLog='<p class="good">⚓ 悟性与历练兼备，瓶颈已破——你只觉得灵台通明，冲关之路再无滞碍！</p>';
  }
  const base=Math.floor((8+S.root/6)*mult);
  let gain=Math.floor(base*days/10*rand(8,12)/10);
  const dmult=streakDiminMult(S.cultStreak||0,days);
  let dimLog='';
  if(dmult<1)dimLog='<p class="sys">连续闭关日久，灵气吸纳渐缓，此番收益 ×'+dmult.toFixed(2)+'。</p>';
  gain=Math.floor(gain*dmult);
  let extra='';
  const t=d20()+attrVal(S,'wil')+Math.floor(S.luck/4);
  if(t>=30){gain*=3;extra='<p><span class="roll crit">🎲 大机缘</span> 你于物我两忘之际窥见天地玄机，修为暴涨，道心亦受淬炼。</p>';}
  else if(t>=22){gain=Math.floor(gain*1.5);extra='<p>这一日你福至心灵，隐隐触及了一丝大道真意，修炼事半功倍。</p>';}
  else if(t<=5){gain=Math.floor(gain*0.5);extra='<p><span class="roll fumble">🎲 心浮气躁</span> 你急于求成，气息紊乱，修为增长大打折扣。</p>';}
  /* v55 道基 / 灵浊 / 场景结算（法门与场景的「质量」代价） */
  const daoGain=(mth&&mth.dao||0)+(scn&&scn.daoX?1:0);
  if(daoGain){S.flag.daoBase=clamp((S.flag.daoBase||0)+daoGain,0,daoBaseCap(S));v55Log+='<p class="good">🪷 道基 +'+daoGain+'（现 '+(S.flag.daoBase||0)+'/'+daoBaseCap(S)+'）。</p>'}
  if(mth&&mth.imp){S.flag.impurity=clamp((S.flag.impurity||0)+mth.imp,0,100);v55Log+='<p class="sys">速修积浊：灵浊 +'+mth.imp+'（现 '+(S.flag.impurity||0)+'/100）。</p>'}
  if(scn&&scn.impClean&&(S.flag.impurity||0)>0){S.flag.impurity=Math.max(0,(S.flag.impurity||0)-scn.impClean);v55Log+='<p class="good">灵泉涤尘：灵浊 -'+scn.impClean+'（现 '+(S.flag.impurity||0)+'/100）。</p>'}
  if(mth&&mth.book)addItem({name:'修行手札',type:'consumable',quality:2,count:1,desc:'闭关著成的手札，展读可得修为并扬散修之名。',use:'notebook',sell:120});
  if(scn&&scn.danger&&chance(0.2)){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));v55Log+='<p class="danger">禁地凶险：一道残影扑来，你负伤而退（气血 -10%）。</p>'}
  extra+=methodLog+sceneLog+v55Log;
  return {gain:gain,bitter:bitter,boostLog:boostLog,dimLog:dimLog,bnLog:bnLog,extra:extra};
}
function _cultFinish(frac){
  if(!_cult||_cult.done)return;
  _cult.done=true;
  const days=Math.max(1,Math.floor(_cult.days*frac));
  const r=_cultResult(days,_cult.mode,_cult.solo);
  /* 托管至目标：修为恰好达到目标境界所需即停 */
  let targetLog='';
  if(_cult.toRealm!==undefined){
    const need=Math.max(0,THRESHOLDS[_cult.toRealm]-S.cult);
    if(need>0&&r.gain>=need){r.gain=need;targetLog='<p class="good">🎯 托管目标达成：修为已足「'+REALMS[_cult.toRealm]+'」所需，托管法阵自动停转。</p>'}
    else if(need<=0)targetLog='<p class="good">🎯 托管目标已然达成，法阵早停。</p>';
    else targetLog='<p class="sys">托管暂告段落，距目标「'+REALMS[_cult.toRealm]+'」尚差 '+(need-r.gain)+' 修为。</p>';
  }
  S.cult+=r.gain;
  let pre='';
  if(r.bitter){
    const dch=cultFireChance();
    if(chance(dch)){S.heartDemons++;pre+='<p class="danger">苦修走火，气血攻心，一道心魔悄然烙下（心魔+1）。</p>'}
    if(chance(0.2)){S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.12));pre+='<p class="danger">血气亏损，你咳出一口浊血（气血-12%）。</p>'}
    pre+=growWil(0.16,'以苦为薪，你的道心在磨砺中愈发坚韧');
    pre+=growAttr('str',0.10,'苦修淬体，气血筋骨愈发凝实');
  }else{
    pre+=growWil(0.12,'经年静修，你的道心愈发坚韧');
    pre+=growAttr('int',0.07,'静极生慧，你对天地之理的感悟渐深');
  }
  for(const a of S.arts){
    if(!a.bonus)continue;
    for(const k in a.bonus)pre+=(k==='wil'?growWil(0.08,'所修功法《'+a.name+'》潜移默化'):growAttr(k,0.06,'所修功法《'+a.name+'》潜移默化'));
  }
  for(const a of S.arts){const mg=gainArtMastery(a,days*3);if(mg)pre+=mg;}
  const partner=S.daoPartner;
  if(!_cult.solo&&partner){
    partner.favor=clamp(partner.favor+1,0,100);
    partner.affinity=clamp((partner.affinity||60)+1,0,100);
    S.flag.dualCount=(S.flag.dualCount||0)+1;
    pre+='<p class="good">与道侣同修'+days+'日，情缘渐深（情缘+1）。</p>';
  }else if(_cult.solo&&partner){
    pre+=growWil(0.06,'独修守心，道心愈发沉稳');
  }
  /* 15 双修/独修天数统计 */
  const md=_cult.modeDays||{solo:0,dual:0};
  md[_cult.curMode||'solo']+=Math.max(0,days-(_cult.modeStart||0));
  S.flag.soloDays=(S.flag.soloDays||0)+Math.round(md.solo);
  S.flag.dualDays=(S.flag.dualDays||0)+Math.round(md.dual);
  S.cultStreak=(S.cultStreak||0)+days;
  dC().c.cultDays+=days;
  S.flag.cultDaysTotal=(S.flag.cultDaysTotal||0)+days;
  S.flag.cultLog=S.flag.cultLog||[];
  S.flag.cultLog.unshift({at:S.days,days:days,mode:_cult.mode,dual:!_cult.solo,gain:r.gain,realm:REALMS[S.realm],bn:bottleneckInfo(S).active?'瓶颈':''});
  if(S.flag.cultLog.length>10)S.flag.cultLog.length=10;
  /* 2E 托管策略：修为满 90% 提醒突破 */
  if(_cult.trust&&S.flag.autoRules&&S.flag.autoRules.warn){
    const nxt=S.realm+1;
    if(nxt<THRESHOLDS.length&&S.cult>=THRESHOLDS[nxt]*0.9){
      pre+='<p class="sys">🔔 托管策略提醒：修为已至「'+REALMS[nxt]+'」所需的 '+(Math.floor(S.cult/THRESHOLDS[nxt]*100))+'%——是时候准备突破了。</p>';
    }
  }
  const dual=_cult.solo?'独修':'与'+esc(partner?partner.name:'道侣')+'同修';
  scene('闭关'+(frac<1?' · 提前出关':''));
  log('<p>你于洞府中运转'+esc(S.arts[0].name)+'，引天地灵气入体'+(partner&&!_cult.solo?'，与道侣双掌相抵、气息交融':'')+'。'+(r.bitter?'此为苦修之道，气血与灵元俱在燃烧。':'灵台空明，日月静好。')+'</p>'+r.boostLog+r.dimLog+r.bnLog+pre+r.extra+targetLog+'<p class="good">修为 +'+r.gain+'。'+(frac<1?'（提前出关，仅计 '+days+' 日收益）':'')+(md.dual>0?'<span class="sys">（双修 '+Math.round(md.dual)+' 日 / 独修 '+Math.round(md.solo)+' 日）</span>':'')+'</p>');
  $('cultivate').style.display='none';
  PENDING=Math.max(0,PENDING-1);
  _cultTimer=null;_cult=null;
  updatePendingUI();
  if(!passTime(days,true)){renderAll();return}
  maybeBreakHint();checkQuests();
  renderAll();
}
function finishCultivation(days){
  if(!passTime(days,true)){renderAll();return}
  maybeBreakHint();checkQuests();
  renderAll();
}
function heavenlyDisturbance(days,gain){
  const at=rand(20,Math.max(25,days-10));
  const rest=days-at;
  const k=rand(1,4);
  scene('闭关 · 天道扰动');
  if(k===1){
    log('<p>闭关至第 <b>'+at+'</b> 日，洞府灵气忽然暴走，如江河倒灌，经脉胀痛欲裂！灵气狂潮之中，你必须立刻做出决断。</p>');
    logChoices([
      {txt:'⚔️ 运功强行疏导（心性判定）',cls:'primary',fn:()=>{
        const R=doRoll('wil',cultDc(18));
        log('<p>灵气入体如潮：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){const g=cultGain(60+S.root/3);S.cult+=g;log('<p class="good">你以道心为堤，强行疏导，反而借暴走灵气炼化出一缕精纯真元（修为 +'+g+'）。</p>')}
        else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));if(chance(0.4)){S.heartDemons++;log('<p class="danger">灵气逆行冲脉，你气血大损，道心亦受震荡（气血-25%，心魔+1）。</p>')}else log('<p class="danger">灵气逆行冲脉，你吐出一口淤血，气血大损（气血-25%）。</p>')}
        finishCultivation(rest);}},
      {txt:'🛡️ 收功暂避，待其平息',fn:()=>{
        const lose=Math.floor(rest*0.4);
        const loss=Math.floor((gain||0)*0.3);
        S.cult=Math.max(0,S.cult-loss);
        log('<p>你果断收功，避入洞府深处。灵气洪峰过后，此次闭关收益折损三成（修为 -'+loss+'，余下 '+lose+' 日作罢）。</p>');
        finishCultivation(rest-lose);}}
    ]);
  }else if(k===2){
    log('<p>第 <b>'+at+'</b> 日深夜，一缕上古残魂自洞府深处浮现，目光灼灼地望着你：「小辈，可愿听老夫讲一段道？」</p>');
    logChoices([
      {txt:'📖 恭聆残魂讲道（智慧判定）',cls:'primary',fn:()=>{
        const R=doRoll('int',cultDc(17));
        log('<p>残魂开口，字字如雷：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){const g=cultGain(100+S.root/2);S.cult+=g;log('<p class="good">一段道音入耳，你醍醐灌顶（修为 +'+g+'）。</p>');if(chance(0.35)&&!S.arts.some(x=>x.mult>=1.15)){const a=Object.assign({},pick(ARTS.filter(x=>x.mult>=1.15)));S.arts.push(a);log('<p class="loot">残魂还赠你一篇功法：《'+a.name+'》。</p>')}}
        else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));log('<p class="danger">残魂道音太深，你气血翻涌，呕出一口血来（气血-20%）。</p>')}
        finishCultivation(rest);}},
      {txt:'🙏 长揖告退，敬而远之',fn:()=>{
        log('<p>残魂朗笑一声：「也罢，缘分未到。」化作青烟散去。你心头空落，却也安然。</p>');
        finishCultivation(rest);}}
    ]);
  }else if(k===3){
    log('<p>第 <b>'+at+'</b> 日，地底忽有闷雷滚过，一道灵脉恰在你洞府下方改道，天地灵气如沸水翻涌，地面裂开道道灵光缝隙！</p>');
    logChoices([
      {txt:'⛏️ 趁势采掘灵脉（身法判定）',cls:'primary',fn:()=>{
        const R=doRoll('agi',cultDc(16));
        log('<p>你纵身跃入灵光裂缝：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){
          const m=pick(['jade','iron','demonCore','sherb']);const n=rand(1,2);S.mats[m]=(S.mats[m]||0)+n;
          const g=rand(50,150);S.stones+=g;
          log('<p class="loot">你于地脉中捞得 <b>'+MAT_NAMES[m]+' ×'+n+'</b> 与灵石 '+g+' 块。</p>');
        }else{
          const loss=Math.floor((gain||0)*0.3);
          S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));S.cult=Math.max(0,S.cult-loss);
          log('<p class="danger">灵光裂缝骤然合拢，你被气浪掀飞，气血大损，本次闭关收益亦折损三成（气血-20%，修为 -'+loss+'）。</p>');
        }
        finishCultivation(rest);}},
      {txt:'🧘 抱元守一，任其来去',fn:()=>{
        const g=cultGain(30+S.root/4);S.cult+=g;
        log('<p>你不动如山，任地脉灵潮从身侧涌过。狂潮既去，你反而沾得一丝余泽（修为 +'+g+'）。</p>');
        finishCultivation(rest);}}
    ]);
  }else{
    log('<p>第 <b>'+at+'</b> 日深夜，天际一道火光直坠而下，正砸向你的洞府——竟是一块<b>天外陨铁</b>，砸得满地灵光迸溅！</p>');
    logChoices([
      {txt:'💪 运功接下陨铁（力量判定）',cls:'primary',fn:()=>{
        const R=doRoll('str',17);
        log('<p>你大喝一声，双手托天：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){
          S.mats.jade=(S.mats.jade||0)+1;S.mats.iron=(S.mats.iron||0)+2;
          const g=rand(60,140);S.stones+=g;
          log('<p class="loot">陨铁入手，竟还裹着一块寒玉！你将其采下（寒玉 ×1、铁矿石 ×2、灵石 +'+g+'）。</p>');
        }else{
          const loss=Math.floor((gain||0)*0.3);
          S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));S.cult=Math.max(0,S.cult-loss);
          log('<p class="danger">陨铁带着千钧之势砸落，你被气浪掀翻，气血大损，本次闭关收益亦折损三成（气血-20%，修为 -'+loss+'）。</p>');
        }
        finishCultivation(rest);}},
      {txt:'🏃 避让，任其坠入深谷',fn:()=>{
        log('<p>你闪身避开。陨铁轰然坠入深谷，你只觉可惜，却也安心。</p>');
        finishCultivation(rest);}}
    ]);
  }
}
function heartTraining(){
  closePanel();
  if(S.realm<9){toast('筑基之后，方可直面心魔');return}
  const R=doRoll('wil',22);
  scene('心魔历练');
  log('<p>你封闭五感，盘膝而坐，任由心魔幻象将自己吞没。'+(S.heartDemons>0?'心魔烙印在识海中灼灼发烫。':'你主动以幻象叩问本心。')+'</p>');
  log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.fumble){log('<p class="danger">幻象层层叠叠，你一时迷失其中——心魔反噬，神魂崩裂！</p>');die('走火入魔');return}
  if(R.hit){
    S.heartTrains=(S.heartTrains||0)+1;
    addMood(10);
    S.attrs.wil=clamp(S.attrs.wil+1,1,40);
    const g=rand(120,200);S.cult+=g;
    let extra='';
    if(S.heartDemons>0){S.heartDemons--;extra='，一道心魔烙印随之消去'}
    log('<p class="good">你于幻象中斩尽心魔，道心愈发圆满（心性+1'+extra+'，修为 +'+g+'）。</p>');
  }else{
    S.heartDemons++;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));
    const g=Math.floor(40+S.root/5);S.cult+=g;
    log('<p class="danger">幻象噬心，你虽侥幸挣出，却添了一道心魔烙印（心魔+1，气血-20%），唯修为略有所得（+'+g+'）。</p>');
  }
  passTime(15);renderAll();
}
function settleMind(){
  closePanel();
  const hadDemon=S.heartDemons>0;
  const R=doRoll('wil',16);
  scene('静心养神');
  log('<p>你寻了一处人迹罕至的崖顶，盘膝而坐，以三十日光阴涤荡道心'+(hadDemon?'、消磨心头魔障':'')+'。</p>');
  log('<p>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    addMood(8);
    const g=Math.floor(30+S.root/8);S.cult+=g;
    const sp=addSpirit(Math.floor(maxSpirit(S)*0.5));
    if(hadDemon){S.heartDemons=Math.max(0,S.heartDemons-1);log('<p class="good">尘念渐消，一道心魔烙印缓缓褪去（心魔-1）。</p>')}
    if((S.demonMarks||[]).length&&chance(0.6)){
      const m=S.demonMarks[rand(0,S.demonMarks.length-1)];
      removeDemonMark(m.type);
      log('<p class="good">静极生慧，「'+DEMON_TYPES[m.type].n+'」亦随之化去。</p>');
    }
    addWis(1);
    log('<p class="good">三十日静坐，灵台清明（修为 +'+g+'，悟性 +1'+(sp>0?'，真元回满 '+sp:'')+'）。</p>');
    const sw=growWil(0.22,'静极养神，道心愈发沉凝');
    if(sw)log(sw);
  }else{
    log('<p>心绪纷扰，此番静心收效甚微。你只觉道途仍长。</p>');
    if(hadDemon&&chance(0.15)){S.heartDemons++;log('<p class="danger">静极生动，心魔反而更盛一分（心魔+1）。</p>')}
  }
  passTime(30);renderAll();
}
/* 真元淬体：消耗 30 真元，化作修为 */
function spiritQuench(){
  if(!S)return;
  if(!useSpirit(30)){toast('真元不足（需 30）');return}
  const g=Math.floor(40+bigStage(S.realm)*20+Math.floor(S.root/3));
  S.cult+=g;
  log('<p class="good">🧿 你运转周身真元，淬炼经脉，修为 +'+g+'。</p>');
  passTime(1);renderAll();
}
function petGain(n){
  const p=S.pet;if(!p)return;
  if(S.flag.caveRooms&&S.flag.caveRooms.shou)n=Math.floor(n*1.25); /* 11 灵兽园 */
  if(typeof ownSectPetBonus==='function')n=Math.floor(n*ownSectPetBonus()); /* 自建宗门 · 灵兽园 */
  p.exp+=n;
  while(p.exp>=petLevelNeed(p)){
    p.exp-=petLevelNeed(p);p.level++;
    p.bonus=1+Math.floor(p.level/5);
    log('<p class="good">'+p.name+' 升级了（'+p.species+' '+p.level+'级，助战+'+p.bonus+'）。</p>');
    if(p.level%10===0){p.form++;log('<p class="loot">🎉 '+p.name+' 蜕变进化，化作 '+p.form+' 阶灵兽！</p>')}
  }
}
function petPanel(){
  if(!S.pet){openPanel('🐾 灵兽','<p>你尚无灵兽相伴。</p><p>可在<b>坊市·奇珍拍卖</b>或探索机缘中获得兽卵，于<b>行囊</b>中点「使用」孵化。</p>');return}
  const p=S.pet;
  const lvNeed=petLevelNeed(p);
  const pct=clamp(Math.floor((p.exp||0)/lvNeed*100),0,100);
  const art=p.species==='灵狐'?ART.foxPet:'';
  openPanel('🐾 灵兽 · '+esc(p.name),
    '<div class="pet-card"><div class="pet-img">'+(art?'<img class="pet-portrait" src="'+art+'" alt="" loading="lazy">':'<span class="pet-emoji">🐾</span>')+'</div>'+
    '<div class="pet-info"><div class="nm">'+esc(p.name)+' <span class="tag">'+esc(p.species)+'</span> <span class="tag">'+p.form+' 阶</span></div>'+
    '<div class="ds">天赋：'+esc(PET_TALENT_DESC[p.talent]||'')+' · 助战加成：+'+petCombatBonus()+'</div>'+
    '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="pet-exp">成长 '+p.exp+' / '+lvNeed+'（'+pct+'%）</div>'+
    '<div class="pet-status">'+(p.faint>0?'<span class="danger">重伤休养中，还需 '+p.faint+' 日</span>':'<span class="good">精神抖擞，时刻待命</span>')+'</div>'+
    '<div class="pet-btns"><button onclick="feedPet()">🍖 喂食灵石（50）</button>'+(p.faint<=0?'<button onclick="petTrain()">⚔️ 放养历练 · 15日</button>':'')+'</div></div></div>'+
    '<p style="font-size:12.5px;color:#6f7a94">喂食与历练可提升灵兽等级；助战加成随等阶提升，战斗与探索时自动生效。</p>');
}
function feedPet(){
  if(!S.pet){toast('没有灵兽');return}
  if(S.stones<50){toast('灵石不足');return}
  S.stones-=50;
  log('<p>你喂给 <b>'+S.pet.name+'</b> 一枚灵石，它欢快地打了个滚（成长 +10）。</p>');
  petGain(10);
  petPanel();passTime(1);renderAll();
}
function petTrain(){
  if(!S.pet||S.pet.faint>0){toast('灵兽状态不佳');return}
  const p=S.pet;
  const R=doRoll('str',12+Math.floor(p.level/3));
  scene('灵兽历练');
  log('<p>你将 <b>'+p.name+'</b> 放归山林历练，约定一月之期。</p><p>历练判定：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    petGain(25);
    const g=rand(20,60);S.cult+=g;
    log('<p class="good">'+(R.crit?'它竟叼回一枚妖丹，你一并炼化！':'它满载而归，气息明显凝实了几分。')+'（成长 +25，修为 +'+g+'）</p>');
    if(chance(0.5)){S.mats.herb=(S.mats.herb||0)+1;log('<p class="loot">它还带回一株灵草。</p>')}
  }else{
    p.faint=30;
    log('<p class="danger">'+p.name+' 受了重伤，被山民送回。它需要休养 30 日。</p>');
  }
  passTime(15);renderAll();
}
function maybeBreakHint(){
  const nxt=S.realm+1;
  if(nxt>=THRESHOLDS.length)return;
  if(S.cult>=THRESHOLDS[nxt])log('<p class="sys">你的修为已足以冲击 <b>'+REALMS[nxt]+'</b>，可前往【突破】一试。</p>');
}
