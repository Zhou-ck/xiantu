/* ======================================================
  仙途 · 内容目录与审计（v92 G1 内容工业化）
  文件：js/core/content-audit.js
  说明：CONTENT_CATALOG 统一注册内容池；contentSummary /
        contentCheck / contentTotal / contentByBatch /
        contentImport 供运行期面板与自动化测试共用。
  纪律：批次只 push、id 带批前缀、引用必须过 schema 白名单。
====================================================== */
'use strict';

/* 可导入池：AI/人工 session 内 push 的目标 */
var CONTENT_IMPORTABLE = {social:1, story:1, meditation:1, region:1};

var CONTENT_CATALOG = [
  {key:'social',     name:'社交事件',   min:120, idField:'id', importable:true},
  {key:'story',      name:'通用故事',   min:140, idField:'id', importable:true, cats:['calm','herb','rare','epic','danger'], catMin:18},
  {key:'region',     name:'区域记忆',   min:16,  idField:'id', importable:true, regionMin:2},
  {key:'meditation', name:'顿悟事件',   min:16,  idField:'id', importable:true},
  {key:'partner',    name:'道侣事件',   min:24,  idField:'id', importable:false},
  {key:'sect',       name:'宗门事件',   min:24,  idField:'id', importable:false},
  {key:'pet',        name:'灵兽事件',   min:10,  idField:'id', importable:false},
  {key:'theme',      name:'赛季主题',   min:16,  idField:'id', importable:false},
  {key:'npc',        name:'NPC 池',     min:26,  idField:'role',importable:false},
  {key:'items',      name:'物品目录',   min:60,  idField:null, importable:false},
  {key:'arts',       name:'功法',       min:10,  idField:'name',importable:false},
  {key:'sets',       name:'装备套装',   min:4,   idField:'id',  importable:false},
  {key:'gems',       name:'宝石',       min:10,  idField:'id',  importable:false},
  {key:'affix',      name:'词条',       min:10,  idField:'id',  importable:false},
  {key:'research',   name:'研创丹方',   min:8,   idField:'name',importable:false},
  {key:'methods',    name:'修炼法门',   min:4,   idField:'id',  importable:false},
  {key:'scenes',     name:'修炼场景',   min:5,   idField:'id',  importable:false},
  {key:'main',       name:'主线章节',   min:11,  idField:'id',  importable:false},
  {key:'side',       name:'支线任务',   min:10,  idField:'id',  importable:false},
  {key:'map',        name:'地图地点',   min:8,   idField:'id',  importable:false},
  {key:'titles',     name:'称号',       min:36,  idField:'id',  importable:false},
  {key:'karma',      name:'轮回执念',   min:5,   idField:'id',  importable:false},
];

