/* v54 模块图片化完整性冒烟：TABS 引用图全部存在 / 台账登记 / SW 缓存覆盖 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(require('path').join(process.env.TEMP||process.env.TMPDIR||require('os').tmpdir(),'xiantu_game.js'),'utf8');
function makeEl(){const el={_html:'',_txt:'',style:{},disabled:false,children:[],scrollTop:0,value:'',className:'',id:'',onclick:null,classList:{add(){},remove(){},toggle(){}},set innerHTML(v){this._html=String(v)},get innerHTML(){return this._html},set textContent(v){this._txt=String(v)},get textContent(){return this._txt},appendChild(c){this.children.push(c);if(c.innerHTML!==undefined&&c.innerHTML)this._html+=c.innerHTML},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},remove(){}};return el}
const ids={};
const document={getElementById(id){if(!ids[id])ids[id]=makeEl();return ids[id]},createElement(){return makeEl()},querySelectorAll(){return []}};
const store={};
const localStorage={getItem(k){return store[k]!==undefined?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}};
const ctx={document,localStorage,window:{},console,setTimeout:fn=>fn(),Math};
vm.createContext(ctx);vm.runInContext(js,ctx);
let fails=0;function assert(c,m){if(!c){fails++;console.log('FAIL:',m)}else console.log('ok  :',m)}

// T1 TABS 引用的页面横幅与模块图全部存在
vm.runInContext(`window.__refs=[]; TABS.forEach(t=>{window.__refs.push(t.hero); t.items.forEach(it=>it.img&&window.__refs.push(it.img));});`,ctx);
const refs=vm.runInContext('window.__refs',ctx);
const missing=refs.filter(p=>!fs.existsSync(path.join(root,p)));
assert(missing.length===0,'全部 '+refs.length+' 张引用图片存在（缺失：'+missing.join(',')+'）');

// T2 渲染时图卡带真实图片路径且 onerror 兜底
vm.runInContext(`S=newState('测',BACKGROUNDS[0]); PENDING=0; tabHome('cult'); window.__h=document.getElementById('panelBody')._html;`,ctx);
const html=vm.runInContext('window.__h',ctx);
assert(html.indexOf('assets/modules/cult_x.jpg')>=0&&html.indexOf('onerror')>=0&&html.indexOf('mod-emoji')>=0,'图卡渲染真实图片路径 + 加载失败兜底');

// T3 磁盘文件数与 TABS 引用数一致
const pageFiles=fs.readdirSync(path.join(root,'assets','pages')).filter(f=>f.endsWith('.jpg')).length;
const modFiles=fs.readdirSync(path.join(root,'assets','modules')).filter(f=>f.endsWith('.jpg')).length;
assert(pageFiles===6&&modFiles===refs.length-6,'assets/pages 6 张、assets/modules '+(refs.length-6)+' 张与引用一致');

// T4 授权台账登记行数与文件数一致
const lic=fs.readFileSync(path.join(root,'assets','LICENSES.md'),'utf8');
const licPages=(lic.match(/\| assets\/pages\//g)||[]).length;
const licMods=(lic.match(/\| assets\/modules\//g)||[]).length;
assert(licPages===pageFiles&&licMods===modFiles,'LICENSES.md 登记行数（pages '+licPages+'/modules '+licMods+'）与实际文件一致');

// T5 SW 离线缓存包含全部新图
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const missSw=refs.filter(p=>sw.indexOf('"./'+p+'"')<0);
assert(missSw.length===0,'sw.js ASSETS 覆盖全部新图（缺失：'+missSw.join(',')+'）');

console.log(fails===0?'smoke77: ALL PASS':'smoke77 FAILS: '+fails);
process.exit(fails?1:0);
