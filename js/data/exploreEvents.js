/* ======================================================
  仙途 · 区域记忆事件池（v42）
  说明：重访已探区域时概率触发的差异化事件（每区域 ≥2 条），
        用 weight 加权随机，事件效果由 fx 对象驱动（数据化、可扩展）。
  效果字段（applyEventEffects 支持）：
    stones / cult / merit / karma / luck / insight / flag
    mat:{材料key:数量} / item:{name,type,quality,count,desc,use,sell}
    fight:{name,atk,def,hp,elem,style,boss}
====================================================== */
'use strict';
const REGION_EVENTS=[
  /* —— 青石小径·周边 —— */
  {id:'rv_near_1',region:'near',minVisits:2,weight:3,title:'破庙香火',t:'破庙仍是那间破庙，可供桌上的香灰却是新的。你想起此前种种，竟有一丝恍惚。',opts:[
    {txt:'🙏 添一炷香，谢过山神',cls:'primary',fx:{merit:2}},
    {txt:'🔍 仔细端详供桌下的暗格',fx:{stones:60}},
  ]},
  {id:'rv_near_2',region:'near',minVisits:3,weight:2,title:'溪畔顽童',t:'溪边传来惊呼——一个顽童失足落水，正扑腾着往下沉。',opts:[
    {txt:'🫧 御气救人',cls:'primary',fx:{merit:3}},
    {txt:'🚶 事不关己，继续赶路',fx:{karma:2}},
  ]},
  /* —— 荒山野岭 —— */
  {id:'rv_hill_1',region:'hill',minVisits:2,weight:3,title:'猎户旧屋',t:'山坳里那间猎户旧屋，屋顶已塌了大半。你在残垣下发现一只锈箭壶，箭壶底压着一封家书。',opts:[
    {txt:'📜 循着家书替猎户了却遗愿',cls:'primary',fx:{merit:3,insight:1,once:'rv_hill_1'}},
    {txt:'🎒 取走箭壶换钱',fx:{mat:{pelt:2}}},
  ]},
  {id:'rv_hill_2',region:'hill',minVisits:3,weight:2,title:'山魈拦路',t:'一只人面山魈蹲在乱石上，龇牙低吼，挡住了去路——老地方，老冤家。',opts:[
    {txt:'⚔️ 再会一会它',cls:'danger',fx:{fight:{name:'老山魈',atk:5,def:2,hp:30,elem:'wood',style:'guard'}}},
    {txt:'🪨 丢块石头引开它，绕道而行',fx:{stones:-20}},
  ]},
  /* —— 暮色深林 —— */
  {id:'rv_forest_1',region:'forest',minVisits:2,weight:3,title:'药园残碑',t:'你拨开藤蔓，又见到那块残碑。碑文依旧残缺，可这次你多看了几眼，竟看出些门道。',opts:[
    {txt:'🌿 依碑文寻得药园一角',cls:'primary',fx:{mat:{sherb:2,herb:3}}},
    {txt:'🧘 席地参悟碑文意境',fx:{cult:150}},
  ]},
  {id:'rv_forest_2',region:'forest',minVisits:3,weight:2,title:'林中狐影',t:'林深处一道白影一闪而过。是那只白狐——它回眸望你，似在引路，又似在试探。',opts:[
    {txt:'🦊 随白狐深入林间',cls:'primary',fx:{mat:{sherb:1}}},
    {txt:'🚶 不追了，原路折返',fx:{merit:1}},
  ]},
  /* —— 断魂崖 —— */
  {id:'rv_cliff_1',region:'cliff',minVisits:2,weight:3,title:'崖畔剑痕',t:'崖壁上那道旧剑痕犹在。风过时，剑意竟似活了过来，隐隐铮鸣。',opts:[
    {txt:'🗡️ 静立崖前，参悟剑痕',cls:'primary',fx:{insight:1,once:'rv_cliff_1'}},
    {txt:'💪 以指代剑，隔空临摹',fx:{cult:150,mat:{iron:1}}},
  ]},
  {id:'rv_cliff_2',region:'cliff',minVisits:3,weight:2,title:'雾中龙影',t:'云海翻涌，一道青影在雾中蜿蜒而过——是蛟，还是错觉？你屏息凝神，龙吟隐约入耳。',opts:[
    {txt:'🫧 循着龙吟方向查探',cls:'danger',fx:{fight:{name:'雾蛟幻影',atk:9,def:4,hp:48,elem:'water',style:'burst',boss:true}}},
    {txt:'🌫️ 退到崖后，静观其变',fx:{insight:1,once:'rv_cliff_2'}},
  ]},
  /* —— 荒古禁地 —— */
  {id:'rv_abyss_1',region:'abyss',minVisits:2,weight:3,title:'古修残影',t:'禁地深处的古修残影又出现了。这次它没有出手，只抬手遥遥一指——顺着指尖望去，是一块与众不同的焦土。',opts:[
    {txt:'🔍 掘开焦土',cls:'primary',fx:{mat:{jade:1}}},
    {txt:'🎭 回以一礼，默诵古经',fx:{merit:2,insight:1,once:'rv_abyss_1'}},
  ]},
  {id:'rv_abyss_2',region:'abyss',minVisits:3,weight:2,title:'禁地灵乳',t:'一道地缝中渗出乳白灵液，异香扑鼻——是千年灵乳，还是噬人的瘴气？',opts:[
    {txt:'🍶 以玉瓶接取灵乳',cls:'primary',fx:{item:{name:'千年灵乳',type:'consumable',quality:3,count:1,desc:'千年钟乳所凝，服之修为大进（+500~1000）。',use:'essence',sell:600}}},
    {txt:'⚠️ 引一缕灵气试探',fx:{cult:180}},
  ]},
  /* —— 灵溪幽谷（新区域） —— */
  {id:'rv_valley_1',region:'valley',minVisits:2,weight:3,title:'幽谷灵泉',t:'幽谷深处的灵泉依旧澄澈。你在泉边坐下，泉水倒映天光，灵气顺着四肢百骸缓缓渗入。',opts:[
    {txt:'💧 掬一捧灵泉涤荡经脉',cls:'primary',fx:{cult:200,once:'rv_valley_1'}},
    {txt:'🪷 于泉边静坐吐纳',fx:{insight:1,once:'rv_valley_1b'}},
  ]},
  {id:'rv_valley_2',region:'valley',minVisits:3,weight:2,title:'谷中琴音',t:'一阵若有若无的琴音自谷中飘来。你循声望去，只见一袭白衣坐在溪石上，抚琴者背对着你，琴音却句句敲在道心上。',opts:[
    {txt:'🎶 席地而坐，静静听完',cls:'primary',fx:{insight:1,once:'rv_valley_2'}},
    {txt:'🙏 上前请教曲中道韵',fx:{merit:1,cult:120}},
  ]},
  /* —— 古战场遗迹（新区域） —— */
  {id:'rv_ruin_1',region:'ruin',minVisits:2,weight:3,title:'残旗古剑',t:'一面残破的战旗斜插在焦土中，旗下压着一柄锈蚀的古剑。剑柄缠着早已腐烂的红缨，隐约可见当年的血性。',opts:[
    {txt:'🗡️ 拔出古剑，拭去锈迹',cls:'primary',fx:{item:{name:'寒铁剑',type:'weapon',quality:2,bonus:3,desc:'古战场上拾得的寒铁剑，虽锈犹利。',sell:260}}},
    {txt:'🏳️ 扶正残旗，掩埋剑冢',fx:{merit:3}},
  ]},
  {id:'rv_ruin_2',region:'ruin',minVisits:3,weight:2,title:'战魂低语',t:'夜里，焦土上浮起点点磷火。无数低语在风中回荡——是当年战死者的执念，正等着一个聆听的人。',opts:[
    {txt:'🕯️ 点燃灵香，听他们说完',cls:'primary',fx:{merit:3,insight:1,once:'rv_ruin_2'}},
    {txt:'⚔️ 以战意回应战意',fx:{fight:{name:'无面战魂',atk:12,def:5,hp:70,elem:'metal',style:'aggressive',boss:true},winFx:{cult:200,stones:80}}},
  ]},
];
/* 新区域首次踏入的世界观补白 */
const REGION_LORE={
  valley:'你踏入幽谷，只觉满目翠色，溪声潺潺。谷中灵气比外界浓郁三分，难怪少有人迹——相传此处是上古药仙的闭关之地。',
  ruin:'残阳如血，焦土千里。古战场的风里带着铁锈与亡魂的气息，断旗、残甲、白骨散落其间，默默诉说着那场灭世之战。',
};
/* 对账表：确保每个区域至少 2 条事件（schema 校验用） */
function regionEventCoverage(){
  const map={};
  for(const ev of REGION_EVENTS)map[ev.region]=(map[ev.region]||0)+1;
  return map;
}
/* 效果执行器：数据驱动的奖励/惩罚/战斗 */
function applyEventEffects(fx){
  if(!fx)return [];
  const out=[];
  if(fx.stones){S.stones=Math.max(0,(S.stones||0)+fx.stones);if(fx.stones>0)out.push('灵石 +'+fx.stones);else out.push('灵石 '+fx.stones)}
  if(fx.cult){S.cult=(S.cult||0)+fx.cult;if(fx.cult>0)out.push('修为 +'+fx.cult)}
  if(fx.cultPct){const c=Math.floor(eventGift()*(fx.cultPct||0)/100);S.cult=(S.cult||0)+c;if(c>0)out.push('修为 +'+c)}
  if(fx.hp){S.hp=Math.max(1,S.hp+fx.hp);out.push('气血 '+(fx.hp>0?'+':'')+fx.hp)}
  if(fx.root){S.root=clamp((S.root||0)+fx.root,1,100);out.push('灵根 '+(fx.root>0?'+':'')+fx.root)}
  if(fx.mood){addMood(fx.mood);out.push('心境 '+(fx.mood>0?'+':'')+fx.mood)}
  if(fx.merit){addMerit(fx.merit);out.push('功德 +'+fx.merit)}
  if(fx.karma){addKarma(fx.karma);out.push('业力 +'+fx.karma)}
  if(fx.luck){S.luck=clamp((S.luck||0)+1,1,100);out.push('气运 +1')}
  if(fx.insight){S.flag.insights=(S.flag.insights||0)+1;out.push('悟道 +1')}
  if(fx.mat){for(const k in fx.mat){S.mats[k]=(S.mats[k]||0)+fx.mat[k];out.push((MAT_NAMES[k]||k)+' ×'+fx.mat[k])}}
  if(fx.item){const it=Object.assign({},fx.item);addItem(it);out.push(it.name+' ×1')}
  if(fx.flag){for(const k in fx.flag)S.flag[k]=fx.flag[k]}
  if(fx.once){S.flag.regionOnce=S.flag.regionOnce||{};S.flag.regionOnce[fx.once]=true}
  return out;
}
/* once 语义：一次性奖励只发放一次（flag.regionEvents 记录） */
function _onceFx(fx){
  if(!fx||!fx.once)return fx;
  S.flag.regionOnce=S.flag.regionOnce||{};
  if(S.flag.regionOnce[fx.once]){
    const f=Object.assign({},fx);
    delete f.once;f.stones=0;f.cult=0;f.merit=0;f.karma=0;f.luck=0;f.insight=0;f.mat=null;f.item=null;
    return f;
  }
  return fx;
}
/* 区域记忆事件执行：叙事 + 抉择（数据驱动） */
function runRegionEvent(ev){
  if(!S||!ev)return;
  S.flag.regionEvents=S.flag.regionEvents||{};
  S.flag.regionEvents[ev.id]=(S.flag.regionEvents[ev.id]||0)+1;
  log('<p class="scene story-stage">📍 〖 '+esc(ev.title)+' 〗</p>');
  const cast=storyCastBar(pickCastNames(ev.title+' '+ev.t));
  if(cast)log(cast);
  log('<p class="story-line">'+storyLineHtml(ev.t)+'</p>');
  logChoices(ev.opts.map((o,i)=>({
    txt:o.txt,cls:o.cls||'',
    fn:()=>{
      const fx=_onceFx(o.fx||{});
      const out=applyEventEffects(fx);
      if(fx.fight){
        /* 敌人按当前境界缩放（复用通用节奏：攻 +rl/3、防 +rl/4、血 +rl*6） */
        const e=Object.assign({},fx.fight);
        e.atk=(e.atk||0)+Math.floor(rl()/3);
        e.def=(e.def||0)+Math.floor(rl()/4);
        e.hp=(e.hp||0)+rl()*6;
        startCombat(e,res=>{
          if(res.win){
            const w=applyEventEffects(fx.winFx||{stones:30});
          if(w.length)log('<div class="loot-strip">'+w.map(lootChip).join('')+'</div>');
          }else{
            log('<p class="danger">你败下阵来，仓皇退走。</p>');
          }
          if(fx.afterFx){const a=applyEventEffects(fx.afterFx);if(a.length)log('<p class="good">'+a.join(' · ')+'。</p>')}
          renderAll();
        },true);
        return;
      }
      if(out.length)log('<p class="loot">'+out.join(' · ')+'。</p>');
      if(fx.afterFx){const a=applyEventEffects(fx.afterFx);if(a.length)log('<p class="good">'+a.join(' · ')+'。</p>')}
      passTime(1);renderAll();
    }
  })));
}
/* 重访触发判定：已探 ≥2 次后概率触发（28%） */
function maybeRegionEvent(r){
  if(!S||!r)return;
  const visits=S.flag.regions&&S.flag.regions[r.id]||0;
  if(visits>=2&&chance(0.28)){
    const pool=REGION_EVENTS.filter(e=>e.region===r.id&&(!e.minVisits||visits>=e.minVisits));
    if(pool.length){
      log('<p class="sys">（此地你已来过多次，这一回，似乎有些不同……）</p>');
      runRegionEvent(weightedPick(pool));
      return true;
    }
  }
  return false;
}
/* 区域记忆日志（面板展示） */
function regionMemoryHtml(){
  if(!S)return '';
  const log=(S.flag.regionEvents||{});
  const rows=REGION_EVENTS.map(ev=>{
    const n=log[ev.id]||0;
    if(n<=0)return '';
    return '<div class="bd-row"><span>📍 '+esc(ev.title)+'</span><b>'+n+' 次</b></div>';
  }).filter(Boolean).join('');
  return rows?'<div class="bd-box"><div class="bd-head">📍 故地回响</div>'+rows+'</div>':'';
}