function _contentPool(key){
  switch(key){
    case 'social': return (typeof DATA!=='undefined'&&Array.isArray(DATA.events))?DATA.events:[];
    case 'story': return (typeof STORY_EVENTS!=='undefined'&&Array.isArray(STORY_EVENTS))?STORY_EVENTS:[];
    case 'region': return (typeof REGION_EVENTS!=='undefined'&&Array.isArray(REGION_EVENTS))?REGION_EVENTS:[];
    case 'meditation': return (typeof MEDITATION_EVENTS!=='undefined'&&Array.isArray(MEDITATION_EVENTS))?MEDITATION_EVENTS:[];
    case 'partner': return (typeof PARTNER_EVENTS!=='undefined'&&Array.isArray(PARTNER_EVENTS))?PARTNER_EVENTS:[];
    case 'sect': return (typeof SECT_EVENTS!=='undefined'&&Array.isArray(SECT_EVENTS))?SECT_EVENTS:[];
    case 'pet': return (typeof PET_EVENTS!=='undefined'&&Array.isArray(PET_EVENTS))?PET_EVENTS:[];
    case 'theme': return (typeof THEME_EVENTS!=='undefined'&&Array.isArray(THEME_EVENTS))?THEME_EVENTS:[];
    case 'npc': return (typeof NPC_POOL!=='undefined'&&Array.isArray(NPC_POOL))?NPC_POOL:[];
    case 'items': {
      var cat=(typeof itemCatalog==='function')?itemCatalog():{};
      return Object.keys(cat).map(function(n){return {name:n}});
    }
    case 'arts': return (typeof ARTS!=='undefined'&&Array.isArray(ARTS))?ARTS:[];
    case 'sets': return (typeof EQUIP_SETS!=='undefined'&&Array.isArray(EQUIP_SETS))?EQUIP_SETS:[];
    case 'gems': return (typeof GEM_DEFS!=='undefined'&&Array.isArray(GEM_DEFS))?GEM_DEFS:[];
    case 'affix': return (typeof AFFIX_POOL!=='undefined'&&Array.isArray(AFFIX_POOL))?AFFIX_POOL:[];
    case 'research': return (typeof RESEARCH_RECIPES!=='undefined'&&Array.isArray(RESEARCH_RECIPES))?RESEARCH_RECIPES:[];
    case 'methods': return (typeof CULT_METHODS!=='undefined'&&Array.isArray(CULT_METHODS))?CULT_METHODS:[];
    case 'scenes': return (typeof CULT_SCENES!=='undefined'&&Array.isArray(CULT_SCENES))?CULT_SCENES:[];
    case 'main': return (typeof MAIN_STORY!=='undefined'&&Array.isArray(MAIN_STORY))?MAIN_STORY:[];
    case 'side': return (typeof SIDE_QUESTS!=='undefined'&&Array.isArray(SIDE_QUESTS))?SIDE_QUESTS:[];
    case 'map': return (typeof MAP_LOCS!=='undefined'&&Array.isArray(MAP_LOCS))?MAP_LOCS:[];
    case 'titles': return (typeof TITLES!=='undefined'&&Array.isArray(TITLES))?TITLES:[];
    case 'karma': return (typeof KARMA_GOALS!=='undefined'&&Array.isArray(KARMA_GOALS))?KARMA_GOALS:[];
    default: return [];
  }
}

function contentSummary(){
  var out={};
  CONTENT_CATALOG.forEach(function(c){
    var arr=_contentPool(c.key);
    var row={name:c.name, count:arr.length, min:c.min, ok:arr.length>=c.min};
    if(c.cats){
      row.cats={};
      c.cats.forEach(function(cat){
        var n=arr.filter(function(e){return e&&e.cat===cat}).length;
        row.cats[cat]={count:n, min:c.catMin||0, ok:n>=(c.catMin||0)};
      });
    }
    if(c.key==='region'){
      row.regions={};
      arr.forEach(function(e){
        if(!e||!e.region)return;
        row.regions[e.region]=(row.regions[e.region]||0)+1;
      });
    }
    out[c.key]=row;
  });
  out._totalEvents=(typeof eventTotalCount==='function')?eventTotalCount():0;
  out._thresholds=(typeof THRESHOLDS!=='undefined'&&Array.isArray(THRESHOLDS))?THRESHOLDS.length:0;
  return out;
}

function contentTotal(){
  var n=0;
  CONTENT_CATALOG.forEach(function(c){n+=_contentPool(c.key).length});
  return n;
}

