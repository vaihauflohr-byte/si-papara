/* ===================== BTS — option ADM =====================
   Analyse, diagnostic, maintenance */

// ---------- BTS 1 ADM ----------
SIP.definirModule({
  id: "bts1-adm-fmd",
  sequence: "Option ADM · Maintenance",
  niveaux: ["BTS1-ADM"],
  titre: "Maintenance : stratégies et indicateurs",
  description: "Types et niveaux de maintenance, MTBF, MTTR, disponibilité, fiabilité.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts1-adm-fmd", gen: (r) => { const N = r.int(3, 12), T = r.pas(1200, 4800, 100); return { enonce: `Sur un semestre, un équipement a cumulé <b>${T} h</b> de bon fonctionnement et subi <b>${N} pannes</b>. MTBF ?`, reponse: T / N, unite: "h", explication: `MTBF = Σ temps de bon fonctionnement / nombre de pannes = ${T} / ${N} = ${SIP.nb(T / N)} h.` }; } },
    { fiche: "bts1-adm-fmd", gen: (r) => { const n = r.int(3, 5); const t = Array.from({ length: n }, () => r.pas(0.5, 4, 0.5)); const s = t.reduce((a, b) => a + b, 0); return { enonce: `Durées des ${n} dernières interventions correctives : <b>${t.map((x) => SIP.nb(x)).join(" h ; ")} h</b>. MTTR ?`, reponse: s / n, unite: "h", explication: `MTTR = Σ temps de réparation / nombre d'interventions = ${SIP.nb(s)} / ${n} = ${SIP.nb(s / n)} h.` }; } },
    { fiche: "bts1-adm-fmd", gen: (r) => { const mtbf = r.pas(100, 500, 20), mttr = r.pas(2, 12, 1); return { enonce: `<b>MTBF = ${mtbf} h</b>, <b>MTTR = ${mttr} h</b>. Disponibilité opérationnelle en % ?`, reponse: 100 * mtbf / (mtbf + mttr), unite: "%", tolerance: 0.2, explication: `D = MTBF / (MTBF + MTTR) = ${mtbf} / ${mtbf + mttr} = ${SIP.nb(100 * mtbf / (mtbf + mttr))} %.` }; } },
    { fiche: "bts1-adm-fiabilite", gen: (r) => { const mtbf = r.pick([200, 250, 400, 500, 800, 1000, 2000]); return { enonce: `En période de maturité, <b>MTBF = ${mtbf} h</b>. Taux de défaillance λ, exprimé en <b>pannes pour 1 000 h</b> ?`, reponse: 1000 / mtbf, unite: "pannes/1000 h", explication: `λ = 1 / MTBF = 1/${mtbf} panne/h, soit ${SIP.nb(1000 / mtbf)} pannes pour 1 000 h.` }; } },
    { fiche: "bts1-adm-fiabilite", gen: (r) => { const mtbf = r.pick([500, 800, 1000, 2000]), t = r.pick([50, 100, 200, 300, 500]); const R = 100 * Math.exp(-t / mtbf); return { enonce: `Taux de défaillance constant, <b>MTBF = ${mtbf} h</b>. Probabilité de fonctionner sans panne pendant <b>${t} h</b> (en %) ?`, reponse: R, unite: "%", explication: `R(t) = e<sup>−t/MTBF</sup> = e<sup>−${t}/${mtbf}</sup> = ${SIP.nb(R)} %.` }; } },
    { type: "qcm", fiche: "bts1-adm-types", enonce: "Un dépannage <b>provisoire</b> pour relancer la production en attendant la réparation définitive est une maintenance…", choix: ["Corrective palliative", "Corrective curative", "Préventive systématique", "Préventive conditionnelle"], bonne: 0, explication: "Palliative = provisoire ; curative = réparation durable." },
    { type: "qcm", fiche: "bts1-adm-types", enonce: "Remplacer les roulements <b>toutes les 4 000 h</b>, quel que soit leur état, c'est de la maintenance…", choix: ["Préventive systématique", "Préventive conditionnelle", "Corrective curative", "Améliorative"], bonne: 0, explication: "Systématique = selon un échéancier (temps ou nombre d'unités d'usage)." },
    { type: "qcm", fiche: "bts1-adm-types", enonce: "On mesure les vibrations chaque mois et on intervient <b>quand un seuil est dépassé</b> : maintenance…", choix: ["Préventive conditionnelle", "Préventive systématique", "Corrective palliative", "Corrective curative"], bonne: 0, explication: "Conditionnelle = déclenchée par l'état mesuré. Si on extrapole l'évolution pour prévoir la date, elle devient prévisionnelle." },
    { type: "qcm", fiche: "bts1-adm-niveaux", enonce: "Réglage simple prévu par le constructeur, fait par l'opérateur <b>sans démontage</b> ni outillage spécifique : niveau de maintenance ?", choix: ["Niveau 1", "Niveau 2", "Niveau 3", "Niveau 4"], bonne: 0, explication: "Niveau 1 : actions simples, sur place, par l'exploitant." },
    { type: "qcm", fiche: "bts1-adm-niveaux", enonce: "Diagnostic d'une panne et réparation par échange de composants, par un <b>technicien spécialisé</b> avec l'outillage prévu : niveau ?", choix: ["Niveau 3", "Niveau 1", "Niveau 2", "Niveau 5"], bonne: 0, explication: "Le diagnostic est la signature du niveau 3." },
    { type: "qcm", fiche: "bts1-adm-fiabilite", enonce: "Sur la « courbe en baignoire », le taux de défaillance est constant pendant…", choix: ["La période de maturité (vie utile)", "La période de jeunesse", "La période d'usure", "Aucune période"], bonne: 0, explication: "Jeunesse : λ décroît ; maturité : λ constant (loi exponentielle) ; vieillesse : λ croît." }
  ],
  fiches: [
    {
      id: "bts1-adm-types", titre: "Les types de maintenance",
      recto: "Quelles sont les formes de maintenance corrective et préventive ?",
      verso: `<p><b>Corrective</b> (après la défaillance)</p><ul><li><b>Palliative</b> : dépannage provisoire</li><li><b>Curative</b> : réparation durable</li></ul>
        <p><b>Préventive</b> (avant la défaillance)</p><ul><li><b>Systématique</b> : échéancier (heures, cycles, calendrier)</li><li><b>Conditionnelle</b> : déclenchée par un seuil sur un paramètre surveillé</li><li><b>Prévisionnelle</b> : prévision à partir de l'évolution du paramètre</li></ul>
        <p class="astuce">Référence : NF EN 13306.</p>`,
      quiz: [{ enonce: "Changer un filtre tous les 6 mois :", choix: ["Préventive systématique", "Préventive conditionnelle", "Corrective curative"], bonne: 0 }, { enonce: "Réparation durable après panne :", choix: ["Corrective curative", "Corrective palliative", "Prévisionnelle"], bonne: 0 }]
    },
    {
      id: "bts1-adm-niveaux", titre: "Les 5 niveaux de maintenance",
      recto: "Quels sont les 5 niveaux de maintenance et qui intervient ?",
      verso: `<ol><li>Actions simples (réglages, consommables accessibles) — <b>opérateur</b></li>
        <li>Procédures simples, échanges standard — <b>technicien habilité</b></li>
        <li><b>Diagnostic</b>, réparation par échange de composants — <b>technicien spécialisé</b></li>
        <li>Travaux importants de maintenance — <b>équipe spécialisée</b>, outillage spécifique</li>
        <li>Rénovation, reconstruction — <b>atelier central ou constructeur</b></li></ol>`,
      quiz: [{ enonce: "Le diagnostic apparaît au niveau…", choix: ["3", "1", "5"], bonne: 0 }, { enonce: "La reconstruction d'un équipement relève du niveau…", choix: ["5", "2", "3"], bonne: 0 }]
    },
    {
      id: "bts1-adm-fmd", titre: "MTBF, MTTR, disponibilité",
      recto: "Définitions de MTBF, MTTR et formule de la disponibilité ?",
      verso: `<div class="formule">MTBF = Σ TBF / nb de pannes &nbsp;·&nbsp; MTTR = Σ TTR / nb d'interventions</div><div class="formule">D = MTBF / (MTBF + MTTR)</div>
        <p>MTBF → <b>fiabilité</b> · MTTR → <b>maintenabilité</b> · D → <b>disponibilité</b> (FMD).</p>
        <p class="astuce">Améliorer D : augmenter le MTBF (préventif, fiabilisation) ou réduire le MTTR (pièces en stock, procédures, accessibilité).</p>`,
      quiz: [{ enonce: "MTBF = 98 h, MTTR = 2 h : D = …", choix: ["98 %", "96 %", "49 %"], bonne: 0 }, { enonce: "Le MTTR mesure…", choix: ["La maintenabilité", "La fiabilité", "La disponibilité"], bonne: 0 }]
    },
    {
      id: "bts1-adm-fiabilite", titre: "Fiabilité : loi exponentielle",
      recto: "Relation entre λ et MTBF, et expression de la fiabilité R(t) quand λ est constant ?",
      verso: `<div class="formule">λ = 1 / MTBF &nbsp;·&nbsp; R(t) = e<sup>−λt</sup></div>
        <p>Valable en <b>période de maturité</b> (λ constant) de la courbe en baignoire.</p>
        <p class="astuce">R(MTBF) = e<sup>−1</sup> ≈ <b>37 %</b> : à t = MTBF, 63 % des équipements sont déjà tombés en panne.</p>`,
      quiz: [{ enonce: "R(t = MTBF) ≈ …", choix: ["37 %", "50 %", "63 %"], bonne: 0 }, { enonce: "MTBF = 500 h ⇒ λ = …", choix: ["0,002 panne/h", "500 pannes/h", "0,5 panne/h"], bonne: 0 }]
    }
  ]
});

