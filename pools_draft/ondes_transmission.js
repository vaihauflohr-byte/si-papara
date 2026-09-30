/* Réservoirs : ondes, son, interférences (phy-ondes) · trames, protocoles, réseaux (info-transmission).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_ond_ et fx_trm_. */
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
const noTag=s=>String(s).replace(/<[^>]+>/g,"").trim();
/* choix mélangés, distracteurs dédoublonnés (au plus n) */
function mcu(ok,wrong,n){ const seen=new Set([noTag(ok)]), w=[]; for(const x of wrong){ if(x==null) continue; const k=noTag(x); if(!seen.has(k)){ seen.add(k); w.push(x); } if(w.length>=(n||3)) break; } return mc(ok,w); }
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
/* puissances de dix avec le vrai signe moins */
const p10=e=>`10<sup>${e<0?"−":""}${Math.abs(e)}</sup>`;
/* écriture scientifique : 3,16 × 10⁻⁵ (d décimales sur la mantisse) ; me : mantisse arrondie et exposant */
const me=(x,d)=>{ d=d==null?2:d; let e=Math.floor(Math.log10(Math.abs(x))+1e-12), m=Math.round(x/10**e*10**d)/10**d; if(Math.abs(m)>=10){ m/=10; e++; } return [m,e]; };
const sci=(x,d)=>{ if(x===0) return "0"; d=d==null?2:d; const [m,e]=me(x,d); if(e===0) return nf(m,d); return m===1?p10(e):`${nf(m,d)} × ${p10(e)}`; };
/* nombre avec le vrai signe moins */
const nm=(x,d)=>nf(x,d).replace(/-/g,"−");
const lg=x=>Math.log10(x);
/* niveau sonore à partir de l'intensité (W/m²) et intensité à partir du niveau */
const Lv=I=>10*lg(I/1e-12), Iv=L=>1e-12*10**(L/10);

/* ===== outils de dessin ===== */
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const poly=(pts,cls,st)=>`<polyline points="${pts.map(P2).join(" ")}" class="${cls}"${st?` style="${st}"`:""}/>`;
const vcote=(x,y1,y2,t,a)=>`<line x1="${(+x).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x).toFixed(1)}" y2="${(+y2).toFixed(1)}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+(t?T(x+(a==="end"?-6:6),(y1+y2)/2+4,t,"v-cap",a||"start"):"");
const box=(x,y,w,h,lines,cls,tc)=>`<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${(+w).toFixed(1)}" height="${h}" rx="4" class="${cls||"v-box"}"/>`+multi(x+w/2,y+h/2-(lines.length-1)*6.5+4,lines,tc||"v-smb","middle");
/* texte avec un liseré couleur papier (lisible par-dessus une courbe) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
const COUL="stroke:var(--coulomb)";

/* ======================================================================
   FIGURES : ONDES (préfixe fx_ond_)
   ====================================================================== */
/* signaux pour l'oscilloscope (x et y en divisions) */
const sigSin=(A,P,x0)=>x=>A*Math.sin(2*Math.PI*(x-(x0||0))/P);
const sigSalve=(A,t0,w,p)=>x=>{ if(x<t0||x>t0+w) return 0; const e=Math.min(1,(x-t0)/0.12)*Math.min(1,(t0+w-x)/0.35); return A*e*Math.sin(2*Math.PI*(x-t0)/(p||0.1)); };
const sigPic=(A,t0,s)=>x=>A*Math.exp(-(((x-t0)/(s||0.22))**2));
/* écran d'oscilloscope 10 × 8 divisions : o.tr = [{f, y0 (ligne de base, en div depuis le haut), c (1 : seconde couleur), lab}],
   o.tb : base de temps ; o.leg : légende sous l'écran */
function fx_ond_oscillo(o){
  const X0=40, Y0=12, dx=32, dy=20, W=320, H=160, X=x=>X0+x*dx, Y=y=>Y0+y*dy;
  let s=`<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" class="v-box"/>`;
  for(let i=1;i<10;i++) s+=L(X(i),Y0,X(i),Y0+H,"v-grid");
  for(let j=1;j<8;j++) s+=L(X0,Y(j),X0+W,Y(j),"v-grid");
  for(let k=1;k<50;k++) if(k%5) s+=L(X(k/5),Y(4)-3,X(k/5),Y(4)+3,"v-thin");
  for(let k=1;k<40;k++) if(k%5) s+=L(X(5)-3,Y(k/5),X(5)+3,Y(k/5),"v-thin");
  (o.tr||[]).forEach(tr=>{ const pts=[]; for(let i=0;i<=1000;i++){ const x=i/100, y=Math.max(0.05,Math.min(7.95,tr.y0-tr.f(x))); pts.push([X(x),Y(y)]); }
    s+=poly(pts,"v-curve",tr.c?COUL+";stroke-width:2":"stroke-width:2");
    if(tr.lab) s+=T(X0-6,Y(tr.y0)+4,esc(tr.lab),tr.c?"v-lab s c":"v-lab s a","end"); });
  (o.mk||[]).forEach(m=>{ s+=Th(X(m.x),Y(m.y),esc(m.t),"v-lab s","middle"); });
  let h=Y0+H+18;
  if(o.tb){ s+=T(200,h,esc(`Base de temps : ${o.tb}`),"v-smb","middle"); h+=15; }
  (o.leg||[]).forEach(l=>{ s+=T(200,h,esc(l),"v-cap","middle"); h+=14; });
  return svg(h,s,o.alt||"Oscillogramme : écran de 10 divisions horizontales sur 8 verticales");
}
/* corde à un instant donné : y(x) = A·cos(2π(x − c0)/λ) jusqu'au front xf ; o.xm, o.xs (graduations), o.u (unité),
   o.cote = {a, b, t} (cote horizontale au-dessus de la corde), o.src : dessiner le vibreur */
function fx_ond_corde(o){
  const X0=40, W=330, Y=84, A=30, sx=W/o.xm, X=x=>X0+x*sx, xf=o.xf==null?o.xm:o.xf;
  let s="";
  const nl=Math.round(o.xm/o.xs), ls=o.ls||(W/nl<34?2:1);
  for(let k=0;k<=nl;k++){ const x=k*o.xs; s+=L(X(x),Y-A-4,X(x),Y+A+6,"v-grid"); if(k%ls===0) s+=T(X(x),Y+A+26,nf(x,2),"v-lab s","middle"); }
  s+=L(X0,Y,X0+W,Y,"v-dash")+L(X0,Y+A+8,X0+W+12,Y+A+8,"v-ink","k")+T(X0+W+12,Y+A+44,`x (${o.u})`,"v-cap","end");
  s+=`<rect x="${X0-30}" y="${Y-16}" width="22" height="32" rx="3" class="v-body"/>`+L(X0-8,Y,X0,Y,"v-ink")+T(X0-19,Y-22,"S","v-lab s","middle");
  const pts=[]; for(let i=0;i<=660;i++){ const x=o.xm*i/660, y=x<=xf?A*Math.cos(2*Math.PI*(x-o.c0)/o.lam):0; pts.push([X(x),Y-y]); }
  s+=poly(pts,"v-curve");
  if(o.cote){ const yc=Y-A-12; s+=L(X(o.cote.a),yc-4,X(o.cote.a),Y-A+2,"v-dash")+L(X(o.cote.b),yc-4,X(o.cote.b),Y-A+2,"v-dash")+cote(X(o.cote.a),X(o.cote.b),yc,o.cote.t); }
  if(o.front) s+=L(X(xf),Y+26,X(xf),Y-26,"v-dash")+T(X(xf)+4,Y-30,"front","v-cap");
  return svg(Y+A+54,s,o.alt||"Aspect de la corde à un instant donné, source S à gauche");
}
/* télémètre à ultrasons face à un obstacle : o.obs (nom), o.d (texte de la cote), o.xo (abscisse de l'obstacle) */
function fx_ond_telem(o){
  const xo=o.xo||300, y1=58, y2=102;
  let s=`<rect x="14" y="36" width="52" height="88" rx="4" class="v-body"/>`+T(40,142,"capteur","v-cap","middle");
  s+=`<rect x="66" y="${y1-12}" width="20" height="24" rx="3" class="v-box"/><rect x="66" y="${y2-12}" width="20" height="24" rx="3" class="v-box"/>`;
  s+=T(40,y1+4,"E","v-lab s","middle")+T(40,y2+4,"R","v-lab s","middle");
  for(let k=0;k<3;k++){ const r=10+k*7; s+=`<path d="M${90+r*0.5} ${(y1-r*0.87).toFixed(1)} A${r} ${r} 0 0 1 ${90+r*0.5} ${(y1+r*0.87).toFixed(1)}" class="v-thin"/>`; }
  s+=L(112,y1,xo-4,y1,"v-t","c")+T((112+xo)/2,y1-8,"onde émise","v-cap","middle");
  s+=L(xo-4,y2,92,y2,"v-n","a")+T((112+xo)/2,y2+16,"écho","v-cap","middle");
  s+=`<rect x="${xo}" y="26" width="${Math.min(60,392-xo)}" height="108" class="v-block"/>`+T(xo+Math.min(60,392-xo)/2,20,esc(o.obs||"obstacle"),"v-cap","middle");
  s+=L(86,124,86,156,"v-dash")+L(xo,136,xo,156,"v-dash")+cote(86,xo,152,o.d||"d");
  return svg(166,s,o.alt||"Télémètre à ultrasons : émetteur E, récepteur R, obstacle à la distance d");
}
/* sondeur d'un bateau : o.h (texte de la cote sonde → fond), o.b (nom du bateau) */
function fx_ond_sondeur(o){
  const yS=64, yF=206, xs=150;
  let s=`<path d="M60 38 L300 38 L286 72 Q200 84 96 76 Z" class="v-body"/>`+T(180,30,esc(o.b||"bateau"),"v-cap","middle");
  let w=[]; for(let x=8;x<=392;x+=4) w.push([x,yS+2*Math.sin(x/9)]); s+=poly(w,"v-thin")+T(392,yS-6,"surface","v-cap","end");
  s+=`<rect x="${xs-9}" y="80" width="18" height="10" rx="2" class="v-box"/>`+T(xs-16,92,"sonde","v-cap","end");
  if(o.cone){ const hw=62, y0=92, a=Math.atan(hw/(yF-y0)), r=46;
    s+=`<polygon points="${xs},${y0} ${xs-hw},${yF} ${xs+hw},${yF}" style="fill:var(--accent);fill-opacity:.12;stroke:none"/>`+L(xs,y0,xs-hw,yF,"v-dash")+L(xs,y0,xs+hw,yF,"v-dash")+L(xs,y0,xs,yF,"v-dash");
    s+=`<path d="M${xs} ${y0+r} A${r} ${r} 0 0 0 ${(xs+r*Math.sin(a)).toFixed(1)} ${(y0+r*Math.cos(a)).toFixed(1)}" class="v-cote"/>`+Th(xs+9,y0+r+15,"θ","v-lab s");
    s+=L(xs-hw,yF+2,xs-hw,yF+30,"v-dash")+L(xs+hw,yF+2,xs+hw,yF+30,"v-dash")+cote(xs-hw,xs+hw,yF+26,o.cone.D||"D")+T(xs-hw-6,yF-8,"zone sondée","v-cap","end"); }
  else s+=L(xs-7,96,xs-7,yF-4,"v-t","c")+L(xs+7,yF-4,xs+7,96,"v-n","a");
  let g=L(8,yF,392,yF,"v-ink"); for(let x=16;x<=392;x+=14) g+=L(x,yF,x-10,yF+10,"v-hatch"); s+=g+T(392,yF-6,"fond","v-cap","end");
  s+=L(xs+12,85,262,85,"v-dash")+vcote(258,85,yF,o.h||"h");
  return svg(yF+(o.cone?36:18),s,o.alt||(o.cone?"Faisceau d'ultrasons du sondeur, de demi-angle θ, qui s'élargit jusqu'au fond":"Sondeur à ultrasons fixé sous la coque d'un bateau"));
}
/* diffraction d'un faisceau laser par une fente : o.a, o.D, o.L (textes des cotes), o.src */
function fx_ond_diff(o){
  const xF=120, xE=296, yc=104, hs=40;
  let s=`<rect x="8" y="${yc-12}" width="56" height="24" rx="3" class="v-body"/>`+T(36,yc+28,esc(o.src||"laser"),"v-cap","middle");
  s+=L(64,yc,xF,yc,"v-t");
  if(o.fil) s+=`<circle cx="${xF}" cy="${yc}" r="3.2" class="v-pt"/>`+T(xF,yc+24,esc(o.a||"fil de diamètre a"),"v-cap","middle")+T(xF,yc+38,"(vu en coupe)","v-cap","middle");
  else s+=`<rect x="${xF-3}" y="${yc-78}" width="6" height="73" class="v-block"/><rect x="${xF-3}" y="${yc+5}" width="6" height="73" class="v-block"/>`+T(xF,yc-86,esc(o.a||"fente de largeur a"),"v-cap","middle");
  s+=L(xE,yc-92,xE,yc+92,"v-ink")+T(xE,yc-98,"écran","v-cap","middle");
  s+=L(xE-2,yc-hs,xE-2,yc+hs,"v-t")+`<line x1="${xE-2}" y1="${yc+hs+8}" x2="${xE-2}" y2="${yc+hs+30}" class="v-t" style="opacity:.55"/><line x1="${xE-2}" y1="${yc-hs-8}" x2="${xE-2}" y2="${yc-hs-30}" class="v-t" style="opacity:.55"/>`;
  s+=L(xF,yc,xE,yc,"v-dash")+L(xF,yc,xE,yc-hs,"v-dash");
  const r=70, a=Math.atan(hs/(xE-xF));
  s+=`<path d="M${xF+r} ${yc} A${r} ${r} 0 0 0 ${(xF+r*Math.cos(a)).toFixed(1)} ${(yc-r*Math.sin(a)).toFixed(1)}" class="v-cote"/>`+T(xF+r+8,yc-6,"θ","v-lab s");
  s+=vcote(xE+14,yc-hs,yc+hs,o.L||"L");
  s+=L(xF,yc+80,xF,yc+104,"v-dash")+L(xE,yc+94,xE,yc+104,"v-dash")+cote(xF,xE,yc+100,o.D||"D");
  return svg(yc+112,s,o.alt||"Diffraction d'un faisceau laser par une fente, observée sur un écran");
}
/* figure d'interférences vue sur l'écran : o.n interfranges sur la largeur, o.k1, o.k2 : franges brillantes repérées par la cote, o.t : texte */
function fx_ond_franges(o){
  const X0=24, W=352, y0=30, h=64, iw=W/o.n, xc=X0+W/2+(o.n%2?iw/2:0);
  /* écran photographié : fond sombre, franges brillantes rouges (couleurs fixes, identiques en thème clair et sombre) */
  let s=`<rect x="${X0}" y="${y0}" width="${W}" height="${h}" style="fill:#17191d;stroke:var(--ink-3);stroke-width:1"/>`;
  for(let x=X0;x<X0+W-0.1;x+=2){ const c=Math.cos(Math.PI*(x+1-xc)/iw)**2; if(c>0.04) s+=`<rect x="${x.toFixed(1)}" y="${y0}" width="2.2" height="${h}" style="fill:#ff5a45;fill-opacity:${(0.95*c).toFixed(2)};stroke:none"/>`; }
  const xa=xc+o.k1*iw, xb=xc+o.k2*iw;
  s+=L(xa,y0+h+2,xa,y0+h+22,"v-dash")+L(xb,y0+h+2,xb,y0+h+22,"v-dash")+cote(xa,xb,y0+h+18,o.t||"");
  if(o.cap) s+=T(200,y0+h+44,esc(o.cap),"v-cap","middle");
  return svg(y0+h+(o.cap?52:30),s,o.alt||"Franges d'interférences observées sur l'écran");
}
/* deux sources cohérentes (haut-parleurs ou fentes) et un point M : o.kind ("hp" | "fentes"), o.d1, o.d2 (textes), o.b (texte de l'écart) */
function fx_ond_deux(o){
  const hp=o.kind!=="fentes", S1=[hp?84:92,62], S2=[hp?84:92,150], M=[hp?330:360,o.my||86];
  let s="";
  if(hp){ [S1,S2].forEach((p,i)=>{ s+=`<rect x="${p[0]-26}" y="${p[1]-12}" width="14" height="24" class="v-body"/><path d="M${p[0]-12} ${p[1]-12} L${p[0]} ${p[1]-24} L${p[0]} ${p[1]+24} L${p[0]-12} ${p[1]+12} Z" class="v-box"/>`+T(p[0]-14,i?p[1]+42:p[1]-32,`HP${i+1}`,"v-lab s","middle"); });
    s+=box(4,92,42,28,["GBF"],"v-box","v-sm")+`<polyline points="25,92 25,62 58,62" class="v-thin"/><polyline points="25,120 25,150 58,150" class="v-thin"/>`;
    s+=`<circle cx="${M[0]}" cy="${M[1]}" r="8" class="v-wheel"/>`+L(M[0]+8,M[1],M[0]+30,M[1],"v-ink")+T(M[0]+2,M[1]-14,"M (micro)","v-cap","middle"); }
  else { s+=`<rect x="${S1[0]-3}" y="20" width="6" height="${S1[1]-26}" class="v-block"/><rect x="${S1[0]-3}" y="${S1[1]+6}" width="6" height="${S2[1]-S1[1]-12}" class="v-block"/><rect x="${S1[0]-3}" y="${S2[1]+6}" width="6" height="${196-S2[1]}" class="v-block"/>`;
    s+=`<polygon points="48,100 48,112 ${S1[0]-3},${S2[1]+10} ${S1[0]-3},${S1[1]-10}" style="fill:var(--coulomb);fill-opacity:.18;stroke:none"/>`+`<rect x="4" y="96" width="44" height="20" rx="3" class="v-body"/>`+T(26,132,"laser","v-cap","middle");
    s+=L(M[0],16,M[0],200,"v-ink")+T(M[0],212,"écran","v-cap","end")+pt(M[0],M[1],"",0,0)+T(M[0]-6,M[1]-8,"M","v-lab s","end"); }
  const tgt=hp?[M[0]-8,M[1]]:M;
  s+=L(S1[0],S1[1],tgt[0],tgt[1],"v-dash")+L(S2[0],S2[1],tgt[0],tgt[1],"v-dash");
  const m1=[(S1[0]+tgt[0])/2,(S1[1]+tgt[1])/2], m2=[(S2[0]+tgt[0])/2,(S2[1]+tgt[1])/2];
  s+=Th(m1[0],m1[1]-8,esc(o.d1||"d1"),"v-lab s a","middle")+Th(m2[0],m2[1]+18,esc(o.d2||"d2"),"v-lab s a","middle");
  if(!hp) s+=T(S1[0]-8,S1[1]-8,"S1","v-lab s","end")+T(S2[0]-8,S2[1]+18,"S2","v-lab s","end");
  if(o.b) s+=vcote(S1[0]+16,S1[1],S2[1],esc(o.b),"start");
  return svg(214,s,o.alt||(hp?"Deux haut-parleurs alimentés par le même générateur et un microphone M":"Deux fentes S1 et S2 éclairées par un laser et un point M de l'écran"));
}
/* effet Doppler : fronts d'onde émis par une source en mouvement ; o.dir (+1 vers la droite, −1 vers la gauche), o.r (rapport v_S / v) */
function fx_ond_doppler(o){
  const n=6, st=15, xs=200+o.dir*34, y=100, vr=o.r||0.4;
  let s="";
  for(let k=n;k>=1;k--){ const cx=xs-o.dir*vr*st*k; s+=`<circle cx="${cx.toFixed(1)}" cy="${y}" r="${(st*k).toFixed(1)}" class="v-thin" style="stroke:var(--accent);opacity:${(1-k*0.1).toFixed(2)}"/>`; }
  s+=`<circle cx="${xs}" cy="${y}" r="5" class="v-dot"/>`+L(xs,y,xs+o.dir*44,y,"v-t","c")+Th(xs+o.dir*50,y-8,"v_S","v-lab s c",o.dir>0?"start":"end")+Th(xs,y+22,"S","v-lab s","middle");
  const ob=(x,t)=>`<circle cx="${x}" cy="${y}" r="7" class="v-wheel"/>`+T(x,y+26,t,"v-lab","middle");
  s+=ob(28,o.labL||"B")+ob(372,o.labR||"A");
  if(o.cap) s+=T(200,196,esc(o.cap),"v-cap","middle");
  return svg(o.cap?204:196,s,o.alt||"Fronts d'onde émis par une source S en mouvement, deux observateurs A et B");
}
/* sonorisation en plein air : enceintes de façade, enceinte de rappel à la distance o.dt, spectateur (o.dp : cote facultative) */
function fx_ond_tour(o){
  const y=150, xf=94, xt=214, xp=346;
  let s=ground(8,392,y);
  s+=`<rect x="12" y="${y-34}" width="70" height="34" class="v-body"/>`+T(47,y-12,"scène","v-cap","middle");
  s+=`<rect x="${xf-12}" y="${y-86}" width="16" height="52" rx="2" class="v-box"/>`+T(xf-4,y-94,"façade","v-cap","middle");
  s+=L(xt,y,xt,y-60,"v-ink")+`<rect x="${xt-8}" y="${y-92}" width="16" height="32" rx="2" class="v-box"/>`+T(xt,y-100,"enceinte de rappel","v-cap","middle");
  for(let k=0;k<3;k++){ const r=8+k*6; s+=`<path d="M${xt+8+r*0.5} ${(y-76-r*0.87).toFixed(1)} A${r} ${r} 0 0 1 ${xt+8+r*0.5} ${(y-76+r*0.87).toFixed(1)}" class="v-thin"/>`; }
  s+=`<circle cx="${xp}" cy="${y-48}" r="7" class="v-wheel"/>`+L(xp,y-41,xp,y-16,"v-ink")+L(xp,y-16,xp-7,y,"v-ink")+L(xp,y-16,xp+7,y,"v-ink")+L(xp-9,y-32,xp+9,y-32,"v-ink")+T(xp,y-62,"spectateur","v-cap","middle");
  s+=L(xf,y+2,xf,y+(o.dp?50:28),"v-dash")+L(xt,y+2,xt,y+28,"v-dash")+cote(xf,xt,y+24,o.dt||"d");
  if(o.dp) s+=L(xp,y+2,xp,y+50,"v-dash")+cote(xf,xp,y+46,o.dp);
  return svg(y+(o.dp?56:34),s,o.alt||"Sonorisation en plein air : façade, enceinte de rappel et spectateur");
}

/* ======================================================================
   ONDES, SON, INTERFÉRENCES — phy-ondes
   ====================================================================== */
const VAIR=340, VEAU=1500, VACIER=5900;
const CEL=`Célérités du son : ${F("v(air) = 340 m/s")} ; ${F("v(eau de mer) = 1 500 m/s")} ; ${F("v(acier) = 5 900 m/s")}.`;
const I0T=`I₀ = ${p10(-12)} W/m²`;
/* durée affichée avec son unité : s, ms ou µs */
const tAff=t=>t>=1?`${nf(+t.toPrecision(3),3)} s`:t>=1e-3?`${nf(+(t*1e3).toPrecision(3),3)} ms`:`${nf(+(t*1e6).toPrecision(3),3)} µs`;
const DOMF=["Infrasons (f &lt; 20 Hz)","Sons audibles (20 Hz à 20 kHz)","Ultrasons (f > 20 kHz)"];
const domOf=f=>f<20?0:f<=20000?1:2;
const fAff=f=>f>=1e6?`${nf(f/1e6,2)} MHz`:f>=1e3?`${nf(f/1e3,2)} kHz`:`${nf(f,2)} Hz`;
const TRL=["Transversale : la perturbation est perpendiculaire à la direction de propagation","Longitudinale : la perturbation est parallèle à la direction de propagation"];
const CONSDES=["Constructives : l'amplitude de l'onde résultante est maximale en M","Destructives : l'amplitude de l'onde résultante est minimale en M"];
const DOPCH=["La fréquence perçue est plus grande que la fréquence émise (son plus aigu)","La fréquence perçue est plus petite que la fréquence émise (son plus grave)","La fréquence perçue est égale à la fréquence émise"];
/* questions de cours */
const COURS_OND=[
  ["Qu'est-ce qu'une onde mécanique progressive transporte ?","De l'énergie, sans transport de matière",["De la matière et de l'énergie","De la matière, sans énergie","Rien : seule la forme de la perturbation se déplace"],"Chaque point du milieu s'écarte un peu de sa position puis y revient : il n'y a pas de transport de matière. Ce qui se propage, c'est la perturbation et l'énergie qu'elle transporte : c'est pourquoi un son fort peut briser une vitre."],
  ["Le son peut-il se propager dans le vide ?","Non : c'est une onde mécanique, il lui faut un milieu matériel",["Oui, comme la lumière","Oui, mais plus lentement que dans l'air","Seuls les ultrasons se propagent dans le vide"],"Le son est une perturbation (compressions et dilatations) de la matière : sans matière, pas de son. La lumière, onde électromagnétique, n'a pas besoin de milieu matériel."],
  ["Dans lequel de ces milieux le son se propage-t-il le plus vite ?","Dans l'acier",["Dans l'air","Dans l'eau","Il a la même célérité dans tous les milieux"],`Le son va plus vite dans les solides et les liquides que dans les gaz : environ 340 m/s dans l'air, 1 500 m/s dans l'eau de mer et 5 900 m/s dans l'acier.`],
  ["Un son passe de l'air dans l'eau. Quelle grandeur ne change pas ?","Sa fréquence",["Sa célérité","Sa longueur d'onde","Sa célérité et sa longueur d'onde"],`La fréquence est imposée par la source : elle ne dépend pas du milieu. La célérité augmente dans l'eau, donc ${F(`λ = ${FRAC("v","f")}`)} augmente aussi.`],
  ["Dans l'air, on double la fréquence d'un son. Que devient sa longueur d'onde ?","Elle est divisée par 2",["Elle est multipliée par 2","Elle ne change pas","Elle est multipliée par 4"],`Dans un même milieu, la célérité v ne change pas : ${F(`λ = ${FRAC("v","f")}`)} est divisée par 2 quand f est multipliée par 2.`],
  ["Que mesure un sonomètre ?","Le niveau d'intensité sonore, en décibels (dB)",["L'intensité sonore, en décibels (dB)","La fréquence du son, en hertz (Hz)","La célérité du son, en m/s"],`Le sonomètre affiche ${F(`L = 10·log(${FRAC("I","I₀")})`)}, en dB. L'intensité sonore I, elle, s'exprime en W/m².`],
  ["Deux sons ont la même fréquence mais des amplitudes différentes. Qu'est-ce qui les distingue à l'oreille ?","Leur niveau sonore : l'un est plus fort que l'autre",["Leur hauteur : l'un est plus aigu que l'autre","Rien, l'oreille ne les distingue pas","Leur célérité dans l'air"],"La hauteur d'un son (grave ou aigu) dépend de sa fréquence ; l'amplitude fixe l'intensité, donc le niveau sonore perçu (fort ou faible)."],
  ["Quand la largeur a d'une fente diminue, que devient l'écart angulaire θ de diffraction ?","Il augmente : la tache centrale s'élargit",["Il diminue : la tache centrale rétrécit","Il ne change pas","Il s'annule"],`${F(`θ ≈ ${FRAC("λ","a")}`)} : θ est inversement proportionnel à a. Plus l'ouverture est étroite, plus l'onde s'étale.`]
];

