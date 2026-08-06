/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 世界观数据 ================
====================================================== */
'use strict';
/* ================= 世界观数据 ================= */
const THRESHOLDS=[0,100,200,300,400,500,600,700,800,1000,1500,2000,2500,3000,4250,5500,6750,8000,11000,14000,17000,20000,27500,35000,42500,50000,62500,75000,87500,100000,125000,150000,175000,200000,275000,350000,425000,500000,625000,750000,875000,1000000];
const REALMS=['炼气一层','炼气二层','炼气三层','炼气四层','炼气五层','炼气六层','炼气七层','炼气八层','炼气九层','筑基前期','筑基中期','筑基后期','筑基圆满','金丹前期','金丹中期','金丹后期','金丹圆满','元婴前期','元婴中期','元婴后期','元婴圆满','化神前期','化神中期','化神后期','化神圆满','炼虚前期','炼虚中期','炼虚后期','炼虚圆满','合体前期','合体中期','合体后期','合体圆满','大乘前期','大乘中期','大乘后期','大乘圆满','渡劫前期','渡劫中期','渡劫后期','渡劫圆满','仙人'];
const LIFESPANS=[100,100,100,100,100,100,100,100,100,200,200,200,200,400,400,400,400,800,800,800,800,1600,1600,1600,1600,3200,3200,3200,3200,6400,6400,6400,6400,12800,12800,12800,12800,30000,30000,30000,30000,Infinity];
const WIL_REQ=[0,0,0,0,0,0,0,0,0,15,0,0,0,18,0,0,0,20,0,0,0,22,0,0,0,25,0,0,0,28,0,0,0,30,0,0,0,32,0,0,0,32];
const DIFFS=[0,0,0,0,0,0,0,0,0,23,0,0,0,27,0,0,0,30,0,0,0,33,0,0,0,36,0,0,0,39,0,0,0,42,0,0,0,46,0,0,0,46];
const BIG_KEYS=[9,13,17,21,25,29,33,37,41];
function isBigBreak(n){return BIG_KEYS.indexOf(n)>=0}
function bigStage(r){return r<=8?0:r<=12?1:r<=16?2:r<=20?3:r<=24?4:r<=28?5:r<=32?6:r<=36?7:r<=40?8:9}
const STAGE_NAMES=['炼气期','筑基期','金丹期','元婴期','化神期','炼虚期','合体期','大乘期','渡劫期','仙人'];
function stageName(st){return STAGE_NAMES[clamp(st||0,0,9)]}
function powR(r){if(r<=8)return r;const b=bigStage(r);const base=[0,9,13,17,21,25,29,33,37,41][b];return base+(r-base)/4}
function rl(){return powR(S.realm)}
const QNAMES=['凡品','灵品','宝品','仙品','神品'];
const ATTR_NAMES={str:'力量',agi:'身法',int:'智慧',cha:'魅力',wil:'心性'};
/* 炼气层小境界的属性成长节点（炼气三层/五层/七层/九层） */
const LAYER_ATTRS={2:'str',4:'agi',6:'int',8:'cha'};
/* 大境界硬性门槛（缺一不可，未满足则无法冲击） */
const BREAK_REQS={
  9:[
    {desc:'筑基丹 ×1（凝炼丹基，坊市可购 500 灵石）',has:()=>S.items.some(i=>i.name==='筑基丹'),go:'market'},
    {desc:'一门完整功法（功法倍率 ≥1.15。拜师、入宗门、遗迹传承可得）',has:()=>S.arts.some(a=>a.mult>=1.15),go:'social'},
  ],
  13:[
    {desc:'妖丹 ×1，或以三场恶战淬炼气血（斩敌 ≥3）',has:()=>(S.mats.demonCore||0)>=1||S.kills>=3,go:'explore'},
  ],
  17:[
    {desc:'魂物温养神魂：寒玉 ×1（坊市/地脉可得），或装备一件宝品以上佩饰',has:()=>(S.mats.jade||0)>=1||(S.trinket&&S.trinket.quality>=2),go:'craft'},
  ],
  21:[
    {desc:'声望卓著：宗门长老（晋升至长老阶）、功德 ≥100、或称号 ≥3',has:()=>(S.sect&&rankIdx(S)>=4)||S.merit>=100||S.titles.length>=3,go:'sect'},
  ],
  25:[
    {desc:'道心圆满：心魔无烙印，且顿悟 ≥2（外出历练、论道、秘境皆有顿悟之机）',has:()=>S.heartDemons<=0&&(S.flag.insights||0)>=2,go:'cult'},
  ],
  29:[
    {desc:'身心合一：有道侣相伴，或有灵兽随行',has:()=>!!S.daoPartner||!!S.pet,go:'social'},
  ],
  33:[
    {desc:'功德 ≥150（或以业力 ≥150 魔证道）',has:()=>S.merit>=150||S.karma>=150,go:'market'},
  ],
  37:[
    {desc:'功德 ≥300（或以业力 ≥300 问心）——成仙劫前，须先问本心',has:()=>S.merit>=300||S.karma>=300,go:'market'},
  ],
};
const BREAK_GO_MAP={
  market:['🏮 坊市',()=>panelMarket()],
  explore:['🗺️ 外出探索',()=>panelExplore()],
  social:['🤝 人际往来',()=>panelSocial()],
  craft:['🔨 副业炼制',()=>panelCraft()],
  sect:['🏯 宗门',()=>panelSect()],
  cult:['🧘 闭关静修',()=>panelCult()],
  bag:['🎒 行囊',()=>panelInventory()],
};

