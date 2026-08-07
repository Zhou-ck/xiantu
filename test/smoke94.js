/* v68 秘境卡片化 + 道侣约会/事件聊天式 + 副业卡片化冒烟 */
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

// T1 秘境之门卡片化：品质卡 + 场景缩略图 + 进入按钮
vm.runInContext(`{ S.realm=3; S.flag={}; panelDungeonList(); window.__dl=document.getElementById('panelBody')._html; }`,ctx);
const dl=vm.runInContext('window.__dl',ctx);
assert(dl.indexOf('qcard')>=0&&dl.indexOf('古修士洞府')>=0&&dl.indexOf('assets/scenes/dungeon.jpg')>=0,'秘境卡含品质卡样式与洞府缩略图');
assert(dl.indexOf('上古剑冢')>=0&&dl.indexOf('assets/scenes/swordtomb.jpg')>=0,'剑冢秘境带专属缩略图');
assert(dl.indexOf('寒渊冰宫')>=0&&dl.indexOf('进入秘境')>=0,'全部秘境入卡且保留进入按钮');

// T2 道侣事件 / 约会 聊天式
vm.runInContext(`{ S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; partnerEvent(); window.__pe=document.getElementById('panelBody')._html; window.__opts=window._eventModalOpts.length; window.__disp=document.getElementById('panel').style.display; }`,ctx);
const pe=vm.runInContext('window.__pe',ctx);
assert(pe.indexOf('talk-wrap')>=0&&pe.indexOf('talk-avatar')>=0,'道侣事件为聊天式（头像+气泡）');
assert(vm.runInContext('window.__opts>=2&&window.__disp==="flex"',ctx),'道侣事件保留抉择与弹窗');
vm.runInContext(`{ S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; PENDING=0; daoDate(); window.__dd=document.getElementById('panelBody')._html; }`,ctx);
assert(vm.runInContext('window.__dd',ctx).indexOf('talk-wrap')>=0,'道侣约会为聊天式');

// T3 副业面板：学艺入口卡片化 / 配方卡片化 / 强化卡
vm.runInContext(`{ S.prof=null; panelCraft(); window.__lc=document.getElementById('panelBody')._html; S.prof='alchemy'; S.profLevel=3; S.profExp=20; panelCraft(); window.__pc=document.getElementById('panelBody')._html; }`,ctx);
const lc=vm.runInContext('window.__lc',ctx);
assert(lc.indexOf('qcard')>=0&&lc.indexOf('炼丹师')>=0&&lc.indexOf('拜师学艺')>=0,'副业学艺入口卡片化');
const pc=vm.runInContext('window.__pc',ctx);
assert(pc.indexOf('qcard')>=0&&pc.indexOf('丹方 / 图纸')>=0,'副业配方卡片化');
assert(pc.indexOf('装备强化')>=0,'副业面板保留强化区');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='88','版本号 v88');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke94: ALL PASS':'smoke94 FAILS: '+fails);
process.exit(fails?1:0);
