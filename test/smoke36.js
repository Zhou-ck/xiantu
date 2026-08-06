/* 3D 角色模型前置冒烟：模型键 / 插槽渲染 / 开关 / 档案接入 */
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
vm.createContext(ctx);
vm.runInContext(js,ctx);
let fails=0;
function assert(c,msg){if(!c){fails++;console.log('FAIL:',msg)}else console.log('ok  :',msg)}

// ---- T1 模型键
vm.runInContext(`
  S=newState('测试寅',BACKGROUNDS[0]);
`,ctx);
assert(vm.runInContext('charModelKey(S.npcs[0])',ctx)===vm.runInContext('MODEL_KEYS[S.npcs[0].role]',ctx),'NPC 角色映射模型键');
vm.runInContext('S.npcs[0].model="hero_x";',ctx);
assert(vm.runInContext('charModelKey(S.npcs[0])',ctx)==='hero_x','显式 model 优先');
// ---- T2 插槽渲染
assert(vm.runInContext('use3D()',ctx)===false,'3D 默认关闭');
const slot=vm.runInContext('modelSlotHtml({role:"散修剑客"})',ctx);
assert(slot.indexOf('data-model="npc_swordsman"')>=0,'插槽带模型键');
assert(vm.runInContext('modelSlotHtml({role:"无此角色"})',ctx)==='','无模型键返回空');
// ---- T3 角色卡开关行为
vm.runInContext('S.set.model3d=true;',ctx);
const card3d=vm.runInContext('characterCardHtml(S.npcs[0],{npc:true})',ctx);
assert(card3d.indexOf('model-slot')>=0,'开启后角色卡用 3D 插槽');
vm.runInContext('S.set.model3d=false;',ctx);
const card2d=vm.runInContext('characterCardHtml(S.npcs[0],{npc:true})',ctx);
assert(card2d.indexOf('art-img')>=0&&card2d.indexOf('model-slot')<0,'关闭后仍用立绘');
// ---- T4 档案接入模型键
vm.runInContext('S.set.model3d=false;',ctx);
assert(vm.runInContext('characterProfile(S.npcs[0]).identity.model',ctx)==='hero_x','档案含模型键');
// ---- T5 设置开关
vm.runInContext('setOpt("model3d"); panelSettings();',ctx);
assert(vm.runInContext('S.set.model3d',ctx)===true,'设置切换 3D 开');
const html=vm.runInContext('document.getElementById("panelBody").innerHTML',ctx);
assert(html.indexOf('3D 角色卡')>=0,'设置页含 3D 开关');

console.log(fails===0?'smoke36: ALL PASS':'smoke36 FAILS: '+fails);
process.exit(fails?1:0);
