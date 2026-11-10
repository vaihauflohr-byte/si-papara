/* ======================================================================
   v2 · 2e loi de Newton (phy-newton) : bilan des forces à lire sur un schéma, documents, conclusions rédigées.
   Les questions de cours sans calcul (somme des forces nulle, sens de l'accélération, unité, référentiel…) sont gardées au niveau 1.
   ====================================================================== */
{
const sb=(b,i)=>`${b}<sub>${i}</sub>`, G0=9.81, sat=b=>b?"est satisfaite":"n'est pas satisfaite", U=(x,u)=>F(`${S3(x)}${u?" "+u:""}`);
const tirer=(gen,ok)=>{ for(let i=0;i<2000;i++){ const v=gen(); if(ok(v)) return v; } throw new Error("tirage impossible"); };
const loin=(x,ref,r)=>Math.abs(x-ref)/Math.abs(ref)>=r;
const trou=(ok,wrong,m)=>{ const o=shuffle([...new Set([ok,...wrong])]); return {o,ok:o.indexOf(ok),m}; };
const dgs=(ans,l)=>l.filter((d,i)=>d.v>0&&Math.abs(d.v-ans)>0.03*Math.abs(ans)&&l.findIndex(e=>Math.abs(e.v-d.v)<=1e-9*Math.abs(d.v))===i);
const GTXT="On prend g = 9,81 N/kg.";
/* flèche de force avec sa pointe, dans une couleur du thème (accent, coulomb, ink-2) */
const fl=(x1,y1,x2,y2,c)=>{ const a=Math.atan2(y2-y1,x2-x1), h=10, bx=x2-h*Math.cos(a), by=y2-h*Math.sin(a), p=s=>`${(bx+s*4.5*Math.sin(a)).toFixed(1)},${(by-s*4.5*Math.cos(a)).toFixed(1)}`;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" style="stroke:var(--${c});stroke-width:2.6;fill:none"/><polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p(1)} ${p(-1)}" style="fill:var(--${c})"/>`; };
/* Schéma des forces sur un chariot, sur le plat ou sur une pente (dessin sans échelle).
   o.F, o.R, o.P, o.N : textes des étiquettes (rien = force non dessinée) ; o.pente : texte de l'angle ; o.mv : flèche « sens du mouvement » */
function d2Forces(o){
  const al=o.pente?14*Math.PI/180:0, O=[46,o.pente?176:150], u=[Math.cos(al),-Math.sin(al)], n=[-Math.sin(al),-Math.cos(al)], pt=(s,h)=>[O[0]+s*u[0]+h*n[0],O[1]+s*u[1]+h*n[1]], G=pt(168,30);
  let s=L(O[0],O[1],...pt(322,0),"v-ink");
  if(o.pente){ s+=L(O[0],O[1],O[0]+312,O[1],"v-dash")+`<path d="M${O[0]+70} ${O[1]} A70 70 0 0 0 ${(O[0]+70*u[0]).toFixed(1)} ${(O[1]+70*u[1]).toFixed(1)}" class="v-cote"/>`+T(O[0]+78,O[1]-6,o.pente,"v-lab s"); }
  s+=`<g transform="translate(${G[0].toFixed(1)},${G[1].toFixed(1)}) rotate(${(-al*180/Math.PI).toFixed(1)})"><rect x="-46" y="-18" width="92" height="36" rx="5" class="v-block"/><circle cx="-27" cy="20" r="10" class="v-wheel"/><circle cx="27" cy="20" r="10" class="v-wheel"/><circle cx="0" cy="0" r="2.6" class="v-pt"/></g>`+T(G[0]-8,G[1]-5,"G","v-cap","end");
  if(o.F){ const a=pt(216,30), b=pt(286,30); s+=fl(a[0],a[1],b[0],b[1],"accent")+T(a[0]+4,a[1]-12,o.F,"v-lab a","start"); }
  if(o.R){ const a=pt(120,30), b=pt(62,30); s+=fl(a[0],a[1],b[0],b[1],"coulomb")+T(a[0]-4,a[1]-12,o.R,"v-lab c","end"); }
  if(o.P){ s+=fl(G[0],G[1],G[0],G[1]+(o.pente?58:52),"ink-2")+T(G[0]+8,G[1]+(o.pente?56:50),o.P,"v-lab s"); }
  if(o.N){ const b=pt(168,92); s+=fl(G[0],G[1],b[0],b[1],"ink-2")+T(b[0]+8,b[1]+8,o.N,"v-lab s"); }
  if(o.mv){ const a=pt(140,o.pente?-16:-22), b=pt(210,o.pente?-16:-22); s+=L(a[0],a[1],b[0],b[1],"v-cote","d")+T(b[0]+6,b[1]+4,"sens du mouvement","v-cap"); }
  return svg(o.pente?210:196,s,o.label||"Schéma des forces sur le chariot");
}
/* Cabine suspendue à un câble : tension vers le haut, poids vers le bas */
function d2Cabine(o){
  let s=hatch(150,14,100)+L(200,14,200,70,"v-ink")+`<rect x="165" y="70" width="70" height="78" rx="4" class="v-block"/><circle cx="200" cy="109" r="2.6" class="v-pt"/>`+T(192,106,"G","v-cap","end");
  s+=fl(200,70,200,24,"accent")+T(210,40,o.T,"v-lab a")+fl(200,109,200,186,"ink-2")+T(210,182,o.P,"v-lab s");
  if(o.a) s+=fl(120,140,120,90,"coulomb")+T(112,118,o.a,"v-lab c","end");
  return svg(200,s,"Cabine suspendue à un câble : tension du câble vers le haut, poids vers le bas");
}
function hatch(x,y,w){ let s=L(x,y,x+w,y,"v-ink"); for(let k=6;k<w;k+=10) s+=L(x+k,y,x+k+7,y-8,"v-hatch"); return s; }
const figF=(n,titre,o)=>DOC(n,titre,d2Forces(o));
/* conclusion rédigée d'une étude, sur une exigence « au plus » : satisfaite si val ≤ lim */
const conclure=o=>{ const phm=o.ph.charAt(0).toLowerCase()+o.ph.slice(1), oui=o.val<=o.lim, mot=oui?"inférieur":"supérieur", V=`${S3(o.val)} ${o.u}`, Lm=`${nf(o.lim,3)} ${o.u}`, pg=oui?"plus petit":"plus grand";
  return {q:o.q,type:"red",don:o.don,
    ...mcw(`L'exigence ${o.exi} ${sat(oui)} : ${phm} ${V}, ${oui?"moins":"plus"} que la limite de ${Lm}.`,[
      [`L'exigence ${o.exi} ${sat(!oui)} : ${phm} ${V}, ${oui?"plus":"moins"} que la limite de ${Lm}.`,`compare les nombres : ${S3(o.val)} est ${pg} que ${nf(o.lim,3)}.`],
      [`L'exigence ${o.exi} ${sat(oui)}, car ${o.faux}.`,o.fauxW],
      [`On ne peut pas conclure : il manque une donnée.`,`les deux valeurs à comparer sont connues : ${V} (calculé) et ${Lm} (${o.ou}).`]]),
    elements:[{t:`Donne ${o.quoi} (environ ${V})`,p:1},{t:`Donne la valeur limite (${o.limTxt})`,p:1},{t:`Compare les deux valeurs`,p:1},{t:`Conclut que l'exigence ${o.exi} ${sat(oui)}`,p:2}],
    modele:`${o.ph} ${V}. C'est ${mot} ${o.aux||"à la limite de "+Lm} : l'exigence ${o.exi} ${sat(oui)}.`,
    iaPlus:`Résultat des questions précédentes : ${o.quoi} = ${V}. Valeur limite : ${o.limTxt}.`,
    expl:`${V} est ${mot} à ${Lm} : l'exigence ${o.exi} ${sat(oui)}.`,
    lire:o.lire,
    met:[`Une conclusion complète donne la valeur trouvée, la valeur limite, la comparaison, puis la réponse.`,`Valeur trouvée : ${F(V)}. Valeur limite : ${F(Lm)}.`,`${S3(o.val)} est ${pg} que ${nf(o.lim,3)} : l'exigence ${o.exi} ${sat(oui)}${oui?"":". "+o.remede}.`],
    piege:`Conclure sans citer les deux valeurs, ou comparer deux grandeurs qui n'ont pas la même unité.`,
    ret:`Conclure = la valeur trouvée, la valeur limite, la comparaison, la réponse.`}; };
const SYSN=[{n:"chariot de manutention",a:"Le chariot",le:"du chariot"},{n:"robot de livraison",a:"Le robot",le:"du robot"},{n:"fauteuil roulant électrique",a:"Le fauteuil",le:"du fauteuil"},{n:"kart électrique",a:"Le kart",le:"du kart"}];
const tirFR=()=>tirer(()=>{ const Fm=rnd([200,250,300,400,500,600,800]), R=rnd([40,50,60,80,100,120,150]), m=rnd([80,100,120,150,200,250,300,400]); return {Fm,R,m,a:(Fm-R)/m}; },o=>o.Fm-o.R>=0.25*o.Fm&&o.a>=0.3&&o.a<=3);

