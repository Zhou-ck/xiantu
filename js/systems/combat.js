/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 战斗 ================
====================================================== */
'use strict';
/* ================= 战斗 ================= */
/* ===== 7.1 功法技能：主修功法按五行自动施放主动技（每 3 回合） ===== */
const ART_SKILLS={
  fire:{n:'焚天诀',dmg:1.5,eff:'burn',desc:'烈焰焚身，攻击 ×1.5 并附加灼烧'},
  water:{n:'玄冰缚',dmg:1.3,eff:'freeze',desc:'冰霜缚敌，攻击 ×1.3，几率冻结对手一回合'},
  wood:{n:'长春复苏',dmg:0.9,eff:'heal',desc:'木灵回春，攻击并回复气血'},
  metal:{n:'庚金剑气',dmg:1.6,eff:'pierce',desc:'金气破防，攻击 ×1.6 且无视防御'},
  earth:{n:'厚土镇岳',dmg:1.1,eff:'guard',desc:'土灵护体，攻击 ×1.1 并减半受创'},
  thunder:{n:'九霄引雷',dmg:1.8,eff:'crit',desc:'雷霆万钧，攻击 ×1.8 且必暴击'},
  ice:{n:'寒冰诀',dmg:1.3,eff:'freeze',desc:'冰霜缚敌，攻击 ×1.3，几率冻结对手一回合'},
  wind:{n:'疾风刃',dmg:1.2,eff:'multi',desc:'风刃连击，攻击 ×1.2 并追加一击'},
  dark:{n:'幽冥噬魂',dmg:1.4,eff:'drain',desc:'噬魂吸血，攻击 ×1.4 并按伤害回血'},
  none:{n:'真元冲击',dmg:1.15,eff:null,desc:'无属性修士以真元强攻'},
};
function artSkill(a){
  if(!a)return null;
  const sk=ART_SKILLS[a.elem]||null;
  if(!sk&&a.mult>=1.15)return ART_SKILLS.none;
  return sk;
}
/* ===== 7.4 战技参悟：以战悟道，战意点化永久战斗之技（战斗深化） ===== */
const TECH_UPGRADES=[
  {id:'agg',n:'破军诀',i:'🗡️',max:3,cost:1,desc:'以战养战，攻势 +5%/级',eff:lv=>'伤害 +'+(lv*5)+'%'},
  {id:'agi',n:'游龙身法',i:'🌀',max:3,cost:1,desc:'身法如游龙，敌方更难命中 +1/级',eff:lv=>'敌方命中难度 +'+lv},
  {id:'def',n:'玄龟御体',i:'🛡️',max:3,cost:1,desc:'御体如岳，受创 -5%/级',eff:lv=>'受创 -'+(lv*5)+'%'},
  {id:'skl',n:'百战通神',i:'⚡',max:2,cost:2,desc:'参悟功法技能奥义，2 级后每 2 回合即可施展',eff:lv=>lv>=2?'技能每 2 回合施展':'技能间隔缩短'},
];
function techUps(){return (S&&S.flag&&S.flag.tech&&S.flag.tech.ups)||{}}
function techPts(){return (S&&S.flag&&S.flag.tech&&S.flag.tech.pts)||0}
function techLevel(id){return techUps()[id]||0}
function skillCd(){return techLevel('skl')>=2?2:3}
function addTechPts(n){
  S.flag.tech=S.flag.tech||{pts:0,ups:{}};
  S.flag.tech.pts=(S.flag.tech.pts||0)+Math.max(0,Math.floor(n||0));
  return S.flag.tech.pts;
}
function learnTech(id){
  if(!S||!S.flag)S.flag=S.flag||{};
  S.flag.tech=S.flag.tech||{pts:0,ups:{}};
  const t=TECH_UPGRADES.find(x=>x.id===id);
  if(!t)return;
  const lv=techLevel(id);
  if(lv>=t.max){toast('此技已至圆满');return}
  const c=Math.max(1,t.cost*(lv+1));
  if(S.flag.tech.pts<c){toast('战意不足，需 '+c+' 点');return}
  S.flag.tech.pts-=c;
  S.flag.tech.ups[id]=lv+1;
  log('<p class="loot">⚔️ 你于战中顿悟「'+t.n+'」至第 '+(lv+1)+' 层（'+(t.eff?t.eff(lv+1):'')+'）。</p>');
  panelBattleArts();
}
function panelBattleArts(){
  if(!S){toast('尚未踏入仙途');return}
  S.flag.tech=S.flag.tech||{pts:0,ups:{}};
  const rows=TECH_UPGRADES.map(t=>{
    const lv=techLevel(t.id);
    const c=Math.max(1,t.cost*(lv+1));
    const done=lv>=t.max;
    return '<div class="item-card"><div class="nm">'+t.i+' '+t.n+' <span class="tag">Lv.'+lv+'/'+t.max+'</span></div><div class="ds">'+t.desc+'<br>当前效果：'+(t.eff?t.eff(lv):'')+'</div>'+
      (done?'<p style="color:#8fd0a0;font-size:12px;margin-top:4px">已圆满</p>':'<div style="margin-top:6px"><button class="small primary" onclick="learnTech(\''+t.id+'\')">参悟（'+c+' 战意）</button></div>')+'</div>';
  }).join('');
  openPanel('⚔️ 战技参悟','<p>战意 <b>'+(S.flag.tech.pts||0)+'</b> 点：胜战可得战意，点化后永久生效，与境界成长叠加。</p>'+
    '<p style="font-size:12px;color:#6f7a94">破军诀强攻、游龙身法避危、玄龟御体减伤、百战通神缩短功法技能间隔——皆为以战悟道的积累。</p>'+rows);
}
/* ===== 论道台：与道友辩道证心（道韵共鸣 / 论道点入道） ===== */
function daolunStats(){return {wins:S.flag.daolunWins||0,losses:S.flag.daolunLosses||0,score:S.flag.daolunScore||0}}
function daolunResonance(n){
  if(!n)return false;
  const a=elemOf(S),b=n.rootElem||'fire';
  if(a===b)return true;
  if(a==='fuse'&&S.rootFuse&&S.rootFuse.indexOf(b)>=0)return true;
  return !!(typeof ELEM_SHENG!=='undefined'&&(ELEM_SHENG[a]===b||ELEM_SHENG[b]===a));
}
function panelDaolun(){
  if(!S){toast('尚未踏入仙途');return}
  const st=daolunStats();
  const npcs=(S.npcs||[]).filter(n=>n.met&&!n.foe);
  const rows=npcs.map((n,i)=>{
    const cd=(n.cd&&n.cd.daolun)||0;
    const reson=daolunResonance(n);
    return '<div class="item-card"><div class="nm">'+artImg(NPC_ART[n.role]||ART.lady,36,36,'avatar')+'<b>'+esc(n.name)+'</b> <span class="tag">'+esc(n.role)+'</span>'+(reson?' <span class="tag" style="color:#8fd0a0">道韵共鸣</span>':'')+'</div><div class="ds">'+stageName(n.stage)+' · 好感 '+(n.favor||0)+(cd>0?'<br>论道过后，需 '+cd+' 日再叙':'')+'</div><div style="margin-top:6px"><button class="small" onclick="daolunWith('+i+')">'+(cd>0?'⏳ 冷却中':'📖 论道')+'</button></div></div>';
  }).join('');
  const master=S.master?('<div class="item-card"><div class="nm">🎓 师尊 <b>'+esc(S.master.name)+'</b></div><div class="ds">与师尊论道，获益更丰</div><div style="margin-top:6px"><button class="small primary" onclick="daolunWith(-1)">📖 论道</button></div></div>'):'';
  openPanel('📖 论道台','<p>道可道，非常道。与道友辩道，既证己道，亦长见闻。</p>'+
    '<div class="bd-box"><div class="bd-head">🏅 论道战绩</div>'+
    '<div class="bd-row"><span>胜负</span><b>'+st.wins+' 胜 · '+st.losses+' 负</b></div>'+
    '<div class="bd-row"><span>论道点</span><b>'+st.score+'</b></div></div>'+
    (st.score>=3?'<div class="row"><button class="small primary" onclick="daolunEnlighten()">✨ 以论入道（3 论道点 · 悟道+1）</button></div>':'')+
    (master?'<h4>🎓 与师尊论道</h4>'+master:'')+
    '<h4>🤝 与道友论道</h4>'+(rows||'<p style="color:#6f7a94">尚无相识之人可论道，先出门游历吧。</p>')+
    '<p style="font-size:11.5px;color:#6f7a94;margin-top:8px">论道三题（义理/道心/处世），胜二场即胜。灵根相生或同属者<b style="color:#8fd0a0">道韵共鸣</b>：论道点双得、收益更丰。</p>');
}
function daolunWith(i){
  const n=i<0?S.master:S.npcs[i];
  if(!n){toast('无人可论');return}
  if(n.foe){log('<p>仇人相见，论什么道？</p>');return}
  closePanel();
  const cd=n.cd=n.cd||{};
  if((cd.daolun||0)>0){log('<p class="sys">'+esc(n.name)+'摆手：「刚论过不久，容我回味几日。」</p>');passTime(1);renderAll();return}
  cd.daolun=rand(10,18);
  const reson=daolunResonance(n);
  const dc=14+(n.stage||0);
  const topics={int:'义理',wil:'道心',cha:'处世'};
  let wins=0;
  for(const k of ['int','wil','cha']){
    const R=doRoll(k,dc+(reson?2:0));
    log('<p>你与'+esc(n.name)+'论至【'+topics[k]+'】：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');
    if(R.hit)wins++;
  }
  log('<p class="sys">三题论罢，你'+(wins>=2?'略胜一筹':'稍逊风骚')+'（'+wins+'/3）。</p>');
  if(wins>=2)daolunWin(n,reson);
  else daolunLose(n,reson);
  dC().c.daolun=(dC().c.daolun||0)+1;
  passTime(1);renderAll();
}
function daolunWin(n,reson){
  S.flag.daolunWins=(S.flag.daolunWins||0)+1;
  const g=Math.floor((30+(n.stage||0)*15)*(reson?1.5:1));
  S.cult+=g;
  n.favor=clamp((n.favor||0)+2,0,100);
  if(reson){
    S.flag.daolunScore=(S.flag.daolunScore||0)+2;
    log('<p class="good">道韵共鸣：你与'+esc(n.name)+'的灵根五行相生，此番论道如高山流水，格外酣畅（论道点 +2，修为 +'+g+'，好感+2）。</p>');
  }else{
    S.flag.daolunScore=(S.flag.daolunScore||0)+1;
    log('<p class="good">你于论道中折服对方：'+esc(n.name)+'叹服不已（论道点 +1，修为 +'+g+'，好感+2）。</p>');
  }
  const gw=growWil(0.12,'辩道明心，道心愈坚');if(gw)log(gw);
}
function daolunLose(n,reson){
  S.flag.daolunLosses=(S.flag.daolunLosses||0)+1;
  const g=Math.floor((15+(n.stage||0)*8)*(reson?1.2:1));
  S.cult+=g;
  n.favor=clamp((n.favor||0)+1,0,100);
  log('<p>你与'+esc(n.name)+'各执一词，终究棋差一着。虽败，亦有所得（修为 +'+g+'，好感+1）。</p>');
  const gw=growWil(0.1,'闻道有先后，心性渐明');if(gw)log(gw);
}
function daolunEnlighten(){
  if((S.flag.daolunScore||0)<3){toast('论道点不足');return}
  S.flag.daolunScore-=3;
  S.flag.insights=(S.flag.insights||0)+1;
  const g=Math.floor(80+rl()*10);
  S.cult+=g;
  log('<p class="loot">✨ 你将三场论道所得凝为一念——灵台一点清明乍现，悟道 +1（修为 +'+g+'）。</p>');
  panelDaolun();
}
/* ===== 7.2 敌人风格：每种敌人带战斗风格与「妖技」 ===== */
const ENEMY_STYLES={
  rapid:{n:'抢攻',i:'⚡',desc:'攻势凌厉，先手如风',bonus:4,act:'妖技 · 疾影突袭：对方攻势暴涨！'},
  guard:{n:'龟守',i:'🛡️',desc:'皮糙肉厚，善守反击',bonus:0,act:'妖技 · 铁甲护体：对方防御大增！'},
  poison:{n:'用毒',i:'☠️',desc:'阴毒缠身，擅长下毒',bonus:0,act:'妖技 · 淬毒獠牙：你中了毒！'},
  burst:{n:'爆发',i:'💥',desc:'凶性毕露，越伤越猛',bonus:0,act:'妖技 · 狂性大发：对方攻势暴涨！'},
  boss:{n:'妖技',i:'🌀',desc:'守关大妖，手段繁多',bonus:5,act:'妖技 · 妖元迸发：天地色变！'},
};
/* ===== 4a 战前五行克制预览：敌方五行 / 我方武器·功法五行 / 克制结果 ===== */
function elemPreviewText(enemy){
  const st=S||{};
  const foeElem=enemy&&enemy.elem;
  const myElem=(st.weapon&&st.weapon.elem)||elemOf(st); /* 与 battle 实际克制结算同源（武器→灵根），功法五行不参与克制 */
  const foeInfo=foeElem&&(ELEMS[foeElem]||foeElem==='fuse')?elemInfo(foeElem):null;
  const myInfo=(myElem&&(ELEMS[myElem]||myElem==='fuse'))?elemInfo(myElem):null;
  const foeTxt=foeInfo?foeInfo.i+foeInfo.n:(foeElem?'未知五行':'属性未知');
  const myTxt=myInfo?myInfo.i+myInfo.n:(myElem?'未知五行':'属性未知');
  let relTxt='无克制',relCls='',relNote='';
  if(foeInfo&&myInfo){
    if(elemBeat(myElem,foeElem)){relTxt='我克敌方';relCls=' class="good"';relNote='伤害 ×1.25'}
    else if(elemBeat(foeElem,myElem)){relTxt='我受克制';relCls=' class="danger"';relNote='受创 ×1.15'}
  }
  return '<p'+relCls+'>🔮 五行窥探：敌方属 <b>'+foeTxt+'</b>，你以 <b>'+myTxt+'</b> 应之——<b>'+relTxt+'</b>'+(relNote?'（'+relNote+'）':'')+'。</p><p class="sys">五行克敌时伤害 ×1.25，被克则受创 ×1.15。</p>';
}
function startCombat(enemy,onEnd,spar){
  log(elemPreviewText(enemy));
  const hasFire=S.items.some(i=>i.name==='火球符');
  const hasThunder=S.items.some(i=>i.name==='天雷符');
  const hasEscape=S.items.some(i=>i.name==='遁地符');
  const btns=[
    {txt:'⚔️ 抢攻迎战',cls:'primary',fn:()=>{S.battleTactic='aggressive';battle(enemy,onEnd,spar)}},
    {txt:'⚖️ 稳健迎战',fn:()=>{S.battleTactic='steady';battle(enemy,onEnd,spar)}},
    {txt:'🛡️ 龟守迎战',fn:()=>{S.battleTactic='defense';battle(enemy,onEnd,spar)}},
    {txt:'💥 搏命迎战（凶险）',cls:'danger',fn:()=>{S.battleTactic='allout';battle(enemy,onEnd,spar)}},
  {txt:'🏃 遁走（身法判定）',fn:()=>{const R=doRoll('agi',12+Math.floor(rl()/3));log('<p>你欲抽身而退：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>你身形一晃，没入林间，甩脱了追兵。</p>');passTime(1);renderAll()}else{battle(enemy,onEnd,spar)}}}];
  if(hasFire)btns.push({txt:'🔥 掷出火球符',fn:()=>{S.flag.combatBuff=6;useItem('火球符');battle(enemy,onEnd,spar)}});
  if(hasThunder)btns.push({txt:'⚡ 掷出天雷符',fn:()=>{S.flag.combatBuff=12;useItem('天雷符');battle(enemy,onEnd,spar)}});
  if(hasEscape)btns.push({txt:'📜 燃遁地符',fn:()=>{useItem('遁地符');log('<p>符箓燃尽，你化作遁光瞬息远去。</p>');passTime(1);renderAll()}});
  logChoices(btns);
}
/* v65 战斗形象：敌方可视化（已知敌人立绘/场景图映射，未知则五行色头像兜底） */
const ENEMY_ART={
  '荒坟厉鬼':'assets/scenes/death.jpg',
  '血魔宗伏杀者':'assets/scenes/darksect.jpg',
  '正道剑修':'assets/portraits/npc_swordsman.jpg',
  '守库尸傀':'assets/scenes/dungeon.jpg',
  '青鳞蟒':'assets/scenes/tide.jpg',
  '魔道巡察使':'assets/scenes/darksect.jpg',
  '雷蛟':'assets/scenes/tribulation.jpg',
  '古修残魂':'assets/scenes/ghostgate.jpg',
  '化形妖王':'assets/scenes/beast.jpg',
  '幽冥鬼帅':'assets/scenes/death.jpg',
  '合体魔君':'assets/scenes/darksect.jpg',
  '大乘老祖':'assets/scenes/sect.jpg',
  '渡劫天尊':'assets/scenes/tribulation.jpg',
};
function enemyFigHtml(e){
  e=e||{};
  const art=ENEMY_ART[e.name]||((typeof NPC_ART!=='undefined'&&NPC_ART[e.name])||'');
  const ei=e.elem?elemInfo(e.elem):null;
  const ec=ei&&ei.c?ei.c:'';
  if(art)return '<div class="bfig bfig-has"'+(ec?' style="--ec:'+ec+'"':'')+'><img class="bfig-img" src="'+art+'" alt="" loading="lazy"></div>';
  const emoji=(e.boss?'🐲':(ei?ei.i:'👹'));
  return '<div class="bfig bfig-emoji"'+(ec?' style="color:'+ec+';border-color:'+ec+'"':'')+'>'+emoji+'</div>';
}
function playerFigHtml(s){
  let k='';
  if(typeof charArtKey==='function'){try{k=charArtKey(s)}catch(e){}}
  if(!k&&typeof ART!=='undefined')k=ART.hero;
  return k?'<div class="bfig bfig-has"><img class="bfig-img" src="'+k+'" alt="" loading="lazy"></div>':'<div class="bfig bfig-emoji">🧙</div>';
}
function battle(enemy,onEnd,spar){
  return new Promise(resolve=>{
    closePanel();
    S.seenE[enemy.name]=(S.seenE[enemy.name]||0)+1;
    if(typeof checkAtlasMiles==='function')checkAtlasMiles();
    const tac=TACTICS[S.battleTactic||'steady'];
    const skill=artSkill(S.arts&&S.arts[0]);
    const es=ENEMY_STYLES[enemy.style]||ENEMY_STYLES[pick(['rapid','guard','poison','burst'])];
    const flow=flowCombatBonus(S,es);
    const techAgg=techLevel('agg'),techAgi=techLevel('agi'),techDef=techLevel('def');
    const eset=(typeof equipStats==='function')?equipStats(S):{beat:0,beatDef:0,first:0,karmaAtk:0,drain:0,tech:0,cult:0,stones:0};
    const beatBonus=eset.beat+((S.flag&&S.flag.wuxingBuff>0)?0.1:0);
    const karmaAtkBonus=Math.floor((S.karma||0)*eset.karmaAtk);
    let pDmg=petAlive()?2+S.pet.bonus*2:0;
    let cDmg=S.companion?2+S.companion.stage*2:0;
    let eh=enemy.hp,ph=S.hp;
    let burn=0,poison=0,frozen=false,guardUp=false,skillCount=0;
    const st={rounds:0,dmgDealt:0,dmgTaken:0,crits:0,misses:0,dodges:0,selfHurt:0,petDmg:0,compDmg:0,beats:0,beatBy:0,win:false,draw:false};
    st.enemyStyle=es.n;st.skillCount=0;st.flow=flowType(S).n;
    const logLines=[];const loot=[];
    const finish=(win,draw)=>{
      if(finished)return;finished=true;
      st.win=win;st.draw=!!draw;
      S.battleTactic='steady';S.flag.combatBuff=0;
      if(typeof wearEquip==='function')wearEquip(S,win?-3:(draw?-5:-8));
      scene('遭遇战 · '+esc(enemy.name));
      if(win){
        S.kills++;S.wins++;S.hp=Math.max(1,ph);
        const tp=(enemy.boss?2:1)+(eset.tech||0);
        addTechPts(tp);
        loot.push('战意 +'+tp);
        dC().c.kill++;
        addTrail(1);
        weaponGainMastery(S);
        if(S.arts&&S.arts[0]){const mg=gainArtMastery(S.arts[0],10);if(mg)log(mg);}
        if(S.flag.pendingMerit){addMerit(S.flag.pendingMerit);loot.push('功德 +'+S.flag.pendingMerit);S.flag.pendingMerit=0}
        if(enemy.name==='荒坟厉鬼'){addMerit(2);loot.push('功德 +2')}
        if(enemy.name==='血魔宗伏杀者'){addMerit(3);loot.push('功德 +3')}
        const g=Math.floor((rand(20,80)+rl()*8)*(1+(eset.stones||0)));S.stones+=g;loot.push('灵石 +'+g);
        /* 问题 1 v2：战斗胜利修为锚定闭关 2 倍（一场 10 日 ≈ 20 日闭关量），随功法/根骨/境界同步缩放。
           瓶颈压制/连坐递减为闭关专属惩罚，战斗不受其影响——瓶颈期战斗更划算是有意设计（鼓励玩家瓶颈期去探索/战斗而非干等） */
        const cg=Math.max(5,Math.floor((8+S.root/6)*cultMult(S)*2*(1+(eset.cult||0))));S.cult+=cg;loot.push('修为 +'+cg);
        if(chance(0.3)){const m=pick(['herb','iron','pelt','demonCore']);const n=rand(1,2);S.mats[m]=(S.mats[m]||0)+n;loot.push(MAT_NAMES[m]+' ×'+n)}
        if(chance(0.05)&&typeof GEM_DEFS!=='undefined'){const gm=pick(GEM_DEFS);addItem({name:gm.name,type:'gem',gemId:gm.id,quality:2,desc:gm.desc,sell:150});loot.push(gm.i+' '+gm.name)}
        if(chance(0.12)){const it=randItem(rand(1,3));addItem(it);loot.push(it.name+'（'+QNAMES[it.quality]+'）')}
        if(chance(0.08)){S.luck=clamp(S.luck+1,1,100);loot.push('气运 +1')}
        log('<p class="good">你斩敌于剑下（'+st.rounds+'回合）。</p>');
        for(const l of loot)log('<p class="loot">· '+l+'</p>');
        const sg1=growAttr('str',0.10,'血战淬炼，膂力渐增'),sg2=growAttr('agi',0.08,'游斗之间，身法渐熟');
        if(sg1||sg2)log(sg1+sg2);
      }else if(ph<=0){
        if(spar){
          S.hp=1;log('<p class="danger">你力战不敌，身受重创，踉跄退开……</p>');
        }else{
          if(S.companion&&S.companion.favor>=30&&chance(0.55)){
            S.hp=1;S.companion.favor=clamp(S.companion.favor-15,0,100);
            log('<p class="good">千钧一发之际，同行之人 <b>'+esc(S.companion.name)+'</b> 拼死相护，将你从鬼门关前拽了回来！（同行之人好感 -15）</p>');
            log('<p class="sys">你身受重创，勉力撑起身形。</p>');
          }else{
            S.hp=0;log('<p class="danger">你力战不敌，身负重伤倒地……</p>');
            $('battle').style.display='none';
            const r={win,draw,st};resolve(r);if(onEnd)onEnd(r);
            die('战死沙场');
            return;
          }
          applyInjury(pick(['jiqiao','neijing','neishang']));
        }
      }else{
        S.hp=Math.max(1,ph-Math.floor(S.maxHp*0.1));
        log('<p class="sys">十回合鏖战、加时五回合后双方仍力竭难分胜负，你觅得空隙脱身而去。</p>');
      }
      if(S.hp<=0)S.hp=1; /* 防御：任何「包活」路径都不允许以 0 血继续 */
      if(typeof questTick==='function')questTick();
      const alive=passTime(1);
      if(!alive){$('battle').style.display='none';const r={win,draw,st};resolve(r);if(onEnd)onEnd(r);return}
      const verdict=win?'<b style="color:#a8d5a8">🏆 胜</b>':(draw?'<b style="color:#e8c86a">⚖️ 平</b>':'<b style="color:#e08a8a">💀 败</b>');
      const rows=[
        ['结果',verdict],['回合',st.rounds],['造成伤害',st.dmgDealt],['承受伤害',st.dmgTaken],
        (st.flow?['流派',st.flow]:null),
        ['暴击',st.crits+' 次'],['对手落空',st.misses+' 次'],['我方闪避',st.dodges+' 次'],
        ['灵兽助战',st.petDmg?st.petDmg+' 点':'—'],
        ['同行助战',st.compDmg?st.compDmg+' 点':'—'],
        (st.skillCount?['功法技能',st.skillCount+' 次']:null),
        (st.enemyStyle?['敌方风格',st.enemyStyle]:null),
        (st.beats?['五行克制',st.beats+' 次']:null),
        (st.beatBy?['被克受创',st.beatBy+' 次']:null),
        (st.selfHurt?['搏命反噬',st.selfHurt+' 点']:null),
        (loot.length?['战利品',loot.join(' · ')]:null),
      ].filter(Boolean).map(([k,v])=>'<p>'+k+'<b>'+v+'</b></p>').join('');
      $('battleResult').innerHTML='<h4>📜 战后统计</h4>'+rows;
      $('battleResult').style.display='block';
      $('battleContinue').style.display='inline-block';
      window._battleResolve=()=>{const r={win,draw,st};resolve(r);if(onEnd)onEnd(r)};
      renderAll();
    };
    let rnd=1,finished=false,qteDone=false;
    const qteRound=()=>{
      const baseDmg=Math.max(2,Math.floor((rand(4,9)+attrVal(S,'str')+weaponAtk(S))*tac.dmg))+pDmg+cDmg;
      const finishQte=(mult,ok)=>{
        if(ok){
          let dmg=Math.floor(baseDmg*mult)+karmaAtkBonus;
          const myElem=(S.weapon&&S.weapon.elem)?S.weapon.elem:elemOf(S);
          if(enemy.elem&&elemBeat(myElem,enemy.elem))dmg=Math.floor(dmg*1.25*(1+beatBonus));
          eh=Math.max(0,eh-dmg);st.dmgDealt+=dmg;st.crits++;
          fxShake(2);fxFloatText('-'+dmg,'#ffd76a',true);
          pushLog('<p class="bl">⚡ 绝杀命中！<b>'+esc(enemy.name)+'</b> 受创 <span class="bhit">-'+dmg+'</span>。</p>');
          if(eh<=0){renderBars();pushLog('');finish(true,false);return}
        }else{
          st.misses++;
          pushLog('<p class="bdodge">绝杀落空，你身形一滞，错失良机。</p>');
        }
        rnd++;
        setTimeout(step,650);
      };
      if(!fxOn()||(S.set&&S.set.autoCombat)){pushLog('<p class="bl">⚡ 绝杀时机！你稳住心神，一击制敌（×1.5）。</p>');finishQte(1.5,true);return}
      pushLog('<p class="bl">⚡ 绝杀时机！敌方门户大开——选择你的出手方式！</p>');
      logChoices([
        {txt:'⚖️ 稳扎稳打（伤害 ×1.5）',fn:()=>finishQte(1.5,true)},
        {txt:'🌀 疾电一击（身法判定 · ×2.0）',fn:()=>{const R=doRoll('agi',14);log('<p>你于电光石火间出手：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');finishQte(2.0,R.hit)}},
        {txt:'💥 孤注一掷（智慧判定 · ×2.5，落空反噬）',cls:'danger',fn:()=>{const R=doRoll('int',16);log('<p>你孤注一掷：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){finishQte(2.5,true)}else{const sd=Math.max(2,Math.floor(S.maxHp*0.08));ph=Math.max(1,ph-sd);st.selfHurt+=sd;pushLog('<p class="bhit">绝杀失手，反噬自身（气血 -'+sd+'）。</p>');if(ph<=0){renderBars();finish(false,false);return}finishQte(1,false)}}},
      ]);
    };
    const renderBars=()=>{
      $('bEnemyBar').style.width=Math.max(0,Math.round(eh/enemy.hp*100))+'%';
      $('bEnemyHp').textContent=Math.max(0,eh)+' / '+enemy.hp;
      $('bPlayerBar').style.width=Math.max(0,Math.round(ph/S.maxHp*100))+'%';
      $('bPlayerHp').textContent=Math.max(0,Math.floor(ph))+' / '+S.maxHp;
    };
    const pushLog=(html)=>{logLines.push(html);if(logLines.length>8)logLines.shift();$('battleLog').innerHTML=logLines.join('');$('battleLog').scrollTop=999999};
    const step=()=>{
      if(finished)return;
      /* 4b 平局软化：10 回合未分胜负进入加时赛（11-15 回合，伤害 ×1.2），15 回合封顶仍不胜则平局 */
      if(rnd>15){st.rounds=15;finish(false,true);return}
      /* v51 绝杀 QTE：每 4 回合一次时机（自动/低配走稳） */
      if(rnd%4===0&&!qteDone){qteDone=true;qteRound();return}
      const ot=rnd>10;
      if(ot&&rnd===11)pushLog('<p class="bl">⚔️ 加时赛开始：双方拼死相搏，伤害 ×1.2！</p>');
      st.rounds=rnd;
      const html=[];
      const rndTxt=ot?('⚔️ 加时赛第 '+(rnd-10)+' 回合'):('第 '+rnd+' 回合');
      const op=!enemy.boss&&(atkBonus(S)*2>=enemy.hp);
      /* 持续状态：灼烧 / 中毒（加时赛伤害同步 ×1.2） */
      if(burn>0&&eh>0){let bd=Math.max(1,Math.floor(enemy.hp*0.06));if(ot)bd=Math.max(1,Math.floor(bd*1.2));eh=Math.max(0,eh-bd);st.dmgDealt+=bd;html.push('<p class="bl">🔥 灼烧蔓延，<b>'+esc(enemy.name)+'</b> 受创 <span class="bhit">-'+bd+'</span>。</p>')}
      if(poison>0){let pd=Math.max(1,Math.floor(S.maxHp*0.05));if(ot)pd=Math.max(1,Math.floor(pd*1.2));ph=Math.max(1,ph-pd);st.dmgTaken+=pd;html.push('<p class="bhit">☠️ 毒素侵蚀，你受创 -'+pd+'（剩余 '+poison+' 回合）。</p>');poison--}
      if(ph<=0){renderBars();pushLog(html.join(''));finish(false,false);return}
      const skCd=skillCd();
      const useSkill=!!skill&&(rnd%skCd===0);
      /* 2C 流派：剑修连击/破防加成 */
      const flowMulti=(flow.multi&&chance(flow.multi))?1:0;
      const pa=d20()+atkBonus(S)+companionAtk()+(signNow()&&signNow().atk?signNow().atk:0)+(useSkill?3:0)+(flow.atk||0)+(flow.vsGuard||0)+(flowMulti?3:0)+((S.flag&&S.flag.bloodBuff)||0);
      const eStyleAct=chance(0.25)?es:null;
      let eBonus=0,eGuard=false,eSkillTxt='';
      if(eStyleAct){
        if(es===ENEMY_STYLES.poison){poison=2;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.rapid){eBonus=4;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.burst){eBonus=(eh<enemy.hp*0.5)?7:3;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.guard){eGuard=true;eSkillTxt=es.act}
        else{eBonus=(eh<enemy.hp*0.5)?8:4;eSkillTxt=es.act}
      }
      let ea=d20()+enemy.atk+eBonus-(flow.enemyAtkPen||0);
      if(flow.curse&&chance(flow.curse)){ea=0;html.push('<p class="bdodge">👻 咒术如影随形，敌方动作一滞，攻势落空！</p>')}
      if(pa>=enemy.def+8){
        let dmg=Math.max(2,Math.floor((rand(4,9)+attrVal(S,'str')+weaponAtk(S))*tac.dmg))+pDmg+cDmg;
        if(rnd===1&&eset.first)dmg=Math.floor(dmg*(1+eset.first));
        dmg+=karmaAtkBonus;
        if(enemy.boss&&rnd%5===0&&rnd%4!==0){dmg=Math.floor(dmg*1.5);html.push('<p class="bl">🌀 破绽！你抓住守关大妖的间隙，重创其躯！</p>')}
        if(techAgg)dmg=Math.floor(dmg*(1+0.05*techAgg));
        if(typeof ownSectCombatMult==='function'){const om=ownSectCombatMult();if(om!==1)dmg=Math.floor(dmg*om);} /* 自建宗门 · 演武场 */
        if(flow.skill)dmg=Math.floor(dmg*flow.skill);
        if(flowMulti){dmg=Math.floor(dmg*1.5);html.push('<p class="bl">🗡️ 剑势连击，如影随形！</p>')}
        if(op)dmg=Math.floor(dmg*1.5);
        let skTxt='';
        if(useSkill&&skill){
          dmg=Math.floor(dmg*(skill.dmg||1));
          skillCount++;st.skillCount++;
          if(skill.eff==='burn'){burn=2;skTxt='【焚天·灼烧】'}
          else if(skill.eff==='freeze'){frozen=chance(0.5);skTxt='【玄冰·缚敌】'}
          else if(skill.eff==='heal'){const h=Math.floor(dmg*0.5);ph=Math.min(S.maxHp,ph+h);skTxt='【长春·回春 +'+h+'】'}
          else if(skill.eff==='pierce'){/* 无视防御：直接加伤 */dmg=Math.floor(dmg*1.2);skTxt='【庚金·破防】'}
          else if(skill.eff==='guard'){guardUp=true;skTxt='【厚土·护体】'}
          else if(skill.eff==='crit'){const c=pa>=enemy.def+8;/* 必暴 */dmg*=2;st.crits++;skTxt='【九霄·引雷】'}
          else if(skill.eff==='multi'){const extra=Math.max(1,Math.floor(dmg*0.5));eh=Math.max(0,eh-extra);st.dmgDealt+=extra;skTxt='【疾风·连击 +'+extra+'】'}
          else if(skill.eff==='drain'){const h=Math.floor(dmg*0.5);ph=Math.min(S.maxHp,ph+h);skTxt='【幽冥·噬魂 +'+h+'】'}
          else skTxt='【真元·强攻】';
        }
        /* 12 武器词条：灼烧/破甲/回灵/噬魂 */
        if(S.weapon&&equipUsable(S.weapon)&&S.weapon.enchant){
          if(S.weapon.enchant==='灼烧'){burn=Math.max(burn,1);skTxt+='【灼烧】'}
          else if(S.weapon.enchant==='破甲'){dmg=Math.floor(dmg*1.2);skTxt+='【破甲】'}
          else if(S.weapon.enchant==='回灵'){ph=Math.min(S.maxHp,ph+Math.max(1,Math.floor(dmg*0.1)));skTxt+='【回灵】'}
          else if(S.weapon.enchant==='噬魂'){ph=Math.min(S.maxHp,ph+Math.max(1,Math.floor(dmg*0.2)));skTxt+='【噬魂】'}
        }
        /* 14.4 灵兽/同伴合击 */
        if(pDmg>0&&chance(0.25)){pDmg*=2;skTxt+='【灵兽合击】'}
        if(cDmg>0&&chance(0.25)){cDmg*=2;skTxt+='【同伴合击】'}
        const myElem=(S.weapon&&S.weapon.elem)?S.weapon.elem:elemOf(S);
        const beatHit=enemy.elem&&elemBeat(myElem,enemy.elem);
        if(beatHit){dmg=Math.floor(dmg*1.25*(1+beatBonus));st.beats++}
        const crit=pa>=enemy.def+16;
        if(crit){dmg*=2;st.crits++}
        if(eGuard)dmg=Math.floor(dmg*0.6);
        if(ot)dmg=Math.floor(dmg*1.2); /* 加时赛：双方伤害 ×1.2 */
        eh-=dmg;st.dmgDealt+=dmg;st.petDmg+=pDmg;st.compDmg+=cDmg;
        if(eset.drain){const h=Math.max(1,Math.floor(dmg*eset.drain));ph=Math.min(S.maxHp,ph+h);html.push('<p class="bl">🩸 噬血魔纹汲取 '+h+' 点气血！</p>')}
        if(flow.drain){const h=Math.max(1,Math.floor(dmg*flow.drain));ph=Math.min(S.maxHp,ph+h);html.push('<p class="bl">🌑 噬血夺元，你汲取 '+h+' 点气血！</p>')}
        if(crit){fxShake(2);fxBurst(22,'#ffd76a');fxHitstop(110);fxFloatText('暴击 -'+dmg,'#ffd76a',true);fxVibrate([50,40,60])}
        else{fxShake(1);fxFloatText('-'+dmg,'#fff',false)}
        html.push('<p class="bl">'+rndTxt+'：你'+(useSkill&&skill?'施展 <b>'+skill.n+'</b> '+skTxt+'：':'出招')+(crit?'【暴击】':'')+'命中'+(beatHit?'【五行克敌 ×1.25】':'')+(ot?'【加时赛 ×1.2】':'')+'，<b>'+esc(enemy.name)+'</b> 受创 <span class="bhit">-'+dmg+'</span>。</p>');
        if(tac.self&&chance(0.2)){const sd=Math.max(1,Math.floor(rand(3,6)*tac.take));ph-=sd;st.selfHurt+=sd;html.push('<p class="bhit">搏命反噬自身，你受创 -'+sd+'。</p>')}
        if(ph<=0&&eh>0){renderBars();pushLog(html.join(''));finish(false,false);return}
        if(eh<=0){renderBars();pushLog(html.join(''));finish(true,false);return}
      }else{
        if(flow.healEvery&&rnd%flow.healEvery===0){const h=Math.floor(S.maxHp*(flow.healPct||0.08));ph=Math.min(S.maxHp,ph+h);html.push('<p class="bl">⚗️ 丹火流转，你伤势渐复（+'+h+'）。</p>')}
        st.misses++;
        html.push('<p class="bdodge">'+rndTxt+'：你的攻势被对方堪堪避开。</p>');
      }
      if(eSkillTxt)html.push('<p class="bl">'+esc(enemy.name)+' 使出「'+es.n+'」——'+eSkillTxt+'</p>');
      if(frozen){
        frozen=false;
        html.push('<p class="bdodge">❄️ 玄冰缚身，对方动弹不得，错失一回合！</p>');
      }else{
        if(ea>=8+armorDef(S)+dodgeBonus(S)+techAgi){
          let d=Math.max(1,Math.floor((rand(3,8)+Math.floor(enemy.atk/3)-armorDef(S))*tac.take));
          if(techDef)d=Math.max(1,Math.floor(d*(1-0.05*techDef)));
          if(op)d=Math.max(1,Math.floor(d*0.5));
          if(flow.hpMul){d=Math.max(1,Math.floor(d*0.85*(flow.vsBurst||1)));html.push('<p class="bl">💪 肉身硬抗，伤害削减！</p>')}
          if(flow.reflect){const rd=Math.max(1,Math.floor(d*flow.reflect));eh=Math.max(0,eh-rd);st.dmgDealt+=rd;html.push('<p class="bl">🛡️ 反震之力，敌方受创 -'+rd+'。</p>')}
          fxFlash('#a03030',180);fxShake(2);fxFloatText('-'+d,'#e08a8a',false);
          if(guardUp){d=Math.floor(d*0.5);guardUp=false}
          const myElem2=(S.weapon&&S.weapon.elem)?S.weapon.elem:elemOf(S);
          const beatByHit=enemy.elem&&elemBeat(enemy.elem,myElem2);
          if(beatByHit){d=Math.max(1,Math.floor(d*1.15*(1-(eset.beatDef||0))));st.beatBy++}
          if(ot)d=Math.floor(d*1.2); /* 加时赛：敌方伤害 ×1.2 */
          ph-=d;st.dmgTaken+=d;
          html.push('<p class="bhit">'+rndTxt+'：'+esc(enemy.name)+' 反扑而至'+(beatByHit?'【五行反克 ×1.15】':'')+(ot?'【加时赛 ×1.2】':'')+'，你受创 <span class="bhit">-'+d+'</span>。</p>');
          if(ph<=0){renderBars();pushLog(html.join(''));finish(false,false);return}
        }else{
          st.dodges++;
          html.push('<p class="bdodge">你身形一晃，避开了对方的攻势。</p>');
        }
      }
      renderBars();
      pushLog(html.join(''));
      rnd++;
      setTimeout(step,650);
    };
    $('battle').style.display='flex';
    if(typeof T!=='undefined'&&T.reveal)T.reveal($('battle'));
    $('battleResult').style.display='none';
    $('battleContinue').style.display='none';
    $('battleLog').innerHTML='';
    const enemyEi=enemy.elem?elemInfo(enemy.elem):null;
    $('bEnemyName').innerHTML=(enemyEi?'<span style="color:'+enemyEi.c+'">'+enemyEi.i+'</span> ':'')+'👹 '+esc(enemy.name);
    $('bPlayerName').textContent='🧙 '+S.name;
    if($('bEnemyFig'))$('bEnemyFig').innerHTML=enemyFigHtml(enemy);
    if($('bPlayerFig'))$('bPlayerFig').innerHTML=playerFigHtml(S);
    $('battleHead').textContent='⚔️ '+enemy.name+' · 战术：'+tac.i+' '+tac.n;
    if(es)pushLog('<p class="bl">对方是<b>'+es.n+'</b>之敌（'+es.desc+'）。</p>');
    if(skill)pushLog('<p class="bl">你主修功法<strong>《'+esc(S.arts[0].name)+'》</strong>的<b>'+skill.n+'</b>每 3 回合自动施展（'+skill.desc+'）。</p>');
    if(enemy.elem)pushLog('<p class="bl">对方气息属 '+elemInfo(enemy.elem).i+' '+elemInfo(enemy.elem).n+(ELEMS[enemy.elem]&&ELEMS[enemy.elem].beats?'（克'+ELEMS[ELEMS[enemy.elem].beats].n+'）':'')+'。</p>');
    if(S.weapon&&S.weapon.elem)pushLog('<p class="bl">你手中 '+esc(S.weapon.name)+' 属 '+elemInfo(S.weapon.elem).n+'。'+(rootAffinity(S,S.weapon.elem)?' 与你的灵根相合，攻势更利。':'')+'</p>');
    if(pDmg>0)pushLog('<p class="bl">灵兽 <b>'+esc(S.pet.name)+'</b> 在旁伺机而动。</p>');
    if(cDmg>0)pushLog('<p class="bl">同行之人 <b>'+esc(S.companion.name)+'</b> 在旁策应。</p>');
    renderBars();
    step();
  });
}
/* ===== 7.3 守关 BOSS：每个大境界一位守关大妖，双阶段狂暴 ===== */
const BOSSES=[
  {stage:0,n:'青鳞蟒',atk:6,def:3,hp:70,desc:'山涧深处的守关妖蟒，皮糙肉厚，狂暴时尾扫如鞭。',elem:'water',style:'burst'},
  {stage:1,n:'魔道巡察使',atk:9,def:4,hp:110,desc:'魔道派出的巡察使，奉命清剿散修，出手狠辣。',elem:'dark',style:'rapid'},
  {stage:2,n:'雷蛟',atk:13,def:6,hp:170,desc:'盘踞雷泽的蛟龙，引雷淬体，妖威赫赫。',elem:'thunder',style:'boss'},
  {stage:3,n:'古修残魂',atk:17,def:8,hp:240,desc:'上古大能的残魂执念，道法玄奇，虚实难测。',elem:'fire',style:'boss'},
  {stage:4,n:'化形妖王',atk:22,def:10,hp:330,desc:'一域妖王，化形入境，灵智通神。',elem:'wood',style:'boss'},
  {stage:5,n:'幽冥鬼帅',atk:28,def:13,hp:440,desc:'幽冥一方的鬼帅，号令阴兵，阴风蚀骨。',elem:'dark',style:'boss'},
  {stage:6,n:'合体魔君',atk:35,def:16,hp:580,desc:'魔道一方合体魔君，凶焰滔天。',elem:'fire',style:'boss'},
  {stage:7,n:'大乘老祖',atk:43,def:20,hp:750,desc:'半步飞升的老祖，一言可镇山河。',elem:'metal',style:'boss'},
  {stage:8,n:'渡劫天尊',atk:52,def:25,hp:950,desc:'渡过天劫的天尊残影，威压众生。',elem:'thunder',style:'boss'},
];
function bossOf(stage){
  const b=BOSSES[clamp(stage,0,BOSSES.length-1)];
  const r=rl();
  return {name:b.n,desc:b.desc,atk:b.atk+Math.floor(r/2),def:b.def+Math.floor(r/3),hp:b.hp+r*10,elem:b.elem,style:b.style,boss:true,stage:stage};
}
function bossBattle(stage){
  closePanel();
  if(stage===undefined)stage=bigStage(S.realm);
  S.flag.bossArt=S.flag.bossArt||{};
  S.flag.bosses=S.flag.bosses||{};
  const e=bossOf(stage);
  const beat=S.flag.bosses;
  scene('守关试炼 · '+e.name);
  const weakElems=e.elem&&e.elem!=='dark'?Object.keys(ELEMS).filter(x=>ELEMS[x]&&ELEMS[x].beats===e.elem).map(x=>elemInfo(x).i+elemInfo(x).n):[];
  log('<p>'+(beat[stage]?'你再度来到守关之地，守关大妖一声低吼，旧账新算。':'天地之间荡开一圈涟漪，守关大妖 <b>'+esc(e.name)+'</b> 拦在去路上。')+'</p><p class="sys">'+e.desc+'（'+STAGE_NAMES[stage]+'守关 · 重伤后狂暴）'+(weakElems.length?'<br>🔮 破绽窥探：此妖属 '+elemInfo(e.elem).i+elemInfo(e.elem).n+'，以 <b>'+weakElems.join('/')+'</b> 法器应之，事半功倍。':'')+'</p>');
  logChoices([
    {txt:'⚔️ 挑战守关',cls:'primary',fn:()=>{
      startCombat(e,res=>{
        if(res.win){
          beat[stage]=true;S.flag.bosses=beat;
          const stones=Math.floor(150+stage*120),cult=Math.floor(eventGift(stage)*0.10+rl()*10);
          S.stones+=stones;S.cult+=cult;
          log('<p class="loot">守关已破：灵石 +'+stones+'，修为 +'+cult+'。</p>');
          if(stage>=2&&!S.flag.bossArt[stage]){
            const a=Object.assign({},pick(ARTS));
            if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);S.flag.bossArt[stage]=true;log('<p class="loot">守关遗宝：你习得功法《'+a.name+'》！</p>')}
          }
          if(chance(0.4)){S.luck=clamp(S.luck+1,1,100);log('<p class="good">破关历练，气运 +1。</p>')}
          renderAll();
        }else if(res.draw){
          log('<p class="sys">加时赛十五回合仍分不出胜负，守关大妖放你离去：「回去练练，再来。」</p>');
          passTime(1);renderAll();
        }else{
          log('<p class="danger">你败下阵来，被守关大妖一掌送出十里。养好伤，再来讨教。</p>');
          passTime(1);renderAll();
        }
      },true);
    }},
    {txt:'🏃 暂且退避',fn:()=>{log('<p>你望了望那守关大妖，还是先回去积蓄实力。</p>');passTime(1);renderAll()}},
  ]);
}
