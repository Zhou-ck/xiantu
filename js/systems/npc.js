/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ NPC ================
====================================================== */
'use strict';
/* ================= NPC ================= */
const NPC_POOL=[
  {role:'散修剑客',desc:'独行三千里，剑下无虚名。',style:'str',gender:'男',persona:'豪爽',taste:'兵',chat:['剑道','江湖']},
  {role:'采药女',desc:'终日在山间采药，识得百草。',style:'int',gender:'女',persona:'温婉',taste:'材',chat:['草木','丹道']},
  {role:'酒馆掌柜',desc:'消息灵通，三教九流皆识。',style:'cha',gender:'男',persona:'圆滑',taste:'灵',chat:['奇闻','商道']},
  {role:'妖族狐女',desc:'月下踏歌而来，媚而不妖。',style:'cha',gender:'女',persona:'灵动',taste:'灵',chat:['风月','秘境']},
  {role:'老乞丐',desc:'看似潦倒，眼中却时有精光。',style:'wil',gender:'男',persona:'豁达',taste:'丹',chat:['人生','道心']},
  {role:'铁匠',desc:'打铁三十年，曾铸过仙家兵刃。',style:'str',gender:'男',persona:'直率',taste:'材',chat:['兵器','炼器']},
  {role:'书阁执事',desc:'看守藏书阁，通晓百家典籍。',style:'int',gender:'男',persona:'严谨',taste:'书',chat:['典籍','阵法']},
  {role:'神秘道人',desc:'云游四方，行踪诡秘。',style:'wil',gender:'男',persona:'淡泊',taste:'书',chat:['天道','玄机']},
  {role:'古琴乐师',desc:'一曲清商动九霄，弦上自有天地。',style:'cha',gender:'女',persona:'清冷',taste:'书',chat:['音律','风雅']},
  {role:'云游医修',desc:'药箱里装着半个江湖的命。',style:'wil',gender:'女',persona:'仁善',taste:'材',chat:['医道','草药']},
  {role:'丹房女修',desc:'丹炉前一站百年，火候分寸了然于心。',style:'int',gender:'女',persona:'沉静',taste:'丹',chat:['丹道','炉火']},
  {role:'佛门行者',desc:'袈裟染尘，手中一串念珠却清亮如初。',style:'wil',gender:'男',persona:'慈悲',taste:'丹',chat:['禅理','轮回']},
  {role:'猎妖人',desc:'妖皮为衣，妖骨为弓，专走凶险之地。',style:'str',gender:'男',persona:'悍勇',taste:'兵',chat:['妖兽','猎术']},
  {role:'行商大贾',desc:'足迹踏遍九界商路，灵石于他不过是数字。',style:'cha',gender:'男',persona:'精明',taste:'灵',chat:['商道','行情']},
  {role:'狐仙苏苏',desc:'月下狐仙，媚骨天成，眼波流转间摄人心魄。',style:'cha',gender:'女',persona:'妩媚',taste:'灵',chat:['风月','秘境']},
  {role:'剑阁女侠',desc:'一柄青锋照月明，飒爽英姿不让须眉。',style:'str',gender:'女',persona:'英气',taste:'兵',chat:['剑道','江湖']},
  {role:'月下琴姬',desc:'抚琴弄月，一曲清商动九霄。',style:'cha',gender:'女',persona:'清冷',taste:'书',chat:['音律','风雅']},
  {role:'灵药仙子',desc:'药圃仙子，指尖带着百草的清香。',style:'int',gender:'女',persona:'温婉',taste:'丹',chat:['丹道','草木']},
  {role:'魔道妖女',desc:'红衣似血，魅影如风，正邪之间游走。',style:'cha',gender:'女',persona:'妖冶',taste:'灵',chat:['秘辛','魔道']},
  {role:'龙族公主',desc:'龙族天骄，眉心一点龙纹，傲然于世。',style:'str',gender:'女',persona:'高贵',taste:'材',chat:['龙族','秘境']},
  {role:'白衣剑仙',desc:'白衣胜雪，剑气凌云，人间谪仙。',style:'str',gender:'男',persona:'清冷',taste:'酒',chat:['剑道','道途']},
  {role:'儒雅书仙',desc:'执笔天下，温润如玉，谈笑间皆是风雅。',style:'int',gender:'男',persona:'温润',taste:'书',chat:['典籍','阵法']},
  {role:'魔道圣女',desc:'魔域圣女，红衣似火，眉间一点朱砂，正邪难辨。',style:'cha',gender:'女',persona:'妖冶',taste:'灵',chat:['魔道','秘辛']},
  {role:'冰宫仙子',desc:'北境冰宫传人，一袭白衣不染尘，性如寒冰。',style:'int',gender:'女',persona:'清冷',taste:'书',chat:['典籍','音律']},
  {role:'琴阁双姝',desc:'琴阁双姝之一，一曲清商，弦上可走万马千军。',style:'cha',gender:'女',persona:'温婉',taste:'书',chat:['音律','风雅']},
  {role:'商道女财神',desc:'手握九界半数商路的女财神，算盘一响，灵石万两。',style:'cha',gender:'女',persona:'精明',taste:'灵',chat:['商道','行情']},
  {role:'昆仑剑侍',desc:'昆仑山门的剑侍，剑心澄澈，不问俗务。',style:'str',gender:'女',persona:'清冷',taste:'兵',chat:['剑道','道途']},
  {role:'妖族豹女',desc:'豹族妖女，行动如风，野性难驯。',style:'agi',gender:'女',persona:'豪爽',taste:'兵',chat:['妖兽','猎术']},
];
/* 角色关系网：相识之人之间也有同门、旧识、宿敌、暗恋、挚友等羁绊 */
const REL_TYPES=['同门','旧识','青梅','宿敌','暗恋','挚友','恩怨','师徒'];
function relLabel(t){return t==='同门'?'同门旧谊':t==='旧识'?'故交旧识':t==='青梅'?'青梅竹马':t==='宿敌'?'宿怨':t==='暗恋'?'暗藏情愫':t==='挚友'?'莫逆之交':t==='恩怨'?'前尘恩怨':'授业之谊'}
function buildRelations(list){
  for(let i=0;i<list.length;i++){
    const n=list[i];
    n.rels={};
    const cnt=rand(1,3);
    let guard=0;
    while(Object.keys(n.rels).length<cnt&&guard++<8){
      const j=rand(0,list.length-1);
      if(j===i||list[j].foe||list[j].name===n.name)continue;
      if(n.rels[list[j].name])continue;
      const t=pick(REL_TYPES);
      /* 同性更可能同门/挚友/恩怨；异性更可能青梅/暗恋 */
      if((t==='暗恋'||t==='青梅')&&n.gender===list[j].gender&&!chance(0.2))continue;
      n.rels[list[j].name]={type:t,strength:rand(30,90)};
    }
  }
}
function relTags(n){
  const rs=n.rels||{};
  const names=Object.keys(rs).slice(0,3);
  if(!names.length)return '';
  return '<p style="font-size:11.5px;color:#8f9cb8;margin-top:3px">🔗 '+names.map(nm=>{const r=rs[nm];return esc(nm)+'·'+relLabel(r.type)}).join(' ｜ ')+'</p>';
}
function genNPCs(s){
  const list=[];
  for(const p of NPC_POOL){
    const realm=clamp(bigStage(s.realm)+rand(-1,2),0,9);
    list.push({
      name:randomName(p.gender),role:p.role,desc:p.desc,style:p.style,gender:p.gender,
      persona:p.persona,taste:p.taste,chat:p.chat,
      favor:rand(10,45),realm:realm,stage:realm,atk:5+realm*2,hp:25+realm*15,
      teacher:chance(0.25),art:pick(ARTS),mood:rand(50,80),
      talks:0,gifts:0,growth:0,rootElem:pickRootElem(),
    });
  }
  if(s.bg&&s.bg.traits.some(t=>t.id==='exile')){
    list.push({name:'秦府执事',role:'仇家',desc:'当年构陷你父辈的秦家执事，仍在暗中搜寻你的下落。',style:'str',gender:'男',persona:'阴鸷',taste:'灵',favor:0,realm:clamp(bigStage(s.realm)+1,1,9),stage:clamp(bigStage(s.realm)+1,1,9),atk:8+bigStage(s.realm)*2,hp:35+bigStage(s.realm)*15,foe:true,mood:30,talks:0,gifts:0,growth:0,met:true,cd:{talk:0,duel:0,gift:0}});
  }
  /* 开局只与 3 位修士相识，其余须通过游历偶遇解锁 */
  const known=[];
  let guard=0;
  while(known.length<3&&guard++<40){
    const k=rand(0,list.length-1);
    if(list[k].foe||known.indexOf(k)>=0)continue;
    known.push(k);
  }
  list.forEach((n,i)=>{n.met=known.indexOf(i)>=0||!!n.foe;n.cd={talk:0,duel:0,gift:0}});
  buildRelations(list);
  return list;
}
function npcFavorLabel(f){return f>=80?'生死之交':f>=60?'莫逆之交':f>=40?'相谈甚欢':f>=20?'泛泛之交':'素昧平生'}
/* NPC 修为动态追赶：玩家修行越久，相识之人的境界也会缓慢精进，不会永远无用 */
function npcGrow(days){
  if(!S||!S.npcs)return;
  const target=bigStage(S.realm);
  for(const n of S.npcs){
    if(n.foe)continue;
    n.growth=(n.growth||0)+days;
    if(n.stage<target&&n.growth>=40&&chance(0.6)){
      n.growth-=40;n.stage=clamp(n.stage+1,0,9);n.realm=n.stage;
      n.atk=5+n.stage*2;n.hp=25+n.stage*15;
    }
  }
  if(S.daoPartner&&S.daoPartner.stage<target&&chance(0.25)){S.daoPartner.stage=clamp(S.daoPartner.stage+1,0,9);S.daoPartner.realm=S.daoPartner.stage}
}
function npcAbility(n){
  /* 高境界相识之人能提供的实质帮助：指点修为 / 护道 / 灵材 */
  return {
    teach:Math.floor((8+n.stage*6)*(0.8+n.favor/200)),
    guard:Math.floor(12+n.stage*8),
    mats:n.stage>=2?chance(0.3):false,
  };
}
