/* v51 世界向交互冒烟：三轮拍卖 / 多块灵田 / 凶签奇遇链 */
const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.stones=99999; S.flag={}; S.attrs={str:30,agi:30,int:30,cha:30,wil:30}; S.realm=5; S.maxHp=calcMaxHp(S); S.hp=S.maxHp; PENDING=0;`,ctx);
// T1 三轮拍卖：加价→落槌成交
vm.runInContext(`S.flag.auctionItem=null; S.flag.auctionYear=-1; getAuction(); S.flag.auctionBidders=[]; window.__p0=S.flag.auctionPrice; startAuction();`,ctx);
assert(vm.runInContext('window._eventModalOpts&&window._eventModalOpts.length>=3',ctx),'拍卖开启 3 轮竞拍弹窗');
vm.runInContext(`
  for(let k=0;k<3;k++){ if(window._eventModalOpts&&window._eventModalOpts.length)resolveEventModal(0); }
  window.__sold=S.flag.auctionSold; window.__got=S.items.some(x=>x.name===S.flag.auctionItem.name); window.__spent=99999-S.stones;
`,ctx);
assert(vm.runInContext('window.__sold&&window.__got&&window.__spent>=S.flag.auctionPrice',ctx),'三轮后以当前价成交并获得拍品');
// T2 多块灵田：扩建加块、种植/成熟/收获
vm.runInContext(`S.flag.caveRooms={tian:true}; window.__slots=farmSlots(); ensureFarm(); plantCrop('herb',0); plantCrop('sherb',1); S.days+=20; passTime(0); window.__ready=0; (S.flag.farm.plots||[]).forEach(p=>{if(p&&p.crop&&p.notified)window.__ready++;});`,ctx);
assert(vm.runInContext('window.__slots===2',ctx),'洞府灵田扩建后 2 块');
assert(vm.runInContext('window.__ready===2',ctx),'两块灵田到期均自动通知');
vm.runInContext(`const b=S.mats.sherb||0; S.flag.farm.plots[1].evt=null; harvestCrop(1); window.__sherb=(S.mats.sherb||0)>b&&!S.flag.farm.plots[1].crop;`,ctx);
assert(vm.runInContext('window.__sherb',ctx),'收获第二块灵参并清空该块');
// T3 凶签奇遇链：避祸→应劫→转运
vm.runInContext(`
  const __origPick=pick; pick=()=>SIGNS.find(s=>s.k==='trial');
  S.days=0; S.flag.sign=null; PENDING=0; drawSign();
  pick=__origPick;
  window.__chain=S.flag.signChain;
`,ctx);
assert(vm.runInContext('window.__chain===true&&window._eventModalOpts&&window._eventModalOpts.length>=2',ctx),'凶签开启化解奇遇链');
vm.runInContext(`for(let k=0;k<3&&window._eventModalOpts&&window._eventModalOpts.length;k++)resolveEventModal(0); window.__done=!S.flag.signChain; window.__luck0=S.luck;`,ctx);
assert(vm.runInContext('window.__done&&window.__luck0>=1',ctx),'奇遇链走完：劫消运至（气运+1）');

console.log(fails===0?'smoke73: ALL PASS':'smoke73 FAILS: '+fails);
process.exit(fails?1:0);
