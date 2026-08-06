/* ======================================================
  仙途 · 世界地图数据表（v42）
  说明：MAP_LOCS 为水墨舆图上的全部可交互地点。
  kind：region（探索区域）/ poi（功能点）
  action：explore:<regionId> / tower / boss / dungeon
  minRealm：解锁境界（未达则迷雾锁定）
  坐标基于 viewBox 0 0 360 230，供 SVG 渲染。
====================================================== */
'use strict';
const MAP_LOCS=[
  {id:'near',name:'青石小径',icon:'🏚️',kind:'region',x:46,y:150,minRealm:0,days:3,desc:'破庙周遭的丘陵与溪谷，尚算太平。',action:'explore:near',danger:5,herb:50},
  {id:'valley',name:'灵溪幽谷',icon:'🌊',kind:'region',x:96,y:92,minRealm:1,days:4,desc:'翠谷溪鸣，灵气盎然，相传是上古药仙闭关之地。',action:'explore:valley',danger:6,herb:65},
  {id:'hill',name:'荒山野岭',icon:'⛰️',kind:'region',x:150,y:56,minRealm:0,days:5,desc:'乱石嶙峋，时有妖兽出没，也藏着散修的旧洞。',action:'explore:hill',danger:12,herb:35},
  {id:'forest',name:'暮色深林',icon:'🌲',kind:'region',x:216,y:118,minRealm:3,days:7,desc:'古木参天，瘴气弥漫，传闻林中有一处上古药园。',action:'explore:forest',danger:18,herb:55},
  {id:'cliff',name:'断魂崖',icon:'🪨',kind:'region',x:268,y:52,minRealm:6,days:8,desc:'悬崖千仞，云雾之下隐约有龙吟声传来。',action:'explore:cliff',danger:35,herb:25},
  {id:'ruin',name:'古战场遗迹',icon:'⚔️',kind:'region',x:306,y:150,minRealm:25,days:10,desc:'焦土千里，残旗断戟，一场灭世之战的遗骸。',action:'explore:ruin',danger:55,herb:30},
  {id:'abyss',name:'荒古禁地',icon:'🌑',kind:'region',x:184,y:192,minRealm:17,days:12,desc:'九界禁区，上古大能陨落之地，一步一劫。',action:'explore:abyss',danger:60,herb:60},
  {id:'tower',name:'试炼塔',icon:'🏔️',kind:'poi',x:124,y:150,minRealm:2,days:0,desc:'古修留下的历练之塔，一层一关，每五层有守塔统领。',action:'tower'},
  {id:'boss',name:'守关试炼',icon:'⛩️',kind:'poi',x:236,y:56,minRealm:0,days:0,desc:'当前境界的守关大妖，击败可得重赏。',action:'boss'},
  {id:'dungeon',name:'秘境入口',icon:'🏛️',kind:'poi',x:66,y:56,minRealm:2,days:0,desc:'剑冢、洞府、遗迹、巢穴、残梦——秘境之门随时辰轮转。',action:'dungeon'},
];
/* 地图装饰：水墨山/河/林，确定性伪随机生成（固定种子），保证各端一致 */
const MAP_SEED=20260806;
function mapRng(seed){
  let t=seed>>>0;
  return function(){t+=0x6D2B79F5;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return ((r^(r>>>14))>>>0)/4294967296};
}
function mapLoc(id){return MAP_LOCS.find(l=>l.id===id)}
function mainVisitTarget(){
  if(typeof S==='undefined'||!S||!S.quest||!S.quest.main)return null;
  const st=mainStep();
  return st&&st.type==='visit'?st.param:null;
}
