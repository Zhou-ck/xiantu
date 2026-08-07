/* v93 主线 0-2 章场景图挂载冒烟 */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 两张新场景图存在且为 JPG
for(const f of ['temple.jpg','valley.jpg']){
  const p=path.join(root,'assets','scenes',f);
  assert(fs.existsSync(p),'assets/scenes/'+f+' 存在');
  const b=fs.readFileSync(p);
  assert(b[0]===0xFF&&b[1]===0xD8,'  '+f+' 为 JPEG 头');
}

// T2 SCENE_IMG 映射：破庙/山神→temple、灵溪/幽谷/琴音→valley、药园/深林→forest
const ui=fs.readFileSync(path.join(root,'js','ui','ui.js'),'utf8');
assert(/破庙\|山神/.test(ui)&&ui.indexOf('temple.jpg')>=0,'ui.js 含 破庙|山神 → temple');
assert(/灵溪\|幽谷\|琴音\|溪畔/.test(ui)&&ui.indexOf('valley.jpg')>=0,'ui.js 含 灵溪|幽谷|琴音 → valley');
assert(/药园\|深林\|暮色/.test(ui)&&ui.indexOf('forest.jpg')>=0,'ui.js 含 药园|深林 → forest');

// T3 主线 0-2 章 story 标题能被映射命中
const quests=fs.readFileSync(path.join(root,'js','data','quests.js'),'utf8');
assert(quests.indexOf('山神夜话')>=0,'主线 m0s3 山神夜话存在');
assert(quests.indexOf('幽谷琴音')>=0,'主线 m1s1 幽谷琴音存在');
assert(quests.indexOf('药园女主人')>=0,'主线 m2s3 药园女主人存在');

// T4 LICENSES 登记 + SW 覆盖
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
assert(lic.indexOf('temple.jpg')>=0&&lic.indexOf('valley.jpg')>=0,'LICENSES.md 登记两张图');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(sw.indexOf('temple.jpg')>=0&&sw.indexOf('valley.jpg')>=0,'sw.js ASSETS 覆盖两张图');

console.log(fails===0?'smoke121: ALL PASS':'smoke121 FAILS: '+fails);
process.exit(fails?1:0);
