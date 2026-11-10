/* ===== v2 · correction détaillée et figures agrandies ===== */
/* Quelle erreur l'élève a-t-il probablement faite ? r = {v: valeur saisie} ou {k: choix} */
function corrDiag(q,r){
  if(!r) return "";
  if(q.type==="ch") return q.why&&r.k!=null&&q.why[r.k]?q.why[r.k]:"";
  const v=r.v; if(!isFinite(v)||!isFinite(q.ans)) return "";
  const est=a=>isFinite(a)&&a!==q.ans&&numOk(Object.assign({},q,{ans:a}),v);
  for(const d of (q.diag||[])) if(est(d.v)) return d.m;
  if(!q.ans||!v) return "";
  const k=v/q.ans, pres=x=>Math.abs(k/x-1)<0.025;
  const G=[[1000,"ta valeur est environ 1 000 fois trop grande : vérifie les unités (mm et m, W et kW, g et kg)."],[0.001,"ta valeur est environ 1 000 fois trop petite : vérifie les unités (mm et m, W et kW, g et kg)."],
    [100,"ta valeur est environ 100 fois trop grande : vérifie les unités (cm et m, % et valeur décimale)."],[0.01,"ta valeur est environ 100 fois trop petite : vérifie les unités (cm et m, % et valeur décimale)."],
    [60,"il y a un facteur 60 : as-tu bien converti les minutes en secondes (tr/min en tr/s) ?"],[1/60,"il y a un facteur 60 : as-tu bien converti les minutes en secondes (tr/min en tr/s) ?"],
    [3.6,"il y a un facteur 3,6 : c'est la conversion entre m/s et km/h (1 m/s = 3,6 km/h)."],[1/3.6,"il y a un facteur 3,6 : c'est la conversion entre m/s et km/h (1 m/s = 3,6 km/h)."],
    [2*Math.PI,"il y a un facteur 2π : un tour vaut 2π radians."],[1/(2*Math.PI),"il y a un facteur 2π : un tour vaut 2π radians."],
    [60/(2*Math.PI),"ta valeur est restée en tr/min : pour passer en rad/s, on multiplie par 2π et on divise par 60."],[2*Math.PI/60,"ta valeur est en rad/s alors qu'on attend des tr/min : on multiplie par 60 et on divise par 2π."]];
  for(const [x,m] of G) if(pres(x)) return m;
  return "";
}
/* Correction affichée après la réponse (et dans les copies corrigées). */
function corrHTML(q,ok,r){
  if(!q.met&&!q.lire&&!q.piege&&!q.ret) return `<p>${q.expl}</p>`;
  const d=ok?"":corrDiag(q,r);
  let h=d?`<p class="cx-dg"><b>Ton erreur, sans doute :</b> ${d}</p>`:"";
  h+=`<div class="cx">`;
  if(q.lire) h+=`<div class="cx-s"><div class="cx-t">Où lire les données</div><p>${q.lire}</p></div>`;
  h+=`<div class="cx-s"><div class="cx-t">Méthode</div>${q.met?`<ol>${q.met.map(m=>`<li>${m}</li>`).join("")}</ol>`:`<p>${q.expl}</p>`}</div>`;
  if(q.piege) h+=`<div class="cx-s cx-pg"><div class="cx-t">Erreur fréquente</div><p>${q.piege}</p></div>`;
  if(q.ret) h+=`<div class="cx-s cx-rt"><div class="cx-t">À retenir</div><p>${q.ret}</p></div>`;
  return h+`</div>`;
}
/* Téléphone : quand une question a plusieurs figures, on en montre une à la fois (onglets), en ouvrant celle que la question cite. */
function d2Tabs(q){
  const fb=app.querySelector(".figbox.docs"); if(!fb||!window.matchMedia) return;
  const docs=[...fb.querySelectorAll(".doc")]; if(docs.length<2||!window.matchMedia("(max-width:900px)").matches) return;
  const m=/figures? (\d)/.exec(String(q.q).replace(/<[^>]+>/g,"")), first=m?Math.max(0,Math.min(docs.length,+m[1])-1):0;
  const bar=document.createElement("div"); bar.className="doc-tabs"; bar.setAttribute("role","tablist"); bar.setAttribute("aria-label","Figures de la question");
  const show=k=>{ docs.forEach((d,i)=>d.classList.toggle("on",i===k)); [...bar.children].forEach((b,i)=>{ b.classList.toggle("on",i===k); b.setAttribute("aria-selected",i===k?"true":"false"); }); };
  docs.forEach((d,i)=>{ const b=document.createElement("button"); b.type="button"; b.setAttribute("role","tab"); b.textContent=`Figure ${i+1}`; b.onclick=()=>show(i); bar.appendChild(b); });
  fb.classList.add("tabs"); fb.insertBefore(bar,fb.firstChild); show(first);
}
/* Agrandir un document (téléphone : la figure passe en grand, on la fait défiler). */
function d2ZoomClose(){ const z=document.querySelector(".zoomdoc"); if(z){ z.remove(); document.documentElement.style.overflow=""; } }
function d2Zoom(doc){
  d2ZoomClose();
  const z=document.createElement("div"); z.className="zoomdoc"; z.setAttribute("role","dialog"); z.setAttribute("aria-modal","true"); z.setAttribute("aria-label","Figure agrandie");
  const cap=doc.querySelector("figcaption");
  z.innerHTML=`<div class="zd-bar"><span><b>${esc(cap.querySelector("b").textContent)}</b> · ${esc(cap.querySelector("span").textContent)}</span><button type="button" class="btn zd-x">Fermer ✕</button></div><div class="zd-in"><div class="zd-doc">${doc.querySelector(".doc-c").innerHTML}</div></div>`;
  document.body.appendChild(z); document.documentElement.style.overflow="hidden";
  z.querySelector(".zd-x").focus();
}
document.addEventListener("click",e=>{
  const t=e.target; if(!t||!t.closest) return;
  const b=t.closest(".doc-zoom"); if(b){ const d=b.closest(".doc"); if(d) d2Zoom(d); return; }
  if(t.closest(".zd-x")) d2ZoomClose();
});
document.addEventListener("keydown",e=>{ if(!document.querySelector(".zoomdoc")) return; if(e.key==="Escape") d2ZoomClose(); if(e.key!=="Tab") e.stopPropagation(); },true);
window.BACSI_V2={numOk:(q,v)=>numOk(q,v),corrDiag,corrHTML};

