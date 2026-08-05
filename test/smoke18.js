const fs=require('fs'),vm=require('vm');
const js=fs.readFileSync(process.env.TEMP+'\\xiantu_game.js','utf8');
function makeEnv(){
  function makeEl(tag){
    const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,tagName:tag||'DIV',
      classList:{add(){},remove(){},toggle(){}},
      set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},
      set textContent(v){this._txt=String(v)},get textContent(){return this._txt},
      appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},
      querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};
    return el;
  }
  const ids={};
  const document={
    getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},
    createElement(tag){return makeEl(tag)},
    querySelectorAll(sel){
      if(sel==='#panelBody button')return (ids['panelBody']&&ids['panelBody'].children)||[];
      if(sel==='#actions button')return (ids['actions']&&ids['actions'].children)||[];
      return [];
    }
  };
  const store={};
  const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
  const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
  vm.createContext(ctx);vm.runInContext(js,ctx);
  return {ctx,ids};
}
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}
// A. 旧档经 load() 兜底后死亡不崩溃（JSON 内联传入）
{
  const {ctx}=makeEnv();
  const old={name:'旧档',attrs:{str:5,agi:5,int:5,cha:5,wil:5},root:30,luck:30,realm:0,cult:50,hp:100,maxHp:100,stones:10,items:[],arts:[],mats:{},weapon:null,armor:null,trinket:null,sect:null,contrib:0,prof:null,profLevel:0,profExp:0,npcs:[],daoPartner:null,master:null,enemy:null,quests:{},merit:0,karma:0,pet:null,titles:[],seenE:{},seenI:{},wins:0,heartTrains:0,heartDemons:0,kills:0,age:16,years:0,days:0,pillBuff:0,temp:{break:0},flag:{}};
  vm.runInContext(`localStorage.setItem('xiantu_save_0',${JSON.stringify(JSON.stringify(old))}); S=load();`,ctx);
  vm.runInContext(`window.__err=''; try{ die('测试死亡'); }catch(e){ window.__err=e.message; }`,ctx);
  assert(vm.runInContext('window.__err===""&&S.endings.length===1&&S.deaths===1',ctx),'旧档 load 兜底后死亡结算正常');
}
// B. 切磋败而不死
{
  const {ctx}=makeEnv();
  vm.runInContext(`
    S=newState('测',BACKGROUNDS[0]); S.attrs={str:1,agi:1,int:5,cha:5,wil:5}; S.maxHp=calcMaxHp(S); S.hp=S.maxHp;
    S.npcs=[{name:'强者',role:'散修',desc:'',style:'str',favor:30,realm:5,atk:99,hp:500}]; S.flag={}; PENDING=0;
    npcDuel(0);
  `,ctx);
  assert(vm.runInContext('S.hp===1&&S.deaths===0',ctx),'切磋败北重伤不死亡（hp=1）');
  assert(vm.runInContext(`document.getElementById('ending').style.display!=='flex'`,ctx),'切磋败北未触发身陨');
  vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
  assert(vm.runInContext('S.npcs[0].favor>=33',ctx),'切磋落败仍有好感+3');
}
// C. 试炼塔败而不死
{
  const {ctx,ids}=makeEnv();
  vm.runInContext(`
    S=newState('测',BACKGROUNDS[0]); S.attrs={str:1,agi:1,int:5,cha:5,wil:5}; S.maxHp=calcMaxHp(S); S.hp=2;
    S.flag={}; S.realm=2; S.flag.tower=0; PENDING=0; doTower();
  `,ctx);
  function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
  function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
  lastChoices().children[0].onclick();
  vm.runInContext(`window._battleResolve&&window._battleResolve()`,ctx);
  assert(vm.runInContext('S.hp===1&&S.flag.tower===0&&S.deaths===0',ctx),'试炼塔败北重伤不死亡');
}
// D. 面板按钮 PENDING 锁
{
  const {ctx}=makeEnv();
  vm.runInContext(`
    S=newState('测',BACKGROUNDS[0]); S.flag={};
    const d=document.createElement('button'); d.id='pb1'; document.getElementById('panelBody').appendChild(d); window.__pb=d;
    PENDING=1; updatePendingUI(); window.__locked=window.__pb.disabled;
    PENDING=0; updatePendingUI(); window.__unlocked=!window.__pb.disabled;
  `,ctx);
  assert(vm.runInContext('window.__locked===true&&window.__unlocked===true',ctx),'面板按钮随 PENDING 锁定/解锁');
}
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);