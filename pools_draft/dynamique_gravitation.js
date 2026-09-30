/* Réservoirs : principe fondamental de la dynamique (meca-dynamique) · gravitation et satellites (phy-gravitation).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_dyn_ et fx_grav_. */
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
const W=N=>N*2*Math.PI/60, TPM=w=>w*60/(2*Math.PI);
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
const dun=s=>s.replace(/^une? /,m=>m==="une "?"d'une ":"d'un ");                    /* « un robot » → « d'un robot » */
const deA=s=>/^le /.test(s)?"du "+s.slice(3):/^la /.test(s)?"de la "+s.slice(3):/^l'/.test(s)?"de "+s:"de "+s;   /* « le tambour » → « du tambour » */
const HL=t=>String(t).replace(/<[^>]*>/g,"").length>40?`<b>${t}</b>`:F(t);           /* réponse mise en valeur : F si courte, gras sinon */
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const add=(p,d,k)=>[p[0]+k*d[0],p[1]+k*d[1]];
const pol=(c,r,a)=>[c[0]+r*Math.cos(rad(a)),c[1]-r*Math.sin(rad(a))];            /* a en degrés, sens trigonométrique, y écran vers le bas */
const arcP=(c,r,a0,a1,cls,m)=>{ const p0=pol(c,r,a0), p1=pol(c,r,a1); return `<path d="M${P2(p0)} A${r} ${r} 0 ${Math.abs(a1-a0)>180?1:0} ${a1>a0?0:1} ${P2(p1)}" class="${cls||"v-cote"}"${m?` marker-end="url(#m-${m})"`:""}/>`; };
/* écriture scientifique à d décimales : 6,67 × 10<sup>−11</sup> */
const sci=(x,d)=>{ d=d==null?2:d; let e=Math.floor(Math.log10(Math.abs(x))), m=x/Math.pow(10,e); m=Math.round(m*Math.pow(10,d))/Math.pow(10,d); if(Math.abs(m)>=10){ m/=10; e++; } return `${nfd(m,d)} × 10<sup>${e<0?"−"+(-e):e}</sup>`; };
/* durée en h et min (arrondie à la minute) */
const hm=s=>{ const t=Math.round(s/60), H=Math.floor(t/60), M=t%60; return H?(M?`${H} h ${String(M).padStart(2,"0")} min`:`${H} h`):`${M} min`; };
/* pas de graduation : plus petit pas de la liste qui tombe juste sur v, avec au plus n intervalles jusqu'à v */
const STEPS=[0.05,0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100,200,250,500,1000,2000,2500,5000];
const gridStep=(v,n)=>STEPS.find(s=>Math.abs(v/s-Math.round(v/s))<1e-9&&v/s<=(n||6)+1e-9);
const decOf=st=>{ const s=String(+st.toPrecision(6)); const i=s.indexOf("."); return i<0?0:s.length-i-1; };
const SUPD={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻"};
const supT=n=>String(n).split("").map(c=>SUPD[c]).join("");                        /* exposant en texte SVG : 10²¹ */

/* ======================================================================
   FIGURES : DYNAMIQUE (préfixe fx_dyn_)
   ====================================================================== */
/* profil par morceaux (vitesse ou fréquence de rotation) : o.pts [[t, v]], o.tm (fin de l'axe), o.ts (pas en t), o.vm (haut de l'axe), o.vs (pas en v),
   o.ph : numéros des phases sous la courbe ; o.yl, o.tl : titres des axes ; o.noY : sans graduation verticale ; o.lv : étiquette du palier */
function fx_dyn_vt(o){
  const X0=62, Y0=204, Wd=298, Hd=160, sx=Wd/o.tm, sy=Hd/o.vm, X=t=>X0+t*sx, Y=v=>Y0-v*sy;
  const nt=Math.round(o.tm/o.ts), lt=nt>10?2:1, nv=Math.round(o.vm/o.vs), dv=decOf(o.vs), dt=decOf(o.ts*lt);
  let s="";
  for(let k=0;k<=nt;k++){ const t=k*o.ts; s+=L(X(t),Y0,X(t),Y0-Hd,"v-grid"); if(k%lt===0) s+=T(X(t),Y0+16,nf(t,dt),"v-lab s","middle"); }
  for(let k=1;k<=nv;k++){ const v=k*o.vs; s+=L(X0,Y(v),X0+Wd,Y(v),"v-grid")+(o.noY?"":T(X0-6,Y(v)+4,nf(v,dv),"v-lab s","end")); }
  s+=L(X0,Y0,X0+Wd+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-Hd-16,"v-ink","k");
  s+=`<polyline points="${o.pts.map(p=>P2([X(p[0]),Y(p[1])])).join(" ")}" class="v-curve"/>`;
  if(o.ph) for(let i=0;i+1<o.pts.length;i++) s+=numLab(X((o.pts[i][0]+o.pts[i+1][0])/2),Y0-24,String(i+1));
  if(o.lv){ const p1=o.pts[1], p2=o.pts[2]; s+=L(X0,Y(p1[1]),X(p1[0]),Y(p1[1]),"v-dash")+T(X0-6,Y(p1[1])+4,o.lv,"v-lab s c","end"); }
  s+=T(X0+Wd+12,Y0+34,o.tl||"t (s)","v-cap","end")+T(X0+8,Y0-Hd-6,o.yl||"v (m/s)","v-cap");
  return svg(244,s,o.alt||"Profil de vitesse en fonction du temps, phases numérotées");
}
/* profil trapézoïdal lisible sur la grille : durées cumulées ts3 = [t1, t2, t3], palier v ; o.yl, o.tl, o.alt */
function profil(v,ts3,o){
  o=o||{};
  const [t1,t2,t3]=ts3, half=ts3.some(t=>Math.abs(t-Math.round(t))>1e-9), ts=half?0.5:1, tm=Math.ceil((t3+ts)/ts-1e-9)*ts;
  const vs=gridStep(v,6), k=Math.round(v/vs), vm=vs*Math.max(k+1,Math.ceil(1.2*k-1e-9));
  return fx_dyn_vt({pts:[[0,0],[t1,v],[t2,v],[t3,0]],tm,ts,vm,vs,ph:true,yl:o.yl,tl:o.tl,alt:o.alt});
}
/* véhicule sur une rampe qui monte vers la droite : o.al (°), o.alab ; o.f = forces dessinées parmi "P","N","F","R" (appliquées en G) ;
   o.lab : textes des flèches ; o.num : numéros à la place des textes ; o.mv : flèche « sens du mouvement » (o.down : vers le bas de la rampe) ; o.cap : légende */
function fx_dyn_pente(o){
  const al=Math.max(10,Math.min(o.al,28)), th=rad(al), c=Math.cos(th), sn=Math.sin(th);
  const A=[20,214], Lp=Math.min(372/c,196/sn), B=add(A,[c,-sn],Lp), u=[c,-sn], n=[-sn,-c];
  let s=`<polygon points="${P2(A)} ${P2(B)} ${B[0].toFixed(1)},${A[1]}" class="v-body"/>`+ground(4,396,A[1]);
  s+=L(A[0],A[1],A[0]+150,A[1],"v-dash")+arcP(A,64,0,al);
  const q=al<18?[A[0]+90,A[1]-10]:pol(A,82,al/2); s+=T(q[0],q[1]+5,o.alab||"α","v-lab s","start");
  const P0=add(A,u,Lp*0.6), G=add(P0,n,22);
  s+=`<g transform="rotate(${(-al).toFixed(2)} ${P0[0].toFixed(1)} ${P0[1].toFixed(1)})"><rect x="${(P0[0]-38).toFixed(1)}" y="${(P0[1]-36).toFixed(1)}" width="76" height="25" rx="5" class="v-block"/>`+
     `<circle cx="${(P0[0]-24).toFixed(1)}" cy="${(P0[1]-7).toFixed(1)}" r="7" class="v-wheel"/><circle cx="${(P0[0]+24).toFixed(1)}" cy="${(P0[1]-7).toFixed(1)}" r="7" class="v-wheel"/></g>`;
  const D={P:[0,1],N:n,F:u,R:[-u[0],-u[1]]}, Ln={P:50,N:58,F:72,R:60}, K={P:["v-f","f","v-lab"],N:["v-n","a","v-lab a"],F:["v-t","c","v-lab c"],R:["v-vec","k","v-lab"]}, TX={P:"P",N:"N",F:"F",R:"F_r"};
  (o.f||[]).forEach(k=>{ const e=add(G,D[k],Ln[k]); s+=L(G[0],G[1],e[0],e[1],K[k][0],K[k][1]);
    const lp=k==="P"?[e[0]+(o.num?18:9),e[1]-(o.num?10:4)]:o.num?add(e,D[k],16):k==="R"?add(add(e,u,8),n,16):add(e,D[k],14);
    const tx=(o.lab&&o.lab[k])||TX[k], lg=!o.num&&tx.length>4&&(k==="F"||k==="R"), lq=lg?add(add(G,D[k],Ln[k]*0.5),n,20):lp;
    s+=o.num?numLab(lp[0],lp[1],String(o.num[k])):T(lq[0],lq[1]+5,tx,K[k][2],k==="P"?"start":"middle"); });
  s+=gSym(G[0],G[1]);
  if(o.mv){ const m0=add(add(A,u,Lp*0.12),n,52), m1=add(m0,u,62), lp=add(add(m0,u,31),n,13+45*sn); s+=(o.down?L(m1[0],m1[1],m0[0],m0[1],"v-f","f"):L(m0[0],m0[1],m1[0],m1[1],"v-f","f"))+T(lp[0],lp[1]+4,"mouvement","v-cap","middle"); }
  const top=Math.min(B[1],G[1]-Ln.N*c-30), dy=Math.max(0,top-12), h=A[1]+22-dy+(o.cap?18:0);
  if(o.cap) s+=T(392,A[1]+34,o.cap,"v-cap","end");
  return svg(h,`<g transform="translate(0,${(-dy).toFixed(1)})">${s}</g>`,o.alt||"Véhicule sur une rampe inclinée d'un angle alpha, forces appliquées au centre de gravité G");
}
/* rotor d'axe fixe Δ (vu de face) soumis au couple moteur C_m et au couple résistant C_r : o.J, o.Cm, o.Cr (textes), o.cap */
function fx_dyn_rot(o){
  const C=[200,112], R=60;
  let s=`<circle cx="${C[0]}" cy="${C[1]}" r="${R}" class="v-wheel"/><circle cx="${C[0]}" cy="${C[1]}" r="${R-11}" class="v-thin"/>`;
  for(let k=0;k<6;k++){ const a=k*60+15, p=pol(C,10,a), q=pol(C,R-13,a); s+=L(p[0],p[1],q[0],q[1],"v-dash"); }
  s+=piv(C[0],C[1])+T(C[0]+12,C[1]+22,"Δ","v-lab s");
  s+=arcP(C,R+16,48,132,"v-n","a")+T(C[0],C[1]-R-26,o.Cm||"C_m","v-lab a","middle");
  s+=arcP(C,R+16,-48,-132,"v-t","c")+T(C[0],C[1]+R+38,o.Cr||"C_r","v-lab c","middle");
  if(o.J) s+=T(392,22,o.J,"v-lab s","end");
  s+=T(8,22,"sens + : celui de C_m","v-cap");
  if(o.cap) s+=T(200,C[1]+R+62,o.cap,"v-cap","middle");
  return svg(o.cap?250:228,s,o.alt||"Rotor tournant autour de l'axe fixe delta, soumis au couple moteur C_m et au couple résistant C_r");
}
/* treuil : moteur (→ réducteur) → tambour de rayon R, câble vertical portant une charge qui monte ; o.red : réducteur ;
   o.tm, o.tr, o.tt, o.tR, o.tc : textes (moteur, réducteur, tambour, rayon, charge) ; o.a : flèche d'accélération de la charge */
function fx_dyn_treuil(o){
  const y=76, Cx=284, R=40;
  let s=rbox(8,y-24,74,48,["moteur"]);
  if(o.red){ s+=L(82,y,112,y,"v-ink")+rbox(112,y-28,86,56,["réducteur"])+L(198,y,Cx,y,"v-ink"); if(o.tr) s+=T(155,y+44,o.tr,"v-lab s","middle"); }
  else s+=L(82,y,Cx,y,"v-ink");
  if(o.tm) s+=T(45,y+42,o.tm,"v-lab s","middle");
  s+=`<circle cx="${Cx}" cy="${y}" r="${R}" class="v-wheel"/>`+piv(Cx,y);
  s+=L(Cx,y,Cx-R*0.71,y+R*0.71,"v-cote")+T(Cx-R*0.36-6,y+R*0.36+14,"R","v-lab s","end");
  s+=arcP([Cx,y],R+13,35,145,"v-n","a")+T(Cx,y-R-22,"ω","v-lab a","middle");
  s+=L(Cx+R,y,Cx+R,162,"v-ink")+`<rect x="${Cx+R-24}" y="162" width="48" height="40" rx="3" class="v-block"/>`;
  if(o.tc) s+=T(Cx+R-32,186,o.tc,"v-lab s","end");
  if(o.a) s+=L(Cx+R+42,204,Cx+R+42,160,"v-n","a")+T(Cx+R+50,188,"a","v-lab a");
  if(o.tt) s+=T(Cx-8,y+66,o.tt,"v-lab s","end");
  if(o.tR) s+=T(Cx-8,y+82,o.tR,"v-lab s","end");
  return svg(214,s,o.alt||"Treuil : moteur, réducteur et tambour de rayon R qui enroule le câble d'une charge");
}
/* ascenseur à contrepoids : poulie motrice, cabine à gauche (monte), contrepoids à droite (descend) ; o.tc, o.tp, o.tR : textes */
function fx_dyn_asc(o){
  const C=[200,58], R=34;
  let s=`<rect x="150" y="6" width="100" height="10" class="v-box"/>`+L(200,16,200,C[1],"v-thin");
  s+=`<circle cx="${C[0]}" cy="${C[1]}" r="${R}" class="v-wheel"/>`+piv(C[0],C[1])+arcP(C,R+12,150,30,"v-t","c")+T(C[0]+R+26,C[1]-28,"C","v-lab c");
  s+=L(C[0]-R,C[1],C[0]-R,112,"v-ink")+L(C[0]+R,C[1],C[0]+R,126,"v-ink");
  s+=`<rect x="${C[0]-R-44}" y="112" width="88" height="78" rx="4" class="v-body"/>`+T(C[0]-R,156,"cabine","v-smb","middle");
  s+=`<rect x="${C[0]+R-16}" y="126" width="32" height="58" rx="2" class="v-block"/>`+T(C[0]+R+40,146,"contrepoids","v-cap");
  s+=L(C[0]-R-60,186,C[0]-R-60,136,"v-n","a")+T(C[0]-R-68,164,"a","v-lab a","end");
  s+=L(C[0]+R+26,160,C[0]+R+26,204,"v-n","a")+T(C[0]+R+34,196,"a","v-lab a");
  if(o.tc) s+=T(C[0]-R,208,o.tc,"v-lab s","middle");
  if(o.tp) s+=T(C[0]+R+40,164,o.tp,"v-lab s");
  if(o.tR) s+=T(C[0]-R-14,C[1]+4,o.tR,"v-lab s","end");
  return svg(218,s,o.alt||"Ascenseur : cabine et contrepoids suspendus de part et d'autre d'une poulie motrice");
}
/* chaîne de transmission en blocs : o.b = [{t:[lignes], v:[lignes sous le bloc]}] ; flèches de puissance mécanique ; o.cap */
function fx_dyn_chaine(o){
  const n=o.b.length, gap=22, w=(392-gap*(n-1))/n, y0=o.cap?30:12; let s="";
  o.b.forEach((b,i)=>{ const x=4+i*(w+gap); s+=rbox(x,y0,w,46,b.t,b.q?"v-boxq":"v-box"); if(i<n-1) s+=L(x+w,y0+23,x+w+gap-1,y0+23,i===0&&o.el?"v-el":"v-me",i===0&&o.el?"a":"c");
    s+=multi(x+w/2,y0+64,b.v||[],"v-lab s","middle",15); });
  if(o.cap) s+=T(200,18,o.cap,"v-cap","middle");
  const nv=Math.max(...o.b.map(b=>(b.v||[]).length));
  return svg(y0+58+15*nv,s,o.alt||"Chaîne de transmission de la puissance");
}

/* ======================================================================
   FIGURES : GRAVITATION (préfixe fx_grav_)
   ====================================================================== */
/* pas « rond » : au plus n intervalles jusqu'à max */
function fx_grav_step(max,n){ const raw=max/n, p=10**Math.floor(Math.log10(raw)); for(const m of [1,2,2.5,5,10]) if(m*p>=raw*(1-1e-9)) return +(m*p).toPrecision(6); return 10*p; }
/* astre de centre O et orbite circulaire (échelle non respectée) : o.nm (nom de l'astre), o.a (position du satellite, degrés),
   o.arr : flèches nommées parmi "F" (force exercée par l'astre) et "v" (vitesse) ; o.num : ordre des 4 flèches candidates ["in","out","fw","bw"] ;
   o.Rh : cotes R et h ; o.rl : texte de la cote O → S ; o.sl : nom du satellite */
function fx_grav_orbite(o){
  const O=[200,136], Rp=o.num?36:44, Ro=106, a=o.a==null?40:o.a, S=pol(O,Ro,a), ur=[(S[0]-O[0])/Ro,(S[1]-O[1])/Ro], ut=[ur[1],-ur[0]];   /* ut : sens de parcours trigonométrique */
  let s=`<circle cx="${O[0]}" cy="${O[1]}" r="${Ro}" class="v-dash"/><circle cx="${O[0]}" cy="${O[1]}" r="${Rp}" class="v-body"/>`;
  const dA=(x,y)=>{ const d=Math.abs(((x-y)%360+540)%360-180); return d; }, avoid=[a,90,...(o.Rh?[a+150]:[]),...(o.rl?[a]:[])], ca=[-45,-135,45,135,0,180].map(c=>({c,d:Math.min(...avoid.map(v=>dA(c,v)))})).sort((x,y)=>y.d-x.d)[0].c, on=pol([0,0],17,ca);
  s+=`<circle cx="${O[0]}" cy="${O[1]}" r="2.6" class="v-pt"/>`+T(O[0],O[1]-Rp+18,esc(o.nm||"Terre"),"v-smb","middle")+T(O[0]+on[0],O[1]+on[1]+5,"O","v-lab s","middle");
  const q=pol(O,Ro+14,a+180+40), q2=pol(O,Ro+14,a+180+70); s+=`<path d="M${P2(q)} A${Ro+14} ${Ro+14} 0 0 0 ${P2(q2)}" class="v-n" marker-end="url(#m-a)"/>`;
  if(o.Rh){ const b=a+150, E=pol(O,Rp,b), H=pol(O,Ro,b);
    s+=`<line x1="${O[0]}" y1="${O[1]}" x2="${E[0].toFixed(1)}" y2="${E[1].toFixed(1)}" class="v-cote" marker-end="url(#m-d)"/>`+`<line x1="${E[0].toFixed(1)}" y1="${E[1].toFixed(1)}" x2="${H[0].toFixed(1)}" y2="${H[1].toFixed(1)}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`;
    const mR=pol(O,Rp*0.55,b), mh=pol(O,(Rp+Ro)/2,b), off=pol([0,0],12,b+90); s+=T(mR[0]+off[0],mR[1]+off[1]+4,"R","v-lab s","middle")+T(mh[0]+off[0],mh[1]+off[1]+4,"h","v-lab s","middle"); }
  if(o.rl){ s+=`<line x1="${O[0]}" y1="${O[1]}" x2="${S[0].toFixed(1)}" y2="${S[1].toFixed(1)}" class="v-cote" marker-end="url(#m-d)"/>`; const m=pol(O,Ro*0.62,a), off=pol([0,0],13,a+90); s+=T(m[0]+off[0],m[1]+off[1]+4,esc(o.rl),"v-lab s","middle"); }
  const D={in:[-ur[0],-ur[1]],out:ur,fw:ut,bw:[-ut[0],-ut[1]]}, Lr=o.num?40:46;
  if(o.num) o.num.forEach((k,i)=>{ const d=D[k], e=add(S,d,Lr), lp=add(S,d,Lr+15); s+=L(S[0],S[1],e[0],e[1],"v-vec","k")+numLab(lp[0],lp[1],String(i+1)); });
  (o.arr||[]).forEach(k=>{ const d=k==="F"?D.in:D.fw, e=add(S,d,Lr+4), lp=k==="F"?add(add(S,d,(Lr+4)*0.55),D.bw,13):add(add(S,d,Lr+4),D.out,13); s+=L(S[0],S[1],e[0],e[1],k==="F"?"v-t":"v-n",k==="F"?"c":"a")+T(lp[0],lp[1]+5,k==="F"?"F":"v",k==="F"?"v-lab c":"v-lab a","middle"); });
  s+=`<g transform="rotate(${(90-a).toFixed(1)} ${S[0].toFixed(1)} ${S[1].toFixed(1)})"><rect x="${(S[0]-5).toFixed(1)}" y="${(S[1]-5).toFixed(1)}" width="10" height="10" class="v-block"/><rect x="${(S[0]-19).toFixed(1)}" y="${(S[1]-3).toFixed(1)}" width="12" height="6" class="v-box"/><rect x="${(S[0]+7).toFixed(1)}" y="${(S[1]-3).toFixed(1)}" width="12" height="6" class="v-box"/></g>`;
  const ls=add(S,[-ut[0]*0.7+ur[0]*0.7,-ut[1]*0.7+ur[1]*0.7],o.num?30:24); s+=T(ls[0],ls[1]+5,esc(o.sl||"S"),"v-lab s","middle");
  s+=T(392,256,"échelle non respectée","v-cap","end");
  return svg(262,s,o.alt||"Satellite S en orbite circulaire autour du centre O de l'astre");
}
/* droite T² = f(r³) : o.pts = [{x, y, lab}] en unités d'axe, o.xl, o.yl (titres), o.k : pente de la droite tracée (unités d'axe) */
function fx_grav_kepler(o){
  const X0=62, Y0=204, Wd=298, Hd=160, xm0=Math.max(...o.pts.map(p=>p.x))*1.12, ym0=Math.max(...o.pts.map(p=>p.y))*1.12;
  const xs=fx_grav_step(xm0,6), ys=fx_grav_step(ym0,5), xm=Math.ceil(xm0/xs-1e-9)*xs, ym=Math.ceil(ym0/ys-1e-9)*ys, X=x=>X0+x/xm*Wd, Y=y=>Y0-y/ym*Hd;
  let s="";
  for(let k=0;k*xs<=xm+1e-9;k++) s+=L(X(k*xs),Y0,X(k*xs),Y0-Hd,"v-grid")+T(X(k*xs),Y0+16,nf(k*xs,decOf(xs)),"v-lab s","middle");
  for(let k=1;k*ys<=ym+1e-9;k++) s+=L(X0,Y(k*ys),X0+Wd,Y(k*ys),"v-grid")+T(X0-6,Y(k*ys)+4,nf(k*ys,decOf(ys)),"v-lab s","end");
  s+=L(X0,Y0,X0+Wd+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-Hd-16,"v-ink","k");
  const xe=Math.min(xm,ym/o.k); s+=L(X0,Y0,X(xe),Y(o.k*xe),"v-curve");
  o.pts.forEach(p=>{ s+=`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4.5" class="v-dot"/>`+(p.lab?T(X(p.x)+10,Y(p.y)-8,esc(p.lab),"v-cap","end"):""); });
  s+=T(X0+Wd+12,Y0+34,o.xl,"v-cap","end")+T(X0+8,Y0-Hd-6,o.yl,"v-cap");
  return svg(244,s,o.alt||"Carré de la période en fonction du cube du rayon de l'orbite");
}
/* champ de gravitation g(h) : o.M (kg), o.R (m), o.hm (km, fin de l'axe), o.nm ; o.mk = [{h, lab}] points repérés ; o.hl = {g, lab} : droite horizontale en tirets */
function fx_grav_gh(o){
  const X0=62, Y0=204, Wd=298, Hd=160, g0=6.67e-11*o.M/(o.R*o.R), gm=Math.ceil(g0*1.1), xs=fx_grav_step(o.hm,10), lx=Math.round(o.hm/xs)>7?2:1, ys=fx_grav_step(gm,5), ym=Math.ceil(gm/ys-1e-9)*ys, X=h=>X0+h/o.hm*Wd, Y=v=>Y0-v/ym*Hd, gh=h=>6.67e-11*o.M/((o.R+h*1000)**2);
  let s="";
  for(let k=0;k*xs<=o.hm+1e-9;k++) s+=L(X(k*xs),Y0,X(k*xs),Y0-Hd,"v-grid")+(k%lx===0?T(X(k*xs),Y0+16,nf(k*xs,0),"v-lab s","middle"):"");
  for(let k=1;k*ys<=ym+1e-9;k++) s+=L(X0,Y(k*ys),X0+Wd,Y(k*ys),"v-grid")+T(X0-6,Y(k*ys)+4,nf(k*ys,decOf(ys)),"v-lab s","end");
  s+=L(X0,Y0,X0+Wd+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-Hd-16,"v-ink","k");
  const pts=[]; for(let i=0;i<=160;i++){ const h=o.hm*i/160; pts.push(P2([X(h),Y(gh(h))])); } s+=`<polyline points="${pts.join(" ")}" class="v-curve"/>`;
  if(o.hl) s+=L(X0,Y(o.hl.g),X0+Wd,Y(o.hl.g),"v-dash")+T(X0+Wd-4,Y(o.hl.g)-6,esc(o.hl.lab),"v-cap","end");
  (o.mk||[]).forEach(m=>{ const x=X(m.h), y=Y(gh(m.h)); s+=L(x,y,x,Y0,"v-dash")+L(X0,y,x,y,"v-dash")+`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" class="v-dot"/>`+(m.lab?T(x+8,y-8,esc(m.lab),"v-lab s"):""); });
  s+=T(X0+Wd+12,Y0+34,"h (km)","v-cap","end")+T(X0+8,Y0-Hd-6,`g (m/s²) · ${o.nm||"Terre"}`,"v-cap");
  return svg(244,s,o.alt||"Champ de gravitation en fonction de l'altitude");
}
/* segment Terre – Lune (échelle non respectée) : o.D (texte de la distance entre centres), o.x (texte de la distance Terre – point P), o.pp : position de P (0 à 1) */
function fx_grav_tl(o){
  const xT=58, xL=350, y=96, xP=xT+(xL-xT)*(o.pp||0.8);
  let s=`<circle cx="${xT}" cy="${y}" r="40" class="v-body"/><circle cx="${xL}" cy="${y}" r="14" class="v-body"/>`+T(xT,y+58,esc(o.n1||"Terre"),"v-smb","middle")+T(xL,y+36,esc(o.n2||"Lune"),"v-smb","middle");
  s+=L(xT,y,xL,y,"v-dash")+`<circle cx="${xT}" cy="${y}" r="2.6" class="v-pt"/><circle cx="${xL}" cy="${y}" r="2.6" class="v-pt"/>`+pt(xP,y,"",0,0)+T(xP,y-12,"P","v-lab","middle");
  s+=L(xP-6,y+16,xP-38,y+16,"v-t","c")+T(xP-22,y+36,"F₁","v-lab c","middle")+L(xP+6,y+16,xP+38,y+16,"v-t","c")+T(xP+22,y+36,"F₂","v-lab c","middle");
  s+=L(xT,y-44,xT,y-70,"v-dash")+L(xL,y-18,xL,y-70,"v-dash")+L(xP,y-20,xP,y-50,"v-dash")+cote(xT,xL,y-64,o.D||"D")+cote(xT,xP,y-38,o.x||"x");
  s+=T(392,y+72,"échelle non respectée","v-cap","end");
  return svg(y+80,s,o.alt||"Point P sur le segment qui joint les centres de la Terre et de la Lune");
}

/* ======================================================================
   PRINCIPE FONDAMENTAL DE LA DYNAMIQUE — meca-dynamique
   ====================================================================== */
/* systèmes en translation : nom, « du … », masses (kg), vitesses de palier (m/s, lisibles sur la grille), durées d'accélération (s), coefficients de résistance à l'avancement c */
const TRS=[
  {n:"un robot de livraison",de:"du robot",m:[45,60,80,100,120],v:[1,1.2,1.5,2],t:[1,1.5,2,2.5],c:[0.02,0.03]},
  {n:"un chariot filoguidé",de:"du chariot",m:[250,350,500,650,800],v:[0.5,0.6,0.8,1,1.2],t:[1.5,2,2.5,3],c:[0.01,0.015,0.02]},
  {n:"une navette autonome",de:"de la navette",m:[1800,2200,2600,3000],v:[4,5,6],t:[4,5,6,8],c:[0.012,0.015,0.02]},
  {n:"un portail coulissant",de:"du portail",m:[180,250,320,400],v:[0.2,0.25,0.3],t:[1,1.5,2],c:[0.02,0.03,0.05]},
  {n:"une porte automatique coulissante",de:"de la porte",m:[60,80,100,120],v:[0.4,0.5,0.6],t:[0.5,1,1.5],c:[0.02,0.03]},
  {n:"un tramway",de:"du tramway",m:[32000,38000,42000],v:[8,10,12],t:[8,10,12],c:[0.003,0.004,0.005]}
];
const TRAP=S=>{ const v=rnd(S.v), t1=rnd(S.t), t2=t1+rnd([2,3,4,5,6]), t3=t2+rnd(S.t); return {v,t1,t2,t3}; };
const JR=[
  {n:"la meule d'un touret à affûter",J:[0.008,0.012,0.02,0.03],w:[150,200,250,300],t:[2,3,4]},
  {n:"le tambour d'un lave-linge chargé",J:[0.08,0.1,0.15,0.2],w:[60,80,100,120],t:[4,5,6,8]},
  {n:"le volant d'inertie d'un vélo d'appartement",J:[0.15,0.25,0.4,0.5],w:[20,30,40],t:[2,3,4]},
  {n:"le plateau tournant d'un robot de soudage",J:[1.5,2,3,4,5],w:[1.5,2,2.5,3],t:[1,1.5,2]},
  {n:"le rotor d'une petite éolienne",J:[3,4,6,8],w:[10,15,20,25],t:[8,10,12,15]},
  {n:"la broche d'une perceuse à colonne",J:[0.004,0.006,0.008,0.01],w:[100,150,200,250],t:[0.5,1,1.5]}
];
/* catalogue de moteurs : nom, couple maximal (N·m) */
const MCAT=[["M1",0.5],["M2",0.8],["M3",1.2],["M4",2],["M5",3.2],["M6",5],["M7",8],["M8",12],["M9",20],["M10",32]];
const catTab=o=>table(["Moteur",...o.map(c=>c[0])],[["Couple maximal",...o.map(c=>`${nf(c[1],1)} N·m`)]]);
/* choisit 4 moteurs consécutifs du catalogue autour de la valeur requise ; renvoie null si la valeur tombe à moins de 5 % d'un couple du catalogue */
const pickCat=Cq=>{ const i=MCAT.findIndex(c=>c[1]>=Cq); if(i<1||i>MCAT.length-2||MCAT.some(c=>!far(c[1],Cq,0.05))) return null; const j0=Math.max(0,Math.min(i-1-Math.floor(Math.random()*2),MCAT.length-4)); return {i,j0,opts:MCAT.slice(j0,j0+4)}; };

const DY1=[
  /* accélération lue sur un profil de vitesse en trapèze */
  ()=>{ const S=rnd(TRS), p=TRAP(S), k=rnd([1,3]), dt=k===1?p.t1:p.t3-p.t2, a=p.v/dt;
    return {fig:profil(p.v,[p.t1,p.t2,p.t3]),ctx:`Pour chaque déplacement ${dun(S.n)}, la commande impose ce profil de vitesse en trapèze : accélération, vitesse constante, freinage.`,
      q:k===1?"Calcule l'accélération pendant la phase 1.":"Calcule la décélération pendant la phase 3 (valeur absolue de l'accélération).",type:"num",ans:a,tolR:0.02,unit:"m/s²",
      expl:`Sur chaque phase, l'accélération est la pente de v(t) : ${F(`a = ${FRAC("Δv","Δt")}`)} = ${k===1?`${FRAC(`${nf(p.v,2)} − 0`,`${nf(p.t1,1)} − 0`)} = ${U(a,"m/s²")}.`:`${FRAC(`0 − ${nf(p.v,2)}`,`${nf(p.t3,1)} − ${nf(p.t2,1)}`)} = −${nf(a,3)} m/s². Elle est négative (freinage) : la décélération vaut ${U(a,"m/s²")}.`}`}; },
  /* quelle phase demande l'effort moteur le plus grand ? */
  ()=>{ const S=rnd(TRS), p=TRAP(S), v=rnd([0,1,2]);
    const Q=["Pendant quelle phase l'effort moteur est-il le plus grand ?","Pendant quelle phase l'effort moteur est-il égal aux efforts résistants ?","Pendant quelle phase l'effort moteur est-il le plus petit ?"][v];
    return {fig:profil(p.v,[p.t1,p.t2,p.t3]),ctx:`Profil de vitesse ${S.de} sur un trajet horizontal. Les efforts résistants F_r (frottements, roulement) sont supposés constants.`,
      q:Q,type:"ch",ch:["Phase 1","Phase 2","Phase 3"],ok:v,
      expl:`PFD en projection sur l'axe du mouvement : ${F("F − F_r = m·a")}, donc ${F("F = m·a + F_r")}. Phase 1 : a > 0, F > F_r. Phase 2 : a = 0, F = F_r. Phase 3 : a &lt; 0, F &lt; F_r (le moteur peut même freiner). Réponse : ${F(`phase ${v+1}`)}.`}; },
  /* résistance au roulement à vitesse constante */
  ()=>{ const S=rnd([{n:"Un chariot filoguidé chargé",m:[400,600,800,1000],c:[0.01,0.012,0.015,0.02]},{n:"Un wagonnet sur rails",m:[800,1200,1500,2000],c:[0.002,0.003,0.004]},
        {n:"Un fauteuil roulant électrique avec son passager",m:[150,180,200,230],c:[0.01,0.015,0.02]},{n:"Un vélo cargo chargé",m:[120,150,180,220],c:[0.005,0.006,0.008]}]);
    const m=rnd(S.m), c=rnd(S.c), Fr=c*m*g;
    return {ctx:`${S.n} (m = ${nf(m,0)} kg) avance à vitesse constante sur un sol horizontal. Coefficient de résistance au roulement : C_r = ${nf(c,3)} ; les autres résistances sont négligées. g = 9,81 m/s².`,
      q:"Quel effort de traction faut-il fournir ?",type:"num",ans:Fr,tolR:0.02,unit:"N",
      expl:`Vitesse constante : a = 0, donc ${F("ΣF = 0")} en projection sur l'axe du mouvement : F − F_r = 0. ${F("F = F_r = C_r·m·g")} = ${nf(c,3)} × ${nf(m,0)} × 9,81 = ${U(Fr,"N")}.`}; },
  /* cours : PFD en rotation, unités, sens de J */
  ()=>{ const K=[
      ["Quelle relation traduit le principe fondamental de la dynamique pour un solide en rotation autour d'un axe fixe Δ ?",`ΣM_Δ = J_Δ·${FRAC("dω","dt")}`,["ΣM_Δ = m·a","ΣM_Δ = J_Δ·ω","ΣM_Δ = 0 dès que le solide tourne"],"La somme des moments par rapport à l'axe (couples) est égale au moment d'inertie multiplié par l'accélération angulaire. C'est l'équivalent en rotation de ΣF = m·a."],
      ["Quelle est l'unité du moment d'inertie J d'un solide par rapport à un axe ?","kg·m²",["kg·m","N·m","kg/m²"],"J est une somme de masses multipliées par le carré de leur distance à l'axe : il s'exprime en kg·m²."],
      ["Quelle est l'unité de l'accélération angulaire ?","rad/s²",["rad/s","tr/min","m/s²"],`α = ${FRAC("dω","dt")} : une vitesse angulaire (rad/s) divisée par une durée (s), soit des rad/s².`],
      ["Un rotor tourne à vitesse constante autour de son axe fixe. Que vaut la somme des couples qui s'exercent sur lui ?","Elle est nulle : le couple moteur compense le couple résistant",["Elle est égale à J·ω","Elle est égale au couple moteur","On ne peut pas conclure sans connaître J"],`ω constante : ${FRAC("dω","dt")} = 0, donc ΣM = J × 0 = 0 et C_m = C_r.`],
      ["Que traduit le moment d'inertie J d'un solide par rapport à un axe ?","La difficulté à modifier sa vitesse de rotation autour de cet axe",["Le couple nécessaire pour le faire tourner à vitesse constante","Sa masse multipliée par sa vitesse angulaire","La vitesse de rotation maximale qu'il peut atteindre"],"En rotation, J joue le rôle de la masse en translation : plus J est grand, plus il faut de couple (ou de temps) pour changer ω. Il augmente avec la masse et surtout avec sa distance à l'axe."]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:`${HL(ok)}. ${e}`}; },
  /* couple nécessaire : C = J·α */
  ()=>{ const S=rnd(JR), J=rnd(S.J), w=rnd(S.w), t=rnd(S.t), al=w/t, C=J*al;
    return {fig:fx_dyn_rot({J:`J = ${nf(J,3)} kg·m²`,Cr:"C_r négligé"}),ctx:`On veut lancer ${S.n} (J = ${nf(J,3)} kg·m²) avec une accélération angulaire constante α = ${nf(al,3)} rad/s². Le couple résistant est négligé.`,
      q:"Quel couple moteur faut-il appliquer ?",type:"num",ans:C,tolR:0.02,unit:"N·m",
      expl:`PFD en rotation autour de l'axe fixe : ${F("C_m − C_r = J·α")}, avec C_r = 0 : ${F("C_m = J·α")} = ${nf(J,3)} × ${nf(al,3)} = ${U(C,"N·m")}.`}; },
  /* accélération angulaire d'un démarrage, ou moment d'inertie mesuré */
  ()=>{ const S=rnd(JR), J=rnd(S.J), w=rnd(S.w), t=rnd(S.t), al=w/t;
    if(Math.random()<0.5) return {ctx:`${cap1(S.n)} démarre depuis l'arrêt et atteint ω = ${nf(w,1)} rad/s en ${nf(t,1)} s, avec une accélération angulaire constante.`,
      q:"Calcule son accélération angulaire.",type:"num",ans:al,tolR:0.02,unit:"rad/s²",
      expl:`${F(`α = ${FRAC("Δω","Δt")}`)} = ${FRAC(`${nf(w,1)} − 0`,nf(t,1))} = ${U(al,"rad/s²")}.`};
    const C=Number((J*al).toPrecision(2)), Jm=C/al;
    return {ctx:`Pour identifier le moment d'inertie ${deA(S.n)}, on le lance à vide avec un couple moteur constant C = ${nf(C,3)} N·m (frottements négligés). On mesure une accélération angulaire α = ${nf(al,3)} rad/s².`,
      q:"Quel est son moment d'inertie J ?",type:"num",ans:Jm,tolR:0.02,unit:"kg·m²",
      expl:`${F("C = J·α")} (couple résistant négligé), donc ${F(`J = ${FRAC("C","α")}`)} = ${FRAC(nf(C,3),nf(al,3))} = ${U(Jm,"kg·m²")}.`}; },
  /* puissance maximale au démarrage : P = C·ω */
  ()=>{ const S=rnd([{n:"Le moteur d'un convoyeur",C:[4,6,8,12],w:[100,150,157,200]},{n:"Le moteur d'une pompe",C:[2,3,5,7],w:[150,200,250,300]},{n:"Le moteur d'une broche de fraiseuse",C:[1.5,2,3],w:[300,400,500]},{n:"Le moteur de traction d'une trottinette",C:[8,10,12,15],w:[40,50,60]}]);
    const C=rnd(S.C), w=rnd(S.w), P=C*w;
    return {ctx:`${S.n} démarre avec un couple constant C = ${nf(C,1)} N·m ; à la fin du démarrage, sa vitesse angulaire vaut ω = ${nf(w,0)} rad/s.`,
      q:"Quelle puissance mécanique maximale fournit-il pendant le démarrage ?",type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`${F("P = C·ω")} : à couple constant, la puissance augmente avec ω et elle est maximale à la fin du démarrage. P_max = ${nf(C,1)} × ${nf(w,0)} = ${U(P,"W")}.`}; },
  /* choisir le moteur dans un catalogue */
  ()=>{ const o=draw(()=>{ const Cq=Number((rnd([0.6,0.9,1.4,2.3,3.6,5.8,9,14,23])*(0.85+Math.random()*0.3)).toPrecision(2)), p=pickCat(Cq); return {Cq,p}; },o=>o.p!==null);
    const {i,j0,opts}=o.p, ok=i-j0, sys=rnd(["le tambour d'un enrouleur de câble","le plateau d'une table tournante","l'axe d'un bras de robot","la vis d'un axe linéaire"]);
    return {data:catTab(opts),ctx:`Le démarrage le plus exigeant ${deA(sys)} demande un couple moteur de ${nf(o.Cq,2)} N·m.`,
      q:"Quel est le plus petit moteur du catalogue qui convient ?",type:"ch",ch:opts.map(c=>c[0]),ok,
      expl:`Il faut un couple maximal au moins égal à ${nf(o.Cq,2)} N·m. ${ok>0?`${MCAT[i-1][0]} (${nf(MCAT[i-1][1],1)} N·m) est insuffisant ; `:""}${F(MCAT[i][0])} (${nf(MCAT[i][1],1)} N·m) convient et c'est le plus petit : les suivants conviennent aussi mais sont surdimensionnés (plus lourds, plus chers).`}; },
  /* forces sur une rampe : reconnaître les flèches */
  ()=>{ const nums=shuffle([1,2,3,4]), num={P:nums[0],N:nums[1],F:nums[2],R:nums[3]}, k=rnd(["P","N","F","R"]), al=rnd([12,15,18,20,25]);
    const NM={P:"le poids P",N:"l'action normale N du sol",F:"l'effort moteur F (action du sol sur les roues motrices)",R:"la résistance à l'avancement F_r"};
    return {fig:fx_dyn_pente({al,f:["P","N","F","R"],num}),ctx:"Un robot monte une rampe en accélérant. Toutes les actions sont ramenées au centre de gravité G.",
      q:`Quelle flèche représente ${NM[k]} ?`,type:"ch",ch:["Flèche 1","Flèche 2","Flèche 3","Flèche 4"],ok:num[k]-1,
      expl:`Flèche ${num.P} : le poids, vertical vers le bas. Flèche ${num.N} : l'action normale, perpendiculaire à la rampe. Flèche ${num.F} : l'effort moteur, parallèle à la rampe dans le sens du mouvement. Flèche ${num.R} : la résistance à l'avancement, opposée au mouvement. Réponse : ${F(`flèche ${num[k]}`)}.`}; },
  /* composante du poids le long de la pente */
  ()=>{ const S=rnd([{n:"Un robot de livraison",m:[40,60,80,100]},{n:"Un fauteuil roulant électrique avec son passager",m:[150,180,200]},{n:"Un chariot filoguidé",m:[300,450,600]},{n:"Un vélo à assistance électrique avec son cycliste",m:[90,100,110]}]);
    const m=rnd(S.m), al=rnd([3,4,5,6,8,10,12]), Px=m*g*Math.sin(rad(al));
    return {fig:fx_dyn_pente({al,alab:`α = ${al}°`,f:["P","N","F"],mv:1,cap:al<10?"pente exagérée sur la figure":""}),ctx:`${S.n} (m = ${nf(m,0)} kg) monte une rampe inclinée de α = ${al}°. g = 9,81 m/s².`,
      q:"Quelle est la composante du poids parallèle à la rampe, qui s'oppose à la montée ?",type:"num",ans:Px,tolR:0.02,unit:"N",
      expl:`On projette le poids sur l'axe de la rampe : ${F("P_x = m·g·sin α")} = ${nf(m,0)} × 9,81 × sin ${al}° = ${U(Px,"N")}. La composante m·g·cos α, perpendiculaire à la rampe, est compensée par l'action normale N.`}; },
  /* effort de freinage à partir de la décélération */
  ()=>{ const S=rnd([{n:"Une navette autonome",m:[1800,2200,2600,3000],a:[1,1.5,2,2.5]},{n:"Une trottinette électrique et son utilisateur",m:[90,95,100,110],a:[2,2.5,3,3.5]},{n:"Un chariot filoguidé chargé",m:[400,600,800],a:[0.5,0.8,1]},{n:"Un tramway",m:[32000,40000,45000],a:[1,1.2,1.5]}]);
    const m=rnd(S.m), a=rnd(S.a), Ff=m*a;
    return {ctx:`Exigence de freinage : ${S.n.charAt(0).toLowerCase()+S.n.slice(1)} (m = ${nf(m,0)} kg) doit pouvoir ralentir en ligne droite avec une décélération constante de ${nf(a,1)} m/s². Les efforts résistants autres que le freinage sont négligés.`,
      q:"Quel effort de freinage total les freins doivent-ils exercer ?",type:"num",ans:Ff,tolR:0.02,unit:"N",
      expl:`Axe dans le sens du mouvement : a = −${nf(a,1)} m/s². PFD : ${F("−F_f = m·a")}, donc ${F("F_f = m·|a|")} = ${nf(m,0)} × ${nf(a,1)} = ${U(Ff,"N")}.`}; },
  /* effet qualitatif d'un paramètre */
  ()=>{ const v=rnd([0,1,2,3]), k=rnd([2,3]);
    const C=[
      [`Avec le même couple moteur (couple résistant négligé), on multiplie par ${k} le moment d'inertie de la charge entraînée. Que devient la durée du démarrage jusqu'à la même vitesse ?`,`Elle est multipliée par ${k}`,`α = ${FRAC("C","J")} est divisée par ${k}, et t = ${FRAC("ω","α")} est multipliée par ${k}.`],
      [`Un robot démarre avec la même force motrice (résistances négligées), mais sa charge multiplie sa masse totale par ${k}. Que devient son accélération ?`,`Elle est divisée par ${k}`,`a = ${FRAC("F","m")} : à force égale, l'accélération est inversement proportionnelle à la masse.`],
      [`On multiplie par ${k} le couple moteur d'un rotor (même J, couple résistant négligé). Que devient la durée pour atteindre la même vitesse angulaire ?`,`Elle est divisée par ${k}`,`α = ${FRAC("C","J")} est multipliée par ${k}, donc t = ${FRAC("ω","α")} est divisée par ${k}.`],
      [`Un chariot freine avec le même effort, mais on multiplie sa vitesse initiale par ${k}. Que devient sa distance de freinage ?`,`Elle est multipliée par ${k*k}`,`La décélération ne change pas et d = ${FRAC("v²","2·|a|")} : la distance est proportionnelle au carré de la vitesse.`]][v];
    const all=[`Elle est multipliée par ${k}`,`Elle est divisée par ${k}`,`Elle est multipliée par ${k*k}`,"Elle ne change pas"];
    return {q:C[0],type:"ch",...mc(C[1],all.filter(x=>x!==C[1])),expl:`${HL(C[1])}. ${C[2]}`}; }
];

/* rotors : démarrage (J en kg·m², N en tr/min, t en s, C_r en N·m) */
const RS=[{n:"le mandrin d'un tour à bois",J:[0.02,0.03,0.05],N:[1200,1500,2000],t:[1,1.5,2],Cr:[0.2,0.3,0.5]},
  {n:"le tambour d'un lave-linge au début de l'essorage",J:[0.15,0.2,0.25],N:[600,800,1000],t:[8,10,12],Cr:[0.5,0.8,1]},
  {n:"le rotor d'une centrifugeuse de laboratoire",J:[0.005,0.008,0.01],N:[4000,5000,6000],t:[10,15,20],Cr:[0.02,0.03,0.05]},
  {n:"le plateau d'un tour de potier chargé d'argile",J:[0.1,0.15,0.2],N:[150,200,250],t:[1,2,3],Cr:[0.3,0.5]},
  {n:"la meule d'un touret à affûter",J:[0.015,0.02,0.03],N:[2800,3000],t:[2,3,4],Cr:[0.1,0.2]}];
/* profil N(t) : montée linéaire jusqu'à N1 en t1, puis palier ; axes lisibles */
const profN=(N1,t1)=>{ const vs=gridStep(N1,6), k=Math.round(N1/vs); return fx_dyn_vt({pts:[[0,0],[t1,N1],[3*t1,N1]],tm:3*t1,ts:t1/2,vm:vs*Math.max(k+1,Math.ceil(1.2*k-1e-9)),vs,yl:"N (tr/min)",alt:"Fréquence de rotation en fonction du temps : mise en vitesse puis palier"}); };

const DY2=[
  /* profil en trapèze : accélération, puis effort moteur */
  ()=>{ const S=rnd(TRS), p=TRAP(S), m=rnd(S.m), Fr=Math.round(rnd(S.c)*m*g), a=p.v/p.t1, Fm=m*a+Fr;
    const fig=profil(p.v,[p.t1,p.t2,p.t3]), ctx=`Profil de vitesse ${dun(S.n)} (m = ${nf(m,0)} kg) sur un trajet horizontal. Les efforts résistants valent F_r = ${nf(Fr,0)} N (supposés constants).`;
    return [{fig,ctx,q:"Détermine l'accélération a₁ du démarrage (phase 1).",type:"num",ans:a,tolR:0.02,unit:"m/s²",
        expl:`${F(`a₁ = ${FRAC("Δv","Δt")}`)} = ${FRAC(nf(p.v,2),nf(p.t1,1))} = ${U(a,"m/s²")} (pente de la phase 1).`},
      {fig,ctx,q:"Déduis-en l'effort moteur nécessaire pendant la phase 1.",type:"num",ans:Fm,tolR:0.02,unit:"N",
        expl:`PFD en projection sur l'axe du mouvement : ${F("F − F_r = m·a₁")}, donc ${F("F = m·a₁ + F_r")} = ${nf(m,0)} × ${nf(a,3)} + ${nf(Fr,0)} = ${U(Fm,"N")}. En phase 2 (a = 0), il suffira de F = F_r = ${nf(Fr,0)} N.`}]; },
  /* rampe donnée en % : effort de traction à vitesse constante, puis puissance */
  ()=>{ const S=rnd([{n:"Un fauteuil roulant électrique avec son passager",m:[140,160,180,200],p:[5,6,8,10],v:[4,5,6],fr:[15,20,25]},{n:"Un robot de livraison",m:[50,70,90],p:[8,10,12,15],v:[3,4,5],fr:[10,15]},
        {n:"Un vélo à assistance électrique avec son cycliste",m:[90,100,110],p:[4,5,6,8],v:[12,15,18],fr:[8,10,12]},{n:"Un chariot filoguidé chargé",m:[400,600,800],p:[2,3,4,5],v:[3,4,5],fr:[40,60,80]}]);
    const m=rnd(S.m), p=rnd(S.p), vk=rnd(S.v), Fr=rnd(S.fr), al=Math.atan(p/100), ad=deg(al), Px=m*g*Math.sin(al), Ft=Px+Fr, v=vk/3.6, P=Ft*v;
    const fig=fx_dyn_pente({al:ad,alab:`pente ${p} %`,f:["P","N","F","R"],mv:1,cap:"pente exagérée sur la figure"});
    const ctx=`${S.n} (m = ${nf(m,0)} kg) monte à vitesse constante v = ${vk} km/h une rampe de pente ${p} %. Résistance au roulement : F_r = ${Fr} N, parallèle à la rampe. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule l'effort de traction F nécessaire.",type:"num",ans:Ft,tolR:0.02,unit:"N",
        expl:`Pente de ${p} % : ${F(`tan α = ${FRAC(p,"100")}`)}, soit α = ${nf(ad,2)}°. Vitesse constante : ${F("F − m·g·sin α − F_r = 0")}, donc F = ${nf(m,0)} × 9,81 × sin ${nf(ad,2)}° + ${Fr} = ${nf(Px,1)} + ${Fr} = ${U(Ft,"N")}.`},
      {fig,ctx,q:"Quelle puissance mécanique faut-il fournir aux roues ?",type:"num",ans:P,tolR:0.02,unit:"W",
        expl:`v = ${FRAC(vk,"3,6")} = ${nf(v,3)} m/s. ${F("P = F·v")} = ${nf(Ft,1)} × ${nf(v,3)} = ${U(P,"W")}.`}]; },
  /* démarrage d'un rotor : accélération angulaire depuis des tr/min, puis couple moteur */
  ()=>{ const S=rnd(RS), J=rnd(S.J), N=rnd(S.N), t=rnd(S.t), Cr=rnd(S.Cr), w=W(N), al=w/t, Cm=J*al+Cr;
    const ctx=`${cap1(S.n)} (J = ${nf(J,3)} kg·m²) doit passer de l'arrêt à ${nf(N,0)} tr/min en ${nf(t,1)} s, avec une accélération angulaire constante. Les frottements exercent un couple résistant constant C_r = ${nf(Cr,2)} N·m.`;
    return [{ctx,q:"Calcule l'accélération angulaire pendant le démarrage.",type:"num",ans:al,tolR:0.02,unit:"rad/s²",
        expl:`${F(`ω = ${FRAC("2π·N","60")}`)} = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${nf(w,2)} rad/s. ${F(`α = ${FRAC("Δω","Δt")}`)} = ${FRAC(nf(w,2),nf(t,1))} = ${U(al,"rad/s²")}.`},
      {ctx,q:"Quel couple moteur faut-il pendant le démarrage ?",type:"num",ans:Cm,tolR:0.02,unit:"N·m",
        expl:`PFD en rotation : ${F("C_m − C_r = J·α")}, donc ${F("C_m = J·α + C_r")} = ${nf(J,3)} × ${nf(al,3)} + ${nf(Cr,2)} = ${U(Cm,"N·m")}.`}]; },
  /* puissance maximale au démarrage et puissance en régime établi */
  ()=>{ const S=rnd([{n:"le tambour d'entraînement d'un convoyeur",Cd:[40,50,60],Cr:[15,20,25],N:[60,80,100]},{n:"la lame d'une scie circulaire",Cd:[3,4,5],Cr:[1,1.5,2],N:[3000,4000,4500]},
        {n:"le rouleau d'entraînement d'un tapis de caisse",Cd:[6,8,10],Cr:[2,3,4],N:[100,120,150]},{n:"l'arbre d'un malaxeur à béton",Cd:[150,200,250],Cr:[60,80,100],N:[25,30,35]}]);
    const Cd=rnd(S.Cd), Cr=rnd(S.Cr), N=rnd(S.N), w=W(N), P1=Cd*w, P2=Cr*w;
    const ctx=`Pendant le démarrage, le couple moteur appliqué sur ${S.n} est constant : C_d = ${nf(Cd,1)} N·m. En régime établi, à ${nf(N,0)} tr/min, il ne compense plus que le couple résistant C_r = ${nf(Cr,1)} N·m.`;
    return [{ctx,q:"Calcule la puissance mécanique fournie à la fin du démarrage, quand la vitesse de régime est atteinte.",type:"num",ans:P1,tolR:0.02,unit:"W",
        expl:`${F(`ω = ${FRAC("2π·N","60")}`)} = ${nf(w,2)} rad/s. ${F("P = C·ω")} = ${nf(Cd,1)} × ${nf(w,2)} = ${U(P1,"W")} : c'est la puissance maximale du démarrage (C constant, ω maximale).`},
      {ctx,q:"Quelle puissance le moteur fournit-il ensuite, en régime établi ?",type:"num",ans:P2,tolR:0.02,unit:"W",
        expl:`${F("P = C_r·ω")} = ${nf(Cr,1)} × ${nf(w,2)} = ${U(P2,"W")}, soit ${nf(Cd/Cr,1)} fois moins qu'à la fin du démarrage : c'est souvent le démarrage qui dimensionne le moteur.`}]; },
  /* freinage : décélération imposée par la distance d'arrêt, puis effort de freinage */
  ()=>{ const o=draw(()=>{ const S=rnd([{n:"Une navette autonome",m:[2000,2500,3000],v:[20,25,30],d:[10,12,15],fr:[150,200,300]},{n:"Une trottinette électrique et son utilisateur",m:[90,100,110],v:[20,25],d:[5,6,8],fr:[20,30]},
          {n:"Un chariot filoguidé chargé",m:[300,500,800],v:[3,4,5],d:[0.5,0.8,1],fr:[20,30,50]},{n:"Un tramway",m:[32000,40000],v:[40,50],d:[60,80,100],fr:[1500,2000]}]);
        const m=rnd(S.m), vk=rnd(S.v), d=rnd(S.d), fr=rnd(S.fr), v=vk/3.6, a=v*v/(2*d); return {S,m,vk,d,fr,v,a,Ff:m*a-fr}; },o=>o.m*o.a>=2*o.fr);
    const ctx=`${o.S.n} : masse totale ${nf(o.m,0)} kg, vitesse ${o.vk} km/h sur une voie horizontale. Exigence : pouvoir s'arrêter sur ${nf(o.d,1)} m, avec une décélération constante. Les efforts résistants valent F_r = ${nf(o.fr,0)} N.`;
    return [{ctx,q:"Quelle décélération faut-il obtenir ?",type:"num",ans:o.a,tolR:0.02,unit:"m/s²",
        expl:`v = ${FRAC(o.vk,"3,6")} = ${nf(o.v,3)} m/s. Décélération constante jusqu'à l'arrêt : ${F("v² = 2·|a|·d")}, donc ${F(`|a| = ${FRAC("v²","2·d")}`)} = ${FRAC(`${nf(o.v,3)}²`,`2 × ${nf(o.d,1)}`)} = ${U(o.a,"m/s²")}.`},
      {ctx,q:"Quel effort de freinage faut-il exercer ?",type:"num",ans:o.Ff,tolR:0.02,unit:"N",
        expl:`Axe dans le sens du mouvement : ${F("−F_f − F_r = m·a")} avec a = −${nf(o.a,3)} m/s², donc ${F("F_f = m·|a| − F_r")} = ${nf(o.m,0)} × ${nf(o.a,3)} − ${nf(o.fr,0)} = ${U(o.Ff,"N")}. Les efforts résistants aident au freinage.`}]; },
  /* treuil : tension du câble, puis couple sur le tambour */
  ()=>{ const S=rnd([{n:"Un monte-charge de chantier",m:[150,250,400],R:[100,125,150]},{n:"Un palan électrique d'atelier",m:[200,300,500],R:[80,100,120]},{n:"Le treuil de levage d'une grue de quai",m:[800,1000,1500],R:[150,200]}]);
    const m=rnd(S.m), R=rnd(S.R), a=rnd([0.2,0.3,0.5,0.8]), Tn=m*(g+a), C=Tn*R/1000;
    const fig=fx_dyn_treuil({tc:`m = ${nf(m,0)} kg`,tR:`R = ${R} mm`,a:1}), ctx=`${S.n} soulève une charge de ${nf(m,0)} kg avec une accélération a = ${nf(a,1)} m/s² vers le haut (phase de démarrage). Le câble s'enroule sur un tambour de rayon R = ${R} mm. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule la tension du câble pendant le démarrage.",type:"num",ans:Tn,tolR:0.02,unit:"N",
        expl:`On isole la charge ; axe vertical vers le haut : ${F("T − m·g = m·a")}, donc ${F("T = m·(g + a)")} = ${nf(m,0)} × (9,81 + ${nf(a,1)}) = ${U(Tn,"N")}.`},
      {fig,ctx,q:"Quel couple faut-il appliquer au tambour (inertie du tambour négligée) ?",type:"num",ans:C,tolR:0.02,unit:"N·m",
        expl:`Le câble exerce T au bras de levier R : ${F("C = T·R")} = ${nf(Tn,1)} × ${nf(R/1000,3)} = ${U(C,"N·m")}. Attention : R en mètres, et R est un rayon, pas un diamètre.`}]; },
  /* rotor soumis à C_m et C_r : accélération angulaire, puis durée de mise en vitesse */
  ()=>{ const o=draw(()=>{ const S=rnd([{n:"la meule d'un touret",J:[0.015,0.02,0.03],Cm:[1,1.5,2],Cr:[0.1,0.2],N:[2800,3000]},{n:"le volant d'inertie d'un banc d'essai",J:[0.5,0.8,1.2],Cm:[10,15,20],Cr:[1,2],N:[1000,1500]},
          {n:"le tambour d'un lave-linge",J:[0.15,0.2],Cm:[3,4,5],Cr:[0.5,1],N:[800,1000,1200]},{n:"le rotor d'une centrifugeuse",J:[0.005,0.008],Cm:[0.2,0.3],Cr:[0.02,0.05],N:[4000,6000]}]);
        return {S,J:rnd(S.J),Cm:rnd(S.Cm),Cr:rnd(S.Cr),N:rnd(S.N)}; },o=>o.Cm>=2*o.Cr);
    const al=(o.Cm-o.Cr)/o.J, w=W(o.N), t=w/al, fig=fx_dyn_rot({J:`J = ${nf(o.J,3)} kg·m²`,Cm:`C_m = ${nf(o.Cm,2)} N·m`,Cr:`C_r = ${nf(o.Cr,2)} N·m`});
    const ctx=`${cap1(o.S.n)} démarre depuis l'arrêt sous l'action d'un couple moteur et d'un couple résistant constants (figure).`;
    return [{fig,ctx,q:"Applique le PFD en rotation pour calculer l'accélération angulaire du rotor.",type:"num",ans:al,tolR:0.02,unit:"rad/s²",
        expl:`PFD en rotation autour de l'axe fixe : ${F("C_m − C_r = J·α")}, donc ${F(`α = ${FRAC("C_m − C_r","J")}`)} = ${FRAC(`${nf(o.Cm,2)} − ${nf(o.Cr,2)}`,nf(o.J,3))} = ${U(al,"rad/s²")}.`},
      {fig,ctx,q:`Combien de temps faut-il pour atteindre ${nf(o.N,0)} tr/min ?`,type:"num",ans:t,tolR:0.02,unit:"s",
        expl:`ω = ${FRAC(`2π × ${nf(o.N,0)}`,"60")} = ${nf(w,2)} rad/s. α constante depuis l'arrêt : ${F(`t = ${FRAC("ω","α")}`)} = ${FRAC(nf(w,2),nf(al,3))} = ${U(t,"s")}.`}]; },
  /* freinage d'un rotor : couple de freinage, puis nombre de tours */
  ()=>{ const o=draw(()=>{ const S=rnd([{n:"la meule d'un touret",J:[0.02,0.03],N:[2800,3000],t:[3,4,5],Cr:[0.1,0.2]},{n:"le rotor d'un broyeur à végétaux",J:[0.3,0.5,0.8],N:[2500,3000],t:[3,5,8],Cr:[2,3]},
          {n:"le tambour d'un lave-linge",J:[0.2,0.25],N:[1000,1200],t:[10,12,15],Cr:[0.5,0.8]},{n:"le volant d'un vélo d'appartement",J:[0.3,0.4,0.5],N:[300,400,500],t:[2,3,4],Cr:[0.3,0.5]}]);
        const J=rnd(S.J), N=rnd(S.N), t=rnd(S.t), Cr=rnd(S.Cr); return {S,J,N,t,Cr,w:W(N)}; },o=>o.J*o.w/o.t>=1.5*o.Cr);
    const al=o.w/o.t, Cf=o.J*al-o.Cr, n=o.N*o.t/120;
    const ctx=`${cap1(o.S.n)} (J = ${nf(o.J,3)} kg·m²) tourne à ${nf(o.N,0)} tr/min. Un frein doit l'arrêter en ${nf(o.t,1)} s avec une décélération angulaire constante ; les frottements exercent en plus un couple résistant C_r = ${nf(o.Cr,2)} N·m.`;
    return [{ctx,q:"Quel couple de freinage faut-il appliquer ?",type:"num",ans:Cf,tolR:0.02,unit:"N·m",
        expl:`ω = ${FRAC(`2π × ${nf(o.N,0)}`,"60")} = ${nf(o.w,2)} rad/s ; |α| = ${FRAC(nf(o.w,2),nf(o.t,1))} = ${nf(al,3)} rad/s². Sens + : sens de rotation. ${F("−C_f − C_r = J·α")} avec α = −${nf(al,3)} rad/s², donc ${F("C_f = J·|α| − C_r")} = ${nf(o.J,3)} × ${nf(al,3)} − ${nf(o.Cr,2)} = ${U(Cf,"N·m")}.`},
      {ctx,q:"Combien de tours sont effectués pendant le freinage ?",type:"num",ans:n,tolR:0.02,unit:"tours",
        expl:`La vitesse décroît linéairement : la vitesse moyenne vaut ${FRAC("N","2")}. ${F(`n = ${FRAC("N","2")}·Δt`)} = ${FRAC(nf(o.N,0),"2")} tr/min × ${FRAC(nf(o.t,1),"60")} min = ${U(n,"tours")}.`}]; },
  /* lecture d'un graphe N(t) : accélération angulaire, puis couple moteur */
  ()=>{ const S=rnd([{n:"Le moteur d'un convoyeur",J:[0.01,0.02,0.03],Cr:[0.5,1,1.5],N:[1000,1500,3000],t:[0.5,1,1.5,2]},{n:"La broche d'une fraiseuse",J:[0.02,0.04,0.05],Cr:[0.2,0.4],N:[1200,2000,3000],t:[1,1.5,2]},
        {n:"Le tambour d'un lave-linge",J:[0.15,0.2,0.25],Cr:[0.5,1],N:[600,1000,1200],t:[5,6,8]}]);
    const J=rnd(S.J), Cr=rnd(S.Cr), N=rnd(S.N), t=rnd(S.t), w=W(N), al=w/t, Cm=J*al+Cr, fig=profN(N,t);
    const ctx=`${S.n} (moment d'inertie de l'ensemble en rotation : J = ${nf(J,3)} kg·m²) démarre selon le graphe. Couple résistant constant : C_r = ${nf(Cr,2)} N·m.`;
    return [{fig,ctx,q:"Lis la durée de la mise en vitesse, puis calcule l'accélération angulaire pendant cette phase.",type:"num",ans:al,tolR:0.02,unit:"rad/s²",
        expl:`Lecture : ${nf(N,0)} tr/min atteints en ${nf(t,2)} s. ω = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${nf(w,2)} rad/s ; ${F(`α = ${FRAC("Δω","Δt")}`)} = ${FRAC(nf(w,2),nf(t,2))} = ${U(al,"rad/s²")}.`},
      {fig,ctx,q:"Quel couple moteur faut-il pendant cette phase ?",type:"num",ans:Cm,tolR:0.02,unit:"N·m",
        expl:`${F("C_m = J·α + C_r")} = ${nf(J,3)} × ${nf(al,3)} + ${nf(Cr,2)} = ${U(Cm,"N·m")}. Sur le palier, α = 0 et C_m = C_r.`}]; },
  /* moment d'inertie d'un disque plein, puis couple de lancement */
  ()=>{ const S=rnd([{n:"un volant d'inertie en acier (disque plein)",m:[10,20,30,50],R:[100,150,200,250],N:[1500,3000],t:[5,10,15]},{n:"une meule (disque plein)",m:[2,3,4],R:[100,125],N:[2800,3000],t:[2,3,4]},
        {n:"un rouleau de convoyeur (cylindre plein)",m:[8,10,12],R:[50,60],N:[200,300],t:[0.5,1]}]);
    const m=rnd(S.m), R=rnd(S.R), N=rnd(S.N), t=rnd(S.t), J=0.5*m*(R/1000)**2, w=W(N), C=J*w/t;
    const ctx=`On lance ${S.n} de masse m = ${nf(m,0)} kg et de rayon R = ${R} mm, tournant autour de son axe. Pour un disque ou un cylindre plein : J = ½·m·R².`;
    return [{ctx,q:"Calcule son moment d'inertie.",type:"num",ans:J,tolR:0.02,unit:"kg·m²",
        expl:`${F("J = ½·m·R²")} = 0,5 × ${nf(m,0)} × ${nf(R/1000,3)}² = ${U(J,"kg·m²")} (R en mètres).`},
      {ctx,q:`Il doit atteindre ${nf(N,0)} tr/min en ${nf(t,1)} s depuis l'arrêt, frottements négligés. Quel couple moteur constant faut-il ?`,type:"num",ans:C,tolR:0.02,unit:"N·m",
        expl:`ω = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${nf(w,2)} rad/s ; α = ${FRAC(nf(w,2),nf(t,1))} = ${nf(w/t,3)} rad/s². ${F("C = J·α")} = ${nf(J,5)} × ${nf(w/t,3)} = ${U(C,"N·m")}.`}]; },
  /* choisir l'équation de projection sur la rampe */
  ()=>{ const al=rnd([12,15,18,20,22]);
    if(Math.random()<0.5) return {fig:fx_dyn_pente({al,f:["P","N","F","R"],mv:1}),ctx:"Un robot monte une rampe inclinée d'un angle α en accélérant. F : effort moteur ; F_r : résistance à l'avancement ; N : action normale du sol. L'axe x est parallèle à la rampe, orienté dans le sens du mouvement.",
      q:"Quelle équation traduit le PFD en projection sur l'axe x ?",type:"ch",...mc("F − m·g·sin α − F_r = m·a",["F + m·g·sin α − F_r = m·a","F − m·g·cos α − F_r = m·a","F − m·g·sin α − F_r = 0"]),
      expl:`On projette chaque action sur x : F compte positivement ; la composante du poids ${F("−m·g·sin α")} et F_r comptent négativement ; N est perpendiculaire à x. Le robot accélère, donc a ≠ 0 : ${F("F − m·g·sin α − F_r = m·a")}. m·g·cos α est la projection du poids sur la normale.`};
    return {fig:fx_dyn_pente({al,f:["P","N","F"],lab:{F:"F_f"},mv:1,down:1}),ctx:"Un chariot descend une rampe inclinée d'un angle α en freinant. F_f : effort de freinage ; N : action normale du sol ; résistances à l'avancement négligées. L'axe x est parallèle à la rampe, orienté dans le sens du mouvement (vers le bas).",
      q:"Quelle équation traduit le PFD en projection sur l'axe x ?",type:"ch",...mc("m·g·sin α − F_f = m·a",["m·g·sin α + F_f = m·a","−m·g·sin α − F_f = m·a","m·g·cos α − F_f = m·a"]),
      expl:`Axe x vers le bas de la rampe : la composante du poids ${F("+m·g·sin α")} est dans le sens du mouvement, F_f lui est opposée ; N ne donne rien sur x. ${F("m·g·sin α − F_f = m·a")}, avec a &lt; 0 pendant le freinage : il faut F_f > m·g·sin α pour ralentir.`}; },
  /* couple nécessaire au démarrage, puis choix du moteur */
  ()=>{ const o=draw(()=>{ const S=rnd([{n:"l'axe de rotation d'un bras de robot de peinture",J:[0.2,0.3,0.5],N:[30,40,60],t:[0.2,0.3,0.5],Cr:[0.5,1,1.5]},{n:"le plateau d'une table tournante d'usinage",J:[1,2,3],N:[20,30],t:[0.5,1],Cr:[1,2]},
          {n:"le tambour d'un enrouleur de tuyau",J:[0.05,0.08,0.1],N:[300,500],t:[1,2],Cr:[0.3,0.5]},{n:"le rotor d'une pompe, eau comprise",J:[0.005,0.01],N:[2800,2900],t:[0.3,0.5],Cr:[0.5,1]}]);
        const J=rnd(S.J), N=rnd(S.N), t=rnd(S.t), Cr=rnd(S.Cr), w=W(N), Cq=J*w/t+Cr; return {S,J,N,t,Cr,w,Cq,p:pickCat(Cq)}; },o=>o.p!==null);
    const {i,j0,opts}=o.p, ctx=`Entraînement direct (sans réducteur) : ${o.S.n} (J = ${nf(o.J,3)} kg·m²) doit atteindre ${nf(o.N,0)} tr/min en ${nf(o.t,1)} s depuis l'arrêt, à accélération angulaire constante, malgré un couple résistant C_r = ${nf(o.Cr,2)} N·m.`;
    return [{ctx,q:"Calcule le couple moteur nécessaire pendant le démarrage.",type:"num",ans:o.Cq,tolR:0.02,unit:"N·m",
        expl:`ω = ${FRAC(`2π × ${nf(o.N,0)}`,"60")} = ${nf(o.w,3)} rad/s ; α = ${FRAC(nf(o.w,3),nf(o.t,1))} = ${nf(o.w/o.t,3)} rad/s². ${F("C_m = J·α + C_r")} = ${nf(o.J,3)} × ${nf(o.w/o.t,3)} + ${nf(o.Cr,2)} = ${U(o.Cq,"N·m")}.`},
      {data:catTab(opts),ctx,q:"Quel est le plus petit moteur du catalogue qui convient ?",type:"ch",ch:opts.map(c=>c[0]),ok:i-j0,
        expl:`Il faut un couple maximal d'au moins ${nf(o.Cq,2)} N·m : ${MCAT[i-1][0]} (${nf(MCAT[i-1][1],1)} N·m) est insuffisant, ${F(MCAT[i][0])} (${nf(MCAT[i][1],1)} N·m) convient.`}]; }
];

