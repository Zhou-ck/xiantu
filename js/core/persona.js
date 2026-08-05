/* ======================================================
  仙途 · 性格与处世之道（2A/2U）
  16 性格模板库 + 复合身份（出身×性格）+ 道心漂移 + NPC 档案卡数据
  性格影响：事件选项可用性 / 判定加成 / NPC 初始好感基线 / 台词
====================================================== */
'use strict';

const PERSONALITIES=[
  {id:'gu',name:'古板剑修',tags:['正直','执拗'],desc:'剑在人在，道在剑中。规矩就是规矩，天塌下来也一样。',lines:['剑在人在，道在剑中。','规矩就是规矩，天塌下来也一样。','这一剑，我练了三十年。'],likes:'兵',bonus:{str:1},bias:{zheng:3,mo:0,san:0},axis:1,heart:'曾因固守门规，眼睁睁看着同门师兄被逐出师门，至今愧疚。'},
  {id:'dan',name:'淡雅丹师',tags:['慈悲','沉静'],desc:'药性如人性，急不得。一炉好丹，靠的是耐心。',lines:['药性如人性，急不得。','一炉好丹，靠的是耐心。','草木有情，丹炉有心。'],likes:'丹',bonus:{int:1},bias:{zheng:2,mo:0,san:1},axis:1,heart:'曾炼废一炉救命的丹，那人再没醒来。'},
  {id:'fu',name:'体弱符才',tags:['智慧','坚韧'],desc:'我命在符，不在拳脚。咳……无妨，纸上乾坤自足。',lines:['我命在符，不在拳脚。','咳……无妨，纸上乾坤自足。','这一笔，画的是天地。'],likes:'书',bonus:{int:1},bias:{zheng:1,mo:0,san:2},axis:1,heart:'天生体弱，全靠符箓续命，最恨旁人的怜悯。'},
  {id:'fo',name:'持戒佛修',tags:['慈悲','稳健'],desc:'一饮一啄，皆是因果。施主，着相了。',lines:['阿弥陀佛，施主着相了。','一饮一啄，皆是因果。','放下执念，方见如来。'],likes:'丹',bonus:{wil:1},bias:{zheng:3,mo:0,san:0},axis:1,heart:'幼年被灭门，皈依佛门却始终放不下那口血仇。'},
  {id:'wen',name:'苟命稳健',tags:['稳健','谨慎'],desc:'留得青山在，不怕没柴烧。先看看，再走走，然后……跑。',lines:['留得青山在，不怕没柴烧。','先看看，再走走，然后……跑。','活着，比什么都强。'],likes:'灵',bonus:{wil:1},bias:{zheng:1,mo:0,san:2},axis:0,heart:'曾被至亲出卖，从此再不敢全信任何人。'},
  {id:'hua',name:'话痨乐天',tags:['逍遥','开朗'],desc:'今日天气真好，道友你也这么觉得吧？活着嘛，开心最重要！',lines:['今日天气真好，道友你也这么觉得吧？','活着嘛，开心最重要！','愁也一天，笑也一天，我选笑。'],likes:'酒',bonus:{cha:1},bias:{zheng:1,mo:0,san:2},axis:1,heart:'笑脸之下，藏着一桩谁也不提的旧事。'},
  {id:'zhi',name:'执拗道痴',tags:['执拗','专注'],desc:'大道至简，唯诚而已。这一式，我已练了一万遍。',lines:['大道至简，唯诚而已。','这一式，我已练了一万遍。','别人笑我痴，我笑别人看不穿。'],likes:'书',bonus:{int:1},bias:{zheng:1,mo:0,san:2},axis:1,heart:'为悟一剑，错过了与她的最后一面。'},
  {id:'yi',name:'多疑谨慎',tags:['谨慎','狡诈'],desc:'人心隔肚皮，道友还是慢些说话。凡事留三分，总没错。',lines:['人心隔肚皮，道友慢些说话。','凡事留三分，总没错。','你信我？我都不敢全信我自己。'],likes:'灵',bonus:{int:1},bias:{zheng:0,mo:2,san:1},axis:-1,heart:'被同门背后捅过刀，从此谁都不敢全信。'},
  {id:'qing',name:'清冷仙子',tags:['清冷','坚毅'],desc:'寒山千里，独自可渡。不必靠太近，缘到自会相见。',lines:['寒山千里，独自可渡。','不必靠太近，缘到自会相见。','这人间烟火，看看就好。'],likes:'书',bonus:{wil:1},bias:{zheng:1,mo:0,san:2},axis:1,heart:'为求大道，亲手斩断了凡尘情丝，却常在月下出神。'},
  {id:'ba',name:'霸道魔修',tags:['霸道','激进'],desc:'顺我者昌，逆我者亡。修行路上，容不得半点犹豫！',lines:['顺我者昌，逆我者亡！','修行路上，容不得半点犹豫！','我不信天，只信自己这双拳头。'],likes:'兵',bonus:{str:1},bias:{zheng:0,mo:3,san:0},axis:-1,heart:'当年弱小，被欺压至亲尽丧，从此信奉拳头。'},
  {id:'jiao',name:'狡诈散修',tags:['狡诈','机敏'],desc:'明枪易躲，暗箭难防。这笔买卖，怎么算都是你亏。',lines:['明枪易躲，暗箭难防。','这笔买卖，怎么算都是你亏。','脸面值几个灵石？'],likes:'灵',bonus:{cha:1},bias:{zheng:0,mo:2,san:1},axis:-1,heart:'曾被人用善意骗走全部家当，从此善恶难信。'},
  {id:'ci',name:'慈悲医者',tags:['慈悲','仁善'],desc:'救人一命，胜造七级浮屠。这药，分文不取。',lines:['救人一命，胜造七级浮屠。','这药，分文不取。','医者仁心，见死不救，我做不到。'],likes:'材',bonus:{cha:1},bias:{zheng:3,mo:0,san:0},axis:1,heart:'救过一个人，却因此连累了一村人，至今不敢回乡。'},
  {id:'xiao',name:'逍遥浪子',tags:['逍遥','豁达'],desc:'天地一逆旅，我亦是行人。今朝有酒今朝醉。',lines:['天地一逆旅，我亦是行人。','今朝有酒今朝醉，明日愁来明日愁。','世上本无事，庸人自扰之。'],likes:'酒',bonus:{agi:1},bias:{zheng:1,mo:0,san:2},axis:1,heart:'曾立誓为一人归隐，那人却早已不在。'},
  {id:'yin',name:'隐忍遗孤',tags:['隐忍','坚韧'],desc:'人在屋檐下，不得不低头。等我站得够高……再说。',lines:['人在屋檐下，不得不低头。','等我站得够高……再说。','这口气，我咽得下。'],likes:'材',bonus:{wil:1},bias:{zheng:1,mo:1,san:1},axis:0,heart:'满门被灭，独活一人，仇人至今逍遥。'},
  {id:'re',name:'热血少年',tags:['正直','热血'],desc:'路见不平，拔刀相助！这世上，总得有人管管闲事！',lines:['路见不平，拔刀相助！','这世上，总得有人管管闲事！','怕什么，大不了并肩子上！'],likes:'兵',bonus:{str:1},bias:{zheng:2,mo:0,san:1},axis:1,heart:'曾因冲动害死同伴，从此怕再有人因自己而死。'},
  {id:'xin',name:'心机长老',tags:['狡诈','圆滑'],desc:'有些话，点到为止。这局棋，老夫已经赢了。',lines:['有些话，点到为止。','这局棋，老夫已经赢了。','年轻人，吃亏是福。'],likes:'书',bonus:{cha:1},bias:{zheng:0,mo:1,san:2},axis:-1,heart:'亲手算计过恩师，午夜梦回，常被那双眼惊醒。'},
];
const PERSONA_WORD_MAP={'豪爽':'re','温婉':'ci','圆滑':'xin','灵动':'hua','豁达':'xiao','直率':'gu','严谨':'zhi','淡泊':'qing','清冷':'qing','仁善':'ci','沉静':'dan','慈悲':'fo','悍勇':'ba','精明':'jiao','妩媚':'hua','英气':'re','妖冶':'ba','高贵':'qing','温润':'dan','阴鸷':'yi','乐天':'hua'};
/* 出身倾向：让性格与出身气质相合 */
const PERSONA_BG_BIAS={orphan:['yin','wen'],family:['zhi','xin'],villager:['ci','re'],general:['gu','re'],yao:['hua','ba'],demon:['ba','jiao'],pharmacy:['dan','ci'],exile:['yin','yi'],hunter:['re','wen'],merchant:['jiao','xin'],scholar:['zhi','dan'],smith:['gu','ba'],healer:['ci','dan'],priest:['fo','qing']};
function pickPersona(bg){
  const prefs=(bg&&PERSONA_BG_BIAS[bg.id])||[];
  const cands=prefs.length?PERSONALITIES.filter(p=>prefs.indexOf(p.id)>=0):PERSONALITIES;
  return Object.assign({},pick(cands));
}
function personaOf(s){return s&&s.persona?s.persona:null}
function personaHas(s,tag){const p=personaOf(s);return !!(p&&p.tags&&p.tags.indexOf(tag)>=0)}
function personaBonus(s,stat){const p=personaOf(s);return (p&&p.bonus&&p.bonus[stat])||0}
function personaLine(p){return p&&p.lines?pick(p.lines):'……'}
function npcPersona(n){
  if(!n)return null;
  if(n.personaObj)return n.personaObj;
  const id=typeof n.persona==='string'?PERSONA_WORD_MAP[n.persona]:null;
  n.personaObj=PERSONALITIES.find(p=>p.id===id)||PERSONALITIES.find(p=>p.id==='wen');
  return n.personaObj;
}
function npcHeart(n){const p=npcPersona(n);return p?p.heart:''}
/* 道心漂移：-100（魔）~ +100（道），行善/作恶推动，显示于仙途录 */
function driftLabel(d){
  if(d>=60)return ['道心澄明','#8fd0a0'];
  if(d>=20)return ['道心渐固','#a9c99a'];
  if(d>-20)return ['道心平和','#c9c39a'];
  if(d>-60)return ['道心蒙尘','#d9a08a'];
  return ['道心沉沦','#d96a6a'];
}
function addDrift(n){
  if(!S||!S.persona)return;
  S.persona.drift=clamp((S.persona.drift||0)+Math.sign(n||0),-100,100);
}
/* 性格带来的好感基线偏移：NPC 与玩家正邪相合则更亲近 */
function personaFavorBias(n){
  const pp=personaOf(S),np=npcPersona(n);
  if(!pp||!np)return 0;
  const pv=(pp.bias&&pp.bias.zheng||0)-(pp.bias&&pp.bias.mo||0);
  const nv=(np.bias&&np.bias.zheng||0)-(np.bias&&np.bias.mo||0);
  if(Math.sign(pv)===Math.sign(nv)&&pv!==0)return Math.min(3,Math.abs(pv));
  if(Math.sign(pv)!==Math.sign(nv)&&pv!==0&&nv!==0)return -2;
  return 0;
}
