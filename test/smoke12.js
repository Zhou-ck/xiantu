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
function walk(el,fn){if(el.children)for(const c of el.children){fn(c);walk(c,fn)}}
function lastChoices(){let last=null;walk(ids['story'],el=>{if(String(el.className||'').indexOf('choices')>=0)last=el});return last}
function clickChoice(i){const g=lastChoices();if(!g||!g.children||!g.children[i])throw new Error('no choice '+i);g.children[i].onclick()}
assert(vm.runInContext('growChance(5,0.1)',ctx)>vm.runInContext('growChance(30,0.1)',ctx),'属性越高成长概率越低');
assert(Math.abs(vm.runInContext('growChance(60,0.1)',ctx)-0.025)<1e-9,'成长概率下限 0.25×基础');
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); S.attrs.str=40;`,ctx);
assert(vm.runInContext(`growAttr('str',0.9,'测试')`,ctx)==='','满 40 不再成长');
assert(vm.runInContext('S.attrs.str',ctx)===40,'40 上限守住');
vm.runInContext(`S.attrs.agi=5; S.items.push({name:'轻身丹',type:'consumable',quality:2,use:'agi'}); PENDING=0; consume(S.items.length-1)`,ctx);
assert(vm.runInContext('S.attrs.agi',ctx)===6,'轻身丹身法+1');
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]);
  for(const k in S.attrs)S.attrs[k]=10;
  S.root=50; S.luck=50; S.cult=14000; S.realm=0; S.kills=3;
  S.items=[{name:'筑基丹',type:'consumable',quality:2,use:'break'}];
  S.arts=[{name:'太乙剑诀',mult:1.2}];
  S.attrs.wil=40; S.heartDemons=0; S.temp={break:0};
  PENDING=0; tryBreak();
`,ctx);
for(let k=0;k<3;k++)clickChoice(0); /* 筑基心魔试炼 */
vm.runInContext(`PENDING=0; tryBreak();`,ctx);
for(let k=0;k<3;k++)clickChoice(0); /* 金丹心魔试炼 */
const r=vm.runInContext('S.realm',ctx);
const a=vm.runInContext('({str:S.attrs.str,agi:S.attrs.agi,int:S.attrs.int,cha:S.attrs.cha,wil:S.attrs.wil})',ctx);
assert(r>=10,'连破炼气+筑基+金丹（realm='+r+'）');
assert(a.str>=13&&a.agi>=13&&a.int>=12&&a.cha>=12&&a.wil>=11,'五维均随境界成长 '+JSON.stringify(a));
vm.runInContext(`S.days=0; S.cult=0; PENDING=0; doExplore('near')`,ctx);
console.log(fails===0?'ALL PASS':'FAILURES: '+fails);process.exit(fails?1:0);
