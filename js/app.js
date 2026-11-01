const HEADRE=/^(professional\s+summary|career\s+objective|summary|objective|profile|about\s+me|technical\s+skills|key\s+skills|core\s+skills|skills|work\s+experience|professional\s+experience|experience|employment(?:\s+history)?|educational\s+qualifications?|education|academic\s+(?:qualifications?|details)|projects?|certifications?|languages?(?:\s+known)?|awards?(?:\s+and\s+achievements)?|achievements|personal\s+(?:profile|details)|declaration)$/i;
function parseResume(text){
  const raw=String(text||'').replace(/\r/g,'');
  const L=raw.split(/\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const norm=s=>String(s||'').replace(/[:\-–]\s*$/,'').trim().toLowerCase();
  const email=(raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[''])[0];
  const phone=(raw.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|\+?\d[\d\s().-]{8,}\d/)||[''])[0].trim();
  const link=(raw.match(/(?:https?:\/\/|www\.|linkedin\.com|github\.com)\S+/i)||[''])[0];
  const heading=l=>HEADRE.test(norm(l));
  const sections=[];let cur=null;
  L.forEach(l=>{
    if(heading(l)){cur={key:norm(l),lines:[]};sections.push(cur)}
    else if(cur)cur.lines.push(l.replace(/^[-•●▪■*✓✔]\s*/,'').trim());
  });
  const get=re=>{const x=sections.find(z=>re.test(z.key));return x?x.lines:[]};
  const label=names=>{
    const re=new RegExp('^(?:'+names.join('|')+')\\s*[:\\-]?\\s*(.*)$','i');
    for(const l of L){const m=l.match(re);if(m&&m[1])return m[1].trim();}
    return '';
  };
  const header=L.slice(0,10);
  let name=header.find(l=>!/@/.test(l)&&!/^\+?\d[\d\s().-]{8,}$/.test(l)&&!heading(l)&&!/resume|curriculum vitae/i.test(l)&&l.split(/\s+/).length<=4&&/^[A-Za-z][A-Za-z .'-]+$/.test(l))||'';
  if(name&&name===name.toUpperCase())name=name.toLowerCase().replace(/\b[a-z]/g,m=>m.toUpperCase());
  const ni=header.indexOf(name);
  const role=ni>=0?(header.slice(ni+1).find(l=>l!==name&&!/@/.test(l)&&!/^\+?\d[\d\s().-]{8,}$/.test(l)&&l.length<65&&/^[A-Za-z &/,().-]+$/.test(l))||''):'';
  const summary=get(/^(professional summary|career objective|summary|objective|profile|about me)$/).join(' ').slice(0,900);
  const skillLines=get(/skill/).map(x=>x.replace(/^[v✓✔☑\s]+/,'').trim()).filter(Boolean);
  const skills=skillLines.join(', ').replace(/[,;]\s*[,;]/g,',').slice(0,700);
  const exp=get(/experience|employment/);
  const eduLines=get(/education|qualification|academic/);
  const education=[];
  const yearRe=/(?:19|20)\d{2}(?:\s*[-–/]\s*(?:(?:19|20)\d{2}|present))?/i;
  eduLines.forEach(line=>{
    if(/qualification|institution|university|board|marks/i.test(line)&&!yearRe.test(line))return;
    let cells=line.split(/\t+|\s{2,}|\s*\|\s*/).map(x=>x.trim()).filter(Boolean);
    if(cells.length<2)cells=line.split(/\s{2,}/).filter(Boolean);
    if(cells.length>=2){
      const yr=cells.find(x=>yearRe.test(x))||'';
      const mk=cells.find(x=>x!==yr&&/%|cgpa|gpa|\/\s*\d/i.test(x))||'';
      education.push({degree:cells[0]||'',school:cells[1]||'',board:cells[2]||'',start:'',end:(yr.match(yearRe)||[])[0]||'',marks:mk});
    }
  });
  const profile={father:label(["father'?s name","father name"]),dob:label(['date of birth','dob']),languages:label(['languages known','languages']),gender:label(['sex','gender']),marital:label(['marital status']),nationality:label(['nationality']),strengths:label(['strengths','strength'])};
  get(/personal profile|personal details/).forEach(l=>{
    const m=l.match(/^([^:]+)\s*:\s*(.+)$/);if(!m)return;
    const k=norm(m[1]),v=m[2].trim();
    if(/father/.test(k))profile.father=profile.father||v;
    else if(/dob|birth/.test(k))profile.dob=profile.dob||v;
    else if(/language/.test(k))profile.languages=profile.languages||v;
    else if(/sex|gender/.test(k))profile.gender=profile.gender||v;
    else if(/marital/.test(k))profile.marital=profile.marital||v;
    else if(/nationality/.test(k))profile.nationality=profile.nationality||v;
    else if(/strength/.test(k))profile.strengths=profile.strengths||v;
  });
  const declLines=get(/^declaration$/);
  const declText=declLines.filter(x=>!/^(place|date|signature)\s*:/i.test(x)).join(' ');
  const hasFresher=/career objective|personal profile|declaration|father'?s name/i.test(raw);
  return {name,role,email,phone,link,location:label(['address','residential address','location']),text:raw,summary,skills,exp,education,profile,
    decl:{text:declText,place:label(['place']),date:label(['date'])},hasFresher};
}
function importInto(r,P){
  const p=r.personal;
  ['name','role','email','phone','link','location'].forEach(k=>{if(P[k])p[k]=P[k]});
  if(P.summary)r.summary=P.summary;
  if(P.skills)r.skills=P.skills;
  if(P.exp&&P.exp.length&&r.experience.every(e=>!e.role&&!e.company&&!e.desc))r.experience=[{role:'',company:'',start:'',end:'',desc:P.exp.join('\n')}];
  if(P.education&&P.education.length)r.education=P.education;
  if(P.profile)Object.keys(P.profile).forEach(k=>{if(P.profile[k])r.profile[k]=P.profile[k]});
  if(P.decl){if(P.decl.text)r.decl.text=P.decl.text;if(P.decl.place)r.decl.place=P.decl.place;if(P.decl.date)r.decl.date=P.decl.date;}
  if(P.hasFresher)r.theme=mkTheme('fresher');
  if(P.name&&/^Untitled/.test(r.title))r.title=P.name+(r.type==='cv'?' CV':' resume');
}
