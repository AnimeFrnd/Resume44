/* ---------- helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = ()=>Math.random().toString(36).slice(2,10);
const IC={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 cv:'<path d="M3 8h18v12H3zM9 8V5h6v3M3 13h18"/>',
 mail:'<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 user:'<path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 folder:'<path d="M3 6h6l2 2h10v11H3z"/>',
 download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 spark:'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 copy:'<path d="M8 8h11v12H8z"/><path d="M5 16V4h11"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 layout:'<path d="M3 4h18v16H3z"/><path d="M3 9h18M9 9v11"/>',
 share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'
};
const icon=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
function toast(m,ms=3000){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);if(ms)toast.t=setTimeout(()=>t.classList.remove('show'),ms)}
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,p,v){const ks=p.split('.');const l=ks.pop();const t=ks.reduce((a,k)=>(a[k]==null?(a[k]={}):a[k]),o);t[l]=v}
const lines=t=>String(t||'').split('\n').map(s=>s.trim()).filter(Boolean);
const todayStr=()=>{const d=new Date();return String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear()};
const hex2rgb=h=>{h=h.replace('#','');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]};
const mix=(rgb,a)=>rgb.map(c=>Math.round(255-(255-c)*a));
async function copyStr(s){
  let ok=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(s);ok=true}}catch(e){}
  if(!ok){const ta=document.createElement('textarea');ta.value=s;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();try{ok=document.execCommand('copy')}catch(e){}ta.remove()}
  toast(ok?'Copied':'Select the text and copy it manually');
}

/* ---------- storage ---------- */
const mem={};
const hasWS=()=>typeof window.storage!=='undefined'&&window.storage&&typeof window.storage.get==='function';
function idb(){return new Promise((res,rej)=>{const q=indexedDB.open('resume44',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function idbSet(k,v){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res(true);t.onerror=t.onabort=()=>rej(t.error)})}
async function idbGet(k){const d=await idb();return new Promise((res,rej)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function loadKey(k,def){
  try{if(hasWS()){const r=await window.storage.get(k);if(r&&r.value)return JSON.parse(r.value)}}catch(e){}
  try{const v=localStorage.getItem(k);if(v)return JSON.parse(v)}catch(e){}
  try{const v=await idbGet(k);if(v)return JSON.parse(v)}catch(e){}
  try{return mem[k]?JSON.parse(mem[k]):def}catch(_){return def}
}
async function saveKey(k,v){
  const s=JSON.stringify(v);mem[k]=s;let ok=false;
  try{localStorage.setItem(k,s);ok=localStorage.getItem(k)===s}catch(e){}
  try{await idbSet(k,s);ok=true}catch(e){}
  try{if(hasWS()){await window.storage.set(k,s);ok=true}}catch(e){}
  return ok;
}
/* ---------- AI mode (master switch) ---------- */
const AIM={on:true};
const swHTML=()=>`<span class="swlbl">AI</span><span class="sw ${AIM.on?'on':''}" aria-hidden="true"><i></i></span><span class="swst">${AIM.on?'ON':'OFF'}</span>`;
function paintAI(){
  document.body.classList.toggle('ai-off',!AIM.on);
  const h=$('#aiSw');if(h){h.innerHTML=swHTML();h.setAttribute('aria-checked',AIM.on)}
  const d=$('#aiSwSide');if(d){d.innerHTML=swHTML();d.setAttribute('aria-checked',AIM.on)}
}
/* ---------- optional backend (accounts, analytics, AI proxy, admin templates) ---------- */
const API_BASE=(window.R44_API||'AQ.Ab8RN6K9z_lNfhKrv6-2tS2IpBpGalqDmqML5tiYXk4XfLQAbA').replace(/\/$/,'');
const BK={on:false,ai:false,token:'',user:null,device:''};
async function api(path,opt={}){
  const h={'Content-Type':'application/json'};if(BK.token)h.Authorization='Bearer '+BK.token;
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),opt.timeout||60000);
  try{
    const r=await fetch(API_BASE+path,{method:opt.method||'GET',headers:h,signal:ctl.signal,keepalive:!!opt.keepalive,body:opt.body?JSON.stringify(opt.body):undefined});
    let d=null;try{d=await r.json()}catch(e){}
    if(!r.ok){const e=new Error((d&&d.error)||('HTTP '+r.status));e.status=r.status;e.code=d&&d.error;throw e}
    return d;
  }finally{clearTimeout(tm)}
}
let errSent=0;
function track(type,meta){
  if(!BK.on)return;
  if(type==='error'&&++errSent>10)return;
  try{api('/api/event',{method:'POST',keepalive:true,body:{type,meta,device:BK.device},timeout:8000}).catch(()=>{})}catch(e){}
}
window.addEventListener('error',e=>track('error',{msg:String(e.message||'').slice(0,100),at:String((e.filename||'').split('/').pop())+':'+(e.lineno||'')}));
window.addEventListener('unhandledrejection',e=>track('error',{msg:String((e.reason&&e.reason.message)||e.reason||'').slice(0,100)}));
async function initBackend(){
  let dev=await loadKey('r44:device','');if(!dev){dev=uid()+uid();await saveKey('r44:device',dev)}BK.device=dev;
  try{const h=await api('/api/health',{timeout:5000});BK.on=!!(h&&h.ok);BK.ai=!!(h&&h.ai)}catch(e){BK.on=false}
  if(!BK.on)return;
  BK.token=await loadKey('r44:auth','')||'';
  if(BK.token){try{BK.user=(await api('/api/me')).user}catch(e){BK.token='';BK.user=null;saveKey('r44:auth','')}}
  try{S.featured=((await api('/api/templates')).templates||[]).map(t=>({id:t.id,payload:normPayload(Object.assign({},t,{v:1}))}))}catch(e){S.featured=[]}
  track('visit');
}
let saveT,metaT;
const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>saveKey('r44:resumes',S.resumes),500)};
const persistMeta=()=>{clearTimeout(metaT);metaT=setTimeout(()=>saveKey('r44:meta',{templates:S.templates,pub:S.pub}),300)};

/* ---------- themes ---------- */
const BASE={accent:'#1d5be0',head:'underline',font:'sans',align:'left',fresher:false,photo:false,eduTable:false,skillsCheck:false,nameLine:false,thick:false,caps:false,profile:false,declaration:false};
const FR={fresher:true,photo:true,eduTable:true,skillsCheck:true,nameLine:true,thick:true,caps:true,profile:true,declaration:true};
const PRESETS={
 modern:{name:'Modern Blue',...BASE},
 classic:{name:'Classic Serif',...BASE,accent:'#1a2238',font:'serif',align:'center',caps:true},
 bar:{name:'Highlight Bar',...BASE,head:'bar'},
 tint:{name:'Soft Highlight',...BASE,head:'tint',accent:'#0f766e'},
 marker:{name:'Marker',...BASE,head:'marker',accent:'#7c3aed'},
 fresher:{name:'Fresher Classic',...BASE,...FR,accent:'#111111',head:'text',nameLine:true,thick:true},
 fresherBar:{name:'Fresher Highlight',...BASE,...FR,head:'bar'},
 fresherTint:{name:'Fresher Soft',...BASE,...FR,head:'tint',accent:'#0f766e'},
 fresherMarker:{name:'Fresher Marker',...BASE,...FR,head:'marker',accent:'#be123c',nameLine:true}
};
const HEADS=[['text','Underlined text'],['underline','Full rule'],['bar','Solid bar'],['tint','Soft bar'],['marker','Marker']];
const SWATCHES=['#1d5be0','#0f766e','#7c3aed','#be123c','#c2410c','#0e7490','#4d7c0f','#111111'];
const SECS=[['summary','Summary or objective'],['experience','Experience'],['projects','Projects'],['education','Education'],['skills','Skills']];
const TG=[['photo','Photo'],['fresher','Fresher format (education first, labelled contact lines)'],['eduTable','Education as a table'],['skillsCheck','Skills as a checklist'],['nameLine','Line under name'],['thick','Thick divider under header'],['caps','Uppercase headings'],['profile','Personal profile (father, date of birth, etc.)'],['declaration','Declaration with place, date and signature']];
function cleanTheme(t){
  t=t||{};const o={preset:'custom',hide:{}};
  o.accent=/^#[0-9a-f]{6}$/i.test(t.accent||'')?t.accent:BASE.accent;
  o.head=HEADS.some(h=>h[0]===t.head)?t.head:'underline';
  o.font=t.font==='serif'?'serif':'sans';o.align=t.align==='center'?'center':'left';
  ['fresher','photo','eduTable','skillsCheck','nameLine','thick','caps','profile','declaration'].forEach(k=>o[k]=!!t[k]);
  SECS.forEach(([k])=>{if(t.hide&&t.hide[k])o.hide[k]=true});
  if(PRESETS[t.preset])o.preset=t.preset;
  return o;
}
const mkTheme=id=>cleanTheme({...PRESETS[id],preset:id});
const DECL='I hereby declare that the details above are correct and true to the best of my knowledge.';

/* ---------- state ---------- */
const S={view:'home',resumes:[],templates:[],pub:[],gallery:null,cur:null,tab:'edit',shareOpen:false,sh:{name:'',author:'',sample:false,code:''},
  f:{cl:{tone:'Professional'},ats:{},iv:{level:'Mid-level',type:'Mixed'},ob:{level:'Fresher'},si:{ctx:'Job interview',len:'60 seconds'},imp:{},acc:{mode:'login'}},featured:[],out:{},ats:null,delArm:null};
const blank=(type='resume')=>({id:uid(),type,title:type==='cv'?'Untitled CV':'Untitled resume',theme:mkTheme('fresher'),updated:Date.now(),saved:false,photo:'',
  personal:{name:'',role:'',email:'',phone:'',location:'',link:''},summary:'',
  experience:[{role:'',company:'',start:'',end:'',desc:''}],education:[{degree:'',school:'',board:'',start:'',end:'',marks:''}],
  projects:[],skills:'',certs:'',languages:'',awards:'',
  profile:{father:'',dob:'',languages:'',gender:'',marital:'',nationality:'',strengths:''},decl:{text:DECL,place:'',date:''}});
function migrate(r){
  const b=blank(r.type||'resume');
  r.theme=r.theme?cleanTheme(r.theme):mkTheme(r.template==='classic'?'classic':'modern');
  r.profile=Object.assign(b.profile,r.profile);r.decl=Object.assign(b.decl,r.decl);r.photo=r.photo||'';
  r.education=(r.education||[]).map(e=>({degree:e.degree||'',school:e.school||'',board:e.board||'',start:e.start||'',end:e.end||'',marks:e.marks!=null?e.marks:(e.note||'')}));
  r.projects=r.projects||[];r.experience=r.experience||[];
  ['summary','skills','certs','languages','awards'].forEach(k=>r[k]=r[k]||'');
  return r;
}
function sample(type='resume'){
  const r=blank(type);r.title='Sample '+(type==='cv'?'CV':'resume');
  Object.assign(r.personal,{name:'Arya Sharma',role:'Frontend Developer',email:'arya.sharma@email.com',phone:'+91 98765 43210',location:'Hyderabad, India',link:'linkedin.com/in/aryasharma'});
  r.summary='Motivated and adaptable developer seeking an opportunity in a growth-oriented company where I can use my skills, keep learning and contribute to the team\u2019s goals.';
  r.experience=[{role:'Frontend Developer',company:'BrightPay Technologies',start:'Jun 2023',end:'',desc:'Rebuilt the checkout flow in React, cutting page load time by 38%\nLed migration of 40+ components to a shared design system\nMentored 2 interns and ran weekly code reviews'},
    {role:'Web Development Intern',company:'Nimbus Labs',start:'Jan 2023',end:'May 2023',desc:'Built 6 responsive landing pages used in marketing campaigns\nFixed 25+ UI bugs and improved Lighthouse score from 62 to 91'}];
  r.education=[{degree:'B.Tech in Computer Science',school:'Sri Vidya Engineering College',board:'JNTU Hyderabad',start:'2019',end:'2023',marks:'8.4'},
    {degree:'Intermediate MPC',school:'Govt Junior College',board:'Board of Intermediate',start:'2017',end:'2019',marks:'940'},
    {degree:'SSC',school:'Govt High School',board:'S.S.C',start:'2016',end:'2017',marks:'560'}];
  r.projects=[{name:'TaskFlow',desc:'Kanban app with drag and drop, offline support and 2,000+ monthly users'}];
  r.skills='Communication Skills, Problem Solving Skills, Teamwork & Adaptability, React, JavaScript, Git';
  r.certs='Meta Front-End Developer Certificate\nGoogle UX Design Certificate';r.languages='English, Hindi, Telugu';r.awards='Hackathon winner, TechFest 2022\nEmployee of the quarter, Q2 2024';
  Object.assign(r.profile,{father:'R. Sharma',dob:'2001 Mar 14',languages:'English, Hindi, Telugu',gender:'Male',marital:'Single',nationality:'Indian',strengths:'Quick learner, self-motivated, willingness to learn'});
  Object.assign(r.decl,{place:'Hyderabad',date:todayStr()});
  return r;
}

/* ---------- tools & navigation ---------- */
const TOOLS=[
 {id:'builder',name:'AI Resume Builder',desc:'Build a resume with live preview',icon:'file'},
 {id:'cv',name:'Professional CV Maker',desc:'Longer format with certifications and awards',icon:'cv'},
 {id:'templates',name:'Themes & Sharing',desc:'Highlighted headings, fresher layouts, friends\u2019 templates',icon:'layout'},
 {id:'cover',name:'Cover Letter Generator',desc:'A tailored letter for any job',icon:'mail'},
 {id:'ats',name:'ATS Resume Checker',desc:'Score your resume against a job post',icon:'shield'},
 {id:'interview',name:'Interview Preparation',desc:'Likely questions with answer tips',icon:'chat'},
 {id:'objective',name:'Career Objective Generator',desc:'Short objectives you can paste in',icon:'target'},
 {id:'intro',name:'Self Introduction Generator',desc:'A spoken intro for any situation',icon:'user'},
 {id:'resumes',name:'My Resumes',desc:'Edit, duplicate and download PDFs',icon:'folder'}
];
const isOn=id=>S.view===id||(S.view==='builder'&&S.cur&&((id==='builder'&&S.cur.type==='resume')||(id==='cv'&&S.cur.type==='cv')));
function navItems(){
  $('#side').innerHTML=`<div class="logo"><i>R</i><span>Resume<b>44</b></span></div>
   <button class="nav ${S.view==='home'?'on':''}" data-act="nav" data-v="home">${icon('home')}Dashboard</button><hr>`+
   TOOLS.map(t=>`<button class="nav ${isOn(t.id)?'on':''}" data-act="nav" data-v="${t.id}">${icon(t.icon)}${t.name}</button>`).join('')+(BK.on?`<hr><button class="nav ${S.view==='account'?'on':''}" data-act="nav" data-v="account">${icon('user')}${BK.user?esc(BK.user.name):'Account'}</button>`:'');
  const b=[['home','Home','home'],['builder','Build','file'],['templates','Themes','layout'],['ats','ATS','shield'],['resumes','Resumes','folder']];
  $('#bottom').innerHTML=b.map(([id,l,ic])=>`<button class="${(id==='home'?S.view==='home':isOn(id))?'on':''}" data-act="nav" data-v="${id}">${icon(ic,22)}${l}</button>`).join('');
  $('#menuBtn').innerHTML=icon('menu');
  $('#side').insertAdjacentHTML('beforeend','<hr><button class="nav aitog" id="aiSwSide" role="switch" data-act="aiToggle"></button>');
  paintAI();
}
function go(v,opts={}){
  $('#side').classList.remove('open');$('#scrim').classList.remove('open');
  S.delArm=null;
  if(v==='builder'||v==='cv'){
    const type=v==='cv'?'cv':'resume';
    if(opts.cur){S.cur=opts.cur;track('resume_created',{type})}
    else if(opts.id)S.cur=S.resumes.find(r=>r.id===opts.id);
    else if(opts.fresh||!S.cur||S.cur.type!==type){S.cur=blank(type);track('resume_created',{type});track('template_used',{tpl:'modern'})}
    S.view='builder';S.tab='edit';S.shareOpen=false;
  }else S.view=v;
  render();window.scrollTo(0,0);
}
function render(){
  navItems();
  const V={home:vHome,builder:vBuilder,templates:vTemplates,cover:vCover,ats:vATS,interview:vInterview,objective:vObjective,intro:vIntro,resumes:vResumes,account:vAccount};
  $('#main').innerHTML=V[S.view]();
  if(S.view==='builder'){renderForm();renderPreview()}
  if(S.view==='templates')fitMinis();
}

