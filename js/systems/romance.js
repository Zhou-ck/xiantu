/* ======================================================
  仙途 · 道侣/双修系统深度重构（romance）
  恋爱养成：关系阶段 · 约会 · 聊天 · 赠礼 · 多幕双修
            · 提亲大典 · 纪念日 · 心动记忆
  本文件加载于 social.js 之后，覆盖其同名道侣函数。
====================================================== */
'use strict';

/* ---------- 小工具 ---------- */
function he(p){return p&&p.gender==='女'?'她':'他'}
/* 视角差异化：道侣恒为异性，按主角性别给文本（男修视角 / 女修视角） */
function pov(maleTxt,femaleTxt){return S&&S.gender==='女'?femaleTxt:maleTxt}
function pC(p){p.cd=p.cd||{};return p.cd}
function daoAff(p,f,a,line){
  if(!p)return;
  if(f)p.favor=clamp((p.favor||0)+f,0,100);
  if(a)p.affinity=clamp((p.affinity||0)+a,0,200);
  if(typeof addBond==='function'){const bb=addBond(p,1);if(bb)log(bb);}
  if(line)log('<p>'+line+'</p>');
}
/* 心动记忆：道侣会记住与你共同经历的片段（最多 8 条） */
function addMemory(p,txt){
  if(!p)return;
  p.memories=p.memories||[];
  p.memories.unshift(txt);
  if(p.memories.length>8)p.memories.length=8;
}
/* 关系阶段状态机：好感（情缘）与心动（affinity）共同决定 */
function partnerStage(p){
  if(!p)return {lv:0,name:'初见',desc:'尚未结缘'};
  if(p.married)return {lv:5,name:'结缡同心',desc:'以天地为证，道心为聘，此后仙途共渡'};
  const f=p.favor||0,a=p.affinity||0;
  const m=Math.min(f,a);
  if(m>=88)return {lv:4,name:'生死相依',desc:'一颦一笑皆入心，愿替君挡下天劫'};
  if(m>=70)return {lv:3,name:'两心相知',desc:'无需多言，一个眼神便已说尽'};
  if(m>=50)return {lv:2,name:'情愫暗生',desc:'离别时若有所失，相见时心跳难抑'};
  if(m>=30)return {lv:1,name:'初见情愫',desc:'初识风月，尚带三分羞怯'};
  return {lv:0,name:'陌路生疏',desc:'缘分尚浅，需以时日相待'};
}
/* 双修增益：五行相性 + 情缘/心动 + 结缡与信物加成 */
function dualCultMult(p){
  if(!p)return 1;
  let m=dualElemMult(p);
  m+=(p.favor||0)/200;
  m+=(p.affinity||0)/300;
  if(p.married)m+=0.25;
  if(S&&S.flag&&S.flag.pFoxfire)m+=0.1;
  if(S&&S.flag&&S.flag.tongxin)m+=0.05;
  return m;
}
/* 纪念日是否临近（初遇日周年 ±3 日） */
function daoAnnivNear(p){
  if(!p||p.anniv===undefined)return false;
  const diff=S.days-p.anniv;
  if(diff<0)return false;
  const r=diff%365;
  return r<=3||(365-r)<=3;
}

