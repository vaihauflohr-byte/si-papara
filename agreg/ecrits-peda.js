/* =====================================================================
   SI Papara — agrégation : la partie pédagogique de l'épreuve 1 de l'interne (#ecrits-peda)
   Les sept types de questions des sujets récents (interne 2025 et 2026) : prompts pour une IA, fiche connaissances,
   protocole expérimental, indicateurs d'évaluation, modèle multiphysique, évaluation sommative, séquence.
   Chaque exercice tire un support (systèmes des sujets et bancs du labo) et un niveau, se rédige au clavier ou sur papier
   (une photo), puis le jury IA note sur 20 avec une grille tirée des rapports, rédige une copie modèle pour ce support
   et dit ce qui manque. La mémoire du jury (agreg/jury.js) s'ajoute à la demande.
   Progression : st.ec.peda (essais datés). Utilise les globales de agreg/index.html (st, save, app, esc, getSample, HOOK, AIERR).
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const br = (t) => E(t).replace(/\n/g, '<br>');
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 1 : d }));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.peda)) st.ec.peda = []; return st.ec; };
  const errIA = (e) => { const c = e && e.code; const m = (typeof HOOK !== 'undefined' && HOOK && HOOK.err && HOOK.err(c)) ?? (typeof AIERR === 'function' ? AIERR(c) : ''); return m || 'L’IA n’a pas répondu. Réessaie dans un moment.'; };

  // les supports : systèmes des sujets récents et bancs du labo
  const SUPPORTS = [
    { id: 'lune', nom: 'LuneXplorer, centrifugeuse de la Cité de l’espace', txt: 'Plateau de 10 cabines tournant autour d’un axe vertical, passagers à R = 6,8 m, accélération ressentie jusqu’à 3g, 6 motoréducteurs asynchrones, variateur, accéléromètre de contrôle.', phys: 'accélération normale R·ω², couple et inertie, puissance de mise en rotation, mesure d’accélération' },
    { id: 'metha', nom: 'Unité de méthanisation de Val de Briey', txt: 'Digesteurs cylindriques maintenus à 40 °C par une chaudière au biogaz, bâche de couverture, agitateurs électriques, ajout possible d’un isolant en partie haute.', phys: 'flux thermique, résistances thermiques, énergie de chauffage, rendement, agitation' },
    { id: 'hydro', nom: 'Centrale hydroélectrique au fil de l’eau', txt: 'Turbine Kaplan entraînant un alternateur, débit et hauteur de chute variables, régulation de vitesse, injection sur le réseau.', phys: 'puissance hydraulique ρ·g·Q·H, rendements, alternateur, régulation' },
    { id: 'borne', nom: 'Borne de recharge rapide pour véhicule électrique', txt: 'Redresseur et hacheur pilotés, puissance de 50 à 150 kW, communication avec le véhicule, gestion de la charge de la batterie.', phys: 'puissance et énergie, temps de charge, conversion AC/DC, état de charge' },
    { id: 'dirig', nom: 'Dirigeable LCA60T de Flying Whales', txt: 'Aéronef gonflé à l’hélium, 12 propulseurs électriques alimentés par des turbo-générateurs, stabilisation de position par asservissement.', phys: 'poussée d’Archimède, traînée, puissance de propulsion, asservissement' },
    { id: 'forge', nom: 'Forge à induction', txt: 'Inducteur résonant alimenté par un onduleur, chauffage d’une billette d’acier de 20 °C à 200 °C en 10 s, mesure du courant et de la température.', phys: 'énergie thermique m·c·ΔT, résonance RLC, mesure de courant, capteur I²C' },
    { id: 'volet', nom: 'Volet roulant solaire', txt: 'Volet motorisé autonome : panneau photovoltaïque, batterie, motoréducteur à courant continu, commande par télécommande radio.', phys: 'bilan énergétique, autonomie, couple du moteur, transmission radio' },
    { id: 'pompe', nom: 'Station de pompage du labo (Deltalab)', txt: 'Pompe centrifuge entraînée par un moteur asynchrone et un variateur, capteurs de pression, débitmètre, wattmètre.', phys: 'hauteur manométrique, puissance hydraulique, rendement, lois de similitude' },
    { id: 'monte', nom: 'Monte-charge du labo', txt: 'Cabine et contrepoids, moteur asynchrone piloté par un variateur ATV31 et un automate, codeur, rampes d’accélération.', phys: 'énergie potentielle, puissance, rendement, rampes et dépassement à l’arrêt' },
    { id: 'vae', nom: 'Vélo à assistance électrique', txt: 'Moteur-roue sans balais de 250 W, batterie de 36 V, capteur de couple au pédalier, assistance limitée à 25 km/h.', phys: 'couple, puissance, autonomie, capteur de couple' }
  ];
  const NIVEAUX = [
    { id: '1si', nom: 'Première, spécialité sciences de l’ingénieur' },
    { id: 'tsi', nom: 'Terminale, spécialité sciences de l’ingénieur' },
    { id: 'sti', nom: 'Terminale STI2D, enseignement de spécialité ingénierie, innovation et développement durable' },
    { id: 'bts', nom: 'BTS électrotechnique, première année' }
  ];
  // les sept types de questions, avec la grille et ce que le jury a écrit
  const TYPES = [
    { id: 'prompt', nom: 'Prompts pour une IA', min: 15, src: 'interne 2025, question 31',
      consigne: (s, n) => `Une IA a produit une fiche connaissances de niveau ${n.nom} sur les grandeurs d’effort et de flux, l’énergie et la puissance, à partir du support « ${s.nom} ». Rédige un ou deux prompts pour lui faire ajouter l’analogie des grandeurs et détailler les relations utiles au support (${s.phys}), sur une page A4.`,
      jury: ['Certains candidats ont seulement reformulé la question 31 : un prompt doit être exploitable tel quel (interne 2025).', 'Préciser le rôle, le niveau, le contenu attendu, la forme et demander une vérification.'],
      grille: [['contexte', 'Rôle, niveau et programme précisés', 4], ['contenu', 'Contenu demandé précis et complet (notions, relations, unités, exemple lié au support)', 6], ['forme', 'Contraintes de forme (une page, structure, encadrés, schémas)', 4], ['verif', 'Vérification demandée (exactitude, unités, erreurs fréquentes), itération', 3], ['usage', 'Prompts directement utilisables, sans reformuler la question', 3]] },
    { id: 'fiche', nom: 'Fiche connaissances', min: 25, src: 'interne 2025, question 32',
      consigne: (s, n) => `Rédige la fiche « connaissances » d’une page A4 distribuée aux élèves (${n.nom}) lors de la phase de structuration des connaissances d’une séquence sur le support « ${s.nom} » (${s.phys}).`,
      jury: ['Recopier les définitions d’une IA a été pénalisé : la fiche est corrigée, structurée et au niveau visé (interne 2025).', 'Une fiche qui tient sur une page, avec un exemple chiffré lié au support.'],
      grille: [['exact', 'Exactitude scientifique, relations et unités justes', 6], ['niveau', 'Adaptée au niveau et au programme', 4], ['structure', 'Structure (titres, progression, encadré « à retenir »)', 4], ['support', 'Exemple chiffré lié au support', 3], ['concis', 'Schémas annoncés, concision (une page)', 3]] },
    { id: 'protocole', nom: 'Protocole expérimental', min: 20, src: 'interne 2025, question 33 ; interne 2026, question 34',
      consigne: (s, n) => `Pour des élèves de ${n.nom}, définis un protocole expérimental sur une maquette ou un banc inspiré du support « ${s.nom} » (${s.phys}), qui permette de vérifier une hypothèse de ton choix : problématique, hypothèse, paramètres variables, contrôlés et observés, matériel, schéma du dispositif, mode opératoire, traitement des résultats, sécurité.`,
      jury: ['Au moins 50 % des candidats ont proposé un protocole (interne 2025) ; le corrigé 2026 attend une hypothèse, une vingtaine de points de mesure en régime établi, la variation d’un paramètre et une courbe à exploiter.', 'Paramètres variables, contrôlés et observés distingués ; nombre d’essais et régime établi précisés.'],
      grille: [['hypo', 'Problématique et hypothèse explicites', 3], ['param', 'Paramètres variables, contrôlés et observés bien identifiés', 4], ['materiel', 'Matériel et schéma du dispositif (capteurs, grandeurs, branchements)', 3], ['mode', 'Mode opératoire précis et reproductible (étapes, nombre d’essais, régime établi)', 4], ['traitement', 'Traitement des résultats (courbe, comparaison au modèle, écarts)', 3], ['secu', 'Sécurité', 3]] },
    { id: 'indic', nom: 'Indicateurs d’évaluation', min: 15, src: 'interne 2025, question 34 ; interne 2026, question 17',
      consigne: (s, n) => `Propose des indicateurs d’évaluation et des niveaux d’appréciation pour mesurer le degré d’acquisition, par des élèves de ${n.nom}, des compétences « conduire des essais en toute sécurité », « identifier les erreurs de mesure » et « rendre compte de résultats », lors d’une activité expérimentale sur le support « ${s.nom} ».`,
      jury: ['Moins de 40 % des candidats ont proposé des indicateurs (interne 2025).', 'Des indicateurs observables et des niveaux d’appréciation gradués sont attendus (interne 2026).'],
      grille: [['observ', 'Indicateurs observables et vérifiables (verbes d’action, pas « comprend »)', 6], ['couv', 'Toutes les compétences visées couvertes', 4], ['niveaux', 'Niveaux d’appréciation gradués et décrits', 5], ['lien', 'Liés à l’activité, critères de réussite explicites', 3], ['usage', 'Grille utilisable en classe', 2]] },
    { id: 'multi', nom: 'Modèle multiphysique', min: 15, src: 'interne 2025, question 35',
      consigne: (s, n) => `En listant les paramètres, propose un modèle multiphysique d’une expérimentation sur le support « ${s.nom} » (${s.phys}) et une méthodologie pour le valider puis l’extrapoler au système réel.`,
      jury: ['Moins de 20 % des candidats ont répondu (interne 2025) : paramètres variables, contrôlés et observés, puis recalage sur l’expérience, validation et simulation du système réel.'],
      grille: [['param', 'Paramètres variables, contrôlés et observés corrects', 6], ['struct', 'Structure du modèle (domaines physiques, blocs, liens effort et flux)', 5], ['recal', 'Recalage des paramètres sur l’expérience', 4], ['valid', 'Validation sur un autre essai, écarts, puis extrapolation au réel', 5]] },
    { id: 'evalsom', nom: 'Évaluation sommative', min: 25, src: 'interne 2026, question 16',
      consigne: (s, n) => `Rédige la fiche descriptive d’une évaluation sommative d’une heure pour des élèves de ${n.nom}, sur le support « ${s.nom} », évaluant la compétence « déterminer la grandeur effort (force ou couple) lorsque le mouvement souhaité est imposé » : mise en situation, hypothèses, données, questions, barème.`,
      jury: ['Le corrigé 2026 ne publie pas de réponse : le jury attend une évaluation complète, cohérente avec la compétence et les connaissances visées.'],
      grille: [['situation', 'Mise en situation et problématique', 3], ['donnees', 'Hypothèses et données suffisantes et cohérentes', 4], ['questions', 'Questions progressives alignées sur la compétence', 6], ['duree', 'Durée réaliste et barème', 3], ['exact', 'Exactitude scientifique (résultat attendu cohérent avec le support)', 4]] },
    { id: 'sequence', nom: 'Séquence pédagogique', min: 25, src: 'épreuve 1 de l’interne, sujets récents',
      consigne: (s, n) => `Propose une séquence pédagogique pour des élèves de ${n.nom} à partir du support « ${s.nom} » (${s.phys}) : problématique, objectifs et compétences du programme, prérequis, déroulé des séances avec leurs activités, synthèse et évaluation.`,
      jury: ['La partie pédagogique est déterminante : plus de 60 % de réussite chez ceux qui la traitent (interne 2025).', 'Une séquence réaliste : durées, effectifs, matériel, activités variées, évaluation prévue.'],
      grille: [['objectifs', 'Problématique, objectifs et compétences du programme ciblés', 4], ['progression', 'Progression des séances (situation, activités, synthèse)', 5], ['activites', 'Activités variées et supports adaptés', 4], ['eval', 'Évaluation prévue (formative et sommative)', 4], ['realisme', 'Réalisme (durées, effectifs, matériel)', 3]] }
  ];
  const tirage = (n, k) => (n * 7 + k * 3) % SUPPORTS.length;

  function moyenne(type) {
    const L = S().peda.filter((x) => x.type === type && isFinite(x.note)).slice(-3);
    return L.length ? L.reduce((a, x) => a + x.note, 0) / L.length : null;
  }
  // la carte sur l'accueil des écrits
  function carte() {
    const n = S().peda.length, m = n ? S().peda.slice(-5).reduce((a, x) => a + (x.note || 0), 0) / Math.min(5, n) : null;
    return `<div class="ec-ep" style="--c:#4a5fa8"><div class="eyebrow">Interne · épreuve 1 · partie pédagogique</div><h3>S’entraîner à la partie pédagogique</h3><p class="muted">Les sept types de questions des sujets 2025 et 2026 : prompts pour une IA, fiche connaissances, protocole, indicateurs, modèle multiphysique, évaluation sommative, séquence. Un support et un niveau tirés au sort, ta réponse notée sur 20 par le jury IA avec une grille tirée des rapports, et une copie modèle.${n ? ` ${n} essai${n > 1 ? 's' : ''}, moyenne récente ${nf(m)}/20.` : ''}</p><div class="btns"><a class="b" href="#ecrits-peda">Commencer</a></div></div>`;
  }
  function accueil() {
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Interne · épreuve 1 · coefficient 2</div><h1>La partie pédagogique</h1>
    <p class="muted">Dans l’épreuve 1 de l’interne, l’exploitation pédagogique est « déterminante » selon le rapport 2025 : ceux qui la traitent réussissent bien, mais beaucoup la bâclent ou recopient une IA. Choisis un type de question : un support et un niveau sont tirés au sort, tu rédiges au clavier ou sur papier, puis le jury IA note avec sa grille.</p><div class="ec-grid">`;
    TYPES.forEach((T) => {
      const m = moyenne(T.id), n = S().peda.filter((x) => x.type === T.id).length;
      h += `<div class="ec-ep" style="--c:#4a5fa8"><div class="eyebrow">${E(T.src)} · ${T.min} min</div><h3>${E(T.nom)}</h3><p class="muted">${E(T.jury[0])}</p><p class="muted">${n ? `${n} essai${n > 1 ? 's' : ''} · moyenne des trois derniers ${nf(m)}/20` : 'Pas encore d’essai.'}</p><div class="btns"><a class="b" href="#ecrits-peda-${T.id}-${Math.floor(Math.random() * 1000)}">S’entraîner</a></div></div>`;
    });
    h += '</div>';
    const L = S().peda.slice(-8).reverse();
    if (L.length) h += `<h2 class="sec">Mes derniers essais</h2><div class="ec-sc"><table class="ec-tab"><tr><th>Date</th><th>Type</th><th>Support</th><th>Note</th></tr>${L.map((x) => { const T = TYPES.find((y) => y.id === x.type), s = SUPPORTS.find((y) => y.id === x.sup); return `<tr><td>${new Date(x.t).toLocaleDateString('fr-FR')}</td><td>${E(T ? T.nom : x.type)}</td><td>${E(s ? s.nom : '')}</td><td class="n">${nf(x.note)} / 20</td></tr>`; }).join('')}</table></div>`;
    app().innerHTML = h;
  }
  function exercice(id, graine) {
    const T = TYPES.find((x) => x.id === id); if (!T) return accueil();
    const g = Math.abs(+graine || 0), s = SUPPORTS[tirage(g, TYPES.indexOf(T))], n = NIVEAUX[g % NIVEAUX.length];
    const cle = `${id}-${g}`, brouillon = (() => { try { return localStorage.getItem('agreg-peda-' + cle) || ''; } catch (e) { return ''; } })();
    let fichier = null, fin = 0, tm = 0;
    app().innerHTML = `<a class="back" href="#ecrits-peda">← La partie pédagogique</a><div class="eyebrow">Interne · épreuve 1 · ${E(T.src)}</div><h1>${E(T.nom)}</h1>
      <div class="card"><p><b>Support :</b> ${E(s.nom)}. ${E(s.txt)}</p><p><b>Niveau :</b> ${E(n.nom)}.</p><p><b>Consigne :</b> ${E(T.consigne(s, n))}</p>
      <div class="btns" style="align-items:center"><span class="ec-clock" id="pd-cl" style="font-size:28px;padding:8px 14px">${T.min}:00</span><button class="b sec" id="pd-go">Lancer ${T.min} minutes</button><a class="b sec" href="#ecrits-peda-${id}-${g + 1}">Autre support</a></div></div>
      <div class="jury"><b>Ce que le jury a écrit</b>${T.jury.map((j) => `<p>• ${E(j)}</p>`).join('')}</div>
      <details class="keep"><summary>La grille du jury (sur 20)</summary><ul>${T.grille.map(([, l, p]) => `<li>${E(l)} : ${p} pt</li>`).join('')}</ul></details>
      <h2 class="sec">Ta réponse</h2><textarea id="pd-rep" rows="14" placeholder="Rédige ici, ou joins la photo de ta réponse sur papier.">${E(brouillon)}</textarea>
      <div class="btns" style="margin-top:10px"><label class="b sec filebtn">Joindre une photo<input type="file" accept="image/*" hidden id="pd-photo"></label><span id="pd-ph" class="muted"></span><button class="b" id="pd-eval">Faire noter par le jury IA</button></div>
      <div id="pd-res"></div>`;
    $('#pd-rep').oninput = (e) => { try { localStorage.setItem('agreg-peda-' + cle, e.target.value.slice(0, 20000)); } catch (x) { /* stockage indisponible */ } };
    $('#pd-photo').onchange = (e) => { fichier = e.target.files[0] || null; $('#pd-ph').textContent = fichier ? 'Photo jointe : ' + fichier.name : ''; };
    $('#pd-go').onclick = () => {
      fin = Date.now() + T.min * 60e3; $('#pd-go').disabled = true;
      const tic = () => { const r = Math.max(0, (fin - Date.now()) / 1000), el = $('#pd-cl'); if (!el) { clearInterval(tm); return; } el.textContent = `${Math.floor(r / 60)}:${String(Math.floor(r % 60)).padStart(2, '0')}`; if (r <= 0) { el.classList.add('fin'); clearInterval(tm); } };
      tm = setInterval(tic, 500); window.__an = tm; tic();
    };
    $('#pd-eval').onclick = () => evaluer(T, s, n, $('#pd-rep').value.trim(), fichier, cle);
  }
  function prompt(T, s, n, txt, photo) {
    return `Tu es membre du jury de l'agrégation interne SII, option ingénierie électrique. Tu évalues la réponse d'un candidat à une question de la partie pédagogique de l'épreuve 1 (analyse et exploitation pédagogique d'un système pluritechnologique, coefficient 2).
Type de question : ${T.nom} (${T.src}).
Support : ${s.nom}. ${s.txt}
Niveau visé : ${n.nom}.
Consigne donnée au candidat : ${T.consigne(s, n)}
Ce que le jury a écrit sur ce type de question :
${T.jury.map((j) => '- ' + j).join('\n')}
Grille de notation (sur 20) :
${T.grille.map(([k, l, p]) => `- ${k} : ${l} (${p} points)`).join('\n')}

Réponse du candidat :
${txt ? '<<<\n' + txt.slice(0, 12000) + '\n>>>' : '(aucun texte tapé)'}${photo ? '\nSa réponse manuscrite est sur l’image jointe : transcris-la fidèlement avant de l’évaluer.' : ''}

Consignes :
1. Pour chaque critère de la grille, une note entre 0 et son maximum (pas de 0,5) et un commentaire d'une ou deux phrases qui cite ce qui manque ou ce qui est faux. Sois aussi exigeant que le jury : une réponse vague, une reformulation de la consigne ou un texte générique sans lien avec le support et le niveau ne valent presque rien.
2. Vérifie l'exactitude scientifique, l'adéquation au niveau et au programme officiel, le réalisme en classe.
3. "modele" : la réponse que tu attendrais d'un très bon candidat pour ce support et ce niveau, rédigée et concrète, en 25 lignes au plus.
4. "points_forts" (au plus trois), "a_travailler" (au plus trois, concrets).${photo ? '\n5. "transcription" : la transcription de la réponse manuscrite.' : ''}
Tutoie le candidat. Français simple, sans Markdown.
Réponds en JSON : {"criteres": [{"id": "${T.grille[0][0]}", "note": 2, "commentaire": "…"}], "modele": "…", "points_forts": ["…"], "a_travailler": ["…"]${photo ? ', "transcription": "…"' : ''}}`;
  }
  async function evaluer(T, s, n, txt, photo, cle) {
    const box = $('#pd-res');
    if (!txt && !photo) { box.innerHTML = '<p class="hint">Rédige ta réponse ou joins une photo.</p>'; return; }
    let sm = null; try { sm = await getSample(); } catch (e) { sm = null; }
    if (!sm) { box.innerHTML = '<p class="hint">L’IA n’est pas disponible pour l’instant : relis ta réponse avec la grille du jury ci-dessus.</p>'; return; }
    $('#pd-eval').disabled = true; box.innerHTML = '<div class="think">Le jury lit ta réponse… (une à deux minutes)</div>';
    try {
      const o = { cache: false, modelTier: 'complex' }; if (photo) o.images = [photo];
      const r = await sm.json(prompt(T, s, n, txt, photo), o);
      const C = T.grille.map(([k, l, p]) => { const y = (Array.isArray(r && r.criteres) ? r.criteres : []).find((z) => z && z.id === k) || {}; return { k, l, p, note: Math.max(0, Math.min(p, Math.round(2 * (+y.note || 0)) / 2)), c: String(y.commentaire || '').trim().slice(0, 400) }; });
      const note = C.reduce((a, x) => a + x.note, 0);
      const L = (v, k) => (Array.isArray(v) ? v : []).map((t) => String(t).trim()).filter(Boolean).slice(0, k);
      S().peda.push({ t: Date.now(), type: T.id, sup: s.id, niv: n.id, note, c: Object.fromEntries(C.map((x) => [x.k, x.note])) });
      if (S().peda.length > 200) S().peda.splice(0, S().peda.length - 200);
      save();
      box.innerHTML = `<div class="aires"><div class="ainote"><strong>${nf(note)} / 20</strong><span>${E(T.nom)} · ${E(s.nom)}</span></div>
        <div class="crit">${C.map((x) => `<div><b>${E(x.l)}</b><span>${nf(x.note)} / ${x.p}</span><small>${E(x.c)}</small></div>`).join('')}</div>
        ${L(r.points_forts, 3).length ? `<h3>Points forts</h3><ul>${L(r.points_forts, 3).map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}
        ${L(r.a_travailler, 3).length ? `<h3>À travailler</h3><ul>${L(r.a_travailler, 3).map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}
        ${r.transcription ? `<details class="keep"><summary>La transcription de ta photo</summary><p>${br(String(r.transcription).slice(0, 6000))}</p></details>` : ''}
        ${r.modele ? `<h3>La copie modèle pour ce support</h3><div class="modele" style="white-space:normal;background:#f1f7f3;border-left:4px solid #2f9e6e;border-radius:8px;padding:12px 16px">${br(String(r.modele).slice(0, 6000))}</div>` : ''}
        <div class="btns" style="margin-top:14px"><a class="b sec" href="#ecrits-peda">Autre type de question</a></div></div>`;
      try { localStorage.removeItem('agreg-peda-' + cle); } catch (e) { /* stockage indisponible */ }
    } catch (e) { box.innerHTML = `<p class="hint">${E(errIA(e))}</p>`; }
    const b = $('#pd-eval'); if (b) b.disabled = false;
  }
  function route(h) {
    const m = h.match(/^ecrits-peda-([a-z]+)-(\d+)$/);
    if (m) return exercice(m[1], m[2]);
    return accueil();
  }
  window.ECRITS_PEDA = { route, carte, TYPES, SUPPORTS };
})();
