/* ======================================================
  仙途 · 数据表化地基（v41）
  文件：js/core/schema.js —— 数据表 schema 校验器
  说明：validateEvents() 校验 DATA.events 每条事件：
        必填字段存在、类型正确、id 唯一、引用的资源
        （物品名 / 材料名 / 功法名 / NPC 角色）存在。
        校验失败返回错误列表（数组，元素为字符串）。
  资源白名单：从现有数据表复制，随数据源变更同步维护：
    · NPC 角色  js/systems/npc.js   NPC_POOL（role 字段）
    · 物品名    js/systems/market.js MARKET_ITEMS / randItem 池 /
               js/core/content.js   AUCTION_POOL
    · 材料名    js/core/world.js    MAT_NAMES（值）
    · 功法名    js/core/world.js    ARTS（name 字段）
====================================================== */
'use strict';
/* 并入现有 DATA 全局命名空间（无则新建） */
var DATA = (typeof window!=='undefined' && window.DATA) || {};
if(typeof window!=='undefined' && window){window.DATA=DATA}

/* ===== 资源白名单（静态兜底；运行期由 schemaResRefresh 从数据表派生） ===== */
var SCHEMA_RES = {
  npc: ['散修剑客','采药女','酒馆掌柜','妖族狐女','老乞丐','铁匠','书阁执事','神秘道人','古琴乐师','云游医修','丹房女修','佛门行者','猎妖人','行商大贾','狐仙苏苏','剑阁女侠','月下琴姬','灵药仙子','魔道妖女','龙族公主','白衣剑仙','儒雅书仙','魔道圣女','冰宫仙子','琴阁双姝','商道女财神','昆仑剑侍','妖族豹女','仇家'],
  item: ['回春丹','聚灵丹','清心丹','安神香','回溯符','破境丹','洗髓丹','延寿丹','筑基丹','锻体丹','轻身丹','通慧丹','疗伤丹','安神丹','火云剑','玄冰刃','庚金剑','精铁剑','青鳞甲','聚灵玉佩','火球符','遁地符','寒铁剑','赤炎刀','紫电剑','玄龟甲','星纹软甲','聚灵佩','龙凤环','神秘兽卵','天雷符','千年灵乳','悟道茶','洗灵露','无字天书'],
  mat: ['草药','灵草','铁矿石','妖皮','妖丹','寒玉','符纸','朱砂'],
  art: ['清心诀','大衍诀','太乙剑诀','丹火诀','遁光术','龙象体诀','心魔淬体功','熔火真解','玄冰诀','青木长生诀','惊雷诀'],
};
/* v92：从运行期数据表惰性重建白名单，扩产不再手改 SCHEMA_RES */
function schemaResRefresh(){
  try{
    if(typeof NPC_POOL!=='undefined'&&Array.isArray(NPC_POOL)&&NPC_POOL.length){
      var npcs=[];
      NPC_POOL.forEach(function(n){if(n&&n.role&&npcs.indexOf(n.role)<0)npcs.push(n.role)});
      if(SCHEMA_RES.npc.indexOf('仇家')<0)npcs.push('仇家');
      if(npcs.length)SCHEMA_RES.npc=npcs;
    }
  }catch(e){}
  try{
    if(typeof itemCatalog==='function'){
      var cat=itemCatalog()||{};
      var items=Object.keys(cat);
      if(items.length)SCHEMA_RES.item=items;
    }
  }catch(e){}
  try{
    if(typeof MAT_NAMES==='object'&&MAT_NAMES){
      var mats=[];
      Object.keys(MAT_NAMES).forEach(function(k){var v=MAT_NAMES[k];if(v&&mats.indexOf(v)<0)mats.push(v)});
      if(mats.length)SCHEMA_RES.mat=mats;
    }
  }catch(e){}
  try{
    if(typeof ARTS!=='undefined'&&Array.isArray(ARTS)&&ARTS.length){
      var arts=[];
      ARTS.forEach(function(a){if(a&&a.name&&arts.indexOf(a.name)<0)arts.push(a.name)});
      if(arts.length)SCHEMA_RES.art=arts;
    }
  }catch(e){}
  return SCHEMA_RES;
}