/* ===== v2 · réponses rédigées =====
   type "trous" : phrase-réponse à compléter. q.phr = ["texte", {o:[choix…], ok:indice, m:"remarque si faux"}, "texte", …]
   type "red"   : rédaction libre, vérifiée par l'IA du site (SIP.ia.corriger, fonction Supabase « corriger ») avec le barème
                  q.elements = [{t, p}] et la réponse modèle q.modele. Sans IA (pas connecté, quota, réseau), l'élève vérifie
                  lui-même sa réponse avec le modèle et coche les éléments présents. Note : complète (≥ 80 % du barème) → 0 ;
                  incomplète (≥ 50 %) → −1 ; sinon −2. Une question "red" garde ses choix (ch, ok) pour le sujet blanc. */
const POIDS_RED={present:1,partiel:.5,absent:0};
const iaDispo=()=>{ try{ return !!(window.SIP&&SIP.ia&&SIP.ia.actif()&&SIP.session.get()); }catch(e){ return false; } };
const brut=h=>String(h==null?"":h).replace(/<span class="sr">[^<]*<\/span>/g,"/").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
function attenduTxt(q){ return q.type==="ch"?q.ch[q.ok]:q.type==="red"?q.modele:q.type==="trous"?q.phr.map(x=>typeof x==="string"?x:`<b>${esc(x.o[x.ok])}</b>`).join(""):shownAns(q); }
function ansV2(q){
  if(q.type==="trous") return `<p class="trous">${q.phr.map((x,i)=>typeof x==="string"?x:`<select class="trou" data-g="${i}" aria-label="Élément manquant"><option value="">choisir…</option>${x.o.map((o,k)=>`<option value="${k}">${esc(o)}</option>`).join("")}</select>`).join("")}</p><div class="num"><button class="btn primary" id="val" type="button">Valider</button></div><div class="warnmsg" id="wm" hidden></div>`;
  return `<textarea id="red" class="red" rows="4" maxlength="700" placeholder="Rédige ta réponse en une ou deux phrases : les valeurs avec leurs unités, la comparaison, la conclusion." aria-label="Ta réponse rédigée"></textarea><div class="num"><button class="btn primary" id="val" type="button">Valider ma réponse</button></div><div class="warnmsg" id="wm" hidden></div><p class="ia-info">${iaDispo()?"Ta réponse est vérifiée par une IA (Claude) à partir du corrigé et du barème du professeur. Elle ne reçoit que la question, le corrigé et ta réponse : ni ton nom, ni ton identifiant.":"Tu vérifieras toi-même ta réponse avec le corrigé (pour la vérification par l'IA, connecte-toi sur le site)."}</p>`;
}
function answerTrous(){
  if(st.answered) return; const q=st.qs[st.i], sel=[...app.querySelectorAll("select.trou")];
  if(sel.some(s=>s.value==="")){ const w=$("#wm"); w.hidden=false; w.textContent="Complète tous les éléments de la phrase avant de valider."; return; }
  let ok=true; const rem=[];
  sel.forEach(s=>{ const g=q.phr[+s.dataset.g], bon=+s.value===g.ok; s.disabled=true; s.classList.add(bon?"ok":"ko"); if(!bon){ ok=false; if(g.m) rem.push(g.m); } });
  $("#val").disabled=true; $("#wm").hidden=true;
  const rep=q.phr.map((x,i)=>typeof x==="string"?brut(x):"["+x.o[+app.querySelector(`select.trou[data-g="${i}"]`).value]+"]").join(" ");
  feedback(ok,attenduTxt(q),rep,{tete:ok?"Phrase exacte":"Phrase à corriger · −2 points",sansAttendu:true,avant:ok?"":`<p class="cx-mod"><b>Phrase attendue :</b> ${attenduTxt(q)}</p>${rem.length?`<p class="cx-dg"><b>À corriger :</b> ${rem.join(" ")}</p>`:""}`});
}
const redQuestion=q=>[brut(q.ctx0),brut(q.ctx),brut(q.q),q.don?"Données des documents : "+q.don:"",q.iaPlus||""].filter(Boolean).join("\n").slice(0,1800);
function redFin(q,rep,v,conseil,par){
  const tot=q.elements.reduce((a,e)=>a+(e.p||1),0), pts=q.elements.reduce((a,e,i)=>a+POIDS_RED[v[i].verdict]*(e.p||1),0), r=tot?pts/tot:0;
  const ok=r>=.8, pen=ok?0:r>=.5?1:2, MOT={present:"présent",partiel:"en partie",absent:"absent"};
  const lignes=q.elements.map((e,i)=>`<li class="${v[i].verdict}"><span class="pic" title="${MOT[v[i].verdict]}">${v[i].verdict==="present"?"✓":v[i].verdict==="partiel"?"≈":"✗"}</span><span>${e.t}<small>${MOT[v[i].verdict]}${v[i].raison?" : "+esc(v[i].raison):""}</small></span></li>`).join("");
  feedback(ok,q.modele,`[${par==="eleve"?"vérifiée par l'élève":"vérifiée par l'IA"} : ${nf(pts)}/${tot}] ${rep}`,{pen,cls:ok?"ok":pen===1?"mi":"ko",tete:ok?"Réponse complète":pen===1?"Réponse incomplète · −1 point":"Réponse insuffisante · −2 points",sansAttendu:true,
    avant:`<ul class="els">${lignes}</ul>${conseil?`<p class="cx-dg"><b>Pour progresser :</b> ${esc(conseil)}</p>`:""}<p class="cx-mod"><b>Une réponse complète :</b> ${q.modele}</p>${par==="eleve"?`<p class="ia-info">Tu as vérifié ta réponse toi-même.</p>`:""}`});
}
function redAuto(q,rep,msg){
  st.attente=false;
  $("#fb").innerHTML=`<div class="fb auto">${msg?`<p class="warnmsg">${esc(msg)}</p>`:""}<span class="t">Vérifie ta réponse</span><p>Une réponse complète :</p><blockquote class="modele">${q.modele}</blockquote><p>Coche ce que ta réponse contient vraiment :</p>${q.elements.map((e,i)=>`<label class="chk"><input type="checkbox" data-e="${i}"><span>${e.t}</span></label>`).join("")}<div class="num"><button class="btn primary" id="auto-ok" type="button">Valider ma vérification</button></div></div>`;
  $("#auto-ok").onclick=()=>{ const v={}; q.elements.forEach((e,i)=>{ v[i]={verdict:app.querySelector(`input[data-e="${i}"]`).checked?"present":"absent",raison:""}; }); redFin(q,rep,v,"","eleve"); };
}
const RED_ERR={QUOTA:"Tu as atteint le nombre de vérifications par l'IA pour aujourd'hui.",IA_RESEAU:"L'IA n'a pas répondu (réseau ?).",SESSION_EXPIREE:"Ta session a expiré : reconnecte-toi sur le site pour la vérification par l'IA."};
async function answerRed(){
  if(st.answered||st.attente) return; const q=st.qs[st.i], ta=$("#red"), rep=ta.value.trim();
  if(rep.replace(/\s+/g," ").length<20){ const w=$("#wm"); w.hidden=false; w.textContent="Rédige une phrase complète : les valeurs, la comparaison, la conclusion."; return; }
  ta.disabled=true; $("#val").disabled=true; $("#wm").hidden=true;
  if(!iaDispo()) return redAuto(q,rep,"");
  st.attente=true; $("#fb").innerHTML=`<div class="fb att" role="status">Vérification de ta réponse par l'IA…</div>`;
  const ici=st, k=st.i;
  try{
    const d=await SIP.ia.corriger({question:redQuestion(q),corrige:brut(q.modele)+" "+brut(q.expl),elements:q.elements.map((e,i)=>({i,t:brut(e.t),p:e.p||1})),reponse:rep.slice(0,2000)});
    if(st!==ici||st.i!==k) return;
    const v={}; (d.elements||[]).forEach(x=>{ if(q.elements[x.i]&&POIDS_RED[x.verdict]!=null) v[x.i]={verdict:x.verdict,raison:x.raison||""}; });
    st.attente=false;
    if(Object.keys(v).length<q.elements.length) return redAuto(q,rep,"L'IA n'a pas jugé tous les points : vérifie ta réponse toi-même.");
    redFin(q,rep,v,d.conseil||"","ia");
  }catch(e){ if(st!==ici||st.i!==k) return; redAuto(q,rep,(RED_ERR[e&&e.code]||"L'IA n'a pas pu vérifier ta réponse.")+" Vérifie-la toi-même avec le corrigé."); }
}