/* ---------- views ---------- */
function resumeRow(r){
  return `<div class="ritem"><div style="color:var(--blue)">${icon(r.type==='cv'?'cv':'file',22)}</div>
   <div class="t"><b>${esc(r.title||'Untitled')}</b><small>${r.type==='cv'?'CV':'Resume'} · edited ${new Date(r.updated).toLocaleDateString()}</small></div>
   <button class="btn sm soft" data-act="openRes" data-id="${r.id}">Edit</button></div>`;
}
function vHome(){
  const recent=S.resumes.slice(0,3);
  return `<section class="hero"><div><h1>Build a resume that gets read.</h1>
   <p>Pick a theme, fill in your details, and download a clean PDF in minutes. Share your favourite layout with friends so they can make it their own.</p>
   <div class="row"><button class="btn pri" data-act="newRes" data-type="resume">${icon('plus',18)}Build my resume</button>
   <button class="btn ghost" data-act="nav" data-v="templates">Explore themes</button></div></div>
   <div class="sheet" aria-hidden="true"><div class="n">Your Name</div><div class="l" style="width:60%"></div><div class="h"></div><div class="l"></div><div class="l" style="width:88%"></div><div class="l" style="width:70%"></div><div class="h"></div><div class="l"></div><div class="l" style="width:80%"></div><div class="ok">${icon('check',14)}ATS friendly</div></div></section>
   <h2 class="sec-t">Everything you need</h2>
   <div class="tools">${TOOLS.map(t=>`<button class="tool" data-act="nav" data-v="${t.id}"><span class="ic">${icon(t.icon,22)}</span><b>${t.name}</b><span>${t.desc}</span></button>`).join('')}</div>
   <h2 class="sec-t">Recent resumes</h2>
   ${recent.length?`<div class="rlist">${recent.map(resumeRow).join('')}</div>`:`<div class="empty">You have not saved a resume yet.<br><button class="btn pri" data-act="newRes" data-type="resume">Start your first resume</button></div>`}`;
}

/* builder */
function vBuilder(){
  const r=S.cur;
  return `<div class="bhead"><input id="titleIn" data-path="title" value="${esc(r.title)}" aria-label="Document name">
    <button class="btn sm" data-act="sample">Try sample data</button>
    <button class="btn sm" data-act="save">${icon('check',16)}Save</button>
    <button class="btn sm pri" data-act="pdf">${icon('download',16)}Download PDF</button><button class="btn sm" data-act="docx">Download DOCX</button></div>
   <div class="tabs"><button class="${S.tab==='edit'?'on':''}" data-act="tab" data-v="edit">Edit</button><button class="${S.tab==='prev'?'on':''}" data-act="tab" data-v="prev">Preview</button></div>
   <div class="builder" id="builder" data-tab="${S.tab}">
     <div class="form" id="form"></div>
     <div class="prev"><div class="paper" id="paper"></div></div>
   </div>`;
}
const inp=(label,path,ph='',type='text')=>`<label class="f"><span>${label}</span><input type="${type}" data-path="${path}" value="${esc(getPath(S.cur,path))}" placeholder="${esc(ph)}" autocomplete="off"></label>`;
const area=(label,path,ph='',hint='',rows=4)=>`<label class="f">${label?`<span>${label}</span>`:''}<textarea rows="${rows}" data-path="${path}" placeholder="${esc(ph)}">${esc(getPath(S.cur,path))}</textarea>${hint?`<div class="hint">${hint}</div>`:''}</label>`;

function themeCard(){
  const t=S.cur.theme,sh=S.sh;
  return `<div class="card fs"><h3>Theme and layout</h3>
   <div class="pres" role="group" aria-label="Themes">${Object.entries(PRESETS).map(([id,p])=>`<button class="pre ${t.preset===id?'on':''}" data-act="preset" data-v="${id}"><i style="background:${p.accent}"></i>${p.name}</button>`).join('')}</div>
   <div class="row" style="margin:8px 0"><button class="btn soft" data-act="atsMode">✓ Make this resume ATS-friendly</button><span class="hint">Removes photo and uses a simple single-column style.</span></div>
   <div class="sub-t">Heading style</div>
   <div class="seg" role="group" aria-label="Heading style">${HEADS.map(([k,l])=>`<button data-act="head" data-v="${k}" class="${t.head===k?'on':''}">${l}</button>`).join('')}</div>
   <div class="sub-t">Accent colour</div>
   <div class="sws">${SWATCHES.map(c=>`<button class="sw ${t.accent.toLowerCase()===c?'on':''}" style="background:${c}" data-act="accent" data-v="${c}" aria-label="Colour ${c}"></button>`).join('')}<input type="color" data-color="1" value="${t.accent}" aria-label="Custom colour"></div>
   <div class="sub-t">Font and header</div>
   <div class="seg"><button data-act="font" data-v="sans" class="${t.font==='sans'?'on':''}">Sans</button><button data-act="font" data-v="serif" class="${t.font==='serif'?'on':''}">Serif</button></div>
   <div class="seg" style="margin-left:6px"><button data-act="align" data-v="left" class="${t.align==='left'?'on':''}">Left</button><button data-act="align" data-v="center" class="${t.align==='center'?'on':''}">Centred</button></div>
   <div class="sub-t">Layout options</div>
   <div class="tgs">${TG.map(([k,l])=>`<label class="tg"><input type="checkbox" data-tg="${k}" ${t[k]?'checked':''}>${l}</label>`).join('')}</div>
   <div class="sub-t">Sections to show</div>
   <div class="tgs">${SECS.map(([k,l])=>`<label class="tg"><input type="checkbox" data-hide="${k}" ${t.hide[k]?'':'checked'}>${l}</label>`).join('')}</div>
   <div class="row" style="margin-top:12px"><button class="btn soft" data-act="shareToggle">${icon('share',16)}Share this theme</button></div>
   ${S.shareOpen?`<div class="item" style="margin-top:12px">
     <label class="f"><span>Template name</span><input data-sh="name" value="${esc(sh.name)}" placeholder="${esc(S.cur.title)}"></label>
     <label class="f"><span>Your name (optional)</span><input data-sh="author" value="${esc(sh.author)}" placeholder="Shown to friends"></label>
     <label class="tg"><input type="checkbox" data-sh="sample" ${sh.sample?'checked':''}>Include my text as an example (summary, experience, education, skills)</label>
     <div class="hint">Your name, contact details, photo and personal profile are never shared. Only the theme, plus the example text if you tick the box.</div>
     <div class="row" style="margin-top:12px"><button class="btn sm pri" data-act="mkCode">Create share code</button><button class="btn sm" data-act="pubTpl">Publish to friends\u2019 gallery</button><button class="btn sm" data-act="saveTpl">Save to my templates</button></div>
     ${sh.code?`<code class="cd" id="shCode">${esc(sh.code)}</code><div class="row" style="margin-top:8px"><button class="btn sm" data-act="copyCode">${icon('copy',15)}Copy code</button><button class="btn sm" data-act="nativeShare">${icon('share',15)}Share\u2026</button></div><div class="hint">Send this code to a friend. They paste it in Themes &amp; Sharing to use and customize your theme.</div>`:''}
     <div class="hint">Published templates are visible to everyone who uses Resume44.</div></div>`:''}
  </div>`;
}
function renderForm(){
  const y=window.scrollY,r=S.cur,t=r.theme,cv=r.type==='cv',f=t.fresher;
  $('#form').innerHTML=`${importCard()}${themeCard()}
  <div class="card fs"><h3>Personal details</h3>
    <div class="photo-row">${r.photo?`<img src="${esc(r.photo)}" alt="Your photo">`:`<div class="pp">No photo</div>`}
      <div><div class="row"><label class="btn sm soft upl">${icon('upload',15)}<span>${r.photo?'Change photo':'Upload photo'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/*" data-photo="1"></label>${r.photo?`<button class="btn sm danger" data-act="photoRemove">Remove</button>`:''}</div><div class="hint">JPG or PNG. Shown on themes with a photo box.</div></div></div>
    <div class="two">${inp('Full name','personal.name','Arya Sharma')}${inp('Job title (optional)','personal.role','Frontend Developer')}</div>
    <div class="two">${inp('Email','personal.email','you@email.com','email')}${inp('Phone','personal.phone','+91 98765 43210','tel')}</div>
    <div class="two">${inp(f?'Address':'Location','personal.location','City, Country')}${inp('Website or LinkedIn','personal.link','linkedin.com/in/you')}</div></div>
  <div class="card fs"><h3>${f?'Career objective':(cv?'Profile':'Summary')}<button class="btn sm soft" data-act="aiSummary">${icon('spark',16)}Write with AI</button></h3>
    ${area('','summary','2 to 3 sentences about who you are and what you do best.','',4)}</div>
  <div class="card fs"><h3>Experience<button class="btn sm soft" data-act="addExp">${icon('plus',16)}Add</button></h3>
    ${r.experience.map((e,i)=>`<div class="item"><div class="ih"><span>Position ${i+1}</span><button class="btn sm danger" data-act="delExp" data-i="${i}" aria-label="Remove position ${i+1}">${icon('trash',15)}</button></div>
      <div class="two">${inp('Job title',`experience.${i}.role`)}${inp('Company',`experience.${i}.company`)}</div>
      <div class="two">${inp('Start',`experience.${i}.start`,'Jun 2023')}${inp('End',`experience.${i}.end`,'Leave empty if current')}</div>
      ${area('What you did',`experience.${i}.desc`,'One achievement per line','One achievement per line. Numbers help, like "cut load time by 38%".',4)}
      <button class="btn sm soft" data-act="improve" data-i="${i}">${icon('spark',16)}Improve with AI</button></div>`).join('')||'<div class="hint">No positions yet. Freshers can add internships or skip this.</div>'}</div>
  <div class="card fs"><h3>Education<button class="btn sm soft" data-act="addEdu">${icon('plus',16)}Add</button></h3>
    ${r.education.map((e,i)=>`<div class="item"><div class="ih"><span>Education ${i+1}</span><button class="btn sm danger" data-act="delEdu" data-i="${i}" aria-label="Remove education ${i+1}">${icon('trash',15)}</button></div>
      <div class="two">${inp('Qualification',`education.${i}.degree`,'Degree BSc Chemistry')}${inp('Institution',`education.${i}.school`)}</div>
      ${inp('University or board',`education.${i}.board`)}
      <div class="two">${inp('Start year',`education.${i}.start`)}${inp('Year of passing',`education.${i}.end`)}</div>
      ${inp('Marks, % or CGPA',`education.${i}.marks`)}</div>`).join('')}</div>
  <div class="card fs"><h3>Projects<button class="btn sm soft" data-act="addProj">${icon('plus',16)}Add</button></h3>
    ${r.projects.map((p,i)=>`<div class="item"><div class="ih"><span>Project ${i+1}</span><button class="btn sm danger" data-act="delProj" data-i="${i}" aria-label="Remove project ${i+1}">${icon('trash',15)}</button></div>
      ${inp('Name',`projects.${i}.name`)}${area('Description',`projects.${i}.desc`,'','',2)}</div>`).join('')||'<div class="hint">Optional. Great for freshers and career changers.</div>'}</div>
  <div class="card fs"><h3>Skills</h3>${area('','skills','Communication Skills, Problem Solving, Teamwork','Separate skills with commas.',2)}</div>
  ${cv?`<div class="card fs"><h3>CV extras</h3>
    ${area('Certifications','certs','','One per line',3)}${inp('Languages','languages','English, Hindi')}${area('Awards and achievements','awards','','One per line',3)}</div>`:''}
  ${t.profile?`<div class="card fs"><h3>Personal profile</h3>
    <div class="two">${inp('Father\u2019s name','profile.father')}${inp('Date of birth','profile.dob','2006 Jun 20')}</div>
    <div class="two">${inp('Languages known','profile.languages','English, Telugu')}${inp('Sex','profile.gender')}</div>
    <div class="two">${inp('Marital status','profile.marital')}${inp('Nationality','profile.nationality')}</div>
    ${inp('Strengths','profile.strengths','Quick learner, self-motivated')}</div>`:''}
  ${t.declaration?`<div class="card fs"><h3>Declaration</h3>${area('','decl.text','','',2)}
    <div class="two">${inp('Place','decl.place')}${inp('Date','decl.date','24-03-2026')}</div></div>`:''}
  <div class="row" style="margin-bottom:20px"><button class="btn pri" data-act="save">${icon('check',16)}Save to My Resumes</button><button class="btn" data-act="pdf">${icon('download',16)}Download PDF</button><button class="btn" data-act="docx">Download DOCX</button></div>`;
  window.scrollTo(0,y);
}

/* paper rendering (preview, minis) */
const dates=(s,e)=>s?`${esc(s)} – ${esc(e||'Present')}`:esc(e||'');
function titles(r){const f=r.theme.fresher;return {summary:f?'Career Objective':(r.type==='cv'?'Profile':'Summary'),experience:'Experience',projects:'Projects',education:f?'Educational Qualification':'Education',skills:'Skills',certs:'Certifications',languages:'Languages',awards:'Awards and achievements',profile:'Personal Profile',declaration:'Declaration'}}
const profRows=r=>{const p=r.profile;return [['Father\u2019s Name',p.father],['Date of Birth',p.dob],['Languages Known',p.languages],['Sex',p.gender],['Marital Status',p.marital],['Nationality',p.nationality],['Strengths',p.strengths]].filter(x=>x[1]&&x[1].trim())};
function has(r,k){switch(k){
  case 'summary':return r.summary.trim();
  case 'experience':return r.experience.some(e=>e.role||e.company||e.desc);
  case 'projects':return r.projects.some(x=>x.name||x.desc);
  case 'education':return r.education.some(e=>e.degree||e.school);
  case 'skills':return r.skills.trim();
  case 'certs':return lines(r.certs).length;
  case 'languages':return r.languages.trim();
  case 'awards':return lines(r.awards).length;
  case 'profile':return profRows(r).length;
  case 'declaration':return true}}
