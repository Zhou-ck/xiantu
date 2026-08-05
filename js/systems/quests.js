/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 每日 / 每周任务 ================
====================================================== */
'use strict';
/* ================= 每日 / 每周任务 ================= */
const DAILY_QUESTS=[
  {id:'d_cult',icon:'🧘',name:'潜心修炼',desc:'闭关修炼 15 日',target:15,key:'cultDays',rewardText:'灵石×30（随境界上浮）',reward:{stones:30}},
  {id:'d_explore',icon:'🧭',name:'行脚四方',desc:'外出探索 2 次',target:2,key:'explore',rewardText:'灵石×25 · 草药×1',reward:{stones:25,mats:['herb',1]}},
  {id:'d_kill',icon:'⚔️',name:'斩妖除魔',desc:'击败敌人 3 名',target:3,key:'kill',rewardText:'灵石×40',reward:{stones:40}},
  {id:'d_talk',icon:'💬',name:'广结善缘',desc:'与人交谈 2 次',target:2,key:'talk',rewardText:'灵石×20 · 功德+1',reward:{stones:20,merit:1}},
  {id:'d_sect',icon:'🏯',name:'宗门效力',desc:'完成宗门任务 1 次',target:1,key:'sectTask',rewardText:'贡献点×4 · 灵石×15',reward:{contribP:4,stones:15}},
  {id:'d_craft',icon:'🔨',name:'以艺养道',desc:'炼制物品 1 次',target:1,key:'craft',rewardText:'灵石×25 · 铁矿石×1',reward:{stones:25,mats:['iron',1]}},
];
const WEEKLY_QUESTS=[
  {id:'w_realm',icon:'⚡',name:'境界精进',desc:'突破 1 个小境',target:1,key:'realm',rewardText:'灵石×120（随境界上浮）',reward:{stones:120}},
  {id:'w_dungeon',icon:'🗺️',name:'秘境之行',desc:'通关秘境 1 座',target:1,key:'dungeons',rewardText:'灵石×100 · 灵草×1',reward:{stones:100,mats:['sherb',1]}},
  {id:'w_tower',icon:'🏔️',name:'勇攀试炼塔',desc:'试炼塔累计通关 5 层',target:5,key:'tower',rewardText:'灵石×80 · 聚灵丹×1',reward:{stones:80,item:'聚灵丹'}},
];
const ITEM_REWARDS={
  '回春丹':{name:'回春丹',type:'consumable',quality:1,count:1,desc:'服之气血尽复（恢复 60% 气血）。',use:'heal',sell:60},
  '聚灵丹':{name:'聚灵丹',type:'consumable',quality:1,count:1,desc:'30 日内修炼效率 ×1.5。',use:'pill',sell:120},
  '清心丹':{name:'清心丹',type:'consumable',quality:2,count:1,desc:'涤心宁神，消除全部心魔烙印。',use:'clear',sell:200},
};
function zeroCounts(){return {cultDays:0,explore:0,kill:0,sectTask:0,craft:0,talk:0}}
function dateStr(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function weekStr(d){
  const t=new Date(d);t.setHours(0,0,0,0);
  t.setDate(t.getDate()+3-((t.getDay()+6)%7));
  const w1=new Date(t.getFullYear(),0,4);w1.setDate(w1.getDate()+3-((w1.getDay()+6)%7));
  return t.getFullYear()+'-W'+Math.round((t-w1)/(7*86400000));
}
function newDailyState(){
  const now=new Date();
  return {date:dateStr(now),week:weekStr(now),c:zeroCounts(),p:{realm:S?S.realm:0,dungeons:S?(S.flag.dungeons||0):0,tower:S?(S.flag.tower||0):0},doneD:{},doneW:{}};
}
function dC(){
  if(!S.daily)S.daily=newDailyState();
  const d=S.daily;
  if(!d.c)d.c=zeroCounts();
  if(!d.p)d.p={realm:0,dungeons:0,tower:0};
  if(!d.doneD)d.doneD={};
  if(!d.doneW)d.doneW={};
  if(!d.date)d.date=dateStr(new Date());
  if(!d.week)d.week=weekStr(new Date());
  return d;
}
function checkDaily(){
  if(!S)return;
  const d=dC();
  const now=new Date(),ds=dateStr(now),ws=weekStr(now);
  if(d.date!==ds){d.date=ds;d.c=zeroCounts();d.doneD={};}
  if(d.week!==ws){d.week=ws;d.p={realm:S.realm,dungeons:S.flag.dungeons||0,tower:S.flag.tower||0};d.doneW={};}
  for(const q of DAILY_QUESTS){if(!d.doneD[q.id]&&(d.c[q.key]||0)>=q.target){d.doneD[q.id]=true;grantDaily(q)}}
  for(const q of WEEKLY_QUESTS){if(!d.doneW[q.id]&&weekProg(q)>=q.target){d.doneW[q.id]=true;grantDaily(q)}}
}
function weekProg(q){
  const d=dC();
  if(q.key==='realm')return S.realm-(d.p.realm||0);
  if(q.key==='dungeons')return (S.flag.dungeons||0)-(d.p.dungeons||0);
  if(q.key==='tower')return (S.flag.tower||0)-(d.p.tower||0);
  return 0;
}
function grantDaily(q){
  const r=q.reward||{},st=bigStage(S.realm);
  const sc=n=>Math.floor(n*(1+st*0.15));
  let txt='';
  if(r.stones){const n=sc(r.stones);S.stones+=n;txt+='灵石 +'+n+' '}
  if(r.merit){addMerit(r.merit);txt+='功德 +'+r.merit+' '}
  if(r.cult){const n=sc(r.cult);S.cult+=n;txt+='修为 +'+n+' '}
  if(r.contribP){S.contrib=(S.contrib||0)+r.contribP;txt+='贡献点 +'+r.contribP+' '}
  if(r.mats){for(let i=0;i<r.mats.length;i+=2){const k=r.mats[i],v=r.mats[i+1];S.mats[k]=(S.mats[k]||0)+v;txt+=(MAT_NAMES[k]||k)+' ×'+v+' '}}
  if(r.item&&ITEM_REWARDS[r.item]){addItem(Object.assign({},ITEM_REWARDS[r.item]));txt+=ITEM_REWARDS[r.item].name+' ×1 '}
  log('<p class="loot">📜 任务完成「'+q.name+'」：'+txt.trim()+'</p>');
}
function questRow(q,cur,done){
  const pct=clamp(Math.floor(cur/q.target*100),0,100);
  return '<div class="quest-item'+(done?' done':'')+'"><span>'+(done?'✅':'⬜')+' '+q.icon+' '+esc(q.name)+'（'+Math.min(cur,q.target)+'/'+q.target+'）</span><b>'+(done?'已领取':q.rewardText)+'</b></div>'+(done?'':'<div class="bar" style="margin:2px 0 8px;height:6px"><i style="width:'+pct+'%"></i></div>');
}
function dailyHtml(){
  const d=dC();
  return DAILY_QUESTS.slice(0,4).map(q=>{const cur=d.c[q.key]||0,done=!!d.doneD[q.id];return '<div class="quest-item'+(done?' done':'')+'"><span>'+(done?'✅':'⬜')+' '+q.icon+' '+esc(q.name)+'</span><b>'+(done?'已领取':Math.min(cur,q.target)+'/'+q.target)+'</b></div>'}).join('')+
    '<p style="font-size:11px;color:#6f7a94;margin-top:2px">完成自动领取 · 奖励随境界上浮</p>';
}
function panelDaily(){
  const d=dC();
  const dayLeft=Math.max(1,Math.floor((new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+1)-Date.now())/3600000));
  const dl=DAILY_QUESTS.map(q=>questRow(q,d.c[q.key]||0,d.doneD[q.id])).join('');
  const wl=WEEKLY_QUESTS.map(q=>questRow(q,weekProg(q),d.doneW[q.id])).join('');
  openPanel('📅 每日修行','<p>每日与每周任务会在新的一天 / 新的一周自动刷新，达标即领，无需手动操作。灵石类奖励随境界上浮。</p>'+
    '<h4>📅 今日任务（约 '+dayLeft+' 小时后刷新）</h4>'+dl+
    '<h4>🗓️ 本周任务</h4>'+wl+
    '<p style="font-size:12.5px;color:#6f7a94">连续闭关超过 60 日收益递减，多出门走走去完成这些任务，反而事半功倍。</p>');
}
