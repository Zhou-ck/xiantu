/* ======================================================
  仙途 · 丹药系统（v50）：丹毒 / 丹方研创 / 丹经
  数据表：js/data/pills.js（RESEARCH_RECIPES / PILL_TOX）
====================================================== */
'use strict';
/* ============ 丹毒 ============ */
function addDanTox(n,name){
  if(!S)return;
  n=Math.round(n||0);
  if(!n)return;
  const before=S.flag.danTox||0;
  S.flag.danTox=clamp(before+n,0,100);
  S.flag.danToxLog=S.flag.danToxLog||[];
  S.flag.danToxLog.push({n:n,name:name||'',d:Math.floor(S.days)});
  if(S.flag.danToxLog.length>20)S.flag.danToxLog.shift();
  if(n>0&&S.flag.danTox>before){
    log('<p class="sys">⚠️ 丹毒 +'+n+'（现 '+S.flag.danTox+'/100）。丹毒过高将压制修炼与气血，可服排毒丹或静养化解。</p>');
    if(S.flag.danTox>=30&&before<30)log('<p class="danger">药力淤积，经脉隐痛——修炼效率开始下滑（-5%）。</p>');
    if(S.flag.danTox>=60&&before<60)log('<p class="danger">丹毒攻心，气血衰微（最大气血 -10%）。速去排毒！</p>');
  }else if(n<0&&S.flag.danTox<before){
    log('<p class="good">丹毒 -'+(-n)+'（现 '+S.flag.danTox+'/100）。</p>');
  }
}
function danToxCultPenalty(s){
  const t=s&&s.flag&&s.flag.danTox||0;
  if(t<30)return 1;
  return 1-0.05*Math.min(3,Math.floor((t-30)/30)+1);
}
function danToxHpPenalty(s){
  const t=s&&s.flag&&s.flag.danTox||0;
  if(t<60)return 0;
  const base=40+s.attrs.str*3+Math.floor(powR(s.realm)*15);
  return Math.floor(base*0.1);
}
function danToxLabel(){
  const t=S&&S.flag&&S.flag.danTox||0;
  if(t<=0)return '无';
  if(t<30)return '<span style="color:#e8c86a">'+t+'/100 · 初染</span>';
  if(t<60)return '<span style="color:#e08a6a">'+t+'/100 · 淤积（修炼 -5%）</span>';
  if(t<80)return '<span style="color:#e06a6a">'+t+'/100 · 攻心（气血 -10%）</span>';
  return '<span style="color:#d04040">'+t+'/100 · 濒危（恐有反噬）</span>';
}
/* 丹毒反噬：≥80 每 30 日一次，可致死（受保命符保护） */
function danToxRageEvent(){
  if(!S)return;
  scene('丹毒反噬');
  log('<p class="danger">丹田一阵绞痛，丹毒如毒蛇般窜遍四肢百骸——你盘膝强压，脸上青气隐现。</p>');
  openEventModal('⚠️ 丹毒反噬','<p>丹毒在经脉中横冲直撞，再不化解，恐有身陨之虞！</p>',[
    {txt:'🧘 运功排毒（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',18);log('<p>你强行运转周天逼毒：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.danTox=Math.max(0,(S.flag.danTox||0)-12);log('<p class="good">你以道心压下毒势，逼出大半丹毒（丹毒 -12）。</p>');passTime(1);renderAll()}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.2));S.flag.danTox=Math.max(0,(S.flag.danTox||0)-4);log('<p class="danger">毒势反扑，你呕出一口黑血，气血大损（气血 -20%，丹毒 -4）。</p>');passTime(1);renderAll()}}},
    {txt:'💊 服下排毒丹强压',fn:()=>{const i=S.items.findIndex(x=>x.use==='detox');if(i<0){log('<p class="danger">你摸遍行囊，并无排毒丹——只能硬扛！</p>');S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));passTime(1);renderAll();return}S.items.splice(i,1);S.flag.danTox=Math.max(0,(S.flag.danTox||0)-20);log('<p class="good">一枚排毒丹入腹，丹毒消解大半（丹毒 -20）。</p>');passTime(1);renderAll()}},
    {txt:'😱 强撑硬扛（凶险）',cls:'danger',fn:()=>{const R=doRoll('str',20);log('<p>你咬紧牙关硬扛毒势：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.danTox=Math.max(0,(S.flag.danTox||0)-6);log('<p class="sys">你竟以肉身硬生生扛了过去（丹毒 -6）。</p>');passTime(2);renderAll()}else{die('丹毒反噬');return}}},
  ]);
}
/* ============ 丹方研创 ============ */
const RESEARCH_COMBOS={
  tonic:{need:{herb:2},pool:['排毒丹','聚气散'],hint:'草药 ×2 —— 寻常草木，亦可化腐朽为神奇。'},
  essence:{need:{sherb:1,herb:2},pool:['凝神丹','悟道丹','排毒丹'],hint:'灵草 ×1 + 草药 ×2 —— 药力渐盛，灵性初显。'},
  core:{need:{sherb:2,demonCore:1},pool:['固本丹','五行丹','暴血丹','悟道丹'],hint:'灵草 ×2 + 妖丹 ×1 —— 以妖丹引灵，药性刚猛。'},
  grand:{need:{sherb:2,demonCore:2,jade:1},pool:['回天丹'],hint:'灵草 ×2 + 妖丹 ×2 + 寒玉 ×1 —— 逆天之物，成则一丹回天。'},
};
function researchKnown(name){return !!(S.flag.researchDone&&S.flag.researchDone[name])}
function panelResearch(){
  if(!S){toast('尚未踏入仙途');return}
  if(!S.prof||S.prof!=='alchemy'){toast('需先习得「炼丹师」副业');return}
  const rows=Object.keys(RESEARCH_COMBOS).map(k=>{
    const c=RESEARCH_COMBOS[k];
    const need=Object.keys(c.need).map(m=>MAT_NAMES[m]+'×'+c.need[m]).join(' + ');
    const left=c.pool.filter(n=>!researchKnown(n));
    const ok=left.length>0&&Object.keys(c.need).every(m=>(S.mats[m]||0)>=c.need[m]);
    return '<div class="item-card"><div class="nm">🧪 '+esc(c.hint)+'</div><div class="ds">所需：'+need+(left.length?'<br>可悟：'+left.map(n=>'「'+n+'」').join('、'):'<br><span style="color:#8fd0a0">此路已尽，可另辟蹊径</span>')+'</div>'+
      (ok?'<div style="margin-top:6px"><button class="small primary" onclick="researchTry(\''+k+'\')">开始研创</button></div>':'<p style="font-size:11.5px;color:#6f7a94;margin-top:4px">材料不足或已无新方</p>')+'</div>';
  }).join('');
  const pity=S.flag.researchPity||0;
  openPanel('🧪 丹方研创','<p>古方有限，丹道无穷。以药材配伍、火候取舍，或可推演出前人所未载之丹方。</p>'+
    '<p class="sys">研创成功解锁新丹方（入丹方手札）；失败返还五成材料；'+(pity>0?'<b>研创顿悟保底 +'+pity+'</b>（失败累计）：':'')+'失败越多，越接近顿悟。</p>'+rows+
    '<p style="font-size:11.5px;color:#6f7a94;margin-top:8px">火候与灵根五行亦影响成丹——火灵根炼丹，悟性自高。</p>');
}
function researchTry(comboId){
  const c=RESEARCH_COMBOS[comboId];
  if(!c)return;
  if(!S.prof||S.prof!=='alchemy'){toast('需先习得炼丹师');return}
  for(const m in c.need)if((S.mats[m]||0)<c.need[m]){toast(MAT_NAMES[m]+'不足');return}
  for(const m in c.need)S.mats[m]-=c.need[m];
  openEventModal('🧪 研创 · 火候抉择','<p>药材已投入炉中，火光跃动——火候的取舍，决定药性走向。</p>',[
    {txt:'🔥 猛火急攻（富贵险中求 · 判定 +2 风险）',fn:()=>researchResolve(c,2)},
    {txt:'♨️ 文火慢煨（稳中求进 · 判定 +0）',fn:()=>researchResolve(c,0)},
    {txt:'🎯 看准时机（智慧判定 · 凭本事吃饭）',fn:()=>researchResolve(c,1)},
  ]);
}
function researchResolve(c,fire){
  closePanel();
  const fireB=fire===2?2:(fire===1?0:0);
  const fireDc=fire===2?2:(fire===1?0:0);
  const rootB=(S.rootElem==='fire'||(S.rootFuse&&S.rootFuse.indexOf('fire')>=0))?2:0;
  const pity=Math.min(3,S.flag.researchPity||0);
  const R=doRoll('int',18-fireDc,craftBonus()+fireB+rootB+pity);
  log('<p>你屏息凝神，引动炉火推演丹理：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  const pool=c.pool.filter(n=>!researchKnown(n));
  if(R.hit&&pool.length){
    S.flag.researchPity=0;
    const nm=pick(pool);
    S.flag.researchDone=S.flag.researchDone||{};
    S.flag.researchDone[nm]=true;
    const g=Math.floor(80+rl()*10);
    S.cult+=g;
    log('<p class="loot">丹香乍起，炉中灵光大盛——你推演出新丹方「<b>'+nm+'</b>」！（修为 +'+g+'，已入丹方手札）</p>');
    S.profExp+=rand(20,35);
    if((S.flag.insights||0)>=0&&chance(0.2)){S.flag.insights=(S.flag.insights||0)+1;log('<p class="good">推演丹理，你忽有所悟（悟道 +1）。</p>')}
  }else if(pool.length){
    S.flag.researchPity=Math.min(3,(S.flag.researchPity||0)+1);
    for(const m in c.need)S.mats[m]=(S.mats[m]||0)+Math.ceil(c.need[m]*0.5);
    log('<p class="danger">药性冲突，丹炉发出一声闷响——研创失败，返还五成材料（顿悟保底 +1）。</p>');
    if(chance(0.3)){S.profExp+=rand(8,15);log('<p class="sys">虽败，你仍记下些许药性变化（造诣经验小涨）。</p>')}
  }else{
    const g=Math.floor(100+rl()*12);
    S.cult+=g;S.profExp+=rand(15,25);
    log('<p class="good">此路丹方已尽，你却另有所悟——药理贯通，修为 +'+g+'，造诣精进。</p>');
  }
  if(S.profExp>=100){S.profLevel=(S.profLevel||1)+1;S.profExp-=100;log('<p class="loot">丹术精进！你已是 '+S.profLevel+' 阶炼丹师。</p>')}
  if(typeof questTick==='function')questTick();
  passTime(2);renderAll();panelResearch();
}
/* ============ 丹经（丹药图鉴） ============ */
function danBookRows(){
  const seen=new Set(Object.keys(S.seenI||{}));
  const known=new Set();
  if(typeof RECIPES!=='undefined'&&RECIPES.alchemy)RECIPES.alchemy.forEach(r=>{if(recipeKnown&&recipeKnown(r))known.add(r.name)});
  const names=[];
  if(typeof RECIPES!=='undefined'&&RECIPES.alchemy)RECIPES.alchemy.forEach(r=>names.push(r.name));
  for(const k in PILL_TOX)if(!names.includes(k))names.push(k);
  return names.map(nm=>{
    const got=seen.has(nm)||known.has(nm);
    const tx=pillTox(nm);
    const lg=S.flag.craftLog&&S.flag.craftLog[nm];
    const src=known.has(nm)?'丹方手札':'待发现';
    return '<div class="tome-cell'+(got?'':' dim')+'">'+(got?'':'🔒')+'<b>'+esc(nm)+'</b>'+(tx?('<span>丹毒 '+(tx>0?'+'+tx:tx)+'</span>'):'<span>无毒</span>')+(lg?'<span>最佳 '+lg.best+'</span>':'')+'</div>';
  });
}
function panelDanJing(){
  if(!S){toast('尚未踏入仙途');return}
  const rows=danBookRows().join('');
  const got=rows.match(/<b>/g)?rows.split('<b>').length-1:0;
  const total=(typeof RECIPES!=='undefined'&&RECIPES.alchemy?RECIPES.alchemy.length:0)+Object.keys(PILL_TOX).filter(k=>!(RECIPES&&RECIPES.alchemy&&RECIPES.alchemy.some(r=>r.name===k))).length;
  openPanel('📜 丹经','<p>丹道万千，一味一味皆是前人走过的路。服之、炼之、录之——集齐丹经，亦是一重道果。</p>'+
    '<p class="sys">已收录 '+got+' / '+total+' 味丹药 · 丹毒 '+(S.flag.danTox||0)+'/100（'+danToxLabel()+'）</p>'+
    '<div class="tome-grid">'+rows+'</div>'+
    '<p style="font-size:11.5px;color:#6f7a94;margin-top:8px">「丹毒」为服丹累积的药力之毒：过高压制修炼与气血，可用排毒丹、静养化解。未收录的丹药：炼制或服用后自动入册。</p>');
}
/* 固本丹：突破失败不损修为（一次性） */
function gubenProtect(){
  if(S&&S.flag&&S.flag.guben){
    S.flag.guben=false;
    log('<p class="good">💊 固本丹力发作——药力锁住丹田，修为分毫未损！</p>');
    return true;
  }
  return false;
}
