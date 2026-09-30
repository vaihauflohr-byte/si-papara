/* Réservoirs : diagrammes d'états et de séquence (ana-comportement) · logique booléenne (info-logique) · optique, photon (phy-optique).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_cmp_, fx_log_ et fx_opt_. */
(function(){
"use strict";

/* ===== outils locaux ===== */
/* affichage à 3 chiffres significatifs, identique au contrôle de la page */
const S3=x=>{ const v=Number.isInteger(x)?x:Math.abs(x)>=100?Math.round(x):Number(x.toPrecision(3)); return v.toLocaleString("fr-FR",{maximumFractionDigits:6}); };
const U=(x,u)=>F(`${S3(x)}${u?" "+u:""}`);
/* tirage avec condition (évite les conclusions à la limite) */
const draw=(gen,ok)=>{ for(let i=0;i<20000;i++){ const v=gen(); if(ok(v)) return v; } throw new Error("tirage impossible"); };
const far=(x,ref,r)=>Math.abs(x-ref)/Math.abs(ref)>=(r||0.05);
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const YN=["Oui","Non"];
const OL=st=>`<ol style="margin:0;padding-left:1.4em">${st.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const lst=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" et "+a[a.length-1];
const B=t=>`<b>${t}</b>`;
/* réponse mise en valeur : F (insécable) si elle est courte, gras sinon */
const HL=t=>String(t).replace(/<[^>]*>/g,"").length>40?`<b>${t}</b>`:F(t);
/* échappement minimal : « > » reste lisible (et distinct de « < » une fois les balises retirées) */
const ce=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
/* choix mélangés, distracteurs dédoublonnés (au plus n) */
function mcx(ok,wrong,n){ const seen=new Set([String(ok).replace(/<[^>]+>/g,"")]), w=[]; for(const x of wrong){ if(x==null) continue; const k=String(x).replace(/<[^>]+>/g,""); if(!seen.has(k)){ seen.add(k); w.push(x); } if(w.length>=(n||3)) break; } return mc(ok,w); }
/* puissances de dix avec le vrai signe moins */
const p10=k=>`10<sup>${k<0?"−":""}${Math.abs(k)}</sup>`;
/* écriture a × 10ⁿ (d décimales sur la mantisse) */
const sci=(x,d)=>{ d=d==null?2:d; let e=Math.floor(Math.log10(Math.abs(x))), m=Number((x/10**e).toFixed(d)); if(Math.abs(m)>=10){ m=Number((m/10).toFixed(d)); e++; } return `${nf(m,d)} × ${p10(e)}`; };
/* barre de complément (NON) : bordure haute d'un bloc en ligne, pour que les barres imbriquées restent distinctes ; texte masqué « non( … ) » pour la lecture vocale */
const SRH="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
const ov=t=>`<span style="display:inline-block;border-top:1.3px solid currentColor;padding-top:1px;line-height:1.05"><span style="${SRH}">non(</span>${t}<span style="${SRH}">)</span></span>`;
/* texte avec un liseré couleur papier (lisible par-dessus un trait) */
const Th=(x,y,t,c,a,rot)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}"${rot?` transform="rotate(${rot.toFixed(1)} ${(+x).toFixed(1)} ${(+y).toFixed(1)})"`:""} style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
const arrowL=(pts,cls,dash)=>`<polyline points="${pts.map(P2).join(" ")}" class="${cls||"v-ink"}"${dash?' style="stroke-dasharray:5 4"':""} marker-end="url(#m-k)"/>`;

/* ======================================================================
   FIGURES : DIAGRAMMES D'ÉTATS ET DE SÉQUENCE (préfixe fx_cmp_)
   ====================================================================== */
/* un état : {n: nom, x, y, w, a: [actions internes « entry / … », « do / … », « exit / … »]} ; la hauteur dépend du nombre d'actions */
const stH=s=>s.a&&s.a.length?30+12*s.a.length:34;
const stAnc=(s,sd,k)=>{ const h=stH(s); k=k||0; return sd==="r"?[s.x+s.w,s.y+h/2+k*h/2]:sd==="l"?[s.x,s.y+h/2+k*h/2]:sd==="t"?[s.x+s.w/2+k*s.w/2,s.y]:[s.x+s.w/2+k*s.w/2,s.y+h]; };
function fx_cmp_etat(s,hl,q){
  const h=stH(s), st=hl?' style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2"':"";
  let r=`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${h}" rx="11" class="${q?"v-boxq":"v-box"}"${q?"":st}/>`;
  const nm=q?"?":esc(s.n), cl=q?"v-lab c":"v-smb";
  if(s.a&&s.a.length){ r+=T(s.x+s.w/2,s.y+17,nm,cl,"middle")+L(s.x,s.y+24,s.x+s.w,s.y+24,"v-thin"); s.a.forEach((a,i)=>{ r+=T(s.x+7,s.y+37+12*i,esc(a),"v-sm"); }); }
  else r+=T(s.x+s.w/2,s.y+h/2+4,nm,cl,"middle");
  return r;
}
/* libellé d'une transition : événement [garde] / effet */
const trLab=t=>t.ev+(t.g?` [${t.g}]`:"")+(t.ef?` / ${t.ef}`:"");
/* diagramme d'états d'une machine M (M.S : états, M.T : transitions avec leur tracé, M.ini : pseudo-état initial) ;
   o.num : numéros à la place des libellés ; o.hl : état mis en évidence ; o.q : état dont le nom est caché ; o.hide : transitions dont le libellé est « ? » ; o.cap : légende */
function fx_cmp_stm(M,o){
  o=o||{}; let s="";
  Object.keys(M.S).forEach(k=>{ s+=fx_cmp_etat(M.S[k],o.hl===k,o.q===k); });
  const ip=M.ini; s+=`<circle cx="${ip.p[0]}" cy="${ip.p[1]}" r="6" class="v-pt"/>`+arrowL([ip.p,ip.B]);
  M.T.forEach((t,i)=>{
    const A=t.A, Bp=t.B; let path, mid, ang=0;
    if(t.self){ const h=t.self; path=`M${P2(A)} C${P2([A[0]+(h[0]||0),A[1]+(h[1]||0)])} ${P2([Bp[0]+(h[2]||0),Bp[1]+(h[3]||0)])} ${P2(Bp)}`; }
    else if(t.c) path=`M${P2(A)} Q${P2(t.c)} ${P2(Bp)}`;
    else path=`M${P2(A)} `+(t.via||[]).map(p=>`L${P2(p)} `).join("")+`L${P2(Bp)}`;
    s+=`<path d="${path}" class="v-ink" style="stroke-width:1.4" marker-end="url(#m-k)"/>`;
    let lp=t.lp, la=t.la||"middle";
    if(t.rot){ const dx=Bp[0]-A[0], dy=Bp[1]-A[1], ln=Math.hypot(dx,dy); let nx=dy/ln, ny=-dx/ln; if(ny>0){ nx=-nx; ny=-ny; } const off=t.off||6;
      mid=[(A[0]+Bp[0])/2+nx*off+(t.sh||0)*dx/ln,(A[1]+Bp[1])/2+ny*off+(t.sh||0)*dy/ln]; ang=deg(Math.atan2(dy,dx)); if(ang>90) ang-=180; if(ang<-90) ang+=180; lp=mid; la="middle"; }
    if(o.num) s+=numLab(lp[0],lp[1]-4,String(i+1));
    else if(o.hide&&o.hide.includes(i)) s+=Th(lp[0],lp[1],"?","v-lab c",la,ang);
    else { const ls=t.lw||[trLab(t)]; ls.forEach((x,j)=>{ s+=Th(lp[0],lp[1]+12*j,esc(x),"v-sm",la,ang); }); }
  });
  let H=M.H;
  if(o.cap){ s+=T(200,H+8,esc(o.cap),"v-cap","middle"); H+=16; }
  return svg(H,s,o.alt||`Diagramme d'états : ${M.nom}`);
}

/* diagramme de séquence : o.ll = noms des lignes de vie (2 à 4) ; o.m = messages [{f, t, l, r (retour, en pointillés)}] dans l'ordre chronologique ;
   o.fr = fragments [{k: "loop"|"alt"|"opt", g: garde, a, b (premier et dernier message du bloc), e (premier message de la branche [else]), g2}] ;
   o.num : messages numérotés ; o.hide : indice du message dont le libellé est « ? » */
function fx_cmp_sd(o){
  const n=o.ll.length, xs=n===2?[100,300]:n===3?[70,200,330]:[52,151,250,349], hw=n===4?46:58;
  const ys=[], frT={}, frB={}, sepY={}; let y=64;
  o.m.forEach((m,i)=>{
    (o.fr||[]).forEach((f,j)=>{ if(f.a===i){ y+=30; frT[j]=y-30; } if(f.e===i){ y+=28; sepY[j]=y-31; } });
    ys[i]=y; y+=(m.f===m.t?34:26);
    (o.fr||[]).forEach((f,j)=>{ if(f.b===i){ frB[j]=y-12; y+=8; } });
  });
  const yEnd=y+2;
  let s="";
  o.ll.forEach((nm,i)=>{ const lines=wrapTxt(nm,n===4?13:16), h=lines.length>1?34:26;
    s+=`<rect x="${(xs[i]-hw).toFixed(1)}" y="6" width="${2*hw}" height="${h}" rx="2" class="v-box"/>`+multi(xs[i],6+h/2-(lines.length-1)*6.5+4,lines,"v-smb","middle");
    s+=L(xs[i],6+h,xs[i],yEnd,"v-dash"); });
  (o.fr||[]).forEach((f,j)=>{
    const ids=[]; for(let i=f.a;i<=f.b;i++) ids.push(o.m[i].f,o.m[i].t);
    const depth=(o.fr||[]).filter((g,k)=>k!==j&&g.a<=f.a&&g.b>=f.b&&(g.a<f.a||g.b>f.b)).length;
    const x1=Math.max(4,Math.min(...ids.map(k=>xs[k]))-(n===4?40:48))+depth*8, x2=Math.min(396,Math.max(...ids.map(k=>xs[k]))+(n===4?40:52))-depth*8;
    const kw=f.k.length*7+14;
    s+=`<rect x="${x1.toFixed(1)}" y="${frT[j]}" width="${(x2-x1).toFixed(1)}" height="${frB[j]-frT[j]}" class="v-thin" style="fill:none"/>`;
    s+=`<path d="M${x1.toFixed(1)} ${frT[j]} h${kw} v10 l-6 6 h${-(kw-6)} z" class="v-box"/>`+T(x1+5,frT[j]+12,f.k,"v-smb");
    s+=Th(x1+kw+6,frT[j]+12,esc(f.g),"v-sm");
    if(f.e!=null){ s+=`<line x1="${x1.toFixed(1)}" y1="${sepY[j]}" x2="${x2.toFixed(1)}" y2="${sepY[j]}" class="v-thin" style="stroke-dasharray:6 4"/>`+Th(x1+6,sepY[j]+12,esc(f.g2||"[else]"),"v-sm"); }
  });
  o.m.forEach((m,i)=>{
    const yy=ys[i], lb=o.hide===i?"?":(o.num?`${i+1} : `:"")+esc(m.l), cl=o.hide===i?"v-lab c":"v-sm";
    if(m.f===m.t){ const x=xs[m.f];
      s+=`<path d="M${x} ${yy} h26 v14 h-24" class="v-ink" style="stroke-width:1.3" marker-end="url(#m-k)"/>`+Th(x+32,yy+11,lb,cl,"start"); }
    else { const x1=xs[m.f], x2=xs[m.t], d=x2>x1?1:-1;
      s+=`<line x1="${x1}" y1="${yy}" x2="${x2-d*1.5}" y2="${yy}" class="${m.r?"v-thin":"v-ink"}" style="stroke-width:${m.r?1.2:1.4}${m.r?";stroke-dasharray:5 4":""}" marker-end="url(#m-k)"/>`;
      s+=Th((x1+x2)/2,yy-5,lb,cl,"middle"); }
  });
  return svg(yEnd+6,s,o.alt||"Diagramme de séquence");
}

/* ======================================================================
   DIAGRAMMES D'ÉTATS ET DE SÉQUENCE (ana-comportement)
   ====================================================================== */
/* machines d'états, tracées à la main (viewBox 400 de large).
   Transition : f → t, ev (événement), g (garde), ef (effet), d (durée d'un after, en s), py (nom de l'événement dans un programme Python), wd (texte d'un when dans une suite d'événements).
   Tracé : A, B (extrémités), via (points intermédiaires), c (point de contrôle d'une courbe), self (boucle), lp / la (position du libellé), rot (libellé le long du trait). */
function M_portail(){
  const tp=rnd([20,30,40,45,60]);
  const S={F:{n:"Fermé",x:16,y:46,w:132},
    Ov:{n:"Ouverture",x:256,y:36,w:132,a:["entry / moteur_ouvrir","exit / arrêter_moteur"]},
    O:{n:"Ouvert",x:256,y:176,w:132},
    Fe:{n:"Fermeture",x:16,y:166,w:132,a:["entry / moteur_fermer","exit / arrêter_moteur"]}};
  const T=[{f:"F",t:"Ov",ev:"bip",A:[148,63],B:[256,63],lp:[202,57]},
    {f:"Ov",t:"O",ev:"fdc_ouvert",A:[322,90],B:[322,176],lp:[330,137],la:"start"},
    {f:"O",t:"Fe",ev:`after(${tp} s)`,d:tp,py:"fin_tempo",A:[256,193],B:[148,193],lp:[202,187]},
    {f:"Fe",t:"F",ev:"fdc_fermé",A:[82,166],B:[82,80],lp:[74,127],la:"end"},
    {f:"Fe",t:"Ov",ev:"obstacle",ef:"bip_sonore",A:[136,166],B:[272,90],rot:true}];
  return {id:"portail",nom:"portail automatique",le:"le portail",du:"du portail",init:"F",S,T,ini:{p:[82,16],B:[82,46]},H:226,tp,
    EV:[{k:"bip"},{k:"fdc_ouvert"},{k:"fdc_fermé"},{k:"obstacle"}]};
}
function M_alarme(){
  const tp=rnd([15,20,30,45]);
  const S={D:{n:"Désarmée",x:12,y:44,w:124},
    A:{n:"Armée",x:264,y:40,w:124,a:["do / surveiller"]},
    P:{n:"Pré-alarme",x:264,y:178,w:124,a:["do / biper"]},
    Si:{n:"Sirène",x:12,y:172,w:124,a:["entry / sirène_on","exit / sirène_off"]}};
  const T=[{f:"D",t:"A",ev:"code_ok",A:[136,53],B:[264,53],lp:[200,47]},
    {f:"A",t:"D",ev:"code_ok",A:[264,70],B:[136,70],lp:[200,84]},
    {f:"A",t:"P",ev:"détection",A:[326,82],B:[326,178],lp:[334,134],la:"start"},
    {f:"P",t:"Si",ev:`after(${tp} s)`,d:tp,py:"fin_tempo",A:[264,199],B:[136,199],lp:[200,193]},
    {f:"P",t:"D",ev:"code_ok",A:[282,178],B:[118,78],rot:true,sh:-18},
    {f:"Si",t:"D",ev:"code_ok",A:[74,172],B:[74,78],lp:[66,128],la:"end"}];
  return {id:"alarme",nom:"alarme",le:"l'alarme",du:"de l'alarme",init:"D",S,T,ini:{p:[74,16],B:[74,44]},H:232,tp,
    EV:[{k:"code_ok"},{k:"détection"}]};
}
/* o.to : temporisation d'inactivité (remplace l'annulation par le client) */
function M_distrib(o){
  o=o||{};
  const S={A:{n:"Attente",x:12,y:92,w:90},
    P:{n:"Paiement",x:200,y:86,w:140,a:["entry / afficher_crédit"]},
    Pr:{n:"Préparation",x:240,y:166,w:150,a:["entry / chauffer_eau","do / verser","exit / rendre_monnaie"]}};
  const T=[{f:"A",t:"P",ev:"pièce",ef:"créditer",A:[102,100],B:[200,100],lp:[151,94]},
    {f:"P",t:"P",ev:"pièce",ef:"créditer",A:[248,86],B:[290,86],self:[-18,-40,18,-40],lp:[269,52]},
    o.to?{f:"P",t:"A",ev:`after(${o.to} s)`,ef:"rembourser",d:o.to,A:[200,118],B:[102,118],lp:[151,139]}
        :{f:"P",t:"A",ev:"annuler",ef:"rembourser",A:[200,118],B:[102,118],lp:[151,139]},
    {f:"P",t:"Pr",ev:"choix",g:"crédit ≥ prix",A:[300,128],B:[300,166],lp:[293,151],la:"end"},
    {f:"Pr",t:"A",ev:"after(20 s)",d:20,A:[240,199],via:[[57,199]],B:[57,126],lp:[150,193]}];
  return {id:"distrib",nom:"distributeur de boissons",le:"le distributeur",du:"du distributeur",init:"A",S,T,ini:{p:[57,60],B:[57,92]},H:238,to:o.to,
    EV:[{k:"pièce"},{k:"annuler"}]};
}
function M_cafe(){
  const tc=rnd([20,25,30]);
  const S={Ve:{n:"Veille",x:12,y:44,w:110},
    C:{n:"Chauffe",x:270,y:40,w:118,a:["do / chauffer"]},
    Pt:{n:"Prêt",x:270,y:176,w:118,a:["entry / voyant_vert"]},
    Pp:{n:"Préparation",x:12,y:170,w:132,a:["entry / pompe_on","exit / pompe_off"]}};
  const T=[{f:"Ve",t:"C",ev:"marche",A:[122,61],B:[270,61],lp:[196,55]},
    {f:"C",t:"Pt",ev:"when(T ≥ 90 °C)",wd:"l'eau atteint 90 °C",py:"eau_chaude",A:[329,82],B:[329,176],lp:[321,133],la:"end"},
    {f:"Pt",t:"Pp",ev:"café",A:[270,190],B:[144,190],lp:[207,184]},
    {f:"Pp",t:"Pt",ev:`after(${tc} s)`,d:tc,py:"fin_tempo",A:[144,208],B:[270,208],lp:[207,222]},
    {f:"Pt",t:"Ve",ev:"arrêt",A:[284,176],B:[108,78],rot:true,sh:-20}];
  return {id:"cafe",nom:"machine à café",le:"la machine",du:"de la machine à café",init:"Ve",S,T,ini:{p:[67,16],B:[67,44]},H:232,tc,
    EV:[{k:"marche"},{k:"café"},{k:"arrêt"}]};
}
function M_pompe(){
  const hs=rnd([30,35,40,45]), dur=rnd([10,15,20,25,30]), nv=rnd([10,15,20]);
  const S={Ve:{n:"Veille",x:10,y:58,w:100},
    Ar:{n:"Arrosage",x:236,y:40,w:152,a:["entry / ouvrir_vanne","do / pomper","exit / fermer_vanne"]},
    D:{n:"Défaut",x:236,y:170,w:152,a:["entry / alarme"]}};
  const T=[{f:"Ve",t:"Ar",ev:"départ",g:`H < ${hs} %`,A:[110,66],B:[236,66],lp:[173,60]},
    {f:"Ar",t:"Ve",ev:`after(${dur} min)`,d:dur*60,A:[236,84],B:[110,84],lp:[173,99]},
    {f:"Ar",t:"D",ev:`when(niveau < ${nv} %)`,A:[312,106],B:[312,170],lp:[305,142],la:"end"},
    {f:"D",t:"Ve",ev:"acquitter",A:[236,191],via:[[60,191]],B:[60,92],lp:[150,185]}];
  return {id:"pompe",nom:"pompe d'arrosage",le:"la pompe",du:"de la pompe d'arrosage",init:"Ve",S,T,ini:{p:[60,26],B:[60,58]},H:218,hs,dur,nv,
    EV:[{k:"départ"},{k:"acquitter"}]};
}
/* o.dh : écart imposé entre les deux seuils de la ventilation */
function M_serre(o){
  o=o||{};
  const th=rnd([26,27,28,29,30]), dh=o.dh||rnd([2,3]), tb=rnd([10,12,14]), db=rnd([2,3]);
  const S={C:{n:"Chauffage",x:6,y:100,w:110,a:["do / chauffer"]},
    R:{n:"Repos",x:150,y:104,w:100},
    V:{n:"Ventilation",x:276,y:88,w:120,a:["entry / ouvrir_toit","do / ventiler","exit / fermer_toit"]}};
  const T=[{f:"R",t:"V",ev:`when(T > ${th} °C)`,A:[236,104],c:[262,46],B:[300,88],lp:[266,64]},
    {f:"V",t:"R",ev:`when(T < ${th-dh} °C)`,A:[300,154],c:[262,198],B:[236,138],lp:[266,188]},
    {f:"R",t:"C",ev:`when(T < ${tb} °C)`,A:[164,104],c:[138,50],B:[95,100],lp:[134,67]},
    {f:"C",t:"R",ev:`when(T > ${tb+db} °C)`,A:[95,142],c:[138,194],B:[164,138],lp:[134,184]}];
  return {id:"serre",nom:"serre connectée",le:"la serre",du:"de la serre",init:"R",S,T,ini:{p:[200,70],B:[200,104]},H:196,th,dh,tb,db};
}
function M_feu(){
  const v=rnd([20,25,30,35,40]), o=rnd([3,4,5]), r=rnd([20,25,30,35]);
  const S={R:{n:"Rouge",x:12,y:36,w:134,a:["entry / allumer_rouge"]},
    V:{n:"Vert",x:254,y:36,w:134,a:["entry / allumer_vert"]},
    O:{n:"Orange",x:133,y:168,w:134,a:["entry / allumer_orange"]}};
  const T=[{f:"R",t:"V",ev:`after(${r} s)`,d:r,A:[146,57],B:[254,57],lp:[200,51]},
    {f:"V",t:"O",ev:`after(${v} s)`,d:v,A:[306,78],B:[240,168],rot:true},
    {f:"O",t:"R",ev:`after(${o} s)`,d:o,A:[160,168],B:[94,78],rot:true}];
  return {id:"feu",nom:"feu tricolore",le:"le feu",du:"du feu",init:"R",S,T,ini:{p:[79,10],B:[79,36]},H:216,v,o,r};
}
const nomE=(M,k)=>M.S[k].n;
const etats=M=>Object.keys(M.S).map(k=>M.S[k].n);
/* suite d'événements : e = {k: événement, txt} ou {w: attente en s} ; les after(d) se déclenchent pendant les attentes */
function run(M,seq,s0){
  let s=s0||M.init; const pas=[];
  seq.forEach(e=>{
    const de=s;
    if(e.w!=null){ let rem=e.w; const ts=[]; for(let i=0;i<6;i++){ const t=M.T.find(u=>u.f===s&&u.d!=null&&u.d<=rem+1e-9); if(!t) break; rem-=t.d; ts.push(t); s=t.t; } pas.push({e,de,ts,fin:s}); }
    else { const t=M.T.find(u=>u.f===s&&u.ev===e.k&&(!u.gf||u.gf(e.v||{}))); pas.push({e,de,ts:t?[t]:[],fin:t?t.t:s}); if(t) s=t.t; }
  });
  return {fin:s,pas};
}
const evTxt=e=>e.w!=null?`attente de ${e.w} s`:(e.txt||e.k);
const seqTxt=seq=>seq.map(e=>B(esc(evTxt(e)))).join(" → ");
function traceTxt(M,r){ return `départ dans « ${nomE(M,M.init)} » ; `+r.pas.map(p=>p.ts.length?`${esc(evTxt(p.e))} → ${p.ts.map(t=>nomE(M,t.t)).join(" → ")}`:`${esc(evTxt(p.e))} : ignoré`).join(" ; "); }
/* suite aléatoire : le plus souvent un événement prévu dans l'état actif, parfois un événement quelconque (souvent ignoré) */
function genSeq(M,n){
  let s=M.init; const seq=[];
  for(let k=0;k<n;k++){
    const poss=M.T.filter(t=>t.f===s); let e;
    if(poss.length&&Math.random()<0.7){ const t=rnd(poss); e=t.d!=null?{w:t.d+rnd([5,10,15])}:{k:t.ev,txt:t.wd}; }
    else e=rnd(M.EV);
    seq.push(e); s=run(M,[e],s).fin;
  }
  return seq;
}
/* actions exécutées lors du franchissement d'une transition : exit de la source, effet, entry de la cible */
const acts=(M,st,kind)=>(M.S[st].a||[]).filter(a=>a.startsWith(kind+" / ")).map(a=>a.slice(kind.length+3));
function trActs(M,t){ return [...acts(M,t.f,"exit"),...(t.ef?[t.ef]:[]),...acts(M,t.t,"entry")]; }
/* programme Python équivalent (événements seuls) */
const pyEv=t=>t.py||t.ev;
function pySrc(M,evs){
  let s=`etat = "${nomE(M,M.init)}"\nevenements = [${evs.map(e=>`"${e}"`).join(", ")}]\nfor ev in evenements:\n`;
  M.T.filter(t=>t.f!==t.t).forEach((t,i)=>{ s+=`    ${i?"elif":"if"} etat == "${nomE(M,t.f)}" and ev == "${pyEv(t)}":\n        etat = "${nomE(M,t.t)}"\n`; });
  return s+"print(etat)";
}
function pyRun(M,evs){ let s=M.init; const pas=[]; evs.forEach(e=>{ const t=M.T.find(u=>u.f!==u.t&&u.f===s&&pyEv(u)===e); pas.push({e,de:s,t}); if(t) s=t.t; }); return {fin:s,pas}; }

/* diagrammes de séquence types */
function SD_borne(){ return {id:"borne",titre:"recharge d'un véhicule à une borne",ll:["Utilisateur","Borne","Serveur"],
  m:[{f:0,t:1,l:"présenter_badge"},{f:1,t:2,l:"vérifier(id)"},{f:2,t:1,l:"réponse(autorisé)",r:1},{f:1,t:0,l:"prise_déverrouillée"},{f:1,t:1,l:"démarrer_charge()"},{f:1,t:0,l:"afficher_refus()"}],
  fr:[{k:"alt",g:"[autorisé]",a:3,b:5,e:5}]}; }
function SD_serre(n,se){ return {id:"serre",titre:"relevés de température d'une serre connectée",ll:["Capteur T","Carte","Serveur"],
  m:[{f:2,t:1,l:"démarrer()"},{f:1,t:0,l:"lire_T()"},{f:0,t:1,l:"T",r:1},{f:1,t:2,l:"alerte(T)"},{f:1,t:2,l:"envoyer(T)"}],
  fr:[{k:"loop",g:`[${n} mesures]`,a:1,b:4},{k:"opt",g:`[T > ${se} °C]`,a:3,b:3}],n,se}; }
function SD_robot(){ return {id:"robot",titre:"livraison par un robot autonome",ll:["Client (appli)","Serveur","Robot"],
  m:[{f:0,t:1,l:"commander(adresse)"},{f:1,t:2,l:"position ?"},{f:2,t:1,l:"position(x, y)",r:1},{f:1,t:2,l:"affecter(trajet)"},{f:1,t:0,l:"confirmer(délai)"},{f:2,t:1,l:"envoyer(x, y)"},{f:1,t:0,l:"suivi(x, y)"},{f:2,t:1,l:"arrivée"},{f:1,t:0,l:"notifier_arrivée"}],
  fr:[{k:"loop",g:"[toutes les 2 s, pendant le trajet]",a:5,b:6}]}; }
function SD_portail(){ return {id:"portail",titre:"ouverture du portail à distance",ll:["Utilisateur","Télécommande","Carte de commande","Portail"],
  m:[{f:0,t:1,l:"appui()"},{f:1,t:2,l:"code_radio"},{f:2,t:2,l:"vérifier_code()"},{f:2,t:3,l:"ouvrir()"},{f:3,t:2,l:"fdc_ouvert"}],
  fr:[{k:"opt",g:"[code valide]",a:3,b:4}]}; }
function SD_distrib(){ return {id:"distrib",titre:"achat d'une boisson",ll:["Client","Monnayeur","Carte","Préparateur"],
  m:[{f:0,t:1,l:"insérer(pièce)"},{f:1,t:2,l:"valeur(v)"},{f:0,t:2,l:"choisir(boisson)"},{f:2,t:3,l:"préparer(boisson)"},{f:3,t:2,l:"boisson_prête",r:1},{f:2,t:1,l:"rendre(monnaie)"}],
  fr:[{k:"loop",g:"[tant que crédit < prix]",a:0,b:1}]}; }
function SD_pompe(hs){ return {id:"pompe",titre:"démarrage d'un arrosage automatique",ll:["Programmateur","Carte","Capteur H","Pompe"],
  m:[{f:0,t:1,l:"départ()"},{f:1,t:2,l:"lire_H()"},{f:2,t:1,l:"H",r:1},{f:1,t:3,l:"marche()"},{f:1,t:1,l:"attendre(20 min)"},{f:1,t:3,l:"arrêt()"},{f:1,t:0,l:"compte_rendu(annulé)"}],
  fr:[{k:"alt",g:`[H < ${hs} %]`,a:3,b:6,e:6}],hs}; }
const SDS=[SD_borne,()=>SD_serre(rnd([3,4,5,6]),rnd([28,30,32])),SD_robot,SD_portail,SD_distrib,()=>SD_pompe(rnd([30,35,40]))];
/* libellés de transitions complets (événement [garde] / effet) */
const ETQ=[["Paiement","Préparation","choix","crédit ≥ prix","débiter","du distributeur de boissons"],
  ["Fermé","Ouverture","bip","badge_valide","allumer_gyrophare","du portail automatique"],
  ["Armée","Pré-alarme","détection","porte_ouverte","noter_heure","de l'alarme"],
  ["Veille","Arrosage","départ","H < 40 %","ouvrir_vanne","de la pompe d'arrosage"],
  ["Suivi de ligne","Arrêt","mesure","d < 15 cm","freiner","du robot suiveur de ligne"],
  ["Repos","Ventilation","mesure","T > 28 °C","ouvrir_toit","de la serre connectée"],
  ["Attente","Charge","badge","compte_valide","déverrouiller","de la borne de recharge"],
  ["Prêt","Préparation","café","gobelet_présent","allumer_pompe","de la machine à café"]];
/* ordre exit → effet → entry : [système, état source, exit, événement, effet, état cible, entry] */
const ORD=[["Four de cuisson","Chauffe","couper_résistance","when(T ≥ 200 °C)","allumer_voyant","Maintien","afficher_prêt"],
  ["Robot sumo","Attaque","stopper_moteurs","ligne_blanche","compter_bordure","Recul","moteurs_arrière"],
  ["Ascenseur","Montée","arrêter_moteur","capteur_étage","sonner","Portes ouvertes","ouvrir_portes"],
  ["Distributeur de boissons","Préparation","rendre_monnaie","after(20 s)","afficher_merci","Attente","afficher_accueil"],
  ["Robot aspirateur","Nettoyage","arrêter_brosses","when(batterie < 15 %)","envoyer_alerte","Retour base","activer_guidage"]];
/* courbe de température d'une journée et seuils de la ventilation ; o.pts = [[t (h), T]] */
function fx_cmp_courbeT(o){
  const X0=52, Y0=204, W=316, H=164, y0=o.y0, y1=o.y1, sx=W/24, sy=H/(y1-y0), px=t=>X0+t*sx, py=v=>Y0-(v-y0)*sy;
  let s="";
  for(let t=0;t<=24;t+=3) s+=L(px(t),Y0,px(t),Y0-H,"v-grid")+T(px(t),Y0+16,String(t),"v-lab s","middle");
  for(let v=y0;v<=y1;v+=1) s+=L(X0,py(v),X0+W,py(v),"v-grid")+(v%2===0?T(X0-6,py(v)+4,String(v),"v-lab s","end"):"");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-16,"v-ink","k");
  o.hl.forEach(h=>{ s+=L(X0,py(h.y),X0+W,py(h.y),"v-dash")+T(X0+W+4,py(h.y)+4,esc(h.lab),"v-cap"); });
  s+=`<polyline points="${o.pts.map(p=>P2([px(p[0]),py(p[1])])).join(" ")}" class="v-curve"/>`;
  s+=T(X0+W+12,Y0+34,"t (h)","v-cap","end")+T(X0+8,Y0-H-6,"T (°C) dans la serre","v-cap");
  return svg(244,s,"Température mesurée dans la serre au cours d'une journée, avec les seuils de la ventilation");
}

