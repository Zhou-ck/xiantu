/* ======================================================
  仙途 · 角色面板 / 卡面渲染（Phase 1 表现层）
  水墨大卡 + 六维属性条 + 灵根仪表 + 战力构成 + 状态徽章
  主角 / NPC / 道侣 / 师尊 / 子女统一复用同一卡片。
====================================================== */
'use strict';

/* ===== 3D 角色模型插槽：为未来 3D 引擎预留数据与渲染接入点 ===== */
const MODEL_KEYS={
  '散修剑客':'npc_swordsman','采药女':'npc_herbalist','酒馆掌柜':'npc_innkeeper','妖族狐女':'npc_fox',
  '老乞丐':'npc_beggar','铁匠':'npc_blacksmith','书阁执事':'npc_librarian','神秘道人':'npc_daoist',
  '古琴乐师':'npc_lutenist','云游医修':'npc_doctor','丹房女修':'npc_alchemist','佛门行者':'npc_monk',
  '猎妖人':'npc_hunter','行商大贾':'npc_merchant','狐仙苏苏':'partner_husu','剑阁女侠':'partner_jianxia',
  '月下琴姬':'partner_qinji','灵药仙子':'partner_yaoxian','魔道妖女':'partner_yaonv','龙族公主':'partner_longnv',
  '白衣剑仙':'partner_jianxian','儒雅书仙':'partner_shuxian','魔道圣女':'npc_shengnv','冰宫仙子':'npc_binggong',
  '琴阁双姝':'npc_qinshuang','商道女财神':'npc_caishen','昆仑剑侍':'npc_jianshi','妖族豹女':'npc_baonv',
};
function charModelKey(s){
  if(!s)return null;
  if(s.model)return s.model;
  if(s.bg&&s.bg.model)return s.bg.model;
  if(s.role&&MODEL_KEYS[s.role])return MODEL_KEYS[s.role];
  return null;
}
function use3D(){return !!(S&&S.set&&S.set.model3d)}
function modelSlotHtml(s){
  const k=charModelKey(s);
  if(!k)return '';
  return '<div class="model-slot" data-model="'+esc(k)+'" aria-label="3D 角色模型（待接入）">'+
    '<div class="model-slot-tag">🧊 3D · '+esc(k)+'</div>'+
    '<div class="model-slot-hint">模型引擎接入后于此渲染</div></div>';
}
function charIsChild(s){return !!(s&&s.stage!==undefined&&!s.bg&&!s.role&&!s.artKey)}
function charArtKey(s){
  if(!s)return '';
  if(s.bg)return BG_ART[s.bg.id+(s.gender==='女'?'_f':'')]||BG_ART[s.bg.id]||ART.hero;
  if(s.artKey)return s.artKey;
  if(s.role&&SECT_PERSON_ART[s.role+(s.gender==='女'?'女':'男')])return SECT_PERSON_ART[s.role+(s.gender==='女'?'女':'男')];
  if(s.role&&NPC_ART[s.role])return NPC_ART[s.role];
  return s.gender==='男'?ART.daoist:ART.lady;
}
function charArtHtml(s,w,h,cls){
  if(charIsChild(s))return childAvatar(s.gender,s.stage);
  if(use3D()&&charModelKey(s))return modelSlotHtml(s);
  const k=charArtKey(s);
  return k?artImg(k,w,h,cls):'';
}
function daoPathName(k){return {sword:'🗡️ 剑道',dan:'⚗️ 丹道',array:'🌀 阵道',dark:'🌑 魔道',free:'🕊️ 逍遥道'}[k]||k}

