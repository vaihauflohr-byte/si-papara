/* ======================================================================
   v2 · Cinématique (meca-cinematique) : courbes et documents à lire, verbes de l'épreuve, conclusions rédigées.
   Les questions de reconnaissance des mouvements et des trajectoires sur les schémas de mécanismes (déjà sans
   données dans l'énoncé) sont gardées au niveau 1.
   ====================================================================== */
{
const sb=(b,i)=>`${b}<sub>${i}</sub>`, TPI=2*Math.PI, sat=b=>b?"est satisfaite":"n'est pas satisfaite";
const trou=(ok,wrong,m)=>{ const o=shuffle([...new Set([ok,...wrong])]); return {o,ok:o.indexOf(ok),m}; };
/* réponses fausses typiques : on retire celles qui tombent sur la bonne réponse, et les doublons */
const dgs=(ans,l)=>l.filter((d,i)=>d.v>0&&Math.abs(d.v-ans)>0.03*Math.abs(ans)&&l.findIndex(e=>Math.abs(e.v-d.v)<=1e-9*Math.abs(d.v))===i);
const SYSC=[{n:"chariot de transfert",a:"Le chariot",le:"du chariot"},{n:"ascenseur",a:"La cabine",le:"de la cabine"},{n:"navette autonome",a:"La navette",le:"de la navette"},{n:"axe linéaire de machine",a:"Le chariot",le:"du chariot"}];
/* profil de vitesse en trapèze, lisible sur le quadrillage : t1 fin de l'accélération, t2 début du freinage, t3 arrêt, V palier */
const trap=()=>{ const t1=rnd([2,3,4]), tp=rnd([3,4,5,6,8]), td=rnd([2,3,4]), t2=t1+tp, t3=t2+td, pet=Math.random()<.5, V=pet?rnd([0.4,0.6,0.8,1,1.2]):rnd([1.5,2,2.5,3]), ys=pet?0.2:0.5, xs=t3<=10?1:2;
  return {t1,t2,t3,tp,td,V,ys,xs,xm:Math.ceil((t3+0.5)/xs)*xs,ym:Number((V+ys).toFixed(1))}; };
const figTrap=(p,n,titre)=>DOC(n,titre,d2Courbe({pts:[[0,0],[p.t1,p.V],[p.t2,p.V],[p.t3,0]],xm:p.xm,ym:p.ym,xs:p.xs,ys:p.ys,sub:p.xs===2?2:1,xl:"t (s)",yl:"v (m/s)",label:"Vitesse en fonction du temps : une montée, un palier, une descente jusqu'à l'arrêt"}));
const donTrap=p=>`courbe v(t) : départ arrêté ; ${nf(p.V)} m/s de ${p.t1} s à ${p.t2} s ; arrêt à ${p.t3} s`;
/* conclusion rédigée d'une étude, sur une exigence « au plus » : satisfaite si val ≤ lim */
const conclure=o=>{ const phm=o.ph.charAt(0).toLowerCase()+o.ph.slice(1), oui=o.val<=o.lim, mot=oui?"inférieur":"supérieur", V=`${S3(o.val)} ${o.u}`, Lm=`${nf(o.lim,3)} ${o.u}`, pg=oui?"plus petit":"plus grand";
  return {q:o.q,type:"red",don:o.don,
    ...mcw(`L'exigence ${o.exi} ${sat(oui)} : ${phm} ${V}, ${oui?"moins":"plus"} que la limite de ${Lm}.`,[
      [`L'exigence ${o.exi} ${sat(!oui)} : ${phm} ${V}, ${oui?"plus":"moins"} que la limite de ${Lm}.`,`compare les nombres : ${S3(o.val)} est ${pg} que ${nf(o.lim,3)}.`],
      [`L'exigence ${o.exi} ${sat(oui)}, car ${o.faux}.`,o.fauxW],
      [`On ne peut pas conclure : il manque une donnée.`,`les deux valeurs à comparer sont connues : ${V} (calculé) et ${Lm} (exigence ${o.exi}).`]]),
    elements:[{t:`Donne ${o.quoi} (environ ${V})`,p:1},{t:`Donne la valeur exigée (${o.limTxt})`,p:1},{t:`Compare les deux valeurs`,p:1},{t:`Conclut que l'exigence ${o.exi} ${sat(oui)}`,p:2}],
    modele:`${o.ph} ${V}. C'est ${mot} à la limite de ${Lm} : l'exigence ${o.exi} ${sat(oui)}.`,
    iaPlus:`Résultat des questions précédentes : ${o.quoi} = ${V}. Exigence ${o.exi} : ${o.limTxt}.`,
    expl:`${V} est ${mot} à ${Lm} : l'exigence ${o.exi} ${sat(oui)}.`,
    lire:o.lire,
    met:[`Une conclusion complète donne la valeur trouvée, la valeur exigée, la comparaison, puis la réponse.`,`Valeur trouvée : ${F(V)}. Valeur exigée : ${F(Lm)} au plus.`,`${S3(o.val)} est ${pg} que ${nf(o.lim,3)} : l'exigence ${o.exi} ${sat(oui)}${oui?"":". "+o.remede}.`],
    piege:`Conclure sans citer les deux valeurs, ou comparer deux grandeurs qui n'ont pas la même unité.`,
    ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}; };

const C2N1=[
  /* c0 · relever la vitesse du palier sur la courbe v(t) */
  ()=>{ const p=trap(), s=rnd(SYSC), don=donTrap(p);
    return {fig:figTrap(p,1,`vitesse ${s.le} pendant un déplacement (${s.n})`),don,q:`À l'aide de la figure 1, relève la vitesse ${s.le} pendant la phase à vitesse constante.`,type:"num",ans:p.V,tolR:0.02,unit:"m/s",
      expl:`Entre ${p.t1} s et ${p.t2} s, la courbe est horizontale : ${F(`v = ${nf(p.V)} m/s`)}.`,
      lire:`Figure 1 : le palier horizontal, entre ${p.t1} s et ${p.t2} s. Sa hauteur se lit sur l'axe vertical.`,
      met:[`Repère la partie horizontale de la courbe : la vitesse n'y change pas.`,`Lis sa hauteur sur l'axe vertical : ${F(`v = ${nf(p.V)} m/s`)}.`],
      piege:`Lire une valeur sur l'axe horizontal : c'est un temps, pas une vitesse.`,
      ret:`Sur une courbe v(t), une partie horizontale est une phase à vitesse constante.`,
      diag:dgs(p.V,[{v:p.t1,m:`tu as lu ${p.t1} sur l'axe horizontal : c'est l'instant où le palier commence, en secondes. La vitesse se lit sur l'axe vertical.`},{v:p.t2,m:`tu as lu ${p.t2} sur l'axe horizontal : c'est l'instant où le palier finit, en secondes. La vitesse se lit sur l'axe vertical.`},{v:p.tp,m:`tu as donné la durée du palier. La question demande la vitesse : elle se lit sur l'axe vertical.`},{v:p.ym,m:`tu as lu le haut de l'axe vertical. Lis la hauteur du palier.`}])}; },
  /* c1 · relever la durée d'une phase */
  ()=>{ const p=trap(), s=rnd(SYSC), k=rnd([0,1,2]), don=donTrap(p), PH=[["d'accélération",0,p.t1],["à vitesse constante",p.t1,p.t2],["de freinage",p.t2,p.t3]][k], d=PH[2]-PH[1];
    return {fig:figTrap(p,1,`vitesse ${s.le} pendant un déplacement (${s.n})`),don,q:`À l'aide de la figure 1, relève la durée de la phase ${PH[0]}.`,type:"num",ans:d,tolR:0.02,unit:"s",
      expl:`La phase ${PH[0]} va de ${PH[1]} s à ${PH[2]} s : elle dure ${F(`${PH[2]} − ${PH[1]} = ${d} s`)}.`,
      lire:`Figure 1 : la phase ${PH[0]} est la partie ${["qui monte","horizontale","qui descend"][k]} de la courbe, de ${PH[1]} s à ${PH[2]} s.`,
      met:[`Repère la partie ${["qui monte","horizontale","qui descend"][k]} de la courbe.`,`Lis l'instant où elle commence (${PH[1]} s) et l'instant où elle finit (${PH[2]} s) sur l'axe horizontal.`,`Durée : ${F(`${PH[2]} − ${PH[1]} = ${d} s`)}.`],
      piege:`Donner l'instant de fin de la phase. Une durée est la différence entre deux instants.`,
      ret:`Durée d'une phase = instant de fin − instant de début.`,
      diag:dgs(d,[{v:PH[2],m:`tu as donné l'instant où la phase finit (${PH[2]} s). La durée est la différence entre la fin et le début.`},{v:PH[1],m:`tu as donné l'instant où la phase commence. La durée est la différence entre la fin et le début.`},{v:p.V,m:`tu as lu une vitesse, sur l'axe vertical. Une durée se lit sur l'axe horizontal.`},{v:p.t3,m:`tu as donné la durée de tout le déplacement. La question porte sur une seule phase.`}])}; },
  /* c2 · nature du mouvement sur une phase */
  ()=>{ const p=trap(), s=rnd(SYSC), k=rnd([0,1,2]), don=donTrap(p), I=[[0,p.t1],[p.t1,p.t2],[p.t2,p.t3]][k];
    const NAT=[{t:"Uniformément accéléré : la vitesse augmente régulièrement.",w:"sur cet intervalle, la courbe ne monte pas."},{t:"Uniforme : la vitesse reste constante.",w:"sur cet intervalle, la courbe n'est pas horizontale : la vitesse change."},{t:"Uniformément décéléré : la vitesse diminue régulièrement.",w:"sur cet intervalle, la courbe ne descend pas."},{t:"À l'arrêt : la vitesse reste nulle.",w:"sur cet intervalle, la courbe n'est pas posée sur l'axe horizontal : la vitesse n'est pas nulle."}];
    return {fig:figTrap(p,1,`vitesse ${s.le} pendant un déplacement en ligne droite (${s.n})`),don,q:`Entre ${I[0]} s et ${I[1]} s, quel est le mouvement ${s.le} ? Justifie avec la figure 1.`,type:"ch",
      ...mcw(NAT[k].t,NAT.filter((x,i)=>i!==k).map(x=>[x.t,x.w])),
      expl:`Entre ${I[0]} s et ${I[1]} s, la courbe ${["monte en ligne droite : la vitesse augmente régulièrement","est horizontale : la vitesse ne change pas","descend en ligne droite : la vitesse diminue régulièrement"][k]}.`,
      lire:`Figure 1 : la partie de la courbe comprise entre ${I[0]} s et ${I[1]} s.`,
      met:[`Repère l'intervalle sur l'axe horizontal, puis regarde la forme de la courbe au-dessus.`,`Droite qui monte : la vitesse augmente régulièrement. Droite horizontale : vitesse constante. Droite qui descend : la vitesse diminue régulièrement.`,`Ici la courbe ${["monte","est horizontale","descend"][k]} : le mouvement est ${["uniformément accéléré","uniforme","uniformément décéléré"][k]}.`],
      piege:`Confondre la courbe v(t) avec la trajectoire : une courbe qui monte ne veut pas dire que l'objet monte.`,
      ret:`Sur v(t) : droite inclinée = accélération constante ; droite horizontale = vitesse constante.`}; },
  /* c3 · relever une vitesse dans le diagramme des exigences et la convertir en m/s */
  ()=>{ const s=rnd([{n:"fauteuil roulant électrique",a:"Le fauteuil",V:[6,8,10]},{n:"trottinette électrique",a:"La trottinette",V:[20,25]},{n:"robot de livraison",a:"Le robot",V:[6,9,12]},{n:"scooter électrique",a:"Le scooter",V:[45,50]},{n:"vélo à assistance électrique",a:"Le vélo",V:[25,27]}]), Vk=rnd(s.V), v=Vk/3.6, au=rnd([15,20,30,40]);
    return {fig:DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Vitesse",txt:`${s.a} doit atteindre ${Vk} km/h sur le plat.`},{id:"1.2",nom:"Autonomie",txt:`${s.a} doit parcourir ${au} km sans recharge.`}]})),
      don:`exigence 1.1 : ${Vk} km/h ; exigence 1.2 : ${au} km`,q:`À l'aide de la figure 1, relève la vitesse exigée et exprime-la en m/s.`,type:"num",ans:v,tolR:0.01,unit:"m/s",
      expl:`Exigence 1.1 : ${Vk} km/h, soit ${FRAC(Vk,"3,6")} = ${U(v,"m/s")}.`,
      lire:`Figure 1, exigence 1.1 « Vitesse » : ${Vk} km/h. L'exigence 1.2 donne une distance : elle ne sert pas ici.`,
      met:[`Relève la vitesse dans l'exigence 1.1 : ${F(`${Vk} km/h`)}.`,`1 km = 1 000 m et 1 h = 3 600 s : pour passer des km/h aux m/s, on divise par 3,6.`,`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`],
      piege:`Multiplier par 3,6 : c'est pour passer des m/s aux km/h.`,
      ret:`km/h → m/s : on divise par 3,6. m/s → km/h : on multiplie par 3,6.`,
      diag:dgs(v,[{v:Vk*3.6,m:`tu as multiplié par 3,6. Pour passer des km/h aux m/s, on divise par 3,6.`},{v:Vk,m:`tu as recopié la valeur en km/h. La question demande des m/s : divise par 3,6.`},{v:au,m:`tu as relevé l'exigence 1.2 : c'est une distance. La vitesse est dans l'exigence 1.1.`},{v:Vk/60,m:`tu as divisé par 60. Une heure vaut 3 600 s et un kilomètre 1 000 m : on divise par 3,6.`}])}; },
  /* c4 · vitesse angulaire à partir de la fréquence de rotation lue dans les caractéristiques */
  ()=>{ const N=rnd([750,1000,1450,1500,2800,3000]), Un=rnd([12,24,48]), P=rnd([90,120,180,250]), w=TPI*N/60;
    return {fig:DOC(1,"caractéristiques du moteur",d2Fiche({lignes:[["Tension nominale",`${Un} V`],["Puissance utile",`${P} W`],["Fréquence de rotation nominale",`${nf(N,0)} tr/min`]]})),
      don:`moteur : ${N} tr/min ; ${Un} V ; ${P} W`,q:`À l'aide de la figure 1, détermine la vitesse angulaire ω du moteur, en rad/s, à sa fréquence de rotation nominale.`,type:"num",ans:w,tolR:0.01,unit:"rad/s",
      expl:`${F(`ω = ${FRAC("2π·N","60")}`)} = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${U(w,"rad/s")}.`,
      lire:`Figure 1, ligne « Fréquence de rotation nominale » : ${nf(N,0)} tr/min. La tension et la puissance ne servent pas ici.`,
      met:[`Relève la fréquence de rotation : ${F(`N = ${nf(N,0)} tr/min`)}.`,`Un tour vaut 2π radians et une minute vaut 60 secondes : ${F(`ω = ${FRAC("2π·N","60")}`)}.`,`${F(`ω = ${FRAC(`2π × ${nf(N,0)}`,"60")} = ${S3(w)} rad/s`)}.`],
      piege:`Diviser seulement par 60 : on obtient des tours par seconde, pas des radians par seconde.`,
      ret:`${F(`ω = ${FRAC("2π·N","60")}`)} (N en tr/min, ω en rad/s).`,
      diag:dgs(w,[{v:N/60,m:`tu as divisé par 60 : ta valeur est en tours par seconde. Multiplie encore par 2π pour avoir des rad/s.`},{v:N*TPI,m:`tu as multiplié par 2π sans diviser par 60 : ta valeur est en radians par minute.`},{v:N,m:`tu as recopié la valeur en tr/min. La question demande des rad/s.`},{v:N*60/TPI,m:`tu as fait la conversion à l'envers. Des tr/min aux rad/s, on multiplie par 2π et on divise par 60.`}])}; },
  /* c5 · reconnaître une conclusion complète : valeur trouvée, valeur exigée, comparaison, réponse */
  ()=>{ const c=rnd([{d:"du diagramme des exigences d'un ascenseur",nom:"Confort",ex:x=>`L'accélération de la cabine ne doit pas dépasser ${x} m/s².`,g:"Accélération calculée",u:"m/s²",L:[0.8,1,1.2,1.5],ph:v=>`L'accélération de la cabine vaut ${v} m/s²`},
      {d:"du diagramme des exigences d'un chariot autonome",nom:"Arrêt d'urgence",ex:x=>`Le chariot doit s'arrêter en moins de ${x} m.`,g:"Distance d'arrêt calculée",u:"m",L:[1.5,2,2.5,3],ph:v=>`Le chariot s'arrête en ${v} m`},
      {d:"du diagramme des exigences d'une barrière levante",nom:"Durée d'ouverture",ex:x=>`La lisse doit s'ouvrir en moins de ${x} s.`,g:"Durée d'ouverture calculée",u:"s",L:[3,4,5,6],ph:v=>`La lisse s'ouvre en ${v} s`}]);
    const X=rnd(c.L), oui=Math.random()<.5, val=Number((X*(oui?rnd([.72,.8,.86]):rnd([1.14,1.22,1.3]))).toPrecision(3)), v=nf(val,3), x=nf(X), mot=oui?"inférieur":"supérieur";
    return {fig:DOC(1,`extrait ${c.d}`,d2Exig({reqs:[{id:"1.1",nom:c.nom,txt:c.ex(x)}]}))+DOC(2,"résultat de l'étude",d2Fiche({lignes:[[c.g,`${v} ${c.u}`]]})),
      q:`Quatre élèves concluent sur l'exigence 1.1. Quelle copie donne une conclusion complète et juste ?`,type:"ch",
      ...mcw(`« ${c.ph(v)}. C'est ${mot} à la limite de ${x} ${c.u} : l'exigence 1.1 ${sat(oui)}. »`,[
        [`« L'exigence 1.1 ${sat(oui)}. »`,`la réponse est juste, mais aucune valeur ne la justifie. À l'écrit, une conclusion sans nombres ne rapporte pas tous les points.`],
        [`« ${c.ph(v)} et l'exigence 1.1 fixe la limite à ${x} ${c.u}. »`,`les deux valeurs sont citées, mais la copie ne les compare pas et ne dit pas si l'exigence est satisfaite.`],
        [`« ${c.ph(v)}. C'est ${mot} à la limite de ${x} ${c.u} : l'exigence 1.1 ${sat(!oui)}. »`,`la comparaison est juste, mais la réponse la contredit : ${v} ${c.u} ${oui?"reste sous":"dépasse"} la limite de ${x} ${c.u}.`]]),
      don:`exigence 1.1 : ${x} ${c.u} au plus ; valeur calculée ${v} ${c.u}`,
      expl:`${v} ${c.u} est ${mot} à ${x} ${c.u} : l'exigence 1.1 ${sat(oui)}. La bonne copie donne les deux valeurs, les compare et répond.`,
      lire:`Figure 1, exigence 1.1 : ${x} ${c.u} au plus. Figure 2 : valeur calculée, ${v} ${c.u}.`,
      met:[`Une conclusion complète contient quatre choses : la valeur trouvée, la valeur exigée, la comparaison, la réponse.`,`Valeur trouvée : ${F(`${v} ${c.u}`)}. Valeur exigée : ${F(`${x} ${c.u}`)} au plus.`,`${v} est ${oui?"plus petit":"plus grand"} que ${x} : l'exigence 1.1 ${sat(oui)}.`],
      piege:`Répondre « oui » ou « non » sans les nombres : la réponse peut être juste, elle n'est pas justifiée.`,
      ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}; }
];

const C2N2=[
  /* d0 · accélération = pente de v(t), puis conclusion à compléter sur une exigence */
  ()=>{ const o=draw(()=>{ const p=trap(), a=p.V/p.t1, Ax=rnd([0.2,0.3,0.4,0.5,0.6,0.8,1,1.2,1.5]); return {p,a,Ax}; },o=>far(o.a,o.Ax,0.1)&&o.a<2.2*o.Ax&&o.a>o.Ax/2.2);
    const {p,a,Ax}=o, s=rnd(SYSC), oui=a<=Ax, don=`${donTrap(p)} ; exigence 1.2 : ${nf(Ax)} m/s² au plus`;
    const fig=figTrap(p,1,`vitesse ${s.le} pendant un déplacement (${s.n})`)+DOC(2,`extrait du diagramme des exigences (${s.n})`,d2Exig({reqs:[{id:"1.2",nom:"Démarrage en douceur",txt:`L'accélération ${s.le} ne doit pas dépasser ${nf(Ax)} m/s².`}]}));
    return [{fig,don,q:`À l'aide de la figure 1, détermine l'accélération ${s.le} pendant la phase de démarrage.`,nom:"a",type:"num",ans:a,tolR:0.015,unit:"m/s²",
        expl:`${F(`a = ${FRAC("Δv","Δt")}`)} = ${FRAC(nf(p.V),p.t1)} = ${U(a,"m/s²")}.`,
        lire:`Figure 1 : pendant le démarrage, la vitesse passe de 0 à ${nf(p.V)} m/s en ${p.t1} s.`,
        met:[`L'accélération est la pente de la courbe v(t) : ${F(`a = ${FRAC("Δv","Δt")}`)}.`,`Pendant le démarrage : ${F(`Δv = ${nf(p.V)} m/s`)} et ${F(`Δt = ${p.t1} s`)}.`,`${F(`a = ${FRAC(nf(p.V),p.t1)} = ${S3(a)} m/s²`)}.`],
        piege:`Diviser par la durée de tout le déplacement : seule la durée du démarrage compte.`,
        ret:`Accélération = pente de v(t) : ${F(`a = ${FRAC("Δv","Δt")}`)}, en m/s².`,
        diag:dgs(a,[{v:p.V*p.t1,m:`tu as multiplié la vitesse par la durée. L'accélération est une pente : on divise la variation de vitesse par la durée.`},{v:p.V/p.t3,m:`tu as divisé par la durée de tout le déplacement (${p.t3} s). Le démarrage ne dure que ${p.t1} s.`},{v:p.V/p.t2,m:`tu as divisé par ${p.t2} s. Le démarrage finit à ${p.t1} s.`},{v:p.t1/p.V,m:`tu as divisé la durée par la vitesse. C'est l'inverse : on divise la variation de vitesse par la durée.`},{v:p.V,m:`tu as donné la vitesse atteinte. L'accélération est la variation de vitesse divisée par la durée.`}])},
      {q:`Complète la conclusion sur l'exigence 1.2 (figure 2).`,type:"trous",don,
        phr:[`Pendant le démarrage, l'accélération ${s.le} vaut `,trou(`${S3(a)} m/s²`,[`${nf(p.V)} m/s²`,`${S3(p.V*p.t1)} m/s²`],`La valeur à citer est l'accélération que tu viens de calculer : ${S3(a)} m/s².`),`. C'est `,
          trou(oui?"inférieur":"supérieur",[oui?"supérieur":"inférieur"],`Compare les deux valeurs : ${S3(a)} est ${oui?"plus petit":"plus grand"} que ${nf(Ax)}.`),` à la limite de ${nf(Ax)} m/s² : l'exigence 1.2 `,
          trou(oui?"est":"n'est pas",[oui?"n'est pas":"est"],`L'accélération ne doit pas dépasser ${nf(Ax)} m/s² : avec ${S3(a)} m/s², l'exigence 1.2 ${sat(oui)}.`),` satisfaite.`],
        expl:`${S3(a)} m/s² est ${oui?"inférieur":"supérieur"} à ${nf(Ax)} m/s² : l'exigence 1.2 ${sat(oui)}.`,
        lire:`Figure 2, exigence 1.2 : ${nf(Ax)} m/s² au plus. Question précédente : ${S3(a)} m/s².`,
        met:[`Une conclusion complète donne la valeur trouvée, la valeur exigée, la comparaison, puis la réponse.`,`Valeur trouvée : ${F(`${S3(a)} m/s²`)}. Valeur exigée : ${F(`${nf(Ax)} m/s²`)} au plus.`,`${S3(a)} est ${oui?"plus petit":"plus grand"} que ${nf(Ax)} : l'exigence 1.2 ${sat(oui)}${oui?"":". Il faudrait démarrer plus lentement : une phase d'accélération plus longue"}.`],
        piege:`Citer la vitesse à la place de l'accélération : l'exigence porte sur une accélération, en m/s².`,
        ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}]; },
  /* d1 · distance = aire sous v(t) : triangle de l'accélération, puis trapèze entier */
  ()=>{ const p=trap(), s=rnd(SYSC), don=donTrap(p), d1=p.V*p.t1/2, d2=p.V*p.tp, d3=p.V*p.td/2, D=d1+d2+d3;
    return [{fig:figTrap(p,1,`vitesse ${s.le} pendant un déplacement (${s.n})`),don,q:`À l'aide de la figure 1, détermine la distance ${sb("d","1")} parcourue pendant la phase d'accélération.`,nom:sb("d","1"),type:"num",ans:d1,tolR:0.015,unit:"m",
        expl:`Aire du triangle sous la courbe : ${F(`d<sub>1</sub> = ${FRAC(`${p.t1} × ${nf(p.V)}`,2)}`)} = ${U(d1,"m")}.`,
        lire:`Figure 1 : pendant l'accélération, de 0 s à ${p.t1} s, la vitesse monte de 0 à ${nf(p.V)} m/s.`,
        met:[`La distance parcourue est l'aire sous la courbe v(t).`,`Pendant l'accélération, cette aire est un triangle de base ${p.t1} s et de hauteur ${nf(p.V)} m/s.`,`${F(`d<sub>1</sub> = ${FRAC(`${p.t1} × ${nf(p.V)}`,2)} = ${S3(d1)} m`)}.`],
        piege:`Oublier de diviser par 2 : on calcule alors l'aire d'un rectangle, comme si la vitesse était maximale dès le départ.`,
        ret:`Distance parcourue = aire sous la courbe v(t).`,
        diag:dgs(d1,[{v:p.V*p.t1,m:`tu as calculé v × t, l'aire d'un rectangle. Pendant l'accélération, l'aire est un triangle : divise par 2.`},{v:p.V/p.t1,m:`tu as calculé la pente de la courbe : c'est l'accélération. La distance est l'aire sous la courbe.`},{v:p.V*p.t3/2,m:`tu as pris la durée de tout le déplacement. L'accélération finit à ${p.t1} s.`}])},
      {q:`Déduis-en la distance totale D parcourue pendant tout le déplacement.`,nom:"D",type:"num",ans:D,tolR:0.015,unit:"m",don,
        expl:`${S3(d1)} + ${nf(p.V)} × ${p.tp} + ${FRAC(`${p.td} × ${nf(p.V)}`,2)} = ${U(D,"m")}.`,
        lire:`Figure 1 : vitesse constante de ${p.t1} s à ${p.t2} s (${p.tp} s), freinage de ${p.t2} s à ${p.t3} s (${p.td} s).`,
        met:[`On ajoute les aires des trois phases.`,`Vitesse constante : un rectangle, ${F(`${nf(p.V)} × ${p.tp} = ${S3(d2)} m`)}.`,`Freinage : un triangle, ${F(`${FRAC(`${p.td} × ${nf(p.V)}`,2)} = ${S3(d3)} m`)}.`,`${F(`D = ${S3(d1)} + ${S3(d2)} + ${S3(d3)} = ${S3(D)} m`)}.`],
        piege:`Multiplier la vitesse maximale par la durée totale : pendant l'accélération et le freinage, la vitesse est plus petite.`,
        ret:`Trapèze de vitesse : distance = triangle + rectangle + triangle.`,
        diag:dgs(D,[{v:p.V*p.t3,m:`tu as multiplié la vitesse maximale par la durée totale. Pendant l'accélération et le freinage, la vitesse est plus petite : ces deux aires sont des triangles.`},{v:d2,m:`tu as compté seulement la phase à vitesse constante. Ajoute les distances de l'accélération et du freinage.`},{v:d1+d2,m:`tu as oublié la distance parcourue pendant le freinage.`},{v:2*d1+d2,m:`tu as compté le freinage comme l'accélération. Ici le freinage dure ${p.td} s.`}])}]; },
  /* d2 · vitesse exigée et diamètre de roue : vitesse angulaire, puis fréquence de rotation */
  ()=>{ const s=rnd([{n:"robot de livraison",a:"Le robot",V:[6,9,12],D:[200,250,300]},{n:"trottinette électrique",a:"La trottinette",V:[20,25],D:[200,250]},{n:"fauteuil roulant électrique",a:"Le fauteuil",V:[6,8,10],D:[300,320,350]},{n:"vélo à assistance électrique",a:"Le vélo",V:[25],D:[650,700]}]), Vk=rnd(s.V), D=rnd(s.D), v=Vk/3.6, R=D/2000, w=v/R, N=w*60/TPI;
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Vitesse",txt:`${s.a} doit rouler à ${Vk} km/h sur le plat.`}]}))+DOC(2,"caractéristiques d'une roue",d2Fiche({lignes:[["Diamètre",`${D} mm`],["Largeur",`${rnd([40,50,60])} mm`],["Masse",`${nf(rnd([1.2,1.8,2.5]))} kg`]]}));
    const don=`exigence 1.1 : ${Vk} km/h ; roue de diamètre ${D} mm`;
    return [{fig,don,q:`À l'aide des figures 1 et 2, détermine la vitesse angulaire ${sb("ω","r")} des roues, en rad/s, à la vitesse exigée. Les roues roulent sans glisser.`,nom:sb("ω","r"),type:"num",ans:w,tolR:0.01,unit:"rad/s",
        expl:`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)} ; ${F(`ω<sub>r</sub> = ${FRAC("v","R")}`)} = ${FRAC(S3(v),nf(R,3))} = ${U(w,"rad/s")}.`,
        lire:`Figure 1, exigence 1.1 : ${Vk} km/h. Figure 2 : diamètre ${D} mm, donc ${F(`R = ${nf(R,3)} m`)}.`,
        met:[`Convertis la vitesse en m/s : ${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`,`Roulement sans glissement : ${F("v = R·ω<sub>r</sub>")}, donc ${F(`ω<sub>r</sub> = ${FRAC("v","R")}`)}, avec R en mètres.`,`${F(`ω<sub>r</sub> = ${FRAC(S3(v),nf(R,3))} = ${S3(w)} rad/s`)}.`],
        piege:`Garder la vitesse en km/h, ou prendre le diamètre à la place du rayon.`,
        ret:`${F("v = R·ω")} : v en m/s, R en m, ω en rad/s.`,
        diag:dgs(w,[{v:Vk/R,m:`tu as gardé la vitesse en km/h. Convertis-la en m/s avant de diviser par le rayon.`},{v:v/(2*R),m:`tu as divisé par le diamètre. Dans v = R·ω, R est le rayon.`},{v:v*R,m:`tu as multiplié la vitesse par le rayon. On isole ω : on divise la vitesse par le rayon.`},{v:v/(R*1000),m:`tu as laissé le rayon en millimètres. Convertis-le en mètres.`}])},
      {q:`Déduis-en la fréquence de rotation ${sb("N","r")} des roues, en tr/min.`,nom:sb("N","r"),type:"num",ans:N,tolR:0.01,unit:"tr/min",don,
        expl:`${F(`N<sub>r</sub> = ${FRAC("60·ω<sub>r</sub>","2π")}`)} = ${FRAC(`60 × ${S3(w)}`,"2π")} = ${U(N,"tr/min")}.`,
        lire:`Question précédente : ${F(`ω<sub>r</sub> = ${S3(w)} rad/s`)}.`,
        met:[`Un tour vaut 2π radians : en une seconde, la roue fait ${FRAC("ω<sub>r</sub>","2π")} tours.`,`En une minute, elle en fait 60 fois plus : ${F(`N<sub>r</sub> = ${FRAC("60·ω<sub>r</sub>","2π")}`)}.`,`${F(`N<sub>r</sub> = ${FRAC(`60 × ${S3(w)}`,"2π")} = ${S3(N)} tr/min`)}.`],
        piege:`Faire la conversion dans l'autre sens : multiplier par 2π et diviser par 60.`,
        ret:`${F(`N = ${FRAC("60·ω","2π")}`)} (ω en rad/s, N en tr/min).`,
        diag:dgs(N,[{v:w*TPI/60,m:`tu as fait la conversion à l'envers. Des rad/s aux tr/min, on multiplie par 60 et on divise par 2π.`},{v:w/TPI,m:`ta valeur est en tours par seconde. Multiplie par 60 pour avoir des tr/min.`},{v:w*60,m:`tu as multiplié par 60 sans diviser par 2π : ta valeur est en radians par minute.`}])}]; },
  /* d3 · courbe x(t) : vitesse = pente, puis durée d'un parcours */
  ()=>{ const ys=rnd([0.5,1,2]), X=rnd([3,4,5])*ys, T=rnd([4,5,6,8,10]), v=X/T, Lc=rnd([12,15,18,24,30]), xs=T<=6?1:2, t=Lc/v;
    const fig=DOC(1,"position d'un colis sur le convoyeur, relevée par un capteur",d2Courbe({pts:[[0,0],[T,X]],xm:T+xs,ym:X+ys,xs,ys,sub:xs===2?2:1,xl:"t (s)",yl:"x (m)",label:"Position en fonction du temps : une droite qui part de l'origine"}))+DOC(2,"caractéristiques du convoyeur",d2Fiche({lignes:[["Longueur",`${Lc} m`],["Largeur de la bande",`${rnd([400,500,600])} mm`],["Charge maximale",`${rnd([30,50,80])} kg`]]}));
    const don=`courbe x(t) : droite de 0 m à 0 s jusqu'à ${nf(X)} m à ${T} s ; convoyeur de longueur ${Lc} m`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine la vitesse v du colis.`,nom:"v",type:"num",ans:v,tolR:0.015,unit:"m/s",
        expl:`${F(`v = ${FRAC("Δx","Δt")}`)} = ${FRAC(nf(X),T)} = ${U(v,"m/s")}.`,
        lire:`Figure 1 : la droite passe par l'origine et par le point (${T} s ; ${nf(X)} m).`,
        met:[`La courbe x(t) est une droite : la vitesse est constante, c'est la pente de la droite.`,`Lis un point de la droite : à ${F(`t = ${T} s`)}, ${F(`x = ${nf(X)} m`)}.`,`${F(`v = ${FRAC("Δx","Δt")} = ${FRAC(nf(X),T)} = ${S3(v)} m/s`)}.`],
        piege:`Donner la position lue sur la courbe : une position est en mètres, la vitesse est une pente, en m/s.`,
        ret:`Sur une courbe x(t), la vitesse est la pente : ${F(`v = ${FRAC("Δx","Δt")}`)}.`,
        diag:dgs(v,[{v:X*T,m:`tu as multiplié la position par la durée. La vitesse est une pente : on divise la distance par la durée.`},{v:T/X,m:`tu as divisé la durée par la distance. C'est l'inverse : on divise la distance par la durée.`},{v:X,m:`tu as donné la position lue sur la courbe, en mètres. La vitesse est la pente de la droite.`}])},
      {q:`Déduis-en la durée nécessaire pour qu'un colis parcoure toute la longueur du convoyeur (figure 2).`,type:"num",ans:t,tolR:0.015,unit:"s",don,
        expl:`${F(`t = ${FRAC("L","v")}`)} = ${FRAC(Lc,S3(v))} = ${U(t,"s")}.`,
        lire:`Figure 2, ligne « Longueur » : ${Lc} m. Question précédente : ${F(`v = ${S3(v)} m/s`)}.`,
        met:[`À vitesse constante : ${F("L = v·t")}, donc ${F(`t = ${FRAC("L","v")}`)}.`,`${F(`t = ${FRAC(Lc,S3(v))} = ${S3(t)} s`)}.`],
        piege:`Multiplier la longueur par la vitesse au lieu de diviser.`,
        ret:`Mouvement uniforme : ${F("d = v·t")}.`,
        diag:dgs(t,[{v:Lc*v,m:`tu as multiplié la longueur par la vitesse. On isole la durée : on divise la longueur par la vitesse.`},{v:v/Lc,m:`tu as divisé la vitesse par la longueur. C'est l'inverse : on divise la longueur par la vitesse.`},{v:T,m:`tu as relu la durée de la mesure sur la figure 1. Le convoyeur mesure ${Lc} m : calcule la durée avec la vitesse.`}])}]; },
  /* d4 · démarrage à accélération constante : durée pour atteindre la vitesse, puis distance */
  ()=>{ const s=rnd([{n:"tramway",a:"Le tramway",m:[38000,42000]},{n:"navette autonome",a:"La navette",m:[2800,3200]},{n:"bus électrique",a:"Le bus",m:[16000,18000]}]), Vk=rnd([18,27,36,45,54,72]), a=rnd([0.5,0.8,1,1.2,1.5]), v=Vk/3.6, t=v/a, d=a*t*t/2;
    const fig=DOC(1,`caractéristiques du véhicule (${s.n})`,d2Fiche({lignes:[["Vitesse de croisière",`${Vk} km/h`],["Accélération au démarrage",`${nf(a)} m/s²`],["Masse en charge",`${nf(rnd(s.m),0)} kg`]]}));
    const don=`vitesse de croisière ${Vk} km/h ; accélération ${nf(a)} m/s²`;
    return [{fig,don,q:`${s.a} démarre, à l'arrêt, avec une accélération constante. À l'aide de la figure 1, détermine la durée t nécessaire pour atteindre la vitesse de croisière.`,nom:"t",type:"num",ans:t,tolR:0.01,unit:"s",
        expl:`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)} ; ${F(`t = ${FRAC("v","a")}`)} = ${FRAC(S3(v),nf(a))} = ${U(t,"s")}.`,
        lire:`Figure 1 : vitesse de croisière ${Vk} km/h, accélération ${nf(a)} m/s². La masse ne sert pas ici.`,
        met:[`Convertis la vitesse en m/s : ${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`,`Départ arrêté, accélération constante : ${F("v = a·t")}, donc ${F(`t = ${FRAC("v","a")}`)}.`,`${F(`t = ${FRAC(S3(v),nf(a))} = ${S3(t)} s`)}.`],
        piege:`Garder la vitesse en km/h : l'accélération est en m/s², il faut des m/s.`,
        ret:`Départ arrêté, accélération constante : ${F("v = a·t")}.`,
        diag:dgs(t,[{v:Vk/a,m:`tu as gardé la vitesse en km/h. Convertis-la en m/s (divise par 3,6) avant de diviser par l'accélération.`},{v:v*a,m:`tu as multiplié la vitesse par l'accélération. On isole la durée : on divise la vitesse par l'accélération.`},{v:a/v,m:`tu as divisé l'accélération par la vitesse. C'est l'inverse.`}])},
      {q:`Déduis-en la distance d parcourue pendant ce démarrage.`,nom:"d",type:"num",ans:d,tolR:0.015,unit:"m",don,
        expl:`${F(`d = ${FRAC("a·t²","2")}`)} = ${FRAC(`${nf(a)} × ${S3(t)}²`,2)} = ${U(d,"m")}.`,
        lire:`Figure 1 : accélération ${nf(a)} m/s². Question précédente : ${F(`t = ${S3(t)} s`)}.`,
        met:[`Départ arrêté, accélération constante : ${F(`d = ${FRAC("a·t²","2")}`)}.`,`${F(`d = ${FRAC(`${nf(a)} × ${S3(t)}²`,2)} = ${S3(d)} m`)}.`,`Autre façon : c'est l'aire du triangle sous v(t), ${F(`${FRAC("v·t","2")} = ${FRAC(`${S3(v)} × ${S3(t)}`,2)} = ${S3(d)} m`)}.`],
        piege:`Calculer v × t : c'est la distance à vitesse constante. Pendant le démarrage, la vitesse moyenne est la moitié de v.`,
        ret:`Départ arrêté : ${F(`d = ${FRAC("a·t²","2")}`)}.`,
        diag:dgs(d,[{v:v*t,m:`tu as calculé v × t, comme si la vitesse de croisière était atteinte dès le départ. Pendant le démarrage, la distance est la moitié : divise par 2.`},{v:a*t/2,m:`tu as oublié le carré : la durée est au carré dans la relation.`},{v:Vk*Vk/(2*a),m:`tu as utilisé la vitesse en km/h. Prends la durée de la question précédente, ou la vitesse en m/s.`}])}]; },
  /* d5 · rotation : vitesse angulaire moyenne (degrés → radians), puis vitesse de l'extrémité */
  ()=>{ const th=rnd([90,100,110,120]), t=rnd([0.5,0.6,0.8,1]), Lb=rnd([40,45,50,55,60]), w=th*Math.PI/180/t, v=w*Lb/100;
    const fig=DOC(1,"caractéristiques d'un essuie-glace",d2Fiche({lignes:[["Angle balayé pendant un aller",`${th}°`],["Durée d'un aller",`${nf(t)} s`],["Longueur du balai, de l'axe à l'extrémité",`${Lb} cm`],["Tension d'alimentation","12 V"]]}));
    const don=`angle balayé ${th}° ; durée d'un aller ${nf(t)} s ; balai de longueur ${Lb} cm`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine la vitesse angulaire moyenne ω du balai pendant un aller, en rad/s.`,nom:"ω",type:"num",ans:w,tolR:0.01,unit:"rad/s",
        expl:`${F(`θ = ${FRAC(`${th} × π`,180)} = ${S3(th*Math.PI/180)} rad`)} ; ${F(`ω = ${FRAC("θ","t")}`)} = ${FRAC(S3(th*Math.PI/180),nf(t))} = ${U(w,"rad/s")}.`,
        lire:`Figure 1 : angle balayé ${th}°, durée d'un aller ${nf(t)} s. La tension ne sert pas ici.`,
        met:[`Convertis l'angle en radians : ${F(`θ = ${FRAC(`${th} × π`,180)} = ${S3(th*Math.PI/180)} rad`)}.`,`Vitesse angulaire moyenne : ${F(`ω = ${FRAC("θ","t")}`)}.`,`${F(`ω = ${FRAC(S3(th*Math.PI/180),nf(t))} = ${S3(w)} rad/s`)}.`],
        piege:`Laisser l'angle en degrés : on obtient des degrés par seconde.`,
        ret:`180° = π rad ; ${F(`ω = ${FRAC("θ","t")}`)} avec θ en radians.`,
        diag:dgs(w,[{v:th/t,m:`tu as laissé l'angle en degrés : ta valeur est en degrés par seconde. Convertis l'angle en radians (multiplie par π, divise par 180).`},{v:th*Math.PI/180*t,m:`tu as multiplié l'angle par la durée. On divise l'angle par la durée.`},{v:th*Math.PI/180,m:`tu as donné l'angle en radians. Divise-le par la durée d'un aller.`}])},
      {q:`Déduis-en la vitesse moyenne v de l'extrémité du balai, en m/s.`,nom:"v",type:"num",ans:v,tolR:0.01,unit:"m/s",don,
        expl:`${F("v = R·ω")} = ${nf(Lb/100)} × ${S3(w)} = ${U(v,"m/s")}.`,
        lire:`Figure 1 : longueur du balai ${Lb} cm, soit ${F(`R = ${nf(Lb/100)} m`)}. Question précédente : ${F(`ω = ${S3(w)} rad/s`)}.`,
        met:[`L'extrémité du balai décrit un arc de cercle de rayon ${F(`R = ${nf(Lb/100)} m`)}.`,`${F("v = R·ω")}, avec R en mètres.`,`${F(`v = ${nf(Lb/100)} × ${S3(w)} = ${S3(v)} m/s`)}.`],
        piege:`Laisser la longueur en centimètres : la vitesse sortirait en cm/s.`,
        ret:`Point d'un solide en rotation : ${F("v = R·ω")}.`,
        diag:dgs(v,[{v:w*Lb,m:`tu as laissé la longueur en centimètres : ta valeur est en cm/s. Convertis la longueur en mètres.`},{v:w/(Lb/100),m:`tu as divisé par le rayon. La vitesse de l'extrémité vaut R·ω : on multiplie.`},{v:w*Lb/200,m:`tu as pris la moitié de la longueur. Le rayon de la trajectoire de l'extrémité est la longueur entière du balai.`}])}]; }
];