const SURNAMES=['林','苏','叶','楚','沈','萧','秦','顾','白','陆','洛','风','韩','柳','云','莫','姜','温'];
const GIVEN=['尘','玄','云','凡','清','远','寒','渊','澈','澜','舟','诀','瑶','凝','霜','照','行','逸','岚','鸢','砚','辞','沧','明','归','霄','隐','泉','渺','怀'];
const GIVEN_F=['瑶','凝','霜','岚','鸢','婉','晴','雪','芷','若','薇','萱','菱','汐','音','琼','婠','烟','蝶','黛','嫣','慕','怜','裳','瑶','绫','汐','荷','萱','樱'];
function randomName(gender){
  const pool=(gender==='女'?GIVEN_F:GIVEN);
  return pick(SURNAMES)+pick(pool)+(chance(0.45)?pick(pool):'');
}
/* 去重命名：生成人名时避开当前江湖中已出现的名字，杜绝「重名」 */
function usedNameSet(extra){
  const set={};
  const add=a=>{if(a&&a.name)set[a.name]=1};
  if(S){
    add(S);
    (S.npcs||[]).forEach(add);
    (S.sectNpcs||[]).forEach(add);
    (S.children||[]).forEach(add);
    (S.disciples||[]).forEach(add);
    (S.affairs||[]).forEach(add);
    add(S.daoPartner);add(S.master);add(S.companion);
  }
  if(extra)for(const n of extra)add(typeof n==='string'?{name:n}:n);
  return set;
}
function uniqueName(gender,used){
  const set=used||usedNameSet();
  for(let i=0;i<40;i++){
    const n=randomName(gender);
    if(!set[n]){set[n]=1;return n}
  }
  const n=randomName(gender);set[n]=1;return n;
}
/* 子嗣头像：内嵌 SVG 幼童立绘（襁褓→幼童→少年），避免新生儿显示成人立绘 */
function childAvatar(gender,stage){
  const girl=gender==='女';
  const hair=girl?'#33202e':'#1f1b28';
  const robe=girl?'#c98ab0':'#7f9fc9';
  const eye=girl?'#3a2f45':'#33415c';
  const age=clamp(stage||0,0,3);
  const label=age===0?'襁褓':age===1?'幼童':age===2?'少年':'及冠';
  return '<svg class="child-avatar" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+label+'">'+
    '<circle cx="40" cy="40" r="38" fill="#efe0c8"/>'+
    (girl
      ?'<circle cx="26" cy="16" r="8" fill="'+hair+'"/><circle cx="54" cy="16" r="8" fill="'+hair+'"/>'
      :'<circle cx="40" cy="13" r="9" fill="'+hair+'"/>')+
    '<circle cx="40" cy="40" r="17" fill="#f7d6b4"/>'+
    '<path d="M27 43 Q40 35 53 43 L50 49 Q40 43 30 49 Z" fill="'+hair+'"/>'+
    '<ellipse cx="33" cy="40" rx="2.1" ry="2.7" fill="'+eye+'"/><ellipse cx="47" cy="40" rx="2.1" ry="2.7" fill="'+eye+'"/>'+
    '<path d="M36 48 Q40 51 44 48" stroke="#b8766a" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    '<path d="M17 59 Q40 69 63 59 L65 75 Q40 79 15 75 Z" fill="'+robe+'"/>'+
    '<path d="M40 55 L40 67" stroke="#fff" stroke-width="1.5" opacity=".45"/>'+
    '<text x="40" y="76" text-anchor="middle" font-size="8" fill="#8a7456">'+label+'</text>'+
    '</svg>';
}

