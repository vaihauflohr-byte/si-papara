/* Réservoirs : résistance des matériaux (meca-rdm) et transferts thermiques, partie SI (ener-thermique).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_rdm_, fx_th_ et fx_carte. */
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
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
const pick=(a,n)=>shuffle(a).slice(0,n);
const tC=(x,d)=>(x<0?"−":"")+nf(Math.abs(x),d==null?1:d);            /* température signée, vrai signe moins */
const tP=x=>x<0?`(${tC(x,0)})`:tC(x,0);                                /* température dans une différence : −18 → (−18) */
const secR=d=>Math.PI*d*d/4;                                           /* section d'un rond de diamètre d */
const dot=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="4" class="v-dot"/>`;
/* texte avec un liseré couleur papier (lisible par-dessus une courbe ou une carte) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;

/* ======================================================================
   FIGURES : RÉSISTANCE DES MATÉRIAUX (préfixe fx_rdm_)
   ====================================================================== */
/* pièce cylindrique et ses actions extérieures : k = 0 traction, 1 compression, 2 flexion, 3 torsion, 4 cisaillement */
function fx_rdm_sollic(k){
  const y=100, xa=112, xb=288, r=14;
  let s=L(xa-86,y,xb+86,y,"v-dash");
  if(k===2) s+=`<path d="M${xa+14} ${y+r} l-11 20 h22 z" class="v-box"/>`+ground(xa-10,xa+38,y+r+20)+`<circle cx="${xb-14}" cy="${y+r+9}" r="9" class="v-wheel"/>`+ground(xb-38,xb+10,y+r+18);
  s+=`<rect x="${xa}" y="${y-r}" width="${xb-xa}" height="${2*r}" rx="3" class="v-body"/><ellipse cx="${xb}" cy="${y}" rx="6" ry="${r}" class="v-box"/>`;
  if(k===0) s+=L(xa-4,y,xa-74,y,"v-t","c")+L(xb+10,y,xb+80,y,"v-t","c")+T(xa-40,y-12,"F","v-lab c","middle")+T(xb+44,y-12,"F","v-lab c","middle");
  else if(k===1) s+=L(xa-76,y,xa-6,y,"v-t","c")+L(xb+82,y,xb+12,y,"v-t","c")+T(xa-40,y-12,"F","v-lab c","middle")+T(xb+44,y-12,"F","v-lab c","middle");
  else if(k===2) s+=L(200,y-r-64,200,y-r-3,"v-t","c")+T(210,y-r-44,"F","v-lab c");
  else if(k===3){ const arc=(cx,sw,dx)=>`<path d="M${(cx-dx*9.2).toFixed(1)} ${(y+19.3).toFixed(1)} A12 30 0 0 ${sw} ${(cx+dx*6).toFixed(1)} ${(y-26).toFixed(1)}" class="v-t" marker-end="url(#m-c)"/>`;
    s+=arc(xa,1,1)+arc(xb,0,-1)+T(xa-20,y-30,"C","v-lab c","end")+T(xb+20,y-30,"C","v-lab c"); }
  else s+=L(192,y-r-64,192,y-r-3,"v-t","c")+L(208,y+r+64,208,y+r+3,"v-t","c")+L(200,y-r-12,200,y+r+12,"v-dash")+T(184,y-r-44,"F","v-lab c","end")+T(216,y+r+50,"F","v-lab c");
  return svg(190,s,"Pièce cylindrique et actions mécaniques extérieures qui lui sont appliquées");
}
/* barre fixée à un mur, sollicitée par F à son extrémité libre : o.comp (compression), o.Flab, o.Llab, o.sec ("rond" | "rect" | "tube"), o.secLab, o.dL (allongement dessiné), o.cap */
function fx_rdm_barre(o){
  const y=92, x0=56, x1=o.dL?284:300, h=18, xe=x1+(o.dL?18:0);
  let s=wall(x0,y-46,y+46)+`<rect x="${x0}" y="${y-h/2}" width="${x1-x0}" height="${h}" class="v-body"/>`;
  if(o.dL) s+=`<rect x="${x1}" y="${y-h/2}" width="${xe-x1}" height="${h}" class="v-dash"/>`;
  s+=o.comp?L(xe+74,y,xe+4,y,"v-t","c"):L(xe+3,y,xe+73,y,"v-t","c");
  s+=T(xe+38,y-14,o.Flab||"F","v-lab c","middle");
  if(o.Llab!==null) s+=L(x1,y+h/2+3,x1,y+56,"v-dash")+cote(x0,x1,y+50,o.Llab||"L0");
  if(o.dL) s+=L(xe,y+h/2+3,xe,y+34,"v-dash")+T(xe+4,y+30,"ΔL","v-cap");
  if(o.sec){ const cx=190, cy=24;
    if(o.sec==="rond") s+=`<circle cx="${cx}" cy="${cy}" r="11" class="v-body"/>`;
    else if(o.sec==="tube") s+=`<circle cx="${cx}" cy="${cy}" r="12" class="v-body"/><circle cx="${cx}" cy="${cy}" r="8" class="v-box"/>`;
    else s+=`<rect x="${cx-16}" y="${cy-5}" width="32" height="10" class="v-body"/>`;
    s+=T(cx-24,cy+4,"section :","v-cap","end")+T(cx+24,cy+4,o.secLab||"","v-lab s"); }
  if(o.cap) s+=T(200,y+82,o.cap,"v-cap","middle");
  return svg(y+(o.cap?92:66),s,"Barre fixée à un mur et sollicitée par une force F à son extrémité");
}
/* poutre en flexion : o.type "console" (encastrée à gauche, F à l'extrémité) ou "appuis" (deux appuis, F au milieu) ; o.pts = [{x, f:"h"|"b"|"n", n}] (face haute, basse ou fibre neutre) */
function fx_rdm_poutre(o){
  const yt=88, yb=128, ym=108; let s="";
  if(o.type==="console"){ const x0=52, x1=344, w=xi=>30*xi*xi*(3-xi)/2, top=[], bot=[];
    for(let i=0;i<=40;i++){ const xi=i/40, x=x0+xi*(x1-x0); top.push(P2([x,yt+w(xi)])); bot.unshift(P2([x,yb+w(xi)])); }
    s+=wall(x0,54,166)+`<rect x="${x0}" y="${yt}" width="${x1-x0}" height="${yb-yt}" class="v-body"/>`;
    s+=`<polygon points="${top.join(" ")} ${bot.join(" ")}" class="v-dash"/>`;
    s+=L(x1-8,24,x1-8,yt-3,"v-t","c")+T(x1-16,42,"F","v-lab c","end")+T(x1-2,yb+46,"déformée (exagérée)","v-cap","end"); }
  else { const x0=40, x1=360, xa=64, xb=336, w=x=>22*Math.sin(Math.PI*(x-xa)/(xb-xa)), top=[], bot=[];
    for(let i=0;i<=40;i++){ const x=xa+i*(xb-xa)/40; top.push(P2([x,yt+w(x)])); bot.unshift(P2([x,yb+w(x)])); }
    s+=`<path d="M${xa} ${yb} l-12 20 h24 z" class="v-box"/>`+ground(xa-24,xa+24,yb+20)+`<circle cx="${xb}" cy="${yb+9}" r="9" class="v-wheel"/>`+ground(xb-24,xb+24,yb+18);
    s+=`<rect x="${x0}" y="${yt}" width="${x1-x0}" height="${yb-yt}" class="v-body"/>`+`<polygon points="${top.join(" ")} ${bot.join(" ")}" class="v-dash"/>`;
    s+=L(200,22,200,yt-3,"v-t","c")+T(208,40,"F","v-lab c")+T(x1,yb+62,"déformée (exagérée)","v-cap","end"); }
  s+=L(o.type==="console"?52:40,ym,o.type==="console"?344:360,ym,"v-inf");
  (o.pts||[]).forEach(p=>{ if(p.f==="n") s+=numLab(p.x,ym,p.n); else { const yy=p.f==="h"?yt:yb; s+=pt(p.x,yy,"",0,0)+L(p.x,yy+(p.f==="h"?-4:4),p.x,yy+(p.f==="h"?-10:10),"v-thin")+numLab(p.x,yy+(p.f==="h"?-21:21),p.n); } });
  return svg(o.type==="console"?184:196,s,o.type==="console"?"Poutre encastrée à gauche et chargée à son extrémité libre, points numérotés":"Poutre sur deux appuis chargée en son milieu, points numérotés");
}
/* même section dans deux positions sous une charge verticale : o.kind "planche" | "profil" ; o.first = position 1 ("plat" | "chant") */
function fx_rdm_sections(o){
  const one=(cx,pos,num)=>{ let t="", top;
    if(o.kind==="planche"){ const W=pos==="plat"?120:22, H=pos==="plat"?22:120; top=152-H; t+=`<rect x="${cx-W/2}" y="${top}" width="${W}" height="${H}" class="v-body"/>`; }
    else if(pos==="chant"){ top=40; t+=`<path d="M${cx-38} 40 h76 v14 h-31 v84 h31 v14 h-76 v-14 h31 v-84 h-31 z" class="v-body"/>`; }
    else { top=58; t+=`<path d="M${cx-56} 58 h14 v31 h84 v-31 h14 v76 h-14 v-31 h-84 v31 h-14 z" class="v-body"/>`; }
    t+=L(cx,4,cx,top-4,"v-t","c")+T(cx+8,20,"F","v-lab c")+T(cx,178,`position ${num}`,"v-cap","middle");
    return t; };
  const s=one(110,o.first,1)+one(290,o.first==="plat"?"chant":"plat",2)+L(20,160,380,160,"v-inf");
  return svg(188,s,"Même section placée dans deux positions sous une charge verticale");
}
/* courbe de traction σ(ε) : o.f (ε en % → σ en MPa), o.xe (fin de la courbe), o.xm, o.xl (étiquettes), o.xg (grille), o.ym, o.yl, o.yg ; o.marks = [{e, s, t, px, py, dx, dy, a}] ; o.rupt : repère de rupture */
function fx_rdm_essai(o){
  const X0=64, Y0=206, W=292, H=164, sx=W/o.xm, sy=H/o.ym, X=e=>X0+e*sx, Y=v=>Y0-v*sy, dx=String(o.xl).split(".")[1]?String(o.xl).split(".")[1].length:0;
  let s="";
  for(let k=0;k*o.xg<=o.xm+1e-9;k++) s+=L(X(k*o.xg),Y0,X(k*o.xg),Y0-H,"v-grid");
  for(let k=0;k*o.yg<=o.ym+1e-9;k++) s+=L(X0,Y(k*o.yg),X0+W,Y(k*o.yg),"v-grid");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-16,"v-ink","k");
  for(let k=0;k*o.xl<=o.xm+1e-9;k++) s+=T(X(k*o.xl),Y0+16,nf(k*o.xl,dx),"v-lab s","middle");
  for(let k=0;k*o.yl<=o.ym+1e-9;k++) s+=T(X0-6,Y(k*o.yl)+4,nf(k*o.yl,0),"v-lab s","end");
  const pts=[]; for(let i=0;i<=400;i++){ const e=o.xe*i/400; pts.push(P2([X(e),Y(o.f(e))])); }
  s+=`<polyline points="${pts.join(" ")}" class="v-curve"/>`;
  if(o.rupt){ const x=X(o.xe), y=Y(o.f(o.xe)); s+=L(x-5,y-5,x+5,y+5,"v-ink")+L(x-5,y+5,x+5,y-5,"v-ink")+Th(x,y-12,"rupture","v-cap","middle"); }
  (o.marks||[]).forEach(m=>{ const x=X(m.e), y=Y(m.s); if(m.px) s+=L(X0,y,x,y,"v-dash"); if(m.py) s+=L(x,y,x,Y0,"v-dash");
    s+=dot(x,y)+Th(x+(m.dx==null?8:m.dx),y+(m.dy==null?-8:m.dy),m.t,"v-lab s",m.a||"start");
    if(m.vx!=null) s+=Th(x,Y0-6,m.vx,"v-lab s c","middle"); if(m.vy!=null) s+=Th(X0+4,y-5,m.vy,"v-lab s c"); });
  s+=T(X0+W+12,Y0+34,"ε (%)","v-cap","end")+T(X0+8,Y0-H-6,"σ (MPa)","v-cap");
  return svg(248,s,"Essai de traction : contrainte σ en fonction de l'allongement relatif ε");
}

/* ===== carte de résultats d'une simulation (contrainte, déplacement ou température), échelle en 8 bandes ===== */
const PAL=["#2b5fb8","#2e86c8","#38aec4","#56c38e","#a2cf55","#eec83b","#f0902f","#d6402b"];
/* o.x, o.y, o.w, o.h (cadre), o.nx, o.ny (cellules), o.f(u, v) valeur au point (u, v ∈ [0, 1]), o.mask(u, v), o.v0, o.v1 (bornes de l'échelle, v1 = maximum),
   o.dec (décimales des graduations), o.unit, o.title, o.pre / o.post (SVG sous / sur la carte), o.labs = [{u, v, t}], o.H (hauteur) */
function fx_carte(o){
  const nb=PAL.length, v0=o.v0||0, dv=(o.v1-v0)/nb, cw=o.w/o.nx, ch=o.h/o.ny;
  let s=o.pre||"";
  for(let j=0;j<o.ny;j++){ let run=null;
    const flush=()=>{ if(run&&run.b>=0) s+=`<rect x="${(o.x+run.i*cw).toFixed(1)}" y="${(o.y+j*ch).toFixed(1)}" width="${(run.n*cw+0.6).toFixed(1)}" height="${(ch+0.6).toFixed(1)}" style="fill:${PAL[run.b]}"/>`; };
    for(let i=0;i<o.nx;i++){ const u=(i+0.5)/o.nx, v=(j+0.5)/o.ny; let b=-1;
      if(!o.mask||o.mask(u,v)) b=Math.max(0,Math.min(nb-1,Math.floor((o.f(u,v)-v0)/dv)));
      if(run&&run.b===b) run.n++; else { flush(); run={i,b,n:1}; } }
    flush(); }
  s+=o.post||"";
  const lx=o.lx||344, ly=o.ly||34, lh=16;
  for(let k=0;k<nb;k++) s+=`<rect x="${lx}" y="${ly+(nb-1-k)*lh}" width="14" height="${lh}" style="fill:${PAL[k]}"/>`;
  s+=`<rect x="${lx}" y="${ly}" width="14" height="${nb*lh}" class="v-thin"/>`;
  for(let k=0;k<=nb;k+=2) s+=T(lx+19,ly+(nb-k)*lh+4,nf(v0+k*dv,o.dec==null?0:o.dec),"v-sm");
  s+=T(lx+7,ly-8,o.unit,"v-cap","middle")+(o.title?T(8,16,o.title,"v-cap"):"");
  /* repères : pastille sur la carte, ou sonde (point + trait de rappel) si l'étiquette est placée hors de la carte (lx, ly) */
  (o.labs||[]).forEach(p=>{ const px=o.x+p.u*o.w, py=o.y+p.v*o.h;
    if(p.lx==null){ s+=numLab(px,py,p.t); return; }
    const dx=px-p.lx, dy=py-p.ly, d=Math.hypot(dx,dy)||1;
    s+=L(p.lx+dx/d*11,p.ly+dy/d*11,px,py,"v-thin")+`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.2" class="v-numc"/>`+numLab(p.lx,p.ly,p.t); });
  return svg(o.H,s,o.alt||"Carte de résultats d'une simulation, échelle de couleurs");
}
/* simulation d'une console encastrée à gauche, chargée à son extrémité : o.max, o.disp (carte des déplacements), o.labs, o.dec, o.unit */
function fx_rdm_femConsole(o){
  const x=40, y=70, w=276, h=54;
  const f=o.disp?(u)=>o.max*u*u*(3-u)/2:(u,v)=>o.max*(1-u)*Math.abs(2*v-1);
  const pre=wall(x,y-22,y+h+22), post=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="v-thin"/>`+L(x+w-8,y-60,x+w-8,y-3,"v-t","c")+T(x+w-16,y-42,"F","v-lab c","end");
  return fx_carte({x,y,w,h,nx:46,ny:12,f,v1:o.max,dec:o.dec,unit:o.unit,title:o.disp?"Déplacement vertical":"Contrainte équivalente de Von Mises",pre,post,labs:o.labs,H:176,
    alt:o.disp?"Carte des déplacements d'une poutre encastrée chargée à son extrémité":"Carte des contraintes d'une poutre encastrée chargée à son extrémité"});
}
/* simulation d'une plaque percée tendue (solution de Kirsch) : o.max (au bord du trou), o.labs = lettres des zones [bord du trou ⟂ effort, bord du trou dans l'axe, extrémité, bord de la plaque] */
function fx_rdm_femPlaque(o){
  const x=44, y=56, w=252, h=112, cx=x+w/2, cy=y+h/2, a=24, nx=84, ny=36;
  /* contrainte de Von Mises pour une contrainte unité loin du trou */
  const vm1=(px,py)=>{ const dx=px-cx, dy=py-cy, r=Math.hypot(dx,dy), q=a*a/(r*r), c2=(dx*dx-dy*dy)/(r*r), s2=2*dx*dy/(r*r);
    const srr=(1-q)/2+(1-4*q+3*q*q)*c2/2, stt=(1+q)/2-(1+3*q*q)*c2/2, trt=-(1+2*q-3*q*q)*s2/2;
    return Math.sqrt(srr*srr-srr*stt+stt*stt+3*trt*trt); };
  /* mise à l'échelle : la cellule la plus sollicitée affichée vaut exactement o.max (haut de l'échelle) */
  let vmx=0; for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const px=x+(i+0.5)/nx*w, py=y+(j+0.5)/ny*h; if(Math.hypot(px-cx,py-cy)>=a) vmx=Math.max(vmx,vm1(px,py)); }
  const vm=(px,py)=>vm1(px,py)*o.max/vmx;
  const L4=o.labs||["A","B","C","D"], labs=[{u:0.5,v:(h/2-a-3)/h,t:L4[0],lx:cx+34,ly:36},{u:(w/2-a-6)/w,v:0.5,t:L4[1],lx:cx-58,ly:190},{u:(w-18)/w,v:0.72,t:L4[2],lx:x+w-4,ly:190},{u:(w/2+70)/w,v:7/h,t:L4[3],lx:cx+88,ly:36}];
  const post=`<circle cx="${cx}" cy="${cy}" r="${a}" class="v-box"/><rect x="${x}" y="${y}" width="${w}" height="${h}" class="v-thin"/>`+L(x-3,cy,x-40,cy,"v-t","c")+L(x+w+3,cy,x+w+40,cy,"v-t","c")+T(x-24,cy-10,"F","v-lab c","middle")+T(x+w+24,cy-10,"F","v-lab c","middle");
  return fx_carte({x,y,w,h,nx,ny,f:(u,v)=>vm(x+u*w,y+v*h),mask:(u,v)=>Math.hypot(x+u*w-cx,y+v*h-cy)>=a,v1:o.max,dec:o.dec,unit:"MPa",title:"Contrainte équivalente de Von Mises",post,labs,H:206,ly:42,
    alt:"Carte des contraintes d'une plaque percée tendue par deux efforts opposés"});
}

/* ======================================================================
   FIGURES : THERMIQUE (préfixe fx_th_)
   ====================================================================== */
/* une couche de paroi dans le rectangle (x, y, w, h) : m = "beton" | "isolant" | "platre" | "bois" | "metal" | "verre" | "plast" */
function fx_th_couche(x,y,w,h,m){
  const R=c=>`<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" class="${c}"/>`;
  if(m==="isolant"){ const p=[]; for(let yy=y+4,i=0;yy<=y+h-4;yy+=7,i++) p.push(P2([i%2?x+w-4:x+4,yy])); return R("v-box")+`<polyline points="${p.join(" ")}" class="v-thin"/>`; }
  if(m==="beton"){ let s=R("v-body"); for(let yy=y+9,i=0;yy<y+h-4;yy+=13,i++) for(let xx=x+5+(i%2?5:0);xx<x+w-3;xx+=10) s+=`<circle cx="${xx.toFixed(1)}" cy="${yy}" r="1.3" class="v-pt"/>`; return s; }
  if(m==="bois"){ let s=R("v-block"); for(let xx=x+5;xx<x+w-2;xx+=6) s+=L(xx,y+3,xx,y+h-3,"v-hatch"); return s; }
  if(m==="platre"){ let s=R("v-block"); for(let yy=y+6;yy<y+h;yy+=11) s+=L(x+2,yy,x+w-2,yy-6,"v-hatch"); return s; }
  if(m==="metal"){ let s=R("v-body"); for(let yy=y+4;yy<y+h;yy+=5) s+=L(x,yy,x+w,yy-3,"v-hatch"); return s; }
  if(m==="verre") return `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" class="v-box" style="fill:var(--accent);fill-opacity:.14"/>`;
  return R("v-block");
}
/* paroi multicouche en coupe : o.c = [{m, e}] de gauche à droite ; o.T = textes des températures aux n + 1 frontières (null : rien) ;
   o.Tv = valeurs numériques (profil de température tracé) ; o.lg, o.ld : légendes des côtés ; o.dir = +1 flux vers la droite, −1 vers la gauche */
function fx_th_paroi(o){
  const n=o.c.length, tot=o.c.reduce((a,c)=>a+c.e,0), ws=o.c.map(c=>Math.max(40,c.e/tot*210)), Wp=ws.reduce((a,b)=>a+b,0), x0=200-Wp/2, y1=70, y2=200, xs=[x0];
  ws.forEach(w=>xs.push(xs[xs.length-1]+w));
  let s="";
  o.c.forEach((c,i)=>{ s+=fx_th_couche(xs[i],y1,ws[i],y2-y1,c.m)+numLab(xs[i]+ws[i]/2,y2+18,String(i+1)); });
  s+=L(x0,y1-6,x0,y2+4,"v-ink")+L(xs[n],y1-6,xs[n],y2+4,"v-ink");
  if(o.Tv){ const tmax=Math.max(...o.Tv), tmin=Math.min(...o.Tv), Y=t=>y1+14+(tmax-t)/(tmax-tmin)*(y2-y1-28);
    s+=`<polyline points="${xs.map((x,i)=>P2([x,Y(o.Tv[i])])).join(" ")}" class="v-curve"/>`+xs.map((x,i)=>dot(x,Y(o.Tv[i]))).join(""); }
  (o.T||[]).forEach((t,i)=>{ if(t==null) return; const yy=y1-12-(i%2)*18; s+=L(xs[i],yy+4,xs[i],y1-6,"v-thin")+Th(xs[i],yy,t,/\?/.test(t)?"v-lab s c":"v-lab s","middle"); });
  s+=T(x0-8,y2-6,o.lg||"extérieur","v-cap","end")+T(xs[n]+8,y2-6,o.ld||"intérieur","v-cap");
  if(o.dir){ const a=x0-16, b=xs[n]+16; s+=(o.dir>0?L(a-30,y1+40,a,y1+40,"v-t","c")+L(b,y1+40,b+30,y1+40,"v-t","c"):L(a,y1+40,a-30,y1+40,"v-t","c")+L(b+30,y1+40,b,y1+40,"v-t","c"))+T(o.dir>0?a-34:b+34,y1+30,"Φ","v-lab c",o.dir>0?"start":"end"); }
  return svg(y2+34,s,o.alt||"Paroi multicouche vue en coupe, couches numérotées et températures aux frontières");
}
/* composant électronique fixé sur un dissipateur (vue en coupe) et, si o.sch, schéma thermique équivalent en dessous.
   o.P : texte de la puissance ; o.T = {j, b, d, a} : textes des nœuds ; o.R = {jb, bd, da} : valeurs des résistances */
