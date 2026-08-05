/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 战斗 ================
====================================================== */
'use strict';
/* ================= 战斗 ================= */
/* ===== 7.1 功法技能：主修功法按五行自动施放主动技（每 3 回合） ===== */
const ART_SKILLS={
  fire:{n:'焚天诀',dmg:1.5,eff:'burn',desc:'烈焰焚身，攻击 ×1.5 并附加灼烧'},
  water:{n:'玄冰缚',dmg:1.3,eff:'freeze',desc:'冰霜缚敌，攻击 ×1.3，几率冻结对手一回合'},
  wood:{n:'长春复苏',dmg:0.9,eff:'heal',desc:'木灵回春，攻击并回复气血'},
  metal:{n:'庚金剑气',dmg:1.6,eff:'pierce',desc:'金气破防，攻击 ×1.6 且无视防御'},
  earth:{n:'厚土镇岳',dmg:1.1,eff:'guard',desc:'土灵护体，攻击 ×1.1 并减半受创'},
  thunder:{n:'九霄引雷',dmg:1.8,eff:'crit',desc:'雷霆万钧，攻击 ×1.8 且必暴击'},
  ice:{n:'寒冰诀',dmg:1.3,eff:'freeze',desc:'冰霜缚敌，攻击 ×1.3，几率冻结对手一回合'},
  wind:{n:'疾风刃',dmg:1.2,eff:'multi',desc:'风刃连击，攻击 ×1.2 并追加一击'},
  dark:{n:'幽冥噬魂',dmg:1.4,eff:'drain',desc:'噬魂吸血，攻击 ×1.4 并按伤害回血'},
  none:{n:'真元冲击',dmg:1.15,eff:null,desc:'无属性修士以真元强攻'},
};
function artSkill(a){
  if(!a)return null;
  const sk=ART_SKILLS[a.elem]||null;
  if(!sk&&a.mult>=1.15)return ART_SKILLS.none;
  return sk;
}
/* ===== 7.2 敌人风格：每种敌人带战斗风格与「妖技」 ===== */
const ENEMY_STYLES={
  rapid:{n:'抢攻',i:'⚡',desc:'攻势凌厉，先手如风',bonus:4,act:'妖技 · 疾影突袭：对方攻势暴涨！'},
  guard:{n:'龟守',i:'🛡️',desc:'皮糙肉厚，善守反击',bonus:0,act:'妖技 · 铁甲护体：对方防御大增！'},
  poison:{n:'用毒',i:'☠️',desc:'阴毒缠身，擅长下毒',bonus:0,act:'妖技 · 淬毒獠牙：你中了毒！'},
  burst:{n:'爆发',i:'💥',desc:'凶性毕露，越伤越猛',bonus:0,act:'妖技 · 狂性大发：对方攻势暴涨！'},
  boss:{n:'妖技',i:'🌀',desc:'守关大妖，手段繁多',bonus:5,act:'妖技 · 妖元迸发：天地色变！'},
};
function startCombat(enemy,onEnd,spar){
  const hasFire=S.items.some(i=>i.name==='火球符');
  const hasThunder=S.items.some(i=>i.name==='天雷符');
  const hasEscape=S.items.some(i=>i.name==='遁地符');
  const btns=[
    {txt:'⚔️ 抢攻迎战',cls:'primary',fn:()=>{S.battleTactic='aggressive';battle(enemy,onEnd,spar)}},
    {txt:'⚖️ 稳健迎战',fn:()=>{S.battleTactic='steady';battle(enemy,onEnd,spar)}},
    {txt:'🛡️ 龟守迎战',fn:()=>{S.battleTactic='defense';battle(enemy,onEnd,spar)}},
    {txt:'💥 搏命迎战（凶险）',cls:'danger',fn:()=>{S.battleTactic='allout';battle(enemy,onEnd,spar)}},
  {txt:'🏃 遁走（身法判定）',fn:()=>{const R=doRoll('agi',12+Math.floor(rl()/3));log('<p>你欲抽身而退：'+rollBadge(R.r,R.mod,R.t,R.dc)+'</p>');if(R.hit){log('<p>你身形一晃，没入林间，甩脱了追兵。</p>');passTime(1);renderAll()}else{battle(enemy,onEnd,spar)}}}];
  if(hasFire)btns.push({txt:'🔥 掷出火球符',fn:()=>{S.flag.combatBuff=6;useItem('火球符');battle(enemy,onEnd,spar)}});
  if(hasThunder)btns.push({txt:'⚡ 掷出天雷符',fn:()=>{S.flag.combatBuff=12;useItem('天雷符');battle(enemy,onEnd,spar)}});
  if(hasEscape)btns.push({txt:'📜 燃遁地符',fn:()=>{useItem('遁地符');log('<p>符箓燃尽，你化作遁光瞬息远去。</p>');passTime(1);renderAll()}});
  logChoices(btns);
}
function battle(enemy,onEnd,spar){
  return new Promise(resolve=>{
    closePanel();
    S.seenE[enemy.name]=(S.seenE[enemy.name]||0)+1;
    const tac=TACTICS[S.battleTactic||'steady'];
    const skill=artSkill(S.arts&&S.arts[0]);
    const es=ENEMY_STYLES[enemy.style]||ENEMY_STYLES[pick(['rapid','guard','poison','burst'])];
    const flow=flowCombatBonus(S,es);
    let pDmg=petAlive()?2+S.pet.bonus*2:0;
    let cDmg=S.companion?2+S.companion.stage*2:0;
    let eh=enemy.hp,ph=S.hp;
    let burn=0,poison=0,frozen=false,guardUp=false,skillCount=0;
    const st={rounds:0,dmgDealt:0,dmgTaken:0,crits:0,misses:0,dodges:0,selfHurt:0,petDmg:0,compDmg:0,beats:0,beatBy:0,win:false,draw:false};
    st.enemyStyle=es.n;st.skillCount=0;st.flow=flowType(S).n;
    const logLines=[];const loot=[];
    const finish=(win,draw)=>{
      if(finished)return;finished=true;
      st.win=win;st.draw=!!draw;
      S.battleTactic='steady';S.flag.combatBuff=0;
      scene('遭遇战 · '+esc(enemy.name));
      if(win){
        S.kills++;S.wins++;S.hp=Math.max(1,ph);
        dC().c.kill++;
        weaponGainMastery(S);
        if(S.flag.pendingMerit){addMerit(S.flag.pendingMerit);loot.push('功德 +'+S.flag.pendingMerit);S.flag.pendingMerit=0}
        if(enemy.name==='荒坟厉鬼'){addMerit(2);loot.push('功德 +2')}
        if(enemy.name==='血魔宗伏杀者'){addMerit(3);loot.push('功德 +3')}
        const g=rand(20,80)+rl()*8;S.stones+=g;loot.push('灵石 +'+g);
        if(chance(0.3)){const m=pick(['herb','iron','pelt','demonCore']);const n=rand(1,2);S.mats[m]=(S.mats[m]||0)+n;loot.push(MAT_NAMES[m]+' ×'+n)}
        if(chance(0.12)){const it=randItem(rand(1,3));addItem(it);loot.push(it.name+'（'+QNAMES[it.quality]+'）')}
        if(chance(0.08)){S.luck=clamp(S.luck+1,1,100);loot.push('气运 +1')}
        log('<p class="good">你斩敌于剑下（'+st.rounds+'回合）。</p>');
        for(const l of loot)log('<p class="loot">· '+l+'</p>');
        const sg1=growAttr('str',0.10,'血战淬炼，膂力渐增'),sg2=growAttr('agi',0.08,'游斗之间，身法渐熟');
        if(sg1||sg2)log(sg1+sg2);
      }else if(ph<=0){
        if(spar){
          S.hp=1;log('<p class="danger">你力战不敌，身受重创，踉跄退开……</p>');
        }else{
          if(S.companion&&S.companion.favor>=30&&chance(0.55)){
            S.hp=1;S.companion.favor=clamp(S.companion.favor-15,0,100);
            log('<p class="good">千钧一发之际，同行之人 <b>'+esc(S.companion.name)+'</b> 拼死相护，将你从鬼门关前拽了回来！（同行之人好感 -15）</p>');
            log('<p class="sys">你身受重创，勉力撑起身形。</p>');
          }else{
            S.hp=0;log('<p class="danger">你力战不敌，身负重伤倒地……</p>');
            $('battle').style.display='none';
            const r={win,draw,st};resolve(r);if(onEnd)onEnd(r);
            die('战死沙场');
            return;
          }
          applyInjury(pick(['jiqiao','neijing','neishang']));
        }
      }else{
        S.hp=Math.max(1,ph-Math.floor(S.maxHp*0.1));
        log('<p class="sys">十回合缠斗，双方力竭，你觅得空隙脱身而去。</p>');
      }
      const alive=passTime(1);
      if(!alive){$('battle').style.display='none';const r={win,draw,st};resolve(r);if(onEnd)onEnd(r);return}
      const verdict=win?'<b style="color:#a8d5a8">🏆 胜</b>':(draw?'<b style="color:#e8c86a">⚖️ 平</b>':'<b style="color:#e08a8a">💀 败</b>');
      const rows=[
        ['结果',verdict],['回合',st.rounds],['造成伤害',st.dmgDealt],['承受伤害',st.dmgTaken],
        (st.flow?['流派',st.flow]:null),
        ['暴击',st.crits+' 次'],['对手落空',st.misses+' 次'],['我方闪避',st.dodges+' 次'],
        ['灵兽助战',st.petDmg?st.petDmg+' 点':'—'],
        ['同行助战',st.compDmg?st.compDmg+' 点':'—'],
        (st.skillCount?['功法技能',st.skillCount+' 次']:null),
        (st.enemyStyle?['敌方风格',st.enemyStyle]:null),
        (st.beats?['五行克制',st.beats+' 次']:null),
        (st.beatBy?['被克受创',st.beatBy+' 次']:null),
        (st.selfHurt?['搏命反噬',st.selfHurt+' 点']:null),
        (loot.length?['战利品',loot.join(' · ')]:null),
      ].filter(Boolean).map(([k,v])=>'<p>'+k+'<b>'+v+'</b></p>').join('');
      $('battleResult').innerHTML='<h4>📜 战后统计</h4>'+rows;
      $('battleResult').style.display='block';
      $('battleContinue').style.display='inline-block';
      window._battleResolve=()=>{const r={win,draw,st};resolve(r);if(onEnd)onEnd(r)};
      renderAll();
    };
    let rnd=1,finished=false;
    const renderBars=()=>{
      $('bEnemyBar').style.width=Math.max(0,Math.round(eh/enemy.hp*100))+'%';
      $('bEnemyHp').textContent=Math.max(0,eh)+' / '+enemy.hp;
      $('bPlayerBar').style.width=Math.max(0,Math.round(ph/S.maxHp*100))+'%';
      $('bPlayerHp').textContent=Math.max(0,Math.floor(ph))+' / '+S.maxHp;
    };
    const pushLog=(html)=>{logLines.push(html);if(logLines.length>8)logLines.shift();$('battleLog').innerHTML=logLines.join('');$('battleLog').scrollTop=999999};
    const step=()=>{
      if(finished)return;
      if(rnd>10){st.rounds=10;finish(false,true);return}
      st.rounds=rnd;
      const html=[];
      const op=!enemy.boss&&(atkBonus(S)*2>=enemy.hp);
      /* 持续状态：灼烧 / 中毒 */
      if(burn>0&&eh>0){const bd=Math.max(1,Math.floor(enemy.hp*0.06));eh=Math.max(0,eh-bd);st.dmgDealt+=bd;html.push('<p class="bl">🔥 灼烧蔓延，<b>'+esc(enemy.name)+'</b> 受创 <span class="bhit">-'+bd+'</span>。</p>')}
      if(poison>0){const pd=Math.max(1,Math.floor(S.maxHp*0.05));ph=Math.max(1,ph-pd);st.dmgTaken+=pd;html.push('<p class="bhit">☠️ 毒素侵蚀，你受创 -'+pd+'（剩余 '+poison+' 回合）。</p>');poison--}
      if(ph<=0){renderBars();pushLog(html.join(''));finish(false,false);return}
      const useSkill=!!skill&&rnd%3===0;
      /* 2C 流派：剑修连击/破防加成 */
      const flowMulti=(flow.multi&&chance(flow.multi))?1:0;
      const pa=d20()+atkBonus(S)+companionAtk()+(signNow()&&signNow().atk?signNow().atk:0)+(useSkill?3:0)+(flow.atk||0)+(flow.vsGuard||0)+(flowMulti?3:0);
      const eStyleAct=chance(0.25)?es:null;
      let eBonus=0,eGuard=false,eSkillTxt='';
      if(eStyleAct){
        if(es===ENEMY_STYLES.poison){poison=2;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.rapid){eBonus=4;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.burst){eBonus=(eh<enemy.hp*0.5)?7:3;eSkillTxt=es.act}
        else if(es===ENEMY_STYLES.guard){eGuard=true;eSkillTxt=es.act}
        else{eBonus=(eh<enemy.hp*0.5)?8:4;eSkillTxt=es.act}
      }
      let ea=d20()+enemy.atk+eBonus-(flow.enemyAtkPen||0);
      if(flow.curse&&chance(flow.curse)){ea=0;html.push('<p class="bdodge">👻 咒术如影随形，敌方动作一滞，攻势落空！</p>')}
      if(pa>=enemy.def+8){
        let dmg=Math.max(2,Math.floor((rand(4,9)+attrVal(S,'str')+weaponAtk(S))*tac.dmg))+pDmg+cDmg;
        if(flow.skill)dmg=Math.floor(dmg*flow.skill);
        if(flowMulti){dmg=Math.floor(dmg*1.5);html.push('<p class="bl">🗡️ 剑势连击，如影随形！</p>')}
        if(op)dmg=Math.floor(dmg*1.5);
        let skTxt='';
        if(useSkill&&skill){
          dmg=Math.floor(dmg*(skill.dmg||1));
          skillCount++;st.skillCount++;
          if(skill.eff==='burn'){burn=2;skTxt='【焚天·灼烧】'}
          else if(skill.eff==='freeze'){frozen=chance(0.5);skTxt='【玄冰·缚敌】'}
          else if(skill.eff==='heal'){const h=Math.floor(dmg*0.5);ph=Math.min(S.maxHp,ph+h);skTxt='【长春·回春 +'+h+'】'}
          else if(skill.eff==='pierce'){/* 无视防御：直接加伤 */dmg=Math.floor(dmg*1.2);skTxt='【庚金·破防】'}
          else if(skill.eff==='guard'){guardUp=true;skTxt='【厚土·护体】'}
          else if(skill.eff==='crit'){const c=pa>=enemy.def+8;/* 必暴 */dmg*=2;st.crits++;skTxt='【九霄·引雷】'}
          else if(skill.eff==='multi'){const extra=Math.max(1,Math.floor(dmg*0.5));eh=Math.max(0,eh-extra);st.dmgDealt+=extra;skTxt='【疾风·连击 +'+extra+'】'}
          else if(skill.eff==='drain'){const h=Math.floor(dmg*0.5);ph=Math.min(S.maxHp,ph+h);skTxt='【幽冥·噬魂 +'+h+'】'}
          else skTxt='【真元·强攻】';
        }
        /* 12 武器词条：灼烧/破甲/回灵/噬魂 */
        if(S.weapon&&S.weapon.enchant){
          if(S.weapon.enchant==='灼烧'){burn=Math.max(burn,1);skTxt+='【灼烧】'}
          else if(S.weapon.enchant==='破甲'){dmg=Math.floor(dmg*1.2);skTxt+='【破甲】'}
          else if(S.weapon.enchant==='回灵'){ph=Math.min(S.maxHp,ph+Math.max(1,Math.floor(dmg*0.1)));skTxt+='【回灵】'}
          else if(S.weapon.enchant==='噬魂'){ph=Math.min(S.maxHp,ph+Math.max(1,Math.floor(dmg*0.2)));skTxt+='【噬魂】'}
        }
        /* 14.4 灵兽/同伴合击 */
        if(pDmg>0&&chance(0.25)){pDmg*=2;skTxt+='【灵兽合击】'}
        if(cDmg>0&&chance(0.25)){cDmg*=2;skTxt+='【同伴合击】'}
        const myElem=(S.weapon&&S.weapon.elem)?S.weapon.elem:elemOf(S);
        const beatHit=enemy.elem&&elemBeat(myElem,enemy.elem);
        if(beatHit){dmg=Math.floor(dmg*1.25);st.beats++}
        const crit=pa>=enemy.def+16;
        if(crit){dmg*=2;st.crits++}
        if(eGuard)dmg=Math.floor(dmg*0.6);
        eh-=dmg;st.dmgDealt+=dmg;st.petDmg+=pDmg;st.compDmg+=cDmg;
        if(flow.drain){const h=Math.max(1,Math.floor(dmg*flow.drain));ph=Math.min(S.maxHp,ph+h);html.push('<p class="bl">🌑 噬血夺元，你汲取 '+h+' 点气血！</p>')}
        if(crit){fxShake(2);fxBurst(22,'#ffd76a');fxHitstop(110);fxFloatText('暴击 -'+dmg,'#ffd76a',true);fxVibrate([50,40,60])}
        else{fxShake(1);fxFloatText('-'+dmg,'#fff',false)}
        html.push('<p class="bl">第 '+rnd+' 回合：你'+(useSkill&&skill?'施展 <b>'+skill.n+'</b> '+skTxt+'：':'出招')+(crit?'【暴击】':'')+'命中'+(beatHit?'【五行克敌 ×1.25】':'')+'，<b>'+esc(enemy.name)+'</b> 受创 <span class="bhit">-'+dmg+'</span>。</p>');
        if(tac.self&&chance(0.2)){const sd=Math.max(1,Math.floor(rand(3,6)*tac.take));ph-=sd;st.selfHurt+=sd;html.push('<p class="bhit">搏命反噬自身，你受创 -'+sd+'。</p>')}
        if(eh<=0){renderBars();pushLog(html.join(''));finish(true,false);return}
      }else{
        if(flow.healEvery&&rnd%flow.healEvery===0){const h=Math.floor(S.maxHp*(flow.healPct||0.08));ph=Math.min(S.maxHp,ph+h);html.push('<p class="bl">⚗️ 丹火流转，你伤势渐复（+'+h+'）。</p>')}
        st.misses++;
        html.push('<p class="bdodge">第 '+rnd+' 回合：你的攻势被对方堪堪避开。</p>');
      }
      if(eSkillTxt)html.push('<p class="bl">'+esc(enemy.name)+' 使出「'+es.n+'」——'+eSkillTxt+'</p>');
      if(frozen){
        frozen=false;
        html.push('<p class="bdodge">❄️ 玄冰缚身，对方动弹不得，错失一回合！</p>');
      }else{
        if(ea>=8+armorDef(S)+dodgeBonus(S)){
          let d=Math.max(1,Math.floor((rand(3,8)+Math.floor(enemy.atk/3)-armorDef(S))*tac.take));
          if(op)d=Math.max(1,Math.floor(d*0.5));
          if(flow.hpMul){d=Math.max(1,Math.floor(d*0.85*(flow.vsBurst||1)));html.push('<p class="bl">💪 肉身硬抗，伤害削减！</p>')}
          if(flow.reflect){const rd=Math.max(1,Math.floor(d*flow.reflect));eh=Math.max(0,eh-rd);st.dmgDealt+=rd;html.push('<p class="bl">🛡️ 反震之力，敌方受创 -'+rd+'。</p>')}
          fxFlash('#a03030',180);fxShake(2);fxFloatText('-'+d,'#e08a8a',false);
          if(guardUp){d=Math.floor(d*0.5);guardUp=false}
          const myElem2=(S.weapon&&S.weapon.elem)?S.weapon.elem:elemOf(S);
          const beatByHit=enemy.elem&&elemBeat(enemy.elem,myElem2);
          if(beatByHit){d=Math.floor(d*1.15);st.beatBy++}
          ph-=d;st.dmgTaken+=d;
          html.push('<p class="bhit">'+esc(enemy.name)+' 反扑而至'+(beatByHit?'【五行反克 ×1.15】':'')+'，你受创 <span class="bhit">-'+d+'</span>。</p>');
          if(ph<=0){renderBars();pushLog(html.join(''));finish(false,false);return}
        }else{
          st.dodges++;
          html.push('<p class="bdodge">你身形一晃，避开了对方的攻势。</p>');
        }
      }
      renderBars();
      pushLog(html.join(''));
      rnd++;
      setTimeout(step,650);
    };
    $('battle').style.display='flex';
    $('battleResult').style.display='none';
    $('battleContinue').style.display='none';
    $('battleLog').innerHTML='';
    $('bEnemyName').textContent='👹 '+enemy.name;
    $('bPlayerName').textContent='🧙 '+S.name;
    $('battleHead').textContent='⚔️ '+enemy.name+' · 战术：'+tac.i+' '+tac.n;
    if(es)pushLog('<p class="bl">对方是<b>'+es.n+'</b>之敌（'+es.desc+'）。</p>');
    if(skill)pushLog('<p class="bl">你主修功法<strong>《'+esc(S.arts[0].name)+'》</strong>的<b>'+skill.n+'</b>每 3 回合自动施展（'+skill.desc+'）。</p>');
    if(enemy.elem)pushLog('<p class="bl">对方气息属 '+elemInfo(enemy.elem).i+' '+elemInfo(enemy.elem).n+(ELEMS[enemy.elem].beats?'（克'+ELEMS[ELEMS[enemy.elem].beats].n+'）':'')+'。</p>');
    if(S.weapon&&S.weapon.elem)pushLog('<p class="bl">你手中 '+esc(S.weapon.name)+' 属 '+elemInfo(S.weapon.elem).n+'。'+(rootAffinity(S,S.weapon.elem)?' 与你的灵根相合，攻势更利。':'')+'</p>');
    if(pDmg>0)pushLog('<p class="bl">灵兽 <b>'+esc(S.pet.name)+'</b> 在旁伺机而动。</p>');
    if(cDmg>0)pushLog('<p class="bl">同行之人 <b>'+esc(S.companion.name)+'</b> 在旁策应。</p>');
    renderBars();
    step();
  });
}
/* ===== 7.3 守关 BOSS：每个大境界一位守关大妖，双阶段狂暴 ===== */
const BOSSES=[
  {stage:0,n:'青鳞蟒',atk:6,def:3,hp:70,desc:'山涧深处的守关妖蟒，皮糙肉厚，狂暴时尾扫如鞭。',elem:'water',style:'burst'},
  {stage:1,n:'魔道巡察使',atk:9,def:4,hp:110,desc:'魔道派出的巡察使，奉命清剿散修，出手狠辣。',elem:'dark',style:'rapid'},
  {stage:2,n:'雷蛟',atk:13,def:6,hp:170,desc:'盘踞雷泽的蛟龙，引雷淬体，妖威赫赫。',elem:'thunder',style:'boss'},
  {stage:3,n:'古修残魂',atk:17,def:8,hp:240,desc:'上古大能的残魂执念，道法玄奇，虚实难测。',elem:'fire',style:'boss'},
  {stage:4,n:'化形妖王',atk:22,def:10,hp:330,desc:'一域妖王，化形入境，灵智通神。',elem:'wood',style:'boss'},
  {stage:5,n:'幽冥鬼帅',atk:28,def:13,hp:440,desc:'幽冥一方的鬼帅，号令阴兵，阴风蚀骨。',elem:'dark',style:'boss'},
  {stage:6,n:'合体魔君',atk:35,def:16,hp:580,desc:'魔道一方合体魔君，凶焰滔天。',elem:'fire',style:'boss'},
  {stage:7,n:'大乘老祖',atk:43,def:20,hp:750,desc:'半步飞升的老祖，一言可镇山河。',elem:'metal',style:'boss'},
  {stage:8,n:'渡劫天尊',atk:52,def:25,hp:950,desc:'渡过天劫的天尊残影，威压众生。',elem:'thunder',style:'boss'},
];
function bossOf(stage){
  const b=BOSSES[clamp(stage,0,BOSSES.length-1)];
  const r=rl();
  return {name:b.n,atk:b.atk+Math.floor(r/2),def:b.def+Math.floor(r/3),hp:b.hp+r*10,elem:b.elem,style:b.style,boss:true,stage:stage};
}
function bossBattle(stage){
  closePanel();
  if(stage===undefined)stage=bigStage(S.realm);
  const e=bossOf(stage);
  const beat=S.flag.bosses||{};
  scene('守关试炼 · '+e.name);
  log('<p>'+(beat[stage]?'你再度来到守关之地，守关大妖一声低吼，旧账新算。':'天地之间荡开一圈涟漪，守关大妖 <b>'+esc(e.name)+'</b> 拦在去路上。')+'</p><p class="sys">'+e.desc+'（'+STAGE_NAMES[stage]+'守关 · 重伤后狂暴）</p>');
  logChoices([
    {txt:'⚔️ 挑战守关',cls:'primary',fn:()=>{
      startCombat(e,res=>{
        if(res.win){
          beat[stage]=true;S.flag.bosses=beat;
          const stones=Math.floor(150+stage*120),cult=Math.floor(200+stage*180+rl()*10);
          S.stones+=stones;S.cult+=cult;
          log('<p class="loot">守关已破：灵石 +'+stones+'，修为 +'+cult+'。</p>');
          if(stage>=2&&!S.flag.bossArt[stage]){
            S.flag.bossArt=S.flag.bossArt||{};
            const a=Object.assign({},pick(ARTS));
            if(!S.arts.some(x=>x.name===a.name)){S.arts.push(a);S.flag.bossArt[stage]=true;log('<p class="loot">守关遗宝：你习得功法《'+a.name+'》！</p>')}
          }
          if(chance(0.4)){S.luck=clamp(S.luck+1,1,100);log('<p class="good">破关历练，气运 +1。</p>')}
          renderAll();
        }else if(res.draw){
          log('<p class="sys">十回合力竭，守关大妖放你离去：「回去练练，再来。」</p>');
          passTime(1);renderAll();
        }else{
          log('<p class="danger">你败下阵来，被守关大妖一掌送出十里。养好伤，再来讨教。</p>');
          passTime(1);renderAll();
        }
      },true);
    }},
    {txt:'🏃 暂且退避',fn:()=>{log('<p>你望了望那守关大妖，还是先回去积蓄实力。</p>');passTime(1);renderAll()}},
  ]);
}