/* 池内 id 去重 + 事件池跨池去重 + 配额 + 区域覆盖；引用断链委托 validateAll */
function contentCheck(){
  if(typeof schemaResRefresh==='function')schemaResRefresh();
  var errs=[];
  /* 叙事事件池跨池 id 不得撞车；装备/地图/称号等允许与其它域同名 */
  var EVENT_CROSS={social:1,story:1,region:1,meditation:1,theme:1,partner:1,sect:1,pet:1};
  var crossSeen={};
  CONTENT_CATALOG.forEach(function(c){
    var arr=_contentPool(c.key);
    if(!arr||!arr.length){
      if(c.min>0)errs.push(c.name+'（'+c.key+'）缺失或为空');
      return;
    }
    if(arr.length<c.min)errs.push(c.name+' 不足 '+c.min+'（现 '+arr.length+'）');
    if(c.idField){
      var poolSeen={};
      arr.forEach(function(e,i){
        var id=e&&e[c.idField];
        var where='['+c.key+'#'+i+']';
        if(!id){errs.push(where+' 缺少 id');return}
        if(poolSeen[id])errs.push(where+' 池内 id 重复：'+id);
        else poolSeen[id]=1;
        if(EVENT_CROSS[c.key]){
          if(crossSeen[id])errs.push(where+' 事件 id 与 '+crossSeen[id]+' 重复：'+id);
          else crossSeen[id]=where;
        }
      });
    }
    if(c.cats){
      c.cats.forEach(function(cat){
        var n=arr.filter(function(e){return e&&e.cat===cat}).length;
        if(n<(c.catMin||0))errs.push('故事类 '+cat+' 不足 '+(c.catMin||0)+'（现 '+n+'）');
      });
    }
    if(c.key==='region'&&c.regionMin){
      var cover={};
      arr.forEach(function(e){if(e&&e.region)cover[e.region]=(cover[e.region]||0)+1});
      Object.keys(cover).forEach(function(r){
        if(cover[r]<c.regionMin)errs.push('区域 '+r+' 记忆事件不足 '+c.regionMin+'（'+cover[r]+'）');
      });
    }
  });
  if(typeof THRESHOLDS==='undefined'||!Array.isArray(THRESHOLDS)||THRESHOLDS.length!==42){
    errs.push('THRESHOLDS 应为 42 档（现 '+(typeof THRESHOLDS!=='undefined'&&THRESHOLDS?THRESHOLDS.length:'?')+'）');
  }
  if(typeof eventTotalCount==='function'&&eventTotalCount()<470){
    errs.push('eventTotalCount 不足 470（现 '+eventTotalCount()+'）');
  }
  /* 引用断链：复用 validateAll 中的事件/物品校验 */
  if(typeof validateAll==='function'){
    var va=validateAll();
    va.forEach(function(e){errs.push(e)});
  }
  /* 道侣/宗门池结构 + fx 白名单 */
  if(typeof validatePartnerEvents==='function')errs=errs.concat(validatePartnerEvents());
  if(typeof validateSectEvents==='function')errs=errs.concat(validateSectEvents());
  /* v97 轮回节点/印记 */
  if(typeof validateKarmaNodes==='function')errs=errs.concat(validateKarmaNodes());
  return errs;
}

