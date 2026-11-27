/* =====================================================================
   SI Papara — agrégation : l'épreuve sur dossier (soutenance d'un dossier industriel)
   D'après les rapports de jury 2025, option ingénierie électrique : agrégation interne (pages 46 à 50)
   et agrégation externe (pages 77 à 80).
   #admission-dossier :
   - ce que dit le jury pour chaque concours : définition, durée, coefficient, contenu, ce qui est noté,
     ce qui coûte des points, conseils, chiffres 2025, sources ;
   - ton support : la fiche à remplir (support, entreprise, besoin, cahier des charges, problématique,
     modèles, mesures, exploitation, évolutions) et l'autodiagnostic en dix questions tirées des rapports ;
   - l'avis du jury IA sur le support : critères, problématiques, études, exploitations, questions probables,
     prochaines actions ;
   - le plan du dossier (40 pages) et l'avancement de chaque partie, les jalons jusqu'au dépôt ;
   - l'entretien en direct sur ton dossier (agreg/admission-oral.js) et la fiche à imprimer.
   Données dans st.dossier : {cc, f, ck, av, ia, ent} ; l'entretien est aussi noté dans st.oral.entretiens
   (src « dossier »), donc dans le tableau de bord de l'oral.
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, getSample ; ADMISSION_ORAL s'il est là.
   ===================================================================== */
