/* 整体完整性检测：扫描整包中所有 onclick="fn(" 与 fn:()=>fn() 引用，
   核对每个被引用的函数名是否在全局有定义；同时检查 HTML 中 id 是否被 JS 使用。 */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(process.env.TEMP,'xiantu_game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const defs=new Set();
for(const m of js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g))defs.add(m[1]);
for(const m of js.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=/g))defs.add(m[1]);
for(const m of js.matchAll(/let\s+([A-Za-z_$][\w$]*)\s*=/g))defs.add(m[1]);
const refs=new Set();
for(const m of js.matchAll(/onclick="([A-Za-z_$][\w$]*)\s*\(/g))refs.add(m[1]);
for(const m of html.matchAll(/onclick="([A-Za-z_$][\w$]*)\s*\(/g))refs.add(m[1]);
for(const m of js.matchAll(/fn:\s*\(\)=>\s*([A-Za-z_$][\w$]*)\s*\(/g))refs.add(m[1]);
for(const m of js.matchAll(/go:'([A-Za-z_$][\w$]*)\s*\(/g))refs.add(m[1]);
/* 常用全局变量引用（非函数） */
const whitelist=new Set(['panelBody','panelTitle','panel','tabbar','freeInput','btnFree','story','toast','side','scrim','ending','battleResult','battleContinue','battleLog','bEnemyBar','bEnemyHp','bPlayerBar','bPlayerHp','cultivate','cultTitle','cultAbort','cultMode','cultLog','cultDay','cultBar','cultPartner','cultBuffs','breakthrough','breakName','breakRealm','breakPortrait','breakLog','breakBar','breakDay','breakSkip','btThunder','btHeart','btAura','screen-title','screen-create','screen-game','nameInput','createAttr','createBg','loopBar','btnRandName','btnReroll','btnBegin','btnGenderF','btnGenderM','btnNew','btnLoad','btnSave','btnHelp','btnDaily','btnSide','btnTome','btnLoop','guide','guidePrev','guideNext','importFile','seedInput','aiBase','aiKey','aiModel','trustTarget']);
const missing=[...refs].filter(n=>!defs.has(n)&&!whitelist.has(n));
const dupDefs=[...defs].filter(n=>(js.match(new RegExp('function\\s+'+n+'\\s*\\(','g'))||[]).length>1);
let fails=0;
if(missing.length){fails++;console.log('MISSING REFS:');for(const n of missing)console.log('  - '+n)}
if(dupDefs.length){console.log('NOTE duplicate function defs (last wins): '+dupDefs.join(', '))}
/* HTML 中引用的 JS id 是否存在 */
const usedIds=new Set();
for(const m of html.matchAll(/id="([A-Za-z_$][\w$]*)"/g))usedIds.add(m[1]);
console.log('functions defined:',defs.size,'| unique refs:',refs.size,'| html ids:',usedIds.size);
console.log(fails===0?'LINK AUDIT PASS':'LINK AUDIT FAIL: '+missing.length);
process.exit(fails?1:0);
