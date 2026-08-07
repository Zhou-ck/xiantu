/* ======================================================
  仙途 · 前端视觉深化 v39：分层转场
  水墨暗金 · 屏幕切换（墨晕卷帘）/ 弹层入场 / 灵尘云雾
  全部受 FX.level 控制：低档或无真实 DOM 时同步直切、零动画
====================================================== */
'use strict';

const T={
  /* 入场动画：加 fx-in class，动画结束后自动移除 */
  reveal(el){
    if(!el||!el.classList)return;
    if(!fxOn()){el.classList.remove('fx-in');return}
    el.classList.remove('fx-in');
    try{void el.offsetWidth}catch(e){}
    el.classList.add('fx-in');
    const done=()=>{
      el.classList.remove('fx-in');
      try{el.removeEventListener('animationend',done)}catch(e){}
    };
    try{el.addEventListener('animationend',done)}catch(e){}
    setTimeout(done,1000);
  },
  /* 退场动画：先播 fx-out，结束后回调（低档直接回调） */
  conceal(el,cb){
    if(!el){if(cb)cb();return}
    if(!fxOn()){if(cb)cb();return}
    el.classList.add('fx-out');
    const done=()=>{
      el.classList.remove('fx-out');
      if(cb)cb();
    };
    try{el.addEventListener('animationend',done)}catch(e){}
    setTimeout(done,480);
  },
  /* 屏幕切换：墨晕卷帘 → 交换 display → 目标屏淡入；低档同步直切 */
  switchScreen(fromId,toId,opts){
    opts=opts||{};
    const from=typeof fromId==='string'?$(fromId):fromId;
    const to=typeof toId==='string'?$(toId):toId;
    const after=opts.after;
    const swap=()=>{
      if(from)from.style.display='none';
      if(to){to.style.display='flex';T.reveal(to)}
      if(after){try{after()}catch(e){}}
    };
    if(!fxOn()){swap();return}
    /* v81 触屏切屏不再走全屏墨晕卷帘，避免 GPU 整层合成闪黄 */
    if(typeof fxMobile==='function'&&fxMobile()){swap();return}
    const veil=T._veil();
    if(!veil){swap();return}
    veil.classList.add('veil-in');
    setTimeout(()=>{
      veil.classList.remove('veil-in');
      swap();
      veil.classList.add('veil-out');
      setTimeout(()=>veil.classList.remove('veil-out'),560);
    },340);
  },
  /* 灵尘 / 云雾氛围层：仅真实浏览器且非低档时创建 */
  initAmbient(){
    if(!fxOn())return;
    if(typeof fxMobile==='function'&&fxMobile())return; /* v60 手机端不创建金色雾/尘常驻层 */
    try{
      if(document.getElementById('ink-mist'))return;
      const host=document.body||document.documentElement;
      if(!host||!host.appendChild)return;
      const mist=document.createElement('div');
      mist.id='ink-mist';
      host.appendChild(mist);
      const dust=document.createElement('div');
      dust.id='dust';
      const n=FX.level==='high'?16:8;
      for(let i=0;i<n;i++){
        const p=document.createElement('i');
        p.style.left=(Math.random()*92+4).toFixed(1)+'%';
        p.style.top=(Math.random()*88+4).toFixed(1)+'%';
        p.style.animationDuration=(9+Math.random()*16).toFixed(1)+'s';
        p.style.animationDelay=(-Math.random()*20).toFixed(1)+'s';
        p.style.setProperty('--dx',((Math.random()*2-1)*46).toFixed(0)+'px');
        p.style.setProperty('--dy',((Math.random()*2-1)*70).toFixed(0)+'px');
        dust.appendChild(p);
      }
      host.appendChild(dust);
    }catch(e){}
  },
  _veil(){
    if(T._veilEl)return T._veilEl;
    try{
      const el=document.getElementById('veil');
      if(el&&el.style){T._veilEl=el;return el}
    }catch(e){}
    return null;
  },
  _veilEl:null
};
