/* =====================================================================
   SI Papara — agrégation : le rétroplanning de la session 2027, l'épreuve d'annales, les défis d'admission
   - #retro : les dates de la session 2027 (calendrier officiel des concours du second degré), le compte à
     rebours, la frise jusqu'aux épreuves d'admission et le programme semaine par semaine ;
   - #epreuve-annales : 10 questions tirées des parties d'annales des seules notions débloquées
     (palier agrégation validé à moitié, ou partie d'annale déjà commencée), 60 minutes, note sur 20 (st.exA) ;
   - les défis de la semaine reçoivent une partie pratique (banc simulé ou banc du labo) et une leçon.
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, NOTIONS, PLAN, allQ, rec, nById, wk0,
   wid, dfr, DAYMS, noteOf, epreuve.
   ===================================================================== */
(function () {
  'use strict';
  /* ---------- la session 2027 (devenirenseignant.gouv.fr, calendrier des concours du second degré) ---------- */
  const INSCR = Date.UTC(2026, 11, 2, 11, 0);   // mercredi 2 décembre 2026, 12 h à Paris (UTC+1)
  const J = (a, m, d) => new Date(a, m - 1, d).getTime();   // une date du calendrier, à minuit chez soi
  const INT = [J(2027, 1, 25), J(2027, 1, 29)], EXT = [J(2027, 2, 17), J(2027, 3, 5)];
  const SOURCE = 'https://www.devenirenseignant.gouv.fr/cid98448/calendrier-des-concours-recrutement-enseignants-second-degre.html';
  const jours = (t) => Math.round((new Date(t).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);   // en jours du calendrier
  const quand = (n) => (n > 1 ? `dans ${n} jours` : n === 1 ? 'demain' : n === 0 ? 'aujourd’hui' : 'passé');
  const dLong = (t) => new Date(t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const heureLocale = (t) => new Date(t).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  /* ---------- l'épreuve d'annales, notion par notion ---------- */
  const niveau = (N, id) => N.levels.find((l) => l.id === id);
  function etatNotion(N) {
    const A = niveau(N, 'annale'); if (!A) return null;
    const G = niveau(N, 'agreg'), v = G ? G.qs.filter((_, j) => rec(`${N.id}.agreg.${j}`).ok >= 2).length : 0, n = G ? G.qs.length : 0;
    const vu = A.qs.some((_, j) => (st.q[`${N.id}.annale.${j}`] || {}).seen), q = A.qs.filter((x) => !x.open).length;
    return { N, v, n, il: Math.ceil(n / 2), ouvert: (n && v >= n / 2) || vu, q, sub: A.sub || '' };
  }
  const ouvertes = () => NOTIONS.map(etatNotion).filter((e) => e && e.ouvert);
  const pool = () => { const ok = new Set(ouvertes().map((e) => e.N.id)); return allQ().filter((x) => x.L.id === 'annale' && ok.has(x.N.id) && !x.q.open); };
  function annales() {
    const E = NOTIONS.map(etatNotion).filter(Boolean), P = pool(), H = (Array.isArray(st.exA) ? st.exA : []).slice(-5).reverse();
    app().innerHTML = `<a class="back" href="#accueil">← Accueil</a><div class="eyebrow">Agrégation SII · épreuve d’annales</div><h1>L’épreuve d’annales</h1>
      <p>Dix questions tirées des parties d’annales, seulement dans les notions que tu as débloquées : pas d’épreuve sur des notions que tu ne maîtrises pas encore. 60 minutes, un seul essai, note sur 20. Une notion se débloque quand la moitié de son palier agrégation est validée.</p>
      <div class="card"><h2 style="margin:0 0 8px">Les notions</h2><ul style="list-style:none;padding:0;margin:0">${E.map((e) => `<li style="margin:8px 0">${e.ouvert ? '<b style="color:#2e8b57">✓</b>' : '<b style="color:#9fb3c2">○</b>'} <a href="#n-${e.N.id}">${esc(e.N.name)}</a> <span class="muted">· ${e.ouvert ? `débloquée, ${e.q} question${e.q > 1 ? 's' : ''} d’annale` : `palier agrégation : ${e.v} / ${e.n} validées, il en faut ${e.il}`}</span></li>`).join('')}</ul></div>
      <div class="btns" style="margin-top:16px">${P.length >= 4 ? `<button class="b" type="button" id="go-ann">Commencer : ${Math.min(10, P.length)} questions, 60 minutes</button>` : '<p class="hint" style="padding:8px 12px">Il faut au moins une notion débloquée (et quatre questions d’annale) pour lancer l’épreuve. Commence par le palier agrégation d’une notion.</p>'}</div>
      ${H.length ? `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Tes dernières épreuves d’annales</h2><ul>${H.map((x) => `<li>${esc(dfr(x.d))} : <b>${fmt(x.s, 3)} / 20</b></li>`).join('')}</ul></div>` : ''}`;
    app().onclick = (e) => { if (e.target.id === 'go-ann') epreuve('annales'); };
    app().oninput = null; app().onchange = null;
  }

  /* ---------- les défis de la semaine : une partie pratique et une leçon ---------- */
  const BANC_DE = { puiss: 'pompe', machines: 'monte', conv: 'monte', meca: 'monte', magn: 'monte', fourier: 'harmo', thermo: 'pompe', asserv: 'pompe', elec: 'oscillo', signal: 'oscillo', bus: 'can', python: 'i2c' };
  const EPS = [['int', 'interne'], ['e2', 'externe, épreuve 2'], ['e1', 'externe, épreuve 1']];
  function completer(P, s) {
    if (!P || !Array.isArray(P.d) || !window.ADMISSION || !window.ADMISSION_TP) return false;
    let fait = false;
    if (!P.d.some((d) => d.ty === 'banc')) {
      const B = ADMISSION_TP.BANCS, f = (P.f || []).map((n) => BANC_DE[n]).find((id) => id && B[id]);
      const vieux = Object.keys(B).sort((a, b) => dernier(a) - dernier(b))[0], id = f || vieux;
      if (id) { P.d.push({ j: 2, ty: 'banc', id, pts: 10, t: `Partie pratique : ${B[id].titre}`, x: 'Le banc simulé de bout en bout, conclusion comprise ; ou une fiche de tes bancs du labo, évaluée par le jury IA.', go: 'admission-tp-' + id }); fait = true; }
    }
    if (!P.d.some((d) => d.ty === 'lecon')) {
      const k = Math.floor(s / (7 * 864e5)) % EPS.length, [ep, nom] = EPS[k];
      P.d.push({ j: 1, ty: 'lecon', ep, pts: 10, t: `Leçon au chronomètre (${nom})`, x: 'Construire la séquence dans le temps de l’épreuve, la faire corriger, puis passer l’entretien.', go: 'admission-lecon-' + ep }); fait = true;
    }
    return fait;
  }
  const dernier = (id) => { const x = st.tp && st.tp[id]; const E = x && Array.isArray(x.essais) ? x.essais : []; return E.length ? E[E.length - 1].t : 0; };
  function dProg(df, s) {
    const e = wk0(s, 1), inw = (t) => t >= s && t < e;
    if (df.ty === 'banc') {
      const x = st.tp && st.tp[df.id], E = x && Array.isArray(x.essais) ? x.essais.filter((q) => inw(q.t)) : [];
      if (E.length) return { r: 1, txt: `note ${fmt(Math.max(...E.map((q) => q.note)), 3)} / 20` };
      const H = Object.values(st.reel || {}).flatMap((R) => (R && Array.isArray(R.hist) ? R.hist : [])).filter((h) => inw(h.t));
      if (H.length) return { r: 1, txt: `banc du labo : ${fmt(Math.max(...H.map((h) => h.note)), 3)} / 10` };
      return { r: 0, txt: 'à faire' };
    }
    const L = (Array.isArray(st.adm) ? st.adm : []).filter((a) => inw(a.t) && typeof a.note === 'number');
    return L.length ? { r: 1, txt: `note ${fmt(Math.max(...L.map((a) => a.note)), 3)} / 10` } : { r: 0, txt: 'à faire' };
  }

  /* ---------- le rétroplanning ---------- */
  function frise() {
    const t0 = new Date().setHours(0, 0, 0, 0), t1 = J(2027, 7, 31), W = 680, H = 128, m = { l: 6, r: 6 }, pw = W - m.l - m.r;
    const X = (t) => m.l + Math.max(0, Math.min(1, (t - t0) / (t1 - t0))) * pw;
    const COUL = { not: '#12566f', ann: '#9c5221', ecr: '#a8362b', adm: '#2f7d4f' };
    // une bande ; son nom n'est écrit dedans que s'il y tient (sinon la légende le donne)
    const seg = (a, b, y, c, txt, pointille) => { const x1 = X(a), x2 = X(b); if (x2 - x1 < 1) return ''; const tient = txt && txt.length * 6.4 + 10 < x2 - x1; return `<rect x="${x1.toFixed(1)}" y="${y}" width="${(x2 - x1).toFixed(1)}" height="20" rx="4" fill="${c}"${pointille ? ` fill-opacity=".3" stroke="${c}" stroke-dasharray="4 3"` : ''}/>${tient ? `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${y + 14}" font-size="11.5" text-anchor="middle" fill="${pointille ? '#183047' : '#fff'}">${txt}</text>` : ''}`; };
    let s = '';
    for (let a = 2026, mo = 12; a < 2027 || mo <= 7; mo++) { if (mo > 12) { mo = 1; a++; } const t = J(a, mo, 1); if (t > t0 && t < t1) s += `<line x1="${X(t).toFixed(1)}" x2="${X(t).toFixed(1)}" y1="22" y2="${H - 20}" stroke="#e3eaef"/><text x="${(X(t) + 3).toFixed(1)}" y="${H - 6}" font-size="11.5" fill="#587083">${new Date(t).toLocaleDateString('fr-FR', { month: 'short' })}</text>`; }
    const finNotions = INT[0] - 15 * 864e5;
    s += seg(t0, finNotions, 28, COUL.not, 'notions') + seg(finNotions, INT[0], 28, COUL.ann, '') + seg(INT[0], INT[1] + 864e5, 28, COUL.ecr, '');
    s += seg(INT[1] + 864e5, EXT[0], 54, COUL.ann, '') + seg(EXT[0], EXT[1] + 864e5, 54, COUL.ecr, '');
    s += seg(J(2027, 3, 15), J(2027, 5, 15), 80, COUL.adm, 'admission interne ?', 1) + seg(J(2027, 6, 1), J(2027, 7, 15), 80, COUL.adm, 'admission externe ?', 1);
    const xi = X(INSCR); if (INSCR > t0) s += `<line x1="${xi.toFixed(1)}" x2="${xi.toFixed(1)}" y1="6" y2="${H - 20}" stroke="#c26a1b" stroke-width="2"/><text x="${(xi + 5).toFixed(1)}" y="16" font-size="11.5" fill="#c26a1b" font-weight="700">inscriptions, 2 déc.</text>`;
    const leg = [[COUL.not, 'notions, deux par semaine'], [COUL.ann, 'annales et sujets complets'], [COUL.ecr, 'écrits : interne (25-29 janv.) puis externe (17 févr.-5 mars)'], [COUL.adm, 'admission : repères, dates sur Cyclades']];
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="frise de la session 2027, d’aujourd’hui à fin juillet" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">${s}</svg>
      <p class="muted" style="display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0 0;font-size:13px">${leg.map(([c, l]) => `<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:14px;height:10px;border-radius:3px;background:${c}"></i>${l}</span>`).join('')}</p>
      <p class="muted" style="margin:4px 0 0">D’aujourd’hui à la fin juillet. Les bandes en pointillé sont des repères : le calendrier des épreuves d’admission est publié sur Cyclades.</p>`;
  }
  function semaines() {
    const now = Date.now(), L = [], debut = wk0(now), finInt = wk0(INT[0]);
    const W = st.w || {}, cur = W[wid(debut)], deja = cur && cur.f ? cur.f.slice() : [];
    const reste = NOTIONS.filter((N) => !deja.includes(N.id)).map((N) => ({ N, g: noteOf(allQ().filter((x) => x.N === N)).glob || 0 })).filter((x) => x.g < 16).sort((a, b) => a.g - b.g).map((x) => x.N.id);
    const nbNotions = Math.max(0, Math.round((finInt - debut) / (7 * 864e5)) - 2);
    for (let t = debut, k = 0; t < finInt; t += 7 * 864e5, k++) {
      let quoi;
      if (k === 0 && deja.length) quoi = `Notions : ${deja.map((id) => nById(id).name).join(' et ')} (défis de la semaine en cours)`;
      else if (k < nbNotions) { const a = reste.shift(), b = reste.shift(); quoi = a ? `Notions : ${[a, b].filter(Boolean).map((id) => nById(id).name).join(' et ')}` : 'Notions : reprendre les plus faibles, paliers agrégation et annales'; }
      else quoi = 'Annales : parties chronométrées, une épreuve d’annales, révision espacée, sujets de l’interne';
      L.push([t, quoi]);
    }
    L.push([INT[0], 'Écrits de l’interne, du lundi 25 au vendredi 29 janvier']);
    L.push([wk0(INT[1]) + 7 * 864e5, 'Sujets complets de l’externe (trois épreuves de 6 h), un par semaine, et l’admission de l’interne qui se prépare']);
    L.push([EXT[0], 'Écrits de l’externe, du mercredi 17 février au vendredi 5 mars']);
    L.push([EXT[1] + 3 * 864e5, 'Admission : la partie pratique sur les bancs, la leçon, l’entretien, le dossier']);
    return L;
  }
  function retro() {
    const ji = jours(INSCR), ouvert = Date.now() < INSCR, nI = jours(INT[0]), nE = jours(EXT[0]);
    const tuile = (n, l, sous, c) => `<div style="border-left:5px solid ${c}"><strong>${n}</strong>${l}<br><small class="muted">${sous}</small></div>`;
    app().innerHTML = `<a class="back" href="#accueil">← Accueil</a><div class="eyebrow">Agrégation SII · session 2027</div><h1>Le rétroplanning</h1>
      <p>Les deux concours, l’interne puis l’externe, et ce qu’il reste à faire chaque semaine. Samedi : repos, et rien de prévu le vendredi soir.</p>
      ${ouvert ? `<div class="hint" style="padding:12px 16px;margin:12px 0"><b>Inscriptions sur Cyclades avant le mercredi 2 décembre 2026, 12 h à Paris</b>, soit ${esc(heureLocale(INSCR))} chez toi (${quand(ji)}). Une inscription pour l’interne et une pour l’externe.</div>` : ''}
      <div class="stats">${ouvert ? tuile(ji > 1 ? `J − ${ji}` : quand(ji), 'inscriptions', 'avant le 2 décembre, 12 h à Paris', '#c26a1b') : ''}${tuile(nI > 0 ? `J − ${nI}` : '—', 'écrits de l’interne', 'du 25 au 29 janvier 2027', '#a8362b')}${tuile(nE > 0 ? `J − ${nE}` : '—', 'écrits de l’externe', 'du 17 février au 5 mars 2027', '#a8362b')}${tuile('?', 'épreuves d’admission', 'calendrier sur Cyclades', '#2f7d4f')}</div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">La frise jusqu’à l’été</h2>${frise()}</div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">Semaine par semaine</h2><p class="muted" style="margin:0 0 8px">Les notions les plus faibles d’abord (note sous 16 / 20) ; les défis de la semaine les reprennent chaque dimanche.</p>
        <ol style="padding-left:22px;margin:0">${semaines().map(([t, q]) => `<li style="margin:8px 0"><b>${esc(dfr(t))}</b> · ${esc(q)}</li>`).join('')}</ol></div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">Ce qu’il ne faut pas oublier</h2><ul>
        <li>Les horaires des écrits sont donnés à l’heure de Paris : ta convocation indique l’heure et le lieu chez toi.</li>
        <li>Admissible à l’interne : l’épreuve sur dossier demande un dossier envoyé avant les épreuves d’admission ; la date limite et les pièces à déposer sont dans Cyclades (« Mes justificatifs »). Un dépôt hors délai élimine.</li>
        <li>Le dossier industriel (interne et externe) demande plusieurs mois et ne se prépare pas entre l’admissibilité et l’admission : support, authenticité, mesures, exploitation pédagogique, dans <a href="#admission-dossier">« Le dossier industriel »</a> ; l’exposé se répète dans <a href="#admission-expose-dos">« Répéter mon exposé »</a>.</li>
        <li>Les résultats sont publiés sur le site de résultats de Cyclades.</li></ul>
        <p class="muted" style="margin:8px 0 0">Source : <a href="${SOURCE}" target="_blank" rel="noopener">calendrier des concours du second degré, session 2027</a>.</p></div>`;
    app().onclick = null; app().oninput = null; app().onchange = null;
  }
  // une ligne pour l'accueil
  function resume() {
    const ji = jours(INSCR), nI = jours(INT[0]);
    if (Date.now() < INSCR) return `Inscriptions avant le 2 décembre, 12 h à Paris (${heureLocale(INSCR)} chez toi) · écrits de l’interne ${quand(nI)}.`;
    return nI > 0 ? `Écrits de l’interne ${quand(nI)}, de l’externe ${quand(jours(EXT[0]))} : le programme semaine par semaine.` : 'Le programme jusqu’aux épreuves d’admission.';
  }
  const nbOuvertes = () => ouvertes().length, nbAnnales = () => NOTIONS.filter((N) => niveau(N, 'annale')).length;
  window.AGREG_PLAN = { retro, annales, pool, completer, dProg, resume, nbOuvertes, nbAnnales };
})();
