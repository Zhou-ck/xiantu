/* v72 灵田卡片化 + 拍卖聊天式 + 服丹演出冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); S.flag={}; S.stones=9999; PENDING=0;`,ctx);

// T1 灵田卡片化：空置卡 + 种植后进度卡 + 成熟可收获
vm.runInContext(`{ panelRest(); window.__f0=document.getElementById('panelBody')._html; plantCrop('herb',0); S.days+=8; passTime(0); panelRest(); window.__f1=document.getElementById('panelBody')._html; }`,ctx);
const f0=vm.runInContext('window.__f0',ctx),f1=vm.runInContext('window.__f1',ctx);
assert(f0.indexOf('farm-grid')>=0&&f0.indexOf('farm-plot')>=0&&f0.indexOf('空置')>=0,'灵田卡片化（空置卡+播种按钮）');
assert(f1.indexOf('farm-plot')>=0&&f1.indexOf('灵草')>=0&&f1.indexOf('已成熟')>=0&&f1.indexOf('收获')>=0,'种植后进度卡与成熟收获按钮');

// T2 拍卖聊天式（保留三轮竞拍）
vm.runInContext(`{ S.flag.auctionItem=null; S.flag.auctionYear=-1; getAuction(); S.flag.auctionBidders=[]; startAuction(); window.__am=document.getElementById('panelBody')._html; window.__opts=window._eventModalOpts.length; }`,ctx);
const am=vm.runInContext('window.__am',ctx);
assert(am.indexOf('talk-wrap')>=0&&am.indexOf('拍卖行掌柜')>=0,'拍卖以聊天式呈现（掌柜头+气泡）');
assert(vm.runInContext('window.__opts>=3',ctx),'拍卖保留三轮竞拍选项');

// T3 服丹演出接线 + 行为保留
vm.runInContext(`{ S.hp=1; S.items=[{name:'回春丹',type:'consumable',quality:1,desc:'',use:'heal'}]; consume(0); window.__hp=S.hp; }`,ctx);
assert(vm.runInContext('window.__hp>1',ctx),'服丹行为正常（回血生效）');
const rest=fs.readFileSync(path.join(root,'js','systems','rest.js'),'utf8');
assert(rest.indexOf("fxFloatText('服用 '+it.name")>=0&&rest.indexOf("fxBurst(5,'#d8b558')")>=0,'服丹带灵光飘字与粒子演出');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.farm-plot')>=0&&css.indexOf('.farm-grid')>=0,'灵田卡片样式存在');

// T4 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='74','版本号 v74');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke98: ALL PASS':'smoke98 FAILS: '+fails);
process.exit(fails?1:0);
