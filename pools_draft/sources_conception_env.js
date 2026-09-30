/* Réservoirs : photovoltaïque, éolien, hydrogène (ener-sources) · innovation et conception (innov-conception) · impact environnemental (dd-environnement).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_sce_ (communes), fx_src_, fx_inn_ et fx_dd_. */
(function(){
"use strict";

/* ===== outils locaux ===== */
/* affichage à 3 chiffres significatifs, identique au contrôle de la page */
const S3=x=>{ const v=Number.isInteger(x)?x:Math.abs(x)>=100?Math.round(x):Number(x.toPrecision(3)); return v.toLocaleString("fr-FR",{maximumFractionDigits:6}); };
const U=(x,u)=>F(`${S3(x)}${u?" "+u:""}`);
/* tirage avec condition (évite les conclusions à la limite) */
const draw=(gen,ok)=>{ for(let i=0;i<20000;i++){ const v=gen(); if(ok(v)) return v; } throw new Error("tirage impossible"); };
const far=(x,ref,r)=>Math.abs(x-ref)/Math.abs(ref)>=(r||0.05);
/* arrondi à l'entier supérieur sans ambiguïté : partie décimale entre 0,1 et 0,9 */
const net=r=>{ const f=r-Math.floor(r); return f>=0.1&&f<=0.9; };
const YN=["Oui","Non"];
const OL=st=>`<ol style="margin:0;padding-left:1.4em">${st.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const r2=(x,d)=>Math.round(x*10**d)/10**d;
const ecart=(x,ref)=>Math.abs(x-ref)/Math.abs(ref)*100;
const sum=a=>a.reduce((s,x)=>s+x,0);
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
const lc1=t=>t.charAt(0).toLowerCase()+t.slice(1);
const pc=(x,d)=>`${nf(x*100,d==null?1:d)} %`;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
/* valeur intermédiaire à 4 chiffres significatifs */
const S4=x=>{ const a=Math.abs(x); return nf(x,a>=1000?0:a>=100?1:a>=10?2:a>=1?3:4); };
/* tableau de texte (sans colonnes numériques alignées à droite) */
const tabL=(head,rows)=>`<table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
/* réponse mise en valeur : F (insécable) si courte, gras sinon */
const HL=t=>String(t).replace(/<[^>]*>/g,"").length>40?`<b>${t}</b>`:F(t);
const PCI=33.3;                      /* kWh/kg, toujours rappelé dans l'énoncé */
const PCIT="PCI du dihydrogène : 33,3 kWh/kg";
const RHO="ρ(air) = 1,2 kg/m³";

/* ===== outils de dessin ===== */
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const decOf=st=>{ const s=String(+(+st).toPrecision(6)); const i=s.indexOf("."); return i<0?0:s.length-i-1; };
/* texte avec un liseré couleur papier (lisible par-dessus une courbe) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
const dot=(x,y,r)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r||4}" class="v-dot"/>`;
const poly=(pts,cls,st)=>`<polyline points="${pts.map(P2).join(" ")}" class="${cls}"${st?` style="${st}"`:""}/>`;
const line2=(x1,y1,x2,y2,cls,st)=>`<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" class="${cls}"${st?` style="${st}"`:""}/>`;
const vcote=(x,y1,y2,t,a)=>`<line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+(t?T(x+(a==="end"?-6:6),(y1+y2)/2+4,t,"v-cap",a||"start"):"");
const FILL=["fill:var(--accent);fill-opacity:.3;stroke:var(--accent);stroke-width:1.2","fill:var(--coulomb);fill-opacity:.28;stroke:var(--coulomb);stroke-width:1.2"];
const C2="stroke:var(--coulomb)";
/* repère gradué : o.x0 (défaut 0), o.x1, o.xs (pas des étiquettes), o.xg (pas de la grille), o.y1, o.ys, o.yg, o.xl, o.yl, o.xf / o.yf (format des étiquettes) */
function frame(o){
  const X0=o.X0||62, Y0=o.Y0||204, W=o.W||300, H=o.H||160, x0=o.x0||0, xg=o.xg||o.xs, yg=o.yg||o.ys;
  const sx=W/(o.x1-x0), sy=H/o.y1, X=x=>X0+(x-x0)*sx, Y=y=>Y0-y*sy;
  let s="";
  const nxg=Math.round((o.x1-x0)/xg), nyg=Math.round(o.y1/yg), nxs=Math.round((o.x1-x0)/o.xs), nys=Math.round(o.y1/o.ys), dx=decOf(o.xs), dy=decOf(o.ys);
  for(let k=0;k<=nxg;k++) s+=L(X(x0+k*xg),Y0,X(x0+k*xg),Y0-H,"v-grid");
  for(let k=0;k<=nyg;k++) s+=L(X0,Y(k*yg),X0+W,Y(k*yg),"v-grid");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-18,"v-ink","k");
  for(let k=0;k<=nxs;k++){ const x=x0+k*o.xs; s+=T(X(x),Y0+16,o.xf?o.xf(x):nf(x,dx),"v-lab s","middle"); }
  for(let k=0;k<=nys;k++){ const y=k*o.ys; s+=T(X0-6,Y(y)+4,o.yf?o.yf(y):nf(y,dy),"v-lab s","end"); }
  s+=T(X0+W+12,Y0+34,o.xl||"","v-cap","end")+T(X0+8,Y0-H-8,o.yl||"","v-cap");
  return {s,X,Y,X0,Y0,W,H};
}

/* ===== figures communes ===== */
/* diagramme en barres verticales : o.c = catégories (texte ou [lignes]) ; o.s = [{v:[…], n:"légende"}] (une ou deux séries) ;
   o.y1, o.ys (pas des étiquettes), o.yg (pas de la grille) ; o.yl : titre de l'axe ; o.val : format des valeurs affichées au-dessus des barres */
function fx_sce_barres(o){
  const nl=Math.max(...o.c.map(c=>Array.isArray(c)?c.length:1)), X0=58, W=326, H=150, Y0=o.s.length>1?194:182;
  const nC=o.c.length, nS=o.s.length, slot=W/nC, bw=Math.min(36,slot*(nS>1?0.36:0.6)), sy=H/o.y1, Y=v=>Y0-v*sy;
  const nyg=Math.round(o.y1/(o.yg||o.ys)), nys=Math.round(o.y1/o.ys), dy=decOf(o.ys);
  let s="";
  for(let k=0;k<=nyg;k++) s+=L(X0,Y(k*(o.yg||o.ys)),X0+W,Y(k*(o.yg||o.ys)),"v-grid");
  for(let k=0;k<=nys;k++) s+=T(X0-6,Y(k*o.ys)+4,nf(k*o.ys,dy),"v-lab s","end");
  o.c.forEach((c,i)=>{ const cx=X0+slot*(i+0.5);
    o.s.forEach((se,j)=>{ const v=se.v[i], x=cx+(nS>1?(j-0.5)*(bw+3):0)-bw/2;
      if(v>0) s+=`<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(v*sy).toFixed(1)}" style="${FILL[j]}"/>`;
      if(o.val) s+=T(x+bw/2,Y(v)-5,o.val(v),"v-lab s","middle"); });
    s+=multi(cx,Y0+15,(Array.isArray(c)?c:[c]).map(String),"v-sm","middle",12);
  });
  s+=L(X0,Y0,X0+W+6,Y0,"v-ink")+L(X0,Y0,X0,Y0-H-16,"v-ink","k")+T(X0+8,Y0-H-8,esc(o.yl||""),"v-cap");
  if(nS>1) o.s.forEach((se,j)=>{ const x=X0+W-(nS-j)*124+10; s+=`<rect x="${x}" y="${Y0-H-38}" width="12" height="10" style="${FILL[j]}"/>`+T(x+17,Y0-H-29,esc(se.n),"v-cap"); });
  return svg(Y0+15+12*(nl-1)+10,s,o.alt||"Diagramme en barres");
}
/* étapes en ligne : o.b = [{t:[lignes], q}] (q : case « ? ») ; o.back = {from, to, lab} : flèche de retour sous les blocs ; o.cap : légende */
function fx_sce_flow(o){
  const n=o.b.length, G=14, W=(392-(n-1)*G)/n, yB=12, H=48, X=i=>4+i*(W+G);
  let s="";
  o.b.forEach((b,i)=>{ const x=X(i), cx=x+W/2;
    s+=`<rect x="${x.toFixed(1)}" y="${yB}" width="${W.toFixed(1)}" height="${H}" rx="4" class="${b.q?"v-boxq":"v-box"}"/>`;
    s+=b.q?T(cx,yB+H/2+9,"?","v-q","middle"):multi(cx,yB+H/2-(b.t.length-1)*6.5+4,b.t,"v-sm","middle",13);
    if(i<n-1) s+=L(x+W,yB+H/2,X(i+1)-1,yB+H/2,"v-thin","k");
  });
  let h=yB+H+12;
  if(o.back){ const xa=X(o.back.from)+W/2, xb=X(o.back.to)+W/2, yb=yB+H+26;
    s+=`<polyline points="${xa.toFixed(1)},${yB+H} ${xa.toFixed(1)},${yb} ${xb.toFixed(1)},${yb} ${xb.toFixed(1)},${yB+H+3}" class="v-inf" marker-end="url(#m-d)"/>`;
    s+=T((xa+xb)/2,yb+16,esc(o.back.lab),"v-cap","middle"); h=yb+26; }
  if(o.cap){ s+=T(200,h+4,esc(o.cap),"v-cap","middle"); h+=16; }
  return svg(h,s,o.alt||"Enchaînement des étapes");
}

/* ===== figures : sources d'énergie ===== */
/* éolienne tripale vue de face : o.R ou o.D (texte de la cote), o.v (texte de la vitesse du vent) */
function fx_src_eol(o){
  const hx=206, hy=104, Rb=78, gy=238;
  let s=ground(14,386,gy);
  s+=`<circle cx="${hx}" cy="${hy}" r="${Rb}" class="v-dash"/>`;
  s+=`<polygon points="${hx-7},${gy} ${hx+7},${gy} ${hx+3},${hy+12} ${hx-3},${hy+12}" class="v-body"/>`;
  [90,210,330].forEach(a=>{ const d=[Math.cos(rad(a)),-Math.sin(rad(a))], n=[-d[1],d[0]], p=(r,w)=>[hx+d[0]*r+n[0]*w,hy+d[1]*r+n[1]*w];
    s+=`<polygon points="${[p(0,3),p(Rb*0.24,7),p(Rb-2,1.6),p(Rb-2,-1.6),p(Rb*0.24,-4),p(0,-3)].map(P2).join(" ")}" class="v-block"/>`; });
  s+=`<circle cx="${hx}" cy="${hy}" r="8" class="v-wheel"/>`;
  [hy-44,hy,hy+44].forEach(y=>{ s+=L(22,y,98,y,"v-n","a"); });
  s+=T(60,hy-54,esc(o.v||"v"),"v-lab a","middle")+T(60,hy+70,"vent","v-cap","middle");
  const xc=hx+Rb+24;
  if(o.D){ s+=L(hx,hy-Rb,xc+6,hy-Rb,"v-dash")+L(hx,hy+Rb,xc+6,hy+Rb,"v-dash")+vcote(xc,hy-Rb,hy+Rb,esc(o.D)); }
  else if(o.R){ s+=L(hx,hy-Rb,xc+6,hy-Rb,"v-dash")+L(hx+10,hy,xc+6,hy,"v-dash")+vcote(xc,hy-Rb,hy,esc(o.R)); }
  return svg(gy+14,s,"Éolienne tripale vue de face : le rotor balaie un disque, le vent arrive perpendiculairement");
}
/* courbe de puissance d'une éolienne : o.t = {Pn, vd, vn, vc, st (résolution), y1, ys} ; o.mark = vitesse repérée (projections en tirets) */
const PW=(t,v)=>v<t.vd?0:v>t.vc?0:v>=t.vn?t.Pn:r2(Math.round(t.Pn*(v**3-t.vd**3)/(t.vn**3-t.vd**3)/t.st)*t.st,4);
function fx_src_courbeP(o){
  const t=o.t, fr=frame({x1:26,xs:5,xg:1,y1:t.y1,ys:t.ys,yg:t.st*(t.y1/t.st>32?2:1),xl:"v (m/s)",yl:`P (${t.u||"kW"})`});
  const pts=[[t.vd,0]]; for(let v=t.vd+1;v<t.vn;v++) pts.push([v,PW(t,v)]); pts.push([t.vn,t.Pn],[t.vc,t.Pn],[t.vc,0]);
  let s=fr.s+poly(pts.map(p=>[fr.X(p[0]),fr.Y(p[1])]),"v-curve");
  for(let v=t.vd+1;v<t.vn;v++) s+=dot(fr.X(v),fr.Y(PW(t,v)),2.8);
  if(o.mark!=null){ const P=PW(t,o.mark); s+=L(fr.X(o.mark),fr.Y(0),fr.X(o.mark),fr.Y(P),"v-dash")+L(fr.X0,fr.Y(P),fr.X(o.mark),fr.Y(P),"v-dash"); }
  return svg(248,s,o.alt||"Courbe de puissance d'une éolienne : puissance électrique fournie en fonction de la vitesse du vent");
}
/* chaîne de conversion : o.b = [{t:[lignes], e (texte sous le bloc), s:[lignes sous le bloc], q}] ; o.a = [{t, v, k}] entre blocs ;
   o.in, o.out = {t, v, k} (flèches d'entrée et de sortie) ; k : "el" électrique, "h2" dihydrogène, "me" mécanique, "lu" rayonnement */
const KF={el:["v-el","a","v-lab s a"],h2:["v-vec","k","v-lab s"],me:["v-me","c","v-lab s c"],lu:["v-f","f","v-lab s"]};
function fx_src_chaine(o){
  const n=o.b.length, A=o.in?(n>=4?34:40):0, B=o.out?(n>=4?34:40):0, G=n>=4?20:28, W=Math.min(108,(392-A-B-(n-1)*G)/n), tot=A+B+n*W+(n-1)*G, x0=(400-tot)/2+A;
  const yB=42, H=48, ym=yB+H/2, X=i=>x0+i*(W+G);
  let s="";
  o.b.forEach((b,i)=>{ const x=X(i), cx=x+W/2, cl=b.t.some(l=>l.length*7.6>W-8)?"v-sm":"v-smb";
    s+=`<rect x="${x.toFixed(1)}" y="${yB}" width="${W.toFixed(1)}" height="${H}" rx="4" class="${b.q?"v-boxq":"v-box"}"/>`+multi(cx,ym-(b.t.length-1)*6.5+4,b.t,cl,"middle");
    let y=yB+H+16; if(b.e){ s+=T(cx,y,esc(b.e),"v-lab s","middle"); y+=15; }
    (b.s||[]).forEach(l=>{ s+=T(cx,y,esc(l),"v-sm","middle"); y+=13; });
  });
  const arr=(x1,x2,a,an)=>{ const k=KF[a.k||"el"]; let r=L(x1,ym,x2,ym,k[0],k[1]); const xl=an==="start"?x1:an==="end"?x2:(x1+x2)/2;
    if(a.t) r+=T(xl,yB-22,esc(a.t),k[2],an); if(a.v) r+=T(xl,yB-8,esc(a.v),a.v==="?"?"v-lab s c":k[2],an); return r; };
  if(o.in) s+=arr(x0-A,x0-1,o.in,"start");
  (o.a||[]).forEach((a,i)=>{ if(i<n-1) s+=arr(X(i)+W,X(i+1)-1,a,"middle"); });
  if(o.out) s+=arr(X(n-1)+W,X(n-1)+W+B-1,o.out,"end");
  const ext=Math.max(...o.b.map(b=>(b.e?15:0)+13*(b.s||[]).length));
  let h=yB+H+ext+14; if(o.cap){ s+=T(200,h+4,esc(o.cap),"v-cap","middle"); h+=16; }
  return svg(h,s,o.alt||"Chaîne de conversion de l'énergie");
}
/* irradiance au cours d'une journée, profil modélisé en trapèze : o.t = [t0, t1, t2, t3] (h), o.G (W/m²) */
function fx_src_irr(o){
  const fr=frame({x0:4,x1:20,xs:2,xg:1,y1:1200,ys:200,yg:100,xl:"heure de la journée (h)",yl:"G (W/m²)"});
  const [t0,t1,t2,t3]=o.t, pts=[[t0,0],[t1,o.G],[t2,o.G],[t3,0]].map(p=>[fr.X(p[0]),fr.Y(p[1])]);
  let s=fr.s+`<polygon points="${pts.map(P2).join(" ")}" style="fill:var(--accent);fill-opacity:.14;stroke:none"/>`+poly(pts,"v-curve");
  s+=L(fr.X0,fr.Y(o.G),fr.X(t1),fr.Y(o.G),"v-dash")+L(fr.X(t1),fr.Y(o.G),fr.X(t1),fr.Y0,"v-dash")+L(fr.X(t2),fr.Y(o.G),fr.X(t2),fr.Y0,"v-dash");
  return svg(248,s,"Irradiance reçue par un panneau au cours d'une journée ensoleillée, profil modélisé en trapèze");
}
/* coefficient de puissance Cp en fonction de la vitesse spécifique λ : o.lo (λ optimal), o.cm (Cp maximal) */
const cpL=(lo,cm)=>l=>cm*(l/lo)*Math.exp(1-l/lo);
function fx_src_cp(o){
  const fr=frame({x1:16,xs:2,xg:1,y1:0.7,ys:0.1,yg:0.05,xl:"λ",yl:"Cp"}), f=cpL(o.lo,o.cm);
  const pts=[]; for(let i=0;i<=160;i++){ const l=16*i/160; pts.push([fr.X(l),fr.Y(f(l))]); }
  let s=fr.s+L(fr.X0,fr.Y(16/27),fr.X0+fr.W,fr.Y(16/27),"v-dash")+Th(fr.X0+fr.W-4,fr.Y(16/27)-6,"limite de Betz (Cp ≈ 0,59)","v-cap","end");
  s+=poly(pts,"v-curve");
  return svg(248,s,"Coefficient de puissance du rotor en fonction de la vitesse spécifique λ");
}

/* ===== figures : innovation et conception ===== */
/* bête à cornes : o.a (à qui), o.b (sur quoi), o.p (produit), o.c (dans quel but) ; "?" : case à trouver */
function fx_inn_bete(o){
  const box=(x,y,w,h,q,a)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${a==="?"?"v-boxq":"v-box"}"/>`+T(x+w/2,y+16,esc(q),"v-cap","middle")
    +(a==="?"?T(x+w/2,y+h-12,"?","v-lab c","middle"):multi(x+w/2,y+33,wrapTxt(a,w>200?40:27).slice(0,2),"v-smb","middle",12));
  let s=box(6,8,180,58,"À qui rend-il service ?",o.a)+box(214,8,180,58,"Sur quoi agit-il ?",o.b);
  s+=`<path d="M96 66 C 96 168, 304 168, 304 66" class="v-thin"/>`;
  s+=`<ellipse cx="200" cy="102" rx="84" ry="22" class="v-body"/>`+multi(200,106-(wrapTxt(o.p,24).length>1?6:0),wrapTxt(o.p,24).slice(0,2),"v-smb","middle",12);
  s+=L(200,143,200,168,"v-thin","k");
  s+=box(50,170,300,58,"Dans quel but ?",o.c);
  return svg(236,s,"Bête à cornes : à qui le produit rend-il service, sur quoi agit-il, dans quel but");
}
/* cycle de vie commercial d'un produit : ventes en fonction du temps ; o.b = [t1, t2, t3] (frontières des phases, en années), o.T (durée affichée), o.tp (pic), o.names : noms des phases */
function fx_inn_vie(o){
  const X0=52, Y0=196, W=330, H=150, X=t=>X0+t*W/o.T, k=4, f=t=>Math.pow(t/o.tp,k)*Math.exp(k*(1-t/o.tp)), Y=v=>Y0-v*H*0.9;
  let s="";
  for(let t=1;t<=o.T;t++) s+=L(X(t),Y0,X(t),Y0-H,"v-grid");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-18,"v-ink","k");
  for(let t=0;t<=o.T;t+=2) s+=T(X(t),Y0+16,String(t),"v-lab s","middle");
  const pts=[]; for(let i=0;i<=200;i++){ const t=o.T*i/200; pts.push([X(t),Y(f(t))]); }
  s+=`<polygon points="${P2([X0,Y0])} ${pts.map(P2).join(" ")} ${P2([X(o.T),Y0])}" style="fill:var(--accent);fill-opacity:.1;stroke:none"/>`+poly(pts,"v-curve");
  const bd=[0,...o.b,o.T];
  o.b.forEach(t=>{ s+=L(X(t),Y0,X(t),Y0-H-4,"v-dash"); });
  for(let i=0;i<4;i++){ const cx=(X(bd[i])+X(bd[i+1]))/2; s+=numLab(cx,Y0-H+20,String(i+1)); }
  s+=T(X0+W+12,Y0+34,"temps depuis le lancement (années)","v-cap","end")+T(X0+8,Y0-H-8,"ventes annuelles","v-cap");
  return svg(244,s,"Cycle de vie commercial d'un produit : ventes annuelles en fonction du temps, quatre phases numérotées");
}
/* plaque percée vue de dessus : o.L, o.l (mm), o.d (diamètre des trous, mm), o.n (1, 2 ou 4 trous), o.m (distance des trous aux bords pour 4 trous), o.e (épaisseur) */
function fx_inn_piece(o){
  const k=Math.min(270/o.L,120/o.l), w=o.L*k, h=o.l*k, x0=(400-w)/2-12, y0=22, cx=x0+w/2, cy=y0+h/2, r=o.d/2*k;
  let s=`<rect x="${x0.toFixed(1)}" y="${y0}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" class="v-body"/>`;
  const holes=o.n===1?[[cx,cy]]:o.n===2?[[x0+w/4,cy],[x0+3*w/4,cy]]:[[x0+o.m*k,y0+o.m*k],[x0+w-o.m*k,y0+o.m*k],[x0+o.m*k,y0+h-o.m*k],[x0+w-o.m*k,y0+h-o.m*k]];
  holes.forEach(p=>{ s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}" class="v-box"/>`+L(p[0]-r-3,p[1],p[0]+r+3,p[1],"v-dash")+L(p[0],p[1]-r-3,p[0],p[1]+r+3,"v-dash"); });
  s+=L(x0,y0+h+4,x0,y0+h+30,"v-dash")+L(x0+w,y0+h+4,x0+w,y0+h+30,"v-dash")+cote(x0,x0+w,y0+h+24,`${nf(o.L,1)} mm`);
  s+=L(x0+w+4,y0,x0+w+30,y0,"v-dash")+L(x0+w+4,y0+h,x0+w+30,y0+h,"v-dash")+vcote(x0+w+24,y0,y0+h,`${nf(o.l,1)} mm`);
  s+=T(200,y0+h+52,`épaisseur : ${nf(o.e,1)} mm · ${o.n===1?"1 trou":`${o.n} trous`} de diamètre ${nf(o.d,1)} mm`,"v-cap","middle");
  return svg(y0+h+62,s,"Plaque rectangulaire percée, vue de dessus, avec ses cotes");
}

/* ===== figures : impact environnemental ===== */
/* émissions cumulées de deux solutions : o.a = [{F, a, lab}] (émissions de départ F, pente a par an) ; o.N (années) ; o.y1, o.ys, o.yg ; o.u (unité) ; o.xs */
function fx_dd_cumul(o){
  const fr=frame({x1:o.N,xs:o.xs||2,xg:1,y1:o.y1,ys:o.ys,yg:o.yg,xl:"durée d'utilisation (années)",yl:`émissions cumulées (${o.u})`});
  let s=fr.s;
  const yv=(c,t)=>c.F+c.a*t;
  o.a.forEach((c,i)=>{ const x2=Math.min(o.N,(o.y1-c.F)/c.a); s+=line2(fr.X(0),fr.Y(c.F),fr.X(x2),fr.Y(yv(c,x2)),"v-curve",i?C2:""); });
  /* étiquettes : celle de la droite qui part le plus haut près de l'axe vertical, l'autre à droite ; chacune dégagée des deux droites */
  const N=o.N, hi=o.a[0].F>=o.a[1].F?0:1;
  o.a.forEach((c,i)=>{ const oth=o.a[1-i], cl=i?"v-lab s c":"v-lab s a";
    if(i===hi){ const up=c.F>=oth.F, yb=up?fr.Y(Math.max(yv(c,0.45*N),yv(oth,0.45*N)))-8:fr.Y(c.F)+16; s+=Th(fr.X(0.03*N),yb,esc(c.lab),cl,"start"); }
    else { const up=yv(c,N)>=yv(oth,N), yb=up?fr.Y(Math.min(yv(c,N),o.y1))-8:fr.Y(yv(c,0.55*N))+16; s+=Th(fr.X(0.97*N),yb,esc(c.lab),cl,"end"); } });
  return svg(248,s,o.alt||"Émissions cumulées de gaz à effet de serre de deux solutions en fonction de la durée d'utilisation");
}
/* phases du cycle de vie : noms, étiquettes des figures, description */
const PHN=["Extraction des matières premières","Fabrication","Transport","Utilisation","Fin de vie"];
const PHB=[["Matières","premières"],["Fabrication"],["Transport"],["Utilisation"],["Fin de vie"]];
const PHD=["on prélève les ressources dans la nature (minerais, pétrole, sable…), avant toute transformation",
  "les matières sont transformées, puis les pièces sont fabriquées et assemblées",
  "le produit fini est acheminé jusqu'à son lieu d'utilisation",
  "le produit sert : énergie, carburant, consommables et entretien pendant toute sa durée de service",
  "le produit hors d'usage est collecté, démonté, puis recyclé ou éliminé"];
/* barres horizontales groupées, une ligne par phase, valeurs écrites au bout des barres :
   o.c = phases (texte ou [lignes]) ; o.s = [{v:[…], n:"légende"}] (une ou deux séries) ; o.x1 (fin de l'axe), o.xs (pas des graduations) ; o.xl : titre de l'axe ; o.val : format des valeurs */
function fx_dd_hbar(o){
  const nC=o.c.length, nS=o.s.length, X0=96, W=240, bh=nS>1?13:16, gp=3, bnd=nS*bh+(nS-1)*gp+12, Y0=nS>1?30:12;
  const X=v=>X0+v*W/o.x1, Hb=nC*bnd, nx=Math.round(o.x1/o.xs), dx=decOf(o.xs), fv=o.val||(x=>nf(x,0));
  let s="";
  for(let k=0;k<=nx;k++){ const x=X(k*o.xs); s+=L(x,Y0,x,Y0+Hb,"v-grid")+T(x,Y0+Hb+15,nf(k*o.xs,dx),"v-sm","middle"); }
  o.c.forEach((c,i)=>{ const y=Y0+i*bnd+6, lines=Array.isArray(c)?c:[c], ym=y+(nS*bh+(nS-1)*gp)/2;
    s+=multi(X0-8,ym-(lines.length-1)*6+4,lines,"v-sm","end",12);
    o.s.forEach((se,j)=>{ const v=se.v[i], yy=y+j*(bh+gp);
      if(v>0) s+=`<rect x="${X0}" y="${yy.toFixed(1)}" width="${(X(v)-X0).toFixed(1)}" height="${bh}" style="${FILL[j]}"/>`;
      s+=T(X(v)+5,yy+bh/2+4.5,fv(v),"v-lab s"); }); });
  s+=L(X0,Y0-4,X0,Y0+Hb,"v-ink");
  s+=T(X0+W,Y0+Hb+32,esc(o.xl||""),"v-cap","end");
  if(nS>1) o.s.forEach((se,j)=>{ const x=X0+j*150; s+=`<rect x="${x}" y="8" width="12" height="10" style="${FILL[j]}"/>`+T(x+17,17,esc(se.n),"v-cap"); });
  return svg(Y0+Hb+40,s,o.alt||"Émissions de gaz à effet de serre, phase par phase du cycle de vie");
}
/* voies de fin de vie : cinq phases en ligne ; boucle 1 (fin de vie → utilisation), boucle 2 (fin de vie → fabrication), flèche 3 (élimination) */
function fx_dd_boucles(){
  const n=5, G=12, W=(392-(n-1)*G)/n, yB=8, H=44, X=i=>4+i*(W+G), cx=i=>X(i)+W/2, yb=yB+H, x4=cx(4);
  const pl=(pts,c,m)=>`<polyline points="${pts.map(P2).join(" ")}" class="${c}" marker-end="url(#m-${m})"/>`;
  let s="";
  PHB.forEach((t,i)=>{ s+=`<rect x="${X(i).toFixed(1)}" y="${yB}" width="${W.toFixed(1)}" height="${H}" rx="4" class="v-box"/>`+multi(cx(i),yB+H/2-(t.length-1)*6.5+4,t,"v-sm","middle",13);
    if(i<n-1) s+=L(X(i)+W,yB+H/2,X(i+1)-1,yB+H/2,"v-thin","k"); });
  s+=pl([[x4-14,yb],[x4-14,yb+26],[cx(3),yb+26],[cx(3),yb+3]],"v-n","a")+numLab((x4-14+cx(3))/2,yb+26,"1");
  s+=pl([[x4,yb],[x4,yb+56],[cx(1),yb+56],[cx(1),yb+3]],"v-me","c")+numLab((x4+cx(1))/2,yb+56,"2");
  s+=L(x4+14,yb,x4+14,yb+84,"v-f","f")+numLab(x4+14,yb+68,"3");
  s+=rbox(292,yb+86,104,34,["Enfouissement,","incinération"]);
  return svg(yb+128,s,"Voies possibles pour un produit en fin de vie : deux boucles numérotées 1 et 2 et une flèche numérotée 3");
}

/* ======================================================================
   SOURCES D'ÉNERGIE : PHOTOVOLTAÏQUE, ÉOLIEN, HYDROGÈNE (ener-sources)
   ====================================================================== */
/* panneaux : longueur × largeur (m) */
const PAN=[[1.72,1.13],[1.76,1.05],[1.69,1.05],[1.96,0.99],[2.08,1.0],[1.65,0.99]];
/* éoliennes : puissance nominale (kW), vitesses de démarrage, nominale et de coupure (m/s), résolution et graduations de la courbe */
const TURB=[
  {nm:"une petite éolienne de 3 kW",d:"d'une petite éolienne de 3 kW",Pn:3,vd:3,vn:11,vc:20,st:0.2,y1:3.6,ys:0.5},
  {nm:"une éolienne de 10 kW",d:"d'une éolienne de 10 kW",Pn:10,vd:3,vn:12,vc:25,st:0.5,y1:12,ys:2},
  {nm:"une éolienne de 20 kW",d:"d'une éolienne de 20 kW",Pn:20,vd:3,vn:12,vc:25,st:1,y1:24,ys:4},
  {nm:"une éolienne de 250 kW",d:"d'une éolienne de 250 kW",Pn:250,vd:4,vn:13,vc:25,st:10,y1:300,ys:50}];
const MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MINI=MOIS.map(m=>m[0].toUpperCase());
/* irradiation moyenne reçue par jour sur un panneau à Tahiti (kWh/m²), mois par mois */
const MH0=[5.9,5.8,5.6,5.2,4.7,4.4,4.6,5.0,5.5,5.9,6.1,6.0];
const moisH=()=>draw(()=>MH0.map(x=>r2(x+(Math.random()-0.5)*0.4,1)),v=>{ const s=v.slice().sort((a,b)=>a-b); return s[1]-s[0]>=0.2; });
const figMois=H=>fx_sce_barres({c:MINI,s:[{v:H}],y1:7,ys:1,yg:0.5,yl:"irradiation moyenne (kWh/m² par jour)",val:v=>nf(v,1),alt:"Irradiation solaire moyenne reçue chaque jour par un panneau, mois par mois"});
const chH2=(e,io)=>fx_src_chaine({in:io[0],b:[{t:["Électrolyseur"],e:`η1 = ${nf(e[0],2)}`},{t:["Compression","et stockage"],e:`η2 = ${nf(e[1],2)}`},{t:["Pile à","combustible"],e:`η3 = ${nf(e[2],2)}`}],a:[{t:"H₂",k:"h2"},{t:"H₂",k:"h2"}],out:io[1]});

const SRC1=[
/* puissance d'un panneau : P = η·G·S */
()=>{ const [a,b]=rnd(PAN), eta=rnd([0.18,0.19,0.2,0.21,0.22]), G=rnd([550,600,650,700,750,800,850,900,950]), S=a*b, P=eta*G*S;
  const lieu=rnd(["sur le toit d'une pension de famille à Moorea","dans une ferme solaire installée sur un motu","sur le pont d'un catamaran de croisière","au-dessus du parking d'un lycée de Tahiti"]);
  return {ctx:`Un panneau photovoltaïque de ${nf(a,2)} m × ${nf(b,2)} m est installé ${lieu}. Son rendement vaut ${nf(eta*100,0)} %. À midi, il reçoit une irradiance G = ${G} W/m².`,
    q:"Calcule la puissance électrique fournie par le panneau à cet instant.",type:"num",ans:P,tolR:0.02,unit:"W",
    expl:`Surface : S = ${nf(a,2)} × ${nf(b,2)} = ${nf(S,4)} m². ${F("P = η·G·S")} = ${nf(eta,2)} × ${G} × ${nf(S,4)} = ${U(P,"W")}. Le rendement s'écrit en valeur décimale dans le calcul.`}; },
/* rendement d'un panneau à partir de sa fiche technique (puissance crête) */
()=>{ const [a,b]=rnd(PAN), e0=rnd([0.185,0.19,0.195,0.2,0.205,0.21,0.215,0.22]), S=a*b, Pc=Math.round(e0*1000*S/5)*5, r=Pc/(1000*S);
  return {data:table(["Fiche technique du panneau",""],[["Puissance crête",`${Pc} Wc`],["Dimensions",`${nf(a*1000,0)} mm × ${nf(b*1000,0)} mm`],["Conditions de mesure","1 000 W/m², 25 °C"]]),
    q:"À l'aide de la fiche technique, calcule le rendement de ce panneau, en %.",type:"num",ans:r*100,tolA:0.3,unit:"%",
    expl:`La puissance crête est la puissance fournie sous une irradiance de 1 000 W/m². S = ${nf(a,2)} × ${nf(b,2)} = ${nf(S,4)} m² : le panneau reçoit alors 1 000 × ${nf(S,4)} = ${nf(1000*S,1)} W. ${F(`η = ${FRAC("Pc","1 000 × S")}`)} = ${FRAC(Pc,nf(1000*S,1))} = ${nf(r,4)}, soit ${U(r*100,"%")}.`}; },
/* énergie produite par jour : E = Pc·h */
()=>{ const n=rnd([6,8,10,12,16,20,24]), Pc=rnd([350,375,400,410,425,450]), h=rnd([4.2,4.5,4.8,5,5.2,5.5,5.8,6]), E=n*Pc*h/1000;
  const s=rnd(["Le toit d'une pension de famille à Huahine","Le faré d'une ferme perlière des Tuamotu","Le préau d'un collège de Tahiti","Une ombrière de parking à Papeete"]);
  return {ctx:`${s} porte ${n} panneaux photovoltaïques de ${Pc} Wc chacun. Ce mois-ci, l'ensoleillement vaut ${nf(h,1)} heures équivalentes par jour (heures à 1 000 W/m²).`,
    q:"Quelle énergie électrique les panneaux produisent-ils par jour, en kWh ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
    expl:`Puissance crête totale : ${n} × ${Pc} = ${nf(n*Pc,0)} Wc. ${F("E = Pc·h")} = ${nf(n*Pc,0)} × ${nf(h,1)} = ${nf(n*Pc*h,0)} Wh, soit ${U(E,"kWh")} (pertes de l'onduleur non comptées).`}; },
/* heures d'ensoleillement équivalent : sens de la donnée */
()=>{ const h=rnd([4.5,5,5.5,6]);
  const m=mc(`L'énergie solaire reçue dans la journée est celle que donneraient ${nf(h,1)} h d'irradiance à 1 000 W/m²`,[`Le soleil brille sans nuage pendant ${nf(h,1)} h par jour`,`Le panneau reçoit en moyenne ${nf(h,1)} W/m² sur la journée`,`Le panneau ne produit que pendant ${nf(h,1)} h, puis il se met en sécurité`]);
  return {q:`Une étude de site indique « ensoleillement : ${nf(h,1)} heures équivalentes par jour ». Que signifie cette donnée ?`,type:"ch",...m,
    expl:`L'irradiance varie toute la journée. On ramène l'énergie reçue (${nf(h,1)} kWh/m² par jour) à l'irradiance de référence : ${F(`h = ${FRAC("énergie reçue par m²","1 000 W/m²")}`)}. Un panneau de puissance crête Pc produit alors ${F("E = Pc·h")} par jour.`}; },
/* choisir la relation de la puissance éolienne */
()=>{ const m=mc("P = ½·ρ·S·v³·Cp",["P = ½·ρ·S·v²·Cp","P = ρ·S·v·Cp","P = ½·m·v²·Cp"]);
  return {q:"Quelle relation donne la puissance récupérée par le rotor d'une éolienne (ρ : masse volumique de l'air, S : surface balayée, v : vitesse du vent, Cp : coefficient de puissance) ?",type:"ch",...m,
    expl:`La puissance du vent qui traverse le disque balayé vaut ${F("½·ρ·S·v³")} ; le rotor n'en récupère qu'une fraction Cp : ${F("P = ½·ρ·S·v³·Cp")}. Unités : kg/m³ × m² × m³/s³ = kg·m²/s³ = W. ½·m·v² est une énergie cinétique (en J), pas une puissance.`}; },
/* surface balayée par le rotor */
()=>{ const useD=Math.random()<0.5, R=rnd([1.5,2,2.5,3,4,5,6.5,8,12,20]), D=2*R, S=Math.PI*R*R;
  return {fig:fx_src_eol(useD?{D:`D = ${nf(D,1)} m`}:{R:`R = ${nf(R,1)} m`}),ctx:useD?`Le rotor de l'éolienne a un diamètre D = ${nf(D,1)} m.`:`Chaque pale de l'éolienne mesure R = ${nf(R,1)} m depuis l'axe du rotor.`,
    q:"Calcule la surface S balayée par le rotor.",type:"num",ans:S,tolR:0.02,unit:"m²",
    expl:`${useD?`R = ${FRAC("D","2")} = ${nf(R,2)} m. `:""}${F("S = π·R²")} = π × ${nf(R,2)}² = ${U(S,"m²")}.${useD?" Piège : utiliser D au lieu de R multiplie la surface par 4.":" C'est la surface du disque décrit par les pales, pas celle des pales."}`}; },
/* effet du cube de la vitesse */
()=>{ const [v1,v2]=rnd([[4,5],[5,6],[5,7],[6,8],[4,6],[6,9],[8,10],[5,10],[7,8],[6,7]]), k=(v2/v1)**3;
  return {ctx:`Sur un atoll, la vitesse du vent passe de ${v1} m/s le matin à ${v2} m/s l'après-midi. L'éolienne reste en dessous de sa puissance nominale et Cp ne change pas.`,
    q:"Par combien la puissance récupérée par l'éolienne est-elle multipliée ?",type:"num",ans:k,tolR:0.02,unit:"",
    expl:`${F("P = ½·ρ·S·v³·Cp")} : seule v change, donc ${F(`${FRAC("P2","P1")} = (${FRAC("v2","v1")})³`)} = (${FRAC(v2,v1)})³ = ${FRAC(nf(v2**3,0),nf(v1**3,0))} = ${U(k,"")}. La vitesse n'est multipliée que par ${nf(v2/v1,2)}, la puissance par ${nf(k,2)} : c'est l'effet du cube.`}; },
/* limite de Betz */
()=>{ if(Math.random()<0.5){ const m=mc(`${FRAC("16","27")}, soit environ 59 %`,["100 %","50 %","85 %"]);
    return {q:"Selon la limite de Betz, quelle part de la puissance du vent une éolienne peut-elle récupérer au maximum ?",type:"ch",...m,
      expl:`Pour tout récupérer, il faudrait arrêter complètement l'air derrière le rotor, ce qui bloquerait l'écoulement. Le maximum théorique est ${F(`Cp max = ${FRAC("16","27")} ≈ 0,59`)} : c'est la limite de Betz. Les éoliennes réelles atteignent Cp ≈ 0,35 à 0,50.`}; }
  const Cp=rnd([0.62,0.65,0.7,0.75,0.8]);
  const m=mc(`C'est impossible : Cp ne peut pas dépasser ${FRAC("16","27")} ≈ 0,59 (limite de Betz)`,["C'est possible : il s'agit simplement d'un rotor très bien dessiné","C'est possible, mais seulement par vent très fort","C'est impossible : Cp doit toujours être supérieur à 1"]);
  return {q:`Une publicité annonce qu'une petite éolienne récupère ${nf(Cp*100,0)} % de la puissance du vent (Cp = ${nf(Cp,2)}). Qu'en penses-tu ?`,type:"ch",...m,
    expl:`La limite de Betz impose ${F(`Cp ≤ ${FRAC("16","27")} ≈ 0,59`)} à tout rotor, quel que soit le vent. Une valeur de ${nf(Cp,2)} est impossible : l'annonce est fausse (ou elle confond puissance récupérée et puissance du vent).`}; },
/* électrolyseur et pile à combustible */
()=>{ const pac=Math.random()<0.5;
  const A="Électrique → chimique : l'eau est décomposée en dihydrogène et en dioxygène", B="Chimique → électrique : le dihydrogène réagit avec le dioxygène de l'air, en produisant de l'eau et de la chaleur";
  const m=mc(pac?B:A,[pac?A:B,"Thermique → mécanique, par combustion du dihydrogène dans un moteur",pac?"Mécanique → électrique, comme une génératrice":"Électrique → thermique, comme une résistance chauffante"]);
  return {q:`Quelle conversion d'énergie réalise ${pac?"une pile à combustible":"un électrolyseur"} ?`,type:"ch",...m,
    expl:`Électrolyseur : ${F("électrique → chimique")} (2 H₂O → 2 H₂ + O₂). Pile à combustible : ${F("chimique → électrique")} (2 H₂ + O₂ → 2 H₂O), sans combustion ; elle ne rejette que de l'eau et de la chaleur.`}; },
/* énergie chimique d'un réservoir de dihydrogène : E = m·PCI */
()=>{ const s=rnd([["Le réservoir d'une navette à passagers du lagon",[8,10,12,15,20]],["La bouteille d'un groupe de secours à pile à combustible",[0.8,1.2,1.5,2.5]],["Le réservoir d'une voiture à hydrogène",[5,5.6,6.3]],["Le stockage d'une pension de famille autonome sur un motu",[30,40,60,80]]]);
  const m=rnd(s[1]), E=m*PCI;
  return {ctx:`${s[0]} contient ${nf(m,1)} kg de dihydrogène. ${PCIT}.`,q:"Quelle énergie chimique ce dihydrogène représente-t-il, en kWh ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
    expl:`${F("E = m·PCI")} = ${nf(m,1)} × 33,3 = ${U(E,"kWh")}. C'est l'énergie chimique stockée : la pile à combustible n'en restituera qu'une partie sous forme électrique.`}; },
/* rendement de la chaîne électricité → H₂ → électricité */
()=>{ const e=[rnd([0.6,0.62,0.65,0.68,0.7]),rnd([0.85,0.88,0.9,0.92]),rnd([0.45,0.5,0.52,0.55,0.58])], eg=e[0]*e[1]*e[2];
  return {fig:chH2(e,[{t:"électricité",k:"el"},{t:"électricité",k:"el"}]),ctx:"Stockage de l'électricité d'une ferme solaire sous forme de dihydrogène : le rendement de chaque étape est indiqué sous son bloc.",
    q:"Calcule le rendement global de la chaîne électricité → H₂ → électricité (valeur décimale).",type:"num",ans:eg,tolA:0.006,unit:"",
    expl:`Les étapes sont en série : ${F("η = η1·η2·η3")} = ${nf(e[0],2)} × ${nf(e[1],2)} × ${nf(e[2],2)} = ${U(eg,"")}. Sur 100 kWh stockés, environ ${nf(eg*100,0)} kWh seulement sont restitués.`}; },
/* facteur de charge */
()=>{ const s=rnd([{nm:"Une éolienne de 20 kW installée sur un atoll",Pn:20,fc:[0.16,0.19,0.22,0.25,0.28],st:100},{nm:"Une ferme solaire de 1,5 MWc sur un motu",Pn:1500,fc:[0.15,0.16,0.17,0.18],st:10000},{nm:"Une éolienne en mer de 2 MW",Pn:2000,fc:[0.32,0.36,0.4,0.44],st:10000}]);
  const E=Math.round(s.Pn*8760*rnd(s.fc)/s.st)*s.st, r=E/(s.Pn*8760), big=s.Pn>=1000;
  const Et=big?`${nf(E/1000,0)} MWh`:`${nf(E,0)} kWh`, Pt=big?`${nf(s.Pn/1000,1)} MW`:`${s.Pn} kW`;
  return {ctx:`${s.nm} a produit ${Et} en un an (8 760 h).`,q:"Calcule son facteur de charge, en %.",type:"num",ans:r*100,tolA:0.3,unit:"%",
    expl:`Le facteur de charge compare l'énergie produite à celle d'un fonctionnement permanent à la puissance nominale : ${F(`fc = ${FRAC("E","Pn × 8 760 h")}`)} = ${FRAC(Et,`${Pt} × 8 760 h`)} = ${nf(r,4)}, soit ${U(r*100,"%")}.`}; },
/* lire la courbe de puissance d'une éolienne */
()=>{ const t=rnd(TURB), k=rnd([0,1,2]);
  const Q=["À partir de quelle vitesse de vent l'éolienne commence-t-elle à produire ?","À partir de quelle vitesse l'éolienne fournit-elle sa puissance nominale ?","Au-delà de quelle vitesse l'éolienne est-elle arrêtée pour sa sécurité ?"];
  const ok=[t.vd,t.vn,t.vc][k], opts=[t.vd,t.vn,t.vc,[t.vd+2,t.vn-2,t.vc-5][k]];
  const m=mc(`${ok} m/s`,opts.filter(x=>x!==ok).map(x=>`${x} m/s`));
  return {fig:fx_src_courbeP({t}),ctx:`Courbe de puissance ${t.d} : puissance électrique fournie en fonction de la vitesse du vent.`,q:Q[k],type:"ch",...m,
    expl:`${["La courbe quitte l'axe horizontal à la vitesse de démarrage","La courbe atteint son palier, la puissance nominale ("+nf(t.Pn,0)+" kW), à la vitesse nominale","La courbe retombe à zéro à la vitesse de coupure, où l'éolienne est mise en sécurité"][k]} : ${F(`v = ${ok} m/s`)}. Entre la vitesse nominale et la vitesse de coupure, la puissance est limitée par la régulation pour protéger la machine.`}; }
];

const SRC2=[
/* ferme solaire : puissance continue des panneaux, puis puissance injectée par l'onduleur */
()=>{ const n=rnd([40,60,80,120,160,200]), Pc=rnd([375,400,425,450]), G=rnd([650,700,750,800,850,900]), eo=rnd([0.95,0.96,0.97,0.98]), Pdc=n*Pc*G/1000, Pac=Pdc*eo;
  const fig=fx_src_chaine({in:{t:"soleil",k:"lu"},b:[{t:["Panneaux"],s:[`${n} × ${Pc} Wc`]},{t:["Onduleur"],e:`η = ${nf(eo,2)}`}],a:[{t:"continu",v:"P_DC",k:"el"}],out:{t:"réseau",v:"P_AC",k:"el"}});
  const ctx=`Ferme solaire d'un motu : ${n} panneaux de ${Pc} Wc raccordés à un onduleur de rendement ${nf(eo,2)}. À 11 h, l'irradiance vaut G = ${G} W/m². On admet que la puissance d'un panneau est proportionnelle à l'irradiance.`;
  return [{fig,ctx,q:"Calcule la puissance continue P_DC fournie par l'ensemble des panneaux, en kW.",type:"num",ans:Pdc/1000,tolR:0.02,unit:"kW",
      expl:`Un panneau fournit Pc sous 1 000 W/m², donc ${F(`P = Pc × ${FRAC("G","1 000")}`)} = ${Pc} × ${FRAC(G,"1 000")} = ${nf(Pc*G/1000,1)} W. Pour ${n} panneaux : ${nf(Pdc,0)} W, soit ${U(Pdc/1000,"kW")}.`},
    {fig,ctx,q:"Quelle puissance alternative P_AC l'onduleur injecte-t-il dans le réseau électrique de l'île, en kW ?",type:"num",ans:Pac/1000,tolR:0.02,unit:"kW",
      expl:`${F("P_AC = η·P_DC")} = ${nf(eo,2)} × ${S4(Pdc/1000)} = ${U(Pac/1000,"kW")}. Les ${S4((Pdc-Pac)/1000)} kW restants sont perdus en chaleur dans l'onduleur.`}]; },
/* profil d'irradiance modélisé : énergie reçue par m², puis énergie produite par un panneau */
()=>{ const o=draw(()=>{ const t0=rnd([6,7]), t3=rnd([17,18]), t1=rnd([10,11]), t2=rnd([13,14]), G=rnd([800,900,1000]); return {t0,t1,t2,t3,G,H:G*((t3-t0)+(t2-t1))/2}; },o=>o.H>=4500&&o.H<=7000);
  const Pc=rnd([375,400,425,450]), h=o.H/1000, E=Pc*h;
  const fig=fx_src_irr({t:[o.t0,o.t1,o.t2,o.t3],G:o.G}), ctx="Par une journée sans nuage, l'irradiance reçue par un panneau est modélisée par le profil en trapèze de la figure.";
  return [{fig,ctx,q:"Calcule l'énergie solaire reçue par mètre carré de panneau pendant la journée, en kWh/m².",type:"num",ans:h,tolR:0.02,unit:"kWh/m²",
      expl:`L'énergie reçue par m² est l'aire sous la courbe G(t) : un trapèze de hauteur G_max, de grande base B = ${o.t3-o.t0} h (durée d'éclairement) et de petite base b = ${o.t2-o.t1} h (palier). ${F(`E = G_max × ${FRAC("B + b","2")}`)} = ${nf(o.G,0)} × ${FRAC(`${o.t3-o.t0} + ${o.t2-o.t1}`,"2")} = ${nf(o.H,0)} Wh/m², soit ${U(h,"kWh/m²")}.`},
    {fig,ctx,q:`Déduis-en l'énergie électrique produite ce jour-là par un panneau de ${Pc} Wc, en Wh.`,type:"num",ans:E,tolR:0.02,unit:"Wh",
      expl:`${nf(h,2)} kWh/m² correspondent à ${nf(h,2)} heures équivalentes à 1 000 W/m². ${F("E = Pc·h")} = ${Pc} × ${nf(h,2)} = ${U(E,"Wh")}.`}]; },
/* dimensionner une installation : énergie d'un panneau après l'onduleur, puis nombre de panneaux */
()=>{ const o=draw(()=>({Eb:rnd([6,8,10,12,15,18,24]),Pc:rnd([375,400,425,450]),h:rnd([4.5,4.8,5,5.2,5.5]),eo:rnd([0.9,0.92,0.94,0.95,0.96])}),o=>{ const n=o.Eb*1000/(o.Pc*o.h*o.eo); return net(n)&&n>=3&&n<=40; });
  const Ep=o.Pc*o.h*o.eo, n=o.Eb*1000/Ep, N=Math.ceil(n);
  const lieu=rnd(["Une pension de famille de Rangiroa","Un faré de location à Tikehau","Une petite école de Fakarava","Un atelier de nacre à Takaroa"]);
  const ctx=`${lieu} consomme ${o.Eb} kWh d'électricité par jour. On veut couvrir ce besoin avec des panneaux de ${o.Pc} Wc (ensoleillement : ${nf(o.h,1)} heures équivalentes par jour) raccordés à un onduleur de rendement ${nf(o.eo,2)}.`;
  return [{ctx,q:"Quelle énergie un panneau fournit-il par jour à la sortie de l'onduleur, en Wh ?",type:"num",ans:Ep,tolR:0.02,unit:"Wh",
      expl:`${F("E = Pc·h·η_ond")} = ${o.Pc} × ${nf(o.h,1)} × ${nf(o.eo,2)} = ${U(Ep,"Wh")}.`},
    {ctx,q:"Combien de panneaux faut-il installer au minimum ?",type:"num",ans:N,tolA:0,unit:"panneaux",
      expl:`${F(`n = ${FRAC("E_besoin","E_panneau")}`)} = ${FRAC(nf(o.Eb*1000,0),S4(Ep))} = ${nf(n,2)}. On arrondit à l'entier supérieur : ${U(N,"panneaux")} (avec ${N-1}, le besoin ne serait pas couvert).`}]; },
/* éolienne : surface balayée, puis puissance récupérée */
()=>{ const R=rnd([2,2.5,3,3.5,4,5,6]), v=rnd([6,7,8,9,10,11]), Cp=rnd([0.3,0.35,0.38,0.4,0.42,0.45]), S=Math.PI*R*R, P=0.5*1.2*S*v**3*Cp;
  const fig=fx_src_eol({R:`R = ${nf(R,1)} m`,v:`v = ${v} m/s`}), ctx=`Éolienne d'un atoll des Tuamotu : pales de longueur R = ${nf(R,1)} m (depuis l'axe), coefficient de puissance Cp = ${nf(Cp,2)}. Vent : v = ${v} m/s. ${RHO}.`;
  return [{fig,ctx,q:"Calcule d'abord l'aire du disque balayé par les pales.",type:"num",ans:S,tolR:0.02,unit:"m²",expl:`${F("S = π·R²")} = π × ${nf(R,1)}² = ${U(S,"m²")}.`},
    {fig,ctx,q:"Calcule la puissance récupérée par le rotor, en kW.",type:"num",ans:P/1000,tolR:0.02,unit:"kW",
      expl:`${F("P = ½·ρ·S·v³·Cp")} = 0,5 × 1,2 × ${S4(S)} × ${v}³ × ${nf(Cp,2)} = ${nf(P,0)} W, soit ${U(P/1000,"kW")}.`}]; },
/* coefficient de puissance à partir d'un essai */
()=>{ const o=draw(()=>{ const D=rnd([3,4,5,6,8,10]), v=rnd([6,7,8,9,10]), c=0.3+Math.random()*0.16, Pw=0.5*1.2*Math.PI*(D/2)**2*v**3, P=r2(Pw*c/1000,Pw*c>=10000?1:2); return {D,v,Pw,P,Cp:P*1000/Pw}; },o=>o.P>=0.3);
  return {fig:fx_src_eol({D:`D = ${nf(o.D,0)} m`,v:`v = ${o.v} m/s`}),ctx:`Essai d'une éolienne dont le rotor a un diamètre D = ${nf(o.D,0)} m : par un vent de ${o.v} m/s, on mesure une puissance mécanique de ${nf(o.P,2)} kW sur l'arbre du rotor. ${RHO}.`,
    q:"Calcule le coefficient de puissance Cp de l'éolienne pendant cet essai.",type:"num",ans:o.Cp,tolA:0.006,unit:"",
    expl:`R = ${FRAC("D","2")} = ${nf(o.D/2,1)} m ; S = π × ${nf(o.D/2,1)}² = ${S4(Math.PI*(o.D/2)**2)} m². Puissance du vent : ${F("½·ρ·S·v³")} = 0,5 × 1,2 × ${S4(Math.PI*(o.D/2)**2)} × ${o.v}³ = ${nf(o.Pw,0)} W. ${F(`Cp = ${FRAC("P","½·ρ·S·v³")}`)} = ${FRAC(nf(o.P*1000,0),nf(o.Pw,0))} = ${U(o.Cp,"")}, bien en dessous de la limite de Betz (0,59).`}; },
/* longueur de pale nécessaire */
()=>{ const P=rnd([3,5,8,10,15,20,50]), v=rnd([10,11,12]), Cp=rnd([0.35,0.38,0.4,0.42,0.45]), S=2*P*1000/(1.2*v**3*Cp), R=Math.sqrt(S/Math.PI);
  return {ctx:`On veut une éolienne qui fournisse ${P} kW sur l'arbre du rotor par un vent de ${v} m/s, avec un coefficient de puissance Cp = ${nf(Cp,2)}. ${RHO}.`,
    q:"Quelle longueur de pale R faut-il au minimum ?",type:"num",ans:R,tolR:0.02,unit:"m",
    expl:`De ${F("P = ½·ρ·S·v³·Cp")}, on tire ${F(`S = ${FRAC("2·P","ρ·v³·Cp")}`)} = ${FRAC(`2 × ${nf(P*1000,0)}`,`1,2 × ${v}³ × ${nf(Cp,2)}`)} = ${S4(S)} m². Puis ${F(`R = √(${FRAC("S","π")})`)} = ${U(R,"m")}.`}; },
/* courbe de puissance : lecture, puis énergie produite */
()=>{ const t=rnd(TURB), v=ri(t.vd+2,t.vn-1), P=PW(t,v), h=rnd([6,8,10,12,15]), E=P*h;
  const fig=fx_src_courbeP({t}), ctx=`Courbe de puissance ${t.d} : puissance électrique fournie en fonction de la vitesse du vent.`;
  return [{fig,ctx,q:`Lis la puissance électrique fournie quand le vent souffle à ${v} m/s.`,type:"num",ans:P,tolA:t.st*0.51,tolR:0.02,unit:"kW",
      expl:`On part de v = ${v} m/s sur l'axe horizontal, on monte jusqu'à la courbe, puis on lit l'ordonnée : ${U(P,"kW")}.`},
    {fig,ctx,q:`Le vent souffle à ${v} m/s pendant ${h} h. Quelle énergie l'éolienne produit-elle, en kWh ?`,type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`La puissance est constante pendant cette durée : ${F("E = P·t")} = ${nf(P,1)} × ${h} = ${U(E,"kWh")}.`}]; },
/* navette à hydrogène : énergie chimique, puis masse de dihydrogène */
()=>{ const P=rnd([15,20,25,30,40]), t=rnd([2,3,4,5,6]), e=rnd([0.45,0.5,0.52,0.55]), Eel=P*t, Ech=Eel/e, m=Ech/PCI;
  const ctx=`Une navette à passagers du lagon de Bora Bora est propulsée par des moteurs électriques alimentés par une pile à combustible de rendement ${nf(e,2)}. Une journée de service demande ${P} kW pendant ${t} h. ${PCIT}.`;
  return [{ctx,q:"Quelle énergie chimique de dihydrogène la pile consomme-t-elle en une journée, en kWh ?",type:"num",ans:Ech,tolR:0.02,unit:"kWh",
      expl:`Énergie électrique utile : ${F("E = P·t")} = ${P} × ${t} = ${nf(Eel,0)} kWh. La pile ne convertit qu'une partie de l'énergie chimique : ${F(`E_ch = ${FRAC("E_élec","η")}`)} = ${FRAC(nf(Eel,0),nf(e,2))} = ${U(Ech,"kWh")}.`},
    {ctx,q:"Quelle masse de dihydrogène la navette consomme-t-elle par jour ?",type:"num",ans:m,tolR:0.02,unit:"kg",
      expl:`${F(`m = ${FRAC("E_ch","PCI")}`)} = ${FRAC(S4(Ech),"33,3")} = ${U(m,"kg")}.`}]; },
/* électrolyseur : consommation par kilogramme, puis production journalière */
()=>{ const e=rnd([0.6,0.62,0.65,0.68,0.7]), E=rnd([60,80,100,150,200,250]), c=PCI/e, m=E*e/PCI;
  const ctx=`Sur un motu, l'excédent quotidien d'une ferme solaire, ${E} kWh, alimente un électrolyseur de rendement ${nf(e,2)} (rendement rapporté au PCI du dihydrogène, 33,3 kWh/kg).`;
  return [{ctx,q:"Quelle énergie électrique l'électrolyseur consomme-t-il pour produire 1 kg de dihydrogène ?",type:"num",ans:c,tolR:0.02,unit:"kWh",
      expl:`1 kg de dihydrogène contient 33,3 kWh. ${F(`E_élec = ${FRAC("PCI","η")}`)} = ${FRAC("33,3",nf(e,2))} = ${U(c,"kWh")} par kilogramme produit.`},
    {ctx,q:"Quelle masse de dihydrogène l'électrolyseur produit-il par jour ?",type:"num",ans:m,tolR:0.02,unit:"kg",
      expl:`Énergie chimique produite : ${nf(e,2)} × ${E} = ${S4(e*E)} kWh. ${F(`m = ${FRAC("η·E","PCI")}`)} = ${FRAC(S4(e*E),"33,3")} = ${U(m,"kg")}.`}]; },
/* facteur de charge : énergie annuelle, puis heures équivalentes à pleine puissance */
()=>{ const s=rnd([{nm:"Une éolienne de 30 kW sur un atoll",Pn:30,fc:[0.18,0.2,0.22,0.25]},{nm:"Un parc de six éoliennes de 275 kW",Pn:1650,fc:[0.24,0.27,0.3]},{nm:"Une ferme solaire de 5 MWc",Pn:5000,fc:[0.15,0.16,0.17,0.18]},{nm:"Une centrale solaire de 500 kWc sur le toit d'un lycée",Pn:500,fc:[0.15,0.16,0.17]}]);
  const fc=rnd(s.fc), E=s.Pn*8760*fc, h=8760*fc, big=E>=100000;
  const ctx=`${s.nm} a un facteur de charge de ${nf(fc*100,0)} %.`;
  return [{ctx,q:`Quelle énergie cette installation produit-elle en un an, en ${big?"MWh":"kWh"} ?`,type:"num",ans:big?E/1000:E,tolR:0.02,unit:big?"MWh":"kWh",
      expl:`${F("E = fc·Pn × 8 760 h")} = ${nf(fc,2)} × ${nf(s.Pn,0)} kW × 8 760 h = ${big?`${nf(E,0)} kWh, soit ${U(E/1000,"MWh")}`:U(E,"kWh")}.`},
    {ctx,q:"À combien d'heures de fonctionnement à pleine puissance cette production correspond-elle ?",type:"num",ans:h,tolR:0.02,unit:"h",
      expl:`${F(`t = ${FRAC("E","Pn")}`)} = ${FRAC(`${nf(E,0)} kWh`,`${nf(s.Pn,0)} kW`)} = ${U(h,"h")}, soit fc × 8 760 h. Le reste du temps, l'installation produit moins, ou rien.`}]; },
/* stocker l'électricité : batterie ou chaîne hydrogène */
()=>{ const E=rnd([100,200,500,1000]), eb=rnd([0.85,0.88,0.9,0.92]), e=[rnd([0.6,0.65,0.7]),rnd([0.88,0.9,0.92]),rnd([0.45,0.5,0.55])], eh=e[0]*e[1]*e[2], Eh=E*eh, k=eb/eh;
  const fig=chH2(e,[{t:"électricité",v:`${nf(E,0)} kWh`,k:"el"},{t:"électricité",v:"?",k:"el"}]);
  const ctx=`Une île veut stocker ${nf(E,0)} kWh d'électricité solaire excédentaire. On compare la chaîne hydrogène de la figure avec une batterie dont le rendement (charge puis décharge) vaut ${nf(eb,2)}.`;
  return [{fig,ctx,q:"Quelle énergie électrique la chaîne hydrogène restitue-t-elle ?",type:"num",ans:Eh,tolR:0.02,unit:"kWh",
      expl:`${F("η = η1·η2·η3")} = ${nf(e[0],2)} × ${nf(e[1],2)} × ${nf(e[2],2)} = ${nf(eh,4)}. ${F("E_rendue = η·E")} = ${nf(eh,4)} × ${nf(E,0)} = ${U(Eh,"kWh")}.`},
    {fig,ctx,q:"Combien de fois plus d'énergie la batterie restituerait-elle ?",type:"num",ans:k,tolR:0.02,unit:"",
      expl:`La batterie rendrait ${nf(eb,2)} × ${nf(E,0)} = ${nf(eb*E,0)} kWh. ${F(FRAC("E_batterie","E_hydrogène"))} = ${FRAC(nf(eb*E,0),S4(Eh))} = ${U(k,"")}. L'hydrogène perd beaucoup d'énergie, mais il se conserve longtemps et se stocke en grande quantité.`}]; },
/* hauteur du mât : effet du cube sur l'énergie produite */
()=>{ const [v1,v2]=rnd([[5,6],[5.5,6.5],[6,7],[6,7.2],[5,6.2],[4.5,5.5]]), E1=rnd([5000,6000,7000,8000]), k=(v2/v1)**3, E2=E1*k;
  const ctx=`Sur un atoll, une éolienne de 5 kW est montée sur un mât de 12 m : la vitesse moyenne du vent y vaut ${nf(v1,1)} m/s et elle produit ${nf(E1,0)} kWh par an. À 24 m de hauteur, la vitesse moyenne vaut ${nf(v2,1)} m/s. On admet que l'énergie produite est proportionnelle au cube de la vitesse moyenne.`;
  return [{ctx,q:"Par combien l'énergie produite est-elle multipliée si l'on monte l'éolienne sur un mât de 24 m ?",type:"num",ans:k,tolR:0.02,unit:"",
      expl:`${F(`${FRAC("E2","E1")} = (${FRAC("v2","v1")})³`)} = (${FRAC(nf(v2,1),nf(v1,1))})³ = ${nf(v2/v1,4)}³ = ${U(k,"")}.`},
    {ctx,q:"Quelle énergie produirait-elle alors en un an, en kWh ?",type:"num",ans:E2,tolR:0.02,unit:"kWh",
      expl:`E2 = ${nf(k,3)} × ${nf(E1,0)} = ${U(E2,"kWh")} : un vent ${nf((v2/v1-1)*100,0)} % plus rapide donne ${nf((k-1)*100,0)} % d'énergie en plus.`}]; },
/* irradiation mensuelle : mois le plus défavorable, puis énergie journalière d'un panneau */
()=>{ const H=moisH(), i=H.indexOf(Math.min(...H)), Pc=rnd([375,400,425,450]), E=Pc*H[i];
  const oth=shuffle([...Array(12).keys()].filter(j=>j!==i&&H[j]-H[i]>=0.2)).slice(0,3);
  const fig=figMois(H), ctx="Irradiation solaire moyenne reçue chaque jour par un panneau à Tahiti, mois par mois. On dimensionne une installation autonome qui doit fonctionner toute l'année.";
  return [{fig,ctx,q:"Quel mois faut-il retenir pour dimensionner l'installation ?",type:"ch",...mc(MOIS[i],oth.map(j=>MOIS[j])),
      expl:`Une installation autonome doit couvrir le besoin même le mois le moins ensoleillé : on retient le cas le plus défavorable, ${F(MOIS[i])} (${nf(H[i],1)} kWh/m² par jour).`},
    {fig,ctx,q:`Quelle énergie un panneau de ${Pc} Wc produit-il par jour pendant ce mois, en Wh ?`,type:"num",ans:E,tolR:0.02,unit:"Wh",
      expl:`${nf(H[i],1)} kWh/m² par jour correspondent à ${nf(H[i],1)} heures équivalentes à 1 000 W/m². ${F("E = Pc·h")} = ${Pc} × ${nf(H[i],1)} = ${U(E,"Wh")}.`}]; }
];

const SRC3=[
/* pension de famille autonome : énergie d'un panneau au mois le plus défavorable, nombre de panneaux, surface du toit */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const H=moisH(), Eb=rnd([8,10,12,14,16,20]), Pc=rnd([400,425,450]), Sp=rnd([1.9,1.95,2.0,2.1]), er=rnd([0.95,0.96,0.97]), eo=rnd([0.92,0.94,0.95]), f=rnd(tgt?[1.08,1.12,1.18,1.25]:[0.8,0.85,0.9,0.94]);
      const hm=Math.min(...H), Ep=Pc*hm*er*eo, n=Eb*1000/Ep, N=Math.ceil(n), A=Math.round(N*Sp*f); return {H,Eb,Pc,Sp,er,eo,hm,Ep,n,N,A}; },
    o=>net(o.n)&&o.N>=4&&o.N<=40&&far(o.A,o.N*o.Sp,0.05)&&(o.A>=o.N*o.Sp)===tgt);
  const ok=o.A>=o.N*o.Sp, im=o.H.indexOf(o.hm), fig=figMois(o.H);
  const ctx=`Pension de famille sur un atoll, sans raccordement au réseau : besoin électrique de ${o.Eb} kWh par jour, toute l'année. Panneaux de ${o.Pc} Wc et ${nf(o.Sp,2)} m² chacun ; régulateur de charge (rendement ${nf(o.er,2)}) puis onduleur (rendement ${nf(o.eo,2)}). La figure donne l'irradiation moyenne de chaque mois.`;
  return [{fig,ctx,q:"Dans le cas le plus défavorable, quelle énergie un panneau fournit-il par jour à la sortie de l'onduleur, en Wh ?",type:"num",ans:o.Ep,tolR:0.02,unit:"Wh",
      expl:`Cas le plus défavorable : ${MOIS[im]}, ${nf(o.hm,1)} kWh/m² par jour, soit ${nf(o.hm,1)} heures équivalentes. ${F("E = Pc·h·η_rég·η_ond")} = ${o.Pc} × ${nf(o.hm,1)} × ${nf(o.er,2)} × ${nf(o.eo,2)} = ${U(o.Ep,"Wh")}.`},
    {fig,ctx,q:"Combien de panneaux faut-il installer au minimum ?",type:"num",ans:o.N,tolA:0,unit:"panneaux",
      expl:`${F(`n = ${FRAC("E_besoin","E_panneau")}`)} = ${FRAC(nf(o.Eb*1000,0),S4(o.Ep))} = ${nf(o.n,2)}, arrondi à l'entier supérieur : ${U(o.N,"panneaux")}.`},
    {fig,ctx,q:`Le toit orienté au nord offre ${nf(o.A,0)} m² utilisables. Peut-on y installer ces panneaux ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`Surface nécessaire : ${o.N} × ${nf(o.Sp,2)} = ${nf(o.N*o.Sp,1)} m² ${ok?"≤":">"} ${nf(o.A,0)} m² : ${ok?"les panneaux tiennent sur le toit.":"le toit est trop petit ; il faut une autre surface (sol, ombrière) ou des panneaux de meilleur rendement."}`}]; },
/* alimenter un village : puissance nominale, énergie annuelle, nombre d'éoliennes */
()=>{ const o=draw(()=>{ const R=rnd([4,5,6,8,10,13]), vn=rnd([11,12,13]), Cp=rnd([0.35,0.38,0.4,0.42]), fc=rnd([0.18,0.2,0.22,0.25,0.28]), Ev=rnd([150,200,250,300,400,500,600,800]);
      const Pn=0.5*1.2*Math.PI*R*R*vn**3*Cp/1000, Ea=Pn*8760*fc/1000, n=Ev/Ea; return {R,vn,Cp,fc,Ev,Pn,Ea,n}; },o=>net(o.n)&&o.n>=1.5&&o.n<=12);
  const N=Math.ceil(o.n), S=Math.PI*o.R*o.R, ctx=`Un village d'atoll consomme ${o.Ev} MWh d'électricité par an. On étudie des éoliennes de rayon R = ${o.R} m, de coefficient de puissance Cp = ${nf(o.Cp,2)} à leur vitesse nominale de ${o.vn} m/s. Sur ce site, le facteur de charge vaut ${nf(o.fc*100,0)} %. ${RHO}.`;
  return [{ctx,q:"Calcule la puissance nominale d'une éolienne, en kW.",type:"num",ans:o.Pn,tolR:0.02,unit:"kW",
      expl:`S = π × ${o.R}² = ${S4(S)} m². ${F("Pn = ½·ρ·S·v³·Cp")} = 0,5 × 1,2 × ${S4(S)} × ${o.vn}³ × ${nf(o.Cp,2)} = ${nf(o.Pn*1000,0)} W, soit ${U(o.Pn,"kW")}.`},
    {ctx,q:"Quelle énergie une éolienne produit-elle en un an, en MWh ?",type:"num",ans:o.Ea,tolR:0.02,unit:"MWh",
      expl:`${F("E = fc·Pn × 8 760 h")} = ${nf(o.fc,2)} × ${S4(o.Pn)} kW × 8 760 h = ${nf(o.Ea*1000,0)} kWh, soit ${U(o.Ea,"MWh")}.`},
    {ctx,q:"Combien d'éoliennes faut-il installer au minimum pour couvrir la consommation annuelle du village ?",type:"num",ans:N,tolA:0,unit:"éoliennes",
      expl:`${F(`n = ${FRAC("E_village","E_éolienne")}`)} = ${FRAC(o.Ev,S4(o.Ea))} = ${nf(o.n,2)}, arrondi à l'entier supérieur : ${U(N,N>1?"éoliennes":"éolienne")}. Il faudra aussi un stockage : le vent ne souffle pas à la demande.`}]; },
/* annonce d'un fabricant : puissance du vent, coefficient de puissance, crédibilité */
()=>{ const want=Math.random()<0.5;
  const o=draw(()=>{ const D=rnd([2,2.5,3,4,5,6]), v=rnd([8,10,11,12]), c=want?0.28+Math.random()*0.22:0.66+Math.random()*0.3, Pw=0.5*1.2*Math.PI*(D/2)**2*v**3/1000, P=r2(Pw*c,Pw*c>=10?0:1); return {D,v,Pw,P,Cp:P/Pw}; },o=>o.P>0&&(want?o.Cp<=0.52:o.Cp>=0.66));
  const ok=o.Cp<16/27, S=Math.PI*(o.D/2)**2;
  const ctx=`Un fabricant annonce que son éolienne de ${nf(o.D,1)} m de diamètre fournit ${nf(o.P,1)} kW sur l'arbre du rotor par un vent de ${o.v} m/s. ${RHO}.`;
  return [{ctx,q:"Calcule la puissance du vent qui traverse le disque balayé par le rotor, en kW.",type:"num",ans:o.Pw,tolR:0.02,unit:"kW",
      expl:`R = ${nf(o.D/2,2)} m, S = π × ${nf(o.D/2,2)}² = ${S4(S)} m². ${F("P_vent = ½·ρ·S·v³")} = 0,5 × 1,2 × ${S4(S)} × ${o.v}³ = ${nf(o.Pw*1000,0)} W, soit ${U(o.Pw,"kW")}.`},
    {ctx,q:"Déduis-en le coefficient de puissance qui correspond à l'annonce.",type:"num",ans:o.Cp,tolA:0.006,unit:"",
      expl:`${F(`Cp = ${FRAC("P","P_vent")}`)} = ${FRAC(nf(o.P,1),S4(o.Pw))} = ${U(o.Cp,"")}.`},
    {ctx,q:"L'annonce du fabricant est-elle crédible ?",type:"ch",ch:["Oui : Cp reste inférieur à la limite de Betz","Non : Cp dépasse la limite de Betz, l'annonce est impossible"],ok:ok?0:1,
      expl:`La limite de Betz impose ${F(`Cp ≤ ${FRAC("16","27")} ≈ 0,59`)}. Ici Cp = ${nf(o.Cp,2)} ${ok?"< 0,59 : l'annonce est physiquement possible (un bon rotor atteint 0,40 à 0,50).":"> 0,59 : aucun rotor ne peut récupérer autant, l'annonce est fausse."}`}]; },
/* navette à hydrogène : production journalière, énergie restituée, exigence d'autonomie */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const Es=rnd([150,200,250,300,400]), e=[rnd([0.6,0.63,0.65,0.68]),rnd([0.88,0.9,0.92]),rnd([0.48,0.5,0.52,0.55])], P=rnd([12,15,18,20,25]), X=rnd([2,3,4,5,6]);
      const m=Es*e[0]*e[1]/PCI, Er=m*PCI*e[2], t=Er/P; return {Es,e,P,X,m,Er,t}; },o=>far(o.t,o.X,0.06)&&(o.t>=o.X)===tgt);
  const ok=o.t>=o.X, fig=chH2(o.e,[{t:"excédent PV",v:`${o.Es} kWh/jour`,k:"el"},{t:"moteurs",v:`${o.P} kW`,k:"el"}]);
  const ctx=`Une navette du lagon fait le plein de dihydrogène au quai : l'excédent quotidien d'une ferme solaire (${o.Es} kWh par jour) alimente l'électrolyseur ; le dihydrogène comprimé est stocké, puis la pile à combustible alimente les moteurs (${o.P} kW en croisière). ${PCIT}. Exigence : ${o.X} h de navigation par jour.`;
  return [{fig,ctx,q:"Quelle masse de dihydrogène est stockée chaque jour ?",type:"num",ans:o.m,tolR:0.02,unit:"kg",
      expl:`Énergie stockée sous forme de dihydrogène : ${o.Es} × ${nf(o.e[0],2)} × ${nf(o.e[1],2)} = ${S4(o.Es*o.e[0]*o.e[1])} kWh. ${F(`m = ${FRAC("E","PCI")}`)} = ${FRAC(S4(o.Es*o.e[0]*o.e[1]),"33,3")} = ${U(o.m,"kg")}.`},
    {fig,ctx,q:"Quelle énergie électrique la pile à combustible fournit-elle aux moteurs avec ce dihydrogène ?",type:"num",ans:o.Er,tolR:0.02,unit:"kWh",
      expl:`${F("E = m·PCI·η3")} = ${S4(o.m)} × 33,3 × ${nf(o.e[2],2)} = ${U(o.Er,"kWh")}, soit ${pc(o.e[0]*o.e[1]*o.e[2],0)} de l'excédent solaire.`},
    {fig,ctx,q:"L'exigence de durée de navigation est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${F(`t = ${FRAC("E","P")}`)} = ${FRAC(S4(o.Er),o.P)} = ${nf(o.t,2)} h ${ok?"≥":"<"} ${o.X} h : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faudrait plus d'excédent solaire ou une puissance de croisière plus faible."}`}]; },
/* hydrogène ou batteries : masse embarquée pour une même énergie utile */
()=>{ const want=rnd([0,1]);
  const o=draw(()=>{ const Eu=rnd([10,15,20,30,40,60,80,100,150]), e=rnd([0.5,0.52,0.55]), w=rnd([0.05,0.055,0.06]), Mp=rnd([60,80,100,120]), eb=rnd([0.14,0.16,0.18]);
      const m=Eu/(e*PCI), Mh=m/w+Mp, Mb=Eu/eb; return {Eu,e,w,Mp,eb,m,Mh,Mb}; },o=>far(o.Mh,o.Mb,0.12)&&(o.Mh<o.Mb?0:1)===want);
  const hl=o.Mh<o.Mb;
  const data=tabL(["Solution","Données"],[["Hydrogène",`pile de rendement ${nf(o.e,2)} ; système pile : ${o.Mp} kg ; le dihydrogène représente ${nf(o.w*100,1)} % de la masse du réservoir plein`],["Batteries lithium-ion",`énergie massique du pack : ${nf(o.eb*1000,0)} Wh/kg`]]);
  const ctx=`Un bateau électrique doit disposer de ${o.Eu} kWh d'énergie électrique utile. On compare deux solutions de stockage embarqué. ${PCIT}.`;
  return [{data,ctx,q:"Quelle masse de dihydrogène faut-il embarquer ?",type:"num",ans:o.m,tolR:0.02,unit:"kg",
      expl:`Énergie chimique nécessaire : ${FRAC(o.Eu,nf(o.e,2))} = ${S4(o.Eu/o.e)} kWh. ${F(`m = ${FRAC("E_ch","PCI")}`)} = ${FRAC(S4(o.Eu/o.e),"33,3")} = ${U(o.m,"kg")}.`},
    {data,ctx,q:"Quelle est la masse totale de la solution hydrogène (réservoir plein et système pile) ?",type:"num",ans:o.Mh,tolR:0.02,unit:"kg",
      expl:`Réservoir plein : ${FRAC(S4(o.m),nf(o.w,3))} = ${S4(o.m/o.w)} kg. Avec le système pile : ${S4(o.m/o.w)} + ${o.Mp} = ${U(o.Mh,"kg")}.`},
    {data,ctx,q:"Quelle solution est la plus légère pour cette énergie ?",type:"ch",ch:["La solution hydrogène","Les batteries lithium-ion"],ok:hl?0:1,
      expl:`Batteries : ${F(`m = ${FRAC("E","e_m")}`)} = ${FRAC(`${nf(o.Eu*1000,0)} Wh`,`${nf(o.eb*1000,0)} Wh/kg`)} = ${nf(o.Mb,0)} kg, contre ${nf(o.Mh,0)} kg pour l'hydrogène. ${hl?"L'hydrogène l'emporte : pour une grande énergie, la masse fixe du système pile est vite compensée.":"Les batteries l'emportent : pour une petite énergie, la masse fixe du système pile pèse trop lourd."}`}]; },
