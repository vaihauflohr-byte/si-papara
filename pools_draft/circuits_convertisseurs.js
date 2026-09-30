/* Réservoirs : circuits et lois de Kirchhoff (ener-circuits) · hacheur, onduleur, MLI (ener-convertisseur) · circuits RC, condensateur (phy-electricite).
   Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixes fx_cir_, fx_cv_ et fx_rc_. */
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
const r2=(x,d)=>Math.round(x*10**d)/10**d;            /* valeur affichée = valeur de calcul */
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
/* puissance de dix, avec le vrai signe moins */
const p10=e=>`10<sup>${e<0?"−":""}${Math.abs(e)}</sup>`;
/* écriture scientifique : 4,7 × 10⁻⁶ */
const sci=(x,d)=>{ const dd=d==null?2:d; x=Number(Number(x).toPrecision(dd+1)); let e=Math.floor(Math.log10(Math.abs(x))+1e-9), m=Math.round(x/10**e*10**dd)/10**dd; if(Math.abs(m)>=10){ m/=10; e++; } return e===0?nf(m,dd):`${nf(m,dd)} × ${p10(e)}`; };
/* nombre signé avec le vrai signe moins */
const sgn=(x,d)=>(x<0?"−":"")+nf(Math.abs(x),d==null?2:d);
/* série E12 (valeurs normalisées de résistances, de 10 Ω à 8,2 MΩ) */
const E12=[1,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];
const E12V=(()=>{ const a=[]; for(let d=1;d<=6;d++) E12.forEach(m=>a.push(Math.round(m*10**d))); return a; })();
const e12up=x=>E12V.find(v=>v>=x*(1-1e-9));
const e12dn=x=>{ let r=null; E12V.forEach(v=>{ if(v<=x*(1+1e-9)) r=v; }); return r; };
const e12in=(a,b)=>E12V.filter(v=>v>=a&&v<=b);
const E12TXT="10 · 12 · 15 · 18 · 22 · 27 · 33 · 39 · 47 · 56 · 68 · 82 (et leurs multiples par 10, 100, 1 000…)";
/* affichages : résistance, capacité, durée */
const fR=r=>r>=1e6?`${S3(r/1e6)} MΩ`:r>=1e3?`${S3(r/1e3)} kΩ`:`${S3(r)} Ω`;
const fC=c=>c>=1?`${S3(c)} F`:c>=1e-3?`${S3(c*1e3)} mF`:c>=1e-6?`${S3(c*1e6)} µF`:c>=1e-9?`${S3(c*1e9)} nF`:`${S3(c*1e12)} pF`;
const fCs=c=>c>=1?`${S3(c)} F`:c>=1e-3?`${S3(c*1e3)} × ${p10(-3)} F`:c>=1e-6?`${S3(c*1e6)} × ${p10(-6)} F`:c>=1e-9?`${S3(c*1e9)} × ${p10(-9)} F`:`${S3(c*1e12)} × ${p10(-12)} F`;
const fRs=r=>r>=1e6?`${S3(r/1e6)} × ${p10(6)} Ω`:r>=1e3?`${S3(r/1e3)} × ${p10(3)} Ω`:`${S3(r)} Ω`;
const fT=t=>t>=1?`${S3(t)} s`:t>=1e-3?`${S3(t*1e3)} ms`:`${S3(t*1e6)} µs`;
const mA=i=>`${S3(i*1000)} mA`;

/* ===== outils de dessin ===== */
const wr=(...p)=>`<polyline points="${p.map(P2).join(" ")}" class="v-ink"/>`;
const nd=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="3" class="v-pt"/>`;
const bor=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="3.6" class="v-wheel" style="stroke-width:1.5"/>`;
const LW=(x1,y1,x2,y2,w)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="v-ink" style="stroke-width:${w}"/>`;
/* texte avec un liseré couleur papier (lisible par-dessus un fil ou une courbe) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
/* étiquette sur une ou deux lignes */
const lab2=(x,y,t,a,c)=>{ const l=Array.isArray(t)?t:[t]; return l.map((z,i)=>T(x,y+i*14-(l.length-1)*7,z,c||"v-lab s",a||"start")).join(""); };
/* symboles dans un repère local : le fil suit l'axe x, le courant conventionnel va vers les x croissants, centre en (0, 0) */
const SYM={
  R:()=>`<rect x="-18" y="-7" width="36" height="14" class="v-box"/>`,
  CTN:()=>SYM.R()+L(-15,11,15,-11,"v-thin")+L(-23,11,-15,11,"v-thin"),
  LDR:()=>SYM.R()+L(-19,-32,-9,-13,"v-thin","k")+L(-3,-32,7,-13,"v-thin","k"),
  C:()=>LW(-4,-14,-4,14,2.6)+LW(4,-14,4,14,2.6),
  BAT:()=>LW(-4,-7,-4,7,4.2)+LW(4,-15,4,15,1.6),
  LED:()=>`<path d="M-8 -9 L-8 9 L8 0 Z" class="v-box"/>`+L(8,-9,8,9,"v-ink")+L(-1,-12,8,-25,"v-thin","k")+L(7,-10,16,-23,"v-thin","k"),
  D:()=>`<path d="M-8 -9 L-8 9 L8 0 Z" class="v-box"/>`+L(8,-9,8,9,"v-ink"),
  M:()=>`<circle cx="0" cy="0" r="14" class="v-wheel"/>`,
  K0:()=>`<circle cx="-14" cy="0" r="2.4" class="v-pt"/><circle cx="14" cy="0" r="2.4" class="v-pt"/>`+L(-14,0,10,-13,"v-ink"),
  K1:()=>`<circle cx="-14" cy="0" r="2.4" class="v-pt"/><circle cx="14" cy="0" r="2.4" class="v-pt"/>`+L(-14,0,14,0,"v-ink"),
  LAMP:()=>`<circle cx="0" cy="0" r="11" class="v-wheel"/>`+L(-7.8,-7.8,7.8,7.8,"v-thin")+L(-7.8,7.8,7.8,-7.8,"v-thin"),
  DIP:()=>`<rect x="-22" y="-12" width="44" height="24" class="v-box"/>`
};
const HALF={R:18,CTN:18,LDR:18,C:4,BAT:4,LED:8,D:8,M:14,K0:14,K1:14,LAMP:11,DIP:22};
/* fil rectiligne de p à q (horizontal ou vertical) portant des composants : {k, t (position de 0 à 1), rev (polarité inversée)} */
function seg(p,q,items){
  const hz=Math.abs(q[1]-p[1])<0.01, d=hz?q[0]-p[0]:q[1]-p[1], sg=d>0?1:-1, ang=hz?(sg>0?0:180):(sg>0?90:-90);
  let s="", cur=p;
  (items||[]).slice().sort((a,b)=>a.t-b.t).forEach(it=>{
    const c=hz?[p[0]+d*it.t,p[1]]:[p[0],p[1]+d*it.t], h=HALF[it.k];
    const a=hz?[c[0]-sg*h,c[1]]:[c[0],c[1]-sg*h], b=hz?[c[0]+sg*h,c[1]]:[c[0],c[1]+sg*h];
    s+=wr(cur,a)+`<g transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) rotate(${ang+(it.rev?180:0)})">${SYM[it.k]()}</g>`;
    if(it.k==="M") s+=T(c[0],c[1]+5,"M","v-lab s","middle");
    cur=b; });
  return s+wr(cur,q);
}
/* flèche de tension (droite, couleur accent) et flèche de courant posée sur un fil (pointe en x, y ; direction ux, uy) */
const ua=(x1,y1,x2,y2)=>L(x1,y1,x2,y2,"v-el","a");
const ia=(x,y,ux,uy)=>L(x-ux*16,y-uy*16,x,y,"v-t","c");
/* symbole de masse */
const gnd=(x,y)=>L(x,y,x,y+8)+L(x-11,y+8,x+11,y+8)+L(x-7,y+12,x+7,y+12)+L(x-3,y+16,x+3,y+16);
/* repère gradué : o.X0, Y0, W, H ; o.x0 (début de l'axe), o.x1 (fin), o.xs (pas des étiquettes), o.xm (pas de la grille) ; idem en y ; o.xl, o.yl */
function frame(o){
  const X0=o.X0||60, Y0=o.Y0||206, W=o.W||304, H=o.H||164, x0=o.x0||0, y0=o.y0||0;
  const sx=W/(o.x1-x0), sy=H/(o.y1-y0), X=x=>X0+(x-x0)*sx, Y=y=>Y0-(y-y0)*sy, xm=o.xm||o.xs, ym=o.ym||o.ys;
  const dx=o.xd==null?3:o.xd, dy=o.yd==null?3:o.yd;
  let s="";
  for(let k=0;x0+k*xm<=o.x1+1e-9;k++) s+=L(X(x0+k*xm),Y0,X(x0+k*xm),Y0-H,"v-grid");
  for(let k=0;y0+k*ym<=o.y1+1e-9;k++) s+=L(X0,Y(y0+k*ym),X0+W,Y(y0+k*ym),"v-grid");
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-16,"v-ink","k");
  for(let k=0;x0+k*o.xs<=o.x1+1e-9;k++) s+=T(X(x0+k*o.xs),Y0+16,nf(x0+k*o.xs,dx),"v-lab s","middle");
  for(let k=0;y0+k*o.ys<=o.y1+1e-9;k++) s+=T(X0-6,Y(y0+k*o.ys)+4,nf(y0+k*o.ys,dy),"v-lab s","end");
  s+=T(X0+W+12,Y0+34,o.xl||"t (s)","v-cap","end")+T(X0+8,Y0-H-6,o.yl||"","v-cap");
  return {s,X,Y,X0,Y0,W,H};
}
/* courbe échantillonnée, limitée au cadre */
function curve(fr,f,a,b,cls,n){ const pts=[]; n=n||200; for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n; pts.push([fr.X(x),fr.Y(f(x))]); } return `<polyline points="${pts.map(P2).join(" ")}" class="${cls||"v-curve"}"/>`; }
const dot=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="4" class="v-dot"/>`;
/* pas « rond » pour une graduation */
const STEPS=[0.001,0.002,0.0025,0.005,0.01,0.02,0.025,0.05,0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100,200,250,500,1000,2000,2500,5000,10000];
const niceStep=(m,n)=>STEPS.find(s=>m/s<=n+1e-9)||m/n;

/* ===== figures : circuits (préfixe fx_cir_) ===== */
/* circuit à une maille, courant dans le sens horaire : générateur à gauche (borne + en haut), un composant par côté (o.top, o.right, o.bot).
   Composant : {k, lab:[lignes], u (étiquette de la flèche de tension, convention récepteur)} ; o.gen = {lab, u} ; o.I : étiquette du courant */
function fx_cir_boucle(o){
  const xL=112, xR=272, yT=62, yB=192, yg=(yT+yB)/2, xc=(xL+xR)/2;
  let s=seg([xL,yB],[xL,yT],[{k:"BAT",t:0.5}]);
  s+=seg([xL,yT],[xR,yT],o.top?[{k:o.top.k,t:0.5}]:[])+seg([xR,yT],[xR,yB],o.right?[{k:o.right.k,t:0.5}]:[])+seg([xR,yB],[xL,yB],o.bot?[{k:o.bot.k,t:0.5}]:[]);
  s+=T(xL+10,yg-10,"+","v-lab s");
  if(o.gen.lab) s+=lab2(xL+14,yg+14,o.gen.lab,"start");
  if(o.gen.u) s+=ua(xL-24,yg+24,xL-24,yg-24)+T(xL-32,yg+5,o.gen.u,"v-lab a s","end");
  if(o.top){ const h=HALF[o.top.k]; if(o.top.lab) s+=lab2(xc,yT+30,o.top.lab,"middle"); if(o.top.u) s+=ua(xc+h+5,yT-20,xc-h-5,yT-20)+T(xc,yT-29,o.top.u,"v-lab a s","middle"); }
  if(o.right){ const h=HALF[o.right.k], led=o.right.k==="LED";
    if(led){ if(o.right.lab) s+=lab2(xR+34,yg+4,o.right.lab,"start"); if(o.right.u) s+=ua(xR-24,yg+h+5,xR-24,yg-h-5)+T(xR-31,yg+5,o.right.u,"v-lab a s","end"); }
    else { if(o.right.lab) s+=lab2(xR-16,yg+4,o.right.lab,"end"); if(o.right.u) s+=ua(xR+24,yg+h+5,xR+24,yg-h-5)+T(xR+31,yg+5,o.right.u,"v-lab a s"); } }
  if(o.bot){ const h=HALF[o.bot.k]; if(o.bot.lab) s+=lab2(xc,yB-26,o.bot.lab,"middle"); if(o.bot.u) s+=ua(xc-h-5,yB+20,xc+h+5,yB+20)+T(xc,yB+37,o.bot.u,"v-lab a s","middle"); }
  if(o.I) s+=o.bot?ia(xL+40,yT,1,0)+T(xL+32,yT-10,o.I,"v-lab c s","middle"):ia(xR-40,yB,-1,0)+T(xR-32,yB+18,o.I,"v-lab c s","middle");
  return svg(yB+(o.bot&&o.bot.u?46:16),s,o.alt||"Circuit à une seule maille : un générateur et des récepteurs en série");
}
/* n résistances en série entre A et B : o.lab = [[lignes], …] */
function fx_cir_serie(o){
  const n=o.lab.length, y=70, xa=40, xb=360;
  let s=bor(xa,y)+bor(xb,y)+seg([xa,y],[xb,y],o.lab.map((_,i)=>({k:"R",t:(i+1)/(n+1)})));
  o.lab.forEach((l,i)=>{ s+=lab2(xa+(xb-xa)*(i+1)/(n+1),y-26,l,"middle"); });
  s+=T(xa,y+24,"A","v-lab","middle")+T(xb,y+24,"B","v-lab","middle");
  return svg(y+34,s,"Résistances montées en série entre A et B");
}
/* deux ou trois résistances en parallèle entre A et B : o.lab = [[lignes], …] */
function fx_cir_paral(o){
  const n=o.lab.length, xa=40, xl=130, xr=270, xb=360, ys=n===2?[52,122]:[44,100,156], ym=(ys[0]+ys[n-1])/2;
  let s=bor(xa,ym)+bor(xb,ym)+wr([xa,ym],[xl,ym])+wr([xr,ym],[xb,ym])+wr([xl,ys[0]],[xl,ys[n-1]])+wr([xr,ys[0]],[xr,ys[n-1]])+nd(xl,ym)+nd(xr,ym);
  ys.forEach((y,i)=>{ s+=seg([xl,y],[xr,y],[{k:"R",t:0.5}])+lab2(200,y-17,o.lab[i],"middle"); });
  s+=T(xa,ym+24,"A","v-lab","middle")+T(xb,ym+24,"B","v-lab","middle");
  return svg(ys[n-1]+22,s,"Résistances montées en parallèle entre A et B");
}
/* pont diviseur alimenté sous E : o.top, o.bot = {k : "R" | "CTN" | "LDR", lab:[lignes]} ; o.out : "can" (entrée d'un CAN) | "R" (résistance de charge o.load) ;
   o.E, o.U2 : étiquettes ; o.I : étiquette du courant dans le pont */
function fx_cir_pont(o){
  const xg=106, xm=210, yT=40, yM=126, yB=212, xa=294;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+wr([xg,yT],[xm,yT])+seg([xm,yT],[xm,yM],[{k:o.top.k,t:0.5}])+seg([xm,yM],[xm,yB],[{k:o.bot.k,t:0.5}])+wr([xm,yB],[xg,yB]);
  s+=T(xg+10,(yT+yB)/2-10,"+","v-lab s")+ua(xg-22,(yT+yB)/2+24,xg-22,(yT+yB)/2-24)+T(xg-29,(yT+yB)/2+5,o.E||"E","v-lab a s","end");
  s+=lab2(xm-16,(yT+yM)/2+4,o.top.lab,"end")+lab2(xm-16,(yM+yB)/2+4,o.bot.lab,"end");
  s+=nd(xm,yM)+wr([xm,yM],[o.out==="R"?334:318,yM])+nd(xm,yB);
  if(o.out==="R"){ s+=seg([334,yM],[334,yB],[{k:"R",t:0.5}])+wr([334,yB],[xm,yB])+lab2(348,(yM+yB)/2+4,o.load||["R_e"],"start"); }
  else { s+=`<rect x="318" y="${yM-24}" width="78" height="48" rx="4" class="v-box"/>`+multi(357,yM-4,["entrée","du CAN"],"v-smb","middle",14);
    s+=wr([xm,yB],[357,yB],[357,yM+24]); }
  s+=ua(xa,yB-5,xa,yM+6)+T(xa-7,(yM+yB)/2+5,o.U2||"U2","v-lab a s","end");
  if(o.I) s+=ia(xm,yT+21,0,1)+T(xm+10,yT+22,o.I,"v-lab c s");
  return svg(yB+14,s,o.alt||"Pont diviseur de tension : deux résistances en série alimentées sous la tension E");
}
/* résistance R1 en série avec deux résistances en parallèle : o.n = [haut, branche gauche, branche droite] (étiquettes sur 1 ou 2 lignes) ;
   o.E : étiquette du générateur ; o.I = [I, I_a, I_b] étiquettes des courants (facultatif) ; o.AB : repères des nœuds */
function fx_cir_mixte(o){
  const xg=70, xa=226, xb=328, yT=44, yB=208, ym=(yT+yB)/2, xr=(xg+xa)/2;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+seg([xg,yT],[xa,yT],[{k:"R",t:0.55}])+wr([xa,yT],[xb,yT]);
  s+=seg([xa,yT],[xa,yB],[{k:"R",t:0.5}])+seg([xb,yT],[xb,yB],[{k:"R",t:0.5}])+wr([xb,yB],[xg,yB])+nd(xa,yT)+nd(xa,yB);
  s+=T(xg+10,ym-10,"+","v-lab s")+(o.E?T(xg-20,ym+5,o.E,"v-lab s","end"):"");
  s+=lab2(xg+(xa-xg)*0.55,yT-16,o.n[0],"middle")+lab2(xa+14,ym+4,o.n[1],"start")+lab2(xb+14,ym+4,o.n[2],"start");
  if(o.I){ s+=ia(xg+34,yT,1,0)+T(xg+26,yT+18,o.I[0],"v-lab c s","middle");
    if(o.I[1]) s+=ia(xa,yT+34,0,1)+T(xa-8,yT+36,o.I[1],"v-lab c s","end");
    if(o.I[2]) s+=ia(xb,yT+34,0,1)+T(xb-8,yT+36,o.I[2],"v-lab c s","end"); }
  if(o.AB) s+=T(xa+6,yT-8,"A","v-lab s")+T(xa+6,yB+18,"B","v-lab s");
  return svg(yB+(o.AB?24:14),s,o.alt||"Une résistance en série avec deux résistances montées en parallèle");
}
/* générateur et n branches en parallèle (2 à 4) : o.br = [{k:["R"] ou ["R","LED"], lab:[lignes], I}] ; o.E ; o.I : courant principal */
function fx_cir_par(o){
  const n=o.br.length, xg=64, yT=40, yB=212, xs=[...Array(n).keys()].map(i=>150+i*(n>=4?64:n===3?84:112)), ym=(yT+yB)/2;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+wr([xg,yT],[xs[n-1],yT])+wr([xs[n-1],yB],[xg,yB]);
  s+=T(xg+10,ym-10,"+","v-lab s")+(o.E?T(xg-20,ym+5,o.E,"v-lab s","end"):"");
  o.br.forEach((b,i)=>{ const x=xs[i], two=b.k.length>1, it=two?[{k:b.k[0],t:0.4},{k:b.k[1],t:0.74}]:[{k:b.k[0],t:0.52}];
    s+=seg([x,yT],[x,yB],it);
    if(i<n-1) s+=nd(x,yT)+nd(x,yB);
    if(b.lab) s+=lab2(x+13,two?yT+(yB-yT)*0.4+4:ym+12,b.lab,"start");
    if(two&&b.lab2) s+=lab2(x-13,yT+(yB-yT)*0.74+4,b.lab2,"end");
    if(b.I) s+=ia(x,yT+30,0,1)+T(x-7,yT+30,b.I,"v-lab c s","end"); });
  if(o.I) s+=ia(xg+40,yT,1,0)+T(xg+30,yT-9,o.I,"v-lab c s","middle");
  return svg(yB+14,s,o.alt||"Générateur alimentant plusieurs branches en parallèle");
}
/* nœud et quatre branches (gauche, haut, droite, bas) reliées à des équipements ; o.b = [{nm:[lignes], lab, dir : +1 vers le nœud, −1 en sortant}] */
function fx_cir_noeud(o){
  const N=[200,128], E=[[100,128],[200,48],[300,128],[200,208]];
  let s="";
  o.b.forEach((b,i)=>{ const e=E[i]; s+=wr(e,N);
    const m=[(e[0]+N[0])/2,(e[1]+N[1])/2], ux=Math.sign(N[0]-e[0]), uy=Math.sign(N[1]-e[1]), d=b.dir>0?1:-1;
    s+=ia(m[0]+d*ux*8,m[1]+d*uy*8,d*ux,d*uy);
    s+=[Th(m[0],m[1]-12,b.lab,"v-lab c s","middle"),Th(m[0]+11,m[1]+5,b.lab,"v-lab c s","start"),Th(m[0],m[1]+24,b.lab,"v-lab c s","middle"),Th(m[0]-11,m[1]+5,b.lab,"v-lab c s","end")][i];
    const bw=92, bh=b.nm.length>1?36:26, bx=i===0?e[0]-bw:i===2?e[0]:e[0]-bw/2, by=i===1?e[1]-bh:i===3?e[1]:e[1]-bh/2;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" class="v-box"/>`+multi(bx+bw/2,by+bh/2-(b.nm.length-1)*6.5+4,b.nm,"v-sm","middle",13); });
  s+=nd(N[0],N[1])+T(N[0]+8,N[1]-8,"N","v-lab s");
  return svg(250,s,o.alt||"Nœud N relié à quatre branches, sens des courants indiqués par des flèches");
}
/* dipôle D entre A et B : o.i = +1 (courant de A vers B) ou −1 ; o.u = +1 (flèche de tension vers A) ou −1 (vers B) ; o.il, o.ul : étiquettes */
function fx_cir_dipole(o){
  const y=96;
  let s=bor(70,y)+bor(330,y)+seg([70,y],[330,y],[{k:"DIP",t:0.5}])+T(200,y+5,"D","v-lab s","middle");
  s+=T(62,y+22,"A","v-lab","end")+T(338,y+22,"B","v-lab");
  s+=o.i>0?ia(128,y,1,0):ia(112,y,-1,0); s+=T(120,y+22,o.il||"I","v-lab c s","middle");
  s+=o.u>0?ua(242,y-34,158,y-34):ua(158,y-34,242,y-34); s+=T(200,y-43,o.ul||"U","v-lab a s","middle");
  return svg(136,s,"Dipôle D entre les bornes A et B, avec une flèche de courant et une flèche de tension");
}
/* résistance d'une thermistance CTN en fonction de la température (courbe) ; o.pt : {t, lab} point repéré avec projection verticale */
const ctnR=t=>10*Math.exp(3950*(1/(t+273.15)-1/298.15));   /* kΩ : R25 = 10 kΩ, B = 3 950 K */
function fx_cir_ctn(o){
  const fr=frame({X0:62,Y0:206,W:300,H:166,x0:0,x1:60,xs:10,xm:5,y1:35,ys:5,ym:2.5,xd:0,yd:1,xl:"θ (°C)",yl:"R (kΩ)"});
  let s=fr.s+curve(fr,ctnR,0,60);
  if(o&&o.pt){ const x=fr.X(o.pt.t), y=fr.Y(ctnR(o.pt.t)); s+=(o.pt.h?L(fr.X0,y,x,y,"v-dash"):L(x,fr.Y0,x,y,"v-dash"))+dot(x,y)+Th(x+8,y-8,o.pt.lab||"A","v-lab s"); }
  return svg(248,s,"Résistance de la thermistance CTN en fonction de la température");
}
/* câble aller-retour entre une batterie et un récepteur éloigné : o.L, o.E, o.rec (texte), o.I */
function fx_cir_cable(o){
  const yT=58, yB=158, xl=80, xr=330;
  let s=seg([xl,yB],[xl,yT],[{k:"BAT",t:0.5}])+wr([xl,yT],[160,yT])+L(160,yT,250,yT,"v-dash")+wr([250,yT],[xr,yT])+seg([xr,yT],[xr,yB],[{k:"M",t:0.5}])+wr([xr,yB],[250,yB])+L(250,yB,160,yB,"v-dash")+wr([160,yB],[xl,yB]);
  s+=T(xl+10,(yT+yB)/2-10,"+","v-lab s")+T(xl-20,(yT+yB)/2+5,o.E||"U","v-lab s","end")+T(xr+20,(yT+yB)/2+5,o.rec||"pompe","v-cap");
  s+=L(xl,yB+8,xl,yB+34,"v-dash")+L(xr,yB+8,xr,yB+34,"v-dash")+cote(xl,xr,yB+30,o.L||"L");
  s+=T(205,yT-12,"câble : 2 conducteurs (aller et retour)","v-cap","middle");
  if(o.I) s+=ia(xl+40,yT,1,0)+T(xl+32,yT+18,o.I,"v-lab c s","middle");
  return svg(yB+44,s,"Batterie reliée à un récepteur éloigné par un câble à deux conducteurs de longueur L");
}
/* potentiomètre (piste de résistance totale R_P) utilisé en capteur d'angle : curseur à la fraction k de la piste ; o.E, o.U */
function fx_cir_pot(o){
  const xg=96, xp=214, yT=40, yB=212, y1=70, y2=182, yc=y2-(y2-y1)*o.k;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+wr([xg,yT],[xp,yT],[xp,y1])+wr([xp,y2],[xp,yB],[xg,yB]);
  s+=`<rect x="${xp-8}" y="${y1}" width="16" height="${y2-y1}" class="v-box"/>`+L(xp+44,yc,xp+10,yc,"v-ink","k")+wr([xp+44,yc],[330,yc])+bor(330,yc)+wr([xp,yB],[330,yB])+bor(330,yB);
  s+=T(xg+10,(yT+yB)/2-10,"+","v-lab s")+ua(xg-22,(yT+yB)/2+24,xg-22,(yT+yB)/2-24)+T(xg-29,(yT+yB)/2+5,o.E||"E","v-lab a s","end");
  s+=T(xp-14,(y1+y2)/2,"piste","v-cap","end")+T(xp-14,(y1+y2)/2+14,o.RP||"","v-cap","end")+T(xp+60,yc-8,"curseur","v-cap","middle");
  s+=ua(350,yB-5,350,yc+5)+T(357,(yc+yB)/2+5,o.U||"U","v-lab a s");
  return svg(yB+14,s,"Potentiomètre alimenté sous E : la tension U est prélevée entre le curseur et la borne basse de la piste");
}

/* ===== figures : convertisseurs (préfixe fx_cv_) ===== */
/* chronogramme MLI : période o.T et durée à l'état haut o.ton (en unités de o.tu), o.n périodes, grille o.ts ; o.Ul : étiquette du niveau haut ;
   o.mean : trait de la valeur moyenne ; o.cot : cotes t_on et T */
function fx_cv_mli(o){
  const X0=58, Y0=o.cot?170:150, Wd=312, Hd=96, tmax=o.n*o.T, sx=Wd/tmax, X=t=>X0+t*sx, yh=Y0-Hd*0.78, nt=Math.round(tmax/o.ts), ls=nt>12?2:1;
  let s="";
  for(let k=0;k<=nt;k++){ const t=k*o.ts; s+=L(X(t),Y0,X(t),Y0-Hd,"v-grid"); if(k%ls===0) s+=T(X(t),Y0+16,nf(t,3),"v-lab s","middle"); }
  s+=L(X0,yh,X0+Wd,yh,"v-grid")+L(X0,Y0,X0+Wd+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-Hd-14,"v-ink","k");
  const p=[[X(0),Y0]]; for(let k=0;k<o.n;k++){ const t0=k*o.T; if(o.ton>0) p.push([X(t0),Y0],[X(t0),yh],[X(t0+o.ton),yh],[X(t0+o.ton),Y0]); } p.push([X(tmax),Y0]);
  s+=`<polyline points="${p.map(P2).join(" ")}" class="v-curve"/>`+T(X0-6,yh+4,o.Ul||"U","v-lab s","end")+T(X0-6,Y0+4,"0","v-lab s","end");
  if(o.mean!=null){ const ym=Y0-(Y0-yh)*o.mean; s+=L(X0,ym,X0+Wd,ym,"v-t")+Th(X0+Wd-2,ym-6,o.ml||"⟨u⟩","v-lab c s","end"); }
  if(o.cot){ s+=L(X(o.T),yh-4,X(o.T),yh-34,"v-dash")+L(X(0),yh-4,X(0),yh-34,"v-dash")+cote(X(0),X(o.T),yh-28,"T")+cote(X(0),X(o.ton),yh-10,"t_on"); }
  s+=(o.cot?T(X0-8,Y0-Hd-4,o.yl||"u (V)","v-cap","end"):T(X0+6,Y0-Hd-6,o.yl||"u (V)","v-cap"))+T(X0+Wd+12,Y0+34,`t (${o.tu})`,"v-cap","end");
  return svg(Y0+42,s,o.alt||"Chronogramme d'une tension découpée (MLI)");
}
/* tension alternative en créneaux (onduleur) : ±o.Ul, période o.T, grille o.ts (unité o.tu), o.n périodes */
function fx_cv_carre(o){
  const X0=58, Ym=104, A=60, Wd=312, tmax=o.n*o.T, sx=Wd/tmax, X=t=>X0+t*sx, nt=Math.round(tmax/o.ts), ls=nt>12?2:1, yb=Ym+A+14;
  let s="";
  for(let k=0;k<=nt;k++){ const t=k*o.ts; s+=L(X(t),Ym-A-8,X(t),Ym+A+8,"v-grid"); if(k%ls===0) s+=T(X(t),yb+14,nf(t,3),"v-lab s","middle"); }
  s+=L(X0,Ym-A,X0+Wd,Ym-A,"v-grid")+L(X0,Ym+A,X0+Wd,Ym+A,"v-grid")+L(X0,Ym,X0+Wd+12,Ym,"v-ink","k")+L(X0,yb,X0,Ym-A-20,"v-ink","k");
  const p=[[X(0),Ym-A]]; for(let k=0;k<o.n;k++){ const t0=k*o.T; p.push([X(t0+o.T/2),Ym-A],[X(t0+o.T/2),Ym+A],[X(t0+o.T),Ym+A]); if(k<o.n-1) p.push([X(t0+o.T),Ym-A]); }
  s+=`<polyline points="${p.map(P2).join(" ")}" class="v-curve"/>`;
  s+=T(X0-6,Ym-A+4,o.Ul,"v-lab s","end")+T(X0-6,Ym+A+4,"−"+o.Ul,"v-lab s","end")+T(X0-6,Ym+4,"0","v-lab s","end");
  s+=T(X0+6,Ym-A-24,"u (V)","v-cap")+T(X0+Wd+12,Ym-8,"t","v-cap","end")+T(X0+Wd+12,yb+30,`t (${o.tu})`,"v-cap","end");
  return svg(yb+40,s,"Tension alternative en créneaux délivrée par un onduleur");
}
/* symboles de nature de tension : continu (trait plein sur trait interrompu), alternatif (sinusoïde) */
const dcS=(x,y)=>L(x-10,y-3,x+10,y-3,"v-ink")+`<line x1="${x-10}" y1="${y+3}" x2="${x+10}" y2="${y+3}" class="v-ink" style="stroke-dasharray:5.5 2"/>`;
const acS=(x,y)=>`<path d="M${x-11} ${y} q5.5 -9 11 0 t11 0" class="v-ink"/>`;
/* convertisseur (carré barré) : entrée en haut à gauche, sortie en bas à droite ; a, b : "=" ou "~" ; q : point d'interrogation */
function cvBox(x,y,a,b,q){
  if(q) return `<rect x="${x}" y="${y}" width="56" height="56" rx="2" class="v-boxq"/>`+T(x+28,y+36,"?","v-lab c","middle");
  return `<rect x="${x}" y="${y}" width="56" height="56" rx="2" class="v-box"/>`+L(x,y+56,x+56,y,"v-thin")+(a==="~"?acS(x+17,y+17):dcS(x+17,y+17))+(b==="~"?acS(x+39,y+39):dcS(x+39,y+39));
}
/* chaîne de conversion : o.b = [{t:[lignes]} | {cv:[e, s], q, n:[légende]}] ; flèches d'énergie entre les blocs ; o.cap */
function fx_cv_chaine(o){
  const n=o.b.length, ws=o.b.map(b=>b.cv?56:(b.w||74)), gap=(392-ws.reduce((a,c)=>a+c,0))/(n-1); let x=4, s="";
  const y=o.cap?40:22;
  o.b.forEach((b,i)=>{ const w=ws[i];
    if(b.cv){ s+=cvBox(x,y,b.cv[0],b.cv[1],b.q); if(b.n) s+=multi(x+28,y+72,b.n,"v-sm","middle",12); }
    else s+=`<rect x="${x}" y="${y+6}" width="${w}" height="44" rx="4" class="v-box"/>`+multi(x+w/2,y+28-(b.t.length-1)*6.5+4,b.t,"v-smb","middle",13);
    if(i<n-1) s+=L(x+w+2,y+28,x+w+gap-2,y+28,"v-el","a");
    x+=w+gap; });
  if(o.cap) s+=T(200,18,o.cap,"v-cap","middle");
  return svg(y+(o.b.some(b=>b.n)?100:70),s,o.alt||"Chaîne de conversion de l'énergie électrique");
}
/* pont en H : o.nm = noms des interrupteurs [haut gauche, haut droite, bas gauche, bas droite] ; o.st = états fermés ; o.path : "d" (diagonale HG-BD) | "i" (HD-BG) ; o.U */
function fx_cv_pont(o){
  const xg=52, xa=150, xb=290, yT=36, yB=216, yM=126, yk1=81, yk2=171;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+wr([xg,yT],[xb,yT])+wr([xg,yB],[xb,yB]);
  const K=(x,yc,cl)=>seg([x,yc-24],[x,yc+24],[{k:cl?"K1":"K0",t:0.5}]);
  s+=wr([xa,yT],[xa,yk1-24])+K(xa,yk1,o.st[0])+wr([xa,yk1+24],[xa,yk2-24])+K(xa,yk2,o.st[2])+wr([xa,yk2+24],[xa,yB]);
  s+=wr([xb,yT],[xb,yk1-24])+K(xb,yk1,o.st[1])+wr([xb,yk1+24],[xb,yk2-24])+K(xb,yk2,o.st[3])+wr([xb,yk2+24],[xb,yB]);
  s+=seg([xa,yM],[xb,yM],[{k:"M",t:0.5}])+nd(xa,yM)+nd(xb,yM)+nd(xa,yT)+nd(xa,yB);
  s+=T(xa-14,yk1+5,o.nm[0],"v-lab s","end")+T(xb+14,yk1+5,o.nm[1],"v-lab s")+T(xa-14,yk2+5,o.nm[2],"v-lab s","end")+T(xb+14,yk2+5,o.nm[3],"v-lab s");
  s+=T(xa-8,yM-8,"A","v-lab s","end")+T(xb+8,yM-8,"B","v-lab s");
  s+=T(xg+10,(yT+yB)/2-10,"+","v-lab s")+T(xg-20,(yT+yB)/2+5,o.U||"U","v-lab s","end");
  if(o.path==="d") s+=ia(xa,yT+26,0,1)+ia(186,yM,1,0)+ia(xb,yB-12,0,1);
  if(o.path==="i") s+=ia(xb,yT+26,0,1)+ia(254,yM,-1,0)+ia(xa,yB-12,0,1);
  if(o.path) s+=T(220,yM-22,"i","v-lab c s","middle");
  return svg(yB+14,s,o.alt||"Pont en H : quatre interrupteurs commandés et le moteur entre les points A et B");
}
/* trois chronogrammes numérotés : o.k = ["mli" | "carre" | "redr" | "sin" | "cont"] */
function fx_cv_ondes(o){
  const X0=66, Wd=300, Hh=60; let s="";
  o.k.forEach((k,i)=>{ const y0=16+i*(Hh+26), ym=y0+Hh/2, A=Hh*0.42, pts=[];
    const zero=(k==="carre"||k==="sin")?ym:y0+Hh-6, amp=(k==="carre"||k==="sin")?A:Hh-14;
    for(let j=0;j<=600;j++){ const t=Math.min(j/600*3,3-1e-6), ph=t-Math.floor(t); let v;
      if(k==="mli") v=ph<0.35?1:0; else if(k==="carre") v=ph<0.5?1:-1; else if(k==="redr") v=Math.abs(Math.sin(Math.PI*t)); else if(k==="sin") v=Math.sin(2*Math.PI*t); else v=0.62;
      pts.push([X0+t/3*Wd,zero-v*amp]); }
    s+=L(X0,zero,X0+Wd+10,zero,"v-ink","k")+L(X0,y0+Hh,X0,y0-4,"v-ink","k")+`<polyline points="${pts.map(P2).join(" ")}" class="v-curve"/>`;
    s+=numLab(28,ym,String(i+1))+T(X0+6,y0+4,"u","v-cap")+T(X0+Wd+10,zero+14,"t","v-cap","end"); });
  return svg(16+o.k.length*(Hh+26)-6,s,"Trois chronogrammes de tension numérotés");
}
/* hacheur série : batterie U, transistor T (interrupteur commandé), diode de roue libre D, moteur M ; o.k : T fermé (1) ou ouvert (0) */
function fx_cv_hacheur(o){
  const xg=64, xd=226, xm=318, yT=52, yB=206, yc=(yT+yB)/2;
  let s=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+seg([xg,yT],[xd,yT],[{k:o.k?"K1":"K0",t:0.52}])+wr([xd,yT],[xm,yT]);
  s+=seg([xd,yB],[xd,yT],[{k:"D",t:0.5}])+seg([xm,yT],[xm,yB],[{k:"M",t:0.5}])+wr([xm,yB],[xg,yB])+nd(xd,yT)+nd(xd,yB);
  s+=T(xg+10,yc-10,"+","v-lab s")+T(xg-20,yc+5,o.U||"U","v-lab s","end");
  const xk=xg+(xd-xg)*0.52; s+=T(xk,yT-22,"T","v-lab s","middle")+T(xk,yT+30,"transistor","v-cap","middle")+L(xk,yT+18,xk,yT+2,"v-thin","k");
  s+=T(xd-16,yc+5,"D","v-lab s","end");
  s+=ua(xm+28,yc+30,xm+28,yc-30)+T(xm+35,yc+5,"u","v-lab a s")+ia(272,yT,1,0)+T(264,yT-10,"i","v-lab c s","middle");
  return svg(yB+14,s,"Hacheur série : batterie, transistor T (interrupteur commandé), diode de roue libre D et moteur M");
}
/* vitesse d'un moteur en fonction du rapport cyclique, avec zone morte : N = 0 pour α < a0, puis droite jusqu'à (100 %, N1) ; o.x1 axe */
function fx_cv_nalpha(o){
  const ys=niceStep(o.N1*1.1,6), y1=Math.ceil(o.N1*1.1/ys)*ys;
  const fr=frame({X0:66,Y0:204,W:296,H:160,x1:100,xs:10,xm:5,y1,ys,ym:ys/2,xd:0,yd:0,xl:"α (%)",yl:"N (tr/min)"});
  let s=fr.s+`<polyline points="${P2([fr.X(0),fr.Y(0)])} ${P2([fr.X(o.a0),fr.Y(0)])} ${P2([fr.X(100),fr.Y(o.N1)])}" class="v-curve"/>`;
  (o.pts||[]).forEach(p=>{ s+=dot(fr.X(p[0]),fr.Y(p[1])); });
  return svg(248,s,"Vitesse de rotation du moteur en fonction du rapport cyclique");
}

