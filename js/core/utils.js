/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 基础工具 ================
====================================================== */
'use strict';
/* ================= 基础工具 ================= */
let PENDING=0;
function $(id){return document.getElementById(id)}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function d20(){return rand(1,20)}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function chance(p){return Math.random()<p}
/* 加权随机：items 为对象数组，按 item.weight 加权抽取（权重缺省 1） */
function weightedPick(items){
  if(!items||!items.length)return null;
  let total=0;
  for(const it of items)total+=Math.max(0,(it&&it.weight)||1);
  if(total<=0)return items[0]||null;
  let r=Math.random()*total;
  for(const it of items){
    r-=Math.max(0,(it&&it.weight)||1);
    if(r<=0)return it;
  }
  return items[items.length-1];
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
/* 内嵌 SVG 图标集（跨端一致，随 currentColor 变色） */
const ICONS={
  cult:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.5c1.6-4.2 4-6.2 6.5-6.2s4.9 2 6.5 6.2"/>',
  explore:'<circle cx="12" cy="12" r="8.5"/><path d="M15.8 8.2l-2.7 5.1-5.1 2.7 2.7-5.1z"/>',
  market:'<path d="M4 9h16l-1.6 10.2a1.5 1.5 0 0 1-1.5 1.3H7.1a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M4 9l2-4h12l2 4"/><path d="M9.2 9v2.5a2.8 2.8 0 0 0 5.6 0V9"/>',
  bag:'<path d="M6 8h12l1.1 12H4.9z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  sect:'<path d="M12 3.5 4 8.5h16z"/><path d="M6 8.5V19M10 8.5V19M14 8.5V19M18 8.5V19"/><path d="M3.5 19h17"/>',
  social:'<circle cx="9" cy="9" r="3.4"/><path d="M3.5 20c1-3.4 3.3-5 5.5-5s4.5 1.6 5.5 5"/><path d="M15.5 6a3 3 0 0 1 0 6"/><path d="M17 15.5c2 .6 3.2 2.2 3.6 4.5"/>',
  craft:'<path d="M10.5 3.5h3"/><path d="M11 3.5v6L6 18.5A2 2 0 0 0 7.8 21h8.4a2 2 0 0 0 1.8-2.5L13 9.5v-6"/><path d="M8.8 15.5h6.4"/>',
  break:'<path d="M13.2 3 5 13h5.2l-1.4 8 8.2-10H12z"/>',
  rest:'<path d="M4 11.2 12 4.5l8 6.7"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/>',
  side:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9.5 5v14"/>',
  tome:'<path d="M5 3.5h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M5 17.5h14M9 3.5v14"/>',
  save:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4v5.5h6V4M9 20v-6h6v6"/>',
  help:'<path d="M5 3.5h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M9 8.5a3 3 0 0 1 6 0c0 2-3 2.6-3 4.5"/><circle cx="12" cy="17" r=".6"/>',
  attr:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/>',
  combat:'<path d="M6 18 18 6"/><path d="M14 4l6 6-3 3-6-6z"/><path d="M4 20l3-1 1-3"/>',
  path:'<path d="M3 19 9 8l3 5 2-3 7 9z"/>',
  quest:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  equip:'<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  glory:'<circle cx="12" cy="9" r="5"/><path d="M12 6.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/><path d="M9.5 13.5 8 21l4-2 4 2-1.5-7.5"/>',
};
function ico(k){return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[k]||'')+'</svg>'}
/* 角色立绘（data URI，未填充时返回空、界面自然回退为占位布局） */
const ART={hero:'assets/portraits/hero.jpg',fox:'assets/portraits/fox.jpg',daoist:'assets/portraits/daoist.jpg',lady:'assets/portraits/lady.jpg',foxPet:'assets/portraits/foxPet.jpg'};
const BG_ART={orphan:'assets/portraits/bg_orphan.jpg',family:'assets/portraits/bg_family.jpg',villager:'assets/portraits/bg_villager.jpg',general:'assets/portraits/bg_general.jpg',yao:'assets/portraits/bg_yao.jpg',demon:'assets/portraits/bg_demon.jpg',pharmacy:'assets/portraits/bg_pharmacy.jpg',exile:'assets/portraits/bg_exile.jpg',hunter:'assets/portraits/bg_hunter.jpg',merchant:'assets/portraits/bg_merchant.jpg',scholar:'assets/portraits/bg_scholar.jpg',smith:'assets/portraits/bg_smith.jpg',healer:'assets/portraits/bg_healer.jpg',priest:'assets/portraits/bg_priest.jpg','family_f':'assets/portraits/bg_family_f.jpg','yao_f':'assets/portraits/bg_yao_f.jpg','pharmacy_f':'assets/portraits/bg_pharmacy_f.jpg','exile_f':'assets/portraits/bg_exile_f.jpg','scholar_f':'assets/portraits/bg_scholar_f.jpg','healer_f':'assets/portraits/bg_healer_f.jpg','demon_f':'assets/portraits/bg_demon_f.jpg'};
const SECT_ART={sword:'assets/portraits/sect_sword.jpg',dan:'assets/portraits/sect_dan.jpg',fu:'assets/portraits/sect_fu.jpg',zhen:'assets/portraits/sect_zhen.jpg',ti:'assets/portraits/sect_ti.jpg',blood:'assets/portraits/sect_blood.jpg',gu:'assets/portraits/sect_gu.jpg',you:'assets/portraits/sect_you.jpg'};
const NPC_ART={'妖族狐女':ART.fox,'神秘道人':ART.daoist,'散修剑客':'assets/portraits/npc_swordsman.jpg','采药女':'assets/portraits/npc_herbalist.jpg','酒馆掌柜':'assets/portraits/npc_innkeeper.jpg','老乞丐':'assets/portraits/npc_beggar.jpg','铁匠':'assets/portraits/npc_blacksmith.jpg','书阁执事':'assets/portraits/npc_librarian.jpg','仇家':'assets/portraits/npc_steward.jpg','古琴乐师':'assets/portraits/npc_lutenist.jpg','云游医修':'assets/portraits/npc_doctor.jpg','丹房女修':'assets/portraits/npc_alchemist.jpg','佛门行者':'assets/portraits/npc_monk.jpg','猎妖人':'assets/portraits/npc_hunter.jpg','行商大贾':'assets/portraits/npc_merchant.jpg','狐仙苏苏':'assets/portraits/partner_husu.jpg','剑阁女侠':'assets/portraits/partner_jianxia.jpg','月下琴姬':'assets/portraits/partner_qinji.jpg','灵药仙子':'assets/portraits/partner_yaoxian.jpg','魔道妖女':'assets/portraits/partner_yaonv.jpg','龙族公主':'assets/portraits/partner_longnv.jpg','白衣剑仙':'assets/portraits/partner_jianxian.jpg','儒雅书仙':'assets/portraits/partner_shuxian.jpg','魔道圣女':'assets/portraits/npc_shengnv.jpg','冰宫仙子':'assets/portraits/npc_binggong.jpg','琴阁双姝':'assets/portraits/npc_qinshuang.jpg','商道女财神':'assets/portraits/npc_caishen.jpg','昆仑剑侍':'assets/portraits/npc_jianshi.jpg','妖族豹女':'assets/portraits/npc_baonv.jpg'};
const SECT_PERSON_ART={'传功弟子男':'assets/portraits/sect_disciple_m.jpg','传功弟子女':'assets/portraits/sect_disciple_f.jpg','长老男':'assets/portraits/sect_elder_m.jpg','长老女':'assets/portraits/sect_elder_f.jpg','掌门男':'assets/portraits/sect_leader_m.jpg','掌门女':'assets/portraits/sect_leader_f.jpg','内门弟子男':'assets/portraits/npc_swordsman.jpg','内门弟子女':'assets/portraits/npc_alchemist.jpg','真传弟子男':'assets/portraits/npc_blacksmith.jpg','真传弟子女':'assets/portraits/npc_lutenist.jpg','藏经阁执事男':'assets/portraits/npc_librarian.jpg','药圃弟子女':'assets/portraits/npc_herbalist.jpg','巡山执事男':'assets/portraits/npc_hunter.jpg','杂务弟子女':'assets/portraits/npc_innkeeper.jpg'};
function artImg(key,w,h,cls){
  if(!key)return '';
  let st='';
  if(w)st+='width:'+w+'px;';
  if(h)st+='height:'+h+'px;';
  return '<img class="art-img'+(cls?' '+cls:'')+'" src="'+key+'" alt="" loading="lazy" style="'+st+'">';
}
/* ================= v65 卡面化：物品 / 功法统一卡片 ================= */
const ITEM_ICONS={consumable:'💊',weapon:'⚔️',armor:'🛡️',trinket:'📿',mat:'🌿',gem:'💎',craft:'⚗️',collect:'📜',egg:'🥚',item:'📦'};
function itemIcon(it){
  if(it&&it.elem&&typeof ELEMS!=='undefined'&&ELEMS[it.elem])return ELEMS[it.elem].i;
  return (it&&ITEM_ICONS[it.type])||'📦';
}
function itemQName(q){
  if(typeof QNAMES==='undefined')return '';
  const i=q!=null?clamp(q,0,4):0;
  return QNAMES[i];
}
/* 统一品质卡：图标 + 名称 + 标签 + 说明 + 底部按钮区；五行物品带元素色 */
function qcardHtml(o){
  o=o||{};
  const q=o.quality!=null?clamp(o.quality,0,4):0;
  const qn=itemQName(q);
  const ei=o.elem?elemInfo(o.elem):null;
  const ec=ei&&ei.c?ei.c:'';
  return '<div class="item-card qcard qc'+q+(ei?' qcard-elem':'')+'"'+(ec?' style="--ec:'+ec+'"':'')+'>'+
    '<div class="qcard-head">'+
      '<span class="qcard-ico"'+(ec?' style="color:'+ec+'"':'')+'>'+(o.icon||'📦')+'</span>'+
      '<div class="qcard-tx">'+
        '<div class="nm"><span class="q'+q+'">'+esc(o.name)+'</span>'+(o.showQ===false?'':(qn?' <span class="tag qtag q'+q+'">'+qn+'</span>':''))+(o.tags||'')+'</div>'+
        (o.sub?'<div class="qcard-sub">'+o.sub+'</div>':'')+
      '</div>'+
    '</div>'+
    (o.desc?'<div class="ds">'+o.desc+'</div>':'')+
    (o.foot?'<div class="qcard-foot">'+o.foot+'</div>':'')+
  '</div>';
}
function itemCardHtml(it,foot){
  it=it||{};
  const tags=[];
  if(it.count&&it.count>1)tags.push('<span class="tag">×'+it.count+'</span>');
  if(it.elem&&typeof ELEMS!=='undefined'&&ELEMS[it.elem])tags.push('<span class="tag" style="color:'+ELEMS[it.elem].c+'">'+ELEMS[it.elem].i+' '+ELEMS[it.elem].n+'</span>');
  return qcardHtml({
    name:it.name,icon:itemIcon(it),quality:it.quality,elem:it.elem,tags:tags.join(''),
    desc:it.desc?'<span style="color:#a99a72">'+esc(it.desc)+'</span>':'',foot:foot||''
  });
}
/* 剧情人物栏：从文本中识别已知立绘角色，返回登场条 HTML */
function pickCastNames(text){
  if(!text)return [];
  const hit=[];
  const pool=[];
  if(typeof NPC_ART!=='undefined')for(const k in NPC_ART)pool.push(k);
  if(typeof SECT_PERSON_ART!=='undefined')for(const k in SECT_PERSON_ART)pool.push(k);
  pool.sort((a,b)=>b.length-a.length);
  for(const k of pool)if(text.indexOf(k)>=0){hit.push(k);if(hit.length>=2)break}
  return hit;
}
function storyCastBar(keys){
  if(!keys||!keys.length)return '';
  const cells=keys.slice(0,2).map(k=>{
    const src=((typeof NPC_ART!=='undefined'&&NPC_ART[k])||(typeof SECT_PERSON_ART!=='undefined'&&SECT_PERSON_ART[k]));
    return src?'<div class="cast-cell"><img class="cast-img" src="'+src+'" alt="" loading="lazy"><span>'+esc(k)+'</span></div>':'';
  }).filter(Boolean).join('');
  return cells?'<div class="story-cast">'+cells+'</div>':'';
}
/* 场景缩略章：匹配标题到场景图，返回小图章（无匹配返回空） */
function sceneThumb(title){
  if(!title||typeof SCENE_IMG==='undefined')return '';
  for(const [re,k] of SCENE_IMG)if(re.test(title))return '<img class="scn-thumb" src="'+k+'" alt="" loading="lazy">';
  return '';
}