/* repérer l'erreur d'un élève */
()=>{ const v=rnd([0,1,2,3,4,5,6]); let ctx, st, bad, why;
  if(v===0){ const D=rnd([6,8,10,12]), vv=rnd([8,10]), R=D/2, Pw=x=>0.5*1.2*Math.PI*x*x*vv**3*0.4/1000;
    ctx=`Puissance récupérée par une éolienne de diamètre D = ${D} m, par un vent de ${vv} m/s, avec Cp = 0,4 et ρ = 1,2 kg/m³.`;
    st=[`S = π × ${D}² = ${nf(Math.PI*D*D,1)} m²`,`P = 0,5 × 1,2 × ${nf(Math.PI*D*D,1)} × ${vv}³ × 0,4 = ${nf(Pw(D),1)} kW`,`L'éolienne fournit donc ${nf(Pw(D),1)} kW.`]; bad=0;
    why=`La surface balayée se calcule avec le rayon : R = ${FRAC(D,"2")} = ${R} m, S = π × ${R}² = ${nf(Math.PI*R*R,1)} m², d'où P = ${nf(Pw(R),1)} kW, quatre fois moins.`; }
  else if(v===1){ const R=rnd([3,4,5]), vv=rnd([8,9,10]), S=r2(Math.PI*R*R,1);
    ctx=`Puissance récupérée par une éolienne de rayon R = ${R} m, par un vent de ${vv} m/s, avec Cp = 0,4 et ρ = 1,2 kg/m³.`;
    st=[`S = π × ${R}² = ${nf(S,1)} m²`,`P = 0,5 × 1,2 × ${nf(S,1)} × ${vv}² × 0,4 = ${nf(0.24*S*vv*vv,0)} W`,`L'éolienne fournit donc ${nf(0.24*S*vv*vv,0)} W.`]; bad=1;
    why=`La puissance du vent varie comme le cube de la vitesse : P = 0,5 × 1,2 × ${nf(S,1)} × ${vv}³ × 0,4 = ${nf(0.24*S*vv**3,0)} W.`; }
  else if(v===2){ const o=draw(()=>({Eb:rnd([9,11,13,14,17]),Ep:rnd([1.6,1.7,1.8,1.9])}),o=>net(o.Eb/o.Ep)), n=o.Eb/o.Ep;
    ctx=`Nombre de panneaux pour couvrir un besoin de ${o.Eb} kWh par jour ; chaque panneau fournit ${nf(o.Ep,1)} kWh par jour à la sortie de l'onduleur.`;
    st=[`Énergie fournie par un panneau : ${nf(o.Ep,1)} kWh par jour`,`n = ${FRAC(o.Eb,nf(o.Ep,1))} = ${nf(n,2)}`,`On installe ${Math.floor(n)} panneaux.`]; bad=2;
    why=`Il faut arrondir à l'entier supérieur : avec ${Math.floor(n)} panneaux, le besoin n'est pas couvert. Il en faut ${Math.ceil(n)}.`; }
  else if(v===3){ const E=rnd([40,60,80,120]), e=rnd([0.5,0.55]);
    ctx=`Masse de dihydrogène nécessaire pour qu'une pile à combustible de rendement ${nf(e,2)} fournisse ${E} kWh d'électricité (PCI : 33,3 kWh/kg).`;
    st=[`η = ${FRAC("E_élec","E_ch")}`,`E_ch = E_élec × η = ${E} × ${nf(e,2)} = ${nf(E*e,1)} kWh`,`m = ${FRAC(nf(E*e,1),"33,3")} = ${nf(E*e/PCI,2)} kg`]; bad=1;
    why=`De η = ${FRAC("E_élec","E_ch")}, on tire E_ch = ${FRAC("E_élec","η")} = ${FRAC(E,nf(e,2))} = ${nf(E/e,1)} kWh : l'énergie chimique consommée est plus grande que l'énergie électrique fournie. Puis m = ${nf(E/e/PCI,2)} kg.`; }
  else if(v===4){ const gm=rnd([200,350,500,800]);
    ctx=`Énergie chimique contenue dans ${gm} g de dihydrogène (PCI : 33,3 kWh/kg).`;
    st=["E = m·PCI",`E = ${gm} × 33,3 = ${nf(gm*PCI,0)} kWh`,`Soit ${nf(gm*PCI/1000,1)} MWh.`]; bad=1;
    why=`Le PCI est donné par kilogramme : m = ${gm} g = ${nf(gm/1000,2)} kg, d'où E = ${nf(gm/1000,2)} × 33,3 = ${nf(gm/1000*PCI,2)} kWh.`; }
  else if(v===5){ const Pc=rnd([375,400,425]), h=rnd([4.5,5,5.5]);
    ctx=`Énergie produite en un mois de 30 jours par un panneau de ${Pc} Wc qui reçoit ${nf(h,1)} heures équivalentes d'ensoleillement par jour.`;
    st=["E = Pc·h",`E = ${Pc} × ${nf(h,1)} = ${nf(Pc*h,1)} kWh par jour`,`En 30 jours : ${nf(Pc*h*30,0)} kWh.`]; bad=1;
    why=`Des Wc multipliés par des heures donnent des Wh : E = ${nf(Pc*h,1)} Wh = ${nf(Pc*h/1000,4)} kWh par jour, soit ${nf(Pc*h*30/1000,1)} kWh en 30 jours.`; }
  else { const Pn=rnd([20,30,50]), fc=rnd([20,25,30]);
    ctx=`Énergie produite en un an par une éolienne de ${Pn} kW dont le facteur de charge vaut ${fc} %.`;
    st=["Une année dure 8 760 h.",`E = Pn × 8 760 = ${nf(Pn*8760,0)} kWh`,`Soit ${nf(Pn*8.76,1)} MWh par an.`]; bad=1;
    why=`L'éolienne ne produit pas en permanence sa puissance nominale : ${F("E = fc·Pn × 8 760 h")} = ${nf(fc/100,2)} × ${Pn} × 8 760 = ${nf(fc/100*Pn*8760,0)} kWh.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* distribution annuelle des vitesses du vent : énergie produite, puis facteur de charge */
()=>{ const cl=[["4 à 6",5],["6 à 8",7],["8 à 10",9],["10 à 12",11]], t=TURB[2];
  const P=cl.map(c=>r2(t.Pn*(c[1]**3-t.vd**3)/(t.vn**3-t.vd**3),1)).concat([t.Pn]);
  const o=draw(()=>{ const h=[2200,2100,1400,800,460].map(x=>Math.round(x*(0.85+Math.random()*0.3)/10)*10); return {h,h0:8760-sum(h)}; },o=>o.h0>=900);
  const E=sum(P.map((p,i)=>p*o.h[i])), fc=E/(t.Pn*8760);
  const data=table(["Vitesse du vent (m/s)","Durée (h par an)","Puissance fournie (kW)"],[["moins de 4",nf(o.h0,0),"0"],...cl.map((c,i)=>[c[0],nf(o.h[i],0),nf(P[i],1)]),["12 à 25",nf(o.h[4],0),nf(P[4],0)]]);
  const ctx=`Une éolienne de ${t.Pn} kW est installée sur un atoll. Le tableau donne, pour chaque classe de vitesse du vent, la durée annuelle et la puissance électrique fournie (valeur au milieu de la classe).`;
  return [{data,ctx,q:"Calcule l'énergie produite en un an, en kWh.",type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`${F("E = Σ P·t")} = ${P.map((p,i)=>`${nf(p,1)} × ${nf(o.h[i],0)}`).join(" + ")} = ${U(E,"kWh")}. Les ${nf(o.h0,0)} h de vent faible ne produisent rien.`},
    {data,ctx,q:"Déduis-en le facteur de charge de l'éolienne, en %.",type:"num",ans:fc*100,tolA:0.3,unit:"%",
      expl:`${F(`fc = ${FRAC("E","Pn × 8 760 h")}`)} = ${FRAC(nf(E,0),`${t.Pn} × 8 760`)} = ${nf(fc,4)}, soit ${U(fc*100,"%")}.`}]; },
/* même puissance installée, énergies différentes : solaire ou éolien */
()=>{ const tgt=rnd([0,1,2,3]); /* 0 : les deux ; 1 : seulement le solaire ; 2 : seulement l'éolien ; 3 : aucun */
  const o=draw(()=>{ const P=rnd([200,300,500,800]), fs=rnd([0.14,0.15,0.16,0.17,0.18]), fe=rnd([0.1,0.12,0.14,0.2,0.24,0.28,0.32]), Es=P*8760*fs/1000, Ee=P*8760*fe/1000, Eb=Math.round(Math.max(Es,Ee)*rnd([0.55,0.7,0.85,0.95,1.1,1.25])/10)*10;
      return {P,fs,fe,Es,Ee,Eb}; },o=>far(o.Es,o.Eb,0.05)&&far(o.Ee,o.Eb,0.05)&&far(o.Es,o.Ee,0.08)&&((o.Es>=o.Eb&&o.Ee>=o.Eb)?0:o.Es>=o.Eb?1:o.Ee>=o.Eb?2:3)===tgt);
  const C=["Les deux solutions","Seulement la ferme solaire","Seulement le parc éolien","Aucune des deux"];
  const ctx=`Une île hésite entre une ferme solaire de ${o.P} kWc (facteur de charge ${nf(o.fs*100,0)} %) et un parc éolien de ${o.P} kW (facteur de charge ${nf(o.fe*100,0)} % sur ce site). Besoin à couvrir : ${nf(o.Eb,0)} MWh par an.`;
  return [{ctx,q:"Quelle énergie la ferme solaire produit-elle en un an, en MWh ?",type:"num",ans:o.Es,tolR:0.02,unit:"MWh",
      expl:`${F("E = fc·P × 8 760 h")} = ${nf(o.fs,2)} × ${o.P} × 8 760 = ${nf(o.Es*1000,0)} kWh, soit ${U(o.Es,"MWh")}.`},
    {ctx,q:"Quelle énergie le parc éolien produit-il en un an, en MWh ?",type:"num",ans:o.Ee,tolR:0.02,unit:"MWh",
      expl:`E = ${nf(o.fe,2)} × ${o.P} × 8 760 = ${nf(o.Ee*1000,0)} kWh, soit ${U(o.Ee,"MWh")}.`},
    {ctx,q:"Quelle solution couvre le besoin annuel de l'île ?",type:"ch",ch:C,ok:tgt,
      expl:`Solaire : ${nf(o.Es,0)} MWh ${o.Es>=o.Eb?"≥":"<"} ${nf(o.Eb,0)} MWh ; éolien : ${nf(o.Ee,0)} MWh ${o.Ee>=o.Eb?"≥":"<"} ${nf(o.Eb,0)} MWh. Conclusion : ${C[tgt].toLowerCase()}. À puissance installée égale, c'est le facteur de charge qui fait l'énergie produite.`}]; },
/* coefficient de puissance et vitesse spécifique : régler la vitesse de rotation */
()=>{ const lo=rnd([6,7,8]), cm=rnd([0.42,0.45,0.48]), R=rnd([2,3,4,5,6]), v=rnd([6,7,8,9,10]), w=lo*v/R, N=w*60/(2*Math.PI);
  const fig=fx_src_cp({lo,cm}), ctx=`La vitesse spécifique ${F(`λ = ${FRAC("R·ω","v")}`)} compare la vitesse du bout des pales à celle du vent. La courbe donne Cp en fonction de λ pour un rotor de rayon R = ${R} m.`;
  return [{fig,ctx,q:"Pour quelle valeur de λ le coefficient de puissance est-il maximal ?",type:"ch",...mc(`λ = ${lo}`,[lo-3,lo+3,lo+6].map(x=>`λ = ${x}`)),
      expl:`On lit l'abscisse du sommet de la courbe : ${F(`λ = ${lo}`)}, où Cp ≈ ${nf(cm,2)}, sous la limite de Betz.`},
    {fig,ctx,q:`Par un vent de ${v} m/s, à quelle vitesse de rotation, en tr/min, faut-il faire tourner le rotor pour rester à ce λ optimal ?`,type:"num",ans:N,tolR:0.02,unit:"tr/min",
      expl:`${F(`ω = ${FRAC("λ·v","R")}`)} = ${FRAC(`${lo} × ${v}`,R)} = ${S4(w)} rad/s, puis ${F(`N = ${FRAC("60·ω","2π")}`)} = ${U(N,"tr/min")}.`},
    {fig,ctx,q:"Pourquoi la commande de l'éolienne modifie-t-elle la vitesse de rotation quand le vent change ?",type:"ch",...mc("Pour garder λ proche de sa valeur optimale, donc Cp maximal : l'éolienne récupère alors le plus de puissance possible",["Pour faire tourner le rotor le plus vite possible, quel que soit le vent","Pour dépasser la limite de Betz par vent faible","Pour que Cp devienne égal à 1"]),
      expl:`Si le vent change et que ω ne suit pas, λ s'écarte de ${lo} et Cp chute. En réglant ω proportionnellement à v, ${F(`ω = ${FRAC("λ_opt·v","R")}`)}, on reste au sommet de la courbe : c'est la recherche du point de puissance maximale.`}]; },