/* ===== v2 · la difficulté suit le niveau de l'élève, le 20 se mérite =====
   - Série renforcée : si l'élève maîtrise déjà la notion (maîtrise ≥ 80 %), sa série a moins de questions de niveau 1
     et deux études de niveau 3 au lieu d'une.
   - Étude finale : après un sans-faute, une étude de niveau 3 de plus s'ajoute ; il faut la réussir pour garder 20.
   Seulement pour les notions réécrites (POOLS[clé].v2), en série (pas en préparation de DS ni en parcours). */
const SERIE_FORTE={1:2,2:4,3:8};
function meriteDispo(){
  if(!st||st.mode!=="s"||st.prep||st.merite||st.note<20) return null;
  const key=st.S&&st.S.key, P=key&&POOLS[key]; if(!P||!P.v2) return null;
  const pris=new Set(st.qs.filter(q=>q.lv===3).map(q=>q.gi)), libres=[...Array(P[3].length).keys()].filter(i=>!pris.has(i));
  return libres.length?{key,libres}:null;
}
function merite(){
  const m=meriteDispo(); if(!m) return false;
  const arr=genGroup(m.key,3,m.libres[Math.floor(Math.random()*m.libres.length)]); arr.forEach(q=>{ q.merite=true; });
  st.merite=true; st.qs.push(...arr); return true;
}
function banniereV2(q){
  if(q.merite&&q.gj===0) return `<div class="ctx merite"><b>Sans-faute jusqu'ici.</b> Une dernière étude, plus exigeante : réussis-la pour garder ton 20.</div>`;
  if(st.fort&&st.i===0) return `<div class="ctx merite"><b>Série renforcée.</b> Tu maîtrises les bases de cette notion : moins de questions simples, deux études complètes.</div>`;
  return "";
}
