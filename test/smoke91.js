/* v65 图形化升级冒烟：统一品质卡（行囊/坊市/功法）+ 剧情人物栏 + 战斗形象 */
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

// T1 统一品质卡：品质框 + 五行图标 + 品阶标签 + 底部按钮区
vm.runInContext(`window.__c=itemCardHtml({name:'火云剑',type:'weapon',quality:2,elem:'fire',desc:'火属性灵剑。'},'<button>购</button>');`,ctx);
const card=vm.runInContext('window.__c',ctx);
assert(card.indexOf('qcard qc2')>=0&&card.indexOf('qcard-elem')>=0,'品质卡含 qc2 边框与五行样式');
assert(card.indexOf('qcard-ico')>=0&&card.indexOf('🔥')>=0,'品质卡含图标区与火系图标');
assert(card.indexOf('qtag')>=0&&card.indexOf('宝品')>=0,'品质卡含品阶标签（品质2=宝品）');
assert(card.indexOf('qcard-foot')>=0&&card.indexOf('<button>购</button>')>=0,'品质卡底部按钮区保留');

// T2 行囊 / 坊市 / 洞府功法参悟 全部走统一卡片
vm.runInContext(`S.items.push({name:'回春丹',type:'consumable',quality:1,desc:'服之气血尽复。',use:'heal',count:2}); panelInventory(); window.__inv=document.getElementById('panelBody')._html;`,ctx);
const inv=vm.runInContext('window.__inv',ctx);
assert(inv.indexOf('qcard')>=0&&inv.indexOf('回春丹')>=0&&inv.indexOf('使用')>=0,'行囊物品卡面化且保留使用/出售');
vm.runInContext(`panelMarket(); window.__mk=document.getElementById('panelBody')._html;`,ctx);
const mk=vm.runInContext('window.__mk',ctx);
assert(mk.indexOf('qcard')>=0&&mk.indexOf('购 · ')>=0,'坊市商品卡面化且保留购买按钮');
vm.runInContext(`panelRest(); window.__rst=document.getElementById('panelBody')._html;`,ctx);
const rst=vm.runInContext('window.__rst',ctx);
assert(rst.indexOf('qcard')>=0&&rst.indexOf('功法参悟')>=0,'洞府功法参悟卡面化');

// T3 剧情人物栏 + 场景缩略章
vm.runInContext(`window.__bar=storyCastBar(['神秘道人']);`,ctx);
const bar=vm.runInContext('window.__bar',ctx);
assert(bar.indexOf('cast-cell')>=0&&bar.indexOf('cast-img')>=0&&bar.indexOf('assets/portraits/daoist.jpg')>=0,'剧情人物栏渲染立绘');
vm.runInContext(`PENDING=0; runStoryLines('遭遇战 · 荒坟',['一位神秘道人立于坟前。'],[]); window.__st=document.getElementById('story')._html;`,ctx);
const st=vm.runInContext('window.__st',ctx);
assert(st.indexOf('scn-thumb')>=0,'故事标题带场景缩略章');
assert(st.indexOf('cast-cell')>=0&&st.indexOf('神秘道人')>=0,'故事台词识别角色并渲染登场栏');

// T4 战斗形象：已知敌人立绘 / 未知敌人五行头像 / 主角立绘
assert(vm.runInContext("enemyFigHtml({name:'荒坟厉鬼',elem:'dark'})",ctx).indexOf('bfig-has')>=0,'已知敌人显示立绘框');
assert(vm.runInContext("enemyFigHtml({name:'无名妖兽',elem:'fire'})",ctx).indexOf('bfig-emoji')>=0,'未知敌人五行头像兜底');
assert(vm.runInContext('playerFigHtml(S)',ctx).indexOf('bfig-has')>=0,'主角战斗形象使用立绘');
const combat=fs.readFileSync(path.join(root,'js','systems','combat.js'),'utf8');
assert(combat.indexOf("$('bEnemyFig')")>=0&&combat.indexOf("$('bPlayerFig')")>=0,'战斗接线设置敌我形象插槽');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('id="bEnemyFig"')>=0&&html.indexOf('id="bPlayerFig"')>=0,'战斗壳含敌我形象插槽');
assert(html.indexOf('panel-seal')>=0,'面板标题带印章');

// T5 版本同步
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(vm.runInContext('GAME_VERSION',ctx)==='71','版本号 v71');
assert(sw.indexOf('xiantu2-v'+vm.runInContext('GAME_VERSION',ctx))>=0,'SW 缓存名与版本号同步');

console.log(fails===0?'smoke91: ALL PASS':'smoke91 FAILS: '+fails);
process.exit(fails?1:0);
