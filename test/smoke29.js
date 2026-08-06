/* 宗门深化 Phase 2f 冒烟：自建宗门建筑真实加成（修炼/副业/战斗/灵田/灵兽/好感） */
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

// ---- T1 自建宗门 + 新设施补齐
vm.runInContext(`
  S=newState('测试己',BACKGROUNDS[0]);
  S.sect={id:'own',name:'青云宗'};
  S.flag.ownSect=true;
  S.flag.ownBuild={lingtian:0,danfang:0,qi:0,cangjing:0,shou:0,huike:0};
  ensureOwnBuild();
`,ctx);
assert(vm.runInContext('ownBuildLv("wuchang")',ctx)===0,'新设施演武场补齐');
assert(vm.runInContext('ownBuildLv("fuge")',ctx)===0,'新设施符阁补齐');
assert(vm.runInContext('ownSectCultMult()',ctx)===1,'藏经阁 0 级无加成');
// ---- T2 升级建筑（灵石+材料）
vm.runInContext(`
  S.stones=10000; S.mats={sherb:5,iron:5,jade:5};
  ownBuildUp('danfang'); ownBuildUp('cangjing');
`,ctx);
assert(vm.runInContext('S.flag.ownBuild.danfang',ctx)===1,'丹房升 1 级');
assert(vm.runInContext('S.flag.ownBuild.cangjing',ctx)===1,'藏经阁升 1 级');
assert(vm.runInContext('S.stones',ctx)===10000-150-200,'升级扣除灵石');
// ---- T3 加成真实生效
vm.runInContext(`
  S.flag.ownBuild.cangjing=3; S.flag.ownBuild.wuchang=2;
  S.flag.ownBuild.lingtian=2; S.flag.ownBuild.shou=1; S.flag.ownBuild.huike=2;
  S.flag.ownBuild.danfang=2;
`,ctx);
assert(Math.abs(vm.runInContext('ownSectCultMult()',ctx)-1.06)<1e-9,'藏经阁 3 级修炼 ×1.06');
assert(Math.abs(vm.runInContext('ownSectCombatMult()',ctx)-1.04)<1e-9,'演武场 2 级战斗 ×1.04');
assert(vm.runInContext('ownSectHarvestBonus()',ctx)===2,'灵田 2 级收获 +2');
assert(Math.abs(vm.runInContext('ownSectPetBonus()',ctx)-1.2)<1e-9,'灵兽园 1 级成长 ×1.2');
assert(vm.runInContext('ownSectFavorBonus()',ctx)===2,'会客厅 2 级好感 +2');
assert(vm.runInContext('ownSectCraftBonus("alchemy")',ctx)===2,'丹房 2 级炼丹判定 +2');
// ---- T4 灵石不足拦截
vm.runInContext('S.stones=0; ownBuildUp("danfang");',ctx);
assert(vm.runInContext('S.flag.ownBuild.danfang',ctx)===2,'灵石不足不升级');
// ---- T5 会客厅好感加成
vm.runInContext('S.npcs[0].favor=20; favorChange(S.npcs[0],5,"test");',ctx);
assert(vm.runInContext('S.npcs[0].favor',ctx)===27,'会客厅正向好感 +2 生效');
// ---- T6 面板
const html=vm.runInContext('ownSectHtml()',ctx);
assert(html.indexOf('自建宗门')>=0,'自建宗门面板');
assert(html.indexOf('演武场')>=0&&html.indexOf('符阁')>=0&&html.indexOf('阵台')>=0,'面板列出全部设施');
assert(html.indexOf('Lv.2')>=0,'面板显示建筑等级');
// ---- T7 旧档补齐
vm.runInContext(`
  S.flag.ownBuild={lingtian:1};
  ensureOwnBuild();
`,ctx);
assert(vm.runInContext('S.flag.ownBuild.lingtian',ctx)===1&&vm.runInContext('ownBuildLv("zhentai")',ctx)===0,'旧档补齐新设施且保留旧等级');

console.log(fails===0?'smoke29: ALL PASS':'smoke29 FAILS: '+fails);
process.exit(fails?1:0);