/* ---------- 卡片头部：立绘 + 身份 + 关系标签 ---------- */
function charCardHeadHtml(s,pr,rel){
  const g=pr.identity.gender==='女'?'♀':'♂';
  const tags=[];
  if(pr.identity.role)tags.push(esc(pr.identity.role));
  if(pr.identity.realm)tags.push(esc(pr.identity.realm));
  if(pr.identity.sectName)tags.push('🏯 '+esc(pr.identity.sectName)+(pr.identity.secRank?' · '+esc(pr.identity.secRank):''));
  if(pr.identity.bgName)tags.push('🎭 '+esc(pr.identity.bgName));
  if(pr.identity.title)tags.push('🏅 '+esc(pr.identity.title));
  if(pr.identity.married)tags.push('👰 结缡');
  if(pr.identity.nick)tags.push('💌 '+esc(pr.identity.nick));
  return '<div class="char-head"><div class="char-art">'+charArtHtml(s,112,150,'')+'</div>'+
    '<div class="char-id"><div class="char-name">'+esc(pr.identity.name)+' <span class="char-gender">'+g+'</span>'+(rel?'<span class="rel-tag">'+esc(rel)+'</span>':'')+'</div>'+
    '<div class="char-tags">'+tags.map(t=>'<span class="tag">'+t+'</span>').join('')+'</div>'+
    (pr.identity.desc?'<div class="char-desc">'+esc(pr.identity.desc)+'</div>':'')+
    '</div></div>';
}

/* ---------- 六维属性行（分项明细：根基/功法/伤势/心魔/临时） ---------- */
function attrRowHtml(label,bd){
  const pct=Math.max(0,Math.min(100,Math.round(bd.total/40*100)));
  const detail=bd.parts.filter(p=>p.v).map(p=>'<span class="'+(p.cls==='pos'?'pos':p.cls==='neg'?'neg':'')+'">'+esc(p.n)+' '+(p.v>0?'+':'')+p.v+'</span>').join(' ');
  return '<div class="attr-row"><div class="attr-row-t"><span>'+label+'</span><b>'+bd.total+'</b></div>'+
    '<i class="attr-bar'+(bd.total<0?' neg':'')+'"><i style="width:'+pct+'%"></i></i>'+
    (detail?'<div class="char-sub">'+detail+'</div>':'')+'</div>';
}
/* 侧栏紧凑版：六维小进度条 */
function charAttrsHtml(s){
  s=s||S;
  if(!s||!s.attrs)return '';
  const keys=[['str','力量'],['agi','身法'],['int','智慧'],['cha','魅力'],['wil','心性']];
  const cells=keys.map(([k,label])=>{
    const bd=attrBreakdown(s,k);
    const pct=Math.max(0,Math.min(100,Math.round(bd.total/40*100)));
    return '<div><span>'+label+'</span><b>'+bd.total+'</b><i class="attr-bar"><i style="width:'+pct+'%"></i></i></div>';
  }).join('');
  const rp=Math.max(0,Math.min(100,Math.round(s.root||0)));
  const ec=(typeof elemInfo==='function')?elemInfo(s.rootElem||'fire').c:'#c9b98e';
  return cells+'<div><span>灵根</span><b>'+(s.root||0)+'</b><i class="attr-bar root" style="color:'+ec+'"><i style="width:'+rp+'%"></i></i></div>';
}

/* ---------- 状态徽章：心魔/伤势/瓶颈/丹力等（侧栏与角色卡一致） ---------- */
function charStatusBadges(s){
  s=s||S;
  if(!s)return '';
  const chips=[];
  if((s.heartDemons||0)>0)chips.push('<span class="tag warn">😈 心魔 ×'+s.heartDemons+'</span>');
  if((s.injuries||[]).length)chips.push('<span class="tag warn">🩸 伤势 '+s.injuries.length+'</span>');
  if((s.demonMarks||[]).length)chips.push('<span class="tag warn">🧿 心魔烙印 '+s.demonMarks.length+'</span>');
  const bn=bottleneckInfo(s);
  if(bn.active)chips.push('<span class="tag warn">⚓ 瓶颈 ×0.6</span>');
  if((s.temp&&s.temp.break)||0)chips.push('<span class="tag good">💊 破境丹 +'+s.temp.break+'</span>');
  if((s.flag&&s.flag.qingjie)>0)chips.push('<span class="tag warn">💔 情劫</span>');
  if((s.cultStreak||0)>=60)chips.push('<span class="tag warn">⚠️ 收益递减</span>');
  if((s.pillBuff||0)>0)chips.push('<span class="tag good">💊 聚灵丹 '+s.pillBuff+'日</span>');
  if((s.insight||0)>0)chips.push('<span class="tag good">💡 渡劫感悟 ×'+(s.insight||0)+'</span>');
  if(!chips.length)return '';
  return '<div class="char-status">'+chips.join('')+'</div>';
}

