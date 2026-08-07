/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 界面渲染 ================
====================================================== */
'use strict';
/* ================= 界面渲染 ================= */
function log(html,cls){
  const d=document.createElement('div');d.className='log'+(cls?' '+cls:'');
  d.innerHTML=html;$('story').appendChild(d);
  S.logCount++;
  if(S.logCount>240){const old=$('story').querySelector('.log');if(old)old.remove();S.logCount--}
  $('story').scrollTop=999999;
  /* 记录故事尾迹：退出重进后恢复可见文字（8） */
  try{
    if(S&&S.flag){
      S.flag.storyTail=S.flag.storyTail||[];
      const raw=String(html).replace(/\s+/g,' ').slice(0,220);
      if(S.flag.storyTail[S.flag.storyTail.length-1]!==raw)S.flag.storyTail.push(raw);
      if(S.flag.storyTail.length>14)S.flag.storyTail.shift();
    }
  }catch(e){}
}
/* 退出重进：恢复上次故事尾迹并滚动到底部 */
function restoreStory(){
  try{
    const tail=S&&S.flag&&S.flag.storyTail||[];
    const st=$('story');
    if(!st)return;
    st.innerHTML=tail.map(t=>'<div class="log">'+t+'</div>').join('');
    st.scrollTop=st.scrollHeight||999999;
  }catch(e){}
}
function logChoices(btns){
  PENDING++;
  const d=document.createElement('div');d.className='log choices';
  const group=[];
  for(const b of btns){
    const el=document.createElement('button');
    el.className=b.cls||'';
    el.innerHTML=b.txt;
    el.onclick=()=>{
      if(el.disabled)return;
      PENDING=Math.max(0,PENDING-1);
      group.forEach(g=>{g.disabled=true;g.classList&&g.classList.add('used')});
      updatePendingUI();
      b.fn();
    };
    group.push(el);
    d.appendChild(el);
  }
  $('story').appendChild(d);$('story').scrollTop=999999;
  updatePendingUI();
}
function updatePendingUI(){
  const p=PENDING>0;
  try{
    const btns=document.querySelectorAll('#actions button');
    for(const b of btns)b.disabled=p;
  }catch(e){}
  try{
    const tb=document.querySelectorAll('#tabbar button');
    for(const b of tb)b.disabled=p;
  }catch(e){}
  try{
    const pb=document.querySelectorAll('#panelBody button');
    for(const b of pb)b.disabled=p;
  }catch(e){}
  const fi=$('freeInput'),fb=$('btnFree');
  if(fi)fi.disabled=p;
  if(fb)fb.disabled=p;
}
function scene(title){
  const map=[
    [/突破/,'⚡'],[/闭关|修炼|静心/,'🧘'],[/心魔历练/,'😈'],[/探索|外出/,'🗺️'],
    [/遭遇战|妖潮|妖兽|袭村|厉鬼|伏杀/,'⚔️'],[/宗门|拜入|投身|大比/,'🏯'],[/双修/,'💞'],
    [/坊市/,'🏮'],[/灵潮/,'🌊'],[/论道/,'📖'],[/秘境|剑冢|洞府|遗迹|巢穴|残梦/,'🏛️'],
    [/转世/,'🔄'],[/身陨|寿元/,'🪦'],[/岁序/,'📅'],[/朱果/,'🍒'],
  ];
  let ico='📜';
  for(const [re,i] of map)if(re.test(title)){ico=i;break}
  setSceneImg(title);
  log('<span class="scene">'+ico+' 〖 '+esc(title)+' 〗</span>');
}
/* 场景背景：按标题关键词匹配生成好的场景插画 */
const SCENE_IMG=[
  [/无面战魂|无面|问心手势/, 'assets/scenes/faceless.jpg'],
  [/天机棋局|棋局|对弈/, 'assets/scenes/chess.jpg'],
  [/山门夜哨|夜哨|暗桩/, 'assets/scenes/sectnight.jpg'],
  [/封魔印|封印|裂隙异动/, 'assets/scenes/seal.jpg'],
  [/剑冢回响|回响|断剑信物/, 'assets/scenes/swordtomb.jpg'],
  [/战魂|誓约|战旗/, 'assets/scenes/warcry.jpg'],
  [/三生石|三生/, 'assets/scenes/tianwen.jpg'],
  [/人间相送|相送|辞别/, 'assets/scenes/tianmen.jpg'],
  [/天衍|祭坛|天门/,'assets/scenes/tianyan.jpg'],
  [/幽冥之门|裂隙|九幽|封魔/,'assets/scenes/ghostgate.jpg'],
  [/渡劫|天劫|雷劫/,'assets/scenes/tribulation.jpg'],
  [/闭关|修炼|静心|打坐|苦修|入定/,'assets/scenes/cult.jpg'],
  [/心魔/,'assets/scenes/heart.jpg'],
  [/探索|外出|山野|巡山|采药/,'assets/scenes/forest.jpg'],
  [/遭遇战|妖潮|妖兽|袭村|厉鬼|伏杀|切磋|大比|尸傀|妖风/,'assets/scenes/beast.jpg'],
  [/宗门|拜入|投身|拜师|传功|藏经/,'assets/scenes/sect.jpg'],
  [/魔道|血魔|万蛊|幽冥教/,'assets/scenes/darksect.jpg'],
  [/坊市|集市|摊位|茶棚/,'assets/scenes/market.jpg'],
  [/春节|年关/,'assets/scenes/market.jpg'],
  [/破庙|山神/,'assets/scenes/temple.jpg'],
  [/灵溪|幽谷|琴音|溪畔/,'assets/scenes/valley.jpg'],
  [/药园|深林|暮色/,'assets/scenes/forest.jpg'],
  [/七夕|鹊桥/,'assets/scenes/dual.jpg'],
  [/中元|鬼门/,'assets/scenes/death.jpg'],
  [/中秋|月宫/,'assets/scenes/debate.jpg'],
  [/秘境|剑冢|洞府|遗迹|巢穴|残梦|试炼塔/,'assets/scenes/dungeon.jpg'],
  [/双修/,'assets/scenes/dual.jpg'],
  [/身陨|寿元|转世|轮回|幽冥|孟婆/,'assets/scenes/death.jpg'],
  [/论道|听经|讲道/,'assets/scenes/debate.jpg'],
  [/灵潮|灵脉/,'assets/scenes/tide.jpg'],
];
const SCENE_PATHS={title:'assets/scenes/title.jpg',cult:'assets/scenes/cult.jpg',tribulation:'assets/scenes/tribulation.jpg',heart:'assets/scenes/heart.jpg',forest:'assets/scenes/forest.jpg',beast:'assets/scenes/beast.jpg',sect:'assets/scenes/sect.jpg',darksect:'assets/scenes/darksect.jpg',market:'assets/scenes/market.jpg',dungeon:'assets/scenes/dungeon.jpg',dual:'assets/scenes/dual.jpg',death:'assets/scenes/death.jpg',debate:'assets/scenes/debate.jpg',tide:'assets/scenes/tide.jpg'};
function setSceneImg(title){
  const el=$('sceneLayer');
  if(!el)return;
  let key='';
  if(SCENE_PATHS[title])key=SCENE_PATHS[title];
  else for(const [re,k] of SCENE_IMG)if(re.test(title)){key=k;break}
  const apply=()=>{el.style.backgroundImage=key?"url('"+key+"')":''};
  if(!key){apply();return}
  /* v60 手机端两段式切图：先预载大图，避免点击后换图与弹层动画同帧合成闪黄 */
  if(typeof fxMobile==='function'&&fxMobile()&&typeof Image!=='undefined'){
    const img=new Image();
    img.onload=()=>{try{apply()}catch(e){}};
    img.src=key;
  }else{apply()}
}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1600)}
function openPanel(title,html){$('panelTitle').textContent=title;$('panelBody').innerHTML=html;$('panel').style.display='flex';if(typeof T!=='undefined'&&T.reveal)T.reveal($('panel'));updatePendingUI()}
function closePanel(){$('panel').style.display='none'}
/* 通用事件弹窗：叙述 + 选项（用于历练/宗门任务/道侣互动等） */
function openEventModal(title,html,opts){
  const list=(opts||[]).map((o,i)=>'<button class="small" style="margin:4px 4px 0 0" onclick="resolveEventModal('+i+')">'+esc(o.txt)+'</button>').join('');
  window._eventModalOpts=opts||[];
  /* v65：事件弹窗识别标题中的已知人物，先渲染登场立绘条 */
  const cast=storyCastBar(pickCastNames(title));
  /* v67：副业微操弹窗加炉火/灵光演出 */
  openPanel(title,(cast?cast:'')+craftFlourish(title)+html+list);
}
function craftFlourish(title){
  if(!title)return '';
  const m={'炼丹':'🔥','炼器':'🔨','制符':'🪄','布阵':'🧿'};
  for(const k in m)if(title.indexOf(k)>=0)return '<div class="craft-stage"><i class="craft-fire">'+m[k]+'</i></div>';
  return '';
}
function resolveEventModal(i){
  const opts=window._eventModalOpts||[];
  window._eventModalOpts=[];
  const o=opts[i];
  if(!o)return;
  closePanel();
  if(o.fn)o.fn();
}
/* v66 聊天式对话演出：人物头 + 对话气泡 + 选项气泡（选项仍走 resolveEventModal） */
function talkModal(title,head,bubbles,choices){
  const list=(choices||[]).map((o,i)=>'<button class="small talk-btn'+(o.cls?' '+o.cls:'')+'" onclick="resolveEventModal('+i+')">'+esc(o.txt)+'</button>').join('');
  window._eventModalOpts=choices||[];
  const body='<div class="talk-wrap">'+(head||'')+
    (bubbles||[]).map(b=>{
      const who=b.who==='me'?'me':'npc';
      const html=(b.typing&&fxOn()?'':b.html);
      return '<div class="talk-row '+who+'"><div class="talk-bubble'+(b.typing?' talk-typing':'')+'"'+(b.id?' id="'+b.id+'"':'')+'>'+html+'</div></div>';
    }).join('')+
    '<div class="talk-choices">'+list+'</div></div>';
  openPanel(title,body);
  if(fxOn()){(bubbles||[]).forEach(b=>{
    if(b.typing&&b.id&&typeof fxTypewriter==='function'){
      const el=$(''+b.id);
      if(el&&el.innerHTML!==undefined){const t=b.html;el.innerHTML='';setTimeout(()=>fxTypewriter(el,t,16),60)}
    }
  })}
}
function talkHead(n,sub){
  const src=(n&&n.role&&typeof NPC_ART!=='undefined'&&NPC_ART[n.role])||(n&&n.name&&typeof NPC_ART!=='undefined'&&NPC_ART[n.name])||'';
  return '<div class="talk-head">'+(src?'<img class="talk-avatar" src="'+src+'" alt="" loading="lazy">':'<span class="talk-avatar">🧙</span>')+
    '<div class="talk-meta"><b>'+esc(n&&n.name||'')+'</b><small>'+esc(sub||'')+'</small></div></div>';
}
function rollBadge(roll,mod,total,dc){
  const crit=total>=30,fumble=total<=5,hit=dc?total>=dc:false;
  let c=crit?'crit':(fumble?'fumble':'');
  return '<span class="roll '+c+'">🎲 '+roll+(mod>=0?'+'+mod:mod)+' = '+total+(dc?' / '+dc:'')+(crit?' 大成功':fumble?' 大失败':(dc?(hit?' ✓':' ✗'):''))+'</span>';
}
function doRoll(stat,dc,extra){
  const mod=attrVal(S,stat)+(extra||0),r=d20(),t=r+mod;
  ROLL_LOG=[r,mod,t,dc];
  return {r,mod,t,dc,hit:t>=dc,crit:t>=30,fumble:t<=5};
}

