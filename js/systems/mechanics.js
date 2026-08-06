/* ======================================================
  仙途 · 核心机制：五行灵根 / 功法武器相性 / 受伤 / 好感决裂
====================================================== */
'use strict';

/* ---------- 五行灵根与功法相性 ---------- */
const ELEMS={
  metal:{n:'金灵根',c:'#d8c37a',i:'⚔️',desc:'锋锐刚劲，利攻伐',aff:[],beats:'wood'},
  wood:{n:'木灵根',c:'#8fc08f',i:'🌿',desc:'生机绵长，善滋养',aff:[],beats:'earth'},
  water:{n:'水灵根',c:'#8fb8d8',i:'💧',desc:'柔韧绵长，利变化',aff:[],beats:'fire'},
  fire:{n:'火灵根',c:'#e08a6a',i:'🔥',desc:'爆烈刚猛，利攻伐',aff:[],beats:'metal'},
  earth:{n:'土灵根',c:'#c9b98e',i:'⛰️',desc:'厚重沉稳，善守御',aff:[],beats:'water'},
  thunder:{n:'雷灵根（变异）',c:'#d8a8e8',i:'⚡',desc:'刚猛迅捷，主金火之属',aff:['metal','fire'],beats:'wood'},
  ice:{n:'冰灵根（变异）',c:'#a8d8e8',i:'❄️',desc:'寒澈凌厉，主水金之属',aff:['water','metal'],beats:'fire'},
  wind:{n:'风灵根（变异）',c:'#a8d8a8',i:'🌪️',desc:'轻灵飘忽，主木火之属',aff:['wood','fire'],beats:'earth'},
};
const ELEM_SHENG={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const ELEM_POOL=['metal','wood','water','fire','earth','metal','wood','water','fire','earth','thunder','ice','wind'];
function pickRootElem(){return pick(ELEM_POOL)}
function elemOf(s){return (s&&s.rootElem)||'fire'}
function elemInfo(e){
  if(e==='fuse'&&typeof S!=='undefined'&&S&&S.rootFuse)return {n:S.rootFuseName||'融合灵根',c:'#d8a8e8',i:'☯️',desc:'两系合一，功法双亲',aff:S.rootFuse||[],beats:'wood'};
  return ELEMS[e]||ELEMS.fire;
}
function rootAffinity(s,e){
  if(!s||!e)return false;
  const r=elemOf(s);
  if(r===e||(ELEMS[r]&&ELEMS[r].aff&&ELEMS[r].aff.indexOf(e)>=0))return true;
  /* 2B 融合灵根：同时亲和两系 */
  if(s.rootFuse&&s.rootFuse.indexOf(e)>=0)return true;
  return false;
}
function elemBeat(a,b){return !!(a&&b&&ELEMS[a]&&ELEMS[a].beats===b)}
function elemSheng(a,b){return !!(a&&b&&ELEM_SHENG[a]===b)}
/* 2B 融合灵根：双系合一，功法双加成 + 共鸣技 */
function fuseRoot(s,a,b){
  if(!s)return false;
  if(s.rootFuse)return false;
  s.rootFuse=[a,b];
  s.rootElem='fuse';
  s.rootFuseName=ELEMS[a].n.replace('灵根','')+ELEMS[b].n.replace('灵根','')+'·融合';
  return true;
}
function rootFused(s){return !!(s&&s.rootFuse&&s.rootFuse.length)}
/* 双修五行相性：相生 ×1.5 / 相同 ×1.2 / 相克 ×0.9 / 其余 ×1.0 */
function dualElemMult(p){
  if(!p)return 1;
  const a=elemOf(S),b=elemOf(p);
  if(a===b)return 1.2;
  if(elemSheng(a,b)||elemSheng(b,a))return 1.5;
  if(elemBeat(a,b)||elemBeat(b,a))return 0.9;
  return 1;
}
/* 功法与灵根相性：同属功法修炼效率 ×1.15（变异灵根可修主属+副属） */
function elemArtMult(s,a){return rootAffinity(s,a&&a.elem)?1.15:1}

/* ---------- 2C 六大修行流派：主功法 + 武器 + 灵根共同决定 ---------- */
function flowType(s){
  const art=(s.arts&&s.arts[0]&&s.arts[0].name)||'';
  const wpn=(s.weapon&&s.weapon.name)||'';
  const prof=s.prof||'';
  if(/剑|锋|青锋|太乙|斩/.test(art)||/剑/.test(wpn))return {id:'sword',n:'剑修',i:'🗡️',desc:'剑出连击，锐不可当'};
  if((s.flag&&s.flag.dao==='dark')||/魔|煞|血/.test(art))return {id:'demon',n:'魔修',i:'🌑',desc:'噬血夺元，以伤换暴'};
  if(/体|淬|金刚|不灭/.test(art)||(s.attrs&&s.attrs.str>=25&&!s.weapon))return {id:'body',n:'体修',i:'💪',desc:'肉身成圣，以身为盾'};
  if(/丹|药|炉/.test(art)||prof==='alchemy')return {id:'dan',n:'丹修',i:'⚗️',desc:'丹火回春，绵绵不绝'};
  if(/阵|符|鬼|魂/.test(art)||prof==='talisman'||prof==='array')return {id:'spirit',n:'鬼修',i:'👻',desc:'召魂咒敌，诡异难测'};
  return {id:'law',n:'法修',i:'🔮',desc:'五行法术，相生相克'};
}
function flowCombatBonus(s,enemyStyle){
  const f=flowType(s).id;
  const es=enemyStyle||{};
  if(f==='sword')return {atk:1,multi:0.12,vsGuard:es.id==='guard'?2:0};
  if(f==='law')return {skill:1.2};
  if(f==='body')return {hpMul:1.15,reflect:0.12,vsBurst:es.id==='burst'?0.8:1};
  if(f==='dan')return {healEvery:6,healPct:0.08,vsPoison:es.id==='poison'?1.25:1};
  if(f==='demon')return {drain:0.3};
  if(f==='spirit')return {enemyAtkPen:1,curse:0.1};
  return {};
}
/* 3.1 功法品阶：黄/玄/地/天/仙/神，品阶越高修炼效率越高 */
const ART_GRADES=['黄阶','玄阶','地阶','天阶','仙阶','神阶'];
function artGrade(a){return clamp((a&&a.grade)||1,1,6)}
function artGradeName(a){return ART_GRADES[artGrade(a)-1]}
function artGradeMult(a){return [1,1.05,1.12,1.22,1.35,1.5][artGrade(a)-1]}
/* 3.1b 功法熟练度：修炼/战斗积累，每 150 点 1 级（上限 5 级），每级修炼效率 ×1.02 */
function artMasteryLevel(a){return Math.min(5,Math.floor(((a&&a.mastery)||0)/150))}
function artMasteryMult(a){return 1+artMasteryLevel(a)*0.02}
function gainArtMastery(a,n){
  if(!a)return '';
  const before=artMasteryLevel(a);
  a.mastery=Math.min(750,(a.mastery||0)+Math.max(1,Math.floor(n||1)));
  const after=artMasteryLevel(a);
  if(after>before)return '<p class="good">你对《'+esc(a.name)+'》的运用愈发纯熟（熟练度 Lv.'+after+'，修炼效率 ×'+artMasteryMult(a).toFixed(2)+'）。</p>';
  return '';
}
/* 8.1 灵根品质修炼乘数：伪灵根 0.6× … 天灵根 1.5× */
function rootQualityMult(r){
  if(r>=95)return 1.5;
  if(r>=85)return 1.35;
  if(r>=70)return 1.2;
  if(r>=50)return 1;
  if(r>=30)return 0.8;
  return 0.6;
}
/* 8.1/8.2 灵根纯度副业加成：火炼丹、金炼器、木种药、水制符、土布阵 */
function elemCraftBonus(prof){
  const r=elemOf(S);
  const map={alchemy:'fire',forge:'metal',farm:'wood',talisman:'water',array:'earth'};
  return map[prof]===r?0.15:0;
}
/* 武器相性：同属法器攻势 +1；五行克制敌方时伤害 ×1.25 */
function elemWeaponBonus(s){const w=s.weapon;if(!w||!w.elem)return 0;return rootAffinity(s,w.elem)?1:0}
function weaponMasterBonus(s){if(!s.weapon)return 0;return Math.min(5,Math.floor(((s.weaponMaster&&s.weaponMaster[s.weapon.name])||0)/2))}
function weaponGainMastery(s){
  if(!s||!s.weapon)return;
  const k=s.weapon.name;
  s.weaponMaster=s.weaponMaster||{};
  const m=(s.weaponMaster[k]||0)+1;
  s.weaponMaster[k]=m;
  if(m%2===0&&Math.floor(m/2)<=5)log('<p class="good">你对「'+esc(k)+'」的运用愈发纯熟（兵器熟练 +1，攻势加成 +'+Math.floor(m/2)+'）。</p>');
}

/* ---------- 受伤机制 ---------- */
const INJURY_DEFS={
  neijing:{n:'经脉受损',atr:'agi',d:-2,temp:true,days:45,desc:'经脉淤塞，身法 -2。静养或服疗伤丹可愈。'},
  shenhun:{n:'神魂受创',atr:'int',d:-2,temp:true,days:60,desc:'神魂震荡，智慧 -2。静养或服安神丹可愈。'},
  jiqiao:{n:'筋骨挫伤',atr:'str',d:-2,temp:true,days:40,desc:'筋骨受损，力量 -2。静养或服疗伤丹可愈。'},
  neishang:{n:'内伤未愈',hp:0.15,temp:true,days:30,desc:'脏腑受创，气血上限 -15%。静养或服回春丹可愈。'},
  gendi:{n:'道基受损',root:-8,temp:false,days:0,desc:'道基裂痕，灵根 -8。唯洗髓丹可医。'},
};
function applyInjury(id){
  if(!S)return '';
  S.injuries=S.injuries||[];
  const def=INJURY_DEFS[id];
  if(!def)return '';
  const old=S.injuries.find(x=>x.id===id);
  if(old){old.left=Math.max(old.left,def.days||1);return '<p class="danger">旧伤未愈又添新创：「'+def.n+'」愈发严重。</p>'}
  S.injuries.push({id:id,left:def.days||1});
  if(chance(0.25)&&!S.flag.hardshipCd){
    S.flag.hardshipCd=25;
    const gw=growWil(0.95,'宝剑锋从磨砺出，道心愈发坚韧');
    if(gw)log(gw);
  }
  if(S.maxHp!==calcMaxHp(S)){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
  return '<p class="danger">🩸 你受了伤：<b>'+def.n+'</b>——'+def.desc+'</p>';
}
function injuryAttrPenalty(s,k){
  let n=0;
  for(const i of (s.injuries||[])){const d=INJURY_DEFS[i.id];if(d&&d.atr===k&&d.temp)n+=(d.d||0)}
  return n;
}
function injuryRootPenalty(s){let n=0;for(const i of (s.injuries||[])){const d=INJURY_DEFS[i.id];if(d&&d.root)n+=(d.root||0)}return n}
function injuryHpPenalty(s){return (s.injuries||[]).some(i=>i.id==='neishang')?Math.floor((40+s.attrs.str*3+Math.floor(powR(s.realm)*15))*0.15):0}
function injuryHtml(s){
  return (s.injuries||[]).map(i=>{const d=INJURY_DEFS[i.id];return '<span class="tag" style="color:#e08a8a;border-color:#7a4a4a">🩸 '+d.n+(d.temp?'（'+Math.max(0,i.left)+'日）':'（顽疾）')+'</span>'}).join(' ');
}
function cureInjury(id,via){
  if(!S)return false;
  const idx=(S.injuries||[]).findIndex(x=>x.id===id);
  if(idx<0)return false;
  S.injuries.splice(idx,1);
  log('<p class="good">🩹 '+(via||'一番调养')+'后，「'+INJURY_DEFS[id].n+'」痊愈了。</p>');
  if(S.maxHp!==calcMaxHp(S)){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
  return true;
}
function restCure(days){
  if(!S)return {had:0,cured:0};
  const had=(S.injuries||[]).length;
  let cured=0;
  S.injuries=(S.injuries||[]).filter(i=>{
    const d=INJURY_DEFS[i.id];
    if(!d.temp)return true;
    i.left-=days;
    if(i.left<=0){cured++;return false}
    return true;
  });
  if(S.maxHp!==calcMaxHp(S)){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
  return {had:had,cured:cured};
}
function tickInjuries(days){
  if(!S||!S.injuries||!S.injuries.length)return;
  const before=S.injuries.length;
  S.injuries=S.injuries.filter(i=>{
    const d=INJURY_DEFS[i.id];
    if(!d.temp)return true;
    i.left-=days;
    if(i.left<=0){log('<p class="good">🩹 静养经年，「'+d.n+'」已自然痊愈。</p>');return false}
    return true;
  });
  if(S.injuries.length!==before&&S.maxHp!==calcMaxHp(S)){S.maxHp=calcMaxHp(S);if(S.hp>S.maxHp)S.hp=S.maxHp}
}

/* ---------- 好感 / 决裂 / 仇视 ---------- */
function favorChange(n,delta,reason){
  if(!n)return false;
  /* 自建宗门 · 会客厅：正向好感 +2/级（不含道侣） */
  if(delta>0&&n!==S.daoPartner&&typeof ownSectFavorBonus==='function'){
    const hk=ownSectFavorBonus();
    if(hk)delta+=hk;
  }
  n.favor=clamp((n.favor||0)+(delta||0),-10,100);
  propagateRelations(n,delta);
  const who=esc(n.name||'对方');
  if(delta<0)log('<p class="danger">'+reason+'（'+who+' 好感 '+delta+'，现 '+n.favor+'）。</p>');
  else if(delta>0)log('<p>'+reason+'（'+who+' 好感 +'+delta+'，现 '+n.favor+'）。</p>');
  /* 道侣：好感 ≤ 20 → 姻缘断绝 + 仇视 */
  if(n===S.daoPartner&&n.favor<=20){
    /* 缓冲：先冷战三日，仍无转圜才断缘 */
    if(n.favor>12&&!n.cold){
      n.cold=3;
      log('<p class="danger">💔 '+who+' 神色冷淡：「我想静一静。」——你们进入<b>冷战</b>，三日后再看转圜。（好感再降或冷战期间再惹恼，恐会彻底决裂）</p>');
      renderAll();
      return true;
    }
    const days=rand(30,60);
    const p=n;
    S.daoPartner=null;
    p.foe=true;p.hate=days;
    S.flag.exHate={name:p.name,role:p.role,stage:p.stage||0,atk:p.atk||6,hp:p.hp||30,days:days};
    log('<p class="danger">💔 '+who+' 面如寒霜，拂袖而去：「你我缘分已尽，自此恩断义绝！」——姻缘断绝，此后 <b>'+days+' 日</b>内，'+who+' 或在仙途之上寻你晦气！</p>');
    renderAll();
    return true;
  }
  /* 普通角色：好感 ≤ 0 → 交恶仇视 */
  if(n!==S.daoPartner&&n.favor<=0&&!n.foe){
    n.foe=true;n.hate=(n.hate||0)+rand(30,60);
    S.flag.foesMade=(S.flag.foesMade||0)+1;
    if(typeof addNpcMemory==='function')addNpcMemory(n,'仇恨','我与他结下死仇');
    log('<p class="danger">⚔️ '+who+' 冷笑一声：「今日之事，我记下了。」——自此与你<b>交恶</b>，江湖路上或会寻仇！</p>');
    renderAll();
    return true;
  }
  return false;
}
/* 关系网联动：你对某人的好恶会牵动其身边之人 */
function propagateRelations(n,delta){
  if(!n||!delta||!S.npcs)return;
  const amt=delta>0?Math.ceil(delta*0.3):Math.floor(delta*0.3);
  if(!amt)return;
  const rs=n.rels||{};
  for(const name in rs){
    const r=rs[name];
    const other=S.npcs.find(x=>x.name===name);
    if(!other||other===n)continue;
    if(r.type==='宿敌'||r.type==='恩怨'){
      other.favor=clamp(other.favor-amt,-10,100);
      if(other.favor<=0&&!other.foe){other.foe=true;other.hate=(other.hate||0)+rand(20,40);log('<p class="sys">风闻你与'+esc(n.name)+'之事，'+esc(other.name)+'（'+(other.role||'故人')+'）冷笑着与你划清界限——结怨更深。</p>')}
    }else if(r.type==='暗恋'&&S.daoPartner===n&&delta>0){
      other.favor=clamp(other.favor-amt*2,-10,100);
      log('<p class="sys">'+(other.gender==='女'?'她':'他')+'（'+esc(other.name)+'）远远望见你与道侣亲昵，神色黯然地移开了目光（好感 -'+amt*2+'）。</p>');
    }else if(r.type==='同门'||r.type==='旧识'||r.type==='青梅'||r.type==='挚友'||r.type==='师徒'){
      other.favor=clamp(other.favor+amt,-10,100);
    }
  }
}
function tickHates(days){
  if(!S)return;
  const ex=S.flag.exHate;
  if(ex&&ex.days>0){
    ex.days-=days;
    if(ex.days<=0){log('<p class="sys">前尘恩怨随风散，'+esc(ex.name||'故人')+' 已不再寻你麻烦。</p>');S.flag.exHate=null}
  }
  const seen={};
  for(const n of (S.npcs||[])){
    if(n.cold>0){
      n.cold-=days;
      if(n.cold<=0&&n===S.daoPartner){n.cold=0;n.favor=clamp(n.favor+2,0,100);log('<p class="sys">'+esc(n.name)+' 神色渐缓：「那日是我冲动了。」——冷战消融，情缘略有回温（好感+2）。</p>')}
    }
    if(n.hate>0){
      n.hate-=days;
      if(n.hate<=0&&n.foe){n.foe=false;n.favor=Math.max(n.favor,15);log('<p class="sys">'+esc(n.name)+' 放下了旧怨，愿再与你往来。</p>')}
    }
    if(n.cd){for(const k in n.cd)n.cd[k]=Math.max(0,(n.cd[k]||0)-days)}
    if(n.name)seen[n.name]=1;
  }
  /* 存档读回后道侣与 NPC 可能分裂为两个对象：单独推进其冷却，避免永久卡死 */
  if(S.daoPartner&&!seen[S.daoPartner.name]){
    const p=S.daoPartner;
    if(p.cd){for(const k in p.cd)p.cd[k]=Math.max(0,(p.cd[k]||0)-days)}
    if(p.cold>0){p.cold-=days;if(p.cold<=0){p.cold=0;p.favor=clamp(p.favor+2,0,100);log('<p class="sys">'+esc(p.name)+' 神色渐缓：「那日是我冲动了。」——冷战消融，情缘略有回温（好感+2）。</p>')}}
  }
}
/* ===== 4.3 心魔烙印类型化 ===== */
const DEMON_TYPES={
  generic:{n:'心魔烙印',i:'😈',d:'压制心性'},
  fear:{n:'恐惧烙印',i:'🫨',d:'战斗先手 -1'},
  obsess:{n:'执念烙印',i:'🔒',d:'突破判定 -2'},
  qingjie:{n:'情劫烙印',i:'💔',d:'道侣互动易生波澜'},
  killing:{n:'杀孽烙印',i:'🗡️',d:'魔道亲和、正道疏远，天劫变强'},
  doubt:{n:'道疑烙印',i:'🌫️',d:'悟道效率 -20%'},
};
function addDemonMark(type,days){
  if(!S)return;
  S.demonMarks=S.demonMarks||[];
  const def=DEMON_TYPES[type]||DEMON_TYPES.generic;
  const old=S.demonMarks.find(m=>m.type===type);
  if(old){old.left=Math.max(old.left,days||60);return}
  S.demonMarks.push({type:type,left:days||60});
  S.heartDemons=(S.heartDemons||0)+1;
  log('<p class="danger">'+def.i+' 识海中烙下一道「'+def.n+'」'+(days?'（'+days+' 日）':'')+'——'+def.d+'。</p>');
}
function removeDemonMark(type){
  if(!S)return false;
  const i=(S.demonMarks||[]).findIndex(m=>m.type===type);
  if(i>=0){S.demonMarks.splice(i,1);S.heartDemons=Math.max(0,(S.heartDemons||0)-1);return true}
  return false;
}
function demonCount(s,type){return (s.demonMarks||[]).filter(m=>m.type===type).length}
function demonObsessPenalty(s){return demonCount(s,'obsess')*2}
function demonFearAtk(s){return demonCount(s,'fear')}
function demonDoubt(s){return demonCount(s,'doubt')>0}
function demonTick(days){
  if(!S||!S.demonMarks||!S.demonMarks.length)return;
  S.demonMarks=S.demonMarks.filter(m=>{
    m.left=(m.left||0)-days;
    if(m.left<=0){const def=DEMON_TYPES[m.type]||DEMON_TYPES.generic;log('<p class="sys">'+def.i+'「'+def.n+'」随时间缓缓淡去。</p>');S.heartDemons=Math.max(0,(S.heartDemons||0)-1);return false}
    return true;
  });
}
function demonHtml(s){
  if(!(s.demonMarks||[]).length)return '';
  return '<p style="font-size:12px;margin-top:4px;color:#e08a8a">'+(s.demonMarks||[]).map(m=>{const d=DEMON_TYPES[m.type]||DEMON_TYPES.generic;return '<span class="tag" style="color:#e08a8a;border-color:#7a4a4a">'+d.i+' '+d.n+'（'+Math.max(0,m.left)+'日）</span>'}).join(' ')+'</p>';
}
function exHateAmbush(){
  const ex=S.flag.exHate;
  if(!ex||ex.days<=0)return false;
  if(!chance(0.35))return false;
  log('<p>杀气骤临！一道身影自林间踏出——正是与你恩断义绝的 <b>'+esc(ex.name)+'</b>！</p>');
  startCombat({name:ex.name+'（寻仇）',atk:ex.atk,def:2+Math.floor(ex.stage/3),hp:ex.hp});
  return true;
}
