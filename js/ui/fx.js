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
  const amp=[0,3,7,14][intensity]||3;
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
/* 命中停顿：设置全局冻结标记，战斗/演出读取 fxPaused() */
let _hitstopUntil=0;
function fxHitstop(ms){
  if(FX.level==='low')return;
  if(typeof Date!=='function')return;
  if(typeof sfx==='function')sfx('crit');
  _hitstopUntil=Date.now()+(ms||120);
  fxShake(1,100);
}
function fxPaused(){return _hitstopUntil>Date.now()}
function fxFlash(color,ms){
  if(FX.level==='low'||typeof document==='undefined')return;
  let el=document.getElementById('fxFlash');
  if(!el){
    el=document.createElement('div');
    el.id='fxFlash';
    el.style.cssText='position:fixed;inset:0;pointer-events:none;opacity:0;z-index:9999;transition:opacity .18s ease-out;';
    (document.body||document.documentElement).appendChild(el);
  }
  el.style.background=color||'#fff';
  el.style.opacity='0.65';
  setTimeout(()=>{el.style.opacity='0'},18);
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
  (document.body||document.documentElement).appendChild(el);
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},1100);
}
function fxBurst(count,color){
  if(FX.level==='low'||typeof document==='undefined'||!document.body||!document.documentElement)return;
  if(typeof sfx==='function')sfx('levelup');
  const n=count||12;
  const cx=(window.innerWidth||document.documentElement.clientWidth||360)/2;
  const cy=(window.innerHeight||document.documentElement.clientHeight||600)/3;
  for(let i=0;i<n;i++){
    const el=document.createElement('div');
    el.className='fx-dot';
    el.style.background=color||'#ffd76a';
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