/* ---------- 灵根仪表 ---------- */
function charRootHtml(pr){
  const r=pr.root;
  if(!r)return '';
  const elem=r.elem||{i:'🔥',n:'火灵根',c:'#e08a6a',desc:''};
  const hints=[];
  if(typeof ELEM_SHENG!=='undefined'&&r.eid&&ELEM_SHENG[r.eid]){const sh=elemInfo(ELEM_SHENG[r.eid]);hints.push('相生 '+sh.i+sh.n);}
  if(typeof ELEMS!=='undefined'&&r.eid&&ELEMS[r.eid]&&ELEMS[r.eid].beats){const bt=elemInfo(ELEMS[r.eid].beats);hints.push('克 '+bt.i+bt.n);}
  const tier=r.tier?r.tier[0]+(r.tier[1]?' · '+r.tier[1]:''):'';
  return '<div class="char-sec"><div class="char-sec-t">🧿 灵根</div>'+
    '<div class="char-root"><span class="elem-ring" style="color:'+elem.c+';border-color:'+elem.c+'">'+elem.i+'</span>'+
    '<div><b style="color:'+elem.c+'">'+elem.n+'</b> · '+esc(tier)+'（'+r.value+'）<br><span class="char-sub">'+esc(elem.desc)+' · 修炼 ×'+r.qualityMult.toFixed(2)+(r.fuse?' · 融合双系':'')+(hints.length?'<br>五行：'+hints.join(' · '):'')+'</span></div></div></div>';
}

