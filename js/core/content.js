/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：==== 新系统：时令 / 战术 / 灵兽 / 称号 / 拍卖 ====
====================================================== */
'use strict';
/* ===== 新系统：时令 / 战术 / 灵兽 / 称号 / 拍卖 ===== */
const SEASONS=[
  {i:'🌸',n:'春',desc:'万物生发，采药易得，修炼略有裨益。'},
  {i:'☀️',n:'夏',desc:'妖兽躁动，遭遇增多，妖丹丰厚。'},
  {i:'🍂',n:'秋',desc:'肃杀之季，机缘与凶险并生。'},
  {i:'❄️',n:'冬',desc:'天寒地冻，修炼迟缓，然静极思悟。'},
];
/* ===== 天机签（每季一签） ===== */
const SIGNS=[
  {k:'great',n:'上上签',d:'本季探索机缘大增（机缘 +15）',explore:15},
  {k:'war',n:'武运签',d:'本季战斗攻击 +4',atk:4},
  {k:'calm',n:'静心签',d:'本季心性判定 +3',wil:3},
  {k:'wealth',n:'财运签',d:'本季坊市购物八折',disc:0.8},
  {k:'cult',n:'精进签',d:'本季修炼效率 +15%',cult:1.15},
  {k:'luck',n:'天缘签',d:'本季机缘 +8，修炼效率 -5%',explore:8,cult:0.95},
  {k:'trial',n:'劫数签',d:'本季凶险稍增，灾后必有福报（探索凶险 +8，机缘 +10）',danger:8,explore:10},
  {k:'sorrow',n:'忧思签',d:'本季静修易生心魔',demon:1},
];
function signNow(){
  if(!S||!S.flag||!S.flag.sign)return null;
  return S.flag.sign.season===seasonOf()?S.flag.sign:null;
}
function signDesc(k){
  const s=SIGNS.find(x=>x.k===k);
  return s?'【'+s.n+'】'+s.d:'';
}
function seasonOf(){return Math.floor(S.days/90)%4}
function seasonLabel(){const se=SEASONS[seasonOf()];return se.i+' '+se.n}
function seasonDesc(){return SEASONS[seasonOf()].desc}
function rootTier(r){
  if(r>=95)return ['变异灵根','✨'];
  if(r>=85)return ['天灵根','🌟'];
  if(r>=70)return ['上品灵根','💎'];
  if(r>=50)return ['中品灵根','🧿'];
  if(r>=30)return ['下品灵根','⚗️'];
  return ['凡根','🪨'];
}

const TACTICS={
  aggressive:{n:'抢攻',i:'⚔️',dmg:1.2,take:1.1},
  steady:{n:'稳健',i:'⚖️',dmg:1.0,take:1.0},
  defense:{n:'龟守',i:'🛡️',dmg:0.8,take:0.75},
  allout:{n:'搏命',i:'💥',dmg:1.5,take:1.15,self:true},
};

const PET_POOL=[
  {species:'灵狐',names:['阿白','雪团','月牙'],talent:'luck',base:1,desc:'通灵之狐，主掌机缘。'},
  {species:'小火鸦',names:['阿火','炭团','玄鸦'],talent:'combat',base:1,desc:'烈焰之鸦，战意灼灼。'},
  {species:'玉兔',names:['小玉','团子','月兔'],talent:'herb',base:1,desc:'寻药灵兔，最喜灵草。'},
  {species:'石猴',names:['阿石','小棍','石灵'],talent:'speed',base:1,desc:'石中生猴，助修炼事半功倍。'},
  {species:'金蚕',names:['小金','丝丝'],talent:'alchemy',base:1,desc:'丹火灵蚕，通晓药性。'},
  {species:'小蛟',names:['小渊','青鳞'],talent:'root',base:1,desc:'蛟龙之属，灵根天成。'},
];
function rollPet(){
  const p=pick(PET_POOL);
  return {species:p.species,name:pick(p.names),talent:p.talent,bonus:p.base,level:1,exp:0,faint:0,form:1};
}
const PET_TALENT_DESC={luck:'通灵 · 机缘+5',combat:'战意 · 战斗+2',herb:'寻药 · 采药+1',speed:'迅捷 · 修炼+5%',alchemy:'丹道 · 炼丹+1',root:'灵根 · 修炼+5%'};
function petAlive(){return !!(S.pet&&S.pet.faint<=0)}
function petLevelNeed(p){return p.level*20}
/* v98 进化分支：狂兽助战 +1 */
function petCombatBonus(){return petAlive()?(S.pet.bonus||0)+(S.pet.branch==='kuang'?1:0):0}

