/* v70 剧情台词条（视觉小说式演出）冒烟 */
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

// T1 台词条：说话人立绘 + 引文气泡 + 动作描述
vm.runInContext(`window.__s1=storyLineHtml('神秘道人缓缓开口：「天机不可泄。」随即拂袖而去');`,ctx);
const s1=vm.runInContext('window.__s1',ctx);
assert(s1.indexOf('sl-speaker')>=0&&s1.indexOf('daoist.jpg')>=0,'台词条识别说话人并带立绘');
assert(s1.indexOf('sl-quote')>=0&&s1.indexOf('天机不可泄')>=0,'台词引文渲染为气泡');
assert(s1.indexOf('sl-pre')>=0&&s1.indexOf('sl-post')>=0,'动作描写前后缀分离');
assert(vm.runInContext("storyLineHtml('你独自跋涉在荒山之上。')",ctx).indexOf('sl-text')>=0,'无引文台词走正文样式');

// T2 剧情演出整体：场景横幅 + 台词条入故事流
vm.runInContext(`PENDING=0; runStoryLines('遭遇战 · 破庙惊变',['神秘道人立于残碑前：「此物与你有缘。」','你心头微震，俯身拾起半卷残页。'],[]); window.__st=document.getElementById('story')._html;`,ctx);
const st=vm.runInContext('window.__st',ctx);
assert(st.indexOf('story-stage')>=0&&st.indexOf('scn-thumb')>=0,'剧情标题为场景横幅（带缩略章）');
assert(st.indexOf('story-line')>=0&&st.indexOf('sl-quote')>=0&&st.indexOf('此物与你有缘')>=0,'剧情台词以台词条入流');

// T3 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='75','版本号 v75');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke96: ALL PASS':'smoke96 FAILS: '+fails);
process.exit(fails?1:0);
