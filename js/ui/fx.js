/* ======================================================
  仙途 · 特效反馈层（3A/3B）
  屏幕震动 / 命中停顿 / 滤镜闪光 / 浮动文本 / 粒子爆发
  全部函数带环境守卫：无 rAF/DOM 时安全降级为 no-op
====================================================== */
'use strict';

const FX={level:'med'};
function fxLevel(){return FX.level}
function fxOn(){
  if(FX.level==='low')return false;
  /* 无真实 DOM（测试桩/低配）视为关闭演出微操 */
  try{return typeof document!=='undefined'&&!!document.body&&!!document.documentElement}catch(e){return false}
}
function fxSetLevel(l){
  FX.level=['high','med','low'].indexOf(l)>=0?l:'med';
  try{localStorage.setItem('xt_fx',FX.level)}catch(e){}
  const root=typeof document!=='undefined'?document.documentElement:null;
  if(root)root.style.setProperty('--fx-level',FX.level);
  /* v39：同步 html.fx-low class，供 CSS 整体关闭动画/粒子层 */
  if(root&&root.classList)root.classList.toggle('fx-low',FX.level==='low');
}
function fxInit(){
  let l='med';
  try{l=localStorage.getItem('xt_fx')||'med'}catch(e){}
  /* 低配/省电/系统减弱动效：自动降级 */
  try{
    if(navigator&&(navigator.hardwareConcurrency||8)<=4)l='low';
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)l='low';
  }catch(e){}
  fxSetLevel(l);
}
function fxShake(intensity,duration){
  if(FX.level==='low')return;
  if(typeof requestAnimationFrame!=='function'||typeof document==='undefined')return;
  if(intensity>=3){if(typeof sfx==='function')sfx('thunder')}
  else if(intensity>=2){if(typeof sfx==='function')sfx('hit')}
  const el=document.getElementById('screen-game')||document.getElementById('app')||document.body;
  if(!el||!el.style)return;
  const amp0=[0,3,7,14][intensity]||3;
  const amp=fxMobile()?Math.max(1,Math.round(amp0*0.5)):amp0;
  const dur=duration||[0,150,300,520][intensity]||200;
  const t0=Date.now();
  function frame(){
    const p=(Date.now()-t0)/dur;
    if(p>=1){el.style.transform='';return}
    const decay=Math.exp(-3*p);
    const dx=Math.sin(p*38)*amp*decay;
    const dy=Math.cos(p*27)*amp*decay*0.7;
    el.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
/* 手机端检测：触屏 + 窄屏。整屏金色闪光在手机上观感最重，做收敛 */
let _fxMobile=null;
function fxMobile(){
  if(_fxMobile!==null)return _fxMobile;
  try{
    _fxMobile=!!(typeof navigator!=='undefined'&&navigator&&
      ((navigator.maxTouchPoints||0)>0||'ontouchstart'in navigator)&&
      (((typeof window!=='undefined'&&window.innerWidth)||(typeof screen!=='undefined'&&screen.width)||768)<768));
  }catch(e){_fxMobile=false}
  return _fxMobile;
}
let _fxLastBurst=0;
/* 命中停顿：设置全局冻结标记，战斗/演出读取 fxPaused() */
let _hitstopUntil=0;
function fxHitstop(ms){
  if(FX.level==='low')return;
  if(typeof Date!=='function')return;
  if(typeof sfx==='function')sfx('crit');
  if(fxMobile())return; /* 手机端不冻结，避免整屏定格 + 停顿放大闪光观感 */
  _hitstopUntil=Date.now()+(ms||120);
  fxShake(1,100);
}
function fxPaused(){return _hitstopUntil>Date.now()}
function fxFlash(color,ms){
  if(FX.level==='low'||typeof document==='undefined')return;
  if(fxMobile())return; /* v60 手机端不创建整屏闪光层（点击闪黄主因之一，保留浮动文字提示） */
  let el=document.getElementById('fxFlash');
  if(!el){
    el=document.createElement('div');
    el.id='fxFlash';
    el.style.cssText='position:fixed;inset:0;pointer-events:none;opacity:0;z-index:9999;transition:opacity '+(fxMobile()?'0.12s':'0.18s')+' ease-out;';
    (document.body||document.documentElement).appendChild(el);
  }
  el.style.background=color||'#fff';
  el.style.opacity=fxMobile()?'0.32':'0.65';
  setTimeout(()=>{el.style.opacity='0'},fxMobile()?12:18);
  setTimeout(()=>{el.style.background='transparent'},(ms||200));
}
function fxFloatText(txt,color,big){
  if(FX.level==='low'||typeof document==='undefined'||!document.body||!document.documentElement)return;
  const el=document.createElement('div');
  el.className='fx-float'+(big?' fx-big':'');
  el.textContent=txt;
  if(color)el.style.color=color;
  const x=(window.innerWidth||document.documentElement.clientWidth||360)/2+(Math.random()*80-40);
  const y=(window.innerHeight||document.documentElement.clientHeight||600)/2.5;
  el.style.left=x+'px';el.style.top=y+'px';
  if(fxMobile()){el.style.fontSize=big?'17px':'13px';el.style.textShadow='none'}
  (document.body||document.documentElement).appendChild(el);
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},1100);
}
function fxBurst(count,color){
  if(FX.level==='low'||typeof document==='undefined'||!document.body||!document.documentElement)return;
  if(typeof Date==='function'){
    const now=Date.now();
    if(now-_fxLastBurst<400)return; /* 节流：本游戏暴击率高，避免每回合连闪 */
    _fxLastBurst=now;
  }
  if(typeof sfx==='function')sfx('levelup');
  let n=count||12;
  if(fxMobile())n=Math.min(n,3); /* v60 手机端粒子 ≤3，且用偏暗金避免整屏金色爆发 */
  const useColor=fxMobile()?'#d8b558':(color||'#ffd76a');
  const cx=(window.innerWidth||document.documentElement.clientWidth||360)/2;
  const cy=(window.innerHeight||document.documentElement.clientHeight||600)/3;
  for(let i=0;i<n;i++){
    const el=document.createElement('div');
    el.className='fx-dot';
    el.style.background=useColor;
    const a=Math.random()*Math.PI*2;
    const d=40+Math.random()*90;
    el.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');
    el.style.setProperty('--dy',(Math.sin(a)*d).toFixed(0)+'px');
    el.style.left=cx+'px';el.style.top=cy+'px';
    (document.body||document.documentElement).appendChild(el);
    setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},700);
  }
}
/* 3D 打字机：逐字显示，点击跳过整段 */
function fxTypewriter(el,text,speed,onDone){
  if(!el)return;
  let i=0;
  const sp=speed||18;
  function step(){
    if(i>=text.length){if(onDone)onDone();return}
    i+=2;
    el.innerHTML=text.slice(0,i);
    if(typeof setTimeout==='function')setTimeout(step,sp);
    else if(onDone)onDone();
  }
  step();
}
/* 3F 触感：安卓震动（可关） */
function fxVibrate(pattern){
  try{
    if(navigator&&navigator.vibrate&&(!S||!S.set||S.set.shake!==false))navigator.vibrate(pattern||[30,40,30]);
  }catch(e){}
}