/* groupe de secours à hydrogène d'un relais radio : énergie, masse, nombre de bouteilles */
()=>{ const o=draw(()=>({P:rnd([150,200,250,300,400]),d:rnd([3,4,5,7]),e:rnd([0.45,0.5,0.55]),mb:rnd([0.5,0.6,0.8,1])}),o=>{ const r=o.P*24*o.d/1000/(o.e*PCI)/o.mb; return net(r)&&r>=2&&r<=40; });
  const E=o.P*24*o.d/1000, m=E/(o.e*PCI), n=m/o.mb, N=Math.ceil(n);
  const ctx=`Un relais radio installé sur un motu consomme ${o.P} W en permanence. En cas de panne de son alimentation solaire, une pile à combustible (rendement ${nf(o.e,2)}) doit prendre le relais pendant ${o.d} jours. Le dihydrogène est livré en bouteilles de ${nf(o.mb,1)} kg. ${PCIT}.`;
  return [{ctx,q:`Quelle énergie électrique la pile doit-elle fournir pendant ces ${o.d} jours, en kWh ?`,type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`${F("E = P·t")} = ${o.P} W × ${o.d} × 24 h = ${nf(o.P*24*o.d,0)} Wh, soit ${U(E,"kWh")}.`},
    {ctx,q:"Quelle masse de dihydrogène faut-il prévoir ?",type:"num",ans:m,tolR:0.02,unit:"kg",
      expl:`${F(`m = ${FRAC("E","η·PCI")}`)} = ${FRAC(S4(E),`${nf(o.e,2)} × 33,3`)} = ${U(m,"kg")}.`},
    {ctx,q:"Combien de bouteilles faut-il stocker au minimum ?",type:"num",ans:N,tolA:0,unit:"bouteilles",
      expl:`${F(`n = ${FRAC("m","m_bouteille")}`)} = ${FRAC(S4(m),nf(o.mb,1))} = ${nf(n,2)}, arrondi à l'entier supérieur : ${U(N,"bouteilles")}.`}]; },