const TITLES=[
  {id:'kills10',name:'初露锋芒',desc:'累计击杀 10 敌，攻击 +1',check:s=>s.kills>=10,effect:s=>{s.flag.tAttack=(s.flag.tAttack||0)+1}},
  {id:'dungeon3',name:'秘境行者',desc:'通关秘境 3 座，气运 +2',check:s=>(s.flag.dungeons||0)>=3,effect:s=>{s.luck=clamp(s.luck+2,1,100)}},
  {id:'tower10',name:'试炼英杰',desc:'试炼塔通关 10 层，身法 +1',check:s=>(s.flag.tower||0)>=10,effect:s=>{s.attrs.agi=clamp(s.attrs.agi+1,1,40)}},
  {id:'dan2',name:'丹道新秀',desc:'炼丹造诣二阶，智慧 +1',check:s=>s.prof==='alchemy'&&s.profLevel>=2,effect:s=>{s.attrs.int=clamp(s.attrs.int+1,1,40)}},
  {id:'zhuji',name:'筑基有成',desc:'筑基功成，心性 +1',check:s=>s.realm>=9,effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'jindan',name:'金丹大道',desc:'凝成金丹，力量 +1',check:s=>s.realm>=13,effect:s=>{s.attrs.str=clamp(s.attrs.str+1,1,40)}},
  {id:'yuanying',name:'元婴出窍',desc:'元婴现世，智慧 +1',check:s=>s.realm>=17,effect:s=>{s.attrs.int=clamp(s.attrs.int+1,1,40)}},
  {id:'merit100',name:'广结善缘',desc:'功德达 100，魅力 +1',check:s=>s.merit>=100,effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'heart5',name:'心魔不侵',desc:'心魔历练成功 5 次，心性 +1',check:s=>s.heartTrains>=5,effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'rich',name:'富甲一方',desc:'持有灵石 5000，买卖更优惠',check:s=>s.stones>=5000,effect:s=>{s.flag.tMerchant=true}},
  {id:'battle50',name:'百战之躯',desc:'获胜 50 场，力量 +1',check:s=>s.wins>=50,effect:s=>{s.attrs.str=clamp(s.attrs.str+1,1,40)}},
  {id:'ascend',name:'超脱飞升',desc:'登临仙位，九界逍遥',check:s=>s.endings.includes('飞升成仙'),effect:s=>{}},
  {id:'talks20',name:'人脉通达',desc:'累计交谈 20 次，魅力 +1',check:s=>(s.npcs||[]).reduce((a,n)=>a+(n.talks||0),0)>=20,effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'prof5',name:'技近乎道',desc:'副业达到 5 阶，智慧 +1',check:s=>s.prof&&s.profLevel>=5,effect:s=>{s.attrs.int=clamp(s.attrs.int+1,1,40)}},
  {id:'pet5',name:'御灵有成',desc:'灵兽升至 5 级，身法 +1',check:s=>s.pet&&s.pet.level>=5,effect:s=>{s.attrs.agi=clamp(s.attrs.agi+1,1,40)}},
  {id:'sect50',name:'宗门砥柱',desc:'完成宗门任务 50 次，魅力 +1',check:s=>(s.flag.sectTasks||0)>=50,effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'dual20',name:'神仙眷侣',desc:'道侣双修 20 次，魅力 +1',check:s=>(s.flag.dualCount||0)>=20,effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'married',name:'结缡同心',desc:'与道侣共结双修大典，双修增益提升',check:s=>s.daoPartner&&s.daoPartner.married,effect:s=>{}},
  {id:'merit500',name:'功德无量',desc:'功德达 500，气运 +2',check:s=>s.merit>=500,effect:s=>{s.luck=clamp(s.luck+2,1,100)}},
  {id:'win100',name:'百战不殆',desc:'获胜 100 场，力量 +1',check:s=>s.wins>=100,effect:s=>{s.attrs.str=clamp(s.attrs.str+1,1,40)}},
  {id:'year100',name:'寿比南山',desc:'这一世活过百年，心性 +1',check:s=>s.years>=100,effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'tech5',name:'战技宗师',desc:'战技点化累计 5 级，攻势 +1',check:s=>(Object.values((s.flag&&s.flag.tech&&s.flag.tech.ups)||{}).reduce((a,b)=>a+b,0))>=5,effect:s=>{s.flag.tAttack=(s.flag.tAttack||0)+1}},
  {id:'daolun10',name:'论道无双',desc:'论道胜 10 场，心性 +1',check:s=>(s.flag.daolunWins||0)>=10,effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'tide5',name:'守城英杰',desc:'妖潮全胜 5 次，气运 +1',check:s=>(s.flag.tideWins||0)>=5,effect:s=>{s.luck=clamp(s.luck+1,1,100)}},
  {id:'atlas40',name:'收藏大家',desc:'图鉴收集（物品+敌人）达 40，魅力 +1',check:s=>Object.keys(s.seenI||{}).length+Object.keys(s.seenE||{}).length>=40,effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'ownSect',name:'开宗立派',desc:'自建宗门，魅力 +1',check:s=>!!(s.flag&&s.flag.ownSect),effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'spirit100',name:'真元凝练',desc:'真元上限达 100，智慧 +1',check:s=>maxSpirit(s)>=100,effect:s=>{s.attrs.int=clamp(s.attrs.int+1,1,40)}},
  {id:'t_quest_pomiao',name:'山神眷顾',desc:'完成支线「破庙香火」，机缘常伴',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_pomiao==='done'),effect:s=>{s.luck=clamp(s.luck+1,1,100)}},
  {id:'t_quest_longyin',name:'蛟龙之托',desc:'完成支线「龙吟断魂」，灵兽亲和',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_longyin==='done'),effect:s=>{s.luck=clamp(s.luck+1,1,100)}},
  {id:'t_quest_guxiu',name:'古修传人',desc:'完成支线「禁地古修」，悟性超然',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_guxiu==='done'),effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'t_quest_valley',name:'知音人',desc:'完成支线「幽谷琴师」，曲中有道',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_valley==='done'),effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'t_quest_ruin',name:'魂归故里',desc:'完成支线「战魂安息」，功德无量',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_ruin==='done'),effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  {id:'t_quest_huxian',name:'狐缘',desc:'完成支线「狐仙报恩」，草木亲近',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_huxian==='done'),effect:s=>{s.attrs.cha=clamp(s.attrs.cha+1,1,40)}},
  {id:'t_quest_mozong',name:'卧底',desc:'完成支线「魔道卧底」，正魔难辨',check:s=>!!(s.quest&&s.quest.side&&s.quest.side.sq_mozong==='done'),effect:s=>{s.attrs.int=clamp(s.attrs.int+1,1,40)}},
  {id:'t_main_ask',name:'问心无悔',desc:'主线「天道问心」：问心三问后道心愈坚',check:s=>!!(s.quest&&s.quest.main&&(s.quest.main.done||[]).indexOf('m9s2')>=0),effect:s=>{s.attrs.wil=clamp(s.attrs.wil+1,1,40)}},
  /* v97 A1 轮回印记称号（执念达成授予，荣誉向，效果为空） */
  {id:'t_karma_ascend',name:'飞升者',desc:'轮回印记 · 亲手推开天门',check:s=>!!(s.flag&&s.flag.karmaGoal==='ascend'&&s.endings&&s.endings.indexOf('飞升成仙')>=0),effect:()=>{}},
  {id:'t_karma_sect',name:'开宗之祖',desc:'轮回印记 · 白手起家，香火不绝',check:s=>!!(s.flag&&s.flag.karmaGoal==='sect'&&s.flag&&s.flag.ownSect),effect:()=>{}},
  {id:'t_karma_dao',name:'情深不渝',desc:'轮回印记 · 三生石上，同心相守',check:s=>!!(s.flag&&s.flag.karmaGoal==='dao'&&s.daoPartner&&s.daoPartner.married),effect:()=>{}},
  {id:'t_karma_kill',name:'百战余生',desc:'轮回印记 · 斩敌过百，战意长存',check:s=>!!(s.flag&&s.flag.karmaGoal==='kill'&&(s.kills||0)>=100),effect:()=>{}},
  {id:'t_karma_merit',name:'功德圆满',desc:'轮回印记 · 泽被苍生，功德无量',check:s=>!!(s.flag&&s.flag.karmaGoal==='merit'&&(s.merit||0)>=100),effect:()=>{}},
  {id:'t_karma_main',name:'天衍传人',desc:'轮回印记 · 了却天衍之劫',check:s=>!!(s.flag&&s.flag.karmaGoal==='main'&&s.quest&&s.quest.main&&s.quest.main.finished),effect:()=>{}},
];
/* v44 轮回道途 2.0：前世执念（每世一个目标，轮回结算加成） */
const KARMA_GOALS=[
  {id:'ascend',n:'证道飞升',i:'☁️',desc:'这一世，登临仙位，推开天门。',check:s=>!!(s.endings&&s.endings.includes('飞升成仙'))},
  {id:'sect',n:'开宗立派',i:'🏯',desc:'这一世，自立门户，香火不绝。',check:s=>!!(s.flag&&s.flag.ownSect)},
  {id:'dao',n:'双修同心',i:'💞',desc:'这一世，与道侣结缡同心。',check:s=>!!(s.daoPartner&&s.daoPartner.married)},
  {id:'kill',n:'百战成名',i:'⚔️',desc:'这一世，斩敌过百，以战证名。',check:s=>(s.kills||0)>=100},
  {id:'merit',n:'功德圆满',i:'🕯️',desc:'这一世，功德过百，泽被苍生。',check:s=>(s.merit||0)>=100},
  {id:'main',n:'天衍传人',i:'📖',desc:'这一世，走完主线，了却天衍之劫。',check:s=>!!(s.quest&&s.quest.main&&s.quest.main.finished)},
];
function karmaGoal(){
  if(!S||!S.flag||!S.flag.karmaGoal)return null;
  return KARMA_GOALS.find(g=>g.id===S.flag.karmaGoal)||null;
}
function karmaGoalMet(){const g=karmaGoal();return !!g&&g.check(S)}
function karmaGoalProgress(){
  const g=karmaGoal();
  if(!g)return '';
  if(karmaGoalMet())return '<span style="color:#8fd0a0">已达成 ✓</span>';
  if(g.id==='kill')return '斩敌 '+(S.kills||0)+'/100';
  if(g.id==='merit')return '功德 '+(S.merit||0)+'/100';
  if(g.id==='main')return '主线 '+(S.quest&&S.quest.main?(S.quest.main.chDone||[]).length:0)+'/'+MAIN_STORY.length+' 章';
  return '';
}
function checkTitles(){
  if(!S)return;
  for(const t of TITLES){
    if(S.titles.includes(t.id)||!t.check(S))continue;
    S.titles.push(t.id);
    t.effect(S);
    log('<p class="loot">🏅 获得称号「'+t.name+'」——'+t.desc+'。</p>');
  }
}

