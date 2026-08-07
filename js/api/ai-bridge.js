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
  v46/v92 AI 扩写流水线（本地模式）
  生成 → schema/目录校验 → 人工审核入库
  池：social / story / meditation；入库走 contentImport
====================================================== */
let _aiDraft=null;
let _aiPool='social';
let _aiKind='chat';

function aiProduceContent(poolKey,kind,prompt){
  const sys={
    social:'你是《仙途》文字修仙游戏的内容策划。请只输出一个 JSON 对象（不要 markdown），作为一条社交事件。字段：{id,n,type,t,opts:[{txt,cls?}]}。type 仅限 visit/invite/chat；opts 至少 1 项；正文 t 为 30-60 字古典仙侠文风；不写数值奖励。',
    story:'你是《仙途》内容策划。只输出一个 JSON：{id,cat,weight,title,t,opts:[{txt,cls?,fx?}]}。cat 仅限 calm/herb/rare/epic/danger；weight 为 1 或 2；opts 至少 1 项；fx 仅可用 stones/cult/merit/mood/insight/luck 等简单数值，不要新物品名。',
    meditation:'你是《仙途》内容策划。只输出一个 JSON：{id,t,opts:[{txt,fx?}]}。t 为闭关顿悟场景 40-80 字；opts 2 项；fx 可用 cult/dao/insight/mood/imp/luck/wil 简单数值。',
  };
  return aiCall([
    {role:'system',content:sys[poolKey]||sys.social},
    {role:'user',content:'类型/子类：'+(kind||poolKey)+'\n要求：'+(prompt||'随机一条')},
  ],400);
}
function parseAiEvent(txt,poolKey){
  if(!txt)return {ok:false,err:'AI 无输出'};
  try{
    const m=String(txt).match(/\{[\s\S]*\}/);
    const obj=JSON.parse(m?m[0]:String(txt));
    return validateAiEntry(obj,poolKey||'social');
  }catch(e){return {ok:false,err:'JSON 解析失败：'+e.message}}
}
function validateAiEvent(obj){return validateAiEntry(obj,'social')}
function validateAiEntry(obj,poolKey){
  const errs=[];
  if(!obj||typeof obj!=='object')return {ok:false,err:'不是对象'};
  if(typeof obj.id!=='string'||!obj.id)errs.push('缺 id');
  if(poolKey==='social'){
    if(typeof obj.n!=='string'||!obj.n)errs.push('缺 n');
    if(['visit','invite','chat'].indexOf(obj.type)<0)errs.push('type 非法');
    if(!Array.isArray(obj.opts)||!obj.opts.length)errs.push('opts 为空');
  }else if(poolKey==='story'){
    if(['calm','herb','rare','epic','danger'].indexOf(obj.cat)<0)errs.push('cat 非法');
    if(typeof obj.title!=='string'||!obj.title)errs.push('缺 title');
    if(typeof obj.t!=='string'||!obj.t)errs.push('缺 t');
    if(!Array.isArray(obj.opts)||!obj.opts.length)errs.push('opts 为空');
    if(obj.weight==null)obj.weight=2;
  }else if(poolKey==='meditation'){
    if(typeof obj.t!=='string'||!obj.t)errs.push('缺 t');
    if(!Array.isArray(obj.opts)||!obj.opts.length)errs.push('opts 为空');
  }else errs.push('未知池 '+poolKey);
  return errs.length?{ok:false,err:errs.join('；')}:{ok:true,entry:obj};
}
function localEventDraft(poolKey,kind,prompt){
  /* 兼容旧签名 localEventDraft(kind,prompt)：kind=visit|invite|chat */
  if(arguments.length<=2&&['visit','invite','chat'].indexOf(poolKey)>=0){
    prompt=kind;kind=poolKey;poolKey='social';
  }
  const id='draft_'+Math.floor(Math.random()*1e8).toString(36);
  if(poolKey==='story'){
    const cat=['calm','herb','rare','epic','danger'].indexOf(kind)>=0?kind:'calm';
    const t=prompt||'山道转角，你遇见一桩小事，心中微有所感。';
    return {ok:true,entry:{id:id,cat:cat,weight:2,title:'本地草稿·'+cat,t:t,opts:[{txt:'驻足片刻',cls:'primary',fx:{cult:50}},{txt:'继续赶路',fx:{}}]}};
  }
  if(poolKey==='meditation'){
    const t=prompt||'入定中灵光一闪，你捕捉到一线真意。';
    return {ok:true,entry:{id:id,t:t,opts:[{txt:'静观其变',fx:{insight:1}},{txt:'纳入修为',fx:{cult:80}}]}};
  }
  const pool=[
    '一位故人捎来口信，约你三日后于山亭相见。',
    '云游道人路过山门，讲了一则上古轶闻，听得你心驰神往。',
    '茶棚老板娘提起近期坊市异动，言语间似有所指。',
    '林间小道上，一名采药女与你同行一程，聊起深山里那株会发光的草。',
  ];
  const t=prompt||pick(pool);
  const type=kind==='invite'?'invite':kind==='visit'?'visit':'chat';
  return {ok:true,entry:{id:id,n:'本地草稿·'+({visit:'来访',invite:'约见',chat:'闲谈'}[type]||'闲谈'),type:type,t:t,opts:[{txt:'欣然应约',cls:'primary'},{txt:'婉言谢绝'}]}};
}
function aiContentPipeline(poolKey,kind,prompt){
  /* 兼容旧签名：aiContentPipeline(kind,prompt) */
  if(arguments.length<=2&&['visit','invite','chat'].indexOf(poolKey)>=0){
    prompt=kind;kind=poolKey;poolKey='social';
  }
  const pk=poolKey||'social';
  if(aiEnabled())return aiProduceContent(pk,kind,prompt).then(function(txt){return parseAiEvent(txt,pk)}).catch(function(e){return {ok:false,err:String(e&&e.message||e)}});
  return Promise.resolve(localEventDraft(pk,kind,prompt));
}
function aiReviewImport(entry,poolKey){
  if(!entry||!entry.id)return {ok:false,err:'空条目'};
  const pk=poolKey||_aiPool||'social';
  const v=validateAiEntry(entry,pk);
  if(!v.ok)return v;
  if(typeof contentImport==='function'){
    const r=contentImport(pk,[entry]);
    if(r.skipped&&!r.added)return {ok:false,err:'id 重复：'+entry.id};
    if(!r.ok)return {ok:false,err:(r.errors&&r.errors.join('；'))||r.err||'入库失败'};
    return {ok:true,count:r.count,id:entry.id,pool:pk,added:r.added};
  }
  DATA.events=DATA.events||[];
  if(DATA.events.some(function(e){return e.id===entry.id}))return {ok:false,err:'id 重复：'+entry.id};
  DATA.events.push(entry);
  return {ok:true,count:DATA.events.length,id:entry.id,pool:'social'};
}
function panelAiStudio(){
  const poolLabel={social:'社交',story:'故事',meditation:'顿悟'}[_aiPool]||_aiPool;
  const kindRow=_aiPool==='social'
    ?'<div class="row"><button class="small'+(_aiKind==='chat'?' primary':'')+'" onclick="aiSetKind(\'chat\')">💬 闲谈</button>'+
      '<button class="small'+(_aiKind==='visit'?' primary':'')+'" onclick="aiSetKind(\'visit\')">🚪 来访</button>'+
      '<button class="small'+(_aiKind==='invite'?' primary':'')+'" onclick="aiSetKind(\'invite\')">📜 约见</button></div>'
    :(_aiPool==='story'
      ?'<div class="row"><button class="small" onclick="aiSetKind(\'calm\')">平静</button><button class="small" onclick="aiSetKind(\'herb\')">采药</button><button class="small" onclick="aiSetKind(\'rare\')">奇遇</button><button class="small" onclick="aiSetKind(\'epic\')">奇缘</button><button class="small" onclick="aiSetKind(\'danger\')">凶险</button></div>'
      :'<p style="font-size:12px;color:#6f7a94">顿悟池无需子类型。</p>');
  const sum=(typeof contentSummary==='function')?contentSummary():null;
  const sumLine=sum?'<p style="font-size:12px;color:#8a94a8">社交 '+(sum.social?sum.social.count:'?')+' · 故事 '+(sum.story?sum.story.count:'?')+' · 顿悟 '+(sum.meditation?sum.meditation.count:'?')+' · 事件总量 '+(sum._totalEvents||'?')+'</p>':'';
  openPanel('🤖 内容生产（AI 扩写）',
    '<p>生成 → 校验 → 人工确认入库。无 AI 时用本地模板。当前池：<b>'+poolLabel+'</b></p>'+sumLine+
    '<label style="display:block;font-size:12.5px">内容池</label>'+
    '<div class="row"><button class="small'+(_aiPool==='social'?' primary':'')+'" onclick="aiSetPool(\'social\')">💬 社交</button>'+
    '<button class="small'+(_aiPool==='story'?' primary':'')+'" onclick="aiSetPool(\'story\')">📖 故事</button>'+
    '<button class="small'+(_aiPool==='meditation'?' primary':'')+'" onclick="aiSetPool(\'meditation\')">✨ 顿悟</button></div>'+
    '<label style="display:block;margin-top:8px;font-size:12.5px">子类型</label>'+kindRow+
    '<label style="display:block;margin-top:8px;font-size:12.5px">提示词（可选）</label>'+
    '<input id="aiPrompt" style="width:100%;box-sizing:border-box" placeholder="例如：雨夜借宿荒村，遇白发老妪讲古">'+
    '<div class="row" style="margin-top:8px"><button class="small primary" onclick="aiGenerate()">✨ 生成并校验</button>'+
    '<button class="small" onclick="aiImportDraft()">📥 审核入库</button></div>'+
    '<div id="aiDraft"></div>'+
    '<p style="font-size:12px;color:#6f7a94">入库走 contentImport；批次见 js/data/batches/。称号等函数型数据须手写。</p>');
}
function aiSetPool(p){
  _aiPool=p||'social';
  if(_aiPool==='social'&&['visit','invite','chat'].indexOf(_aiKind)<0)_aiKind='chat';
  if(_aiPool==='story'&&['calm','herb','rare','epic','danger'].indexOf(_aiKind)<0)_aiKind='calm';
  panelAiStudio();
}
function aiSetKind(k){_aiKind=k;panelAiStudio()}
function aiGenerate(){
  const inp=document.getElementById('aiPrompt');
  const prompt=inp?inp.value:'';
  const box=document.getElementById('aiDraft');
  if(!box){toast('面板未就绪');return}
  box.innerHTML='<p class="sys">🤖 生成中…（无 AI 则本地模板）</p>';
  aiContentPipeline(_aiPool,_aiKind,prompt).then(function(r){
    _aiDraft=r.ok?r.entry:null;
    box.innerHTML=r.ok
      ?'<div class="bd-box"><div class="bd-head">✅ 校验通过 · '+esc(_aiPool)+'</div><pre style="white-space:pre-wrap;font-size:12px;color:#c9c2ae">'+esc(JSON.stringify(r.entry,null,1))+'</pre></div>'
      :'<p class="danger">❌ 校验未通过：'+esc(r.err)+'</p>';
  });
}
function aiImportDraft(){
  if(!_aiDraft){toast('先点击「生成并校验」');return}
  const r=aiReviewImport(_aiDraft,_aiPool);
  if(r.ok){
    toast('已入库（'+_aiPool+' 现 '+r.count+' 条）');
    log('<p class="loot">🤖 内容入库：「'+esc(_aiDraft.n||_aiDraft.title||_aiDraft.id)+'」（'+_aiDraft.id+'）→ '+esc(_aiPool)+'</p>');
    _aiDraft=null;panelAiStudio();
  }else toast(r.err||'入库失败');
}
