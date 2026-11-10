
/* ======================================================================
   TRANSMETTEURS, RAPPORTS DE RÉDUCTION · v2 (novembre 2026)
   Questions calquées sur l'écrit du bac : les données se relèvent dans des documents numérotés (chaîne de puissance,
   extrait du diagramme des exigences, caractéristiques du constructeur, schéma du mécanisme) ; verbes de l'épreuve
   (relever, déterminer, montrer que, en déduire, conclure) ; au niveau 3, une mini-étude de quatre questions enchaînées
   qui finit par une conclusion sur une exigence. Chaque question porte sa correction détaillée (voir docs v2).
   Convention de la classe : r = N sortie / N entrée (réducteur : r < 1) ; Cs = η·Ce / r.
   ====================================================================== */
const sb=(b,i)=>`${b}<sub>${i}</sub>`;
const R1=k=>`r = ${FRAC("1",k)}`;
const TPI=2*Math.PI;
const trou=(ok,wrong,m)=>{ const o=shuffle([...new Set([ok,...wrong])]); return {o,ok:o.indexOf(ok),m}; };   /* élément à choisir dans une phrase à compléter */
const cmp=(a,b)=>a<=b?"inférieur":"supérieur";
const SYSR=[{n:"robot de livraison",a:"Le robot",le:"du robot"},{n:"chariot autonome d'entrepôt",a:"Le chariot",le:"du chariot"},{n:"robot tondeuse",a:"Le robot",le:"du robot"},{n:"fauteuil de plage motorisé",a:"Le fauteuil",le:"du fauteuil"}];
const LCH=[["U","I"],[sb("C","m"),sb("ω","m")],[sb("C","r"),sb("ω","r")],["F","V"]];

