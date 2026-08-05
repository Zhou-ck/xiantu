/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 存档 ================
====================================================== */
'use strict';
/* ================= 存档 ================= */
const SLOT_KEYS=['xiantu_save_0','xiantu_save_1','xiantu_save_2'];
let SLOT=0;
/* 14.5 本地排行榜：最快突破 / 试炼塔 / 身陨彩蛋 */
const REC_KEY='xiantu_records';
function getRecords(){try{return JSON.parse(localStorage.getItem(REC_KEY)||'{}')}catch(e){return {}}}
function recordScore(k,v){
  const rec=getRecords();
  const better=k.indexOf('fast')>=0?(v<rec[k]):(v>(rec[k]||0));
  if(rec[k]===undefined||better){rec[k]=v;localStorage.setItem(REC_KEY,JSON.stringify(rec));return true}
  return false;
}
function recordsHtml(){
  const rec=getRecords();
  const rows=[['fastZhuji','⚡ 最快筑基（日）'],['fastJindan','🌟 最快金丹（日）'],['fastFeisheng','☁️ 最快飞升（日）'],['tower','🏔️ 试炼塔最高层'],['deaths','💀 身陨次数']];
  return rows.map(([k,n])=>rec[k]!==undefined?'<p>'+n+'：<b>'+rec[k]+'</b></p>':'<p style="color:#6f7a94">'+n+'：未达成</p>').join('');
}
function save(slot){
  try{
    const k=SLOT_KEYS[slot===undefined?SLOT:slot];
    if(S&&S.flag)S.flag.lastVisit=Date.now();
    if(S&&S.flag)S.flag.cleanExit=false; /* 每次普通保存均为「进行中」状态 */
    if(S)S.version=2;
    const data=JSON.stringify(S);
    if(data.length>500000)console.warn('存档体积过大（'+Math.floor(data.length/1024)+'KB），建议清理背包与图鉴记忆');
    try{const prev=localStorage.getItem(k);if(prev)localStorage.setItem(k+'_bak',prev)}catch(e){}
    localStorage.setItem(k,data);
    localStorage.setItem('xiantu_save_meta',JSON.stringify({last:slot===undefined?SLOT:slot,v:2}));
  }catch(e){}
}
function applyOfflineGain(){
  try{
    if(!S||!S.flag)return;
    const now=Date.now();
    const last=S.flag.lastVisit||now;
    const hours=Math.min(12,Math.max(0,(now-last)/3600000));
    if(hours<1)return;
    const offMult=0.4*(1+(typeof trustTier==='function'?trustTier().offline:0));
    const g=Math.floor((8+S.root/6)*cultMult(S)*offMult*hours*rand(8,12)/10);
    const bonus=hours>=2?Math.floor(15+bigStage(S.realm)*8):0;
    if(g>0)S.cult+=g;
    if(bonus>0)S.stones+=bonus;
    if(g>0)log('<p class="good">⏳ 你回归仙途：闭关约 <b>'+(Math.floor(hours*10)/10)+' 小时</b>，收获修为 <b>+'+g+'</b>'+(bonus>0?'，灵石 <b>+'+bonus+'</b>':'')+'。</p>');
    openPanel('⏳ 回归仙途',
      '<p>山中方数日，世上已千年。你不在的这些时日，洞府灵气未曾停歇。</p>'+
      '<div class="item-card"><div class="nm">⏳ 离线 '+(Math.floor(hours*10)/10)+' 小时</div>'+
      '<div class="ds">灵气自行运转，按在线 40% 效率结算（上限 12 小时）<br>修为 +'+g+(bonus>0?'<br>回归赠礼 · 灵石 +'+bonus+'（离线满 2 小时可得）':'')+'</div></div>'+
      '<p style="font-size:12.5px;color:#6f7a94">若已跨过新的一天，左侧「每日任务」也已刷新，去看看吧。</p>');
  }catch(e){}
}
/* 2H 轮回点：跨存档全局账户（独立于 3 个档位） */
const LOOP_KEY='xiantu_loop';
function loopLoad(){
  try{return JSON.parse(localStorage.getItem(LOOP_KEY))||{points:0,value:0,history:[],art:null}}catch(e){return {points:0,value:0,history:[],art:null}}
}
function loopSave(o){
  try{localStorage.setItem(LOOP_KEY,JSON.stringify(o))}catch(e){}
}
function loopPoints(){return loopLoad().points}
function loopValue(){return loopLoad().value}
function load(){
  try{
    let raw=localStorage.getItem(SLOT_KEYS[SLOT]);
    if(!raw){
      const old=localStorage.getItem('xiantu_save_v1');
      if(old){localStorage.setItem(SLOT_KEYS[0],old);localStorage.removeItem('xiantu_save_v1');SLOT=0;raw=old}
    }
    if(!raw)return null;
    let s=null;
    try{s=JSON.parse(raw)}catch(e){s=null}
    let fromBak=false;
    if(!s||typeof s!=='object'||!s.name){
      const bak=localStorage.getItem(SLOT_KEYS[SLOT]+'_bak');
      if(bak){try{s=JSON.parse(bak);fromBak=true}catch(e){s=null}}
    }
    if(!s||typeof s!=='object'||!s.name)return null;
    if(fromBak)console.warn('仙途：主存档损坏，已自动从备份恢复');
    if(!s.quests)s.quests={cult:false,explore:false,realm3:false,zhuji:false};
    if(!s.flag)s.flag={};
    if(!s.rootElem)s.rootElem=pickRootElem();
    if(!s.injuries)s.injuries=[];
    if(!s.weaponMaster)s.weaponMaster={};
    if(!s.flag.exHate)s.flag.exHate=null;
    if(!s.memories)s.memories=[];
    if(!s.demonMarks)s.demonMarks=[];
    if(!s.temp)s.temp={break:0};
    if(s.merit===undefined)s.merit=0;
    if(s.karma===undefined)s.karma=0;
    if(!s.fame)s.fame={zheng:0,mo:0,san:0};
    if(!s.pet)s.pet=null;
    if(!s.titles)s.titles=[];
    if(!s.seenE)s.seenE={};
    if(!s.seenI)s.seenI={};
    if(!s.wins)s.wins=0;
    if(!s.heartTrains)s.heartTrains=0;
    if(s.cultStreak===undefined)s.cultStreak=0;
    if(s.lifeBonus===undefined)s.lifeBonus=0;
    if(!s.endings)s.endings=[];
    if(!s.deaths)s.deaths=0;
    if(!s.rebirths)s.rebirths=0;
    if(!s.logCount)s.logCount=0;
    if(s.dungeon===undefined)s.dungeon=null;
    if(s.eventChain===undefined)s.eventChain=null;
    if(s.mood===undefined)s.mood=60;
    if(!s.set)s.set={fx:'med',autoTrib:false,autoCraft:false,audio:true,shake:true};
    if(s.gender===undefined)s.gender='男';
    if(s.contribVal===undefined)s.contribVal=0;
    if(s.sectStage===undefined)s.sectStage=s.sect?'outer':null;
    if(s.sectNpcs===undefined)s.sectNpcs=[];
    if(s.companion===undefined)s.companion=null;
    if(!s.affairs)s.affairs=[];
    if(!s.disciples)s.disciples=[];
    if(!s.children)s.children=[];
    if(s.affection===undefined)s.affection=0;
    if(s.sectSalary===undefined)s.sectSalary=0;
    if(s.npcs)for(const n of s.npcs){
      if(n.gender===undefined)n.gender=(n.role&&/[女狐乐医]/.test(n.role))?'女':'男';
      if(n.stage===undefined)n.stage=n.realm||0;
      if(n.realm===undefined)n.realm=n.stage;
      if(n.persona===undefined)n.persona='温和';
      if(n.taste===undefined)n.taste='灵';
      if(n.chat===undefined)n.chat=[];
      if(n.growth===undefined)n.growth=0;
      if(n.talks===undefined)n.talks=0;
      if(n.gifts===undefined)n.gifts=0;
      if(n.mood===undefined)n.mood=60;
      if(n.met===undefined)n.met=true;
      if(!n.cd)n.cd={talk:0,duel:0,gift:0};
    }
    if(s.daoPartner){
      if(s.daoPartner.gender===undefined)s.daoPartner.gender=(s.daoPartner.name==='王家公子'?'男':'女');
      if(s.daoPartner.affinity===undefined)s.daoPartner.affinity=60;
      if(s.daoPartner.stage===undefined)s.daoPartner.stage=s.daoPartner.realm||0;
      if(s.daoPartner.cd===undefined)s.daoPartner.cd={};
      if(s.daoPartner.memories===undefined)s.daoPartner.memories=[];
    }
    if(s.master&&s.master.gender===undefined)s.master.gender='男';
    /* 旧档境界迁移：v1 大境界 → 新 42 档体系（大境前期） */
    if((s.version||1)<2&&s.realm>8){
      const m={9:9,10:13,11:17,12:21,13:25,14:29,15:33,16:37,17:41};
      if(m[s.realm]!==undefined)s.realm=m[s.realm];
    }
    /* 宗门职位迁移：按旧贡献/境界推算已到手的职阶 */
    if(s.rank===undefined){
      let r=0;
      if(s.sect)for(let i=0;i<SECT_RANKS.length;i++){const R=SECT_RANKS[i];if(s.contrib>=R.point&&bigStage(s.realm)>=R.minStage)r=i;}
      s.rank=r;
    }
    s.version=2;
    return s;
  }catch(e){return null}
}
function panelSave(){
  const slots=SLOT_KEYS.map((k,i)=>{
    let info='空存档位';
    try{
      const raw=localStorage.getItem(k);
      if(raw){const s=JSON.parse(raw);info=esc(s.name||'无名')+' · '+REALMS[(s.realm||0)]+' · '+Math.floor(s.years||0)+' 载'}
    }catch(e){info='（存档损坏）'}
    return '<div class="item-card"><div class="nm">存档 '+(i+1)+'：'+info+(SLOT===i?' <span class="tag">当前</span>':'')+'</div><div style="margin-top:8px;display:flex;gap:6px"><button class="small primary" onclick="saveToSlot('+i+')">存入</button><button class="small" onclick="loadFromSlot('+i+')">读取</button></div></div>';
  }).join('');
  openPanel('💾 存档','<p>共 3 个存档位。游戏中的操作会自动存入「当前」存档位；每次保存都会保留一份备份，主存档意外损坏时自动恢复。</p>'+slots+
    '<h4>📤 导出 / 导入</h4>'+
    '<p style="font-size:12.5px;color:#a99a72">可将当前角色导出为文本文件，方便迁移设备或分享。</p>'+
    '<div class="row"><button class="small primary" onclick="exportSave()">📤 导出当前角色</button><button class="small" onclick="document.getElementById(\'importFile\').click()">📥 导入存档</button></div>'+
    '<input type="file" id="importFile" accept=".json,application/json" style="display:none" onchange="importSave()">'+
    '<h4>🔗 存档分享码（2S）</h4>'+
    '<p style="font-size:12.5px;color:#a99a72">将当前档压缩为一段分享码，复制发给朋友即可导入。</p>'+
    '<div class="row"><button class="small primary" onclick="shareCode()">🔗 生成分享码</button><button class="small" onclick="pasteCode()">📥 粘贴导入</button></div>');
}
function shareCode(){
  try{
    const code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    if(navigator&&navigator.clipboard&&navigator.clipboard.writeText){try{navigator.clipboard.writeText(code)}catch(e){}}
    log('<p class="sys">🔗 分享码已生成（前 18 位：<b>'+code.slice(0,18)+'…</b>），已复制到剪贴板。朋友在「存档 → 粘贴导入」粘贴整段即可。</p>');
    toast('分享码已复制');
  }catch(e){toast('生成失败');}
}
function pasteCode(){
  const code=window.prompt?window.prompt('粘贴好友的存档分享码：'):null;
  if(!code)return;
  try{
    const s=JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
    if(!s||!s.name||!s.attrs){toast('分享码无效');return}
    importRaw(s);
    toast('📥 已导入好友存档');
  }catch(e){toast('分享码无效');}
}
function importRaw(s){
  try{
    localStorage.setItem(SLOT_KEYS[0],JSON.stringify(s));
    loadFromSlot(0);
    return true;
  }catch(e){return false}
}
/* 16.2 干净退出标记：正常离开页面时写入，异常退出时启动可检测 */
function markCleanExit(){
  if(!S)return;
  S.flag.cleanExit=true;
  save();
}
function exportSave(){
  if(!S){toast('尚无角色');return}
  try{
    const data=JSON.stringify(S,null,2);
    const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=esc(S.name)+'_仙途存档.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    toast('📤 存档已导出');
  }catch(e){toast('导出失败');}
}
function importSave(){
  const inp=$('importFile');
  if(!inp||!inp.files||!inp.files[0])return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const s=JSON.parse(rd.result);
      if(!s||!s.name||s.attrs===undefined)throw new Error('bad');
      localStorage.setItem(SLOT_KEYS[SLOT],rd.result);
      S=load();
      toast('📥 存档已导入');
      closePanel();renderAll();
    }catch(e){toast('存档无效');}
  };
  rd.readAsText(inp.files[0]);
}
function saveToSlot(i){
  SLOT=i;save();toast('已存入存档 '+(i+1));panelSave();renderAll();
}
/* 自动存档：固定写入第 1 格，防止误退出丢失进度 */
function autoSaveNow(){
  if(!S)return;
  SLOT=0;
  save();
  toast('💾 已自动存档（第 1 格）');
}
function loadFromSlot(i){
  SLOT=i;
  const s=load();
  if(!s){toast('该存档位为空');return}
  S=s;
  $('screen-game').style.display='flex';
  scene('重返仙途');
  log('<p>你于洞府中醒来，前尘旧事历历在目，仙途未竟，道心依旧。</p>');
  applyOfflineGain();
  closePanel();renderAll();
}