const N2N1=[
  /* n0 · somme des forces dans la direction du mouvement, lue sur le schéma */
  ()=>{ const {Fm,R}=tirFR(), s=rnd(SYSN), S=Fm-R, don=`schéma : F = ${Fm} N vers l'avant ; R = ${R} N vers l'arrière`;
    return {fig:figF(1,`forces exercées sur le ${s.n}, en ligne droite sur le plat`,{F:`F = ${Fm} N`,R:`R = ${R} N`,P:"P",N:"N",mv:1}),don,
      q:`Sur la figure 1, F est la force motrice et R la somme des résistances. Détermine la somme des forces dans la direction du mouvement.`,type:"num",ans:S,tolR:0.005,unit:"N",
      expl:`F et R sont de sens contraires : ${F(`ΣF = F − R = ${Fm} − ${R}`)} = ${U(S,"N")}.`,
      lire:`Figure 1 : F = ${Fm} N vers l'avant, R = ${R} N vers l'arrière. P et N sont verticales : elles se compensent.`,
      met:[`On choisit le sens du mouvement comme sens positif.`,`F est dans ce sens (on la compte +), R est dans l'autre sens (on la compte −).`,`${F(`ΣF = F − R = ${Fm} − ${R} = ${S} N`)}.`],
      piege:`Ajouter les deux valeurs : deux forces de sens contraires se retranchent.`,
      ret:`Sur un axe, une force dans le sens positif se compte +, une force dans l'autre sens se compte −.`,
      diag:dgs(S,[{v:Fm+R,m:`tu as ajouté les deux forces. Elles sont de sens contraires : on retranche R.`},{v:Fm,m:`tu as oublié les résistances R : elles s'opposent au mouvement.`},{v:R,m:`tu as donné R seule. La somme des forces vaut F − R.`}])}; },
  /* n1 · poids à partir de la masse lue dans les caractéristiques */
  ()=>{ const s=rnd(SYSN), mv=rnd([35,48,60,75,90,110]), ch=rnd([20,40,60,80,100,120]), m=mv+ch, P=m*G0;
    return {fig:DOC(1,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse à vide",`${mv} kg`],["Charge transportée",`${ch} kg`],["Vitesse maximale",`${rnd([6,8,10,12])} km/h`]]})),don:`masse à vide ${mv} kg ; charge ${ch} kg ; g = 9,81 N/kg`,
      q:`À l'aide de la figure 1, détermine le poids ${s.le} chargé. ${GTXT}`,type:"num",ans:P,tolR:0.005,unit:"N",
      expl:`${F(`m = ${mv} + ${ch} = ${m} kg`)} ; ${F("P = m·g")} = ${m} × 9,81 = ${U(P,"N")}.`,
      lire:`Figure 1 : masse à vide ${mv} kg et charge ${ch} kg. La vitesse ne sert pas ici.`,
      met:[`Masse totale : ${F(`m = ${mv} + ${ch} = ${m} kg`)}.`,`Le poids est une force, en newtons : ${F("P = m·g")}.`,`${F(`P = ${m} × 9,81 = ${S3(P)} N`)}.`],
      piege:`Donner la masse en kilogrammes : le poids est une force, en newtons.`,
      ret:`${F("P = m·g")} : m en kg, g en N/kg, P en N.`,
      diag:dgs(P,[{v:m,m:`tu as donné la masse, en kilogrammes. Le poids vaut m × g, en newtons.`},{v:mv*G0,m:`tu as oublié la charge transportée : le véhicule est chargé.`},{v:m/G0,m:`tu as divisé par g. Le poids vaut m × g.`},{v:m*10,m:`tu as pris g = 10 N/kg. L'énoncé demande 9,81 N/kg.`}])}; },
  /* n2 · le schéma des forces donne la nature du mouvement */
  ()=>{ const k=rnd([0,1,2]), s=rnd(SYSN), R=rnd([60,80,100,120,150]), Fm=k===0?R+rnd([60,100,150,200]):k===1?R-rnd([20,30,40]):R;
    const C=[{t:`${s.a} accélère : la somme des forces est dans le sens du mouvement.`,w:`F et R n'ont pas des valeurs qui donnent une somme vers l'avant : compare F et R.`},{t:`${s.a} ralentit : la somme des forces est opposée au mouvement.`,w:`R n'est pas plus grande que F sur ce schéma : compare les deux valeurs.`},{t:`${s.a} garde une vitesse constante : la somme des forces est nulle.`,w:`F et R n'ont pas la même valeur : la somme des forces n'est pas nulle.`},{t:`${s.a} s'arrête tout de suite : une résistance s'exerce sur lui.`,w:`une résistance ne stoppe pas un véhicule d'un coup : elle modifie sa vitesse peu à peu, selon la somme des forces.`}];
    return {fig:figF(1,`forces exercées sur le ${s.n}, qui roule en ligne droite sur le plat`,{F:`F = ${Fm} N`,R:`R = ${R} N`,P:"P",N:"N",mv:1}),don:`schéma : F = ${Fm} N vers l'avant ; R = ${R} N vers l'arrière`,
      q:`À l'aide de la figure 1, que peut-on dire du mouvement ${s.le} ? Justifie.`,type:"ch",...mcw(C[k].t,C.filter((x,i)=>i!==k).map(x=>[x.t,x.w])),
      expl:`${F(`ΣF = F − R = ${Fm} − ${R} = ${Fm-R} N`)} : la somme des forces est ${k===0?"dans le sens du mouvement, le véhicule accélère":k===1?"opposée au mouvement, le véhicule ralentit":"nulle, la vitesse ne change pas"}.`,
      lire:`Figure 1 : F = ${Fm} N vers l'avant, R = ${R} N vers l'arrière.`,
      met:[`Calcule la somme des forces dans la direction du mouvement : ${F(`ΣF = F − R = ${Fm-R} N`)}.`,`2e loi de Newton : ${F("ΣF = m·a")}. L'accélération a le sens de la somme des forces.`,k===0?`ΣF est dans le sens du mouvement : la vitesse augmente.`:k===1?`ΣF est opposée au mouvement : la vitesse diminue.`:`ΣF = 0 donc a = 0 : la vitesse reste constante.`],
      piege:`Croire qu'il faut une force vers l'avant pour avancer à vitesse constante : à vitesse constante, la somme des forces est nulle.`,
      ret:`${F("ΣF = m·a")} : somme nulle = vitesse constante ; somme vers l'avant = accélération ; somme vers l'arrière = ralentissement.`}; },
  /* n3 · somme des forces nécessaire : masse dans les caractéristiques, accélération dans l'exigence */
  ()=>{ const s=rnd(SYSN), a=rnd([0.5,0.8,1,1.2,1.5,2]), m=rnd([60,80,100,120,150,200]), S=m*a;
    return {fig:DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Démarrage",txt:`${s.a} doit démarrer avec une accélération de ${nf(a)} m/s².`}]}))+DOC(2,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Tension de la batterie",`${rnd([24,36,48])} V`]]})),
      don:`exigence 1.1 : accélération ${nf(a)} m/s² ; masse ${m} kg`,q:`À l'aide des figures 1 et 2, détermine la somme des forces nécessaire pour obtenir l'accélération exigée.`,type:"num",ans:S,tolR:0.005,unit:"N",
      expl:`${F("ΣF = m·a")} = ${m} × ${nf(a)} = ${U(S,"N")}.`,
      lire:`Figure 1, exigence 1.1 : ${nf(a)} m/s². Figure 2 : masse ${m} kg. La tension ne sert pas ici.`,
      met:[`2e loi de Newton : ${F("ΣF = m·a")}.`,`${F(`ΣF = ${m} × ${nf(a)} = ${S3(S)} N`)}.`],
      piege:`Diviser la masse par l'accélération, ou utiliser le poids à la place de la masse.`,
      ret:`${F("ΣF = m·a")} : m en kg, a en m/s², ΣF en N.`,
      diag:dgs(S,[{v:m/a,m:`tu as divisé la masse par l'accélération. La 2e loi de Newton donne ΣF = m × a.`},{v:m*G0,m:`tu as calculé le poids (m × g). La question demande la somme des forces qui donne l'accélération : m × a.`},{v:m*G0*a,m:`tu as utilisé le poids à la place de la masse. Dans ΣF = m·a, m est en kilogrammes.`}])}; },
  /* n4 · reconnaître une conclusion complète */
  ()=>{ const c=rnd([{d:"du diagramme des exigences d'un monte-charge",nom:"Sécurité du câble",ex:x=>`La tension du câble ne doit pas dépasser ${x} N.`,g:"Tension calculée au démarrage",u:"N",L:[5000,6000,8000,10000],ph:v=>`Au démarrage, la tension du câble vaut ${v} N`},
      {d:"du diagramme des exigences d'un robot de livraison",nom:"Motorisation",ex:x=>`La force motrice nécessaire ne doit pas dépasser ${x} N.`,g:"Force motrice calculée dans la pente",u:"N",L:[150,200,250,300],ph:v=>`Dans la pente, il faut une force motrice de ${v} N`},
      {d:"du diagramme des exigences d'une navette autonome",nom:"Freinage d'urgence",ex:x=>`La navette doit s'arrêter sur moins de ${x} m.`,g:"Distance de freinage calculée",u:"m",L:[6,8,10,12],ph:v=>`La navette s'arrête sur ${v} m`}]);
    const X=rnd(c.L), oui=Math.random()<.5, val=Number((X*(oui?rnd([.72,.8,.86]):rnd([1.14,1.22,1.3]))).toPrecision(3)), v=nf(val,3), x=nf(X,0), mot=oui?"inférieur":"supérieur";
    return {fig:DOC(1,`extrait ${c.d}`,d2Exig({reqs:[{id:"1.1",nom:c.nom,txt:c.ex(x)}]}))+DOC(2,"résultat de l'étude",d2Fiche({lignes:[[c.g,`${v} ${c.u}`]]})),
      q:`Quatre élèves concluent sur l'exigence 1.1. Quelle copie donne une conclusion complète et juste ?`,type:"ch",
      ...mcw(`« ${c.ph(v)}. C'est ${mot} à la limite de ${x} ${c.u} : l'exigence 1.1 ${sat(oui)}. »`,[
        [`« L'exigence 1.1 ${sat(oui)}. »`,`la réponse est juste, mais aucune valeur ne la justifie. À l'écrit, une conclusion sans nombres ne rapporte pas tous les points.`],
        [`« ${c.ph(v)} et l'exigence 1.1 fixe la limite à ${x} ${c.u}. »`,`les deux valeurs sont citées, mais la copie ne les compare pas et ne dit pas si l'exigence est satisfaite.`],
        [`« ${c.ph(v)}. C'est ${mot} à la limite de ${x} ${c.u} : l'exigence 1.1 ${sat(!oui)}. »`,`la comparaison est juste, mais la réponse la contredit : ${v} ${c.u} ${oui?"reste sous":"dépasse"} la limite de ${x} ${c.u}.`]]),
      don:`exigence 1.1 : ${X} ${c.u} au plus ; valeur calculée ${v} ${c.u}`,
      expl:`${v} ${c.u} est ${mot} à ${x} ${c.u} : l'exigence 1.1 ${sat(oui)}. La bonne copie donne les deux valeurs, les compare et répond.`,
      lire:`Figure 1, exigence 1.1 : ${x} ${c.u} au plus. Figure 2 : valeur calculée, ${v} ${c.u}.`,
      met:[`Une conclusion complète contient quatre choses : la valeur trouvée, la valeur exigée, la comparaison, la réponse.`,`Valeur trouvée : ${F(`${v} ${c.u}`)}. Valeur exigée : ${F(`${x} ${c.u}`)} au plus.`,`${v} est ${oui?"plus petit":"plus grand"} que ${x} : l'exigence 1.1 ${sat(oui)}.`],
      piege:`Répondre « oui » ou « non » sans les nombres : la réponse peut être juste, elle n'est pas justifiée.`,
      ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}; }
];

