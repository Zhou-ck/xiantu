/* ======================================================
  仙途 · 分类导航（底部标签页）
  全部功能按玩法类别组织；未满足条件的功能以 🔒 锁定并提示
====================================================== */
'use strict';
let CUR_TAB='cult';
const TABS=[
  {k:'cult',i:'🧘',n:'修炼',d:'闭关 · 突破 · 心魔 · 灵兽',items:[
    {n:'闭关修炼',i:'🧘',fn:()=>panelCult(),desc:'实时修炼窗口，途中或有异动，可双修'},
    {n:'突破境界',i:'⚡',fn:()=>tryBreak(),desc:'冲击更高境界，需过心性与天劫'},
    {n:'心魔历练',i:'😈',fn:()=>heartTraining(),ok:()=>S.realm>=9,need:'筑基之后方可直面心魔',desc:'直面心魔，道心精进'},
    {n:'静心养神',i:'🪷',fn:()=>settleMind(),desc:'涤尘养道，消磨心魔烙印'},
    {n:'战技参悟',i:'⚔️',fn:()=>panelBattleArts(),desc:'以战悟道，点化攻势/身法/御体/技能'},
    {n:'论道台',i:'📖',fn:()=>panelDaolun(),desc:'与道友辩道证心，道韵共鸣更益'},
    {n:'灵兽',i:'🐾',fn:()=>petPanel(),desc:'喂养、历练、进化灵兽'},
    {n:'双修',i:'💞',fn:()=>doDualCultivate(),ok:()=>!!S.daoPartner,need:'需先有道侣（人际→培养好感→表白）',desc:'与道侣合气双修'},
  ]},
  {k:'world',i:'🧭',n:'历练',d:'探索 · 试炼 · 奇遇 · 秘境',items:[
    {n:'外出探索',i:'🗺️',fn:()=>panelExplore(),desc:'山水之间，机缘与凶险并存'},
    {n:'试炼塔',i:'🏔️',fn:()=>doTower(),ok:()=>S.realm>=2,need:'炼气三层后开启试炼塔',desc:'一层一关，每五层有守塔统领'},
    {n:'时令',i:'🌸',fn:()=>toast(seasonLabel()+'：'+seasonDesc()),desc:'查看当前季节与吉凶'},
  ]},
  {k:'sect',i:'🏯',n:'宗门',d:'拜入 · 任务 · 晋升 · 宝库',items:[
    {n:'宗门（拜入/事务）',i:'🏯',fn:()=>panelSect(),desc:'无宗门时可择派拜入，入宗后接任务晋升'},
    {n:'宗门大比',i:'⚔️',fn:()=>bigCompetition(),ok:()=>!!S.sect&&S.bigCd<=0,need:()=>S&&S.bigCd>0?'大比尚需 '+S.bigCd+' 日':'需先拜入宗门',desc:'三年一赛，扬名立万'},
    {n:'领取月俸',i:'💰',fn:()=>sectSalary(),ok:()=>!!S.sect,need:'需先拜入宗门',desc:'按职位领取灵石与贡献'},
  ]},
  {k:'social',i:'👥',n:'人际',d:'道侣 · 师尊 · 好友',items:[
    {n:'人际往来',i:'👥',fn:()=>panelSocial(),desc:'交谈、请教、赠礼、切磋、结伴'},
    {n:'道侣',i:'💞',fn:()=>panelPartner(),ok:()=>!!S.daoPartner,need:'需先有道侣（人际→培养好感→表白）',desc:'聊天、约会、同游、相处与双修'},
    {n:'师尊',i:'🎓',fn:()=>panelMaster(),ok:()=>!!S.master,need:'需先拜师（宗门长老或江湖高人）',desc:'请安、请教、传功与出师'},
  ]},
  {k:'more',i:'☰',n:'更多',d:'坊市 · 副业 · 洞府 · 行囊',items:[
    {n:'坊市',i:'🏮',fn:()=>panelMarket(),desc:'买卖丹药法器，奇珍拍卖'},
    {n:'行囊',i:'🎒',fn:()=>panelInventory(),desc:'查看并使用物品、装备'},
    {n:'副业',i:'⚒️',fn:()=>panelCraft(),desc:'炼丹、炼器、制符、布阵'},
    {n:'洞府',i:'🏡',fn:()=>panelRest(),desc:'灵田、参悟、静养、天机签'},
    {n:'家族',i:'👨‍👩‍👧',fn:()=>panelFamily(),desc:'子嗣培养、血脉与转生传承'},
    {n:'角色档案',i:'🗂️',fn:()=>openCharPanel(),desc:'角色面板：六维、灵根、战力构成与状态一览'},
    {n:'设置',i:'⚙️',fn:()=>panelSettings(),desc:'特效、微操、音效、AI 接入'},
    {n:'检查更新',i:'🔄',fn:()=>checkGameUpdate(),desc:'检测并应用最新版本'},
  ]},
];
function tabStatusCult(){
  if(!S)return '';
  const nxt=S.realm+1;
  const req=nxt<THRESHOLDS.length?fmtNum(S.cult)+' / '+fmtNum(THRESHOLDS[nxt]):'∞';
  const eff=S.heartDemons>0?'（心魔压制 -'+Math.min(S.heartDemons,4)+'）':'';
  const bn=bottleneckInfo(S);
  const bnTxt=bn.active?' · ⚓瓶颈×0.6':'';
  return '<div class="item-card"><div class="nm">'+REALMS[S.realm]+'</div>'+
    '<div class="ds">修为 '+req+(nxt<THRESHOLDS.length&&S.cult>=THRESHOLDS[nxt]?' <span class="tag" style="color:#8fd0a0">可突破</span>':'')+' · 修炼效率 ×'+cultMult(S).toFixed(2)+bnTxt+' · 心性 '+effWil(S)+eff+' · 心境 <b style="color:'+moodLabel(S.mood||60)[1]+'">'+moodLabel(S.mood||60)[0]+'</b>（'+(S.mood||60)+'，判定 '+(moodMod()>=0?'+':'')+moodMod()+'）</div></div>'+
    '<h4 style="margin-top:10px">🎯 当下目标</h4>'+goalCards();
}
/* 动态目标引导：任何时刻至少给出可执行的下一步 */
function goalCards(){
  if(!S)return '';
  const cards=[];
  const nxt=S.realm+1;
  const needCult=nxt<THRESHOLDS.length?THRESHOLDS[nxt]-S.cult:0;
  if(needCult>0)cards.push({i:'🧘',t:'积累修为（还差 '+needCult+'）',d:'闭关修炼或探索历练',go:'panelCult()'});
  else if(nxt<THRESHOLDS.length)cards.push({i:'⚡',t:'修为已足，可冲击 '+REALMS[nxt],d:'准备心性与渡劫道具后突破',go:'tryBreak()'});
  const bn=bottleneckInfo(S);
  if(bn.active)cards.push({i:'⚓',t:'破瓶颈：悟性 '+bn.wis+'/'+bn.wisNeed+' · 历练 '+bn.trail+'/'+bn.trailNeed,d:'功法参悟增悟性 · 探索/试炼塔增历练',go:'panelRest()'});
  if(isBigBreak(nxt)&&effWil(S)<WIL_REQ[nxt]){
    const gap=WIL_REQ[nxt]-effWil(S);
    cards.push({i:'🪷',t:'提升心性 '+gap+' 点（'+effWil(S)+'/'+WIL_REQ[nxt]+'）',d:'静心养神 / 读书抄经 / 清心丹',go:'panelRest()'});
  }
  if(!S.sect&&S.realm>=4)cards.push({i:'🏯',t:'拜入宗门',d:'获得月俸、任务与功法传承',go:'panelSect()'});
  if(S.heartDemons>0)cards.push({i:'😈',t:'涤除心魔（'+S.heartDemons+' 道）',d:'清心丹 / 静心养神 / 心魔历练',go:'panelMarket()'});
  if((S.injuries||[]).length)cards.push({i:'🩸',t:'治疗伤势（'+S.injuries.length+' 处）',d:'洞府静养或对症丹药',go:'panelRest()'});
  if(!S.daoPartner&&S.realm>=4&&S.npcs.some(n=>n.met&&!n.foe&&n.favor>=60)){
    const top=S.npcs.filter(n=>n.met&&!n.foe&&n.favor>=85)[0];
    cards.push({i:'💞',t:top?'情缘已深，可求结道侣':'有缘人已动心，可结暧昧',d:'人际往来中叩问心意（≥85 可表白，≥60 可暧昧）',go:'panelSocial()'});
  }
  if(S.daoPartner&&(S.affairs||[]).length&&shuraRisk()>=0.2)cards.push({i:'🌩️',t:'修罗场风险偏高',d:'暧昧对象太多，处理不当将情缘尽失',go:'panelSocial()'});
  if(S.karma>=50)cards.push({i:'🕯️',t:'业障缠身（业力 '+S.karma+'）',d:'行善积德可化业力、弱天劫',go:'panelExplore()'});
  if(!cards.length)cards.push({i:'✨',t:'道基稳固，继续探索仙途',d:'游历偶遇、秘境机缘皆有机',go:'panelExplore()'});
  return cards.slice(0,3).map(c=>'<button class="tab-act" onclick="'+c.go+'"><span class="tab-act-ico">'+c.i+'</span><span class="tab-act-tx"><b>🎯 '+esc(c.t)+'</b><small>'+esc(c.d)+'</small></span></button>').join('');
}
function tabHome(k){
  if(PENDING>0){toast('⚠️ 眼前之事未了，请先做出选择');return}
  const t=TABS.find(x=>x.k===k);
  if(!t)return;
  CUR_TAB=k;
  closePanel();
  const lead=(k==='cult'?tabStatusCult():'')+'<p style="font-size:13px;color:#a99a72;margin:8px 0 10px">'+t.d+'</p>';
  const items=t.items.map((it,i)=>{
    const ok=it.ok===undefined||it.ok();
    const needTxt=typeof it.need==='function'?it.need():it.need;
    return '<button class="tab-act'+(ok?'':' locked')+'" onclick="tabGo(\''+k+'\','+i+')">'+
      '<span class="tab-act-ico">'+(ok?it.i:'🔒')+'</span>'+
      '<span class="tab-act-tx"><b>'+esc(it.n)+'</b><small>'+esc(ok?it.desc:('🔒 '+(needTxt||'条件未满足')))+'</small></span></button>';
  }).join('');
  openPanel(t.i+' '+t.n,lead+items+
    '<p style="font-size:12px;color:#6f7a94;margin-top:10px">🔒 表示尚未满足条件，达成后自动解锁。</p>');
  const bar=$('tabbar');
  if(bar){for(const b of bar.querySelectorAll('button'))b.classList.toggle('on',b.dataset.tab===k);}
}
function tabGo(k,i){
  const t=TABS.find(x=>x.k===k);
  if(!t)return;
  const it=t.items[i];
  if(!it)return;
  if(it.ok!==undefined&&!it.ok()){const needTxt=typeof it.need==='function'?it.need():it.need;toast(needTxt||'条件未满足');return}
  closePanel();
  it.fn();
}
