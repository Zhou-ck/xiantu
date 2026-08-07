/* ======================================================
  仙途 · 装备系统（v49）：耐久 / 词条 / 宝石 / 套装
  数据表：js/data/equip.js
  接入：state.js 武器/防具/闪避/气血/修炼钩子 + combat.js 战斗结算 + 行囊/炼器面板
====================================================== */
'use strict';
/* ============ 初始化 / 规范化 ============ */
function affixCountFor(q){return !q||q<=0?0:(q<=2?1:2)}
function gemSlotsFor(q){return !q||q<=0?0:(q<=2?1:2)}
function rollAffixes(q){
  const n=affixCountFor(q),out=[],pool=AFFIX_POOL.slice();
  while(out.length<n&&pool.length){
    const idx=rand(0,pool.length-1);
    const a=pool.splice(idx,1)[0];
    out.push({id:a.id,name:a.name});
  }
  return out;
}
function ensureEquip(it){
  if(!it||(it.type!=='weapon'&&it.type!=='armor'&&it.type!=='trinket'))return it;
  if(it.durability===undefined)it.durability=100;
  if(it.maxDur===undefined)it.maxDur=100;
  if(!Array.isArray(it.affixes))it.affixes=affixCountFor(it.quality||0)?rollAffixes(it.quality||0):[];
  if(!Array.isArray(it.gems))it.gems=[];
  return it;
}
function equipUsable(it){return !!it&&((it.durability===undefined?100:it.durability)>0)}
/* ============ 套装 ============ */
function equipSetCount(s){
  const m={};
  if(!s)return m;
  for(const k of ['weapon','armor','trinket']){
    const it=s[k];
    if(it&&it.setId)m[it.setId]=(m[it.setId]||0)+1;
  }
  return m;
}
function equipSetBonuses(s){
  const out={atk:0,def:0,dodge:0,beat:0,beatDef:0,cult:0,stones:0,demon:0,drain:0,tech:0,first:0,karmaAtk:0,escape:0,exploreSafe:0};
  const m=equipSetCount(s);
  for(const id in m){
    const n=m[id];
    if(n<2)continue;
    const set=setById(id);
    if(!set||!set.bonus)continue;
    const b=set.bonus;
    if(n>=2){
      if(b.beat)out.beat+=b.beat;
      if(b.drain)out.drain+=b.drain;
      if(b.dodge)out.dodge+=b.dodge;
      if(b.exploreSafe)out.exploreSafe+=b.exploreSafe;
      if(b.escape)out.escape+=b.escape;
      if(b.stones)out.stones+=b.stones;
      if(b.atk)out.atk+=b.atk;
      if(b.tech)out.tech+=b.tech;
    }
    if(n>=3){
      if(b.first)out.first+=b.first;
      if(b.karmaAtk)out.karmaAtk+=b.karmaAtk;
      if(b.beatDef)out.beatDef+=b.beatDef;
    }
  }
  return out;
}
function equipSetText(s){
  const m=equipSetCount(s),rows=[];
  for(const id in m){
    const n=m[id],set=setById(id);
    if(!set)continue;
    const got=n>=3?3:(n>=2?2:1);
    const parts=[];
    for(let i=2;i<=got;i++)parts.push(set.pieces[i]);
    rows.push('<div class="bd-row'+(got>=2?' ok':'')+'"><span>'+set.i+' '+esc(set.name)+'（'+n+'/3）</span><b>'+parts.join(' · ')+'</b></div>');
  }
  return rows.length?'<div class="bd-box"><div class="bd-head">⚙️ 套装效果</div>'+rows.join('')+'</div>':'';
}
/* ============ 词条 / 宝石 / 套装数值汇总 ============ */
function equipStats(s){
  const o={atk:0,def:0,dodge:0,hp:0,beat:0,beatDef:0,cult:0,stones:0,demon:0,drain:0,tech:0,first:0,karmaAtk:0,escape:0,exploreSafe:0};
  if(!s)return o;
  for(const k of ['weapon','armor','trinket']){
    const it=s[k];
    if(!equipUsable(it))continue;
    for(const a of (it.affixes||[])){
      const d=affixById(a&&a.id);
      if(d&&o[d.stat]!==undefined)o[d.stat]+=d.val;
    }
    for(const g of (it.gems||[])){
      const d=gemById(g);
      if(d&&o[d.stat]!==undefined)o[d.stat]+=d.val;
    }
  }
  const sb=equipSetBonuses(s);
  for(const k in sb)o[k]+=sb[k];
  /* v97 A1 三途抉择·剑修：攻势 +1 */
  if(s.flag&&s.flag.santu==='sword')o.atk+=1;
  return o;
}
function equipAtk(s){return equipStats(s).atk}
function equipDef(s){return equipStats(s).def}
function equipDodge(s){return equipStats(s).dodge}
function equipHpBonus(s){return equipStats(s).hp}
function equipBeatBonus(s){return equipStats(s).beat}
/* ============ 耐久 ============ */
function wearEquip(s,amt){
  if(!s)return;
  amt=Math.max(0,Math.floor(amt||0));
  for(const k of ['weapon','armor','trinket']){
    const it=s[k];
    if(!it)continue;
    const cur=(it.durability===undefined?100:it.durability);
    it.durability=Math.max(0,cur-amt);
  }
}
function equipRepairCost(it){
  if(!it)return 0;
  const missing=(it.maxDur||100)-((it.durability===undefined?100:it.durability)||0);
  return Math.max(1,Math.ceil(missing*2));
}
function repairEquip(k,self){
  const it=S[k];
  if(!it){toast('该栏位无装备');return}
  const missing=(it.maxDur||100)-(it.durability===undefined?100:it.durability);
  if(missing<=0){toast('此物完好无损');panelEquipWorkshop();return}
  if(self){
    if((S.mats.iron||0)<1){toast('需要铁矿石 ×1');return}
    S.mats.iron-=1;
    it.durability=Math.min(it.maxDur||100,(it.durability===undefined?100:it.durability)+25);
    log('<p class="good">你于炉边以铁矿石修补'+esc(it.name)+'（耐久 +25）。</p>');
  }else{
    const cost=equipRepairCost(it);
    if(S.stones<cost){toast('灵石不足（需 '+cost+'）');return}
    S.stones-=cost;
    it.durability=it.maxDur||100;
    log('<p class="good">坊市铁匠替你修复'+esc(it.name)+'（灵石 -'+cost+'，耐久回满）。</p>');
  }
  panelEquipWorkshop();renderAll();
}
/* ============ 词条洗练 ============ */
function rerollAffix(k){
  const it=S[k];
  if(!it){toast('该栏位无装备');return}
  if(!(it.affixes||[]).length){toast('此物品质不足，未开词条（灵品起 1 条，仙品 2 条）');return}
  if(S.stones<200){toast('灵石不足（需 200）');return}
  if((S.mats.jade||0)<1){toast('寒玉不足（需 1）');return}
  S.stones-=200;S.mats.jade-=1;
  it.affixes=rollAffixes(it.quality||0);
  const nm=(it.affixes||[]).map(a=>a.name).join('、')||'无';
  log('<p class="good">你以寒玉引灵重铸'+esc(it.name)+'的词条：<b>'+nm+'</b>（灵石-200，寒玉-1）。</p>');
  panelEquipWorkshop();renderAll();
}
/* ============ 宝石镶嵌 / 拆卸 ============ */
function socketGem(k,gid){
  const it=S[k];
  if(!it){toast('该栏位无装备');return}
  const slots=gemSlotsFor(it.quality||0);
  if(!slots){toast('此物品质不足，无宝石孔（灵品起 1 孔，仙品 2 孔）');return}
  if((it.gems||[]).length>=slots){toast('宝石孔已满');return}
  const gem=gemById(gid);
  if(!gem){toast('宝石无效');return}
  const idx=S.items.findIndex(x=>x&&x.type==='gem'&&x.gemId===gid);
  if(idx<0){toast('背包中没有'+gem.name);return}
  if(S.stones<1){toast('灵石不足（镶嵌费 1）');return}
  S.stones-=1;
  S.items.splice(idx,1);
  it.gems=it.gems||[];
  it.gems.push(gid);
  log('<p class="loot">你将'+gem.i+' '+gem.name+'嵌入'+esc(it.name)+'：'+gem.desc+'（灵石-1）。</p>');
  panelEquipWorkshop();renderAll();
}
function unsocketGem(k,idx){
  const it=S[k];
  if(!it)return;
  const gid=(it.gems||[])[idx];
  if(!gid)return;
  const gem=gemById(gid);
  it.gems.splice(idx,1);
  addItem({name:gem.name,type:'gem',gemId:gid,quality:2,desc:gem.desc,sell:150});
  log('<p class="sys">你取下'+esc(it.name)+'上的'+gem.name+'（已放回行囊）。</p>');
  panelEquipWorkshop();renderAll();
}
/* ============ 装备工坊面板 ============ */
function gemSellPrice(){return 150}
function panelEquipWorkshop(){
  if(!S){toast('尚未踏入仙途');return}
  const slots=[['weapon','🗡️ 法器',S.weapon],['armor','🛡️ 防具',S.armor],['trinket','💍 佩饰',S.trinket]];
  const rows=slots.map(([k,nm,it])=>{
    if(!it)return '<div class="item-card"><div class="nm">'+nm+'</div><div class="ds">尚未装备。前往坊市或副业·炼器获取。</div></div>';
    const dur=it.durability===undefined?100:it.durability,max=it.maxDur||100;
    const pct=clamp(Math.floor(dur/max*100),0,100);
    const aff=(it.affixes||[]).map(a=>'<span class="tag">'+esc(a.name)+'</span>').join('')||'<span style="color:#6f7a94">无词条</span>';
    const gem=(it.gems||[]).map((g,gi)=>{const d=gemById(g);return '<span class="tag" style="color:#a8d8e8">'+d.i+' '+esc(d.name)+' <button class="small" style="margin-left:2px" onclick="unsocketGem(\''+k+'\','+gi+')">拆</button></span>'}).join('')||'<span style="color:#6f7a94">无宝石</span>';
    const gemsHave=GEM_DEFS.map(g=>'<button class="small" style="margin:2px" onclick="socketGem(\''+k+'\',\''+g.id+'\')">'+g.i+' '+esc(g.name)+'</button>').join('');
    return '<div class="item-card"><div class="nm">'+nm+' <span class="q'+it.quality+'">'+esc(it.name)+'</span>'+(it.setId&&setById(it.setId)?' <span class="tag">'+setById(it.setId).i+' '+(setById(it.setId).name)+'</span>':'')+(it.strengthen?' <span class="tag">强化+'+it.strengthen+'</span>':'')+'</div>'+
      '<div class="ds">'+esc(it.desc)+'</div>'+
      '<div class="bd-row"><span>耐久</span><b>'+dur+'/'+max+'（'+(equipUsable(it)?'生效':'已失效')+'）</b></div>'+
      '<div class="bar" style="height:6px;margin:4px 0"><i style="width:'+pct+'%;display:block;height:100%;background:'+(pct>30?'#8fd0a0':'#e08a6a')+'"></i></div>'+
      '<div class="bd-row"><span>词条</span><b>'+aff+'</b></div>'+
      '<div class="bd-row"><span>宝石</span><b>'+gem+'</b></div>'+
      '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">'+
      '<button class="small" onclick="repairEquip(\''+k+'\',false)">🔧 修理（'+(equipRepairCost(it)>0?equipRepairCost(it):'完好')+' 灵石）</button>'+
      '<button class="small" onclick="repairEquip(\''+k+'\',true)">⚒️ 自修（铁矿石1·+25）</button>'+
      ((it.affixes||[]).length?'<button class="small primary" onclick="rerollAffix(\''+k+'\')">✨ 洗练词条（200灵石+寒玉1）</button>':'')+
      '</div>'+
      ((gemSlotsFor(it.quality||0)>(it.gems||[]).length)?'<div style="margin-top:6px"><p style="font-size:11.5px;color:#6f7a94;margin-bottom:3px">镶嵌宝石（背包持有：'+GEM_DEFS.filter(g=>S.items.some(x=>x.gemId===g.id)).map(g=>g.i+g.name).join('、')||'无'+'）</p>'+gemsHave+'</div>':'')+
      '</div>';
  }).join('');
  const own=GEM_DEFS.map(g=>{
    const n=S.items.filter(x=>x.gemId===g.id).length;
    return n?('<span class="tag">'+g.i+' '+esc(g.name)+' ×'+n+'</span>'):'';
  }).join('')||'<span style="color:#6f7a94">背包中暂无宝石——秘境、探索与坊市可获。</span>';
  openPanel('⚒️ 装备工坊',
    '<p>法器、防具、佩饰皆可淬炼——词条、宝石与套装，让每一件装备都有构筑的味道。</p>'+
    '<h4>💎 背包宝石</h4><p>'+own+'</p>'+
    equipSetText(S)+
    '<h4>⚔️ 已装备</h4>'+rows+
    '<p style="font-size:11.5px;color:#6f7a94;margin-top:8px">战斗胜利-3 耐久、落败-8、身陨-20；耐久归零后词条与宝石一并失效，记得修理。同套装集齐 2 件/3 件激活效果。</p>');
}
