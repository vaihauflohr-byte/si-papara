/* =====================================================================
   SI Papara — agrégation : l'oral et le suivi des épreuves d'admission
   - entretien simulé avec le jury IA : une question à la fois, il réagit et relance, puis un bilan
     sur 10 (composant monté dans la leçon et dans les fiches des bancs du labo) ;
   - dictée vocale (reconnaissance vocale du navigateur, en français) sur les zones de texte ;
   - l'exposé à voix haute : partie par partie, au chronomètre, transcrit, puis analysé par l'IA ;
   - cartes d'entretien (questions que posent les jurys) et cartes de sécurité électrique,
     en révision espacée : 1, 3, 7, 14 puis 30 jours, une carte ratée revient le lendemain ;
   - le tableau de bord de la partie pratique et de l'oral : critères du jury sur tous les bancs,
     simulés et réels, leçons, exposés et entretiens.
   Routes #admission-bilan, #admission-expose, #admission-cartes-entretien, #admission-cartes-securite.
   Données dans st.oral (suivent d'un appareil à l'autre avec save()). Aucune donnée d'élève.
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, getSample.
   ===================================================================== */
(function () {
  'use strict';
  const DAY = 864e5, INT = [1, 3, 7, 14, 30];
  const ok = (x) => typeof x === 'number' && isFinite(x);
  const fn = (x) => fmt(x, 3);
  const date = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const liste = (x, n) => (Array.isArray(x) ? x : []).map((y) => String(y == null ? '' : y).trim()).filter(Boolean).slice(0, n);
  const erreurIA = (e) => (window.AGREG_HOOK && AGREG_HOOK.err && AGREG_HOOK.err(e && e.code)) || 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.';
  const O = () => { if (!st.oral || typeof st.oral !== 'object') st.oral = {}; const o = st.oral; if (!o.cartes || typeof o.cartes !== 'object') o.cartes = {}; ['exposes', 'entretiens'].forEach((k) => { if (!Array.isArray(o[k])) o[k] = []; }); return o; };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  /* ---------- les cartes : questions d'entretien et sécurité électrique ---------- */
  // Questions rédigées d'après les attentes répétées des rapports de jury 2024 et 2025 (oral d'admission) ;
  // « a » : ce qu'une très bonne réponse contient.
  const ENT = [
    ['Mesure', 'Pourquoi ce nombre de points de mesure, et cette répartition ?', 'Couvrir toute la plage utile, resserrer les points là où la grandeur varie vite ou près d’un point remarquable (coude, maximum), et le justifier par l’objectif de l’essai et par le temps disponible.'],
    ['Mesure', 'Comment sais-tu que ton écart est significatif ?', 'On répète l’essai (au moins trois fois) pour connaître la dispersion, on évalue l’incertitude des appareils (classe, résolution, calibre) ; l’écart n’est commenté comme réel que s’il dépasse ces deux grandeurs.'],
    ['Mesure', 'Quelle différence entre la classe d’un appareil et sa résolution ?', 'La classe (ou la précision ±(x % de la lecture + n digits)) borne l’erreur de l’appareil ; la résolution est la plus petite variation affichée. L’incertitude de mesure tient compte des deux.'],
    ['Mesure', 'Pourquoi un appareil à valeur efficace vraie (TRMS) ici ?', 'Les courants et tensions ne sont pas sinusoïdaux (harmoniques, découpage, MLI) ; un appareil à moyenne redressée suppose un sinus et se trompe du rapport des facteurs de forme.'],
    ['Mesure', 'Comment mesures-tu la puissance absorbée par un moteur triphasé ?', 'Analyseur triphasé, trois wattmètres avec le neutre, ou méthode des deux wattmètres sur une ligne à trois fils, valable quelle que soit la charge ; branchements faits hors tension, pinces orientées vers la charge.'],
    ['Mesure', 'Ton oscilloscope affiche dix fois moins que prévu : que s’est-il passé ?', 'La sonde est en position ×10 et la voie est réglée sur ×1 : le facteur d’atténuation déclaré ne correspond pas à la sonde. On vérifie la sonde, on la compense, on déclare le bon rapport.'],
    ['Mesure', 'Comment observer une tension du circuit de puissance à l’oscilloscope sans danger ?', 'Avec une sonde différentielle isolée (ou un oscilloscope à voies isolées) : la masse d’un oscilloscope ordinaire est reliée à la terre, la relier au circuit de puissance crée un court-circuit ou met des masses sous tension.'],
    ['Mesure', 'Comment choisis-tu une pince ampèremétrique ?', 'Selon le courant maximal et crête attendu, la nature du courant (pince alternative ou pince alternative et continue à effet Hall s’il y a une composante continue), la bande passante et la précision au bas de la gamme.'],
    ['Modèle', 'Ton modèle est-il validé ? Sur quel critère ?', 'Il l’est si l’écart modèle-mesure reste inférieur à l’incertitude et à la dispersion, sur toute la plage d’utilisation visée ; on précise son domaine de validité et ses hypothèses.'],
    ['Modèle', 'Cite deux causes possibles de ton écart, et comment les vérifier.', 'Une hypothèse du modèle (pertes négligées, linéarité, vitesse supposée nominale) et une cause de mesure (appareil, branchement, conditions d’essai) ; pour chacune, un essai ou un calcul qui la confirme ou l’écarte.'],
    ['Modèle', 'Comment réduirais-tu l’écart entre la performance attendue et la mesure ?', 'Selon la cause : affiner le modèle (paramètre identifié par l’essai), modifier un réglage (correcteur, rampe, consigne) ou une solution technique (composant, filtre) ; puis vérifier par une nouvelle mesure.'],
    ['Modèle', 'Qu’apporte la simulation par rapport à la mesure ?', 'Explorer des cas impossibles ou dangereux à mesurer, faire varier un paramètre à la fois, comprendre les influences ; la mesure, elle, valide la simulation.'],
    ['Sécurité', 'Quelles étapes de consignation avant de brancher tes appareils ?', 'Séparation, condamnation (cadenas), identification (pancarte), vérification d’absence de tension au VAT, par un chargé de consignation ; reprendre les consignes du dossier du banc.'],
    ['Sécurité', 'Tes élèves peuvent-ils mesurer sous tension dans l’armoire ?', 'Un élève n’est pas habilité par un employeur : il mesure sur des équipements conçus pour l’enseignement (bornes et cordons de sécurité, coffret de confinement porte fermée), sous la surveillance de l’enseignant ; la préparation à l’habilitation fait partie de la formation en BTS.'],
    ['Sécurité', 'Quelle catégorie de mesure pour un analyseur branché sur un tableau divisionnaire ?', 'CAT III : installation fixe (tableaux, circuits). CAT IV à l’origine de l’installation, CAT II pour les prises et appareils ; les cordons et pinces doivent avoir au moins la même catégorie.'],
    ['Sécurité', 'Que fais-tu avant et après la vérification d’absence de tension ?', 'Vérifier le bon fonctionnement du VAT sur une source connue, avant et après la vérification ; utiliser un VAT adapté à la tension ; vérifier entre tous les conducteurs.'],
    ['Pédagogie', 'Quelles compétences du référentiel vise ta séance, et pourquoi celles-là ?', 'Deux à quatre compétences précises, citées avec leur code et leur intitulé, chacune reliée à une activité observable de la séance ; justifiées par la place de la séance dans la progression.'],
    ['Pédagogie', 'Comment l’élève sait-il qu’il a réussi ?', 'Critères et indicateurs de réussite connus des élèves dès le début, auto-évaluation ou évaluation entre pairs, retour de l’enseignant pendant la séance.'],
    ['Pédagogie', 'Que fais-tu pour l’élève en difficulté ? Et pour celui qui va vite ?', 'Aides graduées (coups de pouce écrits, questions intermédiaires), étayage oral, tâches découpées ; pour l’élève rapide, un prolongement (autre configuration, optimisation, question ouverte).'],
    ['Pédagogie', 'Pourquoi une démarche d’investigation plutôt qu’un TP guidé ?', 'Pour que les élèves formulent des hypothèses et construisent un protocole face à un problème authentique ; le guidage reste adapté au niveau, et le choix se justifie par les élèves visés et la compétence travaillée.'],
    ['Pédagogie', 'Comment évalues-tu des compétences pendant un TP ?', 'Par l’observation avec une grille (critères, indicateurs), le compte rendu, des points d’étape ; formative pendant la séance, certificative selon les modalités du référentiel (CCF ou épreuve ponctuelle).'],
    ['Pédagogie', 'Comment organises-tu douze élèves sur trois postes ?', 'Rotation par îlots sur des activités complémentaires (mesure, simulation, analyse de documents), durée par poste, consignes écrites, synthèse commune à la fin ; sécurité et matériel prévus pour chaque poste.'],
    ['Pédagogie', 'Comment réinvestis-tu tes propres mesures dans la séance ?', 'Comme situation déclenchante, comme données à exploiter ou comme référence de validation ; mais les élèves suivent un protocole différent de celui de l’étude, à leur niveau.'],
    ['Pédagogie', 'Quelle place pour le numérique dans ta séance ?', 'Simulation, acquisition, traitement (tableur, Python), partage des résultats ; chaque outil justifié par l’objectif d’apprentissage, pas pour lui-même.'],
    ['Pédagogie', 'Comment se fait la synthèse de la séance ?', 'Mise en commun des résultats, structuration des connaissances avec les élèves (trace écrite, schéma, carte mentale), retour à la problématique de départ.'],
    ['Pédagogie', 'Que font les élèves avant et après cette séance ?', 'Les prérequis (formulés en compétences ou connaissances), la séance qui suit, l’évaluation qui conclut la séquence : la séance a une place justifiée dans la progression.'],
    ['Pédagogie', 'Comment intègres-tu la sécurité dans ta séance ?', 'Consignes écrites et rappel au lancement, matériel de sécurité (cordons, bornes, coffrets), procédures de mise en service vérifiées par l’enseignant, sensibilisation à l’habilitation.'],
    ['Pédagogie', 'Pourquoi ce support est-il pertinent pour ces élèves ?', 'Un système réel ou didactisé qui pose un vrai problème technique, accessible au niveau visé, qui permet de mesurer ce que la compétence exige ; son lien avec le métier ou la poursuite d’études.'],
    ['Système', 'Pourquoi varier la vitesse d’une pompe plutôt qu’étrangler le débit ?', 'À débit égal, la puissance absorbée baisse fortement avec la vitesse (lois de similitude : puissance hydraulique proportionnelle au cube de la vitesse) ; en contrepartie : coût du variateur, harmoniques, plage de réglage.'],
    ['Système', 'À quoi sert le contrepoids d’un monte-charge ?', 'Il équilibre la cabine et une partie de la charge : couple, puissance et énergie demandés au moteur diminuent ; selon la charge, le moteur fournit ou freine.'],
    ['Système', 'Qu’est-ce que le THD, et pourquoi le limiter ?', 'Le taux de distorsion harmonique mesure l’importance des harmoniques devant le fondamental ; ils échauffent conducteurs et transformateurs, chargent le neutre (rangs multiples de 3), perturbent d’autres récepteurs.'],
    ['Système', 'Comment un variateur gère-t-il une charge qui entraîne le moteur ?', 'L’énergie renvoyée charge le bus continu : résistance de freinage, renvoi au réseau par un pont actif, ou rampe allongée ; sans cela, défaut de surtension.'],
    ['Système', 'Qu’est-ce que l’anti-balan d’un pont roulant ?', 'Un profil de vitesse accordé à la période du pendule (durée de rampe égale à un multiple de la période, profil en deux temps), ou un asservissement sur l’angle mesuré, pour arrêter la charge sans oscillation.'],
    ['Système', 'Quel est l’intérêt industriel de ce système, et que changerais-tu ?', 'Le besoin qu’il satisfait, ses enjeux (énergie, sécurité, qualité), ses limites mesurées, une évolution argumentée (efficacité, communication, norme récente).'],
    ['Posture', 'Le jury te signale une erreur dans ton exposé : que fais-tu ?', 'Reconnaître sans se défendre, corriger en raisonnant à voix haute, et rebondir sur la remarque pour montrer la démarche : le jury apprécie qu’on rebondisse sur ses propositions.'],
    ['Posture', 'Comment as-tu géré ton temps pendant l’épreuve ?', 'Un plan par phases avec des jalons horaires, les mesures prioritaires d’abord, les résultats sauvegardés au fur et à mesure, la séance pensée dès les expérimentations.'],
    ['Posture', 'Ce travail est-il bien le tien ? Qu’as-tu fait toi-même ?', 'Dire précisément ce qui a été mesuré, calculé, construit soi-même, avec quels outils et quelles difficultés ; le jury vérifie que le dossier résulte d’un travail personnel.'],
    ['Posture', 'Qu’as-tu appris de cette activité pour tes élèves ?', 'Les difficultés qu’ils rencontreront (mesure, sécurité, notion), les points de vigilance et les aides prévues : l’activité pratique nourrit la conception de la séance.'],
  ].map(([th, q, a], i) => ({ id: 'e' + (i + 1), th, q, a }));
  const SECU = [
    ['Consignation', 'Les quatre étapes de la consignation électrique ?', 'Séparation de l’ouvrage des sources de tension ; condamnation en position d’ouverture (cadenas) ; identification (pancarte) ; vérification d’absence de tension (VAT). Puis, si une réalimentation est possible, mise à la terre et en court-circuit.'],
    ['Consignation', 'Qui effectue la consignation ?', 'Un chargé de consignation désigné (habilitation BC en basse tension), qui remet ensuite l’ouvrage consigné au chargé de travaux ou d’intervention.'],
    ['Consignation', 'Pourquoi un cadenas par intervenant ?', 'Avec la multi-condamnation, chacun pose son propre cadenas : personne ne peut remettre sous tension tant qu’un intervenant travaille encore.'],
    ['Consignation', 'Quelles autres énergies consigner sur un monte-charge ou un portique ?', 'L’énergie potentielle de la charge (la poser en bas, au sol), les énergies mécaniques (contrepoids, ressorts), pneumatiques (préhenseur à vide) : on consigne toutes les énergies, pas seulement l’électricité.'],
    ['Habilitation', 'Que désigne l’habilitation BR ?', 'Le chargé d’intervention générale en basse tension : dépannage, raccordement, mesurage, essais, sur des ouvrages simples.'],
    ['Habilitation', 'Quelle habilitation pour faire seulement des mesurages ?', 'BE Mesurage : chargé d’opérations spécifiques en basse tension (il existe aussi BE Essai, BE Vérification, BE Manœuvre).'],
    ['Habilitation', 'Un élève est-il habilité ?', 'Non : l’habilitation est délivrée par l’employeur. En formation, l’élève travaille sur des équipements conçus pour l’enseignement, sous la responsabilité de l’enseignant ; la préparation à l’habilitation fait partie de la formation.'],
    ['VAT', 'Que faire avant d’utiliser un VAT ?', 'Vérifier qu’il fonctionne sur une source connue (ou son testeur), avant et après la vérification ; il doit être adapté à la tension de l’installation.'],
    ['Mesure', 'Les catégories de mesure II, III et IV ?', 'CAT II : appareils et prises de courant. CAT III : installation fixe (tableaux de distribution, circuits). CAT IV : origine de l’installation (branchement, comptage).'],
    ['Mesure', 'Pourquoi cordons et pinces doivent-ils avoir la même catégorie que l’appareil ?', 'La catégorie et la tension assignée d’une chaîne de mesure sont celles de son élément le plus faible.'],
    ['Mesure', 'Pourquoi des fiches 4 mm de sécurité, à reprise arrière ?', 'Douilles et fiches isolées : aucune partie active accessible au doigt pendant le branchement ; on n’utilise jamais de fiches banane nues sur un circuit de puissance.'],
    ['Mesure', 'Pourquoi ne pas relier la masse d’un oscilloscope au circuit de puissance ?', 'La masse de l’oscilloscope est reliée à la terre par son cordon : la relier à un point sous tension crée un court-circuit ou met les masses sous tension. On utilise une sonde différentielle isolée.'],
    ['Mesure', 'Mesure d’isolement : quel appareil, dans quelles conditions ?', 'Un contrôleur d’isolement, installation hors tension et consignée, récepteurs sensibles débranchés ; tension d’essai et valeur minimale fixées par la NF C 15-100 selon la tension du circuit.'],
    ['Protection', 'Contre quoi protège un différentiel 30 mA ?', 'C’est une protection complémentaire contre les contacts directs ; il assure aussi la coupure en cas de défaut d’isolement (contact indirect).'],
    ['Protection', 'Le différentiel déclenche pendant un TP : que fais-tu ?', 'Ne pas réarmer en boucle : laisser hors tension, chercher le défaut d’isolement (débrancher la platine ou le récepteur suspect, puis réarmer), et ne remettre en service qu’une fois le défaut trouvé.'],
    ['Protection', 'Tension limite conventionnelle de contact ?', '50 V en alternatif dans les locaux secs, 25 V dans les locaux humides : au-delà, la coupure automatique doit intervenir à temps.'],
    ['Protection', 'Schéma TT : quelle condition protège les personnes ?', 'RA × IΔn ≤ UL (50 V en local sec) : la prise de terre des masses et le dispositif différentiel doivent être coordonnés.'],
    ['Protection', 'Que signifie IP2X ?', 'Protégé contre l’accès aux parties dangereuses avec un doigt, et contre les corps solides de 12,5 mm et plus.'],
    ['Variateur', 'Pourquoi attendre avant d’ouvrir un variateur mis hors tension ?', 'Les condensateurs du bus continu restent chargés : attendre la durée indiquée par le constructeur, puis vérifier l’absence de tension sur le bus.'],
    ['Machine', 'Arrêt d’urgence : que doit-il garantir ?', 'Il est prioritaire sur toute autre commande, arrête la machine (arrêt immédiat ou contrôlé puis coupure, selon l’analyse des risques), et la remise en marche exige un réarmement volontaire.'],
    ['Machine', 'Charge suspendue : les règles ?', 'Personne sous la charge ni dans la zone balisée, poids manipulés charge en bas, jamais de charge au-dessus des personnes ni au-delà de la capacité.'],
    ['Machine', 'Avant de mettre un banc sous tension ?', 'Câblage contrôlé hors tension (continuité, absence de court-circuit), protections et capots en place, arrêt d’urgence essayé, personne dans la zone dangereuse, consignes du dossier relues.'],
    ['Secours', 'Une personne est électrisée : que fais-tu ?', 'Couper le courant (ou dégager la victime avec un objet isolant sans la toucher), alerter (15, 18 ou 112), protéger, puis pratiquer les gestes de secours (massage cardiaque et défibrillateur si elle ne respire plus).'],
  ].map(([th, q, a], i) => ({ id: 's' + (i + 1), th, q, a }));
  const DECKS = { entretien: { nom: 'Cartes d’entretien', cartes: ENT, sous: 'Les questions que posent les jurys après l’exposé, d’après les rapports 2024 et 2025, avec ce qu’une très bonne réponse contient.' },
    securite: { nom: 'La sécurité en 10 minutes', cartes: SECU, sous: 'Consignation, habilitations, catégories de mesure, protections : à revoir avant chaque séance de TP, et avant l’épreuve.' } };
  const rec = (id) => { const C = O().cartes; return C[id] || (C[id] = { box: 0, due: 0, vu: 0, ok: 0 }); };
  const dues = (deck) => DECKS[deck].cartes.filter((c) => { const r = O().cartes[c.id]; return r && r.vu && r.due <= Date.now(); }).length;
  const neuves = (deck) => DECKS[deck].cartes.filter((c) => !(O().cartes[c.id] || {}).vu).length;
  const sues = (deck) => DECKS[deck].cartes.filter((c) => (O().cartes[c.id] || {}).box >= 3).length;
  function noter(id, k) {   // k : 2 je savais, 1 à moitié, 0 à revoir
    const r = rec(id), now = Date.now();
    r.vu = now;
    if (k === 2) { r.box = Math.min(5, r.box + 1); r.ok++; r.due = now + INT[r.box - 1] * DAY; }
    else if (k === 1) { r.box = Math.max(1, r.box); r.due = now + DAY; }
    else { r.box = 0; r.due = now + 20 * 36e5; }
    save();
  }

  /* ---------- dictée vocale ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  // sur Android, le mode continu répète les résultats : on enchaîne des reconnaissances courtes
  const CONTINU = !/Android/i.test(navigator.userAgent || '');
  // deux morceaux de transcription, séparés par une espace si besoin
  const coller = (a, b) => (a && b && !/\s$/.test(a) && !/^\s/.test(b) ? a + ' ' + b : a + b);
  // une reconnaissance en français, relancée tant que o.encore() le veut ; une seule à la fois sur la page :
  // o.ecrire(texte final, texte provisoire, session) à chaque résultat, o.fin() quand elle s'arrête pour de bon
  let courante = null;
  function ecoute(o) {
    let r = null, arret = false, finie = false, apres = null, veille = 0;
    const self = {
      stop() { arret = true; if (r) { try { r.stop(); } catch (e) { r = null; terminer(); } } else if (!finie) setTimeout(terminer, 0); },
      ensuite(f) { if (finie) f(); else apres = f; },
    };
    function terminer() {
      if (finie) return; finie = true; clearInterval(veille);
      if (courante === self) courante = null;
      if (o.fin) o.fin();
      if (apres) { const f = apres; apres = null; f(); }
    }
    function go() {
      const x = new SR(); r = x;
      x.lang = 'fr-FR'; x.continuous = CONTINU; x.interimResults = true;
      x.onresult = (ev) => { if (r !== x) return; let f = '', t = ''; for (let i = 0; i < ev.results.length; i++) { const y = ev.results[i]; if (y.isFinal) f = coller(f, y[0].transcript); else t = coller(t, y[0].transcript); } o.ecrire(f.trim(), t ? coller(f ? ' ' : '', t.trim()) : '', x); };
      x.onerror = (ev) => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { arret = true; if (o.refus) o.refus(); } };
      x.onend = () => { if (r !== x) return; r = null; if (!arret && o.encore()) go(); else terminer(); };
      try { x.start(); } catch (e) { r = null; arret = true; setTimeout(terminer, 0); }
    }
    // la page a changé (zone de texte remplacée, autre page) : on coupe le micro sans attendre la fin de la phrase
    veille = setInterval(() => { if (!arret && !o.encore()) self.stop(); }, 1000);
    const prec = courante; courante = self;
    if (prec) { prec.ensuite(() => { if (!arret) go(); else terminer(); }); prec.stop(); } else go();
    return self;
  }
  const couper = () => { if (courante) courante.stop(); };
  // chaque nouvelle session de reconnaissance repart du texte déjà écrit dans la zone
  const suite = (v) => String(v || '').replace(/\s*$/, ' ').replace(/^\s+$/, '');
  // un bouton de dictée pour une zone de texte : le texte reconnu s'ajoute à la suite
  function dictee(btn, ta) {
    if (!SR) { btn.hidden = true; return; }
    let E = null;
    btn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (E) { E.stop(); return; }
      taire();   // le micro ne doit pas entendre la voix du jury
      btn.classList.add('on'); btn.textContent = 'Arrêter la dictée'; btn.title = '';
      let base = '', vu = null;
      E = ecoute({
        ecrire: (f, t, x) => { if (vu !== x) { vu = x; base = suite(ta.value); } ta.value = base + f + t; ta.dispatchEvent(new Event('input', { bubbles: true })); },
        encore: () => document.body.contains(btn) && !ta.disabled,
        refus: () => { btn.title = 'Micro refusé par le navigateur'; },
        fin: () => { E = null; btn.classList.remove('on'); btn.textContent = 'Dicter'; ta.dispatchEvent(new Event('change', { bubbles: true })); },
      });
    };
  }
  // ajoute un bouton « Dicter » sous chaque zone de texte d'un bloc (une seule fois par zone)
  function micros(root) {
    if (!SR || !root) return;
    css();
    root.querySelectorAll('textarea:not([data-or-mic]):not([disabled])').forEach((ta) => {
      ta.dataset.orMic = '1';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'or-mic'; b.textContent = 'Dicter';
      ta.after(b); dictee(b, ta);
    });
  }

  /* ---------- la voix du jury (synthèse vocale du navigateur) ---------- */
  const VOIX = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  const voixOn = () => { try { return localStorage.getItem('or-voix') === '1'; } catch (e) { return false; } };
  const voixSet = (v) => { try { localStorage.setItem('or-voix', v ? '1' : '0'); } catch (e) { /* stockage indisponible */ } };
  function parler(t) {
    if (!VOIX || !voixOn() || !t) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(t)); u.lang = 'fr-FR'; u.rate = 1;
      const v = (speechSynthesis.getVoices() || []).find((x) => /^fr(-|_|$)/i.test(x.lang || ''));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* synthèse indisponible */ }
  }
  const taire = () => { if (VOIX) try { speechSynthesis.cancel(); } catch (e) { /* rien à arrêter */ } };
  window.addEventListener('hashchange', taire);

  /* ---------- l'entretien simulé ---------- */
  // o : { etat (objet gardé par l'appelant), contexte, questions, cadre, src, max, sauver }
  function entretien(box, o) {
    if (!box) return;
    css();   // la page qui l'accueille (leçon, fiche d'un banc) n'a pas forcément chargé ces styles
    const E = o.etat; if (!Array.isArray(E.msgs)) E.msgs = [];
    const max = o.max || 6, nQ = () => E.msgs.filter((m) => m.qui === 'jury' && m.q).length;
    let occupe = false;
    function vue() {
      const chat = E.msgs.filter((m) => !m.cache).map((m) => `<div class="or-m ${m.qui === 'jury' ? 'or-j' : 'or-c'}"><b>${m.qui === 'jury' ? 'Le jury' : 'Toi'}</b><p>${esc(m.txt)}</p></div>`).join('');
      const voix = VOIX && !(E.fin && E.bilan) ? `<label class="or-voix"><input type="checkbox" data-or-voix="1"${voixOn() ? ' checked' : ''}> Le jury lit ses questions à voix haute</label>` : '';
      let bas = '';
      if (E.fin && E.bilan) bas = bilanHtml();
      else if (!E.msgs.length) bas = `<p class="muted">Comme à l’épreuve : une question à la fois, le jury réagit à ta réponse et relance s’il le faut (${max} questions au plus). Réponds à l’écrit ou à la voix, court et justifié.</p>${voix}<div class="btns"><button class="b" type="button" data-or-go="1">Commencer l’entretien</button></div>`;
      else bas = `<div class="or-rep"><textarea rows="4" data-or-rep="1" placeholder="Ta réponse, comme tu la dirais au jury…">${esc(E.brouillon || '')}</textarea><div class="btns"><button class="b" type="button" data-or-env="1">Répondre</button><button class="b sec" type="button" data-or-fin="1">Terminer l’entretien</button></div><p class="muted or-n">Question ${nQ()} sur ${max} au plus.</p>${voix}</div>`;
      box.innerHTML = `<div class="or-chat">${chat}</div>${bas}<div class="or-att" aria-live="polite">${occupe ? `<div class="think">${esc(attente)}</div>` : ''}</div>`;
      const ta = box.querySelector('[data-or-rep]');
      if (ta) { if (occupe) box.querySelectorAll('.or-rep textarea, .or-rep button').forEach((x) => { x.disabled = true; }); else micros(box); ta.oninput = () => { E.brouillon = ta.value; }; }
      const ch = box.querySelector('.or-chat'); if (ch && E.msgs.length) ch.scrollTop = ch.scrollHeight;
    }
    function bilanHtml() {
      const B = E.bilan;
      const b = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
      return `<div class="ainote"><strong>${fn(B.note)} / 10</strong><span>Entretien du ${date(E.t || Date.now())} · ${nQ()} question${nQ() > 1 ? 's' : ''}</span></div><div class="aires">${b('Ce qui a convaincu', B.forts)}${b('À travailler', B.travail)}${b('Ce qu’une très bonne réponse contenait', B.attendus)}</div>
        <div class="btns"><button class="b sec" type="button" data-or-nv="1">Repasser un entretien</button></div><p class="muted">Entretien mené par une IA d’après les attentes des rapports de jury : l’avis d’un collègue exigeant, pas une note officielle.</p>`;
    }
    const transcript = () => E.msgs.map((m) => `${m.qui === 'jury' ? 'Jury' : 'Candidat'} : ${m.txt}`).join('\n').slice(-12000);
    let attente = '';
    const garder = () => { if (o.sauver) o.sauver(); };
    function lancer(finir) { if (occupe) return; couper(); occupe = true; attente = finir ? 'Le jury fait le bilan…' : 'Le jury t’écoute…'; vue(); tour(finir); }
    function echec(m) { occupe = false; vue(); const a = box.querySelector('.or-att'); if (a) a.innerHTML = `<p class="hint">${esc(m)}</p>`; }
    async function tour(finir) {
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { echec('L’IA n’est pas disponible pour l’instant.'); return; }
      const n = nQ(), dernier = finir || n >= max;
      const prompt = `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique, pendant l'entretien de 30 minutes qui suit l'exposé. ${o.cadre || ''}

## Ce que le candidat a présenté
${String(o.contexte || '').slice(0, 14000)}

## Les questions que tu avais préparées
${(o.questions || []).map((q) => '- ' + q).join('\n') || '- (à toi de les choisir dans son travail)'}

## L'entretien jusqu'ici
${transcript()}

## Consignes
- Mène l'entretien comme un vrai jury : bienveillant mais exigeant, une seule question à la fois, courte.
- "reaction" : une phrase de réaction à la dernière réponse, sans donner la bonne réponse.
- ${dernier ? 'C’est la fin de l’entretien : ne pose plus de question, mets "fin": true et rédige "bilan".' : `"question" : la question suivante. Relance si la réponse est vague, fausse ou incomplète (fais préciser, demande une valeur, une justification, un texte officiel) ; sinon passe à une autre de tes questions ou à un sujet tiré de son travail. On en est à la question ${n + 1} sur ${max} au plus.`}
- "bilan" (seulement à la fin) : {"note": sur 10 par pas de 0,5, "points_forts": [2 ou 3 phrases], "a_travailler": [2 à 4 phrases], "attendus": [pour chacune de tes questions, une phrase : ce qu'une très bonne réponse contenait]}.
- Tutoie le candidat. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : ${dernier ? '{"reaction": "…", "fin": true, "bilan": {"note": 6, "points_forts": ["…"], "a_travailler": ["…"], "attendus": ["…"]}}' : '{"reaction": "…", "question": "…", "fin": false}'}`;
      try {
        const r = await s.json(prompt.slice(0, 39000), { cache: false, modelTier: 'complex' });
        if (!r || typeof r !== 'object') throw new Error('réponse vide');
        const rea = String(r.reaction || '').trim(), q = String(r.question || '').trim();
        const B = r.bilan && typeof r.bilan === 'object' ? r.bilan : null, v = B ? Number(String(B.note).replace(',', '.')) : NaN;
        if ((dernier || (r.fin && !q)) && B && isFinite(v)) {
          E.bilan = { note: Math.max(0, Math.min(10, Math.round(2 * v) / 2)), forts: liste(B.points_forts, 3), travail: liste(B.a_travailler, 4), attendus: liste(B.attendus, 8) };
          if (rea) E.msgs.push({ qui: 'jury', txt: rea });
          E.fin = true; E.t = Date.now();
          O().entretiens = O().entretiens.concat([{ t: E.t, src: o.src || '', note: E.bilan.note, n: nQ() }]).slice(-40);
          parler(rea);
        } else if (!dernier && q) {
          const txt = rea ? `${rea} ${q}` : q;
          E.msgs.push({ qui: 'jury', txt, q: 1 });
          parler(txt);
        } else throw new Error('réponse incomplète');
        garder(); save();
        occupe = false; vue();
      } catch (e) { echec(erreurIA(e)); }
    }
    const reponse = () => { const ta = box.querySelector('[data-or-rep]'); return ta ? ta.value.trim().slice(0, 3000) : ''; };
    box.onclick = (e) => {
      const t = (s) => e.target.closest(s);
      if (!t('[data-or-go],[data-or-env],[data-or-fin],[data-or-nv]')) return;
      e.stopPropagation();
      if (occupe) return;
      if (t('[data-or-go]')) {
        const q = (o.questions || [])[0];
        if (q) { E.msgs.push({ qui: 'jury', txt: q, q: 1 }); garder(); vue(); parler(q); }
        else { E.msgs.push({ qui: 'candidat', txt: '(le candidat a terminé son exposé)', cache: 1 }); lancer(false); }
        return;
      }
      if (t('[data-or-env]')) { const v = reponse(); if (!v) { const ta = box.querySelector('[data-or-rep]'); if (ta) ta.focus(); return; } taire(); E.msgs.push({ qui: 'candidat', txt: v }); E.brouillon = ''; garder(); lancer(false); return; }
      if (t('[data-or-fin]')) { const v = reponse(); taire(); if (v) { E.msgs.push({ qui: 'candidat', txt: v }); E.brouillon = ''; } garder(); lancer(true); return; }
      if (t('[data-or-nv]')) { E.msgs = []; E.fin = false; E.bilan = null; E.brouillon = ''; garder(); vue(); }
    };
    box.onchange = (e) => { if (e.target.dataset && e.target.dataset.orVoix) { e.stopPropagation(); voixSet(e.target.checked); if (!e.target.checked) taire(); } };
    vue();
  }

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('or-css')) return;
    const s = document.createElement('style'); s.id = 'or-css';
    s.textContent = `.or-mic{font:inherit;font-size:13px;border:1px solid #bbccd8;background:#fff;border-radius:999px;padding:4px 12px;margin:6px 0 0;cursor:pointer;color:#12566f}.or-mic::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:#9fb3c2;margin-right:7px;vertical-align:1px}.or-mic.on{border-color:#a8362b;color:#a8362b}.or-mic.on::before{background:#d33;animation:or-p 1s infinite}@keyframes or-p{50%{opacity:.3}}
.or-chat{max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin:6px 0 10px}.or-m{border-radius:10px;padding:8px 12px;max-width:88%}.or-m b{font-size:12px;color:#587083;display:block}.or-m p{margin:2px 0 0;white-space:pre-wrap}.or-j{background:#eef4f8;align-self:flex-start}.or-c{background:#eaf7f1;align-self:flex-end}
.or-rep textarea{width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px}.or-n{margin:4px 0 0}
.or-tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:10px 0 0}.or-t{display:block;text-decoration:none;color:inherit;border:1px solid #c8d3dc;border-radius:10px;padding:12px 14px;background:#fff}.or-t b{display:block;color:#12566f}.or-t small{color:#587083}.or-t .or-badge{display:inline-block;margin-top:6px;background:#12566f;color:#fff;border-radius:999px;padding:1px 9px;font-size:12px;font-weight:700}.or-t .or-badge.z{background:#9fb3c2}
.or-carte{font-size:18px;font-weight:700;margin:6px 0 10px}.or-th{display:inline-block;font-size:12px;background:#e9eef2;color:#2c4352;border-radius:999px;padding:2px 10px}.or-att2{background:#f4f8fa;border-left:4px solid #2f7d4f;border-radius:8px;padding:10px 14px;margin:10px 0}
.or-axes{display:grid;gap:8px;margin:8px 0}.or-ax{display:grid;grid-template-columns:minmax(120px,240px) 1fr auto;gap:10px;align-items:center;font-size:14px}.or-ax .bar{height:12px;background:#e3eaef;border-radius:6px;overflow:hidden}.or-ax .bar i{display:block;height:100%}.or-ax b{font-variant-numeric:tabular-nums}
.or-parts{display:grid;gap:8px;margin:10px 0}.or-part{border:1px solid #c8d3dc;border-radius:8px;padding:10px 12px;background:#fff}.or-part.on{border-color:#12566f;box-shadow:inset 0 0 0 1px #12566f}.or-part.fait{background:#f4f8fa}.or-part h3{margin:0;font-size:15px}.or-part textarea{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:6px 8px;border:1px solid #c8d3dc;border-radius:6px;margin-top:6px}.or-tps{font-variant-numeric:tabular-nums;font-weight:700}.or-trop{color:#a8362b}
.or-leg{font-size:13px;color:#42596b;display:flex;flex-wrap:wrap;gap:4px 14px;margin:4px 0 0}.or-leg span{display:inline-flex;align-items:center;gap:5px}
.or-voix{display:flex;gap:8px;align-items:center;font-size:14px;color:#42596b;margin:8px 0 0;font-weight:400}
.or-chrono{background:#183047;color:#fff;border-radius:8px;padding:8px 14px;display:flex;gap:12px;align-items:center;justify-content:space-between;margin:12px 0}.or-chrono.on{position:sticky;top:0;z-index:5}
.or-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:20px 0}.or-stats div{background:#fff;padding:12px 16px;border-radius:10px}.or-stats strong{font-size:24px;display:block}.or-chrono b{font-size:20px;font-variant-numeric:tabular-nums}
.or-tab{width:100%;border-collapse:collapse;font-size:14px}.or-tab td{border-bottom:1px solid #dfe7ee;padding:7px 8px;vertical-align:top}.or-tab td.n{text-align:right;white-space:nowrap}.or-tab td.n small{white-space:normal}
.or-al{padding:8px 12px}
@media(max-width:560px){.or-ax{grid-template-columns:1fr auto}.or-ax .bar{grid-column:1/-1;grid-row:2}}`;
    document.head.appendChild(s);
  }
  const tete = (t, sous, eye) => `<a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">${eye || 'Agrégation SII · l’oral'}</div><h1>${t}</h1>${sous ? `<p>${sous}</p>` : ''}`;

  /* ---------- les cartes, en séance de révision ---------- */
  function cartes(deck) {
    css();
    const D = DECKS[deck]; if (!D) { location.hash = '#admission'; return; }
    const now = Date.now(), R = O().cartes;
    const dus = D.cartes.filter((c) => R[c.id] && R[c.id].vu && R[c.id].due <= now).sort((a, b) => R[a.id].box - R[b.id].box);
    const nv = D.cartes.filter((c) => !(R[c.id] && R[c.id].vu));
    const L = dus.concat(nv).slice(0, 10);
    let i = 0, vu = false, bilan = [0, 0, 0];
    const br = {};   // réponses écrites pendant cette séance
    function vue() {
      if (!L.length || i >= L.length) {
        app().innerHTML = tete(D.nom, D.sous) + `<div class="card">${L.length ? `<p><b>Séance terminée :</b> ${bilan[2]} sue${bilan[2] > 1 ? 's' : ''}, ${bilan[1]} à moitié, ${bilan[0]} à revoir.</p><p class="muted">Les cartes ratées reviennent demain, les autres dans 1, 3, 7, 14 puis 30 jours.</p>` : '<p>Rien à réviser aujourd’hui : toutes les cartes sont vues et aucune n’est due. Reviens demain, ou parcours-les toutes ci-dessous.</p>'}
          <div class="btns"><a class="b" href="#admission">Les épreuves d’admission</a>${L.length ? `<button class="b sec" type="button" data-or-encore="1">Une autre séance</button>` : ''}</div></div>${toutes(D)}`;
        app().onclick = (e) => { if (e.target.closest('[data-or-encore]')) cartes(deck); };
        app().oninput = null; app().onchange = null; app().onsubmit = null; return;
      }
      const c = L[i], r = R[c.id];
      app().innerHTML = tete(D.nom, D.sous) + `<div class="prog"><i style="width:${100 * i / L.length}%"></i></div>
        <div class="card"><span class="or-th">${esc(c.th)}</span> <span class="muted">· carte ${i + 1} sur ${L.length}${r && r.vu ? ' · révision' : ' · nouvelle'}</span>
          <p class="or-carte">${esc(c.q)}</p>
          <textarea id="or-r" rows="3" style="width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px" placeholder="Ta réponse, en deux ou trois phrases (facultatif : tu peux aussi répondre de tête)"></textarea>
          ${vu ? `<div class="or-att2"><b>Ce qu’une très bonne réponse contient</b><p style="margin:4px 0 0">${esc(c.a)}</p></div><div id="or-ia"></div>
            <p class="muted" style="margin:8px 0 4px">Comment ça s’est passé ?</p><div class="btns"><button class="b" type="button" data-or-k="2">Je savais</button><button class="b sec" type="button" data-or-k="1">À moitié</button><button class="b sec" type="button" data-or-k="0">À revoir</button>${deck === 'entretien' ? '<button class="b sec" type="button" data-or-ia="1">Faire corriger ma réponse par le jury IA</button>' : ''}</div>`
            : '<div class="btns"><button class="b" type="button" data-or-voir="1">Voir ce que le jury attend</button></div>'}</div>`;
      micros(app());
      const ta = document.getElementById('or-r'); if (ta) { ta.value = br[c.id] || ''; ta.oninput = () => { br[c.id] = ta.value; }; }
    }
    async function corriger() {
      const c = L[i], rep = String(br[c.id] || '').trim(), box = document.getElementById('or-ia');
      if (rep.length < 15) { box.innerHTML = '<p class="hint">Écris d’abord ta réponse, en deux ou trois phrases.</p>'; return; }
      box.innerHTML = '<div class="think">Le jury lit ta réponse…</div>';
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { box.innerHTML = '<p class="hint">L’IA n’est pas disponible pour l’instant.</p>'; return; }
      try {
        const r = await s.json(`Tu es membre du jury de l'agrégation SII, option ingénierie électrique, pendant l'entretien. Question posée au candidat : « ${c.q} ».
Éléments qu'une très bonne réponse contient : ${c.a}
Réponse du candidat : « ${rep.slice(0, 2500)} »
Note sur 2 (pas de 0,5), commentaire de jury en deux phrases au plus (ce qui convainc, ce qui manque), et "mieux" : la réponse reformulée comme une très bonne réponse orale, en trois phrases au plus. Tutoie le candidat. Pas de Markdown.
Réponds en JSON : {"note": 1.5, "commentaire": "…", "mieux": "…"}`, { cache: false, modelTier: 'complex' });
        const v = Number(String(r && r.note).replace(',', '.'));
        box.innerHTML = `<div class="hint" style="margin-top:8px"><b>${isFinite(v) ? fn(Math.max(0, Math.min(2, Math.round(2 * v) / 2))) : '—'} / 2</b> · ${esc(String((r && r.commentaire) || ''))}${r && r.mieux ? `<p style="margin:6px 0 0"><b>Mieux dit :</b> ${esc(String(r.mieux))}</p>` : ''}</div>`;
      } catch (e) { box.innerHTML = `<p class="hint">${esc(erreurIA(e))}</p>`; }
    }
    app().oninput = null; app().onchange = null; app().onsubmit = (e) => e.preventDefault();
    app().onclick = (e) => {
      let b;
      if (e.target.closest('[data-or-voir]')) { vu = true; vue(); return; }
      if ((b = e.target.closest('[data-or-k]'))) { const k = +b.dataset.orK; noter(L[i].id, k); bilan[k]++; i++; vu = false; vue(); window.scrollTo(0, 0); return; }
      if (e.target.closest('[data-or-ia]')) corriger();
    };
    vue();
  }
  function toutes(D) {
    const th = [...new Set(D.cartes.map((c) => c.th))];
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Toutes les cartes</h2><p class="muted" style="margin:0 0 8px">${D.cartes.length} cartes, à lire aussi d’une traite la veille d’un oral.</p>${th.map((t) => `<details class="rl-dos" style="background:#f4f8fa;border-radius:8px;padding:8px 14px;margin:8px 0"><summary style="cursor:pointer;font-weight:700;color:#12566f">${esc(t)} · ${D.cartes.filter((c) => c.th === t).length}</summary><ul>${D.cartes.filter((c) => c.th === t).map((c) => `<li style="margin:8px 0"><b>${esc(c.q)}</b><br>${esc(c.a)}</li>`).join('')}</ul></details>`).join('')}</div>`;
  }

  /* ---------- l'exposé à voix haute ---------- */
  const PARTS = {
    e1: { nom: 'Externe · épreuve 1 (approche globale)', parts: [['Le support et sa problématique', 5], ['La séquence imposée : compétences, trame, démarche', 10], ['Les expérimentations et leurs écarts, réinvestis', 5], ['La séance détaillée, avec un protocole nouveau', 7], ['Évaluation, remédiation et conclusion', 3]], note: 'Exposé de 30 minutes au plus, dont 5 minutes au plus pour présenter le support.' },
    e2: { nom: 'Externe · épreuve 2 (approche spécialisée)', parts: [['Le système et la synthèse des activités', 10], ['La séquence : place, compétences, démarche', 8], ['La séance et le protocole nouveau', 8], ['Évaluation, remédiation et conclusion', 4]], note: 'Exposé de 30 minutes au plus : environ 10 minutes sur le système et la synthèse des activités, environ 20 minutes sur l’exploitation pédagogique.' },
    int: { nom: 'Interne · activité pratique et exploitation pédagogique', parts: [['La démarche et les résultats de la partie pratique', 8], ['La séquence de formation', 10], ['La séance détaillée', 8], ['Évaluation et conclusion', 4]], note: 'Exposé de 30 minutes au plus : la démarche, puis une séquence construite à partir des activités pratiques.' },
    dos: { nom: 'Épreuve sur dossier (dossier industriel ou technique et scientifique)', parts: [['Le support, son authenticité et son actualité', 6], ['Les investigations et développements menés', 12], ['Les évolutions possibles', 4], ['L’exploitation pédagogique', 6], ['Conclusion', 2]], note: 'Présentation de 30 minutes au plus, puis 30 minutes d’entretien.' },
  };
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  let quitter = null;   // ce qu'il faut faire quand on quitte la page de l'exposé (pause, micro coupé)
  function surveiller(f) {
    if (quitter) { window.removeEventListener('hashchange', quitter); window.removeEventListener('pagehide', quitter); }
    quitter = f || null;
    if (f) { window.addEventListener('hashchange', f); window.addEventListener('pagehide', f); }
  }
  function expose(ep) {
    css();
    if (quitter) quitter({ type: 'force' });   // un exposé encore en cours : mis en pause d'abord
    surveiller(null);
    const P = PARTS[ep];
    if (!P) {
      app().innerHTML = tete('Répéter son exposé à voix haute', 'Tu parles partie par partie, au chronomètre ; la reconnaissance vocale transcrit ce que tu dis, puis le jury IA analyse la structure, le rythme et le contenu. Choisis l’épreuve :') + `<div class="or-tuiles">${Object.keys(PARTS).map((k) => `<a class="or-t" href="#admission-expose-${k}"><b>${esc(PARTS[k].nom)}</b><small>${esc(PARTS[k].note)}</small></a>`).join('')}</div>
        ${SR ? '' : '<p class="hint" style="margin-top:14px">Ce navigateur ne propose pas la reconnaissance vocale : tu peux répéter au chronomètre en notant tes idées clés, ou dicter avec le micro du clavier de ton téléphone.</p>'}${histoExposes()}`;
      app().onclick = null; app().oninput = null; app().onchange = null; app().onsubmit = null; return;
    }
    // l'exposé en cours reste dans ce navigateur (la transcription peut être longue) ; seul le résultat suit dans st.oral
    let E = lsGet('or-expose');
    if (!E || E.ep !== ep || !Array.isArray(E.parts) || E.parts.length !== P.parts.length) E = { ep, parts: P.parts.map(() => ({ txt: '', s: 0 })), cur: -1, t0: 0, res: null };
    E.t0 = 0;   // une partie restée en cours (page fermée ou quittée) reprend en pause
    const garder = () => lsSet('or-expose', E);
    garder();
    let voix = null;
    const enCours = () => E.cur >= 0 && !E.res, marche = () => enCours() && !!E.t0;
    const ecoule = () => (marche() ? (Date.now() - E.t0) / 1000 : 0);
    const total = () => E.parts.reduce((a, p) => a + p.s, 0) + ecoule();
    function micro(k) {
      if (!SR) return;
      if (voix) voix.stop();
      let base = '', vu = null;
      const v = ecoute({
        ecrire: (f, t, x) => { if (vu !== x) { vu = x; base = suite(E.parts[k].txt); } E.parts[k].txt = base + f; const ta = location.hash === '#admission-expose-' + ep && document.querySelector(`[data-or-txt="${k}"]`); if (ta) ta.value = base + f + t; },
        encore: () => voix === v && E.cur === k && marche() && location.hash === '#admission-expose-' + ep,
        fin: () => { if (voix === v) voix = null; garder(); },
      });
      voix = v;
    }
    function pause() { if (marche()) { E.parts[E.cur].s += (Date.now() - E.t0) / 1000; E.t0 = 0; } if (voix) { const v = voix; voix = null; v.stop(); } garder(); }
    function reprendre() { E.t0 = Date.now(); garder(); vue(); micro(E.cur); }
    surveiller((ev) => { if (ev.type === 'hashchange' && location.hash === '#admission-expose-' + ep) return; pause(); if (ev.type !== 'pagehide') surveiller(null); });
    function vue() {
      clearInterval(window.__an); window.__an = 0;
      const fin = E.cur === P.parts.length - 1;
      const etat = E.res ? 'Exposé terminé' : marche() ? `Partie ${E.cur + 1} sur ${P.parts.length}` : enCours() ? `En pause · partie ${E.cur + 1} sur ${P.parts.length}` : 'Prêt ?';
      const btns = E.res ? '<button class="b sec" type="button" data-or-raz="1">Recommencer l’exposé</button>'
        : E.cur < 0 ? '<button class="b" type="button" data-or-dep="1">Démarrer l’exposé</button>'
          : `${marche() ? (fin ? '' : '<button class="b" type="button" data-or-suiv="1">Partie suivante</button>') + '<button class="b sec" type="button" data-or-pause="1">Pause</button>' : `<button class="b" type="button" data-or-rep="1">Reprendre la partie ${E.cur + 1}</button>`}<button class="b${marche() && fin ? '' : ' sec'}" type="button" data-or-stop="1">Terminer et faire analyser</button>`;
      app().innerHTML = tete('L’exposé à voix haute', null, esc(P.nom)) + `<p class="muted">${esc(P.note)} ${SR ? 'La transcription démarre avec chaque partie ; tu peux corriger le texte à la main.' : 'Sans reconnaissance vocale ici : note tes idées clés dans chaque partie pendant que tu parles.'}</p>
        <div class="or-chrono${enCours() ? ' on' : ''}"><span>${etat}</span><b id="or-tt">${mmss(total())} / 30:00</b></div>
        <div class="or-parts">${P.parts.map(([t, m], k) => { const p = E.parts[k], on = k === E.cur && !E.res, s = p.s + (on ? ecoule() : 0), trop = s > m * 60 * 1.15; return `<div class="or-part${on ? ' on' : p.s ? ' fait' : ''}"><h3>${k + 1}. ${esc(t)} <span class="muted">· ${m} min conseillées</span></h3><p style="margin:4px 0 0">Temps : <span class="or-tps${trop ? ' or-trop' : ''}" id="or-p${k}">${mmss(s)}</span>${trop ? ' · trop long' : ''}</p>${on || p.txt ? `<textarea rows="${on ? 5 : 3}" data-or-txt="${k}" placeholder="${SR ? 'La transcription s’affiche ici…' : 'Tes idées clés…'}"${E.res ? ' disabled' : ''}>${esc(p.txt)}</textarea>` : ''}</div>`; }).join('')}</div>
        <div class="btns">${btns}</div><p class="or-al hint" hidden></p>
        <div id="or-res">${E.res ? resExpose() : ''}</div>${histoExposes()}`;
      if (marche()) window.__an = setInterval(() => { const a = document.getElementById('or-tt'); if (!a) { clearInterval(window.__an); return; } a.textContent = `${mmss(total())} / 30:00`; const p = document.getElementById('or-p' + E.cur); if (p) p.textContent = mmss(E.parts[E.cur].s + ecoule()); }, 1000);
    }
    function resExpose() {
      const R = E.res, b = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
      return `<div class="card" style="margin-top:14px"><div class="ainote"><strong>${fn(R.note)} / 10</strong><span>Exposé du ${date(R.t)} · ${mmss(R.duree)} au total</span></div>
        <table class="or-tab"><tbody>${P.parts.map(([t, m], k) => { const p = E.parts[k], mots = (p.txt.match(/\S+/g) || []).length, mn = p.s / 60, ppm = mn > 0.2 && mots ? Math.round(mots / mn) : null; return `<tr><td><b>${esc(t)}</b><br>${esc((R.parties[k] || {}).commentaire || '')}</td><td class="n"><b class="${p.s > m * 69 ? 'or-trop' : ''}">${mmss(p.s)}</b> / ${m}:00${ppm ? `<br><small>${ppm} mots/min${ppm > 175 ? ', trop rapide' : ppm < 90 ? ', hésitant' : ''}</small>` : ''}</td></tr>`; }).join('')}</tbody></table>
        <div class="aires">${b('Points forts', R.forts)}${b('À travailler', R.travail)}</div>${R.rythme ? `<p><b>Rythme et clarté :</b> ${esc(R.rythme)}</p>` : ''}<p class="muted">Analyse par une IA d’après les attentes des rapports de jury ; la transcription automatique peut déformer des mots.</p></div>`;
    }
    function alerte(t) { const p = app().querySelector('.or-al'); if (p) { p.textContent = t; p.hidden = false; } }
    async function analyser() {
      const mots = E.parts.reduce((a, p) => a + (p.txt.match(/\S+/g) || []).length, 0);
      if (mots < 25) { alerte('Presque rien n’a été transcrit : parle (ou note tes idées clés) dans chaque partie, puis termine.'); return; }
      const out = document.getElementById('or-res'); out.innerHTML = '<div class="card think" style="margin-top:14px">Le jury écoute ton exposé… (jusqu’à une minute)</div>';
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { out.innerHTML = '<p class="hint">L’analyse par l’IA n’est pas disponible pour l’instant.</p>'; return; }
      const prompt = `Tu es membre du jury de l'agrégation SII, option ingénierie électrique. Le candidat répète l'exposé de l'épreuve « ${P.nom} » (${P.note}). Voici, partie par partie, la durée qu'il a passée et la transcription automatique de ce qu'il a dit (la reconnaissance vocale peut déformer des mots ; ne le pénalise pas pour cela).

${P.parts.map(([t, m], k) => `## ${k + 1}. ${t} (conseillé : ${m} min ; réel : ${mmss(E.parts[k].s)})\n${String(E.parts[k].txt || '').trim().slice(0, 3500) || '(rien de transcrit)'}`).join('\n\n')}

## Consignes
1. "note" sur 10 (pas de 0,5) pour la qualité de l'exposé : structure et annonce du plan, gestion du temps (30 minutes au plus, répartition), clarté, contenu attendu par le jury pour cette épreuve (compétences du référentiel, séance détaillée, protocole nouveau, évaluation, lien avec les mesures).
2. "parties" : pour chaque partie, dans l'ordre, un commentaire d'une ou deux phrases (ce qui manque, ce qui est réussi, durée).
3. "points_forts" : deux ou trois. "a_travailler" : trois ou quatre actions précises. "rythme" : une phrase sur le débit, les répétitions et les phrases trop longues, d'après la transcription et les durées.
4. Tutoie le candidat. Français simple. Pas de Markdown.

Réponds en JSON : {"note": 6, "parties": [{"commentaire": "…"}], "points_forts": ["…"], "a_travailler": ["…"], "rythme": "…"}`;
      try {
        const r = await s.json(prompt.slice(0, 39000), { cache: false, modelTier: 'complex' });
        const v = Number(String(r && r.note).replace(',', '.'));
        if (!r || !isFinite(v)) throw new Error('réponse vide');
        const duree = E.parts.reduce((a, p) => a + p.s, 0);
        E.res = { t: Date.now(), note: Math.max(0, Math.min(10, Math.round(2 * v) / 2)), parties: (Array.isArray(r.parties) ? r.parties : []).map((x) => ({ commentaire: String((x && x.commentaire) || (typeof x === 'string' ? x : '')) })), forts: liste(r.points_forts, 3), travail: liste(r.a_travailler, 4), rythme: String(r.rythme || ''), duree };
        O().exposes = O().exposes.concat([{ t: E.res.t, ep, note: E.res.note, duree: Math.round(duree) }]).slice(-40);
        garder(); save(); vue(); const o = document.getElementById('or-res'); if (o) o.scrollIntoView({ behavior: 'smooth' });
      } catch (e) { out.innerHTML = `<p class="hint">${esc(erreurIA(e))}</p>`; }
    }
    app().oninput = (e) => { const k = e.target.dataset && e.target.dataset.orTxt; if (k != null && E.parts[+k]) { E.parts[+k].txt = e.target.value; garder(); } };
    app().onchange = null; app().onsubmit = (e) => e.preventDefault();
    app().onclick = (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-or-dep]')) { E.cur = 0; reprendre(); return; }
      if (t('[data-or-suiv]')) { pause(); E.cur++; reprendre(); window.scrollTo(0, 0); return; }
      if (t('[data-or-pause]')) { pause(); vue(); return; }
      if (t('[data-or-rep]')) { reprendre(); return; }
      if (t('[data-or-stop]')) { pause(); vue(); analyser(); return; }
      if (t('[data-or-raz]')) { pause(); surveiller(null); lsSet('or-expose', null); expose(ep); }
    };
    vue();
  }
  function histoExposes() {
    const H = O().exposes.slice(-6).reverse();
    return H.length ? `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Tes derniers exposés</h2><table class="or-tab"><tbody>${H.map((x) => `<tr><td>${esc(date(x.t))} · ${esc((PARTS[x.ep] || {}).nom || '')}</td><td class="n"><b>${fn(x.note)} / 10</b> · ${mmss(x.duree || 0)}</td></tr>`).join('')}</tbody></table></div>` : '';
  }

  /* ---------- le tableau de bord ---------- */
  const AXES = [['obj', 'Objectif de l’activité', ['obj'], ['obj']], ['proto', 'Protocole, appareils, sécurité', ['proto'], ['proto']], ['mes', 'Conduite des mesures', ['mes'], ['mes']], ['exp', 'Exploitation et modèle', ['exp', 'mod'], ['exp']], ['ecart', 'Écarts, causes et solutions', ['ecart', 'crit'], ['ecart']], ['seance', 'Transposition : la séance', ['seance'], ['seance']]];
  const MAXR = { obj: 1, proto: 2, mes: 2, exp: 2, ecart: 2, seance: 1 };
  function donnees() {
    const tp = (typeof st === 'object' && st.tp) || {}, reel = (st && st.reel) || {}, BT = (window.ADMISSION_TP && ADMISSION_TP.BANCS) || {}, BR = (window.ADMISSION_REEL && ADMISSION_REEL.BANCS) || {};
    const ax = {}; AXES.forEach(([k]) => { ax[k] = { j: 0, t: 0 }; });
    const pts = [];   // pour la frise : [t, note sur 10, série]
    const bancs = [];
    Object.keys(tp).forEach((id) => {
      const x = tp[id]; if (!x || typeof x !== 'object') return;
      (x.essais || []).forEach((e) => { if (ok(e.note)) pts.push([e.t, e.note / 2, 0]); });
      if (x.comp) AXES.forEach(([k, , cs]) => cs.forEach((c) => { const v = x.comp[c]; if (Array.isArray(v) && v[1] > 0) { ax[k].j += v[0] / v[1]; ax[k].t += 1; } }));
      bancs.push({ nom: (BT[id] || {}).titre || id, type: 'simulé', note: ok(x.last) ? x.last / 2 : null, n: (x.essais || []).length, go: '#admission-tp-' + id });
    });
    Object.keys(reel).forEach((id) => {
      const x = reel[id]; if (!x || typeof x !== 'object') return;
      (x.hist || []).forEach((h) => { if (ok(h.note)) pts.push([h.t, h.note, 1]); });
      const ev = x.ev;
      if (ev && ev.criteres) AXES.forEach(([k, , , cr]) => cr.forEach((c) => { const v = ev.criteres[c]; if (v && ok(v.note)) { ax[k].j += v.note / MAXR[c]; ax[k].t += 1; } }));
      if (ev || (x.hist || []).length) bancs.push({ nom: (BR[id] || {}).titre || id, type: 'réel', note: ev ? ev.note : null, n: (x.hist || []).length, go: '#admission-reel-' + id });
    });
    (Array.isArray(st.adm) ? st.adm : []).forEach((a) => { if (ok(a.note)) pts.push([a.t, a.note, 2]); });
    O().exposes.forEach((x) => pts.push([x.t, x.note, 3]));
    O().entretiens.forEach((x) => pts.push([x.t, x.note, 4]));
    (Array.isArray(st.adm) ? st.adm : []).forEach((a) => { if (ok(a.ent)) pts.push([a.t + 1, a.ent * 10 / 6, 4]); });
    return { ax, pts: pts.filter((p) => ok(p[0]) && ok(p[1])).sort((a, b) => a[0] - b[0]), bancs };
  }
  // dans l'ordre des séries de donnees() : 0 bancs simulés, 1 bancs du labo, 2 leçons, 3 exposés, 4 entretiens
  const SERIES = [['bancs simulés (note sur 20 ramenée sur 10)', '#12566f'], ['bancs du labo', '#2f7d4f'], ['leçons', '#9c5221'], ['exposés', '#7a4fa3'], ['entretiens', '#a8362b']];
  function frise(P) {
    if (P.length < 2) return '<p class="muted">La courbe apparaît après deux activités notées.</p>';
    const W = 640, H = 240, m = { l: 44, r: 18, t: 12, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const t0 = P[0][0], t1 = Math.max(P[P.length - 1][0], t0 + DAY), X = (t) => m.l + (t - t0) / (t1 - t0) * pw, Y = (v) => m.t + (1 - v / 10) * ph;
    let s = `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="#fff" stroke="#9fb3c2"/>`;
    for (let v = 0; v <= 10; v += 2) s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${v === 8 ? '#2f7d4f' : '#e3eaef'}"${v === 8 ? ' stroke-dasharray="6 4"' : ''}/><text x="${m.l - 6}" y="${(Y(v) + 4).toFixed(1)}" font-size="12" text-anchor="end" fill="#42596b">${v}</text>`;
    s += `<text x="${m.l + pw - 4}" y="${(Y(8) - 5).toFixed(1)}" font-size="12" text-anchor="end" fill="#2f7d4f" font-weight="700">objectif 16 / 20</text>`;
    s += `<text x="${m.l}" y="${H - 8}" font-size="12" fill="#42596b">${esc(date(t0))}</text><text x="${m.l + pw}" y="${H - 8}" font-size="12" fill="#42596b" text-anchor="end">${esc(date(t1))}</text>`;
    const dx = (k) => (k - 2) * 4;   // un léger décalage par série : deux notes du même jour restent visibles
    SERIES.forEach(([, c], k) => { const L = P.filter((p) => p[2] === k); if (L.length > 1) s += `<path d="${L.map((p, i) => `${i ? 'L' : 'M'}${(X(p[0]) + dx(k)).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('')}" fill="none" stroke="${c}" stroke-width="1.6" stroke-opacity=".55"/>`; L.forEach((p) => { s += `<circle cx="${(X(p[0]) + dx(k)).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="4.5" fill="${c}" stroke="#fff" stroke-width="1.2"/>`; }); });
    const leg = SERIES.filter((_, k) => P.some((p) => p[2] === k)).map(([n, c]) => `<span><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="${c}"/></svg>${esc(n)}</span>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="tes notes dans le temps, sur 10" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">${s}</svg><p class="or-leg">${leg}</p>`;
  }
  function bilan() {
    css();
    const D = donnees(), A = AXES.map(([k, l]) => [k, l, D.ax[k].t ? D.ax[k].j / D.ax[k].t : null]).filter((a) => a[2] != null);
    const faible = A.slice().sort((a, b) => a[2] - b[2])[0];
    const CONSEIL = { obj: ['Écris l’objectif avant tout : quelle performance, mesurée comment, comparée à quoi.', '#admission-reel-pompe'], proto: ['Rédige un protocole complet et fais-le relire par le jury IA avant de mesurer.', '#admission-reel-harmo'], mes: ['Entraîne-toi aux appareils : oscilloscope (déclenchement, sondes) et analyseur.', '#admission-tp-oscillo'], exp: ['Exploite tout : grandeurs calculées, courbes, point remarquable, réponse chiffrée.', '#admission-tp-pompe'], ecart: ['Quantifie chaque écart, compare-le à la dispersion, puis une cause et une solution.', '#admission-reel-portique'], seance: ['Construis une séance avec un protocole différent du tien, et passe une leçon.', '#admission-lecon-e2'] };
    const moy = (L) => (L.length ? L.reduce((a, b) => a + b, 0) / L.length : null);
    const der = (k) => D.pts.filter((p) => p[2] === k).slice(-3).map((p) => p[1]);
    const stat = (k) => { const m = moy(der(k)); return m == null ? '—' : fn(Math.round(m * 2) / 2) + ' / 10'; };
    app().innerHTML = tete('Tableau de bord de l’oral', 'Ce que le jury regarde, critère par critère, sur tous tes bancs (simulés et réels), et tes notes de leçon, d’exposé et d’entretien.') + `
      <div class="or-stats"><div><strong>${stat(0)}</strong>bancs simulés</div><div><strong>${stat(1)}</strong>bancs du labo</div><div><strong>${stat(2)}</strong>leçons</div><div><strong>${stat(3)}</strong>exposés</div><div><strong>${stat(4)}</strong>entretiens</div></div><p class="muted" style="margin:-10px 0 0">Moyenne de tes trois dernières notes de chaque sorte, sur 10.</p>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">La partie pratique, critère par critère</h2>${A.length ? `<p class="muted" style="margin:0 0 6px">Part des points obtenus sur chaque critère du jury, tous bancs confondus (dernier essai de chaque banc).</p><div class="or-axes">${A.map(([k, l, v]) => `<div class="or-ax"><span>${esc(l)}</span><div class="bar"><i style="width:${Math.round(100 * v)}%;background:${v >= 0.8 ? '#2f7d4f' : v >= 0.5 ? '#c26a1b' : '#a8362b'}"></i></div><b>${Math.round(100 * v)} %</b></div>`).join('')}</div>${faible ? `<div class="hint" style="margin-top:10px"><b>Là où tu perds le plus : ${esc(faible[1])}.</b> ${esc(CONSEIL[faible[0]][0])} <a href="${CONSEIL[faible[0]][1]}">Y aller</a></div>` : ''}` : '<p class="muted">Rien encore : passe un banc simulé ou fais évaluer une fiche d’un banc du labo.</p>'}</div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Tes notes dans le temps, sur 10</h2>${frise(D.pts)}</div>
      ${D.bancs.length ? `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Tes bancs</h2><table class="or-tab"><tbody>${D.bancs.map((b) => `<tr><td><a href="${b.go}">${esc(b.nom)}</a><br><span class="muted">banc ${b.type} · ${b.n} essai${b.n > 1 ? 's' : ''}</span></td><td class="n"><b>${b.note == null ? '—' : fn(Math.round(2 * b.note) / 2) + ' / 10'}</b></td></tr>`).join('')}</tbody></table></div>` : ''}
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Les cartes</h2><table class="or-tab"><tbody>${Object.keys(DECKS).map((d) => `<tr><td><a href="#admission-cartes-${d}">${esc(DECKS[d].nom)}</a></td><td style="text-align:right">${sues(d)} acquise${sues(d) > 1 ? 's' : ''} sur ${DECKS[d].cartes.length} · <b>${dues(d)}</b> à réviser · ${neuves(d)} nouvelle${neuves(d) > 1 ? 's' : ''}</td></tr>`).join('')}</tbody></table></div>`;
    app().onclick = null; app().oninput = null; app().onchange = null;
  }

  /* ---------- la carte de l'accueil des épreuves d'admission ---------- */
  function carte() {
    css();
    const badge = (d) => { const n = dues(d), nv = neuves(d); return n ? `<span class="or-badge">${n} à réviser</span>` : nv ? `<span class="or-badge z">${nv} nouvelle${nv > 1 ? 's' : ''}</span>` : '<span class="or-badge z">à jour</span>'; };
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">L’oral et ton suivi</h2><p class="muted" style="margin:0">Tes progrès critère par critère, l’exposé répété à voix haute, et chaque jour quelques cartes : les questions des jurys et la sécurité électrique.</p>
      <div class="or-tuiles"><a class="or-t" href="#admission-bilan"><b>Tableau de bord</b><small>Critères du jury sur tous tes bancs, notes de leçon, d’exposé et d’entretien.</small></a>
      <a class="or-t" href="#admission-expose"><b>Répéter mon exposé</b><small>Partie par partie, au chronomètre, transcrit à la voix puis analysé.</small></a>
      <a class="or-t" href="#admission-cartes-entretien"><b>Cartes d’entretien</b><small>${ENT.length} questions de jury, avec ce qu’une très bonne réponse contient.</small><br>${badge('entretien')}</a>
      <a class="or-t" href="#admission-cartes-securite"><b>La sécurité en 10 minutes</b><small>${SECU.length} cartes : consignation, habilitations, mesure, protections.</small><br>${badge('securite')}</a></div></div>`;
  }

  const gere = (h) => /^admission-(bilan|expose(-[a-z0-9]+)?|cartes-(entretien|securite))$/.test(h);
  function route(h) {
    css();
    if (h === 'admission-bilan') return bilan();
    const m = /^admission-expose(?:-([a-z0-9]+))?$/.exec(h); if (m) return expose(m[1]);
    const c = /^admission-cartes-(entretien|securite)$/.exec(h); if (c) return cartes(c[1]);
    location.hash = '#admission';
  }
  window.ADMISSION_ORAL = { route, gere, carte, entretien, micros, dictee, dues: () => dues('entretien') + dues('securite'), DECKS, css };
})();