/* pension de famille : production du jour, énergie à stocker pour la nuit, bilan */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const n=rnd([8,10,12,14,16,20]), Pc=rnd([400,425,450]), h=rnd([4.5,5,5.5]), eo=rnd([0.94,0.95,0.96]), Ej=rnd([4,5,6,8]), En=rnd([3,4,5,6]), eb=rnd([0.85,0.88,0.9]);
      const Ep=n*Pc*h*eo/1000, Eneed=Ej+En/eb; return {n,Pc,h,eo,Ej,En,eb,Ep,Eneed}; },o=>far(o.Ep,o.Eneed,0.06)&&(o.Ep>=o.Eneed)===tgt);
  const ok=o.Ep>=o.Eneed;
  const ctx=`Pension de famille autonome à Maupiti : ${o.n} panneaux de ${o.Pc} Wc (${nf(o.h,1)} heures équivalentes par jour), onduleur de rendement ${nf(o.eo,2)}. Consommation : ${o.Ej} kWh pendant la journée, fournis directement par les panneaux, et ${o.En} kWh la nuit, fournis par des batteries de rendement ${nf(o.eb,2)} (charge puis décharge).`;
  return [{ctx,q:"Quelle énergie électrique l'installation produit-elle par jour, à la sortie de l'onduleur ?",type:"num",ans:o.Ep,tolR:0.02,unit:"kWh",
      expl:`${F("E = n·Pc·h·η_ond")} = ${o.n} × ${o.Pc} × ${nf(o.h,1)} × ${nf(o.eo,2)} = ${nf(o.Ep*1000,0)} Wh, soit ${U(o.Ep,"kWh")}.`},
    {ctx,q:"Quelle énergie faut-il envoyer dans les batteries pendant la journée pour couvrir la consommation de la nuit ?",type:"num",ans:o.En/o.eb,tolR:0.02,unit:"kWh",
      expl:`Les batteries ne rendent que ${nf(o.eb*100,0)} % de ce qu'elles reçoivent : ${F(`E_stockée = ${FRAC("E_nuit","η_bat")}`)} = ${FRAC(o.En,nf(o.eb,2))} = ${U(o.En/o.eb,"kWh")}.`},
    {ctx,q:"La production couvre-t-elle la consommation de toute la journée, nuit comprise ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Besoin total : ${o.Ej} + ${nf(o.En/o.eb,2)} = ${nf(o.Eneed,2)} kWh. Production : ${nf(o.Ep,2)} kWh ${ok?"≥":"<"} ${nf(o.Eneed,2)} kWh : ${ok?"la production suffit ; le surplus constitue une réserve.":"la production ne suffit pas ; il faut ajouter des panneaux ou réduire la consommation."}`}]; },
/* effet du cube : l'affirmation d'un élève */
()=>{ const p=rnd([10,15,20,25,30]), k=(1+p/100)**3, gg=(k-1)*100;
  const ctx=`Un élève affirme : « avec un vent ${p} % plus rapide, l'éolienne produit ${p} % de puissance en plus ». L'éolienne fonctionne en dessous de sa puissance nominale, avec un Cp constant.`;
  return [{ctx,q:"Par combien la puissance récupérée est-elle réellement multipliée ?",type:"num",ans:k,tolR:0.02,unit:"",
      expl:`${F("P = ½·ρ·S·v³·Cp")} : si v est multipliée par ${nf(1+p/100,2)}, P est multipliée par ${F(`${nf(1+p/100,2)}³`)} = ${U(k,"")}.`},
    {ctx,q:"Quelle augmentation de puissance, en %, obtient-on réellement ?",type:"num",ans:gg,tolR:0.02,unit:"%",
      expl:`(${nf(k,4)} − 1) × 100 = ${U(gg,"%")}, et non ${p} % : l'élève a oublié le cube.`},
    {ctx,q:"Pourquoi ce calcul n'est-il plus valable quand le vent dépasse la vitesse nominale de l'éolienne ?",type:"ch",...mc("Au-delà, la régulation limite la puissance à la puissance nominale pour protéger la machine",["Au-delà, la masse volumique de l'air double","Au-delà, la limite de Betz ne s'applique plus","Au-delà, la puissance devient proportionnelle à v²"]),
      expl:"Entre la vitesse nominale et la vitesse de coupure, l'éolienne fournit une puissance constante, le palier de sa courbe de puissance (orientation des pales ou décrochage) : un vent plus fort n'apporte alors plus rien."}]; }
];

POOLS["ener-sources"]={
  titre:"Photovoltaïque, éolien, hydrogène",
  fiche:{t:"Photovoltaïque, éolien, hydrogène",l:[
    `Panneau : ${F("P = η·G·S")} (G : irradiance en W/m²) ; puissance crête, en Wc, sous 1 000 W/m² : ${F("Pc = η·S × 1 000 W/m²")}.`,
    `Énergie par jour : ${F("E = Pc·h")} (h : heures équivalentes à 1 000 W/m²) ; nombre de panneaux ${F(`n = ${FRAC("E_besoin","E_panneau")}`)}, onduleur compris, arrondi à l'entier supérieur.`,
    `Éolienne : ${F("P = ½·ρ·S·v³·Cp")}, S = π·R² ; limite de Betz ${F(`Cp ≤ ${FRAC("16","27")} ≈ 0,59`)} ; facteur de charge ${F(`fc = ${FRAC("E","Pn × 8 760 h")}`)}.`,
    `Hydrogène : électrolyseur (électrique → chimique), pile à combustible (chimique → électrique) ; ${F("E = m·PCI")} ; chaîne ${F("η = η1·η2·η3")}, environ 0,3.`,
    "Pièges : le rayon et non le diamètre, v au cube (vent × 2 : puissance × 8), des Wc ne sont pas une énergie, arrondir le nombre de panneaux vers le haut, diviser par η pour l'énergie à fournir en entrée."]},
  count:{1:4,2:4,3:3},1:SRC1,2:SRC2,3:SRC3
};

/* ======================================================================
   INNOVATION ET CONCEPTION (innov-conception)
   ====================================================================== */
const ETAPES=["Expression du besoin","Cahier des charges","Recherche de solutions","Prototypage","Essais et validation"];
const ETL=[["Expression","du besoin"],["Cahier des","charges"],["Recherche","de solutions"],["Prototypage"],["Essais et","validation"]];
/* lignes de cahier des charges : système, fonction, critère, niveau, flexibilité */
const CDC=[
  {s:"d'un chariot de marché pliant",f:"Transporter les courses",c:"Masse transportable",n:"25 kg au moins",x:"F1"},
  {s:"d'une lampe solaire de terrasse",f:"Éclairer la terrasse la nuit",c:"Durée d'éclairage",n:"6 h au moins",x:"F2"},
  {s:"d'un boîtier de capteur pour le lagon",f:"Résister à l'eau de mer",c:"Profondeur d'immersion",n:"10 m au moins",x:"F0"},
  {s:"d'une pagaie de va'a",f:"Être maniable par le rameur",c:"Masse de la pagaie",n:"700 g au plus",x:"F1"},
  {s:"d'un chargeur solaire de téléphone",f:"Recharger un téléphone",c:"Durée de charge complète",n:"4 h au plus",x:"F2"},
  {s:"d'un gilet de sauvetage",f:"Maintenir la tête hors de l'eau",c:"Force de flottabilité",n:"100 N au moins",x:"F0"}];
/* exemples d'innovations : 1 = de rupture, 0 = incrémentale */
const INNOV=[
  ["La lampe à LED, qui remplace l'ampoule à incandescence par un tout autre principe d'éclairage",1],
  ["L'appareil photo numérique, qui supprime la pellicule",1],
  ["L'impression 3D, qui construit une pièce couche par couche au lieu d'enlever de la matière",1],
  ["Le GPS, qui remplace la carte et la boussole par une localisation par satellites",1],
  ["Une nouvelle version de vélo dont le cadre pèse 300 g de moins",0],
  ["Un panneau solaire dont le rendement passe de 20 % à 21 %",0],
  ["Une batterie de téléphone 10 % plus endurante que celle du modèle précédent",0],
  ["Une pirogue dont la forme de coque est légèrement affinée pour gagner en vitesse",0],
  ["Une trottinette électrique dont le frein est plus puissant que sur le modèle précédent",0]];
/* scénarios de matrice de décision : critères, solutions (noms courts), notes de base plausibles (nb, de 1 à 5, par solution et par critère),
   critère éliminatoire (dir : +1 au moins, −1 au plus ; bad : solution qu'il élimine) */
const SCEN=[
  {sys:"du mode de déplacement d'un robot nettoyeur de panneaux solaires",sol:["Roues","Chenilles","Ventouses"],crit:["Adhérence","Masse","Coût","Consommation"],nb:[[2,4,5,4],[4,2,3,3],[5,3,2,2]],el:{g:"puissance consommée",u:"W",lim:30,dir:-1,d:0,bad:2}},
  {sys:"du matériau de la coque d'un drone marin",sol:["Fibre de verre","Carbone","Polyéthylène"],crit:["Coût","Masse","Tenue aux chocs","Réparabilité"],nb:[[4,3,3,4],[1,5,3,2],[5,2,5,2]],el:{g:"masse de la coque",u:"kg",lim:4,dir:-1,d:1,bad:2}},
  {sys:"du stockage d'énergie d'un relais radio sur un motu",sol:["Plomb","Lithium","Hydrogène"],crit:["Coût","Durée de vie","Masse","Entretien"],nb:[[5,2,1,3],[2,4,4,4],[1,4,3,2]],el:{g:"masse du stockage",u:"kg",lim:40,dir:-1,d:0,bad:0}},
  {sys:"du procédé de fabrication de 50 boîtiers de capteur",sol:["Impression 3D","Usinage","Moulage"],crit:["Coût","Délai","Précision","Étanchéité"],nb:[[4,5,3,2],[2,3,5,3],[1,1,4,5]],el:{g:"délai de livraison",u:"jours",lim:15,dir:-1,d:0,bad:2}},
  {sys:"de la motorisation d'une pirogue de pêche",sol:["Thermique","Électrique","Électrique et solaire"],crit:["Coût d'achat","Autonomie","Émissions","Entretien"],nb:[[5,5,1,2],[3,2,4,4],[2,4,5,4]],el:{g:"niveau sonore à 7 m",u:"dB",lim:70,dir:-1,d:0,bad:0}},
  {sys:"du capteur de niveau d'une citerne d'eau de pluie",sol:["Ultrasons","Flotteur","Pression"],crit:["Précision","Coût","Fiabilité","Consommation"],nb:[[4,3,4,3],[2,5,3,5],[5,2,4,4]],el:{g:"prix du capteur",u:"€",lim:60,dir:-1,d:0,bad:2}}];
/* notes d'une solution : note de base ± 1, entre 1 et 5 */
const notes=(S,j)=>S.nb[j].map(b=>Math.min(5,Math.max(1,b+rnd([-1,0,0,1]))));
/* bêtes à cornes : produit, à qui, sur quoi, dans quel but, et une solution technique (distracteur) */
const BETES=[
  {p:"Pompe solaire de citerne",a:"Aux habitants du faré",b:"L'eau de la citerne",c:"Monter l'eau de la citerne jusqu'au réservoir de la maison",sol:"Un moteur à courant continu de 12 V"},
  {p:"Robot nettoyeur de panneaux",a:"Au propriétaire de la ferme solaire",b:"La surface des panneaux",c:"Enlever le sel et la poussière déposés sur les panneaux",sol:"Des brosses rotatives en nylon"},
  {p:"Balise de plongée connectée",a:"Aux moniteurs de plongée",b:"La position des plongeurs",c:"Signaler en surface la position des plongeurs",sol:"Un module radio et une antenne"},
  {p:"Séchoir solaire à coprah",a:"Aux producteurs de coprah",b:"La chair de noix de coco",c:"Sécher la chair de coco grâce à l'énergie du soleil",sol:"Un capteur plan vitré et un ventilateur"}];
/* matériaux d'impression : nom, masse volumique (g/cm³), prix du filament (€/kg) */
const MATX=[["PLA",1.24,25],["PETG",1.27,30],["ABS",1.04,28]];
const scores=(w,N)=>N.map(r=>sum(r.map((x,i)=>x*w[i])));
const matData=(S,w,N)=>table(["Critère","Poids",...S.sol],S.crit.map((c,i)=>[c,String(w[i]),...N.map(r=>String(r[i]))]));
const elT=e=>`${e.g} de ${nf(e.lim,e.d)} ${e.u} ${e.dir>0?"au moins":"au plus"}`;

const INN1=[
/* ordre des étapes de la démarche de conception */
()=>{ if(Math.random()<0.5){ const J=a=>a.map(i=>ETAPES[i]).join(" → ");
    return {q:"Dans quel ordre se déroulent les étapes d'une démarche de conception ?",type:"ch",...mc(J([0,1,2,3,4]),[J([2,0,1,3,4]),J([0,3,1,2,4]),J([1,0,2,4,3])]),
      expl:`On part du ${F("besoin")}, traduit en exigences mesurables dans le ${F("cahier des charges")} ; on cherche ensuite des solutions, on réalise un prototype, puis des essais vérifient les exigences. Si une exigence n'est pas satisfaite, on reboucle sur la recherche de solutions.`}; }
  return {q:"Dans une démarche de conception, quelle étape suit directement la rédaction du cahier des charges ?",type:"ch",...mc("La recherche de solutions",["L'expression du besoin","Les essais et la validation","La fabrication en série"]),
    expl:`Besoin → cahier des charges → ${F("recherche de solutions")} → prototypage → essais et validation. Le cahier des charges fixe les exigences ; c'est seulement ensuite qu'on imagine et compare des solutions.`}; },
/* démarche de conception : étape manquante sur le schéma */
()=>{ const k=rnd([0,1,2,3,4]), fig=fx_sce_flow({b:ETL.map((t,i)=>({t,q:i===k})),back:{from:4,to:2,lab:"exigence non satisfaite : on reboucle"}});
  return {fig,q:"Quelle étape de la démarche de conception manque sur ce schéma ?",type:"ch",...mc(ETAPES[k],shuffle(ETAPES.filter((_,i)=>i!==k)).slice(0,3)),
    expl:`L'ordre est : ${ETAPES.map(e=>e.toLowerCase()).join(" → ")}. La case « ? » correspond à ${F(ETAPES[k].toLowerCase())}. La flèche de retour rappelle qu'un essai non conforme renvoie à la recherche de solutions.`}; },
/* ligne de cahier des charges : fonction, critère, niveau, flexibilité */
()=>{ const c=rnd(CDC), k=rnd([0,1,2,3]), parts=[c.f,c.c,c.n,c.x], NM=["La fonction","Le critère d'appréciation","Le niveau","La flexibilité"];
  const shown=shuffle([0,1,2,3]).map(i=>`« ${parts[i]} »`).join(" · ");
  return {ctx:`Une ligne du cahier des charges ${c.s} contient, dans le désordre : ${shown}.`,q:`Dans cette ligne, que représente « ${parts[k]} » ?`,type:"ch",ch:NM,ok:k,
    expl:`Fonction : ce que le produit doit faire (« ${c.f} »). Critère : la grandeur qui permet de l'apprécier (« ${c.c} »). Niveau : la valeur à atteindre, avec son unité (« ${c.n} »). Flexibilité : la marge de négociation sur le niveau (« ${c.x} »). Ici, « ${parts[k]} » est ${F(NM[k].toLowerCase())}.`}; },
/* classes de flexibilité */
()=>{ const k=rnd([0,1,2,3]);
  return {q:`Dans un cahier des charges, que signifie une flexibilité F${k} ?`,type:"ch",ch:["Niveau impératif : aucune négociation possible","Niveau peu négociable","Niveau négociable","Niveau très négociable"],ok:k,
    expl:`La flexibilité indique la marge de négociation sur le niveau : ${F("F0 : impératif")}, F1 : peu négociable, F2 : négociable, F3 : très négociable. Une solution qui ne respecte pas un niveau F0 est éliminée, quel que soit son score.`}; },
/* innovation incrémentale ou de rupture */
()=>{ const [t,k]=rnd(INNOV);
  return {q:`« ${t} » : de quel type d'innovation s'agit-il ?`,type:"ch",ch:["Innovation incrémentale","Innovation de rupture"],ok:k,
    expl:k?`Le principe technique change complètement : c'est une ${F("innovation de rupture")}. Elle crée souvent de nouveaux usages et fait disparaître l'ancienne technologie.`:`Le produit existant est amélioré sans changer de principe : c'est une ${F("innovation incrémentale")}, la plus fréquente (versions successives d'un même produit).`}; },
/* brevet et propriété intellectuelle */
()=>{ const v=rnd([0,1,2]);
  if(v===0) return {q:"Pendant combien de temps, au maximum, un brevet protège-t-il une invention ?",type:"ch",...mc("20 ans à partir du dépôt",["5 ans à partir du dépôt","70 ans après la mort de l'inventeur","Sans limite de durée"]),
    expl:`Un brevet protège l'invention ${F("20 ans au plus")}, à condition de payer chaque année une redevance ; ensuite, tout le monde peut l'exploiter librement. La durée de 70 ans après la mort de l'auteur concerne le droit d'auteur (œuvres artistiques), pas les brevets.`};
  if(v===1) return {q:"Quelles conditions une invention doit-elle remplir pour être brevetée ?",type:"ch",...mc("Être nouvelle, résulter d'une activité inventive et être susceptible d'application industrielle",["Être déjà vendue depuis au moins un an","Avoir été présentée au public avant le dépôt","Être fabriquée en France"]),
    expl:`Trois conditions : la ${F("nouveauté")} (rien de public avant le dépôt), l'activité inventive (la solution n'est pas évidente pour un spécialiste) et l'application industrielle. Une invention présentée au public avant le dépôt n'est plus nouvelle.`};
  return {q:"Que protège un brevet ?",type:"ch",...mc("Une invention technique (produit ou procédé) : son titulaire peut interdire aux autres de l'exploiter sans son accord",["Une marque, un nom ou un logo","Une simple idée, même si elle n'est pas réalisable","Une œuvre artistique, comme une musique ou un dessin"]),
    expl:`Le brevet protège une ${F("invention technique")}. La marque protège un nom ou un logo ; le droit d'auteur protège les œuvres. Une idée seule, sans solution technique, ne se brevette pas.`}; },
/* masse d'un prototype imprimé en 3D */
()=>{ const [mat,rho]=rnd(MATX), V=rnd([18,24,36,45,60,85,120,150]), m=rho*V, obj=rnd(["support de téléphone pour pirogue","boîtier de capteur de niveau","poignée de pagaie","pièce de fixation de panneau solaire","carter de petit réducteur"]);
  return {ctx:`Le modèle 3D d'un prototype de ${obj} a un volume de matière V = ${V} cm³ (pièce imprimée pleine). Il est imprimé en ${mat}, de masse volumique ρ = ${nf(rho,2)} g/cm³.`,
    q:"Calcule la masse du prototype.",type:"num",ans:m,tolR:0.02,unit:"g",
    expl:`${F("m = ρ·V")} = ${nf(rho,2)} × ${V} = ${U(m,"g")}. Des g/cm³ multipliés par des cm³ donnent directement des grammes.`}; },
/* durée d'impression */
()=>{ const V=rnd([30,45,60,80,100,120,150]), d=rnd([10,12,15,20,24,30]), t=V/d, H=Math.floor(t+1e-9), M=Math.round((t-H)*60);
  return {ctx:`Une pièce de ${V} cm³ est imprimée en 3D. Le débit moyen de matière de l'imprimante vaut ${d} cm³/h.`,q:"Combien de temps dure l'impression, en heures ?",type:"num",ans:t,tolR:0.02,unit:"h",
    expl:`${F(`t = ${FRAC("V","débit")}`)} = ${FRAC(V,d)} = ${U(t,"h")}${M?`, soit environ ${H} h ${M} min`:""}.`}; },
/* score d'une solution dans une matrice pondérée */
()=>{ const S=rnd(SCEN), j=rnd([0,1,2]), w=S.crit.map(()=>rnd([1,2,3,4,5])), n=notes(S,j), sc=sum(n.map((x,i)=>x*w[i]));
  return {data:table(["Critère","Poids","Note"],S.crit.map((c,i)=>[c,String(w[i]),String(n[i])])),ctx:`Choix ${S.sys} : on évalue la solution « ${S.sol[j]} » (notes de 1 à 5).`,
    q:"Calcule le score pondéré de cette solution.",type:"num",ans:sc,tolA:0,unit:"points",
    expl:`${F("score = Σ poids × note")} = ${n.map((x,i)=>`${w[i]} × ${x}`).join(" + ")} = ${U(sc,"points")}. On multiplie chaque note par le poids de son critère avant d'additionner.`}; },
/* critère éliminatoire */
()=>{ const o=draw(()=>{ const lim=rnd([2,2.5,3]), ms=[0,1,2,3].map(()=>r2(lim*(0.7+Math.random()*0.22),2)), bad=rnd([0,1,2,3]); ms[bad]=r2(lim*(1.08+Math.random()*0.2),2);
      const sc=[0,1,2,3].map(()=>ri(28,40)); sc[bad]=Math.max(...sc)+ri(2,5); return {lim,ms,bad,sc}; },o=>new Set(o.sc).size===4);
  const nm=["A","B","C","D"];
  return {data:table(["Solution","Masse (kg)","Score de la matrice"],nm.map((x,i)=>[`Solution ${x}`,nf(o.ms[i],2),String(o.sc[i])])),ctx:`Châssis d'un robot nettoyeur de panneaux solaires. Exigence : masse de ${nf(o.lim,1)} kg au plus, flexibilité F0, pour ne pas abîmer les panneaux.`,
    q:"Quelle solution faut-il éliminer d'office ?",type:"ch",ch:nm.map(x=>`Solution ${x}`),ok:o.bad,
    expl:`Seule la solution ${nm[o.bad]} dépasse ${nf(o.lim,1)} kg (${nf(o.ms[o.bad],2)} kg). Le niveau est impératif (F0) : elle est ${F("éliminée")}, même si elle a le meilleur score. On choisit ensuite parmi les solutions restantes.`}; },
/* bête à cornes */
()=>{ const B=rnd(BETES), k=rnd(["a","b","c"]), T={a:"À qui rend-il service ?",b:"Sur quoi agit-il ?",c:"Dans quel but ?"};
  const fig=fx_inn_bete({a:k==="a"?"?":B.a,b:k==="b"?"?":B.b,p:B.p,c:k==="c"?"?":B.c});
  return {fig,q:"Que faut-il écrire dans la case « ? » de ce diagramme ?",type:"ch",...mc(B[k],["a","b","c"].filter(x=>x!==k).map(x=>B[x]).concat([B.sol])),
    expl:`La bête à cornes exprime le besoin : à qui le produit rend service (${B.a.toLowerCase()}), sur quoi il agit (${B.b.charAt(0).toLowerCase()+B.b.slice(1)}) et dans quel but (${B.c.charAt(0).toLowerCase()+B.c.slice(1)}). La case « ${T[k]} » attend donc ${HL(B[k])}. « ${B.sol} » est une solution technique : elle n'a pas sa place dans l'expression du besoin.`}; },
/* fonction ou solution technique */
()=>{ const S=rnd([
    ["Permettre à l'utilisateur de se déplacer en ville",["Utiliser un moteur-roue de 250 W","Une batterie lithium-ion de 36 V","Un cadre en aluminium soudé"]],
    ["Maintenir la température de l'aquarium entre 24 °C et 28 °C",["Une résistance chauffante de 100 W","Un thermostat électronique","Une pompe de 12 V"]],
    ["Alerter le propriétaire quand la citerne est presque vide",["Un capteur de niveau à ultrasons","Un module radio LoRa","Un buzzer piézoélectrique"]],
    ["Éclairer le chemin de la plage la nuit",["Des lampes à LED de 3 W","Un panneau solaire de 20 Wc","Une batterie de 12 V"]]]);
  return {q:"Laquelle de ces formulations exprime une fonction (ce que le produit doit faire) et non une solution technique ?",type:"ch",...mc(S[0],S[1]),
    expl:`Une fonction se formule avec un verbe à l'infinitif et ne dit pas comment faire : « ${S[0]} ». Les autres propositions sont des ${F("solutions techniques")} : on les choisit après avoir écrit le cahier des charges.`}; },
/* cycle de vie commercial d'un produit */
()=>{ const fig=fx_inn_vie({b:[1.5,3.5,7],T:12,tp:5}), k=rnd([0,1,2]), ctx="Évolution des ventes annuelles d'un produit depuis son lancement.";
  if(k===1) return {fig,ctx,q:"Comment s'appelle la phase numérotée 3 ?",type:"ch",ch:["Le lancement","La croissance","La maturité","Le déclin"],ok:2,
    expl:`Phases : 1 lancement (ventes faibles), 2 croissance (ventes en forte hausse), 3 ${F("maturité")} (ventes maximales et à peu près stables), 4 déclin. C'est souvent en maturité qu'on lance une innovation incrémentale pour prolonger la vie du produit.`};
  return {fig,ctx,q:k===0?"Dans quelle phase les ventes progressent-elles le plus vite ?":"Dans quelle phase les ventes diminuent-elles ?",type:"ch",ch:["Phase 1","Phase 2","Phase 3","Phase 4"],ok:k===0?1:3,
    expl:k===0?`La pente de la courbe est la plus forte en phase 2 : c'est la ${F("croissance")}. En phase 1 (lancement), le produit est encore peu connu ; en phase 3 (maturité), les ventes plafonnent.`:`Après le sommet atteint en phase 3 (maturité), la courbe descend : c'est le ${F("déclin")}, phase 4. Le produit est dépassé par des concurrents ou par une nouvelle technologie.`}; },
/* remue-méninges et créativité */
()=>{ if(Math.random()<0.5) return {q:"Pendant la phase de production d'idées d'un remue-méninges (brainstorming), quelle règle faut-il respecter ?",type:"ch",...mc("Ne critiquer aucune idée et en proposer le plus possible, même inattendues",["Ne garder que les idées réalisables tout de suite","Ne laisser parler que le chef de projet","Choisir la meilleure idée dès qu'elle apparaît"]),
    expl:`La créativité demande deux temps : d'abord ${F("produire")} beaucoup d'idées sans les juger, puis seulement les trier et les évaluer (par exemple avec une matrice de décision). Critiquer trop tôt bloque les idées originales.`};
  return {q:"À quel moment de la démarche de conception organise-t-on un remue-méninges (brainstorming) ?",type:"ch",...mc("Pendant la recherche de solutions, pour imaginer de nombreuses idées avant de les comparer",["Pendant les essais, pour mesurer les performances du prototype","Avant l'expression du besoin, pour choisir le prix de vente","Après la validation, pour rédiger la notice"]),
    expl:`Le remue-méninges est un outil de ${F("créativité")} : une fois le cahier des charges écrit, il sert à imaginer un grand nombre de solutions, qu'on évalue ensuite, par exemple avec une matrice de décision.`}; }
];

const INN2=[
/* matrice pondérée : score d'une solution, puis choix */
()=>{ const S=rnd(SCEN), o=draw(()=>{ const w=S.crit.map(()=>rnd([1,2,3,4,5])), N=S.sol.map((_,j)=>notes(S,j)), sc=scores(w,N), srt=sc.slice().sort((a,b)=>b-a); return {w,N,sc,ok:srt[0]-srt[1]>=3&&srt[1]>srt[2]}; },o=>o.ok);
  const j=rnd([0,1,2]), best=o.sc.indexOf(Math.max(...o.sc)), data=matData(S,o.w,o.N), ctx=`Matrice de décision pour le choix ${S.sys} : chaque solution reçoit une note de 1 (mauvais) à 5 (excellent) pour chaque critère.`;
  return [{data,ctx,q:`Calcule le score pondéré de la solution « ${S.sol[j]} ».`,type:"num",ans:o.sc[j],tolA:0,unit:"points",
      expl:`${F("score = Σ poids × note")} = ${o.N[j].map((x,i)=>`${o.w[i]} × ${x}`).join(" + ")} = ${U(o.sc[j],"points")}.`},
    {data,ctx,q:"Quelle solution faut-il retenir ?",type:"ch",ch:S.sol.slice(),ok:best,
      expl:`Scores : ${S.sol.map((s,k)=>`${s} ${o.sc[k]}`).join(" ; ")}. Aucun critère n'est éliminatoire ici : on retient la solution de plus grand score, ${F(S.sol[best])}.`}]; },
/* plaque de fixation imprimée : volume, puis masse */
()=>{ const L=rnd([80,90,100,120,150]), l=rnd([40,50,60,70]), e=rnd([3,4,5,6,8]), d=rnd([5,6,8,10]), n=rnd([1,2,4]), [mat,rho]=rnd(MATX);
  const Vp=L*l*e, Vt=n*Math.PI*d*d/4*e, V=(Vp-Vt)/1000, m=rho*V;
  const fig=fx_inn_piece({L,l,d,n,m:12,e}), ctx=`Prototype d'une plaque de fixation imprimée en ${mat} (ρ = ${nf(rho,2)} g/cm³), pièce pleine.`;
  return [{fig,ctx,q:"Calcule le volume de matière de la plaque, en cm³.",type:"num",ans:V,tolR:0.02,unit:"cm³",
      expl:`Plaque pleine : ${L} × ${l} × ${e} = ${nf(Vp,0)} mm³. ${n>1?`Trous : ${n} × π × ${FRAC(`${d}²`,"4")} × ${e}`:`Trou : π × ${FRAC(`${d}²`,"4")} × ${e}`} = ${nf(Vt,0)} mm³. ${F("V = V_plaque − V_trous")} = ${nf(Vp-Vt,0)} mm³, soit ${U(V,"cm³")} (1 cm³ = 1 000 mm³).`},
    {fig,ctx,q:"Déduis-en la masse du prototype.",type:"num",ans:m,tolR:0.02,unit:"g",expl:`${F("m = ρ·V")} = ${nf(rho,2)} × ${S4(V)} = ${U(m,"g")}.`}]; },
/* prototype : durée d'impression, puis coût de revient */
()=>{ const V=rnd([40,60,80,100,120,150]), d=rnd([12,15,20,25]), [mat,rho,pk]=rnd(MATX), ch=rnd([1.5,2,2.5,3]), t=V/d, m=rho*V, C=m/1000*pk+t*ch;
  const ctx=`Un prototype de ${V} cm³ est imprimé en ${mat} (ρ = ${nf(rho,2)} g/cm³, filament à ${pk} € le kilogramme). Débit moyen de l'imprimante : ${d} cm³/h. Une heure d'impression (électricité, usure de la machine) coûte ${nf(ch,2)} €.`;
  return [{ctx,q:"Calcule la durée d'impression du prototype, en heures.",type:"num",ans:t,tolR:0.02,unit:"h",expl:`${F(`t = ${FRAC("V","débit")}`)} = ${FRAC(V,d)} = ${U(t,"h")}.`},
    {ctx,q:"Calcule le coût de revient du prototype (matière et temps machine), en €.",type:"num",ans:C,tolR:0.02,unit:"€",
      expl:`Masse : ${F("m = ρ·V")} = ${nf(rho,2)} × ${V} = ${S4(m)} g, soit ${nf(m/1000,4)} kg ; matière : ${nf(m/1000,4)} × ${pk} = ${nf(m/1000*pk,2)} €. Machine : ${S4(t)} × ${nf(ch,2)} = ${nf(t*ch,2)} €. Total : ${U(C,"€")}.`}]; },
/* compromis masse et rigidité : bras de drone en trois matériaux */
()=>{ const Va=rnd([12,14,16,18,20]), kp=rnd([3,3.5,4,4.5]), kc=rnd([0.8,0.9,1]), heavy=Math.random()<0.5;
  const M=[["aluminium",2.7,Va],["PLA imprimé",1.24,Va*kp],["composite carbone",1.6,Va*kc]].map(x=>({n:x[0],r:x[1],V:x[2],m:x[1]*x[2]}));
  const ms=M.map(x=>x.m), best=heavy?ms.indexOf(Math.max(...ms)):ms.indexOf(Math.min(...ms));
  const data=table(["Matériau","Masse volumique (g/cm³)","Volume nécessaire (cm³)"],M.map(x=>[cap1(x.n),nf(x.r,2),S4(x.V)]));
  const ctx="Bras d'un drone de surveillance du lagon : pour obtenir la même rigidité, le volume de matière nécessaire dépend du matériau (tableau).";
  return [{data,ctx,q:"Calcule la masse du bras en PLA imprimé.",type:"num",ans:M[1].m,tolR:0.02,unit:"g",expl:`${F("m = ρ·V")} = 1,24 × ${S4(M[1].V)} = ${U(M[1].m,"g")}.`},
    {data,ctx,q:`Quel matériau donne le bras le plus ${heavy?"lourd":"léger"} ?`,type:"ch",ch:M.map(x=>cap1(x.n)),ok:best,
      expl:`Masses : ${M.map(x=>`${x.n} ${nf(x.r,2)} × ${S4(x.V)} = ${S4(x.m)} g`).join(" ; ")}. ${heavy?"Le PLA a la plus faible masse volumique, mais il en faut beaucoup plus pour la même rigidité : c'est le bras le plus lourd.":"Le composite carbone donne le bras le plus léger ; c'est aussi le matériau le plus cher : tout le compromis entre masse, coût et performance."}`}]; },
/* validation d'un prototype : écart au niveau, puis conclusion */
()=>{ const C=rnd([{c:"l'effort de fermeture d'une trappe",u:"N",n:[30,40,50],d:1},{c:"la durée de charge de la batterie d'un drone",u:"min",n:[45,60,90],d:0},{c:"la portée radio d'une balise de plongée",u:"m",n:[200,300,500],d:0},{c:"la vitesse d'un robot nettoyeur de panneaux",u:"m/s",n:[0.2,0.25,0.3],d:3}]);
  const tgt=Math.random()<0.5, n=rnd(C.n), tol=rnd([5,10]);
  const o=draw(()=>{ const e=(tgt?(0.15+Math.random()*0.65)*tol:tol*(1.3+Math.random()*0.8))*(Math.random()<0.5?1:-1), mes=r2(n*(1+e/100),C.d); return {mes,er:ecart(mes,n)}; },o=>far(o.er,tol,0.1)&&(o.er<=tol)===tgt&&o.er>0.3);
  const ok=o.er<=tol, ctx=`Cahier des charges : ${C.c} doit valoir ${nf(n,C.d)} ${C.u}, avec une flexibilité F1 de ± ${tol} %. Sur le prototype, on mesure ${nf(o.mes,C.d)} ${C.u}.`;
  return [{ctx,q:"Calcule l'écart relatif entre la mesure et le niveau du cahier des charges (référence : niveau du cahier des charges).",type:"num",ans:o.er,tolR:0.02,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|mesure − niveau|","niveau")} × 100`)} = ${FRAC(`|${nf(o.mes,C.d)} − ${nf(n,C.d)}|`,nf(n,C.d))} × 100 = ${U(o.er,"%")}.`},
    {ctx,q:"Le prototype satisfait-il cette exigence ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${nf(o.er,1)} % ${ok?"≤":">"} ${tol} % : ${ok?"l'écart reste dans la flexibilité, l'exigence est satisfaite.":"l'écart dépasse la flexibilité, l'exigence n'est pas satisfaite : il faut reprendre la conception (on reboucle sur la recherche de solutions)."}`}]; },
/* maquette réduite : volume, puis durée d'impression */
()=>{ const V=rnd([400,600,800,1200,1500,2000]), k=rnd([2,3,4]), d=rnd([12,15,20,25]), Vs=V/k**3, t=Vs/d;
  const obj=rnd(["la coque d'un drone marin","le carénage d'une petite éolienne","la coque d'une pirogue miniature","le boîtier d'une station météo"]);
  const ctx=`${cap1(obj)} a un volume de matière de ${nf(V,0)} cm³. Pour valider les formes, on imprime d'abord une maquette dont toutes les dimensions sont divisées par ${k}. Débit de l'imprimante : ${d} cm³/h.`;
  return [{ctx,q:"Quel est le volume de matière de la maquette ?",type:"num",ans:Vs,tolR:0.02,unit:"cm³",
      expl:`Les trois dimensions sont divisées par ${k}, donc le volume est divisé par ${F(`${k}³ = ${k**3}`)} : ${FRAC(nf(V,0),k**3)} = ${U(Vs,"cm³")}.`},
    {ctx,q:"Combien de temps dure l'impression de la maquette, en heures ?",type:"num",ans:t,tolR:0.02,unit:"h",
      expl:`${F(`t = ${FRAC("V","débit")}`)} = ${FRAC(S4(Vs),d)} = ${U(t,"h")}, au lieu de ${S4(V/d)} h pour la pièce réelle.`}]; },
/* série de pièces : coût de conception amorti */
()=>{ const Cc=rnd([600,800,1000,1500,2000]), cu=rnd([4,6,8,12,15]), n1=rnd([10,20]), n2=rnd([200,500,1000]), c1=(Cc+n1*cu)/n1, c2=(Cc+n2*cu)/n2;
  const ctx=`La conception d'un support de panneau solaire (étude, modèle 3D, essais) a coûté ${nf(Cc,0)} €. Chaque pièce imprimée coûte ensuite ${cu} € (matière et temps machine).`;
  return [{ctx,q:`Quel est le coût de revient d'une pièce si l'on n'en fabrique que ${n1} ?`,type:"num",ans:c1,tolR:0.02,unit:"€",
      expl:`${F(`c = ${FRAC("C_conception + n·c_pièce","n")}`)} = ${FRAC(`${nf(Cc,0)} + ${n1} × ${cu}`,n1)} = ${U(c1,"€")}.`},
    {ctx,q:`Quel est ce coût de revient si l'on en fabrique ${nf(n2,0)} ?`,type:"num",ans:c2,tolR:0.02,unit:"€",
      expl:`c = ${FRAC(`${nf(Cc,0)} + ${nf(n2,0)} × ${cu}`,nf(n2,0))} = ${U(c2,"€")}. Le coût de conception est réparti sur beaucoup plus de pièces : c'est l'effet de série.`}]; },
/* atelier d'impression : heures machine, puis nombre de jours */
()=>{ const o=draw(()=>({N:rnd([40,60,80,100,150]),t:rnd([1.5,2,2.5,3,4]),k:rnd([3,4,5,6]),h:rnd([16,20])}),o=>{ const j=o.N*o.t/(o.k*o.h); return net(j)&&j>=1.5&&j<=12&&Math.ceil(o.N/(o.k*Math.floor(o.h/o.t+1e-9)))===Math.ceil(j); });
  const H=o.N*o.t, j=H/(o.k*o.h), J=Math.ceil(j);
  const ctx=`Un atelier d'impression 3D de Papeete doit livrer ${o.N} médailles personnalisées pour une course de va'a. Chaque médaille demande ${nf(o.t,1)} h d'impression. L'atelier dispose de ${o.k} imprimantes, qui fonctionnent chacune ${o.h} h par jour.`;
  return [{ctx,q:"Combien d'heures d'impression la commande représente-t-elle au total ?",type:"num",ans:H,tolR:0.02,unit:"h",expl:`${F("H = N·t")} = ${o.N} × ${nf(o.t,1)} = ${U(H,"h")} d'impression.`},
    {ctx,q:"En combien de jours, au minimum, la commande peut-elle être terminée ?",type:"num",ans:J,tolA:0,unit:"jours",
      expl:`Capacité de l'atelier : ${o.k} × ${o.h} = ${o.k*o.h} h d'impression par jour. ${F(`n = ${FRAC("H","h par jour")}`)} = ${FRAC(nf(H,0),o.k*o.h)} = ${nf(j,2)}, arrondi à l'entier supérieur : ${U(J,"jours")}.`}]; },
/* barème linéaire : note d'une solution, puis score */
()=>{ const a0=rnd([2,3,4]), a1=a0+rnd([4,5,6]), x=r2(a0+(a1-a0)*(0.3+Math.random()*0.55),1), note=10*(x-a0)/(a1-a0);
  const w=rnd([[50,30,20],[40,40,20],[40,35,25],[60,25,15]]), n2=ri(3,9), n3=ri(3,9), sc=(w[0]*note+w[1]*n2+w[2]*n3)/100;
  const data=table(["Critère","Poids","Note de la solution B"],[["Autonomie",`${w[0]} %`,"?"],["Coût",`${w[1]} %`,`${n2} sur 10`],["Masse",`${w[2]} %`,`${n3} sur 10`]]);
  const ctx=`Choix de la batterie d'un robot nettoyeur de panneaux. Barème de l'autonomie : 0 point pour ${a0} h ou moins, 10 points pour ${a1} h ou plus, note proportionnelle entre les deux. La solution B offre ${nf(x,1)} h d'autonomie.`;
  return [{data,ctx,q:"Calcule la note de la solution B pour le critère « autonomie », sur 10.",type:"num",ans:note,tolR:0.02,tolA:0.05,unit:"points",
      expl:`Interpolation linéaire : ${F(`note = 10 × ${FRAC("x − x0","x1 − x0")}`)} = 10 × ${FRAC(`${nf(x,1)} − ${a0}`,`${a1} − ${a0}`)} = ${U(note,"points")}.`},
    {data,ctx,q:"Calcule le score pondéré de la solution B, sur 10.",type:"num",ans:sc,tolR:0.02,unit:"points",
      expl:`${F("score = Σ poids × note")} = ${nf(w[0]/100,2)} × ${S4(note)} + ${nf(w[1]/100,2)} × ${n2} + ${nf(w[2]/100,2)} × ${n3} = ${U(sc,"points")} sur 10.`}]; },
/* cycle de vie commercial : durée de la maturité, puis type d'innovation */
()=>{ const t1=rnd([1,2]), t2=t1+rnd([2,3]), t3=t2+rnd([3,4,5]), D=t3-t2, fig=fx_inn_vie({b:[t1,t2,t3],T:12,tp:(t2+t3)/2});
  const [prod,amel]=rnd([["d'une lampe solaire","dont la batterie dure 20 % plus longtemps"],["d'une glacière électrique","qui consomme 15 % d'énergie en moins"],["d'une trottinette électrique","dont le cadre est allégé de 1 kg"]]);
  const ctx=`Ventes annuelles ${prod} depuis son lancement. Les traits pointillés séparent les quatre phases de son cycle de vie commercial.`;
  return [{fig,ctx,q:"Pendant combien d'années le produit est-il resté en phase de maturité ?",type:"num",ans:D,tolA:0,unit:"ans",
      expl:`La maturité est la phase 3, où les ventes sont maximales et à peu près stables : de l'année ${t2} à l'année ${t3}, soit ${U(D,"ans")}.`},
    {fig,ctx,q:`Pour relancer les ventes, le fabricant sort une nouvelle version ${amel}. De quel type d'innovation s'agit-il ?`,type:"ch",ch:["Innovation incrémentale","Innovation de rupture"],ok:0,
      expl:`Le principe du produit ne change pas : on améliore une performance. C'est une ${F("innovation incrémentale")} ; elle prolonge la maturité et retarde le déclin.`}]; },
/* cahier des charges : repérer la ligne inexploitable */
()=>{ const G=[["Tondre la pelouse","Surface tondue par charge","800 m² au moins","F1"],["Se déplacer en sécurité","Vitesse maximale","0,5 m/s au plus","F0"],["Rester silencieux","Niveau sonore à 1 m","60 dB au plus","F2"],["Se recharger seul","Durée de recharge","2 h au plus","F2"],["Franchir les obstacles","Hauteur de marche franchissable","3 cm au moins","F1"]];
  const B=rnd([["Être esthétique","Aspect","joli","F3","une note d'au moins 7 sur 10 lors d'une enquête auprès des clients"],["Être léger","Masse","la plus faible possible","F1","12 kg au plus"],["Monter les pentes","Pente franchissable","forte","F1","35 % au moins"]]);
  const rows=shuffle(G).slice(0,3), k=rnd([0,1,2,3]); rows.splice(k,0,B.slice(0,4));
  return {data:tabL(["Ligne","Fonction","Critère","Niveau","Flexibilité"],rows.map((r,i)=>[String(i+1),...r])),ctx:"Extrait du cahier des charges d'un robot tondeuse.",
    q:"Quelle ligne ne permet pas de vérifier le produit par un essai ?",type:"ch",ch:["Ligne 1","Ligne 2","Ligne 3","Ligne 4"],ok:k,
    expl:`Ligne ${k+1} : le niveau « ${B[2]} » n'est pas une valeur mesurable avec une unité ; après un essai, on ne pourrait pas conclure. Il faut un ${F("niveau chiffré")}, par exemple « ${B[4]} ».`}; },
/* taux de satisfaction d'une solution */
()=>{ const S=rnd(SCEN), j=rnd([0,1,2]), w=S.crit.map(()=>rnd([1,2,3,4,5])), n=notes(S,j), sc=sum(n.map((x,i)=>x*w[i])), mx=5*sum(w), r=sc/mx*100;
  const data=table(["Critère","Poids",`Note de « ${S.sol[j]} »`],S.crit.map((c,i)=>[c,String(w[i]),String(n[i])]));
  const ctx=`Choix ${S.sys}. Notes de 1 à 5 ; on exprime le résultat en pourcentage du meilleur score possible.`;
  return [{data,ctx,q:"Quel score maximal une solution pourrait-elle obtenir avec ces poids ?",type:"num",ans:mx,tolA:0,unit:"points",
      expl:`Le meilleur score possible correspond à la note 5 partout : ${F("score max = 5 × Σ poids")} = 5 × ${sum(w)} = ${U(mx,"points")}.`},
    {data,ctx,q:`Exprime le score de « ${S.sol[j]} » en pourcentage du score maximal.`,type:"num",ans:r,tolR:0.02,unit:"%",
      expl:`Score : ${n.map((x,i)=>`${w[i]} × ${x}`).join(" + ")} = ${sc} points. ${F(`taux = ${FRAC("score","score max")} × 100`)} = ${FRAC(sc,mx)} × 100 = ${U(r,"%")}.`}]; }
];

const INN3=[
/* matrice pondérée et critère éliminatoire */
()=>{ const S=rnd(SCEN), E=S.el;
  const o=draw(()=>{ const w=S.crit.map(()=>rnd([1,2,3,4,5])), N=S.sol.map((_,j)=>notes(S,j)), sc=scores(w,N), ord=[0,1,2].sort((a,b)=>sc[b]-sc[a]); return {w,N,sc,ok:ord[0]===E.bad&&sc[ord[0]]-sc[ord[1]]>=3&&sc[ord[1]]-sc[ord[2]]>=3}; },o=>o.ok);
  const ord=[0,1,2].sort((a,b)=>o.sc[b]-o.sc[a]), top=ord[0], sec=ord[1];
  const val=[0,1,2].map(i=>{ const bad=i===top, f=bad===(E.dir<0)?rnd([1.12,1.18,1.25,1.3]):rnd([0.7,0.78,0.85]); return r2(E.lim*f,E.d); });
  const data=matData(S,o.w,o.N), ctx=`Choix ${S.sys}, notes de 1 à 5. Exigence éliminatoire (F0) : ${elT(E)}. Valeurs pour chaque solution : ${S.sol.map((s,i)=>`${lc1(s)} ${nf(val[i],E.d)} ${E.u}`).join(" ; ")}.`;
  return [{data,ctx,q:`Calcule le score pondéré de la solution « ${S.sol[top]} ».`,type:"num",ans:o.sc[top],tolA:0,unit:"points",
      expl:`${F("score = Σ poids × note")} = ${o.N[top].map((x,i)=>`${o.w[i]} × ${x}`).join(" + ")} = ${U(o.sc[top],"points")} : c'est le meilleur score (${S.sol.map((s,k)=>`${lc1(s)} ${o.sc[k]}`).join(" ; ")}).`},
    {data,ctx,q:"Quelle solution faut-il retenir ?",type:"ch",ch:S.sol.slice(),ok:sec,
      expl:`« ${S.sol[top]} » a le meilleur score, mais ${nf(val[top],E.d)} ${E.u} ne respecte pas l'exigence F0 (${elT(E)}) : elle est ${F("éliminée")}. Parmi les solutions restantes, le meilleur score est celui de ${HL(lc1(S.sol[sec]))} (${o.sc[sec]} points).`}]; },
/* sensibilité de la matrice au choix des poids */
()=>{ const flip=Math.random()<0.5;
  const o=draw(()=>{ const w=[rnd([3,4,5]),rnd([2,3]),rnd([1,2])], A=[rnd([4,5]),rnd([2,3]),rnd([2,3])], B=[rnd([2,3]),rnd([4,5]),rnd([4,5])], w2=[w[0],w[1],w[2]+rnd([2,3])];
      const sA=sum(A.map((x,i)=>x*w[i])), sB=sum(B.map((x,i)=>x*w[i])), tA=sum(A.map((x,i)=>x*w2[i])), tB=sum(B.map((x,i)=>x*w2[i])); return {w,w2,A,B,sA,sB,tA,tB}; },
    o=>o.sA-o.sB>=2&&(flip?o.tB-o.tA>=2:o.tA-o.tB>=2));
  const C=["Coût d'achat","Rendement","Durée de vie"];
  const data=table(["Critère","Poids initial","Moteur à balais","Moteur sans balais"],C.map((c,i)=>[c,String(o.w[i]),String(o.A[i]),String(o.B[i])]));
  const ctx=`Choix du moteur d'un portail solaire. Avec les poids initiaux, le moteur à balais obtient ${o.sA} points et le moteur sans balais ${o.sB} points. Le client, qui veut un portail durable, porte le poids de la durée de vie de ${o.w[2]} à ${o.w2[2]}.`;
  return [{data,ctx,q:"Calcule le nouveau score du moteur sans balais.",type:"num",ans:o.tB,tolA:0,unit:"points",
      expl:`${F("score = Σ poids × note")} = ${o.B.map((x,i)=>`${o.w2[i]} × ${x}`).join(" + ")} = ${U(o.tB,"points")}.`},
    {data,ctx,q:"Le choix du moteur change-t-il ?",type:"ch",ch:["Oui : on retient désormais le moteur sans balais","Non : le moteur à balais reste le meilleur choix"],ok:flip?0:1,
      expl:`Nouveau score du moteur à balais : ${o.A.map((x,i)=>`${o.w2[i]} × ${x}`).join(" + ")} = ${o.tA} points, contre ${o.tB} pour le moteur sans balais. ${flip?"Le classement s'inverse : le choix dépend des poids, qui traduisent les priorités du client.":"Le classement ne change pas : la décision résiste à ce changement de poids."}`}]; },
/* valider un prototype sur deux exigences */
()=>{ const tgt=rnd([0,1,2,3]); /* 0 : validé ; 1 : masse ; 2 : effort ; 3 : les deux */
  const o=draw(()=>{ const [mat,rho]=rnd(MATX), V=rnd([40,50,60,70,80,90]), m=rho*V, Mx=Math.round(m*((tgt===1||tgt===3)?rnd([0.8,0.85,0.9]):rnd([1.1,1.15,1.25]))), Fn=rnd([20,25,30,40]), tol=10;
      const e=(tgt===2||tgt===3)?rnd([13,15,18,22]):rnd([2,4,6,7]), Fm=r2(Fn*(1+(Math.random()<0.5?1:-1)*e/100),1), er=ecart(Fm,Fn); return {mat,rho,V,m,Mx,Fn,tol,Fm,er}; },
    o=>far(o.m,o.Mx,0.05)&&far(o.er,o.tol,0.15)&&((o.m>o.Mx?1:0)+(o.er>o.tol?2:0))===tgt);
  const C=["Oui : les deux exigences sont satisfaites","Non : la masse est trop grande","Non : l'effort de serrage est hors tolérance","Non : aucune des deux exigences n'est satisfaite"];
  const ctx=`Pince d'un bras robotisé de tri des déchets, prototype imprimé en ${o.mat} (ρ = ${nf(o.rho,2)} g/cm³, volume de matière ${o.V} cm³). Exigences : masse de ${o.Mx} g au plus (F0) ; effort de serrage de ${o.Fn} N à ± ${o.tol} % (F1). Essai : effort mesuré ${nf(o.Fm,1)} N.`;
  return [{ctx,q:"Calcule la masse de la pince.",type:"num",ans:o.m,tolR:0.02,unit:"g",expl:`${F("m = ρ·V")} = ${nf(o.rho,2)} × ${o.V} = ${U(o.m,"g")}.`},
    {ctx,q:"Calcule l'écart relatif entre l'effort mesuré et le niveau exigé (référence : niveau exigé).",type:"num",ans:o.er,tolR:0.02,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|mesure − niveau|","niveau")} × 100`)} = ${FRAC(`|${nf(o.Fm,1)} − ${o.Fn}|`,o.Fn)} × 100 = ${U(o.er,"%")}.`},
    {ctx,q:"Le prototype est-il validé ?",type:"ch",ch:C,ok:tgt,
      expl:`Masse : ${S4(o.m)} g ${o.m<=o.Mx?"≤":">"} ${o.Mx} g ; effort : écart de ${nf(o.er,1)} % ${o.er<=o.tol?"≤":">"} ${o.tol} %. ${C[tgt]}.${tgt?" On reboucle sur la conception : modifier la forme, le matériau ou le taux de remplissage, puis refaire les essais.":""}`}]; },
/* impression 3D ou moulage par injection : seuil de rentabilité */
()=>{ const o=draw(()=>{ const c3=rnd([6,8,10,12]), C0=rnd([3000,5000,8000,12000]), ci=rnd([0.8,1.2,1.5,2]), N=rnd([100,200,300,500,1000,2000,5000]); return {c3,C0,ci,N,Ns:C0/(c3-ci)}; },o=>far(o.N,o.Ns,0.2));
  const inj=o.N>o.Ns, ctx=`Boîtier de capteur : en impression 3D, chaque pièce coûte ${o.c3} €. En moulage par injection, il faut d'abord un moule de ${nf(o.C0,0)} €, puis chaque pièce coûte ${nf(o.ci,2)} €.`;
  return [{ctx,q:"Pour combien de pièces les deux procédés coûtent-ils le même prix ?",type:"num",ans:o.Ns,tolR:0.02,unit:"pièces",
      expl:`Coûts : impression ${F("C = c3·N")} ; injection ${F("C = C_moule + ci·N")}. Égalité : ${o.c3}·N = ${nf(o.C0,0)} + ${nf(o.ci,2)}·N, d'où ${F(`N = ${FRAC("C_moule","c3 − ci")}`)} = ${FRAC(nf(o.C0,0),`${o.c3} − ${nf(o.ci,2)}`)} = ${U(o.Ns,"pièces")}.`},
    {ctx,q:`On doit produire ${nf(o.N,0)} boîtiers. Quel procédé choisir pour le coût le plus bas ?`,type:"ch",ch:["L'impression 3D","Le moulage par injection"],ok:inj?1:0,
      expl:`Impression : ${o.c3} × ${nf(o.N,0)} = ${nf(o.c3*o.N,0)} € ; injection : ${nf(o.C0,0)} + ${nf(o.ci,2)} × ${nf(o.N,0)} = ${nf(o.C0+o.ci*o.N,0)} €. ${inj?"Au-delà du seuil, le moule est amorti : l'injection est moins chère.":"En dessous du seuil, le moule n'est pas amorti : l'impression 3D est moins chère, c'est pourquoi on l'utilise pour les prototypes et les petites séries."}`}]; },
/* brevet : nouveauté, durée, licence */
()=>{ const v=rnd([0,1,2]);
  if(v===0){ const mo=rnd([2,3,6]);
    return {ctx:`Une élève a imaginé un flotteur anti-chavirage pour pirogue. Elle l'a présenté en détail, avec des photos, lors d'un salon ouvert au public, ${mo} mois avant de déposer une demande de brevet.`,q:"Le brevet peut-il lui être accordé ?",type:"ch",
      ...mc("Non : l'invention n'est plus nouvelle, car elle a été rendue publique avant le dépôt",["Oui : c'est bien elle l'inventrice, la date de présentation ne compte pas","Oui, à condition de payer une taxe supplémentaire","Non : un élève ne peut pas déposer de brevet"]),
      expl:`La ${F("nouveauté")} s'apprécie à la date du dépôt : tout ce qui a été rendu public avant, y compris par l'inventrice elle-même, empêche le brevet. Il faut déposer la demande avant toute présentation publique.`}; }
  if(v===1){ const y=rnd([22,23,25,30]);
    return {ctx:`Le mécanisme d'un treuil de voilier a été breveté il y a ${y} ans. Une entreprise de Raiatea veut fabriquer et vendre ce mécanisme.`,q:"Que peut-elle faire ?",type:"ch",
      ...mc("Le fabriquer librement : la protection du brevet (20 ans au plus) est terminée",["Demander obligatoirement une licence au titulaire du brevet","Rien : un brevet protège l'invention pour toujours","Déposer à son tour un brevet sur ce même mécanisme"]),
      expl:`Un brevet dure ${F("20 ans au plus")} après le dépôt. Après ${y} ans, l'invention est dans le domaine public : tout le monde peut l'exploiter, mais personne ne peut plus la breveter, car elle n'est plus nouvelle.`}; }
  const y=rnd([4,6,8,10]);
  return {ctx:`Le mécanisme d'un treuil de voilier a été breveté il y a ${y} ans et le brevet est toujours en vigueur. Une entreprise veut vendre des treuils qui utilisent ce mécanisme.`,q:"Que doit-elle faire ?",type:"ch",
    ...mc("Obtenir une licence, c'est-à-dire l'autorisation (souvent payante) du titulaire du brevet",["Rien : il suffit de changer la couleur du treuil","Déposer elle-même un brevet sur ce mécanisme","Rien : un brevet publié peut être utilisé par tous"]),
    expl:`Pendant ${F("20 ans au plus")}, le titulaire peut interdire l'exploitation de son invention. La publication du brevet rend l'invention connue, pas libre : il faut une licence. Sinon, c'est de la contrefaçon.`}; },
/* repérer l'erreur d'un élève */
()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
  if(v===0){ const w=[rnd([3,4,5]),rnd([2,3]),rnd([1,2])], n=[ri(2,5),ri(2,5),ri(1,5)], s0=sum(n), s1=sum(n.map((x,i)=>x*w[i]));
    ctx=`Score pondéré d'une solution : poids des critères ${w.join(" ; ")} ; notes de la solution ${n.join(" ; ")}.`;
    st=[`Notes de la solution : ${n.join(" ; ")}`,`Score = ${n.join(" + ")} = ${s0} points`,`La solution obtient ${s0} points.`]; bad=1;
    why=`Chaque note doit être multipliée par le poids de son critère : score = ${n.map((x,i)=>`${w[i]} × ${x}`).join(" + ")} = ${s1} points.`; }
  else if(v===1){ const lim=rnd([2,2.5,3]), mA=r2(lim*rnd([1.12,1.2]),1), mB=r2(lim*rnd([0.8,0.9]),1), sA=ri(38,45), sB=sA-ri(3,6);
    ctx=`Choix entre la solution A (score ${sA}, masse ${nf(mA,1)} kg) et la solution B (score ${sB}, masse ${nf(mB,1)} kg). Exigence : masse de ${nf(lim,1)} kg au plus, flexibilité F0.`;
    st=[`A obtient le meilleur score : ${sA} > ${sB}.`,"La masse n'est qu'un critère parmi d'autres, déjà pris en compte dans le score.","On retient la solution A."]; bad=1;
    why=`Une exigence F0 est éliminatoire : A dépasse ${nf(lim,1)} kg, elle est écartée quel que soit son score. Il faut retenir B.`; }
  else if(v===2){ const V=rnd([12,18,24,36]), rho=rnd([1.24,1.27]);
    ctx=`Masse d'une pièce imprimée (ρ = ${nf(rho,2)} g/cm³) dont le volume de matière vaut ${nf(V*1000,0)} mm³.`;
    st=[`V = ${nf(V*1000,0)} mm³`,`m = ρ·V = ${nf(rho,2)} × ${nf(V*1000,0)} = ${nf(rho*V*1000,0)} g`,`La pièce pèse ${nf(rho*V,1)} kg.`]; bad=1;
    why=`ρ est en g/cm³ : il faut V en cm³. ${nf(V*1000,0)} mm³ = ${V} cm³, d'où m = ${nf(rho,2)} × ${V} = ${nf(rho*V,1)} g, et non ${nf(rho*V,1)} kg.`; }
  else if(v===3){ const V=rnd([45,60,90,120]), d=rnd([12,15,20]);
    ctx=`Durée d'impression d'une pièce de ${V} cm³ avec une imprimante de débit ${d} cm³/h.`;
    st=["t = V × débit",`t = ${V} × ${d} = ${nf(V*d,0)} h`,`L'impression dure ${nf(V*d,0)} h.`]; bad=0;
    why=`Le débit est un volume par heure : ${F(`t = ${FRAC("V","débit")}`)} = ${FRAC(V,d)} = ${nf(V/d,2)} h. Un contrôle d'unité le montre : cm³ × cm³/h ne donne pas des heures.`; }
  else if(v===4){ const o=draw(()=>({H:rnd([90,110,130,150,170]),D:rnd([2,3]),h:rnd([16,20])}),o=>net(o.H/(o.D*o.h))&&o.H/(o.D*o.h)>1.2), r=o.H/(o.D*o.h);
    ctx=`Nombre d'imprimantes nécessaires pour réaliser ${o.H} h d'impression en ${o.D} jours, chaque imprimante fonctionnant ${o.h} h par jour.`;
    st=[`Heures disponibles par imprimante : ${o.D} × ${o.h} = ${o.D*o.h} h`,`n = ${FRAC(o.H,o.D*o.h)} = ${nf(r,2)}`,`Il faut ${Math.floor(r)} imprimante${Math.floor(r)>1?"s":""}.`]; bad=2;
    why=`Avec ${Math.floor(r)} imprimante${Math.floor(r)>1?"s":""}, le délai n'est pas tenu : on arrondit à l'entier supérieur, ${Math.ceil(r)} imprimantes.`; }
  else { const n=rnd([40,50,60]), mes=n+rnd([-1,1])*rnd([4,5,6,7]);
    ctx=`Écart relatif entre l'effort mesuré sur un prototype (${mes} N) et le niveau du cahier des charges (${n} N), en prenant le niveau comme référence.`;
    st=[`Écart : |${mes} − ${n}| = ${Math.abs(mes-n)} N`,`Écart relatif : ${FRAC(Math.abs(mes-n),mes)} × 100 = ${nf(Math.abs(mes-n)/mes*100,1)} %`,`L'écart relatif vaut ${nf(Math.abs(mes-n)/mes*100,1)} %.`]; bad=1;
    why=`La référence est le niveau du cahier des charges : ${FRAC(Math.abs(mes-n),n)} × 100 = ${nf(Math.abs(mes-n)/n*100,1)} %. Il faut toujours diviser par la référence annoncée.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* compromis masse et coût : cadre de vélo en aluminium ou en carbone */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const ma=rnd([1.4,1.5,1.6,1.7,1.8]), mk=rnd([0.85,0.9,0.95,1,1.1]), pa=rnd([300,400,500,600]), pk=rnd([1200,1500,1800,2200,2500]), X=rnd([800,1000,1500,2000,2500,3000,4000]); return {ma,mk,pa,pk,X,k:(pk-pa)/(ma-mk)}; },
    o=>far(o.k,o.X,0.08)&&(o.k<=o.X)===tgt);
  const dm=o.ma-o.mk, ok=o.k<=o.X;
  const ctx=`Un club de vélo de Papeete hésite entre un cadre en aluminium (${nf(o.ma,2)} kg, ${o.pa} €) et un cadre en carbone (${nf(o.mk,2)} kg, ${nf(o.pk,0)} €). Pour ses coureurs, le club accepte de payer au plus ${nf(o.X,0)} € par kilogramme gagné.`;
  return [{ctx,q:"Quelle masse le cadre en carbone fait-il gagner ?",type:"num",ans:dm,tolR:0.02,unit:"kg",expl:`${F("Δm = m_alu − m_carbone")} = ${nf(o.ma,2)} − ${nf(o.mk,2)} = ${U(dm,"kg")}.`},
    {ctx,q:"Calcule le surcoût du carbone par kilogramme gagné.",type:"num",ans:o.k,tolR:0.02,unit:"€/kg",
      expl:`${F(`${FRAC("Δ prix","Δm")}`)} = ${FRAC(`${nf(o.pk,0)} − ${o.pa}`,S4(dm))} = ${U(o.k,"€/kg")}.`},
    {ctx,q:"Quel cadre le club doit-il choisir ?",type:"ch",ch:["Le cadre en carbone","Le cadre en aluminium"],ok:ok?0:1,
      expl:`${nf(o.k,0)} €/kg ${ok?"≤":">"} ${nf(o.X,0)} €/kg : ${ok?"le gain de masse vaut son prix pour le club, il choisit le carbone.":"le gain de masse coûte trop cher au regard de ce que le club accepte de payer : il garde l'aluminium."} C'est un compromis entre masse, coût et performance.`}]; },
/* nombre d'imprimantes nécessaires pour tenir un délai */
()=>{ const o=draw(()=>({N:rnd([8,10,12,16,20,24]),V:rnd([60,80,100,120,150]),d:rnd([12,15,20]),D:rnd([2,3,4,5]),h:rnd([16,20])}),o=>{ const r=o.N*o.V/o.d/(o.D*o.h); return net(r)&&r>=1.5&&r<=8&&Math.ceil(o.N/Math.floor(o.D*o.h*o.d/o.V+1e-9))===Math.ceil(r); });
  const H=o.N*o.V/o.d, r=H/(o.D*o.h), k=Math.ceil(r);
  const ctx=`Pour une campagne d'essais, il faut imprimer ${o.N} prototypes de ${o.V} cm³ chacun, avec des imprimantes de débit ${o.d} cm³/h qui peuvent fonctionner ${o.h} h par jour. Délai imposé : ${o.D} jours.`;
  return [{ctx,q:"Combien d'heures d'impression faut-il au total ?",type:"num",ans:H,tolR:0.02,unit:"h",
      expl:`Une pièce : ${FRAC(o.V,o.d)} = ${S4(o.V/o.d)} h. Pour ${o.N} pièces : ${F(`H = ${FRAC("N·V","débit")}`)} = ${U(H,"h")}.`},
    {ctx,q:"Combien d'imprimantes faut-il au minimum pour tenir le délai ?",type:"num",ans:k,tolA:0,unit:"imprimantes",
      expl:`Une imprimante fournit ${o.D} × ${o.h} = ${o.D*o.h} h dans le délai. ${F(`n = ${FRAC("H","heures par imprimante")}`)} = ${FRAC(S4(H),o.D*o.h)} = ${nf(r,2)}, arrondi à l'entier supérieur : ${U(k,"imprimantes")}.`}]; },
/* barème et matrice complète : trois batteries */
()=>{ const o=draw(()=>{ const a0=rnd([2,3]), a1=a0+rnd([5,6]), m0=rnd([1,1.5]), m1=m0+rnd([2,3]), w=rnd([[40,40,20],[50,30,20],[40,30,30]]);
      const S=[0,1,2].map(()=>({x:r2(a0+(a1-a0)*(0.15+Math.random()*0.8),1),m:r2(m0+(m1-m0)*(0.1+Math.random()*0.8),1),c:ri(2,9)}));
      S.forEach(s=>{ s.na=10*(s.x-a0)/(a1-a0); s.nm=10*(m1-s.m)/(m1-m0); s.sc=(w[0]*s.na+w[1]*s.nm+w[2]*s.c)/100; });
      const srt=S.map(s=>s.sc).sort((a,b)=>b-a); return {a0,a1,m0,m1,w,S,ok:srt[0]-srt[1]>=0.4&&new Set(S.map(s=>s.x)).size===3&&new Set(S.map(s=>s.m)).size===3}; },o=>o.ok);
  const nm=["A","B","C"], best=o.S.map(s=>s.sc).indexOf(Math.max(...o.S.map(s=>s.sc))), B=o.S[1];
  const data=table(["Batterie","Autonomie (h)","Masse (kg)","Note de coût (sur 10)"],o.S.map((s,i)=>[nm[i],nf(s.x,1),nf(s.m,1),String(s.c)]));
  const ctx=`Choix de la batterie d'un robot de surveillance. Barèmes linéaires : autonomie, 0 point à ${o.a0} h et 10 points à ${o.a1} h ; masse, 10 points à ${nf(o.m0,1)} kg et 0 point à ${nf(o.m1,1)} kg. Poids : autonomie ${o.w[0]} %, masse ${o.w[1]} %, coût ${o.w[2]} %.`;
  return [{data,ctx,q:"Calcule la note de la batterie B pour le critère « masse », sur 10.",type:"num",ans:B.nm,tolR:0.02,tolA:0.05,unit:"points",
      expl:`Plus la batterie est légère, meilleure est la note : ${F(`note = 10 × ${FRAC("m1 − m","m1 − m0")}`)} = 10 × ${FRAC(`${nf(o.m1,1)} − ${nf(B.m,1)}`,`${nf(o.m1,1)} − ${nf(o.m0,1)}`)} = ${U(B.nm,"points")}.`},
    {data,ctx,q:"Calcule le score pondéré de la batterie B, sur 10.",type:"num",ans:B.sc,tolR:0.02,unit:"points",
      expl:`Note d'autonomie : 10 × ${FRAC(`${nf(B.x,1)} − ${o.a0}`,`${o.a1} − ${o.a0}`)} = ${S4(B.na)}. ${F("score = Σ poids × note")} = ${nf(o.w[0]/100,2)} × ${S4(B.na)} + ${nf(o.w[1]/100,2)} × ${S4(B.nm)} + ${nf(o.w[2]/100,2)} × ${B.c} = ${U(B.sc,"points")}.`},
    {data,ctx,q:"Quelle batterie faut-il retenir ?",type:"ch",ch:nm.map(x=>`Batterie ${x}`),ok:best,
      expl:`Scores : ${o.S.map((s,i)=>`${nm[i]} ${nf(s.sc,2)}`).join(" ; ")}. On retient la ${F(`batterie ${nm[best]}`)}, de meilleur score (aucun critère éliminatoire ici).`}]; },
/* maquette ou pièce réelle : respecter le délai */
()=>{ const tgt=rnd([0,1,2]);
  const o=draw(()=>{ const V=rnd([300,450,600,900,1200,1800,2400]), d=rnd([10,12,15,20,25,30]), Ha=rnd([6,8,10,12,14,16,20,24]); const t=[V/d,V/8/d,V/27/d], k=t.findIndex(x=>x<=Ha); return {V,d,Ha,t,k}; },
    o=>o.k===tgt&&o.t[o.k]<=0.93*o.Ha&&(o.k===0||o.t[o.k-1]>=1.08*o.Ha));
  const C=["La pièce réelle","Une maquette aux dimensions divisées par 2","Une maquette aux dimensions divisées par 3"];
  const ctx=`Une pièce de ${nf(o.V,0)} cm³ doit être présentée à un client : d'ici le rendez-vous, l'imprimante (débit ${o.d} cm³/h) est disponible pendant ${o.Ha} h. On veut montrer l'objet le plus grand possible dans ce délai.`;
  return [{ctx,q:"Combien de temps durerait l'impression de la pièce réelle, en heures ?",type:"num",ans:o.t[0],tolR:0.02,unit:"h",expl:`${F(`t = ${FRAC("V","débit")}`)} = ${FRAC(nf(o.V,0),o.d)} = ${U(o.t[0],"h")}.`},
    {ctx,q:"Que faut-il imprimer ?",type:"ch",ch:C,ok:o.k,
      expl:`Diviser les dimensions par k divise le volume, donc la durée, par k³. Durées : pièce réelle ${S4(o.t[0])} h ; dimensions divisées par 2 : ${FRAC(S4(o.t[0]),8)} = ${S4(o.t[1])} h ; par 3 : ${FRAC(S4(o.t[0]),27)} = ${S4(o.t[2])} h. Disponible : ${o.Ha} h. Le plus grand objet imprimable à temps est : ${HL(lc1(C[o.k]))}.`}]; },
/* coût global sur la durée de vie : achat et énergie */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const pA=rnd([150,200,250]), pB=pA+rnd([150,200,300,400]), PA=rnd([0.9,1.1,1.3]), PB=r2(PA*rnd([0.6,0.7,0.75]),2), H=rnd([600,900,1200,1800,2400]), e=rnd([0.2,0.25,0.3]), N=rnd([3,5,8,10]);
      const CA=pA+PA*H*e*N, CB=pB+PB*H*e*N; return {pA,pB,PA,PB,H,e,N,CA,CB}; },o=>far(o.CA,o.CB,0.06)&&(o.CB<o.CA)===tgt);
  const okB=o.CB<o.CA, ctx=`Pompe de piscine d'une pension de famille, ${nf(o.H,0)} h de fonctionnement par an. Pompe A : ${o.pA} €, puissance absorbée ${nf(o.PA,2)} kW. Pompe B, à meilleur rendement : ${o.pB} €, ${nf(o.PB,2)} kW. Électricité : ${nf(o.e,2)} € par kWh. Durée d'utilisation prévue : ${o.N} ans.`;
  return [{ctx,q:"Calcule le coût annuel de l'électricité consommée par la pompe A, en €.",type:"num",ans:o.PA*o.H*o.e,tolR:0.02,unit:"€",
      expl:`${F("E = P·t")} = ${nf(o.PA,2)} × ${nf(o.H,0)} = ${nf(o.PA*o.H,0)} kWh par an ; coût : ${nf(o.PA*o.H,0)} × ${nf(o.e,2)} = ${U(o.PA*o.H*o.e,"€")}.`},
    {ctx,q:`Calcule le coût global de la pompe B sur ${o.N} ans (achat et électricité), en €.`,type:"num",ans:o.CB,tolR:0.02,unit:"€",
      expl:`${F("C = prix d'achat + P·t·prix du kWh")} = ${o.pB} + ${nf(o.PB,2)} × ${nf(o.H,0)} × ${nf(o.e,2)} × ${o.N} = ${U(o.CB,"€")}.`},
    {ctx,q:`Sur ${o.N} ans, quelle pompe coûte le moins cher ?`,type:"ch",ch:["La pompe A","La pompe B"],ok:okB?1:0,
      expl:`Pompe A : ${o.pA} + ${nf(o.PA,2)} × ${nf(o.H,0)} × ${nf(o.e,2)} × ${o.N} = ${nf(o.CA,0)} € ; pompe B : ${nf(o.CB,0)} €. ${okB?"La pompe B, plus chère à l'achat, est rentabilisée par ses économies d'énergie.":"L'économie d'énergie de la pompe B ne compense pas son prix d'achat sur cette durée."} On raisonne sur tout le cycle de vie, pas seulement sur le prix d'achat.`}]; },
/* choisir un procédé de prototypage sous contraintes de budget et de délai */
()=>{ const o=draw(()=>{ const V=rnd([40,60,80,100]), [mat,rho,pk]=rnd(MATX), d=rnd([12,15,20]), rate=rnd([2,3]), cF=rho*V/1000*pk+V/d*rate;
      const B=rnd([40,50,60,80]), D=rnd([5,7,10]), opts=[{n:"Impression FDM",c:cF,dl:rnd([1,2]),p:rnd([0.2,0.3])},{n:"Impression résine",c:rnd([35,45,55,70,90]),dl:rnd([3,4,6,8,9]),p:rnd([0.05,0.1])},{n:"Usinage",c:rnd([60,90,120,150]),dl:rnd([6,8,10,12,14]),p:rnd([0.02,0.05])}];
      const okc=opts.map(x=>x.c<=B&&x.dl<=D*1.1), ix=opts.map((x,i)=>i).filter(i=>okc[i]), best=ix.length?ix.reduce((a,i)=>opts[i].p<opts[a].p?i:a,ix[0]):-1;
      const clear=opts.every(x=>far(x.c,B,0.05)&&far(x.dl,D*1.1,0.05)); return {V,mat,rho,pk,d,rate,cF,B,D,opts,okc,best,clear}; },o=>o.best>=0&&o.clear&&o.okc.filter(Boolean).length>=1&&o.okc.filter(Boolean).length<3);
  const data=table(["Procédé","Coût (€)","Délai (jours)","Précision (mm)"],o.opts.map((x,i)=>[x.n,i?nf(x.c,0):"?",String(x.dl),nf(x.p,2)]));
  const ctx=`Prototype d'un boîtier de ${o.V} cm³. Exigences : budget de ${o.B} € au plus (F0) ; délai de ${o.D} jours, flexibilité F1 de ± 10 %. Parmi les procédés qui respectent ces exigences, on retient le plus précis. Impression FDM en ${o.mat} : ρ = ${nf(o.rho,2)} g/cm³, filament à ${o.pk} € le kg, débit ${o.d} cm³/h, ${o.rate} € par heure d'impression.`;
  return [{data,ctx,q:"Calcule le coût de l'impression FDM, en €.",type:"num",ans:o.cF,tolR:0.02,unit:"€",
      expl:`Matière : ${nf(o.rho,2)} × ${o.V} = ${S4(o.rho*o.V)} g, soit ${nf(o.rho*o.V/1000*o.pk,2)} € ; machine : ${FRAC(o.V,o.d)} = ${S4(o.V/o.d)} h, soit ${nf(o.V/o.d*o.rate,2)} €. Total : ${U(o.cF,"€")}.`},
    {data,ctx,q:"Quel procédé faut-il retenir ?",type:"ch",ch:o.opts.map(x=>x.n),ok:o.best,
      expl:`Délai accepté : ${o.D} × 1,1 = ${nf(o.D*1.1,1)} jours au plus. ${o.opts.map((x,i)=>`${x.n} : ${nf(x.c,0)} € ${x.c<=o.B?"≤":">"} ${o.B} €, ${x.dl} j ${x.dl<=o.D*1.1?"≤":">"} ${nf(o.D*1.1,1)} j, ${o.okc[i]?"retenu":"écarté"}`).join(" ; ")}. Parmi les procédés possibles, le plus précis est ${F(lc1(o.opts[o.best].n))}.`}]; }
];

POOLS["innov-conception"]={
  titre:"Concevoir, innover, choisir",
  fiche:{t:"Innovation et conception",l:[
    `Démarche : besoin → cahier des charges → recherche de solutions → ${F("prototype")} → essais de validation ; si une exigence n'est pas satisfaite, ${F("on reboucle")} sur les solutions.`,
    `Cahier des charges : pour chaque fonction, ${F("critère, niveau, flexibilité")} ; ${F("F0 : niveau impératif")}, F3 : très négociable.`,
    `Matrice de décision : ${F("score = Σ poids × note")} ; une solution qui ne respecte pas un ${F("critère éliminatoire")} est écartée, quel que soit son score.`,
    `Innovation ${F("incrémentale")} (on améliore l'existant) ou ${F("de rupture")} (nouveau principe) ; prototype imprimé : ${F("m = ρ·V")}, durée ${FRAC("V","débit")}.`,
    "Pièges : additionner les notes sans les poids, oublier le critère éliminatoire, diviser l'écart par la mesure au lieu de la référence, V en mm³ avec ρ en g/cm³, présenter son invention en public avant de déposer le brevet."]},
  count:{1:4,2:4,3:3},1:INN1,2:INN2,3:INN3
};

/* ======================================================================
   IMPACT ENVIRONNEMENTAL (dd-environnement)
   Tous les facteurs d'émission (FE) sont donnés dans l'énoncé.
   ====================================================================== */
const CE="kg CO₂ éq";
/* « an » au singulier en dessous de 2 */
const AN=x=>x<2?"an":"ans";
/* graduation d'un axe : pas « rond » donnant au plus n intervalles jusqu'à m × 1,08 */
const STP=[0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100,200,250,500,1000,2000,2500,5000,10000];
const axis=(m,n)=>{ const t=m*1.08, st=STP.find(s=>t/s<=(n||6)+1e-9)||t/(n||6); return {y1:Math.ceil(t/st-1e-9)*st, ys:st}; };
/* leviers d'éco-conception selon la phase dominante */
const ACT=["moins de matière, matériaux recyclés ou moins émetteurs","allonger la durée de vie pour amortir la fabrication, procédés plus sobres","produire plus près, préférer le bateau à l'avion",
  "réduire la consommation (meilleur rendement, sobriété d'usage) ou choisir une énergie moins carbonée","faciliter le démontage et le recyclage, récupérer les fluides"];
/* profils d'ACV (valeurs par phase : extraction, fabrication, transport, utilisation, fin de vie) */
const ACVP=[
  {p:"d'un smartphone",u:CE,d:1,v:[[12,18],[28,40],[1.5,3],[3,7],[0.5,1.5]]},
  {p:"d'un ordinateur portable utilisé 5 ans",u:CE,d:0,v:[[60,90],[120,170],[8,15],[40,70],[3,8]]},
  {p:"d'un réfrigérateur utilisé 12 ans à Tahiti",u:CE,d:0,v:[[120,160],[140,190],[30,50],[1500,2100],[25,45]]},
  {p:"d'un panneau photovoltaïque de 400 Wc",u:CE,d:0,v:[[110,150],[230,320],[15,30],[0,0],[8,15]]},
  {p:"d'un vélo en aluminium",u:CE,d:0,v:[[60,85],[25,40],[6,12],[0,0],[2,5]]},
  {p:"d'un scooter thermique (30 000 km)",u:CE,d:0,v:[[350,450],[250,350],[30,50],[2200,2700],[20,40]]},
  {p:"d'une pirogue (va'a) en composite fibre de verre",u:CE,d:0,v:[[55,75],[25,40],[4,8],[0,0],[5,10]]},
  {p:"d'un climatiseur utilisé 10 ans à Tahiti",u:CE,d:0,v:[[150,220],[180,260],[30,50],[4500,6500],[150,300]]}];
const acvDraw=P=>draw(()=>P.v.map(r=>r2(r[0]+(r[1]-r[0])*Math.random(),P.d)),v=>{ const s=v.slice().sort((a,b)=>b-a); return s[0]>=1.2*s[1]; });
const acvFig=(P,v)=>{ const a=axis(Math.max(...v)); return fx_sce_barres({c:PHB,s:[{v}],y1:a.y1,ys:a.ys,yg:a.ys/2,yl:`émissions (${P.u})`,val:x=>nf(x,P.d),alt:`Émissions de gaz à effet de serre ${P.p}, phase par phase`}); };
/* opérations à classer dans une phase */
const OPS=[
  ["L'extraction de la bauxite, le minerai dont on tire l'aluminium du cadre d'un vélo",0],["L'extraction du lithium destiné à la batterie d'un scooter électrique",0],["L'extraction du quartz qui servira à produire le silicium des cellules photovoltaïques",0],
  ["L'assemblage en usine des cellules, du verre et du cadre d'un panneau photovoltaïque",1],["Le moulage de la coque en fibre de verre d'une pirogue",1],["L'impression 3D des pièces d'un drone de surveillance du lagon",1],
  ["L'acheminement de panneaux photovoltaïques par porte-conteneurs jusqu'au port de Papeete",2],["La livraison de scooters par goélette de Papeete jusqu'à Rangiroa",2],
  ["La recharge quotidienne de la batterie d'une trottinette électrique",3],["Le carburant brûlé par le moteur hors-bord d'un bateau de pêche pendant 10 ans",3],["L'électricité consommée par un climatiseur pendant toute sa durée de service",3],
  ["Le démontage et le tri des matériaux d'un réfrigérateur hors d'usage",4],["La récupération du fluide frigorigène d'un vieux climatiseur avant sa destruction",4]];
/* matériaux : pièce, masses (kg), facteurs d'émission (kg CO₂ éq/kg) */
const MATQ=[
  {p:"Le cadre en aluminium d'un vélo",m:[1.6,1.8,2,2.2],f:[8.2,8.6,9],de:"de l'aluminium primaire"},
  {p:"La coque en composite fibre de verre d'une pirogue (va'a) de course",m:[12,14,16,18],f:[5,5.5,6],de:"du composite fibre de verre"},
  {p:"Le châssis en acier d'une remorque de bateau",m:[45,55,65,80],f:[1.9,2.1,2.3],de:"de l'acier"},
  {p:"Le boîtier en plastique ABS d'une station météo",m:[0.45,0.6,0.8,1.2],f:[3.2,3.5,3.8],de:"du plastique ABS"},
  {p:"La cuve en polyéthylène d'une citerne d'eau de pluie",m:[35,40,50],f:[1.9,2,2.2],de:"du polyéthylène"},
  {p:"Le bobinage en cuivre du moteur d'un scooter électrique",m:[1.5,2,2.5,3],f:[3.5,4,4.5],de:"du cuivre"},
  {p:"La coque en composite carbone d'un drone marin",m:[2.5,3,3.5,4],f:[22,25,28],de:"du composite carbone"}];
/* transports : chargement, masses (t), trajet, distances (km), mode, FE (kg CO₂ éq/(t·km)) */
const TRQ=[
  {t:"Un conteneur de panneaux photovoltaïques",m:[8,10,12,15],tr:"d'un port d'Asie jusqu'à Papeete",d:[10500,11000],mode:"porte-conteneurs",fe:[0.01,0.012,0.015]},
  {t:"Un lot de pièces de rechange pour une centrale électrique",m:[1.2,1.5,2,2.5],tr:"de la métropole jusqu'à Tahiti",d:[16000,17000],mode:"avion cargo",fe:[0.6,0.8,1]},
  {t:"Un chargement de ciment",m:[20,25,30,40],tr:"de Papeete jusqu'à un atoll des Tuamotu",d:[350,450,550],mode:"goélette (cargo interinsulaire)",fe:[0.03,0.04,0.05]},
  {t:"Un conteneur de scooters",m:[6,8,10],tr:"de la métropole jusqu'à Papeete, par le canal de Panama",d:[17000,18000],mode:"porte-conteneurs",fe:[0.01,0.012,0.015]}];
/* appareils électriques : consommation annuelle (kWh) */
const USQ=[{p:"Un climatiseur de salle de classe",W:[900,1100,1300,1500]},{p:"Le réfrigérateur d'une pension de famille",W:[250,300,350,400]},{p:"La pompe de filtration de la piscine d'un hôtel",W:[1800,2200,2600]},
  {p:"Un chauffe-eau électrique de 200 L",W:[1800,2000,2400]},{p:"L'éclairage d'un terrain de sport",W:[1200,1600,2000]}];
/* sobriété (0), efficacité (1), énergie renouvelable (2) */
const SEA=[["Régler la climatisation des salles de classe sur 26 °C au lieu de 22 °C",0],["Éteindre les ordinateurs de la salle informatique le soir au lieu de les laisser en veille",0],["Éteindre l'éclairage des salles de classe vides",0],["Réduire la vitesse d'un bateau de 25 à 18 nœuds pour brûler moins de carburant",0],
  ["Remplacer les tubes fluorescents du lycée par des lampes à LED",1],["Remplacer un vieux climatiseur par un modèle qui consomme 40 % de moins pour le même confort",1],["Isoler le toit en tôle d'un faré pour limiter la chaleur qui entre",1],["Remplacer le moteur d'une pompe par un moteur de meilleur rendement",1],
  ["Chauffer l'eau d'une pension de famille avec des capteurs solaires thermiques",2],["Alimenter un atoll avec une ferme solaire plutôt qu'avec un groupe électrogène diesel",2],["Pomper l'eau d'une citerne avec une pompe alimentée par un panneau photovoltaïque",2]];
const SEAC=["La sobriété : réduire le besoin ou l'usage","L'efficacité : rendre le même service avec moins d'énergie","Le recours à une énergie renouvelable"];
/* compositions simplifiées : élément, unité, quantités, FE (kg CO₂ éq par unité) */
const BOM=[
  {p:"une trottinette électrique",it:[["Aluminium primaire (cadre, guidon)","kg",[5,6,7],[8.2,8.6,9]],["Acier (axes, visserie)","kg",[1.5,2,2.5],[1.9,2.1,2.3]],["Plastiques","kg",[1.2,1.5,2],[3,3.5]],["Batterie lithium-ion","kWh",[0.35,0.45,0.55],[80,90,100,110]]]},
  {p:"un vélo à assistance électrique",it:[["Aluminium primaire (cadre)","kg",[2,2.5,3],[8.2,8.6,9]],["Acier (transmission, rayons)","kg",[5,6,7],[1.9,2.1,2.3]],["Caoutchouc (pneus)","kg",[1.5,2,2.5],[2.8,3,3.2]],["Batterie lithium-ion","kWh",[0.4,0.5,0.6],[80,90,100,110]]]},
  {p:"un réfrigérateur",it:[["Acier (carrosserie)","kg",[25,30,35],[1.9,2.1,2.3]],["Plastiques (cuve, bacs)","kg",[10,12,15],[3,3.5]],["Mousse isolante polyuréthane","kg",[5,6,7],[4,4.5,5]],["Cuivre (compresseur, tubes)","kg",[2,2.5,3],[3.5,4,4.5]],["Verre (clayettes)","kg",[3,4,5],[0.9,1,1.2]]]},
  {p:"une pirogue (va'a) de course",it:[["Composite fibre de verre (coque)","kg",[12,14,16],[5,5.5,6]],["Mousse PVC (renforts)","kg",[1.5,2,2.5],[4,4.5]],["Bois (balancier et bras)","kg",[4,5,6],[0.2,0.3,0.4]],["Acier inoxydable (fixations)","kg",[0.5,0.8,1],[4.8,5.2,5.6]]]}];
/* comparaisons de deux solutions, phase par phase (plages de valeurs en kg CO₂ éq, arrondies au pas st) */
const DUO=[
  {sys:"deux scooters de 125 cm³, pour 30 000 km parcourus sur l'île",A:"Scooter thermique",B:"Scooter électrique",c:[["Matières et","fabrication"],"Transport","Utilisation","Fin de vie"],a:[[650,850],[40,60],[1900,2500],[20,40]],b:[[950,1250],[45,70],[800,1300],[30,50]],st:10},
  {sys:"deux climatiseurs de même puissance, utilisés 10 ans à Tahiti",A:"Climatiseur standard",B:"Climatiseur inverter",c:[["Matières et","fabrication"],"Transport","Utilisation",["Fin de vie","(fluide)"]],a:[[330,420],[35,50],[7800,9500],[140,220]],b:[[380,480],[35,50],[5200,6600],[90,150]],st:10},
  {sys:"deux pirogues (va'a) de course de même taille",A:"Fibre de verre",B:"Carbone",c:PHB,a:[[60,85],[20,30],[5,8],[0,0],[5,9]],b:[[190,250],[25,40],[4,7],[0,0],[5,9]],st:1},
  {sys:"l'éclairage d'une salle de classe pendant 10 ans",A:"Tubes fluorescents",B:"Lampes à LED",c:PHB,a:[[40,60],[15,25],[2,4],[2800,3400],[5,10]],b:[[30,45],[20,30],[1,3],[1300,1700],[2,5]],st:1},
  {sys:"deux cadres de vélo de même rigidité",A:"Cadre en acier",B:"Cadre en aluminium",c:PHB,a:[[45,55],[20,28],[6,9],[0,0],[2,4]],b:[[60,80],[25,35],[5,8],[0,0],[2,4]],st:1}];
const pick=(r,st)=>Math.round((r[0]+(r[1]-r[0])*Math.random())/st)*st;

const DD1=[
/* phase manquante du cycle de vie */
()=>{ const k=rnd([0,1,2,3,4]), fig=fx_sce_flow({b:PHB.map((t,i)=>({t,q:i===k})),back:{from:4,to:1,lab:"recyclage de la matière"}});
  return {fig,q:"Quelle phase du cycle de vie d'un produit manque sur ce schéma ?",type:"ch",...mc(PHN[k],shuffle(PHN.filter((_,i)=>i!==k)).slice(0,3)),
    expl:`Une analyse du cycle de vie (ACV) suit le produit « du berceau à la tombe » : ${PHN.map(x=>x.toLowerCase()).join(" → ")}. La case « ? » correspond à la phase ${F(PHN[k].toLowerCase())} : ${PHD[k]}. L'éco-conception cherche à réduire l'impact de chacune de ces phases dès la conception du produit.`}; },
/* classer une opération dans une phase */
()=>{ const [o,k]=rnd(OPS);
  return {q:`« ${o} » : à quelle phase du cycle de vie cette opération appartient-elle ?`,type:"ch",ch:PHN.slice(),ok:k,
    expl:`Phase « ${PHN[k].toLowerCase()} » : ${PHD[k]}. L'opération décrite appartient donc à la phase ${F(PHN[k].toLowerCase())}.`}; },
/* émissions dues à un matériau */
()=>{ const s=rnd(MATQ), m=rnd(s.m), fe=rnd(s.f), E=m*fe;
  return {ctx:`${s.p} a une masse de ${nf(m,2)} kg. Facteur d'émission ${s.de} : ${nf(fe,1)} kg CO₂ éq/kg.`,
    q:"Calcule les émissions de gaz à effet de serre dues à ce matériau.",type:"num",ans:E,tolR:0.02,unit:CE,
    expl:`${F("émissions = m × FE")} = ${nf(m,2)} × ${nf(fe,1)} = ${U(E,CE)}. Le facteur d'émission d'un matériau compte, pour 1 kg de matière, son extraction et sa transformation.`}; },
/* émissions d'un transport */
()=>{ const s=rnd(TRQ), m=rnd(s.m), d=rnd(s.d), fe=rnd(s.fe), E=m*d*fe;
  return {ctx:`${s.t} (${nf(m,1)} t) est acheminé ${s.tr}, sur ${nf(d,0)} km, par ${s.mode}. Facteur d'émission de ce mode de transport : ${nf(fe,3)} kg CO₂ éq/(t·km), c'est-à-dire par tonne transportée sur 1 km.`,
    q:"Calcule les émissions dues à ce transport.",type:"num",ans:E,tolR:0.02,unit:CE,
    expl:`${F("émissions = m·d·FE")} = ${nf(m,1)} t × ${nf(d,0)} km × ${nf(fe,3)} = ${U(E,CE)}. La masse est en tonnes et la distance en kilomètres, comme dans l'unité du facteur d'émission.`}; },
/* émissions de l'utilisation d'un appareil électrique */
()=>{ const s=rnd(USQ), W=rnd(s.W), fe=rnd([0.55,0.6,0.65,0.7]), E=W*fe, N=rnd([10,12,15]);
  return {ctx:`${s.p} consomme ${nf(W,0)} kWh d'électricité par an. Le réseau électrique de l'île, alimenté surtout par des centrales thermiques, a un facteur d'émission de ${nf(fe,2)} kg CO₂ éq/kWh.`,
    q:"Quelles émissions l'utilisation de cet appareil provoque-t-elle chaque année ?",type:"num",ans:E,tolR:0.02,unit:CE,
    expl:`${F("émissions = E × FE")} = ${nf(W,0)} × ${nf(fe,2)} = ${U(E,CE)} par an. Sur ${N} ans de service, cela fait ${nf(E*N,0)} kg CO₂ éq : avec une électricité produite par des centrales thermiques, l'utilisation est souvent la phase dominante d'un tel appareil.`}; },
/* phase dominante sur un diagramme en barres */
()=>{ const P=rnd(ACVP), v=acvDraw(P), k=v.indexOf(Math.max(...v)), tot=sum(v);
  return {fig:acvFig(P,v),ctx:`Analyse du cycle de vie ${P.p} : émissions de gaz à effet de serre de chaque phase.`,q:"Quelle est la phase dominante du cycle de vie de ce produit ?",type:"ch",ch:PHN.slice(),ok:k,
    expl:`La phase dominante est celle qui émet le plus : ${F(PHN[k].toLowerCase())}, avec ${nf(v[k],P.d)} ${P.u} sur un total de ${nf(tot,P.d)} ${P.u}, soit ${nf(v[k]/tot*100,0)} % du total. C'est sur elle que l'éco-conception agit en priorité : ${ACT[k]}.`}; },
/* énergie grise : définition */
()=>{ if(Math.random()<0.5) return {q:"Qu'appelle-t-on l'énergie grise d'un produit ?",type:"ch",...mc("L'énergie consommée sur tout son cycle de vie, sauf pendant l'utilisation : extraction des matières, fabrication, transport, fin de vie",["L'énergie que le produit consomme pendant son utilisation","L'énergie perdue en chaleur par le produit quand il fonctionne","L'énergie que le produit restitue en fin de vie, lors de son recyclage"]),
    expl:`L'énergie grise est l'énergie « cachée » dans le produit : celle de ${F("tout le cycle de vie sauf l'utilisation")}. Pour un panneau photovoltaïque ou une isolation, on la compare à l'énergie produite ou économisée chaque année : c'est le temps de retour énergétique.`};
  const s=rnd([["d'un climatiseur","L'électricité consommée pour refroidir la pièce pendant 10 ans",["L'énergie de l'extraction du cuivre de ses tubes","L'énergie de fabrication de son compresseur","L'énergie de son transport jusqu'à Papeete"]],
    ["d'un scooter électrique","L'électricité de ses recharges pendant 5 ans",["L'énergie de fabrication de sa batterie","L'énergie de son transport par cargo","L'énergie du recyclage de son cadre en fin de vie"]],
    ["d'un faré (maison)","L'électricité de la climatisation et de l'éclairage pendant que les habitants y vivent",["L'énergie de production du ciment des fondations","L'énergie de sciage et de transport du bois de charpente","L'énergie de fabrication des tôles du toit"]]]);
  return {q:`Laquelle de ces consommations d'énergie ne fait pas partie de l'énergie grise ${s[0]} ?`,type:"ch",...mc(s[1],s[2]),
    expl:`L'énergie grise regroupe l'énergie de ${F("tout le cycle de vie sauf l'utilisation")} : extraction, fabrication, transport, fin de vie. « ${s[1]} » relève de l'utilisation : ce n'est pas de l'énergie grise.`}; },
/* kg CO₂ éq et pouvoir de réchauffement global */
()=>{ if(Math.random()<0.4) return {q:"Que signifie l'unité « kg CO₂ éq » (kilogramme d'équivalent CO₂) ?",type:"ch",...mc("La masse de CO₂ qui aurait le même effet sur le réchauffement climatique que l'ensemble des gaz à effet de serre émis",["La masse de carbone contenue dans le produit","La masse de CO₂ seule, sans compter les autres gaz à effet de serre","La masse de combustible brûlé pendant la fabrication"]),
    expl:`Les gaz à effet de serre n'ont pas tous le même effet : 1 kg de méthane réchauffe environ 28 fois plus que 1 kg de CO₂ sur 100 ans. On convertit chaque gaz avec son pouvoir de réchauffement global (PRG) : ${F("m(CO₂ éq) = m × PRG")}, puis on additionne.`};
  const s=rnd([{t:"Lors d'une panne, un climatiseur perd",g:"R32",prg:675,m:[0.4,0.6,0.8,1]},{t:"Un réfrigérateur démonté sans précaution laisse échapper",g:"R134a",prg:1430,m:[0.1,0.12,0.15,0.2]},{t:"Une fuite sur une vieille climatisation libère",g:"R410A",prg:2088,m:[0.3,0.5,0.8]}]);
  const m=rnd(s.m), E=m*s.prg;
  return {ctx:`${s.t} ${nf(m,2)} kg de fluide frigorigène ${s.g} dans l'atmosphère. Pouvoir de réchauffement global de ce fluide : PRG = ${nf(s.prg,0)} (sur 100 ans, 1 kg de ${s.g} réchauffe le climat autant que ${nf(s.prg,0)} kg de CO₂).`,
    q:"Calcule les émissions correspondantes, en kg CO₂ éq.",type:"num",ans:E,tolR:0.02,unit:CE,
    expl:`${F("émissions = m × PRG")} = ${nf(m,2)} × ${nf(s.prg,0)} = ${U(E,CE)}. Une petite fuite pèse lourd : récupérer les fluides frigorigènes pendant l'entretien et en fin de vie est essentiel.`}; },
/* taux de recyclabilité */
()=>{ const s=rnd([{p:"un panneau photovoltaïque",M:[20,21.5,22,23],f:[0.9,0.93,0.95],det:"verre, cadre en aluminium, cuivre"},{p:"un vélo à assistance électrique",M:[22,24,26],f:[0.74,0.78,0.82],det:"aluminium, acier"},
    {p:"un réfrigérateur",M:[45,52,60],f:[0.8,0.84,0.88],det:"acier, cuivre, certains plastiques"},{p:"une trottinette électrique",M:[12,14,16],f:[0.7,0.75,0.8],det:"aluminium, acier, cuivre"},{p:"une voiture",M:[1100,1250,1400],f:[0.85,0.87,0.9],det:"acier, aluminium, verre"}]);
  const M=rnd(s.M), R=r2(M*rnd(s.f)*(0.99+Math.random()*0.02),M>=100?0:1), r=R/M*100;
  return {ctx:`Sur les ${nf(M,1)} kg d'${s.p}, ${nf(R,1)} kg de matériaux peuvent être recyclés (${s.det}).`,
    q:"Calcule le taux de recyclabilité de ce produit, en %.",type:"num",ans:r,tolA:0.3,unit:"%",
    expl:`${F(`taux = ${FRAC("m recyclable","m totale")} × 100`)} = ${FRAC(nf(R,1),nf(M,1))} × 100 = ${U(r,"%")}. Encore faut-il que le produit soit collecté et démonté : un produit recyclable n'est pas forcément recyclé.`}; },
/* choix de conception : réparabilité, recyclabilité, allègement */
()=>{ const v=rnd([0,1,2]);
  if(v===0) return {q:"Laquelle de ces solutions de conception facilite la réparation d'un téléphone ?",type:"ch",...mc("Une batterie fixée par des vis standard, remplaçable avec un simple tournevis",["Une batterie collée à la coque pour gagner de la place","Des vis à empreinte spéciale, réservées au fabricant","Un écran soudé au châssis pour le rigidifier"]),
    expl:`Réparer, c'est pouvoir ${F("démonter et remplacer")} la pièce usée : assemblages vissés, outils courants, pièces détachées disponibles, notice. Un téléphone réparé dure plus longtemps : sa fabrication, qui domine son bilan carbone, est amortie sur plus d'années.`};
  if(v===1) return {q:"Laquelle de ces solutions de conception facilite le recyclage d'une trottinette électrique en fin de vie ?",type:"ch",...mc("Utiliser peu de matériaux différents, assemblés par des vis et faciles à séparer",["Surmouler du plastique sur les pièces en aluminium","Mélanger plusieurs plastiques dans une même pièce","Coller entre elles des pièces de matériaux différents"]),
    expl:`Pour recycler, il faut ${F("séparer les matériaux")} : peu de matériaux différents, pièces vissées plutôt que collées ou surmoulées, plastiques marqués (PP, ABS…). Un mélange de matériaux inséparables finit enfoui ou incinéré.`};
  return {q:"Laquelle de ces modifications est une démarche d'éco-conception par allègement ?",type:"ch",...mc("Remplacer une barre pleine par un tube creux aussi rigide, qui utilise moins de matière",["Doubler l'épaisseur d'une coque pour la rendre plus solide","Choisir un matériau plus dense pour une pièce de même volume","Ajouter une couche de peinture pour protéger la pièce"]),
    expl:`Alléger, c'est obtenir ${F("la même fonction avec moins de matière")} : moins de matière à extraire et à transformer et, pour un véhicule, moins d'énergie consommée à chaque déplacement.`}; },
/* sobriété, efficacité ou énergie renouvelable */
()=>{ const [a,k]=rnd(SEA);
  return {q:`« ${a} » : de quelle démarche s'agit-il ?`,type:"ch",ch:SEAC.slice(),ok:k,
    expl:`Sobriété : on réduit le besoin ou l'usage. Efficacité : on rend le même service avec moins d'énergie (meilleur rendement, isolation). Renouvelable : on remplace une énergie fossile. Ici, c'est ${F(["la sobriété","l'efficacité","une énergie renouvelable"][k])}. Les trois se complètent, en commençant par la sobriété : l'énergie la moins polluante est celle qu'on ne consomme pas.`}; },
/* temps de retour énergétique */
()=>{ const s=rnd([{p:"Un panneau photovoltaïque de 400 Wc",g:[800,900,1000,1200],a:[520,560,600,640],v:"il produit",l:"25 à 30 ans"},{p:"Un chauffe-eau solaire",g:[3000,3500,4000,5000],a:[1800,2200,2600],v:"il fait économiser",l:"15 à 20 ans"},
    {p:"Une petite éolienne de 5 kW",g:[12000,15000,18000],a:[6000,8000,10000],v:"elle produit",l:"20 ans environ"},{p:"L'isolation du toit d'une salle climatisée",g:[2000,2500,3000],a:[1200,1500,1800],v:"elle fait économiser",l:"plus de 30 ans"}]);
  const Eg=rnd(s.g), Ea=rnd(s.a), t=Eg/Ea;
  return {ctx:`${s.p} a une énergie grise de ${nf(Eg,0)} kWh. Chaque année, ${s.v} ${nf(Ea,0)} kWh d'électricité.`,
    q:"Calcule son temps de retour énergétique, en années.",type:"num",ans:t,tolR:0.02,unit:AN(t),
    expl:`C'est la durée au bout de laquelle l'énergie produite (ou économisée) égale l'énergie grise : ${F(`t = ${FRAC("énergie grise","énergie gagnée par an")}`)} = ${FRAC(nf(Eg,0),nf(Ea,0))} = ${U(t,AN(t))}. Avec une durée de vie de ${s.l}, l'énergie grise est remboursée plusieurs fois.`}; },
/* voies de fin de vie : réemploi, recyclage, élimination */
()=>{ const fig=fx_dd_boucles(), ctx="Le schéma montre les voies possibles pour un produit en fin de vie : deux boucles (1 et 2) et une flèche (3).";
  if(Math.random()<0.5){ const k=rnd([1,2,3]), C=["La réparation ou le réemploi : le produit lui-même sert à nouveau","Le recyclage : la matière récupérée sert à fabriquer de nouveaux produits","L'élimination : enfouissement ou incinération des déchets"];
    return {fig,ctx,q:`Que représente la voie numérotée ${k} ?`,type:"ch",...mc(C[k-1],C.filter((_,i)=>i!==k-1).concat(["L'extraction de nouvelles matières premières"])),
      expl:`Voie 1 : le produit revient à l'utilisation (réparation, réemploi). Voie 2 : la matière revient à la fabrication (recyclage). Voie 3 : élimination. La voie ${k} correspond donc à ${F(["la réparation ou le réemploi","le recyclage","l'élimination"][k-1])}.`}; }
  return {fig,ctx,q:"Classe ces trois voies de la plus favorable à la moins favorable pour l'environnement.",type:"ch",...mc("1, puis 2, puis 3",["2, puis 1, puis 3","3, puis 2, puis 1","2, puis 3, puis 1"]),
    expl:`Plus la boucle est courte, plus elle préserve de ressources : la réparation ou le réemploi (1) garde le produit entier et évite une nouvelle fabrication ; le recyclage (2) récupère la matière, mais il faut de l'énergie pour la refondre et refabriquer ; l'élimination (3) perd la matière. D'où la hiérarchie : ${F("réparer, réemployer, puis recycler")}.`}; }
];

const DD2=[
/* bilan des matériaux d'un produit : émissions, puis élément prépondérant */
()=>{ const B=rnd(BOM);
  const o=draw(()=>{ const it=B.it.map(x=>({n:x[0],u:x[1],q:rnd(x[2]),f:rnd(x[3])})); it.forEach(x=>{ x.e=x.q*x.f; }); const e=it.map(x=>x.e).sort((a,b)=>b-a); return {it,ok:e[0]>=1.15*e[1]}; },o=>o.ok);
  const it=o.it, tot=sum(it.map(x=>x.e)), k=it.reduce((a,x,i)=>x.e>it[a].e?i:a,0), kg=it.map((x,i)=>i).filter(i=>it[i].u==="kg"), heavy=kg.reduce((a,i)=>it[i].q>it[a].q?i:a,kg[0]);
  const data=table(["Élément","Quantité","Facteur d'émission"],it.map(x=>[x.n,`${nf(x.q,2)} ${x.u}`,`${nf(x.f,1)} kg CO₂ éq/${x.u}`]));
  const ctx=`Composition simplifiée d'${B.p} et facteurs d'émission (extraction et transformation des matériaux${it.some(x=>x.u==="kWh")?", fabrication de la batterie":""}).`;
  const det=it.map(x=>`${lc1(x.n)} : ${nf(x.q,2)} × ${nf(x.f,1)} = ${S4(x.e)}`).join(" ; ");
  return [{data,ctx,q:"Calcule les émissions dues aux matériaux et aux composants de ce produit.",type:"num",ans:tot,tolR:0.02,unit:CE,
      expl:`Pour chaque élément, ${F("émissions = quantité × FE")} : ${det}. Total : ${U(tot,CE)}.`},
    {data,ctx,q:"Quel élément contribue le plus à ces émissions ?",type:"ch",...mc(it[k].n,it.filter((_,i)=>i!==k).map(x=>x.n)),
      expl:`${it[k].n} : ${S4(it[k].e)} kg CO₂ éq, soit ${nf(it[k].e/tot*100,0)} % du total. ${k!==heavy?`Ce n'est pas l'élément le plus lourd : c'est le produit ${F("quantité × FE")} qui compte, pas la masse seule.`:`C'est aussi l'élément le plus lourd, mais c'est bien le produit ${F("quantité × FE")} qui compte.`}`}]; },
/* transport par avion ou par bateau */
()=>{ const [obj,g,ms]=rnd([["Une pièce de rechange pour la centrale électrique d'une île","e",[80,120,250,400]],["Un moteur hors-bord neuf","",[60,120,180,250]],["Un lot de batteries pour une ferme solaire","",[250,400,650]],["Une pompe pour le réseau d'eau d'une commune","e",[80,120,250]]]);
  const m=rnd(ms), da=rnd([16000,17000]), fa=rnd([0.6,0.8,1]), ds=rnd([17000,18000]), fs=rnd([0.01,0.012,0.015]), Ea=m/1000*da*fa, Es=m/1000*ds*fs, k=Ea/Es;
  const ctx=`${obj} (${nf(m,0)} kg, emballage compris) doit être acheminé${g} de la métropole jusqu'à Tahiti. Par avion cargo : ${nf(da,0)} km, ${nf(fa,2)} kg CO₂ éq/(t·km). Par porte-conteneurs : ${nf(ds,0)} km, ${nf(fs,3)} kg CO₂ éq/(t·km).`;
  return [{ctx,q:"Calcule les émissions du transport par avion.",type:"num",ans:Ea,tolR:0.02,unit:CE,
      expl:`m = ${nf(m,0)} kg = ${nf(m/1000,3)} t. ${F("émissions = m·d·FE")} = ${nf(m/1000,3)} × ${nf(da,0)} × ${nf(fa,2)} = ${U(Ea,CE)}.`},
    {ctx,q:"Combien de fois le transport par avion émet-il plus que le transport par bateau ?",type:"num",ans:k,tolR:0.02,unit:"",
      expl:`Par bateau : ${nf(m/1000,3)} × ${nf(ds,0)} × ${nf(fs,3)} = ${S4(Es)} kg CO₂ éq. ${F(FRAC("émissions avion","émissions bateau"))} = ${FRAC(S4(Ea),S4(Es))} = ${U(k,"")}. L'avion est rapide mais très émetteur : on le réserve aux urgences.`}]; },
/* diagramme en barres : total, puis part de la phase dominante */
()=>{ const P=rnd(ACVP), v=acvDraw(P), k=v.indexOf(Math.max(...v)), tot=sum(v), r=v[k]/tot*100, fig=acvFig(P,v), ctx=`Analyse du cycle de vie ${P.p} : émissions de gaz à effet de serre de chaque phase.`;
  return [{fig,ctx,q:"Calcule les émissions totales de ce produit sur son cycle de vie.",type:"num",ans:tot,tolR:0.02,unit:P.u,
      expl:`On additionne les cinq phases : ${v.map(x=>nf(x,P.d)).join(" + ")} = ${U(tot,P.u)}.`},
    {fig,ctx,q:"Quelle part des émissions totales la phase dominante représente-t-elle, en % ?",type:"num",ans:r,tolA:0.3,unit:"%",
      expl:`Phase dominante : ${PHN[k].toLowerCase()} (${nf(v[k],P.d)} ${P.u}). ${F(`part = ${FRAC("émissions de la phase","émissions totales")} × 100`)} = ${FRAC(nf(v[k],P.d),S4(tot))} × 100 = ${U(r,"%")}.`}]; },
/* deux solutions comparées phase par phase : total, puis écart relatif */
()=>{ const D=rnd(DUO), a=D.a.map(r=>pick(r,D.st)), b=D.b.map(r=>pick(r,D.st)), TA=sum(a), TB=sum(b), er=ecart(TB,TA), mx=Math.max(...a,...b), ax=axis(mx,5);
  const fig=fx_dd_hbar({c:D.c,s:[{v:a,n:D.A},{v:b,n:D.B}],x1:ax.y1,xs:ax.ys,xl:"émissions (kg CO₂ éq)",alt:`Émissions par phase de deux solutions : ${lc1(D.A)} et ${lc1(D.B)}`});
  const ctx=`Analyse du cycle de vie de ${D.sys} : émissions de gaz à effet de serre de chaque phase, en kg CO₂ éq.`;
  return [{fig,ctx,q:`Calcule les émissions totales de la solution « ${D.A} » sur son cycle de vie.`,type:"num",ans:TA,tolR:0.02,unit:CE,
      expl:`On additionne toutes les phases : ${a.map(x=>nf(x,0)).join(" + ")} = ${U(TA,CE)}.`},
    {fig,ctx,q:`Calcule l'écart relatif entre les émissions totales des deux solutions, en prenant « ${D.A} » comme référence.`,type:"num",ans:er,tolA:0.3,unit:"%",
      expl:`« ${D.B} » : ${b.map(x=>nf(x,0)).join(" + ")} = ${nf(TB,0)} kg CO₂ éq. ${F(`écart = ${FRAC("|E_B − E_A|","E_A")} × 100`)} = ${FRAC(`|${nf(TB,0)} − ${nf(TA,0)}|`,nf(TA,0))} × 100 = ${U(er,"%")} : « ${D.B} » émet ${S3(er)} % ${TB<TA?"de moins":"de plus"} que « ${D.A} » sur son cycle de vie.`}]; },
/* photovoltaïque : production annuelle, puis temps de retour énergétique */
()=>{ const n=rnd([12,16,20,24,30]), Pc=rnd([375,400,425,450]), h=rnd([4.5,4.8,5,5.2]), eo=rnd([0.94,0.95,0.96,0.97]), Eg=rnd([2000,2500,3000]), P=n*Pc/1000, E=P*h*365*eo, t=Eg*P/E;
  const ctx=`Le toit d'un collège de Tahiti porte ${n} panneaux de ${Pc} Wc, soit ${nf(P,2)} kWc. Ensoleillement moyen : ${nf(h,1)} heures équivalentes par jour ; rendement de l'onduleur : ${nf(eo,2)}. Énergie grise de l'installation (panneaux, onduleur, structure, transport) : ${nf(Eg,0)} kWh par kWc installé.`;
  return [{ctx,q:"Quelle énergie électrique l'installation fournit-elle en un an ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`${F("E = Pc·h·η × 365")} = ${nf(P,2)} kWc × ${nf(h,1)} h × ${nf(eo,2)} × 365 = ${U(E,"kWh")} par an.`},
    {ctx,q:"Calcule le temps de retour énergétique de l'installation.",type:"num",ans:t,tolR:0.02,unit:AN(t),
      expl:`Énergie grise : ${nf(Eg,0)} × ${nf(P,2)} = ${nf(Eg*P,0)} kWh. ${F(`t = ${FRAC("énergie grise","énergie gagnée par an")}`)} = ${FRAC(nf(Eg*P,0),S4(E))} = ${U(t,AN(t))}, pour une durée de vie de 25 à 30 ans.`}]; },
/* chauffe-eau solaire : émissions évitées, puis temps de retour carbone */
()=>{ const loc=rnd([{l:"à Tahiti",t:1,fe:[0.6,0.65,0.7],d:"le réseau de l'île, alimenté surtout par des centrales thermiques"},{l:"en métropole",t:0,fe:[0.05,0.06],d:"le réseau métropolitain, alimenté surtout par des centrales nucléaires et hydrauliques"}]);
  const F0=rnd([450,550,650,800]), W=rnd([1600,2000,2400]), fe=rnd(loc.fe), a=W*fe, t=F0/a;
  const ctx=`Une pension de famille ${loc.l} remplace son chauffe-eau électrique par un chauffe-eau solaire. Fabrication, transport et installation du chauffe-eau solaire : ${nf(F0,0)} kg CO₂ éq. Il fait économiser ${nf(W,0)} kWh d'électricité par an ; cette électricité vient du ${loc.d.slice(3)} (${nf(fe,2)} kg CO₂ éq/kWh).`;
  return [{ctx,q:"Quelles émissions le chauffe-eau solaire fait-il éviter chaque année ?",type:"num",ans:a,tolR:0.02,unit:CE,
      expl:`${F("émissions évitées = E × FE")} = ${nf(W,0)} × ${nf(fe,2)} = ${U(a,CE)} par an.`},
    {ctx,q:"Calcule son temps de retour carbone.",type:"num",ans:t,tolR:0.02,unit:AN(t),
      expl:`${F(`t = ${FRAC("émissions de fabrication","émissions évitées par an")}`)} = ${FRAC(nf(F0,0),S4(a))} = ${U(t,AN(t))}${t<1?`, soit environ ${nf(t*12,0)} mois`:""}. ${loc.t?"L'électricité de l'île étant très carbonée, le chauffe-eau rembourse très vite sa dette carbone.":"L'électricité étant peu carbonée, le retour est plus long, mais il reste bien inférieur à la durée de vie du chauffe-eau (environ 20 ans)."}`}]; },
/* durée de vie d'un smartphone : émissions par année d'utilisation */
()=>{ const F0=rnd([50,60,70,80]), u=rnd([1,1.5,2]), b=rnd([5,6,8]), N1=rnd([2,3]), N2=N1+rnd([2,3]), e1=(F0+N1*u)/N1, e2=(F0+b+N2*u)/N2;
  const ctx=`Fabriquer un smartphone (extraction des matières, fabrication, transport) émet ${F0} kg CO₂ éq ; son utilisation (recharges) émet ${nf(u,1)} kg CO₂ éq par an. Teva change de téléphone tous les ${N1} ans. Hina garde le même modèle ${N2} ans, en faisant remplacer la batterie au bout de ${N1} ans (${b} kg CO₂ éq pour la batterie neuve et la réparation).`;
  return [{ctx,q:"Calcule les émissions par année d'utilisation du téléphone de Teva.",type:"num",ans:e1,tolR:0.02,unit:"kg CO₂ éq/an",
      expl:`${F(`e = ${FRAC("émissions sur la durée de vie","durée de vie")}`)} = ${FRAC(`${F0} + ${N1} × ${nf(u,1)}`,N1)} = ${U(e1,"kg CO₂ éq/an")}.`},
    {ctx,q:"Calcule les émissions par année d'utilisation du téléphone de Hina.",type:"num",ans:e2,tolR:0.02,unit:"kg CO₂ éq/an",
      expl:`e = ${FRAC(`${F0} + ${b} + ${N2} × ${nf(u,1)}`,N2)} = ${U(e2,"kg CO₂ éq/an")}, soit ${nf((1-e2/e1)*100,0)} % de moins que Teva. La fabrication domine le bilan d'un téléphone : ${F("allonger la durée de vie")} est le levier le plus efficace.`}]; },
/* aluminium recyclé : émissions, puis baisse relative */
()=>{ const s=rnd([{p:"Le cadre d'un vélo",m:[1.6,1.8,2,2.4]},{p:"La coque d'un bateau de pêche",m:[250,300,400]},{p:"Le cadre d'un panneau photovoltaïque",m:[2,2.5,3]}]);
  const m=rnd(s.m), fp=rnd([8.2,8.6,9]), fr=rnd([0.5,0.6,0.8]), tau=rnd([30,40,50,60,75]), t=tau/100, E=m*(t*fr+(1-t)*fp), Ep=m*fp, gg=(Ep-E)/Ep*100;
  const ctx=`${s.p} contient ${nf(m,1)} kg d'aluminium. Facteurs d'émission : aluminium primaire (issu de la bauxite) ${nf(fp,1)} kg CO₂ éq/kg ; aluminium recyclé ${nf(fr,1)} kg CO₂ éq/kg. Le fabricant passe à un alliage qui contient ${tau} % d'aluminium recyclé.`;
  return [{ctx,q:`Calcule les émissions dues à l'aluminium avec ${tau} % de recyclé.`,type:"num",ans:E,tolR:0.02,unit:CE,
      expl:`Masse recyclée : ${nf(m*t,2)} kg ; masse primaire : ${nf(m*(1-t),2)} kg. ${F("émissions = m_r·FE_r + m_p·FE_p")} = ${nf(m*t,2)} × ${nf(fr,1)} + ${nf(m*(1-t),2)} × ${nf(fp,1)} = ${U(E,CE)}.`},
    {ctx,q:"De combien de % ces émissions baissent-elles par rapport à de l'aluminium 100 % primaire (référence) ?",type:"num",ans:gg,tolA:0.3,unit:"%",
      expl:`100 % primaire : ${nf(m,1)} × ${nf(fp,1)} = ${S4(Ep)} kg CO₂ éq. ${F(`baisse = ${FRAC("|E − E_réf|","E_réf")} × 100`)} = ${FRAC(`${S4(Ep)} − ${S4(E)}`,S4(Ep))} × 100 = ${U(gg,"%")}. Le recyclage évite l'extraction de la bauxite et l'électrolyse, très gourmande en énergie.`}]; },
/* allègement d'une voiture : carburant, puis émissions évitées */
()=>{ const dm=rnd([80,100,120,150]), c=rnd([0.3,0.35,0.4]), D=rnd([10000,12000,15000]), N=rnd([10,12,15]), dc=dm/100*c, Vol=dc*D*N/100, E=Vol*3.2;
  const ctx=`Un constructeur allège une voiture de ${dm} kg en remplaçant des pièces en acier par des pièces en aluminium. On admet qu'un allègement de 100 kg réduit la consommation de ${nf(c,2)} L/100 km. La voiture parcourt ${nf(D,0)} km par an pendant ${N} ans. Gazole : 3,2 kg CO₂ éq par litre (extraction, raffinage et combustion).`;
  return [{ctx,q:"Quel volume de gazole cet allègement fait-il économiser sur la durée de vie de la voiture ?",type:"num",ans:Vol,tolR:0.02,unit:"L",
      expl:`Baisse de consommation : ${FRAC(dm,100)} × ${nf(c,2)} = ${nf(dc,3)} L/100 km. Distance totale : ${nf(D,0)} × ${N} = ${nf(D*N,0)} km. ${F(`V = Δc × ${FRAC("d","100")}`)} = ${nf(dc,3)} × ${FRAC(nf(D*N,0),100)} = ${U(Vol,"L")}.`},
    {ctx,q:"Quelles émissions cet allègement fait-il éviter pendant l'utilisation ?",type:"num",ans:E,tolR:0.02,unit:CE,
      expl:`${F("émissions = V × FE")} = ${S4(Vol)} × 3,2 = ${U(E,CE)}. Attention : l'aluminium émet plus que l'acier à la fabrication ; le bilan complet compare ce surcoût au gain pendant l'utilisation.`}]; },
/* énergie finale et énergie primaire */
()=>{ const Q=rnd([2000,2500,3000,4000]), ee=rnd([0.9,0.95]), cp=rnd([2.3,2.5,2.6]), eg=rnd([0.85,0.9]), Ef=Q/ee, Ep=cp*Ef, Eg=Q/eg;
  const ctx=`L'eau chaude d'une pension de famille demande ${nf(Q,0)} kWh de chaleur par an. Solution électrique : ballon de rendement ${nf(ee,2)} ; chaque kWh d'électricité consommé demande ${nf(cp,1)} kWh d'énergie primaire (combustible brûlé dans les centrales thermiques). Solution gaz : chauffe-eau de rendement ${nf(eg,2)} ; pour le gaz, énergie finale et énergie primaire sont égales.`;
  return [{ctx,q:"Quelle énergie électrique (énergie finale) le ballon électrique consomme-t-il par an ?",type:"num",ans:Ef,tolR:0.02,unit:"kWh",
      expl:`${F(`E_finale = ${FRAC("Q","η")}`)} = ${FRAC(nf(Q,0),nf(ee,2))} = ${U(Ef,"kWh")}.`},
    {ctx,q:"Quelle énergie primaire la solution électrique consomme-t-elle par an ?",type:"num",ans:Ep,tolR:0.02,unit:"kWh",
      expl:`${F("E_primaire = coefficient × E_finale")} = ${nf(cp,1)} × ${S4(Ef)} = ${U(Ep,"kWh")}. Solution gaz : ${FRAC(nf(Q,0),nf(eg,2))} = ${nf(Eg,0)} kWh d'énergie primaire, ${nf(Ep/Eg,1)} fois moins : les pertes des centrales thermiques pèsent lourd.`}]; },
/* photovoltaïque : émissions par kWh produit (unité fonctionnelle) */
()=>{ const F0=rnd([900,1100,1300,1500]), Y=rnd([1300,1400,1500]), N=rnd([20,25,30]), ref=rnd([600,650,700]), E=Y*N, gk=F0*1000/E;
  const ctx=`Fabriquer, transporter jusqu'à Tahiti et installer 1 kWc de panneaux photovoltaïques émet ${nf(F0,0)} kg CO₂ éq. À Tahiti, 1 kWc produit ${nf(Y,0)} kWh par an, pendant ${N} ans. Pour comparer : l'électricité des centrales thermiques de l'île émet environ ${ref} g CO₂ éq/kWh.`;
  return [{ctx,q:"Quelle énergie 1 kWc produit-il sur toute sa durée de vie ?",type:"num",ans:E,tolR:0.02,unit:"kWh",expl:`${F("E = production annuelle × durée")} = ${nf(Y,0)} × ${N} = ${U(E,"kWh")}.`},
    {ctx,q:"Calcule les émissions du photovoltaïque par kWh produit, en g CO₂ éq/kWh.",type:"num",ans:gk,tolR:0.02,unit:"g CO₂ éq/kWh",
      expl:`${nf(F0,0)} kg = ${nf(F0*1000,0)} g. ${F(`e = ${FRAC("émissions totales","énergie produite")}`)} = ${FRAC(nf(F0*1000,0),nf(E,0))} = ${U(gk,"g CO₂ éq/kWh")}, environ ${nf(ref/gk,0)} fois moins que les centrales thermiques de l'île. On compare les deux sources pour le même service rendu : le kWh produit (unité fonctionnelle).`}]; },
/* émissions cumulées de deux climatiseurs : croisement, puis émissions évitées */
()=>{ const aA=rnd([600,700,800,900,1000]), d=rnd([100,150,200,250]), k=rnd([2,3,4,5]), FA=rnd([300,400,500]), FB=FA+k*d, aB=aA-d, N=10, A10=FA+N*aA, B10=FB+N*aB, ax=axis(A10);
  const fig=fx_dd_cumul({a:[{F:FA,a:aA,lab:"climatiseur A"},{F:FB,a:aB,lab:"climatiseur B"}],N,y1:ax.y1,ys:ax.ys,yg:ax.ys/2,u:"kg CO₂ éq",xs:1,alt:"Émissions cumulées de deux climatiseurs en fonction de la durée d'utilisation"});
  const data=table(["Climatiseur","Fabrication et transport (kg CO₂ éq)","Utilisation (kg CO₂ éq par an)"],[["A",nf(FA,0),nf(aA,0)],["B, plus économe",nf(FB,0),nf(aB,0)]]);
  const ctx="Émissions cumulées de deux climatiseurs de même puissance installés à Tahiti : fabrication et transport à t = 0, puis utilisation, année après année.";
  return [{fig,data,ctx,q:"Au bout de combien d'années le climatiseur B a-t-il émis autant que le climatiseur A ?",type:"num",ans:k,tolA:0.3,unit:"ans",
      expl:`Les deux droites se coupent à t = ${k} ans. Par le calcul : ${nf(FA,0)} + ${nf(aA,0)}·t = ${nf(FB,0)} + ${nf(aB,0)}·t, d'où ${F(`t = ${FRAC("F_B − F_A","a_A − a_B")}`)} = ${FRAC(`${nf(FB,0)} − ${nf(FA,0)}`,`${nf(aA,0)} − ${nf(aB,0)}`)} = ${U(k,"ans")}. Ensuite, B émet moins que A chaque année.`},
    {fig,data,ctx,q:"Quelles émissions le climatiseur B fait-il éviter sur 10 ans, par rapport au climatiseur A ?",type:"num",ans:A10-B10,tolR:0.02,unit:CE,
      expl:`Sur 10 ans : A émet ${nf(FA,0)} + 10 × ${nf(aA,0)} = ${nf(A10,0)} kg CO₂ éq ; B émet ${nf(FB,0)} + 10 × ${nf(aB,0)} = ${nf(B10,0)} kg CO₂ éq. Émissions évitées : ${nf(A10,0)} − ${nf(B10,0)} = ${U(A10-B10,CE)}. Son supplément d'émissions à la fabrication est compensé en ${k} ans.`}]; },
/* bus ou voiture : émissions par passager et par km */
()=>{ const D=rnd([20,30,40,50]), J=rnd([180,190,200]), cv=rnd([0.17,0.19,0.21]), cb=rnd([1,1.1,1.2,1.3]), p=rnd([20,25,30,35]), eb=cb/p, km=D*J, E=km*(cv-eb);
  const ctx=`Un enseignant parcourt ${D} km par jour (aller et retour), ${J} jours par an. En voiture, seul à bord : ${nf(cv,2)} kg CO₂ éq/km. En bus : ${nf(cb,1)} kg CO₂ éq/km pour le bus entier, qui transporte en moyenne ${p} passagers.`;
  return [{ctx,q:"Calcule les émissions du bus par passager et par kilomètre, en g CO₂ éq.",type:"num",ans:eb*1000,tolR:0.02,unit:"g CO₂ éq/km",
      expl:`Les émissions du bus sont partagées entre ses passagers : ${F(`e = ${FRAC("émissions du bus","nombre de passagers")}`)} = ${FRAC(nf(cb,1),p)} = ${nf(eb,4)} kg, soit ${U(eb*1000,"g CO₂ éq")} par passager et par km, contre ${nf(cv*1000,0)} g en voiture.`},
    {ctx,q:"Quelles émissions l'enseignant évite-t-il en un an en prenant le bus plutôt que la voiture ?",type:"num",ans:E,tolR:0.02,unit:CE,
      expl:`Distance annuelle : ${D} × ${J} = ${nf(km,0)} km. ${F("Δ = d × (e_voiture − e_bus)")} = ${nf(km,0)} × (${nf(cv,2)} − ${nf(eb,4)}) = ${U(E,CE)} par an.`}]; },
/* recyclage des canettes : masse, puis énergie économisée */
()=>{ const N=rnd([2000,3500,5000,8000]), mg=rnd([13,14,15]), Ep=rnd([50,55,60]), Er=r2(Ep*0.05,1), M=N*mg/1000, E=M*(Ep-Er);
  const ctx=`Un lycée collecte ${nf(N,0)} canettes en aluminium de ${mg} g chacune. Produire 1 kg d'aluminium à partir de bauxite demande ${Ep} kWh ; à partir d'aluminium recyclé, ${nf(Er,1)} kWh.`;
  return [{ctx,q:"Quelle masse d'aluminium le lycée a-t-il collectée, en kg ?",type:"num",ans:M,tolR:0.02,unit:"kg",
      expl:`${F("m = N × m_canette")} = ${nf(N,0)} × ${mg} g = ${nf(N*mg,0)} g, soit ${U(M,"kg")}.`},
    {ctx,q:"Quelle énergie le recyclage de ces canettes fait-il économiser, par rapport à une production à partir de bauxite ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`Économie par kilogramme : ${Ep} − ${nf(Er,1)} = ${nf(Ep-Er,1)} kWh, soit ${nf((1-Er/Ep)*100,0)} %. ${F("E = m × (E_bauxite − E_recyclé)")} = ${S4(M)} × ${nf(Ep-Er,1)} = ${U(E,"kWh")}.`}]; }
];

const DD3=[
/* scooter thermique ou électrique : distance à partir de laquelle l'électrique l'emporte */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const Ft=rnd([600,700,800]), Fe=rnd([1000,1100,1200,1300]), c=rnd([2.4,2.6,2.8,3]), w=rnd([4,5,6]), fe=rnd([0.6,0.65,0.7]), D=rnd([2000,3000,4000,5000,8000]), N=rnd([3,4,5,6,8]);
      const et=c*2.8, ee=w*fe, Db=(Fe-Ft)/((et-ee)/100); return {Ft,Fe,c,w,fe,D,N,et,ee,Db,tot:D*N}; },o=>far(o.tot,o.Db,0.12)&&(o.tot>o.Db)===tgt&&o.Db>=4000&&o.Db<=60000);
  const Tt=o.Ft+o.et*o.tot/100, Te=o.Fe+o.ee*o.tot/100;
  const ctx=`Deux scooters de 125 cm³ rendent le même service. Thermique : fabrication ${o.Ft} kg CO₂ éq ; ${nf(o.c,1)} L d'essence aux 100 km (2,8 kg CO₂ éq par litre). Électrique : fabrication, batterie comprise, ${nf(o.Fe,0)} kg CO₂ éq ; ${o.w} kWh aux 100 km, pris sur le réseau de l'île (${nf(o.fe,2)} kg CO₂ éq/kWh).`;
  return [{ctx,q:"Calcule les émissions d'utilisation du scooter électrique pour 100 km.",type:"num",ans:o.ee,tolR:0.02,unit:CE,
      expl:`${F("émissions = E × FE")} = ${o.w} × ${nf(o.fe,2)} = ${U(o.ee,CE)} aux 100 km, contre ${nf(o.c,1)} × 2,8 = ${nf(o.et,2)} kg CO₂ éq pour le thermique.`},
    {ctx,q:"À partir de quelle distance parcourue le scooter électrique a-t-il un meilleur bilan que le thermique ?",type:"num",ans:o.Db,tolR:0.02,unit:"km",
      expl:`L'électrique émet ${nf(o.Fe-o.Ft,0)} kg CO₂ éq de plus à la fabrication, mais ${nf(o.et-o.ee,2)} kg CO₂ éq de moins tous les 100 km. ${F(`d = ${FRAC("F_élec − F_therm","gain par km")}`)} = ${FRAC(nf(o.Fe-o.Ft,0),nf((o.et-o.ee)/100,4))} = ${U(o.Db,"km")}.`},
    {ctx,q:`Un usager roulera ${nf(o.D,0)} km par an pendant ${o.N} ans. Quel scooter émet le moins sur sa durée de vie ?`,type:"ch",ch:["Le scooter électrique","Le scooter thermique"],ok:tgt?0:1,
      expl:`Distance totale : ${nf(o.D,0)} × ${o.N} = ${nf(o.tot,0)} km, ${tgt?"au-delà":"en deçà"} de ${nf(o.Db,0)} km. Vérification : thermique ${o.Ft} + ${nf(o.et,2)} × ${FRAC(nf(o.tot,0),100)} = ${nf(Tt,0)} kg ; électrique ${nf(o.Fe,0)} + ${nf(o.ee,2)} × ${FRAC(nf(o.tot,0),100)} = ${nf(Te,0)} kg CO₂ éq. ${tgt?"L'électrique l'emporte : son surplus de fabrication est remboursé.":"Le thermique l'emporte : on roule trop peu pour rembourser la fabrication de la batterie."}`}]; },
/* exigence d'impact d'une balise : matériaux, transport, conclusion */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const al=rnd([2,2.5,3,3.5]), fa=rnd([8.2,8.6,9]), ab=rnd([0.8,1,1.2,1.5]), fb=rnd([3.2,3.5]), bat=rnd([0.2,0.3,0.4]), fbat=rnd([90,100,110]), pv=rnd([30,40,50,60]), fpv=rnd([1.2,1.4,1.6]), Mt=rnd([8,10,12,15]), d=rnd([16000,17000]), fav=rnd([0.8,1]), fin=rnd([2,3,4]), X=rnd([200,250,300,350,400]);
      const Em=al*fa+ab*fb+bat*fbat+pv*fpv, Et=Mt/1000*d*fav, Etot=Em+Et+fin; return {al,fa,ab,fb,bat,fbat,pv,fpv,Mt,d,fav,fin,X,Em,Et,Etot}; },o=>far(o.Etot,o.X,0.06)&&(o.Etot<=o.X)===tgt);
  const ok=o.Etot<=o.X, Es=o.Mt/1000*18000*0.012, Tb=o.Em+Es+o.fin;
  const data=table(["Élément","Quantité","Facteur d'émission"],[["Aluminium (boîtier, mât)",`${nf(o.al,1)} kg`,`${nf(o.fa,1)} kg CO₂ éq/kg`],["Plastique ABS",`${nf(o.ab,1)} kg`,`${nf(o.fb,1)} kg CO₂ éq/kg`],["Batterie lithium-ion",`${nf(o.bat,1)} kWh`,`${o.fbat} kg CO₂ éq/kWh`],["Panneau photovoltaïque",`${o.pv} Wc`,`${nf(o.fpv,1)} kg CO₂ éq/Wc`]]);
  const ctx=`Une balise autonome de mesure de la qualité de l'eau du lagon est fabriquée en métropole, puis envoyée à Tahiti par avion : ${o.Mt} kg emballage compris, ${nf(o.d,0)} km, ${nf(o.fav,1)} kg CO₂ éq/(t·km). Fin de vie : ${o.fin} kg CO₂ éq. Pendant l'utilisation, son panneau solaire l'alimente : on néglige les émissions de cette phase. Exigence du cahier des charges : ${o.X} kg CO₂ éq au plus sur le cycle de vie.`;
  return [{data,ctx,q:"Calcule les émissions dues aux matériaux et composants de la balise.",type:"num",ans:o.Em,tolR:0.02,unit:CE,
      expl:`${F("émissions = quantité × FE")} pour chaque ligne : ${nf(o.al,1)} × ${nf(o.fa,1)} + ${nf(o.ab,1)} × ${nf(o.fb,1)} + ${nf(o.bat,1)} × ${o.fbat} + ${o.pv} × ${nf(o.fpv,1)} = ${U(o.Em,CE)}.`},
    {data,ctx,q:"Calcule les émissions du transport de la balise par avion.",type:"num",ans:o.Et,tolR:0.02,unit:CE,
      expl:`m = ${o.Mt} kg = ${nf(o.Mt/1000,3)} t. ${F("émissions = m·d·FE")} = ${nf(o.Mt/1000,3)} × ${nf(o.d,0)} × ${nf(o.fav,1)} = ${U(o.Et,CE)}.`},
    {data,ctx,q:"L'exigence d'impact du cahier des charges est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Total : ${S4(o.Em)} + ${S4(o.Et)} + ${o.fin} = ${nf(o.Etot,0)} kg CO₂ éq ${ok?"≤":">"} ${o.X} kg CO₂ éq : ${ok?"l'exigence est satisfaite.":`l'exigence n'est pas satisfaite. Par porte-conteneurs (18 000 km, 0,012 kg CO₂ éq/(t·km)), le transport n'émettrait que ${nf(Es,1)} kg CO₂ éq : le total passerait à ${nf(Tb,0)} kg CO₂ éq, ${Tb<=o.X?"ce qui respecterait l'exigence.":"encore au-dessus de l'exigence : il faudrait aussi réduire les matériaux."}`}`}]; },
/* centrale solaire sur un atoll : temps de retour carbone */
()=>{ const P=rnd([20,30,40,50,60]), f=rnd([900,1100,1300,1500]), Sb=rnd([60,80,100,120,150]), fb=rnd([80,90,100]), Tr=rnd([800,1000,1200,1500]), Y=rnd([1400,1500,1600]), fe=rnd([0.8,0.85,0.9,0.95]);
  const Ef=P*f+Sb*fb+Tr, A=P*Y*fe, t=Ef/A;
  const ctx=`Sur un atoll, une centrale solaire de ${P} kWc, avec des batteries de ${Sb} kWh, remplace une partie de la production d'un groupe électrogène diesel (${nf(fe,2)} kg CO₂ éq par kWh produit). Panneaux et onduleurs : ${nf(f,0)} kg CO₂ éq par kWc ; batteries : ${fb} kg CO₂ éq par kWh de capacité ; transport par cargo puis par goélette : ${nf(Tr,0)} kg CO₂ éq au total. Chaque kWc produit ${nf(Y,0)} kWh par an, que le groupe n'a plus à produire.`;
  return [{ctx,q:"Calcule les émissions dues à la fabrication et au transport de la centrale.",type:"num",ans:Ef,tolR:0.02,unit:CE,
      expl:`${P} × ${nf(f,0)} + ${Sb} × ${fb} + ${nf(Tr,0)} = ${nf(P*f,0)} + ${nf(Sb*fb,0)} + ${nf(Tr,0)} = ${U(Ef,CE)}.`},
    {ctx,q:"Quelles émissions la centrale fait-elle éviter chaque année ?",type:"num",ans:A,tolR:0.02,unit:CE,
      expl:`Énergie produite : ${P} × ${nf(Y,0)} = ${nf(P*Y,0)} kWh par an, qui ne sont plus produits au diesel. ${F("émissions évitées = E × FE")} = ${nf(P*Y,0)} × ${nf(fe,2)} = ${U(A,CE)} par an.`},
    {ctx,q:"Calcule le temps de retour carbone de la centrale.",type:"num",ans:t,tolR:0.02,unit:AN(t),
      expl:`${F(`t = ${FRAC("émissions de fabrication","émissions évitées par an")}`)} = ${FRAC(nf(Ef,0),nf(A,0))} = ${U(t,AN(t))}, soit environ ${nf(t*12,0)} mois, pour une durée de vie de 20 à 25 ans : la centrale évite bien plus qu'elle n'a coûté, même en comptant un ou deux remplacements des batteries.`}]; },
/* gourde ou bouteilles jetables : nombre d'utilisations pour que la gourde l'emporte */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const G=rnd([1.5,2,2.5,3]), l=rnd([5,10,15]), b=rnd([80,100,120,150]), f=rnd([2,3,4,5]), w=rnd([4,6,8,12,20,36]); const n=G*1000/(b-l); return {G,l,b,f,w,n,use:f*w}; },o=>net(o.n)&&far(o.use,o.n,0.15)&&(o.use>o.n)===tgt);
  const N=Math.ceil(o.n);
  const ctx=`Fabriquer une gourde en acier inoxydable émet ${nf(o.G,1)} kg CO₂ éq ; chaque lavage émet ${o.l} g CO₂ éq. Une bouteille d'eau jetable (fabrication, remplissage, transport, fin de vie) émet ${o.b} g CO₂ éq. Chaque utilisation de la gourde remplace une bouteille.`;
  return [{ctx,q:"Quelles émissions chaque utilisation de la gourde fait-elle éviter, lavage déduit, en g CO₂ éq ?",type:"num",ans:o.b-o.l,tolA:0,unit:"g CO₂ éq",
      expl:`Une bouteille évitée (${o.b} g) moins un lavage (${o.l} g) : ${F("gain = e_bouteille − e_lavage")} = ${o.b} − ${o.l} = ${U(o.b-o.l,"g CO₂ éq")}.`},
    {ctx,q:"Combien d'utilisations faut-il au minimum pour que la gourde ait un meilleur bilan que les bouteilles ?",type:"num",ans:N,tolA:0,unit:"utilisations",
      expl:`${nf(o.G,1)} kg = ${nf(o.G*1000,0)} g. ${F(`n = ${FRAC("émissions de fabrication","gain par utilisation")}`)} = ${FRAC(nf(o.G*1000,0),o.b-o.l)} = ${nf(o.n,2)}, arrondi à l'entier supérieur : ${U(N,"utilisations")}.`},
    {ctx,q:`Moana utilise sa gourde ${o.f} fois par semaine, puis la perd au bout de ${o.w} semaines. La gourde a-t-elle eu un meilleur bilan que des bouteilles jetables ?`,type:"ch",ch:YN,ok:tgt?0:1,
      expl:`${o.f} × ${o.w} = ${o.use} utilisations ${tgt?"≥":"<"} ${N} : ${tgt?"la fabrication de la gourde est remboursée ; chaque utilisation suivante est un gain net.":"la gourde n'a pas servi assez longtemps pour rembourser sa fabrication. Un objet réutilisable n'est favorable que s'il est vraiment réutilisé longtemps."}`}]; },
