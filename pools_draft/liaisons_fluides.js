/* Réservoirs : liaisons et schéma cinématique (meca-liaisons), fluides en SI (meca-fluides), fluides en sciences physiques (phy-fluides).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_lia_, fx_flu_ et fx_pf_. */
(function(){
"use strict";

/* ===== outils locaux ===== */
/* affichage à 3 chiffres significatifs, identique au contrôle de la page */
const S3=x=>{ const v=Number.isInteger(x)?x:Math.abs(x)>=100?Math.round(x):Number(x.toPrecision(3)); return v.toLocaleString("fr-FR",{maximumFractionDigits:6}); };
const U=(x,u)=>F(`${S3(x)}${u?" "+u:""}`);
/* tirage avec condition (évite les conclusions à la limite) */
const draw=(gen,ok)=>{ for(let i=0;i<20000;i++){ const v=gen(); if(ok(v)) return v; } throw new Error("tirage impossible"); };
const far=(x,ref,r)=>Math.abs(x-ref)/Math.abs(ref)>=(r||0.05);
const YN=["Oui","Non"];
const OL=st=>`<ol style="margin:0;padding-left:1.4em">${st.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const pick=(a,n)=>shuffle(a).slice(0,n);
/* puissance de dix et écriture scientifique avec le vrai signe moins : 2,35 × 10<sup>−4</sup> */
const p10=e=>`10<sup>${e<0?"−"+(-e):e}</sup>`;
const sci=(x,d)=>{ d=d==null?2:d; let e=Math.floor(Math.log10(Math.abs(x))), m=Number((x/Math.pow(10,e)).toFixed(d)); if(Math.abs(m)>=10){ m/=10; e++; } return e===0?nf(m,d):`${nf(m,d)} × ${p10(e)}`; };

/* ===== outils de dessin ===== */
const pol=(c,r,a)=>[c[0]+r*Math.cos(rad(a)),c[1]-r*Math.sin(rad(a))];            /* a en degrés, sens trigo, y écran vers le bas */
const arcP=(c,r,a0,a1,cls,m)=>{ const p0=pol(c,r,a0), p1=pol(c,r,a1); return `<path d="M${P2(p0)} A${r} ${r} 0 ${Math.abs(a1-a0)>180?1:0} ${a1>a0?0:1} ${P2(p1)}" class="${cls||"v-cote"}"${m?` marker-end="url(#m-${m})"`:""}/>`; };
const unit=(p,q)=>{ const dx=q[0]-p[0], dy=q[1]-p[1], n=Math.hypot(dx,dy); return [dx/n,dy/n]; };
const slab=(p,q,w,cls)=>{ const u=unit(p,q), n=[-u[1]*w,u[0]*w]; return `<polygon points="${P2([p[0]+n[0],p[1]+n[1]])} ${P2([q[0]+n[0],q[1]+n[1]])} ${P2([q[0]-n[0],q[1]-n[1]])} ${P2([p[0]-n[0],p[1]-n[1]])}" class="${cls||"v-body"}"/>`; };
const vcote=(x,y1,y2,t,a)=>`<line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+(t?Th(x+(a==="end"?-6:6),(y1+y2)/2+4,t,"v-cap",a||"start"):"");
const dot=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="4" class="v-dot"/>`;
const pgon=(pts,st)=>`<polygon points="${pts.map(P2).join(" ")}" style="${st}"/>`;
const pline=(pts,st)=>`<polyline points="${pts.map(P2).join(" ")}" style="${st}"/>`;
const sg=(a,b,st)=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" style="${st}"/>`;
/* texte avec un liseré couleur papier (lisible par-dessus un trait) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;

/* ======================================================================
   FIGURES : LIAISONS (préfixe fx_lia_)
   ====================================================================== */
/* perspective cavalière : x vers la droite, z vers le haut, y fuyant à 30° (coefficient 0,5) ; o : point écran de l'origine */
const PJ=(o,p)=>[o[0]+p[0]+0.433*p[1],o[1]-p[2]-0.25*p[1]];
const E3={x:[1,0,0],y:[0,1,0],z:[0,0,1]}, PERP={x:[[0,1,0],[0,0,1]],y:[[1,0,0],[0,0,1]],z:[[1,0,0],[0,1,0]]}, AI={x:0,y:1,z:2};
const V3=(a,b,k)=>[a[0]+k*b[0],a[1]+k*b[1],a[2]+k*b[2]];
const VIS=n=>0.433*n[0]-n[1]+0.25*n[2]>1e-9;                                     /* normale tournée vers l'observateur */
const ST1="fill:var(--paper-2);stroke:var(--ink);stroke-width:1.5", ST2="fill:var(--paper);stroke:var(--accent);stroke-width:1.8";
const LN1="stroke:var(--ink);stroke-width:1.8;fill:none", LN2="stroke:var(--accent);stroke-width:2.6;fill:none";
function ring3(o,c,u,r){ const [a,b]=PERP[u], out=[]; for(let i=0;i<44;i++){ const t=2*Math.PI*i/44, ct=Math.cos(t), st=Math.sin(t);
  out.push(PJ(o,[c[0]+r*(ct*a[0]+st*b[0]),c[1]+r*(ct*a[1]+st*b[1]),c[2]+r*(ct*a[2]+st*b[2])])); } return out; }
/* cylindre d'axe u (x, y ou z), centré en c, de longueur len et de rayon r. open : tube transparent, renvoyé en deux couches {back, front} */
function cyl3(o,c,u,len,r,st,open){
  const A=E3[u], c0=V3(c,A,-len/2), c1=V3(c,A,len/2), R0=ring3(o,c0,u,r), R1=ring3(o,c1,u,r), s0=PJ(o,c0), s1=PJ(o,c1);
  const dx=s1[0]-s0[0], dy=s1[1]-s0[1], nd=Math.hypot(dx,dy)||1, n=[-dy/nd,dx/nd], pr=p=>(p[0]-s0[0])*n[0]+(p[1]-s0[1])*n[1];
  let im=0, iM=0; R0.forEach((p,i)=>{ if(pr(p)<pr(R0[im])) im=i; if(pr(p)>pr(R0[iM])) iM=i; });
  const near=u==="y"?R0:R1, back=u==="y"?R1:R0;
  const edge=(st.match(/stroke:[^;]*/)||["stroke:var(--ink)"])[0]+";"+(st.match(/stroke-width:[^;]*/)||["stroke-width:1.5"])[0]+";fill:none";
  const fill=(st.match(/fill:[^;]*/)||["fill:none"])[0];
  if(open) return {back:pgon(back,edge)+pgon([R0[iM],R1[iM],R1[im],R0[im]],"fill:var(--accent);fill-opacity:.07;stroke:none")+sg(R0[iM],R1[iM],edge)+sg(R0[im],R1[im],edge),front:pgon(near,edge)};
  return pgon(back,st)+pgon([R0[iM],R1[iM],R1[im],R0[im]],fill+";stroke:none")+sg(R0[iM],R1[iM],edge)+sg(R0[im],R1[im],edge)+pgon(near,st);
}
/* parallélépipède [x0, x1, y0, y1, z0, z1] : faces visibles (avant, dessus, droite) */
function box3(o,b,st){ const [x0,x1,y0,y1,z0,z1]=b, P=(x,y,z)=>PJ(o,[x,y,z]);
  return pgon([P(x0,y0,z0),P(x1,y0,z0),P(x1,y0,z1),P(x0,y0,z1)],st)+pgon([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],st)+pgon([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],st); }
/* sphère (solide 2) : cercle et équateur en tirets */
const sph=(c,r)=>`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r}" style="${ST2}"/><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${r}" ry="${(r*0.32).toFixed(1)}" style="stroke:var(--accent);stroke-width:1;fill:none;stroke-dasharray:3 3"/>`;
/* filet d'une vis tracé sur la partie visible d'un cylindre */
function helix3(o,c,u,len,r){ const A=E3[u], [a,b]=PERP[u], stl="stroke:var(--ink);stroke-width:1.6;fill:none"; let out="", seg=[];
  for(let i=0;i<=180;i++){ const t=-len/2+len*i/180, th=2*Math.PI*1.6*i/180, ct=Math.cos(th), st=Math.sin(th), nr=[ct*a[0]+st*b[0],ct*a[1]+st*b[1],ct*a[2]+st*b[2]];
    if(VIS(nr)) seg.push(PJ(o,V3(V3(c,A,t),nr,r))); else { if(seg.length>1) out+=pline(seg,stl); seg=[]; } }
  if(seg.length>1) out+=pline(seg,stl); return out; }
/* symbole normalisé en perspective de la liaison k (axe ou normale u), centré sur le point écran o.
   Solide 1 : noir et gris, relié à un bâti hachuré ; solide 2 : bleu. */
function sym3(k,o,u){
  u=u||(k==="ap"||k==="pon"||k==="lr"?"z":"x");
  const A=E3[u], nS=u==="y"?-1:1, C0=[0,0,0], at=p=>PJ(o,p), dn=u==="z"?[-1,0,0]:[0,0,-1];
  const base=(p,len)=>{ const a=at(p), b=at(V3(p,dn,len)); return sg(a,b,LN1)+(u==="z"?wall(b[0],b[1]-14,b[1]+14):ground(b[0]-16,b[0]+16,b[1])); };
  let s="";
  if(k==="piv"||k==="pg"||k==="hel"){
    const Lh=46, r=13, La=64;
    s+=sg(at(V3(C0,A,-nS*La)),at(C0),LN2);
    if(k==="piv") s+=cyl3(o,V3(C0,A,-nS*(Lh/2+5)),u,3,7,ST2);
    s+=cyl3(o,C0,u,Lh,r,ST1);
    if(k==="hel") s+=helix3(o,C0,u,Lh,r);
    s+=sg(at(V3(C0,A,nS*Lh/2)),at(V3(C0,A,nS*La)),LN2);
    if(k==="piv") s+=cyl3(o,V3(C0,A,nS*(Lh/2+5)),u,3,7,ST2);
    return s+base(V3(C0,dn,r),22);
  }
  if(k==="gli"){
    const i=AI[u], rg=(w,lo,hi)=>{ const r=[[-w,w],[-w,w],[-w,w]]; r[i]=[lo,hi]; return [r[0][0],r[0][1],r[1][0],r[1][1],r[2][0],r[2][1]]; };
    const fr=nS>0?[-64,-24]:[24,64], nr=nS>0?[24,64]:[-64,-24];
    s+=box3(o,rg(6,fr[0],fr[1]),ST2)+box3(o,rg(15,-24,24),ST1)+box3(o,rg(6,nr[0],nr[1]),ST2);
    return s+base(V3(C0,dn,15),22);
  }
  if(k==="rot"){
    s+=`<path d="M${P2(pol(o,21,38))} A21 21 0 1 0 ${P2(pol(o,21,322))}" style="${LN1};stroke-width:2.2"/>`+sg([o[0]-21,o[1]],[o[0]-60,o[1]],LN1)+wall(o[0]-60,o[1]-14,o[1]+14);
    return s+sph(o,14)+sg([o[0]+14,o[1]],[o[0]+64,o[1]],LN2);
  }
  if(k==="la"){
    const t=cyl3(o,C0,"x",96,19,ST1,true);
    s+=t.back+sph(o,17)+sg(at([17,0,0]),at([76,0,0]),LN2)+t.front;
    return s+sg(at([-30,0,-19]),at([-30,0,-40]),LN1)+ground(at([-30,0,-40])[0]-16,at([-30,0,-40])[0]+16,at([-30,0,-40])[1]);
  }
  /* liaisons avec un plan (solide 1) : appui plan, ponctuelle, linéaire rectiligne */
  s+=box3(o,[-58,58,-32,32,-7,0],ST1);
  if(k==="ap") s+=box3(o,[-34,34,-18,18,0,7],ST2)+sg(at([0,0,7]),at([0,0,40]),LN2);
  if(k==="pon") s+=sph(at([0,0,14]),14)+sg(at([0,0,28]),at([0,0,52]),LN2)+`<circle cx="${o[0]}" cy="${o[1]}" r="2.2" class="v-pt"/>`;
  if(k==="lr") s+=cyl3(o,[0,0,12],"x",74,12,ST2)+sg(at([0,0,24]),at([0,0,50]),LN2);
  const a=at([0,-32,-7]), b=at([0,-32,-24]);
  return s+sg(a,b,LN1)+ground(b[0]-16,b[0]+16,b[1]);
}
const SYM_ALT={piv:"pivot",pg:"pivot glissant",hel:"hélicoïdale",gli:"glissière",rot:"rotule",la:"linéaire annulaire",ap:"appui plan",pon:"ponctuelle",lr:"linéaire rectiligne"};
const SYM_DY={piv:-6,pg:-6,hel:-6,gli:-8,rot:0,la:-2,ap:14,pon:20,lr:18};
/* un symbole seul */
function fx_lia_sym(k){ const c=[200,84+1.35*SYM_DY[k]]; return svg(170,`<g transform="translate(${c[0]} ${c[1]}) scale(1.35) translate(${-c[0]} ${-c[1]})">${sym3(k,c)}</g>`,"Symbole normalisé en perspective d'une liaison : solide 1 en noir, solide 2 en bleu"); }
/* quatre symboles numérotés (grille 2 × 2) */
function fx_lia_grille(ks){
  let s=L(200,6,200,254,"v-grid")+L(4,130,396,130,"v-grid");
  ks.forEach((k,i)=>{ const cx=i%2?300:100, cy=i<2?64:190; s+=numLab(i%2?214:14,i<2?18:144,String(i+1))+sym3(k,[cx,cy+SYM_DY[k]]); });
  return svg(258,s,"Quatre symboles de liaisons numérotés de 1 à 4 : solide 1 en noir, solide 2 en bleu");
}
/* symbole d'axe u et trièdre de référence */
function fx_lia_axes(k,u){
  const o=[240,u==="z"?96:88], t=[40,182];
  let s=`<g transform="translate(${o[0]} ${o[1]}) scale(1.2) translate(${-o[0]} ${-o[1]})">${sym3(k,o,u)}</g>`;
  const ax=[["x",[52,0,0],[6,5]],["y",[0,72,0],[6,-3]],["z",[0,0,50],[-8,2]]];
  ax.forEach(([n,v,d])=>{ const q=PJ(t,v); s+=L(t[0],t[1],q[0],q[1],"v-vec","k")+T(q[0]+d[0],q[1]+d[1],n,"v-lab s",n==="z"?"end":"start"); });
  s+=`<circle cx="${t[0]}" cy="${t[1]}" r="2.5" class="v-pt"/>`+T(250,206,"repère : x⃗ vers la droite, y⃗ fuyant, z⃗ vers le haut","v-cap","middle");
  return svg(214,s,"Symbole de liaison en perspective et trièdre de référence (x, y, z)");
}
/* mécanisme plan vérin + levier : bâti 0 (articulations C et O), corps 1, tige 2, levier 3 ; o.th : angle du levier (°) */
function fx_lia_verin(o){
  const O=[304,190], C=[62,190], th=rad(o.th||118), Lv=162, E=[O[0]+Lv*Math.cos(th),O[1]-Lv*Math.sin(th)], kB=0.64, B=[O[0]+kB*Lv*Math.cos(th),O[1]-kB*Lv*Math.sin(th)];
  const d=Math.hypot(B[0]-C[0],B[1]-C[1]), u=[(B[0]-C[0])/d,(B[1]-C[1])/d], nr=[-u[1],u[0]], Lb=0.56*d, Cb=[C[0]+u[0]*Lb,C[1]+u[1]*Lb], Pp=[C[0]+u[0]*(Lb-12),C[1]+u[1]*(Lb-12)];
  let s=fixe(C[0],C[1]+7)+fixe(O[0],O[1]+7);
  s+=bar(O[0],O[1],E[0],E[1]);
  s+=slab(C,Cb,12,"v-body")+L(Pp[0]+nr[0]*11,Pp[1]+nr[1]*11,Pp[0]-nr[0]*11,Pp[1]-nr[1]*11,"v-ink");
  s+=`<line x1="${Pp[0].toFixed(1)}" y1="${Pp[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" class="v-ink" style="stroke-width:4"/>`;
  s+=piv(C[0],C[1])+piv(B[0],B[1])+piv(O[0],O[1]);
  const m1=[(C[0]+Cb[0])/2,(C[1]+Cb[1])/2], m2=[(Cb[0]+B[0])/2,(Cb[1]+B[1])/2], m3=[O[0]+0.85*Lv*Math.cos(th),O[1]-0.85*Lv*Math.sin(th)];
  s+=numLab(m1[0]+nr[0]*26,m1[1]+nr[1]*26,"1")+numLab(m2[0]+nr[0]*20,m2[1]+nr[1]*20,"2")+numLab(m3[0]+20,m3[1]+6,"3");
  s+=T(C[0]-8,C[1]-12,"C","v-lab s","end")+T(B[0]+10,B[1]+16,"B","v-lab s")+T(O[0]+12,O[1]-8,"O","v-lab s")+T(E[0]-10,E[1]-6,"E","v-lab s","end");
  s+=T(C[0]+34,C[1]+42,"bâti 0","v-cap")+T(O[0]+30,O[1]+42,"bâti 0","v-cap");
  s+=L(352,30,386,30,"v-vec","k")+T(388,44,"x","v-lab s")+L(352,30,352,4,"v-vec","k")+T(340,14,"y","v-lab s","end");
  return svg(240,s,"Mécanisme plan : vérin (corps 1, tige 2) articulé en C sur le bâti et en B sur le levier 3, lui-même articulé en O");
}
/* axe linéaire à vis-écrou (modèle plan) : bâti 0, vis 1 (pivot en A), chariot 2 (écrou et glissière sur le rail) */
function fx_lia_vis(o){
  const yv=156, yr=64, yg=222;
  let s=ground(20,386,yg);
  s+=L(30,yr,382,yr,"v-ink")+L(30,yr,30,yg,"v-ink")+L(382,yr,382,yg,"v-ink");
  s+=`<rect x="14" y="${yv-18}" width="46" height="36" rx="4" class="v-box"/>`+T(37,yv+5,"M","v-lab","middle")+L(37,yv+18,37,yg,"v-ink");
  s+=`<line x1="60" y1="${yv}" x2="360" y2="${yv}" class="v-ink" style="stroke:var(--accent);stroke-width:2.6"/>`;
  s+=`<rect x="86" y="${yv-11}" width="34" height="22" class="v-box"/>`+L(80,yv-9,80,yv+9,"v-ink")+L(126,yv-9,126,yv+9,"v-ink")+L(103,yv+11,103,yg,"v-ink");
  const xe=o.xe||218;
  s+=`<rect x="${xe-22}" y="${yv-12}" width="44" height="24" class="v-box"/>`;
  for(let k=-1;k<=1;k++) s+=L(xe+k*12-6,yv+10,xe+k*12+6,yv-10,"v-thin");
  s+=L(xe,yv-12,xe,yr+14,"v-ink")+`<rect x="${xe-40}" y="${yr-14}" width="80" height="28" class="v-block"/>`;
  s+=numLab(146,yv-22,"1")+numLab(xe+56,yr-2,"2")+T(300,yg-8,"bâti 0","v-cap");
  s+=T(103,yv-17,"A","v-lab s","middle")+`<circle cx="103" cy="${yv}" r="2.5" class="v-pt"/>`;
  if(o.v) s+=L(xe+50,yr-30,xe+104,yr-30,"v-t","c")+T(xe+108,yr-26,"v","v-lab c");
  s+=L(300,112,340,112,"v-vec","k")+T(344,116,"x","v-lab s");
  return svg(234,s,"Axe linéaire : moteur, vis 1 guidée en A par rapport au bâti 0, écrou lié au chariot 2 qui coulisse sur le rail du bâti");
}
/* graphe des liaisons : o.n = [{k, t, x, y}] ; o.e = [{a, b, t, q, f}] (q : liaison à trouver, f : position de l'étiquette le long du trait) */
function fx_lia_graphe(o){
  let s="", H=0;
  o.e.forEach(e=>{ const A=o.n[e.a], B=o.n[e.b]; s+=L(A.x,A.y,B.x,B.y,"v-ink"); });
  o.e.forEach(e=>{ const A=o.n[e.a], B=o.n[e.b], f=e.f==null?0.5:e.f, x=A.x+(B.x-A.x)*f, y=A.y+(B.y-A.y)*f, w=e.q?26:e.t.length*5.9+12;
    s+=`<rect x="${(x-w/2).toFixed(1)}" y="${(y-10).toFixed(1)}" width="${w.toFixed(1)}" height="20" rx="4" class="${e.q?"v-boxq":"v-box"}"/>`+T(x,y+4,e.q?"?":esc(e.t),e.q?"v-lab c":"v-sm","middle"); });
  o.n.forEach(n=>{ s+=`<ellipse cx="${n.x}" cy="${n.y}" rx="${Math.max(38,n.t.length*3.4+10).toFixed(1)}" ry="21" class="v-box" style="stroke-width:1.6"/>`+T(n.x,n.y-2,n.k,"v-lab s","middle")+T(n.x,n.y+12,esc(n.t),"v-sm","middle"); H=Math.max(H,n.y); });
  return svg(H+30,s,o.alt||"Graphe des liaisons : une ellipse par classe d'équivalence, un trait par liaison");
}
/* bras de robot (modèle plan (x, z)) : socle 0, tourelle 1 (pivot d'axe vertical), bras 2, avant-bras 3, pince 4 */
function fx_lia_bras(){
  const yg=226, O=[150,yg-24], A=[150,122], B=[262,62], Cc=[330,122];
  let s=ground(96,206,yg)+`<rect x="120" y="${yg-26}" width="60" height="26" rx="3" class="v-body"/>`;
  s+=`<polyline points="140,163 128,163 128,${yg-26}" class="v-ink"/><polyline points="160,163 172,163 172,${yg-26}" class="v-ink"/>`;
  s+=L(150,A[1],150,190,"v-ink")+`<rect x="140" y="150" width="20" height="27" class="v-box"/>`+L(141,146,159,146,"v-ink")+L(141,181,159,181,"v-ink");
  s+=bar(A[0],A[1],B[0],B[1])+bar(B[0],B[1],Cc[0],Cc[1]);
  s+=`<path d="M${Cc[0]} ${Cc[1]} L${Cc[0]+26} ${Cc[1]+22} L${Cc[0]+44} ${Cc[1]+14} M${Cc[0]} ${Cc[1]} L${Cc[0]+8} ${Cc[1]+34} L${Cc[0]+26} ${Cc[1]+44}" class="v-ink" style="stroke-width:3"/>`;
  s+=piv(A[0],A[1])+piv(B[0],B[1])+piv(Cc[0],Cc[1]);
  s+=numLab(104,yg-14,"0")+numLab(124,160,"1")+numLab(190,78,"2")+numLab(316,86,"3")+numLab(378,150,"4");
  s+=T(160,118,"A","v-lab s")+T(262,46,"B","v-lab s","middle")+T(316,134,"C","v-lab s","end")+T(178,152,"O","v-lab s");
  s+=L(30,70,64,70,"v-vec","k")+T(68,74,"x","v-lab s")+L(30,70,30,36,"v-vec","k")+T(24,40,"z","v-lab s","end");
  return svg(234,s,"Bras de robot : socle 0, tourelle 1, bras 2, avant-bras 3, pince 4");
}
/* robot mobile vu de côté : roue motrice (contact I) et roue folle à bille (contact J) */
function fx_lia_robot(){
  const yg=204, W=[256,yg-32], Bc=[132,yg-13];
  let s=ground(20,380,yg)+`<rect x="80" y="100" width="220" height="50" rx="10" class="v-body"/>`+T(186,130,"châssis 1","v-cap","middle");
  s+=`<circle cx="${W[0]}" cy="${W[1]}" r="32" class="v-wheel"/>`+piv(W[0],W[1])+T(298,186,"roue motrice 2","v-cap");
  s+=`<rect x="114" y="150" width="36" height="14" class="v-box"/>`+`<path d="M${P2(pol(Bc,18,200))} A18 18 0 0 0 ${P2(pol(Bc,18,-20))}" class="v-ink" style="stroke-width:2"/>`;
  s+=`<circle cx="${Bc[0]}" cy="${Bc[1]}" r="13" style="${ST2}"/>`+T(106,186,"bille folle 3","v-cap","end");
  s+=pt(W[0],yg,"I",8,16)+pt(Bc[0],yg,"J",8,16);
  s+=L(30,40,64,40,"v-vec","k")+T(68,44,"x","v-lab s")+L(30,40,30,6,"v-vec","k")+T(24,14,"y","v-lab s","end")+T(330,236,"sol 0","v-cap","middle");
  return svg(244,s,"Robot mobile vu de côté : roue motrice en contact avec le sol en I, bille folle en contact en J");
}


/* ======================================================================
   FIGURES : FLUIDES (préfixes fx_flu_ et fx_pf_)
   ====================================================================== */
const WAT="fill:var(--accent);fill-opacity:.13;stroke:none", PRS="fill:var(--accent);fill-opacity:.32;stroke:none", SURF="stroke:var(--accent);stroke-width:1.6;fill:none";
/* vérin en coupe : o.x (position du piston), o.alim "A" | "B" | null (chambre alimentée), o.mv +1 sortie, −1 rentrée, o.ressort (simple effet), o.D, o.d, o.F : textes */
function fx_flu_verin(o){
  const y1=70, y2=150, b1=78, b2=142, r1=101, r2=119, xp=o.x||150, se=!!o.ressort;
  let s=`<rect x="36" y="${y1}" width="260" height="${y2-y1}" rx="3" class="v-body"/><rect x="48" y="${b1}" width="236" height="${b2-b1}" class="v-box"/>`;
  if(o.alim==="A") s+=`<rect x="48" y="${b1}" width="${xp-48}" height="${b2-b1}" style="${PRS}"/>`;
  if(o.alim==="B") s+=`<rect x="${xp+14}" y="${b1}" width="${270-xp}" height="${b2-b1}" style="${PRS}"/>`;
  if(se) [[b1+3,r1-3],[r2+3,b2-3]].forEach(([ya,yb])=>{ const pts=[]; for(let i=0;i<=12;i++) pts.push([xp+14+(270-xp)*i/12,i%2?ya:yb]); s+=pline(pts,"stroke:var(--ink);stroke-width:1.3;fill:none"); });
  s+=`<rect x="${xp+14}" y="${r1}" width="${362-xp}" height="${r2-r1}" class="v-block"/><rect x="${xp}" y="${b1}" width="14" height="${b2-b1}" class="v-block"/>`;
  const orif=(x,lab)=>`<rect x="${x-6}" y="${y1-14}" width="12" height="22" class="v-box"/>`+T(x-12,y1-4,lab,"v-lab s","end");
  s+=orif(62,"A")+(se?`<rect x="266" y="${y1}" width="8" height="8" class="v-box"/>`+T(270,y1-8,"mise à l'air","v-cap","middle"):orif(270,"B"));
  const inA=o.alim==="A", inB=o.alim==="B";
  if(inA||inB){ const xi=inA?62:270, xo=inA?270:62;
    s+=L(xi,y1-52,xi,y1-17,"v-el","a")+T(xi+8,y1-40,"alimentation","v-cap");
    if(!se) s+=L(xo,y1-17,xo,y1-52,"v-ink","k")+T(xo+8,y1-40,"échappement","v-cap"); }
  if(o.mv) s+=(o.mv>0?L(300,184,370,184,"v-t","c"):L(370,184,300,184,"v-t","c"))+T(335,176,o.mv>0?"sortie de tige":"rentrée de tige","v-cap","middle");
  if(o.F) s+=T(384,98,o.F,"v-lab s c","end");
  if(o.D) s+=vcote(58,b1,b2)+Th(64,b1+18,o.D,"v-lab s");
  if(o.d) s+=`<line x1="330" y1="${r1}" x2="330" y2="${r2}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+T(330,r2+26,o.d,"v-lab s","middle");
  s+=T((48+xp)/2,y2+18,"côté fond","v-cap","middle")+T((xp+298)/2-20,y2+18,se?"ressort":"côté tige","v-cap","middle");
  return svg(196,s,o.alt||"Vérin en coupe : chambre côté fond, piston, chambre côté tige et tige");
}
/* profil d'aile (NACA 4412) dans un écoulement horizontal venant de la gauche ; o.a : incidence (°), o.nums : numéros des flèches [haut, aval, amont, bas], o.forces, o.fl : "air" | "eau", o.cap */
function fx_flu_aile(o){
  const LE=[110,126], ch=196, a=o.a==null?6:o.a, ca=Math.cos(rad(a)), sa=Math.sin(rad(a)), P=(u,v)=>[LE[0]+u*ca-v*sa,LE[1]+u*sa+v*ca];
  const up=[], lo=[];
  for(let i=0;i<=40;i++){ const x=(1-Math.cos(Math.PI*i/40))/2, yt=0.6*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x**3-0.1015*x**4), yc=x<0.4?0.04/0.16*(0.8*x-x*x):0.04/0.36*(0.2+0.8*x-x*x);
    up.push(P(x*ch,-(yc+yt)*ch)); lo.push(P(x*ch,-(yc-yt)*ch)); }
  let s="";
  if(o.showA){ s+=L(LE[0],LE[1],LE[0]+ch+30,LE[1],"v-dash")+L(LE[0],LE[1],P(ch+30,0)[0],P(ch+30,0)[1],"v-dash")+arcP(LE,ch+14,-a,0)+T(pol(LE,ch+24,-a/2)[0]+2,pol(LE,ch+24,-a/2)[1]+5,"α","v-lab s"); }
  s+=pgon([...up,...lo.reverse()],"fill:var(--paper-2);stroke:var(--ink);stroke-width:1.6");
  [LE[1]-30,LE[1]+4,LE[1]+38].forEach(y=>s+=L(14,y,78,y,"v-el","a"));
  s+=T(14,LE[1]-40,`v⃗ (${o.fl||"air"})`,"v-lab s a");
  const C=P(0.25*ch,-0.05*ch);
  if(o.nums){ const D=[[0,-1],[1,0],[-1,0],[0,1]], len=[66,62,62,62];
    D.forEach((d,i)=>{ const q=[C[0]+d[0]*len[i],C[1]+d[1]*len[i]]; s+=L(C[0],C[1],q[0],q[1],"v-vec","k")+numLab(q[0]+d[0]*16+(d[0]?0:16),q[1]+d[1]*16,String(o.nums[i])); }); }
  else if(o.forces!==false){ s+=L(C[0],C[1],C[0],C[1]-76,"v-t","c")+T(C[0]+8,C[1]-66,"Fz (portance)","v-lab s c");
    s+=L(C[0],C[1],C[0]+70,C[1],"v-f","f")+Th(C[0]+76,C[1]-8,"Fx (traînée)","v-lab s"); }
  s+=`<circle cx="${C[0].toFixed(1)}" cy="${C[1].toFixed(1)}" r="3" class="v-pt"/>`;
  if(o.cap) s+=T(200,226,o.cap,"v-cap","middle");
  return svg(o.cap?234:216,s,o.alt||"Profil d'aile dans un écoulement : portance perpendiculaire à la vitesse, traînée parallèle");
}
/* repère gradué et courbes : o.xmax, o.ymax, o.xs, o.ys, o.xl, o.yl, o.c = [{f, lab, lx, dy}], o.pts = [{x, y, lab, proj}], o.hl = [{y, lab}] */
function fx_flu_plot(o){
  const X0=62, Y0=204, W=300, H=164, sx=W/o.xmax, sy=H/o.ymax, X=x=>X0+x*sx, Y=y=>Y0-y*sy;
  const dec=st=>{ const t=String(+st.toPrecision(6)); const i=t.indexOf("."); return i<0?0:t.length-i-1; };
  let s="";
  for(let k=0;k*o.xs<=o.xmax+1e-9;k++){ const x=k*o.xs; s+=L(X(x),Y0,X(x),Y0-H,"v-grid")+T(X(x),Y0+16,nf(x,dec(o.xs)),"v-lab s","middle"); }
  for(let k=0;k*o.ys<=o.ymax+1e-9;k++){ const y=k*o.ys; s+=L(X0,Y(y),X0+W,Y(y),"v-grid")+T(X0-6,Y(y)+4,nf(y,dec(o.ys)),"v-lab s","end"); }
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-18,"v-ink","k");
  (o.hl||[]).forEach(h=>{ s+=L(X0,Y(h.y),X0+W,Y(h.y),"v-dash"); if(h.lab) s+=Th(X0+W-2,Y(h.y)-5,h.lab,"v-cap","end"); });
  (o.c||[]).forEach(c=>{ const pts=[]; for(let i=0;i<=200;i++){ const x=(c.x0||0)+((c.x1==null?o.xmax:c.x1)-(c.x0||0))*i/200, y=c.f(x); if(y>=0&&y<=o.ymax*1.001) pts.push([X(x),Y(y)]); }
    s+=pline(pts,"stroke:var(--accent);stroke-width:2.6;fill:none"); if(c.lab) s+=Th(X(c.lx),Y(c.f(c.lx))+(c.dy==null?-10:c.dy),c.lab,"v-lab s a",c.a||"middle"); });
  (o.pts||[]).forEach(p=>{ if(p.proj) s+=L(X(p.x),Y(p.y),X(p.x),Y0,"v-dash")+L(X0,Y(p.y),X(p.x),Y(p.y),"v-dash"); s+=dot(X(p.x),Y(p.y)); if(p.lab) s+=Th(X(p.x)+(p.dx==null?8:p.dx),Y(p.y)+(p.dy==null?-8:p.dy),p.lab,"v-lab s",p.a||"start"); });
  s+=T(X0+W+12,Y0+34,o.xl,"v-cap","end")+T(X0+8,Y0-H-8,o.yl,"v-cap");
  return svg(246,s,o.alt||"Courbe");
}
/* objet sous la surface de l'eau (drone sous-marin) ou fond d'un réservoir ; o.hl : cote ; o.hublot ; o.tank */
function fx_flu_prof(o){
  const ys=48, yo=172;
  let s="";
  if(o.tank){ s+=`<rect x="70" y="${ys}" width="200" height="${214-ys}" style="${WAT}"/>`+`<path d="M70 24 L70 214 L270 214 L270 24" class="v-ink" style="stroke-width:3"/>`+L(70,ys,270,ys,"",null).replace('class=""',`style="${SURF}"`);
    s+=T(170,ys-8,"surface libre : p0","v-cap","middle")+pt(170,206,"M",8,-6)+L(170,ys,300,ys,"v-dash")+L(170,206,300,206,"v-dash")+vcote(292,ys,206,o.hl);
    return svg(226,s,o.alt||"Réservoir d'eau ouvert : point M au fond, à la profondeur h"); }
  s+=`<rect x="10" y="${ys}" width="380" height="${226-ys}" style="${WAT}"/>`;
  let d=`M10 ${ys}`; for(let x=10;x<390;x+=20) d+=" q5 -5 10 0 t10 0"; s+=`<path d="${d}" style="${SURF}"/>`+T(14,ys-10,"surface de la mer : p0","v-cap");
  s+=`<rect x="120" y="${yo-18}" width="120" height="36" rx="16" class="v-body"/><rect x="240" y="${yo-6}" width="10" height="12" class="v-box"/>`+L(250,yo-14,250,yo+14,"v-ink");
  if(o.hublot) s+=`<circle cx="138" cy="${yo}" r="10" class="v-box" style="fill:var(--accent);fill-opacity:.25"/>`+T(130,yo+36,"hublot","v-cap","middle");
  s+=T(180,yo-26,o.lab||"drone sous-marin","v-cap","middle");
  s+=L(250,yo,330,yo,"v-dash")+vcote(320,ys,yo,o.hl);
  return svg(236,s,o.alt||"Drone sous-marin immergé à la profondeur h");
}
/* panneau sur un mât soumis au vent : o.hl (cote), o.F (texte de l'effort) */
function fx_flu_panneau(o){
  const yg=222, yc=78;
  let s=ground(90,310,yg)+`<rect x="194" y="${yc}" width="12" height="${yg-yc}" class="v-body"/>`+`<rect x="130" y="${yc-40}" width="140" height="80" rx="2" class="v-body"/>`;
  [yc-28,yc,yc+28].forEach(y=>s+=L(20,y,96,y,"v-el","a")); s+=T(20,yc-40,"vent","v-cap");
  s+=L(200,yc,286,yc,"v-t","c")+T(290,yc+5,o.F||"F","v-lab c")+`<circle cx="200" cy="${yc}" r="3" class="v-pt"/>`;
  s+=pt(200,yg,"O",8,-6)+L(314,yc,350,yc,"v-dash")+L(312,yg,350,yg,"v-dash")+vcote(340,yc,yg,o.hl,"end");
  return svg(236,s,o.alt||"Panneau porté par un mât encastré au sol en O, soumis au vent");
}
/* objet flottant : o.kind "bloc" | "coque", o.fr (fraction immergée), o.hl (cote de la hauteur totale, à gauche), o.hil (cote de la hauteur immergée, à droite), o.forces */
function fx_pf_flot(o){
  const yw=122, H=o.H||92, Hi=H*o.fr, x1=132, x2=268, yt=yw-(H-Hi), yb=yw+Hi, co=o.kind==="coque";
  let s=co?`<path d="M${x1-30} ${yt} L${x2+30} ${yt} L${x2+4} ${(yb-12).toFixed(1)} Q200 ${(yb+12).toFixed(1)} ${x1-4} ${(yb-12).toFixed(1)} Z" class="v-body"/>`:`<rect x="${x1}" y="${yt.toFixed(1)}" width="${x2-x1}" height="${H}" class="v-body"/>`;
  s+=`<rect x="10" y="${yw}" width="380" height="${234-yw}" style="${WAT}"/>`+L(10,yw,390,yw,"v-ink").replace('class="v-ink"',`style="${SURF}"`)+T(384,228,"eau","v-cap","end");
  if(o.forces!==false){ const G=[188,yt+H/2], C=[212,yw+Hi/2];
    s+=gSym(G[0],G[1])+T(G[0]-12,G[1]+4,"G","v-lab s","end")+L(G[0],G[1]+8,G[0],G[1]+62,"v-f","f")+T(G[0]-8,G[1]+56,"P","v-lab","end");
    s+=`<circle cx="${C[0]}" cy="${C[1].toFixed(1)}" r="3" class="v-pt"/>`+T(C[0]+8,C[1]+14,"C","v-lab s")+L(C[0],C[1],C[0],C[1]-62,"v-n","a")+T(C[0]+8,C[1]-50,"Π","v-lab a"); }
  if(o.hl){ let ly=(yt+yb)/2+4; if(Math.abs(ly-4-yw)<12) ly=yw-8; s+=L(x1-(co?30:0),yt,x1-46,yt,"v-dash")+L(x1,yb,x1-46,yb,"v-dash")+vcote(x1-38,yt,yb)+Th(x1-44,ly,o.hl,"v-cap","end"); }
  if(o.hil) s+=L(co?206:x2,yb,x2+50,yb,"v-dash")+vcote(x2+42,yw,yb,o.hil);
  return svg(240,s,o.alt||"Objet flottant : poids P appliqué en G, poussée d'Archimède Π appliquée au centre de carène C");
}
/* solide suspendu à un dynamomètre et totalement immergé dans l'eau d'un récipient ; o.lab : lecture */
function fx_pf_dyn(o){
  let s=L(120,20,280,20,"v-ink");
  for(let x=126;x<=276;x+=14) s+=L(x,20,x+10,10,"v-hatch");
  s+=L(200,20,200,30,"v-ink")+`<rect x="188" y="30" width="24" height="64" rx="4" class="v-box"/>`;
  for(let y=40;y<=86;y+=6) s+=L(188,y,194,y,"v-thin");
  s+=L(200,94,200,160,"v-ink")+`<path d="M110 106 L110 228 L290 228 L290 106" class="v-ink" style="stroke-width:2.4"/>`+`<rect x="111" y="130" width="178" height="97" style="${WAT}"/>`+L(111,130,289,130,"").replace('class=""',`style="${SURF}"`);
  s+=`<rect x="174" y="160" width="52" height="44" rx="2" class="v-body"/>`;
  if(o.lab) s+=T(222,62,o.lab,"v-lab s");
  s+=T(222,78,"dynamomètre","v-cap")+T(296,150,"eau","v-cap");
  return svg(236,s,o.alt||"Solide suspendu à un dynamomètre et totalement immergé dans l'eau");
}
/* tube de Venturi horizontal avec deux tubes piézométriques ; o.h1, o.h2 : niveaux (px au-dessus de l'axe) ; o.dh : texte de Δh ; o.q : points 1 et 2 seulement */
function fx_pf_venturi(o){
  const yc=184, R1=30, R2=14, rr=x=>x<130?R1:x<180?R1+(R2-R1)*(x-130)/50:x<236?R2:x<306?R2+(R1-R2)*(x-236)/70:R1;
  const xs=[]; for(let x=16;x<=384;x+=4) xs.push(x);
  let s=pgon([...xs.map(x=>[x,yc-rr(x)]),...xs.slice().reverse().map(x=>[x,yc+rr(x)])],WAT);
  s+=pline(xs.map(x=>[x,yc-rr(x)]),"stroke:var(--ink);stroke-width:2.2;fill:none")+pline(xs.map(x=>[x,yc+rr(x)]),"stroke:var(--ink);stroke-width:2.2;fill:none");
  const tube=(x,R,h)=>{ const yl=yc-h; return `<rect x="${x-5}" y="${yl}" width="10" height="${h-R}" style="${PRS}"/>`+L(x-6,yc-R,x-6,26,"v-ink")+L(x+6,yc-R,x+6,26,"v-ink")+L(x-8,yl,x+8,yl,"").replace('class=""',`style="${SURF}"`); };
  if(o.h1!=null) s+=tube(80,R1,o.h1)+tube(208,R2,o.h2);
  s+=L(28,yc,104,yc,"v-el","a")+T(40,yc-8,"v1","v-lab s a")+L(176,yc,262,yc,"v-el","a")+T(222,yc-4,"v2","v-lab s a");
  s+=numLab(80,yc+R1+18,"1")+numLab(208,yc+R2+18,"2");
  if(o.dh){ s+=L(86,yc-o.h1,150,yc-o.h1,"v-dash")+L(150,yc-o.h2,202,yc-o.h2,"v-dash")+vcote(150,yc-o.h1,yc-o.h2,o.dh); }
  return svg(250,s,o.alt||"Tube de Venturi : section 1 large, section 2 rétrécie, tubes piézométriques");
}
/* réservoir ouvert qui se vide par un orifice latéral ; o.hl : cote de h */
function fx_pf_reservoir(o){
  const xa=112, xb=272, yt=30, yb=212, ys=o.ys||64, yo=194;
  let s=`<rect x="${xa}" y="${ys}" width="${xb-xa}" height="${yb-ys}" style="${WAT}"/>`+L(xa,ys,xb,ys,"").replace('class=""',`style="${SURF}"`);
  s+=`<path d="M${xa} ${yt} L${xa} ${yb} L${xb} ${yb} L${xb} ${yo+7} M${xb} ${yo-7} L${xb} ${yt}" class="v-ink" style="stroke-width:3"/>`;
  s+=`<path d="M${xb} ${yo-6} Q${xb+60} ${yo-6} ${xb+96} ${yb+18} L${xb+86} ${yb+18} Q${xb+52} ${yo+6} ${xb} ${yo+6} Z" style="fill:var(--accent);fill-opacity:.35;stroke:none"/>`;
  s+=L(xb+4,yo,xb+44,yo,"v-el","a")+T(xb+48,yo-8,o.v||"v","v-lab s a");
  s+=pt((xa+xb)/2,ys,"A",8,-6)+pt(xb-6,yo,"B",-18,-6);
  s+=L(xa-34,ys,xa,ys,"v-dash")+L(xa-34,yo,xb-6,yo,"v-dash")+vcote(xa-24,ys,yo,o.hl,"end");
  return svg(236,s,o.alt||"Réservoir ouvert qui se vide par un orifice B situé à la hauteur h sous la surface libre A");
}
/* vases communicants : grand réservoir et tube relié par le fond ; points A, B, C, D */
function fx_pf_niveaux(){
  const ys=84, yb=216;
  let s=`<rect x="60" y="${ys}" width="150" height="${yb-ys}" style="${WAT}"/><rect x="296" y="${ys}" width="30" height="${yb-ys}" style="${WAT}"/><rect x="210" y="${yb-24}" width="86" height="24" style="${WAT}"/>`;
  s+=`<path d="M60 40 L60 ${yb} L326 ${yb} L326 40 M296 40 L296 ${yb-24} L210 ${yb-24} L210 40" class="v-ink" style="stroke-width:2.6"/>`;
  s+=L(60,ys,210,ys,"").replace('class=""',`style="${SURF}"`)+L(296,ys,326,ys,"").replace('class=""',`style="${SURF}"`)+T(135,ys-8,"air : p0","v-cap","middle");
  s+=pt(120,150,"A",8,5)+pt(311,150,"B",10,5)+pt(160,200,"C",8,5)+pt(311,112,"D",10,5)+L(120,150,311,150,"v-dash");
  return svg(228,s,"Vases communicants : réservoir et tube reliés par le fond, eau au repos, points A, B, C, D");
}
/* conduite à deux diamètres ; o.r1, o.r2 (demi-hauteurs, px), o.l1, o.l2 (textes), o.v1, o.v2 (textes des vitesses) */
function fx_pf_conduite(o){
  const yc=100, r1=o.r1, r2=o.r2, xm=196;
  const up=[[16,yc-r1],[xm-22,yc-r1],[xm+22,yc-r2],[384,yc-r2]], dn=up.map(p=>[p[0],2*yc-p[1]]);
  let s=pgon([...up,...dn.slice().reverse()],WAT)+pline(up,"stroke:var(--ink);stroke-width:2.2;fill:none")+pline(dn,"stroke:var(--ink);stroke-width:2.2;fill:none");
  const l1=Math.max(34,Math.min(80,o.k1||60)), l2=Math.max(34,Math.min(96,o.k2||60));
  s+=L(52,yc,52+l1,yc,"v-el","a")+T(52+l1/2,yc-8,o.v1||"v1","v-lab s a","middle")+L(250,yc,250+l2,yc,"v-el","a")+T(250+l2/2,yc-8,o.v2||"v2","v-lab s a","middle");
  s+=vcote(30,yc-r1,yc+r1)+T(36,yc+r1+18,o.l1,"v-lab s")+vcote(370,yc-r2,yc+r2)+T(364,yc+r2+18,o.l2,"v-lab s","end");
  s+=numLab(110,yc+r1+30,"1")+numLab(300,yc+Math.max(r2,r1)+30,"2");
  return svg(yc+Math.max(r1,r2)+48,s,o.alt||"Conduite dont le diamètre change : section 1 puis section 2");
}
/* presse (ou cric) hydraulique : petit piston 1 et grand piston 2 reliés par l'huile ; o.l1, o.l2 : textes des diamètres ; o.f1, o.f2 : textes des efforts */
function fx_flu_presse(o){
  const yb=206, a1=73, b1=99, a2=175, b2=285, c1=86, c2=230, y1=112, y2=122;
  let s=`<rect x="${a1}" y="${y1}" width="${b1-a1}" height="${yb-y1}" style="${PRS}"/><rect x="${a2}" y="${y2}" width="${b2-a2}" height="${yb-y2}" style="${PRS}"/><rect x="${b1}" y="${yb-22}" width="${a2-b1}" height="22" style="${PRS}"/>`;
  s+=`<path d="M${a1} 40 L${a1} ${yb} L${b2} ${yb} L${b2} 56 M${b1} 40 L${b1} ${yb-22} L${a2} ${yb-22} L${a2} 56" class="v-ink" style="stroke-width:2.6"/>`;
  s+=`<rect x="${a1}" y="${y1-10}" width="${b1-a1}" height="10" class="v-block"/><line x1="${c1}" y1="${y1-10}" x2="${c1}" y2="62" class="v-ink" style="stroke-width:4"/>`+L(c1-12,62,c1+12,62,"v-ink");
  s+=L(c1,14,c1,58,"v-t","c")+T(c1+10,30,o.f1||"F1","v-lab c");
  s+=`<rect x="${a2}" y="${y2-12}" width="${b2-a2}" height="12" class="v-block"/><rect x="${c2-34}" y="${y2-46}" width="68" height="34" rx="3" class="v-body"/>`+T(c2,y2-25,"charge","v-cap","middle");
  s+=L(c2,y2-48,c2,14,"v-t","c")+T(c2+10,28,o.f2||"F2","v-lab c");
  const hc=(a,b,t)=>`<line x1="${a}" y1="220" x2="${b}" y2="220" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+L(a,yb+2,a,224,"v-dash")+L(b,yb+2,b,224,"v-dash")+T((a+b)/2,237,t,"v-cap","middle");
  s+=hc(a1,b1,o.l1||"")+hc(a2,b2,o.l2||"")+T((b1+a2)/2,yb-6,"huile","v-cap","middle");
  s+=numLab(a1-18,y1-4,"1")+numLab(b2+18,y2-4,"2");
  return svg(244,s,o.alt||"Presse hydraulique : petit piston 1 et grand piston 2 reliés par de l'huile");
}
/* robot sous-marin totalement immergé : centre de carène C et poussée Π ; o.G : G dessiné sous C, sur la même verticale */
function fx_pf_stab(o){
  const yc=132;
  let s=`<rect x="10" y="36" width="380" height="190" style="${WAT}"/>`;
  let d=`M10 36`; for(let x=10;x<390;x+=20) d+=" q5 -5 10 0 t10 0"; s+=`<path d="${d}" style="${SURF}"/>`;
  s+=`<rect x="96" y="${yc-38}" width="208" height="76" rx="36" class="v-body"/><rect x="304" y="${yc-9}" width="12" height="18" class="v-box"/>`+L(316,yc-20,316,yc+20,"v-ink");
  s+=`<circle cx="200" cy="${yc}" r="3.5" class="v-pt"/>`+T(186,yc+5,"C","v-lab s","end")+L(200,yc,200,yc-80,"v-n","a")+T(208,yc-66,"Π","v-lab a");
  if(o.G){ const gy=yc+22; s+=gSym(200,gy)+T(212,gy+5,"G","v-lab s")+L(200,gy+8,200,gy+62,"v-f","f")+T(208,gy+56,"P","v-lab"); }
  s+=T(200,244,"C : centre du volume de la coque","v-cap","middle");
  return svg(252,s,o.alt||"Robot sous-marin immergé : poussée d'Archimède appliquée au centre de carène C");
}

/* ======================================================================
   LIAISONS, SCHÉMA CINÉMATIQUE
   ====================================================================== */
const AX=["x","y","z"];
const LIA={
  enc:{n:"encastrement",d:0,mob:()=>({T:[],R:[]})},
  piv:{n:"pivot",d:1,mob:u=>({T:[],R:[u]})},
  gli:{n:"glissière",d:1,mob:u=>({T:[u],R:[]})},
  hel:{n:"hélicoïdale",d:1,mob:u=>({T:[u],R:[u]})},
  pg:{n:"pivot glissant",d:2,mob:u=>({T:[u],R:[u]})},
  rot:{n:"rotule",d:3,mob:()=>({T:[],R:["x","y","z"]})},
  ap:{n:"appui plan",d:3,mob:u=>({T:AX.filter(a=>a!==u),R:[u]})},
  la:{n:"linéaire annulaire",d:4,mob:u=>({T:[u],R:["x","y","z"]})},
  lr:{n:"linéaire rectiligne",d:4,mob:(u,w)=>({T:AX.filter(a=>a!==u),R:[u,w].sort()})},
  pon:{n:"ponctuelle",d:5,mob:u=>({T:AX.filter(a=>a!==u),R:["x","y","z"]})}
};
const ALTN={rot:" (ou sphérique)",la:" (ou sphère-cylindre)",lr:" (ou cylindre-plan)",pon:" (ou sphère-plan)"};
const WHY={
  enc:"les deux pièces sont fixées l'une à l'autre : aucun mouvement relatif n'est possible.",
  piv:"l'arbre tourne dans l'alésage et des arrêts axiaux (épaulements, anneaux) l'empêchent de coulisser.",
  gli:"les formes prismatiques empêchent toute rotation : seul le coulissement reste possible.",
  hel:"la rotation et la translation existent mais sont liées par le filet : un tour fait avancer d'un pas.",
  pg:"l'arbre peut tourner et coulisser dans l'alésage, indépendamment l'un de l'autre.",
  rot:"la sphère tourne dans tous les sens dans sa cavité sphérique, sans pouvoir se déplacer.",
  ap:"le contact plan sur plan laisse les deux glissements dans le plan et la rotation autour de la normale.",
  la:"la sphère coulisse le long du cylindre et tourne dans tous les sens.",
  lr:"le cylindre glisse dans les deux directions du plan, roule sur lui-même et pivote autour de la normale.",
  pon:"la sphère glisse dans les deux directions du plan et tourne dans tous les sens ; seule la translation suivant la normale est bloquée."
};
const AXE=(P,u)=>`(${P}, ${V(u)})`;
/* nom complet d'une liaison : « pivot d'axe (O, x) », « appui plan de normale (O, z) »… */
function lname(k,u,w,P){ P=P||"O";
  if(k==="enc") return "encastrement";
  if(k==="rot") return `rotule de centre ${P}`;
  if(k==="gli") return `glissière de direction ${V(u)}`;
  if(k==="ap"||k==="pon") return `${LIA[k].n} de normale ${AXE(P,u)}`;
  if(k==="lr") return `linéaire rectiligne de normale ${AXE(P,u)} et de ligne de contact ${AXE(P,w)}`;
  return `${LIA[k].n} d'axe ${AXE(P,u)}`;
}
const TT=a=>`T<sub>${a}</sub>`, RR=a=>`R<sub>${a}</sub>`;
const mobT=m=>{ const a=[...m.T.map(TT),...m.R.map(RR)]; return a.length?a.join(", "):"aucun mouvement"; };
const mobKey=m=>m.T.join("")+"|"+m.R.join("");
const mobTab=m=>table(["Axe","Translation","Rotation"],AX.map(a=>[V(a),m.T.includes(a)?"1":"0",m.R.includes(a)?"1":"0"]));
const ddl=n=>`${n} degré${n>1?"s":""} de liberté`;
/* distracteurs : autres liaisons (et même liaison d'un autre axe) dont les mobilités diffèrent */
function lnWrong(k,u,w,n){
  const m0=mobKey(LIA[k].mob(u,w)), out=[], seen=new Set([m0]);
  const cand=[];
  if(["piv","gli","pg","la","ap","pon","lr"].includes(k)) AX.filter(a=>a!==u).forEach(a=>cand.push([k,a,a===w?u:w]));
  ["enc","piv","gli","pg","rot","ap","la","lr","pon"].filter(x=>x!==k).forEach(x=>cand.push([x,u,w]));
  shuffle(cand.slice(0,2)).concat(shuffle(cand.slice(2))).forEach(([x,a,b])=>{ const mk=mobKey(LIA[x].mob(a,b)); if(out.length<n&&!seen.has(mk)){ seen.add(mk); out.push(cap(lname(x,a,b))); } });
  return out;
}
/* mécanismes : classes d'équivalence (ellipses) et liaisons (traits) pour les graphes */
const MECA={
  verin:{nm:"du mécanisme vérin-levier",n:[{k:"0",t:"bâti",x:70,y:40},{k:"1",t:"corps",x:70,y:170},{k:"2",t:"tige",x:330,y:170},{k:"3",t:"levier",x:330,y:40}],
    e:[{a:0,b:1,t:"pivot (C, z)",l:"pivot d'axe (C, z)"},{a:1,b:2,t:"pivot glissant (CB)",l:"pivot glissant d'axe (CB)"},{a:2,b:3,t:"pivot (B, z)",l:"pivot d'axe (B, z)"},{a:3,b:0,t:"pivot (O, z)",l:"pivot d'axe (O, z)"}],ferme:true},
  vis:{nm:"de l'axe linéaire à vis-écrou",n:[{k:"0",t:"bâti",x:200,y:36},{k:"1",t:"vis",x:70,y:170},{k:"2",t:"chariot",x:330,y:170}],
    e:[{a:0,b:1,t:"pivot (A, x)",l:"pivot d'axe (A, x)"},{a:1,b:2,t:"hélicoïdale (A, x)",l:"hélicoïdale d'axe (A, x)"},{a:2,b:0,t:"glissière (x)",l:"glissière de direction x"}],ferme:true},
  bielle:{nm:"du système bielle-manivelle",n:[{k:"0",t:"bâti",x:70,y:40},{k:"1",t:"manivelle",x:70,y:170},{k:"2",t:"bielle",x:330,y:170},{k:"3",t:"piston",x:330,y:40}],
    e:[{a:0,b:1,t:"pivot (O, z)",l:"pivot d'axe (O, z)"},{a:1,b:2,t:"pivot (A, z)",l:"pivot d'axe (A, z)"},{a:2,b:3,t:"pivot (B, z)",l:"pivot d'axe (B, z)"},{a:3,b:0,t:"glissière (x)",l:"glissière de direction x"}],ferme:true},
  bras:{nm:"du bras de robot",n:[{k:"0",t:"socle",x:50,y:40},{k:"1",t:"tourelle",x:150,y:130},{k:"2",t:"bras",x:250,y:40},{k:"3",t:"avant-bras",x:350,y:130}],
    e:[{a:0,b:1,t:"pivot (O, z)",l:"pivot d'axe (O, z)"},{a:1,b:2,t:"pivot (A, y)",l:"pivot d'axe (A, y)"},{a:2,b:3,t:"pivot (B, y)",l:"pivot d'axe (B, y)"}],ferme:false},
  eol:{nm:"de l'éolienne",n:[{k:"0",t:"mât",x:50,y:40},{k:"1",t:"nacelle",x:150,y:130},{k:"2",t:"rotor",x:250,y:40},{k:"3",t:"pale",x:350,y:130}],
    e:[{a:0,b:1,t:"pivot (O, z)",l:"pivot d'axe vertical (O, z)"},{a:1,b:2,t:"pivot (A, x)",l:"pivot d'axe (A, x)"},{a:2,b:3,t:"pivot (B, y)",l:"pivot d'axe (B, y)"}],ferme:false},
  robot:{nm:"du robot à bille folle",n:[{k:"1",t:"châssis",x:200,y:36},{k:"2",t:"roue gauche",x:60,y:134},{k:"3",t:"roue droite",x:200,y:134},{k:"4",t:"bille folle",x:340,y:134},{k:"0",t:"sol",x:200,y:232}],
    e:[{a:0,b:1,t:"pivot",l:"pivot",f:0.5},{a:0,b:2,t:"pivot",l:"pivot",f:0.5},{a:0,b:3,t:"rotule",l:"rotule",f:0.5},{a:1,b:4,t:"ponctuelle",l:"ponctuelle",f:0.36},{a:2,b:4,t:"ponctuelle",l:"ponctuelle",f:0.5},{a:3,b:4,t:"ponctuelle",l:"ponctuelle",f:0.36}],ferme:true}
};
const mecaFig=(M,q)=>fx_lia_graphe({n:M.n,e:M.e.map((e,i)=>({...e,q:i===q}))});
/* systèmes à vis-écrou */
const VISY=[["la vis d'un vérin électrique de hayon","la tige","de la tige","à la tige"],["la vis à billes d'un axe d'imprimante 3D","le plateau","du plateau","au plateau"],["la vis trapézoïdale d'une table élévatrice","la table","de la table","à la table"],
  ["la vis d'un étau motorisé","le mors mobile","du mors mobile","au mors mobile"],["la vis à billes d'un robot cartésien","le chariot","du chariot","au chariot"]];
const SYMD={piv:"Un cylindre (solide 1) traversé par un arbre qui porte un arrêt de chaque côté",pg:"Un cylindre (solide 1) traversé par un arbre, sans arrêt",
  hel:"Un cylindre (solide 1) marqué d'un filet hélicoïdal, traversé par un arbre",gli:"Un fourreau prismatique (solide 1) traversé par une barre de section carrée",
  rot:"Une sphère (solide 2) enfermée dans une calotte sphérique (solide 1)",ap:"Deux plaques planes en contact",la:"Une sphère (solide 2) à l'intérieur d'un cylindre creux (solide 1)",
  lr:"Un cylindre (solide 2) couché sur un plan (solide 1)",pon:"Une sphère (solide 2) posée sur un plan (solide 1)"};
const lc1=t=>t.charAt(0).toLowerCase()+t.slice(1);
/* contacts : description, liaison, distracteurs */
const CONTACTS=[
  ["un arbre cylindrique long, guidé dans un alésage de même diamètre, sans aucun arrêt en translation","pg",["piv","gli","la"]],
  ["un arbre cylindrique long, guidé dans un alésage, avec un épaulement d'un côté et un anneau élastique de l'autre qui l'empêchent de coulisser","piv",["pg","enc","gli"]],
  ["une bille logée dans une cavité sphérique de même diamètre","rot",["pon","la","piv"]],
  ["la face plane d'une pièce en appui sur la face plane d'une autre pièce","ap",["pon","lr","gli"]],
  ["une sphère guidée dans un cylindre creux de même diamètre","la",["rot","pg","pon"]],
  ["un rouleau cylindrique posé sur un plan, le contact se faisant le long d'une droite","lr",["pon","ap","pg"]],
  ["une bille posée sur un plan, le contact se faisant en un point","pon",["rot","lr","ap"]],
  ["un coulisseau en queue d'aronde guidé dans une rainure de même forme","gli",["pg","ap","hel"]],
  ["une vis qui tourne dans un écrou taraudé","hel",["pg","piv","gli"]],
  ["deux pièces soudées l'une à l'autre","enc",["piv","ap","rot"]]
];
/* graphe à compléter : mécanisme, liaison cachée, description, bonne réponse, distracteurs */
const GTROU=[
  {M:"vis",i:0,d:`La vis 1 tourne dans ses paliers, montés sur le bâti 0, sans pouvoir se déplacer le long de son axe (A, ${V("x")}).`,k:"piv",e:"La vis tourne sans coulisser : une seule rotation, autour de l'axe",ok:`Pivot d'axe (A, ${V("x")})`,w:[`Pivot glissant d'axe (A, ${V("x")})`,`Hélicoïdale d'axe (A, ${V("x")})`,`Glissière de direction ${V("x")}`]},
  {M:"vis",i:1,d:"L'écrou, fixé au chariot 2, est monté sur la vis 1 : il avance d'un pas à chaque tour de vis.",k:"hel",e:"Rotation et translation de l'écrou par rapport à la vis sont liées par le filet (un pas par tour)",ok:`Hélicoïdale d'axe (A, ${V("x")})`,w:[`Pivot glissant d'axe (A, ${V("x")})`,`Pivot d'axe (A, ${V("x")})`,`Glissière de direction ${V("x")}`]},
  {M:"vis",i:2,d:`Le chariot 2 coulisse suivant ${V("x")} sur le rail du bâti 0, sans pouvoir tourner.`,k:"gli",e:"Le chariot ne peut que coulisser, sans tourner",ok:`Glissière de direction ${V("x")}`,w:[`Pivot glissant d'axe (A, ${V("x")})`,`Hélicoïdale d'axe (A, ${V("x")})`,`Appui plan de normale (A, ${V("z")})`]},
  {M:"verin",i:1,d:"La tige 2 coulisse dans le corps 1 suivant l'axe (CB) du vérin ; le piston cylindrique peut aussi tourner sur lui-même.",k:"pg",e:"La tige peut coulisser et tourner dans le corps, indépendamment",ok:"Pivot glissant d'axe (CB)",w:[`Pivot d'axe (B, ${V("z")})`,"Hélicoïdale d'axe (CB)","Rotule de centre C"]},
  {M:"eol",i:0,d:`La nacelle 1 s'oriente face au vent en tournant autour de l'axe vertical (O, ${V("z")}) du mât 0, sans monter, descendre ni basculer.`,k:"piv",e:"La nacelle ne fait que tourner autour de l'axe vertical du mât",ok:`Pivot d'axe (O, ${V("z")})`,w:[`Pivot glissant d'axe (O, ${V("z")})`,"Rotule de centre O",`Appui plan de normale (O, ${V("z")})`]},
  {M:"robot",i:2,d:"La bille folle 4 tourne librement dans tous les sens dans son logement sphérique du châssis 1, sans pouvoir en sortir.",k:"rot",e:"La bille tourne dans tous les sens sans pouvoir se déplacer dans son logement",ok:"Rotule",w:["Pivot","Ponctuelle","Linéaire annulaire"]},
  {M:"bielle",i:3,d:`Le piston 3 coulisse dans le bâti 0 suivant ${V("x")} ; dans ce modèle plan, il ne tourne pas.`,k:"gli",e:"Dans le plan, le piston ne fait que coulisser horizontalement",ok:`Glissière de direction ${V("x")}`,w:[`Pivot d'axe (B, ${V("z")})`,`Hélicoïdale d'axe (B, ${V("x")})`,"Encastrement"]}
];
/* nomenclatures pour la recherche des classes d'équivalence */
const NOMS=[
  {nm:"Axe linéaire motorisé",rows:[["1","Socle","fixé au sol"],["2","Rail de guidage","vissé sur le socle 1"],["3","Support moteur","vissé sur le socle 1"],["4","Stator du moteur","vissé sur le support 3"],["5","Rotor du moteur","tourne dans le stator 4"],["6","Accouplement rigide","serré sur le rotor 5 et sur la vis 7"],["7","Vis à billes","tourne dans les paliers 8"],["8","Paliers","vissés sur le socle 1"],["9","Écrou à billes","monté sur la vis 7 (filetage)"],["10","Chariot","vissé sur l'écrou 9, coulisse sur le rail 2"],["11","Soufflet de protection","en caoutchouc, déformable"]],
    cls:[["1","2","3","4","8"],["5","6","7"],["9","10"]],exc:"11",q:"6",qn:"l'accouplement 6",fem:false},
  {nm:"Vérin pneumatique",rows:[["1","Tube (corps)","fixé sur la machine"],["2","Fond arrière","vissé sur le tube 1"],["3","Nez (palier de tige)","vissé sur le tube 1"],["4","Tige","coulisse dans le nez 3"],["5","Piston","vissé sur la tige 4, coulisse dans le tube 1"],["6","Écrou de piston","serré sur la tige 4"],["7","Joints d'étanchéité","en élastomère, déformables"],["8","Chape de tige","vissée sur la tige 4"]],
    cls:[["1","2","3"],["4","5","6","8"]],exc:"7",q:"5",qn:"le piston 5",fem:false},
  {nm:"Motoréducteur de portail",rows:[["1","Carter","fixé sur le pilier"],["2","Couvercle","vissé sur le carter 1"],["3","Arbre moteur (pignon taillé dans l'arbre)","tourne dans le carter 1"],["4","Roue dentée","clavetée sur l'arbre de sortie 5"],["5","Arbre de sortie","tourne dans le carter 1"],["6","Clavette","logée dans la roue 4 et dans l'arbre 5"],["7","Bras de manœuvre","fixé sur l'arbre 5 par la vis 8"],["8","Vis","serre le bras 7 sur l'arbre 5"],["9","Joint à lèvre","en élastomère, déformable"]],
    cls:[["1","2"],["3"],["4","5","6","7","8"]],exc:"9",q:"4",qn:"la roue dentée 4",fem:true}
];
const clsT=c=>`{${c.join(", ")}}`;
/* besoins exprimés dans un cahier des charges */
const BESOINS=[
  [`La table d'une fraiseuse doit se déplacer uniquement suivant ${V("x")}, sans pouvoir tourner.`,`Glissière de direction ${V("x")}`,[`Pivot glissant d'axe (O, ${V("x")})`,`Pivot d'axe (O, ${V("x")})`,`Appui plan de normale (O, ${V("z")})`],"gli"],
  [`Le plateau d'une platine tournante doit tourner autour de l'axe vertical (O, ${V("z")}), sans monter, descendre ni basculer.`,`Pivot d'axe (O, ${V("z")})`,[`Pivot glissant d'axe (O, ${V("z")})`,"Rotule de centre O",`Hélicoïdale d'axe (O, ${V("z")})`],"piv"],
  ["La tête d'un trépied photo doit pouvoir s'orienter dans toutes les directions autour du point O, sans se déplacer.","Rotule de centre O",[`Pivot d'axe (O, ${V("z")})`,`Ponctuelle de normale (O, ${V("z")})`,`Linéaire annulaire d'axe (O, ${V("z")})`],"rot"],
  [`Le plateau d'un vérin électrique doit avancer de 5 mm suivant ${V("x")} à chaque tour de la vis d'axe (O, ${V("x")}).`,`Hélicoïdale d'axe (O, ${V("x")})`,[`Pivot glissant d'axe (O, ${V("x")})`,`Pivot d'axe (O, ${V("x")})`,`Glissière de direction ${V("x")}`],"hel"],
  [`La tige de commande d'une vanne doit pouvoir coulisser suivant son axe (O, ${V("y")}) et tourner sur elle-même, les deux mouvements étant indépendants.`,`Pivot glissant d'axe (O, ${V("y")})`,[`Hélicoïdale d'axe (O, ${V("y")})`,`Glissière de direction ${V("y")}`,`Pivot d'axe (O, ${V("y")})`],"pg"],
  [`Le patin d'une machine doit rester à plat sur un sol horizontal : il peut glisser dans toutes les directions du sol et tourner autour de la verticale (O, ${V("z")}), sans basculer.`,`Appui plan de normale (O, ${V("z")})`,[`Ponctuelle de normale (O, ${V("z")})`,`Glissière de direction ${V("x")}`,`Pivot d'axe (O, ${V("z")})`],"ap"]
];
/* liaisons en série : description, pièce étudiée, nombre de mouvements, mouvements */
const SERIE=[
  {d:`Une caméra 2 tourne autour de l'axe (B, ${V("z")}) par rapport à un chariot 1 (pivot) ; le chariot 1 coulisse suivant ${V("x")} sur le rail 0 (glissière).`,w:"la caméra 2",b:"au rail 0",n:2,m:`${TT("x")} et une rotation autour de (B, ${V("z")})`},
  {d:`Sur une table croisée, le chariot 1 coulisse suivant ${V("x")} sur le bâti 0 (glissière) et le plateau 2 coulisse suivant ${V("y")} sur le chariot 1 (glissière).`,w:"le plateau 2",b:"au bâti 0",n:2,m:`${TT("x")} et ${TT("y")}`},
  {d:`Robot cartésien : le chariot 1 coulisse suivant ${V("x")} sur le bâti 0, le coulisseau 2 suivant ${V("y")} sur 1 et la tête 3 suivant ${V("z")} sur 2 (trois glissières).`,w:"la tête 3",b:"au bâti 0",n:3,m:`${TT("x")}, ${TT("y")} et ${TT("z")}`},
  {d:`Une tourelle 1 tourne autour de l'axe vertical (O, ${V("z")}) par rapport au socle 0 (pivot) ; un bras 2 tourne autour de l'axe horizontal (A, ${V("y")}) de la tourelle (pivot).`,w:"le bras 2",b:"au socle 0",n:2,m:`une rotation autour de (O, ${V("z")}) et une rotation autour de (A, ${V("y")})`},
  {d:`Le mât 1 d'un parasol coulisse verticalement suivant ${V("z")} dans son pied 0 (glissière) ; la toile 2 tourne autour de l'axe du mât (O, ${V("z")}) (pivot).`,w:"la toile 2",b:"au pied 0",n:2,m:`${TT("z")} et ${RR("z")}, indépendantes (comme une pivot glissant)`}
];
/* liaisons en parallèle */
const PARA=[
  {d:`Un arbre est guidé par deux roulements : en A, un roulement modélisé par une rotule de centre A ; en B, un roulement modélisé par une linéaire annulaire d'axe (A, ${V("x")}), B étant sur cet axe.`,ok:`Pivot d'axe (A, ${V("x")})`,w:[`Pivot glissant d'axe (A, ${V("x")})`,"Rotule de centre A",`Linéaire annulaire d'axe (A, ${V("x")})`],e:`La rotule interdit toute translation ; la linéaire annulaire n'autorise que des rotations autour de B. Seule la rotation autour de la droite (AB) est permise par les deux`},
  {d:`Un arbre est guidé par deux bagues courtes, en A et en B, chacune modélisée par une linéaire annulaire d'axe (A, ${V("x")}).`,ok:`Pivot glissant d'axe (A, ${V("x")})`,w:[`Pivot d'axe (A, ${V("x")})`,`Linéaire annulaire d'axe (A, ${V("x")})`,`Glissière de direction ${V("x")}`],e:`Les deux liaisons laissent la translation suivant ${V("x")} et la rotation autour de l'axe ; une rotation autour d'un axe perpendiculaire passant par A écarterait B de l'axe, elle est donc interdite`},
  {d:`Une table est guidée par deux colonnes parallèles, d'axes (A, ${V("x")}) et (B, ${V("x")}) distincts ; chaque colonne est modélisée par une pivot glissant.`,ok:`Glissière de direction ${V("x")}`,w:[`Pivot glissant d'axe (A, ${V("x")})`,`Appui plan de normale (A, ${V("z")})`,"Encastrement"],e:`Les deux pivots glissants laissent la translation suivant ${V("x")} ; une rotation autour de (A, ${V("x")}) déplacerait la colonne B, et inversement : aucune rotation ne reste`},
  {d:`Une roue est montée sur un arbre par un centrage court, modélisé par une linéaire annulaire d'axe (A, ${V("x")}), et plaquée contre un épaulement, modélisé par un appui plan de normale (A, ${V("x")}).`,ok:`Pivot d'axe (A, ${V("x")})`,w:[`Pivot glissant d'axe (A, ${V("x")})`,`Appui plan de normale (A, ${V("x")})`,"Rotule de centre A"],e:`La linéaire annulaire laisse ${TT("x")}, ${RR("x")}, ${RR("y")}, ${RR("z")} ; l'appui plan laisse ${TT("y")}, ${TT("z")}, ${RR("x")}. Le seul mouvement commun est ${RR("x")}`},
  {d:`Un portail est suspendu à deux gonds sur l'axe vertical (O, ${V("z")}) : le gond du bas, sur lequel il repose, est modélisé par une rotule de centre O ; celui du haut par une linéaire annulaire d'axe (O, ${V("z")}).`,ok:`Pivot d'axe (O, ${V("z")})`,w:[`Pivot glissant d'axe (O, ${V("z")})`,"Rotule de centre O",`Glissière de direction ${V("z")}`],e:`La rotule interdit les translations (le portail ne monte pas) ; la linéaire annulaire du haut interdit les basculements. Il ne reste que la rotation autour de (O, ${V("z")})`}
];
/* liaison équivalente à des liaisons en série */
const SERIE2=[
  {d:`La pièce 2 est reliée au bâti 0 par l'intermédiaire de la pièce 1 : glissière de direction ${V("x")} entre 1 et 0 ; pivot d'axe (A, ${V("x")}) entre 2 et 1.`,who:"entre 2 et 0",ok:`Pivot glissant d'axe (A, ${V("x")})`,w:[`Pivot d'axe (A, ${V("x")})`,`Hélicoïdale d'axe (A, ${V("x")})`,`Glissière de direction ${V("x")}`],e:`Les mobilités s'ajoutent : ${TT("x")} (glissière) et ${RR("x")} (pivot), indépendantes l'une de l'autre`},
  {d:`Nacelle de caméra stabilisée : la pièce 1 tourne autour de (O, ${V("z")}) par rapport au support 0 (pivot), la pièce 2 autour de (O, ${V("x")}) par rapport à 1 (pivot), la caméra 3 autour de (O, ${V("y")}) par rapport à 2 (pivot) ; les trois axes se coupent en O.`,who:"entre la caméra 3 et le support 0",ok:"Rotule de centre O",w:[`Pivot d'axe (O, ${V("z")})`,`Ponctuelle de normale (O, ${V("z")})`,"Encastrement"],e:"Les mobilités s'ajoutent : trois rotations indépendantes autour de trois axes passant par O, et aucune translation"},
  {d:`La pièce 2 est reliée au bâti 0 par l'intermédiaire de la pièce 1 : pivot glissant d'axe (A, ${V("x")}) entre 1 et 0 ; rotule de centre B entre 2 et 1, B étant sur l'axe (A, ${V("x")}).`,who:"entre 2 et 0",ok:`Linéaire annulaire d'axe (A, ${V("x")})`,w:[`Pivot glissant d'axe (A, ${V("x")})`,"Rotule de centre B",`Ponctuelle de normale (A, ${V("x")})`],e:`Les mobilités s'ajoutent : translation le long de l'axe et trois rotations autour de B, qui se déplace sur l'axe`},
  {d:`La pièce 2 est reliée au bâti 0 par l'intermédiaire de la pièce 1 : pivot d'axe (O, ${V("z")}) entre 1 et 0 ; glissière de direction ${V("z")} entre 2 et 1.`,who:"entre 2 et 0",ok:`Pivot glissant d'axe (O, ${V("z")})`,w:[`Pivot d'axe (O, ${V("z")})`,`Glissière de direction ${V("z")}`,`Hélicoïdale d'axe (O, ${V("z")})`],e:`Les mobilités s'ajoutent : rotation autour de (O, ${V("z")}) et translation suivant ${V("z")}, indépendantes`}
];
const PAS=[2,4,5,10,16,20,25];

POOLS["meca-liaisons"]={
  titre:"Liaisons et schéma cinématique",
  fiche:{t:"Liaisons mécaniques",l:[
    `Mobilités : T (translation), R (rotation). Pivot : ${F("1 R (1 ddl)")} ; glissière : ${F("1 T (1 ddl)")} ; pivot glissant : ${F("1 T + 1 R (2 ddl)")} ; encastrement : 0 ddl.`,
    `Rotule : ${F("3 R (3 ddl)")} ; appui plan : ${F("2 T + 1 R (3 ddl)")} ; linéaire annulaire et linéaire rectiligne : 4 ddl ; ponctuelle : ${F("5 ddl")}.`,
    `Arbre long dans un alésage : ${F("pivot glissant")} ; sphère dans un cylindre : ${F("linéaire annulaire")} ; cylindre posé sur un plan : ${F("linéaire rectiligne")}.`,
    `Classe d'équivalence : ${F("pièces sans mouvement relatif")} (pièces déformables exclues) ; graphe : une ellipse par classe, un trait par liaison ; vis-écrou : ${F("v = p·N")}, N en tr/s.`,
    `Pièges : sans arrêts axiaux, ce n'est pas une pivot ; vis-écrou : ${F("hélicoïdale, 1 seul ddl")} ; liaisons en parallèle : ${F("seuls les mouvements communs restent")}.`]},
  count:{1:4,2:4,3:3},
  1:[
    /* nombre de degrés de liberté */
    ()=>{ const k=rnd(["enc","piv","gli","hel","pg","rot","ap","la","lr","pon"]), u=rnd(AX), w=rnd(AX.filter(a=>a!==u)), l=LIA[k], m=l.mob(u,w);
      return {q:`Combien de degrés de liberté une liaison ${lname(k,u,w)} possède-t-elle ?`,type:"num",ans:l.d,tolA:0,unit:"",
        expl:k==="enc"?`Encastrement : ${WHY.enc} ${F("0 degré de liberté")}.`
          :k==="hel"?`Mouvements possibles : ${TT(u)} et ${RR(u)}, mais ${WHY.hel} Un seul mouvement indépendant : ${F("1 degré de liberté")}.`
          :`Liaison ${l.n}${ALTN[k]||""} : ${WHY[k]} Mouvements relatifs possibles : ${mobT(m)}. Chaque mouvement indépendant compte pour un : ${F(ddl(l.d))}.`}; },
    /* mobilités d'une liaison nommée */
    ()=>{ const k=rnd(["piv","gli","hel","pg","rot","ap","la","lr","pon"]), u=rnd(AX), w=rnd(AX.filter(a=>a!==u)), m=LIA[k].mob(u,w);
      let ok, wr=[];
      if(k==="hel"){ ok=`${TT(u)} et ${RR(u)}, liées l'une à l'autre`; wr=[`${TT(u)} et ${RR(u)}, indépendantes`,`${RR(u)} seulement`,`${TT(u)} seulement`]; }
      else { ok=mobT(m); const seen=new Set([mobKey(m)]);
        shuffle(["piv","gli","pg","rot","ap","la","lr","pon"].filter(x=>x!==k)).forEach(x=>{ const mm=LIA[x].mob(u,w); if(wr.length<3&&!seen.has(mobKey(mm))){ seen.add(mobKey(mm)); wr.push(mobT(mm)); } }); }
      return {q:`Quels mouvements relatifs une liaison ${lname(k,u,w)} autorise-t-elle ? (T : translation, R : rotation)`,type:"ch",...mc(ok,wr),
        expl:`Liaison ${LIA[k].n}${ALTN[k]||""} : ${WHY[k]} Mobilités : ${F(k==="hel"?`${TT(u)} et ${RR(u)} liées`:mobT(m))}, soit ${ddl(LIA[k].d)}.`}; },
    /* tableau des mobilités → liaison */
    ()=>{ const k=rnd(["enc","piv","gli","pg","rot","ap","la","lr","pon"]), u=rnd(AX), w=rnd(AX.filter(a=>a!==u)), m=LIA[k].mob(u,w);
      return {data:mobTab(m),ctx:"Dans le tableau, 1 signifie que le mouvement relatif est possible, 0 qu'il est impossible.",q:"Ce tableau donne les mobilités d'une liaison entre deux solides. De quelle liaison s'agit-il ?",type:"ch",...mc(cap(lname(k,u,w)),lnWrong(k,u,w,3)),
        expl:`Mobilités : ${mobT(m)}, soit ${ddl(LIA[k].d)}. C'est une liaison ${F(LIA[k].n)}${ALTN[k]||""} : ${WHY[k]}`}; },
    /* symbole en perspective → nom */
    ()=>{ const k=rnd(["piv","gli","hel","pg","rot","ap","la","lr","pon"]);
      const CF={piv:["pg","hel","gli"],pg:["piv","hel","la"],hel:["pg","piv","gli"],gli:["pg","piv","ap"],rot:["pon","la","piv"],ap:["pon","lr","gli"],la:["rot","pg","pon"],lr:["pon","ap","la"],pon:["rot","lr","ap"]}[k];
      return {fig:fx_lia_sym(k),ctx:"Symbole normalisé en perspective : le solide 1 est dessiné en noir (relié à un bâti hachuré), le solide 2 en bleu.",q:"Quelle liaison ce symbole représente-t-il ?",type:"ch",...mc(cap(LIA[k].n),CF.map(x=>cap(LIA[x].n))),
        expl:`${SYMD[k]} : liaison ${F(LIA[k].n)}${ALTN[k]||""}. En effet, ${WHY[k]}`}; },
    /* description du contact → liaison */
    ()=>{ const [d,k,w]=rnd(CONTACTS);
      return {q:`Quelle liaison modélise le contact suivant : ${d} ?`,type:"ch",...mc(cap(LIA[k].n),w.map(x=>cap(LIA[x].n))),
        expl:`${cap(d)} : ${WHY[k]} C'est une liaison ${F(LIA[k].n)}${ALTN[k]||""}, à ${ddl(LIA[k].d)}.`}; },
    /* hélicoïdale : v = p·N */
    ()=>{ const [sys,obj,de,ao]=rnd(VISY), p=rnd([2,4,5,8,10,12,16,20]), N=rnd([2.5,4,5,8,10,12.5,15,20,25]), v=p*N;
      return {ctx:`${cap(sys)} a un pas p = ${p} mm. L'écrou est lié ${ao}, qui ne peut pas tourner.`,q:`La vis tourne à N = ${nf(N,1)} tr/s. Quelle est la vitesse de translation ${de} ?`,type:"num",ans:v,tolR:0.02,unit:"mm/s",
        expl:`Liaison hélicoïdale : à chaque tour de vis, l'écrou avance d'un pas. ${F("v = p·N")} = ${p} × ${nf(N,1)} = ${U(v,"mm/s")}.`}; },
    /* hélicoïdale : déplacement pour n tours, ou nombre de tours pour une course */
    ()=>{ const [sys,obj,de,ao]=rnd(VISY), p=rnd([2,4,5,8,10,12,16,20]);
      if(Math.random()<0.5){ const n=rnd([6,10,12.5,15,20,25,40,50]), x=n*p;
        return {ctx:`${cap(sys)} a un pas p = ${p} mm ; l'écrou est lié ${ao}.`,q:`La vis fait ${nf(n,1)} tours. Quel est le déplacement ${de} ?`,type:"num",ans:x,tolR:0.02,unit:"mm",
          expl:`Un tour de vis fait avancer l'écrou d'un pas : ${F("x = n·p")} = ${nf(n,1)} × ${p} = ${U(x,"mm")}.`}; }
      const c=rnd([60,80,100,120,150,200,250,300]), n=c/p;
      return {ctx:`${cap(sys)} a un pas p = ${p} mm ; l'écrou est lié ${ao}.`,q:`Le déplacement ${de} doit être de ${c} mm. Combien de tours la vis doit-elle faire ?`,type:"num",ans:n,tolR:0.02,unit:"tours",
        expl:`Un tour de vis fait avancer l'écrou d'un pas : ${F(`n = ${FRAC("course","p")}`)} = ${FRAC(`${c} mm`,`${p} mm`)} = ${U(n,"tours")}.`}; },
    /* mouvement permis par une liaison */
    ()=>{ const k=rnd(["piv","gli","hel","pg"]), u=rnd(AX);
      const MV={piv:`Une rotation autour de l'axe ${AXE("O",u)}`,gli:`Une translation rectiligne de direction ${V(u)}`,hel:`Une rotation autour de ${AXE("O",u)} accompagnée d'une translation le long de cet axe, les deux étant liées`,pg:`Une rotation autour de ${AXE("O",u)} et une translation le long de cet axe, indépendantes l'une de l'autre`};
      const NM={piv:"une rotation",gli:"une translation rectiligne",hel:"un mouvement hélicoïdal",pg:"rotation et translation indépendantes"};
      return {q:`La pièce 2 n'est reliée au bâti 0 que par une liaison ${lname(k,u)}. Quel mouvement de 2 par rapport à 0 cette liaison permet-elle ?`,type:"ch",...mc(MV[k],Object.keys(MV).filter(x=>x!==k).map(x=>MV[x])),
        expl:`Liaison ${LIA[k].n} : ${WHY[k]} Le mouvement de 2 par rapport à 0 est donc ${F(NM[k])}${k==="hel"?", comme celui d'un écrou qui se visse":""}.`}; },
    /* lecture d'un graphe des liaisons */
    ()=>{ const v=rnd([0,1,2]), key=v===2?rnd(["verin","vis","bielle","bras","eol"]):rnd(["verin","vis","bielle","bras","eol","robot"]), M=MECA[key], fig=mecaFig(M,-1);
      if(v===0) return {fig,q:`Voici le graphe des liaisons ${M.nm}. Combien de classes d'équivalence comporte-t-il, bâti (ou sol) compris ?`,type:"num",ans:M.n.length,tolA:0,unit:"",
        expl:`Chaque ellipse représente une classe d'équivalence : ${M.n.map(n=>`${n.k} (${n.t})`).join(", ")}, soit ${F(`${M.n.length} classes`)}.`};
      if(v===1) return {fig,q:`Voici le graphe des liaisons ${M.nm}. Combien de liaisons comporte-t-il ?`,type:"num",ans:M.e.length,tolA:0,unit:"",
        expl:`Chaque trait entre deux ellipses représente une liaison : ${M.e.map(e=>`${M.n[e.a].k}-${M.n[e.b].k} ${e.l}`).join(" ; ")}, soit ${F(`${M.e.length} liaisons`)}. ${M.ferme?"Les liaisons forment une boucle : c'est une chaîne fermée.":"Il n'y a pas de boucle : c'est une chaîne ouverte."}`};
      const i=Math.floor(Math.random()*M.e.length), e=M.e[i], A=M.n[e.a], B=M.n[e.b], others=M.e.filter((_,j)=>j!==i).map(x=>cap(x.l));
      const extra=["Encastrement","Rotule de centre O","Appui plan de normale (O, z)"].filter(x=>!others.includes(x)&&x!==cap(e.l));
      return {fig,q:`Voici le graphe des liaisons ${M.nm}. Quelle liaison relie la classe ${A.k} (${A.t}) et la classe ${B.k} (${B.t}) ?`,type:"ch",...mc(cap(e.l),[...others,...extra].slice(0,3)),
        expl:`On lit l'étiquette du trait qui relie les ellipses ${A.k} et ${B.k} : ${F(e.l)}.`}; },
    /* trajectoire d'un point d'un solide guidé par une seule liaison */
    ()=>{ const v=rnd(["piv","gli","hel"]);
      if(v==="piv"){ const r=rnd([80,120,150,200,250]);
        return {q:`Le bras 2 d'un robot n'est relié au bâti 0 que par une liaison pivot d'axe (O, ${V("z")}). Le point A du bras, situé dans le plan (O, ${V("x")}, ${V("y")}), est à ${r} mm de O. Quelle est la trajectoire de A dans le mouvement de 2 par rapport à 0 ?`,type:"ch",
          ...mc(`Un cercle (ou un arc de cercle) de centre O et de rayon ${r} mm`,["Un segment de droite passant par O",`Un cercle de centre A et de rayon ${r} mm`,`Une hélice d'axe (O, ${V("z")})`]),
          expl:`Avec une pivot, 2 ne peut que tourner autour de l'axe (O, ${V("z")}) : chaque point garde sa distance à l'axe. ${F("A décrit un cercle de centre O")} et de rayon OA = ${r} mm (un arc si la rotation est limitée).`}; }
      if(v==="gli") return {q:`Le chariot 2 n'est relié au bâti 0 que par une liaison glissière de direction ${V("x")}. Quelle est la trajectoire d'un point M du chariot dans son mouvement par rapport à 0 ?`,type:"ch",
          ...mc(`Un segment de droite parallèle à ${V("x")}`,["Un arc de cercle de centre M",`Un segment de droite parallèle à ${V("y")}`,`Une hélice d'axe parallèle à ${V("x")}`]),
          expl:`Une glissière n'autorise qu'une translation rectiligne : tous les points du chariot décrivent ${F(`des segments parallèles à ${V("x")}`)}.`};
      return {q:`L'écrou 2 se visse sur une vis 0 immobile (liaison hélicoïdale d'axe (O, ${V("x")})). Quelle est la trajectoire d'un point M de l'écrou situé hors de l'axe ?`,type:"ch",
          ...mc(`Une hélice d'axe (O, ${V("x")})`,[`Un cercle d'axe (O, ${V("x")})`,`Un segment de droite parallèle à ${V("x")}`,"Une spirale plane"]),
          expl:`L'écrou tourne autour de l'axe et avance en même temps, d'un pas par tour : M décrit ${F(`une hélice d'axe (O, ${V("x")})`)}, de même pas que la vis.`}; },
    /* classes d'équivalence et graphe : questions de cours */
    ()=>{ const v=rnd([0,1,2,3]);
      if(v===0) return {q:"Quand dit-on que deux pièces d'un mécanisme appartiennent à la même classe d'équivalence cinématique ?",type:"ch",...mc("Quand elles n'ont aucun mouvement relatif pendant le fonctionnement",["Quand elles sont en contact l'une avec l'autre","Quand elles sont fabriquées dans le même matériau","Quand elles sont reliées par une liaison pivot"]),
        expl:`Une classe d'équivalence regroupe ${F("les pièces sans mouvement relatif")} : elles se comportent comme un seul solide. Deux pièces en contact peuvent au contraire bouger l'une par rapport à l'autre (arbre dans un palier).`};
      if(v===1) return {q:"Comment traite-t-on un ressort ou un joint d'étanchéité quand on recherche les classes d'équivalence d'un mécanisme ?",type:"ch",...mc("On l'exclut : c'est une pièce déformable, qui n'appartient à aucune classe",["Il forme à lui seul une classe d'équivalence","On le range avec la pièce la plus lourde","On le range toujours dans la classe du bâti"]),
        expl:`Une classe d'équivalence regroupe des solides indéformables sans mouvement relatif. Les ${F("pièces déformables")} (ressorts, joints, soufflets) ne sont rangées dans aucune classe.`};
      if(v===2) return {q:"Dans un graphe des liaisons, que représente un trait qui relie deux ellipses ?",type:"ch",...mc("Une liaison entre deux classes d'équivalence",["Une pièce du mécanisme","Un contact entre deux pièces d'une même classe","Un effort extérieur appliqué au mécanisme"]),
        expl:`Chaque ellipse est une classe d'équivalence ; chaque trait est ${F("une liaison")} entre deux classes, étiquetée par son nom et ses caractéristiques (centre, axe, normale).`};
      return {q:"Une vis de fixation serre un couvercle sur un carter. À quelle classe d'équivalence appartient cette vis ?",type:"ch",...mc("À la même classe que le carter et le couvercle",["À une classe à elle seule, car elle a été vissée","À aucune classe, car c'est un élément de visserie","À la classe de l'arbre qui tourne dans le carter"]),
        expl:`Une fois serrée, la vis n'a plus de mouvement par rapport au couvercle et au carter : ${F("même classe d'équivalence")}. Seul le mouvement pendant le fonctionnement compte, pas le montage.`}; },
    /* axe d'une liaison lu sur une figure en perspective */
    ()=>{ const k=rnd(["piv","pg","gli","hel"]), u=rnd(AX), g=k==="gli";
      return {fig:fx_lia_axes(k,u),q:`Ce symbole représente une liaison ${LIA[k].n}. Dans le repère dessiné, quel${g?"le est sa direction":" est son axe"} ?`,type:"ch",
        ch:AX.map(a=>g?`Direction ${V(a)}`:`Axe (O, ${V(a)})`),ok:AX.indexOf(u),
        expl:`${g?"La barre":"L'arbre"} (en bleu) est ${u==="x"?`horizontal, parallèle à ${V("x")}`:u==="y"?`dirigé suivant la direction fuyante ${V("y")}`:`vertical, parallèle à ${V("z")}`} : ${F(g?`direction ${V(u)}`:`axe (O, ${V(u)})`)}.`}; }
  ],
  2:[
    /* grille de symboles */
    ()=>{ const ks=pick(["piv","gli","hel","pg","rot","ap","la","lr","pon"],4), t=Math.floor(Math.random()*4);
      return {fig:fx_lia_grille(ks),ctx:"Symboles normalisés en perspective : solide 1 en noir, solide 2 en bleu.",q:`Quel symbole représente une liaison ${LIA[ks[t]].n} ?`,type:"ch",ch:["Symbole 1","Symbole 2","Symbole 3","Symbole 4"],ok:t,
        expl:`${ks.map((k,i)=>`${i+1} : ${LIA[k].n}`).join(" ; ")}. La liaison ${LIA[ks[t]].n} est le ${F(`symbole ${t+1}`)} : ${lc1(SYMD[ks[t]])}.`}; },
    /* système bielle-manivelle : liaisons */
    ()=>{ const fig=sBielle({ph:rnd([40,60,120,140])}), ctx="Système bielle-manivelle, modèle plan : la figure est dans le plan (x, y), x horizontal ; z est perpendiculaire à la figure. 0 : bâti, 1 : manivelle, 2 : bielle, 3 : piston.";
      const P=rnd([["O","la manivelle 1 au bâti 0"],["A","la manivelle 1 à la bielle 2"],["B","la bielle 2 au piston 3"]]);
      const q1={fig,ctx,q:`Quelle liaison relie ${P[1]} ?`,type:"ch",...mc(`Pivot d'axe (${P[0]}, ${V("z")})`,[`Pivot d'axe (${P[0]}, ${V("x")})`,`Rotule de centre ${P[0]}`,`Glissière de direction ${V("x")}`]),
        expl:`En ${P[0]}, le petit cercle est le symbole plan d'une liaison pivot dont l'axe est perpendiculaire à la figure : ${F(`pivot d'axe (${P[0]}, ${V("z")})`)}. Les deux pièces tournent l'une par rapport à l'autre dans le plan de la figure.`};
      const q2=Math.random()<0.5?{fig,ctx,q:"Combien de classes d'équivalence ce mécanisme comporte-t-il, bâti compris ?",type:"num",ans:4,tolA:0,unit:"",
          expl:`Bâti 0, manivelle 1, bielle 2, piston 3 : ${F("4 classes d'équivalence")}, reliées par 4 liaisons qui forment une chaîne fermée (pivots en O, A et B, glissière entre 3 et 0).`}
        :{fig,ctx,q:"Dans ce modèle plan, quelle liaison modélise le guidage du piston 3 dans le bâti 0 ?",type:"ch",...mc(`Glissière de direction ${V("x")}`,[`Pivot d'axe (B, ${V("z")})`,`Ponctuelle de normale (B, ${V("y")})`,"Encastrement"]),
          expl:`Le piston ne peut que coulisser horizontalement entre les deux guides du bâti : dans le plan, c'est une ${F(`glissière de direction ${V("x")}`)}. En trois dimensions, un piston cylindrique peut aussi tourner sur lui-même (pivot glissant), sans effet dans le plan.`};
      return [q1,q2]; },
    /* mécanisme vérin-levier : liaison tige/corps, puis mouvement */
    ()=>{ const fig=fx_lia_verin({th:rnd([100,108,118,126])}), ctx="Modèle plan dans le plan (x, y) ; z est perpendiculaire à la figure. 0 : bâti, 1 : corps du vérin, 2 : tige (avec le piston), 3 : levier.";
      const q1={fig,ctx,q:"Quelle liaison relie la tige 2 au corps 1 du vérin ?",type:"ch",...mc("Pivot glissant d'axe (CB)",[`Pivot d'axe (B, ${V("z")})`,"Rotule de centre C","Encastrement"]),
        expl:`La tige coulisse dans le corps suivant l'axe (CB), et rien n'empêche le piston cylindrique de tourner sur lui-même : ${F("pivot glissant d'axe (CB)")}. Sur le schéma, c'est la tige qui entre dans le rectangle du corps.`};
      const q2=Math.random()<0.5?{fig,ctx,q:"Quel est le mouvement du corps 1 par rapport au bâti 0 ?",type:"ch",...mc(`Une rotation autour de l'axe (C, ${V("z")})`,["Une translation rectiligne suivant (CB)","Une translation circulaire","Aucun : le corps reste immobile"]),
          expl:`Le corps n'est lié au bâti que par la pivot en C. Quand la tige sort, le levier tourne, la direction (CB) change et le corps ${F(`tourne autour de (C, ${V("z")})`)}.`}
        :{fig,ctx,q:"Quel est le mouvement du levier 3 par rapport au bâti 0 ?",type:"ch",...mc(`Une rotation autour de l'axe (O, ${V("z")})`,["Une translation rectiligne suivant (CB)",`Une rotation autour de l'axe (B, ${V("z")})`,"Une translation circulaire"]),
          expl:`Le levier n'est lié au bâti que par la pivot en O : ${F(`rotation autour de (O, ${V("z")})`)}. La tige, en poussant en B, le fait tourner.`};
      return [q1,q2]; },
    /* axe linéaire à vis-écrou : liaison, puis vitesse */
    ()=>{ const p=rnd([2,4,5,8,10]), N=rnd([300,450,600,750,900,1200,1500]), v=p*N/60, fig=fx_lia_vis({v:1});
      const ctx=`Axe linéaire, modèle plan : le moteur entraîne directement la vis 1, guidée en A par rapport au bâti 0 ; l'écrou, fixé au chariot 2, est monté sur la vis ; le chariot coulisse sur le rail du bâti. Pas de la vis : p = ${p} mm.`;
      return [{fig,ctx,q:"Quelle liaison relie le chariot 2 (écrou) à la vis 1 ?",type:"ch",...mc(`Hélicoïdale d'axe (A, ${V("x")})`,[`Pivot glissant d'axe (A, ${V("x")})`,`Pivot d'axe (A, ${V("x")})`,"Encastrement"]),
          expl:`Le rectangle barré de traits obliques (le filet) est le symbole de la liaison ${F("hélicoïdale")} : l'écrou avance d'un pas à chaque tour de vis. Rotation et translation sont liées : ce n'est pas une pivot glissant.`},
        {fig,ctx,q:`La vis tourne à N = ${nf(N,0)} tr/min. Quelle est la vitesse du chariot, en mm/s ?`,type:"num",ans:v,tolR:0.02,unit:"mm/s",
          expl:`N = ${FRAC(nf(N,0),"60")} = ${nf(N/60,2)} tr/s. ${F("v = p·N")} = ${p} × ${nf(N/60,2)} = ${U(v,"mm/s")}.`}]; },
    /* graphe des liaisons à compléter */
    ()=>{ const g=rnd(GTROU), M=MECA[g.M];
      return {fig:mecaFig(M,g.i),ctx:g.d,q:`Graphe des liaisons ${M.nm} : quelle liaison faut-il inscrire à la place du « ? » ?`,type:"ch",...mc(g.ok,g.w),
        expl:`${g.e} : ${F(lc1(g.ok))}.`}; },
    /* nomenclature → classes d'équivalence */
    ()=>{ const S=rnd(NOMS), data=table(["Repère","Pièce","Montage"],S.rows), ctx=`${S.nm} : nomenclature simplifiée.`, idx=S.cls.findIndex(c=>c.includes(S.q)), others=S.cls[idx].filter(x=>x!==S.q);
      const list=S.cls.map(clsT).join(", ");
      if(Math.random()<0.5) return {data,ctx,q:"Combien de classes d'équivalence ce mécanisme comporte-t-il ?",type:"num",ans:S.cls.length,tolA:0,unit:"",
        expl:`On regroupe les pièces sans mouvement relatif (vissées, serrées, clavetées…) : ${list}. La pièce ${S.exc}, déformable, n'appartient à aucune classe. Il y a ${F(`${S.cls.length} classes d'équivalence`)}.`};
      const avec=c=>c.length>1?`Avec les pièces ${c.join(", ")}`:`Avec la pièce ${c[0]}`, wr=S.cls.filter((_,i)=>i!==idx).map(avec);
      return {data,ctx,q:`Avec quelles pièces ${S.qn} forme-t-${S.fem?"elle":"il"} une classe d'équivalence ?`,type:"ch",...mc(avec(others),[...wr,`Avec aucune : ${S.fem?"elle":"il"} forme une classe à ${S.fem?"elle seule":"lui seul"}`].slice(0,3)),
        expl:`${cap(S.qn)} n'a aucun mouvement relatif avec ${others.length>1?"les pièces":"la pièce"} ${others.join(", ")} : classe ${F(clsT(S.cls[idx]))}. Les classes sont ${list} ; la pièce ${S.exc}, déformable, est exclue.`}; },
    /* hélicoïdale : fréquence de rotation nécessaire */
    ()=>{ const [sys,obj]=rnd(VISY), p=rnd([2,4,5,8,10,16,20]), v=rnd([10,15,20,25,40,50,80,100]), N=v/p*60;
      return {ctx:`${cap(sys)} a un pas p = ${p} mm.`,q:`Quelle fréquence de rotation faut-il donner à la vis, en tr/min, pour que ${obj} avance à ${v} mm/s ?`,type:"num",ans:N,tolR:0.02,unit:"tr/min",
        expl:`${F("v = p·N")}, donc ${F(`N = ${FRAC("v","p")}`)} = ${FRAC(`${v} mm/s`,`${p} mm`)} = ${nf(v/p,3)} tr/s, soit × 60 : ${U(N,"tr/min")}.`}; },
    /* hélicoïdale : pas déduit d'un essai */
    ()=>{ const o=draw(()=>{ const p=rnd([2,4,5,8,10,12,16,20]), N=rnd([150,180,240,300,360,450,600]), t=rnd([4,5,6,8,10,12]); return {p,N,t,v:p*N/60,d:p*N/60*t}; },o=>o.d>=40&&o.d<=900);
      return {ctx:`Essai d'un axe à vis-écrou : la vis tourne à ${o.N} tr/min et le chariot parcourt ${nf(o.d,1)} mm en ${o.t} s.`,q:"Déduis-en le pas de la vis.",type:"num",ans:o.p,tolR:0.02,unit:"mm",
        expl:`v = ${FRAC(`${nf(o.d,1)} mm`,`${o.t} s`)} = ${nf(o.v,2)} mm/s et N = ${FRAC(o.N,"60")} = ${nf(o.N/60,2)} tr/s. ${F(`p = ${FRAC("v","N")}`)} = ${FRAC(nf(o.v,2),nf(o.N/60,2))} = ${U(o.p,"mm")}.`}; },
    /* identifier la liaison sur la figure puis ses mobilités dans le repère */
    ()=>{ const k=rnd(["piv","pg","gli","hel"]), u=rnd(AX), oa=AX.filter(a=>a!==u);
      let ok, wr;
      if(k==="hel"){ ok=`${TT(u)} et ${RR(u)}, liées`; wr=[`${TT(u)} et ${RR(u)}, indépendantes`,`${TT(oa[0])} et ${RR(oa[0])}, liées`,`${RR(u)} seulement`]; }
      else { ok=mobT(LIA[k].mob(u)); wr=[mobT(LIA[k].mob(oa[0])),mobT(LIA[k].mob(oa[1])),mobT(LIA[{piv:"pg",pg:"piv",gli:"pg"}[k]].mob(u))]; }
      return {fig:fx_lia_axes(k,u),q:"Identifie la liaison représentée, puis choisis ses mobilités dans le repère dessiné (T : translation, R : rotation).",type:"ch",...mc(ok,wr),
        expl:`Le symbole montre ${lc1(SYMD[k])} : c'est une liaison ${LIA[k].n}, ${k==="gli"?"de direction":"d'axe"} parallèle à ${V(u)}. Mobilités : ${F(k==="hel"?`${TT(u)} et ${RR(u)} liées`:mobT(LIA[k].mob(u)))}${k==="hel"?", soit un seul degré de liberté":""}.`}; },
    /* choisir la liaison qui répond à un besoin */
    ()=>{ const [b,ok,w,k]=rnd(BESOINS);
      return {q:`Cahier des charges : « ${b} » Quelle liaison répond à ce besoin ?`,type:"ch",...mc(ok,w),
        expl:`La liaison doit permettre les mouvements demandés, et seulement eux : ${WHY[k]} Il faut une ${F(lc1(ok))}.`}; },
    /* liaisons en série : nombre de mouvements indépendants */
    ()=>{ const s=rnd(SERIE);
      return {q:`${s.d} Combien de mouvements indépendants ${s.w} a-t-${/^la /.test(s.w)?"elle":"il"} par rapport ${s.b} ?`,type:"num",ans:s.n,tolA:0,unit:"",
        expl:`Les liaisons sont en série (l'une après l'autre) : leurs mouvements s'ajoutent. ${cap(s.m)} : ${F(ddl(s.n))}.`}; },
    /* mécanisme vérin-levier : trajectoires du point B */
    ()=>{ const fig=fx_lia_verin({th:rnd([100,108,118,126])}), OB=rnd([240,300,360,420]), ctx=`Modèle plan : 0 bâti, 1 corps du vérin, 2 tige, 3 levier. B est le centre de la pivot entre la tige 2 et le levier 3 ; OB = ${OB} mm.`;
      return [{fig,ctx,q:"Quelle est la trajectoire du point B appartenant au levier 3, dans son mouvement par rapport au bâti 0 ?",type:"ch",...mc(`Un arc de cercle de centre O et de rayon ${OB} mm`,["Un segment de droite porté par (CB)","Un arc de cercle de centre C","Un segment de droite porté par (OB)"]),
          expl:`Le levier 3 est en rotation autour de (O, ${V("z")}) par rapport au bâti : ${F("B décrit un arc de cercle de centre O")}, de rayon OB = ${OB} mm.`},
        {fig,ctx,q:"Quelle est la trajectoire du point B appartenant à la tige 2, dans son mouvement par rapport au corps 1 ?",type:"ch",...mc("Un segment de droite porté par l'axe (CB) du vérin",["Un arc de cercle de centre O","Un arc de cercle de centre C","Un point : B ne bouge pas par rapport au corps"]),
          expl:`La tige coulisse dans le corps le long de l'axe du vérin ; sa rotation sur elle-même ne déplace pas B, qui est sur l'axe : ${F("B décrit un segment de (CB)")}.`}]; }
  ],
  3:[
    /* liaison équivalente à deux liaisons en parallèle */
    ()=>{ const s=rnd(PARA);
      return {q:`${s.d} Quelle liaison unique est équivalente à ces deux liaisons en parallèle ?`,type:"ch",...mc(s.ok,s.w),
        expl:`En parallèle, un mouvement n'est possible que s'il est autorisé par les deux liaisons à la fois. ${s.e} : ${F(lc1(s.ok))}.`}; },
    /* liaison équivalente à des liaisons en série */
    ()=>{ const s=rnd(SERIE2);
      return {q:`${s.d} Quelle liaison unique est équivalente ${s.who} ?`,type:"ch",...mc(s.ok,s.w),
        expl:`En série, les mouvements permis par chaque liaison s'ajoutent. ${s.e} : ${F(lc1(s.ok))}.`}; },
    /* vérin électrique : vitesse de tige et exigence de durée */
    ()=>{ const o=draw(()=>{ const N=rnd([1500,2000,2500,3000]), k=rnd([2,3,4,5]), p=rnd([2,4,5,6,10]), c=rnd([100,150,200,250,300,400]), tmax=rnd([4,5,6,8,10,12,15,20]);
          const v=p*N/k/60; return {N,k,p,c,tmax,v,t:c/v}; },o=>far(o.t,o.tmax,0.08)&&o.t>=1.5&&o.t<=40);
      const ok=o.t<=o.tmax, ctx=`Vérin électrique : un moteur tournant à ${nf(o.N,0)} tr/min entraîne la vis par un réducteur de rapport ${FRAC("1",o.k)} ; le pas de la vis vaut ${o.p} mm et la course de la tige ${o.c} mm.`;
      return [{ctx,q:"Calcule la vitesse de sortie de la tige, en mm/s.",type:"num",ans:o.v,tolR:0.02,unit:"mm/s",
          expl:`Vis : N = ${FRAC(nf(o.N,0),o.k)} = ${nf(o.N/o.k,1)} tr/min, soit ${FRAC(nf(o.N/o.k,1),"60")} = ${nf(o.N/o.k/60,3)} tr/s. ${F("v = p·N")} = ${o.p} × ${nf(o.N/o.k/60,3)} = ${U(o.v,"mm/s")}.`},
        {ctx,q:`Exigence : la tige doit sortir complètement en moins de ${o.tmax} s. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${F(`t = ${FRAC("course","v")}`)} = ${FRAC(o.c,nf(o.v,2))} = ${nf(o.t,2)} s ${ok?"≤":">"} ${o.tmax} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faudrait un pas plus grand ou une vis qui tourne plus vite."}`}]; },
    /* nombre d'actionneurs nécessaires */
    ()=>{ const v=rnd([0,1,2]);
      if(v===0) return {fig:fx_lia_bras(),ctx:`Bras de robot : pivot d'axe vertical (O, ${V("z")}) entre le socle 0 et la tourelle 1 ; pivots d'axes parallèles à ${V("y")} (perpendiculaires à la figure) en A, B et C.`,
        q:"Combien de moteurs faut-il au minimum pour commander indépendamment tous les mouvements de ce bras (ouverture de la pince non comprise) ?",type:"num",ans:4,tolA:0,unit:"",
        expl:`C'est une chaîne ouverte : chaque pivot (entre 0 et 1, 1 et 2, 2 et 3, 3 et 4) ajoute un mouvement indépendant, qu'il faut commander. Il faut un actionneur par mobilité : ${F("4 moteurs")}.`};
      if(v===1) return {fig:fx_lia_verin({th:118}),ctx:"Mécanisme vérin-levier : chaîne fermée 0-1-2-3-0, avec des pivots en C, B et O et une pivot glissant entre le corps 1 et la tige 2.",
        q:"Combien d'actionneurs faut-il pour commander la position du levier 3 ?",type:"num",ans:1,tolA:0,unit:"",
        expl:`Dans la chaîne fermée, la longueur CB (sortie de tige) fixe la forme du triangle OCB, donc l'angle du levier : une seule mobilité utile, ${F("1 actionneur")} (le vérin). La rotation de la tige sur elle-même n'a pas besoin d'être commandée.`};
      return {ctx:`Robot cartésien de découpe : chariot 1 en glissière de direction ${V("x")} sur le bâti 0, coulisseau 2 en glissière de direction ${V("y")} sur 1, porte-outil 3 en glissière de direction ${V("z")} sur 2.`,
        q:"Combien de moteurs faut-il pour déplacer l'outil n'importe où dans l'espace de travail ?",type:"num",ans:3,tolA:0,unit:"",
        expl:`Chaîne ouverte de trois glissières : trois translations indépendantes, donc ${F("3 moteurs")}, un par axe.`}; },
    /* repérer l'erreur d'un élève */
    ()=>{ const v=rnd([0,1,2,3,4]); let ctx, st, bad, why;
      if(v===0){ const p=rnd([4,5,8,10]), N=rnd([1200,1500,1800,3000]);
        ctx=`Vitesse du chariot d'un axe à vis-écrou : pas p = ${p} mm, vis entraînée directement par un moteur à ${nf(N,0)} tr/min.`;
        st=["Liaison hélicoïdale : v = p·N.",`v = ${p} × ${nf(N,0)} = ${nf(p*N,0)} mm/s.`,`Soit v = ${nf(p*N/1000,1)} m/s.`]; bad=1;
        why=`N doit être exprimée en tr/s : N = ${FRAC(nf(N,0),"60")} = ${nf(N/60,0)} tr/s, d'où v = ${p} × ${nf(N/60,0)} = ${nf(p*N/60,0)} mm/s.`; }
      else if(v===1){ ctx="Modélisation de la liaison entre la vis et l'écrou d'un vérin électrique.";
        st=["L'écrou peut tourner autour de l'axe de la vis et avancer le long de cet axe.","Ces deux mouvements sont indépendants.","C'est donc une liaison pivot glissant (2 degrés de liberté)."]; bad=1;
        why="La rotation et la translation sont liées par le filet (un tour fait avancer d'un pas) : il n'y a qu'un mouvement indépendant. C'est une liaison hélicoïdale, à 1 degré de liberté."; }
      else if(v===2){ ctx="Recherche des classes d'équivalence d'un vérin : corps 1, nez 2 vissé sur le corps, tige 3, piston 4 vissé sur la tige, joint torique 5 en caoutchouc.";
        st=["Le corps 1 et le nez 2 n'ont pas de mouvement relatif : classe {1, 2}.","La tige 3 et le piston 4 n'ont pas de mouvement relatif : classe {3, 4}.","Le joint 5 forme une troisième classe {5} : il y a 3 classes."]; bad=2;
        why="Les pièces déformables (joints, ressorts) n'appartiennent à aucune classe d'équivalence : il y a 2 classes, {1, 2} et {3, 4}."; }
      else if(v===3){ ctx=`Liaison équivalente à deux linéaires annulaires de même axe (A, ${V("x")}), placées en A et en B.`;
        st=[`Chaque linéaire annulaire autorise ${TT("x")}, ${RR("x")}, ${RR("y")}, ${RR("z")} (4 degrés de liberté).`,"Les liaisons sont en parallèle : on additionne leurs degrés de liberté, 4 + 4 = 8.","Comme un solide n'a que 6 mouvements possibles, les deux pièces sont libres l'une par rapport à l'autre."]; bad=1;
        why=`En parallèle, on ne garde que les mouvements autorisés par les deux liaisons : ${TT("x")} et ${RR("x")}. C'est une liaison pivot glissant d'axe (A, ${V("x")}), à 2 degrés de liberté.`; }
      else { ctx="Mobilités d'une liaison rotule de centre O.";
        st=["Une rotule est une sphère dans une cavité sphérique de même diamètre.",`La sphère peut glisser dans les trois directions : ${TT("x")}, ${TT("y")}, ${TT("z")}.`,"La rotule a donc 3 degrés de liberté."]; bad=1;
        why=`La sphère ne peut pas se déplacer dans sa cavité, elle ne peut que tourner : ${RR("x")}, ${RR("y")}, ${RR("z")}. Le nombre de degrés de liberté (3) est juste, mais pas les mouvements.`; }
      return {ctx,data:OL(st),q:"Un élève a rédigé ce raisonnement. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
    /* robot mobile : contact roue/sol et bille folle */
    ()=>{ const fig=fx_lia_robot(), ctx="Robot mobile, modèle plan (x, y) : le pneu bombé de la roue motrice 2 touche le sol 0 en I ; la bille folle 3, logée dans une cavité sphérique du châssis 1, touche le sol en J.";
      return [{fig,ctx,q:"Quelle liaison modélise le contact entre la roue motrice 2 et le sol 0 en I ?",type:"ch",...mc(`Ponctuelle de normale (I, ${V("y")})`,[`Pivot d'axe (I, ${V("z")})`,`Appui plan de normale (I, ${V("y")})`,`Linéaire annulaire d'axe (I, ${V("y")})`]),
          expl:`Le pneu bombé ne touche le sol qu'en un point : ${F(`ponctuelle de normale (I, ${V("y")})`)}. La roue peut rouler, pivoter et glisser ; seule la translation suivant la normale ${V("y")} est bloquée.`},
        {fig,ctx,q:"Quelle liaison relie la bille folle 3 au châssis 1 ?",type:"ch",...mc("Une rotule (de centre le centre de la bille)",["Une pivot d'axe perpendiculaire à la figure","Une ponctuelle","Une glissière horizontale"]),
          expl:`La bille tourne dans tous les sens dans sa cavité, sans pouvoir s'y déplacer : ${F("rotule")}. Avec le sol, elle forme une autre liaison, ponctuelle, en J.`},
        {fig,ctx,q:"Quel est l'intérêt d'une bille folle, plutôt que d'une roue fixe, à l'arrière du robot ?",type:"ch",...mc("Elle roule dans toutes les directions : le robot peut tourner sur place sans que l'arrière ne frotte sur le sol",["Elle fournit une partie de l'effort moteur","Elle freine le robot dans les virages","Elle mesure la vitesse du robot"]),
          expl:`Rotule avec le châssis et ponctuelle avec le sol : la bille laisse l'arrière du robot ${F("se déplacer dans toutes les directions")}. Une roue fixe, elle, ne roule que dans une direction et riperait sur le sol dans les virages.`}]; },
    /* mécanisme vérin-levier : justifier la modélisation */
    ()=>{ const fig=fx_lia_verin({th:rnd([100,108,118,126])}), v=rnd([0,1,2]), ctx="Modèle plan : 0 bâti, 1 corps du vérin, 2 tige, 3 levier ; pivots en C, B et O.";
      if(v===0) return {fig,ctx,q:"Pourquoi le corps 1 du vérin est-il articulé en C sur le bâti (liaison pivot), au lieu d'y être encastré ?",type:"ch",...mc("Quand le levier tourne, la direction (CB) change : le vérin doit pouvoir s'orienter",["Pour augmenter l'effort développé par le vérin","Pour que la tige puisse tourner sur elle-même","Pour augmenter la course de la tige"]),
        expl:`B décrit un arc de cercle de centre O, donc la droite (CB) tourne autour de C. Encastré, le corps ne pourrait pas suivre et ${F("le mécanisme serait bloqué")}.`};
      if(v===1) return {fig,ctx,q:"Pourquoi modélise-t-on la liaison entre la tige 2 et le corps 1 par une pivot glissant plutôt que par une glissière ?",type:"ch",...mc("La tige et le piston, cylindriques, peuvent tourner sur eux-mêmes ; cette rotation n'a pas d'effet sur le levier",["Parce que la tige doit tourner pour faire tourner le levier","Parce qu'une glissière ne permet pas la sortie de la tige","Parce que le vérin est articulé en C"]),
        expl:`Rien n'empêche la tige cylindrique de tourner autour de l'axe du vérin : la liaison réelle a deux mobilités, ${F("translation et rotation suivant (CB)")}. La rotation est sans effet sur le mouvement du levier : c'est une mobilité interne.`};
      return {fig,ctx,q:"Que se passerait-il si la tige 2 était soudée au levier 3 en B (encastrement au lieu de la pivot) ?",type:"ch",...mc("Le mécanisme serait bloqué : la tige ne pourrait plus s'incliner par rapport au levier",["Rien : le levier tournerait de la même façon","Le levier tournerait plus vite","Le vérin développerait un effort plus grand"]),
        expl:`Quand le levier tourne d'un certain angle, la direction (CB) ne tourne pas du même angle. Soudée au levier, la tige devrait tourner avec lui tout en restant alignée sur (CB) : c'est impossible, ${F("le mécanisme serait bloqué")}.`}; },
    /* moteur, réducteur, vis : de ω à la durée de course */
    ()=>{ const o=draw(()=>{ const w=rnd([100,120,150,200,250,300]), k=rnd([2,3,4,5,10]), p=rnd([2,4,5,8,10]), c=rnd([80,100,150,200,300]); const n=w/(2*Math.PI)/k, v=p*n; return {w,k,p,c,n,v,t:c/v}; },o=>o.t>=1&&o.t<=60);
      const ctx=`Un moteur tourne à ω = ${o.w} rad/s ; un réducteur de rapport ${FRAC("1",o.k)} entraîne une vis de pas p = ${o.p} mm. L'écrou, guidé en translation, porte un plateau dont la course vaut ${o.c} mm.`;
      return [{ctx,q:"Calcule la fréquence de rotation de la vis, en tr/s.",type:"num",ans:o.n,tolR:0.02,unit:"tr/s",
          expl:`Moteur : ${F(`N = ${FRAC("ω","2π")}`)} = ${FRAC(o.w,"2π")} = ${nf(o.w/(2*Math.PI),3)} tr/s. Vis : N = ${FRAC(nf(o.w/(2*Math.PI),3),o.k)} = ${U(o.n,"tr/s")}.`},
        {ctx,q:"Combien de temps le plateau met-il pour parcourir toute sa course ?",type:"num",ans:o.t,tolR:0.02,unit:"s",
          expl:`${F("v = p·N")} = ${o.p} × ${nf(o.n,3)} = ${nf(o.v,2)} mm/s. ${F(`t = ${FRAC("course","v")}`)} = ${FRAC(o.c,nf(o.v,2))} = ${U(o.t,"s")}.`}]; },
    /* bielle-manivelle : course et vitesse moyenne du piston */
    ()=>{ const r=rnd([20,25,30,40,50]), l=rnd([3,3.5,4])*r, N=rnd([300,600,900,1200,1500]), c=2*r, vm=2*c*N/60/1000;
      const fig=sBielle({ph:rnd([40,60,120,140])}), ctx=`Compresseur à bielle-manivelle : OA = ${r} mm, AB = ${nf(l,1)} mm ; la manivelle 1 tourne à ${nf(N,0)} tr/min.`;
      return [{fig,ctx,q:"Quelle est la course du piston 3, distance entre ses deux positions extrêmes ?",type:"num",ans:c,tolR:0.02,unit:"mm",
          expl:`Aux positions extrêmes, O, A et B sont alignés. Piston au plus loin : OB = AB + OA = ${nf(l+r,1)} mm ; au plus près : OB = AB − OA = ${nf(l-r,1)} mm. ${F("course = 2·OA")} = ${U(c,"mm")} : la longueur de la bielle n'intervient pas.`},
        {fig,ctx,q:"Quelle est la vitesse moyenne du piston, en m/s ?",type:"num",ans:vm,tolR:0.02,unit:"m/s",
          expl:`À chaque tour, le piston parcourt deux fois la course (aller et retour), soit ${2*c} mm. La manivelle fait ${FRAC(nf(N,0),"60")} = ${nf(N/60,0)} tours par seconde : ${F("v moy = 2·course·N")} = ${2*c} × ${nf(N/60,0)} = ${nf(2*c*N/60,0)} mm/s = ${U(vm,"m/s")}.`}]; },
    /* codeur sur la vis : déplacement élémentaire et exigence */
    ()=>{ const o=draw(()=>{ const p=rnd([2,4,5,10,16,20]), n=rnd([100,200,256,500,1000,1024]), req=rnd([5,10,20,25,50]); return {p,n,req,r:p/n*1000}; },o=>far(o.r,o.req,0.1));
      const ok=o.r<=o.req, ctx=`Axe de positionnement : un codeur incrémental de ${nf(o.n,0)} points par tour est monté sur une vis à billes de pas ${o.p} mm, entraînée directement par le moteur.`;
      return [{ctx,q:"Quel déplacement de l'écrou correspond à un point du codeur, en µm ?",type:"num",ans:o.r,tolR:0.02,unit:"µm",
          expl:`Un tour de vis (${nf(o.n,0)} points) fait avancer l'écrou d'un pas : ${F(`Δx = ${FRAC("p","n")}`)} = ${FRAC(`${o.p} mm`,nf(o.n,0))} = ${nf(o.p/o.n,5)} mm = ${U(o.r,"µm")}.`},
        {ctx,q:`Exigence : le déplacement correspondant à un point du codeur ne doit pas dépasser ${o.req} µm. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.r,2)} µm ${ok?"≤":">"} ${o.req} µm : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut un codeur plus fin ou une vis de pas plus petit."}`}]; },
    /* choix d'un pas de vis : vitesse et résolution */
    ()=>{ const o=draw(()=>{ const Nm=rnd([1500,2000,3000]), vmin=rnd([50,80,100,150,200,250,300]), n=rnd([200,400,500,1000]), rmax=rnd([10,20,25,40,50]);
          const pmin=vmin/(Nm/60), pmax=rmax/1000*n, val=PAS.filter(p=>p>=pmin&&p<=pmax), bad=PAS.filter(p=>p<pmin/1.03||p>pmax*1.03);
          return {Nm,vmin,n,rmax,pmin,pmax,val,bad}; },o=>o.val.length===1&&o.val[0]>=1.03*o.pmin&&o.val[0]<=o.pmax/1.03&&o.bad.length===PAS.length-1);
      const P=o.val[0], wr=pick(o.bad,3).sort((a,b)=>a-b);
      return {ctx:`Axe à vis à billes entraînée directement par un moteur dont la vitesse maximale est ${nf(o.Nm,0)} tr/min ; un codeur de ${o.n} points par tour est monté sur la vis. Exigences : vitesse d'au moins ${o.vmin} mm/s ; déplacement correspondant à un point du codeur au plus égal à ${o.rmax} µm.`,
        q:"Quel pas de vis normalisé faut-il choisir parmi ceux proposés ?",type:"ch",...mc(`p = ${P} mm`,wr.map(x=>`p = ${x} mm`)),
        expl:`Vitesse : ${F("v = p·N")} avec N = ${FRAC(nf(o.Nm,0),"60")} = ${nf(o.Nm/60,2)} tr/s, donc p ≥ ${FRAC(o.vmin,nf(o.Nm/60,2))} = ${nf(o.pmin,2)} mm. Résolution : ${FRAC("p","n")} ≤ ${o.rmax} µm, donc p ≤ ${o.rmax} µm × ${o.n} = ${nf(o.pmax,2)} mm. Seul ${F(`p = ${P} mm`)} respecte les deux exigences.`}; },
    /* centrage long ou court */
    ()=>{ const v=rnd([0,1,2,3]), D=rnd([12,16,20,25,30,40]);
      const cf=[{r:rnd([1.8,2,2.5,3]),a:"sans aucun arrêt axial",k:"pg"},{r:rnd([1.8,2,2.5]),a:"entre un épaulement et un anneau élastique qui empêchent tout déplacement axial",k:"piv"},
        {r:rnd([0.3,0.4,0.5]),a:"sans aucun arrêt axial",k:"la"},{r:rnd([0.3,0.4,0.5]),a:"et plaqué par un écrou contre un large épaulement plan perpendiculaire à l'axe",k:"piv"}][v];
      const Lg=Math.round(cf.r*D), rr=Lg/D, long=rr>=1.5;
      const why=[`${F("centrage long")} sans arrêt axial : l'arbre peut tourner et coulisser, c'est une pivot glissant`,`${F("centrage long")} et arrêts axiaux : seule la rotation reste, c'est une pivot`,
        `${F("centrage court")} sans arrêt : il ne bloque que les déplacements radiaux, c'est une linéaire annulaire (ou sphère-cylindre)`,`${F("centrage court")} (linéaire annulaire) associé à un appui plan de même axe : seule la rotation reste, c'est une pivot`][v];
      return {ctx:"Règle admise : un alésage de longueur L et de diamètre D réalise un centrage long si L ≥ 1,5·D (il empêche l'arbre de basculer) et un centrage court si L ≤ 0,8·D (il ne bloque que les déplacements radiaux).",
        q:`Un arbre de diamètre D = ${D} mm est guidé dans un alésage de longueur L = ${Lg} mm, ${cf.a}. Quelle liaison modélise ce guidage ?`,type:"ch",...mc(cap(LIA[cf.k].n),["pg","piv","la","rot"].filter(x=>x!==cf.k).map(x=>cap(LIA[x].n))),
        expl:`${FRAC("L","D")} = ${FRAC(Lg,D)} = ${nf(rr,2)} ${long?"≥ 1,5":"≤ 0,8"} : ${why}.`}; }
  ]
};

/* ======================================================================
   FLUIDES EN SI : PRESSION, VÉRINS, TRAÎNÉE, PORTANCE (meca-fluides)
   ====================================================================== */
const RA=1.2, RE=1000, RM=1025, P0=1.013;              /* masses volumiques (kg/m³) : air, eau douce, eau de mer ; pression atmosphérique (bar) */
const disk=D=>Math.PI*D*D/4;                           /* aire d'un disque de diamètre D */
const mOf=x=>nf(x/1000,3);                             /* mm → m, pour l'affichage */
const PB=`1 bar = ${p10(5)} Pa`;
const paf=x=>x>=1e6?sci(x,2):nf(x,0);                  /* pression en Pa : écriture scientifique au-delà du million */
/* vérins normalisés : diamètre du piston D et de la tige d (mm) */
const VPN=[[20,8],[25,10],[32,12],[40,16],[50,20],[63,20],[80,25],[100,25]], VHY=[[40,22],[50,28],[63,36],[80,45],[100,56],[125,70]];
const PN=[["un vérin de bridage de pièce sur une machine",[32,40,50,63]],["le vérin d'ouverture d'une porte de bus",[32,40,50]],["un vérin d'éjection de colis sur un convoyeur",[20,25,32,40]],["le vérin d'une presse d'emballage",[50,63,80,100]],["un vérin de poinçonnage de tôle",[63,80,100]]];
const HY=[["le vérin d'une presse à coprah",[80,100,125]],["le vérin de relevage d'un moteur hors-bord",[40,50]],["le vérin d'une fendeuse de bûches",[63,80,100]],["le vérin de levage d'une benne de camion",[80,100,125]],["le vérin de la rampe d'accès d'un ferry",[63,80,100]]];
/* tirage d'un vérin : usage, D et d (mm), pression (bar) */
function verin(hy){ const [u,Ds]=rnd(hy?HY:PN), D=rnd(Ds), d=(hy?VHY:VPN).find(x=>x[0]===D)[1], p=hy?rnd([80,100,120,150,160,200]):rnd([4,5,6,7,8]); return {hy,u,D,d,p}; }
const Fk=(x,hy)=>hy?`${nf(x,0)} N, soit ${U(x/1000,"kN")}`:U(x,"N");
/* systèmes soumis à la traînée : S surface frontale (m²), C valeurs de Cx, v vitesses (m/s), vk vitesses (km/h) */
const DRAG=[
  {n:"un cycliste sur un vélo à assistance électrique",de:"du vélo et de son cycliste",vb:"roule",fl:"air",r:RA,S:[0.4,0.45,0.5],C:[0.7,0.8,0.9],v:[6,7,8,9,10],vk:[20,25,27,30,36]},
  {n:"un drone quadricoptère",de:"du drone",vb:"vole",fl:"air",r:RA,S:[0.03,0.04,0.05],C:[0.9,1,1.1],v:[8,10,12,15],vk:[36,45,54,60]},
  {n:"une voiture électrique",de:"de la voiture",vb:"roule",fl:"air",r:RA,S:[2,2.1,2.2,2.3],C:[0.26,0.28,0.3,0.32],v:[15,20,25,30],vk:[50,90,110,130]},
  {n:"une trottinette électrique avec son utilisateur",de:"de la trottinette et de son utilisateur",vb:"roule",fl:"air",r:RA,S:[0.5,0.55,0.6],C:[0.9,1,1.1],v:[5,6,7],vk:[18,20,25]},
  {n:"un drone de surface qui relève des mesures dans le lagon",de:"du drone de surface",vb:"navigue",fl:"eau de mer",r:RM,S:[0.01,0.015,0.02],C:[0.3,0.4,0.5],v:[1,1.5,2,2.5],vk:[4,5,6,8]}
];
/* ailes et foils : S surface (m²), C valeurs de Cz, v vitesses (m/s) */
const LIFT=[
  {n:"l'aile d'un drone de cartographie à voilure fixe",fl:"air",r:RA,S:[0.25,0.3,0.35,0.4],C:[0.6,0.7,0.8,0.9],v:[12,14,15,16,18]},
  {n:"l'aile d'un ULM",fl:"air",r:RA,S:[12,14,15,16],C:[0.4,0.5,0.6],v:[20,22,25,28]},
  {n:"le foil d'une planche de wingfoil",fl:"eau de mer",r:RM,S:[0.08,0.1,0.12],C:[0.4,0.5,0.6],v:[4,5,6,7],cap:"foil sous la planche"},
  {n:"le foil d'une pirogue électrique",fl:"eau de mer",r:RM,S:[0.3,0.35,0.4],C:[0.4,0.5,0.6],v:[5,6,7,8],cap:"foil sous la coque"}
];
const MOT=[1.5,2.2,3,4,5.5,7.5,11,15,18.5,22];          /* puissances normalisées de moteurs électriques (kW) */

POOLS["meca-fluides"]={
  titre:"Pression, vérins, traînée, portance",
  fiche:{t:"Fluides : pression, vérins, traînée, portance",l:[
    `Pression : ${F(`p = ${FRAC("F","S")}`)} en pascals (1 Pa = 1 N/m²) ; ${F(PB)} et 1 MPa = 10 bar ; sous une hauteur h de liquide : ${F("p = ρ·g·h")}.`,
    `Vérin, poussée (chambre côté fond) : ${F(`F = p·${FRAC("π·D²","4")}`)} ; traction (chambre côté tige), section annulaire : ${F(`S = ${FRAC("π·(D² − d²)","4")}`)}.`,
    `Débit : ${F("Q = S·v")} (m³/s, m², m/s) ; vitesse de la tige : ${F(`v = ${FRAC("Q","S")}`)} ; conversion : ${F(`1 L/min = ${FRAC(`${p10(-3)} m³`,"60 s")}`)}.`,
    `Traînée : ${F("Fx = ½·ρ·S·Cx·v²")} ; portance : ${F("Fz = ½·ρ·S·Cz·v²")} (Cx et Cz sans unité) ; puissance pour vaincre la traînée : ${F("P = Fx·v")}.`,
    `Pièges : D en mètres (${F(`1 mm² = ${p10(-6)} m²`)}), bar en Pa, v en m/s ; côté tige, retirer la section de la tige ; vitesse doublée : ${F("traînée × 4, puissance × 8")}.`]},
  count:{1:4,2:4,3:3},
  1:[
    /* unités de pression */
    ()=>{ const v=rnd([0,1,2,3]);
      if(v===0){ const [s,ps]=rnd([["un pneu de vélo à assistance électrique",[2.5,3,3.5,4]],["un pneu de trottinette électrique",[2.5,3,3.5]],["le réseau d'air comprimé d'un atelier",[6,7,8]],["la chambre d'un vérin pneumatique",[4,5,6]]]), p=rnd(ps);
        return {q:`La pression relative dans ${s} vaut p = ${nf(p,1)} bar. Exprime-la en pascals.`,type:"num",ans:p*1e5,tolR:0.02,unit:"Pa",
          expl:`${F(PB)} : p = ${nf(p,1)} × ${p10(5)} = ${U(p*1e5,"Pa")}.`}; }
      if(v===1){ const [s,ps]=rnd([["le circuit hydraulique d'une presse à coprah",[160,200,250]],["une bouteille de plongée pleine",[200,230]],["le circuit hydraulique d'une pelleteuse",[250,300,350]]]), p=rnd(ps);
        return {q:`La pression dans ${s} atteint ${nf(p,0)} bar. Exprime-la en mégapascals (MPa).`,type:"num",ans:p/10,tolR:0.02,unit:"MPa",
          expl:`${nf(p,0)} bar = ${nf(p,0)} × ${p10(5)} Pa = ${sci(p*1e5,1)} Pa. Or ${F(`1 MPa = ${p10(6)} Pa = 10 bar`)}, donc p = ${FRAC(nf(p,0),"10")} = ${U(p/10,"MPa")}.`}; }
      if(v===2){ const p=rnd([6,8,12,14,16,21]);
        return {q:`La fiche technique d'un vérin hydraulique indique une pression maximale de ${nf(p,0)} MPa. Combien de bars cela représente-t-il ?`,type:"num",ans:p*10,tolR:0.02,unit:"bar",
          expl:`${F("1 MPa = 10 bar")} (${p10(6)} Pa = 10 × ${p10(5)} Pa) : p = ${nf(p,0)} × 10 = ${U(p*10,"bar")}. À retenir aussi : 1 MPa = 1 N/mm².`}; }
      const k=rnd([150,180,220,250,320,450]);
      return {q:`Un capteur de pression affiche ${k} kPa. Exprime cette pression en bars.`,type:"num",ans:k/100,tolR:0.02,unit:"bar",
        expl:`1 kPa = ${p10(3)} Pa et ${F(PB)} = 100 kPa : p = ${FRAC(k,"100")} = ${U(k/100,"bar")}.`}; },
    /* F = p·S hors vérin : hublot, seringue, ventouse */
    ()=>{ const v=rnd([0,1,2]);
      if(v===0){ const S=rnd([20,30,40,50,60,80]), p=rnd([1.5,2,2.5,3,4,5]), Fv=p*1e5*S*1e-4;
        return {ctx:`Le hublot d'un drone sous-marin a une surface S = ${S} cm². À la profondeur de travail, la pression de l'eau dépasse de ${nf(p,1)} bar celle de l'air enfermé dans le drone.`,
          q:"Calcule l'effort résultant que cet écart de pression exerce sur le hublot.",type:"num",ans:Fv,tolR:0.02,unit:"N",
          expl:`S = ${S} × ${p10(-4)} m² et Δp = ${nf(p,1)} × ${p10(5)} Pa. ${F("F = Δp·S")} = ${nf(p,1)} × ${p10(5)} × ${S} × ${p10(-4)} = ${U(Fv,"N")}, dirigé vers l'intérieur du drone.`}; }
      if(v===1){ const Fv=rnd([20,30,40,50,60]), S=rnd([1,1.5,2,2.5]), p=Fv/(S*1e-4);
        return {ctx:`Le piston d'une seringue a une section S = ${nf(S,1)} cm². On appuie dessus avec un effort F = ${Fv} N ; l'aiguille est bouchée.`,
          q:"Quelle pression relative règne dans le liquide, en bar ?",type:"num",ans:p/1e5,tolR:0.02,unit:"bar",
          expl:`S = ${nf(S,1)} × ${p10(-4)} m². ${F(`p = ${FRAC("F","S")}`)} = ${FRAC(Fv,`${nf(S,1)} × ${p10(-4)}`)} = ${nf(p,0)} Pa, soit ${U(p/1e5,"bar")}.`}; }
      const S=rnd([10,15,20,25,30]), dp=rnd([0.5,0.6,0.7,0.8]), Fv=dp*1e5*S*1e-4;
      return {ctx:`La ventouse de préhension d'un robot a une surface utile S = ${S} cm². Une pompe à vide y crée une dépression de ${nf(dp,1)} bar par rapport à l'air ambiant.`,
        q:"Quel effort maximal de maintien la ventouse exerce-t-elle sur une pièce ?",type:"num",ans:Fv,tolR:0.02,unit:"N",
        expl:`L'air ambiant plaque la pièce contre la ventouse : ${F("F = Δp·S")} = ${nf(dp,1)} × ${p10(5)} × ${S} × ${p10(-4)} = ${U(Fv,"N")}.`}; },
    /* vérin : effort de poussée */
    ()=>{ const o=verin(Math.random()<0.4), S=disk(o.D/1000), Fv=o.p*1e5*S;
      return {fig:fx_flu_verin({alim:"A",mv:1,D:`D = ${o.D} mm`,F:"F"}),ctx:`${cap(o.u)} est alimenté côté fond sous p = ${nf(o.p,0)} bar (${PB}). Diamètre du piston : D = ${o.D} mm.`,
        q:"Calcule l'effort de poussée théorique F de la tige (frottements négligés).",type:"num",ans:o.hy?Fv/1000:Fv,tolR:0.02,unit:o.hy?"kN":"N",
        expl:`${F(`S = ${FRAC("π·D²","4")}`)} = ${FRAC(`π × ${mOf(o.D)}²`,"4")} = ${sci(S,2)} m². ${F("F = p·S")} = ${nf(o.p,0)} × ${p10(5)} × ${sci(S,2)} = ${Fk(Fv,o.hy)}.`}; },
    /* vérin double effet : orifice à alimenter */
    ()=>{ const out=Math.random()<0.5;
      const ch=out?["Alimenter A et mettre B à l'échappement","Alimenter B et mettre A à l'échappement","Mettre A et B à l'échappement"]:["Alimenter B et mettre A à l'échappement","Alimenter A et mettre B à l'échappement","Mettre A et B à l'échappement","Alimenter A et B à la même pression"];
      return {fig:fx_flu_verin({x:rnd([120,150,180])}),ctx:"Vérin double effet : l'orifice A débouche dans la chambre côté fond, l'orifice B dans la chambre côté tige.",q:`Que faut-il faire pour ${out?"faire sortir":"faire rentrer"} la tige ?`,type:"ch",...mc(ch[0],ch.slice(1)),
        expl:out?`Le piston est poussé depuis la chambre sous pression : pour sortir la tige, il faut ${F("alimenter la chambre côté fond (A)")} et laisser l'air de la chambre côté tige s'échapper par B, sinon il s'opposerait au mouvement.`
          :`Pour rentrer la tige, il faut ${F("alimenter la chambre côté tige (B)")} et mettre A à l'échappement. Avec A et B à la même pression, la tige sortirait : la section côté fond est plus grande que la section annulaire côté tige.`}; },
    /* simple effet ou double effet */
    ()=>{ const v=rnd([0,1,2]);
      if(v===0) return {fig:fx_flu_verin({ressort:1,alim:"A",mv:1}),ctx:"Vérin simple effet : seule la chambre côté fond reçoit de l'air comprimé ; la chambre du ressort communique avec l'air ambiant (mise à l'air).",
        q:"Quand l'orifice A est mis à l'échappement, qu'est-ce qui fait rentrer la tige ?",type:"ch",...mc("Le ressort, comprimé pendant la sortie de la tige",["L'air comprimé qui entre par la mise à l'air","La pression qui reste dans la chambre côté fond","Le poids du piston et de la tige"]),
        expl:`Dans un vérin simple effet, un seul sens est commandé par la pression ; le retour est assuré par ${F("le ressort de rappel")}. La mise à l'air évite seulement une surpression ou une dépression dans la chambre du ressort.`};
      if(v===1) return {fig:fx_flu_verin({ressort:1,alim:"A",mv:1}),ctx:"Vérin simple effet à ressort de rappel, alimenté côté fond sous la pression p ; S est la section du piston.",
        q:"Pourquoi l'effort de poussée disponible sur la tige est-il plus petit que p·S ?",type:"ch",...mc("Une partie de l'effort de pression sert à comprimer le ressort",["La pression agit sur la section annulaire, plus petite","L'air comprimé s'échappe par la mise à l'air","La tige est trop courte"]),
        expl:`Sur l'ensemble piston et tige, l'effort de pression p·S équilibre l'effort de la charge et ${F("l'effort du ressort")}, qui augmente quand la tige sort. L'effort disponible vaut p·S moins l'effort du ressort.`};
      return {q:"Quel type de vérin permet de commander un effort important dans les deux sens de déplacement de la tige ?",type:"ch",...mc("Le vérin double effet, en alimentant l'une ou l'autre chambre",["Le vérin simple effet, grâce à son ressort de rappel","Aucun vérin : un vérin ne peut que pousser","Le vérin simple effet, en inversant l'alimentation"]),
        expl:`Le vérin double effet a deux orifices : la pression agit côté fond pour pousser, côté tige pour tirer. ${F("Double effet : deux sens commandés")} ; le ressort d'un simple effet ne fournit qu'un petit effort de rappel.`}; },
    /* section annulaire côté tige */
    ()=>{ const [D,d]=rnd(Math.random()<0.5?VHY:VPN), Sa=Math.PI*(D*D-d*d)/4, Sf=disk(D);
      return {fig:fx_flu_verin({alim:"B",mv:-1,D:`D = ${D} mm`,d:`d = ${d} mm`}),ctx:`Vérin double effet : diamètre du piston D = ${D} mm, diamètre de la tige d = ${d} mm.`,
        q:"Calcule la surface sur laquelle agit la pression quand on alimente la chambre côté tige, en mm².",type:"num",ans:Sa,tolR:0.02,unit:"mm²",
        expl:`Côté tige, la pression n'agit pas sur la section occupée par la tige : ${F(`S = ${FRAC("π·(D² − d²)","4")}`)} = ${FRAC(`π × (${D}² − ${d}²)`,"4")} = ${U(Sa,"mm²")}, contre ${nf(Sf,0)} mm² côté fond.`}; },
    /* conversions de débit */
    ()=>{ const v=rnd([0,1,2,3]);
      if(v===0){ const Q=rnd([6,12,18,24,30,36,48,60,72,90]), q=Q/60000;
        return {ctx:"Le débit de la pompe d'une centrale hydraulique est donné en litres par minute.",q:`Exprime un débit de ${Q} L/min en m³/s.`,type:"num",ans:q,tolR:0.02,unit:"m³/s",
          expl:`1 L = ${p10(-3)} m³ et 1 min = 60 s : ${F(`Q = ${FRAC(`${Q} × ${p10(-3)}`,"60")}`)} = ${U(q,"m³/s")}, soit ${sci(q,1)} m³/s.`}; }
      if(v===1){ const k=rnd([2,3,5,8,12,15,20]), q=k*1e-4, Q=k*6;
        return {q:`Une pompe débite ${sci(q,1)} m³/s. Exprime ce débit en L/min.`,type:"num",ans:Q,tolR:0.02,unit:"L/min",
          expl:`1 m³ = 1 000 L : ${sci(q,1)} m³/s = ${nf(q*1000,1)} L/s. En une minute (60 s) : ${F(`Q = ${nf(q*1000,1)} × 60`)} = ${U(Q,"L/min")}.`}; }
      if(v===2){ const Q=rnd([3.6,7.2,9,10.8,14.4,18,36]);
        return {ctx:"Les catalogues de pompes donnent souvent le débit en m³/h.",q:`Exprime un débit de ${nf(Q,1)} m³/h en L/s.`,type:"num",ans:Q/3.6,tolR:0.02,unit:"L/s",
          expl:`1 m³ = 1 000 L et 1 h = 3 600 s : ${F(`Q = ${FRAC(`${nf(Q,1)} × 1 000`,"3 600")}`)} = ${U(Q/3.6,"L/s")}.`}; }
      const Q=rnd([0.5,1,1.5,2.5,4,5]);
      return {q:`Une pompe de relevage débite ${nf(Q,1)} L/s. Exprime ce débit en m³/h.`,type:"num",ans:Q*3.6,tolR:0.02,unit:"m³/h",
        expl:`En une heure (3 600 s), la pompe débite ${nf(Q,1)} × 3 600 = ${nf(Q*3600,0)} L. Avec 1 m³ = 1 000 L : ${F(`Q = ${FRAC(`${nf(Q*3600,0)}`,"1 000")}`)} = ${U(Q*3.6,"m³/h")}.`}; },
    /* pression due à une hauteur de liquide */
    ()=>{ const v=rnd([0,1,2]);
      if(v===0){ const h=rnd([5,8,10,12,15,20,25,30,40]), p=RM*g*h;
        return {fig:fx_flu_prof({hl:`h = ${h} m`}),ctx:`Un drone sous-marin inspecte le récif à la profondeur h = ${h} m. Eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s².`,
          q:"Calcule la pression due à l'eau à cette profondeur (pression relative), en bar.",type:"num",ans:p/1e5,tolR:0.02,unit:"bar",
          expl:`${F("p = ρ·g·h")} = 1 025 × 9,81 × ${h} = ${nf(p,0)} Pa, soit ${U(p/1e5,"bar")} (${PB}). En mer, la pression augmente d'environ 1 bar tous les 10 m.`}; }
      if(v===1){ const h=rnd([1.5,2,2.5,3,3.5,4]), p=RE*g*h;
        return {fig:fx_flu_prof({tank:1,hl:`h = ${nf(h,1)} m`}),ctx:`Une cuve de récupération d'eau de pluie contient une hauteur d'eau h = ${nf(h,1)} m. ρ = 1 000 kg/m³ ; g = 9,81 m/s².`,
          q:"Calcule la pression due à l'eau au point M du fond (pression relative), en kPa.",type:"num",ans:p/1000,tolR:0.02,unit:"kPa",
          expl:`${F("p = ρ·g·h")} = 1 000 × 9,81 × ${nf(h,1)} = ${nf(p,0)} Pa, soit ${U(p/1000,"kPa")}. Elle ne dépend que de la hauteur d'eau, pas de la forme de la cuve.`}; }
      const h=rnd([0.8,1,1.2,1.5]), r=rnd([850,870,900]), p=r*g*h;
      return {fig:fx_flu_prof({tank:1,hl:`h = ${nf(h,1)} m`}),ctx:`Le réservoir d'une centrale hydraulique contient une hauteur d'huile h = ${nf(h,1)} m, de masse volumique ρ = ${r} kg/m³ ; g = 9,81 m/s².`,
        q:"Calcule la pression due à l'huile au point M du fond, en Pa.",type:"num",ans:p,tolR:0.02,unit:"Pa",
        expl:`${F("p = ρ·g·h")} = ${r} × 9,81 × ${nf(h,1)} = ${U(p,"Pa")}, soit ${nf(p/1e5,3)} bar : négligeable devant la pression de service du circuit (plus de 100 bar).`}; },
    /* traînée : calcul direct */
    ()=>{ const s=rnd(DRAG), S=rnd(s.S), Cx=rnd(s.C), v=rnd(s.v), Fx=0.5*s.r*S*Cx*v*v;
      return {ctx:`${cap(s.n)} ${s.vb} à v = ${nf(v,1)} m/s. Surface frontale${s.r>10?" immergée":""} (maître-couple) S = ${nf(S,3)} m² ; coefficient de traînée Cx = ${nf(Cx,2)} ; ${s.fl} : ρ = ${nf(s.r,1)} kg/m³.`,
        q:"Calcule l'effort de traînée Fx.",type:"num",ans:Fx,tolR:0.02,unit:"N",
        expl:`${F("Fx = ½·ρ·S·Cx·v²")} = 0,5 × ${nf(s.r,1)} × ${nf(S,3)} × ${nf(Cx,2)} × ${nf(v,1)}² = ${U(Fx,"N")}.`}; },
    /* portance : calcul direct */
    ()=>{ const s=rnd(LIFT), S=rnd(s.S), Cz=rnd(s.C), v=rnd(s.v), Fz=0.5*s.r*S*Cz*v*v, eau=s.r>10;
      return {fig:fx_flu_aile({fl:eau?"eau":"air",cap:s.cap}),ctx:`${cap(s.n)} se déplace à v = ${nf(v,1)} m/s par rapport ${eau?"à l'eau":"à l'air"}. Surface ${eau?"du foil":"de l'aile"} S = ${nf(S,2)} m² ; coefficient de portance Cz = ${nf(Cz,2)} ; ${s.fl} : ρ = ${nf(s.r,1)} kg/m³.`,
        q:"Calcule l'effort de portance Fz.",type:"num",ans:Fz,tolR:0.02,unit:"N",
        expl:`${F("Fz = ½·ρ·S·Cz·v²")} = 0,5 × ${nf(s.r,1)} × ${nf(S,2)} × ${nf(Cz,2)} × ${nf(v,1)}² = ${U(Fz,"N")}, perpendiculaire à la vitesse de l'écoulement.`}; },
    /* aile : repérer portance et traînée */
    ()=>{ const nums=shuffle([1,2,3,4]), w=Math.random()<0.5?0:1, eau=Math.random()<0.3;
      return {fig:fx_flu_aile({nums,fl:eau?"eau":"air",cap:eau?"foil sous une planche":null}),ctx:`Profil ${eau?"d'un foil dans l'eau":"d'une aile dans l'air"} : l'écoulement arrive de la gauche, parallèle à ${V("v")}.`,
        q:`Quelle flèche représente ${w?"la traînée":"la portance"} ?`,type:"ch",ch:["Flèche 1","Flèche 2","Flèche 3","Flèche 4"],ok:nums[w]-1,
        expl:`La portance est ${F("perpendiculaire à l'écoulement")}, vers le haut : flèche ${nums[0]}. La traînée est ${F("parallèle à l'écoulement, dans son sens")} : elle freine le profil, flèche ${nums[1]}. Les flèches ${Math.min(nums[2],nums[3])} et ${Math.max(nums[2],nums[3])} ne représentent aucune de ces deux actions.`}; },
    /* influence du carré de la vitesse */
    ()=>{ const v=rnd([0,1,2]), k=rnd([1.5,2,3]);
      if(v===0) return {q:`La vitesse d'un drone passe de v à ${nf(k,1)}·v. Par combien sa traînée est-elle multipliée ?`,type:"ch",...mc(`Par ${nf(k*k,2)}`,[`Par ${nf(k,1)}`,`Par ${nf(k**3,3)}`,`Par ${nf(Math.sqrt(k),2)}`]),
        expl:`${F("Fx = ½·ρ·S·Cx·v²")} est proportionnelle au carré de la vitesse : Fx est multipliée par ${nf(k,1)}² = ${F(nf(k*k,2))}.`};
      if(v===1) return {q:`La vitesse d'un cycliste passe de v à ${nf(k,1)}·v. Par combien la puissance nécessaire pour vaincre la traînée est-elle multipliée ?`,type:"ch",...mc(`Par ${nf(k**3,3)}`,[`Par ${nf(k*k,2)}`,`Par ${nf(k,1)}`,`Par ${nf(Math.sqrt(k),2)}`]),
        expl:`${F("P = Fx·v")} et Fx est proportionnelle à v² : P est proportionnelle à v³. Elle est multipliée par ${nf(k,1)}³ = ${F(nf(k**3,3))}.`};
      const kk=rnd([2,3]);
      return {q:`Un avion vole ${kk===2?"deux":"trois"} fois moins vite qu'à sa vitesse de croisière, avec la même incidence. Comment évolue la portance de ses ailes ?`,type:"ch",...mc(`Elle est divisée par ${kk*kk}`,[`Elle est divisée par ${kk}`,`Elle est divisée par ${kk**3}`,"Elle ne change pas"]),
        expl:`${F("Fz = ½·ρ·S·Cz·v²")} : à Cz constant (même incidence), la portance est proportionnelle à v². Vitesse divisée par ${kk} : portance divisée par ${kk}² = ${F(String(kk*kk))}. Pour voler lentement, il faut augmenter Cz (incidence, volets).`}; },
    /* puissance de traînée */
    ()=>{ const s=rnd([["un cycliste",[12,15,18,22,25],[6,7,8,9,10]],["une voiture électrique sur autoroute",[300,350,400,450],[30,32,35]],["un drone quadricoptère",[2,3,4,5],[8,10,12,15]],["une pirogue à moteur électrique",[40,60,80,100],[3,4,5,6]]]), Fx=rnd(s[1]), v=rnd(s[2]), P=Fx*v;
      return {q:`${cap(s[0])} avance à vitesse constante v = ${nf(v,1)} m/s et subit une traînée Fx = ${nf(Fx,0)} N. Quelle puissance faut-il fournir pour vaincre cette traînée ?`,type:"num",ans:P,tolR:0.02,unit:"W",
        expl:`La traînée s'oppose au déplacement : il faut fournir ${F("P = Fx·v")} = ${nf(Fx,0)} × ${nf(v,1)} = ${U(P,"W")}${P>=1000?`, soit ${nf(P/1000,2)} kW`:""}.`}; },
    /* choisir la bonne relation */
    ()=>{ const v=rnd([0,1,2]);
      if(v===0) return {q:"La chambre côté fond d'un vérin hydraulique, de section S, est alimentée avec un débit Q. Quelle relation donne la vitesse de sortie v de la tige ?",type:"ch",...mc(`v = ${FRAC("Q","S")}`,["v = Q·S",`v = ${FRAC("S","Q")}`,`v = ${FRAC("Q","p·S")}`]),
        expl:`Pendant une durée Δt, l'huile entrée occupe le volume Q·Δt = S·v·Δt balayé par le piston : ${F("Q = S·v")}, donc ${F(`v = ${FRAC("Q","S")}`)}, avec Q en m³/s et S en m².`};
      if(v===1) return {q:"Un vérin double effet (piston de diamètre D, tige de diamètre d) est alimenté sous la pression p côté tige. Quelle relation donne l'effort de traction F ?",type:"ch",...mc(`F = p·${FRAC("π·(D² − d²)","4")}`,[`F = p·${FRAC("π·D²","4")}`,`F = p·${FRAC("π·d²","4")}`,`F = p·${FRAC("π·(D − d)²","4")}`]),
        expl:`Côté tige, la pression agit sur la couronne comprise entre le contour du piston et la tige : ${F(`S = ${FRAC("π·(D² − d²)","4")}`)}, puis F = p·S.`};
      return {q:"Quelle est l'unité du coefficient de traînée Cx dans la relation Fx = ½·ρ·S·Cx·v² ?",type:"ch",...mc("Il n'a pas d'unité",["Le newton (N)","Le kilogramme par mètre cube (kg/m³)","Le mètre carré (m²)"]),
        expl:`½·ρ·S·v² s'exprime en kg/m³ × m² × m²/s² = kg·m/s², c'est-à-dire en newtons, comme Fx : ${F("Cx est sans unité")}. Il dépend de la forme de l'objet et de son orientation dans l'écoulement.`}; }
  ],
  2:[
    /* vérin : effort de traction côté tige */
    ()=>{ const o=verin(Math.random()<0.5), Sa=Math.PI*((o.D/1000)**2-(o.d/1000)**2)/4, Fv=o.p*1e5*Sa;
      return {fig:fx_flu_verin({alim:"B",mv:-1,D:`D = ${o.D} mm`,d:`d = ${o.d} mm`}),ctx:`${cap(o.u)} : piston de diamètre D = ${o.D} mm, tige de diamètre d = ${o.d} mm. La chambre côté tige est alimentée sous p = ${nf(o.p,0)} bar (${PB}).`,
        q:"Calcule l'effort de traction théorique exercé par la tige pendant la rentrée.",type:"num",ans:o.hy?Fv/1000:Fv,tolR:0.02,unit:o.hy?"kN":"N",
        expl:`Section annulaire : ${F(`S = ${FRAC("π·(D² − d²)","4")}`)} = ${FRAC(`π × (${mOf(o.D)}² − ${mOf(o.d)}²)`,"4")} = ${sci(Sa,2)} m². ${F("F = p·S")} = ${nf(o.p,0)} × ${p10(5)} × ${sci(Sa,2)} = ${Fk(Fv,o.hy)}.`}; },
    /* vérin : pression nécessaire */
    ()=>{ const o=draw(()=>{ const hy=Math.random()<0.5, D=rnd(hy?[40,50,63,80,100,125]:[25,32,40,50,63,80,100]), Fv=hy?rnd([10,15,20,25,30,40,50,60,80])*1000:rnd([150,200,250,300,400,500,600,800,1000,1200,1500]), S=disk(D/1000), p=Fv/S/1e5; return {hy,D,Fv,S,p}; },o=>o.hy?o.p>=50&&o.p<=250:o.p>=2.5&&o.p<=8);
      const Ft=o.hy?`${nf(o.Fv/1000,0)} kN`:`${nf(o.Fv,0)} N`;
      return {fig:fx_flu_verin({alim:"A",mv:1,D:`D = ${o.D} mm`,F:`F = ${Ft}`}),ctx:`Un vérin ${o.hy?"hydraulique":"pneumatique"} de diamètre D = ${o.D} mm doit exercer un effort de poussée F = ${Ft} (frottements négligés).`,
        q:"Quelle pression faut-il dans la chambre côté fond ? Donne-la en bar.",type:"num",ans:o.p,tolR:0.02,unit:"bar",
        expl:`S = ${FRAC(`π × ${mOf(o.D)}²`,"4")} = ${sci(o.S,2)} m². ${F(`p = ${FRAC("F","S")}`)} = ${FRAC(nf(o.Fv,0),sci(o.S,2))} = ${paf(o.p*1e5)} Pa, soit ${U(o.p,"bar")}.`}; },
    /* vérin : vitesse de sortie de tige */
    ()=>{ const [D]=rnd(VHY), Q=rnd([5,8,10,12,15,20,25,30,40]), S=disk(D/1000), q=Q/60000, v=q/S;
      return {fig:fx_flu_verin({alim:"A",mv:1,D:`D = ${D} mm`}),ctx:`La pompe d'une centrale hydraulique envoie un débit Q = ${Q} L/min dans la chambre côté fond d'un vérin de diamètre D = ${D} mm (huile incompressible, fuites négligées).`,
        q:"Calcule la vitesse de sortie de la tige, en mm/s.",type:"num",ans:v*1000,tolR:0.02,unit:"mm/s",
        expl:`Q = ${FRAC(`${Q} × ${p10(-3)}`,"60")} = ${sci(q,2)} m³/s ; S = ${FRAC(`π × ${mOf(D)}²`,"4")} = ${sci(S,2)} m². ${F(`v = ${FRAC("Q","S")}`)} = ${FRAC(sci(q,2),sci(S,2))} = ${nf(v,4)} m/s, soit ${U(v*1000,"mm/s")}.`}; },
    /* vérin : débit nécessaire */
    ()=>{ const [D]=rnd(VHY), vt=rnd([20,25,40,50,60,80,100]), S=disk(D/1000), q=S*vt/1000, Q=q*60000;
      return {fig:fx_flu_verin({alim:"A",mv:1,D:`D = ${D} mm`}),ctx:`La tige d'un vérin hydraulique de diamètre D = ${D} mm doit sortir à v = ${vt} mm/s.`,
        q:"Quel débit la pompe doit-elle fournir, en L/min ?",type:"num",ans:Q,tolR:0.02,unit:"L/min",
        expl:`${F("Q = S·v")} = ${FRAC(`π × ${mOf(D)}²`,"4")} × ${nf(vt/1000,3)} = ${sci(q,2)} m³/s. En L/min : ${sci(q,2)} × 1 000 × 60 = ${U(Q,"L/min")}.`}; },
    /* hydrostatique : pression puis effort sur un hublot */
    ()=>{ const h=rnd([10,15,20,25,30,40,50]), dh=rnd([60,80,100,120,150]), p=RM*g*h, S=disk(dh/1000), Fv=p*S;
      const fig=fx_flu_prof({hublot:1,hl:`h = ${h} m`}), ctx=`Un drone sous-marin travaille à la profondeur h = ${h} m. Son hublot circulaire a un diamètre de ${dh} mm ; l'air intérieur est à la pression atmosphérique. Eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Calcule l'écart entre la pression de l'eau à cette profondeur et la pression atmosphérique, en bar.",type:"num",ans:p/1e5,tolR:0.02,unit:"bar",
          expl:`${F("p = ρ·g·h")} = 1 025 × 9,81 × ${h} = ${nf(p,0)} Pa, soit ${U(p/1e5,"bar")}.`},
        {fig,ctx,q:"Quel effort résultant l'eau exerce-t-elle sur le hublot ?",type:"num",ans:Fv,tolR:0.02,unit:"N",
          expl:`S = ${FRAC(`π × ${mOf(dh)}²`,"4")} = ${sci(S,2)} m². La pression atmosphérique agit des deux côtés et se compense : ${F("F = p·S")} = ${nf(p,0)} × ${sci(S,2)} = ${U(Fv,"N")}.`}]; },
    /* capteur de pression : hauteur ou profondeur maximale */
    ()=>{ if(Math.random()<0.5){ const pm=rnd([0.25,0.4,0.5,0.6,1]), h=pm*1e5/(RE*g);
        return {ctx:`Le niveau d'eau d'une citerne est mesuré par un capteur de pression relative placé au fond, d'étendue de mesure 0 à ${nf(pm,2)} bar. ρ = 1 000 kg/m³ ; g = 9,81 m/s².`,
          q:"Quelle hauteur d'eau maximale ce capteur peut-il mesurer ?",type:"num",ans:h,tolR:0.02,unit:"m",
          expl:`${F("p = ρ·g·h")}, donc ${F(`h = ${FRAC("p","ρ·g")}`)} = ${FRAC(`${nf(pm,2)} × ${p10(5)}`,"1 000 × 9,81")} = ${U(h,"m")}.`}; }
      const pm=rnd([3,5,6,10,20]), h=pm*1e5/(RM*g);
      return {ctx:`Le capteur de profondeur d'un drone sous-marin mesure la pression relative de 0 à ${pm} bar. Eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s².`,
        q:"Jusqu'à quelle profondeur ce capteur peut-il mesurer ?",type:"num",ans:h,tolR:0.02,unit:"m",
        expl:`${F("p = ρ·g·h")}, donc ${F(`h = ${FRAC("p","ρ·g")}`)} = ${FRAC(`${pm} × ${p10(5)}`,"1 025 × 9,81")} = ${U(h,"m")}.`}; },
    /* traînée : vitesse en km/h */
    ()=>{ const s=rnd(DRAG), S=rnd(s.S), Cx=rnd(s.C), vk=rnd(s.vk), v=vk/3.6, Fx=0.5*s.r*S*Cx*v*v;
      return {ctx:`${cap(s.n)} ${s.vb} à ${nf(vk,0)} km/h. Surface frontale${s.r>10?" immergée":""} S = ${nf(S,3)} m² ; Cx = ${nf(Cx,2)} ; ${s.fl} : ρ = ${nf(s.r,1)} kg/m³.`,
        q:"Calcule la traînée à cette vitesse.",type:"num",ans:Fx,tolR:0.02,unit:"N",
        expl:`La vitesse doit être en m/s : v = ${FRAC(nf(vk,0),"3,6")} = ${nf(v,2)} m/s. ${F("Fx = ½·ρ·S·Cx·v²")} = 0,5 × ${nf(s.r,1)} × ${nf(S,3)} × ${nf(Cx,2)} × ${nf(v,2)}² = ${U(Fx,"N")}.`}; },
    /* traînée puis puissance */
    ()=>{ const s=rnd(DRAG.filter(x=>x.r<10)), S=rnd(s.S), Cx=rnd(s.C), vk=rnd(s.vk), v=vk/3.6, Fx=0.5*RA*S*Cx*v*v, P=Fx*v;
      const ctx=`${cap(s.n)} ${s.vb} à vitesse constante : ${nf(vk,0)} km/h. Surface frontale S = ${nf(S,3)} m² ; Cx = ${nf(Cx,2)} ; ρ(air) = 1,2 kg/m³.`;
      return [{ctx,q:"Calcule la traînée aérodynamique à cette vitesse.",type:"num",ans:Fx,tolR:0.02,unit:"N",
          expl:`v = ${FRAC(nf(vk,0),"3,6")} = ${nf(v,2)} m/s. ${F("Fx = ½·ρ·S·Cx·v²")} = 0,5 × 1,2 × ${nf(S,3)} × ${nf(Cx,2)} × ${nf(v,2)}² = ${U(Fx,"N")}.`},
        {ctx,q:"Quelle puissance faut-il fournir pour vaincre cette traînée ?",type:"num",ans:P,tolR:0.02,unit:"W",
          expl:`${F("P = Fx·v")} = ${nf(Fx,2)} × ${nf(v,2)} = ${U(P,"W")}${P>=1000?`, soit ${nf(P/1000,2)} kW`:""}.`}]; },
    /* vol horizontal : portance puis coefficient Cz */
    ()=>{ const o=draw(()=>{ const m=rnd([1.5,2,2.5,3,3.5,4]), S=rnd([0.3,0.35,0.4,0.45,0.5]), v=rnd([12,13,14,15,16,18]); const Fz=m*g, Cz=2*Fz/(RA*S*v*v); return {m,S,v,Fz,Cz}; },o=>o.Cz>=0.35&&o.Cz<=1.2);
      const fig=fx_flu_aile({}), ctx=`Un drone de cartographie à voilure fixe, de masse m = ${nf(o.m,1)} kg, vole en ligne droite horizontale à vitesse constante v = ${o.v} m/s. Surface de l'aile S = ${nf(o.S,2)} m² ; ρ(air) = 1,2 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Quelle portance l'aile doit-elle fournir dans ce vol ?",type:"num",ans:o.Fz,tolR:0.02,unit:"N",
          expl:`Vol rectiligne à vitesse constante : les actions se compensent ; sur la verticale, ${F("Fz = P = m·g")} = ${nf(o.m,1)} × 9,81 = ${U(o.Fz,"N")}.`},
        {fig,ctx,q:"Déduis-en le coefficient de portance Cz de l'aile dans ce vol.",type:"num",ans:o.Cz,tolR:0.02,unit:"",
          expl:`${F("Fz = ½·ρ·S·Cz·v²")}, donc ${F(`Cz = ${FRAC("2·Fz","ρ·S·v²")}`)} = ${FRAC(`2 × ${nf(o.Fz,2)}`,`1,2 × ${nf(o.S,2)} × ${o.v}²`)} = ${U(o.Cz,"")}.`}]; },
    /* lecture d'une courbe de traînée puis puissance */
    ()=>{ const o=draw(()=>{ const v0=rnd([8,10,12,14,16]), F0=rnd([10,15,20,25,30,35,40,45,50,60,70,80]), k=F0/(v0*v0); return {v0,F0,k,Fm:k*400}; },o=>o.Fm>=40&&o.Fm<=118&&(o.Fm<=58||o.F0%10===0));
      const big=o.Fm>58, ym=big?120:60, ys=big?20:10;
      const fig=fx_flu_plot({xmax:20,ymax:ym,xs:2,ys,xl:"v (m/s)",yl:"Fx (N)",c:[{f:x=>o.k*x*x,lab:"traînée",lx:17,dy:-14}],alt:"Traînée mesurée en fonction de la vitesse de l'air"});
      const ctx="Essai en soufflerie d'un cycliste sur son vélo : la courbe donne l'effort de traînée mesuré en fonction de la vitesse de l'air.";
      return [{fig,ctx,q:`Lis sur la courbe la traînée à v = ${o.v0} m/s.`,type:"num",ans:o.F0,tolA:ys/5,unit:"N",
          expl:`On part de v = ${o.v0} m/s sur l'axe horizontal, on monte jusqu'à la courbe, puis on lit sur l'axe vertical : ${U(o.F0,"N")}.`},
        {fig,ctx,q:`Quelle puissance faut-il fournir pour vaincre la traînée à ${o.v0} m/s, soit ${nf(o.v0*3.6,1)} km/h ?`,type:"num",ans:o.F0*o.v0,tolR:0.05,unit:"W",
          expl:`${F("P = Fx·v")} = ${o.F0} × ${o.v0} = ${U(o.F0*o.v0,"W")}. La traînée croît comme v² et sa puissance comme v³ : c'est elle qui limite la vitesse d'un cycliste.`}]; },
    /* presse hydraulique : même pression sous les deux pistons */
    ()=>{ const d1=rnd([10,12,15,16,20]), d2=rnd([40,50,60,80]), F1=rnd([100,150,200,250,300]), S1=disk(d1/1000), S2=disk(d2/1000), p=F1/S1, F2=p*S2;
      const fig=fx_flu_presse({l1:`d1 = ${d1} mm`,l2:`d2 = ${d2} mm`,f1:`F1 = ${F1} N`,f2:"F2 = ?"}), ctx=`Cric hydraulique : on appuie avec F1 = ${F1} N sur le petit piston 1 (diamètre d1 = ${d1} mm) ; l'huile transmet la pression au grand piston 2 (diamètre d2 = ${d2} mm). Pistons à la même hauteur, frottements négligés.`;
      return [{fig,ctx,q:"Quelle pression règne dans l'huile, en bar ?",type:"num",ans:p/1e5,tolR:0.02,unit:"bar",
          expl:`S1 = ${FRAC(`π × ${mOf(d1)}²`,"4")} = ${sci(S1,2)} m². ${F(`p = ${FRAC("F1","S1")}`)} = ${FRAC(F1,sci(S1,2))} = ${paf(p)} Pa, soit ${U(p/1e5,"bar")}.`},
        {fig,ctx,q:"Quel effort F2 le grand piston peut-il exercer ?",type:"num",ans:F2,tolR:0.02,unit:"N",
          expl:`La même pression agit sur le grand piston : ${F("F2 = p·S2")} = ${paf(p)} × ${sci(S2,2)} = ${U(F2,"N")}. L'effort est multiplié par ${FRAC("S2","S1")} = ${FRAC(`${d2}²`,`${d1}²`)} = ${nf(S2/S1,2)}.`}]; },
    /* modèle multiphysique : gain de traînée K = ½·ρ·S·Cx */
    ()=>{ const s=rnd(DRAG.filter(x=>x.r<10)), S=rnd(s.S), Cx=rnd(s.C), K=0.5*RA*S*Cx, vk=rnd(s.vk), v=vk/3.6, Fx=K*v*v;
      const ctx=`Dans le modèle multiphysique ${s.de}, la traînée est calculée par un bloc « gain » : Fx = K·v², avec v en m/s. Données : S = ${nf(S,3)} m² ; Cx = ${nf(Cx,2)} ; ρ(air) = 1,2 kg/m³.`;
      return [{ctx,q:"Quelle valeur faut-il donner au gain K ?",type:"num",ans:K,tolR:0.02,unit:"kg/m",
          expl:`Par identification avec ${F("Fx = ½·ρ·S·Cx·v²")} : ${F("K = ½·ρ·S·Cx")} = 0,5 × 1,2 × ${nf(S,3)} × ${nf(Cx,2)} = ${U(K,"kg/m")} (des N par (m/s)², c'est-à-dire des kg/m).`},
        {ctx,q:`Quelle traînée le modèle calcule-t-il à ${nf(vk,0)} km/h ?`,type:"num",ans:Fx,tolR:0.02,unit:"N",
          expl:`v = ${FRAC(nf(vk,0),"3,6")} = ${nf(v,2)} m/s ; ${F("Fx = K·v²")} = ${nf(K,4)} × ${nf(v,2)}² = ${U(Fx,"N")}.`}]; },
    /* même débit : la rentrée est plus rapide que la sortie */
    ()=>{ const [D,d]=rnd(VHY), Q=rnd([8,10,12,15,20,25]), Sf=disk(D/1000), Sa=Sf-disk(d/1000), q=Q/60000, v1=q/Sf, v2=q/Sa;
      const fig=fx_flu_verin({alim:"B",mv:-1,D:`D = ${D} mm`,d:`d = ${d} mm`}), ctx=`Vérin hydraulique double effet : D = ${D} mm, d = ${d} mm. La même pompe, de débit Q = ${Q} L/min, alimente la chambre côté fond pour la sortie, puis la chambre côté tige pour la rentrée.`;
      return [{fig,ctx,q:"Calcule la vitesse de la tige pendant la sortie, en mm/s.",type:"num",ans:v1*1000,tolR:0.02,unit:"mm/s",
          expl:`Q = ${sci(q,2)} m³/s ; côté fond, S = ${FRAC(`π × ${mOf(D)}²`,"4")} = ${sci(Sf,2)} m². ${F(`v = ${FRAC("Q","S")}`)} = ${nf(v1,4)} m/s, soit ${U(v1*1000,"mm/s")}.`},
        {fig,ctx,q:"Calcule la vitesse de la tige pendant la rentrée, en mm/s.",type:"num",ans:v2*1000,tolR:0.02,unit:"mm/s",
          expl:`Côté tige, section annulaire : ${F(`S' = ${FRAC("π·(D² − d²)","4")}`)} = ${sci(Sa,2)} m². v' = ${FRAC(sci(q,2),sci(Sa,2))} = ${nf(v2,4)} m/s, soit ${U(v2*1000,"mm/s")} : la rentrée est ${nf(v2/v1,2)} fois plus rapide, car la chambre côté tige est plus petite.`}]; }
  ],
  3:[
    /* choix d'un vérin pour tirer une charge */
    ()=>{ const CAT=VPN.slice(2);
      const o=draw(()=>{ const p=rnd([5,6,7]), Fr=50*(6+Math.floor(Math.random()*75)), Smin=Fr/(p*1e5);
          const sa=CAT.map(([D,d])=>Math.PI*((D/1000)**2-(d/1000)**2)/4), sf=CAT.map(([D])=>disk(D/1000)), i=sa.findIndex(x=>x>=Smin), j=sf.findIndex(x=>x>=Smin);
          return {p,Fr,Smin,sa,sf,i,j}; },o=>o.i>=1&&o.sa[o.i]>=1.03*o.Smin&&o.sa[o.i-1]<=o.Smin/1.03&&o.j>=0&&(o.j===o.i||o.sf[o.j]>=1.03*o.Smin)&&Math.random()<(o.j<o.i?1:0.4));
      const lo=Math.max(0,o.i-3), hi=Math.min(o.j,o.i-1,CAT.length-4), s0=lo+Math.floor(Math.random()*(hi-lo+1)), opts=[0,1,2,3].map(k=>s0+k), lab=k=>`V${k+1} : D = ${CAT[k][0]} mm, d = ${CAT[k][1]} mm`;
      const data=table(["Vérin","Piston D","Tige d"],CAT.map(([D,d],k)=>[`V${k+1}`,`${D} mm`,`${d} mm`]));
      const ctx=`Un vérin pneumatique double effet doit tirer une charge avec un effort d'au moins ${nf(o.Fr,0)} N pendant la rentrée de sa tige. Pression d'alimentation : p = ${o.p} bar (${PB}) ; frottements négligés. Le tableau donne les vérins du catalogue.`;
      const cm2=x=>nf(x*1e4,2);
      return [{data,ctx,q:"Quelle surface minimale la pression doit-elle trouver dans la chambre côté tige, en cm² ?",type:"num",ans:o.Smin*1e4,tolR:0.02,unit:"cm²",
          expl:`${F("F = p·S")}, donc ${F(`S ≥ ${FRAC("F","p")}`)} = ${FRAC(nf(o.Fr,0),`${o.p} × ${p10(5)}`)} = ${sci(o.Smin,2)} m², soit ${U(o.Smin*1e4,"cm²")}.`},
        {data,ctx,q:"Quel est le plus petit vérin du catalogue qui convient ?",type:"ch",ch:opts.map(lab),ok:opts.indexOf(o.i),
          expl:`En traction, la pression agit sur la section annulaire ${F(`S = ${FRAC("π·(D² − d²)","4")}`)}. V${o.i} : ${cm2(o.sa[o.i-1])} cm² < ${cm2(o.Smin)} cm², il ne convient pas ; V${o.i+1} : ${cm2(o.sa[o.i])} cm² ≥ ${cm2(o.Smin)} cm², c'est ${F(`V${o.i+1}`)}.${o.j<o.i?` Piège : V${o.j+1} conviendrait en poussée (${FRAC("π·D²","4")} = ${cm2(o.sf[o.j])} cm²), mais pas en traction.`:""}`}]; },
    /* cycle de sortie et de rentrée : exigence de cadence */
    ()=>{ const o=draw(()=>{ const [D,d]=rnd(VHY.slice(2)), Q=rnd([10,12,15,20,25,30]), c=rnd([200,250,300,400,500]), tm=rnd([4,5,6,8,10,12,15,20]);
          const Sf=disk(D/1000), Sa=Sf-disk(d/1000), q=Q/60000, t1=Sf*c/1000/q, t2=Sa*c/1000/q; return {D,d,Q,c,tm,Sf,Sa,q,t1,t2,tt:t1+t2}; },o=>far(o.tt,o.tm,0.08)&&o.tt>=2&&o.tt<=40);
      const ok=o.tt<=o.tm, fig=fx_flu_verin({alim:"A",mv:1,D:`D = ${o.D} mm`,d:`d = ${o.d} mm`}), ctx=`Fendeuse de bûches : vérin hydraulique double effet D = ${o.D} mm, d = ${o.d} mm, course ${o.c} mm, alimenté par une pompe de débit Q = ${o.Q} L/min (sortie par la chambre côté fond, rentrée par la chambre côté tige).`;
      return [{fig,ctx,q:"Calcule la durée de la sortie complète de la tige.",type:"num",ans:o.t1,tolR:0.02,unit:"s",
          expl:`Il faut remplir la chambre côté fond, de volume S·course : ${F(`t = ${FRAC("S·course","Q")}`)} = ${FRAC(`${sci(o.Sf,2)} × ${nf(o.c/1000,3)}`,sci(o.q,2))} = ${U(o.t1,"s")}.`},
        {fig,ctx,q:"Calcule la durée de la rentrée complète de la tige.",type:"num",ans:o.t2,tolR:0.02,unit:"s",
          expl:`Côté tige, la section est annulaire : S' = ${FRAC(`π × (${mOf(o.D)}² − ${mOf(o.d)}²)`,"4")} = ${sci(o.Sa,2)} m². ${F(`t' = ${FRAC("S'·course","Q")}`)} = ${U(o.t2,"s")} : la rentrée est plus rapide.`},
        {fig,ctx,q:`Exigence : un cycle complet (sortie puis rentrée) doit durer au plus ${o.tm} s. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`Cycle : ${nf(o.t1,2)} + ${nf(o.t2,2)} = ${nf(o.tt,2)} s ${ok?"≤":">"} ${o.tm} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut une pompe de plus grand débit."}`}]; },
    /* drone à voilure fixe : vitesse minimale et lancement à la main */
    ()=>{ const o=draw(()=>{ const m=rnd([1.5,2,2.5,3,3.5,4]), S=rnd([0.25,0.3,0.35,0.4,0.5]), Cz=rnd([0.9,1,1.1,1.2]), vl=rnd([30,35,40,45,50]); const vmin=Math.sqrt(2*m*g/(RA*S*Cz)); return {m,S,Cz,vl,vmin}; },o=>far(o.vmin,o.vl/3.6,0.06)&&o.vmin>=7&&o.vmin<=20);
      const ok=o.vl/3.6>=o.vmin, fig=fx_flu_aile({showA:1}), ctx=`Un drone de cartographie à voilure fixe a une masse m = ${nf(o.m,1)} kg et une aile de surface S = ${nf(o.S,2)} m². Son coefficient de portance maximal, juste avant le décrochage, vaut Cz max = ${nf(o.Cz,1)}. ρ(air) = 1,2 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Quelle est la vitesse minimale à laquelle l'aile peut porter le drone en vol horizontal ?",type:"num",ans:o.vmin,tolR:0.02,unit:"m/s",
          expl:`En vol horizontal, ${F("Fz = m·g")}. Avec Cz max : ½·ρ·S·Cz max·v² = m·g, donc ${F(`v = √(${FRAC("2·m·g","ρ·S·Cz")})`)} = √(${FRAC(`2 × ${nf(o.m,1)} × 9,81`,`1,2 × ${nf(o.S,2)} × ${nf(o.Cz,1)}`)}) = ${U(o.vmin,"m/s")}.`},
        {fig,ctx,q:`Pour que l'aile porte le drone dès le lâcher, il doit être lancé au moins à cette vitesse. Un lancement à la main atteint ${o.vl} km/h. Est-ce suffisant ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${o.vl} km/h = ${FRAC(o.vl,"3,6")} = ${nf(o.vl/3.6,1)} m/s ${ok?"≥":"<"} ${nf(o.vmin,1)} m/s : ${ok?"le lancement à la main suffit.":"le lancement à la main ne suffit pas ; il faut une catapulte, ou une aile plus grande."}`}]; },
    /* foil : vitesse de décollage de la pirogue */
    ()=>{ const o=draw(()=>{ const m=rnd([250,280,300,350,400]), S=rnd([0.3,0.35,0.4,0.5]), Cz=rnd([0.5,0.6,0.7,0.8]), vm=rnd([14,16,18,20,22,25]); const v=Math.sqrt(2*m*g/(RM*S*Cz)); return {m,S,Cz,vm,v,vk:v*3.6}; },o=>far(o.vk,o.vm,0.06));
      const ok=o.vm>=o.vk, fig=fx_flu_aile({fl:"eau",cap:"foil sous la coque"}), ctx=`Une pirogue électrique à foil (masse totale avec l'équipage : ${o.m} kg) « décolle » quand la portance du foil immergé porte tout son poids : la coque sort alors de l'eau. Surface du foil S = ${nf(o.S,2)} m² ; Cz = ${nf(o.Cz,1)} ; eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Calcule la vitesse de décollage, en km/h.",type:"num",ans:o.vk,tolR:0.02,unit:"km/h",
          expl:`Au décollage, ${F("Fz = m·g")} : ½·ρ·S·Cz·v² = m·g, donc ${F(`v = √(${FRAC("2·m·g","ρ·S·Cz")})`)} = √(${FRAC(`2 × ${o.m} × 9,81`,`1 025 × ${nf(o.S,2)} × ${nf(o.Cz,1)}`)}) = ${nf(o.v,2)} m/s, soit ${U(o.vk,"km/h")}.`},
        {fig,ctx,q:`Sur sa coque, la pirogue atteint au plus ${o.vm} km/h. Peut-elle décoller ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${o.vm} km/h ${ok?"≥":"<"} ${nf(o.vk,1)} km/h : ${ok?"la pirogue peut décoller ; ensuite, la coque étant hors de l'eau, la traînée diminue fortement.":"la pirogue ne peut pas décoller : il faut un foil plus grand (S) ou plus porteur (Cz)."}`}]; },
    /* vitesse maximale limitée par la traînée */
    ()=>{ const SY=[{n:"Une voiture électrique",S:[2,2.1,2.2,2.3],C:[0.26,0.28,0.3,0.32],P:[20000,25000,30000,35000,40000],vr:[140,150,160,170,180]},{n:"Une moto électrique",S:[0.55,0.6,0.65],C:[0.55,0.6,0.65],P:[10000,12000,15000,18000],vr:[130,140,150,160]},{n:"Un cycliste en contre-la-montre",S:[0.35,0.38,0.4],C:[0.6,0.65,0.7],P:[250,300,350,400],vr:[42,45,48,50]}];
      const want=Math.random()<0.5, o=draw(()=>{ const s=rnd(SY), S=rnd(s.S), Cx=rnd(s.C), P=rnd(s.P), vr=rnd(s.vr), v=Math.cbrt(2*P/(RA*S*Cx)); return {s,S,Cx,P,vr,v,vk:v*3.6}; },o=>far(o.vk,o.vr,0.05)&&(o.vk>=o.vr)===want);
      const ok=o.vk>=o.vr, Pt=o.P>=1000?`${nf(o.P/1000,0)} kW`:`${o.P} W`, ctx=`${o.s.n} dispose d'une puissance de ${Pt} pour vaincre les résistances à l'avancement. À grande vitesse, on ne retient que la traînée : S = ${nf(o.S,2)} m² ; Cx = ${nf(o.Cx,2)} ; ρ(air) = 1,2 kg/m³.`;
      return [{ctx,q:"Calcule la vitesse maximale atteignable, en km/h.",type:"num",ans:o.vk,tolR:0.02,unit:"km/h",
          expl:`À la vitesse maximale, toute la puissance sert à vaincre la traînée : ${F("P = Fx·v = ½·ρ·S·Cx·v³")}, donc ${F(`v = ∛(${FRAC("2·P","ρ·S·Cx")})`)} = ∛(${FRAC(`2 × ${nf(o.P,0)}`,`1,2 × ${nf(o.S,2)} × ${nf(o.Cx,2)}`)}) = ${nf(o.v,2)} m/s, soit ${U(o.vk,"km/h")}.`},
        {ctx,q:`Exigence : vitesse maximale d'au moins ${o.vr} km/h. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.vk,1)} km/h ${ok?"≥":"<"} ${o.vr} km/h : ${ok?"le modèle prévoit que l'exigence est satisfaite ; la résistance au roulement, négligée ici, réduira un peu la vitesse réelle.":"l'exigence n'est pas satisfaite ; il faudrait réduire S·Cx ou augmenter la puissance, qui croît comme v³."}`}]; },
    /* hausse de vitesse : hausse de traînée et de puissance */
    ()=>{ const x=rnd([10,15,20,25,30,40]), k=1+x/100, a=(k*k-1)*100, b=(k**3-1)*100, s=rnd(["d'un drone de livraison","d'une voiture électrique sur autoroute","d'un cycliste","d'une pirogue électrique"]);
      const ctx=`On augmente de ${x} % la vitesse de croisière ${s}. On ne tient compte que de la traînée, avec un Cx constant.`;
      return [{ctx,q:"De quel pourcentage la traînée augmente-t-elle ?",type:"num",ans:a,tolR:0.02,unit:"%",
          expl:`Fx est proportionnelle à v² : ${F(`${FRAC("Fx2","Fx1")} = (${FRAC("v2","v1")})²`)} = ${nf(k,2)}² = ${nf(k*k,4)}, soit une hausse de ${U(a,"%")}.`},
        {ctx,q:"De quel pourcentage la puissance nécessaire augmente-t-elle ?",type:"num",ans:b,tolR:0.02,unit:"%",
          expl:`${F("P = Fx·v")} est proportionnelle à v³ : ${nf(k,2)}³ = ${nf(k**3,4)}, soit une hausse de ${U(b,"%")}, bien plus que les ${x} % de vitesse gagnés. L'énergie consommée par kilomètre (Fx × distance) augmente, elle, de ${nf(a,1)} %.`}]; },
    /* panneau soumis à une rafale cyclonique : effort, moment, exigence */
    ()=>{ const o=draw(()=>{ const S=rnd([1.5,2,2.5,3,4]), h=rnd([2,2.5,3,3.5,4]), vk=rnd([120,140,150,160,180,200]), Madm=rnd([4,5,6,8,10,12,15,20])*1000; const v=vk/3.6, Fx=0.5*RA*S*1.2*v*v, M=Fx*h; return {S,h,vk,Madm,v,Fx,M}; },o=>far(o.M,o.Madm,0.08));
      const ok=o.M<=o.Madm, fig=fx_flu_panneau({hl:`h = ${nf(o.h,1)} m`,F:"Fx"}), ctx=`Un panneau d'affichage de surface S = ${nf(o.S,1)} m² est porté par un mât encastré dans le sol en O. On étudie une rafale cyclonique de ${o.vk} km/h, perpendiculaire au panneau. Plaque plane : Cx = 1,2 ; ρ(air) = 1,2 kg/m³. La traînée s'applique au centre du panneau, à la hauteur h = ${nf(o.h,1)} m ; on néglige l'action du vent sur le mât.`;
      return [{fig,ctx,q:"Calcule l'effort du vent sur le panneau.",type:"num",ans:o.Fx,tolR:0.02,unit:"N",
          expl:`v = ${FRAC(o.vk,"3,6")} = ${nf(o.v,2)} m/s. ${F("Fx = ½·ρ·S·Cx·v²")} = 0,5 × 1,2 × ${nf(o.S,1)} × 1,2 × ${nf(o.v,2)}² = ${U(o.Fx,"N")}.`},
        {fig,ctx,q:"Calcule le moment de cet effort au point O, pied du mât.",type:"num",ans:o.M,tolR:0.02,unit:"N·m",
          expl:`Fx est horizontale et sa droite d'action passe à la distance h de O : ${F("M = Fx·h")} = ${nf(o.Fx,0)} × ${nf(o.h,1)} = ${U(o.M,"N·m")}.`},
        {fig,ctx,q:`L'encastrement du mât supporte un moment de ${nf(o.Madm,0)} N·m au plus. Le panneau résiste-t-il à cette rafale ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.M,0)} N·m ${ok?"≤":">"} ${nf(o.Madm,0)} N·m : ${ok?"l'encastrement résiste.":"l'encastrement ne résiste pas ; il faut un mât plus robuste, ou un panneau que l'on démonte avant le cyclone."} À noter : une vitesse doublée multiplie le moment par 4.`}]; },
    /* repérer l'erreur d'un élève */
    ()=>{ const v=rnd([0,1,2,3,4,5,6]); let ctx, st, bad, why;
      if(v===0){ const D=rnd([40,50,63]), p=rnd([5,6]), Sm=disk(D);
        ctx=`Effort de poussée d'un vérin pneumatique de diamètre D = ${D} mm alimenté sous ${p} bar.`;
        st=[`S = ${FRAC("π·D²","4")} = ${FRAC(`π × ${D}²`,"4")} = ${nf(Sm,0)} mm²`,`F = p·S = ${p} × ${p10(5)} × ${nf(Sm,0)}`,`F = ${sci(p*1e5*Sm,2)} N`]; bad=1;
        why=`Les unités ne sont pas cohérentes : avec p en Pa, S doit être en m² (${nf(Sm,0)} mm² = ${sci(Sm*1e-6,2)} m²), d'où F = ${nf(p*1e5*Sm*1e-6,0)} N. Autre méthode : 1 bar = 0,1 N/mm², donc F = ${nf(p/10,1)} × ${nf(Sm,0)} = ${nf(p/10*Sm,0)} N.`; }
      else if(v===1){ const [D,d]=rnd(VPN.slice(3)), p=rnd([5,6]), Sf=disk(D/1000), Sa=Sf-disk(d/1000);
        ctx=`Effort de traction d'un vérin double effet (D = ${D} mm, d = ${d} mm) dont on alimente la chambre côté tige sous ${p} bar.`;
        st=["La pression agit sur le piston, côté tige.",`S = ${FRAC("π·D²","4")} = ${sci(Sf,2)} m²`,`F = p·S = ${nf(p*1e5*Sf,0)} N`]; bad=1;
        why=`Côté tige, la pression n'agit pas sur la section de la tige : S = ${FRAC("π·(D² − d²)","4")} = ${sci(Sa,2)} m², d'où F = ${nf(p*1e5*Sa,0)} N.`; }
      else if(v===2){ const vk=rnd([36,45,54]), S=rnd([0.5,0.6]), Cx=rnd([0.8,0.9]);
        ctx=`Traînée d'un cycliste à ${vk} km/h (S = ${nf(S,1)} m², Cx = ${nf(Cx,1)}, ρ = 1,2 kg/m³).`;
        st=["Fx = ½·ρ·S·Cx·v²",`Fx = 0,5 × 1,2 × ${nf(S,1)} × ${nf(Cx,1)} × ${vk}²`,`Fx = ${nf(0.5*RA*S*Cx*vk*vk,0)} N`]; bad=1;
        why=`La vitesse doit être en m/s : v = ${FRAC(vk,"3,6")} = ${nf(vk/3.6,1)} m/s, d'où Fx = ${nf(0.5*RA*S*Cx*(vk/3.6)**2,1)} N, ${nf(3.6*3.6,2)} fois moins.`; }
      else if(v===3){ const Q=rnd([12,15,20,30]), D=rnd([50,63,80]), S=disk(D/1000);
        ctx=`Vitesse de sortie de la tige d'un vérin hydraulique (D = ${D} mm) alimenté avec Q = ${Q} L/min.`;
        st=[`Q = ${FRAC(`${Q} × ${p10(-3)}`,"60")} = ${sci(Q/60000,2)} m³/s`,`S = ${FRAC("π·D²","4")} = ${sci(S,2)} m²`,`v = Q·S = ${sci(Q/60000*S,2)} m/s`]; bad=2;
        why=`Q = S·v, donc v = ${FRAC("Q","S")} = ${FRAC(sci(Q/60000,2),sci(S,2))} = ${S3(Q/60000/S)} m/s.`; }
      else if(v===4){ const k=rnd([1.5,2]);
        ctx=`Effet d'une hausse de vitesse sur la puissance de traînée d'un drone : sa vitesse est multipliée par ${nf(k,1)}.`;
        st=["Fx = ½·ρ·S·Cx·v² : la traînée est proportionnelle à v².",`La traînée est donc multipliée par ${nf(k*k,2)}.`,`La puissance P = Fx·v est donc multipliée par ${nf(k*k,2)}, comme la traînée.`]; bad=2;
        why=`P = Fx·v est proportionnelle à v² × v = v³ : elle est multipliée par ${nf(k,1)}³ = ${nf(k**3,3)}.`; }
      else if(v===6){ const Q=rnd([12,18,24,30]), D=rnd([40,50,63]), S=disk(D/1000);
        ctx=`Vitesse de sortie de la tige d'un vérin hydraulique (D = ${D} mm) alimenté avec Q = ${Q} L/min.`;
        st=[`Q = ${Q} L/min = ${Q} × ${p10(-3)} m³/s`,`S = ${FRAC("π·D²","4")} = ${sci(S,2)} m²`,`v = ${FRAC("Q","S")} = ${S3(Q*1e-3/S)} m/s`]; bad=0;
        why=`Il faut aussi convertir les minutes en secondes : Q = ${FRAC(`${Q} × ${p10(-3)}`,"60")} = ${sci(Q/60000,2)} m³/s, d'où v = ${S3(Q/60000/S)} m/s, soit 60 fois moins.`; }
      else { const h=rnd([10,20,30]), p=RM*g*h;
        ctx=`Pression relative à ${h} m de profondeur dans la mer (ρ = 1 025 kg/m³, g = 9,81 m/s²).`;
        st=["p = ρ·g·h",`p = 1 025 × 9,81 × ${h} = ${nf(p,0)} Pa`,`p = ${nf(p/1000,0)} bar`]; bad=2;
        why=`${PB} : p = ${FRAC(nf(p,0),p10(5))} = ${nf(p/1e5,2)} bar ; ${nf(p/1000,0)} est la pression en kPa.`; }
      return {ctx,data:OL(st),q:"Un élève a rédigé ce calcul. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
    /* drone sous-marin : profondeur maximale fixée par le hublot */
    ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const dh=rnd([80,100,120,150]), Fa=rnd([5,8,10,12,15,20,25,30])*1000, hm=rnd([30,40,50,60,80,100]); const S=disk(dh/1000), pmax=Fa/S, hmax=pmax/(RM*g); return {dh,Fa,hm,S,pmax,hmax}; },o=>far(o.hmax,o.hm,0.06)&&o.hmax>=15&&o.hmax<=300&&(o.hmax>=o.hm)===want);
      const ok=o.hmax>=o.hm, fig=fx_flu_prof({hublot:1,hl:"h"}), ctx=`Le hublot circulaire d'un drone sous-marin (diamètre ${o.dh} mm) supporte un effort résultant de ${nf(o.Fa/1000,0)} kN au plus. L'air intérieur reste à la pression atmosphérique. Eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Quel écart de pression maximal le hublot supporte-t-il, en bar ?",type:"num",ans:o.pmax/1e5,tolR:0.02,unit:"bar",
          expl:`S = ${FRAC(`π × ${mOf(o.dh)}²`,"4")} = ${sci(o.S,2)} m². ${F(`p = ${FRAC("F","S")}`)} = ${FRAC(nf(o.Fa,0),sci(o.S,2))} = ${paf(o.pmax)} Pa, soit ${U(o.pmax/1e5,"bar")}.`},
        {fig,ctx,q:"Quelle est la profondeur maximale d'utilisation du drone ?",type:"num",ans:o.hmax,tolR:0.02,unit:"m",
          expl:`${F("p = ρ·g·h")}, donc ${F(`h = ${FRAC("p","ρ·g")}`)} = ${FRAC(paf(o.pmax),"1 025 × 9,81")} = ${U(o.hmax,"m")}.`},
        {fig,ctx,q:`La mission impose d'inspecter une épave à ${o.hm} m de profondeur. Le drone convient-il ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.hmax,1)} m ${ok?"≥":"<"} ${o.hm} m : ${ok?"le drone convient.":"le drone ne convient pas ; il faut un hublot plus petit ou plus résistant."}`}]; },
    /* soufflerie : coefficient de traînée et écart avec la valeur annoncée */
    ()=>{ const SY=[{n:"d'un casque de cyclisme profilé",S:[0.06,0.07,0.08],C:[0.3,0.35,0.4]},{n:"d'une maquette de voiture solaire",S:[0.08,0.1,0.12],C:[0.12,0.15,0.18]},{n:"d'un drone quadricoptère",S:[0.03,0.04,0.05],C:[0.9,1,1.1]}];
      const want=Math.random()<0.5, o=draw(()=>{ const s=rnd(SY), S=rnd(s.S), Cr=rnd(s.C), v=rnd([10,12,15,20]), r=(Math.random()*2-1)*0.12, Fm=Number((0.5*RA*S*Cr*(1+r)*v*v).toPrecision(3)), Cm=2*Fm/(RA*S*v*v), e=Math.abs(Cm-Cr)/Cr*100, d=rnd([3,4,5,6]); return {s,S,Cr,v,Fm,Cm,e,d}; },o=>far(o.e,o.d,0.2)&&o.e>=0.5&&(o.e<=o.d)===want);
      const ok=o.e<=o.d, ctx=`Essai en soufflerie ${o.s.n} : à v = ${o.v} m/s, la balance mesure une traînée moyenne Fx = ${nf(o.Fm,3)} N. Surface de référence S = ${nf(o.S,2)} m² ; ρ(air) = 1,2 kg/m³. Le constructeur annonce Cx = ${nf(o.Cr,2)}. Les essais répétés sont dispersés de ± ${o.d} %.`;
      const yes="Les essais ne mettent pas la valeur annoncée en défaut", no="Les essais mettent la valeur annoncée en défaut";
      return [{ctx,q:"Calcule le coefficient de traînée mesuré.",type:"num",ans:o.Cm,tolR:0.02,unit:"",
          expl:`${F(`Cx = ${FRAC("2·Fx","ρ·S·v²")}`)} = ${FRAC(`2 × ${nf(o.Fm,3)}`,`1,2 × ${nf(o.S,2)} × ${o.v}²`)} = ${U(o.Cm,"")}.`},
        {ctx,q:"Calcule l'écart relatif entre le Cx mesuré et la valeur annoncée par le constructeur, prise comme référence.",type:"num",ans:o.e,tolR:0.02,tolA:Math.max(0.15,50*Math.pow(10,Math.floor(Math.log10(o.Cm))-2)/o.Cr),unit:"%",
          expl:`${F(`écart = ${FRAC("|Cx − Cx réf|","Cx réf")} × 100`)} = ${FRAC(`|${nf(o.Cm,4)} − ${nf(o.Cr,2)}|`,nf(o.Cr,2))} × 100 = ${U(o.e,"%")}.`},
        {ctx,q:"Que peux-tu conclure ?",type:"ch",...mc(ok?yes:no,[ok?no:yes,"Les essais prouvent que la valeur annoncée est exacte"]),
          expl:`L'écart (${nf(o.e,1)} %) est ${ok?"inférieur":"supérieur"} à la dispersion des essais (± ${o.d} %) : ${ok?"les essais ne mettent pas la valeur annoncée en défaut, ce qui ne prouve pas pour autant qu'elle est exacte.":"il ne s'explique pas par la dispersion des mesures, la valeur annoncée est mise en défaut (conditions d'essai ou surface de référence différentes, par exemple)."}`}]; },
    /* centrale hydraulique : puissance et choix du moteur */
    ()=>{ const o=draw(()=>{ const p=rnd([100,120,150,160,200]), Q=rnd([10,12,15,20,25,30,40]), eta=rnd([0.8,0.85,0.9]); const Ph=p*1e5*Q/60000, Pe=Ph/eta, i=MOT.findIndex(x=>x*1000>=Pe); return {p,Q,eta,Ph,Pe,i,Pm:i>=1?rnd([MOT[i-1],MOT[i]]):0}; },o=>o.i>=1&&far(o.Pe,o.Pm*1000,0.06));
      const ok=o.Pm*1000>=o.Pe, ctx=`Presse à coprah : la pompe de la centrale hydraulique fournit un débit Q = ${o.Q} L/min sous une pression p = ${o.p} bar. Rendement de la pompe : η = ${nf(o.eta,2)}.`;
      return [{ctx,q:"Calcule la puissance hydraulique fournie par la pompe, P = p·Q.",type:"num",ans:o.Ph/1000,tolR:0.02,unit:"kW",
          expl:`p = ${o.p} × ${p10(5)} Pa et Q = ${FRAC(`${o.Q} × ${p10(-3)}`,"60")} = ${sci(o.Q/60000,2)} m³/s. ${F("P = p·Q")} = ${paf(o.p*1e5)} × ${sci(o.Q/60000,2)} = ${nf(o.Ph,0)} W, soit ${U(o.Ph/1000,"kW")}. C'est la puissance F·v = p·S·v que reçoit la tige du vérin.`},
        {ctx,q:"Quelle puissance mécanique le moteur électrique doit-il fournir à la pompe ?",type:"num",ans:o.Pe/1000,tolR:0.02,unit:"kW",
          expl:`${F(`P<sub>moteur</sub> = ${FRAC("P<sub>hyd</sub>","η")}`)} = ${FRAC(nf(o.Ph/1000,2),nf(o.eta,2))} = ${U(o.Pe/1000,"kW")}.`},
        {ctx,q:`Le moteur prévu a une puissance utile de ${nf(o.Pm,1)} kW. Convient-il ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.Pm,1)} kW ${ok?"≥":"<"} ${nf(o.Pe/1000,2)} kW : ${ok?"le moteur convient.":"le moteur ne convient pas ; il faut le modèle supérieur, ou réduire le débit (la tige ira moins vite)."}`}]; },
    /* charge utile d'un drone à voilure fixe */
    ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const md=rnd([1.5,1.8,2,2.2,2.5]), S=rnd([0.35,0.4,0.45,0.5]), Cz=rnd([0.6,0.7,0.8]), v=rnd([14,15,16,18]), cu=rnd([0.3,0.4,0.5,0.6,0.8,1]); const Fz=0.5*RA*S*Cz*v*v, mt=Fz/g, mu=mt-md; return {md,S,Cz,v,cu,Fz,mt,mu}; },o=>o.mu>0.15&&o.mu<=1.6&&far(o.mu,o.cu,0.08)&&(o.mu>=o.cu)===want);
      const ok=o.mu>=o.cu, fig=fx_flu_aile({}), ctx=`Un drone à voilure fixe de masse à vide ${nf(o.md,1)} kg vole en palier à v = ${o.v} m/s avec un coefficient de portance Cz = ${nf(o.Cz,1)} ; son aile a une surface S = ${nf(o.S,2)} m². ρ(air) = 1,2 kg/m³ ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Quelle portance l'aile fournit-elle dans ces conditions ?",type:"num",ans:o.Fz,tolR:0.02,unit:"N",
          expl:`${F("Fz = ½·ρ·S·Cz·v²")} = 0,5 × 1,2 × ${nf(o.S,2)} × ${nf(o.Cz,1)} × ${o.v}² = ${U(o.Fz,"N")}.`},
        {fig,ctx,q:"Quelle masse totale l'aile peut-elle porter en palier dans ces conditions ?",type:"num",ans:o.mt,tolR:0.02,unit:"kg",
          expl:`En palier, ${F("m·g = Fz")}, donc ${F(`m = ${FRAC("Fz","g")}`)} = ${FRAC(nf(o.Fz,2),"9,81")} = ${U(o.mt,"kg")}.`},
        {fig,ctx,q:`Le client veut emporter une caméra de ${nf(o.cu,1)} kg. Est-ce possible dans ces conditions de vol ?`,type:"ch",ch:YN,ok:ok?0:1,
          expl:`Charge utile possible : ${nf(o.mt,2)} − ${nf(o.md,1)} = ${nf(o.mu,2)} kg ${ok?"≥":"<"} ${nf(o.cu,1)} kg : ${ok?"oui, la caméra peut être emportée.":"non ; il faudrait voler plus vite ou augmenter Cz (incidence)."}`}]; },
    /* décoller face au vent */
    ()=>{ const vd=rnd([60,65,70,75,80]), vw=rnd([10,15,20,25]), vs=vd-vw, r=(vs/vd)**2;
      const ctx=`Un ULM décolle quand sa vitesse par rapport à l'air atteint ${vd} km/h : à cette vitesse, la portance égale son poids. Aujourd'hui, il décolle face à un vent régulier de ${vw} km/h.`;
      return [{ctx,q:"À quelle vitesse par rapport au sol l'ULM décolle-t-il ?",type:"num",ans:vs,tolA:0,unit:"km/h",
          expl:`Face au vent, l'air arrive sur l'aile avec la vitesse sol augmentée de celle du vent : ${F("v<sub>air</sub> = v<sub>sol</sub> + v<sub>vent</sub>")}. Il décolle donc pour v<sub>sol</sub> = ${vd} − ${vw} = ${U(vs,"km/h")}.`},
        {ctx,q:`Sans vent, à cette même vitesse sol de ${vs} km/h, quel pourcentage de son poids la portance équilibrerait-elle ?`,type:"num",ans:r*100,tolR:0.02,unit:"%",
          expl:`${F("Fz = ½·ρ·S·Cz·v²")} : à Cz égal, la portance est proportionnelle au carré de la vitesse par rapport à l'air. (${FRAC(vs,vd)})² = ${nf(r,4)}, soit ${U(r*100,"%")} du poids : l'ULM ne décollerait pas encore.`},
        {ctx,q:"Pourquoi décolle-t-on face au vent ?",type:"ch",...mc("La portance dépend de la vitesse par rapport à l'air : l'ULM décolle à une vitesse sol plus faible",["Le vent de face pousse l'aile vers le haut","Le vent de face augmente la masse volumique de l'air","Le vent de face diminue le poids de l'ULM"]),
          expl:`Seule compte la vitesse de l'air par rapport à l'aile. Face au vent, ${F("la vitesse sol de décollage diminue")} de la vitesse du vent : la course au sol et la distance de décollage sont plus courtes.`}]; }
  ]
};

/* ======================================================================
   FLUIDES EN SCIENCES PHYSIQUES : ARCHIMÈDE, STATIQUE, DÉBIT, BERNOULLI (phy-fluides)
   Archimède, Bernoulli et la conservation du débit ne sont pas au programme : la relation est toujours rappelée dans l'énoncé.
   ====================================================================== */
const ARCH=`poussée d'Archimède Π = ρ<sub>fluide</sub>·V<sub>imm</sub>·g`;
const BERN="relation de Bernoulli (écoulement parfait, incompressible et permanent) : p + ½·ρ·v² + ρ·g·z = constante le long de l'écoulement";
const DEB="conservation du débit : Q = S1·v1 = S2·v2";
const STAT="loi de la statique des fluides : pB − pA = ρ·g·(zA − zB), z vertical vers le haut";
const du=x=>/^[aeiouhé]/i.test(x)?`de l'${x}`:`du ${x}`;

POOLS["phy-fluides"]={
  titre:"Archimède, statique, Bernoulli",
  fiche:{t:"Fluides : Archimède, statique, débit, Bernoulli",l:[
    `Poussée d'Archimède, verticale vers le haut, appliquée au centre de carène : ${F("Π = ρ<sub>fluide</sub>·V<sub>imm</sub>·g")} ; objet qui flotte à l'équilibre : ${F("Π = P = m·g")}.`,
    `Fluide au repos : ${F("pB − pA = ρ·g·(zA − zB)")} (z vers le haut) ; à la profondeur h sous la surface libre : ${F("p = p0 + ρ·g·h")}.`,
    `Fluide incompressible : ${F("Q = S1·v1 = S2·v2")} ; si la section est divisée par 2 : ${F("vitesse multipliée par 2")}.`,
    `Bernoulli (écoulement parfait, incompressible, permanent) : ${F("p + ½·ρ·v² + ρ·g·z = cte")} ; vidange d'un réservoir : ${F("v = √(2·g·h)")}.`,
    `Pièges : ${F("V<sub>imm</sub> ≠ V<sub>total</sub>")} pour un objet qui flotte ; eau de mer : 1 025 kg/m³ ; 1 cm² = ${p10(-4)} m² ; Venturi : ${F("section ↓, vitesse ↑, pression ↓")}.`]},
  count:{1:4,2:4,3:3},
  1:[
    /* poussée d'Archimède sur un objet totalement immergé */
    ()=>{ const s=rnd([["un lest de plongée en plomb",[0.18,0.26,0.35,0.44],"L",RM,"de mer",0],["le corps d'un drone sous-marin",[8,10,12,15],"L",RM,"de mer",0],["une sonde de mesure cylindrique",[0.6,0.8,1.2,1.5],"L",RE,"douce",1],["un bloc de béton d'ancrage de bouée",[0.08,0.1,0.12,0.15],"m³",RM,"de mer",0]]);
      const Vv=rnd(s[1]), Vm=s[2]==="L"?Vv/1000:Vv, Pi=s[3]*Vm*g;
      return {ctx:`${cap(s[0])}, de volume V = ${nf(Vv,2)} ${s[2]}, est totalement immergé${s[5]?"e":""} dans l'eau ${s[4]} (ρ = ${nf(s[3],0)} kg/m³). Données : ${ARCH} ; g = 9,81 m/s².`,
        q:"Calcule la poussée d'Archimède exercée par l'eau.",type:"num",ans:Pi,tolR:0.02,unit:"N",
        expl:`Objet totalement immergé : V<sub>imm</sub> = V = ${s[2]==="L"?`${nf(Vv,2)} L = ${nf(Vm,5)} m³`:`${nf(Vv,2)} m³`}. ${F("Π = ρ·V<sub>imm</sub>·g")} = ${nf(s[3],0)} × ${nf(Vm,5)} × 9,81 = ${U(Pi,"N")}, verticale vers le haut.`}; },
    /* caractéristiques de la poussée d'Archimède */
    ()=>{ const v=rnd([0,1,2]), fig=fx_pf_flot({kind:rnd(["bloc","coque"]),fr:rnd([0.4,0.5,0.6])}), ctx=`Un objet flotte à la surface de l'eau. Donnée : ${ARCH}.`;
      if(v===0) return {fig,ctx,q:"Quelles sont la direction et le sens de la poussée d'Archimède Π ?",type:"ch",...mc("Verticale, vers le haut",["Verticale, vers le bas","Perpendiculaire à la coque, vers l'intérieur","Horizontale, dans le sens du courant"]),
        expl:`La poussée d'Archimède est la résultante des actions de pression de l'eau sur la partie immergée : ${F("verticale, vers le haut")}. Sa valeur est égale au poids du liquide déplacé.`};
      if(v===1) return {fig,ctx,q:"En quel point la poussée d'Archimède s'applique-t-elle ?",type:"ch",...mc("Au centre de carène C, centre du volume immergé",["Au centre de gravité G de l'objet","Au point le plus bas de l'objet","Au centre de la surface de flottaison"]),
        expl:`Π s'applique ${F("au centre de carène C")}, centre géométrique du volume immergé (le volume de liquide déplacé). Il est en général différent du centre de gravité G de l'objet.`};
      return {fig,ctx,q:"De quelles grandeurs dépend la valeur de la poussée d'Archimède ?",type:"ch",...mc("De la masse volumique du fluide et du volume immergé",["De la masse de l'objet et de sa profondeur","Du volume total de l'objet, qu'il soit immergé ou non","De la masse volumique de l'objet seulement"]),
        expl:`${F("Π = ρ<sub>fluide</sub>·V<sub>imm</sub>·g")} : seuls comptent le fluide et le volume de fluide déplacé. Pour un objet totalement immergé, Π ne dépend pas de la profondeur.`}; },
    /* flottaison : Π = P */
    ()=>{ const [s,ms]=rnd([["une bouée de balisage",[35,50,80,120]],["une pirogue (va'a) avec son rameur",[85,90,95,100]],["un kayak chargé",[60,75,90]],["un drone de surface",[12,18,25,30]]]), m=rnd(ms), Pi=m*g;
      return {fig:fx_pf_flot({kind:"coque",fr:0.45}),ctx:`${cap(s)}, de masse totale m = ${m} kg, flotte immobile sur l'eau du lagon. Données : ${ARCH}, verticale vers le haut ; g = 9,81 m/s².`,
        q:"Que vaut la poussée d'Archimède exercée sur cet objet flottant ?",type:"num",ans:Pi,tolR:0.02,unit:"N",
        expl:`À l'équilibre, le poids et la poussée d'Archimède se compensent : ${F("Π = P = m·g")} = ${m} × 9,81 = ${U(Pi,"N")}.`}; },
    /* volume immergé d'un objet qui flotte */
    ()=>{ const [s,ms,w]=rnd([["Une pirogue (va'a) avec son rameur",[85,90,100],"la coque"],["Un paddle avec son utilisateur",[70,80,90],"la planche"],["Une bouée instrumentée",[40,60,80],"la bouée"],["Un radeau de plongée chargé",[250,300,400],"ses flotteurs"]]), m=rnd(ms), Vi=m/RM;
      return {ctx:`${s} (masse totale m = ${m} kg) flotte sur l'eau de mer : ρ = 1 025 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = m·g.`,
        q:`Quel volume de ${w} est immergé, en litres ?`,type:"num",ans:Vi*1000,tolR:0.02,unit:"L",
        expl:`À l'équilibre : ρ·V<sub>imm</sub>·g = m·g, donc ${F(`V<sub>imm</sub> = ${FRAC("m","ρ")}`)} = ${FRAC(m,"1 025")} = ${nf(Vi,4)} m³, soit ${U(Vi*1000,"L")}. g se simplifie.`}; },
    /* différence de pression entre deux profondeurs */
    ()=>{ const zA=rnd([3,4,5,6,8,10]), dz=rnd([5,8,10,12,15,20]), zB=zA+dz, dp=RM*g*dz;
      return {ctx:`Un plongeur descend de ${zA} m (point A) à ${zB} m (point B) de profondeur. Eau de mer au repos : ρ = 1 025 kg/m³ ; g = 9,81 m/s² ; ${STAT}.`,
        q:"De combien la pression a-t-elle augmenté entre A et B, en bar ?",type:"num",ans:dp/1e5,tolR:0.02,unit:"bar",
        expl:`Avec z vers le haut, B est ${dz} m plus bas que A : zA − zB = ${dz} m. ${F("pB − pA = ρ·g·(zA − zB)")} = 1 025 × 9,81 × ${dz} = ${nf(dp,0)} Pa, soit ${U(dp/1e5,"bar")}.`}; },
    /* vases communicants : points à la même pression */
    ()=>{ const v=rnd([0,1,2]), fig=fx_pf_niveaux(), ctx="Un réservoir et un tube transparent sont reliés par le fond et remplis d'eau au repos ; les deux surfaces libres sont à l'air libre.";
      if(v===0) return {fig,ctx,q:"Quel point est à la même pression que le point A ?",type:"ch",...mc("Le point B",["Le point C","Le point D","Aucun : le tube est plus étroit que le réservoir"]),
        expl:`Dans un même liquide au repos et d'un seul tenant, ${F("même altitude, même pression")} : A et B sont sur la même horizontale, ils ont donc la même pression. La largeur des récipients n'intervient pas.`};
      if(v===1) return {fig,ctx,q:"En quel point la pression est-elle la plus grande ?",type:"ch",...mc("Au point C",["Au point A","Au point B","Au point D"]),
        expl:`${F("pB − pA = ρ·g·(zA − zB)")} : la pression augmente quand on descend. C est le point le plus bas, sa pression est la plus grande ; D, le plus haut, a la plus petite.`};
      return {fig,ctx,q:"Pourquoi l'eau est-elle au même niveau dans le réservoir et dans le tube ?",type:"ch",...mc("Les deux surfaces libres sont à la même pression p0, elles sont donc à la même altitude",["Le tube, plus étroit, aspire l'eau","L'eau du réservoir, plus lourde, pousse l'eau du tube plus haut","C'est un hasard du remplissage"]),
        expl:`Les deux surfaces libres sont à la pression atmosphérique p0. Dans un liquide au repos d'un seul tenant, ${F("même pression ⇔ même altitude")} : les niveaux sont égaux, quelle que soit la forme des récipients.`}; },
    /* pression absolue en profondeur */
    ()=>{ const h=rnd([10,15,20,25,30,40]), p=P0*1e5+RM*g*h;
      return {ctx:`Pression atmosphérique à la surface de la mer : p0 = 1,013 bar. Eau de mer : ρ = 1 025 kg/m³ ; g = 9,81 m/s² ; ${STAT}.`,
        q:`Quelle est la pression absolue de l'eau à ${h} m de profondeur, en bar ?`,type:"num",ans:p/1e5,tolR:0.02,unit:"bar",
        expl:`${F("p = p0 + ρ·g·h")} = 1,013 × ${p10(5)} + 1 025 × 9,81 × ${h} = ${nf(p,0)} Pa, soit ${U(p/1e5,"bar")}. On gagne environ 1 bar tous les 10 m : l'air que respire un plongeur à ${h} m est à une pression ${nf(p/1e5/P0,1)} fois plus grande qu'en surface.`}; },
    /* conservation du débit : vitesse dans la section 2 */
    ()=>{ const S2=rnd([4,5,6,8,10]), k=rnd([2,2.5,3,4,5]), S1=S2*k, v1=rnd([0.5,0.8,1,1.2,1.5,2]), v2=v1*k;
      return {fig:fx_pf_conduite({r1:34,r2:Math.max(9,Math.round(34/Math.sqrt(k))),l1:`S1 = ${nf(S1,1)} cm²`,l2:`S2 = ${nf(S2,1)} cm²`,v1:`v1 = ${nf(v1,1)} m/s`,v2:"v2 = ?",k1:40,k2:Math.min(96,40*k)}),
        ctx:`De l'eau circule dans une conduite dont la section passe de S1 = ${nf(S1,1)} cm² à S2 = ${nf(S2,1)} cm². Donnée : ${DEB} (fluide incompressible).`,
        q:"Calcule la vitesse de l'eau dans la section 2.",type:"num",ans:v2,tolR:0.02,unit:"m/s",
        expl:`${F("S1·v1 = S2·v2")}, donc ${F(`v2 = v1·${FRAC("S1","S2")}`)} = ${nf(v1,1)} × ${FRAC(nf(S1,1),nf(S2,1))} = ${U(v2,"m/s")}. Les sections peuvent rester en cm² : seul leur rapport compte.`}; },
    /* débit volumique dans un tuyau */
    ()=>{ const S=rnd([1.5,2,3,5,8]), v=rnd([0.8,1,1.2,1.5,2,2.5]), Q=S*1e-4*v;
      return {ctx:`De l'eau circule à la vitesse moyenne v = ${nf(v,1)} m/s dans un tuyau d'arrosage de section intérieure S = ${nf(S,1)} cm². Donnée : débit volumique Q = S·v.`,
        q:"Calcule le débit volumique, en L/min.",type:"num",ans:Q*60000,tolR:0.02,unit:"L/min",
        expl:`S = ${nf(S,1)} × ${p10(-4)} m². ${F("Q = S·v")} = ${nf(S,1)} × ${p10(-4)} × ${nf(v,1)} = ${sci(Q,2)} m³/s = ${nf(Q*1000,3)} L/s, soit, en une minute : ${U(Q*60000,"L/min")}.`}; },
    /* relation de Bernoulli : hypothèses et termes */
    ()=>{ if(Math.random()<0.5) return {ctx:`${cap(BERN)}.`,q:"Quelles hypothèses sur le fluide et l'écoulement faut-il vérifier pour appliquer cette relation ?",type:"ch",...mc("Fluide parfait (sans frottement) et incompressible, écoulement permanent",["Fluide visqueux et compressible, écoulement variable","Fluide parfait et compressible, écoulement variable","Fluide visqueux et incompressible, écoulement turbulent"]),
        expl:`La relation de Bernoulli suppose un écoulement ${F("parfait, incompressible, permanent")} : pas de frottement (pas de pertes d'énergie), masse volumique constante, vitesses indépendantes du temps.`};
      return {ctx:`${cap(BERN)}.`,q:"Dans cette relation, que représente le terme ½·ρ·v² ?",type:"ch",...mc("Une pression liée à la vitesse du fluide (pression dynamique), en pascals",["Une énergie cinétique, en joules","Une force, en newtons","Une puissance, en watts"]),
        expl:`Chaque terme de la relation est une pression, en Pa : p (pression statique), ${F("½·ρ·v² (pression dynamique)")} et ρ·g·z. ½·ρ·v² est une énergie cinétique par unité de volume : 1 J/m³ = 1 Pa.`}; },
    /* vidange d'un réservoir : v = √(2·g·h) */
    ()=>{ const h=rnd([0.5,0.8,1,1.2,1.5,2,2.5,3]), v=Math.sqrt(2*g*h);
      return {fig:fx_pf_reservoir({hl:`h = ${nf(h,1)} m`}),ctx:`Un réservoir ouvert, de grande section, se vide par un petit orifice B situé à h = ${nf(h,1)} m sous la surface libre A. La relation de Bernoulli entre A et B (écoulement parfait) donne la vitesse de sortie v = √(2·g·h). g = 9,81 m/s².`,
        q:"Calcule la vitesse de l'eau à la sortie de l'orifice.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`${F("v = √(2·g·h)")} = √(2 × 9,81 × ${nf(h,1)}) = ${U(v,"m/s")} : la vitesse qu'aurait une goutte d'eau tombée en chute libre de la hauteur h.`}; },
    /* effet Venturi : vitesse et pression dans le rétrécissement */
    ()=>{ const v=rnd([0,1,2]), fig=fx_pf_venturi({h1:rnd([112,120,128]),h2:rnd([58,66,74])}), ctx=`De l'eau s'écoule de gauche à droite dans un tube de Venturi horizontal ; deux tubes verticaux ouverts indiquent la pression en 1 et en 2. Données : ${DEB} ; ${BERN}.`;
      if(v===0) return {fig,ctx,q:"Dans quelle section la vitesse de l'eau est-elle la plus grande ?",type:"ch",...mc("Dans la section 2, rétrécie",["Dans la section 1, large","Elle est la même dans les deux sections"]),
        expl:`${F("S1·v1 = S2·v2")} avec S2 < S1 : ${F("v2 > v1")}. Le même débit passe par une section plus petite : l'eau doit aller plus vite.`};
      if(v===1) return {fig,ctx,q:"Pourquoi le niveau d'eau est-il plus bas dans le tube 2 ?",type:"ch",...mc("La pression est plus faible en 2, là où l'eau va plus vite",["La pression est plus forte en 2, ce qui chasse l'eau du tube","Le tube 2 est plus étroit que le tube 1","L'eau du tube 2 s'évapore plus vite"]),
        expl:`Tube horizontal : z1 = z2, donc ${F("p1 + ½·ρ·v1² = p2 + ½·ρ·v2²")}. Comme v2 > v1, ${F("p2 < p1")} : c'est l'effet Venturi. La hauteur d'eau dans chaque tube traduit la pression au point de mesure.`};
      return {fig,ctx,q:"Le débit augmente. Comment évolue l'écart de niveau entre les deux tubes ?",type:"ch",...mc("Il augmente",["Il diminue","Il ne change pas"]),
        expl:`p1 − p2 = ½·ρ·(v2² − v1²) : quand le débit augmente, v1 et v2 augmentent dans le même rapport et ${F("l'écart de pression augmente")}, comme le carré du débit. C'est le principe du débitmètre à Venturi.`}; },
    /* flotter ou couler, eau douce ou eau de mer */
    ()=>{ if(Math.random()<0.5) return {ctx:`Un voilier quitte l'eau douce d'un estuaire (ρ = 1 000 kg/m³) pour la mer (ρ = 1 025 kg/m³), sans changer de chargement. Donnée : ${ARCH}.`,
        q:"Comment évolue le volume immergé de sa coque ?",type:"ch",...mc("Il diminue un peu : il faut moins d'eau de mer que d'eau douce pour équilibrer le même poids",["Il augmente, car l'eau de mer est plus lourde","Il ne change pas, car le poids du voilier ne change pas","Le voilier coule, car l'eau de mer est salée"]),
        expl:`À l'équilibre, ${F("ρ·V<sub>imm</sub>·g = m·g")}, donc V<sub>imm</sub> = ${FRAC("m","ρ")} : ρ augmente de 2,5 %, V<sub>imm</sub> diminue d'environ 2,5 %. Le voilier remonte légèrement.`};
      const [nm,r,f]=rnd([["Un bloc de polystyrène expansé",25,0],["Une bille d'acier",7850,1],["Un morceau de chêne sec",700,0],["Un galet de basalte",2900,0],["Un glaçon",917,0],["Une pièce d'aluminium",2700,1]]), fl=r<1000;
      return {ctx:`${nm}, de masse volumique ρ<sub>obj</sub> = ${nf(r,0)} kg/m³, est placé${f?"e":""} au fond d'un bac d'eau douce (ρ = 1 000 kg/m³), puis lâché${f?"e":""}. Donnée : ${ARCH}.`,
        q:"Que se passe-t-il une fois l'objet lâché ?",type:"ch",ch:["L'objet remonte et flotte","L'objet reste au fond"],ok:fl?0:1,
        expl:`Totalement immergé, l'objet subit P = ρ<sub>obj</sub>·V·g et Π = ρ<sub>eau</sub>·V·g. ${F(fl?"ρ<sub>obj</sub> < ρ<sub>eau</sub>, donc Π > P":"ρ<sub>obj</sub> > ρ<sub>eau</sub>, donc P > Π")} : ${fl?"il remonte, puis flotte en partie immergé.":"il reste au fond."}`}; }
  ],
  2:[
    /* objet flottant à faces horizontales : hauteur immergée */
    ()=>{ const [nm,rs,Hs,fl,rf,moy]=rnd([["Un bloc de bois de pin",500,[20,30,40],"eau douce",RE,0],["Un bloc de glace",917,[40,50,60],"eau de mer",RM,0],["Un caisson de ponton",300,[50,60,80],"eau de mer",RM,1],["Une plaque de liège",240,[4,5,6],"eau douce",RE,0]]), H=rnd(Hs), hi=H*rs/rf;
      return {fig:fx_pf_flot({kind:"bloc",fr:rs/rf,hl:`H = ${H} cm`,hil:"hi = ?"}),ctx:`${nm}, de hauteur H = ${H} cm (faces horizontales) et de masse volumique${moy?" moyenne":""} ρs = ${rs} kg/m³, flotte dans l'${fl} (ρ = ${nf(rf,0)} kg/m³). Données : ${ARCH} ; à l'équilibre, Π = P.`,
        q:"Quelle hauteur hi de l'objet est immergée ?",type:"num",ans:hi,tolR:0.02,unit:"cm",
        expl:`Avec S l'aire des faces horizontales : P = ρs·S·H·g et Π = ρ·S·hi·g. Équilibre : ${F("ρ·S·hi·g = ρs·S·H·g")}, donc ${F(`hi = H·${FRAC("ρs","ρ")}`)} = ${H} × ${FRAC(rs,nf(rf,0))} = ${U(hi,"cm")}.`}; },
    /* pirogue : charge maximale */
    ()=>{ const Vm=rnd([150,180,200,250,300]), mp=rnd([15,18,20,25,30]), mx=RM*Vm/1000-mp;
      return {fig:fx_pf_flot({kind:"coque",fr:0.62,forces:false}),ctx:`Une pirogue vide a une masse de ${mp} kg. Le volume de coque qui peut être immergé sans que l'eau n'entre par-dessus bord vaut ${Vm} L. Eau de mer : ρ = 1 025 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = P.`,
        q:"Quelle masse maximale (équipage et chargement) la pirogue peut-elle porter ?",type:"num",ans:mx,tolR:0.02,unit:"kg",
        expl:`Poussée maximale : Π<sub>max</sub> = ρ·V<sub>max</sub>·g. À l'équilibre, (m<sub>pirogue</sub> + m<sub>charge</sub>)·g = ρ·V<sub>max</sub>·g, donc ${F("m<sub>charge</sub> = ρ·V<sub>max</sub> − m<sub>pirogue</sub>")} = 1 025 × ${nf(Vm/1000,3)} − ${mp} = ${U(mx,"kg")}.`}; },
    /* pesée hydrostatique : poussée puis volume */
    ()=>{ const [nm,rr]=rnd([["une pièce en aluminium",2700],["un lest en acier",7850],["une statuette en bronze",8800],["un galet de basalte",2900]]), Vc=rnd([50,80,100,120,150,200,250]);
      const Pr=Number((rr*Vc*1e-6*g).toFixed(2)), Par=Number(((rr-RE)*Vc*1e-6*g).toFixed(2)), Pi=Pr-Par, Vr=Pi/(RE*g);
      const fig=fx_pf_dyn({lab:`${nf(Par,2)} N`}), ctx=`On suspend ${nm} à un dynamomètre : il indique ${nf(Pr,2)} N dans l'air, puis ${nf(Par,2)} N quand l'objet est totalement immergé dans l'eau (ρ = 1 000 kg/m³). Données : ${ARCH} ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Déduis des deux lectures la valeur de la poussée d'Archimède.",type:"num",ans:Pi,tolR:0.02,unit:"N",
          expl:`Dans l'eau, le dynamomètre n'équilibre plus que le poids diminué de la poussée : ${F("Π = P − P<sub>app</sub>")} = ${nf(Pr,2)} − ${nf(Par,2)} = ${U(Pi,"N")}.`},
        {fig,ctx,q:"Déduis-en le volume de l'objet, en cm³.",type:"num",ans:Vr*1e6,tolR:0.02,unit:"cm³",
          expl:`Totalement immergé : V<sub>imm</sub> = V. ${F(`V = ${FRAC("Π","ρ·g")}`)} = ${FRAC(nf(Pi,2),"1 000 × 9,81")} = ${sci(Vr,2)} m³, soit ${U(Vr*1e6,"cm³")}.`}]; },
    /* loi de la statique : pression en B, puis altitude de la surface libre */
    ()=>{ const zA=rnd([1.5,1.8,2,2.2]), zB=rnd([0.2,0.3,0.5]), zS=rnd([2.8,3,3.2,3.5,4,4.5]), pAb=Number(((P0*1e5+RE*g*(zS-zA))/1e5).toFixed(3)), pB=pAb*1e5+RE*g*(zA-zB), zSc=zA+(pAb-P0)*1e5/(RE*g);
      const ctx=`Cuve d'eau au repos (ρ = 1 000 kg/m³), axe z vertical vers le haut, origine au fond. Un capteur placé au point A (zA = ${nf(zA,1)} m) mesure la pression absolue pA = ${nfd(pAb,3)} bar. ${cap(STAT)} ; g = 9,81 m/s².`;
      return [{ctx,q:`Calcule la pression absolue au point B (zB = ${nf(zB,1)} m), en bar.`,type:"num",ans:pB/1e5,tolR:0.02,unit:"bar",
          expl:`${F("pB = pA + ρ·g·(zA − zB)")} = ${nfd(pAb,3)} × ${p10(5)} + 1 000 × 9,81 × (${nf(zA,1)} − ${nf(zB,1)}) = ${nf(pB,0)} Pa, soit ${U(pB/1e5,"bar")}.`},
        {ctx,q:"La surface libre est à l'air libre (p0 = 1,013 bar). À quelle hauteur zS au-dessus du fond se trouve-t-elle ?",type:"num",ans:zSc,tolR:0.02,unit:"m",
          expl:`Entre A et la surface S : p0 − pA = ρ·g·(zA − zS), donc ${F(`zS = zA + ${FRAC("pA − p0","ρ·g")}`)} = ${nf(zA,1)} + ${FRAC(`(${nfd(pAb,3)} − 1,013) × ${p10(5)}`,"1 000 × 9,81")} = ${U(zSc,"m")}.`}]; },
    /* château d'eau : hauteur nécessaire */
    ()=>{ const pr=rnd([1.5,2,2.5,3,3.5,4]), H=pr*1e5/(RE*g);
      return {ctx:`Pour qu'un réseau d'eau fonctionne bien, la pression à un robinet fermé doit dépasser la pression atmosphérique d'au moins ${nf(pr,1)} bar. L'eau vient d'un château d'eau dont la surface libre est à l'air libre. ρ = 1 000 kg/m³ ; g = 9,81 m/s² ; ${STAT}.`,
        q:"De quelle hauteur la surface libre du château d'eau doit-elle au moins dominer le robinet ?",type:"num",ans:H,tolR:0.02,unit:"m",
        expl:`Eau au repos entre la surface libre (p0) et le robinet : ${F("p − p0 = ρ·g·h")}, donc ${F(`h = ${FRAC("p − p0","ρ·g")}`)} = ${FRAC(`${nf(pr,1)} × ${p10(5)}`,"1 000 × 9,81")} = ${U(H,"m")}, soit environ 10 m par bar.`}; },
    /* conservation du débit avec des diamètres */
    ()=>{ const D1=rnd([20,25,32,40,50]), k=rnd([1.5,2,2.5]), D2=Math.round(D1/k), v1=rnd([0.5,0.8,1,1.2,1.5]), v2=v1*(D1/D2)**2;
      return {fig:fx_pf_conduite({r1:34,r2:Math.round(34*D2/D1),l1:`D1 = ${D1} mm`,l2:`D2 = ${D2} mm`,v1:`v1 = ${nf(v1,1)} m/s`,v2:"v2 = ?",k1:40,k2:Math.min(96,40*(D1/D2)**2)}),
        ctx:`Une conduite d'eau passe d'un diamètre intérieur D1 = ${D1} mm à D2 = ${D2} mm. Données : ${DEB}, avec S = ${FRAC("π·D²","4")}.`,
        q:"Calcule la vitesse de l'eau dans la partie de diamètre D2.",type:"num",ans:v2,tolR:0.02,unit:"m/s",
        expl:`${F("S1·v1 = S2·v2")} avec S = ${FRAC("π·D²","4")}, donc ${F(`v2 = v1·(${FRAC("D1","D2")})²`)} = ${nf(v1,1)} × (${FRAC(D1,D2)})² = ${U(v2,"m/s")}. Diamètre divisé par ${nf(D1/D2,2)} : vitesse multipliée par ${nf((D1/D2)**2,2)}.`}; },
    /* débit puis durée de remplissage */
    ()=>{ const D=rnd([16,20,25,32]), v=rnd([1,1.2,1.5,2]), Vc=rnd([1,1.5,2,3,5]), S=disk(D/1000), Q=S*v, t=Vc/Q;
      const ctx=`On remplit une citerne de ${nf(Vc,1)} m³ avec un tuyau de diamètre intérieur D = ${D} mm, où l'eau circule à v = ${nf(v,1)} m/s. Données : débit volumique Q = S·v, avec S = ${FRAC("π·D²","4")}.`;
      return [{ctx,q:"Calcule le débit volumique dans le tuyau, en L/s.",type:"num",ans:Q*1000,tolR:0.02,unit:"L/s",
          expl:`S = ${FRAC(`π × ${mOf(D)}²`,"4")} = ${sci(S,3)} m². ${F("Q = S·v")} = ${sci(S,3)} × ${nf(v,1)} = ${sci(Q,3)} m³/s, soit ${U(Q*1000,"L/s")}.`},
        {ctx,q:"Combien de temps faut-il pour remplir la citerne, en minutes ?",type:"num",ans:t/60,tolR:0.02,unit:"min",
          expl:`${F(`Δt = ${FRAC("V","Q")}`)} = ${FRAC(nf(Vc,1),sci(Q,3))} = ${nf(t,0)} s, soit ${U(t/60,"min")}.`}]; },
    /* vidange : vitesse puis débit à l'orifice */
    ()=>{ const h=rnd([0.8,1,1.2,1.5,2,2.5]), d=rnd([10,15,20,25,30]), v=Math.sqrt(2*g*h), s=disk(d/1000), Q=s*v;
      const fig=fx_pf_reservoir({hl:`h = ${nf(h,1)} m`}), ctx=`Un réservoir ouvert de grande section se vide par un orifice circulaire de diamètre d = ${d} mm, situé à h = ${nf(h,1)} m sous la surface libre. Données : vitesse de sortie v = √(2·g·h) (Bernoulli, écoulement parfait) ; débit Q = s·v, s étant la section de l'orifice ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Quelle est la vitesse de sortie de l'eau ?",type:"num",ans:v,tolR:0.02,unit:"m/s",
          expl:`${F("v = √(2·g·h)")} = √(2 × 9,81 × ${nf(h,1)}) = ${U(v,"m/s")}.`},
        {fig,ctx,q:"Calcule le débit de l'orifice à cet instant, en L/min.",type:"num",ans:Q*60000,tolR:0.02,unit:"L/min",
          expl:`s = ${FRAC(`π × ${mOf(d)}²`,"4")} = ${sci(s,2)} m². ${F("Q = s·v")} = ${sci(s,2)} × ${nf(v,3)} = ${sci(Q,2)} m³/s, soit ${nf(Q*1000,3)} L/s ou ${U(Q*60000,"L/min")}.`}]; },
    /* Bernoulli, conduite horizontale : vitesse puis différence de pression */
    ()=>{ const S2=rnd([4,5,6,8,10]), k=rnd([2,2.5,3,4]), S1=S2*k, v1=rnd([0.5,0.8,1,1.5,2]), v2=v1*k, dp=0.5*RE*(v2*v2-v1*v1);
      const fig=fx_pf_conduite({r1:34,r2:Math.max(9,Math.round(34/Math.sqrt(k))),l1:`S1 = ${nf(S1,1)} cm²`,l2:`S2 = ${nf(S2,1)} cm²`,v1:`v1 = ${nf(v1,1)} m/s`,v2:"v2",k1:40,k2:Math.min(96,40*k)}), ctx=`De l'eau (ρ = 1 000 kg/m³) circule dans une conduite horizontale dont la section passe de S1 = ${nf(S1,1)} cm² à S2 = ${nf(S2,1)} cm². Données : ${DEB} ; ${BERN}.`;
      return [{fig,ctx,q:"Calcule la vitesse v2 de l'eau dans la section 2.",type:"num",ans:v2,tolR:0.02,unit:"m/s",
          expl:`${F(`v2 = v1·${FRAC("S1","S2")}`)} = ${nf(v1,1)} × ${FRAC(nf(S1,1),nf(S2,1))} = ${U(v2,"m/s")}.`},
        {fig,ctx,q:"Calcule la différence de pression p1 − p2, en kPa.",type:"num",ans:dp/1000,tolR:0.02,unit:"kPa",
          expl:`Conduite horizontale : z1 = z2, donc p1 + ½·ρ·v1² = p2 + ½·ρ·v2² et ${F("p1 − p2 = ½·ρ·(v2² − v1²)")} = 0,5 × 1 000 × (${nf(v2,2)}² − ${nf(v1,1)}²) = ${nf(dp,0)} Pa, soit ${U(dp/1000,"kPa")}. La pression est plus faible là où l'eau va plus vite.`}]; },
    /* Bernoulli : conduite qui monte, section constante */
    ()=>{ const p1=rnd([2.5,3,3.5,4]), dz=rnd([4,6,8,10,12,15]), p2=p1*1e5-RE*g*dz;
      return {ctx:`Une canalisation de section constante monte l'eau (ρ = 1 000 kg/m³) du rez-de-chaussée (point 1) au dernier étage (point 2), ${dz} m plus haut. Au point 1, la pression absolue vaut p1 = ${nf(p1,1)} bar. On suppose l'écoulement parfait. Données : ${DEB} ; ${BERN} ; g = 9,81 m/s².`,
        q:"Calcule la pression absolue p2 au dernier étage, en bar.",type:"num",ans:p2/1e5,tolR:0.02,unit:"bar",
        expl:`Section constante : ${F("v1 = v2")} (conservation du débit), les termes ½·ρ·v² se simplifient. ${F("p2 = p1 − ρ·g·(z2 − z1)")} = ${nf(p1,1)} × ${p10(5)} − 1 000 × 9,81 × ${dz} = ${nf(p2,0)} Pa, soit ${U(p2/1e5,"bar")}.`}; },
    /* ballon gonflé à l'hélium : poussée d'Archimède de l'air */
    ()=>{ const Vb=rnd([2,3,4,5,6,8]), me=rnd([0.3,0.4,0.5,0.8,1]), mHe=0.17*Vb, Pi=RA*Vb*g, mx=RA*Vb-mHe-me;
      const ctx=`Un ballon publicitaire contient V = ${Vb} m³ d'hélium (ρ = 0,17 kg/m³) ; son enveloppe a une masse de ${nf(me,1)} kg et un volume négligeable. Air : ρ = 1,2 kg/m³. Données : ${ARCH} ; g = 9,81 m/s².`;
      return [{ctx,q:"Calcule la poussée d'Archimède exercée par l'air sur le ballon.",type:"num",ans:Pi,tolR:0.02,unit:"N",
          expl:`Le fluide est ici l'air : ${F("Π = ρ<sub>air</sub>·V·g")} = 1,2 × ${Vb} × 9,81 = ${U(Pi,"N")}.`},
        {ctx,q:"Quelle masse de charge (nacelle, câble…) le ballon peut-il soulever au maximum ?",type:"num",ans:mx,tolR:0.02,unit:"kg",
          expl:`Il faut Π ≥ (m<sub>He</sub> + m<sub>env</sub> + m<sub>charge</sub>)·g, avec m<sub>He</sub> = 0,17 × ${Vb} = ${nf(mHe,2)} kg. ${F("m<sub>charge</sub> = ρ<sub>air</sub>·V − m<sub>He</sub> − m<sub>env</sub>")} = 1,2 × ${Vb} − ${nf(mHe,2)} − ${nf(me,1)} = ${U(mx,"kg")}.`}]; },
    /* barge : enfoncement dû au chargement */
    ()=>{ const Lb=rnd([6,8,10,12]), lb=rnd([2.5,3,4]), dm=rnd([500,800,1000,1500,2000,3000]), Sf=Lb*lb, dV=dm/RM, dh=dV/Sf;
      const fig=fx_pf_flot({kind:"bloc",fr:0.45,hil:"tirant d'eau",forces:false,alt:"Barge à fond plat et à flancs verticaux, vue en coupe"}), ctx=`Une barge à fond plat et à flancs verticaux a une surface de flottaison S = ${Lb} m × ${nf(lb,1)} m. On y charge ${nf(dm,0)} kg de matériel. Eau de mer : ρ = 1 025 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = P.`;
      return [{fig,ctx,q:"Quel volume d'eau supplémentaire la barge déplace-t-elle après le chargement ?",type:"num",ans:dV,tolR:0.02,unit:"m³",
          expl:`La poussée doit augmenter du poids ajouté : ρ·ΔV·g = Δm·g, donc ${F(`ΔV = ${FRAC("Δm","ρ")}`)} = ${FRAC(nf(dm,0),"1 025")} = ${U(dV,"m³")}.`},
        {fig,ctx,q:"De combien la barge s'enfonce-t-elle, en cm ?",type:"num",ans:dh*100,tolR:0.02,unit:"cm",
          expl:`Flancs verticaux : ΔV = S·Δh, donc ${F(`Δh = ${FRAC("ΔV","S")}`)} = ${FRAC(nf(dV,4),nf(Sf,1))} = ${nf(dh,4)} m, soit ${U(dh*100,"cm")}.`}]; },
    /* tube de Venturi : différence de pression lue sur les tubes */
    ()=>{ const dh=rnd([8,10,12,15,18,20,25]), dp=RE*g*dh/100;
      return {fig:fx_pf_venturi({h1:128,h2:128-Math.round(dh*2.2),dh:"Δh"}),ctx:`De l'eau (ρ = 1 000 kg/m³) traverse un tube de Venturi horizontal. Dans les deux tubes verticaux ouverts, l'eau est au repos. ${cap(STAT)} ; g = 9,81 m/s².`,
        q:`L'écart de niveau entre les tubes 1 et 2 vaut Δh = ${dh} cm. Calcule la différence de pression p1 − p2 entre les deux points de mesure, en Pa.`,type:"num",ans:dp,tolR:0.02,unit:"Pa",
        expl:`Dans chaque tube, l'eau est au repos : la pression au point de mesure vaut p0 + ρ·g × (hauteur d'eau au-dessus). Les niveaux diffèrent de Δh, donc ${F("p1 − p2 = ρ·g·Δh")} = 1 000 × 9,81 × ${nf(dh/100,2)} = ${U(dp,"Pa")}.`}; }
  ],
  3:[
    /* robot sous-marin : lest pour un équilibre entre deux eaux, puis essai en eau douce */
    ()=>{ const o=draw(()=>{ const Vd=rnd([8,10,12,15,20]), m0=rnd([0.25,0.3,0.4,0.5,0.6,0.8,1,1.2]); const md=Number((RM*Vd/1000-m0).toFixed(2)); return {Vd,md,mL:RM*Vd/1000-md}; },o=>o.mL>0.1);
      const Pi=RM*o.Vd/1000*g, P=o.md*g, fig=fx_pf_stab({}), ctx=`Un robot sous-marin filoguidé, qui inspecte les lignes d'une ferme perlière, a un volume extérieur V = ${o.Vd} L et une masse m = ${nf(o.md,2)} kg. Il doit rester immobile entre deux eaux, propulseurs à l'arrêt. Eau du lagon : ρ = 1 025 kg/m³. Données : ${ARCH} ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Calcule la poussée d'Archimède sur le robot totalement immergé, puis compare-la à son poids.",type:"num",ans:Pi,tolR:0.02,unit:"N",
          expl:`${F("Π = ρ·V·g")} = 1 025 × ${nf(o.Vd/1000,3)} × 9,81 = ${U(Pi,"N")}. Poids : P = m·g = ${nf(o.md,2)} × 9,81 = ${nf(P,1)} N < Π : sans lest, le robot remonte.`},
        {fig,ctx,q:"Quelle masse de lest faut-il ajouter pour que le robot reste en équilibre (volume du lest négligé) ?",type:"num",ans:o.mL,tolR:0.02,unit:"kg",
          expl:`Équilibre : ${F("(m + m<sub>lest</sub>)·g = ρ·V·g")}, donc m<sub>lest</sub> = ρ·V − m = 1 025 × ${nf(o.Vd/1000,3)} − ${nf(o.md,2)} = ${U(o.mL,"kg")}.`},
        {fig,ctx,q:"Ainsi lesté, le robot est essayé dans un bassin d'eau douce (ρ = 1 000 kg/m³). Que se passe-t-il, propulseurs à l'arrêt ?",type:"ch",...mc("Il coule lentement : la poussée d'Archimède est plus faible que son poids",["Il remonte : la poussée d'Archimède est plus grande que son poids","Il reste en équilibre : sa masse n'a pas changé","Il reste en équilibre : son volume n'a pas changé"]),
          expl:`Le poids n'a pas changé, mais ${F("Π = ρ·V·g")} diminue de 2,5 % avec ρ = 1 000 kg/m³ : Π < P, le robot coule. Pour l'essai en eau douce, il faut retirer environ ${nf(0.025*o.Vd,2)} kg de lest.`}]; },
    /* bouée instrumentée : volume immergé, choix du flotteur */
    ()=>{ const CATV=[40,60,80,100,120,150,200,250,300];
      const o=draw(()=>{ const m=rnd([30,40,50,60,80,100,120,150]), fr=rnd([0.5,0.6,0.7]); const Vi=m/RM*1000, Vmin=Vi/fr, i=CATV.findIndex(x=>x>=Vmin); return {m,fr,Vi,Vmin,i}; },o=>o.i>=1&&CATV[o.i]>=1.03*o.Vmin&&CATV[o.i-1]<=o.Vmin/1.03);
      const lo=Math.max(0,o.i-3), hi=Math.min(o.i-1,CATV.length-4), s0=lo+Math.floor(Math.random()*(hi-lo+1)), opts=[0,1,2,3].map(k=>s0+k);
      const ctx=`Une bouée instrumentée (station de mesure du lagon) a une masse totale m = ${o.m} kg ; seul son flotteur est dans l'eau. Exigence : au plus ${nf(o.fr*100,0)} % du volume du flotteur doit être immergé, pour garder une réserve de flottabilité dans la houle. Eau de mer : ρ = 1 025 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = P.`;
      return [{ctx,q:"Quel volume du flotteur est immergé à l'équilibre, en L ?",type:"num",ans:o.Vi,tolR:0.02,unit:"L",
          expl:`${F("ρ·V<sub>imm</sub>·g = m·g")}, donc ${F(`V<sub>imm</sub> = ${FRAC("m","ρ")}`)} = ${FRAC(o.m,"1 025")} = ${nf(o.Vi/1000,4)} m³, soit ${U(o.Vi,"L")}.`},
        {ctx,q:"Quel est le plus petit flotteur proposé qui respecte l'exigence ?",type:"ch",ch:opts.map(k=>`Flotteur de ${CATV[k]} L`),ok:opts.indexOf(o.i),
          expl:`Il faut ${F(`V<sub>imm</sub> ≤ ${nf(o.fr,1)} × V<sub>flotteur</sub>`)}, soit V<sub>flotteur</sub> ≥ ${FRAC(nf(o.Vi,1),nf(o.fr,1))} = ${nf(o.Vmin,1)} L. Le flotteur de ${CATV[o.i-1]} L est trop petit ; celui de ${CATV[o.i]} L convient.`}]; },
    /* radeau de bidons : masse maximale, nombre de passagers */
    ()=>{ const o=draw(()=>{ const n=rnd([4,6,8]), Vb=rnd([120,200,220]), mb=rnd([8,10,12]), Mp=rnd([80,100,120,150]); const Vmax=n*Vb/2/1000, Mmax=RM*Vmax, N=(Mmax-n*mb-Mp)/80; return {n,Vb,mb,Mp,Vmax,Mmax,N}; },o=>{ const fr=o.N-Math.floor(o.N); return o.N>=1.2&&o.N<=12&&fr>0.1&&fr<0.9; });
      const Nf=Math.floor(o.N), dispo=o.Mmax-o.n*o.mb-o.Mp, ctx=`Un radeau est formé d'une plateforme de ${o.Mp} kg posée sur ${o.n} bidons étanches de ${o.Vb} L (${o.mb} kg chacun) ; seuls les bidons sont dans l'eau. Par sécurité, chaque bidon doit rester immergé au plus à moitié. Chaque passager a une masse de 80 kg. Eau de mer : ρ = 1 025 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = P.`;
      return [{ctx,q:"Quelle masse totale, radeau compris, le radeau peut-il porter au maximum en respectant cette règle ?",type:"num",ans:o.Mmax,tolR:0.02,unit:"kg",
          expl:`Volume immergé maximal : ${o.n} × ${FRAC(o.Vb,"2")} = ${nf(o.Vmax*1000,0)} L = ${nf(o.Vmax,3)} m³. Équilibre : ${F("m·g = ρ·V<sub>imm</sub>·g")}, donc m<sub>max</sub> = 1 025 × ${nf(o.Vmax,3)} = ${U(o.Mmax,"kg")}.`},
        {ctx,q:"Combien de passagers le radeau peut-il embarquer au maximum ?",type:"num",ans:Nf,tolA:0,unit:"passagers",
          expl:`Masse disponible : ${nf(o.Mmax,1)} − ${o.n} × ${o.mb} − ${o.Mp} = ${nf(dispo,1)} kg ; ${FRAC(nf(dispo,1),"80")} = ${nf(o.N,2)}, on arrondit à l'entier inférieur : ${U(Nf,Nf>1?"passagers":"passager")}.`}]; },
    /* débitmètre à Venturi */
    ()=>{ const S2=rnd([5,8,10,12]), k=rnd([2,2.5,3,4]), S1=S2*k, dh=rnd([10,15,20,25,30,40]), v1=Math.sqrt(2*g*dh/100/(k*k-1)), Q=S1*1e-4*v1;
      const fig=fx_pf_venturi({h1:130,h2:130-Math.min(70,dh*2),dh:"Δh"}), ctx=`Débitmètre à Venturi horizontal : section d'entrée S1 = ${nf(S1,1)} cm², col S2 = ${nf(S2,1)} cm². L'écart de niveau entre les tubes 1 et 2 vaut Δh = ${dh} cm ; l'eau étant au repos dans les tubes, p1 − p2 = ρ·g·Δh. Eau : ρ = 1 000 kg/m³ ; g = 9,81 m/s². Données : ${DEB} ; ${BERN}.`;
      return [{fig,ctx,q:"Calcule la vitesse v1 de l'eau dans la section d'entrée.",type:"num",ans:v1,tolR:0.02,unit:"m/s",
          expl:`Conservation du débit : v2 = v1·${FRAC("S1","S2")} = ${nf(k,1)}·v1. Bernoulli avec z1 = z2 : p1 − p2 = ½·ρ·(v2² − v1²) = ½·ρ·v1²·(${nf(k,1)}² − 1). Avec p1 − p2 = ρ·g·Δh : ${F(`v1 = √(${FRAC("2·g·Δh",`${nf(k,1)}² − 1`)})`)} = √(${FRAC(`2 × 9,81 × ${nf(dh/100,2)}`,nf(k*k-1,2))}) = ${U(v1,"m/s")}.`},
        {fig,ctx,q:"Déduis-en le débit volumique, en L/s.",type:"num",ans:Q*1000,tolR:0.02,unit:"L/s",
          expl:`${F("Q = S1·v1")} = ${nf(S1,1)} × ${p10(-4)} × ${nf(v1,3)} = ${sci(Q,2)} m³/s, soit ${U(Q*1000,"L/s")}.`}]; },
    /* vidange : le débit diminue avec la hauteur d'eau */
    ()=>{ const h=rnd([1,1.6,2,2.5,3.2,4]), d=rnd([15,20,25]), k=rnd([4,9]), v=Math.sqrt(2*g*h), s=disk(d/1000), Q=s*v;
      const fig=fx_pf_reservoir({hl:`h = ${nf(h,1)} m`}), ctx=`Un réservoir ouvert de grande section se vide par un orifice de diamètre d = ${d} mm, situé à h = ${nf(h,1)} m sous la surface libre. Données : vitesse de sortie v = √(2·g·h) (Bernoulli, écoulement parfait) ; débit Q = s·v, s étant la section de l'orifice ; g = 9,81 m/s².`;
      return [{fig,ctx,q:"Calcule le débit de vidange au début, en L/s.",type:"num",ans:Q*1000,tolR:0.02,unit:"L/s",
          expl:`v = √(2 × 9,81 × ${nf(h,1)}) = ${nf(v,3)} m/s ; s = ${FRAC(`π × ${mOf(d)}²`,"4")} = ${sci(s,2)} m². ${F("Q = s·v")} = ${sci(Q,2)} m³/s, soit ${U(Q*1000,"L/s")}.`},
        {fig,ctx,q:`Plus tard, la hauteur d'eau au-dessus de l'orifice a été divisée par ${k}. Par combien le débit a-t-il été divisé ?`,type:"num",ans:Math.sqrt(k),tolA:0,unit:"",
          expl:`${F("Q = s·√(2·g·h)")} est proportionnel à √h : hauteur divisée par ${k}, débit divisé par ${F(`√${k} = ${Math.sqrt(k)}`)}.`},
        {fig,ctx,q:"Pourquoi la vidange complète dure-t-elle plus longtemps que le volume initial divisé par le débit du début ?",type:"ch",...mc("Le débit diminue au fur et à mesure que la hauteur d'eau baisse",["Le débit augmente quand le réservoir se vide","L'orifice se bouche progressivement","La pression atmosphérique freine l'eau qui sort"]),
          expl:`La vitesse de sortie ${F("v = √(2·g·h)")} diminue avec la hauteur d'eau : le débit baisse sans cesse, jusqu'à s'annuler. La durée réelle est donc plus longue que ${FRAC("V","Q<sub>début</sub>")} (le double, pour un réservoir à parois verticales).`}]; },
    /* château d'eau et immeuble : exigence de pression au robinet le plus haut */
    ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const zc=rnd([30,35,40,45,50]), ne=rnd([4,5,6,7,8,10]), pmin=rnd([1,1.5,2]); const zr=3*ne+1, pr=RE*g*(zc-zr)/1e5; return {zc,ne,pmin,zr,pr}; },o=>o.zc>o.zr+3&&far(o.pr,o.pmin,0.08)&&(o.pr>=o.pmin)===want);
      const ok=o.pr>=o.pmin, ctx=`La surface libre de l'eau d'un château d'eau est à ${o.zc} m au-dessus de la rue. Dans un immeuble voisin, le robinet le plus haut, au ${o.ne}e étage, est à ${o.zr} m au-dessus de la rue. Exigence : pression relative d'au moins ${nf(o.pmin,1)} bar à ce robinet, fermé. ρ = 1 000 kg/m³ ; g = 9,81 m/s² ; ${STAT}.`;
      return [{ctx,q:"Calcule la pression relative au robinet le plus haut, robinet fermé, en bar.",type:"num",ans:o.pr,tolR:0.02,unit:"bar",
          expl:`Robinet fermé, l'eau est au repos entre la surface libre (pression p0) et le robinet : ${F("p − p0 = ρ·g·(z<sub>surface</sub> − z<sub>robinet</sub>)")} = 1 000 × 9,81 × (${o.zc} − ${o.zr}) = ${nf(o.pr*1e5,0)} Pa, soit ${U(o.pr,"bar")}.`},
        {ctx,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.pr,2)} bar ${ok?"≥":"<"} ${nf(o.pmin,1)} bar : ${ok?"l'exigence est satisfaite.":`l'exigence n'est pas satisfaite ; il faudrait un surpresseur, ou une surface libre au moins ${nf(o.zr+o.pmin*1e5/(RE*g),1)} m au-dessus de la rue.`}`},
        {ctx:`${ctx} Donnée : ${BERN}.`,q:"On ouvre ce robinet. La pression dans la canalisation, juste en amont du robinet, devient-elle plus grande, égale ou plus petite qu'à robinet fermé ?",type:"ch",...mc("Plus petite : une partie de l'énergie sert à mettre l'eau en mouvement et à vaincre les frottements",["Plus grande : l'eau en mouvement pousse plus fort","Égale : la pression ne dépend que de la hauteur d'eau"]),
          expl:`Relation de Bernoulli : ${F("p + ½·ρ·v² + ρ·g·z = cte")} ; à altitude égale, quand v augmente, p diminue. En réalité, les frottements dans les canalisations (le fluide n'est pas parfait) font encore baisser la pression.`}]; },
    /* repérer l'erreur d'un élève */
    ()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
      if(v===0){ const a=rnd([20,25,30]), rb=rnd([500,600,700]), Vc=(a/100)**3;
        ctx=`Poussée d'Archimède sur un cube de bois d'arête ${a} cm (ρ = ${rb} kg/m³) qui flotte sur l'eau douce (ρ = 1 000 kg/m³) ; ${ARCH}.`;
        st=[`V = ${nf(a/100,2)}³ = ${nf(Vc,4)} m³`,`Π = ρ<sub>eau</sub>·V·g = 1 000 × ${nf(Vc,4)} × 9,81 = ${nf(RE*Vc*g,1)} N`,`Le cube flotte : son poids vaut donc ${nf(RE*Vc*g,1)} N.`]; bad=1;
        why=`Le cube flotte : il n'est que partiellement immergé, V<sub>imm</sub> < V. À l'équilibre, Π = P = ρ<sub>bois</sub>·V·g = ${rb} × ${nf(Vc,4)} × 9,81 = ${nf(rb*Vc*g,1)} N.`; }
      else if(v===1){ const D1=rnd([40,50]), D2=rnd([20,25]), v1=rnd([1,1.5,2]);
        ctx=`Vitesse de l'eau dans une conduite qui passe de D1 = ${D1} mm à D2 = ${D2} mm, avec v1 = ${nf(v1,1)} m/s ; ${DEB}.`;
        st=["S1·v1 = S2·v2",`v2 = v1·${FRAC("D1","D2")} = ${nf(v1,1)} × ${FRAC(D1,D2)}`,`v2 = ${nf(v1*D1/D2,2)} m/s`]; bad=1;
        why=`Les sections sont proportionnelles au carré des diamètres : v2 = v1·(${FRAC("D1","D2")})² = ${nf(v1,1)} × (${FRAC(D1,D2)})² = ${nf(v1*(D1/D2)**2,2)} m/s.`; }
      else if(v===2){ const H=rnd([2,2.5,3]), ho=rnd([0.4,0.5,0.6]);
        ctx=`Vitesse de sortie de l'eau par un orifice percé à ${nf(ho,1)} m au-dessus du fond d'un réservoir ouvert, rempli sur ${nf(H,1)} m de hauteur. Donnée : v = √(2·g·h), h étant la hauteur d'eau au-dessus de l'orifice ; g = 9,81 m/s².`;
        st=[`h = ${nf(H,1)} m`,`v = √(2 × 9,81 × ${nf(H,1)})`,`v = ${nf(Math.sqrt(2*g*H),2)} m/s`]; bad=0;
        why=`h se mesure entre la surface libre et l'orifice : h = ${nf(H,1)} − ${nf(ho,1)} = ${nf(H-ho,1)} m, d'où v = ${nf(Math.sqrt(2*g*(H-ho)),2)} m/s.`; }
      else if(v===3){ const h=rnd([20,30,40]), pr=RM*g*h/1e5;
        ctx=`Pression absolue à ${h} m de profondeur dans la mer (p0 = 1,013 bar ; ρ = 1 025 kg/m³ ; g = 9,81 m/s²).`;
        st=["La loi de la statique donne p − p0 = ρ·g·h.",`ρ·g·h = 1 025 × 9,81 × ${h} = ${nf(pr*1e5,0)} Pa, soit ${nf(pr,2)} bar.`,`La pression absolue vaut donc p = ${nf(pr,2)} bar.`]; bad=2;
        why=`ρ·g·h est l'écart avec la pression atmosphérique : p = p0 + ρ·g·h = 1,013 + ${nf(pr,2)} = ${nf(P0+pr,2)} bar.`; }
      else if(v===4){ const Vl=rnd([8,12,15]);
        ctx=`Poussée d'Archimède sur un drone sous-marin de ${Vl} L totalement immergé (eau de mer : ρ = 1 025 kg/m³ ; ${ARCH} ; g = 9,81 m/s²).`;
        st=[`V<sub>imm</sub> = ${Vl} L = ${nf(Vl/1000,3)} m³`,`Π = ρ·V<sub>imm</sub> = 1 025 × ${nf(Vl/1000,3)} = ${nf(RM*Vl/1000,2)}`,`Π = ${nf(RM*Vl/1000,2)} N`]; bad=1;
        why=`Il manque g : ρ·V<sub>imm</sub> est la masse d'eau déplacée (${nf(RM*Vl/1000,2)} kg). Π = ρ·V<sub>imm</sub>·g = ${nf(RM*Vl/1000*g,1)} N.`; }
      else { const S=rnd([2,4,5]), vv=rnd([1.5,2]);
        ctx=`Débit dans un tuyau de section S = ${S} cm² où l'eau circule à ${nf(vv,1)} m/s (Q = S·v).`;
        st=[`S = ${S} cm² = ${nf(S/100,2)} m²`,`Q = S·v = ${nf(S/100,2)} × ${nf(vv,1)} = ${nf(S/100*vv,2)} m³/s`,`Q = ${nf(S/100*vv*1000,0)} L/s`]; bad=0;
        why=`1 cm² = ${p10(-4)} m² : S = ${S} × ${p10(-4)} m², d'où Q = ${sci(S*1e-4*vv,1)} m³/s, soit ${nf(S*1e-4*vv*1000,2)} L/s.`; }
      return {ctx,data:OL(st),q:"Un élève a rédigé ce calcul. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
    /* pesée hydrostatique : masse volumique et identification du métal */
    ()=>{ const MAT=[["aluminium",2700],["titane",4500],["acier",7850],["cuivre",8960],["plomb",11350]];
      const o=draw(()=>{ const k=Math.floor(Math.random()*MAT.length), Vc=rnd([50,80,100,120,150]), rt=MAT[k][1]*(1+(Math.random()*2-1)*0.015);
          const P=Number((rt*Vc*1e-6*g).toFixed(2)), Pa=Number(((rt-RE)*Vc*1e-6*g).toFixed(2)), Pi=P-Pa, Vm=Pi/(RE*g), rho=P/g/Vm, near=MAT.map(x=>Math.abs(x[1]-rho)/x[1]);
          return {k,P,Pa,Pi,Vm,rho,near}; },o=>o.Pi>0.3&&o.near[o.k]<=0.03&&o.near.every((x,j)=>j===o.k||x>=0.08));
      const [nm,rr]=MAT[o.k], data=table(["Métal","ρ (kg/m³)"],MAT.map(x=>[cap(x[0]),nf(x[1],0)]));
      const fig=fx_pf_dyn({lab:`${nf(o.Pa,2)} N`}), ctx=`Pour identifier le métal d'une pièce, on la suspend à un dynamomètre : il indique ${nf(o.P,2)} N dans l'air, puis ${nf(o.Pa,2)} N quand la pièce est totalement immergée dans l'eau (ρ = 1 000 kg/m³). Données : ${ARCH} ; g = 9,81 m/s².`;
      return [{fig,ctx,data,q:"Calcule le volume de la pièce, en cm³.",type:"num",ans:o.Vm*1e6,tolR:0.02,unit:"cm³",
          expl:`${F("Π = P − P<sub>app</sub>")} = ${nf(o.P,2)} − ${nf(o.Pa,2)} = ${nf(o.Pi,2)} N. Pièce totalement immergée : ${F(`V = ${FRAC("Π","ρ<sub>eau</sub>·g")}`)} = ${FRAC(nf(o.Pi,2),"1 000 × 9,81")} = ${sci(o.Vm,2)} m³, soit ${U(o.Vm*1e6,"cm³")}.`},
        {fig,ctx,data,q:"Calcule la masse volumique du métal.",type:"num",ans:o.rho,tolR:0.02,unit:"kg/m³",
          expl:`m = ${FRAC("P","g")} = ${FRAC(nf(o.P,2),"9,81")} = ${nf(o.P/g,4)} kg. ${F(`ρ = ${FRAC("m","V")}`)} = ${FRAC(nf(o.P/g,4),sci(o.Vm,2))} = ${U(o.rho,"kg/m³")}. On peut aussi écrire ρ = ρ<sub>eau</sub>·${FRAC("P","Π")}.`},
        {fig,ctx,data,q:"De quel métal s'agit-il probablement ?",type:"ch",ch:MAT.map(x=>cap(x[0])),ok:o.k,
          expl:`La valeur la plus proche est celle ${du(nm)} : écart relatif ${FRAC(`|${nf(o.rho,0)} − ${nf(rr,0)}|`,nf(rr,0))} × 100 = ${nf(o.near[o.k]*100,1)} %, la référence étant la valeur du tableau. Les autres métaux s'écartent de plus de 8 %.`}]; },
    /* vidange à débit constant : vitesse mesurée et modèle du fluide parfait */
    ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const h=rnd([0.5,0.6,0.8,1,1.2]), d=rnd([8,10,12]), Cd=rnd([0.9,0.92,0.94,0.96,0.985,0.99]), t=rnd([20,30,40,60]), dp=rnd([2,3]);
          const vt=Math.sqrt(2*g*h), s=disk(d/1000), Vol=Number((Cd*s*vt*t*1000).toFixed(2)), vm=Vol/1000/t/s, e=Math.abs(vt-vm)/vm*100; return {h,d,t,dp,vt,s,Vol,vm,e}; },o=>far(o.e,o.dp,0.25)&&(o.e<=o.dp)===want);
      const ok=o.e<=o.dp, fig=fx_pf_reservoir({hl:`h = ${nf(o.h,1)} m`}), ctx=`Un réservoir est maintenu plein : l'eau reste à h = ${nf(o.h,1)} m au-dessus d'un ajutage de sortie de diamètre d = ${o.d} mm. On recueille ${nf(o.Vol,2)} L d'eau en ${o.t} s. Modèle du fluide parfait (Bernoulli) : v = √(2·g·h) ; débit Q = s·v ; g = 9,81 m/s². Les mesures répétées sont dispersées de ± ${o.dp} %.`;
      const yes="Les essais ne mettent pas le modèle en défaut", no="Le modèle surestime la vitesse : l'hypothèse du fluide parfait est mise en défaut";
      return [{fig,ctx,q:"Calcule la vitesse moyenne mesurée de l'eau à la sortie de l'ajutage.",type:"num",ans:o.vm,tolR:0.02,unit:"m/s",
          expl:`Q = ${FRAC(`${nf(o.Vol,2)} × ${p10(-3)}`,o.t)} = ${sci(o.Vol/1000/o.t,3)} m³/s ; s = ${FRAC(`π × ${mOf(o.d)}²`,"4")} = ${sci(o.s,3)} m². ${F(`v = ${FRAC("Q","s")}`)} = ${U(o.vm,"m/s")}.`},
        {fig,ctx,q:"Calcule l'écart relatif entre la vitesse du modèle et la vitesse mesurée, prise comme référence.",type:"num",ans:o.e,tolR:0.03,tolA:Math.max(0.2,50*(Math.pow(10,Math.floor(Math.log10(o.vt))-2)+Math.pow(10,Math.floor(Math.log10(o.vm))-2))/o.vm),unit:"%",
          expl:`Modèle : ${F("v = √(2·g·h)")} = √(2 × 9,81 × ${nf(o.h,1)}) = ${nf(o.vt,3)} m/s. ${F(`écart = ${FRAC("|v<sub>mod</sub> − v<sub>mes</sub>|","v<sub>mes</sub>")} × 100`)} = ${FRAC(`|${nf(o.vt,3)} − ${nf(o.vm,3)}|`,nf(o.vm,3))} × 100 = ${U(o.e,"%")}.`},
        {fig,ctx,q:"Que peux-tu conclure sur le modèle ?",type:"ch",...mc(ok?yes:no,[ok?no:yes,"Le modèle est exact"]),
          expl:ok?`${F("écart < dispersion")} : ${nf(o.e,2)} % contre ± ${o.dp} %. Les essais ne mettent pas le modèle en défaut, ce qui ne prouve pas qu'il est exact.`:`${F("écart > dispersion")} : ${nf(o.e,1)} % contre ± ${o.dp} %. Le modèle surestime la vitesse, l'écart ne s'explique pas par la dispersion des mesures. Il suppose un fluide parfait ; en réalité, les frottements dans l'ajutage dissipent de l'énergie.`}]; },
    /* trompe à eau : aspiration par effet Venturi */
    ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const v1=rnd([1,1.5,2,2.5]), k=rnd([3,4,5,6,8]), p1=rnd([1.1,1.15,1.2,1.3]); const v2=v1*k, p2=p1*1e5+0.5*RE*(v1*v1-v2*v2); return {v1,k,p1,v2,p2}; },o=>o.p2>0.15e5&&far(o.p2,P0*1e5,0.05)&&(o.p2<P0*1e5)===want);
      const ok=o.p2<P0*1e5, ctx=`Trompe à eau horizontale : l'eau (ρ = 1 000 kg/m³) arrive à v1 = ${nf(o.v1,1)} m/s sous la pression absolue p1 = ${nf(o.p1,2)} bar, puis traverse un col de section ${o.k} fois plus petite. Un petit trou dans la paroi du col le relie à un flacon d'air à la pression atmosphérique p0 = 1,013 bar. Données : ${DEB} ; ${BERN}.`;
      return [{ctx,q:"Calcule la vitesse de l'eau dans le col.",type:"num",ans:o.v2,tolR:0.02,unit:"m/s",
          expl:`${F("S1·v1 = S2·v2")} avec une section ${o.k} fois plus petite : v2 = ${o.k} × ${nf(o.v1,1)} = ${U(o.v2,"m/s")}.`},
        {ctx,q:"Calcule la pression absolue de l'eau dans le col, en bar.",type:"num",ans:o.p2/1e5,tolR:0.02,unit:"bar",
          expl:`Écoulement horizontal (z1 = z2) : ${F("p2 = p1 + ½·ρ·(v1² − v2²)")} = ${nf(o.p1,2)} × ${p10(5)} + 0,5 × 1 000 × (${nf(o.v1,1)}² − ${nf(o.v2,1)}²) = ${nf(o.p2,0)} Pa, soit ${U(o.p2/1e5,"bar")}.`},
        {ctx,q:"L'air du flacon est-il aspiré dans le col ?",type:"ch",ch:YN,ok:ok?0:1,
          expl:`${nf(o.p2/1e5,3)} bar ${ok?"<":">"} 1,013 bar : ${ok?"la pression dans le col est plus faible que celle de l'air du flacon, l'air est aspiré (effet Venturi) ; on peut ainsi faire le vide dans le flacon.":"la pression dans le col reste supérieure à la pression atmosphérique : c'est l'eau qui sortirait par le trou. Il faut un col plus étroit ou une vitesse d'entrée plus grande."}`}]; },
    /* glace qui fond : le niveau monte-t-il ? */
    ()=>{ if(Math.random()<0.5){ const m=rnd([20,25,30,40,50]), ctx=`Un glaçon de ${m} g flotte dans un verre d'eau douce (ρ = 1 000 kg/m³, soit 1 g/cm³). Données : ${ARCH} ; à l'équilibre, Π = P.`;
        return [{ctx,q:"Quel volume d'eau le glaçon déplace-t-il, en cm³ ?",type:"num",ans:m,tolR:0.02,unit:"cm³",
            expl:`Équilibre : ${F("ρ<sub>eau</sub>·V<sub>imm</sub>·g = m·g")}, donc V<sub>imm</sub> = ${FRAC("m","ρ<sub>eau</sub>")} = ${FRAC(`${m} g`,"1 g/cm³")} = ${U(m,"cm³")}.`},
          {ctx,q:"Quel volume d'eau liquide obtient-on quand le glaçon a entièrement fondu ?",type:"num",ans:m,tolR:0.02,unit:"cm³",
            expl:`La masse se conserve : ${m} g d'eau liquide occupent ${F(`V = ${FRAC("m","ρ<sub>eau</sub>")}`)} = ${U(m,"cm³")}, exactement le volume que le glaçon déplaçait.`},
          {ctx,q:"Quand le glaçon a fondu, comment le niveau de l'eau dans le verre a-t-il évolué ?",type:"ch",...mc("Il n'a pas changé",["Il a monté","Il a baissé"]),
            expl:`L'eau de fonte remplit exactement le volume qu'occupait la partie immergée du glaçon : ${F("le niveau ne change pas")}.`}]; }
      const m=rnd([2,5,8,10]), Vi=m*1000/RM, ctx=`Un bloc de glace d'eau douce de ${m} t, détaché d'un glacier, flotte dans la mer (ρ = 1 025 kg/m³) ; l'eau douce liquide a une masse volumique de 1 000 kg/m³. Données : ${ARCH} ; à l'équilibre, Π = P.`;
      return [{ctx,q:"Quel volume d'eau de mer le bloc déplace-t-il, en m³ ?",type:"num",ans:Vi,tolR:0.02,unit:"m³",
          expl:`${F("ρ<sub>mer</sub>·V<sub>imm</sub>·g = m·g")}, donc V<sub>imm</sub> = ${FRAC("m","ρ<sub>mer</sub>")} = ${FRAC(nf(m*1000,0),"1 025")} = ${U(Vi,"m³")}.`},
        {ctx,q:"Quel volume d'eau douce liquide obtient-on quand le bloc a entièrement fondu ?",type:"num",ans:m,tolR:0.02,unit:"m³",
          expl:`La masse se conserve : ${F(`V = ${FRAC("m","ρ<sub>eau douce</sub>")}`)} = ${FRAC(nf(m*1000,0),"1 000")} = ${U(m,"m³")}.`},
        {ctx,q:"En fondant, ce bloc fait-il monter le niveau de la mer ?",type:"ch",...mc("Oui, très légèrement : l'eau de fonte occupe un peu plus de volume que l'eau de mer déplacée",["Non : le niveau ne change pas, comme pour un glaçon dans un verre d'eau","Non : le niveau baisse, car la glace occupe plus de place que l'eau"]),
          expl:`L'eau de fonte (${nf(m,0)} m³) occupe ${nf(m-Vi,3)} m³ de plus que l'eau de mer déplacée (${nf(Vi,3)} m³), car l'eau douce est moins dense que l'eau de mer : ${F("le niveau monte très légèrement")}.`}]; },
    /* stabilité d'un robot sous-marin : G sous C */
    ()=>{ const fig=fx_pf_stab({}), ctx="Un robot sous-marin filoguidé d'inspection est totalement immergé, propulseurs à l'arrêt ; son poids et la poussée d'Archimède ont la même valeur. La poussée d'Archimède s'applique au centre de carène C, centre du volume de la coque.";
      return [{fig,ctx,q:"Pour que le robot ne bascule pas (ni tangage ni roulis), où doit se trouver son centre de gravité G ?",type:"ch",...mc("Sur la verticale de C, en dessous de C",["Sur la verticale de C, au-dessus de C","N'importe où : Π et P se compensent","Le plus loin possible de C, vers l'avant"]),
          expl:`Si G n'est pas sur la verticale de C, P et Π forment un couple qui fait tourner le robot. Avec ${F("G sous C")}, si le robot s'incline, ce couple le ramène vers sa position d'équilibre (équilibre stable) ; avec G au-dessus de C, il le ferait chavirer.`},
        {fig,ctx,q:"Pour régler l'équilibre, on fixe sur le châssis un lest en plomb et un flotteur en mousse, moins dense que l'eau. Où les placer ?",type:"ch",...mc("Le lest en bas, le flotteur en haut",["Le lest en haut, le flotteur en bas","Les deux au centre du châssis","Peu importe : seule la masse totale compte"]),
          expl:`C ne dépend que de la forme extérieure de la coque ; G dépend de la répartition des masses. ${F("Lourd en bas, léger en haut")} : G descend sous C, ce qui stabilise le robot.`},
        {fig:fx_pf_stab({G:1}),ctx,q:"Le robot ainsi équilibré est incliné par un courant, puis relâché. Que se passe-t-il ?",type:"ch",...mc("Il revient vers sa position initiale en oscillant : l'équilibre est stable",["Il continue de basculer jusqu'à se retourner","Il reste incliné : toutes les positions sont des équilibres","Il remonte à la surface"]),
          expl:`Avec G sous C, le poids et la poussée forment, dès que le robot s'incline, ${F("un couple de rappel")} qui le ramène vers la position où G est à la verticale sous C.`}]; }
  ]
};
})();
