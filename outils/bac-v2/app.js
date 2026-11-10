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
