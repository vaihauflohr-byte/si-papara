/* =====================================================================
   Atelier schémas — les EXEMPLES tout faits et les DÉFIS (vérifiés par le moteur)
   Chaque schéma est construit ici, sur la grille : puissance à gauche, commande à droite.
   Défi : { id, titre, niveau, resume, consigne, indice, aide (petit schéma d'aide), depart(), exige, etapes }
   Les étapes sont rejouées par SchemasMoteur.scenario() sur le schéma de l'élève.
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;

  function plan(titre) {
    const s = M.nouveau(titre);
    const o = {
      s,
      p(type, x, y, ref, p, rot) {
        const T = M.TYPES[type], P = Object.assign({}, p || {});
        const pc = { id: "p" + (s.pieces.length + 1), type, x, y, rot: rot != null ? rot : (T.rotDefaut ? T.rotDefaut(Object.assign({}, T.p, P)) : 0), ref: ref || "", p: P };
        s.pieces.push(pc); return pc;
      },
      f(...pts) { const P = M.nettoyer(pts); if (P.length >= 2) s.fils.push({ id: "f" + (s.fils.length + 1), pts: P }); return o; },
      sans(...ids) { s.pieces = s.pieces.filter((pc) => ids.indexOf(pc.ref + ":" + pc.p.num) < 0 && ids.indexOf(pc.id) < 0); return o; }
    };
    return o;
  }

  /* ---------- briques communes ---------- */
  // puissance, démarrage direct : réseau, Q1, KM1, F1, M1 (x = 2, 4, 6)
  function puissanceDirecte(b, cablee) {
    b.p("reseau", 2, 0);
    b.p("sectionneur", 4, 7, "Q1", { cal: 10 });
    b.p("poles", 4, 15, "KM1");
    b.p("thermique", 4, 23, "F1", { cal: 6 });
    b.p("moteur", 4, 32, "M1");
    if (cablee === false) return;
    for (const x of [2, 4, 6]) b.f([x, 2], [x, 4]).f([x, 10], [x, 12]).f([x, 18], [x, 20]).f([x, 26], [x, 28]);
    b.f([10, 2], [10, 27], [8, 27], [8, 28]);
  }
  // commande marche-arrêt : L → F2 → F1 95-96 → S1 → S2 // KM1 13-14 → KM1 → N (x = 22)
  function commandeMA(b, o) {
    o = o || {};
    b.p("alim", 22, 1, "", { pot: "L" });
    b.p("fusible", 22, 7, "F2", { cal: 2 });
    if (!o.sansThermique) b.p("contact_th_nf", 22, 14, "F1", { num: "95-96" });
    b.p("bp_nf", 22, 21, "S1", { num: "11-12" });
    b.p("bp_no", 22, 28, "S2", { num: "13-14" });
    if (!o.sansMaintien) b.p("contact_no", 28, 28, "KM1", { num: "13-14" });
    b.p("bobine", 22, 35, "KM1", { tension: "230~" });
    b.p("alim", 22, 41, "", { pot: "N" });
    b.f([22, 3], [22, 4]);
    if (o.sansThermique) b.f([22, 10], [22, 18]); else b.f([22, 10], [22, 11]).f([22, 17], [22, 18]);
    b.f([22, 24], [22, 25]).f([22, 31], [22, 32]).f([22, 38], [22, 39]);
    if (!o.sansMaintien) b.f([22, 25], [28, 25]).f([28, 31], [22, 31]);
  }

  /* ---------- les exemples ---------- */
  const EXEMPLES = [
    { id: "lampe", titre: "Une lampe et un bouton poussoir", niveau: "Pour commencer",
      resume: "H1 s'allume tant qu'on appuie sur S1. H2 reste allumé : S2 est un interrupteur.",
      construire() {
        const b = plan("Lampe et bouton poussoir");
        b.p("alim", 4, 1, "", { pot: "L" });
        b.p("fusible", 4, 7, "F1", { cal: 2 });
        b.p("bp_no", 4, 15, "S1", { num: "13-14" });
        b.p("interrupteur", 14, 15, "S2", { num: "13-14" });
        b.p("voyant", 4, 22, "H1", { couleur: "vert", tension: "230~" });
        b.p("voyant", 14, 22, "H2", { couleur: "orange", tension: "230~" });
        b.p("alim", 4, 29, "", { pot: "N" });
        b.f([4, 3], [4, 4]).f([4, 10], [4, 12]).f([4, 11], [14, 11], [14, 12]).f([4, 18], [4, 19]).f([14, 18], [14, 19]).f([4, 25], [4, 27]).f([14, 25], [14, 26], [4, 26]);
        return b.s;
      } },
    { id: "marche-arret", titre: "Marche-arrêt avec auto-maintien", niveau: "Démarrage direct",
      resume: "Puissance : Q1, KM1, F1, M1. Commande : S1 arrête, S2 met en marche, KM1 13-14 garde le contacteur collé.",
      construire() { const b = plan("Marche-arrêt, démarrage direct"); puissanceDirecte(b); commandeMA(b); return b.s; } },
    { id: "signalisation", titre: "Signalisation : marche et défaut thermique", niveau: "Démarrage direct",
      resume: "H1 (vert) s'allume quand le moteur tourne, H2 (orange) quand le relais thermique F1 a déclenché.",
      construire() {
        const b = plan("Signalisation marche et défaut");
        puissanceDirecte(b); commandeMA(b);
        b.p("contact_th_no", 34, 14, "F1", { num: "97-98" });
        b.p("contact_no", 40, 14, "KM1", { num: "43-44" });
        b.p("voyant", 34, 35, "H2", { couleur: "orange", tension: "230~" });
        b.p("voyant", 40, 35, "H1", { couleur: "vert", tension: "230~" });
        b.f([22, 10], [40, 10], [40, 11]).f([34, 10], [34, 11]).f([34, 17], [34, 32]).f([40, 17], [40, 32])
          .f([22, 39], [40, 39], [40, 38]).f([34, 38], [34, 39]);
        return b.s;
      } },
    { id: "inversion", titre: "Inversion du sens de marche", niveau: "Deux sens de rotation",
      resume: "KM1 : sens 1, KM2 : sens 2 (deux phases croisées). Le verrouillage électrique empêche KM1 et KM2 d'être fermés ensemble.",
      construire() { return inversion(true); } },
    { id: "etoile-triangle", titre: "Démarrage étoile-triangle", niveau: "Démarrage à courant réduit",
      resume: "S2 : KM1 et KM2 (étoile). Après 3 s, KA1 fait passer en triangle (KM3). Commande en 24 V par le transformateur T1.",
      construire() {
        const b = plan("Démarrage étoile-triangle");
        b.p("reseau", 2, 0);
        b.p("sectionneur", 4, 6, "Q1", { cal: 16 });
        b.p("poles", 4, 14, "KM1");
        b.p("thermique", 4, 25, "F1", { cal: 6 });
        b.p("moteur6", 4, 35, "M1", { plaque: "400/690" });
        b.p("poles", 22, 25, "KM3");
        b.p("poles", 32, 35, "KM2");
        for (const x of [2, 4, 6]) b.f([x, 2], [x, 3]).f([x, 9], [x, 11]).f([x, 17], [x, 22]).f([x, 28], [x, 31]);
        b.f([2, 18], [20, 18], [20, 22]).f([4, 19], [22, 19], [22, 22]).f([6, 20], [24, 20], [24, 22]);
        b.f([20, 28], [20, 42], [6, 42], [6, 40]).f([22, 28], [22, 43], [2, 43], [2, 40]).f([24, 28], [24, 44], [4, 44], [4, 40]);
        b.f([20, 29], [30, 29], [30, 32]).f([22, 30], [32, 30], [32, 32]).f([24, 31], [34, 31], [34, 32]);
        b.f([30, 38], [30, 39], [34, 39], [34, 38]).f([32, 38], [32, 39]);
        b.f([10, 2], [10, 30], [8, 30], [8, 31]);
        // commande en 24 V
        b.p("alim", 44, 0, "", { pot: "L1" }, 0);
        b.p("alim", 52, 0, "", { pot: "L2" }, 0);
        b.p("transfo", 48, 8, "T1", { prim: 400, sec: 24 });
        b.p("fusible", 49, 16, "F2", { cal: 2 });
        b.p("contact_th_nf", 49, 23, "F1", { num: "95-96" });
        b.p("bp_nf", 49, 30, "S1", { num: "11-12" });
        b.p("bp_no", 49, 37, "S2", { num: "13-14" });
        b.p("contact_no", 55, 37, "KM1", { num: "13-14" });
        b.p("bobine", 49, 59, "KM1", { tension: "24~" });
        b.p("tempo_travail", 57, 59, "KA1", { tension: "24~", delai: 3 });
        b.p("contact_tnf", 65, 45, "KA1", { num: "55-56" });
        b.p("contact_nf", 65, 52, "KM3", { num: "21-22" });
        b.p("bobine", 65, 59, "KM2", { tension: "24~" });
        b.p("contact_tno", 73, 45, "KA1", { num: "67-68" });
        b.p("contact_nf", 73, 52, "KM2", { num: "21-22" });
        b.p("bobine", 73, 59, "KM3", { tension: "24~" });
        b.f([44, 2], [44, 3], [47, 3], [47, 4]).f([52, 2], [52, 3], [49, 3], [49, 4]);
        b.f([49, 12], [49, 13]).f([49, 19], [49, 20]).f([49, 26], [49, 27]).f([49, 33], [49, 34]);
        b.f([49, 34], [55, 34]).f([55, 40], [49, 40]);
        b.f([49, 40], [49, 56]).f([49, 41], [73, 41], [73, 42]).f([57, 41], [57, 56]).f([65, 41], [65, 42]);
        b.f([65, 48], [65, 49]).f([65, 55], [65, 56]).f([73, 48], [73, 49]).f([73, 55], [73, 56]);
        b.f([47, 12], [47, 13], [41, 13], [41, 63], [73, 63], [73, 62]).f([49, 62], [49, 63]).f([57, 62], [57, 63]).f([65, 62], [65, 63]);
        return b.s;
      } }
  ];
  function inversion(verrou) {
    const b = plan(verrou ? "Inversion du sens de marche" : "Inversion du sens de marche (sans verrouillage)");
    b.p("reseau", 2, 0);
    b.p("sectionneur", 4, 6, "Q1", { cal: 10 });
    b.p("poles", 4, 16, "KM1");
    b.p("poles", 14, 16, "KM2");
    b.p("thermique", 4, 26, "F1", { cal: 6 });
    b.p("moteur", 4, 36, "M1");
    for (const x of [2, 4, 6]) b.f([x, 2], [x, 3]).f([x, 9], [x, 13]).f([x, 19], [x, 23]).f([x, 29], [x, 32]);
    b.f([2, 10], [12, 10], [12, 13]).f([4, 11], [14, 11], [14, 13]).f([6, 12], [16, 12], [16, 13]);
    b.f([12, 19], [12, 20], [6, 20]).f([14, 19], [14, 21], [4, 21]).f([16, 19], [16, 22], [2, 22]);
    b.f([10, 2], [10, 8], [19, 8], [19, 31], [8, 31], [8, 32]);
    // commande
    b.p("alim", 28, 1, "", { pot: "L" });
    b.p("fusible", 28, 7, "F2", { cal: 2 });
    b.p("contact_th_nf", 28, 14, "F1", { num: "95-96" });
    b.p("bp_nf", 28, 21, "S1", { num: "11-12" });
    b.p("bp_no", 28, 28, "S2", { num: "13-14" });
    b.p("contact_no", 34, 28, "KM1", { num: "13-14" });
    b.p("bp_no", 42, 28, "S3", { num: "13-14" });
    b.p("contact_no", 48, 28, "KM2", { num: "13-14" });
    if (verrou) { b.p("contact_nf", 28, 35, "KM2", { num: "21-22" }); b.p("contact_nf", 42, 35, "KM1", { num: "21-22" }); }
    b.p("bobine", 28, 42, "KM1", { tension: "230~" });
    b.p("bobine", 42, 42, "KM2", { tension: "230~" });
    b.p("alim", 28, 48, "", { pot: "N" });
    b.f([28, 3], [28, 4]).f([28, 10], [28, 11]).f([28, 17], [28, 18]).f([28, 24], [28, 25]);
    b.f([28, 25], [34, 25]).f([34, 31], [28, 31]).f([28, 24], [42, 24], [42, 25]).f([42, 25], [48, 25]).f([48, 31], [42, 31]);
    if (verrou) b.f([28, 31], [28, 32]).f([28, 38], [28, 39]).f([42, 31], [42, 32]).f([42, 38], [42, 39]);
    else b.f([28, 31], [28, 39]).f([42, 31], [42, 39]);
    b.f([28, 45], [28, 46]).f([42, 45], [42, 46], [28, 46]);
    return b.s;
  }

  /* ---------- petits schémas d'aide (affichés avec l'indice) ---------- */
  function aideMaintien() {
    const b = plan("aide");
    b.p("bp_nf", 2, 4, "S1"); b.p("bp_no", 2, 11, "S2"); b.p("contact_no", 8, 11, "KM1", { num: "13-14" }); b.p("bobine", 2, 18, "KM1");
    b.f([2, 7], [2, 8]).f([2, 8], [8, 8]).f([8, 14], [2, 14]).f([2, 14], [2, 15]);
    return b.s;
  }
  function aideThermique() {
    const b = plan("aide");
    b.p("alim", 2, -2, "", { pot: "L" }); b.p("fusible", 2, 4, "F2"); b.p("contact_th_nf", 2, 11, "F1", { num: "95-96" }); b.p("bp_nf", 2, 18, "S1");
    b.f([2, 0], [2, 1]).f([2, 7], [2, 8]).f([2, 14], [2, 15]);
    return b.s;
  }
  function aideSignal() {
    const b = plan("aide");
    b.p("contact_th_no", 2, 4, "F1", { num: "97-98" }); b.p("voyant", 2, 11, "H2", { couleur: "orange" });
    b.p("contact_no", 10, 4, "KM1", { num: "43-44" }); b.p("voyant", 10, 11, "H1", { couleur: "vert" });
    b.f([2, 7], [2, 8]).f([10, 7], [10, 8]).f([2, 1], [2, 0], [10, 0], [10, 1]);
    return b.s;
  }
  function aideVerrou() {
    const b = plan("aide");
    b.p("bp_no", 2, 4, "S2"); b.p("contact_nf", 2, 11, "KM2", { num: "21-22" }); b.p("bobine", 2, 18, "KM1");
    b.p("bp_no", 12, 4, "S3"); b.p("contact_nf", 12, 11, "KM1", { num: "21-22" }); b.p("bobine", 12, 18, "KM2");
    b.f([2, 7], [2, 8]).f([2, 14], [2, 15]).f([12, 7], [12, 8]).f([12, 14], [12, 15]);
    return b.s;
  }

  /* ---------- les défis ---------- */
  const MA = (b) => { puissanceDirecte(b); };
  const DEFIS = [
    { id: "d1-lampe", titre: "Allume la lampe", niveau: 1,
      resume: "Câbler un bouton poussoir et un voyant.",
      consigne: "<p>Relie les symboles par des fils pour que <b>H1 s'allume tant qu'on appuie sur S1</b>, et s'éteigne quand on lâche.</p><p class=\"discret\">Le courant part de <b>L</b>, passe par le fusible <b>F1</b>, le bouton <b>S1</b>, le voyant <b>H1</b>, et revient au neutre <b>N</b>. Pour tirer un fil : glisse d'une borne à une autre.</p>",
      indice: "Un seul chemin, sans raccourci : L → F1 → S1 → H1 → N. Les ronds orange montrent les bornes encore libres.",
      depart() {
        const b = plan("Défi 1 · Allume la lampe");
        b.p("alim", 6, 1, "", { pot: "L" }); b.p("fusible", 6, 7, "F1", { cal: 2 });
        b.p("bp_no", 16, 14, "S1", { num: "13-14" }); b.p("voyant", 16, 24, "H1", { couleur: "vert" });
        b.p("alim", 6, 31, "", { pot: "N" });
        b.f([6, 3], [6, 4]);
        return b.s;
      },
      exige: { S1: "bouton", H1: "voyant" },
      etapes: [
        { texte: "Au repos, H1 est éteint", verifier: { H1: false }, si: "H1 est allumé alors que personne n'appuie : S1 n'est pas sur le chemin du courant de H1, ou un fil le contourne." },
        { texte: "J'appuie sur S1 : H1 s'allume", faire: [["appuyer", "S1"]], verifier: { H1: true }, si: "H1 ne s'allume pas. Suis le courant : L → F1 → S1 → H1 → N. Chaque borne doit avoir son fil (plus de rond orange)." },
        { texte: "Je lâche S1 : H1 s'éteint", faire: [["relacher", "S1"]], verifier: { H1: false }, si: "H1 reste allumé quand tu lâches S1 : S1 doit être en série avec H1." }
      ] },
    { id: "d2-maintien", titre: "Câble l'auto-maintien", niveau: 2,
      resume: "Le moteur doit rester en marche quand on lâche S2.",
      consigne: "<p>Pour l'instant, KM1 ne reste collé que tant qu'on appuie sur S2. Ajoute ce qu'il faut pour que <b>le moteur reste en marche quand on lâche S2</b>, et que <b>S1 l'arrête</b>.</p><p class=\"discret\">Dans « Contacteurs et relais », prends un <b>contact à fermeture</b> et donne-lui le repère <b>KM1</b>.</p>",
      indice: "Le contact KM1 13-14 se branche en parallèle sur S2 : quand KM1 colle, il prend le relais de S2.",
      aide: aideMaintien,
      depart() { const b = plan("Défi 2 · L'auto-maintien"); MA(b); commandeMA(b, { sansMaintien: true }); return b.s; },
      exige: { S1: "bouton", S2: "bouton", KM1: "contacteur", M1: "moteur" },
      etapes: [
        { texte: "J'appuie sur S2 : KM1 colle et le moteur tourne", faire: [["appuyer", "S2"]], verifier: { KM1: true, M1: "marche" }, si: "KM1 doit coller quand on appuie sur S2. Ne coupe pas le chemin L → F2 → F1 → S1 → S2 → KM1 → N." },
        { texte: "Je lâche S2 : KM1 reste collé", faire: [["relacher", "S2"]], verifier: { KM1: true }, si: "KM1 retombe quand tu lâches S2. Ajoute un contact KM1 à fermeture (13-14) en parallèle sur S2 : c'est l'auto-maintien." },
        { texte: "J'appuie sur S1 : KM1 retombe, le moteur s'arrête", faire: [["appuyer", "S1"]], verifier: { KM1: false, M1: "arret" }, si: "S1 doit couper KM1 : le contact d'auto-maintien se branche en parallèle sur S2 seulement, sous S1." },
        { texte: "Je lâche S1 : le moteur reste arrêté", faire: [["relacher", "S1"]], verifier: { KM1: false }, si: "Le moteur repart tout seul quand tu lâches S1 : le contact d'auto-maintien ne doit pas contourner S1." }
      ] },
    { id: "d3-thermique", titre: "Le relais thermique coupe la commande", niveau: 2,
      resume: "En cas de surcharge, F1 doit arrêter le moteur.",
      consigne: "<p>Le relais thermique <b>F1</b> surveille le courant du moteur. Quand il déclenche, son contact <b>95-96</b> s'ouvre. Place ce contact pour qu'<b>une surcharge arrête le moteur</b>, et qu'après le réarmement il faille appuyer de nouveau sur S2.</p>",
      indice: "Le contact F1 95-96 (à ouverture) se met en série au début du circuit de commande, juste après le fusible F2, avant S1.",
      aide: aideThermique,
      depart() { const b = plan("Défi 3 · Le relais thermique"); MA(b); commandeMA(b, { sansThermique: true }); return b.s; },
      exige: { S1: "bouton", S2: "bouton", KM1: "contacteur", F1: "thermique" },
      etapes: [
        { texte: "S2 : le moteur se met en marche", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, M1: "marche" }, si: "La marche ne fonctionne plus : vérifie que le chemin L → F2 → … → KM1 → N est complet." },
        { texte: "Surcharge : F1 déclenche, le moteur doit s'arrêter", faire: [["surcharge", "F1"]], verifier: { KM1: false, M1: "arret" }, si: "Le moteur continue de tourner alors que F1 a déclenché. Place le contact F1 95-96 (à ouverture) en série au début du circuit de commande, avant S1." },
        { texte: "Je réarme F1 : le moteur ne repart pas tout seul", faire: [["rearmer", "F1"]], verifier: { KM1: false }, si: "Après le réarmement, le moteur ne doit pas redémarrer tout seul : il faut appuyer sur S2." },
        { texte: "S2 : le moteur repart", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true }, si: "Après le réarmement, S2 doit pouvoir remettre en marche." }
      ] },
    { id: "d4-signal", titre: "Signalisation marche et défaut", niveau: 2,
      resume: "H1 s'allume en marche, H2 quand le relais thermique déclenche.",
      consigne: "<p>Branche les deux voyants :</p><ul><li><b>H1</b> (vert) allumé quand le moteur tourne ;</li><li><b>H2</b> (orange) allumé quand le relais thermique <b>F1</b> a déclenché.</li></ul><p class=\"discret\">Il te faut un contact KM1 à fermeture (43-44) et le contact F1 97-98.</p>",
      indice: "H2 se branche derrière F1 97-98, pris juste après le fusible F2 (avant le contact 95-96, qui s'ouvre au défaut). H1 se branche derrière un contact KM1 à fermeture.",
      aide: aideSignal,
      depart() {
        const b = plan("Défi 4 · Signalisation"); MA(b); commandeMA(b);
        b.p("voyant", 36, 35, "H1", { couleur: "vert" }); b.p("voyant", 44, 35, "H2", { couleur: "orange" });
        return b.s;
      },
      exige: { KM1: "contacteur", F1: "thermique", H1: "voyant", H2: "voyant" },
      etapes: [
        { texte: "Au repos : H1 et H2 éteints", verifier: { H1: false, H2: false }, si: "Au repos, aucun voyant ne doit être allumé : chaque voyant doit passer par un contact à fermeture." },
        { texte: "En marche : H1 allumé, H2 éteint", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, H1: true, H2: false }, si: "Quand KM1 est collé, H1 doit s'allumer : branche H1 derrière un contact KM1 à fermeture (43-44)." },
        { texte: "Surcharge : H1 s'éteint, H2 s'allume", faire: [["surcharge", "F1"]], verifier: { KM1: false, H1: false, H2: true }, si: "Quand F1 a déclenché, H2 doit s'allumer : branche H2 derrière le contact F1 97-98 (à fermeture), alimenté avant le contact 95-96." },
        { texte: "Je réarme F1 : H2 s'éteint", faire: [["rearmer", "F1"]], verifier: { H2: false }, si: "Après le réarmement, H2 doit s'éteindre." }
      ] },
    { id: "d5-verrou", titre: "Ajoute le verrouillage électrique", niveau: 3,
      resume: "KM1 et KM2 ne doivent jamais être fermés ensemble.",
      consigne: "<p>Ce schéma d'inversion du sens de marche est <b>dangereux</b> : si on appuie sur S3 pendant que KM1 est collé, KM2 colle aussi et les phases L1 et L3 se touchent. Ajoute le <b>verrouillage électrique</b> : KM2 ne peut pas coller quand KM1 est collé, et inversement.</p><p class=\"discret\">Essaie d'abord en simulation : appuie sur S2, puis sur S3.</p>",
      indice: "Un contact KM2 à ouverture (21-22) en série avec la bobine KM1, et un contact KM1 à ouverture en série avec la bobine KM2.",
      aide: aideVerrou,
      depart() { return Object.assign(inversion(false), { titre: "Défi 5 · Le verrouillage électrique" }); },
      exige: { S1: "bouton", S2: "bouton", S3: "bouton", KM1: "contacteur", KM2: "contacteur", M1: "moteur" },
      etapes: [
        { texte: "S2 : KM1 colle, le moteur tourne dans le sens 1", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, KM2: false, M1: "sens1" }, si: "S2 doit faire coller KM1 (et lui seul), le moteur tourne alors dans le sens 1." },
        { texte: "S3 alors que KM1 est collé : KM2 ne colle pas", faire: [["appuyer", "S3"]], verifier: { KM2: false, court: false }, si: "KM2 s'est fermé alors que KM1 était fermé : court-circuit entre phases ! Mets un contact KM1 à ouverture (21-22) en série avec la bobine KM2." },
        { texte: "S1 : tout s'arrête", faire: [["relacher", "S3"], ["appuyer", "S1"], ["relacher", "S1"]], verifier: { KM1: false, KM2: false }, si: "S1 doit tout arrêter." },
        { texte: "S3 : KM2 colle, le moteur tourne dans le sens 2", faire: [["appuyer", "S3"], ["relacher", "S3"]], verifier: { KM2: true, M1: "sens2" }, si: "S3 doit faire coller KM2 : vérifie que son contact de verrouillage est bien un contact KM1 à ouverture." },
        { texte: "S2 alors que KM2 est collé : KM1 ne colle pas", faire: [["appuyer", "S2"]], verifier: { KM1: false, court: false }, si: "KM1 s'est fermé alors que KM2 était fermé : mets un contact KM2 à ouverture (21-22) en série avec la bobine KM1." },
        { texte: "S1 : tout s'arrête", faire: [["relacher", "S2"], ["appuyer", "S1"], ["relacher", "S1"]], verifier: { KM1: false, KM2: false }, si: "S1 doit tout arrêter." }
      ] },
    { id: "d6-puissance", titre: "Câble le circuit de puissance", niveau: 3,
      resume: "Du réseau au moteur, en passant par Q1, KM1 et F1.",
      consigne: "<p>La commande est déjà câblée. Câble la <b>puissance</b> : chaque phase du réseau passe par <b>Q1</b>, puis <b>KM1</b>, puis <b>F1</b>, et arrive au moteur. Le moteur doit tourner dans le <b>sens 1</b> (L1 → U, L2 → V, L3 → W), et sa carcasse doit être reliée à la <b>terre</b>.</p>",
      indice: "Trois fils parallèles, sans croiser les phases : 1-3-5 en haut de chaque appareil, 2-4-6 en bas. La borne PE du moteur va au PE du réseau.",
      depart() { const b = plan("Défi 6 · Le circuit de puissance"); puissanceDirecte(b, false); commandeMA(b); return b.s; },
      exige: { Q1: "sectionneur", KM1: "contacteur", F1: "thermique", M1: "moteur", S1: "bouton", S2: "bouton" },
      etapes: [
        { texte: "Au repos, le moteur est arrêté", verifier: { M1: "arret" }, si: "Le moteur tourne alors que KM1 est ouvert : ses bornes ne doivent recevoir le réseau qu'à travers les pôles de KM1." },
        { texte: "S2 : le moteur tourne dans le sens 1", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { M1: "sens1" }, si: "Quand KM1 colle, le moteur doit recevoir les trois phases dans l'ordre : L1 → U, L2 → V, L3 → W, en passant par Q1, KM1 et F1." },
        { texte: "Le courant du moteur traverse Q1 et F1", protege: [["Q1", "M1"], ["F1", "M1"]], si: "Chaque phase doit traverser le sectionneur Q1 (il protège avec ses fusibles) et le relais thermique F1 (il surveille le courant)." },
        { texte: "La carcasse du moteur est à la terre", terre: ["M1"], si: "Relie la borne PE du moteur à la borne PE du réseau : c'est le fil vert et jaune qui protège les personnes." },
        { texte: "S1 : le moteur s'arrête", faire: [["appuyer", "S1"], ["relacher", "S1"]], verifier: { M1: "arret" }, si: "Quand KM1 retombe, le moteur doit s'arrêter : les trois phases doivent passer par les pôles de KM1." }
      ] }
  ];

  const API = { EXEMPLES, DEFIS, inversion, plan };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasExemples = API;
})(typeof window !== "undefined" ? window : globalThis);
