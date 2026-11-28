/* =====================================================================
   SI Papara — agrégation : les écrits en conditions réelles (#ecrits)
   - les 86 sujets 2010-2026 classés par épreuve, avec le lien officiel (agreg/ecrits-annales.js) ;
   - pour les sujets qui ont une fiche (agreg/ecrits-<id>.js) : lecture stratégique de 15 min comparée à un plan
     modèle, composition chronométrée au format exact, correction de la copie manuscrite par photos
     (transcription vérifiée par le candidat, puis notation question par question par l'IA d'après le barème,
     la copie modèle et le rapport du jury) ou auto-évaluation, corrigé question par question ;
   - note prévisionnelle par épreuve et par concours, face aux admissibles des sessions 2025 et 2026.
   Les sujets officiels ne sont pas recopiés : ils s'ouvrent par leur lien.
   Progression : st.ec (compositions datées, lectures) ; transcriptions des photos dans ce navigateur seulement.
   Utilise les globales de agreg/index.html : st, save, app, esc, fmt, getSample, HOOK, AIERR, NOTIONS.
   ===================================================================== */
(function () {
  'use strict';
  const A = window.ECRITS_ANNALES || [];
  const FI = window.ECRITS_FICHES || {};
  const INT = [new Date(2027, 0, 25), new Date(2027, 0, 29)], EXT = [new Date(2027, 1, 17), new Date(2027, 2, 5)];
  const EPR = {
    i1: { c: 'interne', n: 1, court: 'Interne · épreuve 1', nom: 'Analyse et exploitation pédagogique d’un système pluritechnologique', dur: 300, coef: 2, txt: 'Commune à toutes les options : un système complet, mécanique, énergie et information, avec une exploitation pédagogique (documents réponses).', coul: '#7a2e2e' },
    i2: { c: 'interne', n: 2, court: 'Interne · épreuve 2', nom: 'Modélisation d’un système, d’un procédé ou d’une organisation', dur: 240, coef: 1, txt: 'Propre à l’option ingénierie électrique : parties indépendantes en énergie, électronique, automatique et informatique.', coul: '#9c5221' },
    e1: { c: 'externe', n: 1, court: 'Externe · épreuve 1', nom: 'Sciences industrielles de l’ingénieur', dur: 360, coef: 1, txt: 'Commune à toutes les options : approche globale d’un système pluritechnologique.', coul: '#12566f' },
    e2: { c: 'externe', n: 2, court: 'Externe · épreuve 2', nom: 'Modélisation d’un système, d’un procédé ou d’une organisation', dur: 360, coef: 1, txt: 'Propre à l’option : modèles électroniques, signal, transmission, traitement des données.', coul: '#2f6f4e' },
    e3: { c: 'externe', n: 3, court: 'Externe · épreuve 3', nom: 'Conception préliminaire d’un système, d’un procédé ou d’une organisation', dur: 360, coef: 1, txt: 'Propre à l’option : dimensionnement des chaînes de conversion, choix de composants.', coul: '#183047' },
    ai: { c: 'interne', n: 0, court: 'Interne · avant 2013', nom: 'Ancien concours génie électrique', dur: 360, coef: 1, txt: '', coul: '#587083' },
    ae: { c: 'externe', n: 0, court: 'Externe · avant 2013', nom: 'Ancien concours génie électrique', dur: 360, coef: 1, txt: '', coul: '#587083' }
  };
  // résultats publiés (rapports du jury, option ingénierie électrique, concours public)
  const SEUILS = {
    interne: { s: 2026, dernier: 8.96, premier: 14.41, moyAdm: null, pres: 160, adm: 19, postes: 8, mu: 5.94, sig: 2.31, avant: { s: 2025, dernier: 8.86 },
      src: 'rapport 2026 : 160 présents, 19 admissibles pour 8 postes ; moyennes des copies 5,92 (épreuve 1) et 5,97 (épreuve 2)' },
    externe: { s: 2026, dernier: 8.50, premier: 19.23, moyAdm: 11.49, pres: 124, adm: 51, postes: 18, mu: 8.42, sig: 3.28, avant: { s: 2025, dernier: 8.2 },
      src: 'rapport 2026 : 124 présents aux trois épreuves, 51 admissibles pour 18 postes ; moyenne des présents 8,42 (écart type 3,28), des admissibles 11,49' }
  };
  const OBJ = 16;

  /* ---------- outils ---------- */
  const $ = (s) => document.querySelector(s);
  const E = (t) => (typeof esc === 'function' ? esc(t) : String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const br = (t) => E(t).replace(/\n/g, '<br>');
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: 0 }).replace('-', '−'));
  const n20 = (x) => (x == null || !isFinite(x) ? '—' : nf(x, 2) + ' / 20');
  const hm = (min) => { min = Math.max(0, Math.round(min)); const h = Math.floor(min / 60), m = min % 60; return h ? `${h} h${m ? ' ' + String(m).padStart(2, '0') : ''}` : `${m} min`; };
  const hms = (s) => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
  const jour = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const jusque = (d) => Math.ceil((d - new Date(new Date().toDateString())) / 864e5);
  const quart = (x) => Math.round(x * 4) / 4;
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; const o = st.ec; if (!Array.isArray(o.comp)) o.comp = []; if (!o.lect || typeof o.lect !== 'object') o.lect = {}; return o; };
  const sujet = (id) => A.find((x) => x.id === id) || null;
  const lireLS = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const ecrireLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage plein ou indisponible */ } };
  const TR = 'agreg-ec-transcriptions';
  const errIA = (e) => { const c = e && e.code; const m = (typeof HOOK !== 'undefined' && HOOK && HOOK.err && HOOK.err(c)) ?? (typeof AIERR === 'function' ? AIERR(c) : ''); return m || (e && e.text) || 'L’IA n’a pas répondu. Réessaie dans un moment.'; };
  const notionOk = (id) => typeof NOTIONS !== 'undefined' && NOTIONS.some((n) => n.id === id);

  // entiers de somme imposée, au plus près des valeurs (méthode des plus grands restes)
  function restes(brut, total) {
    const base = brut.map(Math.floor); let r = total - base.reduce((a, v) => a + v, 0);
    brut.map((v, i) => [v - base[i], i]).sort((u, v) => v[0] - u[0]).forEach(([, i]) => { if (r > 0) { base[i]++; r--; } });
    return base;
  }
  // fiche normalisée : points de chaque question ramenés à 20
  const CACHE = {};
  function fiche(id) {
    if (CACHE[id]) return CACHE[id];
    const f = FI[id]; if (!f) return null;
    // barème au quart de point, en deux temps : les parties d'abord (poids publié par le jury, pct, sinon somme des poids
    // de leurs questions), puis les questions de chaque partie (un quart de point au moins, le reste selon leur poids)
    const W = f.q.reduce((a, x) => a + (x.w || 1), 0), Wp = (id) => f.q.filter((y) => y.p === id).reduce((a, y) => a + (y.w || 1), 0);
    const QP = restes(f.parties.map((p) => (p.pct ? 80 * p.pct / 100 : 80 * Wp(p.id) / W)), 80), PTS = {};
    // une partie qui a plus de questions que de quarts de point : les quarts manquants sont pris aux parties les plus larges
    const nq = (i) => f.q.filter((y) => y.p === f.parties[i].id).length;
    let manque = 0;
    QP.forEach((v, i) => { if (v < nq(i)) { manque += nq(i) - v; QP[i] = nq(i); } });
    while (manque > 0) { let k = -1, d = 0; QP.forEach((v, i) => { if (v - nq(i) > d) { d = v - nq(i); k = i; } }); if (k < 0) break; QP[k]--; manque--; }
    f.parties.forEach((p, i) => {
      const qs = f.q.filter((y) => y.p === p.id), n = qs.length, tot = Math.max(QP[i], n), ws = qs.map((y) => y.w || 1), Ws = ws.reduce((a, v) => a + v, 0);
      const plus = restes(ws.map((w) => (tot - n) * w / Ws), tot - n);
      qs.forEach((y, j) => { PTS[y.n] = (1 + plus[j]) / 4; });
    });
    const q = f.q.map((x) => ({ ...x, pts: PTS[x.n] || 0.25 }));
    const parties = f.parties.map((p) => { const qs = q.filter((x) => x.p === p.id); return { ...p, qs, sur: qs.reduce((a, x) => a + x.pts, 0) }; });
    return (CACHE[id] = { ...f, id, q, parties, total: q.reduce((a, x) => a + x.pts, 0) });
  }
  const aFiche = (id) => !!FI[id];

  /* ---------- notes des compositions ---------- */
  function noteComp(c) {
    const F = fiche(c.id);
    if (!F) return c.auto != null ? { note: +c.auto, parties: 0, tot: 0, complet: true } : null;
    let pts = 0, n = 0;
    F.parties.forEach((p) => { const r = c.parts && c.parts[p.id]; if (r && r.q) { n++; p.qs.forEach((q) => { const v = r.q[q.n]; if (v && isFinite(v.pts)) pts += Math.min(q.pts, Math.max(0, +v.pts)); }); } });
    if (!n) return null;
    let surCorr = 0; F.parties.forEach((p) => { if (c.parts && c.parts[p.id] && c.parts[p.id].q) surCorr += p.sur; });
    const k = 20 / (F.total || 20);
    return { note: pts * k, parties: n, tot: F.parties.length, complet: n === F.parties.length, surCorr, ptsCorr: pts };
  }
  function parType() {
    const o = {};
    Object.keys(EPR).forEach((k) => { o[k] = []; });
    S().comp.forEach((c) => { const s = sujet(c.id); if (!s) return; const N = noteComp(c); if (N) o[s.t].push({ c, N, s }); });
    Object.values(o).forEach((L) => L.sort((a, b) => a.c.t - b.c.t));
    return o;
  }
  function prevision() {
    const T = parType(), ep = {};
    ['i1', 'i2', 'e1', 'e2', 'e3'].forEach((k) => {
      const L = T[k].slice(-3);
      ep[k] = L.length ? { moy: L.reduce((a, x) => a + x.N.note, 0) / L.length, n: T[k].length, der: T[k][T[k].length - 1], part: L.some((x) => !x.N.complet) } : null;
    });
    const I = ep.i1 && ep.i2 ? (2 * ep.i1.moy + ep.i2.moy) / 3 : null;
    const X = ep.e1 && ep.e2 && ep.e3 ? (ep.e1.moy + ep.e2.moy + ep.e3.moy) / 3 : null;
    return { ep, interne: I, externe: X };
  }
  // rang estimé : répartition normale des notes des présents (moyenne et écart type publiés)
  const phi = (z) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
  const rang = (x, c) => { const K = SEUILS[c]; return Math.max(1, Math.round(1 + K.pres * (1 - phi((x - K.mu) / K.sig)))); };

  /* ---------- styles du module ---------- */
  function styles() {
    if ($('#ec-css')) return;
    const s = document.createElement('style'); s.id = 'ec-css';
    s.textContent = `.ec-ep{background:#fff;border-radius:12px;padding:16px 18px;border-top:5px solid var(--c,#183047);display:flex;flex-direction:column;gap:6px}.ec-ep h3{margin:0;font-size:17px}.ec-ep .muted{margin:0}
.ec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.ec-list{list-style:none;padding:0;margin:6px 0 0;display:grid;gap:4px}.ec-list a{display:flex;gap:8px;align-items:baseline;text-decoration:none;color:inherit;padding:6px 8px;border-radius:8px;background:#f4f7fa}.ec-list a:hover{background:#e5f1f4}.ec-list b{min-width:40px;color:#12566f}.ec-list span{flex:1}
.ec-tag{display:inline-block;font-size:11px;font-weight:700;border-radius:20px;padding:1px 8px;background:#e5f1f4;color:#12566f;white-space:nowrap}.ec-tag.ok{background:#eaf7f1;color:#1f7a53}.ec-tag.w{background:#fff6e2;color:#8a5a00}
.ec-links{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
.ec-sc{overflow-x:auto;-webkit-overflow-scrolling:touch}.ec-tab td.n small{white-space:normal}.ec-tab{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:14px}.ec-tab th,.ec-tab td{padding:8px 10px;border-bottom:1px solid #e0e8ef;text-align:left;vertical-align:top}.ec-tab th{background:#eef3f6;font-size:13px}.ec-tab td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.ec-clock{font:700 56px/1 ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;background:#183047;color:#fff;border-radius:14px;padding:18px 24px;display:inline-block;letter-spacing:.02em}.ec-clock.fin{background:#a8362b}
.ec-pt{display:grid;grid-template-columns:auto 1fr auto;gap:8px 14px;align-items:center;background:#fff;border-radius:10px;padding:10px 14px;margin:8px 0;border-left:5px solid #c9d6e0}.ec-pt.on{border-left-color:#12566f;box-shadow:0 0 0 2px #12566f inset}.ec-pt.trop{border-left-color:#e0a83a}.ec-pt .bar{grid-column:1/-1;margin:0}.ec-pt .bar i{background:#12566f}.ec-pt.trop .bar i{background:#e0a83a}
.ec-q{background:#fff;border-radius:10px;padding:12px 16px;margin:10px 0;border-left:5px solid #c9d6e0}.ec-q.ok{border-left-color:#2f9e6e}.ec-q.mi{border-left-color:#e0a83a}.ec-q.ko{border-left-color:#c9483b}.ec-q h4{margin:0 0 4px;font-size:15px;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap}.ec-q h4 small{font-weight:600}
.ec-q details{margin-top:8px}.ec-q summary{cursor:pointer;font-weight:600;color:#12566f;font-size:14px}.ec-q .modele{white-space:normal;background:#f1f7f3;border-left:4px solid #2f9e6e;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:15px}.ec-q .jury{margin-top:6px}
.ec-auto{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ec-auto button{font:inherit;font-size:13px;border:1px solid #bbccd8;background:#fff;border-radius:6px;padding:5px 10px;cursor:pointer;color:inherit}.ec-auto button.on{background:#183047;color:#fff;border-color:#183047}
.ec-page{display:grid;grid-template-columns:120px 1fr;gap:12px;background:#fff;border-radius:10px;padding:10px;margin:8px 0}.ec-page img{width:120px;border-radius:6px;border:1px solid #dbe5ec}.ec-page textarea{min-height:160px;font-size:14px}
.ec-gauge{background:#fff;border-radius:12px;padding:12px 14px;margin:10px 0}.ec-gauge svg{width:100%;height:auto;display:block}
.ec-plan td input,.ec-plan td select{font:inherit;padding:6px 8px;border:1px solid #bbccd8;border-radius:6px;background:#fff;color:inherit;width:100%;box-sizing:border-box}.ec-plan td input[type=number]{width:80px}
.ec-warn{color:#a8362b;font-weight:600}
@media(max-width:640px){.ec-plan td input[type=number]{width:64px}.ec-plan th:nth-child(5),.ec-plan td:nth-child(5){display:none}.ec-clock{font-size:40px}.ec-page{grid-template-columns:1fr}.ec-page img{width:100%;max-width:240px}.ec-tab{font-size:13px}.ec-tab th,.ec-tab td{padding:6px}}`;
    document.head.appendChild(s);
  }

  /* ---------- accueil des écrits ---------- */
  function resume() {
    const P = prevision(), n = S().comp.length, jI = jusque(INT[0]);
    const pr = P.interne != null ? ` · interne prévue ${nf(P.interne, 1)}/20` : P.ep.i1 ? ` · épreuve 1 de l’interne ${nf(P.ep.i1.moy, 1)}/20` : '';
    return `Les sujets complets au format exact, la lecture de 15 minutes, ta copie corrigée question par question d’après le rapport du jury, ta note face aux admissibles.${jI > 0 ? ` Écrits de l’interne dans ${jI} jours.` : ''}${n ? ` ${n} composition${n > 1 ? 's' : ''}${pr}.` : ''}`;
  }
  function jauge(c, x) {
    const K = SEUILS[c], W = 640, H = 118, X = (v) => 20 + (W - 40) * v / 20;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="note prévisionnelle du concours ${c} sur une règle de 0 à 20, avec les seuils publiés"><rect x="20" y="52" width="${W - 40}" height="12" rx="6" fill="#e0e8ef"/>`;
    if (x != null) s += `<rect x="20" y="52" width="${Math.max(0, X(Math.min(20, x)) - 20)}" height="12" rx="6" fill="${x >= K.dernier ? '#2f9e6e' : '#c9483b'}"/>`;
    for (let v = 0; v <= 20; v += 2) s += `<text x="${X(v)}" y="80" font-size="11" text-anchor="middle" fill="#587083">${v}</text>`;
    const an = (v) => (v > 16.5 ? 'end' : v < 3.5 ? 'start' : 'middle');
    const mk = (v, t, col, y) => `<line x1="${X(v)}" x2="${X(v)}" y1="${y < 50 ? y + 6 : 46}" y2="70" stroke="${col}" stroke-width="2"/><text x="${X(v)}" y="${y}" font-size="11.5" text-anchor="${an(v)}" fill="${col}" font-weight="600">${t}</text>`;
    s += mk(K.dernier, `dernier admissible ${K.s} : ${nf(K.dernier)}`, '#a8362b', 28);
    if (K.moyAdm) s += mk(K.moyAdm, `moyenne des admissibles : ${nf(K.moyAdm)}`, '#8a5a00', 98);
    s += mk(K.premier, `premier admissible : ${nf(K.premier)}`, '#12566f', 28);
    s += mk(OBJ, `ton objectif : ${OBJ}`, '#4a5fa8', K.moyAdm ? 12 : 98);
    if (x != null) s += `<circle cx="${X(Math.min(20, x))}" cy="58" r="9" fill="#183047"/><text x="${X(Math.min(20, x))}" y="115" font-size="12.5" text-anchor="${an(x)}" font-weight="700" fill="#183047">toi : ${nf(x)}</text>`;
    return `<div class="ec-gauge">${s}</svg></div>`;
  }
  function accueil() {
    styles();
    const P = prevision(), T = parType(), C = S().comp, jI = jusque(INT[0]), jE = jusque(EXT[0]);
    const tuile = (v, t, sub) => `<div><strong>${v}</strong>${t}${sub ? `<br><small>${sub}</small>` : ''}</div>`;
    let h = `<a class="back" href="#accueil">← Accueil</a><div class="eyebrow">Agrégation SII · ingénierie électrique · écrits 2027</div><h1>Les écrits en conditions réelles</h1>
    <p class="muted">Un sujet complet, au format et à la durée de l’épreuve. D’abord 15 minutes de lecture stratégique, comparées à un plan modèle. Puis la composition au chronomètre, sur papier. Ensuite ta copie photographiée, transcrite, et corrigée question par question d’après le barème, la copie modèle et ce que le jury a écrit. Ta note prévisionnelle se place face aux admissibles des dernières sessions.</p>
    <div class="stats">${tuile(jI > 0 ? `J − ${jI}` : '—', 'écrits de l’interne', 'du 25 au 29 janvier 2027')}${tuile(jE > 0 ? `J − ${jE}` : '—', 'écrits de l’externe', 'du 17 février au 5 mars 2027')}${tuile(C.length, C.length > 1 ? 'compositions' : 'composition', C.length ? 'dernière le ' + jour(C[C.length - 1].t) : 'aucune pour l’instant')}${tuile(Object.keys(FI).length + ' / ' + A.length, 'sujets avec corrigé complet', 'les autres : chrono et auto-notation')}</div>`;
    // note prévisionnelle
    h += `<h2 class="sec">Ma note prévisionnelle</h2>`;
    const ligne = (k) => { const e = P.ep[k], D = EPR[k]; return `<tr><td>${D.court}<br><small>${E(D.nom)} · ${hm(D.dur)} · coef. ${D.coef}</small></td><td class="n">${e ? n20(e.moy) : '—'}${e && e.part ? '<br><small>parties non corrigées comptées 0</small>' : ''}</td><td class="n">${e ? e.n : 0}</td><td class="n">${e ? n20(e.der.N.note) : '—'}</td></tr>`; };
    h += `<div class="ec-sc"><table class="ec-tab"><tr><th>Épreuve</th><th>Prévision (3 dernières)</th><th>Faites</th><th>Dernière</th></tr>${['i1', 'i2', 'e1', 'e2', 'e3'].map(ligne).join('')}</table></div>`;
    [['interne', P.interne, '(2 × épreuve 1 + épreuve 2) / 3'], ['externe', P.externe, '(épreuve 1 + épreuve 2 + épreuve 3) / 3']].forEach(([c, x, f]) => {
      const K = SEUILS[c];
      h += `<h3>Agrégation ${c} · moyenne d’admissibilité ${f}</h3>${jauge(c, x)}<p class="muted">${x != null ? `Prévision ${n20(x)} : ${x >= K.dernier ? `au-dessus du dernier admissible ${K.s} (${nf(K.dernier)}) et de ${K.avant.s} (${nf(K.avant.dernier)})` : `sous le dernier admissible ${K.s} (${nf(K.dernier)})`} ; rang estimé ≈ ${rang(x, c)}ᵉ sur ${K.pres} présents (${K.adm} admissibles). ` : `Compose au moins une fois chaque épreuve de l’${c} pour obtenir la prévision. `}Repères : ${K.src}. Le rang suppose une répartition normale des notes : c’est un ordre de grandeur.</p>`;
    });
    // la partie pédagogique de l'épreuve 1 de l'interne
    if (window.ECRITS_PEDA) h += `<h2 class="sec">La partie pédagogique de l’épreuve 1 (interne)</h2>${ECRITS_PEDA.carte()}`;
    // s'entraîner par morceaux : questions à 5 %, épreuve commune, Python, études de systèmes
    h += morceaux();
    // les épreuves
    h += `<h2 class="sec">Les sujets par épreuve</h2><div class="ec-grid">`;
    ['i1', 'i2', 'e1', 'e2', 'e3'].forEach((k) => {
      const D = EPR[k], L = A.filter((x) => x.t === k).sort((a, b) => b.y - a.y || (aFiche(b.id) - aFiche(a.id)));
      h += `<div class="ec-ep" style="--c:${D.coul}"><div class="eyebrow">${D.court} · ${hm(D.dur)} · coef. ${D.coef}</div><h3>${E(D.nom)}</h3><p class="muted">${E(D.txt)}</p><ul class="ec-list">${L.map((x) => item(x, T)).join('')}</ul></div>`;
    });
    h += `</div><details class="keep" style="margin-top:18px"><summary>Avant 2013 : l’ancien concours génie électrique (${A.filter((x) => x.t[0] === 'a').length} sujets)</summary><p class="muted">Électronique, électrotechnique, automatique et informatique industrielle : des sujets plus spécialisés, utiles pour s’entraîner sur une notion. Durée réglable au départ.</p><ul class="ec-list">${A.filter((x) => x.t[0] === 'a').sort((a, b) => b.y - a.y).map((x) => item(x, T)).join('')}</ul></details>`;
    h += `<p class="muted" style="margin-top:20px">Les sujets s’ouvrent sur les sites officiels (devenirenseignant.gouv.fr, éduscol). Les corrigés de ce site sont rédigés pour l’entraînement, d’après les éléments de correction et les commentaires des rapports du jury ; le poids des questions est une estimation, ramenée à 20.</p>`;
    app().innerHTML = h; app().onclick = null; app().onsubmit = null;
  }
  function item(x, T) {
    const cs = S().comp.filter((c) => c.id === x.id), N = cs.map(noteComp).filter(Boolean), last = N[N.length - 1];
    return `<li><a href="#ecrits-sujet-${x.id}"><b>${x.y}</b><span>${E(titreDe(x))}${x.n ? ` <small>(${E(x.n)})</small>` : ''}</span>${aFiche(x.id) ? '<span class="ec-tag">corrigé complet</span>' : ''}${last ? `<span class="ec-tag ok">${nf(last.note, 1)}/20</span>` : cs.length ? '<span class="ec-tag w">à corriger</span>' : ''}</a></li>`;
  }
  const titreDe = (x) => (FI[x.id] && FI[x.id].titre) || x.th;

  /* ---------- page d'un sujet ---------- */
  function liens(x, F) {
    const u = x.u.map((v, i) => `<a class="b" href="${E(v)}" target="_blank" rel="noopener">${x.u.length > 1 ? `Sujet officiel, fichier ${i + 1}` : 'Ouvrir le sujet officiel (PDF)'}</a>`).join('');
    const d = `<a class="b sec" href="https://drive.google.com/drive/search?q=${encodeURIComponent(x.f[0])}" target="_blank" rel="noopener">Mon exemplaire dans Google Drive</a>`;
    const r = F && F.rapport ? `<a class="b sec" href="${E(F.rapport)}" target="_blank" rel="noopener">Rapport du jury ${x.y}</a>` : '';
    return `<div class="ec-links">${u}${r}${d}</div>`;
  }
  function pageSujet(id) {
    styles();
    const x = sujet(id); if (!x) return accueil();
    const D = EPR[x.t], F = fiche(id), cs = S().comp.filter((c) => c.id === id).sort((a, b) => b.t - a.t), run = S().run;
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">${D.court} · session ${x.y} · ${hm(D.dur)} · coefficient ${D.coef}</div><h1>${E(titreDe(x))}</h1><p class="muted">${E(D.nom)}${x.n ? ' · ' + E(x.n) : ''} · ${x.p} pages${x.u.length > 1 ? ' en ' + x.u.length + ' fichiers' : ''}.</p>${liens(x, F)}`;
    if (run && run.id === id) h += `<div class="hint">Une composition de ce sujet est en cours (commencée le ${jour(run.t0)}). <a href="#ecrits-compo-${id}">Reprendre le chronomètre</a></div>`;
    if (F) {
      const nq = F.q.length;
      h += `<p>${nq} questions en ${F.parties.length} parties indépendantes. ${F.stats ? `Rapport du jury : ${F.stats.copies} copies, moyenne ${nf(F.stats.moy)}, meilleure note ${nf(F.stats.max)}.` : ''}</p>
      <div class="modes" style="margin:16px 0"><button class="mode" data-go="ecrits-lecture-${id}" style="background:#4a5fa8"><b>1. Lecture stratégique</b><span>15 minutes pour bâtir ton plan d’attaque, puis comparaison avec le plan modèle.${S().lect[id] ? ` Dernière : ${nf(S().lect[id].acc, 0)} % d’accord.` : ''}</span></button><button class="mode" data-go="ecrits-compo-${id}" style="background:${D.coul}"><b>2. Composer</b><span>${hm(D.dur)} au chronomètre, sur papier, avec ton budget de temps par partie.</span></button><button class="mode" data-go="ecrits-corrige-${id}" style="background:#2f6f4e"><b>3. Le corrigé</b><span>Question par question : la copie modèle et ce que le jury a écrit.</span></button></div>
      <div class="ec-sc"><table class="ec-tab"><tr><th>Partie</th><th>Questions</th><th>Poids estimé</th><th>Ce que dit le jury</th></tr>${F.parties.map((p) => `<tr><td><b>${E(p.id)}</b> · ${E(p.titre)}</td><td class="n">${p.q[0]} à ${p.q[1]}</td><td class="n">${nf(p.sur)} / 20</td><td><small>${E(p.jury)}</small></td></tr>`).join('')}</table></div>`;
    } else {
      h += `<div class="hint">Pas encore de corrigé question par question pour ce sujet. Compose-le au chronomètre, puis note-toi avec le rapport du jury de la session ${x.y} : ta note entre dans la prévision.</div><div class="btns" style="margin-top:14px"><button class="b" data-go="ecrits-compo-${id}">Composer en conditions réelles (${hm(D.dur)})</button></div>`;
    }
    if (cs.length) {
      h += `<h2 class="sec">Mes compositions</h2><div class="ec-sc"><table class="ec-tab"><tr><th>Date</th><th>Durée</th><th>Note</th><th></th></tr>${cs.map((c) => { const N = noteComp(c); return `<tr><td>${jour(c.t)}${c.pause ? '<br><small>avec pause</small>' : ''}</td><td class="n">${c.d ? hm(c.d) : '—'}</td><td class="n">${N ? n20(N.note) + (N.complet ? '' : `<br><small>${N.parties} partie${N.parties > 1 ? 's' : ''} sur ${N.tot} corrigée${N.parties > 1 ? 's' : ''}</small>`) : '—'}</td><td><a href="#ecrits-corr-${id}-${c.t}">${N ? 'Voir la correction' : 'Corriger'}</a></td></tr>`; }).join('')}</table></div>`;
    }
    app().innerHTML = h;
    app().onclick = (e) => { const b = e.target.closest('[data-go]'); if (b) location.hash = b.dataset.go; };
  }

  /* ---------- corrigé question par question ---------- */
  function blocQ(q, opts) {
    opts = opts || {};
    const r = opts.res, cl = r && r.pts != null ? (r.pts >= q.pts * 0.75 ? 'ok' : r.pts > 0 ? 'mi' : 'ko') : '';
    return `<div class="ec-q ${cl}" id="q${q.n}"><h4><span>Question ${q.n}${q.nt && notionOk(q.nt) ? ` <a class="ec-tag" href="#n-${q.nt}">notion</a>` : q.nt === 'ped' ? ` <a class="ec-tag" href="#ecrits-peda${typePeda(q.q)}">pédagogie : s’entraîner</a>` : ''}</span><small>${r && r.pts != null ? `${nf(r.pts)} / ${nf(q.pts)} pt` : `${nf(q.pts)} pt`}</small></h4><div>${E(q.q)}</div>
      ${r && r.com ? `<div class="corr" style="margin-top:8px"><b>${r.ia ? 'Correction de l’IA' : 'Ton auto-évaluation'}</b><p>${E(r.com)}</p></div>` : ''}
      ${opts.auto ? `<div class="ec-auto" data-q="${q.n}">${[[1, 'Juste'], [0.5, 'À moitié'], [0.25, 'Amorcé'], [0, 'Faux ou rien']].map(([k, t]) => `<button type="button" data-k="${k}" class="${r && !r.ia && r.pts != null && Math.abs(r.pts - quart(k * q.pts)) < 0.01 ? 'on' : ''}">${t}</button>`).join('')}</div>` : ''}
      <details${opts.ouvert ? ' open' : ''}><summary>La copie modèle</summary><div class="modele">${br(q.r)}</div></details>
      <details${opts.ouvert ? ' open' : ''}><summary>Ce que le jury a écrit${q.tx ? ` · ${E(q.tx)}` : ''}</summary><div class="jury"><p>${br(q.j)}</p></div></details></div>`;
  }
  // le type d'exercice pédagogique le plus proche d'une question du sujet
  function typePeda(t) {
    const T = [['prompt', /prompt/i], ['fiche', /fiche « connaissances »|fiche connaissances/i], ['multi', /multiphysique/i], ['indic', /indicateur/i], ['protocole', /protocole/i], ['evalsom', /évaluation sommative|fiche descriptive/i], ['sequence', /séquence/i]].find(([, rx]) => rx.test(t || ''));
    return T ? `-${T[0]}-${Math.floor(Math.random() * 1000)}` : '';
  }
  function corrige(id) {
    styles();
    const x = sujet(id), F = fiche(id); if (!x || !F) return pageSujet(id);
    let h = `<a class="back" href="#ecrits-sujet-${id}">← ${E(F.titre)}</a><div class="eyebrow">${EPR[x.t].court} · session ${x.y} · le corrigé</div><h1>Le corrigé question par question</h1>
    <p class="muted">Cherche d’abord la question toi-même, puis ouvre la copie modèle. « Ce que le jury a écrit » reprend les éléments de correction et les remarques du rapport ${x.y}.</p>
    <div class="jury"><b>Ce que le jury a écrit sur l’épreuve</b>${F.general.map((g) => `<p>• ${E(g)}</p>`).join('')}</div>`;
    F.parties.forEach((p) => { h += `<h2 class="sec">Partie ${E(p.id)} · ${E(p.titre)} <small class="muted">(${nf(p.sur)} pt)</small></h2><div class="jury"><b>Le jury sur cette partie</b><p>${E(p.jury)}</p></div>${p.qs.map((q) => blocQ(q)).join('')}`; });
    app().innerHTML = h; app().onclick = null;
  }

  /* ---------- lecture stratégique (15 min) ---------- */
  function lecture(id) {
    styles();
    const x = sujet(id), F = fiche(id); if (!x || !F) return pageSujet(id);
    const D = EPR[x.t], n = F.parties.length, dispo = D.dur - 30, L = S().lect[id];
    let fin = 0, tm = 0;
    let h = `<a class="back" href="#ecrits-sujet-${id}">← ${E(F.titre)}</a><div class="eyebrow">${D.court} · session ${x.y} · lecture stratégique</div><h1>Les 15 premières minutes</h1>
    <p class="muted">Ouvre le sujet et survole-le en entier : les parties, les questions, les documents réponses, les valeurs « données pour la suite ». Puis construis ton plan : dans quel ordre, combien de minutes, quelles questions récolter d’abord, quels pièges éviter. Ton temps de composition : ${hm(D.dur)}, dont ${hm(dispo)} à répartir (15 min de lecture et 15 min de relecture réservées).</p>
    ${liens(x, F)}<div class="btns" style="align-items:center"><span class="ec-clock" id="ec-cl" style="font-size:34px;padding:10px 18px">15:00</span><button class="b" id="ec-go">Démarrer les 15 minutes</button></div>
    <div class="ec-sc"><table class="ec-tab ec-plan" style="margin-top:16px"><tr><th>Partie</th><th>Ordre</th><th>Minutes</th><th>Questions sûres à faire d’abord</th><th>Pièges repérés</th></tr>${F.parties.map((p, i) => { const v = L && L.plan && L.plan[p.id] || {}; return `<tr><td><b>${E(p.id)}</b> · ${E(p.titre)}<br><small>questions ${p.q[0]} à ${p.q[1]} (${p.qs.length})</small></td><td><select data-o="${E(p.id)}">${Array.from({ length: n }, (_, k) => `<option${(v.o || i + 1) === k + 1 ? ' selected' : ''}>${k + 1}</option>`).join('')}</select></td><td><input type="number" min="0" max="${D.dur}" step="5" data-m="${E(p.id)}" value="${v.m != null ? v.m : ''}" placeholder="min"></td><td><input data-c="${E(p.id)}" value="${E(v.c || '')}" placeholder="ex. Q18 à Q20"></td><td><input data-p="${E(p.id)}" value="${E(v.p || '')}" placeholder="ex. unité, hypothèse"></td></tr>`; }).join('')}</table></div>
    <p id="ec-tot" class="muted"></p><div class="btns"><button class="b" id="ec-cmp">Comparer au plan modèle</button></div><div id="ec-res"></div>`;
    app().innerHTML = h;
    const lire = () => { const o = {}; F.parties.forEach((p) => { o[p.id] = { o: +$(`[data-o="${p.id}"]`).value, m: $(`[data-m="${p.id}"]`).value === '' ? null : +$(`[data-m="${p.id}"]`).value, c: $(`[data-c="${p.id}"]`).value.trim().slice(0, 200), p: $(`[data-p="${p.id}"]`).value.trim().slice(0, 200) }; }); return o; };
    const total = () => { const o = lire(), t = Object.values(o).reduce((a, v) => a + (v.m || 0), 0); $('#ec-tot').innerHTML = t ? `Total : ${hm(t)} sur ${hm(dispo)} à répartir.${t > dispo ? ' <span class="ec-warn">Ton plan dépasse le temps disponible.</span>' : t < dispo - 20 ? ' Il reste du temps non affecté.' : ''}` : ''; };
    $('.ec-plan').oninput = total; total();
    $('#ec-go').onclick = () => {
      fin = Date.now() + 15 * 60e3; $('#ec-go').disabled = true;
      const tic = () => { const r = (fin - Date.now()) / 1000; $('#ec-cl') && ($('#ec-cl').textContent = hms(Math.max(0, r)).slice(2)); if (r <= 0) { clearInterval(tm); $('#ec-cl') && $('#ec-cl').classList.add('fin'); } };
      tm = setInterval(tic, 500); window.__an = tm; tic();
    };
    $('#ec-cmp').onclick = () => { clearInterval(tm); comparer(id, F, D, lire(), dispo); };
    if (L && L.plan) comparer(id, F, D, L.plan, dispo, true);
  }
  function comparer(id, F, D, plan, dispo, ancien) {
    const ps = F.parties, n = ps.length;
    const mT = ps.reduce((a, p) => a + p.lecture.min, 0), tT = ps.reduce((a, p) => a + (plan[p.id].m || 0), 0);
    let dT = 0, dO = 0;
    ps.forEach((p) => { dT += Math.abs((tT ? (plan[p.id].m || 0) / tT : 0) - p.lecture.min / mT); dO += Math.abs((plan[p.id].o || 0) - p.lecture.ordre); });
    const maxO = Math.floor(n * n / 2) || 1, accT = Math.max(0, 1 - dT / 2), accO = Math.max(0, 1 - dO / maxO), acc = Math.round(100 * (0.6 * accT + 0.4 * accO));
    if (!ancien) { S().lect[id] = { t: Date.now(), plan, acc }; save(); }
    const ordreM = ps.slice().sort((a, b) => a.lecture.ordre - b.lecture.ordre);
    let h = `<h2 class="sec">Ton plan face au plan modèle</h2><div class="ainote"><strong>${acc} %</strong><span>d’accord avec le plan modèle (répartition du temps ${Math.round(100 * accT)} %, ordre ${Math.round(100 * accO)} %)${tT > dispo ? ' · ton plan dépasse le temps disponible' : ''}</span></div>
    <div class="ec-sc"><table class="ec-tab" style="margin-top:12px"><tr><th>Partie</th><th>Toi</th><th>Modèle</th><th>Poids estimé</th></tr>${ps.map((p) => `<tr><td><b>${E(p.id)}</b> · ${E(p.titre)}</td><td class="n">${plan[p.id].o}ᵉ · ${plan[p.id].m != null ? hm(plan[p.id].m) : '—'}</td><td class="n">${p.lecture.ordre}ᵉ · ${hm(p.lecture.min)}</td><td class="n">${nf(p.sur)} pt</td></tr>`).join('')}</table></div>
    <div class="corr"><b>Le plan modèle</b><p>${E(F.plan.resume)}</p><p>Ordre conseillé : ${ordreM.map((p) => 'partie ' + E(p.id)).join(', ')}.</p></div>
    <div class="keep"><b>Partie par partie : ce qu’on récolte d’abord, ce qu’on évite</b><ul>${ordreM.map((p) => `<li><b>Partie ${E(p.id)}</b> (${hm(p.lecture.min)}) : ${E(p.lecture.cadeaux)}. <i>Piège :</i> ${E(p.lecture.piege)}${plan[p.id].c || plan[p.id].p ? `<br><small>Toi : ${E([plan[p.id].c, plan[p.id].p].filter(Boolean).join(' · '))}</small>` : ''}</li>`).join('')}</ul></div>
    <div class="jury"><b>Conseils de lecture pour ce sujet</b>${F.plan.conseils.map((c) => `<p>• ${E(c)}</p>`).join('')}</div>
    <div class="btns" style="margin-top:14px"><button class="b" data-go="ecrits-compo-${id}">Composer avec ce plan</button><button class="b sec" id="ec-ia-plan">Faire commenter mon plan par l’IA</button></div><div id="ec-ia-pl"></div>`;
    $('#ec-res').innerHTML = h;
    $('#ec-res').onclick = (e) => { const b = e.target.closest('[data-go]'); if (b) location.hash = b.dataset.go; };
    $('#ec-ia-plan').onclick = () => iaPlan(F, D, plan, dispo);
  }
  async function iaPlan(F, D, plan, dispo) {
    const box = $('#ec-ia-pl'); box.innerHTML = '<div class="think">Lecture de ton plan… (une minute au plus)</div>';
    let s = null; try { s = await getSample(); } catch (e) { s = null; }
    if (!s) { box.innerHTML = '<p class="hint">L’IA n’est pas disponible pour l’instant.</p>'; return; }
    const p = `Tu es membre du jury de l'agrégation SII, option ingénierie électrique, et formateur de candidats. Un candidat vient de faire la lecture stratégique de 15 minutes d'un sujet de ${D.court.toLowerCase()} (${D.nom}, ${D.dur / 60} h).
Sujet : ${F.titre}. Parties :
${F.parties.map((x) => `- Partie ${x.id} (${x.titre}), questions ${x.q[0]} à ${x.q[1]}, poids estimé ${x.sur} / 20. Plan modèle : ${x.lecture.ordre}e, ${x.lecture.min} min ; à récolter d'abord : ${x.lecture.cadeaux} ; piège : ${x.lecture.piege}.`).join('\n')}
Plan modèle : ${F.plan.resume}
Plan du candidat (temps à répartir : ${dispo} min) :
${F.parties.map((x) => `- Partie ${x.id} : rang ${plan[x.id].o}, ${plan[x.id].m == null ? 'durée non indiquée' : plan[x.id].m + ' min'} ; questions sûres : ${plan[x.id].c || 'rien'} ; pièges : ${plan[x.id].p || 'rien'}.`).join('\n')}
Consignes : juge la qualité stratégique de ce plan (répartition du temps selon le poids des parties, ordre adapté à un électricien, questions repérées, pièges). Le plan modèle n'est pas la seule bonne réponse : un autre ordre se défend s'il est justifié. Tutoie. Français simple, sans Markdown.
Réponds en JSON : {"note_sur_10": 7, "bien": ["…"], "a_revoir": ["…"], "conseil": "une phrase"}`;
    try {
      const r = await s.json(p, { cache: false, modelTier: 'complex' });
      const L = (v, k) => (Array.isArray(v) ? v : []).map((t) => String(t).trim()).filter(Boolean).slice(0, k);
      const nt = Math.max(0, Math.min(10, +(r && r.note_sur_10) || 0));
      box.innerHTML = `<div class="aires"><div class="ainote"><strong>${nf(nt, 1)} / 10</strong><span>avis de l’IA sur ton plan</span></div>${L(r.bien, 4).length ? `<h3>Ce qui est bien vu</h3><ul>${L(r.bien, 4).map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}${L(r.a_revoir, 4).length ? `<h3>À revoir</h3><ul>${L(r.a_revoir, 4).map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}${r.conseil ? `<p><b>Conseil :</b> ${E(r.conseil)}</p>` : ''}</div>`;
    } catch (e) { box.innerHTML = `<p class="hint">${E(errIA(e))}</p>`; }
  }

  /* ---------- composition au chronomètre ---------- */
  let verrou = null;
  async function eveil(on) { try { if (on && 'wakeLock' in navigator && !verrou) { verrou = await navigator.wakeLock.request('screen'); verrou.addEventListener('release', () => { verrou = null; }); } if (!on && verrou) { await verrou.release(); verrou = null; } } catch (e) { verrou = null; } }
  function compo(id) {
    styles();
    const x = sujet(id); if (!x) return accueil();
    const F = fiche(id), D = EPR[x.t], R = S().run;
    if (R && R.id === id) return chrono(id);
    if (R && R.id !== id) {
      const y = sujet(R.id);
      app().innerHTML = `<a class="back" href="#ecrits-sujet-${id}">← Retour</a><h1>Une autre composition est en cours</h1><p>${E(y ? titreDe(y) : R.id)}, commencée le ${jour(R.t0)}.</p><div class="btns"><a class="b" href="#ecrits-compo-${E(R.id)}">La reprendre</a><button class="b sec" id="ec-ab">L’abandonner et commencer celle-ci</button></div>`;
      $('#ec-ab').onclick = () => { delete S().run; save(); compo(id); };
      return;
    }
    const L = S().lect[id], parts = F ? F.parties : [];
    const budg = (p) => (L && L.plan && L.plan[p.id] && L.plan[p.id].m) || p.lecture.min;
    const ordre = F ? parts.slice().sort((a, b) => ((L && L.plan && L.plan[a.id] ? L.plan[a.id].o : a.lecture.ordre) - (L && L.plan && L.plan[b.id] ? L.plan[b.id].o : b.lecture.ordre))) : [];
    let h = `<a class="back" href="#ecrits-sujet-${id}">← ${E(titreDe(x))}</a><div class="eyebrow">${D.court} · session ${x.y}</div><h1>Composer en conditions réelles</h1>
    <div class="keep"><b>Avant de lancer le chronomètre</b><ul><li>Le sujet ouvert ou imprimé, avec ses documents réponses (à rendre tous, même vides).</li><li>Des copies : une copie séparée par partie, chaque feuille numérotée, le numéro de la question avant chaque réponse.</li><li>Expression littérale, puis valeurs, puis résultat encadré avec son unité.</li><li>Téléphone en mode avion ; cet écran reste allumé pendant l’épreuve si l’appareil le permet.</li></ul></div>${liens(x, F)}
    <div class="fields"><div class="fld"><label for="ec-dur">Durée de l’épreuve</label><input id="ec-dur" type="number" min="30" max="480" step="5" value="${D.dur}"><span class="u">minutes${x.t[0] !== 'a' ? ` (officiel : ${hm(D.dur)})` : ' (à vérifier sur le sujet)'}</span></div></div>`;
    if (F) h += `<h2 class="sec">Ton budget de temps</h2><p class="muted">${L ? 'Repris de ta lecture stratégique du ' + jour(L.t) + '.' : 'Plan modèle ; fais la lecture stratégique pour composer avec ton propre plan.'} Le chronomètre te dira quand une partie dépasse son budget.</p><div class="ec-sc"><table class="ec-tab"><tr><th>Ordre</th><th>Partie</th><th>Budget</th></tr>${ordre.map((p, i) => `<tr><td class="n">${i + 1}</td><td><b>${E(p.id)}</b> · ${E(p.titre)}</td><td class="n">${hm(budg(p))}</td></tr>`).join('')}</table></div>`;
    h += `<div class="btns" style="margin-top:16px"><button class="b" id="ec-start">Lancer le chronomètre</button></div>`;
    app().innerHTML = h;
    $('#ec-start').onclick = () => {
      const dur = Math.max(30, Math.min(480, +$('#ec-dur').value || D.dur));
      S().run = { id, t0: Date.now(), dur, pz: [], cur: ordre.length ? ordre[0].id : null, b: Object.fromEntries(parts.map((p) => [p.id, budg(p)])), sp: {}, ord: ordre.map((p) => p.id), since: Date.now() };
      save(); chrono(id);
    };
  }
  function ecoule(R, now) { let pz = 0; (R.pz || []).forEach((p) => { pz += (p[1] || now) - p[0]; }); return (now - R.t0 - pz) / 1000; }
  function chrono(id) {
    styles();
    const R = S().run, x = sujet(id), F = fiche(id); if (!R || !x) return compo(id);
    if (!R.pz) R.pz = []; if (!R.sp) R.sp = {}; if (!R.b) R.b = {};
    const enPause = () => R.pz.length && !R.pz[R.pz.length - 1][1];
    const parts = F ? (R.ord || []).map((k) => F.parties.find((p) => p.id === k)).filter(Boolean) : [];
    app().innerHTML = `<div class="eyebrow">${EPR[x.t].court} · session ${x.y} · composition en cours</div><h1>${E(titreDe(x))}</h1>
      <div class="btns" style="align-items:center;gap:18px"><span class="ec-clock" id="ec-cl">—</span><div><div id="ec-el" class="muted"></div><div id="ec-pz" class="ec-warn"></div></div></div>
      ${liens(x, F)}<div id="ec-parts">${parts.map((p) => `<div class="ec-pt" data-row="${E(p.id)}"><b>${E(p.id)}</b><span>${E(p.titre)}<br><small data-txt></small></span><span><span class="ec-tag ok" data-on>en cours</span><button class="b sec" data-pt="${E(p.id)}" style="padding:6px 12px">J’y passe</button></span><div class="bar"><i data-bar></i></div></div>`).join('')}</div>
      <div class="btns" style="margin-top:16px"><button class="b sec" id="ec-pause"></button><button class="b" id="ec-end">J’ai fini : rendre la copie</button></div>
      <p class="muted">En conditions réelles, pas de pause : si tu dois t’arrêter, la pause est notée dans l’historique. Tu peux fermer cette page : le chronomètre continue et reprend à la réouverture.</p>`;
    const dessine = () => {
      if (!document.getElementById('ec-cl')) return;
      const now = Date.now(), el = ecoule(R, now), rest = R.dur * 60 - el;
      if (R.cur && !enPause()) R.sp[R.cur] = (R.sp[R.cur] || 0) + Math.max(0, now - (R.since || now)) / 1000;
      R.since = now;
      $('#ec-cl').textContent = hms(Math.max(0, rest)); $('#ec-cl').classList.toggle('fin', rest <= 0);
      $('#ec-el').textContent = rest <= 0 ? 'Temps écoulé : pose le stylo et rends ta copie.' : `Écoulé : ${hms(el)} sur ${hm(R.dur)}${rest <= 15 * 60 ? ' · dernier quart d’heure : relis, encadre, numérote' : ''}`;
      $('#ec-pz').textContent = enPause() ? 'En pause' : '';
      $('#ec-pause').textContent = enPause() ? 'Reprendre' : 'Pause';
      parts.forEach((p) => {
        const row = document.querySelector(`[data-row="${p.id}"]`); if (!row) return;
        const sp = (R.sp[p.id] || 0) / 60, b = R.b[p.id] || 1, trop = sp > b, on = R.cur === p.id;
        row.classList.toggle('on', on); row.classList.toggle('trop', trop);
        row.querySelector('[data-txt]').textContent = `${hm(sp)} sur ${hm(b)} prévues${trop ? ' · budget dépassé : passe à la suite si tu bloques' : ''}`;
        row.querySelector('[data-bar]').style.width = Math.min(100, 100 * sp / b) + '%';
        row.querySelector('[data-on]').style.display = on ? '' : 'none';
        row.querySelector('[data-pt]').style.display = on ? 'none' : '';
      });
    };
    dessine(); clearInterval(window.__an); window.__an = setInterval(dessine, 1000); eveil(true);
    let dern = Date.now();
    const garde = () => { if (Date.now() - dern > 30e3) { dern = Date.now(); save(); } };
    app().onclick = (e) => { const b = e.target.closest('[data-pt]'); if (b) { dessine(); R.cur = b.dataset.pt; R.since = Date.now(); save(); dessine(); } };
    $('#ec-pause').onclick = () => { dessine(); if (enPause()) { R.pz[R.pz.length - 1][1] = Date.now(); R.since = Date.now(); } else R.pz.push([Date.now(), 0]); save(); dessine(); };
    $('#ec-end').onclick = () => {
      dessine();
      const now = Date.now(); if (enPause()) R.pz[R.pz.length - 1][1] = now;
      const c = { t: now, id, d: Math.round(ecoule(R, now) / 60), pause: R.pz.length ? 1 : 0, sp: Object.fromEntries(Object.entries(R.sp).map(([k, v]) => [k, Math.round(v / 60)])), b: R.b, parts: {} };
      S().comp.push(c); delete S().run; save(); clearInterval(window.__an); eveil(false);
      location.hash = `ecrits-corr-${id}-${c.t}`;
    };
    const id0 = setInterval(() => { if (!document.getElementById('ec-cl')) { clearInterval(id0); eveil(false); } else garde(); }, 10e3);
  }

  /* ---------- correction de la copie ---------- */
  function trouveComp(id, t) { return S().comp.find((c) => c.id === id && c.t === +t) || null; }
  function correction(id, t, pid) {
    styles();
    const x = sujet(id), c = trouveComp(id, t); if (!x || !c) return pageSujet(id);
    const F = fiche(id), N = noteComp(c);
    let h = `<a class="back" href="#ecrits-sujet-${id}">← ${E(titreDe(x))}</a><div class="eyebrow">${EPR[x.t].court} · session ${x.y} · composition du ${jour(c.t)}${c.d ? ' · ' + hm(c.d) : ''}</div><h1>Corriger ma copie</h1>`;
    if (!F) {
      h += `<p>Note-toi avec le rapport du jury de la session ${x.y} (éléments de correction et barème quand il est publié), puis entre ta note sur 20.</p>${liens(x, null)}<div class="fields"><div class="fld"><label for="ec-auto">Ma note</label><input id="ec-auto" type="number" min="0" max="20" step="0.25" value="${c.auto != null ? c.auto : ''}"><span class="u">/ 20</span></div></div><div class="btns"><button class="b" id="ec-ok">Enregistrer</button></div><p id="ec-msg" class="muted"></p>`;
      app().innerHTML = h;
      $('#ec-ok').onclick = () => { const v = +$('#ec-auto').value; if (!(v >= 0 && v <= 20)) { $('#ec-msg').textContent = 'Une note entre 0 et 20.'; return; } c.auto = quart(v); save(); $('#ec-msg').textContent = 'Note enregistrée : elle entre dans ta prévision.'; };
      return;
    }
    const P = F.parties, cur = P.find((p) => p.id === pid) || P.find((p) => !(c.parts[p.id] && c.parts[p.id].q)) || P[0];
    const pc = N && N.complet && F.stats ? Math.round(100 * phi((N.note - F.stats.moy) / F.stats.et)) : null;
    h += `<div class="ainote"><strong>${N ? n20(N.note) : '— / 20'}</strong><span>${N ? (N.complet ? `copie entière corrigée${pc != null ? ` · mieux qu’environ ${Math.min(99, Math.max(1, pc))} % des ${F.stats.copies} copies de ${x.y} (moyenne ${nf(F.stats.moy)}, meilleure ${nf(F.stats.max)})` : ''}` : `${N.parties} partie${N.parties > 1 ? 's' : ''} sur ${N.tot} corrigée${N.parties > 1 ? 's' : ''} : les autres comptent 0 (${nf(N.ptsCorr)} pt sur ${nf(N.surCorr)} dans les parties corrigées)`) : 'aucune partie corrigée'}</span></div>
    <p class="muted">Une partie à la fois : photographie ses pages (une photo par page, bien à plat, lumière du jour), vérifie la transcription, puis lance la correction. Sans réseau ou sans IA : note-toi question par question avec la copie modèle.</p>
    <div class="tabs">${P.map((p) => { const r = c.parts[p.id]; const pts = r && r.q ? p.qs.reduce((a, q) => a + (r.q[q.n] ? +r.q[q.n].pts || 0 : 0), 0) : null; return `<button class="tab${p.id === cur.id ? ' on' : ''}" data-pid="${E(p.id)}"><b>Partie ${E(p.id)}</b><small>${pts != null ? `${nf(pts)} / ${nf(p.sur)} pt · ${r.ia ? 'IA' : 'auto'}` : `${nf(p.sur)} pt · à corriger`}</small></button>`; }).join('')}</div>
    <div id="ec-part"></div>`;
    app().innerHTML = h;
    app().onclick = (e) => { const b = e.target.closest('[data-pid]'); if (b) { location.hash = `ecrits-corr-${id}-${c.t}-${b.dataset.pid}`; } };
    partie(F, x, c, cur);
  }
  function partie(F, x, c, p) {
    const box = $('#ec-part'), r = c.parts[p.id] || null, key = `${c.t}:${p.id}`;
    const TRS = lireLS(TR) || {}, pages = TRS[key] || [];
    const photos = [];   // fichiers choisis (non gardés)
    const res = (q) => (r && r.q && r.q[q.n] ? { pts: r.q[q.n].pts == null ? null : +r.q[q.n].pts || 0, com: r.q[q.n].c || '', ia: !!r.ia } : null);
    const ecrirePages = () => { const o = lireLS(TR) || {}; o[key] = pages.map((t) => String(t).slice(0, 9000)); const ks = Object.keys(o); if (ks.length > 40) ks.slice(0, ks.length - 40).forEach((k) => delete o[k]); ecrireLS(TR, o); };
    const draw = (msg) => {
      box.innerHTML = `<h2 class="sec">Partie ${E(p.id)} · ${E(p.titre)} <small class="muted">(questions ${p.q[0]} à ${p.q[1]}, ${nf(p.sur)} pt${c.sp && c.sp[p.id] != null ? ` · tu y as passé ${hm(c.sp[p.id])}${c.b && c.b[p.id] ? ` pour ${hm(c.b[p.id])} prévues` : ''}` : ''})</small></h2>
      <div class="jury"><b>Le jury sur cette partie</b><p>${E(p.jury)}</p></div>
      <div class="card"><b>1. Les pages de ta copie</b><p class="muted">Photos de la partie ${E(p.id)} seulement, dans l’ordre. Chaque photo est transcrite par l’IA ; corrige la transcription si elle a mal lu, c’est elle qui sera notée.</p>
      <div class="btns"><label class="b filebtn">Ajouter des photos<input type="file" accept="image/*" multiple hidden id="ec-f"></label><button class="b sec" id="ec-tr" ${photos.length ? '' : 'disabled'}>Transcrire ${photos.length ? photos.length + ' photo' + (photos.length > 1 ? 's' : '') : 'les photos'}</button><button class="b sec" id="ec-add">Ajouter une page tapée</button></div>
      <div id="ec-pages">${pages.map((t, i) => `<div class="ec-page"><div><b>Page ${i + 1}</b><br><button class="b sec" data-del="${i}" style="padding:4px 10px;margin-top:6px">Retirer</button></div><textarea data-pg="${i}" aria-label="transcription de la page ${i + 1}">${E(t)}</textarea></div>`).join('')}${photos.map((f, i) => `<div class="ec-page"><img alt="photo ${i + 1} à transcrire" data-ph="${i}"><div class="muted">${E(f.name || 'photo')} · en attente de transcription</div></div>`).join('')}</div>
      <div class="btns" style="margin-top:10px"><button class="b" id="ec-corr" ${pages.some((t) => t.trim()) ? '' : 'disabled'}>Faire corriger la partie ${E(p.id)} par l’IA</button><button class="b sec" id="ec-moi">Me noter moi-même</button></div><div id="ec-msg">${msg || ''}</div></div>
      <div id="ec-bilan">${r && r.bilan ? bilanHTML(r.bilan) : ''}</div>
      ${p.qs.map((q) => blocQ(q, { res: res(q), auto: !!(r && !r.ia) })).join('')}`;
      photos.forEach((f, i) => { const im = box.querySelector(`[data-ph="${i}"]`); if (im) { const u = URL.createObjectURL(f); im.src = u; im.onload = () => URL.revokeObjectURL(u); } });
      $('#ec-f').onchange = (e) => { const fs = [...e.target.files].filter((f) => /^image\//.test(f.type || '') || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name || '')); photos.push(...fs.slice(0, 12)); draw(fs.length ? '' : '<p class="hint">Choisis des photos (JPEG ou PNG).</p>'); };
      $('#ec-tr').onclick = transcrire;
      $('#ec-add').onclick = () => { pages.push(''); ecrirePages(); draw(); };
      $('#ec-corr').onclick = corriger;
      $('#ec-moi').onclick = () => { const av = c.parts[p.id]; if (!av || av.ia) { c.parts[p.id] = { q: {}, ia: 0, t: Date.now() }; p.qs.forEach((q) => { c.parts[p.id].q[q.n] = { pts: av && av.q && av.q[q.n] ? av.q[q.n].pts : null }; }); save(); } correction(c.id, c.t, p.id); };
      box.oninput = (e) => { const ta = e.target.closest('[data-pg]'); if (ta) { pages[+ta.dataset.pg] = ta.value; ecrirePages(); $('#ec-corr').disabled = !pages.some((t) => t.trim()); } };
      box.onclick = (e) => {
        const d = e.target.closest('[data-del]'); if (d) { pages.splice(+d.dataset.del, 1); ecrirePages(); draw(); return; }
        const k = e.target.closest('.ec-auto button'); if (k && r && !r.ia) { const n = +k.closest('[data-q]').dataset.q, q = p.qs.find((y) => y.n === n); r.q[n] = { pts: quart(+k.dataset.k * q.pts) }; r.t = Date.now(); save(); correction(c.id, c.t, p.id); }
      };
    };
    async function transcrire() {
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { draw('<p class="hint">L’IA n’est pas disponible pour l’instant : tape ta copie (bouton « Ajouter une page tapée ») ou note-toi toi-même.</p>'); return; }
      $('#ec-tr').disabled = true;
      while (photos.length) {
        const f = photos[0]; $('#ec-msg').innerHTML = `<div class="think">Transcription de la page ${pages.length + 1}… (jusqu’à une minute par page)</div>`;
        try {
          const o = await s.json(promptTrans(F, x, p), { cache: false, modelTier: 'complex', images: [f] });
          const t = String((o && o.texte) || '').trim(); if (!t) throw { text: 'La page n’a pas pu être lue : reprends la photo plus nette, bien à plat.' };
          pages.push(t); photos.shift(); ecrirePages();
        } catch (e) { draw(`<p class="hint">${E(errIA(e))}</p>`); return; }
      }
      draw('<p class="muted">Transcription terminée : relis-la, corrige ce que l’IA a mal lu, puis lance la correction.</p>');
    }
    async function corriger() {
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { draw('<p class="hint">L’IA n’est pas disponible pour l’instant : note-toi toi-même avec la copie modèle.</p>'); return; }
      $('#ec-corr').disabled = true; $('#ec-msg').innerHTML = '<div class="think">Le jury corrige la partie… (une à deux minutes)</div>';
      try {
        const o = await s.json(promptCorr(F, x, p, pages), { cache: false, modelTier: 'complex' });
        const Q = Array.isArray(o && o.questions) ? o.questions : [];
        const R = { q: {}, ia: 1, t: Date.now() };
        p.qs.forEach((q) => { const y = Q.find((z) => +z.n === q.n); R.q[q.n] = { pts: y ? quart(Math.min(q.pts, Math.max(0, +y.points || 0))) : 0, c: y ? String(y.commentaire || '').trim().slice(0, 400) : 'Absente de la copie.' }; });
        const L = (v, k) => (Array.isArray(v) ? v : []).map((t) => String(t).trim().slice(0, 300)).filter(Boolean).slice(0, k);
        R.bilan = { f: L(o.forme, 4), b: L(o.points_forts, 3), a: L(o.a_travailler, 3) };
        c.parts[p.id] = R; save(); correction(c.id, c.t, p.id);
      } catch (e) { draw(`<p class="hint">${E(errIA(e))}</p>`); }
    }
    draw();
  }
  const bilanHTML = (b) => `<div class="aires">${b.b && b.b.length ? `<h3>Points forts</h3><ul>${b.b.map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}${b.a && b.a.length ? `<h3>À travailler</h3><ul>${b.a.map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}${b.f && b.f.length ? `<h3>La forme</h3><ul>${b.f.map((t) => `<li>${E(t)}</li>`).join('')}</ul>` : ''}</div>`;
  function promptTrans(F, x, p) {
    return `Tu es correcteur à l'agrégation SII. L'image jointe est une page manuscrite de la copie d'un candidat : partie ${p.id} (${p.titre}, questions ${p.q[0]} à ${p.q[1]}) du sujet « ${F.titre} » (${EPR[x.t].court.toLowerCase()}, session ${x.y}).
Transcris-la fidèlement, sans corriger, compléter ni commenter :
- garde les numéros de questions tels qu'écrits (Q12, 12., Question 12…) en début de ligne ;
- garde les expressions littérales, les applications numériques, les unités, et écris les résultats encadrés ou soulignés entre [[ et ]] ;
- écris les formules sur une ligne avec ^, √, ·, /, des parenthèses et les lettres grecques ;
- décris en une ligne entre crochets chaque schéma, tableau, courbe ou diagramme (par exemple [diagramme de Fresnel : V_L et V_C opposés, V_R horizontal]) ;
- écris [illisible] pour ce que tu ne peux pas lire, [rayé] pour ce qui est barré.
Réponds en JSON : {"texte": "la transcription, une ligne par ligne de la copie", "questions": [12, 13]}`;
  }
  function promptCorr(F, x, p, pages) {
    const tout = pages.map((t, i) => `--- page ${i + 1} ---\n${t}`).join('\n');
    const bar = p.qs.map((q) => `Q${q.n} (barème ${q.pts} pt). Énoncé résumé : ${q.q}\nÉléments de correction : ${q.r.replace(/\n/g, ' ')}\nCe que le jury a écrit : ${q.j}`).join('\n\n');
    const corps = (copie) => `Tu es membre du jury de l'agrégation ${EPR[x.t].c} SII, option ingénierie électrique. Tu corriges la partie ${p.id} (${p.titre}) d'une copie sur le sujet « ${F.titre} » (session ${x.y}, ${EPR[x.t].nom}, ${hm(EPR[x.t].dur)}).

Ce que le rapport du jury attend sur cette épreuve :
${F.general.map((g) => '- ' + g).join('\n')}
Le jury sur cette partie : ${p.jury}
${window.AGREG_JURY ? '\n' + AGREG_JURY.bloc({ ep: x.t, notions: [...new Set(p.qs.map((q) => q.nt).filter(Boolean))], oral: false }) + '\n' : ''}
Barème et éléments de correction de la partie, question par question (l'épreuve entière est sur 20) :
${bar}

Copie du candidat, transcrite de sa copie manuscrite et relue par lui ([[ ]] = résultat encadré) :
<<<
${copie}
>>>

Consignes :
1. Note chaque question de la partie entre 0 et son barème, par pas de 0,25. Une question absente de la copie vaut 0. Ne note que ce qui est écrit : ne devine pas une intention.
2. Barème d'un jury : démarche juste et application numérique fausse, environ la moitié des points ; résultat juste sans justification, la moitié au plus ; unité absente ou fausse, ou expression littérale absente avant l'application numérique, un quart des points en moins. Une autre méthode juste vaut tous les points.
3. Pour chaque question, un "commentaire" de deux phrases au plus : ce qui est juste, ce qui manque par rapport à l'attendu du jury. Tutoie le candidat.
4. "forme" : au plus quatre remarques sur la forme de cette partie (littéral avant numérique, unités, résultats encadrés, numérotation, justification des hypothèses, lisibilité, orthographe).
5. "points_forts" (au plus trois) et "a_travailler" (au plus trois, concrets et liés aux notions).
6. Français simple, sans Markdown.
Réponds en JSON : {"questions": [{"n": ${p.qs[0].n}, "points": 0.5, "commentaire": "…"}], "forme": ["…"], "points_forts": ["…"], "a_travailler": ["…"]}`;
    const place = 38500 - corps('').length;
    return corps(tout.length > place ? tout.slice(0, Math.max(0, place - 60)) + '\n[… fin de la copie coupée : trop longue]' : tout);
  }

  // les entraînements ciblés, hors sujets complets
  function morceaux() {
    const N = (id) => (typeof NOTIONS !== 'undefined' ? NOTIONS.find((n) => n.id === id) : null);
    const lv = (n, id) => n && n.levels.find((L) => L.id === id);
    const fait = (n, L) => (n && L ? L.qs.filter((_, j) => { const p = st.p && st.p[`${n.id}.${L.id}.${j}`]; return p && p.s >= 1; }).length : 0);
    const c5 = N('cinq'), me = N('meca'), th = N('thermo'), lm = lv(me, 'commune'), lt = lv(th, 'commune');
    let c = '';
    if (c5) { const n = c5.levels.reduce((a, L) => a + L.qs.length, 0), d = c5.levels.reduce((a, L) => a + fait(c5, L), 0);
      c += `<div class="ec-ep" style="--c:#a8362b"><div class="eyebrow">Toutes les épreuves · d’après les rapports</div><h3>Les questions à 5 %</h3><p class="muted">Les questions que presque personne ne réussit : ALI comparateur (3 %), premier ordre (3 %), circuit RL (4 %), Sallen-Key (5 %), signe de l’arc tangente (aucun candidat), bruit d’une résistance, Bode, PD3, théorème de l’énergie cinétique. Valeurs tirées au hasard.${d ? ` ${d} / ${n} réussies au premier essai.` : ''}</p><div class="btns"><a class="b" href="#n-cinq-agreg">S’entraîner</a></div></div>`; }
    if (lm || lt) c += `<div class="ec-ep" style="--c:#5b6b2e"><div class="eyebrow">Épreuve 1 · interne et externe</div><h3>L’épreuve commune : mécanique, fluides, thermique</h3><p class="muted">Portance et traînée, du local au global, changement de point, flexion composée, inertie et théorème de l’énergie cinétique, Archimède ; parois cylindriques, bilan d’un digesteur, pertes de charge et Bernoulli, turbine.</p><div class="btns">${lm ? '<a class="b" href="#n-meca-commune">Mécanique</a>' : ''}${lt ? '<a class="b sec" href="#n-thermo-commune">Thermique et fluides</a>' : ''}</div></div>`;
    if (window.ECRITS_PYTHON) c += ECRITS_PYTHON.carte();
    if (window.ECRITS_ETUDES) c += ECRITS_ETUDES.carte();
    return c ? `<h2 class="sec">S’entraîner par morceaux</h2><div class="ec-grid">${c}</div>` : '';
  }

  /* ---------- routes ---------- */
  function route(h) {
    clearInterval(window.__an); window.__an = 0;
    const a = app(); a.onclick = null; a.oninput = null; a.onchange = null; a.onsubmit = null;
    let m;
    if (h === 'ecrits-peda' || h.startsWith('ecrits-peda-')) { styles(); return window.ECRITS_PEDA ? ECRITS_PEDA.route(h) : accueil(); }
    if (h === 'ecrits-python' || h.startsWith('ecrits-python-')) { styles(); return window.ECRITS_PYTHON ? ECRITS_PYTHON.route(h) : accueil(); }
    if (h === 'ecrits-etudes' || h.startsWith('ecrits-etudes-')) { styles(); return window.ECRITS_ETUDES ? ECRITS_ETUDES.route(h) : accueil(); }
    if ((m = h.match(/^ecrits-sujet-(.+)$/))) return pageSujet(m[1]);
    if ((m = h.match(/^ecrits-lecture-(.+)$/))) return lecture(m[1]);
    if ((m = h.match(/^ecrits-compo-(.+)$/))) return compo(m[1]);
    if ((m = h.match(/^ecrits-corrige-(.+)$/))) return corrige(m[1]);
    if ((m = h.match(/^ecrits-corr-(.+?)-(\d{12,})(?:-(.+))?$/))) return correction(m[1], m[2], m[3]);
    return accueil();
  }
  window.ECRITS = { route, resume, prevision, fiche, noteComp, SEUILS, EPR };
})();