/* pièce de carrosserie en acier ou en aluminium : fabrication contre utilisation */
()=>{ const tgt=Math.random()<0.5;
  const o=draw(()=>{ const ms=rnd([8,10,12,15,20]), r=rnd([0.5,0.55,0.6]), fs=rnd([1.9,2.1,2.3]), fa=rnd([8.2,8.6,9]), c=rnd([0.3,0.35,0.4]), D=rnd([20000,30000,40000,150000,200000,250000]);
      const ma=r2(ms*r,1), Es=ms*fs, Ea=ma*fa, G=(ms-ma)/100*c*D/100*3.2; return {ms,r,fs,fa,c,D,ma,Es,Ea,G,dF:Ea-Es}; },o=>far(o.G,o.dF,0.12)&&(o.G>o.dF)===tgt);
  const use=o.D<=40000?`Cette voiture, louée sur une petite île, ne parcourra que ${nf(o.D,0)} km sur sa durée de vie.`:`Cette voiture parcourra ${nf(o.D,0)} km sur sa durée de vie.`;
  const ctx=`Pour une voiture, on compare deux versions d'un même ensemble de pièces de carrosserie : en acier (${o.ms} kg ; ${nf(o.fs,1)} kg CO₂ éq/kg) ou en aluminium primaire (${nf(o.ma,1)} kg ; ${nf(o.fa,1)} kg CO₂ éq/kg). Un allègement de 100 kg réduit la consommation de ${nf(o.c,2)} L/100 km ; gazole : 3,2 kg CO₂ éq par litre. ${use}`;
  return [{ctx,q:"Calcule le supplément d'émissions de fabrication de la version en aluminium, par rapport à la version en acier.",type:"num",ans:o.dF,tolR:0.02,unit:CE,
      expl:`Acier : ${o.ms} × ${nf(o.fs,1)} = ${S4(o.Es)} kg CO₂ éq ; aluminium : ${nf(o.ma,1)} × ${nf(o.fa,1)} = ${S4(o.Ea)} kg CO₂ éq. Supplément : ${S4(o.Ea)} − ${S4(o.Es)} = ${U(o.dF,CE)}.`},
    {ctx,q:"Quelles émissions l'allègement fait-il éviter pendant l'utilisation ?",type:"num",ans:o.G,tolR:0.02,unit:CE,
      expl:`Allègement : ${o.ms} − ${nf(o.ma,1)} = ${nf(o.ms-o.ma,1)} kg. Carburant économisé : ${FRAC(nf(o.ms-o.ma,1),100)} × ${nf(o.c,2)} × ${FRAC(nf(o.D,0),100)} = ${S4(o.G/3.2)} L. ${F("émissions = V × FE")} = ${S4(o.G/3.2)} × 3,2 = ${U(o.G,CE)}.`},
    {ctx,q:"Sur l'ensemble du cycle de vie, quelle version émet le moins ?",type:"ch",ch:["La version en aluminium","La version en acier"],ok:tgt?0:1,
      expl:`Le gain d'utilisation (${nf(o.G,1)} kg CO₂ éq) ${tgt?"dépasse":"ne compense pas"} le supplément de fabrication (${nf(o.dF,1)} kg CO₂ éq) : ${tgt?"l'aluminium l'emporte.":"l'acier l'emporte."} Plus un véhicule roule, plus l'allègement est rentable ; avec de l'aluminium recyclé, le supplément de fabrication serait bien plus faible.`}]; },
