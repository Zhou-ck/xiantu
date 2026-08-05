const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
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
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=9; S.attrs.wil=20; const m=Math.random; Math.random=()=>0.10; window.__r1=growWil(0.12,'测试'); Math.random=m; }`,ctx);
assert(vm.runInContext('S.attrs.wil===21&&window.__r1.indexOf("心性 +1")>=0',ctx),'筑基后心性20成长概率约10.5%');
vm.runInContext(`{ S.realm=9; S.attrs.wil=34; const m=Math.random; Math.random=()=>0.06; window.__r2=growWil(0.12,'测试'); Math.random=m; }`,ctx);
assert(vm.runInContext('S.attrs.wil===34&&window.__r2===""',ctx),'筑基后心性34成长放缓');
vm.runInContext(`{ S.realm=0; S.attrs.wil=6; const m=Math.random; Math.random=()=>0.16; window.__r3=growWil(0.12,'测试'); Math.random=m; }`,ctx);
assert(vm.runInContext('S.attrs.wil===7',ctx),'炼气期心性成长提速1.5倍');
vm.runInContext(`{ S.attrs.wil=40; const m=Math.random; Math.random=()=>0; window.__r4=growWil(0.9,'测试'); Math.random=m; }`,ctx);
assert(vm.runInContext('S.attrs.wil===40&&window.__r4===""',ctx),'心性40不再成长');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=0; S.attrs.wil=6; S.heartDemons=0; S.hp=S.maxHp; const m=Math.random; let q=[0.5,0.05]; Math.random=()=>q.length?q.shift():0.99; PENDING=0; settleMind(); Math.random=m; }`,ctx);
assert(vm.runInContext('S.attrs.wil===7&&S.heartDemons===0',ctx),'练气期无心魔也能静心养神涨心性');
vm.runInContext(`{ S=newState('测',BACKGROUNDS[0]); S.realm=9; S.attrs.wil=20; S.heartDemons=1; S.hp=S.maxHp; const m=Math.random; let q2=[0.5,0.05]; Math.random=()=>q2.length?q2.shift():0.99; PENDING=0; settleMind(); Math.random=m; }`,ctx);
assert(vm.runInContext('S.heartDemons===0&&S.attrs.wil===22',ctx),'静心养神消心魔且养道心（含筑基称号+1）');
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);