const N2N2=[
  /* m0 · sur le plat : somme des forces lue sur le schéma, puis accélération */
  ()=>{ const {Fm,R,m,a}=tirFR(), s=rnd(SYSN), S=Fm-R, don=`schéma : F = ${Fm} N vers l'avant ; R = ${R} N vers l'arrière ; masse ${m} kg`;
    const fig=figF(1,`forces exercées sur le ${s.n} au démarrage, sur le plat`,{F:`F = ${Fm} N`,R:`R = ${R} N`,P:"P",N:"N",mv:1})+DOC(2,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Diamètre des roues",`${rnd([200,250,300])} mm`]]}));
    return [{fig,don,q:`Sur la figure 1, F est la force motrice et R la somme des résistances. Détermine la somme des forces ΣF dans la direction du mouvement.`,nom:"ΣF",type:"num",ans:S,tolR:0.005,unit:"N",
        expl:`${F(`ΣF = F − R = ${Fm} − ${R}`)} = ${U(S,"N")}.`,
        lire:`Figure 1 : F = ${Fm} N vers l'avant, R = ${R} N vers l'arrière. P et N sont verticales : elles se compensent.`,
        met:[`On choisit le sens du mouvement comme sens positif : F se compte +, R se compte −.`,`${F(`ΣF = F − R = ${Fm} − ${R} = ${S} N`)}.`],
        piege:`Ajouter les deux valeurs : deux forces de sens contraires se retranchent.`,
        ret:`Sur un axe, une force dans le sens positif se compte +, une force dans l'autre sens se compte −.`,
        diag:dgs(S,[{v:Fm+R,m:`tu as ajouté les deux forces. Elles sont de sens contraires : on retranche R.`},{v:Fm,m:`tu as oublié les résistances R : elles s'opposent au mouvement.`}])},
      {q:`À l'aide de la figure 2, déduis-en l'accélération a ${s.le}.`,nom:"a",type:"num",ans:a,tolR:0.01,unit:"m/s²",don,
        expl:`${F(`a = ${FRAC("ΣF","m")}`)} = ${FRAC(S,m)} = ${U(a,"m/s²")}.`,
        lire:`Figure 2 : masse en charge ${m} kg. Question précédente : ${F(`ΣF = ${S} N`)}.`,
        met:[`2e loi de Newton : ${F("ΣF = m·a")}, donc ${F(`a = ${FRAC("ΣF","m")}`)}.`,`${F(`a = ${FRAC(S,m)} = ${S3(a)} m/s²`)}.`],
        piege:`Diviser la force motrice seule par la masse : c'est la somme des forces qui donne l'accélération.`,
        ret:`${F(`a = ${FRAC("ΣF","m")}`)} : ΣF en N, m en kg, a en m/s².`,
        diag:dgs(a,[{v:Fm/m,m:`tu as divisé la force motrice seule par la masse. C'est la somme des forces (F − R) qui donne l'accélération.`},{v:S*m,m:`tu as multiplié par la masse. On isole a : on divise la somme des forces par la masse.`},{v:m/S,m:`tu as divisé la masse par la somme des forces. C'est l'inverse.`},{v:S/(m*G0),m:`tu as divisé par le poids. Dans ΣF = m·a, m est la masse, en kilogrammes.`}])}]; },
  /* m1 · accélération exigée : somme des forces, force motrice nécessaire, puis conclusion à compléter sur le moteur */
  ()=>{ const o=tirer(()=>{ const a=rnd([0.5,0.8,1,1.2,1.5,2]), m=rnd([60,80,100,120,150,200]), R=rnd([20,30,40,50,60,80]), S=m*a, Fn=S+R, Fx=rnd([80,100,120,150,200,250,300,400,500]); return {a,m,R,S,Fn,Fx}; },o=>loin(o.Fn,o.Fx,0.1)&&o.Fn<1.8*o.Fx&&o.Fn>o.Fx/1.8);
    const {a,m,R,S,Fn,Fx}=o, s=rnd(SYSN), oui=Fn<=Fx;
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Démarrage",txt:`${s.a} doit démarrer avec une accélération de ${nf(a)} m/s².`}]}))+
      figF(2,`forces exercées sur le ${s.n} au démarrage, sur le plat`,{F:"F = ?",R:`R = ${R} N`,P:"P",N:"N",mv:1})+
      DOC(3,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Force motrice maximale aux roues",`${Fx} N`]]}));
    const don=`exigence 1.1 : accélération ${nf(a)} m/s² ; masse ${m} kg ; schéma : R = ${R} N vers l'arrière ; force motrice maximale ${Fx} N`;
    return [{fig,don,q:`À l'aide des figures 1 et 3, détermine la somme des forces ΣF nécessaire pour obtenir l'accélération exigée.`,nom:"ΣF",type:"num",ans:S,tolR:0.005,unit:"N",
        expl:`${F("ΣF = m·a")} = ${m} × ${nf(a)} = ${U(S,"N")}.`,
        lire:`Figure 1, exigence 1.1 : ${nf(a)} m/s². Figure 3 : masse en charge ${m} kg.`,
        met:[`2e loi de Newton : ${F("ΣF = m·a")}.`,`${F(`ΣF = ${m} × ${nf(a)} = ${S3(S)} N`)}.`],
        piege:`Utiliser le poids à la place de la masse.`,
        ret:`${F("ΣF = m·a")} : m en kg, a en m/s², ΣF en N.`,
        diag:dgs(S,[{v:m/a,m:`tu as divisé la masse par l'accélération. La 2e loi de Newton donne ΣF = m × a.`},{v:m*G0,m:`tu as calculé le poids. La somme des forces qui donne l'accélération vaut m × a.`},{v:Fx,m:`tu as recopié la force motrice maximale. La question demande la somme des forces nécessaire : m × a.`}])},
      {q:`À l'aide de la figure 2, déduis-en la force motrice F nécessaire.`,nom:"F",type:"num",ans:Fn,tolR:0.005,unit:"N",don,
        expl:`${F("ΣF = F − R")}, donc ${F(`F = ΣF + R = ${S3(S)} + ${R}`)} = ${U(Fn,"N")}.`,
        lire:`Figure 2 : R = ${R} N, opposée au mouvement. Question précédente : ${F(`ΣF = ${S3(S)} N`)}.`,
        met:[`Dans la direction du mouvement : ${F("ΣF = F − R")}.`,`On isole F : ${F("F = ΣF + R")}. Le moteur doit vaincre les résistances et, en plus, accélérer le véhicule.`,`${F(`F = ${S3(S)} + ${R} = ${S3(Fn)} N`)}.`],
        piege:`Retrancher R : les résistances s'ajoutent à ce que le moteur doit fournir.`,
        ret:`Pour accélérer : ${F("F = m·a + R")}.`,
        diag:dgs(Fn,[{v:S,m:`tu as oublié les résistances. Le moteur doit fournir m·a et, en plus, vaincre R.`},{v:S-R,m:`tu as retranché R. Les résistances s'opposent au mouvement : le moteur doit fournir ΣF + R.`},{v:R,m:`tu as donné R seule. La force motrice vaut ΣF + R.`}])},
      {q:`À l'aide de la figure 3, complète la conclusion sur le choix du moteur.`,type:"trous",don,
        phr:[`Pour démarrer avec l'accélération exigée, il faut une force motrice de `,trou(`${S3(Fn)} N`,[`${S3(S)} N`,`${R} N`],`La valeur à citer est la force motrice que tu viens de calculer : ${S3(Fn)} N.`),`. C'est `,
          trou(oui?"inférieur":"supérieur",[oui?"supérieur":"inférieur"],`Compare les deux valeurs : ${S3(Fn)} est ${oui?"plus petit":"plus grand"} que ${Fx}.`),` à la force motrice maximale (${Fx} N) : l'exigence 1.1 `,
          trou(oui?"est":"n'est pas",[oui?"n'est pas":"est"],`Le moteur fournit au plus ${Fx} N : avec ${S3(Fn)} N à fournir, l'exigence 1.1 ${sat(oui)}.`),` satisfaite.`],
        expl:`${S3(Fn)} N est ${oui?"inférieur":"supérieur"} à ${Fx} N : l'exigence 1.1 ${sat(oui)}.`,
        lire:`Figure 3 : force motrice maximale ${Fx} N. Question précédente : ${S3(Fn)} N.`,
        met:[`Une conclusion complète donne la valeur trouvée, la valeur limite, la comparaison, puis la réponse.`,`Force nécessaire : ${F(`${S3(Fn)} N`)}. Force maximale : ${F(`${Fx} N`)}.`,`${S3(Fn)} est ${oui?"plus petit":"plus grand"} que ${Fx} : l'exigence 1.1 ${sat(oui)}${oui?"":". Il faudrait un moteur plus fort, ou un véhicule plus léger"}.`],
        piege:`Comparer la somme des forces (m·a) à la force maximale : c'est la force motrice, résistances comprises, qu'il faut comparer.`,
        ret:`Conclure = la valeur trouvée, la valeur limite, la comparaison, la réponse.`}]; },
  /* m2 · pente à vitesse constante : composante du poids le long de la pente, puis force motrice */
  ()=>{ const al=rnd([3,4,5,6,8,10,12]), m=rnd([60,80,100,120,150,200,250]), R=rnd([15,20,30,40,50]), s=rnd(SYSN), Px=m*G0*Math.sin(al*Math.PI/180), Fn=Px+R;
    const fig=figF(1,`forces exercées sur le ${s.n}, qui monte la pente à vitesse constante`,{F:"F",R:`R = ${R} N`,P:"P",N:"N",pente:`α = ${al}°`,mv:1})+DOC(2,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Vitesse dans la pente",`${rnd([3,4,5,6])} km/h`]]}));
    const don=`pente α = ${al}° ; masse ${m} kg ; R = ${R} N ; g = 9,81 N/kg`;
    return [{fig,don,q:`À l'aide des figures 1 et 2, détermine la composante du poids parallèle à la pente, notée ${sb("P","x")}. ${GTXT}`,nom:sb("P","x"),type:"num",ans:Px,tolR:0.01,unit:"N",
        expl:`${F("P<sub>x</sub> = m·g·sin α")} = ${m} × 9,81 × sin ${al}° = ${U(Px,"N")}.`,
        lire:`Figure 1 : pente d'angle α = ${al}°. Figure 2 : masse en charge ${m} kg.`,
        met:[`Le poids est vertical : ${F(`P = m·g = ${m} × 9,81 = ${S3(m*G0)} N`)}.`,`Sur une pente d'angle α, la part du poids qui tire le véhicule vers le bas de la pente vaut ${F("P<sub>x</sub> = m·g·sin α")}.`,`${F(`P<sub>x</sub> = ${S3(m*G0)} × sin ${al}° = ${S3(Px)} N`)}.`],
        piege:`Prendre le cosinus : m·g·cos α est la part du poids qui appuie sur la pente, pas celle qui retient le véhicule.`,
        ret:`Sur une pente d'angle α : ${F("P<sub>x</sub> = m·g·sin α")} le long de la pente.`,
        diag:dgs(Px,[{v:m*G0*Math.cos(al*Math.PI/180),m:`tu as pris le cosinus : c'est la part du poids perpendiculaire à la pente. Le long de la pente, on prend le sinus.`},{v:m*G0,m:`tu as donné le poids entier. Seule une part du poids agit le long de la pente : multiplie par sin α.`},{v:m*Math.sin(al*Math.PI/180),m:`tu as oublié g : le poids vaut m × g.`},{v:Math.abs(m*G0*Math.sin(al)),m:`ta calculatrice est en radians. Mets-la en degrés pour calculer sin ${al}°.`}])},
      {q:`Le véhicule monte à vitesse constante. Déduis-en la force motrice F nécessaire.`,nom:"F",type:"num",ans:Fn,tolR:0.01,unit:"N",don,
        expl:`Vitesse constante : ΣF = 0, donc ${F(`F = P<sub>x</sub> + R = ${S3(Px)} + ${R}`)} = ${U(Fn,"N")}.`,
        lire:`Figure 1 : R = ${R} N, opposée au mouvement. Question précédente : ${F(`P<sub>x</sub> = ${S3(Px)} N`)}.`,
        met:[`À vitesse constante, l'accélération est nulle : la somme des forces le long de la pente est nulle.`,`Vers le haut de la pente : F. Vers le bas : ${sb("P","x")} et R. Donc ${F("F − P<sub>x</sub> − R = 0")}.`,`${F(`F = P<sub>x</sub> + R = ${S3(Px)} + ${R} = ${S3(Fn)} N`)}.`],
        piege:`Oublier les résistances R, ou croire qu'à vitesse constante il ne faut aucune force.`,
        ret:`Vitesse constante : ΣF = 0. Les forces qui poussent compensent celles qui retiennent.`,
        diag:dgs(Fn,[{v:Px,m:`tu as oublié les résistances R : elles s'opposent aussi à la montée.`},{v:Px-R,m:`tu as retranché R. Dans la montée, R et la composante du poids retiennent toutes les deux le véhicule : elles s'ajoutent.`},{v:m*G0+R,m:`tu as pris le poids entier. Le long de la pente, seule la composante m·g·sin α compte.`}])}]; },
  /* m3 · courbe v(t) d'un démarrage : accélération, somme des forces, puis phase à vitesse constante */
  ()=>{ const t1=rnd([2,3,4,5]), t2=t1+rnd([3,4,5]), pet=Math.random()<.5, V=pet?rnd([0.4,0.6,0.8,1,1.2]):rnd([1.5,2,2.5,3]), ys=pet?0.2:0.5, m=rnd([80,100,150,200,300,500]), a=V/t1, S=m*a, s=rnd(SYSN);
    const fig=DOC(1,`vitesse ${s.le} pendant un démarrage en ligne droite`,d2Courbe({pts:[[0,0],[t1,V],[t2,V]],xm:t2+1,ym:Number((V+ys).toFixed(1)),xs:1,ys,xl:"t (s)",yl:"v (m/s)",label:"Vitesse en fonction du temps : une montée puis un palier"}))+DOC(2,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Autonomie",`${rnd([2,4,6,8])} h`]]}));
    const don=`courbe v(t) : départ arrêté ; ${nf(V)} m/s à ${t1} s, puis vitesse constante jusqu'à ${t2} s ; masse ${m} kg`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine l'accélération a ${s.le} pendant le démarrage.`,nom:"a",type:"num",ans:a,tolR:0.015,unit:"m/s²",
        expl:`${F(`a = ${FRAC("Δv","Δt")}`)} = ${FRAC(nf(V),t1)} = ${U(a,"m/s²")}.`,
        lire:`Figure 1 : pendant le démarrage, la vitesse passe de 0 à ${nf(V)} m/s en ${t1} s.`,
        met:[`L'accélération est la pente de la courbe v(t) : ${F(`a = ${FRAC("Δv","Δt")}`)}.`,`${F(`a = ${FRAC(nf(V),t1)} = ${S3(a)} m/s²`)}.`],
        piege:`Diviser par la durée de toute la mesure : seule la durée du démarrage compte.`,
        ret:`Accélération = pente de v(t).`,
        diag:dgs(a,[{v:V/t2,m:`tu as divisé par ${t2} s, la durée de toute la mesure. Le démarrage ne dure que ${t1} s.`},{v:V*t1,m:`tu as multiplié la vitesse par la durée. L'accélération est une pente : on divise.`},{v:V,m:`tu as donné la vitesse atteinte. L'accélération est la variation de vitesse divisée par la durée.`}])},
      {q:`À l'aide de la figure 2, déduis-en la somme des forces ΣF exercées sur le véhicule pendant le démarrage.`,nom:"ΣF",type:"num",ans:S,tolR:0.015,unit:"N",don,
        expl:`${F("ΣF = m·a")} = ${m} × ${S3(a)} = ${U(S,"N")}.`,
        lire:`Figure 2 : masse en charge ${m} kg. Question précédente : ${F(`a = ${S3(a)} m/s²`)}.`,
        met:[`2e loi de Newton : ${F("ΣF = m·a")}.`,`${F(`ΣF = ${m} × ${S3(a)} = ${S3(S)} N`)}.`],
        piege:`Calculer le poids (m × g) : la question demande la somme des forces, m × a.`,
        ret:`${F("ΣF = m·a")}.`,
        diag:dgs(S,[{v:m*G0,m:`tu as calculé le poids. La somme des forces vaut m × a.`},{v:m*V,m:`tu as multiplié la masse par la vitesse. Dans la 2e loi de Newton, c'est l'accélération qui compte.`},{v:m/a,m:`tu as divisé la masse par l'accélération. ΣF = m × a.`}])},
      {q:`Entre ${t1} s et ${t2} s, que vaut la somme des forces exercées sur le véhicule ? Justifie avec la figure 1.`,type:"ch",don,
        ...mcw(`Elle est nulle : la vitesse est constante, donc l'accélération est nulle.`,[[`Elle vaut encore ${S3(S)} N : le véhicule avance toujours.`,`avancer ne demande pas une somme des forces non nulle. Entre ${t1} s et ${t2} s la vitesse ne change pas : a = 0, donc ΣF = 0.`],
          [`Elle est égale au poids du véhicule.`,`le poids est vertical et compensé par la réaction du sol. Dans la direction du mouvement, la vitesse ne change pas : ΣF = 0.`],
          [`Elle est dirigée vers l'arrière : le véhicule n'accélère plus.`,`une somme des forces vers l'arrière ferait ralentir le véhicule. Ici la vitesse reste constante.`]]),
        expl:`Entre ${t1} s et ${t2} s, la courbe est horizontale : a = 0, donc ΣF = m·a = 0. La force motrice compense exactement les résistances.`,
        lire:`Figure 1 : entre ${t1} s et ${t2} s, la courbe est horizontale.`,
        met:[`Courbe horizontale : la vitesse est constante, l'accélération est nulle.`,`2e loi de Newton : ${F("ΣF = m·a = 0")}.`,`Le moteur pousse encore, mais sa force compense exactement les résistances.`],
        piege:`Croire qu'il faut une somme des forces vers l'avant pour avancer. Elle ne sert qu'à changer la vitesse.`,
        ret:`Vitesse constante en ligne droite : ΣF = 0.`}]; },
  /* m4 · freinage : décélération nécessaire, puis force de freinage */
  ()=>{ const Vk=rnd([18,27,36,45,54]), t=rnd([2,2.5,3,4,5]), m=rnd([300,500,800,1200,1500,2800]), v=Vk/3.6, a=v/t, Ff=m*a, s=rnd([{n:"navette autonome",a:"La navette"},{n:"voiturette électrique",a:"La voiturette"},{n:"chariot de golf",a:"Le chariot"}]);
    const fig=DOC(1,`extrait du diagramme des exigences (${s.n})`,d2Exig({reqs:[{id:"1.1",nom:"Freinage",txt:`${s.a} doit pouvoir s'arrêter en ${nf(t)} s lorsqu'elle roule à ${Vk} km/h.`.replace("elle roule",s.a.startsWith("Le")?"il roule":"elle roule")}]}))+DOC(2,`caractéristiques (${s.n})`,d2Fiche({lignes:[["Masse en charge",`${nf(m,0)} kg`],["Nombre de places",`${rnd([2,4,6])}`]]}));
    const don=`exigence 1.1 : arrêt en ${nf(t)} s depuis ${Vk} km/h ; masse ${m} kg`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine la décélération nécessaire pour respecter l'exigence 1.1. Donne une valeur positive.`,nom:"décélération",type:"num",ans:a,tolR:0.01,unit:"m/s²",
        expl:`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)} ; ${FRAC("Δv","Δt")} = ${FRAC(S3(v),nf(t))} = ${U(a,"m/s²")}.`,
        lire:`Figure 1, exigence 1.1 : passer de ${Vk} km/h à l'arrêt en ${nf(t)} s.`,
        met:[`Convertis la vitesse en m/s : ${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`,`La vitesse passe de v à 0 en ${nf(t)} s : la décélération vaut ${FRAC("Δv","Δt")}.`,`${F(`${FRAC(S3(v),nf(t))} = ${S3(a)} m/s²`)}.`],
        piege:`Garder la vitesse en km/h.`,
        ret:`Décélération = variation de vitesse divisée par la durée, avec la vitesse en m/s.`,
        diag:dgs(a,[{v:Vk/t,m:`tu as gardé la vitesse en km/h. Convertis-la en m/s (divise par 3,6).`},{v:v*t,m:`tu as multiplié la vitesse par la durée. On divise la variation de vitesse par la durée.`},{v:t/v,m:`tu as divisé la durée par la vitesse. C'est l'inverse.`}])},
      {q:`À l'aide de la figure 2, déduis-en la force de freinage nécessaire. On néglige les autres résistances.`,nom:"force de freinage",type:"num",ans:Ff,tolR:0.01,unit:"N",don,
        expl:`${F("F = m·a")} = ${nf(m,0)} × ${S3(a)} = ${U(Ff,"N")}.`,
        lire:`Figure 2 : masse en charge ${nf(m,0)} kg. Question précédente : ${S3(a)} m/s².`,
        met:[`Pendant le freinage, la seule force dans la direction du mouvement est la force de freinage.`,`2e loi de Newton : ${F("F = m·a")}.`,`${F(`F = ${nf(m,0)} × ${S3(a)} = ${S3(Ff)} N`)}.`],
        piege:`Utiliser le poids à la place de la masse.`,
        ret:`${F("ΣF = m·a")} : pour freiner plus fort ou un véhicule plus lourd, il faut plus de force.`,
        diag:dgs(Ff,[{v:m*G0,m:`tu as calculé le poids. La force de freinage vaut m × a.`},{v:m*v,m:`tu as multiplié la masse par la vitesse. Dans la 2e loi de Newton, c'est la décélération qui compte.`},{v:m/a,m:`tu as divisé la masse par la décélération. F = m × a.`}])}]; },
  /* m5 · cabine suspendue : poids, puis tension du câble au démarrage en montée */
  ()=>{ const m=rnd([400,500,630,800,1000,1200]), a=rnd([0.5,0.8,1,1.2,1.5]), P=m*G0, Tn=m*(G0+a);
    const fig=DOC(1,"forces exercées sur la cabine du monte-charge, au démarrage en montée",d2Cabine({T:"T",P:"P",a:"a"}))+DOC(2,"extrait du diagramme des exigences du monte-charge",d2Exig({reqs:[{id:"1.1",nom:"Démarrage",txt:`La cabine doit démarrer en montée avec une accélération de ${nf(a)} m/s².`}]}))+DOC(3,"caractéristiques du monte-charge",d2Fiche({lignes:[["Masse de la cabine chargée",`${nf(m,0)} kg`],["Course",`${rnd([6,9,12])} m`]]}));
    const don=`masse ${m} kg ; exigence 1.1 : accélération ${nf(a)} m/s² ; g = 9,81 N/kg`;
    return [{fig,don,q:`À l'aide de la figure 3, détermine le poids P de la cabine chargée. ${GTXT}`,nom:"P",type:"num",ans:P,tolR:0.005,unit:"N",
        expl:`${F("P = m·g")} = ${nf(m,0)} × 9,81 = ${U(P,"N")}.`,
        lire:`Figure 3 : masse de la cabine chargée ${nf(m,0)} kg.`,
        met:[`${F("P = m·g")}.`,`${F(`P = ${nf(m,0)} × 9,81 = ${S3(P)} N`)}.`],
        piege:`Donner la masse en kilogrammes : le poids est une force, en newtons.`,
        ret:`${F("P = m·g")}.`,
        diag:dgs(P,[{v:m,m:`tu as donné la masse, en kilogrammes. Le poids vaut m × g.`},{v:m/G0,m:`tu as divisé par g. Le poids vaut m × g.`},{v:m*10,m:`tu as pris g = 10 N/kg. L'énoncé demande 9,81 N/kg.`}])},
      {q:`À l'aide des figures 1 et 2, détermine la tension T du câble pendant le démarrage en montée.`,nom:"T",type:"num",ans:Tn,tolR:0.005,unit:"N",don,
        expl:`${F("T − P = m·a")}, donc ${F(`T = P + m·a = ${S3(P)} + ${nf(m,0)} × ${nf(a)}`)} = ${U(Tn,"N")}.`,
        lire:`Figure 1 : T vers le haut, P vers le bas, accélération vers le haut. Figure 2 : ${nf(a)} m/s².`,
        met:[`On choisit le sens positif vers le haut, celui de l'accélération : T se compte +, P se compte −.`,`2e loi de Newton : ${F("T − P = m·a")}, donc ${F("T = P + m·a")}.`,`${F(`T = ${S3(P)} + ${nf(m,0)} × ${nf(a)} = ${S3(Tn)} N`)}.`],
        piege:`Écrire T = P : c'est vrai à l'arrêt ou à vitesse constante, pas pendant le démarrage.`,
        ret:`Pour accélérer vers le haut, le câble doit tirer plus fort que le poids : ${F("T = m·(g + a)")}.`,
        diag:dgs(Tn,[{v:P,m:`tu as donné le poids. Pendant le démarrage, le câble doit en plus accélérer la cabine : T = P + m·a.`},{v:m*a,m:`tu as donné m·a seul : c'est la somme des forces. La tension vaut P + m·a.`},{v:m*(G0-a),m:`tu as retranché m·a. L'accélération est vers le haut : le câble tire plus fort que le poids.`}])}]; }
];