var EVENT_TYPES = ['visit','invite','chat'];
var OPT_CLS = ['primary','danger'];

function _isObj(v){return v!==null && typeof v==='object' && !Array.isArray(v)}
function _isStr(v){return typeof v==='string' && v.length>0}

/* 校验 DATA.events：返回错误数组；0 条错误即校验通过 */
function validateEvents(){
  schemaResRefresh();
  const errs=[];
  if(!DATA || !Array.isArray(DATA.events)){
    errs.push('DATA.events 缺失或不是数组');
    return errs;
  }
  const seen={};
  DATA.events.forEach(function(ev,i){
    const at='[#'+i+']';
    if(!_isObj(ev)){
      errs.push(at+' 事件不是对象');
      return;
    }
    if(!_isStr(ev.id)){
      errs.push(at+' 缺少必填字段 id（string）');
    }else if(seen[ev.id]){
      errs.push(at+' id 重复：'+ev.id);
    }else{
      seen[ev.id]=true;
    }
    if(!_isStr(ev.n))errs.push(at+'['+(ev.id||'?')+'] 缺少必填字段 n（string）');
    if(!_isStr(ev.type)){
      errs.push(at+'['+(ev.id||'?')+'] 缺少必填字段 type（string）');
    }else if(EVENT_TYPES.indexOf(ev.type)<0){
      errs.push(at+'['+ev.id+'] type 非法：'+ev.type+'（应为 '+EVENT_TYPES.join('/')+'）');
    }
    if(!_isStr(ev.t))errs.push(at+'['+(ev.id||'?')+'] 缺少必填字段 t（string）');
    if(!Array.isArray(ev.opts)||ev.opts.length<1){
      errs.push(at+'['+(ev.id||'?')+'] opts 必须是至少 1 项的数组');
    }else{
      ev.opts.forEach(function(o,j){
        if(!_isObj(o)||!_isStr(o.txt)){
          errs.push(at+'['+(ev.id||'?')+'] opts['+j+'] 缺少必填字段 txt（string）');
        }
        if(o&&o.cls!==undefined&&OPT_CLS.indexOf(o.cls)<0){
          errs.push(at+'['+(ev.id||'?')+'] opts['+j+'].cls 非法：'+o.cls+'（应为 '+OPT_CLS.join('/')+'）');
        }
      });
    }
    /* 引用校验：npc 关联角色 */
    if(ev.npc!==undefined){
      if(!_isStr(ev.npc))errs.push(at+'['+(ev.id||'?')+'] npc 必须是 string');
      else if(SCHEMA_RES.npc.indexOf(ev.npc)<0)errs.push(at+'['+ev.id+'] npc 引用不存在：'+ev.npc);
    }
    /* 引用校验：物品 / 材料 / 功法 */
    if(ev.refs!==undefined){
      if(!_isObj(ev.refs)){
        errs.push(at+'['+(ev.id||'?')+'] refs 必须是对象');
      }else{
        if(ev.refs.item!==undefined){
          if(!_isStr(ev.refs.item))errs.push(at+'['+(ev.id||'?')+'] refs.item 必须是 string');
          else if(SCHEMA_RES.item.indexOf(ev.refs.item)<0)errs.push(at+'['+ev.id+'] 引用的物品不存在：'+ev.refs.item);
        }
        if(ev.refs.mat!==undefined){
          if(!_isStr(ev.refs.mat))errs.push(at+'['+(ev.id||'?')+'] refs.mat 必须是 string');
          else if(SCHEMA_RES.mat.indexOf(ev.refs.mat)<0)errs.push(at+'['+ev.id+'] 引用的材料不存在：'+ev.refs.mat);
        }
        if(ev.refs.art!==undefined){
          if(!_isStr(ev.refs.art))errs.push(at+'['+(ev.id||'?')+'] refs.art 必须是 string');
          else if(SCHEMA_RES.art.indexOf(ev.refs.art)<0)errs.push(at+'['+ev.id+'] 引用的功法不存在：'+ev.refs.art);
        }
      }
    }
  });
  return errs;
}

