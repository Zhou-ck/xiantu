/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 副业 ================
====================================================== */
'use strict';
/* ================= 副业 ================= */
const PROF_NAMES={alchemy:'炼丹师',forge:'炼器师',talisman:'符箓师',array:'阵法师'};
const PROF_ICON={alchemy:'⚗️',forge:'🔨',talisman:'🪄',array:'🧿'};
const RECIPES={
  alchemy:[
    {name:'回春丹',need:{herb:1},cost:50,dc:14,q:1,eff:'heal',desc:'恢复 60% 气血。'},
    {name:'聚灵丹',need:{herb:2},cost:100,dc:17,q:1,eff:'pill',desc:'30 日修炼效率 ×1.5。'},
    {name:'清心丹',need:{sherb:1,herb:2},cost:120,dc:20,q:2,eff:'clear',desc:'消除全部心魔烙印。'},
    {name:'破境丹',need:{sherb:2,demonCore:1},cost:500,dc:23,q:2,eff:'break',desc:'突破时心性判定 +3。'},
    {name:'洗髓丹',need:{sherb:3,demonCore:2},cost:1000,dc:26,q:3,eff:'root',desc:'灵根资质 +5。'},
    {name:'疗伤丹',need:{herb:2},cost:80,dc:16,q:1,eff:'cure_neijing',desc:'通经活络，愈经脉、筋骨之伤。'},
    {name:'安神丹',need:{sherb:1,herb:1},cost:120,dc:18,q:2,eff:'cure_shenhun',desc:'安魂定神，愈神魂之创。'},
  ],
  forge:[
    {name:'精铁剑',need:{iron:2},cost:100,dc:15,q:1,eff:'weapon2',desc:'灵品法器，攻击 +2。'},
    {name:'护心甲',need:{iron:2,pelt:1},cost:300,dc:19,q:2,eff:'armor3',desc:'宝品防具，防御 +3。'},
    {name:'玄铁重剑',need:{iron:4,demonCore:1},cost:800,dc:23,q:3,eff:'weapon4',desc:'仙品法器，攻击 +4。'},
    {name:'火云剑',need:{iron:3},cost:350,dc:20,q:2,eff:'weapon_fire',desc:'火属性灵剑，攻击 +3，火灵根者用之力增。'},
    {name:'玄冰刃',need:{iron:3,jade:1},cost:500,dc:21,q:2,eff:'weapon_ice',desc:'冰属性寒刃，攻击 +3，水灵根者用之力增。'},
    {name:'庚金剑',need:{iron:4,demonCore:1},cost:900,dc:25,q:3,eff:'weapon_metal',desc:'金气锋锐，攻击 +4，金灵根者用之力增。'},
    {name:'灵犀佩',need:{jade:1,demonCore:1},cost:1200,dc:26,q:4,eff:'trinket3',desc:'神品佩饰，全属性 +1，气运自聚。'},
  ],
  talisman:[
    {name:'火球符',need:{paper:1,cinnabar:1},cost:40,dc:13,q:1,eff:'fire',desc:'战斗中掷出，攻击 +6。'},
    {name:'遁地符',need:{paper:1,cinnabar:2},cost:80,dc:16,q:1,eff:'escape',desc:'遭遇战必定脱身。'},
    {name:'天雷符',need:{paper:2,demonCore:1},cost:400,dc:22,q:3,eff:'thunder',desc:'战斗中掷出，攻击 +12。'},
  ],
  array:[
    {name:'迷踪阵',need:{iron:1,paper:1},cost:200,dc:18,q:2,eff:'maze',desc:'布于周身，探索时可避凶险。'},
    {name:'聚灵阵',need:{iron:2,jade:1},cost:500,dc:22,q:3,eff:'matrix',desc:'布于洞府，修炼效率 ×1.15。'},
    {name:'传送阵',need:{iron:3,jade:2,demonCore:1},cost:1500,dc:28,q:4,eff:'teleport',desc:'御空千里，探索事半功倍。'},
  ],
};
function panelCraft(){
  if(!S.prof){
    const learn='<p>副职业需拜师学艺，或于坊市购得传承玉简（800 灵石）。</p><div class="row">'+
      Object.keys(PROF_NAMES).map((k,i)=>'<button onclick="learnProf(\''+k+'\')">学'+PROF_NAMES[k]+'（800灵石）</button>').join('')+'</div>';
    openPanel('🔧 副业',learn);return;
  }
  const list=RECIPES[S.prof].map((r,i)=>{
    const need=Object.entries(r.need).map(([k,v])=>MAT_NAMES[k]+'×'+v).join('，')||'无';
    return '<div class="item-card"><div class="nm">'+r.name+' <span class="q'+r.q+'">'+QNAMES[r.q]+'</span></div><div class="ds">'+r.desc+'<br>所需：'+need+' · '+r.cost+' 灵石 · 成功率与智慧、造诣相关</div>'+
      '<div style="margin-top:6px"><button class="small" onclick="craft('+i+')">炼制</button></div></div>';
  }).join('');
  const eqHtml=[['weapon','法器',S.weapon],['armor','防具',S.armor],['trinket','佩饰',S.trinket]]
    .filter(([, ,it])=>it)
    .map(([k,nm,it])=>'<div class="item-card"><div class="nm">'+esc(it.name)+' <span class="tag">'+nm+'</span>'+(it.strengthen?' <span class="tag">强化+'+it.strengthen+'</span>':'')+'</div><div class="ds">当前加成：+'+(it.bonus||0)+' · 强化需 灵石150 + 铁矿石×1（智慧判定，失败不降级）</div><div style="margin-top:6px"><button class="small" onclick="forgeStrengthen(\''+k+'\')">⚒️ 强化</button></div></div>').join('');
  const bondHtml='<h4>🔮 本命法宝</h4>'+(S.bond?'<div class="item-card"><div class="nm">'+esc(S.bond.name)+' <span class="tag">Lv.'+S.bond.level+'</span></div><div class="ds">与你的'+elemInfo(S.bond.elem).n+'同根同源 · 战斗攻势 +'+(1+S.bond.level)+'（每破一大境界 +1）</div></div>':(S.realm>=13?'<div class="row"><button class="small primary" onclick="refineBondWeapon()">祭炼本命法宝（妖丹×1 + 寒玉×1 + 500灵）</button></div>':'<p style="color:#6f7a94">金丹期方可祭炼本命法宝。</p>'));
  const ec=elemCraftBonus(S.prof);
  openPanel(PROF_ICON[S.prof]+' '+PROF_NAMES[S.prof]+'（'+S.profLevel+'阶）','<p>⭐ 造诣：'+(S.profLevel*100+S.profExp)+' 经验 · 距下一阶还需 '+(100-S.profExp)+(ec?' · <span class="tag" style="color:#8fd0a0">灵根加成 +'+Math.round(ec*100)+'%</span>':'')+'</p>'+bondHtml+'<h4>📜 丹方 / 图纸</h4>'+list+'<h4>⚒️ 装备强化</h4>'+(eqHtml||'<p style="color:#6f7a94">尚未装备法器/防具/佩饰，先去坊市或秘境弄一件吧。</p>'));
}
function learnProf(k){
  if(S.stones<800){toast('灵石不足');return}
  S.stones-=800;S.prof=k;S.profLevel=1;S.profExp=0;
  toast('习得'+PROF_NAMES[k]);
  panelCraft();
}
function craftBonus(){
  let b=0;
  if(S.prof==='alchemy'&&S.bg.traits.some(t=>t.id==='herb'))b+=2;
  if(S.prof==='talisman'&&S.bg.traits.some(t=>t.id==='scholar'))b+=2;
  if(S.prof==='array'&&S.bg.traits.some(t=>t.id==='scholar'))b+=2;
  if(S.prof==='forge'&&S.bg.traits.some(t=>t.id==='smith'))b+=2;
  if(S.prof==='alchemy'&&S.pet&&S.pet.faint<=0&&S.pet.talent==='alchemy')b+=1;
  if(elemCraftBonus(S.prof))b+=Math.floor(elemCraftBonus(S.prof)*100); /* 8.1 灵根纯度：火炼丹/金炼器/木种药/水制符/土布阵 +15 */
  if(S.flag.dao==='dan')b+=15; /* 丹道问道：炼丹成功率 +15% */
  if(S.flag.caveRooms&&S.flag.caveRooms.dan&&S.prof==='alchemy')b+=4; /* 11 丹房 */
  if(S.flag.caveRooms&&S.flag.caveRooms.qi&&S.prof==='forge')b+=4; /* 11 器坊 */
  return b;
}
function craft(i){
  const r=RECIPES[S.prof][i];
  for(const k in r.need)if((S.mats[k]||0)<r.need[k]){toast('材料不足：'+MAT_NAMES[k]);return}
  if(S.stones<r.cost){toast('灵石不足');return}
  for(const k in r.need)S.mats[k]-=r.need[k];
  S.stones-=r.cost;
  S.flag._crafting=true;
  /* 2M 副业微操：炼丹火候 / 制符连笔（可跳过，跳过=默认结算） */
  if((S.prof==='alchemy'||S.prof==='talisman')&&fxOn()&&(!S.set||!S.set.autoCraft)){
    craftMini(r,i);
    return;
  }
  craftResolve(r,i,0);
}
function craftMini(r,i){
  if(S.prof==='alchemy'){
    openEventModal('⚗️ 炼丹 · 火候微操','<p>丹炉火光跳动，药液翻滚——火候的时机稍纵即逝。</p><p class="sys">「文火温养」稳中求进；「猛火催化」富贵险中求；「看准时机」凭本事吃饭。微操仅影响品质，失败也只会返还一半材料。</p>',[
      {txt:'🔥 文火温养（稳 · 判定 +1）',fn:()=>craftResolve(r,i,1)},
      {txt:'⚡ 猛火催化（赌 · 成败各半）',fn:()=>craftResolve(r,i,chance(0.5)?3:-4)},
      {txt:'🎯 看准时机（智慧判定）',fn:()=>{const R=doRoll('int',14);log('<p>你紧盯炉火，在药液沸腾的刹那掐诀：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');craftResolve(r,i,R.hit?3:-2)}},
      {txt:'🚶 不玩了，照常炼制',fn:()=>craftResolve(r,i,0)},
    ]);
  }else{
    openEventModal('🪄 制符 · 连笔微操','<p>符纸铺开，朱砂砚中漾着灵光——运笔的轻重缓急，全在毫厘之间。</p>',[
      {txt:'✍️ 从容落笔（稳 · 判定 +1）',fn:()=>craftResolve(r,i,1)},
      {txt:'🌀 疾走龙蛇（身法判定）',fn:()=>{const R=doRoll('agi',14);log('<p>你手腕一抖，笔走龙蛇：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');craftResolve(r,i,R.hit?2:-2)}},
      {txt:'🎯 一笔呵成（智慧判定）',fn:()=>{const R=doRoll('int',15);log('<p>你凝神静气，一笔到底：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');craftResolve(r,i,R.hit?4:-4)}},
      {txt:'🚶 不玩了，照常制符',fn:()=>craftResolve(r,i,0)},
    ]);
  }
}
function craftResolve(r,i,mini){
  const R=doRoll('int',r.dc,craftBonus()+(mini||0));
  log('<p>你凝神静气，着手炼制 <b>'+r.name+'</b>：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  if(R.hit){
    if((mini||0)>=3)log('<p class="good">火候拿捏得妙极，炉中灵光暴涨！</p>');
    const qTier=R.t-r.dc>=15?'极品':R.t-r.dc>=10?'上品':R.t-r.dc>=5?'中品':'下品';
    if(r.eff==='heal')addItem({name:'回春丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'heal',sell:60});
    else if(r.eff==='pill')addItem({name:'聚灵丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'pill',sell:120});
    else if(r.eff==='clear')addItem({name:'清心丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'clear',sell:220});
    else if(r.eff==='break')addItem({name:'破境丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'break',sell:420});
    else if(r.eff==='root')addItem({name:'洗髓丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'root',sell:800});
    else if(r.eff==='weapon2')addItem({name:'精铁剑',type:'weapon',quality:r.q,bonus:2,desc:r.desc,sell:160});
    else if(r.eff==='armor3')addItem({name:'护心甲',type:'armor',quality:r.q,bonus:3,desc:r.desc,sell:300});
    else if(r.eff==='weapon4')addItem({name:'玄铁重剑',type:'weapon',quality:r.q,bonus:4,desc:r.desc,sell:700});
    else if(r.eff==='weapon_fire')addItem({name:'火云剑',type:'weapon',quality:r.q,bonus:3,elem:'fire',desc:r.desc,sell:420});
    else if(r.eff==='weapon_ice')addItem({name:'玄冰刃',type:'weapon',quality:r.q,bonus:3,elem:'ice',desc:r.desc,sell:500});
    else if(r.eff==='weapon_metal')addItem({name:'庚金剑',type:'weapon',quality:r.q,bonus:4,elem:'metal',desc:r.desc,sell:750});
    else if(r.eff==='trinket3')addItem({name:'灵犀佩',type:'trinket',quality:r.q,bonus:3,desc:r.desc,sell:1100});
    else if(r.eff==='cure_neijing')addItem({name:'疗伤丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'cure_neijing',sell:240});
    else if(r.eff==='cure_shenhun')addItem({name:'安神丹',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'cure_shenhun',sell:260});
    else if(r.eff==='fire')addItem({name:'火球符',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'fire',sell:40});
    else if(r.eff==='escape')addItem({name:'遁地符',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'escape',sell:90});
    else if(r.eff==='thunder')addItem({name:'天雷符',type:'consumable',quality:r.q,count:1,desc:r.desc,use:'thunder',sell:300});
    else if(r.eff==='maze'){S.flag.maze=true;}
    else if(r.eff==='matrix'){S.flag.matrix=true;}
    else if(r.eff==='teleport'){S.flag.teleport=true;}
    const crafted=S.flag._lastAdded;
    S.flag._crafting=false;
    if(crafted&&r.eff!=='maze'&&r.eff!=='matrix'&&r.eff!=='teleport'){
      applyQuality(crafted,qTier);
      /* 10.5 丹成异象：上品/极品之器，偶有天象相贺 */
      if((qTier==='上品'||qTier==='极品')&&chance(0.3)){
        const isPill=crafted.use;
        if(isPill)log('<p class="loot">丹成异象——'+S.name+'的丹炉上方竟聚起一朵七彩祥云，药香十里可闻！</p>');
        else log('<p class="loot">器成引雷——新铸之器引得一道灵光垂落，宗师气象初显！</p>');
        S.luck=clamp(S.luck+1,1,100);
        log('<p class="good">异象之缘：气运 +1。</p>');
      }
    }
    log('<p class="good">'+PROF_NAMES[S.prof]+'成功！'+(r.eff==='maze'?'你已布下迷踪阵，探索时凶险大减。':r.eff==='matrix'?'聚灵阵成，洞府灵气浓郁，修炼效率提升！':r.eff==='teleport'?'传送阵成，从此可瞬行千里！':'')+'</p>');
    const ga=growAttr('int',0.12,'器物之道，越练越精');
    if(ga)log(ga);
    S.profExp+=rand(15,25);
    if(S.profExp>=100){S.profLevel++;S.profExp-=100;log('<p class="loot">造诣精进！你已是 '+S.profLevel+' 阶'+PROF_NAMES[S.prof]+'。</p>')}
  }else{
    log('<p class="danger">炼制失败，材料毁于一旦。'+(R.fumble?'火焰失控，你险些引火烧身！':'')+'</p>');
    if((mini||0)<=-2){for(const k in r.need)S.mats[k]=(S.mats[k]||0)+Math.ceil(r.need[k]/2);log('<p class="sys">好在抢救及时，一半材料被捞了回来（各返还一半）。</p>')}
    S.profExp+=rand(3,8);
  }
  dC().c.craft++;
  passTime(2);renderAll();
}
/* 10.2 炼丹/炼器品质分级：下/中/上/极品（药效 60/100/140/180%） */
function applyQuality(it,tier){
  const qm={下品:0.6,中品:1.0,上品:1.4,极品:1.8}[tier]||1;
  it.qMult=qm;
  if(tier!=='中品')it.name=it.name+'·'+tier;
  if(tier==='上品')it.quality=Math.min(4,it.quality+1);
  if(tier==='极品')it.quality=Math.min(4,it.quality+2);
  it.desc=(it.desc||'')+'（'+tier+'·药效 ×'+qm.toFixed(1)+'）';
  it.sell=Math.floor((it.sell||50)*qm);
}
function forgeStrengthen(k){
  const it=S[k];
  if(!it){toast('未装备'+({weapon:'法器',armor:'防具',trinket:'佩饰'})[k]);return}
  const lv=it.strengthen||0;
  if(lv>=5){toast('此物已强化至极限（+5）');panelCraft();return}
  if(S.stones<150){toast('灵石不足');return}
  if((S.mats.iron||0)<1){toast('铁矿石不足');return}
  S.stones-=150;S.mats.iron-=1;
  const R=doRoll('int',14+lv*2,craftBonus());
  scene('装备强化');
  log('<p>你于炼器台上淬炼「'+esc(it.name)+'」：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
  /* 12 强化保底：失败累计幸运值，5 次必成（且失败不降级） */
  S.flag.enhancePity=S.flag.enhancePity||0;
  const pityHit=S.flag.enhancePity>=4;
  if(R.hit||pityHit){
    if(pityHit){S.flag.enhancePity=0;log('<p class="good">炼器炉中灵光沸腾——久淬之功，终成大事！</p>')}
    it.bonus=(it.bonus||0)+1;it.strengthen=lv+1;
    log('<p class="good">灵光淬入器身，「'+esc(it.name)+'」强化至 <b>+'+it.strengthen+'</b>（加成 +'+it.bonus+'）。</p>');
    if(it.strengthen===3&&!it.enchant){
      const r=pick([['灼烧','战斗附加灼烧效果'],['破甲','无视部分防御'],['回灵','战后略回气血'],['噬魂','造成伤害少量回血']]);
      it.enchant=r[0];it.enchantDesc=r[1];
      log('<p class="loot">器成生灵！「'+esc(it.name)+'」觉醒词条【'+r[0]+'】——'+r[1]+'。</p>');
    }
  }else{
    log('<p class="danger">器身震颤，淬炼失败。所幸灵材未毁，他日再试。</p>');
    S.flag.enhancePity++;
    if(S.flag.enhancePity<4)log('<p class="sys">炼器幸运值 +1（'+(4-S.flag.enhancePity)+' 次必成）。</p>');
  }
  passTime(2);renderAll();
}
/* 12 本命法宝：金丹后祭炼，随境界成长，战斗附加 */
function refineBondWeapon(){
  if(S.realm<13){toast('金丹期方可祭炼本命法宝');return}
  if(S.bond){toast('已有本命法宝');return}
  if((S.mats.demonCore||0)<1||(S.mats.jade||0)<1||S.stones<500){toast('需妖丹 ×1、寒玉 ×1、灵石 500');return}
  S.mats.demonCore--;S.mats.jade--;S.stones-=500;
  const e=elemInfo(S.rootElem);
  S.bond={name:S.name+'的'+e.n.slice(0,2)+'本命'+'器',elem:S.rootElem,level:1};
  scene('祭炼本命法宝');
  log('<p class="loot">你以心头精血为引，将'+e.i+e.n+'之力注入胚器。'+(S.bond.name)+'嗡鸣大作，与你血脉相连！</p>');
  log('<p class="good">本命法宝成：战斗攻势 +2（每破一大境界再 +1），与你的灵根同根同源。</p>');
  renderAll();
}