/* réparer ou remplacer un réfrigérateur */
()=>{ const tgt=Math.random()<0.5; /* vrai : remplacer émet le moins */
  const o=draw(()=>{ const loc=rnd([0,1]), fe=loc?rnd([0.05,0.06]):rnd([0.6,0.65,0.7]), Wo=rnd([350,400,450,500,600]), Wn=rnd([150,180,200,220]), r=rnd([30,40,50,60]), Fn=rnd([250,300,350,400]), N=rnd([5,8,10]);
      return {loc,fe,Wo,Wn,r,Fn,N,Er:r+N*Wo*fe,En:Fn+N*Wn*fe}; },o=>far(o.Er,o.En,0.08)&&(o.En<o.Er)===tgt);
  const ctx=`Le réfrigérateur d'une famille ${o.loc?"de métropole":"de Tahiti"}, qui consomme ${o.Wo} kWh par an, tombe en panne. Le réparer (compresseur neuf et intervention) émet ${o.r} kg CO₂ éq. Un réfrigérateur neuf, plus économe (${o.Wn} kWh par an), émet ${o.Fn} kg CO₂ éq pour sa fabrication et son transport. Électricité : ${nf(o.fe,2)} kg CO₂ éq/kWh. On compare les deux choix sur ${o.N} ans.`;
  return [{ctx,q:`Calcule les émissions sur ${o.N} ans si l'on répare l'ancien réfrigérateur.`,type:"num",ans:o.Er,tolR:0.02,unit:CE,
      expl:`${F("émissions = réparation + N·E·FE")} = ${o.r} + ${o.N} × ${o.Wo} × ${nf(o.fe,2)} = ${U(o.Er,CE)}.`},
    {ctx,q:`Calcule les émissions sur ${o.N} ans si l'on achète le réfrigérateur neuf.`,type:"num",ans:o.En,tolR:0.02,unit:CE,
      expl:`${F("émissions = fabrication + N·E·FE")} = ${o.Fn} + ${o.N} × ${o.Wn} × ${nf(o.fe,2)} = ${U(o.En,CE)}.`},
    {ctx,q:`Quel choix émet le moins sur ${o.N} ans ?`,type:"ch",ch:["Réparer l'ancien réfrigérateur","Acheter le réfrigérateur neuf"],ok:tgt?1:0,
      expl:`${nf(o.Er,0)} kg CO₂ éq en réparant, ${nf(o.En,0)} kg CO₂ éq en remplaçant : ${tgt?"il vaut mieux remplacer.":"il vaut mieux réparer."} La fabrication de l'ancien réfrigérateur est déjà faite : elle n'entre pas dans la comparaison. ${o.loc?(tgt?"Même avec une électricité peu carbonée, l'ancien appareil consomme tant que le remplacer est ici plus favorable.":"En métropole, l'électricité est peu carbonée : l'économie d'énergie du modèle neuf pèse peu face à sa fabrication."):(tgt?"À Tahiti, l'électricité est très carbonée : l'économie d'énergie du modèle neuf pèse lourd.":"Ici, l'économie d'énergie du modèle neuf ne compense pas sa fabrication en "+o.N+" ans.")}`}]; },
