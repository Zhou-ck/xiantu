/* ======================================================
  仙途 · App 壳适配（Capacitor / 返回键 / 更新检查）
  纯增量：非原生环境全部安全降级，不影响网页版。
====================================================== */
'use strict';
/* 游戏版本号：与 sw.js 的 CACHE 版本保持同步（发布前审计核对） */
const GAME_VERSION='98';
function isNativeApp(){
  try{return !!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}catch(e){return false}
}
function isStandalone(){
  try{return !!(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)}catch(e){return false}
}
function initAppShell(){
  try{
    if(isNativeApp()||isStandalone())document.body.classList.add('app-mode');
    if(isNativeApp()&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App){
      Capacitor.Plugins.App.addListener('backButton',()=>{
        try{
          const panel=$('panel');
          if(panel&&panel.style.display==='flex'){closePanel();return}
          const battle=$('battle');
          if(battle&&battle.style.display==='flex'){battle.style.display='none';if(window._battleResolve){window._battleResolve();window._battleResolve=null}return}
          const cult=$('cultivate');
          if(cult&&cult.style.display==='flex'){if(typeof cultAbort==='function')cultAbort();return}
          const br=$('breakthrough');
          if(br&&br.style.display==='flex'){if(typeof breakSkip==='function')breakSkip();return}
          if(Capacitor.Plugins.App.minimizeApp)Capacitor.Plugins.App.minimizeApp();
        }catch(e){}
      });
    }
  }catch(e){}
}
function checkGameUpdate(){
  try{
    if(typeof navigator==='undefined'||!('serviceWorker' in navigator)){toast('当前环境不支持后台更新');return}
    navigator.serviceWorker.getRegistration().then(r=>{
      if(!r){toast('尚未注册离线缓存');return}
      r.update().then(()=>toast(r.waiting?'✨ 新版本已就绪，刷新后生效':'✅ 已是最新版本'));
    }).catch(()=>toast('检查更新失败'));
  }catch(e){toast('检查更新失败')}
}
if(typeof window!=='undefined'&&window.document){window.addEventListener('DOMContentLoaded',initAppShell)}