(function () {
  'use strict';
  const liste = (x, n) => (Array.isArray(x) ? x : []).map((y) => String(y == null ? '' : y).trim()).filter(Boolean).slice(0, n);
  const date = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const erreurIA = (e) => (window.AGREG_HOOK && AGREG_HOOK.err && AGREG_HOOK.err(e && e.code)) || 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.';
  const court = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > (n || 70) ? t.slice(0, (n || 70) - 1) + '…' : t; };
  const D = () => {
    if (!st.dossier || typeof st.dossier !== 'object') st.dossier = {};
    const d = st.dossier;
    ['f', 'ck', 'av', 'ent'].forEach((k) => { if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {}; });
    if (d.cc !== 'ext') d.cc = 'int';
    return d;
  };

  /* ---------- ce que disent les rapports 2025 ---------- */
  const ATT = {
    int: {
      nom: 'Agrégation interne', src: ['rapport du jury 2025 de l’agrégation interne SII, option ingénierie électrique, pages 46 à 50', 'https://www.devenirenseignant.gouv.fr/media/17329/download'],
      tuiles: [['1 h', 'présentation de 30 min au plus, puis entretien de 30 min au plus'], ['coef. 1', 'la salle est ouverte 1 h avant, pour t’installer'], ['40 pages', 'au plus, déposé sur Cyclades avant les épreuves d’admission'], ['9,63', 'moyenne 2025 (enseignement public, 15 présents), notes de 2 à 19']],
      def: 'Présenter au jury un dossier technique et scientifique sur un système de l’option, puis un entretien. Le jury vérifie que tu sais trouver dans le monde économique des supports d’enseignement et en tirer des exploitations pertinentes pour le lycée, les STS et les IUT. Le rapport insiste : « l’authenticité et l’actualité du support sont des éléments importants ».',
      contenu: ['Le dossier technique : l’intérêt du support pour la société ; ses fonctions et la façon dont il répond au besoin ; des documents graphiques et techniques (schémas-blocs, documents du constructeur) ; le cahier des charges avec les performances attendues.',
        'L’étude d’un ou plusieurs problèmes : un développement scientifique et technique de haut niveau, des modèles ou des simulations aux hypothèses écrites, des mesures et des essais sur le support, la validation des choix ou des performances des constituants principaux, une analyse critique des solutions.',
        'Le dossier pédagogique : l’inventaire des exploitations possibles, liées aux fonctions du support, puis la description détaillée d’une exploitation liée à un problème étudié.'],
      note: ['L’authenticité et l’actualité du système choisi.', 'La justesse et le niveau du développement scientifique et technique.', 'La pertinence des problèmes posés.', 'Une présentation claire, structurée, objective ; le temps partagé entre la technique et la pédagogie.', 'Les points remarquables, transférables à l’enseignement.', 'La qualité des investigations et des exploitations pour les niveaux choisis.', 'Une exploitation décrite en détail : stratégies, documents pour les élèves, gestion de la classe.', 'La qualité d’ensemble du dossier.'],
      pertes: ['Un niveau scientifique de CAPET plutôt que d’agrégation.', 'Pas de cahier des charges industriel d’origine, pas de données techniques du système.', 'Un système déjà adapté pour l’enseignement par une société spécialisée : ce passage de l’industrie à la classe, c’est à toi de le faire.', 'Un projet d’élèves ou d’étudiants repris.', 'Une compilation de documents, peu d’analyse des choix du concepteur, peu d’analyse critique des écarts entre mesuré et attendu.', 'Un support ancien ou scientifiquement mince ; une présentation réduite à un diagramme SysML.', 'Des intentions pédagogiques générales au lieu de vrais choix, un survol de plusieurs exploitations au lieu d’une séquence développée, une modélisation qui ne sert pas la partie pédagogique.'],
      conseils: ['Le dossier demande plusieurs mois : il ne se prépare pas entre l’admissibilité et l’admission.', 'Rencontre les concepteurs ou les responsables techniques : le jury le valorise.', 'Teste si possible les activités proposées, ou parles-en avec des collègues des niveaux choisis.', 'Une séquence complète : documents élèves, préparation du professeur, place dans la progression de l’année.'],
    },
    ext: {
      nom: 'Agrégation externe', src: ['rapport du jury 2025 de l’agrégation externe SII, option ingénierie électrique, pages 77 à 80', 'https://www.devenirenseignant.gouv.fr/media/17372/download'],
      tuiles: [['1 h', 'présentation de 30 min au plus, puis entretien de 30 min'], ['coef. 2', 'autant que chacune des deux épreuves pratiques'], ['la forme', 'sommaire, pages numérotées, figures référencées, bibliographie'], ['8,68', 'moyenne 2025, écart-type 5,42, notes de 0,9 à 17,3']],
      def: 'Soutenir devant le jury un dossier technique et scientifique réalisé dans un domaine de l’option, puis un entretien. Le jury vérifie que tu sais trouver des supports dans le monde économique et en tirer des exploitations pertinentes, du collège au supérieur (cycle terminal, CPGE, STS, IUT). Il apprécie aussi ta connaissance des conditions d’exercice du métier et des valeurs qui le portent, dont celles de la République.',
      contenu: ['Un système industriel ou grand public, de l’ingénierie électrique, conçu et commercialisé récemment, qui intéresse les élèves.',
        'Une problématique réelle, clairement posée, qui appelle une démarche d’ingénieur ; les limites du système étudié bien définies.',
        'Des modèles de niveau agrégation, au service de la problématique et reliés à la réalité : des mesures à des points de fonctionnement réels, un regard critique sur la réponse apportée. La pluridisciplinarité est appréciée.',
        'Une partie pédagogique : les programmes utilisés, les compétences, l’organisation matérielle ; des séquences placées dans une progression formalisée et ancrées dans les problèmes modélisés.',
        'La forme : sommaire, pages numérotées, tableaux et graphes lisibles et référencés, bibliographie, français soigné. Ce n’est ni un rapport de stage, ni un projet de BTS, ni un mémoire de master.'],
      note: ['Un exposé clair, structuré, équilibré entre l’étude technique et l’exploitation pédagogique.', 'Une parole fluide, un vocabulaire technique juste.', 'Des visuels numérotés, lisibles, en nombre adapté au temps.', 'Des modèles maîtrisés, appuyés sur des essais ou des mesures.', 'Des séquences à deux niveaux (second degré et supérieur), dont une détaillée.', 'Un document élève argumenté, lié à une séance de la séquence.'],
      pertes: ['Un dossier sans substance, ou loin de l’ingénierie électrique : le programme n’est pas une extension de celui de STI2D.', 'Un dossier réduit à une présentation générale des solutions.', 'Des informations du dossier ou des diapositives que tu ne maîtrises pas : l’entretien les trouve.', 'Une orthographe et une grammaire faibles, des outils numériques mal utilisés.'],
      conseils: ['Choisis un système qui coche tous les critères ci-dessus.', 'Un dossier d’une session ratée se retravaille avant d’être présenté de nouveau.', 'L’entretien dépasse le dossier : finalités de l’enseignement technologique et liens avec les autres disciplines, démarches d’apprentissage en SII, missions du professeur, contexte d’exercice, valeurs et principes de la République.'],
    },
  };

  /* ---------- la fiche du support ---------- */
  const CHAMPS = [
    ['sup', 'Le support', 'Le système réel : son nom, son constructeur, son modèle. Par exemple une machine de lissage de pièces imprimées en ASA, l’onduleur d’une centrale solaire, le variateur d’une station de pompage.', 2],
    ['ent', 'L’entreprise et les personnes rencontrées', 'Qui t’ouvre les portes (exploitant, constructeur, bureau d’études) ; qui tu as rencontré, ou qui tu vas contacter.', 2],
    ['bes', 'Le besoin et les enjeux', 'Le client, ce qu’il attend ; les enjeux de société : énergie, environnement, sécurité, coût.', 2],
    ['cdc', 'Le cahier des charges d’origine', 'Les performances attendues, chiffrées, et d’où elles viennent (documents du constructeur, contrat, normes).', 3],
    ['pb', 'Ta problématique', 'Un problème réel, en une question, qui appelle une démarche d’ingénieur.', 2],
    ['mod', 'Les modèles et les simulations', 'Ce que tu modélises, avec quelles hypothèses, avec quel outil.', 3],
    ['mes', 'Les mesures sur le vrai système', 'Ce que tu mesures, à quels points de fonctionnement, avec quels appareils ; ce que la mesure doit valider.', 3],
    ['ped', 'L’exploitation pédagogique', 'Les niveaux (un du second degré, un du supérieur pour l’externe), la séquence, la séance détaillée, ce que font les élèves.', 3],
    ['evo', 'Les évolutions possibles', 'Ce que tu proposerais au constructeur, et ce qu’il y gagnerait, en chiffres.', 2],
  ];
  // l'autodiagnostic : dix questions tirées des critères et des faiblesses des deux rapports
  const AUTO = [
    ['ind', 'Un système industriel ou grand public, conçu récemment et commercialisé', 'Le jury attend un support authentique et actuel ; un système ancien ou fait maison risque d’être jugé hors sujet.'],
    ['ie', 'Dans le champ de l’ingénierie électrique (énergie ou information)', 'Un dossier loin de l’option perd des points, même s’il est riche.'],
    ['cdc', 'Le cahier des charges d’origine et des données techniques du constructeur', 'Sans eux, pas de performances attendues à confronter à tes mesures.'],
    ['ren', 'Des concepteurs ou des responsables techniques rencontrés', 'Le jury valorise les candidats qui ont rencontré ceux qui conçoivent ou exploitent le système.'],
    ['mes', 'Des mesures possibles sur le vrai système, à des points de fonctionnement réels', 'Les modèles doivent être reliés à la réalité physique par la mesure.'],
    ['pb', 'Un problème réel, qui demande une démarche d’ingénieur', 'Sans problématique, le dossier devient une présentation générale des solutions.'],
    ['ens', 'Pas un système déjà adapté pour l’enseignement par une société spécialisée', 'Ce passage de l’industrie à la classe, c’est ce que le jury veut te voir faire toi-même.'],
    ['proj', 'Pas un projet d’élèves ou d’étudiants, ni un rapport de stage ou de master', 'Le rapport de l’externe l’écrit noir sur blanc ; à l’interne, un projet d’élèves repris est une faiblesse relevée.'],
    ['niv', 'Des modèles et des simulations de niveau agrégation, confrontés aux mesures', 'Un niveau de CAPET est la première faiblesse relevée à l’interne.'],
    ['peda', 'Une exploitation tirée des problèmes du dossier, détaillée (deux niveaux pour l’externe)', 'Une pédagogie trop loin du support, ou un survol de plusieurs pistes, coûte des points.'],
  ];
  // le plan du dossier : 40 pages au plus à l'interne
  const PLAN = [
    ['ctx', 'Le support et son contexte', 'L’entreprise, le besoin du client, les enjeux de société.', 3],
    ['fct', 'Description fonctionnelle et structurelle', 'Inventaire des fonctions, schémas-blocs, documents techniques lisibles et référencés.', 4],
    ['cdc', 'Le cahier des charges d’origine', 'Les performances attendues, chiffrées, avec leur source.', 2],
    ['pb', 'La problématique', 'Un problème réel, posé clairement.', 1],
    ['etu', 'Les études', 'Modèles (hypothèses écrites), simulations, mesures sur le support, validation des choix des constituants.', 13],
    ['crit', 'Analyse critique et évolutions', 'Écarts entre voulu, mesuré et simulé ; limites des solutions ; évolutions chiffrées.', 3],
    ['inv', 'Les exploitations possibles', 'Inventaire par fonction et par niveau (lycée, STS, IUT, CPGE).', 2],
    ['seq', 'L’exploitation détaillée', 'Place dans la progression de l’année, compétences, séquence, séance, documents élèves, évaluation.', 10],
    ['ann', 'Sommaire, bibliographie, annexes', 'Pages numérotées, figures référencées, bibliographie, français relu.', 2],
  ];
  const ETATS = [['', 'à faire', 0], ['c', 'en cours', 0.35], ['r', 'rédigé', 0.8], ['ok', 'relu', 1]];
  const avance = () => { const d = st.dossier || {}, av = d.av || {}, tot = PLAN.reduce((s, p) => s + p[3], 0); return Math.round(100 * PLAN.reduce((s, p) => s + p[3] * ((ETATS.find((e) => e[0] === (av[p[0]] || '')) || ETATS[0])[2]), 0) / tot); };
  const QUESTIONS = {
    commun: ['Comment as-tu eu accès à ce système, et qui as-tu rencontré dans l’entreprise ?', 'Qu’as-tu fait toi-même : quelles mesures, quels modèles, quelles simulations ?', 'Quelles hypothèses as-tu posées dans ton modèle, et jusqu’où reste-t-il valable ?', 'Quel écart entre ta simulation et ta mesure, et d’où vient-il ?', 'Pourquoi le constructeur a-t-il choisi ce constituant plutôt qu’un autre ? Qu’aurais-tu choisi ?', 'Quelle évolution proposerais-tu au constructeur, et que gagnerait-il, en chiffres ?', 'Pourquoi ce niveau de classe pour ton exploitation, et quelles compétences du référentiel vises-tu ?', 'Comment évalues-tu tes élèves pendant et après cette séance ?', 'Comment cette séance s’insère-t-elle dans ta progression de l’année ?', 'Quels risques pour les élèves sur ce support, et comment les maîtrises-tu ?'],
    ext: ['Comment tes séances font-elles vivre les valeurs de la République, par exemple la laïcité ou l’égalité entre filles et garçons ?', 'Avec quelles autres disciplines travaillerais-tu sur ce support, et comment ?', 'Que fais-tu face à un élève qui refuse de participer à une activité pratique ?'],
  };
  // les dates de la session 2027 (calendrier officiel, voir agreg/agreg-plan.js)
  const J = (a, m, j) => new Date(a, m - 1, j).getTime();
  const JALONS = [
    [J(2027, 1, 24), 'Avant les écrits de l’interne', 'Support choisi, accord de l’entreprise, documentation du constructeur et cahier des charges en main, problématique écrite en une page.'],
    [J(2027, 2, 16), 'Entre les deux séries d’écrits (30 janvier – 16 février)', 'La visite, les photos, les mesures sur le système, à des points de fonctionnement réels.'],
    [J(2027, 3, 31), 'Après les écrits de l’externe (dès le 6 mars)', 'Les modèles et les simulations confrontés aux mesures, puis la rédaction du dossier technique.'],
    [J(2027, 4, 20), 'Ensuite', 'Le dossier pédagogique : une exploitation détaillée, testée si possible avec une classe ; la relecture ; le dépôt sur Cyclades à la date indiquée (« Mes justificatifs ») : un dépôt en retard élimine.'],
    [0, 'Les deux dernières semaines', 'L’exposé de 30 minutes répété au chronomètre, et des entretiens sur ton dossier.'],
  ];

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('dos-css')) return;
    const s = document.createElement('style'); s.id = 'dos-css';
    s.textContent = `.dos-f{margin:12px 0}.dos-f label{display:block;font-weight:700}.dos-f small{display:block;color:#587083;margin:2px 0 6px}.dos-f textarea{width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px}
.dos-ck{display:grid;gap:8px;margin:8px 0}.dos-ck label{display:flex;gap:10px;align-items:flex-start;font-size:15px;cursor:pointer}.dos-ck input{margin-top:4px;flex:none}.dos-ck small{display:block;color:#a8362b}.dos-ck label.on small{display:none}
.dos-sc{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#183047;color:#fff;border-radius:10px;padding:10px 16px;margin:10px 0}.dos-sc strong{font-size:24px}
.dos-tab{width:100%;border-collapse:collapse;font-size:14px}.dos-tab td,.dos-tab th{border-bottom:1px solid #dfe7ee;padding:8px;text-align:left;vertical-align:top}.dos-tab td.n{white-space:nowrap;text-align:right}.dos-tab select{font:inherit;font-size:14px;padding:4px 6px;border-radius:6px;border:1px solid #b9c8d3;background:#fff}
.dos-niv{display:inline-block;font-size:12px;font-weight:700;border-radius:999px;padding:2px 10px;white-space:nowrap}.dos-niv.s{background:#e3f3ea;color:#1f7a53}.dos-niv.r{background:#fff2dc;color:#8a5a00}.dos-niv.k{background:#fdeceb;color:#a8362b}
.dos-et{border:1px solid #dbe5ec;border-radius:8px;padding:10px 14px;margin:8px 0;background:#fbfcfd}.dos-et b{color:#12566f}.dos-et p{margin:4px 0}
.dos-j{list-style:none;padding:0;margin:8px 0}.dos-j li{border-left:4px solid #7a4fa3;padding:6px 12px;margin:8px 0;background:#f8f6fb;border-radius:0 8px 8px 0}.dos-j li.passe{opacity:.6}.dos-j b{display:block}
.dos-bar{height:10px;background:#e3eaef;border-radius:6px;overflow:hidden;margin:8px 0}.dos-bar i{display:block;height:100%;background:#7a4fa3}
.dos-print{display:none}
@media print{body{background:#fff}.dos-ecran,.back,#hl-bandeau{display:none!important}.dos-print{display:block}.dos-print h2{font-size:17px;margin:14px 0 4px}.dos-print p,.dos-print li{font-size:12.5px}}
@media(max-width:640px){.dos-tab td,.dos-tab th{padding:6px 4px}.dos-tab{font-size:13px}}`;
    document.head.appendChild(s);
  }

  /* ---------- le déroulé : 30 min de présentation, 30 min d'entretien ---------- */
  function frise() {
    const P = [['Support, authenticité, actualité', 6, '#12566f'], ['Investigations et développements', 12, '#2f8f4e'], ['Évolutions', 4, '#9c5221'], ['Exploitation pédagogique', 6, '#7a4fa3'], ['Conclusion', 2, '#587083'], ['Entretien', 30, '#a8362b']];
    const W = 640; let x = 0;
    const r = P.map((p) => { const w = W * p[1] / 60, s = `<rect x="${x}" y="6" width="${w - 2}" height="32" rx="5" fill="${p[2]}"/>${w > 40 ? `<text x="${x + w / 2}" y="27" font-size="12" text-anchor="middle" fill="#fff">${p[1]} min</text>` : ''}`; x += w; return s; }).join('');
    return `<svg viewBox="0 0 ${W} 44" width="100%" role="img" aria-label="déroulé de l’épreuve sur dossier : 30 minutes de présentation, 30 minutes d’entretien">${r}</svg>
      <p class="muted" style="margin:4px 0 0;display:flex;flex-wrap:wrap;gap:4px 14px">${P.map((p) => `<span><b style="color:${p[2]}">■</b> ${esc(p[0])} · ${p[1]} min</span>`).join('')}</p>`;
  }

  /* ---------- la page ---------- */
  let minuterie = 0;
  const garderTard = () => { clearTimeout(minuterie); minuterie = setTimeout(save, 700); };
  function vue() {
    css();
    const d = D(), A = ATT[d.cc], now = Date.now();
    const ul = (L) => `<ul>${L.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const nCk = AUTO.filter((a) => d.ck[a[0]]).length;
    const qs = questions();
    app().innerHTML = `<div class="dos-ecran"><a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">Agrégation SII · épreuve sur dossier</div><h1>Le dossier industriel</h1>
      <p>À l’interne comme à l’externe : soutenir devant le jury un dossier technique et scientifique sur un système réel de l’ingénierie électrique, puis 30 minutes d’entretien. C’est le travail le plus long de l’admission : il demande plusieurs mois et ne se prépare pas entre l’admissibilité et l’admission.</p></div>
      <div class="card dos-ecran"><h2 style="margin:0 0 8px">Le déroulé, en une image</h2>${frise()}<p class="muted" style="margin:8px 0 0">La répartition du temps de présentation est celle de « Répéter mon exposé » ; le rapport demande surtout d’équilibrer la technique et la pédagogie.</p></div>
      <div class="card dos-ecran" style="margin-top:16px"><div class="switch" role="tablist">${['int', 'ext'].map((k) => `<button type="button" data-dos-cc="${k}" class="${d.cc === k ? 'on' : ''}">${ATT[k].nom}</button>`).join('')}</div>
        <div class="stats" style="margin:12px 0">${A.tuiles.map(([n, t]) => `<div><strong>${esc(n)}</strong><small class="muted">${esc(t)}</small></div>`).join('')}</div>
        <p>${esc(A.def)}</p>
        <h3>Ce que le dossier contient</h3>${ul(A.contenu)}<h3>Ce que le jury note</h3>${ul(A.note)}<h3>Ce qui coûte des points</h3>${ul(A.pertes)}<h3>Les conseils du jury</h3>${ul(A.conseils)}
        <p class="muted">Source : <a href="${A.src[1]}" target="_blank" rel="noopener">${esc(A.src[0])}</a>.</p></div>
      <div class="card dos-ecran" style="margin-top:16px"><h2 style="margin:0 0 4px">Ton support</h2><p class="muted" style="margin:0">Remplis ce que tu sais déjà, même en quelques mots : tout est gardé, et sert au jury IA et à l’entretien.</p>
        ${CHAMPS.map(([k, l, aide, h]) => `<div class="dos-f"><label for="dos-${k}">${esc(l)}</label><small>${esc(aide)}</small><textarea id="dos-${k}" rows="${h}" data-dos-f="${k}">${esc(d.f[k] || '')}</textarea></div>`).join('')}</div>
      <div class="card dos-ecran" style="margin-top:16px"><h2 style="margin:0 0 4px">L’autodiagnostic du jury</h2><p class="muted" style="margin:0">Dix questions tirées des critères et des faiblesses relevées dans les deux rapports. Coche ce qui est vrai pour ton support.</p>
        <div class="dos-sc" id="dos-sc">${score(nCk)}</div>
        <div class="dos-ck">${AUTO.map(([k, t, r]) => `<label class="${d.ck[k] ? 'on' : ''}"><input type="checkbox" data-dos-ck="${k}"${d.ck[k] ? ' checked' : ''}><span>${esc(t)}<small>${esc(r)}</small></span></label>`).join('')}</div></div>
      <div class="card dos-ecran" style="margin-top:16px"><h2 style="margin:0 0 4px">L’avis du jury IA sur ton support</h2><p class="muted" style="margin:0 0 8px">Il lit ta fiche avec les attentes des deux rapports : ce qui tient, ce qui est risqué, des problématiques, trois études, deux exploitations, les questions probables et tes prochaines actions.</p>
        <div class="btns"><button class="b" type="button" data-dos-ia="1">${d.ia ? 'Redemander l’avis du jury' : 'Demander l’avis du jury'}</button></div><div id="dos-ia">${d.ia ? avis(d.ia) : ''}</div></div>
      <div class="card dos-ecran" style="margin-top:16px"><h2 style="margin:0 0 4px">Le plan du dossier et son avancement</h2><p class="muted" style="margin:0">Quarante pages au plus à l’interne, réparties ainsi ; la même trame vaut pour l’externe${d.cc === 'ext' ? ', avec deux niveaux d’exploitation (second degré et supérieur) dont un détaillé' : ''}.</p>
        <div class="dos-bar"><i id="dos-pr" style="width:${avance()}%"></i></div><p class="muted" id="dos-prt" style="margin:0 0 6px">Dossier rédigé à ${avance()} %</p>
        <table class="dos-tab"><tbody>${PLAN.map(([k, t, x, p]) => `<tr><td><b>${esc(t)}</b><br><span class="muted">${esc(x)}</span></td><td class="n">${p} p.</td><td><select data-dos-av="${k}" aria-label="avancement : ${esc(t)}">${ETATS.map(([v, l]) => `<option value="${v}"${(d.av[k] || '') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>
      <div class="card dos-ecran" style="margin-top:16px"><h2 style="margin:0 0 4px">Les jalons jusqu’au dépôt</h2><p class="muted" style="margin:0">Des repères pour mener le dossier avec les écrits ; les dates des épreuves d’admission et du dépôt sont dans Cyclades.</p>
        <ol class="dos-j">${JALONS.map(([t, q, x]) => `<li class="${t && t < now ? 'passe' : ''}"><b>${esc(q)}${t && t > now ? ` · d’ici le ${esc(date(t))}` : ''}</b>${esc(x)}</li>`).join('')}</ol></div>
      <div class="card dos-ecran" style="margin-top:16px"><div class="eyebrow">L’entretien en direct</div><h2 style="margin:4px 0 6px">Le jury te questionne sur ton dossier</h2>
        <p class="muted" style="margin:0 0 8px">${d.ia && d.ia.questions && d.ia.questions.length ? 'Les questions viennent de l’avis du jury sur ton support.' : 'Questions tirées des thèmes des rapports ; demande l’avis du jury pour des questions propres à ton support.'}${d.cc === 'ext' ? ' À l’externe, l’entretien s’élargit au métier et aux valeurs de la République.' : ''}</p>
        ${window.ADMISSION_ORAL ? '<div id="dos-live"></div>' : '<p class="hint">Le module de l’oral n’est pas chargé.</p>'}
        <div class="btns" style="margin-top:12px"><a class="b sec" href="#admission-expose-dos">Répéter l’exposé de 30 minutes</a><a class="b sec" href="#admission-cartes-entretien">Les cartes d’entretien</a><button class="b sec" type="button" data-dos-print="1">Imprimer ma fiche dossier</button></div></div>
      <div class="dos-print">${impression(d, qs)}</div>`;
    if (window.ADMISSION_ORAL) {
      ADMISSION_ORAL.entretien(document.getElementById('dos-live'), { etat: d.ent, contexte: resume(), questions: qs.slice(0, 6), src: 'dossier', max: 6, sauver: save,
        cadre: `C'est l'épreuve de soutenance d'un dossier industriel (${ATT[d.cc].nom.toLowerCase()}) : l'entretien vérifie que le dossier est le travail personnel du candidat, fait préciser les modèles, les mesures, les choix du constructeur et l'exploitation pédagogique${d.cc === 'ext' ? ", puis s'élargit aux finalités de l'enseignement technologique, aux missions du professeur et aux valeurs de la République" : ''}. Le dossier n'est peut-être pas encore rédigé : appuie-toi sur sa fiche.` });
    }
    if (window.ADMISSION_ORAL && ADMISSION_ORAL.micros) ADMISSION_ORAL.micros(app());
    app().onsubmit = (e) => e.preventDefault();
    app().oninput = (e) => {
      const k = e.target.dataset && e.target.dataset.dosF;
      if (k) { D().f[k] = e.target.value.slice(0, 4000); garderTard(); }
    };
    app().onchange = (e) => {
      const t = e.target, ds = t.dataset || {};
      if (ds.dosCk) { D().ck[ds.dosCk] = t.checked; const l = t.closest('label'); if (l) l.classList.toggle('on', t.checked); const sc = document.getElementById('dos-sc'); if (sc) sc.innerHTML = score(AUTO.filter((a) => D().ck[a[0]]).length); save(); }
      if (ds.dosAv != null) { D().av[ds.dosAv] = t.value; const v = avance(), b = document.getElementById('dos-pr'), x = document.getElementById('dos-prt'); if (b) b.style.width = v + '%'; if (x) x.textContent = `Dossier rédigé à ${v} %`; save(); }
    };
    app().onclick = (e) => {
      const b = e.target.closest('[data-dos-cc],[data-dos-ia],[data-dos-print]'); if (!b) return;
      if (b.dataset.dosCc) { if (D().cc !== b.dataset.dosCc) { D().cc = b.dataset.dosCc; save(); vue(); } return; }
      if (b.dataset.dosIa) { evaluer(b); return; }
      if (b.dataset.dosPrint) { clearTimeout(minuterie); save(); const p = app().querySelector('.dos-print'); if (p) p.innerHTML = impression(D(), questions()); window.print(); }
    };
  }
  function score(n) {
    const m = n >= 9 ? 'Ton support coche presque tout : reste à le prouver dans le dossier, mesures et documents à l’appui.' : n >= 6 ? 'Une base possible : chaque case vide est une question que le jury posera.' : 'Support encore fragile pour l’agrégation : regarde les risques en rouge, ou cherche un autre système.';
    return `<strong>${n} / 10</strong><span>${esc(m)}</span>`;
  }
  function questions() {
    const d = st.dossier || {}, ia = d.ia && Array.isArray(d.ia.questions) ? d.ia.questions : [];
    const base = QUESTIONS.commun.concat(d.cc === 'ext' ? QUESTIONS.ext : []);
    return ia.length ? ia.concat(d.cc === 'ext' ? QUESTIONS.ext.slice(0, 1) : []) : base;
  }

  /* ---------- résumé du dossier (pour le jury IA, l'entretien et l'exposé) ---------- */
  function resume() {
    const d = st.dossier; if (!d || !d.f) return '';
    const f = d.f, L = CHAMPS.filter(([k]) => String(f[k] || '').trim()).map(([k, l]) => `- ${l} : ${String(f[k]).trim().slice(0, 1500)}`);
    if (!L.length) return '';
    const oui = AUTO.filter((a) => d.ck && d.ck[a[0]]).map((a) => a[1]), non = AUTO.filter((a) => !(d.ck && d.ck[a[0]])).map((a) => a[1]);
    return L.join('\n') + `\n- Autodiagnostic (${oui.length} sur 10) : vrai pour « ${oui.join(' » ; « ') || 'rien encore'} » ; pas encore : « ${non.join(' » ; « ') || 'rien'} ».`;
  }

  /* ---------- l'avis du jury IA ---------- */
  const NIVEAUX = { solide: 's', 'à renforcer': 'r', risqué: 'k' };
  function avis(R) {
    const b = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
    return `<div class="ainote" style="margin-top:12px"><strong>Avis du jury</strong><span>du ${esc(date(R.t))}${R.sup ? ' · ' + esc(court(R.sup, 60)) : ''}</span></div>
      ${R.verdict ? `<p style="margin:12px 0"><b>En deux mots :</b> ${esc(R.verdict)}</p>` : ''}
      ${R.criteres && R.criteres.length ? `<table class="dos-tab"><tbody>${R.criteres.map((c) => `<tr><td><b>${esc(c.critere)}</b><br><span class="muted">${esc(c.commentaire)}</span></td><td class="n"><span class="dos-niv ${NIVEAUX[c.niveau] || 'r'}">${esc(c.niveau)}</span></td></tr>`).join('')}</tbody></table>` : ''}
      <div class="aires">${b('Des problématiques possibles', R.problematiques)}
      ${R.etudes && R.etudes.length ? `<h3>Trois études de niveau agrégation</h3>${R.etudes.map((x) => `<div class="dos-et"><b>${esc(x.titre)}</b><p><span class="muted">Modèle :</span> ${esc(x.modele)}</p><p><span class="muted">Mesure :</span> ${esc(x.mesure)}</p><p><span class="muted">Ce qu’elle valide :</span> ${esc(x.validation)}</p></div>`).join('')}` : ''}
      ${R.exploitations && R.exploitations.length ? `<h3>Deux exploitations pédagogiques</h3>${R.exploitations.map((x) => `<div class="dos-et"><b>${esc(x.niveau)}</b><p>${esc(x.sequence)}</p><p class="muted">${esc(x.seance)}</p></div>`).join('')}` : ''}
      ${b('Les questions probables du jury', R.questions)}${b('Tes prochaines actions', R.a_faire)}</div>
      <p class="muted">Avis d’une IA d’après les rapports de jury 2025 : le regard d’un collègue exigeant, pas une note officielle. Vérifie chaque donnée technique dans les documents du constructeur.</p>`;
  }
  async function evaluer(btn) {
    const d = D(), box = document.getElementById('dos-ia');
    clearTimeout(minuterie);
    if (!String(d.f.sup || '').trim() || (String(d.f.pb || '').trim() + String(d.f.bes || '').trim()).length < 10) { box.innerHTML = '<p class="hint">Écris au moins le support, et le besoin ou ta problématique, même en quelques mots.</p>'; return; }
    save();
    btn.disabled = true; box.innerHTML = '<div class="think" style="margin-top:12px">Le jury lit ta fiche… (jusqu’à une minute)</div>';
    let s = null; try { s = await getSample(); } catch (e) { s = null; }
    if (!s) { btn.disabled = false; box.innerHTML = '<p class="hint">L’IA n’est pas disponible pour l’instant.</p>'; return; }
    const att = (k) => `### ${ATT[k].nom}\n${ATT[k].def}\nContenu attendu :\n${ATT[k].contenu.map((x) => '- ' + x).join('\n')}\nCe qui est noté :\n${ATT[k].note.map((x) => '- ' + x).join('\n')}\nCe qui coûte des points :\n${ATT[k].pertes.map((x) => '- ' + x).join('\n')}`;
    const prompt = `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique, pour l'épreuve de soutenance d'un dossier industriel. Le candidat passe l'interne (coefficient 1, dossier de 40 pages au plus, déposé sur Cyclades avant les épreuves d'admission) et l'externe (coefficient 2, entretien élargi aux missions du professeur et aux valeurs de la République) à la session 2027, avec le même support. Il n'a peut-être pas encore rédigé son dossier : il te présente la fiche de son support.

## Ce que disent les rapports de jury 2025
${att('int')}

${att('ext')}

## La fiche du candidat
${resume()}

## Consignes
1. "verdict" : deux phrases franches : ce support peut-il tenir devant le jury de l'agrégation ? Si c'est un montage fait par le candidat lui-même, un système fait pour l'enseignement ou un projet d'élèves, dis-le clairement et dis comment le rendre recevable (un matériel du commerce, un exploitant ou un constructeur partenaire, des données d'origine).
2. "criteres" : pour chacun de ces sept critères, dans cet ordre, {"critere": son nom, "niveau": "solide", "à renforcer" ou "risqué", "commentaire": une phrase} : authenticité et actualité ; ingénierie électrique ; problématique réelle ; niveau scientifique (modèles et simulations) ; mesures sur le vrai système ; exploitation pédagogique ; faisabilité d'ici les épreuves d'admission.
3. "problematiques" : trois problématiques techniques et scientifiques possibles sur ce support, chacune en une question.
4. "etudes" : trois études de niveau agrégation : {"titre", "modele" (le modèle et ses hypothèses), "mesure" (ce qu'on mesure sur le vrai système, avec quel appareil), "validation" (la performance du cahier des charges vérifiée)}.
5. "exploitations" : deux exploitations pédagogiques, une du second degré et une du supérieur : {"niveau" (une classe précise, par exemple Terminale STI2D ou BTS Électrotechnique), "sequence" (le titre et les compétences visées), "seance" (ce que font les élèves, en une ou deux phrases)}.
6. "questions" : huit questions que le jury poserait probablement à l'entretien sur ce dossier, courtes, une seule idée chacune.
7. "a_faire" : les quatre à six prochaines actions concrètes, dans l'ordre.
N'invente aucune donnée chiffrée sur ce système : si une valeur manque, dis où la chercher. Tutoie le candidat. Français simple, phrases courtes. Pas de Markdown, pas de HTML.

Réponds en JSON : {"verdict": "…", "criteres": [{"critere": "…", "niveau": "solide", "commentaire": "…"}], "problematiques": ["…"], "etudes": [{"titre": "…", "modele": "…", "mesure": "…", "validation": "…"}], "exploitations": [{"niveau": "…", "sequence": "…", "seance": "…"}], "questions": ["…"], "a_faire": ["…"]}`;
    try {
      const r = await s.json(prompt.slice(0, 39000), { cache: false, modelTier: 'complex' });
      if (!r || typeof r !== 'object' || !(r.verdict || (r.criteres && r.criteres.length))) throw new Error('réponse vide');
      const txt = (x) => String(x == null ? '' : x).trim();
      const obj = (L, n, f) => (Array.isArray(L) ? L : []).filter((x) => x && typeof x === 'object').slice(0, n).map(f);
      D().ia = {
        t: Date.now(), sup: court(d.f.sup, 80), verdict: txt(r.verdict).slice(0, 800),
        criteres: obj(r.criteres, 7, (c) => ({ critere: txt(c.critere).slice(0, 80), niveau: NIVEAUX[txt(c.niveau)] ? txt(c.niveau) : 'à renforcer', commentaire: txt(c.commentaire).slice(0, 400) })),
        problematiques: liste(r.problematiques, 3), etudes: obj(r.etudes, 3, (x) => ({ titre: txt(x.titre), modele: txt(x.modele), mesure: txt(x.mesure), validation: txt(x.validation) })),
        exploitations: obj(r.exploitations, 2, (x) => ({ niveau: txt(x.niveau), sequence: txt(x.sequence), seance: txt(x.seance) })),
        questions: liste(r.questions, 8), a_faire: liste(r.a_faire, 6),
      };
      save();
      if (location.hash === '#admission-dossier') { vue(); const o = document.getElementById('dos-ia'); if (o) o.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    } catch (e) { btn.disabled = false; box.innerHTML = `<p class="hint">${esc(erreurIA(e))}</p>`; }
  }

  /* ---------- la fiche à imprimer ---------- */
  function impression(d, qs) {
    const f = d.f || {};
    return `<p style="font-size:22px;font-weight:700;margin:0 0 4px">Mon dossier industriel</p><p class="muted">Agrégation SII, option ingénierie électrique · interne et externe 2027 · fiche du ${esc(date(Date.now()))}</p>
      ${CHAMPS.map(([k, l]) => `<h2>${esc(l)}</h2><p style="white-space:pre-wrap">${esc(f[k] || '—')}</p>`).join('')}
      <h2>Autodiagnostic : ${AUTO.filter((a) => d.ck && d.ck[a[0]]).length} / 10</h2><ul style="list-style:none;padding-left:0">${AUTO.map(([k, t]) => `<li>${d.ck && d.ck[k] ? '✓' : '○'} ${esc(t)}</li>`).join('')}</ul>
      <h2>Le plan (dossier rédigé à ${avance()} %)</h2><ul>${PLAN.map(([k, t, , p]) => `<li>${esc(t)} · ${p} p. · ${esc((ETATS.find((e) => e[0] === ((d.av || {})[k] || '')) || ETATS[0])[1])}</li>`).join('')}</ul>
      ${d.ia && d.ia.verdict ? `<h2>L’avis du jury IA (${esc(date(d.ia.t))})</h2><p>${esc(d.ia.verdict)}</p>${(d.ia.a_faire || []).length ? `<p><b>Prochaines actions :</b></p><ol>${d.ia.a_faire.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}` : ''}
      <h2>Les questions à préparer</h2><ol>${qs.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>`;
  }

  /* ---------- la carte de l'accueil des épreuves d'admission ---------- */
  function carte() {
    const d = st.dossier || {}, f = d.f || {}, n = AUTO.filter((a) => (d.ck || {})[a[0]]).length;
    return `<div class="card" style="margin-top:16px;border-left:5px solid #7a4fa3"><div class="eyebrow">Épreuve sur dossier · interne et externe</div><h2 style="margin:4px 0 6px">Le dossier industriel</h2>
      <p style="margin:0 0 8px">${f.sup ? `Ton support : <b>${esc(court(f.sup))}</b> · autodiagnostic ${n} / 10 · dossier rédigé à ${avance()} %.` : 'Un système réel de l’ingénierie électrique, authentique et actuel, présenté 30 minutes au jury puis 30 minutes d’entretien. Il demande plusieurs mois : c’est maintenant qu’il se prépare.'}</p>
      <div class="btns"><a class="b" href="#admission-dossier">Préparer mon dossier</a><a class="b sec" href="#admission-expose-dos">Répéter l’exposé</a></div></div>`;
  }

  const gere = (h) => h === 'admission-dossier';
  const route = () => vue();
  window.ADMISSION_DOSSIER = { route, gere, carte, resume, css, ATT, AUTO, PLAN };
})();
