/* v67 探索地图卡化 + 道侣/师尊聊天式对话 + 副业演出冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0; S.realm=1; S.flag={};`,ctx);

// T1 地图地点卡：缩略图 + 名称 + 快捷前往；详情卡带缩略图
vm.runInContext(`window.__mh=mapHtml(); selectMapLoc('valley'); window.__det=mapDetail();`,ctx);
const mh=vm.runInContext('window.__mh',ctx);
assert(mh.indexOf('loc-grid')>=0&&mh.indexOf('loc-card')>=0,'地图面板含地点速览卡');
assert(mh.indexOf('灵溪幽谷')>=0&&mh.indexOf('assets/scenes/tide.jpg')>=0,'地点卡带缩略图与名称');
assert(mh.indexOf('守关试炼')>=0&&mh.indexOf('试炼塔')>=0,'POI 地点（守关/试炼塔）入卡');
const det=vm.runInContext('window.__det',ctx);
assert(det.indexOf('map-detail-thumb')>=0&&det.indexOf('tide.jpg')>=0,'选点详情卡带场景缩略图');

// T2 道侣闲谈聊天式
vm.runInContext(`{ S.daoPartner={name:'苏婉',role:'采药女',gender:'女',favor:80,affinity:80,stage:2,hp:30,atk:6,cd:{}}; S.days=10; PENDING=0; window.__ch=chance; chance=function(){return false}; daoChat(); chance=window.__ch; window.__dh=document.getElementById('panelBody')._html; window.__opts=window._eventModalOpts.length; window.__t=document.getElementById('panelTitle')._txt; }`,ctx);
const dh=vm.runInContext('window.__dh',ctx);
assert(dh.indexOf('talk-wrap')>=0&&dh.indexOf('talk-avatar')>=0&&dh.indexOf('苏婉')>=0,'道侣闲谈为聊天式对话（头像+气泡）');
assert(vm.runInContext('window.__opts>=4&&window.__t.indexOf("闲谈")>=0',ctx),'道侣闲谈保留多话题选项与标题');

// T3 师尊请安聊天式 + 结算
vm.runInContext(`{ S.master={name:'玄微真人',role:'长老',gender:'男',cd:{},favor:60,stage:3}; masterGreet(); window.__mh2=document.getElementById('panelBody')._html; window.__f0=S.master.favor; window._eventModalOpts[0].fn(); window.__f1=S.master.favor; }`,ctx);
assert(vm.runInContext('window.__mh2.indexOf("talk-wrap")>=0&&window.__mh2.indexOf("玄微真人")>=0',ctx),'师尊请安为聊天式对话');
assert(vm.runInContext('window.__f1>window.__f0',ctx),'师尊请安选择后情分到账');

// T4 副业微操演出
assert(vm.runInContext("craftFlourish('⚗️ 炼丹 · 火候微操')",ctx).indexOf('craft-stage')>=0,'炼丹微操带炉火演出');
vm.runInContext(`openEventModal('🔨 炼器 · 锻打微操','<p>炉中器胚通红。</p>',[{txt:'稳锤',fn:()=>{}}]); window.__ch=document.getElementById('panelBody')._html;`,ctx);
assert(vm.runInContext('window.__ch',ctx).indexOf('craft-stage')>=0,'炼器微操弹窗渲染演出区');

// T5 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='83','版本号 v83');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke93: ALL PASS':'smoke93 FAILS: '+fails);
process.exit(fails?1:0);
