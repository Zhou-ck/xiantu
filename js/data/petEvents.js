/* ======================================================
  仙途 · 灵兽事件池（v98）
  说明：放养历练后概率触发（runPetEvent），openEventModal 演出。
  fx 键：exp（灵兽经验）/ stones / merit / mood / flag / combat
====================================================== */
'use strict';
const PET_EVENTS=[
  {id:'pe_01',n:'衔芝而归',t:'你的灵兽从山涧叼回一株沾着晨露的灵芝，得意地摇着尾巴。',opts:[
    {txt:'🫳 摸摸它的头（经验 +15）',cls:'primary',fx:{exp:15}},
    {txt:'🌿 收下灵芝（灵草 +1）',fx:{mat:{sherb:1}}},
  ]},
  {id:'pe_02',n:'夜猎鼠患',t:'夜里灵兽悄悄出去，天明时叼回一串山鼠——库房再也不用担心被啃了。',opts:[
    {txt:'👍 夸它能干（经验 +10 · 心境 +3）',cls:'primary',fx:{exp:10,mood:3}},
    {txt:'🍖 赏它一枚灵石（经验 +20）',fx:{exp:20,stones:-50}},
  ]},
  {id:'pe_03',n:'灵光乍现',t:'灵兽对着月光呜咽长鸣，身上泛起一层淡淡灵光——它在自行参悟。',opts:[
    {txt:'✨ 静观其变（经验 +18 · 悟道 +1）',cls:'primary',fx:{exp:18,insight:1}},
    {txt:'🧘 与它一同吐纳（修为 +60）',fx:{cult:60}},
  ]},
  {id:'pe_04',n:'误入兽穴',t:'历练途中，灵兽一头扎进一处兽穴，里面传来低沉的咆哮。',opts:[
    {txt:'🦸 冲进去救它',cls:'danger',fx:{combat:{name:'穴中妖兽',atk:7,def:3,hp:40,elem:'wood',style:'guard'},winFx:{exp:25}}},
    {txt:'📣 在穴口呼唤它',fx:{exp:8,mood:-2}},
  ]},
  {id:'pe_05',n:'偷吃灵果',t:'灵兽偷吃了坊市一篮灵果，被摊主追着跑回你身边，可怜巴巴望着你。',opts:[
    {txt:'💰 赔钱了事（灵石 -80）',cls:'primary',fx:{stones:-80,exp:12,mood:-2}},
    {txt:'😠 训它一顿（经验 +5）',fx:{exp:5,mood:-3}},
  ]},
  {id:'pe_06',n:'遇险相护',t:'历练时灵兽遭遇强敌，伤痕累累地回来，却护着一株灵草不松口。',opts:[
    {txt:'💊 细心为它包扎（经验 +20 · 功德 +2）',cls:'primary',fx:{exp:20,merit:2}},
    {txt:'🫂 抱它回去休养（经验 +10）',fx:{exp:10}},
  ]},
  {id:'pe_07',n:'踏水而行',t:'溪边，灵兽踏水而行竟不沉，踏出一串灵光涟漪——它的血脉在苏醒。',opts:[
    {txt:'🌊 任它戏水（经验 +15 · 心境 +4）',cls:'primary',fx:{exp:15,mood:4}},
    {txt:'📿 记下这一幕（悟道 +1）',fx:{insight:1}},
  ]},
  {id:'pe_08',n:'报信',t:'灵兽叼着一枚传讯玉符回来——是山外有故人寻你的消息。',opts:[
    {txt:'📜 收下玉符（机缘 +1）',cls:'primary',fx:{luck:1,exp:8}},
    {txt:'🎁 回赠一枚灵石（经验 +15）',fx:{exp:15,stones:-50}},
  ]},
  {id:'pe_09',n:'月下蜕毛',t:'月圆之夜，灵兽蜕下一层旧毛，新毛油光水滑——蜕毛是成长之兆。',opts:[
    {txt:'🧵 收起蜕毛（灵草 +1 · 经验 +12）',cls:'primary',fx:{mat:{herb:1},exp:12}},
    {txt:'🌙 任新毛在月下发光（心境 +4）',fx:{mood:4}},
  ]},
  {id:'pe_10',n:'学舌',t:'灵兽竟学着你念诵法诀，虽然口齿不清，却学得有模有样。',opts:[
    {txt:'📖 耐心教它（经验 +18 · 悟道 +1）',cls:'primary',fx:{exp:18,insight:1}},
    {txt:'😄 笑得前仰后合（心境 +5）',fx:{mood:5}},
  ]},
  {id:'pe_11',n:'争食',t:'灵兽与村口的黄狗抢一块肉骨头，抢赢了，正昂首阔步走回来。',opts:[
    {txt:'😂 哭笑不得（心境 +4 · 经验 +8）',cls:'primary',fx:{mood:4,exp:8}},
    {txt:'🍖 把肉骨头还回去（功德 +2）',fx:{merit:2,exp:5}},
  ]},
  {id:'pe_12',n:'静坐相伴',t:'你打坐时，灵兽静静卧在你膝边，一呼一吸竟与你的吐纳同频。',opts:[
    {txt:'🧘 任它同修（修为 +80 · 经验 +10）',cls:'primary',fx:{cult:80,exp:10}},
    {txt:'🫳 轻轻抚摸（心境 +5）',fx:{mood:5}},
  ]},
];
function runPetEvent(){
  const p=S&&S.pet;
  if(!p)return;
  const e=pick(PET_EVENTS||[]);
  if(!e)return;
  openEventModal('🐾 灵兽 · '+e.n,'<p>'+e.t+'</p>',
    e.opts.map(o=>({txt:o.txt,fn:()=>{runPetFx(o.fx||{});passTime(1);renderAll()}})));
}
/* 灵兽 fx 解释器：exp/数值/combat */
function runPetFx(fx){
  fx=fx||{};
  if(fx.exp&&S.pet)petGain(fx.exp);
  if(fx.stones)S.stones=Math.max(0,(S.stones||0)+fx.stones);
  if(fx.merit)addMerit(fx.merit);
  if(fx.mood)S.mood=clamp((S.mood||0)+fx.mood,0,100);
  if(fx.cult)S.cult=(S.cult||0)+fx.cult;
  if(fx.insight)addWis(fx.insight);
  if(fx.luck)S.luck=clamp((S.luck||0)+fx.luck,1,100);
  if(fx.mat){S.mats=S.mats||{};Object.keys(fx.mat).forEach(k=>S.mats[k]=(S.mats[k]||0)+fx.mat[k]);}
  if(fx.combat){
    const c=fx.combat;
    startCombat({name:c.name,atk:c.atk,def:c.def,hp:c.hp,elem:c.elem,style:c.style},res=>{
      if(res.win){log('<p class="good">你救回灵兽，它亲昵地蹭着你的手。</p>');runPetFx(c.winFx||{})}
      else log('<p class="danger">你负伤带着灵兽退回，它呜咽着舔你的伤口。</p>');
    });
  }
}
