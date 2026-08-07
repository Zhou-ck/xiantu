/* ======================================================
  仙途 · 内容批次 B10 道侣/宗门二批（v96 收官）
  只 push。id 前缀 b10_
  道侣 +20（日常 10 / 结缡 6 / 未结 4）· 宗门 +20（门中 8 / 任务 8 / 大比 4）
  fx 键与占位符同 partnerEvents.js / sectEvents.js 规范
====================================================== */
'use strict';
(function(){
  if(typeof PARTNER_EVENTS!=='undefined'&&Array.isArray(PARTNER_EVENTS)){
    PARTNER_EVENTS.push(
      /* —— 日常 ×10 —— */
      {id:'b10_p_d01',t:'{g} 学着给你缝补衣裳，针脚歪歪扭扭，还扎了三次手。',opts:[
        {txt:'🧵 接过针线，替{g}缝完',fx:{aff:4,mem:'替我缝衣'}},
        {txt:'😄 打趣道：「这是补丁还是地图？」',fx:{aff:1,favor:-1}},
      ]},
      {id:'b10_p_d02',t:'山间有株桃树开得正好，{g} 停下脚步，看得出了神。',opts:[
        {txt:'🌸 折一枝桃花簪在{g}发间',fx:{aff:4,mem:'桃花簪发'}},
        {txt:'🤝 并肩站在树下看花',fx:{aff:3}},
      ]},
      {id:'b10_p_d03',t:'你练功出了岔子，气血翻涌。{g} 二话不说，运功替你理顺经脉。',opts:[
        {txt:'💞 握紧{g}的手：「有你在，真好」',fx:{aff:5,mem:'为我疗伤'}},
        {txt:'🧘 闭目调息，记下这份情',fx:{aff:3}},
      ]},
      {id:'b10_p_d04',t:'{g} 兴冲冲捧来一只刚孵化的灵兽幼崽：「你看它多可爱！」',opts:[
        {txt:'🐾 一起逗弄幼崽',fx:{aff:3,mem:'共养灵兽'}},
        {txt:'🤨 皱眉：「它比我们还费灵石」',fx:{aff:1,favor:-1}},
      ]},
      {id:'b10_p_d05',t:'夜半醒来，你发现{g} 睡梦中还攥着你的衣角，眉头微蹙。',opts:[
        {txt:'🛌 轻轻回握，陪着{g}睡',fx:{aff:4}},
        {txt:'🌙 替{g}掖好被角，看了很久',fx:{aff:3}},
      ]},
      {id:'b10_p_d06',t:'{g} 与你斗嘴输了，气鼓鼓地转过身去：「不理你了。」',opts:[
        {txt:'🤗 从背后环住{g}：「是我错了」',fx:{aff:4,mem:'斗嘴后的和好'}},
        {txt:'😏 故意逗{g}：「真不理了？」',fx:{aff:2,favor:-1}},
      ]},
      {id:'b10_p_d07',t:'雨中赶路，你浑身湿透。{g} 把自己干燥的外袍披到你身上。',opts:[
        {txt:'🧥 披着外袍，握住{g}的手',fx:{aff:4}},
        {txt:'☔ 把外袍还回去：「你更怕冷」',fx:{aff:5,mem:'雨中共衣'}},
      ]},
      {id:'b10_p_d08',t:'{g} 难得下厨，端出一碗卖相可疑的汤，眼巴巴望着你。',opts:[
        {txt:'🍲 一口喝完：「好喝」',fx:{aff:4}},
        {txt:'🤨 尝了一口：「……我教你？」',fx:{aff:2}},
      ]},
      {id:'b10_p_d09',t:'你在洞府外练剑，回头看见{g} 倚着门框看你，眼里带着笑。',opts:[
        {txt:'🗡️ 收剑走过去：「偷看我？」',fx:{aff:3}},
        {txt:'🎩 行个剑礼：「夫人可还满意？」',fx:{aff:4}},
      ]},
      {id:'b10_p_d10',t:'{g} 深夜还在灯下研读功法，眉头紧锁。',opts:[
        {txt:'🕯️ 添一盏灯，坐在{g}身边陪着',fx:{aff:4}},
        {txt:'📖 指点{g}几句功法要诀',fx:{aff:3,cult:40}},
      ]},
      /* —— 结缡后 ×6 —— */
      {id:'b10_p_mr1',stage:'married',t:'结缡多年，{g} 忽然认真问你：「这些年，你可曾后悔？」',opts:[
        {txt:'💍 望着{g}的眼睛：「从未」',fx:{aff:5,mem:'多年后的一句不悔'}},
        {txt:'😌 笑道：「后悔没早点遇见你」',fx:{aff:5,mem:'多年后的一句不悔'}},
      ]},
      {id:'b10_p_mr2',stage:'married',t:'你出远门归来，{g} 早已备好一桌你爱吃的菜，等在门口。',opts:[
        {txt:'🏠 一把抱住{g}：「回来了」',fx:{aff:4}},
        {txt:'🥢 坐下便吃：「还是家里的饭香」',fx:{aff:4,mem:'归家的一桌菜'}},
      ]},
      {id:'b10_p_mr3',stage:'married',t:'{g} 看着山下新人成婚，忽然感慨：「我们那会儿，可比他们热闹多了。」',opts:[
        {txt:'💞 握住{g}的手：「再热闹，也不如往后余生」',fx:{aff:5,mem:'回望大典'}},
        {txt:'😏 逗{g}：「要不要再办一场？」',fx:{aff:3}},
      ]},
      {id:'b10_p_mr4',stage:'married',t:'双修大典多年，你们一起经历过生离死别，也一起见过九界风景。',opts:[
        {txt:'🌄 与{g}并肩看晚霞',fx:{aff:4,mem:'共看晚霞'}},
        {txt:'📿 替{g}系紧同心结',fx:{aff:5}},
      ]},
      {id:'b10_p_mr5',stage:'married',t:'宗门夜宴上，{g} 当着众道友的面给你斟酒，眼底全是温柔。',opts:[
        {txt:'🍶 接过酒盏，回敬{g}',fx:{aff:3}},
        {txt:'😳 低声道：「这么多人呢……」',fx:{aff:4,mem:'众目下的温柔'}},
      ]},
      {id:'b10_p_mr6',stage:'married',t:'夜深，{g} 忽然问你：「若有一日我先走一步，你怎么办？」',opts:[
        {txt:'🛡️ 郑重道：「我便替你，把这人间看遍」',fx:{aff:5,mem:'生死之诺'}},
        {txt:'🤝 握住{g}的手：「那便一起走」',fx:{aff:6,mem:'生死之诺'}},
      ]},
      /* —— 未结缡 ×4 —— */
      {id:'b10_p_u1',stage:'unmarried',t:'灯会上，人潮涌动，{g} 与你被人群冲散，又跌跌撞撞寻了回来，一把拽住你的袖子。',opts:[
        {txt:'🏮 反手握住{g}的手：「别再走散了」',fx:{aff:4,mem:'灯会重逢'}},
        {txt:'😳 由着{g}拽着，耳根微热',fx:{aff:3}},
      ]},
      {id:'b10_p_u2',stage:'unmarried',t:'{g} 递来一只绣囊：「里面是护身的药，你总是不爱惜自己。」',opts:[
        {txt:'🎁 郑重收下：「以后都听你的」',fx:{aff:4}},
        {txt:'😏 逗{g}：「这是要当我家娘子了？」',fx:{aff:3,mem:'一只绣囊'}},
      ]},
      {id:'b10_p_u3',stage:'unmarried',t:'你与{g} 论道至深夜，{g} 忽然问：「你心里……可曾有过什么人？」',opts:[
        {txt:'💞 认真道：「此刻眼前，便是一个」',fx:{aff:5,mem:'深夜论心'}},
        {txt:'😅 岔开：「怎么突然问这个」',fx:{aff:1}},
      ]},
      {id:'b10_p_u4',stage:'unmarried',t:'{g} 生辰，却只说想与你走一走。你们沿着溪边，从晨光走到暮色。',opts:[
        {txt:'🌅 走完一整天，在日落时送{g}一枚同心结',fx:{aff:5,mem:'生辰同行'}},
        {txt:'🙏 默默陪着走完，什么也没说',fx:{aff:3}},
      ]},
    );
  }
  if(typeof SECT_EVENTS!=='undefined'&&Array.isArray(SECT_EVENTS)){
    SECT_EVENTS.push(
      /* —— 门中 ×8 —— */
      {id:'b10_s_e01',t:'门中收了一炉新丹，丹房弟子们围着丹炉屏息凝神——出丹的一刻，有人欢喜有人愁。',opts:[
        {txt:'⚗️ 上前帮忙分丹',cls:'primary',fx:{contrib:3,favor:2}},
        {txt:'📖 站在一旁，记下火候',fx:{contrib:2}},
      ]},
      {id:'b10_s_e02',t:'掌事弟子召集众人议事：「后山灵田的灵脉有些异动，谁愿去查看？」',opts:[
        {txt:'🧭 自告奋勇前往',fx:{roll:{attr:'int',dc:13,prelude:'你前往后山：',hit:'灵脉无恙，只是地气微动。你加固了阵眼，回来复命。',miss:'你看了半天没看出门道，只好如实回报。',hitFx:{contrib:6,merit:1},missFx:{contrib:2}}}},
        {txt:'🤷 静观其变',fx:{}},
      ]},
      {id:'b10_s_e03',t:'一名弟子练功走火，面色潮红地倒在演武场边。',opts:[
        {txt:'💊 上前运功护住其心脉',fx:{roll:{attr:'int',dc:14,prelude:'你运功相护：',hit:'你及时压下紊乱的真气，救回一名弟子。',miss:'你功力不足，只能先稳住，再请长老出手。',hitFx:{merit:3,favor:3},missFx:{merit:1}}}},
        {txt:'📣 立刻通报长老',fx:{merit:2}},
      ]},
      {id:'b10_s_e04',t:'藏经阁新进了一批古籍，阁中弟子正忙着分类入架。',opts:[
        {txt:'📚 帮忙整理入架',fx:{roll:{attr:'int',dc:12,prelude:'你帮着整理：',hit:'你顺手抄录了几卷，还分门别类理得井井有条。',miss:'你毛手毛脚，差点弄乱序号。',hitFx:{contrib:3,insight:1},missFx:{contrib:1}}}},
        {txt:'🧘 就地读了一卷',fx:{insight:1}},
      ]},
      {id:'b10_s_e05',t:'门中供奉的长明灯不知何故熄了，看守弟子急得团团转。',opts:[
        {txt:'🕯️ 上前以灵力点燃',fx:{roll:{attr:'wil',dc:13,prelude:'你凝神引火：',hit:'灯焰复明，看守弟子长舒一口气。',miss:'火苗颤了颤又灭了，你试了三次才成。',hitFx:{merit:2,favor:2},missFx:{merit:1}}}},
        {txt:'📜 上报执事处理',fx:{contrib:2}},
      ]},
      {id:'b10_s_e06',t:'山门来了一队客修拜访，掌事弟子让你作陪。',opts:[
        {txt:'🤝 热情作陪，尽地主之谊',fx:{roll:{attr:'cha',dc:13,prelude:'你作陪引路：',hit:'客修对你赞不绝口，临走留下谢礼。',miss:'你话不多，气氛略冷，好在掌事及时救场。',hitFx:{contrib:5,favor:3,stones:40},missFx:{contrib:2}}}},
        {txt:'🙏 行礼后告退',fx:{}},
      ]},
      {id:'b10_s_e07',t:'门中弟子间传起一段流言，闹得人心浮动。',opts:[
        {txt:'🕵️ 查明流言源头，当众澄清',fx:{roll:{attr:'int',dc:14,prelude:'你着手调查：',hit:'你揪出造谣之人，当众澄清，众人心服。',miss:'流言愈演愈烈，你只好请长老出面。',hitFx:{merit:3,contrib:5},missFx:{}}}},
        {txt:'🚶 不闻不问，只管修行',fx:{}},
      ]},
      {id:'b10_s_e08',t:'后山发现一株百年灵参，正是门中急用之物，长老让你带队去挖。',opts:[
        {txt:'⛏️ 带队掘参',fx:{roll:{attr:'agi',dc:13,prelude:'你带人掘参：',hit:'你小心掘出整株灵参，毫发无损。',miss:'灵参见势遁走，你追了半座山才逮住。',hitFx:{contrib:7,mat:{sherb:1}},missFx:{contrib:3}}}},
        {txt:'📜 报回坐标，让长老定夺',fx:{contrib:3}},
      ]},
      /* —— 任务 ×8 —— */
      {id:'b10_s_t01',t:'长老派你去山下镇子收取供奉。镇民们热情相待，却提到镇上近来闹狐患。',opts:[
        {txt:'🦊 顺手除了狐患',fx:{roll:{attr:'agi',dc:13,prelude:'你布下陷阱：',hit:'你擒住作乱的狐妖，镇民感激涕零。',miss:'狐妖狡诈，你扑了空，只得作罢。',hitFx:{merit:3,contrib:5,stones:50},missFx:{contrib:2}}}},
        {txt:'💰 收完供奉便回',fx:{contrib:4,stones:40}},
      ]},
      {id:'b10_s_t02',t:'门中接下一单护送灵石的差事，你被点作随行护卫。',opts:[
        {txt:'🛡️ 沿途警惕，寸步不离',fx:{roll:{attr:'wil',dc:13,prelude:'你一路戒备：',hit:'一路太平，你护送灵石安全到库。',miss:'夜里有人摸营，你惊醒时已被摸走一小袋。',hitFx:{contrib:6,merit:1},missFx:{contrib:2}}}},
        {txt:'🗺️ 与同门轮流值守',fx:{contrib:4}},
      ]},
      {id:'b10_s_t03',t:'长老命你取一壶「晨露灵泉」回来入药——泉在禁地边缘，非胆大者不敢去。',opts:[
        {txt:'🧭 天亮前取泉',fx:{roll:{attr:'agi',dc:14,prelude:'你摸黑赶往灵泉：',hit:'你赶在日出前取回满满一壶晨露。',miss:'你惊动了禁地边缘的守泉兽，空手而归。',hitFx:{contrib:7,merit:2},missFx:{contrib:2}}}},
        {txt:'💧 以普通泉水交差',fx:{contrib:2,merit:-1}},
      ]},
      {id:'b10_s_t04',t:'门中要修缮演武场，长老让你采一批青石。',opts:[
        {txt:'⛏️ 亲自上山采石',fx:{roll:{attr:'str',dc:13,prelude:'你上山采石：',hit:'你采回上好的青石，还多带了一车。',miss:'你力气不济，只采得半车。',hitFx:{contrib:5,favor:2},missFx:{contrib:2}}}},
        {txt:'💰 出灵石雇人采买',fx:{stones:-60,contrib:3}},
      ]},
      {id:'b10_s_t05',t:'山脚村子请门中驱邪——说是井里爬出奇怪的东西。',opts:[
        {txt:'🕯️ 亲自下井查看',fx:{roll:{attr:'wil',dc:14,prelude:'你下井查看：',hit:'井底是一窝阴气聚成的邪祟，你以灵力炼化，井水复清。',miss:'井底阴气太重，你险些被拉下去。',hitFx:{merit:4,contrib:5},missFx:{contrib:1}}}},
        {txt:'📜 上报长老，请派专修',fx:{contrib:2}},
      ]},
      {id:'b10_s_t06',t:'门中库房缺一批符纸，长老让你去坊市采买——但要价比三家。',opts:[
        {txt:'🛒 跑遍三家铺子比价',fx:{roll:{attr:'int',dc:13,prelude:'你货比三家：',hit:'你省下两成灵石，还搭上一条供货门路。',miss:'你被掌柜绕晕，多花了些。',hitFx:{contrib:4,stones:30},missFx:{contrib:2}}}},
        {txt:'🏪 就近买齐',fx:{stones:-30,contrib:3}},
      ]},
      {id:'b10_s_t07',t:'巡山弟子来报：山道上有重伤的散修，气息奄奄。',opts:[
        {txt:'💊 施救送药',fx:{roll:{attr:'cha',dc:13,prelude:'你施以援手：',hit:'你救回一条性命，散修醒来执意要报答。',miss:'你药力不足，只能先稳住伤势。',hitFx:{merit:4,favor:2},missFx:{merit:2}}}},
        {txt:'📣 送回山门请长老处置',fx:{merit:2}},
      ]},
      {id:'b10_s_t08',t:'长老交给你一枚储物戒：「里面是给友宗的贺礼，你走一趟。」',opts:[
        {txt:'🗺️ 亲自护送',fx:{roll:{attr:'agi',dc:13,prelude:'你护送贺礼：',hit:'你平安送达，友宗管事赞你稳重。',miss:'路上遇了场雨，贺礼盒沾了水，你有些尴尬。',hitFx:{contrib:6,favor:2},missFx:{contrib:3}}}},
        {txt:'📦 托商队代送',fx:{stones:-40,contrib:3}},
      ]},
      /* —— 大比 ×4 —— */
      {id:'b10_s_b01',t:'大比规则公布：今年新增「守擂制」，连胜者可免预选。同门们议论纷纷。',opts:[
        {txt:'🥊 报名守擂',fx:{contrib:3,flag:'bigSignUp'}},
        {txt:'🤔 先观察两天再说',fx:{}},
      ]},
      {id:'b10_s_b02',t:'大比前夜，你在演武场温习招式。{p} 拎着两壶茶过来，默默放下一壶。',opts:[
        {txt:'🍵 接过茶壶：「谢了」',fx:{favor:3}},
        {txt:'🤜 邀{p}对练几招',fx:{roll:{attr:'str',dc:13,prelude:'你们过招：',hit:'几招下来，你们互相指点了彼此的破绽。',miss:'你心不在焉，被{p}拿下一式。',hitFx:{favor:3,cult:60},missFx:{cult:30}}}},
      ]},
      {id:'b10_s_b03',t:'大比结束，你名列前茅。长老当众嘉奖，还问你愿不愿意带一带新弟子。',opts:[
        {txt:'🥋 欣然应下',fx:{contrib:5,favor:3}},
        {txt:'🙏 推辞：「弟子想先潜心修炼」',fx:{merit:1}},
      ]},
      {id:'b10_s_b04',t:'大比惜败，{p} 拍着你的肩：「输一场没什么，我第一年连预选都没过。」',opts:[
        {txt:'🤝 笑道：「那你现在不也站上来了」',fx:{favor:3,mood:6}},
        {txt:'🍶 拉{p}去喝一杯',fx:{favor:3,stones:-30}},
      ]},
    );
  }
})();
