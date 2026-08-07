/* ======================================================
  仙途 · 突破系统（动画弹窗版）
  判定逻辑与原版一致，仅以分阶段动画呈现：蓄势→冲关→天劫/心魔→结果
====================================================== */
'use strict';

/* ---------- 突破动画弹窗工具 ---------- */
let _breakSteps=null,_breakDone=null;
function breakOpen(title,realmName){
  $('breakthrough').style.display='flex';
  if(typeof T!=='undefined'&&T.reveal)T.reveal($('breakthrough'));
  $('breakName').textContent=S.name;
  $('breakRealm').textContent='冲击 · '+realmName;
  const artKey=S.bg?(BG_ART[S.bg.id+(S.gender==='女'?'_f':'')]||BG_ART[S.bg.id]||ART.hero):ART.hero;
  $('breakPortrait').innerHTML=artImg(artKey,96,124,'');
  $('breakLog').innerHTML='';
  $('breakBar').style.width='0%';
  $('breakDay').textContent=title;
  PENDING++;
  updatePendingUI();
  const sk=$('breakSkip');
  if(sk){sk.style.display='inline-block';sk.onclick=()=>breakSkip()}
}
function breakLog(html,cls){
  const d=document.createElement('div');
  d.className='bt-line '+(cls||'');
  d.innerHTML=html;
  $('breakLog').appendChild(d);
  $('breakLog').scrollTop=999999;
}
function breakBar(pct){
  $('breakBar').style.width=clamp(pct,0,100)+'%';
}
function breakFlash(k){
  const el=k==='thunder'?$('btThunder'):k==='heart'?$('btHeart'):$('btAura');
  if(!el)return;
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  if(k==='thunder'){fxShake(3,420);fxFlash('#ffffff',240);fxVibrate([60,50,60])}
  if(k==='heart'){fxFlash('#5a2a5a',300);fxShake(2,220)}
  if(k==='aura'){fxBurst(18,'#ffd76a')}
  setTimeout(()=>el.classList.remove('on'),k==='aura'?1500:2700);
}
function breakRun(steps,done){
  _breakSteps=steps||[];_breakDone=done||null;
  const go=i=>{
    if(i>=_breakSteps.length){const d=_breakDone;if(d)d();return}
    const st=_breakSteps[i];
    if(st.t)breakLog(st.t);
    if(st.b!==undefined)breakBar(st.b);
    if(st.f)breakFlash(st.f);
    setTimeout(()=>go(i+1),st.d||500);
  };
  go(0);
}
/* 跳过演出：直接进入结算 */
function breakSkip(){
  if(!_breakDone)return;
  const d=_breakDone;_breakDone=null;_breakSteps=[];
  d();
}
function breakClose(){
  $('breakthrough').style.display='none';
  const sk=$('breakSkip');if(sk)sk.style.display='none';
  PENDING=Math.max(0,PENDING-1);
  updatePendingUI();
}