/* 道侣/宗门池 fx 键白名单与结构校验 */
var PARTNER_FX_KEYS=['aff','affF','affA','favor','affinity','bond','mem','flag','stones','cult','mood','merit','roll','combat'];
var SECT_FX_KEYS=['favor','bond','contrib','contribVal','merit','insight','fame','stones','cult','mood','hp','flag','roll','combat','mat'];
/* v97 轮回节点/印记表校验 */
function validateKarmaNodes(){
  var errs=[];
  /* 新增节点 ≥4（筑基择道/化神问道为既有代码节点，单轮回合计 ≥6） */
  if(typeof KARMA_NODES==='undefined'||!Array.isArray(KARMA_NODES)||KARMA_NODES.length<4){
    errs.push('KARMA_NODES 至少 4 个新增节点（+ 筑基择道/化神问道 = 单轮回 6 节点）');
    return errs;
  }
  var seen={};
  KARMA_NODES.forEach(function(n,i){
    if(!n||!n.id){errs.push('[node#'+i+'] 缺 id');return}
    if(seen[n.id])errs.push('[node] id 重复：'+n.id);
    seen[n.id]=1;
    if(typeof n.flagKey!=='string'||!n.flagKey)errs.push('['+n.id+'] 缺 flagKey');
    if(typeof n.realm!=='number'||!n.title||!n.q)errs.push('['+n.id+'] 缺 realm/title/q');
    if(!Array.isArray(n.opts)||n.opts.length<2)errs.push('['+n.id+'] opts 至少 2 项');
    else n.opts.forEach(function(o,j){
      if(!o||!o.k||!o.n||!o.desc)errs.push('['+n.id+'] opts['+j+'] 缺 k/n/desc');
      if(typeof o.apply!=='function')errs.push('['+n.id+'] opts['+j+'].apply 必须为函数');
    });
  });
  if(typeof LOOP_MARKS==='undefined'||!Array.isArray(LOOP_MARKS)||LOOP_MARKS.length<6)errs.push('LOOP_MARKS 至少 6 枚');
  else{
    var gSeen={};
    LOOP_MARKS.forEach(function(m,i){
      if(!m||!m.id||!m.goal)errs.push('[mark#'+i+'] 缺 id/goal');
      if(m&&m.goal)gSeen[m.goal]=(gSeen[m.goal]||0)+1;
    });
    if(typeof KARMA_GOALS!=='undefined')KARMA_GOALS.forEach(function(g){
      if(!gSeen[g.id])errs.push('执念 '+g.id+' 缺少对应印记');
    });
  }
  return errs;
}
function _validateFxPool(arr,poolName,allowedFx,allowStage){
  var errs=[];
  if(!Array.isArray(arr)||!arr.length)return errs;
  arr.forEach(function(e,i){
    var at='['+poolName+'#'+i+']';
    if(!e||!e.id){errs.push(at+' 缺 id');return}
    if(typeof e.t!=='string'||!e.t)errs.push('['+e.id+'] 缺 t');
    if(allowStage&&e.stage&&['married','unmarried'].indexOf(e.stage)<0)errs.push('['+e.id+'] stage 非法：'+e.stage);
    if(!Array.isArray(e.opts)||!e.opts.length){errs.push('['+e.id+'] opts 为空');return}
    e.opts.forEach(function(o,j){
      if(!o||typeof o.txt!=='string'||!o.txt)errs.push('['+e.id+'] opts['+j+'] 缺 txt');
      var fx=o&&o.fx||{};
      Object.keys(fx).forEach(function(k){
        if(allowedFx.indexOf(k)<0)errs.push('['+e.id+'] opts['+j+'] fx 键非法：'+k);
      });
      if(fx.roll){
        if(!fx.roll.attr||!fx.roll.dc)errs.push('['+e.id+'] roll 缺 attr/dc');
        if(fx.roll.hitFx)errs=errs.concat(_checkNestedFx(e.id,fx.roll.hitFx,allowedFx));
        if(fx.roll.missFx)errs=errs.concat(_checkNestedFx(e.id,fx.roll.missFx,allowedFx));
      }
      if(fx.combat){
        var c=fx.combat;
        if(!c.name||!c.atk||!c.hp)errs.push('['+e.id+'] combat 缺 name/atk/hp');
        if(c.winFx)errs=errs.concat(_checkNestedFx(e.id,c.winFx,allowedFx));
      }
    });
  });
  return errs;
}
function _checkNestedFx(id,fx,allowedFx){
  var errs=[];
  Object.keys(fx||{}).forEach(function(k){
    if(allowedFx.indexOf(k)<0)errs.push('['+id+'] 嵌套 fx 键非法：'+k);
  });
  return errs;
}
function validatePartnerEvents(){return _validateFxPool(PARTNER_EVENTS,'partner',PARTNER_FX_KEYS,true)}
function validateSectEvents(){return _validateFxPool(SECT_EVENTS,'sect',SECT_FX_KEYS,false)}