const BACKGROUNDS=[
  /* —— 男修身份池（7 位）—— */
  {id:'orphan',name:'散修遗孤',gender:'男',desc:'你自小便被遗弃在破庙之中，靠山中野果与猎户残羹长大。师门无人问，万事皆独行。',mods:{agi:2},stones:60,art:{name:'基础吐纳诀',mult:1.0,desc:'最平实的引气法门，胜在根基稳固。'},traits:[{id:'wild',name:'野外生存',desc:'探索时更容易发现灵草与捷径'}]},
  {id:'villager',name:'放牛少年',gender:'男',desc:'你本是青山村放牛的少年，某夜见流星坠于后山，从此心潮难平，立志寻仙。',mods:{wil:3},stones:80,art:{name:'村野导引术',mult:1.0,desc:'乡野流传的粗浅吐纳，却养出了一副赤子心性。'},traits:[{id:'luckUp',name:'赤子之心',desc:'机缘判定额外 +5'}]},
  {id:'general',name:'将门之后',gender:'男',desc:'你父辈是戍守北境的武将，家中藏有半卷从战场废墟中拾得的兵家炼体术。',mods:{str:2},stones:100,art:{name:'军中锻体诀',mult:1.1,desc:'以气血养真元，勇烈之气冲霄。'},traits:[{id:'combat',name:'战斗本能',desc:'战斗中攻击判定 +2'}]},
  {id:'hunter',name:'猎户之子',gender:'男',desc:'你自小随父进山打猎，弓马娴熟，比寻常人更懂山林的脾性。',mods:{agi:2},stones:70,art:{name:'猎风诀',mult:1.05,desc:'以山林之风淬体，疾如鹰隼。'},traits:[{id:'wild',name:'山林野性',desc:'探索时更易避开凶险'},{id:'combat',name:'战斗本能',desc:'战斗中攻击判定 +2'}]},
  {id:'merchant',name:'商贾之子',gender:'男',desc:'你家中世代行商，耳濡目染皆是算盘与门路。爹娘只盼你平安，你心里却装着更大的买卖。',mods:{cha:1},stones:200,art:{name:'聚财引灵诀',mult:1.0,desc:'商道即仙道，和气生财。'},traits:[{id:'merchant',name:'经商头脑',desc:'坊市购物九折，售物溢价'}]},
  {id:'smith',name:'铁匠之子',gender:'男',desc:'你家三代打铁，炉火映红了你的少年时代。有人说铁匠的手握不住剑，你不信。',mods:{str:1},stones:80,art:{name:'打铁炼体功',mult:1.05,desc:'千锤百炼，肉身如铁。'},traits:[{id:'smith',name:'炉火纯青',desc:'炼器判定 +2，初始携带铁矿石'}]},
  {id:'priest',name:'巫祝之后',gender:'男',desc:'你家世代为荒村守庙，通阴阳、问鬼神。村人敬你三分，也畏你三分。',mods:{wil:2},stones:50,art:{name:'幽冥巫诀',mult:1.1,desc:'祖上传下的通幽之术，与九幽有缘。'},traits:[{id:'dark2',name:'通幽之体',desc:'魔道功法加成，正道接纳 -10'}]},
  /* —— 女修身份池（7 位）—— */
  {id:'family',name:'世家嫡女',gender:'女',desc:'你出身没落的修仙世家，祠堂里供着三百年前的先祖画像。家族虽败，底蕴犹存。',mods:{int:1,cha:1},stones:160,art:{name:'祖传引灵诀',mult:1.3,desc:'世代相传的引灵之术，暗合祖上灵根。'},traits:[{id:'blood',name:'血脉传承',desc:'每突破大境界额外获得少量属性'}]},
  {id:'yao',name:'狐血少女',gender:'女',desc:'你体内流着一半狐族之血，自幼被视作异类。灵根天成，却也因此为世所不容。',mods:{},root:10,stones:50,art:{name:'妖族本命术',mult:1.2,desc:'血脉中传承的本命吐纳，与天地妖气相合。'},traits:[{id:'yao',name:'妖族血脉',desc:'灵根 +10，但正道宗门接纳度降低'}]},
  {id:'pharmacy',name:'药庐少女',gender:'女',desc:'你自幼在药庐长大，替师父晾晒了十年草药。手上药香，便是你与修真界最早的缘分。',mods:{int:1},stones:90,art:{name:'百草经',mult:1.05,desc:'识百草、辨药性，丹道之门自此而开。'},traits:[{id:'herb',name:'百草通识',desc:'采药收获更多，炼丹判定 +2'}]},
  {id:'exile',name:'落难千金',gender:'女',desc:'你父辈获罪流放，满门离散。你流落市井，见惯了人情冷暖，也练就了一副玲珑心肠。',mods:{cha:2},stones:120,art:{name:'寒门养气诀',mult:1.0,desc:'家道中落，唯此诀不堕门风。'},traits:[{id:'exile',name:'戴罪之身',desc:'正道接纳度 -20，暗处或有仇家伺机而动'}]},
  {id:'scholar',name:'书香才女',gender:'女',desc:'你十年寒窗，本欲以才学立身，却在一夜之间读懂了藏书楼深处那卷无人问津的残经。',mods:{int:2},stones:60,art:{name:'浩然正气诀',mult:1.1,bonus:{int:1},desc:'读书养气，浩然长存。'},traits:[{id:'scholar',name:'书生意气',desc:'阵法与符箓炼制 +2，正道接纳 +10'}]},
  {id:'healer',name:'杏林医女',gender:'女',desc:'你随祖父行医多年，药箱里装过伤兵，也装过垂死的妖。医者仁心，是你刻进骨子的底色。',mods:{wil:1,int:1},stones:90,art:{name:'悬壶济世诀',mult:1.05,desc:'医者仁心，气机中正平和。'},traits:[{id:'healer',name:'岐黄妙手',desc:'丹药疗伤效果提升'}]},
  {id:'demon',name:'魔窟遗孤',gender:'女',desc:'你生自血魔宗外门，襁褓中便被弃于乱葬岗。暗属性亲和天成，却背负着洗不净的出身。',mods:{int:2},stones:70,art:{name:'血影残诀',mult:1.2,desc:'残缺的魔道功法，运转时血气翻涌。'},traits:[{id:'dark',name:'暗属性亲和',desc:'魔道功法加成，正道宗门接纳度大幅降低'}]},
];