const OND1=[
  /* célérité : v = d / Δt */
  ()=>{ const S=rnd([
      {c:d=>`Deux capteurs sont fixés sur un rail en acier, à ${nf(d,0)} m l'un de l'autre. Un coup de marteau frappe le rail dans l'alignement des capteurs : l'onde atteint le second capteur avec un retard`,d:[6,8,10,12,15],v:[5800,6000]},
      {c:d=>`Deux microphones sont placés à ${nf(d,2)} m l'un de l'autre, alignés avec la source. Un claquement de mains atteint le second microphone avec un retard`,d:[1.2,1.5,1.8,2,2.5,3],v:[338,350]},
      {c:d=>`Une perturbation se propage le long d'une corde tendue. Elle passe par deux repères distants de ${nf(d,2)} m avec un retard`,d:[1.5,2,2.4,3,4],v:[6,15]},
      {c:d=>`Une onde sismique est enregistrée par deux stations placées sur sa direction de propagation, à ${nf(d,0)} km l'une de l'autre. La seconde station l'enregistre avec un retard`,d:[30,45,60,80,120],v:[5500,6500],km:1},
      {c:d=>`Au large du récif, la houle passe devant deux bouées alignées dans sa direction de propagation, distantes de ${nf(d,0)} m, avec un retard`,d:[40,60,80,100],v:[8,14]}]);
    const d=rnd(S.d), dm=S.km?d*1000:d, vt=S.v[0]+Math.random()*(S.v[1]-S.v[0]), t0=dm/vt, ms=t0<1;
    const td=+(ms?t0*1000:t0).toPrecision(3), ts=ms?td/1000:td, v=dm/ts;
    return {ctx:`${S.c(d)} Δt = ${nf(td,3)} ${ms?"ms":"s"}.`,q:"Calcule la célérité de cette onde.",type:"num",ans:v,tolR:0.02,unit:"m/s",
      expl:`${ms?`Δt = ${nf(td,3)} ms = ${nf(ts,6)} s. `:""}${S.km?`d = ${nf(d,0)} km = ${nf(dm,0)} m. `:""}${F(`v = ${FRAC("d","Δt")}`)} = ${FRAC(`${nf(dm,2)} m`,`${nf(ts,6)} s`)} = ${U(v,"m/s")}.`}; },
  /* retard d'un son, distance d'un orage */
  ()=>{ const t=ri(0,2);
    if(t===0){ const dt=rnd([2.5,3,4.5,6,7.5,9,12]), d=VAIR*dt;
      return {ctx:"Pendant un orage, tu vois l'éclair puis tu entends le tonnerre. La lumière parcourt quelques kilomètres en quelques microsecondes : son trajet est pratiquement instantané. Célérité du son dans l'air : v = 340 m/s.",
        q:`Le tonnerre arrive ${nf(dt,1)} s après l'éclair. À quelle distance la foudre est-elle tombée, en km ?`,type:"num",ans:d/1000,tolR:0.02,unit:"km",
        expl:`Le son met Δt = ${nf(dt,1)} s pour parcourir la distance d : ${F("d = v·Δt")} = 340 × ${nf(dt,1)} = ${nf(d,0)} m, soit ${U(d/1000,"km")}.`}; }
    if(t===1){ const d=rnd([34,51,68,85,102,136,170]), dt=d/VAIR;
      return {ctx:`Pendant le Heiva, un spectateur est assis à ${d} m de la scène. Il voit le batteur frapper son pahu avant de l'entendre. Célérité du son dans l'air : v = 340 m/s ; la lumière arrive pratiquement instantanément.`,
        q:"Quel est le retard du son sur l'image, en ms ?",type:"num",ans:dt*1000,tolR:0.02,unit:"ms",
        expl:`Le retard est la durée de propagation du son : ${F(`Δt = ${FRAC("d","v")}`)} = ${FRAC(`${d} m`,"340 m/s")} = ${nf(dt,4)} s, soit ${U(dt*1000,"ms")}.`}; }
    const d=rnd([100,200,400]), dt=d/VAIR;
    return {ctx:`Sur une course de ${d} m en ligne droite, un chronométreur placé sur la ligne d'arrivée déclenche son chronomètre en entendant le coup de pistolet du départ, au lieu de regarder la fumée. Célérité du son dans l'air : v = 340 m/s.`,
      q:"De combien de secondes le temps qu'il mesure est-il faussé ?",type:"num",ans:dt,tolR:0.02,unit:"s",
      expl:`Le son met ${F(`Δt = ${FRAC("d","v")}`)} = ${FRAC(`${d} m`,"340 m/s")} = ${U(dt,"s")} à parcourir la piste : le chronomètre démarre trop tard et le temps mesuré est trop court d'autant, ce qui est énorme pour un sprint.`}; },
  /* longueur d'onde : λ = v / f */
  ()=>{ const S=rnd([
      {c:"Le télémètre d'un robot émet des ultrasons dans l'air (v = 340 m/s) à la fréquence",f:[40000],v:VAIR},
      {c:"Le sondeur d'un bonitier émet des ultrasons dans l'eau de mer (v = 1 500 m/s) à la fréquence",f:[50000,83000,200000],v:VEAU},
      {c:"Un diapason émet dans l'air (v = 340 m/s) la note la, de fréquence",f:[440],v:VAIR},
      {c:"La sirène d'une ambulance émet dans l'air (v = 340 m/s) un son de fréquence",f:[680,850,1000,1360],v:VAIR},
      {c:"Une baleine à bosse émet dans l'eau de mer (v = 1 500 m/s) un son de fréquence",f:[150,300,500],v:VEAU},
      {c:"Une sonde d'échographie émet des ultrasons dans les tissus du corps humain (v = 1 540 m/s) à la fréquence",f:[2e6,3.5e6,5e6],v:1540}]);
    const f=rnd(S.f), lam=S.v/f, mm=lam<0.1, a=mm?lam*1000:lam;
    return {ctx:`${S.c} f = ${fAff(f)}.`,q:`Calcule la longueur d'onde λ de cette onde, en ${mm?"mm":"m"}.`,type:"num",ans:a,tolR:0.02,unit:mm?"mm":"m",
      expl:`${F(`λ = v·T = ${FRAC("v","f")}`)}${f>=1000?` avec f = ${fAff(f)} = ${nf(f,0)} Hz`:""} : λ = ${FRAC(`${nf(S.v,0)} m/s`,`${nf(f,0)} Hz`)} = ${mm?`${nf(lam,6)} m, soit ${U(a,"mm")}`:U(a,"m")}.`}; },
  /* domaines de fréquences : infrasons, sons audibles, ultrasons */
  ()=>{ const S=rnd([["une chauve-souris qui chasse",50000],["un sifflet à ultrasons pour chiens",25000],["un séisme lointain",5],["la sirène d'une ambulance",950],
      ["une baleine à bosse qui chante",350],["le télémètre à ultrasons d'un robot",40000],["un éléphant qui appelle son troupeau",14],["un diapason (note la)",440],["un moteur électrique qui siffle",12000],
      ["la sonde d'un échographe",3.5e6],["les pales d'une éolienne",1]]);
    const f=S[1], k=domOf(f), useT=Math.random()<0.4;
    if(useT){ const T=1/f, Ts=tAff(T);
      return {q:`La période de l'onde sonore émise par ${S[0]} vaut T = ${Ts}. Dans quel domaine se situe cette onde ?`,type:"ch",ch:DOMF,ok:k,
        expl:`${F(`f = ${FRAC("1","T")}`)} = ${fAff(f)}. Domaine audible : de 20 Hz à 20 kHz ; en dessous, infrasons ; au-dessus, ultrasons. Ici : ${F(DOMF[k].split(" (")[0].toLowerCase())}.`}; }
    return {q:`L'onde sonore émise par ${S[0]} a une fréquence f = ${fAff(f)}. Dans quel domaine se situe-t-elle ?`,type:"ch",ch:DOMF,ok:k,
      expl:`L'oreille humaine perçoit les sons de 20 Hz à 20 kHz. En dessous : infrasons ; au-dessus : ultrasons. ${fAff(f)} : ${F(DOMF[k].split(" (")[0].toLowerCase())}.`}; },
  /* onde transversale ou longitudinale */
  ()=>{ const S=rnd([["Une perturbation se propage le long d'une corde tendue : chaque point de la corde monte puis redescend.",0],["Un son se propage dans l'air : l'air est successivement comprimé puis dilaté.",1],
      ["On comprime brusquement quelques spires à l'extrémité d'un long ressort : la compression se propage le long du ressort.",1],["Dans les tribunes d'un stade, chaque spectateur se lève puis se rassoit juste après son voisin : la « ola » fait le tour du stade.",0],
      ["Une onde sismique P comprime et dilate les roches dans la direction où elle se propage.",1],["Une onde sismique S déplace les roches perpendiculairement à la direction où elle se propage.",0],["Les ultrasons émis par le sondeur d'un bateau se propagent dans l'eau jusqu'au fond.",1]]);
    return {ctx:S[0],q:"Cette onde est-elle transversale ou longitudinale ?",type:"ch",ch:TRL,ok:S[1],
      expl:S[1]?`Les points du milieu se déplacent dans la direction de propagation (compressions et dilatations) : l'onde est ${F("longitudinale")}. C'est le cas de toutes les ondes sonores.`
                :`Les points du milieu se déplacent perpendiculairement à la direction de propagation : l'onde est ${F("transversale")}.`}; },
  /* questions de cours */
  ()=>{ const [q,ok,w,ex]=rnd(COURS_OND); return {q,type:"ch",...mcu(ok,shuffle(w)),expl:ex}; },
  /* lire une période sur un oscillogramme */
  ()=>{ const O=rnd([[0.5,"ms",2],[0.2,"ms",2.5],[1,"ms",2.5],[0.1,"ms",4],[5,"µs",5],[10,"µs",2.5],[2,"ms",2.5],[0.2,"ms",4],[0.5,"ms",4],[1,"ms",4]]);
    const [tb,u,Td]=O, T=tb*Td, n=Math.floor(10/Td+1e-9), S=u==="µs"?"le signal reçu par le récepteur d'un télémètre à ultrasons":rnd(["la tension délivrée par un microphone placé devant un haut-parleur","la tension délivrée par un capteur de vibrations","le signal d'un générateur qui alimente un haut-parleur"]);
    const fig=fx_ond_oscillo({tb:`${nf(tb,1)} ${u}/div`,tr:[{f:sigSin(2.6,Td,0),y0:4,lab:"1"}]});
    return {fig,ctx:`L'oscilloscope affiche ${S}.`,q:`Détermine la période T de ce signal, en ${u}.`,type:"num",ans:T,tolR:0.02,unit:u,
      expl:`On compte ${n} périodes sur ${nf(n*Td,1)} divisions (plus précis qu'une seule) : une période occupe ${nf(Td,1)} div. T = nombre de divisions × base de temps = ${nf(Td,1)} div × ${nf(tb,1)} ${u}/div = ${U(T,u)}.`}; },
  /* niveau d'intensité sonore à partir de l'intensité */
  ()=>{ const S=rnd([["dans une chambre calme, la nuit",25,35],["à 1 m d'une conversation",55,65],["au bord d'une route fréquentée",70,80],["à côté d'une tondeuse à gazon",86,95],["près d'un groupe électrogène",80,92],["au pied d'une enceinte de concert",100,110]]);
    const [m,k]=draw(()=>[rnd([1,2,2.5,3.2,4,5,6.3,8]),ri(-10,-1)],([m,k])=>{ const L=10*(lg(m)+k+12); return L>=S[1]&&L<=S[2]; }), I=m*10**k, L=Lv(I);
    return {ctx:`Un sonomètre est placé ${S[0]}. L'intensité sonore y vaut I = ${sci(I,1)} W/m². Intensité de référence : ${I0T}.`,
      q:"Calcule le niveau d'intensité sonore L.",type:"num",ans:L,tolA:0.2,unit:"dB",
      expl:`${F(`L = 10·log(${FRAC("I","I₀")})`)} = 10 × log(${FRAC(sci(I,1),p10(-12))}) = 10 × log(${sci(I/1e-12,1)}) = ${U(L,"dB")}.`}; },
  /* plusieurs sources identiques */
  ()=>{ const S=rnd(["une scie circulaire","un compresseur","une ponceuse","un ventilateur industriel","une enceinte"]), L1=rnd([62,70,76,80,85,88]), N=rnd([2,2,2,4,10]), dl=N===2?3:N===4?6:10;
    const ok=`${L1+dl} dB`, w=[`${N*L1} dB`,`${L1} dB`,`${L1+(N===2?6:N===4?12:20)} dB`];
    return {ctx:`À ton poste de travail, ${S} seul${S.startsWith("une")?"e":""} produit un niveau sonore de ${L1} dB. On met en marche, au même endroit, ${N===2?"un deuxième appareil identique":`${N} appareils identiques au total`}.`,
      q:"Quel niveau sonore mesures-tu alors ?",type:"ch",...mcu(ok,w),
      expl:`Ce sont les intensités qui s'additionnent : ${F(`I = ${N}·I₁`)}, donc L = 10·log(${FRAC(`${N}·I₁`,"I₀")}) = L₁ + 10·log(${N}) = ${L1} + ${nf(10*lg(N),1)} ≈ ${F(ok)}. Les niveaux en dB ne s'additionnent jamais.`}; },
  /* télémètre à ultrasons : d = v·Δt / 2 */
  ()=>{ const S=rnd([
      {c:"Le capteur à ultrasons d'un robot de sumo mesure la durée de l'écho renvoyé par le robot adverse",o:"robot adverse",d:[0.12,0.6]},
      {c:"Le capteur de recul d'une voiture mesure la durée de l'écho renvoyé par un muret",o:"muret",d:[0.3,1.8]},
      {c:"Un capteur à ultrasons fixé au sommet d'une citerne d'eau de pluie mesure la durée de l'écho renvoyé par la surface de l'eau",o:"surface de l'eau",d:[0.3,1.6]}]);
    const d0=S.d[0]+Math.random()*(S.d[1]-S.d[0]), dt=+(2*d0/VAIR*1000).toPrecision(3), d=VAIR*dt/1000/2, cm=d<1;
    return {fig:fx_ond_telem({obs:S.o,d:"d = ?"}),ctx:`${S.c} : Δt = ${nf(dt,3)} ms entre l'émission de la salve et la réception de l'écho. Célérité du son dans l'air : v = 340 m/s.`,
      q:`À quelle distance se trouve ${S.o==="robot adverse"?"le robot adverse":S.o==="muret"?"le muret":"la surface de l'eau"}, en ${cm?"cm":"m"} ?`,type:"num",ans:cm?d*100:d,tolR:0.02,unit:cm?"cm":"m",
      expl:`Pendant Δt, l'onde fait l'aller et le retour : elle parcourt 2d. ${F(`d = ${FRAC("v·Δt","2")}`)} = ${FRAC(`340 × ${nf(dt/1000,6)}`,"2")} = ${nf(d,4)} m${cm?`, soit ${U(d*100,"cm")}`:` ≈ ${U(d,"m")}`}.`}; },
  /* diffraction : θ = λ / a */
  ()=>{ const lam=rnd([405,532,633,650]), a=rnd([0.05,0.08,0.1,0.12,0.15,0.2]), th=lam*1e-9/(a*1e-3);
    const col={405:"violet",532:"vert",633:"rouge",650:"rouge"}[lam], [m,e]=me(th,2), M=e2=>`${nf(m,2)} × ${p10(e2)} rad`;
    return {ctx:`Un faisceau laser ${col} de longueur d'onde λ = ${lam} nm traverse une fente de largeur a = ${nf(a,2)} mm.`,q:"Que vaut l'écart angulaire θ du faisceau diffracté ?",type:"ch",grid:true,
      ...mcu(M(e),[M(e+6),`${sci(a*1e-3/(lam*1e-9),2)} rad`,M(e-3)]),
      expl:`${F(`θ ≈ ${FRAC("λ","a")}`)} avec λ et a dans la même unité : λ = ${lam} × ${p10(-9)} m et a = ${nf(a,2)} × ${p10(-3)} m. θ = ${FRAC(`${lam} × ${p10(-9)}`,`${nf(a,2)} × ${p10(-3)}`)} = ${F(M(e))}. Diviser directement ${lam} par ${nf(a,2)} donnerait une valeur 10<sup>6</sup> fois trop grande.`}; },
  /* interférences : constructives ou destructives ? */
  ()=>{ const t=ri(0,2), half=Math.random()<0.5, k=ri(half?0:1,3), r=k+(half?0.5:0);
    let ctx, dl, lt;
    if(t===0){ const lam=rnd([0.4,0.5,0.68,0.85,1.36]); dl=r*lam; lt=`λ = ${nf(lam,2)} m`; ctx=`Deux haut-parleurs alimentés par le même générateur émettent le même son (λ = ${nf(lam,2)} m). Au point M, la différence des distances aux deux haut-parleurs vaut δ = d2 − d1 = ${nf(dl,3)} m.`; }
    else if(t===1){ const lam=rnd([500,600,640]); dl=r*lam/1000; lt=`λ = ${lam} nm`; ctx=`Deux fentes éclairées par un même laser (λ = ${lam} nm) se comportent comme deux sources cohérentes. Au point M de l'écran, la différence de marche vaut δ = ${nf(dl,3)} µm.`; }
    else { const lam=rnd([0.8,1.2,1.5,2]); dl=r*lam; lt=`λ = ${nf(lam,1)} cm`; ctx=`Dans une cuve à ondes, deux pointes frappent la surface de l'eau en même temps (λ = ${nf(lam,1)} cm). Au point M, la différence des distances aux deux pointes vaut δ = ${nf(dl,2)} cm.`; }
    return {ctx,q:"Quelle est la nature des interférences au point M ?",type:"ch",ch:CONSDES,ok:half?1:0,
      expl:`On compare δ à λ (même unité) : ${FRAC("δ","λ")} = ${nf(r,1)}. ${half?`C'est un nombre demi-entier : ${F("δ = (k + ½)·λ")}, les deux ondes arrivent en opposition de phase, les interférences sont destructives.`:`C'est un nombre entier : ${F("δ = k·λ")}, les deux ondes arrivent en phase, les interférences sont constructives.`}`}; },
  /* effet Doppler : sens du décalage */
  ()=>{ if(Math.random()<0.45){ const dir=rnd([1,-1]);
      return {fig:fx_ond_doppler({dir,r:0.4}),ctx:"La figure montre les fronts d'onde successifs émis par une source sonore S qui se déplace à la vitesse v_S. Les observateurs A et B sont immobiles.",
        q:"Quel observateur perçoit le son de plus grande fréquence ?",type:"ch",ch:["L'observateur A","L'observateur B","A et B perçoivent la même fréquence"],ok:dir>0?0:1,
        expl:`La source se rapproche de ${dir>0?"A":"B"} : du côté où elle avance, les fronts d'onde sont resserrés (longueur d'onde plus courte), ils arrivent plus souvent. ${F(`f_R > f_E`)} pour ${dir>0?"A":"B"} (son plus aigu) et f_R &lt; f_E pour ${dir>0?"B":"A"} (son plus grave) : c'est l'effet Doppler.`}; }
    const S=rnd([["Une ambulance, sirène allumée, s'approche de toi à vitesse constante.",0],["Une moto s'éloigne de toi à vitesse constante.",1],["Un drone qui bourdonne passe au-dessus de toi, puis s'éloigne.",1],
      ["Une chauve-souris vole vers un insecte immobile et reçoit l'écho de son cri.",0],["Un camion klaxonne en roulant vers un piéton immobile.",0],["Un bateau à moteur s'éloigne du quai où tu te trouves.",1]]);
    return {ctx:S[0],q:"Comment la fréquence perçue se compare-t-elle à la fréquence émise ?",type:"ch",ch:DOPCH,ok:S[1],
      expl:S[1]?`L'émetteur s'éloigne du récepteur : les fronts d'onde arrivent plus espacés, ${F("f_R &lt; f_E")}, le son paraît plus grave.`
                :`L'émetteur et le récepteur se rapprochent : les fronts d'onde arrivent resserrés, ${F("f_R > f_E")}, le son paraît plus aigu (effet Doppler).`}; }
];