function renderAll(){
  const s=S;
  try{const b=!!(s&&s.set&&s.set.bright);document.documentElement.classList.toggle('xt-bright',b)}catch(e){}
  if(S.maxHp!==calcMaxHp(S)){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
  const nxt=s.realm+1;
  const nextReq=nxt<THRESHOLDS.length?THRESHOLDS[nxt]:null;
  const req=nextReq!=null?fmtNum(s.cult)+' / '+fmtNum(nextReq):REALMS[s.realm]+'（寿元无尽）';
  const pct=nextReq!=null?clamp(Math.floor(s.cult/nextReq*100),0,100):100;
  const hpPct=clamp(Math.floor(s.hp/s.maxHp*100),0,100);
  const sec=s.sect?(s.sect.dark?'<span class="tag dark">魔道</span> ':'<span class="tag green">正道</span> ')+esc(s.sect.name)+' · '+esc(secRank(s)):s.realm>=21?'散修大能':'散修';
  const luckShow=s.realm>=17?s.luck+' <span style="font-size:11px;color:#6f7a94">(元婴可窥天机)</span>':'？？';
  $('crumb').textContent=s.name+' · '+REALMS[s.realm]+' · '+seasonLabel()+' · '+(s.sect?(s.sect.dark?'魔道 · ':'正道 · ')+s.sect.name+' · '+secRank(s):'无门无派');
  $('side').innerHTML=
    '<div class="sb-title" onclick="openCharPanel()" style="cursor:pointer" title="查看角色档案">'+esc(s.name)+'（'+(s.gender||'男')+'）· '+esc(s.bg.name)+'</div>'+
    '<div class="sb-card">'+
    '<div class="sb-row"><span>☯️ 境界</span><b>'+REALMS[s.realm]+'</b></div>'+
    '<div class="sb-row"><span>'+seasonLabel()+' 时令</span><b>'+seasonDesc()+'</b></div>'+
    '<div class="sb-row"><span>✨ 修为</span><b>'+req+'</b></div>'+
    '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="sb-row"><span>⏳ 寿元</span><b>'+Math.floor(s.age)+' / '+lifespanStr(s)+'</b></div>'+
    '<div class="sb-row"><span>💎 灵石</span><b>'+s.stones+' 块</b></div>'+
    '<div class="sb-row"><span>❤️ 气血</span><b>'+Math.max(0,Math.floor(s.hp))+' / '+s.maxHp+'</b></div>'+
    '<div class="bar hp"><i style="width:'+hpPct+'%"></i></div>'+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('attr')+' 根骨</div>'+
    '<div class="attr-mini">'+
    charAttrsHtml(s)+
    '</div>'+
    '<div class="sb-row" style="margin-top:6px"><span>🧿 灵根属性</span><b style="color:'+elemInfo(s.rootElem).c+'">'+elemInfo(s.rootElem).i+' '+elemInfo(s.rootElem).n+'</b></div>'+
    '<div class="sb-row"><span>🧿 真元</span><b>'+(s.spirit!==undefined?s.spirit:maxSpirit(s))+' / '+maxSpirit(s)+'</b></div>'+
    (s.injuries&&s.injuries.length?'<div style="margin-top:4px">'+injuryHtml(s)+'</div>':'')+
    charStatusBadges(s)+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('combat')+' 战力构成</div>'+
    '<div class="sb-row"><span>🗡️ 攻势</span><b>'+atkBonus(s)+'</b></div>'+
    '<div class="sb-row"><span>🛡️ 闪避</span><b>+'+(dodgeBonus(s)+armorDef(s))+'</b></div>'+
    '<div class="sb-row"><span>🧠 洞察</span><b>+'+insightBonus(s)+'</b></div>'+
    '<div class="sb-row"><span>🤝 人望</span><b>+'+favorBonus(s)+'</b></div>'+
    '<div class="sb-row" style="margin-top:8px"><span>🔮 气运（天机）</span><b>'+luckShow+'</b></div>'+
    '<div class="sb-row"><span>🧬 灵根品质</span><b>'+rootTier(s.root)[0]+' '+rootTier(s.root)[1]+'</b></div>'+
    '<div class="sb-row"><span>⚖️ 功德</span><b style="color:#a8d5a8">'+s.merit+'</b></div>'+
    '<div class="sb-row"><span>🌑 业力</span><b style="color:#e08a8a">'+s.karma+'</b></div>'+
    '<div class="sb-row"><span>☯️ 善恶值</span><b style="color:'+goodEvilInfo()[1]+'">'+netMerit()+'（'+goodEvilInfo()[0]+'）</b></div>'+
    '<p style="font-size:11.5px;color:#6f7a94;margin-top:4px">功德可弱天劫、增机缘；业力促魔功、招心魔。行善积德，道途自宽。</p>'+
    (s.heartDemons>0?'<div class="sb-row"><span>😈 心魔烙印</span><b style="color:#e08a8a">×'+s.heartDemons+'</b></div>':'')+
    (s.demonMarks&&s.demonMarks.length?demonHtml(s):'')+
    (s.temp.break>0?'<div class="sb-row"><span>💊 破境丹力</span><b style="color:#a8d5a8">+'+s.temp.break+'</b></div>':'')+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('path')+' 道途</div>'+
    '<div class="sb-row"><span>🏠 出身</span><b>'+sec+'</b></div>'+
    (s.fame?'<div class="sb-row"><span>🌟 正道声望</span><b>'+s.fame.zheng+'</b></div>'+
    '<div class="sb-row"><span>🌑 魔道声望</span><b>'+s.fame.mo+'</b></div>'+
    '<div class="sb-row"><span>🕊️ 散修声望</span><b>'+s.fame.san+'</b></div>':'')+
    (s.sect?'<div class="sb-row"><span>🏅 贡献点</span><b>'+s.contrib+'</b></div><div class="sb-row"><span>🪙 贡献值</span><b>'+s.contribVal+'</b></div>':'')+
    '<div class="sb-row"><span>💞 道侣</span><b>'+(s.daoPartner?esc(s.daoPartner.name):'无')+'</b></div>'+
    '<div class="sb-row"><span>🧙 师尊</span><b>'+(s.master?esc(s.master.name):'无')+'</b></div>'+
    '<div class="sb-row"><span>🧠 悟性</span><b>'+(s.wis||0)+'</b></div>'+
    '<div class="sb-row"><span>🗺️ 历练</span><b>'+(s.trail||0)+'</b></div>'+
    '<div class="sb-row"><span>🪷 道基</span><b>'+(s.flag.daoBase||0)+'/'+daoBaseCap(s)+'（'+Math.floor(daoBaseRatio(s)*100)+'%）</b></div>'+
    '<div class="sb-row"><span>⚠️ 灵浊</span><b style="color:'+((s.flag.impurity||0)>=60?'#e08a6a':'#8f9cb8')+'">'+(s.flag.impurity||0)+'/100</b></div>'+
    (s.pet?'<div class="sb-row"><span>🐾 灵兽</span><b>'+esc(s.pet.species+'·'+s.pet.name)+' '+s.pet.level+'级</b></div>':'')+
    (s.prof?'<div class="sb-row"><span>🛠️ 副业</span><b>'+PROF_NAMES[s.prof]+' '+s.profLevel+'阶</b></div>':'')+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('quest')+' 新手任务</div>'+questHtml()+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">📅 每日任务</div>'+dailyHtml()+
    '<button class="small" style="width:100%;margin-top:6px" onclick="panelDaily()">查看全部 · 每周任务</button>'+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('equip')+' 装备</div>'+
    '<div class="sb-row"><span>⚔️ 法器</span><b>'+(s.weapon?esc(s.weapon.name):'—')+'</b></div>'+
    '<div class="sb-row"><span>🛡️ 防具</span><b>'+(s.armor?esc(s.armor.name):'—')+'</b></div>'+
    '<div class="sb-row"><span>💍 佩饰</span><b>'+(s.trinket?esc(s.trinket.name):'—')+'</b></div>'+
    '</div>'+
    '<div class="sb-card">'+
    '<div class="sb-sec">'+ico('glory')+' 功业</div>'+
    '<div class="sb-row"><span>☠️ 击杀</span><b>'+s.kills+'</b></div>'+
    '<div class="sb-row"><span>🕰️ 年岁</span><b>'+Math.floor(s.years)+' 载</b></div>'+
    '<div class="sb-row"><span>☯️ 双修</span><b>'+(s.flag.dualCount||0)+' 次 · '+(s.flag.dualDays||0)+' 日</b></div>'+
    '<div class="sb-row"><span>🔄 轮回</span><b>'+s.rebirths+' 世</b></div>'+
    '</div>';
  checkTitles();
  checkDaily();
  renderActions();
  save();
}
function renderActions(){
  const tabs=[['cult','🧘','修行'],['world','🧭','云游'],['sect','🏯','宗门'],['social','👥','尘缘'],['biz','🏮','百业'],['me','☰','我']];
  const cur=CUR_TAB||'cult';
  $('tabbar').innerHTML=tabs.map(([k,i,t])=>
    '<button class="tab-btn'+(k===cur?' on':'')+'" data-tab="'+k+'" onclick="tabHome(\''+k+'\')">'+
    '<span class="tab-ico">'+i+'</span><span class="tab-lbl">'+t+'</span></button>'
  ).join('');
  for(const b of $('tabbar').querySelectorAll('button'))if(PENDING>0)b.disabled=true;
}
function act(k){
  if(PENDING>0){toast('⚠️ 眼前之事未了，请先做出选择');return}
  closePanel();
  if(k==='cult'||k==='world'||k==='sect'||k==='social'||k==='biz'||k==='me'){tabHome(k);}
  else if(k==='cult2')panelCult();
  else if(k==='explore')panelExplore();
  else if(k==='market')panelMarket();
  else if(k==='bag')panelInventory();
  else if(k==='sect')panelSect();
  else if(k==='social')panelSocial();
  else if(k==='craft')panelCraft();
  else if(k==='break')tryBreak();
  else if(k==='rest')panelRest();
}