const STARTER_ITEMS=[
  {name:'锈迹斑斑的青铜短剑',type:'weapon',quality:0,bonus:1,desc:'剑刃斑驳，却隐隐透着寒光，似曾饮血。'},
  {name:'青玉药葫芦',type:'trinket',quality:1,bonus:0,desc:'不知来历的葫芦，可温养丹药，微有灵气。'},
  {name:'半枚残破玉佩',type:'armor',quality:1,bonus:1,desc:'触手生温，半枚断裂处光滑如镜。'},
  {name:'朱砂符纸三张',type:'consumable',quality:0,count:3,desc:'墨迹未干，画符者应已仙去。'},
  {name:'黑铁药锄',type:'tool',quality:0,bonus:1,desc:'农家之物，采药时格外顺手。'},
  {name:'无字木牌',type:'trinket',quality:2,bonus:0,desc:'木牌无字，深处似有暗纹，隐藏着一段因果。'},
];

const SECTS=[
  {id:'sword',name:'剑宗',desc:'万剑归宗，以杀证道。弟子佩剑而行，锋芒毕露。',pref:'str',tag:'剑',
   art:{name:'太乙剑诀',mult:1.2,bonus:{str:1},desc:'剑宗绝学，剑气纵横三千里。'},
   people:[
     {role:'传功弟子',name:'韩青',gender:'男',title:'剑宗传功师兄',desc:'入门十年的师兄，负责带新弟子过剑庐三关。',stage:2},
     {role:'长老',name:'风无涯',gender:'男',title:'执剑长老',desc:'一剑曾斩落妖王头颅，惜才如命，最爱指点后辈剑理。',stage:5},
     {role:'掌门',name:'顾长歌',gender:'男',title:'剑宗掌门',desc:'剑道通神，一言九鼎。欲见其面，须为门中翘楚。',stage:8}]},
  {id:'dan',name:'丹宗',desc:'丹火千年不熄，一粒丹药可活死人。',pref:'int',tag:'丹',
   art:{name:'丹火诀',mult:1.15,bonus:{int:1},desc:'丹宗秘法，以丹火淬炼真元。'},
   people:[
     {role:'传功弟子',name:'苏晚晴',gender:'女',title:'丹房传功师姐',desc:'丹房大师姐，最擅辨识火候，对新人极有耐心。',stage:2},
     {role:'长老',name:'云瑶',gender:'女',title:'丹鼎长老',desc:'一炉九转还魂丹名动修真界，收徒极严。',stage:5},
     {role:'掌门',name:'柳含烟',gender:'女',title:'丹宗掌门',desc:'丹道宗师，慈眉善目，宗门上下皆称「柳祖」。',stage:8}]},
  {id:'fu',name:'符宗',desc:'一笔一画皆天道，符箓三千镇山河。',pref:'int',tag:'符',
   art:{name:'太乙符经',mult:1.15,bonus:{int:1},desc:'符宗秘典，一笔勾动天地灵气。'},
   people:[
     {role:'传功弟子',name:'白砚',gender:'女',title:'符堂传功师姐',desc:'画符三千张方入门径，最懂新人落笔之苦。',stage:2},
     {role:'长老',name:'钟离墨',gender:'男',title:'符阁长老',desc:'以符入道百年，笔下符箓能镇山河。',stage:5},
     {role:'掌门',name:'葛玄机',gender:'男',title:'符宗掌门',desc:'参悟天书残页而得道，行事神鬼莫测。',stage:8}]},
  {id:'zhen',name:'阵宗',desc:'以天地为棋盘，以灵脉为落子。',pref:'int',tag:'阵',
   art:{name:'周天星斗阵诀',mult:1.15,bonus:{int:1},desc:'阵宗秘法，布阵者与天地共鸣。'},
   people:[
     {role:'传功弟子',name:'陆衍',gender:'男',title:'阵堂传功师兄',desc:'观星十年，最喜拉着新人推演残阵。',stage:2},
     {role:'长老',name:'沈清霜',gender:'女',title:'守阵长老',desc:'一人镇守护山大阵三百年，阵法造诣深不可测。',stage:5},
     {role:'掌门',name:'闻人照',gender:'男',title:'阵宗掌门',desc:'以九宫为骨、八卦为魂，胸中自有丘壑。',stage:8}]},
  {id:'ti',name:'体宗',desc:'肉身成圣，拳镇山河，不假外物。',pref:'str',tag:'体',
   art:{name:'龙象体诀',mult:1.2,bonus:{str:2},desc:'体宗镇派锻体术，力可拔山。'},
   people:[
     {role:'传功弟子',name:'石猛',gender:'男',title:'体院传功师兄',desc:'扛着千斤石锁跑山十年，皮糙肉厚，讲义气。',stage:2},
     {role:'长老',name:'铁骨真人',gender:'男',title:'炼体长老',desc:'肉身可硬撼法宝，收徒只问一句「敢不敢挨打」。',stage:5},
     {role:'掌门',name:'罗刹女',gender:'女',title:'体宗掌门',desc:'以女儿身炼成不灭金身，拳碎山河。',stage:8}]},
];
const DARK_SECTS=[
  {id:'blood',name:'血魔宗',desc:'以血养气，以杀证道。',dark:true,art:{name:'血河真经',mult:1.35,bonus:{str:1},desc:'血魔宗镇派功法，气血即是修为。'},
   people:[
     {role:'传功弟子',name:'血燕',gender:'女',title:'血池传功师姐',desc:'在血池泡了十年，教新人最基础的吸血养气之法。',stage:2},
     {role:'长老',name:'血屠',gender:'男',title:'血魔长老',desc:'杀人如麻，唯独对看得顺眼的后辈不吝指点。',stage:5},
     {role:'掌门',name:'血河老祖',gender:'男',title:'血魔宗宗主',desc:'千年老魔，血河一怒，千里伏尸。',stage:8}]},
  {id:'gu',name:'万蛊门',desc:'养蛊噬魂，万毒缠身。',dark:true,art:{name:'万蛊诀',mult:1.3,bonus:{wil:1},desc:'以蛊养气，毒亦成道。'},
   people:[
     {role:'传功弟子',name:'虫二',gender:'男',title:'蛊房传功师兄',desc:'脸上永远挂着人畜无害的笑，袖里藏着十七条蛊虫。',stage:2},
     {role:'长老',name:'蛊婆婆',gender:'女',title:'万蛊长老',desc:'养蛊百年，连本命蛊都老成了精。',stage:5},
     {role:'掌门',name:'毒后',gender:'女',title:'万蛊门主',desc:'一颦一笑皆是毒，天下蛊修俯首。',stage:8}]},
  {id:'you',name:'幽冥教',desc:'幽冥鬼火，生死逆转。',dark:true,art:{name:'幽冥引',mult:1.3,bonus:{wil:1},desc:'借九幽之气修炼，寿元深厚。'},
   people:[
     {role:'传功弟子',name:'鬼灯',gender:'女',title:'幽冥传功师姐',desc:'掌一盏青灯行走阴阳两界，教新人引幽冥之气。',stage:2},
     {role:'长老',name:'无常',gender:'男',title:'幽冥长老',desc:'半人半鬼，说话总带着阴风。',stage:5},
     {role:'掌门',name:'冥君',gender:'男',title:'幽冥教主',desc:'坐镇九幽深处，生死簿上勾一笔，阳寿便短一截。',stage:8}]},
];
/* 宗门晋升体系：境界门槛 + 贡献点（贡献点只用于晋升，购物另用贡献值） */
const SECT_RANKS=[
  {n:'外门弟子',minStage:0,point:0},
  {n:'内门弟子',minStage:1,point:200},
  {n:'核心弟子',minStage:2,point:800},
  {n:'真传弟子',minStage:3,point:2000},
  {n:'长老',minStage:4,point:5000},
  {n:'宗主',minStage:6,point:15000},
];
/* 显式晋升：贡献点与境界达标后，手动冲击下一阶领取职位与晋升礼；贡献点只用于定阶，不扣除、不因购物下降 */
function rankIdx(s){if(!s.sect)return -1;return clamp(s.rank||0,0,SECT_RANKS.length-1)}
function secRank(s){if(!s.sect)return '';return SECT_RANKS[rankIdx(s)].n}
function nextRankInfo(s){const idx=rankIdx(s);return idx>=SECT_RANKS.length-1?null:SECT_RANKS[idx+1]}
function sectCultBonus(s){const idx=rankIdx(s);return [0,0.05,0.10,0.15,0.20,0.25][idx]||0}
function rankEligible(s,r){
  if(!r)return true;
  return s.contrib>=r.point&&bigStage(s.realm)>=r.minStage&&rankIdx(s)===SECT_RANKS.indexOf(r)-1;
}