// ---------- BTS 2 ADM ----------
SIP.definirModule({
  id: "bts2-adm-diagnostic",
  sequence: "Option ADM · Maintenance",
  niveaux: ["BTS2-ADM"],
  titre: "Diagnostic d'un départ moteur",
  description: "Consignation, démarche de diagnostic, mesures sur moteur, AMDEC.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts2-adm-mesures", gen: (r) => { const b = r.pas(1.7, 2.0, 0.05), ds = [-0.15, -0.1, -0.05, 0.05, 0.1, 0.15]; const I = r.melange([b, b + r.pick(ds), b + r.pick([0].concat(ds))]).map((x) => +x.toFixed(2)); const moy = (I[0] + I[1] + I[2]) / 3, ec = Math.max(...I.map((x) => Math.abs(x - moy))), d = 100 * ec / moy; return { enonce: `Moteur de la pompe P1 (station de pompage) : courants mesurés <b>${I.map((x) => SIP.nb(x)).join(" A ; ")} A</b>. Déséquilibre de courant en % ?`, reponse: d, unite: "%", tolerance: 5, explication: `I<sub>moy</sub> = ${SIP.nb(moy)} A ; écart max à la moyenne = ${SIP.nb(ec)} A ; déséquilibre = ${SIP.nb(ec)} / ${SIP.nb(moy)} = ${SIP.nb(d)} %.` }; } },
    { fiche: "bts2-adm-mesures", gen: (r) => { const Rm = r.pas(1.2, 6, 0.2); return { enonce: `Moteur couplé en <b>triangle</b>, barrettes en place : on mesure <b>${SIP.nb(Rm)} Ω</b> entre deux bornes. Résistance d'un enroulement ?`, reponse: 1.5 * Rm, unite: "Ω", explication: `Entre deux bornes on voit R en parallèle avec 2R : R<sub>mes</sub> = 2R/3 ⇒ R = 1,5 × ${SIP.nb(Rm)} = ${SIP.nb(1.5 * Rm)} Ω.` }; } },
    { fiche: "bts2-adm-mesures", gen: (r) => { const Rm = r.pas(2, 12, 0.4); return { enonce: `Moteur couplé en <b>étoile</b> : on mesure <b>${SIP.nb(Rm)} Ω</b> entre deux bornes de phase. Résistance d'un enroulement ?`, reponse: Rm / 2, unite: "Ω", explication: `En étoile, deux enroulements sont en série : R<sub>mes</sub> = 2R ⇒ R = ${SIP.nb(Rm / 2)} Ω.` }; } },
    { fiche: "bts2-adm-mesures", gen: (r) => { const R1 = r.pick([20, 40, 50, 80, 100, 150]), ip = r.pick([0.8, 1.2, 1.5, 2.2, 3, 4]); return { enonce: `Essai d'isolement d'un moteur au mégohmmètre : <b>${R1} MΩ</b> à 1 min, <b>${SIP.nb(R1 * ip)} MΩ</b> à 10 min. Index de polarisation ?`, reponse: ip, unite: "", explication: `IP = R<sub>10 min</sub> / R<sub>1 min</sub> = ${SIP.nb(R1 * ip)} / ${R1} = ${SIP.nb(ip)} → ${ip < 1 ? "isolement dangereux" : ip < 2 ? "isolement douteux" : "isolement correct"}.` }; } },
    { fiche: "bts2-adm-amdec", gen: (r) => { const F = r.int(1, 4), G = r.int(2, 4), D = r.int(1, 4); return { enonce: `AMDEC : mode de défaillance « contact du contacteur KM1 collé » coté <b>F = ${F}</b>, <b>G = ${G}</b>, <b>D = ${D}</b>. Criticité ?`, reponse: F * G * D, unite: "", tolerance: 0, explication: `C = F × G × D = ${F} × ${G} × ${D} = ${F * G * D}. On compare au seuil fixé par l'entreprise.` }; } },
    { type: "qcm", fiche: "bts2-adm-consignation", enonce: "Ordre des étapes de la consignation électrique (NF C 18-510) ?", choix: ["Séparer → condamner → identifier → VAT → MALT-CC", "Identifier → VAT → séparer → condamner → MALT-CC", "Condamner → séparer → VAT → identifier → MALT-CC", "VAT → séparer → condamner → identifier → MALT-CC"], bonne: 0, explication: "La VAT se fait sur l'ouvrage identifié, après séparation et condamnation." },
    { type: "qcm", fiche: "bts2-adm-mesures", enonce: "Moteur triphasé qui <b>chauffe et ronfle</b> : courant élevé sur deux phases, nul sur la troisième. Cause probable ?", choix: ["Perte d'une phase (fusible fondu, contact défectueux)", "Couplage étoile au lieu de triangle", "Surtension du réseau", "Rotor bloqué par le frein uniquement"], bonne: 0, explication: "Fonctionnement en « monophasé » : le moteur perd du couple et surchauffe. Le thermique doit déclencher." },
    { type: "qcm", fiche: "bts2-adm-mesures", enonce: "Tension d'essai du mégohmmètre pour un circuit 230/400 V ?", choix: ["500 V continu", "230 V alternatif", "50 V continu", "1 000 V alternatif"], bonne: 0, explication: "NF C 15-100 : 500 V continu pour les circuits jusqu'à 500 V (hors TBT)." },
    { type: "qcm", fiche: "bts2-adm-mesures", enonce: "Index de polarisation mesuré : <b>0,9</b>. Décision ?", choix: ["Ne pas remettre en service : isolement dégradé (humidité, pollution) → nettoyer, sécher, remesurer", "Remettre en service, la valeur est bonne", "Changer le relais thermique", "Inverser deux phases"], bonne: 0, explication: "IP < 1 : isolement dangereux ; 1 à 2 : douteux ; ≥ 2 : correct." },
    { type: "qcm", fiche: "bts2-adm-demarche", enonce: "Face à une panne, la première étape de la démarche de diagnostic est…", choix: ["Constater et recueillir les informations (opérateur, historique, symptômes)", "Remplacer le composant le plus cher", "Mesurer au hasard les tensions", "Consigner puis démonter le moteur"], bonne: 0, explication: "On observe et on s'informe avant de formuler des hypothèses." },
    { type: "qcm", fiche: "bts2-adm-amdec", enonce: "Dans une AMDEC, une note de <b>détection D élevée</b> signifie que la défaillance…", choix: ["Est difficile à détecter avant qu'elle produise ses effets", "Est facile à détecter", "Est très fréquente", "Est très grave"], bonne: 0, explication: "D élevé = détection difficile, donc criticité plus forte." }
  ],
  fiches: [
    {
      id: "bts2-adm-consignation", titre: "Consignation électrique",
      recto: "Quelles sont les 5 étapes de la consignation électrique, dans l'ordre ?",
      verso: `<ol><li><b>Séparer</b> l'ouvrage de toute source (coupure pleinement apparente)</li>
        <li><b>Condamner</b> l'organe de séparation (cadenas + pancarte)</li>
        <li><b>Identifier</b> l'ouvrage sur le lieu de travail</li>
        <li><b>VAT</b> : vérifier l'absence de tension (VAT testé avant et après)</li>
        <li><b>MALT-CC</b> : mise à la terre et en court-circuit, quand elle est requise</li></ol>
        <p class="astuce">NF C 18-510 — réalisée par une personne habilitée (BC, ou BR pour ses propres interventions).</p>`,
      quiz: [{ enonce: "Juste après « séparer » :", choix: ["Condamner", "VAT", "Identifier"], bonne: 0 }, { enonce: "Le VAT se teste…", choix: ["Avant et après la vérification", "Une fois par an", "Jamais"], bonne: 0 }]
    },
    {
      id: "bts2-adm-demarche", titre: "Démarche de diagnostic",
      recto: "Quelles sont les étapes d'une démarche de diagnostic ?",
      verso: `<ol><li><b>Constater</b> et recueillir (opérateur, historique GMAO, symptômes)</li>
        <li><b>Formuler des hypothèses</b> (dossier technique, schémas)</li>
        <li><b>Tester</b> : du plus probable et du plus simple au moins probable</li>
        <li><b>Localiser</b> l'élément défaillant, <b>remédier</b></li>
        <li><b>Vérifier</b> le bon fonctionnement, <b>renseigner</b> l'historique</li></ol>`,
      quiz: [{ enonce: "On teste d'abord les hypothèses…", choix: ["Les plus probables et les plus simples", "Les plus coûteuses", "Au hasard"], bonne: 0 }, { enonce: "Après la remise en état, on…", choix: ["Vérifie et renseigne l'historique", "Ferme le dossier sans trace", "Démonte à nouveau"], bonne: 0 }]
    },
    {
      id: "bts2-adm-mesures", titre: "Mesures de diagnostic sur un moteur",
      recto: "Quelles mesures faire sur un moteur asynchrone suspect, et comment les interpréter ?",
      verso: `<ul><li><b>Isolement</b> : mégohmmètre 500 V continu ; <b>IP = R<sub>10 min</sub> / R<sub>1 min</sub></b> — &lt; 1 dangereux, 1 à 2 douteux, ≥ 2 correct</li>
        <li><b>Enroulements</b> : trois résistances égales. Entre bornes : étoile R<sub>mes</sub> = 2R ; triangle R<sub>mes</sub> = 2R/3</li>
        <li><b>Courants</b> : déséquilibre = écart max à la moyenne / moyenne</li></ul>
        <p class="astuce">Courant nul sur une phase + moteur qui ronfle = perte de phase.</p>`,
      quiz: [{ enonce: "IP = 3 :", choix: ["Isolement correct", "Isolement dangereux", "Moteur en court-circuit"], bonne: 0 }, { enonce: "Triangle, R<sub>mes</sub> = 2 Ω ⇒ R enroulement = …", choix: ["3 Ω", "1 Ω", "4 Ω"], bonne: 0 }]
    },
    {
      id: "bts2-adm-amdec", titre: "AMDEC et criticité",
      recto: "Comment calcule-t-on la criticité dans une AMDEC, et que signifie chaque note ?",
      verso: `<div class="formule">C = F × G × D</div>
        <ul><li><b>F</b> : fréquence d'apparition</li><li><b>G</b> : gravité des effets</li><li><b>D</b> : non-détection (élevée = difficile à détecter)</li></ul>
        <p>Au-dessus du <b>seuil</b> fixé par l'entreprise → actions correctives ou préventives, puis nouvelle cotation.</p>`,
      quiz: [{ enonce: "F = 2, G = 3, D = 4 : C = …", choix: ["24", "9", "12"], bonne: 0 }, { enonce: "D élevé signifie…", choix: ["Détection difficile", "Détection facile", "Défaillance rare"], bonne: 0 }]
    }
  ]
});
