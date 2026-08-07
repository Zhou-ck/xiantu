/* v93 B04 道侣/宗门事件池冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

const pn=vm.runInContext('PARTNER_EVENTS.length',ctx);
const sn=vm.runInContext('SECT_EVENTS.length',ctx);
assert(pn>=30,'道侣池 ≥30（'+pn+'）');
assert(sn>=24,'宗门池 ≥24（'+sn+'）');

// 池内 id 去重 + b04 前缀
const pids=vm.runInContext('PARTNER_EVENTS.map(e=>e.id)',ctx);
assert(new Set(pids).size===pids.length,'道侣 id 无重复');
assert(pids.every(id=>String(id).indexOf('b04_')===0),'道侣 id 全带 b04_ 前缀');
const sids=vm.runInContext('SECT_EVENTS.map(e=>e.id)',ctx);
assert(new Set(sids).size===sids.length,'宗门 id 无重复');
assert(sids.every(id=>String(id).indexOf('b04_')===0),'宗门 id 全带 b04_ 前缀');

// stage 分布：结缡后 ≥8、未结 ≥4
const married=vm.runInContext(`PARTNER_EVENTS.filter(e=>e.stage==='married').length`,ctx);
const unmarried=vm.runInContext(`PARTNER_EVENTS.filter(e=>e.stage==='unmarried').length`,ctx);
assert(married>=8,'结缡后事件 ≥8（'+married+'）');
assert(unmarried>=4,'未结缡事件 ≥4（'+unmarried+'）');

// fx 白名单 + roll/combat 结构
const vp=vm.runInContext('validatePartnerEvents()',ctx);
assert(Array.isArray(vp)&&vp.length===0,'validatePartnerEvents 0 错误'+(vp.length?(' → '+vp.join(' | ')):""));
const vs=vm.runInContext('validateSectEvents()',ctx);
assert(Array.isArray(vs)&&vs.length===0,'validateSectEvents 0 错误'+(vs.length?(' → '+vs.join(' | ')):""));

// 进总量与目录
assert(vm.runInContext('eventTotalCount()',ctx)>=524,'eventTotalCount ≥524（'+vm.runInContext('eventTotalCount()',ctx)+'）');
const sum=vm.runInContext('contentSummary()',ctx);
assert(sum.partner&&sum.partner.ok,'目录 partner 配额通过（'+sum.partner.count+'/'+sum.partner.min+'）');
assert(sum.sect&&sum.sect.ok,'目录 sect 配额通过（'+sum.sect.count+'/'+sum.sect.min+'）');

// 解释器冒烟：roll 判定 + aff 加好感
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  S.daoPartner={name:'卿卿',role:'古琴乐师',gender:'女',favor:50,affinity:50};
  window.__p=null;
  (function(){
    window.__fx1=runPartnerFx(S.daoPartner,{aff:3});
  })();
  window.__fav=S.daoPartner.favor;
`,ctx);
assert(vm.runInContext('window.__fav',ctx)===53,'runPartnerFx aff+3 生效');

console.log(fails===0?'smoke120: ALL PASS':'smoke120 FAILS: '+fails);
process.exit(fails?1:0);