const AUCTION_POOL=[
  {name:'神秘兽卵',type:'egg',quality:2,cost:800,use:'hatch',desc:'不知何兽所遗，灵光流转，似可孵化。',sell:500},
  {name:'天雷符',type:'consumable',quality:2,cost:500,use:'thunder',desc:'雷符一道，战斗中掷出，攻击 +12。',sell:300},
  {name:'千年灵乳',type:'consumable',quality:3,cost:800,use:'essence',desc:'千年钟乳所凝，服之修为大进（+500~1000）。',sell:600},
  {name:'悟道茶',type:'consumable',quality:3,cost:600,use:'insight',desc:'一盏清茶涤尽尘心，饮之必有所悟（悟道+1）。',sell:400},
  {name:'洗灵露',type:'consumable',quality:2,cost:600,use:'root3',desc:'灵泉甘露，洗涤灵根（灵根 +3）。',sell:360},
  {name:'无字天书',type:'consumable',quality:4,cost:1200,use:'art',desc:'天书无字，参悟可得一门失传功法。',sell:800},
  {name:'紫电剑',type:'weapon',quality:3,cost:1500,bonus:4,desc:'剑出紫电随行，上古遗宝。',sell:1200,setId:'jianxin'},
  {name:'星纹软甲',type:'armor',quality:3,cost:1400,bonus:4,desc:'织星为线，柔韧胜钢。',sell:1100,setId:'jianxin'},
  {name:'龙凤环',type:'trinket',quality:4,cost:2600,bonus:3,desc:'龙凤交缠，气运自聚。',sell:2000,setId:'xiaoyao'},
  {name:'星陨石',type:'gem',gemId:'g_star',cost:700,desc:'天外奇珍：镶嵌后气运 +1。',sell:280},
  {name:'沧海珠',type:'gem',gemId:'g_pearl',cost:600,desc:'深海宝珠：镶嵌后最大气血 +15。',sell:200},
  {name:'回天丹',type:'consumable',quality:4,cost:1800,use:'huitian',desc:'气血尽复并愈全部伤势（丹药上品）。',sell:900},
  {name:'五行丹',type:'consumable',quality:3,cost:1000,use:'wuxing',desc:'服后 60 日内五行克敌伤害 +10%。',sell:500},
];

