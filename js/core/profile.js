/* ======================================================
  仙途 · 角色数据档案（profile）
  统一抽取角色数据：面板 / 卡面 / 事件弹窗共用同一份档案，
  保证展示数值与侧栏 renderAll 完全一致（Phase 1 建模）。
====================================================== */
'use strict';

/* 单项属性分项明细：根基 / 功法 / 伤势 / 心魔 / 临时加成 */
function attrBreakdown(s,k){
  s=s||S;
  if(!s||!s.attrs)return {total:0,parts:[]};
  const base=s.attrs[k]||0;
  const art=bonusAttr(s,k);
  const inj=injuryAttrPenalty(s,k);
  const parts=[{n:'根基',v:base,cls:''}];
  if(art)parts.push({n:'功法',v:art,cls:'pos'});
  if(inj)parts.push({n:'伤势',v:inj,cls:'neg'});
  let total=base+art+inj;
  if(k==='wil'){
    const hd=-Math.min(s.heartDemons||0,4);
    const qj=(s.flag&&s.flag.qingjie)>0?-2:0;
    const sg=(typeof signNow==='function')?signNow():null;
    const sgw=(sg&&sg.wil)||0;
    const tb=(s.temp&&s.temp.break)||0;
    if(hd)parts.push({n:'心魔',v:hd,cls:'neg'});
    if(qj)parts.push({n:'情劫',v:qj,cls:'neg'});
    if(tb)parts.push({n:'破境丹',v:tb,cls:'pos'});
    if(sgw)parts.push({n:'天机签',v:sgw,cls:sgw>0?'pos':'neg'});
    total+=hd+qj+tb+sgw;
  }
  return {total:total,parts:parts};
}

/* 统一角色档案：主角与 NPC/道侣/师尊/子女共用同一结构 */
function characterProfile(s){
  s=s||S;
  if(!s)return null;
  const isMain=!!s.attrs;
  const realmIdx=(s.realm!==undefined)?s.realm:((s.stage!==undefined)?Math.min(41,bigStage(s.stage)*4+1):0);
  const realmName=isMain?REALMS[clamp(s.realm,0,REALMS.length-1)]:((typeof stageName==='function')?stageName(s.stage||0):'');
  const elem=(typeof elemInfo==='function')?elemInfo(s.rootElem||'fire'):null;
  const bn=(isMain&&typeof bottleneckInfo==='function')?bottleneckInfo(s):{active:false};
  const flow=(isMain&&typeof flowType==='function')?flowType(s):null;
  const rels=s.rels||{};
  return {
    npc:!isMain,isMain:isMain,
    identity:{
      name:s.name||'',gender:s.gender||'男',role:s.role||'',title:s.title||'',
      bgName:isMain?(s.bg&&s.bg.name)||'':'',realm:realmName,realmIdx:realmIdx,
      age:isMain?Math.floor(s.age||0):0,sectName:(s.sect&&s.sect.name)||'',
      secRank:(isMain&&s.sect&&typeof secRank==='function')?secRank(s):'',
      desc:s.desc||'',favor:!isMain?(s.favor||0):null,affinity:!isMain?(s.affinity||0):null,
      persona:(!isMain&&typeof npcPersona==='function')?npcPersona(s):null,
      taste:s.taste||'',married:!!s.married,nick:s.nickname||'',
      model:(typeof charModelKey==='function')?charModelKey(s):null,
    },
    attrs:isMain?{str:attrBreakdown(s,'str'),agi:attrBreakdown(s,'agi'),int:attrBreakdown(s,'int'),cha:attrBreakdown(s,'cha'),wil:attrBreakdown(s,'wil')}:null,
    root:isMain?{value:s.root||0,eid:s.rootElem||'fire',tier:(typeof rootTier==='function')?rootTier(s.root||0):['',''],elem:elem,qualityMult:(typeof rootQualityMult==='function')?rootQualityMult(s.root||0):1,fuse:s.rootFuse||null}:null,
    combat:isMain?{
      atk:(typeof atkBonus==='function')?atkBonus(s):0,
      dodge:((typeof dodgeBonus==='function')?dodgeBonus(s):0)+((typeof armorDef==='function')?armorDef(s):0),
      insight:(typeof insightBonus==='function')?insightBonus(s):0,
      favor:(typeof favorBonus==='function')?favorBonus(s):0,
      weaponAtk:(typeof weaponAtk==='function')?weaponAtk(s):0,
      armorDef:(typeof armorDef==='function')?armorDef(s):0,
      trinketAll:(typeof trinketAll==='function')?trinketAll(s):0,
    }:null,
    equip:isMain?{weapon:s.weapon,armor:s.armor,trinket:s.trinket}:null,
    cult:isMain?{
      realm:s.realm||0,cult:s.cult||0,thr:bn.thr||THRESHOLDS[Math.min(realmIdx+1,THRESHOLDS.length-1)],
      progress:bn.progress||0,bn:bn,wis:s.wis||0,trail:s.trail||0,insight:s.insight||0,
      mult:(typeof cultMult==='function')?cultMult(s):1,
    }:null,
    status:isMain?{
      hp:s.hp||0,maxHp:s.maxHp||0,heartDemons:s.heartDemons||0,injuries:s.injuries||[],
      demonMarks:s.demonMarks||[],tempBreak:(s.temp&&s.temp.break)||0,cultStreak:s.cultStreak||0,mood:s.mood||60,
    }:null,
    relations:isMain?{
      daoPartner:s.daoPartner?{name:s.daoPartner.name,role:s.daoPartner.role,stage:typeof partnerStage==='function'?partnerStage(s.daoPartner).name:''}:null,
      master:s.master?{name:s.master.name,title:s.master.title||s.master.role}:null,
      children:(s.children||[]).length,disciples:(s.disciples||[]).length,
      sect:s.sect?s.sect.name:null,companion:s.companion?s.companion.name:null,
      affairs:(s.affairs||[]).filter(a=>a&&!a.foe).length,
    }:{rels:rels},
    stats:isMain?{
      years:Math.floor(s.years||0),kills:s.kills||0,deaths:s.deaths||0,rebirths:s.rebirths||0,
      merit:s.merit||0,karma:s.karma||0,dualCount:s.flag.dualCount||0,dualDays:s.flag.dualDays||0,
      soloDays:s.flag.soloDays||0,cultDaysTotal:s.flag.cultDaysTotal||0,exploreCount:s.flag.exploreCount||0,
      dungeons:s.flag.dungeons||0,titles:(s.titles||[]).length,
    }:null,
    arts:isMain?(s.arts||[]).map((a,i)=>({
      name:a.name,grade:(typeof artGradeName==='function')?artGradeName(a):'',level:a.level||1,
      mult:(a.mult||1)+((a.level||1)-1)*0.05,elem:a.elem,elemMult:(typeof elemArtMult==='function')?elemArtMult(s,a):1,
      mastery:a.mastery||0,mlv:artMasteryLevel(a),mmult:artMasteryMult(a),main:i===0,
    })):null,
    flow:flow,daoPath:isMain?(s.flag.dao||null):null,
    memories:(s.memories||[]).slice(0,8),
    nmem:(!isMain&&(s.nmem||[]).length)?(s.nmem||[]).slice(0,8):[],
    childMem:(!isMain&&(s.memories||[]).length)?(s.memories||[]).slice(0,8):[],
  };
}
