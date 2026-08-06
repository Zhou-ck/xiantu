/* 运行全部冒烟测试（需先执行 build.js） */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const dir=__dirname;
const files=fs.readdirSync(dir).filter(f=>/^smoke\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.match(/\d+/)[0],10)-parseInt(b.match(/\d+/)[0],10));
files.push('stress.js','balance.js','event.js','integration.js','longplay.js');
let fails=0;
for(const f of files){
  const out=cp.execFileSync(process.execPath,[path.join(dir,f)],{encoding:'utf8'});
  const fcount=(out.match(/FAIL:/g)||[]).length;
  if(fcount){fails+=fcount;console.log(f+': '+fcount+' FAILs');console.log(out.split('\n').filter(l=>l.indexOf('FAIL')>=0).join('\n'))}
  else console.log(f+': ok');
}
console.log(fails===0?'ALL '+files.length+' TESTS PASS':'TOTAL FAILS: '+fails);
process.exit(fails?1:0);
