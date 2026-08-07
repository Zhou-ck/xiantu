/* v73 灵兽卡 + 生涯统计卡 + 收藏图鉴进度条冒烟 */
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

// T1 灵兽卡：立绘 + 成长条 + 状态 + 操作
vm.runInContext(`{ S.pet={name:'小白',species:'灵狐',talent:'stealth',form:2,exp:30,level:1,faint:0}; petPanel(); window.__pp=document.getElementById('panelBody')._html; }`,ctx);
const pp=vm.runInContext('window.__pp',ctx);
assert(pp.indexOf('pet-card')>=0&&pp.indexOf('pet-portrait')>=0&&pp.indexOf('foxPet.jpg')>=0,'灵兽卡带立绘');
assert(pp.indexOf('成长 30 /')>=0&&pp.indexOf('助战加成')>=0,'灵兽卡带成长进度与助战加成');
assert(pp.indexOf('喂食灵石')>=0&&pp.indexOf('放养历练')>=0,'灵兽卡保留操作按钮');

// T2 生涯统计卡片化
vm.runInContext(`{ S.flag.sectEvents=1; careerWall(); window.__cw=document.getElementById('panelBody')._html; }`,ctx);
const cw=vm.runInContext('window.__cw',ctx);
assert(cw.indexOf('stat-grid')>=0&&cw.indexOf('stat-cell')>=0,'生涯统计以统计卡网格呈现');
assert(cw.indexOf('🏯 宗门')>=0&&cw.indexOf('1 件')>=0&&cw.indexOf('修炼')>=0&&cw.indexOf('善恶')>=0,'生涯统计保留全部区块与数值');

// T3 收藏图鉴进度条
vm.runInContext(`{ S.seenI={回春丹:3,聚灵丹:1}; S.seenE={妖狼:2}; collectionAtlas(); window.__ca=document.getElementById('panelBody')._html; }`,ctx);
const ca=vm.runInContext('window.__ca',ctx);
assert(ca.indexOf('收集进度')>=0&&ca.indexOf('/')>=0&&ca.indexOf('种')>=0,'收藏图鉴含收集进度（物品/总数）');
assert(ca.indexOf('class="bar"')>=0,'收藏图鉴含进度条');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='81','版本号 v81');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke99: ALL PASS':'smoke99 FAILS: '+fails);
process.exit(fails?1:0);
