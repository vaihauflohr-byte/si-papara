/* Réservoirs : schéma-bloc et fonction de transfert (auto-schema-bloc), précision, rapidité, stabilité (auto-performances),
   correcteurs P, PI, PID (auto-correcteur). Tout est encapsulé : seules les entrées de POOLS sont ajoutées. Figures propres : préfixe fx_auto_. */
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
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const YN=["Oui","Non"];
const P2=p=>`${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`;
const r2=(x,d)=>Math.round(x*10**d)/10**d;
const ln=Math.log;
/* unité placée après un nombre (pas d'espace devant °) */
const wu=(x,u,d)=>`${nf(x,d==null?2:d)}${u==="°"?"":" "}${u}`;
const Uu=(x,u)=>F(`${S3(x)}${u==="°"?"":" "}${u}`);
/* texte avec un liseré couleur papier (lisible par-dessus une courbe ou la grille) */
const Th=(x,y,t,c,a)=>`<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="${c}" text-anchor="${a||"start"}" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
const dot=(x,y)=>`<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="4" class="v-dot"/>`;

/* ===== réponses temporelles ===== */
/* premier ordre : s(t) = K·E0·(1 − e^(−t/τ)), échelon en t0 */
const ord1=(sf,tau,t0)=>{ t0=t0||0; return t=>t<=t0?0:sf*(1-Math.exp(-(t-t0)/tau)); };
/* deuxième ordre (valeur finale sf, amortissement z, pulsation propre wn), échelon en t0 */
function ord2(sf,z,wn,t0){ t0=t0||0;
  if(z<1){ const wd=wn*Math.sqrt(1-z*z), c=z/Math.sqrt(1-z*z); return t=>{ if(t<=t0) return 0; const u=t-t0; return sf*(1-Math.exp(-z*wn*u)*(Math.cos(wd*u)+c*Math.sin(wd*u))); }; }
  if(Math.abs(z-1)<1e-9) return t=>{ if(t<=t0) return 0; const u=t-t0; return sf*(1-(1+wn*u)*Math.exp(-wn*u)); };
  const r=Math.sqrt(z*z-1), p1=wn*(z-r), p2=wn*(z+r);
  return t=>{ if(t<=t0) return 0; const u=t-t0; return sf*(1-(p2*Math.exp(-p1*u)-p1*Math.exp(-p2*u))/(p2-p1)); };
}
/* amortissement donnant le dépassement relatif D (fraction) */
const zOfD=D=>{ const l=Math.log(D); return -l/Math.sqrt(Math.PI*Math.PI+l*l); };
/* 2e ordre défini par sa valeur finale, son dépassement D (fraction) et l'instant tp du premier pic (compté depuis l'échelon) */
function ord2D(sf,D,tp,t0){ const z=zOfD(D), wn=Math.PI/(tp*Math.sqrt(1-z*z)); return ord2(sf,z,wn,t0); }
/* instant à partir duquel la sortie reste dans la bande ± 5 % de yf (affiné par dichotomie) */
function t5of(f,yf,tmax,n){ n=n||6000; const out=t=>Math.abs(f(t)-yf)>0.05*Math.abs(yf); let last=0;
  for(let i=0;i<=n;i++){ const t=tmax*i/n; if(out(t)) last=t; }
  let a=last, b=Math.min(tmax,last+tmax/n); for(let k=0;k<50;k++){ const m=(a+b)/2; if(out(m)) a=m; else b=m; } return b; }
/* maximum d'une réponse (échantillonnée) */
function peakOf(f,tmax,n){ n=n||6000; let tb=0, yb=-Infinity; for(let i=0;i<=n;i++){ const t=tmax*i/n, y=f(t); if(y>yb){ yb=y; tb=t; } } return {t:tb,y:yb}; }
/* interpolation linéaire d'une suite d'échantillons */
function interp(T,Y){ const n=T.length; return t=>{ if(t<=T[0]) return Y[0]; if(t>=T[n-1]) return Y[n-1]; let lo=0, hi=n-1; while(hi-lo>1){ const m=(lo+hi)>>1; if(T[m]<=t) lo=m; else hi=m; } const a=(t-T[lo])/(T[hi]-T[lo]); return Y[lo]+a*(Y[hi]-Y[lo]); }; }
/* boucle fermée à retour unitaire simulée (RK4) : procédé K / ((1 + τ1·p)…(1 + τn·p)), tl = [τ1, …, τn] ; correcteur Kp, Ki (action intégrale), Kd (dérivée de la mesure, si n ≥ 2) ;
   consigne r en échelon à t0 ; perturbation d (en unité de sortie) retranchée à l'entrée du dernier étage à partir de td ; commande limitée à ± umax si donnée */
function simL(o){
  const tl=o.tl, n=tl.length, N=o.n||3000, dt=o.tmax/N, t0=o.t0||0, Ki=o.Ki||0, Kd=o.Kd||0, dist=t=>o.td!=null&&t>=o.td?o.d:0;
  const der=(t,s)=>{ const y=s[n-1], e=(t>=t0?o.r:0)-y, lastIn=u=>(n===1?o.K*u:s[n-2])-dist(t);
    let u=o.Kp*e+Ki*s[n]; if(Kd&&n>1) u-=Kd*(lastIn(0)-y)/tl[n-1]; if(o.umax!=null) u=Math.max(-o.umax,Math.min(o.umax,u));
    const ds=[]; for(let i=0;i<n;i++) ds.push(((i===n-1?lastIn(u):i===0?o.K*u:s[i-1])-s[i])/tl[i]); ds.push(t>=t0?e:0); return ds; };
  let s=new Array(n+1).fill(0); const T=[0], Y=[0];
  for(let i=1;i<=N;i++){ const t=(i-1)*dt, k1=der(t,s), k2=der(t+dt/2,s.map((v,j)=>v+dt/2*k1[j])), k3=der(t+dt/2,s.map((v,j)=>v+dt/2*k2[j])), k4=der(t+dt,s.map((v,j)=>v+dt*k3[j]));
    s=s.map((v,j)=>v+dt/6*(k1[j]+2*k2[j]+2*k3[j]+k4[j])); T.push(i*dt); Y.push(s[n-1]); }
  return {T,Y,f:interp(T,Y)};
}

/* ===== figures (préfixe fx_auto_) ===== */
/* graduations « rondes » */
const STEPS=[0.01,0.02,0.025,0.05,0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100,200,250,500,1000,2000,2500,5000];
const stepFor=(m,n)=>STEPS.find(s=>m/s<=n+1e-9)||m/n;
const decOf=st=>{ const s=String(+st.toPrecision(6)); const i=s.indexOf("."); return i<0?0:s.length-i-1; };
/* repère gradué : o.tmax, o.ymax, o.ymin ; o.xs, o.ys (pas des valeurs écrites), o.xm, o.ym (pas de la grille fine) ; o.xl, o.yl */
function fx_auto_frame(o){
  const X0=o.X0||60, Y0=o.Y0||204, W=o.W||308, H=o.H||166, y0=o.ymin||0;
  const xs=o.xs||stepFor(o.tmax,8), ys=o.ys||stepFor(o.ymax-y0,6);
  const xmax=Math.ceil(o.tmax/xs-1e-9)*xs, ymax=y0+Math.ceil((o.ymax-y0)/ys-1e-9)*ys, sx=W/xmax, sy=H/(ymax-y0);
  const X=t=>X0+t*sx, Y=v=>Y0-(v-y0)*sy;
  const xm=o.xm||(xs*sx>=56?xs/5:xs/2), ym=o.ym||(ys*sy>=56?ys/5:ys/2);
  let s="";
  for(let k=0;k*xm<=xmax*(1+1e-9);k++){ const maj=Math.abs(k*xm/xs-Math.round(k*xm/xs))<1e-6; s+=`<line x1="${X(k*xm).toFixed(1)}" y1="${Y0}" x2="${X(k*xm).toFixed(1)}" y2="${Y0-H}" class="v-grid"${maj?"":' style="stroke-opacity:.5"'}/>`; }
  for(let k=0;y0+k*ym<=ymax*(1+1e-9)+1e-12;k++){ const v=y0+k*ym, maj=Math.abs((v-y0)/ys-Math.round((v-y0)/ys))<1e-6; s+=`<line x1="${X0}" y1="${Y(v).toFixed(1)}" x2="${X0+W}" y2="${Y(v).toFixed(1)}" class="v-grid"${maj?"":' style="stroke-opacity:.5"'}/>`; }
  s+=L(X0,Y0,X0+W+12,Y0,"v-ink","k")+L(X0,Y0,X0,Y0-H-18,"v-ink","k");
  const dx=decOf(xs), dy=decOf(ys);
  for(let k=0;k*xs<=xmax*(1+1e-9);k++) s+=T(X(k*xs),Y0+16,nf(k*xs,dx),"v-lab s","middle");
  for(let k=0;y0+k*ys<=ymax*(1+1e-9)+1e-12;k++) s+=T(X0-6,Y(y0+k*ys)+4,nf(Math.abs(y0+k*ys)<1e-9?0:y0+k*ys,dy).replace("-","−"),"v-lab s","end");
  s+=T(X0+W+12,Y0+34,esc(o.xl||"t (s)"),"v-cap","end")+T(X0+8,Y0-H-8,esc(o.yl||""),"v-cap");
  return {s,X,Y,X0,Y0,W,H,xmax,ymax,y0,xs,ys,xm,ym};
}
/* couleurs des courbes : 0 bleu (accent), 1 orange, 2 vert ; tirets facultatifs (lisibilité sans couleur) */
const CK=["var(--accent)","var(--coulomb)","var(--c-auto)"];
const cst=(k,dash)=>`fill:none;stroke:${CK[k]};stroke-width:2.6;stroke-linejoin:round${dash?";stroke-dasharray:"+dash:""}`;
/* réponse(s) temporelle(s) :
   o.c = [{f, lab, lt, dx, dy, a, k, dash}] courbes (fonction du temps ; étiquette au point d'abscisse lt, ou en légende si lt absent) ;
   o.cons : niveau de consigne (o.t0 : instant de l'échelon) ; o.band : valeur finale entourée de la bande ± 5 % (o.bandW : demi-largeur absolue, o.bandTxt) ;
   o.hl = [{y, lab, dy, x, a}] ; o.vl = [{t, y, lab, dy, a}] (trait vertical de l'axe au point (t, y)) ;
   o.pts = [{t, y, lab, dx, dy, a, px, py}] points (px, py : projections sur les axes) ; o.tan = {t, y} tangente à l'origine (depuis t0) ; o.q : « ? » */
function fx_auto_rep(o){
  const fr=fx_auto_frame(o); let s=fr.s;
  const X=t=>fr.X(Math.max(0,Math.min(t,fr.xmax))), Y=v=>fr.Y(Math.max(fr.y0,Math.min(v,fr.ymax)));
  if(o.band!=null){ const hw=o.bandW!=null?o.bandW:0.05*Math.abs(o.band), a=Y(o.band+hw), b=Y(o.band-hw);
    s+=`<rect x="${fr.X0}" y="${a.toFixed(1)}" width="${fr.W}" height="${(b-a).toFixed(1)}" style="fill:var(--c-auto);fill-opacity:.13;stroke:none"/>`;
    s+=L(fr.X0,a,fr.X0+fr.W,a,"v-dash")+L(fr.X0,b,fr.X0+fr.W,b,"v-dash");
    const bl=o.bandLab||(o.cons!=null?"below":"above");
    if(bl!=="none") s+=Th(fr.X0+fr.W-2,bl==="below"?b+14:a-5,esc(o.bandTxt||"bande ± 5 %"),"v-cap","end"); }
  if(o.cons!=null){ const t0=o.t0||0, yc=Y(o.cons);
    s+=t0>0?`<polyline points="${P2([X(0),fr.Y0])} ${P2([X(t0),fr.Y0])} ${P2([X(t0),yc])} ${P2([fr.X0+fr.W,yc])}" class="v-inf"/>`:L(fr.X0,yc,fr.X0+fr.W,yc,"v-inf");
    s+=Th(o.consX!=null?X(o.consX):fr.X0+fr.W-2,yc+(o.consDy||-6),esc(o.consLab||"consigne"),"v-cap",o.consX!=null?"start":"end"); }
  (o.hl||[]).forEach(h=>{ const y=Y(h.y); s+=L(h.x0!=null?X(h.x0):fr.X0,y,fr.X0+fr.W,y,"v-dash"); if(h.lab) s+=Th(h.x!=null?X(h.x):fr.X0+fr.W-2,y+(h.dy||-6),esc(h.lab),"v-cap",h.a||"end"); });
  (o.vl||[]).forEach(v=>{ const x=X(v.t); s+=L(x,fr.Y0,x,v.y!=null?Y(v.y):fr.Y0-fr.H,"v-dash"); if(v.lab) s+=Th(x+(v.a==="end"?-4:v.a==="middle"?0:4),v.ly!=null?Y(v.ly):fr.Y0-(v.dy||8),esc(v.lab),v.cls||"v-cap",v.a||"start"); });
  if(o.tan){ const t0=o.t0||0; s+=`<line x1="${X(t0).toFixed(1)}" y1="${fr.Y0}" x2="${X(o.tan.t).toFixed(1)}" y2="${Y(o.tan.y).toFixed(1)}" style="stroke:var(--ink-2);stroke-width:1.4;stroke-dasharray:6 3"/>`;
    if(o.tan.lab!==false) s+=Th(X(o.tan.t)+(o.tan.dx==null?6:o.tan.dx),Y(o.tan.y)+(o.tan.dy==null?-8:o.tan.dy),esc(o.tan.lab||"tangente à l'origine"),"v-cap",o.tan.a||"start"); }
  o.c.forEach((c,i)=>{ const k=c.k==null?i:c.k, n=c.n||360; let seg=[], prev=null;
    const flush=()=>{ if(seg.length>1) s+=`<polyline points="${seg.join(" ")}" style="${cst(k,c.dash)}"/>`; seg=[]; };
    for(let j=0;j<=n;j++){ const t=fr.xmax*j/n, v=c.f(t), inside=v<=fr.ymax+1e-9&&v>=fr.y0-1e-9, p=P2([X(t),Y(v)]);
      if(inside){ if(!seg.length&&prev) seg.push(prev); seg.push(p); prev=null; }
      else { if(seg.length){ seg.push(p); flush(); } prev=p; } }
    flush();
    if(c.lab&&c.lt!=null){ const x=X(c.lt)+(c.dx==null?6:c.dx), y=Y(c.f(c.lt))+(c.dy==null?-8:c.dy);
      s+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="v-lab s" text-anchor="${c.a||"start"}" style="fill:${CK[k]};paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round">${esc(c.lab)}</text>`; }
  });
  (o.pts||[]).forEach(p=>{ const x=X(p.t), y=Y(p.y);
    if(p.px) s+=L(x,y,x,fr.Y0,"v-dash"); if(p.py) s+=L(fr.X0,y,x,y,"v-dash");
    s+=dot(x,y); if(p.lab) s+=Th(x+(p.dx==null?7:p.dx),y+(p.dy==null?-8:p.dy),esc(p.lab),"v-lab s",p.a||"start"); });
  const lg=o.c.filter(c=>c.lab&&c.lt==null);
  if(lg.length){ const w=o.legW||Math.max(...lg.map(c=>c.lab.length))*6.4+44, h=lg.length*17+8, lx=o.legX!=null?o.legX:fr.X0+fr.W-w-6, ly=o.legY!=null?o.legY:fr.Y0-h-6;
    s+=`<rect x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="3" class="v-box"/>`;
    lg.forEach((c,j)=>{ const k=c.k==null?o.c.indexOf(c):c.k, yy=ly+14+j*17; s+=`<line x1="${(lx+8).toFixed(1)}" y1="${(yy-4).toFixed(1)}" x2="${(lx+32).toFixed(1)}" y2="${(yy-4).toFixed(1)}" style="${cst(k,c.dash)}"/>`+T(lx+38,yy,esc(c.lab),"v-cap"); }); }
  if(o.q) s+=Th(o.q.x!=null?X(o.q.x):fr.X0+fr.W/2,o.q.y!=null?Y(o.q.y):fr.Y0-fr.H/2,"?","v-q","middle");
  return svg(o.h||246,s,o.alt||"Réponse temporelle à un échelon de consigne");
}
/* axes « ronds » : valeur haute → {ymax, ys, ym} ; durée → {tmax, xs, xm} (grille fine : 5 ou 2 sous-divisions, comme fx_auto_frame) */
function axY(top){ const ys=stepFor(top,6), ymax=+(Math.ceil(top/ys-1e-9)*ys).toPrecision(8); return {ymax,ys,ym:ys*166/ymax>=56?ys/5:ys/2}; }
function axT(top){ const xs=stepFor(top,8), tmax=+(Math.ceil(top/xs-1e-9)*xs).toPrecision(8); return {tmax,xs,xm:xs*308/tmax>=56?xs/5:xs/2}; }
/* comparateur (ou sommateur) : cercle barré d'une croix */
const cmpC=(x,y,r)=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" class="v-box"/>`+L(x-r*0.7,y-r*0.7,x+r*0.7,y+r*0.7,"v-thin")+L(x-r*0.7,y+r*0.7,x+r*0.7,y-r*0.7,"v-thin");
/* bloc rectangulaire : titre en gras (lignes coupées par un tiret comprises), lignes suivantes en maigre ; q : bloc inconnu « ? » */
function bk(x,y,w,h,lines,q){
  if(q) return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="4" class="v-boxq"/>`+T(x+w/2,y+h/2+6,"?","v-lab c","middle");
  const n=lines.length, y0=y+h/2-(n-1)*6.5+4; let bold=true;
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="4" class="v-box"/>`+lines.map((l,i)=>{
    const b=bold&&!/=/.test(l); bold=b&&/-$/.test(l);
    const cls=b?(l.length*6.5>w-6?"v-sm\" style=\"font-weight:600":"v-smb"):"v-sm";
    return T(x+w/2,y0+i*13,esc(l),cls,"middle"); }).join("");
}
/* schéma-bloc d'une boucle d'asservissement (ou d'une chaîne ouverte) :
   o.e : étiquette de l'entrée ; o.a : lignes de l'adaptateur (facultatif), o.ea : étiquette après l'adaptateur ;
   o.cmp : comparateur (défaut : présent si boucle) ; o.sg : signes [entrée gauche, entrée basse] ;
   o.d : lignes des blocs de la chaîne directe ; o.lk : étiquettes des liens après le comparateur (0 : écart ; i + 1 : après le bloc i ; la dernière est la sortie) ;
   o.r : lignes du bloc de retour (null : retour unitaire) ; o.lr : étiquette après le bloc de retour ; o.open : chaîne ouverte (o.lk[i] : après le bloc i) ;
   o.num : {e, ea, 0…n, r} liens numérotés ; o.q : élément remplacé par « ? » (0…n−1, "a", "r", "c") ;
   o.p : perturbation {at, lab, t, sg} : sommateur après le bloc at, entrée par le haut */
function fx_auto_bloc(o){
  const n=o.d.length, loop=!o.open, hasC=o.cmp!=null?o.cmp:loop, hasA=!!o.a, P=o.p, g=o.g||(n>=3?18:22), dC=22, rC=11;
  const tw=t=>String(t||"").length*7.5+4, kB=i=>hasC?i+1:i;
  const outKey=kB(n-1), outLab=(o.lk||[])[outKey], numOut=o.num&&o.num[outKey]!=null, pEnd=P&&P.at===n-1;
  const Lin=o.lin||(hasA?28:Math.max(36,Math.min(60,tw(o.e)-6))), Lp=loop?(pEnd?Math.max(34,numOut?30:tw(outLab)+8):(numOut?30:24)):0, Lout=o.lout||(loop?Lp+16:40);
  const it=[]; if(hasA) it.push({k:"a"}); if(hasC) it.push({k:"c",w:dC});
  o.d.forEach((b,i)=>{ it.push({k:"b",i}); if(P&&P.at===i) it.push({k:"s",w:dC}); });
  const fw=it.filter(x=>x.w).reduce((a,x)=>a+x.w,0), wa=hasA?Math.min(o.wa||64,90):0, nb=it.filter(x=>x.k==="b").length;
  const w=Math.min(o.wmax||100,(392-Lin-Lout-fw-wa-(it.length-1)*g)/nb);
  it.forEach(x=>{ if(!x.w) x.w=x.k==="a"?wa:w; });
  let x0=4+Lin; it.forEach(x=>{ x.x=x0; x0+=x.w+g; });
  const lastR=it[it.length-1].x+it[it.length-1].w, xp=lastR+Lp;
  /* liens de la chaîne directe */
  const links=[{x1:4,x2:it[0].x,key:"e",first:true}];
  for(let j=0;j<it.length-1;j++){ const f=it[j], t=it[j+1]; links.push({x1:f.x+f.w,x2:t.x,key:f.k==="a"?"ea":f.k==="c"?0:f.k==="s"?kB(it[j-1].i):t.k==="s"?"p0":kB(f.i),toS:t.k==="s",fromS:f.k==="s"}); }
  links.push({x1:lastR,x2:396,last:true,key:outKey,fromS:it[it.length-1].k==="s"});
  const labOf=k=>k==="e"?o.e:k==="ea"?o.ea:k==="p0"?(P&&P.l0):(o.lk||[])[k];
  /* étiquettes au-dessus des liens, sur deux niveaux pour éviter les chevauchements */
  const labs=[];
  links.forEach(l=>{ const nk=o.num&&o.num[l.key]!=null?o.num[l.key]:null, t=labOf(l.key);
    if(nk==null&&!t) return; if(l.key==="p0"&&nk==null) return;
    let x,a; if(l.first){ x=nk!=null?(l.x1+l.x2)/2:4; a=nk!=null?"middle":"start"; } else if(l.last){ const mid=nk!=null||pEnd; x=mid?(loop?(lastR+xp)/2:(l.x1+l.x2)/2):396; a=mid?"middle":"end"; } else { x=(l.x1+l.x2)/2; a="middle"; }
    const wd=nk!=null?24:tw(t), x1=a==="start"?x:a==="end"?x-wd:x-wd/2;
    labs.push({x,a,wd,x1,x2:x1+wd,t,nk,tier:0}); });
  labs.sort((p,q)=>p.x1-q.x1);
  for(let i=1;i<labs.length;i++){ const prev=labs.slice(0,i).filter(l=>l.tier===0).pop(); if(prev&&labs[i].x1<prev.x2+3) labs[i].tier=1; }
  const up=labs.some(l=>l.tier===1)?14:0, yc=(P?(P.t?104:82):62)+up, h=o.bh||(o.d.some(d=>d.length>2)?52:44), yr=yc+(o.dyr||h/2+52);
  let s="";
  links.forEach(l=>{ s+=L(l.x1,yc,l.x2-(l.last?0:1),yc,"v-ink","k"); });
  labs.forEach(l=>{ const y=yc-30-l.tier*14; s+=l.nk!=null?numLab(l.x,y+2,String(l.nk)):T(l.x,y,esc(l.t),"v-lab s",l.a); });
  /* éléments */
  it.forEach(e=>{
    if(e.k==="a") s+=bk(e.x,yc-h/2,e.w,h,o.a,o.q==="a");
    else if(e.k==="b") s+=bk(e.x,yc-h/2,e.w,h,o.d[e.i],o.q===e.i);
    else { const cx=e.x+rC;
      s+=o.q===e.k?`<circle cx="${cx}" cy="${yc}" r="${rC}" class="v-boxq"/>`+T(cx,yc+5,"?","v-lab c","middle"):cmpC(cx,yc,rC);
      if(e.k==="c"){ const sg=o.sg||["+","−"]; s+=T(cx-16,yc-5,sg[0],sg[0]==="?"?"v-lab c":"v-lab","middle"); if(loop) s+=T(cx-16,yc+26,sg[1],sg[1]==="?"?"v-lab c":"v-lab","middle"); }
      else { const sg=P.sg||["+","−"]; s+=T(cx-17,yc-7,sg[0],"v-lab","middle")+T(cx+15,yc-15,sg[1],"v-lab","middle");
        if(P.t){ const pw=Math.max(44,Math.max(...P.t.map(t=>t.length))*7+14); s+=L(cx,18,cx,27,"v-ink","k")+bk(cx-pw/2,28,pw,28,P.t,false)+L(cx,56,cx,yc-rC-1,"v-ink","k"); }
        else s+=L(cx,18,cx,yc-rC-1,"v-ink","k");
        s+=T(cx+7,14,esc(P.lab),"v-lab s","start"); }
    }
  });
  /* chaîne de retour */
  let Ht=yc+h/2+14;
  if(loop){ const c=it.find(e=>e.k==="c"), xc=c.x+rC;
    s+=`<circle cx="${xp}" cy="${yc}" r="3" class="v-pt"/>`;
    if(o.r){ const wr=o.wr||Math.min(136,Math.max(56,Math.max(...o.r.map(t=>t.length))*6.8+18)), hr=o.hr||(o.r.length>2?48:36);
      let bx=Math.max((xc+xp)/2-wr/2,xc+16+(o.lr?tw(o.lr):0)); bx=Math.min(bx,xp-wr-20);
      s+=`<polyline points="${P2([xp,yc])} ${P2([xp,yr])} ${P2([bx+wr+1,yr])}" class="v-ink" marker-end="url(#m-k)"/>`;
      s+=bk(bx,yr-hr/2,wr,hr,o.r,o.q==="r");
      s+=`<polyline points="${P2([bx,yr])} ${P2([xc,yr])} ${P2([xc,yc+rC+1])}" class="v-ink" marker-end="url(#m-k)"/>`;
      const nk=o.num&&o.num.r!=null?o.num.r:null, lx=(xc+bx)/2;
      if(nk!=null) s+=numLab(lx,yr+22,String(nk)); else if(o.lr) s+=T(Math.max(lx,xc+6+tw(o.lr)/2),yr+20,esc(o.lr),"v-lab s","middle");
      if(o.lp) s+=T((bx+wr+xp)/2,yr+20,esc(o.lp),"v-lab s","middle");
      Ht=yr+hr/2+16; }
    else { s+=`<polyline points="${P2([xp,yc])} ${P2([xp,yr])} ${P2([xc,yr])} ${P2([xc,yc+rC+1])}" class="v-ink" marker-end="url(#m-k)"/>`;
      if(o.lr) s+=T((xc+xp)/2,yr+18,esc(o.lr),"v-lab s","middle"); Ht=yr+26; }
  }
  if(o.cap){ s+=T(200,Ht+4,esc(o.cap),"v-cap","middle"); Ht+=16; }
  return svg(Ht,s,o.alt||(loop?"Schéma-bloc d'une boucle d'asservissement":"Schéma-bloc : blocs en série"));
}
/* détail d'un comparateur : o.e1, o.e2 (étiquettes des entrées), o.s (sortie), o.sg (signes) */
function fx_auto_cmp(o){
  const xc=200, yc=58, r=14, sg=o.sg||["+","−"];
  let s=L(40,yc,xc-r-1,yc,"v-ink","k")+L(xc,yc+86,xc,yc+r+1,"v-ink","k")+L(xc+r,yc,360,yc,"v-ink","k")+cmpC(xc,yc,r);
  s+=T(40,yc-12,esc(o.e1),"v-lab s")+T(xc+10,yc+84,esc(o.e2),"v-lab s")+T(360,yc-12,esc(o.s),"v-lab s","end");
  s+=T(xc-22,yc-10,sg[0],"v-lab","middle")+T(xc-18,yc+32,sg[1],"v-lab","middle");
  if(o.cap) s+=T(200,yc+112,esc(o.cap),"v-cap","middle");
  return svg(o.cap?182:160,s,"Comparateur : deux entrées signées, une sortie");
}

/* ===== données et outils communs aux trois notions ===== */
const CIRC=["①","②","③","④","⑤","⑥","⑦"];
/* bruit de mesure (nul au départ) */
function noisy(f,A,tm){ const p1=Math.random()*6.28, p2=Math.random()*6.28, w1=2*Math.PI*7.3/tm, w2=2*Math.PI*12.7/tm; return t=>f(t)+A*(Math.sin(w1*t+p1)+0.5*Math.sin(w2*t+p2))*(1-Math.exp(-t/(0.06*tm))); }
/* valeur « ronde » immédiatement inférieure */
function niceDown(x){ const p=10**Math.floor(Math.log10(x)); for(const m of [8,6,5,4,3,2.5,2,1.5,1.2,1]) if(m*p<=x*(1+1e-9)) return +(m*p).toPrecision(6); return p; }
/* systèmes asservis : blocs de la figure (B : chaîne directe, R : retour) et constituants (N : correcteur, préactionneur, actionneur, capteur) */
const SYS=[
  {nm:"l'asservissement de vitesse d'un robot mobile",y:"ω",u:"rad/s",g:"la vitesse de rotation du moteur",B:[["Micro-","contrôleur"],["Hacheur"],["Moteur"]],R:["Codeur"],
   N:["le microcontrôleur","le hacheur","le moteur à courant continu","le codeur incrémental"]},
  {nm:"la régulation de température d'une serre connectée",y:"θ",u:"°C",g:"la température de l'air",B:[["Micro-","contrôleur"],["Gradateur"],["Radiateur","+ serre"]],R:["Sonde"],
   N:["le microcontrôleur","le gradateur","le radiateur électrique","la sonde de température"]},
  {nm:"l'asservissement d'altitude d'un drone",y:"z",u:"m",g:"l'altitude",B:[["Carte","de vol"],["Variateurs"],["Moteurs","+ hélices"]],R:["Capteur","à ultrasons"],
   N:["la carte de vol","les variateurs électroniques","les moteurs brushless","le capteur à ultrasons"]},
  {nm:"le pilote automatique de cap d'un bateau",y:"ψ",u:"°",g:"le cap",B:[["Calcula-","teur"],["Hacheur"],["Vérin","+ bateau"]],R:["Compas"],
   N:["le calculateur du pilote","le hacheur","le vérin électrique de barre","le compas électronique"]},
  {nm:"la régulation de niveau d'une citerne d'eau de pluie",y:"h",u:"m",g:"le niveau d'eau",B:[["Automate"],["Variateur"],["Moto-","pompe"]],R:["Capteur","de niveau"],
   N:["l'automate programmable","le variateur de vitesse","la motopompe","le capteur de niveau à ultrasons"]},
  {nm:"l'asservissement de position d'un bras de robot",y:"θ",u:"°",g:"la position angulaire du bras",B:[["Carte de","commande"],["Hacheur"],["Moto-","réducteur"]],R:["Potentio-","mètre"],
   N:["la carte de commande","le hacheur","le motoréducteur","le potentiomètre"]},
  {nm:"la régulation de vitesse d'un tapis roulant",y:"v",u:"m/s",g:"la vitesse du tapis",B:[["Automate"],["Variateur"],["Moteur","+ tapis"]],R:["Codeur"],
   N:["l'automate programmable","le variateur de vitesse","le moteur asynchrone","le codeur incrémental"]},
  {nm:"l'orientation d'un panneau solaire suiveur",y:"α",u:"°",g:"l'inclinaison du panneau",B:[["Micro-","contrôleur"],["Hacheur"],["Vérin","électrique"]],R:["Inclino-","mètre"],
   N:["le microcontrôleur","le hacheur","le vérin électrique","l'inclinomètre"]}
];
const loopFig=(S,o)=>fx_auto_bloc(Object.assign({e:"Uc (V)",d:S.B,lk:["ε (V)","Ucom (V)","U (V)",`${S.y} (${S.u})`],r:S.R,lr:"Umes (V)"},o||{}));
const ROLE=(S,k,sj)=>[
  `${sj} reçoit l'écart ε calculé par le comparateur et élabore la commande Ucom : c'est ${F("le correcteur")} (fonction traiter), réalisé ici par ${S.N[0]}.`,
  `${sj} reçoit la commande Ucom, un signal de faible puissance, et module l'énergie envoyée à l'actionneur : c'est ${F("le préactionneur")} (fonction moduler), ici ${S.N[1]}.`,
  `${sj} reçoit l'énergie électrique et agit sur ${S.g} : c'est ${F("l'actionneur")} (fonction convertir), ici ${S.N[2]}.`,
  `${sj} est dans la chaîne de retour : il mesure ${S.g} et la convertit en une tension Umes, comparée à la consigne. C'est ${F("le capteur")} (fonction acquérir), ici ${S.N[3]}.`][k];
