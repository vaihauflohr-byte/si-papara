/* =====================================================================
   SI Papara — agrégation : lire vite une documentation technique (#ecrits-doc)
   Les sujets donnent des dizaines de pages de documents techniques ; les rapports relèvent les erreurs de lecture
   (SPI avec la documentation entièrement fournie, trames mal lues). Ici, des extraits de documentation inventés pour
   le site (transistor MOSFET, motoréducteur, capteur de pression 4-20 mA, pompe centrifuge), avec tableaux et
   courbes, valeurs tirées au hasard : cinq valeurs à trouver contre la montre, puis où il fallait les lire.
   Progression : st.ec.doc (lectures datées). Globales de agreg/index.html : st, save, app, fmt.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 2 : d }).replace('-', '−'));
  const F = (x) => (typeof fmt === 'function' ? fmt(x) : nf(x, 3));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.doc)) st.ec.doc = []; return st.ec; };
  const v = (s) => `<i class="v">${s}</i>`;
  const alea = (g) => { let a = (g >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pk = (r, a) => a[Math.floor(r() * a.length)];
  const nombre = (s) => { const t = String(s || '').trim().replace(/\s| | /g, '').replace(/−/g, '-').replace(',', '.'); if (!t) return null; const x = parseFloat(t); return isFinite(x) ? x : null; };
  const mmss = (s) => `${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, '0')}`;
  const pas = (m) => { const p = 10 ** Math.floor(Math.log10(m / 6)); return [1, 2, 5, 10].map((k) => k * p).find((s) => m / s <= 8); };
  const tab = (tete, L) => `<div class="ec-sc"><table class="dc-t"><tr>${tete.map((x) => `<th>${x}</th>`).join('')}</tr>${L.map((l) => `<tr>${l.map((x, i) => `<td${i >= 2 ? ' class="n"' : ''}>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;

  // courbes : grille fine pour une lecture graphique honnête
  function courbe(o) {
    const W = 560, H = 300, ml = 52, mr = o.y2 ? 52 : 14, mt = 14, mb = 40;
    const X = (x) => ml + (x - o.x0) / (o.x1 - o.x0) * (W - ml - mr), Y = (y) => mt + (o.y1 - y) / (o.y1 - o.y0) * (H - mt - mb);
    const Y2 = o.y2 ? (y) => mt + (o.y2.y1 - y) / (o.y2.y1 - o.y2.y0) * (H - mt - mb) : null;
    let s = `<rect x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" fill="#fff" stroke="#8a7f62"/>`;
    for (let x = o.x0; x <= o.x1 + 1e-9; x += o.dx / 2) { const maj = Math.abs(Math.round(x / o.dx) * o.dx - x) < 1e-9; s += `<line x1="${X(x)}" y1="${mt}" x2="${X(x)}" y2="${H - mb}" stroke="${maj ? '#d8d0bb' : '#efeadc'}"/>`; if (maj) s += `<text x="${X(x)}" y="${H - mb + 15}" font-size="11" text-anchor="middle" fill="#4b4636">${nf(x)}</text>`; }
    for (let y = o.y0; y <= o.y1 + 1e-9; y += o.dy / 2) { const maj = Math.abs(Math.round(y / o.dy) * o.dy - y) < 1e-9; s += `<line x1="${ml}" y1="${Y(y)}" x2="${W - mr}" y2="${Y(y)}" stroke="${maj ? '#d8d0bb' : '#efeadc'}"/>`; if (maj) s += `<text x="${ml - 6}" y="${Y(y) + 4}" font-size="11" text-anchor="end" fill="#4b4636">${nf(y)}</text>`; }
    if (o.y2) for (let y = o.y2.y0; y <= o.y2.y1 + 1e-9; y += o.y2.dy) s += `<text x="${W - mr + 6}" y="${Y2(y) + 4}" font-size="11" fill="#8a4f7d">${nf(y)}</text>`;
    o.c.forEach((c) => {
      const lo = c.y2 ? o.y2.y0 : o.y0, hi = c.y2 ? o.y2.y1 : o.y1, YY = c.y2 ? Y2 : Y;
      let d = '', coupe = true, der = null;
      for (let i = 0; i <= 160; i++) { const x = c.a + (c.b - c.a) * i / 160, y = c.f(x); if (!isFinite(y) || y < lo - 1e-9 || y > hi + 1e-9) { coupe = true; continue; } d += `${coupe ? 'M' : 'L'}${X(x).toFixed(1)} ${YY(y).toFixed(1)}`; coupe = false; der = x; }
      s += `<path d="${d}" fill="none" stroke="${c.col}" stroke-width="2.2"${c.dash ? ' stroke-dasharray="7 4"' : ''}/>`;
      if (c.lab && der != null) { let xl = c.lx == null ? c.b : c.lx, yl = c.f(xl); if (!(yl >= lo && yl <= hi)) { xl = der; yl = c.f(der); } s += `<text x="${X(xl) - 4}" y="${YY(yl) - 7}" font-size="11.5" text-anchor="end" fill="${c.col}" font-weight="700">${c.lab}</text>`; }
    });
    s += `<text x="${W - mr}" y="${H - 6}" font-size="11.5" text-anchor="end" fill="#4b4636">${o.xl}</text><text x="${ml}" y="${mt - 3}" font-size="11.5" fill="#4b4636">${o.yl}</text>${o.y2 ? `<text x="${W - mr}" y="${mt - 3}" font-size="11.5" text-anchor="end" fill="#8a4f7d">${o.y2.l}</text>` : ''}`;
    return `<svg viewBox="0 0 ${W} ${H}" class="dc-fig" role="img" aria-label="${E(o.alt)}">${s}</svg>`;
  }

  const DOCS = [
    { id: 'mosfet', titre: 'Transistor MOSFET de puissance', min: 6, c: '#6a4c93',
      gen: (r) => { const D = { vds: pk(r, [60, 80, 100, 150]), id25: pk(r, [75, 90, 120]), rt: pk(r, [4.2, 5.5, 7.8, 11]), qg: pk(r, [60, 85, 120]), rth: pk(r, [0.4, 0.5, 0.65, 0.8]), a: pk(r, [0.0045, 0.006, 0.007]), Tq: pk(r, [100, 125, 150]), Iq: pk(r, [20, 30, 40]), Tc: pk(r, [60, 80, 90]) };
        D.id100 = Math.round(D.id25 * 0.7); D.rm = Math.round(D.rt * 1.3 * 10) / 10; D.r45 = Math.round(D.rm * 1.45 * 10) / 10; D.f = (T) => 1 + D.a * (T - 25) + 1.2e-5 * (T - 25) ** 2 * Math.sign(T - 25); D.P = D.rm * 1e-3 * D.f(D.Tq) * D.Iq ** 2; D.Tj = D.Tc + D.P * D.rth; D.ptot = Math.round(150 / D.rth); return D; },
      doc: (D) => `<h4>QX-${D.id25}N${String(D.vds).slice(0, 2)} · MOSFET canal N · ${D.vds} V</h4>
        <p class="dc-s">Valeurs maximales (${v('T<sub>c</sub>')} = 25 °C sauf mention)</p>${tab(['Symbole', 'Paramètre', 'Valeur', 'Unité'], [[`V<sub>DS</sub>`, 'Tension drain-source', D.vds, 'V'], ['V<sub>GS</sub>', 'Tension grille-source', '±20', 'V'], ['I<sub>D</sub>', `Courant de drain permanent, ${v('T<sub>c</sub>')} = 25 °C`, D.id25, 'A'], ['I<sub>D</sub>', `Courant de drain permanent, ${v('T<sub>c</sub>')} = 100 °C`, D.id100, 'A'], ['I<sub>DM</sub>', 'Courant de drain impulsionnel', 4 * D.id25, 'A'], ['P<sub>D</sub>', 'Puissance dissipée', D.ptot, 'W'], ['T<sub>j</sub>', 'Température de jonction', '−55 à 175', '°C']])}
        <p class="dc-s">Caractéristiques électriques (${v('T<sub>j</sub>')} = 25 °C)</p>${tab(['Paramètre', 'Conditions', 'min', 'typ', 'max', 'Unité'], [['R<sub>DS(on)</sub>', `V<sub>GS</sub> = 10 V, I<sub>D</sub> = ${Math.round(D.id25 / 2)} A`, '—', nf(D.rt), nf(D.rm), 'mΩ'], ['R<sub>DS(on)</sub>', `V<sub>GS</sub> = 4,5 V, I<sub>D</sub> = ${Math.round(D.id25 / 4)} A`, '—', nf(Math.round(D.rt * 1.4 * 10) / 10), nf(D.r45), 'mΩ'], ['V<sub>GS(th)</sub>', 'V<sub>DS</sub> = V<sub>GS</sub>, I<sub>D</sub> = 250 µA', '2', '3', '4', 'V'], ['Q<sub>g</sub>', `V<sub>GS</sub> = 10 V`, '—', D.qg, Math.round(D.qg * 1.3), 'nC']])}
        <p class="dc-s">Caractéristiques thermiques</p>${tab(['Symbole', 'Paramètre', 'max', 'Unité'], [['R<sub>th j-c</sub>', 'Jonction-boîtier', nf(D.rth), 'K/W'], ['R<sub>th j-a</sub>', 'Jonction-ambiance', '62', 'K/W']])}
        <p class="dc-s">Figure 3 · R<sub>DS(on)</sub> normalisée (1 à 25 °C) en fonction de la température de jonction</p>${courbe({ x0: -50, x1: 175, dx: 25, y0: 0.2, y1: 2.6, dy: 0.2, xl: 'T<tspan font-size="9" dy="3">j</tspan> (°C)', yl: 'R/R(25 °C)', alt: 'résistance normalisée', c: [{ f: D.f, a: -50, b: 175, col: '#12566f' }] })}`,
      q: [
        { l: () => `${v('R<sub>DS(on)</sub>')} maximale à 25 °C, pour ${v('V<sub>GS</sub>')} = 10 V`, u: 'mΩ', a: (D) => D.rm, tol: 0.01, c: (D) => `Tableau « caractéristiques électriques », ligne V<sub>GS</sub> = 10 V, colonne max : ${nf(D.rm)} mΩ (la ligne 4,5 V et la colonne typ sont des pièges).` },
        { l: (D) => `Facteur multiplicatif de ${v('R<sub>DS(on)</sub>')} à ${v('T<sub>j</sub>')} = ${D.Tq} °C`, u: '', a: (D) => D.f(D.Tq), tol: 0.04, c: (D) => `Figure 3, à ${D.Tq} °C : ${F(D.f(D.Tq))}.` },
        { l: (D) => `Pertes par conduction pour ${D.Iq} A à ${v('T<sub>j</sub>')} = ${D.Tq} °C (valeur maximale)`, u: 'W', a: (D) => D.P, tol: 0.06, c: (D) => `${nf(D.rm)} mΩ × ${F(D.f(D.Tq))} × ${D.Iq}² = ${F(D.P)} W.` },
        { l: (D) => `Température de jonction avec ces pertes, boîtier à ${D.Tc} °C`, u: '°C', a: (D) => D.Tj, abs: 3, c: (D) => `${v('T<sub>j</sub>')} = ${v('T<sub>c</sub>')} + ${v('P')}·${v('R<sub>th j-c</sub>')} = ${D.Tc} + ${F(D.P)} × ${nf(D.rth)} = ${F(D.Tj)} °C (à comparer à 175 °C).` },
        { l: () => `Courant de drain permanent admissible à ${v('T<sub>c</sub>')} = 100 °C`, u: 'A', a: (D) => D.id100, tol: 0.01, c: (D) => `Valeurs maximales, deuxième ligne I<sub>D</sub> : ${D.id100} A (et non ${D.id25} A, donné à 25 °C).` }
      ] },
    { id: 'moteur', titre: 'Motoréducteur à courant continu', min: 6, c: '#5b6b2e',
      gen: (r) => { const D = { U: pk(r, [12, 24, 48]), N0: pk(r, [3000, 3600, 4200]), I0: pk(r, [0.15, 0.25, 0.4]), R: pk(r, [0.4, 0.8, 1.5, 2.5]), L: pk(r, [0.3, 0.6, 1.2]), red: pk(r, [5, 10, 19, 27]), eta: pk(r, [0.7, 0.8, 0.85]) };
        D.w0 = D.N0 * Math.PI / 30; D.k = (D.U - D.R * D.I0) / D.w0; D.Cd = D.k * (D.U - D.R * D.I0) / D.R; D.N = (C) => D.N0 * (1 - C / D.Cd);
        D.Cm = D.Cd * pk(r, [0.12, 0.18, 0.25]); D.Cs = Math.round(D.Cm * D.red * D.eta * 100) / 100; D.Cm = D.Cs / (D.red * D.eta); D.I = D.I0 + D.Cm / D.k; D.Nm = D.N(D.Cm); D.Pu = D.Cs * D.Nm / D.red * Math.PI / 30; return D; },
      doc: (D) => `<h4>MR-${D.U}-${D.red} · Motoréducteur à courant continu</h4>
        <p class="dc-s">Moteur, sous tension nominale</p>${tab(['Symbole', 'Grandeur', 'Valeur', 'Unité'], [['U<sub>N</sub>', 'Tension nominale', D.U, 'V'], ['N<sub>0</sub>', 'Vitesse à vide', nf(D.N0, 0), 'tr/min'], ['I<sub>0</sub>', 'Courant à vide', nf(D.I0), 'A'], ['k', 'Constante de couple et de f.é.m.', nf(D.k, 4), 'N·m/A, V/(rad/s)'], ['R', 'Résistance d’induit', nf(D.R), 'Ω'], ['L', 'Inductance d’induit', nf(D.L), 'mH'], ['C<sub>d</sub>', 'Couple de démarrage', nf(D.Cd, 3), 'N·m']])}
        <p class="dc-s">Réducteur à engrenages</p>${tab(['Symbole', 'Grandeur', 'Valeur', 'Unité'], [['r', 'Rapport de réduction', `${D.red} : 1`, '—'], ['η', 'Rendement', nf(D.eta), '—'], ['C<sub>s max</sub>', 'Couple admissible en sortie', nf(D.Cd * D.red * D.eta * 0.4, 1), 'N·m']])}
        <p class="dc-s">Figure 2 · vitesse du moteur en fonction du couple moteur, sous ${D.U} V</p>${courbe({ x0: 0, x1: Math.ceil(D.Cd / pas(D.Cd)) * pas(D.Cd), dx: pas(D.Cd), y0: 0, y1: Math.ceil(D.N0 / 500) * 500, dy: 500, xl: 'C (N·m)', yl: 'N (tr/min)', alt: 'caractéristique vitesse-couple', c: [{ f: (C) => Math.max(0, D.N(C)), a: 0, b: D.Cd, col: '#12566f' }] })}`,
      q: [
        { l: () => 'Vitesse à vide en sortie du réducteur', u: 'tr/min', a: (D) => D.N0 / D.red, tol: 0.01, c: (D) => `${nf(D.N0, 0)}/${D.red} = ${F(D.N0 / D.red)} tr/min.` },
        { l: () => 'Constante de temps électrique de l’induit', u: 'ms', a: (D) => D.L / D.R, tol: 0.02, c: (D) => `${v('L')}/${v('R')} = ${nf(D.L)} mH/${nf(D.R)} Ω = ${F(D.L / D.R)} ms.` },
        { l: (D) => `Courant absorbé pour un couple de sortie de ${nf(D.Cs)} N·m`, u: 'A', a: (D) => D.I, tol: 0.03, c: (D) => `Couple moteur ${nf(D.Cs)}/(${D.red} × ${nf(D.eta)}) = ${F(D.Cm)} N·m ; ${v('I')} = ${v('I<sub>0</sub>')} + ${v('C')}/${v('k')} = ${F(D.I)} A.` },
        { l: () => 'Vitesse du moteur à ce couple (figure 2)', u: 'tr/min', a: (D) => D.Nm, tol: 0.04, c: (D) => `Sur la figure 2, à ${F(D.Cm)} N·m : ${F(D.Nm)} tr/min.` },
        { l: () => 'Puissance utile en sortie à ce point', u: 'W', a: (D) => D.Pu, tol: 0.05, c: (D) => `${nf(D.Cs)} N·m × (${F(D.Nm)}/${D.red}) × π/30 = ${F(D.Pu)} W.` }
      ] },
    { id: 'capteur', titre: 'Capteur de pression 4-20 mA', min: 5, c: '#1f6f8b',
      gen: (r) => { const D = { Pm: pk(r, [6, 10, 16, 25]), pr: pk(r, [0.25, 0.5, 1]), Ub: pk(r, [18, 24, 28]) }; D.Pq = Math.round(D.Pm * pk(r, [0.3, 0.45, 0.7]) * 10) / 10; D.Iq = pk(r, [6.4, 9, 13.6, 17.2]); D.I = 4 + 16 * D.Pq / D.Pm; return D; },
      doc: (D) => `<h4>PT-${D.Pm} · Transmetteur de pression relative, sortie 4-20 mA deux fils</h4>
        ${tab(['Rubrique', 'Caractéristique', 'Valeur', 'Unité'], [['Mesure', 'Étendue de mesure', `0 à ${D.Pm}`, 'bar'], ['Mesure', 'Surpression admissible', 2 * D.Pm, 'bar'], ['Sortie', 'Signal, linéaire', '4 à 20', 'mA'], ['Sortie', 'Précision (linéarité, hystérésis, répétabilité)', `±${nf(D.pr)}`, '% de l’EM'], ['Alimentation', 'Tension U<sub>b</sub>', '10 à 30', 'V CC'], ['Alimentation', 'Charge admissible R<sub>L</sub>', '≤ (U<sub>b</sub> − 10 V)/0,02 A', 'Ω'], ['Dynamique', 'Temps de réponse (10 à 90 %)', '< 5', 'ms']])}
        <p class="dc-s">Figure 1 · raccordement deux fils et caractéristique de sortie</p>
        <svg viewBox="0 0 560 150" class="dc-fig" role="img" aria-label="raccordement deux fils"><rect x="20" y="40" width="110" height="60" rx="8" fill="#eef5f8" stroke="#12566f"/><text x="75" y="75" font-size="13" text-anchor="middle">transmetteur</text><path d="M130 55H230M130 85H180" stroke="#183047" stroke-width="2" fill="none"/><circle cx="250" cy="55" r="18" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="250" y="52" font-size="13" text-anchor="middle">+</text><text x="250" y="66" font-size="13" text-anchor="middle">−</text><text x="250" y="25" font-size="12" text-anchor="middle">U<tspan dy="3" font-size="9">b</tspan></text><path d="M268 55H330V70M330 110V125H180V85" stroke="#183047" stroke-width="2" fill="none"/><rect x="318" y="70" width="24" height="40" rx="3" fill="#eef5f8" stroke="#12566f"/><text x="352" y="95" font-size="12">R<tspan dy="3" font-size="9">L</tspan> (mesure)</text><path d="M420 120L420 20M410 120H550" stroke="#4b4636"/><path d="M420 110L540 30" stroke="#12566f" stroke-width="2.2"/><text x="414" y="113" font-size="10" text-anchor="end">4 mA</text><text x="414" y="34" font-size="10" text-anchor="end">20 mA</text><text x="540" y="135" font-size="10" text-anchor="end">${D.Pm} bar</text><text x="425" y="135" font-size="10">0</text></svg>`,
      q: [
        { l: (D) => `Courant de sortie pour ${nf(D.Pq)} bar`, u: 'mA', a: (D) => D.I, tol: 0.01, c: (D) => `4 + 16 × ${nf(D.Pq)}/${D.Pm} = ${F(D.I)} mA.` },
        { l: (D) => `Pression mesurée quand le courant vaut ${nf(D.Iq)} mA`, u: 'bar', a: (D) => (D.Iq - 4) / 16 * D.Pm, tol: 0.01, c: (D) => `(${nf(D.Iq)} − 4)/16 × ${D.Pm} = ${F((D.Iq - 4) / 16 * D.Pm)} bar.` },
        { l: () => 'Erreur maximale sur la pression', u: 'bar', a: (D) => D.pr / 100 * D.Pm, tol: 0.02, c: (D) => `±${nf(D.pr)} % de l’étendue de mesure (${D.Pm} bar) : ±${F(D.pr / 100 * D.Pm)} bar, quelle que soit la pression mesurée.` },
        { l: (D) => `Résistance de charge maximale sous ${D.Ub} V`, u: 'Ω', a: (D) => (D.Ub - 10) / 0.02, tol: 0.01, c: (D) => `(${D.Ub} − 10)/0,02 = ${F((D.Ub - 10) / 0.02)} Ω : au-delà, le transmetteur ne peut plus fournir 20 mA.` },
        { l: (D) => `Tension aux bornes d’une résistance de mesure de 250 Ω à ${nf(D.Pq)} bar`, u: 'V', a: (D) => 0.25 * D.I, tol: 0.01, c: (D) => `250 Ω × ${F(D.I)} mA = ${F(0.25 * D.I)} V (1 à 5 V sur toute l’étendue).` }
      ] },
    { id: 'pompe', titre: 'Pompe centrifuge et réseau', min: 6, c: '#7a5c1e',
      gen: (r) => { const D = { H0: pk(r, [20, 28, 35]), Qm: pk(r, [40, 60, 80]), em: pk(r, [0.62, 0.7, 0.76]), Hg: pk(r, [5, 8, 12]), fq: pk(r, [0.5, 0.6, 0.7]) };
        D.a = 0.65 * D.H0 / D.Qm ** 2; D.Qo = 0.6 * D.Qm; D.Hp = (Q) => D.H0 - D.a * Q * Q; D.eta = (Q) => Math.max(0, D.em * (1 - ((Q - D.Qo) / D.Qo) ** 2)); const Qf = D.fq * D.Qm; D.k = (D.Hp(Qf) - D.Hg) / (Qf * Qf); D.Hr = (Q) => D.Hg + D.k * Q * Q; D.Qf = Qf; D.Hf = D.Hp(Qf); D.ef = D.eta(Qf); D.P = 1000 * 9.81 * Qf / 3600 * D.Hf / D.ef; return D; },
      doc: (D) => `<h4>PC-${D.Qm}/${D.H0} · Pompe centrifuge monocellulaire, 2 900 tr/min</h4>
        ${tab(['Grandeur', 'Condition', 'Valeur', 'Unité'], [['Débit nominal', 'meilleur rendement', nf(D.Qo, 0), 'm³/h'], ['Hauteur manométrique maximale', 'débit nul', nf(D.H0), 'm'], ['Rendement maximal', 'au débit nominal', `${nf(D.em * 100, 0)}`, '%'], ['NPSH requis', 'au débit nominal', '2,8', 'm'], ['Fluide', 'eau claire, 20 °C', '1 000', 'kg/m³']])}
        <p class="dc-s">Figure 4 · caractéristiques à 2 900 tr/min : hauteur ${v('H')}, rendement ${v('η')} ; en pointillés, la courbe du réseau ${v('H<sub>r</sub>')} = ${nf(D.Hg)} + ${nf(D.k, 5)}·${v('Q')}² (${v('Q')} en m³/h)</p>
        ${courbe({ x0: 0, x1: D.Qm, dx: D.Qm >= 60 ? 10 : 5, y0: 0, y1: Math.ceil(D.H0 * 1.15 / 5) * 5, dy: 5, xl: 'Q (m³/h)', yl: 'H (m)', alt: 'courbes de la pompe', y2: { y0: 0, y1: 100, dy: 20, l: 'η (%)' }, c: [{ f: D.Hp, a: 0, b: D.Qm, col: '#12566f', lab: 'H', lx: D.Qm * 0.15 }, { f: (Q) => 100 * D.eta(Q), a: 0, b: D.Qm, col: '#8a4f7d', y2: 1, lab: 'η', lx: D.Qo }, { f: D.Hr, a: 0, b: D.Qm, col: '#c9483b', dash: 1, lab: 'réseau', lx: D.Qm * 0.95 }] })}`,
      q: [
        { l: () => 'Hauteur manométrique à débit nul', u: 'm', a: (D) => D.H0, tol: 0.03, c: (D) => `Tableau, ou figure 4 à Q = 0 : ${nf(D.H0)} m.` },
        { l: () => 'Débit au point de fonctionnement', u: 'm³/h', a: (D) => D.Qf, tol: 0.05, c: (D) => `Intersection de la courbe de la pompe et de celle du réseau : ${F(D.Qf)} m³/h.` },
        { l: () => 'Hauteur manométrique au point de fonctionnement', u: 'm', a: (D) => D.Hf, tol: 0.05, c: (D) => `Au même point : ${F(D.Hf)} m.` },
        { l: () => 'Rendement de la pompe au point de fonctionnement', u: '%', a: (D) => 100 * D.ef, abs: 3, c: (D) => `Courbe η à ${F(D.Qf)} m³/h, échelle de droite : ${F(100 * D.ef)} %.` },
        { l: () => 'Puissance absorbée sur l’arbre au point de fonctionnement', u: 'kW', a: (D) => D.P / 1e3, tol: 0.08, c: (D) => `${v('ρ')}·${v('g')}·${v('Q')}·${v('H')}/${v('η')} = 1 000 × 9,81 × ${F(D.Qf / 3600)} × ${F(D.Hf)}/${F(D.ef)} = ${F(D.P / 1e3)} kW.` }
      ] }
  ];

  function css() {
    if ($('#dc-css')) return;
    const s = document.createElement('style'); s.id = 'dc-css';
    s.textContent = `.dc-doc{background:#fbfaf5;border:1px solid #b9ad8a;border-radius:10px;padding:12px 14px;margin:10px 0}.dc-doc h4{background:#ece6d2;margin:-12px -14px 10px;padding:9px 14px;border-radius:10px 10px 0 0;font-size:15px}.dc-s{font-weight:700;font-size:13.5px;margin:12px 0 6px;color:#4b4636}.dc-t{width:100%;border-collapse:collapse;font-size:13px;background:#fff}.dc-t th,.dc-t td{border:1px solid #d8d0bb;padding:4px 8px;text-align:left}.dc-t th{background:#f3efe2}.dc-t td.n{text-align:right;white-space:nowrap}.dc-fig{width:100%;max-width:560px;height:auto;display:block}.dc-q{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;background:#fff;border-radius:10px;padding:10px 14px}.dc-q input{font:inherit;width:120px;padding:6px 8px;border:1px solid #bbccd8;border-radius:6px}.dc-q input.ok{border-color:#2f9e6e;background:#eef8f2}.dc-q input.ko{border-color:#c9483b;background:#fdf0ee}.dc-c{grid-column:1/-1;font-size:13.5px;color:#42596b;margin:-2px 0 6px}@media(max-width:640px){.dc-q{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  function carte() {
    const n = S().doc.length, d = S().doc.slice(-1)[0];
    return `<div class="ec-ep" style="--c:#8a7f62"><div class="eyebrow">Toutes les épreuves · documents techniques</div><h3>Lire vite une documentation</h3><p class="muted">Extraits de documentation avec tableaux et courbes : MOSFET, motoréducteur, capteur 4-20 mA, pompe et réseau. Cinq valeurs à trouver contre la montre, puis où il fallait les lire.${d ? ` Dernière lecture : ${d.ok}/${d.n} en ${mmss(d.s)}.` : ''}${n > 1 ? ` ${n} lectures.` : ''}</p><div class="btns"><a class="b" href="#ecrits-doc">Lire</a></div></div>`;
  }
  function accueil() {
    css();
    app().innerHTML = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · documents techniques</div><h1>Lire vite une documentation</h1><p class="muted">Un sujet d’agrégation joint des dizaines de pages de documents ; les rapports relèvent des erreurs de lecture même quand la documentation est entièrement fournie (SPI, externe 2026), et des trames mal lues dès le départ (externe 2022). Ici : un extrait de documentation inventé pour le site, des valeurs tirées au hasard, cinq questions contre la montre. Les pièges sont ceux des vraies documentations : colonne typique ou maximale, condition de mesure, échelle de droite.</p><div class="ec-grid">${DOCS.map((X) => { const L = S().doc.filter((x) => x.id === X.id), b = L.filter((x) => x.ok === x.n).sort((a, c) => a.s - c.s)[0]; return `<div class="ec-ep" style="--c:${X.c}"><div class="eyebrow">${X.min} min · 5 questions</div><h3>${E(X.titre)}</h3><p class="muted">${b ? `Sans faute en ${mmss(b.s)}.` : L.length ? `${L.length} lecture${L.length > 1 ? 's' : ''}, meilleure ${Math.max(...L.map((x) => x.ok))}/5.` : 'Pas encore lue.'}</p><div class="btns"><a class="b" href="#ecrits-doc-${X.id}-${1 + Math.floor(Math.random() * 99999)}">Lire</a></div></div>`; }).join('')}</div>`;
  }
  function lecture(id, g) {
    css();
    const X = DOCS.find((x) => x.id === id); if (!X) return accueil();
    const D = X.gen(alea(g)), t0 = Date.now(); let tm = 0, fini = false;
    app().innerHTML = `<a class="back" href="#ecrits-doc">← Lire vite une documentation</a><div class="eyebrow">${X.min} min conseillées · tirage ${g}</div><h1>${E(X.titre)}</h1>
      <div class="btns" style="align-items:center"><span class="ec-clock" id="dc-cl" style="font-size:28px;padding:8px 14px">${X.min}:00</span><span class="muted">temps restant</span></div>
      <div class="dc-doc">${X.doc(D)}</div>
      <h2 class="sec">Les valeurs à trouver</h2><div class="dc-q">${X.q.map((q, i) => `<label for="dc-${i}">${i + 1}. ${q.l(D)}</label><span><input id="dc-${i}" inputmode="decimal" autocomplete="off"> ${E(q.u)}</span><div class="dc-c" id="dc-c${i}" hidden></div>`).join('')}</div>
      <div class="btns" style="margin-top:10px"><button class="b" id="dc-ok">Vérifier</button><a class="b sec" href="#ecrits-doc-${id}-${g + 1}">Autre tirage</a></div><div id="dc-res"></div>`;
    const tic = () => { const el = $('#dc-cl'); if (!el || fini) { clearInterval(tm); return; } const r = X.min * 60 - (Date.now() - t0) / 1000; el.textContent = (r < 0 ? '+ ' : '') + mmss(r); el.classList.toggle('fin', r < 0); };
    tm = setInterval(tic, 500); window.__an = tm; tic();
    $('#dc-ok').onclick = () => {
      if (fini) return; fini = true; clearInterval(tm);
      const s = Math.round((Date.now() - t0) / 1000); let ok = 0;
      X.q.forEach((q, i) => {
        const inp = $('#dc-' + i), x = nombre(inp.value), a = q.a(D), bon = x != null && Math.abs(x - a) <= Math.max((q.tol || 0) * Math.abs(a), q.abs || 0) + 1e-9;
        if (bon) ok++; inp.classList.add(bon ? 'ok' : 'ko'); inp.disabled = true;
        const c = $('#dc-c' + i); c.hidden = false; c.innerHTML = `${bon ? '✓' : `✗ attendu ${F(a)} ${E(q.u)}.`} ${q.c(D)}`;
      });
      S().doc.push({ t: Date.now(), id, ok, n: X.q.length, s }); if (S().doc.length > 200) S().doc.splice(0, S().doc.length - 200); save();
      $('#dc-res').innerHTML = `<div class="card"><h3 style="margin-top:0">${ok} / ${X.q.length} en ${mmss(s)}${s > X.min * 60 ? ' (hors temps)' : ''}</h3><p class="muted">${ok === X.q.length ? 'Sans faute. Un autre tirage pour aller plus vite.' : 'Relis où il fallait lire : colonne, condition, échelle. Puis un autre tirage.'}</p></div>`;
    };
  }
  function route(h) {
    const m = h.match(/^ecrits-doc-([a-z]+)-(\d+)$/);
    return m ? lecture(m[1], +m[2]) : accueil();
  }
  window.ECRITS_DOC = { route, carte, DOCS, alea };
})();