const n2=x=>Number(x.toPrecision(2));                                     /* valeur « catalogue » à 2 chiffres significatifs */
const DY3=[
  /* robot en montée : effort de traction, couple de chaque moteur, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const m=rnd([60,80,100,120,150]), al=rnd([5,6,8,10]), a=rnd([0.3,0.4,0.5,0.6]), Fr=rnd([15,20,25,30]), R=rnd([80,100,120]), r=rnd([0.04,0.05,0.08,0.1]), eta=rnd([0.8,0.85,0.9]);
        const Ft=m*a+m*g*Math.sin(rad(al))+Fr, Cw=Ft*R/1000/2, Cm=r*Cw/eta, Cmax=n2(Cm*rnd([0.8,0.85,0.9,1.1,1.15,1.25])); return {m,al,a,Fr,R,r,eta,Ft,Cw,Cm,Cmax}; },
      o=>far(o.Cm,o.Cmax,0.06)&&(o.Cm<=o.Cmax)===want);
    const ok=o.Cm<=o.Cmax, fig=fx_dyn_chaine({b:[{t:["Moteur"],v:[`C_max = ${nf(o.Cmax,2)} N·m`]},{t:["Réducteur"],v:[`r = ${nf(o.r,2)}`,`η = ${nf(o.eta,2)}`]},{t:["Roue motrice"],v:[`R = ${o.R} mm`]}],cap:"chaîne de transmission de chacune des deux roues motrices"});
    const ctx=`Exigence : un robot de livraison (m = ${o.m} kg) doit pouvoir démarrer en montée, sur une rampe de ${o.al}°, avec une accélération a = ${nf(o.a,1)} m/s², malgré une résistance à l'avancement F_r = ${o.Fr} N. Ses deux roues motrices sont chacune entraînées par un moteur et un réducteur de rapport r = ${FRAC("ω_roue","ω_moteur")} = ${nf(o.r,2)} (la roue tourne ${nf(1/o.r,1)} fois moins vite que le moteur) et de rendement η = ${nf(o.eta,2)}. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule l'effort de traction total que le sol doit exercer sur les roues motrices.",type:"num",ans:o.Ft,tolR:0.02,unit:"N",
        expl:`PFD en projection sur l'axe de la rampe : ${F("F − m·g·sin α − F_r = m·a")}, donc F = ${o.m} × ${nf(o.a,1)} + ${o.m} × 9,81 × sin ${o.al}° + ${o.Fr} = ${U(o.Ft,"N")}.`},
      {fig,ctx,q:"Déduis-en le couple que doit fournir chaque moteur.",type:"num",ans:o.Cm,tolR:0.02,unit:"N·m",
        expl:`Chaque roue transmet la moitié de l'effort : ${F(`C_roue = ${FRAC("F·R","2")}`)} = ${FRAC(`${nf(o.Ft,1)} × ${nf(o.R/1000,3)}`,"2")} = ${nf(o.Cw,3)} N·m. Réducteur : ${F("P_roue = η·P_m")}, soit ${F(`C_roue = ${FRAC("η·C_m","r")}`)}, donc ${F(`C_m = ${FRAC("r·C_roue","η")}`)} = ${FRAC(`${nf(o.r,2)} × ${nf(o.Cw,3)}`,nf(o.eta,2))} = ${U(o.Cm,"N·m")}.`},
      {fig,ctx,q:"L'exigence de démarrage en montée est-elle satisfaite par ces moteurs ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.Cm,3)} N·m ${ok?"≤":">"} ${nf(o.Cmax,2)} N·m : ${ok?"chaque moteur peut fournir le couple nécessaire, l'exigence est satisfaite.":"les moteurs sont sous-dimensionnés ; il faut un réducteur qui réduise davantage la vitesse (r plus petit), des moteurs plus puissants ou une accélération plus faible."}`}]; },
  /* temps de mise en vitesse d'un rotor et exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd([{n:"le volant d'inertie d'une presse mécanique",J:[20,30,40],Cm:[80,100,120,150],Cr:[10,15,20],N:[300,400,500]},{n:"la broche d'un tour à commande numérique",J:[0.05,0.08,0.1],Cm:[20,25,30],Cr:[1,2,3],N:[3000,3500,4000]},
          {n:"le rotor d'un broyeur à végétaux",J:[0.3,0.5,0.8],Cm:[20,30,40],Cr:[5,8,10],N:[2500,2800,3000]}]);
        const J=rnd(S.J), Cm=rnd(S.Cm), Cr=rnd(S.Cr), N=rnd(S.N), al=(Cm-Cr)/J, t=W(N)/al, tm=n2(t*rnd([0.75,0.85,1.15,1.3])); return {S,J,Cm,Cr,N,al,t,tm}; },o=>far(o.t,o.tm,0.06)&&(o.t<=o.tm)===want);
    const ok=o.t<=o.tm, fig=fx_dyn_rot({J:`J = ${nf(o.J,3)} kg·m²`,Cm:`C_m = ${nf(o.Cm,0)} N·m`,Cr:`C_r = ${nf(o.Cr,0)} N·m`});
    const ctx=`Au démarrage, ${o.S.n} reçoit un couple moteur constant et subit un couple résistant constant (figure). Exigence : atteindre ${nf(o.N,0)} tr/min en ${nf(o.tm,2)} s au plus depuis l'arrêt.`;
    return [{fig,ctx,q:"Détermine l'accélération angulaire imposée par les deux couples.",type:"num",ans:o.al,tolR:0.02,unit:"rad/s²",
        expl:`${F("C_m − C_r = J·α")}, donc α = ${FRAC(`${nf(o.Cm,0)} − ${nf(o.Cr,0)}`,nf(o.J,3))} = ${U(o.al,"rad/s²")}.`},
      {fig,ctx,q:`Combien de temps faut-il pour atteindre ${nf(o.N,0)} tr/min ?`,type:"num",ans:o.t,tolR:0.02,unit:"s",
        expl:`ω = ${FRAC(`2π × ${nf(o.N,0)}`,"60")} = ${nf(W(o.N),2)} rad/s ; ${F(`t = ${FRAC("ω","α")}`)} = ${FRAC(nf(W(o.N),2),nf(o.al,3))} = ${U(o.t,"s")}.`},
      {fig,ctx,q:"L'exigence de temps de démarrage est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.t,2)} s ${ok?"≤":">"} ${nf(o.tm,2)} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite : il faut un couple moteur plus grand ou une inertie plus faible."}`}]; },
  /* démarrage en montée : effort maximal, puissance maximale, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd([{n:"Une navette autonome",m:[2000,2500,3000],v:[4,5],t:[4,5,6],al:[3,4,5],fr:[200,300],u:"kW",k:1000},{n:"Un robot de livraison",m:[60,80,100],v:[1.5,2],t:[1,2],al:[5,8,10],fr:[15,20],u:"W",k:1}]);
        const m=rnd(S.m), v=rnd(S.v), t1=rnd(S.t), al=rnd(S.al), fr=rnd(S.fr), a=v/t1, Px=m*g*Math.sin(rad(al)), F1=m*a+Px+fr, P=F1*v/S.k, Pd=n2(P*rnd([0.8,0.85,1.15,1.25])); return {S,m,v,t1,al,fr,a,Px,F1,P,Pd}; },o=>far(o.P,o.Pd,0.06)&&(o.P<=o.Pd)===want);
    const ok=o.P<=o.Pd, t2=o.t1+rnd([3,4,5]), fig=profil(o.v,[o.t1,t2,t2+o.t1]);
    const ctx=`${o.S.n} (m = ${nf(o.m,0)} kg) démarre en montée sur une pente de ${o.al}° selon le profil de vitesse donné. Résistance à l'avancement : F_r = ${o.fr} N. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule l'effort de traction pendant la phase 1.",type:"num",ans:o.F1,tolR:0.02,unit:"N",
        expl:`a₁ = ${FRAC(nf(o.v,1),nf(o.t1,1))} = ${nf(o.a,3)} m/s². ${F("F = m·a₁ + m·g·sin α + F_r")} = ${nf(o.m*o.a,1)} + ${nf(o.Px,1)} + ${o.fr} = ${U(o.F1,"N")}.`},
      {fig,ctx,q:`Quelle est la puissance maximale à fournir aux roues pendant ce démarrage, en ${o.S.u} ?`,type:"num",ans:o.P,tolR:0.02,unit:o.S.u,
        expl:`${F("P = F·v")} est maximale à la fin de la phase 1, quand v atteint ${nf(o.v,1)} m/s avec l'effort de la phase 1 : P = ${nf(o.F1,1)} × ${nf(o.v,1)} = ${o.S.k>1?`${nf(o.F1*o.v,0)} W, soit ${U(o.P,"kW")}`:U(o.P,"W")}. En phase 2, a = 0 : P = (m·g·sin α + F_r)·v = ${S3((o.Px+o.fr)*o.v/o.S.k)} ${o.S.u} seulement.`},
      {fig,ctx,q:`La motorisation peut fournir au plus ${nf(o.Pd,2)} ${o.S.u} aux roues. Permet-elle ce démarrage ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${S3(o.P)} ${o.S.u} ${ok?"≤":">"} ${nf(o.Pd,2)} ${o.S.u} : ${ok?"la motorisation convient.":"la motorisation ne convient pas ; il faut accélérer moins fort en montée ou choisir une motorisation plus puissante."}`}]; },
  /* ascenseur à contrepoids */
  ()=>{ const o=draw(()=>{ const m0=rnd([700,800,900]), Q=rnd([480,630,800]), mp=m0+Q/2, a=rnd([0.5,0.8,1]), R=rnd([0.25,0.3,0.32]), mc=m0+Q;
        return {m0,Q,mp,a,R,mc,C:(mc*(g+a)-mp*(g-a))*R,C0:mc*(g+a)*R,Cv:(m0*(g+a)-mp*(g-a))*R,emp:mp*(g-a)/(m0*(g+a))}; },o=>o.emp>=1.1);
    const fig=fx_dyn_asc({tc:`m_c = ${nf(o.mc,0)} kg`,tp:`m_p = ${nf(o.mp,0)} kg`,tR:`R = ${nf(o.R,2)} m`});
    const ctx=`Ascenseur : cabine vide de ${o.m0} kg, charge nominale ${o.Q} kg, contrepoids m_p = ${nf(o.mp,0)} kg (cabine vide + moitié de la charge nominale). La poulie motrice a un rayon R = ${nf(o.R,2)} m ; son inertie et la masse des câbles sont négligées. Au démarrage, la cabine monte avec une accélération a = ${nf(o.a,1)} m/s². g = 9,81 m/s².`;
    return [{fig,ctx,q:`La cabine est à pleine charge (m_c = ${nf(o.mc,0)} kg). Quel couple moteur faut-il sur la poulie au démarrage ?`,type:"num",ans:o.C,tolR:0.02,unit:"N·m",
        expl:`Cabine (monte) : ${F("T₁ = m_c·(g + a)")} = ${nf(o.mc*(g+o.a),0)} N. Contrepoids (descend avec a) : ${F("T₂ = m_p·(g − a)")} = ${nf(o.mp*(g-o.a),0)} N. Poulie : ${F("C = (T₁ − T₂)·R")} = (${nf(o.mc*(g+o.a),0)} − ${nf(o.mp*(g-o.a),0)}) × ${nf(o.R,2)} = ${U(o.C,"N·m")}.`},
      {fig,ctx,q:"Quel couple faudrait-il sans contrepoids, dans les mêmes conditions ?",type:"num",ans:o.C0,tolR:0.02,unit:"N·m",
        expl:`Sans contrepoids : ${F("C = m_c·(g + a)·R")} = ${nf(o.mc,0)} × ${nf(g+o.a,2)} × ${nf(o.R,2)} = ${U(o.C0,"N·m")}, soit ${nf(o.C0/o.C,1)} fois plus : le contrepoids équilibre l'essentiel du poids, le moteur ne fournit que la différence et l'accélération.`},
      {fig,ctx,q:"La cabine vide démarre à son tour en montée, avec la même accélération. Que doit faire le moteur ?",type:"ch",...mc("Retenir la poulie : sans lui, le contrepoids ferait accélérer la cabine trop fort",["Fournir un couple plus grand qu'à pleine charge","Rien : le couple nécessaire est nul","Fournir le même couple qu'à pleine charge"]),
        expl:`À vide : m_c·(g + a) = ${nf(o.m0*(g+o.a),0)} N &lt; m_p·(g − a) = ${nf(o.mp*(g-o.a),0)} N. C = (T₁ − T₂)·R = −${nf(-o.Cv,0)} N·m : le couple est négatif, le moteur ${F("freine")} (il retient le contrepoids, plus lourd que la cabine vide).`}]; },
  /* repérer l'erreur dans une résolution */
  ()=>{ const v=rnd([0,1,2,3,4,5,6]); let ctx, st, bad, why;
    if(v===0){ const J=rnd([0.02,0.05,0.1]), N=rnd([1500,3000]), t=rnd([2,3,5]), Cr=rnd([0.2,0.5]), w=W(N);
      ctx=`Couple de démarrage d'un rotor (J = ${nf(J,2)} kg·m², C_r = ${nf(Cr,1)} N·m) qui atteint ${nf(N,0)} tr/min en ${t} s.`;
      st=[`α = ${FRAC("Δω","Δt")}`,`α = ${FRAC(nf(N,0),t)} = ${nf(N/t,1)} rad/s²`,`C_m = J·α + C_r = ${nf(J,2)} × ${nf(N/t,1)} + ${nf(Cr,1)} = ${nf(J*N/t+Cr,2)} N·m`]; bad=1;
      why=`ω doit être en rad/s : ω = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${nf(w,1)} rad/s, d'où α = ${nf(w/t,2)} rad/s² et C_m = ${nf(J*w/t+Cr,2)} N·m.`; }
    else if(v===1){ const J=rnd([0.2,0.3,0.5]), N=rnd([600,1000]), t=rnd([4,5,8]), Cr=rnd([1,2,3]), w=W(N);
      ctx=`Couple moteur nécessaire au démarrage d'un tambour (J = ${nf(J,1)} kg·m²) qui atteint ${nf(N,0)} tr/min en ${t} s, malgré un couple résistant C_r = ${Cr} N·m.`;
      st=[`ω = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${nf(w,2)} rad/s`,`α = ${FRAC("ω","t")} = ${nf(w/t,3)} rad/s²`,`C_m = J·α = ${nf(J,1)} × ${nf(w/t,3)} = ${nf(J*w/t,2)} N·m`]; bad=2;
      why=`Le moteur doit aussi vaincre le couple résistant : C_m − C_r = J·α, donc C_m = J·α + C_r = ${nf(J*w/t+Cr,2)} N·m.`; }
    else if(v===2){ const vk=rnd([20,25,30]), a=rnd([2,3,4]);
      ctx=`Distance de freinage d'un véhicule qui roule à ${vk} km/h et freine avec une décélération constante de ${a} m/s².`;
      st=[`v = ${vk} km/h et |a| = ${a} m/s²`,`d = ${FRAC("v²","2·|a|")} = ${FRAC(`${vk}²`,`2 × ${a}`)} = ${nf(vk*vk/(2*a),1)} m`,`Le véhicule s'arrête en ${nf(vk*vk/(2*a),1)} m.`]; bad=1;
      why=`Dans d = ${FRAC("v²","2·|a|")}, v doit être en m/s : v = ${FRAC(vk,"3,6")} = ${nf(vk/3.6,2)} m/s, d'où d = ${nf((vk/3.6)**2/(2*a),1)} m.`; }
    else if(v===3){ const m=rnd([200,300,400]), a=rnd([0.5,1]), D=rnd([200,250,300]), T=m*(g+a);
      ctx=`Couple sur le tambour d'un treuil de diamètre D = ${D} mm qui soulève ${m} kg avec une accélération de ${nf(a,1)} m/s² (inertie du tambour négligée).`;
      st=[`T = m·(g + a) = ${m} × ${nf(g+a,2)} = ${nf(T,0)} N`,`C = T·D = ${nf(T,0)} × ${nf(D/1000,2)} = ${nf(T*D/1000,0)} N·m`,`Le moteur doit fournir ce couple au tambour.`]; bad=1;
      why=`Le bras de levier est le rayon R = ${FRAC("D","2")} = ${nf(D/2000,3)} m : C = T·R = ${nf(T*D/2000,0)} N·m.`; }
    else if(v===4){ const Cw=rnd([8,10,12,15]), r=rnd([0.05,0.08,0.1]), eta=rnd([0.8,0.85,0.9]);
      ctx=`Couple d'un moteur qui entraîne une roue à travers un réducteur de rapport r = ${FRAC("ω_roue","ω_moteur")} = ${nf(r,2)} et de rendement η = ${nf(eta,2)} ; la roue demande un couple de ${Cw} N·m.`;
      st=[`C_roue = ${Cw} N·m`,`C_m = r·η·C_roue = ${nf(r,2)} × ${nf(eta,2)} × ${Cw} = ${nf(r*eta*Cw,3)} N·m`,`Le moteur doit fournir ${nf(r*eta*Cw,3)} N·m.`]; bad=1;
      why=`Le moteur doit aussi fournir les pertes : P_roue = η·P_m, soit C_roue = ${FRAC("η·C_m","r")}, donc C_m = ${FRAC("r·C_roue","η")} = ${FRAC(`${nf(r,2)} × ${Cw}`,nf(eta,2))} = ${nf(r*Cw/eta,3)} N·m.`; }
    else if(v===5){ const m=rnd([80,100,150]), p=rnd([8,10,12]), Fr=rnd([15,20]), al=Math.atan(p/100);
      ctx=`Effort de traction d'un robot de ${m} kg qui monte à vitesse constante une rampe de ${p} % (résistance au roulement ${Fr} N).`;
      st=[`α = arctan(${FRAC(p,"100")}) = ${nf(deg(al),2)}°`,`Composante du poids le long de la rampe : m·g·cos α = ${nf(m*g*Math.cos(al),1)} N`,`F = ${nf(m*g*Math.cos(al),1)} + ${Fr} = ${nf(m*g*Math.cos(al)+Fr,1)} N`]; bad=1;
      why=`La composante du poids parallèle à la rampe est m·g·sin α = ${nf(m*g*Math.sin(al),1)} N (m·g·cos α est la composante normale), d'où F = ${nf(m*g*Math.sin(al)+Fr,1)} N.`; }
    else { const m=rnd([1500,2000,2500]), vk=rnd([25,30]), d=rnd([10,15]), fr=rnd([200,300]), a=(vk/3.6)**2/(2*d);
      ctx=`Effort de freinage d'une navette de ${nf(m,0)} kg qui doit s'arrêter sur ${d} m depuis ${vk} km/h, avec des efforts résistants de ${fr} N.`;
      st=[`|a| = ${FRAC("v²","2·d")} = ${FRAC(`${nf(vk/3.6,2)}²`,`2 × ${d}`)} = ${nf(a,2)} m/s²`,`F_f = m·|a| + F_r = ${nf(m*a,0)} + ${fr} = ${nf(m*a+fr,0)} N`,`Les freins doivent exercer ${nf(m*a+fr,0)} N.`]; bad=1;
      why=`Les efforts résistants s'opposent au mouvement, comme le freinage : −F_f − F_r = m·a, donc F_f = m·|a| − F_r = ${nf(m*a-fr,0)} N.`; }
    return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
  /* freinage en descente : décélération, distance d'arrêt, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd([{n:"Une navette autonome",m:[2000,2500,3000],v:[20,25,30],al:[3,4,5,6],Ff:[5000,6000,8000],fr:[200,300],d:[8,10,12,15]},{n:"Un chariot filoguidé chargé",m:[400,600,800],v:[4,5,6],al:[2,3,4],Ff:[300,400,600],fr:[30,50],d:[0.8,1,1.2,1.5]}]);
        const m=rnd(S.m), vk=rnd(S.v), al=rnd(S.al), Ff=rnd(S.Ff), fr=rnd(S.fr), dm=rnd(S.d), v=vk/3.6, Px=m*g*Math.sin(rad(al)), a=(Ff+fr-Px)/m, d=v*v/(2*a); return {S,m,vk,al,Ff,fr,dm,v,Px,a,d}; },
      o=>o.a>=0.3&&far(o.d,o.dm,0.06)&&(o.d<=o.dm)===want);
    const ok=o.d<=o.dm, fig=fx_dyn_pente({al:o.al,alab:`α = ${o.al}°`,f:["P","N","F"],lab:{F:"F_f + F_r"},mv:1,down:1,cap:"pente exagérée sur la figure"});
    const ctx=`${o.S.n} (m = ${nf(o.m,0)} kg) descend à ${o.vk} km/h une rampe inclinée de α = ${o.al}°. En cas d'urgence, ses freins exercent un effort F_f = ${nf(o.Ff,0)} N ; les efforts résistants valent F_r = ${o.fr} N. Exigence : arrêt en moins de ${nf(o.dm,1)} m. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule la décélération pendant le freinage d'urgence.",type:"num",ans:o.a,tolR:0.02,unit:"m/s²",
        expl:`Axe x dans le sens du mouvement (vers le bas) : ${F("m·g·sin α − F_f − F_r = m·a")}. m·g·sin α = ${nf(o.Px,0)} N, donc a = ${FRAC(`${nf(o.Px,0)} − ${nf(o.Ff,0)} − ${o.fr}`,nf(o.m,0))} = −${nf(o.a,3)} m/s² : décélération ${U(o.a,"m/s²")}.`},
      {fig,ctx,q:"Quelle est la distance d'arrêt ?",type:"num",ans:o.d,tolR:0.02,unit:"m",
        expl:`v = ${FRAC(o.vk,"3,6")} = ${nf(o.v,3)} m/s ; ${F(`d = ${FRAC("v²","2·|a|")}`)} = ${FRAC(`${nf(o.v,3)}²`,`2 × ${nf(o.a,3)}`)} = ${U(o.d,"m")}.`},
      {fig,ctx,q:"L'exigence de distance d'arrêt est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.d,2)} m ${ok?"≤":">"} ${nf(o.dm,1)} m : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."} En descente, le poids s'oppose au freinage : sur le plat, on trouverait ${nf(o.v*o.v*o.m/(2*(o.Ff+o.fr)),2)} m.`}]; },
  /* portail : profil imposé par la durée d'ouverture, effort, puissance, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const m=rnd([200,250,300,400]), Lg=rnd([4,4.5,5,6]), tt=rnd([14,15,16,18,20]), tau=rnd([1,2,3]), fr=rnd([40,60,80,100]), v=Lg/(tt-tau), a=v/tau, Fm=m*a+fr, P=Fm*v, Pd=n2(P*rnd([0.8,0.85,1.15,1.25])); return {m,Lg,tt,tau,fr,v,a,Fm,P,Pd}; },
      o=>far(o.P,o.Pd,0.06)&&(o.P<=o.Pd)===want);
    const ok=o.P<=o.Pd, fig=fx_dyn_vt({pts:[[0,0],[o.tau,1],[o.tt-o.tau,1],[o.tt,0]],tm:o.tt+1,ts:1,vm:1.4,vs:0.2,ph:true,noY:true,lv:"v_max",alt:"Profil de vitesse du portail en trapèze symétrique"});
    const ctx=`Exigence : un portail coulissant de ${o.m} kg doit s'ouvrir de ${nf(o.Lg,1)} m en ${o.tt} s. Le profil de vitesse est un trapèze : accélération et freinage durent chacun ${o.tau} s. Les frottements des galets valent F_r = ${o.fr} N.`;
    return [{fig,ctx,q:"Calcule la vitesse maximale v_max du portail.",type:"num",ans:o.v,tolR:0.02,unit:"m/s",
        expl:`La distance parcourue est l'aire sous v(t) : ${F("L = v_max·(t_total − τ)")} (trapèze de grande base ${o.tt} s et de petite base ${o.tt-2*o.tau} s). v_max = ${FRAC(nf(o.Lg,1),`${o.tt} − ${o.tau}`)} = ${U(o.v,"m/s")}.`},
      {fig,ctx,q:"Quel effort moteur faut-il pendant la phase d'accélération ?",type:"num",ans:o.Fm,tolR:0.02,unit:"N",
        expl:`a = ${FRAC(nf(o.v,4),o.tau)} = ${nf(o.a,4)} m/s². ${F("F = m·a + F_r")} = ${o.m} × ${nf(o.a,4)} + ${o.fr} = ${U(o.Fm,"N")}.`},
      {fig,ctx,q:`Le motoréducteur peut fournir au plus ${nf(o.Pd,2)} W au pignon qui entraîne la crémaillère. Convient-il ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`La puissance est maximale à la fin de l'accélération : ${F("P = F·v_max")} = ${nf(o.Fm,1)} × ${nf(o.v,4)} = ${nf(o.P,1)} W ${ok?"≤":">"} ${nf(o.Pd,2)} W : ${ok?"le motoréducteur convient.":"le motoréducteur ne convient pas."}`}]; },
  /* modèle et essai : durée de démarrage, écart relatif, conclusion */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd([{n:"le tambour d'un lave-linge",J:[0.15,0.2,0.25],Cm:[3,4,5],Cr:[0.5,1],N:[800,1000]},{n:"la broche d'une perceuse à colonne",J:[0.004,0.006,0.008],Cm:[1,1.5,2],Cr:[0.1,0.2],N:[1500,2000,2500]},
          {n:"le plateau d'un tour de potier",J:[0.1,0.15,0.2],Cm:[1,1.5,2],Cr:[0.2,0.3],N:[150,200,250]}]);
        const J=rnd(S.J), Cm=rnd(S.Cm), Cr=rnd(S.Cr), N=rnd(S.N), t=J*W(N)/(Cm-Cr), tmes=Number((t*(1+rnd([0.02,0.03,0.04,0.06,0.08,0.1,0.12,0.15]))).toPrecision(3)), disp=rnd([3,5,8]), er=Math.abs(tmes-t)/tmes*100;
        return {S,J,Cm,Cr,N,t,tmes,disp,er}; },o=>far(o.er,o.disp,0.2)&&o.er>=0.5&&(o.er<o.disp)===want);
    const inside=o.er<o.disp, ctx=`Modèle du démarrage ${deA(o.S.n)} : J = ${nf(o.J,3)} kg·m², couple moteur constant C_m = ${nf(o.Cm,1)} N·m, couple résistant constant C_r = ${nf(o.Cr,1)} N·m. Sur le prototype, ${nf(o.N,0)} tr/min sont atteints en ${nf(o.tmes,3)} s (moyenne des essais, dispersion ± ${o.disp} %).`;
    return [{ctx,q:`Quelle durée le modèle prévoit-il pour atteindre ${nf(o.N,0)} tr/min ?`,type:"num",ans:o.t,tolR:0.02,unit:"s",
        expl:`α = ${FRAC("C_m − C_r","J")} = ${nf((o.Cm-o.Cr)/o.J,3)} rad/s² ; ω = ${nf(W(o.N),2)} rad/s ; ${F(`t = ${FRAC("J·ω","C_m − C_r")}`)} = ${U(o.t,"s")}.`},
      {ctx,q:"Calcule l'écart relatif entre le modèle et l'essai, en prenant la mesure comme référence.",type:"num",ans:o.er,tolR:0.03,tolA:0.15,unit:"%",
        expl:`${F(`écart = ${FRAC("|t_modèle − t_mesure|","t_mesure")} × 100`)} = ${FRAC(`|${nf(o.t,3)} − ${nf(o.tmes,3)}|`,nf(o.tmes,3))} × 100 = ${U(o.er,"%")}.`},
      {ctx,q:"Que peut-on conclure ?",type:"ch",ch:["Les essais ne mettent pas le modèle en défaut","Le modèle est mis en défaut : il sous-estime la durée du démarrage"],ok:inside?0:1,
        expl:inside?`L'écart (${nf(o.er,1)} %) est inférieur à la dispersion des essais (${o.disp} %) : les essais ne mettent pas le modèle en défaut.`:`L'écart (${nf(o.er,1)} %) dépasse la dispersion des essais (${o.disp} %) : le démarrage réel est plus lent que prévu. Le modèle néglige par exemple l'inertie du rotor du moteur et de la transmission, ou un couple résistant qui augmente avec la vitesse.`}]; },
  /* kart électrique : effort maximal, accélération, exigence 0 → v */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const m=rnd([150,170,190,210]), C=rnd([15,18,20,25]), r=rnd([0.2,0.22,0.25,0.28,0.3]), eta=rnd([0.9,0.92,0.95]), R=rnd([0.13,0.14]), fr=rnd([30,40,50]), vk=rnd([40,50]), tq=rnd([3,4,5,6]);
        const Cw=eta*C/r, Fm=Cw/R, a=(Fm-fr)/m, t=vk/3.6/a; return {m,C,r,eta,R,fr,vk,tq,Cw,Fm,a,t}; },o=>o.a>0.5&&far(o.t,o.tq,0.06)&&(o.t<=o.tq)===want);
    const ok=o.t<=o.tq, fig=fx_dyn_chaine({b:[{t:["Moteur"],v:[`C_max = ${o.C} N·m`]},{t:["Transmission","par chaîne"],v:[`r = ${nf(o.r,2)}`,`η = ${nf(o.eta,2)}`]},{t:["Roues arrière"],v:[`R = ${nf(o.R*1000,0)} mm`]}]});
    const ctx=`Kart électrique (m = ${o.m} kg avec le pilote) sur piste plane. Le moteur délivre au plus C_max = ${o.C} N·m, transmis aux roues arrière par une chaîne de rapport de réduction r = ${FRAC("ω_roues","ω_moteur")} = ${nf(o.r,2)} et de rendement η = ${nf(o.eta,2)}. Résistances à l'avancement : F_r = ${o.fr} N. Exigence : passer de 0 à ${o.vk} km/h en ${o.tq} s au plus.`;
    return [{fig,ctx,q:"Quel effort de traction maximal les roues peuvent-elles exercer ?",type:"num",ans:o.Fm,tolR:0.02,unit:"N",
        expl:`Couple sur les roues : ${F(`C_roues = ${FRAC("η·C_max","r")}`)} = ${FRAC(`${nf(o.eta,2)} × ${o.C}`,nf(o.r,2))} = ${nf(o.Cw,2)} N·m. ${F(`F = ${FRAC("C_roues","R")}`)} = ${FRAC(nf(o.Cw,2),nf(o.R,2))} = ${U(o.Fm,"N")}.`},
      {fig,ctx,q:"Déduis-en l'accélération maximale du kart.",type:"num",ans:o.a,tolR:0.02,unit:"m/s²",
        expl:`${F("F − F_r = m·a")}, donc a = ${FRAC(`${nf(o.Fm,1)} − ${o.fr}`,o.m)} = ${U(o.a,"m/s²")}.`},
      {fig,ctx,q:"En supposant cette accélération constante jusqu'à la vitesse visée, l'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`v = ${FRAC(o.vk,"3,6")} = ${nf(o.vk/3.6,2)} m/s ; ${F(`t = ${FRAC("v","a")}`)} = ${FRAC(nf(o.vk/3.6,2),nf(o.a,3))} = ${nf(o.t,2)} s ${ok?"≤":">"} ${o.tq} s : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."} En réalité, le couple disponible baisse à haute vitesse : cette estimation est optimiste.`}]; },
  /* pirogue électrique : accélération au départ, vitesse maximale, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const m=rnd([400,500,600,800]), Tp=rnd([300,400,500,600]), k=rnd([15,20,25,30,40]), rq=rnd([6,7,8,9,10]); const a0=Tp/m, v=Math.sqrt(Tp/k), nd=v*3.6/1.852; return {m,Tp,k,rq,a0,v,nd}; },
      o=>far(o.nd,o.rq,0.05)&&(o.nd>=o.rq)===want);
    const ok=o.nd>=o.rq, ctx=`Une pirogue à moteur électrique (m = ${o.m} kg avec ses passagers) démarre sur le lagon. L'hélice exerce une poussée constante T = ${o.Tp} N ; la résistance de l'eau vaut R = k·v², avec k = ${o.k} N·s²/m². 1 nœud = 1,852 km/h.`;
    return [{ctx,q:"Calcule l'accélération de la pirogue au démarrage.",type:"num",ans:o.a0,tolR:0.02,unit:"m/s²",
        expl:`Au démarrage, v = 0 donc R = 0 : ${F("T = m·a₀")}, a₀ = ${FRAC(o.Tp,o.m)} = ${U(o.a0,"m/s²")}. Ensuite R augmente avec v et l'accélération diminue.`},
      {ctx,q:"Quelle vitesse maximale, en nœuds, la pirogue peut-elle atteindre ?",type:"num",ans:o.nd,tolR:0.02,unit:"nœuds",
        expl:`La vitesse se stabilise quand a = 0 : ${F("T = k·v²")}, donc ${F(`v = √(${FRAC("T","k")})`)} = √(${FRAC(o.Tp,o.k)}) = ${nf(o.v,3)} m/s, soit ${nf(o.v*3.6,2)} km/h et ${FRAC(nf(o.v*3.6,2),"1,852")} = ${U(o.nd,"nœuds")}.`},
      {ctx,q:`Exigence : naviguer à au moins ${o.rq} nœuds. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.nd,2)} nœuds ${ok?"≥":"&lt;"} ${o.rq} nœuds : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut une poussée plus grande ou une coque plus fine (k plus petit)."} La masse ne change pas la vitesse maximale, seulement le temps pour l'atteindre.`}]; },
  /* treuil : inertie du tambour, hypothèse du modèle */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const m=rnd([200,300,500,800]), a=rnd([0.3,0.5,0.8]), R=rnd([0.12,0.15,0.2,0.25]), Jt=rnd([1,2,4,6,8]); const Tn=m*(g+a), CT=Tn*R, CJ=Jt*a/R, C=CT+CJ, pc=CJ/C*100; return {m,a,R,Jt,Tn,CT,CJ,C,pc}; },
      o=>far(o.pc,5,0.2)&&(o.pc<5)===want);
    const neg=o.pc<5, fig=fx_dyn_treuil({tc:`m = ${o.m} kg`,tt:`J = ${o.Jt} kg·m²`,tR:`R = ${nf(o.R*1000,0)} mm`,a:1});
    const ctx=`Un treuil soulève une charge de ${o.m} kg avec une accélération a = ${nf(o.a,1)} m/s². Le tambour a un rayon R = ${nf(o.R*1000,0)} mm ; le moment d'inertie de l'ensemble en rotation (tambour, réducteur et rotor du moteur), ramené à l'axe du tambour, vaut J = ${o.Jt} kg·m². Le câble ne glisse pas : α = ${FRAC("a","R")}. g = 9,81 m/s².`;
    return [{fig,ctx,q:"Calcule la tension du câble.",type:"num",ans:o.Tn,tolR:0.02,unit:"N",
        expl:`${F("T = m·(g + a)")} = ${o.m} × ${nf(g+o.a,2)} = ${U(o.Tn,"N")}.`},
      {fig,ctx,q:"En tenant compte de cette inertie, quel couple faut-il appliquer sur l'axe du tambour ?",type:"num",ans:o.C,tolR:0.02,unit:"N·m",
        expl:`PFD en rotation autour de l'axe du tambour : ${F("C − T·R = J·α")} avec α = ${FRAC(nf(o.a,1),nf(o.R,2))} = ${nf(o.a/o.R,3)} rad/s². C = ${nf(o.CT,1)} + ${o.Jt} × ${nf(o.a/o.R,3)} = ${nf(o.CT,1)} + ${nf(o.CJ,2)} = ${U(o.C,"N·m")}.`},
      {fig,ctx,q:"On accepte de négliger un effet s'il représente moins de 5 % du couple. Peut-on négliger l'inertie de l'ensemble en rotation ?",type:"ch",ch:["Oui, elle représente moins de 5 % du couple","Non, elle représente plus de 5 % du couple"],ok:neg?0:1,
        expl:`Part due à l'inertie : ${FRAC(nf(o.CJ,2),nf(o.C,1))} × 100 = ${nf(o.pc,1)} % ${neg?"&lt;":">"} 5 % : ${neg?"on peut la négliger ; la charge impose l'essentiel du couple.":"on ne peut pas la négliger : avec une charge légère et un petit tambour, l'inertie ramenée (surtout celle du rotor, multipliée par le réducteur) pèse lourd."}`}]; },
  /* arrêt d'une charge en descente : piège T > P, tension, frein */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd([{n:"Un palan électrique",m:[200,300,500],R:[80,100,120]},{n:"Le treuil d'une grue de quai",m:[800,1000,1500],R:[150,200]}]);
        const m=rnd(S.m), R=rnd(S.R), v=rnd([0.2,0.3,0.4,0.5]), t=rnd([0.5,0.8,1]), a=v/t, Tn=m*(g+a), C=Tn*R/1000, Cb=n2(C*rnd([0.8,0.9,1.1,1.25])); return {S,m,R,v,t,a,Tn,C,Cb}; },
      o=>far(o.C,o.Cb,0.06)&&(o.C<=o.Cb)===want);
    const ok=o.C<=o.Cb, ctx=`${o.S.n} descend une charge de ${nf(o.m,0)} kg à ${nf(o.v,1)} m/s, puis l'arrête en ${nf(o.t,1)} s avec une décélération constante. Le câble s'enroule sur un tambour de rayon R = ${o.R} mm dont l'inertie est négligée. g = 9,81 m/s².`;
    return [{ctx,q:"Pendant l'arrêt, comment se compare la tension du câble au poids de la charge ?",type:"ch",...mc("T > m·g : l'accélération de la charge est dirigée vers le haut",["T &lt; m·g, car la charge descend","T = m·g, car la charge descend lentement","T = 0 pendant l'arrêt"]),
        expl:`La charge descend de plus en plus lentement : son accélération est dirigée ${F("vers le haut")}. Axe vertical vers le haut : T − m·g = m·a avec a > 0, donc T > m·g. Le sens de l'accélération, pas celui du mouvement, fixe le signe.`},
      {ctx,q:"Calcule la tension du câble pendant l'arrêt.",type:"num",ans:o.Tn,tolR:0.02,unit:"N",
        expl:`a = ${FRAC(nf(o.v,1),nf(o.t,1))} = ${nf(o.a,3)} m/s², vers le haut. ${F("T = m·(g + a)")} = ${nf(o.m,0)} × (9,81 + ${nf(o.a,3)}) = ${U(o.Tn,"N")}.`},
      {ctx,q:`Le frein du tambour peut exercer au plus ${nf(o.Cb,2)} N·m. Peut-il assurer cet arrêt ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`Couple de freinage nécessaire : ${F("C = T·R")} = ${nf(o.Tn,1)} × ${nf(o.R/1000,3)} = ${nf(o.C,1)} N·m ${ok?"≤":">"} ${nf(o.Cb,2)} N·m : ${ok?"le frein suffit.":"le frein ne suffit pas ; il faut freiner plus progressivement ou un frein plus puissant."}`}]; }
];

POOLS["meca-dynamique"]={
  titre:"PFD en translation et rotation",
  fiche:{t:"Principe fondamental de la dynamique",l:[
    `Translation : ${F("ΣF = m·a")} sur l'axe du mouvement ; en montée : ${F("F = m·a + m·g·sin α + F_r")}.`,
    `Profil en trapèze : ${F(`a = ${FRAC("Δv","Δt")}`)} sur chaque phase, distance = aire sous v(t) ; arrêt depuis v : ${F(`d = ${FRAC("v²","2·|a|")}`)}.`,
    `Rotation autour d'un axe fixe : ${F("C_m − C_r = J·α")}, avec ${F(`α = ${FRAC("Δω","Δt")}`)} et ω en rad/s.`,
    `Réducteur de rapport r = ${FRAC("ω_s","ω_e")} (r &lt; 1) et de rendement η : ${F("P_s = η·P_e")}, d'où ${F(`C_s = ${FRAC("η·C_e","r")}`)} ; puissance ${F("P = C·ω")}, maximale en fin de démarrage.`,
    `Pièges : tr/min → rad/s (× ${FRAC("2π","60")}), km/h → m/s, pente de p % : tan α = ${FRAC("p","100")} (et non α = p°), rayon (pas diamètre) en m, oublier m·g·sin α ou C_r, multiplier par η au lieu de diviser pour le couple moteur.`]},
  count:{1:4,2:4,3:3},1:DY1,2:DY2,3:DY3};

