/* v74 仙途录徽章化 + 突破筹备清单卡 + 修炼场景横幅冒烟 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.flag={}; PENDING=0;`,ctx);

// T1 仙途录视觉化：生平统计卡 + 称号徽章 + 结局/记忆芯片
vm.runInContext(`{ S.titles=['kills10']; S.endings=['飞升成仙']; S.memories=['前世一剑']; openTome(); window.__tm=document.getElementById('panelBody')._html; }`,ctx);
const tm=vm.runInContext('window.__tm',ctx);
assert(tm.indexOf('stat-grid')>=0&&tm.indexOf('stat-cell')>=0&&tm.indexOf('境界')>=0,'仙途录生平为统计卡');
assert(tm.indexOf('title-badge')>=0&&tm.indexOf('🏅')>=0,'称号以金徽章呈现');
assert(tm.indexOf('chip-row')>=0&&tm.indexOf('end-chip')>=0&&tm.indexOf('mem-chip')>=0,'结局与前世记忆为芯片样式');

// T2 突破筹备清单卡（✅/❌）
vm.runInContext(`{ S.cult=99999; S.realm=8; S.attrs.wil=5; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; window.__prep=breakPrepHtml(9); }`,ctx);
const prep=vm.runInContext('window.__prep',ctx);
assert(prep.indexOf('prep-row')>=0&&prep.indexOf('突破筹备')>=0,'突破筹备为清单卡');
assert(prep.indexOf('❌')>=0&&prep.indexOf('✅')>=0,'清单同时呈现达标与缺口');

// T3 修炼面板场景横幅（加载后淡入 + 触屏压暗）
vm.runInContext(`{ panelCult(); window.__pc=document.getElementById('panelBody')._html; }`,ctx);
const pc=vm.runInContext('window.__pc',ctx);
assert(pc.indexOf('cult-banner')>=0&&pc.indexOf('cult-banner-img')>=0&&pc.indexOf('assets/scenes/cult.jpg')>=0,'修炼面板带场景横幅');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.title-badge')>=0&&css.indexOf('.prep-row')>=0&&css.indexOf('.cult-banner')>=0,'徽章/筹备/横幅样式存在');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='79','版本号 v79');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke100: ALL PASS':'smoke100 FAILS: '+fails);
process.exit(fails?1:0);