function order(r){
  const t=r.theme,b=t.fresher?['summary','education','experience','projects','skills']:['summary','experience','projects','education','skills'];
  if(r.type==='cv')b.push('certs','languages','awards');
  if(t.profile)b.push('profile');if(t.declaration)b.push('declaration');
  return b.filter(k=>!t.hide[k]&&has(r,k));
}
const skillList=r=>r.skills.split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
function secHTML(r,k){
  const t=r.theme,li=a=>`<ul>${a.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`;
  switch(k){
   case 'summary':return `<div>${esc(r.summary)}</div>`;
   case 'experience':return r.experience.filter(e=>e.role||e.company||e.desc).map(e=>`<div class="er"><span>${esc(e.role)}</span><span>${dates(e.start,e.end)}</span></div>${e.company?`<div class="sub">${esc(e.company)}</div>`:''}${lines(e.desc).length?li(lines(e.desc)):''}`).join('');
   case 'projects':return r.projects.filter(x=>x.name||x.desc).map(x=>`<div style="margin-top:6px"><b>${esc(x.name)}</b>${x.desc?` – ${esc(x.desc)}`:''}</div>`).join('');
   case 'education':{
     const ed=r.education.filter(e=>e.degree||e.school);
     if(t.eduTable)return `<table class="edu"><tr><th>Qualification</th><th>Institution</th><th>University/Board</th><th>Year</th><th>Marks/%</th></tr>${ed.map(e=>`<tr><td>${esc(e.degree)}</td><td>${esc(e.school)}</td><td>${esc(e.board)}</td><td>${esc(e.end||e.start)}</td><td>${esc(e.marks)}</td></tr>`).join('')}</table>`;
     return ed.map(e=>`<div class="er"><span>${esc(e.degree)}</span><span>${dates(e.start,e.end)}</span></div><div class="sub">${esc([e.school,e.board,e.marks].filter(Boolean).join(' · '))}</div>`).join('')}
   case 'skills':return t.skillsCheck?`<ul class="tk">${skillList(r).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:`<div>${esc(r.skills)}</div>`;
   case 'certs':return li(lines(r.certs));
   case 'languages':return `<div>${esc(r.languages)}</div>`;
   case 'awards':return li(lines(r.awards));
   case 'profile':return `<table class="pf">${profRows(r).map(([l,v])=>`<tr><td>${l}</td><td>:</td><td>${esc(v)}</td></tr>`).join('')}</table>`;
   case 'declaration':return `<div>${esc(r.decl.text)}</div><div class="decl"><div><b>Place:</b> ${esc(r.decl.place)}<br><b>Date:</b> ${esc(r.decl.date)}</div><div style="text-align:right"><b>Signature</b><br><u><b>${esc(r.personal.name)}</b></u></div></div>`;
  }
}
function paperInner(r){
  const t=r.theme,p=r.personal,T=titles(r);
  let left=`<h1>${p.name?esc(p.name):'<span class="ph">Your name</span>'}</h1>`;
  if(p.role)left+=`<div class="role">${esc(p.role)}</div>`;
  if(t.fresher)left+=[['Address',p.location],['Phone No.',p.phone],['Email ID',p.email],['Link',p.link]].filter(x=>x[1]).map(([l,v])=>`<div class="lab"><b>${l}:</b> ${esc(v)}</div>`).join('');
  else{const c=[p.email,p.phone,p.location,p.link].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ');if(c)left+=`<div class="ct">${c}</div>`}
  const pic=t.photo?(r.photo?`<img class="phimg" alt="Photo" src="${esc(r.photo)}">`:`<div class="phph">Photo</div>`):'';
  let h=`<div class="hd"><div class="hl">${left}</div>${pic}</div>${t.thick?'<div class="thick"></div>':''}`;
  order(r).forEach(k=>{h+=`<h2>${T[k]}</h2>`+secHTML(r,k)});
  return h;
}
const paperCls=r=>{const t=r.theme;return `paper ${t.font==='serif'?'serif ':''}h-${t.head} ${t.align==='center'?'ctr ':''}${t.fresher?'fr ':''}${t.nameLine?'nl ':''}${t.caps?'caps':''}`};
const paperStyle=r=>{const c=hex2rgb(r.theme.accent);return `--ac:${r.theme.accent};--act:rgba(${c[0]},${c[1]},${c[2]},.14)`};
function renderPreview(){const el=$('#paper');if(!el)return;el.className=paperCls(S.cur);el.setAttribute('style',paperStyle(S.cur));el.innerHTML=paperInner(S.cur)}
function miniHTML(theme){const r=sample('resume');r.theme=theme;return `<div class="mini"><div class="${paperCls(r)}" style="${paperStyle(r)}">${paperInner(r)}</div></div>`}
function fitMinis(){document.querySelectorAll('.mini').forEach(m=>{const p=m.firstElementChild,s=m.clientWidth/560;if(!s)return;p.style.transform=`scale(${s})`;m.style.height=Math.round(m.clientWidth*1.28)+'px'})}
window.addEventListener('resize',()=>{if(S.view==='templates')fitMinis()});

/* templates page */
function tcard(o){return `<div class="tcard">${miniHTML(o.theme)}<div><b>${esc(o.name)}</b><div class="hint" style="margin-top:2px">${esc(o.sub||'')}</div></div><div class="row">${o.actions}</div></div>`}
function vTemplates(){
  const builtin=Object.keys(PRESETS).map(id=>tcard({name:PRESETS[id].name,sub:PRESETS[id].fresher?'Fresher format with photo':'Standard format',theme:mkTheme(id),actions:`<button class="btn sm pri" data-act="useBuiltin" data-id="${id}">Use theme</button>`})).join('');
  const mine=S.templates.map(t=>tcard({name:t.payload.name,sub:t.payload.sample?'With example text':'Theme only',theme:t.payload.theme,
    actions:`<button class="btn sm pri" data-act="useTpl" data-src="mine" data-id="${t.id}">Use</button><button class="btn sm" data-act="codeTpl" data-id="${t.id}">${icon('share',14)}Code</button><button class="btn sm" data-act="pubMine" data-id="${t.id}">Publish</button><button class="btn sm danger" data-act="delTpl" data-id="${t.id}" aria-label="Delete template">${icon('trash',14)}</button>`})).join('');
  const feat=(S.featured||[]).map(t=>tcard({name:t.payload.name,sub:'Featured',theme:t.payload.theme,actions:`<button class="btn sm pri" data-act="useTpl" data-src="feat" data-id="${esc(t.id)}">Use</button>`})).join('');
  let gal;
  if(S.gallery===null)gal=`<div class="empty">See templates your friends published.<br><button class="btn pri" data-act="loadGal">Load friends\u2019 templates</button></div>`;
  else if(!S.gallery.length)gal=`<div class="empty">No published templates yet. Be the first: open the builder and tap Share this theme.<br><button class="btn" data-act="loadGal">Refresh</button></div>`;
  else gal=`<div class="gal">${S.gallery.map(g=>tcard({name:g.payload.name,sub:g.payload.author?'by '+g.payload.author:'Shared by a friend',theme:g.payload.theme,
    actions:`<button class="btn sm pri" data-act="useTpl" data-src="gal" data-id="${esc(g.key)}">Use</button><button class="btn sm" data-act="keepTpl" data-id="${esc(g.key)}">Save</button>${S.pub.includes(g.key)?`<button class="btn sm danger" data-act="removePub" data-id="${esc(g.key)}">Remove</button>`:''}`})).join('')}</div><div class="row" style="margin-top:12px"><button class="btn sm" data-act="loadGal">Refresh</button></div>`;
  return `<div class="page-h"><h1>Themes and sharing</h1><p>Pick a theme, or use one a friend shared. Every theme can be customized once it is in your resume: colours, heading style, sections and more.</p></div>
  <h2 class="sec-t" style="margin-top:0">Themes</h2><div class="gal">${builtin}</div>${feat?`<h2 class="sec-t">Featured templates</h2><div class="gal">${feat}</div>`:''}
  <h2 class="sec-t">Start from a photo</h2>
  <div class="card imp"><p class="hint" style="margin:0">Upload a photo or screenshot of a resume you like. We pick up its main colour and its text, then start a resume for you. Choose the closest theme afterwards.</p><div class="row">${upl('tpl.image','Upload resume photo')}</div></div>
  <h2 class="sec-t">Have a share code?</h2>
  <details class="card imp"><summary>I have a share code from a friend</summary><label class="f" style="margin:10px 0 0"><span>Paste a share code</span><textarea rows="3" data-f="imp.code" placeholder="R44-…">${esc(S.f.imp.code||'')}</textarea></label>
   <div class="row"><button class="btn pri" data-act="importCode">Add template</button><span class="hint" style="margin:0">Codes come from a friend\u2019s Share this theme panel.</span></div></details>
  <h2 class="sec-t">Friends\u2019 gallery</h2>${gal}
  <h2 class="sec-t">My templates</h2>${S.templates.length?`<div class="gal">${mine}</div>`:`<div class="empty">Templates you save or import appear here.</div>`}`;
}

/* account */
function vAccount(){
  const note=`<p class="hint" style="margin-top:12px">We count usage such as downloads and uploads to improve the app. Your resume content stays on your device.</p>
  ${!API_BASE?'<p class="hint">Cloud accounts, AI services and secure admin analytics need a configured server API. This standalone HTML file cannot securely provide those services.</p>':''}`;
  if(BK.user)return head('Your account','You are logged in.')+`<div class="card"><b>${esc(BK.user.name)}</b><div class="hint">${esc(BK.user.email)}</div><div class="row" style="margin-top:12px"><button class="btn danger" data-act="logout">Log out</button></div>${note}</div>`;
  const a=S.f.acc,su=a.mode==='signup';
  return head(su?'Create an account':'Log in','An account is optional. Your resumes stay on this device either way.')+
  `<div class="card"><div class="seg"><button class="${su?'':'on'}" data-act="acMode" data-v="login">Log in</button><button class="${su?'on':''}" data-act="acMode" data-v="signup">Sign up</button></div>
   ${su?fin('Name','acc.name','Arya Sharma'):''}
   <label class="f"><span>Email</span><input type="email" data-f="acc.email" value="${esc(a.email||'')}" autocomplete="email" placeholder="you@email.com"></label>
   <label class="f"><span>Password</span><input type="password" data-f="acc.pass" value="${esc(a.pass||'')}" autocomplete="${su?'new-password':'current-password'}" placeholder="At least 8 characters"></label>
   <button class="btn pri" data-act="authGo">${su?'Create account':'Log in'}</button>${note}</div>`;
}

/* simple tool pages */
const sel=(label,path,opts)=>`<label class="f"><span>${label}</span><select data-f="${path}">${opts.map(o=>`<option ${getPath(S.f,path)===o?'selected':''}>${o}</option>`).join('')}</select></label>`;
const fin=(label,path,ph='',hint='')=>`<label class="f"><span>${label}</span><input data-f="${path}" value="${esc(getPath(S.f,path)||'')}" placeholder="${esc(ph)}" autocomplete="off">${hint?`<div class="hint">${hint}</div>`:''}</label>`;
const fta=(label,path,ph='',rows=4,hint='')=>`<label class="f"><span>${label}</span><textarea rows="${rows}" data-f="${path}" placeholder="${esc(ph)}">${esc(getPath(S.f,path)||'')}</textarea>${hint?`<div class="hint">${hint}</div>`:''}</label>`;
const resPick=()=>S.resumes.length?`<label class="f"><span>Fill from a saved resume (optional)</span><select data-load="1"><option value="">Choose…</option>${S.resumes.map(r=>`<option value="${r.id}">${esc(r.title)}</option>`).join('')}</select></label>`:'';
const head=(t,p)=>`<div class="page-h"><h1>${t}</h1><p>${p}</p></div>`;

function vCover(){
  return head('Cover Letter Generator','Tell us about the job and yourself. We write a tailored letter you can edit and download.')+
  `<div class="card">${resPick()}<div class="row" style="margin-bottom:12px">${upl('cl.resume','Fill from a resume photo')}</div><div class="two">${fin('Your name','cl.name')}${fin('Job title you are applying for','cl.role','Frontend Developer')}</div>
   <div class="two">${fin('Company','cl.company')}${fin('Hiring manager (optional)','cl.manager','Ms. Rao')}</div>
   ${fta('Your strengths and experience','cl.points','3 years in React, led a design system migration, cut page load by 38%…',4)}
   ${sel('Tone','cl.tone',['Professional','Friendly','Confident'])}
   <button class="btn pri" data-act="genCover">${icon('spark',16)}Generate cover letter</button></div>
   <div class="out" id="clOut">${S.out.cover?coverOut():''}</div>`;
}
const coverOut=()=>`<div class="card"><label class="f"><span>Your letter (you can edit it)</span><textarea id="clText" rows="16" data-out="cover">${esc(S.out.cover)}</textarea></label>
  <div class="row"><button class="btn" data-act="copy" data-t="clText">${icon('copy',16)}Copy</button><button class="btn pri" data-act="pdfCover">${icon('download',16)}Download PDF</button></div></div>`;
function vATS(){
  return head('ATS Resume Checker','Upload a photo of your resume and, if you like, the job post. We check what applicant tracking systems look for.')+
  `<div class="card">${resPick()}<div class="row" style="margin-bottom:6px">${upl('ats.text','Upload PDF / DOCX / Image')}</div><div class="hint" style="margin:0 0 12px">Upload a text PDF or DOCX for best extraction, or use an image/scanned PDF with OCR. Review the extracted text before checking.</div>${fta('Resume text','ats.text','Your resume text appears here after you upload a photo…',9)}<div class="row" style="margin-bottom:12px">${upl('ats.jd','Upload job description file / image')}</div>${fta('Job description (optional, but gives a keyword match)','ats.jd','Optional: upload a PDF, DOCX or image of the job post…',6)}
   <button class="btn pri" data-act="runATS">${icon('shield',16)}Check my resume</button></div>
   <div class="out" id="atsOut">${S.ats?atsOut():''}</div>`;
}
function vInterview(){
  return head('Interview Preparation','Get likely questions for your role, with tips and a sample answer outline for each.')+
  `<div class="card"><div class="row" style="margin-bottom:12px">${upl('iv.resume','Get role from a resume photo')}</div><div class="two">${fin('Role','iv.role','Frontend Developer')}${sel('Experience level','iv.level',['Fresher','Mid-level','Senior'])}</div>
   ${sel('Question type','iv.type',['Mixed','Behavioral','Technical','HR'])}
   <button class="btn pri" data-act="genIv">${icon('spark',16)}Generate questions</button></div><div class="out" id="ivOut">${S.out.iv?ivOut():''}</div>`;
}
const ivOut=()=>S.out.iv.map((q,i)=>`<details class="qa"><summary><span style="color:var(--blue)">Q${i+1}</span><span>${esc(q.q)}</span></summary><div class="b"><p><em>Tip:</em> ${esc(q.tip)}</p><p><em>Sample answer:</em> ${esc(q.sample)}</p></div></details>`).join('');
function vObjective(){
  return head('Career Objective Generator','Short, clear objectives for the top of your resume.')+
  `<div class="card"><div class="row" style="margin-bottom:12px">${upl('ob.resume','Fill from a resume photo')}</div><div class="two">${fin('Target role','ob.role','Data Analyst')}${sel('Experience level','ob.level',['Fresher','1–3 years','4–8 years','8+ years'])}</div>
   ${fin('Key skills','ob.skills','SQL, Excel, Power BI','Separate with commas')}
   <button class="btn pri" data-act="genOb">${icon('spark',16)}Generate objectives</button></div><div class="out" id="obOut">${S.out.ob?obOut():''}</div>`;
}
const obOut=()=>S.out.ob.map((t,i)=>`<div class="opt"><p>${esc(t)}</p><div class="row"><button class="btn sm" data-act="copyText" data-i="${i}">${icon('copy',15)}Copy</button><button class="btn sm soft" data-act="useOb" data-i="${i}">Use in a new resume</button></div></div>`).join('');
function vIntro(){
  return head('Self Introduction Generator','A natural, spoken introduction for interviews, classes or networking.')+
  `<div class="card"><div class="row" style="margin-bottom:12px">${upl('si.resume','Fill from a resume photo')}</div><div class="two">${fin('Your name','si.name')}${fin('Role or course','si.role','Final-year B.Sc student')}</div>
   ${fta('Background and highlights','si.bg','Studied chemistry, built two projects, did an internship, love solving problems…',4)}
   <div class="two">${sel('Where will you use it?','si.ctx',['Job interview','College interview','Networking event','Team meeting'])}${sel('Length','si.len',['30 seconds','60 seconds','2 minutes'])}</div>
   <button class="btn pri" data-act="genSi">${icon('spark',16)}Write my introduction</button></div>
   <div class="out" id="siOut">${S.out.si?siOut():''}</div>`;
}
const siOut=()=>`<div class="card"><label class="f"><span>Your introduction (you can edit it)</span><textarea id="siText" rows="10" data-out="si">${esc(S.out.si)}</textarea></label><div class="row"><button class="btn" data-act="copy" data-t="siText">${icon('copy',16)}Copy</button></div></div>`;
function vResumes(){
  return head('My Resumes','Everything you have saved. Your documents stay on this device.')+
  `<div class="row" style="margin-bottom:14px"><button class="btn pri" data-act="newRes" data-type="resume">${icon('plus',16)}New resume</button><button class="btn" data-act="newRes" data-type="cv">${icon('plus',16)}New CV</button></div>`+
  (S.resumes.length?`<div class="rlist">${S.resumes.map(r=>`<div class="ritem" style="flex-wrap:wrap"><div class="t" style="flex:1 1 180px"><b>${esc(r.title||'Untitled')}</b><small>${r.type==='cv'?'CV':'Resume'} · ${esc(r.personal.name||'No name yet')} · edited ${new Date(r.updated).toLocaleDateString()}</small></div>
   <div class="row"><button class="btn sm soft" data-act="openRes" data-id="${r.id}">${icon('edit',15)}Edit</button><button class="btn sm" data-act="pdfRes" data-id="${r.id}">${icon('download',15)}PDF</button><button class="btn sm" data-act="dupRes" data-id="${r.id}">${icon('copy',15)}Duplicate</button>
   <button class="btn sm danger" data-act="delRes" data-id="${r.id}">${S.delArm===r.id?'Tap again to delete':icon('trash',15)+'Delete'}</button></div></div>`).join('')}</div>`
   :`<div class="empty">No saved resumes yet.<br><button class="btn pri" data-act="newRes" data-type="resume">Create your first resume</button></div>`);
}

/* ---------- sharing ---------- */
const enc=p=>'R44-'+btoa(unescape(encodeURIComponent(JSON.stringify(p))));
function dec(code){
  try{
    const s=String(code).trim().replace(/^R44-/,'').replace(/\s+/g,'');
    const p=JSON.parse(decodeURIComponent(escape(atob(s))));
    if(!p||p.v!==1||!p.theme)return null;
    return normPayload(p);
  }catch(e){return null}
}
function cleanSample(s){
  const str=v=>String(v||'').slice(0,1500),arr=a=>Array.isArray(a)?a.slice(0,6):[];
  return {role:str(s.role),summary:str(s.summary),skills:str(s.skills),certs:str(s.certs),languages:str(s.languages),awards:str(s.awards),
    experience:arr(s.experience).map(e=>({role:str(e.role),company:str(e.company),start:str(e.start),end:str(e.end),desc:str(e.desc)})),
    education:arr(s.education).map(e=>({degree:str(e.degree),school:str(e.school),board:str(e.board),start:str(e.start),end:str(e.end),marks:str(e.marks)})),
    projects:arr(s.projects).map(e=>({name:str(e.name),desc:str(e.desc)}))};
}
function normPayload(p){return {v:1,name:String(p.name||'Shared template').slice(0,40),author:String(p.author||'').slice(0,30),type:p.type==='cv'?'cv':'resume',theme:cleanTheme(p.theme),sample:p.sample&&typeof p.sample==='object'?cleanSample(p.sample):null}}
const sampleFrom=r=>({role:r.personal.role,summary:r.summary,skills:r.skills,certs:r.certs,languages:r.languages,awards:r.awards,experience:r.experience,education:r.education,projects:r.projects});
function curPayload(){const r=S.cur;return normPayload({v:1,name:S.sh.name||r.title||'My template',author:S.sh.author,type:r.type,theme:r.theme,sample:S.sh.sample?sampleFrom(r):null})}
function useTemplate(p){
  const r=blank(p.type);r.title=p.name;r.theme=cleanTheme(p.theme);
  if(p.sample){const s=p.sample;Object.assign(r,{summary:s.summary,skills:s.skills,certs:s.certs,languages:s.languages,awards:s.awards,projects:s.projects});
    if(s.experience.length)r.experience=s.experience;if(s.education.length)r.education=s.education;r.personal.role=s.role}
  go(p.type==='cv'?'cv':'builder',{cur:r});
  toast('Template applied. Add your details or customize the theme.');
}
function photoFile(file){
  return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{
    const W=300,H=350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),ar=W/H;
    let sw=im.width,sh=im.height,sx=0,sy=0;
    if(sw/sh>ar){const nw=sh*ar;sx=(sw-nw)/2;sw=nw}else{const nh=sw/ar;sy=(sh-nh)/2;sh=nh}
    x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(im,sx,sy,sw,sh,0,0,W,H);res(c.toDataURL('image/jpeg',.85))};im.src=fr.result};fr.readAsDataURL(file)});
}

/* ---------- reading images (photos and screenshots) ---------- */
const API_URL='https://api.anthropic.com/v1/messages';
function loadScript(src){return new Promise((res,rej)=>{const e=document.createElement('script');e.src=src;e.onload=res;e.onerror=()=>rej(new Error('load failed'));document.head.appendChild(e)})}
async function getTess(){
  if(window.Tesseract)return window.Tesseract;
  try{await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js')}catch(e){await loadScript('https://unpkg.com/tesseract.js@5/dist/tesseract.min.js')}
  if(!window.Tesseract)throw new Error('ocr missing');return window.Tesseract;
}
function fileToCanvas(file,max=2000,min=1000){
  return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
    im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};
    im.onload=()=>{URL.revokeObjectURL(u);const w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)return rej(new Error('img'));
      const big=Math.max(w,h);let k=Math.min(1,max/big);if(min&&big*k<min)k=Math.min(3,min/big);
      const c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res(c)};
    im.src=u});
}
async function visionText(c){
  if(!AIM.on)throw new Error('AI mode is off');
  if(!(BK.on&&BK.ai))throw new Error('No OCR vision backend configured');

  const prompt = `You are an accurate resume OCR engine.

Read the entire resume image from top to bottom and left to right.

TRANSCRIBE EVERY VISIBLE DETAIL.
Do not summarize, rewrite, guess or invent information.

Preserve:
- Full name and contact details
- Phone numbers and email
- Career objective and summary
- Every experience and responsibility
- Every education entry, university and marks
- All skills
- Projects and descriptions
- Certifications
- Languages
- Awards and achievements
- Personal details and declaration

Use clear headings:
NAME:
ROLE:
CONTACT:
PROFESSIONAL SUMMARY:
WORK EXPERIENCE:
EDUCATION:
SKILLS:
PROJECTS:
CERTIFICATIONS:
LANGUAGES:
AWARDS AND ACHIEVEMENTS:
PERSONAL DETAILS:
OTHER INFORMATION:

Keep every bullet and date.
Put each education entry on one line separated by |:
Qualification | Institution | University/Board | Year | Marks/CGPA

Do not omit information in sidebars, columns or footers.
If something is unreadable, write [unclear].
Output only the extracted text.`;

  const d=await api('/api/ai',{
    method:'POST',
    body:{
      prompt,
      system:'Perform accurate visual transcription. Never summarize.',
      image:c.toDataURL('image/jpeg',.85).split(',')[1],
      max_tokens:5000
    },
    timeout:90000
  });

  return ((d&&d.text)||'').trim();
}
async function readImage(file){
  const c=await fileToCanvas(file);
  try{const t=await visionText(c);if(t&&t.length>20)return t}catch(e){}
  const T=await getTess();
  const out=await T.recognize(c,'eng',{logger:m=>{if(m.status==='recognizing text')toast('Reading your image… '+Math.round(m.progress*100)+'%',0)}});
  return ((out&&out.data&&out.data.text)||'').trim();
}
const HEADRE=/^(name|role|contact|professional\s+summary|career\s+objective|summary|objective|profile|about\s+me|technical\s+skills|key\s+skills|core\s+skills|skills|work\s+experience|professional\s+experience|experience|employment(?:\s+history)?|educational\s+qualifications?|education|academic\s+(?:qualifications?|details)|projects?|certifications?|languages?(?:\s+known)?|awards?(?:\s+and\s+achievements)?|achievements|personal\s+(?:profile|details)|declaration|other\s+information)$/i;
function parseResume(text){
  const raw=String(text||'').replace(/\r/g,'');
  const original=raw.split(/\n/).map(x=>x.trim()).filter(Boolean);
  const L=original.map(x=>x.replace(/\s+/g,' ').trim());
  const norm=s=>String(s||'').replace(/[:：\-–]\s*$/,'').trim().toLowerCase();
  let email=(raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[''])[0];
  let phone=(raw.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|\+?\d[\d\s().-]{8,}\d/)||[''])[0].trim();
  let link=(raw.match(/(?:https?:\/\/|www\.|linkedin\.com|github\.com)\S+/i)||[''])[0];
  const heading=l=>HEADRE.test(norm(l));
  const sections=[];let cur=null;
  original.forEach(line=>{const l=line.replace(/\s+/g,' ').trim();if(heading(l)){cur={key:norm(l),lines:[]};sections.push(cur)}else if(cur)cur.lines.push(l.replace(/^[-•●▪■*✓✔☑v]\s*/i,'').trim())});
  const get=re=>{const z=sections.find(x=>re.test(x.key));return z?z.lines:[]};
  const label=(aliases)=>{const re=new RegExp('^\\s*(?:'+aliases.join('|')+')\\s*[:：\\-]?\\s*(.*)$','i');for(const l of L){const m=l.match(re);if(m&&m[1])return m[1].trim()}return ''};
  const header=L.slice(0,Math.min(L.length,12));
  let name=header.find(l=>!/@/.test(l)&&!/^\+?\d[\d\s().-]{8,}$/.test(l)&&!heading(l)&&!/\b(resume|curriculum vitae)\b/i.test(l)&&l.split(/\s+/).length<=4&&/^[A-Za-z][A-Za-z .'-]+$/.test(l))||'';
  // Prefer explicit NAME: line from structured OCR
  const nameFromSec=get(/^name$/).join(' ').trim();
  if(nameFromSec&&nameFromSec.length<60)name=nameFromSec.replace(/^name\s*[:：]?\s*/i,'');
  if(name&&name===name.toUpperCase())name=name.toLowerCase().replace(/\b[a-z]/g,m=>m.toUpperCase());
  const ni=header.findIndex(l=>l.toLowerCase()===name.toLowerCase());
  let role=ni>=0?header.slice(ni+1,ni+4).find(l=>l!==email&&!/@/.test(l)&&!/\d{5,}/.test(l)&&l.length<65&&/^[A-Za-z &/,().-]+$/.test(l)&&!heading(l))||'':'';
  const roleFromSec=get(/^role$/).join(' ').trim();
  if(roleFromSec&&roleFromSec.length<80)role=roleFromSec.replace(/^role\s*[:：]?\s*/i,'');
  const address=label(['address','residential address','present address','location']);
  const contactLines=get(/^contact$/);
  if(contactLines.length){
    const ct=contactLines.join(' ');
    if(!email){const m=ct.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);if(m)email=m[0]}
    if(!phone){const m=ct.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|\+?\d[\d\s().-]{8,}\d/);if(m)phone=m[0].trim()}
    if(!link){const m=ct.match(/(?:https?:\/\/|www\.|linkedin\.com|github\.com)\S+/i);if(m)link=m[0]}
  }
  const summary=get(/^(professional summary|career objective|summary|objective|profile|about me)$/).join(' ').slice(0,1000);
  const skillLines=get(/skill/);
  const skills=skillLines.map(x=>x.replace(/^[✓✔☑vV\s]+(?=[A-Za-z])/,'').replace(/^[•●▪■*\-]+\s*/, '').trim()).filter(Boolean).join(', ').slice(0,900);
  const exp=get(/experience|employment/);
  const eduLines=get(/education|qualification|academic/);
  const education=[];
  const yearRe=/(?:19|20)\d{2}(?:\s*[-–/]\s*(?:(?:19|20)\d{2}|present))?/i;
  eduLines.forEach(line=>{
    if(/^(qualification|degree|institution|university|board|year|marks|percentage)/i.test(line))return;
    let cells=line.split(/\t+|\s{2,}|\s*\|\s*/).map(x=>x.trim()).filter(Boolean);
    if(cells.length<2){const y=line.match(yearRe);if(y){const left=line.slice(0,y.index).split(/,\s*/).filter(Boolean);const right=line.slice(y.index+y[0].length).trim();cells=[...left,y[0],right].filter(Boolean)}}
    if(cells.length>=2){const yr=cells.find(x=>yearRe.test(x))||'';const marks=cells.find(x=>x!==yr&&/(%|cgpa|gpa|\/\s*\d)/i.test(x))||'';const vals=cells.filter(x=>x!==yr&&x!==marks);education.push({degree:vals[0]||'',school:vals[1]||'',board:vals[2]||'',start:'',end:yr?(yr.match(yearRe)||[''])[0]:'',marks});}
  });
  // Projects
  const projLines=get(/^projects?$/);
  const projects=[];
  projLines.forEach(line=>{
    if(!line)return;
    // "Name – description" or "Name: description" or just a name
    const m=line.match(/^(.{2,80}?)\s*(?:[–—\-:]\s*|:\s+)(.+)$/);
    if(m)projects.push({name:m[1].trim(),desc:m[2].trim()});
    else projects.push({name:line.trim(),desc:''});
  });
  // Certifications, Languages, Awards
  const certs=get(/certification/).join('\n').slice(0,1500);
  let languages=get(/^languages?(?:\s+known)?$/).join(', ').replace(/\s*,\s*/g,', ').replace(/,+/g,',').replace(/^,|,$/g,'').slice(0,300);
  const awards=get(/awards?|achievements?/).join('\n').slice(0,1500);
  const profile={father:label(["father'?s name",'father name']),dob:label(['date of birth','dob']),languages:label(['languages known','languages']),gender:label(['sex','gender']),marital:label(['marital status']),nationality:label(['nationality']),strengths:label(['strengths','strength'])};
  get(/personal profile|personal details/).forEach(line=>{const m=line.match(/^([^:：]+)\s*[:：]\s*(.+)$/);if(!m)return;const k=norm(m[1]),v=m[2].trim();if(/father/.test(k))profile.father=profile.father||v;else if(/dob|birth/.test(k))profile.dob=profile.dob||v;else if(/language/.test(k))profile.languages=profile.languages||v;else if(/sex|gender/.test(k))profile.gender=profile.gender||v;else if(/marital/.test(k))profile.marital=profile.marital||v;else if(/nationality/.test(k))profile.nationality=profile.nationality||v;else if(/strength/.test(k))profile.strengths=profile.strengths||v});
  // If languages section empty but profile has languages, keep profile one; prefer section for languages field
  if(!languages&&profile.languages)languages=profile.languages;
  const declLines=get(/^declaration$/);const declText=declLines.filter(x=>!/^\s*(place|date|signature)\s*[:：]/i.test(x)).join(' ');
  const place=label(['place']),date=label(['date']);
  const langs=label(['languages known']);
  if(langs&&!profile.languages)profile.languages=langs;
  const hasFresher=/career objective|personal profile|declaration|father'?s name|university\s*\/\s*board|marks\s*\/?%/i.test(raw);
  return {name,role,email,phone,link,location:address,text:raw,summary,skills,exp,education,projects,certs,languages,awards,profile,decl:{text:declText,place,date},hasFresher};
}
function importInto(r,P){
  const p=r.personal;
  ['name','role','email','phone','link','location'].forEach(k=>{if(P[k])p[k]=P[k]});
  if(P.summary)r.summary=P.summary;
  if(P.skills)r.skills=P.skills;
  if(P.exp&&P.exp.length&&r.experience.every(e=>!e.role&&!e.company&&!e.desc))r.experience=[{role:'',company:'',start:'',end:'',desc:P.exp.join('\n')}];
  if(P.education&&P.education.length){const rows=P.education.filter(e=>e.degree||e.school||e.board);if(rows.length)r.education=rows;}
  if(P.projects&&P.projects.length){
    const rows=P.projects.filter(x=>x.name||x.desc);
    if(rows.length)r.projects=rows;
  }
  if(P.certs&&String(P.certs).trim())r.certs=String(P.certs).trim();
  if(P.languages&&String(P.languages).trim())r.languages=String(P.languages).trim();
  if(P.awards&&String(P.awards).trim())r.awards=String(P.awards).trim();
  if(P.profile)Object.keys(P.profile).forEach(k=>{if(P.profile[k])r.profile[k]=P.profile[k]});
  if(P.decl){if(P.decl.text)r.decl.text=P.decl.text;if(P.decl.place)r.decl.place=P.decl.place;if(P.decl.date)r.decl.date=P.decl.date;}
  if(P.hasFresher){r.theme=mkTheme('fresher');r.theme.photo=!!r.photo;}
  if(P.name&&/^Untitled/.test(r.title))r.title=P.name+(r.type==='cv'?' CV':' resume');
}
function hueOf(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;const h=(mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60;return h<0?h+360:h}
async function accentFromFile(file){
  try{
    const c=await fileToCanvas(file,200,0),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,B={};
    for(let i=0;i<d.length;i+=16){
      const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx?(mx-mn)/mx:0;
      if(sat<.35||mx<60)continue;
      const k=Math.floor(hueOf(r,g,b)/30)%12,o=B[k]||(B[k]={n:0,r:0,g:0,b:0});o.n+=sat;o.r+=r*sat;o.g+=g*sat;o.b+=b*sat;
    }
    const best=Object.values(B).sort((x,y)=>y.n-x.n)[0];if(!best)return null;
    let rgb=[best.r,best.g,best.b].map(v=>v/best.n);
    if(0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2]>190)rgb=rgb.map(v=>v*.7);
    return '#'+rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  }catch(e){return null}
}
const upl=(target,label)=>`<label class="btn soft upl">${icon('upload',16)}<span>${label}</span><input type="file" accept=".jpg,.jpeg,.png,.pdf,.docx,image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-ocr="${target}"></label>`;
function okImage(f){
  if(!f||f.size>25*1024*1024)return false;
  const name=String(f.name||'').toLowerCase(),type=String(f.type||'').toLowerCase();
  if(/\.(heic|heif)$/i.test(name)||/heic|heif/.test(type))return false;
  return ['image/jpeg','image/jpg','image/png'].includes(type)||/\.(jpe?g|png)$/i.test(name);
}
const importCard=()=>`<div class="card fs"><h3>Import an existing resume</h3><p class="hint" style="margin:0 0 10px">Upload PDF, DOCX, JPG or PNG. We extract text and fill the editable fields. Always review the result.</p>${upl('builder.import','Upload PDF / DOCX / Image')}<p class="hint">For best ATS results, use a text-based PDF or DOCX. Scanned images may contain OCR mistakes.</p><div class="row" style="margin-top:10px"><b>✨ Clone a resume design</b></div>${upl('tpl.clone','Upload resume image to match its style')}<p class="hint">We estimate its font family, accent colour and heading style, then recreate an editable version. Exact font identification is not guaranteed.</p></div>`;
async function readResumeFile(file){
  const name=String(file.name||'').toLowerCase(),type=String(file.type||'').toLowerCase();
  if(file.size>25*1024*1024)throw new Error('File is larger than 25 MB.');
  if(name.endsWith('.pdf')||type==='application/pdf'){
    if(!window.pdfjsLib)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    const pdfjs=window.pdfjsLib;if(!pdfjs)throw new Error('PDF reader could not load.');
    pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const data=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjs.getDocument({data}).promise;let all='';
    for(let n=1;n<=Math.min(pdf.numPages,20);n++){const page=await pdf.getPage(n),c=await page.getTextContent();all+=c.items.map(x=>x.str).join(' ')+'\n';}
    if(all.replace(/\s/g,'').length>20)return all;
    // Scanned PDF: render each page to canvas and OCR it.
    const T=await getTess();all='';
    for(let n=1;n<=Math.min(pdf.numPages,8);n++){const page=await pdf.getPage(n),vp=page.getViewport({scale:1.7}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const o=await T.recognize(c,'eng');all+=(o.data.text||'')+'\n';}
    return all.trim();
  }
  if(name.endsWith('.docx')||type.includes('wordprocessingml')){
    if(!window.mammoth)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js');
    if(!window.mammoth)throw new Error('DOCX reader could not load.');
    const out=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return (out.value||'').trim();
  }
  if(okImage(file))return readImage(file);
  throw new Error('Please upload a PDF, DOCX, JPG or PNG file.');
}
async function inferResumeStyle(file,r){
  const accent=await accentFromFile(file);
  const c=await fileToCanvas(file,700,0),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let dark=0,total=0,colour=0;
  for(let i=0;i<d.length;i+=32){const R=d[i],G=d[i+1],B=d[i+2],lum=.299*R+.587*G+.114*B;total++;if(lum<115)dark++;if(Math.max(R,G,B)-Math.min(R,G,B)>55)colour++;}
  const monochrome=colour/Math.max(1,total)<.07;
  r.theme=mkTheme(monochrome?'fresher':'modern');
  r.theme.accent=accent|| (monochrome?'#111111':'#1d5be0');
  r.theme.font=monochrome?'serif':'sans';
  r.theme.align='left';r.theme.photo=false;
  r.theme.eduTable=false;r.theme.skillsCheck=false;
  r.theme.head=monochrome?'text':'underline';
  r.theme.nameLine=monochrome;r.theme.thick=false;
  r.theme.preset='custom';
}
async function exportDOCX(r){
  try{
    if(!window.docx)await loadScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js');
    const D=window.docx;if(!D||!D.Document||!D.Packer)throw new Error('DOCX library could not load. Check your internet connection.');
    const p=r.personal,t=r.theme,accent=(t.accent||'#1d5be0').replace('#','').toUpperCase();
    const children=[];
    const para=(text,opts={})=>new D.Paragraph({children:[new D.TextRun({text:String(text||''),bold:!!opts.bold,italics:!!opts.italics,size:opts.size||20,color:opts.color||'222222',font:opts.font|| (t.font==='serif'?'Georgia':'Arial')})],spacing:{after:opts.after??100},alignment:opts.align||D.AlignmentType.LEFT});
    const heading=text=>{children.push(new D.Paragraph({children:[new D.TextRun({text:String(text).toUpperCase(),bold:true,size:24,color:accent,font:t.font==='serif'?'Georgia':'Arial'})],heading:D.HeadingLevel.HEADING_2,spacing:{before:220,after:100},border:{bottom:{color:accent,space:4,size:6,style:D.BorderStyle.SINGLE}}}));};
    if(p.name)children.push(para(p.name,{bold:true,size:34,color:accent,align:t.align==='center'?D.AlignmentType.CENTER:D.AlignmentType.LEFT,after:70}));
    if(p.role)children.push(para(p.role,{size:22,align:t.align==='center'?D.AlignmentType.CENTER:D.AlignmentType.LEFT,after:70}));
    const contact=[p.email,p.phone,p.location,p.link].filter(Boolean).join(' | ');if(contact)children.push(para(contact,{size:18,align:t.align==='center'?D.AlignmentType.CENTER:D.AlignmentType.LEFT,after:180}));
    const T=titles(r);
    order(r).forEach(k=>{
      heading(T[k]||k);
      if(k==='summary'&&r.summary)children.push(para(r.summary));
      else if(k==='experience')r.experience.filter(e=>e.role||e.company||e.desc).forEach(e=>{children.push(para([e.role,[e.start,e.end].filter(Boolean).join(' – ')].filter(Boolean).join('     '),{bold:true}));if(e.company)children.push(para(e.company,{italics:true}));lines(e.desc).forEach(x=>children.push(para('• '+x,{after:50})));});
      else if(k==='education')r.education.filter(e=>e.degree||e.school).forEach(e=>children.push(para([e.degree,e.school,e.board,e.end||e.start,e.marks].filter(Boolean).join(' | '))));
      else if(k==='projects')r.projects.filter(x=>x.name||x.desc).forEach(x=>children.push(para([x.name,x.desc].filter(Boolean).join(' — '))));
      else if(k==='skills')skillList(r).forEach(x=>children.push(para('• '+x,{after:45})));
      else if(k==='certs'||k==='awards'||k==='languages'){lines(r[k]).forEach(x=>children.push(para(x)));if(k==='languages'&&!lines(r.languages).length&&r.languages)children.push(para(r.languages));}
      else if(k==='profile')profRows(r).forEach(([a,b])=>children.push(para(a+': '+b)));
      else if(k==='declaration'){if(r.decl.text)children.push(para(r.decl.text));if(r.decl.place)children.push(para('Place: '+r.decl.place));if(r.decl.date)children.push(para('Date: '+r.decl.date));}
    });
    const doc=new D.Document({sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:850,right:900,bottom:850,left:900}}},children}]});
    const blob=await D.Packer.toBlob(doc),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(p.name||r.title||'resume').replace(/[^\w-]+/g,'_')+'_Resume.docx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);track('docx_download');toast('DOCX downloaded. You can edit it in Word or Google Docs.');
  }catch(e){console.error(e);toast(e.message||'Could not create DOCX. Please try again.');}
}
async function ocrTarget(t,file){
  const fn=String(file.name||'').toLowerCase(),isSupported=okImage(file)||fn.endsWith('.pdf')||fn.endsWith('.docx')||file.type==='application/pdf'||String(file.type||'').includes('wordprocessingml');
  if(!isSupported||file.size>25*1024*1024){toast('Please upload PDF, DOCX, JPG or PNG (under 25 MB).');track('upload_failed',{target:t,why:'type'});return}
  track('resume_uploaded',{target:t,format:fn.split('.').pop()});
  toast('Reading your resume…',0);
  let text='';
  try{text=await readResumeFile(file)}catch(e){console.error(e);track('upload_failed',{target:t,why:'read'});toast(e.message||'Could not read this file. Try another PDF, DOCX or clear image.');return}
  if(t!=='tpl.image'&&text.replace(/\s/g,'').length<15){toast('No readable text found. Try a sharper, well-lit photo.');return}
  const P=parseResume(text),f=S.f;
  switch(t){
   case 'ats.text':f.ats.text=text;$('#main').innerHTML=vATS();toast('Resume text added. Tap Check my resume.');break;
   case 'ats.jd':f.ats.jd=text;$('#main').innerHTML=vATS();toast('Job post text added.');break;
   case 'cl.resume':if(P.name)f.cl.name=P.name;f.cl.points=[P.summary,P.skills&&'Skills: '+P.skills].filter(Boolean).join(' ')||text.replace(/\s+/g,' ').slice(0,600);$('#main').innerHTML=vCover();toast('Details added from your resume.');break;
   case 'ob.resume':if(P.skills)f.ob.skills=P.skills;if(P.role&&!f.ob.role)f.ob.role=P.role;$('#main').innerHTML=vObjective();toast('Details added from your resume.');break;
   case 'si.resume':if(P.name)f.si.name=P.name;if(P.role)f.si.role=P.role;f.si.bg=P.summary||P.skills||text.replace(/\s+/g,' ').slice(0,400);$('#main').innerHTML=vIntro();toast('Details added from your resume.');break;
   case 'iv.resume':if(P.role)f.iv.role=P.role;$('#main').innerHTML=vInterview();toast(P.role?'Role added from your resume.':'Could not find a job title. Type the role yourself.');break;
   case 'builder.import':if(!S.cur)return;importInto(S.cur,P);{const ti=$('#titleIn');if(ti)ti.value=S.cur.title}renderForm();renderPreview();touch();toast('Details added. Check Experience and Education and fill in anything missing.');break;
   case 'tpl.image':{const r=blank('resume'),acc=okImage(file)?await accentFromFile(file):null;importInto(r,P);if(acc){r.theme.accent=acc;r.theme.preset='custom'}go('builder',{cur:r});toast('Resume started from your photo. Pick the closest theme and edit anything.');break}
   case 'tpl.clone':{if(!okImage(file)){toast('For Clone Design, upload a JPG or PNG resume image.');break}const r=blank('resume');importInto(r,P);await inferResumeStyle(file,r);go('builder',{cur:r});toast('Closest editable style created. Review the layout and extracted details.');break}
  }
}