/* 按批前缀抽查：b01_ / b02_ / b03_ / b04_ */
function contentByBatch(prefix){
  var errs=[];
  if(!prefix||typeof prefix!=='string')return ['batch 前缀为空'];
  var p=prefix.replace(/_$/,'')+'_';
  var pools=[
    {key:'social', arr:_contentPool('social')},
    {key:'story', arr:_contentPool('story')},
    {key:'region', arr:_contentPool('region')},
    {key:'meditation', arr:_contentPool('meditation')},
    {key:'partner', arr:_contentPool('partner')},
    {key:'sect', arr:_contentPool('sect')},
    {key:'titles', arr:_contentPool('titles')},
  ];
  var found=0;
  pools.forEach(function(pool){
    pool.arr.forEach(function(e,i){
      var id=e&&(e.id||e.role||e.name);
      if(!id||String(id).indexOf(p)!==0)return;
      found++;
      if(pool.key==='social'){
        if(['visit','invite','chat'].indexOf(e.type)<0)errs.push('['+id+'] type 非法');
        if(!e.t||!Array.isArray(e.opts)||!e.opts.length)errs.push('['+id+'] 缺 t/opts');
        if(e.npc&&typeof SCHEMA_RES!=='undefined'&&SCHEMA_RES.npc&&SCHEMA_RES.npc.indexOf(e.npc)<0){
          errs.push('['+id+'] npc 不存在：'+e.npc);
        }
      }
      if(pool.key==='story'){
        if(['calm','herb','rare','epic','danger'].indexOf(e.cat)<0)errs.push('['+id+'] cat 非法');
        if(!e.t||!Array.isArray(e.opts)||!e.opts.length)errs.push('['+id+'] 缺 t/opts');
      }
      if(pool.key==='region'){
        if(!e.region||!e.t||!Array.isArray(e.opts))errs.push('['+id+'] region 字段不全');
      }
      if(pool.key==='meditation'){
        if(!e.t||!Array.isArray(e.opts))errs.push('['+id+'] meditation 字段不全');
      }
      if(pool.key==='partner'||pool.key==='sect'){
        if(!e.t||!Array.isArray(e.opts)||!e.opts.length)errs.push('['+id+'] 缺 t/opts');
      }
      if(pool.key==='titles'){
        if(typeof e.check!=='function'||typeof e.effect!=='function')errs.push('['+id+'] 称号缺 check/effect');
      }
    });
  });
  if(!found)errs.push('批次 '+prefix+' 未找到任何条目');
  return errs;
}

/* session 内导入：仅可导入池；校验→去重→push */
function contentImport(poolKey, entries){
  if(!CONTENT_IMPORTABLE[poolKey])return {ok:false,err:'池不可导入：'+poolKey};
  if(!Array.isArray(entries)||!entries.length)return {ok:false,err:'entries 为空'};
  if(typeof schemaResRefresh==='function')schemaResRefresh();
  var arr=_contentPool(poolKey);
  if(!arr)return {ok:false,err:'目标池不存在'};
  var added=0, skipped=0, errors=[];
  entries.forEach(function(entry,i){
    if(!entry||typeof entry!=='object'){errors.push('#'+i+' 非对象');return}
    if(!entry.id){errors.push('#'+i+' 缺 id');return}
    if(arr.some(function(e){return e&&e.id===entry.id})){skipped++;return}
    if(poolKey==='social'){
      var v=(typeof validateAiEvent==='function')?validateAiEvent(entry):{ok:true};
      if(v&&v.ok===false){errors.push(entry.id+': '+(v.err||'校验失败'));return}
      if(entry.npc&&SCHEMA_RES.npc&&SCHEMA_RES.npc.indexOf(entry.npc)<0){
        errors.push(entry.id+': npc 不存在 '+entry.npc);return;
      }
    }
    if(poolKey==='story'){
      if(['calm','herb','rare','epic','danger'].indexOf(entry.cat)<0){errors.push(entry.id+': cat 非法');return}
      if(!entry.t||!Array.isArray(entry.opts)||!entry.opts.length){errors.push(entry.id+': 缺 t/opts');return}
    }
    if(poolKey==='meditation'||poolKey==='region'){
      if(!entry.t||!Array.isArray(entry.opts)||!entry.opts.length){errors.push(entry.id+': 缺 t/opts');return}
      if(poolKey==='region'&&!entry.region){errors.push(entry.id+': 缺 region');return}
    }
    arr.push(entry);
    added++;
  });
  return {ok:errors.length===0, added:added, skipped:skipped, errors:errors, count:arr.length};
}
