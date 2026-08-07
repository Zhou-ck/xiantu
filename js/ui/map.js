/* ======================================================
  仙途 · 世界地图（v42）
  水墨 SVG 舆图：7 探索区域 + 试炼塔 + 守关 + 秘境入口，
  迷雾锁定、任务 📌、点击选点详情、一键前往。
  数据表：js/data/map.js（MAP_LOCS）
====================================================== */
'use strict';
let MAP_SEL=null;
const MAP_BG_IMG='assets/scenes/map.jpg';
/* v67 探索地点缩略图：区域 → 场景图，选点卡与详情卡共用 */
const REGION_THUMB={near:'assets/scenes/market.jpg',valley:'assets/scenes/tide.jpg',hill:'assets/scenes/beast.jpg',forest:'assets/scenes/forest.jpg',cliff:'assets/scenes/ghostgate.jpg',ruin:'assets/scenes/warcry.jpg',abyss:'assets/scenes/faceless.jpg'};
/* 水墨地形（确定性伪随机，固定种子） */
function mapTerrain(){
  const rng=mapRng(MAP_SEED);
  let s='';
  /* 远山 */
  for(let i=0;i<7;i++){
    const bx=20+rng()*320,by=20+rng()*150,w=30+rng()*50,h=12+rng()*26;
    s+='<path d="M'+(bx-w)+' '+by+' Q'+bx+' '+(by-h)+' '+(bx+w)+' '+by+'" fill="none" stroke="rgba(140,160,200,.28)" stroke-width="1.4"/>';
  }
  /* 灵溪（河） */
  s+='<path d="M96 88 Q78 112 96 132 Q116 152 104 176 Q96 196 112 214" fill="none" stroke="rgba(120,180,220,.35)" stroke-width="3.5" stroke-linecap="round"/>';
  /* 古战场焦土 */
  for(let i=0;i<6;i++){
    const bx=272+rng()*60,by=120+rng()*70,r=5+rng()*10;
    s+='<ellipse cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" rx="'+r.toFixed(1)+'" ry="'+(r*0.6).toFixed(1)+'" fill="rgba(120,80,70,.22)"/>';
  }
  /* 深林墨点 */
  for(let i=0;i<10;i++){
    const bx=196+rng()*44,by=96+rng()*44,r=2+rng()*4;
    s+='<circle cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="rgba(70,110,90,.4)"/>';
  }
  /* 禁地裂隙 */
  s+='<path d="M184 176 Q178 188 186 200 M192 172 Q188 186 194 198" fill="none" stroke="rgba(168,106,224,.45)" stroke-width="1.6"/>';
  /* 云雾 */
  for(let i=0;i<4;i++){
    const bx=20+rng()*320,by=40+rng()*160;
    s+='<ellipse cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" rx="'+ (18+rng()*22).toFixed(1)+'" ry="5" fill="rgba(220,230,240,.06)"/>';
  }
  return s;
}
function mapMarker(l){
  const locked=S.realm<l.minRealm;
  const sel=MAP_SEL===l.id;
  const qTarget=mainVisitTarget()===l.id;
  const visited=l.kind==='region'?(S.flag.regions&&S.flag.regions[l.id]||0):0;
  const cls='map-loc'+(locked?' locked':'')+(sel?' sel':'');
  return '<g class="'+cls+'" data-loc="'+l.id+'" onclick="selectMapLoc(\''+l.id+'\')">'+
    (locked?'<circle cx="'+l.x+'" cy="'+l.y+'" r="16" class="map-fog"/>':'<circle cx="'+l.x+'" cy="'+l.y+'" r="14" class="map-pulse"/>')+
    '<circle cx="'+l.x+'" cy="'+l.y+'" r="11" class="map-dot"/>'+
    '<text x="'+l.x+'" y="'+(l.y+4)+'" text-anchor="middle" class="map-ico">'+(locked?'🔒':l.icon)+'</text>'+
    '<text x="'+l.x+'" y="'+(l.y+26)+'" text-anchor="middle" class="map-name">'+esc(l.name)+'</text>'+
    (qTarget&&!locked?'<text x="'+(l.x+16)+'" y="'+(l.y-8)+'" text-anchor="middle" class="map-pin">📌</text>':'')+
    (visited?'<text x="'+(l.x+15)+'" y="'+(l.y+10)+'" text-anchor="middle" class="map-visit">'+visited+'</text>':'')+
    '</g>';
}
function mapSvg(){
  if(!S)return '<p class="sys">尚未踏入仙途。</p>';
  const locked=MAP_LOCS.filter(l=>S.realm<l.minRealm);
  const fogNote=locked.length?'<p class="sys">迷雾深处：'+(locked.map(l=>esc(l.name)+'（'+REALMS[Math.min(l.minRealm,REALMS.length-1)]+'）').join('、'))+'</p>':'';
  return '<div class="map-wrap">'+
    '<svg class="world-map" viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="九州舆图">'+
    '<rect width="360" height="230" fill="url(#map-bg)"/>'+
    '<image href="'+MAP_BG_IMG+'" x="0" y="0" width="360" height="230" preserveAspectRatio="xMidYMid slice" opacity="0.9"/>'+
    '<rect width="360" height="230" fill="rgba(8,12,22,.28)"/>'+
    '<defs><linearGradient id="map-bg" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="#141a2a"/><stop offset="1" stop-color="#0d111d"/>'+
    '</linearGradient></defs>'+
    mapTerrain()+
    MAP_LOCS.map(mapMarker).join('')+
    '</svg>'+fogNote+'</div>';
}
function mapDetail(){
  if(!S)return '';
  const l=MAP_SEL?mapLoc(MAP_SEL):null;
  if(!l)return '<div class="map-detail"><p class="sys">点击地图上的地点查看详情，再行前往。</p></div>';
  const locked=S.realm<l.minRealm;
  const visited=l.kind==='region'?(S.flag.regions&&S.flag.regions[l.id]||0):0;
  const qTarget=mainVisitTarget()===l.id;
  const thumb=REGION_THUMB[l.id]||'';
  return '<div class="map-detail">'+(thumb?'<img class="map-detail-thumb" src="'+thumb+'" alt="" loading="lazy">':'')+'<div class="nm">'+l.icon+' '+esc(l.name)+(locked?' <span class="tag" style="color:#e08a6a">🔒 迷雾</span>':'')+(qTarget?' <span class="tag" style="color:#e8d9a8">📌 主线目标</span>':'')+'</div>'+
    '<div class="ds">'+esc(l.desc)+'</div>'+
    '<div class="bd-row"><span>境界要求</span><b>'+REALMS[Math.min(l.minRealm,REALMS.length-1)]+'</b></div>'+
    (l.days?'<div class="bd-row"><span>往返耗时</span><b>约 '+l.days+' 日</b></div>':'')+
    (l.kind==='region'?'<div class="bd-row"><span>到访次数</span><b>'+(visited||'未涉足')+'</b></div>':'')+
    (l.danger?'<div class="bd-row"><span>凶险指数</span><b>'+l.danger+'</b></div>':'')+
    '<div class="row" style="margin-top:8px">'+
    '<button class="small primary" onclick="travelTo(\''+l.id+'\')">'+(locked?'迷雾锁路，无法前往':'前往')+'</button>'+
    (l.kind==='region'&&visited>0?'<button class="small" onclick="exploreTome()">📖 行迹</button>':'')+
    '</div></div>';
}
/* v67 地点速览卡：缩略图 + 名称 + 耗时/凶险 + 一键前往 */
function locCard(l){
  const locked=S.realm<l.minRealm;
  const thumb=REGION_THUMB[l.id]||'';
  const visited=l.kind==='region'?(S.flag.regions&&S.flag.regions[l.id]||0):0;
  return '<button class="loc-card'+(locked?' locked':'')+'" onclick="travelTo(\''+l.id+'\')">'+
    '<span class="loc-imgwrap">'+(thumb?'<img class="loc-img" src="'+thumb+'" alt="" loading="lazy" onload="this.classList.add(\'ld\')">':'')+'<i class="loc-emoji">'+(locked?'🔒':l.icon)+'</i></span>'+
    '<span class="loc-tx"><b>'+esc(l.name)+'</b><small>'+(locked?REALMS[Math.min(l.minRealm,REALMS.length-1)]+' 后解锁':'约 '+(l.days||0)+' 日 · 凶险 '+(l.danger||0))+(visited?' · 已访 '+visited:'')+'</small></span>'+
    '</button>';
}
function mapHtml(){
  const qt=mainVisitTarget();
  const ql=qt?mapLoc(qt):null;
  return '<p class="sys">（时令：'+seasonLabel()+' · '+seasonDesc()+'）'+(typeof themeLabel==='function'&&themeLabel()?'<br>（赛季：'+themeLabel()+'）':'')+'</p>'+
    (ql?'<div class="map-quest"><b>📌 主线目标：'+esc(ql.name)+'</b><button class="small primary" onclick="selectMapLoc(\''+ql.id+'\')">查看</button></div>':'')+
    mapSvg()+
    mapDetail()+
    '<div class="loc-grid">'+MAP_LOCS.filter(l=>S.realm>=l.minRealm).map(locCard).join('')+'</div>'+
    '<div class="row" style="margin-top:10px">'+
    '<button class="small" onclick="exploreTome()">📖 行迹图鉴</button>'+
    '<button class="small" onclick="panelDungeonList()">🏛️ 秘境之门</button>'+
    '<button class="small" onclick="panelQuests()">📜 任务日志</button>'+
    '</div>';
}
function selectMapLoc(id){
  MAP_SEL=id;
  renderMapPanel();
}
function renderMapPanel(){
  if(!S)return;
  openPanel('🗺️ 九州舆图',mapHtml());
}
function openMap(selId){
  MAP_SEL=selId||null;
  if(!S){toast('尚未踏入仙途');return}
  closePanel();
  renderMapPanel();
}
function panelMap(){
  openMap(MAP_SEL);
}
/* 前往执行：区域 → doExplore；功能点 → 对应系统 */
function travelTo(id){
  if(!S)return;
  const l=mapLoc(id);
  if(!l)return;
  if(S.realm<l.minRealm){toast('迷雾锁路：需 '+REALMS[Math.min(l.minRealm,REALMS.length-1)]+' 方可踏入');return}
  closePanel();
  if(l.action==='tower'){doTower();return}
  if(l.action==='boss'){bossBattle();return}
  if(l.action==='dungeon'){panelDungeonList();return}
  if(l.action==='sword'){swordTrial();return}
  if(l.action&&l.action.indexOf('explore:')===0){doExplore(l.action.split(':')[1]);return}
  toast('此处尚无可去之事');
}
/* 秘境之门：列出全部秘境副本（地图 POI 入口） */
function panelDungeonList(){
  if(!S){toast('尚未踏入仙途');return}
  if(S.realm<2){toast('炼气三层后开启秘境之门');return}
  const rows=Object.keys(DUNGEONS).map(k=>{
    const d=DUNGEONS[k];
    const done=!!(S.flag.dungeonDone&&S.flag.dungeonDone[k]);
    return '<div class="item-card"><div class="nm">🏛️ '+esc(d.name)+(done?' <span class="tag" style="color:#8fd0a0">已通关</span>':'')+'</div>'+
      '<div class="ds">共 '+d.rooms.length+' 重险关，选择决定收获'+(done?'（可再探刷取机缘）':'')+'</div>'+
      '<div style="margin-top:8px"><button class="small primary" onclick="enterDungeon(\''+k+'\')">进入秘境</button></div></div>';
  }).join('');
  openPanel('🏛️ 秘境之门','<p>剑冢、洞府、遗迹、巢穴、残梦、寒渊——秘境之门随时辰轮转，各有因果。</p>'+rows+'<p style="font-size:12px;color:#6f7a94">部分秘境亦会由信物与奇遇开启，此门只是其一。</p>');
}
