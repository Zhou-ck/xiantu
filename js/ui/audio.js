/* ======================================================
  仙途 · Web Audio 合成音效（3F，P2 轻量版）
  无外部音频文件、无版权负担；环境不支持时静默降级
====================================================== */
'use strict';

let _audioCtx=null;
function sfx(kind){
  try{
    if(S&&S.set&&S.set.audio===false)return;
    if(typeof AudioContext==='undefined'&&typeof webkitAudioContext==='undefined')return;
    if(!_audioCtx)_audioCtx=new (AudioContext||webkitAudioContext)();
    if(_audioCtx.state==='suspended')_audioCtx.resume();
    const c=_audioCtx;
    const t=c.currentTime;
    const o=c.createOscillator();
    const g=c.createGain();
    const map={
      click:[520,0.06,0.25],
      hit:[180,0.12,0.35],
      crit:[880,0.10,0.4],
      thunder:[90,0.5,0.6],
      levelup:[660,0.28,0.45],
      fail:[140,0.4,0.5],
      heal:[440,0.25,0.3],
    }[kind]||[440,0.1,0.3];
    o.type=kind==='thunder'?'sawtooth':'sine';
    o.frequency.setValueAtTime(map[0],t);
    if(kind==='levelup'){o.frequency.exponentialRampToValueAtTime(map[0]*1.5,t+0.25)}
    g.gain.setValueAtTime(map[2],t);
    g.gain.exponentialRampToValueAtTime(0.001,t+map[1]);
    o.connect(g);g.connect(c.destination);
    o.start(t);o.stop(t+map[1]+0.05);
  }catch(e){}
}
