/* ======================================================
  仙途 · 奖励呈现流水线（3E）
  先入账、再展示；队列合并、来源标签、不重叠不阻塞
====================================================== */
'use strict';

let _rewardQueue=[];
function rewardPush(items){
  if(!items||!items.length)return;
  for(const it of items){
    const prev=_rewardQueue.find(x=>x.name===it.name&&x.src===it.src);
    if(prev){prev.count=(prev.count||1)+1;prev.rare=prev.rare||it.rare}
    else _rewardQueue.push({name:it.name,count:1,src:it.src||'获得',rare:!!it.rare});
  }
  if(_rewardQueue.length>=3)rewardFlush();
}
function rewardFlush(){
  if(!_rewardQueue.length)return;
  const items=_rewardQueue;_rewardQueue=[];
  const rare=items.filter(x=>x.rare);
  const normal=items.filter(x=>!x.rare);
  let html='';
  if(rare.length)html+='<span class="tag" style="color:#ffd76a;border-color:#8a6a2a">✨ '+rare.map(x=>esc(x.name)+(x.count>1?' ×'+x.count:'')).join('、')+'</span>';
  if(normal.length)html+='<span class="tag" style="color:#a8d5a8">'+normal.map(x=>esc(x.name)+(x.count>1?' ×'+x.count:'')).join('、')+'</span>';
  if(!html)return;
  log('<p class="sys">🎁 获得：'+html+'</p>');
}
/* 大数可读缩写：12345→1.2万，123456789→1.2亿 */
function fmtNum(n){
  if(n===null||n===undefined)return '0';
  const v=Math.abs(n);
  if(v>=1e8)return (n/1e8).toFixed(1).replace(/\.0$/,'')+'亿';
  if(v>=1e4)return (n/1e4).toFixed(1).replace(/\.0$/,'')+'万';
  return String(n);
}
