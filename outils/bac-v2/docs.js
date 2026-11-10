/* ======================================================================
   v2 · documents façon sujet de bac et correction détaillée
   Les questions « v2 » portent leurs données dans des documents numérotés (Figure 1, Figure 2…), comme à l'écrit :
   l'énoncé ne redonne pas les valeurs, l'élève les relève. Champs en plus sur une question :
     don   : résumé des données en texte simple (pour le suivi du professeur et les signalements)
     lire  : où se trouvent les données utiles (affiché dans la correction)
     met   : la méthode, en étapes (tableau de chaînes HTML)
     piege : l'erreur fréquente          ret : la relation à retenir
     diag  : [{v, m}] réponses fausses typiques (valeur, message) pour dire à l'élève quelle erreur il a faite
     why   : (choix multiple) pour chaque choix, pourquoi il est faux — fabriqué par mcw()
   Une question sans ces champs s'affiche et se corrige comme avant.
   ====================================================================== */
/* Document numéroté : corps en SVG ou en HTML. */
const DOC=(n,titre,corps)=>`<figure class="doc"><figcaption><b>Figure ${n}</b><span>${titre}</span><button type="button" class="doc-zoom" aria-label="Agrandir la figure ${n}"><span aria-hidden="true">⤢</span> Agrandir</button></figcaption><div class="doc-c">${corps}</div></figure>`;
/* Chaîne de puissance (ou d'information) en blocs.
   o.blocs = [{t:"Moteur", l:["24 V","3 000 tr/min"], q:true si le bloc est à trouver}]
   o.liens = un lien avant chaque bloc et un après le dernier : [haut, bas] (grandeurs d'effort et de flux), ou null */
function d2Chaine(o){
  const lien=l=>l===false?"":`<div class="d2-l">${l&&l[0]?`<span>${l[0]}</span>`:""}<i aria-hidden="true"></i>${l&&l[1]?`<span>${l[1]}</span>`:""}</div>`;
  let h=`<div class="d2-chaine${o.blocs.length>3?" n4":""}">`;
  o.blocs.forEach((b,i)=>{ h+=lien(o.liens[i])+`<div class="d2-b${b.q?" q":""}"><div class="d2-bt">${b.t}</div>${(b.l||[]).map(x=>`<div class="d2-bl">${x}</div>`).join("")}</div>`; });
  return h+lien(o.liens[o.blocs.length])+`</div>`;
}
/* Extrait de diagramme des exigences : o.sys = exigence mère (facultative), o.reqs = [{id, nom, txt, sat}] */
function d2Exig(o){
  const box=(r,c)=>`<div class="d2-req${c||""}"><div class="d2-rh"><i>«requirement»</i><b>${r.nom}</b></div><div class="d2-rb"><div>Id = "${r.id}"</div><div>Text = "${r.txt}"</div></div>${r.sat?`<div class="d2-sat">«satisfy» ${r.sat}</div>`:""}</div>`;
  return `<div class="d2-exig">${o.sys?box(o.sys," top")+`<div class="d2-ref" aria-hidden="true"><i>«refine»</i></div>`:""}<div class="d2-reqs">${o.reqs.map(r=>box(r)).join("")}</div></div>`;
}
/* Diagramme de définition des blocs : o.blocs = [{nom, vals:[…]}] */
function d2Bdd(o){ return `<div class="d2-bdd">${o.blocs.map(b=>`<div class="d2-blk"><div class="d2-rh"><i>«block»</i><b>${b.nom}</b></div><div class="d2-vt">valeurs</div><div class="d2-rb">${b.vals.map(v=>`<div>${v}</div>`).join("")}</div></div>`).join("")}</div>`; }
/* Caractéristiques données par le constructeur : o.titre, o.lignes = [[libellé, valeur]] */
function d2Fiche(o){ return `<table class="d2-fiche">${o.titre?`<caption>${o.titre}</caption>`:""}<tbody>${o.lignes.map(l=>`<tr><th scope="row">${l[0]}</th><td>${l[1]}</td></tr>`).join("")}</tbody></table>`; }
/* Choix multiple avec la raison de chaque mauvaise réponse : wrong = [[texte, pourquoi c'est faux], …] */
function mcw(ok,wrong){ const sh=shuffle([[ok,""],...wrong].map((x,i)=>({c:x[0],w:x[1],i}))); return {ch:sh.map(x=>x.c),ok:sh.findIndex(x=>x.i===0),why:sh.map(x=>x.w)}; }
/* Courbe sur quadrillage (lecture graphique). o.pts = [[x, y], …] reliés par des segments ; o.xm, o.ym = bouts des axes ;
   o.xs, o.ys = pas des graduations ; o.sub = sous-divisions du quadrillage en x ; o.xl, o.yl = légendes des axes.
   Schéma d'allure, sans valeurs : o.xt = [[x, "t1", hauteur], …] et o.yt = [[y, "V", longueur], …] remplacent les graduations. */
function d2Courbe(o){
  const H=o.h||240, x0=52, x1=384, y0=H-42, y1=24, X=x=>x0+(x1-x0)*x/o.xm, Y=y=>y0-(y0-y1)*y/o.ym, P=p=>`${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`;
  let s="";
  if(o.xt){
    o.xt.forEach(t=>{ s+=L(X(t[0]),y0,X(t[0]),Y(t[2]!=null?t[2]:o.ym),"v-dash")+T(X(t[0]),y0+18,t[1],"v-lab s","middle"); });
    (o.yt||[]).forEach(t=>{ s+=L(x0,Y(t[0]),X(t[2]!=null?t[2]:o.xm),Y(t[0]),"v-dash")+T(x0-8,Y(t[0])+4.5,t[1],"v-lab s","end"); });
    s+=T(x0-8,y0+18,"0","v-lab s","end");
  }else{
    const n=o.sub||1;
    for(let k=0;k*o.xs/n<=o.xm+1e-9;k++){ const x=X(k*o.xs/n).toFixed(1), g=k%n===0; s+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" class="v-grid"${g?"":' style="opacity:.55"'}/>`+(g?T(x,y0+18,nf(k*o.xs/n,2),"v-lab s","middle"):""); }
    for(let k=0;k*o.ys<=o.ym+1e-9;k++){ const y=Y(k*o.ys); s+=L(x0,y,x1,y,"v-grid")+T(x0-8,y+4.5,nf(k*o.ys,2),"v-lab s","end"); }
  }
  s+=L(x0,y0,x1+6,y0,"v-ink")+L(x0,y0,x0,y1-10,"v-ink")+T(x1+6,y0+36,o.xl,"v-cap","end")+T(8,y1-10,o.yl,"v-cap","start");
  s+=`<polyline points="${o.pts.map(P).join(" ")}" class="v-curve" style="stroke-linejoin:round;stroke-linecap:round"/>`;
  return svg(H,s,o.label||"Courbe");
}