const C2N3=[
  /* Étude A · ascenseur : durée d'un trajet (accélération, vitesse constante, freinage) et exigence de durée */
  ()=>{ const o=draw(()=>{ const H=rnd([6,9,12,15,18,24]), V=rnd([1,1.5,2,2.5]), a=rnd([0.5,0.8,1,1.25]), t1=V/a, d1=V*t1/2, T=2*t1+(H-2*d1)/V, Tx=rnd([6,8,10,12,15,18,20,25]); return {H,V,a,t1,d1,T,Tx}; },o=>o.H-2*o.d1>=0.25*o.H&&far(o.T,o.Tx,0.08)&&o.T<1.7*o.Tx&&o.T>o.Tx/1.7);
    const {H,V,a,t1,d1,T,Tx}=o, tc=(H-2*d1)/V;
    const fig=DOC(1,"extrait du diagramme des exigences de l'ascenseur",d2Exig({reqs:[{id:"1.1",nom:"Durée du trajet",txt:`La cabine doit relier les deux niveaux en moins de ${Tx} s.`},{id:"1.2",nom:"Course",txt:`La distance entre les deux niveaux est de ${H} m.`}]}))+
      DOC(2,"caractéristiques données par le constructeur",d2Fiche({lignes:[["Vitesse nominale de la cabine",`${nf(V)} m/s`],["Accélération au démarrage, décélération au freinage",`${nf(a)} m/s²`],["Charge utile",`${rnd([630,800,1000])} kg`]]}))+
      DOC(3,"allure de la vitesse de la cabine pendant un trajet",d2Courbe({pts:[[0,0],[2,3],[7,3],[9,0]],xm:10,ym:4,xl:"t",yl:"v",xt:[[2,"t₁",3],[7,"t₂",3],[9,"T",0]],yt:[[3,"V",2]],h:190,label:"Trapèze de vitesse : accélération jusqu'à t1, vitesse constante V jusqu'à t2, arrêt à T"}));
    const don=`exigence 1.1 : moins de ${Tx} s ; course ${H} m ; vitesse nominale ${nf(V)} m/s ; accélération ${nf(a)} m/s²`;
    return [{fig,don,ctx0:`Étude d'un ascenseur : on vérifie la durée d'un trajet entre deux niveaux.`,q:`À l'aide de la figure 2, détermine la durée ${sb("t","1")} de la phase d'accélération : la cabine démarre, à l'arrêt, et atteint sa vitesse nominale (figure 3).`,nom:sb("t","1"),type:"num",ans:t1,tolR:0.01,unit:"s",
        expl:`${F(`t<sub>1</sub> = ${FRAC("V","a")}`)} = ${FRAC(nf(V),nf(a))} = ${U(t1,"s")}.`,
        lire:`Figure 2 : vitesse nominale ${nf(V)} m/s, accélération ${nf(a)} m/s². La charge utile ne sert pas ici.`,
        met:[`Départ arrêté, accélération constante : ${F("V = a·t<sub>1</sub>")}.`,`On isole la durée : ${F(`t<sub>1</sub> = ${FRAC("V","a")}`)}.`,`${F(`t<sub>1</sub> = ${FRAC(nf(V),nf(a))} = ${S3(t1)} s`)}.`],
        piege:`Multiplier la vitesse par l'accélération au lieu de diviser.`,
        ret:`Départ arrêté, accélération constante : ${F("v = a·t")}.`,
        diag:dgs(t1,[{v:V*a,m:`tu as multiplié la vitesse par l'accélération. On isole la durée : on divise la vitesse par l'accélération.`},{v:a/V,m:`tu as divisé l'accélération par la vitesse. C'est l'inverse.`},{v:H/V,m:`tu as calculé la durée de toute la course à la vitesse nominale. La question porte sur la phase d'accélération.`}])},
      {q:`Détermine la distance ${sb("d","1")} parcourue par la cabine pendant cette phase d'accélération.`,nom:sb("d","1"),type:"num",ans:d1,tolR:0.015,unit:"m",don,
        expl:`Aire du triangle sous v(t) : ${F(`d<sub>1</sub> = ${FRAC("V·t<sub>1</sub>","2")}`)} = ${FRAC(`${nf(V)} × ${S3(t1)}`,2)} = ${U(d1,"m")}.`,
        lire:`Figure 3 : pendant l'accélération, l'aire sous la courbe est un triangle. Question précédente : ${F(`t<sub>1</sub> = ${S3(t1)} s`)}.`,
        met:[`La distance parcourue est l'aire sous la courbe v(t).`,`Pendant l'accélération, c'est un triangle de base ${sb("t","1")} et de hauteur V : ${F(`d<sub>1</sub> = ${FRAC("V·t<sub>1</sub>","2")}`)}.`,`${F(`d<sub>1</sub> = ${FRAC(`${nf(V)} × ${S3(t1)}`,2)} = ${S3(d1)} m`)}.`],
        piege:`Calculer V × t₁ : pendant l'accélération, la vitesse moyenne n'est que la moitié de V.`,
        ret:`Départ arrêté : ${F(`d = ${FRAC("v·t","2")} = ${FRAC("a·t²","2")}`)}.`,
        diag:dgs(d1,[{v:V*t1,m:`tu as calculé V × t₁, l'aire d'un rectangle. Pendant l'accélération, l'aire est un triangle : divise par 2.`},{v:a*t1/2,m:`tu as oublié le carré de la durée, ou utilisé l'accélération à la place de la vitesse.`},{v:H/2,m:`tu as pris la moitié de la course. La distance d'accélération se calcule avec la vitesse et la durée.`}])},
      {q:`Le freinage dure autant que l'accélération et couvre la même distance. Détermine la durée totale T du trajet entre les deux niveaux.`,nom:"T",type:"num",ans:T,tolR:0.015,unit:"s",don,
        expl:`Vitesse constante sur ${H} − 2 × ${S3(d1)} = ${S3(H-2*d1)} m, soit ${S3(tc)} s ; ${F(`T = 2 × ${S3(t1)} + ${S3(tc)}`)} = ${U(T,"s")}.`,
        lire:`Figure 1, exigence 1.2 : course de ${H} m. Questions précédentes : ${F(`t<sub>1</sub> = ${S3(t1)} s`)} et ${F(`d<sub>1</sub> = ${S3(d1)} m`)}.`,
        met:[`Accélération et freinage : ${F(`2 × ${S3(t1)} = ${S3(2*t1)} s`)} pour ${F(`2 × ${S3(d1)} = ${S3(2*d1)} m`)}.`,`Il reste ${F(`${H} − ${S3(2*d1)} = ${S3(H-2*d1)} m`)} à vitesse constante : ${F(`${FRAC(S3(H-2*d1),nf(V))} = ${S3(tc)} s`)}.`,`${F(`T = ${S3(2*t1)} + ${S3(tc)} = ${S3(T)} s`)}.`],
        piege:`Diviser toute la course par la vitesse nominale : la cabine ne roule pas à cette vitesse pendant l'accélération et le freinage.`,
        ret:`Trapèze de vitesse : on traite les trois phases l'une après l'autre.`,
        diag:dgs(T,[{v:H/V,m:`tu as divisé toute la course par la vitesse nominale. Pendant l'accélération et le freinage, la cabine va moins vite : le trajet dure plus longtemps.`},{v:2*t1+H/V,m:`tu as compté toute la course à vitesse constante. Retire d'abord les distances parcourues pendant l'accélération et le freinage.`},{v:t1+(H-d1)/V,m:`tu as oublié la phase de freinage.`},{v:tc,m:`tu as donné la durée de la phase à vitesse constante. Ajoute les durées de l'accélération et du freinage.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:"la durée du trajet",val:T,u:"s",lim:Tx,limTxt:`moins de ${Tx} s`,ph:"La cabine relie les deux niveaux en",
        lire:`Figure 1, exigence 1.1 : moins de ${Tx} s. Question précédente : ${S3(T)} s.`,faux:`la vitesse nominale de la cabine vaut ${nf(V)} m/s`,fauxW:`la vitesse nominale ne répond pas à l'exigence : on compare la durée du trajet (${S3(T)} s) à la durée exigée (${Tx} s).`,remede:`Il faudrait une vitesse nominale plus grande, ou une accélération plus forte`})]; },
  /* Étude B · courbe de vitesse mesurée : vitesse, distance, décélération, exigence de freinage */
  ()=>{ const o=draw(()=>{ const p=trap(), ad=p.V/p.td, Ax=rnd([0.2,0.3,0.4,0.5,0.6,0.8,1,1.2,1.5]); return {p,ad,Ax}; },o=>far(o.ad,o.Ax,0.1)&&o.ad<2.2*o.Ax&&o.ad>o.Ax/2.2);
    const {p,ad,Ax}=o, D=p.V*(p.t3+p.tp)/2, s=rnd([{n:"chariot de transfert",le:"du chariot",c:"les pièces posées sur le chariot ne doivent pas glisser"},{n:"navette autonome",le:"de la navette",c:"les passagers debout ne doivent pas être déséquilibrés"},{n:"convoyeur à bande",le:"de la bande",c:"les colis ne doivent pas basculer"}]);
    const fig=figTrap(p,1,`vitesse ${s.le} mesurée pendant un déplacement (${s.n})`)+DOC(2,`extrait du diagramme des exigences (${s.n})`,d2Exig({reqs:[{id:"1.1",nom:"Freinage",txt:`La décélération ${s.le} ne doit pas dépasser ${nf(Ax)} m/s² : ${s.c}.`}]}));
    const don=`${donTrap(p)} ; exigence 1.1 : ${nf(Ax)} m/s² au plus`;
    return [{fig,don,ctx0:`Étude d'un déplacement mesuré (${s.n}) : on vérifie que le freinage respecte l'exigence.`,q:`À l'aide de la figure 1, relève la vitesse maximale V ${s.le}.`,nom:"V",type:"num",ans:p.V,tolR:0.02,unit:"m/s",
        expl:`Le palier de la courbe est à ${F(`V = ${nf(p.V)} m/s`)}.`,
        lire:`Figure 1 : le palier horizontal, entre ${p.t1} s et ${p.t2} s.`,
        met:[`La vitesse maximale est la hauteur du palier de la courbe.`,`On la lit sur l'axe vertical : ${F(`V = ${nf(p.V)} m/s`)}.`],
        piege:`Lire une valeur sur l'axe horizontal : c'est un temps.`,
        ret:`Sur v(t), la vitesse se lit sur l'axe vertical.`,
        diag:dgs(p.V,[{v:p.t1,m:`tu as lu ${p.t1} sur l'axe horizontal : c'est un instant, en secondes. La vitesse se lit sur l'axe vertical.`},{v:p.t3,m:`tu as lu la durée du déplacement. La vitesse se lit sur l'axe vertical.`},{v:p.ym,m:`tu as lu le haut de l'axe vertical. Lis la hauteur du palier.`}])},
      {q:`Détermine la distance totale D parcourue pendant ce déplacement.`,nom:"D",type:"num",ans:D,tolR:0.015,unit:"m",don,
        expl:`Aire sous la courbe : ${FRAC(`${p.t1} × ${nf(p.V)}`,2)} + ${nf(p.V)} × ${p.tp} + ${FRAC(`${p.td} × ${nf(p.V)}`,2)} = ${U(D,"m")}.`,
        lire:`Figure 1 : accélération de 0 s à ${p.t1} s, vitesse constante jusqu'à ${p.t2} s, freinage jusqu'à ${p.t3} s.`,
        met:[`La distance parcourue est l'aire sous la courbe v(t) : un triangle, un rectangle, un triangle.`,`Accélération : ${F(`${FRAC(`${p.t1} × ${nf(p.V)}`,2)} = ${S3(p.V*p.t1/2)} m`)}. Vitesse constante : ${F(`${nf(p.V)} × ${p.tp} = ${S3(p.V*p.tp)} m`)}. Freinage : ${F(`${FRAC(`${p.td} × ${nf(p.V)}`,2)} = ${S3(p.V*p.td/2)} m`)}.`,`${F(`D = ${S3(p.V*p.t1/2)} + ${S3(p.V*p.tp)} + ${S3(p.V*p.td/2)} = ${S3(D)} m`)}.`],
        piege:`Multiplier la vitesse maximale par la durée totale : pendant l'accélération et le freinage, la vitesse est plus petite.`,
        ret:`Distance parcourue = aire sous la courbe v(t).`,
        diag:dgs(D,[{v:p.V*p.t3,m:`tu as multiplié la vitesse maximale par la durée totale. Pendant l'accélération et le freinage, la vitesse est plus petite : ces deux aires sont des triangles.`},{v:p.V*p.tp,m:`tu as compté seulement la phase à vitesse constante. Ajoute les distances de l'accélération et du freinage.`},{v:p.V*p.t1/2+p.V*p.tp,m:`tu as oublié la distance parcourue pendant le freinage.`}])},
      {q:`Détermine la décélération ${s.le} pendant le freinage. Donne une valeur positive.`,nom:"décélération",type:"num",ans:ad,tolR:0.015,unit:"m/s²",don,
        expl:`Pendant le freinage, la vitesse passe de ${nf(p.V)} m/s à 0 en ${p.td} s : ${FRAC(nf(p.V),p.td)} = ${U(ad,"m/s²")}.`,
        lire:`Figure 1 : le freinage va de ${p.t2} s à ${p.t3} s, il dure ${p.td} s. La vitesse passe de ${nf(p.V)} m/s à 0.`,
        met:[`La décélération est la pente de la courbe pendant le freinage : ${FRAC("Δv","Δt")}, sans le signe.`,`${F(`Δv = ${nf(p.V)} m/s`)} et ${F(`Δt = ${p.t3} − ${p.t2} = ${p.td} s`)}.`,`${F(`${FRAC(nf(p.V),p.td)} = ${S3(ad)} m/s²`)}.`],
        piege:`Diviser par l'instant de fin (${p.t3} s) au lieu de la durée du freinage (${p.td} s).`,
        ret:`Accélération ou décélération = pente de v(t).`,
        diag:dgs(ad,[{v:p.V/p.t3,m:`tu as divisé par l'instant de fin du freinage (${p.t3} s). Il faut la durée du freinage : ${p.t3} − ${p.t2} = ${p.td} s.`},{v:p.V/p.t1,m:`tu as calculé la pente de la phase d'accélération. Le freinage va de ${p.t2} s à ${p.t3} s.`},{v:p.V*p.td,m:`tu as multiplié la vitesse par la durée. Une décélération est une pente : on divise.`},{v:p.V/p.t2,m:`tu as divisé par ${p.t2} s, l'instant où le freinage commence. Il faut la durée du freinage : ${p.td} s.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1 (figure 2). Rédige ta réponse.`,don,exi:"1.1",quoi:"la décélération pendant le freinage",val:ad,u:"m/s²",lim:Ax,limTxt:`${nf(Ax)} m/s² au plus`,ph:`Pendant le freinage, la décélération ${s.le} vaut`,
        lire:`Figure 2, exigence 1.1 : ${nf(Ax)} m/s² au plus. Question précédente : ${S3(ad)} m/s².`,faux:`la vitesse maximale vaut ${nf(p.V)} m/s`,fauxW:`la vitesse maximale ne répond pas à l'exigence : on compare la décélération (${S3(ad)} m/s²) à la limite (${nf(Ax)} m/s²).`,remede:`Il faudrait freiner plus longtemps, pour la même vitesse`})]; },
  /* Étude C · barrière levante : vitesse angulaire, vitesse de l'extrémité, durée d'ouverture, exigence */
  ()=>{ const o=draw(()=>{ const N=rnd([2,2.5,3,4,5,6]), Lg=rnd([3,4,5,6]), w=TPI*N/60, v=w*Lg, t=(Math.PI/2)/w, Tx=rnd([2,3,4,5,6,8,10]); return {N,Lg,w,v,t,Tx}; },o=>far(o.t,o.Tx,0.08)&&o.t<1.8*o.Tx&&o.t>o.Tx/1.8);
    const {N,Lg,w,v,t,Tx}=o;
    const fig=DOC(1,"extrait du diagramme des exigences d'une barrière levante de parking",d2Exig({reqs:[{id:"1.1",nom:"Durée d'ouverture",txt:`La lisse doit s'ouvrir de 90° en moins de ${Tx} s.`},{id:"1.2",nom:"Largeur de passage",txt:`La lisse barre une voie de ${Lg} m.`}]}))+
      DOC(2,"caractéristiques du motoréducteur et de la lisse",d2Fiche({lignes:[["Fréquence de rotation de la lisse",`${nf(N)} tr/min`],["Longueur de la lisse",`${Lg} m`],["Tension d'alimentation","230 V"]]}));
    const don=`exigence 1.1 : 90° en moins de ${Tx} s ; lisse : ${nf(N)} tr/min, longueur ${Lg} m`;
    return [{fig,don,ctx0:`Étude d'une barrière levante : la lisse tourne autour de son axe pour s'ouvrir. On vérifie la durée d'ouverture.`,q:`À l'aide de la figure 2, détermine la vitesse angulaire ω de la lisse, en rad/s.`,nom:"ω",type:"num",ans:w,tolR:0.01,unit:"rad/s",
        expl:`${F(`ω = ${FRAC("2π·N","60")}`)} = ${FRAC(`2π × ${nf(N)}`,"60")} = ${U(w,"rad/s")}.`,
        lire:`Figure 2, ligne « Fréquence de rotation de la lisse » : ${nf(N)} tr/min.`,
        met:[`Un tour vaut 2π radians et une minute vaut 60 secondes : ${F(`ω = ${FRAC("2π·N","60")}`)}.`,`${F(`ω = ${FRAC(`2π × ${nf(N)}`,"60")} = ${S3(w)} rad/s`)}.`],
        piege:`Diviser seulement par 60 : on obtient des tours par seconde.`,
        ret:`${F(`ω = ${FRAC("2π·N","60")}`)} (N en tr/min, ω en rad/s).`,
        diag:dgs(w,[{v:N/60,m:`tu as divisé par 60 : ta valeur est en tours par seconde. Multiplie encore par 2π.`},{v:N*TPI,m:`tu as multiplié par 2π sans diviser par 60 : ta valeur est en radians par minute.`},{v:N,m:`tu as recopié la valeur en tr/min. La question demande des rad/s.`}])},
      {q:`Détermine la vitesse v de l'extrémité de la lisse pendant l'ouverture.`,nom:"v",type:"num",ans:v,tolR:0.01,unit:"m/s",don,
        expl:`${F("v = R·ω")} = ${Lg} × ${S3(w)} = ${U(v,"m/s")}.`,
        lire:`Figure 2 : longueur de la lisse ${Lg} m. Question précédente : ${F(`ω = ${S3(w)} rad/s`)}.`,
        met:[`L'extrémité de la lisse décrit un arc de cercle de rayon ${F(`R = ${Lg} m`)}.`,`${F(`v = R·ω = ${Lg} × ${S3(w)} = ${S3(v)} m/s`)}.`],
        piege:`Utiliser la fréquence de rotation en tr/min : dans v = R·ω, ω est en rad/s.`,
        ret:`Point d'un solide en rotation : ${F("v = R·ω")}.`,
        diag:dgs(v,[{v:N*Lg,m:`tu as utilisé la fréquence de rotation en tr/min. Dans v = R·ω, il faut ω en rad/s.`},{v:w/Lg,m:`tu as divisé par la longueur. La vitesse de l'extrémité vaut R·ω : on multiplie.`},{v:w*Lg/2,m:`tu as pris la moitié de la longueur : c'est la vitesse du milieu de la lisse. L'extrémité est à ${Lg} m de l'axe.`}])},
      {q:`Détermine la durée t nécessaire pour ouvrir la lisse de 90°.`,nom:"t",type:"num",ans:t,tolR:0.01,unit:"s",don,
        expl:`${F(`90° = ${FRAC("π","2")} rad`)} ; ${F(`t = ${FRAC("θ","ω")}`)} = ${FRAC("1,57",S3(w))} = ${U(t,"s")}.`,
        lire:`Figure 1, exigence 1.1 : ouverture de 90°. Première question : ${F(`ω = ${S3(w)} rad/s`)}.`,
        met:[`Convertis l'angle en radians : ${F(`90° = ${FRAC("π","2")} = 1,57 rad`)}.`,`À vitesse angulaire constante : ${F("θ = ω·t")}, donc ${F(`t = ${FRAC("θ","ω")}`)}.`,`${F(`t = ${FRAC("1,57",S3(w))} = ${S3(t)} s`)}.`],
        piege:`Laisser l'angle en degrés alors que ω est en rad/s.`,
        ret:`Rotation uniforme : ${F("θ = ω·t")}, avec θ en radians.`,
        diag:dgs(t,[{v:90/w,m:`tu as laissé l'angle en degrés. Avec ω en rad/s, l'angle doit être en radians : 90° = π/2 rad.`},{v:(Math.PI/2)*w,m:`tu as multiplié l'angle par la vitesse angulaire. On isole la durée : on divise l'angle par ω.`},{v:TPI/w,m:`tu as pris un tour complet (2π rad). La lisse ne tourne que d'un quart de tour : π/2 rad.`},{v:Math.PI/w,m:`tu as pris un demi-tour (π rad). 90° est un quart de tour : π/2 rad.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:"la durée d'ouverture",val:t,u:"s",lim:Tx,limTxt:`moins de ${Tx} s`,ph:"La lisse s'ouvre de 90° en",
        lire:`Figure 1, exigence 1.1 : moins de ${Tx} s. Question précédente : ${S3(t)} s.`,faux:`l'extrémité de la lisse se déplace à ${S3(v)} m/s`,fauxW:`la vitesse de l'extrémité ne répond pas à l'exigence : on compare la durée d'ouverture (${S3(t)} s) à la durée exigée (${Tx} s).`,remede:`Il faudrait un motoréducteur qui fait tourner la lisse plus vite`})]; },
  /* Étude D · navette autonome : distance d'arrêt (temps de réaction, puis freinage) et exigence de sécurité */
  ()=>{ const o=draw(()=>{ const Vk=rnd([18,27,36,45,54]), tr=rnd([0.2,0.3,0.5,0.8]), a=rnd([2,3,4,5,6]), v=Vk/3.6, d1=v*tr, d2=v*v/(2*a), D=d1+d2, Dx=rnd([5,8,10,12,15,20,25,30,40,50]); return {Vk,tr,a,v,d1,d2,D,Dx}; },o=>far(o.D,o.Dx,0.08)&&o.D<1.7*o.Dx&&o.D>o.Dx/1.7);
    const {Vk,tr,a,v,d1,d2,D,Dx}=o, tf=v/a;
    const fig=DOC(1,"extrait du diagramme des exigences d'une navette autonome",d2Exig({reqs:[{id:"1.1",nom:"Arrêt d'urgence",txt:`La navette doit s'arrêter en moins de ${Dx} m après la détection d'un obstacle.`}]}))+
      DOC(2,"caractéristiques de la navette",d2Fiche({lignes:[["Vitesse de circulation",`${Vk} km/h`],["Temps de réaction du système",`${nf(tr)} s`],["Décélération au freinage",`${a} m/s²`],["Masse en charge",`${nf(rnd([2800,3200,3500]),0)} kg`]]}));
    const don=`exigence 1.1 : arrêt en moins de ${Dx} m ; vitesse ${Vk} km/h ; temps de réaction ${nf(tr)} s ; décélération ${a} m/s²`;
    return [{fig,don,ctx0:`Étude d'une navette autonome : un capteur détecte un obstacle. On vérifie la distance d'arrêt.`,q:`À l'aide de la figure 2, exprime la vitesse de circulation v de la navette en m/s.`,nom:"v",type:"num",ans:v,tolR:0.01,unit:"m/s",
        expl:`${F(`v = ${FRAC(Vk,"3,6")}`)} = ${U(v,"m/s")}.`,
        lire:`Figure 2, ligne « Vitesse de circulation » : ${Vk} km/h.`,
        met:[`Pour passer des km/h aux m/s, on divise par 3,6.`,`${F(`v = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`],
        piege:`Multiplier par 3,6 : c'est pour passer des m/s aux km/h.`,
        ret:`km/h → m/s : on divise par 3,6.`,
        diag:dgs(v,[{v:Vk*3.6,m:`tu as multiplié par 3,6. Pour passer des km/h aux m/s, on divise par 3,6.`},{v:Vk,m:`tu as recopié la valeur en km/h. Divise par 3,6.`},{v:Vk/60,m:`tu as divisé par 60. Une heure vaut 3 600 s et un kilomètre 1 000 m : on divise par 3,6.`}])},
      {q:`Pendant le temps de réaction, la navette roule encore à cette vitesse. Détermine la distance ${sb("d","1")} parcourue pendant ce temps.`,nom:sb("d","1"),type:"num",ans:d1,tolR:0.015,unit:"m",don,
        expl:`${F("d<sub>1</sub> = v·t")} = ${S3(v)} × ${nf(tr)} = ${U(d1,"m")}.`,
        lire:`Figure 2 : temps de réaction ${nf(tr)} s. Question précédente : ${F(`v = ${S3(v)} m/s`)}.`,
        met:[`Pendant le temps de réaction, la vitesse est constante : ${F("d<sub>1</sub> = v·t")}.`,`${F(`d<sub>1</sub> = ${S3(v)} × ${nf(tr)} = ${S3(d1)} m`)}.`],
        piege:`Utiliser la vitesse en km/h : la distance sortirait fausse.`,
        ret:`Mouvement uniforme : ${F("d = v·t")}.`,
        diag:dgs(d1,[{v:Vk*tr,m:`tu as utilisé la vitesse en km/h. Prends la vitesse en m/s.`},{v:v/tr,m:`tu as divisé la vitesse par la durée. À vitesse constante, la distance vaut v × t.`},{v:v*tr/2,m:`tu as divisé par 2. Pendant le temps de réaction, la vitesse ne diminue pas encore : la distance vaut v × t.`}])},
      {q:`La navette freine ensuite avec la décélération de la figure 2. Détermine la distance d'arrêt totale D, depuis la détection de l'obstacle.`,nom:"D",type:"num",ans:D,tolR:0.015,unit:"m",don,
        expl:`Freinage : ${F(`t<sub>f</sub> = ${FRAC("v","a")} = ${S3(tf)} s`)}, ${F(`d<sub>2</sub> = ${FRAC("v·t<sub>f</sub>","2")} = ${S3(d2)} m`)} ; ${F(`D = ${S3(d1)} + ${S3(d2)}`)} = ${U(D,"m")}.`,
        lire:`Figure 2 : décélération ${a} m/s². Questions précédentes : ${F(`v = ${S3(v)} m/s`)} et ${F(`d<sub>1</sub> = ${S3(d1)} m`)}.`,
        met:[`Durée du freinage : la vitesse passe de v à 0, ${F(`t<sub>f</sub> = ${FRAC("v","a")} = ${FRAC(S3(v),a)} = ${S3(tf)} s`)}.`,`Distance de freinage, aire du triangle sous v(t) : ${F(`d<sub>2</sub> = ${FRAC("v·t<sub>f</sub>","2")} = ${FRAC(`${S3(v)} × ${S3(tf)}`,2)} = ${S3(d2)} m`)}.`,`Distance d'arrêt : ${F(`D = d<sub>1</sub> + d<sub>2</sub> = ${S3(d1)} + ${S3(d2)} = ${S3(D)} m`)}.`],
        piege:`Oublier la distance parcourue pendant le temps de réaction : la navette avance avant de freiner.`,
        ret:`Distance d'arrêt = distance de réaction + distance de freinage.`,
        diag:dgs(D,[{v:d2,m:`tu as donné la distance de freinage seule. Ajoute la distance parcourue pendant le temps de réaction (${S3(d1)} m).`},{v:d1+2*d2,m:`tu as calculé v × t pour le freinage. Pendant le freinage, la vitesse diminue : l'aire est un triangle, divise par 2.`},{v:d1+tf,m:`tu as ajouté une durée à une distance. Calcule la distance de freinage, en mètres, puis ajoute-la.`},{v:d1,m:`tu as donné la distance de réaction seule. Ajoute la distance de freinage.`}])},
      conclure({q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,don,exi:"1.1",quoi:"la distance d'arrêt",val:D,u:"m",lim:Dx,limTxt:`moins de ${Dx} m`,ph:"La navette s'arrête en",
        lire:`Figure 1, exigence 1.1 : moins de ${Dx} m. Question précédente : ${S3(D)} m.`,faux:`le temps de réaction ne dure que ${nf(tr)} s`,fauxW:`le temps de réaction ne répond pas à l'exigence : on compare la distance d'arrêt (${S3(D)} m) à la distance exigée (${Dx} m).`,remede:`Il faudrait rouler moins vite, ou freiner plus fort`})]; }
];

/* Le réservoir : les reconnaissances de mouvements et de trajectoires d'avant (niveau 1, générateurs 0 à 8 ; niveau 3, générateur 12)
   et les nouvelles questions. */
{ const A=POOLS["meca-cinematique"]; POOLS["meca-cinematique"]={v2:true,count:{1:4,2:4,3:4},1:[...A[1].slice(0,9),...C2N1],2:[...C2N2,A[3][12]],3:C2N3}; }
}