const V2N1=[
  /* g0 · fréquence de rotation en sortie d'un réducteur, lue dans la chaîne de puissance */
  ()=>{ const s=rnd([{n:"d'un convoyeur à bande",e:"Tambour du tapis",le:"Diamètre 120 mm"},{n:"d'un store de terrasse",e:"Tube d'enroulement",le:"Diamètre 60 mm"},{n:"d'un mélangeur de peinture",e:"Pale du mélangeur",le:"Diamètre 200 mm"},{n:"d'une barrière de parking",e:"Lisse de la barrière",le:"Longueur 3 m"}]);
    const Nm=rnd([1400,1500,2800,3000]), k=rnd([10,20,25,40,50]), eta=rnd([0.8,0.85,0.9]), P=rnd([90,120,180,250]), Ns=Nm/k;
    return {fig:DOC(1,`chaîne de puissance ${s.n}`,d2Chaine({blocs:[{t:"Moteur",l:[`${P} W`,`${nf(Nm,0)} tr/min`]},{t:"Réducteur",l:[R1(k),`Rendement ${nf(eta)}`]},{t:s.e,l:[s.le]}],liens:[["U","I"],[sb("C","m"),sb("N","m")],[sb("C","s"),sb("N","s")],null]})),
      q:`À l'aide de la figure 1, détermine la fréquence de rotation ${sb("N","s")} de l'arbre de sortie du réducteur.`,type:"num",ans:Ns,tolR:0.01,unit:"tr/min",
      don:`moteur ${Nm} tr/min, ${P} W ; r = 1/${k} ; rendement ${nf(eta)}`,
      expl:`${F("N<sub>s</sub> = r·N<sub>m</sub>")} = ${FRAC(nf(Nm,0),k)} = ${U(Ns,"tr/min")}.`,
      lire:`Bloc « Moteur » : ${nf(Nm,0)} tr/min. Bloc « Réducteur » : ${R1(k)}. La puissance, le rendement et les dimensions ne servent pas ici.`,
      met:[`Le rapport de transmission relie les vitesses : ${F(`r = ${FRAC("N<sub>s</sub>","N<sub>m</sub>")}`)}, donc ${F("N<sub>s</sub> = r·N<sub>m</sub>")}.`,
        `${F(`N<sub>s</sub> = ${FRAC(nf(Nm,0),k)} = ${S3(Ns)} tr/min`)}.`,
        `Contrôle : c'est un réducteur (r < 1), la sortie tourne bien moins vite que le moteur.`],
      piege:`Multiplier par le rendement. Le rendement ne change pas la vitesse : il réduit le couple et la puissance transmis.`,
      ret:`${F(`r = ${FRAC("N sortie","N entrée")}`)} ; réducteur : r < 1.`,
      diag:[{v:Nm*k,m:`tu as multiplié par ${k}. Un réducteur de rapport ${R1(k)} divise la vitesse par ${k}.`},{v:Ns*eta,m:`tu as multiplié par le rendement. Il agit sur le couple et la puissance, pas sur la vitesse.`}]}; },

  /* g1 · rapport de transmission d'un engrenage, à partir des nombres de dents */
  ()=>{ const Z1=rnd([12,15,16,18,20]), Z2=rnd([36,40,45,48,60,72]), r=Z1/Z2;
    return {fig:DOC(1,"engrenage d'un réducteur (la roue 1 est sur l'arbre du moteur)",fx_trans_engr({Z:[Z1,Z2],labs:["arbre moteur","arbre de sortie"]})),
      q:`À partir de la figure 1, détermine le rapport de transmission ${F(`r = ${FRAC("N<sub>2</sub>","N<sub>1</sub>")}`)} de cet engrenage. Donne sa valeur décimale.`,
      type:"num",ans:r,tolA:0.004,unit:"",don:`Z1 = ${Z1} ; Z2 = ${Z2}`,
      expl:`${F(`r = ${FRAC("Z<sub>1</sub>","Z<sub>2</sub>")}`)} = ${FRAC(Z1,Z2)} = ${U(r,"")}.`,
      lire:`Sous chaque roue de la figure 1 : ${F(`Z<sub>1</sub> = ${Z1}`)} dents (roue menante, côté moteur) et ${F(`Z<sub>2</sub> = ${Z2}`)} dents (roue menée).`,
      met:[`Pour un engrenage : ${F(`r = ${FRAC("N<sub>2</sub>","N<sub>1</sub>")} = ${FRAC("Z<sub>1</sub>","Z<sub>2</sub>")}`)} (dents de la roue menante sur dents de la roue menée).`,
        `${F(`r = ${FRAC(Z1,Z2)} = ${S3(r)}`)}.`,
        `Contrôle : la petite roue entraîne la grande, la sortie tourne donc moins vite : r < 1.`],
      piege:`Inverser le rapport. La roue qui a le plus de dents est celle qui tourne le moins vite.`,
      ret:`${F(`r = ${FRAC("N sortie","N entrée")} = ${FRAC("Z menante","Z menée")}`)}.`,
      diag:[{v:Z2/Z1,m:`tu as calculé ${FRAC("Z<sub>2</sub>","Z<sub>1</sub>")} : c'est le rapport inversé. La roue 2, plus grande, tourne moins vite que la roue 1.`}]}; },

  /* g2 · vitesse angulaire des roues à la vitesse maximale : exigence + chaîne de puissance */
  ()=>{ const s=rnd(SYSR), V=rnd([0.8,1,1.2,1.5,1.8,2]), D=rnd([16,20,24,25,30,40]), k=rnd([15,20,30]), w=V/(D/200);
    return {fig:DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Vitesse de déplacement",txt:`${s.a} doit se déplacer à ${nf(V)} m/s au maximum.`},{id:"1.2",nom:"Autonomie",txt:`${s.a} doit fonctionner ${rnd([2,3,4])} h sans recharge.`}]}))+
        DOC(2,"chaîne de puissance d'une roue motrice",d2Chaine({blocs:[{t:"Moteur",l:[`${rnd([24,36])} V`]},{t:"Réducteur",l:[R1(k)]},{t:"Roue motrice",l:[`Diamètre ${D} cm`]}],liens:LCH})),
      q:`À l'aide des figures 1 et 2, détermine la vitesse angulaire ${sb("ω","r")} des roues lorsque le ${s.n} roule à sa vitesse maximale. Les roues roulent sans glisser.`,
      nom:sb("ω","r"),type:"num",ans:w,tolR:0.01,unit:"rad/s",don:`V max = ${nf(V)} m/s ; diamètre de roue ${D} cm ; r = 1/${k}`,
      expl:`${F(`ω<sub>r</sub> = ${FRAC("V","R")}`)} = ${FRAC(nf(V),nf(D/200,3))} = ${U(w,"rad/s")}.`,
      lire:`Figure 1, exigence 1.1 : ${F(`V = ${nf(V)} m/s`)}. Figure 2, bloc « Roue motrice » : diamètre ${D} cm, donc ${F(`R = ${nf(D/200,3)} m`)}. Le rapport du réducteur ne sert pas : on demande la vitesse de la roue.`,
      met:[`Roulement sans glissement : ${F("V = R·ω<sub>r</sub>")}, donc ${F(`ω<sub>r</sub> = ${FRAC("V","R")}`)}.`,
        `Rayon en mètres : ${F(`R = ${FRAC(`${D} cm`,"2")} = ${nf(D/200,3)} m`)}.`,
        `${F(`ω<sub>r</sub> = ${FRAC(nf(V),nf(D/200,3))} = ${S3(w)} rad/s`)}.`],
      piege:`Prendre le diamètre à la place du rayon, ou laisser le rayon en centimètres.`,
      ret:`${F("V = R·ω")}, avec V en m/s, R en m et ω en rad/s.`,
      diag:[{v:V/(D/100),m:`tu as divisé par le diamètre. Dans V = R·ω, R est le rayon : la moitié du diamètre.`},{v:V/(D/2),m:`tu as laissé le rayon en centimètres. Convertis-le en mètres avant de diviser.`},{v:V*(D/200),m:`tu as multiplié la vitesse par le rayon. De V = R·ω, on tire ω = V sur R.`},{v:w*k,m:`tu as calculé la vitesse angulaire du moteur. La question porte sur la roue, après le réducteur.`}]}; },

  /* g3 · poulies-courroie en multiplicateur : angle de l'axe du codeur */
  ()=>{ const m=rnd([3,4,5,6,8]), a=rnd([30,45,60,90,120]), n=rnd([100,200,360,500]), b=a*m;
    const s=rnd([{t:"du volant d'un bateau",v:"Volant",q:"Le barreur tourne le volant"},{t:"de la manette d'une grue",v:"Manette",q:"L'opérateur tourne la manette"},{t:"du guidon d'un simulateur de vélo",v:"Guidon",q:"Le cycliste tourne le guidon"}]);
    return {fig:DOC(1,`chaîne d'acquisition de l'angle ${s.t}`,d2Chaine({blocs:[{t:s.v,l:["angle α"]},{t:"Poulies-courroie",l:[`r = ${m}`,"multiplicateur"]},{t:"Codeur incrémental",l:[`${n} impulsions par tour`]}],liens:[false,["","α"],["","β"],null]})),
      q:`${s.q} d'un angle α = ${a}°. À l'aide de la figure 1, détermine l'angle β dont tourne l'axe du codeur.`,
      type:"num",ans:b,tolA:0.5,unit:"°",don:`poulies-courroie r = ${m} (multiplicateur) ; codeur ${n} impulsions/tour`,
      expl:`${F("β = r·α")} = ${m} × ${a} = ${U(b,"°")}.`,
      lire:`Bloc « Poulies-courroie » : ${F(`r = ${m}`)}, un multiplicateur. Le nombre d'impulsions par tour du codeur ne sert pas ici.`,
      met:[`Les angles parcourus sont dans le même rapport que les vitesses : ${F(`r = ${FRAC("β","α")}`)}, donc ${F("β = r·α")}.`,
        `${F(`β = ${m} × ${a} = ${S3(b)}°`)}.`,
        `Contrôle : r > 1, c'est un multiplicateur : l'axe du codeur tourne plus que l'entrée. On multiplie ainsi le nombre d'impulsions, donc la précision de la mesure.`],
      piege:`Diviser par r comme pour un réducteur. Ici r > 1 : la sortie tourne plus que l'entrée.`,
      ret:`${F(`r = ${FRAC("angle de sortie","angle d'entrée")}`)} ; multiplicateur : r > 1.`,
      diag:[{v:a/m,m:`tu as divisé par ${m}. Ici r = ${m} est plus grand que 1 : c'est un multiplicateur, l'axe du codeur tourne ${m} fois plus que l'entrée.`}]}; },

  /* g4 · relever la bonne caractéristique dans la fiche du constructeur */
  ()=>{ const U0=rnd([12,24,36,48]), Pn=rnd([60,90,120,200]), Nn=rnd([2400,2800,3000,3600]);
    const Cn=Number((Pn/(TPI*Nn/60)).toPrecision(3)), Cd=Number((Cn*rnd([3,4,5])).toPrecision(2)), N0=Math.round(Nn*rnd([1.12,1.15,1.2])/10)*10, In=Number((Pn/(U0*0.8)).toPrecision(2));
    const c=rnd([{q:"le couple que ce moteur peut fournir en permanence",a:Cn,u:"N·m",l:"Couple nominal",w:"« Nominal » désigne le fonctionnement prévu en permanence, sans échauffement excessif.",
        d:[{v:Cd,m:`tu as relevé le couple de démarrage. Le moteur ne le fournit que pendant un court instant : en permanence, il surchaufferait.`}]},
      {q:"la fréquence de rotation du moteur lorsqu'il n'entraîne aucune charge",a:N0,u:"tr/min",l:"Fréquence de rotation à vide",w:"« À vide » signifie sans charge sur l'arbre : le moteur tourne alors à sa vitesse la plus élevée.",
        d:[{v:Nn,m:`tu as relevé la fréquence de rotation nominale : c'est celle du moteur en charge, quand il fournit son couple nominal.`}]},
      {q:"la fréquence de rotation du moteur lorsqu'il fournit son couple nominal",a:Nn,u:"tr/min",l:"Fréquence de rotation nominale",w:"En charge, le moteur ralentit : sa fréquence de rotation nominale est plus faible que sa fréquence à vide.",
        d:[{v:N0,m:`tu as relevé la fréquence de rotation à vide : c'est celle du moteur sans charge. En charge, il tourne moins vite.`}]}]);
    return {fig:DOC(1,"caractéristiques du moteur données par le constructeur",d2Fiche({lignes:[["Tension nominale",`${U0} V`],["Puissance utile nominale",`${Pn} W`],["Fréquence de rotation à vide",`${nf(N0,0)} tr/min`],["Fréquence de rotation nominale",`${nf(Nn,0)} tr/min`],["Couple nominal",`${nf(Cn,3)} N·m`],["Couple de démarrage",`${nf(Cd,2)} N·m`],["Courant nominal",`${nf(In,1)} A`]]})),
      q:`Relève, dans la figure 1, ${c.q}.`,type:"num",ans:c.a,tolR:0.004,unit:c.u,
      don:`à vide ${N0} tr/min ; nominale ${Nn} tr/min ; couple nominal ${nf(Cn,3)} N·m ; couple de démarrage ${nf(Cd,2)} N·m`,
      expl:`Ligne « ${c.l} » : ${U(c.a,c.u)}.`,
      lire:`Figure 1, ligne « ${c.l} ».`,
      met:[`Repère les mots de la question : ${c.w}`,`On lit donc la ligne « ${c.l} » : ${F(`${S3(c.a)} ${c.u}`)}.`],
      piege:`Relever la première valeur qui a la bonne unité. Un tableau du constructeur donne plusieurs couples et plusieurs vitesses : c'est le mot « nominal », « à vide » ou « démarrage » qui dit laquelle prendre.`,
      ret:`Nominal : fonctionnement prévu en permanence. À vide : sans charge. Démarrage : vitesse nulle, pendant un court instant.`,
      diag:c.d}; },

  /* g5 · réducteur ou multiplicateur ? réponse justifiée */
  ()=>{ const mult=Math.random()<0.4, k=rnd([4,5,8,10,20,30]);
    const s=mult?rnd([{t:"d'une éolienne",b:[{t:"Pales",l:[`${rnd([15,20,30])} tr/min`]},{t:"Transmetteur",l:[`r = ${k}`]},{t:"Génératrice",l:[]}]},{t:"d'une génératrice à manivelle",b:[{t:"Manivelle",l:[`${rnd([40,60])} tr/min`]},{t:"Transmetteur",l:[`r = ${k}`]},{t:"Génératrice",l:[]}]}])
      :rnd([{t:"d'un portail automatique",b:[{t:"Moteur",l:["1 400 tr/min"]},{t:"Transmetteur",l:[R1(k)]},{t:"Vantail",l:[]}]},{t:"d'un treuil de bateau",b:[{t:"Moteur",l:["3 000 tr/min"]},{t:"Transmetteur",l:[R1(k)]},{t:"Tambour",l:[]}]}]);
    const ok=mult?"Un multiplicateur : r > 1, l'arbre de sortie tourne plus vite que l'arbre d'entrée, avec un couple plus petit."
      :"Un réducteur : r < 1, l'arbre de sortie tourne moins vite que l'arbre d'entrée, avec un couple plus grand.";
    const w=mult?[["Un multiplicateur : r > 1, l'arbre de sortie tourne plus vite, avec un couple plus grand.","la vitesse augmente, donc le couple diminue : la puissance P = C·ω ne peut pas augmenter dans un transmetteur."],
        ["Un réducteur : r > 1, l'arbre de sortie tourne moins vite que l'arbre d'entrée.","r est le rapport de la vitesse de sortie sur la vitesse d'entrée. S'il est plus grand que 1, la sortie tourne plus vite."],
        ["Un réducteur : il réduit le couple.","on nomme le transmetteur d'après ce qu'il fait à la vitesse, pas au couple. Ici la vitesse augmente : c'est un multiplicateur."]]
      :[["Un réducteur : r < 1, l'arbre de sortie tourne moins vite, avec un couple plus petit.","la vitesse diminue, donc le couple augmente (aux pertes près) : la puissance P = C·ω se conserve presque."],
        ["Un multiplicateur : r < 1, l'arbre de sortie tourne plus vite que l'arbre d'entrée.","r est le rapport de la vitesse de sortie sur la vitesse d'entrée. S'il est plus petit que 1, la sortie tourne moins vite."],
        ["Un multiplicateur : il multiplie le couple.","on nomme le transmetteur d'après ce qu'il fait à la vitesse, pas au couple. Ici la vitesse diminue : c'est un réducteur."]];
    return {fig:DOC(1,`chaîne de puissance ${s.t}`,d2Chaine({blocs:s.b,liens:[null,[sb("C","e"),sb("N","e")],[sb("C","s"),sb("N","s")],null]})),
      q:`Le transmetteur de la figure 1 est-il un réducteur ou un multiplicateur de vitesse ? Choisis la réponse justifiée.`,type:"ch",...mcw(ok,w),
      don:mult?`r = ${k}`:`r = 1/${k}`,
      expl:mult?`r = ${k} > 1 : la sortie tourne plus vite que l'entrée, c'est un multiplicateur ; le couple diminue dans le même rapport (aux pertes près).`:`r = 1/${k} < 1 : la sortie tourne moins vite que l'entrée, c'est un réducteur ; le couple augmente dans le rapport inverse (aux pertes près).`,
      lire:`Bloc « Transmetteur » : ${mult?F(`r = ${k}`):R1(k)}.`,
      met:[`${F(`r = ${FRAC("N<sub>s</sub>","N<sub>e</sub>")}`)}. Ici ${mult?`r = ${k}, plus grand que 1 : la sortie tourne ${k} fois plus vite`:`${R1(k)}, plus petit que 1 : la sortie tourne ${k} fois moins vite`}.`,
        `C'est donc un ${mult?"multiplicateur":"réducteur"} de vitesse.`,
        `La puissance se conserve aux pertes près (${F("P = C·ω")}) : si la vitesse ${mult?"augmente, le couple diminue":"diminue, le couple augmente"}.`],
      piege:`Croire qu'un transmetteur peut augmenter à la fois la vitesse et le couple : il faudrait créer de la puissance.`,
      ret:`r < 1 : réducteur (moins de vitesse, plus de couple). r > 1 : multiplicateur (plus de vitesse, moins de couple).`}; }
  ,
  /* g6 · reconnaître une conclusion complète : valeur trouvée, valeur exigée, comparaison, réponse */
  ()=>{ const c=rnd([{d:"du diagramme des exigences d'un portail coulissant",nom:"Durée d'ouverture",ex:x=>`Le portail doit s'ouvrir complètement en moins de ${x} s.`,g:"Durée d'ouverture calculée",u:"s",L:[15,20,25,30],ph:v=>`Le portail s'ouvre en ${v} s`,lim:x=>`aux ${x} s exigées`},
      {d:"du diagramme des exigences d'un store de terrasse",nom:"Durée de déploiement",ex:x=>`Le store doit se déployer complètement en moins de ${x} s.`,g:"Durée de déploiement calculée",u:"s",L:[20,30,40,45],ph:v=>`Le store se déploie en ${v} s`,lim:x=>`aux ${x} s exigées`},
      {d:"du diagramme des exigences d'un chariot autonome",nom:"Sécurité",ex:x=>`Le chariot ne doit pas dépasser ${x} km/h.`,g:"Vitesse maximale calculée",u:"km/h",L:[4,5,6,8],ph:v=>`Le chariot roule au plus à ${v} km/h`,lim:x=>`à la limite de ${x} km/h`}]);
    const X=rnd(c.L), oui=Math.random()<.5, val=Number((X*(oui?rnd([.72,.8,.86]):rnd([1.14,1.22,1.3]))).toPrecision(3)), v=nf(val,3);
    const sat=o=>o?"est satisfaite":"n'est pas satisfaite", mot=oui?"inférieur":"supérieur";
    const ok=`« ${c.ph(v)}. C'est ${mot} ${c.lim(X)} : l'exigence 1.1 ${sat(oui)}. »`;
    return {fig:DOC(1,`extrait ${c.d}`,d2Exig({reqs:[{id:"1.1",nom:c.nom,txt:c.ex(X)}]}))+DOC(2,"résultat de l'étude",d2Fiche({lignes:[[c.g,`${v} ${c.u}`]]})),
      q:`Quatre élèves concluent sur l'exigence 1.1. Quelle copie donne une conclusion complète et juste ?`,type:"ch",
      ...mcw(ok,[[`« L'exigence 1.1 ${sat(oui)}. »`,`la réponse est juste, mais aucune valeur ne la justifie. À l'écrit, une conclusion sans nombres ne rapporte pas tous les points.`],
        [`« ${c.ph(v)} et l'exigence 1.1 fixe la limite à ${X} ${c.u}. »`,`les deux valeurs sont citées, mais la copie ne les compare pas et ne dit pas si l'exigence est satisfaite.`],
        [`« ${c.ph(v)}. C'est ${mot} ${c.lim(X)} : l'exigence 1.1 ${sat(!oui)}. »`,`la comparaison est juste, mais la réponse la contredit : ${v} ${c.u} ${oui?"reste sous":"dépasse"} la limite de ${X} ${c.u}.`]]),
      don:`exigence 1.1 : ${X} ${c.u} au plus ; valeur calculée ${v} ${c.u}`,
      expl:`${v} ${c.u} est ${mot} à ${X} ${c.u} : l'exigence 1.1 ${sat(oui)}. La bonne copie donne les deux valeurs, les compare et répond.`,
      lire:`Figure 1, exigence 1.1 : ${X} ${c.u} au plus. Figure 2 : valeur calculée, ${v} ${c.u}.`,
      met:[`Une conclusion complète tient en quatre éléments : la valeur trouvée, la valeur exigée, la comparaison, la réponse.`,
        `Ici : ${v} ${c.u} (trouvé), ${X} ${c.u} (exigé), ${v} est ${mot} à ${X}, donc l'exigence 1.1 ${sat(oui)}.`,
        `La copie complète est la seule qui contient ces quatre éléments sans se contredire.`],
      piege:`Écrire seulement « l'exigence est satisfaite ». Le correcteur attend les deux valeurs et la comparaison.`,
      ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}; }
];

