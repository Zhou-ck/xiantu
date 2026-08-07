/* v69 任务行卡片化 + 宗门面板卡片化 + 门中事宜聊天式冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0;`,ctx);

// T1 任务行卡片化
vm.runInContext(`window.__q1=questRow({name:'修炼一日',icon:'🧘',target:3,rewardText:'灵石 +10'},2,false); window.__q2=questRow({name:'拜访道友',icon:'👥',target:1,rewardText:'好感 +5'},1,true);`,ctx);
const q1=vm.runInContext('window.__q1',ctx),q2=vm.runInContext('window.__q2',ctx);
assert(q1.indexOf('quest-row')>=0&&q1.indexOf('quest-ico')>=0&&q1.indexOf('🧘')>=0,'任务行含图标与卡片样式');
assert(q1.indexOf('进度 2/3')>=0&&q1.indexOf('灵石 +10')>=0&&q1.indexOf('66%')>=0,'任务行展示进度/奖励/百分比');
assert(q2.indexOf('已领取')>=0&&q2.indexOf('✅')>=0,'完成任务行显示已领取');
vm.runInContext(`{ panelDaily(); window.__pd=document.getElementById('panelBody')._html; panelQuests(); window.__pq=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__pd',ctx).indexOf('quest-row')>=0&&vm.runInContext('window.__pd',ctx).indexOf('今日任务')>=0,'每日修行面板任务卡片化');
assert(vm.runInContext('window.__pq',ctx).indexOf('quest-row')>=0,'任务日志面板任务卡片化');

// T2 宗门面板：无宗门门派卡 / 有宗门任务与宝库卡
vm.runInContext(`{ S.sect=null; panelSect(); window.__ps=document.getElementById('panelBody')._html; }`,ctx);
const ps=vm.runInContext('window.__ps',ctx);
assert(ps.indexOf('qcard')>=0&&ps.indexOf('拜山')>=0&&ps.indexOf('投身')>=0,'宗门选择卡（正道拜山/魔道投身）');
assert(ps.indexOf('sect-thumb')>=0,'宗门卡带山门缩略图');
vm.runInContext(`{ S.attrs.cha=20; S.attrs.str=30; S.gender='男'; joinSect(0); panelSect(); window.__pj=document.getElementById('panelBody')._html; }`,ctx);
const pj=vm.runInContext('window.__pj',ctx);
assert(pj.indexOf('qcard')>=0&&pj.indexOf('接取')>=0,'宗门任务卡片化');
assert(pj.indexOf('兑换 · ')>=0,'宗门宝库物品卡带兑换按钮');

// T3 门中事宜聊天式
vm.runInContext(`{ S.flag.sectEvents=0; PENDING=0; sectEvent(); window.__se=document.getElementById('panelBody')._html; window.__opts=window._eventModalOpts.length; }`,ctx);
assert(vm.runInContext('window.__se',ctx).indexOf('talk-wrap')>=0,'门中事宜为聊天式弹窗');
assert(vm.runInContext('window.__opts>=2&&window.__opts<=3',ctx),'门中事宜保留事件抉择');
vm.runInContext(`window._eventModalOpts[0].fn();`,ctx);
assert(vm.runInContext('S.flag.sectEvents',ctx)===1,'门中事宜选择后计数到账');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='89','版本号 v89');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke95: ALL PASS':'smoke95 FAILS: '+fails);
process.exit(fails?1:0);