function karmaMod(){
  return Math.max(-2,Math.min(2,Math.floor(S.merit/80)-Math.floor(S.karma/50)));
}
/* 显性善恶值：功德-业力，-100 ~ +100 */
function netMerit(){return S?clamp(S.merit-S.karma,-100,100):0}
/* 2J 三维声望：正道/魔道/散修 + 总声望 + 正邪轴 */
function totalFame(){
  const f=S&&S.fame||{};
  return (f.zheng||0)+(f.mo||0)+(f.san||0);
}
function fameAxis(){
  const f=S&&S.fame||{};
  const z=f.zheng||0,m=f.mo||0,s=f.san||0;
  if(z>=m&&z>=s)return 'zheng';
  if(m>=s)return 'mo';
  return 'san';
}
function fameDiscount(){return Math.min(20,Math.floor(totalFame()/90)+(petAlive()&&S.pet.branch==='xiang'?5:0))} /* v98 祥兽：坊市折扣 +5% */
function fameLabel(){
  const f=S&&S.fame||{};
  const t=totalFame();
  const ax=fameAxis();
  const nm=ax==='zheng'?'正道领袖':ax==='mo'?'魔道巨擘':'逍遥散仙';
  return t>=300?['威震一方 · '+nm,'#d8a86a']:t>=120?['小有名声 · '+nm,'#c9b98e']:['初涉江湖','#8f9cb8'];
}
function fameFavorBias(n){
  const ax=fameAxis();
  const np=npcPersona(n);
  const nb=np&&np.bias||{};
  if(ax==='zheng'&&(nb.zheng||0)>0)return 2;
  if(ax==='mo'&&(nb.mo||0)>0)return 2;
  if(ax==='san'&&(nb.san||0)>0)return 1;
  if(ax==='zheng'&&(nb.mo||0)>0)return -1;
  if(ax==='mo'&&(nb.zheng||0)>0)return -1;
  return 0;
}
function goodEvilInfo(){
  const v=netMerit();
  if(v>=80)return ['大善之人','#a8d5a8'];
  if(v>=30)return ['善行昭昭','#8fcf9f'];
  if(v>=-29)return ['中正平和','#c9c39a'];
  if(v>=-79)return ['业障缠身','#d99a8a'];
  return ['大恶之徒','#e06a6a'];
}
function addMerit(n){
  /* v97 A1 道心三问·重义：功德获取 +20% */
  if(n>0&&S.flag&&S.flag.daoHeart==='yi')n=Math.floor(n*1.2);
  S.merit=Math.max(0,S.merit+n);
  S.flag.goodDeeds=(S.flag.goodDeeds||0)+n;
  if(S.persona&&n>0)addDrift(n>0?Math.ceil(n/5):0);
  S.fame=S.fame||{zheng:0,mo:0,san:0};
  S.fame.zheng=Math.max(0,S.fame.zheng+n);
  if(n>0)log('<p class="good">功德 +'+n+'（现 '+S.merit+'）。</p>');
  if(n>0){
    S.flag.meritPool=(S.flag.meritPool||0)+n;
    if(S.flag.meritPool>=10){
      S.flag.meritPool-=10;
      const gw=growWil(0.95,'行善积德，道心自坚');
      if(gw)log(gw);
    }
  }
}
function addKarma(n){
  S.karma=Math.max(0,S.karma+n);
  if(S.persona&&n>0)addDrift(-Math.ceil(n/5));
  S.fame=S.fame||{zheng:0,mo:0,san:0};
  S.fame.mo=Math.max(0,S.fame.mo+n);
  if(n>0)log('<p class="danger">业力 +'+n+'（现 '+S.karma+'）。</p>')
}