/* ---------- 突破主流程 ---------- */
function tryBreak(){
  closePanel();
  let nxt=S.realm+1;
  if(nxt>=THRESHOLDS.length){log('<p class="sys">你已超脱凡境，无需再行突破。</p>');return}
  const req=THRESHOLDS[nxt];
  if(S.cult<req){log('<p class="sys">修为不足。冲击 '+REALMS[nxt]+' 需 <b>'+req+'</b> 修为，你尚差 <b>'+(req-S.cult)+'</b>。</p>');return}
  /* 小境界：蓄势→冲关→一举数层 */
  if(!isBigBreak(nxt)){
    const names=[],layerGains=[];
    const startRealm=S.realm;
    while(nxt<THRESHOLDS.length&&!isBigBreak(nxt)&&S.cult>=THRESHOLDS[nxt]){
      names.push(REALMS[nxt]);
      const la=LAYER_ATTRS[nxt];
      if(la)layerGains.push(la);
      nxt++;
    }
    const target=nxt-1;
    const contBig=nxt<THRESHOLDS.length&&isBigBreak(nxt);
    S.flag.preBreak={attrs:Object.assign({},S.attrs),life:LIFESPANS[Math.max(0,S.realm)]};
    breakOpen('小境界突破',names.join(' → '));
    breakRun([
      {t:'<span class="bt-scene">◈ 蓄势引气</span><br>你盘膝引气，真元在丹田中鼓荡，周身灵气缓缓汇聚。',b:12},
      {t:'<span class="bt-scene">◈ 冲关</span><br>窍穴逐一洞开，真气如江河决堤，势不可挡！',b:66},
      {t:'<span class="bt-good">✓ 境界提升：'+names.join(' → ')+'</span>',f:'aura',b:100,d:750},
    ],()=>{
      S.realm=target;
      /* 17 突破后修为重算：扣除已消耗的各层门槛，余量结转，不再累加 */
      let consumed=0;
      for(let r=startRealm+1;r<=target;r++)consumed+=THRESHOLDS[r];
      S.cult=Math.max(0,S.cult-consumed);
      addWis(1);
      for(const la of layerGains)S.attrs[la]=clamp(S.attrs[la]+1,1,40);
      S.maxHp=calcMaxHp(S);S.hp=Math.max(S.hp,Math.floor(S.maxHp*0.6));
      logRealmDiff(target);
      scene('突破 · '+names.join(' → '));
      log('<p>体内真气如江河决堤，窍穴逐一洞开。你长身而起，只觉耳目一新，天地灵气更为亲近。</p><p class="good">境界提升：'+names.join(' → ')+'</p><p class="sys">突破耗去修为 '+consumed+'，余 '+S.cult+' 结转至新境界（悟性 +1）。</p>');
      if(layerGains.length)log('<p class="good">境界攀升，根基渐固（'+layerGains.map(k=>ATTR_NAMES[k]+' +1').join('、')+'）。</p>');
      breakClose();
      if(contBig){tryBreak();return}
      if(!passTime(3)){renderAll();return}
      checkQuests();renderAll();
    });
    return;
  }
  continueBigBreak(nxt);
}
/* 大境界突破：门槛检查 → 道心冲关 → 天劫/心魔动画 → 结果 */
function continueBigBreak(nxt){
  const breq=BREAK_REQS[nxt];
  if(breq){
    const missing=breq.filter(r=>!r.has());
    if(missing.length){
      scene('突破 · '+REALMS[nxt]);
      log('<p>你盘膝引气，真元在丹田中鼓荡，可那道天地之门前，横着一道不可名状的天堑，任你如何催动真气，始终差了一线。</p><p class="danger">冲击 <b>'+REALMS[nxt]+'</b> 尚缺：</p>');
      for(const r of missing)log('<p class="danger">· '+r.desc+'</p>');
      const dests=[...new Set(missing.map(r=>r.go))];
      const btns=dests.map(d=>({txt:BREAK_GO_MAP[d][0],cls:'primary',fn:()=>BREAK_GO_MAP[d][1]()}));
      btns.push({txt:'📜 暂且作罢，日后再来',fn:()=>{log('<p>你缓缓收功，将那份执念也一并收起。道途漫漫，不必急于一朝。</p>');renderAll()}});
      logChoices(btns);
      passTime(1);renderAll();return;
    }
  }
  const minW=WIL_REQ[nxt],dc=DIFFS[nxt];
  const kMod=karmaMod()+Math.min(4,S.flag.breakPity||0);
  if((S.flag.breakPity||0)>0)log('<p class="good">🛡️ 屡败屡战，天道垂怜：本次突破判定 <b>+'+(Math.min(4,S.flag.breakPity||0))+'</b>（保底累计 '+(S.flag.breakPity||0)+' 次，破境后清零）。</p>');
  if(effWil(S)<minW){
    scene('突破 · '+REALMS[nxt]);
    log('<p>你盘膝引气，可那道门纹丝不动。<span class="danger">道心不足</span>——冲击此境需心性 <b>≥ '+minW+'</b>（当前 '+effWil(S)+'，还差 '+Math.max(0,minW-effWil(S))+' 点）。</p><p>炼气期无【心魔历练】，可多<b>闭关静修/苦修</b>、探索寻<b>悟道奇遇</b>、拜师修习<b>增益心性之功法</b>、参加论道与听经，或服<b>破境丹</b>临时提升判定。</p>');
    logChoices([
      {txt:'🏮 去坊市 · 清心丹 / 破境丹',fn:()=>panelMarket()},
      {txt:'🧘 回洞府闭关 · 静心养神 / 心魔历练',fn:()=>panelCult()},
      {txt:'📚 翻阅修仙志 · 查看心性提升之法',fn:()=>openHelp()},
    ]);
    passTime(1);renderAll();return;
  }
  /* 2D 渡劫节点存档：大境界突破前自动留存，失败可天机回溯 */
  S.flag.tribSave=tribSnapshot();
  if((S.mood||60)<50)log('<p class="sys">心境：<b>'+moodLabel(S.mood||60)[0]+'</b>（'+S.mood+'，突破判定 '+(moodMod()>=0?'+':'')+moodMod()+'）——心绪不稳，或可先焚安神香、静心养神再冲关。</p>');
  /* 2D 天劫四型预告：金丹起每次大境界突破前，天机先给卦象 */
  if(nxt>=13&&!S.flag.tribType){
    const pool=['thunder','xinmo','yehuo','feng'];
    if(signNow()&&signNow().demon)pool.push('thunder');
    S.flag.tribType=pick(pool);
    const trib=S.flag.tribType;
    const hint=trib==='thunder'?'备<b>天雷符</b>或雷灵根淬体':trib==='xinmo'?'备<b>清心丹</b>、涤除心魔':trib==='yehuo'?'积累<b>功德</b>以清光消业':'备<b>防御法器</b>、修炼身法';
    log('<p class="sys">🔮 天机卦象：此劫当为<b>'+(trib==='thunder'?'天雷劫':trib==='xinmo'?'心魔劫':trib==='yehuo'?'业火劫':'风劫')+'</b>。宜'+hint+'。</p>');
  }
  /* 4.2 心魔试炼：筑基及以上大境界，突破前与「自己的影子」三回合交手 */
  if(nxt>=9){
    heartTrialStart(nxt,dc,kMod);
    return;
  }
  doBigBreakCore(nxt,dc,kMod,0);
}
/* ===== 4.2 心魔试炼：三回合影子战，胜场影响突破判定 ===== */
function heartTrialStart(nxt,dc,kMod){
  scene('心魔试炼 · 突破前');
  let mod=0;
  if(S.kills>=20)mod+=1;
  if((S.karma||0)>=50)mod+=1;
  if(S.merit>=80)mod-=1;
  if(S.flag.qingjie>0)mod+=1;
  if(S.bg.traits.some(t=>t.id==='dark'||t.id==='dark2'))mod+=1;
  if(attrVal(S,'wil')>=15)mod-=1; /* 8.3 道心圆融者，心魔有破绽 */
  const trial={round:0,wins:0,mod:mod};
  log('<p>道门之前，一道与你一模一样的身影自识海深处升起——那是<b>你的心魔</b>。它持着与你相同的法器，周身流转着相同的五行灵光，只一双眼睛比你的更冷。</p>');
  log('<p class="sys">三回合试炼：正面硬撼（力量）/ 以巧破力（身法）/ 默诵道经（心性）。胜场越多，突破越顺；三战全败将留【心魔烙印】并使突破判定 -2（失败重伤，不致死）。</p>');
  if(mod>0)log('<p class="danger">你杀孽/业力/情债缠身，心魔格外狰狞（试炼难度 +'+mod+'）。</p>');
  if(mod<0)log('<p class="good">你功德在身，心魔露出一线破绽（试炼难度 -1）。</p>');
  if(S.flag.trialMem)log('<p class="sys">上一次突破，你败在「'+S.flag.trialMem+'」——这次，心魔记得。</p>');
  heartTrialRound(nxt,dc,kMod,trial);
}
function heartTrialRound(nxt,dc,kMod,trial){
  trial.round++;
  const dcR=15+trial.mod+moodMod();
  const flavor=[
    pickDemonNarr('generic'),
    pickDemonNarr(pick(['wrath','fear','doubt'])),
    pickDemonNarr(pick(['ignorance','greed','doubt'])),
  ][trial.round-1];
  log('<p class="scene">第 '+trial.round+' 回合：'+flavor+'</p>');
  logChoices([
    {txt:'⚔️ 正面硬撼（力量判定）',cls:'primary',fn:()=>heartTrialResolve(nxt,dc,kMod,trial,doRoll('str',dcR),'硬撼')},
    {txt:'🌀 以巧破力（身法判定）',fn:()=>heartTrialResolve(nxt,dc,kMod,trial,doRoll('agi',dcR),'巧破')},
    {txt:'📿 默诵道经（心性判定）',fn:()=>heartTrialResolve(nxt,dc,kMod,trial,doRoll('wil',dcR),'诵经')},
  ]);
}
function heartTrialResolve(nxt,dc,kMod,trial,R,way){
  log('<p>你以「'+way+'」迎上心魔：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    trial.wins++;
    log('<p class="good">心魔幻影被震散半身，闷哼着退了一步！</p>');
  }else{
    log('<p class="danger">心魔洞穿了你的招式，识海一阵剧痛。</p>');
  }
  if(trial.round<3){heartTrialRound(nxt,dc,kMod,trial);return}
  const bonus=trial.wins>=3?4:trial.wins===2?2:trial.wins===1?1:-2;
  log('<p class="sys">三回合已毕：你压制心魔 <b>'+trial.wins+'/3</b> 回合。突破判定 '+(bonus>=0?'+':'')+bonus+'。</p>');
  if(trial.wins>=3){const gw=growWil(0.5,'斩却心魔，道心愈坚');if(gw)log(gw)}
  if(trial.wins===0){
    addDemonMark('obsess',60);
    S.flag.trialMem='默然失守';
  }else if(trial.wins===1&&chance(0.5)){
    S.flag.trialMem='被心魔寻到破绽';
  }
  doBigBreakCore(nxt,dc,kMod,bonus);
}
/* 大境界突破主流程（含 4.4 天劫类型化） */
function doBigBreakCore(nxt,dc,kMod,bonus){
  /* 2M 渡劫小游戏：天雷劫可微操闪避（默认开，设置可切自动） */
  if(nxt>=13&&!S.flag.tribMiniDone){
    const trib=S.flag.tribType||'thunder';
    if(trib==='thunder'&&fxOn()&&(!S.set||!S.set.autoTrib)){
      S.flag.tribMiniDone=true;
      tribMiniGame(b=>{S.flag.tribMiniBonus=b;doBigBreakCore(nxt,dc,kMod,bonus)});
      return;
    }
    S.flag.tribMiniDone=true;
  }
  const insB=Math.min(10,(S.insight||0));
  const daoB=(typeof daoBaseBreakBonus==='function')?daoBaseBreakBonus(S):0;
  const R=doRoll('wil',dc,kMod+moodMod()+(S.flag.daoInsight||0)+insB+daoB);
  R.t+=(bonus||0);
  R.hit=R.t>=dc;R.crit=R.t>=30;R.fumble=R.t<=5;
  const trib=S.flag.tribType||'thunder';S.flag.tribType=null;
  if(R.hit){
    const pre={thunderFails:[],heartFail:false,xinmoFails:[]};
    if(nxt>=13){
      const tribDc=clamp(16-(S.flag.tribMiniBonus||0),10,20);
      for(let i=1;i<=3;i++){
        let r2;
        if(trib==='thunder'){let b=0;if(S.rootElem==='thunder')b+=2;if(S.items.some(i=>i.use==='thunder'))b+=2;r2=d20()+attrVal(S,'str')+b;}
        else if(trib==='xinmo'){let b=0;if(S.items.some(i=>i.name==='清心丹'))b+=2;r2=d20()+effWil(S)+b;}
        else if(trib==='yehuo'){r2=d20()+attrVal(S,'int')+kMod;}
        else{r2=d20()+attrVal(S,'int');}
        pre.thunderFails.push({r2,fail:r2<tribDc});
      }
      if(pre.thunderFails.some(x=>x.fail)&&chance(0.25))pre.heartFail=true;
    }
    if(nxt===41){for(let i=1;i<=3;i++){const r2=d20()+effWil(S)+kMod;pre.xinmoFails.push({r2,fail:r2<22});}}
    S.flag.preBreak={attrs:Object.assign({},S.attrs),life:LIFESPANS[Math.max(0,nxt-1)]};
    breakOpen('大境界突破',REALMS[nxt]);
    const steps=[{t:'<span class="bt-scene">◈ 蓄势引气</span><br>灵气如潮，道门在前。你深吸一口气，以毕生道心凝于一念。'+(kMod?'<br><span class="bt-roll">功德与业力交织，天意微有偏倚 '+kMod+'</span>':'')+(insB>0?'<br><span class="bt-roll">💡 渡劫感悟加持：判定 +'+insB+'</span>':''),b:10}];
    steps.push({t:'<span class="bt-scene">◈ 道心冲关</span><br>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc),b:45,d:950});
    if(nxt>=13){
      const tribTxt={thunder:'乌云四合，万雷齐鸣，雷劫降临！',xinmo:'劫云深处，心魔幻影化作百丈魔躯，压顶而来！',yehuo:'业火自虚空燃起，灼烤因果业力，天地色变！',feng:'九天罡风倒卷，割裂虚空，吹得万木连根而起！'}[trib];
      const tribColor=trib==='yehuo'?'#e87a3a':trib==='feng'?'#9fc8e8':(S.rootElem==='thunder'?'#b48aef':S.rootElem==='fire'?'#e86a5a':S.rootElem==='water'?'#6aa8e8':'#c8b06a');
      steps.push({t:'<span class="bt-scene">◈ 天劫洗礼 · '+(trib==='thunder'?'天雷劫':trib==='xinmo'?'心魔劫':trib==='yehuo'?'业火劫':'风劫')+'</span><br>'+tribTxt,style:'color:'+tribColor,f:'thunder',b:60,d:850});
      let shieldTxt='';
      if(trib==='thunder'&&S.items.some(i=>i.use==='thunder'))shieldTxt='【天雷符化盾护体】';
      if(trib==='xinmo'&&S.items.some(i=>i.name==='清心丹'))shieldTxt='【清心丹灵光护持】';
      if(trib==='yehuo'&&S.merit>=80)shieldTxt='【功德清光消业】';
      if(shieldTxt)steps.push({t:'<span class="bt-good">'+shieldTxt+'——你早有准备，天劫威势为之一滞！</span>',f:'aura',d:650});
      pre.thunderFails.forEach((x,i)=>{
        const nm=trib==='thunder'?'天雷':trib==='xinmo'?'心魔之劫':trib==='yehuo'?'业火':'罡风';
        const good=trib==='xinmo'?'你抱元守一，魔影寸寸溃散！':trib==='yehuo'?'业火焚身，你以功德清光护住道基！':trib==='feng'?'罡风如刀，你岿然不动！':'雷光淬体，你咬牙硬撼天威！';
        const bad=trib==='xinmo'?'魔影趁隙而入，你心神剧震！':trib==='yehuo'?'业火燎心，你痛得蜷起身子！':trib==='feng'?'罡风割裂护体灵光，血珠飞溅！':'雷光贯穿肉身，你喷出一口鲜血！';
        steps.push({t:'<span class="bt-roll">第 '+(i+1)+' 道'+nm+'轰落：'+rollBadge(x.r2-d20(),d20(),x.r2,16)+'</span>'+(x.fail?'<br><span class="bt-bad">'+bad+'</span>':'<br><span class="bt-good">'+good+'</span>'),style:'color:'+tribColor,f:'thunder',d:1050});
      });
      if(pre.heartFail)steps.push({t:'<span class="bt-bad">天劫中你心生恐惧，心魔趁虚而入，留下了一道烙印……</span>',f:'heart',d:950});
    }
    if(nxt===41){
      steps.push({t:'<span class="bt-scene">◈ 终极心魔劫</span><br>最后一道门扉已开，心魔幻象层层压来——这是成仙前的终极考验！',f:'heart',d:850});
      pre.xinmoFails.forEach((x,i)=>{
        steps.push({t:'<span class="bt-roll">心魔幻象第 '+(i+1)+' 重：'+rollBadge(x.r2-d20(),d20(),x.r2,22)+'</span>',f:'heart',d:1000});
      });
    }
    steps.push({t:'<div class="bt-realm-up">✨ 道门轰然洞开！你迈入 <b>'+REALMS[nxt]+'</b>，天地为之一阔！</div>',f:'aura',b:100,d:950});
    breakRun(steps,()=>applyBreakSuccess(nxt,R,kMod,pre));
  }else{
    /* 2P 惩罚梯度：炼气-筑基只掉 10%；化神+ 掉 25% 但给「道基感悟」补偿 */
    const lossPct=nxt<13?10:(nxt>=21?25:rand(10,30));
    const loss=Math.floor(S.cult*lossPct/100);
    const failHd=chance(0.3);
    breakOpen('大境界突破',REALMS[nxt]);
    breakRun([
      {t:'<span class="bt-scene">◈ 蓄势引气</span><br>灵气如潮，道门在前，你凝神以待。',b:15},
      {t:'<span class="bt-scene">◈ 道心冲关</span><br>心性判定：'+rollBadge(R.r,R.mod,R.t,R.dc),b:58,d:950},
      {t:'<span class="bt-bad">✗ 道门震颤，反噬临身！</span><br>你身形剧震，一口逆血涌上喉头。',b:100,d:900},
    ],()=>applyBreakFail(loss,R,failHd));
  }
  S.flag.tribMiniDone=false;S.flag.tribMiniBonus=0;
}
/* 境界质变对比：突破前后属性 / 寿元变化一览 */
function logRealmDiff(nxt){
  const pre=S.flag.preBreak;S.flag.preBreak=null;
  if(!pre)return;
  const diffs=[];
  for(const k of ['str','agi','int','cha','wil'])if((S.attrs[k]||0)!==(pre.attrs[k]||0))diffs.push(ATTR_NAMES[k]+' '+(pre.attrs[k]||0)+'→'+S.attrs[k]);
  const lifeNew=LIFESPANS[Math.max(0,nxt)];
  if(pre.life!==undefined&&lifeNew!==pre.life)diffs.push('寿元 '+(isFinite(pre.life)?pre.life:'∞')+'→'+(isFinite(lifeNew)?lifeNew:'∞'));
  if(diffs.length)log('<p class="sys">📊 境界质变：'+diffs.join(' · ')+'</p>');
}
/* 2M 渡劫小游戏：三波雷云，闪避或硬撼，表现分档影响天雷判定 */
function tribMiniGame(onDone){
  const st={wave:1,ok:0,perfect:0};
  function wave(){
    openEventModal('⚡ 渡劫小游戏 · 第 '+st.wave+' 波','<div class="craft-stage"><i class="craft-fire trib-fire">⚡</i></div><p>雷云压顶，电弧在云层中翻滚积聚——闪避，或硬撼天威！</p><p class="sys">三波皆完美闪避：天雷判定大幅降低；全部硬吃：天雷更难。</p>',[
      {txt:'⬅️ 左闪（身法判定）',fn:()=>resolve(doRoll('agi',14))},
      {txt:'➡️ 右闪（身法判定）',fn:()=>resolve(doRoll('agi',14))},
      {txt:'⚔️ 硬撼天雷（力量判定）',fn:()=>resolve(doRoll('str',16))},
    ]);
  }
  function resolve(R){
    log('<p>第 '+st.wave+' 道天雷轰落：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){
      st.ok++;
      if(R.crit){st.perfect++;log('<p class="good">你身形一晃，堪堪避开雷光——完美！</p>')}
      else log('<p class="good">雷光擦身而过，你只觉浑身酥麻，并无大碍。</p>');
    }else{
      log('<p class="danger">雷光正中护体灵光，你闷哼一声，气血翻涌。</p>');
      fxFlash('#ffffff',200);fxShake(3,300);
    }
    if(st.wave<3){st.wave++;wave();return}
    const b=st.ok===3?2:(st.ok>=1?0:-2);
    log('<p class="sys">渡劫小游戏结算：'+(st.ok)+'/3 波化解，天雷判定 '+(b>=0?'+':'')+b+'。</p>');
    if(typeof onDone==='function')onDone(b);
  }
  wave();
}
/* 突破成功结算（动画完成后调用，逻辑与原版一致） */
function applyBreakSuccess(nxt,R,kMod,pre){
  if(S.flag.breakPity){S.flag.breakPity=0;}
  S.flag.tribSave=null;
  if(S.flag.daoInsight>0){S.flag.daoInsight--;log('<p class="good">道基感悟化为突破之力（判定加成已消耗）。</p>')}
  if((S.insight||0)>0){S.insight=0;log('<p class="good">渡劫感悟尽数化为突破之力，烙印消散（判定加成已消耗）。</p>')}
  rewardPush([{name:'晋入 '+REALMS[nxt],src:'突破',rare:true}]);
  log('<div class="realm-jump"><span class="rj-ico">✨</span><div class="rj-tx"><b>'+esc(REALMS[nxt])+'</b><small>道心冲关 · 天劫洗礼 · 破境成功</small></div></div>');
  const daoProtect=(typeof daoBaseRatio==='function'&&daoBaseRatio(S)>=0.8)?0.9:1;
  for(const x of pre.thunderFails)if(x.fail)S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25*daoProtect));
  if(pre.heartFail)addDemonMark('fear',60);
  S.realm=nxt;S.maxHp=calcMaxHp(S);S.hp=Math.max(S.hp,Math.floor(S.maxHp*0.6));
  S.flag.bigBreaks=(S.flag.bigBreaks||0)+1;
  /* 17 突破后修为重算：扣除本次大境界门槛，余量结转 */
  S.cult=Math.max(0,S.cult-THRESHOLDS[nxt]);
  addWis(1);
  S.temp.break=0;
  scene('突破 · '+REALMS[nxt]);
  log('<p class="good">道门轰然洞开！你迈入 <b>'+REALMS[nxt]+'</b>，天地为之一阔，寿元增至 <b>'+LIFESPANS[nxt]+' 岁</b>。</p>');
  log('<p class="sys">突破耗去修为 '+THRESHOLDS[nxt]+'，余 '+S.cult+' 结转至新境界（悟性 +1）。</p>');
  const ul=unlockListAt(nxt);
  if(ul)log('<p class="loot">🎁 本次突破解锁：'+ul+'</p>');
  if(nxt>=9&&S.heartDemons>0){S.heartDemons--;log('<p class="good">天地灵气涤荡心扉，一道心魔烙印随之消去。</p>')}
  if(nxt>=9&&(S.demonMarks||[]).length&&chance(0.5)){
    const m=S.demonMarks[rand(0,S.demonMarks.length-1)];
    removeDemonMark(m.type);
    log('<p class="good">破境之力涤荡识海，「'+DEMON_TYPES[m.type].n+'」亦随之化去。</p>');
  }
  if(nxt>=9){
    const map={9:'agi',13:'str',17:'wil',21:'int',25:'cha',29:'agi',33:'str',37:'wil'};
    const k=map[nxt]||'int';
    S.attrs[k]=clamp(S.attrs[k]+1,1,40);
    if(S.bond)S.bond.level++; /* 本命法宝随境界成长 */
    let txt='大境界之跃，道体蜕变（'+ATTR_NAMES[k]+' +1）。';
    if(nxt===13||nxt===21||nxt===29||nxt===37){
      for(const key of ['str','agi','int','cha','wil'])S.attrs[key]=clamp(S.attrs[key]+1,1,40);
      txt+='天劫淬体，五维齐进（力量/身法/智慧/魅力/心性 +1）。';
    }
    log('<p class="good">'+txt+'</p>');
  }
  logRealmDiff(nxt);
  if(S.bg.traits.some(t=>t.id==='blood')){S.luck=clamp(S.luck+1,1,100);log('<p class="good">家族血脉隐隐苏醒，气运 +1。</p>')}
  if(nxt===9&&!S.flag.flowChosen){flowChoice();return}
  if(nxt===21&&!S.flag.daoDone){daoChoice()}
  S.flag.lifeWarn=false;
  if(nxt===41){
    const ok=pre.xinmoFails.every(x=>!x.fail);
    if(!ok){S.heartDemons+=2;log('<p class="danger">心魔噬心，你跌落凡尘，修为大损！</p>');S.cult=Math.floor(S.cult*0.8);S.hp=Math.max(1,Math.floor(S.maxHp*0.3));}
    else{
      recordScore('fastFeisheng',Math.floor(S.days));
      breakClose();
      endEnding('飞升成仙','你踏碎虚空，霞光万丈，自此长生久视，逍遥九界之外。','你以 '+Math.floor(S.years)+' 载岁月登临仙位，历经 '+S.rebirths+' 世轮回，斩敌 '+S.kills+'。');
      return;
    }
  }
  if(nxt===9)recordScore('fastZhuji',Math.floor(S.days));
  if(nxt===13)recordScore('fastJindan',Math.floor(S.days));
  if(S.sect&&S.sect.dark&&S.heartDemons>=2&&S.realm>=17&&!S.flag.darkEndOffer){
    S.flag.darkEndOffer=true;
    logChoices([{txt:'🌑 彻底坠入魔道，成就魔尊之位',cls:'danger',fn:()=>endEnding('堕入魔道','你弃了正道，以众生为薪，终成一代魔尊。','你终以魔证道，踏碎仙门，九界为之战栗。')},
    {txt:'🌟 守住本心，以魔道之法行正道之事',fn:()=>log('<p class="good">你闭目良久，拂去眉间魔意。魔道可入，本心不移。</p>')}]);
  }
  if(!S.sect&&S.realm>=21&&!S.flag.looseEndOffer){
    S.flag.looseEndOffer=true;
    logChoices([{txt:'🍃 归隐山林，做那闲云野鹤的散修大能',fn:()=>endEnding('散修大能','你飘然远去，山外无姓，人间无争。','不依宗门，不假外物，终成一方传奇。')},
    {txt:'🗺️ 继续游历，红尘炼心',fn:()=>log('<p>你笑了笑，收起拂尘，继续踏上未竟的仙途。</p>')}]);
  }
  if(secRank(S)==='宗主'&&!S.flag.sectEndOffer){
    S.flag.sectEndOffer=true;
    logChoices([{txt:'🏯 永镇山门，做那开派中兴之主',fn:()=>endEnding('宗门之主','你振兴宗门，桃李满天下，万载香火不绝。','你以一人之力，将 '+S.sect.name+' 推上九界之巅。')},
    {txt:'🗺️ 传位后辈，独自远游',fn:()=>log('<p>你将宗主印绶传于大弟子，飘然出山。</p>')}]);
  }
  breakClose();
  if(!passTime(5)){renderAll();return}
  checkQuests();renderAll();
}
/* 突破失败结算 */
function applyBreakFail(loss,R,failHd){
  S.cult=Math.max(0,S.cult-loss);
  S.flag.breakPity=(S.flag.breakPity||0)+1;
  /* 渡劫感悟：失败保留部分修为（其余转为对天道的体悟），下次突破判定加成、破境时消耗 */
  const insGain=Math.max(1,Math.floor(loss/80));
  S.insight=Math.min(20,(S.insight||0)+insGain);
  if(failHd)addDemonMark('obsess',60);
  addMood(-10);
  log('<p class="danger">'+pickDemonNarr(pick(['fear','doubt','ignorance']))+'</p>');
  log('<p class="danger">道门震颤，反噬临身！修为倒退 '+loss+'，十年苦功付之东流（心境 -10）——所幸此败并非全无所得，那一瞬的天道余韵已烙入识海，化为渡劫感悟。</p>');
  log('<p class="sys">🛡️ 突破保底 +1（累计 '+S.flag.breakPity+' 次）：下次突破判定 +'+Math.min(4,S.flag.breakPity)+'，破境后清零。</p>');
  log('<p class="sys">💡 渡劫感悟 +'+insGain+'：累计 '+S.insight+'（下次突破判定 +'+Math.min(10,S.insight)+'，破境时消耗）。</p>');
  if(S.temp.break<=0)log('<p class="sys">提示：若备有<b>破境丹</b>，可于突破前服用，心性判定临时 +3。</p>');
  const hasRewind=S.items.some(i=>i.use==='rewind');
  const canPay=S.stones>=2000;
  if(S.flag.tribSave&&(hasRewind||canPay)){
    logChoices([
      ...(hasRewind?[{txt:'🔮 消耗回溯符 · 天机回溯（回到突破前 3 日）',cls:'primary',fn:()=>{S.items=S.items.filter(i=>i.use!=='rewind');tribRestore();log('<p class="good">回溯符化作流光，天地倒转——你回到了突破前 3 日，行囊中那道符已化作飞灰，但道基完好无损。</p>');passTime(0);renderAll()}}]:[]),
      ...(canPay?[{txt:'💎 以 2000 灵石祭天 · 天机回溯',cls:'primary',fn:()=>{S.stones-=2000;tribRestore();log('<p class="good">你倾尽灵石祭天，天地倒转——回到了突破前 3 日，灵石清空，道基无损。</p>');passTime(0);renderAll()}}]:[]),
      {txt:'😔 接受此劫，来日再战',fn:()=>{S.flag.tribSave=null;log('<p>你敛去心绪，将此败记在心头。来日方长，道心不折。</p>');passTime(1);renderAll()}},
    ]);
    return;
  }
  breakClose();
  if(!passTime(5)){renderAll();return}
  checkQuests();renderAll();
}
/* 2D 渡劫节点快照与回溯 */
function tribSnapshot(){
  const s=S;
  return {
    cult:s.cult,hp:s.hp,maxHp:s.maxHp,attrs:Object.assign({},s.attrs),stones:s.stones,
    items:s.items.map(i=>Object.assign({},i)),mats:Object.assign({},s.mats),
    heartDemons:s.heartDemons,demonMarks:(s.demonMarks||[]).map(m=>Object.assign({},m)),
    mood:s.mood,cultStreak:s.cultStreak,days:s.days,injuries:(s.injuries||[]).map(i=>Object.assign({},i)),
    temp:Object.assign({},s.temp),realm:s.realm,weapon:s.weapon?Object.assign({},s.weapon):null,
    armor:s.armor?Object.assign({},s.armor):null,trinket:s.trinket?Object.assign({},s.trinket):null,
  };
}
function tribRestore(){
  const t=S.flag.tribSave;
  if(!t)return;
  const s=S;
  s.cult=t.cult;s.hp=t.hp;s.maxHp=t.maxHp;s.attrs=t.attrs;s.stones=t.stones;
  s.items=t.items;s.mats=t.mats;s.heartDemons=t.heartDemons;s.demonMarks=t.demonMarks;
  s.mood=t.mood;s.cultStreak=t.cultStreak;s.days=Math.max(0,(t.days||0)-3);
  s.injuries=t.injuries;s.temp=t.temp;s.realm=t.realm;
  s.weapon=t.weapon;s.armor=t.armor;s.trinket=t.trinket;
  s.flag.tribSave=null;
  if(s.maxHp!==calcMaxHp(s)){s.maxHp=calcMaxHp(s);if(s.hp>s.maxHp)s.hp=s.maxHp}
}
/* 2.3 里程碑解锁清单：每个大境界解锁的新内容 */
function unlockListAt(r){
  const m={
    2:'试炼塔 · 秘境之门 · 灵溪幽谷',
    9:'心魔历练 · 修炼托管 · 筑基守关试炼 · 读书抄经 · 择道节点（流派选定）',
    13:'功法技能 · 守关功法遗宝（金丹起） · 天劫类型化',
    17:'元婴神识清明：战斗技能更强 · 心魔试炼破绽',
    21:'道统传承（收徒） · 问道抉择 · 洞府托管至目标',
    25:'心魔烙印类型化与专属解除 · 情报线',
    29:'道侣同行加成提升 · 高阶守关遗宝',
    33:'业火劫可控（功德可减劫） · 时代主线深入',
    37:'渡劫飞升之路 · 终极心魔劫',
  };
  return m[r]||'';
}
/* v44 筑基择道：二选一/三选一显式流派抉择（不可逆，可花轮回点重选） */
function flowChoice(){
  S.flag.flowChosen=true;
  scene('择道 · 流派既定');
  const pool=Object.keys(FLOW_DEFS);
  const opts=[];const used={};
  while(opts.length<3){
    const k=pick(pool);
    if(used[k])continue;
    used[k]=true;
    const f=FLOW_DEFS[k];
    opts.push({k,n:f.n,i:f.i,d:f.desc});
  }
  log('<p>筑基功成那夜，你于识海中望见三条大道。道途既定，便是一生的方向——日后可花费轮回点重选，代价不菲。</p>');
  logChoices(opts.map(o=>({
    txt:o.i+' '+o.n+'——'+o.d,cls:'primary',
    fn:()=>{
      S.flag.flowChoice=o.k;
      S.flag.insights=(S.flag.insights||0)+1;
      log('<p class="good">你踏上了<b>'+o.n+'</b>之路。道心既定，万法随行（流派加成生效，悟道 +1）。</p>');
      log('<p class="sys">流派加成：同流派功法修炼效率 +5%；战斗时流派克制/风格加成按「机制·六大流派」生效；日后可花轮回点重选。</p>');
      breakClose();
      if(!passTime(5)){renderAll();return}
      checkQuests();renderAll();
    }
  })));
}
/* 化神问道：悟道选择，决定道途分支（被动加成） */
function daoChoice(){
  S.flag.daoDone=true;
  scene('问道 · 道途抉择');
  log('<p>化神之日，你于识海深处望见五条大道延伸向远方。道途既定，便是一生的方向。</p>');
  logChoices([
    {txt:'🗡️ 剑道——一剑破万法',cls:'primary',fn:()=>{S.flag.dao='sword';S.flag.tAttack=(S.flag.tAttack||0)+1;log('<p class="good">你以剑证道，剑气自生（战斗攻势 +1）。</p>');renderAll()}},
    {txt:'⚗️ 丹道——一粒丹成万古春',fn:()=>{S.flag.dao='dan';log('<p class="good">你以丹入道，丹火通明（炼丹成功率 +15%）。</p>');renderAll()}},
    {txt:'🌀 阵道——以天地为棋局',fn:()=>{S.flag.dao='array';log('<p class="good">你以阵证道，洞悉天机（探索避凶 +10%）。</p>');renderAll()}},
    {txt:'🌑 魔道——我命由我不由天',cls:'danger',fn:()=>{S.flag.dao='dark';log('<p class="danger">你以魔证道，心魔既为薪，亦为刃（魔道功法效率 +10%，正道接纳降低）。</p>');renderAll()}},
    {txt:'🕊️ 逍遥道——白云千载空悠悠',fn:()=>{S.flag.dao='free';S.luck=clamp(S.luck+2,1,100);log('<p class="good">你超然物外，气运自聚（气运 +2）。</p>');renderAll()}},
  ]);
}
