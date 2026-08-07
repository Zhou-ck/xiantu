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
  {id:'d_daolun',icon:'📖',name:'以论证道',desc:'与人论道 1 次',target:1,key:'daolun',rewardText:'灵石×20',reward:{stones:20}},
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
function zeroCounts(){return {cultDays:0,explore:0,kill:0,sectTask:0,craft:0,talk:0,daolun:0}}
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
  return '<div class="quest-item quest-row'+(done?' done':'')+'"><span class="quest-ico">'+(done?'✅':q.icon)+'</span>'+
    '<span class="quest-tx"><b>'+esc(q.name)+'</b><small>'+(done?'已领取 · '+esc(q.rewardText):'进度 '+Math.min(cur,q.target)+'/'+q.target+' · '+esc(q.rewardText))+'</small></span>'+
    (done?'':'<span class="quest-pct">'+pct+'%</span>')+'</div>'+(done?'':'<div class="bar" style="margin:2px 0 8px;height:6px"><i style="width:'+pct+'%"></i></div>');
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

/* ======================================================
  v42 主线 / 支线任务引擎（数据表见 js/data/quests.js）
====================================================== */
function initQuestState(){
  if(!S)return null;
  if(!S.quest)S.quest={};
  const q=S.quest;
  if(!q.main)q.main={ch:0,step:0,done:[],chDone:[],log:[]};
  if(!q.side)q.side={};
  if(!q.sideStep)q.sideStep={};
  if(!q.sideDone)q.sideDone={};
  return q;
}
function mainStep(){
  if(!S)return null;
  initQuestState();
  const q=S.quest.main;
  if(q.ch>=MAIN_STORY.length)return null;
  const ch=MAIN_STORY[q.ch];
  if(q.step>=ch.steps.length)return null;
  return ch.steps[q.step];
}
function isQuestStepDone(id){
  const q=initQuestState();
  return !!(q&&q.main&&(q.main.done||[]).indexOf(id)>=0);
}
function totalTalks(){
  return (S.npcs||[]).reduce((a,n)=>a+(n.talks||0),0)+(S.sectNpcs||[]).reduce((a,n)=>a+(n.talks||0),0);
}
function stepDone(st){
  if(!S||!st)return false;
  switch(st.type){
    case 'realm': return S.realm>=st.param;
    case 'visit':
      if(st.param==='tower')return (S.flag.tower||0)>=1;
      return (S.flag.regions&&S.flag.regions[st.param]||0)>=1;
    case 'explore': return (S.flag.exploreCount||0)>=st.param;
    case 'kill': return (S.kills||0)>=st.param;
    case 'collect': return (S.items||[]).some(i=>i.name===st.param);
    case 'collectMat': return (S.mats[st.param]||0)>=((st.count)||1);
    case 'tower': return (S.flag.tower||0)>=st.param;
    case 'dungeon': return (S.flag.dungeons||0)>=st.param;
    case 'talk': return totalTalks()>=st.param;
    case 'craft': return (S.flag.craftTotal||0)>=st.param;
    case 'insight': return (S.flag.insights||0)>=st.param;
  }
  return false;
}
/* 章节里程碑奖励：锚定 eventGift，随境界自动联动 */
function chapterReward(ch){
  const n=ch.chapter||0;
  return {stones:80+n*60,cultPct:1+Math.floor(n/2),insight:(n%2===0)?1:0,merit:(n%3===0)?1:0};
}
/* 通用奖励发放（主线章节 / 支线完成共用） */
function applyQuestReward(rw){
  if(!rw)return [];
  const out=[];
  if(rw.stones){S.stones=(S.stones||0)+rw.stones;out.push('灵石 +'+rw.stones)}
  if(rw.cult){S.cult=(S.cult||0)+rw.cult;out.push('修为 +'+rw.cult)}
  if(rw.cultPct){const c=Math.floor(eventGift()*(rw.cultPct||0)/100);S.cult=(S.cult||0)+c;if(c>0)out.push('修为 +'+c)}
  if(rw.merit){addMerit(rw.merit);out.push('功德 +'+rw.merit)}
  if(rw.luck){S.luck=clamp((S.luck||0)+1,1,100);out.push('气运 +1')}
  if(rw.insight){S.flag.insights=(S.flag.insights||0)+rw.insight;out.push('悟道 +'+rw.insight)}
  if(rw.cha){S.attrs.cha=clamp((S.attrs.cha||0)+1,1,40);out.push('魅力 +1')}
  if(rw.mat){for(const k in rw.mat){S.mats[k]=(S.mats[k]||0)+rw.mat[k];out.push((MAT_NAMES[k]||k)+' ×'+rw.mat[k])}}
  if(rw.item){const it=Object.assign({},rw.item);addItem(it);out.push(it.name+' ×1')}
  if(rw.favor){
    const npc=questFindNpc(rw.npc);
    if(npc){npc.favor=clamp((npc.favor||0)+rw.favor,0,100);out.push(esc(npc.name)+'好感 +'+rw.favor)}
  }
  if(rw.flag){for(const k in rw.flag)S.flag[k]=rw.flag[k]}
  if(rw.title){
    const t=(typeof TITLES!=='undefined'?TITLES:[]).find(x=>x.name===rw.title);
    const tid=t?t.id:rw.title;
    if((S.titles||[]).indexOf(tid)<0){S.titles.push(tid);out.push('称号「'+rw.title+'」')}
  }
  return out;
}
function questFindNpc(name){
  if(!S||!name)return null;
  const all=(S.npcs||[]).concat(S.sectNpcs||[]);
  return all.find(n=>n&&n.name===name)||(S.daoPartner&&S.daoPartner.name===name?S.daoPartner:null);
}
/* 剧情事件通用演出：标题 + 台词 + 抉择（fx 效果器复用区域记忆语义） */
function storyLineHtml(ln){
  const txt=String(ln||'');
  const cast=pickCastNames(txt);
  let speaker='';
  if(cast.length){
    const k=cast[0];
    const src=((typeof NPC_ART!=='undefined'&&NPC_ART[k])||(typeof SECT_PERSON_ART!=='undefined'&&SECT_PERSON_ART[k])||'');
    speaker='<span class="sl-speaker">'+(src?'<img src="'+src+'" alt="" loading="lazy">':'')+'<i>'+esc(k)+'</i></span>';
  }
  const m=txt.match(/^(.*?)「([^」]+)」(.*)$/);
  if(m){
    const pre=esc(m[1]).trim(),quote=esc(m[2]),post=esc(m[3]);
    return (speaker?speaker:'')+(pre?('<span class="sl-pre">'+pre+'</span>'):'')+'<span class="sl-quote">「'+quote+'」</span>'+(post?' <span class="sl-post">'+post+'</span>':'');
  }
  return (speaker?speaker:'')+'<span class="sl-text">'+esc(txt)+'</span>';
}
function runStoryLines(title,lines,opts,after){
  const sc=sceneThumb(title);
  log('<p class="scene story-stage">'+(sc?sc+' ':'')+'📖 〖 '+esc(title)+' 〗</p>');
  try{if(typeof setSceneImg==='function')setSceneImg(title)}catch(e){}
  const cast=storyCastBar(pickCastNames(title+' '+(lines||[]).join(' ')));
  if(cast)log(cast);
  for(const ln of lines)log('<p class="story-line">'+storyLineHtml(ln)+'</p>');
  logChoices((opts||[]).map(o=>({
    txt:o.txt,cls:o.cls||'',
    fn:()=>{
      const fx=_onceFx(o.fx||{});
      const out=applyEventEffects(fx);
      if(fx.fight){
        const e=Object.assign({},fx.fight);
        e.atk=(e.atk||0)+Math.floor(rl()/3);
        e.def=(e.def||0)+Math.floor(rl()/4);
        e.hp=(e.hp||0)+rl()*6;
        startCombat(e,res=>{
          if(res.win){
            const w=applyEventEffects(fx.winFx||{stones:30});
            if(w.length)log('<p class="loot">战利：'+w.join(' · ')+'。</p>');
          }else{
            log('<p class="danger">你败下阵来，暂且退走。</p>');
          }
          if(typeof after==='function')after();
          renderAll();
        },true);
        return;
      }
      if(out.length)log('<p class="loot">'+out.join(' · ')+'。</p>');
      if(fx.afterFx){const a=applyEventEffects(fx.afterFx);if(a.length)log('<p class="good">'+a.join(' · ')+'。</p>')}
      passTime(1);
      if(typeof after==='function')after();
      renderAll();
    }
  })));
}
function runMainStoryStep(st){
  const q=initQuestState();
  runStoryLines(st.title,st.lines,st.opts,()=>{
    if(q.main.done.indexOf(st.id)<0)q.main.done.push(st.id);
    questTick();
  });
}
function advanceMain(){
  const q=initQuestState();
  const ch=MAIN_STORY[q.main.ch];
  if(!ch)return false;
  const st=ch.steps[q.main.step];
  if(st&&q.main.done.indexOf(st.id)<0)q.main.done.push(st.id);
  if(q.main.step<ch.steps.length-1){q.main.step++;return true}
  q.main.chDone=q.main.chDone||[];
  if(q.main.chDone.indexOf(ch.id)<0){
    q.main.chDone.push(ch.id);
    q.main.log=q.main.log||[];
    q.main.log.unshift({id:ch.id,title:ch.title,summary:ch.summary||'',at:Math.floor(S.years)});
    const txt=applyQuestReward(chapterReward(ch));
    log('<p class="loot">📖 主线章节「'+esc(ch.title)+'」完成！'+(txt.length?txt.join(' · '):'')+'</p>');
  }
  if(q.main.ch<MAIN_STORY.length-1){q.main.ch++;q.main.step=0;return true}
  q.main.finished=true;
  return false;
}
/* 主线推进：任何相关行动后调用；故事步骤在 PENDING=0 时自动演出 */
function questTick(){
  if(!S)return;
  initQuestState();
  sideQuestTick();
  let guard=0;
  while(guard++<60){
    const st=mainStep();
    if(!st)break;
    if(st.type==='story'){
      if(isQuestStepDone(st.id)){advanceMain();continue}
      /* 剧情步骤由玩家在任务日志点「继续剧情」推进，避免打断当前行动 */
      break;
    }
    if(stepDone(st)){advanceMain();continue}
    break;
  }
}
/* ===== 支线 ===== */
function sideQuest(qid){return SIDE_QUESTS.find(q=>q.id===qid)}
function sideStartMet(st){
  if(!st)return false;
  if(st.visits){const rid=st.visits[0],n=st.visits[1];return (S.flag.regions&&S.flag.regions[rid]||0)>=n}
  if(st.npc){const npc=questFindNpc(st.npc);return !!npc&&(npc.talks||0)>=st.talks}
  if(st.chain){const key=st.chain[0],v=st.chain[1];return ((S.flag.chain&&S.flag.chain[key])||0)>=v}
  return false;
}
function checkSideStarts(){
  if(!S)return;
  const q=initQuestState();
  for(const sq of SIDE_QUESTS){
    if(q.side[sq.id]==='done'||q.sideStep[sq.id]!==undefined)continue;
    if(sideStartMet(sq.start)){
      q.sideStep[sq.id]=0;
      q.side[sq.id]=1;
      log('<p class="good">📜 支线开启「'+esc(sq.title)+'」——详情见任务日志。</p>');
    }
  }
}
function runSideStoryStep(sq,idx){
  const q=initQuestState();
  const st=sq.steps[idx];
  q.sideDone[sq.id]=q.sideDone[sq.id]||[];
  runStoryLines(st.title,st.lines,st.opts,()=>{
    if(q.sideDone[sq.id].indexOf(idx)<0)q.sideDone[sq.id].push(idx);
    q.sideStep[sq.id]=idx+1;
    questTick();
  });
}
function sideQuestTick(){
  if(!S)return;
  checkSideStarts();
  const q=initQuestState();
  for(const sq of SIDE_QUESTS){
    if(q.side[sq.id]!==1)continue;
    const idx=q.sideStep[sq.id]||0;
    const st=sq.steps[idx];
    if(!st){
      if(q.side[sq.id]!=='done'){
        q.side[sq.id]='done';
        const txt=applyQuestReward(sq.reward);
        log('<p class="loot">📜 支线「'+esc(sq.title)+'」完成！'+(txt.length?txt.join(' · '):'')+'</p>');
      }
      continue;
    }
    if(st.type==='story'){
      q.sideDone[sq.id]=q.sideDone[sq.id]||[];
      if(q.sideDone[sq.id].indexOf(idx)>=0){q.sideStep[sq.id]=idx+1;continue}
      /* 剧情步骤由玩家点击推进 */
      continue;
    }
    if(stepDone(st))q.sideStep[sq.id]=idx+1;
  }
}
/* 剧情推进：主线（无参）/ 支线（传 sqId） */
function questContinueStory(sqId){
  if(!S)return;
  if(sqId){
    const q=initQuestState();
    const sq=sideQuest(sqId);
    if(!sq)return;
    const idx=q.sideStep[sqId]||0;
    const st=sq.steps[idx];
    if(st&&st.type==='story'&&!(q.sideDone[sqId]||[]).indexOf(idx)>=0){closePanel();runSideStoryStep(sq,idx)}
    return;
  }
  const st=mainStep();
  if(st&&st.type==='story'&&!isQuestStepDone(st.id)){closePanel();runMainStoryStep(st)}
}
/* ===== 任务日志面板（主线 / 支线 / 日常） ===== */
function questGo(st){
  if(!S)return;
  const go=st.go||'quests';
  if(go==='map'){if(typeof openMap==='function')openMap(st.param);else if(typeof panelMap==='function')panelMap();else panelExplore();return}
  if(go==='tower'){if(typeof openMap==='function')openMap('tower');else doTower();return}
  if(go==='dungeon'){if(typeof openMap==='function')openMap('dungeon');else if(typeof panelDungeonList==='function')panelDungeonList();return}
  const fnMap={
    cult:()=>panelCult(),market:()=>panelMarket(),sect:()=>panelSect(),social:()=>panelSocial(),
    craft:()=>panelCraft(),rest:()=>panelRest(),quests:()=>panelQuests(),
  };
  if(fnMap[go])fnMap[go]();
}
function questGoBtn(st,sqId){
  if(st&&st.type==='story')return '<button class="small primary" onclick="questContinueStory('+(sqId?"'"+sqId+"'":'')+')">继续剧情</button>';
  return '<button class="small primary" onclick="questGo(mainStep())">前往</button>';
}
function mainProgressHtml(){
  const q=initQuestState();
  const ch=MAIN_STORY[q.main.ch];
  if(!ch)return '<p class="sys">主线已完结——你已走完天衍之劫的全程。</p>';
  const cur=Math.min(q.main.step+1,ch.steps.length);
  const rows=ch.steps.map((st,i)=>{
    const done=i<q.main.step||isQuestStepDone(st.id);
    const curStep=i===q.main.step;
    const mark=done?'✅':curStep?'📍':'⬜';
    const label=st.type==='story'?('📖 '+st.title):questStepLabel(st);
    return '<div class="quest-item'+(done?' done':'')+(curStep?' current':'')+'"><span>'+mark+' '+esc(label)+'</span>'+
      (curStep?'<b class="tag" style="color:#e8d9a8">当前</b>':'')+'</div>'+
      (curStep&&st.hint?'<div class="bd-note">'+esc(st.hint)+'</div>':'')+
      (curStep?'<div class="row">'+questGoBtn(st)+'</div>':'');
  }).join('');
  const logHtml=(q.main.log||[]).slice(0,5).map(l=>'<div class="bd-row"><span>📖 '+esc(l.title)+'</span><b>第 '+l.at+' 年</b></div>'+(l.summary?'<div class="bd-note">'+esc(l.summary)+'</div>':'')).join('');
  return '<div class="item-card"><div class="nm">'+ch.icon+' 主线 · '+esc(ch.title)+' <span style="font-size:12px;color:#6f7a94">（'+q.main.chDone.length+'/'+MAIN_STORY.length+' 章）</span></div><div class="ds">'+esc(ch.summary||'')+'</div><div class="bar" style="margin:6px 0"><i style="width:'+Math.floor(cur/ch.steps.length*100)+'%"></i></div>'+rows+'</div>'+
    (logHtml?'<div class="bd-box"><div class="bd-head">📜 剧情回顾</div>'+logHtml+'</div>':'');
}
function questStepLabel(st){
  switch(st.type){
    case 'realm': return '境界：达到「'+REALMS[Math.min(st.param,REALMS.length-1)]+'」';
    case 'visit': {const l=mapLoc?mapLoc(st.param):null;return '前往：'+(l?l.name:st.param)}
    case 'explore': return '探索 '+st.param+' 次';
    case 'kill': return '击败敌人 '+st.param+' 名';
    case 'collect': return '获得：「'+st.param+'」';
    case 'collectMat': return '收集：'+(MAT_NAMES[st.param]||st.param)+' ×'+(st.count||1);
    case 'tower': return '试炼塔第 '+st.param+' 层';
    case 'dungeon': return '通关秘境 '+st.param+' 座';
    case 'talk': return '与人交谈 '+st.param+' 次';
    case 'craft': return '炼制 '+st.param+' 次';
    case 'insight': return '获得顿悟 '+st.param+' 次';
  }
  return st.type;
}
function sideProgressHtml(){
  const q=initQuestState();
  const active=[],ready=[],done=[];
  for(const sq of SIDE_QUESTS){
    if(q.side[sq.id]==='done'){done.push(sq);continue}
    if(q.sideStep[sq.id]!==undefined){
      const idx=q.sideStep[sq.id]||0;
      const st=sq.steps[idx];
      active.push({sq,st,idx});
    }else if(sideStartMet(sq.start)){
      ready.push({sq,met:true});
    }else{
      ready.push({sq,met:false});
    }
  }
  const actHtml=active.map(o=>{
    const st=o.st||o.sq.steps[0];
    const label=st&&st.type==='story'?('📖 '+st.title):(st?questStepLabel(st):'');
    return '<div class="item-card"><div class="nm">'+o.sq.icon+' 支线 · '+esc(o.sq.title)+'</div><div class="ds">'+esc(o.sq.summary||'')+'</div>'+
      '<div class="bd-row"><span>'+(st?'📍 '+esc(label):'✔ 待结算')+'</span></div>'+
      (st&&st.hint?'<div class="bd-note">'+esc(st.hint)+'</div>':'')+
      (st?'<div class="row">'+questGoBtn(st,o.sq.id)+'</div>':'')+'</div>';
  }).join('');
  const readyHtml=ready.map(o=>{
    const startTxt=o.met?'条件已满足，将自动开启':'未满足开启条件';
    const cond=sideStartDesc(o.sq.start);
    return '<div class="bd-row"><span>🔒 '+o.sq.icon+' '+esc(o.sq.title)+'</span><b>'+startTxt+'</b></div><div class="bd-note">'+cond+'</div>';
  }).join('');
  const doneHtml=done.map(sq=>'<div class="bd-row ok"><span>✅ '+sq.icon+' '+esc(sq.title)+'</span></div>').join('');
  return (active.length?'<h4>📌 进行中</h4>'+actHtml:'')+
    (ready.length?'<h4>🗝️ 可接支线</h4><div class="bd-box">'+readyHtml+'</div>':'')+
    (done.length?'<h4>🏁 已完成</h4><div class="bd-box">'+doneHtml+'</div>':'')+
    (!active.length&&!ready.length&&!done.length?'<p class="sys">暂无支线。多去各处走走，因果自会找上门。</p>':'');
}
function sideStartDesc(st){
  if(st.visits){const l=mapLoc?mapLoc(st.visits[0]):null;return '到访「'+(l?l.name:st.visits[0])+'」'+st.visits[1]+' 次'}
  if(st.npc)return '与「'+st.npc+'」交谈 '+st.talks+' 次';
  if(st.chain)return '埋下因果：'+st.chain[0]+' ≥'+st.chain[1];
  return '自动开启';
}
function panelQuests(){
  if(!S){toast('尚未踏入仙途');return}
  initQuestState();
  const d=dC();
  const dl=DAILY_QUESTS.map(q=>questRow(q,d.c[q.key]||0,d.doneD[q.id])).join('');
  const wl=WEEKLY_QUESTS.map(q=>questRow(q,weekProg(q),d.doneW[q.id])).join('');
  openPanel('📜 任务日志',
    '<p>主线为你指路，支线让江湖丰满，日常保你日日有事可做。三者互不冲突。</p>'+
    '<h4>🧭 主线</h4>'+mainProgressHtml()+
    '<h4>🗺️ 支线</h4>'+sideProgressHtml()+
    '<h4>📅 今日修行</h4>'+dl+
    '<h4>🗓️ 本周任务</h4>'+wl);
}