/* ---------- 战力构成 / 装备 / 修为 / 状态 ---------- */
function charCombatHtml(pr){
  const c=pr.combat;
  const extra=c.eqExtra?((' 词条/宝石/套装：攻势 +'+(c.eqExtra.atk||0)+' · 防御 +'+(c.eqExtra.def||0)+' · 身法 +'+(c.eqExtra.dodge||0)+' · 五行克制 +'+(Math.round((c.eqExtra.beat||0)*100))+'%')):'';
  return '<div class="char-sec"><div class="char-sec-t">⚔️ 战力构成</div>'+
    '<div class="char-row"><span>🗡️ 攻势</span><b>'+c.atk+'</b></div>'+
    '<div class="char-row"><span>🛡️ 闪避</span><b>+'+c.dodge+'</b></div>'+
    '<div class="char-row"><span>👁️ 洞察</span><b>+'+c.insight+'</b></div>'+
    '<div class="char-row"><span>🤝 人望</span><b>+'+c.favor+'</b></div>'+
    '<div class="char-sub">力量→攻势 · 身法→闪避 · 智慧→洞察 · 魅力→人望'+(c.weaponAtk?' · 武器（含相性/熟练）+'+(c.weaponAtk):'')+(c.armorDef?' · 防具 +'+c.armorDef:'')+(c.trinketAll?' · 佩饰 +'+c.trinketAll:'')+(extra||'')+'</div></div>';
}
function charEquipHtml(pr){
  const e=pr.equip;
  const row=(i,n,x)=>'<div class="char-row"><span>'+i+' '+n+'</span><b>'+(x?esc(x.name)+'（+'+(x.bonus||0)+'）':'——')+'</b></div>';
  const sets=(typeof equipSetText==='function')?equipSetText(S):'';
  const durWarn=['weapon','armor','trinket'].map(k=>e[k]).filter(Boolean).filter(x=>(x.durability!==undefined&&x.durability<=0)).map(x=>esc(x.name)+' 耐久归零').join('；');
  return '<div class="char-sec"><div class="char-sec-t">🎒 装备</div>'+
    row('🗡️','法器',e.weapon)+row('🛡️','防具',e.armor)+row('💍','佩饰',e.trinket)+
    (durWarn?'<div class="char-row no"><span>⚠️ 耐久</span><b>'+durWarn+'（属性失效）</b></div>':'')+
    sets+
    '<div class="char-sub">词条、宝石与套装于「更多 → 装备工坊」淬炼；耐久归零则属性失效。同属法器攻势 +1；强化至 +5 不降级。</div></div>';
}
function charCultHtml(pr){
  const c=pr.cult,bn=c.bn;
  const pct=Math.max(0,Math.min(100,Math.round(c.progress*100)));
  const need=Math.max(0,c.thr-c.cult);
  let bnTxt='';
  if(bn.active){
    const miss=[];
    if(bn.missingWis>0)miss.push('悟性缺 '+bn.missingWis);
    if(bn.missingTrail>0)miss.push('历练缺 '+bn.missingTrail);
    bnTxt='<div class="char-row no"><span>⚓ 瓶颈压制（×0.6）</span><b>'+miss.join(' · ')+'</b></div>';
  }else if(c.progress>=0.9){
    bnTxt='<div class="char-row ok"><span>⚓ 瓶颈已破</span><b>可冲击下一境界</b></div>';
  }
  return '<div class="char-sec"><div class="char-sec-t">🧘 修为</div>'+
    '<div class="char-row"><span>'+esc(pr.identity.realm)+'</span><b>'+fmtNum(c.cult)+' / '+fmtNum(c.thr)+'（'+pct+'%）</b></div>'+
    '<i class="attr-bar"><i style="width:'+pct+'%"></i></i>'+
    '<div class="char-sub">距下一境界还需 '+fmtNum(need)+' 修为'+(c.mult?' · 修炼效率 ×'+c.mult.toFixed(2):'')+'</div>'+
    bnTxt+
    '<div class="char-row"><span>🧠 悟性</span><b>'+(c.wis||0)+'</b></div>'+
    '<div class="char-row"><span>🗺️ 历练</span><b>'+(c.trail||0)+'</b></div>'+
    (c.insight>0?'<div class="char-row"><span>💡 渡劫感悟</span><b style="color:#d8b45a">'+c.insight+'（突破判定 +'+Math.min(10,c.insight)+'）</b></div>':'')+
    '</div>';
}
function charStatusHtml(s,pr){
  const st=pr.status;
  const hpPct=Math.max(0,Math.min(100,Math.round(st.hp/Math.max(1,st.maxHp)*100)));
  return '<div class="char-sec"><div class="char-sec-t">🩸 状态</div>'+
    '<div class="char-row"><span>气血</span><b>'+Math.floor(st.hp)+' / '+st.maxHp+'</b></div>'+
    '<div class="char-row"><span>🧿 真元</span><b>'+(s.spirit!==undefined?s.spirit:maxSpirit(s))+' / '+maxSpirit(s)+'</b></div>'+
    (st.danTox>0?'<div class="char-row'+(st.danTox>=60?' no':'')+'"><span>⚠️ 丹毒</span><b>'+st.danTox+'/100'+(st.danTox>=30?'（修炼效率 -'+(5*Math.min(3,Math.floor((st.danTox-30)/30)+1))+'%）':'')+(st.danTox>=60?' · 气血 -10%':'')+'</b></div>':'')+
    '<div class="char-row"><span>🪷 道基</span><b>'+(s.flag.daoBase||0)+'/'+daoBaseCap(s)+'（'+Math.floor(daoBaseRatio(s)*100)+'% · 战力 +'+daoBaseCombat(s)+'）</b></div>'+
    ((s.flag.impurity||0)>0?'<div class="char-row'+(s.flag.impurity>=60?' no':'')+'"><span>⚠️ 灵浊</span><b>'+(s.flag.impurity||0)+'/100'+(s.flag.impurity>=30?'（修炼效率 -'+(5*Math.min(3,Math.floor(((s.flag.impurity||0)-30)/30)+1))+'%）':'')+(s.flag.impurity>=60?' · 气血 -10%':'')+'</b></div>':'')+
    '<i class="attr-bar hp"><i style="width:'+hpPct+'%"></i></i>'+
    charStatusBadges(s)+'</div>';
}

