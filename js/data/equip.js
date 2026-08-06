/* ======================================================
  仙途 · 装备数据表（v49）
  说明：EQUIP_SETS 套装 / GEM_DEFS 宝石 / AFFIX_POOL 词条
  宝石以 type:'gem' + gemId 物品形式进入行囊，镶嵌后入装备 gems[]
====================================================== */
'use strict';
/* 套装：2 件 / 3 件效果（三槽内同 set 计数） */
const EQUIP_SETS=[
  {id:'wuxing',name:'五行轮转',i:'☯️',desc:'五行相生，攻守流转',
    pieces:{2:'五行克敌伤害 +10%',3:'被克受创 -10% · 五行克敌伤害再 +10%'},
    bonus:{beat:0.1,beatDef:0.1}},
  {id:'jianxin',name:'剑心通明',i:'🗡️',desc:'剑修本命，锋芒毕露',
    pieces:{2:'攻势 +2 · 战意获取 +1',3:'战斗首击伤害 ×1.3'},
    bonus:{atk:2,tech:1,first:0.3}},
  {id:'xiexue',name:'噬血魔纹',i:'🌑',desc:'以血养器，以战养战',
    pieces:{2:'战斗吸血 5%',3:'业力越高攻击越高（+业力/20）'},
    bonus:{drain:0.05,karmaAtk:0.05}},
  {id:'xiaoyao',name:'逍遥游',i:'🦅',desc:'天地逍遥，来去自如',
    pieces:{2:'探索避凶 +5 · 遁走判定 +2',3:'身法 +2 · 战后灵石 +5%'},
    bonus:{dodge:2,exploreSafe:5,escape:2,stones:0.05}},
];
/* 宝石：stat 为生效属性（atk/def/agi/hp/luck/beat），val 为数值 */
const GEM_DEFS=[
  {id:'g_fire',name:'火灵石',i:'🔥',stat:'beat',val:0.03,desc:'镶嵌后五行克敌伤害 +3%'},
  {id:'g_water',name:'水灵石',i:'💧',stat:'beat',val:0.03,desc:'镶嵌后五行克敌伤害 +3%'},
  {id:'g_metal',name:'金灵石',i:'⚙️',stat:'atk',val:1,desc:'镶嵌后攻势 +1'},
  {id:'g_wood',name:'木灵石',i:'🌿',stat:'def',val:1,desc:'镶嵌后防御 +1'},
  {id:'g_earth',name:'土灵石',i:'⛰️',stat:'hp',val:8,desc:'镶嵌后最大气血 +8'},
  {id:'g_thunder',name:'雷灵石',i:'⚡',stat:'agi',val:1,desc:'镶嵌后身法 +1'},
  {id:'g_iron',name:'玄铁精',i:'🪨',stat:'atk',val:1,desc:'镶嵌后攻势 +1'},
  {id:'g_jade',name:'温玉',i:'🟢',stat:'def',val:1,desc:'镶嵌后防御 +1'},
  {id:'g_pearl',name:'沧海珠',i:'🔵',stat:'hp',val:15,desc:'镶嵌后最大气血 +15'},
  {id:'g_star',name:'星陨石',i:'✨',stat:'luck',val:1,desc:'镶嵌后气运 +1'},
];
/* 词条池：stat 生效属性，val 数值；洗练随机抽取不重复 */
const AFFIX_POOL=[
  {id:'fengrui',name:'锋锐',desc:'攻势 +1',stat:'atk',val:1},
  {id:'jianren',name:'坚韧',desc:'防御 +1',stat:'def',val:1},
  {id:'xunjie',name:'迅捷',desc:'身法 +1',stat:'agi',val:1},
  {id:'huixin',name:'慧心',desc:'智慧 +1',stat:'int',val:1},
  {id:'lingxi',name:'灵犀',desc:'魅力 +1',stat:'cha',val:1},
  {id:'xisui',name:'洗髓',desc:'心性判定 +1',stat:'wil',val:1},
  {id:'wuxing',name:'五行亲和',desc:'五行克敌伤害 +3%',stat:'beat',val:0.03},
  {id:'jiling',name:'汲灵',desc:'战后修为 +2%',stat:'cult',val:0.02},
  {id:'jubao',name:'聚宝',desc:'灵石掉落 +5%',stat:'stones',val:0.05},
  {id:'yusha',name:'御煞',desc:'心魔抵御 +1',stat:'demon',val:1},
];
function setById(id){return EQUIP_SETS.find(s=>s.id===id)}
function gemById(id){return GEM_DEFS.find(g=>g.id===id)}
function affixById(id){return AFFIX_POOL.find(a=>a.id===id)}