/* ===== v42 主线 / 支线任务表校验 ===== */
var QUEST_TYPES=['story','realm','visit','explore','kill','collect','collectMat','tower','dungeon','talk','craft','insight'];
var QUEST_GOS=['quests','cult','market','sect','social','craft','map','rest','tower','dungeon'];

function validateQuests(){
  var errs=[];
  if(typeof MAIN_STORY==='undefined'||!Array.isArray(MAIN_STORY)||!MAIN_STORY.length){
    errs.push('MAIN_STORY 缺失或为空');
    return errs;
  }
  var seenCh={},seenStory={};
  MAIN_STORY.forEach(function(ch,ci){
    var at='[main#'+ci+']';
    if(!_isStr(ch.id)){errs.push(at+' 缺少 id');return}
    if(seenCh[ch.id])errs.push(at+' 章节 id 重复：'+ch.id);
    seenCh[ch.id]=true;
    if(!_isStr(ch.title))errs.push(at+'['+ch.id+'] 缺少 title');
    if(!Array.isArray(ch.steps)||!ch.steps.length){errs.push(at+'['+ch.id+'] steps 为空');return}
    ch.steps.forEach(function(st,si){
      var a2=at+'['+ch.id+'.step'+si+']';
      if(!st||!_isStr(st.type)){errs.push(a2+' 缺少 type');return}
      if(QUEST_TYPES.indexOf(st.type)<0)errs.push(a2+' type 非法：'+st.type);
      if(st.type==='story'){
        if(!_isStr(st.id))errs.push(a2+' 剧情步骤缺少 id');
        else if(seenStory[st.id])errs.push(a2+' 剧情 id 重复：'+st.id);
        else seenStory[st.id]=true;
        if(!_isStr(st.title))errs.push(a2+' 剧情步骤缺少 title');
        if(!Array.isArray(st.lines)||!st.lines.length)errs.push(a2+' lines 为空');
        if(!Array.isArray(st.opts)||!st.opts.length)errs.push(a2+' opts 为空');
        if(Array.isArray(st.opts)){
          st.opts.forEach(function(o,j){
            if(!o||!_isStr(o.txt))errs.push(a2+' opts['+j+'] 缺少 txt');
          });
        }
      }else if(st.param===undefined){
        errs.push(a2+' 非剧情步骤缺少 param');
      }
      if(st.go!==undefined&&QUEST_GOS.indexOf(st.go)<0)errs.push(a2+' go 非法：'+st.go);
    });
  });
  if(typeof SIDE_QUESTS==='undefined'||!Array.isArray(SIDE_QUESTS)){
    errs.push('SIDE_QUESTS 缺失');
    return errs;
  }
  var seenSq={};
  SIDE_QUESTS.forEach(function(q,qi){
    var at='[side#'+qi+']';
    if(!_isStr(q.id)){errs.push(at+' 缺少 id');return}
    if(seenSq[q.id])errs.push(at+' id 重复：'+q.id);
    seenSq[q.id]=true;
    if(!_isStr(q.title))errs.push(at+'['+q.id+'] 缺少 title');
    if(!q.start||typeof q.start!=='object')errs.push(at+'['+q.id+'] 缺少 start 条件');
    if(!Array.isArray(q.steps)||!q.steps.length)errs.push(at+'['+q.id+'] steps 为空');
  });
  return errs;
}
/* 总校验：事件表 + 任务表 + 区域记忆事件表（0 错误即通过） */
function validateAll(){
  schemaResRefresh();
  return validateEvents().concat(validateQuests()).concat(validateRegionEvents())
    .concat(validateItemRefs()).concat(validateNpcs()).concat(validateWorld())
    .concat(validateEquip()).concat(validatePills()).concat(validateCult());
}
function validateRegionEvents(){
  var errs=[];
  if(typeof REGION_EVENTS==='undefined'||!Array.isArray(REGION_EVENTS))return ['REGION_EVENTS 缺失'];
  var seen={},cover={};
  REGION_EVENTS.forEach(function(ev,i){
    var at='[regionEvent#'+i+']';
    if(!_isStr(ev.id)){errs.push(at+' 缺少 id');return}
    if(seen[ev.id])errs.push(at+' id 重复：'+ev.id);
    seen[ev.id]=true;
    if(!_isStr(ev.region))errs.push(at+'['+ev.id+'] 缺少 region');
    cover[ev.region]=(cover[ev.region]||0)+1;
    if(!_isStr(ev.t))errs.push(at+'['+ev.id+'] 缺少 t');
    if(!Array.isArray(ev.opts)||!ev.opts.length)errs.push(at+'['+ev.id+'] opts 为空');
  });
  for(var k in cover)if(cover[k]<2)errs.push('区域 '+k+' 记忆事件不足 2 条（'+cover[k]+'）');
  return errs;
}

