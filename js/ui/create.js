/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 角色创建 ================
====================================================== */
'use strict';
/* ================= 角色创建 ================= */
let GENDER_MODE='男';
function rerollPreview(){
  rerollPreviewG(GENDER_MODE);
}
function rerollPreviewG(g){
  const name=$('nameInput').value.trim()||randomName(g);
  $('nameInput').value=name;
  const pool=BACKGROUNDS.filter(b=>b.gender===g);
  const bg=pool.length?pick(pool):pick(BACKGROUNDS);
  const attrs={str:rand(1,20),agi:rand(1,20),int:rand(1,20),cha:rand(1,20),wil:rand(1,20)};
  for(const k in bg.mods)attrs[k]=clamp(attrs[k]+bg.mods[k],1,30);
  const root=clamp(rand(1,100)+(bg.root||0),1,100);
  const luck=rand(1,100);
  const elem=pickRootElem();
  const persona=pickPersona(bg);
  const LABELS={str:'力量',agi:'身法',int:'智慧',cha:'魅力',wil:'心性'};
  $('createAttr').innerHTML=
    ['str','agi','int','cha','wil'].map(k=>'<div class="attr-cell"><span class="k">'+LABELS[k]+'</span><span class="v">'+attrs[k]+'</span></div>').join('')+
    '<div class="attr-cell wide"><span class="k">灵根资质</span><span class="v">'+root+'</span></div>'+
    '<div class="attr-cell wide"><span class="k">灵根属性</span><span class="v" style="color:'+elemInfo(elem).c+'">'+elemInfo(elem).i+' '+elemInfo(elem).n+'</span></div>'+
    '<div class="attr-cell wide"><span class="k">气运（天机不可测）</span><span class="v">？？</span></div>';
  const artKey=bg.gender==='女'?(BG_ART[bg.id+'_f']||BG_ART[bg.id]):(BG_ART[bg.id]||ART.hero);
  $('createBg').innerHTML=
    '<div class="hero-portrait">'+artImg(artKey,150,200,'hero')+'</div>'+
    '<div class="bg-card"><h3>'+(g==='女'?'♀ 女修':'♂ 男修')+' · '+esc(bg.name)+'</h3><p>'+esc(bg.desc)+'</p>'+
    '<div class="mods">性格：<b>'+esc(persona.name)+'</b>（'+persona.tags.map(esc).join('·')+'）<br>「'+esc(personaLine(persona))+'」</div>'+
    '<div class="mods">'+(bg.traits.map(t=>'◈ '+t.name+'：'+t.desc).join('<br>'))+'</div></div>';
  window._preview={name,gender:g,bg,attrs,root,luck,elem,persona};
  refreshLoopBar();
  const f=$('btnGenderF'),m=$('btnGenderM');
  if(f&&m){f.classList.toggle('active',g==='女');m.classList.toggle('active',g==='男')}
  const rr=$('btnReroll');if(rr)rr.textContent='换一位'+(g==='女'?'女修':'男修');
}
function switchGender(g){
  GENDER_MODE=g;
  const name=$('nameInput');if(name)name.value='';
  rerollPreviewG(g);
}
function beginGame(){
  const p=window._preview;
  if(!p){rerollPreview();return}
  if(!window._loopPicks)window._loopPicks={attrs:0,root:false,art:false,luck:false,spent:0};
  S=newState(p.name,p.bg,p.gender);
  if(p.elem)S.rootElem=p.elem;
  S.attrs=p.attrs;S.root=p.root;S.luck=p.luck;
  if(p.persona)S.persona=p.persona;
  /* 2H 轮回兑换应用 */
  if(window._loopPicks.attrs>0){for(const k in S.attrs)S.attrs[k]=clamp(S.attrs[k]+window._loopPicks.attrs,1,40)}
  if(window._loopPicks.root)S.root=clamp(Math.max(50,rand(50,90)),1,100);
  if(window._loopPicks.luck)S.luck=clamp(S.luck+5,1,100);
  if(window._loopPicks.art){
    const lo=loopLoad();
    if(lo.art&&!S.arts.some(a=>a.name===lo.art))S.arts.push({name:lo.art,mult:1.15,desc:'前世带来的功法记忆',grade:2});
  }
  /* 2T 天道枷锁 + 随机种子 + 速通计时 */
  S.flag.gates=window._gates||[];
  if(S.flag.gates.indexOf('heart')>=0){S.heartDemons=1;log('<p class="danger">天道枷锁·心魔缠身：一开局，识海深处便有一道魔音若隐若现（心魔+1，轮回点 ×1.2）。</p>')}
  if(S.flag.gates.indexOf('stones')>=0){S.stones=Math.floor(S.stones*0.8);log('<p class="sys">天道枷锁·灵石匮乏：此世灵石收入减两成（轮回点 ×1.5）。</p>')}
  if(S.flag.gates.indexOf('life')>=0){S.flag.gateLife=true;log('<p class="sys">天道枷锁·寿元折半：此世寿元只剩七成（轮回点 ×2.0）。</p>')}
  S.flag.seed=window._seed||String(Math.floor(100000+Math.random()*900000));
  S.flag.speedStart=S.days;
  /* 2H 前世记忆因果提示 */
  if(S.memories.length>=6)S.flag.memCue=2;
  else if(S.memories.length>=3)S.flag.memCue=1;
  S.maxHp=calcMaxHp(S);S.hp=S.maxHp;
  T.switchScreen('screen-title','screen-game',{after:()=>{
  setSceneImg('title');
  scene('天衍山 · 凡人界 · 晨曦');
  log('<p>云海翻涌如万顷白浪，天衍山孤峰刺破层云。你于破庙中醒来，掌心还残留着梦里的寒意。庙门外青石小径蜿蜒入雾，半截石碑上只余一个「仙」字可辨。</p><p>远处钟鸣悠长，惊起林间飞鸟。你明白，此去再也回不了头。</p>');
  if(S.persona)log('<p class="sys">你生性'+S.persona.tags.join('、')+'，人称「'+S.persona.name+'」。临行前，你摩挲着掌心的老茧，低声道：「'+esc(personaLine(S.persona))+'」</p>');
  const first=S.weapon||S.armor||S.trinket||S.items[0];
  log('<p>你在衣襟里摸到 <b class="q'+first.quality+'">'+esc(first.name)+'</b>，'+(S.weapon?'剑刃虽锈，入手却沉':S.armor?'贴身之物，隐有护主之灵':'它来历不明，似在等你解开谜底')+'。怀中灵石叮当作响，共 <b>'+S.stones+' 块</b>。体内那门「'+esc(S.arts[0].name)+'」的运法，已在你梦中演练了千百遍。</p>');
  log('<p class="sys">系统提示：你可在下方输入栏自由行动，或点击按钮行事。万事开头难，不妨先【闭关修炼】几日，或【外出探索】这片山林。</p>');
  if(S.flag.memCue)log('<p class="sys">💭 前世残梦袭来：'+(S.flag.memCue>=2?'你记得某处秘境深处有异宝，也记得某宗门长老欠你一个人情。':'你隐约记得，某处秘境深处似乎埋着什么东西……')+'</p>');
  checkQuests();renderAll();save();
  if(!S.flag.guideShown){S.flag.guideShown=true;showGuide(0)}
  }});
}
/* 2H/2T 轮回兑换与天道枷锁 */
function loopBarHtml(){
  const lo=loopLoad();
  return '🌀 轮回点：<b style="color:#d8b45a">'+lo.points+'</b> · 轮回值：<b style="color:#c8a8d8">'+lo.value+'</b>'+(window._seed?' · 种子：'+window._seed:'');
}
function refreshLoopBar(){
  const el=$('loopBar');
  if(el)el.innerHTML=loopBarHtml();
}
function loopShop(){
  if(!window._loopPicks)window._loopPicks={attrs:0,root:false,art:false,luck:false,spent:0};
  if(!window._gates)window._gates=[];
  const lo=loopLoad();
  const left=Math.max(0,lo.points-(window._loopPicks.spent||0));
  const pick=(k,txt,on)=>'<div class="item-card"><div class="nm">'+txt+'</div><div class="ds">'+(window._loopPicks[k]?'已选 ✓':'剩余 '+left+' 点')+'</div><div style="margin-top:6px"><button class="small'+(window._loopPicks[k]?' primary':'')+'" onclick="'+on+'">'+(window._loopPicks[k]?'取消':'选择')+'</button></div></div>';
  openPanel('🌀 轮回兑换','<p>轮回点<b>跨存档</b>累积：每世结束按境界×结局×称号×天道枷锁结算。兑换仅在<b>本次开局</b>生效。</p>'+
    '<p class="sys">当前轮回点：'+lo.points+' · 本次已花费：'+(window._loopPicks.spent||0)+' · 可用：'+left+'</p>'+
    pick('attrs','属性 +2（全五维，3 点）','loopPick(\'attrs\',3)')+
    pick('root','灵根品质重掷（保底 50，2 点）','loopPick(\'root\',2)')+
    pick('luck','前世气运（气运 +5，3 点）','loopPick(\'luck\',3)')+
    pick('art','保留一门前世功法（4 点'+(lo.art?'，将继承《'+esc(lo.art)+'》':'，当前无记录')+'）','loopPick(\'art\',4)')+
    '<h4>⛓️ 天道枷锁（换取更高轮回点倍率）</h4>'+
    '<div class="item-card"><div class="nm">😈 心魔缠身 ×1.2</div><div class="ds">开局心魔 +1，考验道心</div><div style="margin-top:6px"><button class="small'+(window._gates.indexOf('heart')>=0?' primary':'')+'" onclick="loopGate(\'heart\')">'+(window._gates.indexOf('heart')>=0?'已开启':'开启')+'</button></div></div>'+
    '<div class="item-card"><div class="nm">💸 灵石匮乏 ×1.5</div><div class="ds">灵石收入 -20%</div><div style="margin-top:6px"><button class="small'+(window._gates.indexOf('stones')>=0?' primary':'')+'" onclick="loopGate(\'stones\')">'+(window._gates.indexOf('stones')>=0?'已开启':'开启')+'</button></div></div>'+
    '<div class="item-card"><div class="nm">⏳ 寿元折半 ×2.0</div><div class="ds">寿元上限 -30%</div><div style="margin-top:6px"><button class="small'+(window._gates.indexOf('life')>=0?' primary':'')+'" onclick="loopGate(\'life\')">'+(window._gates.indexOf('life')>=0?'已开启':'开启')+'</button></div></div>'+
    '<h4>🎲 随机种子</h4><p style="font-size:12.5px;color:#6f7a94">种子决定本局出身与属性骰序，同种子可重开复现。</p>'+
    '<div class="row"><input id="seedInput" style="flex:1;padding:8px;background:#151a2b;color:#e8e4d8;border:1px solid #2a3150;border-radius:8px" placeholder="留空则随机"><button class="small primary" onclick="applySeed()">定种</button></div>');
}
function loopPick(k,cost){
  const p=window._loopPicks;
  if(p[k]){p[k]=false;p.spent-=cost}
  else{
    const lo=loopLoad();
    if(lo.points-p.spent<cost){toast('轮回点不足');return}
    p[k]=true;p.spent+=cost;
  }
  loopShop();
}
function loopGate(k){
  const g=window._gates;
  const i=g.indexOf(k);
  if(i>=0)g.splice(i,1);else g.push(k);
  loopShop();
}
function applySeed(){
  const v=($('seedInput')&&$('seedInput').value||'').trim();
  window._seed=v||String(Math.floor(100000+Math.random()*900000));
  rerollPreview();
  refreshLoopBar();
  toast('已定种：'+window._seed);
}
