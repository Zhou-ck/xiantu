/* ======================================================
  仙途 · 设置页（2L AI 接入 / 3A 特效强度 / 2M 自动微操 / 3F 音效震动 / 2V 素材鸣谢）
====================================================== */
'use strict';

function panelSettings(){
  aiLoad();
  const s=S&&S.set||{};
  const fx=s.fx||'med';
  const btn=(cur,val,txt)=>'<button class="small'+(cur===val?' primary':'')+'" onclick="setOpt(\''+val+'\')">'+txt+'</button>';
  const aiOn=aiEnabled();
  openPanel('⚙️ 设置',
    '<h4>🎬 特效强度</h4><div class="row">'+btn(fx,'high','高（全开）')+btn(fx,'med','中（默认）')+btn(fx,'low','低（仅文字）')+'</div>'+
    '<h4>🧊 3D 形象（预留）</h4><div class="row"><button class="small'+(s.model3d?' primary':'')+'" onclick="setOpt(\'model3d\')">3D 角色卡：'+(s.model3d?'开（插槽预览）':'关（默认立绘）')+'</button></div>'+
    '<p style="font-size:12px;color:#6f7a94">开启后角色卡以 3D 插槽占位渲染，为未来 3D 角色模型引擎预留接入点；默认关闭，完全不影响当前立绘。</p>'+
    '<h4>🤖 微操小游戏</h4>'+
    '<div class="row"><button class="small'+(s.autoTrib?' primary':'')+'" onclick="setOpt(\'autoTrib\')">渡劫微操：'+(s.autoTrib?'自动':'手动')+'</button>'+
    '<button class="small'+(s.autoCraft?' primary':'')+'" onclick="setOpt(\'autoCraft\')">副业微操：'+(s.autoCraft?'自动':'手动')+'</button>'+
    '<button class="small'+(s.autoCombat?' primary':'')+'" onclick="setOpt(\'autoCombat\')">战斗 QTE：'+(s.autoCombat?'自动':'手动')+'</button></div>'+
    '<p style="font-size:12px;color:#6f7a94">微操只在关键节点出现，单次 ≤30 秒，均可在设置里切回自动。</p>'+
    '<h4>🔊 音效与震动</h4><div class="row"><button class="small'+(s.audio===false?'':' primary')+'" onclick="setOpt(\'audio\')">音效：'+(s.audio===false?'关':'开')+'</button>'+
    '<button class="small'+(s.shake===false?'':' primary')+'" onclick="setOpt(\'shake\')">震动：'+(s.shake===false?'关':'开')+'</button></div>'+
    '<h4>🤖 AI 叙事辅助（可选）</h4>'+
    (aiOn?'<p class="sys" style="color:#8fd0a0">✅ AI 已接入（'+esc(AI.model)+'）。未接入时所有功能照常走本地规则版。</p>':'<p class="sys" style="color:#d9a08a">⚠️ 尚未接入 AI。以下为可选项：在下方填入<b>兼容 OpenAI 格式</b>的中转站基址 + Key + 模型名，即可启用 AI 润色叙事；不填则本地规则版完整可用。</p>')+
    '<label style="display:block;margin-top:6px;font-size:12.5px">接口基址（如 https://luckyapi.chat/v1）</label>'+
    '<input id="aiBase" style="width:100%;box-sizing:border-box" value="'+esc(AI.base)+'" placeholder="https://…/v1">'+
    '<label style="display:block;margin-top:6px;font-size:12.5px">API Key（仅存本地）</label>'+
    '<input id="aiKey" style="width:100%;box-sizing:border-box" type="password" value="'+esc(AI.key)+'" placeholder="sk-…">'+
    '<label style="display:block;margin-top:6px;font-size:12.5px">模型名（如 gpt-4o-mini / deepseek-chat）</label>'+
    '<input id="aiModel" style="width:100%;box-sizing:border-box" value="'+esc(AI.model)+'" placeholder="模型名">'+
    '<div class="row" style="margin-top:8px"><button class="small primary" onclick="aiSaveForm()">💾 保存 AI 配置</button>'+
    '<button class="small" onclick="aiClear();panelSettings()">🗑️ 清除</button></div>'+
    '<p style="font-size:12px;color:#6f7a94">AI 仅润色叙事与自由输入理解，不直接改动任何数值；网络失败自动回退本地规则版。Key 只保存在你的浏览器本地。</p>'+
    '<div class="row" style="margin-top:6px"><button class="small" onclick="panelAiStudio()">🤖 内容生产（AI 扩写流水线）</button></div>'+
    '<h4>📱 App 与更新</h4><p style="font-size:12.5px;color:#6f7a94">当前版本 v'+(typeof GAME_VERSION==='string'?GAME_VERSION:'41')+' · '+(isNativeApp()?'已运行于原生 App 壳':'浏览器 / PWA 模式')+'。安装到主屏后全屏离线游玩，更新随推送自动生效。</p>'+
    '<div class="row"><button class="small" onclick="checkGameUpdate()">🔄 检查更新</button></div>'+
    '<h4>🙏 素材鸣谢</h4><p style="font-size:12.5px;color:#6f7a94">本作美术素材来自 AI 生成与免费可商用渠道，授权台账见 <b>assets/LICENSES.md</b>。需署名素材将在此统一展示。</p>'+
    '<div class="row"><button class="small" onclick="openCredit()">📜 查看素材台账</button></div>');
}
function setOpt(k){
  if(!S)return;
  S.set=S.set||{};
  if(k==='high'||k==='med'||k==='low'){S.set.fx=k;fxSetLevel(k)}
  else if(k==='autoTrib')S.set.autoTrib=!S.set.autoTrib;
  else if(k==='autoCraft')S.set.autoCraft=!S.set.autoCraft;
  else if(k==='autoCombat')S.set.autoCombat=!S.set.autoCombat;
  else if(k==='audio')S.set.audio=S.set.audio===false?true:false;
  else if(k==='shake')S.set.shake=S.set.shake===false?true:false;
  else if(k==='model3d')S.set.model3d=!S.set.model3d;
  save();panelSettings();
}
function aiSaveForm(){
  const b=$('aiBase'),k=$('aiKey'),m=$('aiModel');
  AI.base=(b&&b.value||'').trim();
  AI.key=(k&&k.value||'').trim();
  AI.model=(m&&m.value||'').trim();
  aiSave();
  toast(AI.base&&AI.key&&AI.model?'AI 配置已保存':'已保存（未填完整，仍走本地规则）');
  panelSettings();
}
function openCredit(){
  openPanel('🙏 素材鸣谢','<p>本作遵循「免费可商用 + 无水印 + 风格统一」素材管线：</p>'+
    '<h4>🖼️ 立绘与场景</h4><p>以 AI 生成为主（无品牌水印、免署名），角色立绘 61+ 张、场景 14+ 张，统一存放于 <b>assets/portraits</b> 与 <b>assets/scenes</b>。</p>'+
    '<h4>📦 授权渠道参考</h4><p>· itch.io 仙侠/VN 立绘包（免费，需核对各包授权）<br>· Pixabay 水墨山水（Pixabay License，免署名）<br>· OpenGameArt（CC0/OGA-BY/GPL）<br>· Kenney.nl（CC0）<br>· 爱给网（CCE 可商用-署名，引入需署名素材时在此列名）</p>'+
    '<h4>📄 完整台账</h4><p>assets/LICENSES.md 记录每一张新增图片的来源 / 作者 / 授权类型 / 是否需要署名 / 下载日期。</p>');
}