/* ---------- 功法与流派：品阶/重数/熟练度/相性/相生推荐 ---------- */
function charArtsHtml(pr){
  if(!pr.arts||!pr.arts.length)return '';
  const rows=pr.arts.map(a=>{
    const eff=(a.mult*a.elemMult*a.mmult*(a.main?1:0.5)).toFixed(2);
    return '<div class="char-row"><span>'+(a.main?'⭐ 主修':'辅修')+'《'+esc(a.name)+'》</span><b>×'+eff+'</b></div>'+
      '<div class="char-sub">'+esc(a.grade)+' · 第'+(a.level||1)+'重'+(a.mlv?' · 熟练 Lv.'+a.mlv+'（'+(a.mastery||0)+'/150，×'+a.mmult.toFixed(2)+'）':' · 熟练 0/150')+(a.elemMult>1?' · <span style="color:#8fd0a0">灵根相性 ×1.15</span>':'')+'</div>';
  }).join('');
  const f=pr.flow;
  const dao=pr.daoPath?' · 道途：'+daoPathName(pr.daoPath):'';
  return '<div class="char-sec"><div class="char-sec-t">📖 功法与流派</div>'+rows+
    (f?'<div class="char-row"><span>流派</span><b>'+f.i+' '+esc(f.n)+'</b></div><div class="char-sub">'+esc(f.desc)+dao+'</div>':'')+'</div>';
}

/* ---------- 关系 / 统计 ---------- */
function charRelationHtml(pr){
  const r=pr.relations;
  const rows=[];
  if(r.daoPartner)rows.push('<div class="char-row"><span>💞 道侣</span><b>'+esc(r.daoPartner.name)+(r.daoPartner.stage?'（'+esc(r.daoPartner.stage)+'）':'')+'</b></div>');
  if(r.master)rows.push('<div class="char-row"><span>🎓 师尊</span><b>'+esc(r.master.name)+'</b></div>');
  if(r.sect)rows.push('<div class="char-row"><span>🏯 宗门</span><b>'+esc(r.sect)+'</b></div>');
  if(r.companion)rows.push('<div class="char-row"><span>🚶 同行</span><b>'+esc(r.companion)+'</b></div>');
  if(r.children)rows.push('<div class="char-row"><span>👨‍👩‍👧 子嗣</span><b>'+r.children+' 位</b></div>');
  if(r.disciples)rows.push('<div class="char-row"><span>🧒 弟子</span><b>'+r.disciples+' 位</b></div>');
  if(r.affairs)rows.push('<div class="char-row"><span>🌹 暧昧</span><b>'+r.affairs+' 位</b></div>');
  if(!rows.length)return '';
  return '<div class="char-sec"><div class="char-sec-t">🕸️ 关系</div>'+rows.join('')+'</div>';
}
function charStatsHtml(pr){
  const st=pr.stats;
  return '<div class="char-sec"><div class="char-sec-t">📊 统计</div>'+
    '<div class="char-row"><span>⏳ 年岁</span><b>'+st.years+' 载</b></div>'+
    '<div class="char-row"><span>⚔️ 击杀</span><b>'+st.kills+'</b></div>'+
    '<div class="char-row"><span>💀 身陨</span><b>'+st.deaths+'</b></div>'+
    '<div class="char-row"><span>🔄 轮回</span><b>'+st.rebirths+' 世</b></div>'+
    '<div class="char-row"><span>🕯️ 功德 / 业力</span><b>'+st.merit+' / '+st.karma+'</b></div>'+
    '<div class="char-row"><span>🧘 闭关总计</span><b>'+st.cultDaysTotal+' 日</b></div>'+
    '<div class="char-row"><span>☯️ 双修</span><b>'+st.dualCount+' 次 · '+st.dualDays+' 日（独修 '+st.soloDays+' 日）</b></div>'+
    '<div class="char-row"><span>🏅 称号</span><b>'+st.titles+' 个</b></div>'+
    '</div>';
}

