/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 死亡 / 结局 / 轮回 ================
====================================================== */
'use strict';
/* ================= 死亡 / 结局 / 轮回 ================= */
function die(reason){
  S.deaths++;
  recordScore('deaths',S.deaths);
  scene('身陨');
  log('<p class="danger">你死了——'+reason+'。</p>');
  log('<p>仙途断绝，一缕残魂于天地间飘摇。</p>');
  const isLifespan=reason==='寿元耗尽';
  const disc=(S.disciples&&S.disciples.length)?'<button onclick="rebirthAsDisciple()">🧒 转生为弟子（道统传承）</button>':'';
  const childBtn=(S.children&&S.children.length)?'<button onclick="rebirthAsChild()">👶 转生为子嗣（血脉传承）</button>':'';
  endEnding('身陨道消','你于'+Math.floor(S.age)+'岁那年身死道消。'+(isLifespan?'寿元有尽，天数难违。':'一世修行，终成黄土。'),'你修行 '+Math.floor(S.years)+' 载，斩敌 '+S.kills+'，轮回 '+S.rebirths+' 世。',disc+childBtn);
}
function endEnding(title,desc,stats,extraBtns){
  S.endings=S.endings||[];
  S.deaths=S.deaths||0;
  S.rebirths=S.rebirths||0;
  S.endings.push(title);
  settleLoop(title);
  $('endingBox').innerHTML=
    '<h2>'+esc(title)+'</h2>'+
    '<div class="end-sub">'+esc(desc)+'</div>'+
    '<div class="stats">'+esc(stats)+'</div>'+
    '<div class="btns">'+
    '<button class="primary" onclick="rebirth()">🔄 转世重生（留一线灵光）</button>'+
    (extraBtns||'')+
    '<button onclick="resetAll()">🌱 重开一世</button>'+
    (title==='飞升成仙'?'<button onclick="continueImmortal()">☁️ 遨游九界</button>':'')+
    '</div>';
  $('ending').style.display='flex';
  save();
}
/* 2H 轮回结算：境界 × 结局 × 称号 × 天道枷锁 → 全局轮回点与轮回值 */
function settleLoop(ending){
  if(S.flag.loopSettled)return;
  S.flag.loopSettled=true;
  const base=Math.max(1,bigStage(S.realm))*2+(S.endings?S.endings.length:0)*5+(S.titles?S.titles.length:0);
  const hidden=(S.flag.hiddenAch||0)*3;
  const gates=(S.flag.gates||[]).length;
  const mult=[1,1.2,1.5,2.0][Math.min(3,gates)];
  const pts=Math.floor((base+hidden)*mult);
  const lo=loopLoad();
  lo.points=(lo.points||0)+pts;
  lo.value=(lo.value||0)+pts;
  lo.history=lo.history||[];
  lo.history.unshift({name:S.name,realm:REALMS[S.realm],ending:ending,points:pts,at:Date.now()});
  if(lo.history.length>12)lo.history.length=12;
  if(S.arts&&S.arts[0])lo.art=S.arts[0].name;
  loopSave(lo);
  log('<p class="sys">🌀 轮回结算：轮回点 <b>+'+pts+'</b>（累计 '+lo.points+'）· 轮回值 <b>'+lo.value+'</b>。天道枷锁 ×'+mult+'。</p>');
}
function rebirth(){
  const old=S;
  const name=randomName();
  const bg=pick(BACKGROUNDS.filter(b=>b.id!==old.bg.id));
  const ns=newState(name,bg);
  ns.root=clamp(Math.floor(old.root*0.6)+rand(5,20),1,100);
  ns.luck=clamp(Math.floor(old.luck*0.8),1,100);
  ns.attrs.wil=clamp(old.attrs.wil+1,1,30);
  ns.deaths=old.deaths;ns.rebirths=old.rebirths+1;
  ns.kills=0;ns.years=0;ns.days=0;ns.age=16;
  ns.memories=old.memories.concat(old.endings);
  if(ns.memories.length>=6)ns.flag.memCue=2;else if(ns.memories.length>=3)ns.flag.memCue=1;
  ns.flag.memory=old.endings.join('、')||'无';
  ns.flag.speedStart=0;
  S=ns;
  $('ending').style.display='none';
  $('screen-game').style.display='flex';
  scene('转世 · 新的一生');
  log('<p>轮回台上，孟婆汤过喉即忘。唯有一缕灵光不灭——那是前世修来的根骨与道心。</p>');
  log('<p class="sys">你保留了一丝前世灵根（'+ns.root+'）与道心记忆：'+esc(ns.flag.memory)+'。</p>');
  log('<p>这一世，你名唤 <b>'+esc(name)+'</b>，出身'+esc(bg.name)+'。故事，从头开始。</p>');
  renderAll();save();
}
/* 2G 转生为子嗣：血脉传承，继承部分天赋与家名 */
function rebirthAsChild(){
  const best=(S.children||[]).slice().sort((a,b)=>(b.stage*10+(b.favor||0))-(a.stage*10+(a.favor||0)))[0];
  if(!best){toast('并无子嗣');return}
  const old=S;
  const pool=BACKGROUNDS.filter(b=>b.gender===(best.gender||'男'));
  const bg=pick(pool.length?pool:BACKGROUNDS);
  const ns=newState(best.name,bg,best.gender);
  ns.root=clamp(Math.floor((best.root||50)*0.85)+rand(3,12),20,95);
  ns.rootElem=best.rootElem||pickRootElem();
  ns.luck=clamp(Math.floor(old.luck*0.8)+rand(1,15),1,100);
  ns.attrs.wil=clamp(old.attrs.wil+1,1,30);
  ns.deaths=old.deaths;ns.rebirths=old.rebirths+1;
  ns.merit=Math.floor(old.merit*0.4);ns.karma=Math.floor(old.karma*0.4);
  ns.memories=old.memories.concat(old.endings).concat(['血脉传承 · 父母'+old.name+'与'+best.mom]);
  ns.flag.memory='生于仙家，血脉承续';
  ns.flag.inherited='血脉子嗣';
  ns.flag.speedStart=0;
  S=ns;
  $('ending').style.display='none';
  $('screen-game').style.display='flex';
  scene('转生 · 血脉传承');
  log('<p>你于身陨之际，将一缕真灵渡入亲子<b>'+esc(best.name)+'</b>的眉心。</p>');
  log('<p class="sys">血脉传承：灵根 '+ns.root+'（'+elemInfo(ns.rootElem).n+'），保留父母四成功德业力与一段前尘。</p>');
  renderAll();save();
}
/* 道统传承：身陨后转生为弟子，继承功法与部分道基 */
function rebirthAsDisciple(){
  const best=(S.disciples||[]).slice().sort((a,b)=>(b.stage*10+(b.favor||0))-(a.stage*10+(a.favor||0)))[0];
  if(!best){toast('并无弟子传承');return}
  const old=S;
  const pool=BACKGROUNDS.filter(b=>b.gender===(best.gender||'男'));
  const bg=pick(pool);
  const ns=newState(best.name,bg,best.gender);
  ns.root=clamp(Math.floor((best.root||40)*0.7)+rand(5,15),1,100);
  ns.luck=clamp(Math.floor(old.luck*0.7)+rand(1,20),1,100);
  ns.attrs.wil=clamp(old.attrs.wil+1,1,30);
  ns.deaths=old.deaths;ns.rebirths=old.rebirths+1;
  ns.merit=Math.floor(old.merit*0.5);ns.karma=Math.floor(old.karma*0.5);
  if(best.art&&!ns.arts.some(a=>a.name===best.art.name))ns.arts.unshift(Object.assign({},best.art));
  ns.memories=old.memories.concat(old.endings).concat(['道统传承 · '+best.name]);
  ns.flag.memory='道统传承于弟子'+best.name+'：'+(old.endings.join('、')||'一世修行');
  ns.flag.inherited=best.name;
  S=ns;
  $('ending').style.display='none';
  $('screen-game').style.display='flex';
  scene('转生 · 道统传承');
  log('<p>你于身陨之际，将最后一缕真灵投入弟子<b>'+esc(best.name)+'</b>的识海。</p>');
  log('<p>'+(best.gender==='女'?'她':'他')+'自昏睡中醒来，眸中多了一丝不属于年少人的沧桑——那是你的道，你的执念，你的未完之愿。</p>');
  log('<p class="sys">道统不灭：传承《'+(best.art?best.art.name:'无名功法')+'》，灵根 '+ns.root+'，保留前世半数功德与业力，以及一段前尘记忆。</p>');
  log('<p>这一世，你名唤 <b>'+esc(best.name)+'</b>，出身'+esc(bg.name)+'。故事，从传承开始。</p>');
  renderAll();save();
}
function resetAll(){
  for(const k of SLOT_KEYS){localStorage.removeItem(k);localStorage.removeItem(k+'_bak')}
  localStorage.removeItem('xiantu_save_meta');
  localStorage.removeItem('xiantu_save_v1');
  location.reload();
}
function continueImmortal(){
  $('ending').style.display='none';
  log('<p class="good">你一步踏出，星河倒转。自此九界逍遥，游戏仍可继续。</p>');
  renderAll();
}