/* intensité affichée en mW/m² ou µW/m² */
const Iu=I=>I>=1e-3?[I*1e3,"mW/m²"]:[I*1e6,"µW/m²"];
const OND2=[
  /* oscillogramme émission / réception : retard puis distance ou célérité */
  ()=>{ const tb=rnd([0.2,0.5,1]), n=draw(()=>ri(10,38)/5,x=>x>=2&&x<=7.6), dt=n*tb, echo=Math.random()<0.6;
    const fig=fx_ond_oscillo({tb:`${nf(tb,1)} ms/div`,tr:[{f:sigSalve(1.4,1,1.2),y0:2,lab:"1"},{f:sigSalve(0.8,1+n,1.4),y0:6,c:1,lab:"2"}],leg:["Voie 1 : salve émise · voie 2 : salve reçue"]});
    const q1={q:"Détermine le retard Δt de la salve reçue sur la salve émise, en ms.",type:"num",ans:dt,tolR:0.02,unit:"ms",
      expl:`On mesure l'écart entre les débuts des deux salves : ${nf(n,1)} div. Δt = ${nf(n,1)} div × ${nf(tb,1)} ms/div = ${U(dt,"ms")}.`};
    if(echo){ const d=VAIR*dt/1000/2;
      return [{fig,ctx:"Un émetteur et un récepteur d'ultrasons, placés côte à côte, sont tournés vers un mur. L'oscilloscope affiche la salve émise (voie 1) et l'écho reçu (voie 2). Célérité du son dans l'air : v = 340 m/s.",...q1},
        {q:"À quelle distance du capteur le mur se trouve-t-il, en cm ?",type:"num",ans:d*100,tolR:0.02,unit:"cm",
          expl:`L'onde fait l'aller et le retour : ${F(`d = ${FRAC("v·Δt","2")}`)} = ${FRAC(`340 × ${nf(dt/1000,5)}`,"2")} = ${nf(d,4)} m = ${U(d*100,"cm")}.`}]; }
    const vt=338+Math.random()*10, dcm=Math.round(vt*dt/10), v=dcm/100/(dt/1000);
    return [{fig,ctx:`Un émetteur et un récepteur d'ultrasons sont placés face à face, à d = ${dcm} cm l'un de l'autre. L'oscilloscope affiche la salve émise (voie 1) et la salve reçue (voie 2).`,...q1},
      {q:"Calcule la célérité des ultrasons dans l'air de la salle.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`L'onde parcourt une seule fois la distance d : ${F(`v = ${FRAC("d","Δt")}`)} = ${FRAC(`${nf(dcm/100,2)} m`,`${nf(dt/1000,5)} s`)} = ${U(v,"m/s")}.`}]; },
  /* période lue sur l'oscillogramme, puis fréquence et longueur d'onde */
  ()=>{ const O=rnd([[0.5,"ms",2],[0.2,"ms",2.5],[1,"ms",2.5],[0.1,"ms",4],[5,"µs",5],[10,"µs",2.5],[2,"ms",2.5],[0.2,"ms",4],[0.5,"ms",4]]), [tb,u,Td]=O;
    const Ts=Td*tb*(u==="ms"?1e-3:1e-6), f=1/Ts, water=u==="ms"&&Math.random()<0.35, v=water?VEAU:VAIR;
    const src=u==="µs"?"le signal reçu par le récepteur d'un télémètre à ultrasons, dans l'air":water?"le signal d'un hydrophone qui capte, dans l'eau de mer, le son émis par un haut-parleur immergé":"le signal d'un microphone qui capte, dans l'air, le son émis par un haut-parleur";
    const fig=fx_ond_oscillo({tb:`${nf(tb,1)} ${u}/div`,tr:[{f:sigSin(2.4,Td,0),y0:4,lab:"1"}]}), kHz=f>=1e4, lam=v/f, mm=lam<0.1;
    const ctx=`L'oscilloscope affiche ${src}. Célérité du son : ${water?"1 500 m/s dans l'eau de mer":"340 m/s dans l'air"}.`;
    return [{fig,ctx,q:`Détermine la fréquence f du signal, en ${kHz?"kHz":"Hz"}.`,type:"num",ans:kHz?f/1e3:f,tolR:0.02,unit:kHz?"kHz":"Hz",
        expl:`Une période occupe ${nf(Td,1)} div : T = ${nf(Td,1)} × ${nf(tb,1)} ${u} = ${nf(Td*tb,2)} ${u} = ${sci(Ts,2)} s. ${F(`f = ${FRAC("1","T")}`)} = ${kHz?`${nf(f,0)} Hz = ${U(f/1e3,"kHz")}`:U(f,"Hz")}.`},
      {q:`Calcule la longueur d'onde de ce son, en ${mm?"mm":"m"}.`,type:"num",ans:mm?lam*1000:lam,tolR:0.02,unit:mm?"mm":"m",
        expl:`${F(`λ = ${FRAC("v","f")}`)} = ${FRAC(nf(v,0),nf(f,0))} = ${mm?`${nf(lam,5)} m = ${U(lam*1000,"mm")}`:U(lam,"m")}.`}]; },
  /* corde : longueur d'onde lue sur la figure, puis célérité */
  ()=>{ const G=rnd([{xm:1.2,xs:0.1,L:[0.2,0.3,0.4],u:"m",k:1},{xm:3,xs:0.25,L:[0.5,0.75,1],u:"m",k:1},{xm:60,xs:5,L:[10,15,20],u:"cm",k:0.01}]);
    const lam=rnd(G.L), nw=Math.floor((G.xm-G.xs)/lam+1e-9), kk=Math.min(nw,rnd([2,3])), c0=G.xs*ri(0,Math.max(0,Math.round((G.xm-kk*lam)/G.xs)-1)), lm=lam*G.k;
    const f=draw(()=>rnd([5,8,10,12,20,25,40,50]),f=>lm*f>=3&&lm*f<=40), v=lm*f;
    const fig=fx_ond_corde({xm:G.xm,xs:G.xs,lam,c0,u:G.u,cote:{a:c0,b:c0+kk*lam,t:`${kk} λ`}});
    const ctx=`Un vibreur S impose à l'extrémité d'une corde des oscillations sinusoïdales de fréquence f = ${f} Hz. La figure montre l'aspect de la corde à un instant donné.`;
    return [{fig,ctx,q:`Détermine la longueur d'onde λ, en ${G.u}.`,type:"num",ans:lam,tolR:0.02,unit:G.u,
        expl:`La cote s'étend d'une crête à une autre, sur ${kk} longueurs d'onde : de x = ${nf(c0,2)} ${G.u} à x = ${nf(c0+kk*lam,2)} ${G.u}. ${kk} λ = ${nf(kk*lam,2)} ${G.u}, donc λ = ${U(lam,G.u)}. Mesurer plusieurs λ d'un coup est plus précis.`},
      {q:"Calcule la célérité de l'onde le long de la corde.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`${G.u==="cm"?`λ = ${nf(lam,0)} cm = ${nf(lm,2)} m. `:""}${F("v = λ·f")} = ${nf(lm,2)} × ${f} = ${U(v,"m/s")}.`}]; },
  /* mesure de λ au laboratoire avec deux microphones */
  ()=>{ const f=rnd([2000,2500,3000,4000,5000]), vt=338+Math.random()*10, N=rnd([5,6,8,10]), Dmm=Math.round(N*vt/f*1000), lam=Dmm/N/1000, v=lam*f;
    const ctx=`Un haut-parleur émet un son de fréquence f = ${nf(f,0)} Hz. Deux microphones placés devant lui, sur le même axe, sont reliés à un oscilloscope ; au départ, les deux signaux sont en phase. On éloigne lentement le microphone 2 en comptant les retours en phase : au ${N}e retour en phase, il a été déplacé de D = ${nf(Dmm/10,1)} cm.`;
    return [{ctx,q:"Détermine la longueur d'onde λ du son, en cm.",type:"num",ans:lam*100,tolR:0.02,unit:"cm",
        expl:`Les signaux sont à nouveau en phase chaque fois que le micro 2 recule d'une longueur d'onde : ${F("D = N·λ")}, donc λ = ${FRAC(`${nf(Dmm/10,1)} cm`,N)} = ${U(lam*100,"cm")}.`},
      {q:"Calcule la célérité du son dans l'air de la salle.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`${F("v = λ·f")} = ${nf(lam,5)} × ${nf(f,0)} = ${U(v,"m/s")}.`}]; },
  /* sondeur : profondeur de l'eau */
  ()=>{ const e=rnd([0.4,0.5,0.6,0.8]), H0=draw(()=>3+Math.random()*57,h=>h>e+2), dt=+(2*(H0-e)/VEAU*1000).toPrecision(3), h=VEAU*dt/1000/2, H=h+e;
    const b=rnd(["d'un bonitier","d'une navette de lagon","d'un voilier","d'un bateau de pêche"]);
    return {fig:fx_ond_sondeur({b:`bateau`,h:"h"}),ctx:`Le sondeur ${b} est fixé sous la coque, à ${nf(e,1)} m sous la surface. Il mesure Δt = ${nf(dt,3)} ms entre l'émission d'une salve d'ultrasons et la réception de l'écho renvoyé par le fond. Célérité des ultrasons dans l'eau de mer : v = 1 500 m/s.`,
      q:"Quelle est la profondeur de l'eau à cet endroit, de la surface au fond ?",type:"num",ans:H,tolR:0.02,unit:"m",
      expl:`Distance sonde–fond : ${F(`h = ${FRAC("v·Δt","2")}`)} = ${FRAC(`1 500 × ${nf(dt/1000,6)}`,"2")} = ${nf(h,3)} m (aller-retour). On ajoute la profondeur de la sonde : ${nf(h,3)} + ${nf(e,1)} = ${U(H,"m")}.`}; },
  /* intensité sonore à partir du niveau */
  ()=>{ const S=rnd([["dans une salle de classe bruyante",[62,66,68]],["au bord d'une route",[72,74,77]],["près d'une ponceuse",[85,88,92]],["au premier rang d'un concert",[98,103,106]],["dans un bureau calme",[42,45,48]]]);
    const L=rnd(S[1]), I=Iv(L), wrong=[`${sci(10**(L/10),2)} W/m²`,`${sci(1e-12*L/10,2)} W/m²`,`${sci(I*10,2)} W/m²`,`${sci(I/10,2)} W/m²`];
    return {ctx:`Un sonomètre placé ${S[0]} indique L = ${L} dB. ${I0T}.`,q:"Quelle est l'intensité sonore I à cet endroit ?",type:"ch",grid:true,...mcu(`${sci(I,2)} W/m²`,wrong),
      expl:`${F(`L = 10·log(${FRAC("I","I₀")})`)}, donc ${F(`I = I₀·10^(${FRAC("L","10")})`)} = ${p10(-12)} × 10<sup>${nf(L/10,1)}</sup> = 10<sup>${nf(L/10-12,1).replace("-","−")}</sup> ≈ ${F(`${sci(I,2)} W/m²`)}.`}; },
  /* deux sources différentes */
  ()=>{ const S=rnd([["Dans un atelier","la scie","la raboteuse",[78,92],1,1],["Au bord d'une route","un camion","une voiture",[65,82],0,1],["Sur le pont d'un bateau","le moteur","le groupe électrogène",[70,88],0,0],["Pendant une fête","l'enceinte principale","l'enceinte d'appoint",[80,98],1,1]]);
    const [L1,L2]=draw(()=>[ri(S[3][0],S[3][1]),ri(S[3][0],S[3][1])],([a,b])=>a!==b&&Math.abs(a-b)<=10), I1=Iv(L1), I2=Iv(L2), L=Lv(I1+I2);
    return {ctx:`${S[0]}, ${S[1]} seul${S[4]?"e":""} produit un niveau L₁ = ${L1} dB et ${S[2]} seul${S[5]?"e":""} un niveau L₂ = ${L2} dB, au même point. ${I0T}.`,
      q:"Quel niveau sonore mesure-t-on quand les deux sources émettent en même temps ?",type:"num",ans:L,tolA:0.2,unit:"dB",
      expl:`On additionne les intensités, pas les niveaux. ${F(`I = I₀·10^(${FRAC("L","10")})`)} : I₁ = ${sci(I1,2)} W/m² et I₂ = ${sci(I2,2)} W/m², donc ${F("I = I₁ + I₂")} = ${sci(I1+I2,2)} W/m². L = 10·log(${FRAC(sci(I1+I2,2),p10(-12))}) = ${U(L,"dB")}, à peine plus que le niveau de la source la plus forte.`}; },
  /* atténuation avec la distance */
  ()=>{ const S=rnd(["un groupe électrogène","une tondeuse","une enceinte de sonorisation","un compresseur de chantier","une sirène d'alarme"]), r1=rnd([1,2,5,10]), k=rnd([2,3,4,5,8,10,20]), r2=r1*k, L1=rnd([78,82,85,88,92,95,100]), L2=L1-20*lg(k);
    return {ctx:`À ${r1} m d'${S}, le niveau sonore vaut L₁ = ${L1} dB. On modélise la source comme ponctuelle, rayonnant de la même façon dans toutes les directions, sans obstacle ni absorption : ${F(`I = ${FRAC("P","4π·r²")}`)}.`,
      q:`Quel niveau sonore mesure-t-on à ${r2} m de la source ?`,type:"num",ans:L2,tolA:0.2,unit:"dB",
      expl:`La distance est multipliée par ${k} : l'intensité est divisée par ${k}² = ${k*k}. ${F(`L₂ = L₁ − 10·log(${FRAC("I₁","I₂")})`)} = ${L1} − 10·log(${k*k}) = ${L1} − ${nf(20*lg(k),1)} = ${U(L2,"dB")}. Chaque doublement de la distance retire environ 6 dB.`}; },
  /* puissance d'une source, intensité puis niveau */
  ()=>{ const S=rnd([["une enceinte portable",[0.01,0.02,0.05],[1,2,3]],["une sirène d'alarme",[1,2,5],[10,20,50]],["un haut-parleur de sonorisation",[0.1,0.2,0.5],[5,10,20]],["un groupe électrogène",[0.01,0.02,0.05],[2,5,10]]]);
    const P=rnd(S[1]), r=rnd(S[2]), I=P/(4*Math.PI*r*r), [Ia,iu]=Iu(I), L=Lv(I);
    const ctx=`Une source sonore (${S[0]}) rayonne une puissance acoustique P = ${nf(P,2)} W, de la même façon dans toutes les directions. On néglige l'absorption par l'air. ${I0T}.`;
    return [{ctx,q:`Calcule l'intensité sonore à ${r} m de la source, en ${iu}.`,type:"num",ans:Ia,tolR:0.02,unit:iu,
        expl:`La puissance se répartit sur une sphère de rayon r : ${F(`I = ${FRAC("P","4π·r²")}`)} = ${FRAC(nf(P,2),`4π × ${r}²`)} = ${sci(I,3)} W/m² = ${U(Ia,iu)}.`},
      {q:"Déduis-en le niveau d'intensité sonore à cette distance.",type:"num",ans:L,tolA:0.2,unit:"dB",
        expl:`${F(`L = 10·log(${FRAC("I","I₀")})`)} = 10 × log(${FRAC(sci(I,3),p10(-12))}) = ${U(L,"dB")}.`}]; },
  /* diffraction : largeur de la fente ou longueur d'onde à partir de la tache centrale */
  ()=>{ const lam=rnd([532,633,650]), a=rnd([40,50,80,100,120,150]), D=rnd([1.5,2,2.5,3]), Lc=+(2*lam*1e-9*D/(a*1e-6)*100).toPrecision(3), th=Lc/100/(2*D), findA=Math.random()<0.6;
    const fig=fx_ond_diff({a:findA?"fente de largeur a = ?":`fente de largeur a = ${a} µm`,D:`D = ${nf(D,2)} m`,L:`L = ${nf(Lc,3)} cm`});
    const base=`La tache centrale a une largeur L = 2·D·tan θ ≈ 2·D·θ (θ petit, en radian) : θ = ${FRAC("L","2D")} = ${FRAC(nf(Lc/100,4),`2 × ${nf(D,2)}`)} = ${sci(th,3)} rad. `;
    if(findA){ const ar=lam*1e-9/th*1e6;
      return {fig,ctx:`Un laser de longueur d'onde λ = ${lam} nm éclaire une fente. Sur l'écran, à D = ${nf(D,2)} m, la tache centrale mesure L = ${nf(Lc,3)} cm.`,q:"Détermine la largeur a de la fente, en µm.",type:"num",ans:ar,tolR:0.02,unit:"µm",
        expl:base+`${F(`θ ≈ ${FRAC("λ","a")}`)}, donc a = ${FRAC("λ","θ")} = ${FRAC(`${lam} × ${p10(-9)}`,sci(th,3))} = ${sci(ar*1e-6,3)} m = ${U(ar,"µm")}.`}; }
    const lr=th*a*1e-6*1e9;
    return {fig,ctx:`Un laser éclaire une fente de largeur a = ${a} µm. Sur l'écran, à D = ${nf(D,2)} m, la tache centrale mesure L = ${nf(Lc,3)} cm.`,q:"Détermine la longueur d'onde du laser, en nm.",type:"num",ans:lr,tolR:0.02,unit:"nm",
      expl:base+`${F(`θ ≈ ${FRAC("λ","a")}`)}, donc λ = a·θ = ${a} × ${p10(-6)} × ${sci(th,3)} = ${sci(lr*1e-9,3)} m = ${U(lr,"nm")}.`}; },
  /* interférences : interfrange lu sur la figure, puis λ ou b */
  ()=>{ const lam=rnd([532,633,650]), b=rnd([0.2,0.25,0.3,0.4,0.5]), D=rnd([1.5,2,2.5]), i0=lam*1e-9*D/(b*1e-3)*1e3, k=rnd([4,5,6]), X=+(k*i0).toFixed(1), i=X/k, findL=Math.random()<0.6;
    const fig=fx_ond_franges({n:11,k1:-Math.floor(k/2),k2:k-Math.floor(k/2),t:`${k} i = ${nf(X,1)} mm`,cap:"Franges observées sur l'écran"});
    const ctx=findL?`Deux fentes distantes de b = ${nf(b,2)} mm sont éclairées par un laser. L'écran est à D = ${nf(D,2)} m des fentes. Interfrange : ${F(`i = ${FRAC("λ·D","b")}`)}.`
                   :`Deux fentes sont éclairées par un laser de longueur d'onde λ = ${lam} nm. L'écran est à D = ${nf(D,2)} m des fentes. Interfrange : ${F(`i = ${FRAC("λ·D","b")}`)}.`;
    const q1={fig,ctx,q:"Détermine l'interfrange i, en mm.",type:"num",ans:i,tolR:0.02,unit:"mm",
      expl:`L'interfrange est la distance entre les centres de deux franges brillantes voisines. La cote couvre ${k} interfranges : ${F(`i = ${FRAC(`${nf(X,1)} mm`,k)}`)} = ${U(i,"mm")}.`};
    if(findL){ const lr=i*1e-3*b*1e-3/D*1e9;
      return [q1,{q:"Déduis-en la longueur d'onde du laser, en nm.",type:"num",ans:lr,tolR:0.02,unit:"nm",
        expl:`${F(`λ = ${FRAC("i·b","D")}`)} = ${FRAC(`${nf(i,4)} × ${p10(-3)} × ${nf(b,2)} × ${p10(-3)}`,nf(D,2))} = ${sci(lr*1e-9,3)} m = ${U(lr,"nm")}.`}]; }
    const br=lam*1e-9*D/(i*1e-3)*1e3;
    return [q1,{q:"Déduis-en la distance b entre les deux fentes, en mm.",type:"num",ans:br,tolR:0.02,unit:"mm",
      expl:`${F(`b = ${FRAC("λ·D","i")}`)} = ${FRAC(`${lam} × ${p10(-9)} × ${nf(D,2)}`,`${nf(i,4)} × ${p10(-3)}`)} = ${sci(br*1e-3,3)} m = ${U(br,"mm")}.`}]; },
  /* effet Doppler : décalage puis fréquence perçue */
  ()=>{ const fE=rnd([440,500,800,1000,1200]), vk=rnd([36,54,72,90]), vs=vk/3.6, df=fE*vs/VAIR, r=Math.round(df);
    const ctx=`Une ambulance roule à v_S = ${vk} km/h sur une route droite ; sa sirène émet un son de fréquence f_E = ${nf(fE,0)} Hz. Tu es immobile au bord de la route. Célérité du son : v = 340 m/s. Pour v_S petite devant v : ${F(`|Δf| = ${FRAC("f_E·v_S","v")}`)}.`;
    return [{ctx,q:"Calcule le décalage Doppler |Δf|.",type:"num",ans:df,tolR:0.02,unit:"Hz",
        expl:`v_S = ${FRAC(vk,"3,6")} = ${nf(vs,2)} m/s. ${F(`|Δf| = ${FRAC("f_E·v_S","v")}`)} = ${FRAC(`${nf(fE,0)} × ${nf(vs,2)}`,"340")} = ${U(df,"Hz")}.`},
      {q:"Quelle fréquence perçois-tu une fois que l'ambulance t'a dépassé et s'éloigne ?",type:"ch",...mcu(`${nf(fE-r,0)} Hz`,[`${nf(fE+r,0)} Hz`,`${nf(fE,0)} Hz`,`${nf(fE-2*r,0)} Hz`]),
        expl:`Quand la source s'éloigne, les fronts d'onde arrivent plus espacés : ${F("f_R = f_E − |Δf|")} = ${nf(fE,0)} − ${nf(df,1)} ≈ ${nf(fE-r,0)} Hz (son plus grave). Avant le passage, tu percevais ${nf(fE+r,0)} Hz.`}]; },
  /* atténuation et facteur d'intensité */
  ()=>{ if(Math.random()<0.55){ const A=rnd([15,20,25,27,30,33]), L=rnd([92,95,98,100,104]), k=10**(A/10);
      const ctx=`Un casque antibruit a une atténuation A = ${A} dB. Tu le portes dans un atelier où le niveau sonore vaut ${L} dB.`;
      return [{ctx,q:"Quel niveau sonore parvient à tes oreilles ?",type:"num",ans:L-A,tolA:0.2,unit:"dB",
          expl:`L'atténuation se retranche du niveau : ${F("L' = L − A")} = ${L} − ${A} = ${U(L-A,"dB")}.`},
        {q:"Par quel facteur le casque divise-t-il l'intensité sonore ?",type:"num",ans:k,tolR:0.02,unit:"",
          expl:`${F(`A = 10·log(${FRAC("I","I'")})`)}, donc ${FRAC("I","I'")} = 10<sup>${nf(A/10,1)}</sup> = ${U(k,"")}. Une atténuation de 10 dB divise l'intensité par 10, de 20 dB par 100.`}]; }
    const k=rnd([200,500,800,1500,2000,5000,20000]), A=10*lg(k), [S,fem]=rnd([["Une double porte isolante",1],["Un mur en parpaings",0],["Un capot insonorisant",0],["Une vitre feuilletée",1]]), L=rnd([78,82,85,88,92,95]);
    const ctx=`${S} divise par ${nf(k,0)} l'intensité sonore qui ${fem?"la":"le"} traverse.`;
    return [{ctx,q:"Quelle est son atténuation, en dB ?",type:"num",ans:A,tolA:0.2,unit:"dB",
        expl:`${F(`A = 10·log(${FRAC("I_avant","I_après")})`)} = 10 × log(${nf(k,0)}) = ${U(A,"dB")}.`},
      {q:`Le niveau sonore vaut ${L} dB d'un côté. Quel niveau mesure-t-on de l'autre côté ?`,type:"num",ans:L-A,tolA:0.2,unit:"dB",
        expl:`Le niveau baisse du nombre de décibels de l'atténuation : ${F("L' = L − A")} = ${L} − ${nf(A,1)} = ${U(L-A,"dB")}. On ne divise pas le niveau par ${nf(k,0)} : c'est l'intensité qui est divisée.`}]; },
  /* deux haut-parleurs : longueur d'onde puis nature des interférences */
  ()=>{ const [f,lam]=rnd([[425,0.8],[500,0.68],[680,0.5],[850,0.4],[1000,0.34]]), r=rnd([1,1.5,2,2.5,3]), d1=ri(150,300)/100, d2=+(d1+r*lam).toFixed(2), half=r%1!==0;
    const fig=fx_ond_deux({kind:"hp",d1:`d1 = ${nf(d1,2)} m`,d2:`d2 = ${nf(d2,2)} m`});
    const ctx=`Deux haut-parleurs branchés sur le même générateur émettent en phase un son de fréquence f = ${nf(f,0)} Hz. Un microphone M est placé à d1 et d2 des haut-parleurs. Célérité du son : v = 340 m/s.`;
    return [{fig,ctx,q:"Calcule la longueur d'onde du son émis par les deux haut-parleurs.",type:"num",ans:lam,tolR:0.02,unit:"m",expl:`${F(`λ = ${FRAC("v","f")}`)} = ${FRAC("340",nf(f,0))} = ${U(lam,"m")}.`},
      {q:"Quelle est la nature des interférences au point M ?",type:"ch",ch:CONSDES,ok:half?1:0,
        expl:`Différence de marche : ${F("δ = d2 − d1")} = ${nf(d2,2)} − ${nf(d1,2)} = ${nf(d2-d1,2)} m, soit ${FRAC("δ","λ")} = ${FRAC(nf(d2-d1,2),nf(lam,2))} = ${nf(r,1)}. ${half?"Nombre demi-entier : interférences destructives, le micro capte un son très faible.":"Nombre entier : interférences constructives, le micro capte un son renforcé."}`}]; },
  /* deux capteurs le long du milieu : retard lu sur l'oscillogramme, puis célérité */
  ()=>{ const S=rnd([{m:"le long d'une corde tendue",tb:[5,10,20],tu:"ms",v:[8,20]},{m:"le long d'un grand ressort (onde de compression)",tb:[50,100],tu:"ms",v:[1.5,4]},{m:"dans une longue barre d'acier (capteurs piézoélectriques)",tb:[50,100],tu:"µs",v:[5700,6000]}]);
    const tb=rnd(S.tb), n=ri(12,34)/5, k=S.tu==="ms"?1e-3:1e-6, dt=n*tb*k, vt=S.v[0]+Math.random()*(S.v[1]-S.v[0]), dcm=Math.round(vt*dt*100), d=dcm/100, v=d/dt;
    const fig=fx_ond_oscillo({tb:`${nf(tb,0)} ${S.tu}/div`,tr:[{f:sigPic(1.5,1),y0:3,lab:"A"},{f:sigPic(1.5,1+n),y0:6.6,c:1,lab:"B"}],leg:["Signaux des capteurs A et B"]});
    return {fig,ctx:`Une perturbation se propage ${S.m}. Elle passe devant le capteur A, puis devant le capteur B situé ${nf(d,2)} m plus loin. L'oscilloscope enregistre les signaux des deux capteurs.`,
      q:"Calcule la célérité de la perturbation.",type:"num",ans:v,tolR:0.02,unit:"m/s",
      expl:`On repère les sommets des deux signaux : ils sont décalés de ${nf(n,1)} div. Δt = ${nf(n,1)} × ${nf(tb,0)} ${S.tu} = ${nf(n*tb,1)} ${S.tu}. ${F(`v = ${FRAC("d","Δt")}`)} = ${FRAC(`${nf(d,2)} m`,`${sci(dt,3)} s`)} = ${U(v,"m/s")}.`}; },
  /* un même son reçu par deux milieux : durée de parcours, puis retard entre les deux arrivées */
  ()=>{ const w=Math.random()<0.5, v2=w?VEAU:VACIER, d=w?rnd([300,500,800,1200]):rnd([200,300,500,800,1000]), t1=d/VAIR, t2=d/v2, dt=t1-t2, m=w?"l'eau":"l'acier", [rv,ru]=dt>=1?[dt,"s"]:[dt*1000,"ms"];
    const ctx=w?`Un micro (dans l'air) et un hydrophone (dans l'eau), placés au même endroit sur un quai, enregistrent le bruit d'un moteur de bateau qui démarre à ${d} m. ${CEL}`
               :`Un ouvrier frappe un rail en acier à ${d} m de toi. Ton oreille est collée au rail : tu entends deux coups, l'un transmis par le rail, l'autre par l'air. ${CEL}`;
    return [{ctx,q:`Combien de temps le son met-il pour parcourir ces ${d} m dans ${m}, en ms ?`,type:"num",ans:t2*1000,tolR:0.02,unit:"ms",
        expl:`${F(`Δt = ${FRAC("d","v")}`)} = ${FRAC(`${d} m`,`${nf(v2,0)} m/s`)} = ${nf(t2,5)} s, soit ${U(t2*1000,"ms")}.`},
      {q:`Quel retard sépare l'arrivée des deux sons, en ${ru} ?`,type:"num",ans:rv,tolR:0.02,unit:ru,
        expl:`Dans l'air : ${FRAC(`${d} m`,"340 m/s")} = ${nf(t1,4)} s. Le son arrive d'abord par ${w?"l'eau":"le rail"}, puis par l'air : ${F(`retard = t_air − t_${w?"eau":"acier"}`)} = ${nf(t1,4)} − ${nf(t2,5)} = ${ru==="s"?U(dt,"s"):`${nf(dt,4)} s, soit ${U(dt*1000,"ms")}`}.`}]; }
];

const OND3=[
  /* atténuation géométrique : niveau devant une habitation, exigence, distance minimale */
  ()=>{ const S=rnd([
      {s:"Un groupe électrogène de chantier",r1:1,L:[88,92,95],D:[30,50,80,120],c:"la maison la plus proche",Lm:[50,55,60]},
      {s:"Une pompe à chaleur installée dans un jardin",r1:1,L:[62,65,68],D:[5,8,10,15],c:"la fenêtre du voisin",Lm:[40,45]},
      {s:"Le compresseur d'une chambre froide",r1:1,L:[75,80,84],D:[10,20,30,40],c:"l'hôtel voisin",Lm:[45,50,55]},
      {s:"Une petite éolienne installée sur un atoll",r1:10,L:[70,75,80],D:[100,150,200,300],c:"les premières habitations",pl:1,Lm:[35,40,45]}]);
    const want=Math.random()<0.5, o=draw(()=>{ const L1=rnd(S.L), D=rnd(S.D), Lm=rnd(S.Lm), LD=L1-20*lg(D/S.r1); return {L1,D,Lm,LD}; },o=>far(o.LD,o.Lm,0.04)&&o.LD>15&&(o.LD<=o.Lm)===want);
    const ok=o.LD<=o.Lm, x=(o.L1-o.Lm)/20, dmin=S.r1*10**x;
    const ctx=`${S.s} produit un niveau sonore L₁ = ${o.L1} dB à r₁ = ${S.r1} m. ${cap1(S.c)} se trouve${S.pl?"nt":""} à ${o.D} m de la source. On la modélise comme une source ponctuelle qui rayonne de la même façon dans toutes les directions, sans absorption : ${F(`I = ${FRAC("P","4π·r²")}`)}. Exigence : au plus ${o.Lm} dB devant ${S.c}.`;
    return [{ctx,q:`Quel niveau sonore la source produit-elle devant ${S.c} ?`,type:"num",ans:o.LD,tolA:0.2,unit:"dB",
        expl:`L'intensité varie comme ${FRAC("1","r²")} : ${FRAC("I₁","I")} = (${FRAC("r","r₁")})², donc ${F(`L = L₁ − 20·log(${FRAC("r","r₁")})`)} = ${o.L1} − 20 × log(${FRAC(o.D,S.r1)}) = ${o.L1} − ${nf(20*lg(o.D/S.r1),1)} = ${U(o.LD,"dB")}.`},
      {q:"L'exigence est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.LD,1)} dB ${ok?"≤":">"} ${o.Lm} dB : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée."}`},
      {q:`À quelle distance minimale de la source le niveau ne dépasse-t-il plus ${o.Lm} dB ?`,type:"num",ans:dmin,tolR:0.02,unit:"m",
        expl:`On cherche r tel que L₁ − 20·log(${FRAC("r","r₁")}) = ${o.Lm} : log(${FRAC("r","r₁")}) = ${FRAC(`${o.L1} − ${o.Lm}`,"20")} = ${nf(x,3)}, donc ${F(`r = r₁ × 10<sup>${nf(x,3)}</sup>`)} = ${U(dmin,"m")}. ${ok?"La source est déjà assez loin.":"Il faudrait éloigner la source, ou l'enfermer dans un capot insonorisant."}`}]; },
  /* plusieurs sources identiques : niveau total, exigence, nombre maximal de sources */
  ()=>{ const S=rnd([
      {c:"Dans un atelier de menuiserie, chaque machine en marche produit, au poste de l'opérateur, un niveau",u:"machines",vb:["fonctionnent","fonctionner"],k:[4,5,8,11],N:[2,3,4,5,6,8],Lm:[80,85]},
      {c:"Lors d'une fête, chaque groupe de percussions (pahu et to'ere) produit, au premier rang du public, un niveau",u:"groupes",vb:["jouent","jouer"],k:[5,8,11],N:[2,3,4,5,6],Lm:[100,102]},
      {c:"Dans une salle informatique, chaque baie de serveurs produit, au poste de surveillance, un niveau",u:"baies",vb:["fonctionnent","fonctionner"],k:[5,8,11],N:[2,4,6,8,10,12],Lm:[65,70]},
      {c:"Dans la salle des machines d'un bateau, chaque groupe électrogène produit, au poste du mécanicien, un niveau",u:"groupes",vb:["fonctionnent","fonctionner"],k:[1,2,4,5],N:[2,3,4],Lm:[85,88]}]);
    /* écarts L_max − L₁ choisis pour que 10^(écart/10) soit à plus de 3 % d'un entier (pas de nombre maximal « à la limite ») */
    const o=draw(()=>{ const Lm=rnd(S.Lm), L1=Lm-rnd(S.k), N=rnd(S.N), LN=L1+10*lg(N), x=10**((Lm-L1)/10), Nm=Math.floor(x); return {L1,N,Lm,LN,x,Nm}; },
      o=>far(o.LN,o.Lm,0.03)&&o.Nm>=1&&o.x/o.Nm>=1.03&&(o.Nm+1)/o.x>=1.03);
    const ok=o.LN<=o.Lm, ctx=`${S.c} L₁ = ${o.L1} dB. Exigence : au plus ${o.Lm} dB à cet endroit. ${I0T}.`;
    return [{ctx,q:`Quel niveau sonore mesure-t-on quand ${o.N} ${S.u} identiques ${S.vb[0]} en même temps ?`,type:"num",ans:o.LN,tolA:0.2,unit:"dB",
        expl:`Les intensités s'ajoutent : ${F(`I = ${o.N}·I₁`)}, donc ${F(`L = L₁ + 10·log(${o.N})`)} = ${o.L1} + ${nf(10*lg(o.N),1)} = ${U(o.LN,"dB")}. ${ok?"C'est inférieur":"C'est supérieur"} à ${o.Lm} dB.`},
      {q:`Combien de ${S.u} au plus peuvent ${S.vb[1]} en même temps sans dépasser ${o.Lm} dB ?`,type:"num",ans:o.Nm,tolA:0,unit:S.u,
        expl:`Il faut L₁ + 10·log(N) ≤ ${o.Lm}, soit log(N) ≤ ${FRAC(`${o.Lm} − ${o.L1}`,"10")} = ${nf((o.Lm-o.L1)/10,2)}, donc N ≤ 10<sup>${nf((o.Lm-o.L1)/10,2)}</sup> = ${nf(o.x,2)}. N est entier : ${U(o.Nm,S.u)} au plus. Ajouter les niveaux (${o.L1} + ${o.L1} = ${2*o.L1} dB) serait absurde.`}]; },
  /* alarme audible : bruit ambiant (somme des intensités), niveau de l'alarme, marge exigée */
  ()=>{ const S=rnd([
      {c:"Dans un atelier",a:"la scie",fa:1,b:"le compresseur",fb:0,La:[76,80,84],Lb:[70,74,78],al:"une alarme incendie",A:[100,105,110]},
      {c:"Dans la salle des machines d'un bateau",a:"le moteur principal",fa:0,b:"le groupe électrogène",fb:0,La:[84,88,90],Lb:[78,82,85],al:"une sirène d'alarme",A:[105,110,115]},
      {c:"Dans une cuisine professionnelle",a:"la hotte",fa:1,b:"le lave-vaisselle",fb:0,La:[66,70,72],Lb:[62,65,68],al:"un avertisseur de fin de cuisson",A:[80,85,90]}]);
    const want=Math.random()<0.5, o=draw(()=>{ const La=rnd(S.La), Lb=rnd(S.Lb), A1=rnd(S.A), r=rnd([2,3,4,5,6,8]), M=rnd([10,15]), Lamb=Lv(Iv(La)+Iv(Lb)), Lal=A1-20*lg(r); return {La,Lb,A1,r,M,Lamb,Lal,m:Lal-Lamb}; },
      o=>Math.abs(o.m-o.M)>=1.5&&o.m>-5&&o.La!==o.Lb&&(o.m>=o.M)===want);
    const ok=o.m>=o.M, Ia=Iv(o.La), Ib=Iv(o.Lb);
    const ctx=`${S.c}, au poste de l'opérateur, ${S.a} seul${S.fa?"e":""} produit ${o.La} dB et ${S.b} seul${S.fb?"e":""} ${o.Lb} dB. L'opérateur est à ${o.r} m d'${S.al} qui produit ${o.A1} dB à 1 m (source ponctuelle, ${F(`I = ${FRAC("P","4π·r²")}`)}). Exigence : l'alarme doit dépasser le bruit ambiant d'au moins ${o.M} dB. ${I0T}.`;
    return [{ctx,q:"Quel est le niveau du bruit ambiant au poste quand les deux appareils fonctionnent ?",type:"num",ans:o.Lamb,tolA:0.2,unit:"dB",
        expl:`On additionne les intensités : ${F(`I = I₀·10^(${FRAC("L","10")})`)} donne ${sci(Ia,2)} W/m² et ${sci(Ib,2)} W/m² ; ${F("I = I₁ + I₂")} = ${sci(Ia+Ib,2)} W/m². L = 10·log(${FRAC(sci(Ia+Ib,2),p10(-12))}) = ${U(o.Lamb,"dB")}.`},
      {q:"Quel niveau sonore l'alarme produit-elle au poste de l'opérateur ?",type:"num",ans:o.Lal,tolA:0.2,unit:"dB",
        expl:`Distance multipliée par ${o.r} : ${F(`L = L₁ − 20·log(${FRAC("r","r₁")})`)} = ${o.A1} − 20 × log(${o.r}) = ${o.A1} − ${nf(20*lg(o.r),1)} = ${U(o.Lal,"dB")}.`},
      {q:"L'exigence de perception de l'alarme est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Marge : ${nf(o.Lal,1)} − ${nf(o.Lamb,1)} = ${nm(Math.round(o.Lal*10)/10-Math.round(o.Lamb*10)/10,1)} dB ${ok?"≥":"&lt;"} ${o.M} dB : ${ok?"l'alarme sera perçue.":"l'exigence n'est pas respectée ; il faut rapprocher l'alarme, en ajouter une ou réduire le bruit des machines."}`}]; },
  /* télémètre à ultrasons : durée d'une mesure et cadence exigée */
  ()=>{ const S=rnd([{c:"Un robot mobile",dm:[2,3,4,5]},{c:"Un chariot autonome d'entrepôt",dm:[3,4,5,6]},{c:"Un drone d'inspection qui mesure sa hauteur au-dessus du sol",dm:[4,5,6,8]}]);
    const want=Math.random()<0.5, o=draw(()=>{ const dm=rnd(S.dm), fr=rnd([10,15,20,25,30,40,50]), t=2*dm/VAIR; return {dm,fr,t,fm:1/t}; },o=>far(o.fm,o.fr,0.05)&&(o.fm>=o.fr)===want);
    const ok=o.fm>=o.fr, ctx=`${S.c} utilise un capteur à ultrasons de portée maximale d_max = ${o.dm} m. Après chaque salve, le capteur attend l'écho de l'obstacle le plus lointain avant d'émettre la salve suivante. Célérité du son dans l'air : v = 340 m/s.`;
    return [{fig:fx_ond_telem({obs:"obstacle",d:`d_max = ${o.dm} m`}),ctx,q:"Quelle durée maximale sépare l'émission d'une salve de la réception de son écho, en ms ?",type:"num",ans:o.t*1000,tolR:0.02,unit:"ms",
        expl:`L'onde fait l'aller et le retour, soit 2·d_max : ${F(`Δt = ${FRAC("2·d_max","v")}`)} = ${FRAC(`2 × ${o.dm}`,"340")} = ${nf(o.t,5)} s, soit ${U(o.t*1000,"ms")}.`},
      {q:`Le cahier des charges exige au moins ${o.fr} mesures par seconde. Est-il respecté ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`Une mesure dure au moins Δt : le capteur fait au plus ${F(`f = ${FRAC("1","Δt")}`)} = ${FRAC("1",nf(o.t,5))} = ${nf(o.fm,1)} mesures par seconde. ${nf(o.fm,1)} ${ok?"≥":"&lt;"} ${o.fr} : ${ok?"l'exigence est respectée.":`l'exigence n'est pas respectée ; il faudrait limiter la portée utile à ${FRAC("v","2·f")} = ${FRAC("340",`2 × ${o.fr}`)} = ${nf(VAIR/(2*o.fr),2)} m.`}`}]; },
  /* télémètre : effet de la température sur la célérité, écart relatif et exigence de précision */
  ()=>{ const SS=[
      {c:"Un capteur de niveau à ultrasons, fixé au-dessus d'un réservoir d'eau de pluie,",o:"la surface de l'eau",th:[20,25,30,35],d:[0.8,1.2,1.5,2]},
      {c:"Le télémètre à ultrasons d'un robot de chantier",o:"le mur visé",th:[18,22,28,35],d:[1,2,3]},
      {c:"Le capteur à ultrasons d'une chambre froide",o:"la pile de cartons",th:[-10,-5,0,5],d:[1,1.5,2,2.5]}];
    const want=Math.random()<0.5, o=draw(()=>{ const S=rnd(SS), th=rnd(S.th), d=rnd(S.d), ex=rnd([1,2]), v=331+0.6*th, dc=d*VAIR/v; return {S,th,d,ex,v,dc,e:Math.abs(dc-d)/d*100}; },o=>far(o.e,o.ex,0.1)&&(o.e<=o.ex)===want), S=o.S;
    const ok=o.e<=o.ex, dt=2*o.d/o.v, th=o.th<0?`(${nm(o.th,0)})`:nf(o.th,0);
    const ctx=`${S.c} calcule la distance avec ${F(`d = ${FRAC("v·Δt","2")}`)} en prenant v = 340 m/s. En réalité, la célérité du son dépend de la température de l'air : v = 331 + 0,6·θ (v en m/s, θ en °C). Ce jour-là, θ = ${nm(o.th,0)} °C et ${S.o} est réellement à d = ${nf(o.d,2)} m du capteur. Exigence : erreur sur la distance au plus ${o.ex} %.`;
    return [{ctx,q:"Quelle est la célérité réelle du son ce jour-là ?",type:"num",ans:o.v,tolR:0.02,unit:"m/s",
        expl:`${F("v = 331 + 0,6·θ")} = 331 + 0,6 × ${th} = ${U(o.v,"m/s")}. La valeur 340 m/s du programme correspond à 15 °C.`},
      {q:"Quelle distance le programme affiche-t-il ?",type:"num",ans:o.dc,tolR:0.02,unit:"m",
        expl:`Durée réelle de l'aller-retour : ${F(`Δt = ${FRAC("2·d","v")}`)} = ${FRAC(`2 × ${nf(o.d,2)}`,nf(o.v,1))} = ${nf(dt*1000,3)} ms. Le programme calcule ${FRAC("340 × Δt","2")} = ${FRAC(`340 × ${nf(dt,6)}`,"2")} = ${U(o.dc,"m")}.`},
      {q:"L'exigence de précision est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Écart relatif, en prenant la distance réelle comme référence : ${F(`e = ${FRAC("|d_affichée − d|","d")} × 100`)} = ${FRAC(`|${nf(o.dc,3)} − ${nf(o.d,2)}|`,nf(o.d,2))} × 100 = ${nf(o.e,2)} %. ${nf(o.e,2)} % ${ok?"≤":">"} ${o.ex} % : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée ; il faut mesurer la température de l'air et corriger v dans le programme."}`}]; },
  /* sondeur : diffraction par le transducteur, largeur de la zone sondée au fond */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const f=rnd([83,120,150,200]), a=rnd([6,8,10,12,15]), h=rnd([15,20,25,30,40,50]), Dm=rnd([3,4,5,6,8,10]), lam=VEAU/(f*1000), th=lam/(a/100); return {f,a,h,Dm,lam,th,D:2*h*th}; },
      o=>o.th<=0.25&&o.th>=0.03&&far(o.D,o.Dm,0.06)&&(o.D<=o.Dm)===want);
    const ok=o.D<=o.Dm, fig=fx_ond_sondeur({b:"bateau",h:`h = ${o.h} m`,cone:{D:"D"}});
    const ctx=`Le transducteur circulaire d'un sondeur de pêche, de diamètre a = ${o.a} cm, émet des ultrasons de fréquence f = ${o.f} kHz dans l'eau de mer (v = 1 500 m/s). À cause de la diffraction, on admet que le faisceau s'ouvre d'un demi-angle ${F(`θ ≈ ${FRAC("λ","a")}`)} (θ en rad). Le fond est à h = ${o.h} m sous la sonde.`;
    return [{fig,ctx,q:"Calcule la longueur d'onde des ultrasons dans l'eau, en mm.",type:"num",ans:o.lam*1000,tolR:0.02,unit:"mm",
        expl:`${F(`λ = ${FRAC("v","f")}`)} = ${FRAC("1 500",nf(o.f*1000,0))} = ${nf(o.lam,5)} m, soit ${U(o.lam*1000,"mm")}.`},
      {q:"Calcule le demi-angle d'ouverture θ du faisceau.",type:"num",ans:o.th,tolR:0.02,unit:"rad",
        expl:`λ et a dans la même unité : ${F(`θ ≈ ${FRAC("λ","a")}`)} = ${FRAC(`${nf(o.lam,5)} m`,`${nf(o.a/100,2)} m`)} = ${U(o.th,"rad")}, soit ${nf(deg(o.th),1)}°.`},
      {q:`Pour repérer un petit banc de poissons, la zone sondée au fond doit avoir un diamètre D ≤ ${o.Dm} m. Est-ce le cas ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`Angle petit : le rayon de la zone sondée vaut h·tan θ ≈ h·θ, donc ${F("D ≈ 2·h·θ")} = 2 × ${o.h} × ${nf(o.th,4)} = ${nf(o.D,2)} m ${ok?"≤":">"} ${o.Dm} m : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée ; une fréquence plus élevée (λ plus petite) ou un transducteur plus large resserrerait le faisceau."}`}]; },
  /* diffraction par un fil : diamètre mesuré, écart relatif à la valeur annoncée, conformité */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const lam=rnd([532,633,650]), D=rnd([1.5,2,2.5]), an=rnd([0.2,0.25,0.3,0.35,0.4,0.5]), tol=rnd([3,5]), er=(Math.random()*2-1)*0.1;
        const Lmm=Math.round(2*lam*1e-9*D/(an*(1+er)*1e-3)*1e4)/10, a=2*lam*1e-9*D/(Lmm*1e-3)*1e3; return {lam,D,an,tol,Lmm,a,e:Math.abs(a-an)/an*100}; },o=>far(o.e,o.tol,0.12)&&o.Lmm>=3&&(o.e<=o.tol)===want);
    const ok=o.e<=o.tol, th=o.Lmm/1000/(2*o.D);
    const fig=fx_ond_diff({fil:1,D:`D = ${nf(o.D,2)} m`,L:`L = ${nf(o.Lmm,1)} mm`});
    const ctx=`Pour contrôler un fil de pêche en nylon, on le place dans le faisceau d'un laser (λ = ${o.lam} nm) : un fil de diamètre a donne la même figure de diffraction qu'une fente de largeur a, avec ${F(`θ ≈ ${FRAC("λ","a")}`)}. Sur l'écran, à D = ${nf(o.D,2)} m, la tache centrale mesure L = ${nf(o.Lmm,1)} mm. Le fabricant annonce un diamètre de ${nf(o.an,2)} mm à ${o.tol} % près.`;
    return [{fig,ctx,q:"Détermine le diamètre a du fil, en mm.",type:"num",ans:o.a,tolR:0.02,unit:"mm",
        expl:`Angle petit : ${F(`θ ≈ ${FRAC("L","2·D")}`)} = ${FRAC(nf(o.Lmm/1000,4),`2 × ${nf(o.D,2)}`)} = ${sci(th,3)} rad. Donc ${F(`a = ${FRAC("λ","θ")} = ${FRAC("2·λ·D","L")}`)} = ${FRAC(`2 × ${o.lam} × ${p10(-9)} × ${nf(o.D,2)}`,`${nf(o.Lmm,1)} × ${p10(-3)}`)} = ${sci(o.a/1000,3)} m = ${U(o.a,"mm")}.`},
      {q:"Le fil est-il conforme à l'annonce du fabricant ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Écart relatif, en prenant la valeur annoncée comme référence : ${F(`e = ${FRAC("|a − a_annoncé|","a_annoncé")} × 100`)} = ${FRAC(`|${nf(o.a,3)} − ${nf(o.an,2)}|`,nf(o.an,2))} × 100 = ${nf(o.e,1)} %. ${nf(o.e,1)} % ${ok?"≤":">"} ${o.tol} % : ${ok?"le fil est conforme.":"le fil n'est pas conforme."}`}]; },
  /* interférences : plus grande longueur d'onde et plus petite fréquence atténuées en un point */
  ()=>{ const del=rnd([0.17,0.2,0.25,0.34,0.4,0.5,0.68,0.85]), d1=ri(250,600)/100, d2=+(d1+del).toFixed(2), lm=2*del, fm=VAIR/lm;
    const fig=fx_ond_deux({kind:"hp",d1:`d1 = ${nf(d1,2)} m`,d2:`d2 = ${nf(d2,2)} m`});
    const ctx="Pour régler la sonorisation d'une salle, deux enceintes branchées sur la même table de mixage émettent en phase le même son. Un micro de mesure est placé en M, à d1 et d2 des enceintes. Célérité du son : v = 340 m/s.";
    const ok=`${nf(3*fm,0)} Hz`;
    return [{fig,ctx,q:"Quelle est la plus grande longueur d'onde pour laquelle les interférences sont destructives en M ?",type:"num",ans:lm,tolR:0.02,unit:"m",
        expl:`${F("δ = d2 − d1")} = ${nf(d2,2)} − ${nf(d1,2)} = ${nf(del,2)} m. Interférences destructives si ${F("δ = (k + ½)·λ")} ; λ est la plus grande pour k = 0 : δ = ${FRAC("λ","2")}, soit λ = 2·δ = ${U(lm,"m")}.`},
      {q:"Quelle est la plus petite fréquence fortement atténuée en M ?",type:"num",ans:fm,tolR:0.02,unit:"Hz",
        expl:`${F(`f = ${FRAC("v","λ")}`)} = ${FRAC("340",nf(lm,2))} = ${U(fm,"Hz")}.`},
      {q:"Parmi ces fréquences, laquelle est aussi fortement atténuée en M ?",type:"ch",...mcu(ok,[`${nf(2*fm,0)} Hz`,`${nf(4*fm,0)} Hz`,`${nf(2.5*fm,0)} Hz`]),
        expl:`Destructives si ${FRAC("δ","λ")} = ${FRAC("δ·f","v")} est demi-entier : f = (k + ½) × ${FRAC("v","δ")}, soit ${nf(fm,0)} Hz, ${nf(3*fm,0)} Hz, ${nf(5*fm,0)} Hz… ${F(ok)} convient (k = 1). À ${nf(2*fm,0)} Hz et ${nf(4*fm,0)} Hz, ${FRAC("δ","λ")} est entier : interférences constructives.`}]; },
  /* interférences : interfrange suffisant pour la mesure, distance minimale, réglage */
  ()=>{ const o=draw(()=>{ const lam=rnd([532,633,650]), b=rnd([0.3,0.4,0.5,0.6,0.8,1]), D=rnd([0.5,0.8,1,1.2,1.5]), im=rnd([1,1.5,2]), i=lam*1e-9*D/(b*1e-3)*1e3; return {lam,b,D,im,i}; },o=>far(o.i,o.im,0.06));
    const ok=o.i>=o.im, Dmin=o.im*o.b*1e-6/(o.lam*1e-9);
    const ctx=`Deux fentes fines distantes de b = ${nf(o.b,2)} mm sont éclairées par un laser (λ = ${o.lam} nm). L'écran est à D = ${nf(o.D,2)} m des fentes. Pour mesurer l'interfrange à la règle avec une précision suffisante, il faut i ≥ ${nf(o.im,1)} mm. Interfrange : ${F(`i = ${FRAC("λ·D","b")}`)}.`;
    return [{ctx,q:"Calcule l'interfrange obtenu avec ce montage, en mm.",type:"num",ans:o.i,tolR:0.02,unit:"mm",
        expl:`Tout en mètres : ${F(`i = ${FRAC("λ·D","b")}`)} = ${FRAC(`${o.lam} × ${p10(-9)} × ${nf(o.D,2)}`,`${nf(o.b,2)} × ${p10(-3)}`)} = ${sci(o.i/1000,3)} m = ${U(o.i,"mm")}. ${nf(o.i,2)} mm ${ok?"≥":"&lt;"} ${nf(o.im,1)} mm : ${ok?"l'interfrange est assez grand.":"l'interfrange est trop petit pour une mesure précise."}`},
      {q:`Quelle distance fentes–écran minimale donne i ≥ ${nf(o.im,1)} mm ?`,type:"num",ans:Dmin,tolR:0.02,unit:"m",
        expl:`${F(`D = ${FRAC("i·b","λ")}`)} = ${FRAC(`${nf(o.im,1)} × ${p10(-3)} × ${nf(o.b,2)} × ${p10(-3)}`,`${o.lam} × ${p10(-9)}`)} = ${U(Dmin,"m")}. ${ok?"Le montage actuel convient déjà.":"Il faut éloigner l'écran."}`},
      {q:"Sans changer de laser, quelle autre modification augmente aussi l'interfrange ?",type:"ch",...mcu("Prendre deux fentes plus rapprochées (b plus petit)",["Prendre deux fentes plus écartées (b plus grand)","Prendre des fentes plus larges, au même écartement","Rapprocher le laser des fentes"]),
        expl:`${F(`i = ${FRAC("λ·D","b")}`)} : i augmente quand D augmente ou quand b diminue. La largeur des fentes et la distance entre le laser et les fentes n'interviennent pas dans l'interfrange.`}]; },
  /* effet Doppler : fréquence émise et vitesse d'un véhicule, limitation de vitesse */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const fE=rnd([400,500,600,800,1000]), vk=ri(30,110), lim=rnd([30,50,70,90,110]), vs=vk/3.6, f1=Math.round(fE*(1+vs/VAIR)), f2=Math.round(fE*(1-vs/VAIR));
        return {lim,f1,f2,fe:(f1+f2)/2,v:VAIR*(f1-f2)/(f1+f2)*3.6}; },o=>far(o.v,o.lim,0.06)&&o.f1-o.f2>=10&&(o.v<=o.lim)===want);
    const ok=o.v<=o.lim;
    const ctx=`Un micro placé au bord d'une route enregistre le klaxon d'une voiture qui passe : f₁ = ${nf(o.f1,0)} Hz quand elle s'approche, f₂ = ${nf(o.f2,0)} Hz quand elle s'éloigne. Pour une vitesse v_S petite devant v = 340 m/s : ${F(`f₁ = f_E·(1 + ${FRAC("v_S","v")})`)} et ${F(`f₂ = f_E·(1 − ${FRAC("v_S","v")})`)}.`;
    return [{ctx,q:"Quelle est la fréquence f_E émise par le klaxon ?",type:"num",ans:o.fe,tolR:0.02,unit:"Hz",
        expl:`En additionnant les deux relations : f₁ + f₂ = 2·f_E, donc ${F(`f_E = ${FRAC("f₁ + f₂","2")}`)} = ${FRAC(`${nf(o.f1,0)} + ${nf(o.f2,0)}`,"2")} = ${U(o.fe,"Hz")}.`},
      {q:"Quelle est la vitesse de la voiture, en km/h ?",type:"num",ans:o.v,tolR:0.02,unit:"km/h",
        expl:`En soustrayant : f₁ − f₂ = 2·f_E·${FRAC("v_S","v")}, donc ${F(`v_S = v·${FRAC("f₁ − f₂","f₁ + f₂")}`)} = 340 × ${FRAC(`${nf(o.f1,0)} − ${nf(o.f2,0)}`,`${nf(o.f1,0)} + ${nf(o.f2,0)}`)} = ${nf(o.v/3.6,2)} m/s, soit ${nf(o.v/3.6,2)} × 3,6 = ${U(o.v,"km/h")}.`},
      {q:`La vitesse est limitée à ${o.lim} km/h. La voiture est-elle en infraction ?`,type:"ch",ch:YN,ok:ok?1:0,
        expl:`${nf(o.v,1)} km/h ${ok?"≤":">"} ${o.lim} km/h : ${ok?"la voiture respecte la limitation.":"la voiture dépasse la limitation."}`}]; },
  /* contrôle non destructif par ultrasons : célérité dans l'acier, profondeur d'un défaut */
  ()=>{ const o=draw(()=>{ const e=rnd([20,25,30,40,50,60]), vt=5800+Math.random()*250, tb=rnd([1,2,5]), nF=Math.round(2*e/1000/vt*1e6/tb*5)/5, r=0.25+Math.random()*0.5, nD=Math.round(nF*r*5)/5;
        return {e,tb,nF,nD,v:2*e/1000/(nF*tb*1e-6)}; },o=>o.nF>=4&&o.nF<=8.6&&o.nD>=1&&o.nF-o.nD>=1&&o.v>=5600&&o.v<=6200);
    const x0=0.6, dtF=o.nF*o.tb, dtD=o.nD*o.tb, v=o.v, p=v*dtD*1e-6/2*1000;
    const fig=fx_ond_oscillo({tb:`${nf(o.tb,0)} µs/div`,tr:[{f:x=>sigPic(2.6,x0,0.07)(x)+sigPic(1.1,x0+o.nD,0.07)(x)+sigPic(1.8,x0+o.nF,0.07)(x),y0:6.4}],
      mk:[{x:x0,y:3.3,t:"E"},{x:x0+o.nD,y:4.8,t:"D"},{x:x0+o.nF,y:4.1,t:"F"}],leg:["E : impulsion émise · D : écho du défaut · F : écho du fond"]});
    const ctx=`Contrôle d'une soudure : un palpeur à ultrasons est posé sur une plaque d'acier d'épaisseur e = ${o.e} mm (mesurée au pied à coulisse). Il émet une impulsion, puis reçoit l'écho d'un défaut interne et l'écho de la face opposée (le fond).`;
    return [{fig,ctx,q:"À partir de l'écho du fond, calcule la célérité des ultrasons dans cet acier.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`Entre E et F : ${nf(o.nF,1)} div × ${nf(o.tb,0)} µs/div = ${nf(dtF,1)} µs. L'onde fait l'aller et le retour dans l'épaisseur : ${F(`v = ${FRAC("2·e","Δt")}`)} = ${FRAC(`2 × ${nf(o.e/1000,3)}`,`${nf(dtF,1)} × ${p10(-6)}`)} = ${U(v,"m/s")}.`},
      {q:"À quelle profondeur sous le palpeur se trouve le défaut, en mm ?",type:"num",ans:p,tolR:0.02,unit:"mm",
        expl:`Entre E et D : ${nf(o.nD,1)} div, soit ${nf(dtD,1)} µs. ${F(`p = ${FRAC("v·Δt","2")}`)} = ${FRAC(`${nf(v,0)} × ${nf(dtD,1)} × ${p10(-6)}`,"2")} = ${nf(p/1000,5)} m, soit ${U(p,"mm")}. Plus rapide : ${F(`p = e × ${FRAC("Δt_D","Δt_F")}`)} = ${o.e} × ${FRAC(nf(o.nD,1),nf(o.nF,1))}.`}]; },
  /* repérer l'erreur dans un raisonnement */
  ()=>{ const v=ri(0,7); let ctx, st, bad, why;
    if(v===0){ const L1=rnd([70,75,80,85]);
      ctx=`Niveau sonore produit par deux machines identiques qui produisent chacune ${L1} dB au même point.`;
      st=["Les deux machines ensemble : L = L₁ + L₁.",`L = 2 × ${L1} = ${2*L1} dB.`,"Le niveau sonore a doublé."]; bad=0;
      why=`Ce sont les intensités qui s'additionnent, pas les niveaux : L = L₁ + 10·log(2) = ${L1+3} dB.`; }
    else if(v===1){ const dt=rnd([4,5,6,8]);
      ctx=`Distance d'un obstacle : un télémètre à ultrasons mesure Δt = ${dt} ms entre l'émission et la réception de l'écho (v = 340 m/s).`;
      st=[`Δt = ${dt} ms = ${dt} × ${p10(-3)} s.`,"Pendant Δt, l'onde parcourt la distance d.",`d = v·Δt = 340 × ${dt} × ${p10(-3)} = ${nf(0.34*dt,2)} m.`]; bad=1;
      why=`Pendant Δt, l'onde fait l'aller et le retour : elle parcourt 2·d. d = ${FRAC("v·Δt","2")} = ${nf(0.17*dt,2)} m.`; }
    else if(v===2){ const f=rnd([25,40,50]);
      ctx=`Longueur d'onde d'ultrasons de fréquence ${f} kHz dans l'air (v = 340 m/s).`;
      st=[`f = ${f} kHz = ${f} Hz`,`λ = ${FRAC("v","f")} = ${FRAC("340",f)}`,`λ = ${nf(340/f,2)} m`]; bad=0;
      why=`La fréquence doit être en hertz : f = ${nf(f*1000,0)} Hz, d'où λ = ${nf(340/f,2)} mm.`; }
    else if(v===3){
      ctx="Effet d'un doublement de la distance à une source ponctuelle sur le niveau sonore.";
      st=[`Source ponctuelle : I = ${FRAC("P","4π·r²")}.`,"Si la distance double, l'intensité est divisée par 2.","Le niveau sonore baisse donc de 3 dB."]; bad=1;
      why=`I est proportionnelle à ${FRAC("1","r²")} : quand r double, I est divisée par 2² = 4 et le niveau baisse de 10·log(4) ≈ 6 dB.`; }
    else if(v===4){ const a=rnd([0.1,0.2]);
      ctx=`Écart angulaire de diffraction d'un laser (λ = 650 nm) par une fente de largeur a = ${nf(a,1)} mm.`;
      st=[`θ ≈ ${FRAC("λ","a")}`,`λ = 650 × ${p10(-9)} m et a = ${nf(a,1)} × ${p10(-3)} m`,`θ = ${FRAC(`650 × ${p10(-9)}`,`${nf(a,1)} × ${p10(-3)}`)} = ${sci(650e-9/a,2)} rad`]; bad=2;
      why=`Le calcul final est faux : ${FRAC(`650 × ${p10(-9)}`,`${nf(a,1)} × ${p10(-3)}`)} = ${sci(650e-9/(a*1e-3),2)} rad ; le résultat de l'élève correspond à a laissé en millimètres.`; }
    else if(v===5){
      ctx="Son perçu par un piéton immobile quand une ambulance s'approche, sirène allumée.";
      st=["La source se rapproche du récepteur.","Les fronts d'onde arrivent resserrés sur le piéton : la longueur d'onde reçue est plus courte.","Le piéton perçoit donc un son plus grave que le son émis."]; bad=2;
      why="Des fronts d'onde resserrés arrivent plus souvent : la fréquence perçue est plus grande que la fréquence émise, le son est plus aigu.";}
    else if(v===6){ const k=rnd([-6,-5,-4]);
      ctx=`Niveau sonore pour une intensité I = ${p10(k)} W/m² (I₀ = ${p10(-12)} W/m²).`;
      st=[`L = 10·log(${FRAC("I₀","I")})`,`L = 10·log(${FRAC(p10(-12),p10(k))}) = 10 × (${nm(-12-k,0)})`,`L = ${nm(10*(-12-k),0)} dB`]; bad=0;
      why=`La définition est L = 10·log(${FRAC("I","I₀")}) = 10 × ${12+k} = ${10*(12+k)} dB. Un niveau négatif pour un son audible doit alerter.`; }
    else { const lam=rnd([0.4,0.5,0.68]), d1=rnd([2,2.5,3]);
      ctx=`Nature des interférences en un point M situé à d1 = ${nf(d1,2)} m et d2 = ${nf(d1+1.5*lam,2)} m de deux haut-parleurs en phase (λ = ${nf(lam,2)} m).`;
      st=[`δ = d2 − d1 = ${nf(1.5*lam,2)} m`,`${FRAC("δ","λ")} = ${FRAC(nf(1.5*lam,2),nf(lam,2))} = 1,5`,"δ est un multiple de λ : les interférences sont constructives."]; bad=2;
      why=`${FRAC("δ","λ")} = 1,5 est demi-entier : δ = (k + ½)·λ avec k = 1, les ondes arrivent en opposition de phase, les interférences sont destructives.`; }
    return {ctx,data:OL(st),q:"Un élève a rédigé ce raisonnement. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
  /* sonorisation en plein air : décalage entre deux enceintes, écho perçu */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const dt=rnd([6,8,10,12,14,20,25,30,40,60]), s=rnd([30,40,50]); return {dt,s,t:dt/VAIR*1000}; },o=>far(o.t,o.s,0.1)&&(o.t>o.s)===want);
    const per=o.t>o.s, dsp=o.dt+rnd([15,20,30,40]);
    const fig=fx_ond_tour({dt:`d = ${o.dt} m`,dp:`D = ${dsp} m`});
    const ctx=`Concert en plein air : une enceinte de rappel est placée à d = ${o.dt} m devant la façade, sur l'axe de la scène, pour les spectateurs éloignés. Les deux reçoivent le même signal électrique au même instant. Célérité du son : v = 340 m/s. On admet que l'oreille perçoit un écho gênant quand deux sons identiques arrivent avec plus de ${o.s} ms d'écart.`;
    return [{fig,ctx,q:`Pour un spectateur placé à D = ${dsp} m de la façade, quel décalage sépare le son de la façade et celui de l'enceinte de rappel, en ms ?`,type:"num",ans:o.t,tolR:0.02,unit:"ms",
        expl:`Son de la façade : durée ${FRAC("D","v")} ; son de l'enceinte de rappel : ${FRAC("D − d","v")}. ${F(`Δt = ${FRAC("D","v")} − ${FRAC("D − d","v")} = ${FRAC("d","v")}`)} = ${FRAC(o.dt,"340")} = ${nf(o.t/1000,5)} s, soit ${U(o.t,"ms")}, quelle que soit la place du spectateur derrière l'enceinte.`},
      {q:"Sans réglage, le spectateur perçoit-il un écho gênant ?",type:"ch",ch:YN,ok:per?0:1,
        expl:`${nf(o.t,1)} ms ${per?">":"≤"} ${o.s} ms : ${per?"l'écho est perçu. On retarde donc électroniquement le signal de l'enceinte de rappel de Δt : son son part au moment où celui de la façade passe devant elle.":"le décalage n'est pas perçu comme un écho ; un petit retard électronique améliorerait encore la netteté."}`}]; },
  /* tsunami : célérité en eau profonde, durée de propagation, temps disponible pour évacuer */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const h=rnd([3000,4000,4500,5000]), Dk=rnd([300,500,700,900,1200,1500,2000,2500]), ta=rnd([10,15,20,30]), te=rnd([30,45,60,90]), v=Math.sqrt(9.81*h), t=Dk*1000/v/60; return {h,Dk,ta,te,v,t,m:t-ta}; },
      o=>far(o.m,o.te,0.08)&&o.m>0&&(o.m>=o.te)===want);
    const ok=o.m>=o.te;
    const ctx=`Un séisme sous-marin se produit à ${nf(o.Dk,0)} km d'une île. En plein océan, où la profondeur vaut h = ${nf(o.h,0)} m, la vague de tsunami se propage à la célérité ${F("v = √(g·h)")}, avec g = 9,81 m/s². On suppose la profondeur constante sur tout le trajet.`;
    return [{ctx,q:"Calcule la célérité du tsunami en plein océan.",type:"num",ans:o.v,tolR:0.02,unit:"m/s",
        expl:`${F("v = √(g·h)")} = √(9,81 × ${nf(o.h,0)}) = ${U(o.v,"m/s")}, soit ${nf(o.v*3.6,0)} km/h : une vitesse comparable à celle d'un avion.`},
      {q:"Combien de temps le tsunami met-il pour atteindre l'île, en minutes ?",type:"num",ans:o.t,tolR:0.02,unit:"min",
        expl:`${F(`Δt = ${FRAC("d","v")}`)} = ${FRAC(`${nf(o.Dk*1000,0)} m`,`${nf(o.v,1)} m/s`)} = ${nf(o.t*60,0)} s, soit ${U(o.t,"min")}.`},
      {q:`L'alerte est diffusée ${o.ta} min après le séisme et l'évacuation des zones côtières demande ${o.te} min. L'évacuation peut-elle être terminée avant l'arrivée de la vague ?`,type:"ch",ch:YN,ok:ok?0:1,
        expl:`Temps disponible après l'alerte : ${nf(o.t,1)} − ${o.ta} = ${nf(o.m,1)} min ${ok?"≥":"&lt;"} ${o.te} min : ${ok?"l'évacuation peut être terminée à temps.":"l'évacuation ne peut pas être terminée à temps ; il faut se réfugier en hauteur au plus près."} Près des côtes, la profondeur diminue et le tsunami ralentit : le modèle est prudent.`}]; }
];

POOLS["phy-ondes"]={
  titre:"Ondes, son, interférences",
  fiche:{t:"Ondes, son et interférences",l:[
    `Onde progressive : énergie transportée sans matière ; ${F(`v = ${FRAC("d","Δt")}`)} ; ${F(`λ = v·T = ${FRAC("v","f")}`)} ; écho (aller et retour) : ${F(`d = ${FRAC("v·Δt","2")}`)}.`,
    `Son audible de 20 Hz à 20 kHz (ultrasons au-delà) ; niveau sonore ${F(`L = 10·log(${FRAC("I","I₀")})`)}, I₀ = 10<sup>−12</sup> W/m² ; plusieurs sources : ${F("I = I₁ + I₂")}.`,
    `Source ponctuelle : ${F(`I = ${FRAC("P","4π·r²")}`)} (distance doublée : −6 dB) ; Doppler, source qui se rapproche : ${F("f_R > f_E")} et ${F(`|Δf| ≈ ${FRAC("f_E·v_S","v")}`)}.`,
    `Diffraction : ${F(`θ ≈ ${FRAC("λ","a")}`)} ; interférences constructives si ${F("δ = k·λ")}, destructives si δ = (k + ½)·λ ; interfrange ${F(`i = ${FRAC("λ·D","b")}`)}.`,
    "Pièges : additionner des dB (deux sources identiques : +3 dB seulement), oublier l'aller-retour de l'écho, λ et a dans des unités différentes, f en kHz au lieu de Hz."]},
  count:{1:4,2:4,3:3},1:OND1,2:OND2,3:OND3
};
/* ======================================================================
   FIGURES : TRANSMISSION (préfixe fx_trm_)
   ====================================================================== */
/* chronogramme d'une liaison série asynchrone : o.ch = [{d, nb, p, ns}] caractères (d : donnée, émise poids faible en premier ;
   nb : bits de données ; p : bit de parité ou null ; ns : bits de stop), o.gap : bits de repos entre caractères,
   o.lab : noms des bits sous le signal (un seul caractère), o.br : accolade « caractère k » sous chaque caractère,
   o.ax = {dt, u, lab:[indices de bits à graduer]} : axe des temps (dt = durée d'un bit), o.cap : légende */
function fx_trm_uart(o){
  const chars=o.ch, gap=o.gap==null?2:o.gap, lv=[1], idx=[];
  chars.forEach((c,k)=>{ const nb=c.nb||8, st=lv.length; lv.push(0); for(let i=0;i<nb;i++) lv.push((c.d>>i)&1); if(c.p!=null) lv.push(c.p); for(let i=0;i<(c.ns||1);i++) lv.push(1);
    idx.push([st,lv.length,c]); if(k<chars.length-1) for(let i=0;i<gap;i++) lv.push(1); });
  lv.push(1);
  const n=lv.length, X0=34, W=358, w=W/n, yH=o.cote?40:24, yL=yH+40, xs=i=>X0+i*w;
  let s=T(X0-8,yH+5,"1","v-lab s","end")+T(X0-8,yL+5,"0","v-lab s","end");
  idx.forEach(([a,b])=>{ for(let i=a;i<=b;i++) s+=L(xs(i),yH-6,xs(i),yL+6,"v-grid"); });
  const pts=[]; lv.forEach((v,i)=>{ const y=v?yH:yL; pts.push([xs(i),y],[xs(i+1),y]); });
  s+=poly(pts,"v-curve");
  let y=yL+20;
  if(o.lab){ const [a,,c]=idx[0], nb=c.nb||8, lb=["Start",...Array.from({length:nb},(_,i)=>"D"+i),...(c.p!=null?["P"]:[]),...Array(c.ns||1).fill("Stop")];
    lb.forEach((t,i)=>{ s+=T(xs(a+i+0.5),y,t,t.length>2?"v-sm":"v-cap","middle"); }); y+=16; }
  if(o.br){ idx.forEach(([a,b],k)=>{ s+=`<polyline points="${xs(a)+2},${y-10} ${xs(a)+2},${y-4} ${xs(b)-2},${y-4} ${xs(b)-2},${y-10}" class="v-thin"/>`+T((xs(a)+xs(b))/2,y+10,`caractère ${k+1}`,"v-cap","middle"); }); y+=22; }
  if(o.ax){ const a0=idx[0][0]; y+=4; s+=L(xs(0),y,X0+W,y,"v-ink","k");
    o.ax.lab.forEach(i=>{ const x=xs(a0+i); s+=L(x,y-4,x,y+4,"v-ink")+T(x,y+17,nf(i*o.ax.dt,3),"v-lab s","middle"); });
    for(let i=0;a0+i<=n;i++) s+=L(xs(a0+i),y-2.5,xs(a0+i),y+2.5,"v-thin");
    s+=T(X0+W,y+32,`t (${o.ax.u})`,"v-cap","end"); y+=38; }
  if(o.cote){ const {a,b,t}=o.cote, a0=idx[0][0]; s+=L(xs(a0+a),yH-2,xs(a0+a),yH-18,"v-dash")+L(xs(a0+b),yH-2,xs(a0+b),yH-18,"v-dash")+cote(xs(a0+a),xs(a0+b),yH-14,esc(t)); }
  if(o.cap){ s+=T(200,y+4,esc(o.cap),"v-cap","middle"); y+=16; }
  return svg(y+4,s,o.alt||"Chronogramme d'une liaison série : niveau logique de la ligne en fonction du temps");
}
/* structure d'une trame : o.f = [{n : nom, s : taille (texte), w : largeur relative, q : champ surligné}], o.cap */
function fx_trm_trame(o){
  const f=o.f, tot=f.reduce((a,x)=>a+(x.w||1),0), X0=6, W=388, y=30, h=42;
  let x=X0, s=L(X0,14,X0+86,14,"v-f","f")+T(X0+92,18,"ordre d'émission","v-cap");
  f.forEach(fd=>{ const w=W*(fd.w||1)/tot, ln=wrapTxt(fd.n,Math.max(4,Math.floor(w/6.3))).slice(0,2);
    s+=`<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" class="${fd.q?"v-boxq":"v-box"}"/>`+multi(x+w/2,y+h/2-(ln.length-1)*6+4,ln,"v-smb","middle",12);
    if(fd.s) s+=T(x+w/2,y+h+15,esc(fd.s),"v-sm","middle");
    x+=w; });
  let yy=y+h+(f.some(fd=>fd.s)?32:14);
  if(o.cap){ s+=T(200,yy,esc(o.cap),"v-cap","middle"); yy+=10; }
  return svg(yy+6,s,o.alt||"Structure d'une trame : champs dans l'ordre d'émission");
}
/* bus I2C : un maître, les lignes SDA et SCL, des esclaves o.sl = [{n : nom, a : adresse (texte), q}] */
function fx_trm_bus(o){
  const sl=o.sl, n=sl.length, yA=48, yC=66, xb=86, xe=372, Wd=(xe-xb)/n, yS=100, hS=62;
  let s=`<rect x="6" y="30" width="64" height="54" rx="4" class="v-body"/>`+multi(38,45,["Maître","(micro-","contrôleur)"],"v-sm","middle",12);
  s+=L(70,yA,394,yA,"v-ink")+L(70,yC,394,yC,"v-ink")+T(73,yA-5,"SDA","v-lab s")+T(73,yC-5,"SCL","v-lab s");
  s+=L(372,14,394,14,"v-thin")+T(368,18,"+V","v-lab s","end");
  [[380,yA],[390,yC]].forEach(([x,y])=>{ s+=L(x,14,x,18,"v-thin")+`<rect x="${x-3}" y="18" width="6" height="14" class="v-box"/>`+L(x,32,x,y,"v-thin")+`<circle cx="${x}" cy="${y}" r="2.4" class="v-pt"/>`; });
  sl.forEach((d,i)=>{ const cx=xb+Wd*(i+0.5), w=Math.min(Wd-8,90), ln=wrapTxt(d.n,Math.floor(w/5.6)).slice(0,3);
    s+=L(cx-9,yA,cx-9,yS,"v-thin")+L(cx+9,yC,cx+9,yS,"v-thin")+`<circle cx="${(cx-9).toFixed(1)}" cy="${yA}" r="2.4" class="v-pt"/><circle cx="${(cx+9).toFixed(1)}" cy="${yC}" r="2.4" class="v-pt"/>`;
    s+=`<rect x="${(cx-w/2).toFixed(1)}" y="${yS}" width="${w.toFixed(1)}" height="${hS}" rx="4" class="${d.q?"v-boxq":"v-box"}"/>`+multi(cx,yS+15,ln,"v-sm","middle",12)+T(cx,yS+hS-8,esc(d.a),d.q?"v-lab s c":"v-lab s","middle"); });
  let h=yS+hS+10; s+=T(200,h+6,esc(o.cap||"SDA : données · SCL : horloge, fournie par le maître"),"v-cap","middle"); h+=14;
  return svg(h,s,o.alt||"Bus I2C : un maître et des esclaves reliés par les lignes SDA et SCL");
}
/* réseau local : o.h = [{n : nom, ip : texte, q}] (2 à 4 appareils), o.net : légende du réseau, o.gw : adresse du routeur côté réseau local,
   o.ext : réseau extérieur (texte ou lignes de texte) */
function fx_trm_reseau(o){
  const h=o.h, n=h.length, hb=38, gap=10, H=n*hb+(n-1)*gap, y0=28, ym=y0+H/2;
  let s=o.net?T(6,16,esc(o.net),"v-cap"):"";
  h.forEach((x,i)=>{ const y=y0+i*(hb+gap); s+=`<rect x="6" y="${y}" width="128" height="${hb}" rx="4" class="${x.q?"v-boxq":"v-box"}"/>`+T(70,y+15,esc(x.n),"v-sm","middle")+T(70,y+31,esc(x.ip),x.q?"v-lab s c":"v-lab s","middle")+L(134,y+hb/2,158,y+hb/2,"v-thin"); });
  s+=`<rect x="158" y="${y0}" width="22" height="${H}" rx="3" class="v-body"/>`+T(169,y0+H+14,"commutateur","v-cap","middle");
  if(o.gw){ const xr=200;
    s+=L(180,ym,xr,ym,"v-thin")+`<rect x="${xr}" y="${ym-24}" width="74" height="48" rx="24" class="v-box"/>`+T(xr+37,ym-3,"routeur","v-sm","middle")+T(xr+37,ym+11,"(passerelle)","v-sm","middle");
    s+=T(xr+37,ym+40,esc(o.gw),"v-lab s","middle");
    const ex=[].concat(o.ext||"Internet");
    s+=L(xr+74,ym,286,ym,"v-thin")+`<ellipse cx="340" cy="${ym}" rx="54" ry="${ex.length>2?32:ex.length>1?26:22}" class="v-body"/>`+multi(340,ym+4-(ex.length-1)*6.5,ex,"v-sm","middle"); }
  const H0=Math.max(y0+H+22,o.gw?ym+50:0);
  return svg(H0,s,o.alt||"Réseau local : appareils reliés à un commutateur, routeur vers l'extérieur");
}
/* modèle en couches : deux piles (émetteur, récepteur), o.q : indice de la couche marquée « ? » */
function fx_trm_couches(o){
  const Lc=["Application","Transport","Réseau (Internet)","Accès réseau"], y0=26, hh=30, w=138, xa=26, xb=236;
  let s=T(xa+w/2,y0-9,"appareil émetteur","v-cap","middle")+T(xb+w/2,y0-9,"appareil récepteur","v-cap","middle");
  Lc.forEach((t,i)=>{ const y=y0+i*hh, q=o.q===i; [xa,xb].forEach(x=>{ s+=`<rect x="${x}" y="${y}" width="${w}" height="${hh}" class="${q?"v-boxq":"v-box"}"/>`+T(x+w/2,y+19,q?"?":t,q?"v-lab c":"v-sm","middle"); }); });
  const yb=y0+4*hh;
  s+=L(xa-12,y0+4,xa-12,yb-2,"v-el","a")+L(xb+w+12,yb-2,xb+w+12,y0+4,"v-el","a");
  s+=`<polyline points="${xa+w/2},${yb} ${xa+w/2},${yb+18} ${xb+w/2},${yb+18} ${xb+w/2},${yb}" class="v-me"/>`+T(200,yb+34,"support physique (câble, ondes radio)","v-cap","middle");
  return svg(yb+42,s,o.alt||"Modèle en couches : chaque couche de l'émetteur dialogue avec la même couche du récepteur");
}

/* ======================================================================
   TRAMES, PROTOCOLES, RÉSEAUX — info-transmission
   ====================================================================== */
/* formats de liaison série asynchrone : nom, bits de données, parité (0 : aucune, 1 : paire, 2 : impaire), bits de stop */
const FMT=[{n:"8N1",d:8,p:0,s:1},{n:"8E1",d:8,p:1,s:1},{n:"8O1",d:8,p:2,s:1},{n:"7E1",d:7,p:1,s:1},{n:"8N2",d:8,p:0,s:2}];
const fBits=f=>1+f.d+(f.p?1:0)+f.s;
const fTxt=f=>`1 bit de start, ${f.d} bits de données, ${f.p?`1 bit de parité ${f.p===1?"paire":"impaire"}`:"pas de parité"}, ${f.s} bit${f.s>1?"s":""} de stop`;
const BAUD=[1200,2400,4800,9600,19200,38400,57600,115200];
const dAff=D=>D>=1e6&&D%1e5===0?`${nf(D/1e6,1)} Mbit/s`:D>=1e5&&D%1000===0?`${nf(D/1e3,0)} kbit/s`:`${nf(D,0)} bit/s`;
/* durée : valeur et unité lisibles (µs, ms ou s) */
const tPick=t=>t<1e-3?[t*1e6,"µs"]:t<1?[t*1e3,"ms"]:[t,"s"];
const p10u=u=>u==="µs"?` × ${p10(-6)}`:u==="ms"?` × ${p10(-3)}`:"";
/* binaire et hexadécimal */
const bin=(n,b)=>n.toString(2).padStart(b,"0");
const bg=s=>s.replace(/\B(?=(?:[01]{4})+$)/g," ");
const Bn=(n,b)=>`(${bg(bin(n,b||8))})₂`;
const hx2=n=>"0x"+n.toString(16).toUpperCase().padStart(2,"0");
const pop=n=>{ let c=0; for(;n;n>>>=1) c+=n&1; return c; };
/* adresses IPv4 (tableaux de 4 octets) ; p : nombre de bits à 1 du masque */
const ipS=a=>a.join(".");
const mOf=p=>[0,1,2,3].map(i=>{ const b=Math.max(0,Math.min(8,p-8*i)); return b?256-2**(8-b):0; });
const ipAnd=(a,m)=>a.map((x,i)=>x&m[i]);
const ipBc=(net,p)=>{ const m=mOf(p); return net.map((x,i)=>x|(255-m[i])); };
const hostsN=p=>2**(32-p)-2;
/* supports de transmission (ordres de grandeur) */
const SUPT=table(["Support","Portée typique","Débit typique","Consommation"],[["Filaire (Ethernet)","100 m par câble","100 Mbit/s à 1 Gbit/s","appareil sur secteur"],["Wi-Fi","≈ 50 m en intérieur","≈ 100 Mbit/s","élevée"],["Bluetooth basse consommation","≈ 10 à 30 m","≈ 1 Mbit/s","très faible"],["LoRa","2 à 15 km","0,3 à 50 kbit/s","très faible"],["4G","couverture de l'opérateur","≈ 10 à 100 Mbit/s","élevée, abonnement"]]);
const SUPN=["Filaire (Ethernet)","Wi-Fi","Bluetooth basse consommation","LoRa","4G"];
const NEED=[
  ["Un capteur d'humidité, alimenté par pile, placé dans une vanilleraie à 4 km de la ferme, envoie quelques octets toutes les heures.","LoRa","Longue portée (plusieurs kilomètres) et très faible consommation : idéal pour quelques octets par heure sur pile. Son faible débit ne gêne pas ; le Wi-Fi et le Bluetooth n'ont pas la portée, la 4G viderait la pile."],
  ["Une caméra de surveillance, alimentée sur secteur, filme un hangar où l'on ne peut pas tirer de câble ; la box est à 30 m.","Wi-Fi","Un flux vidéo demande plusieurs Mbit/s : ni LoRa ni le Bluetooth basse consommation ne suffisent. La caméra est sur secteur, la consommation du Wi-Fi n'est pas un problème, et 30 m restent dans sa portée."],
  ["Un bracelet d'activité, alimenté par une petite batterie, envoie ses mesures au smartphone porté par la même personne.","Bluetooth basse consommation","Quelques mètres suffisent, le débit demandé est faible, et la très faible consommation préserve la petite batterie : c'est l'usage type du Bluetooth basse consommation."],
  ["Une machine-outil fixe, dans un atelier où les moteurs créent de fortes perturbations radio, échange de gros fichiers avec le serveur du bureau voisin.","Filaire (Ethernet)","Les perturbations radio écartent les liaisons sans fil ; un câble Ethernet est fiable, offre un débit élevé pour les gros fichiers et la machine, fixe, est alimentée sur secteur."],
  ["Un drone de surveillance du lagon transmet en direct la vidéo de sa caméra à un serveur sur Internet, à plusieurs kilomètres de sa base.","4G","Il faut à la fois une grande portée (plusieurs km) et un débit de plusieurs Mbit/s pour la vidéo : seul le réseau 4G de l'opérateur offre les deux. LoRa a la portée mais pas le débit, le Wi-Fi a le débit mais pas la portée."],
  ["Un compteur d'eau, alimenté par une pile qui doit durer dix ans, transmet un index par jour à une antenne située à 3 km.","LoRa","Quelques octets par jour, à 3 km, sur pile pendant des années : il faut une longue portée et une très faible consommation, le débit importe peu. C'est le domaine de LoRa."]];
/* questions de cours */
const COURS_TRM=[
  ["Sur un bus I2C, quel est le rôle de la ligne SCL ?","Transporter le signal d'horloge, fourni par le maître",["Transporter les données dans les deux sens","Alimenter les esclaves","Relier les masses du maître et des esclaves"],"SDA transporte les données, SCL l'horloge qui cadence chaque bit : le bus I2C est une liaison série synchrone, pilotée par le maître."],
  ["Qu'est-ce qui distingue une liaison série synchrone d'une liaison asynchrone ?","La synchrone transmet un signal d'horloge ; l'asynchrone se recale sur le bit de start de chaque caractère",["La synchrone est toujours une liaison sans fil","L'asynchrone transmet un signal d'horloge ; la synchrone utilise des bits de start","Aucune : ce sont deux noms pour la même liaison"],"Liaison synchrone (I2C, SPI) : un fil d'horloge cadence les bits. Liaison asynchrone (UART) : pas d'horloge commune, émetteur et récepteur sont réglés au même débit et le front du bit de start déclenche la lecture de chaque caractère."],
  ["Sur un bus I2C, qui déclenche les échanges ?","Le maître, qui envoie l'adresse de l'esclave choisi",["N'importe quel esclave, dès qu'il a une mesure","L'esclave qui a la plus petite adresse","Le premier esclave branché sur le bus"],"Le maître fournit l'horloge et commence chaque échange par l'adresse de l'esclave visé ; seul cet esclave répond. Deux esclaves ne doivent donc jamais avoir la même adresse."],
  ["Pourquoi une trame envoyée sur un bus partagé contient-elle une adresse ?","Pour que seul l'appareil destinataire la prenne en compte",["Pour détecter les erreurs de transmission","Pour indiquer la longueur des données","Pour synchroniser l'horloge du récepteur"],"Tous les appareils branchés sur le bus reçoivent la trame : chacun compare l'adresse à la sienne et ignore la trame si elle ne lui est pas destinée. La détection d'erreurs est le rôle du champ de contrôle."],
  ["Quelle est la différence entre le débit et la latence d'une liaison ?","Le débit est le nombre de bits transmis par seconde ; la latence est le délai avant l'arrivée des premières données",["Ce sont deux noms de la même grandeur, en bit/s","Le débit se mesure en secondes et la latence en bit/s","La latence est le débit mesuré à la réception"],"Débit en bit/s : il fixe la durée d'envoi d'un gros fichier. Latence en ms : délai de traversée du réseau, qui compte surtout pour les petits messages et les commandes à distance."],
  ["À quoi sert le masque de sous-réseau associé à une adresse IPv4 ?","À séparer la partie « réseau » de la partie « hôte » de l'adresse",["À chiffrer l'adresse pour la sécuriser","À convertir l'adresse IP en adresse MAC","À limiter le débit de l'appareil"],"Les bits à 1 du masque désignent la partie réseau, les bits à 0 la partie hôte. Adresse du réseau = adresse IP ET masque : deux appareils de même adresse de réseau communiquent directement."],
  ["Quel appareil permet à deux réseaux IP différents de communiquer ?","Un routeur (la passerelle)",["Un commutateur (switch)","Un répéteur Wi-Fi","Un câble Ethernet plus long"],"Le commutateur relie les appareils d'un même réseau local. Pour passer d'un réseau à un autre (vers Internet par exemple), les paquets passent par un routeur : c'est la passerelle déclarée dans chaque appareil."],
  ["Dans la chaîne d'information, à quelle fonction la transmission de données par un bus ou un réseau correspond-elle ?","Communiquer",["Acquérir","Traiter","Moduler"],"Chaîne d'information : acquérir (capteurs), traiter (microcontrôleur, programme), communiquer (bus, réseau, liaison radio, interface homme-machine). « Moduler » appartient à la chaîne de puissance."]];

const TRM1=[
  /* durée d'un bit et débit */
  ()=>{ const [c,D]=rnd([["un module GPS à une carte à microcontrôleur",9600],["une carte à microcontrôleur à un ordinateur",115200],["un automate à un variateur (bus RS-485)",19200],["un capteur à un microcontrôleur (bus I2C en mode standard)",100000],["un capteur à un microcontrôleur (bus I2C en mode rapide)",400000],["les calculateurs d'un véhicule (bus CAN)",500000],["un module radio à une carte à microcontrôleur",57600]]);
    if(Math.random()<0.55){ const Tb=1/D;
      return {ctx:`La liaison série qui relie ${c} fonctionne au débit D = ${dAff(D)}.`,q:"Quelle est la durée d'un bit sur cette liaison, en µs ?",type:"num",ans:Tb*1e6,tolR:0.02,unit:"µs",
        expl:`${F(`T_b = ${FRAC("1","D")}`)} = ${FRAC("1",`${nf(D,0)} bit/s`)} = ${sci(Tb,3)} s, soit ${U(Tb*1e6,"µs")}.`}; }
    const Tb=+(1e6/D).toPrecision(3), Dr=1e6/Tb;
    return {ctx:`À l'oscilloscope, on mesure la durée d'un bit sur la liaison série qui relie ${c} : T_b = ${nf(Tb,3)} µs.`,q:"Quel est le débit de cette liaison, en bit/s ?",type:"num",ans:Dr,tolR:0.02,unit:"bit/s",
      expl:`${F(`D = ${FRAC("1","T_b")}`)} = ${FRAC("1",`${nf(Tb,3)} × ${p10(-6)} s`)} = ${U(Dr,"bit/s")}${Math.abs(Dr-D)/D>1e-9?`, soit le débit normalisé ${nf(D,0)} bit/s`:""}.`}; },
  /* format d'une liaison série : nombre de bits par caractère */
  ()=>{ const f=rnd(FMT), nb=fBits(f), c=rnd(["un module Bluetooth","un lecteur de badges","un capteur de CO₂","un module GPS","une balance connectée"]);
    return {ctx:`${cap1(c)} communique par une liaison série asynchrone au format ${f.n} : ${fTxt(f)}.`,q:"Combien de bits la ligne transmet-elle pour envoyer un caractère ?",type:"num",ans:nb,tolA:0,unit:"bits",
      expl:`On compte tous les bits de la trame d'un caractère (start, données${f.p?", parité":""}, stop) : ${F(`1 + ${f.d}${f.p?" + 1":""} + ${f.s} = ${nb} bits`)}. Dans « ${f.n} », le premier chiffre donne le nombre de bits de données, la lettre la parité (N : aucune, E : paire, O : impaire), le dernier chiffre le nombre de bits de stop.`}; },
  /* chronogramme d'un caractère : durée d'un bit lue sur l'axe des temps */
  ()=>{ const f=rnd([FMT[0],FMT[1],FMT[2]]), D=rnd([2400,4800,9600,19200]), nb=fBits(f), d=ri(1,254), p=f.p?(f.p===1?pop(d)%2:1-pop(d)%2):null;
    const tot=nb/D, u=tot>=1e-3?"ms":"µs", k=u==="ms"?1e3:1e6, r=u==="ms"?1000:10, lab=Math.round(tot*k*r)/r, Tb=lab/k/nb*1e6;
    const fig=fx_trm_uart({ch:[{d,p}],lab:1,ax:{dt:lab/nb,u,lab:[0,nb]},cap:`Un caractère au format ${f.n}`});
    return {fig,ctx:"Chronogramme de la ligne pendant l'envoi d'un caractère : t = 0 au début du bit de start.",q:"Détermine la durée d'un bit, en µs.",type:"num",ans:Tb,tolR:0.02,unit:"µs",
      expl:`La trame compte ${nb} bits (start, 8 bits de données${p!=null?", parité":""}, stop) et dure ${nf(lab,3)} ${u}. ${F(`T_b = ${FRAC("durée de la trame",nb)}`)} = ${FRAC(`${nf(lab,3)} ${u}`,nb)} = ${U(Tb,"µs")}. Débit : ${FRAC("1","T_b")} ≈ ${nf(D,0)} bit/s.`}; },
  /* contrôle par bit de parité : ce qu'il détecte, ce qu'il ne permet pas */
  ()=>{ if(Math.random()<0.5) return {ctx:"Chaque octet d'une liaison série est protégé par un bit de parité paire.",q:"Laquelle de ces erreurs de transmission le récepteur ne peut-il pas détecter ?",type:"ch",...mcu("Deux bits du même octet inversés",["Un seul bit de données inversé","Trois bits du même octet inversés","Le bit de parité lui-même inversé"]),
        expl:`La parité compare le nombre de 1 reçus à la règle choisie (pair). Un nombre impair de bits inversés change la parité : l'erreur est détectée. Avec ${F("deux bits inversés")}, le nombre de 1 reste pair : l'erreur passe inaperçue.`};
    return {ctx:"Le récepteur d'une liaison série constate que la parité d'un octet reçu est fausse.",q:"Que peut-il en conclure ?",type:"ch",...mcu("L'octet contient une erreur, mais il ne sait pas quel bit est faux",["Le bit de parité est faux et les données sont justes","Il sait quel bit est faux et peut le corriger","L'octet est juste : seule la vitesse de la liaison est en cause"]),
      expl:`Le bit de parité permet seulement de ${F("détecter")} une erreur (un nombre impair de bits inversés), pas de la localiser ni de la corriger. Le récepteur rejette l'octet ou en demande un nouvel envoi.`}; },
  /* somme de contrôle à ajouter à une trame */
  ()=>{ const n=rnd([3,4,5]), dd=draw(()=>Array.from({length:n},()=>ri(10,250)),a=>a.reduce((x,y)=>x+y,0)>=300), sum=dd.reduce((x,y)=>x+y,0), cs=sum%256, qt=Math.floor(sum/256);
    const sys=rnd(["Une station météo","Un compteur d'eau connecté","Un robot de tri","Une bouée de mesure"]);
    return {ctx:`${sys} envoie les octets de données ${dd.join(" ; ")} (valeurs décimales). Le protocole ajoute une somme de contrôle : la somme des octets de données, dont on ne garde que l'octet de poids faible (reste de la division par 256).`,
      q:"Quelle somme de contrôle l'émetteur ajoute-t-il à la trame ?",type:"num",ans:cs,tolA:0,unit:"",
      expl:`Somme : ${dd.join(" + ")} = ${nf(sum,0)}. Or ${nf(sum,0)} = ${qt} × 256 + ${cs} : on garde le reste, ${F(`somme de contrôle = ${cs}`)}. Le récepteur refait le calcul sur les octets reçus : un résultat différent signale une erreur.`}; },
  /* bus I2C : nombre d'adresses */
  ()=>{ const SL=shuffle([["Capteur de température",0x48],["Centrale inertielle",0x68],["Afficheur",0x3C],["Capteur de pression",0x76],["Horloge temps réel",0x51],["Capteur de luminosité",0x23]]).slice(0,rnd([3,4]));
    const fig=fx_trm_bus({sl:SL.map(([n,a])=>({n,a:hx2(a)}))});
    if(Math.random()<0.55) return {fig,ctx:"Sur ce bus I2C, chaque esclave est identifié par une adresse codée sur 7 bits, écrite ici en hexadécimal.",q:"Combien d'adresses différentes peut-on écrire sur 7 bits ?",type:"num",ans:128,tolA:0,unit:"adresses",
      expl:`Chaque bit prend 2 valeurs : ${F("2⁷ = 128")} adresses, de 0x00 à 0x7F. Le protocole en réserve 16 : on peut brancher jusqu'à 112 esclaves, bien plus que les ${SL.length} du système, à condition que deux esclaves n'aient jamais la même adresse.`};
    const k=rnd([2,3]);
    return {fig,ctx:`On veut ajouter à ce bus plusieurs capteurs de température identiques. Leur adresse sur 7 bits est fixée par le fabricant, sauf les ${k} bits de poids faible, réglés par ${k} broches reliées à 0 ou à 1.`,q:"Combien de ces capteurs identiques peut-on brancher au plus sur le même bus ?",type:"num",ans:2**k,tolA:0,unit:"capteurs",
      expl:`Deux esclaves ne peuvent pas partager une adresse. Les ${k} broches donnent ${F(`2<sup>${k}</sup> = ${2**k}`)} combinaisons, donc ${2**k} adresses différentes pour ce modèle de capteur : ${U(2**k,"capteurs")} au plus.`}; },
  /* IPv4 : adresse du réseau (masque sur des octets entiers) */
  ()=>{ const p=rnd([24,24,16]), a=p===24?[192,168,ri(0,254),ri(2,253)]:[172,ri(16,31),ri(0,255),ri(2,253)], m=mOf(p), net=ipAnd(a,m), bc=ipBc(net,p);
    const dev=rnd(["Un automate","Une caméra IP","Une imprimante 3D connectée","Un onduleur solaire","Une station météo"]);
    const w=[ipS(bc),ipS(p===24?[a[0],a[1],0,0]:[a[0],0,0,0]),ipS([0,0,0,a[3]]),ipS(p===24?[a[0],a[1],a[2],1]:[a[0],a[1],0,1])];
    return {ctx:`${dev} a l'adresse IPv4 ${ipS(a)} avec le masque ${ipS(m)}.`,q:"Quelle est l'adresse du réseau de cet appareil ?",type:"ch",...mcu(ipS(net),w),
      expl:`${F("réseau = adresse IP ET masque")} : un octet 255 du masque conserve l'octet de l'adresse, un octet 0 le met à 0. ${ipS(a)} ET ${ipS(m)} = ${F(ipS(net))}. ${ipS(bc)} est l'adresse de diffusion (bits d'hôte tous à 1).`}; },
  /* IPv4 : même réseau ou non (masque 255.255.255.0) */
  ()=>{ const same=Math.random()<0.5, b3=ri(0,250), A=[192,168,b3,ri(2,120)], B=[192,168,same?b3:b3+ri(1,4),ri(121,253)];
    const [na,nb]=rnd([["Le PC de supervision","l'automate"],["La caméra","l'enregistreur vidéo"],["Le capteur de la serre","le serveur de données"],["La tablette de l'atelier","l'imprimante"]]);
    return {ctx:`${na} (${ipS(A)}) et ${nb} (${ipS(B)}) utilisent tous deux le masque 255.255.255.0.`,q:"Peuvent-ils communiquer directement, sans passer par un routeur ?",type:"ch",ch:YN,ok:same?0:1,
      expl:`Avec le masque 255.255.255.0, les trois premiers octets forment l'adresse du réseau : ${ipS([...A.slice(0,3),0])} et ${ipS([...B.slice(0,3),0])}. ${same?`Même réseau : ${F("communication directe")}, par le commutateur.`:`Réseaux différents : les paquets doivent passer par la ${F("passerelle")} (un routeur).`}`}; },
  /* IPv4 : nombre d'hôtes d'un réseau */
  ()=>{ const p=rnd([16,24,25,26,27,28,29]), m=mOf(p), nh=32-p, H=hostsN(p);
    return {ctx:`Un réseau local utilise le masque ${ipS(m)}, soit ${p} bits à 1 suivis de ${nh} bits à 0.`,q:"Combien d'adresses peut-on attribuer à des appareils (hôtes) dans ce réseau ?",type:"num",ans:H,tolA:0,unit:"adresses",
      expl:`Les ${nh} bits à 0 du masque numérotent les hôtes : 2<sup>${nh}</sup> = ${nf(2**nh,0)} combinaisons. On retire l'adresse du réseau (bits d'hôte tous à 0) et l'adresse de diffusion (tous à 1) : ${F(`2<sup>${nh}</sup> − 2 = ${nf(H,0)}`)}.`}; },
  /* choisir un support de transmission (ordres de grandeur) */
  ()=>{ const [c,ok,why]=rnd(NEED);
    return {data:SUPT,ctx:c,q:"Quel support de transmission est le plus adapté ?",type:"ch",...mcu(ok,shuffle(SUPN.filter(x=>x!==ok)),3),expl:`${F(ok)}. ${why}`}; },
  /* durée de transfert d'un fichier */
  ()=>{ const S=rnd([["une photo","Mo",[2.4,3.2,4.8,6]],["une courte vidéo","Mo",[45,80,120,250]],["un fichier de mesures","ko",[120,350,800]],["la mise à jour du programme d'un robot","Mo",[12,25,40]]]);
    const sz=rnd(S[2]), Dm=rnd([2,5,10,20,50,100]), oct=sz*(S[1]==="Mo"?1e6:1e3), t=8*oct/(Dm*1e6), [tv,tu]=tPick(t);
    return {ctx:`On envoie ${S[0]} de ${nf(sz,1)} ${S[1]} (1 ${S[1]} = ${S[1]==="Mo"?p10(6):p10(3)} octets) sur une liaison de débit utile ${Dm} Mbit/s. On néglige la latence.`,q:`Quelle est la durée du transfert, en ${tu} ?`,type:"num",ans:tv,tolR:0.02,unit:tu,
      expl:`Taille en bits : 8 × ${nf(oct,0)} = ${nf(8*oct,0)} bits. ${F(`t = ${FRAC("8 × taille","D")}`)} = ${FRAC(nf(8*oct,0),nf(Dm*1e6,0))} = ${tu!=="s"?`${nf(t,6)} s, soit ${U(tv,tu)}`:U(tv,tu)}. Piège : oublier le facteur 8 entre octets et bits.`}; },
  /* modèle en couches : rôle d'une couche */
  ()=>{ const k=ri(0,3), R=["Fournir le service au programme de l'utilisateur : page web, messagerie, échanges d'un automate","Découper les données en segments et les remettre au bon programme grâce aux numéros de port (TCP, UDP)","Acheminer les paquets d'un réseau à l'autre grâce aux adresses IP (routage)","Transmettre les trames sur le support physique : câble Ethernet ou Wi-Fi, adresses MAC"];
    return {fig:fx_trm_couches({q:k}),ctx:"Modèle en couches d'une communication sur un réseau (modèle d'Internet, à quatre couches).",q:"Quel est le rôle de la couche marquée « ? » ?",type:"ch",...mcu(R[k],R.filter((_,i)=>i!==k)),
      expl:`De haut en bas : application, transport, réseau (Internet), accès réseau. La couche marquée est la couche ${F(["application","transport","réseau","accès réseau"][k])} : ${R[k].charAt(0).toLowerCase()+R[k].slice(1)}. Chaque couche de l'émetteur ajoute son en-tête, que la même couche du récepteur lit puis retire.`}; },
  /* questions de cours */
  ()=>{ const [q,ok,w,ex]=rnd(COURS_TRM); return {q,type:"ch",...mcu(ok,shuffle(w)),expl:ex}; }
];

/* supports sans fil : nom, portée (m), débit (kbit/s), courant en émission (mA) — ordres de grandeur */
const SUPD=[["Bluetooth basse consommation",30,1000,8],["Zigbee",100,250,25],["Wi-Fi",70,50000,220],["LoRa",5000,5,40],["4G",10000,20000,350]];
const TRM2=[
  /* message de plusieurs caractères : nombre de bits, puis débit */
  ()=>{ const D=rnd([1200,2400,4800,9600]), n=rnd([2,3]), cs=Array.from({length:n},()=>ri(0x30,0x5A)), nb=10*n, [,tu]=tPick(nb/D), k=tu==="ms"?1e3:1e6, lab=Math.round(nb/D*k*1000)/1000, Dm=nb/(lab/k);
    const fig=fx_trm_uart({ch:cs.map(d=>({d})),gap:0,br:1,ax:{dt:lab/nb,u:tu,lab:[0,nb]},cap:"Caractères au format 8N1, envoyés à la suite"});
    const ctx="Un module envoie un court message sur une liaison série asynchrone au format 8N1 (1 bit de start, 8 bits de données, 1 bit de stop). Le chronogramme montre tout le message ; t = 0 au début du premier bit de start.";
    return [{fig,ctx,q:"Combien de bits la ligne transmet-elle pour tout ce message ?",type:"num",ans:nb,tolA:0,unit:"bits",
        expl:`Le message compte ${n} caractères (chacun commence par un bit de start à 0) ; un caractère 8N1 occupe 10 bits : ${F(`${n} × 10 = ${nb} bits`)}.`},
      {q:"Quel est le débit de la liaison, en bit/s ?",type:"num",ans:Dm,tolR:0.02,unit:"bit/s",
        expl:`Le message dure ${nf(lab,3)} ${tu}. ${F(`D = ${FRAC("N_bits","durée")}`)} = ${FRAC(nb,`${nf(lab,3)}${p10u(tu)} s`)} = ${U(Dm,"bit/s")}${Math.abs(Dm-D)/D>1e-6?`, soit le débit normalisé ${nf(D,0)} bit/s`:""}.`}]; },
  /* efficacité d'un format et nombre de caractères par seconde */
  ()=>{ const f=rnd(FMT), D=rnd([9600,19200,38400,57600,115200]), nb=fBits(f), eta=f.d/nb, cps=D/nb;
    const ctx=`Une liaison série asynchrone fonctionne à ${dAff(D)} au format ${f.n} : ${fTxt(f)}.`;
    return [{ctx,q:`Quelle est l'efficacité η = ${FRAC("bits de données","bits transmis")} de cette liaison ?`,type:"num",ans:eta,tolA:0.006,unit:"",
        expl:`Chaque caractère occupe ${nb} bits sur la ligne, dont ${f.d} bits de données : ${F(`η = ${FRAC(f.d,nb)}`)} = ${U(eta,"")}, soit ${nf(eta*100,1)} % du débit.`},
      {q:"Combien de caractères la liaison transmet-elle au plus par seconde ?",type:"num",ans:cps,tolR:0.02,unit:"caractères/s",
        expl:`Un caractère occupe ${nb} bits : ${F(`N = ${FRAC("D",nb)}`)} = ${FRAC(nf(D,0),nb)} = ${U(cps,"caractères/s")}. Débit utile : η × D = ${nf(eta*D,0)} bit/s de données.`}]; },
  /* trame d'un protocole de bus de terrain : bits sur la ligne, durée */
  ()=>{ const nd=rnd([2,4,6,8]), f=rnd([FMT[0],FMT[1],FMT[4]]), D=rnd([9600,19200,38400,115200]), nO=nd+4, nbt=nO*fBits(f), t=nbt/D, [tv,tu]=tPick(t);
    const fig=fx_trm_trame({f:[{n:"Adresse",s:"1 octet"},{n:"Fonction",s:"1 octet"},{n:"Données",s:`${nd} octets`,w:Math.max(1.5,nd/2)},{n:"Contrôle",s:"2 octets",w:1.2}],cap:`Chaque octet est envoyé au format ${f.n}`});
    const ctx=`Sur un bus de terrain à ${dAff(D)}, un variateur répond à l'automate par la trame ci-dessous. Chaque octet est envoyé au format ${f.n} : ${fTxt(f)}.`;
    return [{fig,ctx,q:"Combien de bits circulent sur la ligne pour cette réponse ?",type:"num",ans:nbt,tolA:0,unit:"bits",
        expl:`La trame compte 1 + 1 + ${nd} + 2 = ${nO} octets ; chacun occupe ${fBits(f)} bits sur la ligne : ${F(`${nO} × ${fBits(f)} = ${nbt} bits`)}.`},
      {q:`Quelle est la durée de cette trame, en ${tu} ?`,type:"num",ans:tv,tolR:0.02,unit:tu,
        expl:`${F(`t = ${FRAC("N_bits","D")}`)} = ${FRAC(nbt,nf(D,0))} = ${nf(t,6)} s, soit ${U(tv,tu)}.`}]; },
  /* somme de contrôle : vérification à la réception */
  ()=>{ const dd=Array.from({length:4},()=>ri(10,245)), cs=dd.reduce((a,b)=>a+b,0)%256, err=Math.random()<0.5, rx=dd.slice();
    if(err){ const i=ri(0,3); rx[i]^=rnd([1,2,4,8,16,32,64]); }
    const s2=rx.reduce((a,b)=>a+b,0), c2=s2%256, det=c2!==cs;
    const ctx=`Une station envoie 4 octets de données suivis d'une somme de contrôle : la somme des 4 octets, dont on ne garde que l'octet de poids faible (reste de la division par 256). Le récepteur reçoit les données ${rx.join(" ; ")} et la somme de contrôle ${cs} (valeurs décimales).`;
    return [{ctx,q:"Quelle somme de contrôle le récepteur calcule-t-il à partir des données reçues ?",type:"num",ans:c2,tolA:0,unit:"",
        expl:`${rx.join(" + ")} = ${nf(s2,0)} = ${Math.floor(s2/256)} × 256 + ${c2} : le récepteur trouve ${F(String(c2))}.`},
      {q:"Le récepteur détecte-t-il une erreur de transmission ?",type:"ch",ch:YN,ok:det?0:1,
        expl:`Il compare son résultat (${c2}) à la somme de contrôle reçue (${cs}). ${det?`Elles diffèrent : ${F("erreur détectée")} ; la trame est rejetée ou redemandée.`:"Elles sont égales : aucune erreur n'est détectée."}`}]; },
  /* bus I2C : premier octet d'un échange (adresse sur 7 bits + bit de sens) */
  ()=>{ const SL=shuffle([["Capteur de température",0x48],["Centrale inertielle",0x68],["Afficheur",0x3C],["Capteur de pression",0x76],["Horloge temps réel",0x51],["Capteur de luminosité",0x23],["Capteur d'humidité",0x40]]).slice(0,4);
    const [nm,ad]=rnd(SL), rw=ri(0,1), by=(ad<<1)|rw, fig=fx_trm_bus({sl:SL.map(([n,a])=>({n,a:hx2(a)}))});
    const ctx=`Le maître commence chaque échange par un octet formé des 7 bits de l'adresse de l'esclave (poids fort en premier), suivis d'un bit de sens : 1 pour une lecture, 0 pour une écriture. L'analyseur logique relève ce premier octet : ${Bn(by)}.`;
    return [{fig,ctx,q:"Quel esclave le maître appelle-t-il ?",type:"ch",...mc(nm,SL.filter(x=>x[0]!==nm).map(x=>x[0])),
        expl:`Les 7 premiers bits forment l'adresse : ${F(`(${bg(bin(ad,7))})₂ = ${ad} = ${hx2(ad)}`)}, soit : ${nm.charAt(0).toLowerCase()+nm.slice(1)}. Lire les 8 bits comme une adresse donnerait ${hx2(by)}, qui n'est l'adresse d'aucun esclave du bus.`},
      {q:"Le maître veut-il lire ou écrire dans cet esclave ?",type:"ch",ch:["Lire (lecture)","Écrire (écriture)"],ok:rw?0:1,
        expl:`Le dernier bit de l'octet est le bit de sens : il vaut ${rw}, donc ${rw?"lecture : l'esclave va envoyer des données au maître.":"écriture : le maître va envoyer des données (par exemple le numéro d'un registre) à l'esclave."}`}]; },
  /* bus I2C : durée d'une lecture */
  ()=>{ const k=rnd([1,2,6]), fk=rnd([100,400]), nper=9*(3+k), t=nper/(fk*1000);
    const ctx=`Pour lire ${k===1?"1 octet":`${k} octets`} de mesure dans un capteur, le maître envoie sur le bus I2C l'octet d'adresse (écriture), le numéro du registre, à nouveau l'octet d'adresse (lecture), puis reçoit ${k===1?"l'octet":`les ${k} octets`} de données. Chaque octet occupe 9 périodes d'horloge (8 bits + 1 bit d'acquittement) ; on néglige les conditions de départ et d'arrêt. Horloge SCL : ${fk} kHz.`;
    return [{ctx,q:"Combien de périodes d'horloge dure cette lecture ?",type:"num",ans:nper,tolA:0,unit:"périodes",
        expl:`3 octets de service + ${k} octet${k>1?"s":""} de données = ${3+k} octets de 9 périodes : ${F(`9 × ${3+k} = ${nper} périodes`)}.`},
      {q:"Quelle est la durée de cette lecture, en µs ?",type:"num",ans:t*1e6,tolR:0.02,unit:"µs",
        expl:`Une période dure ${FRAC("1",`${fk} × ${p10(3)} Hz`)} = ${nf(1e6/(fk*1000),2)} µs. ${F(`t = ${nper} × ${nf(1e6/(fk*1000),2)} µs`)} = ${U(t*1e6,"µs")}.`}]; },
  /* IPv4 : adresse du réseau et nombre d'hôtes avec un masque qui coupe le dernier octet */
  ()=>{ const p=rnd([25,26,27,28]), m=mOf(p), blk=2**(32-p), b3=ri(0,254), last=draw(()=>ri(1,254),x=>x%blk!==0&&x%blk!==blk-1), a=[192,168,b3,last], net=ipAnd(a,m), bc=ipBc(net,p), H=hostsN(p);
    const w=[ipS([192,168,b3,0]),ipS(bc),...(net[3]+blk<256?[ipS([192,168,b3,net[3]+blk])]:[]),ipS([192,168,0,0]),ipS([192,168,b3,last-1])];
    const ctx=`Un automate a l'adresse ${ipS(a)} ; le masque du réseau est ${ipS(m)}.`;
    return [{ctx,q:"Quelle est l'adresse du réseau de l'automate ?",type:"ch",...mcu(ipS(net),w),
        expl:`Seul le dernier octet est coupé par le masque : ${m[3]} = ${Bn(m[3])}. ${last} = ${Bn(last)} ; ${Bn(last)} ET ${Bn(m[3])} = ${Bn(net[3])} = ${net[3]}. ${F(`Réseau : ${ipS(net)}`)}.`},
      {q:"Combien d'appareils ce réseau peut-il accueillir au plus ?",type:"num",ans:H,tolA:0,unit:"appareils",
        expl:`Le masque a ${32-p} bits à 0 : ${F(`2<sup>${32-p}</sup> − 2 = ${H}`)} adresses d'hôtes. On retire l'adresse du réseau ${ipS(net)} et celle de diffusion ${ipS(bc)}.`}]; },
  /* IPv4 : même sous-réseau ? (masque qui coupe le dernier octet) */
  ()=>{ const p=rnd([25,26,27,28]), m=mOf(p), blk=2**(32-p), nbk=256/blk, b3=ri(1,254), k=ri(0,nbk-1), same=Math.random()<0.5;
    const a4=k*blk+ri(1,blk-2), k2=same?k:(k<nbk-1?k+1:k-1), b4=draw(()=>k2*blk+ri(1,blk-2),x=>x!==a4);
    const A=[192,168,b3,a4], B=[192,168,b3,b4], nA=ipAnd(A,m), nB=ipAnd(B,m);
    const [na,nb2]=rnd([["Le robot","la borne de recharge"],["La caméra","l'enregistreur"],["Le PC","l'automate"],["La balance connectée","le serveur"]]);
    return {ctx:`${na} (${ipS(A)}) et ${nb2} (${ipS(B)}) utilisent le masque ${ipS(m)}.`,q:"Ces deux appareils sont-ils dans le même sous-réseau ?",type:"ch",ch:YN,ok:same?0:1,
      expl:`On calcule l'adresse de réseau de chacun (dernier octet ET ${m[3]} = ${Bn(m[3])}) : ${a4} = ${Bn(a4)} donne ${nA[3]} ; ${b4} = ${Bn(b4)} donne ${nB[3]}. Réseaux : ${ipS(nA)} et ${ipS(nB)}. ${same?`${F("Même sous-réseau")} : ils communiquent directement.`:`${F("Sous-réseaux différents")} : il faut passer par un routeur, même si les adresses se ressemblent.`}`}; },
  /* latence et débit : quelle liaison livre le fichier le plus tôt ? */
  ()=>{ const o=draw(()=>{ const small=Math.random()<0.5, sz=small?rnd([2,5,10,20]):rnd([20,50,100,200]), u=small?"ko":"Mo", oct=sz*(small?1e3:1e6), DA=rnd([10,20,30]), lA=rnd([30,40,50]), DB=rnd([50,80,100]), lB=rnd([550,600,650]);
        return {sz,u,oct,DA,lA,DB,lB,tA:lA/1000+8*oct/(DA*1e6),tB:lB/1000+8*oct/(DB*1e6)}; },o=>far(o.tA,o.tB,0.15));
    const [tv,tu]=tPick(o.tA), best=o.tA<o.tB;
    const ctx=`Un centre de plongée envoie un fichier de ${nf(o.sz,0)} ${o.u} (1 ${o.u} = ${o.u==="Mo"?p10(6):p10(3)} octets) à son serveur. Deux liaisons sont possibles : 4G (débit ${o.DA} Mbit/s, latence ${o.lA} ms) ou satellite géostationnaire (débit ${o.DB} Mbit/s, latence ${o.lB} ms). Durée totale : ${F(`t = latence + ${FRAC("8 × taille","D")}`)}.`;
    return [{ctx,q:`Quelle est la durée totale de l'envoi par la 4G, en ${tu} ?`,type:"num",ans:tv,tolR:0.02,unit:tu,
        expl:`Envoi : ${FRAC(`8 × ${nf(o.oct,0)}`,`${o.DA} × ${p10(6)}`)} = ${nf(8*o.oct/(o.DA*1e6),5)} s ; on ajoute la latence ${nf(o.lA/1000,3)} s : ${nf(o.tA,5)} s${tu!=="s"?`, soit ${U(tv,tu)}`:` ≈ ${U(tv,tu)}`}.`},
      {q:"Quelle liaison livre le fichier le plus tôt ?",type:"ch",ch:["La liaison 4G","La liaison satellite"],ok:best?0:1,
        expl:`Satellite : ${nf(o.lB/1000,2)} + ${FRAC(`8 × ${nf(o.oct,0)}`,`${o.DB} × ${p10(6)}`)} = ${nf(o.tB,4)} s, contre ${nf(o.tA,4)} s en 4G. ${best?"Pour ce petit fichier, la latence domine : la 4G l'emporte malgré son débit plus faible.":"Pour ce gros fichier, c'est le débit qui compte : le satellite l'emporte malgré sa grande latence."}`}]; },
  /* débit nécessaire pour un flux de mesures, choix du débit normalisé */
  ()=>{ const o=draw(()=>{ const nm=rnd([10,20,50,100,200]), no=rnd([4,6,8,12]), f=rnd([FMT[0],FMT[1]]), need=nm*no*fBits(f), std=BAUD.find(b=>b>=need); return {nm,no,f,need,std}; },
      o=>o.std&&o.need/o.std<=0.97&&o.need>=1000&&BAUD.indexOf(o.std)>=1);
    const i=BAUD.indexOf(o.std), s0=ri(Math.max(0,i-3),Math.min(i,BAUD.length-4)), opts=BAUD.slice(s0,s0+4), nbt=o.no*fBits(o.f);
    const sys=rnd(["Un accéléromètre de surveillance vibratoire","Le capteur de couple d'un banc d'essai","La centrale de mesure d'une éolienne","Le capteur de position d'un vérin"]);
    const ctx=`${sys} envoie ${o.nm} mesures par seconde ; chaque mesure forme une trame de ${o.no} octets, envoyés au format ${o.f.n} : ${fTxt(o.f)}.`;
    return [{ctx,q:"Quel débit minimal la liaison doit-elle assurer, en bit/s ?",type:"num",ans:o.need,tolA:0,unit:"bit/s",
        expl:`Bits par trame : ${o.no} × ${fBits(o.f)} = ${nbt} bits. ${F(`D_min = ${o.nm} × ${nbt}`)} = ${U(o.need,"bit/s")}.`},
      {q:"Quel est le plus petit débit normalisé qui convient ?",type:"ch",ch:opts.map(b=>`${nf(b,0)} bit/s`),ok:opts.indexOf(o.std),
        expl:`Il faut au moins ${nf(o.need,0)} bit/s : ${nf(BAUD[i-1],0)} bit/s est insuffisant, ${F(`${nf(o.std,0)} bit/s`)} est le plus petit débit normalisé qui convient.`}]; },
  /* choisir un support sans fil selon trois exigences chiffrées */
  ()=>{ const o=draw(()=>{ const P=rnd([20,50,80,500,1000,3000]), Dm=rnd([1,2,50,100,500,2000,10000]), Im=rnd([10,30,50,100,300,500]);
        return {P,Dm,Im,okL:SUPD.filter(s=>s[1]>=P&&s[2]>=Dm&&s[3]<=Im)}; },
      o=>o.okL.length===1&&SUPD.every(s=>far(s[1],o.P,0.03)&&far(s[2],o.Dm,0.03)&&far(s[3],o.Im,0.03)));
    const good=o.okL[0], others=shuffle(SUPD.filter(s=>s!==good)).slice(0,3);
    const why=s=>{ const r=[]; if(s[1]<o.P) r.push(`portée ${nf(s[1],0)} m &lt; ${nf(o.P,0)} m`); if(s[2]<o.Dm) r.push(`débit ${nf(s[2],0)} kbit/s &lt; ${nf(o.Dm,0)} kbit/s`); if(s[3]>o.Im) r.push(`courant ${s[3]} mA > ${o.Im} mA`); return `${s[0]} : ${r.join(", ")}`; };
    const data=table(["Support","Portée (m)","Débit (kbit/s)","Courant en émission (mA)"],SUPD.map(s=>[s[0],nf(s[1],0),nf(s[2],0),String(s[3])]));
    return {data,ctx:`Cahier des charges de la liaison sans fil d'un capteur : portée d'au moins ${nf(o.P,0)} m, débit d'au moins ${nf(o.Dm,0)} kbit/s, courant en émission d'au plus ${o.Im} mA (alimentation par pile).`,
      q:"Quel support satisfait les trois exigences ?",type:"ch",...mc(good[0],others.map(s=>s[0])),
      expl:`${F(good[0])} : ${nf(good[1],0)} m, ${nf(good[2],0)} kbit/s, ${good[3]} mA, les trois exigences sont satisfaites. Les autres échouent : ${SUPD.filter(s=>s!==good).map(why).join(" ; ")}.`}; },
  /* choisir le masque d'un réseau selon le nombre d'appareils */
  ()=>{ const p=rnd([24,25,26,27,28,29]), N=ri(Math.ceil(1.03*hostsN(p+1)),Math.floor(0.97*hostsN(p))), o={N,p}, s0=ri(Math.max(22,p-3),Math.min(p,27));
    const ps=[s0,s0+1,s0+2,s0+3], sys=rnd(["Une serre connectée","Un atelier de production","Un hôtel","Une ferme aquacole","Un lycée"]);
    return {ctx:`${sys} compte ${o.N} appareils (routeur compris) à placer dans un même réseau IPv4. On veut le plus petit réseau possible, pour ne pas gaspiller d'adresses.`,q:"Quel masque faut-il choisir ?",type:"ch",ch:ps.map(x=>ipS(mOf(x))),ok:ps.indexOf(o.p),
      expl:`Adresses d'hôtes (2ⁿ − 2, n bits à 0 du masque) : ${ps.map(x=>`${ipS(mOf(x))} → ${nf(hostsN(x),0)}`).join(" ; ")}. Il faut au moins ${o.N} adresses : le plus petit réseau qui convient a le masque ${F(ipS(mOf(o.p)))}, avec ${hostsN(o.p)} adresses d'hôtes.`}; }
];

const TRM3=[
  /* occupation d'une ligne série par les trames d'un capteur */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const f=rnd([FMT[0],FMT[1]]), D=rnd([9600,19200,38400]), n=rnd([8,12,16,24,32]), T=rnd([10,20,25,50,100]), t=n*fBits(f)/D*1000; return {f,D,n,T,t,occ:t/T*100}; },o=>o.occ>=8&&o.occ<=92&&far(o.occ,50,0.08)&&(o.occ<=50)===want);
    const ok=o.occ<=50, nbt=o.n*fBits(o.f);
    const ctx=`Un capteur envoie toutes les ${o.T} ms une trame de ${o.n} octets sur une liaison série à ${dAff(o.D)}, au format ${o.f.n} (${fTxt(o.f)}). La même ligne transporte aussi les messages de commande ; exigence : elle doit rester libre au moins la moitié du temps.`;
    return [{ctx,q:"Quelle est la durée d'envoi d'une trame du capteur, en ms ?",type:"num",ans:o.t,tolR:0.02,unit:"ms",
        expl:`${o.n} octets × ${fBits(o.f)} bits = ${nbt} bits. ${F(`t = ${FRAC("N_bits","D")}`)} = ${FRAC(nbt,nf(o.D,0))} = ${nf(o.t/1000,6)} s, soit ${U(o.t,"ms")}.`},
      {q:"Quelle part du temps la ligne est-elle occupée par le capteur, en % ?",type:"num",ans:o.occ,tolR:0.02,unit:"%",
        expl:`Une trame de ${nf(o.t,2)} ms toutes les ${o.T} ms : ${F(`taux = ${FRAC("t","T")} × 100`)} = ${FRAC(nf(o.t,2),o.T)} × 100 = ${U(o.occ,"%")}.`},
      {q:"L'exigence de disponibilité de la ligne est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.occ,1)} % ${ok?"≤":">"} 50 % : ${ok?"la ligne reste libre plus de la moitié du temps, l'exigence est respectée.":"la ligne est occupée plus de la moitié du temps ; il faut augmenter le débit, raccourcir les trames ou les espacer."}`}]; },
  /* bus I2C : cadence de lecture de plusieurs capteurs, mode standard puis mode rapide */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const ns=rnd([2,3,4]), k=rnd([2,6,12]), fr=rnd([250,500,1000,2000]), nb=ns*9*(3+k), t1=nb/1e5, t4=nb/4e5; return {ns,k,fr,nb,t1,t4,f1:1/t1,f4:1/t4}; },o=>far(o.f1,o.fr,0.06)&&far(o.f4,o.fr,0.06)&&(o.f1>=o.fr)===want);
    const ok1=o.f1>=o.fr, ok4=o.f4>=o.fr;
    const ctx=`À chaque cycle de régulation, le calculateur d'un drone lit ${o.ns} capteurs sur un bus I2C. Lire un capteur : octet d'adresse (écriture), numéro du registre, octet d'adresse (lecture), puis ${o.k} octets de données ; chaque octet occupe 9 périodes d'horloge (8 bits + acquittement). On néglige les conditions de départ et d'arrêt et la durée des calculs. Exigence : au moins ${nf(o.fr,0)} cycles par seconde.`;
    return [{ctx,q:"Avec une horloge SCL à 100 kHz, quelle est la durée d'un cycle de lecture, en ms ?",type:"num",ans:o.t1*1000,tolR:0.02,unit:"ms",
        expl:`Par capteur : ${3+o.k} octets × 9 = ${9*(3+o.k)} périodes ; pour ${o.ns} capteurs : ${o.nb} périodes de ${FRAC("1","100 kHz")} = 10 µs. ${F(`t = ${o.nb} × 10 µs`)} = ${U(o.t1*1000,"ms")}.`},
      {q:"L'exigence est-elle respectée à 100 kHz ?",type:"ch",ch:YN,ok:ok1?0:1,
        expl:`Cadence maximale : ${F(`f = ${FRAC("1","t")}`)} = ${FRAC("1",`${nf(o.t1,5)} s`)} = ${nf(o.f1,0)} cycles par seconde ${ok1?"≥":"&lt;"} ${nf(o.fr,0)} : ${ok1?"l'exigence est respectée.":"l'exigence n'est pas respectée."}`},
      {q:"Et avec l'horloge en mode rapide, à 400 kHz ?",type:"ch",ch:YN,ok:ok4?0:1,
        expl:`La durée d'un cycle est divisée par 4 : ${nf(o.t4*1000,3)} ms, soit ${nf(o.f4,0)} cycles par seconde ${ok4?"≥":"&lt;"} ${nf(o.fr,0)} : ${ok4?"l'exigence est respectée.":"l'exigence n'est toujours pas respectée ; il faut lire moins d'octets ou utiliser un bus plus rapide."}`}]; },
  /* plan d'adressage : capacité du réseau, adresse de diffusion, adresse libre */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const p=rnd([26,27,28]), blk=2**(32-p), b3=ri(1,254), base=ri(0,256/blk-1)*blk, N=ri(5,70); return {p,blk,b3,base,H:hostsN(p),N}; },o=>far(o.N,o.H,0.1)&&(o.N<=o.H)===want);
    const {p,blk,b3,base,H,N}=o, m=mOf(p), I=x=>[192,168,b3,x], net=I(base), bc=I(base+blk-1), gw=I(base+1), pc=I(base+2), au=I(base+3), free=I(base+ri(5,blk-2)), other=I((base+blk+ri(2,blk-3))%256), okN=N<=H;
    const fig=fx_trm_reseau({h:[{n:"PC de supervision",ip:ipS(pc)},{n:"Automate",ip:ipS(au)},{n:"Nouveau capteur",ip:"?",q:1}],net:`Réseau ${ipS(net)}, masque ${ipS(m)}`,gw:ipS(gw)});
    const ctx=`Le réseau d'une ferme aquacole a l'adresse ${ipS(net)} et le masque ${ipS(m)}. Le routeur a l'adresse ${ipS(gw)}, le PC ${ipS(pc)}, l'automate ${ipS(au)}.`;
    return [{fig,ctx,q:`À terme, l'installation comptera ${N} appareils, routeur compris. Ce réseau pourra-t-il tous les accueillir ?`,type:"ch",ch:YN,ok:okN?0:1,
        expl:`Le masque laisse ${32-p} bits pour les hôtes : ${F(`2<sup>${32-p}</sup> − 2 = ${H}`)} adresses. ${N} ${okN?"≤":">"} ${H} : ${okN?"le réseau suffit.":"le réseau est trop petit ; il faut un masque avec plus de bits à 0."}`},
      {q:"Quelle est l'adresse de diffusion de ce réseau ?",type:"ch",...mcu(ipS(bc),[ipS(net),ipS(I(255)),...(base+blk<256?[ipS(I(base+blk))]:[]),"255.255.255.255"]),
        expl:`Adresse de diffusion : tous les bits d'hôte à 1. Le réseau commence à ${base} et compte ${blk} adresses : la dernière est ${base} + ${blk} − 1 = ${base+blk-1}, soit ${F(ipS(bc))}.`},
      {q:"Quelle adresse peut-on attribuer au nouveau capteur ?",type:"ch",...mcu(ipS(free),[ipS(net),ipS(bc),ipS(pc),ipS(other)]),
        expl:`${ipS(net)} (adresse du réseau) et ${ipS(bc)} (diffusion) sont réservées, ${ipS(pc)} est déjà prise par le PC, ${ipS(other)} appartient à un autre sous-réseau. ${F(ipS(free))} est libre et dans la plage ${ipS(I(base+1))} à ${ipS(I(base+blk-2))}.`}]; },
  /* deux réseaux reliés par un routeur : passerelle à déclarer, chemin d'un paquet */
  ()=>{ const a=ri(1,120), b=a+ri(1,40), ha=ri(10,99), hb=ri(10,99), g=rnd([1,254]), PC=[192,168,a,ha], CAM=[192,168,b,hb], GA=[192,168,a,g], GB=[192,168,b,g];
    const fig=fx_trm_reseau({h:[{n:"PC du bureau",ip:ipS(PC)},{n:"Imprimante",ip:ipS([192,168,a,ha+1])}],gw:ipS(GA),ext:["Réseau","des caméras",ipS([192,168,b,0])]});
    const ctx=`Deux réseaux de masque 255.255.255.0 sont reliés par un routeur, qui possède une interface dans chacun : ${ipS(GA)} côté bureau, ${ipS(GB)} côté caméras. Le PC du bureau (${ipS(PC)}) doit afficher les images d'une caméra (${ipS(CAM)}).`;
    return [{fig,ctx,q:"Quelle adresse de passerelle faut-il déclarer dans le PC ?",type:"ch",...mcu(ipS(GA),[ipS(GB),ipS(CAM),"255.255.255.0",ipS([192,168,a,255])]),
        expl:`La passerelle doit appartenir au même réseau que le PC (${ipS([192,168,a,0])}) : c'est l'interface du routeur côté bureau, ${F(ipS(GA))}. L'interface ${ipS(GB)} est dans l'autre réseau, le PC ne peut pas la joindre directement ; 255.255.255.0 est le masque, ${ipS([192,168,a,255])} l'adresse de diffusion.`},
      {q:"Quel chemin suit un paquet envoyé par le PC à la caméra ?",type:"ch",...mcu("PC → commutateur → routeur → réseau des caméras → caméra",["PC → commutateur → caméra, sans passer par le routeur","PC → routeur → Internet → caméra","PC → toutes les machines du bureau, par l'adresse de diffusion"]),
        expl:`La caméra (réseau ${ipS([192,168,b,0])}) n'est pas dans le réseau du PC (${ipS([192,168,a,0])}) : le PC envoie le paquet à sa passerelle, et le ${F("routeur")} le transmet dans le réseau des caméras. Internet n'intervient pas : les deux réseaux sont locaux.`}]; },
  /* bouée LoRa : durée d'émission, charge consommée par jour, autonomie exigée */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const n=rnd([10,20,30,40]), D=rnd([0.3,1.2,5.5]), per=rnd([5,10,15,30]), C=rnd([250,500,1000,2000]), ex=rnd([1,2]); const t=8*(n+13)/(D*1000), day=24*60/per, q=40*t*day/3600; return {n,D,per,C,ex,t,day,q,aut:C/q}; },
      o=>o.t/(o.per*60)<=0.01&&o.aut<=4000&&far(o.aut,365*o.ex,0.08)&&(o.aut>=365*o.ex)===want);
    const ok=o.aut>=365*o.ex;
    const ctx=`Une bouée de mesure mouillée au large envoie toutes les ${o.per} min un message LoRa de ${o.n} octets de mesures, auxquels le protocole ajoute 13 octets (en-tête et contrôle). Débit radio : ${nf(o.D,1)} kbit/s. Pendant l'émission, le module radio consomme 40 mA ; le reste du temps, on néglige sa consommation. La batterie réserve ${nf(o.C,0)} mAh à la radio. Exigence : ${o.ex===1?"un an":"deux ans"} d'autonomie sans intervention.`;
    return [{ctx,q:"Quelle est la durée d'émission d'un message, en ms ?",type:"num",ans:o.t*1000,tolR:0.02,unit:"ms",
        expl:`${o.n} + 13 = ${o.n+13} octets, soit ${8*(o.n+13)} bits. ${F(`t = ${FRAC("N_bits","D")}`)} = ${FRAC(8*(o.n+13),`${nf(o.D*1000,0)} bit/s`)} = ${nf(o.t,4)} s, soit ${U(o.t*1000,"ms")}.`},
      {q:"Quelle charge le module radio consomme-t-il par jour, en mAh ?",type:"num",ans:o.q,tolR:0.02,unit:"mAh",
        expl:`Messages par jour : ${FRAC("24 × 60",o.per)} = ${nf(o.day,0)}. Émission par jour : ${nf(o.day,0)} × ${nf(o.t,4)} = ${nf(o.day*o.t,1)} s, soit ${FRAC(nf(o.day*o.t,1),"3 600")} = ${nf(o.day*o.t/3600,5)} h. ${F("Q = I·Δt")} = 40 × ${nf(o.day*o.t/3600,5)} = ${U(o.q,"mAh")}.`},
      {q:"L'exigence d'autonomie est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Autonomie : ${FRAC(nf(o.C,0),nf(o.q,4))} = ${nf(o.aut,0)} jours ${ok?"≥":"&lt;"} ${365*o.ex} jours : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée ; il faut espacer les messages, augmenter le débit radio (portée plus faible) ou prendre une batterie plus grosse."}`}]; },
  /* vidéosurveillance : bits par image, débit du flux compressé, liaison suffisante ? */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const R=rnd([[640,480],[1280,720],[1920,1080]]), fps=rnd([10,15,25,30]), k=rnd([50,100,200]), Dl=rnd([2,4,8,16]), Mb=R[0]*R[1]*24/1e6; return {R,fps,k,Dl,Mb,Dn:Mb*fps/k}; },o=>far(o.Dn,o.Dl,0.1)&&o.Dn>0.3&&(o.Dn<=o.Dl)===want);
    const ok=o.Dn<=o.Dl;
    const ctx=`Une caméra de surveillance d'un quai filme en ${nf(o.R[0],0)} × ${nf(o.R[1],0)} pixels, à n = ${o.fps} images par seconde ; chaque pixel est codé sur 24 bits. Le codage vidéo divise le volume de données par k = ${o.k}. La liaison vers le poste de sécurité offre un débit utile de ${o.Dl} Mbit/s.`;
    return [{ctx,q:"Combien de mégabits une image non compressée contient-elle ?",type:"num",ans:o.Mb,tolR:0.02,unit:"Mbit",
        expl:`${F("N = nombre de pixels × 24")} = ${nf(o.R[0],0)} × ${nf(o.R[1],0)} × 24 = ${nf(o.Mb*1e6,0)} bits, soit ${U(o.Mb,"Mbit")}.`},
      {q:"Quel débit le flux vidéo compressé demande-t-il, en Mbit/s ?",type:"num",ans:o.Dn,tolR:0.02,unit:"Mbit/s",
        expl:`${F(`D = ${FRAC("N·n","k")}`)} = ${FRAC(`${nf(o.Mb,3)} × ${o.fps}`,o.k)} = ${U(o.Dn,"Mbit/s")}.`},
      {q:"La liaison permet-elle de transmettre ce flux en direct ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`${nf(o.Dn,2)} Mbit/s ${ok?"≤":">"} ${o.Dl} Mbit/s : ${ok?"la liaison suffit.":"la liaison ne suffit pas ; il faut réduire la définition ou le nombre d'images par seconde, compresser davantage ou changer de liaison."}`}]; },
  /* regrouper des mesures dans une trame : efficacité et retard */
  ()=>{ const h=rnd([8,10,12,16]), m=rnd([2,4]), k=rnd([10,20,30,60]), per=rnd([1,2,5]), e1=m/(m+h), e2=k*m/(k*m+h), w=(k-1)*per;
    const ctx=`Un capteur produit une mesure de ${m} octets ${per===1?"chaque seconde":`toutes les ${per} s`}. Chaque trame ajoute ${h} octets d'en-tête et de contrôle aux données. Deux stratégies : envoyer chaque mesure dans sa propre trame, ou regrouper ${k} mesures dans une même trame.`;
    return [{ctx,q:"Quelle est l'efficacité (part des octets utiles) d'une trame qui ne contient qu'une mesure ?",type:"num",ans:e1,tolA:0.006,unit:"",
        expl:`${F(`η = ${FRAC("octets utiles","octets transmis")}`)} = ${FRAC(m,`${m} + ${h}`)} = ${U(e1,"")}, soit ${nf(e1*100,1)} % seulement.`},
      {q:`Quelle est l'efficacité si l'on regroupe ${k} mesures par trame ?`,type:"num",ans:e2,tolA:0.006,unit:"",
        expl:`${F(`η = ${FRAC(`${k} × ${m}`,`${k} × ${m} + ${h}`)}`)} = ${FRAC(k*m,k*m+h)} = ${U(e2,"")}, soit ${nf(e2*100,1)} %.`},
      {q:"Quel inconvénient le regroupement présente-t-il ?",type:"ch",...mcu(`Une mesure peut attendre ${nf(w,0)} s avant d'être envoyée`,["Il augmente le nombre d'octets à transmettre","Il empêche d'ajouter un contrôle d'erreur","Il oblige à doubler le débit de la liaison"]),
        expl:`La trame part quand la ${k}e mesure est prête : la première attend (${k} − 1) × ${per} = ${nf(w,0)} s. Le regroupement améliore l'efficacité mais ${F("augmente le retard")} : il ne convient pas aux alarmes ni aux commandes.`}]; },
  /* arrêt d'urgence télécommandé : budget de temps de réaction */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const ta=rnd([2,5,10]), n=rnd([6,8,12,16]), D=rnd([1200,2400,4800,9600]), tp=rnd([5,10,20]), tf=rnd([20,40,60,80]), Tm=rnd([50,100,150,200]), tt=n*10/D*1000; return {ta,n,D,tp,tf,Tm,tt,tot:ta+tt+tp+tf}; },o=>far(o.tot,o.Tm,0.06)&&(o.tot<=o.Tm)===want);
    const ok=o.tot<=o.Tm;
    const ctx=`Arrêt d'urgence d'un robot de chantier télécommandé : la télécommande détecte l'appui en ${o.ta} ms, envoie par radio une trame de ${o.n} octets au format 8N1 à ${dAff(o.D)} ; le robot traite la trame en ${o.tp} ms, puis son frein agit ${o.tf} ms après la commande. Exigence : moins de ${o.Tm} ms entre l'appui et le freinage.`;
    return [{ctx,q:"Quelle est la durée de transmission de la trame d'arrêt, en ms ?",type:"num",ans:o.tt,tolR:0.02,unit:"ms",
        expl:`${o.n} octets × 10 bits = ${o.n*10} bits. ${F(`t = ${FRAC("N_bits","D")}`)} = ${FRAC(o.n*10,nf(o.D,0))} = ${nf(o.tt/1000,5)} s, soit ${U(o.tt,"ms")}.`},
      {q:"L'exigence de temps de réaction est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Durée totale : ${o.ta} + ${nf(o.tt,1)} + ${o.tp} + ${o.tf} = ${nf(o.tot,1)} ms ${ok?"&lt;":">"} ${o.Tm} ms : ${ok?"l'exigence est respectée.":`l'exigence n'est pas respectée ; ${o.tt>o.tot/3?"la transmission pèse lourd, il faut augmenter le débit ou raccourcir la trame.":"il faut accélérer le traitement ou le freinage."}`}`}]; },
  /* parité et somme de contrôle : chacune rate certaines erreurs */
  ()=>{ const X=Math.random()<0.5;
    const o=draw(()=>{ const d=Array.from({length:3},()=>ri(20,235)), r=d.slice(); let ok=true;
        if(X){ const i=ri(0,2), k1=ri(0,7), k2=(k1+ri(1,7))%8; r[i]=d[i]^(1<<k1)^(1<<k2); }
        else { const b=ri(0,6), i=ri(0,2), j=(i+ri(1,2))%3; ok=((d[i]>>b)&1)===0&&((d[j]>>b)&1)===1; r[i]=d[i]|(1<<b); r[j]=d[j]&~(1<<b); }
        return {d,r,ok}; },o=>o.ok&&o.r.every(x=>x>=0&&x<=255));
    const par=o.d.map(x=>pop(x)%2), cs=o.d.reduce((a,b)=>a+b,0)%256, sr=o.r.reduce((a,b)=>a+b,0), cr=sr%256, bad=o.r.map((x,i)=>(pop(x)+par[i])%2===1), pd=bad.some(Boolean), sd=cr!==cs, gain=o.r.reduce((a,b,i)=>a+Math.max(0,b-o.d[i]),0);
    const data=table(["Octet","Envoyé","Bit de parité","Reçu"],o.d.map((x,i)=>[String(i+1),`${bg(bin(x,8))} (${x})`,String(par[i]),`${bg(bin(o.r[i],8))} (${o.r[i]})`]));
    const ctx=`Chaque octet est protégé par un bit de parité paire, et la trame entière par une somme de contrôle (somme des octets de données, dont on ne garde que l'octet de poids faible). Le tableau donne les 3 octets envoyés, leur bit de parité (reçu sans erreur) et les octets reçus, perturbés par des parasites. Somme de contrôle reçue : ${cs}.`;
    return [{data,ctx,q:"Le contrôle de parité détecte-t-il une erreur ?",type:"ch",ch:YN,ok:pd?0:1,
        expl:`Pour chaque octet reçu, on compte les 1 et on ajoute le bit de parité : ${o.r.map((x,i)=>`octet ${i+1} : ${pop(x)} + ${par[i]} = ${pop(x)+par[i]}`).join(" ; ")}. ${pd?`Un total impair signale ${F("une erreur détectée")} : un seul bit a changé dans ${bad.filter(Boolean).length>1?"ces octets":"cet octet"}.`:`Tous les totaux sont pairs : ${F("aucune erreur détectée")}, car deux bits du même octet ont changé.`}`},
      {q:"La somme de contrôle détecte-t-elle une erreur ?",type:"ch",ch:YN,ok:sd?0:1,
        expl:`Somme des octets reçus : ${o.r.join(" + ")} = ${nf(sr,0)}, dont l'octet de poids faible vaut ${cr} ; somme reçue : ${cs}. ${sd?`Elles diffèrent : ${F("erreur détectée")}.`:`Elles sont égales : ${F("erreur non détectée")}, car un octet a gagné ${gain} pendant qu'un autre perdait autant.`} Les deux contrôles se complètent : aucun ne détecte toutes les erreurs.`}]; },
  /* repérer l'erreur dans un raisonnement */
  ()=>{ const v=ri(0,6); let ctx, st, bad, why;
    if(v===0){ const S=rnd([2,4,5,8]), D=rnd([10,20,40]);
      ctx=`Durée d'envoi d'un fichier de ${S} Mo (1 Mo = ${p10(6)} octets) sur une liaison à ${D} Mbit/s, latence négligée.`;
      st=[`Taille : ${S} Mo = ${S} × ${p10(6)} octets.`,`t = ${FRAC("taille","D")} = ${FRAC(`${S} × ${p10(6)}`,`${D} × ${p10(6)}`)}`,`t = ${nf(S/D,3)} s`]; bad=1;
      why=`Le débit est en bits par seconde : il faut convertir la taille en bits, 8 × ${S} × ${p10(6)} = ${nf(8*S,0)} × ${p10(6)} bits, d'où t = ${nf(8*S/D,3)} s.`; }
    else if(v===1){ const p=rnd([26,27,28]), n=32-p;
      ctx=`Nombre d'appareils que peut accueillir un réseau de masque ${ipS(mOf(p))}.`;
      st=[`Le masque a ${n} bits à 0.`,`Nombre d'hôtes : 2<sup>${n}</sup> = ${2**n}.`,`On peut brancher ${2**n} appareils.`]; bad=1;
      why=`On retire l'adresse du réseau (bits d'hôte tous à 0) et l'adresse de diffusion (tous à 1) : 2<sup>${n}</sup> − 2 = ${2**n-2} appareils.`; }
    else if(v===2){ const N=rnd([16,20,32,40]), D=rnd([9600,19200]);
      ctx=`Durée d'envoi de ${N} octets au format 8N1 à ${nf(D,0)} bit/s.`;
      st=["Au format 8N1, un octet occupe 8 bits sur la ligne.",`${N} octets → ${8*N} bits.`,`t = ${FRAC(8*N,nf(D,0))} = ${nf(8*N/D*1000,2)} ms`]; bad=0;
      why=`En 8N1, chaque octet est encadré par un bit de start et un bit de stop : 10 bits sur la ligne, soit ${10*N} bits et t = ${nf(10*N/D*1000,2)} ms.`; }
    else if(v===3){ const a=ri(1,200), h=ri(10,200);
      ctx=`Le PC (192.168.${a}.${h}) et la caméra (192.168.${a+1}.${h}) ont le masque 255.255.255.0. Peuvent-ils communiquer directement ?`;
      st=["Avec ce masque, la partie hôte est le dernier octet.",`Les deux adresses se terminent par le même octet (${h}).`,"Elles sont donc dans le même réseau : communication directe."]; bad=2;
      why=`Ce sont les trois premiers octets (la partie réseau) qu'il faut comparer : 192.168.${a} et 192.168.${a+1} diffèrent, les deux appareils sont dans des réseaux différents et doivent passer par un routeur.`; }
    else if(v===4){ const D=rnd([125,250,500]), n=rnd([64,108,128]);
      ctx=`Durée d'une trame de ${n} bits sur un bus à ${D} kbit/s.`;
      st=[`D = ${D} kbit/s = ${D} × 1 024 bit/s = ${nf(D*1024,0)} bit/s`,`t = ${FRAC(n,nf(D*1024,0))}`,`t = ${nf(n/(D*1024)*1e6,1)} µs`]; bad=0;
      why=`Pour les débits, le préfixe k vaut 1 000 : D = ${nf(D*1000,0)} bit/s, d'où t = ${nf(n/(D*1000)*1e6,1)} µs.`; }
    else if(v===5){ const ad=rnd([0x48,0x68,0x3C,0x76,0x51]);
      ctx=`Premier octet envoyé par le maître d'un bus I2C pour lire l'esclave d'adresse ${hx2(ad)} (adresse sur 7 bits, suivie d'un bit de sens égal à 1 pour une lecture).`;
      st=[`Adresse sur 7 bits : ${hx2(ad)} = (${bg(bin(ad,7))})₂.`,`Premier octet : l'adresse suivie du bit de sens 1, soit ${Bn((ad<<1)|1)}.`,`Ce premier octet vaut donc ${hx2(ad)} + 1 = ${hx2(ad+1)}.`]; bad=2;
      why=`Placer le bit de sens après les 7 bits d'adresse décale l'adresse d'un rang vers la gauche (multiplication par 2) : ${Bn((ad<<1)|1)} = ${hx2((ad<<1)|1)}, et non ${hx2(ad+1)}.`; }
    else { const k=rnd([2,5,10]), D=rnd([50,100]), l=rnd([550,600]);
      ctx=`Délai de livraison d'un message de ${k} ko (1 ko = ${p10(3)} octets) par une liaison satellite de débit ${D} Mbit/s et de latence ${l} ms.`;
      st=[`Taille : ${k} ko = ${nf(8*k*1000,0)} bits.`,`Durée d'envoi : ${FRAC(nf(8*k*1000,0),`${D} × ${p10(6)}`)} = ${nf(8*k/D,2)} ms.`,`Le message est livré ${nf(8*k/D,2)} ms après son envoi.`]; bad=2;
      why=`Il faut ajouter la latence : ${l} + ${nf(8*k/D,2)} = ${nf(l+8*k/D,2)} ms. Pour un petit message, c'est la latence qui domine.`; }
    return {ctx,data:OL(st),q:"Un élève a rédigé ce raisonnement. Où se trouve sa première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
  /* débit réel d'un transfert et débit annoncé */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const Dn=rnd([54,100,150,300]), S=rnd([50,100,200,500]), eff=0.35+Math.random()*0.45, t=+(8*S/(Dn*eff)).toPrecision(3), Dr=8*S/t, e=Math.abs(Dr-Dn)/Dn*100, ex=rnd([40,50]); return {Dn,S,t,Dr,e,ex}; },o=>far(o.e,o.ex,0.1)&&(o.e<=o.ex)===want);
    const ok=o.e<=o.ex;
    const ctx=`On transfère un fichier de ${o.S} Mo (1 Mo = ${p10(6)} octets) entre deux ordinateurs par une liaison Wi-Fi annoncée à ${o.Dn} Mbit/s. Le transfert dure ${nf(o.t,3)} s. Le cahier des charges tolère un débit réel inférieur d'au plus ${o.ex} % au débit annoncé.`;
    return [{ctx,q:"Quel est le débit réel du transfert, en Mbit/s ?",type:"num",ans:o.Dr,tolR:0.02,unit:"Mbit/s",
        expl:`Taille : 8 × ${o.S} = ${8*o.S} Mbit. ${F(`D = ${FRAC("8 × taille","t")}`)} = ${FRAC(`${8*o.S} Mbit`,`${nf(o.t,3)} s`)} = ${U(o.Dr,"Mbit/s")}.`},
      {q:"L'exigence sur le débit réel est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Écart relatif, en prenant le débit annoncé comme référence : ${F(`e = ${FRAC("|D_réel − D_annoncé|","D_annoncé")} × 100`)} = ${FRAC(`|${nf(o.Dr,1)} − ${o.Dn}|`,o.Dn)} × 100 = ${nf(o.e,1)} % ${ok?"≤":">"} ${o.ex} % : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée."}`},
      {q:"Pourquoi le débit réel est-il plus faible que le débit annoncé ?",type:"ch",...mcu("Les en-têtes des protocoles, les acquittements et le partage du canal radio consomment une partie du débit",["Le fichier grossit pendant le transfert","Un mégaoctet ne contient que 1 024 bits","La latence s'ajoute à chaque bit transmis"]),
        expl:"Le débit annoncé est le débit brut du support radio. Une partie sert aux en-têtes (Wi-Fi, IP, TCP), aux acquittements et aux retransmissions ; le canal est partagé avec les autres appareils et l'éloignement fait baisser la vitesse de modulation. Le débit utile est donc nettement plus faible."}]; },
  /* encapsulation : taille de la trame, efficacité, rôle des en-têtes */
  ()=>{ const n=rnd([10,20,50,100,200,500]), udp=Math.random()<0.5, th=udp?8:20, tot=n+th+20+18, eta=n/tot;
    const ctx=`Un capteur envoie ${n} octets de données à un serveur. Ces données sont placées dans un segment ${udp?"UDP (en-tête de 8 octets)":"TCP (en-tête de 20 octets)"}, lui-même placé dans un paquet IP (en-tête de 20 octets), lui-même placé dans une trame Ethernet (en-tête et contrôle : 18 octets).`;
    return [{ctx,q:"Quelle est la taille de la trame Ethernet envoyée, en octets ?",type:"num",ans:tot,tolA:0,unit:"octets",
        expl:`Chaque couche ajoute son en-tête : ${F(`${n} + ${th} + 20 + 18 = ${tot} octets`)}.`},
      {q:"Quelle est l'efficacité de cette transmission (part des octets utiles) ?",type:"num",ans:eta,tolA:0.006,unit:"",
        expl:`${F(`η = ${FRAC(n,tot)}`)} = ${U(eta,"")}, soit ${nf(eta*100,1)} %. ${n<100?"Pour de petits messages, les en-têtes pèsent lourd : on a intérêt à regrouper les mesures.":"Plus les données sont nombreuses, plus l'efficacité se rapproche de 100 %."}`},
      {q:"Quel en-tête contient les adresses IP de l'émetteur et du destinataire ?",type:"ch",...mcu("L'en-tête du paquet IP (couche réseau)",[`L'en-tête ${udp?"UDP":"TCP"} (couche transport)`,"L'en-tête de la trame Ethernet (couche accès réseau)","Les données du capteur (couche application)"]),
        expl:`Le paquet IP (${F("couche réseau")}) porte les adresses IP, utilisées par les routeurs. L'en-tête ${udp?"UDP":"TCP"} porte les numéros de port (le programme destinataire), la trame Ethernet les adresses MAC (l'appareil voisin sur le réseau local).`}]; },
  /* bus de terrain maître-esclave : durée d'un échange, cycle d'interrogation */
  ()=>{ const want=Math.random()<0.5, o=draw(()=>{ const N=rnd([4,6,8,10]), D=rnd([9600,19200,38400]), k=rnd([1,2,4]), tr=rnd([2,3,5]), Tm=rnd([50,100,200,500]), req=8*11/D*1000, rep=(5+2*k)*11/D*1000, ex=req+tr+rep; return {N,D,k,tr,Tm,req,rep,ex,cyc:N*ex}; },o=>far(o.cyc,o.Tm,0.06)&&(o.cyc<=o.Tm)===want);
    const ok=o.cyc<=o.Tm;
    const ctx=`Un automate interroge à tour de rôle ${o.N} variateurs sur un bus RS-485 à ${dAff(o.D)} ; chaque octet occupe 11 bits sur la ligne (start, 8 données, parité, stop). Un échange comprend une requête de 8 octets, un temps de réponse du variateur de ${o.tr} ms, puis une réponse de ${5+2*o.k} octets. Exigence : chaque variateur est interrogé au moins toutes les ${o.Tm} ms.`;
    return [{ctx,q:"Quelle est la durée d'un échange avec un variateur, en ms ?",type:"num",ans:o.ex,tolR:0.02,unit:"ms",
        expl:`Requête : ${FRAC("8 × 11",nf(o.D,0))} = ${nf(o.req,3)} ms ; réponse : ${FRAC(`${5+2*o.k} × 11`,nf(o.D,0))} = ${nf(o.rep,3)} ms. ${F("t = requête + attente + réponse")} = ${nf(o.req,3)} + ${o.tr} + ${nf(o.rep,3)} = ${U(o.ex,"ms")}.`},
      {q:"L'exigence de rafraîchissement est-elle respectée ?",type:"ch",ch:YN,ok:ok?0:1,
        expl:`Un variateur est de nouveau interrogé après un cycle complet : ${o.N} × ${nf(o.ex,2)} = ${nf(o.cyc,1)} ms ${ok?"≤":">"} ${o.Tm} ms : ${ok?"l'exigence est respectée.":"l'exigence n'est pas respectée ; il faut augmenter le débit, réduire le nombre de variateurs par bus ou raccourcir les réponses."}`}]; }
];

POOLS["info-transmission"]={
  titre:"Trames, protocoles, réseaux",
  fiche:{t:"Transmettre l'information",l:[
    `Liaison série asynchrone : repos à 1, start à 0, données (poids faible en premier), parité, stop à 1 ; durée d'un bit ${F(`T_b = ${FRAC("1","D")}`)} ; durée d'une trame ${F(`t = ${FRAC("N_bits","D")}`)}.`,
    `Efficacité : ${F(`η = ${FRAC("bits utiles","bits transmis")}`)} (8N1 : 80 %) ; transfert d'un fichier : ${F(`t = latence + ${FRAC("8 × taille","D")}`)}.`,
    `Trame d'un protocole : adresse, données, contrôle (parité, somme de contrôle). Bus I2C : un maître, SDA et SCL, adresses sur 7 bits, soit ${F("2⁷ = 128")} adresses ; ${F("9 bits par octet")} avec l'acquittement.`,
    `IPv4 : ${F("réseau = adresse IP ET masque")} ; ${F("hôtes = 2ⁿ − 2")} (n bits à 0 dans le masque) ; même adresse de réseau : échange direct, sinon passage par la passerelle (routeur).`,
    "Pièges : octets et bits (× 8), 1 kbit/s = 1 000 bit/s, oublier start et stop, attribuer l'adresse du réseau ou de diffusion, oublier la latence ; choisir le support selon la portée, le débit et la consommation."]},
  count:{1:4,2:4,3:3},1:TRM1,2:TRM2,3:TRM3
};
})();