/* ======================================================================
   GRAVITATION, SATELLITES — phy-gravitation
   ====================================================================== */
const Gc=6.67e-11, GTX="6,67 × 10<sup>−11</sup>", GTXT=`G = ${GTX} N·m²/kg²`;
/* astres : article, « de … », nom court, masse (kg), rayon (m), écritures de M, altitudes d'orbites basses (km) */
const AST={
  T:{n:"la Terre",de:"de la Terre",au:"autour de la Terre",N:"Terre",M:5.97e24,R:6370e3,dM:`5,97 × 10<sup>24</sup>`,dR:"6 370 km",h:[400,500,550,600,700,800,1000,1200],g:9.81},
  L:{n:"la Lune",de:"de la Lune",au:"autour de la Lune",N:"Lune",M:7.35e22,R:1740e3,dM:`7,35 × 10<sup>22</sup>`,dR:"1 740 km",h:[50,80,100,120,150,200],g:1.62},
  M:{n:"Mars",de:"de Mars",au:"autour de Mars",N:"Mars",M:6.42e23,R:3390e3,dM:`6,42 × 10<sup>23</sup>`,dR:"3 390 km",h:[250,300,350,400,500],g:3.71}};
const datA=(A,noR)=>`${A.N} : masse M = ${A.dM} kg${noR?"":`, rayon R = ${A.dR}`}. ${GTXT}.`;
const KA=()=>rnd(["T","T","L","M"]);                                       /* la Terre un peu plus souvent */
const vOrb=(A,r)=>Math.sqrt(Gc*A.M/r), TOrb=(A,r)=>2*Math.PI*Math.sqrt(r**3/(Gc*A.M));
const SATN={T:["un satellite d'observation","un satellite de télécommunication","une station spatiale habitée","un nanosatellite"],L:["une sonde en orbite lunaire","un satellite relais lunaire"],M:["une sonde en orbite martienne","un satellite relais martien"]};
const km=x=>`${nf(x/1000,0)} km`;