/* ===== v45 数据表全面化：物品引用 / NPC 表 / 世界观表 ===== */
function validateItemRefs(){
  var errs=[];
  var cat=(typeof itemCatalog==='function')?itemCatalog():{};
  function check(name,where){
    if(name===undefined||name===null||name==='')return;
    if(!cat[name])errs.push(where+' 引用的物品不存在：'+name);
  }
  if(Array.isArray(DATA.events))DATA.events.forEach(function(ev){
    if(ev&&ev.refs&&ev.refs.item)check(ev.refs.item,'[event:'+ev.id+']');
  });
  if(typeof MAIN_STORY!=='undefined')MAIN_STORY.forEach(function(ch){
    (ch.steps||[]).forEach(function(st){
      if(st.type==='collect')check(st.param,'[main:'+ch.id+'.collect]');
      if(st.type==='story')(st.opts||[]).forEach(function(o){if(o.fx&&o.fx.item)check(o.fx.item.name,'[main:'+ch.id+'.'+st.id+']');if(o.fx&&o.fx.winFx&&o.fx.winFx.item)check(o.fx.winFx.item.name,'[main:'+ch.id+'.'+st.id+']')});
    });
  });
  if(typeof SIDE_QUESTS!=='undefined')SIDE_QUESTS.forEach(function(q){
    (q.steps||[]).forEach(function(st){
      if(st.type==='collect')check(st.param,'[side:'+q.id+'.collect]');
      if(st.type==='story')(st.opts||[]).forEach(function(o){if(o.fx&&o.fx.item)check(o.fx.item.name,'[side:'+q.id+']');if(o.fx&&o.fx.winFx&&o.fx.winFx.item)check(o.fx.winFx.item.name,'[side:'+q.id+']')});
    });
  });
  if(typeof REGION_EVENTS!=='undefined')REGION_EVENTS.forEach(function(ev){
    (ev.opts||[]).forEach(function(o){if(o.fx&&o.fx.item)check(o.fx.item.name,'[region:'+ev.id+']');if(o.fx&&o.fx.winFx&&o.fx.winFx.item)check(o.fx.winFx.item.name,'[region:'+ev.id+']')});
  });
  if(typeof STORY_EVENTS!=='undefined')STORY_EVENTS.forEach(function(ev){
    (ev.opts||[]).forEach(function(o){if(o.fx&&o.fx.item)check(o.fx.item.name,'[story:'+ev.id+']');if(o.fx&&o.fx.winFx&&o.fx.winFx.item)check(o.fx.winFx.item.name,'[story:'+ev.id+']')});
  });
  if(typeof THEME_EVENTS!=='undefined')THEME_EVENTS.forEach(function(ev){
    (ev.opts||[]).forEach(function(o){if(o.fx&&o.fx.item)check(o.fx.item.name,'[theme:'+ev.id+']');if(o.fx&&o.fx.winFx&&o.fx.winFx.item)check(o.fx.winFx.item.name,'[theme:'+ev.id+']')});
  });
  return errs;
}
function validateNpcs(){
  var errs=[];
  if(typeof NPC_POOL==='undefined'||!Array.isArray(NPC_POOL)||NPC_POOL.length<20)errs.push('NPC_POOL 缺失或少于 20 位');
  var seen={};
  (typeof NPC_POOL!=='undefined'?NPC_POOL:[]).forEach(function(n,i){
    if(!n||!_isStr(n.role)){errs.push('[npc#'+i+'] 缺少 role');return}
    if(seen[n.role])errs.push('[npc] role 重复：'+n.role);
    seen[n.role]=1;
    if(!_isStr(n.desc))errs.push('[npc:'+n.role+'] 缺少 desc');
    if(!_isStr(n.style))errs.push('[npc:'+n.role+'] 缺少 style');
    if(n.gender!=='男'&&n.gender!=='女')errs.push('[npc:'+n.role+'] gender 非法');
  });
  return errs;
}
function validateWorld(){
  var errs=[];
  if(typeof THRESHOLDS==='undefined'||!Array.isArray(THRESHOLDS)||THRESHOLDS.length!==42)errs.push('THRESHOLDS 应为 42 档');
  if(typeof ARTS==='undefined'||!Array.isArray(ARTS)||ARTS.length<10)errs.push('ARTS 功法表过少');
  (typeof ARTS!=='undefined'?ARTS:[]).forEach(function(a,i){
    if(!a||!_isStr(a.name)){errs.push('[art#'+i+'] 缺少 name');return}
    if(a.flow&&['sword','demon','body','dan','spirit','law'].indexOf(a.flow)<0)errs.push('[art:'+a.name+'] flow 非法：'+a.flow);
  });
  return errs;
}
/* v47 事件库总量对账：目标 300+（只统计叙事/事件条目） */
function eventTotalCount(){
  let n=0;
  if(Array.isArray(DATA.events))n+=DATA.events.length;
  if(typeof REGION_EVENTS!=='undefined')n+=REGION_EVENTS.length;
  if(typeof STORY_EVENTS!=='undefined')n+=STORY_EVENTS.length;
  if(typeof THEME_EVENTS!=='undefined')n+=THEME_EVENTS.length;
  if(typeof PARTNER_EVENTS!=='undefined')n+=PARTNER_EVENTS.length;
  if(typeof SECT_EVENTS!=='undefined')n+=SECT_EVENTS.length;
  if(typeof MAIN_STORY!=='undefined')n+=MAIN_STORY.reduce((a,c)=>a+c.steps.filter(s=>s.type==='story').length,0);
  if(typeof SIDE_QUESTS!=='undefined')n+=SIDE_QUESTS.reduce((a,c)=>a+c.steps.filter(s=>s.type==='story').length,0);
  if(typeof CALM_V!=='undefined')n+=CALM_V.length+HERB_V.length+RARE_V.length+DANGER_V.length;
  if(typeof SEASONAL_EVENTS!=='undefined')n+=SEASONAL_EVENTS.length;
  if(typeof YEARLY_EXTRA!=='undefined')n+=YEARLY_EXTRA.length;
  n+=16; /* yearlyEvent 内置年度事件 */
  return n;
}
/* ===== v49 装备数据表校验：套装 / 宝石 / 词条 ===== */
function validateEquip(){
  var errs=[];
  if(typeof EQUIP_SETS==='undefined'||!Array.isArray(EQUIP_SETS)||EQUIP_SETS.length<4)errs.push('EQUIP_SETS 至少 4 套');
  else EQUIP_SETS.forEach(function(s,i){
    if(!s||!_isStr(s.id)){errs.push('[set#'+i+'] 缺少 id');return}
    if(!s.pieces||!_isStr(s.pieces['2'])||!_isStr(s.pieces['3']))errs.push('[set:'+s.id+'] 缺少 2/3 件效果文案');
  });
  var gemSeen={};
  if(typeof GEM_DEFS==='undefined'||!Array.isArray(GEM_DEFS)||GEM_DEFS.length<10)errs.push('GEM_DEFS 至少 10 种');
  else GEM_DEFS.forEach(function(g,i){
    if(!g||!_isStr(g.id)){errs.push('[gem#'+i+'] 缺少 id');return}
    if(gemSeen[g.id])errs.push('[gem] id 重复：'+g.id);
    gemSeen[g.id]=1;
    if(['atk','def','agi','hp','luck','beat'].indexOf(g.stat)<0)errs.push('[gem:'+g.id+'] stat 非法：'+g.stat);
  });
  var affSeen={};
  if(typeof AFFIX_POOL==='undefined'||!Array.isArray(AFFIX_POOL)||AFFIX_POOL.length<10)errs.push('AFFIX_POOL 至少 10 条');
  else AFFIX_POOL.forEach(function(a,i){
    if(!a||!_isStr(a.id)){errs.push('[affix#'+i+'] 缺少 id');return}
    if(affSeen[a.id])errs.push('[affix] id 重复：'+a.id);
    affSeen[a.id]=1;
    if(['atk','def','agi','int','cha','wil','beat','cult','stones','demon'].indexOf(a.stat)<0)errs.push('[affix:'+a.id+'] stat 非法：'+a.stat);
  });
  return errs;
}
/* ===== v50 丹药数据表校验：研创丹方 / 丹毒表 ===== */
function validatePills(){
  var errs=[];
  if(typeof RESEARCH_RECIPES==='undefined'||!Array.isArray(RESEARCH_RECIPES)||RESEARCH_RECIPES.length<8)errs.push('RESEARCH_RECIPES 至少 8 个研创丹方');
  var cat=(typeof itemCatalog==='function')?itemCatalog():{};
  if(typeof RESEARCH_RECIPES!=='undefined'&&Array.isArray(RESEARCH_RECIPES))RESEARCH_RECIPES.forEach(function(r){
    if(r&&r.name&&!cat[r.name])errs.push('研创丹方未入物品目录：'+r.name);
  });
  if(typeof PILL_TOX==='object'&&PILL_TOX)Object.keys(PILL_TOX).forEach(function(nm){
    if(!cat[nm])errs.push('丹毒表引用物品不存在：'+nm);
  });
  return errs;
}
/* ===== v55 修行深化数据表校验：法门 / 场景 / 顿悟事件 ===== */
function validateCult(){
  var errs=[];
  if(typeof CULT_METHODS==='undefined'||!Array.isArray(CULT_METHODS)||CULT_METHODS.length<4)errs.push('CULT_METHODS 至少 4 种法门');
  else CULT_METHODS.forEach(function(m,i){
    if(!m||!_isStr(m.id)||!_isStr(m.n)||typeof m.mult!=='number')errs.push('[method#'+i+'] 字段缺失（id/n/mult）');
  });
  if(typeof CULT_SCENES==='undefined'||!Array.isArray(CULT_SCENES)||CULT_SCENES.length<5)errs.push('CULT_SCENES 至少 5 个场景');
  else CULT_SCENES.forEach(function(s,i){
    if(!s||!_isStr(s.id)||!_isStr(s.n)||typeof s.mult!=='number')errs.push('[scene#'+i+'] 字段缺失（id/n/mult）');
  });
  if(typeof MEDITATION_EVENTS==='undefined'||!Array.isArray(MEDITATION_EVENTS)||MEDITATION_EVENTS.length<8)errs.push('MEDITATION_EVENTS 至少 8 条顿悟事件');
  return errs;
}
