/* ======================================================
  仙途 · AI 辅助叙事桥（2L，可插拔）
  OpenAI 兼容接口：玩家自填基址 + Key + 模型（仅存本地）
  无 Key / 网络失败 / 非法输出 → 自动回退本地规则版
  AI 只影响叙事文本，数值一律走现有判定函数
====================================================== */
'use strict';

const AI={base:'',key:'',model:''};
function aiLoad(){
  try{
    const raw=localStorage.getItem('xt_ai');
    if(raw){const o=JSON.parse(raw);AI.base=o.base||'';AI.key=o.key||'';AI.model=o.model||''}
  }catch(e){}
}
function aiSave(){
  try{localStorage.setItem('xt_ai',JSON.stringify(AI))}catch(e){}
}
function aiClear(){AI.base='';AI.key='';AI.model='';aiSave()}
function aiEnabled(){return !!(AI.base&&AI.key&&AI.model)}
function aiCall(messages,maxTokens){
  if(!aiEnabled()||typeof fetch!=='function'||typeof Promise!=='function')return Promise.resolve(null);
  const url=String(AI.base).replace(/\/+$/,'')+'/chat/completions';
  const body={model:AI.model,messages:messages,max_tokens:maxTokens||200,temperature:0.7};
  return new Promise(resolve=>{
    const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
    const timer=setTimeout(()=>{if(ctrl)ctrl.abort()},8000);
    fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+AI.key},body:JSON.stringify(body),signal:ctrl?ctrl.signal:undefined})
      .then(r=>r.json())
      .then(d=>{clearTimeout(timer);const txt=d&&d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content;resolve(txt?String(txt).trim():null)})
      .catch(()=>{clearTimeout(timer);resolve(null)});
  });
}
function aiAsk(prompt){
  return aiCall([
    {role:'system',content:'你是《仙途》文字修仙游戏的叙事助手。玩家输入自由行动指令时，请把它归类为游戏内意图（修炼/探索/坊市/宗门/人际/副业/突破/休整/双修/聊天/赠礼），并用 1-2 句古典风格情节润色。只输出：意图关键词一行 + 情节一行。不要改动任何数值。'},
    {role:'user',content:prompt},
  ],160);
}
function aiNpcChat(n){
  return aiCall([
    {role:'system',content:'你是《仙途》修仙游戏中的NPC「'+n.name+'」（'+n.role+'），性格：'+(npcPersona(n)?npcPersona(n).name:'未知')+'。用 2-3 句符合人设的话回应修士的搭讪，古典风格，不涉数值。'},
    {role:'user',content:'修士向你问好。'},
  ],160);
}