/* ===== 节日事件：按游戏内年份触发（每年固定日期段） ===== */
const FESTIVALS=[
  {id:'chunjie',n:'春节',doy:[0,7],i:'🧧'},
  {id:'qixi',n:'七夕',doy:[200,211],i:'🌉'},
  {id:'zhongyuan',n:'中元',doy:[220,231],i:'🪦'},
  {id:'zhongqiu',n:'中秋',doy:[255,266],i:'🌕'},
];
function dayOfYear(){return S.days%365}
function festivalEvent(id){
  if(!S.flag.festDone)S.flag.festDone={};
  const y=S.flag.lastYear||Math.floor(S.years);
  S.flag.festDone[y+'-'+id]=true;
  if(typeof recordWorldEvent==='function')recordWorldEvent(({chunjie:'春节年关，凡间张灯结彩',qixi:'七夕鹊桥，情缘暗动',zhongyuan:'中元鬼门开，阴风过境',zhongqiu:'中秋月宫异象，天地同辉'})[id]||('岁时'+id));
  if(id==='chunjie')festivalChunjie();
  else if(id==='qixi')festivalQixi();
  else if(id==='zhongyuan')festivalZhongyuan();
  else if(id==='zhongqiu')festivalZhongqiu();
}
function festivalChunjie(){
  scene('春节 · 年关集市');
  log('<p>爆竹声中一岁除。山下镇子张灯结彩，年关集市人声鼎沸——糖人、春联、爆竹、花灯，凡间的烟火气扑面而来。</p>');
  logChoices([
    {txt:'🧧 给村童们发压岁钱（30灵石 · 功德+5）',cls:'primary',fn:()=>{if(S.stones>=30){S.stones-=30;addMerit(5);log('<p class="good">孩子们欢呼着作揖拜年，你心头一暖（功德+5）。</p>')}else{log('<p>你摸了摸空空的口袋，只能笑呵呵地给孩子们讲了段仙人的故事。</p>')}passTime(1);renderAll()}},
    {txt:'🏮 摆摊卖一盏灵光花灯',fn:()=>{const g=rand(60,150);S.stones+=g;log('<p class="loot">灵光花灯被一位老财主重金买走（灵石 +'+g+'）。</p>');passTime(1);renderAll()}},
    {txt:'🎇 与村民守岁放爆竹',fn:()=>{const R=doRoll('cha',13);log('<p>你与村民们围炉守岁，讲起山中轶事：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(1,2);S.attrs.cha=clamp(S.attrs.cha+g,1,40);log('<p class="good">你成了孩子王，年味里多了一分暖（魅力 +'+g+'）。</p>')}else{log('<p>你讲的故事把小孩吓哭了，被大人们笑着赶去烧火。</p>')}passTime(1);renderAll()}},
    {txt:'🧘 谢绝喧嚣，闭门守岁修炼',fn:()=>{const g=Math.floor(50+S.root/4);S.cult+=g;log('<p>你在洞府贴上门神，焚香守岁。新岁第一缕阳气入体（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
  ]);
}
function festivalQixi(){
  scene('七夕 · 鹊桥之夜');
  S.flag.qixiLeft=10;
  log('<p>七夕夜，银河如练，喜鹊衔羽搭桥。凡间女儿家穿针乞巧，修真界的红线也在今夜暗动。</p>');
  log('<p class="sys">🌉 七夕余韵 10 日：情缘互动好感加成，告白/暧昧判定更容易成功。</p>');
  if(S.daoPartner){
    logChoices([
      {txt:'💞 与道侣共赴鹊桥',cls:'primary',fn:()=>{const p=S.daoPartner;const g=rand(6,10);p.favor=clamp(p.favor+g,0,100);p.affinity=clamp((p.affinity||60)+g,0,100);log('<p class="good">你牵着道侣踏桥而上，银河星光落满衣襟。'+(p.gender==='女'?'她':'他')+'轻声道：「年年今夜，莫负良辰。」（情缘 +'+g+'）</p>');if(chance(0.3)){const gw=growWil(0.15,'情意入道，道心愈坚');if(gw)log(gw)}passTime(1);renderAll()}},
      {txt:'🌙 于月下对坐，谈至天明',fn:()=>{const p=S.daoPartner;const g=rand(3,6);p.favor=clamp(p.favor+g,0,100);p.affinity=clamp((p.affinity||60)+g,0,100);log('<p>你们于葡萄架下听牛郎织女私语，说了整夜闲话（情缘 +'+g+'）。</p>');passTime(1);renderAll()}},
    ]);
  }else if((S.affairs||[]).length){
    const a=S.affairs[0];
    logChoices([
      {txt:'🌸 约'+esc(a.name)+'同游灯市',cls:'primary',fn:()=>{const g=rand(5,9);a.favor=clamp(a.favor+g,0,100);log('<p class="good">你与'+esc(a.name)+'并肩穿行灯市，'+(a.gender==='女'?'她':'他')+'买下一对糖人，把其中一个塞进你手里（好感 +'+g+'）。</p>');passTime(1);renderAll()}},
      {txt:'🏮 于月老庙为心上人求签',fn:()=>{const R=doRoll('cha',14);log('<p>你在月老庙掷签问缘：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=rand(3,6);a.favor=clamp(a.favor+g,0,100);S.luck=clamp(S.luck+1,1,100);log('<p class="good">签文大吉，你只觉缘分有了着落（'+esc(a.name)+' 好感 +'+g+'，气运+1）。</p>')}else{log('<p>签文晦涩，你看了半晌也没懂，只当求个心安。</p>')}passTime(1);renderAll()}},
    ]);
  }else{
    logChoices([
      {txt:'🏮 于月老庙祈一段良缘（魅力判定）',cls:'primary',fn:()=>{const R=doRoll('cha',14);log('<p>你在月老庙郑重许愿：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){S.luck=clamp(S.luck+2,1,100);log('<p class="good">红绳虚影在你腕间一闪而逝——你只觉冥冥中缘分将至（气运 +2）。</p>')}else{log('<p>月老庙的签筒晃了晃，什么也没掉出来。</p>')}passTime(1);renderAll()}},
      {txt:'🧘 于星河下独坐悟道',fn:()=>{const g=Math.floor(80+S.root/3);S.cult+=g;log('<p>你独坐山巅，看银河横贯天际，忽然想起一句话：仙途虽孤，星河为伴（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
    ]);
  }
}
function festivalZhongyuan(){
  scene('中元 · 鬼门开');
  log('<p>中元夜，鬼门大开，幽冥阴风自山脚乱葬岗倒灌而出。凡间家家焚纸，村口立起招魂幡。</p>');
  logChoices([
    {txt:'📿 设坛超度游魂（心性判定）',cls:'primary',fn:()=>{const R=doRoll('wil',15);log('<p>你盘坐乱葬岗前，诵起度人经：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){addMerit(8);const gw=growWil(0.12,'度人即度己');if(gw)log(gw);log('<p class="good">阴风渐息，游魂化光而去，你周身多了一层功德清光（功德+8）。</p>')}else{S.heartDemons++;S.hp=Math.max(1,S.hp-Math.floor(S.maxHp*0.12));log('<p class="danger">有厉鬼趁你诵经时反噬，你惊出一身冷汗（心魔+1，气血-12%）。</p>')}passTime(1);renderAll()}},
    {txt:'🕯️ 踏入幽冥边缘一探（凶险）',cls:'danger',fn:()=>{log('<p>你循着阴风踏入鬼门边缘，黄泉路上白骨累累，一队阴兵正在巡逻……</p>');startCombat({name:'幽冥阴兵',atk:7+rl()*2,def:3+rl(),hp:32+rl()*13,elem:'dark'})}},
    {txt:'🚪 闭门不出，符纸封窗',fn:()=>{log('<p>你贴满符纸，门窗紧闭，一夜安眠。翌日清晨，门外台阶上多了一束不知谁放的野花。</p>');passTime(1);renderAll()}},
  ]);
}
function festivalZhongqiu(){
  scene('中秋 · 月宫异象');
  log('<p>中秋夜，月轮圆满得不像话，桂香漫过整座山。有人看见月宫阙影在云间若隐若现，也有人看见玉兔捣药的剪影。</p>');
  logChoices([
    {txt:'🌕 拜月修炼（修为+）',cls:'primary',fn:()=>{const g=Math.floor(120+S.root/2);S.cult+=g;log('<p class="good">月华如水倾泻而下，你任其涤荡经脉，修为大进（修为 +'+g+'）。</p>');passTime(1);renderAll()}},
    {txt:'🌳 桂树下寻宝（心性判定）',fn:()=>{const R=doRoll('wil',14);log('<p>你循着桂香摸到一株老桂树下：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const it=randItem(3);addItem(it);const g=rand(80,200);S.stones+=g;log('<p class="loot">你挖出一只落满月华的锦匣：「'+it.name+'」（'+QNAMES[it.quality]+'），另有灵石 '+g+'。</p>')}else{log('<p>你挖了半天，只刨出一窝田鼠，被追着跑出三里地。</p>')}passTime(1);renderAll()}},
    {txt:'🍥 摆一桌桂花酒与故人同饮',fn:()=>{const friends=S.npcs.filter(n=>!n.foe&&n.favor>=40);if(!friends.length){log('<p>你独酌桂酒，月下无客，倒也自在。</p>');passTime(1);renderAll();return}const n=pick(friends);const g=rand(3,6);n.favor=clamp(n.favor+g,0,100);log('<p>你邀<b>'+esc(n.name)+'</b>共饮桂花酿，'+(n.gender==='女'?'她':'他')+'讲起月宫旧闻，酒到酣处相视而笑（好感 +'+g+'）。</p>');passTime(1);renderAll()}},
    {txt:'🪷 观月悟道（智慧判定）',fn:()=>{const R=doRoll('int',16);log('<p>你凝望满月，思绪飘入太阴：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){const g=Math.floor(100+S.root/3);S.cult+=g;log('<p class="good">圆缺盈亏，暗合天道。你于月下悟得一线玄机（修为 +'+g+'）。</p>');const gw=growWil(0.1,'观月明心');if(gw)log(gw)}else{log('<p>你盯着月亮看了半夜，眼睛发酸，一无所获。</p>')}passTime(1);renderAll()}},
  ]);
}