const V2N2=[
  /* g0 · du moteur à la vitesse du véhicule : vitesse angulaire de la roue, vitesse en km/h, puis conclusion à compléter */
  ()=>{ const o=draw(()=>{ const Nm=rnd([2400,3000,3600,4200]), k=rnd([20,25,30,40,50]), D=rnd([20,25,30,40]), Vx=rnd([4,5,6,8,10,12,15]), wm=TPI*Nm/60, wr=wm/k, v=wr*D/200, vk=v*3.6; return {Nm,k,D,Vx,wm,wr,v,vk}; }, o=>far(o.vk,o.Vx,0.08)&&o.vk<3*o.Vx&&o.vk>o.Vx/3);
    const {Nm,k,D,Vx,wm,wr,v,vk}=o, s=rnd(SYSR), eta=rnd([0.8,0.85,0.9]), P=rnd([150,200,250,350]), oui=vk<=Vx;
    const fig=DOC(1,`chaîne de puissance d'une roue motrice du ${s.n}`,d2Chaine({blocs:[{t:"Moteur",l:[`${P} W`,`${nf(Nm,0)} tr/min`]},{t:"Réducteur",l:[R1(k),`Rendement ${nf(eta)}`]},{t:"Roue motrice",l:[`Diamètre ${D} cm`]}],liens:LCH}))+
      DOC(2,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.3",nom:"Sécurité",txt:`${s.a} ne doit pas dépasser ${Vx} km/h.`}]}));
    const don=`moteur ${Nm} tr/min ; r = 1/${k} ; rendement ${nf(eta)} ; diamètre de roue ${D} cm ; exigence 1.3 : ${Vx} km/h au plus`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine la vitesse angulaire ${sb("ω","r")} de la roue, en rad/s, lorsque le moteur tourne à sa fréquence de rotation nominale.`,nom:sb("ω","r"),type:"num",ans:wr,tolR:0.01,unit:"rad/s",
        expl:`${F(`ω<sub>m</sub> = ${FRAC("2π·N<sub>m</sub>","60")}`)} = ${S3(wm)} rad/s ; ${F("ω<sub>r</sub> = r·ω<sub>m</sub>")} = ${U(wr,"rad/s")}.`,
        lire:`Bloc « Moteur » : ${nf(Nm,0)} tr/min. Bloc « Réducteur » : ${R1(k)}. Le rendement et la puissance ne servent pas pour une vitesse.`,
        met:[`Convertis la fréquence de rotation du moteur en rad/s : ${F(`ω<sub>m</sub> = ${FRAC(`2π × ${nf(Nm,0)}`,"60")} = ${S3(wm)} rad/s`)}.`,
          `Applique le rapport de transmission : ${F(`ω<sub>r</sub> = r·ω<sub>m</sub> = ${FRAC(S3(wm),k)} = ${S3(wr)} rad/s`)}.`],
        piege:`Rester en tr/min. Un tour vaut 2π radians et une minute vaut 60 secondes.`,
        ret:`${F(`ω = ${FRAC("2π·N","60")}`)} (N en tr/min, ω en rad/s).`,
        diag:[{v:Nm/k,m:`ta valeur est en tr/min : c'est la fréquence de rotation de la roue. Pour l'avoir en rad/s, multiplie par 2π et divise par 60.`},{v:wm,m:`tu as calculé la vitesse angulaire du moteur. Il reste à appliquer le rapport du réducteur.`},{v:wm*k,m:`tu as multiplié par ${k}. Un réducteur de rapport ${R1(k)} divise la vitesse par ${k}.`},{v:wr*eta,m:`tu as multiplié par le rendement. Il agit sur le couple et la puissance, pas sur la vitesse.`}]},
      {q:`Déduis-en la vitesse de déplacement ${s.le}, en km/h. Les roues roulent sans glisser.`,nom:"V",type:"num",ans:vk,tolR:0.015,unit:"km/h",don,
        expl:`${F("V = R·ω<sub>r</sub>")} = ${nf(D/200,3)} × ${S3(wr)} = ${S3(v)} m/s, soit ${U(vk,"km/h")}.`,
        lire:`Bloc « Roue motrice » : diamètre ${D} cm, donc ${F(`R = ${nf(D/200,3)} m`)}.`,
        met:[`Roulement sans glissement : ${F("V = R·ω<sub>r</sub>")}, avec le rayon en mètres.`,
          `${F(`V = ${nf(D/200,3)} × ${S3(wr)} = ${S3(v)} m/s`)}.`,
          `Conversion : ${F(`V = ${S3(v)} × 3,6 = ${S3(vk)} km/h`)}.`],
        piege:`Oublier la dernière conversion : la relation V = R·ω donne des m/s.`,
        ret:`${F("V = R·ω")} ; 1 m/s = 3,6 km/h.`,
        diag:[{v,m:`ta valeur est en m/s. La question demande des km/h : multiplie par 3,6.`},{v:vk*2,m:`tu as utilisé le diamètre. Dans V = R·ω, R est le rayon.`},{v:v/3.6,m:`tu as divisé par 3,6. Pour passer des m/s aux km/h, on multiplie par 3,6.`}]},
      {q:`Complète la conclusion sur l'exigence 1.3 (figure 2).`,type:"trous",don,
        phr:[`À la fréquence de rotation nominale du moteur, ${s.a.toLowerCase()} roule à `,trou(`${S3(vk)} km/h`,[`${S3(v)} km/h`,`${S3(wr)} km/h`],`La valeur à citer est la vitesse que tu viens de calculer, en km/h : ${S3(vk)} km/h.`),
          `. C'est `,trou(oui?"inférieur":"supérieur",[oui?"supérieur":"inférieur"],`Compare les deux valeurs : ${S3(vk)} est ${oui?"plus petit":"plus grand"} que ${Vx}.`),
          ` à la limite de ${Vx} km/h : l'exigence 1.3 `,trou(oui?"est":"n'est pas",[oui?"n'est pas":"est"],`${s.a} ne doit pas dépasser ${Vx} km/h : avec ${S3(vk)} km/h, l'exigence ${oui?"est":"n'est pas"} satisfaite.`),` satisfaite.`],
        expl:`${S3(vk)} km/h est ${oui?"inférieur":"supérieur"} à ${Vx} km/h : l'exigence 1.3 ${oui?"est":"n'est pas"} satisfaite.`,
        lire:`Figure 2, exigence 1.3 : ${Vx} km/h au plus. Question précédente : ${S3(vk)} km/h.`,
        met:[`Une conclusion complète donne la valeur trouvée, la valeur exigée, la comparaison, puis la réponse.`,
          `Valeur trouvée : ${F(`${S3(vk)} km/h`)}. Valeur exigée : ${F(`${Vx} km/h`)} au plus.`,
          `${S3(vk)} est ${oui?"plus petit":"plus grand"} que ${Vx} : l'exigence 1.3 ${oui?"est":"n'est pas"} satisfaite${oui?"":". Il faudrait limiter la vitesse du moteur, ou réduire davantage"}.`],
        piege:`Citer une valeur dans la mauvaise unité : l'exigence est en km/h, on compare des km/h.`,
        ret:`Conclure = la valeur trouvée, la valeur exigée, la comparaison, la réponse.`}]; },

  /* g1 · couple à la roue, « montre que » le couple moteur vaut environ…, puis conclusion à compléter sur le choix du moteur */
  ()=>{ const o=draw(()=>{ const Fm=rnd([60,80,100,120,150,180]), D=rnd([20,24,30,40]), k=rnd([20,25,30,35,40]), eta=rnd([0.8,0.85,0.9]), Cr=Fm*D/200, Cm=Cr/(k*eta), ap=Number(Cm.toPrecision(2));
        const Cn=Number((Cm*rnd([0.6,0.72,0.84,1.25,1.5,1.8])).toPrecision(2)), Cd=Number((Cn*rnd([2.5,3,4])).toPrecision(2)); return {Fm,D,k,eta,Cr,Cm,ap,Cn,Cd}; },
      o=>o.Cm>0.1&&o.Cm<3&&Math.abs(o.ap-Number(o.Cm.toPrecision(3)))/o.Cm>0.008&&far(o.Cm,o.Cn,0.1)&&far(o.Cm,o.Cd,0.1)&&o.Cm<o.Cd);
    const s=rnd(SYSR), {Fm,D,k,eta,Cr,Cm,ap,Cn,Cd}=o, oui=Cm<=Cn, U0=rnd([24,36]);
    const fig=DOC(1,`chaîne de puissance d'une roue motrice du ${s.n}, dans une pente`,d2Chaine({blocs:[{t:"Moteur",l:["voir figure 2"]},{t:"Réducteur",l:[R1(k),`Rendement ${nf(eta)}`]},{t:"Roue motrice",l:[`Diamètre ${D} cm`]}],liens:[["U","I"],[sb("C","m"),sb("ω","m")],[sb("C","r"),sb("ω","r")],[`F = ${Fm} N`,"V"]]}))+
      DOC(2,"caractéristiques du moteur",d2Fiche({lignes:[["Tension nominale",`${U0} V`],["Couple nominal",`${nf(Cn,3)} N·m`],["Couple de démarrage",`${nf(Cd,3)} N·m`]]}));
    const don=`F = ${Fm} N ; diamètre de roue ${D} cm ; r = 1/${k} ; rendement ${nf(eta)} ; moteur : couple nominal ${nf(Cn,3)} N·m, couple de démarrage ${nf(Cd,3)} N·m`;
    return [{fig,don,q:`Pour monter la pente, la roue motrice doit exercer sur le sol l'effort F indiqué sur la figure 1. Détermine le couple ${sb("C","r")} que le réducteur doit fournir à la roue.`,nom:sb("C","r"),type:"num",ans:Cr,tolR:0.01,unit:"N·m",
        expl:`${F("C<sub>r</sub> = F·R")} = ${Fm} × ${nf(D/200,3)} = ${U(Cr,"N·m")}.`,
        lire:`À la sortie de la chaîne : ${F(`F = ${Fm} N`)}. Bloc « Roue motrice » : diamètre ${D} cm, donc ${F(`R = ${nf(D/200,3)} m`)}.`,
        met:[`L'effort F s'exerce au contact du sol, à la distance R de l'axe de la roue : ${F("C<sub>r</sub> = F·R")}.`,
          `${F(`C<sub>r</sub> = ${Fm} × ${nf(D/200,3)} = ${S3(Cr)} N·m`)}.`],
        piege:`Prendre le diamètre comme bras de levier, ou le laisser en centimètres.`,
        ret:`Couple à la roue : ${F("C = F·R")}, avec R en mètres.`,
        diag:[{v:Fm*D/100,m:`tu as multiplié par le diamètre. Le bras de levier de F est le rayon de la roue.`},{v:Fm*D/2,m:`tu as laissé le rayon en centimètres. Convertis-le en mètres : le couple s'exprime en N·m.`},{v:Fm/(D/200),m:`tu as divisé l'effort par le rayon. Un couple est le produit d'un effort par un bras de levier.`}]},
      {q:`Montre que le couple ${sb("C","m")} que le moteur doit fournir vaut environ ${nf(ap,3)} N·m. Écris la valeur que tu trouves, avec 3 chiffres significatifs.`,nom:sb("C","m"),type:"num",ans:Cm,tolR:0.006,unit:"N·m",don,
        expl:`${F(`C<sub>m</sub> = ${FRAC("r·C<sub>r</sub>","η")}`)} = ${FRAC(S3(Cr),`${k} × ${nf(eta)}`)} = ${U(Cm,"N·m")}.`,
        lire:`Bloc « Réducteur » : ${R1(k)} et rendement ${F(`η = ${nf(eta)}`)}.`,
        met:[`Le réducteur multiplie le couple par ${k} et en perd une partie : ${F(`C<sub>r</sub> = ${FRAC("η·C<sub>m</sub>","r")}`)}.`,
          `On isole le couple moteur : ${F(`C<sub>m</sub> = ${FRAC("r·C<sub>r</sub>","η")}`)}.`,
          `${F(`C<sub>m</sub> = ${FRAC(S3(Cr),`${k} × ${nf(eta)}`)} = ${S3(Cm)} N·m`)}, soit environ ${nf(ap,3)} N·m.`],
        piege:`Multiplier par le rendement. Les pertes obligent le moteur à fournir plus : on divise par η.`,
        ret:`${F(`C<sub>s</sub> = ${FRAC("η·C<sub>e</sub>","r")}`)} : un réducteur augmente le couple, le rendement en retire une partie.`,
        diag:[{v:Cr/k,m:`tu as oublié le rendement. Avec des pertes, le moteur doit fournir plus : divise encore par η = ${nf(eta)}.`},{v:Cr*eta/k,m:`tu as multiplié par le rendement. Les pertes obligent le moteur à fournir plus de couple : on divise par η.`},{v:Cr*k/eta,m:`tu as multiplié par ${k}. Côté moteur, le couple est ${k} fois plus petit qu'à la roue (aux pertes près).`},{v:ap,m:`tu as recopié la valeur approchée de l'énoncé. Fais le calcul et donne ton résultat avec 3 chiffres significatifs.`}]},
      {q:`À l'aide de la figure 2, complète la conclusion sur le choix du moteur. Il doit fournir ce couple pendant toute la montée.`,type:"trous",don,
        phr:[`Le moteur doit fournir ${S3(Cm)} N·m pendant toute la montée. On compare cette valeur à son couple `,trou("nominal",["de démarrage"],`Le couple de démarrage n'est disponible qu'un court instant. Pour un effort qui dure, on compare au couple nominal.`),
          `, qui vaut `,trou(`${nf(Cn,3)} N·m`,[`${nf(Cd,3)} N·m`],`Le couple nominal se lit dans la figure 2 : ${nf(Cn,3)} N·m.`),` : elle lui est `,
          trou(oui?"inférieure":"supérieure",[oui?"supérieure":"inférieure"],`Compare les deux valeurs : ${S3(Cm)} est ${oui?"plus petit":"plus grand"} que ${nf(Cn,3)}.`),`, donc le moteur `,
          trou(oui?"convient":"ne convient pas",[oui?"ne convient pas":"convient"],`Le moteur convient seulement si le couple demandé reste inférieur à son couple nominal.`),`.`],
        expl:`${S3(Cm)} N·m est ${oui?"inférieur":"supérieur"} au couple nominal (${nf(Cn,3)} N·m) : le moteur ${oui?"convient":"ne convient pas"}.`,
        lire:`Figure 2, ligne « Couple nominal » : ${nf(Cn,3)} N·m. Question précédente : ${S3(Cm)} N·m.`,
        met:[`Un effort qui dure se compare au couple que le moteur peut fournir en permanence : son couple nominal.`,
          `Couple demandé : ${F(`${S3(Cm)} N·m`)}. Couple nominal : ${F(`${nf(Cn,3)} N·m`)}.`,
          `${S3(Cm)} est ${oui?"plus petit":"plus grand"} que ${nf(Cn,3)} : le moteur ${oui?"convient":"ne convient pas"}.`],
        piege:`Comparer au couple de démarrage : il est plus grand, mais le moteur ne le tient que quelques secondes.`,
        ret:`Un moteur convient si le couple demandé reste inférieur à son couple nominal.`}]; },

  /* g2 · réducteur à deux étages d'engrenages : fréquence de rotation de la sortie */
  ()=>{ const Z1=rnd([12,15,18]), Z2=rnd([36,45,48,54,60]), Z3=rnd([12,15,20]), Z4=rnd([40,48,50,60]), Nm=rnd([1500,3000]), Pn=rnd([90,120,180]);
    const r=Z1*Z3/(Z2*Z4), Ns=Nm*r, Cn=Number((Pn/(TPI*Nm/60)).toPrecision(3));
    return {fig:DOC(1,"train d'engrenages du réducteur",fx_trans_engr({Z:[Z1,Z2,Z3,Z4],link:["m","s","m"],mot:1,out:1,cap:"Les roues 2 et 3 sont solidaires du même arbre."}))+
        DOC(2,"caractéristiques du moteur",d2Fiche({lignes:[["Tension nominale","24 V"],["Puissance utile nominale",`${Pn} W`],["Fréquence de rotation nominale",`${nf(Nm,0)} tr/min`],["Couple nominal",`${nf(Cn,3)} N·m`]]})),
      q:`À l'aide des figures 1 et 2, détermine la fréquence de rotation de l'arbre de sortie du réducteur lorsque le moteur tourne à sa fréquence de rotation nominale.`,type:"num",ans:Ns,tolR:0.01,unit:"tr/min",
      don:`Z1 = ${Z1}, Z2 = ${Z2}, Z3 = ${Z3}, Z4 = ${Z4} ; moteur ${Nm} tr/min`,
      expl:`${F(`r = ${FRAC("Z<sub>1</sub>·Z<sub>3</sub>","Z<sub>2</sub>·Z<sub>4</sub>")}`)} = ${FRAC(`${Z1} × ${Z3}`,`${Z2} × ${Z4}`)} = ${S3(r)} ; ${F("N<sub>s</sub> = r·N<sub>m</sub>")} = ${U(Ns,"tr/min")}.`,
      lire:`Figure 1 : les quatre nombres de dents. Figure 2, ligne « Fréquence de rotation nominale » : ${nf(Nm,0)} tr/min.`,
      met:[`Deux étages : la roue 1 entraîne la roue 2, puis la roue 3 (sur le même arbre que la 2) entraîne la roue 4.`,
        `Les rapports se multiplient : ${F(`r = ${FRAC("Z<sub>1</sub>","Z<sub>2</sub>")} × ${FRAC("Z<sub>3</sub>","Z<sub>4</sub>")} = ${FRAC(`${Z1} × ${Z3}`,`${Z2} × ${Z4}`)} = ${S3(r)}`)}.`,
        `${F(`N<sub>s</sub> = r·N<sub>m</sub> = ${S3(r)} × ${nf(Nm,0)} = ${S3(Ns)} tr/min`)}.`],
      piege:`Additionner les rapports des deux étages, ou n'en compter qu'un. Les roues menantes vont au numérateur, les roues menées au dénominateur.`,
      ret:`Train d'engrenages : ${F(`r = ${FRAC("produit des Z menantes","produit des Z menées")}`)}.`,
      diag:[{v:Nm*Z1/Z2,m:`tu n'as compté que le premier étage. La roue 3 entraîne encore la roue 4 : multiplie par ${FRAC("Z<sub>3</sub>","Z<sub>4</sub>")}.`},{v:Nm*Z1/Z4,m:`tu as pris ${FRAC("Z<sub>1</sub>","Z<sub>4</sub>")}. Les roues 2 et 3 n'ont pas le même nombre de dents : il faut le produit des deux étages.`},{v:Nm/r,m:`tu as inversé le rapport : la sortie d'un réducteur tourne moins vite que le moteur.`},{v:Nm*(Z1/Z2+Z3/Z4),m:`tu as additionné les rapports des deux étages. Ils se multiplient.`}]}; },

  /* g3 · codeur derrière un multiplicateur : nombre d'impulsions, puis nombre de bits du compteur */
  ()=>{ const o=draw(()=>{ const a=rnd([30,45,60,90,120,135]), m=rnd([4,5,6,8,10]), n=rnd([100,200,250,360,500]), imp=2*a/360*m*n, b=Math.ceil(Math.log2(imp+1)); return {a,m,n,imp,b}; },
      o=>Number.isInteger(o.imp)&&o.imp>=100&&o.imp<=4000&&!(o.a===45&&o.m===10)&&(Math.pow(2,o.b)-1-o.imp)/o.imp>0.08&&(o.imp-(Math.pow(2,o.b-1)-1))/o.imp>0.08);
    const {a,m,n,imp,b}=o, s=rnd([{t:"du volant d'un bateau",v:"Volant",le:"Le volant"},{t:"de la manette d'une grue",v:"Manette",le:"La manette"},{t:"de la barre d'un voilier",v:"Barre",le:"La barre"}]);
    const fig=DOC(1,`chaîne d'acquisition de l'angle ${s.t}`,d2Chaine({blocs:[{t:s.v,l:[`de −${a}° à +${a}°`]},{t:"Poulies-courroie",l:[`r = ${m}`,"multiplicateur"]},{t:"Codeur incrémental",l:[`${n} impulsions par tour`]},{t:"Compteur",l:["? bits"],q:1}],liens:[false,null,null,null,false]}));
    const don=`course de −${a}° à +${a}° ; r = ${m} (multiplicateur) ; codeur ${n} impulsions/tour`;
    return [{fig,don,q:`${s.le} passe d'une butée à l'autre. À l'aide de la figure 1, détermine le nombre d'impulsions délivrées par le codeur.`,nom:"nombre d'impulsions",type:"num",ans:imp,tolR:0.005,unit:"impulsions",
        expl:`Course : ${2*a}° ; axe du codeur : ${m} × ${2*a}° = ${nf(2*a*m,0)}°, soit ${nf(2*a*m/360,3)} tour${2*a*m/360>=2?"s":""} ; ${nf(2*a*m/360,3)} × ${n} = ${U(imp,"impulsions")}.`,
        lire:`Bloc « ${s.v} » : de −${a}° à +${a}°, soit une course de ${2*a}°. Bloc « Poulies-courroie » : ${F(`r = ${m}`)}. Bloc « Codeur » : ${n} impulsions par tour.`,
        met:[`Course d'une butée à l'autre : ${F(`${a} + ${a} = ${2*a}°`)}.`,
          `Angle parcouru par l'axe du codeur : ${F(`${m} × ${2*a} = ${nf(2*a*m,0)}°`)}, soit ${F(`${FRAC(nf(2*a*m,0),"360")} = ${nf(2*a*m/360,3)} tour${2*a*m/360>=2?"s":""}`)}.`,
          `Nombre d'impulsions : ${F(`${nf(2*a*m/360,3)} × ${n} = ${nf(imp,0)}`)}.`],
        piege:`Ne compter qu'un côté de la course : de −${a}° à +${a}°, l'angle balayé est ${2*a}°.`,
        ret:`Nombre d'impulsions = nombre de tours de l'axe du codeur × impulsions par tour.`,
        diag:[{v:imp/2,m:`tu n'as compté qu'un côté. De −${a}° à +${a}°, la course est de ${2*a}°.`},{v:imp/m,m:`tu as oublié le multiplicateur : l'axe du codeur tourne ${m} fois plus que l'entrée.`},{v:imp/(m*m),m:`tu as divisé par ${m} au lieu de multiplier : r = ${m} est un multiplicateur.`}]},
      {q:`Le compteur doit pouvoir compter toutes ces impulsions. Détermine le plus petit nombre de bits qui convient.`,type:"num",ans:b,tolA:0,unit:"bits",don,
        expl:`Sur ${b-1} bits : jusqu'à 2<sup>${b-1}</sup> − 1 = ${nf(Math.pow(2,b-1)-1,0)}, trop peu. Sur ${b} bits : jusqu'à 2<sup>${b}</sup> − 1 = ${nf(Math.pow(2,b)-1,0)} ≥ ${nf(imp,0)} : ${U(b,"bits")}.`,
        lire:`Le nombre d'impulsions à compter vient de la question précédente : ${nf(imp,0)}.`,
        met:[`Sur n bits, un compteur va de 0 à ${F("2<sup>n</sup> − 1")}.`,
          `Sur ${b-1} bits : ${F(`2<sup>${b-1}</sup> − 1 = ${nf(Math.pow(2,b-1)-1,0)}`)}, plus petit que ${nf(imp,0)} : insuffisant.`,
          `Sur ${b} bits : ${F(`2<sup>${b}</sup> − 1 = ${nf(Math.pow(2,b)-1,0)}`)}, au moins égal à ${nf(imp,0)} : ${b} bits suffisent.`],
        piege:`Prendre le premier nombre de bits « rond » (8, 16) sans vérifier : on demande le plus petit qui convient.`,
        ret:`Sur n bits : ${F("2<sup>n</sup>")} valeurs, de 0 à ${F("2<sup>n</sup> − 1")}.`,
        diag:[{v:b-1,m:`sur ${b-1} bits, on ne compte que jusqu'à ${nf(Math.pow(2,b-1)-1,0)} : ce n'est pas assez pour ${nf(imp,0)} impulsions.`},{v:b+1,m:`${b+1} bits conviennent, mais ce n'est pas le plus petit nombre : ${b} bits vont déjà jusqu'à ${nf(Math.pow(2,b)-1,0)}.`}]}]; },

  /* g4 · pignon-crémaillère d'un portail : vitesse de translation, puis durée d'ouverture */
  ()=>{ const o=draw(()=>{ const Nm=rnd([1400,1500,2800,3000]), k=rnd([20,25,30,40,50,60]), d=rnd([40,50,60,80]), Lc=rnd([3,3.5,4,5,6]), Np=Nm/k, v=Math.PI*d/1000*Np/60, t=Lc/v; return {Nm,k,d,Lc,Np,v,t}; }, o=>o.v>0.06&&o.v<0.45);
    const {Nm,k,d,Lc,Np,v,t}=o, s=rnd(["d'une pension de famille","d'un atelier","d'un parking de résidence"]);
    const fig=DOC(1,`chaîne de puissance du portail coulissant ${s}`,d2Chaine({blocs:[{t:"Moteur",l:[`${nf(Nm,0)} tr/min`]},{t:"Réducteur",l:[R1(k)]},{t:"Pignon et crémaillère",l:[`Pignon : diamètre ${d} mm`]}],liens:[["U","I"],[sb("C","m"),sb("N","m")],[sb("C","p"),sb("N","p")],["F","V"]]}))+
      DOC(2,"caractéristiques du portail",d2Fiche({lignes:[["Masse du vantail",`${rnd([250,300,400])} kg`],["Course d'ouverture",`${nf(Lc)} m`],["Effort de poussée",`${rnd([200,250,300])} N`]]}));
    const don=`moteur ${Nm} tr/min ; r = 1/${k} ; pignon de diamètre ${d} mm ; course ${nf(Lc)} m`;
    return [{fig,don,q:`À l'aide de la figure 1, détermine la vitesse de translation V du portail, en m/s.`,nom:"V",type:"num",ans:v,tolR:0.015,unit:"m/s",
        expl:`${F("N<sub>p</sub> = r·N<sub>m</sub>")} = ${S3(Np)} tr/min ; ${F(`V = ${FRAC("π·d·N<sub>p</sub>","60")}`)} = ${U(v,"m/s")}.`,
        lire:`Bloc « Moteur » : ${nf(Nm,0)} tr/min. Bloc « Réducteur » : ${R1(k)}. Bloc « Pignon et crémaillère » : diamètre ${d} mm, soit ${nf(d/1000,3)} m.`,
        met:[`Fréquence de rotation du pignon : ${F(`N<sub>p</sub> = r·N<sub>m</sub> = ${FRAC(nf(Nm,0),k)} = ${S3(Np)} tr/min`)}.`,
          `À chaque tour, le pignon fait avancer la crémaillère d'un périmètre : ${F(`π·d = π × ${nf(d/1000,3)} = ${S3(Math.PI*d/1000)} m`)}.`,
          `En une minute, le portail avance de ${F(`${S3(Math.PI*d/1000)} × ${S3(Np)} = ${S3(Math.PI*d/1000*Np)} m`)}. Par seconde : ${F(`V = ${FRAC(S3(Math.PI*d/1000*Np),"60")} = ${S3(v)} m/s`)}.`],
        piege:`Oublier que la fréquence de rotation est par minute : il faut diviser par 60 pour obtenir des m/s.`,
        ret:`Pignon-crémaillère : ${F("V = R·ω")}, ou un périmètre ${F("π·d")} par tour de pignon.`,
        diag:[{v:v*k,m:`tu as oublié le réducteur : le pignon tourne ${k} fois moins vite que le moteur.`},{v:v/Math.PI,m:`à chaque tour, le portail avance d'un périmètre π·d, pas d'un diamètre.`},{v:v*60,m:`ta valeur est en mètres par minute. Divise par 60 pour l'avoir en m/s.`},{v:v*2,m:`tu as compté 2π·d par tour. Le périmètre du pignon vaut π·d, ou 2π·R.`},{v:v*1000,m:`tu as laissé le diamètre en millimètres : ta vitesse est en mm/s.`}]},
      {q:`À l'aide de la figure 2, déduis-en la durée d'une ouverture complète du portail.`,nom:"durée d'ouverture",type:"num",ans:t,tolR:0.02,unit:"s",don,
        expl:`${F(`t = ${FRAC("course","V")}`)} = ${FRAC(nf(Lc),S3(v))} = ${U(t,"s")}.`,
        lire:`Figure 2, ligne « Course d'ouverture » : ${nf(Lc)} m. La masse et l'effort de poussée ne servent pas pour une durée.`,
        met:[`Le portail avance à vitesse constante : ${F(`t = ${FRAC("course","V")}`)}.`,`${F(`t = ${FRAC(nf(Lc),S3(v))} = ${S3(t)} s`)}.`],
        piege:`Multiplier la course par la vitesse. Une durée est une distance divisée par une vitesse.`,
        ret:`À vitesse constante : ${F("d = V·t")}.`,
        diag:[{v:Lc*v,m:`tu as multiplié la course par la vitesse. La durée est la course divisée par la vitesse.`},{v:v/Lc,m:`tu as divisé la vitesse par la course. C'est l'inverse : la course divisée par la vitesse.`}]}]; },

  /* g5 · vis-écrou d'un axe linéaire : vitesse d'avance du chariot */
  ()=>{ const N=rnd([300,450,600,900]), kc=rnd([2,3]), p=rnd([2,4,5,8,10]), Nv=N/kc, v=Nv*p/60;
    const s=rnd(["d'une imprimante 3D","d'une machine de découpe","d'un banc de perçage"]);
    return {fig:DOC(1,`chaîne de puissance d'un axe ${s}`,d2Chaine({blocs:[{t:"Moteur pas à pas",l:[`${N} tr/min`]},{t:"Poulies-courroie",l:[R1(kc)]},{t:"Vis et écrou",l:[`Pas ${p} mm`]},{t:"Chariot",l:[]}],liens:[["U","I"],[sb("N","m")],[sb("N","v")],["V"],false]})),
      q:`À l'aide de la figure 1, détermine la vitesse d'avance V du chariot, en mm/s.`,nom:"V",type:"num",ans:v,tolR:0.01,unit:"mm/s",
      don:`moteur ${N} tr/min ; poulies-courroie r = 1/${kc} ; vis de pas ${p} mm`,
      expl:`${F("N<sub>v</sub> = r·N<sub>m</sub>")} = ${S3(Nv)} tr/min ; ${F(`V = ${FRAC("p·N<sub>v</sub>","60")}`)} = ${U(v,"mm/s")}.`,
      lire:`Bloc « Moteur pas à pas » : ${N} tr/min. Bloc « Poulies-courroie » : ${R1(kc)}. Bloc « Vis et écrou » : pas de ${p} mm.`,
      met:[`Fréquence de rotation de la vis : ${F(`N<sub>v</sub> = r·N<sub>m</sub> = ${FRAC(N,kc)} = ${S3(Nv)} tr/min`)}.`,
        `Le pas est l'avance de l'écrou pour un tour de la vis : ici ${p} mm par tour.`,
        `En une minute : ${F(`${S3(Nv)} × ${p} = ${S3(Nv*p)} mm`)}. Par seconde : ${F(`V = ${FRAC(S3(Nv*p),"60")} = ${S3(v)} mm/s`)}.`],
      piege:`Oublier la courroie entre le moteur et la vis, ou garder des millimètres par minute.`,
      ret:`Vis-écrou : ${F("V = p·N")}, avec N en tr/s (un pas par tour).`,
      diag:[{v:N*p/60,m:`tu as oublié les poulies et la courroie : la vis tourne ${kc} fois moins vite que le moteur.`},{v:Nv*p,m:`ta valeur est en millimètres par minute. Divise par 60 pour l'avoir en mm/s.`},{v:Nv/p/60,m:`tu as divisé par le pas. À chaque tour, le chariot avance d'un pas : on multiplie.`}]}; }
];