/* ---------- NPC 卡 ---------- */
function npcCardHtml(s,pr,rel){
  const head=charCardHeadHtml(s,pr,rel);
  const np=pr.identity.persona;
  const heart=(s.favor||0)>=70?(typeof npcHeart==='function'?npcHeart(s):''):'';
  const rels=(s.rels&&Object.keys(s.rels).length&&typeof relTags==='function')?relTags(s):'';
  const favorLabel=(typeof affectionLabel==='function')?affectionLabel(s.favor||0):'';
  const nmem=(s.nmem||[]).map(m=>typeof m==='string'?m:(m&&m.txt)||'').filter(Boolean).slice(0,5);
  const cmem=(s.memories||[]).map(m=>typeof m==='string'?m:(m&&m.txt)||'').filter(Boolean).slice(0,5);
  return head+
    '<div class="char-sec"><div class="char-sec-t">🤝 交情</div>'+
    '<div class="char-row"><span>好感</span><b>'+(favorLabel?esc(favorLabel)+'（':'')+(s.favor||0)+(favorLabel?'/100）':'')+'</b></div>'+
    '<div class="char-row"><span>🤝 羁绊</span><b>'+(typeof bondTxt==='function'?bondTxt(s):((s.bond||0)+''))+'</b></div>'+
    (s.affinity!==undefined?'<div class="char-row"><span>💓 心动</span><b>'+(s.affinity||0)+'</b></div>':'')+
    (np?'<div class="char-sub">性格：'+esc(np.name)+'（'+np.tags.map(esc).join('·')+'）<br>口头禅：「'+esc(typeof personaLine==='function'?personaLine(np):'')+'」<br>喜好：'+(s.taste?esc(s.taste):'未知')+'</div>':'')+
    '</div>'+
    (rels?'<div class="char-sec"><div class="char-sec-t">🕸️ 关系网</div>'+rels+'</div>':'')+
    (heart?'<div class="char-sec"><div class="char-sec-t">🧩 心结</div><p class="sys" style="font-size:12.5px">'+esc(heart)+'</p></div>':'<p class="char-sub" style="margin-top:8px">🧩 心结深藏——好感 ≥70 后，'+(s.gender==='女'?'她':'他')+'或许愿意说给你听。</p>')+
    (nmem.length?'<div class="char-sec"><div class="char-sec-t">💭 与你的记忆</div><p class="char-sub">'+nmem.map(esc).join('；')+'</p></div>':'')+
    (cmem.length?'<div class="char-sec"><div class="char-sec-t">💞 心动记忆</div><p class="char-sub">'+cmem.map(esc).join('；')+'</p></div>':'')+
    '';
}

/* ---------- 主角卡 ---------- */
function mainCardHtml(s,pr,rel){
  const head=charCardHeadHtml(s,pr,rel);
  const names=['力量','身法','智慧','魅力','心性'];
  const attrRows=['str','agi','int','cha','wil'].map((k,i)=>attrRowHtml(names[i],pr.attrs[k])).join('');
  return head+
    '<div class="char-sec"><div class="char-sec-t">🎯 六维</div>'+attrRows+'</div>'+
    charRootHtml(pr)+
    charCombatHtml(pr)+
    charEquipHtml(pr)+
    charCultHtml(pr)+
    charStatusHtml(s,pr)+
    charArtsHtml(pr)+
    charRelationHtml(pr)+
    charStatsHtml(pr)+
    charCultLogHtml();
}