function fx_th_dissip(o){
  const T4=o.T||{}, R3=o.R||{}, X=v=>v-40;       /* dessin décalé vers la gauche : place pour les étiquettes à droite */
  let s=`<rect x="${X(110)}" y="98" width="180" height="11" class="v-body"/>`;
  for(let i=0;i<11;i++){ const x=X(112+i*17); s+=`<rect x="${x}" y="109" width="5" height="50" class="v-body"/>`; }
  s+=`<rect x="${X(160)}" y="95" width="80" height="3" style="fill:var(--coulomb);fill-opacity:.75;stroke:none"/>`;
  s+=`<rect x="${X(160)}" y="85" width="80" height="10" class="v-block"/><rect x="${X(170)}" y="60" width="60" height="25" rx="2" class="v-body"/><rect x="${X(193)}" y="67" width="14" height="10" style="fill:var(--coulomb);fill-opacity:.5;stroke:none"/>`;
  s+=L(X(170),66,X(132),66)+L(X(170),72,X(132),72)+L(X(170),78,X(132),78);
  s+=L(X(207),72,X(262),40,"v-thin")+T(X(266),38,T4.j||"Tj : jonction","v-lab s")+L(X(240),90,X(300),70,"v-thin")+T(X(304),74,T4.b||"Tb : boîtier","v-lab s")+L(X(290),104,X(304),118,"v-thin")+T(X(308),122,T4.d||"Td : dissipateur","v-lab s");
  s+=T(X(200),190,T4.a||"Ta : air ambiant","v-lab s","middle")+T(4,94,"pâte","v-cap")+T(4,106,"thermique","v-cap")+L(68,99,X(158),97,"v-thin");
  s+=L(X(140),162,X(140),178,"v-t","c")+L(X(200),162,X(200),178,"v-t","c")+L(X(260),162,X(260),178,"v-t","c")+T(X(272),176,"Φ","v-lab c");
  if(o.P) s+=T(8,20,o.P,"v-lab s");
  let h=200;
  if(o.sch){ const y=246, xs=[44,148,252,356], nm=[["Rjb",R3.jb],["Rbd",R3.bd],["Rda",R3.da]];
    s+=L(44,y,356,y,"v-ink")+L(52,y-30,348,y-30,"v-t","c")+T(200,y-36,o.phi||"Φ = P","v-lab s c","middle");
    nm.forEach((r,i)=>{ const cx=(xs[i]+xs[i+1])/2; s+=`<rect x="${cx-28}" y="${y-9}" width="56" height="18" class="v-box"/>`+T(cx,y-14,r[0],"v-lab s","middle")+(r[1]?T(cx,y+26,r[1],"v-sm","middle"):""); });
    ["j","b","d","a"].forEach((k,i)=>{ s+=`<circle cx="${xs[i]}" cy="${y}" r="4" class="v-pt"/>`+T(xs[i],y+44,{j:"Tj",b:"Tb",d:"Td",a:"Ta"}[k],"v-lab s","middle"); });
    h=y+56; }
  return svg(h,s,o.sch?"Composant fixé sur un dissipateur et schéma thermique équivalent : résistances en série de la jonction à l'air":"Composant électronique fixé sur un dissipateur à ailettes, refroidi par l'air ambiant");
}
/* schéma thermique équivalent : o.n = noms des k + 1 nœuds, o.r = [[nom, valeur]] (k résistances en série), o.phi, o.cap */
function fx_th_serie(o){
  const k=o.r.length, x0=44, x1=356, dx=(x1-x0)/k, y=70, w=Math.min(64,dx-36);
  let s=L(x0,y,x1,y,"v-ink")+L(x0+8,y-38,x1-8,y-38,"v-t","c")+T(200,y-45,o.phi||"Φ","v-lab s c","middle");
  o.r.forEach((r,i)=>{ const cx=x0+dx*(i+0.5); s+=`<rect x="${(cx-w/2).toFixed(1)}" y="${y-9}" width="${w.toFixed(1)}" height="18" class="v-box"/>`+T(cx,y-14,r[0],"v-lab s","middle")+(r[1]?T(cx,y+26,r[1],"v-sm","middle"):""); });
  o.n.forEach((nm,i)=>{ const x=x0+dx*i; s+=`<circle cx="${x.toFixed(1)}" cy="${y}" r="4" class="v-pt"/>`+T(x,y+46,nm,"v-lab s","middle"); });
  let h=y+58; if(o.cap){ s+=T(200,h+4,o.cap,"v-cap","middle"); h+=16; }
  return svg(h,s,"Schéma thermique équivalent : résistances thermiques en série");
}
/* enceinte vue en coupe : o.k = "froid" | "glaciere" | "local" | "boitier" | "refuge" ; o.ti, o.te : textes ; o.dir : +1 sortant, −1 entrant, 0 inconnu ; o.src : source interne ; o.lab */
function fx_th_enceinte(o){
  const x1=100, x2=300, y1=48, y2=186, ep=o.k==="boitier"?7:14, rx=o.k==="glaciere"?12:2, ym=124;
  let s="";
  if(o.k==="local"||o.k==="refuge") s+=ground(56,344,y2);
  s+=`<rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="${rx}" class="v-body"/><rect x="${x1+ep}" y="${y1+ep}" width="${x2-x1-2*ep}" height="${y2-y1-2*ep}" rx="${rx?rx-5:0}" class="v-box"/>`;
  if(o.k!=="boitier"){ const zz=(xa,ya,xb,yb,hor)=>{ const p=[]; const n=Math.round((hor?xb-xa:yb-ya)/7); for(let i=0;i<=n;i++){ const t=i/n; p.push(hor?P2([xa+t*(xb-xa),i%2?ya+3:yb-3]):P2([i%2?xa+3:xb-3,ya+t*(yb-ya)])); } return `<polyline points="${p.join(" ")}" class="v-thin"/>`; };
    s+=zz(x1,y1+14,x1+ep,y2-14,false)+zz(x2-ep,y1+14,x2,y2-14,false)+zz(x1+14,y1,x2-14,y1+ep,true)+zz(x1+14,y2-ep,x2-14,y2,true); }
  if(o.k==="glaciere") s+=`<path d="M168 ${y1} v-12 h64 v12" class="v-ink" style="stroke-width:3"/>`;
  if(o.k==="boitier") s+=`<rect x="130" y="${y2-34}" width="140" height="8" class="v-block"/><rect x="146" y="${y2-44}" width="22" height="10" class="v-body"/><rect x="190" y="${y2-42}" width="16" height="8" class="v-body"/><rect x="226" y="${y2-46}" width="26" height="12" class="v-body"/>`;
  if(o.k==="local") s+=`<rect x="${x2-ep}" y="${ym-26}" width="${ep}" height="34" class="v-box" style="fill:var(--accent);fill-opacity:.18"/>`;
  const ar=(xa,ya,xb,yb)=>o.dir>0?L(xa,ya,xb,yb,"v-t","c"):o.dir<0?L(xb,yb,xa,ya,"v-t","c"):L(xa,ya,xb,yb,"v-dash");
  s+=ar(x1+ep+24,ym,x1-36,ym)+ar(x2-ep-24,ym,x2+36,ym)+ar(200,y1+ep+22,200,y1-36);
  s+=o.dir?T(x1-40,ym-10,"Φ","v-lab c","end"):T(x1-44,ym+8,"?","v-q","middle")+T(x2+44,ym+8,"?","v-q","middle");
  const bt=o.k==="boitier";                                   /* boîtier : textes au-dessus de la carte électronique dessinée */
  if(o.ti) s+=T(200,bt?ym+2:ym+4,o.ti,"v-lab","middle");
  if(o.src) s+=T(200,bt?ym-20:ym+24,o.src,"v-lab s","middle");
  if(o.te) s+=T(8,22,o.te,"v-lab s");
  if(o.lab) s+=T(392,22,o.lab,"v-cap","end");
  return svg(y2+(o.k==="local"||o.k==="refuge"?22:10),s,o.alt||"Enceinte vue en coupe : parois, températures intérieure et extérieure, sens du flux thermique");
}
/* résistance thermique d'un dissipateur selon la longueur du profilé : o.f(L), o.xm, o.xg, o.xl, o.ym, o.yg, o.yl, o.x0 (début de la courbe) */
function fx_th_courbe(o){
  const X0=62, Y0=206, W=296, H=164, sx=W/o.xm, sy=H/o.ym, X=x=>X0+x*sx, Y=v=>Y0-v*sy;
  let s="";
  for(let k=0;k*o.xg<=o.xm+1e-9;k++) s+=L(X(k*o.xg),Y0,X(k*o.xg),Y0-H,"v-grid");
  for(let k=0;k*o.yg<=o.ym+1e-9;k++) s+=L(X0,Y(k*o.yg),X0+W,Y(k*o.yg),"v-grid");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-16,"v-ink","k");
  for(let k=0;k*o.xl<=o.xm+1e-9;k++) s+=T(X(k*o.xl),Y0+16,nf(k*o.xl,0),"v-lab s","middle");
  for(let k=0;k*o.yl<=o.ym+1e-9;k++) s+=T(X0-6,Y(k*o.yl)+4,nf(k*o.yl,1),"v-lab s","end");
  const pts=[]; for(let i=0;i<=200;i++){ const x=o.x0+(o.xm-o.x0)*i/200, v=o.f(x); if(v<=o.ym) pts.push(P2([X(x),Y(v)])); }
  s+=`<polyline points="${pts.join(" ")}" class="v-curve"/>`;
  s+=T(X0+W+12,Y0+34,"longueur du profilé L (mm)","v-cap","end")+T(X0+8,Y0-H-6,"Rda (K/W)","v-cap");
  return svg(248,s,"Résistance thermique du dissipateur en fonction de la longueur du profilé");
}
/* simulation thermique d'une carte électronique : o.c = [{u, v, dT, n}] composants (position, échauffement, nom), o.Tb (température de la carte loin des composants), o.v0, o.v1 */
function fx_th_pcb(o){
  const x=24, y=40, w=300, h=136, sp=30;
  const f=(u,v)=>o.Tb+o.c.reduce((a,c)=>{ const dx=(u-c.u)*w, dy=(v-c.v)*h; return a+c.dT*Math.exp(-(dx*dx+dy*dy)/(2*sp*sp)); },0);
  let post=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="v-thin"/>`;
  o.c.forEach(c=>{ const cx=x+c.u*w, cy=y+c.v*h; post+=`<rect x="${(cx-15).toFixed(1)}" y="${(cy-11).toFixed(1)}" width="30" height="22" rx="2" class="v-thin"/>`+Th(cx,cy+31,c.n,"v-lab s","middle"); });
  return fx_carte({x,y,w,h,nx:75,ny:34,f,v0:o.v0,v1:o.v1,dec:1,unit:"°C",title:"Simulation thermique : température de la carte",post,H:190,lx:346,ly:40,
    alt:"Carte des températures d'une carte électronique et de ses composants"});
}

/* ======================================================================
   RÉSISTANCE DES MATÉRIAUX
   ====================================================================== */
/* matériaux : valeurs usuelles (bois : sens des fibres, valeurs indicatives ; PLA : pièce imprimée pleine) */
const MR={
  s235:{nm:"acier S235",c:"acier",E:210000,Re:235,Rm:360,rho:7850},
  s355:{nm:"acier S355",c:"acier",E:210000,Re:355,Rm:510,rho:7850},
  alu:{nm:"alliage d'aluminium",c:"aluminium",E:70000,Re:240,Rm:290,rho:2700},
  ti:{nm:"alliage de titane",c:"titane",E:110000,Re:830,Rm:900,rho:4430},
  bois:{nm:"bois de pin",tn:"Bois de pin (sens des fibres)",c:"bois",E:11000,Re:40,rho:500},
  pla:{nm:"PLA imprimé",c:"PLA",E:3500,Re:50,rho:1250}
};
const colE=["E (MPa)",m=>nf(m.E,0)], colRe=["Re (MPa)",m=>nf(m.Re,0)], colRho=["ρ (kg/m³)",m=>nf(m.rho,0)];
const nmT=k=>MR[k].tn||cap1(MR[k].nm);                                  /* nom dans un tableau ou un choix */
const tabM=(ks,cols)=>table(["Matériau",...cols.map(c=>c[0])],ks.map(k=>[nmT(k),...cols.map(c=>c[1](MR[k]))]));
const SOL=["Traction","Compression","Flexion","Torsion","Cisaillement"];
const SIT=[
  ["le câble d'un treuil qui soulève une charge",0,"Le câble est tiré par la charge à une extrémité et retenu par le tambour à l'autre : deux efforts opposés, portés par son axe, l'allongent."],
  ["le hauban qui retient le mât d'une éolienne sur un atoll",0,"Le hauban est tiré entre son ancrage au sol et le haut du mât : deux efforts opposés, portés par son axe, l'allongent."],
  ["la suspente verticale qui porte le tablier d'une passerelle",0,"La suspente est tirée vers le bas par le tablier et retenue en haut : elle s'allonge."],
  ["la chaîne d'ancre d'un bateau au mouillage, tendue par le courant",0,"La chaîne est tirée par le bateau et retenue par l'ancre : elle ne peut travailler qu'en étant tendue."],
  ["un pied de table sur laquelle on a posé une lourde charge",1,"Le pied est poussé par le plateau en haut et par le sol en bas : deux efforts opposés, portés par son axe, le raccourcissent."],
  ["un pilotis qui porte un bungalow au-dessus du lagon",1,"Le pilotis est poussé par le bungalow en haut et par le fond du lagon en bas : il se raccourcit."],
  ["le poteau vertical qui soutient la toiture d'un fare",1,"Le poteau est poussé par la toiture en haut et par le sol en bas : il se raccourcit."],
  ["une étagère posée sur deux supports et chargée en son milieu",2,"La charge est perpendiculaire à la planche, qui se courbe : sa face inférieure s'allonge, sa face supérieure se raccourcit."],
  ["un plongeoir encastré à une extrémité, avec un nageur debout à l'autre",2,"Le poids du nageur est perpendiculaire à la planche, encastrée à l'autre bout : elle se courbe."],
  ["le bras d'un drone, qui porte un moteur à son extrémité",2,"La poussée du moteur est perpendiculaire au bras, fixé au corps du drone : le bras se courbe."],
  ["l'arbre qui relie le moteur à l'hélice d'un bateau",3,"Le moteur exerce un couple à une extrémité, l'hélice un couple opposé à l'autre : l'arbre se tord autour de son axe."],
  ["la tige d'un tournevis qui desserre une vis bloquée",3,"La main exerce un couple sur le manche, la vis bloquée un couple opposé sur la lame : la tige se tord autour de son axe."],
  ["l'axe court qui relie, sans jeu, la chape d'un bras à la tige d'un vérin (les flasques de la chape encadrent l'œil de la tige au plus près)",4,"Les flasques de la chape et l'œil de la tige exercent sur l'axe des efforts opposés, perpendiculaires à son axe et appliqués presque dans la même section : l'axe étant court et sans jeu, la flexion est négligeable, et deux sections voisines tendent à glisser l'une sur l'autre."],
  ["un rivet qui assemble deux tôles tirées en sens opposés",4,"Chaque tôle pousse le rivet dans un sens opposé, perpendiculairement à son axe, de part et d'autre du plan de contact : le rivet tend à être coupé."],
  ["la goupille qui traverse le moyeu d'une roue dentée et son arbre, pour transmettre le couple",4,"Le moyeu et l'arbre exercent sur la goupille des efforts opposés, perpendiculaires à son axe, de part et d'autre de leur surface de contact : deux sections voisines tendent à glisser l'une sur l'autre, la goupille tend à être coupée. Elle transmet le couple, mais elle n'est pas tordue autour de son propre axe."]
];
const deLa=k=>k===4?"du":"de la";
/* loi σ(ε) d'un essai de traction (ε en %) : droite élastique, palier éventuel jusqu'à ep, écrouissage jusqu'à Rm (em), striction jusqu'à la rupture (er, sr) */
const loiT=c=>{ const ee=c.Re/c.E*100, ep=Math.max(c.ep||0,ee);
  return e=>{ if(e<=ee) return c.E*e/100; if(e<=ep) return c.Re;
    if(e<=c.em){ const t=(c.em-e)/(c.em-ep); return c.Re+(c.Rm-c.Re)*(1-t*t); }
    const t=Math.min(1,(e-c.em)/(c.er-c.em)); return c.Rm-(c.Rm-c.sr)*t*t; }; };
/* conclusion à deux exigences : résistance (coefficient de sécurité) et déformation (w : « l'allongement » ou « la flèche ») */
const C4=w=>["Oui : les deux exigences sont satisfaites",`Non : la résistance convient, mais ${w} est trop grand${w==="la flèche"?"e":""}`,`Non : ${w} convient, mais le coefficient de sécurité est insuffisant`,"Non : aucune des deux exigences n'est satisfaite"];

const R1=[
/* reconnaître une sollicitation à partir d'une situation */
()=>{ const [sit,k,why]=rnd(SIT);
  return {q:`Quelle sollicitation principale subit ${sit} ?`,type:"ch",ch:SOL,ok:k,
    expl:`${why} Sollicitation principale : ${F(SOL[k].toLowerCase())}.`}; },
/* reconnaître une sollicitation sur une figure */
()=>{ const k=rnd([0,1,2,3,4]);
  const E=["Deux forces opposées, portées par l'axe et dirigées vers l'extérieur, tirent la pièce : elle s'allonge.",
    "Deux forces opposées, portées par l'axe et dirigées vers la pièce, la poussent : elle se raccourcit.",
    "La force est perpendiculaire à la pièce, posée sur deux appuis : elle se courbe, sa face inférieure s'allonge et sa face supérieure se raccourcit.",
    "Deux couples opposés, autour de l'axe de la pièce, la tordent.",
    "Deux forces opposées, perpendiculaires à l'axe et presque dans la même section, tendent à faire glisser deux sections voisines l'une sur l'autre."];
  return {fig:fx_rdm_sollic(k),ctx:"F désigne une force, C un couple ; l'axe de la pièce est en tirets.",q:"La figure montre les actions mécaniques extérieures appliquées à une pièce cylindrique. Quelle sollicitation subit-elle ?",type:"ch",ch:SOL,ok:k,
    expl:`${E[k]} C'est ${deLa(k)} ${F(SOL[k].toLowerCase())}.`}; },
/* contrainte normale σ = F/S */
()=>{ const C=rnd([["Un tirant en acier qui retient un auvent",0,[50,80,100,120,150,200],[4,5,6,8,10,12,15,20]],["La suspente d'une passerelle",1,[100,150,200,250,300],[5,6,8,10,12,15,20,25,30]],
      ["Le câble d'un palan",0,[20,28,38,50,64],[1.5,2,2.5,3,4,5,6]],["La tige d'un vérin qui tire une porte coulissante",1,[50,80,100,120],[1,1.5,2,3,4,5]]]);
  const o=draw(()=>({S:rnd(C[2]),Fk:rnd(C[3])}),o=>{ const sg=o.Fk*1000/o.S; return sg>=15&&sg<=180; }), Fn=o.Fk*1000, sg=Fn/o.S;
  return {fig:fx_rdm_barre({Flab:`F = ${nf(o.Fk,1)} kN`,sec:"rond",secLab:`S = ${o.S} mm²`,Llab:null}),ctx:`${C[0]} est tendu${C[1]?"e":""} par une force F = ${nf(o.Fk,1)} kN. Section${C[0].includes("câble")?" métallique utile":""} : S = ${o.S} mm².`,
    q:"Quelle contrainte normale σ règne dans sa section ?",type:"num",ans:sg,tolR:0.02,unit:"MPa",
    expl:`F = ${nf(o.Fk,1)} kN = ${nf(Fn,0)} N. ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),o.S)} = ${U(sg,"MPa")}. Avec F en N et S en mm², σ est en N/mm², c'est-à-dire en MPa.`}; },
/* allongement relatif ε = ΔL/L0 */
()=>{ if(Math.random()<0.5){ const L0=rnd([50,80,100,120,150]), e=rnd([0.06,0.08,0.1,0.12,0.15,0.18,0.2,0.24,0.3]), dL=Math.round(L0*e*10)/1000, eps=dL/L0;
    return {ctx:`Pendant un essai de traction, une éprouvette de longueur initiale L0 = ${L0} mm s'allonge de ΔL = ${nf(dL,3)} mm.`,
      q:"Calcule l'allongement relatif ε de l'éprouvette, en %.",type:"num",ans:eps*100,tolR:0.02,unit:"%",
      expl:`${F(`ε = ${FRAC("ΔL","L0")}`)} = ${FRAC(nf(dL,3),L0)} = ${nf(eps,6)} (sans unité), soit ${U(eps*100,"%")}.`}; }
  const L0=rnd([4,6,8,10,12,15]), e=rnd([0.03,0.04,0.05,0.06,0.08,0.1,0.12]), dL=Math.round(L0*e*100)/10, eps=dL/(L0*1000);
  return {ctx:`Sous l'effet du vent, un hauban de longueur L0 = ${L0} m s'allonge de ΔL = ${nf(dL,1)} mm.`,
    q:"Calcule l'allongement relatif ε du hauban, en %.",type:"num",ans:eps*100,tolR:0.02,unit:"%",
    expl:`Il faut ΔL et L0 dans la même unité : L0 = ${L0} m = ${nf(L0*1000,0)} mm. ${F(`ε = ${FRAC("ΔL","L0")}`)} = ${FRAC(nf(dL,1),nf(L0*1000,0))} = ${nf(eps,6)}, soit ${U(eps*100,"%")}.`}; },
/* loi de Hooke σ = E·ε, dans les deux sens */
()=>{ const [k,eps]=rnd([["s235",[0.02,0.03,0.04,0.05,0.06,0.07,0.08]],["alu",[0.05,0.08,0.1,0.12,0.15,0.2,0.25]],["ti",[0.1,0.2,0.3,0.4,0.5,0.6]],["pla",[0.3,0.4,0.5,0.6,0.8,1,1.2]]]), m=MR[k], ep=rnd(eps), sg=m.E*ep/100;
  if(Math.random()<0.5) return {ctx:`Une jauge de déformation collée sur une pièce en ${m.nm} (E = ${nf(m.E,0)} MPa) mesure un allongement relatif ε = ${nf(ep,2)} %.`,
    q:"Quelle contrainte normale en déduis-tu par la loi de Hooke ?",type:"num",ans:sg,tolR:0.02,unit:"MPa",
    expl:`ε = ${nf(ep,2)} % = ${nf(ep/100,4)}. ${F("σ = E·ε")} = ${nf(m.E,0)} × ${nf(ep/100,4)} = ${U(sg,"MPa")}. C'est moins que Re = ${m.Re} MPa : on est bien dans le domaine élastique, où la loi de Hooke s'applique.`};
  return {ctx:`Dans une pièce en ${m.nm} (E = ${nf(m.E,0)} MPa), la contrainte normale vaut σ = ${S3(sg)} MPa (domaine élastique).`,
    q:"Quel allongement relatif ε subit la pièce, en % ?",type:"num",ans:ep,tolR:0.02,unit:"%",
    expl:`${F("σ = E·ε")}, donc ${F(`ε = ${FRAC("σ","E")}`)} = ${FRAC(S3(sg),nf(m.E,0))} = ${nf(ep/100,5)}, soit ${U(ep,"%")}.`}; },
/* coefficient de sécurité s = Re/σmax */
()=>{ const [k,sgs]=rnd([["s235",[40,50,60,70,80,90,110,120,140,160]],["s355",[60,80,100,120,150,180,200,220]],["alu",[40,50,60,75,80,90,100,120,150]],["pla",[8,10,12,15,18,20,25,30]],["bois",[6,8,10,12,15,20]]]);
  const m=MR[k], sg=rnd(sgs), s=m.Re/sg, who=rnd(["Une simulation par éléments finis","Le calcul de résistance"]);
  return {ctx:`${who} donne une contrainte maximale σmax = ${sg} MPa dans une pièce en ${m.nm} (Re = ${m.Re} MPa).`,
    q:"Calcule le coefficient de sécurité s de cette pièce.",type:"num",ans:s,tolA:0.02,unit:"",
    expl:`${F(`s = ${FRAC("Re","σmax")}`)} = ${FRAC(m.Re,sg)} = ${U(s,"")}. La charge pourrait être multipliée par ${S3(s)} avant que la contrainte n'atteigne la limite élastique.`}; },
/* contrainte admissible σadm = Re/s */
()=>{ const [pc,k]=rnd([["une élingue de levage","s355"],["la patte d'accroche d'un palan","s235"],["une barre de remorquage","s355"],["le tirant d'une nacelle","s235"],["une biellette de drone","alu"],["un support de capteur","pla"]]), m=MR[k];
  const s=rnd(k==="pla"?[3,4,5]:[1.5,2,2.5,3,4,5]), sa=m.Re/s;
  return {ctx:`Pour ${pc} en ${m.nm} (Re = ${m.Re} MPa), le cahier des charges impose un coefficient de sécurité s = ${nf(s,1)}.`,
    q:"Quelle contrainte maximale admissible ne faut-il pas dépasser dans cette pièce ?",type:"num",ans:sa,tolR:0.02,unit:"MPa",
    expl:`${F(`σadm = ${FRAC("Re","s")}`)} = ${FRAC(m.Re,nf(s,1))} = ${U(sa,"MPa")}. Il faut σmax ≤ ${S3(sa)} MPa : le coefficient de sécurité couvre les incertitudes sur les charges, sur le matériau et sur le modèle de calcul.`}; },
/* unités et définitions */
()=>{ const v=rnd([0,1,2,3,4]);
  if(v===0) return {q:"Une contrainte de 1 MPa correspond à :",type:"ch",...mc("1 N/mm²",["1 N/m²","1 kN/mm²","1 N/cm²"]),
    expl:`1 MPa = 10<sup>6</sup> Pa = 10<sup>6</sup> N/m², et 1 m² = 10<sup>6</sup> mm² : ${F("1 MPa = 1 N/mm²")}. C'est pourquoi on calcule σ avec F en N et S en mm².`};
  if(v===1){ const [nm,E]=rnd([["de l'acier",210],["de l'aluminium",70],["du titane",110]]);
    return {q:`Le module d'Young ${nm} vaut ${E} GPa. Quelle valeur de E faut-il utiliser dans ΔL = ${FRAC("F·L0","E·S")}, avec F en N, L0 en mm et S en mm² ?`,type:"ch",...mc(`${nf(E*1000,0)} MPa`,[`${E} MPa`,`${nf(E*100,0)} MPa`,`${nf(E*1e6,0)} MPa`]),
      expl:`${F("1 GPa = 1 000 MPa")} : E = ${E} GPa = ${nf(E*1000,0)} MPa = ${nf(E*1000,0)} N/mm², cohérent avec F en N et les longueurs en mm.`}; }
  if(v===2) return {q:"Quelle est l'unité de l'allongement relatif ε ?",type:"ch",...mc("Aucune : c'est le rapport de deux longueurs",["Le millimètre (mm)","Le mégapascal (MPa)","Le newton (N)"]),
    expl:`${F(`ε = ${FRAC("ΔL","L0")}`)} : deux longueurs exprimées dans la même unité, le rapport est sans unité. On l'exprime souvent en % ou en µm/m.`};
  if(v===3) return {q:"Quelle est l'unité du module d'Young E ?",type:"ch",...mc("Celle d'une contrainte : le MPa (ou le GPa)",["Le millimètre (mm)","Le newton (N)","Aucune : E est sans unité"]),
    expl:`${F("σ = E·ε")} avec ε sans unité : E a l'unité d'une contrainte, le MPa (N/mm²). Pour les métaux, on le donne souvent en GPa (acier : 210 GPa).`};
  return {q:"La contrainte maximale dans une pièce atteint exactement sa limite élastique Re. Que vaut alors le coefficient de sécurité ?",type:"ch",...mc("s = 1",["s = 0","s = 2","s = 10"]),
    expl:`${F(`s = ${FRAC("Re","σmax")}`)} = 1 : la pièce est « juste », sans aucune réserve. On exige toujours s > 1, souvent entre 1,5 et 5 selon les risques.`}; },
/* lire la limite élastique sur une courbe de traction */
()=>{ const C=rnd([{nm:"en acier",E:210000,Re:rnd([250,300,350]),dR:150,ep:2,em:14,er:22,dr:70,xm:25,xl:5,xg:2.5,ym:600,yl:100,yg:50},
      {nm:"en alliage d'aluminium",E:70000,Re:rnd([150,200,250]),dR:50,em:8,er:12,dr:30,xm:14,xl:2,xg:1,ym:350,yl:50,yg:25},
      {nm:"en PLA imprimé",E:3500,Re:rnd([40,45,50]),dR:5,em:0,er:0,dr:4,xm:4,xl:1,xg:0.5,ym:70,yl:10,yg:5}]);
  const ee=C.Re/C.E*100, em=C.em||ee+0.9, er=C.er||em+0.8, c={E:C.E,Re:C.Re,Rm:C.Re+C.dR,ep:C.ep||0,em,er,sr:C.Re+C.dR-C.dr}, f=loiT(c);
  const fig=fx_rdm_essai({f,xe:er,xm:C.xm,xl:C.xl,xg:C.xg,ym:C.ym,yl:C.yl,yg:C.yg,rupt:true,marks:[{e:ee,s:C.Re,t:"A",px:true,dx:8,dy:-8},{e:em,s:c.Rm,t:"B",dx:0,dy:-12,a:"middle"}]});
  return {fig,ctx:`Essai de traction sur une éprouvette ${C.nm} : la courbe donne la contrainte σ en fonction de l'allongement relatif ε. Le point A marque la fin de la partie rectiligne.`,
    q:"Lis sur la courbe la limite élastique Re de ce matériau.",type:"num",ans:C.Re,tolA:C.yg/2,unit:"MPa",
    expl:`La partie rectiligne OA est le domaine élastique, où ${F("σ = E·ε")}. On lit l'ordonnée du point A : Re = ${U(C.Re,"MPa")}. Au-delà de A, les déformations deviennent permanentes ; le point B correspond à la contrainte maximale Rm = ${c.Rm} MPa, avant la rupture.`}; },
/* flexion : fibres tendues, comprimées, fibre neutre */
()=>{ const type=rnd(["console","appuis"]), ask=rnd(["t","c","n"]), nums=shuffle(["1","2","3","4"]);
  const P=(type==="console"?[{x:84,f:"h",r:"t"},{x:104,f:"b",r:"c"},{x:170,f:"n",r:"n"},{x:300,f:"h",r:"tf"}]:[{x:168,f:"h",r:"c"},{x:232,f:"b",r:"t"},{x:120,f:"n",r:"n"},{x:104,f:"b",r:"tf"}]).map((p,i)=>({...p,n:nums[i]}));
  const good=P.find(p=>p.r===ask), Q={t:"Quel point se trouve sur une fibre tendue, là où la contrainte de traction est la plus grande ?",c:"Quel point se trouve sur une fibre comprimée, là où la contrainte de compression est la plus grande ?",n:"Quel point se trouve sur la fibre neutre, où la contrainte normale est nulle ?"}[ask];
  const base=type==="console"?"La poutre encastrée fléchit vers le bas : sa face supérieure s'allonge (fibres tendues), sa face inférieure se raccourcit (fibres comprimées), et la fibre neutre, au milieu de la hauteur (tirets), ne change pas de longueur. Le moment de flexion est maximal à l'encastrement et nul à l'extrémité libre."
    :"Entre les appuis, la poutre fléchit vers le bas : sa face inférieure s'allonge (fibres tendues), sa face supérieure se raccourcit (fibres comprimées), et la fibre neutre (tirets) ne change pas de longueur. Le moment de flexion, nul sur les appuis, est maximal au milieu.";
  const why={t:`Le point ${good.n} est sur la face ${type==="console"?"supérieure, près de l'encastrement":"inférieure, près du milieu"} : ${F("traction maximale")}.`,c:`Le point ${good.n} est sur la face ${type==="console"?"inférieure, près de l'encastrement":"supérieure, près du milieu"} : ${F("compression maximale")}.`,n:`Le point ${good.n} est sur la ${F("fibre neutre")} : contrainte normale nulle.`}[ask];
  return {fig:fx_rdm_poutre({type,pts:P}),q:Q,type:"ch",ch:["Point 1","Point 2","Point 3","Point 4"],ok:+good.n-1,expl:`${base} ${why}`}; },
/* carte de contraintes : zone la plus sollicitée */
()=>{ const L4=shuffle(["A","B","C","D"]), max=rnd([120,144,160,184,208]), Z=[{u:0.03,v:0.06,lx:80,ly:44},{u:0.05,v:0.5,lx:86,ly:154},{u:0.5,v:0.06,lx:178,ly:44},{u:0.9,v:0.5,lx:270,ly:154}];
  return {fig:fx_rdm_femConsole({max,unit:"MPa",labs:Z.map((z,i)=>({...z,t:L4[i]}))}),ctx:"Simulation par éléments finis d'une poutre encastrée à gauche et chargée à son extrémité droite. La carte donne, en chaque point, la contrainte équivalente de Von Mises : une seule valeur qui résume l'état de contrainte ; plus elle est grande, plus la matière est sollicitée.",
    q:"Sur la carte des contraintes, dans quelle zone la pièce est-elle la plus sollicitée ?",type:"ch",ch:["Zone A","Zone B","Zone C","Zone D"],ok:["A","B","C","D"].indexOf(L4[0]),
    expl:`La zone rouge, en haut de l'échelle (${max} MPa), est la zone ${F(L4[0])} : près de l'encastrement, où le moment de flexion est maximal, et sur une face de la poutre, loin de la fibre neutre. En ${L4[1]} (fibre neutre) et en ${L4[3]} (près de l'extrémité libre), la contrainte est presque nulle ; en ${L4[2]}, sur la face mais à mi-longueur, elle vaut environ la moitié du maximum.`}; },
/* choisir un matériau dans un tableau selon un critère */
()=>{ const ks=pick(["s355","alu","ti","bois","pla"],4), crit=rnd(["E","Re","rho"]);
  const best=crit==="rho"?ks.reduce((a,b)=>MR[a].rho<MR[b].rho?a:b):ks.reduce((a,b)=>MR[a][crit]>MR[b][crit]?a:b), m=MR[best];
  const Q={E:"se déformer le moins possible sous une charge donnée, à forme et dimensions identiques",Re:"supporter la plus grande contrainte sans se déformer de façon permanente",rho:"être la plus légère possible, à volume identique"}[crit];
  return {data:tabM(ks,[colE,colRe,colRho]),q:`Une pièce doit ${Q}. Quel matériau du tableau choisir ?`,type:"ch",ch:ks.map(nmT),ok:ks.indexOf(best),
    expl:crit==="E"?`La rigidité dépend du module d'Young : ${F(`ΔL = ${FRAC("F·L0","E·S")}`)} est d'autant plus petit que E est grand. Le plus grand E du tableau : ${m.nm} (${nf(m.E,0)} MPa).`
      :crit==="Re"?`La plus grande contrainte supportable sans déformation permanente est la limite élastique Re. La plus grande du tableau : ${m.nm} (${F(`Re = ${m.Re} MPa`)}).`
      :`À volume identique, ${F("m = ρ·V")} : il faut la plus petite masse volumique, ${m.nm} (${nf(m.rho,0)} kg/m³). Ce n'est pas forcément le matériau le plus résistant ni le plus rigide.`}; },
/* domaine élastique, plastique ou rupture */
()=>{ const m=MR[rnd(["s235","s355","alu"])], st=rnd([0,1,2]);
  const sg=st===0?Math.round(m.Re*rnd([0.4,0.5,0.6,0.7,0.8])):st===1?Math.round(m.Re+(m.Rm-m.Re)*rnd([0.3,0.45,0.6])):Math.round(m.Rm*rnd([1.1,1.2,1.35]));
  return {ctx:`Barre en ${m.nm} : limite élastique Re = ${m.Re} MPa, résistance à la rupture Rm = ${m.Rm} MPa. Sous une charge de traction, le calcul donne une contrainte σ = ${sg} MPa.`,
    q:"Que se passe-t-il pour la barre ?",type:"ch",ch:["Elle se déforme de façon élastique : elle reprendra sa longueur initiale après la décharge","Elle se déforme de façon permanente (plastique) : elle restera allongée après la décharge","Elle se rompt"],ok:st,
    expl:st===0?`σ = ${sg} MPa < Re = ${m.Re} MPa : on reste dans le domaine ${F("élastique")}, la barre reprend sa longueur initiale quand on la décharge.`
      :st===1?`Re = ${m.Re} MPa < σ = ${sg} MPa < Rm = ${m.Rm} MPa : la limite élastique est dépassée sans atteindre la rupture. Une partie de l'allongement reste après la décharge : déformation ${F("plastique")}.`
      :`σ = ${sg} MPa > Rm = ${m.Rm} MPa : la barre ne peut pas supporter cette charge, ${F("elle se rompt")}.`}; },
/* choisir la bonne relation */
()=>{ const v=rnd([0,1,2,3]);
  if(v===0) return {q:"Quelle relation donne l'allongement ΔL d'une barre de longueur L0 et de section S, tendue par une force F, dans le domaine élastique ?",type:"ch",
    ...mc(`ΔL = ${FRAC("F·L0","E·S")}`,[`ΔL = ${FRAC("E·S","F·L0")}`,`ΔL = ${FRAC("F·E","L0·S")}`,`ΔL = ${FRAC("F","E·S·L0")}`]),
    expl:`${F(`σ = ${FRAC("F","S")}`)} et ${F("σ = E·ε")} avec ε = ${FRAC("ΔL","L0")}, d'où ${F(`ΔL = ${FRAC("F·L0","E·S")}`)}. Contrôle : l'allongement augmente avec F et L0, il diminue quand E ou S augmente.`};
  if(v===1) return {q:"Quelle relation traduit la loi de Hooke dans le domaine élastique ?",type:"ch",...mc("σ = E·ε",["ε = E·σ",`σ = ${FRAC("E","ε")}`,"σ = E + ε"]),
    expl:`La contrainte est proportionnelle à l'allongement relatif : ${F("σ = E·ε")}, E étant le module d'Young du matériau. Elle ne vaut que tant que σ reste inférieure à la limite élastique Re.`};
  if(v===2) return {q:"Quelle relation donne le coefficient de sécurité s d'une pièce ?",type:"ch",...mc(`s = ${FRAC("Re","σmax")}`,[`s = ${FRAC("σmax","Re")}`,"s = Re − σmax","s = Re·σmax"]),
    expl:`${F(`s = ${FRAC("Re","σmax")}`)} : c'est le nombre de fois que l'on pourrait multiplier la contrainte avant d'atteindre la limite élastique. Il doit être supérieur à 1 ; le rapport inverse serait inférieur à 1 pour une pièce qui résiste.`};
  return {q:"Quelle relation donne le diamètre d d'une tige ronde de section S ?",type:"ch",...mc(`d = √(${FRAC("4·S","π")})`,[`d = √(${FRAC("S","π")})`,`d = ${FRAC("4·S","π")}`,`d = √(${FRAC("π·S","4")})`]),
    expl:`${F(`S = ${FRAC("π·d²","4")}`)}, donc d² = ${FRAC("4·S","π")} et ${F(`d = √(${FRAC("4·S","π")})`)}. La relation √(${FRAC("S","π")}) donnerait le rayon, pas le diamètre.`}; }
];

