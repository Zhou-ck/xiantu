/* v42 世界地图冒烟：11 个地点渲染 / 锁定迷雾 / 选点详情 / 前往回调 / 主线 📌 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){
  const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,
    classList:{add(){},remove(){},toggle(){}},
    set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},
    set textContent(v){this._txt=String(v)},get textContent(){return this._txt},
    appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},
    querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};
  return el;
}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 地点数据完整：10 个点，字段齐全
vm.runInContext(`window.__locs=MAP_LOCS; window.__bad=MAP_LOCS.filter(l=>!l.id||!l.name||!l.icon||l.x===undefined||l.y===undefined||l.minRealm===undefined||!l.action);`,ctx);
assert(vm.runInContext('window.__locs.length===10&&window.__bad.length===0',ctx),'MAP_LOCS 10 个地点且字段完整');

// T2 地图渲染：10 个标记 + 地形
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.flag={}; S.realm=0; window.__svg=mapSvg();`,ctx);
const svg=vm.runInContext('window.__svg',ctx);
let all=true;
for(const id of ['near','valley','hill','forest','cliff','ruin','abyss','tower','boss','dungeon']){
  if(svg.indexOf("data-loc='"+id+"'")<0&&svg.indexOf('data-loc="'+id+'"')<0)all=false;
}
assert(all,'mapSvg 渲染全部 10 个地点标记');
assert(svg.indexOf('<svg')>=0&&svg.indexOf('灵溪幽谷')>=0,'水墨 SVG 地形渲染（含灵溪幽谷名称）');

// T3 锁定迷雾：炼气一层时 7 个点锁定（valley/forest/cliff/ruin/abyss/tower/dungeon）
vm.runInContext(`window.__locked=(mapSvg().match(/map-loc locked/g)||[]).length; S.realm=30; window.__unlocked=(mapSvg().match(/map-loc locked/g)||[]).length;`,ctx);
assert(vm.runInContext('window.__locked',ctx)>=7,'炼气一层时 ≥7 个地点迷雾锁定');
assert(vm.runInContext('window.__unlocked',ctx)===0,'合体期时无迷雾锁定');

// T4 选点详情
vm.runInContext(`S.realm=1; selectMapLoc('valley'); window.__detail=mapDetail();`,ctx);
const det=vm.runInContext('window.__detail',ctx);
assert(det.indexOf('灵溪幽谷')>=0&&det.indexOf('前往')>=0,'选点后详情卡展示名称与前往按钮');

// T5 前往锁定点 → 迷雾提示，不崩溃
vm.runInContext(`S.realm=0; PENDING=0; travelTo('abyss'); window.__toast=document.getElementById('toast').textContent;`,ctx);
assert(vm.runInContext('window.__toast.indexOf("迷雾锁路")>=0',ctx),'前往锁定点提示迷雾锁路');

// T6 主线目标 📌：visit 步骤时地图显示标记
vm.runInContext(`
  S.realm=1;
  S.quest={main:{ch:1,step:0,done:[],chDone:[],log:[]}};
  window.__pin=mapSvg().indexOf('map-pin')>=0; window.__target=mainVisitTarget();
`,ctx);
assert(vm.runInContext('window.__target==="valley"&&window.__pin',ctx),'主线 visit 目标在地图上显示 📌');

// T7 秘境之门：境界不足提示 / 满足后打开面板
vm.runInContext(`S.realm=0; PENDING=0; panelDungeonList(); window.__t1=document.getElementById('toast').textContent;`,ctx);
assert(vm.runInContext('window.__t1.indexOf("炼气三层")>=0',ctx),'秘境之门境界不足提示');
vm.runInContext(`S.realm=2; panelDungeonList(); window.__ph=document.getElementById('panelBody')._html; window.__title=document.getElementById('panelTitle').textContent;`,ctx);
assert(vm.runInContext('window.__title.indexOf("秘境之门")>=0&&window.__ph.indexOf("上古剑冢")>=0',ctx),'秘境之门列出全部秘境副本');

console.log(fails===0?'smoke56: ALL PASS':'smoke56 FAILS: '+fails);
process.exit(fails?1:0);