/* réponses du premier ordre : grandeur, unités, échelles de temps (valeurs lisibles sur la grille fine) */
const C1=[
  {s:"la vitesse de rotation d'un moteur",yl:"ω (rad/s)",u:"rad/s",sf:[100,120,150,180,200,240],tu:"s",T:[{tmax:2,xs:0.5,xm:0.1,tau:[0.3,0.4]},{tmax:1,xs:0.25,xm:0.05,tau:[0.15,0.2]}]},
  {s:"la vitesse d'un tapis roulant",yl:"v (m/s)",u:"m/s",sf:[0.4,0.5,0.6,0.8,1,1.2],tu:"s",T:[{tmax:4,xs:0.5,xm:0.1,tau:[0.3,0.4,0.5,0.6,0.8]},{tmax:2,xs:0.5,xm:0.1,tau:[0.3,0.4]}]},
  {s:"l'élévation de température d'une étuve de séchage",yl:"Δθ (°C)",u:"°C",sf:[30,40,50,60],tu:"min",T:[{tmax:60,xs:10,xm:2,tau:[6,8,10,12]},{tmax:100,xs:20,xm:5,tau:[15,20]}]},
  {s:"le niveau d'une citerne",yl:"h (m)",u:"m",sf:[1,1.2,1.5,1.8,2],tu:"min",T:[{tmax:30,xs:5,xm:1,tau:[3,4,5,6]}]},
  {s:"le débit d'une motopompe",yl:"Q (L/min)",u:"L/min",sf:[20,25,30,40],tu:"s",T:[{tmax:4,xs:0.5,xm:0.1,tau:[0.4,0.5,0.6,0.8]}]}
];
const onGrid=(v,st)=>Math.abs(v/st-Math.round(v/st))<1e-6;
/* « de » + article : de le → du, de les → des */
const deX=s=>s.replace(/^le /,"du ").replace(/^la /,"de la ").replace(/^l'/,"de l'").replace(/^les /,"des ");

/* ======================================================================
   SCHÉMA-BLOC, FONCTION DE TRANSFERT — auto-schema-bloc
   ====================================================================== */
const SB1=[
  /* constituant à la place du « ? » */
  ()=>{ const S=rnd(SYS), k=ri(0,3);
    return {fig:loopFig(S,{q:k<3?k:"r"}),ctx:`Schéma-bloc de ${S.nm}.`,q:"Quel constituant occupe la place du « ? » dans ce schéma-bloc ?",type:"ch",...mc(cap(S.N[k]),S.N.filter((_,i)=>i!==k).map(cap)),
      expl:ROLE(S,k,"Le bloc « ? »")}; },
  /* signal repéré par un numéro */
  ()=>{ const nums=shuffle([1,2,3,4,5,6]), keys=["e",0,1,2,3,"r"], num={}; keys.forEach((k,i)=>num[k]=nums[i]);
    const SIG={e:"La consigne, convertie en tension",0:"L'écart entre la consigne et la mesure",1:"La commande élaborée par le correcteur",3:"La grandeur de sortie, asservie",r:"La mesure de la sortie, fournie par le capteur"};
    const NOM={e:"la consigne",0:"l'écart ε",1:"la commande",3:"la grandeur de sortie",r:"la mesure"};
    const EX={e:"c'est l'entrée de la boucle, la valeur souhaitée, convertie en tension pour être comparée à la mesure.",0:"c'est la sortie du comparateur, ε = consigne − mesure.",1:"c'est la sortie du correcteur, élaborée à partir de l'écart ; elle pilote le préactionneur.",3:"c'est la grandeur que l'on asservit, en sortie de l'actionneur ; le capteur la mesure.",r:"c'est la sortie du capteur, dans la chaîne de retour : l'image de la sortie, comparée à la consigne."};
    const all=["e","0","1","3","r"], ask=rnd(all), c=CIRC[num[ask]-1];
    return {fig:fx_auto_bloc({e:"",d:[["Correcteur"],["Préaction-","neur"],["Actionneur","+ système"]],r:["Capteur"],num}),ctx:"Schéma-bloc d'un système asservi : les signaux sont repérés par des numéros.",
      q:`Que représente le signal repéré ${c} sur ce schéma-bloc ?`,type:"ch",...mc(SIG[ask],shuffle(all.filter(k=>k!==ask)).slice(0,3).map(k=>SIG[k])),
      expl:`Le signal ${c} est ${F(NOM[ask])} : ${EX[ask]}`}; },
  /* écart en sortie du comparateur */
  ()=>{ const sys=rnd(["la régulation de température d'un chauffe-eau solaire","l'asservissement de vitesse d'un tapis roulant","la régulation de niveau d'une citerne","l'asservissement d'altitude d'un drone","le pilote automatique d'un bateau"]);
    const Uc=r2(1.5+Math.random()*6,2), d=rnd([0.04,0.06,0.08,0.1,0.12,0.15,0.18,0.24,0.3,0.36,0.42]), Um=r2(Uc-d,2), e=r2(Uc-Um,2);
    return {fig:fx_auto_cmp({e1:`Uc = ${nfd(Uc,2)} V`,e2:`Umes = ${nfd(Um,2)} V`,s:"ε = ?"}),ctx:`Dans ${sys}, le comparateur reçoit la tension de consigne Uc et la tension de mesure Umes fournie par le capteur.`,
      q:"Calcule l'écart ε en sortie du comparateur.",type:"num",ans:e,tolR:0.02,unit:"V",
      expl:`${F("ε = Uc − Umes")} = ${nfd(Uc,2)} − ${nfd(Um,2)} = ${U(e,"V")}. L'écart est positif : la mesure est inférieure à la consigne, le correcteur augmente la commande.`}; },
  /* blocs en série : produit des gains */
  ()=>{ const v=ri(0,2); let o;
    if(v===0){ const K1=rnd([2,2.4,3,4,5]), K2=rnd([12,15,18,20,25,30]), k=rnd([8,10,16,20,25]);
      o={fig:fx_auto_bloc({open:true,e:"Ucom (V)",d:[["Hacheur",`K1 = ${nf(K1,1)}`],["Moteur",`K2 = ${K2}`,"(rad/s)/V"],["Réducteur",`K3 = ${nf(1/k,4)}`]],lk:["Um (V)","ωm (rad/s)","ωs (rad/s)"]}),
        ctx:`Chaîne directe d'un robot : hacheur (K1, sans unité), moteur (K2) et réducteur de rapport K3 = ${FRAC(1,k)}.`,K:K1*K2/k,u:"(rad/s)/V",calc:`${nf(K1,1)} × ${K2} × ${FRAC(1,k)}`,un:"Entrée en V, sortie en rad/s : le gain global s'exprime en (rad/s)/V."}; }
    else if(v===1){ const K1=rnd([0.01,0.02]), K2=rnd([5,10,20,25]), n=rnd([8,10,12]), K3=2**n/5;
      o={fig:fx_auto_bloc({open:true,e:"θ (°C)",d:[["Sonde",`K1 = ${nf(K1,2)}`,"V/°C"],["Amplifi-","cateur",`K2 = ${K2}`],["CAN",`K3 = ${nf(K3,1)}`,"point/V"]],lk:["U1 (V)","U2 (V)","N (points)"]}),
        ctx:`Chaîne d'acquisition d'une température : sonde (K1), amplificateur (K2, sans unité) et convertisseur analogique-numérique ${n} bits (K3, en point/V).`,K:K1*K2*K3,u:"point/°C",calc:`${nf(K1,2)} × ${K2} × ${nf(K3,1)}`,un:"Entrée en °C, sortie N en points : le gain global s'exprime en point/°C."}; }
    else { const K1=rnd([10,12,15,20,25]), k=rnd([8,10,16,20,25]), R=rnd([0.03,0.04,0.05,0.06]);
      o={fig:fx_auto_bloc({open:true,e:"U (V)",d:[["Moteur",`K1 = ${K1}`,"(rad/s)/V"],["Réducteur",`K2 = ${nf(1/k,4)}`],["Roue",`K3 = ${nf(R,2)} m`]],lk:["ωm (rad/s)","ωr (rad/s)","v (m/s)"]}),
        ctx:`Chaîne de transmission d'un robot : moteur (K1), réducteur de rapport K2 = ${FRAC(1,k)} et roue de rayon R = ${nf(R*1000,0)} mm, de gain K3 = R (v = R·ωr).`,K:K1*R/k,u:"(m/s)/V",calc:`${K1} × ${FRAC(1,k)} × ${nf(R,2)}`,un:"Entrée en V, sortie en m/s : le gain global s'exprime en (m/s)/V."}; }
    return {fig:o.fig,ctx:o.ctx,q:"Calcule le gain statique K de l'ensemble des trois blocs.",type:"num",ans:o.K,tolR:0.02,unit:o.u,
      expl:`Blocs en série : les gains se multiplient, ${F("K = K1·K2·K3")} = ${o.calc} = ${U(o.K,o.u)}. ${o.un}`}; },
  /* gain statique mesuré en régime permanent */
  ()=>{ const c=rnd([
      {t:(a,b)=>`Alimenté sous U = ${nf(a)} V, un moteur tourne en régime permanent à ω = ${nf(b,2)} rad/s.`,a:[6,9,12,18,24],k:[8,10,12,15,20,25],u:"(rad/s)/V",ua:"V",ub:"rad/s",nm:"du moteur"},
      {t:(a,b)=>`Une sonde de température fournit une tension proportionnelle à la température : ${nf(b,3)} V à ${nf(a)} °C.`,a:[20,25,30,40,50],k:[0.01,0.02,0.025,0.05],u:"V/°C",ua:"°C",ub:"V",nm:"de la sonde"},
      {t:(a,b)=>`Alimenté sous ${nf(a)} V, un vérin électrique sort sa tige à ${nf(b,2)} mm/s en régime permanent.`,a:[12,24],k:[1.5,2,2.5,4],u:"(mm/s)/V",ua:"V",ub:"mm/s",nm:"du vérin"},
      {t:(a,b)=>`Commandée sous ${nf(a)} V, une motopompe débite ${nf(b,2)} L/min en régime permanent.`,a:[5,8,10],k:[1.2,1.5,2,2.5,3],u:"(L/min)/V",ua:"V",ub:"L/min",nm:"de la motopompe"},
      {t:(a,b)=>`Un capteur de niveau fournit ${nf(b,2)} V quand l'eau est à ${nf(a,2)} m.`,a:[0.8,1.2,1.5,2],k:[1,1.5,2,2.5],u:"V/m",ua:"m",ub:"V",nm:"du capteur de niveau"},
      {t:(a,b)=>`Chauffée par une puissance de ${nf(a,1)} kW, une étuve de séchage se stabilise ${nf(b,1)} °C au-dessus de la température ambiante.`,a:[1,1.5,2,2.5],k:[8,10,12,15,20],u:"°C/kW",ua:"kW",ub:"°C",nm:"de l'étuve"}]);
    const a=rnd(c.a), k=rnd(c.k), b=r2(a*k,6);
    return {ctx:c.t(a,b),q:`Calcule le gain statique K ${c.nm}.`,type:"num",ans:k,tolR:0.02,unit:c.u,
      expl:`En régime permanent, ${F(`K = ${FRAC("sortie","entrée")}`)} = ${FRAC(`${nf(b,3)} ${c.ub}`,`${nf(a,2)} ${c.ua}`)} = ${U(k,c.u)}. Son unité est celle de la sortie divisée par celle de l'entrée.`}; },
  /* valeur finale d'un premier ordre */
  ()=>{ const c=rnd([
      {s:"d'un moteur à courant continu (entrée : tension, sortie : vitesse de rotation)",u:"rad/s",ku:"(rad/s)/V",K:[8,10,12,15,20],tau:[0.05,0.08,0.1,0.15,0.2],tu:"s",E:[6,9,12,18,24],eu:"V",g:"la vitesse de rotation"},
      {s:"d'un chauffe-eau (entrée : puissance de la résistance, sortie : élévation de température de l'eau)",u:"°C",ku:"°C/kW",K:[10,12,15,20],tau:[20,30,40,50],tu:"min",E:[1.5,2,2.5,3],eu:"kW",g:"l'élévation de température"},
      {s:"d'un vérin électrique (entrée : tension, sortie : vitesse de la tige)",u:"mm/s",ku:"(mm/s)/V",K:[1.5,2,2.5,4],tau:[0.02,0.04,0.05],tu:"s",E:[12,24],eu:"V",g:"la vitesse de la tige"},
      {s:"d'une motopompe (entrée : tension de commande, sortie : débit)",u:"L/min",ku:"(L/min)/V",K:[1.2,1.5,2,2.5],tau:[0.5,0.8,1.2],tu:"s",E:[5,8,10],eu:"V",g:"le débit"}]);
    const K=rnd(c.K), tau=rnd(c.tau), E=rnd(c.E), sf=r2(K*E,6);
    return {ctx:`Modèle ${c.s} : ${F(`H(p) = ${FRAC(nf(K,2),`1 + ${nf(tau,2)}·p`)}`)}, avec K en ${c.ku} et τ en ${c.tu}. On applique en entrée un échelon de ${nf(E,1)} ${c.eu}.`,
      q:`Quelle valeur atteint ${c.g} en régime permanent ?`,type:"num",ans:sf,tolR:0.02,unit:c.u,
      expl:`En régime permanent, ${F("s∞ = K·E0")} = ${nf(K,2)} × ${nf(E,1)} = ${U(sf,c.u)}. La constante de temps τ = ${nf(tau,2)} ${c.tu} ne change pas la valeur finale : elle fixe la durée du régime transitoire.`}; },
  /* lire la constante de temps (63 %) */
  ()=>{ const c=rnd(C1), T=rnd(c.T), tau=rnd(T.tau), sf=rnd(c.sf), A=axY(1.2*sf);
    const fig=fx_auto_rep({tmax:T.tmax,xs:T.xs,xm:T.xm,...A,yl:c.yl,xl:`t (${c.tu})`,c:[{f:ord1(sf,tau)}],hl:[{y:sf,lab:`valeur finale : ${wu(sf,c.u)}`},{y:0.63*sf,lab:"63 % de la valeur finale",dy:14}]});
    return {fig,ctx:`Réponse indicielle ${deX(c.s)}, modélisée par un premier ordre.`,q:"Lis la constante de temps τ de ce premier ordre.",type:"num",ans:tau,tolA:0.3*T.xm,unit:c.tu,
      expl:`À t = τ, un premier ordre atteint 63 % de sa valeur finale : 0,63 × ${wu(sf,c.u)} = ${wu(0.63*sf,c.u,3)}. La courbe coupe ce niveau à ${F(`τ = ${S3(tau)} ${c.tu}`)}.`}; },
  /* cours : premier ordre */
  ()=>{ const K=[
      ["Pour un système du premier ordre, quel pourcentage de sa valeur finale la sortie atteint-elle à l'instant t = τ ?","63 %",["50 %","95 %","100 %"],`À t = τ, la sortie vaut ${F("63 %")} de sa valeur finale (1 − e<sup>−1</sup> ≈ 0,63). C'est ainsi qu'on lit τ sur une réponse indicielle.`],
      ["Pour un système du premier ordre de constante de temps τ, que vaut le temps de réponse à 5 % ?","t5% ≈ 3τ",["t5% = τ","t5% ≈ 2τ","t5% ≈ 5τ"],`À t = 3τ, la sortie atteint 95 % de sa valeur finale ; sans dépassement, elle reste ensuite dans la bande ± 5 % : ${F("t5% ≈ 3τ")}.`],
      ["Sur la réponse indicielle d'un premier ordre, à quel instant la tangente à l'origine coupe-t-elle l'asymptote de la valeur finale ?","À t = τ",["À t = 3τ",`À t = ${FRAC("τ","2")}`,"Jamais : elle lui est parallèle"],`La tangente à l'origine a pour pente ${FRAC("s∞","τ")} : elle atteint s∞ à ${F("t = τ")}. C'est la deuxième façon de lire τ, avec le point à 63 %.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* cours : boucle ouverte ou boucle fermée */
  ()=>{ const K=[
      ["Qu'est-ce qui distingue un système asservi (en boucle fermée) d'un système commandé en boucle ouverte ?","Sa sortie est mesurée par un capteur et comparée en permanence à la consigne",["Il consomme toujours moins d'énergie","Il ne possède pas d'actionneur","Sa sortie est toujours exactement égale à la consigne"],`En boucle fermée, ${F("le capteur")} renvoie la mesure de la sortie au comparateur : la commande dépend de l'écart consigne − mesure. En boucle ouverte, la commande ignore le résultat obtenu.`],
      ["Quel est l'intérêt principal d'une boucle fermée par rapport à une commande en boucle ouverte ?","Corriger automatiquement l'effet des perturbations (charge, pente, vent…)",["Supprimer le besoin d'un capteur","Réduire le nombre de constituants de la chaîne de puissance","Rendre la sortie indépendante de la consigne"],`Si une perturbation modifie la sortie, la mesure change, l'écart aussi, et le correcteur ajuste la commande : la boucle fermée ${F("compense les perturbations")}. La boucle ouverte ne les voit pas.`],
      ["Pourquoi le comparateur reçoit-il la mesure avec le signe − ?","Pour que l'écart diminue quand la sortie se rapproche de la consigne (contre-réaction)",["Pour inverser le sens de rotation du moteur","Parce que la mesure est toujours une tension négative","Pour doubler le gain de la boucle"],`${F("ε = consigne − mesure")} : si la sortie est trop faible, ε &gt; 0 et la commande augmente ; si elle est trop forte, ε &lt; 0 et la commande diminue. Cette contre-réaction ramène la sortie vers la consigne.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* constituant d'un système décrit en texte */
  ()=>{ const S=rnd(SYS), k=ri(0,3), R=["de correcteur","de préactionneur","d'actionneur","de capteur"];
    return {q:`Dans ${S.nm}, quel constituant joue le rôle ${R[k]} ?`,type:"ch",...mc(cap(S.N[k]),S.N.filter((_,i)=>i!==k).map(cap)),expl:ROLE(S,k,"Ce constituant")}; },
  /* relation de la boucle fermée */
  ()=>{ const m=mc(FRAC("H","1 + H·Kc"),[FRAC("H","1 − H·Kc"),FRAC("1","1 + H·Kc"),"H·Kc"]);
    return {fig:fx_auto_bloc({e:"E",d:[["H"]],lk:["ε","S"],r:["Kc"],lr:"M"}),ctx:"Boucle d'asservissement en régime permanent : H est le gain statique de la chaîne directe, Kc celui du capteur ; M est la mesure.",
      q:`Quelle relation donne le gain statique en boucle fermée ${FRAC("S","E")} ?`,type:"ch",...m,
      expl:`ε = E − M = E − Kc·S et S = H·ε. Donc S = H·E − H·Kc·S, soit S·(1 + H·Kc) = H·E : ${F(`${FRAC("S","E")} = ${FRAC("H","1 + H·Kc")}`)}. Le rapport ${FRAC("1","1 + H·Kc")} est celui de l'écart à la consigne, ${FRAC("ε","E")}.`}; },
  /* signes du comparateur */
  ()=>({fig:fx_auto_bloc({e:"E (V)",d:[["Correcteur"],["Système"]],lk:["ε (V)","Ucom (V)","S"],r:["Capteur"],lr:"M (V)",sg:["?","?"]}),
    ctx:"Le correcteur a un gain positif : il augmente la commande quand l'écart ε est positif. E est la consigne, M la mesure.",
    q:"Quels signes faut-il placer sur les deux entrées du comparateur ?",type:"ch",ch:["+ sur la consigne E, − sur la mesure M","− sur la consigne E, + sur la mesure M","+ sur les deux entrées","− sur les deux entrées"],ok:0,
    expl:`${F("ε = E − M")} : si la sortie est trop faible, M &lt; E, ε &gt; 0 et la commande augmente, ce qui ramène la sortie vers la consigne. Avec « + » sur la mesure, une sortie trop forte augmenterait encore la commande : la sortie s'emballerait.`}),
  /* unité d'un gain statique */
  ()=>{ const V=[
      ["Un codeur associé à sa carte fournit une tension proportionnelle à la vitesse de rotation ω (rad/s).","V/(rad/s)",["(rad/s)/V","rad/s","Sans unité"],"entrée ω en rad/s, sortie en V"],
      ["Un moteur à courant continu tourne à une vitesse ω (rad/s) proportionnelle à sa tension d'alimentation U (V).","(rad/s)/V",["V/(rad/s)","rad/s","Sans unité"],"entrée U en V, sortie ω en rad/s"],
      ["Une sonde fournit une tension proportionnelle à la température θ (°C).","V/°C",["°C/V","°C","Sans unité"],"entrée θ en °C, sortie en V"],
      ["Un hacheur fournit une tension moyenne Um (V) proportionnelle à sa tension de commande Ucom (V).","Sans unité (V/V)",["V","Ω","(rad/s)/V"],"entrée et sortie en V"],
      ["Un capteur de niveau fournit une tension proportionnelle à la hauteur d'eau h (m).","V/m",["m/V","m","Sans unité"],"entrée h en m, sortie en V"],
      ["La tige d'un vérin électrique sort à une vitesse v (mm/s) proportionnelle à sa tension d'alimentation U (V).","(mm/s)/V",["V/(mm/s)","mm/s","Sans unité"],"entrée U en V, sortie v en mm/s"]];
    const [c,ok,w,e]=rnd(V);
    return {ctx:c,q:"Quelle est l'unité du gain statique K de ce constituant ?",type:"ch",...mc(ok,w),expl:`${F(`K = ${FRAC("sortie","entrée")}`)} : son unité est celle de la sortie divisée par celle de l'entrée (${e}), soit ${F(ok)}.`}; }
];

const SB2=[
  /* chaîne de transmission : conversion en rad/s, gain de la chaîne, vitesse */
  ()=>{ const o=draw(()=>{ const Kn=rnd([150,200,250,300,400]), k=rnd([10,12,15,20,25]), D=rnd([60,80,100,120,150]), U0=rnd([6,9,12,18,24]); const Kw=Kn*2*Math.PI/60, R=D/2000, K=Kw/k*R; return {Kn,k,D,U0,Kw,R,K,v:K*U0}; },o=>o.v>=0.3&&o.v<=2.5);
    const fig=fx_auto_bloc({open:true,e:"U (V)",d:[["Moteur","Km"],["Réducteur","r"],["Roue","R"]],lk:["ωm (rad/s)","ωr (rad/s)","v (m/s)"]});
    const ctx=`Chaîne de transmission d'un robot mobile : moteur de gain Km = ${o.Kn} (tr/min)/V, réducteur de rapport r = ${FRAC(1,o.k)}, roues de diamètre ${o.D} mm (v = R·ωr).`;
    return [{fig,ctx,q:"Convertis le gain du moteur en (rad/s)/V.",type:"num",ans:o.Kw,tolR:0.02,unit:"(rad/s)/V",
        expl:`1 tr/min = ${FRAC("2π","60")} rad/s, donc ${F(`Km = ${FRAC(`${o.Kn} × 2π`,"60")}`)} = ${U(o.Kw,"(rad/s)/V")}.`},
      {fig,ctx,q:"Calcule le gain K de la chaîne, de la tension U à la vitesse v du robot, en (m/s)/V.",type:"num",ans:o.K,tolR:0.02,unit:"(m/s)/V",
        expl:`R = ${FRAC(`${o.D} mm`,"2")} = ${nf(o.R,3)} m. Blocs en série : ${F("K = Km·r·R")} = ${nf(o.Kw,3)} × ${FRAC(1,o.k)} × ${nf(o.R,3)} = ${U(o.K,"(m/s)/V")}.`},
      {fig,ctx,q:`Quelle vitesse le robot atteint-il en régime permanent sous U = ${o.U0} V ?`,type:"num",ans:o.v,tolR:0.02,unit:"m/s",
        expl:`${F("v = K·U")} = ${nf(o.K,4)} × ${o.U0} = ${U(o.v,"m/s")}.`}]; },
  /* boucle fermée en gains statiques : vitesse, puis écart */
  ()=>{ const o=draw(()=>{ const Kp=rnd([2,3,4,5,8]), Km=rnd([6,8,10,12,15,20]), Kc=rnd([0.02,0.025,0.04,0.05]), Uc=rnd([2,3,4,5,6]); const H=Kp*Km; return {Kp,Km,Kc,Uc,H,B:H*Kc}; },o=>o.B>=1&&o.B<=12);
    const w=o.H*o.Uc/(1+o.B), e=o.Uc/(1+o.B), Um=o.Kc*w;
    const fig=fx_auto_bloc({e:"Uc (V)",d:[["Correcteur",`Kp = ${o.Kp}`],["Moteur",`Km = ${o.Km}`]],lk:["ε (V)","Ucom (V)","ω (rad/s)"],r:["Codeur",`Kc = ${nf(o.Kc,3)}`],lr:"Umes (V)"});
    const ctx=`Asservissement de vitesse d'un moteur, en régime permanent : Km = ${o.Km} (rad/s)/V (hacheur compris), Kc = ${nf(o.Kc,3)} V/(rad/s). Tension de consigne : Uc = ${o.Uc} V.`;
    return [{fig,ctx,q:"Calcule la vitesse ω atteinte en régime permanent.",type:"num",ans:w,tolR:0.02,unit:"rad/s",
        expl:`Chaîne directe : H = Kp·Km = ${o.Kp} × ${o.Km} = ${o.H} (rad/s)/V. ${F(`ω = ${FRAC("H","1 + H·Kc")}·Uc`)} = ${FRAC(o.H,`1 + ${o.H} × ${nf(o.Kc,3)}`)} × ${o.Uc} = ${U(w,"rad/s")}.`},
      {fig,ctx,q:"Calcule l'écart ε en régime permanent.",type:"num",ans:e,tolR:0.02,unit:"V",
        expl:`Umes = Kc·ω = ${nf(o.Kc,3)} × ${nf(w,2)} = ${nf(Um,3)} V, puis ${F("ε = Uc − Umes")} = ${o.Uc} − ${nf(Um,3)} = ${U(e,"V")}. Vérification : H·ε = ${o.H} × ${nf(e,4)} = ${nf(o.H*e,1)} rad/s. L'écart ne s'annule pas : avec un correcteur proportionnel, il faut un écart pour produire la commande.`}]; },
  /* identification d'un premier ordre : gain statique, puis constante de temps (tangente) */
  ()=>{ const c=rnd([
      {s:"d'un moteur à courant continu",e:"un échelon de tension",E:[6,9,12,18,24],eu:"V",yl:"ω (rad/s)",u:"rad/s",ku:"(rad/s)/V",K:[8,10,12,15,20],T:{tmax:2,xs:0.5,xm:0.1},tau:[0.3,0.4],tu:"s"},
      {s:"d'une étuve de séchage",e:"un échelon de puissance de chauffe",E:[1,1.5,2,2.5],eu:"kW",yl:"Δθ (°C)",u:"°C",ku:"°C/kW",K:[12,16,20,24],T:{tmax:60,xs:10,xm:2},tau:[6,8,10,12],tu:"min"},
      {s:"d'un tapis roulant",e:"un échelon de tension de commande",E:[5,8,10],eu:"V",yl:"v (m/s)",u:"m/s",ku:"(m/s)/V",K:[0.05,0.08,0.1,0.12],T:{tmax:4,xs:0.5,xm:0.1},tau:[0.4,0.5,0.6,0.8],tu:"s"}]);
    const o=draw(()=>{ const E=rnd(c.E), K=rnd(c.K), sf=r2(E*K,6), A=axY(1.25*sf); return {E,K,sf,A}; },o=>onGrid(o.sf,o.A.ym));
    const tau=rnd(c.tau);
    const fig=fx_auto_rep({...c.T,...o.A,yl:c.yl,xl:`t (${c.tu})`,c:[{f:ord1(o.sf,tau)}],hl:[{y:o.sf,lab:"valeur finale"}],tan:{t:1.1*tau,y:1.1*o.sf}});
    const ctx=`Réponse ${c.s} à ${c.e} de ${nf(o.E,1)} ${c.eu} appliqué à t = 0. La tangente à l'origine est tracée.`;
    return [{fig,ctx,q:`À partir de la courbe, calcule le gain statique K, en ${c.ku}.`,type:"num",ans:o.K,tolR:0.02,unit:c.ku,
        expl:`On lit la valeur finale s∞ = ${wu(o.sf,c.u)}. ${F(`K = ${FRAC("s∞","E0")}`)} = ${FRAC(wu(o.sf,c.u),`${nf(o.E,1)} ${c.eu}`)} = ${U(o.K,c.ku)}.`},
      {fig,ctx,q:"Lis la constante de temps τ.",type:"num",ans:tau,tolA:0.3*c.T.xm,unit:c.tu,
        expl:`La tangente à l'origine coupe l'asymptote s = s∞ à ${F(`τ = ${S3(tau)} ${c.tu}`)} ; à cet instant, la courbe vaut 63 % de s∞, soit ${wu(0.63*o.sf,c.u,3)}.`}]; },
  /* adaptateur : gain à choisir, tension de consigne */
  ()=>{ const c=rnd([
      {nm:"la régulation de température d'une serre",g:"θc",u:"°C",Kc:[0.02,0.04,0.05,0.1],X:[22,24,25,28],cap:["Sonde"],B:[["Correcteur"],["Radiateur","+ serre"]],y:"θ"},
      {nm:"la régulation de niveau d'une citerne",g:"hc",u:"m",Kc:[1,1.5,2,2.5],X:[1.2,1.5,1.8,2],cap:["Capteur","de niveau"],B:[["Correcteur"],["Moto-","pompe"]],y:"h"},
      {nm:"l'asservissement de position d'un bras de robot",g:"θc",u:"°",Kc:[0.02,0.025,0.04,0.05],X:[45,60,90,120],cap:["Potentio-","mètre"],B:[["Correcteur"],["Moto-","réducteur"]],y:"θ"},
      {nm:"l'asservissement d'altitude d'un drone",g:"zc",u:"m",Kc:[0.2,0.25,0.4,0.5],X:[2,3,4,5],cap:["Capteur","à ultrasons"],B:[["Correcteur"],["Moteurs","+ hélices"]],y:"z"}]);
    const Kc=rnd(c.Kc), X=rnd(c.X), Uc=r2(Kc*X,6), ku=`V/${c.u}`;
    const fig=fx_auto_bloc({e:`${c.g} (${c.u})`,a:["Adapta-","teur","Ka = ?"],ea:"Uc (V)",d:c.B,lk:["ε (V)","Ucom (V)",`${c.y} (${c.u})`],r:[...c.cap,`Kc = ${nf(Kc,3)} ${ku}`],lr:"Umes (V)"});
    const ctx=`Schéma-bloc de ${c.nm}. La consigne ${c.g} est convertie en tension Uc par un adaptateur de gain Ka.`;
    return [{fig,ctx,q:"Quel gain Ka faut-il donner à l'adaptateur ?",type:"ch",...mc(`Ka = Kc = ${nf(Kc,3)} ${ku}`,[`Ka = ${FRAC("1","Kc")} = ${nf(1/Kc,3)} ${c.u}/V`,"Ka = 1, sans unité",`Ka = 2·Kc = ${nf(2*Kc,3)} ${ku}`]),
        expl:`Le comparateur calcule ε = Ka·${c.g} − Kc·${c.y}. Pour que ε soit nul exactement quand ${c.y} = ${c.g}, il faut ${F("Ka = Kc")} = ${nf(Kc,3)} ${ku} : alors ε = Kc·(${c.g} − ${c.y}).`},
      {fig,ctx,q:`Calcule la tension de consigne Uc pour ${c.g} = ${wu(X,c.u)}.`,type:"num",ans:Uc,tolR:0.02,unit:"V",
        expl:`${F(`Uc = Ka·${c.g}`)} = ${nf(Kc,3)} × ${nf(X,2)} = ${U(Uc,"V")}.`}]; },
  /* valeur de la sortie à un instant donné (premier ordre) */
  ()=>{ const c=rnd([
      {s:"Le moteur d'un ventilateur",g:"sa vitesse de rotation",u:"rad/s",sf:[120,150,200,250,300],tau:[0.2,0.4,0.5,0.8],tu:"s"},
      {s:"Une étuve de séchage",g:"son élévation de température",u:"°C",sf:[30,40,50,60],tau:[8,10,12,15],tu:"min"},
      {s:"Une citerne remplie par une pompe régulée",g:"son niveau",u:"m",sf:[1.2,1.5,2,2.4],tau:[3,4,5,6],tu:"min"}]);
    const sf=rnd(c.sf), tau=rnd(c.tau), m=rnd([0.5,1.5,2,2.5]), t=r2(m*tau,6), s=sf*(1-Math.exp(-m));
    return {ctx:`${c.s} se comporte comme un premier ordre : valeur finale s∞ = ${wu(sf,c.u)}, constante de temps τ = ${nf(tau,2)} ${c.tu}. Sa réponse à l'échelon s'écrit s(t) = s∞·(1 − e<sup>−${FRAC("t","τ")}</sup>).`,
      q:`Calcule ${c.g} à l'instant t = ${nf(t,2)} ${c.tu}.`,type:"num",ans:s,tolR:0.02,unit:c.u,
      expl:`${FRAC("t","τ")} = ${FRAC(nf(t,2),nf(tau,2))} = ${nf(m,1)}, donc s = ${wu(sf,c.u)} × (1 − e<sup>−${nf(m,1)}</sup>) = ${wu(sf,c.u)} × ${nf(1-Math.exp(-m),3)} = ${U(s,c.u)}, soit ${nf((1-Math.exp(-m))*100,0)} % de la valeur finale.`}; },
  /* reconnaître la réponse d'un modèle donné parmi trois courbes */
  ()=>{ const c=rnd([
      {s:"d'un moteur",yl:"ω (rad/s)",u:"rad/s",ku:"(rad/s)/V",K:[10,12,15,20],E:[6,8,10],eu:"V",tu:"s",tau:[0.2,0.3,0.4]},
      {s:"d'une motopompe",yl:"Q (L/min)",u:"L/min",ku:"(L/min)/V",K:[2,2.5,3,4],E:[5,8,10],eu:"V",tu:"s",tau:[0.3,0.4,0.5]}]);
    const K=rnd(c.K), E=rnd(c.E), tau=rnd(c.tau), sf=K*E, fk=rnd([0.7,1.4]), ft=rnd([0.5,2]);
    const cur=shuffle([{sf,tau,ok:1},{sf,tau:tau*ft,ok:0},{sf:sf*fk,tau,ok:0}]);
    const Tm=axT(6*Math.max(...cur.map(x=>x.tau))), A=axY(1.2*Math.max(...cur.map(x=>x.sf))), L3=["A","B","C"], dsh=[null,"8 4","2 3"];
    const fig=fx_auto_rep({...Tm,...A,yl:c.yl,xl:`t (${c.tu})`,c:cur.map((x,i)=>({f:ord1(x.sf,x.tau),lab:`courbe ${L3[i]}`,dash:dsh[i]}))});
    const i=cur.findIndex(x=>x.ok);
    return {fig,ctx:`Trois réponses indicielles sont tracées. Le modèle ${c.s} est ${F(`H(p) = ${FRAC(nf(K,2),`1 + ${nf(tau,2)}·p`)}`)} (K en ${c.ku}, τ en ${c.tu}) ; l'échelon d'entrée vaut ${E} ${c.eu}.`,
      q:"Quelle courbe est la réponse de ce modèle ?",type:"ch",ch:L3.map(l=>`Courbe ${l}`),ok:i,
      expl:`Valeur finale attendue : ${F("s∞ = K·E0")} = ${nf(K,2)} × ${E} = ${wu(sf,c.u)}, ce qui élimine la courbe qui tend vers ${wu(sf*fk,c.u)}. À t = τ = ${nf(tau,2)} ${c.tu}, la sortie doit valoir 63 % de s∞, soit ${wu(0.63*sf,c.u,3)} : c'est la ${F(`courbe ${L3[i]}`)} ; l'autre a une constante de temps de ${nf(tau*ft,2)} ${c.tu}.`}; },
  /* unité et valeur du gain global d'une chaîne d'acquisition */
  ()=>{ const c=rnd([
      {g:"une température",x:"θ (°C)",xu:"°C",cp:"Sonde",K1:[0.01,0.02],K2:[2,4,5,8,10],r:40,k1:"V/°C"},
      {g:"une pression",x:"p (bar)",xu:"bar",cp:"Capteur",K1:[0.25,0.5],K2:[1.5,2,2.5,4],r:2,k1:"V/bar"},
      {g:"une hauteur d'eau",x:"h (m)",xu:"m",cp:"Capteur",K1:[0.5,1],K2:[1.5,2,2.5],r:2,k1:"V/m"}]);
    const [K1,K2]=draw(()=>[rnd(c.K1),rnd(c.K2)],v=>5/(v[0]*v[1])>=c.r), n=rnd([8,10,12]), K3=2**n/5, K=K1*K2*K3;
    const fig=fx_auto_bloc({open:true,e:c.x,d:[[c.cp,`K1 = ${nf(K1,2)}`],["Amplifi-","cateur",`K2 = ${nf(K2,1)}`],["CAN",`${n} bits`,"0 à 5 V"]],lk:["U1 (V)","U2 (V)","N (points)"]});
    const ctx=`Chaîne d'acquisition d'${c.g} : capteur (K1 = ${nf(K1,2)} ${c.k1}), amplificateur (K2 = ${nf(K2,1)}, sans unité), convertisseur analogique-numérique de ${n} bits sur 0 à 5 V, de gain K3 = ${FRAC(`2<sup>${n}</sup>`,"5 V")} = ${nf(K3,1)} point/V.`;
    return [{fig,ctx,q:"Quelle est l'unité du gain global K = K1·K2·K3 de cette chaîne ?",type:"ch",...mc(`point/${c.xu}`,[`${c.xu}/point`,c.k1,"point/V"]),
        expl:`Les unités se simplifient : ${c.k1} × V/V × point/V = ${F(`point/${c.xu}`)}. C'est cohérent : l'entrée est en ${c.xu}, la sortie N en points.`},
      {fig,ctx,q:"Calcule le gain global K de la chaîne.",type:"num",ans:K,tolR:0.02,unit:`point/${c.xu}`,
        expl:`Blocs en série : ${F("K = K1·K2·K3")} = ${nf(K1,2)} × ${nf(K2,1)} × ${nf(K3,1)} = ${U(K,`point/${c.xu}`)}.`}]; },
  /* erreur d'un élève : gains en série ou boucle fermée */
  ()=>{ if(Math.random()<0.5){ const K1=rnd([2,3,4]), K2=rnd([10,12,15,20]), k=rnd([10,16,20,25]), K=K1*K2/k, wr=K1+K2+1/k;
      const ctx=`Trois blocs en série : hacheur K1 = ${K1}, moteur K2 = ${K2} (rad/s)/V, réducteur K3 = ${FRAC(1,k)}. Un élève écrit : K = K1 + K2 + K3 = ${nf(wr,3)} (rad/s)/V.`;
      return [{ctx,q:"Que penses-tu du calcul du gain global fait par l'élève ?",type:"ch",...mc("Il est faux : pour des blocs en série, les gains se multiplient",["Il est juste : les gains en série s'additionnent","Il est faux : seul le gain du moteur compte","Il est juste, mais le résultat est sans unité"]),
          expl:`La sortie d'un bloc est l'entrée du suivant : S = K3·(K2·(K1·E)). Les gains se ${F("multiplient")}. L'addition n'a pas de sens : on ne peut pas ajouter des (rad/s)/V et un nombre sans unité.`},
        {ctx,q:"Calcule le gain global correct.",type:"num",ans:K,tolR:0.02,unit:"(rad/s)/V",expl:`${F("K = K1·K2·K3")} = ${K1} × ${K2} × ${FRAC(1,k)} = ${U(K,"(rad/s)/V")}.`}]; }
    const H=rnd([20,40,50,80,100]), Kc=rnd([0.02,0.04,0.05]), E=rnd([2,3,4,5]), S=H*E/(1+H*Kc);
    const ctx=`Boucle d'asservissement de vitesse en régime permanent : chaîne directe H = ${H} (rad/s)/V, capteur Kc = ${nf(Kc,2)} V/(rad/s), consigne E = ${E} V. Un élève écrit : S = H·E = ${H*E} rad/s.`;
    return [{ctx,q:"Que penses-tu du calcul de la vitesse fait par l'élève ?",type:"ch",...mc("Il est faux : il a oublié la chaîne de retour ; S = H·E n'est valable qu'en boucle ouverte",["Il est juste : en régime permanent, le retour n'intervient pas","Il est faux : il fallait écrire S = H·Kc·E","Il est juste, car le capteur ne consomme pas d'énergie"]),
        expl:`En boucle fermée, la chaîne directe ne reçoit pas E mais l'écart ε = E − Kc·S. S = H·E serait la sortie ${F("en boucle ouverte")}.`},
      {ctx,q:"Calcule la vitesse S correcte en régime permanent.",type:"num",ans:S,tolR:0.02,unit:"rad/s",expl:`${F(`S = ${FRAC("H","1 + H·Kc")}·E`)} = ${FRAC(H,`1 + ${H} × ${nf(Kc,2)}`)} × ${E} = ${U(S,"rad/s")}.`}]; },
  /* pente de la tangente à l'origine : accélération au démarrage */
  ()=>{ const c=rnd([
      {s:"de la vitesse d'un tapis roulant au démarrage",yl:"v (m/s)",u:"m/s",a:"m/s²",sf:[0.4,0.5,0.6,0.8,1],T:{tmax:4,xs:0.5,xm:0.1},tau:[0.4,0.5,0.6,0.8]},
      {s:"de la vitesse de rotation d'un moteur au démarrage",yl:"ω (rad/s)",u:"rad/s",a:"rad/s²",sf:[100,120,150,200],T:{tmax:2,xs:0.5,xm:0.1},tau:[0.3,0.4]},
      {s:"de la vitesse d'un chariot filoguidé",yl:"v (m/s)",u:"m/s",a:"m/s²",sf:[1,1.2,1.5,2],T:{tmax:4,xs:0.5,xm:0.1},tau:[0.5,0.6,0.8]}]);
    const sf=rnd(c.sf), tau=rnd(c.tau), A=axY(1.25*sf), acc=sf/tau;
    const fig=fx_auto_rep({...c.T,...A,yl:c.yl,c:[{f:ord1(sf,tau)}],hl:[{y:sf,lab:`valeur finale : ${wu(sf,c.u)}`}],tan:{t:1.1*tau,y:1.1*sf}});
    const ctx=`Évolution ${c.s}, modélisée par un premier ordre. La tangente à l'origine est tracée.`;
    return [{fig,ctx,q:"Lis sur la tangente à l'origine la constante de temps τ du démarrage.",type:"num",ans:tau,tolA:0.03,unit:"s",
        expl:`La tangente à l'origine coupe l'asymptote de la valeur finale à ${F(`τ = ${S3(tau)} s`)}.`},
      {fig,ctx,q:"Calcule l'accélération au démarrage, égale à la pente de la tangente à l'origine.",type:"num",ans:acc,tolR:0.02,unit:c.a,
        expl:`La tangente monte de s∞ = ${wu(sf,c.u)} en τ = ${nf(tau,2)} s : ${F(`a = ${FRAC("s∞","τ")}`)} = ${FRAC(wu(sf,c.u),`${nf(tau,2)} s`)} = ${U(acc,c.a)}. C'est l'accélération maximale : elle diminue ensuite jusqu'à s'annuler.`}]; },
  /* un premier ordre convient-il ? */
  ()=>{ const v=ri(0,2), sf=rnd([1,1.5,2,2.5]), A=axY(1.3*sf), T=axT(4);
    const f=v===0?ord1(sf,rnd([0.4,0.5,0.6])):v===1?ord2D(sf,rnd([0.15,0.2,0.25,0.3]),rnd([0.8,1,1.2])):ord2(sf,rnd([1,1.2,1.5]),rnd([2,2.5,3]));
    const CH=["Oui : pente maximale au départ, sans dépassement, comme un premier ordre","Non : la réponse présente un dépassement","Non : la tangente à l'origine est horizontale (démarrage en S)"];
    const EX=[`La courbe démarre avec sa pente maximale et monte sans dépasser sa valeur finale : c'est l'allure d'un ${F("premier ordre")}, dont on peut lire K et τ.`,
      `Un premier ordre ne dépasse jamais sa valeur finale. Ici la sortie dépasse puis oscille : il faut ${F("un modèle d'ordre 2")} au moins.`,
      `Un premier ordre démarre avec sa pente maximale (tangente à l'origine de pente ${FRAC("s∞","τ")}). Ici la courbe part à l'horizontale, en S : ce n'est ${F("pas un premier ordre")}.`];
    return {fig:fx_auto_rep({...T,...A,yl:"sortie",c:[{f}]}),ctx:"Réponse indicielle mesurée sur un système.",q:"Peut-on modéliser ce système par un premier ordre ?",type:"ch",ch:CH,ok:v,expl:EX[v]}; },
  /* perturbation en boucle ouverte : vitesse à vide, chute relative */
  ()=>{ const o=draw(()=>{ const Km=rnd([10,12,15,20,25]), U0=rnd([6,8,10,12]), Kr=rnd([20,30,40,50,60]), Cr=rnd([0.1,0.2,0.3,0.4,0.5]); return {Km,U0,Kr,Cr,w0:Km*U0,dw:r2(Kr*Cr,6)}; },o=>o.dw/o.w0>=0.06&&o.dw/o.w0<=0.3);
    const ch=o.dw/o.w0*100;
    const fig=fx_auto_bloc({open:true,e:"U (V)",d:[["Moteur",`Km = ${o.Km}`]],lk:["ω (rad/s)"],p:{at:0,lab:"Cr (N·m)",t:[`Kr = ${o.Kr}`]}});
    const ctx=`Moteur d'un tapis roulant commandé en boucle ouverte. En régime permanent, ω = Km·U − Kr·Cr, avec Km = ${o.Km} (rad/s)/V, Kr = ${o.Kr} (rad/s)/(N·m) et U = ${o.U0} V ; Cr est le couple résistant dû à la charge.`;
    return [{fig,ctx,q:"Calcule la vitesse de rotation à vide (Cr = 0).",type:"num",ans:o.w0,tolR:0.02,unit:"rad/s",expl:`${F("ω0 = Km·U")} = ${o.Km} × ${o.U0} = ${U(o.w0,"rad/s")}.`},
      {fig,ctx,q:`Le tapis est chargé : Cr = ${nf(o.Cr,1)} N·m. Calcule la chute de vitesse relative (référence : vitesse à vide), en %.`,type:"num",ans:ch,tolR:0.02,unit:"%",
        expl:`Chute : Kr·Cr = ${o.Kr} × ${nf(o.Cr,1)} = ${nf(o.dw,1)} rad/s, soit ${F(`${FRAC("Kr·Cr","ω0")} × 100`)} = ${FRAC(nf(o.dw,1),o.w0)} × 100 = ${U(ch,"%")}. En boucle ouverte, rien ne compense cette chute : la commande ignore la vitesse réelle.`}]; },
  /* gain maximal du capteur pour la plage du convertisseur, tension de consigne */
  ()=>{ const c=rnd([
      {s:"la vitesse de rotation d'un moteur",g:"ω",u:"rad/s",mx:[200,250,300],cs:[100,150,200],ku:"V/(rad/s)",cp:"capteur de vitesse"},
      {s:"le niveau d'une citerne",g:"h",u:"m",mx:[2,2.5,4],cs:[1,1.5,1.8],ku:"V/m",cp:"capteur de niveau"},
      {s:"la position d'un bras de robot",g:"θ",u:"°",mx:[180,200,250],cs:[45,90,120],ku:"V/°",cp:"potentiomètre"},
      {s:"la température d'une étuve",g:"θ",u:"°C",mx:[80,100,125],cs:[45,55,60],ku:"V/°C",cp:"capteur de température"}]);
    const mx=rnd(c.mx), Vr=rnd([3.3,5]), Km=Vr/mx, X=niceDown(Km), cs=rnd(c.cs), Uc=r2(X*cs,6);
    const ctx=`Le ${c.cp} mesure ${c.s}, qui ne dépasse jamais ${wu(mx,c.u)}. Sa tension de sortie est lue par une entrée analogique du microcontrôleur, qui accepte de 0 à ${nf(Vr,1)} V.`;
    return [{ctx,q:`Quel gain Kc maximal peut avoir le ${c.cp} ?`,type:"num",ans:Km,tolR:0.02,unit:c.ku,
        expl:`La tension la plus grande est obtenue pour ${c.g} = ${wu(mx,c.u)} : ${F(`Kc = ${FRAC("Umax",`${c.g}max`)}`)} = ${FRAC(`${nf(Vr,1)} V`,wu(mx,c.u))} = ${U(Km,c.ku)}. Un gain plus grand saturerait l'entrée du microcontrôleur.`},
      {ctx,q:`On choisit Kc = ${nf(X,4)} ${c.ku}. Quelle tension de consigne Uc correspond à ${c.g} = ${wu(cs,c.u)} ?`,type:"num",ans:Uc,tolR:0.02,unit:"V",
        expl:`L'adaptateur a le même gain que le capteur : ${F("Uc = Kc·consigne")} = ${nf(X,4)} × ${nf(cs,2)} = ${U(Uc,"V")}.`}]; },
  /* étuve : gain statique thermique et puissance de chauffe */
  ()=>{ const o=draw(()=>{ const K=rnd([5,6,8,10,12]), ta=rnd([25,26,27,28,30]), tc=rnd([45,50,55,60]), Pm=rnd([4,5,6,8]); return {K,ta,tc,Pm,P:(tc-ta)/K,tm:ta+K*Pm}; },o=>o.P>=1.5&&o.P<=6&&o.tm>=o.tc+5&&o.tm<=100);
    const ctx=`Étuve de séchage de gousses de vanille. En régime permanent, sa température dépasse celle de l'air ambiant de Δθ = K·P, avec K = ${o.K} °C/kW et P la puissance de chauffe. L'air ambiant est à ${o.ta} °C.`;
    return [{ctx,q:`Quelle puissance de chauffe faut-il pour maintenir ${o.tc} °C dans l'étuve ?`,type:"num",ans:o.P,tolR:0.02,unit:"kW",
        expl:`Il faut Δθ = ${o.tc} − ${o.ta} = ${o.tc-o.ta} °C. ${F(`P = ${FRAC("Δθ","K")}`)} = ${FRAC(`${o.tc-o.ta} °C`,`${o.K} °C/kW`)} = ${U(o.P,"kW")}.`},
      {ctx,q:`La résistance fournit au plus ${o.Pm} kW. Quelle température maximale peut-on atteindre dans l'étuve ?`,type:"num",ans:o.tm,tolR:0.02,unit:"°C",
        expl:`${F("θmax = θa + K·Pmax")} = ${o.ta} + ${o.K} × ${o.Pm} = ${U(o.tm,"°C")}. Au-delà, la consigne ne peut plus être atteinte, quel que soit le correcteur.`}]; }
];

const SB3=[
  /* chaîne complète d'un robot : vitesse, erreur statique, exigence */
  ()=>{ const want=Math.random()<0.5, X=rnd([5,10]);
    const o=draw(()=>{ const Kc=rnd([2,2.5,4,5]), Kv=rnd([0.04,0.05,0.08,0.1]), Kp=rnd([2,3,4,5,6,8,10,12,15,20,25,30,40,50,60]), vc=rnd([0.8,1,1.2,1.5]); const B=Kp*Kv*Kc; return {Kc,Kv,Kp,vc,B,es:100/(1+B)}; },
      o=>(o.es<=X)===want&&far(o.es,X,0.15)&&o.B>=2);
    const v=o.vc*o.B/(1+o.B);
    const fig=fx_auto_bloc({e:"vc (m/s)",a:["Ka"],ea:"Uc (V)",d:[["Correcteur",`Kp = ${o.Kp}`],["Motori-","sation","Kv"]],lk:["ε (V)","Ucom (V)","v (m/s)"],r:["Capteur","Kc"],lr:"Umes (V)"});
    const ctx=`Asservissement de vitesse d'un robot de livraison : motorisation (hacheur, moteur, réducteur, roues) de gain Kv = ${nf(o.Kv,2)} (m/s)/V, capteur de gain Kc = ${nf(o.Kc,1)} V/(m/s), adaptateur de même gain (Ka = Kc). Consigne : vc = ${nf(o.vc,1)} m/s.`;
    const KB="K<sub>BO</sub>";
    return [{fig,ctx,q:"Calcule la vitesse atteinte en régime permanent.",type:"num",ans:v,tolR:0.02,unit:"m/s",
        expl:`Gain de boucle : ${KB} = Kp·Kv·Kc = ${o.Kp} × ${nf(o.Kv,2)} × ${nf(o.Kc,1)} = ${nf(o.B,2)}. Avec Ka = Kc : ${F(`v = ${FRAC(KB,`1 + ${KB}`)}·vc`)} = ${FRAC(nf(o.B,2),`1 + ${nf(o.B,2)}`)} × ${nf(o.vc,1)} = ${U(v,"m/s")}.`},
      {fig,ctx,q:"Calcule l'erreur statique relative, en % de la consigne.",type:"num",ans:o.es,tolR:0.02,unit:"%",
        expl:`${F(`εs = ${FRAC("vc − v","vc")} × 100`)} = ${FRAC(`${nf(o.vc,1)} − ${nf(v,4)}`,nf(o.vc,1))} × 100 = ${U(o.es,"%")}, c'est-à-dire ${FRAC("100",`1 + ${KB}`)}.`},
      {fig,ctx,q:`Exigence : erreur statique au plus ${X} % de la consigne. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(o.es,2)} % ${want?"≤":"&gt;"} ${X} % : ${want?"l'exigence est satisfaite.":`l'exigence n'est pas satisfaite. Il faudrait ${KB} ≥ ${FRAC(100,X)} − 1 = ${100/X-1}, donc un gain Kp plus grand (au risque d'oscillations), ou un correcteur à action intégrale.`}`}]; },
  /* perturbation : chute de vitesse en boucle fermée, exigence */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const Km=rnd([10,12,15,20]), Kc=rnd([0.02,0.025,0.05]), Kp=rnd([4,5,8,10,15,20,25,40]), Kr=rnd([20,30,40,50]), Cr=rnd([0.2,0.3,0.4,0.5,0.8]), wc=rnd([100,150,200]), X=rnd([1,2,3,5]);
        const B=Kp*Km*Kc, dBO=Kr*Cr, dBF=dBO/(1+B); return {Km,Kc,Kp,Kr,Cr,wc,X,B,dBO,dBF,pc:dBF/wc*100}; },
      o=>(o.pc<=o.X)===want&&far(o.pc,o.X,0.15)&&o.dBO/o.wc>=0.08&&o.B>=2);
    const KB="K<sub>BO</sub>";
    const fig=fx_auto_bloc({e:"ωc (rad/s)",a:["Ka"],ea:"Uc (V)",d:[["Kp"],["Km"]],lk:["ε (V)","Ucom (V)","ω (rad/s)"],p:{at:1,lab:"Cr (N·m)",t:["Kr"]},r:["Kc"],lr:"Umes (V)"});
    const ctx=`Asservissement de vitesse d'un treuil : correcteur Kp = ${o.Kp}, moteur Km = ${o.Km} (rad/s)/V, capteur et adaptateur Kc = Ka = ${nf(o.Kc,3)} V/(rad/s), effet de la charge Kr = ${o.Kr} (rad/s)/(N·m). La charge crée un couple résistant Cr = ${nf(o.Cr,1)} N·m. Consigne : ωc = ${o.wc} rad/s.`;
    return [{fig,ctx,q:"Calcule la chute de vitesse due au couple résistant, en boucle fermée.",type:"num",ans:o.dBF,tolR:0.02,unit:"rad/s",
        expl:`En régime permanent : ω = Km·Kp·ε − Kr·Cr avec ε = Kc·(ωc − ω). D'où ω·(1 + Kp·Km·Kc) = Kp·Km·Kc·ωc − Kr·Cr : l'effet de la charge est divisé par 1 + ${KB} = 1 + ${o.Kp} × ${o.Km} × ${nf(o.Kc,3)} = ${nf(1+o.B,3)}. ${F(`Δω = ${FRAC("Kr·Cr",`1 + ${KB}`)}`)} = ${FRAC(nf(o.dBO,1),nf(1+o.B,3))} = ${U(o.dBF,"rad/s")}, contre ${nf(o.dBO,1)} rad/s en boucle ouverte.`},
      {fig,ctx,q:`Exigence : la charge ne doit pas faire chuter la vitesse de plus de ${o.X} % de la consigne. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:want?0:1,
        expl:`${F(`${FRAC("Δω","ωc")} × 100`)} = ${FRAC(nf(o.dBF,3),o.wc)} × 100 = ${nf(o.pc,2)} % ${want?"≤":"&gt;"} ${o.X} % : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faut augmenter le gain de boucle ou ajouter une action intégrale."}`}]; },
  /* identification sur une réponse mesurée, écart avec le modèle, conclusion */
  ()=>{ const c=rnd([
      {s:"d'un moteur à courant continu",e:"un échelon de 12 V",yl:"ω (rad/s)",u:"rad/s",sf:[120,150,180,240],T:{tmax:2,xs:0.5,xm:0.1},tau:[0.3,0.4]},
      {s:"d'une motopompe",e:"un échelon de 10 V",yl:"Q (L/min)",u:"L/min",sf:[20,25,30,40],T:{tmax:4,xs:0.5,xm:0.1},tau:[0.5,0.6,0.8]}]);
    const sf=rnd(c.sf), tau=rnd(c.tau), A=axY(1.2*sf), close=Math.random()<0.5, disp=rnd([4,5,6]);
    const tm=r2(tau*(1+rnd([1,-1])*(close?rnd([0.01,0.015,0.02]):rnd([0.15,0.2,0.25]))),3), ec=Math.abs(tm-tau)/tau*100;
    const fig=fx_auto_rep({...c.T,...A,yl:c.yl,c:[{f:noisy(ord1(sf,tau),0.008*sf,c.T.tmax)}],hl:[{y:sf,lab:`valeur finale : ${wu(sf,c.u)}`}]});
    const ctx=`Réponse mesurée ${c.s} à ${c.e}.`, ctx2=`Mesure retenue : τ = ${nf(tau,2)} s. Le modèle du constructeur donne τ = ${nf(tm,3)} s.`;
    return [{fig,ctx,q:"Détermine la constante de temps τ par la méthode des 63 %.",type:"num",ans:tau,tolA:0.5*c.T.xm,unit:"s",
        expl:`0,63 × ${wu(sf,c.u)} = ${wu(0.63*sf,c.u,3)} : la courbe atteint ce niveau à ${F(`τ ≈ ${S3(tau)} s`)}.`},
      {fig,ctx:ctx2,q:"Calcule l'écart relatif entre la constante de temps du modèle et celle mesurée (référence : mesure).",type:"num",ans:ec,tolR:0.02,tolA:0.05,unit:"%",
        expl:`${F(`écart = ${FRAC("|τ modèle − τ mesuré|","τ mesuré")} × 100`)} = ${FRAC(`|${nf(tm,3)} − ${nf(tau,2)}|`,nf(tau,2))} × 100 = ${U(ec,"%")}.`},
      {fig,ctx:`${ctx2} Les essais répétés ont une dispersion de ${disp} %.`,q:"Que conclure sur le modèle du constructeur ?",type:"ch",ch:["Les essais ne mettent pas le modèle en défaut","Le modèle est exact","Le modèle doit être amélioré ou recalé"],ok:close?0:2,
        expl:close?`L'écart (${nf(ec,1)} %) est inférieur à la dispersion des essais (${disp} %) : les essais ${F("ne mettent pas le modèle en défaut")}. On ne peut pas dire qu'il est exact : les essais ne permettent pas de trancher à mieux que ${disp} %.`
          :`L'écart (${nf(ec,1)} %) dépasse nettement la dispersion des essais (${disp} %) : le modèle ${F("doit être recalé")} (paramètre mal estimé : inertie, frottements…).`}]; },
  /* cohérence d'un modèle du premier ordre : 63 % et 95 % */
  ()=>{ const want=Math.random()<0.5, t1=rnd([0.2,0.3,0.4,0.5,0.8,1.2]), r=want?rnd([2.9,3,3.1]):rnd([1.8,2,2.2,4,4.5,5]), t2=r2(t1*r,2);
    const c=rnd(["d'un moteur","d'un vérin électrique","d'un ventilateur","d'une motopompe"]);
    const ctx=`Relevé sur la réponse indicielle ${c} : la sortie atteint 63 % de sa valeur finale à t1 = ${nf(t1,2)} s et 95 % à t2 = ${nf(t2,2)} s.`;
    return [{ctx,q:"Si le système était un premier ordre de constante de temps τ = t1, à quel instant atteindrait-il 95 % de sa valeur finale ?",type:"num",ans:3*t1,tolR:0.02,unit:"s",
        expl:`Pour un premier ordre, τ se lit à 63 % : τ = ${nf(t1,2)} s, et la sortie atteint 95 % à ${F("t ≈ 3τ")} = ${U(3*t1,"s")}.`},
      {ctx,q:"Le modèle du premier ordre est-il cohérent avec ce relevé ?",type:"ch",ch:YN,ok:want?0:1,
        expl:want?`Le relevé donne t2 = ${nf(t2,2)} s, très proche de 3τ = ${nf(3*t1,2)} s (écart relatif ${nf(Math.abs(t2-3*t1)/(3*t1)*100,1)} %, référence 3τ) : le modèle du premier ordre est ${F("cohérent")}.`
          :`Le relevé donne t2 = ${nf(t2,2)} s, loin de 3τ = ${nf(3*t1,2)} s (écart relatif ${nf(Math.abs(t2-3*t1)/(3*t1)*100,0)} %, référence 3τ) : ${F("un premier ordre ne convient pas")} (système d'ordre plus élevé, ou relevé à refaire).`}]; },
  /* adaptateur mal réglé après un changement de capteur */
  ()=>{ const Ka=rnd([0.05,0.1]), d=rnd([-0.2,-0.1,0.1,0.2]), Kc=r2(Ka*(1+d),3), B=rnd([100,200,400]), H=B/Kc, tc=rnd([20,22,24,25,26]), th=H*Ka*tc/(1+B);
    const ctx=`Régulation de température d'une chambre de culture. Après le remplacement de la sonde, le capteur a un gain Kc = ${nf(Kc,3)} V/°C, mais l'adaptateur est resté réglé sur Ka = ${nf(Ka,2)} V/°C. La chaîne directe a un gain très grand : H·Kc = ${B}. Consigne : θc = ${tc} °C.`;
    const fig=fx_auto_bloc({e:"θc (°C)",a:["Ka"],ea:"Uc (V)",d:[["H"]],lk:["ε (V)","θ (°C)"],r:["Sonde","Kc"],lr:"Umes (V)"});
    return [{fig,ctx,q:"Calcule la température atteinte en régime permanent.",type:"num",ans:th,tolR:0.02,unit:"°C",
        expl:`ε = Ka·θc − Kc·θ et θ = H·ε, donc ${F(`θ = ${FRAC("H·Ka","1 + H·Kc")}·θc`)}, avec H = ${FRAC(B,nf(Kc,3))} = ${nf(H,1)} °C/V : θ = ${FRAC(`${nf(H,1)} × ${nf(Ka,2)}`,`1 + ${B}`)} × ${tc} = ${U(th,"°C")}, presque ${FRAC("Ka","Kc")}·θc = ${nf(Ka/Kc*tc,2)} °C.`},
      {fig,ctx,q:"Pourquoi la température ne rejoint-elle pas la consigne, malgré un gain de boucle très grand ?",type:"ch",...mc("L'adaptateur n'a plus le même gain que le capteur : la boucle annule Ka·θc − Kc·θ, et non θc − θ",["Le gain H de la chaîne directe est trop faible","La sonde est trop lente pour suivre la température","Le correcteur devrait être placé dans la chaîne de retour"]),
        expl:`Une boucle à grand gain rend ε presque nul : Kc·θ ≈ Ka·θc, soit θ ≈ ${FRAC("Ka","Kc")}·θc. Si ${F("Ka ≠ Kc")}, la sortie se cale sur une mauvaise valeur : il faut régler l'adaptateur sur le gain du nouveau capteur.`}]; },
  /* essai en boucle ouverte avec mise en charge : justifier la boucle fermée */
  ()=>{ const c=rnd([{s:"d'un tapis roulant",yl:"v (m/s)",u:"m/s",w0:[0.5,0.6,0.8,1],d:2},{s:"du moteur d'un treuil",yl:"ω (rad/s)",u:"rad/s",w0:[100,120,150],d:0}]);
    const want=Math.random()<0.4, X=rnd([3,5]);
    const o=draw(()=>{ const w0=rnd(c.w0), p=want?rnd([1,1.5,2]):rnd([8,10,12,15,20]); const w1=r2(w0*(1-p/100),c.d+2); return {w0,w1,p:(w0-w1)/w0*100}; },o=>(o.p<=X)===want&&far(o.p,X,0.2));
    const tau=0.3, t1=2, Tm={tmax:4,xs:0.5,xm:0.1}, A=axY(1.2*o.w0);
    const f=t=>t<t1?ord1(o.w0,tau)(t):o.w1+(ord1(o.w0,tau)(t1)-o.w1)*Math.exp(-(t-t1)/tau);
    const fig=fx_auto_rep({...Tm,...A,yl:c.yl,c:[{f}],hl:[{y:o.w0,lab:wu(o.w0,c.u,c.d),x:0.15,a:"start",x0:0},{y:o.w1,lab:wu(o.w1,c.u,c.d+2),dy:15}],vl:[{t:t1,lab:"mise en charge",y:o.w0}]});
    const ctx=`Essai ${c.s} commandé en boucle ouverte : démarrage à vide, puis mise en charge à t = ${t1} s.`, ex=`Exigence : la vitesse ne doit pas varier de plus de ${X} % quand la charge change.`;
    const out=[{fig,ctx,q:"Calcule la chute de vitesse relative lors de la mise en charge (référence : vitesse à vide), en %.",type:"num",ans:o.p,tolR:0.02,tolA:0.05,unit:"%",
        expl:`${F(`chute = ${FRAC("v vide − v charge","v vide")} × 100`)} = ${FRAC(`${nf(o.w0,c.d)} − ${nf(o.w1,c.d+2)}`,nf(o.w0,c.d))} × 100 = ${U(o.p,"%")}.`},
      {fig,ctx:ex,q:"Cette exigence est-elle satisfaite en boucle ouverte ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(o.p,1)} % ${want?"≤":"&gt;"} ${X} % : ${want?"l'exigence est satisfaite, même sans boucle fermée.":"l'exigence n'est pas satisfaite."}`}];
    if(!want) out.push({fig,ctx:ex,q:"Quelle solution permet de réduire fortement cette chute de vitesse ?",type:"ch",...mc("Mesurer la vitesse et l'asservir en boucle fermée (capteur, comparateur, correcteur)",["Augmenter la constante de temps du moteur","Supprimer le réducteur pour alléger la chaîne","Commander le moteur avec une tension plus faible"]),
        expl:`En boucle fermée, la baisse de vitesse est mesurée, l'écart augmente et le correcteur augmente la commande : l'effet de la charge est divisé par ${F("1 + K<sub>BO</sub>")} (et annulé avec une action intégrale).`});
    return out; },
  /* temps de chauffe (premier ordre, logarithme) */
  ()=>{ const o=draw(()=>{ const th0=rnd([25,26,27,28]), K=rnd([15,20,25]), P=rnd([2,2.5,3]), tau=rnd([60,80,90,120]); const D=K*P, fr=rnd([0.5,0.6,0.7,0.8,0.9]), thT=Math.round(th0+fr*D); return {th0,K,P,tau,D,thT,fr:(thT-th0)/D}; },o=>o.D>=40&&o.D<=65&&o.fr>0.3&&o.fr<0.93);
    const t=-o.tau*ln(1-o.fr), thF=o.th0+o.D;
    const ctx=`Un chauffe-eau est chauffé par une résistance de ${nf(o.P,1)} kW. L'élévation de température de l'eau suit un premier ordre : Δθ(t) = K·P·(1 − e<sup>−${FRAC("t","τ")}</sup>), avec K = ${o.K} °C/kW et τ = ${o.tau} min. L'eau est initialement à ${o.th0} °C.`;
    return [{ctx,q:"Quelle température l'eau atteindrait-elle en régime permanent ?",type:"num",ans:thF,tolR:0.02,unit:"°C",
        expl:`Élévation finale : ${F("Δθ∞ = K·P")} = ${o.K} × ${nf(o.P,1)} = ${nf(o.D,1)} °C, donc θ∞ = ${o.th0} + ${nf(o.D,1)} = ${U(thF,"°C")}.`},
      {ctx,q:`Au bout de combien de temps l'eau atteint-elle ${o.thT} °C ?`,type:"num",ans:t,tolR:0.02,unit:"min",
        expl:`Il faut Δθ = ${o.thT} − ${o.th0} = ${o.thT-o.th0} °C, soit ${FRAC(o.thT-o.th0,nf(o.D,1))} = ${nf(o.fr,3)} de l'élévation finale. 1 − e<sup>−${FRAC("t","τ")}</sup> = ${nf(o.fr,3)}, donc ${F(`t = −τ·ln(1 − ${nf(o.fr,3)})`)} = −${o.tau} × ln(${nf(1-o.fr,3)}) = ${U(t,"min")}.`}]; },
  /* boucle à grand gain : la précision dépend du capteur */
  ()=>{ const Kc=rnd([0.05,0.1,0.2]), B=rnd([50,100,200]), H=B/Kc, E=rnd([2,3,4,5]), S=H*E/(1+B), v=rnd([2,4,5]);
    const ctx=`Asservissement de position d'un vérin : chaîne directe de gain H très grand, capteur de position de gain Kc = ${nf(Kc,2)} V/mm, avec H·Kc = ${B}. Tension de consigne : E = ${E} V.`;
    return [{ctx,q:"Calcule la position atteinte en régime permanent.",type:"num",ans:S,tolR:0.02,unit:"mm",
        expl:`${F(`S = ${FRAC("H","1 + H·Kc")}·E`)} avec H = ${FRAC(B,nf(Kc,2))} = ${nf(H,0)} mm/V : S = ${FRAC(nf(H,0),`1 + ${B}`)} × ${E} = ${U(S,"mm")}. Comme H·Kc ≫ 1, S ≈ ${FRAC("E","Kc")} = ${nf(E/Kc,2)} mm.`},
      {ctx,q:`En vieillissant, le capteur voit son gain augmenter de ${v} %. Que devient la position atteinte ?`,type:"ch",...mc(`Elle diminue d'environ ${v} % : la précision dépend directement du capteur`,["Elle ne change pas : la boucle fermée corrige toutes les erreurs",`Elle augmente d'environ ${v} %`,"Elle diminue de moitié"]),
        expl:`S ≈ ${FRAC("E","Kc")} : si Kc augmente de ${v} %, S diminue d'environ ${v} % (exactement ${nf(v/(100+v)*100,2)} %). La boucle fermée corrige les défauts de la chaîne directe, ${F("pas ceux du capteur")}.`}]; },
  /* erreur d'élève : τ lu à 95 % au lieu de 63 % */
  ()=>{ const c=rnd(C1), T=rnd(c.T), tau=rnd(T.tau), sf=rnd(c.sf), A=axY(1.2*sf), tw=3*tau, want=Math.random()<0.6, X=r2(tw*(want?rnd([1.25,1.5,1.8]):rnd([0.6,0.7,0.8])),3);
    const fig=fx_auto_rep({tmax:T.tmax,xs:T.xs,xm:T.xm,...A,yl:c.yl,xl:`t (${c.tu})`,c:[{f:ord1(sf,tau)}],hl:[{y:sf,lab:`valeur finale : ${wu(sf,c.u)}`}]});
    const ctx=`Réponse indicielle ${deX(c.s)}. Un élève relève l'instant où la sortie atteint 95 % de sa valeur finale et annonce : « τ = ${S3(tw)} ${c.tu} ».`;
    return [{fig,ctx,q:"Quelle est la vraie constante de temps τ ?",type:"num",ans:tau,tolR:0.02,unit:c.tu,
        expl:`L'instant où la sortie atteint 95 % de s∞ n'est pas τ mais ${F("3τ")} (temps de réponse à 5 %). Donc τ = ${FRAC(S3(tw),"3")} = ${U(tau,c.tu)} ; on le vérifie sur la courbe, qui vaut 63 % de s∞ à cet instant.`},
      {fig,ctx,q:`Exigence : temps de réponse à 5 % au plus ${nf(X,3)} ${c.tu}. Est-elle satisfaite ?`,type:"ch",ch:YN,ok:want?0:1,
        expl:`t5% ≈ 3τ = ${S3(tw)} ${c.tu} ${want?"≤":"&gt;"} ${nf(X,3)} ${c.tu} : ${want?`l'exigence est satisfaite. Avec son τ erroné, l'élève aurait trouvé t5% = ${S3(3*tw)} ${c.tu} et conclu à tort le contraire.`:"l'exigence n'est pas satisfaite."}`}]; },
  /* boucle ouverte et boucle fermée face à la même charge (figure) */
  ()=>{ const o=draw(()=>{ const w0=rnd([100,120,150]), B=rnd([3,4,5,7,9]), dBO=rnd([20,24,30,36,40]); return {w0,B,dBO,dBF:dBO/(1+B)}; },o=>onGrid(o.dBF,0.5));
    const t1=1.5, tau=0.25, tb=tau/(1+o.B), KB="K<sub>BO</sub>";
    const fo=t=>t<t1?ord1(o.w0,tau)(t):o.w0-o.dBO*(1-Math.exp(-(t-t1)/tau)), fc=t=>t<t1?ord1(o.w0,tb)(t):o.w0-o.dBF*(1-Math.exp(-(t-t1)/tb));
    const A=axY(1.25*o.w0), wbo=o.w0-o.dBO, wbf=o.w0-o.dBF;
    const fig=fx_auto_rep({tmax:3,xs:0.5,xm:0.1,...A,yl:"ω (rad/s)",c:[{f:fc,lab:"boucle fermée"},{f:fo,lab:"boucle ouverte",k:1,dash:"8 4"}],
      hl:[{y:wbf,lab:`${nf(wbf,1)} rad/s`,x:3,dy:-6},{y:wbo,lab:`${nf(wbo,1)} rad/s`,x:3,dy:15}],vl:[{t:t1,lab:"charge",y:o.w0}]});
    const ctx=`Un moteur est essayé en boucle ouverte, puis asservi en vitesse (correcteur proportionnel) ; les deux sont réglés pour tourner à ${o.w0} rad/s à vide. À t = ${nf(t1,1)} s, on applique la même charge.`;
    return [{fig,ctx,q:"Par combien la boucle fermée divise-t-elle la chute de vitesse due à la charge ?",type:"num",ans:1+o.B,tolR:0.02,unit:"",
        expl:`Chute en boucle ouverte : ${o.w0} − ${nf(wbo,1)} = ${nf(o.dBO,1)} rad/s ; en boucle fermée : ${o.w0} − ${nf(wbf,1)} = ${nf(o.dBF,1)} rad/s. Rapport : ${FRAC(nf(o.dBO,1),nf(o.dBF,1))} = ${U(1+o.B,"")}.`},
      {fig,ctx,q:`Déduis-en le gain de boucle ${KB} de l'asservissement.`,type:"num",ans:o.B,tolR:0.02,unit:"",
        expl:`En régime permanent, la boucle fermée divise l'effet de la charge par ${F(`1 + ${KB}`)} : ${KB} = ${nf(1+o.B,2)} − 1 = ${U(o.B,"")}. Elle est aussi ${nf(1+o.B,0)} fois plus rapide, comme le montre le démarrage.`}]; },
  /* schéma-bloc erroné : consigne et mesure de natures différentes */
  ()=>{ const c=rnd([{e:"θc (°C)",y:"θ (°C)",cp:["Sonde"],B:[["Correcteur"],["Radiateur","+ serre"]],g:"une température (°C)"},
      {e:"ωc (rad/s)",y:"ω (rad/s)",cp:["Codeur"],B:[["Correcteur"],["Hacheur","+ moteur"]],g:"une vitesse (rad/s)"},
      {e:"hc (m)",y:"h (m)",cp:["Capteur","de niveau"],B:[["Correcteur"],["Moto-","pompe"]],g:"une hauteur (m)"}]);
    return {fig:fx_auto_bloc({e:c.e,d:c.B,lk:["ε","Ucom (V)",c.y],r:c.cp,lr:"Umes (V)"}),ctx:"Schéma-bloc proposé par un élève pour une régulation.",
      q:"Ce schéma-bloc contient une erreur. Laquelle ?",type:"ch",...mc(`Le comparateur soustrait une tension (V) à ${c.g} : il manque un adaptateur qui convertit la consigne en tension`,["Le capteur devrait être placé dans la chaîne directe","Le signe − devrait être placé sur la consigne","Le correcteur devrait être placé après l'actionneur"]),
      expl:`Les deux entrées du comparateur doivent être de même nature et de même unité. La mesure est une tension, la consigne ${c.g} : il faut ${F("un adaptateur")}, de même gain que le capteur, entre la consigne et le comparateur.`}; },
  /* modèle linéaire et saturation de la tension du hacheur */
  ()=>{ const o=draw(()=>{ const Kh=rnd([2,3,4]), Km=rnd([10,12,15,20]), Ub=rnd([12,24,36]), Uc=rnd([4,5,6,8,10]); return {Kh,Km,Ub,Uc,wl:Kh*Uc*Km,wr:Ub*Km}; },o=>o.Kh*o.Uc>=1.25*o.Ub);
    const ctx=`Chaîne directe d'un robot : hacheur de gain Kh = ${o.Kh} (tension moteur Um = Kh·Ucom), moteur de gain Km = ${o.Km} (rad/s)/V. Le hacheur est alimenté par une batterie de ${o.Ub} V : Um ne peut pas dépasser ${o.Ub} V.`;
    return [{ctx,q:`Quelle vitesse le modèle linéaire (gains constants) prévoit-il pour Ucom = ${o.Uc} V ?`,type:"num",ans:o.wl,tolR:0.02,unit:"rad/s",
        expl:`${F("ω = Kh·Km·Ucom")} = ${o.Kh} × ${o.Km} × ${o.Uc} = ${U(o.wl,"rad/s")}.`},
      {ctx,q:"Quelle vitesse le moteur atteint-il réellement ?",type:"num",ans:o.wr,tolR:0.02,unit:"rad/s",
        expl:`Le modèle demande Um = ${o.Kh} × ${o.Uc} = ${o.Kh*o.Uc} V &gt; ${o.Ub} V : le hacheur sature à ${o.Ub} V. ${F("ω = Km·Ubat")} = ${o.Km} × ${o.Ub} = ${U(o.wr,"rad/s")}.`},
      {ctx,q:"Pourquoi le modèle linéaire se trompe-t-il ici ?",type:"ch",...mc("Il suppose des gains constants, alors que la tension du hacheur est limitée par la batterie (saturation)",["Il néglige la constante de temps du moteur","Il faudrait additionner les gains du hacheur et du moteur","Le capteur de vitesse est mal réglé"]),
        expl:`Un schéma-bloc à gains constants n'est valable que ${F("hors saturation")}. La constante de temps ne change que la durée du transitoire, pas la vitesse finale.`}]; }
];

POOLS["auto-schema-bloc"]={
  titre:"Schéma-bloc, fonction de transfert",
  fiche:{t:"Schéma-bloc et fonction de transfert",l:[
    `Boucle fermée : consigne → ${F("comparateur")} → écart → correcteur → préactionneur → actionneur → sortie, mesurée par le ${F("capteur")} (chaîne de retour).`,
    `Comparateur : ${F("ε = consigne − mesure")}, deux tensions ; l'adaptateur de consigne a ${F("le même gain que le capteur")}.`,
    `Blocs en série : ${F("K = K1·K2·K3")} ; unité d'un gain : ${F(FRAC("unité de sortie","unité d'entrée"))}, par exemple (rad/s)/V.`,
    `Boucle fermée en régime permanent : ${F(`S = ${FRAC("H","1 + H·Kc")}·E`)} ; premier ordre ${F(`H(p) = ${FRAC("K","1 + τ·p")}`)} : ${F("s∞ = K·E0")}.`,
    `Pièges : τ se lit à ${F("63 %")} de s∞ (ou avec la tangente à l'origine), pas à 95 % (c'est 3τ) ; ne jamais additionner des gains en série.`]},
  count:{1:4,2:4,3:3},1:SB1,2:SB2,3:SB3};

/* ======================================================================
   PRÉCISION, RAPIDITÉ, STABILITÉ — auto-performances
   ====================================================================== */
/* axes à pas 1, 2 ou 5 × 10^k ; grille fine au cinquième si l'intervalle dépasse 45 px, sinon à la moitié */
const NS=[0.01,0.02,0.05,0.1,0.2,0.5,1,2,5,10,20,50,100,200,500,1000];
function nax(top,nmax,px){ for(const s of NS){ const n=Math.ceil(top/s-1e-9); if(n<=nmax) return {max:+(n*s).toPrecision(8),s,m:+(px/n>=45?s/5:s/2).toPrecision(8)}; } return {max:top,s:top/5,m:top/10}; }
const axR=(tTop,yTop,H)=>{ const a=nax(tTop,6,308), b=nax(yTop,7,H||166); return {tmax:a.max,xs:a.s,xm:a.m,ymax:b.max,ys:b.s,ym:b.m}; };
/* repère agrandi pour lire la bande ± 5 % */
const TALL={H:220,Y0:258,h:300};
/* réponses « conçues » : 2e ordre de valeur finale sf, de dépassement D (fraction > 0) et de temps de réponse à 5 % t5 ; premier ordre de temps de réponse t5 */
const T5N=new Map();   /* temps de réponse réduit (ωn = 1) selon l'amortissement, mémorisé */
function mk2(sf,D,t5,t0){ const z=zOfD(D); let T=T5N.get(z); if(T==null){ T=t5of(ord2(1,z,1),1,14/z,5000); T5N.set(z,T); } const wn=T/t5; return {f:ord2(sf,z,wn,t0),z,wn,tp:(t0||0)+Math.PI/(wn*Math.sqrt(1-z*z))}; }
const mk1=(sf,t5,t0)=>({f:ord1(sf,t5/ln(20),t0),tau:t5/ln(20)});
const mkR=(sf,D,t5,t0)=>D?mk2(sf,D,t5,t0):mk1(sf,t5,t0);
/* première entrée dans la bande ± 5 % */
function tIn(f,yf,tmax){ for(let i=0;i<=6000;i++){ const t=tmax*i/6000; if(Math.abs(f(t)-yf)<=0.05*Math.abs(yf)) return t; } return tmax; }
/* premier passage par une valeur (montée) */
function tUp(f,y,tmax){ for(let i=0;i<=6000;i++){ const t=tmax*i/6000; if(f(t)>=y) return t; } return tmax; }
/* systèmes asservis : consignes c, temps de réponse typiques t5, décimales d */
const SR=[
  {nm:"l'asservissement de vitesse d'un tapis roulant",g:"la vitesse du tapis",y:"v",u:"m/s",d:2,c:[0.5,0.6,0.8,1,1.2,1.5],tu:"s",t5:[0.8,1,1.2,1.5,2]},
  {nm:"l'asservissement de vitesse du moteur d'un robot",g:"la vitesse de rotation du moteur",y:"ω",u:"rad/s",d:1,c:[50,80,100,120,150,200],tu:"s",t5:[0.2,0.3,0.4,0.5,0.6]},
  {nm:"l'asservissement d'altitude d'un drone",g:"l'altitude du drone",y:"z",u:"m",d:2,c:[2,3,4,5,6,8,10],tu:"s",t5:[1.5,2,2.5,3,4]},
  {nm:"l'asservissement de position d'un bras de robot",g:"la position angulaire du bras",y:"θ",u:"°",d:1,c:[30,40,50,60,80,90,120],tu:"s",t5:[0.4,0.5,0.6,0.8,1]},
  {nm:"le pilote automatique de cap d'un bateau",g:"l'angle de virage du bateau",y:"ψ",u:"°",d:1,c:[10,20,30,40],tu:"s",t5:[8,10,12,15,20]},
  {nm:"la régulation de niveau d'une citerne d'eau de pluie",g:"le niveau d'eau",y:"h",u:"m",d:2,c:[1,1.2,1.5,2,2.5],tu:"min",t5:[3,4,5,6,8]},
  {nm:"l'asservissement de position d'un vérin électrique",g:"la position de la tige",y:"x",u:"mm",d:1,c:[50,80,100,150,200],tu:"s",t5:[0.3,0.4,0.5,0.8,1]},
  {nm:"l'asservissement d'orientation d'un panneau solaire suiveur",g:"l'inclinaison du panneau",y:"α",u:"°",d:1,c:[10,20,30,40],tu:"s",t5:[4,5,6,8,10]}];
const vu=(S,x,d)=>wu(x,S.u,d==null?S.d:d), VU=(S,x)=>Uu(x,S.u), sfx=u=>u==="°"?"°":" "+u;
/* tableau de relevés : espaces insécables dans les cellules (la valeur et son unité restent sur une ligne) */
const tab=(h,rows)=>table(h,rows.map(r=>r.map(c=>String(c).replace(/ /g,"\u00a0"))));
const figR=(S,A,o)=>fx_auto_rep(Object.assign({...A,yl:`${S.y} (${S.u})`,xl:`t (${S.tu})`},o));
const EPC=`εs = ${FRAC("|consigne − s∞|","consigne")} × 100`, DPC=`D = ${FRAC("s max − s∞","s∞")} × 100`;
/* situations décrites en texte : erreur statique (c consigne, s valeur finale) */
const TXES=[
  {t:(c,s)=>`La consigne de vitesse d'un tapis roulant vaut ${nf(c,2)} m/s ; en régime permanent, la vitesse se stabilise à ${nf(s,3)} m/s.`,c:[0.5,0.8,1,1.2,1.5],d:3},
  {t:(c,s)=>`Un drone reçoit une consigne d'altitude de ${nf(c,1)} m ; il se stabilise à ${nf(s,2)} m.`,c:[3,4,5,6,8,10],d:2},
  {t:(c,s)=>`Un bras de robot doit tourner de ${nf(c,0)}° ; il s'immobilise après avoir tourné de ${nf(s,1)}°.`,c:[30,45,60,90,120],d:1},
  {t:(c,s)=>`La consigne de vitesse du moteur d'un robot vaut ${nf(c,0)} rad/s ; la vitesse mesurée se stabilise à ${nf(s,1)} rad/s.`,c:[100,120,150,200,250],d:1},
  {t:(c,s)=>`Une citerne doit être remplie jusqu'à ${nf(c,2)} m ; le niveau se stabilise à ${nf(s,3)} m.`,c:[1.2,1.5,1.8,2],d:3},
  {t:(c,s)=>`La tige d'un vérin électrique doit sortir de ${nf(c,0)} mm ; elle s'arrête à ${nf(s,1)} mm.`,c:[80,100,150,200],d:1}];
/* situations décrites en texte : dépassement (c consigne, m premier pic, s valeur finale) */
const TXD=[
  {t:(c,m,s)=>`Un bras de robot doit tourner de ${nf(c,0)}°. Il atteint ${nf(m,1)}° au premier pic, puis se stabilise à ${nf(s,1)}°.`,c:[30,45,60,90,120],d:1},
  {t:(c,m,s)=>`Un drone reçoit une consigne d'altitude de ${nf(c,1)} m. Il monte jusqu'à ${nf(m,2)} m au premier pic, puis se stabilise à ${nf(s,2)} m.`,c:[2,3,4,5,6,8],d:2},
  {t:(c,m,s)=>`La tige d'un vérin électrique doit sortir de ${nf(c,0)} mm. Elle atteint ${nf(m,1)} mm au premier pic, puis se stabilise à ${nf(s,1)} mm.`,c:[80,100,150,200],d:1},
  {t:(c,m,s)=>`Le pilote automatique doit faire virer un bateau de ${nf(c,0)}°. Au premier pic, le bateau a viré de ${nf(m,1)}° ; il se stabilise ensuite à ${nf(s,1)}° de son cap initial.`,c:[20,30,40,60],d:1},
  {t:(c,m,s)=>`La consigne de vitesse d'un moteur passe de 0 à ${nf(c,0)} rad/s. La vitesse monte jusqu'à ${nf(m,1)} rad/s, puis se stabilise à ${nf(s,1)} rad/s.`,c:[100,150,200,250],d:1}];
/* grandeurs modélisées par un premier ordre */
const C1T=[
  {s:"La vitesse de rotation du moteur d'un ventilateur",tau:[0.2,0.25,0.4,0.5,0.8],u:"s"},
  {s:"Le niveau d'eau d'une citerne régulée",tau:[2,3,4,5,6],u:"min"},
  {s:"La température de l'eau d'un chauffe-eau",tau:[15,20,25,30,40],u:"min"},
  {s:"La vitesse d'une pirogue à moteur électrique",tau:[2,3,4,5,6],u:"s"},
  {s:"L'altitude d'un drone asservi",tau:[0.4,0.5,0.6,0.8,1.2],u:"s"},
  {s:"La vitesse d'un tapis roulant asservi",tau:[0.15,0.2,0.3,0.4,0.5],u:"s"}];
/* sortie qui oscille avec une amplitude croissante (k = 1), constante (k = 0) ; démarrage du premier ordre de constante tr */
const oscF=(c,tr,w,k,tm)=>t=>{ const b=1-Math.exp(-t/tr); return c*b+(k?0.08*c*Math.exp(t*ln(11)/tm):0.3*c*b)*Math.sin(w*t); };

const PF1=[
  /* lire la valeur finale */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0,0,0.02,0.04,0.05,0.06,0.08,0.1]), D=rnd([0,0,0.1,0.15,0.2,0.3]), t5=rnd(S.t5), sf=r2(c*(1-e),6);
        return {c,sf,D,t5,A:axR(t5*rnd([1.8,2,2.4]),Math.max(c,sf*(1+D))*1.1)}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax);
    const es=r2(o.c-o.sf,6);
    return {fig:figR(S,o.A,{c:[{f:mkR(o.sf,o.D,o.t5).f}],cons:o.c}),ctx:`Réponse ${deX(S.nm)} à un échelon de consigne de ${vu(S,o.c)}, appliqué à t = 0.`,
      q:`Lis la valeur finale ${deX(S.g)}.`,type:"num",ans:o.sf,tolA:0.35*o.A.ym,unit:S.u,
      expl:`En régime permanent, la sortie se stabilise sur une horizontale : la valeur finale vaut s∞ = ${VU(S,o.sf)}.${o.D?" Ne la confonds pas avec le premier pic, atteint pendant le régime transitoire.":""} ${es>0?`Elle reste inférieure à la consigne (${vu(S,o.c)}) : il subsiste une erreur statique de ${vu(S,es)}.`:"Elle est égale à la consigne : l'erreur statique est nulle."}`}; },
  /* erreur statique en unité, lue sur la courbe */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0.04,0.05,0.06,0.08,0.1,0.12,0.15,0.2]), D=rnd([0,0,0.1,0.2,0.3]), t5=rnd(S.t5), sf=r2(c*(1-e),6);
        return {c,sf,D,t5,A:axR(t5*rnd([1.8,2,2.4]),Math.max(c,sf*(1+D))*1.1)}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax&&o.c-o.sf>=1.9*o.A.ym);
    const es=r2(o.c-o.sf,6);
    return {fig:figR(S,o.A,{c:[{f:mkR(o.sf,o.D,o.t5).f}],cons:o.c}),ctx:`Réponse ${deX(S.nm)} à un échelon de consigne.`,
      q:`Détermine l'erreur statique εs, en ${S.u}.`,type:"num",ans:es,tolA:0.35*o.A.ym,unit:S.u,
      expl:`On lit la consigne (${vu(S,o.c)}) et la valeur finale s∞ = ${vu(S,o.sf)}. ${F("εs = consigne − s∞")} = ${nf(o.c,S.d)} − ${nf(o.sf,S.d)} = ${VU(S,es)}. La sortie n'atteint pas la consigne : c'est un défaut de précision.`}; },
  /* erreur statique relative, à partir des valeurs */
  ()=>{ const C=rnd(TXES), o=draw(()=>{ const c=rnd(C.c), p=rnd([1,1.5,2,2.5,3,4,5,6,8,10,12,15]), s=r2(c*(1-p/100),C.d); return {c,s,e:Math.abs(c-s)/c*100}; },o=>o.e>0.5);
    return {ctx:C.t(o.c,o.s),q:"Calcule l'erreur statique relative, en % de la consigne.",type:"num",ans:o.e,tolR:0.02,unit:"%",
      expl:`${F(EPC)} = ${FRAC(`|${nf(o.c,C.d)} − ${nf(o.s,C.d)}|`,nf(o.c,C.d))} × 100 = ${U(o.e,"%")}. La référence est la consigne.`}; },
  /* dépassement relatif, à partir des valeurs */
  ()=>{ const C=rnd(TXD), o=draw(()=>{ const c=rnd(C.c), e=rnd([0,0,0,0.02,0.04,0.05]), D=rnd([5,8,10,12,15,20,25,30,40]), s=r2(c*(1-e),C.d), m=r2(s*(1+D/100),C.d); return {c,s,m,D:(m-s)/s*100}; },o=>o.D>1);
    return {ctx:C.t(o.c,o.m,o.s),q:"Calcule le dépassement relatif du premier pic, en %.",type:"num",ans:o.D,tolR:0.02,unit:"%",
      expl:`${F(DPC)} = ${FRAC(`${nf(o.m,C.d)} − ${nf(o.s,C.d)}`,nf(o.s,C.d))} × 100 = ${U(o.D,"%")}. La référence est la valeur finale s∞${o.s!==o.c?`, et non la consigne (${nf(o.c,C.d)})`:""}.`}; },
  /* premier ordre : t5% ≈ 3τ, calcul direct ou inverse */
  ()=>{ const C=rnd(C1T), tau=rnd(C.tau);
    if(Math.random()<0.5) return {ctx:`${C.s} évolue comme la réponse d'un premier ordre de constante de temps τ = ${nf(tau,2)} ${C.u}.`,q:"Calcule son temps de réponse à 5 %.",type:"num",ans:3*tau,tolR:0.02,unit:C.u,
      expl:`Un premier ordre atteint 95 % de sa valeur finale à t = 3τ (1 − e<sup>−3</sup> ≈ 0,95) et ne la dépasse jamais : il reste ensuite dans la bande ± 5 %. ${F("t5% ≈ 3τ")} = 3 × ${nf(tau,2)} = ${U(3*tau,C.u)}.`};
    const X=r2(3*tau,4);
    return {ctx:`${C.s} évolue comme la réponse d'un premier ordre. Le cahier des charges impose un temps de réponse à 5 % d'au plus ${nf(X,2)} ${C.u}.`,q:"Quelle constante de temps τ maximale faut-il ?",type:"num",ans:X/3,tolR:0.02,unit:C.u,
      expl:`Pour un premier ordre, ${F("t5% ≈ 3τ")}. Il faut 3τ ≤ ${nf(X,2)} ${C.u}, donc ${F(`τ ≤ ${FRAC("t5%","3")}`)} = ${FRAC(nf(X,2),"3")} = ${U(X/3,C.u)}.`}; },
  /* cours : les critères de performance */
  ()=>{ const K=[
      ["Quel critère caractérise la précision d'un système asservi ?","L'erreur statique, écart entre la consigne et la valeur finale",["Le temps de réponse à 5 %","Le dépassement du premier pic","La durée du régime transitoire"],`La précision se juge en régime permanent : ${F("εs = consigne − s∞")}. Le temps de réponse caractérise la rapidité, le dépassement l'amortissement (la stabilité).`],
      ["Quel critère caractérise la rapidité d'un système asservi ?","Le temps de réponse à 5 %",["L'erreur statique","Le dépassement du premier pic","La valeur finale"],`La rapidité se mesure par ${F("le temps de réponse à 5 %")} : plus il est court, plus le système est rapide.`],
      ["À quoi reconnaît-on qu'un système asservi est stable ?","Pour une consigne constante, sa sortie converge vers une valeur finale",["Sa sortie n'oscille jamais","Sa sortie atteint exactement la consigne","Sa sortie ne dépasse jamais la consigne"],`Un système est stable si, pour une consigne constante, sa sortie ${F("converge vers une valeur finale")}. Des oscillations amorties n'empêchent pas la stabilité, une erreur statique non plus.`],
      ["Que mesure le dépassement relatif du premier pic ?","L'écart entre le premier pic et la valeur finale, rapporté à la valeur finale",["L'écart entre la consigne et la valeur finale, rapporté à la consigne","La durée pendant laquelle la sortie reste au-dessus de la consigne","Le nombre d'oscillations avant la stabilisation"],`${F(DPC)} : il mesure l'amortissement. L'écart entre consigne et valeur finale, rapporté à la consigne, est l'erreur statique relative.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* stable ou instable, sur une réponse */
  ()=>{ const S=rnd(SR), c=rnd(S.c), t5=rnd(S.t5), v=ri(0,4), A=axR(t5*2.5,2.02*c), w=2*Math.PI*rnd([4,5])/A.tmax;
    const f=v===0?mk1(c,t5).f:v===1?mk2(c,rnd([0.35,0.45,0.55]),t5).f:v===4?(t=>c*0.04*(Math.exp(t*4.2/A.tmax)-1)):oscF(c,A.tmax/15,w,v===2?1:0,A.tmax);
    const CH=["Stable : la sortie converge vers une valeur constante","Instable : la sortie s'éloigne de plus en plus","À la limite de la stabilité : oscillations d'amplitude constante"];
    const EX=[`La sortie monte puis se stabilise sur une valeur finale : le système est ${F("stable")}.`,
      `La sortie oscille, mais l'amplitude des oscillations diminue et la sortie converge vers une valeur finale : le système est ${F("stable")}. Osciller n'est pas être instable.`,
      `L'amplitude des oscillations augmente : la sortie ne converge pas, le système est ${F("instable")}. Il n'a ni valeur finale, ni temps de réponse, ni erreur statique.`,
      `Les oscillations gardent la même amplitude : la sortie ne converge pas. Le système est ${F("à la limite de la stabilité")} ; en pratique, ce réglage est inacceptable.`,
      `La sortie croît sans fin, sans se stabiliser : le système est ${F("instable")}. En pratique, elle serait arrêtée par une saturation ou une butée.`];
    return {fig:figR(S,A,{c:[{f}],cons:c}),ctx:`Réponse ${deX(S.nm)} à un échelon de consigne, pour un réglage à l'essai.`,q:"Que peut-on dire de la stabilité de ce système ?",type:"ch",ch:CH,ok:[0,0,1,2,1][v],expl:EX[v]}; },
  /* lire le temps de réponse à 5 %, bande tracée */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const sf=rnd(S.c), D=rnd([0,0,0.12,0.15]), t5=rnd(S.t5); return {sf,D,t5,A:axR(t5*rnd([1.6,1.8,2,2.2]),sf*(1+D)*1.1,220)}; },
      o=>onGrid(o.t5,o.A.xm)&&o.t5<=0.7*o.A.tmax&&o.t5>=0.35*o.A.tmax);
    const m=mkR(o.sf,o.D,o.t5), t1=tIn(m.f,o.sf,o.A.tmax), bd=`La bande va de ${vu(S,0.95*o.sf,S.d+1)} à ${vu(S,1.05*o.sf,S.d+1)}.`, T5=F(`t5% ≈ ${S3(o.t5)} ${S.tu}`);
    return {fig:figR(S,o.A,{...TALL,c:[{f:m.f}],band:o.sf,bandTxt:"bande ± 5 %"}),ctx:`Réponse indicielle ${deX(S.nm)}. La bande ± 5 % autour de la valeur finale est tracée.`,
      q:"Lis le temps de réponse à 5 %.",type:"num",ans:o.t5,tolA:0.5*o.A.xm,unit:S.tu,
      expl:o.D?`${bd} La sortie y entre une première fois vers t = ${nf(t1,2)} ${S.tu}, en ressort au premier pic, puis y rentre pour ne plus en sortir : ${T5}.`
        :`${bd} La sortie monte sans dépasser : elle entre dans la bande et n'en ressort plus, à ${T5}.`}; },
  /* lire le premier pic : valeur ou instant */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const sf=rnd(S.c), t5=rnd(S.t5), A=axR(t5*rnd([1.6,2,2.4]),sf*1.5), ks=[]; for(let k=1;k*A.ym<=0.45*sf+1e-9;k++) if(k*A.ym>=0.1*sf-1e-9) ks.push(k); return {sf,t5,A,ks}; },
      o=>o.ks.length&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax);
    const smax=r2(o.sf+rnd(o.ks)*o.A.ym,6), m=mk2(o.sf,(smax-o.sf)/o.sf,o.t5);
    const fig=figR(S,o.A,{c:[{f:m.f}],pts:[{t:m.tp,y:smax,px:true,py:true}]}), ctx=`Réponse indicielle ${deX(S.nm)} ; le premier pic est repéré par un point.`;
    if(Math.random()<0.5) return {fig,ctx,q:"Lis la valeur de la sortie au premier pic.",type:"num",ans:smax,tolA:0.35*o.A.ym,unit:S.u,
      expl:`Le premier pic est le maximum de la courbe : ${F(`s max = ${S3(smax)}${sfx(S.u)}`)}. La sortie redescend ensuite vers sa valeur finale, ${vu(S,o.sf)}.`};
    return {fig,ctx,q:"À quel instant se produit le premier pic ?",type:"num",ans:m.tp,tolA:0.6*o.A.xm,unit:S.tu,
      expl:`On projette le point du premier pic sur l'axe des temps : ${F(`t pic ≈ ${S3(m.tp)} ${S.tu}`)}. À cet instant, la sortie vaut ${vu(S,smax)}, au-dessus de sa valeur finale (${vu(S,o.sf)}).`}; },
  /* cours : lecture du temps de réponse à 5 % */
  ()=>{ const K=[
      ["Comment lit-on le temps de réponse à 5 % sur une réponse indicielle ?","C'est l'instant à partir duquel la sortie reste dans la bande ± 5 % autour de sa valeur finale",["C'est l'instant où la sortie entre pour la première fois dans la bande ± 5 %","C'est l'instant où la sortie atteint 5 % de sa valeur finale","C'est l'instant du premier pic"],`La sortie peut entrer dans la bande, en ressortir au premier pic, puis y revenir : on retient l'instant à partir duquel elle ${F("y reste définitivement")}.`],
      ["Un système asservi présente une erreur statique. Autour de quelle valeur trace-t-on la bande ± 5 % pour lire le temps de réponse ?","Autour de la valeur finale s∞",["Autour de la consigne","Autour du premier pic","Autour de la moitié de la valeur finale"],`Le temps de réponse mesure la durée nécessaire pour que la sortie s'établisse sur sa propre valeur finale : la bande est centrée sur ${F("s∞")}, de 0,95·s∞ à 1,05·s∞, même si s∞ diffère de la consigne.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* classer une exigence selon le critère de performance */
  ()=>{ const E=[
      ["L'altitude atteinte par le drone doit être égale à la consigne à 5 cm près.",0],["La vitesse du tapis doit être établie à ± 5 % en moins de 2 s.",1],["Le bras ne doit pas dépasser la position visée de plus de 10 %.",2],
      ["Le cap du bateau ne doit pas osciller durablement autour de la consigne.",2],["En régime permanent, la température de la serre doit rester à moins de 0,5 °C de la consigne.",0],["Le niveau de la citerne doit être atteint à ± 5 % près en moins de 10 min.",1],
      ["Erreur statique nulle pour une consigne constante.",0],["Premier dépassement inférieur à 20 % de la valeur finale.",2],["Temps de réponse à 5 % inférieur à 0,5 s.",1]];
    const [t,k]=rnd(E), CH=["Précision","Rapidité","Stabilité (amortissement)"];
    const EX=["elle porte sur l'écart entre la sortie et la consigne en régime permanent, c'est-à-dire l'erreur statique.","elle porte sur la durée du régime transitoire, c'est-à-dire le temps de réponse à 5 %.","elle porte sur les oscillations et le dépassement de la sortie, c'est-à-dire l'amortissement."];
    return {ctx:`Exigence du cahier des charges : « ${t} »`,q:"Quel critère de performance cette exigence concerne-t-elle ?",type:"ch",ch:CH,ok:k,expl:`${F(CH[k])} : ${EX[k]}`}; },
  /* conclure sur une exigence après un calcul simple */
  ()=>{ const v=ri(0,2), want=Math.random()<0.5, cl=want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite.", cmp=want?"≤":"&gt;";
    if(v===0){ const o=draw(()=>{ const c=rnd([0.8,1,1.2,1.5]), p=rnd([1,1.5,2,3,4,5,6,8]), X=rnd([2,3,5]), s=r2(c*(1-p/100),3); return {c,s,X,e:(c-s)/c*100}; },o=>(o.e<=o.X)===want&&far(o.e,o.X,0.2));
      return {ctx:`Pour une consigne de ${nf(o.c,2)} m/s, la vitesse d'un tapis roulant se stabilise à ${nf(o.s,3)} m/s. Exigence : erreur statique au plus ${o.X} % de la consigne.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${F(EPC)} = ${FRAC(`|${nf(o.c,2)} − ${nf(o.s,3)}|`,nf(o.c,2))} × 100 = ${nf(o.e,2)} % ${cmp} ${o.X} % : ${cl}`}; }
    if(v===1){ const o=draw(()=>{ const s=rnd([45,60,90,120]), D=rnd([4,6,8,10,12,15,20,25,30]), X=rnd([5,10,15,20]), m=r2(s*(1+D/100),1); return {s,m,X,D:(m-s)/s*100}; },o=>(o.D<=o.X)===want&&far(o.D,o.X,0.2));
      return {ctx:`Un bras de robot doit tourner de ${o.s}°. Il atteint ${nf(o.m,1)}° au premier pic, puis se stabilise à ${o.s}°. Exigence : dépassement au plus ${o.X} %.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${F(DPC)} = ${FRAC(`${nf(o.m,1)} − ${o.s}`,o.s)} × 100 = ${nf(o.D,1)} % ${cmp} ${o.X} % : ${cl}`}; }
    const o=draw(()=>{ const tau=rnd([0.2,0.3,0.4,0.5,0.6,0.8]), X=rnd([0.5,0.8,1,1.2,1.5,2]); return {tau,X}; },o=>(3*o.tau<=o.X)===want&&far(3*o.tau,o.X,0.15));
    return {ctx:`La vitesse d'un ventilateur asservi se comporte comme un premier ordre de constante de temps τ = ${nf(o.tau,2)} s. Exigence : temps de réponse à 5 % au plus ${nf(o.X,1)} s.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
      expl:`${F("t5% ≈ 3τ")} = 3 × ${nf(o.tau,2)} = ${nf(3*o.tau,2)} s ${cmp} ${nf(o.X,1)} s : ${cl}`}; }
];

const PF2=[
  /* dépassement : lire le premier pic, puis calculer D */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0,0,0,0.04,0.05,0.08,0.1]), sf=r2(c*(1-e),6), t5=rnd(S.t5), A=axR(t5*rnd([1.8,2,2.4]),c*1.45), ks=[];
        for(let k=1;k*A.ym<=0.42*sf+1e-9;k++) if(k*A.ym>=0.08*sf-1e-9) ks.push(k); return {c,sf,t5,A,ks}; },
      o=>o.ks.length&&onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax);
    const smax=r2(o.sf+rnd(o.ks)*o.A.ym,6), D=(smax-o.sf)/o.sf*100, m=mk2(o.sf,D/100,o.t5);
    const fig=figR(S,o.A,{c:[{f:m.f}],cons:o.c,pts:[{t:m.tp,y:smax}]});
    return [{fig,ctx:`Réponse ${deX(S.nm)} à un échelon de consigne de ${vu(S,o.c)}.`,q:"Lis la valeur maximale s max atteinte par la sortie.",type:"num",ans:smax,tolA:0.35*o.A.ym,unit:S.u,
        expl:`Le maximum est atteint au premier pic (point repéré) : ${F(`s max = ${S3(smax)}${sfx(S.u)}`)}.`},
      {fig,ctx:`On relève s max = ${vu(S,smax)} et s∞ = ${vu(S,o.sf)}.`,q:"Calcule le dépassement relatif D du premier pic, en %.",type:"num",ans:D,tolR:0.02,unit:"%",
        expl:`${F(DPC)} = ${FRAC(`${nf(smax,S.d)} − ${nf(o.sf,S.d)}`,nf(o.sf,S.d))} × 100 = ${U(D,"%")}.${o.sf!==o.c?` La référence est la valeur finale, pas la consigne (${vu(S,o.c)}).`:""}`}]; },
  /* erreur statique relative lue sur la courbe, puis exigence */
  ()=>{ const S=rnd(SR), want=Math.random()<0.5;
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0.04,0.05,0.06,0.08,0.1,0.12,0.15,0.2,0.25]), sf=r2(c*(1-e),6), D=rnd([0,0,0.1,0.2]), t5=rnd(S.t5), X=rnd([5,8,10,12,15,20]);
        return {c,sf,D,t5,X,A:axR(t5*rnd([1.8,2,2.4]),Math.max(c,sf*(1+D))*1.1,220),es:(c-sf)/c*100}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax&&o.c-o.sf>=0.9*o.A.ym&&(o.es<=o.X)===want&&far(o.es,o.X,0.2));
    const fig=figR(S,o.A,{...TALL,c:[{f:mkR(o.sf,o.D,o.t5).f}],cons:o.c});
    return [{fig,ctx:`Réponse ${deX(S.nm)} à un échelon de consigne.`,q:"Détermine l'erreur statique relative, en % de la consigne.",type:"num",ans:o.es,tolR:0.02,unit:"%",
        expl:`On lit la consigne (${vu(S,o.c)}) et la valeur finale (${vu(S,o.sf)}). ${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(o.es,"%")}.`},
      {fig,ctx:`Exigence : erreur statique au plus ${o.X} % de la consigne.`,q:"L'exigence de précision est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(o.es,2)} % ${want?"≤":"&gt;"} ${o.X} % : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."}`}]; },
  /* calculer la bande (autour de s∞), puis lire le temps de réponse */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0,0,0.06,0.08,0.1,0.12]), sf=r2(c*(1-e),6), D=rnd([0.12,0.15]), t5=rnd(S.t5);
        return {c,sf,D,t5,A:axR(t5*rnd([1.6,1.8,2,2.2]),Math.max(c,sf*(1+D))*1.1,220)}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.7*o.A.tmax&&o.t5>=0.35*o.A.tmax);
    const m=mk2(o.sf,o.D,o.t5), t1=tIn(m.f,o.sf,o.A.tmax), lo=0.95*o.sf, hi=1.05*o.sf, base={...TALL,c:[{f:m.f}],cons:o.c};
    return [{fig:figR(S,o.A,base),ctx:`Réponse indicielle ${deX(S.nm)} ; en régime permanent, la sortie se stabilise à s∞ = ${vu(S,o.sf)}.`,q:"Calcule la limite basse de la bande ± 5 % qui sert à lire le temps de réponse.",type:"num",ans:lo,tolR:0.02,unit:S.u,
        expl:`La bande est centrée sur la valeur finale${o.sf!==o.c?`, et non sur la consigne (${vu(S,o.c)})`:""} : limite basse ${F("0,95·s∞")} = 0,95 × ${nf(o.sf,S.d)} = ${VU(S,lo)} ; limite haute 1,05 × ${nf(o.sf,S.d)} = ${vu(S,hi,S.d+1)}.`},
      {fig:figR(S,o.A,{...base,band:o.sf,bandTxt:"bande ± 5 %"}),ctx:`La bande de ${vu(S,lo,S.d+1)} à ${vu(S,hi,S.d+1)} est maintenant tracée.`,q:"Lis le temps de réponse à 5 %.",type:"num",ans:o.t5,tolA:0.5*o.A.xm,unit:S.tu,
        expl:`La sortie entre dans la bande vers t = ${nf(t1,2)} ${S.tu}, mais en ressort au premier pic. Elle y rentre pour ne plus en sortir à ${F(`t5% ≈ ${S3(o.t5)} ${S.tu}`)}.`}]; },
  /* premier ordre : 95 %, temps de réponse, constante de temps */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const sf=rnd(S.c), t5=rnd(S.t5); return {sf,t5,A:axR(t5*rnd([1.6,1.8,2,2.2]),sf*1.1,220)}; },o=>onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.7*o.A.tmax&&o.t5>=0.4*o.A.tmax);
    const m=mk1(o.sf,o.t5), s95=0.95*o.sf, fig=figR(S,o.A,{...TALL,c:[{f:m.f}],hl:[{y:o.sf,lab:"valeur finale"}]}), ctx=`Réponse indicielle ${deX(S.nm)}, modélisée par un premier ordre.`;
    return [{fig,ctx,q:"Quelle valeur la sortie atteint-elle à l'instant t5% ?",type:"num",ans:s95,tolR:0.02,unit:S.u,
        expl:`Un premier ordre ne dépasse jamais sa valeur finale : il reste dans la bande ± 5 % dès qu'il atteint ${F("95 % de s∞")}, soit 0,95 × ${nf(o.sf,S.d)} = ${VU(S,s95)}.`},
      {fig,ctx,q:"Lis le temps de réponse à 5 %.",type:"num",ans:o.t5,tolA:0.5*o.A.xm,unit:S.tu,
        expl:`La courbe atteint ${vu(S,s95,S.d+1)} à ${F(`t5% ≈ ${S3(o.t5)} ${S.tu}`)}, puis reste dans la bande.`},
      {fig,ctx:`On retient t5% = ${nf(o.t5,2)} ${S.tu}.`,q:"Déduis-en la constante de temps τ du modèle.",type:"num",ans:o.t5/3,tolR:0.02,unit:S.tu,
        expl:`${F("t5% ≈ 3τ")}, donc τ ≈ ${FRAC(nf(o.t5,2),"3")} = ${U(o.t5/3,S.tu)}. Vérification : à t = τ, la courbe vaut 63 % de s∞, soit ${vu(S,0.63*o.sf,S.d+1)}.`}]; },
  /* limites de la bande quand il reste une erreur statique */
  ()=>{ const S=rnd(SR), o=draw(()=>{ const c=rnd(S.c), e=rnd([0.04,0.05,0.06,0.08,0.1,0.12]); return {c,sf:r2(c*(1-e),S.d)}; },o=>o.sf<o.c);
    const iv=(a,b)=>`de ${vu(S,a,S.d+1)} à ${vu(S,b,S.d+1)}`;
    return {ctx:`Dans ${S.nm}, pour une consigne de ${vu(S,o.c)}, ${S.g} se stabilise à s∞ = ${vu(S,o.sf)}.`,q:"Entre quelles valeurs la sortie doit-elle rester pour qu'on puisse lire le temps de réponse à 5 % ?",type:"ch",
      ...mc(iv(0.95*o.sf,1.05*o.sf),[iv(0.95*o.c,1.05*o.c),iv(0.9*o.sf,1.1*o.sf),iv(0.95*o.sf,o.sf)]),
      expl:`La bande ± 5 % est centrée sur la valeur finale, pas sur la consigne : de ${F("0,95·s∞")} = ${vu(S,0.95*o.sf,S.d+1)} à ${F("1,05·s∞")} = ${vu(S,1.05*o.sf,S.d+1)}. Le temps de réponse est l'instant à partir duquel la sortie y reste.`}; },
  /* trois réponses : la plus rapide, le plus grand dépassement */
  ()=>{ const S=rnd(SR), sf=rnd(S.c), L3=["A","B","C"];
    const o=draw(()=>{ const TB=rnd(S.t5), TA=TB*rnd([1.5,1.8,2.2]), TC=TB*rnd([1.6,2,2.4]), DC=rnd([0.4,0.5,0.6]);
        const sh=[{f:mk1(sf,TA).f,t5:TA,D:0},{f:mk2(sf,0.1,TB).f,t5:TB,D:0.1},{f:mk2(sf,DC,TC).f,t5:TC,D:DC}], tm=Math.max(TA,TC)*1.15;
        return {sh,tm,DC,rB:tUp(sh[1].f,sf,tm),rC:tUp(sh[2].f,sf,tm),TA,TC}; },o=>far(o.TA,o.TC,0.2)&&o.rC<0.8*o.rB);
    const A=axR(o.tm,sf*(1+o.DC)*1.06), perm=shuffle([0,1,2]), Lof=k=>L3[perm.indexOf(k)];
    const fig=figR(S,A,{c:perm.map((p,i)=>({f:o.sh[p].f,lab:`courbe ${L3[i]}`,k:i,dash:[null,"8 4","2 3"][i]})),band:sf,bandTxt:"bande ± 5 %"});
    const ctx=`Trois réglages ${deX(S.nm)} donnent les trois réponses indicielles tracées (même valeur finale, ${vu(S,sf)}).`;
    return [{fig,ctx,q:"Quelle réponse est la plus rapide, au sens du temps de réponse à 5 % ?",type:"ch",ch:L3.map(l=>`Courbe ${l}`),ok:perm.indexOf(1),
        expl:`Avec la bande ± 5 %, on lit : ${perm.map((p,i)=>`courbe ${L3[i]}, t5% ≈ ${nf(o.sh[p].t5,2)} ${S.tu}`).join(" ; ")}. La plus rapide est la ${F(`courbe ${Lof(1)}`)}. La courbe ${Lof(2)} monte la première, mais elle oscille longtemps : c'est l'instant à partir duquel la sortie reste dans la bande qui compte.`},
      {fig,ctx,q:"Quelle réponse présente le plus grand dépassement ?",type:"ch",ch:L3.map(l=>`Courbe ${l}`),ok:perm.indexOf(2),
        expl:`La ${F(`courbe ${Lof(2)}`)} culmine à ${vu(S,sf*(1+o.DC))}, soit D = ${nf(o.DC*100,0)} % ; la courbe ${Lof(1)} dépasse de ${nf(10,0)} % seulement et la courbe ${Lof(0)} ne dépasse pas.`}]; },
  /* tableau de relevés et cahier des charges : quelle exigence n'est pas satisfaite ? */
  ()=>{ const S=rnd(SR), k=ri(0,3);
    const o=draw(()=>{ const c=rnd(S.c), Xe=rnd([2,3,5,10]), XD=rnd([10,15,20,25]), XT=rnd(S.t5);
        const e=k===0?Xe*rnd([1.5,1.8,2.2]):rnd([0,0,Xe*0.4,Xe*0.6]), D=k===1?XD*rnd([1.5,1.8,2.2]):rnd([0,XD*0.4,XD*0.6]), t5=r2(XT*(k===2?rnd([1.3,1.5,1.8]):rnd([0.5,0.6,0.7])),2);
        const sf=r2(c*(1-e/100),S.d), sm=r2(sf*(1+D/100),S.d); return {c,Xe,XD,XT,sf,sm,t5,ee:(c-sf)/c*100,DD:(sm-sf)/sf*100}; },
      o=>(k===0?o.ee>=1.3*o.Xe:o.ee<=0.75*o.Xe)&&(k===1?o.DD>=1.3*o.XD:o.DD<=0.75*o.XD)&&(k===2?o.t5>=1.25*o.XT:o.t5<=0.8*o.XT));
    const data=tab(["Relevé","Valeur"],[["Consigne",vu(S,o.c)],["Valeur finale",vu(S,o.sf)],["Premier pic",o.DD>0?vu(S,o.sm):"pas de dépassement"],["Temps de réponse à 5 %",`${nf(o.t5,2)} ${S.tu}`]]);
    const cm=(a,b)=>a<=b?"≤":"&gt;";
    return {data,ctx:`Essai ${deX(S.nm)}. Exigences : erreur statique au plus ${o.Xe} % de la consigne ; dépassement au plus ${o.XD} % ; temps de réponse à 5 % au plus ${nf(o.XT,2)} ${S.tu}.`,
      q:"Quelle exigence n'est pas satisfaite ?",type:"ch",ch:["Précision (erreur statique)","Amortissement (dépassement)","Rapidité (temps de réponse)","Aucune : toutes sont satisfaites"],ok:k,
      expl:`Précision : ${F("εs")} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${nf(o.ee,1)} % ${cm(o.ee,o.Xe)} ${o.Xe} %. Amortissement : ${o.DD>0?`${F("D")} = ${FRAC(`${nf(o.sm,S.d)} − ${nf(o.sf,S.d)}`,nf(o.sf,S.d))} × 100 = ${nf(o.DD,1)} %`:"D = 0 %"} ${cm(o.DD,o.XD)} ${o.XD} %. Rapidité : ${nf(o.t5,2)} ${S.tu} ${cm(o.t5,o.XT)} ${nf(o.XT,2)} ${S.tu}. ${k<3?`Seule l'exigence de ${["précision","dépassement","rapidité"][k]} n'est pas satisfaite.`:"Les trois exigences sont satisfaites."}`}; },
  /* conversion d'unités avant de conclure */
  ()=>{ const want=Math.random()<0.5, C=rnd([
      {nm:"Régulateur de vitesse d'une pirogue à moteur électrique",cu:"km/h",c:[8,10,12,15],k:1/3.6,cv:c=>FRAC(`${c} km/h`,"3,6")},
      {nm:"Régulateur de vitesse d'un bateau de pêche",cu:"nœuds",c:[5,6,8,10],k:1.852/3.6,cv:c=>`${FRAC(`${c} × 1,852`,"3,6")}`,note:" 1 nœud = 1,852 km/h."},
      {nm:"Asservissement de vitesse d'un tapis roulant",cu:"m/min",c:[30,36,45,60],k:1/60,cv:c=>FRAC(`${c} m`,"60 s")}]);
    const o=draw(()=>{ const c=rnd(C.c), p=rnd([1,2,3,4,5,6,8,10]), X=rnd([2,3,5]), cs=r2(c*C.k,3), vm=r2(cs*(1-p/100),2); return {c,cs,vm,X,e:Math.abs(cs-vm)/cs*100}; },o=>(o.e<=o.X)===want&&far(o.e,o.X,0.2));
    const ctx=`${C.nm} : consigne de ${o.c} ${C.cu}. En régime permanent, la vitesse mesurée vaut ${nf(o.vm,2)} m/s.${C.note||""}`;
    return [{ctx,q:"Convertis la consigne en m/s.",type:"num",ans:o.cs,tolR:0.02,unit:"m/s",expl:`${C.cv(o.c)} = ${U(o.cs,"m/s")}.`},
      {ctx,q:"Calcule l'erreur statique relative, en % de la consigne.",type:"num",ans:o.e,tolR:0.02,unit:"%",
        expl:`${F(EPC)} = ${FRAC(`|${nf(o.cs,3)} − ${nf(o.vm,2)}|`,nf(o.cs,3))} × 100 = ${U(o.e,"%")}. On compare des vitesses exprimées dans la même unité.`},
      {ctx:`Exigence : erreur statique au plus ${o.X} % de la consigne.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(o.e,2)} % ${want?"≤":"&gt;"} ${o.X} % : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."}`}]; },
  /* dépassement admissible : valeur limite, puis lecture */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const S=rnd(SR), c=rnd(S.c), X=rnd([5,10,15,20,25]), t5=rnd(S.t5), A=axR(t5*rnd([1.8,2,2.4]),c*1.5), lim=c*(1+X/100), ks=[];
        for(let k=1;k*A.ym<=0.45*c+1e-9;k++){ const sm=c+k*A.ym, gap=Math.abs(sm-lim); if(k*A.ym>=0.05*c-1e-9&&gap>=1.4*A.ym&&gap>=0.25*(lim-c)&&(sm<=lim)===want) ks.push(k); }
        return {S,c,X,t5,A,lim,ks}; },
      o=>o.ks.length&&onGrid(o.c,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax), S=o.S;
    const smax=r2(o.c+rnd(o.ks)*o.A.ym,6), Dm=(smax-o.c)/o.c*100, fig=figR(S,o.A,{c:[{f:mk2(o.c,Dm/100,o.t5).f}],cons:o.c});
    const ctx=`Exigence pour ${S.nm} : dépassement du premier pic au plus ${o.X} %. Consigne : ${vu(S,o.c)} ; l'erreur statique est nulle.`;
    return [{fig,ctx,q:"Quelle valeur la sortie ne doit-elle pas dépasser au premier pic ?",type:"num",ans:o.lim,tolR:0.02,unit:S.u,
        expl:`Ici s∞ = consigne = ${vu(S,o.c)}. D ≤ ${o.X} % impose ${F(`s max ≤ ${nf(1+o.X/100,2)} × s∞`)} = ${nf(1+o.X/100,2)} × ${nf(o.c,S.d)} = ${VU(S,o.lim)}.`},
      {fig,ctx:`Valeur limite : ${vu(S,o.lim,S.d+1)}. La figure montre la réponse simulée.`,q:"L'exigence de dépassement est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`Au premier pic, on lit s max ≈ ${vu(S,smax)}, ${want?"inférieur":"supérieur"} à ${vu(S,o.lim,S.d+1)} (D ≈ ${nf(Dm,1)} %) : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."}`}]; },
  /* perturbation : nouvelle valeur finale, erreur statique */
  ()=>{ const C=rnd([{S:SR[0],ev:"on dépose des colis sur le tapis"},{S:SR[1],ev:"le robot aborde une rampe"},{S:SR[5],ev:"on ouvre un robinet de soutirage"}]), S=C.S;
    const o=draw(()=>{ const c=rnd(S.c), e1=rnd([0,0.02,0.04,0.05]), s1=r2(c*(1-e1),6), t5=rnd(S.t5), A=axR(t5*rnd([3.2,3.6,4]),c*1.25), p=rnd([0.05,0.08,0.1,0.12,0.15,0.2]); return {c,s1,s2:r2(s1-p*c,6),t5,A}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.s1,o.A.ym)&&onGrid(o.s2,o.A.ym)&&o.s1-o.s2>=1.9*o.A.ym&&onGrid(o.t5,o.A.xm)&&1.8*o.t5<=0.5*o.A.tmax);
    const t1=Math.ceil(0.45*o.A.tmax/o.A.xs-1e-9)*o.A.xs, f1=mk2(o.s1,0.1,o.t5).f, g=mk2(1,0.1,o.t5).f, f=t=>t<t1?f1(t):f1(t)-(o.s1-o.s2)*g(t-t1), es=(o.c-o.s2)/o.c*100;
    const fig=figR(S,o.A,{c:[{f}],cons:o.c,vl:[{t:t1,lab:"perturbation",y:o.A.ymax}]}), ctx=`Réponse ${deX(S.nm)} (correcteur proportionnel). À t = ${nf(t1,2)} ${S.tu}, ${C.ev}.`;
    return [{fig,ctx,q:"Lis la valeur finale de la sortie après la perturbation.",type:"num",ans:o.s2,tolA:0.35*o.A.ym,unit:S.u,
        expl:`Après la perturbation, la sortie se stabilise sur une nouvelle horizontale : ${F(`s∞ = ${S3(o.s2)}${sfx(S.u)}`)}, contre ${vu(S,o.s1)} avant.`},
      {fig,ctx:`Consigne : ${vu(S,o.c)} ; valeur finale après la perturbation : ${vu(S,o.s2)}.`,q:"Calcule l'erreur statique relative après la perturbation, en % de la consigne.",type:"num",ans:es,tolR:0.02,unit:"%",
        expl:`${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.s2,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(es,"%")}. La perturbation crée une erreur statique supplémentaire que le correcteur proportionnel ne rattrape pas entièrement.`}]; },
  /* erreur d'élève : mauvaise référence */
  ()=>{ if(Math.random()<0.5){ const o=draw(()=>{ const c=rnd([60,80,90,120]), e=rnd([0.06,0.08,0.1,0.12]), D=rnd([10,15,20,25,30]), s=r2(c*(1-e),1), m=r2(s*(1+D/100),1); return {c,s,m,Dw:(m-c)/c*100,Dt:(m-s)/s*100}; },o=>o.Dw>0&&Math.abs(o.Dt-o.Dw)>=3);
      const ctx=`Un bras de robot doit tourner de ${o.c}°. Il atteint ${nf(o.m,1)}° au premier pic, puis se stabilise à ${nf(o.s,1)}°. Un élève calcule le dépassement : D = ${FRAC(`${nf(o.m,1)} − ${o.c}`,o.c)} × 100 = ${nf(o.Dw,1)} %.`;
      return [{ctx,q:"Que penses-tu du calcul de l'élève ?",type:"ch",...mc("Il est faux : le dépassement se rapporte à la valeur finale, pas à la consigne",["Il est juste : le dépassement se mesure toujours par rapport à la consigne","Il est faux : il fallait diviser par le premier pic","Il est juste, car l'erreur statique est faible"]),
          expl:`${F(DPC)} : on compare le premier pic à la valeur finale s∞ = ${nf(o.s,1)}°. Quand l'erreur statique n'est pas nulle, consigne et valeur finale diffèrent : le calcul de l'élève est faux.`},
        {ctx,q:"Calcule le dépassement relatif correct.",type:"num",ans:o.Dt,tolR:0.02,unit:"%",expl:`${F(DPC)} = ${FRAC(`${nf(o.m,1)} − ${nf(o.s,1)}`,nf(o.s,1))} × 100 = ${U(o.Dt,"%")}.`}]; }
    const o=draw(()=>{ const c=rnd([2,3,4,5,6]), e=rnd([0.1,0.12,0.15,0.2,0.25]), s=r2(c*(1-e),2); return {c,s,ew:(c-s)/s*100,et:(c-s)/c*100}; },o=>Math.abs(o.ew-o.et)>=1.5);
    const ctx=`Un drone reçoit une consigne d'altitude de ${o.c} m et se stabilise à ${nf(o.s,2)} m. Un élève calcule l'erreur statique relative : ${FRAC(`${o.c} − ${nf(o.s,2)}`,nf(o.s,2))} × 100 = ${nf(o.ew,1)} %.`;
    return [{ctx,q:"Que penses-tu du calcul de l'élève ?",type:"ch",...mc("Il est faux : l'erreur statique relative se rapporte à la consigne",["Il est juste : on divise toujours par la valeur mesurée","Il est faux : il fallait diviser par l'écart","Il est juste, car les deux calculs donnent le même résultat"]),
        expl:`${F(EPC)} : la référence est la consigne, la valeur demandée au système. En divisant par s∞, l'élève obtient ${nf(o.ew,1)} % au lieu de ${nf(o.et,1)} %.`},
      {ctx,q:"Calcule l'erreur statique relative correcte.",type:"num",ans:o.et,tolR:0.02,unit:"%",expl:`${F(EPC)} = ${FRAC(`|${o.c} − ${nf(o.s,2)}|`,o.c)} × 100 = ${U(o.et,"%")}.`}]; },
  /* relevé échantillonné : à partir de quel instant la sortie reste-t-elle dans la bande ? */
  ()=>{ const S=rnd([SR[0],SR[1],SR[2],SR[6]]);
    const o=draw(()=>{ const sf=rnd(S.c), t5=rnd(S.t5), dt=[0.01,0.02,0.025,0.05,0.1,0.2,0.25,0.5,1,2].filter(x=>x<=1.9*t5/15).pop(), m=mk2(sf,rnd([0.12,0.15,0.2,0.25]),t5*rnd([0.85,0.95,1.05,1.15])).f, d=S.d+(sf<5?1:0);
        const Y=[...Array(16).keys()].map(i=>r2(m(i*dt),d)), inb=Y.map(y=>Math.abs(y-sf)<=0.05*sf);
        let k=15; while(k>0&&inb[k-1]) k--;
        const near=Y.some(y=>Math.abs(Math.abs(y-sf)-0.05*sf)<0.004*sf), early=inb.slice(0,Math.max(0,k-1)).some(x=>x);
        return {sf,dt,Y,k,d,ok:inb[15]&&!near&&early&&k>=3&&k<=12}; },o=>o.ok);
    const T=i=>nf(i*o.dt,2), rows=[...Array(8).keys()].map(i=>[`${T(i)} ${S.tu}`,vu(S,o.Y[i],o.d),`${T(i+8)} ${S.tu}`,vu(S,o.Y[i+8],o.d)]);
    const data=tab(["Instant",S.y,"Instant",S.y],rows), lo=0.95*o.sf, hi=1.05*o.sf, j=o.Y.findIndex(y=>Math.abs(y-o.sf)<=0.05*o.sf);
    return {data,ctx:`Relevé ${deX(S.nm)}, un échantillon toutes les ${nf(o.dt,3)} ${S.tu}. La valeur finale vaut ${vu(S,o.sf)}.`,
      q:"À partir de quel instant du relevé la sortie reste-t-elle dans la bande ± 5 % ?",type:"num",ans:o.k*o.dt,tolA:0.3*o.dt,unit:S.tu,
      expl:`Bande : de 0,95 × ${nf(o.sf,S.d)} = ${vu(S,lo,o.d+1)} à 1,05 × ${nf(o.sf,S.d)} = ${vu(S,hi,o.d+1)}. La sortie y entre dès t = ${T(j)} ${S.tu}, mais en ressort ensuite ; le dernier échantillon hors de la bande est à t = ${T(o.k-1)} ${S.tu} (${vu(S,o.Y[o.k-1],o.d)}). À partir de ${F(`t = ${S3(o.k*o.dt)} ${S.tu}`)}, toutes les valeurs restent dans la bande : c'est le temps de réponse à 5 %, à une période d'échantillonnage près.`}; }
];