/* ===== figures : circuit RC (préfixe fx_rc_) ===== */
/* circuit RC : générateur E, interrupteur K (o.mode "k") ou commutateur à deux positions (o.mode "c", o.pos 1 ou 2), résistance R, condensateur C ;
   o.lab = {E, R, C} ; o.u (flèche u_C), o.i (flèche i), o.uR */
function fx_rc_circ(o){
  const xg=100, xc=150, xp=192, xC=330, yT=52, yM=78, yB=208, lb=o.lab||{};
  let s="";
  if(o.mode==="c"){
    s+=seg([xg,yB],[xg,yT],[{k:"BAT",t:0.5}])+wr([xg,yT],[xc,yT])+`<circle cx="${xc}" cy="${yT}" r="2.6" class="v-pt"/><circle cx="${xc}" cy="104" r="2.6" class="v-pt"/><circle cx="${xp}" cy="${yM}" r="2.6" class="v-pt"/>`;
    s+=wr([xc,104],[xc,yB])+nd(xc,yB)+L(xp,yM,xc+4,o.pos===2?101:o.pos===1?55:yM-8,"v-ink");
    s+=T(xc-8,yT-6,"1","v-lab s","end")+T(xc-8,112,"2","v-lab s","end")+T(xp+4,yM-12,"K","v-lab s");
    s+=seg([xp,yM],[xC,yM],[{k:"R",t:0.5}])+seg([xC,yM],[xC,yB],[{k:"C",t:0.5}])+wr([xC,yB],[xg,yB]);
    const xr=xp+(xC-xp)/2; s+=T(xr,yM+30,lb.R||"R","v-lab s","middle");
    if(o.uR) s+=ua(xr+22,yM-20,xr-22,yM-20)+T(xr,yM-29,o.uR,"v-lab a s","middle");
    if(o.i) s+=ia(xC-24,yM,1,0)+T(xC-32,yM-10,o.i,"v-lab c s","middle");
  } else {
    s+=seg([xg,yB],[xg,yM],[{k:"BAT",t:0.5}])+seg([xg,yM],[xC,yM],[{k:o.closed?"K1":"K0",t:0.2},{k:"R",t:0.6}])+seg([xC,yM],[xC,yB],[{k:"C",t:0.5}])+wr([xC,yB],[xg,yB]);
    const xk=xg+(xC-xg)*0.2, xr=xg+(xC-xg)*0.6; s+=T(xk,yM-20,"K","v-lab s","middle")+T(xr,yM+30,lb.R||"R","v-lab s","middle");
    if(o.uR) s+=ua(xr+22,yM-20,xr-22,yM-20)+T(xr,yM-29,o.uR,"v-lab a s","middle");
    if(o.i) s+=ia(xC-24,yM,1,0)+T(xC-32,yM-10,o.i,"v-lab c s","middle");
  }
  const yc=(yM+yB)/2, yg=o.mode==="c"?(yT+yB)/2:(yM+yB)/2;
  s+=T(xg+10,yg-10,"+","v-lab s")+T(xg-20,yg+5,lb.E||"E","v-lab s","end")+T(xC-18,yc+5,lb.C||"C","v-lab s","end");
  if(o.u) s+=ua(xC+26,yc+24,xC+26,yc-24)+T(xC+33,yc+5,o.u,"v-lab a s");
  return svg(yB+14,s,o.mode==="c"?"Circuit RC avec commutateur : position 1 charge, position 2 décharge":"Circuit RC : générateur, interrupteur K, résistance R et condensateur C en série");
}
/* tension aux bornes du condensateur en fonction du temps : o.E, o.tau, o.dech, axes o.x1, o.xs, o.xm, o.y1, o.ys, o.ym, o.xl, o.yl ;
   o.asy (asymptote E), o.l63 (trait à 63 % ou 37 %), o.tan (tangente à l'origine, en orange : à signaler dans l'énoncé), o.pts [{t, lab}], o.more [{tau, E, dech, lab, lt}] */
function fx_rc_courbe(o){
  const fr=frame({X0:62,Y0:206,W:300,H:166,x1:o.x1,xs:o.xs,xm:o.xm,y1:o.y1,ys:o.ys,ym:o.ym,xd:o.xd,yd:o.yd,xl:o.xl||"t (ms)",yl:o.yl||"u_C (V)"});
  const f=(E,tau,d)=>t=>d?E*Math.exp(-t/tau):E*(1-Math.exp(-t/tau));
  let s=fr.s;
  if(o.asy) s+=L(fr.X0,fr.Y(o.E),fr.X0+fr.W,fr.Y(o.E),"v-dash");
  if(o.l63){ const v=o.dech?0.37*o.E:0.63*o.E; s+=L(fr.X0,fr.Y(v),fr.X0+fr.W,fr.Y(v),"v-dash")+Th(fr.X0+fr.W-2,fr.Y(v)-6,o.dech?"37 % de E":"63 % de E","v-cap","end"); }
  if(o.hl) s+=L(fr.X0,fr.Y(o.hl.v),fr.X0+fr.W,fr.Y(o.hl.v),"v-dash")+Th(fr.X0+fr.W-2,fr.Y(o.hl.v)+(o.hl.below?16:-6),o.hl.lab,"v-cap","end");
  if(o.tan){ if(o.dech) s+=L(fr.X(0),fr.Y(o.E),fr.X(o.tau),fr.Y(0),"v-t");
    else { const tt=Math.min(o.tau*1.2,o.x1,o.tau*o.y1/o.E); s+=L(fr.X(0),fr.Y(0),fr.X(tt),fr.Y(o.E*tt/o.tau),"v-t"); } }
  (o.more||[]).forEach(c=>{ s+=curve(fr,f(c.E,c.tau,c.dech),0,o.x1,c.cls||"v-curve"); });
  if(o.tau) s+=curve(fr,f(o.E,o.tau,o.dech),0,o.x1);
  (o.more||[]).forEach(c=>{ if(c.lab){ const x=fr.X(c.lt), y=fr.Y(f(c.E,c.tau,c.dech)(c.lt)); s+=numLab(x+(c.dx||0),y+(c.dy||0),c.lab); } });
  (o.pts||[]).forEach(p=>{ const x=fr.X(p.t), y=fr.Y(f(o.E,o.tau,o.dech)(p.t)); s+=(p.proj?L(x,fr.Y0,x,y,"v-dash")+L(fr.X0,y,x,y,"v-dash"):"")+dot(x,y)+(p.lab?Th(x+8,y+(p.dy||-8),p.lab,"v-lab s"):""); });
  if(o.Elab) s+=Th(fr.X0+6,fr.Y(o.E)-6,o.Elab,"v-cap");
  return svg(248,s,o.alt||(o.dech?"Tension aux bornes du condensateur pendant la décharge":"Tension aux bornes du condensateur pendant la charge"));
}
/* capteur capacitif de niveau : deux électrodes plongées dans un réservoir, hauteur de liquide h */
function fx_rc_niveau(o){
  const x1=120, x2=280, yT=62, yB=222, yl=yB-(yB-yT-20)*o.k;
  let s=`<rect x="${x1}" y="${yl.toFixed(1)}" width="${x2-x1}" height="${(yB-yl).toFixed(1)}" style="fill:var(--accent);fill-opacity:.16;stroke:none"/>`;
  s+=`<path d="M${x1} ${yT} L${x1} ${yB} L${x2} ${yB} L${x2} ${yT}" class="v-ink" style="stroke-width:2.2"/>`+L(x1,yl,x2,yl,"v-thin");
  s+=LW(186,yT-18,186,yB-10,4)+LW(214,yT-18,214,yB-10,4)+wr([186,yT-18],[186,yT-28],[150,yT-28])+wr([214,yT-18],[214,yT-28],[250,yT-28])+bor(146,yT-28)+bor(254,yT-28);
  s+=T(200,yT-40,"électrodes","v-cap","middle")+T(x2+8,yl-6,o.liq||"eau","v-cap");
  s+=`<line x1="${x2+34}" y1="${yB}" x2="${x2+34}" y2="${yl.toFixed(1)}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+L(x2+2,yl,x2+40,yl,"v-dash")+T(x2+40,(yB+yl)/2+5,"h","v-lab s");
  s+=T(x1-8,(yT+yB)/2,"réservoir","v-cap","end");
  return svg(yB+14,s,"Capteur capacitif de niveau : deux électrodes plongées dans le liquide sur une hauteur h");
}
/* condensateur plan : deux armatures de surface S séparées par une épaisseur e d'isolant */
function fx_rc_plan(o){
  const e=o.e?40:30, xa=170, xb=330, xm=(xa+xb)/2;
  let s=`<rect x="${xa}" y="96" width="${xb-xa}" height="${e}" style="fill:var(--accent);fill-opacity:.14;stroke:none"/>`;
  s+=`<rect x="${xa}" y="86" width="${xb-xa}" height="10" class="v-body"/><rect x="${xa}" y="${96+e}" width="${xb-xa}" height="10" class="v-body"/>`;
  s+=wr([xm,86],[xm,50])+bor(xm,46)+wr([xm,106+e],[xm,142+e])+bor(xm,146+e);
  s+=`<line x1="${xb+16}" y1="96" x2="${xb+16}" y2="${96+e}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+T(xb+24,96+e/2+5,"e","v-lab s");
  s+=T(xa-10,94,"armature","v-cap","end")+T(xa-10,108,"(surface S)","v-cap","end")+T(xa-10,96+e/2+5,o.iso||"isolant","v-cap","end");
  return svg(170+e,s,"Condensateur plan : deux armatures de surface S séparées par une épaisseur e d'isolant");
}
/* champ électrique uniforme entre deux plaques chargées.
   o.or : "h" (plaques horizontales, champ vertical) ou "v" (plaques verticales percées en leur milieu, champ horizontal) ;
   o.p1 : signe de la plaque du haut (h) ou de gauche (v) ; o.lines : lignes de champ fléchées ; o.U, o.d, o.L : étiquettes des cotes ;
   o.pt : particule {s : signe dessiné, c : "centre" ou "entrée"} ; o.v0 : vitesse d'entrée (h) ; o.num : numéros des flèches [haut, droite, bas, gauche] ; o.vB : vitesse de sortie (v) */
function fx_rc_champ(o){
  const pl=o.p1==="−"?"−":"+", mi=pl==="+"?"−":"+"; let s="";
  const part=(x,y,sg)=>`<circle cx="${x}" cy="${y}" r="8.5" class="v-wheel" style="stroke-width:1.6"/>`+T(x,y+4.5,sg,"v-lab s","middle");
  if(o.or==="v"){
    const xa=124, xb=276, yT=48, yB=192, ym=120, gp=11, w=8;
    const plate=x=>`<rect x="${x-w/2}" y="${yT}" width="${w}" height="${ym-gp-yT}" class="v-body"/><rect x="${x-w/2}" y="${ym+gp}" width="${w}" height="${yB-ym-gp}" class="v-body"/>`;
    s+=plate(xa)+plate(xb);
    [60,84,156,180].forEach(y=>{ s+=T(xa-14,y+5,pl,"v-lab s","middle")+T(xb+14,y+5,mi,"v-lab s","middle"); });
    if(o.lines){ [68,92,148,172].forEach(y=>{ s+=pl==="+"?L(xa+7,y,xb-9,y,"v-thin","k"):L(xb-7,y,xa+9,y,"v-thin","k"); }); s+=Th(200,84,"E","v-lab a","middle"); }
    s+=L(xa,ym,xb,ym,"v-dash")+T(xa-12,ym+26,"A","v-lab","middle")+T(xb+12,ym+26,"B","v-lab","middle");
    if(o.pt) s+=part(xa,ym,o.pt.s);
    if(o.vB) s+=L(xb+12,ym,xb+72,ym,"v-f","f")+T(xb+44,ym-10,"v_B","v-lab","middle");
    if(o.U) s+=(pl==="+"?ua(xb,26,xa,26):ua(xa,26,xb,26))+T(200,20,o.U,"v-lab a s","middle");
    if(o.d) s+=L(xa,yB+4,xa,yB+26,"v-dash")+L(xb,yB+4,xb,yB+26,"v-dash")+cote(xa,xb,yB+22,o.d);
    return svg(yB+(o.d?34:12),s,`Deux plaques verticales percées, A (${pl}) et B (${mi}), entre lesquelles règne un champ électrique uniforme`);
  }
  const x1=100, x2=312, yT=64, yB=176, ym=120, th=8, ctr=!o.pt||o.pt.c!=="entrée";
  s+=`<rect x="${x1}" y="${yT-th}" width="${x2-x1}" height="${th}" class="v-body"/><rect x="${x1}" y="${yB}" width="${x2-x1}" height="${th}" class="v-body"/>`;
  for(let x=x1+16;x<x2;x+=30) s+=T(x,yT-th-5,pl,"v-lab s","middle")+T(x,yB+th+15,mi,"v-lab s","middle");
  if(o.lines){ const xs=ctr?[116,136,276,296]:[154,194,234,274];
    xs.forEach(x=>{ s+=pl==="+"?L(x,yT+2,x,yB-4,"v-thin","k"):L(x,yB-2,x,yT+4,"v-thin","k"); });
    s+=Th(xs[1]+8,ctr?ym-26:ym-30,"E","v-lab a"); }
  if(o.pt){ const px=ctr?206:64; s+=part(px,ym,o.pt.s);
    if(o.v0) s+=L(px+12,ym,px+58,ym,"v-f","f")+T(px+34,ym-10,"v0","v-lab","middle");
    if(o.num){ const A=[[0,-1],[1,0],[0,1],[-1,0]], LB=[[16,-38],[46,-16],[16,38],[-46,-16]];
      A.forEach((d,i)=>{ s+=L(px+d[0]*10,ym+d[1]*10,px+d[0]*46,ym+d[1]*44,"v-vec","k")+numLab(px+LB[i][0],ym+LB[i][1],String(o.num[i])); }); } }
  if(o.d) s+=`<line x1="${x2+22}" y1="${yT}" x2="${x2+22}" y2="${yB}" class="v-cote" marker-start="url(#m-d)" marker-end="url(#m-d)"/>`+T(x2+30,ym+5,o.d,"v-lab s");
  if(o.U) s+=(pl==="+"?ua(x2+62,yB-6,x2+62,yT+6):ua(x2+62,yT+6,x2+62,yB-6))+T(x2+70,ym+5,o.U,"v-lab a s");
  if(o.L) s+=L(x1,yB+th+22,x1,yB+th+40,"v-dash")+L(x2,yB+th+22,x2,yB+th+40,"v-dash")+cote(x1,x2,yB+th+36,o.L);
  return svg(yB+th+(o.L?46:24),s,`Deux plaques horizontales chargées (plaque du haut ${pl}, plaque du bas ${mi}) entre lesquelles règne un champ électrique uniforme`);
}
/* tension d'un condensateur chargé à courant constant (rampe), puis maintenue : o.t1, o.U1 ; axes comme frame ; o.pts : [[t, u]] points repérés (o.lab) */
function fx_rc_rampe(o){
  const fr=frame({X0:62,Y0:206,W:300,H:166,x1:o.x1,xs:o.xs,xm:o.xm,y1:o.y1,ys:o.ys,ym:o.ym,xd:o.xd,yd:o.yd,xl:o.xl||"t (s)",yl:o.yl||"u_C (V)"});
  let s=fr.s+`<polyline points="${P2([fr.X(0),fr.Y(o.u0||0)])} ${P2([fr.X(o.t1),fr.Y(o.U1)])} ${P2([fr.X(o.x1),fr.Y(o.U1)])}" class="v-curve"/>`;
  (o.pts||[]).forEach(p=>{ const x=fr.X(p[0]), y=fr.Y(p[1]); s+=L(x,fr.Y0,x,y,"v-dash")+L(fr.X0,y,x,y,"v-dash")+dot(x,y)+(o.lab?Th(x-8,y-8,o.lab,"v-lab s","end"):""); });
  return svg(248,s,o.alt||"Tension aux bornes d'un condensateur chargé à courant constant");
}

/* ======================================================================
   CIRCUITS, LOIS DE KIRCHHOFF — ener-circuits
   ====================================================================== */
/* LED : couleur, tension de seuil (V) */
const LEDS=[["rouge",1.8],["rouge",2],["orange",2],["jaune",2.1],["verte",2.2],["bleue",3.1],["blanche",3.2]];
const r3=x=>Number(x.toPrecision(3));
/* thermistance CTN (R25 = 10 kΩ) : tableau de valeurs arrondies, utilisées telles quelles dans les calculs */
const CTNT=[0,10,20,25,30,40,50].map(t=>[t,r3(ctnR(t))]);
const ctnTab=()=>table(["θ (°C)","R_CTN (kΩ)"],CTNT.map(r=>[String(r[0]),nf(r[1],2)]));
const SUPS=[[5,"la sortie 5 V d'une carte Arduino"],[9,"une pile de 9 V"],[12,"la batterie 12 V d'un bateau"],[24,"le réseau 24 V d'un engin agricole"]];