const V2N3=[
  /* étude A · la vitesse exigée est-elle atteinte ? exigence → roue → moteur → conclusion */
  ()=>{ const o=draw(()=>{ const Vk=rnd([4,5,6,8,10,12]), D=rnd([20,25,30,40]), k=rnd([10,15,20,25,30]), Nx=rnd([1500,2000,2400,3000,3600]), v=Vk/3.6, w=v/(D/200), Nm=w*k*60/TPI; return {Vk,D,k,Nx,v,w,Nm}; }, o=>far(o.Nm,o.Nx,0.08)&&o.Nm>500&&o.Nm<6500);
    const {Vk,D,k,Nx,v,w,Nm}=o, s=rnd(SYSR), oui=Nm<=Nx, Pn=rnd([150,200,250]);
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Vitesse de déplacement",txt:`${s.a} doit pouvoir rouler à ${Vk} km/h.`},{id:"1.2",nom:"Franchissement",txt:`${s.a} doit monter une pente de ${rnd([8,10,12])} %.`}]}))+
      DOC(2,"chaîne de puissance d'une roue motrice",d2Chaine({blocs:[{t:"Moteur",l:["voir figure 3"]},{t:"Réducteur",l:[R1(k),`Rendement ${nf(rnd([0.85,0.9]))}`]},{t:"Roue motrice",l:[`Diamètre ${D} cm`]}],liens:LCH}))+
      DOC(3,"caractéristiques du moteur",d2Fiche({lignes:[["Tension nominale","24 V"],["Puissance utile nominale",`${Pn} W`],["Fréquence de rotation maximale",`${nf(Nx,0)} tr/min`]]}));
    const don=`exigence : ${Vk} km/h ; diamètre de roue ${D} cm ; r = 1/${k} ; moteur : ${Nx} tr/min au maximum`;
    const fin=oui?mcw(`Oui : le moteur doit tourner à ${S3(Nm)} tr/min, moins que sa fréquence de rotation maximale (${nf(Nx,0)} tr/min).`,
        [[`Non : ${S3(Nm)} tr/min dépasse la fréquence de rotation maximale du moteur (${nf(Nx,0)} tr/min).`,`compare les deux nombres : ${S3(Nm)} est plus petit que ${nf(Nx,0)}.`],
         ["Oui, car le réducteur augmente la vitesse du moteur.","la conclusion est juste, mais pas la raison : un réducteur diminue la vitesse. Il faut comparer la vitesse demandée au moteur à celle qu'il peut atteindre."],
         ["On ne peut pas conclure : il manque le couple du moteur.","l'exigence 1.1 porte sur la vitesse : comparer la fréquence de rotation nécessaire à celle que le moteur peut atteindre suffit."]])
      :mcw(`Non : le moteur devrait tourner à ${S3(Nm)} tr/min, plus que sa fréquence de rotation maximale (${nf(Nx,0)} tr/min).`,
        [[`Oui : ${S3(Nm)} tr/min est inférieur à la fréquence de rotation maximale du moteur (${nf(Nx,0)} tr/min).`,`compare les deux nombres : ${S3(Nm)} est plus grand que ${nf(Nx,0)}.`],
         ["Oui, car le réducteur augmente la vitesse du moteur.","un réducteur diminue la vitesse. Et le moteur ne peut pas atteindre la fréquence de rotation nécessaire."],
         ["Non, car les roues sont trop grandes.","des roues plus grandes feraient au contraire avancer plus vite pour la même fréquence de rotation. C'est le moteur qui ne tourne pas assez vite."]]);
    return [{fig,don,q:`Relève, dans la figure 1, la vitesse que le ${s.n} doit pouvoir atteindre, puis exprime-la en m/s.`,nom:"V",type:"num",ans:v,tolR:0.01,unit:"m/s",
        expl:`Exigence 1.1 : ${Vk} km/h, soit ${FRAC(Vk,"3,6")} = ${U(v,"m/s")}.`,
        lire:`Figure 1, exigence 1.1 « Vitesse de déplacement » : ${Vk} km/h.`,
        met:[`On relève ${F(`V = ${Vk} km/h`)} dans l'exigence 1.1.`,`1 m/s = 3,6 km/h, donc ${F(`V = ${FRAC(Vk,"3,6")} = ${S3(v)} m/s`)}.`],
        piege:`Multiplier par 3,6. Un nombre de m/s est plus petit que le même nombre de km/h.`,
        ret:`km/h → m/s : on divise par 3,6.`,
        diag:[{v:Vk*3.6,m:`tu as multiplié par 3,6. Pour passer des km/h aux m/s, on divise par 3,6.`},{v:Vk,m:`tu as gardé la valeur en km/h. La question la demande en m/s.`}]},
      {q:`À l'aide de la figure 2, détermine la vitesse angulaire ${sb("ω","r")} des roues à cette vitesse. Les roues roulent sans glisser.`,nom:sb("ω","r"),type:"num",ans:w,tolR:0.01,unit:"rad/s",don,
        expl:`${F(`ω<sub>r</sub> = ${FRAC("V","R")}`)} = ${FRAC(S3(v),nf(D/200,3))} = ${U(w,"rad/s")}.`,
        lire:`Figure 2, bloc « Roue motrice » : diamètre ${D} cm, donc ${F(`R = ${nf(D/200,3)} m`)}.`,
        met:[`Roulement sans glissement : ${F("V = R·ω<sub>r</sub>")}, donc ${F(`ω<sub>r</sub> = ${FRAC("V","R")}`)}.`,`${F(`ω<sub>r</sub> = ${FRAC(S3(v),nf(D/200,3))} = ${S3(w)} rad/s`)}.`],
        piege:`Prendre le diamètre à la place du rayon.`,
        ret:`${F("V = R·ω")}, avec R en mètres.`,
        diag:[{v:w/2,m:`tu as divisé par le diamètre. Dans V = R·ω, R est le rayon.`},{v:v/(D/2),m:`tu as laissé le rayon en centimètres. Convertis-le en mètres.`},{v:v*D/200,m:`tu as multiplié la vitesse par le rayon. De V = R·ω, on tire ω = V sur R.`}]},
      {q:`Déduis-en la fréquence de rotation ${sb("N","m")} que le moteur doit atteindre, en tr/min.`,nom:sb("N","m"),type:"num",ans:Nm,tolR:0.01,unit:"tr/min",don,
        expl:`${F(`ω<sub>m</sub> = ${FRAC("ω<sub>r</sub>","r")}`)} = ${k} × ${S3(w)} = ${S3(w*k)} rad/s ; ${F(`N<sub>m</sub> = ${FRAC("60·ω<sub>m</sub>","2π")}`)} = ${U(Nm,"tr/min")}.`,
        lire:`Figure 2, bloc « Réducteur » : ${R1(k)}. Le rendement ne sert pas pour une vitesse.`,
        met:[`Le moteur est avant le réducteur : il tourne ${k} fois plus vite que la roue. ${F(`ω<sub>m</sub> = ${FRAC("ω<sub>r</sub>","r")} = ${k} × ${S3(w)} = ${S3(w*k)} rad/s`)}.`,
          `Conversion en tr/min : ${F(`N<sub>m</sub> = ${FRAC(`60 × ${S3(w*k)}`,"2π")} = ${S3(Nm)} tr/min`)}.`],
        piege:`Diviser la vitesse de la roue par ${k} : c'est le moteur qui tourne le plus vite, pas la roue.`,
        ret:`${F(`N = ${FRAC("60·ω","2π")}`)} (ω en rad/s, N en tr/min).`,
        diag:[{v:w*k,m:`ta valeur est en rad/s. Pour l'avoir en tr/min, multiplie par 60 et divise par 2π.`},{v:w*60/TPI,m:`tu as calculé la fréquence de rotation de la roue. Le moteur, avant le réducteur, tourne ${k} fois plus vite.`},{v:w/k*60/TPI,m:`tu as divisé par ${k}. Le moteur tourne ${k} fois plus vite que la roue : on multiplie.`}]},
      {q:`À l'aide de la figure 3, conclus : le moteur choisi permet-il de satisfaire l'exigence 1.1 ? Rédige ta réponse.`,...fin,type:"red",don,
        elements:[{t:`Donne la fréquence de rotation que le moteur doit atteindre (environ ${S3(Nm)} tr/min)`,p:1},{t:`Donne la fréquence de rotation maximale du moteur (${nf(Nx,0)} tr/min)`,p:1},{t:`Compare les deux valeurs`,p:1},{t:`Conclut que l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite`,p:2}],
        modele:`Pour rouler à ${Vk} km/h, le moteur doit tourner à ${S3(Nm)} tr/min. C'est ${cmp(Nm,Nx)} à sa fréquence de rotation maximale (${nf(Nx,0)} tr/min) : l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite.`,
        iaPlus:`Résultat de la question précédente : le moteur doit tourner à ${S3(Nm)} tr/min. Figure 3 : fréquence de rotation maximale du moteur ${Nx} tr/min.`,
        expl:oui?`${S3(Nm)} tr/min < ${nf(Nx,0)} tr/min : le moteur peut atteindre la fréquence de rotation nécessaire, l'exigence 1.1 est satisfaite.`:`${S3(Nm)} tr/min > ${nf(Nx,0)} tr/min : le moteur ne peut pas atteindre la fréquence de rotation nécessaire, l'exigence 1.1 n'est pas satisfaite.`,
        lire:`Figure 3, ligne « Fréquence de rotation maximale » : ${nf(Nx,0)} tr/min. Question précédente : il faut ${S3(Nm)} tr/min.`,
        met:[`Pour conclure, on compare ce qu'il faut à ce que le composant peut donner, dans la même unité.`,
          `Il faut ${F(`${S3(Nm)} tr/min`)} ; le moteur peut atteindre ${F(`${nf(Nx,0)} tr/min`)}.`,
          oui?`${S3(Nm)} < ${nf(Nx,0)} : l'exigence 1.1 est satisfaite.`:`${S3(Nm)} > ${nf(Nx,0)} : l'exigence 1.1 n'est pas satisfaite. Il faudrait un rapport de réduction plus proche de 1, ou des roues plus grandes.`],
        piege:`Conclure sans citer les deux valeurs comparées. À l'écrit, une conclusion sans nombres ne rapporte pas les points.`,
        ret:`Conclure = citer l'exigence, donner les deux valeurs, comparer, répondre.`}]; },

  /* étude B · treuil : couple au tambour, couple moteur avec le rendement, vitesse du câble, conclusion sur le moteur */
  ()=>{ const o=draw(()=>{ const Ft=rnd([800,1000,1200,1500,2000,2500]), D=rnd([80,100,120,150]), k=rnd([30,40,50,60]), eta=rnd([0.4,0.45,0.5,0.6]), Pn=rnd([250,370,550,750]), Nn=rnd([1400,1450,2800,2850]);
        const Cn=Number((Pn/(TPI*Nn/60)).toPrecision(3)), Cd=Number((Cn*rnd([2.5,3])).toPrecision(2)), Ct=Ft*D/2000, Cm=Ct/(k*eta), vc=TPI*Nn/60/k*D/2000; return {Ft,D,k,eta,Pn,Nn,Cn,Cd,Ct,Cm,vc}; },
      o=>far(o.Cm,o.Cn,0.1)&&far(o.Cm,o.Cd,0.1)&&o.Cm>0.4&&o.Cm<o.Cd*0.95&&o.vc>0.05&&o.vc<0.6);
    const {Ft,D,k,eta,Pn,Nn,Cn,Cd,Ct,Cm,vc}=o, oui=Cm<=Cn;
    const s=rnd([{n:"treuil de mise à l'eau d'une pirogue",c:"la remorque de la pirogue"},{n:"treuil d'un portique d'atelier",c:"la charge"},{n:"treuil d'une rampe de mise à l'eau",c:"la remorque du bateau"}]);
    const fig=DOC(1,`extrait du diagramme des exigences du ${s.n}`,d2Exig({reqs:[{id:"1.1",nom:"Effort de traction",txt:`Le treuil doit tirer ${s.c} avec un effort de ${nf(Ft,0)} N sur le câble.`}]}))+
      DOC(2,"chaîne de puissance du treuil",d2Chaine({blocs:[{t:"Moteur",l:["voir figure 3"]},{t:"Réducteur à roue et vis sans fin",l:[R1(k),`Rendement ${nf(eta)}`]},{t:"Tambour",l:[`Diamètre ${D} mm`]}],liens:[["U","I"],[sb("C","m"),sb("N","m")],[sb("C","t"),sb("N","t")],["F","V"]]}))+
      DOC(3,"caractéristiques du moteur",d2Fiche({lignes:[["Puissance utile nominale",`${Pn} W`],["Fréquence de rotation nominale",`${nf(Nn,0)} tr/min`],["Couple nominal",`${nf(Cn,3)} N·m`],["Couple de démarrage",`${nf(Cd,2)} N·m`]]}));
    const don=`effort exigé ${Ft} N ; tambour de diamètre ${D} mm ; r = 1/${k} ; rendement ${nf(eta)} ; moteur : ${Nn} tr/min, couple nominal ${nf(Cn,3)} N·m, démarrage ${nf(Cd,2)} N·m`;
    const fin=oui?mcw(`Oui : le couple nécessaire (${S3(Cm)} N·m) est inférieur au couple nominal du moteur (${nf(Cn,3)} N·m).`,
        [[`Non : le couple nécessaire (${S3(Cm)} N·m) dépasse le couple nominal du moteur (${nf(Cn,3)} N·m).`,`compare les deux nombres : ${S3(Cm)} est plus petit que ${nf(Cn,3)}.`],
         [`Non : le couple au tambour (${S3(Ct)} N·m) dépasse le couple nominal du moteur (${nf(Cn,3)} N·m).`,`on ne compare pas le couple du tambour à celui du moteur : le réducteur multiplie le couple. C'est le couple ramené sur l'arbre du moteur (${S3(Cm)} N·m) qu'il faut comparer.`],
         ["On ne peut pas conclure sans connaître la masse tirée.","l'exigence donne directement l'effort sur le câble : la masse n'est pas nécessaire."]])
      :mcw(`Non : le couple nécessaire (${S3(Cm)} N·m) dépasse le couple nominal du moteur (${nf(Cn,3)} N·m).`,
        [[`Oui : le couple nécessaire (${S3(Cm)} N·m) est inférieur au couple nominal du moteur (${nf(Cn,3)} N·m).`,`compare les deux nombres : ${S3(Cm)} est plus grand que ${nf(Cn,3)}.`],
         [`Oui : le couple nécessaire (${S3(Cm)} N·m) reste inférieur au couple de démarrage (${nf(Cd,2)} N·m).`,`le couple de démarrage n'est disponible que pendant un court instant. Pour tirer pendant toute la manœuvre, on compare au couple nominal.`],
         ["On ne peut pas conclure sans connaître la masse tirée.","l'exigence donne directement l'effort sur le câble : la masse n'est pas nécessaire."]]);
    return [{fig,don,q:`Relève l'effort de traction exigé (figure 1) et le diamètre du tambour (figure 2), puis détermine le couple ${sb("C","t")} que le tambour doit exercer.`,nom:sb("C","t"),type:"num",ans:Ct,tolR:0.01,unit:"N·m",
        expl:`${F("C<sub>t</sub> = F·R")} = ${nf(Ft,0)} × ${nf(D/2000,4)} = ${U(Ct,"N·m")}.`,
        lire:`Figure 1, exigence 1.1 : ${F(`F = ${nf(Ft,0)} N`)}. Figure 2, bloc « Tambour » : diamètre ${D} mm, donc ${F(`R = ${nf(D/2000,4)} m`)}.`,
        met:[`Le câble tire à la surface du tambour, à la distance R de son axe : ${F("C<sub>t</sub> = F·R")}.`,`${F(`C<sub>t</sub> = ${nf(Ft,0)} × ${nf(D/2000,4)} = ${S3(Ct)} N·m`)}.`],
        piege:`Laisser le rayon en millimètres, ou prendre le diamètre.`,
        ret:`Couple d'un tambour : ${F("C = F·R")}, avec R en mètres.`,
        diag:[{v:Ft*D/1000,m:`tu as multiplié par le diamètre. Le bras de levier du câble est le rayon du tambour.`},{v:Ft*D/2,m:`tu as laissé le rayon en millimètres. Convertis-le en mètres : le couple s'exprime en N·m.`},{v:Ft*D,m:`tu as pris le diamètre, et en millimètres. Il faut le rayon, en mètres.`}]},
      {q:`Détermine le couple ${sb("C","m")} que le moteur doit fournir, en tenant compte du rendement du réducteur.`,nom:sb("C","m"),type:"num",ans:Cm,tolR:0.01,unit:"N·m",don,
        expl:`${F(`C<sub>m</sub> = ${FRAC("r·C<sub>t</sub>","η")}`)} = ${FRAC(S3(Ct),`${k} × ${nf(eta)}`)} = ${U(Cm,"N·m")}.`,
        lire:`Figure 2, bloc « Réducteur » : ${R1(k)} et rendement ${F(`η = ${nf(eta)}`)}.`,
        met:[`Le réducteur multiplie le couple par ${k} et en perd une partie : ${F(`C<sub>t</sub> = ${FRAC("η·C<sub>m</sub>","r")}`)}.`,
          `On isole le couple moteur : ${F(`C<sub>m</sub> = ${FRAC("r·C<sub>t</sub>","η")} = ${FRAC(S3(Ct),`${k} × ${nf(eta)}`)} = ${S3(Cm)} N·m`)}.`,
          `Contrôle : un réducteur à roue et vis sans fin a un faible rendement. Le moteur doit fournir bien plus que ${FRAC("C<sub>t</sub>",k)} = ${S3(Ct/k)} N·m.`],
        piege:`Multiplier par le rendement. Les pertes obligent le moteur à fournir plus : on divise par η.`,
        ret:`${F(`C<sub>s</sub> = ${FRAC("η·C<sub>e</sub>","r")}`)}.`,
        diag:[{v:Ct/k,m:`tu as oublié le rendement. Avec des pertes, le moteur doit fournir plus : divise encore par η = ${nf(eta)}.`},{v:Ct*eta/k,m:`tu as multiplié par le rendement. Les pertes obligent le moteur à fournir plus de couple : on divise par η.`},{v:Ct*k/eta,m:`tu as multiplié par ${k}. Côté moteur, le couple est ${k} fois plus petit qu'au tambour (aux pertes près).`}]},
      {q:`Le moteur tourne à sa fréquence de rotation nominale (figure 3). Détermine la vitesse V d'enroulement du câble, en m/s.`,nom:"V",type:"num",ans:vc,tolR:0.015,unit:"m/s",don,
        expl:`${F("N<sub>t</sub> = r·N<sub>m</sub>")} = ${S3(Nn/k)} tr/min, soit ${S3(TPI*Nn/60/k)} rad/s ; ${F("V = R·ω<sub>t</sub>")} = ${U(vc,"m/s")}.`,
        lire:`Figure 3 : ${nf(Nn,0)} tr/min. Figure 2 : ${R1(k)} et tambour de rayon ${nf(D/2000,4)} m.`,
        met:[`Fréquence de rotation du tambour : ${F(`N<sub>t</sub> = ${FRAC(nf(Nn,0),k)} = ${S3(Nn/k)} tr/min`)}.`,
          `En rad/s : ${F(`ω<sub>t</sub> = ${FRAC(`2π × ${S3(Nn/k)}`,"60")} = ${S3(TPI*Nn/60/k)} rad/s`)}.`,
          `Le câble s'enroule sans glisser : ${F(`V = R·ω<sub>t</sub> = ${nf(D/2000,4)} × ${S3(TPI*Nn/60/k)} = ${S3(vc)} m/s`)}.`],
        piege:`Appliquer V = R·ω avec une vitesse en tr/min : ω doit être en rad/s.`,
        ret:`${F("V = R·ω")} avec ${F(`ω = ${FRAC("2π·N","60")}`)}.`,
        diag:[{v:Nn/k*D/2000,m:`tu as utilisé la fréquence de rotation en tr/min. Dans V = R·ω, ω est en rad/s : multiplie par 2π et divise par 60.`},{v:vc*k,m:`tu as oublié le réducteur : le tambour tourne ${k} fois moins vite que le moteur.`},{v:vc*2,m:`tu as utilisé le diamètre. Dans V = R·ω, R est le rayon.`},{v:vc*1000,m:`tu as laissé le rayon en millimètres : ta vitesse est en mm/s.`}]},
      {q:`À l'aide de la figure 3, conclus : le moteur choisi convient-il pour satisfaire l'exigence 1.1 pendant toute la manœuvre ? Rédige ta réponse.`,...fin,type:"red",don,
        elements:[{t:`Donne le couple que le moteur doit fournir (environ ${S3(Cm)} N·m)`,p:1},{t:`Donne le couple nominal du moteur (${nf(Cn,3)} N·m), et pas son couple de démarrage`,p:1},{t:`Compare les deux valeurs`,p:1},{t:`Conclut que le moteur ${oui?"convient":"ne convient pas"}`,p:2}],
        modele:`Le moteur doit fournir ${S3(Cm)} N·m pendant toute la manœuvre. C'est ${cmp(Cm,Cn)} à son couple nominal (${nf(Cn,3)} N·m) : le moteur ${oui?"convient":"ne convient pas"}.`,
        iaPlus:`Résultat des questions précédentes : couple nécessaire sur l'arbre du moteur ${S3(Cm)} N·m. Figure 3 : couple nominal ${nf(Cn,3)} N·m, couple de démarrage ${nf(Cd,2)} N·m (disponible un court instant seulement).`,
        expl:oui?`${S3(Cm)} N·m < ${nf(Cn,3)} N·m : le moteur peut fournir le couple nécessaire en permanence, il convient.`:`${S3(Cm)} N·m > ${nf(Cn,3)} N·m : le moteur ne peut pas fournir ce couple en permanence, il ne convient pas.`,
        lire:`Figure 3, ligne « Couple nominal » : ${nf(Cn,3)} N·m. Couple nécessaire sur l'arbre du moteur (deuxième question) : ${S3(Cm)} N·m.`,
        met:[`On compare le couple à fournir au couple que le moteur peut donner en permanence : son couple nominal.`,
          `Il faut ${F(`${S3(Cm)} N·m`)} ; le moteur donne ${F(`${nf(Cn,3)} N·m`)} en permanence.`,
          oui?`${S3(Cm)} < ${nf(Cn,3)} : le moteur convient.`:`${S3(Cm)} > ${nf(Cn,3)} : le moteur ne convient pas. Il faut un moteur de couple nominal plus grand, ou un réducteur qui réduit davantage : le couple demandé au moteur baisse, mais le câble s'enroule moins vite.`],
        piege:`Comparer au couple de démarrage, ou comparer le couple du tambour à celui du moteur sans passer par le réducteur.`,
        ret:`Un moteur convient si le couple demandé reste inférieur à son couple nominal.`}]; },

  /* étude C · portail coulissant : pignon, vitesse, durée d'ouverture, conclusion sur l'exigence */
  ()=>{ const o=draw(()=>{ const Nm=rnd([1400,1500,2800,3000]), k=rnd([20,25,30,40,50,60]), d=rnd([40,50,60,80]), Lc=rnd([3,4,5,6]), Tx=rnd([15,20,25,30,40]), Np=Nm/k, v=Math.PI*d/1000*Np/60, t=Lc/v; return {Nm,k,d,Lc,Tx,Np,v,t}; }, o=>far(o.t,o.Tx,0.08)&&o.v>0.06&&o.v<0.5);
    const {Nm,k,d,Lc,Tx,Np,v,t}=o, oui=t<=Tx, s=rnd(["d'une pension de famille","d'un atelier","d'un parking de résidence"]);
    const fig=DOC(1,`extrait du diagramme des exigences du portail coulissant ${s}`,d2Exig({reqs:[{id:"1.1",nom:"Durée d'ouverture",txt:`Le portail doit s'ouvrir complètement (course de ${Lc} m) en moins de ${Tx} s.`},{id:"1.2",nom:"Sécurité",txt:"L'effort de poussée sur un obstacle doit rester inférieur à 150 N."}]}))+
      DOC(2,"chaîne de puissance du portail",d2Chaine({blocs:[{t:"Moteur",l:[`${nf(Nm,0)} tr/min`]},{t:"Réducteur",l:[R1(k)]},{t:"Pignon et crémaillère",l:[`Pignon : diamètre ${d} mm`]}],liens:[["U","I"],[sb("C","m"),sb("N","m")],[sb("C","p"),sb("N","p")],["F","V"]]}));
    const don=`exigence : course ${Lc} m en moins de ${Tx} s ; moteur ${Nm} tr/min ; r = 1/${k} ; pignon de diamètre ${d} mm`;
    const fin=oui?mcw(`L'exigence est satisfaite : le portail s'ouvre en ${S3(t)} s, moins que les ${Tx} s exigées.`,
        [[`L'exigence n'est pas satisfaite : ${S3(t)} s dépasse les ${Tx} s exigées.`,`compare les deux nombres : ${S3(t)} est plus petit que ${Tx}.`],
         [`L'exigence est satisfaite, car la vitesse du portail (${S3(v)} m/s) est inférieure à ${Tx}.`,`on ne compare pas une vitesse à une durée. L'exigence 1.1 porte sur la durée d'ouverture : ${S3(t)} s, à comparer à ${Tx} s.`],
         ["On ne peut pas conclure sans connaître la masse du portail.","à vitesse constante, la durée ne dépend que de la course et de la vitesse."]])
      :mcw(`L'exigence n'est pas satisfaite : le portail s'ouvre en ${S3(t)} s, plus que les ${Tx} s exigées.`,
        [[`L'exigence est satisfaite : ${S3(t)} s est inférieur aux ${Tx} s exigées.`,`compare les deux nombres : ${S3(t)} est plus grand que ${Tx}.`],
         [`L'exigence est satisfaite, car la vitesse du portail (${S3(v)} m/s) est inférieure à ${Tx}.`,`on ne compare pas une vitesse à une durée. L'exigence 1.1 porte sur la durée d'ouverture : ${S3(t)} s, à comparer à ${Tx} s.`],
         ["On ne peut pas conclure sans connaître la masse du portail.","à vitesse constante, la durée ne dépend que de la course et de la vitesse."]]);
    return [{fig,don,q:`À l'aide de la figure 2, détermine la fréquence de rotation ${sb("N","p")} du pignon.`,nom:sb("N","p"),type:"num",ans:Np,tolR:0.01,unit:"tr/min",
        expl:`${F("N<sub>p</sub> = r·N<sub>m</sub>")} = ${FRAC(nf(Nm,0),k)} = ${U(Np,"tr/min")}.`,
        lire:`Figure 2, bloc « Moteur » : ${nf(Nm,0)} tr/min ; bloc « Réducteur » : ${R1(k)}.`,
        met:[`Le pignon est sur l'arbre de sortie du réducteur : ${F("N<sub>p</sub> = r·N<sub>m</sub>")}.`,`${F(`N<sub>p</sub> = ${FRAC(nf(Nm,0),k)} = ${S3(Np)} tr/min`)}.`],
        piege:`Multiplier par ${k} : un réducteur divise la vitesse.`,
        ret:`${F(`r = ${FRAC("N sortie","N entrée")}`)}.`,
        diag:[{v:Nm*k,m:`tu as multiplié par ${k}. Un réducteur de rapport ${R1(k)} divise la vitesse par ${k}.`}]},
      {q:`Détermine la vitesse de translation V du portail, en m/s.`,nom:"V",type:"num",ans:v,tolR:0.015,unit:"m/s",don,
        expl:`${F(`V = ${FRAC("π·d·N<sub>p</sub>","60")}`)} = ${FRAC(`π × ${nf(d/1000,3)} × ${S3(Np)}`,"60")} = ${U(v,"m/s")}.`,
        lire:`Figure 2, bloc « Pignon et crémaillère » : diamètre ${d} mm, soit ${nf(d/1000,3)} m.`,
        met:[`À chaque tour, le pignon fait avancer la crémaillère d'un périmètre : ${F(`π·d = π × ${nf(d/1000,3)} = ${S3(Math.PI*d/1000)} m`)}.`,
          `En une minute : ${F(`${S3(Math.PI*d/1000)} × ${S3(Np)} = ${S3(Math.PI*d/1000*Np)} m`)}.`,
          `Par seconde : ${F(`V = ${FRAC(S3(Math.PI*d/1000*Np),"60")} = ${S3(v)} m/s`)}.`],
        piege:`Oublier de diviser par 60 : la fréquence de rotation est par minute.`,
        ret:`Pignon-crémaillère : un périmètre ${F("π·d")} par tour de pignon, ou ${F("V = R·ω")}.`,
        diag:[{v:v/Math.PI,m:`à chaque tour, le portail avance d'un périmètre π·d, pas d'un diamètre.`},{v:v*60,m:`ta valeur est en mètres par minute. Divise par 60 pour l'avoir en m/s.`},{v:v*2,m:`tu as compté 2π·d par tour. Le périmètre du pignon vaut π·d, ou 2π·R.`},{v:v*1000,m:`tu as laissé le diamètre en millimètres : ta vitesse est en mm/s.`}]},
      {q:`Relève la course du portail dans la figure 1, puis détermine la durée d'une ouverture complète.`,nom:"durée d'ouverture",type:"num",ans:t,tolR:0.02,unit:"s",don,
        expl:`${F(`t = ${FRAC("course","V")}`)} = ${FRAC(Lc,S3(v))} = ${U(t,"s")}.`,
        lire:`Figure 1, exigence 1.1 : course de ${Lc} m.`,
        met:[`Le portail avance à vitesse constante : ${F(`t = ${FRAC("course","V")}`)}.`,`${F(`t = ${FRAC(Lc,S3(v))} = ${S3(t)} s`)}.`],
        piege:`Multiplier la course par la vitesse.`,
        ret:`À vitesse constante : ${F("d = V·t")}.`,
        diag:[{v:Lc*v,m:`tu as multiplié la course par la vitesse. La durée est la course divisée par la vitesse.`},{v:Tx,m:`tu as recopié la durée de l'exigence. On te demande la durée réelle, calculée avec la vitesse du portail.`}]},
      {q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,...fin,type:"red",don,
        elements:[{t:`Donne la durée d'ouverture calculée (environ ${S3(t)} s)`,p:1},{t:`Donne la durée exigée (moins de ${Tx} s)`,p:1},{t:`Compare les deux durées`,p:1},{t:`Conclut que l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite`,p:2}],
        modele:`Le portail s'ouvre en ${S3(t)} s. C'est ${cmp(t,Tx)} aux ${Tx} s exigées : l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite.`,
        iaPlus:`Résultat de la question précédente : durée d'une ouverture complète ${S3(t)} s. Exigence 1.1 : moins de ${Tx} s.`,
        expl:oui?`${S3(t)} s < ${Tx} s : l'exigence 1.1 est satisfaite.`:`${S3(t)} s > ${Tx} s : l'exigence 1.1 n'est pas satisfaite.`,
        lire:`Figure 1, exigence 1.1 : moins de ${Tx} s. Question précédente : ${S3(t)} s.`,
        met:[`On compare la durée calculée à la durée exigée, dans la même unité.`,`Durée d'ouverture : ${F(`${S3(t)} s`)} ; exigence : moins de ${F(`${Tx} s`)}.`,
          oui?`${S3(t)} < ${Tx} : l'exigence 1.1 est satisfaite.`:`${S3(t)} > ${Tx} : l'exigence 1.1 n'est pas satisfaite. Pour aller plus vite, il faut un pignon plus grand ou un rapport de réduction plus proche de 1.`],
        piege:`Comparer des grandeurs différentes (une vitesse et une durée), ou conclure sans citer les deux valeurs.`,
        ret:`Conclure = citer l'exigence, donner les deux valeurs, comparer, répondre.`}]; },

  /* étude D · axe de positionnement : avance par tour, résolution du codeur, impulsions sur la course, conclusion */
  ()=>{ const o=draw(()=>{ const p=rnd([2,4,5,8,10]), k=rnd([2,3,4,5]), n=rnd([100,200,360,500,1000]), Lc=rnd([200,300,400,500]), ex=rnd([2,5,10,20,50]), av=p/k, res=av/n*1000, imp=Lc*k*n/p; return {p,k,n,Lc,ex,av,res,imp}; }, o=>far(o.res,o.ex,0.12)&&Number.isInteger(o.imp)&&o.res>=0.5&&o.res<=60);
    const {p,k,n,Lc,ex,av,res,imp}=o, oui=res<=ex, s=rnd(["d'une machine de découpe laser","d'une imprimante 3D","d'un banc de mesure"]);
    const fig=DOC(1,`extrait du diagramme des exigences de l'axe ${s}`,d2Exig({reqs:[{id:"1.1",nom:"Précision",txt:`Le plus petit déplacement mesurable du chariot doit être inférieur ou égal à ${ex} µm.`},{id:"1.2",nom:"Course",txt:`Le chariot doit se déplacer sur une course de ${Lc} mm.`}]}))+
      DOC(2,"chaîne de puissance de l'axe",d2Chaine({blocs:[{t:"Moteur et codeur",l:[`Codeur : ${nf(n,0)} impulsions par tour`]},{t:"Réducteur",l:[R1(k)]},{t:"Vis et écrou",l:[`Pas ${p} mm`]},{t:"Chariot",l:[]}],liens:[["U","I"],[sb("N","m")],[sb("N","v")],["V"],false]}));
    const don=`exigence : ${ex} µm au plus ; course ${Lc} mm ; codeur ${n} impulsions/tour (arbre moteur) ; r = 1/${k} ; vis de pas ${p} mm`;
    const fin=oui?mcw(`L'exigence est satisfaite : le chariot avance de ${S3(res)} µm par impulsion, moins que les ${ex} µm exigés.`,
        [[`L'exigence n'est pas satisfaite : ${S3(res)} µm dépasse les ${ex} µm exigés.`,`compare les deux nombres : ${S3(res)} est plus petit que ${ex}.`],
         [`L'exigence est satisfaite, car le codeur délivre plus de ${ex} impulsions par tour.`,`on ne compare pas un nombre d'impulsions à une longueur. C'est le déplacement entre deux impulsions (${S3(res)} µm) qu'on compare aux ${ex} µm.`],
         ["On ne peut pas conclure sans connaître la vitesse du moteur.","le déplacement entre deux impulsions ne dépend pas de la vitesse : seulement du codeur, du réducteur et du pas de la vis."]])
      :mcw(`L'exigence n'est pas satisfaite : le chariot avance de ${S3(res)} µm par impulsion, plus que les ${ex} µm exigés.`,
        [[`L'exigence est satisfaite : ${S3(res)} µm est inférieur aux ${ex} µm exigés.`,`compare les deux nombres : ${S3(res)} est plus grand que ${ex}.`],
         [`L'exigence est satisfaite, car le codeur délivre plus de ${ex} impulsions par tour.`,`on ne compare pas un nombre d'impulsions à une longueur. C'est le déplacement entre deux impulsions (${S3(res)} µm) qu'on compare aux ${ex} µm.`],
         ["On ne peut pas conclure sans connaître la vitesse du moteur.","le déplacement entre deux impulsions ne dépend pas de la vitesse : seulement du codeur, du réducteur et du pas de la vis."]]);
    return [{fig,don,q:`À l'aide de la figure 2, détermine le déplacement du chariot lorsque le moteur fait un tour, en mm.`,nom:"avance par tour du moteur",type:"num",ans:av,tolR:0.01,unit:"mm",
        expl:`Un tour de moteur fait ${FRAC("1",k)} tour de vis : ${FRAC(p,k)} = ${U(av,"mm")}.`,
        lire:`Figure 2, bloc « Réducteur » : ${R1(k)} ; bloc « Vis et écrou » : pas de ${p} mm.`,
        met:[`Le pas est l'avance de l'écrou pour un tour de la vis : ${p} mm.`,`Pour un tour du moteur, la vis ne fait que ${FRAC("1",k)} de tour : ${F(`${FRAC(p,k)} = ${S3(av)} mm`)}.`],
        piege:`Oublier le réducteur : la vis tourne ${k} fois moins que le moteur.`,
        ret:`Vis-écrou : un pas par tour de vis.`,
        diag:[{v:p,m:`tu as donné le pas : c'est l'avance pour un tour de la vis. Pour un tour du moteur, la vis ne fait que ${FRAC("1",k)} de tour.`},{v:p*k,m:`tu as multiplié par ${k}. Le réducteur fait tourner la vis ${k} fois moins que le moteur : on divise.`}]},
      {q:`Le codeur est monté sur l'arbre du moteur. Déduis-en le déplacement du chariot entre deux impulsions, en micromètres (µm).`,nom:"déplacement entre deux impulsions",type:"num",ans:res,tolR:0.01,unit:"µm",don,
        expl:`${FRAC(`${S3(av)} mm`,nf(n,0))} = ${S3(av/n)} mm, soit ${U(res,"µm")}.`,
        lire:`Figure 2, bloc « Moteur et codeur » : ${nf(n,0)} impulsions par tour du moteur.`,
        met:[`En un tour du moteur, le chariot avance de ${S3(av)} mm et le codeur délivre ${nf(n,0)} impulsions.`,
          `Entre deux impulsions : ${F(`${FRAC(S3(av),nf(n,0))} = ${S3(av/n)} mm`)}.`,
          `1 mm = 1 000 µm : ${F(`${S3(av/n)} × 1 000 = ${S3(res)} µm`)}.`],
        piege:`Oublier la conversion : 1 mm = 1 000 µm.`,
        ret:`Plus petit déplacement mesurable = avance par tour divisée par le nombre d'impulsions par tour.`,
        diag:[{v:av/n,m:`ta valeur est en millimètres. La question demande des micromètres : 1 mm = 1 000 µm.`},{v:p/n*1000,m:`tu as oublié le réducteur : pour un tour du moteur, le chariot n'avance que de ${S3(av)} mm.`}]},
      {q:`Relève la course du chariot dans la figure 1, puis détermine le nombre d'impulsions comptées sur toute la course.`,nom:"impulsions sur la course",type:"num",ans:imp,tolR:0.005,unit:"impulsions",don,
        expl:`${FRAC(`${Lc} mm`,`${S3(av/n)} mm`)} = ${U(imp,"impulsions")}.`,
        lire:`Figure 1, exigence 1.2 : course de ${Lc} mm.`,
        met:[`Chaque impulsion correspond à ${S3(res)} µm, soit ${S3(av/n)} mm.`,`Sur ${Lc} mm : ${F(`${FRAC(Lc,S3(av/n))} = ${nf(imp,0)} impulsions`)}.`],
        piege:`Mélanger les unités : la course est en mm, le déplacement par impulsion en µm.`,
        ret:`Nombre d'impulsions = course divisée par le déplacement entre deux impulsions.`,
        diag:[{v:Lc/res,m:`tu as divisé des millimètres par des micromètres. Mets les deux longueurs dans la même unité.`},{v:Lc/p*n,m:`tu as oublié le réducteur : le moteur (et le codeur) fait ${k} tours pour un tour de vis.`}]},
      {q:`Conclus vis-à-vis de l'exigence 1.1. Rédige ta réponse.`,...fin,type:"red",don,
        elements:[{t:`Donne le déplacement du chariot entre deux impulsions (environ ${S3(res)} µm)`,p:1},{t:`Donne la valeur exigée (${ex} µm au plus)`,p:1},{t:`Compare les deux valeurs`,p:1},{t:`Conclut que l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite`,p:2}],
        modele:`Le plus petit déplacement mesurable est de ${S3(res)} µm. C'est ${cmp(res,ex)} aux ${ex} µm exigés : l'exigence 1.1 ${oui?"est":"n'est pas"} satisfaite.`,
        iaPlus:`Résultat des questions précédentes : déplacement du chariot entre deux impulsions ${S3(res)} µm. Exigence 1.1 : ${ex} µm au plus.`,
        expl:oui?`${S3(res)} µm ≤ ${ex} µm : l'exigence 1.1 est satisfaite.`:`${S3(res)} µm > ${ex} µm : l'exigence 1.1 n'est pas satisfaite.`,
        lire:`Figure 1, exigence 1.1 : ${ex} µm au plus. Deuxième question : ${S3(res)} µm entre deux impulsions.`,
        met:[`Le plus petit déplacement mesurable est celui qui sépare deux impulsions.`,`Il vaut ${F(`${S3(res)} µm`)} ; l'exigence demande ${F(`${ex} µm`)} au plus.`,
          oui?`${S3(res)} ≤ ${ex} : l'exigence 1.1 est satisfaite.`:`${S3(res)} > ${ex} : l'exigence 1.1 n'est pas satisfaite. Il faut un codeur avec plus d'impulsions par tour, ou une vis de pas plus petit.`],
        piege:`Se tromper de sens : ici, plus le déplacement entre deux impulsions est petit, meilleure est la précision.`,
        ret:`Conclure = citer l'exigence, donner les deux valeurs, comparer, répondre.`}]; }
];

{ const fiche=POOLS["meca-transmission"].fiche;
  POOLS["meca-transmission"]={titre:"Rapports, vitesses et couples",fiche,v2:true,count:{1:4,2:4,3:4},1:V2N1,2:V2N2,3:V2N3}; }
