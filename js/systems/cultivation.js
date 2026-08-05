/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 修炼 ================
====================================================== */
'use strict';
/* ================= 修炼 ================= */
function panelCult(){
  const dim=(S.cultStreak||0)>=60?'<p class="danger">⚠️ 你已连续闭关 '+S.cultStreak+' 日，道基渐惰——此后每闭关 30 日收益再降 10%（最低 40%）。外出探索、访友、办事可重置此状态。</p>':'';
  const sg=signNow();
  openPanel('🧘 闭关修炼','<p>山中无甲子，寒尽不知年。闭关可稳步增长修为，效率受<b>灵根</b>与<b>功法</b>影响'+(S.pillBuff>0?'，聚灵丹之力尚余 '+S.pillBuff+' 日（效率×1.5）':'')+'。</p>'+
    '<p style="font-size:13px;color:#a99a72">闭关将进入<b>修炼窗口</b>：按真实时间缓缓推进，途中或有异动需当场抉择，可随时「提前出关」按进度结算；若有道侣相伴，可在窗口中切换<b>双人同修</b>。</p>'+
    '<h4>☯️ 静修（稳妥）</h4>'+
    '<div class="row">'+
    '<button onclick="doCultivate(7,\'quiet\')">⏳ 7 日</button>'+
    '<button onclick="doCultivate(30,\'quiet\')">⏳ 30 日</button>'+
    '<button onclick="doCultivate(90,\'quiet\')">⏳ 90 日</button>'+
    '<button onclick="doCultivate(365,\'quiet\')">⏳ 一年</button>'+
    '</div>'+
    '<h4>🔥 苦修（凶险 · 效率 +40%）</h4>'+
    '<div class="row">'+
    '<button class="danger" onclick="doCultivate(7,\'bitter\')">🔥 7 日</button>'+
    '<button class="danger" onclick="doCultivate(30,\'bitter\')">🔥 30 日</button>'+
    '<button class="danger" onclick="doCultivate(90,\'bitter\')">🔥 90 日</button>'+
    '<button class="danger" onclick="doCultivate(365,\'bitter\')">🔥 一年</button>'+
    '</div>'+
    (S.realm>=9?'<div class="row"><button class="danger" onclick="heartTraining()">😈 心魔历练 · 15日（凶险）</button></div>':'')+
    '<div class="row"><button onclick="settleMind()">🧘 静心养神 · 30日'+(S.heartDemons>0?'（涤心魔，养道心）':'（养道心）')+'</button></div>'+
    (S.flag.boostNext?'<p style="font-size:13px;color:#a8d5a8">灵潮涌动：下一次闭关修炼效率 ×1.5。</p>':'')+
    (sg?'<p style="font-size:13px;color:#e8c86a">📜 本季天机签：'+signDesc(sg.k)+'</p>':'')+
    dim+
    cultBreakdown()+
    '<p style="font-size:13px;color:#6f7a94">当前效率：静修每 10 日约 '+Math.floor((8+S.root/6)*cultMult(S))+' 修为；苦修约 '+Math.floor((8+S.root/6)*cultMult(S)*1.4)+'。连续闭关越久，收益越低——出去走走，机缘与顿悟往往在天地之间。</p>');
}
/* 3.2 速率分解：让玩家看懂快与慢 */
function cultBreakdown(){
  const parts=[];
  parts.push('灵根品质 ×'+rootQualityMult(S.root).toFixed(2)+(S.root>=70?'（吐纳 +5%）':''));
  if(S.arts[0])parts.push('主修《'+S.arts[0].name+'》 ×'+((S.arts[0].mult+((S.arts[0].level||1)-1)*0.05)*artGradeMult(S.arts[0])).toFixed(2)+(S.arts.length>1?'（辅修 ×0.5）':''));
  if(S.pillBuff>0)parts.push('聚灵丹 ×1.5');
  if(S.flag.matrix)parts.push('聚灵阵 ×1.15');
  if(S.flag.caveLv)parts.push('灵脉 Lv.'+S.flag.caveLv+' ×'+(1+S.flag.caveLv*0.08).toFixed(2));
  if(S.days%12<2)parts.push('子时静修 ×1.1');
  if(S.flag.dao==='dark')parts.push('魔道问道 ×1.1');
  if(S.daoPartner)parts.push('道侣 ×1.2');
  if(S.realm<=2)parts.push('新人 ×1.2');
  const sg=signNow();if(sg&&sg.cult)parts.push('天机签 ×'+sg.cult.toFixed(2));
  return '<p style="font-size:12.5px;color:#a99a72;margin:4px 0">效率分解：'+parts.join(' · ')+'</p>';
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
let _cult=null,_cultTimer=null;
function doCultivate(days,mode,opts){
  closePanel();
  mode=mode||'quiet';
  const realMs=Math.max(4000,Math.min(60000,days*350));
  _cult={days:days,mode:mode,elapsed:0,realMs:realMs,paused:false,done:false,solo:!S.daoPartner,auto:true,tick:0,choices:null,pool:[],fired:0,want:0,trust:false,queued:[]};
  if(opts&&opts.solo!==undefined)_cult.solo=!!opts.solo;
  if(opts&&opts.auto===false)_cult.auto=false;
  if(opts&&opts.trust)_cult.trust=true;
  if(opts&&opts.trustMult!==undefined)_cult.trustMult=opts.trustMult;
  if(opts&&opts.toRealm!==undefined)_cult.toRealm=opts.toRealm;
  const eventsOn=(typeof setInterval==='function')&&!(opts&&opts.noEvents);
  if(eventsOn){
    _cult.pool=_cultEvents().map(e=>({make:e,at:0.22+Math.random()*0.55,used:false}));
    _cult.want=days>=90?2:(days>=30?(Math.random()<0.8?1:0):(Math.random()<0.55?1:0));
  }
  PENDING++;
  $('cultivate').style.display='flex';
  $('cultTitle').textContent=(_cult.trust?'🧘 修炼托管 · ':'🧘 闭关修炼 · ')+(mode==='bitter'?'苦修':'静修');
  $('cultAbort').onclick=cultAbort;
  $('cultMode').onclick=cultToggleMode;
  $('cultLog').innerHTML='<div class="cult-line">你于洞府中盘膝而坐，运转'+esc(S.arts[0].name)+'，缓缓入定……</div>';
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
  chips.push('灵根 '+rootTier(S.root)[0]);
  chips.push('功法 ×'+S.arts.reduce((a,x)=>a*(x.mult+((x.level||1)-1)*0.05),1).toFixed(2));
  if(S.pillBuff>0)chips.push('聚灵丹 ×1.5');
  const sg=signNow();if(sg&&sg.cult)chips.push('📜 '+signDesc(sg.k));
  if(S.flag.matrix)chips.push('聚灵阵 ×1.15');
  if(S.pet&&petAlive()&&(S.pet.talent==='root'||S.pet.talent==='speed'))chips.push('🐾 灵兽 ×1.05');
  if(S.realm<=2)chips.push('✨ 新人 ×1.2');
  if(_cult.mode==='bitter')chips.push('🔥 苦修 ×1.4');
  if(S.daoPartner&&!_cult.solo)chips.push('☯️ 双修 ×1.2');
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
  _cultLogLine('<span class="cult-line">'+pick(CULT_FLAVOR)+'</span>');
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
  _cult.solo=!_cult.solo;
  _cultLogLine(_cult.solo?'<p class="sys">你与道侣相视点头，各自静坐，独修守心。</p>':'<p class="good">道侣与你双掌相抵，灵气交融，同修共进。</p>');
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
      const R=doRoll('wil',16);
      _cultLogLine('灵气入体如潮：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=Math.floor(40+S.root/3);S.cult+=g;_cultLogLine('<p class="good">你以道心为堤，借潮汐之力炼化真元（修为 +'+g+'）。</p>')}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.15));if(_cult.mode==='bitter'&&chance(0.4)){S.heartDemons++;_cultLogLine('<p class="danger">灵气逆行，气血受损，心魔烙下（气血-15%，心魔+1）。</p>')}else _cultLogLine('<p class="danger">灵气逆行，你吐出一口淤血（气血-15%）。</p>')}
    }},
    {txt:'🛡️ 抱元守一，任其来去',fn:()=>{_cultLogLine('你守住灵台，潮汐自身侧流过，毫发无伤。')}}
  ]}));
  evs.push(()=>({txt:'恍惚间，似有白须仙人抚顶而笑：「小子，可识得道为何物？」',opts:[
    {txt:'🙏 静心受教（智慧判定）',cls:'primary',fn:()=>{
      const R=doRoll('int',15);
      _cultLogLine('仙音入耳：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=Math.floor(60+S.root/2);S.cult+=g;_cultLogLine('<p class="good">一语惊醒梦中人，你悟得一线天机（修为 +'+g+'）。</p>');const gw=growWil(0.08,'闻道而悟');if(gw)_cultLogLine(gw)}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));_cultLogLine('<p class="danger">道音太深，你心神震荡，气血微亏（气血-10%）。</p>')}
    }},
    {txt:'🌬️ 不为所动，继续运功',fn:()=>{const g=Math.floor(20+S.root/6);S.cult+=g;_cultLogLine('你心如止水，将幻象化去（修为 +'+g+'）。')}}
  ]}));
  evs.push(()=>({txt:'洞壁裂开一道灵光，一条漏网灵脉正喷吐灵气！',opts:[
    {txt:'⛏️ 分神采掘（身法判定）',cls:'primary',fn:()=>{
      const R=doRoll('agi',15);
      _cultLogLine('灵光飞溅：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const st=rand(40,90);S.mats.iron=(S.mats.iron||0)+1;S.stones+=st;_cultLogLine('<p class="good">你截下一段灵脉精华：铁矿石 ×1，灵石 +'+st+'。</p>')}
      else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.08));_cultLogLine('<p class="danger">灵脉炸裂，你被气流掀了个跟头（气血-8%）。</p>')}
    }},
    {txt:'💧 引灵入体，化为修为',fn:()=>{const g=Math.floor(50+S.root/4);S.cult+=g;_cultLogLine('你引导灵脉灵气直入丹田（修为 +'+g+'）。')}}
  ]}));
  evs.push(()=>({txt:'心魔低语自识海深处响起：「你修这仙，到底为了什么？」',opts:[
    {txt:'🧘 守心不动（心性判定）',cls:'primary',fn:()=>{
      const R=doRoll('wil',16);
      _cultLogLine('魔音贯耳：'+rollBadge(R.r,R.mod,R.t,R.dc));
      if(R.hit){const g=Math.floor(30+S.root/5);S.cult+=g;_cultLogLine('<p class="good">你一声断喝，魔音尽散，道心反而更坚（修为 +'+g+'）。</p>');const gw=growWil(0.1,'直面心魔');if(gw)_cultLogLine(gw)}
      else{if(chance(0.5)){S.heartDemons++;_cultLogLine('<p class="danger">魔音趁隙而入，你添了一道心魔烙印（心魔+1）。</p>')}else _cultLogLine('<p class="danger">你惊出一身冷汗，气息微乱。</p>')}
    }},
    {txt:'📿 诵念清心诀',fn:()=>{if(S.heartDemons>0){S.heartDemons--;_cultLogLine('<p class="good">清心诀流转，一道心魔悄然消散（心魔-1）。</p>')}else{const g=Math.floor(15+S.root/8);S.cult+=g;_cultLogLine('经文入心，灵台愈发明澈（修为 +'+g+'）。')}}}
  ]}));
  evs.push(()=>({txt:'一只灵鹤衔着朱红灵果落在洞前，歪头看你。',opts:[
    {txt:'🪶 接下灵果，含笑致意',cls:'primary',fn:()=>{S.mats.sherb=(S.mats.sherb||0)+1;const g=Math.floor(30+S.root/6);S.cult+=g;_cultLogLine('<p class="good">灵果入手温热，灵气四溢（灵草 ×1，修为 +'+g+'）。</p>');if(chance(0.3)){const gw=growWil(0.08,'与灵鹤对望，心有所感');if(gw)_cultLogLine(gw)}}},
    {txt:'🕊️ 还果与鹤，结一段善缘',fn:()=>{addMerit(1);const g=Math.floor(20+S.root/6);S.cult+=g;_cultLogLine('<p class="good">灵鹤长鸣一声，振翅而去（功德+1，修为 +'+g+'）。</p>')}}
  ]}));
  if(S.daoPartner&&!_cult.solo){
    evs.push(()=>({txt:S.daoPartner.name+'睁开眼，轻轻将一盏热茶推到你面前：「歇一歇，莫要熬坏了身子。」',opts:[
      {txt:'🍵 接过茶盏，相视一笑',cls:'primary',fn:()=>{const p=S.daoPartner;p.favor=clamp(p.favor+2,0,100);p.affinity=clamp((p.affinity||60)+2,0,100);const g=Math.floor(40+S.root/5);S.cult+=g;_cultLogLine('<p class="good">茶香袅袅，情意暗涌（情缘+2，修为 +'+g+'）。</p>')}},
      {txt:'🙏 谢过道侣，继续闭关',fn:()=>{const g=Math.floor(25+S.root/6);S.cult+=g;_cultLogLine('你接过茶一饮而尽，复又入定（修为 +'+g+'）。')}}
    ]}));
    evs.push(()=>({txt:'修炼至深处，'+S.daoPartner.name+'的指尖悄悄勾住你的小指，又飞快松开。',opts:[
      {txt:'💞 顺势握住，继续同修',cls:'primary',fn:()=>{const p=S.daoPartner;p.favor=clamp(p.favor+2,0,100);p.affinity=clamp((p.affinity||60)+3,0,200);_cultLogLine('<p class="good">指尖相扣，灵气相融，这一轮修炼格外顺畅（情缘+2，心动+3）。</p>')}},
      {txt:'🙈 假装不知，耳根却发烫',fn:()=>{const p=S.daoPartner;p.affinity=clamp((p.affinity||60)+1,0,200);_cultLogLine('<p class="sys">你耳根发烫，却把那只手扣得更紧了些（心动+1）。</p>')}}
    ]}));
  }
  return evs;
}
function _cultResult(days,mode,solo){
  const bitter=mode==='bitter';
  let mult=cultMult(S);
  if(solo&&S.daoPartner)mult/=1.2;
  if(_cult&&_cult.trustMult)mult*=_cult.trustMult;
  let boostLog='';
  if(S.flag.boostNext){mult*=1.5;S.flag.boostNext=false;boostLog='<p class="good">灵潮之力尚未消退，此番修炼事半功倍！</p>'}
  if(bitter)mult*=1.4;
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
  return {gain:gain,bitter:bitter,boostLog:boostLog,dimLog:dimLog,extra:extra};
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
    const dch=0.22+(signNow()&&signNow().demon?0.08:0);
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
  const partner=S.daoPartner;
  if(!_cult.solo&&partner){
    partner.favor=clamp(partner.favor+1,0,100);
    partner.affinity=clamp((partner.affinity||60)+1,0,100);
    S.flag.dualCount=(S.flag.dualCount||0)+1;
    pre+='<p class="good">与道侣同修'+days+'日，情缘渐深（情缘+1）。</p>';
  }else if(_cult.solo&&partner){
    pre+=growWil(0.06,'独修守心，道心愈发沉稳');
  }
  S.cultStreak=(S.cultStreak||0)+days;
  dC().c.cultDays+=days;
  S.flag.cultDaysTotal=(S.flag.cultDaysTotal||0)+days;
  /* 2E 托管策略：修为满 90% 提醒突破 */
  if(_cult.trust&&S.flag.autoRules&&S.flag.autoRules.warn){
    const nxt=S.realm+1;
    if(nxt<THRESHOLDS.length&&S.cult>=THRESHOLDS[nxt]*0.9){
      pre+='<p class="sys">🔔 托管策略提醒：修为已至「'+REALMS[nxt]+'」所需的 '+(Math.floor(S.cult/THRESHOLDS[nxt]*100))+'%——是时候准备突破了。</p>';
    }
  }
  const dual=_cult.solo?'独修':'与'+esc(partner?partner.name:'道侣')+'同修';
  scene('闭关'+(frac<1?' · 提前出关':''));
  log('<p>你于洞府中运转'+esc(S.arts[0].name)+'，引天地灵气入体'+(partner&&!_cult.solo?'，与道侣双掌相抵、气息交融':'')+'。'+(r.bitter?'此为苦修之道，气血与灵元俱在燃烧。':'灵台空明，日月静好。')+'</p>'+r.boostLog+r.dimLog+pre+r.extra+targetLog+'<p class="good">修为 +'+r.gain+'。'+(frac<1?'（提前出关，仅计 '+days+' 日收益）':'')+'</p>');
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
        const R=doRoll('wil',18);
        log('<p>灵气入体如潮：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){const g=Math.floor(60+S.root/3);S.cult+=g;log('<p class="good">你以道心为堤，强行疏导，反而借暴走灵气炼化出一缕精纯真元（修为 +'+g+'）。</p>')}
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
        const R=doRoll('int',17);
        log('<p>残魂开口，字字如雷：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
        if(R.hit){const g=Math.floor(100+S.root/2);S.cult+=g;log('<p class="good">一段道音入耳，你醍醐灌顶（修为 +'+g+'）。</p>');if(chance(0.35)&&!S.arts.some(x=>x.mult>=1.15)){const a=Object.assign({},pick(ARTS.filter(x=>x.mult>=1.15)));S.arts.push(a);log('<p class="loot">残魂还赠你一篇功法：《'+a.name+'》。</p>')}}
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
        const R=doRoll('agi',16);
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
        const g=Math.floor(30+S.root/4);S.cult+=g;
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
    if(hadDemon){S.heartDemons=Math.max(0,S.heartDemons-1);log('<p class="good">尘念渐消，一道心魔烙印缓缓褪去（心魔-1）。</p>')}
    if((S.demonMarks||[]).length&&chance(0.6)){
      const m=S.demonMarks[rand(0,S.demonMarks.length-1)];
      removeDemonMark(m.type);
      log('<p class="good">静极生慧，「'+DEMON_TYPES[m.type].n+'」亦随之化去。</p>');
    }
    log('<p class="good">三十日静坐，灵台清明（修为 +'+g+'）。</p>');
    const sw=growWil(0.22,'静极养神，道心愈发沉凝');
    if(sw)log(sw);
  }else{
    log('<p>心绪纷扰，此番静心收效甚微。你只觉道途仍长。</p>');
    if(hadDemon&&chance(0.15)){S.heartDemons++;log('<p class="danger">静极生动，心魔反而更盛一分（心魔+1）。</p>')}
  }
  passTime(30);renderAll();
}
function petGain(n){
  const p=S.pet;if(!p)return;
  if(S.flag.caveRooms&&S.flag.caveRooms.shou)n=Math.floor(n*1.25); /* 11 灵兽园 */
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
  openPanel('🐾 灵兽 · '+esc(p.name),
artImg(p.species==='灵狐'?ART.foxPet:'',130,130,'pet')+
    '<p>种类：<b>'+p.species+'</b> · 天赋：'+PET_TALENT_DESC[p.talent]+'</p>'+
    '<p>等阶：'+p.form+' 阶 · 成长：'+p.exp+' / '+petLevelNeed(p)+' · 助战加成：+'+petCombatBonus()+'</p>'+
    '<p>'+(p.faint>0?'<span class="danger">重伤休养中，还需 '+p.faint+' 日。</span>':'<span class="good">精神抖擞，时刻待命。</span>')+'</p>'+
    '<div class="row">'+
    '<button onclick="feedPet()">🍖 喂食灵石（50）</button>'+
    (p.faint<=0?'<button onclick="petTrain()">⚔️ 放养历练 · 15日</button>':'')+
    '</div>'+
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
