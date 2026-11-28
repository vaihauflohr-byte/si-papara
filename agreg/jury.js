/* =====================================================================
   SI Papara — agrégation : la mémoire du jury (agreg/jury.js)
   Ce que disent les rapports des jurys de l'agrégation SII ingénierie électrique (externe 2019, 2022, 2023, 2025, 2026 ;
   interne 2025, 2026) : règles de notation, sévérité des notes, attentes de chaque épreuve, erreurs relevées et taux de
   réussite publiés, notion par notion. Résumés et citations courtes, avec leur source.
   Ce bloc part avec chaque demande de correction ou d'évaluation faite à l'IA du site (notions, écrits, TP, leçon,
   dossier, entretien) : AGREG_JURY.bloc() le construit, et l'appel à l'IA (AGREG_HOOK.sample, window.claude) est
   enveloppé pour l'insérer après la première phrase des consignes « Tu es membre du jury… » ou « Tu es correcteur… »,
   jamais dans une transcription, sans dépasser 39 500 caractères (site.js coupe à 40 000).
   Chargé juste après agreg/site.js.
   ===================================================================== */
(function () {
  'use strict';
  const MARQUE = '[Mémoire du jury]';
  // règles de notation communes aux rapports
  const REGLES = [
    'Expression littérale d’abord, puis application numérique, puis résultat encadré avec son unité ; « calculer » implique une application numérique avec l’unité (interne 2025).',
    'Un résultat donné sans explication ne rapporte pas ou peu ; le barème valorise la démarche, et une démarche correcte non menée à terme est valorisée (externe 2025, externe 2026).',
    'Une expression ou une application numérique fausse ne rapporte pas les points du résultat, même avec un raisonnement correct (externe 2026, épreuve 2).',
    'Homogénéité et unités vérifiées ; chiffres significatifs excessifs et erreurs d’ordre de grandeur pénalisés ; l’esprit critique face à un résultat aberrant est valorisé (externe 2026, 2019).',
    'Numéroter les questions, respecter l’ordre et les notations du sujet, mettre les résultats en évidence, soigner la langue (tous les rapports).',
    'Se limiter à sa spécialité pénalise fortement : les meilleures copies abordent toutes les parties (externe 2026, interne 2026).'
  ];
  // sévérité : ce que valent les notes du jury
  const ECRIT = 'Sévérité des écrits : interne 2026, moyenne des 160 copies 5,92 à l’épreuve 1 (meilleure 13,86) et 5,97 à l’épreuve 2 (meilleure 18,04), dernier admissible 8,96 ; externe 2026, moyenne des présents 8,42, des admissibles 11,49, dernier admissible 8,50. Une réponse juste, justifiée et bien rédigée vaut tous ses points ; une réponse juste sans justification, la moitié au plus ; une intention, une formule recopiée sans application ou une réponse hors sujet, rien. Ne sois pas plus indulgent que le jury : une copie moyenne de candidat vaut environ 6/20, un 16/20 est une copie de tête de concours.';
  const ORAL = 'Sévérité des oraux : interne 2026, exploitation pédagogique d’une activité pratique, moyenne 10,3 (de 5 à 17,75) ; dossier industriel, moyenne 10,68 (de 4,5 à 16,5) ; externe 2026, moyenne d’admission des présents 9,71, des admis 12,61. Une prestation correcte mais superficielle vaut autour de 10 ; au-dessus de 15, il faut une démarche solide, des mesures exploitées avec leurs écarts, une séance réaliste et des réponses précises à l’entretien.';
  const EPREUVES = {
    i1: 'Interne, épreuve 1 (5 h, coefficient 2, commune) : analyse et exploitation pédagogique d’un système pluritechnologique ; mécanique, énergie et information sont attendues de tous ; la partie pédagogique est déterminante, mais reformuler la question ou recopier la réponse d’une IA est pénalisé (interne 2025) ; réponses hors sujet et gestion du temps relevées (interne 2026).',
    i2: 'Interne, épreuve 2 (4 h, coefficient 1) : modélisation, parties indépendantes qui commencent par des questions accessibles ; les meilleures copies abordent toutes les parties et en approfondissent certaines (interne 2025, 2026).',
    e1: 'Externe, épreuve 1 (6 h, commune) : traiter au moins trois parties ; rigueur des expressions littérales et des grandeurs scalaires et vectorielles (externe 2026).',
    e2: 'Externe, épreuve 2 (6 h) : modélisation électronique, signal, transmission ; les parties spécialisées sont moins bien traitées que les premières (externe 2025).',
    e3: 'Externe, épreuve 3 (6 h) : conception préliminaire ; maîtriser les fondamentaux : diviseur de tension, comparateurs, conduction des diodes, ALI, puissance instantanée, régulation (externe 2025, 2026).',
    adm: 'Admission : la séance proposée doit être réaliste, située dans un programme et un niveau précis, avec des compétences ciblées et une évaluation ; les mesures sont exploitées avec leurs écarts et leur dispersion ; l’entretien vérifie la maîtrise scientifique et la posture d’enseignant.'
  };
  // erreurs relevées et taux de réussite publiés, notion par notion
  const NOTIONS = {
    asserv: { mots: /asservi|boucle (ouverte|fermée)|marge de (phase|gain)|correcteur|stabilit|bode|black|nyquist|fonction de transfert|réponse indicielle|premier ordre|second ordre|\bPID\b|\bPI\b|erreur statique|lin[ée]aris/i, L: [
      'Peu de candidats établissent rigoureusement la fonction de transfert du processus physique (externe 2019).',
      'Linéariser une courbe autour d’un point de fonctionnement : tous n’y arrivent pas ; l’automatique est transversale et doit être travaillée (interne 2026, épreuve 2).',
      'Attendu : automatique linéaire maîtrisée (modélisation, Bode, marge de phase, correcteurs P, PI, PID) (interne 2025, épreuve 2).',
      'Fonctions de transfert souvent approximatives et non justifiées ; modélisation au sens de l’automatique peu abordée (externe 2026, épreuve 3).',
      'Diagramme de Bode asymptotique correctement tracé par 7 candidats seulement (externe 2026, épreuve 2).',
      'Stabilité par les valeurs propres de la matrice d’évolution maîtrisée par 6 % des candidats (externe 2022).'
    ] },
    puiss: { mots: /puissance|énergie|rendement|facteur de puissance|réactive|apparente|kWh|consommation/i, L: [
      'Puissances active et réactive et notation complexe : difficultés pour plus de la moitié des candidats (interne 2026, épreuve 2).',
      'Plus de 80 % des calculs de puissance, de rendement et de consommation non traités ou faux ; rendement du moteur ou deuxième agitateur oubliés (interne 2025, épreuve 1).',
      'Rendement de la chaîne de transmission mal pris en compte ; confusions entre puissance, énergie, charge, valeur moyenne et efficace (externe 2022).',
      'Énergie stockée dans un supercondensateur méconnue (externe 2022) ; capacité d’une batterie confondue avec celle d’un condensateur (externe 2026, épreuve 3).',
      'Peu prennent en compte à la fois les pertes des semi-conducteurs et celles de l’inductance dans un rendement (externe 2026, épreuve 3).'
    ] },
    fourier: { mots: /fourier|harmonique|spectre|THD|valeur efficace|valeur moyenne|redress/i, L: [
      'Les décompositions en série de Fourier de la tension et du courant doivent être maîtrisées (interne 2026, épreuve 2).',
      'Valeurs moyenne et efficace : confondues ou mal calculées par de nombreux candidats (interne 2026, externe 2022).'
    ] },
    elec: { mots: /\bALI\b|\bAOP\b|amplificateur|comparateur|millman|thévenin|diviseur|imp[ée]dance|capteur|\bRL\b|\bRC\b|diode|condensateur/i, L: [
      'Distinguer un ALI en amplificateur (régime linéaire, contre-réaction) d’un comparateur : 3 % de réussite, question très discriminante (externe 2025, épreuve 2).',
      'Équation différentielle du premier ordre : 3 % ; périodes de charge et décharge d’un circuit RL : 4 % (externe 2025, épreuve 2).',
      'Signe de l’argument d’une arc tangente dans une impédance : aucun candidat n’en a tenu compte (externe 2025, épreuve 2).',
      'Tension en régime permanent à partir du module et de l’argument d’une impédance complexe : problématique pour beaucoup (externe 2025, épreuve 2).',
      'Associations de plus de deux impédances, oubli du j dans les impédances de C et L, condensateur en régime continu : lacunes relevées (externe 2026, épreuve 2).',
      'Démonstrations de capteurs non construites ; confusion entre course et résolution d’un capteur (externe 2019).'
    ] },
    bus: { mots: /\bbus\b|trame|I2C|I²C|\bCAN\b|SPI|UART|liaison série|RS ?4[28]5|protocole|débit|adresse|QPSK|modulation|octet|hexad[ée]cimal/i, L: [
      'Protocoles de communication série méconnus de nombreux candidats, question posée depuis au moins trois sessions (externe 2025, épreuve 2).',
      'Bus I²C peu connu ; ceux qui ont abordé l’analyse de trame l’ont bien traitée (interne 2026, épreuve 2).',
      'Nombreuses erreurs sur le protocole SPI alors que la documentation est entièrement fournie (externe 2026, épreuve 1).',
      'Erreurs dues à une mauvaise lecture initiale des trames (externe 2022) ; transmission UART décrite de façon incomplète et capacité mémoire mal estimée (externe 2026, épreuve 2).',
      'Peu connaissent la signification de QPSK (externe 2026, épreuve 2).'
    ] },
    machines: { mots: /machine (synchrone|asynchrone|à courant continu)|moteur|glissement|couple|Behn|fresnel|f\.?é\.?m|alternateur|génératrice/i, L: [
      'Relations de la machine synchrone mal maîtrisées ; 60 % n’ont pas relevé la fréquence de rotation de fonctionnement (externe 2022).',
      'Diagramme de Fresnel, modèle de Behn-Eschenburg et modèle monophasé à maîtriser ; calcul complexe et puissances mal maîtrisés (externe 2026, épreuve 3).',
      'Au choix d’un moteur, beaucoup oublient de vérifier l’exigence de vitesse (externe 2026, épreuve 1).'
    ] },
    conv: { mots: /onduleur|hacheur|redresseur|convertisseur|découpage|MLI|commutation|IGBT|MOSFET|boost|buck|PD3/i, L: [
      'Convertisseurs à découpage globalement bien maîtrisés ; s’entraîner au dimensionnement des éléments magnétiques (externe 2026, épreuve 3).',
      'Pont PD3 : forme d’onde connue, mais calculs de valeur moyenne et efficace non maîtrisés par la plupart ; très peu ont correctement dimensionné son filtre passe-bas (interne 2026, épreuve 2).',
      'La moitié des candidats a câblé deux LED en parallèle là où il fallait les mettre en série (externe 2023).'
    ] },
    python: { mots: /python|programme|algorithme|\bcode\b|boucle|fonction .*\(|dichotomie|trap[èe]zes|langage C/i, L: [
      'Fonction de dichotomie partiellement complétée, codage très peu traité (interne 2025, épreuve 1).',
      'Mise à jour des paramètres dans une boucle infinie Python mal faite (externe 2026, épreuve 1) ; écriture et interprétation du code approximatives (externe 2025, épreuve 1).',
      'Méthode des trapèzes et programmation : majoritairement mal traitées ; seuls 2/5 des candidats ont abordé l’exploitation des données (externe 2026, épreuve 2).',
      'Peu de candidats traitent les questions d’algorithmique (externe 2023).'
    ] },
    signal: { mots: /filtre|échantillon|shannon|quantif|\bCAN\b|convertisseur analogique|bruit|Sallen|passe-(bas|haut|bande)|numérique/i, L: [
      'Filtre de Sallen-Key correctement traité par 5 % des candidats ; filtre RC abordé par 42 %, réussi par 72 % d’entre eux (interne 2025, épreuve 2).',
      'Bruit d’une résistance (densité spectrale) : deux candidats seulement ; calcul du bruit d’un amplificateur jamais mené à terme (externe 2025, externe 2026).',
      'Erreur de quantification et fréquence d’échantillonnage (Shannon) : lacunes persistantes (externe 2025, externe 2019).'
    ] },
    meca: { mots: /mécanique|cinématique|torseur|dynamique|statique|inertie|\bPFD\b|principe fondamental|énergie cinétique|RDM|flexion|contrainte|moment|vitesse du point/i, L: [
      'Dérivée de vecteur, intégrales et changement de point d’un torseur mal maîtrisés (interne 2025, épreuve 1) ; passage d’un modèle local à un modèle global mal maîtrisé (externe 2022).',
      'Énergie cinétique d’un solide en rotation et puissances très mal traitées ; le théorème de l’énergie cinétique est rarement connu ou écrit (externe 2026, épreuve 1).',
      'Principe fondamental de la dynamique sur un plan incliné mal maîtrisé (externe 2026, épreuve 3) ; rigueur insuffisante sur vitesses, torseurs et PFD (externe 2025, épreuve 1).',
      'RDM : coupures et équations en z rarement justes, valeurs maximales seules (externe 2026, épreuve 1) ; la notion de gain dynamique échappe à 75 % des candidats (externe 2022).'
    ] },
    thermo: { mots: /thermique|chaleur|température|fluide|pression|perte de charge|conduction|convection|bernoulli|débit/i, L: [
      'Bilan thermique : pertes par le sol calculées par 11 %, par les parois 5 %, flux pour chauffer la matière à peine 5 % (interne 2025, épreuve 1).',
      'Pertes de charge et pression de pompe rarement calculées : longueur du réseau, singularités, Bernoulli (interne 2025, épreuve 1).',
      'Ordres de grandeur des surfaces et des pressions à vérifier (externe 2026, épreuve 1).'
    ] },
    magn: { mots: /magnétique|bobinage|inductance|entrefer|tore|théorème d’ampère|ampère|transformateur|aimant|lignes de champ/i, L: [
      'Méconnaissance quasi générale de l’électromagnétisme : lignes de champ et théorème d’Ampère peu et mal traités (externe 2026, épreuve 3).',
      'Formules des énergies stockées et parcours des lignes de champ dans un circuit magnétique méconnus (externe 2023).'
    ] },
    ped: { mots: /pédagogi|séquence|séance|élève|compétence|évaluation|indicateur|protocole|fiche|leçon|exposé|niveau/i, L: [
      'Partie pédagogique déterminante : plus de 60 % de réussite chez ceux qui la traitent ; au moins 50 % proposent un protocole, moins de 40 % des indicateurs, moins de 20 % un modèle multiphysique (interne 2025, épreuve 1).',
      'Reformuler la question ou recopier les définitions d’une IA est pénalisé (interne 2025, épreuve 1).',
      'Des indicateurs observables et des niveaux d’appréciation gradués sont attendus pour évaluer une compétence (interne 2026, épreuve 1).'
    ] }
  };
  const ORAL_RX = /leçon|exposé|entretien|activité pratique|\bTP\b|\bbanc\b|dossier industriel|soutenance/i;
  const EP_RX = [['i1', /interne[^.]{0,60}épreuve 1|analyse et exploitation pédagogique/i], ['i2', /interne[^.]{0,60}épreuve 2/i], ['e1', /externe[^.]{0,60}épreuve 1|sciences industrielles de l’ingénieur \(commune\)/i], ['e2', /externe[^.]{0,60}épreuve 2/i], ['e3', /externe[^.]{0,60}épreuve 3|conception préliminaire/i]];

  // le bloc envoyé à l'IA : règles, sévérité, épreuve, puis les notions les plus présentes dans le texte (ou celles demandées)
  function bloc(o) {
    o = o || {};
    const txt = String(o.texte || '');
    const oral = o.oral != null ? o.oral : ORAL_RX.test(txt);
    let ep = o.ep && EPREUVES[o.ep] ? o.ep : null;
    if (!ep && !oral) { const f = EP_RX.find(([, rx]) => rx.test(txt)); if (f) ep = f[0]; }
    let ids = (o.notions || []).filter((k) => NOTIONS[k]);
    if (!ids.length) {
      ids = Object.keys(NOTIONS).map((k) => [k, (txt.match(new RegExp(NOTIONS[k].mots.source, 'gi')) || []).length]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, o.max || 3).map((x) => x[0]);
    }
    if (oral && !ids.includes('ped')) ids.push('ped');
    const lignes = [MARQUE + ' Ce que les rapports des jurys de l’agrégation SII ingénierie électrique disent des copies : sers-t’en pour juger et cite le rapport quand une erreur de la réponse y est relevée (par exemple « le rapport externe 2025 note que… »).',
      'Règles de notation :', ...REGLES.map((r) => '- ' + r), oral ? ORAL : ECRIT];
    if (ep) lignes.push(EPREUVES[ep]);
    if (oral) lignes.push(EPREUVES.adm);
    ids.forEach((k) => { lignes.push(`Erreurs relevées et taux publiés (${k}) :`); NOTIONS[k].L.forEach((l) => lignes.push('- ' + l)); });
    return lignes.join('\n');
  }

  // insertion dans les demandes de correction ou d'évaluation, jamais dans une transcription
  const evaluation = (p) => /^\s*Tu es (membre du jury|correcteur)/.test(p) && !/Transcris|transcris-la/.test(p.slice(0, 600)) && !p.includes(MARQUE);
  function inserer(prompt) {
    const p = String(prompt);
    if (!evaluation(p)) return p;
    let b = bloc({ texte: p });
    const place = 39500 - p.length - 4;
    if (place < 900) return p;
    if (b.length > place) b = b.slice(0, place).replace(/\n[^\n]*$/, '');
    const i = p.indexOf('\n');
    return i < 0 ? p + '\n\n' + b : p.slice(0, i) + '\n\n' + b + '\n' + p.slice(i);
  }
  function envelopper(s) {
    if (!s || s.__jury) return s;
    const json = s.json, txt = typeof s === 'function' ? s : null;
    let w = s;
    if (txt) { w = (prompt, opts) => txt(inserer(prompt), opts); Object.assign(w, s); }
    if (typeof json === 'function') w.json = (prompt, opts) => json.call(s, inserer(prompt), opts);
    if (typeof s.limits === 'function') w.limits = s.limits;
    w.__jury = true;
    return w;
  }
  // AGREG_HOOK.sample (site.js) et l'environnement des artefacts (window.claude.use)
  if (window.AGREG_HOOK && window.AGREG_HOOK.sample) window.AGREG_HOOK.sample = envelopper(window.AGREG_HOOK.sample);
  if (window.claude && typeof window.claude.use === 'function' && !window.claude.use.__jury) {
    const use = window.claude.use.bind(window.claude);
    window.claude.use = async (...a) => envelopper(await use(...a));
    window.claude.use.__jury = true;
  }
  window.AGREG_JURY = { bloc, inserer, NOTIONS, REGLES, EPREUVES, MARQUE };
})();
