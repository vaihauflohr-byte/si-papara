/* =====================================================================
   Terminale SI — Séquence 12 (Comportement et IA) et Séquence 13 (Signal et transmission)
   Sources : cours du professeur — diagrammes états-transitions, TD algorithmie,
   TD IA robot DINO, filtrage, série de Fourier, modulations numériques.
   ===================================================================== */
(function () {
  const nb = SIP.nb;
  const nu = (h) => String(h).replace(/<[^>]+>/g, "");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const code = (...l) => `<pre style="text-align:left;background:var(--accent-doux);border-radius:8px;padding:8px 10px;margin:8px 0;overflow-x:auto;font-size:.88rem;line-height:1.4">${esc(l.join("\n"))}</pre>`;
  const tab = (tetes, lignes) => `<table><tr>${tetes.map((h) => `<th>${h}</th>`).join("")}</tr>${lignes.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  // QCM : bonne réponse en premier, distracteurs dédoublonnés (4 choix au plus)
  const qcm = (enonce, bonne, faux, explication) => {
    const choix = [bonne], vus = new Set([nu(bonne)]);
    for (const f of faux) { const k = nu(f); if (!vus.has(k) && choix.length < 4) { vus.add(k); choix.push(f); } }
    return { type: "qcm", enonce, choix, bonne: 0, explication };
  };
  // Liste de cas [situation, bonne réponse, explication?] → QCM dont les distracteurs sont les autres réponses de la liste
  const qcmListe = (r, liste, question) => {
    const it = r.pick(liste);
    const faux = r.melange([...new Set(liste.map((x) => x[1]))].filter((t) => t !== it[1]));
    return qcm(question(it[0]), it[1], faux, it[2] || `${it[0]} → <b>${it[1]}</b>.`);
  };
  const par = (v) => (v < 0 ? `(${nb(v)})` : nb(v));
  const arr = (x) => Math.round(x * 1000) / 1000;
  const bitsAlea = (r, n) => { let b; do { b = Array.from({ length: n }, () => r.pick(["0", "1"])).join(""); } while (!/0/.test(b) || !/1/.test(b)); return b; };
  const fHz = (f) => (f >= 1e9 ? `${nb(f / 1e9)} GHz` : f >= 1e6 ? `${nb(f / 1e6)} MHz` : f >= 1e3 ? `${nb(f / 1e3)} kHz` : `${nb(f)} Hz`);
  const fR = (R) => (R >= 1000 ? `${nb(R / 1000)} kΩ` : `${nb(R)} Ω`);
  const fC = (C) => (C >= 1e-6 ? `${nb(C * 1e6)} µF` : `${nb(C * 1e9)} nF`);
  const fT = (t) => (t >= 1e-3 ? `${nb(t * 1e3, 2)} ms` : `${nb(t * 1e6, 2)} µs`);
  const fD = (D) => (D >= 1e6 ? `${nb(D / 1e6)} Mbit/s` : D >= 1e3 ? `${nb(D / 1e3)} kbit/s` : `${nb(D)} bit/s`);

  /* =================== S12 · Diagrammes d'états-transitions =================== */
  // Automates décrits par un tableau de transitions : [source(s), événement, cible, effet?]
  const AUTOS = [
    { nom: "Tourniquet de métro", init: "Verrouillé", etats: ["Verrouillé", "Déverrouillé", "Alarme", "Maintenance"], tr: [
      ["Verrouillé", "ticket_valide", "Déverrouillé"],
      ["Déverrouillé", "ticket_valide", "Déverrouillé", "rendre_ticket"],
      ["Déverrouillé", "passage", "Verrouillé"],
      ["Verrouillé", "passage_forcé", "Alarme"],
      ["Alarme", "reset", "Verrouillé"],
      ["Verrouillé", "clé_maintenance", "Maintenance"],
      ["Maintenance", "clé_maintenance", "Verrouillé"]] },
    { nom: "Portail automatique", init: "Fermé", etats: ["Fermé", "Ouverture", "Ouvert", "Fermeture"], tr: [
      ["Fermé", "bip", "Ouverture"],
      ["Ouverture", "fdc_ouvert", "Ouvert"],
      ["Ouvert", "after(30 s)", "Fermeture"],
      ["Ouvert", "bip", "Fermeture"],
      ["Fermeture", "fdc_fermé", "Fermé"],
      ["Fermeture", "obstacle", "Ouverture", "bip_sonore"],
      ["Fermeture", "bip", "Ouverture"]] },
    { nom: "Alarme de maison intelligente", init: "Désarmée", etats: ["Désarmée", "Armée", "Pré-alarme", "Sirène"], tr: [
      ["Désarmée", "code_ok", "Armée"],
      [["Armée", "Pré-alarme", "Sirène"], "code_ok", "Désarmée"],
      ["Armée", "détection", "Pré-alarme"],
      ["Pré-alarme", "after(30 s)", "Sirène", "envoyer_SMS"],
      [["Désarmée", "Armée"], "panique", "Sirène"]] },
    { nom: "Robot sumo", init: "RECHERCHE", etats: ["RECHERCHE", "ATTAQUE", "RECUL", "ARRET"], tr: [
      ["RECHERCHE", "adversaire_vu", "ATTAQUE"],
      ["ATTAQUE", "adversaire_perdu", "RECHERCHE"],
      [["RECHERCHE", "ATTAQUE"], "ligne_blanche", "RECUL"],
      ["RECUL", "after(400 ms)", "RECHERCHE"],
      [["RECHERCHE", "ATTAQUE", "RECUL"], "arrêt_urgence", "ARRET"]] },
    { nom: "Machine à café", init: "Veille", etats: ["Veille", "Chauffe", "Prêt", "Préparation"], tr: [
      ["Veille", "marche", "Chauffe"],
      ["Chauffe", "when(T ≥ 90 °C)", "Prêt"],
      ["Prêt", "café", "Préparation"],
      ["Préparation", "after(25 s)", "Prêt"],
      [["Chauffe", "Prêt"], "marche", "Veille"]] }
  ];
  const srcs = (t) => (Array.isArray(t[0]) ? t[0] : [t[0]]);
  const evts = (A) => [...new Set(A.tr.map((t) => t[1]))];
  const suivant = (A, e, ev) => { const t = A.tr.find((u) => srcs(u).includes(e) && u[1] === ev); return t ? t[2] : null; };
  const trace = (A, seq) => { let e = A.init; const pas = seq.map((ev) => { const c = suivant(A, e, ev), p = { ev, de: e, vers: c === null ? e : c, ign: c === null }; e = p.vers; return p; }); return { fin: e, pas }; };
  const tirerSeq = (r, A, n) => {
    let e = A.init; const seq = [];
    for (let k = 0; k < n; k++) {
      const poss = A.tr.filter((t) => srcs(t).includes(e));
      const ev = poss.length && r.int(1, 100) <= 75 ? r.pick(poss)[1] : r.pick(evts(A));
      seq.push(ev); e = suivant(A, e, ev) || e;
    }
    return seq;
  };
  const tableAuto = (A) => tab(["État source", "Événement / effet", "État cible"], A.tr.map((t) => [srcs(t).join(" ou "), t[1] + (t[3] ? " / " + t[3] : ""), t[2]]));
  const intro = (A) => `<b>${A.nom}</b> — état initial : <b>${A.init}</b>. Un événement non prévu dans l'état actif est ignoré.${tableAuto(A)}`;
  const seqTxt = (seq) => seq.map((s) => `<b>${s}</b>`).join(" → ");
  const traceTxt = (A, t) => A.init + t.pas.map((p) => (p.ign ? ` · ${p.ev} : ignoré` : ` · ${p.ev} → <b>${p.vers}</b>`)).join("");

  const GARDES = [
    { sys: "Robot aspirateur", S: "Veille", C: "Nettoyage", ev: "départ", g: "batterie &gt; 20 %", v: (r) => r.pas(5, 60, 5), ok: (x) => x > 20, txt: (x) => `batterie = ${x} %` },
    { sys: "Serre automatique", S: "Ventilation arrêtée", C: "Ventilation en marche", ev: "mesure", g: "T &gt; 28 °C", v: (r) => r.int(24, 32), ok: (x) => x > 28, txt: (x) => `T = ${x} °C` },
    { sys: "Four (consigne 200 °C)", S: "Maintien", C: "Chauffe", ev: "mesure", g: "T ≤ 195 °C", v: (r) => r.int(190, 200), ok: (x) => x <= 195, txt: (x) => `T = ${x} °C` },
    { sys: "Portail", S: "Fermé", C: "Ouverture", ev: "bip", g: "badge_autorisé", v: (r) => r.int(0, 1), ok: (x) => x === 1, txt: (x) => `badge_autorisé = ${x ? "vrai" : "faux"}` },
    { sys: "Distributeur de boissons", S: "Attente", C: "Préparation", ev: "choix", g: "crédit ≥ 1,50 €", v: (r) => r.pas(0.5, 2.5, 0.1), ok: (x) => x >= 1.5 - 1e-9, txt: (x) => `crédit = ${x.toFixed(2).replace(".", ",")} €` }
  ];
  const ORDRES = [
    { sys: "Portail", S: "Ouverture", ex: "couper_moteur", ev: "fdc_ouvert", eff: "bip_sonore", C: "Ouvert", en: "lancer_tempo" },
    { sys: "Four", S: "Chauffe", ex: "couper_résistance", ev: "when(T ≥ 200 °C)", eff: "allumer_voyant", C: "Maintien", en: "afficher_prêt" },
    { sys: "Robot sumo", S: "ATTAQUE", ex: "stopper_moteurs", ev: "ligne_blanche", eff: "compter_bordure", C: "RECUL", en: "moteurs_arrière" },
    { sys: "Ascenseur", S: "Montée", ex: "arrêter_moteur", ev: "capteur_étage", eff: "sonner", C: "Portes ouvertes", en: "ouvrir_portes" }
  ];
  const ETIQ = [
    { S: "Fermé", C: "Ouverture", ev: "bip", g: "badge_autorisé", ef: "allumer_gyrophare" },
    { S: "Armée", C: "Pré-alarme", ev: "détection", g: "porte_ouverte", ef: "enregistrer_heure" },
    { S: "Attente", C: "Préparation", ev: "choix", g: "crédit ≥ 1,50 €", ef: "rendre_monnaie" },
    { S: "Ventilation arrêtée", C: "Ventilation en marche", ev: "mesure", g: "T &gt; 28 °C", ef: "ouvrir_ventelles" },
    { S: "RECHERCHE", C: "ATTAQUE", ev: "mesure_distance", g: "d &lt; 300 mm", ef: "allumer_LED" }
  ];
  const TYPES_EVT = (() => {
    const T = "Time event (temporel)", Ch = "Change event (changement de valeur)", S = "Signal event (arrivée d'un message)", Ca = "Call event (appel de fonction)";
    const eT = "after(durée) compte le temps depuis l'entrée dans l'état, at(heure) vise un instant absolu : time event.";
    const eC = "when(…) : une valeur a changé de telle sorte que la condition devient vraie : change event.";
    const eS = "Arrivée d'un message : signal event.", eA = "Requête d'appel de fonction, un retour est attendu : call event.";
    return [["after(2 s)", T, eT], ["at(12:00)", T, eT], ["after(30 s)", T, eT], ["at(22:30)", T, eT],
      ["when(compteur = 2)", Ch, eC], ["when(T ≥ 90 °C)", Ch, eC], ["when(batterie ≤ 20 %)", Ch, eC],
      ["bip (message reçu de la télécommande)", S, eS], ["trame_reçue (message arrivé par le réseau)", S, eS],
      ["lireCapteur(3) (appel de fonction, retour attendu)", Ca, eA], ["calculerTrajet(départ, arrivée)", Ca, eA]];
  })();
  const VOC_BASES = [
    ["État dans lequel se trouve le système au départ (mise sous énergie)", "État initial"],
    ["État correspondant à la fin du fonctionnement ou à la destruction de l'objet", "État final"],
    ["Expression booléenne qui autorise ou non le passage d'un état à un autre", "Condition de garde"],
    ["Transition qui entraîne une sortie puis une nouvelle entrée dans le même état", "Transition réflexive"],
    ["Action exécutée dès l'entrée dans l'état (initialisations)", "entry"],
    ["Activité exécutée tant que le système se trouve dans l'état", "do"],
    ["Action exécutée à la sortie de l'état", "exit"],
    ["Connexion unidirectionnelle d'un état source vers un état cible", "Transition"]
  ];
  const VOC_COMPO = [
    ["État qui englobe plusieurs sous-états (super-état)", "État composite"],
    ["État qui permet de réaliser plusieurs opérations en parallèle", "État orthogonal"],
    ["Pseudo-état qui possède une entrée et au moins deux sorties", "Point de décision"],
    ["Cercle plein qui permet de partager des segments de transition", "Point de jonction"],
    ["Élément qui active deux états à partir d'un état antérieur", "Bifurcation"],
    ["Élément qui active un état à partir de deux états précédents", "Union"]
  ];
  const COMPOS = [
    { sys: "Portail", avant: "Fermé", entrer: "bip", sup: "En mouvement", sous: ["Ouverture", "Fermeture"], ext: "arrêt_urgence", cible: "Arrêt d'urgence" },
    { sys: "Lave-linge", avant: "Attente", entrer: "départ", sup: "Cycle", sous: ["Lavage", "Rinçage", "Essorage"], ext: "annulation", cible: "Vidange" },
    { sys: "Robot sumo", avant: "Attente départ", entrer: "after(5 s)", sup: "Combat", sous: ["RECHERCHE", "ATTAQUE", "RECUL"], ext: "arrêt_urgence", cible: "ARRET" }
  ];
  const feu = (r) => { const v = r.pick([20, 25, 30]), o = r.pick([3, 4, 5]), rg = r.pick([20, 25, 30]); return { v, o, rg, T: v + o + rg, t: tab(["État source", "Événement", "État cible"], [["Vert", `after(${v} s)`, "Orange"], ["Orange", `after(${o} s)`, "Rouge"], ["Rouge", `after(${rg} s)`, "Vert"]]) }; };

  SIP.definirModule({
    id: "tsi-s12-etats",
    niveaux: ["TSI"],
    sequence: "S12 · Comportement et IA",
    titre: "Diagrammes d'états-transitions (SysML)",
    description: "États, transitions, événements, gardes et actions entry/do/exit : lire un diagramme stm et simuler une séquence d'événements.",
    competences: ["A5", "M4", "M5"],
    nbQuestions: 10,
    questions: [
      // --- simulation d'automates (tableaux de transitions) ---
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const A = r.pick(AUTOS), seq = tirerSeq(r, A, r.int(3, 5)), t = trace(A, seq);
          return { type: "qcm", enonce: `${intro(A)}Séquence d'événements : ${seqTxt(seq)}. Dans quel état se trouve le système ?`, choix: A.etats.slice(), bonne: A.etats.indexOf(t.fin), explication: `Trace depuis l'état initial : ${traceTxt(A, t)}. État final : <b>${t.fin}</b>.` }; } },
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const A = r.pick(AUTOS), seq = tirerSeq(r, A, r.int(4, 6)), t = trace(A, seq), n = t.pas.filter((p) => !p.ign).length;
          return { enonce: `${intro(A)}Séquence : ${seqTxt(seq)}. Combien de transitions sont franchies (transitions réflexives comprises) ?`, reponse: n, absolu: 0.4, unite: "", explication: `${traceTxt(A, t)}. Soit ${n} transition(s) franchie(s) : un événement ignoré ne franchit rien.` }; } },
      { fiche: "tsi-s12-et-actions", gen: (r) => { const A = r.pick(AUTOS), seq = tirerSeq(r, A, r.int(4, 6)), t = trace(A, seq); const cibles = t.pas.filter((p) => !p.ign).map((p) => p.vers);
          const X = cibles.length && r.int(0, 3) ? r.pick(cibles) : r.pick(A.etats), n = cibles.filter((c) => c === X).length;
          return { enonce: `${intro(A)}Séquence : ${seqTxt(seq)}. Pendant cette séquence, combien de fois l'action <b>entry</b> de l'état <b>${X}</b> est-elle exécutée ?`, reponse: n, absolu: 0.4, unite: "", explication: `entry s'exécute à chaque entrée dans l'état, y compris par une transition réflexive. ${traceTxt(A, t)} → ${n} entrée(s) dans ${X}.` }; } },
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const A = r.pick(AUTOS); let s0, f0; do { s0 = tirerSeq(r, A, 3); f0 = trace(A, s0).fin; } while (f0 === A.init && r.int(0, 3));
          const faux = [], vus = new Set([s0.join()]);
          for (let k = 0; k < 500 && faux.length < 3; k++) { const s = tirerSeq(r, A, 3); if (!vus.has(s.join()) && trace(A, s).fin !== f0) { vus.add(s.join()); faux.push(s); } }
          return qcm(`${intro(A)}Quelle séquence amène le système de <b>${A.init}</b> à l'état <b>${f0}</b> ?`, seqTxt(s0), faux.map(seqTxt), `${traceTxt(A, trace(A, s0))}. Les autres séquences mènent à : ${faux.map((s) => trace(A, s).fin).join(", ")}.`); } },
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const A = r.pick(AUTOS), t = r.pick(A.tr.filter((u) => !srcs(u).includes(u[2]))), X = r.pick(srcs(t)), Y = t[2];
          const ok = A.tr.filter((u) => srcs(u).includes(X) && u[2] === Y).map((u) => u[1]);
          return qcm(`${intro(A)}Quel événement fait passer le système de <b>${X}</b> à <b>${Y}</b> ?`, t[1], r.melange(evts(A).filter((e) => !ok.includes(e))), `Ligne « ${X} | ${t[1]} | ${Y} » du tableau des transitions.`); } },
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const A = r.pick(AUTOS), X = r.pick(A.etats); const geres = A.tr.filter((t) => srcs(t).includes(X)).map((t) => t[1]), nonG = evts(A).filter((e) => !geres.includes(e));
          const ev = (nonG.length && r.int(0, 1)) || !geres.length ? r.pick(nonG) : r.pick(geres), c = suivant(A, X, ev), fin = c === null ? X : c;
          return { type: "qcm", enonce: `${intro(A)}Le système est dans l'état <b>${X}</b>. L'événement <b>${ev}</b> survient. Quel est l'état actif ensuite ?`, choix: A.etats.slice(), bonne: A.etats.indexOf(fin),
            explication: c === null ? `Aucune transition ne part de ${X} avec ${ev} : l'événement est ignoré, le système reste dans <b>${X}</b>.` : `La ligne « ${X} | ${ev} | ${c} » s'applique : passage dans <b>${c}</b>${c === X ? " (transition réflexive : exit puis entry)" : ""}.` }; } },
      { fiche: "tsi-s12-et-lecture", gen: (r) => { const n = r.pick([139, 180, 250, 420, 480, 520, 610, 868]), d = r.pick([60, 120, 250, 290, 310, 450, 700]); const e = n > 503 ? "RECUL" : d < 300 ? "ATTAQUE" : "RECHERCHE";
          return { type: "qcm", enonce: `Programme du robot sumo, traduction de son diagramme d'états :${code("SEUIL_LIGNE = 503", "PORTEE = 300", "if n > SEUIL_LIGNE:", '    etat = "RECUL"', "elif d < PORTEE:", '    etat = "ATTAQUE"', "else:", '    etat = "RECHERCHE"')}Mesures : <b>n = ${n}</b> (capteur de ligne), <b>d = ${d} mm</b>. Valeur de etat ?`, choix: ["RECUL", "ATTAQUE", "RECHERCHE", "ARRET"], bonne: ["RECUL", "ATTAQUE", "RECHERCHE"].indexOf(e),
            explication: n > 503 ? `n = ${n} &gt; 503 : bordure détectée, test prioritaire (if) → RECUL, même si d = ${d} mm.` : `n = ${n} ≤ 503 : pas de bordure ; ${d < 300 ? `d = ${d} &lt; 300 mm → ATTAQUE` : `d = ${d} ≥ 300 mm → RECHERCHE`}.` }; } },
      // --- transitions, événements, gardes ---
      { fiche: "tsi-s12-et-transitions", gen: (r) => { const F = feu(r); let t, m; do { t = r.int(3, 3 * F.T); m = t % F.T; } while (m === 0 || m === F.v || m === F.v + F.o);
          const c = m < F.v ? "Vert" : m < F.v + F.o ? "Orange" : "Rouge";
          return { type: "qcm", enonce: `Feu tricolore (cycle infini) :${F.t}Le feu passe au vert à t = 0. Quelle est sa couleur à <b>t = ${t} s</b> ?`, choix: ["Vert", "Orange", "Rouge", "Orange clignotant"], bonne: ["Vert", "Orange", "Rouge"].indexOf(c),
            explication: `Cycle : T = ${F.v} + ${F.o} + ${F.rg} = ${F.T} s. t = ${t} s = ${Math.floor(t / F.T)} cycle(s) + ${m} s ; or de 0 à ${F.v} s : vert, de ${F.v} à ${F.v + F.o} s : orange, de ${F.v + F.o} à ${F.T} s : rouge → <b>${c}</b>.` }; } },
      { fiche: "tsi-s12-et-transitions", gen: (r) => { const F = feu(r), k = r.int(2, 5), t = (k - 1) * F.T + F.v + F.o;
          return { enonce: `Feu tricolore (cycle infini) :${F.t}Le feu passe au vert à t = 0. À quel instant passe-t-il au rouge pour la <b>${k}<sup>e</sup> fois</b> ?`, reponse: t, unite: "s", absolu: 0.5, explication: `1<sup>er</sup> passage au rouge à ${F.v} + ${F.o} = ${F.v + F.o} s, puis tous les T = ${F.T} s : t = ${F.v + F.o} + ${k - 1} × ${F.T} = ${t} s.` }; } },
      { fiche: "tsi-s12-et-transitions", gen: (r) => { const G = r.pick(GARDES), x = G.v(r), ok = G.ok(x);
          return { type: "qcm", enonce: `<b>${G.sys}</b> : transition ${G.S} → ${G.C} étiquetée « <b>${G.ev} [${G.g}]</b> ». Le système est dans ${G.S} ; ${G.ev} survient alors que <b>${G.txt(x)}</b>. Que se passe-t-il ?`,
            choix: [`La transition est franchie : passage dans ${G.C}`, `La garde est fausse : le système reste dans ${G.S}`, `Le système passera dans ${G.C} dès que la garde deviendra vraie, sans nouvel événement`, "Le système passe dans un état d'erreur"], bonne: ok ? 0 : 1,
            explication: `La garde [${G.g}] est ${ok ? "vraie" : "fausse"} (${G.txt(x)}). ${ok ? `L'événement ${G.ev} déclenche donc la transition vers ${G.C}.` : `La transition n'est pas franchie et l'événement est perdu : il faudra un nouvel événement ${G.ev} avec une garde vraie.`}` }; } },
      { fiche: "tsi-s12-et-transitions", gen: (r) => { let X; do { X = r.pas(10, 70, 2); } while (X === 30); const s = Math.max(0, X - 30);
          return { enonce: `Alarme : Armée → Pré-alarme sur <b>détection</b> ; Pré-alarme → Sirène sur <b>after(30 s)</b> ; code_ok ramène en Désarmée depuis Pré-alarme ou Sirène. Un intrus est détecté à t = 0, le bon code est saisi à <b>t = ${X} s</b>. Pendant combien de secondes la sirène a-t-elle sonné ?`, reponse: s, unite: "s", absolu: 0.5,
            explication: X < 30 ? `Le code arrive à ${X} s, avant la fin des 30 s passées en Pré-alarme : after(30 s) ne se produit jamais → 0 s de sirène.` : `after(30 s) fait passer en Sirène à t = 30 s ; code_ok à ${X} s ramène en Désarmée → ${X} − 30 = ${s} s de sirène.` }; } },
      { fiche: "tsi-s12-et-transitions", gen: (r) => { const E = r.pick(ETIQ), q = r.int(0, 2); const parts = ["l'événement déclencheur", "la condition de garde", "l'effet (action exécutée pendant la transition)"], rep = [E.ev, E.g, E.ef];
          return qcm(`Transition de <b>${E.S}</b> vers <b>${E.C}</b> étiquetée « ${E.ev} [${E.g}] / ${E.ef} ». Quel est ${parts[q]} ?`, rep[q], r.melange(rep.filter((x, k) => k !== q).concat([E.C])), `Syntaxe : événement [condition de garde] / effet → ${parts[q]} est « ${rep[q]} ».`); } },
      { fiche: "tsi-s12-et-transitions", gen: (r) => qcmListe(r, TYPES_EVT, (x) => `Une transition est déclenchée par « <b>${x}</b> ». De quel type d'événement s'agit-il ?`) },
      // --- actions entry / do / exit ---
      { fiche: "tsi-s12-et-actions", gen: (r) => { const O = r.pick(ORDRES);
          return qcm(`<b>${O.sys}</b> : l'état ${O.S} possède « exit / ${O.ex} ». La transition « ${O.ev} / ${O.eff} » mène à ${O.C}, qui possède « entry / ${O.en} ». Dans quel ordre ces actions s'exécutent-elles ?`, `${O.ex} → ${O.eff} → ${O.en}`, [`${O.eff} → ${O.ex} → ${O.en}`, `${O.en} → ${O.eff} → ${O.ex}`, `${O.ex} → ${O.en} → ${O.eff}`], "On quitte d'abord l'état source (exit), on exécute l'effet porté par la transition, puis on entre dans l'état cible (entry), dont l'activité do démarre ensuite."); } },
      // --- vocabulaire, composites ---
      { fiche: "tsi-s12-et-bases", gen: (r) => qcmListe(r, VOC_BASES, (x) => `« ${x} » : de quel élément du diagramme d'états s'agit-il ?`) },
      { fiche: "tsi-s12-et-composite", gen: (r) => qcmListe(r, VOC_COMPO, (x) => `« ${x} » : de quel élément s'agit-il ?`) },
      { fiche: "tsi-s12-et-composite", gen: (r) => { const K = r.pick(COMPOS);
          const desc = `<b>${K.sys}</b> : le super-état <b>${K.sup}</b> contient ${K.sous.join(", ")} (sous-état initial : ${K.sous[0]}). ${K.avant} → ${K.sup} sur <b>${K.entrer}</b> ; une flèche part du <b>bord</b> de ${K.sup} vers ${K.cible} sur <b>${K.ext}</b>.`;
          if (r.int(0, 2)) { const X = r.pick(K.sous);
            return qcm(`${desc} Le système est dans ${X}. ${K.ext} survient. Quel est l'état actif ?`, K.cible, [`${X} (${K.ext} ne concerne que le super-état)`, K.sous.find((s) => s !== X), K.avant], `Une transition qui part du bord d'un état composite s'applique quel que soit le sous-état actif : ${X} est quitté → <b>${K.cible}</b>.`); }
          return qcm(`${desc} Le système est dans ${K.avant}. ${K.entrer} survient. Qu'est-ce qui devient actif ?`, `${K.sup}, dans son sous-état ${K.sous[0]}`, [`${K.sup}, dans son sous-état ${K.sous[1]}`, `${K.sup} seul, sans aucun sous-état actif`, `Tous les sous-états de ${K.sup} en même temps`], `Entrer dans un état composite active son sous-état initial : ${K.sup} / ${K.sous[0]}.`); } },
      { fiche: "tsi-s12-et-composite", gen: (r) => { const E = ["froid", "chaud", "présence", "absence"], seq = Array.from({ length: r.int(3, 5) }, () => r.pick(E)); let ch = "Arrêt", ec = "Éteint";
          seq.forEach((e) => { if (e === "froid" && ch === "Arrêt") ch = "Marche"; else if (e === "chaud" && ch === "Marche") ch = "Arrêt"; else if (e === "présence" && ec === "Éteint") ec = "Allumé"; else if (e === "absence" && ec === "Allumé") ec = "Éteint"; });
          const c = (a, b) => `Chauffage : ${a} · Éclairage : ${b}`, tous = [c("Arrêt", "Éteint"), c("Arrêt", "Allumé"), c("Marche", "Éteint"), c("Marche", "Allumé")];
          return { type: "qcm", enonce: `Maison intelligente : l'état orthogonal « Confort » a deux régions qui évoluent en parallèle.${tab(["Région", "Transitions"], [["Chauffage", "Arrêt → Marche sur froid ; Marche → Arrêt sur chaud"], ["Éclairage", "Éteint → Allumé sur présence ; Allumé → Éteint sur absence"]])}Départ : Arrêt et Éteint. Séquence : ${seqTxt(seq)}. États actifs à la fin ?`, choix: tous, bonne: tous.indexOf(c(ch, ec)),
            explication: `Chaque région évolue indépendamment de l'autre : chauffage → ${ch}, éclairage → ${ec}. Un état orthogonal a un état actif dans chaque région.` }; } },
      // --- QCM fixes ---
      { type: "qcm", fiche: "tsi-s12-et-bases", enonce: "En SysML, le diagramme d'états-transitions (stm, <i>State Machine Diagram</i>) est un diagramme…", choix: ["Comportemental : il décrit les états successifs selon les événements", "Structurel : il décrit les blocs et leurs liaisons", "D'exigences : il liste les performances attendues", "De contexte : il situe le système dans son environnement"], bonne: 0, explication: "Le stm est un diagramme comportemental : il montre comment le système passe d'état en état en fonction des événements qui lui arrivent." },
      { type: "qcm", fiche: "tsi-s12-et-bases", enonce: "Un état devient <b>actif</b> lorsque…", choix: ["Une transition y mène", "Son activité do se termine", "Tous les autres états sont inactifs", "Sa condition de garde devient vraie"], bonne: 0, explication: "Cours : un état est actif lorsqu'une transition y mène et devient inactif lorsqu'une transition le quitte." },
      { type: "qcm", fiche: "tsi-s12-et-bases", enonce: "Comment représente-t-on l'<b>état initial</b> ?", choix: ["Un disque plein", "Un disque plein entouré d'un cercle", "Un losange", "Une barre épaisse"], bonne: 0, explication: "Disque plein : état initial ; disque plein cerclé : état final ; losange : décision ; barre épaisse : bifurcation ou union." },
      { type: "qcm", fiche: "tsi-s12-et-bases", enonce: "L'<b>état final</b> correspond…", choix: ["À la fin du fonctionnement du système ou à la destruction de l'objet", "À la mise sous énergie du système", "À l'état le plus souvent actif", "Au dernier état écrit dans le tableau des transitions"], bonne: 0, explication: "L'état final marque la fin du fonctionnement ; l'état initial correspond à la mise sous énergie ou à la création de l'objet." },
      { type: "qcm", fiche: "tsi-s12-et-bases", enonce: "Pourquoi un système décrit par un diagramme d'états est-il un système séquentiel <b>à événements discrets</b> ?", choix: ["Sa réaction dépend de son état actuel et d'événements qui surviennent à des instants isolés", "Ses grandeurs varient de façon continue dans le temps", "Il ne possède qu'un seul état", "Il ne traite que des signaux analogiques"], bonne: 0, explication: "Un même événement (bip) produit des effets différents selon l'état (Fermé ou Ouvert) : c'est un système séquentiel ; bip, détection, fin de course… sont des événements ponctuels." },
      { type: "qcm", fiche: "tsi-s12-et-actions", enonce: "L'activité <b>do</b> d'un état est en cours quand une transition externe se déclenche. Que se passe-t-il ?", choix: ["do est interrompue, puis l'action exit de l'état s'exécute", "do se termine d'abord, puis la transition est franchie", "La transition est ignorée tant que do n'est pas finie", "exit n'est pas exécutée puisque do n'est pas finie"], bonne: 0, explication: "Cours : si une transition externe se déclenche pendant do, celle-ci est interrompue et l'action exit de l'état s'exécute." },
      { type: "qcm", fiche: "tsi-s12-et-actions", enonce: "Four : dans l'état « Chauffe », où placer « couper_résistance » pour que la résistance soit coupée quelle que soit la transition qui fait quitter l'état ?", choix: ["exit / couper_résistance", "entry / couper_résistance", "do / couper_résistance", "[couper_résistance] en condition de garde"], bonne: 0, explication: "exit s'exécute à chaque sortie de l'état : c'est l'endroit pour en sortir « proprement »." },
      { type: "qcm", fiche: "tsi-s12-et-actions", enonce: "Une <b>transition réflexive</b> (qui part d'un état et y revient) provoque…", choix: ["La sortie puis une nouvelle entrée dans le même état : exit puis entry", "Aucune action, puisque l'état ne change pas", "Seulement l'action entry", "Le passage à l'état final"], bonne: 0, explication: "Cours : une transition réflexive entraîne une sortie puis une nouvelle entrée dans ce même état." },
      { type: "qcm", fiche: "tsi-s12-et-transitions", enonce: "Que signifie une transition étiquetée « after(2 s) » ?", choix: ["Elle est franchie 2 s après l'entrée dans l'état source", "Elle est franchie à 2 h du matin", "Son franchissement dure 2 s", "L'état cible restera actif pendant 2 s"], bonne: 0, explication: "after(durée) : time event mesuré depuis l'entrée dans l'état ; at(heure) : instant absolu." },
      { type: "qcm", fiche: "tsi-s12-et-transitions", enonce: "Robot sumo : la transition RECUL → RECHERCHE est déclenchée par…", choix: ["Une temporisation : after(400 ms) de recul et de rotation", "Le capteur de ligne (n &gt; 503)", "La distance d &lt; 300 mm", "L'appui sur le bouton de départ"], bonne: 0, explication: "Le retour de RECUL est temporisé (400 ms), il n'est pas conditionné à un capteur." },
      { type: "qcm", fiche: "tsi-s12-et-transitions", enonce: "Laquelle de ces étiquettes ne peut pas <b>déclencher</b> une transition ?", choix: ["moteurs(100, 100) : une commande des moteurs", "when(d &lt; 300 mm)", "after(400 ms)", "ligne_blanche"], bonne: 0, explication: "Une transition est déclenchée par un événement ou une condition, jamais par une action ; une action se place en effet (/ …) ou dans entry, do, exit." },
      { type: "qcm", fiche: "tsi-s12-et-lecture", enonce: "Robot sumo : pourquoi la transition vers RECUL (bordure détectée) est-elle <b>prioritaire</b> sur toutes les autres ?", choix: ["Sortir de l'aire de combat est une défaite immédiate", "Le recul consomme moins d'énergie", "Le capteur de ligne est plus précis que le capteur à ultrasons", "RECUL est l'état initial du robot"], bonne: 0, explication: "Dans le programme, le test de bordure est donc écrit en premier (if), avant celui de l'adversaire (elif)." },
      { type: "qcm", fiche: "tsi-s12-et-lecture", enonce: "Un événement survient, mais aucune transition partant de l'état actif ne le porte. Le système…", choix: ["Reste dans son état : l'événement est ignoré", "Revient à l'état initial", "Passe à l'état final", "Mémorise l'événement et l'utilisera plus tard"], bonne: 0, explication: "Seules les transitions qui partent de l'état actif peuvent être franchies ; les autres événements n'ont aucun effet." }
    ],
    fiches: [
      { id: "tsi-s12-et-bases", titre: "État, transition, états initial et final",
        recto: "Que décrit un diagramme d'états-transitions (stm) et quand un état est-il actif ?",
        verso: `<ul><li><b>stm</b> (State Machine Diagram) : diagramme <b>comportemental</b> SysML ; états successifs du système selon les événements.</li><li><b>État</b> : situation nommée ; <b>actif</b> quand une transition y mène, inactif quand une transition le quitte.</li><li><b>Transition</b> : flèche unidirectionnelle état source → état cible.</li><li>● état <b>initial</b> (mise sous énergie) · ◉ état <b>final</b> (fin de fonctionnement).</li></ul><p class="astuce">Système séquentiel : sa réaction dépend de l'état actif ET de l'événement.</p>`,
        quiz: [{ enonce: "Un état devient actif quand…", choix: ["une transition y mène", "son activité do se termine", "le système démarre, quel que soit l'état"], bonne: 0 }, { enonce: "L'état final se représente par…", choix: ["un disque plein entouré d'un cercle", "un disque plein", "un losange"], bonne: 0 }, { enonce: "Le stm est un diagramme…", choix: ["comportemental", "structurel", "d'exigences"], bonne: 0 }] },
      { id: "tsi-s12-et-actions", titre: "Actions entry, do, exit",
        recto: "Quand s'exécutent entry, do et exit, et dans quel ordre lors d'une transition ?",
        verso: `<div class="formule">exit (source) → effet → entry (cible) → do (cible)</div><ul><li><b>entry /</b> dès l'entrée dans l'état (initialisations, configuration).</li><li><b>do /</b> tant que l'état est actif, après entry ; interrompue si une transition se déclenche.</li><li><b>exit /</b> à la sortie de l'état (sortir « proprement »).</li></ul><p class="astuce">Transition réflexive : on sort puis on rentre → exit puis entry sont exécutées.</p>`,
        quiz: [{ enonce: "Une transition se déclenche pendant do :", choix: ["do est interrompue, puis exit s'exécute", "on attend la fin de do", "la transition est ignorée"], bonne: 0 }, { enonce: "Transition réflexive :", choix: ["exit puis entry du même état", "aucune action", "entry seulement"], bonne: 0 }] },
      { id: "tsi-s12-et-transitions", titre: "Événement [garde] / effet",
        recto: "Comment se lit l'étiquette d'une transition et quels sont les 4 types d'événements ?",
        verso: `<div class="formule">événement [condition de garde] / effet</div><ul><li><b>signal</b> : arrivée d'un message · <b>time</b> : after(2 s) depuis l'entrée dans l'état, at(12:00) · <b>change</b> : when(compteur = 2) · <b>call</b> : fonction(paramètres).</li><li><b>Garde</b> : expression booléenne (entrées, variables) ; fausse → transition non franchie.</li></ul><p class="astuce">Garde fausse au moment de l'événement : l'événement est perdu, il n'est pas mémorisé.</p>`,
        quiz: [{ enonce: "after(2 s) est un…", choix: ["time event", "change event", "call event"], bonne: 0 }, { enonce: "[T > 28 °C] est…", choix: ["une condition de garde", "un effet", "un état"], bonne: 0 }, { enonce: "when(compteur = 2) est un…", choix: ["change event", "signal event", "time event"], bonne: 0 }] },
      { id: "tsi-s12-et-lecture", titre: "Simuler un diagramme d'états",
        recto: "Comment trouver l'état final après une séquence d'événements ?",
        verso: `<ol><li>Partir de l'<b>état initial</b>.</li><li>Pour chaque événement, chercher une transition qui <b>part de l'état actif</b> avec cet événement (et une garde vraie).</li><li>Si elle existe, on la franchit ; sinon l'événement est <b>ignoré</b>.</li><li>Écrire la trace : A · e1 → B · e2 → C…</li></ol><p class="astuce">Ne lis que les lignes de l'état actif ! Dans un programme, l'ordre des if/elif traduit les priorités.</p>`,
        quiz: [{ enonce: "Événement sans transition depuis l'état actif :", choix: ["ignoré, l'état ne change pas", "retour à l'état initial", "passage à l'état final"], bonne: 0 }, { enonce: "Pour simuler un automate, on part…", choix: ["de l'état initial", "du dernier état du tableau", "de l'état final"], bonne: 0 }] },
      { id: "tsi-s12-et-composite", titre: "États composites et pseudo-états",
        recto: "Qu'apportent l'état composite, l'état orthogonal et les pseudo-états ?",
        verso: `<ul><li><b>Composite</b> (super-état) : englobe des sous-états ; y entrer active son sous-état initial ; une transition partant de son <b>bord</b> s'applique quel que soit le sous-état actif.</li><li><b>Orthogonal</b> : régions en parallèle, un état actif par région.</li><li>Pseudo-états : <b>jonction</b> (cercle plein), <b>décision</b> (1 entrée, ≥ 2 sorties), <b>bifurcation</b> (1 → 2 états), <b>union</b> (2 → 1).</li></ul><p class="astuce">Arrêt d'urgence : une seule flèche depuis le bord du super-état suffit.</p>`,
        quiz: [{ enonce: "Un état orthogonal permet…", choix: ["des opérations en parallèle", "de supprimer les transitions", "d'avoir un seul sous-état"], bonne: 0 }, { enonce: "Une bifurcation…", choix: ["active deux états à partir d'un seul", "active un état à partir de deux", "termine le diagramme"], bonne: 0 }] }
    ]
  });

  /* =================== S12 · Algorithmique et intelligence artificielle =================== */
  const matrice = (a, b, c, d) => `<table><tr><th></th><th>Prédit salade</th><th>Prédit adventice</th></tr><tr><th>Réel salade</th><td>${a}</td><td>${b}</td></tr><tr><th>Réel adventice</th><td>${c}</td><td>${d}</td></tr></table>`;
  const RAISON_IA = {
    "Classification (supervisé)": "La sortie est une catégorie et les exemples sont étiquetés : classification, apprentissage supervisé.",
    "Régression (supervisé)": "La sortie est une valeur numérique et les exemples sont étiquetés : régression, apprentissage supervisé.",
    "Regroupement (non supervisé)": "Pas d'étiquettes : l'algorithme découvre lui-même des groupes, c'est de l'apprentissage non supervisé.",
    "Algorithme classique (sans apprentissage)": "La règle est connue et s'écrit directement (SI … ALORS …) : inutile d'apprendre."
  };
  const TACHES = [
    ["Reconnaître si un plant est une salade ou une adventice, à partir de milliers d'images étiquetées", "Classification (supervisé)"],
    ["Trier des courriels en « spam » / « non spam » grâce à des exemples annotés", "Classification (supervisé)"],
    ["Reconnaître un chiffre manuscrit (0 à 9) à partir d'images étiquetées", "Classification (supervisé)"],
    ["Prédire la consommation électrique (en kWh) d'un bâtiment demain, à partir des relevés passés", "Régression (supervisé)"],
    ["Estimer l'autonomie restante (en minutes) d'un drone à partir de vols enregistrés", "Régression (supervisé)"],
    ["Estimer le prix d'une maison à partir de sa surface, grâce à des ventes connues", "Régression (supervisé)"],
    ["Former des groupes de clients aux habitudes proches, sans catégories connues à l'avance", "Regroupement (non supervisé)"],
    ["Regrouper des pannes de machines similaires qui n'ont jamais été classées", "Regroupement (non supervisé)"],
    ["Allumer le chauffage si la température est inférieure à 19 °C", "Algorithme classique (sans apprentissage)"],
    ["Compter les pièces qui passent devant un capteur", "Algorithme classique (sans apprentissage)"]
  ].map((t) => [t[0], t[1], `${t[0]} : ${RAISON_IA[t[1]]}`]);
  const VOC_IA = [
    ["Données étiquetées utilisées pour ajuster les poids du modèle", "Données d'entraînement"],
    ["Données jamais vues pendant l'apprentissage, utilisées pour évaluer le modèle", "Données de test"],
    ["Réponse attendue associée à un exemple (ex. « salade »)", "Étiquette (label)"],
    ["Le modèle apprend par cœur ses exemples et généralise mal", "Sur-apprentissage"],
    ["Coefficient qui multiplie une entrée du neurone", "Poids"],
    ["Constante ajoutée à la somme pondérée du neurone", "Biais"],
    ["Fonction qui calcule la sortie du neurone à partir de la somme pondérée", "Fonction d'activation"],
    ["Tableau qui croise classes réelles et classes prédites", "Matrice de confusion"]
  ];
  const FONCTIONS = [
    { def: ["def puissance(U, I):", "    return U * I"], nom: "puissance", f: (a, b) => a * b, c: (a, b) => `${nb(a)} × ${nb(b)}`, a: [12, 24, 230], b: [0.5, 1.5, 2, 3] },
    { def: ["def vitesse(d, t):", "    return d / t"], nom: "vitesse", f: (a, b) => a / b, c: (a, b) => `${nb(a)} / ${nb(b)}`, a: [100, 150, 240, 360], b: [4, 5, 8, 12] },
    { def: ["def moyenne(a, b):", "    return (a + b) / 2"], nom: "moyenne", f: (a, b) => (a + b) / 2, c: (a, b) => `(${nb(a)} + ${nb(b)}) / 2`, a: [12, 17, 25, 31], b: [8, 14, 20, 40] },
    { def: ["def f(x, k):", "    return 2 * x + k"], nom: "f", f: (a, b) => 2 * a + b, c: (a, b) => `2 × ${nb(a)} + ${par(b)}`, a: [3, 7, 11, 15], b: [-4, 1, 5, 9] }
  ];

  SIP.definirModule({
    id: "tsi-s12-algo-ia",
    niveaux: ["TSI"],
    sequence: "S12 · Comportement et IA",
    titre: "Algorithmique Python et intelligence artificielle",
    description: "Boucles, conditions, listes et fonctions en Python ; apprentissage supervisé, neurone artificiel, évaluation d'un modèle (robot DINO).",
    competences: ["A4", "M4", "M5"],
    nbQuestions: 10,
    questions: [
      // --- Python : boucles et conditions ---
      { fiche: "tsi-s12-al-python", gen: (r) => { const a = r.int(0, 10), n = r.int(3, 8), k = r.int(2, 9);
          return { enonce: `Que vaut <b>s</b> à la fin ?${code(`s = ${a}`, `for i in range(${n}):`, `    s = s + ${k}`)}`, reponse: a + n * k, absolu: 0.4, explication: `range(${n}) donne ${n} tours (i = 0 à ${n - 1}) : s = ${a} + ${n} × ${k} = ${a + n * k}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const a = r.int(0, 4), b = a + r.int(3, 6), vals = Array.from({ length: b - a }, (_, j) => a + j), s = vals.reduce((u, v) => u + v, 0);
          return { enonce: `Que vaut <b>s</b> à la fin ?${code("s = 0", `for i in range(${a}, ${b}):`, "    s = s + i")}`, reponse: s, absolu: 0.4, explication: `i prend les valeurs ${vals.join(", ")} (${b} est exclu) : s = ${vals.join(" + ")} = ${s}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const a = r.int(0, 5), p = r.int(2, 5), b = a + r.int(7, 22), vals = []; for (let i = a; i < b; i += p) vals.push(i);
          return { enonce: `Que vaut <b>n</b> à la fin ?${code("n = 0", `for i in range(${a}, ${b}, ${p}):`, "    n = n + 1")}`, reponse: vals.length, absolu: 0.4, explication: `i vaut ${vals.join(", ")} (pas de ${p}, on s'arrête avant ${b}) : ${vals.length} tours, donc n = ${vals.length}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const x0 = r.int(1, 5), L = r.int(20, 300); let x = x0, n = 0; const suite = [x0]; while (x < L) { x *= 2; n++; suite.push(x); } const q = r.int(0, 1);
          return { enonce: `Que vaut <b>${q ? "x" : "n"}</b> à la fin ?${code(`x = ${x0}`, "n = 0", `while x < ${L}:`, "    x = x * 2", "    n = n + 1")}`, reponse: q ? x : n, absolu: 0.4, explication: `x double à chaque tour : ${suite.join(" → ")}. La boucle s'arrête dès que x ≥ ${L} : n = ${n}, x = ${x}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const B = r.pas(60, 100, 5), S = r.pas(10, 30, 5), c = r.int(7, 15); let b = B, t = 0; const suite = [B]; while (b > S) { b -= c; t++; suite.push(b); }
          return { enonce: `Robot aspirateur : que vaut <b>trajets</b> à la fin ?${code(`batterie = ${B}`, "trajets = 0", `while batterie > ${S}:`, `    batterie = batterie - ${c}`, "    trajets = trajets + 1")}`, reponse: t, absolu: 0.4, explication: `batterie : ${suite.join(" → ")} ; la boucle s'arrête dès que batterie ≤ ${S} : trajets = ${t}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const Tc = r.pas(180, 220, 10), T = r.int(Tc - 30, Tc + 10), P = T < Tc - 10 ? 2000 : T < Tc ? 800 : 0;
          return { enonce: `Commande du chauffage d'un four (consigne ${Tc} °C). Température mesurée : <b>T = ${T} °C</b>. Que vaut <b>P</b> ?${code(`if T < ${Tc - 10}:`, "    P = 2000", `elif T < ${Tc}:`, "    P = 800", "else:", "    P = 0")}`, reponse: P, unite: "W", absolu: 1,
            explication: `${T < Tc - 10 ? `${T} &lt; ${Tc - 10} : premier test vrai → P = 2000 W (chauffe forte).` : T < Tc ? `${T} ≥ ${Tc - 10} mais ${T} &lt; ${Tc} : c'est le elif → P = 800 W.` : `${T} ≥ ${Tc} : aucun test vrai → else, P = 0 W.`} Un seul bloc du if/elif/else est exécuté.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const T = r.int(20, 32), H = r.int(40, 80), m = T > 25 && H < 60 ? "ventilation" : T > 25 ? "climatisation" : "veille";
          return { type: "qcm", enonce: `Maison intelligente : <b>T = ${T} °C</b>, <b>H = ${H} %</b>. Valeur de <b>mode</b> ?${code("if T > 25 and H < 60:", '    mode = "ventilation"', "elif T > 25:", '    mode = "climatisation"', "else:", '    mode = "veille"')}`, choix: ["ventilation", "climatisation", "veille", "ventilation puis climatisation"], bonne: ["ventilation", "climatisation", "veille"].indexOf(m),
            explication: `T &gt; 25 est ${T > 25 ? "vrai" : "faux"}, H &lt; 60 est ${H < 60 ? "vrai" : "faux"} → « ${m} ». Avec and, les deux conditions doivent être vraies ; un seul bloc du if/elif/else s'exécute.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const b = r.pick([6, 8, 12, 24]), a = r.int(30, 200), q = r.int(0, 1), Q = Math.floor(a / b);
          return { enonce: `Conditionnement de ${a} bouteilles par caisses de ${b}. Que vaut <b>${q ? "reste" : "caisses"}</b> ?${code(`n = ${a}`, `caisses = n // ${b}`, `reste = n % ${b}`)}`, reponse: q ? a % b : Q, absolu: 0.4, explication: `// donne le quotient entier et % le reste : ${a} = ${b} × ${Q} + ${a % b} → caisses = ${Q}, reste = ${a % b}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const k = r.int(0, 3), inv = Array.from({ length: k }, () => r.pick([r.int(-9, -1), r.int(21, 40)])), ok = r.int(0, 20), tape = [...inv, ok], q = k === 0 ? 1 : r.int(0, 1);
          return { enonce: `Validation d'une saisie (TD). L'utilisateur tape successivement : <b>${tape.join(" ; ")}</b>. ${q ? "Quelle valeur est affichée à la fin ?" : "Combien de fois « erreur » est-il affiché ?"}${code('N = int(input("N ? "))', "while N < 0 or N > 20:", '    print("erreur")', '    N = int(input("N ? "))', "print(N + 17)")}`, reponse: q ? ok + 17 : k, absolu: 0.4,
            explication: `${k ? `${inv.join(" ; ")} ${k > 1 ? "sont" : "est"} hors de [0 ; 20] → « erreur » ${k} fois ; ` : ""}${ok} est valide : la boucle s'arrête et le programme affiche ${ok} + 17 = ${ok + 17}.` }; } },
      { fiche: "tsi-s12-al-python", gen: (r) => { const N = r.pick([2, 3, 4, 4, 5]), dt = r.pick([10, 15, 20, 25]), Tm = r.pick([20, 30, 40]), x = Tm * 1000 / (N * dt), nmax = Math.floor(x + 1e-9);
          return { enonce: `Robot DINO : l'algorithme de RANSAC traite <b>${N} rangées</b> ; pour chacune, la boucle interne fait Nb_Iterations_max tours de <b>${dt} µs</b>. Le traitement doit durer moins de <b>${Tm} ms</b>. Valeur maximale (entière) de Nb_Iterations_max ?`, reponse: nmax, absolu: 0.5,
            explication: `Boucles imbriquées : durée = ${N} × Nb × ${dt} µs ≤ ${Tm * 1000} µs → Nb ≤ ${Tm * 1000} / (${N} × ${dt}) = ${nb(x)} → Nb_max = ${nmax}.` }; } },
      // --- Python : listes, fonctions, image ---
      { fiche: "tsi-s12-al-listes", gen: (r) => { const L = r.melange([3, 4, 5, 7, 8, 9, 12, 15, 20, 25]).slice(0, 5), i = r.int(1, 4), j = r.pick([-1, 0, 2, 3]), Lj = j < 0 ? L[4] : L[j], v = L[i] + Lj;
          return { enonce: `Que vaut <b>x</b> ?${code(`L = [${L.join(", ")}]`, `x = L[${i}] + L[${j}]`)}`, reponse: v, absolu: 0.4, explication: `Les indices commencent à 0 : L[${i}] = ${L[i]} ; L[${j}] = ${Lj}${j < 0 ? " (dernier élément)" : ""} → x = ${v}.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const S = r.melange([12, 18, 25, 31, 7, 44, 29, 36, 15, 40]).slice(0, 6); let m = 0, im = 0; S.forEach((v, k) => { if (v > m) { m = v; im = k; } });
          return { enonce: `Recherche de la meilleure droite (principe de RANSAC). Que vaut <b>i_max</b> à la fin ?${code(`scores = [${S.join(", ")}]`, "score_max = 0", "i_max = 0", "for i in range(len(scores)):", "    if scores[i] > score_max:", "        score_max = scores[i]", "        i_max = i")}`, reponse: im, absolu: 0.4, explication: `Le plus grand score est ${m}, à l'indice ${im} (on compte à partir de 0) : i_max = ${im}.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const F = r.pick(FONCTIONS), a = r.pick(F.a), b = r.pick(F.b), y = F.f(a, b);
          return { enonce: `Que vaut <b>y</b> ?${code(...F.def, `y = ${F.nom}(${a}, ${b})`)}`, reponse: y, tolerance: 1, explication: `Les arguments ${nb(a)} et ${nb(b)} remplacent les paramètres dans l'ordre : ${F.c(a, b)} = ${nb(y)}.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const n = r.int(4, 9), k = r.int(2, 7), q = r.int(0, 2), m = r.int(1, n - 1), L = Array.from({ length: n }, (_, i) => k * i);
          const ex = ["len(L)", "L[-1]", `L[${m}]`], val = [n, L[n - 1], L[m]];
          return { enonce: `Que vaut <b>${ex[q]}</b> à la fin ?${code("L = []", `for i in range(${n}):`, `    L.append(${k} * i)`)}`, reponse: val[q], absolu: 0.4, explication: `L = [${L.join(", ")}] : ${n} éléments, d'indices 0 à ${n - 1} → ${ex[q]} = ${val[q]}.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const P = [r.int(60, 140), r.int(190, 270), r.int(320, 400), r.int(450, 530)], s = P.reduce((u, v) => u + v, 0), moy = s / 4;
          return { enonce: `Robot DINO : positions des 4 rangées de salades (en pixels). Que vaut <b>POS_MOYENNE</b> ?${code(`POS_RANGEE = [${P.join(", ")}]`, "s = 0", "for p in POS_RANGEE:", "    s = s + p", "POS_MOYENNE = s / len(POS_RANGEE)")}`, reponse: moy, unite: "pixels", tolerance: 0.5, explication: `s = ${P.join(" + ")} = ${s} ; len(POS_RANGEE) = 4 → POS_MOYENNE = ${nb(moy)} pixels : le porte-socs s'aligne sur cette position.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const R = r.int(0, 255), V = r.int(30, 255), B = r.int(0, 255), G = 0.11 * R + 0.83 * V + 0.06 * B;
          return { enonce: `Robot DINO : niveau de gris <b>G = 0,11·R + 0,83·V + 0,06·B</b>. Pixel de composantes <b>R = ${R}, V = ${V}, B = ${B}</b>. Valeur de G ?`, reponse: G, tolerance: 1, explication: `G = 0,11 × ${R} + 0,83 × ${V} + 0,06 × ${B} = ${nb(G)} → ${G <= 127 ? "≤ 127 : pixel noir" : "&gt; 127 : pixel blanc"}.` }; } },
      { fiche: "tsi-s12-al-listes", gen: (r) => { const [nom, R, V, B] = r.pick([["d'une salade", 56, 138, 17], ["de la terre", 224, 195, 165], ["d'un pixel", r.int(0, 255), r.int(0, 255), r.int(0, 255)], ["d'un pixel", r.int(80, 200), r.int(100, 160), r.int(0, 255)]]), G = 0.11 * R + 0.83 * V + 0.06 * B, noir = G <= 127;
          return { type: "qcm", enonce: `Traitement d'image du robot DINO : G = 0,11·R + 0,83·V + 0,06·B, puis <b>noir si G ≤ 127, sinon blanc</b>. Couleur ${nom} (R = ${R}, V = ${V}, B = ${B}) après traitement ?`, choix: ["Noir", "Blanc", "Gris : G est conservé tel quel", "Vert : la couleur d'origine est conservée"], bonne: noir ? 0 : 1,
            explication: `G = ${nb(G)} ${noir ? "≤ 127 → noir" : "&gt; 127 → blanc"}.${nom !== "d'un pixel" ? " Les salades deviennent des taches noires sur le fond blanc de la terre." : ""}` }; } },
      // --- IA : neurone ---
      { fiche: "tsi-s12-ia-neurone", gen: (r) => { let x1, x2, w1, w2, b, s; do { x1 = r.pick([0, 0.5, 1, 2]); x2 = r.pick([0.5, 1, 1.5, 3]); w1 = r.pas(-2, 2, 0.1); w2 = r.pas(-2, 2, 0.1); b = r.pas(-1.5, 1.5, 0.1); s = arr(w1 * x1 + w2 * x2 + b); } while (Math.abs(s) < 0.05 || w1 === 0 || w2 === 0);
          return { enonce: `Neurone à 2 entrées : x₁ = ${nb(x1)}, x₂ = ${nb(x2)} ; poids w₁ = ${nb(w1)}, w₂ = ${nb(w2)} ; biais b = ${nb(b)}. Somme pondérée <b>s</b> ?`, reponse: s, absolu: 0.01, explication: `s = w₁·x₁ + w₂·x₂ + b = ${nb(w1)} × ${nb(x1)} + ${par(w2)} × ${nb(x2)} + ${par(b)} = ${nb(s)}. Avec une activation à seuil, y = ${s >= 0 ? 1 : 0}.` }; } },
      { fiche: "tsi-s12-ia-neurone", gen: (r) => { const w1 = r.pick([2, 3, 4]), w2 = r.pick([1, 2]), b = -Math.round((w1 + w2) * r.pick([0.4, 0.5, 0.6]) * 2) / 2, pts = Array.from({ length: 4 }, () => [r.pas(0, 1, 0.1), r.pas(0, 1, 0.1)]);
          const ss = pts.map(([u, v]) => arr(w1 * u + w2 * v + b)), ys = ss.map((s) => (s >= 0 ? 1 : 0)), n = ys.reduce((u, v) => u + v, 0);
          return { enonce: `Neurone de tri : s = ${w1}·x₁ + ${w2}·x₂ − ${nb(-b)} ; y = 1 (salade) si s ≥ 0, sinon y = 0 (adventice). x₁ : taux de vert, x₂ : taille relative.${tab(["Plant", "x₁", "x₂"], pts.map((q, k) => [`P${k + 1}`, nb(q[0]), nb(q[1])]))}Combien de plants sont classés « salade » ?`, reponse: n, absolu: 0.4, explication: `${ss.map((s, k) => `P${k + 1} : s = ${nb(s)} → y = ${ys[k]}`).join(" ; ")}. Total : ${n} salade(s).` }; } },
      { fiche: "tsi-s12-ia-neurone", gen: (r) => { const x = [r.pick([0, 1, 2]), r.pick([0.5, 1, 2]), r.pick([1, 3])], w = [r.pas(-1, 1, 0.1), r.pas(-1, 1, 0.1), r.pas(-1, 1, 0.1)], b = r.pas(-1, 1, 0.1), s = arr(w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + b), y = Math.max(0, s);
          return { enonce: `Neurone à activation <b>ReLU</b> : y = max(0, s).${tab(["", "x₁", "x₂", "x₃"], [["Entrée", nb(x[0]), nb(x[1]), nb(x[2])], ["Poids", nb(w[0]), nb(w[1]), nb(w[2])]])}Biais b = ${nb(b)}. Sortie y ?`, reponse: y, absolu: 0.01,
            explication: `s = ${w.map((wi, k) => `${par(wi)} × ${nb(x[k])}`).join(" + ")} + ${par(b)} = ${nb(s)} → y = max(0 ; ${nb(s)}) = ${nb(y)}${s < 0 ? " (s négatif : ReLU renvoie 0)" : ""}.` }; } },
      { fiche: "tsi-s12-ia-neurone", gen: (r) => { let w1, w2, x1, x2, b; do { w1 = r.pas(-2, 2, 0.5); w2 = r.pas(-2, 2, 0.5); x1 = r.pick([1, 2, 3]); x2 = r.pick([1, 2, 4]); b = arr(-(w1 * x1 + w2 * x2)); } while (w1 === 0 || w2 === 0 || Math.abs(b) < 0.1);
          return { enonce: `Neurone : w₁ = ${nb(w1)}, w₂ = ${nb(w2)}. Quel biais b faut-il pour que la somme pondérée soit <b>exactement nulle</b> (frontière de décision) quand x₁ = ${x1} et x₂ = ${x2} ?`, reponse: b, absolu: 0.01, explication: `s = w₁·x₁ + w₂·x₂ + b = 0 → b = −(${nb(w1)} × ${x1} + ${par(w2)} × ${x2}) = ${nb(b)}.` }; } },
      // --- IA : apprentissage ---
      { fiche: "tsi-s12-ia-apprentissage", gen: (r) => { const N = r.pick([500, 1000, 1200, 2000, 5000]), p = r.pick([70, 75, 80, 90]), q = r.int(0, 1), tr = N * p / 100, te = N - tr;
          return { enonce: `On dispose de ${N} images étiquetées : ${p} % servent à l'entraînement, le reste au test. ${q ? "Nombre d'images de test" : "Nombre d'images d'entraînement"} ?`, reponse: q ? te : tr, absolu: 0.5, explication: `Entraînement : ${p} % × ${N} = ${tr} images ; test : ${N} − ${tr} = ${te} images, jamais vues pendant l'apprentissage.` }; } },
      { fiche: "tsi-s12-ia-apprentissage", gen: (r) => { const L = r.melange(["A", "B", "C"]), bon = [r.int(88, 94)], sur = [r.int(98, 100), r.int(58, 72)], sous = [r.int(58, 68)]; bon.push(bon[0] - r.int(1, 4)); sous.push(sous[0] - r.int(0, 3));
          const lignes = [[L[0], bon], [L[1], sur], [L[2], sous]].sort((u, v) => u[0].localeCompare(v[0])), q = r.int(0, 2), rep = [L[1], L[0], L[2]][q];
          const Q = ["Quel modèle est en <b>sur-apprentissage</b> ?", "Quel modèle faut-il <b>retenir</b> ?", "Quel modèle est <b>trop simple</b> (mauvais partout) ?"];
          return { type: "qcm", enonce: `Trois modèles de reconnaissance de plants ont été entraînés.${tab(["Modèle", "Réussite entraînement", "Réussite test"], lignes.map((l) => [l[0], `${l[1][0]} %`, `${l[1][1]} %`]))}${Q[q]}`, choix: ["Modèle A", "Modèle B", "Modèle C", "Aucun : les trois se valent"], bonne: ["A", "B", "C"].indexOf(rep),
            explication: `Modèle ${L[1]} : ${sur[0]} % à l'entraînement mais ${sur[1]} % au test → sur-apprentissage (appris par cœur). Modèle ${L[2]} : mauvais partout → trop simple. Modèle ${L[0]} : bon et stable sur le test → à retenir.` }; } },
      { fiche: "tsi-s12-ia-apprentissage", gen: (r) => qcmListe(r, TACHES, (x) => `${x}. De quel type de traitement s'agit-il ?`) },
      { fiche: "tsi-s12-ia-apprentissage", gen: (r) => qcmListe(r, VOC_IA, (x) => `« ${x} » : de quelle notion d'IA s'agit-il ?`) },
      // --- IA : évaluation ---
      { fiche: "tsi-s12-ia-evaluation", gen: (r) => { const N = r.pick([50, 80, 120, 200, 250, 400]), ok = Math.round(N * r.int(60, 98) / 100);
          return { enonce: `Un modèle de reconnaissance d'images est évalué sur <b>${N} images de test</b> : il en classe correctement <b>${ok}</b>. Taux de réussite ?`, reponse: 100 * ok / N, unite: "%", tolerance: 1, explication: `Taux = ${ok} / ${N} × 100 = ${nb(100 * ok / N)} %.` }; } },
      { fiche: "tsi-s12-ia-evaluation", gen: (r) => { const a = r.int(30, 90), b = r.int(1, 15), c = r.int(1, 15), d = r.int(20, 80), T = a + b + c + d, t = 100 * (a + d) / T;
          return { enonce: `Matrice de confusion d'un classifieur sur les données de test :${matrice(a, b, c, d)}Taux de réussite ?`, reponse: t, unite: "%", tolerance: 1, explication: `Bonnes prédictions (diagonale) : ${a} + ${d} = ${a + d} sur ${T} images → ${nb(a + d)} / ${T} × 100 = ${nb(t)} %.` }; } },
      { fiche: "tsi-s12-ia-evaluation", gen: (r) => { const a = r.int(30, 90), b = r.int(1, 15), c = r.int(1, 15), d = r.int(20, 80), q = r.int(0, 2);
          const Q = ["Combien d'adventices ont été prises pour des salades ?", "Combien de salades ont été prises pour des adventices ?", "Combien d'erreurs le classifieur a-t-il commises au total ?"], R = [c, b, b + c];
          const E = [`Ligne « réel adventice », colonne « prédit salade » : ${c}.`, `Ligne « réel salade », colonne « prédit adventice » : ${b}.`, `Erreurs = cases hors diagonale : ${b} + ${c} = ${b + c}.`];
          return { enonce: `Matrice de confusion d'un classifieur :${matrice(a, b, c, d)}${Q[q]}`, reponse: R[q], absolu: 0.4, explication: E[q] }; } },
      // --- QCM fixes ---
      { type: "qcm", fiche: "tsi-s12-al-python", enonce: "Quelles valeurs prend i dans <code>for i in range(5):</code> ?", choix: ["0, 1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "5 seulement"], bonne: 0, explication: "range(n) commence à 0 et s'arrête avant n : 5 valeurs, de 0 à 4." },
      { type: "qcm", fiche: "tsi-s12-al-python", enonce: "En Python, quelle est la différence entre <code>=</code> et <code>==</code> ?", choix: ["= affecte une valeur à une variable ; == teste l'égalité", "= teste l'égalité ; == affecte une valeur", "Aucune, ce sont des synonymes", "== ne sert que pour les chaînes de caractères"], bonne: 0, explication: "x = 3 range 3 dans x ; x == 3 vaut True ou False. En pseudo-code, l'affectation s'écrit x ← 3." },
      { type: "qcm", fiche: "tsi-s12-al-python", enonce: "En Python, qu'est-ce qui délimite le bloc d'instructions d'une boucle ou d'un if ?", choix: ["L'indentation (le décalage vers la droite)", "Les accolades { }", "Les mots FIN SI / FIN POUR", "Les parenthèses ( )"], bonne: 0, explication: "Après les deux-points, toutes les lignes décalées appartiennent au bloc ; FIN SI et FIN POUR n'existent qu'en pseudo-code." },
      { type: "qcm", fiche: "tsi-s12-al-python", enonce: "Quelle structure exécute son traitement <b>au moins une fois</b> ?", choix: ["RÉPÉTER … JUSQU'À condition", "TANT QUE condition FAIRE …", "POUR i DE 1 À 0 FAIRE …", "SI condition ALORS …"], bonne: 0, explication: "RÉPÉTER teste la condition après le traitement ; TANT QUE la teste avant, donc l'action peut ne jamais être exécutée." },
      { type: "qcm", fiche: "tsi-s12-al-python", enonce: "Robot DINO : pourquoi limite-t-on le nombre d'itérations de l'algorithme de RANSAC ?", choix: ["Plus d'itérations = plus précis mais plus long : le traitement doit durer moins de 30 ms", "Au-delà de 100 itérations, le résultat devient faux", "Pour économiser la mémoire de la caméra", "Parce que Python refuse les boucles de plus de 100 tours"], bonne: 0, explication: "Compromis précision / temps de calcul : au-delà de 30 ms, la chaîne d'acquisition ne peut plus être assimilée à un simple gain." },
      { type: "qcm", fiche: "tsi-s12-al-listes", enonce: "RANSAC : quelles lignes complètent le test pour garder la droite de meilleur score ?", choix: ["SI Score &gt; Score_max ALORS Score_max ← Score ; D_max ← D", "SI Score &lt; Score_max ALORS Score_max ← Score ; D_max ← D", "SI Score &gt; Score_max ALORS Score ← Score_max ; D ← D_max", "SI Score &gt; Score_max ALORS D_max ← D"], bonne: 0, explication: "Recherche du maximum : si le nouveau score est meilleur, on mémorise ce score ET la droite correspondante. Oublier Score_max ← Score fausse les comparaisons suivantes." },
      { type: "qcm", fiche: "tsi-s12-al-listes", enonce: "Dans une image en niveaux de gris, chaque pixel est codé par…", choix: ["Un entier de 0 (noir) à 255 (blanc)", "Un entier de 0 (blanc) à 255 (noir)", "Un pourcentage de 0 à 100 %", "Un entier de 0 à 1023"], bonne: 0, explication: "Cours (DINO) : 0 = intensité lumineuse nulle (noir), 255 = intensité maximale (blanc), soit 8 bits par pixel." },
      { type: "qcm", fiche: "tsi-s12-ia-apprentissage", enonce: "Pourquoi garde-t-on des <b>données de test</b> séparées des données d'entraînement ?", choix: ["Pour évaluer le modèle sur des exemples qu'il n'a jamais vus", "Pour entraîner le modèle deux fois plus vite", "Pour corriger les étiquettes fausses", "C'est inutile si les données d'entraînement sont nombreuses"], bonne: 0, explication: "Évaluer sur les données d'entraînement surestime les performances : le modèle peut les avoir apprises par cœur." },
      { type: "qcm", fiche: "tsi-s12-ia-apprentissage", enonce: "Qu'est-ce que le <b>sur-apprentissage</b> ?", choix: ["Le modèle apprend par cœur ses exemples d'entraînement et généralise mal à de nouvelles données", "Le modèle a été entraîné trop peu de temps", "Le modèle a trop peu de paramètres", "Le modèle réussit mieux au test qu'à l'entraînement"], bonne: 0, explication: "Signe typique : près de 100 % à l'entraînement mais nettement moins au test. Remèdes : plus de données, modèle plus simple, arrêter l'entraînement plus tôt." },
      { type: "qcm", fiche: "tsi-s12-ia-apprentissage", enonce: "Un apprentissage est dit <b>supervisé</b> quand…", choix: ["Les exemples d'entraînement sont étiquetés : on connaît la bonne réponse", "Un humain surveille l'ordinateur pendant le calcul", "Les données n'ont pas d'étiquette", "Le modèle apprend seul en jouant contre lui-même"], bonne: 0, explication: "Supervisé : couples (entrée, réponse attendue). Non supervisé : données sans étiquette, l'algorithme cherche lui-même des regroupements." },
      { type: "qcm", fiche: "tsi-s12-ia-neurone", enonce: "Pendant l'<b>entraînement</b> d'un réseau de neurones, que modifie-t-on ?", choix: ["Les poids et les biais des neurones", "Les valeurs des entrées", "Les étiquettes des données de test", "Le nombre de pixels de la caméra"], bonne: 0, explication: "Apprendre = ajuster progressivement poids et biais pour réduire l'écart entre les sorties calculées et les réponses attendues." },
      { type: "qcm", fiche: "tsi-s12-ia-neurone", enonce: "Rôle de la <b>fonction d'activation</b> d'un neurone ?", choix: ["Calculer la sortie y à partir de la somme pondérée s (ex. seuil : y = 1 si s ≥ 0)", "Multiplier chaque entrée par son poids", "Choisir les données d'entraînement", "Ajouter le biais aux entrées"], bonne: 0, explication: "Le neurone calcule d'abord s = Σ wᵢ·xᵢ + b, puis y = f(s) : seuil, ReLU…" },
      { type: "qcm", fiche: "tsi-s12-ia-evaluation", enonce: "Dans une matrice de confusion (lignes = classe réelle, colonnes = classe prédite), où lit-on les <b>bonnes</b> prédictions ?", choix: ["Sur la diagonale", "Sur la première ligne", "Sur la dernière colonne", "Hors de la diagonale"], bonne: 0, explication: "Diagonale : classe prédite = classe réelle. Hors diagonale : erreurs de classification." }
    ],
    fiches: [
      { id: "tsi-s12-al-python", titre: "Boucles et conditions en Python",
        recto: "Que font for i in range(a, b, p), while et if / elif / else ?",
        verso: `<div class="formule">range(a, b, p) : a, a+p, a+2p… &lt; b (b exclu)</div><ul><li><b>for</b> (POUR) : nombre de tours connu ; range(n) → 0 à n−1, soit n tours.</li><li><b>while</b> (TANT QUE) : test avant chaque tour, peut ne jamais s'exécuter.</li><li><b>if / elif / else</b> : un seul bloc exécuté, le premier dont la condition est vraie.</li><li>= affecte, == compare ; le bloc est défini par l'<b>indentation</b>.</li></ul><p class="astuce">Boucles imbriquées : nombre de tours = n₁ × n₂.</p>`,
        quiz: [{ enonce: "range(4) donne…", choix: ["0, 1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3, 4"], bonne: 0 }, { enonce: "Dans un if / elif / else, combien de blocs s'exécutent ?", choix: ["Un seul", "Tous ceux dont la condition est vraie", "Toujours deux"], bonne: 0 }] },
      { id: "tsi-s12-al-listes", titre: "Listes, fonctions, images",
        recto: "Comment lire une liste, chercher un maximum et appeler une fonction ?",
        verso: `<ul><li>L = [4, 7, 2] : L[0] = 4, L[-1] = 2 (dernier), len(L) = 3 ; L.append(x) ajoute à la fin.</li><li>Maximum : m ← premier élément ; pour chaque v : si v &gt; m alors m ← v (RANSAC : Score_max et D_max).</li><li>def f(a, b): … return … puis y = f(2, 3).</li><li>Image en gris : 0 (noir) à 255 (blanc) ; DINO : G ≤ 127 → noir.</li></ul><p class="astuce">Les indices commencent à 0 : le 3<sup>e</sup> élément est L[2].</p>`,
        quiz: [{ enonce: "L = [5, 8, 3] : L[1] vaut…", choix: ["8", "5", "3"], bonne: 0 }, { enonce: "Niveau de gris 255 :", choix: ["blanc", "noir", "gris moyen"], bonne: 0 }] },
      { id: "tsi-s12-ia-apprentissage", titre: "Apprentissage automatique",
        recto: "Supervisé ou non ? Classification ou régression ? À quoi servent les données de test ?",
        verso: `<ul><li><b>Supervisé</b> : exemples <b>étiquetés</b> → <b>classification</b> (une catégorie : salade / adventice) ou <b>régression</b> (une valeur : température, prix).</li><li><b>Non supervisé</b> : données sans étiquette → regroupement.</li><li>Données d'<b>entraînement</b> (≈ 70 à 80 %) pour ajuster le modèle ; données de <b>test</b>, jamais vues, pour l'évaluer.</li></ul><p class="astuce">Sur-apprentissage : excellent à l'entraînement, mauvais au test → appris par cœur.</p>`,
        quiz: [{ enonce: "Prédire la température de demain :", choix: ["régression", "classification", "regroupement"], bonne: 0 }, { enonce: "Les données de test sont…", choix: ["jamais vues pendant l'entraînement", "les mêmes que celles d'entraînement", "sans étiquette"], bonne: 0 }, { enonce: "Entraînement 100 %, test 62 % :", choix: ["sur-apprentissage", "modèle idéal", "modèle trop simple"], bonne: 0 }] },
      { id: "tsi-s12-ia-neurone", titre: "Le neurone artificiel",
        recto: "Comment un neurone artificiel calcule-t-il sa sortie ?",
        verso: `<div class="formule">s = w₁·x₁ + w₂·x₂ + … + b &nbsp;→&nbsp; y = f(s)</div><ul><li>x : entrées · w : <b>poids</b> · b : <b>biais</b> · f : fonction d'<b>activation</b>.</li><li>Seuil : y = 1 si s ≥ 0, sinon 0 · ReLU : y = max(0, s).</li><li>Apprendre = ajuster poids et biais pour réduire les erreurs sur les exemples.</li></ul><p class="astuce">Attention aux signes : un poids négatif fait baisser s.</p>`,
        quiz: [{ enonce: "Entraîner un neurone, c'est ajuster…", choix: ["les poids et le biais", "les entrées", "les données de test"], bonne: 0 }, { enonce: "ReLU(−2) = ?", choix: ["0", "−2", "2"], bonne: 0 }] },
      { id: "tsi-s12-ia-evaluation", titre: "Évaluer un modèle : matrice de confusion",
        recto: "Comment calculer un taux de réussite à partir d'une matrice de confusion ?",
        verso: `<div class="formule">taux de réussite = bonnes prédictions / total × 100</div><ul><li>Matrice de confusion : lignes = classe <b>réelle</b>, colonnes = classe <b>prédite</b>.</li><li>Bonnes prédictions sur la <b>diagonale</b> ; erreurs hors diagonale.</li><li>On évalue toujours sur les données de <b>test</b>.</li></ul><p class="astuce">Les erreurs n'ont pas le même coût : prendre une salade pour une adventice, c'est risquer de la biner.</p>`,
        quiz: [{ enonce: "Les bonnes prédictions sont…", choix: ["sur la diagonale", "sur la première ligne", "hors diagonale"], bonne: 0 }, { enonce: "45 bonnes réponses sur 50 :", choix: ["90 %", "45 %", "95 %"], bonne: 0 }] }
    ]
  });

  /* =================== S13 · Signaux périodiques et filtrage =================== */
  const USAGES = (() => {
    const E = { "Passe-bas": "Le passe-bas laisse passer les fréquences inférieures à f<sub>c</sub> (dont le continu, 0 Hz) et atténue les hautes fréquences.",
      "Passe-haut": "Le passe-haut laisse passer les fréquences supérieures à f<sub>c</sub> et supprime les basses fréquences, dont le continu.",
      "Passe-bande": "Le passe-bande ne laisse passer qu'une bande [f<sub>c1</sub> ; f<sub>c2</sub>] autour de f<sub>0</sub>.",
      "Réjecteur de bande": "Le réjecteur (coupe-bande, « trappe ») atténue une plage étroite de fréquences et laisse passer le reste." };
    return [["Ne garder que les sons graves envoyés à un caisson de basses", "Passe-bas"], ["Atténuer les sons aigus d'un signal audio", "Passe-bas"], ["Récupérer la valeur moyenne (composante continue) d'un signal", "Passe-bas"],
      ["Supprimer la composante continue d'un signal pour ne garder que sa partie alternative", "Passe-haut"], ["Envoyer uniquement les aigus vers un tweeter", "Passe-haut"],
      ["Extraire l'harmonique de rang 3 d'un signal carré", "Passe-bande"], ["Isoler une station radio dans un récepteur", "Passe-bande"],
      ["Éliminer un parasite à 50 Hz sur une plage étroite en gardant le reste du signal", "Réjecteur de bande"], ["Supprimer un sifflement à 1 kHz sans toucher aux autres fréquences", "Réjecteur de bande"]].map((u) => [u[0], u[1], E[u[1]]]);
  })();
  const MONTAGES = [
    ["Ve → R en série → Vs ; C entre Vs et la masse", "Passe-bas", "En basse fréquence C se comporte comme un circuit ouvert (Vs ≈ Ve) ; en haute fréquence comme un fil vers la masse (Vs ≈ 0)."],
    ["Ve → C en série → Vs ; R entre Vs et la masse (exercice du cours : C = 100 nF, R = 159 Ω)", "Passe-haut", "C bloque le continu et les basses fréquences, il laisse passer les hautes fréquences vers R et la sortie."],
    ["Cellule passe-haut (f<sub>c</sub> = 300 Hz) suivie d'une cellule passe-bas (f<sub>c</sub> = 3,4 kHz)", "Passe-bande", "Seules les fréquences à la fois supérieures à 300 Hz et inférieures à 3,4 kHz passent."],
    ["Deux cellules R–C passe-bas identiques en cascade, séparées par un ALI suiveur", "Passe-bas", "Deux passe-bas en cascade restent un passe-bas, mais d'ordre 2 (−40 dB/décade)."],
    ["Somme des sorties d'un passe-bas (f<sub>c</sub> = 40 Hz) et d'un passe-haut (f<sub>c</sub> = 60 Hz) recevant le même signal", "Réjecteur de bande", "Tout passe sauf la zone autour de 50 Hz, ni assez basse ni assez haute."]
  ];
  const GAINS_TYPES = [["10", "20 dB"], ["100", "40 dB"], ["1 000", "60 dB"], ["0,1", "−20 dB"], ["0,01", "−40 dB"], ["1", "0 dB"], ["1/√2 ≈ 0,707", "−3 dB"], ["2", "≈ 6 dB"], ["0,5", "≈ −6 dB"]].map((g) => [g[0], g[1], `G = 20·log(${g[0]}) = ${g[1]}.`]);
  const RS = [100, 159, 220, 330, 470, 1000, 1500, 2200, 3300, 4700, 10000], CS = [10e-9, 22e-9, 47e-9, 100e-9, 220e-9, 470e-9, 1e-6];

  SIP.definirModule({
    id: "tsi-s13-filtrage",
    niveaux: ["TSI"],
    sequence: "S13 · Signal et transmission",
    titre: "Signaux périodiques et filtrage",
    description: "Série de Fourier et spectre, types de filtres, gain en dB, fréquence de coupure à −3 dB, bande passante, filtre RC et filtre actif à ALI.",
    competences: ["A4", "M8", "A11"],
    nbQuestions: 10,
    questions: [
      // --- Fourier, spectre ---
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const f = r.pick([50, 100, 125, 200, 250, 440, 500, 1000]), n = r.int(2, 9);
          return { enonce: `Un signal périodique a pour fréquence <b>f = ${nb(f)} Hz</b>. Fréquence de son <b>harmonique de rang ${n}</b> ?`, reponse: n * f, unite: "Hz", tolerance: 1, explication: `L'harmonique de rang n a pour fréquence n·f : ${n} × ${nb(f)} = ${nb(n * f)} Hz.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const f = r.pick([50, 100, 200, 250, 500]), n = r.int(2, 11);
          return { enonce: `Le spectre d'un signal de fréquence <b>${nb(f)} Hz</b> présente une raie à <b>${nb(n * f)} Hz</b>. Quel est le rang de cet harmonique ?`, reponse: n, absolu: 0.4, explication: `n = f<sub>raie</sub> / f = ${nb(n * f)} / ${nb(f)} = ${n}.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const A = r.pick([1, 2, 3, 5, 6, 10, 12]), n = r.pick([1, 3, 5, 7, 9]), a = 4 * A / (n * Math.PI);
          return { enonce: `Signal carré alternatif d'amplitude <b>A = ${A} V</b> (il vaut +${A} V puis −${A} V). Amplitude de ${n === 1 ? "son <b>fondamental</b>" : `son <b>harmonique de rang ${n}</b>`} ?`, reponse: a, unite: "V", explication: `Amplitude = 4A/(nπ) = 4 × ${A} / (${n} × π) = ${nb(a)} V.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const X = r.pick([2, 3, 4, 6, 8, 12, 15]), n = r.pick([3, 5, 7, 9]);
          return { enonce: `Dans le spectre d'un signal carré alternatif, le fondamental a une amplitude de <b>${X} V</b>. Amplitude de l'harmonique de rang ${n} ?`, reponse: X / n, unite: "V", explication: `Les amplitudes valent 4A/(nπ) : celle de rang n est celle du fondamental divisée par n → ${X} / ${n} = ${nb(X / n)} V.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const f = r.pick([50, 100, 200, 250, 500, 1000]), pair = r.pick([2, 4, 6]), pres = r.melange([1, 3, 5, 7, 9]).slice(0, 3);
          return qcm(`Signal carré alternatif de fréquence <b>${fHz(f)}</b>. Laquelle de ces fréquences est <b>absente</b> de son spectre ?`, fHz(pair * f), pres.map((n) => fHz(n * f)), `Un carré alternatif ne contient que les harmoniques de rang impair (f, 3f, 5f…). ${fHz(pair * f)} = ${pair} × ${fHz(f)} est de rang pair → absente.`); } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const T = r.pick([0.5, 1, 2, 4, 5, 10, 20]), n = r.pick([3, 5, 7]), f = 1000 / T;
          return { enonce: `Signal carré de <b>période T = ${nb(T)} ms</b>. Fréquence de son harmonique de rang ${n} ?`, reponse: n * f, unite: "Hz", tolerance: 1, explication: `f = 1/T = 1/(${nb(T)}×10<sup>−3</sup>) = ${nb(f)} Hz ; harmonique ${n} : ${n} × ${nb(f)} = ${nb(n * f)} Hz.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const f0 = r.pick([50, 100, 200, 250, 500, 1000]), A = r.pick([2, 3, 4, 5, 6]), V0 = r.pick([0, 1, 1.5, 2, 3]), lignes = [];
          if (V0) lignes.push(["0 (continu)", `${nb(V0)} V`]); [1, 3, 5, 7].forEach((n) => lignes.push([nb(n * f0), `${nb(4 * A / (n * Math.PI), 3)} V`]));
          const t = tab(["f (Hz)", "Amplitude"], lignes), v = V0 ? r.int(0, 2) : r.int(0, 1);
          if (v === 0) return { enonce: `Spectre d'un signal périodique :${t}Fréquence du fondamental ?`, reponse: f0, unite: "Hz", tolerance: 1, explication: `Le fondamental est la première raie après le continu : ${nb(f0)} Hz ; les autres sont les harmoniques de rangs 3, 5 et 7.` };
          if (v === 1) return { enonce: `Spectre d'un signal périodique :${t}Période du signal ?`, reponse: 1000 / f0, unite: "ms", tolerance: 1, explication: `La fréquence du signal est celle du fondamental, ${nb(f0)} Hz : T = 1/f = ${nb(1000 / f0)} ms.` };
          return { enonce: `Spectre d'un signal périodique :${t}Valeur moyenne du signal ?`, reponse: V0, unite: "V", tolerance: 1, explication: `La valeur moyenne est la composante continue, raie à 0 Hz : ${nb(V0)} V.` }; } },
      { fiche: "tsi-s13-fi-fourier", gen: (r) => { const f = r.pick([50, 100, 200, 500, 1000]), k = r.int(2, 12), fc = f * (k + 0.5), raies = []; for (let n = 1; n <= k; n += 2) raies.push(n * f);
          return { enonce: `Un signal carré alternatif de <b>${fHz(f)}</b> traverse un <b>passe-bas idéal de f<sub>c</sub> = ${fHz(fc)}</b>. Combien de raies sinusoïdales reste-t-il en sortie ?`, reponse: raies.length, absolu: 0.4, explication: `Harmoniques impairs sous f<sub>c</sub> : ${raies.map(fHz).join(", ")} → ${raies.length} raie(s).` }; } },
      // --- types de filtres ---
      { fiche: "tsi-s13-fi-types", gen: (r) => qcmListe(r, USAGES, (x) => `${x} : quel filtre utiliser ?`) },
      { fiche: "tsi-s13-fi-types", gen: (r) => { const f0 = r.pick([50, 100, 200, 500, 1000]), V0 = r.pick([1, 2, 3, 5]), comps = [0, f0, 3 * f0, 5 * f0, 7 * f0], lab = (f) => (f === 0 ? `continu (${V0} V)` : fHz(f)), F = [];
          for (let i = 0; i < 4; i++) { const fc = (comps[i] + comps[i + 1]) / 2; F.push({ nom: `passe-bas idéal, f<sub>c</sub> = ${fHz(fc)}`, g: (f) => f < fc }); F.push({ nom: `passe-haut idéal, f<sub>c</sub> = ${fHz(fc)}`, g: (f) => f > fc }); }
          [1, 3, 5].forEach((n) => { const a = n * f0 - f0 / 2, b = n * f0 + f0 / 2; F.push({ nom: `passe-bande idéal [${fHz(a)} ; ${fHz(b)}]`, g: (f) => f > a && f < b }); F.push({ nom: `réjecteur de bande idéal [${fHz(a)} ; ${fHz(b)}]`, g: (f) => !(f > a && f < b) }); });
          const Fi = r.pick(F), txt = (x) => comps.filter(x.g).map(lab).join(" + "), bonne = txt(Fi);
          return qcm(`Un signal contient : ${comps.map(lab).join(" + ")}. Il traverse un <b>${Fi.nom}</b>. Que contient la sortie ?`, bonne, r.melange(F.map(txt)), `Un filtre idéal transmet intégralement les composantes de sa bande passante et supprime les autres ; le continu est une composante à 0 Hz. Sortie : ${bonne}.`); } },
      { fiche: "tsi-s13-fi-types", gen: (r) => { const f = r.pick([100, 200, 500, 1000]), n = r.pick([3, 5, 7]), h = f / 2, B = (a, b) => `f<sub>c1</sub> = ${fHz(a)} ; f<sub>c2</sub> = ${fHz(b)}`;
          return qcm(`On veut extraire l'<b>harmonique de rang ${n}</b> d'un signal carré de <b>${fHz(f)}</b> avec un passe-bande idéal. Quelles fréquences de coupure choisir ?`, B(n * f - h, n * f + h), [B((n - 2) * f - h, n * f + h), B(n * f - h, (n + 2) * f + h), B((n + 1) * f - h, (n + 1) * f + h)],
            `L'harmonique ${n} est à ${fHz(n * f)} ; ses voisins (${fHz((n - 2) * f)} et ${fHz((n + 2) * f)}) doivent rester hors de la bande. Autour de ${fHz((n + 1) * f)}, il n'y a aucune raie (rangs pairs absents).`); } },
      // --- gain, coupure, bande passante ---
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const Ve = r.pick([1, 2, 5, 10]), A = r.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 1.5, 2, 2.5, 4, 5, 8, 10, 20]), Vs = +(A * Ve).toPrecision(3), G = 20 * Math.log10(Vs / Ve);
          return { enonce: `Un filtre reçoit <b>V<sub>e max</sub> = ${nb(Ve)} V</b> et délivre <b>V<sub>s max</sub> = ${nb(Vs)} V</b>. Gain G ?`, reponse: G, unite: "dB", absolu: 0.2, explication: `A = V<sub>s max</sub>/V<sub>e max</sub> = ${nb(Vs)}/${nb(Ve)} = ${nb(Vs / Ve)} ; G = 20·log(A) = ${nb(G, 3)} dB (${G > 0 ? "amplification" : "atténuation"}).` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const G = r.pick([-40, -26, -20, -12, -6, -3, 6, 10, 14, 20, 26, 40]), A = 10 ** (G / 20);
          return { enonce: `Le gain d'un filtre vaut <b>G = ${nb(G)} dB</b> à une certaine fréquence. Coefficient d'amplification A = V<sub>s</sub>/V<sub>e</sub> ?`, reponse: A, explication: `G = 20·log(A) → A = 10<sup>G/20</sup> = 10<sup>${nb(G)}/20</sup> = ${nb(A, 3)}.` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const Ve = r.pick([0.5, 1, 2, 5, 10, 12]), G = r.pick([-20, -12, -10, -6, -3, 3, 6, 12, 20]), Vs = Ve * 10 ** (G / 20);
          return { enonce: `Signal d'entrée de valeur efficace <b>V<sub>e</sub> = ${nb(Ve)} V</b>, gain du filtre à cette fréquence <b>G = ${nb(G)} dB</b>. Valeur efficace de sortie V<sub>s</sub> ?`, reponse: Vs, unite: "V", explication: `A = 10<sup>G/20</sup> = ${nb(10 ** (G / 20), 3)} ; V<sub>s</sub> = A × V<sub>e</sub> = ${nb(10 ** (G / 20), 3)} × ${nb(Ve)} = ${nb(Vs, 3)} V.` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const Gm = r.pick([0, 6, 10, 12, 14, 20, 26]);
          return { enonce: `Un filtre a un gain maximal <b>G<sub>max</sub> = ${Gm} dB</b>. Quel est son gain à la fréquence de coupure ?`, reponse: Gm - 3, unite: "dB", absolu: 0.1, explication: `À f<sub>c</sub>, le signal est atténué de 3 dB par rapport au gain maximal : G = ${Gm} − 3 = ${Gm - 3} dB.` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const f1 = r.pas(200, 2000, 50), B = r.pick([100, 150, 200, 500, 1000, 3000]), f2 = f1 + B;
          if (r.int(0, 1)) return { enonce: `Un filtre passe-bande a pour fréquences de coupure à −3 dB <b>f<sub>c1</sub> = ${nb(f1)} Hz</b> et <b>f<sub>c2</sub> = ${nb(f2)} Hz</b>. Bande passante ?`, reponse: B, unite: "Hz", tolerance: 1, explication: `Bande passante = f<sub>c2</sub> − f<sub>c1</sub> = ${nb(f2)} − ${nb(f1)} = ${nb(B)} Hz.` };
          return { enonce: `Un filtre passe-bande a une bande passante de <b>${nb(B)} Hz</b> et une fréquence de coupure basse <b>f<sub>c1</sub> = ${nb(f1)} Hz</b>. Fréquence de coupure haute f<sub>c2</sub> ?`, reponse: f2, unite: "Hz", tolerance: 1, explication: `f<sub>c2</sub> = f<sub>c1</sub> + bande passante = ${nb(f1)} + ${nb(B)} = ${nb(f2)} Hz.` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const fc = r.pick([100, 200, 500, 1000, 2000, 5000]), Ve = r.pick([1, 2, 5, 10]), ph = r.int(0, 1) === 1, ks = [0.1, 0.5, 1, 2, 10];
          const lignes = ks.map((x) => [fHz(x * fc), `${nb(Ve * (ph ? x : 1) / Math.sqrt(1 + x * x), 3)} V`]);
          return qcm(`Mesures sur un filtre ${ph ? "passe-haut" : "passe-bas"} (V<sub>e max</sub> = ${Ve} V constante) :${tab(["f", "V<sub>s max</sub>"], lignes)}Quelle est la fréquence de coupure à −3 dB ?`, fHz(fc), r.melange(ks.filter((x) => x !== 1).map((x) => fHz(x * fc))),
            `Dans la bande passante, V<sub>s max</sub> ≈ ${Ve} V. À f<sub>c</sub>, V<sub>s max</sub> = ${Ve}/√2 ≈ ${nb(Ve / Math.SQRT2, 3)} V, soit G = G<sub>max</sub> − 3 dB → f<sub>c</sub> = ${fHz(fc)}.`); } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const f0 = r.pick([100, 500, 1000, 2000]), ks = [0.01, 0.1, 1, 10, 100], typ = r.int(0, 3), noms = ["Passe-bas", "Passe-haut", "Passe-bande", "Réjecteur de bande"];
          const Gf = [(x) => -10 * Math.log10(1 + x * x), (x) => -10 * Math.log10(1 + 1 / (x * x)), (x) => -10 * Math.log10(1 + (x - 1 / x) ** 2), (x) => Math.max(-40, 20 * Math.log10(Math.abs(1 - x * x) / Math.sqrt((1 - x * x) ** 2 + x * x)))];
          const fmt = (g) => { const v = Math.round(g * 10) / 10; return v === 0 ? "0" : nb(v); };
          const E = ["Gain ≈ 0 dB en basses fréquences, puis chute au-delà de f<sub>c</sub> : passe-bas.", "Gain très faible en basses fréquences, ≈ 0 dB en hautes fréquences : passe-haut.", "Gain maximal autour d'une fréquence centrale, faible des deux côtés : passe-bande.", "Gain ≈ 0 dB partout sauf un creux autour d'une fréquence : réjecteur de bande."];
          return { type: "qcm", enonce: `Gain mesuré d'un filtre :${tab(["f", "G"], ks.map((k) => [fHz(k * f0), `${fmt(Gf[typ](k))} dB`]))}De quel type de filtre s'agit-il ?`, choix: noms, bonne: typ, explication: E[typ] }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => { const G = r.pick([-20, -6, -3, -1, 0, 3, 6, 20]), b = G > 0 ? 0 : G < 0 ? 1 : 2;
          return { type: "qcm", enonce: `À une fréquence donnée, un filtre a un gain <b>G = ${nb(G)} dB</b>. Que fait-il au signal ?`, choix: ["Il l'amplifie", "Il l'atténue", "Ni amplification ni atténuation (A = 1)", "Impossible : un gain en dB est toujours positif"], bonne: b,
            explication: `G = 20·log(A) : G &gt; 0 ⇔ A &gt; 1 (amplification), G &lt; 0 ⇔ A &lt; 1 (atténuation), G = 0 ⇔ A = 1. Ici A = ${nb(10 ** (G / 20), 3)}.` }; } },
      { fiche: "tsi-s13-fi-gain", gen: (r) => qcmListe(r, GAINS_TYPES, (x) => `Sans calculatrice : un coefficient d'amplification A = <b>${x}</b> correspond à un gain de…`) },
      // --- filtre RC, ordre ---
      { fiche: "tsi-s13-fi-rc", gen: (r) => { const R = r.pick(RS), C = r.pick(CS), fc = 1 / (2 * Math.PI * R * C);
          return { enonce: `Filtre RC : <b>R = ${fR(R)}</b>, <b>C = ${fC(C)}</b>. Fréquence de coupure f<sub>c</sub> ?`, reponse: fc, unite: "Hz", explication: `f<sub>c</sub> = 1/(2π·R·C) = 1/(2π × ${nb(R)} × ${nb(C * 1e9)}×10<sup>−9</sup>) = ${nb(fc)} Hz.` }; } },
      { fiche: "tsi-s13-fi-rc", gen: (r) => { const R = r.pick([1000, 2200, 4700, 10000]), fc = r.pick([50, 100, 300, 1000, 3400, 10000]), C = 1 / (2 * Math.PI * R * fc);
          return { enonce: `On veut un filtre RC de fréquence de coupure <b>f<sub>c</sub> = ${fHz(fc)}</b> avec <b>R = ${fR(R)}</b>. Valeur de C (en nF) ?`, reponse: C * 1e9, unite: "nF", explication: `C = 1/(2π·R·f<sub>c</sub>) = 1/(2π × ${nb(R)} × ${nb(fc)}) = ${nb(C * 1e9)}×10<sup>−9</sup> F = ${nb(C * 1e9)} nF.` }; } },
      { fiche: "tsi-s13-fi-rc", gen: (r) => { const C = r.pick([10e-9, 47e-9, 100e-9, 220e-9, 1e-6]), fc = r.pick([100, 500, 1000, 2000, 10000]), R = 1 / (2 * Math.PI * C * fc);
          return { enonce: `Filtre RC avec <b>C = ${fC(C)}</b>. Quelle résistance R donne <b>f<sub>c</sub> = ${fHz(fc)}</b> ?`, reponse: R, unite: "Ω", explication: `R = 1/(2π·C·f<sub>c</sub>) = 1/(2π × ${nb(C * 1e9)}×10<sup>−9</sup> × ${nb(fc)}) = ${nb(R)} Ω.` }; } },
      { fiche: "tsi-s13-fi-rc", gen: (r) => qcmListe(r, MONTAGES, (x) => `Montage : ${x}. Quel type de filtre obtient-on ?`) },
      { fiche: "tsi-s13-fi-rc", gen: (r) => { const n = r.int(1, 4), k = r.pick([1, 2]), fc = r.pick([100, 200, 500, 1000]), G = -20 * n * k;
          return { enonce: `Filtre passe-bas d'<b>ordre ${n}</b>, G<sub>max</sub> = 0 dB, f<sub>c</sub> = ${fHz(fc)}. Gain approximatif (asymptote) à <b>f = ${fHz(fc * 10 ** k)}</b> ?`, reponse: G, unite: "dB", absolu: 1, explication: `Au-delà de f<sub>c</sub>, la pente est de −20 × ${n} = ${-20 * n} dB/décade ; ${fHz(fc * 10 ** k)} est ${k} décade(s) au-dessus de f<sub>c</sub> → G ≈ ${-20 * n} × ${k} = ${G} dB.` }; } },
      { fiche: "tsi-s13-fi-rc", gen: (r) => { const Ve = r.pick([1, 2, 3, 5, 10, 12]);
          return { enonce: `Filtre RC passif (A<sub>max</sub> = 1) attaqué par une sinusoïde de valeur efficace <b>${nb(Ve)} V</b> à <b>f = f<sub>c</sub></b>. Valeur efficace de la sortie ?`, reponse: Ve / Math.SQRT2, unite: "V", tolerance: 1.5, explication: `À f<sub>c</sub>, G = −3 dB soit A = 1/√2 ≈ 0,707 : V<sub>s</sub> = ${nb(Ve)} / √2 = ${nb(Ve / Math.SQRT2, 3)} V.` }; } },
      // --- filtre actif ---
      { fiche: "tsi-s13-fi-actif", gen: (r) => { const R = r.pick([1000, 2200, 4700, 10000]), C = r.pick([10e-9, 22e-9, 47e-9, 100e-9]), [R1, R2] = r.pick([[1000, 1000], [1000, 2200], [10000, 22000], [10000, 47000], [4700, 47000], [2200, 10000]]), A0 = 1 + R2 / R1, G0 = 20 * Math.log10(A0), fc = 1 / (2 * Math.PI * R * C);
          const en = `Filtre actif passe-bas : cellule RC (R = ${fR(R)}, C = ${fC(C)}) suivie d'un ALI en amplificateur non inverseur (R<sub>1</sub> = ${fR(R1)}, R<sub>2</sub> = ${fR(R2)}).`;
          return r.int(0, 1) ? { enonce: `${en} Gain G<sub>0</sub> dans la bande passante ?`, reponse: G0, unite: "dB", absolu: 0.2, explication: `A<sub>0</sub> = 1 + R<sub>2</sub>/R<sub>1</sub> = 1 + ${nb(R2 / R1)} = ${nb(A0)} ; G<sub>0</sub> = 20·log(${nb(A0)}) = ${nb(G0, 3)} dB.` }
            : { enonce: `${en} Fréquence de coupure ?`, reponse: fc, unite: "Hz", explication: `La cellule RC fixe f<sub>c</sub> = 1/(2π·R·C) = ${nb(fc)} Hz ; l'ALI ne fait qu'amplifier (A<sub>0</sub> = ${nb(A0)}).` }; } },
      { fiche: "tsi-s13-fi-actif", gen: (r) => { const [R1, R2] = r.pick([[1000, 10000], [2200, 22000], [4700, 10000], [10000, 47000], [1000, 4700], [10000, 100000]]), C = r.pick([1e-9, 2.2e-9, 4.7e-9, 10e-9, 22e-9, 47e-9]), A0 = R2 / R1, fc = 1 / (2 * Math.PI * R2 * C), q = r.int(0, 2);
          const en = `Filtre actif passe-bas inverseur : R<sub>1</sub> = ${fR(R1)} en entrée, R<sub>2</sub> = ${fR(R2)} en parallèle avec C = ${fC(C)} dans la contre-réaction.`;
          if (q === 0) return { enonce: `${en} Coefficient d'amplification |A<sub>0</sub>| dans la bande passante ?`, reponse: A0, tolerance: 1, explication: `En basse fréquence C est un circuit ouvert : montage inverseur, V<sub>s</sub>/V<sub>e</sub> = −R<sub>2</sub>/R<sub>1</sub> → |A<sub>0</sub>| = ${nb(R2)}/${nb(R1)} = ${nb(A0)}.` };
          if (q === 1) return { enonce: `${en} Gain G<sub>0</sub> dans la bande passante ?`, reponse: 20 * Math.log10(A0), unite: "dB", absolu: 0.2, explication: `|A<sub>0</sub>| = R<sub>2</sub>/R<sub>1</sub> = ${nb(A0)} → G<sub>0</sub> = 20·log(${nb(A0)}) = ${nb(20 * Math.log10(A0), 3)} dB.` };
          return { enonce: `${en} Fréquence de coupure ? (f<sub>c</sub> = 1/(2π·R<sub>2</sub>·C))`, reponse: fc, unite: "Hz", explication: `f<sub>c</sub> = 1/(2π × ${nb(R2)} × ${nb(C * 1e9)}×10<sup>−9</sup>) = ${nb(fc)} Hz.` }; } },
      // --- QCM fixes ---
      { type: "qcm", fiche: "tsi-s13-fi-fourier", enonce: "Que dit la décomposition en série de Fourier ?", choix: ["Tout signal périodique de fréquence f est une somme de sinusoïdes de fréquences f, 2f, 3f… (plus une éventuelle composante continue)", "Tout signal est une somme de signaux carrés", "Seuls les signaux sinusoïdaux ont un spectre", "Un signal périodique ne contient qu'une seule fréquence"], bonne: 0, explication: "Le fondamental a la fréquence f du signal ; l'harmonique de rang n a la fréquence n·f." },
      { type: "qcm", fiche: "tsi-s13-fi-fourier", enonce: "Dans le spectre d'un signal carré alternatif (±A), quels harmoniques sont présents ?", choix: ["Les rangs impairs seulement (1, 3, 5, 7…), d'amplitude 4A/(nπ)", "Tous les rangs, avec la même amplitude", "Les rangs pairs seulement", "Aucun : un carré n'a qu'une seule raie"], bonne: 0, explication: "Cours : s(t) = 4A/π [sin(2πf<sub>0</sub>t) + 1/3 sin(2π3f<sub>0</sub>t) + 1/5 sin(2π5f<sub>0</sub>t) + …]." },
      { type: "qcm", fiche: "tsi-s13-fi-types", enonce: "Un filtre passe-bas peut aussi être appelé…", choix: ["Filtre coupe-haut", "Filtre coupe-bas", "Filtre trappe", "Filtre passe-bande"], bonne: 0, explication: "Il laisse passer ce qui est bas et coupe les hautes fréquences (les aigus d'un signal audio)." },
      { type: "qcm", fiche: "tsi-s13-fi-types", enonce: "Le filtre « trappe », ou coupe-bande, c'est…", choix: ["Le réjecteur de bande : il atténue une plage de fréquences", "Un passe-bande très étroit", "Un passe-bas d'ordre élevé", "Un filtre qui laisse tout passer"], bonne: 0, explication: "Complémentaire du passe-bande, il sert par exemple à éliminer un parasite sur une plage de fréquences étroite." },
      { type: "qcm", fiche: "tsi-s13-fi-types", enonce: "Un signal carré de 0 à 6 V, de fréquence 1 kHz, entre dans un <b>passe-bas idéal de f<sub>c</sub> = 0,1 Hz</b>. Que vaut V<sub>s</sub> ?", choix: ["Une tension continue de 3 V", "Le même signal carré 0–6 V", "Une sinusoïde de 1 kHz", "0 V en permanence"], bonne: 0, explication: "Seule la composante continue (0 Hz), égale à la valeur moyenne 3 V, est sous f<sub>c</sub> ; le 1 kHz et ses harmoniques sont supprimés." },
      { type: "qcm", fiche: "tsi-s13-fi-gain", enonce: "À la fréquence de coupure à −3 dB, l'amplitude de sortie vaut…", choix: ["V<sub>s max</sub>/√2 ≈ 0,707 × V<sub>s max</sub>", "V<sub>s max</sub>/2", "V<sub>s max</sub>/3", "0 V"], bonne: 0, explication: "−3 dB ⇔ A divisé par √2 : 20·log(1/√2) = −3,01 dB." },
      { type: "qcm", fiche: "tsi-s13-fi-rc", enonce: "Un filtre du <b>2<sup>e</sup> ordre</b>, comparé à un filtre du 1<sup>er</sup> ordre de même f<sub>c</sub>…", choix: ["Atténue plus vite hors de la bande passante : −40 dB/décade au lieu de −20 dB/décade", "A une fréquence de coupure deux fois plus grande", "Amplifie deux fois plus dans la bande passante", "Ne coupe plus aucune fréquence"], bonne: 0, explication: "Chaque ordre ajoute −20 dB/décade à la pente de l'asymptote : le filtre est plus sélectif." },
      { type: "qcm", fiche: "tsi-s13-fi-actif", enonce: "Avantage d'un filtre <b>actif</b> (à ALI) sur un filtre passif RC ?", choix: ["Il peut amplifier (G &gt; 0 dB) et sa sortie n'est pas perturbée par la charge", "Il n'a pas besoin d'alimentation", "Il n'utilise ni résistance ni condensateur", "Il laisse passer toutes les fréquences sans atténuation"], bonne: 0, explication: "L'ALI, alimenté (±15 V…), apporte de l'énergie : gain possible et faible impédance de sortie. Un filtre passif a toujours A ≤ 1." },
      { type: "qcm", fiche: "tsi-s13-fi-actif", enonce: "Dans un filtre actif, l'ALI fonctionne en régime…", choix: ["Linéaire, grâce à une contre-réaction sur l'entrée inverseuse e−", "Saturé, comme un comparateur", "Non linéaire, avec une réaction sur e+", "Impulsionnel"], bonne: 0, explication: "Contre-réaction sur e− → régime linéaire, ε = 0 V : on peut écrire V+ = V−." }
    ],
    fiches: [
      { id: "tsi-s13-fi-fourier", titre: "Série de Fourier et spectre",
        recto: "Que contient le spectre d'un signal périodique, et celui d'un signal carré ?",
        verso: `<div class="formule">s(t) = 4A/π [sin(2πf₀t) + ⅓ sin(2π·3f₀t) + ⅕ sin(2π·5f₀t) + …]</div><ul><li>Fondamental : f₀ = 1/T ; harmonique de rang n : fréquence <b>n·f₀</b>.</li><li>Spectre : amplitude de chaque raie en fonction de f ; raie à 0 Hz = composante continue (valeur moyenne).</li></ul><p class="astuce">Carré alternatif : rangs impairs seulement, amplitude 4A/(nπ), soit celle du fondamental divisée par n.</p>`,
        quiz: [{ enonce: "Harmonique 3 d'un signal de 200 Hz :", choix: ["600 Hz", "203 Hz", "66,7 Hz"], bonne: 0 }, { enonce: "Un carré alternatif contient…", choix: ["les rangs impairs", "les rangs pairs", "tous les rangs"], bonne: 0 }] },
      { id: "tsi-s13-fi-types", titre: "Les 4 types de filtres",
        recto: "Que laissent passer les filtres passe-bas, passe-haut, passe-bande et réjecteur de bande ?",
        verso: `<ul><li><b>Passe-bas</b> (coupe-haut) : garde f &lt; f<sub>c</sub>.</li><li><b>Passe-haut</b> (coupe-bas) : garde f &gt; f<sub>c</sub>.</li><li><b>Passe-bande</b> : garde [f<sub>c1</sub> ; f<sub>c2</sub>] autour de f<sub>0</sub> (extraire un harmonique, une station radio).</li><li><b>Réjecteur de bande</b> (coupe-bande, trappe) : supprime [f<sub>c1</sub> ; f<sub>c2</sub>] (parasite).</li></ul><p class="astuce">Le continu est à 0 Hz : seul un passe-bas le laisse passer.</p>`,
        quiz: [{ enonce: "Supprimer la composante continue :", choix: ["passe-haut", "passe-bas", "réjecteur"], bonne: 0 }, { enonce: "Filtre « trappe » :", choix: ["réjecteur de bande", "passe-bande", "passe-bas"], bonne: 0 }] },
      { id: "tsi-s13-fi-gain", titre: "Gain, fréquence de coupure, bande passante",
        recto: "Comment calcule-t-on le gain en dB et où se trouve la fréquence de coupure ?",
        verso: `<div class="formule">A = V<sub>s</sub>/V<sub>e</sub> &nbsp;·&nbsp; G = 20·log(A) en dB</div><ul><li>G &gt; 0 : amplifie · G &lt; 0 : atténue · G = 0 : ni l'un ni l'autre.</li><li>f<sub>c</sub> : G = G<sub>max</sub> − 3 dB (A divisé par √2).</li><li>Bande passante = f<sub>c2</sub> − f<sub>c1</sub>.</li></ul><p class="astuce">Repères : ×10 → +20 dB · ×2 ≈ +6 dB · ÷√2 → −3 dB · ÷10 → −20 dB.</p>`,
        quiz: [{ enonce: "A = 10 correspond à…", choix: ["20 dB", "10 dB", "1 dB"], bonne: 0 }, { enonce: "G<sub>max</sub> = 12 dB, gain à f<sub>c</sub> :", choix: ["9 dB", "6 dB", "12 dB"], bonne: 0 }] },
      { id: "tsi-s13-fi-rc", titre: "Filtre RC et ordre d'un filtre",
        recto: "Fréquence de coupure d'un filtre RC ? Comment reconnaître passe-bas et passe-haut ? Que change l'ordre ?",
        verso: `<div class="formule">f<sub>c</sub> = 1 / (2π·R·C)</div><ul><li>R en série, C en sortie → <b>passe-bas</b> ; C en série, R en sortie → <b>passe-haut</b>.</li><li>Ordre 1 : −20 dB/décade au-delà de f<sub>c</sub> ; ordre n : −20n dB/décade.</li><li>À f<sub>c</sub> : V<sub>s</sub> = V<sub>e</sub>/√2 pour un filtre passif.</li></ul><p class="astuce">C en farads : 100 nF = 100×10⁻⁹ F. Cours : R = 159 Ω, C = 100 nF → f<sub>c</sub> ≈ 10 kHz.</p>`,
        quiz: [{ enonce: "Si C double, f<sub>c</sub>…", choix: ["est divisée par 2", "double", "ne change pas"], bonne: 0 }, { enonce: "Pente d'un filtre d'ordre 2 :", choix: ["−40 dB/décade", "−20 dB/décade", "−3 dB/décade"], bonne: 0 }] },
      { id: "tsi-s13-fi-actif", titre: "Filtre actif à ALI",
        recto: "Qu'apporte un ALI à un filtre, et comment calculer son gain dans la bande passante ?",
        verso: `<ul><li><b>Passif</b> (R, C seuls) : A ≤ 1, sortie sensible à la charge.</li><li><b>Actif</b> : ALI alimenté en régime linéaire (contre-réaction sur e−) → peut amplifier, sortie non perturbée par la charge.</li></ul><div class="formule">non inverseur : A₀ = 1 + R₂/R₁ &nbsp;·&nbsp; inverseur (R₂ // C) : |A₀| = R₂/R₁, f<sub>c</sub> = 1/(2π·R₂·C)</div><p class="astuce">Gain en dB : G₀ = 20·log(A₀).</p>`,
        quiz: [{ enonce: "Un filtre passif peut-il avoir G &gt; 0 dB ?", choix: ["Non", "Oui", "Seulement à f<sub>c</sub>"], bonne: 0 }, { enonce: "Non inverseur, R₁ = 1 kΩ, R₂ = 9 kΩ : A₀ =", choix: ["10", "9", "0,1"], bonne: 0 }] }
    ]
  });

  /* =================== S13 · Modulations et démodulations numériques =================== */
  const ANTENNES = [["une radio FM", 100e6], ["LoRa", 868e6], ["le Wi-Fi ou le BLE", 2.4e9], ["une télécommande de portail", 433e6], ["un signal audio de 1 kHz émis en bande de base", 1e3], ["la radio CB", 27e6]];
  const VOC_MOD = [
    ["Signal sinusoïdal haute fréquence sur lequel on greffe l'information", "Porteuse"],
    ["Signal utile à transmettre (l'information)", "Signal modulant"],
    ["Résultat de la transformation de la porteuse par l'information", "Signal modulé"],
    ["Opération qui récupère le signal utile en le séparant de la porteuse", "Démodulation"],
    ["Transmission de l'information sous sa forme numérique initiale, sans porteuse", "Bande de base"],
    ["Support physique qui transporte l'information de la source vers le destinataire", "Canal de transmission"],
    ["Bande de fréquences transmises par le canal sans trop forte atténuation", "Bande passante"],
    ["Translation du spectre du signal utile pour l'adapter au canal", "Modulation"]
  ];
  const SUPPORTS = [
    ["Câble Ethernet (paires torsadées)", "Guidé : câble en cuivre"], ["Câble coaxial d'antenne TV", "Guidé : câble en cuivre"],
    ["Liaison à très haut débit entre deux villes par fibre", "Guidé : fibre optique"], ["Câble sous-marin reliant Tahiti à Hawaï", "Guidé : fibre optique"],
    ["Réseau Wi-Fi d'une maison", "Non guidé : radiofréquences"], ["Capteur LoRa dans un champ", "Non guidé : radiofréquences"], ["Faisceau hertzien entre deux relais", "Non guidé : radiofréquences"],
    ["Télécommande de téléviseur", "Non guidé : infrarouge"]
  ].map((s) => [s[0], s[1], `${s[0]} : support ${s[1].toLowerCase()}. Guidé = câble cuivre ou fibre ; non guidé = sans fil (radiofréquences, infrarouge).`]);
  const RECO_MOD = [
    ["L'amplitude vaut A<sub>p</sub> pour un 1 et A<sub>p</sub>/2 pour un 0 ; la fréquence ne change pas", "ASK", "Deux amplitudes non nulles : ASK."],
    ["La porteuse est émise pour un 1 et coupée (amplitude nulle) pour un 0", "OOK", "Tout ou rien : OOK (On Off Keying)."],
    ["La fréquence double quand on transmet un 1 ; l'amplitude reste constante", "FSK", "Seule la fréquence change : FSK."],
    ["Amplitude et fréquence constantes, mais la sinusoïde s'inverse (déphasage de 180°) selon le bit", "PSK", "Seule la phase change : PSK."],
    ["Réalisée avec un oscillateur contrôlé en tension (VCO)", "FSK", "Le VCO fait varier la fréquence avec la tension d'entrée : FSK."],
    ["Sur l'oscilloscope, l'enveloppe reproduit la suite de bits sans jamais s'annuler", "ASK", "Enveloppe à deux niveaux non nuls : ASK."],
    ["La plus simple : un interrupteur commandé par les bits sur la porteuse suffit", "OOK", "Porteuse allumée ou éteinte : OOK."],
    ["Sinusoïde d'amplitude constante dont les périodes sont tantôt courtes, tantôt deux fois plus longues", "FSK", "Période qui change = fréquence qui change : FSK."]
  ];
  const IOT_APPLI = [
    ["Capteur d'humidité dans un champ à 5 km de la ferme, 1 mesure par heure, pile qui doit durer 5 ans", "LoRa"],
    ["Compteurs d'eau d'une commune relevés à distance, quelques octets par jour", "LoRa"],
    ["Balise de suivi de pirogues dans le lagon, à plusieurs km de la côte, peu de données", "LoRa"],
    ["Montre connectée qui envoie le rythme cardiaque au smartphone", "Bluetooth Low Energy (BLE)"],
    ["Thermomètre de réfrigérateur lu par une application de téléphone, dans la même pièce", "Bluetooth Low Energy (BLE)"],
    ["Caméra de surveillance qui diffuse une vidéo HD vers la box internet", "Wi-Fi"],
    ["Ordinateur portable qui télécharge de gros fichiers dans la maison", "Wi-Fi"],
    ["Télécommande de téléviseur utilisée en vue directe à 3 m", "Infrarouge (IR)"]
  ].map((a) => [a[0], a[1], { "LoRa": "Longue portée (km), faible débit, très faible consommation : LoRa.", "Bluetooth Low Energy (BLE)": "Courte portée (≈ 10 m), débit ≈ 1 Mbit/s, faible consommation : BLE.", "Wi-Fi": "Gros débit (≥ 100 Mbit/s) sur quelques dizaines de mètres, consommation élevée : Wi-Fi.", "Infrarouge (IR)": "Quelques mètres en vue directe, très simple : infrarouge." }[a[1]]]);
  const IOT_DESC = [
    ["Portée de plusieurs km, débit de quelques kbit/s, autonomie de plusieurs années sur pile", "LoRa"],
    ["Bande 868 MHz en Europe, réseau étendu à basse consommation (LPWAN)", "LoRa"],
    ["Portée d'une dizaine de mètres, débit d'environ 1 Mbit/s, très faible consommation, appairage avec un smartphone", "BLE"],
    ["Débit de plusieurs dizaines à centaines de Mbit/s, portée de quelques dizaines de mètres, consommation élevée", "Wi-Fi"],
    ["Bandes 2,4 GHz et 5 GHz, réseau local relié à la box internet", "Wi-Fi"],
    ["Liaison à vue directe sur quelques mètres, arrêtée par un mur", "Infrarouge"]
  ];
  const DEBITS = [["LoRa (SF12)", 250], ["LoRa (SF7)", 5470], ["BLE", 1e6], ["Wi-Fi", 54e6], ["une liaison série", 9600]];

  SIP.definirModule({
    id: "tsi-s13-modulation",
    niveaux: ["TSI"],
    sequence: "S13 · Signal et transmission",
    titre: "Modulations et démodulations numériques",
    description: "Canal et bande passante, porteuse, ASK / OOK / FSK / PSK, débit binaire et rapidité, nombre d'états, Shannon, objets connectés (LoRa, BLE, Wi-Fi).",
    competences: ["A7", "M8", "A6"],
    nbQuestions: 10,
    questions: [
      // --- canal, bande de base, modulation ---
      { fiche: "tsi-s13-mo-principe", gen: (r) => { const [nom, f] = r.pick(ANTENNES), L = 3e8 / (4 * f), u = L >= 1000 ? ["km", L / 1000] : L >= 1 ? ["m", L] : ["cm", L * 100];
          return { enonce: `Une antenne quart d'onde mesure λ/4. Longueur pour ${nom} (f = ${fHz(f)}) ? (c = 3×10<sup>8</sup> m/s)`, reponse: u[1], unite: u[0], explication: `λ = c/f = 3×10<sup>8</sup> / ${nb(f)} = ${nb(3e8 / f)} m ; λ/4 = ${nb(u[1])} ${u[0]}.${f < 1e5 ? " Une antenne de plusieurs km est irréalisable : c'est pourquoi on module !" : ""}` }; } },
      { fiche: "tsi-s13-mo-principe", gen: (r) => { const L = r.pick([3, 8, 16, 25, 50, 75]), f = 3e8 / (4 * L / 100);
          return { enonce: `Une antenne quart d'onde mesure <b>${L} cm</b>. Pour quelle fréquence est-elle adaptée ? (en MHz, c = 3×10<sup>8</sup> m/s)`, reponse: f / 1e6, unite: "MHz", explication: `λ = 4 × ${L} cm = ${nb(4 * L / 100)} m ; f = c/λ = 3×10<sup>8</sup> / ${nb(4 * L / 100)} = ${nb(f / 1e6)} MHz.` }; } },
      { fiche: "tsi-s13-mo-principe", gen: (r) => { const fmin = r.pick([300, 400, 500, 1000, 2000]), B = r.pick([2000, 3100, 5000, 10000, 20000]), fmax = fmin + B;
          return { enonce: `Un canal transmet sans trop d'atténuation les signaux de <b>${fHz(fmin)}</b> à <b>${fHz(fmax)}</b>. Largeur de sa bande passante ?`, reponse: B, unite: "Hz", tolerance: 1, explication: `Bande passante = f<sub>max</sub> − f<sub>min</sub> = ${nb(fmax)} − ${nb(fmin)} = ${nb(B)} Hz.` }; } },
      { fiche: "tsi-s13-mo-principe", gen: (r) => { const fmin = r.pick([100, 200, 400]), B = r.pick([20, 40, 50]), fmax = fmin + B, Bs = r.pick([4, 6, 10]), c = r.int(0, 3), fp = [fmin + B / 2, fmax - Bs / 4, fmin + Bs / 4][c];
          const sig = c === 3 ? `Signal numérique en <b>bande de base</b>, spectre de 0 à ${Bs} kHz.` : `Signal modulé, porteuse f<sub>p</sub> = ${nb(fp)} kHz, spectre de ${nb(fp - Bs / 2)} à ${nb(fp + Bs / 2)} kHz.`;
          const E = ["Tout le spectre est compris entre f<sub>min</sub> et f<sub>max</sub> : la modulation a bien placé le signal dans la bande passante.", `Le haut du spectre (${nb(fp + Bs / 2)} kHz) dépasse f<sub>max</sub> = ${fmax} kHz : cette partie sera fortement atténuée.`, `Le bas du spectre (${nb(fp - Bs / 2)} kHz) est sous f<sub>min</sub> = ${fmin} kHz : cette partie sera fortement atténuée.`, `En bande de base, le spectre (0 à ${Bs} kHz) est entièrement sous la bande passante : il faut moduler pour le translater.`];
          return { type: "qcm", enonce: `Canal de bande passante [${fmin} kHz ; ${fmax} kHz]. ${sig} Le signal est-il transmis correctement ?`, choix: ["Oui : tout son spectre est dans la bande passante", "Non : une partie du spectre dépasse f<sub>max</sub>", "Non : une partie du spectre est sous f<sub>min</sub>", "Non : le spectre est entièrement hors de la bande passante"], bonne: c, explication: E[c] }; } },
      { fiche: "tsi-s13-mo-principe", gen: (r) => qcmListe(r, VOC_MOD, (x) => `« ${x} » : de quoi s'agit-il ?`) },
      { fiche: "tsi-s13-mo-principe", gen: (r) => qcmListe(r, SUPPORTS, (x) => `${x} : quel support de transmission ?`) },
      // --- ASK, OOK, FSK, PSK ---
      { fiche: "tsi-s13-mo-ask", gen: (r) => { const Ap = r.pick([2, 4, 5, 6, 8, 10]), ook = r.int(0, 1) === 1, bits = bitsAlea(r, 8), k = r.int(1, 8), b = bits[k - 1], A = b === "1" ? Ap : ook ? 0 : Ap / 2;
          return { enonce: `Modulation <b>${ook ? "OOK" : "ASK"}</b>, porteuse d'amplitude <b>A<sub>p</sub> = ${Ap} V</b>. Données transmises : <b>${bits.split("").join(" ")}</b>. Amplitude du signal modulé pendant le <b>${k}<sup>e</sup> bit</b> ?`, reponse: A, unite: "V", absolu: 0.05, explication: `Le ${k}<sup>e</sup> bit vaut ${b}. ${ook ? "OOK : bit 0 → 0 V, bit 1 → A<sub>p</sub>" : "ASK : bit 0 → A<sub>0</sub> = A<sub>p</sub>/2, bit 1 → A<sub>1</sub> = A<sub>p</sub>"} → ${nb(A)} V.` }; } },
      { fiche: "tsi-s13-mo-ask", gen: (r) => { const fp = r.pick([1, 2, 5, 10, 20, 50]), bits = bitsAlea(r, 8), k = r.int(1, 8), b = bits[k - 1], f = b === "1" ? 2 * fp : fp;
          return { enonce: `Modulation <b>FSK</b> (cours : bit 0 → f<sub>0</sub> = f<sub>p</sub>, bit 1 → f<sub>1</sub> = 2·f<sub>p</sub>), porteuse <b>f<sub>p</sub> = ${fp} kHz</b>. Données : <b>${bits.split("").join(" ")}</b>. Fréquence du signal pendant le <b>${k}<sup>e</sup> bit</b> ?`, reponse: f, unite: "kHz", tolerance: 1, explication: `Le ${k}<sup>e</sup> bit vaut ${b} → f = ${b === "1" ? `2 × ${fp}` : fp} = ${f} kHz.` }; } },
      { fiche: "tsi-s13-mo-ask", gen: (r) => qcmListe(r, RECO_MOD, (x) => `${x}. Quelle modulation ?`) },
      { fiche: "tsi-s13-mo-ask", gen: (r) => { const Ap = r.pick([2, 4, 6, 8, 10]), ook = r.int(0, 2) === 0, bits = bitsAlea(r, r.int(6, 8)), amp = [...bits].map((b) => (b === "1" ? Ap : ook ? 0 : Ap / 2));
          return { type: "texte", enonce: `Réception d'un signal <b>${ook ? "OOK" : "ASK"}</b> (A<sub>p</sub> = ${Ap} V). Amplitude relevée sur chaque durée de bit : <b>${amp.map((a) => nb(a) + " V").join(" | ")}</b>. Quelle suite de bits a été transmise ? (ex. 10110)`, reponses: [bits], explication: `${ook ? `0 V → 0 ; ${Ap} V → 1` : `A<sub>p</sub>/2 = ${nb(Ap / 2)} V → 0 ; A<sub>p</sub> = ${Ap} V → 1`} : ${bits}.` }; } },
      { fiche: "tsi-s13-mo-ask", gen: (r) => { const fp = r.pick([5, 10, 20, 50]), bits = bitsAlea(r, r.int(6, 8)), fr = [...bits].map((b) => (b === "1" ? 2 * fp : fp));
          return { type: "texte", enonce: `Réception d'un signal <b>FSK</b> (f<sub>p</sub> = ${fp} kHz ; bit 0 → f<sub>p</sub>, bit 1 → 2·f<sub>p</sub>). Fréquence mesurée sur chaque durée de bit : <b>${fr.map((f) => f + " kHz").join(" | ")}</b>. Suite de bits transmise ?`, reponses: [bits], explication: `${fp} kHz → 0 ; ${2 * fp} kHz → 1 : ${bits}.` }; } },
      { fiche: "tsi-s13-mo-ask", gen: (r) => { const fp = r.pick([10e3, 20e3, 50e3, 100e3]), D = r.pick([1e3, 2e3, 5e3]), fsk = r.int(0, 1) === 1, f = fsk ? 2 * fp : fp, N = f / D;
          return { enonce: `${fsk ? "FSK" : "ASK"} : porteuse f<sub>p</sub> = ${fHz(fp)}, débit ${fD(D)}. Combien de périodes de sinusoïde pendant la durée d'un bit <b>${fsk ? "à 1" : "à 0"}</b> ?`, reponse: N, absolu: 0.4, explication: `T<sub>b</sub> = 1/D = ${fT(1 / D)} ; ${fsk ? `bit 1 en FSK : f<sub>1</sub> = 2·f<sub>p</sub> = ${fHz(f)}` : `en ASK la fréquence reste f<sub>p</sub> = ${fHz(f)}`} → N = f × T<sub>b</sub> = ${nb(N)} périodes.` }; } },
      // --- démodulation ---
      { fiche: "tsi-s13-mo-demod", gen: (r) => { const fp = r.pick([100e3, 200e3, 500e3, 1e6]), D = r.pick([1e3, 2e3, 5e3]), Tp = 1 / fp, Tb = 1 / D, tau = Math.sqrt(Tp * Tb);
          return qcm(`Détecteur d'enveloppe (diode + R // C) pour démoduler une ASK : porteuse f<sub>p</sub> = ${fHz(fp)}, débit ${fD(D)}. Quelle constante de temps τ = R·C convient ?`, fT(tau), [fT(Tp / 10), fT(Tp), fT(10 * Tb)], `Il faut T<sub>p</sub> = ${fT(Tp)} ≪ τ ≪ T<sub>b</sub> = ${fT(Tb)} : τ ≈ ${fT(tau)}. Trop petit, C suit chaque période de la porteuse ; trop grand, il ne suit plus les changements de bits.`); } },
      // --- débit, rapidité, Shannon ---
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const Tb = r.pick([1, 2, 4, 5, 8, 10, 20, 52, 104]), D = 1e6 / Tb;
          return { enonce: `Chaque bit dure <b>T<sub>b</sub> = ${Tb} µs</b>. Débit binaire D ?`, reponse: D / 1000, unite: "kbit/s", explication: `D = 1/T<sub>b</sub> = 1/(${Tb}×10<sup>−6</sup>) = ${nb(D)} bit/s = ${nb(D / 1000)} kbit/s.` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const R = r.pick([1200, 2400, 4800, 9600, 125000]), M = r.pick([2, 4, 8, 16, 64]), n = Math.log2(M), D = R * n;
          return { enonce: `Modulation à <b>M = ${M} états</b>, rapidité de modulation <b>R = ${nb(R)} bauds</b>. Débit binaire D ?`, reponse: D / 1000, unite: "kbit/s", tolerance: 1, explication: `D = R·log<sub>2</sub>(M) = ${nb(R)} × ${n} = ${nb(D)} bit/s = ${nb(D / 1000)} kbit/s (${n} bit(s) par symbole).` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const R = r.pick([600, 1200, 2400, 4800, 9600]), M = r.pick([4, 8, 16, 32, 64]), n = Math.log2(M), D = R * n;
          return { enonce: `Une liaison atteint un débit de <b>${nb(D)} bit/s</b> avec une modulation à <b>${M} états</b>. Rapidité de modulation R ?`, reponse: R, unite: "bauds", tolerance: 1, explication: `R = D / log<sub>2</sub>(M) = ${nb(D)} / ${n} = ${nb(R)} bauds (symboles par seconde).` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const n = r.int(1, 6), M = 2 ** n, R = r.pick([1000, 2400, 5000, 9600]), D = R * n;
          return { enonce: `Débit binaire <b>D = ${nb(D)} bit/s</b>, rapidité <b>R = ${nb(R)} bauds</b>. Nombre d'états M de la modulation ?`, reponse: M, absolu: 0.4, explication: `log<sub>2</sub>(M) = D/R = ${nb(D)} / ${nb(R)} = ${n} bit(s) par symbole → M = 2<sup>${n}</sup> = ${M}.` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const n = r.int(1, 8), M = 2 ** n;
          return r.int(0, 1) ? { enonce: `Une modulation possède <b>M = ${M} états</b>. Combien de bits transporte chaque symbole ?`, reponse: n, absolu: 0.4, explication: `n = log<sub>2</sub>(M) = log<sub>2</sub>(${M}) = ${n} bits, car 2<sup>${n}</sup> = ${M}.` }
            : { enonce: `On veut transporter <b>${n} bit(s) par symbole</b>. Combien d'états M faut-il ?`, reponse: M, absolu: 0.4, explication: `M = 2<sup>n</sup> = 2<sup>${n}</sup> = ${M} états.` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const [nom, D] = r.pick(DEBITS), N = r.pick([12, 20, 51, 100, 242]), t = 8 * N / D, u = t >= 1e-3 ? ["ms", 1e3] : ["µs", 1e6];
          return { enonce: `Envoi d'un message de <b>${N} octets</b> avec ${nom} à <b>${fD(D)}</b>. Durée de transmission (en-têtes négligés) ?`, reponse: t * u[1], unite: u[0], explication: `t = nombre de bits / D = ${N} × 8 / ${nb(D)} = ${nb(t * u[1])} ${u[0]}.` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { const [ctx, B] = r.pick([["Ligne téléphonique", 3100], ["Canal radio de 125 kHz", 125e3], ["Canal radio de 200 kHz", 200e3], ["Canal Wi-Fi", 20e6]]), snr = r.pick([10, 20, 30, 40]), SN = 10 ** (snr / 10), C = B * Math.log2(1 + SN), u = C >= 1e6 ? ["Mbit/s", 1e6] : ["kbit/s", 1e3];
          return { enonce: `${ctx} : bande passante <b>B = ${fHz(B)}</b>, rapport signal/bruit <b>${snr} dB</b>. Capacité maximale C selon Shannon ?`, reponse: C / u[1], unite: u[0], explication: `S/N = 10<sup>${snr}/10</sup> = ${nb(SN)} ; C = B·log<sub>2</sub>(1 + S/N) = ${nb(B)} × log<sub>2</sub>(${nb(1 + SN)}) = ${nb(C / u[1])} ${u[0]}.` }; } },
      { fiche: "tsi-s13-mo-debit", gen: (r) => { if (r.int(0, 1)) { const SN = r.pick([10, 20, 50, 100, 200, 500, 1000, 10000]);
            return { enonce: `La puissance du signal est <b>${nb(SN)} fois</b> plus grande que celle du bruit. Rapport signal/bruit en dB ?`, reponse: 10 * Math.log10(SN), unite: "dB", absolu: 0.2, explication: `(S/N)<sub>dB</sub> = 10·log(S/N) = 10·log(${nb(SN)}) = ${nb(10 * Math.log10(SN), 3)} dB (rapport de puissances : 10·log et non 20·log).` }; }
          const dB = r.pick([3, 6, 10, 13, 20, 25, 30, 40]), SN = 10 ** (dB / 10);
          return { enonce: `Rapport signal/bruit de <b>${dB} dB</b>. Combien de fois la puissance du signal est-elle plus grande que celle du bruit ?`, reponse: SN, explication: `S/N = 10<sup>dB/10</sup> = 10<sup>${dB}/10</sup> = ${nb(SN)}.` }; } },
      // --- objets connectés ---
      { fiche: "tsi-s13-mo-iot", gen: (r) => qcmListe(r, IOT_APPLI, (x) => `${x}. Quelle technologie sans fil choisir ?`) },
      { fiche: "tsi-s13-mo-iot", gen: (r) => qcmListe(r, IOT_DESC, (x) => `« ${x} » : de quelle technologie s'agit-il ?`) },
      { fiche: "tsi-s13-mo-iot", gen: (r) => { const N = r.pick([24, 48, 96]), t = r.pick([0.5, 1, 1.5, 2]), I = r.pick([30, 40, 45]), Iv = r.pick([5, 10, 20]), C = r.pick([1000, 2400, 2600]), Qtx = N * I * t / 3600, Qv = Iv * 24 / 1000, Q = Qtx + Qv, J = C / Q;
          return { enonce: `Capteur LoRa sur pile de <b>${C} mAh</b> : <b>${N} émissions par jour</b> de <b>${nb(t)} s</b> à <b>${I} mA</b>, veille à <b>${Iv} µA</b> le reste du temps (on compte la veille sur 24 h). Autonomie en jours ?`, reponse: J, unite: "jours", tolerance: 3,
            explication: `Émission : ${N} × ${I} mA × ${nb(t)} s = ${nb(N * I * t)} mA·s = ${nb(Qtx, 3)} mAh/jour ; veille : ${Iv} µA × 24 h = ${nb(Qv, 3)} mAh/jour ; total ${nb(Q, 3)} mAh/jour → ${C} / ${nb(Q, 3)} ≈ ${nb(J, 3)} jours (≈ ${nb(J / 365, 2)} ans).` }; } },
      // --- QCM fixes ---
      { type: "qcm", fiche: "tsi-s13-mo-principe", enonce: "Pourquoi module-t-on un signal numérique avant de l'émettre par antenne ?", choix: ["Pour translater son spectre dans la bande passante du canal (antennes de taille raisonnable, sources séparées)", "Pour augmenter le débit binaire de la source", "Pour supprimer tout le bruit du canal", "Pour réduire le nombre de bits à transmettre"], bonne: 0, explication: "En bande de base : forte atténuation, antennes gigantesques, faible portée et mélange des sources. La modulation déplace le spectre vers les hautes fréquences." },
      { type: "qcm", fiche: "tsi-s13-mo-principe", enonce: "La porteuse est…", choix: ["Un signal sinusoïdal de fréquence f<sub>p</sub> beaucoup plus élevée que celle du signal modulant", "Le signal numérique à transmettre", "Un signal carré de même fréquence que les données", "Le câble qui relie l'émetteur au récepteur"], bonne: 0, explication: "La porteuse est définie par son amplitude et sa fréquence ; on greffe sur elle le signal modulant." },
      { type: "qcm", fiche: "tsi-s13-mo-principe", enonce: "Transmission en bande de base sur un long câble de cuivre : que constate-t-on à l'arrivée ?", choix: ["Une très forte atténuation, car le spectre du signal est sous la bande passante du canal", "Aucune atténuation, le cuivre est un bon conducteur", "Une augmentation de l'amplitude", "Un changement de la fréquence des bits"], bonne: 0, explication: "Le canal se comporte comme un passe-bande : les basses fréquences du signal en bande de base sont fortement atténuées." },
      { type: "qcm", fiche: "tsi-s13-mo-ask", enonce: "En modulation <b>PSK</b>, l'information est portée par…", choix: ["La phase de la porteuse (0° ou 180° pour deux états)", "L'amplitude de la porteuse", "La fréquence de la porteuse", "La durée des bits"], bonne: 0, explication: "PSK (Phase Shift Keying) : amplitude et fréquence constantes, la phase change selon le bit." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Quel circuit réalise une modulation d'amplitude ?", choix: ["Un multiplieur (signal modulant × porteuse)", "Un oscillateur contrôlé en tension (VCO)", "Une boucle à verrouillage de phase (PLL)", "Un détecteur d'enveloppe"], bonne: 0, explication: "Cours : la modulation d'amplitude est généralement réalisée par un multiplieur ; le VCO sert à la modulation de fréquence." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Un VCO (oscillateur contrôlé en tension) sert à…", choix: ["Moduler en fréquence : sa fréquence de sortie dépend de sa tension d'entrée", "Démoduler un signal ASK", "Supprimer la composante continue", "Mesurer le débit binaire"], bonne: 0, explication: "Le VCO génère une sinusoïde dont la fréquence varie autour de f<sub>p</sub> selon le signal modulant." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Le détecteur d'enveloppe (diode + R + C) sert à démoduler…", choix: ["Un signal modulé en amplitude (ASK, OOK)", "Un signal modulé en fréquence (FSK)", "Un signal en bande de base", "Un signal modulé en phase (PSK)"], bonne: 0, explication: "L'information ASK est dans l'enveloppe du signal : la diode redresse, le condensateur suit l'enveloppe." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Lequel de ces circuits sert à démoduler un signal <b>FSK</b> ?", choix: ["Une boucle à verrouillage de phase (PLL)", "Un multiplieur seul", "Un simple pont diviseur", "Un détecteur d'enveloppe seul"], bonne: 0, explication: "Démodulateurs de fréquence du cours : discriminateur (FM → AM puis détection d'enveloppe), démodulateur à quadrature, PLL." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Avantage de la FSK par rapport à l'ASK ?", choix: ["Excellente immunité au bruit et bon rendement énergétique", "Des circuits de modulation plus simples", "Elle n'a pas besoin de porteuse", "Un débit toujours deux fois plus grand"], bonne: 0, explication: "Le bruit modifie surtout l'amplitude, pas la fréquence. Contrepartie : modulateurs et démodulateurs plus complexes." },
      { type: "qcm", fiche: "tsi-s13-mo-demod", enonce: "Principal inconvénient de la modulation ASK ?", choix: ["Mauvaise immunité au bruit et rendement énergétique faible", "Des circuits très complexes", "Elle nécessite obligatoirement une PLL", "Elle ne fonctionne que sur fibre optique"], bonne: 0, explication: "Cours : ASK = circuits simples, mais mauvaise immunité face au bruit et rendement énergétique faible." },
      { type: "qcm", fiche: "tsi-s13-mo-debit", enonce: "Pour augmenter le débit sans augmenter la rapidité de modulation (donc sans élargir le spectre), on…", choix: ["Augmente le nombre d'états M : chaque symbole transporte plus de bits", "Diminue la fréquence de la porteuse", "Passe à une modulation à 2 états", "Allonge l'antenne"], bonne: 0, explication: "D = R·log<sub>2</sub>(M) : à R constant, passer de 2 à 16 états multiplie le débit par 4 (au prix d'une plus grande sensibilité au bruit)." },
      { type: "qcm", fiche: "tsi-s13-mo-debit", enonce: "Selon Shannon, la capacité maximale d'un canal augmente quand…", choix: ["La bande passante ou le rapport signal/bruit augmente", "La longueur du câble augmente", "Le niveau de bruit augmente", "La fréquence de la porteuse diminue"], bonne: 0, explication: "C = B·log<sub>2</sub>(1 + S/N) : C croît avec B et avec S/N." },
      { type: "qcm", fiche: "tsi-s13-mo-debit", enonce: "La rapidité de modulation, en bauds, compte…", choix: ["Le nombre de symboles transmis par seconde", "Le nombre de bits transmis par seconde", "Le nombre d'octets transmis par seconde", "Le nombre de périodes de porteuse par seconde"], bonne: 0, explication: "Un symbole peut représenter plusieurs bits : débit (bit/s) = R (bauds) × bits par symbole." },
      { type: "qcm", fiche: "tsi-s13-mo-iot", enonce: "Bande de fréquences utilisée par LoRa en Europe ?", choix: ["868 MHz", "2,4 GHz", "5 GHz", "100 MHz"], bonne: 0, explication: "LoRa : bande ISM 868 MHz en Europe ; BLE et Wi-Fi : 2,4 GHz (et 5 GHz pour le Wi-Fi)." },
      { type: "qcm", fiche: "tsi-s13-mo-iot", enonce: "Pourquoi un capteur LoRa peut-il fonctionner plusieurs années sur une pile ?", choix: ["Il émet rarement, peu de données, et dort le reste du temps (veille de quelques µA)", "Il émet en permanence à fort débit", "LoRa n'utilise pas d'antenne", "Le réseau le recharge à distance"], bonne: 0, explication: "L'énergie dépend surtout du temps passé à émettre : quelques secondes par jour à quelques dizaines de mA, puis une veille très faible." }
    ],
    fiches: [
      { id: "tsi-s13-mo-principe", titre: "Canal, bande de base et modulation",
        recto: "Pourquoi module-t-on un signal avant de le transmettre ?",
        verso: `<ul><li><b>Canal</b> : support guidé (cuivre, fibre) ou non guidé (radio, IR) ; il se comporte comme un <b>passe-bande</b>.</li><li><b>Bande de base</b> : signal transmis tel quel → forte atténuation, antennes géantes, sources mélangées.</li><li><b>Modulation</b> : greffer le signal <b>modulant</b> sur une <b>porteuse</b> sinusoïdale HF → signal <b>modulé</b>, spectre translaté dans la bande passante. <b>Démodulation</b> : récupérer le modulant.</li></ul><p class="astuce">Antenne ≈ λ/4 = c/(4f) : plus f est grande, plus l'antenne est petite.</p>`,
        quiz: [{ enonce: "La porteuse est…", choix: ["une sinusoïde haute fréquence", "le signal numérique utile", "le câble"], bonne: 0 }, { enonce: "Un canal de transmission se comporte comme un…", choix: ["passe-bande", "passe-haut idéal", "amplificateur"], bonne: 0 }] },
      { id: "tsi-s13-mo-ask", titre: "ASK, OOK, FSK, PSK",
        recto: "Comment chaque modulation numérique code-t-elle un 0 et un 1 ?",
        verso: `<ul><li><b>ASK</b> (amplitude) : 0 → A₀ = A<sub>p</sub>/2 ; 1 → A₁ = A<sub>p</sub>.</li><li><b>OOK</b> (tout ou rien) : 0 → amplitude nulle ; 1 → A<sub>p</sub>.</li><li><b>FSK</b> (fréquence) : 0 → f₀ = f<sub>p</sub> ; 1 → f₁ = 2·f<sub>p</sub>, amplitude constante.</li><li><b>PSK</b> (phase) : 0 → 0° ; 1 → 180°, amplitude et fréquence constantes.</li></ul><p class="astuce">Regarde ce qui change d'un bit à l'autre : amplitude, fréquence ou phase.</p>`,
        quiz: [{ enonce: "OOK, bit 0 :", choix: ["amplitude nulle", "A<sub>p</sub>/2", "A<sub>p</sub>"], bonne: 0 }, { enonce: "FSK du cours, bit 1 :", choix: ["2·f<sub>p</sub>", "f<sub>p</sub>", "f<sub>p</sub>/2"], bonne: 0 }] },
      { id: "tsi-s13-mo-demod", titre: "Modulateurs et démodulateurs",
        recto: "Quels circuits modulent et démodulent en ASK et en FSK, avec quels avantages ?",
        verso: `<ul><li><b>ASK</b> : modulateur = <b>multiplieur</b> ; démodulation par <b>détecteur d'enveloppe</b> (diode + RC) ou détection synchrone. Simple, mais sensible au bruit et peu efficace.</li><li><b>FSK</b> : modulateur = <b>VCO</b> ; démodulation par discriminateur, quadrature ou <b>PLL</b>. Très bonne immunité au bruit, bon rendement, circuits complexes.</li></ul><p class="astuce">Détecteur d'enveloppe : T<sub>p</sub> ≪ R·C ≪ T<sub>b</sub>.</p>`,
        quiz: [{ enonce: "Moduler en fréquence :", choix: ["VCO", "multiplieur", "diode"], bonne: 0 }, { enonce: "La modulation la plus robuste au bruit :", choix: ["FSK", "ASK", "OOK"], bonne: 0 }] },
      { id: "tsi-s13-mo-debit", titre: "Débit, rapidité, nombre d'états, Shannon",
        recto: "Quelle relation lie débit binaire, rapidité de modulation et nombre d'états ?",
        verso: `<div class="formule">D = R · log₂(M) &nbsp;·&nbsp; D = 1/T<sub>b</sub></div><ul><li>D : débit (bit/s) · R : rapidité (bauds = symboles/s) · M : nombre d'états ; log₂ M bits par symbole.</li><li>Shannon : C = B · log₂(1 + S/N), avec B en Hz et S/N en rapport de puissances.</li></ul><p class="astuce">(S/N)<sub>dB</sub> = 10·log(S/N) : 30 dB → S/N = 1 000.</p>`,
        quiz: [{ enonce: "R = 1 000 bauds, M = 4 : D =", choix: ["2 000 bit/s", "4 000 bit/s", "1 000 bit/s"], bonne: 0 }, { enonce: "20 dB de S/N correspondent à S/N =", choix: ["100", "20", "10"], bonne: 0 }] },
      { id: "tsi-s13-mo-iot", titre: "Objets connectés : LoRa, BLE, Wi-Fi",
        recto: "Comment choisir entre LoRa, Bluetooth Low Energy et Wi-Fi ?",
        verso: `<table><tr><th></th><th>Portée</th><th>Débit</th><th>Conso</th></tr><tr><td>LoRa 868 MHz</td><td>km</td><td>0,3–50 kbit/s</td><td>très faible</td></tr><tr><td>BLE 2,4 GHz</td><td>≈ 10 m</td><td>≈ 1 Mbit/s</td><td>faible</td></tr><tr><td>Wi-Fi 2,4/5 GHz</td><td>dizaines de m</td><td>≥ 100 Mbit/s</td><td>élevée</td></tr></table><p class="astuce">Compromis : on n'a jamais à la fois grande portée, haut débit et faible consommation.</p>`,
        quiz: [{ enonce: "Capteur isolé à 5 km, pile 5 ans :", choix: ["LoRa", "Wi-Fi", "BLE"], bonne: 0 }, { enonce: "Vidéo HD vers la box :", choix: ["Wi-Fi", "LoRa", "BLE"], bonne: 0 }] }
    ]
  });
})();
