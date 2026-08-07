/* ======================================================
  仙途 · 轮回道途 2.0：中期选择节点 + 轮回印记（v97 A1）
  说明：KARMA_NODES 在突破成功时弹出（仿 flowChoice），
        选择写入 flag[flagKey]，效果由各系统钩子读取；
        LOOP_MARKS 在执念达成时授予，跨世保留。
====================================================== */
'use strict';
const KARMA_NODES=[
  {id:'n_jindan',flagKey:'daoHeart',realm:13,title:'道心三问',
   q:'金丹凝成那夜，你于识海深处遇见三面古镜。镜中各有一道声音，问你这一世为何修道。',
   opts:[
     {k:'dao',i:'☁️',n:'重道',desc:'大道独行，修炼效率 +3%',apply:()=>{}},
     {k:'qing',i:'💞',n:'重情',desc:'人间烟火，好感获取 +20%',apply:()=>{}},
     {k:'yi',i:'🛡️',n:'重义',desc:'扶危济困，功德获取 +20%',apply:()=>{}},
   ]},
  {id:'n_yuanying',flagKey:'santu',realm:17,title:'三途抉择',
   q:'元婴出窍那日，你望见三条通往巅峰的路——一条剑鸣铮铮，一条血气如炉，一条灵光似海。',
   opts:[
     {k:'sword',i:'🗡️',n:'剑修',desc:'一剑破万法，攻势 +1',apply:()=>{}},
     {k:'body',i:'💪',n:'体修',desc:'肉身成圣，气血上限 +5%',apply:()=>{}},
     {k:'spirit',i:'🧿',n:'法修',desc:'法力通玄，真元上限 +10%',apply:()=>{}},
   ]},
  {id:'n_huashen',flagKey:'zhengmo',realm:25,title:'正魔一念',
   q:'化神之日，你立于正魔交界的山巅。山这边晨钟暮鼓，山那边血月当空——只等你一个念头。',
   opts:[
     {k:'zheng',i:'🌅',n:'正道',desc:'持正守心，魔道诱惑再难侵扰（堕魔结局关闭）',apply:()=>{}},
     {k:'mo',i:'🌑',n:'魔道',desc:'以杀证道，堕魔之门悄然松动（堕魔结局提前）',apply:()=>{}},
   ]},
  {id:'n_lianxu',flagKey:'cause',realm:29,title:'因果抉择',
   q:'炼虚境中，你看见自己前世的残影在轮回台上回望——它问你：这一世的记忆，要不要拿回来？',
   opts:[
     {k:'open',i:'📜',n:'解封记忆',desc:'前尘尽晓，轮回结算 +10%',apply:()=>{}},
     {k:'seal',i:'🪷',n:'封印前尘',desc:'放下过往，静心养神效果 +20%',apply:()=>{}},
   ]},
];
/* 轮回印记：执念达成时授予，跨世保留（goal 对应 KARMA_GOALS.id） */
const LOOP_MARKS=[
  {id:'m_ascend',goal:'ascend',i:'☁️',n:'飞升者',desc:'亲手推开天门，证道飞升'},
  {id:'m_sect',goal:'sect',i:'🏯',n:'开宗之祖',desc:'白手起家，香火不绝'},
  {id:'m_dao',goal:'dao',i:'💞',n:'情深不渝',desc:'三生石上，同心相守'},
  {id:'m_kill',goal:'kill',i:'⚔️',n:'百战余生',desc:'斩敌过百，战意长存'},
  {id:'m_merit',goal:'merit',i:'🕯️',n:'功德圆满',desc:'泽被苍生，功德无量'},
  {id:'m_main',goal:'main',i:'📖',n:'天衍传人',desc:'了却天衍之劫，承继因果'},
];
function karmaNodeById(id){return (KARMA_NODES||[]).find(n=>n.id===id)||null}
function loopMarksOf(s){
  const got=(s&&s.flag&&s.flag.loopMarks)||[];
  return (LOOP_MARKS||[]).map(m=>({mark:m,got:got.indexOf(m.id)>=0}));
}
