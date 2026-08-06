/* v48 软重启缓冲冒烟：保留收藏/称号/关系，重置战力与资源 */
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

vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={};
  S.realm=17; S.cult=50000; S.stones=9999; S.attrs.str=30;
  S.titles=['t_quest_pomiao','zhuji']; S.seenI={筑基丹:2}; S.seenE={妖狼:1};
  S.npcs.forEach(n=>n.met=true);
  S.quest={main:{ch:2,step:1,done:['m0s0'],chDone:['ch0'],log:[{id:'ch0',title:'破庙惊变',summary:'x',at:0}]},side:{sq_pomiao:'done'},sideStep:{},sideDone:{}};
  PENDING=0; softReset();
  window.__realm=S.realm; window.__stones=S.stones; window.__cult=S.cult; window.__before=9999;
  window.__titles=S.titles.length; window.__seenI=Object.keys(S.seenI).length;
  window.__npcs=S.npcs.length; window.__quest=S.quest.main.chDone.length;
  window.__ending=document.getElementById('ending').style.display;
`,ctx);
assert(vm.runInContext('window.__realm===0&&window.__cult===0&&window.__stones>=0&&window.__stones<window.__before',ctx),'软重启重置战力与资源（境界 0 / 修为 0 / 灵石按新局发放）');
assert(vm.runInContext('window.__titles===2&&window.__seenI===1',ctx),'软重启保留称号与收藏图鉴');
assert(vm.runInContext('window.__npcs>0',ctx),'软重启保留已结识关系');
assert(vm.runInContext('window.__quest===1',ctx),'软重启保留主线剧情回顾');
assert(vm.runInContext('window.__ending!=="flex"',ctx),'软重启关闭结局画面');

// 软重启按钮存在于结局面板
vm.runInContext(`endEnding('测试结局','desc','stats'); window.__btns=document.getElementById('endingBox').innerHTML;`,ctx);
assert(vm.runInContext('window.__btns.indexOf("软重启")>=0',ctx),'结局面板提供软重启按钮');

console.log(fails===0?'smoke65: ALL PASS':'smoke65 FAILS: '+fails);
process.exit(fails?1:0);