const GR1=[
  /* loi de gravitation universelle, distance entre centres donnée */
  ()=>{ const k=KA(), A=AST[k], m=rnd({T:[500,800,1200,2000,4000],L:[300,500,800],M:[400,700,1000,2500]}[k]), dk=rnd({T:[7000,8000,10000,15000,26600,42200],L:[1800,1900,2000,2500],M:[3700,4000,5000,9400]}[k]), d=dk*1000, Fv=Gc*m*A.M/(d*d);
    return {ctx:`Une sonde de masse m = ${nf(m,0)} kg se trouve à d = ${nf(dk,0)} km du centre ${A.de}. ${datA(A,1)}`,
      q:`Calcule la force de gravitation exercée par ${A.n} sur la sonde.`,type:"num",ans:Fv,tolR:0.02,unit:"N",
      expl:`d = ${nf(dk,0)} km = ${sci(d)} m. ${F(`F = ${FRAC("G·m·M","d²")}`)} = ${FRAC(`${GTX} × ${nf(m,0)} × ${A.dM}`,`(${sci(d)})²`)} = ${U(Fv,"N")}. La distance se prend entre les centres, en mètres.`}; },
  /* flèches : force, vitesse, accélération */
  ()=>{ const k=KA(), A=AST[k], num=shuffle(["in","out","fw","bw"]), a=rnd([-30,-15,0,15,30,150,165,180,195,210]), w=rnd(["F","v","a"]), ok=num.indexOf(w==="v"?"fw":"in");
    const Q={F:`Quelle flèche représente la force de gravitation exercée par ${A.n} sur le satellite S ?`,v:"Quelle flèche représente le vecteur vitesse du satellite S ?",a:"Quelle flèche représente le vecteur accélération du satellite S ?"}[w];
    return {fig:fx_grav_orbite({nm:A.N,a,num}),ctx:`Le satellite S décrit une orbite circulaire ${A.au} ; la flèche courbe indique le sens de parcours.`,q:Q,type:"ch",ch:["Flèche 1","Flèche 2","Flèche 3","Flèche 4"],ok,grid:true,
      expl:`La force de gravitation est attractive : elle est dirigée de S vers le centre O ${A.de} (flèche ${num.indexOf("in")+1}). C'est la seule force : d'après la 2e loi de Newton, l'accélération a la même direction et le même sens, elle est ${F("centripète")}. La vitesse est tangente à l'orbite, dans le sens de parcours (flèche ${num.indexOf("fw")+1}). Réponse : ${F(`flèche ${ok+1}`)}.`}; },
  /* effet d'un paramètre sur la force */
  ()=>{ const v=rnd([0,1,2,3]), k=rnd([2,3]);
    const C=[[`On multiplie par ${k} la distance entre les centres de deux corps. Que devient la force de gravitation entre eux ?`,`Elle est divisée par ${k*k}`,`F est inversement proportionnelle au carré de la distance : d × ${k} ⇒ F divisée par ${k}² = ${k*k}.`],
      [`Une sonde ${k} fois plus lourde est placée au même endroit. Que devient la force de gravitation exercée sur elle ?`,`Elle est multipliée par ${k}`,`F est proportionnelle à la masse m de la sonde : m × ${k} ⇒ F × ${k}.`],
      ["Un satellite, d'abord posé au sol, est placé en orbite à une altitude égale au rayon terrestre (h = R). Par rapport à sa valeur au sol, que devient la force de gravitation exercée sur lui par la Terre ?","Elle est divisée par 4","La distance au centre passe de R à R + h = 2R : elle double, donc F est divisée par 2² = 4."],
      [`On multiplie par ${k} la masse de chacun des deux corps, sans changer leur distance. Que devient la force de gravitation ?`,`Elle est multipliée par ${k*k}`,`F est proportionnelle au produit m·M : chaque masse est multipliée par ${k}, donc F × ${k}² = ${k*k}.`]][v];
    const kk=v===2?2:k, all=[`Elle est multipliée par ${kk}`,`Elle est divisée par ${kk}`,`Elle est multipliée par ${kk*kk}`,`Elle est divisée par ${kk*kk}`,"Elle ne change pas"];
    return {q:C[0],type:"ch",...mc(C[1],all.filter(x=>x!==C[1]).slice(0,3)),expl:`${HL(C[1])}. ${C[2]} ${F(`F = ${FRAC("G·m·M","d²")}`)}.`}; },
  /* champ de gravitation à la surface */
  ()=>{ const k=rnd(["T","L","M"]), A=AST[k], g0=Gc*A.M/(A.R*A.R);
    return {ctx:datA(A),q:`Calcule l'intensité du champ de gravitation à la surface ${A.de}.`,type:"num",ans:g0,tolR:0.02,unit:"m/s²",
      expl:`À la surface, la distance au centre vaut R = ${A.dR} = ${sci(A.R)} m. ${F(`g₀ = ${FRAC("G·M","R²")}`)} = ${FRAC(`${GTX} × ${A.dM}`,`(${sci(A.R)})²`)} = ${U(g0,"m/s²")} (ou N/kg).`}; },
  /* poids sur un autre astre */
  ()=>{ const S=rnd([{n:"Un rover d'exploration",m:[180,350,900,1025]},{n:"Un astronaute équipé de sa combinaison",m:[140,160,180]},{n:"Un atterrisseur",m:[300,600,800]}]), k=rnd(["L","M"]), A=AST[k], m=rnd(S.m), P=m*A.g;
    return {ctx:`${S.n} a une masse m = ${nf(m,0)} kg. À la surface ${A.de}, g = ${nf(A.g,2)} N/kg ; sur Terre, g = 9,81 N/kg.`,q:`Quel est son poids à la surface ${A.de} ?`,type:"num",ans:P,tolR:0.02,unit:"N",
      expl:`${F("P = m·g")} = ${nf(m,0)} × ${nf(A.g,2)} = ${U(P,"N")}, contre ${nf(m*9.81,0)} N sur Terre. La masse (${nf(m,0)} kg) ne change pas : seul le poids dépend de l'astre.`}; },
  /* vitesse orbitale, rayon de l'orbite donné */
  ()=>{ const k=KA(), A=AST[k], rk=rnd({T:[6800,7000,7200,7500,8000,10000],L:[1800,1850,1900,2000],M:[3650,3700,3800,4000]}[k]), r=rk*1000, v=vOrb(A,r);
    return {ctx:`Un satellite décrit une orbite circulaire de rayon r = ${nf(rk,0)} km (distance au centre ${A.de}). ${datA(A,1)}`,q:"Calcule sa vitesse sur l'orbite, en km/s.",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
      expl:`${F(`v = √(${FRAC("G·M","r")})`)} = √(${FRAC(`${GTX} × ${A.dM}`,sci(r))}) = ${nf(v,0)} m/s, soit ${U(v/1000,"km/s")}.`}; },
  /* période à partir du rayon et de la vitesse */
  ()=>{ const k=KA(), A=AST[k], rk=rnd({T:[6800,7000,7500,8000,26600],L:[1800,1850,1900,2000],M:[3650,3700,3800,4000]}[k]), vk=Number((vOrb(A,rk*1000)/1000).toPrecision(3)), T=2*Math.PI*rk/vk, inH=T>=10800;
    return {ctx:`Un satellite décrit une orbite circulaire ${A.au}, de rayon r = ${nf(rk,0)} km, à la vitesse v = ${nf(vk,3)} km/s.`,q:`Calcule sa période de révolution, en ${inH?"heures":"minutes"}.`,type:"num",ans:inH?T/3600:T/60,tolR:0.02,unit:inH?"h":"min",
      expl:`En un tour, le satellite parcourt le périmètre 2π·r à la vitesse v : ${F(`T = ${FRAC("2π·r","v")}`)} = ${FRAC(`2π × ${nf(rk,0)}`,nf(vk,3))} = ${nf(T,0)} s, soit ${inH?U(T/3600,"h"):U(T/60,"min")}.`}; },
  /* satellite géostationnaire : conditions */
  ()=>{ const m=mc("Une orbite circulaire dans le plan de l'équateur, parcourue dans le sens de rotation de la Terre, en 23 h 56 min",["Une orbite qui passe au-dessus des deux pôles, parcourue en 24 h","Une orbite circulaire quelconque, parcourue en 12 h","Une vitesse nulle dans le référentiel géocentrique, à 36 000 km d'altitude"]);
    return {q:"Un satellite géostationnaire reste toujours à la verticale du même point de la Terre. Quelles conditions son orbite doit-elle remplir ?",type:"ch",...m,
      expl:`Pour rester au-dessus du même point, le satellite doit tourner avec la Terre : même sens, même période que la rotation propre de la Terre (${F("23 h 56 min")}, jour sidéral), et orbite dans le plan équatorial. La 3e loi de Kepler impose alors r ≈ 42 200 km, soit une altitude d'environ 36 000 km. Dans le référentiel géocentrique, il n'est pas immobile : il tourne.`}; },
  /* 3e loi de Kepler : expression */
  ()=>{ const m=mc(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`,[`${FRAC("T²","r³")} = ${FRAC("G·M","4π²")}`,`${FRAC("T³","r²")} = ${FRAC("4π²","G·M")}`,`${FRAC("T","r")} = ${FRAC("2π","G·M")}`]);
    return {q:"Pour un satellite en orbite circulaire de rayon r autour d'un astre de masse M, quelle relation traduit la 3e loi de Kepler (T : période) ?",type:"ch",...m,
      expl:`Avec ${F(`v = √(${FRAC("G·M","r")})`)} et ${F(`T = ${FRAC("2π·r","v")}`)} : T² = ${FRAC("4π²·r²","v²")} = ${FRAC("4π²·r³","G·M")}, donc ${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)} : ce rapport est le même pour tous les satellites d'un même astre.`}; },
  /* la masse du satellite n'intervient pas */
  ()=>{ const m1=rnd([150,300,500]), m2=rnd([2000,3000,5000]), w=rnd(["vitesses","périodes"]);
    const m=mc(`Elles sont égales : elles ne dépendent pas de la masse du satellite`,[`Le satellite de ${nf(m2,0)} kg a ${w==="vitesses"?"la plus grande vitesse":"la plus grande période"}`,`Le satellite de ${m1} kg a ${w==="vitesses"?"la plus grande vitesse":"la plus grande période"}`,"On ne peut pas conclure sans connaître leurs dimensions"]);
    return {q:`Deux satellites de ${m1} kg et de ${nf(m2,0)} kg décrivent la même orbite circulaire autour de la Terre. Compare leurs ${w}.`,type:"ch",...m,
      expl:`La 2e loi de Newton donne m·a = ${FRAC("G·m·M","r²")} : la masse m du satellite se simplifie. ${F(`v = √(${FRAC("G·M","r")})`)} et T ne dépendent que de la masse M de l'astre et du rayon r de l'orbite.`}; },
  /* accélération d'un satellite */
  ()=>{ const k=KA(), A=AST[k], h=rnd(A.h), r=A.R+h*1000, vk=Number((vOrb(A,r)/1000).toPrecision(3)), a=(vk*1000)**2/r;
    return {ctx:`Un satellite décrit une orbite circulaire ${A.au} à la vitesse v = ${nf(vk,3)} km/s, sur une orbite de rayon r = ${nf(r/1000,0)} km.`,q:"Calcule la valeur de son accélération.",type:"num",ans:a,tolR:0.02,unit:"m/s²",
      expl:`Mouvement circulaire uniforme : l'accélération est centripète, ${F(`a = ${FRAC("v²","r")}`)} = ${FRAC(`(${nf(vk*1000,0)})²`,sci(r))} = ${U(a,"m/s²")}. C'est aussi la valeur du champ de gravitation à cette distance : le satellite est en chute libre permanente.`}; },
  /* orbite plus haute : vitesse et période */
  ()=>{ const up=Math.random()<0.5;
    const ok=up?"Sa vitesse diminue et sa période augmente":"Sa vitesse augmente et sa période diminue", all=["Sa vitesse diminue et sa période augmente","Sa vitesse augmente et sa période diminue","Sa vitesse et sa période augmentent","Sa vitesse et sa période ne changent pas"];
    return {q:`Un satellite passe d'une orbite circulaire à une autre orbite circulaire ${up?"plus haute":"plus basse"}. Que deviennent sa vitesse et sa période ?`,type:"ch",...mc(ok,all.filter(x=>x!==ok)),
      expl:`${F(`v = √(${FRAC("G·M","r")})`)} diminue quand r augmente, et ${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)} : T augmente avec r. Sur une orbite ${up?"plus haute":"plus basse"}, ${ok.charAt(0).toLowerCase()+ok.slice(1)} : les satellites bas font le tour de la Terre en 1 h 30 environ, les géostationnaires en près de 24 h.`}; }
];

/* satellites nommés et masses plausibles (kg) */
const SATM={T:[["Un satellite d'observation",[800,1200,2000]],["Un satellite de télécommunication",[2000,3500,5000]],["Un nanosatellite",[5,10,20]],["Un satellite météorologique",[1500,2500]]],
  L:[["Une sonde lunaire",[500,1000,1600]]],M:[["Une sonde martienne",[700,1000,2500]]]};
/* lunes réelles : astre, lune, rayon de l'orbite (km), période (s), puissance de 10 de la masse de l'astre */
const LUNES=[{a:"Mars",l:"Phobos",r:9380,T:27540,Tt:"7 h 39 min",e:23},{a:"la Terre",l:"la Lune",r:384400,T:2358720,Tt:"27,3 jours",e:24},{a:"Jupiter",l:"Io",r:421700,T:152842,Tt:"1,769 jour",e:27},{a:"Saturne",l:"Titan",r:1221900,T:1378080,Tt:"15,95 jours",e:26}];

const GR2=[
  /* force de gravitation à une altitude donnée */
  ()=>{ const k=KA(), A=AST[k], S=rnd(SATM[k]), m=rnd(S[1]), h=rnd(A.h), d=A.R+h*1000, Fv=Gc*m*A.M/(d*d);
    return {ctx:`${S[0]} de masse m = ${nf(m,0)} kg est en orbite à l'altitude h = ${nf(h,0)} km. ${datA(A)}`,q:`Calcule la force de gravitation exercée par ${A.n} sur ${k==="T"?"ce satellite":"cette sonde"}.`,type:"num",ans:Fv,tolR:0.02,unit:"N",
      expl:`Distance au centre : ${F("d = R + h")} = ${A.dR} + ${nf(h,0)} km = ${nf(d/1000,0)} km = ${sci(d)} m. ${F(`F = ${FRAC("G·m·M","d²")}`)} = ${FRAC(`${GTX} × ${nf(m,0)} × ${A.dM}`,`(${sci(d)})²`)} = ${U(Fv,"N")}. Piège : d n'est pas l'altitude h.`}; },
  /* champ de gravitation en altitude, puis part du champ au sol */
  ()=>{ const k=KA(), A=AST[k], h=rnd(A.h), r=A.R+h*1000, gh=Gc*A.M/(r*r), p=100*(A.R/r)**2;
    const ctx=`${k==="T"?"Une station spatiale":"Une sonde"} est en orbite à l'altitude h = ${nf(h,0)} km. ${datA(A)}`;
    return [{ctx,q:"Calcule l'intensité du champ de gravitation à cette altitude.",type:"num",ans:gh,tolR:0.02,unit:"m/s²",
        expl:`${F(`g(h) = ${FRAC("G·M","(R + h)²")}`)} = ${FRAC(`${GTX} × ${A.dM}`,`(${sci(r)})²`)} = ${U(gh,"m/s²")}.`},
      {ctx,q:"Quel pourcentage du champ de gravitation à la surface cela représente-t-il ?",type:"num",ans:p,tolR:0.02,unit:"%",
        expl:`${F(`${FRAC("g(h)","g₀")} = (${FRAC("R","R + h")})²`)} = (${FRAC(nf(A.R/1000,0),nf(r/1000,0))})² = ${nf(p/100,4)}, soit ${U(p,"%")}. Le champ est encore fort : ${k==="T"?"les astronautes flottent parce qu'ils sont en chute libre avec la station, pas parce que la gravitation a disparu":"la sonde est en chute libre permanente autour de l'astre"}.`}]; },
  /* vitesse d'une sonde autour de la Lune ou de Mars */
  ()=>{ const k=rnd(["L","M"]), A=AST[k], h=rnd(A.h), r=A.R+h*1000, v=vOrb(A,r);
    return {fig:fx_grav_orbite({nm:A.N,a:rnd([20,35,145,160]),arr:["F","v"],Rh:1}),ctx:`Une sonde décrit une orbite circulaire ${A.au}, à l'altitude h = ${nf(h,0)} km. ${datA(A)}`,q:"Calcule la vitesse de la sonde sur son orbite, en km/s.",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
      expl:`r = R + h = ${nf(r/1000,0)} km = ${sci(r)} m. ${F(`v = √(${FRAC("G·M","r")})`)} = √(${FRAC(`${GTX} × ${A.dM}`,sci(r))}) = ${nf(v,0)} m/s, soit ${U(v/1000,"km/s")}.`}; },
  /* satellite terrestre : vitesse, puis période */
  ()=>{ const A=AST.T, S=rnd(SATM.T), h=rnd(A.h), r=A.R+h*1000, v=vOrb(A,r), vk=Number((v/1000).toPrecision(3)), T=2*Math.PI*r/(vk*1000);
    const ctx=`${S[0]} décrit une orbite circulaire à l'altitude h = ${nf(h,0)} km. ${datA(A)}`;
    return [{ctx,q:"Calcule la vitesse du satellite sur son orbite, en km/s.",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
        expl:`r = R + h = ${nf(r/1000,0)} km. ${F(`v = √(${FRAC("G·M","r")})`)} = √(${FRAC(`${GTX} × ${A.dM}`,sci(r))}) = ${U(v/1000,"km/s")}.`},
      {ctx,q:"Déduis-en sa période de révolution, en minutes.",type:"num",ans:T/60,tolR:0.02,unit:"min",
        expl:`${F(`T = ${FRAC("2π·r","v")}`)} = ${FRAC(`2π × ${sci(r)}`,nf(vk*1000,0))} = ${nf(T,0)} s, soit ${U(T/60,"min")}.`}]; },
  /* 3e loi de Kepler : période à partir du rayon */
  ()=>{ const C=rnd([{A:AST.M,n:"Phobos, lune de Mars,",r:9380},{A:AST.M,n:"Deimos, lune de Mars,",r:23460},{A:AST.T,n:"Un satellite de positionnement",r:26560},{A:AST.L,n:"Un satellite relais lunaire",r:rnd([3000,4000,5000])}]);
    const r=C.r*1000, T=TOrb(C.A,r);
    return {ctx:`${C.n} décrit une orbite quasi circulaire de rayon r = ${nf(C.r,0)} km ${C.A.au}. ${datA(C.A,1)}`,q:"Avec la 3e loi de Kepler, calcule sa période de révolution, en heures.",type:"num",ans:T/3600,tolR:0.02,unit:"h",
      expl:`${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)}, donc ${F(`T = 2π·√(${FRAC("r³","G·M")})`)} = 2π × √(${FRAC(`(${sci(r)})³`,`${GTX} × ${C.A.dM}`)}) = ${nf(T,0)} s, soit ${U(T/3600,"h")}.`}; },
  /* 3e loi de Kepler : rayon et altitude à partir de la période */
  ()=>{ const C=rnd([{A:AST.L,T:[2,2.5,3]},{A:AST.M,T:[2,2.5,3]},{A:AST.T,T:[1.6,1.75,2]}]), Th=rnd(C.T), T=Th*3600, r=Math.cbrt(Gc*C.A.M*T*T/(4*Math.PI**2)), h=r-C.A.R;
    const ctx=`Une sonde décrit une orbite circulaire ${C.A.au} en ${nf(Th,2)} h. ${datA(C.A)}`;
    return [{ctx,q:"Calcule le rayon r de son orbite, en km.",type:"num",ans:r/1000,tolR:0.02,unit:"km",
        expl:`${F(`r³ = ${FRAC("G·M·T²","4π²")}`)} avec T = ${nf(Th,2)} × 3 600 = ${nf(T,0)} s : r³ = ${FRAC(`${GTX} × ${C.A.dM} × ${nf(T,0)}²`,"4π²")} = ${sci(r**3)} m³, donc r = ${sci(r)} m = ${U(r/1000,"km")}.`},
      {ctx,q:"À quelle altitude se trouve la sonde ?",type:"num",ans:h/1000,tolR:0.02,unit:"km",
        expl:`${F("h = r − R")} = ${nf(r/1000,0)} − ${nf(C.A.R/1000,0)} = ${U(h/1000,"km")}.`}]; },
  /* 3e loi de Kepler par rapport : sans G ni M */
  ()=>{ const C=rnd([{a:"Mars",s1:"Phobos",r1:9380,T1:7.66,u:"h",s2:"Deimos",d2:"de Deimos",r2:23460},{a:"Jupiter",s1:"Io",r1:421700,T1:1.77,u:"jour",s2:"Europe",d2:"d'Europe",r2:671000},{a:"Jupiter",s1:"Io",r1:421700,T1:1.77,u:"jour",s2:"Ganymède",d2:"de Ganymède",r2:1070000},
        {a:"la Terre",s1:"un satellite d'observation",r1:7000,T1:97.2,u:"min",s2:"un satellite de positionnement",d2:"du satellite de positionnement",r2:26560}]);
    const T2=C.T1*(C.r2/C.r1)**1.5, uu=C.u==="jour"?"jours":C.u, ut={h:"heures",min:"minutes",jour:"jours"}[C.u];
    return {ctx:`${cap1(C.s1)} tourne autour ${C.a==="la Terre"?"de la Terre":"de "+C.a} sur une orbite de rayon ${nf(C.r1,0)} km, en ${nf(C.T1,2)} ${C.u}. ${cap1(C.s2)} tourne autour du même astre, sur une orbite de rayon ${nf(C.r2,0)} km.`,
      q:`Sans utiliser G ni la masse de l'astre, calcule la période ${C.d2}, en ${ut}.`,type:"num",ans:T2,tolR:0.02,unit:uu,
      expl:`${F(`${FRAC("T²","r³")}`)} est le même pour tous les satellites d'un même astre : ${FRAC("T₂²","r₂³")} = ${FRAC("T₁²","r₁³")}, donc ${F(`T₂ = T₁·√((${FRAC("r₂","r₁")})³)`)} = ${nf(C.T1,2)} × √((${FRAC(nf(C.r2,0),nf(C.r1,0))})³) = ${U(T2,uu)}.`}; },
  /* masse d'un astre à partir de l'orbite d'une de ses lunes */
  ()=>{ const C=rnd(LUNES), r=C.r*1000, M=4*Math.PI**2*r**3/(Gc*C.T*C.T), p=10**C.e, dA=C.a==="la Terre"?"de la Terre":"de "+C.a;
    return {ctx:`${cap1(C.l)} tourne autour ${dA} sur une orbite quasi circulaire de rayon r = ${nf(C.r,0)} km, en ${C.Tt} (T = ${nf(C.T,0)} s). ${GTXT}.`,
      q:`Déduis-en la masse ${dA}. Écris-la sous la forme … × 10<sup>${C.e}</sup> kg : saisis seulement le nombre placé devant 10<sup>${C.e}</sup>.`,type:"num",ans:M/p,tolR:0.02,unit:`× 10<sup>${C.e}</sup> kg`,
      expl:`${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)}, donc ${F(`M = ${FRAC("4π²·r³","G·T²")}`)} = ${FRAC(`4π² × (${sci(r,3)})³`,`${GTX} × ${nf(C.T,0)}²`)} = ${F(`${sci(M)} kg`)}. Il faut r en m et T en s.${C.e===24?" La valeur admise est 5,97 × 10<sup>24</sup> kg : l'écart d'environ 1 % vient de ce que la masse de la Lune n'est pas tout à fait négligeable devant celle de la Terre (ce calcul donne en fait la somme des deux masses).":""}`}; },
  /* nombre de tours par jour */
  ()=>{ const o=draw(()=>{ const h=rnd([350,400,450,500,550,600,700,800,900,1000]), r=AST.T.R+h*1000, T=TOrb(AST.T,r), n=86400/T; return {h,r,T,n}; },o=>{ const f=o.n-Math.floor(o.n); return f>=0.12&&f<=0.88; });
    const N=Math.floor(o.n), ctx=`Un satellite d'observation décrit une orbite circulaire à l'altitude h = ${nf(o.h,0)} km. ${datA(AST.T)}`;
    return [{ctx,q:"Avec la 3e loi de Kepler, détermine la durée d'un tour complet, en minutes.",type:"num",ans:o.T/60,tolR:0.02,unit:"min",
        expl:`r = R + h = ${nf(o.r/1000,0)} km. ${F(`T = 2π·√(${FRAC("r³","G·M")})`)} = ${nf(o.T,0)} s, soit ${U(o.T/60,"min")}.`},
      {ctx,q:"Combien de tours complets effectue-t-il en 24 h ?",type:"num",ans:N,tolA:0,unit:"tours",
        expl:`${FRAC("24 × 60","T")} = ${FRAC("1 440",nf(o.T/60,2))} = ${nf(o.n,2)}, soit ${U(N,"tours")} complets par jour. D'un tour à l'autre, la Terre tourne sous l'orbite : le satellite survole d'autres régions.`}]; },
  /* délai de transmission : orbite géostationnaire ou orbite basse */
  ()=>{ const hg=35790, hl=rnd([550,800,1200]), tg=2*hg*1000/3e8*1000, tl=2*hl*1000/3e8*1000;
    const ctx=`Un signal radio va d'une station au sol jusqu'à un satellite situé à la verticale, puis revient au sol (aller-retour). c = 3,00 × 10<sup>8</sup> m/s.`;
    return [{ctx,q:`Calcule la durée de l'aller-retour pour un satellite géostationnaire (altitude ${nf(hg,0)} km), en ms.`,type:"num",ans:tg,tolR:0.02,unit:"ms",
        expl:`${F(`Δt = ${FRAC("2·h","c")}`)} = ${FRAC(`2 × ${sci(hg*1000,3)}`,"3,00 × 10<sup>8</sup>")} = ${nf(tg/1000,4)} s, soit ${U(tg,"ms")}.`},
      {ctx,q:`Même calcul pour un satellite en orbite basse, à ${nf(hl,0)} km d'altitude, en ms.`,type:"num",ans:tl,tolR:0.02,unit:"ms",
        expl:`Δt = ${FRAC(`2 × ${sci(hl*1000)}`,"3,00 × 10<sup>8</sup>")} = ${U(tl,"ms")}, soit ${nf(tg/tl,0)} fois moins : les constellations en orbite basse réduisent le délai des communications, mais chaque satellite ne reste visible que quelques minutes.`}]; },
  /* lecture du graphe g(h) */
  ()=>{ const k=KA(), A=AST[k], f=rnd([4,9]), g0=Gc*A.M/(A.R*A.R), h=A.R*(Math.sqrt(f)-1)/1000, hm={T:20000,L:6000,M:12000}[k];
    return {fig:fx_grav_gh({M:A.M,R:A.R,hm,nm:A.N,hl:{g:g0/f,lab:f===4?"quart de g₀":"neuvième de g₀"}}),ctx:`Le graphe donne le champ de gravitation ${A.de} en fonction de l'altitude h (R = ${A.dR}). La droite en tirets correspond au ${f===4?"quart":"neuvième"} de la valeur au sol g₀.`,
      q:`Lis l'altitude à laquelle le champ vaut le ${f===4?"quart":"neuvième"} de sa valeur au sol.`,type:"num",ans:h,tolR:0.05,unit:"km",
      expl:`Lecture : h ≈ ${U(h,"km")}. Vérification : ${F(`${FRAC("g(h)","g₀")} = (${FRAC("R","R + h")})²`)} = ${FRAC("1",f)} ⇔ R + h = ${Math.sqrt(f)}R ⇔ h = ${f===4?"R":"2R"} = ${nf(h,0)} km. Le champ décroît comme l'inverse du carré de la distance au centre.`}; },
  /* champ à la surface d'un astre, puis poids d'un rover */
  ()=>{ const k=rnd(["L","M"]), A=AST[k], S=rnd([["Un rover d'exploration",[180,350,900]],["Un atterrisseur",[300,600,800]],["Un module d'habitation",[2000,5000,8000]]]), m=rnd(S[1]), g0=Gc*A.M/(A.R*A.R), P=m*g0;
    const ctx=`${S[0]} de masse ${nf(m,0)} kg est posé à la surface ${A.de}. ${datA(A)}`;
    return [{ctx,q:`À partir de la loi de gravitation, détermine la valeur de g₀ à la surface ${A.de}.`,type:"num",ans:g0,tolR:0.02,unit:"m/s²",
        expl:`${F(`g₀ = ${FRAC("G·M","R²")}`)} = ${FRAC(`${GTX} × ${A.dM}`,`(${sci(A.R)})²`)} = ${U(g0,"m/s²")}.`},
      {ctx,q:`Déduis-en son poids sur ${A.n}.`,type:"num",ans:P,tolR:0.02,unit:"N",
        expl:`${F("P = m·g₀")} = ${nf(m,0)} × ${nf(g0,3)} = ${U(P,"N")}, soit ${nf(9.81/g0,1)} fois moins que sur Terre (${nf(m*9.81,0)} N) : à masse égale, la structure et les appuis au sol sont bien moins sollicités.`}]; }
];

const cbr=(A,T)=>Math.cbrt(Gc*A.M*T*T/(4*Math.PI**2));                     /* rayon de l'orbite de période T (s) */
const GR3=[
  /* satellite géostationnaire (ou aréostationnaire) : rayon, altitude, plan de l'orbite */
  ()=>{ const C=rnd([{A:AST.T,T:86160,Tt:"23 h 56 min",nm:"géostationnaire",j:"la Terre"},{A:AST.M,T:88620,Tt:"24 h 37 min",nm:"aréostationnaire",j:"Mars"}]), r=cbr(C.A,C.T), h=r-C.A.R;
    const ctx=`Un satellite ${C.nm} reste à la verticale d'un même point de ${C.j}. Sa période est égale à la durée d'un tour de ${C.j} sur elle-même : T = ${C.Tt}. ${datA(C.A)}`;
    return [{ctx,q:"Calcule le rayon de l'orbite de ce satellite, en km.",type:"num",ans:r/1000,tolR:0.02,unit:"km",
        expl:`T = ${C.Tt} = ${nf(C.T,0)} s. 3e loi de Kepler : ${F(`r = ∛(${FRAC("G·M·T²","4π²")})`)} = ∛(${FRAC(`${GTX} × ${C.A.dM} × ${nf(C.T,0)}²`,"4π²")}) = ${sci(r,3)} m, soit ${U(r/1000,"km")}.`},
      {ctx,q:"À quelle altitude se trouve-t-il ?",type:"num",ans:h/1000,tolR:0.02,unit:"km",
        expl:`${F("h = r − R")} = ${nf(r/1000,0)} − ${nf(C.A.R/1000,0)} = ${U(h/1000,"km")}${C.A===AST.T?" : on retrouve les 36 000 km environ des satellites de télévision":""}.`},
      {ctx,q:"Dans quel plan son orbite doit-elle se trouver ?",type:"ch",...mc("Dans le plan de l'équateur",["Dans un plan qui passe par les deux pôles","Dans n'importe quel plan qui contient le centre de l'astre","Dans le plan de l'orbite de l'astre autour du Soleil"]),
        expl:`L'orbite est centrée sur le centre de l'astre (la force de gravitation est centrale). Pour rester au-dessus du même point pendant que ${C.j} tourne autour de l'axe des pôles, le satellite doit tourner autour du même axe : son orbite est dans le ${F("plan équatorial")}. Sur une orbite inclinée, il passerait alternativement au nord et au sud de l'équateur.`}]; },
  /* masse de la Terre à partir des données d'une station spatiale */
  ()=>{ const o=draw(()=>{ const h=rnd([400,450,500,550,600,700,800]), r=AST.T.R+h*1000, V=Math.round(vOrb(AST.T,r)*3.6/1000)*1000, v=V/3.6, M=v*v*r/Gc, M3=Number((M/1e24).toPrecision(3)); return {h,r,V,v,M,M3,er:Math.abs(M3-5.97)/5.97*100}; },o=>Math.abs(o.M3-5.97)>=0.03);
    const {h,r,V,v,M,M3,er}=o, ctx=`Pour vérifier la masse de la Terre, on utilise les caractéristiques d'un satellite en orbite circulaire : altitude ${nf(h,0)} km, vitesse ${nf(V,0)} km/h (valeur arrondie au millier). R = 6 370 km ; ${GTXT}.`;
    return [{ctx,q:"Calcule la masse de la Terre. Écris-la sous la forme … × 10<sup>24</sup> kg : saisis seulement le nombre placé devant 10<sup>24</sup>.",type:"num",ans:M/1e24,tolR:0.02,unit:"× 10<sup>24</sup> kg",
        expl:`v = ${FRAC(nf(V,0),"3,6")} = ${nf(v,1)} m/s ; r = R + h = ${nf(r/1000,0)} km. ${F(`v = √(${FRAC("G·M","r")})`)} donne ${F(`M = ${FRAC("v²·r","G")}`)} = ${FRAC(`${nf(v,1)}² × ${sci(r,3)}`,GTX)} = ${F(`${sci(M)} kg`)}.`},
      {ctx,q:"Calcule l'écart relatif entre ta valeur, arrondie à 3 chiffres significatifs, et la valeur de référence M_réf = 5,97 × 10<sup>24</sup> kg (la référence est M_réf).",type:"num",ans:er,tolR:0.03,tolA:0.1,unit:"%",
        expl:`${F(`écart = ${FRAC("|M − M_réf|","M_réf")} × 100`)} = ${FRAC(`|${nfd(M3,2)} − 5,97|`,"5,97")} × 100 = ${U(er,"%")}.`},
      {ctx,q:"Quelle est la principale limite de ce calcul ?",type:"ch",...mc("La vitesse affichée est arrondie au millier de km/h, et l'orbite réelle n'est pas parfaitement circulaire",["La masse du satellite a été négligée","G varie avec l'altitude","L'attraction du Soleil sur le satellite est plus forte que celle de la Terre"]),
        expl:`La masse du satellite se simplifie : elle n'est pas négligée. G est une constante universelle. L'écart de ${nf(er,1)} % vient surtout de l'arrondi de la vitesse : jusqu'à 500 km/h sur ${nf(V,0)} km/h, soit près de 2 % sur v et 4 % sur M, qui dépend de v². L'orbite réelle, légèrement elliptique, ajoute un petit écart.`}]; },
  /* exigence de revisite : période maximale, altitude maximale, conclusion */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const n=rnd([14,15]), T=86400/n, r=cbr(AST.T,T), hm=(r-AST.T.R)/1000, hp=rnd([450,500,550,600,650,700,750,800,850,950]); return {n,T,r,hm,hp}; },o=>far(o.hp,o.hm,0.05)&&(o.hp<=o.hm)===want);
    const ok=o.hp<=o.hm, ctx=`Exigence : un satellite d'observation doit faire au moins ${o.n} tours de la Terre en 24 h, sur une orbite circulaire. ${datA(AST.T)}`;
    return [{ctx,q:"Quelle est la période maximale de son orbite, en minutes ?",type:"num",ans:o.T/60,tolR:0.02,unit:"min",
        expl:`${o.n} tours en 24 h = 1 440 min : ${F(`T ≤ ${FRAC("1 440",o.n)}`)} = ${U(o.T/60,"min")}.`},
      {ctx,q:"Quelle altitude maximale peut-on choisir ?",type:"num",ans:o.hm,tolR:0.02,unit:"km",
        expl:`La période augmente avec le rayon (3e loi de Kepler) : ${F(`r = ∛(${FRAC("G·M·T²","4π²")})`)} avec T = ${nf(o.T,0)} s donne r = ${nf(o.r/1000,0)} km, donc ${F("h = r − R")} = ${U(o.hm,"km")}.`},
      {ctx,q:`Le constructeur propose une orbite à ${nf(o.hp,0)} km d'altitude. L'exigence est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.hp,0)} km ${ok?"≤":">"} ${nf(o.hm,0)} km : ${ok?"l'orbite est assez basse, le satellite fait au moins ":"l'orbite est trop haute, le satellite fait moins de "}${o.n} tours par jour.`}]; },
  /* sonde en orbite : altitude déduite de la période, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const C=rnd([{A:AST.L,T:[1.95,2,2.1,2.2,2.3],lim:150,dir:-1,w:"au plus 150 km, pour photographier le sol avec la résolution voulue"},{A:AST.M,T:[1.8,1.95,2,2.1,2.2],lim:300,dir:1,w:"au moins 300 km, pour limiter le freinage par la haute atmosphère"}]);
        const Th=rnd(C.T), T=Th*3600, r=cbr(C.A,T), h=(r-C.A.R)/1000; return {C,Th,T,r,h}; },o=>far(o.h,o.C.lim,0.06)&&((o.C.dir<0?o.h<=o.C.lim:o.h>=o.C.lim)===want));
    const ok=o.C.dir<0?o.h<=o.C.lim:o.h>=o.C.lim, ctx=`Une sonde décrit une orbite circulaire ${o.C.A.au} en ${nf(o.Th,2)} h. Exigence : altitude ${o.C.w}. ${datA(o.C.A)}`;
    return [{ctx,q:"Déduis de la période le rayon de l'orbite de la sonde, en km.",type:"num",ans:o.r/1000,tolR:0.02,unit:"km",
        expl:`T = ${nf(o.T,0)} s. ${F(`r = ∛(${FRAC("G·M·T²","4π²")})`)} = ∛(${FRAC(`${GTX} × ${o.C.A.dM} × ${nf(o.T,0)}²`,"4π²")}) = ${U(o.r/1000,"km")}.`},
      {ctx,q:"L'exigence d'altitude est-elle satisfaite ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${F("h = r − R")} = ${nf(o.r/1000,0)} − ${nf(o.C.A.R/1000,0)} = ${nf(o.h,0)} km ${o.C.dir<0?(ok?"≤":">"):(ok?"≥":"&lt;")} ${o.C.lim} km : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut modifier la période de l'orbite."}`}]; },
  /* point entre la Terre et la Lune où les deux attractions se compensent */
  ()=>{ const D=rnd([363300,384400,405500]), q=Math.sqrt(7.35e22/5.97e24), x=D/(1+q), R=5.97e24/7.35e22;
    const fig=fx_grav_tl({D:`D = ${nf(D,0)} km`,x:"x = ?",pp:0.75}), ctx=`À un instant donné, la distance entre les centres de la Terre (M_T = 5,97 × 10<sup>24</sup> kg) et de la Lune (M_L = 7,35 × 10<sup>22</sup> kg) vaut D = ${nf(D,0)} km. Une sonde P se trouve sur le segment qui joint leurs centres.`;
    return [{fig,ctx,q:"Au milieu du segment, combien de fois l'attraction de la Terre sur la sonde est-elle plus forte que celle de la Lune ?",type:"num",ans:R,tolR:0.02,unit:"",
        expl:`À égale distance d des deux centres : ${F(`${FRAC("F₁","F₂")} = ${FRAC("G·m·M_T","d²")} × ${FRAC("d²","G·m·M_L")} = ${FRAC("M_T","M_L")}`)} = ${FRAC("5,97 × 10<sup>24</sup>","7,35 × 10<sup>22</sup>")} = ${U(R,"")}.`},
      {fig,ctx,q:"À quelle distance x du centre de la Terre les deux attractions se compensent-elles ?",type:"num",ans:x,tolR:0.02,unit:"km",
        expl:`${F(`${FRAC("G·m·M_T","x²")} = ${FRAC("G·m·M_L","(D − x)²")}`)} ⇒ ${FRAC("D − x","x")} = √(${FRAC("M_L","M_T")}) = ${nf(q,4)}, donc ${F(`x = ${FRAC("D",`1 + √(${FRAC("M_L","M_T")})`)}`)} = ${FRAC(nf(D,0),`1 + ${nf(q,4)}`)} = ${U(x,"km")}, soit ${nf(x/D*100,0)} % du trajet : la Lune, 81 fois moins massive, n'attire plus fort que tout près d'elle.`}]; },
  /* satellite freiné par la haute atmosphère */
  ()=>{ const h1=rnd([420,450,500,550]), dh=rnd([20,30,40,50]), h2=h1-dh, r1=AST.T.R+h1*1000, r2=AST.T.R+h2*1000, v1=vOrb(AST.T,r1), T2=TOrb(AST.T,r2);
    const ctx=`Un satellite est en orbite circulaire à ${nf(h1,0)} km d'altitude. Freiné par les traces d'atmosphère, il descend lentement : quelques mois plus tard, son orbite, toujours quasi circulaire, est à ${nf(h2,0)} km. ${datA(AST.T)}`;
    return [{ctx,q:`Calcule sa vitesse à ${nf(h1,0)} km d'altitude, en km/s.`,type:"num",ans:v1/1000,tolR:0.02,unit:"km/s",
        expl:`r₁ = ${nf(r1/1000,0)} km ; ${F(`v = √(${FRAC("G·M","r")})`)} = ${U(v1/1000,"km/s")}.`},
      {ctx,q:`Calcule sa période à ${nf(h2,0)} km d'altitude, en minutes.`,type:"num",ans:T2/60,tolR:0.02,unit:"min",
        expl:`r₂ = ${nf(r2/1000,0)} km ; ${F(`T = 2π·√(${FRAC("r³","G·M")})`)} = ${nf(T2,0)} s, soit ${U(T2/60,"min")} (contre ${nf(TOrb(AST.T,r1)/60,1)} min à ${nf(h1,0)} km).`},
      {ctx,q:"Comment ont évolué sa vitesse et sa période ?",type:"ch",...mc("La vitesse a augmenté et la période a diminué",["La vitesse a diminué, car le satellite est freiné","La vitesse et la période ont augmenté","Rien n'a changé : seule l'altitude a varié"]),
        expl:`Sur la nouvelle orbite, plus basse, ${F(`v = √(${FRAC("G·M","r")})`)} est plus grande : ${nf(vOrb(AST.T,r2)/1000,3)} km/s contre ${nf(v1/1000,3)} km/s. C'est le paradoxe du freinage atmosphérique : le frottement fait descendre le satellite, qui va alors plus vite et fait le tour plus rapidement.`}]; },
  /* repérer l'erreur dans une résolution */
  ()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
    const A=AST.T;
    if(v===0){ const h=rnd([400,500,600]), r=A.R+h*1000;
      ctx=`Vitesse d'un satellite en orbite circulaire à ${h} km d'altitude autour de la Terre (M = 5,97 × 10<sup>24</sup> kg, R = 6 370 km).`;
      st=[`r = h = ${sci(h*1000)} m`,`v = √(${FRAC("G·M","r")}) = √(${FRAC(`${GTX} × 5,97 × 10<sup>24</sup>`,sci(h*1000))})`,`v = ${nf(vOrb(A,h*1000)/1000,1)} km/s`]; bad=0;
      why=`r est la distance au centre de la Terre : r = R + h = ${nf(r/1000,0)} km, d'où v = ${nf(vOrb(A,r)/1000,2)} km/s.`; }
    else if(v===1){ const h=rnd([400,500,600]), r=A.R+h*1000, vw=Math.sqrt(Gc*A.M/(r/1000));
      ctx=`Vitesse d'un satellite en orbite circulaire à ${h} km d'altitude autour de la Terre (M = 5,97 × 10<sup>24</sup> kg, R = 6 370 km).`;
      st=[`r = R + h = ${nf(r/1000,0)} km`,`v = √(${FRAC(`${GTX} × 5,97 × 10<sup>24</sup>`,nf(r/1000,0))})`,`v = ${nf(vw,0)} m/s`]; bad=1;
      why=`r doit être en mètres : r = ${sci(r)} m, d'où v = ${nf(vOrb(A,r),0)} m/s (${nf(vOrb(A,r)/1000,2)} km/s). La valeur de l'élève, ${nf(vw/1000,0)} km/s, est absurde.`; }
    else if(v===2){ const Th=rnd([2,3]), AL=AST.L, rw=Math.cbrt(Gc*AL.M*Th*Th/(4*Math.PI**2)), r=cbr(AL,Th*3600);
      ctx=`Rayon de l'orbite d'une sonde qui fait le tour de la Lune (M = 7,35 × 10<sup>22</sup> kg) en ${Th} h.`;
      st=[`r³ = ${FRAC("G·M·T²","4π²")}`,`r³ = ${FRAC(`${GTX} × 7,35 × 10<sup>22</sup> × ${Th}²`,"4π²")}`,`r = ${nf(rw,0)} m`]; bad=1;
      why=`Avec G en unités SI, T doit être en secondes : T = ${nf(Th*3600,0)} s, d'où r = ${nf(r/1000,0)} km.`; }
    else if(v===3){ const r=rnd([7000,8000,10000])*1000;
      ctx=`Vitesse d'un satellite sur une orbite circulaire de rayon r = ${nf(r/1000,0)} km autour de la Terre (M = 5,97 × 10<sup>24</sup> kg).`;
      st=[`r = ${sci(r)} m`,`v = ${FRAC("G·M","r")} = ${FRAC(`${GTX} × 5,97 × 10<sup>24</sup>`,sci(r))}`,`v = ${sci(Gc*A.M/r)} m/s`]; bad=1;
      why=`${FRAC("G·M","r")} a la dimension d'une vitesse au carré : v = √(${FRAC("G·M","r")}) = ${nf(vOrb(A,r),0)} m/s.`; }
    else if(v===4){ const m=rnd([500,1000]), d=rnd([7000,8000])*1000;
      ctx=`Force de gravitation exercée par la Terre (M = 5,97 × 10<sup>24</sup> kg) sur un satellite de ${nf(m,0)} kg situé à ${nf(d/1000,0)} km du centre de la Terre.`;
      st=[`d = ${sci(d)} m`,`F = ${FRAC("G·m·M","d")} = ${FRAC(`${GTX} × ${nf(m,0)} × 5,97 × 10<sup>24</sup>`,sci(d))}`,`F = ${sci(Gc*m*A.M/d)} N`]; bad=1;
      why=`La force varie comme l'inverse du carré de la distance : F = ${FRAC("G·m·M","d²")} = ${nf(Gc*m*A.M/(d*d),0)} N.`; }
    else { const m=rnd([180,350,900]), gL=1.62;
      ctx=`Masse et poids d'un rover de ${m} kg (masse mesurée sur Terre) posé sur la Lune, où g = 1,62 N/kg.`;
      st=[`Sur la Lune, g est ${nf(9.81/gL,1)} fois plus faible que sur Terre.`,`La masse du rover devient ${FRAC(m,nf(9.81/gL,1))} = ${nf(m*gL/9.81,0)} kg`,`Son poids vaut ${nf(m*gL/9.81,0)} × 1,62 = ${nf(m*gL*gL/9.81,0)} N`]; bad=1;
      why=`La masse ne dépend pas du lieu : elle reste ${m} kg. Seul le poids change : P = m·g = ${m} × 1,62 = ${nf(m*gL,0)} N.`; }
    return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
  /* droite T² = f(r³) pour les lunes d'une planète : 3e loi de Kepler, masse de la planète */
  ()=>{ const P=rnd([{p:"Jupiter",de:"de Jupiter",e:27,L:[["Io",421700,152842],["Europe",671000,306806],["Ganymède",1070400,618192]]},{p:"Saturne",de:"de Saturne",e:26,L:[["Téthys",294700,163123],["Dioné",377400,236477],["Rhéa",527100,390355]]}]);
    const pts=P.L.map(([n,r,T])=>({x:(r*1000)**3/1e24,y:T*T/1e10,lab:n})), last=pts[2], k=last.y/last.x, ks=k*1e10/1e24, M=4*Math.PI**2/(Gc*ks);
    const fig=fx_grav_kepler({pts,k,xl:"r³ (10²⁴ m³)",yl:"T² (10¹⁰ s²)"}), data=table(["Lune","r³ (10<sup>24</sup> m³)","T² (10<sup>10</sup> s²)"],pts.map(p=>[p.lab,S3(p.x),S3(p.y)]));
    const ctx=`Le graphe et le tableau donnent, pour trois lunes ${P.de}, le carré T² de la période de révolution en fonction du cube r³ du rayon de l'orbite. ${GTXT}.`;
    return [{fig,data,ctx,q:"Que montre l'alignement des points sur une droite passant par l'origine ?",type:"ch",...mc(`${FRAC("T²","r³")} a la même valeur pour les trois lunes : c'est la 3e loi de Kepler`,["La période est proportionnelle au rayon de l'orbite","Les trois lunes ont la même masse","Les trois lunes ont la même vitesse"]),
        expl:`T² proportionnel à r³ : ${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)}, une constante qui ne dépend que de la masse M ${P.de}, pas de celle des lunes. La période n'est pas proportionnelle au rayon (T ∝ r<sup>1,5</sup>) et les lunes lointaines vont moins vite.`},
      {fig,data,ctx,q:`Déduis de la pente de la droite la masse ${P.de}. Écris-la sous la forme … × 10<sup>${P.e}</sup> kg : saisis seulement le nombre placé devant 10<sup>${P.e}</sup>.`,type:"num",ans:M/10**P.e,tolR:0.02,unit:`× 10<sup>${P.e}</sup> kg`,
        expl:`Pente, avec le point ${last.lab} : k = ${FRAC(`${S3(last.y)} × 10<sup>10</sup>`,`${S3(last.x)} × 10<sup>24</sup>`)} = ${sci(ks)} s²/m³. ${F(`k = ${FRAC("4π²","G·M")}`)}, donc ${F(`M = ${FRAC("4π²","G·k")}`)} = ${FRAC("4π²",`${GTX} × ${sci(ks)}`)} = ${F(`${sci(M)} kg`)}.`}]; },
  /* satellites de positionnement : rayon, vitesse, répétition de la trace */
  ()=>{ const C=rnd([{n:"GPS",T:43080,Tt:"11 h 58 min",q:"Combien de tours complets chaque satellite fait-il pendant que la Terre fait un tour sur elle-même (23 h 56 min) ?",N:2,d:86160},{n:"Galileo",T:50700,Tt:"14 h 05 min",q:"Combien de tours (arrondis à l'unité) chaque satellite fait-il pendant 10 tours de la Terre sur elle-même (10 × 23 h 56 min) ?",N:17,d:861600}]);
    const r=cbr(AST.T,C.T), v=2*Math.PI*r/C.T, ctx=`Les satellites de positionnement ${C.n} décrivent des orbites circulaires de période T = ${C.Tt}. ${datA(AST.T)}`;
    return [{ctx,q:"Calcule le rayon de leur orbite, en km.",type:"num",ans:r/1000,tolR:0.02,unit:"km",
        expl:`T = ${nf(C.T,0)} s. ${F(`r = ∛(${FRAC("G·M·T²","4π²")})`)} = ${sci(r,3)} m, soit ${U(r/1000,"km")} (altitude ${nf((r-AST.T.R)/1000,0)} km).`},
      {ctx,q:"Calcule leur vitesse, en km/s.",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
        expl:`${F(`v = ${FRAC("2π·r","T")}`)} = ${FRAC(`2π × ${sci(r,3)}`,nf(C.T,0))} = ${nf(v,0)} m/s, soit ${U(v/1000,"km/s")} (on trouve la même valeur avec √(${FRAC("G·M","r")})).`},
      {ctx,q:C.q,type:"num",ans:C.N,tolA:0,unit:"tours",
        expl:`${FRAC(nf(C.d,0),nf(C.T,0))} = ${Math.abs(C.d/C.T-C.N)<1e-9?`${F(`${C.N} tours`)} exactement`:`${nf(C.d/C.T,3)}, soit environ ${F(`${C.N} tours`)}`}. La configuration des satellites au-dessus d'un lieu se répète donc à l'identique : c'est ce qui a guidé le choix de la période.`}]; },
  /* bras robotisé sur Mars ou sur la Lune : masse maximale soulevée */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const k=rnd(["L","M"]), A=AST[k], mT=rnd([2,2.5,3,4,5]), Fm=mT*9.81, g0=Gc*A.M/(A.R*A.R), mx=Fm/g0, ms=rnd([4,5,6,8,10,12,15,20,25,30]); return {k,A,mT,Fm,g0,mx,ms}; },o=>far(o.ms,o.mx,0.06)&&(o.ms<=o.mx)===want);
    const ok=o.ms<=o.mx, ctx=`Sur Terre (g = 9,81 N/kg), le bras robotisé d'un rover soulève au plus une masse de ${nf(o.mT,1)} kg : il exerce donc au plus ${nf(o.Fm,1)} N vers le haut. Le rover est envoyé sur ${o.A.n}. ${datA(o.A)}`;
    return [{ctx,q:`Quelle masse maximale le bras peut-il soulever à la surface ${o.A.de} ?`,type:"num",ans:o.mx,tolR:0.02,unit:"kg",
        expl:`${F(`g₀ = ${FRAC("G·M","R²")}`)} = ${nf(o.g0,3)} m/s². Il faut m·g₀ ≤ ${nf(o.Fm,1)} N, donc ${F(`m_max = ${FRAC("F_max","g₀")}`)} = ${FRAC(nf(o.Fm,1),nf(o.g0,3))} = ${U(o.mx,"kg")}.`},
      {ctx,q:`Le bras doit soulever un bloc de roche de ${o.ms} kg. Est-ce possible ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`${o.ms} kg ${ok?"≤":">"} ${nf(o.mx,1)} kg : ${ok?"le bras peut le soulever, alors qu'il en serait incapable sur Terre.":"même avec un poids plus faible que sur Terre, le bloc est trop lourd."} Sa masse est la même partout ; seul son poids (${nf(o.ms*o.g0,1)} N sur ${o.A.n}) change.`}]; },
  /* mission autour de la Lune : période, nombre de révolutions, coupures radio */
  ()=>{ const o=draw(()=>{ const h=rnd([50,80,100,120,150]), r=AST.L.R+h*1000, T=TOrb(AST.L,r), nj=rnd([3,5,7,10]), n=nj*86400/T; return {h,r,T,nj,n}; },o=>{ const f=o.n-Math.floor(o.n); return f>=0.1&&f<=0.9; });
    const N=Math.floor(o.n), ctx=`Une sonde tourne autour de la Lune sur une orbite circulaire à ${nf(o.h,0)} km d'altitude pendant une mission de ${o.nj} jours. ${datA(AST.L)}`;
    return [{ctx,q:"Quelle est la durée d'une révolution de la sonde, en minutes ?",type:"num",ans:o.T/60,tolR:0.02,unit:"min",
        expl:`r = R + h = ${nf(o.r/1000,0)} km. ${F(`T = 2π·√(${FRAC("r³","G·M")})`)} = ${nf(o.T,0)} s, soit ${U(o.T/60,"min")}.`},
      {ctx,q:"Combien de révolutions complètes effectue-t-elle pendant la mission ?",type:"num",ans:N,tolA:0,unit:"révolutions",
        expl:`${FRAC(`${o.nj} × 86 400`,nf(o.T,0))} = ${nf(o.n,2)} : ${U(N,"révolutions")} complètes.`},
      {ctx,q:"On double l'altitude de l'orbite. Que devient la période de révolution ?",type:"ch",...mc("Elle augmente, mais bien moins que du double",["Elle double","Elle est multipliée par 2√2, soit environ 2,8","Elle ne change pas"]),
        expl:`La 3e loi de Kepler porte sur r = R + h, pas sur h : r passe de ${nf(o.r/1000,0)} km à ${nf((o.r+o.h*1000)/1000,0)} km, soit × ${nf((o.r+o.h*1000)/o.r,3)}. ${F("T ∝ r<sup>1,5</sup>")} : T est multipliée par ${nf(((o.r+o.h*1000)/o.r)**1.5,3)} et passe à ${nf(TOrb(AST.L,o.r+o.h*1000)/60,1)} min. Piège : doubler h ne double pas r.`}]; },
  /* 3e loi de Kepler autour du Soleil, en unités astronomiques */
  ()=>{ const C=rnd([{n:"Mars",r:1.524},{n:"Jupiter",r:5.203},{n:"Vénus",r:0.723},{n:"Saturne",r:9.537},{n:"l'astéroïde Cérès",T:4.60},{n:"l'astéroïde Vesta",T:3.63}]);
    const r=C.r||Math.pow(C.T,2/3), T=C.T||Math.pow(C.r,1.5), vr=Math.sqrt(1/r), dn="de "+C.n, ua=T<2?"an":"ans";
    const ctx=`La Terre tourne autour du Soleil en T = 1 an sur une orbite quasi circulaire de rayon r = 1 UA (1 UA = 1,50 × 10<sup>8</sup> km). ${C.r?`${cap1(C.n)} décrit une orbite quasi circulaire de rayon ${nf(C.r,3)} UA.`:`${cap1(C.n)} fait le tour du Soleil en ${nf(C.T,2)} ans, sur une orbite quasi circulaire.`}`;
    return [{ctx,q:C.r?`Sans utiliser G ni la masse du Soleil, calcule la période ${dn}, en années.`:`Sans utiliser G ni la masse du Soleil, calcule le rayon de l'orbite ${dn}, en UA.`,type:"num",ans:C.r?T:r,tolR:0.02,unit:C.r?ua:"UA",
        expl:C.r?`${F(`${FRAC("T²","r³")}`)} est le même pour toutes les planètes : avec T en années et r en UA, il vaut ${FRAC("1²","1³")} = 1. Donc ${F("T = r<sup>1,5</sup>")} = ${nf(C.r,3)}<sup>1,5</sup> = ${U(T,ua)}.`
          :`Avec T en années et r en UA, ${FRAC("T²","r³")} = 1 (valeur pour la Terre). Donc ${F("r³ = T²")} et r = ∛(${nf(C.T,2)}²) = ${U(r,"UA")}.`},
      {ctx,q:`Calcule le rapport ${FRAC("v","v_Terre")} de sa vitesse sur son orbite à celle de la Terre.`,type:"num",ans:vr,tolR:0.02,unit:"",
        expl:`${F(`v = √(${FRAC("G·M","r")})`)} : ${FRAC("v","v_Terre")} = √(${FRAC("r_Terre","r")}) = √(${FRAC("1",nf(r,3))}) = ${U(vr,"")}. ${vr<1?"Plus loin du Soleil, la planète va moins vite.":"Plus proche du Soleil, elle va plus vite que la Terre."}`}]; }
];