/* ---------- AI ---------- */
async function ai(prompt,system){
  if(!AIM.on){const e=new Error('AI mode is off');e.code='aioff';throw e}
  track('ai_request');
  if(!API_BASE) {
    const e=new Error('AI backend is not configured');e.code='noai';
    track('ai_failed',{code:'no_backend'});throw e;
  }
  try{
    const d=await api('/api/ai',{method:'POST',body:{prompt,system},timeout:60000});
    if(d&&typeof d.text==='string'&&d.text.trim())return d.text.trim();
    throw new Error('Empty AI response');
  }catch(e){
    track('ai_failed',{code:e.status===429?'rate':'backend'});
    if(e.status===429){e.code='rate';throw e}
    e.code='noai';throw e;
  }
}
function aiMsg(e){return e&&e.code==='aioff'?'AI mode is off. Turn it on from the AI switch to use this.':e&&e.code==='noai'?'AI is not connected yet (the app owner must add the API key on the server).':e&&e.code==='rate'?'Too many AI requests. Try again in a few minutes.':'AI is not available right now.'}
function parseJSON(t){const c=t.replace(/```json|```/g,'').trim();const s=c.search(/[\[{]/);return JSON.parse(c.slice(s))}
async function run(btn,fn,fb){
  if(!AIM.on){if(fb){fb();toast('AI is off, so a quick template draft was used. Turn AI on for a tailored result.',4500)}else toast('AI mode is off. Turn it on to use this.',4000);return}
  const old=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="spin"></span> Working…';
  try{await fn()}catch(e){console.error(e);const m=aiMsg(e);if(fb){fb();toast(m+' A template draft was used instead.',5000)}else toast(m+' Please try again.',5000)}
  btn.disabled=false;btn.innerHTML=old;
}
const SYS_TXT='You are an expert career coach and resume writer. Write natural, specific, human-sounding text with no clichés, no markdown and no preamble. Output only what was asked.';

/* ---------- fallbacks ---------- */
const topSkills=(s,n=4)=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,n);
const joinList=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a.slice(-1);
function fbSummary(r){const role=r.personal.role||'professional',sk=topSkills(r.skills);
  if(r.theme.fresher)return `A motivated and adaptable individual seeking an entry-level opportunity in a growth-oriented organization where I can use my knowledge${sk.length?`, skills in ${joinList(sk)}`:', skills'} and willingness to learn, contribute to the organization\u2019s goals, and keep developing professionally.`;
  return `Motivated ${role.toLowerCase()} ${sk.length?`skilled in ${joinList(sk)}`:'with a strong work ethic'}. Quick to learn, dependable under deadlines and comfortable working in a team. Looking to contribute to a company where I can grow and deliver measurable results.`}
function fbObjective(role,level,skills){
  const sk=topSkills(skills),r=role||'professional role',s=sk.length?` using my skills in ${joinList(sk)}`:'';
  const fr=level==='Fresher';
  return [
   fr?`Motivated graduate seeking an entry-level ${r} position where I can apply my skills${s} and grow with a supportive team.`:`${level} professional seeking a ${r} role where I can apply proven experience${s} to help the team deliver results.`,
   `Detail-oriented and quick to learn, I aim to build a career as a ${r} and add value from the first day.`,
   `To join a forward-looking company as a ${r}, contribute to its goals${s}, and keep developing my abilities.`];
}
function fbCover(f){
  const hi=f.manager?`Dear ${f.manager},`:'Dear Hiring Manager,';
  const tone={Friendly:'I was excited to see',Confident:'I am the right person for',Professional:'I am writing to apply for'}[f.tone]||'I am writing to apply for';
  return `${hi}\n\n${tone} the ${f.role||'open'} position at ${f.company||'your company'}. ${f.points?`Here is what I bring: ${f.points.trim().replace(/\.$/,'')}.`:'I bring a strong work ethic and a habit of finishing what I start.'}\n\nI work well with others, learn quickly and care about the quality of what I deliver. I would welcome the chance to discuss how I can help ${f.company||'your team'} reach its goals.\n\nThank you for your time and consideration.\n\nSincerely,\n${f.name||'Your name'}`;
}
function fbIntro(f){
  const n=f.name||'there';
  const body=`${f.bg?f.bg.trim().replace(/\.$/,'')+'.':'I enjoy learning new things and solving practical problems.'}`;
  const short=`Hello, I am ${n}${f.role?`, ${f.role}`:''}. ${body} I am excited about this chance and look forward to contributing.`;
  if(f.len==='30 seconds')return short;
  return short+`\n\nWhat I value most is steady improvement: I take feedback seriously, work well in a team and like to finish what I start.${f.len==='2 minutes'?`\n\nOutside of work, I keep learning through projects and reading. I would be glad to answer any questions you have about my background.`:''}`;
}
const IV_BANK=[
 {q:'Tell me about yourself.',tip:'Keep it to 60 seconds: present, past, future.',sample:'Start with your current role or course, mention one or two relevant achievements, then say why this role is your next step.'},
 {q:'Why do you want to work here?',tip:'Show you researched the company.',sample:'Name one product, value or project you admire, then connect it to your skills.'},
 {q:'What is your greatest strength?',tip:'Pick a strength that matches the job and back it with an example.',sample:'State the strength, give a short story where it helped a team, and end with the result.'},
 {q:'What is your biggest weakness?',tip:'Be honest, then show what you are doing about it.',sample:'Name a real but non-critical weakness, the steps you took to improve and one sign of progress.'},
 {q:'Describe a time you faced a difficult challenge.',tip:'Use the STAR method: Situation, Task, Action, Result.',sample:'Set the scene in one sentence, explain your task, describe your actions in detail, and finish with a measurable result.'},
 {q:'Tell me about a time you worked in a team.',tip:'Highlight your own contribution, not only the team win.',sample:'Describe the goal, your role, how you handled a disagreement and what the team achieved.'},
 {q:'Where do you see yourself in five years?',tip:'Show ambition that fits the company.',sample:'Say you want to master the role, take on more responsibility and keep growing within the team.'},
 {q:'Do you have any questions for us?',tip:'Always ask at least two.',sample:'Ask what success looks like in the first 90 days and how the team gives feedback.'}];

/* ---------- ATS ---------- */
const STOP=new Set('the and for with that this from your you are will our have has not but all can any more their they them its was were been being who what when where which while also into over than then such per use used using work working team teams experience strong ability skills skill years year role job candidate looking join must should plus including etc able need needs well good great new other one two out about across within based help make'.split(' '));
const VERBS='led managed built created developed designed improved increased reduced delivered launched implemented analyzed organized trained mentored achieved optimized automated coordinated negotiated resolved supported streamlined established generated drove owned wrote tested deployed migrated'.split(' ');
function analyze(text,jd){
  const t=text.toLowerCase(),wc=text.trim().split(/\s+/).filter(Boolean).length,checks=[];let pts=0,max=0;
  const add=(label,w,ratio,detail)=>{max+=w;pts+=w*ratio;checks.push({label,status:ratio>=.99?'pass':ratio>=.5?'warn':'fail',detail})};
  add('Email address',8,/[\w.+-]+@[\w-]+\.[\w.]+/.test(text)?1:0,'Recruiters need a working email at the top.');
  add('Phone number',7,/\+?\d[\d\s().-]{8,}\d/.test(text)?1:0,'Add a phone number they can call.');
  [['Summary or objective',/summary|objective|profile|about me/],['Experience section',/experience|employment|work history|internship/],['Education section',/education|academic|qualification/],['Skills section',/skills|technologies|competencies/]]
    .forEach(([l,re])=>add(l,6,re.test(t)?1:0,re.test(t)?'Found.':`Add a clearly labelled "${l.split(' ')[0]}" heading so ATS can find it.`));
  add('Length',10,wc>=250&&wc<=800?1:(wc>=150&&wc<=1000?.6:.2),`${wc} words. Aim for 250–800 for most roles.`);
  const vc=VERBS.filter(v=>new RegExp('\\b'+v+'\\b').test(t)).length;
  add('Action verbs',10,Math.min(1,vc/6),vc>=6?`${vc} strong action verbs found.`:`Only ${vc} found. Start bullets with verbs like "led", "built", "improved".`);
  const nm=(text.match(/\d+%|[$₹€£]\s?\d|\b\d{2,}\b/g)||[]).length;
  add('Measurable results',10,Math.min(1,nm/4),nm>=4?'Good use of numbers.':'Add numbers: percentages, amounts, team sizes.');
  add('Simple formatting',4,/[│┃■□◆▪►★☆✓✔]/.test(text)?0:1,'Avoid special symbols and tables; plain bullets parse best.');
  let missing=[],matched=[];
  if(jd&&jd.trim()){
    const cnt={};(jd.toLowerCase().match(/[a-z][a-z+#.]{2,}/g)||[]).forEach(w=>{w=w.replace(/\.$/,'');if(!STOP.has(w)&&w.length>2)cnt[w]=(cnt[w]||0)+1});
    const kws=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,18).map(x=>x[0]);
    kws.forEach(k=>(t.includes(k)?matched:missing).push(k));
    add('Job keyword match',30,kws.length?matched.length/kws.length:1,`${matched.length} of ${kws.length} top keywords from the job post appear in your resume.`);
  }
  return {score:Math.round(pts/max*100),checks,missing,matched,hasJD:!!(jd&&jd.trim())};
}
function atsOut(){
  const a=S.ats,col=a.score>=75?'var(--ok)':a.score>=50?'var(--warn)':'var(--bad)',C=2*Math.PI*52;
  return `<div class="ats res"><div class="card ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C*a.score/100} ${C}" transform="rotate(-90 60 60)"/></svg>
   <div class="sc">${a.score}</div><b>${a.score>=75?'Looks strong':a.score>=50?'Needs some work':'Needs attention'}</b><div class="hint">${a.hasJD?'Includes job keyword match':'Add a job description for keyword match'}</div></div>
   <div class="card">${a.checks.map(c=>`<div class="chk"><span class="dot ${c.status}">${c.status==='pass'?'✓':c.status==='warn'?'!':'×'}</span><div><b>${c.label}</b><small>${esc(c.detail)}</small></div></div>`).join('')}
   ${a.missing.length?`<div class="chk" style="display:block"><b>Missing keywords</b><div class="chips">${a.missing.map(k=>`<span class="chip bad">${esc(k)}</span>`).join('')}</div></div>`:''}
   ${a.matched.length?`<div class="chk" style="display:block"><b>Matched keywords</b><div class="chips">${a.matched.map(k=>`<span class="chip good">${esc(k)}</span>`).join('')}</div></div>`:''}
   <div style="margin-top:12px"><button class="btn soft" data-act="aiATS">${icon('spark',16)}Get AI suggestions</button></div>
   <div id="atsAI" style="white-space:pre-wrap;margin-top:12px;font-size:14px">${esc(S.out.atsAI||'')}</div></div></div>`;
}

/* ---------- PDF ---------- */
function getPDF(){
  if(!window.jspdf){track('pdf_failed',{why:'library'});toast('PDF library did not load. Check your connection and try again.');return null}
  const d=new window.jspdf.jsPDF({unit:'pt',format:'a4'});d.setLineHeightFactor(1.32);return d;
}
const PDF={blob:null,fn:'',url:'',kind:'resume',counted:false};
function savePDF(doc,name,kind){
  const fn=(name||'document').replace(/[^\w\-]+/g,'_')+'.pdf';
  let blob;try{blob=doc.output('blob')}catch(e){console.error(e);track('pdf_failed',{why:'create'});toast('Could not create the PDF.');return}
  try{if(PDF.url)URL.revokeObjectURL(PDF.url)}catch(e){}
  PDF.blob=blob;PDF.fn=fn;PDF.kind=kind||'resume';PDF.counted=false;PDF.url=URL.createObjectURL(blob);

  // On phones, open the native share sheet immediately after PDF generation.
  // This keeps the share call inside the original tap gesture (important on Android WebView).
  if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){
    try{
      const file=new File([PDF.blob],PDF.fn,{type:'application/pdf'});
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
        navigator.share({files:[file],title:PDF.fn})
          .then(()=>countDl())
          .catch(err=>{
            if(err&&err.name==='AbortError')return;
            track('pdf_failed',{why:'direct_share'});
            pdfSheet();
          });
        return;
      }
    }catch(err){track('pdf_failed',{why:'direct_share_unavailable'})}
    pdfSheet();
    return;
  }
  pdfSheet();
  pdfDownload();
}
function countDl(){if(!PDF.counted){PDF.counted=true;track('pdf_download',{kind:PDF.kind})}}
function pdfDownload(){
  if(!PDF.blob){toast('PDF is not ready. Please generate it again.');return false}
  try{
    const url=PDF.url||URL.createObjectURL(PDF.blob);PDF.url=url;
    const a=document.createElement('a');a.href=url;a.download=PDF.fn||'Resume44.pdf';
    a.rel='noopener';a.style.position='fixed';a.style.left='-9999px';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{a.remove()},1000);
    // Keep the blob URL alive long enough for Android download managers.
    countDl();return true;
  }catch(err){
    console.error(err);
    try{const w=window.open(PDF.url,'_blank');if(w){countDl();return true}}catch(e){}
    toast('Download was blocked by this browser. Use Share or Open PDF, or open Resume44 in Chrome.');
    track('pdf_failed',{why:'download_blocked'});return false;
  }
}
function blobB64(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(b)})}
async function pdfNative(){
  const C=window.Capacitor,P=C&&C.Plugins;if(!P||!P.Filesystem)return false;
  const w=await P.Filesystem.writeFile({path:PDF.fn,data:await blobB64(PDF.blob),directory:'DOCUMENTS'});
  if(P.Share)await P.Share.share({title:PDF.fn,url:w.uri});
  return true;
}
function pdfSheet(){
  let can=false;try{can=!!(navigator.canShare&&navigator.canShare({files:[new File([PDF.blob],PDF.fn,{type:'application/pdf'})]}))}catch(e){}
  let framed=false;try{framed=window.self!==window.top}catch(e){framed=true}
  $('#pdfDlg').innerHTML=`<h3 id="pdfT">Your PDF is ready</h3><p>${esc(PDF.fn)}</p>
   <button class="btn pri" data-act="pdfSave">${icon('download',16)}Save to device</button>
   ${can?`<button class="btn" data-act="pdfShare">${icon('share',16)}Share or save to Files / Drive</button>`:''}
   <button class="btn" data-act="pdfAlt">Download another way</button>
   <button class="btn" data-act="pdfOpen">Open PDF</button>
   ${framed?'<small class="hint">This app is running inside a preview frame, where phones often block downloads. If nothing is saved, open the app directly in Chrome or Safari.</small>':''}
   <button class="btn" data-act="pdfClose">Done</button>`;
  $('#pdfSheet').classList.add('open');
}
const NONLATIN=/[^\u0000-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac]/;
function resumePDF(r){
  const doc=getPDF();if(!doc)return;
  const t=r.theme,p=r.personal,T=titles(r),ac=hex2rgb(t.accent),tc=mix(ac,.14);
  const W=595.28,H=841.89,M=44,cw=W-2*M,ink=[26,34,56],gray=[85,98,127],fam=t.font==='serif'?'times':'helvetica';
  let y=M;
  const need=h=>{if(y+h>H-M){doc.addPage();y=M}};
  const font=(b,i)=>doc.setFont(fam,b?(i?'bolditalic':'bold'):(i?'italic':'normal'));
  function txt(s,{size=10,b=false,i=false,color=ink,align='left',x=M,w=cw,gap=0}={}){
    font(b,i);doc.setFontSize(size);doc.setTextColor(...color);
    const ls=doc.splitTextToSize(String(s),w),lh=size*1.38;
    ls.forEach(l=>{need(lh);doc.text(l,align==='center'?x+w/2:x,y+size,{align});y+=lh});y+=gap;
  }
  function sec(title){
    y+=10;need(38);const s=12.5;font(true);doc.setFontSize(s);
    if(t.head==='bar'){doc.setFillColor(...ac);doc.rect(M,y,cw,s+9,'F');doc.setTextColor(255,255,255);doc.text(title,M+8,y+s+.5);y+=s+15}
    else if(t.head==='tint'){doc.setFillColor(...tc);doc.rect(M,y,cw,s+9,'F');doc.setFillColor(...ac);doc.rect(M,y,3.5,s+9,'F');doc.setTextColor(...ac);doc.text(title,M+11,y+s+.5);y+=s+15}
    else if(t.head==='marker'){const w=doc.getTextWidth(title)+18;doc.setFillColor(...tc);doc.roundedRect(M,y,w,s+8,2,2,'F');doc.setTextColor(...ac);doc.text(title,M+9,y+s);y+=s+14}
    else if(t.head==='text'){doc.setTextColor(...ac);doc.text(title,M,y+s);const w=doc.getTextWidth(title);doc.setDrawColor(...ac);doc.setLineWidth(.9);doc.line(M,y+s+2,M+w,y+s+2);y+=s+10}
    else{doc.setTextColor(...ac);doc.text(title,M,y+s);doc.setDrawColor(...ac);doc.setLineWidth(1.1);doc.line(M,y+s+3,W-M,y+s+3);y+=s+9}
  }
  function row(left,right,sub){
    font(false);doc.setFontSize(9.5);const rw=right?doc.getTextWidth(right):0;
    font(true);doc.setFontSize(10.5);const ls=doc.splitTextToSize(String(left||''),cw-rw-14);
    need(15*ls.length+4);doc.setTextColor(...ink);doc.text(ls,M,y+10.5);
    if(right){font(false);doc.setFontSize(9.5);doc.setTextColor(...gray);doc.text(right,W-M,y+10.5,{align:'right'})}
    y+=ls.length*14.5;if(sub)txt(sub,{size:10,i:true,color:gray});
  }
  function bullet(s){
    font(false);doc.setFontSize(10);const ls=doc.splitTextToSize(String(s),cw-16),lh=13.8;
    ls.forEach((l,k)=>{need(lh);doc.setTextColor(...ink);if(k===0)doc.text('\u2022',M+4,y+10);doc.text(l,M+16,y+10);y+=lh});y+=1.5;
  }
  function tick(s){
    need(16);doc.setDrawColor(...ink);doc.setLineWidth(1.1);doc.line(M+14,y+6,M+17,y+9.5);doc.line(M+17,y+9.5,M+23,y+2);
    font(false);doc.setFontSize(10.5);doc.setTextColor(...ink);doc.text(String(s),M+32,y+10.5);y+=15.5;
  }
  function eduTable(ed){
    const cols=[['Qualification',.22],['Institution',.30],['University/Board',.20],['Year',.13],['Marks/%',.15]].map(([h,f])=>[h,f*cw]);
    const draw=(cells,bold)=>{
      font(bold);doc.setFontSize(10);
      const wr=cells.map((c,i)=>doc.splitTextToSize(String(c||''),cols[i][1]-10)),n=Math.max(...wr.map(a=>a.length)),h=n*13.2+8;
      need(h);let x=M;doc.setDrawColor(50,50,50);doc.setLineWidth(.7);doc.setTextColor(...ink);
      wr.forEach((ls,i)=>{doc.rect(x,y,cols[i][1],h);doc.text(ls,x+5,y+12.5);x+=cols[i][1]});y+=h;
    };
    draw(cols.map(c=>c[0]),true);ed.forEach(e=>draw([e.degree,e.school,e.board,e.end||e.start,e.marks],false));
  }
  /* header */
  const photo=t.photo&&r.photo,hw=photo?cw-96:cw,y0=y,al=t.align==='center'?'center':'left';
  const nm=p.name||'Your Name';
  txt(t.fresher?nm.toUpperCase():nm,{size:t.fresher?18:25,b:true,color:ac,align:al,w:hw});
  if(t.nameLine){doc.setDrawColor(...ac);doc.setLineWidth(1);doc.line(M,y+1,M+hw,y+1);y+=9}
  if(p.role)txt(p.role,{size:12,color:gray,align:al,w:hw});
  if(t.fresher){
    [['Address',p.location],['Phone No.',p.phone],['Email ID',p.email],['Link',p.link]].forEach(([l,v])=>{
      if(!v)return;font(true);doc.setFontSize(10.5);const lw=doc.getTextWidth(l+': ');font(false);
      const vs=doc.splitTextToSize(String(v),hw-lw);need(vs.length*14+4);
      font(true);doc.setTextColor(...ink);doc.text(l+':',M,y+10.5);font(false);doc.text(vs,M+lw,y+10.5);y+=vs.length*14+3;
    });
  }else{const c=[p.email,p.phone,p.location,p.link].filter(Boolean).join('   |   ');if(c)txt(c,{size:9.5,color:gray,align:al,w:hw})}
  if(photo){try{doc.addImage(r.photo,'JPEG',W-M-80,y0,80,94)}catch(e){}y=Math.max(y,y0+102)}
  if(t.thick){y+=6;doc.setDrawColor(...ink);doc.setLineWidth(3);doc.line(M,y,W-M,y);doc.setLineWidth(.6);doc.line(M,y+4.5,W-M,y+4.5);y+=8}
  /* sections */
  order(r).forEach(k=>{
    sec(t.caps?T[k].toUpperCase():T[k]);
    if(k==='summary')txt(r.summary,{size:10.5});
    else if(k==='experience'){r.experience.filter(e=>e.role||e.company||e.desc).forEach(e=>{row(e.role,e.start?`${e.start} – ${e.end||'Present'}`:e.end,e.company);lines(e.desc).forEach(bullet);y+=4})}
    else if(k==='projects'){r.projects.filter(x=>x.name||x.desc).forEach(x=>{row(x.name,'');if(x.desc)txt(x.desc,{size:10,gap:3})})}
    else if(k==='education'){
      const ed=r.education.filter(e=>e.degree||e.school);
      if(t.eduTable)eduTable(ed);else ed.forEach(e=>{row(e.degree,e.start?`${e.start} – ${e.end||''}`:e.end,[e.school,e.board,e.marks].filter(Boolean).join(' · '));y+=3});
    }
    else if(k==='skills'){if(t.skillsCheck)skillList(r).forEach(tick);else txt(r.skills,{size:10})}
    else if(k==='certs'||k==='awards')lines(r[k]).forEach(bullet);
    else if(k==='languages')txt(r.languages,{size:10});
    else if(k==='profile'){profRows(r).forEach(([l,v])=>{
      font(false);doc.setFontSize(10.5);doc.setTextColor(...ink);const vs=doc.splitTextToSize(v,cw-175);need(vs.length*14+4);
      doc.text(l,M+22,y+11);doc.text(':',M+150,y+11);doc.text(vs,M+162,y+11);y+=vs.length*14+3})}
    else if(k==='declaration'){
      txt(r.decl.text,{size:10.5,gap:4});need(60);const y1=y;
      [['Place',r.decl.place],['Date',r.decl.date]].forEach(([l,v])=>{font(true);doc.setFontSize(10.5);doc.setTextColor(...ink);const lw=doc.getTextWidth(l+': ');doc.text(l+':',M,y+10.5);font(false);doc.text(String(v||''),M+lw,y+10.5);y+=18});
      font(true);doc.setFontSize(10.5);doc.text('Signature',W-M,y1+10.5,{align:'right'});
      const sn=p.name||'';if(sn){const w=doc.getTextWidth(sn);doc.text(sn,W-M,y1+30,{align:'right'});doc.setDrawColor(...ink);doc.setLineWidth(.7);doc.line(W-M-w,y1+32,W-M,y1+32)}
    }
  });
  savePDF(doc,(p.name||r.title||'resume')+(r.type==='cv'?'_CV':'_Resume'),r.type==='cv'?'cv':'resume');
}
function checkLatin(r){if(NONLATIN.test(JSON.stringify({...r,photo:''})))toast('Heads up: the PDF supports Latin characters only. Other scripts may not appear.')}
function letterPDF(text,name){
  const doc=getPDF();if(!doc)return;
  const W=595.28,H=841.89,M=64;let y=M;
  doc.setFont('helvetica','normal');doc.setFontSize(11.5);doc.setTextColor(26,34,56);
  text.split('\n').forEach(par=>{
    const ls=par.trim()?doc.splitTextToSize(par,W-2*M):[''];
    ls.forEach(l=>{if(y>H-M){doc.addPage();y=M}doc.text(l,M,y+11);y+=17});
  });
  savePDF(doc,name,'cover_letter');
}

