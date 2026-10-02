const $=s=>document.querySelector(s),app=$('#app');
const el=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){if(k.startsWith('on')||k=='checked'||k=='value')e[k]=a[k];else e.setAttribute(k,a[k])}c.flat().forEach(x=>e.append(x&&x.nodeType?x:document.createTextNode(x??'')));return e};
firebase.initializeApp(FB_CONFIG);const auth=firebase.auth(),db=firebase.firestore();
let uid,S={},DATA,DEF={},tab='home',FORM={},TIPS={},fq='',open=new Set(),msg='',timer;
const store=()=>localStorage.setItem('st_'+uid,JSON.stringify(S));
const save=()=>{S.dirty=1;store();clearTimeout(timer);timer=setTimeout(sync,700)};
async function sync(){if(!uid||!navigator.onLine)return;
 try{const ref=db.doc('users/'+uid);
  if(!S.wipe){const s=await ref.get();if(s.exists)S={...S,...merge(S,s.data())}}
  const out={ticks:S.ticks||{},exam:S.exam||{},updatedAt:Date.now()};if(S.profile)out.profile=S.profile;
  S.wipe?await ref.set(out):await ref.set(out,{merge:true});
  S.dirty=0;S.wipe=0;store();msg='Synced ✓'}catch(e){msg='Not synced yet'}
 render(true);if(!document.activeElement||!document.activeElement.matches('input'))render()}
addEventListener('online',sync);
const stCls=()=>'muted'+(msg.startsWith('Synced')?' ok':msg.startsWith('Not')?' bad':'');
const tp=c=>c.topics.map((n,i)=>({id:c.id+'-t'+(i+1),n}));
const isDone=id=>S.ticks&&S.ticks[id]&&S.ticks[id].v;
const subStat=s=>{let t=0,d=0;s.chapters.forEach(c=>tp(c).forEach(x=>{t++;if(isDone(x.id))d++}));return{t,d}};
const det=(k,sum,body,f)=>{const d=el('details',{},el('summary',{},sum),el('div',{class:'in'},body));d.dataset.k=k;d.open=open.has(k)||!!f;d.ontoggle=()=>d.open?open.add(k):open.delete(k);return d};
const ring=({t,d})=>{const p=t?d/t:0,C=2*Math.PI*16,w=el('span',{class:'ring'});w.innerHTML=`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="bg"/><circle cx="20" cy="20" r="16" class="fg" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 20 20)"/></svg><i>${Math.round(p*100)}%</i>`;return w};
function fx(f){const m=el('div',{class:'tex'});try{katex.render(f.tex,m,{throwOnError:false})}catch(e){m.textContent=f.tex}return el('div',{class:'fx'},el('div',{class:'muted'},f.label+(f.unit?' ('+f.unit+')':'')),m)}
let fsub='';
const go=(s,c)=>{tab='formulas';fsub=s.id;fq='';open.add('fs'+s.id);open.add('f'+c.id);render();const t=document.querySelector('[data-k="f'+c.id+'"]');t&&t.scrollIntoView()};
function formulas(){const subs=DATA.subjects.filter(s=>FORM[s.id]),out=el('div'),cur=subs.find(s=>s.id==fsub);
 const jump=el('select',{onchange:ev=>{const v=ev.target.value;if(!v)return;open.add('fs'+fsub);open.add('f'+v);draw();ev.target.value='';const t=out.querySelector('[data-k="f'+v+'"]');t&&t.scrollIntoView()}});
 if(cur)jump.append(el('option',{value:''},'Jump to chapter…'),...cur.chapters.filter(c=>(FORM[cur.id][c.id]||[]).length).map(c=>el('option',{value:c.id},c.name)));
 const draw=()=>{const q=fq.trim().toLowerCase();out.replaceChildren(...subs.filter(s=>!fsub||s.id==fsub).map(s=>{const chs=s.chapters.map(c=>({c,f:(FORM[s.id][c.id]||[]).filter(f=>!q||(f.label+' '+f.tex+' '+c.name).toLowerCase().includes(q))})).filter(x=>x.f.length);
  return chs.length?det('fs'+s.id,el('b',{},s.name),chs.map(({c,f})=>det('f'+c.id,el('span',{class:'row'},el('span',{},c.name),el('span',{class:'muted'},f.length)),f.map(fx),!!q)),!!q||!!fsub):''}));
  if(!out.children.length)out.append(el('p',{class:'muted'},subs.length?'No formula matches.':'Formulas for your subjects arrive in the next updates.'))};
 const chip=(id,l)=>el('button',{class:fsub==id?'on':'',onclick:()=>{fsub=id;render()}},l);
 draw();return el('div',{},el('div',{class:'fbar'},el('input',{type:'search',class:'srch',placeholder:'Search formulas',value:fq,oninput:ev=>{fq=ev.target.value;draw()}}),el('div',{class:'chips'},chip('','All'),subs.map(s=>chip(s.id,s.name))),cur?jump:''),out)}
