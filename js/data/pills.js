/* ======================================================
  仙途 · 丹药数据表（v50）
  说明：RESEARCH_RECIPES 研创丹方（craft.js 加载时并入炼丹配方）
        PILL_TOX 丹毒值表（服丹累计，过高惩罚；负数表示排毒）
====================================================== */
'use strict';
const RESEARCH_RECIPES=[
  {name:'排毒丹',lv:2,need:{herb:2,sherb:1},cost:150,dc:17,q:2,eff:'detox',research:true,desc:'清解丹毒（丹毒 -15）。'},
  {name:'聚气散',lv:2,need:{herb:2},cost:120,dc:16,q:1,eff:'essence2',research:true,desc:'服之修为 +300~500。'},
  {name:'凝神丹',lv:2,need:{sherb:1,herb:2},cost:200,dc:18,q:2,eff:'mood2',research:true,desc:'服之心境 +20，突破心性判定 +2。'},
  {name:'暴血丹',lv:3,need:{herb:2,pelt:1},cost:300,dc:20,q:2,eff:'blood',research:true,desc:'战前吞服，攻击 +6（一场战斗）。'},
  {name:'悟道丹',lv:3,need:{sherb:2,demonCore:1},cost:500,dc:22,q:3,eff:'insight',research:true,desc:'服之悟道 +1（修为小进）。'},
  {name:'固本丹',lv:4,need:{sherb:2,demonCore:1},cost:600,dc:24,q:3,eff:'guben',research:true,desc:'突破失败不损修为（一次）。'},
  {name:'五行丹',lv:4,need:{sherb:2,demonCore:1,jade:1},cost:800,dc:25,q:3,eff:'wuxing',research:true,desc:'服后 60 日内五行克敌伤害 +10%。'},
  {name:'回天丹',lv:5,need:{sherb:3,demonCore:2,jade:1},cost:1500,dc:28,q:4,eff:'huitian',research:true,desc:'气血尽复并愈全部伤势（丹药上品）。'},
];
/* 丹毒表：name → 丹毒值（正数为累积，负数为排解） */
const PILL_TOX={
  回春丹:2,聚灵丹:6,清心丹:5,破境丹:8,洗髓丹:10,延寿丹:12,千年灵乳:4,悟道茶:2,
  洗灵露:6,筑基丹:6,锻体丹:4,轻身丹:4,通慧丹:4,疗伤丹:3,安神丹:4,朱果:2,
  圣泉灵水:5,灵泉水:1,福地玉简:3,排毒丹:-15,悟道丹:6,凝神丹:5,五行丹:8,
  暴血丹:8,固本丹:5,聚气散:3,回天丹:12,
};
function pillTox(name){return PILL_TOX[name]!==undefined?PILL_TOX[name]:0}