/* ---------- 对外入口 ---------- */
function characterCardHtml(s,opts){
  s=s||S;opts=opts||{};
  if(!s)return '';
  const pr=characterProfile(s);
  if(!pr)return '';
  return '<div class="char-card">'+(pr.isMain?mainCardHtml(s,pr,opts.rel||''):npcCardHtml(s,pr,opts.rel||''))+'</div>';
}
function openCharPanel(){
  if(!S){toast('尚未踏入仙途');return}
  openPanel('🗂️ 角色档案',characterCardHtml(S)+
    '<div class="row" style="margin-top:12px"><button class="small primary" onclick="panelCult()">🧘 去修炼</button><button class="small" onclick="daoPathPage()">🗺️ 道途指引</button><button class="small" onclick="tryBreak()">⚡ 突破</button></div>');
}
function openNpcCard(p,rel){
  if(!p){toast('查无此人');return}
  openPanel('📇 人物档案 · '+esc(p.name),characterCardHtml(p,{npc:true,rel:rel||''}));
}
function openChildCard(i){
  const c=S&&S.children&&S.children[i];
  if(!c){toast('已不在家中');return}
  openPanel('📇 子嗣档案 · '+esc(c.name),characterCardHtml(c,{npc:true,rel:'子嗣'}));
}
/* 修罗场 / 七夕抉择用：迷你人物牌 */
function charPickHtml(n){
  if(!n)return '';
  const art=charIsChild(n)?childAvatar(n.gender,n.stage):artImg(charArtKey(n),40,40,'avatar');
  return '<span class="char-pick">'+art+'<b>'+esc(n.name)+'</b><small>'+esc(n.role||(n.gender==='女'?'女修':'男修'))+' · 好感 '+(n.favor||0)+'</small></span>';
}

/* ---------- 闭关档案 ---------- */
function charCultLogHtml(){
  const logs=(S&&S.flag&&S.flag.cultLog)||[];
  if(!logs.length)return '<h4 style="margin-top:14px">📜 闭关档案</h4><p style="color:#6f7a94">尚无闭关记录——去洞府闭关，仙途自进。</p>';
  return '<h4 style="margin-top:14px">📜 闭关档案（近 '+logs.length+' 次）</h4>'+
    logs.map(l=>'<div class="bd-row"><span>'+esc(l.realm||'')+' · '+l.days+' 日'+(l.dual?' · ☯️ 双修':' · 🧘 独修')+(l.mode==='bitter'?' · 🔥 苦修':'')+(l.bn?' · ⚓ 瓶颈':'')+'</span><b class="pos">+'+l.gain+'</b></div>').join('');
}

/* ---------- 突破筹备清单（修为满 90% 后显示） ---------- */
function breakPrepHtml(nxt){
  const s=S;
  if(!s||nxt>=THRESHOLDS.length)return '';
  const req=THRESHOLDS[nxt];
  const rows=[];
  rows.push({n:'修为 '+fmtNum(s.cult)+' / '+fmtNum(req),ok:s.cult>=req});
  if(isBigBreak(nxt)){
    rows.push({n:'心性 ≥ '+WIL_REQ[nxt]+'（当前 '+effWil(s)+'）',ok:effWil(s)>=WIL_REQ[nxt]});
    const breq=BREAK_REQS[nxt];
    if(breq)for(const r of breq)rows.push({n:r.desc,ok:r.has()});
    if(nxt>=13){
      const trib=s.flag.tribType||'thunder';
      const hint=trib==='thunder'?'备天雷符或雷灵根淬体':trib==='xinmo'?'备清心丹、涤除心魔':trib==='yehuo'?'功德 ≥80 以清光消业':'备防御法器、修习身法';
      rows.push({n:'渡劫准备（'+(trib==='thunder'?'天雷劫':trib==='xinmo'?'心魔劫':trib==='yehuo'?'业火劫':'风劫')+'）：'+hint,ok:true});
    }
    rows.push({n:'破境丹（心性临时 +3，可选）',ok:!!s.items.some(i=>i.use==='break')});
  }
  const bn=bottleneckInfo(s);
  if(bn.active)rows.push({n:'⚓ 瓶颈未破：悟性 '+s.wis+'/'+bn.wisNeed+' · 历练 '+s.trail+'/'+bn.trailNeed,ok:false});
  const done=rows.filter(r=>r.ok).length;
  return '<div class="bd-box prep"><div class="bd-head">⚡ 突破筹备 · '+esc(REALMS[nxt])+'（'+done+'/'+rows.length+'）</div>'+
    rows.map(r=>'<div class="bd-row'+(r.ok?' ok':' no')+'"><span>'+(r.ok?'✅ ':'❌ ')+esc(r.n)+'</span></div>').join('')+'</div>';
}
