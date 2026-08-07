/* 构建测试用整包：按 index.html 脚本顺序拼接全部 js 到 %TEMP%\xiantu_game.js */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const order=[];
const re=/<script src="([^"]+?\.js)(?:\?[^"]*)?"><\/script>/g;
let m;
while((m=re.exec(html)))order.push(m[1]);
if(!order.length){console.error('no scripts found');process.exit(1)}
const parts=[];
for(const rel of order){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)){console.error('missing '+p);process.exit(1)}
  parts.push('/* ===== '+rel+' ===== */\n'+fs.readFileSync(p,'utf8'));
}
const out=path.join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js');
fs.writeFileSync(out,parts.join('\n'),'utf8');
console.log('built',out,'bytes',fs.statSync(out).size,'scripts',order.length);