/* chariot de portique (position horizontale) */
const SPORT={nm:"l'asservissement de position du chariot d'un portique",g:"la position du chariot",y:"x",u:"m",d:2,tu:"s",t5:[3,4,5,6]};
const PF3=[
  /* trois réglages : dépassement, erreur statique, choix */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const c=rnd(S.c), Xe=rnd([3,5]), XD=rnd([15,20,25]), XT=rnd(S.t5);
        const P=[{e:rnd([8,10,12,15]),D:0,t5:XT*rnd([1.4,1.7,2])},{e:rnd([1,1.5,2]),D:XD*rnd([1.5,1.8,2.1]),t5:XT*rnd([0.5,0.6,0.7])},{e:0,D:XD*rnd([0.4,0.5,0.6]),t5:XT*rnd([0.6,0.7,0.8,1.3,1.5])}];
        P.forEach(p=>{ p.sf=r2(c*(1-p.e/100),S.d); p.sm=r2(p.sf*(1+p.D/100),S.d); p.t5=r2(p.t5,2); p.ee=(c-p.sf)/c*100; p.DD=(p.sm-p.sf)/p.sf*100; p.ok=p.ee<=Xe&&p.DD<=XD&&p.t5<=XT; });
        return {c,Xe,XD,XT,P}; },
      o=>o.P[0].ee>=1.4*o.Xe&&o.P[1].ee<=0.7*o.Xe&&o.P[1].DD>=1.3*o.XD&&o.P[2].DD<=0.75*o.XD&&o.P[2].DD>=5&&far(o.P[2].t5,o.XT,0.2)&&o.P[1].t5<=0.8*o.XT&&o.P[0].t5>=1.3*o.XT);
    const perm=shuffle([0,1,2]), N=k=>perm.indexOf(k)+1, P=o.P, win=P[2].ok?N(2)-1:3;
    const f=P.map(p=>p.D?mk2(p.sf,p.DD/100,p.t5).f:mk1(p.sf,p.t5).f), A=axR(Math.max(...P.map(p=>p.t5))*1.2,Math.max(o.c,P[1].sm)*1.06);
    const fig=figR(S,A,{c:perm.map((p,i)=>({f:f[p],lab:`réglage ${i+1}`,k:i,dash:[null,"8 4","2 3"][i]})),cons:o.c});
    const data=tab(["Réglage","Valeur finale","Premier pic","t5%"],perm.map((p,i)=>[String(i+1),vu(S,P[p].sf),P[p].D?vu(S,P[p].sm):"aucun",`${nf(P[p].t5,2)} ${S.tu}`]));
    const ctx=`Trois réglages du correcteur ${deX(S.nm)} sont simulés (consigne ${vu(S,o.c)}). Exigences : erreur statique au plus ${o.Xe} % de la consigne ; dépassement au plus ${o.XD} % ; temps de réponse à 5 % au plus ${nf(o.XT,2)} ${S.tu}.`;
    const cm=(a,b)=>a<=b?"≤":"&gt;", bil=p=>`réglage ${N(p)} : εs = ${nf(P[p].ee,1)} % ${cm(P[p].ee,o.Xe)} ${o.Xe} %, D = ${nf(P[p].DD,1)} % ${cm(P[p].DD,o.XD)} ${o.XD} %, t5% = ${nf(P[p].t5,2)} ${S.tu} ${cm(P[p].t5,o.XT)} ${nf(o.XT,2)} ${S.tu}`;
    return [{fig,data,ctx,q:`Calcule le dépassement relatif du réglage ${N(1)}.`,type:"num",ans:P[1].DD,tolR:0.02,unit:"%",
        expl:`${F(DPC)} = ${FRAC(`${nf(P[1].sm,S.d)} − ${nf(P[1].sf,S.d)}`,nf(P[1].sf,S.d))} × 100 = ${U(P[1].DD,"%")}, au-delà des ${o.XD} % autorisés.`},
      {fig,data,ctx,q:`Calcule l'erreur statique relative du réglage ${N(0)}.`,type:"num",ans:P[0].ee,tolR:0.02,unit:"%",
        expl:`${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(P[0].sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(P[0].ee,"%")}, au-delà des ${o.Xe} % autorisés.`},
      {fig,data,ctx,q:"Quel réglage faut-il retenir ?",type:"ch",ch:["Réglage 1","Réglage 2","Réglage 3","Aucun ne convient"],ok:win,
        expl:`Bilan, ${[0,1,2].sort((a,b)=>N(a)-N(b)).map(bil).join(" ; ")}. ${win<3?`Seul le ${F(`réglage ${win+1}`)} respecte les trois exigences.`:`${F("Aucun réglage")} ne respecte les trois exigences : il faut en chercher un autre.`}`}]; },
  /* bilan d'une réponse : précision, dépassement, conclusion */
  ()=>{ const S=rnd(SR), k=ri(0,3);
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0.04,0.05,0.06,0.08,0.1,0.12,0.15,0.2]), sf=r2(c*(1-e),6), t5=rnd(S.t5), A=axR(t5*rnd([1.8,2,2.4]),c*1.4,220), ks=[];
        for(let j=1;j*A.ym<=0.4*sf+1e-9;j++) if(j*A.ym>=0.06*sf-1e-9) ks.push(j); if(!ks.length) return null;
        const sm=r2(sf+rnd(ks)*A.ym,6), Xe=rnd([5,8,10,12,15]), XD=rnd([10,15,20,25,30]); return {c,sf,sm,t5,A,Xe,XD,es:(c-sf)/c*100,D:(sm-sf)/sf*100}; },
      o=>o&&onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax&&o.c-o.sf>=0.9*o.A.ym&&far(o.es,o.Xe,0.2)&&far(o.D,o.XD,0.2)&&(o.es<=o.Xe)===(k<=1)&&(o.D<=o.XD)===(k===0||k===2));
    const m=mk2(o.sf,o.D/100,o.t5), fig=figR(S,o.A,{...TALL,c:[{f:m.f}],cons:o.c,pts:[{t:m.tp,y:o.sm}]}), ctx=`Réponse ${deX(S.nm)} à un échelon de consigne ; le premier pic est repéré.`;
    return [{fig,ctx,q:"Commence par la précision : calcule l'erreur statique relative, en % de la consigne.",type:"num",ans:o.es,tolR:0.02,unit:"%",
        expl:`Consigne ${vu(S,o.c)}, valeur finale ${vu(S,o.sf)} : ${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(o.es,"%")}.`},
      {fig,ctx,q:"Détermine le dépassement relatif du premier pic, en %.",type:"num",ans:o.D,tolR:0.02,unit:"%",
        expl:`Premier pic ${vu(S,o.sm)}, valeur finale ${vu(S,o.sf)} : ${F(DPC)} = ${FRAC(`${nf(o.sm,S.d)} − ${nf(o.sf,S.d)}`,nf(o.sf,S.d))} × 100 = ${U(o.D,"%")}. La référence est la valeur finale, pas la consigne.`},
      {fig,ctx:`Exigences : erreur statique au plus ${o.Xe} % de la consigne ; dépassement au plus ${o.XD} %.`,q:"Que conclure ?",type:"ch",
        ch:["Les deux exigences sont satisfaites","Seule l'exigence de précision est satisfaite","Seule l'exigence de dépassement est satisfaite","Aucune des deux n'est satisfaite"],ok:k,
        expl:`Précision : ${nf(o.es,1)} % ${o.es<=o.Xe?"≤":"&gt;"} ${o.Xe} %. Dépassement : ${nf(o.D,1)} % ${o.D<=o.XD?"≤":"&gt;"} ${o.XD} %. ${F(["Les deux exigences sont satisfaites","Seule la précision est satisfaite","Seul le dépassement est satisfait","Aucune n'est satisfaite"][k])}.`}]; },
  /* dépassement admissible imposé par un obstacle */
  ()=>{ const want=Math.random()<0.5, v=ri(0,1), S=v?SPORT:SR[2];
    const o=draw(()=>{ const c=v?rnd([4,5,6,8]):rnd([3,4,5,6]), H=r2(c*rnd([1.2,1.3,1.4,1.5]),1), ht=v?rnd([0.3,0.4,0.5]):rnd([0.15,0.2,0.25]), mg=rnd([0.2,0.3,0.5]), zm=r2(H-ht-mg,2), t5=rnd(S.t5), A=axR(t5*rnd([2,2.4]),H*1.02,220), ks=[];
        for(let j=1;j*A.ym<=0.45*c+1e-9;j++){ const sm=c+j*A.ym, g=Math.abs(sm-zm); if(j*A.ym>=0.05*c-1e-9&&g>=1.4*A.ym&&g>=0.2*(zm-c)&&(sm<=zm)===want) ks.push(j); }
        return {c,H,ht,mg,zm,t5,A,ks,Dm:(zm-c)/c*100}; },
      o=>o.ks.length&&o.Dm>=6&&o.Dm<=40&&onGrid(o.c,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax&&o.H<=o.A.ymax);
    const sm=r2(o.c+rnd(o.ks)*o.A.ym,6), m=mk2(o.c,(sm-o.c)/o.c,o.t5);
    const fig=figR(S,o.A,{...TALL,c:[{f:m.f}],cons:o.c,consX:0.02*o.A.tmax,hl:[{y:o.H,lab:v?"mur":"toit du hangar",dy:-6}]});
    const ctx=v?`Le chariot d'un portique doit amener une charge à x = ${nf(o.c,2)} m (consigne, erreur statique nulle). Un mur se trouve à x = ${nf(o.H,1)} m ; le bord de la charge dépasse de ${nf(o.ht,2)} m devant le point mesuré, et il doit toujours rester à au moins ${nf(o.mg,2)} m du mur.`
      :`Un drone d'inspection doit se stabiliser à z = ${nf(o.c,2)} m (consigne, erreur statique nulle) sous le toit d'un hangar situé à ${nf(o.H,1)} m. Ses hélices sont ${nf(o.ht,2)} m au-dessus du point dont on mesure l'altitude, et elles doivent toujours rester à au moins ${nf(o.mg,2)} m du toit.`;
    const lim=v?"position maximale":"altitude maximale";
    return [{fig,ctx,q:`Calcule l'${lim} admissible du point mesuré.`,type:"num",ans:o.zm,tolR:0.02,unit:"m",
        expl:`${F(`${v?"x":"z"} max = ${nf(o.H,1)} − ${nf(o.ht,2)} − ${nf(o.mg,2)}`)} = ${U(o.zm,"m")} (obstacle, moins le débord, moins la marge de sécurité).`},
      {fig,ctx,q:"Déduis-en le dépassement relatif maximal admissible, en %.",type:"num",ans:o.Dm,tolR:0.02,unit:"%",
        expl:`L'erreur statique est nulle : s∞ = ${nf(o.c,2)} m. ${F(`D max = ${FRAC(`${nf(o.zm,2)} − ${nf(o.c,2)}`,nf(o.c,2))} × 100`)} = ${U(o.Dm,"%")}.`},
      {fig,ctx:`${lim.charAt(0).toUpperCase()+lim.slice(1)} admissible : ${nf(o.zm,2)} m. La figure montre la réponse du réglage essayé.`,q:"Ce réglage respecte-t-il la marge de sécurité ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`On lit le premier pic : ${nf(sm,2)} m, ${want?"inférieur":"supérieur"} à ${nf(o.zm,2)} m (D ≈ ${nf((sm-o.c)/o.c*100,1)} % ${want?"≤":"&gt;"} ${nf(o.Dm,1)} %). ${want?"La marge de sécurité est respectée.":"La marge n'est pas respectée : il faut un réglage plus amorti, même s'il est plus lent."} Ce n'est pas ${v?"la position du mur":"la hauteur du toit"} qu'il faut comparer au pic, mais la limite calculée.`}]; },
  /* écart maximal pendant une perturbation, avec action intégrale */
  ()=>{ const C=rnd([{S:SR[0],ev:"on dépose un lot de colis sur le tapis"},{S:SR[1],ev:"le robot aborde une rampe"},{S:SR[2],ev:"une rafale de vent rabat le drone vers le bas"}]), S=C.S, want=Math.random()<0.5;
    const o=draw(()=>{ const c=rnd(S.c), t5=rnd(S.t5), A=axR(t5*rnd([3.2,3.6,4]),c*1.25,220), X=rnd([5,8,10,15]), ks=[];
        for(let j=1;j*A.ym<=0.35*c+1e-9;j++){ const dp=j*A.ym/c*100; if(dp>=3&&far(dp,X,0.25)&&(dp<=X)===want) ks.push(j); } return {c,t5,A,X,ks}; },
      o=>o.ks.length&&onGrid(o.c,o.A.ym)&&onGrid(o.t5,o.A.xm)&&1.8*o.t5<=0.45*o.A.tmax);
    const dm=rnd(o.ks)*o.A.ym, smin=r2(o.c-dm,6), dp=dm/o.c*100, t1=Math.ceil(0.4*o.A.tmax/o.A.xs-1e-9)*o.A.xs, f1=mk2(o.c,0.1,o.t5).f;
    const a=o.t5/2, b=o.t5/8, us=ln(a/b)*a*b/(a-b), gs=Math.exp(-us/a)-Math.exp(-us/b), f=t=>f1(t)-(t<t1?0:dm*(Math.exp(-(t-t1)/a)-Math.exp(-(t-t1)/b))/gs);
    const fig=figR(S,o.A,{...TALL,c:[{f}],cons:o.c,vl:[{t:t1,lab:"perturbation",y:o.A.ymax}],pts:[{t:t1+us,y:smin}]}), ctx=`Réponse ${deX(S.nm)}, dont le correcteur a une action intégrale. À t = ${nf(t1,2)} ${S.tu}, ${C.ev}.`;
    return [{fig,ctx,q:"Lis la valeur minimale atteinte par la sortie pendant la perturbation (point repéré).",type:"num",ans:smin,tolA:0.35*o.A.ym,unit:S.u,
        expl:`Le creux de la courbe se lit à ${F(`s min = ${S3(smin)}${sfx(S.u)}`)}. Ensuite, la sortie revient à la consigne : l'action intégrale annule l'erreur statique.`},
      {fig,ctx:`Consigne ${vu(S,o.c)} ; valeur minimale ${vu(S,smin)}.`,q:"Calcule l'écart maximal entre la sortie et la consigne, en % de la consigne.",type:"num",ans:dp,tolR:0.02,unit:"%",
        expl:`${F(`écart = ${FRAC("|consigne − s min|","consigne")} × 100`)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(smin,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(dp,"%")}.`},
      {fig,ctx:`Exigence : pendant la perturbation, la sortie doit rester à ± ${o.X} % de la consigne.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(dp,1)} % ${want?"≤":"&gt;"} ${o.X} % : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite, même si l'erreur statique finale est nulle : c'est l'écart pendant le régime transitoire qui est limité ici."}`}]; },
  /* erreur d'élève : première entrée dans la bande */
  ()=>{ const S=rnd(SR);
    const o=draw(()=>{ const sf=rnd(S.c), D=rnd([0.12,0.15]), t5=rnd(S.t5), A=axR(t5*rnd([1.6,1.8,2]),sf*(1+D)*1.1,220); if(!onGrid(t5,A.xm)) return null;
        const t1=tIn(mk2(sf,D,t5).f,sf,A.tmax), Xs=[]; for(let j=1;j*A.xm<t5;j++){ const x=r2(j*A.xm,6); if(x>=1.15*t1&&x<=0.85*t5&&onGrid(x,A.xs/2)) Xs.push(x); } return {sf,D,t5,A,t1,Xs}; },
      o=>o&&o.Xs.length&&o.t5<=0.7*o.A.tmax&&o.t5>=0.4*o.A.tmax);
    const X=rnd(o.Xs), m=mk2(o.sf,o.D,o.t5), rd=nf(Math.round(o.t1/o.A.xm)*o.A.xm,3), fig=figR(S,o.A,{...TALL,c:[{f:m.f}],band:o.sf,bandTxt:"bande ± 5 %"});
    const ctx=`Réponse indicielle ${deX(S.nm)}, bande ± 5 % tracée. Exigence : temps de réponse à 5 % au plus ${nf(X,2)} ${S.tu}. Un élève lit t5% ≈ ${rd} ${S.tu}, instant où la sortie entre dans la bande, et conclut que l'exigence est satisfaite.`;
    return [{fig,ctx,q:"Que penses-tu de la lecture de l'élève ?",type:"ch",...mc("Elle est fausse : la sortie ressort de la bande au premier pic ; t5% est l'instant à partir duquel elle y reste",["Elle est juste : t5% est l'instant où la sortie entre dans la bande","Elle est fausse : t5% est l'instant du premier pic","Elle est fausse : t5% se lit quand la sortie atteint la consigne pour la première fois"]),
        expl:`La sortie entre dans la bande à t ≈ ${rd} ${S.tu}, puis en ressort au premier pic (${nf(o.D*100,0)} % de dépassement) : ce n'est pas encore le temps de réponse. On retient l'instant à partir duquel elle ${F("reste dans la bande")}.`},
      {fig,ctx,q:"Lis le temps de réponse à 5 % correct.",type:"num",ans:o.t5,tolA:0.5*o.A.xm,unit:S.tu,
        expl:`Après le premier pic, la sortie rentre dans la bande et n'en ressort plus : ${F(`t5% ≈ ${S3(o.t5)} ${S.tu}`)}.`},
      {fig,ctx:`Exigence : temps de réponse à 5 % au plus ${nf(X,2)} ${S.tu}.`,q:"L'exigence est-elle satisfaite ?",type:"ch",ch:YN,ok:1,
        expl:`${nf(o.t5,2)} ${S.tu} &gt; ${nf(X,2)} ${S.tu} : l'exigence ${F("n'est pas satisfaite")}. La lecture de l'élève conduisait à la conclusion inverse.`}]; },
  /* réponse instable : pas de valeur finale ; que faire ? */
  ()=>{ const S=rnd(SR), c=rnd(S.c), t5=rnd(S.t5), A=axR(t5*2.5,2.02*c), w=2*Math.PI*rnd([4,5])/A.tmax, fig=figR(S,A,{c:[{f:oscF(c,A.tmax/15,w,1,A.tmax)}],cons:c});
    const ctx=`Réponse ${deX(S.nm)} pour un nouveau réglage du correcteur. Un élève relève la sortie à la fin de l'enregistrement, la compare à la consigne et en déduit une erreur statique.`;
    return [{fig,ctx,q:"Que penses-tu de sa démarche ?",type:"ch",...mc("Elle n'a pas de sens : la sortie ne converge pas, le système est instable et n'a pas de valeur finale",["Elle est juste : l'erreur statique se lit à la fin de l'enregistrement","Elle est juste, à condition de prendre la moyenne des oscillations","Elle est fausse : il fallait mesurer l'écart au premier pic"]),
        expl:`L'amplitude des oscillations augmente : la sortie ${F("ne converge pas")}. Sans valeur finale, on ne peut définir ni erreur statique, ni temps de réponse, ni dépassement relatif.`},
      {fig,ctx,q:"Que faut-il faire avant d'évaluer la précision et la rapidité ?",type:"ch",...mc("Modifier le réglage du correcteur (par exemple diminuer son gain) pour rendre le système stable",["Allonger l'enregistrement jusqu'à ce que la sortie se stabilise","Augmenter la consigne pour réduire l'erreur relative","Mesurer le temps de réponse sur la première oscillation"]),
        expl:`La ${F("stabilité")} passe avant tout : un système instable ne se stabilisera pas, même en attendant plus longtemps. On change le réglage (un gain trop grand est la cause habituelle), puis on vérifie de nouveau précision, rapidité et dépassement.`}]; },
  /* cadence d'un bras de tri : temps de réponse et durée de cycle */
  ()=>{ const want=Math.random()<0.5;
    const o=draw(()=>{ const tau=rnd([0.1,0.15,0.2,0.25,0.3]), tp=rnd([0.3,0.4,0.5,0.6]), td=rnd([0.2,0.3,0.4]), N=rnd([20,25,30,35,40,50]); const t5=3*tau, cyc=2*t5+tp+td; return {tau,tp,td,N,t5,cyc,cad:60/cyc}; },o=>(o.cad>=o.N)===want&&far(o.cad,o.N,0.1));
    const ctx=`Pour chaque colis, un bras de tri fait un aller vers le colis, une prise (${nf(o.tp,1)} s), un retour vers le bac, puis une dépose (${nf(o.td,1)} s). Chaque déplacement est asservi en position : la boucle se comporte comme un premier ordre de constante de temps τ = ${nf(o.tau,2)} s, et un déplacement est terminé au temps de réponse à 5 %.`;
    return [{ctx,q:"Calcule la durée d'un déplacement.",type:"num",ans:o.t5,tolR:0.02,unit:"s",expl:`${F("t5% ≈ 3τ")} = 3 × ${nf(o.tau,2)} = ${U(o.t5,"s")}.`},
      {ctx,q:"Calcule la durée d'un cycle complet (un colis).",type:"num",ans:o.cyc,tolR:0.02,unit:"s",expl:`Deux déplacements, une prise et une dépose : ${F("T = 2·t5% + t prise + t dépose")} = 2 × ${nf(o.t5,2)} + ${nf(o.tp,1)} + ${nf(o.td,1)} = ${U(o.cyc,"s")}.`},
      {ctx:`Durée d'un cycle : ${nf(o.cyc,2)} s. Exigence : trier au moins ${o.N} colis par minute.`,q:"L'exigence de cadence est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${F(`cadence = ${FRAC("60 s","T")}`)} = ${FRAC("60",nf(o.cyc,2))} = ${nf(o.cad,1)} colis/min ${want?"≥":"&lt;"} ${o.N} : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite ; il faudrait une boucle plus rapide (τ plus petit)."}`}]; },
  /* premier ordre avec erreur statique : τ à 63 % de la valeur finale */
  ()=>{ const S=rnd(SR), want=Math.random()<0.5;
    const o=draw(()=>{ const c=rnd(S.c), e=rnd([0.1,0.12,0.15,0.2,0.25]), sf=r2(c*(1-e),6), t5=rnd(S.t5), A=axR(t5*rnd([1.8,2,2.2]),c*1.1,220), tau=r2(Math.round(t5/3/A.xm)*A.xm,6), XT=+(3*tau*rnd([0.7,0.8,1.25,1.4])).toPrecision(2);
        return {c,sf,t5,A,tau,XT,es:(c-sf)/c*100}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&o.c-o.sf>=0.9*o.A.ym&&o.tau>=2*o.A.xm&&Math.abs(3*o.tau-o.t5)/o.t5<0.2&&3*o.tau<=0.75*o.A.tmax&&(3*o.tau<=o.XT)===want&&far(3*o.tau,o.XT,0.15));
    const fig=figR(S,o.A,{...TALL,c:[{f:ord1(o.sf,o.tau)}],cons:o.c}), ctx=`Réponse ${deX(S.nm)} à un échelon de consigne ; elle a l'allure d'un premier ordre.`, s63=0.63*o.sf, tw=-o.tau*ln(1-0.63*o.c/o.sf);
    return [{fig,ctx,q:"Lis la consigne et la valeur finale, puis calcule l'erreur statique relative.",type:"num",ans:o.es,tolR:0.02,unit:"%",
        expl:`Consigne ${vu(S,o.c)}, valeur finale ${vu(S,o.sf)} : ${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(o.es,"%")}.`},
      {fig,ctx,q:"Détermine la constante de temps τ.",type:"num",ans:o.tau,tolA:0.5*o.A.xm,unit:S.tu,
        expl:`τ se lit à ${F("63 % de la valeur finale")} : 0,63 × ${nf(o.sf,S.d)} = ${vu(S,s63,S.d+1)}, atteint à ${F(`τ ≈ ${S3(o.tau)} ${S.tu}`)}. Prendre 63 % de la consigne (${vu(S,0.63*o.c,S.d+1)}) donnerait à tort ${nf(tw,2)} ${S.tu}.`},
      {fig,ctx:`Exigence : temps de réponse à 5 % au plus ${nf(o.XT,2)} ${S.tu}.`,q:"L'exigence de rapidité est-elle satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${F("t5% ≈ 3τ")} = 3 × ${nf(o.tau,3)} = ${nf(3*o.tau,2)} ${S.tu} ${want?"≤":"&gt;"} ${nf(o.XT,2)} ${S.tu} : ${want?"l'exigence est satisfaite.":"l'exigence n'est pas satisfaite."}`}]; },
  /* écart entre simulation et essai : hypothèse du modèle */
  ()=>{ const v=ri(0,1), o=draw(()=>{ const ts=rnd([0.4,0.5,0.6,0.8,1]), tm=r2(ts*rnd([1.2,1.3,1.4,1.5]),2); return {ts,tm,ec:Math.abs(ts-tm)/tm*100}; },o=>o.ec>5);
    const obs=v?"On constate que la charge réellement transportée est bien plus lourde que celle retenue dans le modèle.":"Pendant le démarrage, la tension appliquée au moteur reste bloquée à la tension de la batterie, alors que le correcteur demande davantage.";
    const ctx=`Asservissement de vitesse d'un tapis roulant. La simulation (modèle linéaire) donne un temps de réponse à 5 % de ${nf(o.ts,2)} s ; l'essai sur le système réel donne ${nf(o.tm,2)} s. ${obs}`;
    const ok=v?"Le modèle sous-estime l'inertie de la charge entraînée : le système réel accélère moins vite":"Le modèle ne tient pas compte de la saturation de la commande, limitée par la tension de la batterie";
    return [{ctx,q:"Calcule l'écart relatif entre simulation et essai, en prenant l'essai comme référence.",type:"num",ans:o.ec,tolR:0.02,unit:"%",
        expl:`${F(`écart = ${FRAC("|simulé − mesuré|","mesuré")} × 100`)} = ${FRAC(`|${nf(o.ts,2)} − ${nf(o.tm,2)}|`,nf(o.tm,2))} × 100 = ${U(o.ec,"%")}.`},
      {ctx,q:"Quelle hypothèse du modèle explique cet écart ?",type:"ch",...mc(ok,["Le modèle néglige l'erreur statique du système","La consigne de l'essai était plus faible que celle de la simulation","Le capteur de vitesse du système réel est trop précis"]),
        expl:`${v?`Avec une charge plus lourde, le même couple moteur donne une accélération plus faible : le système réel est plus lent. Il faut ${F("recaler la masse")} dans le modèle.`:`Quand la commande sature, l'actionneur reçoit moins que ce que prévoit le modèle linéaire : le système réel est plus lent. Il faut ${F("ajouter la saturation")} au modèle.`} Une consigne plus faible ne ralentirait pas un système linéaire, et l'erreur statique ne concerne pas la rapidité.`}]; },
  /* linéarité : erreur statique relative constante, consigne maximale */
  ()=>{ const C=rnd([{s:"la vitesse d'un tapis roulant",u:"m/s",c1:[1,1.2],d:3,c2:[1.5,1.8],E:[0.02,0.03,0.05]},{s:"la vitesse d'un moteur",u:"rad/s",c1:[100,150],d:1,c2:[200,250],E:[2,3,5]},{s:"l'élévation de température d'une étuve",u:"°C",c1:[20,25],d:2,c2:[40,50],E:[0.5,0.8,1]},{s:"le niveau d'une citerne",u:"m",c1:[1,1.2],d:3,c2:[1.5,2],E:[0.02,0.03,0.05]}]);
    const o=draw(()=>{ const c1=rnd(C.c1), p=rnd([2,2.5,3,4,5]), s1=r2(c1*(1-p/100),C.d), es=(c1-s1)/c1*100, c2=rnd(C.c2), E=rnd(C.E), cm=E/(es/100); return {c1,s1,es,c2,E,cm,e2:c2*es/100}; },o=>o.cm>0.3*o.c1&&o.cm<o.c2&&far(o.cm,o.c2,0.15));
    const ctx=`Asservissement ${deX(C.s)} avec un correcteur proportionnel, modélisé par des gains constants (système linéaire). Pour une consigne de ${nf(o.c1,2)} ${C.u}, la sortie se stabilise à ${nf(o.s1,C.d)} ${C.u}.`;
    return [{ctx,q:"Calcule l'erreur statique relative.",type:"num",ans:o.es,tolR:0.02,unit:"%",expl:`${F(EPC)} = ${FRAC(`|${nf(o.c1,2)} − ${nf(o.s1,C.d)}|`,nf(o.c1,2))} × 100 = ${U(o.es,"%")}.`},
      {ctx:`Erreur statique relative : ${nf(o.es,2)} %, la même pour toute consigne (système linéaire).`,q:`Calcule l'erreur statique, en ${C.u}, pour une consigne de ${nf(o.c2,2)} ${C.u}.`,type:"num",ans:o.e2,tolR:0.02,unit:C.u,
        expl:`La sortie est proportionnelle à la consigne, donc l'erreur aussi : ${F(`εs = ${FRAC(nf(o.es,2),"100")} × consigne`)} = ${FRAC(nf(o.es,2),"100")} × ${nf(o.c2,2)} = ${U(o.e2,C.u)}.`},
      {ctx:`Exigence : erreur statique au plus ${nf(o.E,2)} ${C.u}, sur toute la plage de consignes jusqu'à ${nf(o.c2,2)} ${C.u}.`,q:"Jusqu'à quelle consigne l'exigence est-elle respectée ?",type:"num",ans:o.cm,tolR:0.02,unit:C.u,
        expl:`Il faut ${FRAC(nf(o.es,2),"100")} × consigne ≤ ${nf(o.E,2)}, soit ${F(`consigne ≤ ${FRAC(nf(o.E,2),nf(o.es/100,4))}`)} = ${U(o.cm,C.u)}. C'est moins que ${nf(o.c2,2)} ${C.u} : l'exigence n'est pas respectée sur toute la plage ; il faut réduire l'erreur relative (gain plus grand ou action intégrale).`}]; },
  /* butée : dépassement lu, consigne maximale */
  ()=>{ const S=SR[6], want=Math.random()<0.5;
    const o=draw(()=>{ const c=rnd([50,80,100]), t5=rnd(S.t5), A=axR(t5*rnd([1.8,2,2.4]),c*1.5), ks=[]; for(let j=1;j*A.ym<=0.4*c+1e-9;j++) if(j*A.ym>=0.1*c-1e-9) ks.push(j); return {c,t5,A,ks}; },
      o=>o.ks.length&&onGrid(o.c,o.A.ym)&&onGrid(o.t5,o.A.xm)&&o.t5<=0.6*o.A.tmax);
    const sm=r2(o.c+rnd(o.ks)*o.A.ym,6), D=(sm-o.c)/o.c*100, m=mk2(o.c,D/100,o.t5), fig=figR(S,o.A,{c:[{f:m.f}],cons:o.c,pts:[{t:m.tp,y:sm}]});
    const Xb=rnd([200,240,250,300]), cmax=Xb/(1+D/100), c2=draw(()=>5*Math.round(cmax*(want?rnd([0.8,0.85,0.9]):rnd([1.07,1.1,1.15]))/5),x=>x<=Xb-5&&(x<=cmax)===want&&far(x,cmax,0.05));
    return [{fig,ctx:`Essai de l'asservissement de position d'un vérin électrique : réponse à un échelon de consigne de ${o.c} mm (erreur statique nulle).`,q:"Détermine le dépassement relatif du premier pic, en %.",type:"num",ans:D,tolR:0.02,unit:"%",
        expl:`On lit s max = ${nf(sm,1)} mm et s∞ = ${o.c} mm : ${F(DPC)} = ${FRAC(`${nf(sm,1)} − ${o.c}`,o.c)} × 100 = ${U(D,"%")}.`},
      {fig,ctx:`D = ${nf(D,1)} %. Le système est linéaire : le dépassement relatif ne dépend pas de la consigne. Une butée mécanique arrête la tige à ${Xb} mm.`,q:"Quelle consigne maximale peut-on donner sans que la tige touche la butée au premier pic ?",type:"num",ans:cmax,tolR:0.02,unit:"mm",
        expl:`Il faut s max = c·(1 + ${FRAC("D","100")}) ≤ ${Xb} mm, donc ${F(`c ≤ ${FRAC(Xb,nf(1+D/100,3))}`)} = ${U(cmax,"mm")}.`},
      {fig,ctx:`Consigne maximale : ${nf(cmax,1)} mm. On veut commander la tige à ${c2} mm.`,q:"La tige touchera-t-elle la butée ?",type:"ch",ch:["Oui","Non"],ok:want?1:0,
        expl:`${c2} mm ${want?"≤":"&gt;"} ${nf(cmax,1)} mm : le premier pic ${want?"atteint":"atteindrait"} ${nf(c2*(1+D/100),1)} mm, ${want?"sous":"au-delà de"} la butée (${Xb} mm). ${want?"La tige ne touche pas la butée.":"La tige touche la butée."}`}]; },
  /* compromis rapidité et dépassement après une modification */
  ()=>{ const k=ri(0,3);
    const o=draw(()=>{ const T1=rnd([1.2,1.5,1.8,2,2.4]), T2=r2(T1*rnd([0.45,0.55,0.65]),2), D1=rnd([0,4,6,8]), D2=rnd([12,15,18,20,25,30,35]), XT=rnd([0.8,1,1.2,1.5]), XD=rnd([10,15,20,25]);
        return {T1,T2,D1,D2,XT,XD,g:(T1-T2)/T1*100}; },
      o=>o.T1>1.25*o.XT&&o.D1<=0.7*o.XD&&far(o.T2,o.XT,0.2)&&far(o.D2,o.XD,0.2)&&(o.T2<=o.XT)===(k<=1)&&(o.D2<=o.XD)===(k===0||k===2));
    const ctx=`Asservissement de vitesse d'un tapis roulant. Avant modification : t5% = ${nf(o.T1,2)} s et dépassement ${o.D1} %. Pour le rendre plus rapide, on augmente le gain du correcteur : t5% = ${nf(o.T2,2)} s et dépassement ${o.D2} %.`;
    return [{ctx,q:"De quel pourcentage le temps de réponse a-t-il diminué (référence : avant modification) ?",type:"num",ans:o.g,tolR:0.02,unit:"%",
        expl:`${F(`${FRAC("t avant − t après","t avant")} × 100`)} = ${FRAC(`${nf(o.T1,2)} − ${nf(o.T2,2)}`,nf(o.T1,2))} × 100 = ${U(o.g,"%")}.`},
      {ctx:`${ctx} Exigences : t5% au plus ${nf(o.XT,2)} s ; dépassement au plus ${o.XD} %.`,q:"Après modification, quelles exigences sont satisfaites ?",type:"ch",
        ch:["Rapidité et dépassement","Rapidité seulement","Dépassement seulement","Aucune des deux"],ok:k,
        expl:`Rapidité : ${nf(o.T2,2)} s ${o.T2<=o.XT?"≤":"&gt;"} ${nf(o.XT,2)} s. Dépassement : ${o.D2} % ${o.D2<=o.XD?"≤":"&gt;"} ${o.XD} %. ${F(["Les deux sont satisfaites","Rapidité seulement","Dépassement seulement","Aucune des deux"][k])}. ${o.D2>o.XD?"Gagner en rapidité a dégradé l'amortissement : c'est le compromis classique entre rapidité et stabilité.":"Le gain en rapidité s'est fait avec un dépassement encore acceptable."}`}]; }
];

POOLS["auto-performances"]={
  titre:"Précision, rapidité, stabilité",
  fiche:{t:"Performances d'un système asservi",l:[
    `Précision : erreur statique ${F("εs = consigne − s∞")} ; en % de la consigne : ${F(EPC)}.`,
    `Rapidité : ${F("temps de réponse à 5 %")}, instant à partir duquel la sortie reste dans la bande ${F("[0,95·s∞ ; 1,05·s∞]")} ; premier ordre : ${F("t5% ≈ 3τ")}.`,
    `Dépassement relatif du premier pic : ${F(DPC)} ; il mesure l'amortissement.`,
    `Stabilité : pour une consigne constante, la sortie ${F("converge vers une valeur finale")} ; des oscillations ${F("amorties")} n'empêchent pas la stabilité.`,
    `Pièges : t5% n'est pas ${F("la première entrée dans la bande")} ; D se rapporte à ${F("s∞")}, εs à ${F("la consigne")} ; système instable : ni εs, ni t5%.`]},
  count:{1:4,2:4,3:3},1:PF1,2:PF2,3:PF3};

/* ======================================================================
   CORRECTEURS P, PI, PID — auto-correcteur
   ====================================================================== */
/* procédés du premier ordre : gain statique K (sortie par unité de commande), gains Kp usuels, constantes de temps */
const CS=[
  {nm:"l'asservissement de vitesse d'un moteur",g:"la vitesse du moteur",y:"ω",u:"rad/s",d:1,K:[10,12,15,20,25],Ku:"(rad/s)/V",Kp:[0.05,0.1,0.2,0.4,0.5],Kpu:"V/(rad/s)",c:[50,80,100,120,150,200],tau:[0.1,0.15,0.2,0.3,0.5],tu:"s",cu:"V"},
  {nm:"la régulation de température d'une étuve",g:"l'élévation de température",y:"Δθ",u:"°C",d:1,K:[0.4,0.5,0.6,0.8,1],Ku:"°C/%",Kp:[2,4,5,8,10],Kpu:"%/°C",c:[20,25,30,40,50],tau:[5,8,10,12,15],tu:"min",cu:"%",note:" Δθ est l'élévation de température au-dessus de l'air ambiant ; la commande est la puissance de chauffe, en %."},
  {nm:"l'asservissement de vitesse d'un tapis roulant",g:"la vitesse du tapis",y:"v",u:"m/s",d:2,K:[0.1,0.12,0.15,0.2],Ku:"(m/s)/V",Kp:[10,20,25,40,50],Kpu:"V/(m/s)",c:[0.5,0.8,1,1.2,1.5],tau:[0.2,0.3,0.4,0.5],tu:"s",cu:"V"},
  {nm:"la régulation de niveau d'une citerne",g:"le niveau d'eau",y:"h",u:"m",d:2,K:[0.2,0.25,0.3,0.4],Ku:"m/V",Kp:[5,8,10,15,20],Kpu:"V/m",c:[1,1.2,1.5,2],tau:[2,3,4,5],tu:"min",cu:"V"}];
const ctxP=(C,o)=>`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku}${o.tau?` et de constante de temps τ = ${nf(o.tau,2)} ${C.tu}`:""} ; correcteur proportionnel Kp = ${nf(o.Kp,3)} ${C.Kpu} ; retour unitaire.${C.note||""}`;
const KBO="K·Kp", KBF="K<sub>BF</sub>", TBF="τ<sub>BF</sub>";
/* nombre négatif avec le vrai signe moins */
const nm=(x,d)=>nf(x,d).replace(/^-/,"−");
/* affichage Python d'un résultat numérique */
const pyv=(x,fl)=>fl||!Number.isInteger(x)?(Number.isInteger(x)?x+".0":String(+x.toPrecision(12))):String(x);
/* 2e ordre en boucle fermée : procédé K / ((1 + τ1·p)(1 + τ2·p)) et correcteur P (a = K·Kp), consigne c */
function bfP2(a,t1,t2,c){ const sf=c*a/(1+a), wn=Math.sqrt((1+a)/(t1*t2)), z=(t1+t2)/(2*Math.sqrt(t1*t2*(1+a))); return {sf,z,wn,f:ord2(sf,z,wn)}; }

const CO1=[
  /* rôle et place du correcteur */
  ()=>{ const K=[
      ["Quel est le rôle du correcteur dans une boucle d'asservissement ?","Élaborer la commande à partir de l'écart entre la consigne et la mesure, pour obtenir les performances voulues",["Mesurer la grandeur de sortie","Fournir l'énergie nécessaire à l'actionneur","Convertir la consigne en tension"],`Le correcteur reçoit ${F("l'écart ε")} et calcule la commande envoyée au préactionneur. Son réglage fixe la précision, la rapidité et la stabilité de la boucle.`],
      ["Où le correcteur est-il placé dans une boucle d'asservissement ?","Juste après le comparateur, au début de la chaîne directe",["Dans la chaîne de retour, avant le comparateur","Après l'actionneur","À la place du capteur"],`Le correcteur traite ${F("l'écart")} fourni par le comparateur : il est au début de la chaîne directe, avant le préactionneur.`],
      ["Dans un système asservi piloté par un microcontrôleur, quel élément réalise le correcteur ?","Le programme du microcontrôleur, qui calcule la commande",["Le hacheur","Le moteur","Le capteur de vitesse"],`Le correcteur est un calcul : c'est ${F("le programme")} qui calcule la commande à partir de l'écart (fonction traiter de la chaîne d'information).`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* commande d'un correcteur proportionnel */
  ()=>{ const v=ri(0,2);
    if(v===0){ const Kp=rnd([2,2.5,4,5,8,10]), e=rnd([0.12,0.2,0.25,0.35,0.4,0.6]), u=Kp*e;
      return {ctx:`Correcteur proportionnel de gain Kp = ${nf(Kp,1)} (sans unité). L'écart en sortie du comparateur vaut ε = ${nf(e,2)} V.`,q:"Calcule la tension de commande Ucom élaborée par le correcteur.",type:"num",ans:u,tolR:0.02,unit:"V",
        expl:`${F("Ucom = Kp·ε")} = ${nf(Kp,1)} × ${nf(e,2)} = ${U(u,"V")}. La commande est proportionnelle à l'écart : elle diminue quand la sortie se rapproche de la consigne.`}; }
    if(v===1){ const Kp=rnd([4,5,6,8,10]), c=rnd([24,25,26,28]), m=r2(c-rnd([0.5,1,1.5,2,2.5,3]),1), u=Kp*(c-m);
      return {ctx:`Régulation de température d'une serre connectée : consigne ${c} °C, température mesurée ${nf(m,1)} °C. Le microcontrôleur calcule le rapport cyclique de la MLI du chauffage avec un correcteur proportionnel Kp = ${Kp} %/°C.`,q:"Calcule le rapport cyclique commandé.",type:"num",ans:u,tolR:0.02,unit:"%",
        expl:`Écart : ${F("ε = consigne − mesure")} = ${c} − ${nf(m,1)} = ${nf(c-m,1)} °C. ${F("u = Kp·ε")} = ${Kp} × ${nf(c-m,1)} = ${U(u,"%")}.`}; }
    const Kp=rnd([0.02,0.04,0.05,0.08,0.1]), c=rnd([100,120,150,200]), m=c-rnd([5,8,10,12,15,20]), u=Kp*(c-m);
    return {ctx:`Asservissement de vitesse d'un moteur : consigne ${c} rad/s, vitesse mesurée ${m} rad/s, correcteur proportionnel de gain Kp = ${nf(Kp,2)} V/(rad/s).`,q:"Calcule la tension de commande élaborée par le correcteur.",type:"num",ans:u,tolR:0.02,unit:"V",
      expl:`${F("ε = ωc − ω")} = ${c} − ${m} = ${c-m} rad/s, puis ${F("u = Kp·ε")} = ${nf(Kp,2)} × ${c-m} = ${U(u,"V")}.`}; },
  /* effets du gain Kp */
  ()=>{ const K=[
      ["On augmente le gain Kp d'un correcteur proportionnel. Que devient l'erreur statique ?","Elle diminue, sans s'annuler",["Elle augmente","Elle s'annule","Elle ne change pas"],`Pour un premier ordre à retour unitaire, ${F(`εs = ${FRAC("1","1 + K·Kp")}`)} : elle diminue quand Kp augmente, mais ne s'annule jamais avec un correcteur proportionnel seul.`],
      ["On augmente le gain Kp d'un correcteur proportionnel. Comment évolue la rapidité du système ?","Le système devient plus rapide",["Le système devient plus lent","La rapidité ne change pas","Le système ne répond plus"],`Pour le même écart, la commande est plus forte : la réponse s'accélère. Pour un premier ordre, ${F(`${TBF} = ${FRAC("τ","1 + K·Kp")}`)} diminue. Au-delà d'un certain gain apparaissent dépassement et oscillations.`],
      ["Quel est l'inconvénient d'un gain Kp trop grand ?","Un dépassement et des oscillations importants, jusqu'à l'instabilité",["Une erreur statique plus grande","Un système plus lent","Une commande toujours nulle"],`Augmenter Kp améliore la précision et la rapidité, mais ${F("dégrade la stabilité")} : dépassement, oscillations, puis instabilité. Le réglage est un compromis.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* actions intégrale et dérivée */
  ()=>{ const K=[
      ["Quelle action d'un correcteur annule l'erreur statique pour une consigne constante ?","L'action intégrale",["L'action proportionnelle","L'action dérivée","Aucune : une erreur statique subsiste toujours"],`Tant qu'il reste un écart, ${F("l'action intégrale")} fait évoluer la commande : en régime permanent, l'écart est donc nul.`],
      ["Quel est l'effet principal de l'action dérivée d'un correcteur PID ?","Elle améliore l'amortissement : moins de dépassement et d'oscillations",["Elle annule l'erreur statique","Elle augmente l'erreur statique","Elle supprime le besoin d'un capteur"],`L'action dérivée réagit à la vitesse de variation de la sortie : elle freine la sortie quand elle s'approche vite de la consigne, ce qui ${F("améliore l'amortissement")}.`],
      ["Tant que l'écart reste positif, que fait l'action intégrale d'un correcteur PI ?","Elle fait croître la commande, jusqu'à ce que l'écart s'annule",["Elle garde la commande constante","Elle fait décroître la commande","Elle n'agit que si l'écart varie"],`Le terme intégral est proportionnel à ${F("la somme des écarts")} : tant que l'écart est positif, cette somme augmente, et la commande avec elle.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* valeur finale en boucle fermée (premier ordre, correcteur P) */
  ()=>{ const C=rnd(CS), o=draw(()=>({K:rnd(C.K),Kp:rnd(C.Kp),c:rnd(C.c)}),o=>o.K*o.Kp>=1.5&&o.K*o.Kp<=20), a=o.K*o.Kp, kb=a/(1+a), sf=kb*o.c;
    return {ctx:ctxP(C,o),q:`Pour une consigne de ${vu(C,o.c)}, quelle valeur ${C.g} atteint-elle en régime permanent ?`,type:"num",ans:sf,tolR:0.02,unit:C.u,
      expl:`${KBO} = ${nf(o.K,3)} × ${nf(o.Kp,3)} = ${nf(a,3)} (sans unité). ${F(`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`)} = ${FRAC(nf(a,3),`1 + ${nf(a,3)}`)} = ${nf(kb,3)}, donc s∞ = ${nf(kb,3)} × ${nf(o.c,2)} = ${VU(C,sf)}. La sortie reste sous la consigne.`}; },
  /* erreur statique relative en boucle fermée */
  ()=>{ const C=rnd(CS), o=draw(()=>({K:rnd(C.K),Kp:rnd(C.Kp)}),o=>o.K*o.Kp>=1.5&&o.K*o.Kp<=40), a=o.K*o.Kp, es=100/(1+a);
    return {ctx:ctxP(C,o),q:"Calcule l'erreur statique relative, en % de la consigne.",type:"num",ans:es,tolR:0.02,unit:"%",
      expl:`${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} = ${FRAC("1",`1 + ${nf(o.K,3)} × ${nf(o.Kp,3)}`)} = ${FRAC("1",nf(1+a,3))} = ${nf(es/100,4)}, soit ${U(es,"%")} de la consigne. Elle ne s'annule pas avec un correcteur proportionnel.`}; },
  /* choisir la bonne relation de la boucle fermée */
  ()=>{ const V=rnd([[`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`,[`${TBF} = τ·(1 + ${KBO})`,`${TBF} = ${FRAC(`${KBO}·τ`,`1 + ${KBO}`)}`,`${TBF} = τ`],`la constante de temps ${TBF}`],
      [`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`,[`${KBF} = ${KBO}`,`${KBF} = ${FRAC("1",`1 + ${KBO}`)}`,`${KBF} = ${FRAC("K","1 + Kp")}`],`le gain statique ${KBF}`],
      [`εs = ${FRAC("1",`1 + ${KBO}`)}`,[`εs = ${FRAC(KBO,`1 + ${KBO}`)}`,`εs = ${FRAC("1",KBO)}`,"εs = 0"],"l'erreur statique relative εs"]]);
    return {ctx:`Un procédé du premier ordre ${F(`H(p) = ${FRAC("K","1 + τ·p")}`)} est commandé par un correcteur proportionnel Kp, avec un retour unitaire.`,q:`Quelle relation donne ${V[2]} de la boucle fermée ?`,type:"ch",...mc(V[0],V[1]),
      expl:`En boucle fermée, on retrouve un premier ordre : ${F(`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`)} et ${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)}. L'erreur statique relative vaut 1 − ${KBF} = ${FRAC("1",`1 + ${KBO}`)}. Plus ${KBO} est grand, plus la boucle est rapide et précise, sans que l'erreur s'annule.`}; },
  /* programme d'un correcteur proportionnel */
  ()=>{ const Kp=rnd([0.5,1.5,2,2.5,4]), c=rnd([80,100,120,150]), m=c-rnd([4,6,8,10,12,16]), u=Kp*(c-m);
    return {fig:code(`Kp = ${Kp}\nconsigne = ${c}\nmesure = ${m}\necart = consigne - mesure\ncommande = Kp * ecart\nprint(commande)`),q:"Qu'affiche ce programme de correcteur proportionnel ?",type:"num",ans:u,tolA:Number.isInteger(u)?0:0.001,unit:"",
      expl:`ecart = ${c} − ${m} = ${c-m}, puis commande = ${nf(Kp,1)} × ${c-m} = ${F(nf(u,2))} (Python affiche <code>${pyv(u,!Number.isInteger(Kp))}</code>). C'est la loi ${F("u = Kp·ε")}.`}; },
  /* programme : commande saturée */
  ()=>{ const o=draw(()=>({Kp:rnd([2,3,4,5]),c:rnd([60,80,100]),m:rnd([0,10,20,30,40,50,70,90]),um:rnd([100,120,150,255])}),o=>o.m<o.c&&o.Kp*(o.c-o.m)!==o.um);
    const raw=o.Kp*(o.c-o.m), out=Math.max(-o.um,Math.min(o.um,raw));
    return {fig:code(`Kp = ${o.Kp}\nconsigne = ${o.c}\nmesure = ${o.m}\ncommande = Kp * (consigne - mesure)\nif commande > ${o.um}:\n    commande = ${o.um}\nelif commande < -${o.um}:\n    commande = -${o.um}\nprint(commande)`),q:"Quelle commande ce programme affiche-t-il ?",type:"num",ans:out,tolA:0,unit:"",
      expl:`Kp·(consigne − mesure) = ${o.Kp} × (${o.c} − ${o.m}) = ${nm(raw,0)}. ${raw>o.um?`C'est plus que ${o.um} : la commande est ${F("saturée")} à ${o.um}.`:raw<-o.um?`C'est moins que −${o.um} : la commande est ${F("saturée")} à −${o.um}.`:`Cette valeur est comprise entre −${o.um} et ${o.um} : ${F("pas de saturation")}.`} Le programme affiche ${nm(out,0)}. La saturation traduit la limite de ce que peut fournir le préactionneur.`}; },
  /* reconnaître la réponse avec correcteur PI */
  ()=>{ const S=rnd([SR[0],SR[1],SR[5]]);
    const o=draw(()=>{ const c=rnd(S.c), a=rnd([3,4,9]), t5=rnd(S.t5), A=axR(t5*2.2,c*1.12); return {c,a,t5,A,sf:c*a/(1+a)}; },o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym));
    const tau=o.a*o.t5/3, fP=ord1(o.sf,tau/(1+o.a)), fI=ord1(o.c,tau/o.a), pi=ri(0,1), L2=["A","B"];
    const cur=[{f:pi?fP:fI,lab:"courbe A",k:0},{f:pi?fI:fP,lab:"courbe B",k:1,dash:"8 4"}];
    return {fig:figR(S,o.A,{c:cur,cons:o.c}),ctx:`Deux essais ${deX(S.nm)} : l'un avec un correcteur proportionnel, l'autre avec un correcteur PI (même gain Kp).`,q:"Quelle courbe correspond au correcteur PI ?",type:"ch",ch:["Courbe A","Courbe B"],ok:pi,
      expl:`La ${F(`courbe ${L2[pi]}`)} rejoint la consigne (${vu(S,o.c)}) : l'erreur statique est nulle grâce à l'action intégrale. La courbe ${L2[1-pi]} se stabilise à ${vu(S,o.sf)} : il reste une erreur statique, typique d'un correcteur proportionnel.`}; },
  /* choisir le type de correcteur */
  ()=>{ const K=[
      ["Exigence : erreur statique nulle pour une consigne constante. Le correcteur proportionnel actuel laisse une erreur de 4 %. Que faut-il faire ?","Ajouter une action intégrale (correcteur PI)",["Diminuer le gain Kp","Augmenter Kp : l'erreur finira par s'annuler","Supprimer la boucle de retour"],`Avec un correcteur P, ${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} ne s'annule jamais. ${F("L'action intégrale")} l'annule pour une consigne constante.`],
      ["Le réglage PI actuel donne une erreur statique nulle, mais un dépassement trop grand. Quelle action peut-on ajouter ?","Une action dérivée (correcteur PID)",["Une seconde action intégrale","Une augmentation du gain Kp","Un capteur moins précis"],`${F("L'action dérivée")} améliore l'amortissement : elle réduit le dépassement en gardant l'erreur statique nulle apportée par l'action intégrale.`],
      ["Un correcteur P laisse une erreur statique de 2 %, acceptable, mais le système est trop lent. Que faut-il essayer ?","Augmenter Kp, en vérifiant que le dépassement reste acceptable",["Diminuer Kp","Ajouter une action intégrale pour accélérer la réponse","Supprimer le capteur"],`${F("Augmenter Kp")} rend la boucle plus rapide (et réduit encore l'erreur statique), au prix d'un dépassement plus grand : il faut vérifier cette exigence.`]];
    const [q,ok,w,e]=rnd(K); return {q,type:"ch",...mc(ok,w),expl:e}; },
  /* correcteur PI : commande non nulle avec un écart nul */
  ()=>({ctx:`Correcteur PI : ${F("u = Kp·ε + Ki·Σε")}, où Σε est la somme (intégrale) des écarts passés.`,q:"En régime permanent, l'écart est nul. Pourquoi la commande n'est-elle pas nulle ?",type:"ch",
    ...mc("Le terme intégral garde la mémoire des écarts passés et maintient la commande",["Le terme proportionnel reste non nul","Le capteur ajoute une tension de décalage","La commande est toujours égale à la consigne"]),
    expl:`Quand ε = 0, le terme proportionnel Kp·ε est nul, mais ${F("Ki·Σε")} garde la valeur accumulée pendant le régime transitoire. C'est lui qui fournit la commande nécessaire pour maintenir la sortie à la consigne.`})
];

const CO2=[
  /* gain minimal pour une exigence de précision */
  ()=>{ const C=rnd(CS);
    const o=draw(()=>{ const K=rnd(C.K), X=rnd([8,10,12,15,20]), km=(100/X-1)/K, V=[0.55,0.8,1.25,1.8,2.6].map(f=>+(km*f).toPrecision(2)); const pick=shuffle(V).slice(0,4).sort((a,b)=>a-b); return {K,X,km,pick}; },
      o=>o.pick.some(v=>v>=o.km)&&o.pick.some(v=>v<o.km)&&o.pick.every(v=>far(v,o.km,0.08))&&new Set(o.pick).size===4);
    const best=o.pick.filter(v=>v>=o.km)[0], ctx=`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku}, correcteur proportionnel, retour unitaire. Exigence : erreur statique au plus ${o.X} % de la consigne.${C.note||""}`;
    return [{ctx,q:"Calcule le gain Kp minimal qui respecte l'exigence.",type:"num",ans:o.km,tolR:0.02,unit:C.Kpu,
        expl:`Il faut ${F(`${FRAC("100",`1 + ${KBO}`)} ≤ ${o.X}`)}, donc 1 + ${KBO} ≥ ${FRAC(100,o.X)} = ${nf(100/o.X,1)}, soit ${KBO} ≥ ${nf(100/o.X-1,1)}. ${F(`Kp ≥ ${FRAC(nf(100/o.X-1,1),"K")}`)} = ${FRAC(nf(100/o.X-1,1),nf(o.K,3))} = ${U(o.km,C.Kpu)}.`},
      {ctx,q:`On dispose des réglages Kp = ${o.pick.map(v=>nf(v,4)).join(" ; ")} ${C.Kpu}. On retient le plus petit gain qui respecte l'exigence, pour limiter le dépassement. Lequel ?`,type:"ch",ch:o.pick.map(v=>`Kp = ${nf(v,4)} ${C.Kpu}`),ok:o.pick.indexOf(best),
        expl:`Il faut Kp ≥ ${nf(o.km,3)} ${C.Kpu}. Le plus petit réglage qui convient est ${F(`Kp = ${nf(best,4)}`)} ${C.Kpu} ; un gain plus grand serait plus précis, mais avec plus de dépassement.`}]; },
  /* boucle fermée d'un premier ordre : valeur finale, constante de temps, temps de réponse */
  ()=>{ const C=rnd(CS), o=draw(()=>({K:rnd(C.K),Kp:rnd(C.Kp),tau:rnd(C.tau),c:rnd(C.c)}),o=>o.K*o.Kp>=1.5&&o.K*o.Kp<=9), a=o.K*o.Kp, sf=o.c*a/(1+a), tb=o.tau/(1+a);
    const ctx=`${ctxP(C,o)} Consigne : ${vu(C,o.c)}.`;
    return [{ctx,q:"Calcule la valeur finale de la sortie.",type:"num",ans:sf,tolR:0.02,unit:C.u,
        expl:`${F(`s∞ = ${FRAC(KBO,`1 + ${KBO}`)}·consigne`)} = ${FRAC(nf(a,3),`1 + ${nf(a,3)}`)} × ${nf(o.c,2)} = ${VU(C,sf)}.`},
      {ctx,q:"Calcule la constante de temps de la boucle fermée.",type:"num",ans:tb,tolR:0.02,unit:C.tu,
        expl:`${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)} = ${FRAC(nf(o.tau,2),`1 + ${nf(a,3)}`)} = ${U(tb,C.tu)}.`},
      {ctx,q:"Déduis-en le temps de réponse à 5 % de la boucle fermée.",type:"num",ans:3*tb,tolR:0.02,unit:C.tu,
        expl:`La boucle fermée est encore un premier ordre : ${F(`t5% ≈ 3·${TBF}`)} = 3 × ${nf(tb,4)} = ${U(3*tb,C.tu)}, contre 3τ = ${nf(3*o.tau,2)} ${C.tu} pour le procédé seul : la boucle est ${nf(1+a,3)} fois plus rapide.`}]; },
  /* programme d'un correcteur PI : somme des écarts */
  ()=>{ const o=draw(()=>({Kp:rnd([1,2,3]),Ki:rnd([1,2]),E:[rnd([6,8,10]),rnd([4,5]),rnd([2,3]),rnd([0.5,1,1.5])]}),o=>o.E[0]>o.E[1]&&o.E[1]>o.E[2]&&o.E[2]>o.E[3]);
    let s=0,u=0; o.E.forEach(e=>{ s+=e; u=o.Kp*e+o.Ki*s; }); const e3=o.E[3];
    return {fig:code(`Kp = ${o.Kp}\nKi = ${o.Ki}\nsomme = 0\nfor ecart in [${o.E.join(", ")}]:\n    somme = somme + ecart\n    commande = Kp * ecart + Ki * somme\nprint(commande)`),q:"Qu'affiche ce programme de correcteur PI ?",type:"num",ans:u,tolA:0.001,unit:"",
      expl:`La boucle cumule les écarts : au dernier passage, somme = ${o.E.map(x=>nf(x,1)).join(" + ")} = ${nf(s,1)} et ecart = ${nf(e3,1)}. ${F("commande = Kp·ecart + Ki·somme")} = ${o.Kp} × ${nf(e3,1)} + ${nf(o.Ki,1)} × ${nf(s,1)} = ${F(nf(u,2))}. L'écart est devenu petit, mais le terme intégral maintient une commande importante.`}; },
  /* compléter le programme d'un correcteur PI */
  ()=>{ const v=ri(0,2), B=["___","___","___"], L=["consigne - mesure","somme + ecart","Kp * ecart + Ki * somme"]; const src=`somme = 0\nwhile True:\n    mesure = lire_capteur()\n    ecart = ${v===0?B[0]:L[0]}\n    somme = ${v===1?B[1]:L[1]}\n    commande = ${v===2?B[2]:L[2]}\n    envoyer(commande)`;
    const W=[["mesure - consigne","consigne + mesure","Kp * consigne"],["ecart","somme * ecart","0"],["Kp * somme + Ki * ecart","Kp * ecart","Ki * ecart"]][v], cc=x=>`<code>${esc(x)}</code>`;
    const EX=[`L'écart est ${F("consigne − mesure")} : positif quand la sortie est trop faible, pour que la commande augmente. L'inverse ferait diverger la boucle.`,
      `La somme cumule les écarts à chaque passage : ${F("somme = somme + ecart")}. C'est l'intégrale discrète de l'écart.`,
      `Correcteur PI : ${F("u = Kp·ε + Ki·Σε")}, terme proportionnel à l'écart plus terme proportionnel à la somme des écarts.`][v];
    return {fig:code(src),ctx:"Boucle d'un correcteur PI programmé dans un microcontrôleur (consigne, Kp et Ki sont définis plus haut).",q:"Par quoi faut-il compléter le trou ?",type:"ch",...mc(cc(L[v]),W.map(cc)),expl:EX}; },
  /* trois gains Kp : repérer le plus grand, erreur statique du plus petit */
  ()=>{ const S=rnd([SR[0],SR[1],SR[5]]);
    const o=draw(()=>{ const c=rnd(S.c), T=rnd(S.t5)/2.2; return {c,T,A:axR(1,c*1.35)}; },o=>onGrid(o.c,o.A.ym)&&onGrid(0.8*o.c,o.A.ym));
    o.cur=[4,9,19].map(a=>bfP2(a,o.T,o.T/5,o.c)); o.A=axR(1.3*t5of(o.cur[0].f,o.cur[0].sf,12*o.T,2000),o.c*1.35);
    const perm=shuffle([0,1,2]), L3=["A","B","C"], Lof=k=>L3[perm.indexOf(k)];
    const fig=figR(S,o.A,{c:perm.map((p,i)=>({f:o.cur[p].f,lab:`courbe ${L3[i]}`,k:i,dash:[null,"8 4","2 3"][i]})),cons:o.c});
    const ctx=`Trois réglages Kp1 < Kp2 < Kp3 d'un correcteur proportionnel ${deX(S.nm)} donnent les courbes A, B et C (dans le désordre).`, es=100/5;
    return [{fig,ctx,q:"Quelle courbe correspond au plus grand gain Kp3 ?",type:"ch",ch:L3.map(l=>`Courbe ${l}`),ok:perm.indexOf(2),
        expl:`Plus Kp est grand, plus la sortie s'approche de la consigne (erreur statique plus faible) et plus le dépassement est grand. La ${F(`courbe ${Lof(2)}`)} a la plus petite erreur statique et le plus grand dépassement : c'est Kp3.`},
      {fig,ctx,q:"Détermine l'erreur statique relative obtenue avec le plus petit gain Kp1.",type:"num",ans:es,tolR:0.02,unit:"%",
        expl:`Kp1 donne la courbe ${Lof(0)}, la plus basse : s∞ = ${vu(S,o.cur[0].sf)} pour une consigne de ${vu(S,o.c)}. ${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.cur[0].sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(es,"%")}.`}]; },
  /* de l'erreur statique mesurée au gain Kp */
  ()=>{ const C=rnd(CS.filter(x=>x.tu==="s")), S=C.u==="rad/s"?SR[1]:SR[0];
    const o=draw(()=>{ const c=rnd(S.c), a=rnd([3,4,9,19]), K=rnd(C.K), t5=rnd(S.t5), A=axR(t5*2.2,c*1.1,220); return {c,a,K,t5,A,sf:c*a/(1+a)}; },o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&o.c-o.sf>=0.9*o.A.ym);
    const es=100/(1+o.a), Kp=o.a/o.K, fig=figR(S,o.A,{...TALL,c:[{f:ord1(o.sf,o.t5/3)}],cons:o.c}), ctx=`Réponse ${deX(S.nm)} avec un correcteur proportionnel (procédé du premier ordre, retour unitaire).`;
    return [{fig,ctx,q:"Détermine l'erreur statique relative, en % de la consigne.",type:"num",ans:es,tolR:0.02,unit:"%",
        expl:`Consigne ${vu(S,o.c)}, valeur finale ${vu(S,o.sf)} : ${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(o.sf,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(es,"%")}.`},
      {fig,ctx:`Erreur statique relative : ${nf(es,2)} %.`,q:`Déduis-en le gain de boucle ${KBO}.`,type:"num",ans:o.a,tolR:0.02,unit:"",
        expl:`${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} = ${nf(es/100,3)}, donc 1 + ${KBO} = ${FRAC("1",nf(es/100,3))} = ${nf(1+o.a,3)} et ${KBO} = ${U(o.a,"")}.`},
      {fig,ctx:`${KBO} = ${nf(o.a,2)}. Le procédé a un gain statique K = ${nf(o.K,3)} ${C.Ku}.`,q:"Calcule le gain Kp du correcteur.",type:"num",ans:Kp,tolR:0.02,unit:C.Kpu,
        expl:`${F(`Kp = ${FRAC(KBO,"K")}`)} = ${FRAC(nf(o.a,2),nf(o.K,3))} = ${U(Kp,C.Kpu)}.`}]; },
  /* saturation de la commande au démarrage */
  ()=>{ const want=Math.random()<0.6;
    const o=draw(()=>({Kp:rnd([0.1,0.2,0.25,0.4,0.5]),c:rnd([60,80,100,120,150]),um:rnd([12,24])}),o=>want?o.Kp*o.c>=1.15*o.um:o.Kp*o.c<=0.85*o.um);
    const fig=fx_auto_bloc({e:"ωc (rad/s)",d:[["Correcteur",`Kp = ${nf(o.Kp,2)}`],["Limite",`${o.um} V max`],["Hacheur","+ moteur"]],lk:["ε (rad/s)","u (V)","u lim (V)","ω (rad/s)"],r:null,lr:"ω (rad/s)"});
    const u0=o.Kp*o.c, es=o.um/o.Kp, ctx=`Asservissement de vitesse d'un moteur : correcteur proportionnel Kp = ${nf(o.Kp,2)} V/(rad/s). Le hacheur ne peut pas fournir plus de ${o.um} V : la commande est limitée à ${o.um} V. À t = 0, la consigne passe de 0 à ${o.c} rad/s, moteur à l'arrêt.`;
    const out=[{fig,ctx,q:"Calcule la commande demandée par le correcteur à t = 0.",type:"num",ans:u0,tolR:0.02,unit:"V",
        expl:`À t = 0, ω = 0, donc ε = ${o.c} rad/s et ${F("u = Kp·ε")} = ${nf(o.Kp,2)} × ${o.c} = ${U(u0,"V")}.`},
      {ctx,q:"La commande est-elle saturée au démarrage ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(u0,1)} V ${want?"&gt;":"≤"} ${o.um} V : ${want?`le correcteur demande plus que ce que le hacheur peut fournir, la commande est ${F("saturée")} à ${o.um} V.`:`la commande reste dans les limites : ${F("pas de saturation")}, le modèle linéaire s'applique.`}`}];
    if(want) out.push({ctx,q:"Jusqu'à quelle vitesse du moteur la commande reste-t-elle saturée ?",type:"num",ans:o.c-es,tolR:0.02,unit:"rad/s",
        expl:`La commande n'est plus saturée quand ${F(`Kp·ε ≤ ${o.um} V`)}, soit ε ≤ ${FRAC(o.um,nf(o.Kp,2))} = ${nf(es,1)} rad/s, c'est-à-dire ω ≥ ${o.c} − ${nf(es,1)} = ${U(o.c-es,"rad/s")}. Jusque-là, le moteur reçoit la tension maximale et démarre moins vite que ne le prévoit le modèle linéaire.`});
    return out; },
  /* perturbation : correcteur P ou PI */
  ()=>{ const E=rnd([{S:SR[0],ev:"on dépose des colis sur le tapis"},{S:SR[1],ev:"le robot aborde une rampe"},{S:SR[5],ev:"on ouvre un robinet de soutirage"}]), S=E.S;
    const o=draw(()=>{ const c=rnd(S.c), e1=rnd([0.04,0.05,0.08,0.1]), s1=r2(c*(1-e1),6), t5=rnd(S.t5), A=axR(t5*rnd([3.4,3.8]),c*1.25), p=rnd([0.08,0.1,0.12,0.15,0.2]); return {c,s1,s2:r2(s1-p*c,6),t5,A}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.s1,o.A.ym)&&onGrid(o.s2,o.A.ym)&&o.s1-o.s2>=1.9*o.A.ym&&o.c-o.s1>=0.9*o.A.ym&&onGrid(o.t5,o.A.xm)&&1.8*o.t5<=0.45*o.A.tmax);
    const t1=Math.ceil(0.4*o.A.tmax/o.A.xs-1e-9)*o.A.xs, g=mk2(1,0.1,o.t5).f, fP1=mk2(o.s1,0.1,o.t5).f, fI1=mk2(o.c,0.1,o.t5).f, dm=o.s1-o.s2;
    const a=o.t5/2, b=o.t5/8, us=ln(a/b)*a*b/(a-b), gs=Math.exp(-us/a)-Math.exp(-us/b);
    const fP=t=>t<t1?fP1(t):fP1(t)-dm*g(t-t1), fI=t=>t<t1?fI1(t):fI1(t)-0.8*dm*(Math.exp(-(t-t1)/a)-Math.exp(-(t-t1)/b))/gs, pi=ri(0,1), L2=["A","B"];
    const fig=figR(S,o.A,{c:[{f:pi?fP:fI,lab:"courbe A",k:0},{f:pi?fI:fP,lab:"courbe B",k:1,dash:"8 4"}],cons:o.c,vl:[{t:t1,lab:"perturbation",y:o.A.ymax}],legY:36}), ctx=`Deux réglages ${deX(S.nm)}, l'un avec un correcteur P, l'autre avec un correcteur PI. À t = ${nf(t1,2)} ${S.tu}, ${E.ev}.`;
    return [{fig,ctx,q:"Laquelle des deux courbes est obtenue avec le correcteur PI ?",type:"ch",ch:["Courbe A","Courbe B"],ok:pi,
        expl:`La ${F(`courbe ${L2[pi]}`)} revient à la consigne, avant comme après la perturbation : l'action intégrale annule l'erreur statique. La courbe ${L2[1-pi]} garde un écart, qui augmente avec la perturbation.`},
      {fig,ctx,q:"Avec le correcteur P, de combien la valeur finale a-t-elle baissé à cause de la perturbation ?",type:"num",ans:dm,tolA:0.35*o.A.ym,unit:S.u,
        expl:`Avant la perturbation, la courbe P se stabilise à ${vu(S,o.s1)} ; après, à ${vu(S,o.s2)}. ${F("Δs = s∞ avant − s∞ après")} = ${nf(o.s1,S.d)} − ${nf(o.s2,S.d)} = ${VU(S,dm)}. Le correcteur P réduit l'effet de la perturbation sans l'annuler.`}]; },
  /* gain trop grand : instabilité */
  ()=>{ const S=rnd([SR[0],SR[1],SR[5]]), c=rnd(S.c), T=rnd(S.t5)/3, ta=nax(6*T,6,308), yb=nax(2.6*c,7,220);
    const A={tmax:ta.max,xs:ta.s,xm:ta.m,ys:yb.s,ym:yb.s/2,ymin:-Math.ceil(0.4*c/yb.s-1e-9)*yb.s,ymax:Math.ceil(2.2*c/yb.s-1e-9)*yb.s};
    const cur=[1,3,13].map(a=>simL({tl:[T,T/2,T/4],K:1,Kp:a,r:c,tmax:A.tmax,n:1500}).f), p3=peakOf(t=>t<1.6*T?cur[2](t):-1e9,1.6*T);
    const fig=figR(S,A,{c:cur.map((f,i)=>({f,lab:`Kp${i+1}`,k:i,dash:[null,"8 4","2 3"][i],lt:i<2?0.97*A.tmax:p3.t,a:i<2?"end":"start",dx:i<2?0:8,dy:-7})),cons:c,...TALL}), ctx=`Trois réglages Kp1 < Kp2 < Kp3 d'un correcteur proportionnel ${deX(S.nm)}. Un élève affirme : « plus Kp est grand, meilleur est l'asservissement ».`;
    return [{fig,ctx,q:"Que montre l'essai avec Kp3 ?",type:"ch",...mc("La sortie oscille de plus en plus : le système est instable, l'affirmation est fausse",["C'est le réglage le plus précis : l'affirmation est juste","C'est le réglage le plus lent","Son erreur statique est la plus grande"]),
        expl:`Avec Kp3, les oscillations grandissent : le système est ${F("instable")}. Augmenter Kp réduit l'erreur statique et accélère la réponse, mais au-delà d'un certain gain la boucle devient instable.`},
      {fig,ctx,q:"Quel réglage donne la meilleure précision tout en restant stable ?",type:"ch",ch:["Kp1","Kp2","Kp3"],ok:1,
        expl:`Kp1 est stable mais peu précis (s∞ = ${vu(S,c/2)}, soit 50 % d'erreur statique). ${F("Kp2")} reste stable et plus précis (s∞ = ${vu(S,0.75*c)}), au prix d'un dépassement. Kp3 est instable : il est exclu.`}]; },
  /* action dérivée : PI ou PID */
  ()=>{ const S=rnd([SR[1],SR[3],SR[6],SR[2]]);
    const o=draw(()=>{ const c=rnd(S.c), T=rnd(S.t5)/1.6, pr=rnd([[8,8,1.2],[6,6,1.2]]); return {c,T,pr}; },()=>true);
    const tm=5*o.T, sPI=simL({tl:[o.T,0.3*o.T],K:1,Kp:o.pr[0],Ki:o.pr[1]/o.T,r:o.c,tmax:tm,n:1500}).f, sPID=simL({tl:[o.T,0.3*o.T],K:1,Kp:o.pr[0],Ki:o.pr[1]/o.T,Kd:o.pr[2]*o.T,r:o.c,tmax:tm,n:1500}).f;
    const pk=peakOf(sPI,tm,2000), pk2=peakOf(sPID,tm,2000), A=axR(tm,pk.y*1.08), d=S.d, sm=r2(pk.y,d), D=(sm-o.c)/o.c*100, D2=(r2(pk2.y,d)-o.c)/o.c*100, pd=ri(0,1), L2=["A","B"];
    const fig=figR(S,A,{c:[{f:pd?sPI:sPID,lab:"courbe A",k:0},{f:pd?sPID:sPI,lab:"courbe B",k:1,dash:"8 4"}],cons:o.c}), ctx=`Deux essais ${deX(S.nm)} avec les mêmes réglages Kp et Ki ; pour l'un, on a ajouté une action dérivée (correcteur PID).`;
    return [{fig,ctx,q:"Quelle courbe correspond au correcteur PID ?",type:"ch",ch:["Courbe A","Courbe B"],ok:pd,
        expl:`L'action dérivée ${F("améliore l'amortissement")} : la ${F(`courbe ${L2[pd]}`)} dépasse moins. Les deux rejoignent la consigne, grâce à l'action intégrale.`},
      {fig,ctx:`Pour le correcteur PI, on relève un premier pic de ${vu(S,sm)} pour une valeur finale de ${vu(S,o.c)}.`,q:"Calcule le dépassement relatif obtenu avec le correcteur PI.",type:"num",ans:D,tolR:0.02,unit:"%",
        expl:`${F(DPC)} = ${FRAC(`${nf(sm,d)} − ${nf(o.c,d)}`,nf(o.c,d))} × 100 = ${U(D,"%")}, contre environ ${nf(D2,0)} % avec l'action dérivée.`}]; },
  /* identification en boucle ouverte, puis boucle fermée */
  ()=>{ const S=rnd([SR[0],SR[1]]), C=S===SR[1]?CS[0]:CS[2];
    const o=draw(()=>{ const K=rnd(C.K), E0=rnd([6,10,12,20]), sf=r2(K*E0,6), t5=rnd(S.t5)*rnd([2,3]), A=axR(t5*1.8,sf*1.12,220), tau=r2(Math.round(t5/3/A.xm)*A.xm,6), Kp=rnd(C.Kp); return {K,E0,sf,t5,A,tau,Kp}; },
      o=>onGrid(o.sf,o.A.ym)&&o.tau>=2*o.A.xm&&3*o.tau<=0.7*o.A.tmax&&o.K*o.Kp>=2&&o.K*o.Kp<=9);
    const a=o.K*o.Kp, tb=o.tau/(1+a), fig=figR(S,o.A,{...TALL,c:[{f:ord1(o.sf,o.tau)}],hl:[{y:o.sf,lab:"valeur finale"}]}), ctx=`Pour régler ${S.nm}, on relève la réponse du procédé seul (boucle ouverte) à un échelon de commande de ${o.E0} V.`;
    return [{fig,ctx,q:"Calcule le gain statique K du procédé.",type:"num",ans:o.K,tolR:0.02,unit:C.Ku,
        expl:`${F(`K = ${FRAC("s∞","E0")}`)} = ${FRAC(vu(S,o.sf),`${o.E0} V`)} = ${U(o.K,C.Ku)}.`},
      {fig,ctx,q:"Détermine la constante de temps τ du procédé.",type:"num",ans:o.tau,tolA:0.5*o.A.xm,unit:S.tu,
        expl:`À t = τ, la sortie vaut 63 % de sa valeur finale : 0,63 × ${nf(o.sf,S.d)} = ${vu(S,0.63*o.sf,S.d+1)}, atteint à ${F(`τ ≈ ${S3(o.tau)} ${S.tu}`)}.`},
      {fig,ctx:`On retient K = ${nf(o.K,3)} ${C.Ku} et τ = ${nf(o.tau,3)} ${S.tu}. On boucle avec un correcteur proportionnel Kp = ${nf(o.Kp,3)} ${C.Kpu} (retour unitaire).`,q:"Calcule la constante de temps de la boucle fermée.",type:"num",ans:tb,tolR:0.02,unit:S.tu,
        expl:`${KBO} = ${nf(o.K,3)} × ${nf(o.Kp,3)} = ${nf(a,3)}. ${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)} = ${FRAC(nf(o.tau,3),`1 + ${nf(a,3)}`)} = ${U(tb,S.tu)} : la boucle fermée est plus rapide que le procédé seul.`}]; },
  /* gain pour une constante de temps imposée */
  ()=>{ const C=rnd(CS), o=draw(()=>{ const K=rnd(C.K), tau=rnd(C.tau), r=rnd([3,4,5,6,8,10]), tb=tau/r; return {K,tau,r,tb,Kp:(r-1)/K}; },o=>Math.abs(+o.tb.toPrecision(3)-o.tb)<1e-12);
    const ctx=`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku} et de constante de temps τ = ${nf(o.tau,2)} ${C.tu} ; correcteur proportionnel, retour unitaire. On veut une boucle fermée de constante de temps ${TBF} = ${nf(o.tb,4)} ${C.tu}.${C.note||""}`;
    return [{ctx,q:"Quel gain Kp faut-il ?",type:"num",ans:o.Kp,tolR:0.02,unit:C.Kpu,
        expl:`${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)}, donc 1 + ${KBO} = ${FRAC("τ",TBF)} = ${FRAC(nf(o.tau,2),nf(o.tb,4))} = ${nf(o.r,0)}, soit ${KBO} = ${nf(o.r-1,0)} et ${F(`Kp = ${FRAC(nf(o.r-1,0),"K")}`)} = ${U(o.Kp,C.Kpu)}.`},
      {ctx:`${ctx} Avec ce réglage, 1 + ${KBO} = ${nf(o.r,0)}.`,q:"Quelle erreur statique relative obtient-on ?",type:"num",ans:100/o.r,tolR:0.02,unit:"%",
        expl:`${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} = ${FRAC("1",nf(o.r,0))}, soit ${U(100/o.r,"%")} de la consigne. Rapidité et précision s'améliorent ensemble avec Kp, mais l'erreur ne s'annule pas.`}]; }
];

/* réponses simulées d'un 2e ordre (τ1 = T, τ2 = 0,3·T) avec P, PI ou PID ; valeurs relevées */
function simPID(c,T,Kp,Ki,Kd,tm){ const f=simL({tl:[T,0.3*T],K:1,Kp,Ki:Ki/T,Kd:Kd*T,r:c,tmax:tm,n:1500}).f, sf=Ki?c:c*Kp/(1+Kp), pk=peakOf(f,tm,2000); return {f,sf,pk:pk.y>sf*1.001?pk.y:null,t5:t5of(f,sf,tm,2000)}; }
const CO3=[
  /* choisir Kp : précision et saturation de la commande */
  ()=>{ const C=rnd(CS.filter(x=>x.cu==="V")), k=ri(0,1);
    const o=draw(()=>{ const K=rnd(C.K), X=rnd([5,8,10,12,15,20]), c=rnd(C.c), um=rnd([10,12,24]); return {K,X,c,um,kmin:(100/X-1)/K,kmax:um/c}; },o=>k===0?o.kmax>=1.4*o.kmin:o.kmax<=0.7*o.kmin);
    const r2s=x=>+x.toPrecision(2), mid=r2s(Math.sqrt(o.kmin*o.kmax)), lo=r2s(Math.min(o.kmin,o.kmax)*0.6), hi=r2s(Math.max(o.kmin,o.kmax)*1.6);
    const vals=k===0?[lo,mid,hi]:[lo,r2s(Math.sqrt(o.kmin*o.kmax)),hi], NONE="Aucun : un correcteur P ne convient pas, il faut une action intégrale";
    const CH=[...vals.map(v=>`Kp = ${nf(v,4)} ${C.Kpu}`),NONE], ok=k===0?1:3;
    const ctx=`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku}, correcteur proportionnel, retour unitaire. Exigences : erreur statique au plus ${o.X} % ; la commande ne doit jamais dépasser ${o.um} V (limite du préactionneur), même au démarrage, pour une consigne de ${vu(C,o.c)}.`;
    return [{ctx,q:"Calcule le gain Kp minimal imposé par l'exigence de précision.",type:"num",ans:o.kmin,tolR:0.02,unit:C.Kpu,
        expl:`${F(`${FRAC("1",`1 + ${KBO}`)} ≤ ${nf(o.X/100,2)}`)} impose ${KBO} ≥ ${nf(100/o.X-1,2)}, donc Kp ≥ ${FRAC(nf(100/o.X-1,2),nf(o.K,3))} = ${U(o.kmin,C.Kpu)}.`},
      {ctx,q:"Calcule le gain Kp maximal imposé par la limite de la commande.",type:"num",ans:o.kmax,tolR:0.02,unit:C.Kpu,
        expl:`Au démarrage, la sortie est nulle : l'écart vaut la consigne et la commande est maximale, ${F("u = Kp·consigne")}. Il faut Kp × ${nf(o.c,2)} ≤ ${o.um}, soit Kp ≤ ${FRAC(o.um,nf(o.c,2))} = ${U(o.kmax,C.Kpu)}.`},
      {ctx:`${ctx} Kp min = ${nf(o.kmin,3)} ${C.Kpu} ; Kp max = ${nf(o.kmax,3)} ${C.Kpu}.`,q:"Quel réglage choisir ?",type:"ch",ch:CH,ok,
        expl:k===0?`Il faut ${nf(o.kmin,3)} ≤ Kp ≤ ${nf(o.kmax,3)} ${C.Kpu} : seul ${F(`Kp = ${nf(mid,4)}`)} ${C.Kpu} convient. Un gain plus petit est trop imprécis, un gain plus grand sature la commande.`
          :`Il faudrait Kp ≥ ${nf(o.kmin,3)} et Kp ≤ ${nf(o.kmax,3)} ${C.Kpu} : c'est impossible. ${F("Aucun réglage P")} ne convient ; une action intégrale annule l'erreur statique sans gain excessif.`}]; },
  /* réglage de Ki : trois réponses d'un correcteur PI */
  ()=>{ const S=rnd([SR[0],SR[1],SR[3],SR[6]]), k=ri(0,2)?0:1;
    const o=draw(()=>{ const c=rnd(S.c), T=rnd(S.t5)/1.2, XD=rnd([10,15,20]), XT=+(T*(k?rnd([0.6,0.7]):rnd([1.5,1.8,2.2]))).toPrecision(2); return {c,T,XD,XT}; },()=>true);
    const tm=5*o.T, R=[1,2,6].map(ki=>{ const f=simL({tl:[o.T,0.2*o.T],K:1,Kp:2,Ki:ki/o.T,r:o.c,tmax:tm,n:1500}).f, pk=peakOf(f,tm,2000); return {f,pk:pk.y>o.c*1.005?pk.y:null,t5:t5of(f,o.c,tm,2000)}; });
    R.forEach(r=>{ r.D=r.pk?(r2(r.pk,S.d)-o.c)/o.c*100:0; r.t5r=+r.t5.toPrecision(2); r.ok=r.D<=o.XD&&r.t5r<=o.XT; });
    const perm=shuffle([0,1,2]), L3=["A","B","C"], Lof=j=>L3[perm.indexOf(j)], win=R.findIndex(r=>r.ok), A=axR(tm,Math.max(o.c,R[2].pk)*1.08);
    const fig=figR(S,A,{c:perm.map((p,i)=>({f:R[p].f,lab:`courbe ${L3[i]}`,k:i,dash:[null,"8 4","2 3"][i]})),cons:o.c});
    const data=tab(["Courbe","Premier pic","t5%"],perm.map((p,i)=>[L3[i],R[p].pk?vu(S,R[p].pk):"aucun",`${nf(R[p].t5r,3)} ${S.tu}`]));
    const ctx=`Correcteur PI ${deX(S.nm)} (consigne ${vu(S,o.c)}) : même gain Kp, trois valeurs de Ki (faible, moyenne, forte). Exigences : dépassement au plus ${o.XD} % ; temps de réponse à 5 % au plus ${nf(o.XT,3)} ${S.tu}.`;
    return [{fig,data,ctx,q:"Quelle courbe correspond au plus grand Ki ?",type:"ch",ch:L3.map(l=>`Courbe ${l}`),ok:perm.indexOf(2),
        expl:`Plus Ki est grand, plus l'action intégrale est forte : la sortie rejoint vite la consigne mais la dépasse et oscille. La ${F(`courbe ${Lof(2)}`)} a le plus grand dépassement : c'est le plus grand Ki. Avec un Ki faible (courbe ${Lof(0)}), la sortie rejoint la consigne très lentement.`},
      {fig,data,ctx,q:"Quel réglage respecte les deux exigences ?",type:"ch",ch:[...L3.map(l=>`Courbe ${l}`),"Aucun"],ok:win<0?3:perm.indexOf(win),
        expl:`${[0,1,2].sort((a,b)=>perm.indexOf(a)-perm.indexOf(b)).map(j=>`Courbe ${Lof(j)} : D = ${nf(R[j].D,1)} %, t5% = ${nf(R[j].t5r,3)} ${S.tu}`).join(" ; ")}. ${win<0?`${F("Aucun réglage")} ne respecte les deux exigences : le temps de réponse demandé est trop court.`:`Seule la ${F(`courbe ${Lof(win)}`)} (Ki moyen) respecte les deux exigences.`}`}]; },
  /* perturbation : trois gains P, puis action intégrale */
  ()=>{ const E=rnd([{S:SR[0],ev:"on charge le tapis"},{S:SR[1],ev:"le robot aborde une rampe"},{S:SR[5],ev:"on ouvre un robinet de soutirage"}]), S=E.S;
    const o=draw(()=>{ const c=rnd(S.c), t5=rnd(S.t5), A=axR(t5*3.2,c*1.05); return {c,t5,A}; },o=>onGrid(o.c/2,o.A.ym)&&onGrid(0.3*o.c,o.A.ym)&&onGrid(o.t5,o.A.xm));
    const t1=Math.ceil(0.45*o.A.tmax/o.A.xs-1e-9)*o.A.xs, D0=0.4*o.c, cur=[1,3,9].map(a=>{ const s1=o.c*a/(1+a), d=D0/(1+a), tb=o.t5/3*2/(1+a); return {s1,d,f:t=>ord1(s1,tb)(t)-(t<t1?0:d*(1-Math.exp(-(t-t1)/tb)))}; });
    const fig=figR(S,o.A,{c:cur.map((x,i)=>({f:x.f,lab:`Kp${i+1}`,k:i,dash:[null,"8 4","2 3"][i],lt:0.97*o.A.tmax,a:"end",dy:-7})),cons:o.c,consX:0.02*o.A.tmax,vl:[{t:t1,lab:"perturbation",y:o.A.ymax}]});
    const ctx=`Correcteur proportionnel ${deX(S.nm)}, trois réglages Kp1 < Kp2 < Kp3. À t = ${nf(t1,2)} ${S.tu}, ${E.ev}.`, dl=cur[0].d;
    return [{fig,ctx,q:"Avec Kp1, de combien la sortie a-t-elle baissé en régime permanent à cause de la perturbation ?",type:"num",ans:dl,tolA:0.35*o.A.ym,unit:S.u,
        expl:`Avec Kp1, la sortie passe de ${vu(S,cur[0].s1)} à ${vu(S,cur[0].s1-dl)} : ${F(`Δs = ${S3(dl)}${sfx(S.u)}`)}.`},
      {fig,ctx,q:"Comment l'effet de la perturbation évolue-t-il quand Kp augmente ?",type:"ch",...mc("Il diminue, sans s'annuler",["Il augmente","Il s'annule dès que Kp dépasse Kp1","Il ne dépend pas de Kp"]),
        expl:`La baisse vaut ${vu(S,dl)} avec Kp1, ${vu(S,cur[1].d)} avec Kp2 et ${vu(S,cur[2].d)} avec Kp3 : la boucle divise l'effet de la perturbation par ${F("1 + K·Kp")}, mais ne l'annule pas.`},
      {fig,ctx,q:"Quelle modification annule l'effet de la perturbation en régime permanent ?",type:"ch",...mc("Ajouter une action intégrale (correcteur PI)",["Augmenter encore Kp","Ajouter une action dérivée seule","Diminuer Kp"]),
        expl:`Tant qu'un écart subsiste, ${F("l'action intégrale")} augmente la commande : en régime permanent, l'écart est nul malgré la perturbation. Augmenter Kp réduit l'effet sans l'annuler, et finit par déstabiliser la boucle.`}]; },
  /* simulation d'une boucle P dans un programme */
  ()=>{ const o=draw(()=>({K:rnd([1,2,4]),a:rnd([0.1,0.2,0.25]),Kp:rnd([0.5,1,1.5,2]),c:rnd([10,20,100]),n:rnd([2,3])}),o=>o.a*(1+o.K*o.Kp)<=0.9);
    let y=0; const st=[]; for(let k=0;k<o.n;k++){ const u=o.Kp*(o.c-y), y1=y+o.a*(o.K*u-y); st.push(`k = ${k} : u = ${nf(o.Kp,1)} × (${o.c} − ${nf(y,3)}) = ${nf(u,3)}, y = ${nf(y,3)} + ${nf(o.a,2)} × (${o.K} × ${nf(u,3)} − ${nf(y,3)}) = ${nf(y1,3)}`); y=y1; }
    const Kb=o.K*o.Kp, yf=o.c*Kb/(1+Kb), fig=code(`K = ${o.K}          # gain du procédé\na = ${o.a}        # a = Te / tau\nKp = ${o.Kp}\nconsigne = ${o.c}\ny = 0\nfor k in range(${o.n}):\n    u = Kp * (consigne - y)\n    y = y + a * (K * u - y)\nprint(y)`);
    return [{fig,ctx:"Ce programme simule, pas à pas, un procédé du premier ordre commandé par un correcteur proportionnel (Te : période d'échantillonnage).",q:"Quelle valeur de y ce programme affiche-t-il (à 0,01 près) ?",type:"num",ans:y,tolA:0.01,unit:"",
        expl:`On déroule la boucle : ${st.join(" ; ")}. Le programme affiche y ≈ ${F(S3(y))}.`},
      {fig,ctx:"Même programme.",q:"Si la boucle tournait très longtemps, vers quelle valeur y tendrait-il ?",type:"num",ans:yf,tolR:0.02,unit:"",
        expl:`En régime permanent, y ne varie plus : K·u = y avec u = Kp·(consigne − y). Donc y = ${FRAC(KBO,`1 + ${KBO}`)} × consigne = ${FRAC(nf(Kb,2),`1 + ${nf(Kb,2)}`)} × ${o.c} = ${F(S3(yf))}. On retrouve ${F(`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`)} : il reste une erreur statique.`}]; },
  /* tableau de réglages de Kp : choix sous deux exigences */
  ()=>{ const [S,C]=rnd([[SR[0],CS[2]],[SR[1],CS[0]],[SR[5],CS[3]]]), j=ri(1,3), aa=[1,2,4,9,19], T=rnd(S.t5)/2.5;
    const K=rnd(C.K), Ku=C.Kpu, rows=aa.map(a=>{ const b=bfP2(a,T,T/5,1), D=b.z<1?100*Math.exp(-Math.PI*b.z/Math.sqrt(1-b.z*b.z)):0; return {a,Kp:a/K,es:100/(1+a),D,t5:t5of(b.f,b.sf,20*T,2000)}; });
    const up=(x,y)=>[5,10,12,15,20,25,30,40,45].filter(v=>v>x*1.1&&v<y*0.9), Xe=rnd(up(rows[j].es,rows[j-1].es)), XD=rnd(up(Math.max(rows[j].D,1),rows[j+1].D));
    const data=tab(["Kp","Erreur statique","Dépassement","t5%"],rows.map(r=>[`${nf(r.Kp,3)} ${Ku}`,`${nf(r.es,1)} %`,`${nf(r.D,1)} %`,`${nf(r.t5,2)} ${S.tu}`]));
    const ctx=`Simulations ${deX(S.nm)} avec un correcteur proportionnel, pour cinq valeurs de Kp. Exigences : erreur statique au plus ${Xe} % ; dépassement au plus ${XD} %.`;
    return [{data,ctx,q:"Quel gain Kp faut-il retenir ?",type:"ch",ch:rows.map(r=>`Kp = ${nf(r.Kp,3)}${Ku?" "+Ku:""}`),ok:j,
        expl:`L'erreur statique diminue quand Kp augmente : il faut εs ≤ ${Xe} %, soit Kp ≥ ${nf(rows[j].Kp,3)}. Le dépassement augmente avec Kp : il faut D ≤ ${XD} %, soit Kp ≤ ${nf(rows[j].Kp,3)}. Seul ${F(`Kp = ${nf(rows[j].Kp,3)}`)} respecte les deux exigences (εs = ${nf(rows[j].es,1)} %, D = ${nf(rows[j].D,1)} %).`},
      {data,ctx,q:"On voudrait une erreur statique encore plus faible. Que faut-il faire ?",type:"ch",...mc("Ajouter une action intégrale : un gain Kp plus grand donnerait trop de dépassement",["Prendre la plus grande valeur de Kp du tableau","Diminuer Kp","Rien : un correcteur P peut annuler l'erreur statique"]),
        expl:`Avec un correcteur P, précision et dépassement s'opposent : au-delà de Kp = ${nf(rows[j].Kp,3)}, le dépassement dépasse ${XD} %. ${F("L'action intégrale")} annule l'erreur statique sans augmenter Kp.`}]; },
  /* erreur d'élève : doubler Kp divise-t-il l'erreur statique par deux ? */
  ()=>{ const C=rnd(CS), o=draw(()=>({K:rnd(C.K),Kp:rnd(C.Kp)}),o=>o.K*o.Kp>=1&&o.K*o.Kp<=9), a=o.K*o.Kp, e1=100/(1+a), e2=100/(1+2*a);
    const ctx=`${ctxP(C,o)} Un élève affirme : « si l'on double Kp, l'erreur statique est divisée par deux ».`;
    return [{ctx,q:"Calcule l'erreur statique relative avec ce réglage.",type:"num",ans:e1,tolR:0.02,unit:"%",
        expl:`${KBO} = ${nf(a,3)} ; ${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} = ${FRAC("1",nf(1+a,3))}, soit ${U(e1,"%")}.`},
      {ctx,q:"Calcule l'erreur statique relative si l'on double Kp.",type:"num",ans:e2,tolR:0.02,unit:"%",
        expl:`${KBO} devient ${nf(2*a,3)} : εs = ${FRAC("1",`1 + ${nf(2*a,3)}`)}, soit ${U(e2,"%")}.`},
      {ctx:`${ctx} On trouve ${nf(e1,1)} %, puis ${nf(e2,1)} % en doublant Kp.`,q:"L'élève a-t-il raison ?",type:"ch",...mc("Non : l'erreur diminue, mais moins que de moitié, car εs = 1 / (1 + K·Kp)".replace("1 / (1 + K·Kp)",FRAC("1",`1 + ${KBO}`)),["Oui : l'erreur statique est inversement proportionnelle à Kp","Non : l'erreur statique ne dépend pas de Kp","Non : l'erreur est divisée par quatre"]),
        expl:`${nf(e1,1)} % divisé par 2 donnerait ${nf(e1/2,1)} %, or on trouve ${nf(e2,1)} %. Le « 1 + » de ${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} empêche la proportionnalité : doubler Kp ne divise pas l'erreur par 2.`}]; },
  /* exigence de rapidité : Kp minimal, puis précision obtenue */
  ()=>{ const C=rnd(CS), want=Math.random()<0.5;
    const o=draw(()=>{ const K=rnd(C.K), tau=rnd(C.tau), r=rnd([3,4,5,6,8,10,12,15]), T=+(3*tau/r).toPrecision(2), km=(3*tau/T-1)/K, Kp=+(km*rnd([1.1,1.2])).toPrecision(2), es=100/(1+K*Kp), X=rnd([5,8,10,12,15,20,25]); return {K,tau,T,km,Kp,es,X}; },
      o=>o.km>0&&3*o.tau/o.T>=2&&(o.es<=o.X)===want&&far(o.es,o.X,0.2));
    const ctx=`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku} et de constante de temps τ = ${nf(o.tau,2)} ${C.tu} ; correcteur proportionnel, retour unitaire. Exigence de rapidité : temps de réponse à 5 % au plus ${nf(o.T,3)} ${C.tu}.${C.note||""}`;
    return [{ctx,q:"Calcule le gain Kp minimal qui respecte l'exigence de rapidité.",type:"num",ans:o.km,tolR:0.02,unit:C.Kpu,
        expl:`${F(`t5% ≈ ${FRAC("3τ",`1 + ${KBO}`)}`)} ≤ ${nf(o.T,3)} impose 1 + ${KBO} ≥ ${FRAC(`3 × ${nf(o.tau,2)}`,nf(o.T,3))} = ${nf(3*o.tau/o.T,3)}, donc Kp ≥ ${FRAC(nf(3*o.tau/o.T-1,3),nf(o.K,3))} = ${U(o.km,C.Kpu)}.`},
      {ctx:`${ctx} On règle Kp = ${nf(o.Kp,4)} ${C.Kpu}.`,q:"Calcule l'erreur statique relative obtenue.",type:"num",ans:o.es,tolR:0.02,unit:"%",
        expl:`${KBO} = ${nf(o.K,3)} × ${nf(o.Kp,4)} = ${nf(o.K*o.Kp,3)} ; ${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} = ${FRAC("1",nf(1+o.K*o.Kp,3))}, soit ${U(o.es,"%")}.`},
      {ctx:`Avec Kp = ${nf(o.Kp,4)} ${C.Kpu}, εs = ${nf(o.es,1)} %. Exigence de précision : erreur statique au plus ${o.X} %.`,q:"L'exigence de précision est-elle aussi satisfaite ?",type:"ch",ch:YN,ok:want?0:1,
        expl:`${nf(o.es,1)} % ${want?"≤":"&gt;"} ${o.X} % : ${want?"les deux exigences sont satisfaites avec ce réglage.":"l'exigence de précision n'est pas satisfaite ; il faut augmenter encore Kp (au risque d'un dépassement) ou ajouter une action intégrale."}`}]; },
  /* erreur statique très faible exigée : le correcteur P ne suffit pas */
  ()=>{ const C=rnd(CS.filter(x=>x.cu==="V")), o=draw(()=>({K:rnd(C.K),X:rnd([0.5,1]),c:rnd(C.c),um:rnd([12,24])}),o=>true), km=(100/o.X-1)/o.K, u0=km*o.c;
    const ctx=`${cap(C.nm)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku}, retour unitaire. Exigence : erreur statique au plus ${nf(o.X,1)} % pour une consigne de ${vu(C,o.c)}. Le préactionneur ne peut pas fournir plus de ${o.um} V.`;
    return [{ctx,q:"Avec un correcteur proportionnel, quel gain Kp minimal faudrait-il ?",type:"num",ans:km,tolR:0.02,unit:C.Kpu,
        expl:`${FRAC("1",`1 + ${KBO}`)} ≤ ${nf(o.X/100,3)} impose ${KBO} ≥ ${nf(100/o.X-1,0)}, donc ${F(`Kp ≥ ${FRAC(nf(100/o.X-1,0),nf(o.K,3))}`)} = ${U(km,C.Kpu)}.`},
      {ctx,q:"Avec ce gain, quelle commande le correcteur demanderait-il au démarrage ?",type:"num",ans:u0,tolR:0.02,unit:"V",
        expl:`Au démarrage, l'écart vaut la consigne : ${F("u = Kp·consigne")} = ${nf(km,3)} × ${nf(o.c,2)} = ${U(u0,"V")}, bien plus que ${o.um} V.`},
      {ctx,q:"Que faut-il conclure ?",type:"ch",...mc("Il faut une action intégrale (correcteur PI) : elle annule l'erreur statique sans gain excessif",["On garde ce gain : la saturation de la commande n'a pas d'importance","On augmente la consigne pour réduire l'erreur relative","On remplace le capteur par un capteur plus rapide"]),
        expl:`Un gain aussi grand sature la commande (le modèle linéaire ne s'applique plus) et risque de rendre la boucle instable. ${F("L'action intégrale")} annule l'erreur statique pour une consigne constante, avec un gain raisonnable.`}]; },
  /* programme de correcteur PI erroné */
  ()=>{ const v=ri(0,2), L={e:"ecart = consigne - mesure",s:"somme = somme + ecart",u:"commande = Kp * ecart + Ki * somme",sat:"    commande = 24"}, B=[{e:"ecart = mesure - consigne"},{s:"somme = 0\n    somme = somme + ecart"},{sat:"    commande = 0"}][v], R={...L,...B};
    const src=`somme = 0\nwhile True:\n    mesure = lire_capteur()\n    ${R.e}\n    ${R.s}\n    ${R.u}\n    if commande > 24:\n    ${R.sat}\n    envoyer(commande)`, cc=x=>`<code>${esc(x)}</code>`;
    const Q1=[["La ligne "+cc("ecart = mesure - consigne")+" : le signe de l'écart est inversé"],["La remise à zéro "+cc("somme = 0")+" à chaque passage : la somme des écarts est perdue"],["La ligne "+cc("commande = 0")+" : quand la commande est trop grande, elle est coupée au lieu d'être limitée à 24"]][v][0];
    const W=[`La ligne ${cc("commande = Kp * ecart + Ki * somme")} : il faudrait multiplier les deux termes`,`Le test ${cc("if commande > 24")} : il ne faut jamais limiter la commande`,`La ligne ${cc("mesure = lire_capteur()")} : il faut lire le capteur une seule fois, avant la boucle`];
    const CQ=[["La commande augmente quand la sortie est trop grande : la sortie s'emballe, la boucle est instable",["Il reste une erreur statique","Le système est seulement plus lent","Aucune conséquence"]],
      ["L'action intégrale ne fonctionne plus : il reste une erreur statique, comme avec un correcteur P",["La sortie s'emballe","La commande est toujours nulle","Aucune conséquence"]],
      ["Au démarrage, la commande est coupée dès qu'elle dépasse 24 : le moteur n'est pas alimenté quand l'écart est grand",["La sortie dépasse fortement la consigne","La commande reste bloquée à 24","Aucune conséquence"]]][v];
    const ctx="Programme d'un correcteur PI pour un moteur alimenté sous 24 V (consigne, Kp et Ki sont définis plus haut). Ce programme contient une erreur.";
    return [{fig:code(src),ctx,q:"Où est l'erreur ?",type:"ch",...mc(Q1,W),
        expl:[`L'écart doit valoir ${F("consigne − mesure")} : positif quand la sortie est trop faible, pour augmenter la commande.`,`La somme doit être initialisée ${F("une seule fois")}, avant la boucle : c'est elle qui garde la mémoire des écarts passés.`,`Une saturation ${F("limite")} la commande à 24 (commande = 24) ; la mettre à 0 coupe l'alimentation.`][v]},
      {fig:code(src),ctx,q:"Quelle est la conséquence de cette erreur ?",type:"ch",...mc(CQ[0],CQ[1]),
        expl:[`Avec l'écart inversé, une sortie trop forte augmente encore la commande : c'est une ${F("réaction positive")}, la boucle diverge.`,`Remise à zéro à chaque passage, la somme ne vaut que l'écart courant : le terme intégral devient un simple terme proportionnel, et ${F("l'erreur statique")} réapparaît.`,`Tant que Kp·ε + Ki·Σε dépasse 24, la commande vaut 0 : le moteur ${F("n'est pas alimenté")} au démarrage, au moment où il en a le plus besoin ; l'écart reste grand et le moteur peut ne jamais démarrer.`][v]}]; },
  /* identification de la boucle fermée : gain de boucle et constante de temps du procédé */
  ()=>{ const S=rnd([SR[0],SR[1],SR[5]]);
    const o=draw(()=>{ const c=rnd(S.c), a=rnd([3,4,9]), t5=rnd(S.t5), A=axR(t5*2,c*1.1,220), tb=r2(Math.round(t5/3/A.xm)*A.xm,6); return {c,a,A,tb,sf:c*a/(1+a)}; },
      o=>onGrid(o.c,o.A.ym)&&onGrid(o.sf,o.A.ym)&&o.tb>=2*o.A.xm&&3*o.tb<=0.7*o.A.tmax);
    const kb=o.a/(1+o.a), tau=o.tb*(1+o.a), fig=figR(S,o.A,{...TALL,c:[{f:ord1(o.sf,o.tb)}],cons:o.c}), ctx=`Réponse ${deX(S.nm)} avec un correcteur proportionnel (procédé du premier ordre, retour unitaire).`;
    return [{fig,ctx,q:`Détermine le gain statique de la boucle fermée ${KBF} = ${FRAC("s∞","consigne")}.`,type:"num",ans:kb,tolA:0.006,unit:"",
        expl:`On lit s∞ = ${vu(S,o.sf)} pour une consigne de ${vu(S,o.c)} : ${F(`${KBF} = ${FRAC(nf(o.sf,S.d),nf(o.c,S.d))}`)} = ${U(kb,"")}.`},
      {fig,ctx:`${KBF} = ${nf(kb,3)}.`,q:`Déduis-en le gain de boucle ${KBO}.`,type:"num",ans:o.a,tolR:0.02,unit:"",
        expl:`${F(`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`)}, donc ${KBO} = ${FRAC(KBF,`1 − ${KBF}`)} = ${FRAC(nf(kb,3),nf(1-kb,3))} = ${U(o.a,"")}.`},
      {fig,ctx:`${KBO} = ${nf(o.a,2)}. La constante de temps de la boucle fermée, lue à 63 % de s∞, vaut ${TBF} = ${nf(o.tb,3)} ${S.tu}.`,q:"Calcule la constante de temps τ du procédé seul.",type:"num",ans:tau,tolR:0.02,unit:S.tu,
        expl:`${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)}, donc τ = ${TBF} × (1 + ${KBO}) = ${nf(o.tb,3)} × ${nf(1+o.a,2)} = ${U(tau,S.tu)} : la boucle fermée est ${nf(1+o.a,2)} fois plus rapide que le procédé seul.`}]; },
  /* correcteur PI : commande en régime permanent */
  ()=>{ const C=rnd([{s:"la vitesse d'un moteur",y:"ω",u:"rad/s",K:[10,12,15,20,25],Ku:"(rad/s)/V",c:[60,80,100,120,150],Ki:[0.1,0.2,0.25,0.5],Kiu:"V/rad",Su:"rad"},
      {s:"la vitesse d'un tapis roulant",y:"v",u:"m/s",K:[0.1,0.12,0.15,0.2],Ku:"(m/s)/V",c:[0.6,0.8,1,1.2,1.5],Ki:[20,25,40,50],Kiu:"V/m",Su:"m"}]);
    const o=draw(()=>({K:rnd(C.K),c:rnd(C.c),Ki:rnd(C.Ki)}),o=>o.c/o.K<=24), ui=o.c/o.K, Sm=ui/o.Ki;
    const fig=fx_auto_bloc({e:`consigne (${C.u})`,d:[["Correcteur PI"],["Procédé",`K = ${nf(o.K,3)}`]],lk:[`ε (${C.u})`,"u (V)",`${C.y} (${C.u})`],r:null});
    const ctx=`Asservissement ${deX(C.s)} : procédé du premier ordre de gain statique K = ${nf(o.K,3)} ${C.Ku} ; correcteur PI ${F("u = Kp·ε + Ki·Σε")}, avec Ki = ${nf(o.Ki,3)} ${C.Kiu} (Σε, somme des écarts au cours du temps, en ${C.Su}). Consigne : ${nf(o.c,2)} ${C.u}. En régime permanent, l'erreur statique est nulle.`;
    return [{fig,ctx,q:"Quelle commande faut-il en régime permanent pour que la sortie soit égale à la consigne ?",type:"num",ans:ui,tolR:0.02,unit:"V",
        expl:`En régime permanent, ${C.y} = K·u. Pour ${C.y} = ${nf(o.c,2)} ${C.u} : ${F(`u = ${FRAC("consigne","K")}`)} = ${FRAC(nf(o.c,2),nf(o.K,3))} = ${U(ui,"V")}.`},
      {ctx,q:"Quelle part de cette commande le terme proportionnel Kp·ε fournit-il ?",type:"ch",...mc("Aucune : l'écart est nul, c'est le terme intégral qui fournit toute la commande",["Toute la commande","La moitié de la commande","Elle dépend de la valeur de Kp"]),
        expl:`ε = 0, donc Kp·ε = 0 : ${F("le terme intégral")} Ki·Σε fournit toute la commande, grâce aux écarts accumulés pendant le régime transitoire.`},
      {ctx:`${ctx} Commande en régime permanent : ${nf(ui,3)} V.`,q:"Que vaut alors la somme des écarts Σε ?",type:"num",ans:Sm,tolR:0.02,unit:C.Su,
        expl:`${F("Ki·Σε = u")}, donc Σε = ${FRAC(nf(ui,3),nf(o.Ki,3))} = ${U(Sm,C.Su)}.`}]; },
  /* P, PI ou PID : choix sous trois exigences */
  ()=>{ const S=rnd([SR[0],SR[1],SR[5]]);
    const o=draw(()=>{ const c=rnd(S.c), T=rnd(S.t5)/1.6; return {c,T}; },()=>true);
    const tm=6*o.T, P=simPID(o.c,o.T,8,0,0,tm), PI=simPID(o.c,o.T,8,8,0,tm), PID=simPID(o.c,o.T,8,8,1.2,tm), R=[P,PI,PID], N=["P","PI","PID"];
    R.forEach(r=>{ r.sfr=r2(r.sf,S.d); r.pkr=r.pk?r2(r.pk,S.d):null; r.es=(o.c-r.sfr)/o.c*100; r.D=r.pkr?(r.pkr-r.sfr)/r.sfr*100:0; r.t5r=+r.t5.toPrecision(2); });
    const XT=+(Math.max(PI.t5r,PID.t5r)*rnd([1.2,1.4])).toPrecision(2), A=axR(tm,PI.pk*1.08);
    const fig=figR(S,A,{c:R.map((r,i)=>({f:r.f,lab:N[i],k:i,dash:[null,"8 4","2 3"][i]})),cons:o.c});
    const data=tab(["Correcteur","Valeur finale","Premier pic","t5%"],R.map((r,i)=>[N[i],vu(S,r.sfr),r.pkr?vu(S,r.pkr):"aucun",`${nf(r.t5r,2)} ${S.tu}`]));
    const ctx=`Trois correcteurs essayés ${deX(S.nm)} (consigne ${vu(S,o.c)}), avec le même gain Kp. Exigences : erreur statique au plus 5 % ; dépassement au plus 20 % ; temps de réponse à 5 % au plus ${nf(XT,2)} ${S.tu}.`;
    return [{fig,data,ctx,q:"Calcule l'erreur statique relative obtenue avec le correcteur P.",type:"num",ans:P.es,tolR:0.02,unit:"%",
        expl:`${F(EPC)} = ${FRAC(`|${nf(o.c,S.d)} − ${nf(P.sfr,S.d)}|`,nf(o.c,S.d))} × 100 = ${U(P.es,"%")} : c'est plus que 5 %.`},
      {fig,data,ctx,q:"Quel correcteur faut-il retenir ?",type:"ch",ch:["Le correcteur P","Le correcteur PI","Le correcteur PID"],ok:2,
        expl:`P : εs = ${nf(P.es,1)} % &gt; 5 %, rejeté. PI : εs = 0, mais D = ${nf(PI.D,1)} % &gt; 20 %, rejeté. PID : εs = 0, D = ${nf(PID.D,1)} % ≤ 20 % et t5% = ${nf(PID.t5r,2)} ${S.tu} ≤ ${nf(XT,2)} ${S.tu} : on retient le ${F("correcteur PID")}.`},
      {fig,data,ctx,q:"Quelle action du PID a permis de réduire le dépassement par rapport au PI ?",type:"ch",...mc("L'action dérivée",["L'action intégrale","L'action proportionnelle","Aucune : le dépassement est dû au capteur"]),
        expl:`Le PI et le PID ont les mêmes Kp et Ki ; seule ${F("l'action dérivée")} les distingue. Elle freine la sortie quand elle s'approche vite de la consigne, ce qui améliore l'amortissement. L'action intégrale, elle, annule l'erreur statique.`}]; }
];

POOLS["auto-correcteur"]={
  titre:"Correcteurs P, PI, PID",
  fiche:{t:"Correcteurs P, PI, PID",l:[
    `Le correcteur reçoit ${F("l'écart ε")} et élabore la commande ; P : ${F("u = Kp·ε")} ; PI : ${F("u = Kp·ε + Ki·Σε")} (Σε : somme des écarts).`,
    `Augmenter Kp : ${F("plus rapide")} et ${F("erreur statique plus faible")}, mais ${F("plus de dépassement")}, jusqu'à l'instabilité.`,
    `Action intégrale : ${F("erreur statique nulle")} pour une consigne constante ; action dérivée : ${F("meilleur amortissement")}.`,
    `Premier ordre K, τ et correcteur P, retour unitaire : ${F(`${KBF} = ${FRAC(KBO,`1 + ${KBO}`)}`)} ; ${F(`εs = ${FRAC("1",`1 + ${KBO}`)}`)} ; ${F(`${TBF} = ${FRAC("τ",`1 + ${KBO}`)}`)}.`,
    `Pièges : doubler Kp ${F("ne divise pas εs par 2")} ; commande limitée par l'alimentation : ${F("saturation")}, le modèle linéaire ne s'applique plus ; un gain trop grand rend la boucle instable.`]},
  count:{1:4,2:4,3:3},1:CO1,2:CO2,3:CO3};

})();
