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

/* ======================================================
  v46 AI 扩写流水线（本地模式）
  生成 → schema 校验 → 人工审核入库（并入 DATA.events）
  无 AI / 网络失败 / 非法输出 → 本地模板兜底，保证管线离线可用
====================================================== */
function aiProduceContent(kind,prompt){
  return aiCall([
    {role:'system',content:'你是《仙途》文字修仙游戏的内容策划。请只输出一个 JSON 对象（不要 markdown 代码块），作为一条社交事件条目。字段：{id,n,type,t,opts:[{txt,cls?}]}。type 仅限 visit/invite/chat；opts 至少 1 项；正文 t 为 30-60 字古典仙侠文风；不写数值、不写物品奖励、不写超出字段的内容。'},
    {role:'user',content:'类型：'+kind+'\n要求：'+prompt},
  ],400);
}
function parseAiEvent(txt){
  if(!txt)return {ok:false,err:'AI 无输出'};
  try{
    const m=String(txt).match(/\{[\s\S]*\}/);
    const obj=JSON.parse(m?m[0]:String(txt));
    return validateAiEvent(obj);
  }catch(e){return {ok:false,err:'JSON 解析失败：'+e.message}}
}
function validateAiEvent(obj){
  const errs=[];
  if(!obj||typeof obj!=='object')return {ok:false,err:'不是对象'};
  if(typeof obj.id!=='string'||!obj.id)errs.push('缺 id');
  if(typeof obj.n!=='string'||!obj.n)errs.push('缺 n');
  if(['visit','invite','chat'].indexOf(obj.type)<0)errs.push('type 非法');
  if(!Array.isArray(obj.opts)||!obj.opts.length)errs.push('opts 为空');
  return errs.length?{ok:false,err:errs.join('；')}:{ok:true,entry:obj};
}
function localEventDraft(kind,prompt){
  const pool=[
    '一位故人捎来口信，约你三日后于山亭相见。',
    '云游道人路过山门，讲了一则上古轶闻，听得你心驰神往。',
    '茶棚老板娘提起近期坊市异动，言语间似有所指。',
    '林间小道上，一名采药女与你同行一程，聊起深山里那株会发光的草。',
  ];
  const t=prompt||pick(pool);
  const type=kind==='invite'?'invite':kind==='visit'?'visit':'chat';
  return {ok:true,entry:{id:'draft_'+Math.floor(Math.random()*1e8).toString(36),n:'本地草稿·'+({visit:'来访',invite:'约见',chat:'闲谈'}[type]||'闲谈'),type:type,t:t,opts:[{txt:'欣然应约',cls:'primary'},{txt:'婉言谢绝'}]}};
}
function aiContentPipeline(kind,prompt){
  if(aiEnabled())return aiProduceContent(kind,prompt).then(parseAiEvent).catch(e=>({ok:false,err:String(e&&e.message||e)}));
  return Promise.resolve(localEventDraft(kind,prompt));
}
function aiReviewImport(entry){
  if(!entry||!entry.id)return {ok:false,err:'空条目'};
  const v=validateAiEvent(entry);
  if(!v.ok)return v;
  DATA.events=DATA.events||[];
  if(DATA.events.some(e=>e.id===entry.id))return {ok:false,err:'id 重复：'+entry.id};
  DATA.events.push(entry);
  return {ok:true,count:DATA.events.length,id:entry.id};
}
/* 内容生产面板：类型 + 提示词 → 生成 → 校验 → 入库 */
let _aiDraft=null;
function panelAiStudio(){
  openPanel('🤖 内容生产（AI 扩写）',
    '<p>生成一条社交事件：AI 出稿 → 校验 → 人工确认入库（本地模式无 AI 时生成模板草稿）。</p>'+
    '<label style="display:block;font-size:12.5px">事件类型</label>'+
    '<div class="row"><button class="small primary" onclick="aiSetKind(\'chat\')">💬 闲谈</button>'+
    '<button class="small" onclick="aiSetKind(\'visit\')">🚪 来访</button>'+
    '<button class="small" onclick="aiSetKind(\'invite\')">📜 约见</button></div>'+
    '<label style="display:block;margin-top:8px;font-size:12.5px">提示词（可选）</label>'+
    '<input id="aiPrompt" style="width:100%;box-sizing:border-box" placeholder="例如：雨夜借宿荒村，遇白发老妪讲古">'+
    '<div class="row" style="margin-top:8px"><button class="small primary" onclick="aiGenerate()">✨ 生成并校验</button>'+
    '<button class="small" onclick="aiImportDraft()">📥 审核入库</button></div>'+
    '<div id="aiDraft"></div>'+
    '<p style="font-size:12px;color:#6f7a94">入库即并入社交事件表（DATA.events），任务表/区域事件同理可在后续版本接入同一管线。</p>');
}
let _aiKind='chat';
function aiSetKind(k){_aiKind=k;panelAiStudio()}
function aiGenerate(){
  const inp=document.getElementById('aiPrompt');
  const prompt=inp?inp.value:'';
  const box=document.getElementById('aiDraft');
  if(!box){toast('面板未就绪');return}
  box.innerHTML='<p class="sys">🤖 生成中…（无 AI 则本地模板）</p>';
  aiContentPipeline(_aiKind,prompt).then(r=>{
    _aiDraft=r.ok?r.entry:null;
    box.innerHTML=r.ok
      ?'<div class="bd-box"><div class="bd-head">✅ 校验通过</div><pre style="white-space:pre-wrap;font-size:12px;color:#c9c2ae">'+esc(JSON.stringify(r.entry,null,1))+'</pre></div>'
      :'<p class="danger">❌ 校验未通过：'+esc(r.err)+'</p>';
  });
}
function aiImportDraft(){
  if(!_aiDraft){toast('先点击「生成并校验」');return}
  const r=aiReviewImport(_aiDraft);
  if(r.ok){toast('已入库（当前 '+r.count+' 条）');log('<p class="loot">🤖 内容入库：「'+esc(_aiDraft.n)+'」（'+_aiDraft.id+'）——已并入社交事件表。</p>');_aiDraft=null;panelAiStudio()}
  else toast(r.err||'入库失败');
}
