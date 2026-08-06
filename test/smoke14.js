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
(async()=>{
  vm.runInContext(`
    S=newState('测',BACKGROUNDS[0]);
    S.attrs={str:40,agi:40,int:10,cha:10,wil:20};
    S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
    S.flag={}; S.battleTactic='steady';
    window.__pr=battle({name:'靶子',atk:-20,def:0,hp:500});
  `,ctx);
  vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
  const st=await vm.runInContext(`window.__pr`,ctx);
  assert(st.win,'战斗胜利');
  assert(st.st&&st.st.crits>=1,'力量暴击翻倍生效（crits='+st.st.crits+'）');
  assert(st.st&&st.st.dodges>=1,'身法闪避生效（dodges='+st.st.dodges+'）');
  assert(st.st&&st.st.dmgDealt>=500,'伤害总量正常（dmg='+st.st.dmgDealt+'）');
  console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
})();