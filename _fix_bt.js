const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'js','systems','breakthrough.js');
let c=fs.readFileSync(p,'utf8');
const startMark='  /* 4.2 心魔试炼：筑基及以上大境界，突破前与「自己的影子」三回合交手 */';
const endMark='/* ===== 4.2 心魔试炼：三回合影子战，胜场影响突破判定 ===== */';
const si=c.indexOf(startMark),ei=c.indexOf(endMark);
if(si<0||ei<0||ei<=si){console.log('marks not found',si,ei);process.exit(1)}
const replacement='  /* 4.2 心魔试炼：筑基及以上大境界，突破前与「自己的影子」三回合交手 */\n  doBigBreakCore(nxt,dc,kMod,0);\n}\n';
c=c.slice(0,si)+replacement+c.slice(ei);
fs.writeFileSync(p,c,'utf8');
console.log('cleaned dead block, bytes',c.length);