const ARTS=[
  {name:'清心诀',grade:1,elem:'wood',mult:1.05,bonus:{wil:1},desc:'木属清心法门，静心凝神，可助抵御心魔。'},
  {name:'大衍诀',grade:1,elem:'earth',mult:1.05,bonus:{int:1},desc:'土属推演之术，观星望气，参悟大道。'},
  {name:'太乙剑诀',grade:3,elem:'metal',mult:1.2,bonus:{str:1},desc:'金属剑宗绝学，剑气纵横三千里。'},
  {name:'丹火诀',grade:2,elem:'fire',mult:1.15,bonus:{int:1},desc:'火属丹宗秘法，以丹火淬炼真元。'},
  {name:'遁光术',grade:2,elem:'water',mult:1.1,bonus:{agi:1},desc:'水属身法绝学，御光而行，流转不息。'},
  {name:'龙象体诀',grade:3,elem:'earth',mult:1.2,bonus:{str:2},desc:'土属镇派锻体术，力可拔山，厚重如山。'},
  {name:'心魔淬体功',grade:3,elem:'thunder',mult:1.25,bonus:{wil:2},desc:'雷属凶险法门，以心魔为薪，淬炼道心。'},
  {name:'熔火真解',grade:3,elem:'fire',mult:1.2,bonus:{str:1},desc:'火属攻伐秘典，真元如熔岩奔涌。'},
  {name:'玄冰诀',grade:2,elem:'ice',mult:1.18,bonus:{int:1},desc:'冰属寒澈法门，一念千里冰封。'},
  {name:'青木长生诀',grade:2,elem:'wood',mult:1.15,bonus:{wil:1},desc:'木属养生法门，生机绵长，伤势易愈。'},
  {name:'惊雷诀',grade:3,elem:'thunder',mult:1.22,bonus:{str:1},desc:'雷属刚猛法门，动若雷霆万钧。'},
];

const MAT_NAMES={herb:'草药',sherb:'灵草',iron:'铁矿石',pelt:'妖皮',demonCore:'妖丹',jade:'寒玉',paper:'符纸',cinnabar:'朱砂'};
const CROP_NAMES={herb:'灵草',sherb:'灵参',fruit:'朱果'};