const R2=[
/* tige ronde : section puis contrainte */
()=>{ const [nm,m,w]=rnd([["Une tige de suspension en acier S235",MR.s235,"la tige"],["Une barre d'ancrage en acier S355",MR.s355,"la barre"],["Une tige en alliage d'aluminium",MR.alu,"la tige"]]);
  const o=draw(()=>({d:rnd([6,8,10,12,14,16,20]),Fk:rnd([2,3,4,5,6,8,10,12,15,20,25,30,40])}),o=>{ const sg=o.Fk*1000/secR(o.d); return sg>=0.15*m.Re&&sg<=0.75*m.Re; });
  const S=secR(o.d), Fn=o.Fk*1000, sg=Fn/S;
  return {fig:fx_rdm_barre({sec:"rond",secLab:`d = ${o.d} mm`,Flab:`F = ${nf(o.Fk,1)} kN`,Llab:null}),ctx:`${nm} de diamètre d = ${o.d} mm est tendue par une force F = ${nf(o.Fk,1)} kN.`,
    q:`Calcule la contrainte de traction dans ${w}.`,type:"num",ans:sg,tolR:0.02,unit:"MPa",
    expl:`Section : ${F(`S = ${FRAC("π·d²","4")}`)} = ${FRAC(`π × ${o.d}²`,"4")} = ${nf(S,1)} mm². F = ${nf(Fn,0)} N. ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),nf(S,1))} = ${U(sg,"MPa")}.`}; },
/* allongement ΔL = F·L0/(E·S) avec conversions */
()=>{ const C=rnd([{nm:"Le hauban d'une éolienne, une barre ronde en acier",f:0,E:210,Re:235,Ls:[6,8,10,12,15],Ss:[50,78.5,113,154],Fs:[3,4,5,6,8,10]},
      {nm:"La suspente d'une passerelle, une barre en acier",f:1,E:210,Re:235,Ls:[3,4,5,6],Ss:[78.5,113,154,201],Fs:[5,8,10,12,15]},
      {nm:"Un tirant en alliage d'aluminium",f:0,E:70,Re:240,Ls:[1.5,2,2.5,3],Ss:[50,80,100,150],Fs:[2,3,4,5,6]}]);
  const o=draw(()=>({L:rnd(C.Ls),S:rnd(C.Ss),Fk:rnd(C.Fs)}),o=>{ const sg=o.Fk*1000/o.S, dL=o.Fk*o.L*1000/(C.E*o.S); return sg<=0.6*C.Re&&dL>=0.3&&dL<=15; });
  const Fn=o.Fk*1000, Lm=o.L*1000, Em=C.E*1000, dL=Fn*Lm/(Em*o.S);
  return {fig:fx_rdm_barre({Flab:`F = ${nf(o.Fk,1)} kN`,Llab:`L0 = ${nf(o.L,1)} m`,dL:true}),ctx:`${C.nm} (E = ${C.E} GPa), de longueur L0 = ${nf(o.L,1)} m et de section S = ${nf(o.S,1)} mm², est tendu${C.f?"e":""} par une force F = ${nf(o.Fk,1)} kN.`,
    q:"Calcule son allongement ΔL, en mm.",type:"num",ans:dL,tolR:0.02,unit:"mm",
    expl:`On travaille en N, mm et MPa (N/mm²) : F = ${nf(Fn,0)} N, L0 = ${nf(Lm,0)} mm, E = ${C.E} GPa = ${nf(Em,0)} MPa. ${F(`ΔL = ${FRAC("F·L0","E·S")}`)} = ${FRAC(`${nf(Fn,0)} × ${nf(Lm,0)}`,`${nf(Em,0)} × ${nf(o.S,1)}`)} = ${U(dL,"mm")}.`}; },
/* tube en compression : section annulaire puis contrainte */
()=>{ const [pc,mat,m]=rnd([["Le poteau d'un abri photovoltaïque","acier",MR.s235],["Un pied de tréteau d'atelier","alliage d'aluminium",MR.alu],["La colonne d'une presse d'atelier","acier",MR.s355]]);
  const o=draw(()=>({D:rnd([40,50,60,76]),e:rnd([2,3,4]),Fk:rnd([8,10,12,15,20,25,30,40,50,60])}),o=>{ const S=Math.PI*(o.D*o.D-(o.D-2*o.e)**2)/4, sg=o.Fk*1000/S; return sg>=0.1*m.Re&&sg<=0.5*m.Re; });
  const d=o.D-2*o.e, S=Math.PI*(o.D*o.D-d*d)/4, Fn=o.Fk*1000, sg=Fn/S;
  return {fig:fx_rdm_barre({comp:true,sec:"tube",secLab:`D = ${o.D} mm ; e = ${o.e} mm`,Flab:`F = ${nf(o.Fk,1)} kN`,Llab:null}),ctx:`${pc} est un tube en ${mat} de diamètre extérieur D = ${o.D} mm et d'épaisseur e = ${o.e} mm. Il reçoit une charge de compression F = ${nf(o.Fk,1)} kN, portée par son axe.`,
    q:"Calcule l'intensité de la contrainte de compression dans le tube.",type:"num",ans:sg,tolR:0.02,unit:"MPa",
    expl:`Diamètre intérieur : d = D − 2e = ${o.D} − 2 × ${o.e} = ${d} mm. ${F(`S = ${FRAC("π·(D² − d²)","4")}`)} = ${FRAC(`π × (${o.D}² − ${d}²)`,"4")} = ${nf(S,1)} mm². ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),nf(S,1))} = ${U(sg,"MPa")}, en compression : le tube se raccourcit.`}; },
/* force maximale admissible dans un fer plat */
()=>{ const m=MR[rnd(["s235","s355","alu"])], b=rnd([20,25,30,40,50]), h=rnd([3,4,5,6,8,10]), s=rnd([2,2.5,3,4]), S=b*h, sa=m.Re/s, Fm=sa*S;
  return {fig:fx_rdm_barre({sec:"rect",secLab:`${b} mm × ${h} mm`,Flab:"F = ?",Llab:null}),ctx:`Un fer plat en ${m.nm} (Re = ${m.Re} MPa), de section ${b} mm × ${h} mm, travaille en traction. Le cahier des charges impose un coefficient de sécurité s = ${nf(s,1)}.`,
    q:"Quelle force de traction maximale peut-il supporter, en kN ?",type:"num",ans:Fm/1000,tolR:0.02,unit:"kN",
    expl:`S = ${b} × ${h} = ${S} mm². Contrainte admissible : ${F(`σadm = ${FRAC("Re","s")}`)} = ${FRAC(m.Re,nf(s,1))} = ${nf(sa,2)} MPa. ${F("Fmax = σadm·S")} = ${nf(sa,2)} × ${S} = ${nf(Fm,0)} N, soit ${U(Fm/1000,"kN")}.`}; },
/* coefficient de sécurité puis exigence */
()=>{ const tgt=rnd([0,1]), o=draw(()=>({b:rnd([20,25,30,40]),h:rnd([3,4,5,6]),Fk:rnd([2,3,4,5,6,8,10,12]),smin:rnd([2,2.5,3,4])}),o=>{ const s=240*o.b*o.h/(o.Fk*1000); return s>=1.2&&s<=8&&far(s,o.smin,0.08)&&(s>=o.smin)===(tgt===0); });
  const S=o.b*o.h, Fn=o.Fk*1000, sg=Fn/S, s=240/sg, ok=s>=o.smin;
  const ctx=`La patte de fixation d'un panneau photovoltaïque est un plat en alliage d'aluminium (Re = 240 MPa) de section ${o.b} mm × ${o.h} mm. Par vent fort, elle est tendue par une force F = ${nf(o.Fk,1)} kN.`;
  return [{ctx,q:"Calcule le coefficient de sécurité de la patte.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`S = ${o.b} × ${o.h} = ${S} mm² ; ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),S)} = ${nf(sg,2)} MPa. ${F(`s = ${FRAC("Re","σ")}`)} = ${FRAC("240",nf(sg,2))} = ${U(s,"")}.`},
    {ctx,q:`Le cahier des charges impose s ≥ ${nf(o.smin,1)}. L'exigence est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(s)} ${ok?"≥":"<"} ${nf(o.smin,1)} : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut une section plus grande ou un matériau plus résistant."}`}]; },
/* module d'Young lu sur la courbe, puis identification du matériau */
()=>{ const Z=rnd([{nm:"acier",E:210000,Re:280,Rm:430,ep:1.5,em:14,er:22,sr:370,eM:[0.05,0.08,0.1],xm:0.25,xl:0.05,xg:0.025,ym:350,yl:50,yg:25},
      {nm:"aluminium",E:70000,Re:240,Rm:290,em:8,er:12,sr:260,eM:[0.1,0.15,0.2,0.25],xm:0.5,xl:0.1,xg:0.05,ym:300,yl:50,yg:25},
      {nm:"titane",E:110000,Re:830,Rm:900,em:6,er:10,sr:860,eM:[0.2,0.3,0.4,0.5,0.6],xm:1,xl:0.2,xg:0.1,ym:1000,yl:200,yg:100},
      {nm:"bois",E:11000,Re:40,Rm:44,em:1.2,er:1.5,sr:42,eM:[0.1,0.15,0.2,0.25],xm:0.5,xl:0.1,xg:0.05,ym:50,yl:10,yg:5},
      {nm:"PLA",E:3500,Re:50,Rm:55,em:2.4,er:3.2,sr:52,eM:[0.5,0.75,1],xm:2,xl:0.5,xg:0.25,ym:60,yl:10,yg:5}]);
  const eM=rnd(Z.eM), sM=Math.round(Z.E*eM/100*(1+rnd([-0.04,-0.03,-0.02,0.02,0.03,0.04]))*(Z.E<20000?10:1))/(Z.E<20000?10:1), Et=sM/eM*100, Eg=Et/1000;
  const f=loiT({...Z,E:Et}), fig=fx_rdm_essai({f,xe:Math.min(Z.xm,Z.er),xm:Z.xm,xl:Z.xl,xg:Z.xg,ym:Z.ym,yl:Z.yl,yg:Z.yg,rupt:Z.er<=Z.xm,marks:[{e:eM,s:sM,t:"M",px:true,py:true,dx:-8,dy:-10,a:"end",vx:nf(eM,2),vy:nf(sM,1)}]});
  const NM=["Acier","Titane","Aluminium","Bois","PLA"], EV=[210,110,70,11,3.5], data=table(["Matériau","E (GPa)"],NM.map((n,i)=>[n,nf(EV[i],1)])), i0=["acier","titane","aluminium","bois","PLA"].indexOf(Z.nm);
  const ctx="Début d'un essai de traction sur une éprouvette : le point M appartient à la partie rectiligne de la courbe.";
  return [{fig,ctx,q:"Calcule le module d'Young E du matériau testé, en GPa.",type:"num",ans:Eg,tolR:0.02,unit:"GPa",
      expl:`Sur la partie rectiligne, ${F("σ = E·ε")}. Au point M : ε = ${nf(eM,2)} % = ${nf(eM/100,5)} et σ = ${nf(sM,1)} MPa. ${F(`E = ${FRAC("σ","ε")}`)} = ${FRAC(nf(sM,1),nf(eM/100,5))} = ${nf(Et,0)} MPa, soit ${U(Eg,"GPa")}. Piège : ε s'utilise sans unité, pas en %.`},
    {fig,data,ctx,q:"De quel matériau s'agit-il le plus probablement ?",type:"ch",ch:NM,ok:i0,
      expl:`E ≈ ${S3(Eg)} GPa : la valeur la plus proche du tableau est celle du matériau « ${NM[i0]} » (${nf(EV[i0],1)} GPa). Un essai réel donne toujours une valeur un peu différente de la valeur de référence.`}]; },
/* jauge de déformation : contrainte puis effort */
()=>{ const C=rnd([{nm:"le tirant en acier d'un portique de levage",w:"le tirant",p:"il",m:MR.s235,Ss:[200,314,400,500],ep:[200,300,400,500,600]},{nm:"la barre de traction en alliage d'aluminium d'un banc d'essai",w:"la barre",p:"elle",m:MR.alu,Ss:[100,150,200,250],ep:[600,800,1000,1200,1500]}]);
  const S=rnd(C.Ss), ep=rnd(C.ep), sg=C.m.E*ep*1e-6, Fn=sg*S;
  const ctx=`Une jauge de déformation collée sur ${C.nm} (E = ${nf(C.m.E,0)} MPa, section S = ${S} mm²) mesure ε = ${nf(ep,0)} µm/m.`;
  return [{ctx,q:`Calcule la contrainte normale dans ${C.w}.`,type:"num",ans:sg,tolR:0.02,unit:"MPa",
      expl:`ε = ${nf(ep,0)} µm/m = ${nf(ep,0)} × 10<sup>−6</sup> = ${nf(ep*1e-6,6)}. ${F("σ = E·ε")} = ${nf(C.m.E,0)} × ${nf(ep*1e-6,6)} = ${U(sg,"MPa")} (inférieure à Re = ${C.m.Re} MPa : la loi de Hooke s'applique).`},
    {ctx,q:`Déduis-en la force de traction qu'${C.p} transmet, en kN.`,type:"num",ans:Fn/1000,tolR:0.02,unit:"kN",
      expl:`${F("F = σ·S")} = ${nf(sg,2)} × ${S} = ${nf(Fn,0)} N, soit ${U(Fn/1000,"kN")}.`}]; },
/* carte de simulation : lire la contrainte maximale, puis le coefficient de sécurité */
()=>{ const [k,mx,dec]=rnd([["alu",[60,72,88,100,120,140,152],0],["s235",[68,80,92,112,128,148],0],["pla",[6.4,8.8,10.4,12.8,14.4],1]]), m=MR[k], max=rnd(mx), s=m.Re/max;
  const fig=fx_rdm_femConsole({max,unit:"MPa",dec}), ctx=`Simulation par éléments finis d'un bras en ${m.nm} (Re = ${m.Re} MPa), encastré à gauche et chargé à son extrémité. La carte donne la contrainte équivalente de Von Mises, qui se compare directement à la limite élastique Re ; l'échelle va de 0 à sa valeur maximale.`;
  return [{fig,ctx,q:"Relève sur l'échelle la contrainte maximale dans le bras.",type:"num",ans:max,tolR:0.02,unit:"MPa",
      expl:`Le haut de l'échelle (rouge) donne la valeur maximale : ${F(`σmax = ${nf(max,1)} MPa`)}, atteinte près de l'encastrement, sur les faces supérieure et inférieure.`},
    {fig,ctx,q:"Calcule le coefficient de sécurité du bras.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`${F(`s = ${FRAC("Re","σmax")}`)} = ${FRAC(m.Re,nf(max,1))} = ${U(s,"")}.`}]; },
/* dimensionnement : section minimale puis diamètre minimal */
()=>{ const [pc,m]=rnd([["une tige de suspension",MR.s235],["un tirant de contreventement",MR.s355],["une tige de vérin",MR.s355],["une biellette de drone",MR.alu]]);
  const Fk=m===MR.alu?rnd([1,1.5,2,3,4]):rnd([5,8,10,12,15,20,25,30,40]), s=rnd([1.5,2,2.5,3]), Fn=Fk*1000, Sm=s*Fn/m.Re, d=Math.sqrt(4*Sm/Math.PI);
  const ctx=`On dimensionne ${pc} en ${m.nm} (Re = ${m.Re} MPa), de section ronde, qui transmet un effort de traction F = ${nf(Fk,1)} kN avec un coefficient de sécurité s = ${nf(s,1)}.`;
  return [{ctx,q:"Calcule la section minimale S_min de la pièce.",type:"num",ans:Sm,tolR:0.02,unit:"mm²",
      expl:`Il faut ${F(`${FRAC("F","S")} ≤ ${FRAC("Re","s")}`)}, donc ${F(`S ≥ ${FRAC("s·F","Re")}`)} = ${FRAC(`${nf(s,1)} × ${nf(Fn,0)}`,m.Re)} = ${U(Sm,"mm²")}.`},
    {ctx,q:"Déduis-en son diamètre minimal.",type:"num",ans:d,tolR:0.02,unit:"mm",
      expl:`${F(`S = ${FRAC("π·d²","4")}`)}, donc ${F(`d = √(${FRAC("4·S","π")})`)} = √(${FRAC(`4 × ${nf(Sm,1)}`,"π")}) = ${U(d,"mm")}. On choisira le diamètre du commerce immédiatement supérieur.`}]; },
/* flexion : position d'une section */
()=>{ const kind=rnd(["planche","profil"]), first=rnd(["plat","chant"]), okP=first==="chant"?0:1;
  if(kind==="planche"){ const b=rnd([150,180,200,250]), h=rnd([18,20,22,25]), r=(b/h)**2;
    return {fig:fx_rdm_sections({kind,first}),ctx:`Une planche de section ${b} mm × ${h} mm, posée sur deux appuis, porte une charge en son milieu. On peut la placer dans l'une des deux positions de la figure.`,
      q:"Dans quelle position fléchit-elle le moins ?",type:"ch",ch:["Position 1","Position 2","Les deux fléchissent autant : la section est la même"],ok:okP,
      expl:`En flexion, la matière travaille d'autant plus qu'elle est loin de la fibre neutre. La rigidité d'une section rectangulaire est proportionnelle à ${F("b·h³")}, h étant la dimension dans le sens de la charge : posée sur chant (position ${okP+1}), la planche est ${FRAC(`${h} × ${b}³`,`${b} × ${h}³`)} = (${FRAC(b,h)})² ≈ ${nf(r,0)} fois plus rigide qu'à plat (il faut alors l'empêcher de basculer).`}; }
  return {fig:fx_rdm_sections({kind,first}),ctx:"Une poutre de section en I, posée sur deux appuis, porte une charge verticale en son milieu. On peut la placer dans l'une des deux positions de la figure.",
    q:"Dans quelle position la poutre fléchit-elle le moins ?",type:"ch",ch:["Position 1","Position 2","Les deux fléchissent autant : la section est la même"],ok:okP,
    expl:`En position ${okP+1}, âme verticale, les deux semelles sont loin de la fibre neutre : l'une est tendue, l'autre comprimée, et elles travaillent au maximum. C'est pour cela qu'une poutre en I se pose toujours ${F("âme verticale")}, dans le sens de la charge.`}; },
/* charge répartie sur des appuis : effort par appui puis contrainte de compression */
()=>{ if(Math.random()<0.5){ const mt=rnd([12,15,18,24]), n=rnd([12,16,20,24]), a=rnd([150,180,200]), Fn=mt*1000*g/n, S=a*a, sg=Fn/S;
    const ctx=`Un bungalow sur pilotis (masse totale en charge : ${mt} t) repose sur ${n} pilotis identiques en bois, de section carrée ${a} mm × ${a} mm. On suppose la charge également répartie. g = 9,81 m/s².`;
    return [{ctx,q:"Calcule l'effort de compression supporté par chaque pilotis, en kN.",type:"num",ans:Fn/1000,tolR:0.02,unit:"kN",
        expl:`${F(`F = ${FRAC("m·g","n")}`)} = ${FRAC(`${nf(mt*1000,0)} × 9,81`,n)} = ${nf(Fn,0)} N, soit ${U(Fn/1000,"kN")}.`},
      {ctx,q:"Calcule la contrainte de compression dans un pilotis.",type:"num",ans:sg,tolR:0.02,unit:"MPa",
        expl:`S = ${a} × ${a} = ${nf(S,0)} mm². ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),nf(S,0))} = ${U(sg,"MPa")}, très loin de la limite du bois : la section est surtout imposée par la durabilité et la stabilité.`}]; }
  const mk=rnd([1.5,2,2.5,3]), S=rnd([280,350,420]), Fn=(mk*1000+250)*g/4, sg=Fn/S;
  const ctx=`Une cuve de récupération d'eau de pluie (${nf(mk*1000,0)} L d'eau, soit ${nf(mk*1000,0)} kg, cuve et châssis : 250 kg) repose sur 4 pieds en tube carré d'acier, de section S = ${S} mm² chacun. Charge supposée également répartie. g = 9,81 m/s².`;
  return [{ctx,q:"Calcule l'effort de compression supporté par chaque pied, en kN.",type:"num",ans:Fn/1000,tolR:0.02,unit:"kN",
      expl:`Masse totale : ${nf(mk*1000,0)} + 250 = ${nf(mk*1000+250,0)} kg. ${F(`F = ${FRAC("m·g","4")}`)} = ${FRAC(`${nf(mk*1000+250,0)} × 9,81`,"4")} = ${nf(Fn,0)} N, soit ${U(Fn/1000,"kN")}.`},
    {ctx,q:"Calcule la contrainte de compression dans un pied.",type:"num",ans:sg,tolR:0.02,unit:"MPa",
      expl:`${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),S)} = ${U(sg,"MPa")}.`}]; },
/* module d'Young à partir d'un essai (F, d0, L0, ΔL) */
()=>{ const m=MR[rnd(["s235","alu","ti"])], o=draw(()=>({d0:rnd([8,10,12]),L0:rnd([50,80,100]),Fk:rnd([3,4,5,6,8,10,12,15,20])}),o=>{ const sg=o.Fk*1000/secR(o.d0), dL=sg*o.L0/m.E; return sg>=0.25*m.Re&&sg<=0.7*m.Re&&dL>=0.02; });
  const S=secR(o.d0), Fn=o.Fk*1000, sg=Fn/S, dL=Math.round(sg*o.L0/m.E*1000)/1000, eps=dL/o.L0, E=sg/eps;
  return {ctx:`Essai de traction dans le domaine élastique : éprouvette de diamètre d0 = ${o.d0} mm et de longueur initiale L0 = ${o.L0} mm. Sous F = ${nf(o.Fk,1)} kN, l'extensomètre mesure un allongement ΔL = ${nf(dL,3)} mm.`,
    q:"Calcule le module d'Young du matériau, en GPa.",type:"num",ans:E/1000,tolR:0.02,unit:"GPa",
    expl:`S = ${FRAC(`π × ${o.d0}²`,"4")} = ${nf(S,2)} mm² ; ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fn,0),nf(S,2))} = ${nf(sg,1)} MPa ; ${F(`ε = ${FRAC("ΔL","L0")}`)} = ${FRAC(nf(dL,3),o.L0)} = ${nf(eps,6)}. ${F(`E = ${FRAC("σ","ε")}`)} = ${nf(E,0)} MPa, soit ${U(E/1000,"GPa")}.`}; },
/* rapport des allongements de deux matériaux */
()=>{ const [a,b]=rnd([["pla","alu"],["pla","s235"],["bois","s235"],["alu","s235"],["bois","alu"],["alu","ti"],["pla","bois"]]), A=MR[a], B=MR[b], r=B.E/A.E;
  return {ctx:`Deux barres de même longueur et de même section, l'une en ${A.nm} (E = ${nf(A.E,0)} MPa), l'autre en ${B.nm} (E = ${nf(B.E,0)} MPa), sont tendues par la même force, dans le domaine élastique.`,
    q:`Combien de fois l'allongement de la barre en ${A.c} est-il plus grand que celui de la barre en ${B.c} ?`,type:"num",ans:r,tolR:0.02,unit:"",
    expl:`${F(`ΔL = ${FRAC("F·L0","E·S")}`)} : F, L0 et S sont les mêmes, donc l'allongement est inversement proportionnel à E. ${F(`${FRAC("ΔL1","ΔL2")} = ${FRAC("E2","E1")}`)} = ${FRAC(nf(B.E,0),nf(A.E,0))} = ${U(r,"")}.`}; }
];

const R3=[
/* levage : contrainte dans chaque tirant, coefficient de sécurité, exigence */
()=>{ const tgt=rnd([0,1]), o=draw(()=>({m:rnd([400,600,800,1000,1200,1500,2000,2500,3000]),n:rnd([2,3,4]),d:rnd([8,10,12,14,16]),smin:rnd([3,4,5])}),o=>{ const s=355/(o.m*g/o.n/secR(o.d)); return s>=1.5&&s<=12&&far(s,o.smin,0.08)&&(s>=o.smin)===(tgt===0); });
  const P=o.m*g, Fb=P/o.n, S=secR(o.d), sg=Fb/S, s=355/sg, ok=s>=o.smin;
  const ctx=`Une charge de ${nf(o.m,0)} kg est suspendue à ${o.n} tirants verticaux identiques en acier S355 (Re = 355 MPa), de diamètre d = ${o.d} mm. On suppose la charge également répartie entre les tirants. g = 9,81 m/s².`;
  return [{ctx,q:"Calcule la contrainte normale dans chaque tirant.",type:"num",ans:sg,tolR:0.02,unit:"MPa",
      expl:`Poids : P = m·g = ${nf(o.m,0)} × 9,81 = ${nf(P,0)} N ; chaque tirant porte ${F(`F = ${FRAC("P","n")}`)} = ${FRAC(nf(P,0),o.n)} = ${nf(Fb,0)} N. S = ${FRAC(`π × ${o.d}²`,"4")} = ${nf(S,1)} mm². ${F(`σ = ${FRAC("F","S")}`)} = ${FRAC(nf(Fb,0),nf(S,1))} = ${U(sg,"MPa")}.`},
    {ctx,q:"Calcule le coefficient de sécurité des tirants.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`${F(`s = ${FRAC("Re","σ")}`)} = ${FRAC("355",nf(sg,1))} = ${U(s,"")}.`},
    {ctx,q:`Pour ce levage, le cahier des charges impose s ≥ ${o.smin}. L'exigence est-elle satisfaite ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(s)} ${ok?"≥":"<"} ${o.smin} : ${ok?"l'exigence est satisfaite.":`l'exigence n'est pas satisfaite. Il faudrait des tirants plus gros ou plus nombreux : avec ${o.n} tirants, le diamètre doit vérifier ${FRAC(`π·d²`,"4")} ≥ ${FRAC(`${o.smin} × ${nf(Fb,0)}`,"355")}, soit d ≥ ${nf(Math.sqrt(4*o.smin*Fb/355/Math.PI),1)} mm.`}`}]; },
/* hauban : diamètre minimal, choix dans un catalogue, coefficient de sécurité réel */
()=>{ const DS=[8,10,12,14,16,18,20,24];
  const o=draw(()=>({Fk:rnd([8,10,12,15,18,20,25,28,32,36,40]),s:rnd([2,2.5,3])}),o=>{ const dm=Math.sqrt(4*o.s*o.Fk*1000/355/Math.PI), i=DS.findIndex(d=>d>=dm); return i>=1&&i<=DS.length-3&&DS.every(d=>far(d,dm,0.04)); });
  const Fn=o.Fk*1000, Sm=o.s*Fn/355, dm=Math.sqrt(4*Sm/Math.PI), i=DS.findIndex(d=>d>=dm), dc=DS[i], sr=355*secR(dc)/Fn, opts=[DS[i-1],dc,DS[i+1],DS[i+2]];
  const ctx=`Le hauban d'une éolienne installée sur un atoll est une barre ronde en acier S355 (Re = 355 MPa). En tempête, il est tendu par F = ${o.Fk} kN. Le cahier des charges impose un coefficient de sécurité s = ${nf(o.s,1)}.`;
  return [{ctx,q:"Calcule le diamètre minimal du hauban.",type:"num",ans:dm,tolR:0.02,unit:"mm",
      expl:`${F(`S ≥ ${FRAC("s·F","Re")}`)} = ${FRAC(`${nf(o.s,1)} × ${nf(Fn,0)}`,"355")} = ${nf(Sm,1)} mm², puis ${F(`d = √(${FRAC("4·S","π")})`)} = √(${FRAC(`4 × ${nf(Sm,1)}`,"π")}) = ${U(dm,"mm")}.`},
    {ctx,q:`Diamètres disponibles : ${DS.join(" · ")} mm. Lequel choisir pour respecter l'exigence avec le hauban le plus léger possible ?`,type:"ch",...mc(`${dc} mm`,opts.filter(x=>x!==dc).map(x=>`${x} mm`)),
      expl:`Il faut d ≥ ${nf(dm,1)} mm : le plus petit diamètre qui convient est ${F(dc+" mm")}. Avec ${DS[i-1]} mm, le coefficient de sécurité serait insuffisant ; un diamètre plus grand respecterait aussi l'exigence, mais le hauban serait plus lourd et plus cher.`},
    {ctx,q:"Avec ce diamètre, quel est le coefficient de sécurité réel du hauban ?",type:"num",ans:sr,tolA:0.02,unit:"",
      expl:`S = ${FRAC(`π × ${dc}²`,"4")} = ${nf(secR(dc),1)} mm² ; σ = ${FRAC(nf(Fn,0),nf(secR(dc),1))} = ${nf(Fn/secR(dc),1)} MPa ; ${F(`s = ${FRAC("Re","σ")}`)} = ${FRAC("355",nf(Fn/secR(dc),1))} = ${U(sr,"")}, supérieur aux ${nf(o.s,1)} exigés : l'exigence est respectée.`}]; },
/* deux exigences : résistance et allongement */
()=>{ const tgt=rnd([0,1,2,3]), m=MR[rnd(["s235","alu"])];
  const o=draw(()=>({L:rnd([1,1.5,2,2.5,3,4]),d:rnd([8,10,12,14,16]),Fk:rnd([3,4,5,6,8,10,12,15,18,20,25]),smin:rnd([1.5,2,2.5,3]),dLm:rnd([0.5,0.8,1,1.2,1.5,2,2.5,3])}),o=>{ const S=secR(o.d), s=m.Re*S/(o.Fk*1000), dL=o.Fk*1000*o.L*1000/(m.E*S); if(s<1.1) return false; return far(s,o.smin,0.06)&&far(dL,o.dLm,0.06)&&((s>=o.smin?0:2)+(dL<=o.dLm?0:1))===tgt; });
  const S=secR(o.d), Fn=o.Fk*1000, sg=Fn/S, s=m.Re/sg, dL=Fn*o.L*1000/(m.E*S), C=C4("l'allongement");
  const fig=fx_rdm_barre({Flab:`F = ${nf(o.Fk,1)} kN`,Llab:`L0 = ${nf(o.L,1)} m`,sec:"rond",secLab:`d = ${o.d} mm`});
  const ctx=`Tige de suspension en ${m.nm} (E = ${nf(m.E,0)} MPa, Re = ${m.Re} MPa), de longueur L0 = ${nf(o.L,1)} m et de diamètre d = ${o.d} mm, tendue par F = ${nf(o.Fk,1)} kN. Exigences : coefficient de sécurité s ≥ ${nf(o.smin,1)} et allongement ΔL ≤ ${nf(o.dLm,1)} mm.`;
  return [{fig,ctx,q:"Calcule le coefficient de sécurité de la tige.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`S = ${FRAC(`π × ${o.d}²`,"4")} = ${nf(S,1)} mm² ; σ = ${FRAC(nf(Fn,0),nf(S,1))} = ${nf(sg,1)} MPa ; ${F(`s = ${FRAC("Re","σ")}`)} = ${FRAC(m.Re,nf(sg,1))} = ${U(s,"")}.`},
    {fig,ctx,q:"Calcule l'allongement de la tige, en mm.",type:"num",ans:dL,tolR:0.02,unit:"mm",
      expl:`${F(`ΔL = ${FRAC("F·L0","E·S")}`)} = ${FRAC(`${nf(Fn,0)} × ${nf(o.L*1000,0)}`,`${nf(m.E,0)} × ${nf(S,1)}`)} = ${U(dL,"mm")}.`},
    {fig,ctx,q:"La tige satisfait-elle les deux exigences ?",type:"ch",ch:C,ok:tgt,
      expl:`Résistance : s = ${S3(s)} ${s>=o.smin?"≥":"<"} ${nf(o.smin,1)}. Allongement : ${S3(dL)} mm ${dL<=o.dLm?"≤":">"} ${nf(o.dLm,1)} mm. ${C[tgt]}.`}]; },
/* matériau le plus léger à résistance égale */
()=>{ const ks=rnd([["s235","alu","bois","pla"],["s355","bois","pla"],["s235","s355","pla"],["s235","ti","alu","pla"],["s355","alu","pla"]]);
  const Fk=rnd([2,3,4,5,6,8]), s=rnd([2,3,4]), Lb=rnd([200,250,300,400,500]), Fn=Fk*1000, Sk=ks.map(k=>s*Fn/MR[k].Re), mk=ks.map((k,i)=>MR[k].rho*Sk[i]*Lb*1e-9), ib=mk.indexOf(Math.min(...mk)), k1=rnd(ks), i1=ks.indexOf(k1);
  const data=tabM(ks,[colRe,colRho]), ctx=`Une biellette de longueur L = ${Lb} mm doit transmettre un effort de traction F = ${Fk} kN avec un coefficient de sécurité s = ${s}. Pour chaque matériau du tableau, sa section est ajustée au plus juste.`;
  return [{data,ctx,q:`Calcule la section minimale de la biellette si elle est en ${MR[k1].nm}.`,type:"num",ans:Sk[i1],tolR:0.02,unit:"mm²",
      expl:`${F(`S = ${FRAC("s·F","Re")}`)} = ${FRAC(`${s} × ${nf(Fn,0)}`,MR[k1].Re)} = ${U(Sk[i1],"mm²")}.`},
    {data,ctx,q:"Quel matériau donne la biellette la plus légère ?",type:"ch",ch:ks.map(nmT),ok:ib,
      expl:`Pour chaque matériau, ${F(`S = ${FRAC("s·F","Re")}`)} puis ${F("m = ρ·S·L")} : ${ks.map((k,i)=>`${MR[k].c} ${nf(Sk[i],0)} mm² → ${nf(mk[i]*1000,0)} g`).join(" ; ")}. La plus légère est en ${MR[ks[ib]].nm} : ce n'est pas forcément le matériau le moins dense, car c'est le rapport ${FRAC("ρ","Re")} qui compte.`}]; },
/* simulation d'une plaque percée : zone critique, coefficient de sécurité, exigence */
()=>{ const m=MR[rnd(["alu","s235","s355"])], tgt=rnd([0,1]), L4=shuffle(["A","B","C","D"]);
  const o=draw(()=>({max:Math.round(m.Re*rnd([0.3,0.4,0.5,0.6,0.7,0.8,0.9])/4)*4,smin:rnd([1.5,2,2.5,3])}),o=>{ const s=m.Re/o.max; return far(s,o.smin,0.06)&&(s>=o.smin)===(tgt===0); });
  const s=m.Re/o.max, ok=s>=o.smin, fig=fx_rdm_femPlaque({max:o.max,labs:L4});
  const ctx=`Simulation par éléments finis d'une plaque percée en ${m.nm} (Re = ${m.Re} MPa), tendue par deux efforts opposés. La carte donne la contrainte équivalente de Von Mises, qui se compare directement à la limite élastique Re ; l'échelle va de 0 à sa valeur maximale.`;
  return [{fig,ctx,q:"Dans quelle zone la plaque est-elle la plus sollicitée ?",type:"ch",ch:["Zone A","Zone B","Zone C","Zone D"],ok:["A","B","C","D"].indexOf(L4[0]),
      expl:`La zone rouge est au bord du trou, perpendiculairement à l'effort : zone ${F(L4[0])}. Le trou réduit la section et les efforts doivent le contourner : c'est une ${F("concentration de contraintes")}, deux à trois fois la contrainte qui règne loin du trou (zones ${L4[2]} et ${L4[3]}). Au bord du trou mais dans l'axe de l'effort (zone ${L4[1]}), la matière est au contraire peu sollicitée.`},
    {fig,ctx,q:"Calcule le coefficient de sécurité de la plaque.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`On prend la contrainte maximale, en haut de l'échelle : ${F(`s = ${FRAC("Re","σmax")}`)} = ${FRAC(m.Re,o.max)} = ${U(s,"")}.`},
    {fig,ctx,q:`Le cahier des charges impose s ≥ ${nf(o.smin,1)}. Est-il respecté ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(s)} ${ok?"≥":"<"} ${nf(o.smin,1)} : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée ; il faut épaissir la plaque ou choisir un matériau plus résistant."} Piège : un calcul σ = ${FRAC("F","S")} loin du trou donnerait une contrainte deux à trois fois plus faible, donc un coefficient de sécurité deux à trois fois trop grand.`}]; },
/* simulation d'un bras : carte des contraintes, carte des déplacements, conclusion */
()=>{ const tgt=rnd([0,1,2,3]), m=MR[rnd(["alu","s235"])];
  const o=draw(()=>({max:Math.round(m.Re*rnd([0.25,0.35,0.45,0.55,0.65,0.75])/4)*4,smin:rnd([1.5,2,2.5,3]),f:rnd([0.8,1.2,1.6,2.4,3.2,4,5.6]),fm:rnd([1,1.5,2,3,4,5])}),o=>{ const s=m.Re/o.max; return far(s,o.smin,0.06)&&far(o.f,o.fm,0.06)&&((s>=o.smin?0:2)+(o.f<=o.fm?0:1))===tgt; });
  const s=m.Re/o.max, C=C4("la flèche");
  const ctx=`Bras de robot en ${m.nm} (Re = ${m.Re} MPa), encastré à gauche et chargé à son extrémité. La carte des contraintes donne la contrainte équivalente de Von Mises, qui se compare directement à Re. Exigences : coefficient de sécurité s ≥ ${nf(o.smin,1)} et flèche (déplacement maximal) f ≤ ${nf(o.fm,1)} mm.`;
  return [{fig:fx_rdm_femConsole({max:o.max,unit:"MPa"}),ctx,q:"À partir de la carte des contraintes, calcule le coefficient de sécurité du bras.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`Contrainte maximale, en haut de l'échelle : ${o.max} MPa. ${F(`s = ${FRAC("Re","σmax")}`)} = ${FRAC(m.Re,o.max)} = ${U(s,"")}.`},
    {fig:fx_rdm_femConsole({max:o.f,unit:"mm",disp:true,dec:1}),ctx,q:"Compte tenu de la carte des déplacements et du résultat précédent, le bras satisfait-il les deux exigences ?",type:"ch",ch:C,ok:tgt,
      expl:`Le déplacement maximal, à l'extrémité libre, vaut f = ${nf(o.f,1)} mm ${o.f<=o.fm?"≤":">"} ${nf(o.fm,1)} mm ; s = ${S3(s)} ${s>=o.smin?"≥":"<"} ${nf(o.smin,1)}. ${C[tgt]}. Une pièce peut être assez résistante mais trop souple, ou l'inverse : on vérifie toujours les deux critères.`}]; },
/* repérer l'erreur dans une résolution */
()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
  if(v===0){ const d=rnd([8,10,12,16]), Fk=rnd([5,8,10,12]), Fn=Fk*1000, Sw=Math.PI*(d/2)**2/4, S=secR(d);
    ctx=`Contrainte dans une tige de diamètre ${d} mm tendue par ${Fk} kN.`;
    st=[`S = ${FRAC("π·d²","4")} = ${FRAC(`π × ${d/2}²`,"4")} = ${nf(Sw,1)} mm²`,`F = ${nf(Fn,0)} N`,`σ = ${FRAC("F","S")} = ${FRAC(nf(Fn,0),nf(Sw,1))} = ${nf(Fn/Sw,0)} MPa`]; bad=0;
    why=`L'élève a remplacé le diamètre par le rayon : S = ${FRAC(`π × ${d}²`,"4")} = ${nf(S,1)} mm², d'où σ = ${nf(Fn/S,1)} MPa, quatre fois moins.`; }
  else if(v===1){ const L=rnd([2,3,4]), S=rnd([50,78.5,113]), Fk=rnd([5,8,10]), Fn=Fk*1000, wr=Fn*L*1000/(210*S), ri=Fn*L*1000/(210000*S);
    ctx=`Allongement d'une barre d'acier (E = 210 GPa) de ${L} m et de section ${nf(S,1)} mm², tendue par ${Fk} kN.`;
    st=[`F = ${nf(Fn,0)} N ; L0 = ${nf(L*1000,0)} mm`,`ΔL = ${FRAC("F·L0","E·S")} = ${FRAC(`${nf(Fn,0)} × ${nf(L*1000,0)}`,`210 × ${nf(S,1)}`)} = ${nf(wr,0)} mm`,`La barre s'allonge d'environ ${nf(wr/1000,1)} m.`]; bad=1;
    why=`E doit être en MPa (N/mm²) : E = 210 GPa = 210 000 MPa, d'où ΔL = ${nf(ri,2)} mm. Un allongement de ${nf(wr/1000,1)} m pour une barre d'acier de ${L} m aurait dû alerter.`; }
  else if(v===2){ const k=rnd(["alu","s235"]), m=MR[k], sg=rnd(k==="alu"?[60,80,100,120]:[50,70,90,110]);
    ctx=`Coefficient de sécurité d'une pièce en ${m.nm} (Re = ${m.Re} MPa) où σmax = ${sg} MPa.`;
    st=[`s = ${FRAC("σmax","Re")} = ${FRAC(sg,m.Re)} = ${nf(sg/m.Re,2)}`,"s est inférieur à 1.","La pièce va donc se déformer de façon permanente."]; bad=0;
    why=`${F(`s = ${FRAC("Re","σmax")}`)} = ${FRAC(m.Re,sg)} = ${nf(m.Re/sg,2)} > 1 : la pièce reste dans le domaine élastique.`; }
  else if(v===3){ const S=rnd([50,80,100,150]), Fk=rnd([4,6,8,10]), Fn=Fk*1000;
    ctx=`Contrainte dans un tirant de section ${S} mm² tendu par ${Fk} kN (acier, Re = 235 MPa).`;
    st=[`σ = ${FRAC("F","S")}`,`σ = ${FRAC(Fk,S)} = ${nf(Fk/S,3)} MPa`,"La contrainte est très faible devant Re : aucun risque."]; bad=1;
    why=`F doit être en newtons : F = ${nf(Fn,0)} N, d'où σ = ${FRAC(nf(Fn,0),S)} = ${nf(Fn/S,1)} MPa, mille fois plus.`; }
  else if(v===4){ const ep=rnd([0.08,0.1,0.12,0.15,0.2]);
    ctx=`Contrainte dans une pièce en aluminium (E = 70 000 MPa, Re = 240 MPa) sur laquelle une jauge mesure ε = ${nf(ep,2)} %.`;
    st=["Loi de Hooke : σ = E·ε",`σ = 70 000 × ${nf(ep,2)} = ${nf(70000*ep,0)} MPa`,"σ > Re : la pièce est déformée de façon permanente."]; bad=1;
    why=`ε = ${nf(ep,2)} % = ${nf(ep/100,4)} : σ = 70 000 × ${nf(ep/100,4)} = ${nf(700*ep,1)} MPa, bien inférieure à Re.`; }
  else { const Sm=rnd([60,80,120,150,200]), d2=4*Sm/Math.PI;
    ctx=`Diamètre minimal d'une tige dont la section doit être d'au moins ${Sm} mm².`;
    st=[`${FRAC("π·d²","4")} ≥ ${Sm}`,`d² ≥ ${FRAC(`4 × ${Sm}`,"π")} = ${nf(d2,1)} mm²`,`d ≥ ${FRAC(nf(d2,1),"2")} = ${nf(d2/2,1)} mm`]; bad=2;
    why=`Il faut prendre la racine carrée : d ≥ √${nf(d2,1)} = ${nf(Math.sqrt(d2),1)} mm.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* écart relatif entre simulation et mesure par jauge */
()=>{ const inside=Math.random()<0.5;
  const o=draw(()=>({ep:rnd([800,900,1000,1100,1200,1300,1500]),disp:rnd([3,4,5,6,8]),k:1+rnd([-1,1])*(0.005+Math.random()*0.15)}),o=>{ const sm=70000*o.ep*1e-6, ss=Math.round(sm*o.k), er=Math.abs(ss-sm)/sm*100; return far(er,o.disp,0.25)&&er>=0.5&&(er<o.disp)===inside; });
  const sm=70000*o.ep*1e-6, ss=Math.round(sm*o.k), er=Math.abs(ss-sm)/sm*100;
  const ctx=`Bras de robot en alliage d'aluminium (E = 70 000 MPa). Dans la zone critique, la simulation par éléments finis donne σ_sim = ${ss} MPa. Sur le prototype, une jauge collée au même endroit mesure ε = ${nf(o.ep,0)} µm/m (moyenne de plusieurs essais ; dispersion des essais : ± ${o.disp} %).`;
  return [{ctx,q:"Calcule la contrainte mesurée σ_mes.",type:"num",ans:sm,tolR:0.02,unit:"MPa",
      expl:`${F("σ = E·ε")} = 70 000 × ${nf(o.ep*1e-6,6)} = ${U(sm,"MPa")}.`},
    {ctx,q:"Calcule l'écart relatif entre la simulation et la mesure, en prenant la mesure comme référence.",type:"num",ans:er,tolR:0.03,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|σ_sim − σ_mes|","σ_mes")} × 100`)} = ${FRAC(`|${ss} − ${nf(sm,1)}|`,nf(sm,1))} × 100 = ${U(er,"%")}.`},
    {ctx,q:"Que peut-on conclure ?",type:"ch",ch:["Les essais ne mettent pas le modèle en défaut","Le modèle est mis en défaut : l'écart dépasse la dispersion des essais"],ok:inside?0:1,
      expl:inside?`L'écart (${nf(er,1)} %) est inférieur à la dispersion des essais (± ${o.disp} %) : ${F("les essais ne mettent pas le modèle en défaut")}.`:`L'écart (${nf(er,1)} %) dépasse la dispersion des essais (± ${o.disp} %) : le modèle est mis en défaut. Il faut revoir ses hypothèses (liaisons, chargement, maillage, propriétés du matériau).`}]; },
/* hypothèses et limites du modèle */
()=>{ const v=rnd([0,1,2,3,4]);
  if(v===0) return {q:"Pour une pièce imprimée en PLA, on impose souvent un coefficient de sécurité plus grand que pour une pièce usinée en acier. Pourquoi ?",type:"ch",
    ...mc("Les propriétés d'une pièce imprimée sont dispersées : elles dépendent du remplissage, de l'orientation et de l'adhérence entre les couches",["Parce que le PLA a un module d'Young plus grand que l'acier","Parce que le PLA est plus dense que l'acier","Parce que la loi de Hooke ne s'applique jamais aux plastiques"]),
    expl:"Le coefficient de sécurité couvre les incertitudes. Une pièce imprimée est moins homogène qu'une pièce usinée : sa résistance varie selon le remplissage, l'orientation des couches et leur adhérence (souvent plus faible entre les couches). On prend donc s plus grand, par exemple 4 ou 5."};
  if(v===1){ const sg=rnd([280,300,320,350]);
    return {q:`Une simulation élastique linéaire (loi de Hooke) donne σmax = ${sg} MPa dans une pièce en alliage d'aluminium (Re = 240 MPa). Que penser de ce résultat ?`,type:"ch",
      ...mc("Il n'est pas valable tel quel : au-delà de Re, la pièce se déforme de façon permanente, il faut la redimensionner",["Il est valable : la loi de Hooke s'applique quelle que soit la contrainte","La pièce résiste, car σmax est bien inférieure au module d'Young","Il suffit de grossir le maillage pour faire passer σmax sous Re"]),
      expl:`σmax = ${sg} MPa > Re = 240 MPa : le modèle élastique suppose σ ≤ Re, il n'est plus représentatif. Surtout, la pièce serait déformée de façon permanente : il faut modifier la géométrie ou le matériau pour obtenir ${F("σmax < Re")} avec le coefficient de sécurité exigé.`}; }
  if(v===2) return {q:"Dans la zone critique d'une simulation (un congé de raccordement), le maillage est grossier. Que faut-il faire avant de conclure sur la contrainte maximale ?",type:"ch",
    ...mc("Affiner le maillage dans cette zone et vérifier que σmax ne change presque plus",["Rien : le maillage n'influence pas les résultats","Grossir encore le maillage pour lisser les résultats","Remplacer le matériau par un matériau plus résistant"]),
    expl:"Avec des éléments trop gros, la simulation lisse les pics de contrainte et sous-estime souvent σmax. On raffine le maillage dans la zone critique jusqu'à ce que le résultat se stabilise : c'est la convergence du maillage."};
  if(v===3) return {ctx:`Là où la section d'une pièce change brusquement, la contrainte locale dépasse nettement ${FRAC("F","S")} : c'est une concentration de contraintes, d'autant plus forte que le changement de forme est brutal.`,q:"Deux pièces identiques ne diffèrent que par le raccordement entre deux sections : un angle vif ou un congé arrondi. Laquelle présente la plus petite contrainte maximale ?",type:"ch",
    ...mc("Celle avec un congé arrondi : la concentration de contraintes y est plus faible",["Celle avec un angle vif : il y a plus de matière","Les deux : la contrainte ne dépend que de F et de S","Aucune différence si la pièce est en acier"]),
    expl:"Un changement brusque de section concentre les contraintes : un angle vif crée un pic local, siège fréquent des fissures. Un congé arrondi répartit mieux les efforts et diminue la contrainte maximale : c'est pourquoi on arrondit les raccordements des pièces sollicitées."};
  return {q:"Dans la simulation, le bras d'un robot est supposé parfaitement encastré. En réalité, il est fixé par deux vis sur une platine un peu souple. Comment sera la flèche réelle, comparée à la flèche simulée ?",type:"ch",
    ...mc("Un peu plus grande : la fixation réelle est moins rigide qu'un encastrement parfait",["Un peu plus petite : les vis rigidifient le bras","Identique : seule la charge compte","Nulle : un bras fixé par des vis ne fléchit pas"]),
    expl:"Un encastrement parfait n'existe pas : la platine et les vis se déforment un peu. La simulation, plus rigide que la réalité, sous-estime la flèche. C'est une source classique d'écart entre le modèle et les essais."}; },
/* critère limitant : résistance ou allongement */
()=>{ const m=MR[rnd(["alu","s235"])];
  const o=draw(()=>({L:rnd([1,1.5,2,2.5,3]),S:rnd([50,80,100,120,150,200]),s:rnd([2,2.5,3]),dLm:rnd([0.5,1,1.5,2])}),o=>{ const Fr=o.S*m.Re/o.s, Fg=o.dLm*m.E*o.S/(o.L*1000); return far(Fr,Fg,0.12); });
  const Fr=o.S*m.Re/o.s, Fg=o.dLm*m.E*o.S/(o.L*1000), lim=Fr<Fg?"résistance":"allongement", Fm=Math.min(Fr,Fg), FM=Math.max(Fr,Fg);
  const ctx=`Tirant en ${m.nm} (E = ${nf(m.E,0)} MPa, Re = ${m.Re} MPa), de longueur L0 = ${nf(o.L,1)} m et de section S = ${o.S} mm². Exigences : coefficient de sécurité s ≥ ${nf(o.s,1)} et allongement ΔL ≤ ${nf(o.dLm,1)} mm.`;
  return [{ctx,q:"Quelle force maximale respecte l'exigence de résistance, en kN ?",type:"num",ans:Fr/1000,tolR:0.02,unit:"kN",
      expl:`Il faut ${F(`σ ≤ ${FRAC("Re","s")}`)} : ${F(`F ≤ ${FRAC("S·Re","s")}`)} = ${FRAC(`${o.S} × ${m.Re}`,nf(o.s,1))} = ${nf(Fr,0)} N, soit ${U(Fr/1000,"kN")}.`},
    {ctx,q:"Quelle force maximale respecte l'exigence d'allongement, en kN ?",type:"num",ans:Fg/1000,tolR:0.02,unit:"kN",
      expl:`${F(`ΔL = ${FRAC("F·L0","E·S")}`)} ≤ ΔLmax, donc ${F(`F ≤ ${FRAC("ΔLmax·E·S","L0")}`)} = ${FRAC(`${nf(o.dLm,1)} × ${nf(m.E,0)} × ${o.S}`,nf(o.L*1000,0))} = ${nf(Fg,0)} N, soit ${U(Fg/1000,"kN")}.`},
    {ctx,q:"Quelle force maximale peut-on finalement appliquer au tirant ?",type:"ch",...mc(`${S3(Fm/1000)} kN : c'est l'exigence ${lim==="résistance"?"de résistance":"d'allongement"} qui limite`,[`${S3(FM/1000)} kN : c'est l'exigence ${lim==="résistance"?"d'allongement":"de résistance"} qui limite`,`${S3((Fr+Fg)/1000)} kN : on additionne les deux limites`,`${S3((Fr+Fg)/2000)} kN : on prend la moyenne des deux limites`]),
      expl:`Les deux exigences doivent être respectées en même temps : on retient la plus petite des deux forces, ${F(`${S3(Fm/1000)} kN`)}. Ici, c'est ${lim==="résistance"?"la résistance":"la rigidité (l'allongement)"} qui dimensionne le tirant.`}]; },
/* tube ou barre pleine de même section */
()=>{ const [D,e]=rnd([[30,2],[40,2],[40,3],[50,3],[60,3],[60,4]]), d=D-2*e, S=Math.PI*(D*D-d*d)/4, dp=Math.sqrt(D*D-d*d);
  const ctx=`On compare un tube d'acier (diamètre extérieur D = ${D} mm, épaisseur e = ${e} mm) et une barre ronde pleine de même section, donc de même masse pour une même longueur.`;
  return [{ctx,q:"Calcule le diamètre de la barre pleine.",type:"num",ans:dp,tolR:0.02,unit:"mm",
      expl:`d = D − 2e = ${d} mm ; section du tube : ${F(`S = ${FRAC("π·(D² − d²)","4")}`)} = ${nf(S,1)} mm². Barre pleine : ${FRAC("π·dp²","4")} = S, donc ${F("dp = √(D² − d²)")} = √(${D}² − ${d}²) = ${U(dp,"mm")}.`},
    {ctx,q:"Les deux pièces sont tendues par la même force. Comment se comparent leurs contraintes normales ?",type:"ch",...mc("Elles sont égales : en traction, seule l'aire de la section compte",["Le tube est plus sollicité, car sa paroi est mince","La barre pleine est plus sollicitée, car son diamètre est plus petit","On ne peut pas conclure sans connaître le matériau"]),
      expl:`${F(`σ = ${FRAC("F","S")}`)} : même force, même aire, donc même contrainte, quelle que soit la forme de la section.`},
    {ctx,q:"Posées sur deux appuis et chargées en leur milieu, laquelle fléchit le moins ?",type:"ch",...mc("Le tube : sa matière est plus éloignée de la fibre neutre",["La barre pleine : elle est plus compacte","Elles fléchissent autant : même section","La barre pleine : elle a plus de matière au centre"]),
      expl:`En flexion, la matière travaille d'autant plus qu'elle est loin de la fibre neutre ; au centre, elle ne sert presque à rien. À masse égale, le ${F("tube")} est bien plus rigide en flexion : d'où les cadres de vélo, les mâts et les bras de drone en tube.`}]; },
/* patte imprimée en PLA : coefficient de sécurité, épaisseur minimale, épaisseur imprimable */
()=>{ const o=draw(()=>({Fn:rnd([150,200,250,300,400,500]),b:rnd([10,12,15,20]),e:rnd([1.2,1.6,2,2.4]),smin:rnd([4,5,6])}),o=>{ const s=50*o.b*o.e/o.Fn, em=o.smin*o.Fn/(50*o.b), fr=em/0.2-Math.floor(em/0.2); return s>=1.2&&s<o.smin*0.9&&em<=6&&fr>=0.1&&fr<=0.9; });
  const S=o.b*o.e, sg=o.Fn/S, s=50/sg, em=o.smin*o.Fn/(50*o.b), ec=Math.ceil(em/0.2)*0.2;
  const ctx=`La patte de fixation d'un capteur sur un robot est imprimée à plat en PLA (Re = 50 MPa), en couches de 0,2 mm. Elle travaille en traction : F = ${o.Fn} N, section rectangulaire de largeur b = ${o.b} mm et d'épaisseur e = ${nf(o.e,1)} mm. Pour une pièce imprimée, le cahier des charges impose s ≥ ${o.smin}.`;
  return [{ctx,q:"Calcule le coefficient de sécurité de la patte actuelle.",type:"num",ans:s,tolA:0.02,unit:"",
      expl:`S = ${o.b} × ${nf(o.e,1)} = ${nf(S,1)} mm² ; σ = ${FRAC(o.Fn,nf(S,1))} = ${nf(sg,2)} MPa ; ${F(`s = ${FRAC("Re","σ")}`)} = ${U(s,"")} < ${o.smin} : la patte est sous-dimensionnée.`},
    {ctx,q:"Quelle épaisseur minimale faut-il lui donner, sans changer sa largeur ?",type:"num",ans:em,tolR:0.02,unit:"mm",
      expl:`Il faut ${F(`${FRAC("F","b·e")} ≤ ${FRAC("Re","s")}`)}, donc ${F(`e ≥ ${FRAC("s·F","Re·b")}`)} = ${FRAC(`${o.smin} × ${o.Fn}`,`50 × ${o.b}`)} = ${U(em,"mm")}.`},
    {ctx,q:"L'épaisseur imprimée doit être un nombre entier de couches. Quelle épaisseur retenir ?",type:"num",ans:ec,tolA:0.01,unit:"mm",
      expl:`${nf(em,2)} mm correspond à ${FRAC(nf(em,2),"0,2")} = ${nf(em/0.2,2)} couches : il faut arrondir à l'entier supérieur, ${Math.round(ec/0.2)} couches, soit ${U(ec,"mm")}. Arrondir à l'entier inférieur donnerait s < ${o.smin}.`}]; }
];

POOLS["meca-rdm"]={
  titre:"Contraintes, déformations, sécurité",
  fiche:{t:"Résistance des matériaux",l:[
    `Contrainte normale (traction, compression) : ${F(`σ = ${FRAC("F","S")}`)}, en MPa si F en N et S en mm² (1 MPa = 1 N/mm²) ; section ronde : ${F(`S = ${FRAC("π·d²","4")}`)}.`,
    `Domaine élastique, loi de Hooke : ${F("σ = E·ε")} avec ${F(`ε = ${FRAC("ΔL","L0")}`)} sans unité, d'où l'allongement ${F(`ΔL = ${FRAC("F·L0","E·S")}`)}.`,
    `Résistance : coefficient de sécurité ${F(`s = ${FRAC("Re","σmax")}`)} ; exigence ${F(`σmax ≤ ${FRAC("Re","s")}`)} ; dimensionnement ${F(`S ≥ ${FRAC("s·F","Re")}`)}.`,
    `Flexion : une face tendue, une face comprimée, contrainte nulle sur la ${F("fibre neutre")} ; en simulation, la zone critique est celle de la ${F("contrainte maximale")} (souvent un trou, un angle, un encastrement).`,
    `Pièges : E donné en GPa à convertir (${F("1 GPa = 1 000 MPa")}), kN non convertis, rayon pris pour le diamètre, ε en % utilisé tel quel, s inversé (il doit être supérieur à 1), une seule exigence vérifiée sur deux.`]},
  count:{1:4,2:4,3:3},1:R1,2:R2,3:R3
};

/* ======================================================================
   THERMIQUE (partie SI) : parois, isolants, dissipation des composants, bilans de locaux
   ====================================================================== */
/* conductivités thermiques usuelles en W·m⁻¹·K⁻¹ (fibre de coco : valeur indicative) */
const MT={
  pu:{nm:"mousse de polyuréthane",l:0.025,m:"isolant"},
  xps:{nm:"polystyrène extrudé",l:0.030,m:"isolant"},
  lv:{nm:"laine de verre",l:0.035,m:"isolant"},
  pse:{nm:"polystyrène expansé",l:0.038,m:"isolant"},
  lr:{nm:"laine de roche",l:0.040,m:"isolant"},
  coco:{nm:"fibre de coco",l:0.050,m:"isolant"},
  bois:{nm:"bois",l:0.15,m:"bois"},
  pc:{nm:"polycarbonate",l:0.20,m:"plast"},
  platre:{nm:"plâtre",l:0.25,m:"platre"},
  verre:{nm:"verre",l:1.0,m:"verre"},
  beton:{nm:"béton",l:1.75,m:"beton"},
  acier:{nm:"acier",l:50,m:"metal"}
};
const WMK="W·m⁻¹·K⁻¹";
const lam=k=>nf(MT[k].l,3);
const fe=e=>e<0.05?`${nf(e*1000,0)} mm`:`${nf(e*100,1)} cm`;
/* composants électroniques : résistance thermique jonction-air sans dissipateur, jonction-boîtier, Tj max */
const COMP=[
  {nm:"régulateur de tension en boîtier TO-220",Rja:50,Rjb:3,Tjm:125},
  {nm:"transistor MOSFET en boîtier TO-220",Rja:62,Rjb:1,Tjm:150},
  {nm:"transistor MOSFET en boîtier TO-247",Rja:40,Rjb:0.5,Tjm:150},
  {nm:"pont de diodes en boîtier plat",Rja:22,Rjb:2,Tjm:150}];
/* paroi multicouche lay = [[matériau, e]] de surface S, du côté chaud (T0) au côté froid (Tn) : résistances, flux, températures aux frontières */
const prof=(lay,S,T0,Tn)=>{ const R=lay.map(([k,e])=>e/(MT[k].l*S)), Rt=R.reduce((a,b)=>a+b,0), Phi=(T0-Tn)/Rt, Tv=[T0]; R.forEach(r=>Tv.push(Tv[Tv.length-1]-Phi*r)); return {R,Rt,Phi,Tv}; };
const couches=lay=>lay.map(([k,e])=>({m:MT[k].m,e}));

const TH1=[
/* flux à travers une paroi : Φ = ΔT/Rth */
()=>{ const C=rnd([{s:"des parois d'une glacière",w:"ces parois",R:[0.8,1,1.2,1.5,2],Ti:[2,4,5],Te:[28,30,32]},{s:"des parois d'une chambre froide",w:"ces parois",R:[0.03,0.04,0.05,0.06],Ti:[-25,-20,-18],Te:[22,25,28]},
      {s:"des murs d'un local technique climatisé",w:"ces murs",R:[0.008,0.01,0.012,0.015,0.02],Ti:[22,24],Te:[30,32,34]},{s:"du vitrage d'une salle climatisée",w:"ce vitrage",R:[0.04,0.05,0.08,0.1],Ti:[24,25,26],Te:[30,32,33]},
      {s:"des parois d'un boîtier électronique",w:"ces parois",R:[0.5,0.8,1,1.5,2],Ti:[45,50,55,60],Te:[25,30,35]},{s:"des murs d'un refuge de montagne chauffé",w:"ces murs",R:[0.01,0.015,0.02,0.025],Ti:[18,19,20],Te:[-10,-8,-5,-2]}]);
  const R=rnd(C.R), Ti=rnd(C.Ti), Te=rnd(C.Te), hot=Math.max(Ti,Te), cold=Math.min(Ti,Te), dT=hot-cold, Phi=dT/R;
  return {ctx:`Résistance thermique ${C.s} : Rth = ${nf(R,3)} K/W. Température intérieure : ${tC(Ti,0)} °C ; température extérieure : ${tC(Te,0)} °C.`,
    q:`Quel flux thermique traverse ${C.w} en régime permanent ?`,type:"num",ans:Phi,tolR:0.02,unit:"W",
    expl:`ΔT = ${hot} − ${tP(cold)} = ${dT} °C, soit ${dT} K. ${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(dT,nf(R,3))} = ${U(Phi,"W")}, ${Te>Ti?"de l'extérieur vers l'intérieur":"de l'intérieur vers l'extérieur"} (du chaud vers le froid).`}; },
/* résistance de conduction : Rth = e/(λ·S) */
()=>{ const C=rnd([{s:"Le fond d'une glacière",f:0,k:"pse",e:[2,3,4,5],u:"cm",d:[[0.3,0.4],[0.35,0.5],[0.4,0.6]]},{s:"Un panneau de chambre froide",f:0,k:"pu",e:[80,100,120,150],u:"mm",d:[[1.2,2.5],[1.2,3],[1,2.4]]},
      {s:"Le couvercle d'un boîtier électronique",f:0,k:"pc",e:[3,4,5],u:"mm",d:[[0.2,0.3],[0.25,0.25],[0.3,0.4]]},{s:"L'isolant posé sur le faux plafond d'un fare",f:0,k:"lv",e:[10,12,15,20],u:"cm",d:[[4,5],[5,6],[4,8]]},
      {s:"La porte d'un local technique",f:1,k:"bois",e:[4,5,6],u:"cm",d:[[0.8,2],[0.9,2.1]]}]);
  const e0=rnd(C.e), [a,b]=rnd(C.d), e=C.u==="mm"?e0/1000:e0/100, S=a*b, R=e/(MT[C.k].l*S);
  return {ctx:`${C.s} (${nf(a,2)} m × ${nf(b,2)} m) est réalisé${C.f?"e":""} en ${MT[C.k].nm} (λ = ${lam(C.k)} ${WMK}), sur une épaisseur e = ${e0} ${C.u}.`,
    q:"Calcule sa résistance thermique de conduction.",type:"num",ans:R,tolR:0.02,unit:"K/W",
    expl:`S = ${nf(a,2)} × ${nf(b,2)} = ${nf(S,4)} m² ; e = ${e0} ${C.u} = ${nf(e,3)} m. ${F(`Rth = ${FRAC("e","λ·S")}`)} = ${FRAC(nf(e,3),`${lam(C.k)} × ${nf(S,4)}`)} = ${U(R,"K/W")}.`}; },
/* résistances en série lues sur un schéma thermique */
()=>{ if(Math.random()<0.5){ const R=[rnd([0.5,0.8,1,1.5,2,3]),rnd([0.2,0.3,0.5,0.8]),rnd([1.2,2,2.5,3.5,4.5,6])], Rt=R[0]+R[1]+R[2];
    return {fig:fx_th_serie({n:["Tj","Tb","Td","Ta"],r:[["Rjb",`${nf(R[0],1)} K/W`],["Rbd",`${nf(R[1],1)} K/W`],["Rda",`${nf(R[2],1)} K/W`]],phi:"Φ = P",cap:"jonction → boîtier → dissipateur → air ambiant"}),
      ctx:"Schéma thermique d'un transistor monté avec de la pâte thermique sur un dissipateur.",q:"À partir du schéma, quelle est la résistance thermique totale entre la jonction et l'air ambiant ?",type:"num",ans:Rt,tolR:0.02,unit:"K/W",
      expl:`Le même flux Φ traverse les trois résistances : elles sont en série et s'additionnent. ${F("Rth = Rjb + Rbd + Rda")} = ${R.map(r=>nf(r,1)).join(" + ")} = ${U(Rt,"K/W")}.`}; }
  const R=[rnd([0.004,0.005,0.006,0.008]),rnd([0.12,0.15,0.2,0.25,0.3]),rnd([0.004,0.005,0.006])], Rt=R[0]+R[1]+R[2];
  return {fig:fx_th_serie({n:["Te","T1","T2","Ti"],r:[["R1",`${nf(R[0],3)} K/W`],["R2",`${nf(R[1],3)} K/W`],["R3",`${nf(R[2],3)} K/W`]],phi:"Φ",cap:"béton → isolant → plâtre"}),
    ctx:"Schéma thermique d'un mur de local : béton, isolant puis plaque de plâtre, de l'extérieur vers l'intérieur.",q:"À partir du schéma, quelle est la résistance thermique totale du mur ?",type:"num",ans:Rt,tolR:0.02,unit:"K/W",
    expl:`Les trois couches sont traversées par le même flux : leurs résistances sont en série et s'additionnent. ${F("Rth = R1 + R2 + R3")} = ${R.map(r=>nf(r,3)).join(" + ")} = ${U(Rt,"K/W")}. L'isolant apporte l'essentiel de la résistance.`}; },
/* température de jonction sans dissipateur */
()=>{ const c=rnd(COMP), o=draw(()=>({P:rnd([0.5,0.8,1,1.2,1.5,2,2.5,3]),Ta:rnd([25,30,35,40])}),o=>{ const Tj=o.Ta+o.P*c.Rja; return Tj<=c.Tjm*1.35&&far(Tj,c.Tjm,0.05); });
  const Tj=o.Ta+o.P*c.Rja, ok=Tj<=c.Tjm;
  return {ctx:`Un ${c.nm} fonctionne sans dissipateur et dissipe P = ${nf(o.P,1)} W. Fiche technique : résistance thermique jonction-air Rth(j-a) = ${c.Rja} K/W ; Tj max = ${c.Tjm} °C. Air ambiant : ${o.Ta} °C.`,
    q:"Calcule la température de sa jonction en régime permanent.",type:"num",ans:Tj,tolR:0.02,unit:"°C",
    expl:`${F("Tj = Ta + P·Rth(j-a)")} = ${o.Ta} + ${nf(o.P,1)} × ${c.Rja} = ${o.Ta} + ${nf(o.P*c.Rja,1)} = ${U(Tj,"°C")}. ${ok?`C'est moins que Tj max = ${c.Tjm} °C : le composant peut fonctionner sans dissipateur.`:`C'est plus que Tj max = ${c.Tjm} °C : il faut un dissipateur.`}`}; },
/* puissance maximale sans dissipateur */
()=>{ const c=rnd(COMP), Ta=rnd([25,30,35,40,45,50]), P=(c.Tjm-Ta)/c.Rja;
  return {ctx:`Fiche technique d'un ${c.nm} : Tj max = ${c.Tjm} °C ; résistance thermique jonction-air, sans dissipateur, Rth(j-a) = ${c.Rja} K/W. L'air ambiant est à ${Ta} °C.`,
    q:"Quelle puissance maximale le composant peut-il dissiper sans dissipateur ?",type:"num",ans:P,tolR:0.02,unit:"W",
    expl:`Il faut ${F("Tj = Ta + P·Rth(j-a) ≤ Tj max")}, donc ${F(`Pmax = ${FRAC("Tj max − Ta","Rth(j-a)")}`)} = ${FRAC(`${c.Tjm} − ${Ta}`,c.Rja)} = ${U(P,"W")}. Au-delà, il faut un dissipateur.`}; },
/* énergie transférée : E = Φ·Δt */
()=>{ const v=rnd([0,1,2]);
  if(v===0){ const Phi=rnd([400,500,650,800,950,1200]), E=Phi*24/1000;
    return {ctx:`Le flux thermique qui entre dans une chambre froide à travers ses parois vaut Φ = ${nf(Phi,0)} W, jour et nuit.`,
      q:"Quelle énergie thermique le groupe frigorifique doit-il extraire en une journée pour compenser ces entrées, en kWh ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`${F("E = Φ·Δt")} = ${nf(Phi,0)} W × 24 h = ${nf(Phi*24,0)} Wh, soit ${U(E,"kWh")}.`}; }
  if(v===1){ const Phi=rnd([600,800,1000,1500,2000]), h=rnd([8,10,12]), j=rnd([22,26,30]), E=Phi*h*j/1000;
    return {ctx:`Les parois d'un local technique climatisé laissent entrer un flux thermique Φ = ${nf(Phi,0)} W pendant les heures chaudes, ${h} h par jour.`,
      q:`Quelle énergie thermique entre ainsi en ${j} jours, en kWh ?`,type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`Durée : ${j} × ${h} = ${j*h} h. ${F("E = Φ·Δt")} = ${nf(Phi,0)} W × ${j*h} h = ${nf(Phi*h*j,0)} Wh, soit ${U(E,"kWh")}.`}; }
  const Phi=rnd([18,22,25,28,32,36]), h=rnd([6,8,10,12]), E=Phi*h*3600/1000;
  return {ctx:`Pendant une sortie en bateau, un flux thermique Φ = ${Phi} W entre dans une glacière à travers ses parois.`,
    q:`Quelle énergie thermique entre dans la glacière en ${h} h, en kJ ?`,type:"num",ans:E,tolR:0.02,unit:"kJ",
    expl:`Avec Δt en secondes : Δt = ${h} × 3 600 = ${nf(h*3600,0)} s. ${F("E = Φ·Δt")} = ${Phi} × ${nf(h*3600,0)} = ${nf(Phi*h*3600,0)} J, soit ${U(E,"kJ")}.`}; },
/* classer des matériaux selon leur conductivité */
()=>{ const ks=draw(()=>pick(["pu","xps","lv","pse","lr","coco","bois","platre","beton","verre","acier"],4),ks=>ks.some(k=>MT[k].m==="isolant")&&ks.some(k=>MT[k].m!=="isolant"));
  const ord=ks.slice().sort((a,b)=>MT[a].l-MT[b].l), txt=a=>cap1(a.map(k=>MT[k].nm).join(" → ")), okT=txt(ord), wr=[txt(ord.slice().reverse())];
  while(wr.length<3){ const p=txt(shuffle(ord)); if(p!==okT&&!wr.includes(p)) wr.push(p); }
  return {data:table(["Matériau","λ (W·m⁻¹·K⁻¹)"],ks.map(k=>[cap1(MT[k].nm),lam(k)])),q:"Classe ces matériaux du plus isolant au moins isolant.",type:"ch",...mc(okT,wr),
    expl:`À épaisseur et surface égales, ${F(`Rth = ${FRAC("e","λ·S")}`)} est d'autant plus grande que λ est petite : le meilleur isolant a la plus petite conductivité thermique. Du plus petit λ au plus grand : ${okT.toLowerCase()}.`}; },
/* sens du transfert thermique à travers les parois d'une enceinte */
()=>{ const C=rnd([{k:"froid",Ti:rnd([-25,-20,-18]),Te:rnd([22,25,28]),lab:"chambre froide",w:"le groupe frigorifique doit extraire ce flux en permanence"},
      {k:"glaciere",Ti:rnd([2,4,5]),Te:rnd([28,30,32]),lab:"glacière",w:"la glace absorbe ce flux en fondant"},
      {k:"local",Ti:rnd([22,23,24]),Te:rnd([30,32,34]),lab:"local technique climatisé",w:"le climatiseur doit extraire ce flux"},
      {k:"boitier",Ti:rnd([45,50,55]),Te:rnd([28,30,32]),lab:"boîtier électronique étanche",w:"c'est ainsi que la chaleur produite par la carte est évacuée"},
      {k:"refuge",Ti:rnd([18,19,20]),Te:rnd([-8,-5,-2]),lab:"refuge de montagne chauffé",w:"le chauffage doit compenser ce flux"}]), inw=C.Te>C.Ti;
  return {fig:fx_th_enceinte({k:C.k,ti:`Ti = ${tC(C.Ti,0)} °C`,te:`Te = ${tC(C.Te,0)} °C`,dir:0,lab:C.lab}),
    q:"Dans quel sens le transfert thermique traverse-t-il les parois ?",type:"ch",ch:["De l'extérieur vers l'intérieur","De l'intérieur vers l'extérieur","Aucun transfert : les parois sont isolantes"],ok:inw?0:1,
    expl:`Un transfert thermique spontané va toujours du chaud vers le froid : ici ${inw?`de l'extérieur (${tC(C.Te,0)} °C) vers l'intérieur (${tC(C.Ti,0)} °C)`:`de l'intérieur (${tC(C.Ti,0)} °C) vers l'extérieur (${tC(C.Te,0)} °C)`} ; ${C.w}. Un isolant ralentit le transfert (grande Rth), il ne l'annule pas.`}; },
/* questions de cours */
()=>{ const v=rnd([0,1,2,3]);
  if(v===0) return {q:"Parmi ces grandeurs, laquelle ne dépend que du matériau, et pas des dimensions de la paroi ?",type:"ch",...mc("La conductivité thermique λ",["La résistance thermique Rth","Le flux thermique Φ","L'épaisseur e"]),
    expl:`λ, en ${WMK}, caractérise le matériau. ${F(`Rth = ${FRAC("e","λ·S")}`)} dépend aussi de l'épaisseur et de la surface, et le flux dépend en plus de l'écart de température.`};
  if(v===1){ const R=rnd([0.8,1.5,2,2.5,3.5,5]);
    return {q:`Un dissipateur a une résistance thermique de ${nf(R,1)} K/W. Que signifie cette valeur ?`,type:"ch",...mc(`Sa température dépasse celle de l'air de ${nf(R,1)} °C pour chaque watt qu'il évacue`,[`Il évacue ${nf(R,1)} W pour chaque degré d'écart avec l'air`,`Il ne peut pas évacuer plus de ${nf(R,1)} W`,`Sa température augmente de ${nf(R,1)} °C chaque seconde`]),
      expl:`${F("Td − Ta = Rda·Φ")} : chaque watt évacué élève la température du dissipateur de ${nf(R,1)} K, soit ${nf(R,1)} °C, au-dessus de celle de l'air. Plus Rda est petite, meilleur est le dissipateur.`}; }
  if(v===2) return {q:"Dans l'analogie entre thermique et électricité, à quoi correspond le flux thermique Φ ?",type:"ch",...mc("Au courant électrique I",["À la tension électrique U","À la résistance électrique R","À la charge électrique Q"]),
    expl:`${F(`Φ = ${FRAC("ΔT","Rth")}`)} a la même forme que la loi d'Ohm ${F(`I = ${FRAC("U","R")}`)} : l'écart de température joue le rôle de la tension, Rth celui de la résistance et le flux celui du courant. Des résistances en série s'additionnent dans les deux cas.`};
  return {q:"Pourquoi met-on de la pâte thermique entre un composant et son dissipateur ?",type:"ch",...mc("Elle remplace l'air des petites aspérités et diminue la résistance thermique de contact",["Elle augmente la résistance thermique pour protéger le composant","Elle colle le composant, sans effet sur les transferts thermiques","Elle stocke la chaleur pendant les pics de puissance"]),
    expl:`Deux surfaces métalliques ne se touchent qu'en quelques points : l'air emprisonné (λ ≈ 0,025 ${WMK}) isole. La pâte, bien plus conductrice que l'air, diminue ${F("Rbd")} et donc la température de la jonction.`}; },
/* mesurer la résistance thermique d'une enceinte chauffée de l'intérieur */
()=>{ const [nm,Ps,Rs]=rnd([["une glacière",[10,15,20],[1,1.2,1.5]],["un caisson isotherme de livraison",[30,40,50],[0.4,0.5,0.6,0.8]],["une armoire électrique fermée",[100,150,200],[0.1,0.15,0.2]]]);
  const P=rnd(Ps), R0=rnd(Rs), Te=rnd([22,24,25,26]), dT=Math.round(P*R0*10)/10, Ti=Te+dT, R=dT/P;
  return {ctx:`Pour mesurer la résistance thermique des parois d'${nm}, on place à l'intérieur une résistance chauffante qui dissipe P = ${P} W. En régime permanent, l'air intérieur est à ${nf(Ti,1)} °C et l'air extérieur à ${Te} °C.`,
    q:"Déduis-en la résistance thermique de ses parois.",type:"num",ans:R,tolR:0.02,unit:"K/W",
    expl:`En régime permanent, la température intérieure ne varie plus : toute la puissance dissipée traverse les parois, ${F("Φ = P")}. ${F(`Rth = ${FRAC("ΔT","Φ")}`)} = ${FRAC(`${nf(Ti,1)} − ${Te}`,P)} = ${FRAC(nf(dT,1),P)} = ${U(R,"K/W")}.`}; },
/* température d'un dissipateur */
()=>{ const o=draw(()=>({P:rnd([5,8,10,12,15,20,25]),Rda:rnd([1.2,1.5,2,2.5,3,4]),Ta:rnd([25,30,35,40])}),o=>o.Ta+o.P*o.Rda<=100), Td=o.Ta+o.P*o.Rda;
  return {fig:fx_th_dissip({P:`P = ${o.P} W`,T:{d:"Td = ?",a:`Ta = ${o.Ta} °C`}}),ctx:`Un transistor fixé sur un dissipateur dissipe P = ${o.P} W, entièrement évacués vers l'air ambiant à ${o.Ta} °C. Résistance thermique du dissipateur, de son embase à l'air : Rda = ${nf(o.Rda,1)} K/W.`,
    q:"Quelle température le dissipateur atteint-il en régime permanent ?",type:"num",ans:Td,tolR:0.02,unit:"°C",
    expl:`Tout le flux Φ = P traverse Rda : ${F("Td − Ta = Rda·P")}, donc Td = ${o.Ta} + ${nf(o.Rda,1)} × ${o.P} = ${U(Td,"°C")}.`}; },
/* profil de température : couche où la température chute le plus */
()=>{ const iso=rnd(["pse","lv","pu","lr"]), tpl=rnd([0,1,2]), Te=rnd([32,34,35,36]), Ti=rnd([22,24,26]);
  const lay=tpl===0?[["beton",rnd([0.15,0.2])],[iso,rnd([0.06,0.08,0.1])],["platre",0.013]]:tpl===1?[[iso,rnd([0.06,0.08,0.1])],["beton",rnd([0.15,0.2])],["platre",0.013]]:[["bois",0.022],[iso,rnd([0.08,0.1,0.12])],["platre",0.013]];
  const p=prof(lay,10,Te,Ti), ii=lay.findIndex(l=>l[0]===iso), dT=p.R.map(r=>p.Phi*r);
  return {fig:fx_th_paroi({c:couches(lay),T:p.Tv.map(t=>`${nf(t,1)} °C`),Tv:p.Tv,dir:1}),data:table(["Couche","Matériau","Épaisseur"],lay.map(([k,e],i)=>[String(i+1),cap1(MT[k].nm),fe(e)])),
    ctx:"Mur d'une maison climatisée, vu en coupe : la figure donne le profil de température mesuré dans son épaisseur, en régime permanent.",
    q:"Dans quelle couche la température chute-t-elle le plus ?",type:"ch",ch:["Couche 1","Couche 2","Couche 3"],ok:ii,
    expl:`Le même flux traverse les trois couches, en série : la chute de température dans chacune vaut ${F("ΔT = Φ·R")}. Elle est la plus grande dans la couche de plus grande résistance thermique, l'isolant (couche ${ii+1}, ${MT[iso].nm}) : chutes de ${dT.map(x=>nf(x,1)+" °C").join(" ; ")} sur ${Te-Ti} °C au total.`}; }
];

const TH2=[
/* glacière : résistance des parois, puis flux entrant */
()=>{ const k=rnd(["pse","pu","xps"]), e=rnd([2,3,4,5]), S=rnd([0.6,0.8,0.9,1,1.2]), Ti=rnd([2,3,4,5]), Te=rnd([28,29,30,31,32]), R=e/100/(MT[k].l*S), Phi=(Te-Ti)/R;
  const fig=fx_th_enceinte({k:"glaciere",ti:`${Ti} °C`,te:`air : ${Te} °C`,dir:-1,lab:"glacière"});
  const ctx=`Glacière de plage : parois en ${MT[k].nm} (λ = ${lam(k)} ${WMK}) de ${e} cm d'épaisseur, de surface totale S = ${nf(S,1)} m². Intérieur à ${Ti} °C, air extérieur à ${Te} °C. On ne tient compte que de la conduction dans les parois.`;
  return [{fig,ctx,q:"Calcule la résistance thermique des parois de la glacière.",type:"num",ans:R,tolR:0.02,unit:"K/W",
      expl:`e = ${e} cm = ${nf(e/100,2)} m. ${F(`Rth = ${FRAC("e","λ·S")}`)} = ${FRAC(nf(e/100,2),`${lam(k)} × ${nf(S,1)}`)} = ${U(R,"K/W")}.`},
    {fig,ctx,q:"Quel flux thermique entre dans la glacière ?",type:"num",ans:Phi,tolR:0.02,unit:"W",
      expl:`${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(`${Te} − ${Ti}`,nf(R,3))} = ${U(Phi,"W")}, de l'air extérieur vers l'intérieur de la glacière.`}]; },
/* mur multicouche : résistance totale, puis température à une interface */
()=>{ const iso=rnd(["pse","lv","pu","lr"]), S=rnd([10,12,15,20]), Te=rnd([33,34,35,36]), Ti=rnd([22,23,24,25]);
  const lay=[["beton",rnd([0.15,0.2])],[iso,rnd([0.06,0.08,0.1,0.12])],["platre",0.013]], p=prof(lay,S,Te,Ti), T1=p.Tv[1];
  const fig=fx_th_paroi({c:couches(lay),T:[`${Te} °C`,"T1 = ?",null,`${Ti} °C`],dir:1});
  const data=table(["Couche","Matériau","e","λ (W·m⁻¹·K⁻¹)"],lay.map(([k,e],i)=>[String(i+1),cap1(MT[k].nm),fe(e),lam(k)]));
  const ctx=`Mur de ${S} m² d'un local climatisé (conduction seule). Face extérieure, chauffée par le soleil : ${Te} °C ; face intérieure : ${Ti} °C.`;
  return [{fig,data,ctx,q:"Calcule la résistance thermique totale du mur.",type:"num",ans:p.Rt,tolR:0.02,unit:"K/W",
      expl:`Pour chaque couche, ${F(`R = ${FRAC("e","λ·S")}`)} : ${p.R.map(r=>nf(r,4)).join(" ; ")} K/W. Couches en série : ${F("Rth = R1 + R2 + R3")} = ${U(p.Rt,"K/W")}.`},
    {fig,data,ctx,q:"Calcule la température T1 à l'interface entre le béton et l'isolant.",type:"num",ans:T1,tolA:0.1,unit:"°C",
      expl:`Flux : ${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(`${Te} − ${Ti}`,nf(p.Rt,4))} = ${nf(p.Phi,1)} W. Dans le béton, la température chute de ${F("ΔT1 = Φ·R1")} = ${nf(p.Phi,1)} × ${nf(p.R[0],4)} = ${nf(Te-T1,2)} °C : T1 = ${Te} − ${nf(Te-T1,2)} = ${U(T1,"°C")}. Presque toute la chute de température se fait dans l'isolant.`}]; },
/* composant sans puis avec dissipateur */
()=>{ const c=rnd(COMP.slice(1,3)), o=draw(()=>({P:rnd([4,5,6,8,10,12,15]),Ta:rnd([30,35,40]),Rbd:rnd([0.3,0.5,0.8]),Rda:rnd([1.5,2,2.5,3,4,5])}),o=>{ const T0=o.Ta+o.P*c.Rja, T1=o.Ta+o.P*(c.Rjb+o.Rbd+o.Rda); return T0>c.Tjm*1.3&&T0<=c.Tjm*2.5&&T1<c.Tjm*0.9&&T1>55; });
  const T0=o.Ta+o.P*c.Rja, Rt=c.Rjb+o.Rbd+o.Rda, T1=o.Ta+o.P*Rt;
  const ctx=`Un ${c.nm} dissipe P = ${o.P} W ; air ambiant à ${o.Ta} °C. Fiche technique : Tj max = ${c.Tjm} °C ; sans dissipateur, Rth(j-a) = ${c.Rja} K/W ; jonction → boîtier : Rjb = ${nf(c.Rjb,1)} K/W.`;
  return [{ctx,q:"Sans dissipateur, quelle température de jonction le calcul prévoit-il ?",type:"num",ans:T0,tolR:0.02,unit:"°C",
      expl:`${F("Tj = Ta + P·Rth(j-a)")} = ${o.Ta} + ${o.P} × ${c.Rja} = ${U(T0,"°C")}, bien au-delà de Tj max = ${c.Tjm} °C : cette température ne serait jamais atteinte, le composant serait détruit avant.`},
    {fig:fx_th_dissip({P:`P = ${o.P} W`,sch:true,R:{jb:`${nf(c.Rjb,1)} K/W`,bd:`${nf(o.Rbd,1)} K/W`,da:`${nf(o.Rda,1)} K/W`}}),ctx:ctx+` On le fixe sur un dissipateur (Rda = ${nf(o.Rda,1)} K/W) avec de la pâte thermique (Rbd = ${nf(o.Rbd,1)} K/W).`,
      q:"Avec le dissipateur, quelle est la température de la jonction ?",type:"num",ans:T1,tolR:0.02,unit:"°C",
      expl:`Résistances en série : ${F("Rth = Rjb + Rbd + Rda")} = ${nf(c.Rjb,1)} + ${nf(o.Rbd,1)} + ${nf(o.Rda,1)} = ${nf(Rt,1)} K/W. ${F("Tj = Ta + P·Rth")} = ${o.Ta} + ${o.P} × ${nf(Rt,1)} = ${U(T1,"°C")} < ${c.Tjm} °C.`}]; },
/* plafond d'un fare : flux, puis énergie sur une année */
()=>{ const Tc=rnd([40,45,50]), Ti=rnd([24,25,26]), R=rnd([0.02,0.025,0.03,0.04,0.05]), h=rnd([6,8,10]), j=rnd([200,250,300]), Phi=(Tc-Ti)/R, E=Phi*h*j/1000;
  const ctx=`Dans un fare climatisé, le plafond sépare les combles, où l'air atteint ${Tc} °C en journée sous la tôle, de la pièce maintenue à ${Ti} °C. Résistance thermique du plafond : Rth = ${nf(R,3)} K/W.`;
  return [{ctx,q:"Quel flux thermique traverse le plafond en journée ?",type:"num",ans:Phi,tolR:0.02,unit:"W",
      expl:`${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(`${Tc} − ${Ti}`,nf(R,3))} = ${U(Phi,"W")}, des combles vers la pièce : le climatiseur doit l'extraire.`},
    {ctx,q:`Ces conditions durent ${h} h par jour, ${j} jours par an. Quelle énergie thermique entre ainsi par le plafond en un an, en kWh ?`,type:"num",ans:E,tolR:0.02,unit:"kWh",
      expl:`Durée : ${h} × ${j} = ${nf(h*j,0)} h. ${F("E = Φ·Δt")} = ${nf(Phi,1)} W × ${nf(h*j,0)} h = ${nf(Phi*h*j,0)} Wh, soit ${U(E,"kWh")}.`}]; },
/* épaisseur équivalente de deux matériaux */
()=>{ const [a,b]=rnd([["lv","pu"],["pse","pu"],["lr","xps"],["lv","beton"],["pse","bois"],["coco","pu"],["pu","beton"]]), eA=rnd([4,5,6,8,10,12,15,20]), eB=eA*MT[b].l/MT[a].l, big=eB>=100;
  return {ctx:`Une paroi est isolée par ${eA} cm de ${MT[a].nm} (λA = ${lam(a)} ${WMK}). On cherche l'épaisseur d'une paroi en ${MT[b].nm} (λB = ${lam(b)} ${WMK}) de même surface et de même résistance thermique.`,
    q:`Quelle épaisseur de ${MT[b].nm} faut-il, en ${big?"m":"cm"} ?`,type:"num",ans:big?eB/100:eB,tolR:0.02,unit:big?"m":"cm",
    expl:`Même résistance et même surface : ${F(`${FRAC("eA","λA·S")} = ${FRAC("eB","λB·S")}`)}, donc ${F(`eB = eA·${FRAC("λB","λA")}`)} = ${eA} × ${FRAC(lam(b),lam(a))} = ${big?`${nf(eB,0)} cm, soit ${U(eB/100,"m")}`:U(eB,"cm")}. ${MT[b].l>MT[a].l?"Un matériau plus conducteur doit être bien plus épais pour isoler autant.":"Un meilleur isolant permet une paroi plus fine."}`}; },
/* local technique climatisé (puissance frigorifique) ou refuge chauffé (puissance de chauffage) : flux par les parois, puis bilan avec les apports internes */
()=>{ if(Math.random()<0.4){ const Ti=rnd([18,19,20]), Te=rnd([-10,-8,-5,-2]), Rm=rnd([0.015,0.02,0.025,0.03]), Rt=rnd([0.02,0.025,0.03,0.04]), Rv=rnd([0.04,0.05,0.06,0.08]), Pi=rnd([300,400,500,600,800]);
    const dT=Ti-Te, Fm=dT/Rm, Ft=dT/Rt, Fv=dT/Rv, Ft0=Fm+Ft+Fv, Pc=Ft0-Pi;
    const data=table(["Paroi","Rth (K/W)"],[["Murs",nf(Rm,3)],["Toiture",nf(Rt,3)],["Vitrages",nf(Rv,3)]]);
    const fig=fx_th_enceinte({k:"refuge",ti:`${Ti} °C`,te:`air : ${tC(Te,0)} °C`,dir:1,src:`apports : ${nf(Pi,0)} W`,lab:"refuge chauffé"});
    const ctx=`Refuge de montagne chauffé à ${Ti} °C ; air extérieur à ${tC(Te,0)} °C. Les occupants, l'éclairage et la cuisson dégagent en tout ${nf(Pi,0)} W dans le refuge (apports internes).`;
    return [{fig,data,ctx,q:"Calcule le flux thermique total perdu par les parois.",type:"num",ans:Ft0,tolR:0.02,unit:"W",
        expl:`Les parois sont des chemins distincts soumis au même écart ΔT = ${Ti} − ${tP(Te)} = ${dT} K : les flux s'additionnent, chacun donné par ${F(`Φ = ${FRAC("ΔT","Rth")}`)}. Murs : ${FRAC(dT,nf(Rm,3))} = ${nf(Fm,0)} W ; toiture : ${FRAC(dT,nf(Rt,3))} = ${nf(Ft,0)} W ; vitrages : ${FRAC(dT,nf(Rv,3))} = ${nf(Fv,0)} W. Total : ${U(Ft0,"W")}, de l'intérieur vers l'extérieur.`},
      {fig,data,ctx,q:"Quelle puissance de chauffage minimale faut-il pour maintenir le refuge à cette température, en kW ?",type:"num",ans:Pc/1000,tolR:0.02,unit:"kW",
        expl:`En régime permanent, la température reste constante : le chauffage et les apports internes compensent ensemble les pertes. ${F("P_chauf = Φ_parois − P_internes")} = ${nf(Ft0,0)} − ${nf(Pi,0)} = ${nf(Pc,0)} W, soit ${U(Pc/1000,"kW")}. Ici les apports internes aident le chauffage ; dans un local climatisé, ils s'ajoutent au contraire à la chaleur à extraire.`}]; }
  const Ti=rnd([22,24]), Te=rnd([30,32,34]), Tt=rnd([45,50,55]), Rm=rnd([0.012,0.015,0.02,0.025]), Rt=rnd([0.01,0.015,0.02,0.03]), Rv=rnd([0.03,0.04,0.05,0.08]), Pi=rnd([800,1200,1500,2000,2500]);
  const Fm=(Te-Ti)/Rm, Ft=(Tt-Ti)/Rt, Fv=(Te-Ti)/Rv, Ft0=Fm+Ft+Fv, Pf=Ft0+Pi;
  const data=table(["Paroi","Rth (K/W)","Température côté extérieur"],[["Murs",nf(Rm,3),`${Te} °C`],["Toiture",nf(Rt,3),`${Tt} °C (sous la tôle, au soleil)`],["Vitrages",nf(Rv,3),`${Te} °C`]]);
  const fig=fx_th_enceinte({k:"local",ti:`${Ti} °C`,te:`air : ${Te} °C`,dir:-1,src:`équipements : ${nf(Pi,0)} W`,lab:"local technique"});
  const ctx=`Local technique climatisé à ${Ti} °C. Ses équipements (serveurs, onduleur, éclairage) dissipent en tout ${nf(Pi,0)} W.`;
  return [{fig,data,ctx,q:"Calcule le flux thermique total qui entre par les parois.",type:"num",ans:Ft0,tolR:0.02,unit:"W",
      expl:`Chaque paroi est un chemin distinct pour la chaleur : les flux s'additionnent, chacun donné par ${F(`Φ = ${FRAC("ΔT","Rth")}`)}. Murs : ${FRAC(Te-Ti,nf(Rm,3))} = ${nf(Fm,0)} W ; toiture : ${FRAC(Tt-Ti,nf(Rt,3))} = ${nf(Ft,0)} W ; vitrages : ${FRAC(Te-Ti,nf(Rv,3))} = ${nf(Fv,0)} W. Total : ${U(Ft0,"W")}.`},
    {fig,data,ctx,q:"Quelle puissance frigorifique minimale le climatiseur doit-il fournir, en kW ?",type:"num",ans:Pf/1000,tolR:0.02,unit:"kW",
      expl:`En régime permanent, la température du local reste constante : le climatiseur doit extraire tout ce qui entre et tout ce qui est produit dans le local. ${F("P_froid = Φ_parois + P_internes")} = ${nf(Ft0,0)} + ${nf(Pi,0)} = ${nf(Pf,0)} W, soit ${U(Pf/1000,"kW")}.`}]; },
/* glacière : flux entrant, puis durée de la glace */
()=>{ const R=rnd([0.8,1,1.2,1.4,1.6,2]), Te=rnd([26,28,30,32]), mg=rnd([1,2,3,4]), Eg=334*mg, Phi=Te/R, t=Eg*1000/Phi/3600;
  const ctx=`Une glacière (résistance thermique des parois : Rth = ${nf(R,1)} K/W) contient des pains de glace qui maintiennent l'intérieur à 0 °C tant qu'ils fondent. Air extérieur : ${Te} °C. En fondant complètement, les pains de glace absorbent ${nf(Eg,0)} kJ.`;
  return [{ctx,q:"Quel flux thermique entre dans la glacière tant que la glace fond ?",type:"num",ans:Phi,tolR:0.02,unit:"W",
      expl:`${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(`${Te} − 0`,nf(R,1))} = ${U(Phi,"W")}.`},
    {ctx,q:"Pendant combien de temps la glace maintient-elle l'intérieur à 0 °C, en heures ?",type:"num",ans:t,tolR:0.02,unit:"h",
      expl:`Toute l'énergie qui entre sert à faire fondre la glace : ${F(`Δt = ${FRAC("E","Φ")}`)} = ${FRAC(`${nf(Eg*1000,0)} J`,`${nf(Phi,2)} W`)} = ${nf(Eg*1000/Phi,0)} s, soit ${U(t,"h")}.`}]; },
/* boîtier étanche : conduction et convection en série, puis température intérieure */
()=>{ const o=draw(()=>({e:rnd([3,4,5]),S:rnd([0.12,0.16,0.2,0.24,0.3]),h:rnd([6,8,10]),P:rnd([8,10,12,15,18,20]),Ta:rnd([28,30,32,35])}),o=>{ const R=o.e/1000/(0.2*o.S)+1/(o.h*o.S); return o.Ta+o.P*R<=75; });
  const Rc=o.e/1000/(0.2*o.S), Rv=1/(o.h*o.S), R=Rc+Rv, Ti=o.Ta+o.P*R;
  const fig=fx_th_enceinte({k:"boitier",ti:"Ti = ?",te:`air : ${o.Ta} °C`,dir:1,src:`carte : ${o.P} W`,lab:"boîtier étanche"});
  const ctx=`Un boîtier étanche en polycarbonate (λ = 0,20 ${WMK}, épaisseur e = ${o.e} mm, surface d'échange S = ${nf(o.S,2)} m²) contient une carte électronique qui dissipe P = ${o.P} W. Entre sa face extérieure et l'air ambiant (${o.Ta} °C), l'échange par convection est modélisé par une résistance thermique ${FRAC("1","h·S")}, avec h = ${o.h} W·m⁻²·K⁻¹. On néglige l'échange côté intérieur.`;
  return [{fig,ctx,q:"Calcule la résistance thermique totale entre l'intérieur du boîtier et l'air ambiant.",type:"num",ans:R,tolR:0.02,unit:"K/W",
      expl:`Conduction dans la paroi : ${F(`Rcond = ${FRAC("e","λ·S")}`)} = ${FRAC(nf(o.e/1000,3),`0,2 × ${nf(o.S,2)}`)} = ${nf(Rc,4)} K/W. Convection : ${F(`Rconv = ${FRAC("1","h·S")}`)} = ${FRAC("1",`${o.h} × ${nf(o.S,2)}`)} = ${nf(Rv,4)} K/W. En série : ${U(R,"K/W")}. La paroi pèse peu : c'est la convection qui limite l'évacuation de la chaleur.`},
    {fig,ctx,q:"Quelle température l'air intérieur du boîtier atteint-il en régime permanent ?",type:"num",ans:Ti,tolR:0.02,unit:"°C",
      expl:`En régime permanent, toute la puissance de la carte traverse les parois : ${F("Ti = Ta + P·Rth")} = ${o.Ta} + ${o.P} × ${nf(R,3)} = ${U(Ti,"°C")}.`}]; },
/* profil de température mesuré : chute dans l'isolant, puis flux */
()=>{ const iso=rnd(["pse","lv","pu","lr"]), S=rnd([8,10,12,15]), Te=rnd([32,34,35,36]), Ti=rnd([22,24,25]), ei=rnd([0.05,0.06,0.08,0.1]);
  const lay=[["beton",rnd([0.15,0.2])],[iso,ei],["platre",0.013]], p=prof(lay,S,Te,Ti), Td=p.Tv.map(t=>Math.round(t*10)/10), dTi=Math.round((Td[1]-Td[2])*10)/10, R2=ei/(MT[iso].l*S), Phi=dTi/R2;
  const fig=fx_th_paroi({c:couches(lay),T:Td.map(t=>`${nf(t,1)} °C`),Tv:Td,dir:1});
  const ctx=`Mur de ${S} m² d'une maison climatisée : béton, isolant, plâtre. Des capteurs mesurent la température aux frontières des couches (figure). La couche 2 est en ${MT[iso].nm} (λ = ${lam(iso)} ${WMK}), d'épaisseur ${fe(ei)}.`;
  return [{fig,ctx,q:"Lis sur la figure la chute de température dans l'isolant (couche 2).",type:"num",ans:dTi,tolR:0.02,unit:"°C",
      expl:`L'isolant va de ${nf(Td[1],1)} °C à ${nf(Td[2],1)} °C : ${F("ΔT2")} = ${nf(Td[1],1)} − ${nf(Td[2],1)} = ${U(dTi,"°C")} (même valeur en K).`},
    {fig,ctx,q:"Déduis-en le flux thermique qui traverse le mur.",type:"num",ans:Phi,tolR:0.02,unit:"W",
      expl:`${F(`R2 = ${FRAC("e","λ·S")}`)} = ${FRAC(nf(ei,2),`${lam(iso)} × ${S}`)} = ${nf(R2,4)} K/W. Le même flux traverse toutes les couches : ${F(`Φ = ${FRAC("ΔT2","R2")}`)} = ${FRAC(nf(dTi,1),nf(R2,4))} = ${U(Phi,"W")}.`}]; },
/* comparer deux isolants : baisse du flux en % */
()=>{ const [a,b]=rnd([["pse","pu"],["lv","pu"],["lr","xps"],["pse","xps"],["coco","pu"],["lr","pu"],["coco","pse"]]), e=rnd([6,8,10,12]), r=MT[b].l/MT[a].l, p=(1-r)*100;
  return {ctx:`Les parois d'une chambre froide sont isolées par ${e} cm de ${MT[a].nm} (λA = ${lam(a)} ${WMK}). On envisage de les isoler avec la même épaisseur de ${MT[b].nm} (λB = ${lam(b)} ${WMK}). Les températures ne changent pas.`,
    q:"De quel pourcentage le flux thermique à travers les parois diminuerait-il, par rapport au flux actuel ?",type:"num",ans:p,tolR:0.02,unit:"%",
    expl:`À e, S et ΔT identiques, ${F(`Φ = ${FRAC("ΔT·λ·S","e")}`)} est proportionnel à λ : ${F(`${FRAC("ΦB","ΦA")} = ${FRAC("λB","λA")}`)} = ${FRAC(lam(b),lam(a))} = ${nf(r,3)}. Le flux diminue de (1 − ${nf(r,3)}) × 100 = ${U(p,"%")}.`}; },
/* résistance thermique maximale du dissipateur */
()=>{ const c=rnd(COMP.slice(1)), o=draw(()=>({P:rnd([8,10,12,15,20,25,30]),Ta:rnd([35,40,45,50]),Rbd:rnd([0.2,0.3,0.4,0.5])}),o=>{ const R=(c.Tjm-o.Ta)/o.P-c.Rjb-o.Rbd; return R>=0.5&&R<=8; });
  const Rt=(c.Tjm-o.Ta)/o.P, R=Rt-c.Rjb-o.Rbd;
  return {fig:fx_th_dissip({P:`P = ${o.P} W`,sch:true,R:{jb:`${nf(c.Rjb,1)} K/W`,bd:`${nf(o.Rbd,1)} K/W`,da:"?"},T:{j:`Tj max = ${c.Tjm} °C`,a:`Ta = ${o.Ta} °C`}}),
    ctx:`Un ${c.nm} dissipe P = ${o.P} W dans une armoire où l'air est à ${o.Ta} °C. Sa jonction ne doit pas dépasser Tj max = ${c.Tjm} °C. Résistances thermiques : jonction → boîtier Rjb = ${nf(c.Rjb,1)} K/W ; boîtier → dissipateur (pâte thermique) Rbd = ${nf(o.Rbd,1)} K/W.`,
    q:"Quelle résistance thermique maximale le dissipateur doit-il avoir ?",type:"num",ans:R,tolR:0.02,unit:"K/W",
    expl:`Il faut ${F("Ta + P·(Rjb + Rbd + Rda) ≤ Tj max")} : la résistance totale ne doit pas dépasser ${FRAC(`${c.Tjm} − ${o.Ta}`,o.P)} = ${nf(Rt,3)} K/W. ${F("Rda ≤ Rtot − Rjb − Rbd")} = ${nf(Rt,3)} − ${nf(c.Rjb,1)} − ${nf(o.Rbd,1)} = ${U(R,"K/W")}. On choisira un dissipateur de résistance inférieure ou égale.`}; },
/* énergie entrant sur 24 h avec deux périodes */
()=>{ const Ti=rnd([22,24]), Tj=rnd([31,32,33,34]), Tn=rnd([25,26,27]), hj=rnd([10,12,14]), R=rnd([0.01,0.012,0.015,0.02]), Ej=(Tj-Ti)/R*hj, En=(Tn-Ti)/R*(24-hj), E=(Ej+En)/1000;
  return {ctx:`Un local technique est maintenu à ${Ti} °C. Résistance thermique globale de ses parois : Rth = ${nf(R,3)} K/W. Le jour (${hj} h), l'air extérieur est à ${Tj} °C ; la nuit (${24-hj} h), à ${Tn} °C.`,
    q:"Quelle énergie thermique entre dans le local en 24 h, en kWh ?",type:"num",ans:E,tolR:0.02,unit:"kWh",
    expl:`Jour : ${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(Tj-Ti,nf(R,3))} = ${nf((Tj-Ti)/R,1)} W pendant ${hj} h, soit ${nf(Ej,0)} Wh. Nuit : ${FRAC(Tn-Ti,nf(R,3))} = ${nf((Tn-Ti)/R,1)} W pendant ${24-hj} h, soit ${nf(En,0)} Wh. ${F("E = Φj·tj + Φn·tn")} = ${nf(Ej+En,0)} Wh, soit ${U(E,"kWh")}.`}; }
];

const TH3=[
/* choisir la longueur d'un dissipateur sur la courbe du constructeur */
()=>{ const LS=[25,50,75,100,150,200], k=rnd([0.8,1,1.2,1.5,2]), Rf=L=>k*Math.pow(L/100,-0.6);
  const o=draw(()=>({P:rnd([10,12,15,20,25,30,40]),Tjm:rnd([125,150,175]),Ta:rnd([35,40,45,50]),Rjb:rnd([0.5,0.8,1,1.5]),Rbd:rnd([0.2,0.3,0.5])}),o=>{ const R=(o.Tjm-o.Ta)/o.P-o.Rjb-o.Rbd, i=LS.findIndex(L=>Rf(L)<=R); return i>=1&&i<=LS.length-3&&LS.every(L=>far(Rf(L),R,0.1)); });
  const Rm=(o.Tjm-o.Ta)/o.P-o.Rjb-o.Rbd, i=LS.findIndex(L=>Rf(L)<=Rm), Lc=LS[i], ym=Math.ceil(Rf(20)*2)/2, big=ym>3;
  const fig=fx_th_courbe({f:Rf,x0:20,xm:200,xg:12.5,xl:25,ym,yg:big?0.25:0.1,yl:big?1:0.5});
  const ctx=`Un transistor dissipe P = ${o.P} W ; sa jonction ne doit pas dépasser ${o.Tjm} °C. Air ambiant : ${o.Ta} °C. Résistances thermiques : jonction → boîtier Rjb = ${nf(o.Rjb,1)} K/W ; boîtier → dissipateur (pâte) Rbd = ${nf(o.Rbd,1)} K/W. Le dissipateur est un morceau de profilé à ailettes : la courbe du constructeur donne sa résistance thermique Rda selon la longueur L du morceau.`;
  return [{fig,ctx,q:"Quelle résistance thermique maximale le dissipateur peut-il avoir ?",type:"num",ans:Rm,tolR:0.02,unit:"K/W",
      expl:`Il faut ${F("Ta + P·(Rjb + Rbd + Rda) ≤ Tj max")}, donc ${F(`Rda ≤ ${FRAC("Tj max − Ta","P")} − Rjb − Rbd`)} = ${FRAC(`${o.Tjm} − ${o.Ta}`,o.P)} − ${nf(o.Rjb,1)} − ${nf(o.Rbd,1)} = ${U(Rm,"K/W")}.`},
    {fig,ctx,q:`Longueurs vendues : ${LS.join(" · ")} mm. Quelle est la plus petite longueur qui convient ?`,type:"ch",...mc(`${Lc} mm`,[LS[i-1],LS[i+1],LS[i+2]].map(x=>`${x} mm`)),
      expl:`On lit sur la courbe : ${[LS[i-1],Lc,LS[i+1]].map(L=>`L = ${L} mm → Rda ≈ ${nf(Rf(L),2)} K/W`).join(" ; ")}. Il faut Rda ≤ ${nf(Rm,2)} K/W : la plus petite longueur qui convient est ${F(Lc+" mm")}. Plus le profilé est long, plus sa surface d'échange est grande et sa résistance petite, mais le gain diminue avec la longueur.`}]; },
/* salle des serveurs : résistance des murs, puissance frigorifique, choix du climatiseur */
()=>{ const CAT=[2.5,3.5,5,7.1,10,12.5];
  const o=draw(()=>({S:rnd([40,60,80,100]),iso:rnd(["pse","lv"]),ei:rnd([0.04,0.06,0.08,0.1]),Te:rnd([30,32,34]),Ti:rnd([22,24]),Rt:rnd([0.01,0.015,0.02,0.03]),Tt:rnd([45,50,55]),Pi:rnd([1500,2000,2500,3000,4000,5000,6000])}),o=>{ const Rm=0.2/(1.75*o.S)+o.ei/(MT[o.iso].l*o.S), P=((o.Te-o.Ti)/Rm+(o.Tt-o.Ti)/o.Rt+o.Pi)/1000, j=CAT.findIndex(c=>c>=P); return j>=1&&j<=CAT.length-2&&CAT.every(c=>far(c,P,0.06)); });
  const Rb=0.2/(1.75*o.S), Ri=o.ei/(MT[o.iso].l*o.S), Rm=Rb+Ri, Fm=(o.Te-o.Ti)/Rm, Ft=(o.Tt-o.Ti)/o.Rt, P=(Fm+Ft+o.Pi)/1000, j=CAT.findIndex(c=>c>=P), okc=CAT[j], opts=[CAT[j-1],CAT[j+1],CAT[j+2]].filter(x=>x!=null);
  const fig=fx_th_enceinte({k:"local",ti:`${o.Ti} °C`,te:`air : ${o.Te} °C`,dir:-1,src:`serveurs : ${nf(o.Pi/1000,1)} kW`,lab:"salle des serveurs"});
  const ctx=`Salle des serveurs climatisée à ${o.Ti} °C ; air extérieur à ${o.Te} °C. Murs : ${o.S} m² de béton (20 cm, λ = 1,75 ${WMK}) doublé de ${fe(o.ei)} de ${MT[o.iso].nm} (λ = ${lam(o.iso)} ${WMK}). Toiture : Rth = ${nf(o.Rt,3)} K/W, avec ${o.Tt} °C sous la tôle au soleil. Les serveurs dissipent ${nf(o.Pi,0)} W.`;
  return [{fig,ctx,q:"Calcule la résistance thermique des murs (béton et isolant).",type:"num",ans:Rm,tolR:0.02,unit:"K/W",
      expl:`Béton : ${FRAC("0,2",`1,75 × ${o.S}`)} = ${nf(Rb,5)} K/W ; isolant : ${FRAC(nf(o.ei,2),`${lam(o.iso)} × ${o.S}`)} = ${nf(Ri,5)} K/W. En série : ${F("Rmurs = R1 + R2")} = ${U(Rm,"K/W")}.`},
    {fig,ctx,q:"Quelle puissance frigorifique faut-il au minimum, en kW, pour compenser les murs, la toiture et les serveurs ?",type:"num",ans:P,tolR:0.02,unit:"kW",
      expl:`Murs : ${FRAC(o.Te-o.Ti,nf(Rm,4))} = ${nf(Fm,0)} W ; toiture : ${FRAC(o.Tt-o.Ti,nf(o.Rt,3))} = ${nf(Ft,0)} W ; serveurs : ${nf(o.Pi,0)} W. ${F("P_froid = Φmurs + Φtoit + Pserveurs")} = ${nf(P*1000,0)} W, soit ${U(P,"kW")}. ${o.Pi>=1.5*(Fm+Ft)?"Ici, les serveurs pèsent bien plus que les parois.":o.Pi<=(Fm+Ft)/1.5?`Ici, les parois (surtout ${Ft>=Fm?"la toiture":"les murs"}) pèsent plus que les serveurs.`:"Ici, parois et serveurs pèsent du même ordre."}`},
    {fig,ctx,q:`Climatiseurs disponibles (puissance frigorifique) : ${CAT.map(c=>nf(c,1)).join(" · ")} kW. Choisis le modèle le moins puissant qui suffit.`,type:"ch",...mc(`${nf(okc,1)} kW`,opts.map(c=>`${nf(c,1)} kW`)),
      expl:`Il faut au moins ${nf(P,2)} kW : le plus petit modèle qui convient est ${F(nf(okc,1)+" kW")}. Avec ${nf(CAT[j-1],1)} kW, la salle se réchaufferait ; un modèle plus puissant suffirait aussi, mais coûterait plus cher et tournerait par cycles courts.`}]; },
/* glacière pour 24 h : flux admissible, épaisseur minimale, épaisseur retenue */
()=>{ const TH=[2,3,4,5,6,8,10];
  const o=draw(()=>({mg:rnd([2,3,4,5,6]),S:rnd([0.6,0.8,1,1.2]),Te:rnd([28,30,32]),k:rnd(["pse","pu","xps"])}),o=>{ const Pm=334*o.mg*1000/86400, e=MT[o.k].l*o.S*o.Te/Pm*100, i=TH.findIndex(t=>t>=e); return i>=1&&i<=TH.length-2&&TH.every(t=>far(t,e,0.06)); });
  const Eg=334*o.mg, Pm=Eg*1000/86400, Rmin=o.Te/Pm, e=MT[o.k].l*o.S*o.Te/Pm*100, i=TH.findIndex(t=>t>=e), ec=TH[i], opts=[TH[i-1],TH[i+1],TH[i+2]].filter(x=>x!=null);
  const ctx=`Glacière pour une journée de pêche : ${o.mg} kg de glace, qui absorbent ${nf(Eg,0)} kJ en fondant, doivent maintenir l'intérieur à 0 °C pendant au moins 24 h. Air extérieur : ${o.Te} °C. Parois en ${MT[o.k].nm} (λ = ${lam(o.k)} ${WMK}), de surface totale S = ${nf(o.S,1)} m².`;
  return [{ctx,q:"Pour que la glace tienne 24 h, quel flux thermique peut entrer au maximum ?",type:"num",ans:Pm,tolR:0.02,unit:"W",
      expl:`La glace doit absorber tout ce qui entre pendant 24 h = 86 400 s : ${F(`Φmax = ${FRAC("E","Δt")}`)} = ${FRAC(`${nf(Eg*1000,0)} J`,"86 400 s")} = ${U(Pm,"W")}.`},
    {ctx,q:"Quelle épaisseur minimale d'isolant faut-il, en cm ?",type:"num",ans:e,tolR:0.02,unit:"cm",
      expl:`${F(`Rth ≥ ${FRAC("ΔT","Φmax")}`)} = ${FRAC(o.Te,nf(Pm,2))} = ${nf(Rmin,3)} K/W, puis ${F("e = Rth·λ·S")} = ${nf(Rmin,3)} × ${lam(o.k)} × ${nf(o.S,1)} = ${nf(e/100,4)} m, soit ${U(e,"cm")}.`},
    {ctx,q:`Épaisseurs de parois proposées : ${TH.join(" · ")} cm. Laquelle choisir pour tenir 24 h avec la glacière la plus légère possible ?`,type:"ch",...mc(`${ec} cm`,opts.map(t=>`${t} cm`)),
      expl:`Il faut e ≥ ${nf(e,2)} cm : la plus petite épaisseur qui convient est ${F(ec+" cm")}. Avec ${TH[i-1]} cm, la glace aurait fondu avant 24 h ; plus épais, la glacière serait plus lourde et plus encombrante.`}]; },
/* chambre froide : résistance minimale, puis isolants compatibles avec l'encombrement */
()=>{ const IS=["pu","xps","lr"], CH=["Seulement la mousse de polyuréthane","La mousse de polyuréthane et le polystyrène extrudé","Les trois isolants","Aucun des trois isolants"], tgt=rnd([0,1,2,3]);
  const o=draw(()=>({S:rnd([40,60,80,100]),Ti:rnd([-25,-20,-18]),Te:rnd([25,28,30]),Pm:rnd([600,800,1000,1200,1500]),em:rnd([8,10,12,15])}),o=>{ const Rm=(o.Te-o.Ti)/o.Pm, es=IS.map(k=>Rm*MT[k].l*o.S*100); if(!es.every(x=>far(x,o.em,0.05))) return false; const n=es.filter(x=>x<=o.em).length; return (n===0?3:n-1)===tgt; });
  const dT=o.Te-o.Ti, Rm=dT/o.Pm, es=IS.map(k=>Rm*MT[k].l*o.S*100), fin=["seule la mousse de polyuréthane convient.","la mousse de polyuréthane et le polystyrène extrudé conviennent.","les trois isolants conviennent.","aucun des trois ne convient : il faut un groupe frigorifique plus puissant ou accepter des parois plus épaisses."][tgt];
  const ctx=`Chambre froide à ${tC(o.Ti,0)} °C installée dans un local à ${o.Te} °C ; ${o.S} m² de parois. Le groupe frigorifique peut compenser au plus ${nf(o.Pm,0)} W entrant par les parois. Isolants envisagés : mousse de polyuréthane (λ = 0,025), polystyrène extrudé (λ = 0,030), laine de roche (λ = 0,040), en ${WMK}.`;
  return [{ctx,q:"Quelle résistance thermique minimale les parois doivent-elles avoir ?",type:"num",ans:Rm,tolR:0.02,unit:"K/W",
      expl:`Il faut ${F(`${FRAC("ΔT","Rth")} ≤ Φmax`)}, donc ${F(`Rth ≥ ${FRAC("ΔT","Φmax")}`)} = ${FRAC(`${o.Te} − ${tP(o.Ti)}`,nf(o.Pm,0))} = ${FRAC(dT,nf(o.Pm,0))} = ${U(Rm,"K/W")}.`},
    {ctx,q:`L'épaisseur des panneaux est limitée à ${o.em} cm (encombrement). Quels isolants permettent de respecter les deux exigences ?`,type:"ch",ch:CH,ok:tgt,
      expl:`Épaisseur nécessaire : ${F("e = Rth·λ·S")}, soit ${IS.map((k,i)=>`${MT[k].nm} : ${nf(es[i],1)} cm`).join(" ; ")}. Comparées à ${o.em} cm : ${fin}`}]; },
/* fare : isolation du plafond, flux avant et après, électricité économisée */
()=>{ const Tt=rnd([50,55,60]), Ti=rnd([25,26]), R0=rnd([0.008,0.01,0.012,0.015]), S=rnd([40,50,60,80]), k=rnd(["lv","coco","lr"]), e=rnd([0.08,0.1,0.12,0.15]), h=rnd([5,6,7,8]), j=rnd([250,300,365]), r=rnd([2.5,3,3.5]);
  const Ri=e/(MT[k].l*S), R1=R0+Ri, dT=Tt-Ti, F0=dT/R0, F1=dT/R1, Et=(F0-F1)*h*j/1000, Ee=Et/r;
  const ctx=`Fare climatisé à ${Ti} °C : en journée, la tôle du toit atteint ${Tt} °C. Sans isolant, la résistance thermique entre la tôle et la pièce (combles et faux plafond de ${S} m²) vaut R0 = ${nf(R0,3)} K/W. On pose sur le faux plafond ${fe(e)} de ${MT[k].nm} (λ = ${lam(k)} ${WMK}).`;
  return [{ctx,q:"Quel flux thermique traverse le plafond sans isolant ?",type:"num",ans:F0,tolR:0.02,unit:"W",
      expl:`${F(`Φ0 = ${FRAC("ΔT","R0")}`)} = ${FRAC(`${Tt} − ${Ti}`,nf(R0,3))} = ${U(F0,"W")}.`},
    {ctx,q:"Quel flux thermique traverse le plafond après la pose de l'isolant ?",type:"num",ans:F1,tolR:0.02,unit:"W",
      expl:`Isolant : ${F(`Ri = ${FRAC("e","λ·S")}`)} = ${FRAC(nf(e,2),`${lam(k)} × ${S}`)} = ${nf(Ri,4)} K/W, en série avec R0 : R = ${nf(R1,4)} K/W. ${F(`Φ1 = ${FRAC("ΔT","R")}`)} = ${FRAC(dT,nf(R1,4))} = ${U(F1,"W")}, soit ${nf(F0/F1,1)} fois moins.`},
    {ctx,q:`Le climatiseur consomme 1 kWh d'électricité pour extraire ${nf(r,1)} kWh de chaleur. Ces conditions durent ${h} h par jour, ${j} jours par an. Quelle énergie électrique l'isolation fait-elle économiser en un an, en kWh ?`,type:"num",ans:Ee,tolR:0.02,unit:"kWh",
      expl:`Flux évité : ${nf(F0,0)} − ${nf(F1,0)} = ${nf(F0-F1,0)} W. Chaleur qui n'entre plus en un an : ${F("E = ΔΦ·Δt")} = ${nf(F0-F1,0)} W × ${nf(h*j,0)} h = ${nf(Et,0)} kWh. Électricité économisée : ${FRAC(nf(Et,0),nf(r,1))} = ${U(Ee,"kWh")}.`}]; },
/* deux composants sur le même dissipateur */
()=>{ const CH=["Oui, les deux","Non : seul T1 dépasse sa Tj max","Non : seul T2 dépasse sa Tj max","Non : les deux dépassent leur Tj max"], tgt=rnd([0,1,2,3]);
  const o=draw(()=>({P1:rnd([10,15,20,25,30]),P2:rnd([5,8,10,12,15]),R1:rnd([0.5,0.8,1,1.2]),R2:rnd([1.5,2,2.5,3]),Rbd:rnd([0.3,0.5]),Rda:rnd([0.8,1,1.2,1.5,2]),Ta:rnd([35,40,45]),T1m:rnd([125,150,175]),T2m:rnd([125,150])}),o=>{ const Td=o.Ta+(o.P1+o.P2)*o.Rda, T1=Td+o.P1*(o.R1+o.Rbd), T2=Td+o.P2*(o.R2+o.Rbd);
      if(Math.abs(T1-o.T1m)<6||Math.abs(T2-o.T2m)<6||T1>230||T2>230) return false; const a=T1>o.T1m, b=T2>o.T2m; return (a&&b?3:a?1:b?2:0)===tgt; });
  const Td=o.Ta+(o.P1+o.P2)*o.Rda, T1=Td+o.P1*(o.R1+o.Rbd), T2=Td+o.P2*(o.R2+o.Rbd), a=T1>o.T1m, b=T2>o.T2m;
  const data=table(["Transistor","P (W)","Rjb (K/W)","Tj max (°C)"],[["T1",String(o.P1),nf(o.R1,1),String(o.T1m)],["T2",String(o.P2),nf(o.R2,1),String(o.T2m)]]);
  const ctx=`Deux transistors T1 et T2 sont fixés sur le même dissipateur (Rda = ${nf(o.Rda,1)} K/W), chacun avec une pâte thermique (Rbd = ${nf(o.Rbd,1)} K/W). L'air de l'armoire est à ${o.Ta} °C.`;
  return [{data,ctx,q:"Calcule la température du dissipateur.",type:"num",ans:Td,tolR:0.02,unit:"°C",
      expl:`Le dissipateur évacue les deux puissances à la fois : ${F("Td = Ta + (P1 + P2)·Rda")} = ${o.Ta} + (${o.P1} + ${o.P2}) × ${nf(o.Rda,1)} = ${U(Td,"°C")}.`},
    {data,ctx,q:"Calcule la température de jonction du transistor T1.",type:"num",ans:T1,tolR:0.02,unit:"°C",
      expl:`Seule P1 traverse la jonction et la pâte de T1 : ${F("Tj1 = Td + P1·(Rjb1 + Rbd)")} = ${nf(Td,1)} + ${o.P1} × (${nf(o.R1,1)} + ${nf(o.Rbd,1)}) = ${U(T1,"°C")}.`},
    {data,ctx,q:"Les deux transistors respectent-ils leur température de jonction maximale ?",type:"ch",ch:CH,ok:tgt,
      expl:`Tj1 = ${nf(T1,1)} °C ${a?">":"≤"} ${o.T1m} °C ; Tj2 = ${nf(Td,1)} + ${o.P2} × (${nf(o.R2,1)} + ${nf(o.Rbd,1)}) = ${nf(T2,1)} °C ${b?">":"≤"} ${o.T2m} °C. ${CH[tgt]}. Piège : chaque transistor chauffe aussi le dissipateur de l'autre ; on ne peut pas les étudier séparément.`}]; },
/* repérer l'erreur dans une résolution */
()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
  if(v===0){ const e=rnd([30,40,50,60]), S=rnd([2,4,6]);
    ctx=`Résistance thermique d'une plaque de polystyrène expansé de ${e} mm (λ = 0,038 ${WMK}) et de ${S} m².`;
    st=[`Rth = ${FRAC("e","λ·S")}`,`Rth = ${FRAC(e,`0,038 × ${S}`)} = ${nf(e/(0.038*S),1)} K/W`,"Cette plaque isole donc très bien."]; bad=1;
    why=`L'épaisseur doit être en mètres : e = ${nf(e/1000,3)} m, d'où Rth = ${nf(e/1000/(0.038*S),3)} K/W, mille fois moins.`; }
  else if(v===1){ const S=rnd([10,12,15]);
    ctx=`Résistance thermique d'un mur de ${S} m² : 20 cm de béton (λ = 1,75) et 8 cm de laine de verre (λ = 0,035 ${WMK}).`;
    st=["λ = 1,75 + 0,035 = 1,785",`Rth = ${FRAC("0,28",`1,785 × ${S}`)} = ${nf(0.28/(1.785*S),4)} K/W`,"Le mur isole très peu."]; bad=0;
    why=`On n'additionne pas des conductivités : on calcule la résistance de chaque couche, puis on additionne les résistances. Béton : ${nf(0.2/(1.75*S),4)} K/W ; laine : ${nf(0.08/(0.035*S),4)} K/W ; total ${nf(0.2/(1.75*S)+0.08/(0.035*S),4)} K/W.`; }
  else if(v===2){ const R=rnd([0.02,0.04,0.05]), Ti=rnd([22,24]), Te=rnd([32,34]);
    ctx=`Flux à travers une paroi de résistance ${nf(R,2)} K/W, entre un local à ${Ti} °C et l'extérieur à ${Te} °C.`;
    st=[`ΔT = ${Te} − ${Ti} = ${Te-Ti} K`,`Φ = ΔT × Rth = ${Te-Ti} × ${nf(R,2)} = ${nf((Te-Ti)*R,2)} W`,"Le flux est très faible : l'isolation est excellente."]; bad=1;
    why=`${F(`Φ = ${FRAC("ΔT","Rth")}`)} = ${FRAC(Te-Ti,nf(R,2))} = ${nf((Te-Ti)/R,0)} W. Plus la résistance est grande, plus le flux est petit.`; }
  else if(v===3){ const {P,Rt,Ta,Tm}=draw(()=>({P:rnd([5,8,10,12]),Rt:rnd([4,5,6,8]),Ta:rnd([35,40,45]),Tm:rnd([100,110,125])}),o=>o.P*o.Rt<=0.9*o.Tm&&Math.abs(o.Ta+o.P*o.Rt-o.Tm)>=0.05*o.Tm);
    ctx=`Température de jonction d'un composant qui dissipe ${P} W, avec une résistance totale jonction-air de ${Rt} K/W, dans un air à ${Ta} °C (Tj max = ${Tm} °C).`;
    st=[`Rth = ${Rt} K/W`,`Tj = P·Rth = ${P} × ${Rt} = ${P*Rt} °C`,`Tj < ${Tm} °C : le composant est protégé.`]; bad=1;
    why=`P·Rth donne seulement l'écart entre la jonction et l'air : ${F("Tj = Ta + P·Rth")} = ${Ta} + ${P*Rt} = ${Ta+P*Rt} °C, ${Ta+P*Rt>Tm?`plus que Tj max = ${Tm} °C : le composant n'est pas protégé, contrairement à la conclusion de l'élève`:`ce qui reste inférieur à Tj max = ${Tm} °C : la conclusion est juste, mais le calcul ne l'était pas`}.`; }
  else if(v===4){ const Ti=rnd([-18,-20]), Te=rnd([25,28]), R=rnd([0.04,0.05]);
    ctx=`Flux entrant dans une chambre froide à ${tC(Ti,0)} °C, placée dans un local à ${Te} °C (Rth = ${nf(R,2)} K/W).`;
    st=[`ΔT = ${Te} − ${-Ti} = ${Te+Ti} K`,`Φ = ${FRAC("ΔT","Rth")} = ${FRAC(Te+Ti,nf(R,2))} = ${nf((Te+Ti)/R,0)} W`,"Le groupe frigorifique doit extraire ce flux."]; bad=0;
    why=`ΔT = ${Te} − (${tC(Ti,0)}) = ${Te-Ti} K : il faut garder le signe de la température négative. Φ = ${FRAC(Te-Ti,nf(R,2))} = ${nf((Te-Ti)/R,0)} W.`; }
  else { const P=rnd([15,20,25]), Ta=rnd([40,45]), Tm=150, Rjb=rnd([0.8,1]), Rbd=0.5, Rt=(Tm-Ta)/P;
    ctx=`Résistance thermique maximale du dissipateur d'un composant qui dissipe ${P} W (Tj max = ${Tm} °C, air à ${Ta} °C, Rjb = ${nf(Rjb,1)} K/W, Rbd = ${nf(Rbd,1)} K/W).`;
    st=[`Rtot ≤ ${FRAC(`${Tm} − ${Ta}`,P)} = ${nf(Rt,2)} K/W`,`Rda ≤ Rtot = ${nf(Rt,2)} K/W`,`On choisit un dissipateur de ${nf(Rt,2)} K/W.`]; bad=1;
    why=`Rtot est la somme des trois résistances en série : ${F("Rda ≤ Rtot − Rjb − Rbd")} = ${nf(Rt,2)} − ${nf(Rjb,1)} − ${nf(Rbd,1)} = ${nf(Rt-Rjb-Rbd,2)} K/W. Le dissipateur choisi serait trop petit.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé ce calcul. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* dissipateur : résistance mesurée, écart relatif, conclusion */
()=>{ const inside=Math.random()<0.5;
  const o=draw(()=>({Rc:rnd([1.2,1.5,2,2.5,3,4]),P:rnd([8,10,12,15,20]),Ta:rnd([22,24,25]),k:1+rnd([-1,1])*(0.01+Math.random()*0.15),disp:rnd([3,4,5,6,8])}),o=>{ const Td=Math.round((o.Ta+o.P*o.Rc*o.k)*10)/10, Rm=(Td-o.Ta)/o.P, er=Math.abs(Rm-o.Rc)/o.Rc*100; return Td<=100&&far(er,o.disp,0.25)&&er>=0.5&&(er<o.disp)===inside; });
  const Td=Math.round((o.Ta+o.P*o.Rc*o.k)*10)/10, Rm=(Td-o.Ta)/o.P, er=Math.abs(Rm-o.Rc)/o.Rc*100;
  const ctx=`Pour vérifier un dissipateur annoncé à ${nf(o.Rc,1)} K/W par le constructeur, on y fixe une résistance chauffante qui dissipe P = ${o.P} W. En régime permanent, l'air ambiant est à ${o.Ta} °C et l'embase du dissipateur à ${nf(Td,1)} °C (moyenne de plusieurs essais ; dispersion des essais : ± ${o.disp} %).`;
  return [{ctx,q:"Calcule la résistance thermique mesurée du dissipateur.",type:"num",ans:Rm,tolR:0.02,unit:"K/W",
      expl:`Toute la puissance traverse le dissipateur : ${F(`Rda = ${FRAC("Td − Ta","P")}`)} = ${FRAC(`${nf(Td,1)} − ${o.Ta}`,o.P)} = ${U(Rm,"K/W")}.`},
    {ctx,q:"Calcule l'écart relatif entre la valeur mesurée et la valeur du constructeur, prise comme référence.",type:"num",ans:er,tolR:0.03,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|R_mes − R_const|","R_const")} × 100`)} = ${FRAC(`|${nf(Rm,3)} − ${nf(o.Rc,1)}|`,nf(o.Rc,1))} × 100 = ${U(er,"%")}.`},
    {ctx,q:"Que peut-on conclure ?",type:"ch",ch:["Les essais ne mettent pas en défaut la valeur du constructeur","La valeur du constructeur est mise en défaut : l'écart dépasse la dispersion des essais"],ok:inside?0:1,
      expl:inside?`L'écart (${nf(er,1)} %) est inférieur à la dispersion des essais (± ${o.disp} %) : ${F("les essais ne mettent pas en défaut")} la valeur annoncée.`:`L'écart (${nf(er,1)} %) dépasse la dispersion des essais (± ${o.disp} %) : la valeur annoncée est mise en défaut. ${Rm>o.Rc?"Le dissipateur fait moins bien qu'annoncé : montage moins favorable que celui du constructeur, air moins brassé, mauvais contact…":"Le dissipateur fait mieux qu'annoncé : valeur prudente du constructeur, ou essai plus favorable (air plus brassé, ailettes bien orientées…)."}`}]; },
/* isoler les murs ou changer les vitrages ? */
()=>{ const o=draw(()=>({Rm:rnd([0.01,0.015,0.02,0.025]),Sm:rnd([40,60,80]),Rv:rnd([0.02,0.03,0.04,0.05]),k:rnd([2,2.5,3]),iso:rnd(["pse","lv","pu"]),e:rnd([0.04,0.05,0.06,0.08]),dT:rnd([8,10,12])}),o=>{ const RA=o.Rm+o.e/(MT[o.iso].l*o.Sm), FA=o.dT*(1/RA+1/o.Rv), FB=o.dT*(1/o.Rm+1/(o.k*o.Rv)); return far(FA,FB,0.08); });
  const Ri=o.e/(MT[o.iso].l*o.Sm), RA=o.Rm+Ri, F0=o.dT*(1/o.Rm+1/o.Rv), FA=o.dT*(1/RA+1/o.Rv), FB=o.dT*(1/o.Rm+1/(o.k*o.Rv)), best=FA<FB?0:1;
  const ctx=`Un local climatisé est ${o.dT} °C plus frais que l'extérieur. Ses murs (${o.Sm} m²) ont une résistance thermique de ${nf(o.Rm,3)} K/W, ses vitrages une résistance de ${nf(o.Rv,3)} K/W. Solution A : doubler les murs de ${fe(o.e)} de ${MT[o.iso].nm} (λ = ${lam(o.iso)} ${WMK}). Solution B : remplacer les vitrages par des vitrages de résistance ${nf(o.k,1)} fois plus grande.`;
  return [{ctx,q:"Calcule le flux thermique total qui entre actuellement par les murs et les vitrages.",type:"num",ans:F0,tolR:0.02,unit:"W",
      expl:`Murs et vitrages sont deux chemins soumis au même ΔT : les flux s'additionnent. ${F(`Φ = ${FRAC("ΔT","Rmurs")} + ${FRAC("ΔT","Rvitr")}`)} = ${FRAC(o.dT,nf(o.Rm,3))} + ${FRAC(o.dT,nf(o.Rv,3))} = ${nf(o.dT/o.Rm,0)} + ${nf(o.dT/o.Rv,0)} = ${U(F0,"W")}.`},
    {ctx,q:"Calcule le flux thermique total avec la solution A.",type:"num",ans:FA,tolR:0.02,unit:"W",
      expl:`Isolant : ${FRAC(nf(o.e,2),`${lam(o.iso)} × ${o.Sm}`)} = ${nf(Ri,4)} K/W, en série avec le mur : ${nf(RA,4)} K/W. ${FRAC(o.dT,nf(RA,4))} + ${FRAC(o.dT,nf(o.Rv,3))} = ${nf(o.dT/RA,0)} + ${nf(o.dT/o.Rv,0)} = ${U(FA,"W")}.`},
    {ctx,q:"Quelle solution réduit le plus le flux thermique total ?",type:"ch",ch:["La solution A (isoler les murs)","La solution B (changer les vitrages)"],ok:best,
      expl:`Solution B : ${FRAC(o.dT,nf(o.Rm,3))} + ${FRAC(o.dT,nf(o.k*o.Rv,3))} = ${nf(o.dT/o.Rm,0)} + ${nf(o.dT/(o.k*o.Rv),0)} = ${nf(FB,0)} W. ${best===0?`La solution A (${nf(FA,0)} W) fait mieux que B (${nf(FB,0)} W)`:`La solution B (${nf(FB,0)} W) fait mieux que A (${nf(FA,0)} W)`} : on traite d'abord le chemin par lequel entre le plus de chaleur.`}]; },
/* identifier un isolant à partir de mesures */
()=>{ const CAND=["pu","pse","coco","bois"];
  const o=draw(()=>{ const k=rnd(CAND), S=rnd([8,10,12]), ei=rnd([0.06,0.08,0.1]), Te=rnd([33,34,35,36]), Ti=rnd([23,24,25]), p=prof([["beton",0.2],[k,ei],["platre",0.013]],S,Te,Ti), Td=p.Tv.map(t=>Math.round(t*10)/10), Phi=Math.round(p.Phi), dTi=Math.round((Td[1]-Td[2])*10)/10, Ri=dTi/Phi, li=ei/(Ri*S); return {k,S,ei,Te,Ti,Td,Phi,dTi,Ri,li}; },o=>Math.abs(o.li-MT[o.k].l)/MT[o.k].l<0.05);
  const lay=[["beton",0.2],[o.k,o.ei],["platre",0.013]], i0=CAND.indexOf(o.k);
  /* couche 2 dessinée avec le motif générique d'un isolant : le dessin ne doit pas trahir le matériau inconnu */
  const fig=fx_th_paroi({c:couches(lay).map((c,i)=>i===1?{...c,m:"isolant"}:c),T:o.Td.map(t=>`${nf(t,1)} °C`),Tv:o.Td,dir:1});
  const data=table(["Isolant possible","λ (W·m⁻¹·K⁻¹)"],CAND.map(c=>[cap1(MT[c].nm),lam(c)]));
  const ctx=`Diagnostic d'un mur de ${o.S} m² : béton (20 cm), isolant inconnu (couche 2, ${fe(o.ei)}), plâtre. Un fluxmètre mesure Φ = ${o.Phi} W ; des capteurs donnent les températures aux frontières des couches (figure).`;
  return [{fig,ctx,q:"Calcule la résistance thermique de la couche d'isolant.",type:"num",ans:o.Ri,tolR:0.02,unit:"K/W",
      expl:`Chute de température dans l'isolant : ${nf(o.Td[1],1)} − ${nf(o.Td[2],1)} = ${nf(o.dTi,1)} °C. Le flux mesuré la traverse : ${F(`R2 = ${FRAC("ΔT2","Φ")}`)} = ${FRAC(nf(o.dTi,1),o.Phi)} = ${U(o.Ri,"K/W")}.`},
    {fig,ctx,q:"Déduis-en la conductivité thermique de l'isolant.",type:"num",ans:o.li,tolR:0.03,unit:WMK,
      expl:`${F(`R2 = ${FRAC("e","λ·S")}`)}, donc ${F(`λ = ${FRAC("e","R2·S")}`)} = ${FRAC(nf(o.ei,2),`${nf(o.Ri,4)} × ${o.S}`)} = ${U(o.li,WMK)}.`},
    {fig,data,ctx,q:"De quel isolant s'agit-il le plus probablement ?",type:"ch",ch:CAND.map(c=>cap1(MT[c].nm)),ok:i0,
      expl:`λ ≈ ${S3(o.li)} ${WMK} : la valeur la plus proche du tableau est celle du matériau « ${MT[o.k].nm} » (${lam(o.k)}). Une mesure réelle s'écarte toujours un peu de la valeur de référence.`}]; },
/* projecteur à LED : puissance thermique admissible, courant maximal, conclusion */
()=>{ const tgt=rnd([0,1]), o=draw(()=>({U:rnd([12,24,36]),Rt:rnd([1.5,2,2.5,3,4]),Ta:rnd([30,35,40]),Tjm:rnd([105,110,120]),In:rnd([0.5,0.7,1,1.2,1.5,2])}),o=>{ const Im=(o.Tjm-o.Ta)/o.Rt/(0.7*o.U); return Im>=0.3&&Im<=4&&far(Im,o.In,0.06)&&(o.In<=Im)===(tgt===0); });
  const Pth=(o.Tjm-o.Ta)/o.Rt, Pe=Pth/0.7, Im=Pe/o.U, ok=o.In<=Im;
  const ctx=`Projecteur à LED de puissance pour le pont d'un bateau : la LED fonctionne sous U = ${o.U} V et 70 % de la puissance électrique qu'elle reçoit est dissipée en chaleur. Résistance thermique de la jonction à l'air (boîtier, pâte, dissipateur) : Rth = ${nf(o.Rt,1)} K/W. Air ambiant : ${o.Ta} °C. Pour sa durée de vie, la jonction ne doit pas dépasser ${o.Tjm} °C.`;
  return [{ctx,q:"Quelle puissance thermique maximale peut-on évacuer ?",type:"num",ans:Pth,tolR:0.02,unit:"W",
      expl:`${F("Tj = Ta + Pth·Rth ≤ Tj max")}, donc ${F(`Pth ≤ ${FRAC("Tj max − Ta","Rth")}`)} = ${FRAC(`${o.Tjm} − ${o.Ta}`,nf(o.Rt,1))} = ${U(Pth,"W")}.`},
    {ctx,q:"Quel courant maximal peut-on faire passer dans la LED ?",type:"num",ans:Im,tolR:0.02,unit:"A",
      expl:`La chaleur représente 70 % de la puissance électrique : ${F(`Pé = ${FRAC("Pth","0,7")}`)} = ${FRAC(nf(Pth,2),"0,7")} = ${nf(Pe,2)} W. ${F(`I = ${FRAC("Pé","U")}`)} = ${FRAC(nf(Pe,2),o.U)} = ${U(Im,"A")}.`},
    {ctx,q:`Le constructeur annonce un courant nominal de ${nf(o.In,1)} A. Le projecteur peut-il fonctionner à ce courant sans dépasser ${o.Tjm} °C ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${nf(o.In,1)} A ${ok?"≤":">"} ${S3(Im)} A : ${ok?"oui, la jonction reste sous la limite.":"non, la jonction dépasserait la limite ; il faut un meilleur dissipateur (Rth plus petite) ou réduire le courant."}`}]; },
/* simulation thermique d'une carte : composant le plus chaud, température de jonction, marge */
()=>{ const tgt=rnd([0,1]), pos=[{u:0.18,v:0.36},{u:0.5,v:0.66},{u:0.82,v:0.34}];
  const o=draw(()=>{ const dT=shuffle([rnd([30,34,38]),rnd([18,22]),rnd([8,12])]), Tb=rnd([40,45,50]), P=rnd([2,3,4,5]), Rjb=rnd([2,3,5,8]), Tjm=rnd([125,150]), mg=rnd([10,15,20]); return {dT,Tb,P,Rjb,Tjm,mg}; },o=>{ const h=o.dT.indexOf(Math.max(...o.dT)), Tmax=o.Tb+o.dT[h], Tj=Tmax+o.P*o.Rjb; return Math.abs(Tj-(o.Tjm-o.mg))>=5&&(Tj<=o.Tjm-o.mg)===(tgt===0); });
  const h=o.dT.indexOf(Math.max(...o.dT)), c=pos.map((p,i)=>({...p,dT:o.dT[i],n:`U${i+1}`}));
  const f=(u,v)=>o.Tb+c.reduce((a,cc)=>{ const dx=(u-cc.u)*300, dy=(v-cc.v)*136; return a+cc.dT*Math.exp(-(dx*dx+dy*dy)/1800); },0);
  const Tmax=Math.round(f(c[h].u,c[h].v)*10)/10, Tj=Tmax+o.P*o.Rjb, ok=Tj<=o.Tjm-o.mg;
  const fig=fx_th_pcb({c,Tb:o.Tb,v0:o.Tb,v1:Tmax});
  const ctx="Simulation thermique d'une carte électronique en régime permanent : l'échelle va de la température de la carte loin des composants à la température maximale.";
  return [{fig,ctx,q:"Quel composant est le plus chaud ?",type:"ch",ch:["U1","U2","U3"],ok:h,
      expl:`La zone rouge, en haut de l'échelle (${nf(Tmax,1)} °C), entoure le composant ${F(`U${h+1}`)} : c'est lui qui dissipe le plus ou qui est le moins bien refroidi.`},
    {fig,ctx:`Le boîtier de U${h+1} est à la température maximale de la carte. Ce composant dissipe P = ${o.P} W ; sa résistance thermique jonction → boîtier vaut Rjb = ${o.Rjb} K/W.`,q:`Calcule la température de la jonction de U${h+1}.`,type:"num",ans:Tj,tolR:0.02,unit:"°C",
      expl:`${F("Tj = Tb + P·Rjb")} = ${nf(Tmax,1)} + ${o.P} × ${o.Rjb} = ${U(Tj,"°C")}.`},
    {fig,ctx:`Pour ce composant, Tj max = ${o.Tjm} °C ; le cahier des charges exige une marge d'au moins ${o.mg} °C sous Tj max.`,q:"La marge exigée est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Il faut Tj ≤ ${o.Tjm} − ${o.mg} = ${o.Tjm-o.mg} °C. ${nf(Tj,1)} °C ${ok?"≤":">"} ${o.Tjm-o.mg} °C : ${ok?"la marge est respectée.":"la marge n'est pas respectée ; il faut mieux refroidir U"+(h+1)+" (dissipateur, ventilation, cuivre sur la carte)."}`}]; }
];

POOLS["ener-thermique"]={
  titre:"Flux, isolation, dissipation",
  fiche:{t:"Transferts thermiques (SI)",l:[
    `Flux à travers une paroi, toujours du chaud vers le froid : ${F(`Φ = ${FRAC("ΔT","Rth")}`)}, en W ; énergie transférée pendant Δt : ${F("E = Φ·Δt")}.`,
    `Conduction : ${F(`Rth = ${FRAC("e","λ·S")}`)}, avec e en m, S en m² et λ en W·m⁻¹·K⁻¹ ; le meilleur isolant a la plus petite conductivité ${F("λ")}.`,
    `Couches traversées par le même flux (en série) : ${F("Rth = R1 + R2 + R3")} ; chaque couche fait chuter la température de ${F("ΔTi = Φ·Ri")}, surtout l'isolant.`,
    `Composant sur dissipateur : ${F("Tj = Ta + P·(Rjb + Rbd + Rda)")} ≤ Tj max ; local climatisé : ${F("P_froid = Φ_parois + P_internes")} ; local chauffé : ${F("P_chauf = Φ_parois − P_internes")}.`,
    `Pièges : épaisseur en mm non convertie (${F("1 mm = 10<sup>−3</sup> m")}), sens du flux inversé, résistances en série traitées comme en parallèle, Ta oubliée dans Tj, W confondus avec Wh.`]},
  count:{1:4,2:4,3:3},1:TH1,2:TH2,3:TH3
};
})();