function tracker(){return el('div',{},DATA.subjects.map(s=>{const st=subStat(s);
 return det('s'+s.id,el('span',{class:'row'},ring(st),el('b',{},s.name),el('span',{class:'muted'},st.d+'/'+st.t)),
 s.chapters.length?s.chapters.map(c=>{const t=tp(c),d=t.filter(x=>isDone(x.id)).length;
  return det(c.id,el('span',{class:'row'},el('span',{},c.name),el('span',{class:'muted'},d+'/'+t.length+' topics')),
  [lk(s,c),...t.map(x=>el('label',{class:'chk'},el('input',{type:'checkbox',checked:!!isDone(x.id),onchange:ev=>{S.ticks=S.ticks||{};S.ticks[x.id]={v:ev.target.checked,t:Date.now()};save();render()}}),x.n))])}):el('p',{class:'muted'},'Topics for this subject arrive in the next update.'))}))}
function home(){const today=new Date();today.setHours(0,0,0,0);
 const rows=DATA.subjects.map(s=>{const e=S.exam&&S.exam[s.id],d=e?e.d:(DEF[s.id]||{}).date;return{s,e,d,days:d?Math.ceil((new Date(d+'T00:00')-today)/864e5):null,st:subStat(s)}});
 const nx=rows.filter(r=>r.days!=null&&r.days>=0).sort((a,b)=>a.days-b.days)[0];
 return el('div',{},
  nx?el('div',{class:'card'},el('b',{},'Next exam'),el('div',{class:'big'},nx.days+(nx.days==1?' day':' days')),el('div',{class:'muted'},nx.s.name+' · '+new Date(nx.d+'T00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})+(nx.e?'':' (estimated)'))):'',
  el('p',{class:'muted'},'Tap a subject to see or edit its exam date. "Estimated" dates are guesses until CBSE releases the date sheet.'),
  rows.map(({s,e,d,days,st})=>{const left=st.t-st.d;
   return det('h'+s.id,el('span',{class:'row'},ring(st),el('b',{},s.name),el('span',{class:'muted'},days==null?'—':days>=0?days+' days':'Over')),[
    el('div',{class:'row'},el('input',{type:'date',value:d||'',onchange:ev=>{S.exam=S.exam||{};S.exam[s.id]={d:ev.target.value,t:Date.now()};save();render()}}),el('span',{class:'tag'+(e?'':' est')},e?'edited':'estimated')),
    el('div',{class:'muted',style:'margin-top:8px'},st.t?left+' of '+st.t+' topics still uncovered':'Syllabus not added yet'),
    days>0&&left?el('div',{class:'muted'},'about '+(left/days).toFixed(1)+' topics per day needed'):''])}))}
let tipc='';
const goTips=(s,c)=>{tab='tips';tipc=c.id;open.add('ts'+s.id);render();const t=document.querySelector('[data-c~="'+c.id+'"]');t&&t.scrollIntoView({block:'center'})};
const lk=(s,c)=>{const b=[];if(FORM[s.id]&&(FORM[s.id][c.id]||[]).length)b.push(el('button',{onclick:()=>go(s,c)},'Formulas'));if(TIPS[s.id]&&(TIPS[s.id].weightage||[]).some(w=>(w.ids||[w.id]).includes(c.id)))b.push(el('button',{onclick:()=>goTips(s,c)},'Tips'));return b.length?el('div',{class:'go'},b):''};
function tips(){const subs=DATA.subjects.filter(s=>TIPS[s.id]);
 if(!subs.length)return el('div',{class:'card'},el('b',{},'Tips'),el('p',{class:'muted'},'Tips for your subjects arrive in the next updates.'));
 const list=(h,a)=>a&&a.length?[el('div',{class:'tt'},h,el('span',{class:'tag'},'General advice')),el('ol',{class:'tl'},a.map(x=>el('li',{},x)))]:[];
 return el('div',{},el('p',{class:'muted'},'Marks are as printed in the CBSE 2026-27 syllabus. "General advice" is not official; your teachers know best.'),subs.map(s=>{const T=TIPS[s.id];
  return det('ts'+s.id,el('b',{},s.name),[el('div',{class:'tt'},'Marks by unit'),
   ...(T.weightage||[]).map(w=>{const ids=w.ids||[w.id],cs=s.chapters.filter(c=>ids.includes(c.id));return cs.length?el('div',{class:'wt'+(ids.includes(tipc)?' hl':''),'data-c':ids.join(' ')},el('span',{},w.label||cs[0].name),el('b',{},w.marks)):''}),
   T.note?el('p',{class:'muted'},T.note):'',...list('Common mistakes',T.mistakes),...list('Study order',T.order),
   ...(T.resources&&T.resources.length?[el('div',{class:'tt'},'Resources'),...T.resources.map(r=>el('a',{href:r.url,target:'_blank',rel:'noopener',class:'lnk'},r.label))]:[])],subs.length==1)}))}
function settings(){const inp=el('input',{type:'file',accept:'.json',style:'display:none',onchange:async ev=>{try{const j=JSON.parse(await ev.target.files[0].text());S={...S,...merge(S,j)};save();render();alert('Backup merged.')}catch(e){alert('That file could not be read.')}}});
 return el('div',{},el('div',{class:'card'},el('b',{},S.profile.name+' · Class '+S.profile.cls),el('div',{class:'muted'},auth.currentUser.email)),
 el('div',{class:'card'},el('b',{},'Backup'),el('div',{class:'row'},el('button',{onclick:()=>{const a=el('a',{href:URL.createObjectURL(new Blob([JSON.stringify({app:'board-tracker',v:1,profile:S.profile,ticks:S.ticks,exam:S.exam})],{type:'application/json'})),download:'study-backup.json'});a.click()}},'Export JSON'),el('button',{onclick:()=>inp.click()},'Import JSON'),inp)),
 el('div',{class:'card'},el('button',{onclick:()=>auth.signOut()},'Sign out')),
 el('div',{class:'card danger'},el('b',{},'Change profile / reset'),el('p',{class:'muted'},'Warning: this erases your name, class, ticked topics and edited exam dates for this account on ALL devices. Export a backup first.'),
  el('button',{onclick:()=>{if(confirm('Erase all progress for this account and set up the profile again?')){S={wipe:1,ticks:{},exam:{}};store();start();sync()}}},'Reset everything')))}
const IC={home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',formulas:'<path d="M18 6H7l6 6-6 6h11"/>',tracker:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',tips:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',settings:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 14.5-4 16 0"/>'};
const nav=()=>el('nav',{},[['home','Home'],['formulas','Formulas'],['tracker','Syllabus'],['tips','Tips'],['settings','Profile']].map(([k,l])=>{const b=el('button',{class:tab==k?'on':'',onclick:()=>{tab=k;tipc='';render()}});b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg><span>'+l+'</span>';return b}));
function render(statusOnly){if(!S.profile||!DATA)return;if(statusOnly){const m=$('#msg');if(m)m.textContent=msg;m.className=stCls();return}
 const y=scrollY;app.replaceChildren(el('header',{},el('b',{},'Hi, '+S.profile.name),el('span',{id:'msg',class:stCls()},msg)),el('main',{},({home,formulas,tracker,tips,settings})[tab]()),nav());scrollTo(0,y)}
function login(){let em,pw,er;app.replaceChildren(el('form',{class:'card login',onsubmit:ev=>{ev.preventDefault();er.textContent='';auth.signInWithEmailAndPassword(em.value.trim(),pw.value).catch(e=>er.textContent='Sign-in failed: '+e.code)}},el('h1',{},'EdTracker'),em=el('input',{type:'email',placeholder:'Email',autocomplete:'username'}),pw=el('input',{type:'password',placeholder:'Password',autocomplete:'current-password'}),er=el('p',{class:'err'}),
 el('button',{class:'pri',type:'submit'},'Sign in')))}
function setup(){let nm,cl;app.replaceChildren(el('div',{class:'card login'},el('h1',{},'Welcome'),nm=el('input',{placeholder:'Your name'}),cl=el('select',{},el('option',{value:10},'Class 10'),el('option',{value:12},'Class 12')),
 el('button',{class:'pri',onclick:()=>{if(!nm.value.trim())return;S.profile={name:nm.value.trim(),cls:+cl.value,t:Date.now()};save();start()}},'Start')))}
async function start(){if(!S.profile)return setup();
 try{DATA=await(await fetch('data/syllabus/class'+S.profile.cls+'.json')).json();DEF=await(await fetch('data/exams/default-dates.json')).json();FORM={};TIPS={};await Promise.all(DATA.subjects.map(async s=>{try{const r=await fetch('data/formulas/'+s.id+'.json');if(r.ok){const j=await r.json();FORM[s.id]={};j.chapters.forEach(c=>FORM[s.id][c.id]=c.formulas)}}catch(e){}try{const r=await fetch('data/tips/'+s.id+'.json');if(r.ok)TIPS[s.id]=await r.json()}catch(e){}}))}catch(e){app.textContent='Could not load data.';return}render()}
auth.onAuthStateChanged(async u=>{if(!u){uid=null;DATA=null;return login()}
 uid=u.uid;try{S=JSON.parse(localStorage.getItem('st_'+uid))||{}}catch(e){S={}}
 if(!S.profile)await sync();await start();sync()});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
