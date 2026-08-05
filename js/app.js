/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 初始化 ================
====================================================== */
'use strict';
/* ================= 初始化 ================= */
function init(){
  fxInit();
  if(typeof gateInit==='function')gateInit();
  applyFont();
  $('btnNew').onclick=()=>{$('screen-title').style.display='none';$('screen-create').style.display='flex';rerollPreview()};
  $('btnLoop').onclick=()=>{refreshLoopBar();loopShop()};
  $('btnRandName').onclick=()=>{$('nameInput').value=randomName(GENDER_MODE)};
  $('btnReroll').onclick=rerollPreview;
  $('btnBegin').onclick=beginGame;
  $('btnSave').onclick=panelSave;
  $('btnHelp').onclick=openHelp;
  $('btnDaily').onclick=()=>{if(!S){toast('尚未踏入仙途');return}closePanel();panelDaily()};
  $('btnSide').onclick=()=>{$('side').classList.toggle('show');$('scrim').classList.toggle('show')};
  $('scrim').onclick=()=>{$('side').classList.remove('show');$('scrim').classList.remove('show')};
  $('battleContinue').onclick=()=>{$('battle').style.display='none';if(window._battleResolve){window._battleResolve();window._battleResolve=null}};
  $('btnTome').onclick=openTome;
  $('guidePrev').onclick=()=>{if(GUIDE_IDX>0){GUIDE_IDX--;renderGuide()}};
  $('guideNext').onclick=()=>{if(GUIDE_IDX<GUIDE_STEPS.length-1){GUIDE_IDX++;renderGuide()}else{closeGuide()}};
  $('btnFree').onclick=()=>{freeAct($('freeInput').value);$('freeInput').value=''};
  $('freeInput').addEventListener('keydown',e=>{if(e.key==='Enter'){freeAct($('freeInput').value);$('freeInput').value=''}});
  try{const meta=JSON.parse(localStorage.getItem('xiantu_save_meta'));if(meta&&meta.last!=null)SLOT=meta.last}catch(e){}
  const s=load();
  if(s){$('btnLoad').style.display='inline-block';$('btnLoad').onclick=()=>{S=s;$('screen-title').style.display='none';$('screen-game').style.display='flex';setSceneImg('title');scene('重返仙途');log('<p>你于洞府中醒来，前尘旧事历历在目。仙途未竟，道心依旧。</p>');applyOfflineGain();renderAll()}}
  if(location.hash==='#create'){$('screen-title').style.display='none';$('screen-create').style.display='flex';rerollPreviewG('男')}
  /* 每 60 秒自动存档至第 1 格；切后台/退出前也即时保存 */
  if(typeof setInterval==='function')setInterval(function(){autoSaveNow()},60000);
  if(typeof document!=='undefined'&&document.addEventListener){
    document.addEventListener('visibilitychange',function(){if(document.hidden)markCleanExit()});
    window.addEventListener('pagehide',function(){markCleanExit()});
  }
  /* 崩溃恢复提示：上次未正常退出则提示从最近存档恢复 */
  if(s&&s.flag&&s.flag.cleanExit===false){
    setTimeout(function(){toast('⚠️ 检测到上次异常退出，进度已从最近存档恢复')},1200);
  }
}
if(typeof window!=='undefined'&&window.document){window.addEventListener('DOMContentLoaded',init)}
