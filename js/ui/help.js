/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 帮助 ================
====================================================== */
'use strict';
/* ================= 帮助 ================= */
function openHelp(){
  openPanel('📚 修仙志',
    '<h4>🔤 字体大小</h4><div class="row"><button class="small" onclick="setFontSize(\'s\')">小</button><button class="small primary" onclick="setFontSize(\'m\')">中</button><button class="small" onclick="setFontSize(\'l\')">大</button></div>'+
    '<h4>境界</h4><p>炼气九层 → 筑基 → 金丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫 → 飞升。筑基起每一大境界分为<b>前期 / 中期 / 后期 / 圆满</b>四重小境：小境之间水磨工夫、修为到了自动晋升；跨大境界则需通过心性判定与天劫，并满足<b>天地门槛</b>（如筑基需筑基丹或完整功法、金丹需妖丹或三场恶战、渡劫需功德达标）。突破面板会列出缺项并给出跳转地点。</p>'+
    '<h4>属性与能力</h4><p>六维（1-20 掷骰）不只是一串数字，每一点都对应实际能力：<b>力量</b>＝攻势与气血；<b>身法</b>＝战斗闪避与探索避险；<b>智慧</b>＝洞察（命中/探索机缘）、副业成功率与悟道之机；<b>魅力</b>＝交谈好感、拜师结缘与宗门接纳；<b>心性</b>＝道心判定与抗心魔；<b>灵根</b>影响修炼速度；气运为隐藏属性，影响机缘。左侧面板「战力构成」可实时查看攻势/闪避/洞察/人望。心魔烙印会压制心性（至多 4 点）。</p>'+
    '<h4>📈 属性成长</h4><p>六维并非生来定死：<b>炼气三层/五层/七层/九层</b>根基渐固各 +1；每破一个大境界指定属性 +1，金丹/化神/合体/渡劫更会天劫淬体、五维齐进。日常行为亦能养性——探索练身法与眼界、血战淬力量、炼丹炼器长智慧、人际双修养魅力、静修养心性、苦修更淬体魄；所修功法也会潜移默化塑造道体。坊市另有锻体丹、轻身丹、通慧丹可伐体开窍。属性越高，成长越慢（上限 40）。</p>'+
    '<h4>🧿 五行灵根</h4><p>每位修士都有<b>五行或变异灵根</b>（金木水火土，及雷/冰/风变异）。灵根决定修行方向：<b>修习同属功法效率 ×1.15</b>，使用同属法器攻势 +1；变异灵根可兼修主属与副属功法。五行相克（金克木、木克土、土克水、水克火、火克金）在战斗中体现为伤害 ×1.25，持克制属性法器打妖族事半功倍。</p>'+
    '<h4>🩸 受伤与疗养</h4><p>战斗失利、凶险遭遇、苦难事件都可能让你受伤：经脉受损（身法-2）、筋骨挫伤（力量-2）、神魂受创（智慧-2）、内伤（气血上限-15%）、道基受损（灵根-8，顽疾）。伤势会随时间自然痊愈，也可<b>服丹</b>（疗伤丹/安神丹/回春丹/洗髓丹）或<b>洞府静养</b>加速康复。身上有伤时，侧栏会以红色标签提示。</p>'+
    '<h4>💞 道侣与恩怨</h4><p>与道侣互动或同游时，可能触发<b>道侣事件</b>：处置得当情缘加深，若伤及对方（致其受伤、言语伤人、护之不及）会<b>降低好感</b>。好感 ≤20 时先入冷战，仍无转圜则姻缘断绝，对方会记恨于你，短期内可能在探索中<b>寻仇</b>；普通角色好感 ≤0 也会交恶成仇。好感可随时间与诚意慢慢挽回，仇视到期自会化解。</p>'+
    '<h4>行动</h4><p>闭关修炼（静修稳妥 / 苦修凶险而速）、外出探索、坊市交易、宗门任务、人际往来、副业炼制、突破境界、洞府休整。也可在输入栏自由输入行动（如「修炼100天」「苦修90天」「探索」）。</p><p>「闭关修炼」会弹出<b>修炼窗口</b>：修炼按真实时间缓缓推进，进度条实时可见；途中可能遇到灵气潮汐、仙人点化、心魔低语等异动，需当场做出抉择；可随时「提前出关」按已完成进度结算。有<b>道侣</b>时可在窗口中切换「双人同修」，道侣会入镜相伴、同修共进，情缘也会随之加深。</p>'+
    '<h4>🏯 宗门</h4><p>入门后由传功弟子引路授法，可接任务、拜师、兑换、祈福、领月俸。宗门有两种贡献：<b>贡献点</b>专用于晋升（外门→内门→核心→真传→长老→宗主），需境界与贡献点双达标；<b>贡献值</b>专用于宗门宝库兑换丹药功法材料——兑换只花贡献值，绝不扣贡献点，地位不会因购物下降。拜师需先入内门并赢得长老好感（≥65），得授本门功法，成为亲传弟子。</p>'+
    '<h4>🤝 人际与道侣</h4><p>相识之人各有修为与性情：可<b>交谈</b>（聊其擅长话题）、<b>请教</b>（高境界者指点修为）、<b>赠礼</b>（投其所好获益更丰）、<b>切磋</b>、<b>结伴同行</b>（战斗与探索获得照应）。情缘讲究阴阳相济：异性好感 <b>≥60</b> 可结为红颜/蓝颜（暧昧），<b>≥85</b> 且无道侣方可表白结为道侣，表白失败会伤情缘；同性则可<b>义结金兰</b>，成为过命之交。道侣之外可有暧昧若干，但暧昧越多，越易触发<b>修罗场</b>（争风吃醋、情感抉择）——处置不当，多方好感尽失，甚至种下情劫。</p>'+
    '<h4>🏡 洞府</h4><p>洞府是你在山中的道场：可休整回气、开垦<b>灵田</b>种植灵草/灵参/朱果（自然流逝时间成熟）、参悟<b>功法</b>（每重提升修炼效率 5%）、每季焚香求<b>天机签</b>。<b>修炼托管台</b>可自动托管：免费效率 40%，投入灵石/聚灵丹/千年灵乳可加速至 65%-105%；亦可设定<b>境界目标</b>，修为攒够自动停转。托管途中异动可「暂存待处理」，出关前统一抉择。</p>'+
    '<h4>🧗 试炼塔与强化</h4><p>炼气三层后可在「探索」中挑战试炼塔：一层一关，每五层有统领，奖励随层数递增，通关 10 层获称号「试炼英杰」。副业「炼器」中可消耗灵石与铁矿石强化已装备的法器/防具/佩饰（最高 +5，失败不降级）。</p>'+
    '<h4>⏳ 离线修行</h4><p>关闭页面后，角色会继续打坐——再上线时按真实离线时长结算修为（效率为在线 40%，上限 12 小时）。安心休息，仙途自进。</p>'+
    '<h4>📅 每日修行</h4><p>每日与每周都有修行任务：闭关修炼、外出探索、斩妖除魔、与人交谈、宗门任务、副业炼制，达标即自动领取奖励，无需手动操作；灵石奖励随境界上浮，是长线成长的稳定来源。点头部「任务」或左侧「每日任务」卡片可查看全部进度。</p>'+
    '<h4>✨ 新人加成</h4><p>炼气三层之前，闭关修炼效率额外 +20%，助你平稳度过最开始的岁月。心性不足也不必慌张：突破面板会标明缺口并给出跳转地点，静修、静心养神、论道、听经皆可养道心。</p>'+
    '<h4>💾 存档安全</h4><p>每次保存都会自动保留上一份内容作为备份；若主存档意外损坏，读取时会自动从备份恢复，进度不会轻易丢失。</p>'+
    '<h4>修炼收益递减</h4><p>连续闭关超过 60 日后，每多 30 日修炼收益再降 10%，最低仅剩 40%——一味闭门苦修只会事倍功半。外出探索、访友、办事可重置此状态；机缘与顿悟往往在天地之间。</p>'+
    '<h4>⚓ 瓶颈 · 悟性 · 历练</h4><p>修为达到下一境界所需 <b>90%</b> 后，会进入<b>瓶颈期</b>：闭关效率降至 ×0.6，直至<b>悟性</b>与<b>历练</b>双双达标（需求随境界增长）。悟性出自<b>功法参悟、读书抄经、静心养神、师尊请教/传功、突破</b>；历练出自<b>探索、试炼塔、战斗、秘境</b>。右侧面板实时显示两者进度——遇瓶颈别硬闭关，去悟、去行，瓶颈自破。</p>'+
    '<h4>💱 修为结算</h4><p>突破成功后会<b>扣除所耗修为门槛</b>（如炼气三层需 100 修为，突破后从 0 重新积累），余量结转至新境界——修为统计永远显示「当前境界进度」，不再累加，避免「一路闭关到顶」。</p>'+
    '<h4>👨‍👩‍👧 家族</h4><p>结缡道侣后可「共商子嗣」诞下血脉；子嗣培养在<b>更多 → 家族</b>独立页面（传功 / 历练 / 长大），不再埋没于仙途录。身陨时可「转生为子嗣」，血脉与家名得以延续。</p>'+
    '<h4>🤖 AI 叙事辅助</h4><p>设置页可接入<b>兼容 OpenAI 格式</b>的中转站（基址 + Key + 模型名，仅存本地）。接入后：自由输入会先经 AI 理解意图并润色叙事，NPC 对话更贴合人设；<b>不填也完全可玩</b>——所有功能自动走本地规则版，AI 只写故事、不碰数值。网络失败会自动回退，不会卡住游戏。</p>'+
    '<h4>📜 天机签</h4><p>「休整」面板可每季焚香求一签。上上签利探索、武运签助战、静心签益道心、财运签惠买卖、精进签养修为；劫数签与忧思签则凶中藏机。季换签消。</p>'+
    '<h4>新手</h4><p>左侧「新手任务」是入门指引，完成可得灵石、草药与丹药。第一段仙途：修炼攒修为 → 突破炼气 → 探索攒资源 → 加入宗门。</p>'+
    '<h4>心魔与涤除</h4><p>心魔会压制心性（至多 4 点）并偶尔作祟。涤除之法：服<b>清心丹</b>（坊市 200 灵石或炼丹）、闭关【静心养神】30 日（养道心，若有心魔可消一道）、筑基后【心魔历练】成功消一道且心性+1；大境界突破时道心升华也会自消一道。</p>'+
    '<h4>🧘 心性成长</h4><p>道心可磨砺而进：<b>静修/苦修</b>日久见功、<b>静心养神</b>涤尘养道、参加<b>论道大会</b>、听<b>苦行僧讲经</b>、品<b>悟道茶</b>、闯<b>心魔历练</b>，以及每一次<b>大境界突破</b>都会滋养心性。心性越高，成长越慢，但勤修必有所得（上限 40）。</p>'+
    '<h4>🐾 灵兽</h4><p>坊市奇珍拍卖或机缘中可得兽卵，在<b>行囊</b>中使用孵化。灵兽有六种天赋（机缘/战斗/寻药/迅捷/丹道/灵根），在<b>人际</b>面板可喂食、放养历练升级进化，战斗时自动助战。</p>'+
    '<h4>⚖️ 功德与善恶</h4><p>功德与业力均为<b>显性数值</b>，侧栏常驻显示，并合成「善恶值」（功德-业力，-100~+100）。功德可弱天劫、增机缘、得称号；业力催动魔道功法、招致心魔、加重天劫。行善积德，道途自宽。</p>'+
    '<h4>🎏 节日</h4><p>按游戏内年份，每年会有<b>春节</b>（年关集市）、<b>七夕</b>（情缘之夜，情缘互动加成 10 日）、<b>中元</b>（鬼门开，超度积德或涉险探幽）、<b>中秋</b>（月宫异象，拜月悟道）。各随缘法，去留由你。</p>'+
    '<h4>🧒 道统传承</h4><p><b>化神期</b>后可在「人际」中收徒（最多三人），传功、指点、历练皆可养徒。身陨之时，若门下有人，可<b>转生为弟子</b>——功法与半数功德业力随道统传续，香火不灭。</p>'+
    '<h4>⚔️ 战术与称号</h4><p>战斗前可选抢攻/稳健/龟守/搏命四种战术；达成成就可获得称号（如初露锋芒、秘境行者、富甲一方），称号附带永久增益。</p>'+
    '<h4>⚔️ 战技参悟</h4><p>胜战可得<b>战意</b>（守关 BOSS 更多），在「修炼 → 战技参悟」点化永久战斗之技：破军诀强攻、游龙身法避危、玄龟御体减伤、百战通神缩短功法技能间隔。战技与境界成长叠加，以战悟道，越战越强。</p>'+
    '<h4>📖 论道台</h4><p>「修炼 → 论道台」可与相识道友或师尊三题辩道（义理/道心/处世），胜两题即胜。灵根相生或同属者<b>道韵共鸣</b>：判定 +2、论道点双得、收益更丰。论道点可「以论入道」兑换悟道。</p>'+
    '<h4>🧿 真元</h4><p>真元是修行法力，随休整、静心养神与时光恢复。消耗 30 真元可「真元淬体」换修为，或在副业选材时「以真元控火」提升炼制判定。</p>'+
    '<h4>📖 收藏图鉴</h4><p>仙途录「收藏图鉴」记录你获得过的物品、遭遇过的敌人与本门配方；收集达到里程碑（物品/敌人/配方数量）可领灵石、气运与悟道奖励。</p>'+
    '<h4>🌊 妖潮守卫战</h4><p>年度妖兽潮现为三波守城战：先布置（拒马符阵/鼓舞村民），再逐波迎战妖狼群、妖豹群与妖潮首领，可随时见好就收；全胜扬名立万，溃败亦有代价，战绩记入行迹图鉴。</p>'+
    '<h4>🏗️ 自建宗门</h4><p>开宗立派后可营造九种宗门建筑：灵田增收获、丹房/器坊/符阁/阵台增对应副业判定、藏经阁提修炼、演武场提战斗、灵兽园助灵兽成长、会客厅涨人际好感——建筑加成真实生效。</p>'+
    '<h4>⚒️ 副业交互</h4><p>炼丹、炼器、制符、布阵皆有「选材 → 微操」两段式：选材可<b>加料提纯</b>（品质 +2 档，需对应稀有材料）或<b>以妖丹引灵</b>（判定 +3）；微操各具特色——丹看火候、器看锻打、符看连笔、阵看引灵，凭本事赚品质。不喜微操可在「设置 → 副业微操」切为自动，照常结算。</p>'+
    '<h4>凶险</h4><p>探索中暗藏死亡选项，心魔积累会压制心性。寿元耗尽即身陨。身陨后可转世重生，保留一线灵光。</p>'+
    '<h4>多结局</h4><p>飞升成仙、堕入魔道、宗门之主、散修大能、身陨道消……关键抉择将引向不同终局。每年亦会有妖潮、论道、秘境等大事发生。</p>'+
    '<h4>💾 存档</h4><p>共 3 个存档位，点头部「存档」可存入或读取；游戏过程中的操作会自动存入当前存档位。</p>'+
    '<p style="font-size:12.5px;color:#6f7a94">提示：点「行囊」查看并使用物品；「人际」可照料灵兽；头部「仙途录」可查看称号、图鉴与生平；手机端点「状态」展开属性面板。</p>');
}
/* ===== 收藏图鉴：物品/敌人/配方 收集册 + 里程碑（仙途录深化） ===== */
const ATLAS_MILES=[
  {k:'item',n:15,t:'博物初成',g:()=>{S.stones+=200;return '灵石 +200'}},
  {k:'item',n:30,t:'藏珍渐丰',g:()=>{S.luck=clamp(S.luck+1,1,100);return '气运 +1'}},
  {k:'item',n:45,t:'万宝入藏',g:()=>{S.flag.insights=(S.flag.insights||0)+1;S.stones+=500;return '悟道 +1 · 灵石 +500'}},
  {k:'enemy',n:10,t:'初窥妖邪',g:()=>{S.flag.insights=(S.flag.insights||0)+1;return '悟道 +1'}},
  {k:'enemy',n:20,t:'百战知敌',g:()=>{S.luck=clamp(S.luck+1,1,100);return '气运 +1'}},
  {k:'enemy',n:30,t:'见惯妖邪',g:()=>{S.luck=clamp(S.luck+1,1,100);S.stones+=300;return '气运 +1 · 灵石 +300'}},
  {k:'recipe',n:3,t:'小试牛刀',g:()=>{S.stones+=200;return '灵石 +200'}},
  {k:'recipe',n:5,t:'炉火纯青',g:()=>{S.luck=clamp(S.luck+1,1,100);return '气运 +1'}},
  {k:'recipe',n:7,t:'一业通神',g:()=>{S.flag.insights=(S.flag.insights||0)+1;S.stones+=300;return '悟道 +1 · 灵石 +300'}},
];
function atlasItemQuality(name){
  const m=(typeof MARKET_ITEMS!=='undefined')?MARKET_ITEMS.find(x=>x.name===name):null;
  if(m&&m.quality!=null)return m.quality;
  if(typeof RECIPES!=='undefined')for(const prof in RECIPES){const r=RECIPES[prof].find(x=>x.name===name);if(r)return r.q;}
  return null;
}
function atlasRecipeCount(){
  const prof=S&&S.prof?S.prof:'alchemy';
  return (RECIPES[prof]||[]).filter(r=>recipeKnown(r)).length;
}
function atlasCounts(){
  return {items:Object.keys(S.seenI||{}).length,enemies:Object.keys(S.seenE||{}).length,recipes:atlasRecipeCount()};
}
function checkAtlasMiles(){
  if(!S)return;
  const c=atlasCounts();
  S.flag.atlasMiles=S.flag.atlasMiles||[];
  const names={item:'物品',enemy:'敌人',recipe:'配方'};
  for(const m of ATLAS_MILES){
    const val=m.k==='item'?c.items:m.k==='enemy'?c.enemies:c.recipes;
    const key=m.k+':'+m.n;
    if(val>=m.n&&S.flag.atlasMiles.indexOf(key)<0){
      S.flag.atlasMiles.push(key);
      let r='';try{r=m.g()}catch(e){}
      log('<p class="loot">📖 收集里程碑「'+m.t+'」达成（'+names[m.k]+' '+val+'）：'+r+'。</p>');
    }
  }
}
function collectionAtlas(){
  if(!S){toast('尚未踏入仙途');return}
  const c=atlasCounts();
  const itemRows=Object.keys(S.seenI||{}).sort().map(nm=>{
    const q=atlasItemQuality(nm);
    const meta=(typeof itemCatalog==='function'&&itemCatalog()[nm])||{};
    return '<div class="tome-cell atlas-item qc'+(q!=null?clamp(q,0,4):0)+'">'+
      '<span class="ai-ico">'+itemIcon({name:nm,type:meta.type})+'</span>'+
      '<b>'+esc(nm)+'</b><span>'+(q!=null?('<span class="q'+q+'">'+QNAMES[q]+'</span> '):'')+'×'+(S.seenI[nm])+'</span></div>';
  }).join('');
  const enemyRows=Object.keys(S.seenE||{}).sort().map(nm=>{
    const art=(typeof ENEMY_ART!=='undefined'&&ENEMY_ART[nm])||'';
    return '<div class="tome-cell atlas-enemy'+(art?' has-art':'')+'">'+(art?'<img class="ae-img" src="'+art+'" alt="" loading="lazy">':'<span class="ae-emoji">👹</span>')+'<b>'+esc(nm)+'</b><span>击退 ×'+(S.seenE[nm])+'</span></div>';
  }).join('');
  const prof=RECIPES[S.prof||'alchemy']||[];
  const mastered=atlasRecipeCount();
  const recipeRows=prof.map(r=>'<div class="tome-cell atlas-item qc'+(r.q!=null?clamp(r.q,0,4):0)+(recipeKnown(r)?'':' locked')+'">'+(recipeKnown(r)?'✅':'🔒')+'<span class="ai-ico">'+(typeof PROF_ICON!=='undefined'?(PROF_ICON[S.prof]||'⚗️'):'⚗️')+'</span><b>'+esc(r.name)+'</b><span>'+(r.lv||1)+'阶</span></div>').join('');
  const milesHtml=ATLAS_MILES.map(m=>{
    const val=m.k==='item'?c.items:m.k==='enemy'?c.enemies:c.recipes;
    const got=(S.flag.atlasMiles||[]).indexOf(m.k+':'+m.n)>=0;
    return '<div class="bd-row'+(got?' ok':'')+'"><span>'+(got?'✅ ':'🔒 ')+m.t+'（'+{item:'物品',enemy:'敌人',recipe:'配方'}[m.k]+' '+m.n+'）</span></div>';
  }).join('');
  const totalItems=typeof itemCatalog==='function'?Object.keys(itemCatalog()).length:0;
  openPanel('📖 收藏图鉴',
    '<p>天地万物，皆可入藏。收集图鉴，亦是一条证道之路。</p>'+
    '<div class="bd-box"><div class="bd-head">🧭 收集进度</div>'+
    '<div class="bd-row"><span>🎒 物品</span><b>'+c.items+' / '+totalItems+' 种</b></div>'+
    '<div class="bar" style="height:6px;margin:2px 0 8px"><i style="width:'+Math.floor(Math.min(1,c.items/Math.max(1,totalItems))*100)+'%"></i></div>'+
    '<div class="bd-row"><span>👹 敌人</span><b>'+c.enemies+' 类</b></div>'+
    '<div class="bd-row"><span>📜 配方（'+PROF_NAMES[S.prof||'alchemy']+'）</span><b>'+mastered+' / '+prof.length+'</b></div>'+
    '<div class="bar" style="height:6px;margin:2px 0 0"><i style="width:'+Math.floor(Math.min(1,mastered/Math.max(1,prof.length))*100)+'%"></i></div></div>'+
    (S.prof?'<h4>📜 配方册</h4><div class="tome-grid">'+(recipeRows||'无')+'</div>':'')+
    '<div class="row" style="margin-top:8px"><button class="small primary" onclick="panelDanJing()">📜 丹经（丹药图鉴 · 丹毒 '+(S.flag.danTox||0)+'/100）</button></div>'+
    '<h4>🎒 物品册（已获 '+c.items+' 种）</h4><div class="tome-grid">'+(itemRows||'<p style="color:#6f7a94">尚未获得任何物品。</p>')+'</div>'+
    '<h4>👹 敌人册（已见 '+c.enemies+' 类）</h4><div class="tome-grid">'+(enemyRows||'<p style="color:#6f7a94">尚未遭遇任何敌人。</p>')+'</div>'+
    '<h4>🏁 收集里程碑</h4>'+milesHtml);
}
/* ===== 生涯统计墙：十八系统计数总览 ===== */
function careerWall(){
  if(!S)return;
  const stat=(a,b)=>'<div class="stat-cell"><b>'+b+'</b><span>'+a+'</span></div>';
  const box=(icon,title,cells)=>'<div class="bd-box"><div class="bd-head">'+icon+' '+title+'</div><div class="stat-grid">'+cells.join('')+'</div></div>';
  const npcTalks=(S.npcs||[]).reduce((a,n)=>a+(n.talks||0),0);
  const maxBond=(S.npcs||[]).reduce((a,n)=>Math.max(a,(n.bond||0)),0);
  const craftTotal=Object.values(S.flag.craftLog||{}).reduce((a,x)=>a+(x.count||0),0);
  const techSum=Object.values((S.flag.tech&&S.flag.tech.ups)||{}).reduce((a,b)=>a+b,0);
  const boxes=[
    box('🧘','修炼',[stat('闭关总日数',(S.flag.cultDaysTotal||0)+' 日'),stat('悟道',(S.flag.insights||0)+' 次'),stat('大境界突破',(S.flag.bigBreaks||0)+' 次'),stat('瓶颈破关',(S.flag.bottleneckBreaks||0)+' 次'),stat('渡劫感悟',(S.insight||0)+' 点')]),
    box('🧭','历练',[stat('探索',(S.flag.exploreCount||0)+' 次'),stat('秘境',(S.flag.dungeons||0)+' 座 · '+Object.keys(S.flag.dungeonDone||{}).length+' 类'),stat('试炼塔',(S.flag.tower||0)+' 层'),stat('妖潮守城',(S.flag.tideWins||0)+' 胜 · '+(S.flag.tideFails||0)+' 负')]),
    box('⚔️','战斗',[stat('击杀',(S.kills||0)+' 名'),stat('胜利',(S.wins||0)+' 场'),stat('战意',((S.flag.tech&&S.flag.tech.pts)||0)+' 点'),stat('战技',techSum+' 级')]),
    box('🤝','人际',[stat('道侣',(S.flag.partnerCount||0)+' 位'),stat('双修',(S.flag.dualCount||0)+' 次 · '+(S.flag.dualDays||0)+' 日'),stat('交谈',npcTalks+' 次'),stat('羁绊最深',maxBond+' 点'),stat('论道',(S.flag.daolunWins||0)+' 胜 · '+(S.flag.daolunLosses||0)+' 负')]),
    box('🏯','宗门',[stat('门中事宜',(S.flag.sectEvents||0)+' 件'),stat('宗门任务',(S.flag.sectTasks||0)+' 次')]),
    box('⚒️','副业',[stat('当前副业',S.prof?(PROF_NAMES[S.prof]+' '+S.profLevel+' 阶'):'未习得'),stat('炼制成功',craftTotal+' 件'),stat('装备强化',(S.flag.enhanceCount||0)+' 次')]),
    box('📖','收藏',[stat('物品',Object.keys(S.seenI||{}).length+' 种'),stat('敌人',Object.keys(S.seenE||{}).length+' 类'),stat('称号',(S.titles||[]).length+' 个'),stat('已证结局',(S.endings||[]).length+' 个'),stat('轮回',(S.rebirths||0)+' 世')]),
    box('⚖️','善恶',[stat('功德',(S.merit||0)+' 点'),stat('业力',(S.karma||0)+' 点'),stat('善恶值',netMerit())]),
  ];
  openPanel('📊 生涯统计','<p>数十年仙途，皆在这一卷之中。</p>'+boxes.join(''));
}
/* ===== 天下大势：时代 / 声望格局 / 世界纪事 ===== */
function worldPanel(){
  if(!S)return;
  const sec=(a,b)=>'<div class="bd-row"><span>'+a+'</span><b>'+b+'</b></div>';
  const fm=S.fame||{};
  const eraDone=Object.keys(S.flag.eraDone||{}).length;
  const log=(S.flag.worldLog||[]).map(l=>'<div class="bd-row"><span>'+esc(l.t)+'</span><b>第 '+l.y+' 年</b></div>').join('');
  openPanel('🌍 天下大势',
    '<p>天地为局，众生为棋。你既是棋手，也是棋子。</p>'+
    '<div class="bd-box"><div class="bd-head">🕰️ 时代</div>'+sec('年代',Math.floor(S.years)+' 年')+sec('时代主线',eraDone+' / '+(typeof ERAS!=='undefined'?ERAS.length:5)+' 已推进')+'</div>'+
    '<div class="bd-box"><div class="bd-head">⚖️ 声望格局</div>'+sec('正道声望',fm.zheng||0)+sec('魔道声望',fm.mo||0)+sec('散修声望',fm.san||0)+sec('宗门',S.sect?esc(S.sect.name):'无门无派')+'</div>'+
    '<div class="bd-box"><div class="bd-head">🌊 妖潮守城</div>'+sec('战绩',(S.flag.tideWins||0)+' 胜 · '+(S.flag.tideFails||0)+' 负')+'</div>'+
    '<div class="bd-box"><div class="bd-head">📜 天下大事纪</div>'+(log||'<p style="color:#6f7a94">尚无天下大事可载。</p>')+'</div>');
}
/* 16.4 可访问性：字体缩放（记忆于本地） */
function applyFont(){
  try{
    const f=localStorage.getItem('xt_font')||'m';
    const map={s:'0.9em',m:'1em',l:'1.12em'};
    document.body.style.fontSize=map[f]||'1em';
  }catch(e){}
}
function setFontSize(k){
  try{localStorage.setItem('xt_font',k)}catch(e){}
  applyFont();
  toast('字体已调整');
}
function openTome(){
  const s=S;
  const sc=(a,b)=>'<div class="stat-cell"><b>'+b+'</b><span>'+a+'</span></div>';
  const stats='<h4>生平</h4><div class="stat-grid">'+
    sc('境界',REALMS[s.realm])+sc('年岁',Math.floor(s.years)+' 载')+sc('击杀',s.kills)+sc('轮回',s.rebirths+' 世')+
    sc('秘境',(s.flag.dungeons||0)+' 座')+sc('心魔',s.heartDemons+' 道')+sc('功德',s.merit)+sc('业力',s.karma)+
    (s.sect?sc('门派',esc(s.sect.name)):'')+'</div>'+
    '<p style="font-size:12.5px;color:#a99a72">2S 生涯：总修炼 '+(s.flag.cultDaysTotal||0)+' 日 · 奇遇 '+(s.flag.exploreCount||0)+' 次 · 道侣 '+(s.flag.partnerCount||0)+' 位 · 速通计时 '+Math.floor(s.days-(s.flag.speedStart||0))+' 日'+(s.flag.seed?' · 本局种子 '+s.flag.seed:'')+'</p>';
  const personaHtml=(s.persona?personaTomeHtml():'');
  const ends=s.endings.length?'<h4>已证结局</h4><div class="chip-row">'+s.endings.map(e=>'<span class="chip end-chip">'+esc(e)+'</span>').join('')+'</div>':'';
  const mem=s.memories.length?'<h4>前世记忆</h4><div class="chip-row">'+s.memories.map(m=>'<span class="chip mem-chip">'+esc(m)+'</span>').join('')+'</div>':'';
  const titles=s.titles.length?'<h4>🏅 称号</h4><div class="title-wall">'+s.titles.map(id=>{const t=TITLES.find(x=>x.id===id);return t?'<span class="title-badge">🏅 '+esc(t.name)+'</span>':''}).filter(Boolean).join('')+'</div>':'<h4>🏅 称号</h4><p style="color:#6f7a94">尚未获得称号</p>';
  const petHtml=s.pet?'<h4>🐾 灵兽</h4><p>'+esc(s.pet.species+'「'+s.pet.name+'」')+' · '+s.pet.level+'级 · '+s.pet.form+'阶 · '+PET_TALENT_DESC[s.pet.talent]+'</p>':'';
  const atlas='<h4>📖 图鉴 · 生涯 · 天下</h4><div class="row"><button class="small primary" onclick="collectionAtlas()">📖 收藏图鉴（物品 '+Object.keys(s.seenI||{}).length+' · 敌人 '+Object.keys(s.seenE||{}).length+'）</button><button class="small" onclick="careerWall()">📊 生涯</button><button class="small" onclick="worldPanel()">🌍 天下</button></div>';
  const sectHtml=s.sect?'<h4>🏯 宗门</h4>'+artImg(SECT_ART[s.sect.id],0,0,'sect-banner')+'<p>'+esc(s.sect.name)+' · '+esc(secRank(s))+'</p>':'';
  const ppl=s.npcs.map((n,i)=>'<div class="tome-cell" onclick="npcProfile('+i+')">'+artImg(NPC_ART[n.role],64,64,'tome')+esc(n.name)+'<br><span>'+esc(n.role)+'</span></div>').join('');
  const pplHtml=ppl?'<h4>👥 人物志 <button class="small" onclick="relationWeb()">🕸️ 关系图谱</button></h4><div class="tome-grid">'+ppl+'</div>':'';
  const marks=[['dreamDone','上古残梦 · 因果了却'],['foeAmbush','仇家现身'],['matrix','聚灵阵'],['maze','迷踪阵'],['teleport','传送阵']].filter(([k])=>s.flag[k]).map(([,n])=>n);
  const flagHtml=(marks.length?'<h4>因果印记</h4><div class="chip-row">'+marks.map(m=>'<span class="chip flag-chip">'+esc(m)+'</span>').join('')+'</div>':'')+(typeof foreshadowHtml==='function'?foreshadowHtml():'');
  const recHtml='<h4>🏆 本机纪录</h4>'+recordsHtml();
  const famHtml=(S.children&&S.children.length)?'<h4>🏮 家族</h4>'+childrenHtml():'';
  openPanel('📖 仙途录','<div class="row" style="margin-bottom:8px"><button class="small primary" onclick="daoPathPage()">🗺️ 道途 · 下一步做什么</button><button class="small" onclick="titleWall()">🏅 称号墙</button></div>'+stats+personaHtml+sectHtml+titles+petHtml+atlas+pplHtml+famHtml+ends+mem+flagHtml+causeHtml()+recHtml+'<p style="font-size:12.5px;color:#6f7a94">仙途漫漫，一念之差便是不同结局。仙途录将记下你这一世的足迹。</p>');
}
/* 2O 因果图谱：NPC 记忆与未了之缘 */
function causeHtml(){
  if(!S)return '';
  const memCount=S.npcs.reduce((a,n)=>a+((n.nmem||[]).length||0),0);
  if(!memCount&&!(S.flag.foreshadow||[]).length)return '';
  return '<h4>🕸️ 因果图谱</h4><p style="font-size:12.5px;color:#8f9cb8">'+
    (memCount?'江湖中 <b>'+memCount+' 段</b>与你有关的记忆仍在流转（报恩、寻仇、见证）。<br>':'')+
    ((S.flag.foreshadow||[]).length?'未了伏笔 <b>'+S.flag.foreshadow.length+' 桩</b>。':'')+
    '</p>';
}
/* 2S 称号墙：全部称号分栏展示 + 获得状态 */
function titleWall(){
  const got=S.titles||[];
  const html=TITLES.map(t=>'<div class="tome-cell'+(got.indexOf(t.id)>=0?'':' locked')+'">'+(got.indexOf(t.id)>=0?'🏅':'🔒')+'<br><b>'+esc(t.name)+'</b><br><span>'+(got.indexOf(t.id)>=0?'已获得':'未获得')+'</span></div>').join('');
  openPanel('🏅 称号墙','<p>共 '+TITLES.length+' 个称号，收集它们，为仙途留下印记。</p><div class="tome-grid">'+html+'</div>');
}
/* 2A 道心页：性格标签 + 道心刻度（漂移可视化）+ 处世加成 */
function personaTomeHtml(){
  const p=S.persona;
  if(!p)return '';
  const d=p.drift||0;
  const [dn,dc]=driftLabel(d);
  const bar='<div style="height:8px;border-radius:4px;background:linear-gradient(90deg,#d96a6a,#c9c39a,#8fd0a0);position:relative"><div style="position:absolute;left:'+(50+d/2)+'%;top:-2px;width:4px;height:12px;background:#fff;border-radius:2px"></div></div>';
  return '<h4>🧭 道心 · 性格</h4><p>生性：<b>'+esc(p.name)+'</b>（'+p.tags.map(esc).join('·')+'）<br>口头禅：「'+esc(personaLine(p))+'」<br>处世加成：'+(p.bonus?Object.keys(p.bonus).map(k=>ATTR_NAMES[k]+'+'+p.bonus[k]).join('、'):'无')+'</p>'+
    '<p style="font-size:12.5px;color:#a99a72">道心刻度（行善向右、作恶向左，影响天劫与心魔）：<b style="color:'+dc+'">'+dn+'</b>（'+d+'）</p>'+bar;
}
/* 2U NPC 档案卡：立绘 + 性格标签 + 口头禅 + 喜好 + 关系网 + 隐藏心结（好感≥70 解锁） */
function npcProfile(i){
  const n=S.npcs[i];
  if(!n)return;
  openEventModal('📜 人物档案 · '+esc(n.name),characterCardHtml(n,{npc:true}),[
    {txt:'💬 找'+he(n)+'聊聊',fn:()=>npcChat(i)},
    {txt:'🚶 就此别过',fn:()=>{renderAll()}},
  ]);
}
/* 2N 道途页：短中长三层目标，全部可点击跳转 */
function daoPathPage(){
  const s=S;
  if(!s)return;
  const goal=karmaGoal();
  const goalCard=goal?'<div class="item-card"><div class="nm">'+goal.i+' 前世执念 · '+esc(goal.n)+'</div><div class="ds">'+esc(goal.desc)+'</div><div class="bd-row"><span>进度</span><b>'+(karmaGoalProgress()||(karmaGoalMet()?'已达成 ✓':'未达成'))+'</b></div></div>':'';
  const pathStats='<div class="item-card"><div class="nm">🗺️ 道途统计</div><div class="ds">'+
    '流派：'+(s.flag&&s.flag.flowChoice&&FLOW_DEFS[s.flag.flowChoice]?FLOW_DEFS[s.flag.flowChoice].n:(s.flag&&s.flag.dao?({sword:'剑道',dan:'丹道',array:'阵道',dark:'魔道',free:'逍遥道'}[s.flag.dao]||s.flag.dao):'未择道'))+
    ' · 主线 '+(s.quest&&s.quest.main?(s.quest.main.chDone||[]).length+'/'+MAIN_STORY.length+' 章':'0 章')+
    ' · 支线 '+(s.quest&&s.quest.side?Object.keys(s.quest.side).filter(k=>s.quest.side[k]==='done').length:0)+'/'+SIDE_QUESTS.length+
    ' · 保命 '+(s.flag&&s.flag.lifeSaves||0)+' 次 · 因果 '+(s.flag&&s.flag.foreshadow?s.flag.foreshadow.length:0)+' 桩</div></div>';
  const nxt=s.realm+1;
  const needCult=nxt<THRESHOLDS.length?THRESHOLDS[nxt]-s.cult:0;
  const cur=[];
  if(needCult>0)cur.push({t:'积累修为（还差 '+needCult+'）',d:'闭关修炼 / 探索历练 / 双修 / 丹药',go:'panelCult()'});
  if(isBigBreak(nxt)&&effWil(S)<WIL_REQ[nxt])cur.push({t:'提升心性（还差 '+(WIL_REQ[nxt]-effWil(S))+'）',d:'静心养神 / 读书抄经 / 清心丹',go:'panelRest()'});
  if(isBigBreak(nxt)&&nxt>=13)cur.push({t:'备渡劫道具',d:'天雷符 / 清心丹 / 功德清光',go:'panelMarket()'});
  if(!s.sect&&s.realm>=4)cur.push({t:'拜入宗门',d:'月俸、任务、功法传承',go:'panelSect()'});
  if(s.heartDemons>0)cur.push({t:'涤除心魔（'+s.heartDemons+' 道）',d:'清心丹 / 静心养神 / 心魔历练',go:'panelMarket()'});
  if(!s.daoPartner&&s.realm>=4&&s.npcs.some(n=>n.met&&!n.foe&&n.favor>=60))cur.push({t:'求结道侣',d:'好感 ≥85 可表白，≥60 可暧昧',go:'panelSocial()'});
  if(!cur.length)cur.push({t:'修为已足，冲击下一境界',d:'准备心性与渡劫道具后突破',go:'panelCult()'});
  const mid=[];
  if(s.realm<13)mid.push({t:'凝成金丹',d:'金丹期解锁功法技能与守关遗宝',go:'panelCult()'});
  if(!s.daoPartner)mid.push({t:'结下一段道侣缘分',d:'培养好感、约会、双修',go:'panelSocial()'});
  if(!s.prof)mid.push({t:'学一门副业',d:'炼丹 / 炼器 / 制符 / 布阵',go:'panelCraft()'});
  if(s.realm<21)mid.push({t:'化神问道',d:'解锁道统传承与道途抉择',go:'panelCult()'});
  const long=[];
  long.push({t:'开山立派',d:'宗门长老位 + 名声达标后下山自立',go:'panelSect()'});
  long.push({t:'道统传承',d:'化神收徒，身陨转生香火不灭',go:'panelSocial()'});
  long.push({t:'渡劫飞升',d:'终极心魔劫，九界逍遥',go:'panelCult()'});
  const card=(c,ico)=>'<button class="tab-act" onclick="'+c.go+'"><span class="tab-act-ico">'+ico+'</span><span class="tab-act-tx"><b>🎯 '+esc(c.t)+'</b><small>'+esc(c.d)+'</small></span></button>';
  openPanel('🗺️ 道途','<p>修仙之路，既要有眼前的一步，也要有远处的山。以下为你当前的三层目标：</p>'+
    goalCard+
    pathStats+
    '<h4>🌱 当前目标</h4>'+(cur.map(c=>card(c,'📍')).join(''))+
    '<h4>🌿 中期目标</h4>'+(mid.map(c=>card(c,'🗺️')).join('')||'<p style="color:#6f7a94">暂无明确中期目标，继续探索仙途。</p>')+
    '<h4>🏔️ 长期目标</h4>'+(long.map(c=>card(c,'⛰️')).join(''))+
    '<p style="font-size:12px;color:#6f7a94">目标是死的，仙途是活的——机缘、恩怨与世界的回响，都可能改写你的方向。</p>');
}
const GUIDE_STEPS=[
  {title:'仙途 · 入门',body:'<p>欢迎来到仙途。你是一名初入修真界的凡人，将通过<b>修炼、探索、突破</b>一步步登临九界，也可能在半路身陨道消。</p><div class="tip">界面左侧是<b>状态面板</b>：境界、修为、寿元、灵石、六维属性、气运（隐藏）与装备。手机端请点顶部「状态」按钮展开。</div>'},
  {title:'修炼与突破',body:'<p>点下方「闭关修炼」会弹出<b>修炼窗口</b>：修炼按真实时间缓缓推进，进度条实时可见，途中或有异动需要当场抉择，也可「提前出关」按进度结算；若有道侣，可切换<b>双人同修</b>。效率受<b>灵根</b>与<b>功法</b>影响。修为达标后点「突破」晋阶——炼气期每层 100 修为，筑基起需过心性判定与天劫，并满足<b>天地门槛</b>（突破面板会提示缺什么、去哪里补）。</p><div class="tip">连续闭关 60 日后收益递减，多出去走走。突破失败会倒退 10%-30% 修为并可能留下心魔烙印；心魔可服清心丹、静心养神或心魔历练涤除，不必担心被卡死。</div>'},
  {title:'探索与机缘',body:'<p>「外出探索」可能采到灵草、遭遇妖兽、偶得机缘，也可能撞上凶险。<b>部分选项暗藏致死风险</b>，请谨慎抉择。</p><div class="tip">气运虽不可见，却暗中影响机缘。持特殊信物（如无字木牌）且境界足够时，会触发隐藏副本。</div>'},
  {title:'人间百态',body:'<p>坊市可买卖丹药法器；拜入宗门可接任务、晋升、参加大比；与人相交可结道侣、拜师尊；四大副业可炼丹炼器、制符布阵。</p><div class="tip">点「行囊」使用物品：丹药点「使用」、法器防具点「装备」、符箓战斗中自动可选。底部输入栏支持自由行动，例如「修炼100天」「探索」「静心」。寿元耗尽或战死即身陨，可转世重生。</div>'},
  {title:'修行辅助',body:'<p>随着境界提升，更多修行之道会逐一开启：<b>真元</b>（休整恢复，可淬体换修为）、<b>战技参悟</b>（胜战积战意、点化战斗之技）、<b>论道台</b>（与道友辩道，道韵共鸣更益）、<b>收藏图鉴</b>（集物遇敌领里程碑奖励）。</p><div class="tip">新系统都会在对应页签出现，随时可在「修仙志」查阅说明。</div>'},
  {title:'装备与丹药',body:'<p><b>装备工坊</b>（更多页签）可修理耐久、洗练词条、镶嵌宝石；三槽集齐同套装 2/3 件激活套装效果——五行轮转、剑心通明、噬血魔纹、逍遥游各有偏重。</p><p>丹药有<b>丹毒</b>：服丹累积药力之毒，30/60/90 逐档压制修炼与气血，可用排毒丹、静养化解；炼丹师可在「丹方研创」推演新丹方（排毒丹/悟道丹/五行丹/回天丹等），并集「丹经」图鉴。</p><div class="tip">战斗胜利 -3 耐久、落败 -8、身陨 -20；耐久归零则词条宝石一并失效。固本丹可保一次突破失败不损修为。</div>'},
  {title:'雅集与云游',body:'<p>「人际」页签新增 <b>茶会/诗会</b>（一年一度，品茶斗诗，散修声望与悟道）与 <b>结伴云游</b>（与相熟之人择地出行，沿途事件链）。</p><p>坊市奇珍拍卖改为 <b>三轮竞拍</b>（2-3 位买家抬价，落槌价高者得）；灵田可多块种植（玄参/紫芝等新灵药），途中或遇虫害、灵雨、妖兽偷吃；凶签可走<b>避祸→应劫→转运</b>化解奇遇链；<b>御剑试炼</b>在地图开启，30 日一回；战斗每 4 回合有<b>绝杀时机</b>QTE；故友会不定期登门造访。</p><div class="tip">战意与御剑试炼、绝杀时机皆不消耗战意点；茶会一年一度，与四大节日交错举行。</div>'},
  {title:'修行法门与道基',body:'<p>闭关前可选 <b>修炼法门</b>：以气养神（稳）、以体炼气（快但积灵浊）、以战悟道（耗战意）、以文入道（耗灵石著手札）；并可择 <b>修炼场景</b>：洞府/灵泉/山巅/雪山/禁地，各有收益与代价。</p><p>修行会累积 <b>道基</b>（同境界战力与突破判定）与 <b>灵浊</b>（速修代价，30/60 档压制修炼与气血，可静养、灵泉、洗灵露排解）。瓶颈期可用 <b>悟道碑/实战破障/论道破障</b> 主动破障，不必干等。</p><div class="tip">云游页新增「云游悟道」：不入秘境，天地深处即是道场。炼丹成功偶有「丹火入道」。</div>'},
];
let GUIDE_IDX=0;
function showGuide(start){
  GUIDE_IDX=start||0;
  $('guide').style.display='flex';
  if(typeof T!=='undefined'&&T.reveal)T.reveal($('guide'));
  renderGuide();
}
function renderGuide(){
  const g=GUIDE_STEPS[GUIDE_IDX];
  $('guideTitle').textContent=g.title;
  $('guideBody').innerHTML=g.body;
  $('guidePrev').style.display=GUIDE_IDX>0?'':'none';
  $('guideNext').textContent=GUIDE_IDX<GUIDE_STEPS.length-1?'下一步':'踏入仙途';
  $('guideDots').textContent=(GUIDE_IDX+1)+' / '+GUIDE_STEPS.length;
}
function closeGuide(){$('guide').style.display='none'}