/* ================= 道侣面板 ================= */
function partnerPanel(){
  const p=S.daoPartner;
  if(!p)return '<p style="color:#6f7a94">尚无道侣。修仙路远，得一知己相伴，或可走得从容些。</p>';
  const st=partnerStage(p);
  const mems=(p.memories||[]).slice(0,3).map(m=>'<span class="tag">💭 '+esc(m)+'</span>').join(' ');
  const anniv=(p.anniv!==undefined&&daoAnnivNear(p))?'<span class="tag" style="color:#e8c86a">🎂 纪念日将近</span>':'';
  const nick=p.nickname?'<span class="tag" style="color:#c8a8d8">💌 '+esc(p.nickname)+'</span>':'';
  const married=p.married?'<span class="tag" style="color:#e8c86a">👰 结缡道侣</span>':'';
  const firstDate=p.firstDate?'<br>初游：'+esc(p.firstDate.spot)+'（第 '+Math.floor(p.firstDate.at/365)+' 年）':'';
  const btns=[
    '<button class="small" onclick="daoChat()">💬 聊天</button>',
    '<button class="small" onclick="daoDate()">🏞️ 约会</button>',
    '<button class="small" onclick="daoTravel()">🗺️ 同游</button>',
    '<button class="small" onclick="daoDaily()">🌟 相处</button>',
    '<button class="small" onclick="daoGift()">🎁 赠礼</button>',
    '<button class="small primary" onclick="doDualCultivate()">☯️ 双修</button>',
    '<button class="small" onclick="openNpcCard(S.daoPartner,\'道侣\')">📇 档案</button>',
    '<button class="small" onclick="daoPropose()">'+(p.married?'👰 大典':pov('💍 提亲','💍 求娶'))+'</button>',
    (p.married&&!(S.flag.childPreg&&S.flag.childPreg.left>0)?'<button class="small" onclick="askChild()">👶 共商子嗣</button>':'')+
    ((S.flag.childPreg&&S.flag.childPreg.left>0)?'<button class="small primary" onclick="childCheck()">🤰 胎息检查（'+(Math.ceil((S.flag.childPreg.left||90)/30))+' 月）</button>':''),
    '<button class="small" onclick="panelFamily()">👨‍👩‍👧 家族</button>',
    '<button class="small" onclick="daoPart()">✂️ 缘尽</button>',
  ].filter(Boolean).join(' ');
  return '<div class="item-card">'+artImg(NPC_ART[p.role]||(p.gender==='男'?ART.daoist:ART.lady),56,56,'avatar')+
    '<div class="nm"><b>'+esc(p.name)+'</b> <span class="tag">'+esc(p.role)+'</span>'+(p.gender==='女'?'<span class="tag">♀ 女</span>':'<span class="tag">♂ 男</span>')+married+nick+'</div>'+
    '<div class="ds">'+esc(p.desc||'')+'<br>关系：<b>'+st.name+'</b>（'+st.desc+'）<br>情缘：<b>'+affectionLabel(p.favor)+'</b>（'+(p.favor||0)+'/100） · 心动 '+(p.affinity||0)+' · 境界 '+stageName(p.stage||0)+firstDate+'<br>道侣加成：修炼效率 ×1.2 · 双修增益 ×'+dualCultMult(p).toFixed(2)+(p.married?'（结缡加成已计入）':'')+'</div>'+
    '<div class="ds" style="margin-top:4px">'+mems+anniv+'</div>'+
    '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+btns+'</div></div>';
}
function panelPartner(){
  const p=S.daoPartner;
  if(!p){toast('尚无道侣');return}
  openPanel('💞 道侣 · '+esc(p.name),partnerPanel());
}
/* 道侣日常相处：更丰富的琐碎生活感（新互动，13） */
function daoDaily(){
  const p=S.daoPartner;
  if(!p){toast('无道侣');return}
  closePanel();
  if(maybeShura())return;
  pC(p);
  if((p.cd.daily||0)>0){log('<p class="sys">'+p.name+'靠在你肩头，懒懒道：「今日这般闲适，已经很好啦。」</p>');passTime(1);renderAll();return}
  const g=he(p);
  const scenes=[
    {t:'山中新雨，'+p.name+'在廊下煮茶，见你来，'+g+'把茶盏往你面前推了推。',opts:[
      {txt:'🍵 接过茶盏，并肩听雨',fn:()=>{daoAff(p,2,2,'');addMemory(p,'雨后共饮');log('<p>雨声如织，茶香袅袅。你们谁也没说话，雨却好像替你们把话都说完了。</p>')}},
      {txt:'🌧️ 撑伞踏雨，去山涧看水',fn:()=>{const gg=Math.floor(15+bigStage(S.realm)*8);S.cult+=gg;daoAff(p,2,2,'');log('<p>你们共撑一把伞走进雨里，山涧涨水，白练如瀑。你借机讲了一回「水德」，'+p.name+'听得入神（修为 +'+gg+'）。</p>')}},
      {txt:'😴 蜷在榻上，赖一上午',fn:()=>{daoAff(p,3,3,'');addMemory(p,'雨日赖床');log('<p>你们难得赖了一上午。'+p.name+'睡醒时头发乱蓬蓬的，'+g+'也不恼，只笑着看你：「今日的道，就是偷懒么？」</p>')}},
    ]},
    {t:'洞府灵田里，'+p.name+'正蹲着给灵草松土，指尖沾着泥。',opts:[
      {txt:'🌱 卷起袖子一起忙',fn:()=>{daoAff(p,2,1,'');if(chance(0.5)){S.mats.sherb=(S.mats.sherb||0)+1;log('<p>你们忙活半日，竟从土里翻出一株野生的灵参（灵草 ×1）。</p>')}else log('<p>两个人一起忙，活儿竟比一个人还慢——因为总有人停下来笑。</p>')}},
      {txt:'💧 以灵力替'+g+'净手',fn:()=>{const R=doRoll('cha',13);log('<p>你牵过'+p.name+'的手，以水灵之气细细冲洗：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');daoAff(p,R.hit?3:1,R.hit?3:0,'')}},
    ]},
    {t:'入夜，'+p.name+'在灯下缝补一件旧袍，针脚细密。',opts:[
      {txt:'🧵 接过针线替'+g+'缝',fn:()=>{const R=doRoll('agi',13);daoAff(p,R.hit?3:-1,R.hit?2:0,'');log('<p>你接过针线：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>'+(R.hit?'<p>你针脚虽笨，却缝得认真。'+p.name+'看了半晌，轻声道：「……以后我的袍子，都给你补。」</p>':'<p>你一针下去扎了手，'+p.name+'又心疼又好笑，把针抢了回去。</p>'))}},
      {txt:'🕯️ 在一旁添灯油，静静陪着',fn:()=>{daoAff(p,2,3,'');addMemory(p,'灯下伴读');log('<p>你添了灯油，坐在'+g+'身边翻书。烛火摇摇晃晃，把两道影子叠在了一起。</p>')}},
    ]},
    {t:'山门外飘来一阵烤红薯的香气，'+p.name+'眼睛一亮。',opts:[
      {txt:'🍠 买两个烤红薯，一人一个',fn:()=>{S.stones=Math.max(0,(S.stones||0)-10);daoAff(p,2,2,'');log('<p>热乎乎的烤红薯捧在手里，'+p.name+'咬了一口，眉眼弯弯：「比灵石还甜。」</p>')}},
      {txt:'🔥 亲自生火烤一个',fn:()=>{const R=doRoll('int',12);daoAff(p,R.hit?3:1,R.hit?2:0,'');log('<p>你忙活半晌：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>'+(R.hit?'<p>红薯烤得恰到好处，'+p.name+'连皮都舍不得剥：「你烤的，格外香。」</p>':'<p>红薯被你烤成了炭，'+p.name+'笑得直不起腰，还是把「炭」掰开吃了。</p>'))}},
    ]},
    {t:'清晨练剑，'+p.name+'在旁看了一会儿，忽然开口：「我教你怎么出剑。」',opts:[
      {txt:'🗡️ 虚心受教（身法判定）',fn:()=>{const R=doRoll('agi',14);log('<p>你按'+p.name+'的指点重新出剑：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const gg=Math.floor(25+bigStage(S.realm)*10);S.cult+=gg;daoAff(p,2,2,'');log('<p class="good">剑光一凛，竟比先前快了几分（修为 +'+gg+'）。</p>')}else{daoAff(p,1,1,'');log('<p>你手忙脚乱，'+p.name+'笑得捂嘴：「没事，多练练就好。」</p>')}}},
      {txt:'😏 反手以「懒人剑」逗'+g+'',fn:()=>{daoAff(p,-1,1,'');addMemory(p,'懒人剑法');log('<p>你故意把剑舞得歪歪扭扭，'+p.name+'追着你满院子跑，最后两人都笑倒在草地上。</p>')}},
    ]},
    {t:'夕阳西下，'+p.name+'坐在崖边看云，晚风把'+g+'的发梢吹起来。',opts:[
      {txt:'🌄 并肩坐下，一起看云',fn:()=>{daoAff(p,2,3,'');addMemory(p,'崖畔看云');log('<p>你们一直坐到星子浮上来。'+p.name+'忽然说：「要是仙途有尽头，我想尽头就是这样的黄昏。」</p>')}},
      {txt:'🌙 提议今夜去山顶看月',fn:()=>{daoAff(p,3,3,'');log('<p>月上中天时你们才下山。山路窄，'+p.name+'的手不知何时被你牵住，谁也没松开。</p>')}},
    ]},
    {pov:true,mt:'她今日练剑险些失手，你一把扶住她的腰，她仰头看你，耳根通红：「……谢了。」',ft:'他今日练剑险些失手，你伸手去扶，却被他反手稳稳护住，你撞进他怀里，他低头看你：「小心些。」',opts:[
      {txt:'💞 顺口道一句「有我在」',fn:()=>{daoAff(p,3,2,'');addMemory(p,'练剑时的惊魂一瞬');log(pov('<p>她低下头，声音闷闷的：「嗯……有你在，总不会有事。」</p>','<p>他低低应了一声，却把你的手牵得更紧了些：「嗯，有你在，我总不会有事。」</p>'))}},
      {txt:'🍵 收了剑，一起去煮壶茶',fn:()=>{daoAff(p,2,2,'');log('<p>你们收了剑，并肩坐下煮茶。晚风拂过，谁也没再提刚才那一瞬的心跳。</p>')}},
    ]},
  ];
  const ev=pick(scenes);
  if(ev.pov)ev.t=pov(ev.mt,ev.ft);
  pC(p).daily=rand(10,15);
  openEventModal('🌟 相处 · 日常','<p>'+artImg(NPC_ART[p.role]||ART.lady,56,56,'avatar')+ev.t+'</p>',ev.opts.map(o=>({txt:o.txt,fn:()=>{o.fn();passTime(1);renderAll()}})));
}
/* 独立家族系统页：子嗣培养、血脉与转生（12） */
function panelFamily(){
  const cs=S.children||[];
  openPanel('👨‍👩‍👧 家族',
    '<p>血脉相承，香火不绝。子嗣的培养、传承与转世皆在此处，不必再去仙途录里翻找。</p>'+
    '<h4>👶 子嗣（'+(cs.length||0)+'）</h4>'+(childrenHtml())+
    '<h4>🌳 血脉</h4>'+
    '<p>'+(cs.length
      ?'已有 <b>'+cs.length+'</b> 位子嗣，家名：<b>'+esc(S.name)+'</b>。可常以「传功」「历练」养育，养至三阶（少年）可承接家业；身陨之时可「转生为子嗣」，血脉与家名得以延续。'
      :'尚无子嗣。与结缡道侣在道侣面板「共商子嗣」，可诞下血脉。')+'</p>'+
    '<p style="font-size:12px;color:#6f7a94">子嗣继承父母的灵根与性格，先天胎息越足，成长越快。</p>');
}

/* ================= 聊天：多轮对话 + 情话判定 + 小剧场 ================= */
const CHAT_MOMENTS=[
  '山雨欲来，她侧身替你挡了半扇风雨，鬓发被风撩起，扫过你的下颌。你伸手替她拢到耳后，两人都怔了怔。',
  '你研墨写信，她凑过来看，忽然轻轻吹了吹你的耳尖：「认真写字的人，最好看。」你手一抖，墨在纸上晕开一朵花。',
  '夜半惊醒，发现她不知何时靠在你肩头睡着了，呼吸绵长，睫毛在烛光里投下细细的影子。你僵着身子，一动不敢动。',
  '她从集市回来，悄悄在你案头放了一包松子糖，纸条上歪歪扭扭写着：「甜。」',
  '你练剑归来，她正坐在门槛上等你，手里把一朵野花转来转去，见你回来，别别扭扭地递过来：「……路上捡的。」',
  '她偷偷学了半日，用灵力给你凝了一朵冰花。刚递到你手里，花就化了，她急得直跺脚，你笑着把她连人带手一起拢住。',
];
function pickMoment(p){
  const g=he(p);
  return pick(CHAT_MOMENTS).replace(/她/g,g);
}
function daoChat(){
  const p=S.daoPartner;
  if(!p){toast('无道侣');return}
  closePanel();
  if(maybeShura())return;
  if(chance(0.12)&&partnerChain())return;
  pC(p);
  if((p.cd.talk||0)>0){log('<p class="sys">'+p.name+'靠在你肩头，懒懒道：「今日的话都说尽啦，改日再聊。」</p>');passTime(1);renderAll();return}
  if(chance(0.25)){partnerEvent();return}
  const opts=[
    {txt:'🌙 说几句情话（魅力判定）',fn:()=>daoChatResolve('love')},
    {txt:'📖 讲一个从前的故事',fn:()=>daoChatResolve('story')},
    {txt:'🍵 品一盏灵茶，说说修行',fn:()=>daoChatResolve('tea')},
    {txt:'💭 问一问'+he(p)+'的心事',fn:()=>daoChatResolve('heart')},
    {txt:'🏮 提起初遇那日',fn:()=>daoChatResolve('first')},
  ];
  if(daoAnnivNear(p))opts.unshift({txt:'🎂 提起你们的纪念日',fn:()=>daoAnniv()});
  talkModal('💬 与 '+esc(p.name)+' 闲谈',
    talkHead(p,p.role+(p.gender==='女'?' · ♀':' · ♂')),
    [
      {html:'<span style="color:#a99a72">茶烟袅袅，'+esc(p.name)+'正望着窗外出神。</span>'},
      {html:esc('见你坐下，'+he(p)+'弯了弯眼睛：「今天怎么想起我来了？」'),typing:true,id:'talkLine0'},
    ],
    opts);
}
function daoChatResolve(kind){
  const p=S.daoPartner;
  if(!p)return;
  pC(p).talk=rand(8,14);
  const g=he(p);
  let f=0,a=0;
  if(kind==='love'){
    const R=doRoll('cha',14);
    log('<p>你望着'+p.name+'的眼睛，忽然道：「'+pick([
      '遇见你之后，我连天劫都想慢些来。',
      '旁人都说修仙要斩情丝，我却觉得，你比金丹更让我舍不得。',
      '你信不信，那年流星，是我向天道许来的。',
      '若仙途尽头是孤身一人，那我宁愿这一路，慢一点。',
    ])+'」</p>');
    log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){
      f=3;a=2;
      log('<p class="good">'+g+'怔了怔，耳根慢慢红透。好半晌，'+g+'才低下头，声音轻得像风：「……尽说这些惹人脸红的话。」</p>');
      if(R.crit){addMemory(p,'说过一句最动听的情话');f++}
    }else if(R.fumble){
      f=-1;a=-1;
      log('<p class="danger">话一出口你自己先臊了，'+g+'被你逗得又羞又好笑，抬手作势要打你。</p>');
    }else{
      f=1;a=1;
      log('<p>'+g+'抿唇笑了：「油嘴滑舌。」可眼底分明亮晶晶的。</p>');
    }
  }else if(kind==='story'){
    log('<p>你讲起'+pick([
      '儿时在山脚溪边捉鱼，被老爹追了半个村子',
      '初入仙门时连火球都点不着，被师兄笑了半年',
      '头一回下山历练就遇见妖兽，拔腿就跑，结果摔进泥坑',
    ])+'。</p>');
    log('<p>'+g+'听得入神，末了轻轻道：「原来你也有这样狼狈的时候。」你看着'+g+'眼里的笑意，忽然觉得那段旧事也没那么难堪了。</p>');
    f=2;a=2;
    if(!p.storyTold){p.storyTold=true;addMemory(p,'讲了一桩从前的旧事');f++}
  }else if(kind==='tea'){
    const R=doRoll('int',13);
    const gn=Math.floor(15+S.root/6);
    S.cult+=gn;
    log('<p>你们就着灵茶论起一段道法：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    log('<p>茶烟袅袅，'+(R.hit?g+'眼中亮晶晶的，与你辩到兴处，忽然停住，抿唇一笑：「光顾着论道，都忘了茶要凉了。」':'你们各执一词，谁也说服不了谁，最后相视一笑，把茶干了。')+'（修为 +'+gn+'）</p>');
    f=R.hit?2:1;a=R.hit?2:1;
  }else if(kind==='heart'){
    const R=doRoll('cha',13);
    log('<p>你静静望着'+g+'，低声道：「若是不想说，就不说。我在。」</p>');
    log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){
      f=3;a=3;
      log('<p class="good">'+g+'眼眶一热，终于低声说起那桩心事……末了，'+g+'哑声道：「谢谢你，肯听。」</p>');
      if(R.crit)addMemory(p,'听过'+g+'一桩不与人言的心事');
    }else{
      f=-1;a=-1;
      log('<p class="danger">'+g+'欲言又止，最后只是笑了笑：「没事，说了怕你笑话。」</p>');
    }
  }else if(kind==='first'){
    if(p.firstDate){
      log('<p>你忽然道：「还记得么，我们头一回同游，是在'+esc(p.firstDate.spot)+'。」</p>');
      log('<p>'+g+'愣了愣，眉眼弯弯：「怎么会忘。」'+g+'低头把玩着衣角，轻声道：「那时候我就觉得，和你在一起的日子，都值得记着。」</p>');
    }else{
      log('<p>你们聊起初见那日。'+g+'托着腮，望着烛火：「那时我就想，这个人，怕是要在我心里住很久了。」</p>');
    }
    f=2;a=2;
  }
  daoAff(p,f,a,'');
  if(chance(0.2)){
    log('<p class="sys">'+pickMoment(p)+'</p>');
    daoAff(p,1,1,'');
  }
  if((p.memories||[]).length&&chance(0.35)){
    const m=pick(p.memories);
    log('<p class="sys">'+g+'忽然轻声说：「还记得么——'+esc(m)+'。」</p>');
    daoAff(p,1,1,'');
  }
  if(chance(0.12)){const gw=growWil(0.06,'情之所至，道心愈坚');if(gw)log(gw)}
  if(chance(0.10)){const gc=growAttr('cha',0.06,'言笑晏晏，气度愈佳');if(gc)log(gc)}
  passTime(1);renderAll();
}

/* ================= 约会：8 个地点，各具情境与判定 ================= */
const DATE_SPOTS=[
  {id:'bamboo',i:'🎋',n:'月下竹林',need:0,d:'风过竹梢，月色清浅'},
  {id:'lantern',i:'🏮',n:'坊市灯会',need:0,d:'烟火人间，灯如星河'},
  {id:'river',i:'🏮',n:'溪边放灯',need:0,d:'一盏心愿，随水东流'},
  {id:'star',i:'✨',n:'山顶观星',need:30,d:'银河垂野，四野俱寂'},
  {id:'flower',i:'🌸',n:'灵谷花海',need:40,d:'花开如海，香气醉人'},
  {id:'snow',i:'❄️',n:'雪夜围炉',need:55,d:'红泥小火，雪落无声'},
  {id:'meteor',i:'🌠',n:'流星之夜',need:60,d:'百年一遇，可遇不可求'},
  {id:'spring',i:'♨️',n:'灵泉温泉',need:70,d:'水汽氤氲，暧昧暗生'},
];
function daoDate(){
  const p=S.daoPartner;
  if(!p){toast('无道侣');return}
  closePanel();
  if(maybeShura())return;
  pC(p);
  if((p.cd.date||0)>0){log('<p class="sys">'+p.name+'挽着你的手臂：「才同游过不久，先歇歇罢。」</p>');passTime(1);renderAll();return}
  const opts=DATE_SPOTS.filter(s=>((p.favor||0)>=s.need)).map(s=>({txt:s.i+' '+s.n+'（'+s.d+'）',fn:()=>dateResolve(s.id)}));
  opts.push({txt:'🚶 改日再约',fn:()=>{log('<p>你想想还是作罢了。</p>');passTime(1);renderAll()}});
  openEventModal('🏞️ 与道侣约会','<p>你斟酌着开口：「'+p.name+'，今日得闲，想不想……出去走走？」</p><p class="sys">'+p.name+'眼睛一亮，笑盈盈地应了。</p>',opts);
}
function dateResolve(id){
  const p=S.daoPartner;
  if(!p)return;
  const spot=DATE_SPOTS.find(x=>x.id===id);
  if(!spot)return;
  const g=he(p);
  const R=function(stat,dc){const r=doRoll(stat,dc);log('<p>'+rollBadge(r.r,r.mod,r.t,r.dc)+'</p>');return r};
  const done=function(line,f,a){endDate(p,spot.n,line,f,a)};
  let intro='',opts=[];
  if(id==='bamboo'){
    intro='<p>月色清浅，竹影婆娑。你们沿小径缓行，竹叶沙沙作响，像有人在远处低语。</p>';
    opts=[
      {txt:'🎋 并肩漫步，听风过竹梢',fn:()=>done('你们沿竹径缓行，月色被竹叶剪成碎银。谁也没说话，衣袂相拂的声音却格外清晰。',2,2)},
      {txt:'🍃 摘一片竹叶，吹一支曲（魅力判定）',fn:()=>{const r=R('cha',13);done(r.hit?'你把竹叶贴在唇边，吹出一支清越的曲子。'+g+'倚着竹竿听完，轻声道：「……再吹一遍，好么？」':'你憋红了脸也没吹响，'+g+'笑得弯了腰，眼泪都快出来了。',r.hit?3:0,r.hit?3:0)}},
      {txt:'🌙 讲一件你的旧事',fn:()=>done('你们寻了块青石坐下。你讲起一桩旧事，'+g+'安安静静听着，末了轻轻把头靠在你肩上。',2,2)},
    ];
  }else if(id==='lantern'){
    intro='<p>坊市灯火如河，人声鼎沸。'+g+'拉着你的衣袖，眼睛被花灯映得亮晶晶的：「走，看灯去。」</p>';
    opts=[
      {txt:'🏮 共放一盏花灯',fn:()=>done('你们在灯面各写一句心愿，推入河中。两盏灯挨挨挤挤，漂向远方。',1,2)},
      {txt:'🧩 猜灯谜（智慧判定）',fn:()=>{const r=R('int',13);done(r.hit?'你连猜三题，赢下一盏琉璃灯。'+g+'提着灯，灯光映进'+he(p)+'眼底，比你见过的所有灵火都亮。':'你连错三题，被摊主打趣。'+g+'护着你落荒而逃，笑了一路。',r.hit?3:1,r.hit?3:1)}},
      {txt:'🍡 买一串糖葫芦',fn:()=>done('你买了两串糖葫芦，第一串递给'+g+'。'+g+'咬了一口，眉眼弯弯：「甜。」',2,2)},
    ];
  }else if(id==='river'){
    intro='<p>溪水潺潺，晚风送来草木香。河面上漂着零星的许愿灯，明明灭灭。</p>';
    opts=[
      {txt:'🏮 放一盏同心灯',fn:()=>done('你们把两盏灯系在一起。'+g+'望着渐远的灯火，低声道：「要是灯不灭，我们就一直这样，好不好？」',2,3)},
      {txt:'✍️ 在灯上写下彼此的名字',fn:()=>done('你提笔写下两人的名字，'+g+'凑过来看，忽然「呀」了一声，红了脸：「谁、谁要和你写在一起。」却没有把灯推走。',2,2)},
      {txt:'🌊 以灵力托灯，看它掠过水面（智慧判定）',fn:()=>{const r=R('int',13);done(r.hit?'灵灯贴水飞掠，惊起一河碎光。'+g+'拍手叫好，眼角眉梢都是少年气。':'灵力一滞，灯栽进水里。'+g+'愣了愣，随即和你笑成一团。',r.hit?3:1,r.hit?3:1)}},
    ];
  }else if(id==='star'){
    intro='<p>山顶风大，银河垂野，星子仿佛伸手可摘。'+g+'仰着头，半天没说话。</p>';
    opts=[
      {txt:'✨ 指认星宿，讲一段神话（智慧判定）',fn:()=>{const r=R('int',13);done(r.hit?'你指着星河讲起牛郎织女，'+g+'忽然轻轻靠过来：「那我们也算，被天道记上一笔了？」':'你指鹿为马，'+g+'笑着拆穿，两人就着错星名笑闹到夜深。',r.hit?3:1,r.hit?3:1)}},
      {txt:'🧥 解下外袍替'+g+'披上（魅力判定）',fn:()=>{const r=R('cha',14);done(r.hit?'夜风乍起，你把外袍搭在'+g+'肩上。'+g+'攥住衣领，闷声道：「……不冷。」却没有还给你。':'外袍刚搭上去就被山风掀飞，你俩追着袍子跑了半座山。',r.hit?4:0,r.hit?3:0)}},
      {txt:'🌠 提议以星光立誓',fn:()=>done('你们并肩坐在崖边，对着银河立下誓约。那一刻，风停云住，天地皆静。',2,4)},
    ];
  }else if(id==='flower'){
    intro='<p>灵谷花海漫过山腰，风一吹，整片山坡都在起伏。'+g+'蹲下去，小心翼翼碰了碰一朵花的花瓣。</p>';
    opts=[
      {txt:'🌸 编一只花环替'+g+'戴上（魅力判定）',fn:()=>{const r=R('cha',13);done(r.hit?'你笨手笨脚编好一只花环，轻轻戴在'+g+'发间。'+g+'抬手摸了摸，忽然别过脸：「……丑死了。」耳朵却红透了。':'花环散架，你手忙脚乱，'+g+'蹲下来和你一起捡花瓣，笑得比花还好看。',r.hit?3:1,r.hit?3:1)}},
      {txt:'💐 采一株开得最好的花相赠',fn:()=>{if(!p.firstGift){p.firstGift={name:'花海中的一株灵花',at:S.days};addMemory(p,'第一份礼物：花海中的一株灵花')}done('你在花海里挑了半日，采下一株最精神的灵花递给'+g+'。'+g+'接过去，仔仔细细别在衣襟上：「这是我收过最好的礼。」',3,3)}},
      {txt:'📿 以花喻人，念一句诗（智慧判定）',fn:()=>{const r=R('int',13);done(r.hit?'你道：「人面桃花相映红。」'+g+'啐你一口：「就你会说话。」嘴角却压不住。':'你吟了半句就卡壳，'+g+'替你接了下半句，反过来笑话你。',r.hit?2:1,r.hit?2:1)}},
    ];
  }else if(id==='snow'){
    intro='<p>大雪封山，天地一色。木屋里的红泥小火炉烧得正旺，窗外雪落无声。</p>';
    opts=[
      {txt:'🍶 温一壶灵酒对酌',fn:()=>done('红泥小火炉上温着酒，你们碰了碰杯，谁也没提修行。酒意微醺时，'+g+'的脸颊染上薄红。',2,2)},
      {txt:'🔥 添柴围炉，聊到夜深',fn:()=>done('你们添了一夜柴，说了许多话，从儿时说到飞升，从飞升说到白头。炉火映着两张脸，暖得让人不想天亮。',2,3)},
      {txt:'📖 以雪水煮茶，论一段道（智慧判定）',fn:()=>{const r=R('int',13);done(r.hit?'你们以雪水煮茶论道，说到妙处，'+g+'拊掌而笑，眼里有光。':'你们各执己见，最后以茶代酒，把道理和茶一起咽了下去。',r.hit?2:1,r.hit?2:1)}},
    ];
  }else if(id==='meteor'){
    intro='<p>夜空忽然被撕开一道亮痕，紧接着，流星如雨坠落。'+g+'「呀」了一声，下意识攥紧了你的衣袖。</p>';
    opts=[
      {txt:'🙏 闭目许愿',fn:()=>done('流星划过的刹那，你们同时闭眼。你许愿时，听见'+g+'小声说：「……让我身边这个人，长命百岁。」',3,4)},
      {txt:'🤲 握住'+g+'的手，共看流星（魅力判定）',fn:()=>{const r=R('cha',14);done(r.hit?'流星如雨坠下时，你握住了'+g+'的手。'+g+'没有挣开，反而收紧了指尖，与你十指相扣。':'你伸手去握，却扑了个空——'+g+'正忙着指流星，根本没注意到你。你悻悻收回手。',r.hit?4:0,r.hit?4:0)}},
      {txt:'🖌️ 以灵气画星图赠'+g+'（智慧判定）',fn:()=>{const r=R('int',14);done(r.hit?'你以灵气凝成一张星图，悬在'+g+'面前。'+g+'仰头看了很久，轻声道：「……留着，等老了再看。」':'星图画到一半就散了，'+g+'噗嗤一笑：「心意到了。」',r.hit?3:1,r.hit?3:1)}},
    ];
  }else if(id==='spring'){
    intro='<p>灵泉氤氲，水汽成雾。'+g+'泡在泉中，只露出半截肩背，水珠顺着发梢滑落。你坐在池边，忽然觉得这泉水的温度高得有些过分。</p>';
    opts=[
      {txt:'🫖 远远守着，煮一壶茶',fn:()=>done('你背对着坐在池边煮茶，耳畔是泠泠水声。茶煮好了，'+g+'披衣过来，接过茶盏时指尖微凉：「……谢谢。」',2,2)},
      {txt:'💆 以灵力替'+g+'烘干湿发（魅力判定）',fn:()=>{const r=R('cha',15);done(r.hit?'你以掌心灵火替'+g+'烘干发梢，指尖偶尔触到'+he(p)+'的后颈，'+g+'整个人都绷了一下，声音发软：「……好了没有。」':'灵火太旺，燎了'+g+'一绺发梢。'+g+'瞪你半晌，又气又笑。',r.hit?4:-1,r.hit?4:0)}},
      {txt:'😳 闭目入定，非礼勿视',fn:()=>done('你闭着眼打坐，耳畔是出水的声音，心念乱成一团。'+g+'上岸后笑你：「道心不稳呀。」',1,1)},
    ];
  }
  openEventModal(spot.i+' 约会 · '+spot.n,intro+'<p class="sys">'+spot.d+'</p>',opts);
}
function endDate(p,spot,line,f,a){
  daoAff(p,f,a,line);
  if(!p.firstDate){p.firstDate={spot:spot,at:S.days};addMemory(p,'第一次同游：'+spot)}
  else addMemory(p,spot+'之行');
  pC(p).date=rand(25,35);
  passTime(2);renderAll();
}

/* ================= 同游：更丰富的出行剧情 ================= */
function daoTravel(){
  const p=S.daoPartner;
  closePanel();
  if(!p){toast('无道侣');return}
  if(maybeShura())return;
  pC(p);
  if((p.cd.date||0)>0){log('<p class="sys">'+p.name+'挽着你的手臂：「才同游过不久，先歇歇罢。」</p>');passTime(1);renderAll();return}
  if(chance(0.3)){partnerEvent();return}
  openEventModal('🗺️ 与道侣同游','<p>你携'+esc(p.name)+'踏出山门，商议此行走法：</p>',[
    {txt:'🧗 登高揽胜',fn:()=>{const g=Math.floor(20+(p.stage||0)*10);S.cult+=g;addMemory(p,'登临绝顶，共看云海');log('<p>你们登临绝顶，云海在脚下翻涌。'+p.name+'临风而立，衣袂飘飘，回头看你时，眼底盛着整片山河（修为 +'+g+'）。</p>');daoAff(p,2,2,'');endTravel(p)}},
    {txt:'🌊 泛舟湖上',fn:()=>{const g=rand(20,60);S.stones+=g;addMemory(p,'湖心泛舟，采荷煮茶');log('<p>你们泛舟湖心，摘荷煮茶，还从湖底捞起一枚沉了百年的储物袋（灵石 +'+g+'）。'+he(p)+'捧着莲子，一颗一颗剥给你吃。</p>');daoAff(p,2,3,'');endTravel(p)}},
    {txt:'🛖 夜宿山寺',fn:()=>{const gw=growWil(0.2,'携手夜谈，道心愈坚');addMemory(p,'古寺夜话');log('<p>夜宿古寺，两人于佛前对坐品茶。烛火摇曳，'+he(p)+'说起儿时的事，你听了一夜。</p>');if(gw)log(gw);daoAff(p,3,3,'');endTravel(p)}},
    {txt:'⚔️ 结伴猎妖',fn:()=>{openEventModal('🐗 猎妖途中','<p>你们循着妖气追入深林，一头妖兽自暗处暴起！</p>',[
      {txt:'🤝 联手迎战',fn:()=>{const e=makeEnemy();log('<p>你与道侣联手，与 <b>'+esc(e.name)+'</b> 战在一处！</p>');startCombat(e);daoAff(p,3,2,'')}},
      {txt:'🛡️ 掩护道侣后撤',fn:()=>{const R=doRoll('agi',15);log('<p>你一把拉住道侣，且战且退：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">你们全身而退，道侣眼中满是关切。</p>');daoAff(p,2,2,'')}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.25));p.hp=Math.max(1,(p.hp||30)-8);daoAff(p,-9,-3,'护人不成反受创')}}},
    ]);}},
  ]);
}
function endTravel(p){pC(p).date=rand(20,30);passTime(3);renderAll()}