/* ---------- actions ---------- */
const EDT={};
function touch(){const r=S.cur;if(!r)return;r.updated=Date.now();if(r.saved){persist();if(Date.now()-(EDT[r.id]||0)>300000){EDT[r.id]=Date.now();track('resume_edited',{type:r.type})}}}
async function saveCur(msg=true){
  const r=S.cur;if(!r)return;
  const existed=!!S.resumes.find(x=>x.id===r.id);if(!existed)S.resumes.unshift(r);track(existed?'resume_edited':'resume_saved',{type:r.type});
  r.saved=true;r.updated=Date.now();clearTimeout(saveT);
  const ok=await saveKey('r44:resumes',S.resumes);
  if(msg)toast(ok?'Saved to My Resumes':'Saving is blocked here, so it will be lost when you close the app. Tap Download PDF to keep a copy.',ok?3000:6000);
}
const custom=()=>{S.cur.theme.preset='custom'};
const themeChanged=(form=true)=>{if(form)renderForm();renderPreview();touch()};
const ACT={
 nav:b=>go(b.dataset.v),
 menu:()=>{$('#side').classList.toggle('open');$('#scrim').classList.toggle('open')},
 newRes:b=>go(b.dataset.type==='cv'?'cv':'builder',{fresh:true}),
 openRes:b=>go(S.resumes.find(r=>r.id===b.dataset.id).type==='cv'?'cv':'builder',{id:b.dataset.id}),
 dupRes:b=>{const o=S.resumes.find(r=>r.id===b.dataset.id),c=JSON.parse(JSON.stringify(o));c.id=uid();c.title=o.title+' (copy)';c.updated=Date.now();S.resumes.unshift(c);persist();render();toast('Duplicated')},
 delRes:b=>{const id=b.dataset.id;if(S.delArm===id){S.resumes=S.resumes.filter(r=>r.id!==id);if(S.cur&&S.cur.id===id)S.cur=null;S.delArm=null;persist();toast('Deleted')}else S.delArm=id;render()},
 pdfRes:b=>{const r=S.resumes.find(x=>x.id===b.dataset.id);checkLatin(r);resumePDF(r)},
 docx:()=>{if(S.cur)exportDOCX(S.cur)},
 tab:b=>{S.tab=b.dataset.v;$('#builder').dataset.tab=S.tab;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.v===S.tab));window.scrollTo(0,0)},
 sample:()=>{const o=S.cur,s=sample(o.type);Object.assign(s,{id:o.id,theme:o.theme,photo:o.photo,saved:o.saved});if(o.theme.profile&&!s.decl.date)s.decl.date=todayStr();S.cur=s;$('#titleIn').value=s.title;renderForm();renderPreview();toast('Sample loaded. Edit anything you like.')},
 pdfSave:async()=>{try{if(await pdfNative()){countDl();toast('PDF saved to Documents');return}}catch(e){console.error(e);track('pdf_failed',{why:'native'})}
    try{const f=new File([PDF.blob],PDF.fn,{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[f]})&&navigator.share){await navigator.share({files:[f],title:PDF.fn});countDl();return}}catch(e){if(e&&e.name==='AbortError')return;track('pdf_failed',{why:'share_fallback'})}
    if(pdfDownload())toast('Download started. Check your Downloads folder.',4000)},
 pdfShare:async()=>{try{await navigator.share({files:[new File([PDF.blob],PDF.fn,{type:'application/pdf'})],title:PDF.fn});countDl()}catch(e){if(!e||e.name!=='AbortError'){track('pdf_failed',{why:'share'});toast('Sharing is not available. Try Save to device or Open PDF.')}}},
 pdfAlt:async()=>{try{const a=document.createElement('a');a.href='data:application/pdf;base64,'+await blobB64(PDF.blob);a.download=PDF.fn;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1500);countDl();toast('Saving… check your Downloads folder',4000)}catch(e){track('pdf_failed',{why:'alt'});toast('Could not save. Try Share or Open PDF.')}},
 pdfOpen:()=>{const w=window.open(PDF.url,'_blank');if(!w){track('pdf_failed',{why:'popup'});toast('The new tab was blocked. Allow pop-ups, or use Save to device.')}else countDl()},
 pdfClose:(b,e)=>{if(b.id==='pdfSheet'&&e&&e.target!==b)return;$('#pdfSheet').classList.remove('open')},
 acMode:b=>{S.f.acc.mode=b.dataset.v;$('#main').innerHTML=vAccount()},
 authGo:async b=>{const f=S.f.acc,su=f.mode==='signup',old=b.innerHTML;b.disabled=true;
   try{const d=await api(su?'/api/register':'/api/login',{method:'POST',body:{name:f.name,email:f.email,password:f.pass}});
     BK.token=d.token;BK.user=d.user;await saveKey('r44:auth',BK.token);f.pass='';toast(su?'Account created':'Logged in');go('account')}
   catch(e){toast(e.status?e.message:'Could not reach the server. Check your connection.',5000)}
   b.disabled=false;b.innerHTML=old},
 logout:()=>{BK.token='';BK.user=null;saveKey('r44:auth','');toast('Logged out');go('account')},
 aiToggle:()=>{AIM.on=!AIM.on;saveKey('r44:aimode',AIM.on);paintAI();track('ai_mode',{on:AIM.on});
   toast(AIM.on?'AI mode ON: smart features enabled':'AI mode OFF: lightweight manual mode',2500)},
 save:()=>saveCur(),
 pdf:()=>{checkLatin(S.cur);resumePDF(S.cur);if(S.cur.saved)touch()},
 /* theme */
 atsMode:()=>{if(!S.cur)return;S.cur.theme=mkTheme('classic');S.cur.theme.photo=false;S.cur.photo='';S.cur.theme.align='left';S.cur.theme.fresher=false;S.cur.theme.eduTable=false;S.cur.theme.skillsCheck=false;S.cur.theme.profile=false;S.cur.theme.declaration=false;S.cur.theme.hide=S.cur.theme.hide||{};themeChanged();toast('ATS-friendly layout applied. Photo removed; use simple headings and one column.')},
 preset:b=>{track('template_used',{tpl:b.dataset.v});S.cur.theme=mkTheme(b.dataset.v);if(S.cur.theme.declaration&&!S.cur.decl.date)S.cur.decl.date=todayStr();themeChanged()},
 head:b=>{S.cur.theme.head=b.dataset.v;custom();themeChanged()},
 accent:b=>{S.cur.theme.accent=b.dataset.v;custom();themeChanged()},
 font:b=>{S.cur.theme.font=b.dataset.v;custom();themeChanged()},
 align:b=>{S.cur.theme.align=b.dataset.v;custom();themeChanged()},
 photoRemove:()=>{S.cur.photo='';themeChanged()},
 /* list edits */
 addExp:()=>{S.cur.experience.push({role:'',company:'',start:'',end:'',desc:''});renderForm()},
 delExp:b=>{S.cur.experience.splice(+b.dataset.i,1);renderForm();renderPreview();touch()},
 addEdu:()=>{S.cur.education.push({degree:'',school:'',board:'',start:'',end:'',marks:''});renderForm()},
 delEdu:b=>{S.cur.education.splice(+b.dataset.i,1);renderForm();renderPreview();touch()},
 addProj:()=>{S.cur.projects.push({name:'',desc:''});renderForm()},
 delProj:b=>{S.cur.projects.splice(+b.dataset.i,1);renderForm();renderPreview();touch()},
 /* sharing */
 shareToggle:()=>{S.shareOpen=!S.shareOpen;if(S.shareOpen&&!S.sh.name)S.sh.name='';renderForm()},
 mkCode:()=>{S.sh.code=enc(curPayload());renderForm()},
 copyCode:()=>copyStr(S.sh.code),
 nativeShare:async()=>{const p=curPayload();const text=`Try my resume template "${p.name}" on Resume44. Open Themes & Sharing, paste this code under "Use a friend's template":\n${S.sh.code}`;
   try{if(navigator.share){await navigator.share({title:'Resume44 template',text})}else copyStr(text)}catch(e){copyStr(text)}},
 saveTpl:()=>{const p=curPayload();S.templates.unshift({id:uid(),payload:p});persistMeta();toast('Saved to My templates')},
 pubTpl:async b=>{
   const p=curPayload(),key='r44tpl:'+uid();
   if(!hasWS()){toast('Publishing is not available here. Use the share code instead.');return}
   try{await window.storage.set(key,enc(p),true);S.pub.push(key);persistMeta();S.gallery=null;toast('Published. Friends can find it in the gallery.')}
   catch(e){console.error(e);toast('Publishing is not available here. Use the share code instead.')}
 },
 pubMine:async b=>{const t=S.templates.find(x=>x.id===b.dataset.id),key='r44tpl:'+uid();
   if(!hasWS()){toast('Publishing is not available here. Use the share code instead.');return}
   try{await window.storage.set(key,enc(t.payload),true);S.pub.push(key);persistMeta();S.gallery=null;render();toast('Published to the friends\u2019 gallery')}
   catch(e){toast('Publishing is not available here. Use the share code instead.')}},
 codeTpl:b=>{const t=S.templates.find(x=>x.id===b.dataset.id);copyStr(enc(t.payload))},
 delTpl:b=>{S.templates=S.templates.filter(x=>x.id!==b.dataset.id);persistMeta();render()},
 useBuiltin:b=>{track('template_used',{tpl:b.dataset.id});const r=blank('resume');r.theme=mkTheme(b.dataset.id);r.title=PRESETS[b.dataset.id].name+' resume';if(r.theme.declaration)r.decl.date=todayStr();go('builder',{cur:r});toast('Theme applied. Customize it in Theme and layout.')},
 useTpl:b=>{const d=b.dataset,src=d.src==='mine'?S.templates.find(x=>x.id===d.id)?.payload:d.src==='feat'?S.featured.find(x=>x.id===d.id)?.payload:(S.gallery||[]).find(g=>g.key===d.id)?.payload;if(src){track('template_used',{tpl:d.src==='feat'?'t:'+d.id:'shared'});useTemplate(src)}},
 keepTpl:b=>{const g=S.gallery.find(x=>x.key===b.dataset.id);if(g){S.templates.unshift({id:uid(),payload:g.payload});persistMeta();render();toast('Saved to My templates')}},
 removePub:async b=>{try{if(hasWS())await window.storage.delete(b.dataset.id,true)}catch(e){}S.pub=S.pub.filter(k=>k!==b.dataset.id);persistMeta();S.gallery=(S.gallery||[]).filter(g=>g.key!==b.dataset.id);render();toast('Removed from the gallery')},
 loadGal:b=>{if(!hasWS()){S.gallery=[];render();toast('The friends\u2019 gallery is not available here.');return}return run(b,async()=>{
   let l;try{l=await window.storage.list('r44tpl:',true)}catch(e){S.gallery=[];render();toast('Friends\u2019 gallery is not available here yet.');return}
   const keys=((l&&l.keys)||[]).slice(-24).reverse(),out=[];
   for(const k of keys){try{const g=await window.storage.get(k,true);const p=g&&dec(g.value);if(p)out.push({key:k,payload:p})}catch(e){}}
   S.gallery=out;render();
 })},
 importCode:()=>{const p=dec(S.f.imp.code||'');if(!p){toast('That code does not look right. Ask your friend to copy it again.');return}
   S.templates.unshift({id:uid(),payload:p});S.f.imp.code='';persistMeta();render();toast(`Added "${p.name}". Tap Use to start with it.`)},
 /* AI + tools */
 aiSummary:b=>{const r=S.cur;
   const apply=t=>{r.summary=t;renderForm();renderPreview();touch()};
   return run(b,async()=>{
     const ctx=`Target role: ${r.personal.role||'not given'}\nSkills: ${r.skills||'not given'}\nExperience: ${r.experience.map(e=>`${e.role} at ${e.company}: ${lines(e.desc).join('; ')}`).join(' | ')}\nEducation: ${r.education.map(e=>e.degree).join(', ')}`;
     apply(await ai(`Write ${r.theme.fresher?'a 2 to 3 sentence career objective for an entry-level candidate':'a 2 to 3 sentence professional summary'} for a resume, in first person without using "I" unless natural. Use only the facts below and do not invent numbers.\n\n${ctx}`,SYS_TXT));
   },()=>apply(fbSummary(r)))},
 improve:b=>{const r=S.cur,e=r.experience[+b.dataset.i];if(!e.desc.trim()){toast('Add a few lines first, then improve them.');return}
   return run(b,async()=>{
     const t=await ai(`Rewrite these resume bullet points for a ${e.role||'professional'}. Start each with a strong action verb, keep each under 25 words, keep every fact and number the same, do not invent metrics. One bullet per line, no bullet symbols.\n\n${e.desc}`,SYS_TXT);
     e.desc=lines(t).map(l=>l.replace(/^[-•*]\s*/,'')).join('\n');renderForm();renderPreview();touch();
   },()=>{e.desc=lines(e.desc).map(l=>{l=l.replace(/^[-•*]\s*/,'');return l.charAt(0).toUpperCase()+l.slice(1)}).join('\n');renderForm();renderPreview();touch()})},
 copy:b=>copyStr($('#'+b.dataset.t).value),
 copyText:b=>copyStr(S.out.ob[+b.dataset.i]),
 useOb:b=>{const r=blank('resume');r.summary=S.out.ob[+b.dataset.i];r.personal.role=S.f.ob.role||'';go('builder',{cur:r});toast('Added as your summary')},
 genCover:b=>{const f=S.f.cl;if(!f.role||!f.company){toast('Add the job title and company first.');return}
   const show=t=>{S.out.cover=t;$('#clOut').innerHTML=coverOut()};
   return run(b,async()=>show(await ai(`Write a one-page cover letter (about 250 words) in a ${f.tone} tone.\nApplicant: ${f.name||'[Your name]'}\nJob: ${f.role} at ${f.company}\nHiring manager: ${f.manager||'unknown, use "Dear Hiring Manager"'}\nStrengths and experience to feature: ${f.points||'not given, keep it general and do not invent facts'}\nStart with the greeting and end with the sign-off and name. Use plain paragraphs. Do not invent specific achievements.`,SYS_TXT)),()=>show(fbCover(f)))},
 pdfCover:()=>letterPDF(S.out.cover,(S.f.cl.name||'cover_letter')+'_Cover_Letter'),
 runATS:()=>{const f=S.f.ats;if(!(f.text||'').trim()){toast('Upload your resume photo first.');return}track('ats_check',{jd:!!(f.jd||'').trim()});S.out.atsAI='';S.ats=analyze(f.text,f.jd);$('#atsOut').innerHTML=atsOut();$('#atsOut').scrollIntoView({behavior:'smooth'})},
 aiATS:b=>run(b,async()=>{const f=S.f.ats;
   const t=await ai(`Review this resume${f.jd?' against the job description':''} and give the 5 most useful, specific improvements for passing applicant tracking systems and impressing a recruiter. Number them 1 to 5, one or two sentences each. Plain text.\n\nRESUME:\n${f.text.slice(0,4000)}\n${f.jd?'\nJOB DESCRIPTION:\n'+f.jd.slice(0,2000):''}`,SYS_TXT);
   S.out.atsAI=t;$('#atsAI').textContent=t},()=>{const a=S.ats,tips=a.checks.filter(c=>c.status!=='pass').map(c=>c.detail);if(a.missing.length)tips.push('Add these keywords where they are true for you: '+a.missing.slice(0,8).join(', ')+'.');const t=(tips.length?tips:['Your resume covers the basics. Add more measurable results to stand out.']).slice(0,5).map((x,i)=>(i+1)+'. '+x).join('\n');S.out.atsAI=t;$('#atsAI').textContent=t}),
 genIv:b=>{const f=S.f.iv;if(!f.role){toast('Enter the role first.');return}
   const show=q=>{S.out.iv=q;$('#ivOut').innerHTML=ivOut()};
   return run(b,async()=>{
     const t=await ai(`Create 8 likely interview questions for a ${f.level} ${f.role}. Question type: ${f.type}. For each give a short tip on how to answer and a 2 to 3 sentence sample answer outline. Return ONLY a JSON array like [{"q":"","tip":"","sample":""}].`,SYS_TXT);
     const arr=parseJSON(t);if(!Array.isArray(arr)||!arr.length)throw new Error('bad json');show(arr.slice(0,8));
   },()=>show(IV_BANK))},
 genOb:b=>{const f=S.f.ob;if(!f.role){toast('Enter the target role first.');return}
   const show=a=>{S.out.ob=a;$('#obOut').innerHTML=obOut()};
   return run(b,async()=>{
     const t=await ai(`Write 3 different career objectives (each 1 to 2 sentences) for a ${f.level} candidate targeting a ${f.role} role. Skills: ${f.skills||'not given'}. Make them specific and natural, not generic. Return ONLY a JSON array of 3 strings.`,SYS_TXT);
     const arr=parseJSON(t);if(!Array.isArray(arr)||!arr.length)throw new Error('bad json');show(arr.slice(0,3));
   },()=>show(fbObjective(f.role,f.level,f.skills)))},
 genSi:b=>{const f=S.f.si;if(!f.name&&!f.bg){toast('Add your name or a few details first.');return}
   const show=t=>{S.out.si=t;$('#siOut').innerHTML=siOut()};
   return run(b,async()=>show(await ai(`Write a spoken self-introduction of about ${f.len} for a ${f.ctx}.\nName: ${f.name||'not given'}\nRole or course: ${f.role||'not given'}\nBackground: ${f.bg||'not given'}\nUse natural speech, first person, no headings. Use only the facts given.`,SYS_TXT)),()=>show(fbIntro(f)))}
};

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
  const fn=ACT[b.dataset.act];if(fn)fn(b,e);
});
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.color&&S.cur){S.cur.theme.accent=el.value;custom();renderPreview();touch()}
  else if(el.dataset.sh){S.sh[el.dataset.sh]=el.type==='checkbox'?el.checked:el.value}
  else if(el.dataset.path&&S.cur){setPath(S.cur,el.dataset.path,el.value);if(el.dataset.path==='title')touch();else{renderPreview();touch()}}
  else if(el.dataset.f)setPath(S.f,el.dataset.f,el.value);
  else if(el.dataset.out)S.out[el.dataset.out]=el.value;
});
document.addEventListener('change',async e=>{
  const el=e.target;
  if(el.dataset.f)setPath(S.f,el.dataset.f,el.value);
  if(el.dataset.sh)S.sh[el.dataset.sh]=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.tg&&S.cur){const t=S.cur.theme;t[el.dataset.tg]=el.checked;custom();
    if(el.dataset.tg==='declaration'&&el.checked&&!S.cur.decl.date)S.cur.decl.date=todayStr();
    themeChanged()}
  if(el.dataset.hide&&S.cur){S.cur.theme.hide[el.dataset.hide]=!el.checked;custom();renderPreview();touch()}
  if(el.dataset.ocr&&el.files&&el.files[0]){const f=el.files[0];el.value='';await ocrTarget(el.dataset.ocr,f);return}
  if(el.dataset.photo&&el.files&&el.files[0]){
    const f=el.files[0];el.value='';
    if(!okImage(f)){toast('Please choose a JPG or PNG photo (under 25 MB).');track('upload_failed',{target:'photo',why:'type'});return}
    try{S.cur.photo=await photoFile(f);S.cur.theme.photo=true;themeChanged();track('image_upload',{target:'photo'});toast('Photo added')}
    catch(err){track('upload_failed',{target:'photo',why:'read'});toast('Could not read that image. Try a JPG or PNG.')}
  }
  if(el.dataset.load&&el.value){
    const r=S.resumes.find(x=>x.id===el.value);if(!r)return;
    if(S.view==='cover'){Object.assign(S.f.cl,{name:r.personal.name,role:r.personal.role,points:[r.summary,r.skills&&'Skills: '+r.skills].filter(Boolean).join(' ')});$('#main').innerHTML=vCover()}
    if(S.view==='ats'){S.f.ats.text=resumeText(r);$('#main').innerHTML=vATS()}
  }
});
function resumeText(r){
  const p=r.personal;
  return [p.name,p.role,[p.email,p.phone,p.location,p.link].filter(Boolean).join(' | '),'',r.summary&&'Summary\n'+r.summary,
   'Experience',...r.experience.map(e=>`${e.role} - ${e.company} (${e.start} - ${e.end||'Present'})\n${lines(e.desc).map(l=>'- '+l).join('\n')}`),
   'Education',...r.education.map(e=>`${e.degree}, ${e.school}, ${e.board} (${e.end}) ${e.marks}`),
   r.projects.length?'Projects':'',...r.projects.map(x=>`${x.name}: ${x.desc}`),
   'Skills\n'+r.skills,r.certs&&'Certifications\n'+r.certs,r.languages&&'Languages\n'+r.languages,r.awards&&'Awards\n'+r.awards].filter(x=>x!=null).join('\n');
}

/* ---------- start ---------- */
(async()=>{
  AIM.on=(await loadKey('r44:aimode',true))!==false;
  S.resumes=(await loadKey('r44:resumes',[])).map(migrate);
  const m=await loadKey('r44:meta',{templates:[],pub:[]});
  S.templates=(m.templates||[]).map(t=>({id:t.id,payload:normPayload(t.payload)}));S.pub=m.pub||[];
  render();
  await initBackend();
  navItems();if(S.view==='templates')render();
})();