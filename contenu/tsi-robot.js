/* ===================== TERMINALE SI — Projet fil rouge : robot sumo =====================
   Support : robot « TSI-SUMO » du dossier technique du professeur (banque d'écrit + carte fil rouge).
   m = 0,950 kg · g = 9,81 · e = 120 mm (bille → axe des roues motrices) · d = 45 mm (G en avant de l'axe)
   h_G = 35 mm · h_c = 30 mm · µ = 0,78 (plan incliné, α = 38°) · R = 21 mm · réducteur 1/48, η_r = 0,72
   k = 6,0e-3 N·m/A · R_i = 2,8 Ω · I0 = 0,080 A · U = 6,0 V (NiMH) · CAN 10 bits, 3,30 V · c = 343 m/s
   Exigences : Ex1 F ≥ 6,0 N · Ex2 m ≤ 1,000 kg et 200 × 200 mm · Ex3 ≤ 25 mm après détection de bordure
               Ex4 portée ≥ 300 mm · Ex5 v ≥ 0,30 m/s et a ≥ 1,0 m/s²
   4 modules = 4 sous-parties de la carte fil rouge : A statique (N7), B puissance (N8), C dynamique (N11), D information (N12). */
(function () {
  const nb = SIP.nb;
  const g = 9.81;
  const SEQ = "Projet · Robot sumo";
  const deg = (a) => (a * Math.PI) / 180;
  const ecart = (x, ref) => (Math.abs(x - ref) / Math.abs(ref)) * 100;
  const tab3 = (nom, v) => `<table><tr><th>Essai</th><th>1</th><th>2</th><th>3</th></tr><tr><td>${nom}</td>${v.map((x) => `<td>${nb(x)}</td>`).join("")}</tr></table>`;
  const S2 = "m·s<sup>−2</sup>", S1 = "m·s<sup>−1</sup>";

  // Validation d'un modèle : écart comparé au critère ET à la dispersion (cas 0, 1, 2 ; le 4e choix est toujours faux)
  const VALID = [
    "Modèle validé ; l'écart, plus petit que la dispersion, n'est pas significatif",
    "Modèle validé, mais l'écart dépasse la dispersion : un phénomène n'est pas modélisé",
    "Modèle non validé : l'écart dépasse le critère d'acceptation",
    "Modèle non validé : l'écart est plus petit que la dispersion"
  ];
  const casValidation = (r) => {
    const cas = r.int(0, 2), crit = r.pick([8, 10, 12]);
    let disp, ec;
    if (cas === 0) { disp = r.pick([4, 5, 6]); ec = disp - r.pick([1, 1.5, 2, 2.5]); }
    else if (cas === 1) { disp = r.pick([2, 3, 4]); ec = r.pas(disp + 1.5, crit - 0.5, 0.1); }
    else { disp = r.pick([3, 4, 5]); ec = r.pas(crit + 1, crit + 8, 0.1); }
    const expl = [
      `${nb(ec)} % &lt; ${crit} % : modèle validé ; et ${nb(ec)} % &lt; ${disp} % (dispersion) : l'écart peut venir du bruit de mesure, il n'est pas significatif.`,
      `${nb(ec)} % &lt; ${crit} % : modèle validé ; mais ${nb(ec)} % &gt; ${disp} % (dispersion) : l'écart est significatif, il traduit un phénomène non modélisé (frottements de la bille, rendement réel du réducteur…).`,
      `${nb(ec)} % &gt; ${crit} % : critère d'acceptation dépassé, le modèle doit être corrigé (l'écart dépasse aussi la dispersion de ${disp} %).`
    ][cas];
    return { cas, crit, disp, ec, expl };
  };

  /* =====================================================================
     MODULE A — La poussée disponible : statique et adhérence (N7)
     ===================================================================== */
  const EXIG = [["Ex1", "Expulser l'adversaire"], ["Ex2", "Respecter le règlement"], ["Ex3", "Rester dans l'aire"], ["Ex4", "Localiser l'adversaire"], ["Ex5", "Se déplacer"]];
  const CRITERES = [
    ["force de poussée disponible ≥ 6,0 N", 0], ["masse totale ≤ 1,000 kg", 1], ["encombrement ≤ 200 × 200 mm", 1],
    ["distance parcourue après détection de la bordure ≤ 25 mm", 2], ["portée de détection ≥ 300 mm", 3],
    [`vitesse de translation ≥ 0,30 ${S1}`, 4], [`accélération au démarrage ≥ 1,0 ${S2}`, 4]
  ];
  const MODIFS = [
    ["nettoyer le dohyō avant chaque combat", 0], ["remplacer la gomme des roues par un composé plus tendre", 0],
    ["rendre la bille folle motrice (ou passer à quatre roues motrices)", 1], ["ajouter des aimants sous le châssis", 1],
    ["reculer la batterie pour rapprocher G de l'axe des roues motrices", 1], ["monter des moteurs plus puissants", 2],
    ["choisir un réducteur de rapport plus grand (plus de couple)", 2], ["augmenter la tension d'alimentation des moteurs", 2]
  ];

  SIP.definirModule({
    id: "tsi-sumo-adherence",
    niveaux: ["TSI"],
    sequence: SEQ,
    titre: "Poussée disponible : adhérence et statique",
    description: "Loi de Coulomb, mesure de µ, répartition de la charge par le PFS, écart à l'exigence Ex1 et pistes d'amélioration du robot.",
    competences: ["M12", "M7", "A12", "A13"],
    nbQuestions: 10,
    questions: [
      // ---- Loi de Coulomb ----
      { fiche: "tsi-sumo-adh-coulomb", gen: (r) => { const mu = r.pick([0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.85, 0.9]), Nr = r.pas(4.5, 7.5, 0.05), F = mu * Nr;
          return { enonce: `Coefficient d'adhérence gomme / PVC <b>µ = ${nb(mu)}</b> ; effort normal du sol sur l'ensemble des roues motrices <b>N<sub>r</sub> = ${nb(Nr)} N</b>. Poussée maximale F<sub>max</sub> avant patinage ?`,
                   reponse: F, unite: "N", explication: `Loi de Coulomb : F<sub>max</sub> = µ·N<sub>r</sub> = ${nb(mu)} × ${nb(Nr)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-sumo-adh-coulomb", gen: (r) => { const m = r.pas(0.8, 1, 0.01), e = r.pick([100, 110, 120, 130]), d = r.pas(20, 55, 5), mu = r.pick([0.6, 0.7, 0.78, 0.8, 0.9]); const P = m * g, Nr = (P * (e - d)) / e, F = mu * Nr;
          return { enonce: `Robot : <b>m = ${nb(m)} kg</b>, deux roues motrices à l'arrière, bille folle à l'avant, <b>e = ${e} mm</b>, G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices, <b>µ = ${nb(mu)}</b>. Poussée maximale sans patinage ?`,
                   reponse: F, unite: "N", explication: `P = m·g = ${nb(P)} N ; N<sub>r</sub> = P·(e − d)/e = ${nb(Nr)} N ; F<sub>max</sub> = µ·N<sub>r</sub> = ${nb(mu)} × ${nb(Nr)} = ${nb(F)} N.` }; } },
      { type: "qcm", fiche: "tsi-sumo-adh-coulomb", enonce: "Le dossier technique donne µ = 0,78 « sans unité ». Pourquoi ?", choix: ["C'est le rapport de deux forces : T / N", "Il est trop petit pour qu'on écrive son unité", "Il s'exprime en N, mais on omet l'unité par habitude", "Il s'exprime en N·kg<sup>−1</sup>, comme g"], bonne: 0, explication: "µ = T/N : rapport de deux grandeurs de même nature, donc sans dimension." },
      { type: "qcm", fiche: "tsi-sumo-adh-coulomb", enonce: "Le coefficient µ = 0,78 du dossier technique caractérise…", choix: ["Le couple de surfaces gomme / PVC, dans leur état (propreté, usure)", "La gomme des roues, quelle que soit la piste", "Le robot entier, quelle que soit la surface", "La puissance transmissible par les moteurs"], bonne: 0, explication: "µ dépend des deux surfaces en contact et de leur état, pas d'un matériau seul." },
      { type: "qcm", fiche: "tsi-sumo-adh-coulomb", enonce: "Robot TSI-SUMO (bille folle à l'avant, deux roues motrices à l'arrière) : pour calculer sa poussée maximale, on multiplie µ par…", choix: ["N<sub>r</sub>, l'effort normal sur les seules roues motrices", "Le poids total m·g", "La masse m en kg", "N<sub>b</sub>, l'effort normal sur la bille folle"], bonne: 0, explication: "Seules les roues motrices transmettent un effort tangentiel ; la bille folle roule librement : F<sub>max</sub> = µ·N<sub>r</sub>." },
      { type: "qcm", fiche: "tsi-sumo-adh-coulomb", enonce: "Les moteurs pourraient faire pousser le robot avec 42 N, l'adhérence n'en autorise que 4,5 N. Avec des moteurs deux fois plus puissants, la poussée…", choix: ["Reste plafonnée à µ·N<sub>r</sub> : les roues patinent", "Double", "Augmente de 42 N", "Augmente seulement de 72 % à cause du réducteur"], bonne: 0, explication: "Au-delà de µ·N<sub>r</sub>, les roues patinent : le surplus de puissance part en chaleur et en usure de la gomme." },
      // ---- Mesurer µ ----
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const a = r.int(25, 45), mu = Math.tan(deg(a));
          return { enonce: `Plan incliné : un patin recouvert de la gomme des roues, posé sur une plaque du dohyō, commence à glisser quand l'inclinaison atteint <b>α = ${a}°</b>. Coefficient d'adhérence µ ?`,
                   reponse: mu, unite: "", explication: `À la limite du glissement, µ = tan α = tan ${a}° = ${nb(mu, 3)} (calculatrice en degrés).` }; } },
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const mu = r.pick([0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.85, 0.9, 1]), a = (Math.atan(mu) * 180) / Math.PI;
          return { enonce: `On veut vérifier au plan incliné une gomme annoncée à <b>µ = ${nb(mu)}</b> sur le PVC. À partir de quel angle le patin doit-il commencer à glisser ?`,
                   reponse: a, unite: "°", explication: `tan α = µ ⇒ α = arctan ${nb(mu)} = ${nb(a, 3)}°.` }; } },
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const m = r.pas(200, 800, 50), mu0 = r.pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9]), F = Math.round((mu0 * m) / 1000 * g * 20) / 20, mu = F / ((m / 1000) * g);
          return { enonce: `Un patin de <b>${m} g</b> recouvert de la gomme des roues est tiré horizontalement au dynamomètre sur le dohyō. Il décroche pour <b>F = ${nb(F)} N</b>. Coefficient d'adhérence µ ?`,
                   reponse: mu, unite: "", explication: `À la limite du glissement, F = µ·m·g ⇒ µ = F/(m·g) = ${nb(F)} / (${nb(m / 1000)} × 9,81) = ${nb(mu, 3)}.` }; } },
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const m = r.pas(300, 600, 50), base = r.pick([0.7, 0.75, 0.8, 0.85]) * (m / 1000) * g, off = r.melange([-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15]).slice(0, 3), F = off.map((o) => Math.round((base + o) * 20) / 20), Fm = (F[0] + F[1] + F[2]) / 3, mu = Fm / ((m / 1000) * g);
          return { enonce: `Trois essais au dynamomètre sur un patin de <b>${m} g</b> :${tab3("F (N)", F)}Valeur moyenne de µ ?`,
                   reponse: mu, unite: "", explication: `F<sub>moy</sub> = (${F.map((x) => nb(x)).join(" + ")})/3 = ${nb(Fm)} N ; µ = F<sub>moy</sub>/(m·g) = ${nb(Fm)} / ${nb((m / 1000) * g)} = ${nb(mu, 3)}.` }; } },
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const b = r.pick([0.72, 0.75, 0.78, 0.8, 0.84]), off = r.melange([-0.04, -0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03, 0.04]).slice(0, 3), v = off.map((o) => +(b + o).toFixed(2)), moy = (v[0] + v[1] + v[2]) / 3, et = Math.max(...v) - Math.min(...v), disp = (et / moy) * 100;
          return { enonce: `Trois mesures de µ au plan incliné :${tab3("µ", v)}Dispersion relative de la série (en %) ?`,
                   reponse: disp, unite: "%", tolerance: 3, explication: `Moyenne = ${nb(moy, 3)} ; étendue = ${nb(Math.max(...v))} − ${nb(Math.min(...v))} = ${nb(et)} ; dispersion = étendue / moyenne × 100 = ${nb(disp, 3)} %.` }; } },
      { fiche: "tsi-sumo-adh-mesure", gen: (r) => { const Nr = r.pas(5.2, 6.4, 0.02), F = r.pas(3.8, 5, 0.05), mu = F / Nr;
          return { enonce: `Le robot pousse un dynamomètre fixé à un support ; ses roues patinent quand l'appareil indique <b>${nb(F)} N</b>. Le PFS donne <b>N<sub>r</sub> = ${nb(Nr)} N</b> sur les roues motrices. Coefficient d'adhérence effectif µ ?`,
                   reponse: mu, unite: "", explication: `Au patinage, F = µ·N<sub>r</sub> ⇒ µ = ${nb(F)} / ${nb(Nr)} = ${nb(mu, 3)}. On divise par N<sub>r</sub>, pas par le poids : la bille folle ne transmet aucun effort moteur.` }; } },
      { type: "qcm", fiche: "tsi-sumo-adh-mesure", enonce: "Au plan incliné, le patin commence à glisser pour l'angle α. Le coefficient d'adhérence vaut…", choix: ["tan α", "sin α", "cos α", "1 / tan α"], bonne: 0, explication: "À la limite : T = m·g·sin α et N = m·g·cos α, donc µ = T/N = tan α." },
      // ---- PFS : répartition de la charge ----
      { fiche: "tsi-sumo-adh-pfs", gen: (r) => { const m = r.pas(700, 1000, 10), P = (m / 1000) * g;
          return { enonce: `Le robot pèse <b>${m} g</b> en ordre de marche (lest compris). Son poids P ? (g = 9,81 N·kg<sup>−1</sup>)`,
                   reponse: P, unite: "N", explication: `P = m·g = ${nb(m / 1000)} kg × 9,81 = ${nb(P)} N — la masse doit être en kilogrammes.` }; } },
      { fiche: "tsi-sumo-adh-pfs", gen: (r) => { const m = r.pas(0.8, 1, 0.01), e = r.pick([100, 110, 120, 130, 140]), d = r.pas(20, 60, 5), P = m * g, Nr = (P * (e - d)) / e;
          return { enonce: `Robot à l'arrêt : <b>m = ${nb(m)} kg</b>, empattement bille → axe des roues motrices <b>e = ${e} mm</b>, G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices. Effort normal N<sub>r</sub> du sol sur l'ensemble des deux roues motrices ?`,
                   reponse: Nr, unite: "N", explication: `Moment en B (bille) : N<sub>r</sub>·e − m·g·(e − d) = 0 ⇒ N<sub>r</sub> = ${nb(P)} × ${e - d}/${e} = ${nb(Nr)} N.` }; } },
      { fiche: "tsi-sumo-adh-pfs", gen: (r) => { const m = r.pas(0.8, 1, 0.01), e = r.pick([100, 110, 120, 130, 140]), d = r.pas(20, 60, 5), P = m * g, Nb = (P * d) / e;
          return { enonce: `Robot à l'arrêt : <b>m = ${nb(m)} kg</b>, <b>e = ${e} mm</b> (bille → axe des roues motrices), G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices. Effort normal N<sub>b</sub> du sol sur la bille folle ?`,
                   reponse: Nb, unite: "N", explication: `Moment au contact des roues : N<sub>b</sub>·e = m·g·d ⇒ N<sub>b</sub> = ${nb(P)} × ${d}/${e} = ${nb(Nb)} N (ou N<sub>b</sub> = P − N<sub>r</sub>).` }; } },
      { fiche: "tsi-sumo-adh-pfs", gen: (r) => { const e = r.pick([100, 110, 120, 130, 140]), d = r.pas(15, 60, 5), p = ((e - d) / e) * 100;
          return { enonce: `Empattement <b>e = ${e} mm</b>, G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices. Quelle part du poids (en %) repose sur les roues motrices ?`,
                   reponse: p, unite: "%", explication: `N<sub>r</sub>/P = (e − d)/e = ${e - d}/${e} = ${nb(p, 3)} %.` }; } },
      { fiche: "tsi-sumo-adh-pfs", gen: (r) => { const m = r.pas(850, 1000, 10), e = r.pick([110, 120, 130]), d0 = r.pas(20, 55, 1), Mr = Math.round((m * (e - d0)) / e), d = e * (1 - Mr / m);
          return { enonce: `On pose les deux roues motrices du robot (<b>m = ${m} g</b>) sur une balance, la bille folle sur une cale à la même hauteur : la balance indique <b>${Mr} g</b>. Empattement <b>e = ${e} mm</b>. Distance d entre G et l'axe des roues motrices ?`,
                   reponse: d, unite: "mm", tolerance: 3, explication: `N<sub>r</sub>/P = ${Mr}/${m} = (e − d)/e ⇒ d = e·(1 − ${Mr}/${m}) = ${e} × ${nb(1 - Mr / m, 3)} = ${nb(d, 3)} mm.` }; } },
      { type: "qcm", fiche: "tsi-sumo-adh-pfs", enonce: "Robot isolé, à l'arrêt sur le dohyō horizontal, sans adversaire. Actions mécaniques extérieures ?", choix: ["3 actions verticales : le poids en G, le sol sur les roues motrices, le sol sur la bille folle", "4 actions : les 3 actions verticales + une force motrice horizontale", "2 actions : le poids et l'action du sol, toutes deux en G", "3 actions : le poids, le sol sur les roues et le couple moteur"], bonne: 0, explication: "À l'arrêt, sans effort moteur, aucune composante tangentielle ; chaque action est placée à son point d'application." },
      { type: "qcm", fiche: "tsi-sumo-adh-pfs", enonce: "Moment du poids au point de contact B de la bille folle (e : empattement, d : distance de G à l'axe des roues motrices) :", choix: ["m·g·(e − d)", "m·g·d", "m·g·e", "m·g·(e + d)"], bonne: 0, explication: "G est à d en avant des roues, donc à (e − d) de la bille : utiliser d est l'erreur la plus fréquente." },
      { type: "qcm", fiche: "tsi-sumo-adh-pfs", enonce: "Un élève trouve N<sub>r</sub> = 5,82 N et N<sub>b</sub> = 4,10 N pour un poids P = 9,32 N. Que penser ?", choix: ["Il y a une erreur : N<sub>r</sub> + N<sub>b</sub> doit être égal à P", "C'est juste : la bille porte simplement plus que prévu", "C'est juste si le robot accélère", "Il y a une erreur : N<sub>b</sub> doit être égal à N<sub>r</sub>"], bonne: 0, explication: "Résultante verticale : N<sub>r</sub> + N<sub>b</sub> − P = 0. Ici 5,82 + 4,10 = 9,92 N ≠ 9,32 N (attendu : N<sub>b</sub> = 3,49 N)." },
      // ---- Écart relatif et conclusion sur une exigence ----
      { fiche: "tsi-sumo-adh-ecart", gen: (r) => { let F = r.pas(3.5, 7.5, 0.05); if (Math.abs(F - 6) < 0.01) F = 5.5; const ec = ecart(F, 6);
          return { enonce: `Le calcul donne une poussée disponible <b>F<sub>max</sub> = ${nb(F)} N</b>. L'exigence Ex1 demande une poussée ≥ 6,0 N. Écart relatif par rapport au niveau de l'exigence (en %) ?`,
                   reponse: ec, unite: "%", explication: `écart = |${nb(F)} − 6,00| / 6,00 × 100 = ${nb(ec, 3)} % (référence = niveau de l'exigence). ${F < 6 ? "Poussée inférieure au niveau : l'exigence Ex1 n'est pas satisfaite." : "Poussée supérieure au niveau : l'exigence Ex1 est satisfaite."}` }; } },
      { fiche: "tsi-sumo-adh-ecart", gen: (r) => { const Fmod = r.pas(4.3, 5, 0.01), dec = r.pick([0.05, 0.07, 0.09, 0.11]), base = Fmod * (1 - dec), off = r.melange([-0.1, -0.05, 0, 0.05, 0.1]).slice(0, 3), F = off.map((o) => Math.round((base + o) * 100) / 100), moy = (F[0] + F[1] + F[2]) / 3, ec = ecart(moy, Fmod), disp = ((Math.max(...F) - Math.min(...F)) / moy) * 100;
          return { enonce: `Le modèle (µ·N<sub>r</sub>) prévoit <b>${nb(Fmod)} N</b>. Le robot pousse un dynamomètre fixé à un support jusqu'au patinage :${tab3("F (N)", F)}Écart relatif entre la moyenne des mesures et le modèle (en %) ?`,
                   reponse: ec, unite: "%", tolerance: 5, explication: `Moyenne = ${nb(moy, 3)} N ; écart = |${nb(moy, 3)} − ${nb(Fmod)}| / ${nb(Fmod)} × 100 = ${nb(ec, 2)} %. Dispersion des essais : ${nb(disp, 2)} % → ${ec > disp ? "l'écart la dépasse, il est significatif (état de la gomme, poussière… non modélisés)." : "l'écart est plus petit, il n'est pas significatif."}` }; } },
      { fiche: "tsi-sumo-adh-ecart", gen: (r) => { const avant = r.pas(4.2, 4.8, 0.02), disp = r.pick([3, 4, 5, 6]), sig = r.int(0, 1) === 1, effet0 = sig ? disp + r.pick([2, 3, 4, 5]) : disp - r.pick([1.5, 2, 2.5]), apres = Number((avant * (1 + effet0 / 100)).toPrecision(3)), effet = ecart(apres, avant);
          return { type: "qcm", enonce: `Après changement de la gomme des roues, la poussée moyenne mesurée passe de <b>${nb(avant)} N</b> à <b>${nb(apres)} N</b>. La dispersion relative des séries d'essais est de <b>${disp} %</b>. Que conclure ?`,
                   choix: ["L'amélioration est réelle : l'effet dépasse la dispersion des essais", "On ne peut pas conclure : l'effet est plus petit que la dispersion des essais", "La nouvelle gomme dégrade la poussée", "Il faut calculer l'écart sans valeur absolue pour conclure"], bonne: sig ? 0 : 1,
                   explication: `Effet = |${nb(apres)} − ${nb(avant)}| / ${nb(avant)} × 100 = ${nb(effet, 2)} % ${sig ? "&gt;" : "&lt;"} ${disp} % : ${sig ? "l'effet sort du bruit de mesure, il est réel." : "un effet plus petit que la dispersion ne permet pas de conclure."}` }; } },
      { fiche: "tsi-sumo-adh-ecart", gen: (r) => { const cas = r.int(0, 3), okM = cas === 0 || cas === 2, okD = cas === 0 || cas === 1; const m = okM ? r.pas(900, 1000, 5) : r.pas(1005, 1080, 5); const L = okD ? r.pas(170, 200, 5) : r.pas(205, 230, 5), l = r.pas(150, 200, 5); const dims = r.int(0, 1) ? `${L} × ${l}` : `${l} × ${L}`;
          return { type: "qcm", enonce: `Un robot pèse <b>${nb(m)} g</b> et mesure <b>${dims} mm</b> en vue de dessus. Exigence Ex2 : masse ≤ 1,000 kg et encombrement ≤ 200 × 200 mm. Verdict ?`,
                   choix: ["Conforme à Ex2", "Non conforme : masse trop élevée", "Non conforme : encombrement trop grand", "Non conforme : masse et encombrement"], bonne: cas,
                   explication: `Masse : ${nb(m)} g ${okM ? "≤" : "&gt;"} 1 000 g ; plus grande dimension : ${Math.max(L, l)} mm ${okD ? "≤" : "&gt;"} 200 mm. Les niveaux « ≤ » incluent la valeur limite.` }; } },
      { fiche: "tsi-sumo-adh-ecart", gen: (r) => { const c = r.pick(CRITERES), autres = r.melange(EXIG.filter((_, j) => j !== c[1])).slice(0, 3), lab = (x) => `${x[0]} — ${x[1]}`;
          return { type: "qcm", enonce: `Diagramme des exigences du robot sumo : à quelle exigence se rattache le critère « ${c[0]} » ?`,
                   choix: [lab(EXIG[c[1]]), ...autres.map(lab)], bonne: 0, explication: `Ce critère appartient à ${lab(EXIG[c[1]])}. Toute conclusion doit citer l'identifiant de l'exigence.` }; } },
      { type: "qcm", fiche: "tsi-sumo-adh-ecart", enonce: "Pour conclure sur Ex1, quelle référence prend-on dans le calcul de l'écart relatif ?", choix: ["Le niveau de l'exigence : 6,0 N", "La poussée calculée : 4,54 N", "La moyenne des deux valeurs", "Le poids du robot : 9,32 N"], bonne: 0, explication: "On compare la performance obtenue à ce qui est attendu : la référence, annoncée, est le niveau de l'exigence." },
      { type: "qcm", fiche: "tsi-sumo-adh-ecart", enonce: "Un élève écrit : « écart = (4,54 − 6,00) / 6,00 × 100 = −24,3 % ». Quelle correction ?", choix: ["L'écart relatif se donne en valeur absolue : 24,3 %", "La référence devait être 4,54 N : −32,2 %", "Il fallait diviser par 100 au lieu de multiplier", "Aucune : un écart négatif signifie que l'exigence est satisfaite"], bonne: 0, explication: "Convention : écart = |valeur − référence| / référence × 100, toujours positif ; le sens se dit en mots (« inférieure de 24,3 % »)." },
      { type: "qcm", fiche: "tsi-sumo-adh-ecart", enonce: "Quelle conclusion est rédigée comme on l'attend à l'écrit ?", choix: ["« L'exigence Ex1 n'est pas satisfaite : 4,54 N &lt; 6,0 N. »", "« La poussée est trop faible. »", "« Le robot est nul en poussée. »", "« F<sub>max</sub> = 4,54 N. »"], bonne: 0, explication: "Toute conclusion nomme l'exigence et confronte la valeur obtenue à son niveau." },
      // ---- Améliorer la poussée sans basculer ----
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const m = r.pick([0.9, 0.92, 0.95, 0.98, 1]), mu = r.pick([0.78, 0.8, 0.85, 0.9]), e = r.pick([110, 120, 130]), F = r.pick([5.5, 6]); const P = m * g, k = F / (mu * P), dmax = e * (1 - k);
          return { enonce: `Pour atteindre <b>F = ${nb(F)} N</b> (Ex1), on recule la batterie, masse inchangée. <b>m = ${nb(m)} kg</b>, <b>µ = ${nb(mu)}</b>, <b>e = ${e} mm</b>. Distance maximale d entre G et l'axe des roues motrices ?`,
                   reponse: dmax, unite: "mm", tolerance: 3, explication: `µ·m·g·(e − d)/e ≥ F ⇒ (e − d)/e ≥ ${nb(F)} / (${nb(mu)} × ${nb(P)}) = ${nb(k)} ⇒ d ≤ ${e} × ${nb(1 - k, 3)} = ${nb(dmax, 3)} mm.` }; } },
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const mu = r.pick([0.7, 0.75, 0.78, 0.8]), e = r.pick([110, 120, 130]), d = r.pas(35, 55, 5), mn = 6 / ((mu * g * (e - d)) / e);
          return { enonce: `Sans déplacer G (<b>d = ${d} mm</b>, <b>e = ${e} mm</b>, <b>µ = ${nb(mu)}</b>), quelle masse totale faudrait-il pour que la poussée maximale atteigne <b>6,0 N</b> (Ex1) ?`,
                   reponse: mn, unite: "kg", explication: `F<sub>max</sub> = µ·m·g·(e − d)/e est proportionnelle à m : m = 6,0 / (${nb(mu)} × 9,81 × ${e - d}/${e}) = ${nb(mn, 3)} kg &gt; 1,000 kg : Ex2 serait violée, solution à écarter.` }; } },
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const m = r.pas(0.8, 1, 0.05), d = r.pas(20, 50, 5), hc = r.pick([20, 25, 30, 35, 40]), F = (m * g * d) / hc;
          return { enonce: `L'adversaire pousse horizontalement le robot à <b>h<sub>c</sub> = ${hc} mm</b> du sol. Robot : <b>m = ${nb(m)} kg</b>, G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices. Effort qui le ferait basculer vers l'arrière (bille folle décollée) ?`,
                   reponse: F, unite: "N", explication: `Moment au contact des roues, à la limite N<sub>b</sub> = 0 : F·h<sub>c</sub> = m·g·d ⇒ F = ${nb(m * g)} × ${d}/${hc} = ${nb(F)} N.` }; } },
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const m = r.pas(0.85, 1, 0.05), d = r.pas(25, 50, 5), hc = r.pick([25, 30, 35]), F = r.pas(3.5, 6, 0.1); const Ms = (m * g * d) / 1000, Mr = (F * hc) / 1000, s = Ms / Mr;
          return { enonce: `Pendant la poussée, l'adversaire exerce <b>${nb(F)} N</b> à <b>h<sub>c</sub> = ${hc} mm</b>. Robot : <b>m = ${nb(m)} kg</b>, <b>d = ${d} mm</b>. Coefficient de sécurité au basculement (moment stabilisant / moment renversant) ?`,
                   reponse: s, unite: "", explication: `Au contact des roues : renversant F·h<sub>c</sub> = ${nb(F)} × ${nb(hc / 1000)} = ${nb(Mr, 3)} N·m ; stabilisant m·g·d = ${nb(m * g)} × ${nb(d / 1000)} = ${nb(Ms, 3)} N·m ; s = ${nb(s, 3)}${s > 1 ? " &gt; 1 : pas de basculement." : " &lt; 1 : le robot bascule !"}` }; } },
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const m = r.pas(0.85, 1, 0.01), mu = r.pick([0.7, 0.78, 0.8, 0.85]), F = mu * m * g;
          return { enonce: `On rend la bille folle motrice : tout le poids repose alors sur des roues motrices. Robot de <b>${nb(m)} kg</b>, <b>µ = ${nb(mu)}</b>. Nouvelle poussée maximale ?`,
                   reponse: F, unite: "N", explication: `N = m·g = ${nb(m * g)} N en totalité ; F<sub>max</sub> = µ·m·g = ${nb(mu)} × ${nb(m * g)} = ${nb(F)} N${F >= 6 ? " ≥ 6,0 N : Ex1 serait satisfaite." : " &lt; 6,0 N : Ex1 toujours non satisfaite."}` }; } },
      { fiche: "tsi-sumo-adh-ameliorer", gen: (r) => { const x = r.pick(MODIFS);
          return { type: "qcm", enonce: `Pour augmenter la poussée F<sub>max</sub> = µ·N, on propose de <b>${x[0]}</b>. Sur quel terme cette modification agit-elle ?`,
                   choix: ["Sur µ", "Sur N, l'effort normal sur les roues motrices", "Sur aucun des deux : F<sub>max</sub> ne change pas", "Sur µ et sur N à la fois"], bonne: x[1],
                   explication: ["L'état des surfaces en contact change : µ augmente.", "L'effort normal sur les roues motrices augmente, sans ajouter de masse.", "La poussée est plafonnée par l'adhérence, pas par la motorisation : les roues patineraient."][x[1]] }; } },
      { type: "qcm", fiche: "tsi-sumo-adh-ameliorer", enonce: "Pour atteindre 6,0 N sans déplacer G, un élève propose d'ajouter 305 g de lest (m = 1,255 kg). Verdict ?", choix: ["Solution à écarter : Ex2 impose m ≤ 1,000 kg", "Bonne solution : F<sub>max</sub> est proportionnelle à m", "Bonne solution si le lest est placé en G", "Solution à écarter : le lest diminue µ"], bonne: 0, explication: "La conclusion confronte deux exigences : Ex1 serait satisfaite, mais Ex2 violée. C'est la répartition de la masse qu'il faut corriger." },
      { type: "qcm", fiche: "tsi-sumo-adh-ameliorer", enonce: "Reculer la batterie pour ramener G de d = 45 mm à d = 21 mm :", choix: ["Augmente F<sub>max</sub> mais réduit la marge au basculement", "Augmente F<sub>max</sub> et la marge au basculement", "Diminue F<sub>max</sub>", "Ne change rien : la masse est la même"], bonne: 0, explication: "N<sub>r</sub> = m·g·(e − d)/e augmente, mais le moment stabilisant m·g·d diminue : le coefficient de sécurité passe de 3,1 à 1,1. C'est un compromis." }
    ],
    fiches: [
      { id: "tsi-sumo-adh-coulomb", titre: "Loi de Coulomb : poussée maximale",
        recto: "Quelle poussée maximale un robot peut-il exercer avant que ses roues motrices patinent ?",
        verso: `<div class="formule">F<sub>max</sub> = µ × N<sub>r</sub></div><ul><li>N<sub>r</sub> : effort normal du sol sur les <b>roues motrices</b> seulement (la bille folle porte le reste).</li><li>µ : sans unité (rapport de deux forces) ; il caractérise un <b>couple de surfaces</b> (gomme / PVC), pas un matériau.</li></ul><p class="astuce">Au-delà de µ·N<sub>r</sub> les roues patinent : un moteur plus puissant ne pousse pas plus fort.</p>`,
        quiz: [{ enonce: "µ = 0,78 et N<sub>r</sub> = 5,82 N : F<sub>max</sub> ≈ …", choix: ["4,54 N", "7,46 N", "7,27 N"], bonne: 0 },
               { enonce: "µ s'exprime en…", choix: ["Sans unité", "N", "N·kg<sup>−1</sup>"], bonne: 0 },
               { enonce: "Pour pousser plus fort sans patiner, on agit sur…", choix: ["µ ou N<sub>r</sub>", "La puissance des moteurs", "Le rapport de réduction"], bonne: 0 }] },
      { id: "tsi-sumo-adh-mesure", titre: "Mesurer µ et la dispersion",
        recto: "Comment mesure-t-on µ au plan incliné ou au dynamomètre, et comment chiffre-t-on la dispersion d'une série d'essais ?",
        verso: `<div class="formule">Plan incliné : µ = tan α &nbsp;·&nbsp; Dynamomètre : µ = F / (m·g)</div><ul><li>α : inclinaison au début du glissement ; F : force horizontale de décrochage.</li><li>Série de 3 essais : moyenne ; étendue = max − min.</li></ul><div class="formule">dispersion relative = étendue / moyenne × 100</div><p class="astuce">Calculatrice en degrés : tan 38° = 0,78.</p>`,
        quiz: [{ enonce: "Le patin glisse à α = 38° : µ ≈ …", choix: ["0,78", "0,62", "1,28"], bonne: 0 },
               { enonce: "Mesures 0,76 ; 0,80 ; 0,78 : dispersion relative ≈ …", choix: ["5,1 %", "0,04 %", "2,6 %"], bonne: 0 },
               { enonce: "Au dynamomètre, µ = …", choix: ["F / (m·g)", "F × m·g", "m·g / F"], bonne: 0 }] },
      { id: "tsi-sumo-adh-pfs", titre: "PFS : répartition de la charge",
        recto: "Comment se répartit le poids du robot entre les roues motrices et la bille folle ?",
        verso: `<p>3 actions verticales : P en G, N<sub>r</sub> aux roues motrices, N<sub>b</sub> à la bille. e : bille → axe des roues ; d : G en avant de l'axe des roues.</p><div class="formule">N<sub>r</sub> + N<sub>b</sub> − m·g = 0 &nbsp;·&nbsp; en B : N<sub>r</sub>·e − m·g·(e − d) = 0</div><div class="formule">N<sub>r</sub> = m·g·(e − d)/e &nbsp;·&nbsp; N<sub>b</sub> = m·g·d/e</div><p class="astuce">Bras de levier du poids autour de la bille : (e − d), pas d. Vérifier N<sub>r</sub> + N<sub>b</sub> = P.</p>`,
        quiz: [{ enonce: "Bras de levier du poids autour du contact de la bille :", choix: ["e − d", "d", "e"], bonne: 0 },
               { enonce: "m·g = 9,32 N, e = 120 mm, d = 45 mm : N<sub>r</sub> ≈ …", choix: ["5,82 N", "3,49 N", "9,32 N"], bonne: 0 },
               { enonce: "Vérification rapide :", choix: ["N<sub>r</sub> + N<sub>b</sub> = P", "N<sub>r</sub> = N<sub>b</sub>", "N<sub>r</sub> = P"], bonne: 0 }] },
      { id: "tsi-sumo-adh-ecart", titre: "Écart relatif et conclusion sur une exigence",
        recto: "Comment calcule-t-on un écart relatif, et comment conclut-on sur une exigence du cahier des charges ?",
        verso: `<div class="formule">écart = |valeur − référence| / référence × 100</div><ul><li>Référence annoncée : niveau de l'exigence (ou valeur simulée). Écart toujours positif.</li><li>Comparer l'écart au <b>critère</b> ET à la <b>dispersion</b> des essais : plus petit que la dispersion → on ne peut pas conclure.</li></ul><p class="astuce">Nommer l'exigence : « l'exigence Ex1 n'est pas satisfaite », jamais « c'est trop faible ».</p>`,
        quiz: [{ enonce: "Écart relatif entre 4,54 N et le niveau de 6,0 N :", choix: ["24,3 %", "−24,3 %", "32,2 %"], bonne: 0 },
               { enonce: "Effet de 3 %, dispersion des essais de 5 % :", choix: ["On ne peut pas conclure à un effet réel", "L'effet est réel", "Le modèle est faux"], bonne: 0 },
               { enonce: "Une bonne conclusion…", choix: ["Nomme l'exigence et compare au niveau", "Recopie le calcul", "Donne seulement la valeur"], bonne: 0 }] },
      { id: "tsi-sumo-adh-ameliorer", titre: "Améliorer la poussée sans basculer",
        recto: "Comment augmenter la poussée du robot sans violer le règlement ni le faire basculer ?",
        verso: `<ul><li><b>Reculer G</b> (d ↓) : N<sub>r</sub> ↑ donc F<sub>max</sub> ↑.</li><li><b>Lester</b> : interdit si m &gt; 1,000 kg (Ex2).</li><li><b>Bille motrice</b> : N = m·g en totalité.</li><li>Gomme plus tendre, dohyō propre : µ ↑.</li></ul><div class="formule">Basculement vers l'arrière si F·h<sub>c</sub> &gt; m·g·d</div><p class="astuce">Réduire d réduit aussi la marge au basculement : compromis vers d = 25 à 30 mm.</p>`,
        quiz: [{ enonce: "Ajouter du lest pour atteindre 6 N :", choix: ["Viole Ex2 (m &gt; 1 kg)", "Est la meilleure solution", "Diminue µ"], bonne: 0 },
               { enonce: "Reculer G (d ↓) :", choix: ["F<sub>max</sub> ↑, marge au basculement ↓", "F<sub>max</sub> ↑, marge au basculement ↑", "F<sub>max</sub> ↓"], bonne: 0 },
               { enonce: "Le robot bascule vers l'arrière si…", choix: ["F·h<sub>c</sub> &gt; m·g·d", "F &gt; µ·N<sub>r</sub>", "F·d &gt; m·g·h<sub>c</sub>"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     MODULE B — La chaîne de puissance : moteur, réducteur, rendement (N8)
     ===================================================================== */
  const BLOCS = [["Alimenter", "Pack de batteries NiMH 6 V"], ["Distribuer", "Pont en H"], ["Convertir", "Moteur à courant continu"], ["Transmettre", "Réducteur 1/48"], ["Agir", "Roue au contact du dohyō"]];
  const BLOCS_MOD = ["Source de tension", "Résistance d'induit", "Machine à courant continu", "Réducteur", "Roue (rotation → translation)", "Masse en translation"];
  const PARAMS = [["U = 6,0 V", 0], ["R<sub>i</sub> = 2,8 Ω", 1], ["k = 6,0 × 10<sup>−3</sup> N·m·A<sup>−1</sup>", 2], ["i = 48", 3], ["η<sub>r</sub> = 0,72", 3], ["R = 0,021 m", 4], ["m/2 = 0,475 kg par voie", 5]];
  const LIENS = [["entre la batterie et le pont en H", 0], ["entre le pont en H et le moteur", 0], ["sur l'arbre moteur (entre moteur et réducteur)", 1], ["en sortie du réducteur (axe de la roue)", 1], ["au contact roue / dohyō", 2]];
  const PERTES = [["proportionnelles à R<sub>i</sub>·I²", 0], ["qui chauffent les bobinages de l'induit", 0], ["traduites par le rendement η<sub>r</sub> = 0,72", 1], ["dues au frottement des dentures", 1], ["dues au glissement de la roue (v<sub>roue</sub> &gt; v<sub>robot</sub>)", 2], ["qui usent la gomme des roues", 2], ["traduites par le courant à vide I<sub>0</sub>", 3]];

  SIP.definirModule({
    id: "tsi-sumo-motorisation",
    niveaux: ["TSI"],
    sequence: SEQ,
    titre: "Chaîne de puissance : moteur, réducteur, rendement",
    description: "Chaîne de puissance du robot, couple et vitesse à travers le réducteur 1/48, modèle du moteur à courant continu, rendement, pertes et énergie de la batterie.",
    competences: ["A2", "M2", "M3", "A13"],
    nbQuestions: 10,
    questions: [
      // ---- Chaîne de puissance et modèle ----
      { fiche: "tsi-sumo-mot-chaine", gen: (r) => { const k = r.int(0, 4), autres = r.melange(BLOCS.filter((_, j) => j !== k)).slice(0, 3);
          return { type: "qcm", enonce: `Chaîne de puissance du robot sumo : quel composant assure la fonction <b>${BLOCS[k][0]}</b> ?`,
                   choix: [BLOCS[k][1], ...autres.map((b) => b[1])], bonne: 0, explication: BLOCS.map((b) => `${b[0]} : ${b[1]}`).join(" → ") + "." }; } },
      { fiche: "tsi-sumo-mot-chaine", gen: (r) => { const p = r.pick(PARAMS), autres = r.melange([0, 1, 2, 3, 4, 5].filter((j) => j !== p[1])).slice(0, 3);
          return { type: "qcm", enonce: `Modèle multiphysique de la chaîne de puissance d'un moteur : sur quel bloc place-t-on le paramètre <b>${p[0]}</b> ?`,
                   choix: [BLOCS_MOD[p[1]], ...autres.map((j) => BLOCS_MOD[j])], bonne: 0, explication: `Chaque paramètre se place sur le bloc qui le porte physiquement : ${p[0]} → ${BLOCS_MOD[p[1]]}.` }; } },
      { fiche: "tsi-sumo-mot-chaine", gen: (r) => { const l = r.pick(LIENS);
          return { type: "qcm", enonce: `Quelles grandeurs effort / flux caractérisent la puissance transmise <b>${l[0]}</b> ?`,
                   choix: ["U (V) et I (A)", "C (N·m) et ω (rad·s<sup>−1</sup>)", "F (N) et v (m·s<sup>−1</sup>)", "C (N·m) et v (m·s<sup>−1</sup>)"], bonne: l[1],
                   explication: "Électrique : U·I ; rotation : C·ω ; translation : F·v. Chaque produit effort × flux est une puissance en watts ; le passage rotation → translation se fait à la roue." }; } },
      { fiche: "tsi-sumo-mot-chaine", gen: (r) => { const vs = r.pas(0.33, 0.42, 0.001), ec0 = r.pick([3, 5, 7, 9, 12, 15]), vm = +(vs * (1 - ec0 / 100)).toFixed(3), ec = ecart(vm, vs);
          return { enonce: `La simulation du modèle multiphysique donne une vitesse de roue de <b>${nb(vs)} ${S1}</b> ; le tachymètre (moyenne de 5 essais) donne <b>${nb(vm)} ${S1}</b>. Écart relatif simulation / mesure (en %) ?`,
                   reponse: ec, unite: "%", tolerance: 3, explication: `Référence = valeur simulée : écart = |${nb(vm)} − ${nb(vs)}| / ${nb(vs)} × 100 = ${nb(ec, 3)} %.` }; } },
      { fiche: "tsi-sumo-mot-chaine", gen: (r) => { const o = casValidation(r);
          return { type: "qcm", enonce: `Vitesse de roue : écart simulation / mesure de <b>${nb(o.ec)} %</b>. Critère d'acceptation du modèle : <b>${o.crit} %</b>. Dispersion relative des mesures : <b>${o.disp} %</b>. Conclusion ?`,
                   choix: VALID.slice(), bonne: o.cas, explication: `Deux comparaisons distinctes : ${o.expl}` }; } },
      { type: "qcm", fiche: "tsi-sumo-mot-chaine", enonce: "Dans le robot, le pont en H…", choix: ["Distribue l'énergie aux moteurs sur ordre du microcontrôleur", "Convertit l'énergie électrique en énergie mécanique", "Réduit la vitesse de rotation des roues", "Stocke l'énergie pendant le combat"], bonne: 0, explication: "Fonction Distribuer (moduler) : il reçoit des ordres MLI de la chaîne d'information et module la puissance envoyée aux moteurs." },
      // ---- Roue et réducteur ----
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const F = r.pas(3, 6, 0.1), R = r.pick([16, 20, 21, 24, 30]), Fr = F / 2, C = Fr * R;
          return { enonce: `Le robot pousse avec <b>${nb(F)} N</b>, répartis également sur ses deux roues motrices de rayon <b>R = ${R} mm</b>. Couple que doit transmettre chaque roue (en mN·m) ?`,
                   reponse: C, unite: "mN·m", explication: `F<sub>roue</sub> = ${nb(F)}/2 = ${nb(Fr)} N ; C<sub>roue</sub> = F<sub>roue</sub>·R = ${nb(Fr)} × ${nb(R / 1000)} m = ${nb(C / 1000)} N·m = ${nb(C)} mN·m.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const Cr = r.pas(30, 80, 1), i = r.pick([30, 48, 50, 75]), eta = r.pick([0.65, 0.7, 0.72, 0.75, 0.8]), Cm = Cr / (i * eta);
          return { enonce: `Couple à la roue <b>C<sub>roue</sub> = ${Cr} mN·m</b>, réducteur de rapport <b>1/${i}</b>, rendement <b>η<sub>r</sub> = ${nb(eta)}</b>. Couple que doit fournir l'arbre moteur ?`,
                   reponse: Cm, unite: "mN·m", explication: `C<sub>roue</sub> = C<sub>moteur</sub>·i·η<sub>r</sub> ⇒ C<sub>moteur</sub> = ${Cr} / (${i} × ${nb(eta)}) = ${Cr} / ${nb(i * eta)} = ${nb(Cm, 3)} mN·m.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const F = r.pas(3.5, 6, 0.1), R = r.pick([16, 21, 24]), i = r.pick([30, 48, 50]), eta = r.pick([0.7, 0.72, 0.75]); const Cr = (F / 2) * R, Cm = Cr / (i * eta);
          return { enonce: `Poussée totale <b>${nb(F)} N</b> sur deux roues motrices de rayon <b>${R} mm</b> ; réducteur <b>1/${i}</b>, <b>η<sub>r</sub> = ${nb(eta)}</b>. Couple sur l'arbre de chaque moteur (en mN·m) ?`,
                   reponse: Cm, unite: "mN·m", tolerance: 3, explication: `C<sub>roue</sub> = (${nb(F)}/2) × ${R} mm = ${nb(Cr, 3)} mN·m ; C<sub>moteur</sub> = C<sub>roue</sub>/(i·η<sub>r</sub>) = ${nb(Cr, 3)} / ${nb(i * eta)} = ${nb(Cm, 3)} mN·m.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const N = r.pas(6000, 10000, 200), i = r.pick([30, 48, 50]), R = r.pick([16, 21, 24, 30]); const wm = (2 * Math.PI * N) / 60, wr = wm / i, v = (wr * R) / 1000;
          return { enonce: `Moteur à <b>${nb(N)} tr/min</b>, réducteur <b>1/${i}</b>, roues de rayon <b>R = ${R} mm</b>. Vitesse périphérique de la roue ?`,
                   reponse: v, unite: S1, explication: `ω<sub>m</sub> = 2π × ${nb(N)}/60 = ${nb(wm)} rad/s ; ω<sub>r</sub> = ω<sub>m</sub>/${i} = ${nb(wr)} rad/s ; v = ω<sub>r</sub>·R = ${nb(wr)} × ${nb(R / 1000)} = ${nb(v, 3)} ${S1}.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const v = r.pick([0.2, 0.25, 0.3, 0.35, 0.4, 0.5]), i = r.pick([30, 48, 50]), R = r.pick([16, 21, 24, 30]); const wr = v / (R / 1000), wm = wr * i, N = (wm * 60) / (2 * Math.PI);
          return { enonce: `Pour que le robot roule à <b>${nb(v)} ${S1}</b> (roues de rayon ${R} mm, réducteur 1/${i}, sans glissement), à quelle vitesse doit tourner le moteur ?`,
                   reponse: N, unite: "tr/min", explication: `ω<sub>r</sub> = v/R = ${nb(v)} / ${nb(R / 1000)} = ${nb(wr)} rad/s ; ω<sub>m</sub> = i·ω<sub>r</sub> = ${nb(wm)} rad/s ; N = 60·ω<sub>m</sub>/(2π) = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const w = r.pas(400, 1000, 5), N = (w * 60) / (2 * Math.PI);
          return { enonce: `Le modèle donne une vitesse moteur <b>ω<sub>m</sub> = ${w} rad/s</b>. Convertis-la en tr/min.`,
                   reponse: N, unite: "tr/min", explication: `N = 60·ω / (2π) = 60 × ${w} / (2π) = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-sumo-mot-transmission", gen: (r) => { const i = r.pick([20, 30, 48, 50, 75]), Nr = Math.round(r.pas(6000, 11000, 100) / i), Nm = Nr * i;
          return { enonce: `Au tachymètre : moteur à <b>${nb(Nm)} tr/min</b>, roue à <b>${Nr} tr/min</b>. Rapport de réduction 1/i : que vaut i ?`,
                   reponse: i, unite: "", explication: `i = N<sub>moteur</sub>/N<sub>roue</sub> = ${nb(Nm)}/${Nr} = ${i} : le réducteur divise la vitesse par ${i} et multiplie le couple par ${i}·η<sub>r</sub>.` }; } },
      { type: "qcm", fiche: "tsi-sumo-mot-transmission", enonce: "On connaît le couple à la roue et on cherche le couple moteur (réducteur de rapport 1/i, rendement η<sub>r</sub>). On…", choix: ["Divise par i·η<sub>r</sub>", "Multiplie par i·η<sub>r</sub>", "Divise par i et multiplie par η<sub>r</sub>", "Divise par η<sub>r</sub> seulement"], bonne: 0, explication: "C<sub>roue</sub> = C<sub>moteur</sub>·i·η<sub>r</sub> : en remontant vers le moteur, il faut fournir plus, le rendement passe au dénominateur." },
      // ---- Moteur à courant continu ----
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const Cm = r.pas(0.8, 2.5, 0.05), k = r.pick([4.5, 5, 6, 7]), I0 = r.pick([0.05, 0.06, 0.08, 0.1]); const Iu = Cm / k, I = Iu + I0;
          return { enonce: `Un moteur doit fournir <b>C = ${nb(Cm)} mN·m</b>. Constante de couple <b>k = ${nb(k)} × 10<sup>−3</sup> N·m·A<sup>−1</sup></b>, courant à vide <b>I<sub>0</sub> = ${nb(I0)} A</b>. Courant absorbé par ce moteur ?`,
                   reponse: I, unite: "A", explication: `I<sub>utile</sub> = C/k = ${nb(Cm)} / ${nb(k)} = ${nb(Iu, 3)} A ; I = I<sub>utile</sub> + I<sub>0</sub> = ${nb(Iu, 3)} + ${nb(I0)} = ${nb(I, 3)} A.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.5, 4.8, 6, 7.2]), Ri = r.pick([2.2, 2.5, 2.8, 3.2, 3.5]), I = U / Ri;
          return { enonce: `Roues calées (adhérence supposée infinie) : moteur sous <b>U = ${nb(U)} V</b>, résistance d'induit <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>. Courant de calage ?`,
                   reponse: I, unite: "A", explication: `Rotor bloqué : ω = 0 donc E = k·ω = 0 ; U = R<sub>i</sub>·I ⇒ I = ${nb(U)} / ${nb(Ri)} = ${nb(I, 3)} A.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), Ri = r.pick([2.5, 2.8, 3.2]), k = r.pick([5, 6, 7]), i = r.pick([30, 48, 50]), eta = r.pick([0.7, 0.72, 0.75]), R = r.pick([16, 21, 24]); const I = U / Ri, Cc = (k / 1000) * I, Cr = Cc * i * eta, F = Cr / (R / 1000);
          return { enonce: `Rotor bloqué, adhérence supposée infinie : <b>U = ${nb(U)} V</b>, <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>, <b>k = ${nb(k)} × 10<sup>−3</sup> N·m·A<sup>−1</sup></b>, réducteur <b>1/${i}</b> (η<sub>r</sub> = ${nb(eta)}), roue <b>R = ${R} mm</b>. Effort que pourrait développer une roue ?`,
                   reponse: F, unite: "N", tolerance: 3, explication: `I = U/R<sub>i</sub> = ${nb(I, 3)} A ; C = k·I = ${nb(Cc * 1000, 3)} mN·m ; C<sub>roue</sub> = C·i·η<sub>r</sub> = ${nb(Cr, 3)} N·m ; F = C<sub>roue</sub>/R = ${nb(F, 3)} N — très au-dessus de ce que l'adhérence autorise.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.5, 4.8, 6, 7.2]), Ri = r.pick([2.2, 2.5, 2.8, 3.2]), I = r.pas(0.2, 0.6, 0.01), E = U - Ri * I;
          return { enonce: `Moteur alimenté sous <b>U = ${nb(U)} V</b>, résistance d'induit <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>, courant absorbé <b>I = ${nb(I)} A</b>. Force électromotrice E ?`,
                   reponse: E, unite: "V", explication: `U = E + R<sub>i</sub>·I ⇒ E = ${nb(U)} − ${nb(Ri)} × ${nb(I)} = ${nb(E, 3)} V.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), Ri = r.pick([2.5, 2.8, 3.2]), I = r.pas(0.2, 0.5, 0.01), k = r.pick([5, 6, 7]); const E = U - Ri * I, w = E / (k / 1000);
          return { enonce: `Moteur : <b>U = ${nb(U)} V</b>, <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>, <b>I = ${nb(I)} A</b>, <b>k = ${nb(k)} × 10<sup>−3</sup> V·s·rad<sup>−1</sup></b>. Vitesse de rotation ω<sub>m</sub> du moteur ?`,
                   reponse: w, unite: "rad/s", explication: `E = U − R<sub>i</sub>·I = ${nb(E, 3)} V ; ω<sub>m</sub> = E/k = ${nb(E, 3)} / ${nb(k / 1000)} = ${nb(w, 3)} rad/s.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), Ri = r.pick([2.5, 2.8, 3.2]), I = r.pas(0.25, 0.45, 0.01), k = r.pick([5, 6, 7]), i = r.pick([30, 48, 50]), R = r.pick([16, 21, 24]); const E = U - Ri * I, wm = E / (k / 1000), wr = wm / i, v = (wr * R) / 1000;
          return { enonce: `<b>U = ${nb(U)} V</b>, <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>, <b>I = ${nb(I)} A</b>, <b>k = ${nb(k)} × 10<sup>−3</sup> V·s·rad<sup>−1</sup></b>, réducteur <b>1/${i}</b>, roue <b>R = ${R} mm</b>. Vitesse périphérique de la roue ?`,
                   reponse: v, unite: S1, tolerance: 3, explication: `E = ${nb(E, 3)} V ; ω<sub>m</sub> = E/k = ${nb(wm, 3)} rad/s ; ω<sub>r</sub> = ω<sub>m</sub>/${i} = ${nb(wr, 3)} rad/s ; v = ω<sub>r</sub>·R = ${nb(v, 3)} ${S1}.` }; } },
      { fiche: "tsi-sumo-mot-mcc", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), Ri = r.pick([2.5, 2.8, 3.2]), I0 = r.pick([0.06, 0.08, 0.1]), k0 = r.pick([5, 5.5, 6, 6.5, 7]) / 1000; const E = U - Ri * I0, N0 = Math.round((E / k0) * 60 / (2 * Math.PI) / 10) * 10, w0 = (N0 * 2 * Math.PI) / 60, k = E / w0;
          return { enonce: `Essai à vide d'un moteur : <b>U = ${nb(U)} V</b>, <b>I<sub>0</sub> = ${nb(I0)} A</b>, <b>${nb(N0)} tr/min</b>, <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>. Constante de f.é.m. k ? (en × 10<sup>−3</sup> V·s·rad<sup>−1</sup>)`,
                   reponse: k * 1000, unite: "× 10<sup>−3</sup> V·s·rad<sup>−1</sup>", explication: `E = U − R<sub>i</sub>·I<sub>0</sub> = ${nb(E, 3)} V ; ω = 2π × ${nb(N0)}/60 = ${nb(w0)} rad/s ; k = E/ω = ${nb(k * 1000, 3)} × 10<sup>−3</sup> V·s·rad<sup>−1</sup>.` }; } },
      { type: "qcm", fiche: "tsi-sumo-mot-mcc", enonce: "À rotor bloqué, pourquoi le courant n'est-il limité que par la résistance d'induit ?", choix: ["ω = 0 donc E = k·ω = 0 : U = R<sub>i</sub>·I", "Parce que k devient nul", "Parce que le courant à vide s'annule", "Parce que le réducteur bloque le courant"], bonne: 0, explication: "Sans rotation, pas de f.é.m. : toute la tension est aux bornes de R<sub>i</sub> (6,0/2,8 = 2,14 A pour le TSI-SUMO)." },
      { type: "qcm", fiche: "tsi-sumo-mot-mcc", enonce: "Moteurs : 42,3 N de poussée possible au calage ; adhérence : 4,54 N. Quel élément limite réellement la poussée du robot ?", choix: ["Le contact roue-sol (adhérence)", "Les moteurs", "Le réducteur", "La batterie"], bonne: 0, explication: "Rapport 9,3 : remplacer les moteurs n'apporterait rien, les roues patineraient. Il faut agir sur µ ou sur N." },
      { type: "qcm", fiche: "tsi-sumo-mot-mcc", enonce: "Un moteur doit fournir le couple C ; constante de couple k, courant à vide I<sub>0</sub>. Courant absorbé ?", choix: ["I = C/k + I<sub>0</sub>", "I = C/k − I<sub>0</sub>", "I = C·k + I<sub>0</sub>", "I = (C + I<sub>0</sub>)/k"], bonne: 0, explication: "C/k est le courant « utile » ; le courant à vide (frottements, pertes fer) s'y ajoute." },
      // ---- Puissances, rendement, pertes ----
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), I = r.pas(0.2, 0.6, 0.01), P = 2 * U * I;
          return { enonce: `Chacun des deux moteurs absorbe <b>I = ${nb(I)} A</b> sous <b>U = ${nb(U)} V</b>. Puissance électrique absorbée par l'ensemble des deux moteurs ?`,
                   reponse: P, unite: "W", explication: `P<sub>élec</sub> = 2 × U × I = 2 × ${nb(U)} × ${nb(I)} = ${nb(P)} W (ne pas oublier le facteur 2).` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const F = r.pas(3, 6, 0.02), v = r.pick([0.2, 0.25, 0.3, 0.35, 0.4]), P = F * v;
          return { enonce: `Le robot avance à <b>${nb(v)} ${S1}</b> en poussant l'adversaire avec <b>${nb(F)} N</b>. Puissance utile ?`,
                   reponse: P, unite: "W", explication: `P<sub>utile</sub> = F × v = ${nb(F)} × ${nb(v)} = ${nb(P)} W (force × vitesse de translation du robot).` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const F = r.pas(3.5, 5, 0.02), v = r.pick([0.25, 0.3, 0.35]), U = 6, I = r.pas(0.28, 0.4, 0.01); const Pu = F * v, Pe = 2 * U * I, eta = (Pu / Pe) * 100;
          return { enonce: `Le robot pousse avec <b>${nb(F)} N</b> à <b>${nb(v)} ${S1}</b> ; chaque moteur absorbe <b>${nb(I)} A</b> sous <b>6,0 V</b>. Rendement global de la chaîne de puissance (en %) ?`,
                   reponse: eta, unite: "%", explication: `P<sub>utile</sub> = ${nb(F)} × ${nb(v)} = ${nb(Pu, 3)} W ; P<sub>élec</sub> = 2 × 6,0 × ${nb(I)} = ${nb(Pe, 3)} W ; η = ${nb(Pu, 3)} / ${nb(Pe, 3)} = ${nb(eta, 3)} %.` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const Ri = r.pick([2.2, 2.5, 2.8, 3.2]), I = r.pas(0.2, 0.6, 0.01), P = 2 * Ri * I * I;
          return { enonce: `Chaque moteur (résistance d'induit <b>R<sub>i</sub> = ${nb(Ri)} Ω</b>) absorbe <b>${nb(I)} A</b>. Pertes par effet Joule dans les induits des deux moteurs ?`,
                   reponse: P, unite: "W", explication: `P<sub>J</sub> = 2 × R<sub>i</sub>·I² = 2 × ${nb(Ri)} × ${nb(I)}² = ${nb(P, 3)} W, dissipés en chaleur.` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const C = r.pas(1, 2, 0.05), w = r.pas(600, 900, 10), eta = r.pick([0.65, 0.7, 0.72, 0.75, 0.8]); const Pin = (C / 1000) * w, Pp = Pin * (1 - eta);
          return { enonce: `L'arbre moteur fournit <b>${nb(C)} mN·m</b> à <b>${w} rad/s</b> au réducteur (η<sub>r</sub> = ${nb(eta)}). Puissance perdue dans le réducteur ?`,
                   reponse: Pp, unite: "W", explication: `P<sub>entrée</sub> = C·ω = ${nb(C / 1000)} × ${w} = ${nb(Pin, 3)} W ; pertes = (1 − η<sub>r</sub>)·P<sub>entrée</sub> = ${nb(1 - eta)} × ${nb(Pin, 3)} = ${nb(Pp, 3)} W (frottement des dentures → chaleur).` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const F = r.pas(3.5, 5, 0.02), vr = r.pas(0.33, 0.42, 0.001), vb = r.pas(0.25, 0.32, 0.01), P = F * (vr - vb);
          return { enonce: `La roue tourne à la vitesse périphérique <b>${nb(vr)} ${S1}</b>, le robot avance à <b>${nb(vb)} ${S1}</b> en poussant avec <b>${nb(F)} N</b>. Puissance perdue au contact roue-sol ?`,
                   reponse: P, unite: "W", explication: `Vitesse de glissement Δv = ${nb(vr)} − ${nb(vb)} = ${nb(vr - vb)} ${S1} ; P<sub>perdue</sub> = F·Δv = ${nb(F)} × ${nb(vr - vb)} = ${nb(P, 3)} W.` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const vr = r.pas(0.33, 0.42, 0.001), vb = r.pas(0.25, 0.32, 0.01), eta = (vb / vr) * 100;
          return { enonce: `Vitesse périphérique des roues <b>${nb(vr)} ${S1}</b>, vitesse du robot <b>${nb(vb)} ${S1}</b>. Rendement du contact roue-sol (en %) ?`,
                   reponse: eta, unite: "%", explication: `L'effort est le même des deux côtés du contact : η<sub>contact</sub> = v<sub>robot</sub>/v<sub>roue</sub> = ${nb(vb)} / ${nb(vr)} = ${nb(eta, 3)} % (taux de glissement ${nb(100 - eta, 2)} %).` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const em = r.pick([0.55, 0.6, 0.65, 0.7, 0.75]), er = r.pick([0.65, 0.72, 0.8]), ec = r.pick([0.75, 0.8, 0.85, 0.9]), eg = em * er * ec * 100;
          return { enonce: `Rendements : moteur <b>${nb(em)}</b>, réducteur <b>${nb(er)}</b>, contact roue-sol <b>${nb(ec)}</b>. Rendement global de la chaîne (en %) ?`,
                   reponse: eg, unite: "%", explication: `Étages en série : η = η<sub>m</sub> × η<sub>r</sub> × η<sub>c</sub> = ${nb(em)} × ${nb(er)} × ${nb(ec)} = ${nb(eg, 3)} %.` }; } },
      { fiche: "tsi-sumo-mot-rendement", gen: (r) => { const x = r.pick(PERTES);
          return { type: "qcm", enonce: `Chaîne de puissance du robot : à quel poste correspondent les pertes <b>${x[0]}</b> ?`,
                   choix: ["Effet Joule dans les induits", "Pertes mécaniques du réducteur", "Pertes au contact roue-sol", "Pertes à vide du moteur (frottements, pertes fer)"], bonne: x[1],
                   explication: "Joule : R<sub>i</sub>·I² ; réducteur : (1 − η<sub>r</sub>), dentures ; contact : glissement, usure de la gomme ; à vide : traduites par I<sub>0</sub>. Toutes finissent en chaleur." }; } },
      { type: "qcm", fiche: "tsi-sumo-mot-rendement", enonce: "La roue tourne à 0,374 m·s<sup>−1</sup> en périphérie, le robot avance à 0,300 m·s<sup>−1</sup> en poussant 4,54 N. Le rendement du contact vaut…", choix: ["v<sub>robot</sub>/v<sub>roue</sub> ≈ 80 %, car l'effort est le même des deux côtés du contact", "F<sub>robot</sub>/F<sub>roue</sub> = 100 %", "v<sub>roue</sub>/v<sub>robot</sub> ≈ 125 %", "0 %, car la roue glisse"], bonne: 0, explication: "P = F·v de chaque côté avec le même F : le rapport des puissances est le rapport des vitesses (0,300/0,374 = 0,80)." },
      // ---- Énergie et autonomie ----
      { fiche: "tsi-sumo-mot-energie", gen: (r) => { const U = r.pick([4.8, 6, 7.2]), Q = r.pick([1300, 1600, 2000, 2200, 2500]), E = (U * Q) / 1000;
          return { enonce: `Pack NiMH : <b>${nb(U)} V – ${nb(Q)} mA·h</b>. Énergie stockée (en W·h) ?`,
                   reponse: E, unite: "W·h", explication: `E = U × Q = ${nb(U)} V × ${nb(Q / 1000)} A·h = ${nb(E)} W·h.` }; } },
      { fiche: "tsi-sumo-mot-energie", gen: (r) => { const Q = r.pick([1300, 1600, 2000, 2200, 2500]), I = r.pick([0.6, 0.8, 1, 1.2, 1.5]), t = (Q / 1000 / I) * 60;
          return { enonce: `Batterie de <b>${nb(Q)} mA·h</b> ; courant moyen absorbé par le robot (moteurs + électronique) <b>${nb(I)} A</b>. Autonomie estimée (en min) ?`,
                   reponse: t, unite: "min", explication: `t = Q / I = ${nb(Q / 1000)} A·h / ${nb(I)} A = ${nb(Q / 1000 / I, 3)} h = ${nb(t, 3)} min.` }; } },
      { fiche: "tsi-sumo-mot-energie", gen: (r) => { const P = r.pick([3.72, 4.5, 5, 6, 7.5]), t = r.pick([1, 2, 3]), E = P * t * 60;
          return { enonce: `Pendant un combat de <b>${t} min</b>, les moteurs absorbent en moyenne <b>${nb(P)} W</b>. Énergie consommée (en J) ?`,
                   reponse: E, unite: "J", explication: `E = P × t = ${nb(P)} × ${t * 60} s = ${nb(E)} J.` }; } },
      { fiche: "tsi-sumo-mot-energie", gen: (r) => { const E = r.pick([6.24, 7.2, 9.6, 12, 13.2, 15]), kJ = E * 3.6;
          return { enonce: `Une batterie stocke <b>${nb(E)} W·h</b>. Exprime cette énergie en kJ.`,
                   reponse: kJ, unite: "kJ", explication: `1 W·h = 3 600 J : E = ${nb(E)} × 3 600 = ${nb(E * 3600)} J = ${nb(kJ)} kJ.` }; } },
      { type: "qcm", fiche: "tsi-sumo-mot-energie", enonce: "Sur le pack : « 6,0 V – 2 000 mA·h ». La valeur 2 000 mA·h est…", choix: ["Une charge électrique (capacité) : l'énergie vaut U × Q = 12 W·h", "L'énergie stockée", "La puissance maximale", "Le courant maximal"], bonne: 0, explication: "mA·h = courant × durée : c'est une quantité d'électricité. Pour l'énergie, on multiplie par la tension." }
    ],
    fiches: [
      { id: "tsi-sumo-mot-chaine", titre: "Chaîne de puissance du robot",
        recto: "Quels sont les blocs de la chaîne de puissance du robot sumo, et quelles grandeurs effort / flux circulent entre eux ?",
        verso: `<div class="formule">puissance = effort × flux</div><ul><li><b>Alimenter</b> : pack NiMH 6 V — U, I</li><li><b>Distribuer</b> : pont en H — U, I</li><li><b>Convertir</b> : moteur CC (R<sub>i</sub>, k) — C, ω</li><li><b>Transmettre</b> : réducteur 1/48 (i, η<sub>r</sub>) — C, ω</li><li><b>Agir</b> : roue (R) — F, v</li></ul><p class="astuce">Rotation → translation à la roue. Modèle validé si |mesure − simulation| / simulation &lt; critère.</p>`,
        quiz: [{ enonce: "Le pont en H réalise la fonction…", choix: ["Distribuer", "Convertir", "Transmettre"], bonne: 0 },
               { enonce: "Grandeurs effort / flux en sortie du réducteur :", choix: ["C (N·m) et ω (rad/s)", "U (V) et I (A)", "F (N) et v (m/s)"], bonne: 0 },
               { enonce: "Le rayon de roue R se place sur le bloc…", choix: ["Roue (rotation → translation)", "Machine à courant continu", "Source de tension"], bonne: 0 }] },
      { id: "tsi-sumo-mot-transmission", titre: "Roue et réducteur : couple et vitesse",
        recto: "Comment passe-t-on de la force à la roue au couple moteur, et de la vitesse du moteur à la vitesse du robot ?",
        verso: `<div class="formule">C<sub>roue</sub> = F<sub>roue</sub> × R &nbsp;·&nbsp; v = ω<sub>r</sub> × R</div><div class="formule">C<sub>roue</sub> = C<sub>moteur</sub> × i × η<sub>r</sub> &nbsp;·&nbsp; ω<sub>r</sub> = ω<sub>m</sub> / i</div><ul><li>Rapport 1/48 : i = 48. R en mètres.</li><li>ω (rad/s) = 2π·N (tr/min) / 60</li></ul><p class="astuce">En remontant vers le moteur, η<sub>r</sub> passe au dénominateur.</p>`,
        quiz: [{ enonce: "C<sub>roue</sub> = 48 mN·m, i = 48, η<sub>r</sub> = 0,72 : C<sub>moteur</sub> ≈ …", choix: ["1,39 mN·m", "0,72 mN·m", "1 659 mN·m"], bonne: 0 },
               { enonce: "Le réducteur divise par i…", choix: ["La vitesse de rotation", "Le couple", "La puissance"], bonne: 0 },
               { enonce: "F<sub>roue</sub> = 2 N, R = 21 mm : C<sub>roue</sub> = …", choix: ["0,042 N·m", "42 N·m", "95 N·m"], bonne: 0 }] },
      { id: "tsi-sumo-mot-mcc", titre: "Modèle du moteur à courant continu",
        recto: "Quelles sont les équations du moteur à courant continu, et que devient le courant à rotor bloqué ?",
        verso: `<div class="formule">C = k·I<sub>utile</sub> &nbsp;·&nbsp; E = k·ω<sub>m</sub> &nbsp;·&nbsp; U = E + R<sub>i</sub>·I</div><ul><li>I = C/k + I<sub>0</sub> : le courant à vide s'<b>ajoute</b>.</li><li>k en N·m/A = V·s/rad.</li><li>Rotor bloqué : ω = 0, E = 0 → I = U/R<sub>i</sub>.</li></ul><p class="astuce">TSI-SUMO : les moteurs pourraient pousser 42 N, l'adhérence n'en permet que 4,5 N : le moteur n'est pas le facteur limitant.</p>`,
        quiz: [{ enonce: "Rotor bloqué : I = …", choix: ["U / R<sub>i</sub>", "0", "U / k"], bonne: 0 },
               { enonce: "Le courant à vide I<sub>0</sub>…", choix: ["S'ajoute à C/k", "Se retranche de C/k", "Est toujours négligé"], bonne: 0 },
               { enonce: "E = k·ω : si ω = 0, alors…", choix: ["E = 0", "E = U", "I = 0"], bonne: 0 }] },
      { id: "tsi-sumo-mot-rendement", titre: "Puissances, rendement et pertes",
        recto: "Comment calcule-t-on le rendement global de la chaîne de puissance, et où part l'énergie perdue ?",
        verso: `<div class="formule">P<sub>élec</sub> = 2·U·I &nbsp;·&nbsp; P<sub>utile</sub> = F·v<sub>robot</sub> &nbsp;·&nbsp; η = P<sub>utile</sub> / P<sub>élec</sub></div><ul><li>Joule (induits) : 2·R<sub>i</sub>·I²</li><li>Réducteur : (1 − η<sub>r</sub>) × puissance transmise</li><li>Contact : F·(v<sub>roue</sub> − v<sub>robot</sub>) ; η<sub>contact</sub> = v<sub>robot</sub>/v<sub>roue</sub></li></ul><p class="astuce">Étages en série : η<sub>global</sub> = produit des rendements, toujours &lt; 1.</p>`,
        quiz: [{ enonce: "P<sub>utile</sub> = 1,36 W, P<sub>élec</sub> = 3,72 W : η ≈ …", choix: ["37 %", "273 %", "63 %"], bonne: 0 },
               { enonce: "Rendement du contact roue-sol :", choix: ["v<sub>robot</sub> / v<sub>roue</sub>", "F<sub>robot</sub> / F<sub>roue</sub>", "v<sub>roue</sub> / v<sub>robot</sub>"], bonne: 0 },
               { enonce: "Les pertes Joule d'un induit valent…", choix: ["R<sub>i</sub>·I²", "R<sub>i</sub>·I", "U·I"], bonne: 0 }] },
      { id: "tsi-sumo-mot-energie", titre: "Énergie de la batterie et autonomie",
        recto: "Comment estime-t-on l'énergie stockée dans la batterie et l'autonomie du robot ?",
        verso: `<div class="formule">E (W·h) = U × Q (A·h) &nbsp;·&nbsp; t = Q / I<sub>moyen</sub></div><ul><li>2 000 mA·h = 2 A·h ; 1 W·h = 3 600 J.</li><li>Énergie consommée : E = P × t (J = W × s).</li></ul><p class="astuce">La capacité en mA·h est une <b>charge</b>, pas une énergie : il faut la multiplier par la tension.</p>`,
        quiz: [{ enonce: "6 V et 2 000 mA·h : énergie stockée ≈ …", choix: ["12 W·h", "12 000 W·h", "333 W·h"], bonne: 0 },
               { enonce: "2 A·h consommés à 0,5 A : autonomie ≈ …", choix: ["4 h", "1 h", "0,25 h"], bonne: 0 },
               { enonce: "1 W·h = …", choix: ["3 600 J", "60 J", "1 000 J"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     MODULE C — Le démarrage : dynamique du robot (N11)
     ===================================================================== */
  SIP.definirModule({
    id: "tsi-sumo-demarrage",
    niveaux: ["TSI"],
    sequence: SEQ,
    titre: "Démarrage et freinage : dynamique du robot",
    description: "PFD en translation, accélération maximale sans patinage, équations horaires, inertie des roues et transfert de charge.",
    competences: ["M14", "M15", "M1", "A13"],
    nbQuestions: 10,
    questions: [
      // ---- PFD : accélération maximale ----
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(0.8, 1, 0.01), mu = r.pick([0.6, 0.7, 0.78, 0.8, 0.9]), Nr = Math.round(r.pas(0.55, 0.7, 0.01) * m * g * 100) / 100, a = (mu * Nr) / m;
          return { enonce: `Robot de <b>${nb(m)} kg</b> ; effort normal sur les roues motrices <b>N<sub>r</sub> = ${nb(Nr)} N</b> ; <b>µ = ${nb(mu)}</b>. Accélération maximale au démarrage sans patinage (résistances négligées) ?`,
                   reponse: a, unite: S2, explication: `PFD : T = m·a avec T ≤ µ·N<sub>r</sub> ⇒ a<sub>max</sub> = µ·N<sub>r</sub>/m = ${nb(mu)} × ${nb(Nr)} / ${nb(m)} = ${nb(a, 3)} ${S2}.` }; } },
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(0.8, 1, 0.01), e = r.pick([100, 110, 120, 130]), d = r.pas(20, 55, 5), mu = r.pick([0.6, 0.7, 0.78, 0.8, 0.9]), a = (mu * g * (e - d)) / e;
          return { enonce: `Robot de <b>${nb(m)} kg</b>, <b>e = ${e} mm</b>, G à <b>d = ${d} mm</b> en avant de l'axe des roues motrices, <b>µ = ${nb(mu)}</b>. Accélération maximale sans patinage ?`,
                   reponse: a, unite: S2, explication: `N<sub>r</sub> = m·g·(e − d)/e ⇒ a<sub>max</sub> = µ·N<sub>r</sub>/m = µ·g·(e − d)/e = ${nb(mu)} × 9,81 × ${e - d}/${e} = ${nb(a, 3)} ${S2} : la masse se simplifie.` }; } },
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(0.8, 1, 0.01), a = r.pick([1, 1.5, 2, 2.5, 3, 4]), T = m * a;
          return { enonce: `Quel effort tangentiel total le sol doit-il exercer sur les roues motrices d'un robot de <b>${nb(m)} kg</b> pour qu'il accélère à <b>${nb(a)} ${S2}</b> (résistances négligées) ?`,
                   reponse: T, unite: "N", explication: `PFD en projection sur l'axe du déplacement : T = m·a = ${nb(m)} × ${nb(a)} = ${nb(T)} N.` }; } },
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(0.8, 1, 0.01), T = r.pas(3.5, 5, 0.02), f = r.pick([0.2, 0.3, 0.4, 0.5]), a = (T - f) / m;
          return { enonce: `Démarrage : effort tangentiel du sol sur les roues motrices <b>T = ${nb(T)} N</b>, résistances au roulement <b>f = ${nb(f)} N</b>, masse <b>${nb(m)} kg</b>. Accélération du robot ?`,
                   reponse: a, unite: S2, explication: `T − f = m·a ⇒ a = (${nb(T)} − ${nb(f)}) / ${nb(m)} = ${nb(a, 3)} ${S2}.` }; } },
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(0.8, 1, 0.01), a = r.pick([4, 5, 5.5, 6]), mu = r.pick([0.7, 0.78, 0.8, 0.9]), N = (m * a) / mu;
          return { enonce: `On veut <b>${nb(a)} ${S2}</b> au démarrage, sans patinage, pour un robot de <b>${nb(m)} kg</b> avec <b>µ = ${nb(mu)}</b>. Effort normal minimal sur les roues motrices ?`,
                   reponse: N, unite: "N", explication: `m·a ≤ µ·N<sub>r</sub> ⇒ N<sub>r</sub> ≥ m·a/µ = ${nb(m)} × ${nb(a)} / ${nb(mu)} = ${nb(N, 3)} N.` }; } },
      { fiche: "tsi-sumo-dem-pfd", gen: (r) => { const m = r.pas(80, 110, 5), e = r.pas(800, 900, 10), d = r.pas(380, 460, 10), mu = r.pick([0.7, 0.75, 0.8, 0.85, 0.9]); const P = m * g, N = (P * (e - d)) / e, T = mu * N, a = T / m;
          return { enonce: `Trottinette électrique : <b>${m} kg</b> en charge, empattement <b>${e} mm</b>, G à <b>${d} mm</b> en avant de l'axe de la roue arrière (seule motrice), <b>µ = ${nb(mu)}</b>. Accélération maximale sans patinage ?`,
                   reponse: a, unite: S2, explication: `P = ${nb(P)} N ; N<sub>ar</sub> = P·(e − d)/e = ${nb(N)} N ; T = µ·N<sub>ar</sub> = ${nb(T)} N ; a = T/m = ${nb(a, 3)} ${S2}. Même raisonnement que le robot sumo.` }; } },
      { type: "qcm", fiche: "tsi-sumo-dem-pfd", enonce: "Au démarrage, quelle action mécanique extérieure met le robot en mouvement ?", choix: ["L'action tangentielle du sol sur les roues motrices", "La force du moteur", "Le couple de sortie du réducteur", "Le poids du robot"], bonne: 0, explication: "Le moteur est intérieur au système isolé : c'est le sol qui pousse les roues vers l'avant (T − f = m·a)." },
      { type: "qcm", fiche: "tsi-sumo-dem-pfd", enonce: "Un constructeur affirme : « en doublant la puissance du moteur, l'accélération au démarrage sur route mouillée double ». Que répondre ?", choix: ["C'est faux : a ≤ µ·N/m ne dépend pas de la puissance quand l'adhérence limite", "C'est vrai : a est proportionnelle à la puissance", "C'est vrai si la masse ne change pas", "C'est faux : l'accélération serait divisée par deux"], bonne: 0, explication: "Au plafond d'adhérence, doubler la puissance double seulement le patinage. L'affirmation ne serait vraie que si la motorisation limitait." },
      { type: "qcm", fiche: "tsi-sumo-dem-pfd", enonce: "On ajoute du lest exactement au centre de gravité (d inchangé). L'accélération maximale sans patinage…", choix: ["Ne change pas : a<sub>max</sub> = µ·g·(e − d)/e", "Augmente, car N<sub>r</sub> augmente", "Diminue, car le robot est plus lourd", "Double si la masse double"], bonne: 0, explication: "N<sub>r</sub> et m augmentent dans la même proportion : la masse se simplifie." },
      // ---- Démarrage et arrêt uniformément variés ----
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const a = r.pick([2.5, 3, 3.5, 4, 4.5, 4.78, 5, 5.5]), v = r.pick([0.25, 0.3, 0.35, 0.4, 0.5]), t = (v / a) * 1000;
          return { enonce: `Départ arrêté, accélération constante <b>a = ${nb(a)} ${S2}</b>. Durée pour atteindre <b>${nb(v)} ${S1}</b> (en ms) ?`,
                   reponse: t, unite: "ms", explication: `v = a·t ⇒ t = v/a = ${nb(v)} / ${nb(a)} = ${nb(t / 1000, 3)} s = ${nb(t, 3)} ms.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const a = r.pick([2.5, 3, 3.5, 4, 4.5, 4.78, 5, 5.5]), v = r.pick([0.25, 0.3, 0.35, 0.4, 0.5]), x = ((v * v) / (2 * a)) * 1000;
          return { enonce: `Départ arrêté, accélération constante <b>a = ${nb(a)} ${S2}</b>. Distance parcourue pour atteindre <b>${nb(v)} ${S1}</b> (en mm) ?`,
                   reponse: x, unite: "mm", explication: `v² = 2·a·x ⇒ x = v²/(2a) = ${nb(v)}² / (2 × ${nb(a)}) = ${nb(x / 1000, 3)} m = ${nb(x, 3)} mm.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const a = r.pick([2, 3, 4, 4.78, 5]), t = r.pick([20, 30, 40, 50, 60, 80]), v = (a * t) / 1000;
          return { enonce: `Départ arrêté, <b>a = ${nb(a)} ${S2}</b>. Vitesse atteinte au bout de <b>${t} ms</b> ?`,
                   reponse: v, unite: S1, explication: `v = a·t = ${nb(a)} × ${nb(t / 1000)} = ${nb(v, 3)} ${S1}.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const a = r.pick([2, 3, 4, 4.78, 5]), t = r.pick([20, 30, 40, 50, 60, 80]), x = 0.5 * a * (t / 1000) ** 2 * 1000;
          return { enonce: `Départ arrêté, <b>a = ${nb(a)} ${S2}</b>. Distance parcourue en <b>${t} ms</b> (en mm) ?`,
                   reponse: x, unite: "mm", explication: `x = ½·a·t² = 0,5 × ${nb(a)} × ${nb(t / 1000)}² = ${nb(x / 1000, 3)} m = ${nb(x, 3)} mm.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const m = r.pas(0.85, 1, 0.01), mu = r.pick([0.6, 0.7, 0.78, 0.85]), Nr = Math.round(0.625 * m * g * 100) / 100, v = r.pick([0.25, 0.3, 0.35, 0.4]); const a = (mu * Nr) / m, x = ((v * v) / (2 * a)) * 1000;
          return { enonce: `Freinage roues motrices bloquées : <b>m = ${nb(m)} kg</b>, <b>N<sub>r</sub> = ${nb(Nr)} N</b>, <b>µ = ${nb(mu)}</b>, robot lancé à <b>${nb(v)} ${S1}</b>. Distance de freinage (en mm) ?`,
                   reponse: x, unite: "mm", explication: `Décélération limitée par l'adhérence : a = µ·N<sub>r</sub>/m = ${nb(a, 3)} ${S2} ; x = v²/(2a) = ${nb(v)}² / (2 × ${nb(a, 3)}) = ${nb(x, 3)} mm.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const v = r.pick([0.25, 0.3, 0.35, 0.4]), x = r.pick([10, 12, 15, 20, 25]), a = (v * v) / (2 * (x / 1000));
          return { enonce: `Le robot doit atteindre <b>${nb(v)} ${S1}</b> en <b>${x} mm</b> depuis l'arrêt. Accélération constante minimale ?`,
                   reponse: a, unite: S2, explication: `v² = 2·a·x ⇒ a = v²/(2x) = ${nb(v)}² / (2 × ${nb(x / 1000)}) = ${nb(a, 3)} ${S2}.` }; } },
      { fiche: "tsi-sumo-dem-horaires", gen: (r) => { const acc = r.int(0, 1) === 1; let val, ok, crit, unite;
          if (acc) { val = r.pick([0.6, 0.8, 0.9, 1.2, 2.1, 3.5, 4.78, 6]); crit = `accélération au démarrage ≥ 1,0 ${S2}`; unite = S2; ok = val >= 1; }
          else { val = r.pick([0.22, 0.26, 0.28, 0.31, 0.34, 0.37, 0.45]); crit = `vitesse de translation ≥ 0,30 ${S1}`; unite = S1; ok = val >= 0.3; }
          return { type: "qcm", enonce: `Le calcul donne <b>${nb(val)} ${unite}</b>. Critère de l'exigence Ex5 « Se déplacer » : ${crit}. Conclusion ?`,
                   choix: ["Ex5 satisfaite sur ce critère", "Ex5 non satisfaite sur ce critère", "Ex1 satisfaite : le robot pousse assez fort", "On ne peut pas conclure sans connaître la puissance du moteur"], bonne: ok ? 0 : 1,
                   explication: `${nb(val)} ${ok ? "≥" : "&lt;"} ${acc ? "1,0" : "0,30"} : l'exigence Ex5 ${ok ? "est" : "n'est pas"} satisfaite sur ce critère. On nomme l'exigence et on compare au niveau.` }; } },
      { type: "qcm", fiche: "tsi-sumo-dem-horaires", enonce: "Le robot freine en bloquant ses roues motrices. Sa décélération maximale est limitée par…", choix: ["L'adhérence : a = µ·N<sub>r</sub>/m, comme au démarrage", "Le couple de freinage du moteur uniquement", "Le rendement du réducteur", "Rien : bloquer les roues arrête le robot instantanément"], bonne: 0, explication: "Roues bloquées, c'est la loi de Coulomb qui plafonne l'effort de freinage, exactement comme à l'accélération." },
      { type: "qcm", fiche: "tsi-sumo-dem-horaires", enonce: "Distance de freinage calculée : 9,4 mm. Exigence Ex3 : distance après détection de la bordure ≤ 25 mm. Conclusion correcte ?", choix: ["Conforme pour le freinage seul, mais il faut ajouter la distance parcourue pendant le temps de réaction", "Ex3 est satisfaite, l'étude est terminée", "Ex3 n'est pas satisfaite", "Il faut comparer 9,4 mm à 300 mm (Ex4)"], bonne: 0, explication: "Entre la détection et le début du freinage, le robot roule encore pendant le temps de réaction de la chaîne d'information." },
      // ---- Inertie des roues ----
      { fiche: "tsi-sumo-dem-inertie", gen: (r) => { const mr = r.pick([15, 18, 20, 22, 25, 30]), R = r.pick([16, 20, 21, 24, 30]), J = 0.5 * (mr / 1000) * (R / 1000) ** 2;
          return { enonce: `Une roue, assimilée à un disque homogène, a une masse de <b>${mr} g</b> et un rayon de <b>${R} mm</b>. Moment d'inertie J autour de son axe ? (en × 10<sup>−6</sup> kg·m²)`,
                   reponse: J * 1e6, unite: "× 10<sup>−6</sup> kg·m<sup>2</sup>", explication: `J = ½·m<sub>r</sub>·R² = 0,5 × ${nb(mr / 1000)} × ${nb(R / 1000)}² = ${nb(J * 1e6, 3)} × 10<sup>−6</sup> kg·m².` }; } },
      { fiche: "tsi-sumo-dem-inertie", gen: (r) => { const R = r.pick([16, 20, 21, 24, 30]), J = r.pas(2, 8, 0.1), meq = ((2 * J * 1e-6) / (R / 1000) ** 2) * 1000;
          return { enonce: `Les deux roues motrices ont chacune un moment d'inertie <b>J = ${nb(J)} × 10<sup>−6</sup> kg·m²</b> et un rayon <b>R = ${R} mm</b>. Masse équivalente 2·J/R² qu'elles ajoutent en translation (en g) ?`,
                   reponse: meq, unite: "g", explication: `Roulement sans glissement (v = ω·R) : m<sub>éq</sub> = 2·J/R² = 2 × ${nb(J)}×10<sup>−6</sup> / ${nb(R / 1000)}² = ${nb(meq / 1000, 3)} kg = ${nb(meq, 3)} g.` }; } },
      { fiche: "tsi-sumo-dem-inertie", gen: (r) => { const m = r.pas(0.85, 1, 0.01), mr = r.pick([15, 18, 20, 22, 25, 30]), T = r.pas(3.8, 5, 0.02); const ap = T / (m + mr / 1000);
          return { enonce: `Effort tangentiel du sol <b>T = ${nb(T)} N</b>, robot de <b>${nb(m)} kg</b>. Les deux roues motrices (disques de <b>${mr} g</b> chacun) ajoutent une masse équivalente 2·J/R² = <b>${mr} g</b>. Accélération en tenant compte de leur inertie ?`,
                   reponse: ap, unite: S2, tolerance: 1, explication: `m<sub>éq</sub> = ${nb(m)} + ${nb(mr / 1000)} = ${nb(m + mr / 1000)} kg ; a' = T/m<sub>éq</sub> = ${nb(T)} / ${nb(m + mr / 1000)} = ${nb(ap, 3)} ${S2} (au lieu de ${nb(T / m, 3)} sans inertie).` }; } },
      { fiche: "tsi-sumo-dem-inertie", gen: (r) => { const m = r.pas(0.85, 1, 0.01), mr = r.pick([15, 18, 20, 22, 25, 30]), T = r.pas(3.8, 5, 0.02); const a = T / m, ap = T / (m + mr / 1000), err = ecart(ap, a);
          return { enonce: `<b>T = ${nb(T)} N</b>, robot de <b>${nb(m)} kg</b>, masse équivalente des roues <b>${mr} g</b>. Erreur relative (en %) commise sur l'accélération si l'on néglige l'inertie des roues ?`,
                   reponse: err, unite: "%", tolerance: 3, explication: `a = T/m = ${nb(a, 4)} ${S2} ; a' = T/(m + m<sub>éq</sub>) = ${nb(ap, 4)} ${S2} ; erreur = |a' − a|/a = ${nb(err, 3)} %, à comparer à la dispersion des mesures.` }; } },
      { type: "qcm", fiche: "tsi-sumo-dem-inertie", enonce: "Pour ramener l'inertie des roues à une masse équivalente en translation, on utilise…", choix: ["La condition de roulement sans glissement v = ω·R", "Le principe fondamental de la statique", "La loi de Coulomb T = µ·N", "La relation P = C·ω seule"], bonne: 0, explication: "v = ω·R relie la rotation des roues à la translation du robot : J/R² devient une masse." },
      { type: "qcm", fiche: "tsi-sumo-dem-inertie", enonce: "Négliger l'inertie des roues fausse l'accélération de 2,3 % ; la dispersion des mesures est d'environ 5 %. Conclusion ?", choix: ["L'hypothèse simplificatrice est légitime : l'erreur est plus petite que la dispersion", "L'hypothèse est fausse : toute erreur doit être corrigée", "Il faut ajouter l'inertie du moteur pour conclure", "L'hypothèse n'est valable qu'au freinage"], bonne: 0, explication: "Une erreur de modèle plus petite que la dispersion des essais ne serait même pas visible : on la néglige en le justifiant." },
      // ---- Transfert de charge ----
      { fiche: "tsi-sumo-dem-transfert", gen: (r) => { const m = r.pas(0.85, 1, 0.01), e = r.pick([110, 120, 130]), d = r.pas(30, 50, 5), hG = r.pick([25, 30, 35, 40]), a = r.pick([3, 4, 4.5, 5, 5.4, 6]); const N0 = (m * g * (e - d)) / e, dN = (m * a * hG) / e, N = N0 + dN;
          return { enonce: `Démarrage à <b>a = ${nb(a)} ${S2}</b> : <b>m = ${nb(m)} kg</b>, <b>e = ${e} mm</b>, <b>d = ${d} mm</b>, hauteur de G <b>h<sub>G</sub> = ${hG} mm</b>. Effort normal N<sub>r</sub> sur les roues motrices, transfert de charge compris ?`,
                   reponse: N, unite: "N", explication: `N<sub>r</sub>(a) = m·g·(e − d)/e + m·a·h<sub>G</sub>/e = ${nb(N0)} + ${nb(dN)} = ${nb(N)} N.` }; } },
      { fiche: "tsi-sumo-dem-transfert", gen: (r) => { const m = r.pas(0.85, 1, 0.01), e = r.pick([110, 120, 130]), hG = r.pick([25, 30, 35, 40, 50]), a = r.pick([3, 4, 4.5, 5, 5.4, 6]), dN = (m * a * hG) / e;
          return { enonce: `Robot de <b>${nb(m)} kg</b>, <b>e = ${e} mm</b>, <b>h<sub>G</sub> = ${hG} mm</b>, accélérant à <b>${nb(a)} ${S2}</b>. Supplément de charge reporté sur les roues motrices ?`,
                   reponse: dN, unite: "N", explication: `ΔN<sub>r</sub> = m·a·h<sub>G</sub>/e = ${nb(m)} × ${nb(a)} × ${hG}/${e} = ${nb(dN, 3)} N.` }; } },
      { fiche: "tsi-sumo-dem-transfert", gen: (r) => { const m = r.pick([0.9, 0.95, 1]), e = 120, d = r.pick([40, 45, 50]), hG = r.pick([30, 35, 40]), mu = r.pick([0.75, 0.78, 0.8]), am = r.pick([5, 5.2, 5.4, 5.6]); const N0 = (m * g * (e - d)) / e, N = N0 + (m * am * hG) / e, ac = (mu * N) / m;
          return { enonce: `Mesure : <b>a = ${nb(am)} ${S2}</b>. Robot : <b>m = ${nb(m)} kg</b>, <b>e = 120 mm</b>, <b>d = ${d} mm</b>, <b>h<sub>G</sub> = ${hG} mm</b>, <b>µ = ${nb(mu)}</b>. Accélération permise par l'adhérence avec N<sub>r</sub> corrigé du transfert de charge (calculé à a = ${nb(am)}) ?`,
                   reponse: ac, unite: S2, tolerance: 3, explication: `N<sub>r</sub> = ${nb(N0)} + ${nb(m)} × ${nb(am)} × ${hG}/120 = ${nb(N)} N ; a = µ·N<sub>r</sub>/m = ${nb(mu)} × ${nb(N)} / ${nb(m)} = ${nb(ac, 3)} ${S2} : le modèle corrigé encadre la mesure.` }; } },
      { fiche: "tsi-sumo-dem-transfert", gen: (r) => { const as = r.pick([4.2, 4.5, 4.78, 5]), am = +(as * (1 + r.pick([0.06, 0.1, 0.13, 0.16, 0.2]))).toFixed(1), ec = ecart(am, as);
          return { enonce: `Modèle statique : <b>a<sub>max</sub> = ${nb(as)} ${S2}</b>. Mesure au démarrage : <b>${nb(am)} ${S2}</b>. Écart relatif mesure / modèle (en %) ?`,
                   reponse: ec, unite: "%", explication: `écart = |${nb(am)} − ${nb(as)}| / ${nb(as)} × 100 = ${nb(ec, 3)} %. S'il dépasse la dispersion, il doit être expliqué (ici : transfert de charge).` }; } },
      { fiche: "tsi-sumo-dem-transfert", gen: (r) => { const m = r.pas(0.85, 1, 0.01), e = r.pick([110, 120, 130]), d = r.pas(30, 50, 5), hG = r.pick([25, 30, 35, 40]), a = r.pick([2, 3, 4, 4.5]); const N0 = (m * g * (e - d)) / e, dN = (m * a * hG) / e, N = N0 - dN;
          return { enonce: `Freinage à <b>${nb(a)} ${S2}</b> (décélération) : <b>m = ${nb(m)} kg</b>, <b>e = ${e} mm</b>, <b>d = ${d} mm</b>, <b>h<sub>G</sub> = ${hG} mm</b>. Effort normal N<sub>r</sub> sur les roues motrices arrière pendant le freinage ?`,
                   reponse: N, unite: "N", explication: `Au freinage la charge part vers l'avant : N<sub>r</sub> = m·g·(e − d)/e − m·a·h<sub>G</sub>/e = ${nb(N0)} − ${nb(dN)} = ${nb(N)} N.` }; } },
      { type: "qcm", fiche: "tsi-sumo-dem-transfert", enonce: "Au démarrage, l'inertie du robot reporte de la charge…", choix: ["Vers l'arrière, sur les roues motrices : N<sub>r</sub> augmente", "Vers l'avant, sur la bille : N<sub>r</sub> diminue", "Nulle part : la répartition reste celle du PFS", "Vers le haut : le robot s'allège"], bonne: 0, explication: "N<sub>r</sub>(a) = m·g·(e − d)/e + m·a·h<sub>G</sub>/e : plus de charge sur les roues motrices, donc plus d'adhérence disponible." },
      { type: "qcm", fiche: "tsi-sumo-dem-transfert", enonce: "Mesure : 5,4 m·s<sup>−2</sup> ; modèle statique : 4,78 m·s<sup>−2</sup>. Quel paramètre explique principalement l'écart ?", choix: ["La hauteur h<sub>G</sub> du centre de gravité (transfert de charge)", "Le rayon R des roues", "Le rapport de réduction", "La tension de la batterie"], bonne: 0, explication: "Le transfert de charge est proportionnel à h<sub>G</sub> : le modèle statique l'ignore." },
      { type: "qcm", fiche: "tsi-sumo-dem-transfert", enonce: "Au freinage (roues motrices arrière bloquées), le transfert de charge…", choix: ["Décharge les roues arrière : le freinage est moins efficace que prévu par le modèle statique", "Charge les roues arrière : le freinage est plus efficace", "N'existe pas au freinage", "Fait basculer le robot vers l'arrière"], bonne: 0, explication: "La décélération reporte la charge vers l'avant (bille) : N<sub>r</sub> diminue, donc µ·N<sub>r</sub> aussi." }
    ],
    fiches: [
      { id: "tsi-sumo-dem-pfd", titre: "PFD : accélération maximale",
        recto: "Quelle est l'accélération maximale du robot au démarrage sans que ses roues patinent ?",
        verso: `<div class="formule">Σ F<sub>ext</sub> = m·a &nbsp;→&nbsp; T − f = m·a</div><div class="formule">a<sub>max</sub> = µ·N<sub>r</sub> / m</div><ul><li>T : action tangentielle du <b>sol</b> sur les roues motrices (pas « la force du moteur »).</li><li>f : résistances au roulement, souvent négligées.</li></ul><p class="astuce">Limité par l'adhérence : doubler la puissance ne double pas l'accélération, seulement le patinage.</p>`,
        quiz: [{ enonce: "Ce qui propulse le robot :", choix: ["L'action tangentielle du sol sur les roues", "Le couple du moteur directement", "Le poids"], bonne: 0 },
               { enonce: "µ·N<sub>r</sub> = 4,54 N, m = 0,950 kg : a<sub>max</sub> ≈ …", choix: ["4,78 m·s<sup>−2</sup>", "4,31 m·s<sup>−2</sup>", "0,21 m·s<sup>−2</sup>"], bonne: 0 },
               { enonce: "Doubler la puissance moteur sur piste glissante :", choix: ["Ne change pas a<sub>max</sub>", "Double a<sub>max</sub>", "Divise a<sub>max</sub> par deux"], bonne: 0 }] },
      { id: "tsi-sumo-dem-horaires", titre: "Démarrage et arrêt à accélération constante",
        recto: "Durée et distance pour atteindre une vitesse v avec une accélération constante a, et distance de freinage ?",
        verso: `<div class="formule">v = a·t &nbsp;·&nbsp; x = ½·a·t² &nbsp;·&nbsp; v² = 2·a·x</div><ul><li>Durée : t = v / a ; distance : x = v² / (2a).</li><li>Freinage roues bloquées : décélération limitée aussi par µ·N<sub>r</sub>/m.</li></ul><p class="astuce">TSI-SUMO : 0,30 m/s atteint en 63 ms sur 9,4 mm. Conclure sur Ex5 (a ≥ 1,0 m·s⁻²).</p>`,
        quiz: [{ enonce: "Durée pour atteindre v avec a constante :", choix: ["t = v / a", "t = a / v", "t = v·a"], bonne: 0 },
               { enonce: "Distance pour atteindre v depuis l'arrêt :", choix: ["v² / (2a)", "v / (2a)", "2a / v²"], bonne: 0 },
               { enonce: "0,30 m·s<sup>−1</sup> à 4,78 m·s<sup>−2</sup> : durée ≈ …", choix: ["63 ms", "1,43 s", "16 s"], bonne: 0 }] },
      { id: "tsi-sumo-dem-inertie", titre: "Inertie des roues : masse équivalente",
        recto: "Comment tenir compte de l'inertie des roues dans le calcul de l'accélération, et quand peut-on la négliger ?",
        verso: `<div class="formule">Disque : J = ½·m<sub>r</sub>·R²</div><div class="formule">m<sub>éq</sub> = m + Σ J/R² &nbsp;→&nbsp; a' = T / m<sub>éq</sub></div><ul><li>Roulement sans glissement : v = ω·R.</li><li>2 roues-disques : Σ J/R² = m<sub>r</sub> (masse d'une roue).</li></ul><p class="astuce">Erreur de 2,3 % &lt; dispersion des mesures → négliger l'inertie est une hypothèse légitime.</p>`,
        quiz: [{ enonce: "J d'un disque homogène :", choix: ["½·m·R²", "m·R²", "½·m·R"], bonne: 0 },
               { enonce: "Deux roues-disques de 22 g : masse équivalente ajoutée ≈ …", choix: ["22 g", "44 g", "11 g"], bonne: 0 },
               { enonce: "Erreur de 2,3 %, dispersion de 5 % :", choix: ["Négliger l'inertie est légitime", "Il faut refaire le calcul", "Le modèle est faux"], bonne: 0 }] },
      { id: "tsi-sumo-dem-transfert", titre: "Transfert de charge",
        recto: "Pourquoi l'accélération mesurée au démarrage dépasse-t-elle la valeur calculée en statique ?",
        verso: `<div class="formule">N<sub>r</sub>(a) = m·g·(e − d)/e + m·a·h<sub>G</sub>/e</div><ul><li>En accélérant, la charge passe vers l'<b>arrière</b>, sur les roues motrices : N<sub>r</sub> ↑ → µ·N<sub>r</sub> ↑ → a ↑.</li><li>Paramètre en jeu : la hauteur h<sub>G</sub>.</li><li>Au freinage, c'est l'inverse.</li></ul><p class="astuce">Écart modèle / mesure de 13 % &gt; dispersion : il fallait l'expliquer.</p>`,
        quiz: [{ enonce: "Au démarrage, la charge se reporte…", choix: ["Vers l'arrière, sur les roues motrices", "Vers l'avant, sur la bille", "Nulle part"], bonne: 0 },
               { enonce: "Paramètre géométrique qui pilote le transfert :", choix: ["h<sub>G</sub>", "R", "h<sub>c</sub>"], bonne: 0 },
               { enonce: "Au freinage, N<sub>r</sub>…", choix: ["Diminue", "Augmente", "Ne change pas"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     MODULE D — La chaîne d'information : capteurs et algorithme (N12)
     ===================================================================== */
  const FONCTIONS = ["Acquérir", "Traiter", "Communiquer (commander la chaîne de puissance)", "Convertir (chaîne de puissance)"];
  const COMPOSANTS = [["capteur de réflectance (ligne blanche)", 0], ["capteur ultrasonore", 0], ["convertisseur analogique-numérique", 1], ["microcontrôleur (carte micro:bit)", 1], ["pont en H recevant les ordres MLI", 2], ["moteur à courant continu", 3]];
  const ACTIONS = [["moteurs(100, 100)", 0], ["moteurs(−100, −100)", 1], ["moteurs(60, −60)", 2], ["moteurs(−60, 60)", 2], ["moteurs(100, 40)", 3], ["moteurs(40, 100)", 3]];

  SIP.definirModule({
    id: "tsi-sumo-commande",
    niveaux: ["TSI"],
    sequence: SEQ,
    titre: "Chaîne d'information : capteurs et combat",
    description: "Chaîne d'information, CAN et seuil du capteur de ligne, capteur ultrasonore, distance d'arrêt en bordure, diagramme états-transitions et programme de combat.",
    competences: ["A4", "A5", "M5", "E3"],
    nbQuestions: 10,
    questions: [
      // ---- Chaîne d'information, pont en H, MLI ----
      { fiche: "tsi-sumo-cmd-chaine", gen: (r) => { const c = r.pick(COMPOSANTS);
          return { type: "qcm", enonce: `Robot sumo : quelle fonction assure le <b>${c[0]}</b> ?`, choix: FONCTIONS.slice(), bonne: c[1],
                   explication: "Acquérir : capteurs de réflectance et ultrasonore ; Traiter : CAN puis microcontrôleur ; Communiquer : ordres MLI vers le pont en H, à la frontière avec la chaîne de puissance (où le moteur convertit)." }; } },
      { fiche: "tsi-sumo-cmd-chaine", gen: (r) => { const p = r.pick([30, 40, 50, 60, 75, 80]), U = r.pick([4.5, 6, 7.2]), Um = (p / 100) * U;
          return { enonce: `L'instruction <b>moteurs(${p}, ${p})</b> impose au pont en H un rapport cyclique <b>α = ${p} %</b> (MLI). Batterie <b>U = ${nb(U)} V</b>. Valeur moyenne de la tension appliquée à chaque moteur ?`,
                   reponse: Um, unite: "V", explication: `U<sub>moy</sub> = α·U = ${nb(p / 100)} × ${nb(U)} = ${nb(Um)} V.` }; } },
      { fiche: "tsi-sumo-cmd-chaine", gen: (r) => { const U = r.pick([4.5, 6, 7.2]), Um = r.pick([1.5, 2, 2.5, 3, 3.6, 4]), a = (Um / U) * 100;
          return { enonce: `Batterie <b>U = ${nb(U)} V</b>. Quel rapport cyclique α (en %) faut-il imposer au pont en H pour appliquer en moyenne <b>${nb(Um)} V</b> aux moteurs ?`,
                   reponse: a, unite: "%", explication: `α = U<sub>moy</sub>/U = ${nb(Um)} / ${nb(U)} = ${nb(a, 3)} %.` }; } },
      { type: "qcm", fiche: "tsi-sumo-cmd-chaine", enonce: "Dans l'architecture du robot, le pont en H est placé…", choix: ["À la frontière entre chaîne d'information et chaîne de puissance", "Dans la fonction Acquérir", "Entre le moteur et le réducteur", "Entre la roue et le sol"], bonne: 0, explication: "Il reçoit des signaux logiques (MLI) du microcontrôleur et module l'énergie de la batterie vers les moteurs." },
      // ---- CAN et seuil ----
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const n = r.pick([8, 10, 12]), V = r.pick([3.3, 5]), q = (V / 2 ** n) * 1000;
          return { enonce: `Un CAN <b>${n} bits</b> a une tension de référence <b>V<sub>ref</sub> = ${nb(V)} V</b>. Quantum q (en mV) ?`,
                   reponse: q, unite: "mV", explication: `q = V<sub>ref</sub>/2<sup>n</sup> = ${nb(V)} / ${2 ** n} = ${nb(q, 3)} mV (2<sup>${n}</sup> = ${2 ** n}, pas ${2 ** n - 1}).` }; } },
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const n = r.pick([8, 10, 12]), N = 2 ** n - 1;
          return { enonce: `Plus grande valeur numérique que peut renvoyer un CAN <b>${n} bits</b> ?`,
                   reponse: N, unite: "", absolu: 0.5, explication: `2<sup>${n}</sup> = ${2 ** n} valeurs possibles, numérotées de 0 à ${N}.` }; } },
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const U = r.pas(0.3, 3.2, 0.05), q = 3.3 / 1024, N = Math.floor(U / q + 1e-9);
          return { enonce: `Le capteur de réflectance délivre <b>${nb(U)} V</b> sur une entrée analogique (CAN 10 bits, V<sub>ref</sub> = 3,30 V, comme la carte micro:bit). Valeur numérique N lue par le programme ?`,
                   reponse: N, unite: "", absolu: 1, explication: `q = 3,30/1024 = 3,22 mV ; N = partie entière de (U/q) = E(${nb(U)} × 1024 / 3,30) = E(${nb(U / q, 5)}) = ${N}.` }; } },
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const N = r.int(80, 1000), U = (N * 3.3) / 1024;
          return { enonce: `CAN 10 bits, V<sub>ref</sub> = 3,30 V : le programme lit <b>N = ${N}</b>. Tension correspondante en entrée ?`,
                   reponse: U, unite: "V", explication: `U ≈ N·q = ${N} × 3,30/1024 = ${nb(U, 3)} V.` }; } },
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const Ub = r.pas(2.4, 3, 0.05), Un = r.pas(0.3, 0.7, 0.05), q = 3.3 / 1024, Nb = Math.floor(Ub / q + 1e-9), Nn = Math.floor(Un / q + 1e-9), S = (Nb + Nn) / 2;
          return { enonce: `Capteur de ligne : <b>${nb(Ub)} V</b> au-dessus de la bordure blanche, <b>${nb(Un)} V</b> au-dessus du noir. CAN 10 bits, 3,30 V. Valeur numérique du seuil placé à mi-distance ?`,
                   reponse: S, unite: "", absolu: 1, explication: `q = 3,30/1024 ; N<sub>blanc</sub> = E(${nb(Ub)}/q) = E(${nb(Ub / q, 5)}) = ${Nb} ; N<sub>noir</sub> = E(${nb(Un)}/q) = E(${nb(Un / q, 5)}) = ${Nn} ; seuil = (${Nb} + ${Nn})/2 ≈ ${Math.floor(S)}.` }; } },
      { fiche: "tsi-sumo-cmd-can", gen: (r) => { const Nb = r.int(780, 930), Nn = r.int(90, 220), S = r.pick([r.int(250, 400), r.int(600, 740)]), M = Math.min(Nb - S, S - Nn);
          return { enonce: `N<sub>blanc</sub> = <b>${Nb}</b>, N<sub>noir</sub> = <b>${Nn}</b>. Un élève place le seuil de détection à <b>${S}</b>. Plus petite marge de bruit (en points) de part et d'autre du seuil ?`,
                   reponse: M, unite: "points", absolu: 0.5, explication: `Marges : ${Nb} − ${S} = ${Nb - S} côté blanc, ${S} − ${Nn} = ${S - Nn} côté noir → ${M}. À mi-distance (${Math.floor((Nb + Nn) / 2)}), elle vaudrait ${Math.floor((Nb - Nn) / 2)} points de chaque côté.` }; } },
      { type: "qcm", fiche: "tsi-sumo-cmd-can", enonce: "Un élève calcule le quantum d'un CAN 10 bits de référence 3,30 V : q = 3,30 / 1023. Correction ?", choix: ["Il faut diviser par 2<sup>10</sup> = 1024", "Il faut diviser par 10", "Il faut multiplier par 1023", "Aucune correction"], bonne: 0, explication: "q = V<sub>ref</sub>/2<sup>n</sup> = 3,30/1024 = 3,22 mV : 2<sup>10</sup> = 1024 et non 1023." },
      { type: "qcm", fiche: "tsi-sumo-cmd-can", enonce: "Pourquoi placer le seuil de détection à mi-distance entre N<sub>blanc</sub> et N<sub>noir</sub> ?", choix: ["Pour avoir la plus grande marge de bruit des deux côtés", "Parce que c'est plus simple à programmer", "Pour que le robot détecte plus vite le noir", "Pour diviser le quantum par deux"], bonne: 0, explication: "Éclairage, hauteur du capteur, salissure du dohyō font varier les valeurs : au milieu, la marge est maximale dans les deux sens." },
      { type: "qcm", fiche: "tsi-sumo-cmd-can", enonce: "Avec un seuil unique, la détection « clignote » quand le capteur est juste au bord de la ligne. Solution ?", choix: ["Une hystérésis : deux seuils, par exemple 480 et 530", "Un CAN 8 bits", "Un seuil égal à N<sub>blanc</sub>", "Supprimer la détection de bordure"], bonne: 0, explication: "Deux seuils distincts pour l'entrée et la sortie évitent les basculements répétés." },
      // ---- Capteur ultrasonore ----
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const d = r.pas(100, 700, 10), t = ((2 * d) / 1000 / 343) * 1000;
          return { enonce: `Adversaire à <b>${d} mm</b> du capteur ultrasonore (c = 343 ${S1}). Durée entre l'émission de la salve et la réception de l'écho (en ms) ?`,
                   reponse: t, unite: "ms", explication: `Δt = 2·d/c = 2 × ${nb(d / 1000)} / 343 = ${nb(t, 3)} ms (facteur 2 : aller-retour).` }; } },
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const t = r.pas(400, 4000, 20), d = ((343 * t * 1e-6) / 2) * 1000;
          return { enonce: `Le capteur ultrasonore mesure un écho au bout de <b>${nb(t)} µs</b> (c = 343 ${S1}). Distance de l'adversaire (en mm) ?`,
                   reponse: d, unite: "mm", explication: `d = c·Δt/2 = 343 × ${nb(t)}×10<sup>−6</sup> / 2 = ${nb(d / 1000, 3)} m = ${nb(d, 3)} mm.` }; } },
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const d = r.pas(200, 600, 50), w = r.pick([5, 10, 15, 20]), t = ((2 * d) / 1000 / 343) * 1000, f = 1000 / (t + w);
          return { enonce: `Adversaire à <b>${d} mm</b> (c = 343 ${S1}). Le programme attend <b>${w} ms</b> entre deux salves. Fréquence de rafraîchissement de la mesure de distance ?`,
                   reponse: f, unite: "Hz", explication: `Δt = 2d/c = ${nb(t, 3)} ms ; T = ${nb(t, 3)} + ${w} = ${nb(t + w, 3)} ms ; f = 1/T = ${nb(f, 3)} Hz.` }; } },
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const T = r.pick([8, 10, 11.75, 12, 15, 20, 25]), v = r.pick([0.2, 0.3, 0.4, 0.5]), x = v * T;
          return { enonce: `Une mesure de distance toutes les <b>${nb(T)} ms</b>. L'adversaire se déplace à <b>${nb(v)} ${S1}</b>. Distance qu'il parcourt entre deux mesures (en mm) ?`,
                   reponse: x, unite: "mm", explication: `x = v·T = ${nb(v)} × ${nb(T / 1000)} = ${nb(x / 1000, 3)} m = ${nb(x, 3)} mm : négligeable devant la dynamique du combat.` }; } },
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const t = r.pick([1, 1.5, 2, 2.5, 3, 5]), d = ((343 * t) / 1000 / 2) * 1000;
          return { enonce: `Le programme abandonne l'attente de l'écho au bout de <b>${nb(t)} ms</b>. Portée maximale de détection (c = 343 ${S1}, en mm) ?`,
                   reponse: d, unite: "mm", explication: `d<sub>max</sub> = c·t/2 = 343 × ${nb(t / 1000)} / 2 = ${nb(d, 3)} mm ${d >= 300 ? "≥ 300 mm : Ex4 satisfaite." : "&lt; 300 mm : Ex4 n'est pas satisfaite."}` }; } },
      { fiche: "tsi-sumo-cmd-ultrason", gen: (r) => { const th = r.pick([28, 30, 32, 35]), c = Math.round(331.4 + 0.6 * th), d = r.pick([200, 250, 300, 400]), dc = (d * 343) / c;
          return { enonce: `À Papara, il fait <b>${th} °C</b> : le son se propage à <b>${c} ${S1}</b>, mais le programme calcule avec 343 ${S1}. Adversaire réellement à <b>${d} mm</b> : quelle distance le programme calcule-t-il ?`,
                   reponse: dc, unite: "mm", tolerance: 0.5, explication: `Δt = 2d/c<sub>réel</sub> ; d<sub>calc</sub> = 343·Δt/2 = ${d} × 343/${c} = ${nb(dc)} mm, soit un écart de ${nb(ecart(dc, d), 2)} % : sans conséquence pour le combat.` }; } },
      { type: "qcm", fiche: "tsi-sumo-cmd-ultrason", enonce: "Un élève calcule Δt = d / c pour un adversaire à 300 mm et trouve 0,87 ms. Correction ?", choix: ["Oubli du facteur 2 (aller-retour) : Δt = 1,75 ms", "Il fallait multiplier : Δt = d × c", "Il fallait convertir c en km/h", "Aucune correction"], bonne: 0, explication: "L'onde va jusqu'à l'adversaire et revient : Δt = 2d/c = 2 × 0,300/343 = 1,75 ms." },
      { type: "qcm", fiche: "tsi-sumo-cmd-ultrason", enonce: "Pourquoi le programme attend-il 10 ms entre deux salves ultrasonores ?", choix: ["Pour laisser s'éteindre les échos parasites", "Pour laisser refroidir le capteur", "Pour économiser la batterie", "Parce que le son met 10 ms pour faire l'aller-retour sur 300 mm"], bonne: 0, explication: "Une nouvelle salve émise trop tôt pourrait être confondue avec un écho tardif de la précédente." },
      // ---- Temps de réaction et distance d'arrêt ----
      { fiche: "tsi-sumo-cmd-arret", gen: (r) => { const v = r.pick([0.25, 0.3, 0.35, 0.4, 0.5]), t = r.pick([10, 15, 20, 25, 30, 35, 50]), x = v * t;
          return { enonce: `La chaîne d'acquisition et de traitement introduit un retard de <b>${t} ms</b> avant la commande de freinage. Robot lancé à <b>${nb(v)} ${S1}</b>. Distance parcourue pendant ce retard (en mm) ?`,
                   reponse: x, unite: "mm", explication: `Vitesse constante pendant le retard : x<sub>1</sub> = v·t = ${nb(v)} × ${nb(t / 1000)} = ${nb(x / 1000, 3)} m = ${nb(x, 3)} mm.` }; } },
      { fiche: "tsi-sumo-cmd-arret", gen: (r) => { const v = r.pick([0.25, 0.3, 0.35, 0.4]), t = r.pick([15, 20, 25, 30, 35]), mu = r.pick([0.6, 0.7, 0.78]), m = 0.95, Nr = 5.82; const a = (mu * Nr) / m, x1 = v * t, x2 = ((v * v) / (2 * a)) * 1000, x = x1 + x2;
          return { enonce: `Bordure détectée à <b>${nb(v)} ${S1}</b> ; retard de traitement <b>${t} ms</b> ; freinage roues bloquées avec <b>µ = ${nb(mu)}</b>, <b>N<sub>r</sub> = 5,82 N</b>, <b>m = 0,950 kg</b>. Distance totale entre détection et arrêt (en mm) ?`,
                   reponse: x, unite: "mm", tolerance: 3, explication: `x<sub>1</sub> = v·t = ${nb(x1, 3)} mm ; a = µ·N<sub>r</sub>/m = ${nb(a, 3)} ${S2} ; x<sub>2</sub> = v²/(2a) = ${nb(x2, 3)} mm ; total = ${nb(x, 3)} mm ${x <= 25 ? "≤ 25 mm : Ex3 satisfaite." : "&gt; 25 mm : Ex3 non satisfaite."}` }; } },
      { fiche: "tsi-sumo-cmd-arret", gen: (r) => { const v = r.pick([0.25, 0.3, 0.35]), a = r.pick([4, 4.5, 4.78, 5, 5.5]), x2 = ((v * v) / (2 * a)) * 1000, tmax = (25 - x2) / v;
          return { enonce: `Robot à <b>${nb(v)} ${S1}</b>, décélération de freinage <b>${nb(a)} ${S2}</b>. Ex3 impose au plus 25 mm entre la détection de la bordure et l'arrêt. Retard de traitement maximal admissible (en ms) ?`,
                   reponse: tmax, unite: "ms", tolerance: 3, explication: `Freinage : x<sub>2</sub> = v²/(2a) = ${nb(x2, 3)} mm ; il reste ${nb(25 - x2, 3)} mm à vitesse constante : t<sub>max</sub> = ${nb(25 - x2, 3)} / ${nb(v)} = ${nb(tmax, 3)} ms.` }; } },
      { fiche: "tsi-sumo-cmd-arret", gen: (r) => { let v, t, a, x; do { v = r.pick([0.25, 0.3, 0.35]); t = r.pick([15, 20, 25, 30, 35]); a = r.pick([4, 4.5, 4.78, 5, 5.5]); x = v * t + ((v * v) / (2 * a)) * 1000; } while (x >= 24); const mg = ((25 - x) / 25) * 100;
          return { enonce: `Robot à <b>${nb(v)} ${S1}</b>, retard <b>${t} ms</b>, décélération <b>${nb(a)} ${S2}</b>. Ex3 : distance ≤ 25 mm. Marge restante, en % du niveau de l'exigence ?`,
                   reponse: mg, unite: "%", tolerance: 3, explication: `x = v·t + v²/(2a) = ${nb(v * t, 3)} + ${nb(x - v * t, 3)} = ${nb(x, 3)} mm ; marge = (25 − ${nb(x, 3)})/25 × 100 = ${nb(mg, 3)} %.` }; } },
      { type: "qcm", fiche: "tsi-sumo-cmd-arret", enonce: "Le dohyō est poussiéreux : µ passe de 0,78 à 0,60. Effet sur l'exigence Ex3 ?", choix: ["La distance de freinage augmente : la marge sur Ex3 diminue, voire disparaît", "La distance de freinage diminue", "Aucun effet : seul le temps de réaction compte", "Ex3 devient plus facile à satisfaire"], bonne: 0, explication: "a = µ·N<sub>r</sub>/m diminue, donc x<sub>2</sub> = v²/(2a) augmente (9,4 → 12,2 mm) : la marge fond." },
      { type: "qcm", fiche: "tsi-sumo-cmd-arret", enonce: "Pendant le temps de réaction de la chaîne d'information, le robot…", choix: ["Continue à rouler à vitesse constante", "Freine déjà au maximum", "S'arrête instantanément", "Recule"], bonne: 0, explication: "Tant que la commande de freinage n'est pas émise, rien ne change : x<sub>1</sub> = v·t<sub>r</sub>." },
      // ---- États-transitions et programme ----
      { fiche: "tsi-sumo-cmd-etats", gen: (r) => { const cas = [
            () => { const d = r.pas(80, 290, 10); return [`Le robot est en <b>RECHERCHE</b>, aucune bordure détectée ; le capteur ultrasonore mesure <b>${d} mm</b>.`, 1, "distance &lt; 300 mm : RECHERCHE → ATTAQUE."]; },
            () => { const d = r.pas(310, 700, 10); return [`Le robot est en <b>ATTAQUE</b>, aucune bordure détectée ; l'adversaire est maintenant à <b>${d} mm</b>.`, 0, "distance ≥ 300 mm : adversaire perdu, retour en RECHERCHE."]; },
            () => { const n = r.int(700, 950); return [`Le robot est en <b>RECHERCHE</b> et le capteur de ligne renvoie <b>n = ${n}</b> (seuil 503).`, 2, "n &gt; 503 : bordure détectée, transition prioritaire vers RECUL."]; },
            () => { const n = r.int(700, 950), d = r.pas(50, 250, 10); return [`Le robot est en <b>ATTAQUE</b> (adversaire à ${d} mm) et le capteur de ligne renvoie <b>n = ${n}</b> (seuil 503).`, 2, "La bordure est prioritaire sur tout le reste : ATTAQUE → RECUL, même adversaire en vue."]; },
            () => [`Le robot est en <b>RECUL</b> depuis <b>400 ms</b> (temporisation de recul et de rotation : 400 ms).`, 0, "Le retour de RECUL est temporisé : après 400 ms, retour en RECHERCHE."],
            () => [`Le robot est en <b>ATTAQUE</b> et l'arbitre signale la <b>fin du combat</b>.`, 3, "Fin du combat ou arrêt d'urgence : transition vers ARRET depuis tout état."],
            () => [`Le robot est dans l'état initial ; on appuie sur le bouton, puis la temporisation réglementaire de <b>5 s</b> s'écoule.`, 0, "État initial → RECHERCHE après appui bouton et 5 s d'attente."]
          ]; const [txt, b, ex] = r.pick(cas)();
          return { type: "qcm", enonce: `${txt} Quel est l'état suivant ?`, choix: ["RECHERCHE", "ATTAQUE", "RECUL", "ARRET"], bonne: b, explication: ex }; } },
      { fiche: "tsi-sumo-cmd-etats", gen: (r) => { const cas = r.int(0, 2); let n, d;
          if (cas === 0) { n = r.int(510, 950); d = r.pick([r.pas(40, 290, 10), r.pas(310, 800, 10)]); }
          else if (cas === 1) { n = r.pick([r.int(90, 480), 503]); d = r.pas(40, 290, 10); }
          else { n = r.pick([r.int(90, 480), 503]); d = r.pick([r.pas(310, 800, 10), 300]); }
          const notes = [`n = ${n} &gt; 503 : le test de bordure passe en premier, le robot recule quelle que soit la distance.`, `n = ${n} n'est pas &gt; 503 (pas de bordure) ; d = ${d} &lt; 300 : adversaire en vue, attaque.`, `n = ${n} n'est pas &gt; 503 ; d = ${d} n'est pas &lt; 300 : on passe dans le else, rotation de recherche.`];
          return { type: "qcm", enonce: `Programme : <code>if n &gt; SEUIL_LIGNE</code> (503) → recul ; <code>elif d &lt; PORTEE</code> (300) → moteurs(100, 100) ; <code>else</code> → moteurs(60, −60). Mesures : <b>n = ${n}</b>, <b>d = ${d} mm</b>. Que fait le robot ?`,
                   choix: ["Il recule puis pivote (bordure détectée)", "Il fonce : moteurs(100, 100)", "Il tourne sur place : moteurs(60, −60)", "Il s'arrête : moteurs(0, 0)"], bonne: cas, explication: notes[cas] }; } },
      { fiche: "tsi-sumo-cmd-etats", gen: (r) => { const l3 = r.int(0, 1) === 0;
          return { type: "qcm", enonce: `Programme de combat : <code>if ③ :</code> # bordure détectée, priorité absolue … <code>elif ④ :</code> # adversaire en vue … Que faut-il écrire en <b>${l3 ? "③" : "④"}</b> ? (blanc = valeur haute)`,
                   choix: ["n &gt; SEUIL_LIGNE", "n &lt; SEUIL_LIGNE", "d &lt; PORTEE", "d &gt; PORTEE"], bonne: l3 ? 0 : 2,
                   explication: "③ n &gt; SEUIL_LIGNE (la ligne blanche donne une valeur haute) ; ④ d &lt; PORTEE. On utilise les constantes, pas les valeurs en dur." }; } },
      { fiche: "tsi-sumo-cmd-etats", gen: (r) => { const x = r.pick(ACTIONS);
          return { type: "qcm", enonce: `<b>${x[0]}</b> règle en % les moteurs gauche et droit (le signe donne le sens). Mouvement du robot ?`,
                   choix: ["Avance en ligne droite", "Recule en ligne droite", "Tourne sur place", "Avance en décrivant un virage"], bonne: x[1],
                   explication: "Mêmes commandes positives : avance ; négatives : recul ; opposées : rotation sur place (recherche) ; différentes de même signe : virage." }; } },
      { type: "qcm", fiche: "tsi-sumo-cmd-etats", enonce: "Diagramme états-transitions du combat : laquelle de ces étiquettes est une condition de transition valide ?", choix: ["distance &lt; 300 mm", "moteurs(100, 100)", "ATTAQUE", "reculer pendant 200 ms"], bonne: 0, explication: "Une transition porte une condition (un événement, un test), jamais une action : les actions sont associées aux états." },
      { type: "qcm", fiche: "tsi-sumo-cmd-etats", enonce: "On inverse les tests du programme : <code>if d &lt; PORTEE</code> puis <code>elif n &gt; SEUIL_LIGNE</code>. Conséquence ?", choix: ["Le robot peut sortir de l'aire pendant une attaque", "Aucune : l'ordre des tests est indifférent", "Le robot ne verra plus l'adversaire", "Le robot reculera en permanence"], bonne: 0, explication: "Le premier test vrai l'emporte : l'ordre if / elif traduit la priorité de la bordure." },
      { type: "qcm", fiche: "tsi-sumo-cmd-etats", enonce: "Le robot recule au moment précis où il allait pousser l'adversaire hors du dohyō. Quelle évolution reste sûre ?", choix: ["Ne donner la priorité au recul que si l'adversaire n'est pas au contact (d &gt; 80 mm)", "Supprimer la détection de bordure pendant l'attaque", "Mettre le seuil de ligne à 0", "Rouler plus vite pour franchir la ligne"], bonne: 0, explication: "On garde la détection de bordure (sûreté) mais on l'assouplit dans le seul cas du contact avec l'adversaire (ou un état POUSSEE_FINALE limité dans le temps)." },
      { type: "qcm", fiche: "tsi-sumo-cmd-etats", enonce: "Comment le robot sort-il de l'état RECUL ?", choix: ["Après une temporisation (400 ms de recul et de rotation)", "Dès que le capteur ne voit plus la ligne", "Dès que l'adversaire est détecté", "Jamais : RECUL mène toujours à ARRET"], bonne: 0, explication: "Le retour est temporisé, pas conditionné à un capteur : le robot doit s'éloigner franchement de la bordure." }
    ],
    fiches: [
      { id: "tsi-sumo-cmd-chaine", titre: "Chaîne d'information et pont en H",
        recto: "Quels composants du robot acquièrent, traitent et communiquent l'information, et quel est le rôle du pont en H ?",
        verso: `<ul><li><b>Acquérir</b> : capteur de réflectance (ligne), capteur ultrasonore</li><li><b>Traiter</b> : CAN puis microcontrôleur (micro:bit)</li><li><b>Communiquer</b> : ordres MLI vers le pont en H</li></ul><div class="formule">MLI : U<sub>moy</sub> = α × U</div><p class="astuce">Le pont en H est à la frontière des deux chaînes : il reçoit de l'information et distribue de la puissance.</p>`,
        quiz: [{ enonce: "Le pont en H se situe…", choix: ["À la frontière information / puissance", "Dans la fonction Acquérir", "Dans le réducteur"], bonne: 0 },
               { enonce: "α = 60 %, U = 6 V : U<sub>moy</sub> = …", choix: ["3,6 V", "10 V", "0,6 V"], bonne: 0 },
               { enonce: "Le capteur ultrasonore réalise la fonction…", choix: ["Acquérir", "Traiter", "Communiquer"], bonne: 0 }] },
      { id: "tsi-sumo-cmd-can", titre: "Capteur de ligne : CAN et seuil",
        recto: "Comment passe-t-on de la tension du capteur de ligne à une valeur numérique, et où placer le seuil de détection ?",
        verso: `<div class="formule">q = V<sub>ref</sub> / 2<sup>n</sup> &nbsp;·&nbsp; N = E(U / q)</div><ul><li>10 bits, 3,30 V : q = 3,22 mV, N de 0 à 1023.</li><li>Seuil à mi-distance : (N<sub>blanc</sub> + N<sub>noir</sub>)/2 → marge de bruit maximale des deux côtés.</li><li>Hystérésis (480 / 530) contre les basculements répétés.</li></ul><p class="astuce">2<sup>10</sup> = 1024, pas 1023.</p>`,
        quiz: [{ enonce: "Quantum d'un CAN 10 bits sous 3,30 V :", choix: ["3,22 mV", "3,23 mV", "330 mV"], bonne: 0 },
               { enonce: "Seuil entre 868 (blanc) et 139 (noir) :", choix: ["503", "868", "729"], bonne: 0 },
               { enonce: "L'hystérésis sert à…", choix: ["Éviter les basculements répétés en bordure", "Augmenter la résolution", "Accélérer la conversion"], bonne: 0 }] },
      { id: "tsi-sumo-cmd-ultrason", titre: "Capteur ultrasonore : temps de vol",
        recto: "Comment le capteur ultrasonore mesure-t-il la distance de l'adversaire, et à quelle cadence ?",
        verso: `<div class="formule">Δt = 2·d / c &nbsp;·&nbsp; d = c·Δt / 2</div><ul><li>c = 343 m/s à 20 °C ; facteur 2 = aller-retour.</li><li>Cadence : T = Δt + attente de sécurité ; f = 1/T.</li></ul><p class="astuce">300 mm → Δt = 1,75 ms ; avec 10 ms d'attente : 85 Hz, l'adversaire (0,30 m/s) avance de 3,5 mm entre deux mesures.</p>`,
        quiz: [{ enonce: "Adversaire à 300 mm, c = 343 m/s : Δt ≈ …", choix: ["1,75 ms", "0,87 ms", "3,5 ms"], bonne: 0 },
               { enonce: "Le facteur 2 traduit…", choix: ["L'aller-retour de l'onde", "Les deux capteurs", "La température"], bonne: 0 },
               { enonce: "Δt = 1,75 ms et 10 ms d'attente : f ≈ …", choix: ["85 Hz", "571 Hz", "100 Hz"], bonne: 0 }] },
      { id: "tsi-sumo-cmd-arret", titre: "Temps de réaction et distance d'arrêt",
        recto: "Quelle distance le robot parcourt-il entre la détection de la bordure et son arrêt complet ?",
        verso: `<div class="formule">x = v·t<sub>r</sub> + v² / (2a)</div><ul><li>Pendant le retard t<sub>r</sub> (acquisition + traitement) : vitesse constante.</li><li>Puis freinage : a = µ·N<sub>r</sub>/m.</li><li>Ex3 : x ≤ 25 mm.</li></ul><p class="astuce">TSI-SUMO : 10,5 + 9,4 = 19,9 mm → Ex3 satisfaite, marge de 20 % seulement : un dohyō poussiéreux (µ ↓) la réduit.</p>`,
        quiz: [{ enonce: "0,30 m/s pendant 35 ms : distance ≈ …", choix: ["10,5 mm", "105 mm", "1,05 mm"], bonne: 0 },
               { enonce: "Distance d'arrêt totale :", choix: ["v·t<sub>r</sub> + v²/(2a)", "v²/(2a) seulement", "v·t<sub>r</sub> seulement"], bonne: 0 },
               { enonce: "Dohyō poussiéreux (µ ↓) :", choix: ["La marge sur Ex3 diminue", "La marge sur Ex3 augmente", "Rien ne change"], bonne: 0 }] },
      { id: "tsi-sumo-cmd-etats", titre: "États-transitions et programme de combat",
        recto: "Quels sont les états du robot de combat, et comment traduire leurs transitions dans le programme ?",
        verso: `<ul><li>États : RECHERCHE, ATTAQUE, RECUL, ARRET.</li><li>Une transition porte une <b>condition</b> (d &lt; 300 mm, n &gt; seuil…), jamais une action.</li><li>Bordure → RECUL : transition <b>prioritaire</b> ; sortie de RECUL temporisée (400 ms).</li></ul><div class="formule">if bordure … elif adversaire … else recherche</div><p class="astuce">L'ordre des tests traduit la priorité : les inverser fait sortir le robot pendant une attaque.</p>`,
        quiz: [{ enonce: "Une transition porte…", choix: ["Une condition", "Une action", "Un état"], bonne: 0 },
               { enonce: "Transition prioritaire :", choix: ["Bordure détectée → RECUL", "Adversaire vu → ATTAQUE", "Adversaire perdu → RECHERCHE"], bonne: 0 },
               { enonce: "Sortie de l'état RECUL :", choix: ["Temporisée (400 ms)", "Dès que la ligne n'est plus vue", "Quand l'adversaire est vu"], bonne: 0 }] }
    ]
  });
})();