/* ================= 赠礼：投其所好 + 第一份礼物记忆 ================= */
function daoGift(){
  const p=S.daoPartner;
  if(!p){toast('无道侣');return}
  closePanel();
  if(maybeShura())return;
  pC(p);
  if((p.cd.gift||0)>0){log('<p class="sys">'+p.name+'摆摆手：「近来收礼太多，再收下去，我都不好意思见你了。」</p>');passTime(1);renderAll();return}
  openEventModal('🎁 赠礼 · '+esc(p.name),'<p>你想送'+p.name+'些什么？（送礼后需歇息数日）</p>',[
    {txt:'💎 坊市灵饰（100灵石）',fn:()=>daoGiftResolve('jewel')},
    {txt:'🌿 一株合意的灵草（需灵草×1）',fn:()=>daoGiftResolve('herb')},
    {txt:'💊 一枚丹药（需行囊有丹）',fn:()=>daoGiftResolve('pill')},
    {txt:'✂️ 亲手做一件小物（魅力判定）',fn:()=>daoGiftResolve('handmade')},
    {txt:'🚶 改日再送',fn:()=>{log('<p>你想想还是作罢了。</p>');passTime(1);renderAll()}},
  ]);
}
function daoGiftResolve(kind){
  const p=S.daoPartner;
  if(!p)return;
  const g=he(p);
  let giftName='';
  if(kind==='jewel'){
    if(S.stones<100){toast('灵石不足');return}
    S.stones-=100;giftName='一支灵玉簪';
    log('<p>你在坊市挑了半日，选了一支灵玉簪。'+(p.gender==='女'?'她接过去对着光看了看，轻轻「呀」了一声，别进发间，转头问你好看么。':'他接过去端详片刻，笑着别在衣襟上，说很衬你。')+'</p>');
    daoAff(p,3,3,'');
  }else if(kind==='herb'){
    const mk=['herb','sherb'].find(k=>(S.mats[k]||0)>0);
    if(!mk){log('<p>你翻了翻储物袋，没有找到合意的灵草，只好作罢。</p>');passTime(1);renderAll();return}
    S.mats[mk]--;giftName='一株'+MAT_NAMES[mk];
    log('<p>你取出一株<b>'+MAT_NAMES[mk]+'</b>递过去。'+(p.taste==='材'?g+'眼睛一亮，小心捧过去，翻来覆去地看：「你怎么知道我想要这个？」':g+'接过去，凑近闻了闻，眉眼弯弯：「药香很正。」')+'</p>');
    daoAff(p,3,3,'');
  }else if(kind==='pill'){
    const it=S.items.find(x=>x.type==='consumable'&&/丹/.test(x.name));
    if(!it){log('<p>你翻了翻行囊，没有找到合适的丹药，只好作罢。</p>');passTime(1);renderAll();return}
    S.items.splice(S.items.indexOf(it),1);giftName='一枚'+it.name;
    log('<p>你取出一枚<b>'+it.name+'</b>相赠。'+he(p)+'捏着丹药看了又看，忽然低声道：「这么好的丹，留着自己用多好……」却还是宝贝似地收了起来。</p>');
    daoAff(p,3,3,'');
  }else if(kind==='handmade'){
    const R=doRoll('cha',14);
    log('<p>你花了半日，笨手笨脚地做了件小物：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit){
      giftName='亲手做的小物件';
      log('<p class="good">你把那件歪歪扭扭的小物递过去。'+he(p)+'接在手里，翻来覆去看了很久，忽然别过脸去，声音闷闷的：「……丑是丑了点，我收下了。」耳朵却红透了。</p>');
      daoAff(p,4,4,'');
      if(R.crit)addMemory(p,'收到我亲手做的小物');
    }else{
      giftName='一块不成形的木料';
      log('<p class="danger">那东西在你手里散架了。'+he(p)+'看着满地零件，又看看你窘迫的脸，笑出了声：「心意到了，手艺……再练练。」</p>');
      daoAff(p,1,1,'');
    }
  }
  if(giftName&&!p.firstGift){p.firstGift={name:giftName,at:S.days};addMemory(p,'第一份礼物：'+giftName);daoAff(p,1,1,'')}
  pC(p).gift=rand(15,25);
  passTime(1);renderAll();
}