const N2N3=[
  /* Étude A · montée d'une pente à vitesse constante : angle, composante du poids, force motrice, exigence */
  ()=>{ const o=tirer(()=>{ const p=rnd([5,8,10,12,15,18,20]), m=rnd([90,110,120,140,160,180]), R=rnd([15,20,25,30,40]), al=Math.atan(p/100), Px=m*G0*Math.sin(al), Fn=Px+R, Fx=rnd([80,100,120,150,180,200,250,300,350,400]); return {p,m,R,al,Px,Fn,Fx}; },o=>loin(o.Fn,o.Fx,0.08)&&o.Fn<1.7*o.Fx&&o.Fn>o.Fx/1.7);
    const {p,m,R,al,Px,Fn,Fx}=o, ad=al*180/Math.PI, s=rnd([{n:"fauteuil roulant électrique",a:"Le fauteuil"},{n:"robot de livraison",a:"Le robot"},{n:"vélo cargo à assistance électrique",a:"Le vélo"}]);
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Franchissement",txt:`${s.a} doit monter une pente de ${p} % à vitesse constante.`}]}))+
      DOC(2,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Résistance au roulement R",`${R} N`],["Force motrice maximale aux roues",`${Fx} N`]]}))+
      figF(3,`forces exercées sur le ${s.n} dans la pente`,{F:"F",R:"R",P:"P",N:"N",pente:"α",mv:1});
    const don=`exigence 1.1 : pente de ${p} % ; masse ${m} kg ; R = ${R} N ; force motrice maximale ${Fx} N ; g = 9,81 N/kg`;
    return [{fig,don,ctx0:`Étude d'un ${s.n} : on vérifie que le moteur permet de monter la pente exigée.`,q:`À l'aide de la figure 1, détermine l'angle α de la pente, en degrés. Une pente de ${p} % monte de ${p} m pour 100 m parcourus à l'horizontale.`,nom:"α",type:"num",ans:ad,tolR:0.01,unit:"°",
        expl:`${F(`tan α = ${FRAC(p,100)}`)}, donc ${F(`α = arctan(${nf(p/100)})`)} = ${U(ad,"°")}.`,
        lire:`Figure 1, exigence 1.1 : pente de ${p} %.`,
        met:[`Une pente de ${p} % : on monte de ${p} m pour 100 m à l'horizontale. C'est la tangente de l'angle : ${F(`tan α = ${FRAC(p,100)} = ${nf(p/100)}`)}.`,`${F(`α = arctan(${nf(p/100)}) = ${S3(ad)}°`)}, calculatrice en degrés.`],
        piege:`Lire ${p} % comme un angle de ${p}°.`,
        ret:`Pente en % : ${F(`tan α = ${FRAC("pente","100")}`)}.`,
        diag:dgs(ad,[{v:p,m:`tu as pris ${p} % pour ${p}°. Le pourcentage est la tangente de l'angle : α = arctan(${nf(p/100)}).`},{v:Math.atan(p)*180/Math.PI,m:`tu as calculé arctan(${p}). Il faut diviser le pourcentage par 100 : arctan(${nf(p/100)}).`},{v:al,m:`ta calculatrice est en radians. Mets-la en degrés.`},{v:p/100,m:`tu as donné la tangente de l'angle. Il reste à calculer l'angle : α = arctan(${nf(p/100)}).`}])},
      {q:`À l'aide des figures 2 et 3, détermine la composante du poids parallèle à la pente, notée ${sb("P","x")}. ${GTXT}`,nom:sb("P","x"),type:"num",ans:Px,tolR:0.01,unit:"N",don,
        expl:`${F("P<sub>x</sub> = m·g·sin α")} = ${m} × 9,81 × sin ${S3(ad)}° = ${U(Px,"N")}.`,
        lire:`Figure 2 : masse en charge ${m} kg. Question précédente : α = ${S3(ad)}°.`,
        met:[`Le poids est vertical : ${F(`P = m·g = ${m} × 9,81 = ${S3(m*G0)} N`)}.`,`La part du poids qui retient le véhicule le long de la pente vaut ${F("P<sub>x</sub> = m·g·sin α")}.`,`${F(`P<sub>x</sub> = ${S3(m*G0)} × sin ${S3(ad)}° = ${S3(Px)} N`)}.`],
        piege:`Prendre le cosinus : m·g·cos α est la part du poids qui appuie sur la pente.`,
        ret:`Sur une pente d'angle α : ${F("P<sub>x</sub> = m·g·sin α")} le long de la pente.`,
        diag:dgs(Px,[{v:m*G0*Math.cos(al),m:`tu as pris le cosinus : c'est la part du poids perpendiculaire à la pente. Le long de la pente, on prend le sinus.`},{v:m*G0,m:`tu as donné le poids entier. Seule une part du poids agit le long de la pente : multiplie par sin α.`},{v:m*Math.sin(al),m:`tu as oublié g : le poids vaut m × g.`}])},
      {q:`Le véhicule monte à vitesse constante. Détermine la force motrice F nécessaire.`,nom:"F",type:"num",ans:Fn,tolR:0.01,unit:"N",don,
        expl:`Vitesse constante : ΣF = 0, donc ${F(`F = P<sub>x</sub> + R = ${S3(Px)} + ${R}`)} = ${U(Fn,"N")}.`,
        lire:`Figure 2 : R = ${R} N. Figure 3 : F vers le haut de la pente, R vers le bas. Question précédente : ${F(`P<sub>x</sub> = ${S3(Px)} N`)}.`,
        met:[`À vitesse constante, la somme des forces le long de la pente est nulle.`,`Vers le haut : F. Vers le bas : ${sb("P","x")} et R. Donc ${F("F − P<sub>x</sub> − R = 0")}.`,`${F(`F = ${S3(Px)} + ${R} = ${S3(Fn)} N`)}.`],
        piege:`Oublier la résistance au roulement, ou la retrancher.`,
        ret:`Vitesse constante : ΣF = 0.`,
        diag:dgs(Fn,[{v:Px,m:`tu as oublié la résistance au roulement R : elle s'oppose aussi à la montée.`},{v:Px-R,m:`tu as retranché R. Dans la montée, R et la composante du poids retiennent toutes les deux le véhicule : elles s'ajoutent.`},{v:m*G0+R,m:`tu as pris le poids entier. Le long de la pente, seule la composante m·g·sin α compte.`}])},
      conclure({q:`À l'aide de la figure 2, conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:"la force motrice nécessaire dans la pente",val:Fn,u:"N",lim:Fx,limTxt:`${Fx} N, force motrice maximale`,ou:"force motrice maximale, figure 2",aux:`à la force motrice maximale du moteur (${Fx} N)`,ph:"Pour monter la pente, il faut une force motrice de",
        lire:`Figure 2 : force motrice maximale ${Fx} N. Question précédente : ${S3(Fn)} N.`,faux:`la résistance au roulement ne vaut que ${R} N`,fauxW:`la résistance au roulement seule ne répond pas à l'exigence : on compare la force motrice nécessaire (${S3(Fn)} N) à la force motrice maximale (${Fx} N).`,remede:`Il faudrait un moteur plus fort, ou un véhicule plus léger`})]; },
  /* Étude B · démarrage sur le plat : somme des forces, accélération, durée pour atteindre la vitesse, exigence */
  ()=>{ const o=tirer(()=>{ const f=tirFR(), V=rnd([1,1.5,2,2.5,3]), t=V/f.a, Tx=rnd([1,1.5,2,3,4,5,6,8,10]); return {...f,V,t,Tx}; },o=>loin(o.t,o.Tx,0.08)&&o.t<1.8*o.Tx&&o.t>o.Tx/1.8);
    const {Fm,R,m,a,V,t,Tx}=o, S=Fm-R, s=rnd(SYSN);
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Démarrage",txt:`${s.a} doit atteindre ${nf(V)} m/s en moins de ${nf(Tx)} s, départ arrêté.`}]}))+
      figF(2,`forces exercées sur le ${s.n} pendant le démarrage, sur le plat`,{F:`F = ${Fm} N`,R:`R = ${R} N`,P:"P",N:"N",mv:1})+DOC(3,`caractéristiques du ${s.n}`,d2Fiche({lignes:[["Masse en charge",`${m} kg`],["Tension de la batterie",`${rnd([24,36,48])} V`]]}));
    const don=`exigence 1.1 : ${nf(V)} m/s en moins de ${nf(Tx)} s ; schéma : F = ${Fm} N vers l'avant ; R = ${R} N vers l'arrière ; masse ${m} kg`;
    return [{fig,don,ctx0:`Étude du démarrage d'un ${s.n} : on vérifie qu'il atteint sa vitesse assez vite.`,q:`Sur la figure 2, F est la force motrice et R la somme des résistances. Détermine la somme des forces ΣF dans la direction du mouvement.`,nom:"ΣF",type:"num",ans:S,tolR:0.005,unit:"N",
        expl:`${F(`ΣF = F − R = ${Fm} − ${R}`)} = ${U(S,"N")}.`,
        lire:`Figure 2 : F = ${Fm} N vers l'avant, R = ${R} N vers l'arrière.`,
        met:[`On choisit le sens du mouvement comme sens positif : F se compte +, R se compte −.`,`${F(`ΣF = ${Fm} − ${R} = ${S} N`)}.`],
        piege:`Ajouter les deux valeurs : deux forces de sens contraires se retranchent.`,
        ret:`Sur un axe : une force dans le sens positif se compte +, dans l'autre sens −.`,
        diag:dgs(S,[{v:Fm+R,m:`tu as ajouté les deux forces. Elles sont de sens contraires : on retranche R.`},{v:Fm,m:`tu as oublié les résistances R.`}])},
      {q:`À l'aide de la figure 3, déduis-en l'accélération a pendant le démarrage.`,nom:"a",type:"num",ans:a,tolR:0.01,unit:"m/s²",don,
        expl:`${F(`a = ${FRAC("ΣF","m")}`)} = ${FRAC(S,m)} = ${U(a,"m/s²")}.`,
        lire:`Figure 3 : masse en charge ${m} kg. Question précédente : ${F(`ΣF = ${S} N`)}.`,
        met:[`2e loi de Newton : ${F("ΣF = m·a")}, donc ${F(`a = ${FRAC("ΣF","m")}`)}.`,`${F(`a = ${FRAC(S,m)} = ${S3(a)} m/s²`)}.`],
        piege:`Diviser la force motrice seule par la masse.`,
        ret:`${F(`a = ${FRAC("ΣF","m")}`)}.`,
        diag:dgs(a,[{v:Fm/m,m:`tu as divisé la force motrice seule par la masse. C'est la somme des forces (F − R) qui donne l'accélération.`},{v:S*m,m:`tu as multiplié par la masse. On divise la somme des forces par la masse.`},{v:m/S,m:`tu as divisé la masse par la somme des forces. C'est l'inverse.`}])},
      {q:`L'accélération reste constante. Détermine la durée t nécessaire pour atteindre la vitesse de l'exigence 1.1, départ arrêté.`,nom:"t",type:"num",ans:t,tolR:0.01,unit:"s",don,
        expl:`${F(`t = ${FRAC("v","a")}`)} = ${FRAC(nf(V),S3(a))} = ${U(t,"s")}.`,
        lire:`Figure 1, exigence 1.1 : vitesse à atteindre ${nf(V)} m/s. Question précédente : ${F(`a = ${S3(a)} m/s²`)}.`,
        met:[`Départ arrêté, accélération constante : ${F("v = a·t")}, donc ${F(`t = ${FRAC("v","a")}`)}.`,`${F(`t = ${FRAC(nf(V),S3(a))} = ${S3(t)} s`)}.`],
        piege:`Multiplier la vitesse par l'accélération au lieu de diviser.`,
        ret:`Départ arrêté, accélération constante : ${F("v = a·t")}.`,
        diag:dgs(t,[{v:V*a,m:`tu as multiplié la vitesse par l'accélération. On isole la durée : on divise la vitesse par l'accélération.`},{v:a/V,m:`tu as divisé l'accélération par la vitesse. C'est l'inverse.`},{v:Tx,m:`tu as recopié la durée de l'exigence. Calcule la durée réelle avec l'accélération trouvée.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:`la durée pour atteindre ${nf(V)} m/s`,val:t,u:"s",lim:Tx,limTxt:`moins de ${nf(Tx)} s`,ou:"exigence 1.1",ph:`${s.a} atteint ${nf(V)} m/s en`,
        lire:`Figure 1, exigence 1.1 : moins de ${nf(Tx)} s. Question précédente : ${S3(t)} s.`,faux:`la force motrice vaut ${Fm} N`,fauxW:`la force motrice seule ne répond pas à l'exigence : on compare la durée du démarrage (${S3(t)} s) à la durée exigée (${nf(Tx)} s).`,remede:`Il faudrait une force motrice plus grande, ou un véhicule plus léger`})]; },
  /* Étude C · freinage d'urgence : vitesse, décélération donnée par la force de freinage, distance, exigence */
  ()=>{ const o=tirer(()=>{ const Vk=rnd([18,27,36,45,54]), m=rnd([500,800,1000,1200,1500]), Ff=rnd([1500,2000,2500,3000,4000,5000,6000]), v=Vk/3.6, a=Ff/m, d=v*v/(2*a), Dx=rnd([3,4,5,6,8,10,12,15,20,25,30,40]); return {Vk,m,Ff,v,a,d,Dx}; },o=>o.a>=1.5&&o.a<=8&&loin(o.d,o.Dx,0.08)&&o.d<1.7*o.Dx&&o.d>o.Dx/1.7);
    const {Vk,m,Ff,v,a,d,Dx}=o, tf=v/a;
    const fig=DOC(1,"extrait du diagramme des exigences d'une navette autonome",d2Exig({reqs:[{id:"1.1",nom:"Freinage d'urgence",txt:`La navette doit s'arrêter sur moins de ${Dx} m après le début du freinage.`}]}))+
      DOC(2,"caractéristiques de la navette",d2Fiche({lignes:[["Vitesse de circulation",`${Vk} km/h`],["Masse en charge",`${nf(m,0)} kg`],["Force de freinage",`${nf(Ff,0)} N`],["Nombre de places",`${rnd([6,8,12])}`]]}))+
      figF(3,"forces exercées sur la navette pendant le freinage",{R:"force de freinage",P:"P",N:"N",mv:1});
    const don=`exigence 1.1 : arrêt sur moins de ${Dx} m ; vitesse ${Vk} km/h ; masse ${m} kg ; force de freinage ${Ff} N`;
    return [{fig,don,ctx0:`Étude du freinage d'urgence d'une navette autonome : on vérifie la distance de freinage.`,q:`À l'aide de la figure 2, exprime la vitesse de circulation v en m/s.`,nom:"v",type:"num",ans:v,tolR:0.01,unit:"m/s",
        expl:`${F(`v = ${FRAC(Vk,"3,6")}`)} = ${U(v,"m/s")}.`,
        lire:`Figure 2, ligne « Vitesse de circulation » : ${Vk} km/h.`,
        met:[`Pour passer des km/h aux m/s, on divise par 3,6.`,`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`],
        piege:`Multiplier par 3,6 : c'est pour passer des m/s aux km/h.`,
        ret:`km/h → m/s : on divise par 3,6.`,
        diag:dgs(v,[{v:Vk*3.6,m:`tu as multiplié par 3,6. Pour passer des km/h aux m/s, on divise par 3,6.`},{v:Vk,m:`tu as recopié la valeur en km/h. Divise par 3,6.`}])},
      {q:`Pendant le freinage, la force de freinage est la seule force dans la direction du mouvement (figure 3). Détermine la décélération de la navette. Donne une valeur positive.`,nom:"décélération",type:"num",ans:a,tolR:0.01,unit:"m/s²",don,
        expl:`${F(`a = ${FRAC("F","m")}`)} = ${FRAC(nf(Ff,0),nf(m,0))} = ${U(a,"m/s²")}.`,
        lire:`Figure 2 : force de freinage ${nf(Ff,0)} N, masse en charge ${nf(m,0)} kg.`,
        met:[`2e loi de Newton dans la direction du mouvement : ${F("F = m·a")}, donc ${F(`a = ${FRAC("F","m")}`)}.`,`${F(`a = ${FRAC(nf(Ff,0),nf(m,0))} = ${S3(a)} m/s²`)}.`],
        piege:`Diviser par le poids au lieu de la masse.`,
        ret:`${F(`a = ${FRAC("ΣF","m")}`)}.`,
        diag:dgs(a,[{v:Ff/(m*G0),m:`tu as divisé par le poids. Dans ΣF = m·a, m est la masse, en kilogrammes.`},{v:m/Ff,m:`tu as divisé la masse par la force. C'est l'inverse.`},{v:Ff*m,m:`tu as multiplié la force par la masse. On divise la force par la masse.`}])},
      {q:`Détermine la distance d parcourue pendant le freinage, jusqu'à l'arrêt.`,nom:"d",type:"num",ans:d,tolR:0.015,unit:"m",don,
        expl:`Durée du freinage ${F(`t = ${FRAC("v","a")} = ${S3(tf)} s`)} ; ${F(`d = ${FRAC("v·t","2")}`)} = ${FRAC(`${S3(v)} × ${S3(tf)}`,2)} = ${U(d,"m")}.`,
        lire:`Questions précédentes : ${F(`v = ${S3(v)} m/s`)} et décélération ${S3(a)} m/s².`,
        met:[`Durée du freinage : la vitesse passe de v à 0, ${F(`t = ${FRAC("v","a")} = ${FRAC(S3(v),S3(a))} = ${S3(tf)} s`)}.`,`La vitesse diminue régulièrement : la distance est l'aire du triangle sous v(t), ${F(`d = ${FRAC("v·t","2")}`)}.`,`${F(`d = ${FRAC(`${S3(v)} × ${S3(tf)}`,2)} = ${S3(d)} m`)}.`],
        piege:`Calculer v × t : pendant le freinage, la vitesse moyenne n'est que la moitié de v.`,
        ret:`Freinage jusqu'à l'arrêt : ${F(`d = ${FRAC("v·t","2")} = ${FRAC("v²","2·a")}`)}.`,
        diag:dgs(d,[{v:v*tf,m:`tu as calculé v × t, comme si la navette roulait à vitesse constante. Pendant le freinage, la distance est la moitié : divise par 2.`},{v:tf,m:`tu as donné la durée du freinage, en secondes. La distance vaut v × t divisé par 2.`},{v:Vk*Vk/(2*a),m:`tu as utilisé la vitesse en km/h. Prends la vitesse en m/s.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:"la distance de freinage",val:d,u:"m",lim:Dx,limTxt:`moins de ${Dx} m`,ou:"exigence 1.1",ph:"La navette s'arrête sur",
        lire:`Figure 1, exigence 1.1 : moins de ${Dx} m. Question précédente : ${S3(d)} m.`,faux:`la décélération vaut ${S3(a)} m/s²`,fauxW:`la décélération seule ne répond pas à l'exigence : on compare la distance de freinage (${S3(d)} m) à la distance exigée (${Dx} m).`,remede:`Il faudrait une force de freinage plus grande, ou une vitesse de circulation plus faible`})]; },
  /* Étude D · monte-charge : poids, somme des forces au démarrage, tension du câble, exigence de sécurité */
  ()=>{ const o=tirer(()=>{ const m=rnd([400,500,630,800,1000]), a=rnd([0.5,0.8,1,1.2,1.5]), P=m*G0, S=m*a, Tn=P+S, Tx=rnd([4000,5000,6000,8000,10000,12000,15000]); return {m,a,P,S,Tn,Tx}; },o=>loin(o.Tn,o.Tx,0.08)&&o.Tn<1.6*o.Tx&&o.Tn>o.Tx/1.6);
    const {m,a,P,S,Tn,Tx}=o;
    const fig=DOC(1,"extrait du diagramme des exigences du monte-charge",d2Exig({reqs:[{id:"1.1",nom:"Démarrage",txt:`La cabine doit démarrer en montée avec une accélération de ${nf(a)} m/s².`},{id:"1.2",nom:"Sécurité du câble",txt:`La tension du câble ne doit pas dépasser ${nf(Tx,0)} N.`}]}))+
      DOC(2,"forces exercées sur la cabine, au démarrage en montée",d2Cabine({T:"T",P:"P",a:"a"}))+DOC(3,"caractéristiques du monte-charge",d2Fiche({lignes:[["Masse de la cabine chargée",`${nf(m,0)} kg`],["Course",`${rnd([6,9,12])} m`]]}));
    const don=`exigence 1.1 : accélération ${nf(a)} m/s² ; exigence 1.2 : tension ${Tx} N au plus ; masse ${m} kg ; g = 9,81 N/kg`;
    return [{fig,don,ctx0:`Étude d'un monte-charge : on vérifie que le câble supporte le démarrage en montée.`,q:`À l'aide de la figure 3, détermine le poids P de la cabine chargée. ${GTXT}`,nom:"P",type:"num",ans:P,tolR:0.005,unit:"N",
        expl:`${F("P = m·g")} = ${nf(m,0)} × 9,81 = ${U(P,"N")}.`,
        lire:`Figure 3 : masse de la cabine chargée ${nf(m,0)} kg.`,
        met:[`${F("P = m·g")}.`,`${F(`P = ${nf(m,0)} × 9,81 = ${S3(P)} N`)}.`],
        piege:`Donner la masse en kilogrammes : le poids est une force, en newtons.`,
        ret:`${F("P = m·g")}.`,
        diag:dgs(P,[{v:m,m:`tu as donné la masse, en kilogrammes. Le poids vaut m × g.`},{v:m/G0,m:`tu as divisé par g. Le poids vaut m × g.`},{v:m*10,m:`tu as pris g = 10 N/kg. L'énoncé demande 9,81 N/kg.`}])},
      {q:`À l'aide de la figure 1, détermine la somme des forces ΣF nécessaire pour obtenir l'accélération de l'exigence 1.1.`,nom:"ΣF",type:"num",ans:S,tolR:0.005,unit:"N",don,
        expl:`${F("ΣF = m·a")} = ${nf(m,0)} × ${nf(a)} = ${U(S,"N")}.`,
        lire:`Figure 1, exigence 1.1 : ${nf(a)} m/s². Figure 3 : masse ${nf(m,0)} kg.`,
        met:[`2e loi de Newton : ${F("ΣF = m·a")}.`,`${F(`ΣF = ${nf(m,0)} × ${nf(a)} = ${S3(S)} N`)}.`],
        piege:`Utiliser le poids à la place de la masse.`,
        ret:`${F("ΣF = m·a")}.`,
        diag:dgs(S,[{v:P*a,m:`tu as utilisé le poids à la place de la masse. Dans ΣF = m·a, m est en kilogrammes.`},{v:m/a,m:`tu as divisé la masse par l'accélération. ΣF = m × a.`},{v:P,m:`tu as redonné le poids. La somme des forces vaut m × a.`}])},
      {q:`À l'aide de la figure 2, déduis-en la tension T du câble pendant le démarrage.`,nom:"T",type:"num",ans:Tn,tolR:0.005,unit:"N",don,
        expl:`${F("T − P = ΣF")}, donc ${F(`T = P + ΣF = ${S3(P)} + ${S3(S)}`)} = ${U(Tn,"N")}.`,
        lire:`Figure 2 : T vers le haut, P vers le bas, accélération vers le haut. Questions précédentes : ${F(`P = ${S3(P)} N`)} et ${F(`ΣF = ${S3(S)} N`)}.`,
        met:[`On choisit le sens positif vers le haut, celui de l'accélération : T se compte +, P se compte −.`,`${F("ΣF = T − P")}, donc ${F("T = P + ΣF")}.`,`${F(`T = ${S3(P)} + ${S3(S)} = ${S3(Tn)} N`)}.`],
        piege:`Écrire T = P : c'est vrai à l'arrêt ou à vitesse constante, pas pendant le démarrage.`,
        ret:`Pour accélérer vers le haut, le câble doit tirer plus fort que le poids : ${F("T = m·(g + a)")}.`,
        diag:dgs(Tn,[{v:P,m:`tu as donné le poids. Pendant le démarrage, le câble doit en plus accélérer la cabine : T = P + ΣF.`},{v:P-S,m:`tu as retranché ΣF. L'accélération est vers le haut : le câble tire plus fort que le poids.`},{v:S,m:`tu as redonné la somme des forces. La tension vaut P + ΣF.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.2. Rédige ta réponse.`,don,exi:"1.2",quoi:"la tension du câble au démarrage",val:Tn,u:"N",lim:Tx,limTxt:`${nf(Tx,0)} N au plus`,ou:"exigence 1.2",ph:"Au démarrage, la tension du câble vaut",
        lire:`Figure 1, exigence 1.2 : ${nf(Tx,0)} N au plus. Question précédente : ${S3(Tn)} N.`,faux:`le poids de la cabine vaut ${S3(P)} N`,fauxW:`le poids seul ne répond pas à l'exigence : au démarrage, la tension est plus grande que le poids. On compare la tension (${S3(Tn)} N) à la limite (${nf(Tx,0)} N).`,remede:`Il faudrait un câble plus résistant, ou un démarrage plus doux`})]; }
];

/* Le réservoir : les questions de cours sans calcul d'avant (niveau 1) et les nouvelles questions. */
{ const A=POOLS["phy-newton"]; POOLS["phy-newton"]={v2:true,count:{1:4,2:4,3:4},1:[...[1,2,3,4,6,8,10,11].map(i=>A[1][i]),...N2N1],2:N2N2,3:N2N3}; }
}