POOLS["phy-gravitation"]={
  titre:"Gravitation, orbites et satellites",
  fiche:{t:"Gravitation et satellites",l:[
    `Loi de gravitation universelle : ${F(`F = ${FRAC("G·m·M","d²")}`)}, attractive, d entre les centres, en m.`,
    `Champ de gravitation à l'altitude h : ${F(`g(h) = ${FRAC("G·M","(R + h)²")}`)} ; poids ${F("P = m·g")}, la masse ne change pas.`,
    `Orbite circulaire de rayon r = R + h : mouvement uniforme, ${F(`v = √(${FRAC("G·M","r")})`)}, accélération ${F(`a = ${FRAC("v²","r")}`)} vers le centre.`,
    `Période ${F(`T = ${FRAC("2π·r","v")}`)} ; 3e loi de Kepler ${F(`${FRAC("T²","r³")} = ${FRAC("4π²","G·M")}`)}, la même pour tous les satellites d'un astre.`,
    "Pièges : r = R + h (et non h), km → m, T en s, racine carrée oubliée, géostationnaire : T = 23 h 56 min, plan équatorial, h ≈ 36 000 km ; la masse du satellite n'intervient pas."]},
  count:{1:4,2:4,3:3},1:GR1,2:GR2,3:GR3};

})();
