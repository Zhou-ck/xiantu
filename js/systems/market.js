/* ======================================================
  仙途 · 模块化重构（由原单文件按系统拆分）
  来源段落：================ 坊市 ================
====================================================== */
'use strict';
/* ================= 坊市 ================= */
const MARKET_ITEMS=[
  {name:'回春丹',type:'consumable',quality:1,cost:80,desc:'服之气血尽复（恢复 60% 气血）。',use:'heal'},
  {name:'聚灵丹',type:'consumable',quality:1,cost:150,desc:'30 日内修炼效率 ×1.5。',use:'pill'},
  {name:'清心丹',type:'consumable',quality:2,cost:200,desc:'涤荡心魔，消除全部心魔烙印。',use:'clear'},
  {name:'安神香',type:'consumable',quality:1,cost:150,desc:'焚香静心，心境 +15（提升突破与心魔判定）。',use:'mood'},
  {name:'回溯符',type:'consumable',quality:3,cost:1500,desc:'天机回溯之符：大境界突破失败时，可回到突破前 3 日。',use:'rewind'},
  {name:'保命符',type:'consumable',quality:2,cost:400,count:1,desc:'贴身护符：遭致命一击时自行焚毁，以重伤代死（自动消耗，最多携带两件）。',use:'save'},
  {name:'替身傀儡',type:'consumable',quality:3,cost:900,count:1,desc:'木傀替身：遇死劫替主受难，重伤存活且修为不损（自动消耗，最多携带两件）。',use:'save'},
  {name:'破境丹',type:'consumable',quality:2,cost:600,desc:'突破时心性判定 +3（一次有效）。',use:'break'},
  {name:'洗髓丹',type:'consumable',quality:3,cost:1200,desc:'伐毛洗髓，灵根资质 +5。',use:'root'},
  {name:'延寿丹',type:'consumable',quality:3,cost:900,desc:'服之增寿 30-80 载（在境界寿元之上）。',use:'lifespan'},
  {name:'筑基丹',type:'consumable',quality:2,cost:500,desc:'凝炼丹基，冲击筑基的必备之资，亦可临时提升突破判定。',use:'break'},
  {name:'锻体丹',type:'consumable',quality:2,cost:600,desc:'淬炼筋骨，力量 +1（永久）。',use:'str'},
  {name:'轻身丹',type:'consumable',quality:2,cost:600,desc:'疏经活络，身法 +1（永久）。',use:'agi'},
  {name:'通慧丹',type:'consumable',quality:2,cost:700,desc:'开窍明心，智慧 +1（永久）。',use:'int'},
  {name:'疗伤丹',type:'consumable',quality:2,cost:300,desc:'通经活络，愈经脉、筋骨之伤。',use:'cure_neijing'},
  {name:'安神丹',type:'consumable',quality:2,cost:320,desc:'安魂定神，愈神魂之创。',use:'cure_shenhun'},
  {name:'火云剑',type:'weapon',quality:2,cost:520,bonus:3,elem:'fire',setId:'wuxing',desc:'火属性灵剑，攻击 +3，火灵根者用之力增。'},
  {name:'玄冰刃',type:'weapon',quality:2,cost:520,bonus:3,elem:'ice',setId:'wuxing',desc:'冰属性寒刃，攻击 +3，水灵根者用之力增。'},
  {name:'庚金剑',type:'weapon',quality:3,cost:900,bonus:4,elem:'metal',setId:'wuxing',desc:'金气锋锐，攻击 +4，金灵根者用之力增。'},
  {name:'精铁剑',type:'weapon',quality:1,cost:200,bonus:2,setId:'jianxin',desc:'坊市常见的法器，聊胜于无。'},
  {name:'青鳞甲',type:'armor',quality:1,cost:260,bonus:2,setId:'xiaoyao',desc:'以青鳞兽皮缝制，可挡刀剑。'},
  {name:'聚灵玉佩',type:'trinket',quality:2,cost:600,bonus:2,setId:'wuxing',desc:'佩戴者气运微升，修炼时心神安宁。'},
  {name:'火球符',type:'consumable',quality:1,cost:60,count:1,desc:'战斗中掷出，攻击 +6。',use:'fire'},
  {name:'遁地符',type:'consumable',quality:1,cost:120,count:1,desc:'遭遇战必定脱身。',use:'escape'},
  {name:'草药',type:'mat',key:'herb',cost:30},
  {name:'灵草',type:'mat',key:'sherb',cost:120},
  {name:'铁矿石',type:'mat',key:'iron',cost:50},
  {name:'妖皮',type:'mat',key:'pelt',cost:100},
  {name:'妖丹',type:'mat',key:'demonCore',cost:400},
  {name:'寒玉',type:'mat',key:'jade',cost:300},
  {name:'符纸',type:'mat',key:'paper',cost:40},
  {name:'朱砂',type:'mat',key:'cinnabar',cost:45},
  {name:'火灵石',type:'gem',gemId:'g_fire',cost:300,desc:'五行灵石：镶嵌后五行克敌伤害 +3%。',sell:150},
  {name:'金灵石',type:'gem',gemId:'g_metal',cost:300,desc:'五行灵石：镶嵌后攻势 +1。',sell:150},
  {name:'温玉',type:'gem',gemId:'g_jade',cost:300,desc:'灵玉温润：镶嵌后防御 +1。',sell:150},
  {name:'沧海珠',type:'gem',gemId:'g_pearl',cost:450,desc:'深海宝珠：镶嵌后最大气血 +15。',sell:200},
  {name:'星陨石',type:'gem',gemId:'g_star',cost:600,desc:'天外奇珍：镶嵌后气运 +1。',sell:280},
];
function panelMarket(){
  const tr=marketTrend();
  const note=tr.note+'（购价 ×'+tr.buy.toFixed(2)+' / 售价 ×'+tr.sell.toFixed(2)+'）';
  const items=MARKET_ITEMS.map((m,i)=>{
    const tag=m.type==='mat'?'材料':'物品';
    const price=buyPrice(m);
    const mm=Object.assign({},m,{desc:m.desc||'炼丹炼器之材。'});
    return itemCardHtml(mm,'<span class="tag">'+tag+'</span><button class="small primary" onclick="buyItem('+i+')">购 · '+price+' 灵石</button>');
  }).join('');
  const inv=S.items.map((it,j)=>itemCardHtml(it,'<button class="small" onclick="sellItem('+j+')">售 · '+sellPrice(it)+' 灵石</button>')).join('');
  const mats=Object.entries(S.mats).map(([k,v])=>'<span class="tag">'+MAT_NAMES[k]+' ×'+v+'</span>').join('')||'<span style="color:#6f7a94">空空如也</span>';
  const auc=getAuction();
  const aucHtml=auc.sold?'<p style="color:#6f7a94">本届奇珍已售出，来年再会。</p>':itemCardHtml(auc.it,'<span class="tag">奇珍</span><button class="small primary" onclick="buyAuction()">🏆 进入竞拍 · 当前 '+auc.price+' 灵石（第 '+(auc.rounds+1)+'/'+AUCTION_ROUNDS+' 轮）</button>');
  openPanel('🏮 坊市','<p>凡尘与修真界交汇之地，商贩吆喝，灵光流转。</p><p class="sys">📈 行情：'+note+'</p><h4>💎 灵石：'+S.stones+'</h4>'+
    '<h4>🌾 善举</h4><div class="row"><button class="small" onclick="giveAlms()">施粥棚 · 50灵石（功德+2）</button></div>'+
    '<h4>💎 宝石兑换</h4><div class="row"><button class="small" onclick="exchangeGem()">妖丹 ×2 换随机宝石</button></div>'+
    '<h4>🚚 跑商</h4>'+(S.flag.tradePass?'<div class="row"><button class="small primary" onclick="runTrade()">出商跑一趟（5 日）</button></div>':'<div class="row"><button class="small" onclick="buyTradePass()">购商队通行证 · 200 灵石</button></div>')+
    '<h4>🏆 奇珍拍卖（每年一换）</h4>'+aucHtml+
    '<h4>🌿 药材与材料</h4><p>'+mats+'</p><h4>🏪 出售货物</h4>'+items+'<h4>📦 寄售你的物品</h4>'+(inv||'<p style="color:#6f7a94">无</p>'));
}
/* 10.1 物价波动：季节行情 + 事件扰动 */
function marketTrend(){
  const se=seasonOf();
  const t={0:{buy:0.92,sell:1.08,note:'春汛灵草成熟：材料收购价上调'},1:{buy:1.05,sell:0.95,note:'夏市妖兽横行：丹药紧俏涨价'},2:{buy:1.08,sell:0.9,note:'秋收后货源充足：出售压价'},3:{buy:0.98,sell:1.02,note:'冬市冷清：行情平稳'}}[se];
  if(S.flag.marketShock===Math.floor(S.years))t.buy*=1.3,t.note+='；妖兽潮后疗伤丹涨价 30%';
  return t;
}
function buyPrice(m){
  const tr=marketTrend();
  const fameD=Math.max(0.85,1-fameDiscount()/100); /* 2J 总声望折扣：每 90 点 -1%，上限 -15% */
  const base=m.cost*(S.bg.traits.some(x=>x.id==='merchant')?0.9:1)*(S.flag.tMerchant?0.95:1)*(S.flag.teaLore?0.97:1)*(attrVal(S,'cha')>=15?0.95:1)*fameD*(signNow()&&signNow().disc?signNow().disc:1);
  if(m.type==='mat')return Math.max(1,Math.floor(base*tr.buy));
  return Math.max(1,Math.floor(base*tr.buy));
}
function sellPrice(it){
  const tr=marketTrend();
  const base=(it.sell||50)*0.6*(S.bg.traits.some(x=>x.id==='merchant')?1.1:1);
  return Math.max(1,Math.floor(base*tr.sell));
}
/* 10.4 跑商：商队通行证 + 五日出商，收益随行情波动，可能遇劫 */
function buyTradePass(){
  if(S.stones<200){toast('灵石不足');return}
  S.stones-=200;S.flag.tradePass=true;
  log('<p>你自商会购得一枚<b>商队通行证</b>，自此可于坊市间跑商牟利。</p>');
  panelMarket();renderAll();
}
function runTrade(){
  closePanel();
  const invest=Math.min(S.stones,500);
  if(invest<50){toast('本钱不足');return}
  if(chance(0.3)){
    log('<p>你押着货队行至山坳，忽有劫匪拦路！</p>');
    startCombat({name:'剪径劫匪',atk:5+rl()*2,def:2+rl(),hp:30+rl()*12,style:'rapid'},res=>{
      if(res.win){const g=Math.floor(invest*rand(5,12)/100);S.stones+=g;log('<p class="good">你反夺了劫匪的赃物（灵石 +'+g+'）。</p>')}
      else log('<p class="danger">货被劫走大半，你灰头土脸地逃了回来。</p>');
      passTime(5);renderAll();
    },true);
    return;
  }
  S.stones-=invest;
  const tr=marketTrend();
  const g=Math.floor(invest*rand(70,160)/100*tr.sell);
  S.stones+=g;
  log('<p>你押着货队走了五日，低买高卖（投入 '+invest+'，得 '+g+'，净赚 '+(g-invest)+'）。</p>');
  passTime(5);renderAll();
}
const AUCTION_ROUNDS=3;
function auctionSetup(){
  if(!S.flag.auctionItem||S.flag.auctionYear!==Math.floor(S.years)||S.flag.auctionRounds===undefined){
    S.flag.auctionItem=pick(AUCTION_POOL);
    S.flag.auctionYear=Math.floor(S.years);
    S.flag.auctionRounds=0;
    S.flag.auctionSold=false;
    S.flag.auctionLead=false;
    S.flag.auctionBidderName='';
    S.flag.auctionPrice=Math.floor(S.flag.auctionItem.cost*1.4);
    const n=clamp(2+Math.floor(totalFame()/150),2,3);
    const pool=['陈员外','柳大家','云游散修','魔道商贾','丹房执事','西域富商','剑阁弟子'].slice();
    S.flag.auctionBidders=[];
    for(let i=0;i<n&&pool.length;i++){
      const j=rand(0,pool.length-1);
      S.flag.auctionBidders.push({name:pool.splice(j,1)[0],budget:Math.floor(S.flag.auctionPrice*rand(12,18)/10),passed:false});
    }
  }
}
function getAuction(){
  auctionSetup();
  return {it:S.flag.auctionItem,price:S.flag.auctionPrice||Math.floor(S.flag.auctionItem.cost*1.4),sold:!!S.flag.auctionSold,lead:!!S.flag.auctionLead,rounds:S.flag.auctionRounds||0};
}
function buyAuction(){startAuction()}
function auctionAiStep(){
  const a=getAuction();
  const act=(S.flag.auctionBidders||[]).find(b=>!b.passed&&b.budget>a.price*1.1);
  if(act&&chance(0.7)){
    const up=Math.max(10,Math.floor(a.price*0.12));
    S.flag.auctionPrice=a.price+up;
    S.flag.auctionLead=false;
    S.flag.auctionBidderName=act.name;
    log('<p class="sys">🏆 '+esc(act.name)+' 举牌加价至 <b>'+S.flag.auctionPrice+'</b> 灵石。</p>');
  }else{
    if(act)act.passed=true;
    log('<p class="sys">🏆 在场众人沉默，无人再加价。</p>');
  }
}
function auctionNextRound(){
  S.flag.auctionRounds=(S.flag.auctionRounds||0)+1;
  if(S.flag.auctionRounds>=AUCTION_ROUNDS){
    const a=getAuction();
    if(a.lead){
      if(S.stones<a.price){
        log('<p class="danger">落槌时你囊中羞涩，奇珍与财宝双双落空……</p>');
        S.flag.auctionSold=true;
      }else{
        S.stones-=a.price;S.flag.auctionSold=true;
        addItem(Object.assign({},a.it));
        log('<p class="loot">三锤落定！你以 <b>'+a.price+'</b> 灵石拍下 <b>'+esc(a.it.name)+'</b>！</p>');
      }
    }else{
      S.flag.auctionSold=true;
      log('<p class="sys">三锤落定，奇珍被 '+esc(S.flag.auctionBidderName||'一位神秘买家')+' 以 '+a.price+' 灵石拍走。留得青山在，不愁没柴烧。</p>');
    }
    panelMarket();renderAll();
    return;
  }
  startAuction();
}
function startAuction(){
  auctionSetup();
  const a=getAuction();
  if(a.sold){toast('已售出，来年再会');return}
  const up=Math.max(10,Math.floor(a.price*0.1));
  openEventModal('🏆 奇珍拍卖 · 第 '+(a.rounds+1)+'/'+AUCTION_ROUNDS+' 轮',
    '<p>拍品：<b>'+esc(a.it.name)+'</b>（'+QNAMES[a.it.quality]+'）<br>当前价 <b>'+a.price+'</b> 灵石'+(a.lead?'（你暂居上风）':'（你尚未出手）')+'</p><p class="sys">共 3 轮，落槌前价高者得。观望则看他人竞价。</p>',[
      {txt:'💰 加价 '+up+' 灵石',cls:'primary',fn:()=>{
        if(S.stones<a.price+up){toast('灵石不足（需 '+(a.price+up)+'）');panelMarket();renderAll();return}
        S.flag.auctionLead=true;
        S.flag.auctionPrice=a.price+up;
        S.flag.auctionBidderName=S.name;
        log('<p class="good">你举牌出价 <b>'+S.flag.auctionPrice+'</b> 灵石。</p>');
        auctionAiStep();
        auctionNextRound();
      }},
      {txt:'🤝 静观其变',fn:()=>{
        log('<p>你按下手中灵石，静观众人竞价。</p>');
        auctionAiStep();
        auctionNextRound();
      }},
      {txt:'🚶 放弃竞价',fn:()=>{
        S.flag.auctionSold=true;
        log('<p>你放弃了本轮竞价，奇珍落入他手。留得青山在。</p>');
        panelMarket();renderAll();
      }},
    ]);
}
function giveAlms(){
  if(S.stones<50){toast('灵石不足');return}
  S.stones-=50;addMerit(2);
  log('<p>你在坊市施粥三日，流民叩首称谢，心头似有所悟。</p>');
  panelMarket();renderAll();
}
function buyItem(i){
  const m=MARKET_ITEMS[i];
  const cost=buyPrice(m);
  if(S.stones<cost){toast('灵石不足');return}
  if(m.use==='save'&&S.items.filter(x=>x.use==='save').length>=2){toast('护身之物最多携带两件');return}
  S.stones-=cost;
  if(m.type==='mat')S.mats[m.key]=(S.mats[m.key]||0)+1;
  else addItem(Object.assign({},m));
  if(typeof questTick==='function')questTick();
  toast('购得 '+m.name);
  panelMarket();
}
function sellItem(j){
  const it=S.items[j];
  const p=sellPrice(it);
  S.stones+=p;S.items.splice(j,1);
  toast('售出，得 '+p+' 灵石');
  panelMarket();
}
function addItem(it){
  if(it&&(it.type==='weapon'||it.type==='armor'||it.type==='trinket')&&typeof ensureEquip==='function')it=ensureEquip(it);
  if(S)S.flag._lastAdded=it;
  S.seenI[it.name]=(S.seenI[it.name]||0)+1;
  if(typeof checkAtlasMiles==='function')checkAtlasMiles();
  if(it.type==='weapon'&&!S.weapon){S.weapon=it;toast('获得法器：'+it.name);return}
  if(it.type==='armor'&&!S.armor){S.armor=it;toast('获得防具：'+it.name);return}
  if(it.type==='trinket'&&!S.trinket){S.trinket=it;toast('获得佩饰：'+it.name);return}
  S.items.push(it);
}
function randItem(q){
  const pool=[
    {name:'寒铁剑',type:'weapon',quality:1,bonus:2,setId:'jianxin',desc:'以寒铁铸成，剑身透凉。',sell:180},
    {name:'赤炎刀',type:'weapon',quality:2,bonus:3,setId:'xiexue',desc:'刀身赤红，似有火光流转。',sell:420},
    {name:'紫电剑',type:'weapon',quality:3,bonus:4,setId:'jianxin',desc:'剑出紫电随行，上古遗宝。',sell:1200},
    {name:'玄龟甲',type:'armor',quality:2,bonus:3,setId:'xiaoyao',desc:'玄龟甲壳所制，坚不可摧。',sell:400},
    {name:'星纹软甲',type:'armor',quality:3,bonus:4,setId:'jianxin',desc:'织星为线，柔韧胜钢。',sell:1100},
    {name:'聚灵佩',type:'trinket',quality:2,bonus:2,setId:'xiaoyao',desc:'温养灵台，神思清明。',sell:380},
    {name:'龙凤环',type:'trinket',quality:4,bonus:3,setId:'xiaoyao',desc:'龙凤交缠，气运自聚。',sell:2000},
    {name:'筑基丹',type:'consumable',quality:2,count:1,desc:'突破时心性判定 +3（一次有效）。',use:'break',sell:500},
  ].filter(x=>x.quality<=q);
  return Object.assign({},pick(pool));
}
function useItem(name){
  const i=S.items.findIndex(x=>x.name===name);
  if(i>=0)S.items.splice(i,1);
}
/* v49 宝石兑换：妖丹 ×2 换随机宝石（产出→流通→消耗闭环） */
function exchangeGem(){
  if((S.mats.demonCore||0)<2){toast('妖丹不足（需 2）');return}
  S.mats.demonCore-=2;
  const g=pick(GEM_DEFS);
  addItem({name:g.name,type:'gem',gemId:g.id,quality:2,desc:g.desc,sell:150});
  log('<p class="loot">你将两枚妖丹投入兑换台，灵光一闪，得'+g.i+' '+g.name+'一枚（'+g.desc+'）。</p>');
  panelMarket();renderAll();
}