/* repérer l'erreur d'un élève */
()=>{ const v=rnd([0,1,2,3,4,5,6]); let ctx, st, bad, why;
  if(v===0){ const m=rnd([400,600,800,1200]), d=rnd([10500,17000,18000]), fe=rnd([0.01,0.012,0.015]), E=m*d*fe;
    ctx=`Émissions du transport de ${nf(m,0)} kg de matériel sur ${nf(d,0)} km par porte-conteneurs (${nf(fe,3)} kg CO₂ éq/(t·km)).`;
    st=["émissions = m·d·FE",`émissions = ${nf(m,0)} × ${nf(d,0)} × ${nf(fe,3)} = ${nf(E,0)} kg CO₂ éq`,`Le transport émet donc ${nf(E/1000,1)} t CO₂ éq.`]; bad=1;
    why=`Le facteur d'émission est donné par tonne et par kilomètre : m = ${nf(m,0)} kg = ${nf(m/1000,1)} t, d'où ${nf(m/1000,1)} × ${nf(d,0)} × ${nf(fe,3)} = ${nf(E/1000,1)} kg CO₂ éq, mille fois moins.`; }
  else if(v===1){ const Fa=rnd([700,800,900]), Tr=rnd([40,50,60]), Us=rnd([2200,2400,2600]), Fv=rnd([20,30,40]), tot=Fa+Tr+Us+Fv, t3=Fa+Us+Fv;
    ctx=`Part de l'utilisation dans le bilan d'un scooter thermique : matières et fabrication ${Fa}, transport ${Tr}, utilisation ${nf(Us,0)}, fin de vie ${Fv} (kg CO₂ éq).`;
    st=[`Total : ${Fa} + ${nf(Us,0)} + ${Fv} = ${nf(t3,0)} kg CO₂ éq`,`Part de l'utilisation : ${FRAC(nf(Us,0),nf(t3,0))} × 100 = ${nf(Us/t3*100,1)} %`,"L'utilisation est bien la phase dominante."]; bad=0;
    why=`Le total oublie le transport : ${Fa} + ${Tr} + ${nf(Us,0)} + ${Fv} = ${nf(tot,0)} kg CO₂ éq, d'où une part de ${FRAC(nf(Us,0),nf(tot,0))} × 100 = ${nf(Us/tot*100,1)} %.`; }
  else if(v===2){ const Eg=rnd([800,900,1000]), Ea=rnd([520,560,600]);
    ctx=`Temps de retour énergétique d'un panneau photovoltaïque : énergie grise ${nf(Eg,0)} kWh, production ${Ea} kWh par an.`;
    st=[`t = ${FRAC("énergie produite par an","énergie grise")}`,`t = ${FRAC(Ea,nf(Eg,0))} = ${nf(Ea/Eg,2)} an`,`Soit environ ${nf(Ea/Eg*12,0)} mois.`]; bad=0;
    why=`La relation est inversée : ${F(`t = ${FRAC("énergie grise","énergie produite par an")}`)} = ${FRAC(nf(Eg,0),Ea)} = ${nf(Eg/Ea,2)} ${AN(Eg/Ea)}. Contrôle d'unité : des kWh divisés par des kWh par an donnent des années.`; }
  else if(v===3){ const A=rnd([2400,2800,3200]), B=r2(A*rnd([0.62,0.7,0.75]),-1);
    ctx=`Écart relatif entre les émissions de la solution B (${nf(B,0)} kg CO₂ éq) et de la solution A (${nf(A,0)} kg CO₂ éq), en prenant A comme référence.`;
    st=[`Écart : |${nf(B,0)} − ${nf(A,0)}| = ${nf(A-B,0)} kg CO₂ éq`,`Écart relatif : ${FRAC(nf(A-B,0),nf(B,0))} × 100 = ${nf((A-B)/B*100,1)} %`,`B émet donc ${nf((A-B)/B*100,1)} % de moins que A.`]; bad=1;
    why=`La référence est A : ${FRAC(nf(A-B,0),nf(A,0))} × 100 = ${nf((A-B)/A*100,1)} %. Il faut toujours diviser par la référence annoncée.`; }
  else if(v===4){ const W=rnd([200,250,300]), fe=rnd([50,60]);
    ctx=`Émissions annuelles d'un réfrigérateur qui consomme ${W} kWh par an, avec un facteur d'émission de ${fe} g CO₂ éq/kWh.`;
    st=["émissions = E × FE",`émissions = ${W} × ${fe} = ${nf(W*fe,0)} kg CO₂ éq par an`,`Sur 10 ans : ${nf(W*fe*10,0)} kg CO₂ éq.`]; bad=1;
    why=`Le facteur d'émission est en grammes : ${W} × ${fe} = ${nf(W*fe,0)} g CO₂ éq, soit ${nf(W*fe/1000,1)} kg CO₂ éq par an.`; }
  else if(v===5){ const F0=rnd([200,250,300]), u=rnd([20,25,30]), N=rnd([4,5,6]);
    ctx=`Émissions par année d'utilisation d'un ordinateur portable : fabrication ${F0} kg CO₂ éq, utilisation ${u} kg CO₂ éq par an, durée de vie ${N} ans.`;
    st=[`Émissions sur la durée de vie : ${F0} + ${u} = ${F0+u} kg CO₂ éq`,`Par année : ${FRAC(F0+u,N)} = ${nf((F0+u)/N,1)} kg CO₂ éq`,"On compare ensuite ce résultat à l'exigence du cahier des charges."]; bad=0;
    why=`L'utilisation dure ${N} ans : ${F0} + ${N} × ${u} = ${F0+N*u} kg CO₂ éq, soit ${FRAC(F0+N*u,N)} = ${nf((F0+N*u)/N,1)} kg CO₂ éq par année.`; }
  else { const m=rnd([2,2.5,3]), fp=rnd([8.2,8.6]), fr=rnd([0.6,0.8]), tau=rnd([40,50,60]), t=tau/100, mr=m*t, mp=m-mr;
    ctx=`Émissions dues à ${nf(m,1)} kg d'aluminium qui contient ${tau} % de recyclé (primaire : ${nf(fp,1)} kg CO₂ éq/kg ; recyclé : ${nf(fr,1)} kg CO₂ éq/kg).`;
    st=[`Masse recyclée : ${nf(mr,2)} kg ; masse primaire : ${nf(mp,2)} kg`,`émissions = ${nf(mr,2)} × ${nf(fp,1)} + ${nf(mp,2)} × ${nf(fr,1)} = ${nf(mr*fp+mp*fr,2)} kg CO₂ éq`,`Soit ${nf((mr*fp+mp*fr)/m,2)} kg CO₂ éq par kilogramme d'aluminium.`]; bad=1;
    why=`Les facteurs d'émission sont inversés : la masse recyclée va avec le facteur du recyclé. ${nf(mr,2)} × ${nf(fr,1)} + ${nf(mp,2)} × ${nf(fp,1)} = ${nf(mr*fr+mp*fp,2)} kg CO₂ éq.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* phase dominante selon le mix électrique : Tahiti ou métropole */
()=>{ const s=rnd([{p:"un réfrigérateur utilisé 12 ans",N:12,F:[250,300,350],Tr:[30,40,50],V:[20,30,40],W:[200,250,300]},{p:"un climatiseur utilisé 10 ans",N:10,F:[350,400,450],Tr:[40,50,60],V:[150,200,250],W:[1200,1500,1800]}]);
  const o=draw(()=>{ const F0=rnd(s.F), Tr=rnd(s.Tr), Vf=rnd(s.V), W=rnd(s.W), fT=rnd([0.6,0.65,0.7]), fM=rnd([0.05,0.06]); const UT=s.N*W*fT, UM=s.N*W*fM; return {F0,Tr,Vf,W,fT,fM,UT,UM}; },o=>far(o.UM,o.F0,0.15)&&o.UM>=1.15*o.Vf);
  const tot=o.F0+o.Tr+o.UT+o.Vf, r=o.UT/tot*100, dm=o.UM>o.F0?2:0, C=["Les matières et la fabrication","Le transport","L'utilisation","La fin de vie"];
  const ctx=`Analyse du cycle de vie d'${s.p} : matières et fabrication ${o.F0} kg CO₂ éq ; transport ${o.Tr} kg CO₂ éq ; fin de vie ${o.Vf} kg CO₂ éq ; consommation ${nf(o.W,0)} kWh par an. Facteur d'émission de l'électricité : ${nf(o.fT,2)} kg CO₂ éq/kWh à Tahiti, ${nf(o.fM,2)} kg CO₂ éq/kWh en métropole.`;
  return [{ctx,q:`Calcule les émissions dues à l'utilisation à Tahiti, sur ${s.N} ans.`,type:"num",ans:o.UT,tolR:0.02,unit:CE,
      expl:`${F("émissions = N·E·FE")} = ${s.N} × ${nf(o.W,0)} × ${nf(o.fT,2)} = ${U(o.UT,CE)}.`},
    {ctx,q:"Quelle part des émissions totales l'utilisation représente-t-elle à Tahiti, en % ?",type:"num",ans:r,tolA:0.3,unit:"%",
      expl:`Total : ${o.F0} + ${o.Tr} + ${S4(o.UT)} + ${o.Vf} = ${S4(tot)} kg CO₂ éq. ${F(`part = ${FRAC("émissions de la phase","émissions totales")} × 100`)} = ${FRAC(S4(o.UT),S4(tot))} × 100 = ${U(r,"%")}.`},
    {ctx,q:"En métropole, avec les mêmes données, quelle serait la phase dominante ?",type:"ch",ch:C,ok:dm,
      expl:`En métropole : ${s.N} × ${nf(o.W,0)} × ${nf(o.fM,2)} = ${nf(o.UM,0)} kg CO₂ éq pour l'utilisation, ${dm?"plus":"moins"} que les ${o.F0} kg CO₂ éq des matières et de la fabrication : la phase dominante serait ${F(C[dm].toLowerCase())}. ${dm?"L'appareil consomme tant que l'utilisation domine partout : réduire sa consommation reste la priorité.":"La priorité d'éco-conception change avec le mix : à Tahiti, réduire la consommation ; en métropole, allonger la durée de vie et réduire la matière."}`}]; },
/* pièce cassée : impression 3D sur place ou importation, sous contrainte de délai */
()=>{ const lng=Math.random()<0.5, tgt=lng?rnd([0,2]):0;
  const o=draw(()=>{ const m=rnd([0.2,0.3,0.4,0.5,0.6,0.8]), fi=rnd([4.5,5,5.5,6]), da=rnd([16000,17000]), fa=rnd([0.8,1]), ds=rnd([17000,18000]), fs=rnd([0.01,0.012,0.015]), fm=rnd([3.2,3.5]), pl=rnd([5,10,20]), rate=rnd([30,40,50,60]), Pw=rnd([0.12,0.15,0.2]), fe=rnd([0.6,0.65,0.7]), J=lng?rnd([60,75,90]):rnd([8,10,12,15]);
      const th=r2(m*1000/rate,1), Ea=m*fi+m/1000*da*fa, Es=m*fi+m/1000*ds*fs, El=m*(1+pl/100)*fm+th*Pw*fe, E=[El,Ea,Es], okk=[true,J>=6,J>=45], ids=[0,1,2].filter(i=>okk[i]), best=ids.reduce((a,i)=>E[i]<E[a]?i:a,ids[0]);
      const clear=ids.every(i=>i===best||far(E[i],E[best],0.08)); return {m,fi,da,fa,ds,fs,fm,pl,rate,Pw,fe,J,th,Ea,Es,El,E,best,clear}; },o=>o.clear&&o.best===tgt);
  const C=["Imprimer la pièce sur place","Importer la pièce par avion","Importer la pièce par cargo"];
  const data=tabL(["Solution","Données","Délai"],[["Importation par avion",`fabrication industrielle : ${nf(o.fi,1)} kg CO₂ éq par kg de pièce ; ${nf(o.da,0)} km à ${nf(o.fa,1)} kg CO₂ éq/(t·km)`,"6 jours"],["Importation par cargo",`même fabrication ; ${nf(o.ds,0)} km à ${nf(o.fs,3)} kg CO₂ éq/(t·km)`,"45 jours"],["Impression 3D sur place",`ABS : ${nf(o.fm,1)} kg CO₂ éq/kg, plus ${o.pl} % de matière perdue (supports, réglages) ; ${nf(o.th,1)} h d'impression à ${nf(o.Pw,2)} kW ; électricité : ${nf(o.fe,2)} kg CO₂ éq/kWh`,"2 jours"]]);
  const ctx=`Le support en plastique ABS (${nf(o.m,1)} kg) du moteur d'un bateau de pêche de Raiatea est cassé. Trois solutions sont possibles pour le remplacer.`;
  return [{data,ctx,q:"Calcule les émissions de la pièce importée par avion (fabrication et transport).",type:"num",ans:o.Ea,tolR:0.02,unit:CE,
      expl:`Fabrication : ${nf(o.m,1)} × ${nf(o.fi,1)} = ${nf(o.m*o.fi,2)} kg CO₂ éq. Transport : ${nf(o.m/1000,4)} t × ${nf(o.da,0)} km × ${nf(o.fa,1)} = ${nf(o.m/1000*o.da*o.fa,2)} kg CO₂ éq. Total : ${U(o.Ea,CE)}.`},
    {data,ctx,q:"Calcule les émissions de la pièce imprimée sur place (matière, pertes comprises, et électricité).",type:"num",ans:o.El,tolR:0.02,unit:CE,
      expl:`Matière : ${nf(o.m,1)} × ${nf(1+o.pl/100,2)} × ${nf(o.fm,1)} = ${nf(o.m*(1+o.pl/100)*o.fm,3)} kg CO₂ éq. Électricité : ${nf(o.th,1)} h × ${nf(o.Pw,2)} kW = ${nf(o.th*o.Pw,3)} kWh, × ${nf(o.fe,2)} = ${nf(o.th*o.Pw*o.fe,3)} kg CO₂ éq. Total : ${U(o.El,CE)}.`},
    {data,ctx,q:`Le bateau doit reprendre la mer dans ${o.J} jours. Quelle solution faut-il retenir pour émettre le moins possible ?`,type:"ch",ch:C,ok:o.best,
      expl:`Émissions : sur place ${nf(o.El,2)} ; avion ${nf(o.Ea,2)} ; cargo ${nf(o.m*o.fi,2)} + ${nf(o.m/1000*o.ds*o.fs,3)} = ${nf(o.Es,2)} kg CO₂ éq. Délai de ${o.J} jours : ${o.J>=45?"les trois solutions conviennent":"le cargo (45 jours) est éliminé"}. La moins émettrice des solutions possibles est ${F(C[o.best].toLowerCase())}.${o.best===2?" Produire sur place n'est pas toujours le plus sobre : l'électricité de l'île est très carbonée et l'impression perd de la matière.":""}`}]; },
/* climatisation : sobriété ou efficacité */
()=>{ const tgt=Math.random()<0.5; /* vrai : la sobriété l'emporte */
  const o=draw(()=>{ const W=rnd([1200,1500,1800,2200]), p=rnd([6,7,8]), q=rnd([25,30,35,40]), F0=rnd([350,450,550,650]), N=rnd([3,5,8]), fe=rnd([0.6,0.65,0.7]);
      const Sy=W*4*p/100*fe, Ef=N*W*q/100*fe-F0; return {W,p,q,F0,N,fe,Sy,SN:Sy*N,Ef}; },o=>o.Ef>0&&far(o.SN,o.Ef,0.1)&&(o.SN>o.Ef)===tgt);
  const ctx=`Une salle de classe climatisée à 22 °C consomme ${nf(o.W,0)} kWh par an. On admet que chaque degré de consigne en plus réduit la consommation de ${o.p} % de cette valeur. Deux actions sont envisagées : régler la consigne à 26 °C (sobriété) ; ou garder 22 °C avec un nouveau climatiseur qui consomme ${o.q} % de moins (efficacité), dont la fabrication et le transport émettent ${o.F0} kg CO₂ éq. Électricité : ${nf(o.fe,2)} kg CO₂ éq/kWh.`;
  return [{ctx,q:"Quelles émissions la sobriété (consigne à 26 °C) fait-elle éviter chaque année ?",type:"num",ans:o.Sy,tolR:0.02,unit:CE,
      expl:`4 degrés × ${o.p} % = ${4*o.p} % d'économie : ${nf(o.W,0)} × ${nf(4*o.p/100,2)} = ${nf(o.W*4*o.p/100,0)} kWh par an. ${F("émissions évitées = E × FE")} = ${nf(o.W*4*o.p/100,0)} × ${nf(o.fe,2)} = ${U(o.Sy,CE)} par an.`},
    {ctx,q:`Quelles émissions le nouveau climatiseur fait-il éviter sur ${o.N} ans, fabrication déduite ?`,type:"num",ans:o.Ef,tolR:0.02,unit:CE,
      expl:`Économie : ${nf(o.W,0)} × ${nf(o.q/100,2)} = ${nf(o.W*o.q/100,0)} kWh par an. Sur ${o.N} ans : ${o.N} × ${nf(o.W*o.q/100,0)} × ${nf(o.fe,2)} − ${o.F0} = ${U(o.Ef,CE)}.`},
    {ctx,q:`Sur ${o.N} ans, quelle action fait éviter le plus d'émissions ?`,type:"ch",ch:["La sobriété : consigne à 26 °C","L'efficacité : nouveau climatiseur à 22 °C"],ok:tgt?0:1,
      expl:`Sobriété : ${o.N} × ${S4(o.Sy)} = ${nf(o.SN,0)} kg CO₂ éq ; efficacité : ${nf(o.Ef,0)} kg CO₂ éq. ${tgt?"La sobriété l'emporte, sans rien fabriquer.":"Le nouveau climatiseur l'emporte, malgré sa fabrication."} Les deux se cumulent : un climatiseur efficace réglé à 26 °C ferait encore mieux.`}]; },
/* durée d'utilisation minimale pour respecter une exigence d'empreinte annuelle */
()=>{ const o=draw(()=>{ const F0=rnd([200,250,300,350]), W=rnd([30,40,50]), fe=rnd([0.6,0.65,0.7]), X=rnd([60,70,80,90,100]), L0=rnd([3,4]); const u=W*fe, e0=F0/L0+u, n=F0/(X-u); return {F0,W,fe,X,L0,u,e0,n}; },
    o=>o.X-o.u>=15&&o.e0>o.X&&far(o.e0,o.X,0.08)&&net(o.n)&&o.n>o.L0&&o.n<=8);
  const N=Math.ceil(o.n), eN1=o.F0/(N-1)+o.u;
  const ctx=`Le lycée renouvelle ses ordinateurs portables tous les ${o.L0} ans. Fabrication et transport d'un ordinateur : ${o.F0} kg CO₂ éq ; consommation : ${o.W} kWh par an ; électricité : ${nf(o.fe,2)} kg CO₂ éq/kWh. Le plan climat du lycée fixe une exigence : ${o.X} kg CO₂ éq au plus par ordinateur et par année d'utilisation.`;
  return [{ctx,q:"Calcule les émissions par ordinateur et par année d'utilisation, avec le renouvellement actuel.",type:"num",ans:o.e0,tolR:0.02,unit:"kg CO₂ éq/an",
      expl:`Utilisation : ${o.W} × ${nf(o.fe,2)} = ${nf(o.u,1)} kg CO₂ éq par an. ${F(`e = ${FRAC("F","n")} + u`)} = ${FRAC(o.F0,o.L0)} + ${nf(o.u,1)} = ${U(o.e0,"kg CO₂ éq/an")}, au-dessus de l'exigence (${o.X}).`},
    {ctx,q:"Quelle durée d'utilisation minimale, en années entières, permet de respecter l'exigence ?",type:"num",ans:N,tolA:0,unit:"ans",
      expl:`Il faut ${FRAC(o.F0,"n")} + ${nf(o.u,1)} ≤ ${o.X}, soit ${F(`n ≥ ${FRAC("F","X − u")}`)} = ${FRAC(o.F0,nf(o.X-o.u,1))} = ${nf(o.n,2)}. On arrondit à l'entier supérieur : ${U(N,"ans")} (avec ${N-1} ans : ${nf(eN1,1)} kg CO₂ éq par an, trop).`},
    {ctx,q:"Quelle solution de conception aide le plus à atteindre cette durée d'utilisation ?",type:"ch",...mc("Batterie, disque et clavier remplaçables, avec des pièces détachées disponibles",["Un boîtier plus fin, assemblé par collage","Une batterie soudée à la carte mère pour gagner de la place","Un nouveau modèle proposé chaque année"]),
      expl:`Pour qu'un ordinateur dure ${N} ans, il doit être ${F("réparable")} : pièces d'usure remplaçables (batterie, disque, clavier), pièces détachées et documentation disponibles. Collage et soudure empêchent la réparation.`}]; },
/* effet rebond : éclairage à LED */
()=>{ const o=draw(()=>{ const n=rnd([40,60,80]), P1=rnd([35,50]), P2=rnd([5,7]), h1=rnd([5,6]), k=rnd([1.2,1.5,1.8]), h2=rnd([8,10,12]), n2=Math.round(n*k);
      const B=n*P1*h1*0.365, Pl=n*P2*h1*0.365, A=n2*P2*h2*0.365; return {n,P1,P2,h1,n2,h2,B,Pl,A,sh:(B-A)/(B-Pl)*100}; },o=>o.sh>=20&&o.sh<=90);
  const ctx=`Un hôtel éclaire son jardin avec ${o.n} lampes halogènes de ${o.P1} W, allumées ${o.h1} h chaque soir. Il les remplace par des lampes à LED de ${o.P2} W qui éclairent autant. Mais, l'éclairage ne coûtant presque plus rien, l'hôtel installe ensuite ${o.n2} lampes à LED et les laisse allumées ${o.h2} h chaque soir.`;
  return [{ctx,q:"Quelle économie d'énergie annuelle le remplacement des lampes permettait-il, sans changer l'usage ?",type:"num",ans:o.B-o.Pl,tolR:0.02,unit:"kWh",
      expl:`${F("E = n·P·t")} sur un an : halogènes ${o.n} × ${o.P1} W × ${o.h1} h × 365 = ${nf(o.B*1000,0)} Wh, soit ${nf(o.B,0)} kWh ; LED ${o.n} × ${o.P2} W × ${o.h1} h × 365 = ${nf(o.Pl*1000,0)} Wh, soit ${nf(o.Pl,0)} kWh. Économie prévue : ${U(o.B-o.Pl,"kWh")} par an.`},
    {ctx,q:"Quelle est la consommation annuelle réelle de l'éclairage après les changements d'usage ?",type:"num",ans:o.A,tolR:0.02,unit:"kWh",
      expl:`${o.n2} × ${o.P2} W × ${o.h2} h × 365 = ${nf(o.A*1000,0)} Wh, soit ${U(o.A,"kWh")} par an.`},
    {ctx,q:"Quelle part de l'économie prévue est réellement obtenue, en % ?",type:"num",ans:o.sh,tolA:0.5,unit:"%",
      expl:`Économie réelle : ${nf(o.B,0)} − ${nf(o.A,0)} = ${nf(o.B-o.A,0)} kWh. ${F(`part = ${FRAC("économie réelle","économie prévue")} × 100`)} = ${FRAC(nf(o.B-o.A,0),nf(o.B-o.Pl,0))} × 100 = ${U(o.sh,"%")}. C'est l'${F("effet rebond")} : un gain d'efficacité est en partie absorbé par un usage accru. La sobriété (minuterie, détecteurs) évite ce piège.`}]; }
];

POOLS["dd-environnement"]={
  titre:"Cycle de vie, bilan carbone",
  fiche:{t:"Impact environnemental",l:[
    `ACV : extraction des matières, fabrication, transport, utilisation, fin de vie ; on agit d'abord sur la ${F("phase dominante")}, celle qui émet le plus.`,
    `Bilan carbone : ${F("émissions = quantité × FE")} en kg CO₂ éq (FE donné) ; transport : ${F("émissions = m·d·FE")}, m en t et d en km.`,
    `Comparer à service rendu égal (${F("unité fonctionnelle")} : par an, par km, par kWh) ; part d'une phase : ${F(`${FRAC("émissions de la phase","total")} × 100`)}.`,
    `Énergie grise : ${F("tout le cycle de vie sauf l'utilisation")} ; temps de retour ${F(`t = ${FRAC("énergie grise","énergie gagnée par an")}`)}, de même en CO₂.`,
    "Pièges : kg au lieu de t dans les t·km, g ou kg de CO₂, une phase oubliée, des durées de vie différentes ; leviers : sobriété, allègement, réparabilité, recyclage."]},
  count:{1:4,2:4,3:3},1:DD1,2:DD2,3:DD3
};

})();
