/* ======================================================
  仙途 · 测试邀请码门禁（仅限熟人测试）
  修改下面的 INVITE_CODE 即可换码；留空 '' 则完全开放。
  注意：这是「熟人门禁」，防君子不防黑客——真要绝对安全请用
  Cloudflare Access 邮箱白名单（见部署指南.md）。
====================================================== */
'use strict';
const INVITE_CODE='xiantu2026';
const GATE_KEY='xt_unlocked';
function gateEnabled(){return !!INVITE_CODE}
function gateUnlocked(){try{return localStorage.getItem(GATE_KEY)==='1'}catch(e){return false}}
function gateUnlock(){
  try{localStorage.setItem(GATE_KEY,'1')}catch(e){}
  const g=document.getElementById('gate');
  if(g)g.style.display='none';
}
function gateTry(){
  const inp=document.getElementById('gateInput');
  const code=(inp&&inp.value||'').trim();
  if(code===INVITE_CODE){gateUnlock();toast('欢迎道友，仙途已开');return}
  toast('邀请码不对哦');
  fxShake(2,200);
  if(inp){inp.value='';if(typeof inp.focus==='function')inp.focus()}
}
function gateInit(){
  const g=document.getElementById('gate');
  if(!g)return;
  if(!gateEnabled()||gateUnlocked()){g.style.display='none';return}
  g.style.display='flex';
  const b=document.getElementById('gateBtn');
  const inp=document.getElementById('gateInput');
  if(b)b.onclick=gateTry;
  if(inp){
    inp.addEventListener('keydown',e=>{if(e.key==='Enter')gateTry()});
    setTimeout(()=>{if(typeof inp.focus==='function')inp.focus()},300);
  }
}
