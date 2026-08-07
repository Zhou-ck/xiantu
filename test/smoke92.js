/* v66 对话演出 + 图标细化 + 战斗受击冒烟 */
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

vm.runInContext(`S=newState('测试',BACKGROUNDS[0]); PENDING=0;`,ctx);

// T1 聊天式对话：人物头 + 气泡 + 选项气泡
vm.runInContext(`talkModal('💬 对话',talkHead({name:'苏婉',role:'采药女',gender:'女'},'采药女 · ♀'),[{html:'<b>你好</b>'},{html:'道友请了。',typing:true,id:'talkLine0'}],[{txt:'就此别过',fn:()=>{}}]); window.__tm=document.getElementById('panelBody')._html;`,ctx);
const tm=vm.runInContext('window.__tm',ctx);
assert(tm.indexOf('talk-wrap')>=0&&tm.indexOf('talk-head')>=0,'聊天式对话含对话区与人物头');
assert(tm.indexOf('talk-avatar')>=0&&tm.indexOf('苏婉')>=0,'人物头含立绘头像与名字');
assert(tm.indexOf('talk-bubble')>=0&&tm.indexOf('talk-typing')>=0,'对话气泡渲染（含打字机位）');
assert(tm.indexOf('talk-choices')>=0&&tm.indexOf('talk-btn')>=0&&tm.indexOf('就此别过')>=0,'选项气泡渲染');

// T2 人际对话菜单升级为聊天式
vm.runInContext(`{ S.npcs=[{name:'苏婉',role:'采药女',gender:'女',desc:'灵秀女子。',favor:50,mood:70,stage:1,cd:{}}]; npcDialog(0); window.__nd=document.getElementById('panelBody')._html; }`,ctx);
const nd=vm.runInContext('window.__nd',ctx);
assert(nd.indexOf('talk-wrap')>=0&&nd.indexOf('talk-avatar')>=0&&nd.indexOf('闲聊')>=0&&nd.indexOf('就此别过')>=0,'NPC 对话菜单聊天式呈现');

// T3 物品/功法图标细化
assert(vm.runInContext("itemIcon({name:'回春丹',type:'consumable'})",ctx)==='🌿','物品按名细化图标（回春丹→🌿）');
assert(vm.runInContext("itemIcon({name:'火云剑',type:'weapon',elem:'fire'})",ctx)==='🔥','五行法器用属性图标');
assert(vm.runInContext("artIcon({name:'甲',grade:4})",ctx)==='📗','功法按品阶图标（天阶→📗）');
assert(vm.runInContext("artIcon({name:'乙',grade:1,elem:'wood'})",ctx)==='🌿','五行功法用属性图标');

// T4 战斗受击演出接线
const combat=fs.readFileSync(path.join(root,'js','systems','combat.js'),'utf8');
assert(combat.indexOf('function bfigHit(')>=0&&combat.indexOf("bfigHit('enemy')")>=0&&combat.indexOf("bfigHit('player')")>=0,'战斗受击演出已接线');
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.bfig.hit')>=0&&css.indexOf('@keyframes bfigHit')>=0,'受击闪红动画存在');
assert(css.indexOf('.talk-bubble')>=0&&css.indexOf('.talk-choices .talk-btn')>=0,'对话气泡样式存在');

// T5 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='90','版本号 v90');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke92: ALL PASS':'smoke92 FAILS: '+fails);
process.exit(fails?1:0);
