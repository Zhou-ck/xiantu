/* ======================================================
  仙途 · 灵兽进化分支（v98）
  说明：灵兽每 10 级蜕变一次（form++）；首次蜕变（10级）
        弹「进化分支」二选一，分支效果由各系统钩子读取。
  分支键：kuang/xuan（战）、fu/xiang（运）、yao/bao（采）
          ji/feng（速）、dan/qi（工）、gen/ling（根）
====================================================== */
'use strict';
const PET_FORMS={
  combat:{stages:['战兽','凶兽','兽王','兽神'],branch:{a:['kuang','狂兽','助战攻势 +1'],b:['xuan','玄兽','探索凶险 -5%']}},
  luck:{stages:['灵兽','福兽','瑞兽','祥兽'],branch:{a:['fu','福兽','气运 +2'],b:['xiang','祥兽','坊市折扣 +5%']}},
  herb:{stages:['灵兽','药兽','宝兽','药王兽'],branch:{a:['yao','药兽','采药 +2'],b:['bao','宝兽','灵草 +1']}},
  speed:{stages:['灵兽','疾兽','风兽','追风兽'],branch:{a:['ji','疾兽','旅行再提速'],b:['feng','风兽','修炼 +3%']}},
  alchemy:{stages:['灵兽','丹兽','器兽','百炼兽'],branch:{a:['dan','丹兽','炼丹判定 +2'],b:['qi','器兽','炼器判定 +2']}},
  root:{stages:['灵兽','根兽','玄兽','通灵兽'],branch:{a:['gen','根兽','灵根 +2'],b:['ling','灵兽','修炼 +3%']}},
};
function petFormStage(p){
  const f=PET_FORMS[(p&&p.talent)||'combat']||PET_FORMS.combat;
  const stage=Math.min((p&&p.form)||0,f.stages.length-1);
  return {n:f.stages[stage]||'灵兽',f:f};
}
function petBranchDesc(p){
  if(!p||!p.branch)return '';
  const f=PET_FORMS[p.talent]||PET_FORMS.combat;
  const br=f.branch;
  const pickB=br&&(br.a[0]===p.branch?br.a:(br.b&&br.b[0]===p.branch?br.b:null));
  return pickB?(pickB[1]+'：'+pickB[2]):'';
}
