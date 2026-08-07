/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 宗门 ================
====================================================== */
'use strict';
/* ================= 宗门 ================= */
function panelSect(){
  if(!S.sect){
    const secs=SECTS.map((s,i)=>qcardHtml({name:s.name,icon:'🏯',quality:2,showQ:false,tags:'<span class="tag">'+esc(s.tag)+'</span>',
      sub:esc(s.desc),desc:artImg(SECT_ART[s.id],0,0,'sect-thumb'),
      foot:'<button class="small primary" onclick="joinSect('+i+')">拜山</button>'})).join('');
    const darks=DARK_SECTS.map((s,i)=>qcardHtml({name:s.name,icon:'🌑',quality:3,showQ:false,tags:'<span class="tag dark">魔道</span>',
      sub:esc(s.desc),desc:artImg(SECT_ART[s.id],0,0,'sect-thumb'),
      foot:'<button class="small primary" onclick="joinDark('+i+')">投身</button>'})).join('');
    openPanel('🏯 宗门','<p>修仙之人，或拜入名门正派，或投身魔道。你如今无门无派。</p><h4>☀️ 正道宗门</h4>'+secs+'<h4>🌑 魔道势力</h4>'+darks+'<p style="font-size:13px;color:#6f7a94">投身魔道者，心魔滋生更快，且为正道所不容。</p>');
    return;
  }
  const s=S.sect;
  const isProb=S.sectStage==='probation';
  const probDone=Math.min(3,S.flag.probDone||0);
  const stageBanner=isProb?
    '<div class="item-card"><div class="nm">🧹 记名弟子 · 杂役 '+probDone+'/3</div>'+
    '<div class="ds">门规第七条：新入门者先为记名弟子，领三件杂役、过入门考核，方为正式弟子。'+(S.flag.trialCrit?'（考核大成功者，内门候选：晋升内门贡献点要求减半）':'')+'</div>'+
    ((probDone>=3&&!(S.flag.trialCd>0))?'<div style="margin-top:6px"><button class="small primary" onclick="sectTrial()">⚡ 参加入门考核</button></div>':'')+
    (S.flag.trialCd>0?'<p style="color:#6f7a94">考核失利，需 '+S.flag.trialCd+' 日后方可再试。趁此多磨砺'+(s.dark?'道心':'（考核侧重'+(s.id==='sword'||s.id==='ti'?'战力':'悟性')+'）')+'。</p>':'')+
    '</div>':'';
  const rank=secRank(S);
  const rIdx=rankIdx(S);
  const next=nextRankInfo(S);
  const nextTxt=next?('下一阶：'+next.n+'（需境界≥'+STAGE_NAMES[next.minStage]+' 且贡献点 ≥'+next.point+'，当前 境界'+STAGE_NAMES[bigStage(S.realm)]+' / 贡献点 '+S.contrib+'）'):'已是宗主，宗门上下听你号令。';
  if(!S.tasks)S.tasks=genTasks();
  if(!S.sectNpcs||S.sectNpcs.length===0)S.sectNpcs=genSectPeople(s);
  const tasks=S.tasks;
  const thtml=tasks.map((t,i)=>qcardHtml({name:t.name,icon:'📜',quality:2,showQ:false,tags:'<span class="tag">'+t.cost+'日</span>',
    sub:esc(t.desc)+' · 奖励：贡献点 +'+t.point+'，贡献值 +'+t.val+(t.stones>0?'，灵石 +'+t.stones:''),
    desc:'',foot:'<button class="small primary" onclick="doTask('+i+')">接取</button>'})).join('');
  const peopleHtml=(S.sectNpcs||[]).map((p,i)=>{
    const btns='<button class="small" onclick="sectTalk('+i+')">交谈</button> <button class="small" onclick="sectAsk('+i+')">请教</button> <button class="small" onclick="sectGift('+i+')">赠礼</button>'+
      ((p.role==='长老'||p.role==='传功弟子')&&!S.master?' <button class="small primary" onclick="sectMaster('+i+')">拜师</button>':'')+
      (p.role==='掌门'&&rIdx>=2?' <button class="small" onclick="sectMeet('+i+')">拜见</button>':'')+
      (S.master===p?' <span class="tag" style="color:#d8b45a">师尊</span>':'');
    return '<div class="item-card">'+artImg(p.artKey||SECT_PERSON_ART[p.role+(p.gender==='女'?'女':'男')],52,52,'avatar')+
      '<div class="nm">'+esc(p.name||'无名弟子')+' <span class="tag">'+esc(p.title||p.role||'宗门弟子')+'</span></div>'+
      '<div class="ds">'+esc(p.desc)+' · '+stageName(p.stage)+' · 好感 '+p.favor+'</div>'+
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+btns+'</div></div>';
  }).join('');
  const shopHtml=SECT_SHOP.map((m,i)=>itemCardHtml(m,'<span class="tag">'+(m.type==='mat'?'材料':'物品')+'</span><button class="small primary" onclick="sectExchange('+i+')">兑换 · '+m.cost+' 贡献值</button>')).join('');
  openPanel((s.dark?'🌑 ':'🏯 ')+s.name+' · '+rank,
    artImg(SECT_ART[s.id],0,0,'sect-banner')+
    '<p>'+(s.dark?'魔道门规，以力为尊。':'宗门道统，薪火相传。')+'</p>'+
    stageBanner+
    '<h4>门中身份</h4><p>职位：<b>'+rank+'</b>（'+nextTxt+'）</p>'+
    '<p>贡献点：<b>'+S.contrib+'</b>（达标定阶，兑换不扣） · 贡献值：<b>'+S.contribVal+'</b>（仅用于兑换）</p>'+                      
    '<div class="row"><button class="small" onclick="donateSect()">💎 捐资 500 灵石 → 贡献值（灵石出口）</button></div>'+                  
    (next&&!isProb?'<div class="row"><button class="small primary" onclick="promoteSect()">⚡ 冲击下一阶</button></div>':'')+
    '<h4>👥 宗门人物 <button class="small" onclick="sectEvent()">🏮 门中事宜</button></h4>'+peopleHtml+
    '<h4>📜 宗门任务</h4>'+thtml+
    '<h4>🏪 宗门宝库（贡献值兑换）</h4>'+shopHtml+
    '<h4>⛩️ 宗门设施</h4><div class="row">'+
    '<button class="small" onclick="sectLibrary()">📖 藏经阁 · 50值</button>'+
    '<button class="small" onclick="sectBless()">🙏 宗门祈福 · 200灵</button>'+
    '<button class="small" onclick="sectSalary()">💰 领月俸</button></div>'+
    '<h4>宗门大比</h4><p>'+(isProb?'记名弟子无缘大比。':(S.bigCd>0?'大比尚需 '+S.bigCd+' 日方可再启。':'每三年一届，问鼎者可获丰厚赏赐。'))+'</p>'+
    '<div class="row">'+(S.bigCd<=0&&!isProb?'<button onclick="bigCompetition()">参加大比</button>':'')+'<button class="small" onclick="leaveSect()">脱离宗门</button></div>'+
    ownBlockHtml());
}
function ownBlockHtml(){
  if(!S)return '';
  if(S.flag.ownSect)return ownSectHtml();
  if(rankIdx(S)>=4&&!S.flag.ownSect&&totalFame()>=150&&bigStage(S.realm)>=4){
    return '<h4>⛰️ 下山自立（2F）</h4><p>你已是一派长老，声名在外。掌门之位于你已是坦途——但你心中，却另有一幅山门图景。</p><div class="row"><button class="small primary" onclick="foundOwnSect()">⛰️ 下山自立 · 开宗立派</button></div>';
  }
  return '';
}
/* 2F 下山自立：告别原宗门 → 选址开宗 → 建筑经营 + 外交 + 人事 */
function foundOwnSect(){
  closePanel();
  openEventModal('⛰️ 下山自立','<p>你于深夜拜见掌门，言明去意。掌门沉默良久：「你已能独当一面，宗门留不住你。」</p><p class="sys">如何离场，决定你与原宗门的缘分：</p>',[
    {txt:'🙏 以礼相辞（贡献折为资源 · 故宗友好）',cls:'primary',fn:()=>{const gift=Math.floor(S.contribVal*0.3);S.stones+=gift;S.flag.oldSect='friendly';log('<p class="good">你郑重三拜，将长老令印奉还。原宗门赠你 <b>'+gift+'</b> 灵石践行：「山高水长，他日回来，仍是故人。」</p>');foundSite()}},
    {txt:'🌑 拂袖而去（叛门 · 原宗敌对）',cls:'danger',fn:()=>{S.flag.oldSect='hostile';log('<p class="danger">你留下一句「道不同」，破门而出。原宗门当即下了追杀令——自此，你是他们的叛徒。</p>');foundSite()}},
  ]);
}
function foundSite(){
  openEventModal('⛰️ 选址立宗','<p>你走遍名山大川，终得三处候选福地。灵气浓淡，关乎宗门根基。</p>',[
    {txt:'🌄 灵脉福地（灵田丰收 · 修炼加成高）',fn:()=>{S.flag.ownSite='lingmai';initOwnSect();}},
    {txt:'🏔️ 险峰绝壁（易守难攻 · 藏经阁加成）',fn:()=>{S.flag.ownSite='xianfeng';initOwnSect();}},
    {txt:'🌊 水乡泽国（丹药之利 · 丹房加成）',fn:()=>{S.flag.ownSite='shuixiang';initOwnSect();}},
  ]);
}
function initOwnSect(){
  const old=S.sect;
  S.sect={id:'own',name:(window.prompt&&window.prompt('为你的宗门命名（4-8字）：','')||'无名仙门').slice(0,8),dark:false,own:true,old:old?old.name:''};
  S.flag.ownSect=true;
  S.flag.ownBuild={lingtian:0,danfang:0,qi:0,cangjing:0,shou:0,huike:0};
  S.sectNpcs=S.sectNpcs||genSectPeople({id:'own',name:S.sect.name});
  S.contrib=0;S.contribVal=0;S.rank=0;
  if(S.flag.oldSect==='hostile'){addKarma(10);S.flag.exHate={name:old.name+' · 追杀令',role:'故宗',stage:bigStage(S.realm),atk:9+bigStage(S.realm)*2,hp:50+bigStage(S.realm)*20,days:90}}
  scene('开宗立派');
  log('<p class="good">你于'+({lingmai:'灵脉福地',xianfeng:'险峰绝壁',shuixiang:'水乡泽国'})[S.flag.ownSite]+'立下「<b>'+S.sect.name+'</b>」的山门，从此开宗立派，桃李可期。</p>');
  log('<p class="sys">宗门建设需时日经营：灵田、丹房、器坊、藏经阁、灵兽园、会客厅皆可逐步升级。</p>');
  addMerit(5);S.fame=S.fame||{};S.fame.san=(S.fame.san||0)+20;
  passTime(5);renderAll();
}
/* ===== 自建宗门 · 建筑定义与真实加成（宗门深化） ===== */
const OWN_BUILD_DEFS={
  lingtian:{n:'灵田',i:'🌾',d:'灵田收获 +1 份/级',cost:k=>80+k*120,mat:k=>k>=2?{sherb:k}:null},
  danfang:{n:'丹房',i:'⚗️',d:'炼丹判定 +1/级',cost:k=>150+k*150,mat:null},
  qi:{n:'器坊',i:'🔨',d:'炼器判定 +1/级',cost:k=>150+k*150,mat:null},
  fuge:{n:'符阁',i:'🪄',d:'制符判定 +1/级',cost:k=>150+k*150,mat:null},
  zhentai:{n:'阵台',i:'🧿',d:'布阵判定 +1/级',cost:k=>150+k*150,mat:null},
  cangjing:{n:'藏经阁',i:'📖',d:'修炼效率 +2%/级',cost:k=>200+k*200,mat:k=>k>=2?{jade:1}:null},
  wuchang:{n:'演武场',i:'⚔️',d:'战斗伤害 +2%/级',cost:k=>200+k*200,mat:k=>k>=2?{iron:1}:null},
  shou:{n:'灵兽园',i:'🐾',d:'灵兽成长 +20%/级',cost:k=>120+k*120,mat:null},
  huike:{n:'会客厅',i:'🏮',d:'人际好感 +2/级',cost:k=>100+k*100,mat:null},
};
function ownBuildLv(k){return (S&&S.flag&&S.flag.ownBuild)?(S.flag.ownBuild[k]||0):0}
function ownSectActive(){return !!(S&&S.flag&&S.flag.ownSect)}
function ensureOwnBuild(){
  if(S&&S.flag&&S.flag.ownBuild){
    for(const k of Object.keys(OWN_BUILD_DEFS))if(S.flag.ownBuild[k]===undefined)S.flag.ownBuild[k]=0;
  }
}
function ownSectCultMult(){return ownSectActive()?1+ownBuildLv('cangjing')*0.02:1}
function ownSectCraftBonus(prof){
  if(!ownSectActive())return 0;
  const map={alchemy:'danfang',forge:'qi',talisman:'fuge',array:'zhentai'};
  return ownBuildLv(map[prof]||'');
}
function ownSectCombatMult(){return ownSectActive()?1+ownBuildLv('wuchang')*0.02:1}
function ownSectHarvestBonus(){return ownSectActive()?ownBuildLv('lingtian'):0}
function ownSectPetBonus(){return ownSectActive()?1+ownBuildLv('shou')*0.2:1}
function ownSectFavorBonus(){return ownSectActive()?ownBuildLv('huike'):0}
function ownSectHtml(){
  const b=S.flag.ownBuild||{};
  ensureOwnBuild();
  const cards=Object.keys(OWN_BUILD_DEFS).map(k=>{
    const d=OWN_BUILD_DEFS[k];const lv=b[k]||0;
    const cost=d.cost(lv);
    const can=S.stones>=cost&&(!d.mat||Object.keys(d.mat).every(m=>(S.mats[m]||0)>=(d.mat[m]||1)));
    return '<div class="item-card"><div class="nm">'+d.i+' '+d.n+' <span class="tag">Lv.'+lv+'</span></div><div class="ds">'+d.d+' · 升级需 '+cost+' 灵石'+(d.mat?Object.keys(d.mat).map(m=>' + '+MAT_NAMES[m]+'×'+d.mat[m]).join(''):'')+'</div><div style="margin-top:6px"><button class="small" '+(can?'onclick="ownBuildUp(\''+k+'\')"':'style="opacity:.5" disabled')+'>升级</button></div></div>';
  }).join('');
  const moodAvg=S.sectNpcs&&S.sectNpcs.length?Math.floor(S.sectNpcs.reduce((a,p)=>a+(p.mood||60),0)/S.sectNpcs.length):60;
  return '<h4>⛰️ 自建宗门 · '+esc(S.sect.name)+'</h4>'+
    '<p>山门驻地：'+({lingmai:'灵脉福地',xianfeng:'险峰绝壁',shuixiang:'水乡泽国'})[S.flag.ownSite]+' · 弟子心情：'+(moodAvg>=70?'😊 佳':moodAvg>=40?'😐 平':'😔 郁')+'（'+moodAvg+'）</p>'+
    '<div class="row"><button class="small" onclick="ownMoodAct(\'pay\')">💰 发赏（100灵 · 心情+10）</button><button class="small" onclick="ownMoodAct(\'rest\')">🛌 放休（1日 · 心情+5）</button></div>'+
    (S.flag.diplo?'<p class="sys">外交：与 <b>'+S.flag.diplo.ally+'</b> 结盟 · 与 <b>'+S.flag.diplo.enemy+'</b> 敌对</p>':'<div class="row"><button class="small primary" onclick="ownDiplo()">🤝 宗门外交</button></div>')+
    '<h4>🏗️ 宗门建筑</h4>'+cards;
}
function ownBuildUp(k){
  const b=S.flag.ownBuild||{};
  ensureOwnBuild();
  const lv=b[k]||0;
  const d=OWN_BUILD_DEFS[k];
  if(!d)return;
  const cost=d.cost(lv);
  const need=d.mat&&d.mat(lv);
  if(S.stones<cost){toast('灵石不足');return}
  if(need){for(const m in need)if((S.mats[m]||0)<need[m]){toast(MAT_NAMES[m]+'不足');return}}
  S.stones-=cost;b[k]=lv+1;
  if(need)for(const m in need)S.mats[m]-=need[m];
  log('<p class="good">你为「'+S.sect.name+'」扩建了「'+d.i+' '+d.n+'」至 Lv.'+(lv+1)+'（'+d.d.replace(/\/级/,'')+'）。</p>');
  passTime(3);renderAll();
}
function ownDiplo(){
  openEventModal('🤝 宗门外交','<p>你的山门初立，正是立威结缘之时。</p>',[
    {txt:'🤝 与正道大派结盟',fn:()=>{S.flag.diplo={ally:'正道联盟',enemy:'血魔宗'};S.fame=S.fame||{};S.fame.zheng=(S.fame.zheng||0)+15;log('<p class="good">你遣使递交盟书，正道联盟应允守望相助（正道声望 +15）。</p>');passTime(2);renderAll()}},
    {txt:'🌑 与魔道暗通款曲',cls:'danger',fn:()=>{S.flag.diplo={ally:'魔道暗盟',enemy:'剑宗'};S.fame=S.fame||{};S.fame.mo=(S.fame.mo||0)+15;log('<p class="danger">你与魔道结下暗盟（魔道声望 +15，正道将视你为敌）。</p>');passTime(2);renderAll()}},
    {txt:'🕊️ 保持中立，广交散修',fn:()=>{S.flag.diplo={ally:'散修联盟',enemy:'无'};S.fame=S.fame||{};S.fame.san=(S.fame.san||0)+15;log('<p class="good">你不偏不倚，散修纷纷来投（散修声望 +15）。</p>');passTime(2);renderAll()}},
  ]);
}
function ownMoodAct(kind){
  if(kind==='pay'){
    if(S.stones<100){toast('灵石不足');return}
    S.stones-=100;
    for(const p of (S.sectNpcs||[]))p.mood=clamp((p.mood||60)+10,0,100);
    log('<p class="good">你设宴犒赏门人，众人精神为之一振（心情 +10）。</p>');
  }else{
    for(const p of (S.sectNpcs||[]))p.mood=clamp((p.mood||60)+5,0,100);
    log('<p>你宣布休沐一日，门人欢声雷动（心情 +5）。</p>');
  }
  passTime(1);renderAll();
}
/* 记名杂役任务池：低奖励、磨性子 */
function genChores(s){
  const pool=[
    {name:'清扫山门',desc:'新入门的记名弟子，从扫地开始。',cost:2,point:3,val:8,stones:10,kind:'chore'},
    {name:'搬运灵石',desc:'将库房灵石搬到丹房，一筐一筐，磨的是性子。',cost:3,point:4,val:10,stones:15,kind:'chore'},
    {name:'巡山值守',desc:'夜间巡山，熟悉宗门周边地形。',cost:3,point:4,val:12,stones:15,kind:'chore'},
    {name:'晾晒药草',desc:'把药圃的灵草翻晒入仓。',cost:2,point:3,val:8,stones:10,kind:'chore'},
    {name:'擦拭祖师牌位',desc:'祠堂里的牌位，一尘不染方显敬畏。',cost:2,point:3,val:9,stones:10,kind:'chore'},
  ];
  const tasks=[];let guard=0;
  while(tasks.length<3&&guard++<30){const t=pick(pool);if(!tasks.some(x=>x.name===t.name))tasks.push(t)}
  return tasks;
}
function genTasks(){
  const pool=[
    {name:'巡山除妖',desc:'宗门周边妖兽出没，需弟子巡查诛杀。',cost:5,point:12,val:36,stones:40,kind:'fight'},
    {name:'采药入库',desc:'药圃灵草将枯，速往南山采药。',cost:4,point:8,val:24,stones:30,kind:'herb'},
    {name:'跑腿送信',desc:'将宗主手书送往山下家族。',cost:3,point:4,val:12,stones:20,kind:'run'},
    {name:'加固护山大阵',desc:'阵眼灵石将竭，需弟子以智慧灌注。',cost:4,point:10,val:30,stones:30,kind:'array'},
    {name:'炼制宗门丹药',desc:'丹房缺人，需会炼丹之弟子相助。',cost:5,point:15,val:45,stones:50,kind:'craft'},
    {name:'下山济民',desc:'宗门令弟子下山施粥赠药，积攒善名。',cost:4,point:6,val:18,stones:20,kind:'mercy'},
    {name:'抄录典籍',desc:'藏经阁古籍缺损，需弟子静心抄录。',cost:4,point:6,val:22,stones:15,kind:'copy'},
    {name:'护送商队',desc:'山下商队过境妖患之地，需弟子护送周全。',cost:6,point:14,val:42,stones:60,kind:'escort'},
    {name:'营救被困同门',desc:'一名外门弟子失踪于黑风谷，需弟子前往寻回。',cost:5,point:12,val:36,stones:50,kind:'rescue'},
  ];
  const tasks=[];
  while(tasks.length<3){const t=pick(pool);if(!tasks.some(x=>x.name===t.name))tasks.push(t)}
  return tasks;
}
function doTask(i){
  const t=S.tasks[i];
  scene('宗门任务 · '+t.name);
  let ok=false,text='';
  if(t.kind==='chore'){
    S.contrib+=t.point;S.contribVal+=t.val;S.stones+=t.stones;
    S.flag.probDone=(S.flag.probDone||0)+1;
    log('<p class="sys">你老老实实做完杂役「'+t.name+'」。'+(t.name==='清扫山门'?'山门前的落叶扫了又落，你的心却渐渐静了下来。':t.name==='搬运灵石'?'灵石沉重，你走得腰酸背痛，却一步未歇。':t.name==='巡山值守'?'山风呼啸，你握紧佩剑，站完了一夜。':t.name==='晾晒药草'?'药香沾满衣襟，你学到了一手辨药的眼力。':'祖师牌位被你擦得光可鉴人。')+'</p>');
    log('<p class="good">杂役完成：贡献点 +'+t.point+'，贡献值 +'+t.val+'，灵石 +'+t.stones+'（记名进度 '+(S.flag.probDone)+'/3）。</p>');
    dC().c.sectTask++;S.flag.sectTasks=(S.flag.sectTasks||0)+1;
    if(!passTime(t.cost)){renderAll();return}
    if(S.sectStage==='probation'&&(S.flag.probDone||0)>=3&&!(S.flag.trialCd>0)){sectTrial();return}
    renderAll();return;
  }
  if(t.kind==='escort'){
    openEventModal('🚩 护送商队','<p>商队行至妖患之地，林间忽有妖风大作，车马受惊！</p>',[
      {txt:'⚔️ 挺身迎战',fn:()=>{const e=makeEnemy();e.name='拦路妖将';log('<p>一头 <b>'+esc(e.name)+'</b> 自林间扑出，你拔剑迎上！</p>');startCombat(e);log('<p class="good">妖将伏诛，商队众人连声道谢，车队安然过境。</p>');taskReward(t,true)}},
      {txt:'🛡️ 率众绕道（身法判定）',fn:()=>{const R=doRoll('agi',14);log('<p>你引商队避入密林：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">有惊无险，商队按时抵达。</p>');taskReward(t,true)}else{log('<p class="danger">绕道耽搁数日，主事虽有微词，仍道了谢。</p>');taskReward(t,false)}}},
    ]);
    return;
  }
  if(t.kind==='rescue'){
    openEventModal('🆘 营救同门','<p>黑风谷深处传来断断续续的呼救声，谷中瘴气弥漫。</p>',[
      {txt:'⚔️ 循声强闯（身法判定）',fn:()=>{const R=doRoll('agi',15);log('<p>你御风直入谷中：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">你在寒潭边找到昏迷的同门，背着他御风而出。</p>');taskReward(t,true)}else{log('<p class="danger">谷中妖藤缠身，你挣脱时已被瘴气所侵（经脉受损）。</p>');applyInjury('neijing');taskReward(t,false)}}},
      {txt:'📖 投石问路，智取（智慧判定）',fn:()=>{const R=doRoll('int',14);log('<p>你以灵识探路，绕开妖藤：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">你沿灵识标记的活路寻到同门，毫发无损地带他出谷。</p>');taskReward(t,true)}else{log('<p class="danger">谷中灵识被瘴气搅乱，你寻了半日才找到人。</p>');taskReward(t,false)}}},
    ]);
    return;
  }
  if(t.kind==='run'){ok=true;text='你御风而行，将书信送到，一路顺遂。'}
  else if(t.kind==='herb'){const R=doRoll('int',14);ok=R.hit;text=ok?'你凭借药性通识，采足灵草而归。':'你找错了山坡，只采回寥寥几株。'}
  else if(t.kind==='array'){const R=doRoll('int',16);ok=R.hit;text=ok?'你以灵识导引，阵光重焕。':'阵法反震，你头晕目眩。'}
  else if(t.kind==='copy'){const R=doRoll('int',13);ok=R.hit;text=ok?'你落笔如飞，抄录工整，阁老颇为满意。':'你漏抄了半页，被阁老逮个正着。'}
  else if(t.kind==='mercy'){const R=doRoll('cha',14);ok=R.hit;text=ok?'百姓感恩戴德，宗门善名远播。':'你手忙脚乱，粥棚差点被挤塌。';if(ok)S.merit=(S.merit||0)+1}
  else if(t.kind==='fight'){ok=true;text='';
    const e=makeEnemy();log('<p>山中妖气冲天，你与 <b>'+e.name+'</b> 战在一处！</p>');
    startCombat(e);S.tasks=genTasks();renderAll();return;
  }
  else if(t.kind==='craft'){ok=S.prof==='alchemy';text=ok?'你于丹房连炼三日，丹药出炉。':'你不通丹术，只能打下手烧火。'}
  if(ok){S.contrib+=t.point;S.contribVal+=t.val;S.stones+=t.stones;log('<p class="good">'+text+' 贡献点 +'+t.point+'，贡献值 +'+t.val+(t.stones>0?'，灵石 +'+t.stones:'')+'。</p>')}
  else{const p=Math.floor(t.point*0.4),v=Math.floor(t.val*0.4);S.contrib+=p;S.contribVal+=v;log('<p class="sys">'+text+' 勉强交差，贡献点 +'+p+'，贡献值 +'+v+'。</p>')}
  S.tasks.splice(i,1);if(!S.tasks.length)S.tasks=genTasks();
  dC().c.sectTask++;S.flag.sectTasks=(S.flag.sectTasks||0)+1;
  maybeInsight('宗门奔波');
  if(!passTime(t.cost)){renderAll();return}
  renderAll();
}
function taskReward(t,ok){
  if(ok){S.contrib+=t.point;S.contribVal+=t.val;S.stones+=t.stones;log('<p class="good">任务完成：贡献点 +'+t.point+'，贡献值 +'+t.val+(t.stones>0?'，灵石 +'+t.stones:'')+'。</p>')}
  else{const p=Math.floor(t.point*0.4),v=Math.floor(t.val*0.4);S.contrib+=p;S.contribVal+=v;log('<p class="sys">任务勉强交差，贡献点 +'+p+'，贡献值 +'+v+'。</p>')}
  const idx=S.tasks.indexOf(t);if(idx>=0)S.tasks.splice(idx,1);
  if(!S.tasks.length)S.tasks=genTasks();
  dC().c.sectTask++;S.flag.sectTasks=(S.flag.sectTasks||0)+1;
  maybeInsight('宗门奔波');
  if(!passTime(t.cost)){renderAll();return}
  renderAll();
}
/* 宗门宝库：只花贡献值，绝不扣贡献点，兑换再多也不影响地位 */
const SECT_SHOP=[
  {name:'回春丹',type:'consumable',quality:1,cost:40,desc:'服之气血尽复（恢复 60% 气血）。',use:'heal'},
  {name:'聚灵丹',type:'consumable',quality:1,cost:60,desc:'30 日内修炼效率 ×1.5。',use:'pill'},
  {name:'清心丹',type:'consumable',quality:2,cost:200,desc:'涤荡心魔，消除全部心魔烙印。',use:'clear'},
  {name:'破境丹',type:'consumable',quality:2,cost:450,desc:'突破时心性判定 +3（一次有效）。',use:'break'},
  {name:'筑基丹',type:'consumable',quality:2,cost:350,desc:'凝炼丹基，冲击筑基的必备之资。',use:'break'},
  {name:'聚灵玉佩',type:'trinket',quality:2,cost:300,bonus:2,desc:'佩戴者气运微升，修炼时心神安宁。'},
  {name:'宗门功法',type:'art',quality:2,cost:500,desc:'本门镇派功法（首次习得，已会则折灵石）。'},
  {name:'火球符',type:'consumable',quality:1,cost:70,count:1,desc:'战斗中掷出，攻击 +6。',use:'fire'},
  {name:'灵草',type:'mat',key:'sherb',cost:80},
  {name:'妖丹',type:'mat',key:'demonCore',cost:300},
  {name:'寒玉',type:'mat',key:'jade',cost:220},
  {name:'灵石兑取',type:'stones',cost:50,gain:120,desc:'以宗门名义兑取灵石 120。'},
];
function sectExchange(i){
  const m=SECT_SHOP[i];
  if(S.contribVal<m.cost){toast('贡献值不足');return}
  if(m.type==='art'){
    const a=S.sect&&S.sect.art;
    if(!S.arts.some(x=>x.name===a.name)){S.contribVal-=m.cost;S.arts.push(Object.assign({},a));toast('习得 '+a.name)}
    else{S.contribVal-=m.cost;S.stones+=400;toast('功法已习得，折为灵石 400')}
  }
  else if(m.type==='stones'){S.contribVal-=m.cost;S.stones+=m.gain;toast('兑取灵石 '+m.gain)}
  else if(m.type==='mat'){S.contribVal-=m.cost;S.mats[m.key]=(S.mats[m.key]||0)+1;toast('获得 '+m.name)}
  else{S.contribVal-=m.cost;addItem(Object.assign({},m));toast('兑换成功')}
  panelSect();renderAll();
}
function genSectPeople(sec){
  const EXTRA_SECT_PEOPLE=[
    {role:'内门弟子',gender:'男',desc:'门中勤恳踏实的内门弟子，消息灵通。',style:'str',taste:'材',chat:['修行','任务']},
    {role:'内门弟子',gender:'女',desc:'门中灵秀内门弟子，善解人意。',style:'int',taste:'丹',chat:['丹道','见闻']},
    {role:'真传弟子',gender:'男',desc:'掌门亲传，锋芒初露，前途无量。',style:'str',taste:'兵',chat:['剑道','大比']},
    {role:'真传弟子',gender:'女',desc:'掌门亲传，天资卓绝，剑心通明。',style:'cha',taste:'书',chat:['剑道','音律']},
    {role:'藏经阁执事',gender:'男',desc:'守着满阁典籍的执事，博闻强识。',style:'int',taste:'书',chat:['典籍','阵法']},
    {role:'药圃弟子',gender:'女',desc:'整日与灵草打交道的药圃弟子，人缘极好。',style:'int',taste:'丹',chat:['丹道','草木']},
    {role:'巡山执事',gender:'男',desc:'常年巡山除妖的执事，江湖经验老到。',style:'str',taste:'兵',chat:['妖兽','江湖']},
    {role:'杂务弟子',gender:'女',desc:'入门不久的小师妹，天真烂漫。',style:'cha',taste:'灵',chat:['见闻','风月']},
  ];
  const used=usedNameSet();
  const list=(sec.people||[]).map(p=>Object.assign({},p,{
    favor:sec.dark?rand(20,45):rand(30,60),mood:rand(50,80),talks:0,gifts:0,
    artKey:SECT_PERSON_ART[p.role+(p.gender==='女'?'女':'男')]||'',
  }));
  /* 每派额外充实 2-3 名可结交的同门，让宗门更像一个小江湖 */
  const extras=[];
  const need=rand(2,3);
  while(extras.length<need&&EXTRA_SECT_PEOPLE.length){
    const p=pick(EXTRA_SECT_PEOPLE);
    if(extras.some(x=>x.role+ x.gender===p.role+p.gender))continue;
    const stage=clamp(rand(1,3),1,4);
    extras.push(Object.assign({},p,{
      name:uniqueName(p.gender,used),
      title:(sec.dark?'魔道':'正道')+p.role,
      stage:stage,realm:stage,atk:5+stage*2,hp:25+stage*15,
      teacher:false,art:Object.assign({},sec.art),
      favor:sec.dark?rand(15,40):rand(25,55),mood:rand(50,80),talks:0,gifts:0,
      artKey:SECT_PERSON_ART[p.role+(p.gender==='女'?'女':'男')]||SECT_PERSON_ART['传功弟子'+(p.gender==='女'?'女':'男')]||'',
    }));
  }
  return list.concat(extras);
}
/* v43 宗门捐资：灵石出口 → 贡献值（持续回收货币） */
function donateSect(){
  if(!S||!S.sect){toast('先拜入宗门');return}
  const cost=500;
  if(S.stones<cost){toast('灵石不足（需 500）');return}
  S.stones-=cost;
  const gain=25+Math.floor((S.flag.donateCount||0)/2);
  S.contribVal=(S.contribVal||0)+gain;
  S.flag.donateCount=(S.flag.donateCount||0)+1;
  log('<p class="loot">你向宗门捐资 500 灵石，换得贡献值 <b>+'+gain+'</b>（累计捐资 '+S.flag.donateCount+' 次，贡献值可于宝库兑换丹药功法）。</p>');
  panelSect();renderAll();
}
function promoteSect(){
  const next=nextRankInfo(S);
  if(!next){toast('已是宗主，无需晋升');return}
  if(S.sectStage==='probation'){toast('记名弟子不可晋升，先过入门考核');return}
  const st=bigStage(S.realm);
  /* 内门候选：考核大成功者晋升内门贡献点要求减半 */
  const effPoint=(S.flag.trialCrit&&next.point===200)?Math.floor(next.point/2):next.point;
  const miss=[];
  if(S.contrib<effPoint)miss.push('贡献点还需 '+(effPoint-S.contrib));
  if(st<next.minStage)miss.push('境界需达 '+STAGE_NAMES[next.minStage]+'（当前 '+STAGE_NAMES[st]+'）');
  if(miss.length){log('<p class="danger">冲击 '+next.n+' 未成：'+miss.join('，')+'。'+(effPoint<next.point?'（内门候选：贡献点要求减半至 '+effPoint+'）':'')+'境界与贡献点缺一不可。</p>');return}
  S.rank=(S.rank||0)+1;
  const gift=next.point>=5000?{stones:2000,val:300}:next.point>=2000?{stones:800,val:150}:next.point>=800?{stones:300,val:80}:{stones:120,val:40};
  S.stones+=gift.stones;S.contribVal+=gift.val;
  scene('晋升 · '+next.n);
  log('<p class="loot">宗门大殿之上，执事长老宣读晋升文书。你受封为 <b>'+next.n+'</b>！</p>');
  log('<p class="good">晋升礼：灵石 +'+gift.stones+'，贡献值 +'+gift.val+'。贡献点用于定阶，不因晋升扣除；日后兑换只花贡献值，地位稳固如山。</p>');
  if(next.minStage>=2&&chance(0.5)){const g=growAttr('wil',0.12,'位高而志不移');if(g)log(g)}
  passTime(1);renderAll();
}
function sectTalk(i){
  const p=S.sectNpcs[i];
  closePanel();
  const gain=rand(2,5)+favorBonus(S);
  p.favor=clamp(p.favor+gain,0,100);
  p.mood=clamp((p.mood||60)+rand(-4,6),10,100);
  const lines=[
    '你与'+p.name+'于廊下品茶闲话，聊起门中趣闻，相谈甚欢。',
    '你向'+p.name+'请教门规典故，对方见你勤勉，多说了几句。',
    p.mood>=70?'对方今日兴致颇高，与你论道半日，意犹未尽。':'对方今日似有烦忧，寥寥数语便去忙了。'
  ];
  log('<p>'+pick(lines)+'（'+esc(p.name)+' 好感 +'+gain+'）</p>');
  if(chance(0.3)&&p.role==='传功弟子'&&p.stage>bigStage(S.realm)){const g=Math.floor((5+p.stage*4)*(0.7+p.favor/150));S.cult+=g;log('<p class="good">传功弟子随口点拨，你茅塞顿开（修为 +'+g+'）。</p>')}
  maybeInsight('与'+esc(p.name)+'闲谈');
  const gc=growAttr('cha',0.07,'门中往来，气度渐成');if(gc)log(gc);
  passTime(1);renderAll();
}
function sectAsk(i){
  const p=S.sectNpcs[i];
  closePanel();
  if(p.role==='掌门'&&rankIdx(S)<2){log('<p class="sys">掌门闭关不见客。待你成为核心弟子，再来拜见。</p>');passTime(1);renderAll();return}
  if(p.stage<=bigStage(S.realm)){log('<p class="sys">'+esc(p.name)+'摆手道：「你境界已不在我之下，我教不了你什么了。」</p>');passTime(1);renderAll();return}
  const R=doRoll('int',14);
  const base=Math.floor((10+p.stage*8)*(0.7+p.favor/150));
  const g=Math.floor(base*(R.hit?1:0.45));
  S.cult+=g;
  p.favor=clamp(p.favor-(R.hit?1:3),0,100);
  log('<p>你向'+esc(p.title)+' '+esc(p.name)+' 请教修行疑难：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  log(R.hit?'<p class="good">对方三言两语，便点破你修行中一处关隘，你如醍醐灌顶（修为 +'+g+'）。</p>':'<p>对方不厌其烦地讲解，你虽未全懂，也记下了大半（修为 +'+g+'）。</p>');
  if(p===S.master&&chance(0.35)){const gw=growWil(0.22,'师尊言传身教，道心愈发坚定');if(gw)log(gw)}
  else if(chance(0.12)&&p.role==='长老'){const gw=growWil(0.1,'长者言谈之中，自有道心痕迹');if(gw)log(gw)}
  maybeInsight('请教'+esc(p.name));
  passTime(1);renderAll();
}
function sectGift(i){
  const p=S.sectNpcs[i];
  if(S.stones<80){toast('灵石不足');return}
  S.stones-=80;
  const g=rand(5,10);
  p.favor=clamp(p.favor+g,0,100);
  log('<p>你备下 80 灵石为礼，'+(g>=8?'对方眼中一亮，破例多与你说了会话。':'对方道谢收下。')+'（'+esc(p.name)+' 好感 +'+g+'）</p>');
  passTime(1);renderAll();
}
/* ===== 门中事宜：同门事件池（v93 SECT_EVENTS 数据化） ===== */
function _sectFixT(t){
  const p=S.sectNpcs&&S.sectNpcs.length?S.sectNpcs[rand(0,S.sectNpcs.length-1)]:null;
  const name=p?p.name:'同门';
  return String(t==null?'':t).split('{p}').join(name).split('{s}').join(S.sect?S.sect.name:'本门');
}
/* 宗门 fx 解释器：favor/bond/贡献/功德/悟性/roll/combat/数值 */
function runSectFx(fx){
  fx=fx||{};
  const p=S.sectNpcs&&S.sectNpcs.length?S.sectNpcs[rand(0,S.sectNpcs.length-1)]:null;
  if(fx.favor!=null&&p)favorChange(p,fx.favor,'');
  if(fx.bond!=null&&p&&typeof addBond==='function'){const bb=addBond(p,fx.bond);if(bb)log(bb)}
  if(fx.contrib!=null)S.contrib=(S.contrib||0)+fx.contrib;
  if(fx.contribVal!=null)S.contribVal=(S.contribVal||0)+fx.contribVal;
  if(fx.merit!=null)addMerit(fx.merit);
  if(fx.insight!=null)addWis(fx.insight);
  if(fx.fame!=null){S.fame=S.fame||{};S.fame.zheng=(S.fame.zheng||0)+fx.fame}
  if(fx.stones!=null)S.stones=(S.stones||0)+fx.stones;
  if(fx.cult!=null)S.cult=(S.cult||0)+fx.cult;
  if(fx.mood!=null)S.mood=clamp((S.mood||0)+fx.mood,0,100);
  if(fx.hp!=null&&fx.hp<0)S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*(-fx.hp)/100));
  if(fx.flag){if(typeof fx.flag==='string')S.flag[fx.flag]=true;else for(const k in fx.flag)S.flag[k]=fx.flag[k]}
  if(fx.roll){
    const r=doRoll(fx.roll.attr,fx.roll.dc);
    if(fx.roll.prelude)log('<p>'+_sectFixT(fx.roll.prelude)+rollBadge(r.r,r.mod,r.t,r.dc)+'</p>');
    if(r.hit){if(fx.roll.hit)log('<p>'+_sectFixT(fx.roll.hit)+'</p>');runSectFx(fx.roll.hitFx||{})}
    else{if(fx.roll.miss)log('<p>'+_sectFixT(fx.roll.miss)+'</p>');runSectFx(fx.roll.missFx||{})}
  }
  if(fx.combat){
    const c=fx.combat;
    startCombat({name:c.name,atk:c.atk,def:c.def,hp:c.hp,elem:c.elem,style:c.style},res=>{
      if(res.win){if(c.winTxt)log('<p class="good">'+_sectFixT(c.winTxt)+'</p>');runSectFx(c.winFx||{})}
      else if(c.loseTxt)log('<p>'+_sectFixT(c.loseTxt)+'</p>');
    });
  }
}
function sectEvent(){
  if(!S.sect){toast('尚未拜入宗门');return}
  if((S.flag.sectEventCd||0)>0){toast('门中诸事安好，'+(S.flag.sectEventCd)+' 日后再说');return}
  closePanel();
  S.flag.sectEventCd=rand(15,30);
  const ev=pick(SECT_EVENTS||[]);
  if(!ev){toast('宗门无事');return}
  const person=S.sectNpcs&&S.sectNpcs.length?S.sectNpcs[rand(0,S.sectNpcs.length-1)]:null;
  const head=person?talkHead(person,person.title||person.role):'<div class="talk-head"><span class="talk-avatar">🏮</span><div class="talk-meta"><b>'+esc(S.sect.name)+'</b><small>门中事宜</small></div></div>';
  talkModal('🏮 门中事宜',head,[{html:'<span style="color:#a99a72">'+esc(_sectFixT(ev.t))+'</span>'}],
    ev.opts.map(o=>({txt:o.txt,fn:()=>{runSectFx(o.fx||{});S.flag.sectEvents=(S.flag.sectEvents||0)+1;passTime(1);renderAll()}})));
}
function sectMaster(i){
  const p=S.sectNpcs[i];
  if(S.master){toast('已有师尊');return}
  if(S.sectStage==='probation'){log('<p class="sys">长老摇头：「你先过了入门考核，再来论拜师之事。」</p>');return}
  if(p.favor<65){log('<p class="sys">'+esc(p.name)+'捋须道：「你我缘法未到，再相处些时日。」（需好感 ≥65）</p>');return}
  closePanel();
  const R=doRoll('cha',15);
  log('<p>你于长老座前叩首三次，恳请收录门下：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    S.master=Object.assign({},p,{art:Object.assign({},S.sect.art),kind:'sect'});
    if(!S.arts.some(x=>x.name===S.sect.art.name)){S.arts.push(Object.assign({},S.sect.art));log('<p class="loot">师尊传你本门功法 <b>'+S.sect.art.name+'</b>（'+S.sect.art.desc+'）。</p>')}
    else{const gw=growWil(0.35,'师尊言传身教，道心愈发坚定');if(gw)log(gw)}
    p.favor=clamp(p.favor+15,0,100);
    log('<p class="good">自此，你便是'+esc(p.name)+'座下亲传弟子。门中地位，隐隐不同。</p>');
    passTime(3);renderAll();
  }else{
    log('<p class="danger">长老叹道：「你心性未定，待道心圆融再来。」</p>');
    p.favor=clamp(p.favor-5,0,100);
    passTime(1);renderAll();
  }
}
function sectMeet(i){
  const p=S.sectNpcs[i];
  closePanel();
  const R=doRoll('cha',15);
  log('<p>你整肃衣冠，于掌门殿前求见：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    const r=rand(1,100);
    if(r<=40){const g=Math.floor(60+rl()*12);S.cult+=g;log('<p class="loot">掌门亲自为你开示三日，修为大进（修为 +'+g+'）。</p>')}
    else if(r<=70){for(let k=0;k<rand(1,2);k++){const kw=pick(['str','agi','int','cha']);const gg=growAttr(kw,0.4,'掌门以灵药淬体');if(gg)log(gg)}}
    else if(r<=90){S.contrib+=rand(20,50);S.contribVal+=rand(40,80);log('<p class="good">掌门嘉许你门中表现，赐下贡献点与贡献值若干。</p>')}
    else{const it=pick([MARKET_ITEMS.find(m=>m.name==='聚灵丹'),MARKET_ITEMS.find(m=>m.name==='破境丹'),MARKET_ITEMS.find(m=>m.name==='聚灵玉佩')]);addItem(Object.assign({},it));log('<p class="loot">掌门见你根骨不凡，赐下 <b>'+it.name+'</b>。</p>')}
    p.favor=clamp(p.favor+8,0,100);
  }else{
    log('<p class="danger">掌门事务繁忙，只遣执事弟子问了你几句便让你退下。</p>');
    p.favor=clamp(p.favor+1,0,100);
  }
  passTime(2);renderAll();
}
function sectLibrary(){
  if(S.contribVal<50){toast('贡献值不足');return}
  S.contribVal-=50;
  closePanel();
  const R=doRoll('int',15);
  if(R.hit){const g=Math.floor(40+rl()*10);S.cult+=g;log('<p class="loot">你在藏经阁翻到一卷前人手札，字字珠玑（修为 +'+g+'）。</p>')}
  else log('<p>你在藏经阁枯坐一日，所获寥寥。</p>');
  const gi=growAttr('int',0.12,'博览群书，慧光渐生');if(gi)log(gi);
  const gw=growWil(0.08,'静读典籍，心性渐定');if(gw)log(gw);
  passTime(2);renderAll();
}
function sectBless(){
  if((S.flag.blessCd||0)>0){toast('香火有定，'+(S.flag.blessCd)+' 日后可再来祈福');return}
  if(S.stones<200){toast('灵石不足');return}
  S.stones-=200;S.flag.blessCd=7;
  closePanel();
  const r=rand(1,100);
  let out='';
  if(r<=45){const p=rand(3,8);S.contrib+=p;out='宗门气运鼎盛，你沾了三分香火气（贡献点 +'+p+'）。'}
  else if(r<=70){const v=rand(30,60);S.contribVal+=v;out='宗门赏你一份月例（贡献值 +'+v+'）。'}
  else if(r<=90){const g=Math.floor(30+rl()*8);S.cult+=g;out='祈福之时心有灵犀，修为精进（修为 +'+g+'）。'}
  else{const g=rand(1,2);S.lifeBonus=(S.lifeBonus||0)+g;out='宗门福泽延及己身，寿元 +'+g+' 载。'}
  log('<p>你于宗门大殿上香祈福，'+(S.sect.dark?'血煞之气中，魔主虚影微微颔首。':'钟磬声中，祖师画像似有灵光一闪。')+'</p><p class="good">'+out+'</p>');
  passTime(1);renderAll();
}
function sectSalary(){
  closePanel();
  if(!S.sect){toast('尚未拜入宗门');return}
  if(S.sectStage==='probation'){log('<p class="sys">记名弟子须以劳役换俸，暂无月俸可领。待过入门考核，方有月例。</p>');return}
  const idx=rankIdx(S);
  const base=[0,80,150,300,600,1200][idx]||0;
  const val=[0,20,40,80,160,300][idx]||0;
  if(base<=0){log('<p class="sys">外门弟子须以劳役换俸，暂无月俸可领。</p>');return}
  const last=S.flag.salaryLast||0;
  const due=30-(S.days-last);
  if(last>0&&due>0){log('<p class="sys">月俸按月供给——距下次发放还需 <b>'+due+'</b> 日。</p>');renderAll();return}
  S.flag.salaryLast=S.days;
  S.stones+=base;S.contribVal+=val;
  log('<p class="good">你领取月俸：灵石 +'+base+'，贡献值 +'+val+'。门中资源，按月供给。</p>');
  passTime(1);renderAll();
}
function joinSect(i){
  const s=SECTS[i];
  let accept=60+attrVal(S,'cha')*2;
  if(S.bg.traits.some(t=>t.id==='yao'))accept-=30;
  if(S.bg.traits.some(t=>t.id==='dark'))accept-=40;
  if(S.bg.traits.some(t=>t.id==='dark2'))accept-=10;
  if(S.bg.traits.some(t=>t.id==='exile'))accept-=20;
  if(S.bg.traits.some(t=>t.id==='scholar'))accept+=10;
  if(S.sect){log('<p class="sys">你辞别'+esc(S.sect.name)+'，另投他门。</p>');S.contrib=0;S.contribVal=0;S.tasks=null;S.sectNpcs=[];S.master=null;S.sectStage=null;}
  const R=rand(1,100);
  if(R<=accept){
    S.sect=Object.assign({},s);S.contrib=0;S.contribVal=0;S.rank=0;S.sectStage='probation';
    S.flag.probDone=0;S.flag.trialCd=0;S.flag.trialCrit=false;S.flag.trialFail=0;
    S.tasks=genChores(s);S.sectNpcs=genSectPeople(s);
    scene('拜山 · 记名');
    log('<p>你于山门前长揖到地，递上拜帖。'+(s.id==='sword'?'守山弟子上下打量你一番：「剑庐不收心浮之人，先去做几天杂役，让我看看你的手稳不稳。」':'执事弟子验过灵根，为你录入门籍。')+'</p>');
    log('<p class="sys">门规第七条：新入门者，先为<b>记名弟子</b>。领三件杂役、过入门考核，方为正式弟子。传功弟子 '+esc((s.people||[])[0].name||'执事')+' 递来一卷任务玉简。</p>');
    log('<p>宗门人物的好感会影响到你的入门考核——勤走动、多结识，总不会错。</p>');
    passTime(1);renderAll();
  }else{
    log('<p class="danger">'+s.name+' 守山长老看了你一眼，摇头道：「根骨虽佳，来历不明，恕不收录。」（你被拒之门外）</p>');
    log('<p class="sys">提示：可提升魅力/心性后再来，或另投别家。妖族混血与魔道出身者，正道门庭向来苛刻。</p>');
    passTime(1);renderAll();
  }
  closePanel();
}
function joinDark(i){
  const s=DARK_SECTS[i];
  if(S.sect){log('<p class="sys">你辞别'+esc(S.sect.name)+'，另投魔道。</p>');S.contrib=0;S.contribVal=0;S.tasks=null;S.sectNpcs=[];S.master=null;S.sectStage=null;}
  S.sect=Object.assign({},s);S.contrib=0;S.contribVal=0;S.rank=0;S.sectStage='probation';
  S.flag.probDone=0;S.flag.trialCd=0;S.flag.trialCrit=false;S.flag.trialFail=0;
  S.tasks=genChores(s);S.sectNpcs=genSectPeople(s);
  scene('投身 · 记名');
  log('<p>阴风扑面，血煞之气扑面而来。你踏入'+s.name+'的山门，身后正道的光渐渐远了。</p>');
  log('<p class="sys">魔道门规更狠：先做三件「入门事」，过了'+(s.id==='blood'?'血池试炼':s.id==='gu'?'蛊房试炼':'幽冥试炼')+'，方为正式弟子。接引弟子扔来一卷玉简，咧嘴一笑。</p>');
  log('<p class="danger">自此，你与正道为敌。心魔滋长更快，但魔功进境也更为迅猛。</p>');
  passTime(2);renderAll();closePanel();
}
/* 入门考核：三件杂役后触发。不同宗门考核内容不同，引荐人好感加成判定 */
function sectTrial(){
  closePanel();
  if(S.sectStage!=='probation'){toast('已是正式弟子');return}
  if((S.flag.probDone||0)<3){toast('三件杂役尚未做完');return}
  if(S.flag.trialCd>0){toast('考核失利，尚需 '+S.flag.trialCd+' 日');return}
  const s=S.sect;
  scene('入门考核 · '+s.name);
  log('<p>三件杂役已毕，'+(s.people&&s.people[0]?esc(s.people[0].name):'执事弟子')+'引你至考核场：「按门规，入门需过一关。」</p>');
  const referrer=(S.sectNpcs||[]).find(p=>p.role==='传功弟子');
  const ref=referrer?Math.floor(referrer.favor/20):0;
  let key='int',dc=15;
  if(s.dark){
    key='wil';
    log('<p>魔道入门，考的是<b>道心</b>——'+(s.id==='blood'?'血池翻涌，猩红之气扑面，考官冷声道：「站稳了，别跪下。」':s.id==='gu'?'蛊房万虫嘶鸣，一条蛊虫顺着你的衣角爬上肩头。':'青灯照彻幽冥，一道阴风直灌你的识海。')+'</p>');
    if(S.bg.traits.some(t=>t.id==='dark'||t.id==='dark2'))log('<p class="sys">你体内的暗属性亲和微微共鸣，考官多看了你一眼（判定 +1）。</p>');
  }else if(s.id==='sword'||s.id==='ti'){
    key='str';
    log('<p>'+(s.id==='sword'?'演武台上，传功师兄持木剑而立：「剑宗入门，先过我一剑。」':'演武台上，炼体师兄赤膊而立：「体宗入门，先挨我一拳。」')+'</p>');
  }else{
    key='int';
    log('<p>考校堂中悬着一副残破的'+(s.id==='dan'?'丹方':s.id==='fu'?'符纹':'阵图')+'，考官道：'+(s.id==='dan'?'「辨药性、断火候，说说你的见解。」':s.id==='fu'?'「一笔符意，落于纸上。」':'「推演此阵，说出破绽。」')+'</p>');
  }
  const R=doRoll(key,dc);
  const total=R.t+ref+(s.dark&&(S.bg.traits.some(t=>t.id==='dark'||t.id==='dark2'))?1:0);
  log('<p>考核判定：'+rollBadge(R.r,R.mod,total,dc)+(ref?'<span class="roll"> 引荐人关照 +'+ref+'</span>':'')+'</p>');
  if(total>=30){
    passTrial(s,true,true);
  }else if(total>=dc){
    passTrial(s,true,false);
  }else{
    S.flag.trialFail=(S.flag.trialFail||0)+1;S.flag.trialCd=30;
    log('<p class="danger">你铩羽而归。考官摇头：「'+(s.dark?'道心未坚，如何担得起这身煞气？':'根基尚浅，回去再磨一磨。')+'」</p>');
    log('<p class="sys">提示：考核侧重'+(s.dark?'<b>心性</b>（可闭关静修、读书抄经、清心丹提升）':(s.id==='sword'||s.id==='ti'?'<b>力量</b>（可血战淬体、服锻体丹）':'<b>智慧</b>（可炼丹炼器、读书抄经）'))+'；宗门人物的好感也能帮你一把。30 日后可再来。</p>');
    passTime(1);renderAll();
  }
}
function passTrial(s,crit,isCrit){
  S.sectStage='outer';S.rank=0;S.flag.probDone=0;S.flag.trialCd=0;
  if(isCrit)S.flag.trialCrit=true;
  scene('入门 · '+s.name);
  log('<p class="good">'+(isCrit?'全场哗然——你技惊四座，考官抚掌而笑：「好苗子！」':'考核通过！执事弟子为你录名入册。')+'自此，你便是'+s.name+'<b>外门弟子</b>。</p>');
  if(isCrit)log('<p class="loot">考核大成功：你被点为<b>内门候选</b>，日后晋升内门贡献点要求减半。</p>');
  if(!S.arts.some(x=>x.name===s.art.name)){
    S.arts.push(Object.assign({},s.art));
    log('<p class="loot">传功弟子 '+(s.people&&s.people[0]?esc(s.people[0].name):'执事')+' 授你本门功法 <b>'+s.art.name+'</b>（'+s.art.desc+'）。</p>');
  }
  S.tasks=genTasks();
  if(crit&&chance(0.35)){const gw=growWil(0.3,'初入宗门，志气昂扬');if(gw)log(gw)}
  logChoices([
    {txt:'🎓 前往拜师（长老/传功弟子，好感 ≥65）',cls:'primary',fn:()=>panelSect()},
    {txt:'📜 先领门规与月俸，熟悉宗务',fn:()=>{log('<p>你领了门规玉简与弟子令牌，先去熟悉宗门诸务。</p>');renderAll()}},
  ]);
  passTime(1);renderAll();
}
function leaveSect(){
  closePanel();
  const hadSectMaster=S.master&&S.master.kind==='sect';
  log('<p class="sys">你脱离'+esc(S.sect.name)+'，自此孤身闯荡。'+(S.sect.dark?'（正道对你的追杀令又添了一笔）':'')+(hadSectMaster?'师门恩义，从此两清。':'')+'</p>');
  if(hadSectMaster)S.master=null;
  S.sect=null;S.sectStage=null;S.contrib=0;S.contribVal=0;S.tasks=null;S.sectNpcs=[];S.flag.trialCrit=false;renderAll();
}
function bigCompetition(){
  closePanel();
  if(!S.sect){toast('无门无派，何以比试');return}
  if(S.sectStage==='probation'){toast('记名弟子无缘大比');return}
  if(S.bigCd>0){toast('大比尚需 '+S.bigCd+' 日方可再启');renderAll();return}
  scene('宗门大比');
  log('<p>演武场万人空巷。你一路过关斩将……</p>');
  const rounds=3;
  let wins=0;
  for(let i=1;i<=rounds;i++){
    const e={name:S.sect.name+'第'+i+'席弟子',atk:4+rl()*2-2,def:1+rl(),hp:20+rl()*10};
    const R=doRoll('str',15);
    if(R.hit){wins++;log('<p class="good">第 '+i+' 轮：你力克 <b>'+e.name+'</b>（'+rollBadge(R.r,R.mod,R.t,R.dc)+'）</p>')}
    else log('<p>第 '+i+' 轮：对方招式老辣，你险象环生，最终惜败。</p>');
  }
  const g=wins*40,v=wins*25,S2=wins*30;
  S.contrib+=g;S.contribVal+=v;S.stones+=S2;S.bigCd=1095;
  log('<p class="loot">大比落幕：胜 '+wins+' 场，贡献点 +'+g+'，贡献值 +'+v+'，灵石 +'+S2+'。</p>');
  if(wins===3){log('<p class="good">你技压群雄，夺得魁首！掌教当众嘉许：「此子日后必成大器。」</p>');S.attrs.cha=clamp(S.attrs.cha+1,1,30);log('<p class="good">名声远播（魅力+1）。</p>')}
  maybeInsight('大比切磋');
  passTime(3);renderAll();
}