const CI1=[
/* loi d'Ohm : tension, courant ou résistance */
()=>{ const v=rnd([0,1,2]);
  if(v===0){ const o=draw(()=>({R:rnd([47,68,100,150,220,330,470,680,1000,1500,2200,3300]),I:rnd([2,4,5,8,10,12,15,20,25,30])}),o=>{ const u=o.R*o.I/1000; return u>=0.2&&u<=24; }), Uv=o.R*o.I/1000;
    return {q:`Un conducteur ohmique de résistance R = ${fR(o.R)} est traversé par un courant I = ${o.I} mA. Calcule la tension U à ses bornes.`,type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`Loi d'Ohm : ${F("U = R·I")} avec R = ${nf(o.R,0)} Ω et I = ${o.I} mA = ${nf(o.I/1000,3)} A : U = ${nf(o.R,0)} × ${nf(o.I/1000,3)} = ${U(Uv,"V")}. On convertit d'abord les mA en A (et les kΩ en Ω).`}; }
  if(v===1){ const o=draw(()=>({R:rnd([220,470,680,1000,1500,2200,4700,10000]),Uv:rnd([3.3,5,9,12,24])}),o=>{ const i=o.Uv/o.R*1000; return i>=0.3&&i<=60; }), I=o.Uv/o.R*1000;
    return {q:`Une résistance de ${fR(o.R)} est soumise à une tension de ${nf(o.Uv,1)} V. Quelle est l'intensité du courant qui la traverse, en mA ?`,type:"num",ans:I,tolR:0.02,unit:"mA",
      expl:`${F(`I = ${FRAC("U","R")}`)} avec R en ohms${o.R>=1000?` (${fR(o.R)} = ${nf(o.R,0)} Ω)`:""} : I = ${FRAC(nf(o.Uv,1),nf(o.R,0))} = ${nf(o.Uv/o.R,6)} A, soit ${U(I,"mA")}.`}; }
  const Uv=rnd([5,12,24]), I=rnd([0.5,0.8,1.2,1.5,2,2.5,3,4]), R=Uv/I, sys=rnd(["d'un rétroviseur dégivrant","d'un gilet chauffant","d'un tapis chauffant pour semis","d'une couveuse"]);
  return {q:`Sous une tension de ${Uv} V, l'élément chauffant ${sys} absorbe un courant de ${nf(I,1)} A. Calcule sa résistance.`,type:"num",ans:R,tolR:0.02,unit:"Ω",
    expl:`Loi d'Ohm : ${F(`R = ${FRAC("U","I")}`)} = ${FRAC(Uv,nf(I,1))} = ${U(R,"Ω")}.`}; },
/* loi des nœuds : tableau électrique d'un catamaran */
()=>{ const LD=[["Réfrigérateur"],["Pompe de cale"],["Feux de","navigation"],["Radio VHF"],["Pilote","automatique"],["Éclairage","intérieur"]];
  const o=draw(()=>({ld:shuffle(LD).slice(0,2),Ip:rnd([3.5,4.2,5,5.6,6.4,7.2,8]),I1:rnd([0.6,0.8,1.2,1.5,2.4,3.2,4.2]),I2:rnd([0.5,0.9,1.1,1.6,2.5,3])}),o=>{ const b=r2(o.Ip-o.I1-o.I2,1); return Math.abs(b)>=0.4&&o.I1!==o.I2; });
  const Ib=r2(o.Ip-o.I1-o.I2,1);
  const br=[{nm:["Panneau","solaire"],I:o.Ip,dir:1},{nm:o.ld[0],I:o.I1,dir:-1},{nm:o.ld[1],I:o.I2,dir:-1},{nm:["Batterie"],I:Math.abs(Ib),dir:Ib>0?-1:1}];
  const k=rnd([1,2,3]), pos=[0,...shuffle([1,2,3])], nm=i=>`I${i+1}`;
  const fig=fx_cir_noeud({b:[0,1,2,3].map(p=>{ const i=pos.indexOf(p), b=br[i]; return {nm:b.nm,dir:b.dir,lab:i===k?`${nm(i)} = ?`:`${nm(i)} = ${nf(b.I,1)} A`}; })});
  const ins=[0,1,2,3].filter(i=>br[i].dir>0), outs=[0,1,2,3].filter(i=>br[i].dir<0), kin=br[k].dir>0;
  const same=(kin?ins:outs).filter(i=>i!==k), other=kin?outs:ins;
  const calc=`${other.map(i=>nf(br[i].I,1)).join(" + ")}${same.map(i=>` − ${nf(br[i].I,1)}`).join("")}`;
  return {fig,ctx:"Tableau électrique d'un catamaran : au nœud N se rejoignent le panneau solaire, la batterie et deux récepteurs. Les flèches indiquent le sens des courants.",
    q:`Calcule l'intensité ${nm(k)} du courant dans la branche « ${br[k].nm.join(" ")} ».`,type:"num",ans:br[k].I,tolR:0.02,unit:"A",
    expl:`Loi des nœuds en N : la somme des intensités des courants qui arrivent est égale à la somme des intensités des courants qui repartent, ${F(`${ins.map(nm).join(" + ")} = ${outs.map(nm).join(" + ")}`)}. Donc ${nm(k)} = ${calc} = ${U(br[k].I,"A")}.`}; },
/* loi des mailles : trois résistances en série */
()=>{ const o=draw(()=>{ const E=rnd([6,9,12,24]), a=r2(E*(0.15+Math.random()*0.35),1), b=r2(E*(0.15+Math.random()*0.35),1); return {E,u:[a,b,r2(E-a-b,1)]}; },o=>o.u[2]>=0.12*o.E&&o.u[0]!==o.u[1]);
  const k=rnd([0,1,2]), u=o.u, lb=i=>i===k?`U${i+1} = ?`:`U${i+1} = ${nf(u[i],1)} V`, oth=[0,1,2].filter(i=>i!==k);
  const fig=fx_cir_boucle({gen:{u:`E = ${o.E} V`},top:{k:"R",lab:["R1"],u:lb(0)},right:{k:"R",lab:["R2"],u:lb(1)},bot:{k:"R",lab:["R3"],u:lb(2)},I:"I"});
  return {fig,ctx:"Trois résistances R1, R2 et R3 sont montées en série avec un générateur de tension E. Les tensions sont fléchées en convention récepteur.",
    q:`Écris la loi des mailles, puis calcule la tension U${k+1}.`,type:"num",ans:u[k],tolR:0.02,unit:"V",
    expl:`Loi des mailles : ${F("E = U1 + U2 + U3")} ; les récepteurs en série se partagent la tension du générateur. U${k+1} = E − U${oth[0]+1} − U${oth[1]+1} = ${o.E} − ${nf(u[oth[0]],1)} − ${nf(u[oth[1]],1)} = ${U(u[k],"V")}.`}; },
/* résistances en série */
()=>{ const n=rnd([2,3]), R=draw(()=>[...Array(n)].map(()=>rnd(e12in(100,8200))),R=>new Set(R).size===n&&R.some(r=>r<1000)&&R.some(r=>r>=1000)), S=R.reduce((a,b)=>a+b,0);
  return {fig:fx_cir_serie({lab:R.map((r,i)=>[`R${i+1}`,fR(r)])}),q:"Calcule la résistance équivalente R_éq entre A et B, en kΩ.",type:"num",ans:S/1000,tolR:0.02,unit:"kΩ",
    expl:`En série, les résistances s'ajoutent : ${F(`R_éq = ${R.map((_,i)=>`R${i+1}`).join(" + ")}`)}. Dans la même unité : ${R.map(r=>nf(r,0)).join(" + ")} = ${nf(S,0)} Ω, soit ${U(S/1000,"kΩ")}.`}; },
/* deux résistances en parallèle */
()=>{ const eq=Math.random()<0.25, o=draw(()=>{ const a=rnd(e12in(100,10000)); return {a,b:eq?a:rnd(e12in(100,10000))}; },o=>eq||(o.a!==o.b&&o.b/o.a<=12&&o.a/o.b<=12));
  const Rq=o.a*o.b/(o.a+o.b), kO=Rq>=1000;
  return {fig:fx_cir_paral({lab:[[`R1 = ${fR(o.a)}`],[`R2 = ${fR(o.b)}`]]}),q:`Les deux résistances sont montées en parallèle entre A et B. Calcule leur résistance équivalente${kO?", en kΩ":""}.`,type:"num",ans:kO?Rq/1000:Rq,tolR:0.02,unit:kO?"kΩ":"Ω",
    expl:`En parallèle : ${F(`R_éq = ${FRAC("R1·R2","R1 + R2")}`)} = ${FRAC(`${nf(o.a,0)} × ${nf(o.b,0)}`,`${nf(o.a,0)} + ${nf(o.b,0)}`)} = ${kO?`${nf(Rq,0)} Ω, soit ${U(Rq/1000,"kΩ")}`:U(Rq,"Ω")}. ${eq?`Deux résistances égales en parallèle : ${F(`R_éq = ${FRAC("R","2")}`)}.`:"R_éq est plus petite que la plus petite des deux résistances."}`}; },
/* cours : série et parallèle */
()=>{ const C=rnd([
    {q:"Deux dipôles sont montés en série. Quelle grandeur ont-ils forcément en commun ?",ok:"L'intensité du courant qui les traverse",w:["La tension à leurs bornes","La puissance qu'ils reçoivent","Leur résistance"],
      e:"En série, il n'y a qu'un seul chemin : le même courant traverse les deux dipôles. Les tensions, elles, se partagent la tension totale (loi des mailles)."},
    {q:"Deux dipôles sont montés en parallèle (en dérivation). Quelle grandeur ont-ils forcément en commun ?",ok:"La tension à leurs bornes",w:["L'intensité du courant qui les traverse","La puissance qu'ils reçoivent","Leur résistance"],
      e:"En parallèle, les deux dipôles sont branchés entre les deux mêmes nœuds : ils ont la même tension (loi des mailles). Les courants se partagent le courant total (loi des nœuds)."},
    {q:"On ajoute une résistance R2 en parallèle sur une résistance R déjà en place. Que devient la résistance équivalente ?",ok:"Elle diminue : elle devient plus petite que R",w:["Elle augmente : les résistances s'ajoutent","Elle ne change pas","Elle double"],
      e:`Une branche de plus offre un chemin de plus au courant : sous la même tension, le courant total augmente, donc la résistance équivalente diminue. ${F(`R_éq = ${FRAC("R·R2","R + R2")}`)} est inférieure à R et à R2.`},
    {q:"Quelle relation donne la résistance équivalente de deux résistances R1 et R2 montées en parallèle ?",ok:`R_éq = ${FRAC("R1·R2","R1 + R2")}`,w:["R_éq = R1 + R2",`R_éq = ${FRAC("R1 + R2","R1·R2")}`,`R_éq = ${FRAC("R1 + R2","2")}`],
      e:`En parallèle, les inverses s'ajoutent : ${FRAC("1","R_éq")} = ${FRAC("1","R1")} + ${FRAC("1","R2")}, d'où ${F(`R_éq = ${FRAC("R1·R2","R1 + R2")}`)}. R1 + R2 est la résistance équivalente en série ; ${FRAC("R1 + R2","R1·R2")} n'est même pas en ohms.`}]);
  return {q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; },
/* pont diviseur à vide */
()=>{ const o=draw(()=>({E:rnd([3.3,5,9,12]),R1:rnd(e12in(1000,100000)),R2:rnd(e12in(1000,100000))}),o=>o.R1!==o.R2&&o.R1/o.R2<=10&&o.R2/o.R1<=10);
  const U2=o.E*o.R2/(o.R1+o.R2);
  return {fig:fx_cir_pont({E:`E = ${nf(o.E,1)} V`,top:{k:"R",lab:["R1",fR(o.R1)]},bot:{k:"R",lab:["R2",fR(o.R2)]},U2:"U2 = ?"}),ctx:"Le courant d'entrée du CAN est négligeable : R1 et R2 sont parcourues par le même courant (pont diviseur à vide).",
    q:"Calcule la tension U2 appliquée à l'entrée du CAN.",type:"num",ans:U2,tolR:0.02,unit:"V",
    expl:`Pont diviseur à vide : ${F(`U2 = E·${FRAC("R2","R1 + R2")}`)} = ${nf(o.E,1)} × ${FRAC(nf(o.R2,0),`${nf(o.R1,0)} + ${nf(o.R2,0)}`)} = ${U(U2,"V")}. U2 est toujours inférieure à E.`}; },
/* résistance de protection d'une LED */
()=>{ const SUP=[[5,"la sortie 5 V d'une carte Arduino"],[3.3,"la sortie 3,3 V d'une carte ESP32"],[9,"une pile de 9 V"],[12,"la batterie 12 V d'un bateau"]];
  const o=draw(()=>({s:rnd(SUP),l:rnd(LEDS),I:rnd([5,8,10,12,15,20])}),o=>o.s[0]-o.l[1]>=1);
  const R=(o.s[0]-o.l[1])/(o.I/1000);
  return {fig:fx_cir_boucle({gen:{u:`E = ${nf(o.s[0],1)} V`},top:{k:"R",lab:["R"],u:"U_R"},right:{k:"LED",lab:["LED",o.l[0]],u:`U_LED = ${nf(o.l[1],1)} V`},I:`I = ${o.I} mA`}),
    ctx:`Une LED ${o.l[0]} (tension de seuil ${nf(o.l[1],1)} V) est alimentée par ${o.s[1]}. Pour ne pas la détruire, on limite son courant à ${o.I} mA avec une résistance R en série.`,
    q:"Quelle valeur de R faut-il ?",type:"num",ans:R,tolR:0.02,unit:"Ω",
    expl:`Loi des mailles : U_R = E − U_LED = ${nf(o.s[0],1)} − ${nf(o.l[1],1)} = ${nf(o.s[0]-o.l[1],1)} V. Loi d'Ohm : ${F(`R = ${FRAC("E − U_LED","I")}`)} = ${FRAC(nf(o.s[0]-o.l[1],1),nf(o.I/1000,3))} = ${U(R,"Ω")}. Attention : I en ampères.`}; },
/* puissance dissipée dans une résistance */
()=>{ if(Math.random()<0.5){ const S=[["Une résistance de mesure de courant (shunt)","parcourue"],["La résistance de freinage d'un petit moteur","parcourue"],["Le fil chauffant d'un découpeur de polystyrène","parcouru"]], s=rnd(S);
    const o=draw(()=>({R:rnd([0.1,0.22,0.47,1,2.2,4.7,10]),I:rnd([0.5,1.5,2,3,5,8])}),o=>{ const P=o.R*o.I*o.I; return P>=0.05&&P<=60; }), P=o.R*o.I*o.I;
    return {q:`${s[0]}, de résistance ${nf(o.R,2)} Ω, est ${s[1]} par un courant de ${nf(o.I,1)} A. Calcule la puissance dissipée par effet Joule.`,type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`${F("P = R·I²")} = ${nf(o.R,2)} × ${nf(o.I,1)}² = ${U(P,"W")}. Cette puissance est dissipée en chaleur (effet Joule).`}; }
  const o=draw(()=>({R:rnd([4.7,10,22,47,100,220]),Uv:rnd([5,9,12,24])}),o=>{ const P=o.Uv*o.Uv/o.R; return P>=0.1&&P<=60; }), P=o.Uv*o.Uv/o.R;
  return {q:`Une résistance chauffante de ${nf(o.R,1)} Ω est alimentée sous ${o.Uv} V. Quelle puissance électrique reçoit-elle ?`,type:"num",ans:P,tolR:0.02,unit:"W",
    expl:`${F("P = U·I")} avec ${F(`I = ${FRAC("U","R")}`)}, donc ${F(`P = ${FRAC("U²","R")}`)} = ${FRAC(`${o.Uv}²`,nf(o.R,1))} = ${U(P,"W")}, entièrement convertie en chaleur.`}; },
/* lecture de schéma : résistances en parallèle, courant total */
()=>{ const nm=shuffle(["R1","R2","R3"]), fig=fx_cir_mixte({n:[[nm[0]],[nm[1]],[nm[2]]],E:"E"}), pair=[nm[1],nm[2]].sort().join(" et ");
  if(Math.random()<0.6){ const others=[["R1","R2"],["R1","R3"],["R2","R3"]].map(p=>p.join(" et ")).filter(x=>x!==pair);
    return {fig,q:"Sur ce schéma, quelles résistances sont montées en parallèle ?",type:"ch",...mc(pair,[...others,"Aucune : les trois sont en série"]),
      expl:`${pair} sont branchées entre les deux mêmes nœuds (en haut et en bas) : elles sont ${F("en parallèle")} et ont la même tension. ${nm[0]} est en série avec cet ensemble : elle est traversée par le courant total.`}; }
  return {fig,q:"Sur ce schéma, quelle résistance est traversée par la totalité du courant fourni par le générateur ?",type:"ch",...mc(nm[0],[nm[1],nm[2],"Aucune : le courant se partage entre les trois"]),
    expl:`${F(nm[0])} est la seule résistance placée sur le trajet commun, avant le nœud : tout le courant du générateur la traverse. Ensuite, le courant se partage entre ${nm[1]} et ${nm[2]} (loi des nœuds).`}; },
/* conventions récepteur et générateur */
()=>{ const i=rnd([1,-1]), rec=Math.random()<0.5;
  return {fig:fx_cir_dipole({i,u:rec?i:-i}),q:"Le dipôle D est représenté avec une flèche de courant et une flèche de tension. Quelle convention est utilisée ?",type:"ch",ch:["Convention récepteur","Convention générateur"],ok:rec?0:1,
    expl:`Les flèches du courant et de la tension sont ${rec?"de sens opposés":"de même sens"} : c'est la ${F(rec?"convention récepteur":"convention générateur")}. ${rec?"On l'utilise pour les récepteurs (résistance, moteur, LED…) : U et I y sont positifs, et P = U·I est la puissance reçue.":"On l'utilise pour les générateurs (pile, batterie, alimentation) : U et I y sont positifs, et P = U·I est la puissance fournie."}`}; },
/* énergie consommée par un voyant allumé en permanence */
()=>{ const o={Uv:rnd([5,12,24]),I:rnd([2,5,10,15,20]),h:rnd([24,720,8760])};
  const P=o.Uv*o.I/1000, E=P*o.h, per=o.h===24?"par jour":o.h===720?"en 30 jours":"par an (8 760 h)";
  return {ctx:`Le voyant lumineux (LED et sa résistance) d'un chargeur reste allumé en permanence. Il est alimenté sous ${o.Uv} V et absorbe ${o.I} mA.`,
    q:`Quelle énergie électrique ce voyant consomme-t-il ${per}, en Wh ?`,type:"num",ans:E,tolR:0.02,unit:"Wh",
    expl:`${F("P = U·I")} = ${o.Uv} × ${nf(o.I/1000,3)} = ${nf(P,3)} W. Énergie : ${F("E = P·Δt")} = ${nf(P,3)} W × ${nf(o.h,0)} h = ${U(E,"Wh")}${E>=1000?`, soit ${nf(E/1000,2)} kWh`:""}. Une petite puissance permanente finit par compter.`}; },
/* lecture de la caractéristique d'une CTN */
()=>{ const t=rnd([10,15,20,30,35,40,45,50]), R=ctnR(t);
  return {fig:fx_cir_ctn({pt:{t,lab:"A"}}),ctx:"La courbe donne la résistance d'une thermistance CTN en fonction de la température.",
    q:`Lis la résistance de la CTN au point A (θ = ${t} °C), à 0,5 kΩ près.`,type:"num",ans:R,tolA:0.6,unit:"kΩ",
    expl:`On lit l'ordonnée du point A : ${F(`R ≈ ${nf(R,1)} kΩ`)} (valeur calculée : ${S3(R)} kΩ). La résistance d'une CTN (coefficient de température négatif) diminue quand la température augmente.`}; }
];

const CI2=[
/* association série-parallèle : résistance équivalente, puis courant */
()=>{ const o=draw(()=>({E:rnd([5,9,12,24]),R1:rnd(e12in(100,2200)),R2:rnd(e12in(220,10000)),R3:rnd(e12in(220,10000))}),o=>o.R2!==o.R3&&o.R2/o.R3<=10&&o.R3/o.R2<=10);
  const Rp=o.R2*o.R3/(o.R2+o.R3), Rq=o.R1+Rp, Rr=Math.round(Rq), I=o.E/Rr*1000;
  const fig=fx_cir_mixte({n:[[`R1 = ${fR(o.R1)}`],["R2",fR(o.R2)],["R3",fR(o.R3)]],E:`${o.E} V`,I:["I"]});
  const ctx=`Le générateur maintient E = ${o.E} V. R1 est en série avec l'ensemble formé par R2 et R3 en parallèle.`;
  return [{fig,ctx,q:"Calcule la résistance équivalente du circuit vue par le générateur, en Ω.",type:"num",ans:Rq,tolR:0.02,unit:"Ω",
      expl:`R2 et R3 en parallèle : ${F(`R23 = ${FRAC("R2·R3","R2 + R3")}`)} = ${FRAC(`${nf(o.R2,0)} × ${nf(o.R3,0)}`,`${nf(o.R2,0)} + ${nf(o.R3,0)}`)} = ${nf(Rp,1)} Ω. En série avec R1 : ${F("R_éq = R1 + R23")} = ${nf(o.R1,0)} + ${nf(Rp,1)} = ${U(Rq,"Ω")}.`},
    {fig,ctx:ctx+` R_éq = ${nf(Rr,0)} Ω.`,q:"Quelle est l'intensité I du courant fourni par le générateur, en mA ?",type:"num",ans:I,tolR:0.02,unit:"mA",
      expl:`Loi d'Ohm appliquée au circuit entier : ${F(`I = ${FRAC("E","R_éq")}`)} = ${FRAC(o.E,nf(Rr,0))} = ${nf(I/1000,6)} A, soit ${U(I,"mA")}.`}]; },
/* pont diviseur avec une CTN : tableau, tension, valeur numérique */
()=>{ const t=rnd([0,10,20,30,40,50]), Rc=CTNT.find(r=>r[0]===t)[1], Uv=5*Rc/(10+Rc), N=Math.round(1023*Uv/5);
  const fig=fx_cir_pont({E:"E = 5 V",top:{k:"R",lab:["R","10 kΩ"]},bot:{k:"CTN",lab:["CTN"]},U2:"U"});
  const ctx="Une serre connectée mesure la température avec une thermistance CTN montée en pont diviseur avec R = 10 kΩ, sous E = 5 V (courant d'entrée du CAN négligeable).";
  return [{fig,data:ctnTab(),ctx,q:`La température vaut ${t} °C. Calcule la tension U aux bornes de la CTN.`,type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`Tableau : à ${t} °C, R_CTN = ${nf(Rc,2)} kΩ. Pont diviseur : ${F(`U = E·${FRAC("R_CTN","R + R_CTN")}`)} = 5 × ${FRAC(nf(Rc,2),`10 + ${nf(Rc,2)}`)} = ${U(Uv,"V")}.`},
    {fig,data:ctnTab(),ctx:ctx+` Le CAN 10 bits (0 à 5 V) donne N = ${FRAC("1 023 × U","5")}, arrondi à l'unité.`,q:"Quelle valeur N le microcontrôleur lit-il ?",type:"num",ans:N,tolA:1,unit:"",
      expl:`${F(`N = ${FRAC("1 023 × U","5")}`)} = ${FRAC(`1 023 × ${nf(Uv,4)}`,"5")} = ${nf(1023*Uv/5,1)}, soit ${F(`N = ${N}`)}. Quand la température monte, R_CTN diminue, U diminue et N aussi.`}]; },
/* photorésistance : tension selon l'éclairement, puis sens de variation */
()=>{ const LT=[[1,120],[10,20],[100,3.3],[1000,0.6]], top=Math.random()<0.5, [lx,Rl]=rnd(LT), Uv=top?5*10/(Rl+10):5*Rl/(10+Rl);
  const data=table(["Éclairement (lux)","R_LDR (kΩ)"],LT.map(r=>[nf(r[0],0),nf(r[1],1)]));
  const fig=fx_cir_pont({E:"E = 5 V",top:top?{k:"LDR",lab:["LDR"]}:{k:"R",lab:["R","10 kΩ"]},bot:top?{k:"R",lab:["R","10 kΩ"]}:{k:"LDR",lab:["LDR"]},U2:"U"});
  const ctx="Un lampadaire solaire mesure l'éclairement avec une photorésistance (LDR) montée en pont diviseur avec R = 10 kΩ, sous E = 5 V. La résistance de la LDR diminue quand l'éclairement augmente.";
  return [{fig,data,ctx,q:`L'éclairement vaut ${nf(lx,0)} lux. Calcule la tension U.`,type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`Tableau : R_LDR = ${nf(Rl,1)} kΩ. U est prise aux bornes de ${top?"R":"la LDR"} : ${F(top?`U = E·${FRAC("R","R_LDR + R")}`:`U = E·${FRAC("R_LDR","R + R_LDR")}`)} = 5 × ${top?FRAC("10",`${nf(Rl,1)} + 10`):FRAC(nf(Rl,1),`10 + ${nf(Rl,1)}`)} = ${U(Uv,"V")}.`},
    {fig,data,ctx,q:"Quand l'éclairement augmente, comment varie la tension U ?",type:"ch",ch:["Elle augmente","Elle diminue","Elle ne change pas"],ok:top?0:1,
      expl:`Quand l'éclairement augmente, R_LDR diminue. ${top?`La LDR est en haut du pont : ${FRAC("R","R_LDR + R")} augmente, donc U augmente.`:`La LDR est en bas du pont : ${FRAC("R_LDR","R + R_LDR")} diminue, donc U diminue.`} La place du capteur dans le pont fixe le sens de variation.`}]; },
/* LED : résistance calculée, valeur normalisée, courant réel */
()=>{ const o=draw(()=>({s:rnd(SUPS),l:rnd(LEDS),I:rnd([10,15,20])}),o=>{ const R=(o.s[0]-o.l[1])/(o.I/1000), up=e12up(R), dn=e12dn(R); return up/R>=1.02&&R/dn>=1.02; });
  const R=(o.s[0]-o.l[1])/(o.I/1000), up=e12up(R), dn=e12dn(R), Ir=(o.s[0]-o.l[1])/up*1000;
  const ctx=`Une LED ${o.l[0]} (seuil ${nf(o.l[1],1)} V, courant maximal ${o.I} mA) est alimentée par ${o.s[1]} à travers une résistance R.`;
  return [{ctx,q:"Calcule la résistance qui donnerait exactement le courant maximal.",type:"num",ans:R,tolR:0.02,unit:"Ω",
      expl:`${F(`R = ${FRAC("E − U_LED","I")}`)} = ${FRAC(`${nf(o.s[0],0)} − ${nf(o.l[1],1)}`,nf(o.I/1000,3))} = ${U(R,"Ω")}.`},
    {ctx,data:`Série E12 : ${E12TXT}`,q:`On dispose des valeurs normalisées de la série E12. Laquelle choisis-tu pour ne pas dépasser ${o.I} mA, en restant au plus près de ce courant ?`,type:"ch",...mc(fR(up),[fR(dn),fR(up*10),fR(up/10)]),
      expl:`Le calcul donne ${S3(R)} Ω, qui n'est pas une valeur normalisée. Une résistance plus petite laisserait passer plus de ${o.I} mA : il faut la valeur normalisée juste au-dessus, ${F(fR(up))}. Avec ${fR(dn)}, le courant dépasserait le maximum.`},
    {ctx:ctx+` On choisit R = ${fR(up)}.`,q:"Quel courant traverse alors la LED, en mA ?",type:"num",ans:Ir,tolR:0.02,unit:"mA",
      expl:`${F(`I = ${FRAC("E − U_LED","R")}`)} = ${FRAC(nf(o.s[0]-o.l[1],1),nf(up,0))} = ${nf(Ir/1000,5)} A, soit ${U(Ir,"mA")} : un peu moins que ${o.I} mA, la LED est protégée.`}]; },
/* puissance dans la résistance d'une LED et puissance admissible */
()=>{ const o=draw(()=>({Uv:rnd([5,9,12,24]),l:rnd(LEDS),I:rnd([10,20,30,50,70,100])}),o=>{ const P=(o.Uv-o.l[1])*o.I/1000; return o.Uv-o.l[1]>=2&&P>=0.05&&P<=1.2&&(P<=0.16||P>=0.3); });
  const P=(o.Uv-o.l[1])*o.I/1000, ok=P<=0.25, R=(o.Uv-o.l[1])/(o.I/1000), need=P<=0.5?"½ W":P<=1?"1 W":"2 W";
  const ctx=`Une LED ${o.l[0]} (seuil ${nf(o.l[1],1)} V) est alimentée sous ${o.Uv} V par une résistance R qui règle son courant à ${o.I} mA.`;
  return [{ctx,q:"Calcule la puissance dissipée par la résistance R.",type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`Tension aux bornes de R : U_R = ${o.Uv} − ${nf(o.l[1],1)} = ${nf(o.Uv-o.l[1],1)} V. ${F("P = U_R·I")} = ${nf(o.Uv-o.l[1],1)} × ${nf(o.I/1000,3)} = ${U(P,"W")} (c'est aussi R·I² avec R = ${S3(R)} Ω).`},
    {ctx:ctx+` Elle dissipe ${S3(P)} W.`,q:"Une résistance de puissance admissible 0,25 W (¼ W) convient-elle ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(P)} W ${ok?"≤":">"} 0,25 W : ${ok?"la résistance ¼ W convient.":`une résistance ¼ W chaufferait trop et risquerait de brûler : il faut une résistance d'au moins ${need}.`}`}]; },
/* shunt : courant mesuré, puis puissance dissipée */
()=>{ const o=draw(()=>({Rs:rnd([0.01,0.02,0.05,0.1]),Us:rnd([12,25,40,50,75,80,120,150,200,250])}),o=>{ const I=o.Us/1000/o.Rs; return I>=0.5&&I<=30; });
  const I=o.Us/1000/o.Rs, P=o.Rs*I*I, sys=rnd(["du moteur d'un robot","de la pompe d'un arrosage automatique","du moteur de propulsion d'un va'a électrique","de la batterie d'un vélo à assistance"]);
  const ctx=`Pour mesurer le courant ${sys}, on insère en série une résistance de mesure (shunt) R_s = ${nf(o.Rs,2)} Ω. On relève la tension à ses bornes : U_s = ${nf(o.Us,0)} mV.`;
  return [{ctx,q:"Quelle est l'intensité du courant mesuré ?",type:"num",ans:I,tolR:0.02,unit:"A",
      expl:`Loi d'Ohm pour le shunt : ${F(`I = ${FRAC("U_s","R_s")}`)} = ${FRAC(nf(o.Us/1000,3),nf(o.Rs,2))} = ${U(I,"A")} (U_s en volts).`},
    {ctx:ctx+` I = ${S3(I)} A.`,q:"Quelle puissance le shunt dissipe-t-il ?",type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`${F("P = R_s·I²")} = ${nf(o.Rs,2)} × ${S3(I)}² = ${U(P,"W")} (ou P = U_s·I). Une faible résistance de shunt limite ces pertes et la chute de tension dans le circuit mesuré.`}]; },
/* maille : courant, puis tension aux bornes d'une résistance */
()=>{ const o=draw(()=>({E:rnd([4.5,6,9,12]),R1:rnd(e12in(100,4700)),R2:rnd(e12in(100,4700))}),o=>o.R1!==o.R2&&o.R1/o.R2<=8&&o.R2/o.R1<=8);
  const I=o.E/(o.R1+o.R2), U2=o.R2*I;
  const fig=fx_cir_boucle({gen:{u:`E = ${nf(o.E,1)} V`},top:{k:"R",lab:["R1",fR(o.R1)],u:"U1"},right:{k:"R",lab:["R2",fR(o.R2)],u:"U2 = ?"},I:"I"});
  const ctx="Deux résistances R1 et R2 sont branchées en série sur un générateur de tension E.";
  return [{fig,ctx,q:"Écris la loi des mailles et la loi d'Ohm, puis calcule l'intensité I, en mA.",type:"num",ans:I*1000,tolR:0.02,unit:"mA",
      expl:`Loi des mailles : E = U1 + U2 = R1·I + R2·I, donc ${F(`I = ${FRAC("E","R1 + R2")}`)} = ${FRAC(nf(o.E,1),`${nf(o.R1,0)} + ${nf(o.R2,0)}`)} = ${nf(I,6)} A, soit ${U(I*1000,"mA")}.`},
    {fig,ctx:ctx+` I = ${S3(I*1000)} mA.`,q:"Calcule la tension U2 aux bornes de R2.",type:"num",ans:U2,tolR:0.02,unit:"V",
      expl:`${F("U2 = R2·I")} = ${nf(o.R2,0)} × ${nf(I,6)} = ${U(U2,"V")}. On retrouve la formule du pont diviseur : U2 = E·${FRAC("R2","R1 + R2")}.`}]; },
/* budget de courant d'une alimentation : loi des nœuds */
()=>{ const LIM=[[500,"le port USB 2.0 d'un ordinateur"],[900,"le port USB 3.0 d'un ordinateur"],[1000,"un régulateur de tension"]], tgt=Math.random()<0.5;
  const o=draw(()=>({lim:rnd(LIM),uc:rnd([30,45,60,80]),cap:rnd([["un capteur de distance",15],["un capteur de température et d'humidité",3],["une caméra",150]]),mod:rnd([["un module Bluetooth",40],["un module Wi-Fi",170],["un module LoRa",120]]),n:rnd([4,6,8,10,12]),il:rnd([10,15,20]),sv:rnd([0,1])}),
    o=>{ const T=o.uc+o.cap[1]+o.mod[1]+o.n*o.il+(o.sv?250:0); return far(T,o.lim[0],0.08)&&(T<=o.lim[0])===tgt; });
  const T=o.uc+o.cap[1]+o.mod[1]+o.n*o.il+(o.sv?250:0), ok=T<=o.lim[0];
  const ctx=`Un prototype de station connectée est alimenté par ${o.lim[1]} (5 V, ${nf(o.lim[0],0)} mA au maximum). Tous les éléments sont branchés en parallèle sur le 5 V : la carte à microcontrôleur (${o.uc} mA), ${o.cap[0]} (${o.cap[1]} mA), ${o.mod[0]} (${o.mod[1]} mA), ${o.n} LED de ${o.il} mA chacune${o.sv?" et un servomoteur (250 mA)":""}.`;
  return [{ctx,q:"Quelle intensité totale l'alimentation doit-elle fournir, en mA ?",type:"num",ans:T,tolA:0,unit:"mA",
      expl:`Loi des nœuds : le courant fourni est la somme des courants des branches. ${F("I = ΣI_k")} = ${o.uc} + ${o.cap[1]} + ${o.mod[1]} + ${o.n} × ${o.il}${o.sv?" + 250":""} = ${U(T,"mA")}.`},
    {ctx:ctx+` Courant total : ${T} mA.`,q:"L'alimentation convient-elle ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${T} mA ${ok?"≤":">"} ${nf(o.lim[0],0)} mA : ${ok?"l'alimentation convient.":"l'alimentation est surchargée : la tension s'effondre ou la protection coupe. Il faut une alimentation plus puissante ou moins de récepteurs."}`}]; },
/* calcul inverse : résistance à placer en parallèle */
()=>{ const o=draw(()=>({R1:rnd(e12in(220,10000)),R2:rnd(e12in(220,47000))}),o=>o.R1!==o.R2&&o.R2/o.R1<=6&&o.R1/o.R2<=6);
  const Rq=r3(o.R1*o.R2/(o.R1+o.R2)), R2=o.R1*Rq/(o.R1-Rq), kO=R2>=1000;
  return {ctx:`Une résistance R1 = ${fR(o.R1)} est déjà soudée sur une carte. On veut obtenir une résistance équivalente de ${fR(Rq)} entre ses bornes sans la dessouder.`,
    q:`Quelle résistance R2 faut-il souder en parallèle sur R1${kO?", en kΩ":""} ?`,type:"num",ans:kO?R2/1000:R2,tolR:0.02,unit:kO?"kΩ":"Ω",
    expl:`En parallèle : ${F(`${FRAC("1","R_éq")} = ${FRAC("1","R1")} + ${FRAC("1","R2")}`)}, donc ${F(`R2 = ${FRAC("R1·R_éq","R1 − R_éq")}`)} = ${FRAC(`${nf(o.R1,0)} × ${nf(Rq,1)}`,`${nf(o.R1,0)} − ${nf(Rq,1)}`)} = ${kO?`${nf(R2,0)} Ω, soit ${U(R2/1000,"kΩ")}`:U(R2,"Ω")}. On monte la valeur normalisée la plus proche, ${fR(o.R2)}. Une résistance en parallèle ne peut que diminuer la résistance équivalente.`}; },
/* branches en parallèle : courant manquant, puis résistance */
()=>{ const o=draw(()=>({E:rnd([5,12,24]),R:[rnd(e12in(100,4700)),rnd(e12in(100,4700)),rnd(e12in(100,4700))]}),o=>new Set(o.R).size===3&&o.R.every(r=>o.E/r*1000>=5&&o.E/r*1000<=200));
  const I=o.R.map(r=>r2(o.E/r*1000,1)), It=r2(I[0]+I[1]+I[2],1), I3=r2(It-I[0]-I[1],1), R3=o.E/(I3/1000);
  const fig=fx_cir_par({E:`${o.E} V`,br:[{k:["R"],lab:["R1"],I:"I1"},{k:["R"],lab:["R2"],I:"I2"},{k:["R"],lab:["R3"],I:"I3"}],I:"I"});
  const ctx=`Trois résistances sont branchées en parallèle sur une alimentation de ${o.E} V. On mesure I = ${nf(It,1)} mA, I1 = ${nf(I[0],1)} mA et I2 = ${nf(I[1],1)} mA.`;
  return [{fig,ctx,q:"Calcule l'intensité I3 du courant dans la branche de R3.",type:"num",ans:I3,tolR:0.02,unit:"mA",
      expl:`Loi des nœuds : ${F("I = I1 + I2 + I3")}, donc I3 = ${nf(It,1)} − ${nf(I[0],1)} − ${nf(I[1],1)} = ${U(I3,"mA")}.`},
    {fig,ctx:ctx+` I3 = ${nf(I3,1)} mA.`,q:"Déduis-en la valeur de R3.",type:"num",ans:R3,tolR:0.02,unit:"Ω",
      expl:`En parallèle, R3 est soumise à toute la tension de l'alimentation : ${F(`R3 = ${FRAC("U","I3")}`)} = ${FRAC(o.E,nf(I3/1000,5))} = ${U(R3,"Ω")}.`}]; },
/* caractéristique de la CTN : température lue, puis courant */
()=>{ const t=rnd([5,15,25,35,45,55]), Rd=r2(ctnR(t),1), I=5/(10+Rd);
  const fig=fx_cir_ctn({pt:{t,lab:"B",h:true}}), ctx="Caractéristique d'une thermistance CTN : résistance en fonction de la température.";
  return [{fig,ctx,q:`Le point B correspond à une résistance de ${nf(Rd,1)} kΩ. Lis la température correspondante, à 2 °C près.`,type:"num",ans:t,tolA:2,unit:"°C",
      expl:`On part de ${nf(Rd,1)} kΩ sur l'axe des résistances, on rejoint la courbe (point B), puis on descend sur l'axe des températures : ${F(`θ ≈ ${t} °C`)}.`},
    {fig,ctx:ctx+` À cette température, R_CTN = ${nf(Rd,1)} kΩ.`,q:"La CTN est montée en série avec R = 10 kΩ sous 5 V. Calcule l'intensité du courant qui la traverse, en mA.",type:"num",ans:I,tolR:0.02,unit:"mA",
      expl:`En série : ${F(`I = ${FRAC("E","R + R_CTN")}`)} = ${FRAC("5",`10 000 + ${nf(Rd*1000,0)}`)} = ${nf(I/1000,6)} A, soit ${U(I,"mA")}.`}]; },
/* résistance chauffante : puissance, puis énergie */
()=>{ const S=[["d'un tapis chauffant pour semis dans une serre",12,[4.7,6.8,10],[8,10,12]],["du cordon chauffant d'un aquarium",24,[22,33,47],[10,12,16]],["d'un gilet chauffant",7.4,[2.2,3.3,4.7],[2,3,4]],["de dégivrage du réfrigérateur d'un bateau",12,[3.3,4.7,6.8],[1,2,3]]];
  const [sys,Uv,Rs,hs]=rnd(S), R=rnd(Rs), h=rnd(hs), P=Uv*Uv/R, E=P*h;
  const ctx=`La résistance ${sys} vaut R = ${nf(R,1)} Ω ; elle est alimentée sous ${nf(Uv,1)} V.`;
  return [{ctx,q:"Quelle puissance électrique reçoit cette résistance ?",type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`${F(`P = ${FRAC("U²","R")}`)} = ${FRAC(`${nf(Uv,1)}²`,nf(R,1))} = ${U(P,"W")}, entièrement convertie en chaleur.`},
    {ctx:ctx+` P = ${S3(P)} W.`,q:`Elle fonctionne ${h} h par jour. Quelle énergie consomme-t-elle par jour, en Wh ?`,type:"num",ans:E,tolR:0.02,unit:"Wh",
      expl:`Énergie : ${F("E = P·Δt")} = ${S3(P)} W × ${h} h = ${U(E,"Wh")}${E>=1000?`, soit ${nf(E/1000,2)} kWh`:""}.`}]; },
/* potentiomètre capteur d'angle : tension, puis angle */
()=>{ const Ev=rnd([3.3,5]), tm=rnd([270,300]), th=rnd([30,45,60,90,120,135,150,180,200,240]), Uv=Ev*th/tm, Um=r2(Ev*rnd([0.2,0.35,0.5,0.65,0.8]),2), th2=Um/Ev*tm;
  const fig=fx_cir_pot({k:th/tm,E:`E = ${nf(Ev,1)} V`,U:"U",RP:"R_P = 10 kΩ"});
  const ctx=`La position angulaire d'un bras de robot est mesurée par un potentiomètre de ${tm}° de course, alimenté sous E = ${nf(Ev,1)} V. Le courant prélevé par le curseur est négligeable : U est proportionnelle à l'angle θ, avec U = 0 pour θ = 0° et U = E pour θ = ${tm}°.`;
  return [{fig,ctx,q:`Le bras est tourné de θ = ${th}°. Calcule la tension U.`,type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`Le curseur partage la piste comme un pont diviseur : ${F(`U = E·${FRAC("θ","θ_max")}`)} = ${nf(Ev,1)} × ${FRAC(th,tm)} = ${U(Uv,"V")}.`},
    {fig,ctx,q:`Plus tard, on mesure U = ${nf(Um,2)} V. Quel est l'angle du bras ?`,type:"num",ans:th2,tolR:0.02,unit:"°",
      expl:`${F(`θ = θ_max·${FRAC("U","E")}`)} = ${tm} × ${FRAC(nf(Um,2),nf(Ev,1))} = ${F(`${S3(th2)}°`)}.`}]; }
];

const CI3=[
/* pont diviseur de mesure d'une batterie : choix de R1 dans la série E12 */
()=>{ const BAT=[["une batterie au plomb de 12 V",14.4],["une batterie LiFePO4 de 24 V",29.2],["une batterie Li-ion de 36 V",42],["une batterie Li-ion de 48 V",54.6],["un pack LiPo 6S",25.2]];
  const o=draw(()=>({b:rnd(BAT),Vr:rnd([5,3.3]),R2:rnd([1000,2200,4700,10000])}),o=>{ const m=o.R2*(o.b[1]/o.Vr-1); return e12up(m)/m>=1.03; });
  const Rmin=o.R2*(o.b[1]/o.Vr-1), R1=e12up(Rmin), dn=e12dn(Rmin), nx=E12V[E12V.indexOf(R1)+1], Uc=o.b[1]*o.R2/(R1+o.R2);
  const fig=fx_cir_pont({E:"U_bat",top:{k:"R",lab:["R1 = ?"]},bot:{k:"R",lab:["R2",fR(o.R2)]},U2:"U_CAN"});
  const ctx=`Un microcontrôleur surveille ${o.b[0]} (jusqu'à ${nf(o.b[1],1)} V en fin de charge) à travers un pont diviseur. Son CAN accepte au plus V_ref = ${nf(o.Vr,1)} V. R2 = ${fR(o.R2)} ; courant d'entrée du CAN négligeable.`;
  return [{fig,ctx,q:"Quelle valeur minimale R1_min faut-il pour que U_CAN ne dépasse jamais V_ref, en kΩ ?",type:"num",ans:Rmin/1000,tolR:0.02,unit:"kΩ",
      expl:`Il faut ${F(`U_bat,max·${FRAC("R2","R1 + R2")} ≤ V_ref`)}, soit R1 ≥ R2·(${FRAC("U_bat,max","V_ref")} − 1) = ${nf(o.R2,0)} × (${FRAC(nf(o.b[1],1),nf(o.Vr,1))} − 1) = ${nf(Rmin,0)} Ω, soit ${U(Rmin/1000,"kΩ")}.`},
    {fig,ctx:ctx+` R1_min = ${S3(Rmin/1000)} kΩ.`,data:`Série E12 : ${E12TXT}`,q:"Quelle est la plus petite valeur normalisée E12 qui convient pour R1 ?",type:"ch",...mc(fR(R1),[fR(dn),fR(nx),fR(R1/10)]),
      expl:`Il faut R1 ≥ ${S3(Rmin/1000)} kΩ : la valeur normalisée juste au-dessus est ${F(fR(R1))}. ${fR(dn)} est trop faible (U_CAN dépasserait V_ref) ; ${fR(nx)} conviendrait aussi, mais réduirait inutilement la plage utilisée par le CAN.`},
    {fig,ctx:ctx+` On choisit R1 = ${fR(R1)}.`,q:"Calcule la tension U_CAN quand la batterie est à sa tension maximale.",type:"num",ans:Uc,tolR:0.02,unit:"V",
      expl:`${F(`U_CAN = U_bat·${FRAC("R2","R1 + R2")}`)} = ${nf(o.b[1],1)} × ${FRAC(nf(o.R2,0),`${nf(R1,0)} + ${nf(o.R2,0)}`)} = ${U(Uc,"V")} < ${nf(o.Vr,1)} V : l'entrée du CAN est protégée, et ${nf(Uc/o.Vr*100,0)} % de sa plage est utilisée.`}]; },
/* pont diviseur chargé par l'entrée d'un module de mesure */
()=>{ const o=draw(()=>({E:rnd([5,12,24]),R1:rnd([10000,22000,47000,100000,220000,470000]),R2:rnd([10000,22000,47000,100000,220000,470000]),Re:rnd([100000,1000000,10000000])}),o=>{ if(o.R1/o.R2>5||o.R2/o.R1>5) return false;
      const Uv=o.E*o.R2/(o.R1+o.R2), Rp=o.R2*o.Re/(o.R2+o.Re), Uc=o.E*Rp/(o.R1+Rp), er=(Uv-Uc)/Uv*100; return er>=0.1&&far(er,2,0.12); });
  const Uv=o.E*o.R2/(o.R1+o.R2), Rp=o.R2*o.Re/(o.R2+o.Re), Uc=o.E*Rp/(o.R1+Rp), er=(Uv-Uc)/Uv*100, ok=er<2, k=x=>nf(x/1000,0);
  const fig=fx_cir_pont({E:`E = ${o.E} V`,top:{k:"R",lab:["R1",fR(o.R1)]},bot:{k:"R",lab:["R2",fR(o.R2)]},out:"R",load:["R_e",fR(o.Re)],U2:"U2"});
  const ctx=`Le pont diviseur alimente l'entrée d'un module de mesure, modélisée par une résistance R_e = ${fR(o.Re)} branchée en parallèle sur R2.`;
  return [{fig,ctx,q:"Calcule U2 en négligeant le courant d'entrée du module (pont à vide).",type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`À vide : ${F(`U2 = E·${FRAC("R2","R1 + R2")}`)} = ${o.E} × ${FRAC(k(o.R2),`${k(o.R1)} + ${k(o.R2)}`)} = ${U(Uv,"V")} (résistances en kΩ).`},
    {fig,ctx,q:"Calcule U2 en tenant compte de R_e.",type:"num",ans:Uc,tolR:0.02,unit:"V",
      expl:`R2 et R_e en parallèle : ${F(`R_p = ${FRAC("R2·R_e","R2 + R_e")}`)} = ${S3(Rp/1000)} kΩ. ${F(`U2 = E·${FRAC("R_p","R1 + R_p")}`)} = ${o.E} × ${FRAC(S3(Rp/1000),`${k(o.R1)} + ${S3(Rp/1000)}`)} = ${U(Uc,"V")}.`},
    {fig,ctx:ctx+` U2 vaut ${S3(Uv)} V à vide et ${S3(Uc)} V avec R_e.`,q:"On garde l'hypothèse « courant d'entrée négligeable » si l'erreur relative sur U2 reste inférieure à 2 %. Est-ce le cas ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Erreur relative, en prenant U2 à vide comme référence : ${F(`${FRAC("|U2,vide − U2,charge|","U2,vide")} × 100`)} = ${nf(er,2)} % ${ok?"< 2 % : l'hypothèse est acceptable, car R_e est très grande devant R2.":"> 2 % : l'hypothèse n'est pas acceptable, R_e n'est pas assez grande devant R2. Il faut des résistances R1 et R2 plus faibles, ou une entrée de plus grande résistance."}`}]; },
/* CTN : de la valeur N du CAN à la température */
()=>{ const t=rnd([0,10,20,30,40,50]), Rc=CTNT.find(r=>r[0]===t)[1], N=Math.round(1023*Rc/(10+Rc)), Uv=r2(5*N/1023,3), Rm=10*Uv/(5-Uv);
  const fig=fx_cir_pont({E:"E = 5 V",top:{k:"R",lab:["R","10 kΩ"]},bot:{k:"CTN",lab:["CTN"]},U2:"U"});
  const ctx=`Station météo sur un atoll : la température est mesurée par une CTN en pont diviseur avec R = 10 kΩ sous E = 5 V, puis par un CAN 10 bits (0 à 5 V) : U = ${FRAC("5 × N","1 023")}. Le microcontrôleur lit N = ${N}.`;
  const nb=[t-10,t+10,t+20,t-20].filter(x=>x>=0&&x<=50).slice(0,3);
  return [{fig,data:ctnTab(),ctx,q:"Calcule la tension U.",type:"num",ans:5*N/1023,tolR:0.02,unit:"V",
      expl:`${F(`U = ${FRAC("5 × N","1 023")}`)} = ${FRAC(`5 × ${N}`,"1 023")} = ${U(5*N/1023,"V")}.`},
    {fig,data:ctnTab(),ctx:ctx+` U = ${nf(Uv,3)} V.`,q:"Déduis-en la résistance de la CTN, en kΩ.",type:"num",ans:Rm,tolR:0.02,unit:"kΩ",
      expl:`Pont diviseur : U = E·${FRAC("R_CTN","R + R_CTN")}, donc U·(R + R_CTN) = E·R_CTN et ${F(`R_CTN = ${FRAC("R·U","E − U")}`)} = ${FRAC(`10 × ${nf(Uv,3)}`,`5 − ${nf(Uv,3)}`)} = ${U(Rm,"kΩ")}.`},
    {fig,data:ctnTab(),ctx:ctx+` R_CTN ≈ ${S3(Rm)} kΩ.`,q:"Quelle est la température mesurée ?",type:"ch",...mc(`${t} °C`,nb.map(x=>`${x} °C`)),
      expl:`Dans le tableau, R_CTN = ${nf(Rc,2)} kΩ correspond à ${F(`${t} °C`)} ; les températures voisines donnent des résistances nettement différentes.`}]; },
/* photorésistance : seuil d'allumage d'un éclairage */
()=>{ const top=Math.random()<0.5, [lx,Rl]=rnd([[20,12],[30,8.2],[50,5.6]]), Uv=top?5*10/(Rl+10):5*Rl/(10+Rl), N=Math.round(1023*Uv/5), inf=top;
  const fig=fx_cir_pont({E:"E = 5 V",top:top?{k:"LDR",lab:["LDR"]}:{k:"R",lab:["R","10 kΩ"]},bot:top?{k:"R",lab:["R","10 kΩ"]}:{k:"LDR",lab:["LDR"]},U2:"U"});
  const ctx=`Un lampadaire solaire doit s'allumer quand l'éclairement devient inférieur à ${lx} lux ; sa photorésistance (LDR) vaut alors ${nf(Rl,1)} kΩ. Elle est montée en pont diviseur avec R = 10 kΩ sous 5 V ; le CAN 10 bits donne N = ${FRAC("1 023 × U","5")}, arrondi à l'unité. La résistance de la LDR augmente quand l'éclairement diminue.`;
  const src="N = can.read()          # image de la tension U\nif N ___ SEUIL:\n    lampe.allumer()\nelse:\n    lampe.eteindre()";
  const A="« N < SEUIL » : allumer quand N passe sous le seuil", B="« N > SEUIL » : allumer quand N dépasse le seuil";
  return [{fig,ctx,q:"Calcule la tension U au seuil d'allumage.",type:"num",ans:Uv,tolR:0.02,unit:"V",
      expl:`U est prise aux bornes de ${top?"R":"la LDR"} : ${F(top?`U = E·${FRAC("R","R_LDR + R")}`:`U = E·${FRAC("R_LDR","R + R_LDR")}`)} = 5 × ${top?FRAC("10",`${nf(Rl,1)} + 10`):FRAC(nf(Rl,1),`10 + ${nf(Rl,1)}`)} = ${U(Uv,"V")}.`},
    {fig,ctx,q:"Quelle valeur de SEUIL faut-il écrire dans le programme ?",type:"num",ans:N,tolA:1,unit:"",
      expl:`${F(`N = ${FRAC("1 023 × U","5")}`)} = ${FRAC(`1 023 × ${nf(Uv,4)}`,"5")} = ${nf(1023*Uv/5,1)}, soit ${F(`SEUIL = ${N}`)}.`},
    {fig,ctx,data:code(src),q:"Quel test faut-il écrire à la place de ___ ?",type:"ch",...mc(inf?A:B,[inf?B:A,"« N == SEUIL » : allumer seulement quand N est égal au seuil"]),
      expl:`Quand il fait plus sombre, R_LDR augmente. La LDR est ${top?"en haut":"en bas"} du pont, donc U ${top?"diminue":"augmente"} dans le noir. Il faut allumer quand N est ${inf?"inférieur":"supérieur"} au seuil : ${F(`if N ${inf?"&lt;":"&gt;"} SEUIL:`)}. Le test d'égalité ne serait presque jamais vrai.`}]; },
/* feu de navigation à LED en série : résistance, puissance admissible, rendement */
()=>{ const FEUX=[["rouges","bâbord",2],["vertes","tribord",2.2],["blanches","de poupe",3.2]];
  const o=draw(()=>({Uv:rnd([12,24]),f:rnd(FEUX),n:rnd([2,3,4,5,6]),I:rnd([20,30,50,70,100])}),o=>{ const ur=o.Uv-o.n*o.f[2]; if(ur<1.5||ur>0.6*o.Uv) return false; const P=ur*o.I/1000, nd=[0.25,0.5,1,2].find(r=>r>=P); return P<=1.8&&P<=0.8*nd&&[0.25,0.5,1].every(r=>far(P,r,0.1)); });
  const ur=o.Uv-o.n*o.f[2], R=ur/(o.I/1000), P=ur*o.I/1000, eta=o.n*o.f[2]/o.Uv*100;
  const RAT=[0.25,0.5,1,2], LBL={0.25:"¼ W",0.5:"½ W",1:"1 W",2:"2 W"}, need=RAT.find(r=>r>=P);
  const ctx=`Le feu ${o.f[1]} d'un voilier comporte ${o.n} LED ${o.f[0]} identiques (seuil ${nf(o.f[2],1)} V chacune) montées en série avec une résistance R, sous la tension ${o.Uv} V de la batterie de bord. Courant voulu : ${o.I} mA.`;
  return [{ctx,q:"Calcule la valeur de R.",type:"num",ans:R,tolR:0.02,unit:"Ω",
      expl:`Loi des mailles : U_R = U − n·U_LED = ${o.Uv} − ${o.n} × ${nf(o.f[2],1)} = ${nf(ur,1)} V. ${F(`R = ${FRAC("U − n·U_LED","I")}`)} = ${FRAC(nf(ur,1),nf(o.I/1000,3))} = ${U(R,"Ω")}.`},
    {ctx:ctx+` R = ${S3(R)} Ω.`,q:"Parmi les puissances admissibles normalisées, quelle est la plus petite qui convienne pour R ?",type:"ch",...mc(LBL[need],RAT.filter(r=>r!==need).map(r=>LBL[r])),
      expl:`La résistance dissipe ${F("P = U_R·I")} = ${nf(ur,1)} × ${nf(o.I/1000,3)} = ${S3(P)} W. Il faut la plus petite puissance normalisée supérieure : ${F(LBL[need])}.${need>0.25?" Une résistance ¼ W brûlerait.":""}`},
    {ctx,q:"Quel pourcentage de la puissance fournie par la batterie les LED reçoivent-elles ?",type:"num",ans:eta,tolR:0.02,unit:"%",
      expl:`Les LED reçoivent n·U_LED·I et la batterie fournit U·I : ${F(`η = ${FRAC("n·U_LED","U")}`)} = ${FRAC(`${o.n} × ${nf(o.f[2],1)}`,o.Uv)} = ${nf(eta/100,3)}, soit ${U(eta,"%")}. Le reste est perdu en chaleur dans R.`}]; },
/* deux montages de LED : pertes dans les résistances */
()=>{ const N=rnd([6,9,12]), ul=rnd([3,3.1,3.2]), I=rnd([15,20,25]), PA=N*(12-ul)*I/1000, PB=N/3*(12-3*ul)*I/1000;
  const ctx=`On doit alimenter ${N} LED blanches (seuil ${nf(ul,1)} V, ${I} mA chacune) sous 12 V. Montage A : ${N} branches en parallèle, chacune formée d'une LED et de sa résistance. Montage B : ${N/3} branches en parallèle, chacune formée de 3 LED en série et d'une résistance.`;
  return [{ctx,q:"Calcule la puissance totale dissipée par les résistances du montage A.",type:"num",ans:PA,tolR:0.02,unit:"W",
      expl:`Chaque résistance a 12 − ${nf(ul,1)} = ${nf(12-ul,1)} V à ses bornes et est traversée par ${I} mA : ${F("P = U_R·I")} = ${nf(12-ul,1)} × ${nf(I/1000,3)} = ${nf((12-ul)*I/1000,4)} W. Pour ${N} branches : ${U(PA,"W")}.`},
    {ctx,q:"Même calcul pour le montage B.",type:"num",ans:PB,tolR:0.02,unit:"W",
      expl:`Chaque résistance a 12 − 3 × ${nf(ul,1)} = ${nf(12-3*ul,1)} V à ses bornes : P = ${nf(12-3*ul,1)} × ${nf(I/1000,3)} = ${nf((12-3*ul)*I/1000,4)} W. Pour ${N/3} branches : ${U(PB,"W")}.`},
    {ctx:ctx+` Pertes : ${S3(PA)} W (A) et ${S3(PB)} W (B).`,q:"Quel montage choisir pour un éclairage alimenté par batterie ?",type:"ch",...mc(`Le montage B : pertes environ ${nf(PA/PB,0)} fois plus faibles et courant total 3 fois plus faible`,["Le montage A : chaque LED ayant sa résistance, les pertes y sont plus faibles","Les deux se valent : ils alimentent le même nombre de LED","Le montage A : la tension aux bornes de chaque résistance y est plus grande"]),
      expl:`Dans B, la tension perdue dans chaque résistance est bien plus faible (${nf(12-3*ul,1)} V au lieu de ${nf(12-ul,1)} V) et il y a 3 fois moins de branches : les pertes passent de ${S3(PA)} W à ${S3(PB)} W. Le courant total tombe de ${N*I} mA à ${N/3*I} mA : l'autonomie de la batterie est bien meilleure.`}]; },
/* bilan des courants à bord : la batterie se charge-t-elle ? */
()=>{ const LD=[["réfrigérateur",3.8],["pompe de cale",2.5],["feux de navigation",1.2],["radio VHF",0.6],["pilote automatique",2.2],["éclairage intérieur",0.9]];
  const tgt=Math.random()<0.5, o=draw(()=>({ld:shuffle(LD).slice(0,rnd([2,3,4])),Ip:rnd([2.5,4,5.5,6.8,8.5,9.6,11.2,12.5])}),o=>{ const d=o.Ip-o.ld.reduce((a,l)=>a+l[1],0); return Math.abs(d)>=0.5&&(d>0)===tgt; });
  const S=r2(o.ld.reduce((a,l)=>a+l[1],0),1), Ib=r2(o.Ip-S,1), ch=Ib>0;
  const data=table(["Récepteur en marche","Courant absorbé"],o.ld.map(l=>[cap1(l[0]),`${nf(l[1],1)} A`]));
  const ctx=`Sur un catamaran, le panneau solaire débite ${nf(o.Ip,1)} A vers le tableau électrique (nœud N), auquel sont aussi reliés la batterie 12 V et les récepteurs en marche.`;
  return [{data,ctx,q:"Calcule l'intensité totale absorbée par les récepteurs.",type:"num",ans:S,tolR:0.02,unit:"A",
      expl:`Les récepteurs sont en parallèle : leurs courants s'ajoutent (loi des nœuds). ${F("I_R = ΣI_k")} = ${o.ld.map(l=>nf(l[1],1)).join(" + ")} = ${U(S,"A")}.`},
    {data,ctx:ctx+` Les récepteurs absorbent ${nf(S,1)} A.`,q:"Que fait la batterie ?",type:"ch",ch:["Elle se charge : elle reçoit du courant","Elle se décharge : elle fournit du courant","Elle n'est traversée par aucun courant"],ok:ch?0:1,
      expl:`Loi des nœuds en N, en comptant I_bat vers la batterie : ${F("I_panneau = I_R + I_bat")}, donc I_bat = ${nf(o.Ip,1)} − ${nf(S,1)} = ${sgn(Ib,1)} A. ${ch?"Positif : le courant entre dans la batterie, elle se charge.":"Négatif : le courant sort de la batterie, elle se décharge et complète le panneau."}`},
    {data,ctx:ctx+` Les récepteurs absorbent ${nf(S,1)} A.`,q:"Quelle est l'intensité du courant dans la batterie ?",type:"num",ans:Math.abs(Ib),tolR:0.02,unit:"A",
      expl:`|I_bat| = |${nf(o.Ip,1)} − ${nf(S,1)}| = ${U(Math.abs(Ib),"A")} (${ch?"charge":"décharge"}) : la batterie ${ch?"reçoit":"fournit"} environ 12 × ${nf(Math.abs(Ib),1)} = ${nf(12*Math.abs(Ib),1)} W.`}]; },
/* chute de tension dans un câble */
()=>{ const SEC=[[1.5,12.1],[2.5,7.41],[4,4.61],[6,3.08],[10,1.83]], REC=[["une pompe de relevage","pompe",1],["un guindeau électrique","guindeau",0],["un propulseur d'étrave","propulseur",0],["une pompe d'irrigation","pompe",1]];
  const o=draw(()=>({Uv:rnd([12,24]),I:rnd([5,8,10,12,15,20]),L:rnd([5,8,10,12,15,20,25]),s:rnd(SEC),r:rnd(REC)}),o=>{ const d=o.s[1]*2*o.L/1000*o.I/o.Uv*100; return far(d,3,0.1)&&d>=0.5&&d<=12; });
  const Rc=o.s[1]*2*o.L/1000, dU=Rc*o.I, pc=dU/o.Uv*100, ok=pc<=3;
  const fig=fx_cir_cable({L:`L = ${o.L} m`,E:`${o.Uv} V`,rec:o.r[1],I:"I"});
  const ctx=`${cap1(o.r[0])} (${o.Uv} V, ${o.I} A) est relié${o.r[2]?"e":""} à la batterie par un câble à deux conducteurs en cuivre de ${nf(o.s[0],1)} mm², de longueur L = ${o.L} m. Chaque conducteur a une résistance de ${nf(o.s[1],2)} Ω par kilomètre.`;
  return [{fig,ctx,q:"Calcule la résistance totale du câble (aller et retour).",type:"num",ans:Rc,tolR:0.02,unit:"Ω",
      expl:`Le courant parcourt l'aller et le retour : 2 × ${o.L} = ${2*o.L} m de conducteur, soit ${nf(2*o.L/1000,3)} km. ${F("R = r·2L")} = ${nf(o.s[1],2)} × ${nf(2*o.L/1000,3)} = ${U(Rc,"Ω")}.`},
    {fig,ctx:ctx+` R_câble = ${S3(Rc)} Ω.`,q:"Quelle chute de tension le câble provoque-t-il ?",type:"num",ans:dU,tolR:0.02,unit:"V",
      expl:`Loi d'Ohm : ${F("ΔU = R_câble·I")} = ${S3(Rc)} × ${o.I} = ${U(dU,"V")}. Le récepteur ne reçoit que ${nf(o.Uv-dU,2)} V.`},
    {fig,ctx:ctx+` ΔU = ${S3(dU)} V.`,q:"Le cahier des charges limite la chute de tension à 3 % de la tension de la batterie. Le câble convient-il ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${FRAC(S3(dU),o.Uv)} × 100 = ${nf(pc,1)} % ${ok?"≤":">"} 3 % : ${ok?"le câble convient.":"le câble ne convient pas : il faut une section plus grande, ou un câble plus court."}`}]; },
/* repérer l'erreur dans une résolution */
()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
  if(v===0){ const a=rnd([220,330,470,1000]), b=rnd([680,1500,2200]), E=rnd([5,12]), Rq=a*b/(a+b);
    ctx=`Courant fourni par un générateur de ${E} V à deux résistances en parallèle, R1 = ${nf(a,0)} Ω et R2 = ${nf(b,0)} Ω.`;
    st=[`R_éq = R1 + R2 = ${nf(a+b,0)} Ω`,`I = ${FRAC("E","R_éq")} = ${FRAC(E,nf(a+b,0))} = ${nf(E/(a+b)*1000,2)} mA`,`Le générateur fournit ${nf(E/(a+b)*1000,2)} mA.`]; bad=0;
    why=`En parallèle, R_éq = ${FRAC("R1·R2","R1 + R2")} = ${nf(Rq,1)} Ω, plus petite que chaque résistance, d'où I = ${nf(E/Rq*1000,1)} mA.`; }
  else if(v===1){ const E=rnd([5,9,12]), ul=rnd([1.8,2,2.2]), I=rnd([10,15,20]);
    ctx=`Résistance de protection d'une LED (seuil ${nf(ul,1)} V, ${I} mA) alimentée sous ${E} V.`;
    st=[`La résistance doit limiter le courant à ${I} mA = ${nf(I/1000,3)} A.`,`R = ${FRAC("E","I")} = ${FRAC(E,nf(I/1000,3))} = ${nf(E/(I/1000),0)} Ω`,"On choisit la valeur normalisée juste au-dessus."]; bad=1;
    why=`La résistance ne reçoit que la tension E − U_LED : R = ${FRAC(`${E} − ${nf(ul,1)}`,nf(I/1000,3))} = ${nf((E-ul)/(I/1000),0)} Ω.`; }
  else if(v===2){ const R=rnd([2.2,4.7,10]), Uv=rnd([5,9,12]);
    ctx=`Courant dans une résistance de ${nf(R,1)} kΩ soumise à ${Uv} V.`;
    st=[`Loi d'Ohm : I = ${FRAC("U","R")}`,`I = ${FRAC(Uv,nf(R,1))} = ${nf(Uv/R,2)} A`,`La résistance est traversée par ${nf(Uv/R,2)} A.`]; bad=1;
    why=`R doit être en ohms : I = ${FRAC(Uv,nf(R*1000,0))} = ${nf(Uv/R,2)} mA, soit 1 000 fois moins.`; }
  else if(v===3){ const [a,b]=rnd([[10,4.7],[22,10],[47,22],[10,22],[4.7,10]]), E=rnd([5,12]);
    ctx=`Tension U2 aux bornes de R2 dans un pont diviseur à vide : E = ${E} V, R1 = ${nf(a,1)} kΩ, R2 = ${nf(b,1)} kΩ.`;
    st=["Le pont est à vide : R1 et R2 sont traversées par le même courant.",`U2 = E·${FRAC("R1","R1 + R2")} = ${E} × ${FRAC(nf(a,1),`${nf(a,1)} + ${nf(b,1)}`)} = ${nf(E*a/(a+b),2)} V`,`Le CAN reçoit ${nf(E*a/(a+b),2)} V.`]; bad=1;
    why=`La tension de sortie est proportionnelle à la résistance aux bornes de laquelle on la prend : U2 = E·${FRAC("R2","R1 + R2")} = ${nf(E*b/(a+b),2)} V.`; }
  else if(v===4){ const R=rnd([10,22,47]), I=rnd([0.5,1.5,2]);
    ctx=`Puissance dissipée par une résistance de ${R} Ω parcourue par ${nf(I,1)} A.`;
    st=["P = R·I",`P = ${R} × ${nf(I,1)} = ${nf(R*I,1)} W`,`La résistance doit supporter au moins ${nf(R*I,1)} W.`]; bad=0;
    why=`R·I est une tension (en V), pas une puissance : ${F("P = R·I²")} = ${R} × ${nf(I,1)}² = ${nf(R*I*I,2)} W.`; }
  else { const R=rnd([100,220,470]), I=rnd([10,20,30]);
    ctx=`Puissance dissipée par une résistance de ${R} Ω traversée par ${I} mA.`;
    st=["P = R·I²",`P = ${R} × ${I}² = ${nf(R*I*I,0)} W`,"Il faut donc une résistance de très forte puissance."]; bad=1;
    why=`I doit être en ampères : P = ${R} × ${nf(I/1000,3)}² = ${nf(R*(I/1000)**2,3)} W. Un résultat de ${nf(R*I*I,0)} W pour une petite résistance est absurde.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* pont diviseur branché en permanence : consommation */
()=>{ const o=draw(()=>({R1:rnd(e12in(10000,100000)),R2:rnd(e12in(2200,22000)),Ub:rnd([12,24]),Q:rnd([7,12,18])}),o=>o.R1>=2*o.R2);
  const I=o.Ub/(o.R1+o.R2), Iu=I*1e6, Qm=I*720*1000, pc=Qm/(o.Q*1000)*100;
  const ctx=`Une station météo autonome installée sur un atoll surveille sa batterie (${o.Ub} V, ${o.Q} Ah) avec un pont diviseur R1 = ${fR(o.R1)}, R2 = ${fR(o.R2)}, branché en permanence entre ses bornes.`;
  return [{ctx,q:"Quelle intensité le pont diviseur prélève-t-il en permanence sur la batterie, en µA ?",type:"num",ans:Iu,tolR:0.02,unit:"µA",
      expl:`R1 et R2 sont en série : ${F(`I = ${FRAC("U_bat","R1 + R2")}`)} = ${FRAC(o.Ub,`${nf(o.R1,0)} + ${nf(o.R2,0)}`)} = ${nf(I*1000,4)} mA, soit ${U(Iu,"µA")}.`},
    {ctx:ctx+` I = ${S3(Iu)} µA.`,q:"Quelle charge électrique le pont consomme-t-il en 30 jours, en mAh ?",type:"num",ans:Qm,tolR:0.02,unit:"mAh",
      expl:`30 jours = 720 h. ${F("Q = I·Δt")} = ${nf(I*1000,4)} mA × 720 h = ${U(Qm,"mAh")}, soit ${nf(pc,2)} % de la capacité de la batterie (${o.Q} Ah) chaque mois, en pure perte.`},
    {ctx,q:"Comment réduire cette consommation sans changer la tension envoyée au CAN ?",type:"ch",...mc("Multiplier R1 et R2 par 10 : même rapport de division, courant divisé par 10",["Diviser R1 et R2 par 10 pour que la mesure soit plus stable","Augmenter seulement R2","Ajouter une résistance en parallèle sur R1"]),
      expl:`Le rapport ${FRAC("R2","R1 + R2")} ne change pas si R1 et R2 sont multipliées par le même nombre : la tension mesurée est la même, mais le courant est divisé par 10. Sans exagérer : avec des résistances trop grandes, le courant d'entrée du CAN ne serait plus négligeable. Augmenter seulement R2 changerait la tension envoyée au CAN, et une résistance en parallèle augmenterait le courant.`}]; },
/* mesure d'une résistance et tolérance du fabricant */
()=>{ const tol=rnd([5,10]), o=draw(()=>{ const Rn=rnd(e12in(100,47000)), e=(Math.random()<0.5?1:-1)*tol*rnd([0.3,0.5,0.7,1.4,1.7,2.2]), I=rnd([0.5,1,2,5])/1000; return {Rn,I,Uv:r2(Rn*(1+e/100)*I,2)}; },
    o=>o.Uv>=0.5&&o.Uv<=24&&far(Math.abs(o.Uv/o.I-o.Rn)/o.Rn*100,tol,0.15));
  const Rm=o.Uv/o.I, er=Math.abs(Rm-o.Rn)/o.Rn*100, ok=er<=tol;
  const ctx=`On vérifie une résistance marquée ${fR(o.Rn)} (tolérance du fabricant : ± ${tol} %). Un montage voltampèremétrique donne U = ${nf(o.Uv,2)} V et I = ${nf(o.I*1000,1)} mA.`;
  return [{ctx,q:"Quelle est la valeur mesurée de la résistance ?",type:"num",ans:Rm,tolR:0.02,unit:"Ω",
      expl:`${F(`R = ${FRAC("U","I")}`)} = ${FRAC(nf(o.Uv,2),nf(o.I,4))} = ${U(Rm,"Ω")}.`},
    {ctx:ctx+` R_mes = ${nf(Rm,1)} Ω.`,q:"Calcule l'écart relatif entre la valeur mesurée et la valeur marquée (référence : valeur marquée), en %.",type:"num",ans:er,tolR:0.03,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|R_mes − R_marquée|","R_marquée")} × 100`)} = ${FRAC(`|${nf(Rm,1)} − ${nf(o.Rn,0)}|`,nf(o.Rn,0))} × 100 = ${U(er,"%")}.`},
    {ctx:ctx+` Écart relatif : ${nf(er,1)} %.`,q:"Que conclure ?",type:"ch",ch:["La résistance respecte la tolérance annoncée","La résistance est hors tolérance"],ok:ok?0:1,
      expl:`${nf(er,1)} % ${ok?"≤":">"} ${tol} % : ${ok?"la valeur mesurée est compatible avec la tolérance du fabricant.":"la valeur mesurée sort de la tolérance : composant défectueux, ou mesure à vérifier (appareils, contacts)."}`}]; },
/* potentiomètre capteur d'angle : sensibilité, résolution, exigence */
()=>{ const tgt=Math.random()<0.5, o=draw(()=>({tm:rnd([270,300,340]),Ev:rnd([3.3,5]),n:rnd([8,10,12]),req:rnd([0.1,0.2,0.5,1,2])}),o=>far(o.tm/2**o.n,o.req,0.1)&&(o.tm/2**o.n<=o.req)===tgt);
  const s=o.Ev/o.tm*1000, q=o.Ev/2**o.n*1000, res=q/s, ok=res<=o.req, nmin=Math.ceil(Math.log2(o.tm/o.req)-1e-9);
  const ctx=`Un potentiomètre de ${o.tm}° de course, alimenté sous E = ${nf(o.Ev,1)} V, mesure l'angle d'un bras robotisé : U est proportionnelle à θ, de 0 à E. U est numérisée par un CAN ${o.n} bits de tension de référence E, de quantum ${F(`q = ${FRAC("E","2ⁿ")}`)}.`;
  return [{ctx,q:"Calcule la sensibilité du capteur, en mV par degré.",type:"num",ans:s,tolR:0.02,unit:"mV/°",
      expl:`${F(`s = ${FRAC("E","θ_max")}`)} = ${FRAC(`${nf(o.Ev*1000,0)} mV`,`${o.tm}°`)} = ${U(s,"mV/°")}.`},
    {ctx,q:"Quelle est la plus petite variation d'angle que le système peut détecter, en degrés ?",type:"num",ans:res,tolR:0.02,unit:"°",
      expl:`Quantum : q = ${FRAC(`${nf(o.Ev*1000,0)} mV`,nf(2**o.n,0))} = ${nf(q,4)} mV. Un quantum correspond à ${F(`Δθ = ${FRAC("q","s")}`)} = ${FRAC(nf(q,4),nf(s,4))} = ${F(`${S3(res)}°`)}. C'est aussi ${FRAC(`${o.tm}°`,nf(2**o.n,0))} : E se simplifie.`},
    {ctx,q:`Le cahier des charges impose de détecter des variations d'angle de ${nf(o.req,1)}°. Est-ce possible avec ce CAN ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(res)}° ${ok?"≤":">"} ${nf(o.req,1)}° : ${ok?"l'exigence est respectée.":`l'exigence n'est pas respectée. Il faut ${FRAC(`${o.tm}°`,"2ⁿ")} ≤ ${nf(o.req,1)}°, soit un CAN d'au moins ${nmin} bits.`}`}]; },
/* chauffage à deux résistances : série ou parallèle */
()=>{ const R=rnd([4.7,6.8,10,15,22]), Uv=rnd([12,24]), Ps=Uv*Uv/(2*R), Pp=2*Uv*Uv/R;
  const ctx=`Une couveuse possède deux résistances chauffantes identiques de ${nf(R,1)} Ω, alimentées sous ${Uv} V. Un commutateur les branche soit en série (mode « éco »), soit en parallèle (mode « chauffe rapide »).`;
  return [{ctx,q:"Calcule la puissance de chauffage en mode « éco » (série).",type:"num",ans:Ps,tolR:0.02,unit:"W",
      expl:`En série : R_éq = 2R = ${nf(2*R,1)} Ω. ${F(`P = ${FRAC("U²","R_éq")}`)} = ${FRAC(`${Uv}²`,nf(2*R,1))} = ${U(Ps,"W")}.`},
    {ctx,q:"Calcule la puissance en mode « chauffe rapide » (parallèle).",type:"num",ans:Pp,tolR:0.02,unit:"W",
      expl:`En parallèle : ${F(`R_éq = ${FRAC("R","2")}`)} = ${nf(R/2,2)} Ω. P = ${FRAC(`${Uv}²`,nf(R/2,2))} = ${U(Pp,"W")}.`},
    {ctx:ctx+` P_série = ${S3(Ps)} W ; P_parallèle = ${S3(Pp)} W.`,q:"Par combien la puissance est-elle multipliée en passant du mode série au mode parallèle ?",type:"ch",...mc("Par 4",["Par 2","Par 1 : la puissance ne dépend que de la tension","Par 0,5"]),
      expl:`La résistance équivalente est divisée par 4 (de 2R à ${FRAC("R","2")}) sous la même tension, et ${F(`P = ${FRAC("U²","R_éq")}`)} : la puissance est multipliée par 4. Piège classique : on pense souvent « deux fois plus ».`}]; }
];

POOLS["ener-circuits"]={
  titre:"Mailles, nœuds, pont diviseur",
  fiche:{t:"Circuits électriques",l:[
    `Loi d'Ohm, convention récepteur : ${F("U = R·I")} ; nœud : ${F("ΣI_entrants = ΣI_sortants")} ; maille à un générateur : ${F("E = U1 + U2 + U3")}.`,
    `Série (même courant) : ${F("R_éq = R1 + R2")} ; parallèle (même tension) : ${F(`R_éq = ${FRAC("R1·R2","R1 + R2")}`)}, plus petite que chaque résistance.`,
    `Pont diviseur à vide : ${F(`U2 = E·${FRAC("R2","R1 + R2")}`)} ; avec une CTN ou une photorésistance, U2 suit la grandeur mesurée, puis le CAN la numérise.`,
    `LED : ${F(`R = ${FRAC("E − U_LED","I")}`)}, puis la valeur E12 juste au-dessus ; puissance dissipée ${F("P = R·I²")}, à comparer à la puissance admissible.`,
    "Pièges : mA et kΩ non convertis, résistances en parallèle additionnées, tension de seuil de la LED oubliée, pont diviseur chargé par l'entrée qu'il alimente."]},
  count:{1:4,2:4,3:3},1:CI1,2:CI2,3:CI3
};

/* ======================================================================
   HACHEUR, ONDULEUR, MLI — ener-convertisseur (fonction « moduler »)
   ====================================================================== */
const SYSM=[["le moteur de propulsion d'un robot",12],["le moteur d'un ventilateur de serre",24],["le moteur d'un tapis roulant",24],["le moteur d'une pompe de piscine solaire",24],["le moteur d'un volet roulant",12],["le moteur de propulsion d'un va'a électrique",48]];
/* chronogrammes lisibles : pas de grille ts, période de Tk pas */
const CHRONO=[{ts:10,tu:"µs",Tk:[4,5,8,10]},{ts:20,tu:"µs",Tk:[4,5,10]},{ts:50,tu:"µs",Tk:[4,5,8]},{ts:0.5,tu:"ms",Tk:[4,5,8]},{ts:1,tu:"ms",Tk:[4,5,8,10]}];
const lab2k=p=>p.slice().sort().join(" et ");

const CV1=[
/* tension moyenne en sortie d'un hacheur */
()=>{ const [sys,Ub]=rnd(SYSM), a=rnd([15,20,25,30,35,40,45,55,60,65,70,75,80,85,90]), pc=Math.random()<0.5, Um=a/100*Ub;
  return {ctx:`Un hacheur série, alimenté par une batterie de ${Ub} V, commande ${sys}.`,q:`Le rapport cyclique vaut α = ${pc?`${a} %`:nf(a/100,2)}. Calcule la tension moyenne ⟨u⟩ appliquée au moteur.`,type:"num",ans:Um,tolR:0.02,unit:"V",
    expl:`${F("⟨u⟩ = α·U")} = ${nf(a/100,2)} × ${Ub} = ${U(Um,"V")}${pc?` (α = ${a} % = ${nf(a/100,2)})`:""}. La tension moyenne est toujours comprise entre 0 et U.`}; },
/* rapport cyclique à partir de t_on et T */
()=>{ const o=rnd([[50,"µs"],[100,"µs"],[200,"µs"],[250,"µs"],[1,"ms"],[2,"ms"],[20,"ms"]]), T=o[0], k=rnd([0.1,0.2,0.25,0.3,0.4,0.45,0.6,0.7,0.75,0.8,0.9]), ton=r2(T*k,3), a=ton/T*100, mix=o[1]==="ms"&&T<=2&&Math.random()<0.5;
  const tt=mix?`${nf(ton*1000,0)} µs`:`${nf(ton,3)} ${o[1]}`;
  return {q:`Le signal de commande d'un transistor est à l'état haut pendant t_on = ${tt} sur chaque période T = ${nf(T,0)} ${o[1]}. Calcule le rapport cyclique α, en %.`,type:"num",ans:a,tolR:0.02,unit:"%",
    expl:`${mix?`Même unité : t_on = ${nf(ton*1000,0)} µs = ${nf(ton,3)} ms. `:""}${F(`α = ${FRAC("t_on","T")}`)} = ${FRAC(nf(ton,3),nf(T,0))} = ${nf(a/100,3)}, soit ${U(a,"%")}.`}; },
/* période et fréquence de découpage */
()=>{ if(Math.random()<0.5){ const f=rnd([1,2,4,5,8,10,16,20,25,40]), T=1000/f;
    return {q:`La fréquence de découpage d'un hacheur vaut f = ${f} kHz. Quelle est la période T du signal MLI, en µs ?`,type:"num",ans:T,tolR:0.02,unit:"µs",
      expl:`${F(`T = ${FRAC("1","f")}`)} = ${FRAC("1",`${nf(f*1000,0)} Hz`)} = ${sci(T*1e-6,3)} s, soit ${U(T,"µs")}.`}; }
  const T=rnd([0.5,1,2,2.5,4,5,10,20]), f=1000/T;
  return {q:`Sur un oscilloscope, la période du signal MLI envoyé à un variateur vaut T = ${nf(T,1)} ms. Quelle est sa fréquence, en Hz ?`,type:"num",ans:f,tolR:0.02,unit:"Hz",
    expl:`${F(`f = ${FRAC("1","T")}`)} avec T en secondes : f = ${FRAC("1",`${nf(T/1000,4)} s`)} = ${U(f,"Hz")}.`}; },
/* analogWrite : rapport cyclique */
()=>{ const n=rnd([26,51,64,77,102,128,153,179,191,204,230]), a=n/255*100, pin=rnd([3,5,6,9,10,11]);
  return {fig:code(`analogWrite(${pin}, ${n});   // MLI sur 8 bits`),ctx:"Sur une carte Arduino, analogWrite(broche, n) produit un signal MLI : n = 0 donne une sortie toujours à 0 V, n = 255 une sortie toujours à 5 V.",
    q:"Quel est le rapport cyclique du signal produit par cette ligne, en % ?",type:"num",ans:a,tolR:0.02,unit:"%",
    expl:`Sur 8 bits, n va de 0 à 255 : ${F(`α = ${FRAC("n","255")}`)} = ${FRAC(n,"255")} = ${nf(a/100,3)}, soit ${U(a,"%")}.`}; },
/* chronogramme : période lue, fréquence */
()=>{ const c=rnd(CHRONO), Tk=rnd(c.Tk), T=Tk*c.ts, ton=rnd([...Array(Tk-1).keys()].map(i=>i+1))*c.ts, Ts=c.tu==="µs"?T*1e-6:T*1e-3, f=1/Ts, kHz=f>=1000;
  return {fig:fx_cv_mli({T,ton,n:Tk<=5?3:2,ts:c.ts,tu:c.tu,Ul:"12"}),ctx:"Chronogramme de la tension de sortie d'un hacheur alimenté sous 12 V.",
    q:`Lis la période du signal, puis calcule la fréquence de découpage${kHz?", en kHz":", en Hz"}.`,type:"num",ans:kHz?f/1000:f,tolR:0.02,unit:kHz?"kHz":"Hz",
    expl:`D'un front montant au suivant : T = ${nf(T,3)} ${c.tu} = ${sci(Ts,3)} s. ${F(`f = ${FRAC("1","T")}`)} = ${kHz?`${nf(f,0)} Hz, soit ${U(f/1000,"kHz")}`:U(f,"Hz")}.`}; },
/* nature des conversions */
()=>{ const C=rnd([
    {q:"Quel convertisseur transforme une tension continue en tension alternative ?",ok:"Un onduleur",w:["Un redresseur","Un hacheur","Un transformateur"],e:"L'onduleur fabrique une tension alternative à partir d'une source continue (batterie, panneaux photovoltaïques) : c'est un convertisseur continu → alternatif (DC/AC). Un transformateur ne fonctionne qu'en alternatif."},
    {q:"Quel convertisseur transforme une tension alternative en tension continue ?",ok:"Un redresseur",w:["Un onduleur","Un hacheur","Un moteur à courant continu"],e:"Le redresseur (pont de diodes, par exemple) transforme l'alternatif du réseau en continu : c'est un convertisseur alternatif → continu (AC/DC), présent dans tous les chargeurs."},
    {q:"Quel convertisseur règle la valeur moyenne de la tension appliquée à un moteur à partir d'une batterie ?",ok:"Un hacheur",w:["Un onduleur","Un redresseur","Un transformateur"],e:"Le hacheur découpe la tension continue de la batterie : sa valeur moyenne ⟨u⟩ = α·U se règle avec le rapport cyclique. C'est un convertisseur continu → continu (DC/DC)."},
    {q:"Un chargeur de téléphone branché sur une prise de courant délivre 5 V continus. Quelle conversion réalise-t-il ?",ok:"Alternatif → continu (AC/DC)",w:["Continu → alternatif (DC/AC)","Continu → continu (DC/DC)","Alternatif → alternatif (AC/AC)"],e:"La prise délivre une tension alternative (230 V, 50 Hz) et le téléphone a besoin de continu : le chargeur est un convertisseur AC/DC (redressement, puis abaissement de la tension)."},
    {q:"Une ferme solaire injecte son énergie dans le réseau électrique de l'île. Quel convertisseur est indispensable entre les panneaux et le réseau ?",ok:"Un onduleur",w:["Un redresseur","Un hacheur seul","Aucun : les panneaux produisent déjà de l'alternatif"],e:"Les panneaux produisent du continu et le réseau est alternatif (50 Hz) : il faut un onduleur (DC/AC), synchronisé sur le réseau."}]);
  return {q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; },
/* symbole normalisé d'un convertisseur */
()=>{ const S=[["=","~","Un onduleur (continu → alternatif)"],["~","=","Un redresseur (alternatif → continu)"],["=","=","Un hacheur (continu → continu)"]], k=rnd([0,1,2]), s=S[k];
  return {fig:fx_cv_chaine({b:[{t:["Entrée"]},{cv:[s[0],s[1]]},{t:["Sortie"]}]}),ctx:"Dans le symbole d'un convertisseur, la nature de la tension d'entrée est indiquée en haut à gauche, celle de la sortie en bas à droite : trait plein sur trait pointillé pour le continu, sinusoïde pour l'alternatif.",
    q:"Quel convertisseur ce symbole représente-t-il ?",type:"ch",ch:[...S.map(x=>x[2]),"Un gradateur (alternatif → alternatif)"],ok:k,
    expl:`Entrée ${s[0]==="="?"continue":"alternative"}, sortie ${s[1]==="="?"continue":"alternative"} : c'est ${F(s[2].split(" (")[0].toLowerCase())}.`}; },
/* rôle du rapport cyclique */
()=>{ const C=rnd([
    {q:"Dans un hacheur commandé en MLI, que règle le rapport cyclique α ?",ok:"La valeur moyenne de la tension appliquée à la charge",w:["La fréquence de découpage","La tension de la batterie","Le sens de rotation du moteur"],e:"⟨u⟩ = α·U : le rapport cyclique fixe la fraction de la période pendant laquelle la charge est reliée à la source, donc la tension moyenne. La fréquence reste fixe ; le sens de rotation se règle avec un pont en H."},
    {q:"On augmente le rapport cyclique d'un signal MLI sans changer sa fréquence. Qu'est-ce qui change sur le chronogramme ?",ok:"La durée de l'état haut dans chaque période",w:["La période","La hauteur des impulsions","Le nombre d'impulsions par seconde"],e:"MLI : modulation de largeur d'impulsion. La période, donc le nombre d'impulsions par seconde, et la hauteur U restent les mêmes ; seule la largeur t_on = α·T des impulsions change."},
    {q:"Le rapport cyclique d'un hacheur alimenté sous U vaut 100 %. Que vaut la tension moyenne en sortie ?",ok:"U : la charge est reliée en permanence à la source",w:["0 V",FRAC("U","2"),"On ne peut pas savoir sans la fréquence"],e:"Avec α = 1, le transistor est fermé en permanence : ⟨u⟩ = α·U = U. Avec α = 0, il est toujours ouvert et ⟨u⟩ = 0."}]);
  return {q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; },
/* pont en H : inverser le sens de rotation */
()=>{ const nm=shuffle(["K1","K2","K3","K4"]), d=Math.random()<0.5, cur=d?[nm[0],nm[3]]:[nm[1],nm[2]], other=d?[nm[1],nm[2]]:[nm[0],nm[3]];
  return {fig:fx_cv_pont({nm,st:d?[1,0,0,1]:[0,1,1,0],path:d?"d":"i",U:"U"}),ctx:`Pont en H alimentant un moteur à courant continu. Avec ${lab2k(cur)} fermés (les deux autres ouverts), le courant traverse le moteur de ${d?"A vers B":"B vers A"} : le moteur tourne dans le sens 1.`,
    q:"Quels interrupteurs faut-il fermer, les deux autres restant ouverts, pour que le moteur tourne dans l'autre sens ?",type:"ch",...mc(lab2k(other),[lab2k(cur),lab2k([nm[0],nm[2]]),lab2k([nm[1],nm[3]])]),
    expl:`Il faut que le courant traverse le moteur dans l'autre sens : on ferme l'autre diagonale, ${F(lab2k(other))}. Le couple, proportionnel au courant, change de signe. Fermer deux interrupteurs d'un même bras (${lab2k([nm[0],nm[2]])} ou ${lab2k([nm[1],nm[3]])}) mettrait la batterie en court-circuit.`}; },
/* transistor en commutation */
()=>({q:"Dans un hacheur, le transistor fonctionne en commutation : il est soit bloqué, soit saturé. Pourquoi ce mode de fonctionnement limite-t-il ses pertes ?",type:"ch",...mc("Bloqué, il ne laisse passer aucun courant ; saturé, la tension à ses bornes est presque nulle : la puissance u·i qu'il dissipe reste faible",["Il stocke l'énergie pendant l'état bloqué et la restitue pendant l'état saturé","Il se comporte comme une résistance variable qui absorbe l'excédent de tension","Il commute à la même fréquence que le réseau électrique"]),
  expl:`La puissance dissipée par le transistor vaut ${F("p = u·i")}. Bloqué : i ≈ 0 ; saturé : u ≈ 0. Dans les deux états, p ≈ 0 : les pertes n'apparaissent qu'au moment des commutations. C'est pourquoi le rendement d'un hacheur dépasse souvent 90 %.`}),
/* rendement d'un convertisseur */
()=>{ const [nm,Ps_]=rnd([["un convertisseur continu-continu qui alimente un port USB",[10,12,15,18]],["le hacheur d'un vélo à assistance",[250,300,350]],["l'onduleur d'une installation photovoltaïque",[2000,2800,3600]],["le chargeur d'une trottinette",[80,100,120]]]);
  const eta=rnd([0.82,0.85,0.88,0.9,0.92,0.94,0.96,0.97]), Ps=rnd(Ps_), Pe=r2(Ps/eta,Ps>=1000?0:1), r=Ps/Pe*100;
  return {q:`En fonctionnement, ${nm} absorbe P_e = ${nf(Pe,1)} W et fournit P_s = ${nf(Ps,0)} W. Calcule son rendement, en %.`,type:"num",ans:r,tolR:0.02,unit:"%",
    expl:`${F(`η = ${FRAC("P_s","P_e")}`)} = ${FRAC(nf(Ps,0),nf(Pe,1))} = ${nf(r/100,4)}, soit ${U(r,"%")}. Les ${nf(Pe-Ps,1)} W restants sont perdus en chaleur (conduction et commutations des transistors).`}; },
/* vitesse proportionnelle au rapport cyclique */
()=>{ const N1=rnd([1500,2000,2400,3000,3600,4500]), a=rnd([20,25,30,40,50,60,70,75,80,90]), N=N1*a/100;
  return {ctx:`Un moteur à courant continu alimenté par un hacheur tourne à ${nf(N1,0)} tr/min lorsque α = 100 %. On néglige la chute de tension R·I dans l'induit.`,
    q:`À quelle vitesse tourne-t-il lorsque α = ${a} % ?`,type:"num",ans:N,tolR:0.02,unit:"tr/min",
    expl:`R·I négligée : ${F("E = k·Ω ≈ ⟨u⟩ = α·U")}, donc la vitesse est proportionnelle à α : ${F("N = α·N_max")} = ${nf(a/100,2)} × ${nf(N1,0)} = ${U(N,"tr/min")}.`}; }
];

const CV2=[
/* chronogramme : rapport cyclique, puis tension moyenne */
()=>{ const c=rnd(CHRONO), Tk=rnd(c.Tk), T=Tk*c.ts, j=rnd([...Array(Tk-1).keys()].map(i=>i+1)), ton=j*c.ts, a=j/Tk, Ub=rnd([12,24,36,48]);
  const fig=fx_cv_mli({T,ton,n:Tk<=5?3:2,ts:c.ts,tu:c.tu,Ul:String(Ub)}), ctx=`Chronogramme de la tension u appliquée à un moteur par un hacheur alimenté par une batterie de ${Ub} V.`;
  return [{fig,ctx,q:"Lis t_on et T, puis calcule le rapport cyclique α (valeur décimale).",type:"num",ans:a,tolA:0.011,unit:"",
      expl:`On lit t_on = ${nf(ton,3)} ${c.tu} (durée de l'état haut) et T = ${nf(T,3)} ${c.tu} (période). ${F(`α = ${FRAC("t_on","T")}`)} = ${FRAC(nf(ton,3),nf(T,3))} = ${U(a,"")}.`},
    {fig,ctx:ctx+` α = ${nf(a,3)}.`,q:"Calcule la tension moyenne ⟨u⟩ appliquée au moteur.",type:"num",ans:a*Ub,tolR:0.02,unit:"V",
      expl:`${F("⟨u⟩ = α·U")} = ${nf(a,3)} × ${Ub} = ${U(a*Ub,"V")}. C'est aussi l'aire sous la courbe sur une période, ${FRAC("U·t_on","T")}.`}]; },
/* vitesse voulue : rapport cyclique, puis valeur à écrire dans analogWrite */
()=>{ const [sys,Ub]=rnd([["un robot de tri",12],["un convoyeur de colis",24],["un ventilateur de serre",12],["une pompe d'arrosage",24]]);
  const o=draw(()=>({N1:rnd([2000,2400,3000,3600,4000]),N:rnd([600,800,900,1000,1200,1500,1800,2000,2500])}),o=>o.N<o.N1*0.95&&o.N>o.N1*0.1), a=o.N/o.N1, n=Math.round(255*a);
  const ctx=`Le moteur à courant continu d'${sys} est alimenté par un hacheur commandé par une broche MLI d'une carte Arduino. Sous ${Ub} V (α = 100 %), il tourne à ${nf(o.N1,0)} tr/min ; on néglige la chute de tension R·I, si bien que la vitesse est proportionnelle à α.`;
  return [{ctx,q:`Quel rapport cyclique faut-il pour qu'il tourne à ${nf(o.N,0)} tr/min, en % ?`,type:"num",ans:a*100,tolR:0.02,unit:"%",
      expl:`${F("N = α·N_max")}, donc ${F(`α = ${FRAC("N","N_max")}`)} = ${FRAC(nf(o.N,0),nf(o.N1,0))} = ${nf(a,4)}, soit ${U(a*100,"%")}.`},
    {ctx:ctx+` α = ${nf(a*100,1)} %.`,q:"Quelle valeur n faut-il écrire dans analogWrite(broche, n) ?",type:"num",ans:n,tolA:1,unit:"",
      expl:`MLI sur 8 bits : ${F("n = α × 255")} = ${nf(a,4)} × 255 = ${nf(255*a,1)}, arrondi à ${F(String(n))}.`}]; },
/* analogWrite : tension moyenne, puis vitesse d'une roue */
()=>{ const Ub=rnd([6,9,12]), n=rnd([64,89,102,128,153,179,191,204,230]), N1=rnd([150,200,250,300]), a=n/255, Um=a*Ub, N=a*N1, src=`analogWrite(ENA, ${n});   // commande du hacheur`;
  const ctx=`Robot mobile à deux roues motrices et une roue folle : chaque motoréducteur est alimenté par un hacheur sous ${Ub} V, commandé par l'instruction analogWrite(ENA, ${n}) (MLI sur 8 bits). Sous ${Ub} V (α = 100 %), la roue tourne à ${N1} tr/min ; on néglige la chute de tension R·I.`;
  return [{fig:code(src),ctx,q:"Calcule la tension moyenne appliquée au motoréducteur.",type:"num",ans:Um,tolR:0.02,unit:"V",
      expl:`${F(`α = ${FRAC("n","255")}`)} = ${FRAC(n,"255")} = ${nf(a,3)} ; ${F("⟨u⟩ = α·U")} = ${nf(a,3)} × ${Ub} = ${U(Um,"V")}.`},
    {fig:code(src),ctx,q:"À quelle vitesse tourne alors la roue ?",type:"num",ans:N,tolR:0.02,unit:"tr/min",
      expl:`La vitesse est proportionnelle à la tension moyenne : ${F(`N = N_max·${FRAC("⟨u⟩","U")}`)} = ${N1} × ${nf(a,3)} = ${U(N,"tr/min")}.`}]; },
/* fréquence et rapport cyclique : période, puis durée de conduction */
()=>{ const f=rnd([1,2,4,5,8,10,16,20,25]), a=rnd([15,20,25,30,35,40,60,65,70,75,80]), T=1000/f, ton=a/100*T;
  const ctx=`Le variateur d'un ventilateur découpe la tension à la fréquence f = ${f} kHz, avec un rapport cyclique α = ${a} %.`;
  return [{ctx,q:"Calcule la période T du découpage, en µs.",type:"num",ans:T,tolR:0.02,unit:"µs",
      expl:`${F(`T = ${FRAC("1","f")}`)} = ${FRAC("1",`${nf(f*1000,0)} Hz`)} = ${sci(T*1e-6,3)} s = ${U(T,"µs")}.`},
    {ctx:ctx+` T = ${S3(T)} µs.`,q:"Pendant combien de temps le transistor conduit-il à chaque période, en µs ?",type:"num",ans:ton,tolR:0.02,unit:"µs",
      expl:`${F("t_on = α·T")} = ${nf(a/100,2)} × ${S3(T)} = ${U(ton,"µs")}. Le reste de la période (${S3(T-ton)} µs), le transistor est bloqué.`}]; },
/* onduleur : tension alternative en créneaux */
()=>{ const c=rnd([{T:20,ts:2},{T:10,ts:1},{T:40,ts:4}]), Ub=rnd([12,24,48]), f=1000/c.T;
  const fig=fx_cv_carre({T:c.T,ts:c.ts,n:2,tu:"ms",Ul:String(Ub)}), ctx=`Chronogramme de la tension de sortie d'un onduleur en pont (quatre interrupteurs), alimenté par une batterie de ${Ub} V.`;
  return [{fig,ctx,q:"Lis la période de cette tension, puis calcule sa fréquence.",type:"num",ans:f,tolR:0.02,unit:"Hz",
      expl:`Le motif se répète toutes les T = ${c.T} ms = ${nf(c.T/1000,3)} s. ${F(`f = ${FRAC("1","T")}`)} = ${FRAC("1",nf(c.T/1000,3))} = ${U(f,"Hz")}.`},
    {fig,ctx,q:"Que vaut la valeur moyenne de cette tension ?",type:"ch",...mc("0 V : la tension est alternative",[`${Ub} V`,`${Ub/2} V`,`${2*Ub} V`]),
      expl:`Pendant chaque demi-période, u vaut +${Ub} V puis −${Ub} V : les aires positive et négative se compensent, la valeur moyenne est ${F("nulle")}. C'est la signature d'une tension alternative : l'onduleur convertit le continu de la batterie en alternatif.`}]; },
/* trois chronogrammes : quel convertisseur ? */
()=>{ const K=shuffle(["carre","mli","redr"]), ask=rnd(["carre","mli","redr"]), NM={carre:"d'un onduleur (continu → alternatif)",mli:"d'un hacheur (continu → continu)",redr:"d'un redresseur double alternance (alternatif → continu)"};
  const DS={carre:"tension alternative en créneaux, de valeur moyenne nulle (onduleur)",mli:"tension découpée entre 0 et U, toujours positive (hacheur)",redr:"sinusoïde dont les alternances négatives sont retournées, toujours positive (redresseur)"};
  return {fig:fx_cv_ondes({k:K}),q:`Quel chronogramme représente la tension de sortie ${NM[ask]} ?`,type:"ch",ch:["Chronogramme 1","Chronogramme 2","Chronogramme 3"],ok:K.indexOf(ask),
    expl:`${K.map((x,i)=>`Chronogramme ${i+1} : ${DS[x]}`).join(" ; ")}. La réponse est donc le ${F(`chronogramme ${K.indexOf(ask)+1}`)}.`}; },
/* convertisseur continu-continu : puissance, puis courant absorbé */
()=>{ const S=rnd([["Un convertisseur abaisseur alimente l'électronique d'un vélo à assistance (5 V) à partir de sa batterie de 36 V",36,5,[0.5,0.8,1,1.2]],["Un convertisseur 24 V → 12 V alimente la radio d'un bateau à partir d'une batterie de 24 V",24,12,[1.5,2,3,4]],["Un convertisseur 12 V → 5 V alimente un routeur Wi-Fi à bord d'un catamaran",12,5,[1,1.5,2]]]);
  const Is=rnd(S[3]), eta=rnd([0.85,0.88,0.9,0.92,0.94]), Ps=S[2]*Is, Pe=Ps/eta, Ie=Pe/S[1], ctx=`${S[0]}. Il fournit ${nf(Is,1)} A sous ${S[2]} V ; son rendement vaut ${nf(eta,2)}.`;
  return [{ctx,q:"Quelle puissance fournit-il ?",type:"num",ans:Ps,tolR:0.02,unit:"W",expl:`${F("P_s = U_s·I_s")} = ${S[2]} × ${nf(Is,1)} = ${U(Ps,"W")}.`},
    {ctx,q:"Quelle intensité absorbe-t-il sur la batterie ?",type:"num",ans:Ie,tolR:0.02,unit:"A",
      expl:`${F(`P_e = ${FRAC("P_s","η")}`)} = ${FRAC(nf(Ps,1),nf(eta,2))} = ${nf(Pe,2)} W, puis ${F(`I_e = ${FRAC("P_e","U_e")}`)} = ${FRAC(nf(Pe,2),S[1])} = ${U(Ie,"A")}. Le convertisseur abaisse la tension et absorbe un courant plus faible que celui qu'il fournit : c'est la puissance qui se conserve (aux pertes près), pas le courant.`}]; },
/* pont en H : court-circuit d'un bras */
()=>{ const nm=shuffle(["K1","K2","K3","K4"]), pair=Math.random()<0.5?[nm[0],nm[2]]:[nm[1],nm[3]];
  return {fig:fx_cv_pont({nm,st:[0,0,0,0],U:"U"}),q:`Pourquoi ne faut-il jamais fermer en même temps ${lab2k(pair)} ?`,type:"ch",...mc("La batterie serait en court-circuit : un courant très intense détruirait les interrupteurs",["Le moteur tournerait deux fois plus vite","Le moteur s'arrêterait simplement, sans autre conséquence","Aucun courant ne circulerait dans le pont"]),
    expl:`${lab2k(pair)} sont sur le même bras du pont : fermés ensemble, ils relient directement la borne + à la borne − de la batterie, sans passer par le moteur. Le courant n'est limité que par de très faibles résistances : c'est un ${F("court-circuit")}. La commande laisse toujours un petit « temps mort » entre l'ouverture d'un interrupteur et la fermeture de l'autre, sur un même bras.`}; },
/* servomoteur : durée d'impulsion, puis rapport cyclique */
()=>{ const th=rnd([0,30,45,60,90,120,135,150,180]), tp=1+th/180, a=tp/20*100;
  const ctx="Le servomoteur du gouvernail d'une maquette de pirogue reçoit une impulsion toutes les 20 ms. La durée de l'impulsion fixe l'angle : 1 ms pour 0°, 2 ms pour 180°, avec une variation linéaire entre les deux.";
  return [{ctx,q:`Quelle durée d'impulsion faut-il pour placer le gouvernail à ${th}°, en ms ?`,type:"num",ans:tp,tolR:0.02,unit:"ms",
      expl:`La durée augmente de 1 ms sur 180° : ${F(`t = 1 + ${FRAC("θ","180")}`)} (t en ms, θ en degrés) = 1 + ${FRAC(th,"180")} = ${U(tp,"ms")}.`},
    {ctx,q:"Quel est alors le rapport cyclique du signal de commande, en % ?",type:"num",ans:a,tolR:0.02,unit:"%",
      expl:`${F(`α = ${FRAC("t_on","T")}`)} = ${FRAC(nf(tp,3),"20")} = ${nf(tp/20,4)}, soit ${U(a,"%")}. Pour un servomoteur, c'est la durée de l'impulsion qui code l'angle, pas la tension moyenne.`}]; },
/* décharge de la batterie : ajuster le rapport cyclique */
()=>{ const [nm,Uf,Ul]=rnd([["batterie au plomb de 12 V",12.8,11.6],["batterie Li-ion de 36 V",42,33],["batterie LiFePO4 de 24 V",27.6,24],["batterie Li-ion 3S",12.6,10.5]]), Um=r2(rnd([0.4,0.5,0.6,0.7,0.8])*Ul,1), a1=Um/Uf*100, a2=Um/Ul*100;
  const ctx=`Pour garder la même vitesse, le moteur d'une pompe doit toujours recevoir ⟨u⟩ = ${nf(Um,1)} V. Il est alimenté par un hacheur à partir d'une ${nm}, dont la tension passe de ${nf(Uf,1)} V (pleine charge) à ${nf(Ul,1)} V (fin de décharge).`;
  return [{ctx,q:"Quel rapport cyclique faut-il quand la batterie est pleine, en % ?",type:"num",ans:a1,tolR:0.02,unit:"%",
      expl:`${F(`α = ${FRAC("⟨u⟩","U")}`)} = ${FRAC(nf(Um,1),nf(Uf,1))} = ${nf(a1/100,4)}, soit ${U(a1,"%")}.`},
    {ctx,q:"Et en fin de décharge, en % ?",type:"num",ans:a2,tolR:0.02,unit:"%",
      expl:`α = ${FRAC(nf(Um,1),nf(Ul,1))} = ${nf(a2/100,4)}, soit ${U(a2,"%")}. La commande doit augmenter α à mesure que la batterie se décharge : c'est le rôle d'une régulation (mesure de la vitesse ou de la tension de la batterie).`}]; },
/* diode de roue libre */
()=>({fig:fx_cv_hacheur({k:0}),ctx:"Hacheur série alimentant un moteur à courant continu. Le bobinage du moteur possède une inductance, qui s'oppose aux variations brutales du courant.",
  q:"Quand le transistor T est bloqué (ouvert), par où passe le courant du moteur ?",type:"ch",...mc("Par la diode D, dite de roue libre, qui referme le circuit du moteur",["Par la batterie, qui se recharge","Nulle part : le courant s'annule instantanément","Par le transistor T, qui reste passant"]),
  expl:`Le courant dans une bobine ne peut pas s'annuler brusquement. Quand T s'ouvre, la diode ${F("D (roue libre)")} devient passante : le courant du moteur continue de circuler dans la boucle moteur-diode en décroissant. Sans elle, une surtension détruirait le transistor.`}),
/* pourquoi découper à haute fréquence */
()=>({q:"Pourquoi choisit-on souvent une fréquence de découpage de l'ordre de 20 kHz pour commander un moteur ?",type:"ch",...mc("Le courant du moteur est mieux lissé par son inductance et le découpage n'est plus audible",["La tension moyenne est plus grande à haute fréquence","Le rapport cyclique ne peut être réglé qu'au-dessus de 20 kHz","Le moteur tourne plus vite quand la fréquence augmente"]),
  expl:`La tension moyenne ne dépend que de α (${F("⟨u⟩ = α·U")}), pas de la fréquence. Mais plus la fréquence est élevée, plus l'ondulation du courant est faible (l'inductance du moteur lisse le courant) et, au-delà d'environ 20 kHz, le sifflement du découpage n'est plus audible. En contrepartie, les pertes par commutation augmentent avec la fréquence.`}),
/* gradation d'un ruban de LED par MLI */
()=>{ const Ip=rnd([0.5,0.8,1,1.2,1.5,2]), pc=rnd([10,20,25,30,40,50,60,75]), n=Math.round(255*pc/100), Im=n/255*Ip;
  const ctx=`Le ruban de LED du carré d'un voilier absorbe ${nf(Ip,1)} A quand il est allumé en permanence. Pour régler sa luminosité, un transistor l'allume et l'éteint très vite (MLI sur 8 bits, analogWrite). L'œil perçoit une luminosité proportionnelle au rapport cyclique.`;
  return [{ctx,q:`Quelle valeur n faut-il écrire dans analogWrite pour une luminosité de ${pc} % ?`,type:"num",ans:n,tolA:1,unit:"",
      expl:`${F("n = α × 255")} = ${nf(pc/100,2)} × 255 = ${nf(255*pc/100,2)}, arrondi à ${F(String(n))}.`},
    {ctx:ctx+` On écrit analogWrite(broche, ${n}).`,q:"Quelle est alors l'intensité moyenne absorbée par le ruban ?",type:"num",ans:Im,tolR:0.02,unit:"A",
      expl:`Le ruban absorbe ${nf(Ip,1)} A pendant t_on et 0 A le reste du temps : ${F("I_moy = α·I")} = ${FRAC(n,"255")} × ${nf(Ip,1)} = ${U(Im,"A")}. La consommation baisse dans le même rapport que la luminosité.`}]; }
];

const CV3=[
/* robot mobile : vitesse du moteur, rapport cyclique, consigne analogWrite */
()=>{ const o=draw(()=>({D:rnd([60,65,80,100]),k:rnd([20,30,48,50]),Kn:rnd([400,500,600,800]),Ub:rnd([7.4,9,12]),v:rnd([0.2,0.25,0.3,0.4,0.5,0.6])}),o=>{ const a=o.v/(Math.PI*o.D/1000)*60*o.k/o.Kn/o.Ub; return a>=0.15&&a<=0.9; });
  const Nr=o.v/(Math.PI*o.D/1000)*60, Nm=Nr*o.k, Um=Nm/o.Kn, a=Um/o.Ub, n=Math.round(255*a);
  const ctx=`Un robot mobile doit rouler à ${nf(o.v,2)} m/s. Ses roues motrices ont un diamètre de ${o.D} mm ; chaque moteur entraîne sa roue par un réducteur de rapport ${FRAC("1",o.k)} (la roue tourne ${o.k} fois moins vite que le moteur). La batterie fournit ${nf(o.Ub,1)} V et, R·I négligée, chaque moteur tourne à N = ${o.Kn} × ⟨u⟩ (N en tr/min, ⟨u⟩ en V).`;
  return [{ctx,q:"À quelle vitesse doit tourner chaque moteur, en tr/min ?",type:"num",ans:Nm,tolR:0.02,unit:"tr/min",
      expl:`Roue : ${F(`N_roue = ${FRAC("60·v","π·D")}`)} = ${FRAC(`60 × ${nf(o.v,2)}`,`π × ${nf(o.D/1000,3)}`)} = ${nf(Nr,1)} tr/min. Moteur : N = ${o.k} × ${nf(Nr,1)} = ${U(Nm,"tr/min")}.`},
    {ctx:ctx+` N_moteur = ${S3(Nm)} tr/min.`,q:"Quel rapport cyclique le hacheur doit-il appliquer, en % ?",type:"num",ans:a*100,tolR:0.02,unit:"%",
      expl:`${F(`⟨u⟩ = ${FRAC("N",o.Kn)}`)} = ${FRAC(S3(Nm),o.Kn)} = ${nf(Um,3)} V, puis ${F(`α = ${FRAC("⟨u⟩","U")}`)} = ${FRAC(nf(Um,3),nf(o.Ub,1))} = ${nf(a,4)}, soit ${U(a*100,"%")}.`},
    {ctx:ctx+` α = ${nf(a*100,1)} %.`,q:"Quelle valeur n faut-il passer à analogWrite ?",type:"num",ans:n,tolA:1,unit:"",
      expl:`${F("n = α × 255")} = ${nf(a,4)} × 255 = ${nf(255*a,1)}, soit ${F(String(n))} : la valeur est bien comprise entre 0 et 255, la consigne est réalisable.`}]; },
/* hypothèse « R·I négligeable » : écart sur le rapport cyclique */
()=>{ const tgt=Math.random()<0.5, o=draw(()=>({k:rnd([0.02,0.03,0.05,0.08]),R:rnd([0.3,0.5,0.8,1.2,2]),I:rnd([0.5,1,1.5,2,3]),N:rnd([1500,2000,2500,3000]),Ub:rnd([12,24])}),o=>{ const E=o.k*o.N*Math.PI/30, Um=E+o.R*o.I, e=o.R*o.I/Um*100; return Um<0.95*o.Ub&&Um>0.2*o.Ub&&far(e,5,0.15)&&(e<5)===tgt; });
  const w=o.N*Math.PI/30, E=o.k*w, Um=E+o.R*o.I, a1=E/o.Ub*100, a2=Um/o.Ub*100, ok=(a2-a1)/a2*100<5, ed=Math.abs(r2(a1,1)-r2(a2,1))/r2(a2,1)*100;
  const ctx=`Un moteur à courant continu (k = ${nf(o.k,3)} V·s/rad, R = ${nf(o.R,1)} Ω) doit tourner à ${nf(o.N,0)} tr/min en absorbant I = ${nf(o.I,1)} A. Il est alimenté par un hacheur sous U = ${o.Ub} V.`;
  return [{ctx,q:"En négligeant la chute de tension R·I (⟨u⟩ ≈ E = k·Ω), quel rapport cyclique faut-il, en % ?",type:"num",ans:a1,tolR:0.02,unit:"%",
      expl:`Ω = ${FRAC(`2π × ${nf(o.N,0)}`,"60")} = ${nf(w,1)} rad/s ; ${F("E = k·Ω")} = ${nf(o.k,3)} × ${nf(w,1)} = ${nf(E,2)} V. ${F(`α = ${FRAC("E","U")}`)} = ${FRAC(nf(E,2),o.Ub)} = ${U(a1,"%")}.`},
    {ctx,q:"Même calcul avec le modèle complet ⟨u⟩ = E + R·I, en %.",type:"num",ans:a2,tolR:0.02,unit:"%",
      expl:`${F("⟨u⟩ = E + R·I")} = ${nf(E,2)} + ${nf(o.R,1)} × ${nf(o.I,1)} = ${nf(Um,2)} V ; α = ${FRAC(nf(Um,2),o.Ub)} = ${U(a2,"%")}.`},
    {ctx:ctx+` α vaut ${nf(a1,1)} % sans R·I et ${nf(a2,1)} % avec R·I.`,q:"On garde l'hypothèse « R·I négligeable » si l'écart relatif sur α reste inférieur à 5 % (référence : modèle complet). Est-ce le cas ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`Écart relatif : ${FRAC(`|${nf(a1,1)} − ${nf(a2,1)}|`,nf(a2,1))} × 100 = ${nf(ed,1)} % ${ok?"< 5 % : l'hypothèse est acceptable, la vitesse est pratiquement proportionnelle à α.":"> 5 % : l'hypothèse n'est pas acceptable, la chute de tension R·I est trop importante à ce point de fonctionnement."}`}]; },
/* chauffage par MLI : puissance moyenne (piège de la tension moyenne) */
()=>{ const R=rnd([2.2,3.3,4.7,6.8]), Ub=rnd([12,24]), a=rnd([20,25,30,40,50,60,75]), Pmax=Ub*Ub/R, P=a/100*Pmax, Pw=(a/100*Ub)**2/R;
  const ctx=`Le chauffage d'une couveuse est une résistance R = ${nf(R,1)} Ω alimentée sous U = ${Ub} V par un hacheur. Pendant t_on, la résistance reçoit toute la tension U ; pendant le reste de la période, elle ne reçoit rien.`;
  return [{ctx,q:"Quelle puissance la résistance reçoit-elle pendant t_on, transistor fermé ?",type:"num",ans:Pmax,tolR:0.02,unit:"W",
      expl:`${F(`P = ${FRAC("U²","R")}`)} = ${FRAC(`${Ub}²`,nf(R,1))} = ${U(Pmax,"W")}.`},
    {ctx,q:`Le rapport cyclique vaut α = ${a} %. Quelle est la puissance moyenne de chauffage ?`,type:"num",ans:P,tolR:0.02,unit:"W",
      expl:`La résistance reçoit ${S3(Pmax)} W pendant la fraction α de chaque période et 0 W le reste du temps : ${F(`P_moy = α·${FRAC("U²","R")}`)} = ${nf(a/100,2)} × ${S3(Pmax)} = ${U(P,"W")}.`},
    {ctx,q:`Un élève calcule ${FRAC("⟨u⟩²","R")} avec ⟨u⟩ = α·U et trouve ${S3(Pw)} W. Que penses-tu de sa méthode ?`,type:"ch",...mc("Elle est fausse : la puissance dépend du carré de la tension, on ne peut pas utiliser la tension moyenne",["Elle est juste : c'est la définition de la puissance moyenne","Elle est juste : les deux méthodes donnent toujours le même résultat",`Elle est fausse : la résistance reçoit toujours U, il fallait calculer ${FRAC("U²","R")}`]),
      expl:`La puissance instantanée vaut ${FRAC("u²","R")} : ${FRAC("U²","R")} pendant t_on, 0 ensuite, d'où P = α·${FRAC("U²","R")} = ${S3(P)} W. ${FRAC("⟨u⟩²","R")} = α²·${FRAC("U²","R")} donne ${S3(Pw)} W, soit ${nf(100/a,2)} fois trop peu : la moyenne d'un carré n'est pas le carré de la moyenne.`}]; },
/* pont en H commandé par un programme : sens, tension moyenne, vitesse */
()=>{ const fw=Math.random()<0.5, n=rnd([64,102,128,153,191,230]), Ub=rnd([7.4,9,12]), N1=rnd([200,250,300]), a=n/255;
  const src=`digitalWrite(IN1, ${fw?"HIGH":"LOW"});\ndigitalWrite(IN2, ${fw?"LOW":"HIGH"});\nanalogWrite(ENA, ${n});`;
  const data=table(["IN1","IN2","Effet sur le moteur"],[["HIGH","LOW","sens avant"],["LOW","HIGH","sens arrière"],["identiques","identiques","arrêt freiné"]]);
  const ctx=`Le moteur de la roue droite d'un robot (roue folle à l'avant) est piloté par un pont en H intégré : IN1 et IN2 fixent le sens (tableau), ENA reçoit le signal MLI sur 8 bits. Batterie : ${nf(Ub,1)} V. Sous ${nf(Ub,1)} V, la roue tourne à ${N1} tr/min (R·I négligée).`;
  return [{fig:code(src),data,ctx,q:"Dans quel sens tourne le moteur ?",type:"ch",ch:["Sens avant","Sens arrière","Arrêt freiné"],ok:fw?0:1,
      expl:`IN1 = ${fw?"HIGH":"LOW"} et IN2 = ${fw?"LOW":"HIGH"} : d'après le tableau, ${F(fw?"sens avant":"sens arrière")}. Le pont ferme la diagonale qui fait passer le courant dans le bon sens.`},
    {fig:code(src),data,ctx,q:"Quelle tension moyenne le pont applique-t-il au moteur ?",type:"num",ans:a*Ub,tolR:0.02,unit:"V",
      expl:`${F(`α = ${FRAC("n","255")}`)} = ${FRAC(n,"255")} = ${nf(a,3)} ; ${F("⟨u⟩ = α·U")} = ${nf(a,3)} × ${nf(Ub,1)} = ${U(a*Ub,"V")}.`},
    {fig:code(src),data,ctx,q:"À quelle vitesse tourne la roue ?",type:"num",ans:a*N1,tolR:0.02,unit:"tr/min",
      expl:`Vitesse proportionnelle à α : ${F("N = α·N_max")} = ${nf(a,3)} × ${N1} = ${U(a*N1,"tr/min")}.`}]; },
/* pompe solaire : choix du convertisseur, puissance des panneaux */
()=>{ const H=rnd([8,10,12,15,20]), Q=rnd([1.5,2,2.5,3,4]), e1=rnd([0.94,0.95,0.96,0.97]), e2=rnd([0.78,0.8,0.82,0.85]), e3=rnd([0.45,0.5,0.55,0.6]);
  const Ph=1000*g*H*Q/3600, eg=e1*e2*e3, Pp=Ph/eg;
  const fq=fx_cv_chaine({b:[{t:["Panneaux","PV"]},{cv:["=","~"],q:true},{t:["Moteur","asynchrone"]},{t:["Pompe"]}],cap:"Pompage solaire au fil du soleil"}), fs=fx_cv_chaine({b:[{t:["Panneaux","PV"]},{cv:["=","~"],n:["onduleur"]},{t:["Moteur","asynchrone"]},{t:["Pompe"]}],cap:"Pompage solaire au fil du soleil"});
  const ctx=`Sur un motu sans réseau électrique, une pompe remplit une citerne : les panneaux photovoltaïques alimentent un moteur asynchrone (alternatif) qui entraîne la pompe. Il faut élever ${nf(Q,1)} m³ d'eau par heure sur une hauteur de ${H} m (ρ = 1 000 kg/m³, g = 9,81 m/s²).`;
  return [{fig:fq,ctx,q:"Quel convertisseur faut-il placer entre les panneaux et le moteur ?",type:"ch",...mc("Un onduleur (continu → alternatif)",["Un redresseur (alternatif → continu)","Un hacheur (continu → continu)","Aucun : le moteur asynchrone accepte le continu"]),
      expl:`Les panneaux produisent une tension continue et le moteur asynchrone doit être alimenté en alternatif : il faut un ${F("onduleur")}, qui assure la fonction « moduler » de la chaîne de puissance (il règle aussi la fréquence, donc la vitesse de la pompe).`},
    {fig:fs,ctx:ctx+` Rendements : onduleur ${nf(e1,2)}, moteur ${nf(e2,2)}, pompe ${nf(e3,2)}.`,q:"Quelle puissance électrique les panneaux doivent-ils fournir ?",type:"num",ans:Pp,tolR:0.02,unit:"W",
      expl:`Puissance hydraulique : ${F("P_h = ρ·g·H·Q_v")} = 1 000 × 9,81 × ${H} × ${FRAC(nf(Q,1),"3 600")} = ${nf(Ph,1)} W. Rendement de la chaîne : ${nf(e1,2)} × ${nf(e2,2)} × ${nf(e3,2)} = ${nf(eg,4)}. ${F(`P_PV = ${FRAC("P_h","η")}`)} = ${FRAC(nf(Ph,1),nf(eg,4))} = ${U(Pp,"W")}.`}]; },
/* chargeur de batterie : bloc manquant, énergie prélevée, durée */
()=>{ const [sys,Eb,P]=rnd([["d'un vélo à assistance",500,120],["d'une trottinette",360,90],["d'un scooter électrique",1500,400],["d'un robot de tonte",150,60]]), e1=rnd([0.95,0.96,0.97,0.98]), e2=rnd([0.88,0.9,0.92,0.94]), eg=e1*e2, Ew=Eb/eg, t=Ew/P;
  const fq=fx_cv_chaine({b:[{t:["Réseau","230 V ~"]},{cv:["~","="],n:["redresseur"]},{cv:["=","="],q:true},{t:["Batterie"]}],cap:`Chargeur ${sys}`});
  const ctx=`Le chargeur ${sys} prélève l'énergie sur le réseau (230 V alternatif) : un redresseur, puis un second convertisseur qui règle la tension et le courant de charge de la batterie.`;
  return [{fig:fq,ctx,q:"Quel est le second convertisseur, repéré par « ? » ?",type:"ch",...mc("Un hacheur (continu → continu)",["Un onduleur (continu → alternatif)","Un second redresseur (alternatif → continu)","Un gradateur (alternatif → alternatif)"]),
      expl:`Après le redresseur, la tension est continue ; la batterie se charge en continu, sous une tension qu'il faut régler : c'est un convertisseur continu → continu, un ${F("hacheur")}.`},
    {fig:fq,ctx:ctx+` Rendements : redresseur ${nf(e1,2)}, hacheur ${nf(e2,2)}. La batterie vide doit recevoir ${nf(Eb,0)} Wh.`,q:"Quelle énergie faut-il prélever sur le réseau, en Wh ?",type:"num",ans:Ew,tolR:0.02,unit:"Wh",
      expl:`Rendement global : ${nf(e1,2)} × ${nf(e2,2)} = ${nf(eg,4)}. ${F(`E_réseau = ${FRAC("E_bat","η")}`)} = ${FRAC(nf(Eb,0),nf(eg,4))} = ${U(Ew,"Wh")}.`},
    {fig:fq,ctx:ctx+` Il faut prélever ${S3(Ew)} Wh sur le réseau.`,q:`Le chargeur absorbe ${P} W sur le réseau. Combien de temps dure la charge, en h ?`,type:"num",ans:t,tolR:0.02,unit:"h",
      expl:`${F(`Δt = ${FRAC("E","P")}`)} = ${FRAC(S3(Ew),P)} = ${U(t,"h")}.`}]; },
/* validation du modèle N = α·N_max par des essais */
()=>{ const tgt=Math.random()<0.5, o=draw(()=>{ const N1=rnd([2400,3000,3600]), a=rnd([40,50,60,70,80]), disp=rnd([2,3,4,5]), e=rnd([1,1.5,2.5,3.5,4.5,6,7,8]), Nm=a/100*N1, Nx=Math.round(Nm*(1-e/100)/10)*10, er=Math.abs(Nx-Nm)/Nm*100; return {N1,a,disp,Nm,Nx,er}; },o=>o.er>=0.5&&far(o.er,o.disp,0.2)&&(o.er<o.disp)===tgt);
  const ok=o.er<o.disp, ctx=`Un modèle simple prévoit N = α·N_max, avec N_max = ${nf(o.N1,0)} tr/min (R·I et frottements négligés). Pour α = ${o.a} %, la moyenne de 5 essais donne N_mes = ${nf(o.Nx,0)} tr/min ; la dispersion des essais est de ± ${o.disp} %.`;
  return [{ctx,q:"Quelle vitesse le modèle prévoit-il pour ce rapport cyclique ?",type:"num",ans:o.Nm,tolR:0.02,unit:"tr/min",
      expl:`${F("N = α·N_max")} = ${nf(o.a/100,2)} × ${nf(o.N1,0)} = ${U(o.Nm,"tr/min")}.`},
    {ctx,q:"Calcule l'écart relatif entre la mesure et le modèle, en % (référence : valeur du modèle).",type:"num",ans:o.er,tolR:0.03,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|N_mes − N_modèle|","N_modèle")} × 100`)} = ${FRAC(`|${nf(o.Nx,0)} − ${nf(o.Nm,0)}|`,nf(o.Nm,0))} × 100 = ${U(o.er,"%")}.`},
    {ctx:ctx+` Écart relatif : ${nf(o.er,1)} %.`,q:"Que conclure ?",type:"ch",ch:["Les essais ne mettent pas le modèle en défaut","Les essais mettent le modèle en défaut"],ok:ok?0:1,
      expl:ok?`L'écart (${nf(o.er,1)} %) est inférieur à la dispersion des essais (± ${o.disp} %) : les essais ne mettent pas le modèle en défaut.`:`L'écart (${nf(o.er,1)} %) dépasse la dispersion des essais (± ${o.disp} %) : le modèle est mis en défaut. La mesure est plus faible que prévu : la chute R·I et les frottements, négligés, ne le sont pas ici.`}]; },
/* résolution d'une consigne MLI sur 8 bits */
()=>{ const tgt=Math.random()<0.5, o=draw(()=>({N1:rnd([3000,4500,6000,9000,12000]),req:rnd([10,15,20,25,30,40,50])}),o=>far(o.N1/255,o.req,0.12)&&(o.N1/255<=o.req)===tgt);
  const d8=o.N1/255, d10=o.N1/1023, ok=d8<=o.req;
  const ctx=`La vitesse d'une broche de perceuse à colonne est réglée par une MLI sur 8 bits (analogWrite, n de 0 à 255). À n = 255, elle tourne à ${nf(o.N1,0)} tr/min, et sa vitesse est proportionnelle à n.`;
  return [{ctx,q:"De combien la vitesse change-t-elle quand n augmente d'une unité, en tr/min ?",type:"num",ans:d8,tolR:0.02,unit:"tr/min",
      expl:`255 pas séparent l'arrêt de la vitesse maximale : ${F(`ΔN = ${FRAC("N_max","255")}`)} = ${FRAC(nf(o.N1,0),"255")} = ${U(d8,"tr/min")}.`},
    {ctx,q:`Le cahier des charges impose de pouvoir régler la vitesse par pas de ${o.req} tr/min au plus. Est-ce possible ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(d8)} tr/min ${ok?"≤":">"} ${o.req} tr/min : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite avec 8 bits."}`},
    {ctx,q:"Avec une MLI sur 10 bits (n de 0 à 1 023), quel serait ce pas de réglage ?",type:"num",ans:d10,tolR:0.02,unit:"tr/min",
      expl:`${F(`ΔN = ${FRAC("N_max","1 023")}`)} = ${FRAC(nf(o.N1,0),"1 023")} = ${U(d10,"tr/min")} : quatre fois plus fin qu'avec 8 bits.`}]; },
/* repérer l'erreur dans une résolution */
()=>{ const v=rnd([0,1,2,3,4]); let ctx, st, bad, why;
  if(v===0){ const n=rnd([102,153,204]), Ub=rnd([12,24]);
    ctx=`Tension moyenne appliquée par un hacheur sous ${Ub} V, commandé par analogWrite(broche, ${n}).`;
    st=[`La MLI est codée par n = ${n}.`,`α = ${FRAC(n,"1 023")} = ${nf(n/1023,3)}`,`⟨u⟩ = α·U = ${nf(n/1023,3)} × ${Ub} = ${nf(n/1023*Ub,2)} V`]; bad=1;
    why=`analogWrite travaille sur 8 bits : α = ${FRAC(n,"255")} = ${nf(n/255,3)}, d'où ⟨u⟩ = ${nf(n/255*Ub,2)} V. 1 023 correspond à un CAN 10 bits, pas à la MLI.`; }
  else if(v===1){ const a=rnd([0.4,0.6,0.75]), Ub=rnd([12,24]);
    ctx=`Tension moyenne en sortie d'un hacheur alimenté sous ${Ub} V avec α = ${nf(a,2)}.`;
    st=[`⟨u⟩ = ${FRAC("U","α")}`,`⟨u⟩ = ${FRAC(Ub,nf(a,2))} = ${nf(Ub/a,1)} V`,`Le moteur reçoit ${nf(Ub/a,1)} V en moyenne.`]; bad=0;
    why=`${F("⟨u⟩ = α·U")} = ${nf(a,2)} × ${Ub} = ${nf(a*Ub,1)} V. Un hacheur série ne peut pas dépasser la tension de sa source : un résultat supérieur à ${Ub} V est impossible.`; }
  else if(v===2){ const a=rnd([35,60,80]), Ub=rnd([12,48]);
    ctx=`Tension moyenne en sortie d'un hacheur alimenté sous ${Ub} V avec un rapport cyclique de ${a} %.`;
    st=[`α = ${a} %`,`⟨u⟩ = α·U = ${a} × ${Ub} = ${nf(a*Ub,0)} V`,`Le moteur reçoit ${nf(a*Ub,0)} V en moyenne.`]; bad=1;
    why=`α doit être écrit en valeur décimale : α = ${nf(a/100,2)}, d'où ⟨u⟩ = ${nf(a/100,2)} × ${Ub} = ${nf(a/100*Ub,1)} V.`; }
  else if(v===3){ const f=rnd([20,25,40]);
    ctx=`Période d'un signal MLI de fréquence ${f} kHz.`;
    st=[`T = ${FRAC("1","f")}`,`T = ${FRAC("1",nf(f*1000,0))} = ${nf(0.1/f,4)} ms`,`Le motif se répète toutes les ${nf(0.1/f,4)} ms.`]; bad=1;
    why=`${FRAC("1",nf(f*1000,0))} = ${sci(1/(f*1000),2)} s, soit ${nf(1/f,3)} ms (${nf(1000/f,0)} µs) : l'élève s'est trompé d'un facteur 10 dans la conversion.`; }
  else { const f=rnd([2,4,5]), a=rnd([0.3,0.35,0.45]), T=1000/f;
    ctx=`Durée de conduction du transistor d'un hacheur (f = ${f} kHz, α = ${nf(a,2)}).`;
    st=[`T = ${FRAC("1","f")} = ${FRAC("1",nf(f*1000,0))} = ${nf(T,0)} µs`,`t_on = α·T = ${nf(a,2)} × ${nf(T,0)} = ${nf(a*T,0)} µs`,`Le transistor conduit ${nf(a*T,0)} ms à chaque période.`]; bad=2;
    why=`Les étapes 1 et 2 sont justes : t_on = ${nf(a*T,0)} µs, soit ${nf(a*T/1000,3)} ms. L'élève a changé d'unité sans convertir.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* onduleur à bord : puissance et courant de la batterie, autonomie */
()=>{ const tgt=Math.random()<0.5, APP=[["une perceuse",600,[0.5,1,1.5]],["un climatiseur mobile",900,[1,2,3]],["un réfrigérateur 230 V",150,[5,8,12,24]],["un ordinateur portable",90,[3,5,8,12]],["un téléviseur",120,[2,3,5,8]]];
  const o=draw(()=>{ const app=rnd(APP); return {app,eta:rnd([0.85,0.88,0.9,0.92]),Ub:rnd([12,24]),Q:rnd([100,150,200,220]),t:rnd(app[2])}; },
    o=>{ const I=o.app[1]/o.eta/o.Ub, tt=0.5*o.Q/I; return far(tt,o.t,0.1)&&(tt>=o.t)===tgt&&I<=100; });
  const Pb=o.app[1]/o.eta, I=Pb/o.Ub, tt=0.5*o.Q/I, ok=tt>=o.t;
  const ctx=`À bord d'un catamaran, un onduleur (rendement ${nf(o.eta,2)}) alimente ${o.app[0]} de ${o.app[1]} W sous 230 V à partir de la batterie de ${o.Ub} V. La batterie (${o.Q} Ah) ne doit pas être déchargée à plus de 50 %.`;
  return [{ctx,q:"Quelle puissance la batterie fournit-elle à l'onduleur ?",type:"num",ans:Pb,tolR:0.02,unit:"W",
      expl:`${F(`P_bat = ${FRAC("P_appareil","η")}`)} = ${FRAC(o.app[1],nf(o.eta,2))} = ${U(Pb,"W")}.`},
    {ctx,q:"Quelle intensité la batterie débite-t-elle ?",type:"num",ans:I,tolR:0.02,unit:"A",
      expl:`${F(`I = ${FRAC("P_bat","U_bat")}`)} = ${FRAC(nf(Pb,1),o.Ub)} = ${U(I,"A")}. Sous basse tension, le courant est élevé : il faut des câbles de forte section.`},
    {ctx:ctx+` I = ${S3(I)} A.`,q:`Peut-on utiliser l'appareil pendant ${nf(o.t,1)} h d'affilée ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`Charge utilisable : 50 % × ${o.Q} = ${nf(0.5*o.Q,0)} Ah. ${F(`Δt = ${FRAC("Q_u","I")}`)} = ${FRAC(nf(0.5*o.Q,0),S3(I))} = ${nf(tt,2)} h ${ok?"≥":"<"} ${nf(o.t,1)} h : ${ok?"c'est possible.":"ce n'est pas possible sans décharger la batterie au-delà de 50 %."}`}]; },
/* rhéostat ou hacheur : pertes et rendement */
()=>{ const Ub=rnd([12,24]), x=rnd([0.4,0.5,0.6,0.75]), I=rnd([1,1.5,2,3,4]), Um=x*Ub, R=(Ub-Um)/I, Pl=(Ub-Um)*I, eh=rnd([0.94,0.95,0.96]);
  const ctx=`Pour faire tourner au ralenti le moteur d'un tapis roulant, il faut lui appliquer ${nf(Um,1)} V sous ${nf(I,1)} A, à partir d'une alimentation de ${Ub} V. Solution 1 : une résistance en série (rhéostat). Solution 2 : un hacheur de rendement ${nf(eh,2)}.`;
  return [{ctx,q:"Quelle résistance faut-il placer en série avec le moteur (solution 1) ?",type:"num",ans:R,tolR:0.02,unit:"Ω",
      expl:`La résistance doit absorber U − U_m = ${Ub} − ${nf(Um,1)} = ${nf(Ub-Um,1)} V sous ${nf(I,1)} A : ${F(`R = ${FRAC("U − U_m","I")}`)} = ${FRAC(nf(Ub-Um,1),nf(I,1))} = ${U(R,"Ω")}.`},
    {ctx,q:"Quelle puissance cette résistance dissipe-t-elle en chaleur ?",type:"num",ans:Pl,tolR:0.02,unit:"W",
      expl:`${F("P = (U − U_m)·I")} = ${nf(Ub-Um,1)} × ${nf(I,1)} = ${U(Pl,"W")}, tandis que le moteur reçoit U_m·I = ${nf(Um*I,1)} W : le rendement de la solution 1 vaut ${FRAC("U_m","U")} = ${nf(x*100,0)} %.`},
    {ctx,q:"Quelle solution choisir ?",type:"ch",...mc(`Le hacheur : il ne perd qu'environ ${nf((1-eh)*100,0)} % de la puissance, contre ${nf((1-x)*100,0)} % pour la résistance`,["La résistance : elle est plus simple et elle a le même rendement","La résistance : un hacheur ne peut pas abaisser une tension continue","Les deux se valent, car le moteur reçoit la même puissance"]),
      expl:`Le rhéostat gaspille en chaleur toute la tension qu'il retranche (${nf((1-x)*100,0)} % de la puissance fournie). Le hacheur, lui, découpe la tension sans dissiper d'énergie (transistor bloqué ou saturé) : rendement ${nf(eh,2)}. C'est pour cela qu'on module l'énergie avec des convertisseurs à découpage.`}]; },
/* caractéristique N(α) avec zone morte */
()=>{ const a0=rnd([10,15,20,25]), N1=rnd([2000,2400,3000,3600]), N=rnd([0.3,0.4,0.5,0.6,0.7])*N1, a=a0+(100-a0)*N/N1;
  const fig=fx_cv_nalpha({a0,N1}), ctx=`La courbe donne la vitesse mesurée du moteur d'un convoyeur en fonction du rapport cyclique de son hacheur : au-delà du démarrage, la courbe est une droite qui atteint ${nf(N1,0)} tr/min pour α = 100 %.`;
  return [{fig,ctx,q:"À partir de quel rapport cyclique le moteur commence-t-il à tourner, en % ?",type:"num",ans:a0,tolA:2,unit:"%",
      expl:`On lit l'abscisse où la courbe quitte l'axe horizontal : ${F(`α_0 = ${a0} %`)}. En dessous, le moteur reste immobile.`},
    {fig,ctx:ctx+` Le démarrage a lieu à α_0 = ${a0} %.`,q:`Quel rapport cyclique faut-il pour obtenir ${nf(N,0)} tr/min, en % ?`,type:"num",ans:a,tolR:0.02,unit:"%",
      expl:`La droite passe par (${a0} % ; 0) et (100 % ; ${nf(N1,0)} tr/min) : ${F(`N = N_max·${FRAC("α − α_0","100 − α_0")}`)}, donc α = α_0 + (100 − α_0)·${FRAC("N","N_max")} = ${a0} + ${100-a0} × ${FRAC(nf(N,0),nf(N1,0))} = ${U(a,"%")}. Le modèle N = α·N_max aurait donné ${nf(N/N1*100,0)} %.`},
    {fig,ctx,q:"Pourquoi le moteur ne tourne-t-il pas pour les petits rapports cycliques ?",type:"ch",...mc("Le couple moteur, proportionnel au courant, reste trop faible pour vaincre les frottements secs",["Le hacheur ne fonctionne pas en dessous de α_0","La fréquence de découpage est trop faible à petit rapport cyclique","La batterie ne fournit pas de courant quand α est petit"]),
      expl:`À petit α, la tension moyenne est faible, le courant aussi, donc le couple C = k·I : il ne suffit pas à vaincre les frottements secs (et le couple résistant de la charge). Le modèle « vitesse proportionnelle à α » n'est valable qu'au-delà du démarrage.`}]; }
];

POOLS["ener-convertisseur"]={
  titre:"Hacheur, MLI et onduleur",
  fiche:{t:"Convertisseurs : moduler l'énergie",l:[
    `Hacheur série : ${F("⟨u⟩ = α·U")} avec ${F(`α = ${FRAC("t_on","T")}`)}, entre 0 et 1 ; fréquence de découpage ${F(`f = ${FRAC("1","T")}`)}.`,
    `MLI sur 8 bits : analogWrite(broche, n) avec n de 0 à 255, donc ${F(`α = ${FRAC("n","255")}`)} ; la période ne change pas, seule la largeur des impulsions varie.`,
    `Moteur à courant continu, R·I négligée : ${F("E = k·Ω ≈ α·U")}, donc ${F("N = α·N_max")} ; pont en H : une diagonale fermée, l'autre diagonale inverse le sens.`,
    `Onduleur : continu → alternatif ; redresseur : alternatif → continu ; hacheur : continu → continu ; rendement ${F(`η = ${FRAC("P_s","P_e")}`)}, élevé car les transistors commutent.`,
    `Pièges : α en % au lieu du décimal, 255 et non 256 ou 1 023, T en secondes, deux interrupteurs d'un même bras fermés (court-circuit), puissance d'une résistance α·${FRAC("U²","R")} et non ${FRAC("⟨u⟩²","R")}.`]},
  count:{1:4,2:4,3:3},1:CV1,2:CV2,3:CV3
};

/* ======================================================================
   CIRCUITS RC, CONDENSATEUR, CHAMP ÉLECTRIQUE — phy-electricite
   ====================================================================== */
const QE=1.6e-19, ME=9.11e-31, EPS0=8.85e-12, CLUM=3e8;
const cE=`e = 1,60 × ${p10(-19)} C`, cEPS=`ε<sub>0</sub> = 8,85 × ${p10(-12)} F/m`;
const EXPC=`u_C(t) = E·(1 − e<sup>−${FRAC("t","τ")}</sup>)`, EXPD=`u_C(t) = E·e<sup>−${FRAC("t","τ")}</sup>`;
const n2=x=>Number(x.toPrecision(2));
/* valeur en unités SI écrite en puissance de dix, cohérente avec la valeur affichée à 3 chiffres significatifs (x dans l'unité affichée, f : facteur vers l'unité SI) */
const sciR=(x,f)=>sci(Number(x.toPrecision(3))*f,2);
/* durée en secondes : écriture décimale au-delà d'une seconde */
const fS=t=>t>=1?`${nf(t,2)} s`:`${sci(t,2)} s`;
/* valeur intermédiaire à 4 chiffres significatifs */
const S4=x=>Number(x.toPrecision(4)).toLocaleString("fr-FR",{maximumFractionDigits:6});
/* axes d'une courbe u_C(t) : τ tombe sur une graduation, 5τ reste visible. [τ, pas des étiquettes, pas de la grille, fin de l'axe] */
const TAXE=[[1,1,0.5,6],[1.5,1,0.5,8],[2,2,1,12],[3,2,1,18],[4,5,1,25],[5,5,1,30],[6,10,2,40],[8,10,2,50]];
const pickAx=ks=>{ const r=rnd(TAXE), k=rnd(ks); return {tau:r[0]*k,xs:r[1]*k,xm:r[2]*k,x1:r[3]*k}; };
const yAx=E=>{ const ys=niceStep(E*1.15,7); return {y1:Math.ceil(E*1.15/ys-1e-9)*ys,ys,ym:ys/2}; };
/* durée affichée en ms (τ < 1 s) ou en s */
const tU=t=>t<1?{v:t*1000,u:"ms"}:{v:t,u:"s"};
const elC=t=>t.charAt(0).toLowerCase()+t.slice(1);

const RC1=[
/* q = C·u : charge, capacité ou tension */
()=>{ const v=rnd([0,1,2]);
  if(v===0){ const o=draw(()=>({C:rnd([47,100,220,470,1000,2200,4700]),u:rnd([5,9,12,16,24,25,35,50])}),o=>o.C*o.u>=500&&o.C*o.u<=60000), q=o.C*o.u/1000;
    return {q:`Un condensateur de capacité C = ${fC(o.C*1e-6)} est chargé sous la tension u = ${o.u} V. Calcule la charge q portée par son armature positive, en mC.`,type:"num",ans:q,tolR:0.02,unit:"mC",
      expl:`${F("q = C·u")} avec C en farads : q = ${nf(o.C,0)} × ${p10(-6)} × ${o.u} = ${sci(q/1000,2)} C, soit ${U(q,"mC")}. L'armature négative porte la charge opposée, −q.`}; }
  if(v===1){ const Cv=rnd([47,100,220,330,470,680,1000]), u=rnd([5,6,9,10,12,15]), q=Cv*u/1000;
    return {q:`Aux bornes d'un condensateur chargé, on mesure u = ${u} V ; son armature positive porte la charge q = ${nf(q,3)} mC. Calcule sa capacité C, en µF.`,type:"num",ans:Cv,tolR:0.02,unit:"µF",
      expl:`${F(`C = ${FRAC("q","u")}`)} = ${FRAC(`${sci(q/1000,2)} C`,`${u} V`)} = ${sci(Cv*1e-6,2)} F, soit ${U(Cv,"µF")}.`}; }
  const Cv=rnd([1,5,10,22,50,100]), u=rnd([1.2,1.5,1.8,2,2.2,2.5,2.7]), q=Cv*u;
  return {q:`Un supercondensateur de capacité C = ${Cv} F porte une charge q = ${nf(q,2)} C. Quelle est la tension à ses bornes ?`,type:"num",ans:u,tolR:0.02,unit:"V",
    expl:`${F(`u = ${FRAC("q","C")}`)} = ${FRAC(nf(q,2),Cv)} = ${U(u,"V")}. Un supercondensateur a une capacité énorme (plusieurs farads), mais chaque élément ne supporte qu'environ 2,7 V.`}; },
/* conversions d'unités de capacité */
()=>{ const [pn,ex]=rnd([["mF",-3],["µF",-6],["nF",-9],["pF",-12]]), m=rnd([1,2.2,4.7,10,22,47,100,220,470]), v=m*10**ex;
  const PFX=`1 mF = ${p10(-3)} F ; 1 µF = ${p10(-6)} F ; 1 nF = ${p10(-9)} F ; 1 pF = ${p10(-12)} F`;
  if(Math.random()<0.5){ const opts=[v,v*1000,v/1000,v*10].map(x=>`${sci(x,2)} F`);
    return {q:`Quelle est l'écriture en farads d'une capacité C = ${nf(m,1)} ${pn} ?`,type:"ch",...mc(opts[0],opts.slice(1)),
      expl:`1 ${pn} = ${p10(ex)} F, donc C = ${nf(m,1)} × ${p10(ex)} F = ${F(`${sci(v,2)} F`)}. Rappel : ${PFX}.`}; }
  const opts=[v,v*10,v/10,v*1000].map(x=>fC(x));
  return {q:`Un condensateur porte l'indication C = ${sci(v,2)} F. Quelle écriture avec un préfixe lui correspond ?`,type:"ch",...mc(opts[0],opts.slice(1)),
    expl:`${sci(v,2)} F = ${F(fC(v))}. Rappel : ${PFX}.`}; },
/* constante de temps τ = R·C */
()=>{ const o=draw(()=>({R:rnd([1e3,2.2e3,4.7e3,10e3,22e3,47e3,100e3,220e3,470e3,1e6]),C:rnd([100e-9,220e-9,470e-9,1e-6,2.2e-6,4.7e-6,10e-6,22e-6,47e-6,100e-6,220e-6,470e-6,1e-3])}),o=>{ const t=o.R*o.C; return t>=1e-3&&t<=100; });
  const tau=o.R*o.C, d=tU(tau);
  return {fig:fx_rc_circ({mode:"k",closed:false,u:"u_C",lab:{E:"E",R:`R = ${fR(o.R)}`,C:`C = ${fC(o.C)}`}}),q:`Calcule la constante de temps τ de ce circuit RC, en ${d.u}.`,type:"num",ans:d.v,tolR:0.02,unit:d.u,
    expl:`${F("τ = R·C")} avec R en ohms et C en farads : τ = ${fRs(o.R)} × ${fCs(o.C)} = ${sci(tau,2)} s${d.u==="ms"?`, soit ${U(d.v,"ms")}`:` = ${U(d.v,"s")}`}. Des ohms multipliés par des farads donnent des secondes.`}; },
/* cours : repères de la charge et de la décharge */
()=>{ const C=rnd([
    {q:"Un condensateur initialement déchargé se charge sous la tension E à travers une résistance R. Quelle fraction de E la tension u_C atteint-elle à l'instant t = τ ?",ok:"63 % de E",w:["37 % de E","50 % de E","99 % de E"],
      e:`${F("u_C(τ) = E·(1 − e<sup>−1</sup>)")} = 0,63·E : à t = τ, le condensateur est chargé à 63 %. C'est la « méthode des 63 % » pour lire τ sur une courbe de charge.`},
    {q:"Pendant la charge d'un condensateur à travers une résistance, au bout de quelle durée considère-t-on que u_C a atteint sa valeur finale (plus de 99 % de E) ?",ok:"5τ",w:["τ","2τ","3τ"],
      e:`u_C(5τ) = E·(1 − e<sup>−5</sup>) = 0,993·E : la charge est terminée à ${F("t = 5τ")}. À τ, 2τ et 3τ, u_C n'atteint que 63 %, 86 % et 95 % de E.`},
    {q:"Un condensateur chargé sous la tension E se décharge dans une résistance R. Que vaut la tension u_C à l'instant t = τ ?",ok:"37 % de E",w:["63 % de E","50 % de E","0 V"],
      e:`${F("u_C(τ) = E·e<sup>−1</sup>")} = 0,37·E : à t = τ, il ne reste que 37 % de la tension initiale.`}]);
  return {q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; },
/* cours : comportement du condensateur */
()=>{ const C=rnd([
    {q:"Le condensateur d'un circuit RC est complètement chargé sous une tension continue. Que vaut alors l'intensité du courant qui le traverse ?",ok:"i = 0 : le condensateur se comporte comme un interrupteur ouvert",w:[`i = ${FRAC("E","R")}, comme pour une résistance seule`,"i = C·E","i est négatif : le condensateur renvoie du courant au générateur"],
      e:`${F(`i = C·${FRAC("du_C","dt")}`)} : une fois la charge terminée, u_C ne varie plus, donc i = 0. En régime continu établi, un condensateur ne laisse pas passer le courant.`},
    {q:"Le condensateur est initialement déchargé. Que vaut la tension u_C juste après la fermeture de l'interrupteur ?",ok:"0 V : la tension aux bornes d'un condensateur ne peut pas varier brusquement",w:["E : le condensateur se charge instantanément","63 % de E",`${FRAC("E","2")} : la tension se partage entre R et C`],
      e:`La charge q = C·u_C ne peut pas varier instantanément (il faudrait un courant infini) : ${F("u_C(0) = 0")}. Toute la tension E est alors aux bornes de R : le courant ${FRAC("E","R")} est maximal au début de la charge.`},
    {q:"Quelle est l'unité de la constante de temps τ = R·C d'un circuit RC ?",ok:"La seconde (s)",w:["Le farad (F)","L'ohm (Ω)","Le coulomb (C)"],
      e:`R = ${FRAC("u","i")} et C = ${FRAC("q","u")}, donc R·C = ${FRAC("q","i")}. Or une charge est un courant multiplié par une durée : ${F("R·C")} s'exprime en ${F("secondes")}.`},
    {q:"Quelle relation lie l'intensité i du courant qui traverse un condensateur (convention récepteur) à la tension u_C à ses bornes ?",ok:`i = C·${FRAC("du_C","dt")}`,w:["i = C·u_C",`i = ${FRAC("u_C","C")}`,`i = ${FRAC("C","u_C")}`],
      e:`La charge vaut q = C·u_C et l'intensité est le débit de charge, ${F(`i = ${FRAC("dq","dt")}`)}, d'où ${F(`i = C·${FRAC("du_C","dt")}`)} : le courant est proportionnel à la vitesse de variation de la tension.`},
    {q:"Dans un circuit RC, on double la valeur de la résistance R sans changer le condensateur. Que devient la durée de la charge ?",ok:"Elle double",w:["Elle est divisée par 2","Elle ne change pas","Elle est multipliée par 4"],
      e:`La charge dure environ 5τ = 5·R·C : elle est ${F("proportionnelle à R")}. Avec une résistance deux fois plus grande, le courant est deux fois plus faible et le condensateur met deux fois plus de temps à se charger.`}]);
  return {q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; },
/* lecture de τ : méthode des 63 % */
()=>{ const un=rnd(["ms","s"]), a=pickAx(un==="s"?[1,10]:[1,10,100]), E=rnd([5,6,9,10,12]), y=yAx(E);
  const fig=fx_rc_courbe({E,tau:a.tau,x1:a.x1,xs:a.xs,xm:a.xm,...y,xd:0,yd:1,asy:true,l63:true,xl:`t (${un})`});
  return {fig,ctx:`Courbe de charge d'un condensateur sous la tension E = ${E} V : ${EXPC}.`,q:`Détermine graphiquement la constante de temps τ du circuit, en ${un}.`,type:"num",ans:a.tau,tolA:a.xm/4,tolR:0.1,unit:un,
    expl:`À t = τ, ${F("u_C = 0,63·E")} = 0,63 × ${E} = ${nf(0.63*E,2)} V (trait « 63 % de E »). L'abscisse du point de la courbe d'ordonnée ${nf(0.63*E,2)} V donne τ ≈ ${U(a.tau,un)}.`}; },
/* énergie stockée : W = ½·C·u² */
()=>{ const S=rnd([
    {d:"le condensateur du flash d'un appareil photo",C:[100e-6,150e-6,220e-6,330e-6],u:[300,330,350],mj:false},
    {d:"le condensateur de filtrage d'un variateur de vitesse",C:[470e-6,1e-3,2.2e-3],u:[300,400,560],mj:false},
    {d:"le supercondensateur de secours d'un enregistreur de données",C:[10,25,50,100],u:[2.5,2.7],mj:false},
    {d:"le condensateur de découplage d'une carte électronique",C:[10e-6,47e-6,100e-6],u:[3.3,5,12],mj:true}]);
  const C=rnd(S.C), u=rnd(S.u), W=0.5*C*u*u, un=S.mj?"mJ":"J", val=S.mj?W*1000:W;
  return {q:`Calcule l'énergie stockée par ${S.d} : C = ${fC(C)}, chargé sous ${nf(u,1)} V${S.mj?". Réponse en mJ":""}.`,type:"num",ans:val,tolR:0.02,unit:un,
    expl:`${F("W = ½·C·u²")} avec C en farads : W = 0,5 × ${fCs(C)} × ${nf(u,1)}² = ${S.mj?`${sci(W,2)} J, soit ${U(val,"mJ")}`:U(W,"J")}. L'énergie croît comme le carré de la tension : doubler u multiplie W par 4.`}; },
/* i = C·du/dt : tension qui varie régulièrement */
()=>{ if(Math.random()<0.5){ const C=rnd([10,25,50,100,350]), r=rnd([0.02,0.05,0.1,0.2]), I=C*r;
    return {ctx:`Un supercondensateur de capacité C = ${C} F est chargé à courant constant : sa tension augmente régulièrement de ${nf(r,2)} V par seconde.`,q:"Calcule l'intensité du courant de charge.",type:"num",ans:I,tolR:0.02,unit:"A",
      expl:`${F(`i = C·${FRAC("du","dt")}`)} avec ${FRAC("du","dt")} = ${nf(r,2)} V/s : i = ${C} × ${nf(r,2)} = ${U(I,"A")}. Une tension qui croît régulièrement correspond à un courant constant.`}; }
  const C=rnd([100,220,470,1000]), r=rnd([10,20,50,100,200]), I=C*r/1000;
  return {ctx:`Pendant la charge d'un condensateur de ${C} µF, la tension à ses bornes augmente de ${r} V par seconde.`,q:"Quelle est, à cet instant, l'intensité du courant qui le traverse, en mA ?",type:"num",ans:I,tolR:0.02,unit:"mA",
    expl:`${F(`i = C·${FRAC("du","dt")}`)} = ${fCs(C*1e-6)} × ${r} = ${sci(I/1000,2)} A, soit ${U(I,"mA")}.`}; },
/* champ électrique uniforme : E = U/d */
()=>{ const S=rnd([
    {d:"Entre les deux armatures d'un condensateur plan de TP",U:[6,12,24],dd:[2,4,5],du:"mm"},
    {d:"Entre les plaques de déviation d'un oscilloscope analogique",U:[50,100,200],dd:[5,10],du:"mm"},
    {d:"Entre les électrodes planes d'un dépoussiéreur électrostatique de cheminée",U:[20000,30000,40000],dd:[10,15,20],du:"cm"},
    {d:"Entre les plaques de déviation d'une imprimante à jet d'encre",U:[1000,1500,2000],dd:[1.5,2,3],du:"mm"}]);
  const Uv=rnd(S.U), dv=rnd(S.dd), dm=S.du==="mm"?dv/1000:dv/100, E=Uv/dm, kv=E>=1e5, val=kv?E/1000:E;
  return {fig:fx_rc_champ({p1:"+",lines:true,U:"U",d:"d"}),q:`${S.d}, la tension vaut U = ${nf(Uv,0)} V et la distance entre les plaques d = ${nf(dv,1)} ${S.du}. Calcule la valeur du champ électrique, supposé uniforme, en ${kv?"kV/m":"V/m"}.`,type:"num",ans:val,tolR:0.02,unit:kv?"kV/m":"V/m",
    expl:`${F(`E = ${FRAC("U","d")}`)} avec d en mètres (${nf(dv,1)} ${S.du} = ${nf(dm,4)} m) : E = ${FRAC(nf(Uv,0),nf(dm,4))} = ${kv?`${nf(E,0)} V/m, soit ${U(val,"kV/m")}`:U(E,"V/m")}. Le champ est dirigé de la plaque + vers la plaque −.`}; },
/* sens de la force électrique sur une particule chargée */
()=>{ const P=rnd([["un électron",-1],["un proton",1],["un ion positif",1],["une goutte d'encre chargée négativement",-1],["une poussière chargée positivement",1]]);
  const top=rnd(["+","−"]), nums=shuffle([1,2,3,4]), Edown=top==="+", fDown=(P[1]>0)===Edown, k=fDown?2:0;
  return {fig:fx_rc_champ({p1:top,lines:true,pt:{s:P[1]>0?"+":"−"},num:nums}),ctx:`${cap1(P[0])} se trouve entre deux plaques chargées ; les lignes du champ électrique ${V("E")} sont représentées.`,
    q:"Quelle flèche représente le sens de la force électrique subie par la particule ?",type:"ch",ch:["Flèche 1","Flèche 2","Flèche 3","Flèche 4"],ok:nums[k]-1,
    expl:`${V("E")} est dirigé de la plaque + vers la plaque −, ici vers le ${Edown?"bas":"haut"}. ${F(`${V("F")} = q·${V("E")}`)} : ${P[1]>0?"la charge est positive, la force a le sens du champ":"la charge est négative, la force est de sens opposé au champ"}. Elle est dirigée vers le ${fDown?"bas":"haut"}, vers la plaque ${P[1]>0?"−":"+"} : flèche ${nums[k]}.`}; },
/* valeur de la force électrique : F = |q|·E */
()=>{ const P=rnd([["Un électron","−e",1],["Un proton","+e",1],["Un ion calcium Ca²⁺","+2e",2],["Un ion oxyde O²⁻","−2e",2]]), E=rnd([1.5,2,2.5,4,5,8])*10**rnd([3,4,5]), q=P[2]*QE, Fe=q*E;
  const opts=[Fe,q/E,E/q,q].map(x=>`${sci(x,2)} N`);
  return {ctx:`${P[0]}, de charge q = ${P[1]}, est placé dans un champ électrique uniforme de valeur E = ${sci(E,1)} V/m. Charge élémentaire : ${cE}.`,
    q:"Quelle est la valeur de la force électrique qu'il subit ?",type:"ch",...mc(opts[0],opts.slice(1)),
    expl:`${F("F = |q|·E")} = ${P[2]===2?"2 × ":""}1,60 × ${p10(-19)} × ${sci(E,1)} = ${F(`${sci(Fe,2)} N`)}. Une force minuscule, mais la masse de la particule l'est encore bien plus : son accélération est énorme.`}; },
/* condensateur plan et capteurs capacitifs : sens de variation de C */
()=>{ const C=rnd([
    {q:"Pour augmenter la capacité d'un condensateur plan, que faut-il faire ?",ok:"Rapprocher les armatures (diminuer e)",w:["Éloigner les armatures (augmenter e)","Diminuer la surface S des armatures","Augmenter la tension appliquée"],niv:false,
      e:`${F(`C = ${FRAC("ε·S","e")}`)} : C augmente si les armatures sont plus grandes ou plus proches, ou si l'isolant a une permittivité plus grande. C ne dépend pas de la tension appliquée.`},
    {q:"Dans un capteur capacitif de niveau, deux électrodes plongent dans un réservoir. L'eau a une permittivité environ 80 fois plus grande que celle de l'air. Quand le niveau d'eau monte, que fait la capacité mesurée ?",ok:"Elle augmente",w:["Elle diminue","Elle ne change pas","Elle devient nulle"],niv:true,
      e:`Sur la partie immergée des électrodes, l'isolant est de l'eau, de permittivité bien plus grande que l'air : ${F(`C = ${FRAC("ε·S","e")}`)} augmente avec la hauteur d'eau. La mesure de C donne le niveau.`},
    {q:"Dans un capteur de pression capacitif, la pression rapproche une membrane de l'électrode fixe : l'épaisseur e d'air diminue. Que devient la capacité ?",ok:"Elle augmente",w:["Elle diminue","Elle ne change pas","Elle devient nulle"],niv:false,
      e:`${F(`C = ${FRAC("ε·S","e")}`)} : quand e diminue, C augmente. La mesure de C renseigne donc sur la pression.`},
    {q:"On double à la fois la surface S des armatures et l'épaisseur e de l'isolant d'un condensateur plan. Que devient sa capacité ?",ok:"Elle ne change pas",w:["Elle double","Elle est multipliée par 4","Elle est divisée par 2"],niv:false,
      e:`${F(`C = ${FRAC("ε·S","e")}`)} : doubler S multiplie C par 2, doubler e la divise par 2 ; les deux effets se compensent.`}]);
  return {fig:C.niv?fx_rc_niveau({k:0.45}):fx_rc_plan({e:true}),ctx:`La capacité d'un condensateur plan vaut C = ${FRAC("ε·S","e")} : S, surface des armatures en regard ; e, épaisseur de l'isolant ; ε, permittivité de l'isolant.`,q:C.q,type:"ch",...mc(C.ok,C.w),expl:C.e}; }
];

const RC2=[
/* τ, durée de la charge, courant initial */
()=>{ const o=draw(()=>({E:rnd([5,9,12,24]),R:rnd([470,1e3,2.2e3,4.7e3,10e3,22e3,47e3,100e3]),C:rnd([10e-6,22e-6,47e-6,100e-6,220e-6,470e-6,1e-3])}),o=>{ const t=o.R*o.C; return t>=5e-3&&t<=20&&o.E/o.R>=1e-4; });
  const tau=o.R*o.C, d=tU(tau), I0=o.E/o.R*1000;
  const fig=fx_rc_circ({mode:"k",closed:true,u:"u_C",i:"i",lab:{E:`E = ${o.E} V`,R:`R = ${fR(o.R)}`,C:`C = ${fC(o.C)}`}});
  const ctx="Le condensateur, initialement déchargé, se charge à travers la résistance R dès la fermeture de l'interrupteur K.";
  return [{fig,ctx,q:`Calcule la constante de temps τ du circuit, en ${d.u}.`,type:"num",ans:d.v,tolR:0.02,unit:d.u,
      expl:`${F("τ = R·C")} = ${fRs(o.R)} × ${fCs(o.C)} = ${d.u==="ms"?`${sci(tau,2)} s = ${U(d.v,"ms")}`:U(d.v,"s")}.`},
    {fig,ctx:ctx+` τ = ${S3(d.v)} ${d.u}.`,q:`Au bout de combien de temps peut-on considérer le condensateur comme chargé, en ${d.u} ?`,type:"num",ans:5*d.v,tolR:0.02,unit:d.u,
      expl:`À ${F("t = 5τ")}, u_C dépasse 99 % de E : 5 × ${S3(d.v)} = ${U(5*d.v,d.u)}.`},
    {fig,ctx,q:"Quelle est l'intensité du courant juste après la fermeture de K, en mA ?",type:"num",ans:I0,tolR:0.02,unit:"mA",
      expl:`À t = 0, le condensateur est déchargé : ${F("u_C(0) = 0")}, toute la tension E est aux bornes de R. ${F(`I_0 = ${FRAC("E","R")}`)} = ${FRAC(o.E,nf(o.R,0))} = ${sci(I0/1000,3)} A, soit ${U(I0,"mA")}. Le courant diminue ensuite jusqu'à s'annuler.`}]; },
/* charge : tension à un instant donné */
()=>{ const o=draw(()=>({E:rnd([5,6,9,12]),R:rnd([1e3,2.2e3,4.7e3,10e3,22e3,47e3,100e3]),C:rnd([10e-6,22e-6,47e-6,100e-6,220e-6,470e-6]),k:rnd([0.5,1.5,2,2.5,3,4])}),o=>{ const t=o.R*o.C; return t>=0.01&&t<=10; });
  const tau=o.R*o.C, d=tU(tau), t1=n2(o.k*d.v), x=t1/d.v, u1=o.E*(1-Math.exp(-x));
  const fig=fx_rc_circ({mode:"k",closed:true,u:"u_C",lab:{E:`E = ${o.E} V`,R:`R = ${fR(o.R)}`,C:`C = ${fC(o.C)}`}});
  const ctx=`Le condensateur, initialement déchargé, se charge dès la fermeture de K. La tension à ses bornes s'écrit ${EXPC}, avec τ = R·C.`;
  return [{fig,ctx,q:`Calcule la constante de temps τ, en ${d.u}.`,type:"num",ans:d.v,tolR:0.02,unit:d.u,expl:`${F("τ = R·C")} = ${fRs(o.R)} × ${fCs(o.C)} = ${U(d.v,d.u)}.`},
    {fig,ctx:ctx+` τ = ${S3(d.v)} ${d.u}.`,q:`Calcule la tension u_C à l'instant t = ${nf(t1,2)} ${d.u}.`,type:"num",ans:u1,tolR:0.02,unit:"V",
      expl:`${FRAC("t","τ")} = ${FRAC(nf(t1,2),S3(d.v))} = ${nf(x,3)}, donc ${F(`u_C = ${o.E} × (1 − e<sup>−${nf(x,3)}</sup>)`)} = ${U(u1,"V")}, soit ${nf(u1/o.E*100,0)} % de E.`}]; },
/* décharge : tension restante, puis énergie cédée */
()=>{ const o=draw(()=>({E:rnd([5,9,12,24]),R:rnd([1e3,4.7e3,10e3,47e3,100e3]),C:rnd([100e-6,220e-6,470e-6,1e-3,2.2e-3]),k:rnd([0.5,1,1.5,2,3])}),o=>{ const t=o.R*o.C; return t>=0.05&&t<=50; });
  const tau=o.R*o.C, d=tU(tau), t1=n2(o.k*d.v), x=t1/d.v, u1=o.E*Math.exp(-x), W0=0.5*o.C*o.E**2, W1=0.5*o.C*u1*u1, dW=(W0-W1)*1000;
  const fig=fx_rc_circ({mode:"c",pos:2,u:"u_C",i:"i",lab:{E:"E",R:`R = ${fR(o.R)}`,C:`C = ${fC(o.C)}`}});
  const ctx=`Le condensateur a été chargé sous E = ${o.E} V (K en position 1). À t = 0, on bascule K en position 2 : il se décharge dans R. La tension s'écrit ${EXPD}, avec τ = R·C = ${S3(d.v)} ${d.u}.`;
  return [{fig,ctx,q:`Calcule la tension u_C à l'instant t = ${nf(t1,2)} ${d.u}.`,type:"num",ans:u1,tolR:0.02,unit:"V",
      expl:`${FRAC("t","τ")} = ${FRAC(nf(t1,2),S3(d.v))} = ${nf(x,3)}, donc ${F(`u_C = ${o.E} × e<sup>−${nf(x,3)}</sup>`)} = ${U(u1,"V")}.`},
    {fig,ctx:ctx+` À t = ${nf(t1,2)} ${d.u}, u_C = ${S3(u1)} V.`,q:"Quelle énergie le condensateur a-t-il cédée à la résistance entre 0 et cet instant, en mJ ?",type:"num",ans:dW,tolR:0.02,unit:"mJ",
      expl:`${F("W = ½·C·u²")} : au départ, W_0 = 0,5 × ${fCs(o.C)} × ${o.E}² = ${S3(W0*1000)} mJ ; à cet instant, W = 0,5 × ${fCs(o.C)} × ${S3(u1)}² = ${S3(W1*1000)} mJ. Énergie cédée : ${S3(W0*1000)} − ${S3(W1*1000)} = ${U(dW,"mJ")}, dissipée en chaleur dans R.`}]; },
/* lecture de τ par la tangente à l'origine, puis capacité */
()=>{ const un=rnd(["ms","s"]), a=pickAx(un==="s"?[1,10]:[1,10,100]), E=rnd([5,6,9,10,12]), y=yAx(E), tS=a.tau*(un==="ms"?1e-3:1);
  const R=draw(()=>rnd([100,200,500,1e3,2e3,5e3,10e3,20e3,50e3,100e3,200e3,500e3,1e6]),r=>{ const c=tS/r; return c>=1e-6&&c<=2.2e-3; }), Cv=tS/R;
  const fig=fx_rc_courbe({E,tau:a.tau,x1:a.x1,xs:a.xs,xm:a.xm,...y,xd:0,yd:1,asy:true,tan:true,Elab:"E",xl:`t (${un})`});
  const ctx=`Charge d'un condensateur sous E = ${E} V à travers une résistance R = ${fR(R)} : ${EXPC}. La tangente à la courbe à l'origine est tracée en orange, l'asymptote u_C = E en pointillés.`;
  return [{fig,ctx,q:`La tangente à l'origine coupe l'asymptote à l'instant t = τ. Lis la constante de temps τ, en ${un}.`,type:"num",ans:a.tau,tolA:a.xm/4,tolR:0.1,unit:un,
      expl:`On lit l'abscisse du point où la droite orange atteint la valeur E = ${E} V : τ ≈ ${U(a.tau,un)}. Au départ, u_C croît comme si elle devait atteindre E en une durée τ.`},
    {fig,ctx:ctx+` τ = ${nf(a.tau,1)} ${un}.`,q:"Calcule la capacité C du condensateur, en µF.",type:"num",ans:Cv*1e6,tolR:0.02,unit:"µF",
      expl:`${F(`C = ${FRAC("τ","R")}`)} = ${FRAC(fS(tS),fRs(R))} = ${sciR(Cv*1e6,1e-6)} F, soit ${U(Cv*1e6,"µF")}.`}]; },
/* décharge : lecture de τ (37 %), puis résistance */
()=>{ const un=rnd(["ms","s"]), a=pickAx(un==="s"?[1,10]:[1,10,100]), E=rnd([5,6,9,10,12]), y=yAx(E), tS=a.tau*(un==="ms"?1e-3:1);
  const C=draw(()=>rnd([1e-6,2.2e-6,4.7e-6,10e-6,22e-6,47e-6,100e-6,220e-6,470e-6,1e-3]),c=>{ const r=tS/c; return r>=100&&r<=1e6; }), Rv=tS/C, kO=Rv>=1000;
  const fig=fx_rc_courbe({E,tau:a.tau,dech:true,x1:a.x1,xs:a.xs,xm:a.xm,...y,xd:0,yd:1,l63:true,xl:`t (${un})`});
  const ctx=`Un condensateur de ${fC(C)}, chargé sous E = ${E} V, se décharge à partir de t = 0 dans une résistance R : ${EXPD}.`;
  return [{fig,ctx,q:`Détermine graphiquement la constante de temps τ, en ${un}.`,type:"num",ans:a.tau,tolA:a.xm/4,tolR:0.1,unit:un,
      expl:`À t = τ, ${F("u_C = 0,37·E")} = 0,37 × ${E} = ${nf(0.37*E,2)} V (trait « 37 % de E ») : τ ≈ ${U(a.tau,un)}.`},
    {fig,ctx:ctx+` τ = ${nf(a.tau,1)} ${un}.`,q:`Calcule la résistance R${kO?", en kΩ":", en Ω"}.`,type:"num",ans:kO?Rv/1000:Rv,tolR:0.02,unit:kO?"kΩ":"Ω",
      expl:`${F(`R = ${FRAC("τ","C")}`)} = ${FRAC(fS(tS),fCs(C))} = ${kO?`${nf(Rv,0)} Ω, soit ${U(Rv/1000,"kΩ")}`:U(Rv,"Ω")}.`}]; },
/* trois courbes de charge : associer une courbe à un circuit */
()=>{ const byR=Math.random()<0.5, s=rnd([1,10]), M=[1,2.2,4.7], nums=shuffle([1,2,3]), ask=rnd([0,1,2]), E=rnd([5,6,9,12]), y=yAx(E);
  const fig=fx_rc_courbe({E,x1:25*s,xs:5*s,xm:s,...y,xd:0,yd:1,xl:"t (ms)",more:M.map((m,i)=>({E,tau:m*s,lab:String(nums[i]),lt:2.64*s}))});
  const vals=byR?M.map(m=>`${nf(m,1)} kΩ`):M.map(m=>`${nf(m*s,1)} µF`);
  const ctx=byR?`Trois essais de charge sous E = ${E} V avec le même condensateur (C = ${s} µF) et trois résistances : ${vals.join(" ; ")}.`:`Trois essais de charge sous E = ${E} V avec la même résistance (R = 1 kΩ) et trois condensateurs : ${vals.join(" ; ")}.`;
  const rk=["la plus rapide","intermédiaire","la plus lente"][ask];
  return {fig,ctx,q:`Quelle courbe a été obtenue avec ${byR?"R":"C"} = ${vals[ask]} ?`,type:"ch",ch:["Courbe 1","Courbe 2","Courbe 3"],ok:nums[ask]-1,
    expl:`${F("τ = R·C")} : les trois essais donnent τ = ${M.map(m=>nf(m*s,1)).join(" ; ")} ms. Plus τ est grand, plus la charge est lente. Avec ${byR?"R":"C"} = ${vals[ask]}, τ = ${nf(M[ask]*s,1)} ms : c'est la charge ${rk}, ${F(`courbe ${nums[ask]}`)}.`}; },
/* énergie stockée : charge complète, puis à t = τ */
()=>{ const C=rnd([100e-6,220e-6,470e-6,1e-3,2.2e-3,4.7e-3]), E=rnd([9,12,24,48]), W=0.5*C*E*E, un=W<1?"mJ":"J", f=W<1?1000:1, pc=(1-Math.exp(-1))**2*100;
  const ctx=`Un condensateur de ${fC(C)} se charge sous E = ${E} V à travers une résistance : ${EXPC}.`;
  return [{ctx,q:`Quelle énergie stocke-t-il une fois complètement chargé, en ${un} ?`,type:"num",ans:W*f,tolR:0.02,unit:un,
      expl:`En fin de charge, u_C = E : ${F("W = ½·C·E²")} = 0,5 × ${fCs(C)} × ${E}² = ${U(W*f,un)}.`},
    {ctx,q:"À l'instant t = τ, quel pourcentage de cette énergie finale le condensateur a-t-il déjà stocké ?",type:"num",ans:pc,tolR:0.02,unit:"%",
      expl:`À t = τ, u_C = 0,632·E. L'énergie ${F("W = ½·C·u_C²")} est proportionnelle au carré de la tension : ${FRAC("W(τ)","W_finale")} = 0,632² = ${nfd(pc/100,3)}, soit ${U(pc,"%")}. À 63 % de la tension, 40 % seulement de l'énergie est stockée.`}]; },
/* condensateur plan : capacité, puis charge */
()=>{ const S=rnd([
    {d:"Le capteur d'humidité capacitif d'une serre connectée est formé de deux armatures séparées par un film de polymère",er:[3.5,4,4.5],Sm:[4,6,9],Su:"mm²",Sf:1e-6,e:[1,1.5,2],eu:"µm",ef:1e-6,Uv:[3.3,5]},
    {d:"Une touche tactile capacitive est formée d'une électrode placée sous une plaque de verre",er:[5,7],Sm:[1,1.5,2],Su:"cm²",Sf:1e-4,e:[1,2,3],eu:"mm",ef:1e-3,Uv:[3.3,5]},
    {d:"Un condensateur de TP est formé de deux plaques d'aluminium séparées par de l'air",er:[1],Sm:[200,400,600],Su:"cm²",Sf:1e-4,e:[1,2,5],eu:"mm",ef:1e-3,Uv:[6,12,24]}]);
  const er=rnd(S.er), Sv=rnd(S.Sm), ev=rnd(S.e), Sm2=Sv*S.Sf, em=ev*S.ef, C=EPS0*er*Sm2/em, Cp=C*1e12, Uv=rnd(S.Uv), qp=Cp*Uv;
  const ctx=`${S.d} : surface S = ${nf(Sv,1)} ${S.Su}, épaisseur e = ${nf(ev,1)} ${S.eu}, permittivité relative εr = ${nf(er,1)}. Capacité d'un condensateur plan : C = ${FRAC("ε<sub>0</sub>·εr·S","e")}, avec ${cEPS}.`;
  const fig=fx_rc_plan({e:true,iso:S.eu==="µm"?"polymère":er>1?"verre":"air"});
  return [{fig,ctx,q:"Calcule sa capacité C, en pF.",type:"num",ans:Cp,tolR:0.02,unit:"pF",
      expl:`En unités SI : S = ${sci(Sm2,1)} m² et e = ${sci(em,1)} m. ${F(`C = ${FRAC("ε<sub>0</sub>·εr·S","e")}`)} = ${FRAC(`8,85 × ${p10(-12)} × ${nf(er,1)} × ${sci(Sm2,1)}`,sci(em,1))} = ${sciR(Cp,1e-12)} F, soit ${U(Cp,"pF")}.`},
    {fig,ctx:ctx+` C = ${S3(Cp)} pF.`,q:`On applique une tension de ${nf(Uv,1)} V entre les armatures. Quelle charge porte l'armature positive, en pC ?`,type:"num",ans:qp,tolR:0.02,unit:"pC",
      expl:`${F("q = C·u")} = ${S3(Cp)} pF × ${nf(Uv,1)} V = ${U(qp,"pC")} (1 pC = ${p10(-12)} C). Une charge minuscule : la mesure d'un capteur capacitif demande une électronique sensible.`}]; },
/* capteur capacitif de niveau : sensibilité, puis hauteur d'eau */
()=>{ const H=rnd([100,120,150,200]), C0=rnd([60,80,100,120,150]), k=rnd([1.5,2,2.5,3,4,5]), h=Math.round(H*rnd([0.15,0.25,0.35,0.45,0.55,0.65,0.8])), Cm=C0+k*h, Cf=C0+k*H;
  const fig=fx_rc_niveau({k:h/H});
  const ctx=`La cuve de récupération d'eau de pluie d'un faré est équipée d'un capteur capacitif de niveau : sa capacité varie linéairement avec la hauteur d'eau h, de ${nf(C0,0)} pF (cuve vide) à ${nf(Cf,0)} pF (cuve pleine, h = ${H} cm).`;
  return [{fig,ctx,q:"Calcule la sensibilité du capteur, en pF par centimètre d'eau.",type:"num",ans:k,tolR:0.02,unit:"pF/cm",
      expl:`L'eau, de permittivité bien plus grande que l'air, fait croître C avec h. ${F(`s = ${FRAC("ΔC","Δh")}`)} = ${FRAC(`${nf(Cf,0)} − ${nf(C0,0)}`,H)} = ${U(k,"pF/cm")}.`},
    {fig,ctx:ctx+` Sensibilité : ${nf(k,1)} pF/cm.`,q:`Le capteur mesure C = ${nf(Cm,1)} pF. Quelle est la hauteur d'eau ?`,type:"num",ans:h,tolR:0.02,unit:"cm",
      expl:`${F("C = C_vide + s·h")}, donc ${F(`h = ${FRAC("C − C_vide","s")}`)} = ${FRAC(`${nf(Cm,1)} − ${nf(C0,0)}`,nf(k,1))} = ${U(h,"cm")}.`}]; },
/* particule accélérée entre deux plaques : champ, puis vitesse de sortie */
()=>{ const P=rnd([
    {d:"Dans le propulseur ionique d'un satellite, des ions xénon Xe⁺",m:2.18e-25,mt:`2,18 × ${p10(-25)}`,q:1,U:[300,500,800,1000,1200],dd:[2,3,4]},
    {d:"Dans le canon à électrons d'un tube cathodique, des électrons",m:ME,mt:`9,11 × ${p10(-31)}`,q:-1,U:[100,200,300,500],dd:[5,10,20]},
    {d:"Dans un petit accélérateur de laboratoire, des protons",m:1.67e-27,mt:`1,67 × ${p10(-27)}`,q:1,U:[1000,2000,5000,10000],dd:[10,20,50]}]);
  const Uv=rnd(P.U), dmm=rnd(P.dd), E=Uv/(dmm/1000), v=Math.sqrt(2*QE*Uv/P.m), vk=v/1000;
  const fig=fx_rc_champ({or:"v",p1:P.q>0?"+":"−",lines:true,U:"U",d:"d",pt:{s:P.q>0?"+":"−"},vB:true});
  const ctx=`${P.d} quittent la plaque A avec une vitesse négligeable et sont accélérés jusqu'à la plaque B sous la tension U = ${nf(Uv,0)} V ; distance entre les plaques : d = ${dmm} mm. Masse d'une particule : m = ${P.mt} kg ; charge ${P.q>0?"+e":"−e"}, avec ${cE}.`;
  return [{fig,ctx,q:"Calcule la valeur du champ électrique entre les plaques, en kV/m.",type:"num",ans:E/1000,tolR:0.02,unit:"kV/m",
      expl:`${F(`E = ${FRAC("U","d")}`)} = ${FRAC(nf(Uv,0),nf(dmm/1000,3))} = ${nf(E,0)} V/m, soit ${U(E/1000,"kV/m")}.`},
    {fig,ctx,q:"Entre A et B, la force électrique fournit à chaque particule l'énergie |q|·U, d'où ½·m·v_B² = |q|·U. Calcule la vitesse v_B, en km/s.",type:"num",ans:vk,tolR:0.02,unit:"km/s",
      expl:`${F(`v_B = √(${FRAC("2·|q|·U","m")})`)} = √(${FRAC(`2 × 1,60 × ${p10(-19)} × ${nf(Uv,0)}`,P.mt)}) = ${sci(v,2)} m/s, soit ${U(vk,"km/s")}. La vitesse ne dépend pas de d : seule la tension compte.`}]; },
/* force électrique et poids d'une goutte d'encre ou d'une poussière */
()=>{ const S=rnd([
    {d:"Une goutte d'encre chargée passe entre les plaques de déviation d'une imprimante à jet d'encre",m:[1.2,1.5,2],me:-10,q:[0.8,1,1.5,2],qe:-13,U:[1000,1500,2000],dd:[1.5,2,3],du:"mm",f:1e-3},
    {d:"Une poussière chargée passe entre les électrodes planes d'un dépoussiéreur électrostatique",m:[1,2,4],me:-12,q:[1,2,5],qe:-15,U:[30000,40000,50000],dd:[10,15,20],du:"cm",f:1e-2}]);
  const o=draw(()=>({m:rnd(S.m),q:rnd(S.q),Uv:rnd(S.U),dv:rnd(S.dd)}),o=>o.q*10**S.qe*o.Uv/(o.dv*S.f)/(o.m*10**S.me*g)>=50);
  const dm=o.dv*S.f, E=o.Uv/dm, qv=o.q*10**S.qe, mv=o.m*10**S.me, Fe=qv*E, P=mv*g, r=Fe/P;
  const fig=fx_rc_champ({p1:"+",lines:true,U:"U",d:"d",pt:{s:"−",c:"entrée"},v0:true});
  const ctx=`${S.d} : masse m = ${nf(o.m,1)} × ${p10(S.me)} kg, charge |q| = ${nf(o.q,1)} × ${p10(S.qe)} C. Tension entre les plaques : U = ${nf(o.Uv,0)} V ; distance : d = ${nf(o.dv,1)} ${S.du} ; g = 9,81 m/s².`;
  return [{fig,ctx,q:"Quelle est la valeur du champ électrique E entre les plaques, en kV/m ?",type:"num",ans:E/1000,tolR:0.02,unit:"kV/m",
      expl:`${F(`E = ${FRAC("U","d")}`)} = ${FRAC(nf(o.Uv,0),nf(dm,4))} = ${nf(E,0)} V/m, soit ${U(E/1000,"kV/m")}.`},
    {fig,ctx:ctx+` E = ${S3(E/1000)} kV/m.`,q:"Calcule le rapport entre la valeur de la force électrique et celle du poids.",type:"num",ans:r,tolR:0.02,unit:"",
      expl:`F = |q|·E = ${sci(qv,1)} × ${sci(E,2)} = ${sci(Fe,2)} N ; P = m·g = ${sci(mv,1)} × 9,81 = ${sci(P,2)} N. ${F(FRAC("F","P"))} = ${U(r,"")} : le poids est négligeable devant la force électrique.`}]; },
/* charge à courant constant : pente lue, courant, énergie */
()=>{ const [sl,x1,xs,xm,tM]=rnd([[0.05,70,10,5,40],[0.1,35,5,2.5,20],[0.2,18,2,1,10],[0.25,14,2,1,8]]), C=rnd([10,22,50,100]), I=C*sl, W=0.5*C*2.7*2.7;
  const fig=fx_rc_rampe({u0:0,t1:2.7/sl,U1:2.7,x1,xs,xm,y1:3,ys:0.5,ym:0.25,xd:0,yd:1,pts:[[tM,2]],lab:"M"});
  const ctx=`Un supercondensateur de ${C} F est chargé à courant constant jusqu'à sa tension maximale, 2,7 V ; le chargeur maintient ensuite cette tension.`;
  return [{fig,ctx,q:"À l'aide du point M, détermine la vitesse de variation de la tension pendant la charge, en V/s.",type:"num",ans:sl,tolR:0.03,unit:"V/s",
      expl:`La tension croît en ligne droite depuis l'origine : ${F(`${FRAC("Δu","Δt")} = ${FRAC("2 V",`${tM} s`)}`)} = ${U(sl,"V/s")}.`},
    {fig,ctx:ctx+` Pendant la charge, la tension augmente de ${nf(sl,2)} V/s.`,q:"Déduis-en l'intensité du courant de charge.",type:"num",ans:I,tolR:0.02,unit:"A",
      expl:`${F(`i = C·${FRAC("du","dt")}`)} = ${C} × ${nf(sl,2)} = ${U(I,"A")}. Une pente constante traduit un courant constant ; quand la tension ne varie plus, le courant s'annule.`},
    {fig,ctx,q:"Quelle énergie le supercondensateur stocke-t-il en fin de charge ?",type:"num",ans:W,tolR:0.02,unit:"J",
      expl:`${F("W = ½·C·u²")} = 0,5 × ${C} × 2,7² = ${U(W,"J")}.`}]; }
];

const RC3=[
/* retard au démarrage d'un ventilateur : τ, instant de basculement, exigence */
()=>{ const o=draw(()=>({E:rnd([5,9,12]),R:rnd([10e3,22e3,47e3,100e3,220e3,470e3]),C:rnd([10e-6,22e-6,47e-6,100e-6,220e-6,470e-6]),x:rnd([0.5,0.7,0.75,0.8,0.9])}),o=>{ const t=o.R*o.C; return t>=0.5&&t<=60; });
  const tau=o.R*o.C, Us=r2(o.x*o.E,2), ts=tau*Math.log(o.E/(o.E-Us));
  const XS=[1,2,3,5,8,10,15,20,30,45,60,90,120,180].filter(X=>X>=0.5*ts&&X<=2*ts&&far(ts,X,0.06)), X=rnd(XS), mn=Math.random()<0.5, ok=mn?ts>=X:ts<=X;
  const fig=fx_rc_circ({mode:"k",closed:true,u:"u_C",lab:{E:`E = ${o.E} V`,R:`R = ${fR(o.R)}`,C:`C = ${fC(o.C)}`}});
  const ctx=`Pour éviter les démarrages intempestifs, le ventilateur d'une serre démarre avec un retard : à la mise sous tension, le condensateur, déchargé, se charge à travers R, et un comparateur lance le ventilateur quand u_C atteint le seuil U_s = ${nf(Us,2)} V. On donne ${EXPC}.`;
  return [{fig,ctx,q:"Calcule la constante de temps τ du circuit.",type:"num",ans:tau,tolR:0.02,unit:"s",
      expl:`${F("τ = R·C")} = ${fRs(o.R)} × ${fCs(o.C)} = ${U(tau,"s")}.`},
    {fig,ctx:ctx+` τ = ${S3(tau)} s.`,q:`En résolvant u_C(t_s) = U_s, on obtient t_s = τ·ln(${FRAC("E","E − U_s")}). Calcule le retard t_s.`,type:"num",ans:ts,tolR:0.02,unit:"s",
      expl:`E·(1 − e<sup>−${FRAC("t_s","τ")}</sup>) = U_s donne e<sup>−${FRAC("t_s","τ")}</sup> = ${FRAC("E − U_s","E")}, d'où ${F(`t_s = τ·ln(${FRAC("E","E − U_s")})`)} = ${S3(tau)} × ln(${FRAC(o.E,nf(o.E-Us,2))}) = ${U(ts,"s")}.`},
    {fig,ctx:ctx+` Retard obtenu : t_s = ${S3(ts)} s.`,q:`Le cahier des charges impose un retard ${mn?"d'au moins":"d'au plus"} ${X} s. Est-il respecté ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(ts)} s ${ts>X?">":"<"} ${X} s : ${ok?"l'exigence est respectée.":`l'exigence n'est pas respectée. Le retard étant proportionnel à τ = R·C, il faut ${mn?"augmenter":"diminuer"} R ou C.`}`}]; },
/* supercondensateur de sauvegarde : charge disponible, autonomie, exigence */
()=>{ const o=draw(()=>({C:rnd([0.1,0.22,0.47,1,1.5]),U1:rnd([5,5.5]),U2:rnd([1.8,2,2.5,3]),I:rnd([2,5,10,20,50])}),o=>{ const h=o.C*(o.U1-o.U2)/(o.I*1e-6)/3600; return h>=3&&h<=800; });
  const dU=r2(o.U1-o.U2,1), dQ=o.C*dU, th=dQ/(o.I*1e-6)/3600;
  const XS=[2,6,12,24,48,72,96,168,240,336,500,720].filter(X=>X>=0.4*th&&X<=2.5*th&&far(th,X,0.06)), X=rnd(XS), ok=th>=X;
  const ctx=`L'horloge et la mémoire d'une station météo autonome sont sauvegardées par un supercondensateur de ${nf(o.C,2)} F pendant les pannes d'alimentation. Chargé à ${nf(o.U1,1)} V, il alimente l'horloge, qui consomme un courant constant de ${o.I} µA et fonctionne tant que la tension reste supérieure à ${nf(o.U2,1)} V.`;
  return [{ctx,q:"Quelle charge le supercondensateur fournit-il entre ces deux tensions, en coulombs ?",type:"num",ans:dQ,tolR:0.02,unit:"C",
      expl:`${F("q = C·u")}, donc ${F("ΔQ = C·ΔU")} = ${nf(o.C,2)} × (${nf(o.U1,1)} − ${nf(o.U2,1)}) = ${U(dQ,"C")}.`},
    {ctx:ctx+` Charge disponible : ${S3(dQ)} C.`,q:"Pendant combien d'heures l'horloge reste-t-elle alimentée ?",type:"num",ans:th,tolR:0.02,unit:"h",
      expl:`À courant constant, ${F(`i = C·${FRAC("du","dt")}`)} est constant : la tension baisse régulièrement et ${F("ΔQ = I·Δt")}. Δt = ${FRAC(`${S3(dQ)} C`,`${o.I} × ${p10(-6)} A`)} = ${nf(th*3600,0)} s, soit ${U(th,"h")}.`},
    {ctx:ctx+` Autonomie : ${S3(th)} h.`,q:`Le cahier des charges exige une sauvegarde d'au moins ${X} h. Est-il respecté ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(th)} h ${ok?"≥":"<"} ${X} h : ${ok?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite : il faut une capacité plus grande (l'autonomie est proportionnelle à C)."}`}]; },
/* flash : capacité minimale, choix, puissance de l'éclair */
()=>{ const NORM=[100,150,220,330,470,680,1000];
  const o=draw(()=>({W:rnd([5,8,10,12,15,20,25,30]),Uv:rnd([300,330,350,360])}),o=>{ const c=2*o.W/o.Uv**2*1e6; return c>=105&&c<=650&&NORM.every(n=>far(c,n,0.04)); });
  const Cmin=2*o.W/o.Uv**2*1e6, Cn=NORM.find(n=>n>Cmin), dn=NORM.filter(n=>n<Cmin).pop(), up=NORM[NORM.indexOf(Cn)+1], dt=rnd([1,2,4]), Wc=0.5*Cn*1e-6*o.Uv**2, P=Wc/(dt/1000)/1000;
  const ctx=`Le flash d'un appareil photo doit produire un éclair d'énergie ${o.W} J. Son condensateur est chargé sous ${o.Uv} V.`;
  return [{ctx,q:"Quelle capacité minimale le condensateur du flash doit-il avoir, en µF ?",type:"num",ans:Cmin,tolR:0.02,unit:"µF",
      expl:`${F("W = ½·C·u²")}, donc ${F(`C = ${FRAC("2·W","u²")}`)} = ${FRAC(`2 × ${o.W}`,`${o.Uv}²`)} = ${sci(Cmin*1e-6,2)} F, soit ${U(Cmin,"µF")}.`},
    {ctx:ctx+` Capacité minimale : ${S3(Cmin)} µF.`,data:`Capacités disponibles : ${NORM.map(n=>`${nf(n,0)} µF`).join(" · ")}`,q:"Quelle est la plus petite capacité disponible qui convient ?",type:"ch",...mc(`${nf(Cn,0)} µF`,[`${nf(dn,0)} µF`,`${nf(up,0)} µF`,`${nf(Cn/10,0)} µF`].filter((x,i,a)=>a.indexOf(x)===i&&x!==`${nf(Cn,0)} µF`)),
      expl:`Il faut C ≥ ${S3(Cmin)} µF : la plus petite valeur disponible qui convient est ${F(`${nf(Cn,0)} µF`)}. Avec ${nf(dn,0)} µF, l'éclair serait trop faible ; ${nf(up,0)} µF conviendrait mais serait plus gros, plus cher et plus long à recharger.`},
    {ctx:ctx+` On choisit C = ${nf(Cn,0)} µF, chargé sous ${o.Uv} V.`,q:`Le condensateur se décharge dans la lampe en ${dt} ms environ. Quelle est la puissance moyenne de l'éclair, en kW ?`,type:"num",ans:P,tolR:0.02,unit:"kW",
      expl:`Énergie stockée : W = 0,5 × ${nf(Cn,0)} × ${p10(-6)} × ${o.Uv}² = ${S3(Wc)} J. ${F(`P = ${FRAC("W","Δt")}`)} = ${FRAC(`${S3(Wc)} J`,`${nf(dt/1000,3)} s`)} = ${nf(P*1000,0)} W, soit ${U(P,"kW")}. Le condensateur restitue en quelques millisecondes une énergie accumulée en plusieurs secondes : c'est ce qui rend l'éclair si puissant.`}]; },
/* vérification d'un condensateur : τ théorique, écart, tolérance */
()=>{ const tol=rnd([10,20]), tgt=Math.random()<0.5;
  const o=draw(()=>{ const R=rnd([1e3,2.2e3,4.7e3,10e3,22e3,47e3]), C=rnd([10e-6,22e-6,47e-6,100e-6,220e-6,470e-6]), tn=R*C, d=tU(tn), ta=Number(d.v.toPrecision(3)), k=rnd([0.7,0.75,0.8,0.85,0.9,0.93,0.95,1.05,1.07,1.1,1.15,1.2,1.25,1.3,1.4]), tm=n2(ta*k);
      return {R,C,tn,d,ta,tm,er:Math.abs(tm-ta)/ta*100}; },
    o=>o.tn>=0.01&&o.tn<=10&&o.er>=1&&far(o.er,tol,0.15)&&(o.er<=tol)===tgt);
  const un=o.d.u, ok=o.er<=tol;
  const ctx=`On contrôle un condensateur électrolytique marqué ${fC(o.C)} (tolérance du fabricant : ± ${tol} %). On le charge à travers une résistance de précision R = ${fR(o.R)} (tolérance négligeable) ; la méthode des 63 % donne τ_mes = ${nf(o.tm,2)} ${un}.`;
  return [{ctx,q:`Calcule la constante de temps attendue avec les valeurs marquées, en ${un}.`,type:"num",ans:o.d.v,tolR:0.02,unit:un,
      expl:`${F("τ = R·C")} = ${fRs(o.R)} × ${fCs(o.C)} = ${U(o.d.v,un)}.`},
    {ctx:ctx+` τ attendue : ${S3(o.ta)} ${un}.`,q:"Calcule l'écart relatif entre τ_mes et τ attendue (référence : τ attendue), en %.",type:"num",ans:o.er,tolR:0.03,tolA:0.1,unit:"%",
      expl:`${F(`écart = ${FRAC("|τ_mes − τ_att|","τ_att")} × 100`)} = ${FRAC(`|${nf(o.tm,2)} − ${S3(o.ta)}|`,S3(o.ta))} × 100 = ${U(o.er,"%")}.`},
    {ctx:ctx+` Écart relatif : ${nf(o.er,1)} %.`,q:"La capacité réelle respecte-t-elle la tolérance annoncée ?",type:"ch",ch:["Oui : l'écart est inférieur à la tolérance","Non : l'écart dépasse la tolérance"],ok:ok?0:1,
      expl:`R étant exacte, τ = R·C est proportionnelle à C : l'écart sur τ est l'écart sur C. ${nf(o.er,1)} % ${ok?"≤":">"} ${tol} % : ${ok?"le condensateur est conforme.":"le condensateur est hors tolérance (vieillissement, défaut) : il faut le remplacer."}`}]; },
/* repérer l'erreur dans une résolution */
()=>{ const v=rnd([0,1,2,3,4,5]); let ctx, st, bad, why;
  if(v===0){ const R=rnd([10,22,47]), C=rnd([100,220,470]);
    ctx=`Constante de temps d'un circuit RC : R = ${R} kΩ et C = ${C} µF.`;
    st=["τ = R·C",`τ = ${R} × ${p10(3)} × ${C} = ${nf(R*C*1000,0)} s`,`La charge dure 5τ = ${nf(5*R*C*1000,0)} s.`]; bad=1;
    why=`C doit être en farads : C = ${C} × ${p10(-6)} F, d'où τ = ${R} × ${p10(3)} × ${C} × ${p10(-6)} = ${nf(R*C/1000,3)} s. Un résultat de ${R*C*1000/86400>=60?"plusieurs mois":"plusieurs jours"} aurait dû alerter.`; }
  else if(v===1){ const E=rnd([5,9,12]);
    ctx=`Tension aux bornes d'un condensateur qui se charge sous E = ${E} V, à l'instant t = τ.`;
    st=["À t = τ, on applique le repère de la constante de temps.",`u_C(τ) = 0,37 × E = ${nf(0.37*E,2)} V`,"Le condensateur est donc chargé à 37 % à t = τ."]; bad=1;
    why=`En charge, ${F("u_C(τ) = E·(1 − e<sup>−1</sup>)")} = 0,63 × ${E} = ${nf(0.63*E,2)} V. Le coefficient 0,37 concerne la décharge.`; }
  else if(v===2){ const C=rnd([100,220,470]), u=rnd([12,24,48]);
    ctx=`Énergie stockée par un condensateur de ${C} µF chargé sous ${u} V.`;
    st=["W = ½·C·u",`W = 0,5 × ${C} × ${p10(-6)} × ${u} = ${sci(0.5*C*1e-6*u,2)} J`,`Le condensateur stocke ${sci(0.5*C*1e-6*u,2)} J.`]; bad=0;
    why=`L'énergie est proportionnelle au carré de la tension : ${F("W = ½·C·u²")} = 0,5 × ${C} × ${p10(-6)} × ${u}² = ${sci(0.5*C*1e-6*u*u,2)} J.`; }
  else if(v===3){ const R=rnd([1,2.2,4.7,10]), C=rnd([100,220,470]), tau=R*C/1000;
    ctx=`Durée de charge d'un condensateur de ${C} µF à travers une résistance de ${nf(R,1)} kΩ.`;
    st=[`τ = R·C = ${nf(R,1)} × ${p10(3)} × ${C} × ${p10(-6)} = ${nf(tau,3)} s`,"On considère la charge terminée quand u_C dépasse 99 % de E.",`La charge est donc terminée au bout de τ = ${nf(tau,3)} s.`]; bad=2;
    why=`À t = τ, u_C n'atteint que 63 % de E. La charge est terminée à ${F("5τ")} = ${S3(5*tau)} s.`; }
  else if(v===4){ const E=rnd([9,12]), k=rnd([1,2]), kt=k===1?"τ":"2τ";
    ctx=`Décharge d'un condensateur initialement chargé sous E = ${E} V : tension à l'instant t = ${kt}.`;
    st=[`u_C(t) = E·(1 − e<sup>−${FRAC("t","τ")}</sup>)`,`u_C(${kt}) = ${E} × (1 − e<sup>−${k}</sup>) = ${nf(E*(1-Math.exp(-k)),2)} V`,"La tension a augmenté depuis t = 0."]; bad=0;
    why=`En décharge, ${F(EXPD)} : u_C(${kt}) = ${E} × e<sup>−${k}</sup> = ${nf(E*Math.exp(-k),2)} V. La tension d'un condensateur qui se décharge diminue.`; }
  else { const Uv=rnd([100,200,500]), dmm=rnd([2,5,10]);
    ctx=`Champ électrique entre deux plaques distantes de ${dmm} mm, soumises à une tension de ${Uv} V.`;
    st=[`d = ${dmm} mm = ${nf(dmm/1000,3)} m`,`E = U·d = ${Uv} × ${nf(dmm/1000,3)} = ${nf(Uv*dmm/1000,2)} V/m`,`Le champ vaut ${nf(Uv*dmm/1000,2)} V/m.`]; bad=1;
    why=`${F(`E = ${FRAC("U","d")}`)} = ${FRAC(Uv,nf(dmm/1000,3))} = ${nf(Uv/(dmm/1000),0)} V/m : plus les plaques sont proches, plus le champ est intense. L'unité, le volt par mètre, le rappelait.`; }
  return {ctx,data:OL(st),q:"Un élève a rédigé cette résolution. À quelle étape se trouve la première erreur ?",type:"ch",ch:["Étape 1","Étape 2","Étape 3"],ok:bad,expl:`L'erreur est à l'étape ${bad+1}. ${why}`}; },
/* goutte d'encre déviée entre deux plaques : sens, accélération, déviation */
()=>{ const o=draw(()=>({m:rnd([1.2,1.5,2]),q:rnd([1,1.5,2]),Uv:rnd([1000,1500,2000]),dmm:rnd([1.5,2,3]),v0:rnd([15,18,20,25]),Lmm:rnd([6,8,10,12,15])}),
    o=>{ const a=o.q*1e-13*o.Uv/(o.dmm/1000)/(o.m*1e-10), y=a*(o.Lmm/1000)**2/(2*o.v0**2)*1000; return a>=50*g&&y>=0.05&&y<=0.8*o.dmm/2; });
  const neg=Math.random()<0.5, top=rnd(["+","−"]), E=o.Uv/(o.dmm/1000), a=o.q*1e-13*E/(o.m*1e-10), y=a*(o.Lmm/1000)**2/(2*o.v0**2)*1000, up=(top==="+")===neg;
  const fig=fx_rc_champ({p1:top,lines:true,U:"U",d:"d",L:"L",pt:{s:neg?"−":"+",c:"entrée"},v0:true});
  const ctx=`Dans une imprimante à jet d'encre, une goutte de masse m = ${nf(o.m,1)} × ${p10(-10)} kg, chargée ${neg?"négativement":"positivement"} (|q| = ${nf(o.q,1)} × ${p10(-13)} C), entre avec une vitesse horizontale v0 = ${o.v0} m/s entre deux plaques de longueur L = ${o.Lmm} mm, distantes de d = ${nf(o.dmm,1)} mm et soumises à U = ${nf(o.Uv,0)} V. Le poids de la goutte est négligé.`;
  return [{fig,ctx,q:"Vers quelle plaque la goutte est-elle déviée ?",type:"ch",ch:["Vers la plaque du haut","Vers la plaque du bas","Elle n'est pas déviée"],ok:up?0:1,
      expl:`La plaque du haut est ${top==="+"?"positive":"négative"}. La goutte, ${neg?"négative":"positive"}, subit ${F(`${V("F")} = q·${V("E")}`)}, ${neg?"opposée au champ : elle est attirée par la plaque +":"dans le sens du champ : elle est attirée par la plaque −"}. Elle est déviée ${F(up?"vers la plaque du haut":"vers la plaque du bas")}.`},
    {fig,ctx,q:"Calcule la valeur de son accélération entre les plaques.",type:"num",ans:a,tolR:0.02,unit:"m/s²",
      expl:`E = ${FRAC("U","d")} = ${nf(E,0)} V/m. 2e loi de Newton, poids négligé : ${F(`a = ${FRAC("|q|·E","m")}`)} = ${FRAC(`${nf(o.q,1)} × ${p10(-13)} × ${nf(E,0)}`,`${nf(o.m,1)} × ${p10(-10)}`)} = ${U(a,"m/s²")}, soit environ ${nf(a/g,0)} fois g : négliger le poids est justifié.`},
    {fig,ctx:ctx+` Accélération : a = ${S3(a)} m/s².`,q:`À la sortie des plaques, la déviation vaut y = ${FRAC("a·L²","2·v0²")}. Calcule-la, en mm.`,type:"num",ans:y,tolR:0.02,unit:"mm",
      expl:`Traversée à vitesse horizontale constante : t = ${FRAC("L","v0")} = ${FRAC(nf(o.Lmm/1000,3),o.v0)} = ${nf(o.Lmm/o.v0,3)} ms, et y = ½·a·t². ${F(`y = ${FRAC("a·L²","2·v0²")}`)} = ${FRAC(`${S3(a)} × ${nf(o.Lmm/1000,3)}²`,`2 × ${o.v0}²`)} = ${sci(y/1000,2)} m, soit ${U(y,"mm")} : moins que ${FRAC("d","2")} = ${nf(o.dmm/2,2)} mm, la goutte ne touche pas la plaque.`}]; },
/* électron accéléré : vitesse, comparaison à c, validité du modèle */
()=>{ const Uv=rnd([300,500,800,1000,1500,2000,3500,4000,5000,8000,10000]), v=Math.sqrt(2*QE*Uv/ME), b=v/CLUM, ok=b<0.1;
  const fig=fx_rc_champ({or:"v",p1:"−",lines:true,U:"U",pt:{s:"−"},vB:true});
  const ctx=`Dans le canon à électrons d'un oscilloscope analogique, des électrons quittent la cathode A avec une vitesse négligeable et sont accélérés jusqu'à l'anode B sous une tension U = ${nf(Uv,0)} V. Données : ${cE} ; m_e = 9,11 × ${p10(-31)} kg ; c = 3,00 × ${p10(8)} m/s. On admet ½·m_e·v² = e·U.`;
  return [{fig,ctx,q:"Calcule la vitesse des électrons en B, en km/s.",type:"num",ans:v/1000,tolR:0.02,unit:"km/s",
      expl:`${F(`v = √(${FRAC("2·e·U","m_e")})`)} = √(${FRAC(`2 × 1,60 × ${p10(-19)} × ${nf(Uv,0)}`,`9,11 × ${p10(-31)}`)}) = ${sci(v,2)} m/s, soit ${U(v/1000,"km/s")}.`},
    {fig,ctx:ctx+` v = ${sci(v,2)} m/s.`,q:`Calcule le rapport ${FRAC("v","c")} entre cette vitesse et la vitesse de la lumière.`,type:"num",ans:b,tolR:0.02,tolA:0.001,unit:"",
      expl:`${FRAC("v","c")} = ${FRAC(sci(v,2),`3,00 × ${p10(8)}`)} = ${U(b,"")}, soit ${S3(b*100)} % de la vitesse de la lumière.`},
    {fig,ctx:ctx+` ${FRAC("v","c")} = ${S3(b)}.`,q:"On admet que la mécanique classique (non relativiste) reste valable tant que v < 0,1·c. Le calcul précédent est-il valable ?",type:"ch",ch:YN,ok:ok?0:1,
      expl:`${S3(b)} ${ok?"<":">"} 0,1 : ${ok?"le modèle classique est valable.":"le modèle classique n'est plus valable : il surestime la vitesse, il faut utiliser la relativité restreinte."} La limite correspond à U ≈ 2,6 kV pour des électrons.`}]; },
/* capteur de niveau : de la constante de temps mesurée à la hauteur d'eau */
()=>{ const R=rnd([100e3,220e3,470e3,1e6]), H=rnd([100,150,200]), C0=rnd([80,100,120,150]), k=rnd([2,2.5,3,4,5]), hmin=rnd([20,25,30]), tgt=Math.random()<0.5;
  const o=draw(()=>{ const h0=Math.round(H*(0.08+Math.random()*0.8)), tu=Number((R*(C0+k*h0)*1e-6).toPrecision(3)), Cm=tu*1e-6/R*1e12, hm=(Cm-C0)/k; return {tu,Cm,hm}; },o=>far(o.hm,hmin,0.15)&&(o.hm<hmin)===tgt);
  const low=o.hm<hmin;
  const ctx=`Le microcontrôleur d'une citerne d'eau de pluie mesure la constante de temps τ = R·C du circuit formé par son capteur capacitif de niveau et une résistance R = ${fR(R)}. La capacité du capteur vaut C = ${nf(C0,0)} pF + ${nf(k,1)} pF/cm × h (h : hauteur d'eau en cm). Mesure : τ = ${nf(o.tu,3)} µs.`;
  return [{fig:fx_rc_niveau({k:Math.min(Math.max(o.hm/H,0.05),0.95)}),ctx,q:"Calcule la capacité du capteur, en pF.",type:"num",ans:o.Cm,tolR:0.02,unit:"pF",
      expl:`${F(`C = ${FRAC("τ","R")}`)} = ${FRAC(`${nf(o.tu,3)} × ${p10(-6)} s`,fRs(R))} = ${sci(o.Cm*1e-12,2)} F, soit ${U(o.Cm,"pF")}.`},
    {ctx:ctx+` C = ${S3(o.Cm)} pF.`,q:"Déduis-en la hauteur d'eau dans la citerne, en cm.",type:"num",ans:o.hm,tolR:0.02,tolA:0.3,unit:"cm",
      expl:`${F(`h = ${FRAC(`C − ${nf(C0,0)}`,nf(k,1))}`)} = ${FRAC(`${S3(o.Cm)} − ${nf(C0,0)}`,nf(k,1))} = ${U(o.hm,"cm")}.`},
    {ctx:ctx+` Hauteur d'eau : ${S3(o.hm)} cm.`,q:`L'alerte « niveau bas » doit se déclencher quand h < ${hmin} cm. Se déclenche-t-elle ?`,type:"ch",ch:YN,ok:low?0:1,
      expl:`${S3(o.hm)} cm ${low?"<":">"} ${hmin} cm : ${low?"l'alerte se déclenche.":"pas d'alerte."} Toute la chaîne d'acquisition repose sur la mesure d'un temps : τ est proportionnelle à C, qui croît avec h.`}]; },
/* supercondensateurs d'un robot de manutention : énergie totale, énergie utilisable, trajet */
()=>{ const [C,Um]=rnd([[58,16],[500,16],[83,48],[165,48]]), kmin=rnd([2,3]), Umin=Um/kmin, W=0.5*C*Um*Um/1000, Wu=0.5*C*(Um*Um-Umin*Umin)/1000;
  const o=draw(()=>({P:rnd([100,150,200,300,400,600,800,1200,1500]),t:rnd([10,15,20,30,45,60,90,120])}),o=>{ const need=o.P*o.t/1000; return need>=0.4*Wu&&need<=2*Wu&&far(need,Wu,0.06); });
  const need=o.P*o.t/1000, ok=need<=Wu;
  const ctx=`Un robot de manutention (AGV) roule entre deux stations de recharge grâce à un module de supercondensateurs de ${C} F, chargé sous ${Um} V à chaque station. Son convertisseur ne fonctionne plus quand la tension du module descend sous ${nf(Umin,2)} V.`;
  return [{ctx,q:"Quelle énergie le module stocke-t-il quand il est chargé, en kJ ?",type:"num",ans:W,tolR:0.02,unit:"kJ",
      expl:`${F("W = ½·C·u²")} = 0,5 × ${C} × ${Um}² = ${nf(W*1000,0)} J, soit ${U(W,"kJ")}.`},
    {ctx,q:"Quelle énergie est réellement utilisable par le robot, en kJ ?",type:"num",ans:Wu,tolR:0.02,unit:"kJ",
      expl:`Le module ne descend pas sous ${nf(Umin,2)} V : ${F("W_u = ½·C·(U_max² − U_min²)")} = 0,5 × ${C} × (${Um}² − ${nf(Umin,2)}²) = ${U(Wu,"kJ")}, soit ${nf((1-1/kmin**2)*100,0)} % de l'énergie stockée.`},
    {ctx:ctx+` Énergie utilisable : ${S3(Wu)} kJ.`,q:`Le trajet entre deux stations demande ${o.P} W pendant ${o.t} s. Le robot peut-il l'effectuer ?`,type:"ch",ch:YN,ok:ok?0:1,
      expl:`${F("W = P·Δt")} = ${o.P} × ${o.t} = ${nf(need*1000,0)} J = ${nf(need,1)} kJ ${ok?"≤":">"} ${S3(Wu)} kJ : ${ok?"le trajet est possible.":"le trajet est impossible, il faut un module plus capacitif ou une station intermédiaire."}`}]; },
/* condensateur de maintien lors d'une microcoupure : i = C·du/dt */
()=>{ const NORM=[470,680,1000,1500,2200,3300,4700,6800,10000];
  const o=draw(()=>({I:rnd([50,80,100,150,200,300]),dt:rnd([5,10,20,50]),dU:rnd([0.5,1,1.5,2])}),o=>{ const c=o.I*o.dt/o.dU; return c>=500&&c<=6500&&NORM.every(n=>far(c,n,0.04)); });
  const Cmin=o.I*o.dt/o.dU, Cn=NORM.find(n=>n>Cmin), dn=NORM.filter(n=>n<Cmin).pop(), up=NORM[NORM.indexOf(Cn)+1], dUr=o.I*o.dt/Cn;
  const ctx=`Lors d'une microcoupure de l'alimentation, durant jusqu'à ${o.dt} ms, un condensateur doit alimenter seul le module radio d'un capteur connecté, qui absorbe un courant constant de ${o.I} mA. Pendant la coupure, la tension du condensateur ne doit pas baisser de plus de ${nf(o.dU,1)} V.`;
  const w=[`${nf(dn,0)} µF`,`${nf(up,0)} µF`,`${nf(Cn*10,0)} µF`];
  return [{ctx,q:"Calcule la capacité minimale du condensateur de maintien, en µF.",type:"num",ans:Cmin,tolR:0.02,unit:"µF",
      expl:`Courant constant : ${F(`i = C·${FRAC("du","dt")}`)} donne ${F(`ΔU = ${FRAC("I·Δt","C")}`)}. Il faut donc C ≥ ${FRAC("I·Δt","ΔU")} = ${FRAC(`${nf(o.I/1000,3)} × ${nf(o.dt/1000,3)}`,nf(o.dU,1))} = ${sci(Cmin*1e-6,2)} F, soit ${U(Cmin,"µF")}.`},
    {ctx:ctx+` Capacité minimale : ${S3(Cmin)} µF.`,data:`Valeurs normalisées disponibles : ${NORM.map(n=>`${nf(n,0)} µF`).join(" · ")}`,q:"Quelle est la plus petite valeur normalisée qui convient ?",type:"ch",...mc(`${nf(Cn,0)} µF`,w),
      expl:`Il faut au moins ${S3(Cmin)} µF : la plus petite valeur normalisée qui convient est ${F(`${nf(Cn,0)} µF`)}. Avec ${nf(dn,0)} µF, la tension chuterait de plus de ${nf(o.dU,1)} V.`},
    {ctx:ctx+` On choisit C = ${nf(Cn,0)} µF.`,q:"De combien la tension baisse-t-elle alors pendant la coupure la plus longue ?",type:"num",ans:dUr,tolR:0.02,unit:"V",
      expl:`${F(`ΔU = ${FRAC("I·Δt","C")}`)} = ${FRAC(`${nf(o.I/1000,3)} × ${nf(o.dt/1000,3)}`,`${nf(Cn,0)} × ${p10(-6)}`)} = ${U(dUr,"V")} ≤ ${nf(o.dU,1)} V : l'exigence est respectée.`}]; },
/* capteur capacitif de déplacement : capacité au repos, épaisseur, déplacement */
()=>{ const Scm=rnd([1,2,4]), e0=rnd([100,150,200]), x=draw(()=>rnd([10,15,20,25,30,40,50]),x=>x<=0.4*e0), S=Scm*1e-4;
  const C0=EPS0*S/(e0*1e-6)*1e12, C1=Number((EPS0*S/((e0-x)*1e-6)*1e12).toPrecision(3)), e1=EPS0*S/(C1*1e-12)*1e6, xc=e0-e1;
  const ctx=`Un capteur mesure sans contact la position d'une pièce métallique : une électrode fixe de surface S = ${Scm} cm² et la pièce, séparées par de l'air (εr = 1), forment un condensateur plan de capacité C = ${FRAC("ε<sub>0</sub>·S","e")}, avec ${cEPS}. Au repos, l'épaisseur d'air vaut e0 = ${e0} µm.`;
  const fig=fx_rc_plan({e:true,iso:"air"});
  return [{fig,ctx,q:"Calcule la capacité du capteur au repos, en pF.",type:"num",ans:C0,tolR:0.02,unit:"pF",
      expl:`${F(`C0 = ${FRAC("ε<sub>0</sub>·S","e0")}`)} = ${FRAC(`8,85 × ${p10(-12)} × ${sci(S,1)}`,sci(e0*1e-6,1))} = ${sciR(C0,1e-12)} F, soit ${U(C0,"pF")}.`},
    {fig,ctx,q:`La pièce s'est rapprochée : le capteur mesure C = ${nf(C1,2)} pF. Calcule la nouvelle épaisseur d'air, en µm.`,type:"num",ans:e1,tolR:0.02,unit:"µm",
      expl:`${F(`e = ${FRAC("ε<sub>0</sub>·S","C")}`)} = ${FRAC(`8,85 × ${p10(-12)} × ${sci(S,1)}`,`${nf(C1,2)} × ${p10(-12)}`)} = ${sciR(e1,1e-6)} m, soit ${U(e1,"µm")}.`},
    {fig,ctx:ctx+` Nouvelle épaisseur : ${S4(e1)} µm.`,q:"De combien la pièce s'est-elle rapprochée de l'électrode, en µm ?",type:"num",ans:xc,tolR:0.02,tolA:0.6,unit:"µm",
      expl:`${F("x = e0 − e")} = ${e0} − ${S4(e1)} = ${U(xc,"µm")}${Math.abs(xc-x)>0.05?`, soit environ ${x} µm`:""}. La capacité varie comme ${FRAC("1","e")} : ce capteur est très sensible aux petits déplacements.`}]; },
/* retard lu sur la courbe, puis nouvelle résistance */
()=>{ const a=pickAx([1,10]), E=rnd([5,9,12]), y=yAx(E), R=rnd([10e3,22e3,47e3,100e3]);
  const J=[...Array(Math.round(a.x1/a.xm)).keys()].map(j=>(j+1)*a.xm).filter(t=>t>=0.5*a.tau&&t<=2*a.tau&&Math.abs(t-a.tau)>1e-9), ts=rnd(J), Us=E*(1-Math.exp(-ts/a.tau));
  const XS=[1,2,3,5,8,10,15,20,30,45,60,90,120].filter(X=>X>=0.4*ts&&X<=3*ts&&far(X,ts,0.2)), X=rnd(XS), Rn=R*X/ts;
  const fig=fx_rc_courbe({E,tau:a.tau,x1:a.x1,xs:a.xs,xm:a.xm,...y,xd:0,yd:1,asy:true,hl:{v:Us,lab:"seuil U_s",below:Us>0.85*E},xl:"t (s)"});
  const ctx=`Une minuterie d'éclairage utilise la charge d'un condensateur à travers R = ${fR(R)}, avec ${EXPC} et τ = R·C. La lampe s'éteint quand u_C atteint le seuil U_s = ${nf(Us,2)} V (trait pointillé).`;
  return [{fig,ctx,q:"Lis sur la courbe la durée d'éclairage t_s, instant où u_C atteint le seuil.",type:"num",ans:ts,tolA:a.xm/4,tolR:0.08,unit:"s",
      expl:`On lit l'abscisse du point où la courbe coupe le trait du seuil : ${F(`t_s ≈ ${nf(ts,1)} s`)}.`},
    {fig,ctx:ctx+` t_s = ${nf(ts,1)} s.`,q:`On veut une durée d'éclairage de ${X} s sans changer le condensateur ni le seuil. Quelle résistance faut-il, en kΩ ?`,type:"num",ans:Rn/1000,tolR:0.02,unit:"kΩ",
      expl:`Avec le même seuil, t_s = τ·ln(${FRAC("E","E − U_s")}) est proportionnelle à τ = R·C, donc à R : ${F(`R' = R·${FRAC("t'","t_s")}`)} = ${nf(R/1000,1)} × ${FRAC(X,nf(ts,1))} = ${U(Rn/1000,"kΩ")}.`}]; }
];

POOLS["phy-electricite"]={
  titre:"Condensateur, circuit RC, champ",
  fiche:{t:"Condensateur, circuit RC, champ électrique",l:[
    `Condensateur : charge ${F("q = C·u")} (C en farads) ; courant ${F(`i = C·${FRAC("du","dt")}`)}, nul une fois chargé ; énergie stockée ${F("W = ½·C·u²")}.`,
    `Circuit RC : constante de temps ${F("τ = R·C")} (en s) ; charge sous E : ${F(`u_C = E·(1 − e<sup>−${FRAC("t","τ")}</sup>)`)} ; décharge : ${F(`u_C = E·e<sup>−${FRAC("t","τ")}</sup>`)}.`,
    `Lecture de τ : en charge, ${F("u_C(τ) = 0,63·E")} ; en décharge, ${F("u_C(τ) = 0,37·E")} ; ou tangente à l'origine. Charge terminée à ${F("t = 5τ")}.`,
    `Condensateur plan : ${F(`C = ${FRAC("ε·S","e")}`)} (capteurs capacitifs) ; champ uniforme entre les plaques ${F(`E = ${FRAC("U","d")}`)}, dirigé vers la plaque − ; force ${F("F = |q|·E")}.`,
    "Pièges : µF et kΩ non convertis (τ en s), 63 % en charge mais 37 % en décharge, tension non élevée au carré dans l'énergie, d en mètres pour le champ, force opposée au champ pour une charge négative."]},
  count:{1:4,2:4,3:3},1:RC1,2:RC2,3:RC3
};

})();
