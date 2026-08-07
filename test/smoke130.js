/* v99 灵兽立绘适配冒烟 */
const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(process.env.TEMP||process.env.TMPDIR||os.tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c)},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 PET_ART 覆盖 6 物种
const art=vm.runInContext('PET_ART',ctx);
['灵狐','小火鸦','玉兔','石猴','金蚕','小蛟'].forEach(sp=>{
  assert(art[sp]&&art[sp].indexOf('.jpg')>=0,'PET_ART 含 '+sp);
});
assert(vm.runInContext('petArt({species:"玉兔"})',ctx)==='assets/portraits/pet_rabbit.jpg','petArt 映射正确');

// T2 图片文件全部存在且为 JPEG
const files=Object.values(art);
files.forEach(f=>{
  const p=path.join(root,f);
  assert(fs.existsSync(p),f+' 存在');
  const b=fs.readFileSync(p);
  assert(b[0]===0xFF&&b[1]===0xD8,'  '+f+' JPEG 头');
});

// T3 petPanel 渲染立绘 + 进化金框 + onerror 兜底
vm.runInContext(`
  S=newState('测',BACKGROUNDS[0]); S.flag={};
  S.pet={name:'阿火',species:'小火鸦',talent:'combat',level:10,exp:0,form:2,bonus:3,faint:0};
  PENDING=0; petPanel(); window.__h=document.getElementById('panelBody')._html;
`,ctx);
const h=vm.runInContext('window.__h',ctx);
assert(h.indexOf('pet_crow.jpg')>=0&&h.indexOf('pet-portrait')>=0,'灵兽面板渲染立绘');
assert(h.indexOf('pet-gold')>=0,'进化（form≥2）金框');
assert(h.indexOf('onerror')>=0,'加载失败兜底');

// T4 社交页 + 仙途录含迷你立绘
vm.runInContext(`
  S.flag={}; panelSocial(); window.__s=document.getElementById('panelBody')._html;
`,ctx);
assert(vm.runInContext('window.__s',ctx).indexOf('pet-mini')>=0&&vm.runInContext('window.__s',ctx).indexOf('pet_crow.jpg')>=0,'社交页迷你立绘');

// T5 LICENSES 登记 + SW 覆盖
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
files.forEach(f=>{
  assert(lic.indexOf(f.replace('assets/',''))>=0,'LICENSES 登记 '+f);
  assert(sw.indexOf('"./'+f+'"')>=0,'SW 覆盖 '+f);
});

// T6 CSS 样式
const css=fs.readFileSync(path.join(root,'css','main.css'),'utf8');
assert(css.indexOf('.pet-gold')>=0&&css.indexOf('.pet-mini')>=0&&css.indexOf('.pet-emoji-fallback')>=0,'CSS 含金框/迷你/兜底样式');

console.log(fails===0?'smoke130: ALL PASS':'smoke130 FAILS: '+fails);
process.exit(fails?1:0);