const CMP1=[
  /* état initial */
  ()=>{ const M=rnd([M_portail,M_alarme,M_distrib,M_cafe,M_pompe,M_serre,M_feu])(), ok=nomE(M,M.init);
    return {fig:fx_cmp_stm(M),q:`Dans quel état se trouve ${M.le} juste après sa mise sous tension ?`,type:"ch",...mc(esc(ok),Object.keys(M.S).filter(k=>k!==M.init).map(k=>esc(nomE(M,k)))),
      expl:`Le disque noir est le pseudo-état initial : la flèche qui en part désigne l'état actif au démarrage, ${F(esc(ok))}. Ce disque n'est pas un état : le système n'y reste pas.`}; },
  /* étiquette événement [garde] / effet */
  ()=>{ const E=rnd(ETQ), k=ri(0,2), rep=[E[2],E[3],E[4]], lab=`${E[2]} [${E[3]}] / ${E[4]}`;
    return {ctx:`Dans le diagramme d'états ${E[5]}, la transition de « ${E[0]} » vers « ${E[1]} » porte l'étiquette ${F(esc(lab))}.`,
      q:`Dans cette étiquette, que représente « ${esc(rep[k])} » ?`,type:"ch",ch:["L'événement déclencheur","La condition de garde","L'effet (action exécutée pendant la transition)","L'état cible de la transition"],ok:k,
      expl:`Syntaxe d'une transition : ${F("événement [garde] / effet")}. Ici l'événement est « ${esc(E[2])} », la garde « ${esc(E[3])} » (la transition n'est franchie que si elle est vraie quand l'événement survient) et l'effet « ${esc(E[4])} », exécuté pendant le passage de « ${E[0]} » à « ${E[1]} ».`}; },
  /* un pas : événement prévu dans l'état actif */
  ()=>{ const M=rnd([M_portail,M_alarme,M_cafe,M_distrib,M_pompe])(), t=rnd(M.T.filter(u=>u.f!==u.t&&u.d==null&&!/^when/.test(u.ev)&&!u.g)), all=etats(M).map(esc);
    return {fig:fx_cmp_stm(M,{hl:t.f}),ctx:`${cap(M.le)} est dans l'état « ${esc(nomE(M,t.f))} » (en couleur sur le diagramme).`,q:`L'événement ${B(esc(t.ev))} survient. Quel est l'état actif ensuite ?`,type:"ch",ch:all,ok:all.indexOf(esc(nomE(M,t.t))),
      expl:`La transition de « ${esc(nomE(M,t.f))} » vers « ${esc(nomE(M,t.t))} » est déclenchée par ${esc(t.ev)} : elle est franchie et l'état actif devient ${F(esc(nomE(M,t.t)))}.${t.ef?` Pendant le passage, l'effet ${esc(t.ef)} est exécuté.`:""}`}; },
  /* événement non prévu dans l'état actif : ignoré */
  ()=>{ const M=rnd([M_portail,M_alarme,M_cafe])(), evs=M.EV.map(e=>e.k);
    const o=draw(()=>({s:rnd(Object.keys(M.S)),e:rnd(evs)}),o=>!M.T.some(t=>t.f===o.s&&t.ev===o.e));
    const X=esc(nomE(M,o.s)), tg=M.T.find(t=>t.ev===o.e), Y=esc(nomE(M,tg.t)), I=esc(nomE(M,M.init));
    const wr=[`${cap(M.le)} passe dans l'état « ${Y} »`,`${cap(M.le)} revient dans l'état initial « ${I} »`,"Le système passe dans un état d'erreur"].filter(w=>!w.includes(`« ${X} »`));
    return {fig:fx_cmp_stm(M,{hl:o.s}),ctx:`${cap(M.le)} est dans l'état « ${X} » (en couleur sur le diagramme).`,q:`L'événement ${B(esc(o.e))} survient alors. Que se passe-t-il ?`,type:"ch",...mcx(`Rien : l'événement est ignoré, ${M.le} reste dans « ${X} »`,wr),
      expl:`Aucune transition ne part de « ${X} » avec l'événement ${esc(o.e)} : il est ignoré et l'état actif reste ${F(X)}. Cet événement ne fait changer d'état que depuis « ${esc(nomE(M,tg.f))} ».`}; },
  /* condition de garde */
  ()=>{ if(Math.random()<0.5){ const M=M_distrib(), p=rnd([1.2,1.4,1.5,1.8,2]), c=draw(()=>rnd([0.5,0.7,0.8,1,1.1,1.3,1.6,1.7,2,2.2,2.5]),x=>far(x,p,0.03)), ok=c>=p;
      const A0="La transition est franchie : passage dans « Préparation »", A1="La garde est fausse : le distributeur reste dans « Paiement »";
      return {fig:fx_cmp_stm(M,{hl:"P"}),ctx:`Le distributeur est dans l'état « Paiement » : le crédit inséré vaut ${nfd(c,2)} €. Le client choisit une boisson à ${nfd(p,2)} € (événement choix).`,
        q:"Que provoque l'appui du client sur le bouton de sa boisson ?",type:"ch",...mc(ok?A0:A1,[ok?A1:A0,"Le distributeur passera dans « Préparation » dès que la garde deviendra vraie, sans nouvel appui","Le distributeur retourne dans « Attente » et rembourse le client"]),
        expl:`La garde [crédit ≥ prix] est évaluée à l'arrivée de l'événement : ${nfd(c,2)} € ${ok?"≥":"&lt;"} ${nfd(p,2)} €, elle est ${ok?"vraie : la transition est franchie, passage dans « Préparation ».":"fausse : la transition n'est pas franchie et l'événement est perdu. Il faudra insérer des pièces puis appuyer de nouveau."}`}; }
    const M=M_pompe(), H=draw(()=>rnd([20,25,30,35,40,45,50,55,60]),x=>far(x,M.hs,0.03)), ok=H<M.hs;
    const A0="La pompe passe dans « Arrosage »", A1="La pompe reste en « Veille » : la garde est fausse";
    return {fig:fx_cmp_stm(M,{hl:"Ve"}),ctx:`La pompe est en « Veille ». Le programmateur envoie l'événement départ alors que le capteur mesure une humidité du sol H = ${H} %.`,
      q:"Quel est l'effet de l'événement départ ?",type:"ch",...mc(ok?A0:A1,[ok?A1:A0,"La pompe passe dans « Défaut »","La pompe démarrera plus tard, dès que l'humidité aura baissé, sans nouvel événement départ"]),
      expl:`La garde [H &lt; ${M.hs} %] est évaluée quand départ arrive : ${H} % ${ok?"&lt;":">"} ${M.hs} %, elle est ${ok?"vraie : la transition vers « Arrosage » est franchie.":"fausse : la transition n'est pas franchie et départ est perdu ; il faudra attendre le prochain départ."}`}; },
  /* type d'événement */
  ()=>{ const Lx=[["after(30 s)",0],["after(20 min)",0],["after(4 s)",0],["after(25 s)",0],["when(T > 28 °C)",1],["when(niveau < 10 %)",1],["when(T ≥ 90 °C)",1],["when(d < 15 cm)",1],["bip",2],["détection",2],["pièce",2],["code_ok",2]], [x,k]=rnd(Lx);
    const ch=["Au bout de la durée indiquée, comptée depuis l'entrée dans l'état source","Dès que la condition entre parenthèses devient vraie","À la réception du message (signal) qui porte ce nom"];
    const ex=[`${F("after(durée)")} est un événement temporel : la durée est comptée à partir de l'entrée dans l'état source ; si l'on quitte l'état avant, la temporisation est abandonnée.`,
      `${F("when(condition)")} est un événement de changement : la transition est franchie dès que la condition passe de fausse à vraie, sans autre message.`,
      `« ${esc(x)} » est un signal : un message reçu par le système (télécommande, capteur, bouton…). La transition est franchie à sa réception si l'état source est actif.`][k];
    return {q:`Une transition est étiquetée ${F(esc(x))}. Quand est-elle franchie ?`,type:"ch",...mc(ch[k],[...ch.filter((_,j)=>j!==k),"Jamais d'elle-même : c'est une action exécutée par le système"]),expl:ex}; },
  /* entry / do / exit */
  ()=>{ const A=[["Ventilation","entry / ouvrir_toit"],["Ventilation","do / ventiler"],["Ventilation","exit / fermer_toit"],["Arrosage","entry / ouvrir_vanne"],["Arrosage","do / pomper"],["Arrosage","exit / fermer_vanne"],["Sirène","entry / sirène_on"],["Sirène","exit / sirène_off"],
        ["Préparation","entry / chauffer_eau"],["Préparation","do / verser"],["Préparation","exit / rendre_monnaie"],["Ouverture","entry / moteur_ouvrir"],["Ouverture","exit / arrêter_moteur"],["Chauffage","do / chauffer"]];
    const [st,a]=rnd(A), kind=a.split(" / ")[0], act=a.split(" / ")[1], k={entry:0,do:1,exit:2}[kind];
    const ex=[`entry : exécutée une seule fois, à chaque entrée dans « ${st} » (y compris par une transition réflexive).`,`do : activité exécutée en continu tant que « ${st} » est actif ; elle s'interrompt quand on quitte l'état.`,`exit : exécutée une seule fois, à chaque sortie de « ${st} », avant l'effet de la transition franchie.`][k];
    return {q:`Dans l'état « ${st} », on lit ${F(esc(a))}. Quand l'action ${esc(act)} est-elle exécutée ?`,type:"ch",ch:["Une fois, à chaque entrée dans l'état","En continu, tant que l'état reste actif","Une fois, à chaque sortie de l'état","Uniquement à la mise sous tension du système"],ok:k,expl:ex}; },
  /* durée d'un cycle du feu */
  ()=>{ const M=M_feu(), Tc=M.v+M.o+M.r;
    return {fig:fx_cmp_stm(M),q:"Calcule la durée d'un cycle complet du feu, c'est-à-dire le temps qui sépare deux passages successifs au rouge.",type:"num",ans:Tc,tolA:0,unit:"s",
      expl:`Chaque couleur reste allumée pendant la temporisation de sa transition de sortie : ${F("T = t_rouge + t_vert + t_orange")} = ${M.r} + ${M.v} + ${M.o} = ${U(Tc,"s")}.`}; },
  /* quel diagramme SysML ? */
  ()=>{ const D=[["l'ordre chronologique des messages échangés entre l'utilisateur, la borne de recharge et le serveur","Diagramme de séquence"],
        ["les états successifs du portail et les événements qui le font passer d'un état à l'autre","Diagramme d'états"],
        ["les messages échangés entre le smartphone, le serveur et le robot livreur, dans l'ordre où ils ont lieu","Diagramme de séquence"],
        ["les modes de fonctionnement de la pompe (veille, arrosage, défaut) et les conditions pour passer de l'un à l'autre","Diagramme d'états"],
        ["les services rendus par le système à ses utilisateurs","Diagramme des cas d'utilisation"],
        ["les exigences du cahier des charges et leurs relations (contenance, deriveReqt, satisfy)","Diagramme des exigences"],
        ["la décomposition du système en blocs et sous-blocs","Diagramme de définition de blocs"]];
    const [d,ok]=rnd(D), beh=["Diagramme de séquence","Diagramme d'états"], rest=["Diagramme des cas d'utilisation","Diagramme des exigences","Diagramme de définition de blocs"].filter(x=>x!==ok);
    const wr=[...beh.filter(x=>x!==ok),...shuffle(rest)].slice(0,3);
    const ex={"Diagramme de séquence":"Le diagramme de séquence (sd) représente les messages échangés entre lignes de vie, lus de haut en bas dans l'ordre chronologique.",
      "Diagramme d'états":"Le diagramme d'états (stm) représente les états d'un système et les transitions (événement [garde] / effet) qui le font changer d'état.",
      "Diagramme des cas d'utilisation":"Le diagramme des cas d'utilisation (uc) liste les services rendus par le système à ses acteurs.",
      "Diagramme des exigences":"Le diagramme des exigences (req) traduit le cahier des charges : exigences, contenance ⊕, deriveReqt, satisfy, verify.",
      "Diagramme de définition de blocs":"Le diagramme de définition de blocs (bdd) décrit la structure : de quels blocs le système est composé."}[ok];
    return {q:`Quel diagramme SysML décrit ${d} ?`,type:"ch",...mc(ok,wr),expl:`${ex} Réponse : ${F(ok)}.`}; },
  /* diagramme de séquence : émetteur ou destinataire */
  ()=>{ const D=rnd(SDS)(), i=rnd(D.m.map((m,j)=>j).filter(j=>D.m[j].f!==D.m[j].t)), m=D.m[i], send=Math.random()<0.5, who=D.ll[send?m.f:m.t];
    return {fig:fx_cmp_sd(D),ctx:`Diagramme de séquence : ${D.titre}.`,q:`Quelle ligne de vie ${send?"envoie":"reçoit"} le message « ${esc(m.l)} » ?`,type:"ch",...mc(esc(who),D.ll.filter(x=>x!==who).map(esc)),
      expl:`Une flèche de message part de la ligne de vie de l'émetteur et pointe vers celle du destinataire. « ${esc(m.l)} » va de ${esc(D.ll[m.f])} vers ${esc(D.ll[m.t])} : ${send?"l'émetteur":"le destinataire"} est ${F(esc(who))}.${m.r?" Le trait en pointillés indique un message de retour (une réponse).":""}`}; },
  /* diagramme de séquence : ordre des messages */
  ()=>{ const D=rnd(SDS)(), labs=D.m.map(m=>m.l), fr=D.fr||[];
    const cand=D.m.map((m,i)=>i).filter(i=>i+1<D.m.length&&labs.filter(x=>x===labs[i]).length===1&&labs[i+1]!==labs[i]&&!fr.some(f=>f.a===i+1||f.b===i||f.e===i+1));
    const i=rnd(cand), ok=labs[i+1];
    return {fig:fx_cmp_sd(D),ctx:`Diagramme de séquence : ${D.titre}.`,q:`Quel message est échangé juste après « ${esc(labs[i])} » ?`,type:"ch",...mcx(esc(ok),shuffle(labs.filter((x,j)=>j!==i&&j!==i+1)).map(esc)),
      expl:`Les messages se lisent de haut en bas, dans l'ordre chronologique : juste sous « ${esc(labs[i])} » se trouve ${F(esc(ok))}, de ${esc(D.ll[D.m[i+1].f])} vers ${esc(D.ll[D.m[i+1].t])}.`}; },
  /* programme Python et transition */
  ()=>{ const M=rnd([M_portail,M_alarme,M_cafe])(), sig=M.T.filter(u=>u.d==null&&!/^when/.test(u.ev)&&u.f!==u.t), t=rnd(sig);
    const lab=(f,e,to)=>`De « ${esc(f)} » vers « ${esc(to)} », sur l'événement ${esc(e)}`;
    const wr=[lab(nomE(M,t.t),t.ev,nomE(M,t.f)),...shuffle(sig.filter(u=>u!==t)).map(u=>lab(nomE(M,u.f),u.ev,nomE(M,u.t)))];
    return {fig:fx_cmp_stm(M),data:code(`if etat == "${nomE(M,t.f)}" and ev == "${t.ev}":\n    etat = "${nomE(M,t.t)}"`),
      q:"Quelle transition du diagramme ces deux lignes de Python traduisent-elles ?",type:"ch",...mcx(lab(nomE(M,t.f),t.ev,nomE(M,t.t)),wr),
      expl:`Le test porte sur l'état actif (${F(`etat == "${esc(nomE(M,t.f))}"`)}) et sur l'événement reçu ; l'affectation donne le nouvel état. C'est la transition de « ${esc(nomE(M,t.f))} » vers « ${esc(nomE(M,t.t))} », déclenchée par ${esc(t.ev)}.`}; },
  /* conditions de la serre sur des transitions numérotées */
  ()=>{ const M=M_serre(), i=ri(0,3), t=M.T[i];
    const why=[`on quitte « Repos » pour ventiler quand il fait trop chaud`,`la ventilation s'arrête quand la serre est redescendue sous ${M.th-M.dh} °C`,`on quitte « Repos » pour chauffer quand il fait trop froid`,`le chauffage s'arrête quand la serre est remontée au-dessus de ${M.tb+M.db} °C`][i];
    return {fig:fx_cmp_stm(M,{num:true}),ctx:`Serre connectée : ventilation au-dessus de ${M.th} °C, arrêt de la ventilation en dessous de ${M.th-M.dh} °C ; chauffage en dessous de ${M.tb} °C, arrêt du chauffage au-dessus de ${M.tb+M.db} °C.`,
      q:`Quelle condition porte la transition n° ${i+1} ?`,type:"ch",...mc(esc(t.ev),M.T.filter((_,j)=>j!==i).map(u=>esc(u.ev))),
      expl:`La transition n° ${i+1} va de « ${nomE(M,t.f)} » vers « ${nomE(M,t.t)} » : ${why}, d'où ${F(esc(t.ev))}.`}; }
];

const CMP2=[
  /* suite d'événements : état final */
  ()=>{ const M=rnd([M_portail,M_alarme,M_cafe])();
    const o=draw(()=>{ const seq=genSeq(M,ri(4,6)); return {seq,r:run(M,seq)}; },o=>o.r.pas.filter(p=>!p.ts.length).length>=1&&o.r.pas.filter(p=>p.ts.length).length>=2&&o.r.pas.filter(p=>p.e.w!=null).length<=2);
    const all=etats(M).map(esc);
    return {fig:fx_cmp_stm(M),ctx:`${cap(M.le)} part de son état initial. Les événements se succèdent à moins d'une seconde d'intervalle, sauf les attentes indiquées.`,
      q:`Suite d'événements : ${seqTxt(o.seq)}. Dans quel état se trouve ${M.le} à la fin ?`,type:"ch",ch:all,ok:all.indexOf(esc(nomE(M,o.r.fin))),
      expl:`Trace : ${traceTxt(M,o.r)}. État final : ${F(esc(nomE(M,o.r.fin)))}. Un événement non prévu dans l'état actif est ignoré ; une attente ne déclenche un after(d) que si elle dure au moins d.`}; },
  /* nombre d'exécutions d'une action entry */
  ()=>{ if(Math.random()<0.45){ const M=M_distrib(), a=ri(2,4), b=ri(1,3), seq=[...Array(a).fill({k:"pièce"}),{k:"annuler"},...Array(b).fill({k:"pièce"})];
      return {fig:fx_cmp_stm(M),ctx:"Le distributeur part de l'état « Attente ». Un client insère des pièces, annule, puis recommence.",
        q:`Suite d'événements : ${seqTxt(seq)}. Combien de fois l'action afficher_crédit est-elle exécutée ?`,type:"num",ans:a+b,tolA:0,unit:"fois",
        expl:`afficher_crédit est l'action entry de « Paiement » : elle s'exécute à chaque entrée dans cet état. La 1re pièce fait entrer dans « Paiement », chaque pièce suivante déclenche la transition réflexive pièce / créditer, qui sort de l'état puis y rentre (exit puis entry). ${a} pièces, annulation (retour en « Attente »), puis ${b} pièce${b>1?"s":""} : ${a} + ${b} = ${F(`${a+b} fois`)}.`}; }
    const M=rnd([M_portail,M_cafe])(), ents=Object.keys(M.S).filter(k=>acts(M,k,"entry").length);
    const o=draw(()=>{ const seq=genSeq(M,ri(5,7)), r=run(M,seq), k=rnd(ents), n=r.pas.reduce((s,p)=>s+p.ts.filter(t=>t.t===k).length,0); return {seq,r,k,n}; },o=>o.n>=1&&o.r.pas.filter(p=>p.e.w!=null).length<=2);
    const act=acts(M,o.k,"entry")[0];
    return {fig:fx_cmp_stm(M),ctx:`${cap(M.le)} part de son état initial. Les événements se succèdent à moins d'une seconde d'intervalle, sauf les attentes indiquées.`,
      q:`Suite d'événements : ${seqTxt(o.seq)}. Combien de fois l'action ${esc(act)} est-elle exécutée ?`,type:"num",ans:o.n,tolA:0,unit:"fois",
      expl:`${esc(act)} est l'action entry de « ${esc(nomE(M,o.k))} » : elle s'exécute à chaque entrée dans cet état. Trace : ${traceTxt(M,o.r)}. On compte ${F(`${o.n} entrée${o.n>1?"s":""}`)} dans « ${esc(nomE(M,o.k))} ».`}; },
  /* feu : couleur à un instant donné */
  ()=>{ const M=M_feu(), Tc=M.v+M.o+M.r, t=draw(()=>ri(Tc+3,4*Tc),x=>{ const m=x%Tc; return [0,M.r,M.r+M.v,Tc].every(b=>Math.abs(m-b)>=2); }), m=t%Tc, c=m<M.r?"Rouge":m<M.r+M.v?"Vert":"Orange";
    return {fig:fx_cmp_stm(M),ctx:"Le feu entre dans l'état « Rouge » à t = 0 et fonctionne ensuite sans interruption.",q:`Quelle est la couleur du feu à t = ${t} s ?`,type:"ch",ch:["Rouge","Vert","Orange"],ok:["Rouge","Vert","Orange"].indexOf(c),
      expl:`Durée d'un cycle : T = ${M.r} + ${M.v} + ${M.o} = ${Tc} s. ${t} s = ${Math.floor(t/Tc)} × ${Tc} + ${m} s : on est ${m} s après le début d'un cycle. Rouge de 0 à ${M.r} s, vert de ${M.r} à ${M.r+M.v} s, orange de ${M.r+M.v} à ${Tc} s : le feu est ${F(c.toLowerCase())}.`}; },
  /* ordre des actions lors d'une transition */
  ()=>{ let fig=null, ctx, ex, ev, eff, en, S0, C0, sys;
    if(Math.random()<0.4){ const M=M_portail(); fig=fx_cmp_stm(M); sys="Portail"; S0="Fermeture"; ex="arrêter_moteur"; ev="obstacle"; eff="bip_sonore"; C0="Ouverture"; en="moteur_ouvrir";
      ctx="Le portail est en cours de fermeture quand la cellule détecte un obstacle."; }
    else { const O=rnd(ORD); [sys,S0,ex,ev,eff,C0,en]=O;
      ctx=`${O[0]} : l'état « ${O[1]} » contient ${F("exit / "+O[2])} ; la transition vers « ${O[5]} » porte ${F(esc(O[3]+" / "+O[4]))} ; l'état « ${O[5]} » contient ${F("entry / "+O[6])}. L'événement ${esc(O[3])} survient.`; }
    const ok=`${ex} → ${eff} → ${en}`;
    return {fig,ctx,q:"Dans quel ordre les trois actions sont-elles exécutées lors du franchissement de la transition ?",type:"ch",...mc(esc(ok),[`${eff} → ${ex} → ${en}`,`${en} → ${eff} → ${ex}`,`${ex} → ${en} → ${eff}`].map(esc)),
      expl:`On quitte d'abord l'état source (exit / ${esc(ex)}), puis on exécute l'effet porté par la transition (${esc(eff)}), enfin on entre dans l'état cible (entry / ${esc(en)}) : ${F("exit → effet → entry")}.`}; },
  /* serre : suite de mesures de température */
  ()=>{ const M=M_serre(), th=M.th, tl=M.th-M.dh, tb=M.tb, tr=M.tb+M.db;
    const sim=Ts=>{ let s="R"; const pas=[]; let chain=false; Ts.forEach(T=>{ const s0=s; if(s==="R"){ if(T>th) s="V"; else if(T<tb) s="C"; } else if(s==="V"){ if(T<tl) s="R"; } else if(T>tr) s="R";
        if(s!==s0&&s==="R"&&(T>th||T<tb)) chain=true; pas.push([T,s0,s]); }); return {s,pas,chain}; };
    const o=draw(()=>{ const n=ri(5,7), Ts=[]; let T=ri(tb+4,th-2); for(let i=0;i<n;i++){ T+=rnd([-6,-5,-4,-3,3,4,5,6]); T=Math.max(tb-4,Math.min(th+4,T)); Ts.push(T); } return Ts; },
      Ts=>{ if(!Ts.every(T=>[th,tl,tb,tr].every(b=>Math.abs(T-b)>=1))) return false; const r=sim(Ts); return !r.chain&&r.pas.filter(p=>p[1]!==p[2]).length>=2&&r.pas.some(p=>p[1]==="V"&&p[2]==="V"&&p[0]<=th); });
    const r=sim(o), all=etats(M), nm={R:"Repos",V:"Ventilation",C:"Chauffage"};
    const data=table(["Mesure","1","2","3","4","5","6","7"].slice(0,o.length+1),[["T (°C)",...o.map(String)]]);
    return {fig:fx_cmp_stm(M),data,ctx:"La serre part de l'état « Repos ». La température est mesurée toutes les 10 minutes (tableau).",q:"Dans quel état se trouve la serre après la dernière mesure ?",type:"ch",ch:all,ok:all.indexOf(nm[r.s]),
      expl:`On applique les conditions de l'état actif à chaque mesure : ${r.pas.map(p=>`${p[0]} °C → ${nm[p[2]]}`).join(" ; ")}. État final : ${F(nm[r.s])}. Entre ${tl} °C et ${th} °C, la ventilation continue si elle est en marche : seules les conditions de l'état actif comptent.`}; },
  /* distributeur : garde puis monnaie rendue */
  ()=>{ const M=M_distrib(), p=rnd([120,130,150,160,180,200]), CO=[10,20,50,100,200];
    const o=draw(()=>{ const c1=[rnd(CO),rnd(CO)], c3=rnd(CO), s12=c1[0]+c1[1], s=s12+c3; return {c1,c3,s12,s}; },o=>o.s12<=0.97*p&&o.s>=1.03*p);
    const eu=x=>`${nfd(x/100,2)} €`, seq=[{k:"pièce",txt:`pièce de ${eu(o.c1[0])}`},{k:"pièce",txt:`pièce de ${eu(o.c1[1])}`},{k:"choix"},{k:"pièce",txt:`pièce de ${eu(o.c3)}`},{k:"choix"}];
    const ctx=`Le distributeur part de « Attente ». Boisson choisie : ${eu(p)}. Suite d'événements : ${seqTxt(seq)}.`, fig=fx_cmp_stm(M), mr=(o.s-p)/100;
    return [{fig,ctx,q:"Dans quel état se trouve le distributeur juste après le premier appui sur choix ?",type:"ch",ch:["Attente","Paiement","Préparation"],ok:1,
        expl:`Après deux pièces, le crédit vaut ${eu(o.c1[0])} + ${eu(o.c1[1])} = ${eu(o.s12)}, inférieur au prix (${eu(p)}) : la garde [crédit ≥ prix] est fausse, choix est perdu. Le distributeur reste dans ${F("Paiement")}.`},
      {fig,ctx,q:"Quelle somme le distributeur rend-il à la sortie de l'état « Préparation » ?",type:"num",ans:mr,tolR:0.02,unit:"€",
        expl:`Crédit final : ${eu(o.s12)} + ${eu(o.c3)} = ${eu(o.s)} ≥ ${eu(p)} : le second choix est accepté. L'action exit / rendre_monnaie rend ${F("crédit − prix")} = ${eu(o.s)} − ${eu(p)} = ${F(`${nfd(mr,2)} €`)}.`}]; },
  /* diagramme de séquence : nombre de messages avec une boucle */
  ()=>{ if(Math.random()<0.5){ const n=rnd([3,4,5,6]), se=rnd([28,30,32]), D=SD_serre(n,se);
      const Ts=draw(()=>Array.from({length:n},()=>ri(se-6,se+5)),a=>a.every(T=>Math.abs(T-se)>=1)&&a.some(T=>T>se)&&a.some(T=>T<se)), k=Ts.filter(T=>T>se).length, tot=1+3*n+k;
      return {fig:fx_cmp_sd(D),data:table(["Mesure",...Ts.map((_,i)=>String(i+1))],[["T (°C)",...Ts.map(String)]]),ctx:"Le serveur lance une campagne de mesures ; les températures relevées sont données dans le tableau.",
        q:"Combien de messages sont échangés au total (retours compris) pendant cette campagne ?",type:"num",ans:tot,tolA:0,unit:"messages",
        expl:`Hors boucle : démarrer() (1 message). À chaque tour de la boucle : lire_T(), le retour T et envoyer(T) (3 messages), plus alerte(T) quand T > ${se} °C (fragment opt), soit ${k} fois ici. Total : 1 + 3 × ${n} + ${k} = ${F(`${tot} messages`)}.`}; }
    const D=SD_robot(), [d,v]=draw(()=>[rnd([125,150,175,210,250,275]),rnd([1,1.2,1.5,1.6,2])],([a,b])=>{ const f=a/b/2-Math.floor(a/b/2); return f>=0.1&&f<=0.9; }), du=d/v, it=Math.floor(du/2), tot=5+2*it+2;
    return {fig:fx_cmp_sd(D),ctx:`Le robot parcourt ${d} m à ${nf(v,1)} m/s. Pendant le trajet, il envoie sa position toutes les 2 s (le premier envoi a lieu 2 s après le départ).`,
      q:"Combien de messages sont échangés au total, de la commande à la notification d'arrivée ?",type:"num",ans:tot,tolA:0,unit:"messages",
      expl:`Durée du trajet : ${FRAC(d,nf(v,1))} = ${nf(du,1)} s, soit ${it} envois de position (un toutes les 2 s). Avant la boucle : 5 messages ; chaque tour : envoyer(x, y) puis suivi(x, y) (2 messages) ; après : arrivée et notifier_arrivée (2). Total : 5 + 2 × ${it} + 2 = ${F(`${tot} messages`)}.`}; },
  /* fragment alt : messages échangés */
  ()=>{ if(Math.random()<0.5){ const D=SD_borne(), ok=Math.random()<0.5;
      const A="présenter_badge, vérifier(id), réponse(autorisé), prise_déverrouillée, démarrer_charge()", R="présenter_badge, vérifier(id), réponse(autorisé), afficher_refus()";
      return {fig:fx_cmp_sd(D),ctx:`Le serveur ${ok?"reconnaît":"ne reconnaît pas"} le badge présenté par l'utilisateur.`,q:"Quelle est la liste des messages échangés, dans l'ordre ?",type:"ch",
        ...mc(ok?A:R,[ok?R:A,"présenter_badge, vérifier(id), prise_déverrouillée, démarrer_charge(), afficher_refus()","présenter_badge, vérifier(id), réponse(autorisé), prise_déverrouillée, démarrer_charge(), afficher_refus()"]),
        expl:`Le fragment alt n'exécute qu'une seule branche : ${ok?"[autorisé] est vraie, on exécute la première (prise_déverrouillée, démarrer_charge())":"[autorisé] est fausse, on exécute la branche [else] (afficher_refus())"}. Les messages hors du fragment sont toujours échangés.`}; }
    const hs=rnd([30,35,40]), D=SD_pompe(hs), H=draw(()=>ri(hs-15,hs+15),x=>far(x,hs,0.05)), ok=H<hs;
    const A="départ(), lire_H(), H, marche(), attendre(20 min), arrêt()", R="départ(), lire_H(), H, compte_rendu(annulé)";
    return {fig:fx_cmp_sd(D),ctx:`Au moment du départ, le capteur mesure une humidité du sol H = ${H} %.`,q:"Quelle est la liste des messages échangés, dans l'ordre ?",type:"ch",
      ...mc(ok?A:R,[ok?R:A,"départ(), marche(), attendre(20 min), arrêt()","départ(), lire_H(), H, marche(), attendre(20 min), arrêt(), compte_rendu(annulé)"]),
      expl:`${H} % ${ok?"&lt;":">"} ${hs} % : la garde [H &lt; ${hs} %] est ${ok?"vraie, on exécute la première branche du fragment alt (arrosage)":"fausse, on exécute la branche [else] (compte rendu d'annulation)"}. Les messages départ(), lire_H() et le retour H sont échangés dans tous les cas.`}; },
  /* programme Python : état final */
  ()=>{ const M=rnd([M_portail,M_alarme,M_cafe])(), tr=M.T.filter(t=>t.f!==t.t);
    const o=draw(()=>{ let s=M.init; const evs=[], n=ri(4,6); for(let k=0;k<n;k++){ const poss=tr.filter(t=>t.f===s); const e=poss.length&&Math.random()<0.7?pyEv(rnd(poss)):pyEv(rnd(tr)); evs.push(e); s=pyRun(M,evs).fin; } return evs; },
      evs=>{ const r=pyRun(M,evs); return r.pas.filter(p=>!p.t).length>=1&&r.pas.filter(p=>p.t).length>=2; });
    const r=pyRun(M,o), all=etats(M).map(esc);
    return {fig:code(pySrc(M,o)),ctx:`Programme qui simule ${M.le} (${M.T.some(t=>t.py==="fin_tempo")?"fin_tempo : fin de la temporisation ; ":""}${M.T.some(t=>t.py==="eau_chaude")?"eau_chaude : l'eau atteint 90 °C ; ":""}un seul test est vrai à chaque tour).`,
      q:"Quel état ce programme affiche-t-il à la fin ?",type:"ch",ch:all,ok:all.indexOf(esc(nomE(M,r.fin))),
      expl:`La boucle for traite les événements un par un ; le bloc if/elif ne franchit que la transition dont l'état source est l'état actif. Trace : ${r.pas.map(p=>p.t?`${p.e} → ${esc(nomE(M,p.t.t))}`:`${p.e} : aucun test vrai`).join(" ; ")}. Affichage : ${F(esc(nomE(M,r.fin)))}.`}; },
  /* portail : durée d'un cycle complet */
  ()=>{ const M=M_portail(), Lc=rnd([3.6,4,4.5,5,5.4,6]), vo=rnd([0.12,0.15,0.18,0.2]), vf=rnd([0.1,0.12,0.15]), to=Lc/vo, tf=Lc/vf, tot=to+M.tp+tf;
    return {fig:fx_cmp_stm(M),ctx:`Le vantail parcourt ${nf(Lc,1)} m à ${nf(vo,2)} m/s à l'ouverture et à ${nf(vf,2)} m/s à la fermeture. Aucun obstacle n'est détecté.`,
      q:"Calcule la durée qui sépare le bip du retour du portail dans l'état « Fermé ».",type:"num",ans:tot,tolR:0.02,unit:"s",
      expl:`Ouverture : ${F(`t = ${FRAC("L","v")}`)} = ${FRAC(nf(Lc,1),nf(vo,2))} = ${nf(to,1)} s ; séjour dans « Ouvert » : after(${M.tp} s) ; fermeture : ${FRAC(nf(Lc,1),nf(vf,2))} = ${nf(tf,1)} s. Total : ${nf(to,1)} + ${M.tp} + ${nf(tf,1)} = ${U(tot,"s")}.`}; },
  /* alarme : durée de sonnerie */
  ()=>{ const M=M_alarme(), X=Math.random()<0.25?ri(3,M.tp-3):ri(M.tp+8,M.tp+150), s=Math.max(0,X-M.tp);
    return {fig:fx_cmp_stm(M),ctx:`Un intrus est détecté à t = 0 alors que l'alarme est armée. Le bon code est saisi à t = ${X} s.`,q:"Pendant combien de temps la sirène a-t-elle sonné ?",type:"num",ans:s,tolA:0,unit:"s",
      expl:X<M.tp?`La détection fait passer en « Pré-alarme » à t = 0. Le code arrive à ${X} s, avant la fin de after(${M.tp} s) : code_ok ramène en « Désarmée » et la sirène ne sonne pas : ${F("0 s")}.`
        :`Détection à t = 0 : passage en « Pré-alarme ». after(${M.tp} s) fait passer en « Sirène » à t = ${M.tp} s (entry / sirène_on). code_ok à ${X} s ramène en « Désarmée » (exit / sirène_off). Durée : ${X} − ${M.tp} = ${U(s,"s")}.`}; },
  /* pompe : durée totale de pompage sur trois jours */
  ()=>{ const M=M_pompe(), Hs=draw(()=>Array.from({length:6},()=>rnd([20,25,30,35,40,45,50,55,60,65])),a=>a.every(h=>far(h,M.hs,0.03))&&a.some(h=>h<M.hs)&&a.some(h=>h>M.hs)), n=Hs.filter(h=>h<M.hs).length, tot=n*M.dur;
    const data=TT(["Départ","J1 6 h","J1 18 h","J2 6 h","J2 18 h","J3 6 h","J3 18 h"],[["H (%)",...Hs.map(String)]]);
    return {fig:fx_cmp_stm(M),data,ctx:"Le programmateur envoie l'événement départ à 6 h et à 18 h. Le tableau donne l'humidité du sol à chaque départ. La cuve ne descend jamais sous le niveau d'alerte.",
      q:"Pendant combien de minutes la pompe a-t-elle fonctionné sur ces trois jours ?",type:"num",ans:tot,tolA:0,unit:"min",
      expl:`La garde [H &lt; ${M.hs} %] n'est vraie que pour ${n} départ${n>1?"s":""} (${Hs.filter(h=>h<M.hs).map(h=>h+" %").join(", ")}) ; les autres départs sont ignorés. Chaque arrosage dure after(${M.dur} min) : ${n} × ${M.dur} = ${F(`${tot} min`)}.`}; }
];

const CMP3=[
  /* portail : obstacle pendant la fermeture, temporisation relancée, exigence de durée */
  ()=>{ const M=M_portail(), fig=fx_cmp_stm(M);
    const o=draw(()=>{ const Lc=rnd([3.6,4,4.5,5,5.4,6]), vo=rnd([0.15,0.18,0.2,0.24]), vf=rnd([0.1,0.12,0.15]), tf=Lc/vf, tob=Math.round(tf*rnd([0.3,0.4,0.5,0.6])), to=Lc/vo, dr=vf*tob, tr=dr/vo, tot=to+M.tp+tob+tr+M.tp+tf, Y=rnd([90,120,150,180,210,240,300]);
        return {Lc,vo,vf,tf,tob,to,dr,tr,tot,Y}; },o=>far(o.tot,o.Y,0.06)&&far(o.tot-M.tp,o.Y,0.04));
    const ok=o.tot<=o.Y, ctx=`Le vantail parcourt ${nf(o.Lc,1)} m, à ${nf(o.vo,2)} m/s à l'ouverture et à ${nf(o.vf,2)} m/s à la fermeture. Après un bip, un obstacle est détecté ${o.tob} s après le début de la fermeture : le portail rouvre complètement, puis le cycle reprend sans autre incident.`;
    return [{fig,ctx,q:"Calcule la durée totale entre le bip et le retour du portail dans l'état « Fermé ».",type:"num",ans:o.tot,tolR:0.02,unit:"s",
        expl:`Ouverture : ${FRAC(nf(o.Lc,1),nf(o.vo,2))} = ${nf(o.to,1)} s ; « Ouvert » : ${M.tp} s ; fermeture interrompue au bout de ${o.tob} s, le vantail a parcouru ${nf(o.vf,2)} × ${o.tob} = ${nf(o.dr,2)} m ; réouverture : ${FRAC(nf(o.dr,2),nf(o.vo,2))} = ${nf(o.tr,1)} s ; nouvelle entrée dans « Ouvert » : after(${M.tp} s) repart de zéro ; fermeture complète : ${FRAC(nf(o.Lc,1),nf(o.vf,2))} = ${nf(o.tf,1)} s. Total : ${U(o.tot,"s")}.`},
      {fig,ctx,q:`Exigence : même avec une détection d'obstacle, le portail doit être refermé au plus ${o.Y} s après le bip. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.tot,0)} s ${ok?"≤":">"} ${o.Y} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite (il faudrait fermer plus vite ou raccourcir la temporisation)."} Oublier que la temporisation repart de zéro à la seconde entrée dans « Ouvert » ferait trouver ${nf(o.tot-M.tp,0)} s.`}]; },
  /* la temporisation repart de zéro à chaque entrée, même par une transition réflexive */
  ()=>{ const to=rnd([30,45,60,90]), M=M_distrib({to}), t1=ri(8,to-6), t2=t1+ri(8,to-6), ans=t2+to;
    return {fig:fx_cmp_stm(M),ctx:`Variante du distributeur : sans action du client pendant ${to} s dans « Paiement », il rembourse le crédit et revient en « Attente ». Un client insère une pièce à t = 0, une autre à t = ${t1} s, une dernière à t = ${t2} s, puis ne fait plus rien.`,
      q:"À quel instant le distributeur rembourse-t-il le client ?",type:"num",ans,tolA:0,unit:"s",
      expl:`after(${to} s) est compté depuis la dernière entrée dans « Paiement ». Chaque pièce déclenche la transition réflexive pièce / créditer : on sort de l'état puis on y rentre, et la temporisation repart de zéro. Dernière entrée à t = ${t2} s, donc remboursement à ${t2} + ${to} = ${U(ans,"s")} (et non à ${to} s).`}; },
  /* feu et passage piéton : attente maximale et exigence */
  ()=>{ const M=M_feu(), w=M.v+M.o, W=draw(()=>rnd([30,35,40,45,50,60]),x=>far(w,x,0.06)), ok=w<=W, fig=fx_cmp_stm(M), ctx="Le feu piétons est vert quand le feu voitures est rouge, et rouge sinon. Un piéton arrive au passage à un instant quelconque.";
    return [{fig,ctx,q:"Quelle est la durée d'attente maximale d'un piéton avant le vert piétons ?",type:"num",ans:w,tolA:0,unit:"s",
        expl:`Le pire cas : le piéton arrive juste quand le feu voitures passe au vert. Il attend tout le vert (${M.v} s) puis tout l'orange (${M.o} s) : ${F("t_max = t_vert + t_orange")} = ${M.v} + ${M.o} = ${U(w,"s")}.`},
      {fig,ctx,q:`Exigence : un piéton ne doit jamais attendre plus de ${W} s. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${w} s ${ok?"≤":">"} ${W} s : ${ok?"l'exigence est satisfaite.":`l'exigence n'est pas satisfaite. Il faudrait ramener la temporisation du vert à au plus ${W} − ${M.o} = ${W-M.o} s.`}`}]; },
  /* bogue : deux if au lieu de if / elif */
  ()=>{ const [nm,E0,E1,ev]=rnd([["la lampe (télérupteur)","Éteinte","Allumée","appui"],["le ventilateur","Arrêt","Marche","bouton"],["le robot","Pause","Mission","bip"],["la pompe","Arrêt","Marche","appui"]]);
    const fig=code(`# ${nm} : chaque ${ev} fait passer de ${E0} à ${E1}, et inversement\nif etat == "${E0}" and ev == "${ev}":\n    etat = "${E1}"\nif etat == "${E1}" and ev == "${ev}":\n    etat = "${E0}"`);
    const ctx=`Ces lignes sont exécutées à chaque événement reçu. Diagramme d'états voulu : « ${E0} » ⇄ « ${E1} », les deux transitions déclenchées par ${ev}.`;
    return [{fig,ctx,q:`etat vaut "${E0}" et l'événement ${ev} vient d'arriver. Que contient etat après l'exécution de ces lignes ?`,type:"ch",ch:[`"${E0}"`,`"${E1}"`],ok:0,
        expl:`Le premier test est vrai : etat devient "${E1}". Le second if est évalué ensuite, indépendamment du premier : il est vrai à son tour et etat revient à ${F(`"${E0}"`)}. Deux transitions sont franchies pour un seul événement : ${nm} ne change jamais d'état.`},
      {fig,ctx,q:"Quelle modification corrige ce programme ?",type:"ch",...mc("Remplacer le second if par elif",["Inverser l'ordre des deux tests","Remplacer == par = dans les deux tests",`Ajouter à la fin : else: etat = "${E0}"`]),
        expl:`Avec ${F("elif")}, le second test n'est évalué que si le premier est faux : une seule transition par événement, comme dans le diagramme. Inverser les tests déplace le problème (il réapparaît depuis « ${E1} »), = est une affectation (erreur de syntaxe dans un test), et le else ramènerait « ${E0} » à chaque tour.`}]; },
  /* un seul seuil ou deux seuils : intérêt de l'hystérésis */
  ()=>{ const M=M_serre({dh:3}), th=M.th, tl=th-M.dh;
    const Ts=draw(()=>{ const n=ri(6,8), a=[]; for(let i=0;i<n;i++) a.push(th+rnd([-2,-1,1,2])); return a; },a=>a[0]<th&&a.filter((T,i)=>i>0&&T>th&&a[i-1]<th).length>=2);
    const n1=Ts.filter((T,i)=>T>th&&(i===0||Ts[i-1]<th)).length, fig=fx_cmp_stm(M), ctx=`Relevés de température toutes les 5 minutes, la serre partant de « Repos » : ${Ts.map(T=>T+" °C").join(" ; ")}.`;
    return [{fig,ctx,q:`Une première version n'utilisait qu'un seuil : when(T > ${th} °C) pour ventiler, when(T &lt; ${th} °C) pour revenir au repos. Combien de démarrages de la ventilation aurait-on eus ?`,type:"num",ans:n1,tolA:0,unit:"démarrages",
        expl:`Avec un seul seuil, chaque passage de T au-dessus de ${th} °C relance la ventilation et chaque passage en dessous l'arrête : on compte ${F(`${n1} démarrages`)} en quelques dizaines de minutes, chacun suivi d'un arrêt dès que T repasse sous ${th} °C.`},
      {fig,ctx,q:`Pourquoi le diagramme retenu utilise-t-il deux seuils (${th} °C et ${tl} °C) ?`,type:"ch",...mc("Pour éviter les démarrages et arrêts répétés quand la température oscille autour d'un seuil unique",["Pour que la ventilation s'arrête plus tôt et consomme moins",`Pour que la serre reste toujours au-dessus de ${th} °C`,"Parce qu'un capteur ne peut pas mesurer deux fois de suite la même température"]),
        expl:`Avec le diagramme retenu, la ventilation démarre au premier passage au-dessus de ${th} °C et ne s'arrête que sous ${tl} °C : pour ces relevés, qui restent au-dessus de ${tl} °C, elle ne démarre qu'${F("une fois")}. L'écart entre les deux seuils (hystérésis) évite l'usure du moteur et des ouvrants par des cycles marche-arrêt répétés.`}]; },
  /* serre : lecture d'une courbe de température sur une journée */
  ()=>{ const M=M_serre({dh:rnd([3,4])}), th=M.th, tl=th-M.dh, V={HI:()=>th+rnd([1.5,2,2.5,3]),MH:()=>th-1,ML:()=>tl+rnd([1,1.5]),LO:()=>tl-rnd([1.5,2,3])};
    const sim=ex=>{ let s="R", n=0; const ev=[]; ex.forEach((k,i)=>{ if(i%2){ if(s==="R"&&k==="HI"){ s="V"; n++; ev.push([i,"dém"]); } else ev.push([i,s==="V"?"cont":"rien"]); } else if(i>0){ if(s==="V"&&k==="LO"){ s="R"; ev.push([i,"arr"]); } else ev.push([i,s==="V"?"cont":"rien"]); } }); return {s,n,ev}; };
    const ex=draw(()=>Array.from({length:9},(_,i)=>i%2?rnd(["HI","HI","MH"]):rnd(["LO","ML","ML"])),a=>{ const r=sim(a); return r.n>=1&&r.n<=3&&a.some((k,i)=>i%2===0&&i>0&&k==="ML"&&sim(a.slice(0,i)).s==="V"); });
    const val=ex.map(k=>V[k]()), pts=[]; for(let i=0;i<8;i++) for(let j=0;j<12;j++){ const u=j/12; pts.push([3*i+3*u,val[i]+(val[i+1]-val[i])*(1-Math.cos(Math.PI*u))/2]); } pts.push([24,val[8]]);
    const r=sim(ex), y0=Math.floor(tl-4), y1=Math.ceil(th+4), fig=fx_cmp_courbeT({pts,y0:y0%2?y0-1:y0,y1,hl:[{y:th,lab:`${th} °C`},{y:tl,lab:`${tl} °C`}]});
    const det=r.ev.map(([i,k])=>`${3*i} h : ${i%2?"pic":"creux"} à ${nf(val[i],1)} °C, ${{dém:"démarrage",cont:"la ventilation continue",arr:"arrêt",rien:"pas de changement"}[k]}`).join(" ; ");
    const ctx=`Diagramme d'états : ventilation quand T > ${th} °C, arrêt quand T &lt; ${tl} °C. La serre est au repos à 0 h ; la courbe donne la température mesurée au cours de la journée.`;
    return [{fig,ctx,q:"Combien de fois la ventilation démarre-t-elle au cours de cette journée ?",type:"num",ans:r.n,tolA:0,unit:"fois",
        expl:`On suit la courbe en appliquant les conditions de l'état actif : ${det}. Total : ${F(`${r.n} démarrage${r.n>1?"s":""}`)}. Un creux qui reste au-dessus de ${tl} °C n'arrête pas la ventilation.`},
      {fig,ctx,q:"Dans quel état se trouve la serre à 24 h ?",type:"ch",ch:["Repos","Ventilation","Chauffage"],ok:r.s==="R"?0:1,
        expl:`Le dernier changement d'état de la journée est ${r.ev.filter(e=>e[1]==="dém"||e[1]==="arr").slice(-1).map(([i,k])=>`${k==="dém"?"un démarrage":"un arrêt"} vers ${3*i} h`)[0]} ; ensuite la courbe ne franchit plus le seuil utile. À 24 h, la serre est en ${F(r.s==="R"?"Repos":"Ventilation")}.`}]; },
  /* borne de recharge : durée des échanges et exigence */
  ()=>{ const D=SD_borne(), fig=fx_cmp_sd(D);
    const o=draw(()=>{ const tb=rnd([0.2,0.3,0.4]), tv=rnd([0.3,0.4,0.5,0.6]), ts=rnd([0.5,0.8,1,1.2]), tr=rnd([0.3,0.4,0.5,0.6]), tp=rnd([0.8,1,1.2,1.5]), to=rnd([2,2.5,3]), Y=rnd([4,4.5,5,5.5,6,7]);
        return {tb,tv,ts,tr,tp,to,Y,tot:tb+tv+ts+tr+tp,tot2:tb+to+tv+ts+tr+tp}; },o=>o.tot<o.Y&&far(o.tot2,o.Y,0.06));
    const data=table(["Étape","Durée"],[["lecture du badge (présenter_badge)",`${nf(o.tb,1)} s`],["transmission de vérifier(id)",`${nf(o.tv,1)} s`],["traitement par le serveur",`${nf(o.ts,1)} s`],["transmission de la réponse",`${nf(o.tr,1)} s`],["déverrouillage de la prise",`${nf(o.tp,1)} s`]]);
    const ok=o.tot2<=o.Y, ctx="Le badge est autorisé. Le tableau donne la durée de chaque étape du diagramme de séquence.";
    return [{fig,data,ctx,q:"Quelle durée sépare la présentation du badge du déverrouillage de la prise ?",type:"num",ans:o.tot,tolR:0.02,unit:"s",
        expl:`Les messages se succèdent : ${F("t = Σ durées")} = ${[o.tb,o.tv,o.ts,o.tr,o.tp].map(x=>nf(x,1)).join(" + ")} = ${U(o.tot,"s")}.`},
      {fig,data,ctx:`Si aucune réponse n'est arrivée ${nf(o.to,1)} s après l'envoi de vérifier(id), la borne renvoie ce message. Exigence : prise déverrouillée au plus ${nf(o.Y,1)} s après la présentation du badge, même si une requête vérifier(id) est perdue.`,
        q:"Cette exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Pire cas : la première requête est perdue, la borne attend ${nf(o.to,1)} s avant de la renvoyer. t = ${nf(o.tb,1)} + ${nf(o.to,1)} + ${nf(o.tv,1)} + ${nf(o.ts,1)} + ${nf(o.tr,1)} + ${nf(o.tp,1)} = ${nf(o.tot2,1)} s ${ok?"≤":">"} ${nf(o.Y,1)} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut réduire la temporisation de renvoi."}`}]; },
  /* pompe : réserve d'eau, niveau d'alerte et autonomie */
  ()=>{ const M=M_pompe(), fig=fx_cmp_stm(M);
    const o=draw(()=>{ const V=rnd([500,800,1000,1500,2000]), Q=rnd([8,10,12,15,20]), k=V*(1-M.nv/100)/(Q*M.dur), J=rnd([2,3,4,5,7]); return {V,Q,k,J,n:Math.floor(k)}; },
      o=>{ const f=o.k-Math.floor(o.k); return f>0.1&&f<0.9&&o.k>=2&&o.k<=30&&o.n!==2*o.J; });
    const ok=o.n>=2*o.J, ctx=`La cuve (${nf(o.V,0)} L) est pleine ; la pompe débite ${o.Q} L/min. Sécheresse : la garde du départ est toujours vraie.`;
    return [{fig,ctx,q:"Combien d'arrosages complets peut-on faire avant le passage dans l'état « Défaut » ?",type:"num",ans:o.n,tolA:0,unit:"arrosages",
        expl:`La transition when(niveau &lt; ${M.nv} %) interrompt l'arrosage dès que la réserve utile est vide : ${nf(o.V,0)} × ${nf(1-M.nv/100,2)} = ${nf(o.V*(1-M.nv/100),0)} L utilisables. Un arrosage consomme ${F("V = Q·t")} = ${o.Q} × ${M.dur} = ${o.Q*M.dur} L. ${FRAC(nf(o.V*(1-M.nv/100),0),o.Q*M.dur)} = ${nf(o.k,2)}, soit ${F(`${o.n} arrosages`)} complets.`},
      {fig,ctx,q:`Deux départs par jour. Exigence : tenir au moins ${o.J} jours sans remplir la cuve. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`Il faut ${o.J} × 2 = ${2*o.J} arrosages complets ; la cuve en permet ${o.n} : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite (la pompe passerait en « Défaut » avant la fin)."}`}]; },
  /* liste des actions exécutées, dans l'ordre */
  ()=>{ const M=M_portail(), fig=fx_cmp_stm(M), w=M.tp+rnd([5,10]);
    const seq=Math.random()<0.5?[{k:"bip"},{k:"fdc_ouvert"},{w},{k:"obstacle"}]:[{k:"bip"},{k:"obstacle"},{k:"fdc_ouvert"},{w},{k:"obstacle"},{k:"fdc_ouvert"}];
    const r=run(M,seq), trs=r.pas.flatMap(p=>p.ts), J=a=>a.join(" → ");
    const ok=J(trs.flatMap(t=>trActs(M,t))), noEx=J(trs.flatMap(t=>[...(t.ef?[t.ef]:[]),...acts(M,t.t,"entry")])),
      effF=J(trs.flatMap(t=>[...(t.ef?[t.ef]:[]),...acts(M,t.f,"exit"),...acts(M,t.t,"entry")])), entF=J(trs.flatMap(t=>[...acts(M,t.f,"exit"),...acts(M,t.t,"entry"),...(t.ef?[t.ef]:[])]));
    return {fig,ctx:`Le portail part de « Fermé ». Suite d'événements : ${seqTxt(seq)} (événements rapprochés, sauf l'attente indiquée).`,q:"Quelle est la liste des actions exécutées, dans l'ordre ?",type:"ch",...mcx(esc(ok),[noEx,effF,entF].map(esc)),
      expl:`À chaque transition franchie : exit de l'état quitté, puis effet de la transition, puis entry de l'état atteint. Trace : ${traceTxt(M,r)}. Actions : ${HL(esc(ok))}.`}; },
  /* diagramme de séquence et programme Python */
  ()=>{ const n=rnd([3,4,5,6]), se=rnd([28,30,32]), D=SD_serre(n,se);
    const src=`recevoir_demarrer()        # message démarrer()\nfor i in range(___):\n    T = capteur.lire_T()   # lire_T(), puis retour T\n    if ___:\n        serveur.alerte(T)\n    serveur.envoyer(T)`;
    const C=(a,b)=>`<code>${ce(a)}</code> puis <code>${ce(b)}</code>`;
    return {fig:fx_cmp_sd(D),data:code(src),ctx:"Ce programme de la carte doit traduire le diagramme de séquence.",q:"Par quoi faut-il remplacer les deux trous, dans l'ordre ?",type:"ch",
      ...mc(C(String(n),`T > ${se}`),[C(String(n-1),`T > ${se}`),C(String(n),`T < ${se}`),C(String(n+1),`T < ${se}`)]),
      expl:`Le fragment loop [${n} mesures] devient une boucle de ${n} tours : ${F(`range(${n})`)} donne i = 0 à ${n-1}. Le fragment opt [T > ${se} °C] devient un test sans else : ${F(`if T > ${se}:`)}. envoyer(T) est hors du fragment opt : il est exécuté à chaque tour.`}; },
  /* machine à café : délai avant le premier café et exigence */
  ()=>{ const M=M_cafe(), fig=fx_cmp_stm(M);
    const o=draw(()=>{ const T0=rnd([15,18,20,22,25]), r=rnd([0.8,1,1.2,1.5,2]), tch=(90-T0)/r, Y=rnd([90,100,120,150]); return {T0,r,tch,Y,tot:tch+M.tc}; },o=>far(o.tot,o.Y,0.06)&&o.tch>=20);
    const ok=o.tot<=o.Y, ctx=`La machine est en « Veille », eau à ${o.T0} °C. On appuie sur marche à t = 0 ; en chauffe, la température de l'eau monte de ${nf(o.r,1)} °C par seconde. L'utilisateur appuie sur café dès que la machine est prête.`;
    return [{fig,ctx,q:"À quel instant la préparation du café se termine-t-elle ?",type:"num",ans:o.tot,tolR:0.02,unit:"s",
        expl:`« Chauffe » dure jusqu'à ce que when(T ≥ 90 °C) devienne vrai : ${FRAC(`90 − ${o.T0}`,nf(o.r,1))} = ${nf(o.tch,1)} s. « Préparation » dure after(${M.tc} s). Fin : ${nf(o.tch,1)} + ${M.tc} = ${U(o.tot,"s")}.`},
      {fig,ctx,q:`Exigence : le premier café doit être prêt moins de ${o.Y} s après l'appui sur marche. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.tot,0)} s ${ok?"≤":">"} ${o.Y} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut une résistance plus puissante (chauffe plus rapide)."}`}]; },
  /* pompe : choisir la temporisation pour un volume imposé */
  ()=>{ const M=M_pompe();
    const o=draw(()=>{ const Q=rnd([8,10,12,15,20,25]), Vmin=rnd([150,200,250,300,400]), Vmax=Vmin+rnd([50,100]), C=[5,8,10,12,15,18,20,25,30,40];
        const inn=C.filter(t=>Q*t>=Vmin*1.03&&Q*t<=Vmax*0.97), out=C.filter(t=>Q*t<Vmin*0.95||Q*t>Vmax*1.05); return {Q,Vmin,Vmax,inn,out}; },o=>o.inn.length===1&&o.out.length>=3);
    const t=o.inn[0], wr=shuffle(o.out).slice(0,3);
    return {fig:fx_cmp_stm(M),ctx:`Chaque arrosage doit délivrer entre ${o.Vmin} L et ${o.Vmax} L ; la pompe débite ${o.Q} L/min.`,q:`Quelle temporisation faut-il écrire dans la transition after(… min) qui termine l'arrosage ?`,type:"ch",...mc(`after(${t} min)`,wr.map(x=>`after(${x} min)`)),
      expl:`${F("V = Q·t")}, donc t doit être compris entre ${FRAC(o.Vmin,o.Q)} = ${nf(o.Vmin/o.Q,2)} min et ${FRAC(o.Vmax,o.Q)} = ${nf(o.Vmax/o.Q,2)} min. Seule ${F(`after(${t} min)`)} convient : ${o.Q} × ${t} = ${o.Q*t} L. ${wr.map(x=>`${x} min donnerait ${o.Q*x} L`).join(", ")}.`}; }
];

POOLS["ana-comportement"]={
  titre:"États, transitions, séquences",
  fiche:{t:"Diagrammes d'états et de séquence",l:[
    `Diagramme d'états : un seul état actif à la fois ; une transition ${F("événement [garde] / effet")} n'est franchie que si l'événement survient et que la garde est vraie.`,
    `${F("after(durée)")} : temporisation comptée depuis l'entrée dans l'état source ; ${F("when(condition)")} : franchie dès que la condition devient vraie.`,
    `Dans un état : entry à l'entrée, do tant qu'il est actif, exit à la sortie ; lors d'une transition, l'ordre est ${F("exit → effet → entry")}.`,
    `Diagramme de séquence : lignes de vie, messages lus de haut en bas ; ${F("loop [n]")} répète le bloc, ${F("alt [condition]")} choisit une branche ; en Python : boucle for ou while, if / elif.`,
    "Pièges : un événement non prévu dans l'état actif est ignoré ; garde fausse = événement perdu ; after repart de zéro à chaque entrée, même par une transition réflexive ; deux if successifs peuvent franchir deux transitions pour un seul événement."]},
  count:{1:4,2:4,3:3},1:CMP1,2:CMP2,3:CMP3
};

/* ======================================================================
   LOGIQUE BOOLÉENNE (info-logique)
   ====================================================================== */
/* expressions écrites en texte : + (OU), * (ET), ^ (OU exclusif), ! (NON), parenthèses ; priorité NON > ET > OU exclusif > OU.
   BX(src) renvoie {src, h (écriture HTML avec barres), f (évaluation), vars} */
function bparse(src){
  const s=src.replace(/\s+/g,""); let i=0;
  const atom=()=>{ const c=s[i]; if(c==="("){ i++; const e=orE(); i++; return {t:"par",e}; } if(c==="0"||c==="1"){ i++; return {t:"k",v:+c}; }
    const m=/^[a-zA-Z][a-zA-Z0-9_]*/.exec(s.slice(i)); if(!m) throw new Error("expression illisible : "+src); i+=m[0].length; return {t:"v",n:m[0]}; };
  const un=()=>{ if(s[i]==="!"){ i++; return {t:"not",e:un()}; } return atom(); };
  const andE=()=>{ const a=[un()]; while(s[i]==="*"){ i++; a.push(un()); } return a.length>1?{t:"and",a}:a[0]; };
  const xorE=()=>{ const a=[andE()]; while(s[i]==="^"){ i++; a.push(andE()); } return a.length>1?{t:"xor",a}:a[0]; };
  const orE=()=>{ const a=[xorE()]; while(s[i]==="+"){ i++; a.push(xorE()); } return a.length>1?{t:"or",a}:a[0]; };
  const r=orE(); if(i!==s.length) throw new Error("expression illisible : "+src); return r;
}
function bev(n,v){ switch(n.t){ case "k": return n.v; case "v": return v[n.n]; case "par": return bev(n.e,v); case "not": return 1-bev(n.e,v);
  case "and": return n.a.every(x=>bev(x,v))?1:0; case "or": return n.a.some(x=>bev(x,v))?1:0; default: return n.a.reduce((s,x)=>s^bev(x,v),0); } }
function bh(n){ switch(n.t){ case "k": return String(n.v); case "v": return n.n; case "par": return `(${bh(n.e)})`; case "not": return ov(n.e.t==="par"?bh(n.e.e):bh(n.e));
  case "and": return n.a.map(bh).join("·"); case "or": return n.a.map(bh).join(" + "); default: return n.a.map(bh).join(" ⊕ "); } }
const BX=src=>{ const n=bparse(src); return {src,h:bh(n),f:v=>bev(n,v),vars:[...new Set(src.match(/[a-zA-Z][a-zA-Z0-9_]*/g)||[])].sort()}; };
/* toutes les combinaisons de n variables (poids fort en tête) */
const combos=n=>Array.from({length:2**n},(_,k)=>Array.from({length:n},(_,j)=>(k>>(n-1-j))&1));
const envOf=(vars,c)=>{ const v={}; vars.forEach((x,j)=>{ v[x]=c[j]; }); return v; };
/* table de vérité sous forme de chaîne (sur les variables vs) : sert à comparer deux expressions */
const ttS=(E,vs)=>combos(vs.length).map(c=>E.f(envOf(vs,c))).join("");
const eqv=(E1,E2)=>{ const vs=[...new Set([...E1.vars,...E2.vars])].sort(); return ttS(E1,vs)===ttS(E2,vs); };
/* distracteurs : expressions non équivalentes à E, d'écritures différentes */
const noneq=(E,list)=>list.map(x=>typeof x==="string"?BX(x):x).filter(D=>!eqv(D,E));
const vtxt=(vars,v)=>vars.map(x=>`${x} = ${v[x]}`).join(", ");
const ones=(E,vs)=>combos(vs.length).filter(c=>E.f(envOf(vs,c))).length;
/* tableau compact : en-têtes non passés en capitales (variables a, b, λ…), nombres centrés, textes alignés à gauche */
const TT=(head,rows)=>`<table style="width:auto;margin:0 auto"><thead><tr>${head.map(h=>`<th style="text-transform:none;letter-spacing:0;font-family:var(--f-mono);font-size:.84rem;text-align:center;padding:4px 12px;white-space:nowrap">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>{ const tx=/[a-zà-ÿ]{2}/i.test(String(c).replace(/<[^>]+>/g,"")); return `<td${tx?"":' class="n"'} style="text-align:${tx?"left":"center"};padding:4px 12px">${c}</td>`; }).join("")}</tr>`).join("")}</tbody></table>`;
/* octets */
const bits8=n=>n.toString(2).padStart(8,"0");
const bin=n=>`0b${bits8(n).slice(0,4)}_${bits8(n).slice(4)}`;
const bxt=n=>`${bits8(n).slice(0,4)} ${bits8(n).slice(4)}`;
const bitTab=rows=>TT(["",..."76543210".split("").map(k=>"b"+k)],rows.map(([lab,n])=>[lab,...(n==null?Array(8).fill("?"):bits8(n).split(""))]));
const poids=n=>{ const t=[]; for(let k=7;k>=0;k--) if((n>>k)&1) t.push(String(2**k)); return t.length?t.join(" + "):"0"; };
/* valeur décimale d'un octet, avec la somme des poids quand il y a plusieurs bits à 1 */
const decTxt=n=>poids(n).includes("+")?`${poids(n)} = ${F(String(n))}`:F(String(n));

/* ===== figures : logique (préfixe fx_log_) ===== */
const GS={ET:"&",OU:"≥1",OUX:"=1",NON:"1",NET:"&",NOU:"≥1"};
const GN={ET:"ET",OU:"OU",OUX:"OU exclusif",NON:"NON",NET:"NON-ET",NOU:"NON-OU"};
const GINV=k=>k==="NON"||k==="NET"||k==="NOU";
const OPF={ET:a=>a.every(x=>x)?1:0,OU:a=>a.some(x=>x)?1:0,OUX:a=>a.reduce((s,x)=>s^x,0),NET:a=>a.every(x=>x)?0:1,NOU:a=>a.some(x=>x)?0:1,NON:a=>1-a[0]};
/* porte normalisée (rectangle) de n entrées espacées de 18, coin haut gauche (x, y) */
function fx_log_gate(k,x,y,n,q){
  const h=12+18*n, w=36, cy=y+h/2; let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${q?"v-boxq":"v-box"}"/>`;
  s+=T(x+w/2,y+15,q?"?":esc(GS[k]),q?"v-lab c":"v-lab s","middle");
  let ox=x+w; if(!q&&GINV(k)){ s+=`<circle cx="${x+w+4}" cy="${cy}" r="4" class="v-box"/>`; ox=x+w+8; }
  const ins=[]; for(let j=0;j<n;j++) ins.push([x,y+15+18*j]);
  return {s,ins,out:[ox,cy],h};
}
/* une porte seule, en grand ; o.in : libellés des entrées ; o.q : symbole caché */
function fx_log_porte(k,o){
  o=o||{}; const n=k==="NON"?1:2, x=160, y=24, w=64, h=n===1?60:88, cy=y+h/2;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="v-box" style="stroke-width:2"/>`+T(x+w/2,y+26,esc(GS[k]),"v-lab","middle");
  let ox=x+w; if(GINV(k)){ s+=`<circle cx="${x+w+7}" cy="${cy}" r="7" class="v-box" style="stroke-width:2"/>`; ox=x+w+14; }
  const ys=n===1?[cy]:[y+22,y+h-22];
  ys.forEach((yy,j)=>{ s+=L(96,yy,x,yy,"v-ink")+T(88,yy+5,esc(o.in?o.in[j]:["a","b"][j]),"v-lab","end"); });
  s+=L(ox,cy,316,cy,"v-ink")+T(324,cy+5,esc(o.out||"S"),"v-lab");
  return svg(y+h+22,s,o.alt||"Porte logique en symbole normalisé");
}
/* logigramme à deux niveaux : E.rows = portes du premier niveau {g, in: [[variable, inversée]]} ou fils directs {lit: [variable, inversée]} ; E.out : porte de sortie (facultative) ;
   o.qRow / o.qOut : porte remplacée par « ? » */
function fx_log_net(E,o){
  o=o||{}; const vars=[...new Set(E.rows.flatMap(r=>r.lit?[r.lit[0]]:r.in.map(p=>p[0])))].sort(), RX=v=>26+22*vars.indexOf(v);
  let w="", g="", top=34; const rowOut=[], rowC=[];
  const wire=(v,neg,y,xe)=>{ const x0=RX(v); let r=`<circle cx="${x0}" cy="${y}" r="2.6" class="v-pt"/>`;
    if(neg) r+=L(x0,y,108,y,"v-ink")+`<rect x="108" y="${y-8}" width="22" height="16" class="v-box"/>`+T(119,y+4,"1","v-sm","middle")+`<circle cx="133.4" cy="${y}" r="3.4" class="v-box"/>`+L(136.8,y,xe,y,"v-ink");
    else r+=L(x0,y,xe,y,"v-ink");
    return r; };
  E.rows.forEach((r,i)=>{
    if(r.lit){ const y=top+10; w+=wire(r.lit[0],r.lit[1],y,E.out?244:360); rowOut.push([E.out?244:360,y]); rowC.push(y); top+=34; return; }
    const G=fx_log_gate(r.g,170,top,r.in.length,o.qRow===i); g+=G.s;
    r.in.forEach((p,j)=>{ w+=wire(p[0],p[1],G.ins[j][1],170); });
    rowOut.push(G.out); rowC.push(G.out[1]); top+=G.h+14;
  });
  const yEnd=top-8; let s="";
  vars.forEach(v=>{ s+=T(RX(v),16,esc(v),"v-lab s","middle")+L(RX(v),22,RX(v),yEnd,"v-ink"); });
  s+=w+g;
  if(E.out){ const k=E.rows.length, h=12+18*k, cy=k===3?rowC[1]:(rowC[0]+rowC[k-1])/2, G=fx_log_gate(E.out,270,cy-h/2,k,o.qOut);
    s+=G.s; rowOut.forEach((p,i)=>{ const yi=G.ins[i][1]; s+=`<polyline points="${P2(p)} ${P2([244,p[1]])} ${P2([244,yi])} ${P2([270,yi])}" class="v-ink"/>`; });
    s+=L(G.out[0],cy,358,cy,"v-ink")+T(364,cy+5,"S","v-lab"); }
  else { const p=rowOut[0]; s+=L(p[0],p[1],358,p[1],"v-ink")+T(364,p[1]+5,"S","v-lab"); }
  return svg(yEnd+10,s,o.alt||"Logigramme");
}
/* équation (texte pour BX) d'un logigramme */
function netSrc(E){
  const lit=p=>(p[1]?"!":"")+p[0];
  const row=(r,op)=>{ if(r.lit) return lit(r.lit); const xs=r.in.map(lit);
    if(r.g==="ET") return xs.join("*"); if(r.g==="OU") return op==="OU"||op==null?xs.join("+"):`(${xs.join("+")})`; if(r.g==="OUX") return op==null?xs.join("^"):`(${xs.join("^")})`;
    if(r.g==="NET") return `!(${xs.join("*")})`; return `!(${xs.join("+")})`; };
  if(!E.out) return row(E.rows[0],null);
  if(E.out==="OU") return E.rows.map(r=>row(r,"OU")).join("+");
  if(E.out==="ET") return E.rows.map(r=>row(r,"ET")).join("*");
  if(E.out==="OUX") return E.rows.map(r=>row(r,"ET")).map(x=>/^[!a-z]+$/.test(x)?x:`(${x})`).join("^");
  if(E.out==="NET") return `!(${E.rows.map(r=>row(r,"ET")).join("*")})`;
  return `!(${E.rows.map(r=>row(r,"OU")).join("+")})`;
}
/* chronogrammes : o.sig = [{n, v: [0/1 par intervalle] ou null (inconnu)}] ; intervalles numérotés */
function fx_log_chrono(o){
  const N=o.sig[0].v.length, X0=48, X1=388, w=(X1-X0)/N, bh=42, H=o.sig.length*bh; let s="";
  for(let k=0;k<=N;k++) s+=L(X0+k*w,8,X0+k*w,10+H,"v-grid");
  o.sig.forEach((sg,i)=>{ const y=10+i*bh, yh=y+9, yl=y+32;
    s+=T(38,y+26,esc(sg.n),"v-lab","end")+L(X0,yl,X1,yl,"v-grid");
    if(sg.v){ const p=[]; sg.v.forEach((b,k)=>{ const yy=b?yh:yl; p.push([X0+k*w,yy],[X0+(k+1)*w,yy]); }); s+=`<polyline points="${p.map(P2).join(" ")}" class="v-curve"/>`; }
    else s+=`<rect x="${X0+2}" y="${yh}" width="${X1-X0-4}" height="${yl-yh}" class="v-boxq"/>`+T((X0+X1)/2,yl-6,"?","v-lab c","middle"); });
  for(let k=0;k<N;k++) s+=T(X0+(k+0.5)*w,H+26,String(k+1),"v-lab s","middle");
  s+=T(X0,H+42,"intervalles de temps numérotés ; niveau haut = 1, niveau bas = 0","v-cap");
  return svg(H+50,s,o.alt||"Chronogrammes des variables logiques");
}
/* signaux sur 8 intervalles, avec au moins deux changements chacun */
const rbits=n=>draw(()=>Array.from({length:n},()=>ri(0,1)),a=>a.slice(1).filter((x,i)=>x!==a[i]).length>=2);

/* logigrammes types */
const NETS=[
  {rows:[{g:"ET",in:[["a",0],["b",0]]},{lit:["c",0]}],out:"OU"},
  {rows:[{g:"OU",in:[["a",0],["b",0]]},{lit:["c",1]}],out:"ET"},
  {rows:[{g:"ET",in:[["a",0],["b",1]]},{g:"ET",in:[["a",1],["b",0]]}],out:"OU"},
  {rows:[{g:"NET",in:[["a",0],["b",0]]},{lit:["c",0]}],out:"ET"},
  {rows:[{g:"OU",in:[["a",0],["c",0]]},{g:"OU",in:[["b",0],["c",1]]}],out:"ET"},
  {rows:[{g:"ET",in:[["a",0],["b",0]]},{g:"ET",in:[["b",1],["c",0]]}],out:"OU"},
  {rows:[{g:"NOU",in:[["a",0],["b",0]]},{lit:["c",0]}],out:"OU"},
  {rows:[{g:"OUX",in:[["a",0],["b",0]]},{lit:["c",0]}],out:"ET"},
  {rows:[{g:"ET",in:[["a",0],["c",0]]},{lit:["b",0]}],out:"NOU"},
  {rows:[{g:"ET",in:[["a",0],["b",0]]},{g:"ET",in:[["a",0],["c",0]]},{g:"ET",in:[["b",0],["c",0]]}],out:"OU"}
];
/* variantes d'un logigramme : une porte changée ou une inversion déplacée (pour les distracteurs) */
function netMut(E){
  const cl=()=>JSON.parse(JSON.stringify(E)), out=[], SW={ET:"OU",OU:"ET",NET:"NOU",NOU:"NET",OUX:"ET"};
  E.rows.forEach((r,i)=>{ if(r.g){ const e=cl(); e.rows[i].g=SW[r.g]; out.push(e); r.in.forEach((p,j)=>{ const f=cl(); f.rows[i].in[j][1]=1-p[1]; out.push(f); }); }
    else { const e=cl(); e.rows[i].lit[1]=1-r.lit[1]; out.push(e); } });
  if(E.out){ const e=cl(); e.out=SW[E.out]; out.push(e); const f=cl(); f.out={ET:"NET",OU:"NOU",NET:"ET",NOU:"OU",OUX:"ET"}[E.out]; out.push(f); }
  return out;
}
/* valeur de S pas à pas pour un logigramme */
function netTrace(E,v){
  const lit=p=>p[1]?1-v[p[0]]:v[p[0]], ltx=p=>p[1]?`${ov(p[0])} = ${1-v[p[0]]}`:`${p[0]} = ${v[p[0]]}`;
  const rv=E.rows.map(r=>r.lit?lit(r.lit):OPF[r.g](r.in.map(lit)));
  const parts=E.rows.map((r,i)=>r.lit?ltx(r.lit):`porte ${GN[r.g]} (${r.in.map(ltx).join(", ")}) → ${rv[i]}`);
  const S=E.out?OPF[E.out](rv):rv[0];
  return {S,txt:parts.join(" ; ")+(E.out?` ; porte de sortie ${GN[E.out]} (${rv.join(", ")}) → S = ${S}`:"")};
}

const PY=b=>b?"True":"False";
/* S pas à pas : valeurs substituées, puis valeur de chaque terme */
function bsub(n,v){ switch(n.t){ case "k": return String(n.v); case "v": return String(v[n.n]); case "par": return `(${bsub(n.e,v)})`; case "not": return ov(n.e.t==="par"?bsub(n.e.e,v):bsub(n.e,v));
  case "and": return n.a.map(x=>bsub(x,v)).join("·"); case "or": return n.a.map(x=>bsub(x,v)).join(" + "); default: return n.a.map(x=>bsub(x,v)).join(" ⊕ "); } }
function bexpl(src,v){ const n=bparse(src), top=n.t==="par"?n.e:n, s0=bsub(n,v); let s=`S = ${s0}`;
  if(["and","or","xor"].includes(top.t)){ const mid=top.a.map(x=>String(bev(x,v))).join({and:"·",or:" + ",xor:" ⊕ "}[top.t]); if(mid!==s0) s+=` = ${mid}`; }
  return s+` = ${bev(n,v)}`; }
const renm=(s,mp)=>s.replace(/[abc]/g,ch=>mp["abc".indexOf(ch)]);
const lignes=(E,vs)=>combos(vs.length).filter(c=>E.f(envOf(vs,c))).map(c=>`(${c.join(", ")})`).join(", ");

const LOG1=[
  /* sortie d'une porte */
  ()=>{ const k=rnd(["ET","OU","OUX","NET","NOU"]), a=ri(0,1), b=ri(0,1), S=OPF[k]([a,b]);
    const rule={ET:"ET : S = 1 seulement si les deux entrées valent 1",OU:"OU : S = 1 dès qu'au moins une entrée vaut 1",OUX:"OU exclusif : S = 1 seulement si les deux entrées sont différentes",NET:"NON-ET : c'est l'inverse du ET, S = 0 seulement si les deux entrées valent 1",NOU:"NON-OU : c'est l'inverse du OU, S = 1 seulement si les deux entrées valent 0"}[k];
    return {fig:fx_log_porte(k,{in:[`a = ${a}`,`b = ${b}`]}),q:"Que vaut la sortie S de cette porte logique ?",type:"ch",ch:["S = 0","S = 1"],ok:S,
      expl:`Le symbole « ${esc(GS[k])} »${GINV(k)?", suivi d'un rond qui inverse la sortie,":""} désigne la porte ${GN[k]}. ${rule}. Avec a = ${a} et b = ${b} : ${F(`S = ${S}`)}.`}; },
  /* reconnaître un symbole normalisé */
  ()=>{ const k=rnd(["ET","OU","OUX","NON","NET","NOU"]), conf={ET:"NON-ET",OU:"NON-OU",OUX:"OU",NON:"OU exclusif",NET:"ET",NOU:"OU"}[k];
    const wr=[conf,...shuffle(["ET","OU","OU exclusif","NON","NON-ET","NON-OU"].filter(x=>x!==GN[k]&&x!==conf))].slice(0,3);
    return {fig:fx_log_porte(k),q:"Quel opérateur logique ce symbole normalisé représente-t-il ?",type:"ch",...mc(GN[k],wr),
      expl:`Symboles normalisés : « &amp; » pour ET, « ≥1 » pour OU (au moins une entrée à 1), « =1 » pour OU exclusif (exactement une entrée à 1), « 1 » à une seule entrée pour NON ; un rond sur la sortie inverse le résultat. Ici : ${F(GN[k])}.`}; },
  /* opérateur d'après sa table de vérité */
  ()=>{ const k=rnd(["ET","OU","OUX","NET","NOU"]), conf={ET:"NON-ET",OU:"OU exclusif",OUX:"OU",NET:"ET",NOU:"NON-ET"}[k];
    const wr=[conf,...shuffle(["ET","OU","OU exclusif","NON-ET","NON-OU"].filter(x=>x!==GN[k]&&x!==conf))].slice(0,3);
    const why={ET:"seulement quand a et b valent 1",OU:"dès qu'une entrée au moins vaut 1, y compris quand les deux valent 1",OUX:"quand les deux entrées sont différentes",NET:"sauf quand a et b valent 1",NOU:"seulement quand a et b valent 0"}[k];
    return {data:TT(["a","b","S"],combos(2).map(c=>[String(c[0]),String(c[1]),String(OPF[k](c))])),q:"Quel opérateur logique cette table de vérité décrit-elle ?",type:"ch",...mc(GN[k],wr),
      expl:`S vaut 1 ${why}. C'est l'opérateur ${F(GN[k])}.`}; },
  /* nombre de lignes d'une table de vérité */
  ()=>{ const C=[[3,"une alarme surveille une porte, une fenêtre et un détecteur de mouvement"],[2,"un montage va-et-vient commande une lampe avec deux interrupteurs"],[4,"un robot possède quatre capteurs de contact"],
        [5,"une serre utilise cinq capteurs tout-ou-rien (porte, pluie, vent, humidité, température)"],[3,"une presse est commandée par deux boutons et un capteur de carter fermé"],[4,"un portail utilise une télécommande, deux fins de course et une cellule photoélectrique"]], [n,t]=rnd(C);
    return {q:`Chaque capteur tout-ou-rien est une variable logique : ${t}. Combien de lignes compte la table de vérité complète ?`,type:"num",ans:2**n,tolA:0,unit:"lignes",
      expl:`Chaque variable prend deux valeurs (0 ou 1) : pour ${n} variables, ${F(`2<sup>${n}</sup> = ${2**n}`)} combinaisons, donc ${2**n} lignes.`}; },
  /* énoncé → équation (deux variables) */
  ()=>{ const C=[["La lampe L s'allume quand l'interrupteur i est fermé (i = 1) et que la porte p est ouverte (p = 1).","L","i*p",["i+p","i*!p","i^p"],"Les deux conditions doivent être vraies en même temps : c'est un ET."],
        ["Le buzzer B sonne dès que la porte p ou la fenêtre f est ouverte (1 = ouverte).","B","p+f",["p*f","p^f","!(p+f)"],"Une seule ouverture suffit, et le buzzer sonne aussi si les deux sont ouvertes : c'est un OU."],
        ["Le moteur M tourne quand le bouton marche m est appuyé (m = 1) et que l'arrêt d'urgence u n'est pas enclenché (u = 1 : enclenché).","M","m*!u",["m*u","m+!u","!m*u"],"« m ET PAS u » : le complément de u intervient dans un ET."],
        ["Montage va-et-vient : la lampe L est allumée quand les interrupteurs a et b sont dans des positions différentes.","L","a^b",["a*b","a+b","!(a^b)"],"S = 1 quand les entrées sont différentes : c'est le OU exclusif."],
        ["Le voyant V s'allume quand la trappe t est fermée (t = 0) alors qu'il pleut (p = 1).","V","!t*p",["t*p","!t+p","t*!p"],"« PAS t ET p »."],
        ["Le ventilateur F tourne dès que l'un des capteurs de chaleur c1 ou c2 est actif ; il ne s'arrête que si les deux sont inactifs.","F","c1+c2",["c1*c2","!c1*!c2","c1^c2"],"Il suffit d'un capteur actif (et il tourne aussi si les deux le sont) : c'est un OU."]];
    const [t,s,ok,wr,why]=rnd(C), E=BX(ok), W=noneq(E,wr);
    return {ctx:t,q:"Quelle équation logique traduit ce fonctionnement ?",type:"ch",...mc(`${s} = ${E.h}`,W.map(D=>`${s} = ${D.h}`)),expl:`${why} ${F(`${s} = ${E.h}`)}.`}; },
  /* condition Python avec and, or, not */
  ()=>{ const TP=[["{x} and not {y}",(x,y)=>x&&!y,(nx,ny,x,y)=>`not ${ny} vaut ${PY(!y)}, puis ${PY(x)} and ${PY(!y)} vaut ${PY(x&&!y)}`],
        ["{x} or {y}",(x,y)=>x||y,(nx,ny,x,y)=>`${PY(x)} or ${PY(y)} vaut ${PY(x||y)}`],
        ["not {x} and {y}",(x,y)=>!x&&y,(nx,ny,x,y)=>`not ${nx} vaut ${PY(!x)}, puis ${PY(!x)} and ${PY(y)} vaut ${PY(!x&&y)}`],
        ["not ({x} or {y})",(x,y)=>!(x||y),(nx,ny,x,y)=>`la parenthèse ${nx} or ${ny} vaut ${PY(x||y)}, puis not donne ${PY(!(x||y))}`],
        ["{x} and {y}",(x,y)=>x&&y,(nx,ny,x,y)=>`${PY(x)} and ${PY(y)} vaut ${PY(x&&y)}`],
        ["not {x} or {y}",(x,y)=>!x||y,(nx,ny,x,y)=>`not ${nx} vaut ${PY(!x)}, puis ${PY(!x)} or ${PY(y)} vaut ${PY(!x||y)}`]];
    const [nx,ny]=rnd([["porte","alarme"],["marche","obstacle"],["pluie","vent"],["bouton","defaut"],["capteur_g","capteur_d"]]), X=Math.random()<0.5, Y=Math.random()<0.5, [tp,f,st]=rnd(TP), ex=tp.replace("{x}",nx).replace("{y}",ny), r=f(X,Y);
    return {fig:code(`${nx} = ${PY(X)}\n${ny} = ${PY(Y)}\nprint(${ex})`),q:"Qu'affiche ce programme Python ?",type:"ch",ch:["True","False"],ok:r?0:1,
      expl:`${nx} vaut ${PY(X)} et ${ny} vaut ${PY(Y)}. not inverse, and exige deux valeurs vraies, or en exige au moins une ; not s'applique avant and et or. Ici ${st(nx,ny,X,Y)} : affichage ${F(PY(r))}.`}; },
  /* évaluer une équation */
  ()=>{ const src=rnd(["a*!b+c","(a+b)*!c","!a*b+a*c","!(a*b)+c","(a^b)+c","(a+!c)*b","!(a+b)*c","a*b+!a*!c"]), E=BX(src), vs=E.vars, v=envOf(vs,rnd(combos(vs.length))), S=E.f(v);
    return {q:`${F(`S = ${E.h}`)}. Que vaut S pour ${vtxt(vs,v)} ?`,type:"ch",ch:["S = 0","S = 1"],ok:S,
      expl:`On remplace chaque variable par sa valeur, puis on calcule dans l'ordre : NON, ET (·), OU (+). ${bexpl(src,v)}, donc ${F(`S = ${S}`)}.`}; },
  /* opération bit à bit sur un octet */
  ()=>{ const op=rnd(["&","|","^"]), x=ri(1,254), m=rnd([0x0F,0xF0,0x3C,0x81,0x55,0xAA,0x18,0xE0,0x07]), r=op==="&"?x&m:op==="|"?x|m:x^m;
    return {data:bitTab([["x",x],["m",m]]),q:`Quel est le résultat de l'opération bit à bit ${F(`x ${esc(op)} m`)} ?`,type:"ch",grid:true,...mcx(bxt(r),[x&m,x|m,x^m,(~x)&255,x].map(bxt)),
      expl:`On applique l'opérateur colonne par colonne. ${{"&":"ET (&amp;) : 1 seulement si les deux bits valent 1","|":"OU (|) : 1 dès qu'un des deux bits vaut 1","^":"OU exclusif (^) : 1 si les deux bits sont différents"}[op]}. Résultat : ${F(bxt(r))}.`}; },
  /* lois de De Morgan */
  ()=>{ const [p,q]=rnd([["a","b"],["p","q"],["x","y"],["g","d"]]), et=Math.random()<0.5;
    const E=BX(et?`!(${p}*${q})`:`!(${p}+${q})`), K=BX(et?`!${p}+!${q}`:`!${p}*!${q}`), W=noneq(E,et?[`!${p}*!${q}`,`${p}+${q}`,`!${p}*${q}`]:[`!${p}+!${q}`,`${p}*${q}`,`!${p}+${q}`]);
    return {q:`À quelle expression ${F(E.h)} est-elle égale ?`,type:"ch",...mc(K.h,W.map(D=>D.h)),
      expl:`Loi de De Morgan : le complément d'${et?"un produit":"une somme"} est ${et?"la somme":"le produit"} des compléments, ${F(`${E.h} = ${K.h}`)}. On complémente chaque variable et on échange · et +.`}; },
  /* propriétés de l'algèbre de Boole */
  ()=>{ const PR=[["a+1","1"],["a*0","0"],["a+!a","1"],["a*!a","0"],["a^a","0"],["a^1","!a"],["a*1","a"],["a+0","a"],["a+a","a"],["a*a","a"],["a^0","a"],["!!a","a"]], [x,r]=rnd(PR), E=BX(x);
    return {q:`Que vaut ${F(E.h)}, quelle que soit la valeur de a ?`,type:"ch",ch:["0","1","a",ov("a")],ok:["0","1","a","!a"].indexOf(r),
      expl:`On teste les deux cas : pour a = 0, ${E.h} vaut ${E.f({a:0})} ; pour a = 1, il vaut ${E.f({a:1})}. Donc ${F(`${E.h} = ${BX(r).h}`)}.`}; },
  /* chronogramme : valeur de S dans un intervalle */
  ()=>{ const k=rnd(["ET","OU","OUX","NET","NOU"]), [a,b]=draw(()=>[rbits(8),rbits(8)],([aa,bb])=>combos(2).every(c=>aa.some((x,i)=>x===c[0]&&bb[i]===c[1]))), i=ri(0,7), S=OPF[k]([a[i],b[i]]);
    const eq=BX({ET:"a*b",OU:"a+b",OUX:"a^b",NET:"!(a*b)",NOU:"!(a+b)"}[k]);
    return {fig:fx_log_chrono({sig:[{n:"a",v:a},{n:"b",v:b},{n:"S",v:null}]}),q:`On réalise ${F(`S = ${eq.h}`)} (porte ${GN[k]}). Que vaut S dans l'intervalle n° ${i+1} ?`,type:"ch",ch:["S = 0","S = 1"],ok:S,
      expl:`Dans l'intervalle n° ${i+1}, on lit a = ${a[i]} et b = ${b[i]} (niveau haut = 1). ${bexpl(eq.src,{a:a[i],b:b[i]})} : ${F(`S = ${S}`)}.`}; },
  /* logigramme : valeur de S */
  ()=>{ const E=rnd(NETS), vs=[...new Set(netSrc(E).match(/[a-z]/g))].sort(), v=envOf(vs,rnd(combos(vs.length))), r=netTrace(E,v);
    return {fig:fx_log_net(E),q:`Les entrées valent ${vtxt(vs,v)}. Que vaut la sortie S du logigramme ?`,type:"ch",ch:["S = 0","S = 1"],ok:r.S,
      expl:`On propage les valeurs de la gauche vers la droite (une porte « 1 » avec un rond inverse le signal) : ${r.txt}. Donc ${F(`S = ${r.S}`)}.`}; }
];

const LOG2=[
  /* équation d'un logigramme */
  ()=>{ const E=rnd(NETS), X=BX(netSrc(E)), W=[], seen=new Set([X.src]);
    shuffle(netMut(E)).forEach(M=>{ const D=BX(netSrc(M)); if(!eqv(D,X)&&!seen.has(D.src)&&!W.some(w=>eqv(w,D))&&W.length<3){ seen.add(D.src); W.push(D); } });
    const rowT=r=>r.lit?BX((r.lit[1]?"!":"")+r.lit[0]).h:`${GN[r.g]} → ${BX(netSrc({rows:[r]})).h}`;
    return {fig:fx_log_net(E),q:"Quelle est l'équation de la sortie S de ce logigramme ?",type:"ch",...mc(`S = ${X.h}`,W.map(D=>`S = ${D.h}`)),
      expl:`On écrit la sortie de chaque porte du premier niveau (${E.rows.map(rowT).join(" ; ")}), puis on les combine par la porte ${GN[E.out]} : ${F(`S = ${X.h}`)}.`}; },
  /* nombre de 1 dans la table (trois variables) */
  ()=>{ const src=draw(()=>rnd(["a*b+c","(a+b)*!c","a*!b+!a*b","!(a*b)*c","(a+c)*(b+!c)","a*b+!b*c","!(a+b)+c","(a^b)*c","!(a*c+b)","a*b+a*c+b*c","!a*!b+c","a*!c+b*c"]),x=>BX(x).vars.length===3), E=BX(src), vs=["a","b","c"], n=ones(E,vs);
    return {data:TT(["a","b","c","S"],combos(3).map(c=>[...c.map(String),"?"])),q:`${F(`S = ${E.h}`)}. Complète la table de vérité : pour combien de lignes S vaut-il 1 ?`,type:"num",ans:n,tolA:0,unit:"lignes",
      expl:`S vaut 1 pour ${lignes(E,vs)}, soit ${F(`${n} lignes`)} sur 8.`}; },
  /* équation à partir d'une table (trois variables) */
  ()=>{ const Lq=["a*b+c","(a+b)*!c","a*!b+b*c","!a*c+a*b","a*!c","!b*c","a+b*c","(a+c)*!b","a^c","!(a+b)","b*!c+a*c"], E=BX(rnd(Lq)), vs=["a","b","c"], W=[];
    shuffle(Lq).forEach(x=>{ const D=BX(x); if(!eqv(D,E)&&W.length<3&&!W.some(w=>eqv(w,D))) W.push(D); });
    const dif=D=>{ const c=combos(3).find(c=>D.f(envOf(vs,c))!==E.f(envOf(vs,c))); return `${D.h} donne ${D.f(envOf(vs,c))} pour (${c.join(", ")})`; };
    return {data:TT(["a","b","c","S"],combos(3).map(c=>[...c.map(String),String(E.f(envOf(vs,c)))])),q:"Quelle équation correspond à cette table de vérité ?",type:"ch",...mc(`S = ${E.h}`,W.map(D=>`S = ${D.h}`)),
      expl:`${F(`S = ${E.h}`)} vaut 1 exactement pour ${lignes(E,vs)}. Les autres diffèrent sur au moins une ligne : ${W.map(dif).join(" ; ")}.`}; },
  /* cahier des charges → équation (trois variables) */
  ()=>{ const C=[["La sirène S sonne quand l'alarme est armée (m = 1) et qu'une porte (p = 1) ou une fenêtre (f = 1) est ouverte.","S","m*(p+f)",["m*p+f","m+p*f","m*p*f"],"« m ET (p OU f) » : la somme p + f est entre parenthèses."],
        ["La presse P descend si les deux boutons g et d sont appuyés et que le carter est fermé (c = 1).","P","g*d*c",["(g+d)*c","g*d+c","g*d*!c"],"Les trois conditions sont nécessaires en même temps : produit de trois variables."],
        ["La porte automatique s'ouvre (O = 1) si une personne est détectée à l'extérieur (e = 1) ou à l'intérieur (i = 1), sauf si le mode verrouillé est actif (v = 1).","O","(e+i)*!v",["e+i*!v","(e+i)*v","e*i*!v"],"« (e OU i) ET PAS v » : parenthèses indispensables autour de e + i."],
        ["La pompe P fonctionne si le programmateur le demande (t = 1) ou si le bouton manuel est appuyé (m = 1), à condition que le niveau haut ne soit pas atteint (h = 0).","P","!h*(t+m)",["!h*t+m","h*(t+m)","!h+t*m"],"« (t OU m) ET PAS h » : la condition sur le niveau porte sur les deux commandes, d'où les parenthèses."],
        ["La lampe L s'allume s'il fait nuit (n = 1) et qu'une présence est détectée (d = 1), ou si l'interrupteur de forçage est enclenché (f = 1).","L","n*d+f",["n*(d+f)","n+d*f","n*d*f"],"« (n ET d) OU f » : le forçage suffit à lui seul."],
        ["Le ventilateur V tourne si la température est haute (t = 1) et que la fenêtre est fermée (f = 0), ou si le mode manuel est actif (m = 1).","V","t*!f+m",["t*(!f+m)","t*f+m","!t*f+m"],"« (t ET PAS f) OU m »."]];
    const [t,s,ok,wr,why]=rnd(C), E=BX(ok), W=noneq(E,wr);
    return {ctx:t,q:"Quelle équation logique traduit ce cahier des charges ?",type:"ch",...mc(`${s} = ${E.h}`,W.map(D=>`${s} = ${D.h}`)),expl:`${why} ${F(`${s} = ${E.h}`)}.`}; },
  /* simplification algébrique */
  ()=>{ const I=[["a+a*b","a",["b","a*b","1"],["a+a*b","a*(1+b)","a"]],["a*(a+b)","a",["a*b","a+b","b"],["a*(a+b)","a*a+a*b","a+a*b","a"]],
        ["a+!a*b","a+b",["a","b","a*b"],["a+!a*b","(a+!a)*(a+b)","a+b"]],["a*b+a*!b","a",["b","a*b","1"],["a*b+a*!b","a*(b+!b)","a*1","a"]],
        ["(a+b)*(a+!b)","a",["b","a+b","0"],["(a+b)*(a+!b)","a+b*!b","a+0","a"]],["a*b+!a*b","b",["a","a*b","1"],["a*b+!a*b","(a+!a)*b","b"]],
        ["!a+a*b","!a+b",["b","!a*b","a+b"],["!a+a*b","(!a+a)*(!a+b)","!a+b"]],["a*(!a+b)","a*b",["b","a","!a*b"],["a*(!a+b)","a*!a+a*b","a*b"]],["a*b+a*b*c","a*b",["a*b*c","c","a+b"],["a*b+a*b*c","a*b*(1+c)","a*b"]]];
    const [src,ok,wr,st]=rnd(I), mp=rnd([["a","b","c"],["x","y","z"],["p","q","r"],["m","n","k"]]), E=BX(renm(src,mp)), K=BX(renm(ok,mp)), W=noneq(E,wr.map(x=>renm(x,mp)));
    return {q:`Simplifie ${F(`S = ${E.h}`)}.`,type:"ch",...mc(`S = ${K.h}`,W.map(D=>`S = ${D.h}`)),
      expl:`${HL(`S = ${st.map(x=>BX(renm(x,mp)).h).join(" = ")}`)}. Règles utilisées : x + x̅ = 1, x·x̅ = 0, 1 + x = 1, x·1 = x, distributivité. Une table de vérité donne les mêmes valeurs pour les deux écritures.`.replace(/x̅/g,ov("x"))}; },
  /* complément par les lois de De Morgan */
  ()=>{ const I=[["!(a+!b)","!a*b",["!a+b","a*!b","!a*!b"],["!(a+!b)","!a*!!b","!a*b"]],["!(a*!b)","!a+b",["!a*b","a+!b","!a+!b"],["!(a*!b)","!a+!!b","!a+b"]],
        ["!(!a*!b)","a+b",["a*b","!a+!b","!(a+b)"],["!(!a*!b)","!!a+!!b","a+b"]],["!(a+b+c)","!a*!b*!c",["!a+!b+!c","a*b*c","!a*!b+!c"],["!(a+b+c)","!a*!b*!c"]],
        ["!(a*b*c)","!a+!b+!c",["!a*!b*!c","a+b+c","!a+!b*!c"],["!(a*b*c)","!a+!b+!c"]],["!(a*b+c)","(!a+!b)*!c",["!a*!b+!c","!a+!b+!c","(!a+!b)*c"],["!(a*b+c)","!(a*b)*!c","(!a+!b)*!c"]]];
    const [src,ok,wr,st]=rnd(I), E=BX(src), K=BX(ok), W=noneq(E,wr);
    return {q:`Grâce aux lois de De Morgan, à quelle expression ${F(`S = ${E.h}`)} est-elle égale ?`,type:"ch",...mc(`S = ${K.h}`,W.map(D=>`S = ${D.h}`)),
      expl:`Le complément d'une somme est le produit des compléments, le complément d'un produit est la somme des compléments ; une double barre s'annule. ${HL(`S = ${st.map(x=>BX(x).h).join(" = ")}`)}.`}; },
  /* condition Python à trois variables */
  ()=>{ const TP=[["({x} or {y}) and {z}",(x,y,z)=>(x||y)&&z,(n,x,y,z)=>`la parenthèse ${n[0]} or ${n[1]} vaut ${PY(x||y)}, puis ${PY(x||y)} and ${PY(z)} vaut ${PY((x||y)&&z)}`],
        ["{x} and not ({y} or {z})",(x,y,z)=>x&&!(y||z),(n,x,y,z)=>`la parenthèse ${n[1]} or ${n[2]} vaut ${PY(y||z)}, not la change en ${PY(!(y||z))}, puis ${PY(x)} and ${PY(!(y||z))} vaut ${PY(x&&!(y||z))}`],
        ["not {x} or ({y} and {z})",(x,y,z)=>!x||(y&&z),(n,x,y,z)=>`not ${n[0]} vaut ${PY(!x)}, la parenthèse ${n[1]} and ${n[2]} vaut ${PY(y&&z)}, puis ${PY(!x)} or ${PY(y&&z)} vaut ${PY(!x||(y&&z))}`],
        ["({x} and not {y}) or {z}",(x,y,z)=>(x&&!y)||z,(n,x,y,z)=>`la parenthèse ${n[0]} and not ${n[1]} vaut ${PY(x&&!y)}, puis ${PY(x&&!y)} or ${PY(z)} vaut ${PY((x&&!y)||z)}`]];
    const N=rnd([["porte","fenetre","armee","Sirène","Calme"],["pluie","vent","auto","Fermer le toit","Rien"],["g","d","carter","Descente","Blocage"],["presence","nuit","auto","Allumer","Éteindre"]]);
    const v=[0,1,2].map(()=>Math.random()<0.5), [tp,f,st]=rnd(TP), ex=tp.replace("{x}",N[0]).replace("{y}",N[1]).replace("{z}",N[2]), r=f(...v);
    return {fig:code(`${N[0]} = ${PY(v[0])}\n${N[1]} = ${PY(v[1])}\n${N[2]} = ${PY(v[2])}\nif ${ex}:\n    print("${N[3]}")\nelse:\n    print("${N[4]}")`),q:"Quel message ce programme affiche-t-il ?",type:"ch",ch:[N[3],N[4]],ok:r?0:1,
      expl:`${cap(st(N,...v))} : la condition est ${r?"vraie":"fausse"}, le programme affiche ${F(N[r?3:4])}. Les parenthèses sont évaluées d'abord, puis not, and et enfin or.`}; },
  /* condition « hors plage » : or et non and, puis équivalence par De Morgan */
  ()=>{ const [nm,v,u,los,his]=rnd([["la température T de l'eau d'un aquarium","T","°C",[23,24,25],[27,28,29]],["la pression p d'un pneu de vélo à assistance","p","bar",[1.8,2,2.2],[2.8,3,3.2]],
        ["l'humidité H de l'air d'une serre","H","%",[35,40,45],[75,80,85]],["la tension U d'une batterie au plomb de 12 V","U","V",[10.5,11,11.5],[14.4,14.6]],["le niveau N d'une cuve de récupération d'eau de pluie","N","%",[10,15,20],[90,95]]]);
    const lo=rnd(los), hi=rnd(his), C=s=>`<code>${ce(s)}</code>`, cond=`${v} < ${lo} or ${v} > ${hi}`, ctx=`Un voyant d'alerte doit s'allumer quand ${nm} sort de la plage de ${nf(lo)} ${u} à ${nf(hi)} ${u} (bornes comprises dans la plage). Le programme compare la mesure ${v} aux deux seuils.`;
    const good=Math.random()<0.5, alt=good?`if not (${v} >= ${lo} and ${v} <= ${hi}):`:`if not (${v} >= ${lo} or ${v} <= ${hi}):`;
    return [{ctx,q:"Quelle condition allume le voyant dans les bons cas ?",type:"ch",...mc(C(`if ${cond}:`),[C(`if ${v} < ${lo} and ${v} > ${hi}:`),C(`if ${v} > ${lo} and ${v} < ${hi}:`),C(`if ${v} > ${lo} or ${v} < ${hi}:`)]),
        expl:`Hors de la plage, c'est trop bas OU trop haut : ${F(ce(cond))}. Avec and, la condition ne serait jamais vraie (une mesure ne peut pas être à la fois sous ${nf(lo)} ${u} et au-dessus de ${nf(hi)} ${u}) ; « ${ce(`${v} > ${lo} and ${v} < ${hi}`)} » décrit l'intérieur de la plage ; « ${ce(`${v} > ${lo} or ${v} < ${hi}`)} » est toujours vraie.`},
      {ctx,q:`Un élève écrit ${C(alt)}. Son voyant s'allume-t-il exactement dans les mêmes cas ?`,type:"ch",ch:YN,ok:good?0:1,
        expl:good?`Oui. De Morgan : ${F("not (A and B) = (not A) or (not B)")}. Ici not (${ce(`${v} >= ${lo}`)}) donne ${ce(`${v} < ${lo}`)} et not (${ce(`${v} <= ${hi}`)}) donne ${ce(`${v} > ${hi}`)} : on retrouve ${ce(cond)}.`
          :`Non. De Morgan : ${F("not (A or B) = (not A) and (not B)")}, soit ${ce(`${v} < ${lo} and ${v} > ${hi}`)}, qui n'est jamais vraie : le voyant ne s'allumerait jamais. Il fallait un and dans la parenthèse.`}]; },
  /* ET avec un masque : valeur décimale */
  ()=>{ const m=rnd([0x0F,0xF0,0x3C,0x0C,0x30,0x81,0x18,0x24,0xC0,0x06]), x=draw(()=>ri(20,250),v=>(v&m)!==0&&(v&m)!==m), r=x&m;
    return {fig:code(`etat = ${bin(x)}\nmasque = ${bin(m)}\nprint(etat & masque)`),data:bitTab([["etat",x],["masque",m],["etat &amp; masque",null]]),ctx:"Chaque bit de l'octet etat correspond à un capteur tout-ou-rien (1 = actif).",
      q:"Quelle valeur ce programme affiche-t-il (en décimal) ?",type:"num",ans:r,tolA:0,unit:"",
      expl:`&amp; fait un ET bit à bit : seuls restent à 1 les bits qui valent 1 à la fois dans etat et dans masque. etat &amp; masque = ${bxt(r)} = ${decTxt(r)} : ce nombre indique quels capteurs surveillés par le masque sont actifs.`}; },
  /* OU exclusif : inverser des LED */
  ()=>{ const x=ri(0,255), m=rnd([0x11,0x81,0x0F,0xF0,0x3C,0x24,0x42,0x18,0x01,0x80]), r=x^m;
    return {data:bitTab([["leds",x],["masque",m]]),ctx:"Les 8 LED d'un robot sont commandées par l'octet leds (bit à 1 : LED allumée).",q:`Que contient leds après l'instruction ${F(`leds = leds ^ ${bin(m)}`)} ?`,type:"ch",grid:true,...mcx(bxt(r),[x|m,x&m,x&(~m&255),(~x)&255].map(bxt)),
      expl:`^ est le OU exclusif bit à bit : les bits placés en face des 1 du masque sont inversés (ces LED changent d'état), les autres ne bougent pas. ${bxt(x)} ^ ${bxt(m)} = ${F(bxt(r))}.`}; },
  /* chronogrammes : nombre d'intervalles où S = 1 */
  ()=>{ const E=BX(rnd(["a*b+c","(a+b)*!c","a*!b+c","!(a*b)*c","(a^b)+c","(a^c)*b","a*b+!c"]));
    const o=draw(()=>{ const a=rbits(8), b=rbits(8), c=rbits(8), S=a.map((_,i)=>E.f({a:a[i],b:b[i],c:c[i]})); return {a,b,c,S,n:S.filter(x=>x).length}; },o=>o.n>=2&&o.n<=6);
    return {fig:fx_log_chrono({sig:[{n:"a",v:o.a},{n:"b",v:o.b},{n:"c",v:o.c}]}),q:`${F(`S = ${E.h}`)}. Dans combien des 8 intervalles S vaut-il 1 ?`,type:"num",ans:o.n,tolA:0,unit:"intervalles",
      expl:`On lit a, b, c dans chaque intervalle et on calcule S : ${o.S.map((x,i)=>`n° ${i+1} : ${x}`).join(" ; ")}. S vaut 1 dans ${F(`${o.n} intervalles`)} (n° ${o.S.map((x,i)=>x?i+1:0).filter(Boolean).join(", ")}).`}; },
  /* robot suiveur de ligne */
  ()=>{ const O=[["MG","!G","du moteur gauche MG",["!D","G*D","G^D"]],["MD","!D","du moteur droit MD",["!G","G*D","!G*!D"]],["B","G*D","du buzzer B",["G+D","G^D","!G*!D"]],["V","G^D","du signal de virage V (1 : le robot tourne)",["G+D","G*D","!G*!D"]]];
    const [s,ok,nm,wr]=rnd(O), E=BX(ok), W=noneq(E,wr), vs=["G","D"];
    return {ctx:"Robot suiveur de ligne : deux capteurs G et D encadrent la ligne noire (1 = le capteur voit la ligne). Aucun capteur ne la voit : les deux moteurs tournent. Seul G la voit : le robot tourne à gauche (moteur gauche MG arrêté, moteur droit MD en marche). Seul D la voit : il tourne à droite (MD arrêté, MG en marche). Les deux la voient (croisement) : les deux moteurs s'arrêtent et le buzzer B sonne.",
      data:TT(["G","D",s],combos(2).map(c=>[String(c[0]),String(c[1]),"?"])),q:`Complète mentalement la table, puis choisis l'équation ${nm}.`,type:"ch",...mc(`${s} = ${E.h}`,W.map(D=>`${s} = ${D.h}`)),
      expl:`Table de ${s} pour (G, D) = (0, 0), (0, 1), (1, 0), (1, 1) : ${combos(2).map(c=>E.f(envOf(vs,c))).join(", ")}. ${s} vaut 1 pour ${lignes(E,vs)} : ${F(`${s} = ${E.h}`)}.`}; },
  /* montages de portes NON-ET ou NON-OU */
  ()=>{ const V=[[{rows:[{g:"NET",in:[["a",0],["a",0]]},{g:"NET",in:[["b",0],["b",0]]}],out:"NET"},"OU (S = a + b)",`Une porte NON-ET dont les deux entrées sont reliées donne le complément : ${ov("a·a")} = ${ov("a")}. La porte de sortie donne ${ov(ov("a")+"·"+ov("b"))} = a + b (De Morgan).`],
        [{rows:[{g:"NOU",in:[["a",0],["a",0]]},{g:"NOU",in:[["b",0],["b",0]]}],out:"NOU"},"ET (S = a·b)",`Une porte NON-OU dont les deux entrées sont reliées donne le complément : ${ov("a + a")} = ${ov("a")}. La porte de sortie donne ${ov(ov("a")+" + "+ov("b"))} = a·b (De Morgan).`],
        [{rows:[{g:"NET",in:[["a",0],["a",0]]}]},`NON (S = ${ov("a")})`,`Les deux entrées reliées reçoivent la même valeur : ${ov("a·a")} = ${ov("a")}. Une porte NON-ET ainsi câblée est un inverseur.`],
        [{rows:[{g:"NET",in:[["a",0],["b",0]]}]},`NON-ET (S = ${ov("a·b")})`,`Une seule porte NON-ET : S = ${ov("a·b")}, qui vaut 0 seulement si a = b = 1.`]];
    const [E,ok,why]=rnd(V), all=["OU (S = a + b)","ET (S = a·b)",`NON (S = ${ov("a")})`,`NON-ET (S = ${ov("a·b")})`,"OU exclusif (S = a ⊕ b)"];
    return {fig:fx_log_net(E),q:"Quelle fonction logique ce montage réalise-t-il ?",type:"ch",...mc(ok,shuffle(all.filter(x=>x!==ok)).slice(0,3)),expl:`${why} Fonction réalisée : ${F(ok.split(" (")[0])}.`}; }
];

const LOG3=[
  /* vote majoritaire deux sur trois */
  ()=>{ const [x,y,z]=rnd([["a","b","c"],["c1","c2","c3"],["p","q","r"]]), E=BX(`${x}*${y}+${y}*${z}+${x}*${z}`), W=noneq(E,[`${x}*${y}*${z}`,`${x}+${y}+${z}`,`${x}^${y}^${z}`]);
    const ctx=`Trois capteurs redondants ${x}, ${y}, ${z} surveillent l'inclinaison d'un drone (1 = défaut détecté). Pour ne pas réagir à la panne d'un seul capteur, la correction C est déclenchée si au moins deux capteurs sur trois signalent un défaut.`;
    return [{ctx,q:"Quelle équation traduit ce vote « deux sur trois » ?",type:"ch",...mc(`C = ${E.h}`,W.map(D=>`C = ${D.h}`)),
        expl:`Il faut au moins une paire de capteurs à 1 : ${x} et ${y}, ou ${y} et ${z}, ou ${x} et ${z}. ${F(`C = ${E.h}`)} vaut 1 pour 4 lignes sur 8. ${x}·${y}·${z} exigerait les trois capteurs, ${x} + ${y} + ${z} réagirait à un seul.`},
      {ctx,q:`Le capteur ${y} tombe en panne et reste bloqué à 1. Quand la correction est-elle alors déclenchée ?`,type:"ch",...mc(`Dès que ${x} ou ${z} signale un défaut`,[`Seulement si ${x} et ${z} signalent tous les deux un défaut`,"Toujours, quel que soit l'état des autres capteurs","Jamais"]),
        expl:`Avec ${y} = 1 : C = ${x}·1 + 1·${z} + ${x}·${z} = ${x} + ${z} + ${x}·${z} = ${F(`${x} + ${z}`)} (absorption). Un seul défaut réel sur ${x} ou ${z} suffit : la redondance est perdue, d'où l'intérêt de détecter la panne de ${y}.`}]; },
  /* moteur de portail : équation puis scénario */
  ()=>{ const E=BX("(t+b)*!f*!o"), W=noneq(E,["t+b*!f*!o","(t+b)*f*o","(t+b)*!(f*o)"]), ctx="Le moteur d'ouverture M d'un portail tourne si l'on appuie sur la télécommande (t = 1) ou sur le bouton du poteau (b = 1), à condition que le portail ne soit pas déjà ouvert (fin de course f = 0) et qu'aucun obstacle ne soit détecté (o = 0).";
    const vs=["t","b","f","o"], v=envOf(vs,draw(()=>combos(4)[ri(0,15)],c=>c[0]+c[1]>=1&&c[2]+c[3]>=1||Math.random()<0.3&&c[0]+c[1]>=1)), M=E.f(v);
    return [{ctx,q:"Quelle équation traduit le fonctionnement du moteur ?",type:"ch",...mc(`M = ${E.h}`,W.map(D=>`M = ${D.h}`)),
        expl:`« (t OU b) ET PAS f ET PAS o » : ${F(`M = ${E.h}`)}. Piège : ${ov("f·o")} = ${ov("f")} + ${ov("o")} (De Morgan) laisserait tourner le moteur malgré un obstacle, portail non ouvert.`},
      {ctx:ctx+` Situation : ${vtxt(vs,v)}.`,q:"Dans cette situation, que fait le moteur ?",type:"ch",ch:["Il tourne (M = 1)","Il reste à l'arrêt (M = 0)"],ok:M?0:1,
        expl:`${bexpl("(t+b)*!f*!o",v).replace(/^S/,"M")} : le moteur ${M?"tourne.":"reste à l'arrêt, car "+lst([...(v.t+v.b?[]:["aucune commande n'est donnée"]),...(v.f?["le portail est déjà ouvert (f = 1)"]:[]),...(v.o?["un obstacle est détecté (o = 1)"]:[])])+". Dans un produit, un seul facteur nul suffit."}`}]; },
  /* première erreur dans une simplification */
  ()=>{ const V=[["!(a*b)*a",[["!a*!b*a"],["!a*a*!b","0*!b"],["0"]],"a*!b",`De Morgan transforme le complément d'un produit en somme des compléments : ${ov("a·b")} = ${ov("a")} + ${ov("b")}, et non ${ov("a")}·${ov("b")}. Il fallait écrire S = (${ov("a")} + ${ov("b")})·a = a·${ov("a")} + a·${ov("b")} = a·${ov("b")}.`],
        ["!(!a*!b)+a*b",[["a+b+a*b"],["a*b+b"],["b*(a+1)","b"]],"a+b",`L'absorption s'écrit a + a·b = a (et non a·b) : S = a + b + a·b = a + b.`],
        ["a*b+!(a+!b)",[["a*b+!a*b"],["b*(a+!a)"],["b*0","0"]],"b",`a + ${ov("a")} vaut 1, et non 0 : S = b·1 = b.`],
        ["!(a*!b)*b",[["(!a+b)*b"],["!a+b*b"],["!a+b"]],"b",`Le facteur b multiplie toute la parenthèse : (${ov("a")} + b)·b = ${ov("a")}·b + b·b = ${ov("a")}·b + b = b (absorption).`],
        ["!(a+b*c)",[["!a*!(b*c)"],["!a*!b*!c"],["!(a+b+c)"]],"!a*(!b+!c)",`Le complément du produit b·c est une somme : ${ov("b·c")} = ${ov("b")} + ${ov("c")}, et non ${ov("b")}·${ov("c")}.`],
        ["a*b+a*!b+!a*!b",[["a*(b+!b)+!a*!b"],["a+!a*!b"],["a+!b"]],"a+!b",`Chaque étape est juste : mise en facteur de a, b + ${ov("b")} = 1, puis a + ${ov("a")}·${ov("b")} = a + ${ov("b")}.`],
        ["a*(!a+b)+!a*b",[["a*!a+a*b+!a*b"],["0+b*(a+!a)"],["b"]],"b",`Chaque étape est juste : développement, a·${ov("a")} = 0 et mise en facteur de b, puis a + ${ov("a")} = 1.`]];
    const [src,st,res,why]=rnd(V), E=BX(src), bad=st.findIndex(s=>!eqv(BX(s[s.length-1]),E)), ok=bad<0?3:bad;
    return {ctx:`Un élève simplifie ${F(`S = ${E.h}`)} :`,data:OL(st.map(s=>`S = ${s.map(x=>BX(x).h).join(" = ")}`)),q:"À quelle étape se trouve sa première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3","Aucune : la simplification est juste"],ok,
      expl:`${why} ${bad<0?"La simplification est juste":`La première erreur est à l'étape ${bad+1}`} ; résultat : ${F(`S = ${BX(res).h}`)}. On peut le vérifier avec une table de vérité.`}; },
  /* simplifier, puis réaliser avec une seule porte */
  ()=>{ const V=[["a*b+a*!b+!a*b","a+b","OU",["a","a*b","!a+!b"],["a*b+a*!b+!a*b","a*(b+!b)+!a*b","a+!a*b","a+b"]],
        ["!a*!b+!a*b+a*!b","!a+!b","NON-ET",["!a*!b","a+b","!a*b"],["!a*!b+!a*b+a*!b","!a*(!b+b)+a*!b","!a+a*!b","!a+!b"]],
        ["a*b*!c+a*b*c","a*b","ET",["a*b*c","a+b","c"],["a*b*!c+a*b*c","a*b*(!c+c)","a*b"]],
        ["!a*!b*c+!a*!b*!c","!a*!b","NON-OU",["!a+!b","a*b","!c"],["!a*!b*c+!a*!b*!c","!a*!b*(c+!c)","!a*!b"]]];
    const [src,ok,g,wr,st]=rnd(V), E=BX(src), K=BX(ok), W=noneq(E,wr), ctx=`Une sortie est décrite par l'équation ${HL(`S = ${E.h}`)}, obtenue en recopiant les lignes à 1 de sa table de vérité.`;
    return [{ctx,q:"Quelle est la forme simplifiée de S ?",type:"ch",...mc(`S = ${K.h}`,W.map(D=>`S = ${D.h}`)),
        expl:`${HL(`S = ${st.map(x=>BX(x).h).join(" = ")}`)}.${src.includes("c")?" La variable c n'a aucune influence sur S.":""}`},
      {ctx,q:"Quelle porte unique suffit alors pour réaliser S ?",type:"ch",...mc(g,["ET","OU","NON-ET","NON-OU","OU exclusif"].filter(x=>x!==g).slice(0,4)),
        expl:`S = ${K.h}${g==="NON-ET"?` = ${ov("a·b")} (De Morgan)`:g==="NON-OU"?` = ${ov("a + b")} (De Morgan)`:""} : une seule porte ${F(g)} au lieu de ${src.split("+").length} portes ET, une porte OU et des inverseurs.`}]; },
  /* Python : and est prioritaire sur or */
  ()=>{ const N=rnd([["porte","fenetre","armee","Sirène","Calme","l'alarme est armée et qu'une porte ou une fenêtre est ouverte"],["pluie","vent","auto","Fermer le toit","Rien","le mode automatique est actif et qu'il pleut ou qu'il y a du vent"],["bouton","telecommande","autorise","Ouvrir","Rien","l'ouverture est autorisée et qu'on appuie sur le bouton ou la télécommande"]]);
    const src=code(`${N[0]} = True\n${N[1]} = False\n${N[2]} = False\nif ${N[0]} or ${N[1]} and ${N[2]}:\n    print("${N[3]}")\nelse:\n    print("${N[4]}")`), ctx=`Cahier des charges : afficher « ${N[3]} » si ${N[5]}.`;
    const C=s=>`<code>if ${s}:</code>`;
    return [{fig:src,ctx,q:"Qu'affiche ce programme ?",type:"ch",...mc(N[3],[N[4]]),
        expl:`En Python, and est prioritaire sur or : la condition est lue ${N[0]} or (${N[1]} and ${N[2]}) = True or False = True. Le programme affiche ${F(N[3])} alors que ${N[2]} vaut False : il ne respecte pas le cahier des charges.`},
      {fig:src,ctx,q:"Quelle condition respecte le cahier des charges ?",type:"ch",...mc(C(`(${N[0]} or ${N[1]}) and ${N[2]}`),[C(`${N[0]} or (${N[1]} and ${N[2]})`),C(`${N[0]} and ${N[1]} or ${N[2]}`),C(`not ${N[2]} or ${N[0]}`)]),
        expl:`Les parenthèses forcent le OU avant le ET : ${F(`(${N[0]} or ${N[1]}) and ${N[2]}`)}. L'écriture ${N[0]} or (${N[1]} and ${N[2]}) est celle que Python applique déjà sans parenthèses : elle garde l'erreur.`}]; },
  /* masque : tester deux bits à la fois */
  ()=>{ const [k1,k2]=draw(()=>[ri(0,7),ri(0,7)],([p,q])=>p<q), m=(1<<k1)|(1<<k2), one=Math.random()<0.5?k1:k2, x=draw(()=>ri(1,255),v=>((v>>k1)&1)+((v>>k2)&1)===1&&((v>>one)&1)===1), r=x&m;
    const C=s=>`<code>${ce(s)}</code>`, fig=code(`x = ${bin(x)}\nprint(x & ${bin(m)})`);
    return [{fig,data:bitTab([["x",x],["masque",m]]),q:"Le masque sélectionne deux bits de x. Quel nombre ce programme affiche-t-il ?",type:"num",ans:r,tolA:0,unit:"",
        expl:`ET bit à bit : seuls restent les bits à 1 à la fois dans x et dans le masque. Ici seul b${one} est commun : ${bxt(r)} = ${F(String(r))}.`},
      {fig,data:bitTab([["x",x],["masque",m]]),q:`On veut agir seulement si les bits b${k2} et b${k1} de x valent tous les deux 1. Quelle condition convient ?`,type:"ch",
        ...mc(C(`if (x & ${bin(m)}) == ${bin(m)}:`),[C(`if x & ${bin(m)}:`),C(`if x | ${bin(m)}:`),C(`if (x & ${bin(m)}) == 0:`)]),
        expl:`x &amp; masque garde b${k2} et b${k1} ; les deux valent 1 seulement si le résultat est égal au masque lui-même. La condition « if x &amp; masque » est vraie dès que le résultat est non nul : avec ce x, elle donnerait ${r} (vrai) alors que b${one===k1?k2:k1} vaut 0. « x | masque » est toujours non nul.`}]; },
  /* chronogrammes : retrouver l'équation */
  ()=>{ const Lq=["a*b+c","(a+b)*!c","a*!b+c","!(a*b)*c","(a^b)*c","a*b+!c","a+b*c","!a*c+b"];
    const o=draw(()=>{ const E=BX(rnd(Lq)), a=rbits(8), b=rbits(8), c=rbits(8), val=D=>a.map((_,i)=>D.f({a:a[i],b:b[i],c:c[i]})), S=val(E);
        const W=shuffle(Lq.map(BX).filter(D=>val(D).join("")!==S.join(""))).slice(0,3); return {E,a,b,c,S,W,val}; },o=>o.W.length===3&&o.S.some(x=>x)&&o.S.some(x=>!x));
    const dif=D=>{ const d=o.val(D), i=d.findIndex((x,j)=>x!==o.S[j]); return `${D.h} donnerait ${d[i]} dans l'intervalle n° ${i+1}, où S vaut ${o.S[i]}`; };
    return {fig:fx_log_chrono({sig:[{n:"a",v:o.a},{n:"b",v:o.b},{n:"c",v:o.c},{n:"S",v:o.S}]}),q:"Quelle équation la sortie S vérifie-t-elle dans tous les intervalles ?",type:"ch",...mc(`S = ${o.E.h}`,o.W.map(D=>`S = ${D.h}`)),
      expl:`${F(`S = ${o.E.h}`)} redonne S dans les 8 intervalles. Pour éliminer une équation, un seul intervalle suffit : ${o.W.map(dif).join(" ; ")}.`}; },
  /* porte manquante dans un logigramme */
  ()=>{ const o=draw(()=>{ const E=rnd(NETS.filter(e=>e.rows.length>=2)), gi=E.rows.map((r,i)=>r.g?i:-1).filter(i=>i>=0), pick=Math.random()<0.4?-1:rnd(gi), X=BX(netSrc(E)), g0=pick<0?E.out:E.rows[pick].g;
        const alt=["ET","OU","OUX","NET","NOU"].filter(g=>g!==g0).filter(g=>{ const e=JSON.parse(JSON.stringify(E)); if(pick<0) e.out=g; else e.rows[pick].g=g; return !eqv(BX(netSrc(e)),X); });
        return {E,pick,X,g0,alt}; },o=>o.alt.length>=3);
    return {fig:fx_log_net(o.E,o.pick<0?{qOut:true}:{qRow:o.pick}),q:`Quelle porte faut-il placer à la place du « ? » pour obtenir ${F(`S = ${o.X.h}`)} ?`,type:"ch",...mc(GN[o.g0],shuffle(o.alt).slice(0,3).map(g=>GN[g])),
      expl:`On écrit l'équation obtenue avec chaque porte possible : seule la porte ${F(GN[o.g0])} redonne S = ${o.X.h}. Par exemple, ${(()=>{ const alt=o.alt.map(g=>{ const e=JSON.parse(JSON.stringify(o.E)); if(o.pick<0) e.out=g; else e.rows[o.pick].g=g; return [g,BX(netSrc(e))]; }), vs=o.X.vars, [g,D]=alt.find(([,D])=>{ const n=ones(D,vs); return n>0&&n<2**vs.length&&!/!\(/.test(D.src); })||alt[0]; return `avec une porte ${GN[g]}, on obtiendrait S = ${D.h}`; })()}.`}; },
  /* bit de parité par OU exclusif */
  ()=>{ const w=draw(()=>Array.from({length:4},()=>ri(0,1)),a=>a.some(x=>x)&&!a.every(x=>x)), P=w.reduce((s,x)=>s^x,0), n1=w.filter(x=>x).length, k=ri(1,2);
    const fl=shuffle([0,1,2,3]).slice(0,k), rc=w.map((x,i)=>fl.includes(i)?1-x:x), P2r=rc.reduce((s,x)=>s^x,0);
    const ctx="Pour contrôler une transmission, on ajoute au mot de 4 bits b3 b2 b1 b0 un bit de parité P = b3 ⊕ b2 ⊕ b1 ⊕ b0.";
    return [{ctx,q:`Mot à transmettre : ${w.join(" ")}. Que vaut P ?`,type:"ch",ch:["P = 0","P = 1"],ok:P,
        expl:`Le OU exclusif de plusieurs bits vaut 1 si le nombre de 1 est impair. Ici ${n1} bit${n1>1?"s":""} à 1 : ${F(`P = ${P}`)}.`},
      {ctx,q:`Pendant la transmission, ${k===1?"un bit du mot est inversé":"deux bits du mot sont inversés"} (P arrive intact) : le récepteur reçoit ${rc.join(" ")}. Il recalcule le OU exclusif des 4 bits et le compare à P. L'erreur est-elle détectée ?`,type:"ch",ch:YN,ok:P2r!==P?0:1,
        expl:`Parité recalculée : ${rc.join(" ⊕ ")} = ${P2r}, P reçu = ${P}. ${P2r!==P?"Les deux diffèrent : l'erreur est détectée (un bit inversé change la parité du nombre de 1).":"Les deux sont égaux : l'erreur passe inaperçue. Deux inversions ne changent pas la parité du nombre de 1 ; un seul bit de parité ne détecte qu'un nombre impair d'erreurs."}`}]; },
  /* commande bimanuelle : OU câblé à la place d'un ET */
  ()=>{ const [mach,act]=rnd([["d'une presse","la presse descend"],["d'une cisaille","la lame descend"],["d'un massicot","la lame coupe"],["d'une plieuse de tôle","le tablier se relève"]]), E={rows:[{g:"OU",in:[["d",0],["g",0]]},{lit:["c",0]}],out:"ET"};
    return {fig:fx_log_net(E),ctx:`Commande ${mach} : cahier des charges P = g·d·c (boutons gauche g et droit d appuyés, carter fermé c = 1 ; P = 1 : ${act}). Un élève a câblé ce logigramme.`,
      q:"Dans quelle situation son montage est-il dangereux ?",type:"ch",...mc(`Un seul bouton appuyé, carter fermé : ${act} alors qu'une main peut être dans la zone`,[`Les deux boutons appuyés, carter fermé : rien ne se passe`,`Carter ouvert : ${act}`,`Aucun bouton appuyé : ${act}`]),
      expl:`Le montage réalise ${F("P = (d + g)·c")} : avec g = 1, d = 0, c = 1, P = 1 alors que le cahier des charges impose P = 0. La commande bimanuelle impose un ET entre g et d : l'opérateur a les deux mains sur les boutons, donc hors de la zone dangereuse.`}; },
  /* variable sans influence, puis équation la plus simple */
  ()=>{ const Lq=["a*b","a*!c","!b*c","a+c","b^c","!a+b","a^b","!a*c","b+!c"], E=BX(rnd(Lq)), vs=["a","b","c"], out=vs.find(x=>!E.vars.includes(x)), W=[];
    shuffle(Lq).forEach(x=>{ const D=BX(x); if(!eqv(D,E)&&W.length<3&&!W.some(w=>eqv(w,D))) W.push(D); });
    const data=TT(["a","b","c","S"],combos(3).map(c=>[...c.map(String),String(E.f(envOf(vs,c)))]));
    return [{data,q:"Une des trois variables n'a aucune influence sur S. Laquelle ?",type:"ch",ch:["a","b","c","Les trois variables interviennent"],ok:vs.indexOf(out),
        expl:`On compare les lignes qui ne diffèrent que par ${out} : S y prend toujours la même valeur. ${out} n'intervient donc pas : ${F(`S = f(${E.vars.join(", ")})`)}.`},
      {data,q:"Quelle est l'équation la plus simple de S ?",type:"ch",...mc(`S = ${E.h}`,W.map(D=>`S = ${D.h}`)),
        expl:`En ignorant ${out}, S vaut 1 pour (${E.vars.join(", ")}) = ${combos(2).filter(c=>E.f(envOf(E.vars,c))).map(c=>`(${c.join(", ")})`).join(", ")} : ${F(`S = ${E.h}`)}.`}]; },
  /* masque pour éteindre une LED */
  ()=>{ const k=ri(0,7), m=255^(1<<k), x=draw(()=>ri(1,255),v=>((v>>k)&1)===1&&v!==(1<<k)), r=x&m, C=s=>`<code>${ce(s)}</code>`, ctx="Les 8 LED d'un robot sont commandées par l'octet leds (bit à 1 : LED allumée).";
    return [{ctx,q:`Quelle instruction éteint la LED du bit b${k} sans modifier les autres, quel que soit son état ?`,type:"ch",...mc(C(`leds = leds & ${bin(m)}`),[C(`leds = leds | ${bin(1<<k)}`),C(`leds = leds ^ ${bin(1<<k)}`),C(`leds = leds & ${bin(1<<k)}`)]),
        expl:`Un ET avec 0 force à 0, un ET avec 1 ne change rien : le masque ${bxt(m)} a un seul 0, en face de b${k}. Le OU (|) allumerait la LED, le OU exclusif (^) l'inverserait (il l'allumerait si elle était éteinte), le ET avec ${bxt(1<<k)} éteindrait toutes les autres.`},
      {ctx,data:bitTab([["leds",x],["masque",m]]),q:`leds vaut ${bin(x)}. Que vaut leds après cette instruction (en décimal) ?`,type:"num",ans:r,tolA:0,unit:"",
        expl:`${bxt(x)} &amp; ${bxt(m)} = ${bxt(r)} = ${decTxt(r)}. Seul b${k} est passé à 0.`}]; }
];

POOLS["info-logique"]={
  titre:"Portes, tables et équations",
  fiche:{t:"Logique booléenne",l:[
    `${F("a·b")} (ET, symbole &amp;) vaut 1 si a = b = 1 ; ${F("a + b")} (OU, symbole ≥1) vaut 1 si au moins une entrée vaut 1 ; ${F("a ⊕ b")} (OU exclusif, =1) vaut 1 si elles diffèrent.`,
    `NON : ${F(ov("a"))} ; NON-ET : ${F(ov("a·b"))} ; NON-OU : ${F(ov("a + b"))} ; sur un logigramme, un rond en sortie de porte inverse le signal.`,
    `De Morgan : ${F(`${ov("a·b")} = ${ov("a")} + ${ov("b")}`)} et ${F(`${ov("a + b")} = ${ov("a")}·${ov("b")}`)} ; absorption : ${F("a + a·b = a")}.`,
    `Octet x, masque m : ${F("x &amp; m")} garde les bits de x en face des 1 de m (les autres passent à 0), ${F("x | m")} force ces bits à 1, ${F("x ^ m")} les inverse.`,
    `Pièges : n variables donnent 2<sup>n</sup> lignes ; le OU vaut aussi 1 quand les deux entrées valent 1 ; ${ov("a·b")} n'est pas ${ov("a")}·${ov("b")} ; en Python, and passe avant or : mets des parenthèses.`]},
  count:{1:4,2:4,3:3},1:LOG1,2:LOG2,3:LOG3
};

/* ======================================================================
   OPTIQUE, PHOTON (phy-optique)
   ====================================================================== */
/* constantes données dans les énoncés ; λ en nm, E en J ou en eV */
const Hp=6.63e-34, Cl=3.00e8, QE=1.60e-19, HC=Hp*Cl, ME=9.11e-31;
const EJ=l=>HC/(l*1e-9), EeV=l=>HC/(l*1e-9)/QE, LnE=E=>HC/(E*QE)*1e9;
const KH=`h = 6,63 × ${p10(-34)} J·s`, KC=`c = 3,00 × ${p10(8)} m/s`, KE=`1 eV = 1,60 × ${p10(-19)} J`, KM=`masse de l'électron m = 9,11 × ${p10(-31)} kg`;
const DON=(...k)=>`Données : ${k.join(" ; ")}.`;
/* x = m × 10^k, m arrondie à 3 chiffres significatifs entre 1 et 10 */
const kOf=x=>{ let k=Math.floor(Math.log10(Math.abs(x))); if(Number((x/10**k).toPrecision(3))>=10) k++; return k; };
const SC=(x,u,k)=>{ k=k==null?kOf(x):k; const m=Number((x/10**k).toPrecision(3)); return `${nfd(m,Math.max(0,2-Math.floor(Math.log10(Math.abs(m))+1e-12)))} × ${p10(k)}${u?" "+u:""}`; };
const UK=(k,u)=>`× ${p10(k)} ${u}`;
/* λ en m, écrite en puissance de dix : 650 nm → 6,50 × 10⁻⁷ (m) */
const lamV=l=>`${nfd(l/10**kOf(l),2)} × ${p10(kOf(l)-9)}`, lamM=l=>lamV(l)+" m";
const domOf=l=>l<400?"UV":l<=800?"visible":"IR";
const DOMS=["Ultraviolet (UV)","Visible","Infrarouge (IR)"], DOMI={UV:0,visible:1,IR:2}, DOMN=["ultraviolet","visible","infrarouge"], domN=l=>DOMN[DOMI[domOf(l)]];
/* couleurs de la lumière visible (bornes en nm) */
const COUL=[["violet",400,450],["bleu",450,500],["vert",500,570],["jaune-orangé",570,620],["rouge",620,800]];
const coulOf=l=>(COUL.find(c=>l>=c[1]&&l<c[2])||["?"])[0];
const coulTab=()=>TT(["Couleur","λ (nm)"],COUL.map(c=>[c[0],`${c[1]} à ${c[2]}`]));
/* λ au cœur d'une bande de couleur (à plus de 3 % des bornes) */
const coreCoul=(l,c)=>l>=c[1]*1.03&&l<=c[2]/1.03;

/* couleur approchée d'une radiation visible (dessin du spectre) */
function wl2rgb(w){
  let r=0,g=0,b=0;
  if(w<440){ r=(440-w)/60; b=1; } else if(w<490){ g=(w-440)/50; b=1; } else if(w<510){ g=1; b=(510-w)/20; }
  else if(w<580){ r=(w-510)/70; g=1; } else if(w<645){ r=1; g=(645-w)/65; } else r=1;
  const f=w<420?0.35+0.65*(w-380)/40:w>700?Math.max(0.25,0.35+0.65*(780-w)/80):1, c=v=>Math.round(255*Math.pow(Math.max(0,Math.min(1,v))*f,0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
/* trait lisible sur fond coloré : liseré couleur papier puis trait d'encre */
const Lh=(x1,y1,x2,y2,cls)=>`<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" style="stroke:var(--paper);stroke-width:5"/>`+L(x1,y1,x2,y2,cls||"v-ink");

/* ===== figures : optique (préfixe fx_opt_) ===== */
/* spectre de 200 à 1 200 nm (o.l1 : autre borne haute) : UV, visible (en couleurs), IR ; o.mk : repères [{l, n}] ; o.qd : domaine dont le nom est caché (0 UV, 1 visible, 2 IR) ;
   o.cut : {l, t} limite annotée */
function fx_opt_spectre(o){
  o=o||{}; const L0=200, L1=o.l1||1200, X0=20, W=360, px=l=>X0+(l-L0)*W/(L1-L0), y0=52, h=24, ya=86;
  let s=`<rect x="${X0}" y="${y0}" width="${(px(400)-X0).toFixed(1)}" height="${h}" class="v-body"/><rect x="${px(800).toFixed(1)}" y="${y0}" width="${(X0+W-px(800)).toFixed(1)}" height="${h}" class="v-body"/>`;
  for(let l=400;l<800;l+=5) s+=`<rect x="${px(l).toFixed(1)}" y="${y0}" width="${(px(l+5)-px(l)+0.5).toFixed(1)}" height="${h}" style="fill:${wl2rgb(l+2.5)}"/>`;
  s+=`<rect x="${X0}" y="${y0}" width="${W}" height="${h}" class="v-thin"/>`;
  [400,800].forEach(l=>{ s+=L(px(l),y0-6,px(l),ya,"v-ink"); });
  s+=L(X0,ya,X0+W+12,ya,"v-ink","k");
  for(let l=L0;l<=L1;l+=100) s+=L(px(l),ya,px(l),ya+5,"v-ink")+(l%200===0&&l<L1?T(px(l),ya+19,nf(l,0),"v-lab s","middle"):"");
  s+=T(398,ya+19,"λ (nm)","v-cap","end");
  [[L0,400,"UV"],[400,800,"visible"],[800,L1,"IR"]].forEach(([a,b,t],i)=>{ const q=o.qd===i, xa=px(a)+4, xb=px(b)-4, yb=ya+32;
    s+=`<polyline points="${xa.toFixed(1)},${yb-5} ${xa.toFixed(1)},${yb} ${xb.toFixed(1)},${yb} ${xb.toFixed(1)},${yb-5}" class="v-thin"/>`+T((xa+xb)/2,yb+16,q?"?":t,q?"v-lab c":"v-smb","middle"); });
  const last=[-99,-99];
  (o.mk||[]).slice().sort((a,b)=>a.l-b.l).forEach(m=>{ const x=px(m.l), row=x-last[0]<30?1:0; last[row]=x; const yc=row?12:34;
    s+=Lh(x,yc+11,x,y0+h)+numLab(x,yc,m.n); });
  if(o.cut){ const x=px(o.cut.l); s+=Lh(x,y0-16,x,ya,"v-t")+Th(x+(o.cut.a==="end"?-6:6),y0-18,esc(o.cut.t),"v-lab c",o.cut.a||"start"); }
  return svg(ya+54,s,o.alt||"Spectre de la lumière : ultraviolet, visible et infrarouge, longueurs d'onde en nanomètres");
}
/* effet photoélectrique : Ec,max des électrons émis en fonction de la fréquence f (en 10^14 Hz) ;
   o.nu0 : fréquence seuil, o.h : pente (J·s, h par défaut), o.xmax, o.ymax (eV), o.neg : prolongement jusqu'à f = 0, o.pts : mesures [[f, Ec]], o.line === false : sans droite */
function fx_opt_ec(o){
  const sl=(o.h||Hp)*1e14/QE, w0=sl*o.nu0, ymin=o.neg?-Math.ceil(w0*2)/2:0, ymax=o.ymax, X0=58, Yt=16, W=312, H=o.neg?186:160;
  const px=v=>X0+v*W/o.xmax, py=v=>Yt+(ymax-v)*H/(ymax-ymin), yb=Yt+H;
  let s="";
  for(let v=0;v<=o.xmax+1e-9;v+=0.5) s+=L(px(v),Yt,px(v),yb,"v-grid");
  for(let v=ymin;v<=ymax+1e-9;v+=0.5) s+=L(X0,py(v),X0+W,py(v),"v-grid");
  const st=o.xmax>12?2:1;
  for(let v=0;v<=o.xmax+1e-9;v+=st) s+=T(px(v),yb+16,nf(v,0),"v-lab s","middle");
  const sy=ymax-ymin>4?1:0.5;
  for(let v=Math.ceil(ymin/sy-1e-9)*sy;v<=ymax+1e-9;v+=sy) s+=T(X0-6,py(v)+4,(v<-1e-9?"−":"")+nf(Math.abs(v),1),"v-lab s","end");
  s+=L(X0,py(0),X0+W+12,py(0),"v-ink","k")+L(X0,yb,X0,Yt-10,"v-ink","k");
  if(o.line!==false){ s+=L(px(o.nu0),py(0),px(o.xmax),py(sl*(o.xmax-o.nu0)),"v-curve");
    if(o.neg) s+=`<line x1="${px(0).toFixed(1)}" y1="${py(-w0).toFixed(1)}" x2="${px(o.nu0).toFixed(1)}" y2="${py(0).toFixed(1)}" class="v-curve" style="stroke-dasharray:6 5"/>`; }
  (o.pts||[]).forEach(p=>{ s+=`<circle cx="${px(p[0]).toFixed(1)}" cy="${py(p[1]).toFixed(1)}" r="4.5" class="v-dot"/>`; });
  s+=T(X0+W+12,yb+34,`f (× 10¹⁴ Hz)`,"v-cap","end")+T(X0+6,Yt-4,"Ec,max (eV)","v-cap");
  return svg(yb+42,s,o.alt||"Énergie cinétique maximale des électrons émis en fonction de la fréquence de la lumière");
}
/* spectre d'émission d'une LED : intensité relative en fonction de λ ; o.lp : pic (nm), o.w : largeur à mi-hauteur (nm) */
function fx_opt_led(o){
  const l0=Math.floor((o.lp-150)/50)*50, l1=l0+300, X0=46, Y0=192, W=330, H=158, px=l=>X0+(l-l0)*W/(l1-l0), py=v=>Y0-v*H;
  let s="";
  for(let l=l0;l<=l1;l+=25) s+=L(px(l),Y0,px(l),Y0-H-4,"v-grid")+(l%50===0?T(px(l),Y0+16,String(l),"v-lab s","middle"):"");
  for(let v=0;v<=1.001;v+=0.25) s+=L(X0,py(v),X0+W,py(v),"v-grid")+(v*2===Math.round(v*2)?T(X0-6,py(v)+4,nf(v,1),"v-lab s","end"):"");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-16,"v-ink","k");
  const pts=[]; for(let l=l0;l<=l1+1e-9;l+=2) pts.push(P2([px(l),py(Math.exp(-4*Math.LN2*((l-o.lp)/o.w)**2))]));
  s+=`<polyline points="${pts.join(" ")}" class="v-curve"/>`;
  s+=T(X0+W+12,Y0+34,"λ (nm)","v-cap","end")+T(X0+8,Y0-H-8,"intensité lumineuse relative","v-cap");
  return svg(Y0+40,s,o.alt||"Spectre d'émission d'une LED : intensité relative en fonction de la longueur d'onde");
}
/* onde lumineuse stylisée (photon) de (x1, y) vers (x2, y), avec pointe de flèche */
function wavy(x1,x2,y){ const d=x2>x1?1:-1, n=Math.floor(Math.abs(x2-x1-d*10)/2), pts=[]; for(let i=0;i<=n;i++){ const x=x1+d*2*i; pts.push(P2([x,y+6*Math.sin(2*Math.PI*i*2/16)])); }
  return `<polyline points="${pts.join(" ")}" class="v-t" style="stroke-width:2"/>`+`<line x1="${(x2-d*10).toFixed(1)}" y1="${y}" x2="${x2}" y2="${y}" class="v-t" style="stroke-width:2" marker-end="url(#m-c)"/>`; }
/* semi-conducteur : bandes de valence et de conduction séparées par Eg ; o.mode "abs" (photon absorbé : cellule PV, photodiode) ou "em" (photon émis : LED) ; o.eg : valeur affichée */
function fx_opt_bandes(o){
  const x1=120, x2=300, xe=264; let s="";
  s+=`<rect x="${x1}" y="24" width="${x2-x1}" height="34" class="v-body"/>`+T(x1+8,45,"bande de conduction","v-smb");
  s+=`<rect x="${x1}" y="150" width="${x2-x1}" height="34" class="v-body"/>`+T(x1+8,171,"bande de valence","v-smb");
  s+=`<line x1="${x2+20}" y1="58" x2="${x2+20}" y2="150" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+T(x2+27,100,"Eg","v-lab")+T(x2+27,118,esc(o.eg||""),"v-lab s");
  const el=(y,f)=>`<circle cx="${xe}" cy="${y}" r="6" class="${f?"v-dot":"v-box"}"/>`;
  if(o.mode==="em"){ s+=L(xe,50,xe,146,"v-n","a")+el(41,1)+el(167,0)+wavy(246,14,104)+T(110,90,"photon émis","v-cap","middle")+T(110,128,"E = h·f","v-lab s","middle"); }
  else { s+=L(xe,158,xe,62,"v-n","a")+el(167,0)+el(41,1)+wavy(14,246,104)+T(110,90,"photon absorbé","v-cap","middle")+T(110,128,"E = h·f","v-lab s","middle"); }
  return svg(196,s,o.alt||(o.mode==="em"?"Émission d'un photon lors du passage d'un électron de la bande de conduction à la bande de valence":"Absorption d'un photon qui fait passer un électron de la bande de valence à la bande de conduction"));
}

/* sources de lumière : description, λ (nm) */
const SRC=[["un pointeur laser rouge",650],["un pointeur laser vert",532],["une LED bleue d'éclairage",460],["le laser violet d'un lecteur de disques Blu-ray",405],
  ["la LED infrarouge d'une télécommande",940],["une lampe UV-C de désinfection de l'eau",254],["le laser d'une liaison par fibre optique",1550],
  ["une LED UV de polymérisation de résine",385],["le laser infrarouge d'un lidar",905],["une LED rouge de feu arrière de vélo",625],["une LED verte de feu tricolore",505],["une LED ambre de clignotant",590]];
/* métaux : nom, travail d'extraction (eV), « du … », « de … » */
const MET=[["césium",2.1,"du césium","de césium"],["potassium",2.3,"du potassium","de potassium"],["sodium",2.4,"du sodium","de sodium"],["calcium",2.9,"du calcium","de calcium"],["aluminium",4.1,"de l'aluminium","d'aluminium"],["zinc",4.3,"du zinc","de zinc"],["cuivre",4.7,"du cuivre","de cuivre"]];
/* semi-conducteurs de cellules photovoltaïques : nom, gap (eV) */
const SEM=[["silicium cristallin",1.12],["arséniure de gallium (GaAs)",1.42],["tellurure de cadmium (CdTe)",1.45],["silicium amorphe",1.70],["germanium",0.66],["CIGS (cuivre, indium, gallium, sélénium)",1.15]];
const NHC=`6,63 × ${p10(-34)} × 3,00 × ${p10(8)}`, EQE=`E = ${FRAC("h·c","λ")}`;
/* puissance lisible : W, mW ou µW */
const pw=P=>P>=1?`${S3(P)} W`:P>=1e-3?`${S3(P*1e3)} mW`:`${S3(P*1e6)} µW`;
/* choix d'un sous-ensemble (lettres ou noms) : bonne réponse, complément, tout, et variantes à un élément près */
function subsetCh(names,yes){ const ok=lst(names.filter((_,i)=>yes[i])), wr=[lst(names.filter((_,i)=>!yes[i])),lst(names)];
  names.forEach((_,i)=>{ const t=names.filter((_,j)=>j===i?!yes[j]:yes[j]); if(t.length) wr.push(lst(t)); });
  const m=mcx(ok,shuffle(wr.slice(2)).concat(wr.slice(0,2)).reverse()); return {ch:m.ch.map(cap),ok:m.ok}; }
/* questions de cours : énoncé, bonne réponse, distracteurs, correction */
const COURS=[
  ["On double la puissance lumineuse d'un laser qui extrait déjà des électrons d'une plaque métallique, sans changer sa longueur d'onde. Qu'est-ce qui change ?","Le nombre d'électrons extraits par seconde double ; leur énergie cinétique maximale ne change pas",
    ["L'énergie cinétique maximale des électrons double","L'énergie de chaque photon double","Rien ne change : la longueur d'onde est la même"],
    `La puissance fixe le nombre de photons par seconde, ${F(`N = ${FRAC("P","E")}`)}, pas l'énergie de chacun (${EQE}). Chaque photon extrait au plus un électron, avec ${F("Ec,max = E − W₀")} inchangée.`],
  ["Une lumière rouge très intense n'extrait aucun électron d'une plaque de zinc, alors qu'une faible lumière ultraviolette y parvient. Pourquoi ?","Un électron est extrait par un seul photon, dont l'énergie doit atteindre le travail d'extraction, quelle que soit la puissance",
    ["La lumière rouge est absorbée par l'air avant d'atteindre la plaque","Il faudrait éclairer la plaque plus longtemps pour accumuler assez d'énergie","Le zinc ne conduit pas l'électricité"],
    `Il faut ${F("E ≥ W₀")} pour chaque photon. Les photons UV (λ courte) sont plus énergétiques que les photons rouges ; augmenter la puissance augmente leur nombre, pas leur énergie.`],
  ["Dans une cellule photovoltaïque de gap Eg, que devient l'énergie d'un photon absorbé d'énergie E supérieure à Eg ?","Une partie, égale à Eg, fait passer un électron dans la bande de conduction ; l'excédent E − Eg est perdu en chaleur",
    ["Elle est entièrement convertie en énergie électrique","Le photon fait passer plusieurs électrons dans la bande de conduction","Le photon est réfléchi, car son énergie est trop grande"],
    `Au mieux, chaque photon absorbé fournit ${F("Eg")} à un électron ; le surplus ${F("E − Eg")} échauffe la cellule. C'est une des raisons du rendement limité des cellules.`],
  ["Un photon infrarouge d'énergie inférieure au gap Eg du silicium arrive sur une cellule photovoltaïque. Que se passe-t-il ?","Il n'est pas absorbé par le silicium et ne produit aucun courant",
    ["Il est absorbé et produit un courant plus faible","Il est absorbé si la cellule est assez éclairée","Il fait passer un électron à mi-chemin, dans le gap"],
    `Il faut ${F("E ≥ Eg")} pour faire passer un électron de la bande de valence à la bande de conduction : aucun état n'existe dans le gap. Ce photon traverse la cellule sans produire de courant.`],
  ["Que représente le travail d'extraction W₀ d'un métal ?","L'énergie minimale qu'il faut fournir pour arracher un électron au métal",
    ["L'énergie cinétique des électrons extraits","L'énergie d'un photon de lumière visible","La puissance lumineuse minimale à envoyer sur le métal"],
    `Un photon d'énergie E extrait un électron si ${F("E ≥ W₀")} ; l'excédent devient de l'énergie cinétique, au plus ${F("Ec,max = E − W₀")}.`],
  ["D'où vient la lumière émise par une LED ?","Un électron passe de la bande de conduction à la bande de valence et libère un photon d'énergie voisine de Eg",
    ["Un filament chauffé par le courant rayonne","Un photon absorbé fait passer un électron dans la bande de conduction","Le semi-conducteur réfléchit la lumière ambiante"],
    `Chaque recombinaison d'un électron de la bande de conduction avec un trou de la bande de valence libère un photon d'énergie E ≈ Eg, d'où ${F(`λ ≈ ${FRAC("h·c","Eg")}`)}. Le phénomène inverse, l'absorption, est celui de la cellule photovoltaïque.`]];

const OPT1=[
  /* énergie d'un photon en joules */
  ()=>{ const [d,l]=rnd(SRC), E=EJ(l);
    return {ctx:`${cap(d)} émet une lumière de longueur d'onde λ = ${nf(l,0)} nm. ${DON(KH,KC)}`,q:`Calcule l'énergie E d'un photon de cette lumière, en ${p10(-19)} J.`,type:"num",ans:E/1e-19,tolR:0.02,unit:UK(-19,"J"),
      expl:`${F(EQE)} avec λ en mètres : λ = ${nf(l,0)} nm = ${lamM(l)}. E = ${FRAC(NHC,lamV(l))} = ${F(SC(E,"J",-19))}.`}; },
  /* conversion joule ↔ électronvolt */
  ()=>{ const [d,l]=rnd(SRC), Ej=Number((EJ(l)/1e-19).toFixed(2))*1e-19, Ev=Number(EeV(l).toFixed(2));
    if(Math.random()<0.5) return {ctx:`Un photon émis par ${d} transporte une énergie E = ${SC(Ej,"J",-19)}. ${DON(KE)}`,q:"Exprime cette énergie en électronvolts.",type:"num",ans:Ej/QE,tolR:0.02,unit:"eV",
      expl:`1 eV = 1,60 × ${p10(-19)} J, donc on divise : ${F(`E(eV) = ${FRAC("E(J)",`1,60 × ${p10(-19)}`)}`)} = ${FRAC(SC(Ej,"",-19),`1,60 × ${p10(-19)}`)} = ${U(Ej/QE,"eV")}.`};
    return {ctx:`Un photon émis par ${d} transporte une énergie E = ${nfd(Ev,2)} eV. ${DON(KE)}`,q:`Exprime cette énergie en joules, en ${p10(-19)} J.`,type:"num",ans:Ev*1.6,tolR:0.02,unit:UK(-19,"J"),
      expl:`1 eV = 1,60 × ${p10(-19)} J, donc on multiplie : ${F(`E(J) = E(eV) × 1,60 × ${p10(-19)}`)} = ${nfd(Ev,2)} × 1,60 × ${p10(-19)} = ${F(SC(Ev*QE,"J",-19))}.`}; },
  /* domaine du spectre, longueur d'onde dans diverses unités */
  ()=>{ const V=[[254,"nm"],[0.365,"µm"],[3.1e-7,"m"],[532,"nm"],[0.65,"µm"],[4.5e-7,"m"],[940,"nm"],[1.55,"µm"],[1.06e-6,"m"],[10.6,"µm"],[850,"nm"],[7.0e-7,"m"],[0.3,"µm"],[2.8e-7,"m"],[0.47,"µm"],[1310,"nm"],[365,"nm"],[5.9e-7,"m"],[0.9,"µm"],[620,"nm"]];
    const [v,u]=rnd(V), l=Math.round(u==="nm"?v:u==="µm"?v*1000:v*1e9), dm=domOf(l), txt=u==="m"?`${sci(v,2)} m`:`${nf(v,3)} ${u}`;
    const conv=u==="nm"?"":u==="µm"?`1 µm = 1 000 nm, donc λ = ${nf(v,3)} × 1 000 = ${nf(l,0)} nm. `:`1 m = ${p10(9)} nm, donc λ = ${sci(v,2)} × ${p10(9)} = ${nf(l,0)} nm. `;
    return {fig:fx_opt_spectre({}),q:`Dans quel domaine se situe une radiation de longueur d'onde λ = ${txt} ?`,type:"ch",ch:DOMS,ok:DOMI[dm],
      expl:`${conv}${l<400?"λ &lt; 400 nm":l<=800?"400 nm ≤ λ ≤ 800 nm":"λ > 800 nm"} : domaine ${F(domN(l))}.`}; },
  /* choisir la bonne relation */
  ()=>{ const R=rnd([
      ["Quelle relation donne l'énergie E d'un photon en fonction de la longueur d'onde λ de la radiation ?",EQE,[`E = ${FRAC("h·λ","c")}`,"E = h·c·λ",`E = ${FRAC("λ","h·c")}`],`E est inversement proportionnelle à λ : plus la longueur d'onde est courte, plus le photon est énergétique. Unités : ${FRAC("J·s × m/s","m")} = J.`],
      ["Quelle relation lie l'énergie E d'un photon à la fréquence f de la radiation ?","E = h·f",[`E = ${FRAC("h","f")}`,`E = ${FRAC("f","h")}`,"E = h·c·f"],`La constante de Planck relie énergie et fréquence : E est proportionnelle à f. Unités : J·s × s<sup>−1</sup> = J.`],
      ["Quelle relation donne la longueur d'onde λ d'une radiation dont les photons ont une énergie E ?",`λ = ${FRAC("h·c","E")}`,[`λ = ${FRAC("E","h·c")}`,`λ = ${FRAC("h·E","c")}`,`λ = ${FRAC("c","h·E")}`],`On part de ${EQE} : λ·E = h·c, donc λ = ${FRAC("h·c","E")}. Unités : ${FRAC("J·s × m/s","J")} = m.`],
      ["Quelle relation lie la fréquence f et la longueur d'onde λ d'une radiation lumineuse ?",`f = ${FRAC("c","λ")}`,[`f = ${FRAC("λ","c")}`,"f = c·λ",`f = ${FRAC("h·c","λ")}`],`La lumière parcourt une longueur d'onde pendant une période : λ = c·T = ${FRAC("c","f")}, donc f = ${FRAC("c","λ")}. Unités : ${FRAC("m/s","m")} = s<sup>−1</sup> = Hz.`]]);
    return {q:R[0],type:"ch",...mc(R[1],R[2]),expl:`${R[3]} Réponse : ${F(R[1])}.`}; },
  /* photon le plus (ou le moins) énergétique, repéré sur le spectre */
  ()=>{ const o=draw(()=>shuffle(SRC.filter(s=>s[1]<=1200)).slice(0,4),a=>a.every((s,i)=>a.every((t,j)=>i===j||Math.abs(s[1]-t[1])>=60)));
    const most=Math.random()<0.6, L4=["A","B","C","D"], srt=o.map((s,i)=>i).sort((i,j)=>o[i][1]-o[j][1]), k=most?srt[0]:srt[3];
    return {fig:fx_opt_spectre({mk:o.map((s,i)=>({l:s[1],n:L4[i]}))}),ctx:`Quatre sources de lumière sont repérées sur le spectre : ${o.map((s,i)=>`${L4[i]}, ${s[0]}`).join(" ; ")}.`,
      q:`Quelle source émet les photons les ${most?"plus":"moins"} énergétiques ?`,type:"ch",ch:L4.map((x,i)=>`${x} : ${o[i][0]}`),ok:k,
      expl:`${F(EQE)} : l'énergie d'un photon est d'autant plus grande que λ est petite. La source placée le plus à ${most?"gauche":"droite"} du spectre, ${F(L4[k])} (${nf(o[k][1],0)} nm), émet les photons les ${most?"plus":"moins"} énergétiques.`}; },
  /* fréquence d'une radiation, ou longueur d'onde à partir de la fréquence */
  ()=>{ const [d,l]=rnd(SRC), nu=Cl/(l*1e-9), k=kOf(nu);
    if(Math.random()<0.6) return {ctx:`${cap(d)} émet une radiation de longueur d'onde λ = ${nf(l,0)} nm. ${DON(KC)}`,q:`Calcule la fréquence f de cette radiation, en ${p10(k)} Hz.`,type:"num",ans:nu/10**k,tolR:0.02,unit:UK(k,"Hz"),
      expl:`${F(`f = ${FRAC("c","λ")}`)} avec λ en mètres : f = ${FRAC(`3,00 × ${p10(8)}`,lamV(l))} = ${F(SC(nu,"Hz",k))}.`};
    const nuR=Number((nu/10**k).toPrecision(3))*10**k, lr=Cl/nuR*1e9;
    return {ctx:`${cap(d)} émet une radiation de fréquence f = ${SC(nuR,"Hz",k)}. ${DON(KC)}`,q:"Calcule la longueur d'onde λ de cette radiation, en nanomètres.",type:"num",ans:lr,tolR:0.02,unit:"nm",
      expl:`${F(`λ = ${FRAC("c","f")}`)} = ${FRAC(`3,00 × ${p10(8)}`,SC(nuR,"",k))} = ${SC(lr*1e-9,"m")} = ${U(lr,"nm")}.`}; },
  /* effet photoélectrique : y a-t-il émission d'électrons ? */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const M=rnd(MET), [d,l]=rnd(SRC), E=Number(EeV(l).toFixed(2)); return {M,d,l,E}; },o=>far(o.E,o.M[1],0.05)&&(o.E>=o.M[1])===want), ok=o.E>=o.M[1];
    return {ctx:`Une plaque ${o.M[3]} (travail d'extraction W₀ = ${nf(o.M[1],1)} eV) est éclairée par ${o.d}. Chaque photon transporte une énergie E = ${nfd(o.E,2)} eV.`,
      q:"Des électrons sont-ils extraits de la plaque ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Un photon ne peut extraire un électron que si son énergie atteint le travail d'extraction : ${F("E ≥ W₀")}. Ici ${nfd(o.E,2)} eV ${ok?"≥":"&lt;"} ${nf(o.M[1],1)} eV : ${ok?"des électrons sont extraits.":"aucun électron n'est extrait, même si l'on augmente la puissance de la source."}`}; },
  /* énergie cinétique maximale : E et W₀ en eV */
  ()=>{ const o=draw(()=>{ const M=rnd(MET), [d,l]=rnd(SRC), E=Number(EeV(l).toFixed(2)); return {M,d,l,E,Ec:E-M[1]}; },o=>o.Ec>=0.3);
    return {ctx:`Une plaque ${o.M[3]} (W₀ = ${nf(o.M[1],1)} eV) est éclairée par ${o.d}, dont les photons ont une énergie E = ${nfd(o.E,2)} eV.`,
      q:"Calcule l'énergie cinétique maximale Ec,max d'un électron extrait, en eV.",type:"num",ans:o.Ec,tolR:0.02,unit:"eV",
      expl:`L'énergie du photon sert d'abord à extraire l'électron (W₀) ; le reste devient, au plus, de l'énergie cinétique : ${F("Ec,max = E − W₀")} = ${nfd(o.E,2)} − ${nf(o.M[1],1)} = ${U(o.Ec,"eV")}.`}; },
  /* nombre de photons par seconde, énergie d'un photon donnée */
  ()=>{ const [d,l,Ps]=rnd([["Un pointeur laser rouge",650,[1,5]],["Un pointeur laser vert",532,[1,5]],["Une LED bleue d'éclairage",460,[50,100,200]],["La LED infrarouge d'une télécommande",940,[10,20,30]],["Une LED UV de polymérisation de résine",385,[200,500]],["Une LED rouge de feu arrière de vélo",625,[20,50]]]);
    const P=rnd(Ps)*1e-3, E=Number((EJ(l)/1e-19).toFixed(2))*1e-19, N=P/E, k=kOf(N);
    return {ctx:`${d} émet une puissance lumineuse P = ${nf(P*1e3,0)} mW. Chaque photon émis transporte une énergie E = ${SC(E,"J",-19)}.`,
      q:`Combien de photons sont émis chaque seconde ? Donne le résultat en ${p10(k)} photons par seconde.`,type:"num",ans:N/10**k,tolR:0.02,unit:UK(k,"photons/s"),
      expl:`En une seconde, la source émet l'énergie P × 1 s, partagée entre des photons d'énergie E : ${F(`N = ${FRAC("P","E")}`)} = ${FRAC(SC(P,"W"),SC(E,"J",-19))} = ${F(SC(N,"photons/s",k))}.`}; },
  /* cellule photovoltaïque : le photon est-il absorbé ? */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const [m,Eg]=rnd(SEM), [d,l]=rnd(SRC), E=Number(EeV(l).toFixed(2)); return {m,Eg,d,l,E}; },o=>far(o.E,o.Eg,0.05)&&(o.E>=o.Eg)===want), ok=o.E>=o.Eg;
    return {fig:fx_opt_bandes({mode:"abs",eg:`= ${nfd(o.Eg,2)} eV`}),ctx:`Une cellule photovoltaïque en ${o.m} (gap Eg = ${nfd(o.Eg,2)} eV) est éclairée par ${o.d} : chaque photon transporte une énergie E = ${nfd(o.E,2)} eV.`,
      q:"Ces photons peuvent-ils être absorbés par la cellule et produire un courant ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Un photon n'est absorbé que s'il peut faire passer un électron de la bande de valence à la bande de conduction : ${F("E ≥ Eg")}. ${nfd(o.E,2)} eV ${ok?"≥":"&lt;"} ${nfd(o.Eg,2)} eV : ${ok?"les photons sont absorbés et la cellule produit un courant.":"les photons traversent la cellule sans être absorbés ; aucun courant n'est produit."}`}; },
  /* rendement d'un panneau photovoltaïque */
  ()=>{ const C=rnd(["Un panneau d'une ferme solaire installée sur un atoll","Le panneau d'une borne de recharge de vélos","Un panneau posé sur le toit d'un faré","Le panneau d'une station météo sur un motu"]);
    const S=rnd([1.1,1.6,1.7,1.8,1.95,2.0]), G=rnd([800,900,1000]), P=Math.round(rnd([15,16,17,18,19,20,21,22])/100*G*S), Pr=G*S, eta=P/Pr*100;
    return {ctx:`${C} a une surface S = ${nf(S,2)} m². Sous un éclairement G = ${nf(G,0)} W/m², il fournit une puissance électrique P = ${P} W.`,q:"Calcule le rendement de ce panneau, en %.",type:"num",ans:eta,tolR:0.02,unit:"%",
      expl:`Puissance lumineuse reçue : ${F("P_reçue = G·S")} = ${nf(G,0)} × ${nf(S,2)} = ${nf(Pr,0)} W. ${F(`η = ${FRAC("P_élec","P_reçue")}`)} = ${FRAC(P,nf(Pr,0))} = ${nf(eta/100,3)}, soit ${U(eta,"%")}.`}; },
  /* questions de cours */
  ()=>{ const v=rnd(COURS); return {q:v[0],type:"ch",...mc(v[1],v[2]),expl:v[3]}; }
];

const OPT2=[
  /* énergie d'un photon en eV à partir de λ */
  ()=>{ const [d,l]=rnd(SRC), Ej=EJ(l), E=Ej/QE;
    return {ctx:`${cap(d)} émet une radiation de longueur d'onde λ = ${nf(l,0)} nm. ${DON(KH,KC,KE)}`,q:"Calcule l'énergie d'un photon de cette radiation, en électronvolts.",type:"num",ans:E,tolR:0.02,unit:"eV",
      expl:`${F(EQE)} = ${FRAC(NHC,lamV(l))} = ${SC(Ej,"J",-19)}. En électronvolts : ${FRAC(SC(Ej,"",-19),`1,60 × ${p10(-19)}`)} = ${U(E,"eV")}. C'est une radiation du domaine ${domN(l)}.`}; },
  /* couleur d'une LED à partir du gap */
  ()=>{ const o=draw(()=>{ const c=rnd(COUL), l0=ri(c[1],c[2]), Eg=Number((HC/(l0*1e-9)/QE).toFixed(2)), l=LnE(Eg); return {c,Eg,l}; },o=>coreCoul(o.l,o.c));
    const fig=fx_opt_bandes({mode:"em",eg:`= ${nfd(o.Eg,2)} eV`}), data=coulTab(), ctx=`Dans une LED, un électron qui passe de la bande de conduction à la bande de valence émet un photon d'énergie E ≈ Eg. Pour le semi-conducteur de cette LED, Eg = ${nfd(o.Eg,2)} eV. ${DON(KH,KC,KE)}`;
    return [{fig,data,ctx,q:"Calcule la longueur d'onde λ de la lumière émise, en nm.",type:"num",ans:o.l,tolR:0.02,unit:"nm",
        expl:`E = ${nfd(o.Eg,2)} × 1,60 × ${p10(-19)} = ${SC(o.Eg*QE,"J",-19)}. ${F(`λ = ${FRAC("h·c","E")}`)} = ${FRAC(NHC,SC(o.Eg*QE,"",-19))} = ${SC(o.l*1e-9,"m")} = ${U(o.l,"nm")}.`},
      {fig,data,ctx,q:"De quelle couleur est la lumière de cette LED ?",type:"ch",ch:COUL.map(c=>cap(c[0])),ok:COUL.indexOf(o.c),
        expl:`λ = ${nf(o.l,0)} nm est comprise entre ${o.c[1]} et ${o.c[2]} nm : la LED émet dans le ${F(o.c[0])}. Plus le gap est grand, plus λ est courte (vers le violet).`}]; },
  /* fréquence seuil et longueur d'onde seuil d'un métal */
  ()=>{ const M=rnd(MET), W=M[1], nu0=W*QE/Hp, k=kOf(nu0), l0=Cl/nu0*1e9, ctx=`Le travail d'extraction ${M[2]} vaut W₀ = ${nf(W,1)} eV. ${DON(KH,KC,KE)}`;
    return [{ctx,q:`Calcule la fréquence seuil f₀ ${M[2]}, en ${p10(k)} Hz.`,type:"num",ans:nu0/10**k,tolR:0.02,unit:UK(k,"Hz"),
        expl:`Au seuil, l'énergie du photon est juste égale au travail d'extraction : ${F("h·f₀ = W₀")}, donc ${F(`f₀ = ${FRAC("W₀","h")}`)} = ${FRAC(`${nf(W,1)} × 1,60 × ${p10(-19)}`,`6,63 × ${p10(-34)}`)} = ${F(SC(nu0,"Hz",k))}.`},
      {ctx,q:"Quelle est la longueur d'onde seuil λ₀ correspondante, en nm ?",type:"num",ans:l0,tolR:0.02,unit:"nm",
        expl:`${F(`λ₀ = ${FRAC("c","f₀")}`)} = ${FRAC(`3,00 × ${p10(8)}`,SC(nu0,"",k))} = ${U(l0,"nm")}, dans le domaine ${domN(l0)}. Seules les radiations de longueur d'onde ${F("λ ≤ λ₀")} extraient des électrons.`}]; },
  /* énergie cinétique maximale à partir de λ */
  ()=>{ const o=draw(()=>{ const M=rnd(MET), [d,l]=rnd(SRC), E=EeV(l); return {M,d,l,E,Ec:E-M[1]}; },o=>o.Ec>=0.4);
    return {ctx:`On éclaire une plaque ${o.M[3]} (W₀ = ${nf(o.M[1],1)} eV) avec ${o.d} (λ = ${nf(o.l,0)} nm). ${DON(KH,KC,KE)}`,q:"Calcule l'énergie cinétique maximale des électrons extraits, en eV.",type:"num",ans:o.Ec,tolR:0.02,unit:"eV",
      expl:`Énergie d'un photon : ${F(EQE)} = ${FRAC(NHC,lamV(o.l))} = ${SC(EJ(o.l),"J",-19)} = ${nfd(o.E,3)} eV. ${F("Ec,max = E − W₀")} = ${nfd(o.E,3)} − ${nf(o.M[1],1)} = ${U(o.Ec,"eV")}.`}; },
  /* graphique Ec,max(f) : fréquence seuil lue, puis travail d'extraction */
  ()=>{ const nu0=rnd([4.5,5,5.5,6,6.5,7,8,9,10,10.5,11]), xmax=nu0<=7?12:16, sl=Hp*1e14/QE, ymax=Math.ceil(sl*(xmax-nu0)*2)/2, W=Hp*nu0*1e14/QE;
    const fig=fx_opt_ec({nu0,xmax,ymax}), ctx=`On a mesuré l'énergie cinétique maximale des électrons extraits d'un métal en l'éclairant avec des radiations de différentes fréquences. ${DON(KH,KE)}`;
    return [{fig,ctx,q:`Lis sur le graphique la fréquence seuil f₀ de ce métal, en ${p10(14)} Hz.`,type:"num",ans:nu0,tolA:0.15,unit:UK(14,"Hz"),
        expl:`La droite coupe l'axe des fréquences en ${F(`f₀ = ${nf(nu0,1)} × ${p10(14)} Hz`)} : en dessous de cette fréquence, aucun électron n'est extrait.`},
      {fig,ctx,q:"Déduis-en le travail d'extraction W₀ de ce métal, en eV.",type:"num",ans:W,tolR:0.02,unit:"eV",
        expl:`Au seuil, ${F("W₀ = h·f₀")} = 6,63 × ${p10(-34)} × ${nf(nu0,1)} × ${p10(14)} = ${SC(W*QE,"J",-19)}, soit ${FRAC(SC(W*QE,"",-19),`1,60 × ${p10(-19)}`)} = ${U(W,"eV")}.`}]; },
  /* photons émis par seconde : longueur d'onde et puissance */
  ()=>{ const [d,l,Ps]=rnd([["Un pointeur laser rouge",650,[1,5]],["Un pointeur laser vert",532,[1,5]],["Le laser violet d'un graveur de disques Blu-ray",405,[100,250]],["La diode laser d'un lidar",905,[20,50,75]],["Le laser d'une liaison par fibre optique",1550,[2,5,10]],["Une LED UV de polymérisation de résine",385,[200,500]]]);
    const P=rnd(Ps)*1e-3, E=EJ(l), N=P/E, k=kOf(N);
    return {ctx:`${d} émet une puissance lumineuse P = ${nf(P*1e3,0)} mW à la longueur d'onde λ = ${nf(l,0)} nm. ${DON(KH,KC)}`,q:`Calcule le nombre de photons émis par seconde, en ${p10(k)} photons par seconde.`,type:"num",ans:N/10**k,tolR:0.02,unit:UK(k,"photons/s"),
      expl:`Énergie d'un photon : ${F(EQE)} = ${FRAC(NHC,lamV(l))} = ${SC(E,"J",-19)}. En une seconde, l'énergie émise P × 1 s est partagée entre N photons : ${F(`N = ${FRAC("P","E")}`)} = ${FRAC(SC(P,"W"),SC(E,"J",-19))} = ${F(SC(N,"photons/s",k))}.`}; },
  /* longueur d'onde maximale absorbée par une cellule, puis une source */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const [m,Eg]=rnd(SEM), lm=LnE(Eg), [d,l]=rnd(SRC); return {m,Eg,lm,d,l}; },o=>far(o.l,o.lm,0.05)&&(o.l<=o.lm)===want), ok=o.l<=o.lm;
    const fig=fx_opt_bandes({mode:"abs",eg:`= ${nfd(o.Eg,2)} eV`}), ctx=`Une cellule photovoltaïque est en ${o.m}, de gap Eg = ${nfd(o.Eg,2)} eV. ${DON(KH,KC,KE)}`;
    return [{fig,ctx,q:"Quelle est la plus grande longueur d'onde λmax des photons que cette cellule peut absorber, en nm ?",type:"num",ans:o.lm,tolR:0.02,unit:"nm",
        expl:`Absorption si ${F("E ≥ Eg")}, c'est-à-dire ${F(`λ ≤ ${FRAC("h·c","Eg")}`)}. λmax = ${FRAC(NHC,`${nfd(o.Eg,2)} × 1,60 × ${p10(-19)}`)} = ${SC(o.lm*1e-9,"m")} = ${U(o.lm,"nm")}, dans le domaine ${domN(o.lm)}.`},
      {fig,ctx,q:`La cellule est éclairée par ${o.d} (λ = ${nf(o.l,0)} nm). Produit-elle un courant ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.l,0)} nm ${ok?"≤":">"} λmax = ${nf(o.lm,0)} nm : ${ok?"les photons sont absorbés, la cellule produit un courant.":"les photons ne sont pas assez énergétiques pour être absorbés : pas de courant."}`}]; },
  /* spectre repéré : quelles sources produisent un effet ? */
  ()=>{ const pv=Math.random()<0.5;
    const o=draw(()=>{ const X=pv?rnd(SEM.filter(s=>s[1]>1)):rnd(MET.filter(m=>m[1]<3)), th=LnE(X[1]), src=shuffle(SRC).slice(0,4); return {X,th,src}; },
      o=>o.src.every((s,i)=>o.src.every((t,j)=>i===j||Math.abs(s[1]-t[1])>=60))&&o.src.every(s=>far(s[1],o.th,0.05))&&o.src.some(s=>s[1]<o.th)&&o.src.some(s=>s[1]>o.th));
    const L4=["A","B","C","D"], yes=o.src.map(s=>s[1]<o.th), l1=o.src.some(s=>s[1]>1200)?1600:1200;
    const fig=fx_opt_spectre({mk:o.src.map((s,i)=>({l:s[1],n:L4[i]})),l1}), data=TT(["Repère","Source","λ (nm)"],o.src.map((s,i)=>[L4[i],cap(s[0]),nf(s[1],0)]));
    const ctx=pv?`Une cellule photovoltaïque en ${o.X[0]} (gap Eg = ${nfd(o.X[1],2)} eV) est éclairée successivement par les quatre sources repérées sur le spectre. ${DON(KH,KC,KE)}`
      :`Une cellule photoémissive, dont la cathode est en ${o.X[0]} (W₀ = ${nf(o.X[1],1)} eV), est éclairée successivement par les quatre sources repérées sur le spectre. ${DON(KH,KC,KE)}`;
    return {fig,data,ctx,q:`Quelles sources ${pv?"produisent un courant dans la cellule":"extraient des électrons de la cathode"} ?`,type:"ch",...subsetCh(L4,yes),
      expl:`Longueur d'onde seuil : ${F(`λ ≤ ${FRAC("h·c",pv?"Eg":"W₀")}`)} = ${FRAC(NHC,`${pv?nfd(o.X[1],2):nf(o.X[1],1)} × 1,60 × ${p10(-19)}`)} = ${nf(o.th,0)} nm. Les sources de longueur d'onde plus courte conviennent : ${F(lst(L4.filter((_,i)=>yes[i])))} ; les autres émettent des photons trop peu énergétiques, quelle que soit leur puissance.`}; },
  /* puissance électrique ou surface de panneaux photovoltaïques */
  ()=>{ const C=rnd([["une pompe solaire qui remplit la citerne d'un faré",[120,180,250]],["l'éclairage d'un quai de pirogues",[60,90,150]],["une station météo sur un motu",[20,40,60]],["le réfrigérateur d'un dispensaire sur un atoll",[100,150,200]]]);
    const G=rnd([800,900,1000]), eta=rnd([15,17,18,19,20,21])/100;
    if(Math.random()<0.5){ const P=rnd(C[1]), Pr=P/eta, S=Pr/G;
      return {ctx:`Des panneaux photovoltaïques de rendement η = ${nf(eta*100,0)} % doivent alimenter ${C[0]}, qui consomme P = ${P} W, sous un éclairement G = ${nf(G,0)} W/m².`,q:"Quelle surface minimale de panneaux faut-il installer, en m² ?",type:"num",ans:S,tolR:0.02,unit:"m²",
        expl:`Puissance lumineuse à recevoir : ${F(`P_reçue = ${FRAC("P_élec","η")}`)} = ${FRAC(P,nf(eta,2))} = ${nf(Pr,1)} W. ${F(`S = ${FRAC("P_reçue","G")}`)} = ${FRAC(nf(Pr,1),nf(G,0))} = ${U(S,"m²")}.`}; }
    const S=rnd([0.5,0.8,1.2,1.6,2.4,3.2]), P=eta*G*S;
    return {ctx:`Les panneaux photovoltaïques qui alimentent ${C[0]} ont une surface totale S = ${nf(S,1)} m² et un rendement η = ${nf(eta*100,0)} %. Éclairement : G = ${nf(G,0)} W/m².`,q:"Quelle puissance électrique fournissent-ils, en W ?",type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`Puissance lumineuse reçue : ${F("P_reçue = G·S")} = ${nf(G,0)} × ${nf(S,1)} = ${nf(G*S,0)} W. ${F("P_élec = η·P_reçue")} = ${nf(eta,2)} × ${nf(G*S,0)} = ${U(P,"W")}.`}; },
  /* impulsions laser : photons par impulsion, puis par seconde */
  ()=>{ const [d,l,Es,u,f,fs]=rnd([["le laser d'un lidar de drone",905,[0.2,0.5,1,2],"µJ",1e-6,[10000,20000,50000]],["un laser de marquage de pièces métalliques",1064,[0.5,1],"mJ",1e-3,[20000,50000]],["un laser de détatouage",1064,[0.2,0.5,1],"J",1,[5,10]]]);
    const Ep=rnd(Es)*f, fr=rnd(fs), E=EJ(l), N=Ep/E, k=kOf(N), Nt=N*fr, k2=kOf(Nt);
    const ctx=`${cap(d)} émet des impulsions lumineuses de longueur d'onde λ = ${nf(l,0)} nm ; chaque impulsion transporte une énergie de ${nf(Ep/f,1)} ${u}. ${DON(KH,KC)}`;
    return [{ctx,q:`Combien de photons une impulsion contient-elle ? Donne le résultat en ${p10(k)} photons.`,type:"num",ans:N/10**k,tolR:0.02,unit:UK(k,"photons"),
        expl:`Un photon : ${F(EQE)} = ${FRAC(NHC,lamV(l))} = ${SC(E,"J",-19)}. ${F(`N = ${FRAC("E_impulsion","E")}`)} = ${FRAC(SC(Ep,"J"),SC(E,"J",-19))} = ${F(SC(N,"photons",k))}.`},
      {ctx,q:`Le laser émet ${nf(fr,0)} impulsions par seconde. Combien de photons émet-il par seconde ? Donne le résultat en ${p10(k2)} photons par seconde.`,type:"num",ans:Nt/10**k2,tolR:0.02,unit:UK(k2,"photons/s"),
        expl:`Avec n = ${nf(fr,0)} impulsions par seconde : ${F("N_s = N × n")} = ${SC(N,"",k)} × ${nf(fr,0)} = ${F(SC(Nt,"photons/s",k2))}. La puissance lumineuse moyenne vaut ${nf(Ep/f,1)} ${u} × ${nf(fr,0)} = ${pw(Ep*fr)}.`}]; },
  /* spectre d'émission d'une LED : gap du semi-conducteur */
  ()=>{ const lp=rnd([450,475,500,525,550,575,600,625,650]), w=rnd([20,25,30,35]), E=EeV(lp);
    return {fig:fx_opt_led({lp,w}),ctx:`La figure donne le spectre d'émission d'une LED. On admet que les photons émis au maximum d'intensité ont une énergie égale au gap Eg du semi-conducteur. ${DON(KH,KC,KE)}`,
      q:"Détermine le gap Eg du semi-conducteur de cette LED, en eV.",type:"num",ans:E,tolR:0.02,unit:"eV",
      expl:`Le maximum d'intensité est à λ ≈ ${lp} nm. ${F(`Eg ≈ ${FRAC("h·c","λ")}`)} = ${FRAC(NHC,lamV(lp))} = ${SC(EJ(lp),"J",-19)}, soit ${U(E,"eV")}.`}; },
  /* repérer l'erreur d'un élève, puis corriger */
  ()=>{ const [d,l]=rnd(SRC.filter(s=>s[1]>=400&&s[1]<=700)), E=EJ(l), v=rnd([0,1,2]);
    const calc=[`E = ${FRAC("h·c","λ")} = ${FRAC(NHC,nf(l,0))} = ${SC(HC/l,"J")}`,`E = ${FRAC("h·λ","c")} = ${FRAC(`6,63 × ${p10(-34)} × ${lamV(l)}`,`3,00 × ${p10(8)}`)} = ${SC(Hp*l*1e-9/Cl,"J")}`,
      `E = ${FRAC("h·c","λ")} = ${SC(E,"J",-19)}, puis E = ${SC(E,"",-19)} × 1,60 × ${p10(-19)} = ${SC(E*QE,"eV")}`][v];
    const ch=["La longueur d'onde n'a pas été convertie en mètres","La relation est fausse : l'énergie est inversement proportionnelle à λ",`Pour passer en électronvolts, il faut diviser par 1,60 × ${p10(-19)}, et non multiplier`,"Il n'y a pas d'erreur"];
    const ctx=`${cap(d)} émet une lumière de longueur d'onde λ = ${nf(l,0)} nm. Un élève calcule l'énergie d'un photon${v===2?" en électronvolts":""} : ${calc}. ${DON(KH,KC,KE)}`;
    const why=[`λ doit être exprimée en mètres : ${nf(l,0)} nm = ${lamM(l)}. Le résultat de l'élève, de l'ordre de ${p10(-28)} J, est ${p10(9)} fois trop petit : un photon de lumière visible transporte quelques ${p10(-19)} J.`,
      `${F(EQE)} : plus λ est courte, plus le photon est énergétique. L'écriture ${FRAC("h·λ","c")} n'a même pas l'unité d'une énergie : ${FRAC("J·s × m","m/s")} = J·s².`,
      `1 eV = 1,60 × ${p10(-19)} J : un nombre d'électronvolts s'obtient en divisant l'énergie en joules, ${F(`E(eV) = ${FRAC("E(J)",`1,60 × ${p10(-19)}`)}`)}. Le résultat de l'élève, de l'ordre de ${p10(-38)} eV, est absurde.`][v];
    return [{ctx,q:"Quelle est l'erreur de l'élève ?",type:"ch",ch,ok:v,expl:why},
      v<2?{ctx,q:`Quelle est la valeur correcte de E, en ${p10(-19)} J ?`,type:"num",ans:E/1e-19,tolR:0.02,unit:UK(-19,"J"),
          expl:`${F(EQE)} = ${FRAC(NHC,lamV(l))} = ${F(SC(E,"J",-19))}.`}
        :{ctx,q:"Quelle est la valeur correcte de E, en électronvolts ?",type:"num",ans:E/QE,tolR:0.02,unit:"eV",
          expl:`E = ${FRAC(SC(E,"",-19),`1,60 × ${p10(-19)}`)} = ${U(E/QE,"eV")}.`}]; }
];

const OPT3=[
  /* quelle partie du rayonnement solaire une cellule absorbe-t-elle ? */
  ()=>{ const [m,Eg]=rnd([...SEM,["phosphure de gallium-indium (GaInP)",1.85],["pérovskite à large gap",1.75]]), lm=LnE(Eg), all=lm>800;
    const ctx=`Une cellule photovoltaïque est en ${m}, de gap Eg = ${nfd(Eg,2)} eV. La lumière solaire contient de l'ultraviolet, du visible (400 à 800 nm) et de l'infrarouge. ${DON(KH,KC,KE)}`;
    const X=nf(lm,0), okA=all?`L'ultraviolet, tout le visible et l'infrarouge jusqu'à ${X} nm`:`L'ultraviolet et le visible jusqu'à ${X} nm seulement`;
    const wrA=all?["Seulement le visible, de 400 à 800 nm","Tout le rayonnement solaire, quelle que soit la longueur d'onde",`Seulement l'infrarouge au-delà de ${X} nm`]:["L'ultraviolet, tout le visible et une partie de l'infrarouge","Tout le rayonnement solaire, quelle que soit la longueur d'onde",`Seulement le rouge et l'infrarouge, au-delà de ${X} nm`];
    return [{fig:fx_opt_bandes({mode:"abs",eg:`= ${nfd(Eg,2)} eV`}),ctx,q:"Calcule la plus grande longueur d'onde λmax des photons absorbés par cette cellule, en nm.",type:"num",ans:lm,tolR:0.02,unit:"nm",
        expl:`Un photon est absorbé si ${F("E ≥ Eg")}, soit ${F(`λ ≤ ${FRAC("h·c","Eg")}`)} : λmax = ${FRAC(NHC,`${nfd(Eg,2)} × 1,60 × ${p10(-19)}`)} = ${U(lm,"nm")}.`},
      {fig:fx_opt_spectre({cut:{l:lm,t:`λmax ≈ ${X} nm`,a:lm>1000?"end":"start"},l1:lm>1500?2000:lm>1150?1600:1200}),ctx,q:"Quelle partie du rayonnement solaire cette cellule peut-elle absorber ?",type:"ch",...mc(okA,wrA),
        expl:`Sont absorbés tous les photons de longueur d'onde inférieure à λmax = ${nf(lm,0)} nm. ${all?`λmax dépasse 800 nm : tout le visible et une partie de l'infrarouge sont absorbés ; l'infrarouge au-delà de ${nf(lm,0)} nm traverse la cellule.`:`λmax est inférieure à 800 nm : le rouge au-delà de ${nf(lm,0)} nm et tout l'infrarouge traversent la cellule sans produire de courant.`}`}]; },
  /* choisir le semi-conducteur d'une LED */
  ()=>{ const EXT=[...COUL,["infrarouge",800,1000],["ultraviolet",330,400]];
    const o=draw(()=>{ const t=ri(0,COUL.length-1), others=shuffle(EXT.map((_,i)=>i).filter(i=>i!==t)).slice(0,3), bands=shuffle([t,...others]);
        const c=bands.map(b=>{ const B=EXT[b], l0=ri(B[1],B[2]), Eg=Number((HC/(l0*1e-9)/QE).toFixed(2)); return {b,Eg,l:LnE(Eg)}; }); return {t,c}; },
      o=>o.c.every(x=>coreCoul(x.l,EXT[x.b])));
    const L4=["A","B","C","D"], T=COUL[o.t], k=o.c.findIndex(x=>x.b===o.t);
    return {data:TT(["Semi-conducteur","Gap Eg (eV)"],o.c.map((x,i)=>[L4[i],nfd(x.Eg,2)])),ctx:`On veut réaliser une LED qui émet dans le ${T[0]}, entre ${T[1]} et ${T[2]} nm. Le tableau donne le gap de quatre semi-conducteurs ; une LED émet des photons d'énergie E ≈ Eg. ${DON(KH,KC,KE)}`,
      q:"Quel semi-conducteur faut-il choisir ?",type:"ch",ch:L4.map((x,i)=>`${x} (Eg = ${nfd(o.c[i].Eg,2)} eV)`),ok:k,
      expl:`Pour chaque semi-conducteur, ${F(`λ ≈ ${FRAC("h·c","Eg")}`)} : ${o.c.map((x,i)=>`${L4[i]} → ${nf(x.l,0)} nm (${EXT[x.b][0]})`).join(" ; ")}. Seul ${F(L4[k])} émet entre ${T[1]} et ${T[2]} nm.`}; },
  /* choisir le métal de la cathode d'une cellule photoémissive */
  ()=>{ const o=draw(()=>{ const [d,l]=rnd(SRC.filter(s=>s[1]>=380&&s[1]<=700)), E=EeV(l), mets=shuffle(MET).slice(0,4); return {d,l,E,mets}; },
      o=>o.mets.every(m=>far(m[1],o.E,0.05))&&o.mets.some(m=>m[1]<o.E)&&o.mets.some(m=>m[1]>o.E));
    const names=o.mets.map(m=>m[0]), yes=o.mets.map(m=>m[1]<o.E), data=TT(["Métal","W₀ (eV)"],o.mets.map(m=>[cap(m[0]),nf(m[1],1)]));
    const ctx=`Un capteur utilise une cellule photoémissive éclairée par ${o.d} (λ = ${nf(o.l,0)} nm). Il faut choisir le métal de sa cathode parmi ceux du tableau. ${DON(KH,KC,KE)}`;
    return [{data,ctx,q:"Calcule l'énergie des photons de cette source, en électronvolts.",type:"num",ans:o.E,tolR:0.02,unit:"eV",
        expl:`${F(EQE)} = ${FRAC(NHC,lamV(o.l))} = ${SC(EJ(o.l),"J",-19)}, soit ${U(o.E,"eV")}.`},
      {data,ctx,q:"Quels métaux permettent d'extraire des électrons avec cette source ?",type:"ch",...subsetCh(names,yes),
        expl:`Il faut ${F("W₀ ≤ E")} = ${nfd(o.E,2)} eV : ${lst(o.mets.map(m=>`${m[0]} (${nf(m[1],1)} eV ${m[1]<o.E?"&lt;":"&gt;"} ${nfd(o.E,2)} eV)`))}. Conviennent : ${F(lst(names.filter((_,i)=>yes[i])))}.`}]; },
  /* pointeur laser : photons comptés, puissance, classe 2 */
  ()=>{ const o=draw(()=>{ const [c,l]=rnd([["rouge",650],["vert",532],["violet",405]]), Pt=rnd([0.4,0.5,0.6,0.7,0.8,0.9,1.2,1.5,2,2.5,3])*1e-3, E=EJ(l), N=Number((Pt/E).toPrecision(3)), P=N*E; return {c,l,E,N,P}; },o=>far(o.P,1e-3,0.05));
    const ok=o.P<=1e-3, ctx=`Un pointeur laser ${o.c} (λ = ${o.l} nm) est testé : une photodiode étalonnée compte N = ${SC(o.N,"")} photons par seconde. Vendu au grand public, un pointeur doit être de classe 2 : puissance lumineuse au plus 1 mW. ${DON(KH,KC)}`;
    return [{ctx,q:`Calcule l'énergie d'un photon émis par ce pointeur, en ${p10(-19)} J.`,type:"num",ans:o.E/1e-19,tolR:0.02,unit:UK(-19,"J"),
        expl:`${F(EQE)} = ${FRAC(NHC,lamV(o.l))} = ${F(SC(o.E,"J",-19))}.`},
      {ctx,q:"Calcule la puissance lumineuse émise par le pointeur, en mW.",type:"num",ans:o.P*1e3,tolR:0.02,unit:"mW",
        expl:`Chaque seconde, N photons d'énergie E sont émis : ${F("P = N·E")} = ${SC(o.N,"")} × ${SC(o.E,"J",-19)} = ${SC(o.P,"W")}, soit ${U(o.P*1e3,"mW")}.`},
      {ctx,q:"Ce pointeur peut-il être vendu au grand public ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.P*1e3,2)} mW ${ok?"≤":">"} 1 mW : ${ok?"le pointeur respecte la classe 2.":"le pointeur dépasse la limite de la classe 2 ; il est dangereux pour l'œil et ne peut pas être vendu au grand public."}`}]; },
  /* dimensionner des panneaux : surface, nombre de modules, toit disponible */
  ()=>{ const o=draw(()=>{ const C=rnd([["la pompe qui remplit la citerne d'un faré sur un motu",[300,400,500]],["les réfrigérateurs d'un dispensaire sur un atoll",[250,300,400]],["la station de recharge de vélos à assistance d'un quai",[600,800,1000]],["le dessalinisateur d'une pension de famille",[500,700,900]]]);
        const P=rnd(C[1]), G=rnd([800,850,900,950,1000]), eta=rnd([16,18,19,20,21,22])/100, S=P/(eta*G), Sm=rnd([1.6,1.7,1.8,2.0]), r=S/Sm, n=Math.ceil(r), A=rnd([3,4,5,6,8,10,12]);
        return {C,P,G,eta,S,Sm,r,n,A}; },o=>o.r-Math.floor(o.r)>=0.15&&o.r-Math.floor(o.r)<=0.85&&far(o.A,o.n*o.Sm,0.08)&&o.n>=2&&o.n<=6);
    const ok=o.n*o.Sm<=o.A, ctx=`On veut alimenter ${o.C[0]} (puissance électrique P = ${o.P} W) avec des modules photovoltaïques de ${nf(o.Sm,1)} m² chacun, de rendement η = ${nf(o.eta*100,0)} %, sous un éclairement G = ${nf(o.G,0)} W/m².`;
    return [{ctx,q:"Quelle surface minimale de modules faut-il, en m² ?",type:"num",ans:o.S,tolR:0.02,unit:"m²",
        expl:`${F("P_élec = η·G·S")}, donc ${F(`S = ${FRAC("P_élec","η·G")}`)} = ${FRAC(o.P,`${nf(o.eta,2)} × ${nf(o.G,0)}`)} = ${U(o.S,"m²")}.`},
      {ctx,q:"Combien de modules faut-il installer ?",type:"num",ans:o.n,tolA:0,unit:"modules",
        expl:`${FRAC(nf(o.S,2),nf(o.Sm,1))} = ${nf(o.r,2)} : on arrondit à l'entier supérieur, sinon la puissance ne suffit pas : ${F(`${o.n} modules`)}.`},
      {ctx,q:`La surface disponible sur le toit est de ${nf(o.A,1)} m². Suffit-elle ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${o.n} modules occupent ${o.n} × ${nf(o.Sm,1)} = ${nf(o.n*o.Sm,1)} m² ${ok?"≤":">"} ${nf(o.A,1)} m² : ${ok?"le toit suffit.":"le toit ne suffit pas ; il faudrait des modules de meilleur rendement ou une autre surface."}`}]; },
  /* rendement maximal d'une cellule sous lumière monochromatique */
  ()=>{ const [m,Eg,pool]=rnd([["silicium cristallin",1.12,[["bleue",450],["verte",530],["rouge",660],["infrarouge",940],["infrarouge",1300]]],["arséniure de gallium (GaAs)",1.42,[["bleue",450],["verte",530],["rouge",660],["infrarouge",810],["infrarouge",940]]]]);
    const lm=LnE(Eg), trap=pool.find(p=>p[1]>lm), sel=shuffle([trap,...shuffle(pool.filter(p=>p!==trap)).slice(0,3)]), abs=sel.filter(p=>p[1]<lm), best=abs.reduce((a,b)=>b[1]>a[1]?b:a), q1=rnd(abs.filter(p=>p!==best).concat([best])), E1=EeV(q1[1]), r1=Eg/E1*100;
    const lab=p=>`LED ${p[0]} (${nf(p[1],0)} nm)`, ctx=`Une cellule en ${m} (Eg = ${nfd(Eg,2)} eV) est éclairée par une LED. Chaque photon absorbé fournit au plus l'énergie Eg à un électron ; le reste est perdu en chaleur. ${DON(KH,KC,KE)}`;
    return [{fig:fx_opt_bandes({mode:"abs",eg:`= ${nfd(Eg,2)} eV`}),ctx,q:`Calcule l'énergie, en eV, des photons de la ${lab(q1)}.`,type:"num",ans:E1,tolR:0.02,unit:"eV",
        expl:`${F(EQE)} = ${FRAC(NHC,lamV(q1[1]))} = ${SC(EJ(q1[1]),"J",-19)}, soit ${U(E1,"eV")}.`},
      {ctx,q:"Quelle part de l'énergie de ces photons, au plus, est convertie en énergie électrique (en %) ?",type:"num",ans:r1,tolR:0.02,unit:"%",
        expl:`Au plus ${F(`${FRAC("Eg","E")} × 100`)} = ${FRAC(nfd(Eg,2),nfd(E1,3))} × 100 = ${U(r1,"%")} ; le reste, ${nfd(E1,3)} − ${nfd(Eg,2)} = ${nfd(E1-Eg,3)} eV par photon, chauffe la cellule.`},
      {ctx:`${ctx} On dispose de quatre LED de même puissance lumineuse : ${sel.map(lab).join(", ")}.`,q:"Laquelle permet le meilleur rendement de conversion de la cellule ?",type:"ch",...mc(cap(lab(best)),sel.filter(p=>p!==best).map(p=>cap(lab(p)))),
        expl:`La part convertie ${FRAC("Eg","E")} est d'autant plus grande que E est proche de Eg, à condition que ${F("E ≥ Eg")}, soit λ ≤ ${nf(lm,0)} nm. La ${lab(trap)} a des photons de ${nfd(EeV(trap[1]),2)} eV &lt; Eg : ils ne sont pas absorbés. La meilleure est la ${F(lab(best))} : ${nfd(EeV(best[1]),2)} eV par photon, soit au plus ${nf(Eg/EeV(best[1])*100,0)} % convertis.`}]; },
  /* vitesse des électrons extraits */
  ()=>{ const o=draw(()=>{ const M=rnd(MET), [d,l]=rnd(SRC.filter(s=>s[1]<600)), E=EeV(l); return {M,d,l,E,Ec:E-M[1]}; },o=>o.Ec>=0.5), Ecj=o.Ec*QE, v=Math.sqrt(2*Ecj/ME);
    const ctx=`Une plaque ${o.M[3]} (W₀ = ${nf(o.M[1],1)} eV) est éclairée par ${o.d} (λ = ${nf(o.l,0)} nm). ${DON(KH,KC,KE,KM)}`;
    return [{ctx,q:`Calcule l'énergie cinétique maximale d'un électron extrait, en ${p10(-19)} J.`,type:"num",ans:Ecj/1e-19,tolR:0.02,unit:UK(-19,"J"),
        expl:`${F(EQE)} = ${SC(EJ(o.l),"J",-19)} ; W₀ = ${nf(o.M[1],1)} × 1,60 × ${p10(-19)} = ${SC(o.M[1]*QE,"J",-19)}. ${F("Ec,max = E − W₀")} = ${F(SC(Ecj,"J",-19))} (soit ${nf(o.Ec,2)} eV).`},
      {ctx,q:"Quelle est la vitesse maximale des électrons extraits, en km/s ?",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
        expl:`${F(`Ec = ${FRAC("1","2")}·m·v²`)}, donc ${F(`v = √(${FRAC("2·Ec","m")})`)} = √(${FRAC(`2 × ${SC(Ecj,"",-19)}`,`9,11 × ${p10(-31)}`)}) = ${SC(v,"m/s")}, soit ${U(v/1000,"km/s")}.`}]; },
  /* mesure de h par l'effet photoélectrique, écart relatif */
  ()=>{ const o=draw(()=>{ const hx=rnd([6.2,6.3,6.4,6.5,6.55,6.7,6.75,6.8,6.9,7.0,7.1])*1e-34, W=rnd([2.1,2.3,2.4]), n1=rnd([7,7.5,8]), n2=rnd([10,10.5,11,11.5,12]);
        const Ec1=Number((hx*n1*1e14/QE-W).toFixed(2)), Ec2=Number((hx*n2*1e14/QE-W).toFixed(2)), h=(Ec2-Ec1)*QE/((n2-n1)*1e14), hR=Number((h/1e-34).toPrecision(3)), ec=Math.abs(hR-6.63)/6.63*100, disp=rnd([2,3,4,5,6,8]);
        return {hx,W,n1,n2,Ec1,Ec2,h,hR,ec,disp}; },o=>o.Ec1>=0.3&&o.ec>=0.3&&Math.abs(o.ec-o.disp)>=Math.max(0.6,0.25*o.disp));
    const ok=o.ec<o.disp, nu0=o.W*QE/o.hx/1e14, fig=fx_opt_ec({nu0,h:o.hx,xmax:14,ymax:Math.ceil(Math.max(o.Ec2+0.3,1)*2)/2,pts:[[o.n1,o.Ec1],[o.n2,o.Ec2]]});
    const data=TT(["Mesure","f (× 10<sup>14</sup> Hz)","Ec,max (eV)"],[["1",nf(o.n1,1),nfd(o.Ec1,2)],["2",nf(o.n2,1),nfd(o.Ec2,2)]]);
    const ctx=`Pour mesurer la constante de Planck, on éclaire une cellule photoémissive avec deux radiations et on mesure l'énergie cinétique maximale des électrons. Modèle : ${F("Ec,max = h·f − W₀")}. ${DON(KE)}`;
    return [{fig,data,ctx,q:`Calcule la pente de la droite, qui donne h, en ${p10(-34)} J·s.`,type:"num",ans:o.h/1e-34,tolR:0.02,unit:UK(-34,"J·s"),
        expl:`La pente de la droite Ec,max(f) est h. Avec Ec en joules : ${F(`h = ${FRAC("ΔEc","Δf")}`)} = ${FRAC(`(${nfd(o.Ec2,2)} − ${nfd(o.Ec1,2)}) × 1,60 × ${p10(-19)}`,`(${nf(o.n2,1)} − ${nf(o.n1,1)}) × ${p10(14)}`)} = ${F(SC(o.h,"J·s",-34))}.`},
      {fig,data,ctx,q:`Calcule l'écart relatif entre cette mesure et la valeur de référence h = 6,63 × ${p10(-34)} J·s, en %.`,type:"num",ans:o.ec,tolR:0.02,tolA:0.1,unit:"%",
        expl:`${F(`écart = ${FRAC("|h − h_réf|","h_réf")} × 100`)}, la référence étant h_réf = 6,63 × ${p10(-34)} J·s : ${FRAC(`|${nfd(o.hR,2)} − 6,63|`,"6,63")} × 100 = ${U(o.ec,"%")}.`},
      {fig,data,ctx,q:`La dispersion des essais est estimée à ${o.disp} %. Que peut-on conclure ?`,type:"ch",ch:["Les essais ne mettent pas le modèle en défaut","L'écart dépasse la dispersion des essais : le modèle ou le protocole est à revoir"],ok:ok?0:1,
        expl:`${S3(o.ec)} % ${ok?"&lt;":"&gt;"} ${o.disp} % : ${ok?"l'écart est inférieur à la dispersion des essais, les essais ne mettent pas le modèle en défaut.":"l'écart dépasse la dispersion des essais : il faut rechercher une erreur systématique (mesure de la fréquence, de l'énergie des électrons…)."}`}]; },
  /* photodiode : photons reçus, courant, seuil de détection */
  ()=>{ const o=draw(()=>{ const [d,l]=rnd([["une LED rouge",650],["une LED infrarouge",850],["une LED infrarouge",940],["une LED verte",530]]), P=rnd([2,5,10,20,50,100])*1e-6, eta=rnd([0.6,0.7,0.75,0.8,0.85]), E=EJ(l), N=P/E, I=eta*N*QE, Is=rnd([1,2,5,10,20])*1e-6;
        return {d,l,P,eta,E,N,I,Is}; },o=>far(o.I,o.Is,0.08)&&o.I>=0.1e-6);
    const k=kOf(o.N), ok=o.I>=o.Is, ctx=`Le capteur d'obstacle d'un robot (fonction acquérir) utilise une photodiode au silicium éclairée par ${o.d} (λ = ${nf(o.l,0)} nm). Elle reçoit une puissance lumineuse P = ${nf(o.P*1e6,0)} µW et ${nf(o.eta*100,0)} % des photons reçus libèrent chacun un électron. ${DON(KH,KC,`e = 1,60 × ${p10(-19)} C`)}`;
    return [{ctx,q:`Combien de photons la photodiode reçoit-elle par seconde ? Donne le résultat en ${p10(k)} photons par seconde.`,type:"num",ans:o.N/10**k,tolR:0.02,unit:UK(k,"photons/s"),
        expl:`${F(EQE)} = ${SC(o.E,"J",-19)} ; ${F(`N = ${FRAC("P","E")}`)} = ${FRAC(SC(o.P,"W"),SC(o.E,"J",-19))} = ${F(SC(o.N,"photons/s",k))}.`},
      {ctx,q:"Quelle est l'intensité du courant produit par la photodiode, en µA ?",type:"num",ans:o.I*1e6,tolR:0.02,unit:"µA",
        expl:`Électrons libérés par seconde : ${nf(o.eta,2)} × ${SC(o.N,"",k)} = ${SC(o.eta*o.N,"")}. Chaque électron porte la charge e : ${F("I = η·N·e")} = ${SC(o.eta*o.N,"")} × 1,60 × ${p10(-19)} = ${SC(o.I,"A")}, soit ${U(o.I*1e6,"µA")}.`},
      {ctx,q:`La carte du robot signale un obstacle si le courant atteint ${nf(o.Is*1e6,0)} µA. L'obstacle est-il signalé ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.I*1e6,2)} µA ${ok?"≥":"&lt;"} ${nf(o.Is*1e6,0)} µA : ${ok?"l'obstacle est signalé.":"le courant est trop faible, l'obstacle n'est pas signalé ; il faudrait une LED plus puissante ou un seuil plus bas."}`}]; },
  /* désinfection par UV-C : durée, photons reçus, choix de la source */
  ()=>{ const D=rnd([200,300,400,600]), Ee=rnd([5,8,10,12,15,20]), t=D/Ee, Eph=EJ(254), N=D/Eph, k=kOf(N), Es=rnd([3.8,4.0,4.2,4.4]), Ea=EeV(365);
    const ctx=`Pour désinfecter l'eau d'une citerne, on l'expose à une lampe UV-C (λ = 254 nm) qui produit à sa surface un éclairement E<sub>e</sub> = ${Ee} W/m². L'eau doit recevoir une énergie surfacique (dose) D = ${D} J/m². ${DON(KH,KC,KE)}`;
    return [{ctx,q:"Quelle durée d'exposition faut-il, en s ?",type:"num",ans:t,tolR:0.02,unit:"s",
        expl:`Un éclairement de ${Ee} W/m² apporte ${Ee} J par seconde sur chaque m² : ${F(`t = ${FRAC("D","E<sub>e</sub>")}`)} = ${FRAC(D,Ee)} = ${U(t,"s")}.`},
      {ctx,q:`Combien de photons chaque mètre carré reçoit-il pendant l'exposition ? Donne le résultat en ${p10(k)} photons.`,type:"num",ans:N/10**k,tolR:0.02,unit:UK(k,"photons"),
        expl:`Un photon à 254 nm : ${F(EQE)} = ${SC(Eph,"J",-19)}. Sur 1 m², l'énergie reçue D est partagée entre N photons : ${F(`N = ${FRAC("D","E")}`)} = ${FRAC(D,SC(Eph,"",-19))} = ${F(SC(N,"photons",k))}.`},
      {ctx:`${ctx} La réaction qui inactive les bactéries exige des photons d'au moins ${nfd(Es,1)} eV.`,q:"Peut-on remplacer la lampe par une LED UV-A (λ = 365 nm) qui donne le même éclairement ?",type:"ch",
        ...mc(`Non : ses photons (${nfd(Ea,2)} eV) sont moins énergétiques que le seuil, quelle que soit la durée`,["Oui, à condition d'allonger la durée d'exposition","Oui : à éclairement égal, l'effet est le même","Non : une LED ne peut pas émettre d'ultraviolet"]),
        expl:`Photons UV-A : ${FRAC(NHC,lamV(365))} = ${SC(EJ(365),"J",-19)}, soit ${nfd(Ea,2)} eV &lt; ${nfd(Es,1)} eV. Chaque photon agit seul : il ne suffit pas d'en envoyer plus longtemps. Les photons UV-C (${nfd(EeV(254),2)} eV) dépassent le seuil.`}]; },
  /* deux LED de même puissance : laquelle émet le plus de photons ? */
  ()=>{ const lb=rnd([450,460,470]), [cn,lo,ph]=rnd([["rouge",rnd([625,630,650]),"rouges"],["infrarouge",rnd([850,940]),"infrarouges"],["verte",rnd([520,530]),"verts"]]), P=rnd([50,100,200]), r=lo/lb;
    const ctx=`Deux LED émettent la même puissance lumineuse P = ${P} mW : une LED bleue (λ = ${lb} nm) et une LED ${cn} (λ = ${lo} nm).`;
    return [{ctx,q:"Laquelle émet le plus de photons par seconde ?",type:"ch",...mc(`La LED ${cn}`,["La LED bleue","Aucune : à puissance égale, elles émettent autant de photons"]),
        expl:`${F(`N = ${FRAC("P","E")}`)} avec ${F(EQE)} : ${F(`N = ${FRAC("P·λ","h·c")}`)}. À puissance égale, les photons ${ph}, moins énergétiques (λ plus grande), sont plus nombreux.`},
      {ctx,q:`Calcule le rapport entre le nombre de photons émis par seconde par la LED ${cn} et par la LED bleue.`,type:"num",ans:r,tolA:0.01,tolR:0.01,unit:"",
        expl:`Avec l'indice 2 pour la LED ${cn} et 1 pour la LED bleue : ${F(`${FRAC("N₂","N₁")} = ${FRAC("λ₂","λ₁")}`)}, car P, h et c se simplifient. ${FRAC(lo,lb)} = ${U(r,"")}.`}]; },
  /* lumière visible sur un métal à grand travail d'extraction : la puissance ne suffit pas */
  ()=>{ const o=draw(()=>{ const M=rnd(MET.filter(m=>m[1]>=2.9)), [c,l]=rnd([["un laser rouge",650],["un laser vert",532],["un laser violet",405]]), E=EeV(l); return {M,c,l,E}; },o=>o.E<o.M[1]&&far(o.E,o.M[1],0.05));
    const l0=LnE(o.M[1]), ctx=`On éclaire une plaque ${o.M[3]} (W₀ = ${nf(o.M[1],1)} eV) avec ${o.c} (λ = ${o.l} nm) de 5 mW : aucun électron n'est extrait. ${DON(KH,KC,KE)}`;
    return [{ctx,q:"Calcule l'énergie d'un photon de ce laser, en eV.",type:"num",ans:o.E,tolR:0.02,unit:"eV",
        expl:`${F(EQE)} = ${FRAC(NHC,lamV(o.l))} = ${SC(EJ(o.l),"J",-19)}, soit ${U(o.E,"eV")}, inférieure à W₀ = ${nf(o.M[1],1)} eV.`},
      {ctx,q:`Un élève propose d'utiliser ${o.c} de même longueur d'onde mais dix fois plus puissant. Obtiendra-t-il l'effet photoélectrique ?`,type:"ch",
        ...mc("Non : chaque photon garde la même énergie, inférieure à W₀ ; il faut une radiation de longueur d'onde plus courte",["Oui : dix fois plus de puissance fournit assez d'énergie pour extraire des électrons","Oui, à condition d'éclairer la plaque assez longtemps","Non : la plaque renverra toute la lumière reçue"]),
        expl:`Un électron est extrait par un seul photon : il faut ${F("E ≥ W₀")} pour chaque photon. Dix fois plus de puissance donne dix fois plus de photons, tous de ${nfd(o.E,2)} eV : toujours aucun électron.`},
      {ctx,q:"Quelle est la plus grande longueur d'onde utilisable, en nm ?",type:"num",ans:l0,tolR:0.02,unit:"nm",
        expl:`${F(`λ₀ = ${FRAC("h·c","W₀")}`)} = ${FRAC(NHC,`${nf(o.M[1],1)} × 1,60 × ${p10(-19)}`)} = ${U(l0,"nm")} : il faut une source de longueur d'onde inférieure, dans le domaine ${domN(l0)}.`}]; }
];

POOLS["phy-optique"]={
  titre:"Photons, spectre, photoélectricité",
  fiche:{t:"Optique : le photon",l:[
    `Photon de fréquence f : ${F(`E = h·f = ${FRAC("h·c","λ")}`)}, λ en mètres ; conversion ${F(`1 eV = 1,60 × ${p10(-19)} J`)} ; photons émis par seconde : ${F(`N = ${FRAC("P","E")}`)}.`,
    `Spectre : ultraviolet pour ${F("λ &lt; 400 nm")}, visible de 400 à 800 nm, infrarouge pour ${F("λ > 800 nm")} ; plus λ est courte, plus le photon est énergétique.`,
    `Effet photoélectrique : un photon extrait un électron si ${F("E ≥ W₀")} (travail d'extraction), avec ${F("Ec,max = E − W₀")} ; fréquence seuil ${F(`f₀ = ${FRAC("W₀","h")}`)}.`,
    `Semi-conducteur de gap Eg : photon absorbé si ${F("E ≥ Eg")} ; une LED émet vers ${F(`λ ≈ ${FRAC("h·c","Eg")}`)} ; rendement d'une cellule : ${F(`η = ${FRAC("P_élec","G·S")}`)}.`,
    `Pièges : λ en nm non convertie (1 nm = ${p10(-9)} m) ; J et eV confondus ; plus de puissance donne plus de photons, pas des photons plus énergétiques ; dans une cellule, l'excédent E − Eg est perdu en chaleur.`]},
  count:{1:4,2:4,3:3},1:OPT1,2:OPT2,3:OPT3
};

})();