/* ================= 多幕双修：调息 → 指尖 → 交融 → 心魔/相依 → 结算 ================= */
let _dual=null;
function doDualCultivate(){
  if(!S.daoPartner){toast('无道侣');return}
  closePanel();
  if(chance(0.08)){partnerEvent();return}
  const p=S.daoPartner;
  scene('双修');
  _dual={st:1,mood:0};
  log('<p class="sys">夜已深，洞府中烛影摇红，灵气氤氲如雾。'+p.name+'与你相对而坐，'+he(p)+'垂着眼，指尖轻轻绞着衣角。</p>');
  if(p.rootElem===S.rootElem)log('<p class="sys">你们体内同属灵根微微共鸣，烛火竟跟着一跳——这份天赐的默契，让双修事半功倍。</p>');
  dualStage(1);
}
function dualStage(st){
  const p=S.daoPartner;
  if(!p){_dual=null;return}
  _dual.st=st;
  const g=he(p);
  const em=dualCultMult(p);
  let title='',intro='',opts=[];
  if(st===1){
    title='☯️ 双修 · 调息';
    intro='<p>你们阖上眼，灵气缓缓在经脉中流转。烛火映着两张脸，呼吸渐渐同频——你不确定是刻意，还是天意。</p><p class="sys">五行相性 ×'+em.toFixed(2)+'</p>';
    opts=[
      {txt:'🧘 阖目调息，任灵气自行运转',fn:()=>{log('<p>你静心入定，丹田温热。不知过了多久，你睁眼，正撞见'+g+'偷偷看你的目光。'+g+'被抓了个正着，耳尖悄悄红了。</p>');daoAff(p,1,1,'');dualStage(2)}},
      {txt:'👀 悄悄看'+g,fn:()=>{const R=doRoll('cha',13);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>'+g+'似有所觉，睫毛颤了颤，却没有睁眼，只是嘴角轻轻翘起。</p>');daoAff(p,1,2,'')}else{log('<p>'+g+'忽然睁眼，正对上你偷看的目光。'+g+'又羞又好笑：「看什么，脸都看红了。」</p>')}dualStage(2)}},
      {txt:'🍵 推过一盏温热的灵茶',fn:()=>{log('<p>你以灵力温了一盏茶，轻轻推过去。'+g+'接过时，指尖与你相触，微微一颤，茶面漾开一圈细纹。</p>');daoAff(p,2,1,'');dualStage(2)}},
    ];
  }else if(st===2){
    title='☯️ 双修 · 指尖相触';
    intro='<p>灵气渐浓，你们抬起双掌，掌心相距三寸。隔着薄薄一层灵光，已能感到彼此的温度。</p>';
    opts=[
      {txt:'🤲 轻轻握住'+g+'的手（魅力判定）',fn:()=>{const R=doRoll('cha',14);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>你的掌心覆上'+g+'的手背。'+g+'没有抽回，反而将手指慢慢嵌进你的指缝，十指交扣。</p>');daoAff(p,1,3,'');_dual.mood++}else{log('<p>你握住'+g+'的手时，两人都僵了一下——随即'+g+'噗嗤笑出来：「手凉，放炉子上烤烤。」</p>')}dualStage(3)}},
      {txt:'✨ 以灵力循'+g+'经脉（智慧判定）',fn:()=>{const R=doRoll('int',14);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>灵力顺着'+g+'经脉走了一周天，你们同时轻颤——像两只手在彼此看不见的地方，牵到了一起。</p>');daoAff(p,0,2,'');const gg=Math.floor(20+S.root/6);S.cult+=gg;log('<p class="good">修为 +'+gg+'。</p>');_dual.mood++}else{log('<p>灵力行岔，'+g+'「呀」了一声，你连忙收功，两人相视，都有点不好意思。</p>');daoAff(p,0,-1,'')}dualStage(3)}},
      {txt:'🙈 屏住呼吸，轻轻合拢指尖',fn:()=>{log('<p>你们的手指隔着灵光相贴，谁也没有更进一步，呼吸却都乱了。</p>');daoAff(p,0,1,'');dualStage(3)}},
    ];
  }else if(st===3){
    title='☯️ 双修 · 灵气交融';
    intro='<p>灵力相抵，阴阳互济。周身气流渐急，衣衫与发丝无风自动，洞府中的烛火跳了跳。</p>';
    opts=[
      {txt:'☯️ 全力运转功法，引天地灵气入体',fn:()=>{log('<p>灵气如潮涌来，丹田一阵滚烫。你心头一喜，正要沉入修炼，却听见'+g+'低低笑了一声——原来'+he(p)+'也正闭目全力施为，两人竟在较劲。</p>');const gg=Math.floor(25+S.root/5);S.cult+=gg;log('<p class="good">修为 +'+gg+'。</p>');daoAff(p,1,1,'');dualStage(4)}},
      {txt:'🌀 灵识相接，共游识海（智慧判定）',fn:()=>{const R=doRoll('int',16);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p class="good">灵识相触的刹那，你们同时看见了对方心里最柔软的一角——那里藏着彼此的名字。</p>');daoAff(p,0,4,'');const gg=Math.floor(45+S.root/4);S.cult+=gg;log('<p class="good">修为 +'+gg+'。</p>');_dual.mood++}else{log('<p class="danger">灵识一触即分，'+g+'扶额轻呼，眼波嗔怪地瞪你：「捣什么乱。」</p>');daoAff(p,0,-1,'')}dualStage(4)}},
      {txt:'💞 十指相扣，相视一笑',fn:()=>{log('<p>十指交扣的刹那，灵气轰然共鸣，阴阳二气在你们之间织成一道小小漩涡。'+g+'低声道：「……与你同修，比独自闭关，暖和得多。」</p>');daoAff(p,2,3,'');const gg=Math.floor(25+S.root/5);S.cult+=gg;log('<p class="good">修为 +'+gg+'。</p>');_dual.mood++;dualStage(4)}},
    ];
  }else if(st===4){
    const demon=S.heartDemons>0||chance(0.5);
    if(demon){
      title='☯️ 双修 · 心魔相护';
      intro='<p>灵台深处，忽有一缕魔音飘起——「你修的这仙，到底为了谁？」</p>';
      opts=[
        {txt:'🛡️ 同心护道（心性判定）',fn:()=>{const R=doRoll('wil',15);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){if(S.heartDemons>0)S.heartDemons--;log('<p class="good">你稳住心神，将'+g+'护在身后。魔音嘶鸣着消散，你睁眼时，'+g+'正紧紧攥着你的手，指尖发白：「……有你在，我不怕。」</p>');daoAff(p,1,4,'');_dual.mood+=2;const gw=growWil(0.15,'同心抗魔，道心愈坚');if(gw)log(gw)}else{S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.1));log('<p class="danger">魔音趁隙而入，你们同时惊出一身冷汗。'+g+'脸色微白，你连忙扶住'+he(p)+'。</p>');daoAff(p,-1,-2,'')}dualFinal()}},
        {txt:'🕊️ 独自镇守，让'+g+'安心入定',fn:()=>{log('<p>你以心神筑起屏障，将魔音尽数挡下。'+g+'安然入定，你却在魔音中熬得面色发白——天亮时，'+g+'把一枚温热的丹药塞进你手心：「……傻子。」</p>');daoAff(p,3,2,'');_dual.mood++;const gw=growWil(0.2,'以己身镇魔，道心大进');if(gw)log(gw);dualFinal()}},
        {txt:'😴 相拥而卧，以体温相护',fn:()=>{log('<p>'+pov('你索性将'+g+'揽入怀中，以体温隔绝魔音。'+g+'起初挣了一下，后来便安静下来，在你怀里轻声说：「……若是永远这样，倒也值得。」',g+'索性将你揽入怀中，以体温隔绝魔音。你起初挣了一下，后来便安静下来，在他怀里轻声说：「……若是永远这样，倒也值得。」')+'</p>');daoAff(p,1,4,'');_dual.mood+=2;addMemory(p,'同心相护，渡过一夜魔音');dualFinal()}},
      ];
    }else{
      title='☯️ 双修 · 相依入定';
      intro='<p>灵气渐息，夜风从窗外涌进来。你们的气息纠缠在一起，谁也没有先睁眼。</p>';
      opts=[
        {txt:'💞 相拥而眠',fn:()=>{log('<p>'+pov(g+'靠进你怀里，发丝蹭过你的颈侧。你听见'+g+'极轻极轻地说：「……今夜，不做修士，只做你的人。」','你靠进'+g+'怀里，'+g+'低头抵着你的发顶。你听见'+g+'极轻极轻地说：「……今夜，不做修士，只做你的人。」')+'</p>');daoAff(p,1,5,'');_dual.mood+=2;addMemory(p,'双修夜，相依而眠');dualFinal()}},
        {txt:'🧘 静坐相对，直至天明',fn:()=>{log('<p>你们就这样静静坐着，从月升坐到月落。灵台澄明，比任何一次闭关都安稳。</p>');daoAff(p,2,2,'');const gw=growWil(0.15,'静坐同心，道心愈坚');if(gw)log(gw);dualFinal()}},
        {txt:'🍵 煮一壶茶，说一会话',fn:()=>{log('<p>你们披着月光煮茶闲话，不知不觉说到了天明。</p>');daoAff(p,2,2,'');dualFinal()}},
      ];
    }
  }
  openEventModal(title,intro,opts);
}
function dualFinal(){
  const p=S.daoPartner;
  const D=_dual||{};
  _dual=null;
  const em=dualCultMult(p);
  const base=Math.floor((18+S.root/4+(p.stage||0)*8)*rand(8,12)/10*em);
  let g=base;
  if(D.mood>0)g=Math.floor(g*(1.1+Math.min(D.mood,3)*0.05));
  S.cult+=g;
  S.flag.dualCount=(S.flag.dualCount||0)+1;
  const fg=clamp(1+Math.round((p.favor||0)/30)+(D.mood||0),1,6);
  const ag=clamp(2+Math.round((p.affinity||0)/25)+(D.mood||0),2,8);
  daoAff(p,fg,ag,'');
  addMemory(p,'双修之夜，灵与心一同交融');
  rewardPush([{name:'修为 +'+fmtNum(g),src:'双修'},{name:'心动 +'+ag,src:'双修'}]);
  fxFloatText('修为 +'+g+' · 心动 +'+ag,'#ffd76a',true);
  fxBurst(16,'#ff8fa8');
  fxVibrate([30,30,30]);
  log('<p class="good">黎明将至，你们缓缓收功。'+p.name+'睁开眼，眼里映着天边第一线鱼肚白，'+(p.gender==='女'?'她':'他')+'抿了抿唇：「……下次，还一起。」</p>');
  log('<p class="sys">修为 +'+g+' · 情缘 +'+fg+' · 心动 +'+ag+'（双修次数 '+(S.flag.dualCount)+'）</p>');
  if(chance(0.18)){const gw=growWil(0.12,'情意入道，道心愈坚');if(gw)log(gw)}
  const gc=growAttr('cha',0.10,'双修合气，神采渐丰');if(gc)log(gc);
  passTime(3);renderAll();
}

/* ================= 提亲 / 双修大典 ================= */
function daoPropose(){
  const p=S.daoPartner;
  if(!p){toast('无道侣');return}
  closePanel();
  if(p.married){
    openEventModal('👰 结缡道侣','<p>你与'+p.name+'早已结缡。'+(p.ceremonyDate!==undefined?'那是第 '+Math.floor(p.ceremonyDate/365)+' 年的事。':'')+'如今想来，仍觉满心欢喜。</p>',[
      {txt:'💞 握住'+he(p)+'的手，相视一笑',fn:()=>{log('<p>'+p.name+'回握住你的手，眼里有温柔的光：「'+pov('嫁了你','娶了你')+'，是我这辈子的运气。」</p>');daoAff(p,1,1,'');passTime(1);renderAll()}},
      {txt:'🌙 提起大典那日的热闹',fn:()=>{addMemory(p,'又提起双修大典那日');log('<p>你说起大典那日十里红绸、宾朋满座，'+he(p)+'听得弯起眼睛：「那时的你，比宗门大比还紧张呢。」</p>');daoAff(p,2,2,'');passTime(1);renderAll()}},
    ]);
    return;
  }
  if((p.favor||0)<90||(p.affinity||0)<90){log('<p class="sys">你话到嘴边又咽了回去——情缘未到深处，此刻提亲，未免唐突。（需好感与心动均 ≥90）</p>');passTime(1);renderAll();return}
  const canPay=(S.stones>=500&&(S.mats.demonCore||0)>=1&&(S.mats.jade||0)>=1);
  const canSect=!!S.sect&&(S.contrib||0)>=200;
  if(!canPay&&!canSect){log('<p class="sys">你忽然想起，'+pov('提亲总得备一份像样的彩礼','求娶总得备一份像样的聘礼')+'。'+p.name+'含笑望着你，等你开口，你却一时语塞。（需 500灵石 + 妖丹×1 + 寒玉×1，或宗门贡献 ≥200）</p>');passTime(1);renderAll();return}
  openEventModal('💍 提亲 · 双修大典','<p>月色正好。你深吸一口气，牵起'+p.name+'的手，认真道：「仙途漫长，我想与你结为道侣，从此风雨同舟，生死与共。你……愿意么？」</p><p class="sys">'+p.name+'怔怔望着你，眼里慢慢蓄起水光。</p>',[
    {txt:pov('💍 正式提亲（彩礼：500灵石 + 妖丹×1 + 寒玉×1）','💍 郑重求娶（聘礼：500灵石 + 妖丹×1 + 寒玉×1）'),cls:'primary',fn:()=>{
      if(canPay){S.stones-=500;S.mats.demonCore--;S.mats.jade--}
      else{S.contrib=Math.max(0,(S.contrib||0)-200);S.contribVal=Math.max(0,(S.contribVal||0)-200)}
      p.married=true;p.ceremonyDate=S.days;
      addMemory(p,'双修大典，天地为证');
      if(!S.titles.includes('married')){S.titles.push('married');log('<p class="loot">🏅 获得称号「结缡同心」——自此双修增益永久提升。</p>')}
      scene('双修大典');
      log('<p>'+pov('你取出彩礼，郑重下聘','你备下聘礼，郑重求娶')+'。三日之后，宗门内外，宾朋满座，红绸铺了十里山道。</p>');
      log('<p class="good">大典之上，你们对天地起誓：『生生世世，同赴仙途。』'+p.name+'为你别上一枚同心结，'+(p.gender==='女'?'她':'他')+'眼底映着烛火，比任何一场流星都亮。</p>');
      daoAff(p,8,8,'');
      passTime(3);renderAll();
    }},
    {txt:'🚶 再等等，想给'+he(p)+'更好的承诺',fn:()=>{log('<p>你终究没有说出口，只握了握'+he(p)+'的手。'+(p.gender==='女'?'她':'他')+'似有所觉，轻轻「嗯」了一声：「不急，我等得起。」</p>');passTime(1);renderAll()}},
  ]);
}

/* ================= 纪念日：昵称与回礼 ================= */
function daoAnniv(){
  const p=S.daoPartner;
  if(!p)return;
  closePanel();
  const g=he(p);
  const y=Math.floor((S.days-(p.anniv||S.days))/365)+1;
  if(!p.nickname){
    openEventModal('🎂 结缘纪念 · 第 '+y+' 年','<p>这一日，'+p.name+'早早等在洞府外，手里攥着一条新编的绳结。'+he(p)+'低头绞着绳结，声音轻轻：「今儿……是我们初遇的一整年。」</p><p>'+he(p)+'顿了顿，耳根微红：「我、我一直想……给你起一个只有我叫的名字。你若应了，我就告诉你。」</p>',[
      {txt:'💕 应'+he(p)+'，听'+he(p)+'唤你一声',fn:()=>{
        const nn=pick(pov(['阿道','木头','冤家','傻子','心上人'],['阿道','冤家','傻丫头','心上人','我的道侣']));
        p.nickname=nn;
        addMemory(p,g+'给我起了昵称「'+nn+'」');
        log('<p>'+p.name+'抿着唇，终于唤了一声：「……'+nn+'。」声音又轻又软，像是怕被风听了去。</p>');
        log('<p class="good">你应了一声。'+he(p)+'的眼睛一下子亮起来，又红着脸别过头去，把那条绳结系在你腕上：「……那你就是我的人了。」</p>');
        daoAff(p,4,4,'');
        S.flag.tongxin=true;
        passTime(1);renderAll();
      }},
      {txt:'🙈 有些不好意思，笑着岔开',fn:()=>{log('<p>你笑着揉了揉'+he(p)+'的发顶，'+he(p)+'哼了一声，却也没再坚持，只是把绳结悄悄系在了自己腕上。</p>');daoAff(p,2,2,'');passTime(1);renderAll()}},
    ]);
  }else{
    openEventModal('🎂 结缘纪念 · 第 '+y+' 年','<p>又逢初遇之日。'+p.name+'早早备好一桌茶点，见你来，'+(p.gender==='女'?'她':'他')+'弯着眼睛唤了一声：「'+p.nickname+'，来。」</p>',[
      {txt:'🎁 收下'+he(p)+'准备的纪念礼',fn:()=>{const st=rand(120,250);S.stones+=st;S.mats.sherb=(S.mats.sherb||0)+1;S.flag.tongxin=true;addMemory(p,'第 '+y+' 个纪念日');log('<p class="loot">'+p.name+'把一枚暖玉放进你手心：「一年一度，不许嫌少。」（灵石 +'+st+'，灵草 ×1，道侣双修增益 +0.05 永久）</p>');daoAff(p,5,5,'');passTime(1);renderAll()}},
      {txt:'💍 反过来给'+he(p)+'备了一份心意（100灵石）',fn:()=>{if(S.stones>=100){S.stones-=100;addMemory(p,'纪念日回礼');log('<p>你早在坊市挑了一件信物，此刻郑重递出。'+he(p)+'接过去，眼眶忽然就红了：「……你还记得。」</p>');daoAff(p,6,6,'')}else{log('<p>你摸了摸空空的储物袋，只好笑着把'+he(p)+'连人带礼一起搂住：「你就是最好的礼。」</p>');daoAff(p,3,3,'')}passTime(1);renderAll()}},
      {txt:'🌙 什么都不说，只陪'+he(p)+'坐到深夜',fn:()=>{addMemory(p,'第 '+y+' 个纪念日，静坐至天明');log('<p>你们并肩坐在檐下，从黄昏坐到星河满天，又坐到晨光初现。谁都没说话，却比任何誓言都笃定。</p>');daoAff(p,3,4,'');passTime(2);renderAll()}},
    ]);
  }
}

/* ================= 表白 / 暧昧 / 叙话（增强版） ================= */
function confessLove(n){
  if(!n)return;
  if(S.daoPartner){toast('已有道侣');return}
  const R=doRoll('cha',17);
  log('<p>你鼓起勇气，于月下剖白心迹：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    if(S.companion===n)S.companion=null;
    n.affinity=70;S.daoPartner=n;
    /* 成为道侣后不再算「暧昧对象」，从红颜/蓝颜列表移除（防修罗场出现同一人） */
    const _ai=(S.affairs||[]).indexOf(n);
    if(_ai>=0)S.affairs.splice(_ai,1);
    S.flag.partnerCount=(S.flag.partnerCount||0)+1;
    n.anniv=S.days;n.memories=n.memories||[];n.cd=n.cd||{};
    log('<p class="good">'+(n.role==='妖族狐女'||n.role==='狐仙苏苏'?'狐女眼波流转，轻笑一声：「你倒是个有趣的人。」':'对方怔怔望你许久，终是红着脸点了点头。')+'</p>');
    log('<p class="good">那一夜，你们在山道上走了一路，谁都没有说话，指尖却始终若即若离地碰着。走到天亮时，'+(n.gender==='女'?'她':'他')+'忽然说：「这条路，以后都一起走。」</p>');
    addMemory(n,'初遇那夜，定情山道');
    for(const a of (S.affairs||[])){if(a&&a!==n)favorChange(a,-6,'闻君结缡，黯然神伤')}
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
    log('<p class="good">'+(n.gender==='女'?'她红着脸，终是点了头。':'他深深看你一眼，算是应下。')+'自此，你二人结为红颜/蓝颜知己'+(S.daoPartner?'（⚠️ 你有道侣在侧，修罗场随时可能爆发！）':'')+'。月下相约，风月渐浓。</p>');
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
function daoAffairChat(idx){
  const a=(S.affairs||[])[idx===undefined?0:idx];
  if(!a){toast('缘起缘灭，此人已不在你身边');return}
  if(maybeShura())return;
  pC(a);
  if((a.cd.talk||0)>0){log('<p>'+a.name+'摆手：「近日琐事缠身，改日再叙。」</p>');passTime(1);renderAll();return}
  const qixi=(S.flag.qixiLeft||0)>0;
  const g=rand(2,5)+(qixi?3:0);
  a.cd.talk=rand(8,14);
  a.favor=clamp(a.favor+g,0,100);
  log('<p>你与'+esc(a.name)+'于月下闲谈半宿，'+(a.gender==='女'?'她':'他')+'絮絮说着近来见闻'+(qixi?'，七夕的星光落进'+(a.gender==='女'?'她':'他')+'眼底，温柔得不像话':'')+'（好感 +'+g+'）。</p>');
  if(chance(0.3)){
    log('<p class="sys">'+(a.gender==='女'?'她':'他')+'忽然问你：「那日你说的话，还算数么？」你一时语塞，'+(a.gender==='女'?'她':'他')+'又笑了笑：「不急，我记着就是。」</p>');
  }
  if(qixi)log('<p class="sys">七夕鹊桥在望，情意更浓。</p>');
  if(chance(0.18)&&S.daoPartner)favorChange(S.daoPartner,-1,'风闻你与'+esc(a.name)+'月下相会，心绪微乱');
  passTime(1);renderAll();
}
function daoPart(){
  const p=S.daoPartner;
  if(!p)return;
  closePanel();
  const deep=(p.affinity||0)>=80||(p.favor||0)>=80;
  logChoices([
    {txt:'💔 郑重分手'+(deep?'（情根深种，将种下情劫）':'（情缘清零）'),cls:'danger',fn:()=>{
      const g=he(p);
      if(deep){S.flag.qingjie=(S.flag.qingjie||0)+rand(30,60);log('<p class="danger">你们于渡口话别。'+g+'没有回头，风把你的话吹散在江上。你这才惊觉，那一眼，竟比刀剑更疼。——你种下了一道<b>情劫</b>（'+S.flag.qingjie+' 日内心性判定 -2）。</p>')}
      else{log('<p>你们于渡口话别。'+g+'没有回头，风把你的话吹散在江上。</p>')}
      S.daoPartner=null;passTime(1);renderAll();
    }},
    {txt:'😅 只是说说而已',fn:()=>{log('<p>你话到嘴边又咽了回去。'+p.name+'似有所觉，深深看了你一眼，忽然开口：「要是哪天你后悔了，记得……先同我说。」</p>');daoAff(p,1,1,'');passTime(1);renderAll()}}
  ]);
}

/* ================= 2G 家族与子女传承 ================= */
function askChild(){
  const p=S.daoPartner;
  if(!p||!p.married){toast('需结为结缡道侣后方可商议子嗣');return}
  if((p.favor||0)<80||(p.affinity||0)<80){log('<p class="sys">你话到嘴边又咽了回去——此刻提子嗣，为时尚早。（需好感与心动均 ≥80）</p>');passTime(1);renderAll();return}
  if(S.flag.childCd>0){log('<p class="sys">'+p.name+'轻轻摇头：「此事，容我缓缓。」</p>');passTime(1);renderAll();return}
  if(S.flag.childPreg&&S.flag.childPreg.left>0){toast('已有身孕在身');return}
  openEventModal('👶 共商子嗣','<p>月下，你握着'+p.name+'的手，斟酌良久，终于开口：「仙途漫长，我……想要一个我们的孩子。」</p>',[
    {txt:'💞 郑重相求（魅力判定）',fn:()=>{const R=doRoll('cha',15);log('<p>'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.flag.childPreg={left:90,mom:p.name};log('<p class="good">'+p.name+'怔怔望你许久，耳根渐渐红透，终是轻轻「嗯」了一声：「……好。」</p>');log('<p class="sys">孕期三月（游戏内），每月可「胎息检查」，安胎得当，灵胎自稳。</p>');daoAff(p,5,5,'');passTime(1);renderAll()}else if(R.fumble){S.flag.childCd=60;log('<p class="danger">'+p.name+'脸色微白，垂眸良久：「此事……我还没准备好。」（60 日内不可再提）</p>');passTime(1);renderAll()}else{S.flag.childCd=30;log('<p class="sys">'+p.name+'轻声道：「再……让我想想。」（30 日内不可再提）</p>');passTime(1);renderAll()}}},
    {txt:'🙈 话到嘴边，又咽了回去',fn:()=>{log('<p>你终究没有说出口，只把'+he(p)+'的手握得更紧了些。</p>');passTime(1);renderAll()}},
  ]);
}
function childCheck(){
  const pg=S.flag.childPreg;
  if(!pg||pg.left<=0){toast('并无身孕');return}
  const p=S.daoPartner;
  const nm=p?p.name:'道侣';
  const g=p?he(p):'她';
  const month=Math.ceil(pg.left/30);
  openEventModal('🤰 胎息检查 · 第 '+(4-month)+' 月','<p>你以灵力轻探'+nm+'丹田，一缕微弱的灵息在'+g+'腹中游弋——那是新生命的心跳。</p>',[
    {txt:'🧘 以温养灵气安胎（心性判定）',fn:()=>{const R=doRoll('wil',14);log('<p>你双掌虚悬，灵气如温水般缓缓渡入：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){pg.strength=(pg.strength||0)+1;log('<p class="good">灵胎受温养，气息愈发沉稳（胎息 +1）。</p>')}else{pg.strength=(pg.strength||0)-1;log('<p class="danger">灵气微乱，你连忙收功，'+nm+'替你擦了擦汗。</p>')}advanceChild()}},
    {txt:'🌿 服一枚安神补气之丹',fn:()=>{const it=S.items.find(x=>x.use==='cure_shenhun'||x.use==='heal');if(it){S.items.splice(S.items.indexOf(it),1);pg.strength=(pg.strength||0)+2;log('<p class="good">'+nm+'服下丹药，气色红润（胎息 +2）。</p>')}else{log('<p>行囊中并无合适的丹药，你以灵力慢慢梳理。</p>')}advanceChild()}},
    {txt:'💤 让'+nm+'好好歇息',fn:()=>{pg.strength=(pg.strength||0)+1;log('<p>你铺好软榻，'+g+'安然睡去，你守在榻边，一夜未合眼。</p>');advanceChild()}},
  ]);
}
function advanceChild(){
  const pg=S.flag.childPreg;
  pg.left-=30;
  if(pg.left<=0){childBorn();return}
  passTime(30);renderAll();
}
function childBorn(){
  const pg=S.flag.childPreg;
  const p=S.daoPartner;
  const nm=p?p.name:'道侣';
  const gender=chance(0.5)?'男':'女';
  const name=uniqueName(gender);
  const root=clamp(Math.floor((S.root+((p&&p.root)||50))/2)+rand(-8,8),20,95);
  const elem=chance(0.3)?S.rootElem:((p&&p.rootElem)||pickRootElem());
  const child={name:name,gender:gender,root:root,rootElem:elem,stage:0,progress:0,favor:rand(60,80),bornAt:S.days,parent:S.name,mom:nm,strength:pg.strength||0};
  S.children=S.children||[];
  S.children.push(child);
  S.flag.childPreg=null;
  scene('诞子');
  fxBurst(30,'#ffd7c0');fxFloatText('🎉 新生命降世','#ffd7c0',true);fxVibrate([60,40,60]);
  log('<p class="good">一声清亮的啼哭划破晨光——你与'+nm+'的孩子<b>'+name+'</b>降生了！'+(p&&p.gender==='女'?'她':'他')+'抱着襁褓，眼里蓄着泪，笑得比初生的朝阳还暖。</p>');
  log('<p class="sys">新生儿面板：灵根 <b>'+root+'</b>（'+elemInfo(elem).i+elemInfo(elem).n+'）'+(child.strength>0?' · 先天胎息充足（成长 +10%）':'')+'。可在仙途录「家族」页培养。</p>');
  if(child.strength>0)child.growthBonus=0.1;
  S.flag.childCd=90;
  daoAff(p,8,8,'');
  passTime(3);renderAll();
}
function childAct(i,kind){
  const c=(S.children||[])[i];
  if(!c){toast('已不在家中');return}
  if(kind==='art'){const g=Math.floor(20+c.root/3)*(1+(c.growthBonus||0));c.progress=(c.progress||0)+g;log('<p class="good">你为'+c.name+'讲解功法要义（成长 +'+Math.floor(g)+'）。</p>')}
  else if(kind==='train'){const g=Math.floor(15+c.root/4)*(1+(c.growthBonus||0));c.progress=(c.progress||0)+g;log('<p class="good">你带'+c.name+'入山历练，'+(c.gender==='女'?'她':'他')+'虽年幼，却已有了几分修士的气度（成长 +'+Math.floor(g)+'）。</p>')}
  else if(kind==='grow'){
    const need=Math.floor(80+c.stage*120);
    if(c.progress>=need&&c.stage<9){c.progress-=need;c.stage++;log('<p class="good">🎉 '+c.name+'长大了一岁，晋入<b>'+stageName(c.stage)+'</b>！</p>')}
  }
  passTime(1);renderAll();
}
function childrenHtml(){
  const cs=S.children||[];
  if(!cs.length)return '<p style="color:#6f7a94">尚无子嗣。结缡道侣后可在道侣面板「共商子嗣」。</p>';
  return cs.map((c,i)=>{
    const need=Math.floor(80+c.stage*120);
    const avatar=artImg('assets/portraits/child_'+(c.gender==='女'?'f':'m')+'.jpg',40,40,'avatar')||childAvatar(c.gender,c.stage);
    return '<div class="item-card"><div class="nm child-card">'+avatar+'<b>'+esc(c.name)+'</b> <span class="tag">'+(c.gender==='女'?'♀':'♂')+'</span> <span class="tag">'+stageName(c.stage)+'</span></div>'+
      '<div class="ds">灵根 '+c.root+'（'+elemInfo(c.rootElem).n+'） · 成长 '+Math.floor(c.progress||0)+'/'+need+(c.parent?' · 血脉：'+esc(c.parent)+'×'+esc(c.mom):'')+(c.growthBonus?' · 胎息充裕 +10%':'')+'</div>'+
      '<div style="margin-top:6px"><button class="small" onclick="childAct('+i+',\'art\')">📖 传功</button> <button class="small" onclick="childAct('+i+',\'train\')">🗡️ 历练</button> <button class="small" onclick="childAct('+i+',\'grow\')">🌱 长大</button> <button class="small" onclick="openChildCard('+i+')">📇 档案</button></div></div>';
  }).join('');
}

/* ================= 道侣事件：更丰富的日常心动 ================= */
function partnerEvent(){
  const p=S.daoPartner;
  if(!p)return;
  const g=he(p);
  const evs=[
    {t:'夜深了，'+g+'悄悄起身，把一件外袍轻轻搭在你肩上。',opts:[
      {txt:'💞 握住'+g+'还没来得及收回的手',fn:()=>{log('<p>你的手覆上'+g+'的手背。'+g+'僵了一下，没有抽走，声音闷闷的：「……怕你着凉。」</p>');daoAff(p,3,3,'')}},
      {txt:'🛌 装作熟睡，看'+g+'怎么办',fn:()=>{log('<p>你闭着眼装睡，感觉到'+g+'在你身侧站了很久，最后极轻极轻地叹了口气，替你掖了掖被角，又悄悄走开了。</p>');daoAff(p,2,2,'')}},
    ]},
    {t:''+g+'练剑时划破了手，正抿着唇偷偷包扎。',opts:[
      {txt:'🧵 上前替'+g+'包扎（魅力判定）',fn:()=>{const R=doRoll('cha',13);log('<p>你接过布条，低头替'+g+'缠好：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>'+g+'看着你认真的侧脸，忽然道：「……要是手一直不好，你是不是一直这样待我？」</p>');daoAff(p,4,4,'')}else{log('<p>你手忙脚乱，打了个难看的结。'+g+'举起手看了看，笑了：「还行，像只蝴蝶。」</p>');daoAff(p,1,1,'')}}},
      {txt:'😏 打趣'+g+'剑法不精',fn:()=>{log('<p>你笑'+g+'剑法不精，'+g+'恼羞成怒，抄起剑鞘作势要敲你。你抱头鼠窜，满院子鸡飞狗跳。</p>');favorChange(p,-1,'打趣剑法，惹得道侣恼羞成怒')}},
    ]},
    {t:'有人当众给'+g+'送了一匣灵玉，'+g+'扭头看向你。',opts:[
      {txt:'😌 大度一笑，替'+g+'谢过对方',fn:()=>{log('<p>你含笑上前，替'+g+'谢绝了那匣灵玉：「'+g+'的心意，自有我来给。」'+g+'耳朵微红，却挺直了腰。</p>');daoAff(p,4,3,'')}},
      {txt:'😤 吃醋，牵着'+g+'就走',fn:()=>{log('<p>你一把牵起'+g+'的手，大步离开。'+g+'被你拽得踉跄，却弯着眼睛笑了：「醋坛子。」</p>');daoAff(p,2,2,'')}},
    ]},
    {t:''+g+'忽然问：「若有一日，我不在了，你会如何？」',opts:[
      {txt:'🛡️ 认真回答：我会踏遍九界寻你',fn:()=>{log('<p>你望着'+g+'的眼睛，一字一句：「若你不在了，我便踏遍九界，把你的魂寻回来。」'+g+'愣了很久，忽然扑进你怀里，肩膀轻轻发抖。</p>');daoAff(p,5,5,'')}},
      {txt:'😅 笑着岔开：「说什么傻话」',fn:()=>{log('<p>你笑着岔开话题。'+g+'跟着笑了笑，眼底却有一瞬黯淡。</p>');favorChange(p,-1,'生死之问被玩笑带过，道侣暗自失落');p.affinity=clamp((p.affinity||0)-1,0,200)}},
    ]},
    {t:'雪夜，'+g+'捧着一只烤红薯，在洞府外等你。',opts:[
      {txt:'🔥 拉'+g+'进洞府，围炉分食',fn:()=>{log('<p>你把'+g+'拉进洞府，烤红薯掰成两半。'+g+'捧着半只红薯，被热气熏得眉眼弯弯：「甜的。」</p>');daoAff(p,3,3,'')}},
      {txt:'🧣 解下围巾替'+g+'系上',fn:()=>{log('<p>你解下自己的围巾，替'+g+'一圈圈系好。'+g+'整张脸埋在围巾里，只露出一双亮晶晶的眼睛。</p>');daoAff(p,4,4,'')}},
    ]},
    {t:''+g+'偷偷在你枕下放了一枚护身符，被你发现了。',opts:[
      {txt:'💞 收下，贴身佩戴',fn:()=>{S.flag.tongxin=true;addMemory(p,g+'偷偷给我求了护身符');log('<p class="good">你郑重收下那枚护身符，贴身佩戴。'+g+'别过脸去：「寺里的老和尚说，能挡一次灾……你别笑我。」</p>');daoAff(p,5,5,'')}},
      {txt:'🙏 认真道谢，又替'+g+'求了一枚',fn:()=>{log('<p>你谢过'+g+'，隔日悄悄去了同一座山寺，替'+g+'也求了一枚。'+g+'捏着那枚符，看了你很久。</p>');daoAff(p,4,4,'')}},
    ]},
  ];
  const e=pick(evs);
  openEventModal('💞 道侣之事','<p>'+e.t+'</p>',e.opts);
}
