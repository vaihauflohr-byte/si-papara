/* =====================================================================
   SI Papara — agrégation : les études expérimentales (partie pratique des épreuves d'admission)
   D'après les rapports de jury 2024 et 2025 (agrégation externe et interne SII, ingénierie électrique) :
   identifier l'objectif de l'activité, élaborer et justifier un protocole, maîtriser les appareils
   (analyseur de réseau, oscilloscope, sondes), exploiter les résultats, corréler simulation et mesure,
   quantifier les écarts entre performances souhaitées, mesurées et simulées, en chercher la cause,
   proposer des solutions pour les réduire, puis un protocole nouveau pour la séance.
   Trois bancs simulés, proches des bancs d'un labo d'électrotechnique (systèmes et valeurs inventés) :
   station de pompage (vanne ou variateur), monte-charge (variateur et glissement), qualité de l'énergie
   (harmoniques et courant de neutre). Valeurs tirées à chaque essai, mesures bruitées.
   Routes #admission-tp-<banc> ; essai en cours dans le navigateur (tp-<banc>) ; notes dans st.tp.
   Conclusion orale facultative, notée sur 4 par l'IA (getSample).
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, parse, okf, getSample.
   ===================================================================== */
(function () {
  'use strict';
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  const al = (a, b) => a + Math.random() * (b - a);
  const tire = (L) => L[Math.floor(Math.random() * L.length)];
  const melange = (L) => L.map((x) => [Math.random(), x]).sort((u, v) => u[0] - v[0]).map((q) => q[1]);
  const bruit = (x, r) => x * (1 + al(-r, r));
  const sig = (x, s) => Number(Number(x).toPrecision(s));   // valeur affichée, s chiffres significatifs
  const dec = (x, d) => Math.round(x * 10 ** d) / 10 ** d;  // valeur affichée, d décimales
  const F = (x, s) => fmt(x, s || 3);
  const pasNet = (L, n) => { const b = L / n, e = 10 ** Math.floor(Math.log10(b)), m = b / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e; };
  const haut = (x, p) => Math.ceil(x / p - 1e-9) * p;
  const moy = (L) => L.reduce((s, x) => s + x, 0) / L.length;
  // trois essais autour de x : dispersion (écart max à la moyenne) d'au moins 0,8 %
  function essais(x, arrondi) {
    for (;;) {
      const d = al(0.012, 0.025), e = melange([-d, d * al(0.1, 0.9), d * al(0.4, 1)]), m0 = moy(e), L = e.map((u) => arrondi(x * (1 + u - m0))), m = moy(L);
      const disp = Math.max(...L.map((y) => Math.abs(y - m))) / m * 100;
      if (disp >= 0.8) return { L, m, disp: dec(disp, 2) };
    }
  }
  // les champs : à choix (la bonne réponse est mélangée aux autres) ou numériques (tolérance relative tol, absolue abs)
  const choix = (l, bonne, autres, c) => { const L = melange([bonne, ...autres]); return { l, ch: L, a: L.indexOf(bonne), c }; };
  const num = (l, a, u, c, o) => Object.assign({ l, a, u: u || '', c }, o || { tol: 0.03 });

  /* ---------- ce que le jury regarde pendant la partie pratique (rapports 2024 et 2025) ---------- */
  const COMP = [
    ['obj', 'Identifier l’objectif de l’activité', 'Le jury veut un candidat qui « sache clairement identifier les objectifs de l’activité pratique » (2024, 2025).'],
    ['proto', 'Élaborer et justifier le protocole, choisir les appareils', '« Élaborer, justifier, conduire et exploiter un protocole expérimental » (2025).'],
    ['mes', 'Conduire la mesure : oscilloscope, analyseur, sondes', 'Maîtrise des appareils courants, de l’oscilloscope (déclenchement, couplage) et de l’analyseur de réseau (2024, 2025).'],
    ['exp', 'Exploiter les résultats', 'Exploiter les résultats « dans leur totalité et de façon rigoureuse » ; analyses trop sommaires reprochées (2024, 2025).'],
    ['mod', 'Confronter modèle, simulation et mesure', '« Corréler les résultats des simulations et des expérimentations » (2025).'],
    ['ecart', 'Quantifier les écarts et conclure', 'Mettre en évidence les écarts entre performances souhaitées, mesurées et simulées (2025).'],
    ['crit', 'Analyse critique : causes et solutions', 'Analyse critique des résultats, solutions pour réduire les écarts (2025).'],
    ['seance', 'Transposer : un protocole nouveau pour la séance', 'Au moins un protocole différent de ceux des expérimentations ; ne pas recopier les activités (2025).'],
  ];

  /* ---------- dessins ---------- */
  const svg = (W, H, s, alt) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${esc(alt || 'figure')}" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">${s}</svg>`;
  const T = (x, y, s, o) => { o = o || {}; return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${o.fs || 14}" fill="${o.c || '#183047'}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.f ? ` font-family="${o.f}"` : ''}${o.h ? ' stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"' : ''}>${s}</text>`; };
  const MONO = 'ui-monospace,Menlo,Consolas,monospace';
  // écran d'un analyseur de réseau
  function ecran(titre, L) {
    const W = 440, h = 36, H = 60 + L.length * h;
    let s = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#22313c"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="6" fill="#0e2a20"/>` + T(26, 38, titre, { fs: 14, c: '#8fd8ad', w: 700 });
    L.forEach(([l, v, u], k) => { const y = 72 + k * h; s += T(26, y, l, { fs: 16, c: '#8fd8ad' }) + T(W - 92, y, v, { fs: 22, c: '#e3ffee', a: 'end', w: 700, f: MONO }) + T(W - 84, y, u, { fs: 16, c: '#8fd8ad' }); });
    return svg(W, H, s, titre);
  }
  // petit afficheur (variateur, débitmètre, tachymètre…)
  function afficheur(titre, v, u) {
    const s = `<rect x="1" y="1" width="228" height="94" rx="10" fill="#e6ecf1" stroke="#8aa0b0"/>` + T(115, 22, titre, { fs: 13, a: 'middle', c: '#2c4352', w: 600 }) + `<rect x="14" y="32" width="202" height="50" rx="5" fill="#111a21"/>` + T(146, 68, v, { fs: 26, a: 'end', c: '#ff9a4d', w: 700, f: MONO }) + T(154, 68, u, { fs: 15, c: '#ffbf8f' });
    return `<div>${svg(230, 96, s, titre)}</div>`;
  }
  const rangee = (...L) => `<div class="tp-aff">${L.join('')}</div>`;
  // un relevé présenté comme dans un tableur (le jury demande des résultats présentés avec rigueur, au tableur)
  function tableur(titre, ent, lignes, calc) {
    const col = 'ABCDEF';
    return `<div class="tp-tab"><div class="tp-tabt">${titre}</div><table><thead><tr><th></th>${ent.map((e, j) => `<th>${col[j]}</th>`).join('')}</tr></thead><tbody><tr><td class="n">1</td>${ent.map((e) => `<td class="h">${e}</td>`).join('')}</tr>${lignes.map((L, k) => `<tr${(calc || []).includes(k) ? ' class="c"' : ''}><td class="n">${k + 2}</td>${L.map((c, j) => `<td${j === 0 ? ' class="g"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  // courbes sur quadrillage ; les morceaux hors du cadre ne sont pas tracés
  function trace(o) {
    const W = o.W || 640, H = o.H || 340, m = { l: 66, r: 20, t: 14, b: 54 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const X = (x) => m.l + (x - o.x0) / (o.x1 - o.x0) * pw, Y = (y) => m.t + (1 - (y - o.y0) / (o.y1 - o.y0)) * ph;
    let s = `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="#fff" stroke="#9fb3c2"/>`;
    const nx = Math.round((o.x1 - o.x0) / o.dx), ny = Math.round((o.y1 - o.y0) / o.dy);
    for (let i = 0; i <= nx; i++) { const x = o.x0 + i * o.dx, maj = i % (o.xmaj || 1) === 0, px = X(x).toFixed(1); s += `<line x1="${px}" x2="${px}" y1="${m.t}" y2="${m.t + ph}" stroke="${maj ? '#c3d0da' : '#e9eef2'}"/>`; if (maj) s += T(px, m.t + ph + 19, fmt(dec(x, 6), 4), { fs: 15, a: 'middle', c: '#42596b' }); }
    for (let j = 0; j <= ny; j++) { const y = o.y0 + j * o.dy, maj = j % (o.ymaj || 1) === 0, py = Y(y).toFixed(1); s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${py}" y2="${py}" stroke="${maj ? '#c3d0da' : '#e9eef2'}"/>`; if (maj) s += T(m.l - 7, +py + 5, fmt(dec(y, 6), 4), { fs: 15, a: 'end', c: '#42596b' }); }
    (o.hl || []).forEach((h) => { s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(h.y).toFixed(1)}" y2="${Y(h.y).toFixed(1)}" stroke="${h.c || '#c9483b'}" stroke-width="1.6" stroke-dasharray="7 5"/>` + (h.t ? T(m.l + pw - 6, Y(h.y) - 6, h.t, { fs: 13, a: 'end', c: h.c || '#c9483b', w: 700 }) : ''); });
    for (const c of o.curves) {
      let d = '', ouvert = false;
      for (const [x, y] of c.pts) {
        if (!(isFinite(y) && y >= o.y0 - 1e-9 && y <= o.y1 + 1e-9 && x >= o.x0 - 1e-9 && x <= o.x1 + 1e-9)) { ouvert = false; continue; }
        d += (ouvert ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); ouvert = true;
      }
      s += `<path d="${d}" fill="none" stroke="${c.c || '#12566f'}" stroke-width="${c.w || 2.4}"${c.dash ? ' stroke-dasharray="7 5"' : ''} stroke-linejoin="round"/>`;
    }
    // les étiquettes après toutes les courbes, sur un halo blanc
    for (const c of o.curves) if (c.lab) s += T(X(c.lab[0]), Y(c.lab[1]), c.lab[2], { fs: 15, a: c.lab[3] || 'start', c: c.c || '#12566f', w: 700, h: 1 });
    (o.marks || []).forEach((p) => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="5.5" fill="${p[3] || '#c9483b'}" stroke="#fff" stroke-width="1.5"/>` + (p[2] ? T(X(p[0]) + (p[4] == null ? 9 : p[4]), Y(p[1]) + (p[6] == null ? -9 : p[6]), p[2], { fs: 15, c: p[3] || '#c9483b', w: 700, a: p[5] || 'start', h: 1 }) : ''); });
    s += T(m.l + pw / 2, H - 9, o.xl || '', { fs: 15, a: 'middle' }) + `<text transform="translate(17 ${m.t + ph / 2}) rotate(-90)" font-size="15" text-anchor="middle" fill="#183047">${o.yl || ''}</text>`;
    return svg(W, H, s, o.alt || 'courbes');
  }
  // écran d'oscilloscope, 10 × 8 divisions ; une voie : f(t) en unités physiques, div (unités par division), z (zéro, en divisions depuis le centre)
  function osc(o) {
    const D = 50, x0 = 16, y0 = 14, W = 10 * D + 2 * x0, H = 8 * D + y0 + 30 + 22 * o.bas.length;
    let s = `<rect width="${W}" height="${H}" rx="12" fill="#26323b"/><rect x="${x0}" y="${y0}" width="${10 * D}" height="${8 * D}" fill="#07131b"/>`;
    for (let i = 1; i < 10; i++) s += `<line x1="${x0 + i * D}" y1="${y0}" x2="${x0 + i * D}" y2="${y0 + 8 * D}" stroke="#2e4b5d" stroke-dasharray="2 5"/>`;
    for (let j = 1; j < 8; j++) s += `<line x1="${x0}" y1="${y0 + j * D}" x2="${x0 + 10 * D}" y2="${y0 + j * D}" stroke="#2e4b5d" stroke-dasharray="2 5"/>`;
    s += `<line x1="${x0}" y1="${y0 + 4 * D}" x2="${x0 + 10 * D}" y2="${y0 + 4 * D}" stroke="#4d7489"/><line x1="${x0 + 5 * D}" y1="${y0}" x2="${x0 + 5 * D}" y2="${y0 + 8 * D}" stroke="#4d7489"/>`;
    for (let k = 1; k < 50; k++) { const x = x0 + k * D / 5; s += `<line x1="${x}" y1="${y0 + 4 * D - 3}" x2="${x}" y2="${y0 + 4 * D + 3}" stroke="#4d7489"/>`; }
    for (let k = 1; k < 40; k++) { const y = y0 + k * D / 5; s += `<line x1="${x0 + 5 * D - 3}" y1="${y}" x2="${x0 + 5 * D + 3}" y2="${y}" stroke="#4d7489"/>`; }
    o.ch.forEach((c) => {
      const zy = y0 + 4 * D - (c.z || 0) * D, N = c.n || 1500, Y = (v) => Math.max(y0 + 1, Math.min(y0 + 8 * D - 1, zy - v / c.div * D));
      let d = '';
      if (c.marche) {   // signal en créneaux : un point à chaque changement de niveau seulement
        let v0 = c.f(0); d = `M${x0} ${Y(v0).toFixed(1)}`;
        for (let i = 1; i <= N; i++) { const v = c.f(10 * o.tdiv * i / N); if (v !== v0) { const x = (x0 + 10 * D * i / N).toFixed(1); d += `L${x} ${Y(v0).toFixed(1)}L${x} ${Y(v).toFixed(1)}`; v0 = v; } }
        d += `L${x0 + 10 * D} ${Y(v0).toFixed(1)}`;
      } else for (let i = 0; i <= N; i++) d += (i ? 'L' : 'M') + (x0 + 10 * D * i / N).toFixed(1) + ' ' + Y(c.f(10 * o.tdiv * i / N)).toFixed(1);
      s += `<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w || 1.8}" stroke-linejoin="round"/><path d="M${x0 - 14} ${zy - 7}L${x0 - 2} ${zy}L${x0 - 14} ${zy + 7}Z" fill="${c.c}"/>`;
    });
    if (o.trig != null) s += `<path d="M${x0 + o.trig * D - 7} ${y0 - 12}L${x0 + o.trig * D + 7} ${y0 - 12}L${x0 + o.trig * D} ${y0 - 2}Z" fill="#f2994a"/>`;
    o.bas.forEach((b, k) => { s += T(x0, y0 + 8 * D + 26 + 22 * k, b[0], { fs: 15, c: b[1] || '#dfe8ee', w: 600 }); });
    return svg(W, H, s, o.alt || 'oscillogramme');
  }
  // spectre : barres étiquetées
  function spectre(L, o) {
    const W = 640, H = 330, m = { l: 62, r: 16, t: 28, b: 56 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const vmax = Math.max(...L.map((x) => x[1])), p = pasNet(vmax * 1.15, 6), y1 = haut(vmax * 1.15, p), Y = (y) => m.t + (1 - y / y1) * ph, sl = pw / L.length;
    let s = `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="#fff" stroke="#9fb3c2"/>`;
    for (let y = 0; y <= y1 + 1e-9; y += p) s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(y).toFixed(1)}" y2="${Y(y).toFixed(1)}" stroke="#dde6ec"/>` + T(m.l - 7, Y(y) + 5, fmt(dec(y, 6), 3), { fs: 15, a: 'end', c: '#42596b' });
    L.forEach(([r, v], k) => { const x = m.l + sl * (k + 0.5), w = sl * 0.56; s += `<rect x="${(x - w / 2).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${w.toFixed(1)}" height="${(Y(0) - Y(v)).toFixed(1)}" fill="${r === 1 ? '#12566f' : r % 3 === 0 ? '#c9483b' : '#e0a83a'}"/>` + T(x, Y(v) - 7, F(v), { fs: 17, a: 'middle', w: 700 }) + T(x, m.t + ph + 21, r, { fs: 16, a: 'middle' }); });
    s += T(m.l + pw / 2, H - 9, o.xl, { fs: 15, a: 'middle' }) + `<text transform="translate(17 ${m.t + ph / 2}) rotate(-90)" font-size="15" text-anchor="middle" fill="#183047">${o.yl}</text>`;
    return svg(W, H, s, o.alt);
  }

  /* =====================================================================
     Banc 1 — station de pompage : vanne ou variateur ?
     Pompe : H = H0·r² − a·Q² (r = n / nN) ; rendement en cloche autour de Q / (r·QN) = 1.
     Installation : H = Hg + k·Q² (hauteur géométrique Hg). Moteur : pertes fixes et pertes en charge ;
     variateur : environ 3 % de la puissance nominale.
     ===================================================================== */
  function schemaPompe() {
    const cap = (x, y, cx, cy, t) => `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" stroke="#2c4352" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="16" fill="#fff" stroke="#c9483b" stroke-width="2"/>` + T(cx, cy + 4, t, { fs: 11, a: 'middle', c: '#c9483b', w: 700 });
    let s = `<rect x="24" y="236" width="150" height="66" fill="#d6ebf6" stroke="#5b8db0" stroke-width="2"/><path d="M24 250 q19 -6 37 0 t37 0 t37 0 t39 0" fill="none" stroke="#5b8db0"/>` + T(99, 290, 'Bâche', { a: 'middle' });
    s += `<path d="M110 280 V190 H208" fill="none" stroke="#2c4352" stroke-width="6" stroke-linejoin="round"/><path d="M230 168 V64 H548" fill="none" stroke="#2c4352" stroke-width="6" stroke-linejoin="round"/>`;
    s += `<circle cx="230" cy="190" r="22" fill="#fff" stroke="#2c4352" stroke-width="3"/><path d="M221 178 L245 190 L221 202 Z" fill="#2c4352"/>` + T(258, 186, 'Pompe', { fs: 13 });
    s += `<line x1="230" y1="212" x2="230" y2="232" stroke="#2c4352" stroke-width="4"/><rect x="200" y="232" width="60" height="40" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(230, 257, 'M 3~', { a: 'middle', w: 700 });
    s += cap(160, 190, 160, 156, 'PT1') + cap(230, 120, 192, 120, 'PT2') + cap(340, 64, 340, 30, 'FT');
    s += `<path d="M430 50 L430 78 L458 64 Z M486 50 L486 78 L458 64 Z" fill="#fff" stroke="#2c4352" stroke-width="2"/><line x1="458" y1="64" x2="458" y2="40" stroke="#2c4352" stroke-width="2"/><rect x="447" y="32" width="22" height="8" fill="#2c4352"/>` + T(458, 100, 'Vanne', { a: 'middle', fs: 13 });
    s += `<rect x="548" y="34" width="76" height="98" fill="#fff" stroke="#5b8db0" stroke-width="2"/><rect x="550" y="72" width="72" height="58" fill="#d6ebf6"/>` + T(586, 152, 'Réservoir', { a: 'middle', fs: 13 });
    s += `<path d="M330 254 H260" stroke="#12566f" stroke-width="2.5" fill="none"/><rect x="330" y="228" width="136" height="52" rx="6" fill="#fff" stroke="#12566f" stroke-width="2"/>` + T(398, 250, 'KM1 : direct', { a: 'middle', fs: 13 }) + T(398, 269, 'KM2 : variateur', { a: 'middle', fs: 13 });
    s += `<path d="M466 254 H540" stroke="#12566f" stroke-width="2.5" fill="none"/>` + T(546, 250, 'Réseau', { fs: 13 }) + T(546, 268, '3 × 400 V', { fs: 13 });
    s += T(24, 20, 'FT : débitmètre · PT1, PT2 : capteurs de pression', { fs: 12, c: '#587083' });
    return svg(640, 310, s, 'Schéma de la station de pompage');
  }
  function schemaElecPompe() {
    const pt = (x, y, l, c) => `<circle cx="${x}" cy="${y}" r="14" fill="${c}"/>` + T(x, y + 5, l, { a: 'middle', c: '#fff', w: 800, fs: 15 });
    let s = T(20, 40, 'Réseau 3 × 400 V', { fs: 13 }) + `<path d="M20 60 H232" stroke="#183047" stroke-width="3" fill="none"/><rect x="150" y="44" width="40" height="32" rx="4" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(170, 65, 'Q1', { a: 'middle', fs: 13, w: 700 });
    s += `<circle cx="232" cy="60" r="4" fill="#183047"/><path d="M232 60 H590 V96" stroke="#183047" stroke-width="3" fill="none"/><path d="M232 60 V190 H590 V148" stroke="#183047" stroke-width="3" fill="none"/>`;
    s += `<rect x="290" y="44" width="56" height="32" rx="4" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(318, 65, 'KM1', { a: 'middle', fs: 13, w: 700 }) + `<rect x="262" y="174" width="56" height="32" rx="4" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(290, 195, 'KM2', { a: 'middle', fs: 13, w: 700 });
    s += `<rect x="350" y="160" width="150" height="60" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(425, 182, 'Variateur', { a: 'middle', w: 700, fs: 13 }) + T(425, 199, 'redresseur, bus continu,', { a: 'middle', fs: 11, c: '#42596b' }) + T(425, 213, 'onduleur', { a: 'middle', fs: 11, c: '#42596b' });
    s += `<circle cx="590" cy="122" r="26" fill="#fff" stroke="#183047" stroke-width="2.5"/>` + T(590, 127, 'M 3~', { a: 'middle', w: 700, fs: 13 });
    s += pt(100, 60, 'A', '#c9483b') + pt(420, 60, 'D', '#8a4513') + pt(540, 190, 'B', '#2f6f4e') + `<line x1="425" y1="220" x2="425" y2="238" stroke="#12566f" stroke-dasharray="3 3"/>` + pt(425, 252, 'C', '#587083');
    s += T(20, 118, 'KM1 fermé : moteur en direct', { fs: 12, c: '#587083' }) + T(20, 136, 'KM2 fermé : moteur sur variateur', { fs: 12, c: '#587083' });
    return svg(640, 272, s, 'Schéma de puissance et points de mesure possibles');
  }
  function genPompe() {
    const rho = 1000, g = 9.81;
    const PN = tire([0.75, 1.1, 1.5]), etaN = { 0.75: 0.78, 1.1: 0.8, 1.5: 0.82 }[PN] + al(-0.01, 0.01), nN = tire([2820, 2840, 2860, 2880]);
    const etaP = al(0.55, 0.65), HN = tire([20, 22, 24, 26, 28, 30, 32]);
    const QN = dec(al(0.84, 0.92) * PN * 1000 * etaP / (rho * g * HN) * 3600, 1);
    const Hg = HN * al(0.25, 0.45), H0 = HN * al(1.25, 1.35), aP = (H0 - HN) / (QN * QN), kR = (HN - Hg) / (QN * QN);
    const Q = dec(tire([0.5, 0.55, 0.6, 0.65, 0.7]) * QN, 1);
    const etaPo = (q) => etaP * Math.max(0.25, 2 * q - q * q);
    const LN = PN * 1000 * (1 - etaN) / etaN, PvN = 0.03 * PN * 1000 / etaN;
    const pM = (Pa, r) => LN * (0.45 * (0.35 + 0.65 * r) + 0.55 * (Pa / (PN * 1000) / r) ** 2);
    const pV = (Pm) => PvN * (0.5 + 0.5 * (Pm / (PN * 1000 / etaN)) ** 2);
    const hyd = (q, H) => rho * g * (q / 3600) * H;
    const vanne = (q) => { const H = H0 - aP * q * q, Pa = hyd(q, H) / etaPo(q / QN); return { H, P: Pa + pM(Pa, 1) }; };
    const vitesse = (q) => { const H = Hg + kR * q * q, r = Math.sqrt((H + aP * q * q) / H0), Pa = hyd(q, H) / etaPo(q / QN / r), Pm = Pa + pM(Pa, r); return { H, r, P: Pm + pV(Pm) }; };
    const nom = vitesse(QN), V = vanne(Q), S = vitesse(Q);
    // ce qu'affichent les appareils
    const U = () => dec(al(397, 404), 1);
    const dpN = dec(rho * g * HN / 1e5 * bruit(1, 0.003), 2), P1N = Math.round(bruit(nom.P, 0.004));
    const dpV = dec(rho * g * V.H / 1e5 * bruit(1, 0.003), 2), P1V = Math.round(bruit(V.P, 0.004)), lamV = dec(al(0.7, 0.82), 2), UV = U();
    const f = dec(50 * S.r * bruit(1, 0.002), 1), lamS = dec(al(0.55, 0.68), 2), US = U();
    const E3 = essais(S.P, Math.round), P1S = E3.L[0], Pmoy = E3.m;
    // réponses, calculées sur les valeurs affichées
    const Ph = dpV * 1e5 * Q / 3600, etaG = Ph / P1V * 100;
    const E = (P1V - P1S) / P1V * 100;
    const veut = Math.random() < 0.55, cand = [25, 30, 35, 40, 45, 50, 55, 60, 65];
    let Ls = cand.filter((x) => (veut ? x <= E - 3 : x >= E + 3)); if (!Ls.length) Ls = cand.filter((x) => Math.abs(x - E) >= 3);
    const seuil = tire(Ls), okE = E >= seuil;
    const Pmod = P1N * (Q / QN) ** 3, ecM = Math.abs(P1S - Pmod) / Pmod * 100;
    const dedans = Math.random() < 0.5, delta = dedans ? al(0.1, 0.45) * E3.disp : E3.disp + al(1.5, 4);
    const Psim = Math.round(Pmoy / (1 + (Math.random() < 0.5 ? 1 : -1) * delta / 100)), ecS = Math.abs(Pmoy - Psim) / Psim * 100;
    // les courbes hauteur-débit
    const dq = pasNet(1.2 * QN, 6), x1 = haut(1.2 * QN, dq), y1 = haut(H0 * 1.1, 5);
    const qs = (a, b) => Array.from({ length: 121 }, (_, k) => a + (b - a) * k / 120);
    const figHQ = trace({ x0: 0, x1, dx: dq / 2, xmaj: 2, y0: 0, y1, dy: 1, ymaj: 5, xl: 'Débit Q (m³/h)', yl: 'Hauteur H (m)', alt: 'Courbes hauteur-débit de la pompe et de l’installation',
      curves: [
        { pts: qs(0, x1).map((q) => [q, H0 - aP * q * q]), c: '#12566f', lab: [0.02 * x1, H0 + 1.2, `pompe à ${F(nN, 4)} tr/min`] },
        { pts: qs(0, x1).map((q) => [q, H0 * S.r * S.r - aP * q * q]), c: '#2f8f4e', lab: [0.02 * x1, H0 * S.r * S.r + 1.2, `pompe à ${F(f)} Hz`] },
        { pts: qs(0, x1).map((q) => [q, Hg + kR * q * q]), c: '#8a4513', w: 2.8, lab: [0.98 * x1, Math.min(y1 - 1, Hg + kR * x1 * x1) - 1.5, 'installation', 'end'] },
        { pts: qs(0, x1).map((q) => [q, HN * (q / QN) ** 2]), c: '#c9483b', dash: 1, lab: [0.62 * x1, 0.22 * y1, 'parabole de similitude'] },
      ],
      marks: [[QN, HN, 'N', '#12566f', 9, 'start', 18], [Q, V.H, 'vanne', '#12566f'], [Q, S.H, 'variateur', '#2f8f4e', 9, 'start', 18]] });
    const intro = `<p><b>Le banc.</b> Une pompe centrifuge remonte l’eau d’une bâche vers un réservoir placé en hauteur. Le moteur asynchrone (${F(PN)} kW, ${F(nN, 4)} tr/min) est alimenté soit en direct (contacteur KM1), soit par un variateur de vitesse (KM2). Un débitmètre et deux capteurs de pression mesurent le débit et la différence de pression Δp créée par la pompe.</p>
      <p><b>La problématique.</b> Le client veut réduire le débit à ${F(Q)} m³/h au lieu de ${F(QN)} m³/h. Faut-il fermer en partie la vanne, ou baisser la vitesse avec le variateur ?</p>
      <p><b>Le cahier des charges.</b> Au débit réduit, la solution variateur doit absorber au réseau au moins ${seuil} % de puissance de moins que la solution vanne.</p>`;
    const qsL = [
      { t: 'L’objectif de la mesure', lab: 'Identifier l’objectif', text: '<p>Avant de brancher quoi que ce soit, le jury attend que tu dises ce que tu vas mesurer, et dans quelles conditions.</p>', fig: schemaPompe(),
        fields: [choix('Grandeur à mesurer', 'La puissance active absorbée au réseau', ['Le courant absorbé par le moteur', 'La puissance hydraulique fournie à l’eau', 'Le rendement de la pompe seule'], 'obj'),
          choix('Pour comparer les deux solutions', 'Au même débit', ['À la même vitesse du moteur', 'À la même pression de refoulement', 'À la même fréquence d’alimentation'], 'obj')],
        corr: `Le cahier des charges parle de puissance <b>absorbée au réseau</b> : c’est elle que le client paie. On compare les deux solutions <b>au même débit</b> (${F(Q)} m³/h), puisque c’est le service demandé. À la même vitesse ou à la même pression, les deux solutions ne donneraient plus le même débit : la comparaison n’aurait pas de sens.`,
        hint: 'Relis le cahier des charges : qu’est-ce que le client paie, et qu’est-ce qu’il veut obtenir ?' },
      { t: 'Le point de mesure et l’appareil', lab: 'Élaborer le protocole', text: '<p>Voici le schéma de puissance. Le même appareil doit servir pour les deux solutions.</p>', fig: schemaElecPompe(),
        fields: [choix('Point de mesure', 'A : en tête, avant les deux départs', ['B : entre le variateur et le moteur', 'C : sur le bus continu du variateur', 'D : sur la ligne directe, après KM1'], 'proto'),
          choix('Appareil', 'Un analyseur de réseau triphasé : trois tensions, trois pinces de courant, mesures TRMS', ['Un multimètre en ampèremètre sur une phase, puis P = √3·U·I', 'Une pince ampèremétrique, puis P = √3·U·I·cos φ avec le cos φ de la plaque', 'Un wattmètre monophasé sur une seule phase, résultat multiplié par 3'], 'proto')],
        corr: `<b>Point A</b> : c’est le seul point traversé par l’énergie des deux solutions, et il compte les pertes du variateur. En B, on les oublierait ; en D, on ne voit que la solution vanne ; en C, ni la ligne directe ni le réseau. <b>Pourquoi un analyseur ?</b> Le redresseur du variateur ne prend du courant qu’au sommet de la tension : le courant est déformé, et P n’est plus égale à √3·U·I·cos φ. Le cos φ de la plaque ne vaut que pour le moteur en direct, à pleine charge. L’analyseur calcule P comme la moyenne du produit u·i, échantillon par échantillon, sur les trois phases : il reste juste avec des harmoniques et un déséquilibre.`,
        hint: 'Quel point voit passer l’énergie dans les deux solutions ? Le courant absorbé par un variateur est-il sinusoïdal ?' },
      { t: 'Solution vanne : le rendement global', lab: 'Conduire la mesure · exploiter', text: `<p>Moteur en direct (KM1), vanne réglée pour obtenir ${F(Q)} m³/h. Voici l’analyseur au point A et les afficheurs du banc.</p><p>Rappel : la puissance hydraulique vaut P<sub>h</sub> = Δp · Q, avec Δp en pascals et Q en m³/s (1 bar = 10<sup>5</sup> Pa).</p>`,
        fig: ecran('Analyseur · point A · KM1 fermé', [['U12', F(UV, 4), 'V'], ['I1', F(P1V / (Math.sqrt(3) * UV * lamV)), 'A'], ['P (3 phases)', F(P1V, 4), 'W'], ['λ', F(lamV), '']]) + rangee(afficheur('Débitmètre FT', F(Q), 'm³/h'), afficheur('Δp pompe (PT2 − PT1)', F(dpV), 'bar')),
        fields: [num('Puissance hydraulique P<sub>h</sub>', Ph, 'W', 'exp'), num('Rendement global η = P<sub>h</sub> / P', etaG, '%', 'exp')],
        corr: `P<sub>h</sub> = Δp · Q = ${F(dpV)} × 10<sup>5</sup> × ${F(Q)} / 3 600 = <b>${F(Ph)} W</b>. η = P<sub>h</sub> / P = ${F(Ph)} / ${F(P1V, 4)} = <b>${F(etaG)} %</b>. ${etaG < 50 ? 'Plus de la moitié' : 'Une grande part'} de l’énergie payée est perdue : dans le moteur, dans la pompe, et surtout dans la vanne, qui « brûle » de la pression pour freiner l’eau.`,
        hint: 'Convertis d’abord : Δp en pascals, Q en m³/s.' },
      { t: 'Solution variateur : l’économie', lab: 'Exploiter les résultats', text: `<p>Vanne grande ouverte, le variateur (KM2) baisse la vitesse jusqu’à retrouver ${F(Q)} m³/h. Le relevé de la solution vanne est dans le tableur.</p>`,
        fig: tableur('Relevés au point A', ['Solution', 'Q (m³/h)', 'P (W)'], [['Vanne', F(Q), F(P1V, 4)], ['Variateur', F(Q), '?']]) + ecran('Analyseur · point A · KM2 fermé', [['U12', F(US, 4), 'V'], ['I1', F(P1S / (Math.sqrt(3) * US * lamS)), 'A'], ['P (3 phases)', F(P1S, 4), 'W'], ['λ', F(lamS), '']]) + rangee(afficheur('Variateur', F(f), 'Hz')),
        fields: [num('Économie E = (P<sub>vanne</sub> − P<sub>variateur</sub>) / P<sub>vanne</sub>', E, '%', 'exp', { abs: 1 }), choix(`Le cahier des charges (au moins ${seuil} %) est-il tenu ?`, okE ? 'Oui' : 'Non', [okE ? 'Non' : 'Oui'], 'ecart')],
        corr: `E = (${F(P1V, 4)} − ${F(P1S, 4)}) / ${F(P1V, 4)} = <b>${F(E)} %</b>. ${okE ? `C’est au moins ${seuil} % : le cahier des charges est tenu.` : `C’est moins de ${seuil} % : le cahier des charges n’est pas tenu.`} Le variateur gagne parce que la pompe ne fabrique plus la pression que la vanne gaspillait. Regarde aussi λ = ${F(lamS)} : le courant absorbé par le variateur est déformé, c’est pour cela qu’il fallait un analyseur.`,
        hint: 'L’économie, c’est ce qu’on ne paie plus, rapporté à ce qu’on payait avec la vanne.' },
      { t: 'Le modèle en Q³ de la notice', lab: 'Confronter modèle et mesure', text: '<p>La notice du variateur annonce : « avec une pompe centrifuge, la puissance varie comme le cube du débit ». Le tableur donne le point nominal, relevé à 50 Hz, vanne ouverte, et ta mesure au débit réduit.</p>',
        fig: tableur('Relevés au point A', ['Essai', 'Q (m³/h)', 'Δp (bar)', 'P (W)'], [['Nominal, 50 Hz', F(QN), F(dpN), F(P1N, 4)], [`Variateur, ${F(f)} Hz`, F(Q), F(dpS(S, rho, g)), F(P1S, 4)]]),
        fields: [num('Puissance prévue par le modèle P<sub>mod</sub> = P<sub>N</sub> · (Q / Q<sub>N</sub>)³', Pmod, 'W', 'mod'), num('Écart relatif |P<sub>mesurée</sub> − P<sub>mod</sub>| / P<sub>mod</sub>', ecM, '%', 'ecart')],
        corr: `P<sub>mod</sub> = ${F(P1N, 4)} × (${F(Q)} / ${F(QN)})³ = <b>${F(Pmod)} W</b>. Écart = |${F(P1S, 4)} − ${F(Pmod)}| / ${F(Pmod)} = <b>${F(ecM)} %</b>. Un tel écart dépasse de très loin la dispersion d’une mesure : le modèle est mis en défaut. Il faut chercher l’hypothèse qui ne tient pas (question suivante).`,
        hint: 'Rapport des débits, au cube, multiplié par la puissance nominale.' },
      { t: 'Pourquoi le modèle se trompe', lab: 'Analyse critique', text: '<p>Voici les courbes hauteur-débit : la pompe à vitesse nominale et à vitesse réduite, la courbe de l’installation, et la parabole de similitude, celle que suppose le modèle en Q³.</p>', fig: figHQ,
        fields: [num('Hauteur géométrique H<sub>g</sub>, lue sur la courbe de l’installation à débit nul', Hg, 'm', 'crit', { abs: 1 }),
          choix('La cause principale de l’écart', 'La hauteur géométrique : il faut monter l’eau même à débit nul, donc la vitesse ne baisse pas comme le débit', ['L’imprécision du débitmètre', 'Les pertes du variateur, qui doublent à vitesse réduite', 'La cavitation de la pompe à faible débit'], 'crit')],
        corr: `À débit nul, l’installation demande déjà <b>${F(Hg, 2)} m</b> : c’est la hauteur à laquelle il faut monter l’eau. Le modèle en Q³ suppose une installation dont la courbe est une parabole passant par l’origine (pointillés rouges) : le long de cette courbe, débit et vitesse baissent ensemble et la puissance suit le cube. Ici, pour garder ${F(Q)} m³/h, la pompe doit encore fournir ${F(S.H, 2)} m au lieu des ${F(HN * (Q / QN) ** 2, 2)} m de la parabole : la vitesse ne descend qu’à ${F(f)} Hz, soit ${F(f * 2, 2)} % de la nominale, alors que le débit tombe à ${F(100 * Q / QN, 2)} %. Le bon modèle, c’est le point de fonctionnement : l’intersection de la courbe de la pompe à vitesse réduite et de la courbe de l’installation.`,
        hint: 'Regarde où la courbe de l’installation coupe l’axe des hauteurs, puis compare-la à la parabole de similitude.' },
      { t: 'Mesure et simulation : un écart réel ?', lab: 'Confronter simulation et mesure', text: `<p>Tu refais trois fois la mesure (solution variateur). Le logiciel de sélection du constructeur, qui tient compte de la courbe de l’installation, simule <b>P<sub>sim</sub> = ${F(Psim, 4)} W</b> au point A.</p><p>Un écart ne se commente comme réel que s’il dépasse la dispersion des essais.</p>`,
        fig: tableur('Essais · solution variateur', ['Essai', 'P au point A (W)'], [['1', F(E3.L[0], 4)], ['2', F(E3.L[1], 4)], ['3', F(E3.L[2], 4)], ['Écart max à la moyenne', `± ${F(E3.disp)} %`], ['Simulation', F(Psim, 4)]], [3]),
        fields: [num('Puissance moyenne mesurée P<sub>moy</sub>', Pmoy, 'W', 'exp', { tol: 0.004, abs: 1.5 }), num('Écart relatif |P<sub>moy</sub> − P<sub>sim</sub>| / P<sub>sim</sub>', ecS, '%', 'ecart', { tol: 0.05, abs: 0.15 }),
          choix('Conclusion', dedans ? 'L’écart reste dans la dispersion : les essais ne mettent pas la simulation en défaut' : 'L’écart dépasse la dispersion : il est réel, il faut l’expliquer', [dedans ? 'L’écart dépasse la dispersion : il est réel, il faut l’expliquer' : 'L’écart reste dans la dispersion : les essais ne mettent pas la simulation en défaut', 'On ne peut rien conclure sans refaire dix essais'], 'ecart')],
        corr: `P<sub>moy</sub> = (${E3.L.map((x) => F(x, 4)).join(' + ')}) / 3 = <b>${F(Pmoy, 4)} W</b>. Écart = |${F(Pmoy, 4)} − ${F(Psim, 4)}| / ${F(Psim, 4)} = <b>${F(ecS, 2)} %</b>, à comparer à la dispersion des essais : ± ${F(E3.disp)} %. ${dedans ? 'L’écart est plus petit que la dispersion : les essais ne mettent pas la simulation en défaut. Le modèle qui tient compte de l’installation est validé par la mesure.' : 'L’écart dépasse la dispersion : il est réel. Pistes : un rendement de pompe ou de moteur un peu différent de celui du logiciel, ou une hauteur géométrique qui a changé avec le niveau de la bâche et du réservoir.'}`,
        hint: 'Compare ton écart au « ± » du tableur.' },
      { t: 'Aller plus loin, puis la séance', lab: 'Réduire l’écart · transposer en séance', text: '<p>Deux décisions pour finir : comment économiser encore au débit réduit, et quel protocole nouveau donner aux étudiants de BTS Électrotechnique pendant ta séance. Le jury attend un protocole différent de ceux de l’expérimentation.</p>', fig: schemaPompe(),
        fields: [choix('Pour économiser encore au débit réduit', 'Une pompe dont le meilleur rendement tombe près du débit réduit, et un moteur à haut rendement (IE3 ou IE4)', ['Fermer un peu la vanne en plus du variateur', 'Augmenter la fréquence de découpage du variateur', 'Prendre un moteur plus puissant'], 'crit'),
          choix('Protocole nouveau pour la séance', 'Relever P au point A pour cinq débits, vanne puis variateur, tracer les deux courbes et chiffrer l’économie sur une journée de fonctionnement', ['Refaire la mesure au débit réduit, comme dans l’expérimentation', 'Mesurer la tension entre le variateur et le moteur au multimètre ordinaire', 'Ouvrir le variateur pour mesurer le bus continu sous tension'], 'seance')],
        corr: 'Fermer la vanne en plus du variateur recrée des pertes de charge ; une fréquence de découpage plus haute augmente les pertes du variateur ; un moteur surdimensionné travaille à faible charge, là où son rendement baisse. Ce qui marche : faire travailler la pompe près de son meilleur rendement et réduire les pertes du moteur. Pour la séance, cinq débits et deux courbes font travailler toute la démarche : choix des points, tracé, lecture, calcul d’une énergie. Refaire la mesure de l’expérimentation n’apporte rien ; le multimètre ordinaire se trompe sur une tension découpée ; intervenir sous tension sur le bus continu est dangereux, il reste chargé plusieurs minutes après la coupure.',
        figC: trace({ x0: 0, x1, dx: dq / 2, xmaj: 2, y0: 0, y1: haut(V.P * 1.25, pasNet(V.P * 1.25, 6)), dy: pasNet(V.P * 1.25, 6) / 2, ymaj: 2, xl: 'Débit Q (m³/h)', yl: 'P au point A (W)', alt: 'Puissance absorbée en fonction du débit',
          curves: [{ pts: qs(0.35 * QN, QN).map((q) => [q, vanne(q).P]), c: '#12566f', lab: [0.36 * QN, vanne(0.35 * QN).P + 0.06 * V.P, 'vanne'] }, { pts: qs(0.35 * QN, QN).map((q) => [q, vitesse(q).P]), c: '#2f8f4e', lab: [0.36 * QN, vitesse(0.35 * QN).P - 0.1 * V.P, 'variateur'] }],
          marks: [[Q, V.P, '', '#12566f'], [Q, S.P, '', '#2f8f4e']] }),
        legC: 'Ce que donnerait ce protocole (simulation du banc) : l’écart entre les deux courbes, c’est l’économie, plus grande aux faibles débits.' },
    ];
    const bilan = [`Débit réduit à ${F(Q)} m³/h (nominal ${F(QN)} m³/h). Puissance au point A : ${F(P1V, 4)} W avec la vanne, ${F(Pmoy, 4)} W en moyenne avec le variateur (${F(f)} Hz).`,
      `Économie mesurée : ${F(E)} % ; cahier des charges : au moins ${seuil} % : ${okE ? 'tenu' : 'non tenu'}.`,
      `Modèle en Q³ de la notice : ${F(Pmod)} W prévus, écart de ${F(ecM)} % avec la mesure : modèle mis en défaut par la hauteur géométrique (${F(Hg, 2)} m), qui empêche la vitesse de baisser comme le débit.`,
      `Simulation du constructeur avec la courbe de l’installation : ${F(Psim, 4)} W, écart de ${F(ecS, 2)} % pour une dispersion des essais de ± ${F(E3.disp)} % : ${dedans ? 'simulation non mise en défaut' : 'écart réel à expliquer (rendements, niveaux d’eau)'}.`,
      'Solutions : pompe dont le meilleur rendement est au débit réduit, moteur IE3 ou IE4 ; ne pas cumuler vanne et variateur.'];
    return { intro, bilan, prob: `Faut-il réduire le débit de ${F(QN)} à ${F(Q)} m³/h avec la vanne ou avec le variateur ? Cahier des charges : au moins ${seuil} % de puissance absorbée en moins avec le variateur.`, qs: qsL };
  }
  // Δp affiché pour un point de fonctionnement du variateur
  const dpS = (S, rho, g) => dec(rho * g * S.H / 1e5, 2);

  /* =====================================================================
     Banc 2 — monte-charge : variateur et glissement
     Moteur asynchrone 4 pôles en loi U/f : à couple donné, la fréquence de glissement ne dépend pas de f.
     ===================================================================== */
  function schemaMonte() {
    let s = T(16, 30, 'Réseau', { fs: 13 }) + `<path d="M16 50 H70" stroke="#183047" stroke-width="3"/><rect x="70" y="26" width="110" height="48" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(125, 55, 'Variateur', { a: 'middle', w: 700, fs: 13 });
    s += `<path d="M180 38 H300 M180 50 H300 M180 62 H300" stroke="#183047" stroke-width="2"/>` + T(286, 34, 'U', { fs: 12, w: 700 }) + T(286, 47, 'V', { fs: 12, w: 700 }) + T(286, 74, 'W', { fs: 12, w: 700 });
    s += `<rect x="300" y="24" width="70" height="52" rx="6" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(335, 55, 'M 3~', { a: 'middle', w: 700, fs: 13 });
    s += `<line x1="370" y1="50" x2="420" y2="50" stroke="#183047" stroke-width="4"/><rect x="420" y="30" width="74" height="40" rx="5" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(457, 55, 'réducteur', { a: 'middle', fs: 12 });
    s += `<line x1="494" y1="50" x2="516" y2="50" stroke="#183047" stroke-width="4"/><circle cx="540" cy="50" r="24" fill="#fff" stroke="#183047" stroke-width="2.5"/>` + T(508, 98, 'tambour', { a: 'end', fs: 12 });
    s += `<line x1="564" y1="50" x2="564" y2="196" stroke="#587083" stroke-width="2"/><rect x="516" y="196" width="96" height="74" rx="4" fill="#f4ede4" stroke="#8a4513" stroke-width="2"/>` + T(564, 228, 'cabine', { a: 'middle', fs: 13, w: 700 }) + T(564, 248, '+ charge', { a: 'middle', fs: 12 });
    s += `<path d="M395 50 L392 96" stroke="#c9483b" stroke-dasharray="4 3"/>` + T(392, 112, 'tachymètre', { a: 'middle', fs: 12, c: '#c9483b' });
    // oscilloscope relié à la terre
    s += `<rect x="40" y="160" width="190" height="120" rx="8" fill="#26323b"/><rect x="52" y="172" width="120" height="84" fill="#07131b"/><path d="M58 214 q14 -30 28 0 t28 0 t28 0" fill="none" stroke="#f2c94c" stroke-width="2"/>` + T(200, 196, 'CH1', { a: 'middle', fs: 11, c: '#f2c94c', w: 700 }) + T(200, 236, 'CH2', { a: 'middle', fs: 11, c: '#56ccf2', w: 700 });
    s += `<path d="M135 280 V300 M120 300 H150 M125 306 H145 M131 312 H139" stroke="#183047" stroke-width="2"/>` + T(160, 308, 'terre', { fs: 12, c: '#587083' });
    s += `<path d="M230 192 C 270 192 250 120 240 62" fill="none" stroke="#f2c94c" stroke-width="2" stroke-dasharray="5 4"/>` + T(250, 132, 'sonde ?', { fs: 12, c: '#b8860b', w: 700 });
    s += `<ellipse cx="220" cy="38" rx="9" ry="14" fill="none" stroke="#56ccf2" stroke-width="3"/><path d="M230 232 C 300 232 300 110 222 52" fill="none" stroke="#56ccf2" stroke-width="2" stroke-dasharray="5 4"/>` + T(306, 168, 'capteur de courant ?', { fs: 12, c: '#2d9cdb', w: 700 });
    return svg(640, 320, s, 'Schéma du monte-charge et de la mesure à l’oscilloscope');
  }
  function genMonte() {
    const p = 2, PN = tire([0.37, 0.55, 0.75]), nN = tire([1380, 1395, 1410, 1425]), gN = (1500 - nN) / 1500, De = 1500 - nN;
    const c = al(0.7, 1), fc = tire([40, 45, 50]);
    const n = Math.round(60 * (fc - c * gN * 50) / p + al(-1.5, 1.5));
    const ns = 60 * fc / p, g = (ns - n) / ns * 100;
    const i = tire([20, 25, 30]), D = tire([0.1, 0.12, 0.14]), h = tire([2.4, 2.8, 3.2, 3.6]);
    const tacc = tire([2, 3, 4]), tr = tacc * fc / 50;
    const v = n / i * Math.PI * D / 60, tm = tr / 2 + h / v;
    const v0 = ns / i * Math.PI * D / 60, tmod = tr / 2 + h / v0, ecT = Math.abs(tm - tmod) / tmod * 100;
    let ok = Math.random() < 0.5; if (tm - tmod < 0.45) ok = true;
    let Tmax = ok ? dec(tm + al(0.25, 0.8), 1) : dec(al(tmod + 0.05, tm - 0.2), 1);
    if (!ok && (Tmax > tm - 0.15 || Tmax < tmod)) { ok = true; Tmax = dec(tm + al(0.25, 0.8), 1); }
    const fg = fc - p * n / 60, fp = fc + fg;
    // courant : nominal d'après la plaque, puis selon la charge (magnétisant + actif)
    const etaM = { 0.37: 0.7, 0.55: 0.73, 0.75: 0.76 }[PN], cosN = { 0.37: 0.72, 0.55: 0.75, 0.75: 0.77 }[PN];
    const IN = PN * 1000 / (Math.sqrt(3) * 400 * etaM * cosN), I = IN * Math.sqrt(0.62 ** 2 + (c * 0.785) ** 2) * bruit(1, 0.01), Ipk = I * Math.SQRT2;
    const Adiv = [0.25, 0.5, 1].find((a) => Ipk / a <= 2.6) || 1, mV = Adiv * 100;
    const phi = Math.acos(Math.min(0.85, 0.42 + 0.35 * c)), w = 2 * Math.PI * fc, tdiv = 0.005, tT = tdiv, m = 0.9 * fc / 50, fdec = 2000, Udc = 565;
    const u12 = (t) => { const x = (t * fdec) % 1, car = x < 0.5 ? 4 * x - 1 : 3 - 4 * x, th = w * (t - tT) + phi; return Udc * ((m * Math.sin(th) > car ? 1 : 0) - (m * Math.sin(th - 2 * Math.PI / 3) > car ? 1 : 0)); };
    const i1 = (t) => { const x = (t * fdec) % 1; return Ipk * Math.sin(w * (t - tT)) + 0.03 * Ipk * (x < 0.5 ? 4 * x - 1 : 3 - 4 * x); };
    const figOsc = osc({ tdiv, trig: 1, alt: 'Oscillogramme de la tension U12 et du courant i1',
      ch: [{ f: u12, div: 500, z: 2.7, c: '#f2c94c', marche: 1, n: 20000, w: 1.2 }, { f: i1, div: Adiv, z: -1.25, c: '#56ccf2', n: 1500, w: 2 }],
      bas: [['CH1 : 500 V/div · sonde différentielle · U12', '#f2c94c'], [`CH2 : ${F(mV)} mV/div · pince 100 mV/A · i1`, '#56ccf2'], ['Base de temps : 5 ms/div', '#dfe8ee']] });
    const Tp = 1000 / fc, Tdiv = Tp / 5;
    // vitesse au démarrage, relevée par le codeur
    const tfin = tr + 2.5, dyn = pasNet(1.15 * ns, 6);
    const pts = Array.from({ length: 241 }, (_, k) => { const t = tfin * k / 240; return [t, (t < tr ? n * t / tr : n) * (1 + al(-0.003, 0.003))]; });
    const figN = trace({ x0: 0, x1: haut(tfin, 1), dx: 0.5, xmaj: 2, y0: 0, y1: haut(1.15 * ns, dyn), dy: dyn / 5, ymaj: 5, xl: 'Temps t (s)', yl: 'Vitesse moteur n (tr/min)', alt: 'Vitesse du moteur au démarrage', curves: [{ pts, c: '#12566f' }] });
    // couple-vitesse, sans et avec compensation de glissement
    const nsp = ns + (ns - n), xa = ns - 2.2 * De, xb = nsp + 0.5 * De, dxv = pasNet(xb - xa, 6), X0 = Math.floor(xa / dxv) * dxv, X1 = haut(xb, dxv);
    const lin = (n0) => Array.from({ length: 41 }, (_, k) => { const x = n0 - 1.7 * De + 1.7 * De * k / 40; return [x, 100 * (n0 - x) / De]; });
    const figTn = trace({ x0: X0, x1: X1, dx: dxv / 2, xmaj: 2, y0: 0, y1: 170, dy: 10, ymaj: 5, xl: 'Vitesse n (tr/min)', yl: 'Couple (% du nominal)', alt: 'Caractéristiques couple-vitesse du moteur',
      curves: [{ pts: lin(ns), c: '#12566f', lab: [ns - 1.65 * De, 158, `${F(fc)} Hz`] }, { pts: lin(nsp), c: '#2f8f4e', lab: [nsp - 0.6 * De, 158, `${F(fp)} Hz`, 'start'] }, { pts: [[X0, 100 * c], [X1, 100 * c]], c: '#8a4513', dash: 1, lab: [X0 + 0.05 * dxv, 100 * c + 7, 'couple de la charge'] }],
      marks: [[n, 100 * c, 'mesuré', '#12566f', -9, 'end', 22], [ns, 100 * c, 'compensé', '#2f8f4e', 9, 'start', -9]] });
    const pM = pasNet(1.8 * De, 4);
    const figNc = trace({ x0: 0, x1: 100, dx: 10, xmaj: 2, y0: Math.floor((ns - 1.4 * De) / pM) * pM, y1: haut(ns + 0.4 * De, pM), dy: pM / 5, ymaj: 5, xl: 'Charge (% du couple nominal)', yl: 'Vitesse n (tr/min)', alt: 'Vitesse en fonction de la charge',
      curves: [{ pts: [[0, ns], [100, ns - De]], c: '#12566f', lab: [4, ns - 0.82 * De, 'sans compensation'] }, { pts: [[0, ns], [100, ns]], c: '#2f8f4e', lab: [4, ns + 0.12 * De, 'avec compensation'] }] });
    const plaque = svg(300, 96, `<rect x="1" y="1" width="298" height="94" rx="6" fill="#f2f4f5" stroke="#8aa0b0"/>` + T(150, 24, 'Moteur asynchrone triphasé', { a: 'middle', fs: 13, w: 700 }) + T(150, 48, `${F(PN)} kW · 230/400 V · 50 Hz`, { a: 'middle', fs: 13 }) + T(150, 70, `${F(nN, 4)} tr/min · cos φ ${F(cosN)} · ${F(IN)} A`, { a: 'middle', fs: 13 }), 'Plaque signalétique du moteur');
    const intro = `<p><b>Le banc.</b> Un monte-charge : variateur de vitesse, moteur asynchrone (${F(PN)} kW, ${F(nN, 4)} tr/min à 50 Hz), réducteur de rapport 1/${i}, tambour de ${F(D)} m de diamètre. Course de la cabine : ${F(h)} m. Variateur réglé à ${F(fc)} Hz, en loi U/f, sans compensation de glissement.</p>
      <p><b>La problématique.</b> Avec la charge maximale, la cabine monte-t-elle assez vite ? Le bureau d’études l’a affirmé en calculant avec la vitesse de synchronisme.</p>
      <p><b>Le cahier des charges.</b> Temps de montée, charge maximale, au plus ${F(Tmax)} s.</p>`;
    const qsL = [
      { t: 'L’objectif de la mesure', lab: 'Identifier l’objectif', text: '<p>Le jury attend d’abord que tu dises ce que tu vas vérifier, et dans quel cas.</p>', fig: schemaMonte(),
        fields: [choix('Performance à vérifier', 'Le temps de montée de la cabine sur toute la course', ['Le courant de démarrage du moteur', 'La tension de sortie du variateur', 'La température du moteur après dix cycles'], 'obj'),
          choix('Dans quel cas ?', 'Charge maximale, en montée : le cas le plus défavorable', ['Cabine vide, en montée', 'À mi-charge, en montée', 'Charge maximale, en descente'], 'obj')],
        corr: 'Le cahier des charges fixe un temps de montée : c’est la performance à vérifier, dans le cas le plus défavorable, charge maximale et en montée. Pourquoi la charge compte : plus le couple demandé est grand, plus le moteur asynchrone glisse, donc plus il tourne lentement à fréquence égale. En descente, la charge entraîne le moteur : ce n’est pas le cas du cahier des charges.',
        hint: 'Que fixe le cahier des charges ? Dans quel cas le moteur est-il le plus lent ?' },
      { t: 'Brancher l’oscilloscope', lab: 'Élaborer le protocole', text: '<p>Tu veux voir la tension entre deux phases du moteur et le courant d’une phase. L’oscilloscope est relié à la terre par sa prise.</p>', fig: schemaMonte(),
        fields: [choix('Pour la tension U12', 'Une sonde différentielle haute tension, l’oscilloscope restant relié à la terre', ['Une sonde 1/10 ordinaire, sa pince de masse sur une phase', 'Une sonde 1/10 ordinaire, après avoir retiré la terre de l’oscilloscope', 'Le multimètre en voltmètre alternatif, à la place de l’oscilloscope'], 'proto'),
          choix('Pour le courant i1', 'Une pince de courant à effet Hall autour d’un seul conducteur de phase', ['Une pince autour du câble moteur entier, les trois phases', 'Un shunt dans la phase, relié à la masse de l’oscilloscope', 'La pince ampèremétrique du multimètre, branchée sur l’oscilloscope'], 'proto')],
        corr: 'La masse d’une sonde ordinaire est reliée à la terre par l’oscilloscope : posée sur une phase, elle fait un court-circuit phase-terre. Retirer la terre de l’oscilloscope est interdit : sa carcasse serait au potentiel de la phase. La sonde différentielle mesure entre ses deux pointes, isolée de la terre : c’est l’outil prévu. Pour le courant, la pince à effet Hall passe le continu et le découpage et donne une tension proportionnelle au courant (ici 100 mV/A). Autour des trois phases, elle mesurerait la somme des trois courants, presque nulle. Un shunt relié à la masse ramène le problème de la sonde ordinaire. Et le multimètre ne montre ni la forme d’onde ni le découpage.',
        hint: 'Où va la masse d’une sonde ordinaire ? Que vaut la somme des trois courants d’un moteur ?' },
      { t: 'Lire l’oscillogramme', lab: 'Conduire la mesure', text: '<p>Montée avec la charge maximale, vitesse établie. CH1 : tension U12, CH2 : courant i1. Les réglages sont sous l’écran ; le petit triangle à gauche de chaque voie marque son zéro.</p>', fig: figOsc,
        fields: [choix('Source de déclenchement pour une image stable', 'CH2, le courant presque sinusoïdal, front montant, niveau près de 0', ['CH1, la tension découpée, front montant', 'Le mode monocoup', 'Aucune : l’image se stabilise seule'], 'mes'),
          num('Fréquence f du courant', fc, 'Hz', 'mes', { tol: 0.04 }), num('Valeur efficace I du courant', I, 'A', 'mes', { tol: 0.07 })],
        corr: `Sur la tension découpée, le déclenchement partirait sur n’importe quel front de découpage : l’image danserait. Le courant, lissé par les inductances du moteur, ne passe par zéro en montant qu’une fois par période : c’est la bonne source. Le mode monocoup sert à saisir un phénomène unique, pas un signal périodique. Période : ${F(Tdiv)} divisions × 5 ms = ${F(Tp)} ms, donc f = 1 / T = <b>${F(fc)} Hz</b>. Sensibilité : ${F(mV)} mV/div pour 100 mV/A, soit ${F(Adiv)} A/div. Crête : ${F(Ipk / Adiv)} divisions × ${F(Adiv)} A = ${F(Ipk)} A, donc I = I<sub>max</sub> / √2 = <b>${F(I)} A</b> (le courant est presque sinusoïdal, la relation tient).`,
        hint: 'Compte les divisions d’une période du courant ; pour l’amplitude, convertis d’abord les mV/div en A/div.' },
      { t: 'Le glissement en charge', lab: 'Exploiter les résultats', text: `<p>Le variateur affiche ${F(fc)} Hz. Le tachymètre optique vise l’arbre moteur. La plaque signalétique donne ${F(nN, 4)} tr/min à 50 Hz : le moteur a 4 pôles, soit p = 2 paires de pôles.</p>`,
        fig: plaque + rangee(afficheur('Tachymètre', F(n, 4), 'tr/min'), afficheur('Variateur', F(fc), 'Hz')),
        fields: [num('Vitesse de synchronisme n<sub>s</sub>', ns, 'tr/min', 'exp', { tol: 0.005 }), num('Glissement g = (n<sub>s</sub> − n) / n<sub>s</sub>', g, '%', 'exp', { abs: 0.3 })],
        corr: `n<sub>s</sub> = 60 f / p = 60 × ${F(fc)} / 2 = <b>${F(ns, 4)} tr/min</b>. g = (${F(ns, 4)} − ${F(n, 4)}) / ${F(ns, 4)} = <b>${F(g)} %</b>. Le rotor tourne toujours un peu moins vite que le champ tournant : c’est ce retard qui fait naître les courants dans le rotor, donc le couple. Plus la charge est lourde, plus le glissement grandit.`,
        hint: 'n<sub>s</sub> = 60 f / p, avec f en Hz et n<sub>s</sub> en tr/min.' },
      { t: 'La vitesse de la cabine et le temps de montée', lab: 'Exploiter les résultats', text: `<p>Le codeur a enregistré la vitesse du moteur au démarrage. La rampe d’accélération du variateur est réglée à ${F(tacc)} s pour aller de 0 à 50 Hz. Réducteur 1/${i}, tambour de ${F(D)} m, course h = ${F(h)} m.</p><p>Pendant la rampe, la cabine parcourt la moitié de ce qu’elle parcourrait à vitesse constante, d’où t<sub>montée</sub> = t<sub>rampe</sub> / 2 + h / v.</p>`, fig: figN,
        fields: [num('Vitesse de la cabine v', v, 'm/s', 'exp'), num('Temps de montée t<sub>montée</sub>', tm, 's', 'exp')],
        corr: `Le tambour tourne à ${F(n, 4)} / ${i} = ${F(n / i)} tr/min. v = (n / i) × π D / 60 = ${F(n / i)} × π × ${F(D)} / 60 = <b>${F(v)} m/s</b>. La rampe dure ${F(tacc)} × ${F(fc)} / 50 = ${F(tr)} s, ce qu’on lit aussi sur la courbe. t<sub>montée</sub> = ${F(tr)} / 2 + ${F(h)} / ${F(v)} = <b>${F(tm)} s</b>.`,
        hint: 'Vitesse du tambour = vitesse du moteur divisée par le rapport ; un tour de tambour fait avancer le câble de π D.' },
      { t: 'Voulu, prévu, mesuré', lab: 'Quantifier les écarts', text: `<p>Le bureau d’études a calculé avec la vitesse de synchronisme, glissement négligé. Cahier des charges : au plus ${F(Tmax)} s.</p>`,
        fig: tableur('Note de calcul du bureau d’études', ['Grandeur', 'Valeur', 'Unité'], [['Fréquence f', F(fc), 'Hz'], ['Vitesse moteur n = 60 f / p', F(ns, 4), 'tr/min'], ['Vitesse cabine v<sub>mod</sub>', '?', 'm/s'], ['Temps de montée t<sub>mod</sub>', '?', 's']]),
        fields: [num('Temps de montée prévu t<sub>mod</sub>', tmod, 's', 'mod'), num('Écart relatif |t<sub>montée</sub> − t<sub>mod</sub>| / t<sub>mod</sub>', ecT, '%', 'ecart', { abs: 0.4 }),
          choix(`D’après la mesure, le cahier des charges (${F(Tmax)} s au plus) est-il tenu ?`, ok ? 'Oui' : 'Non', [ok ? 'Non' : 'Oui'], 'ecart')],
        corr: `v<sub>mod</sub> = ${F(ns, 4)} / ${i} × π × ${F(D)} / 60 = ${F(v0)} m/s, donc t<sub>mod</sub> = ${F(tr)} / 2 + ${F(h)} / ${F(v0)} = <b>${F(tmod)} s</b>. Écart = |${F(tm)} − ${F(tmod)}| / ${F(tmod)} = <b>${F(ecT)} %</b>. ${ok ? `La mesure (${F(tm)} s) reste sous ${F(Tmax)} s : le cahier des charges est tenu.` : `La mesure (${F(tm)} s) dépasse ${F(Tmax)} s : le cahier des charges n’est pas tenu, alors que le calcul du bureau d’études le promettait.`} L’écart (${F(ecT)} %) est du même ordre que le glissement (${F(g)} %) : c’est un indice fort sur sa cause.`,
        hint: 'Même calcul que la question précédente, mais avec n<sub>s</sub> à la place de n.' },
      { t: 'La cause de l’écart, et le réglage qui la corrige', lab: 'Analyse critique', text: '<p>Le variateur propose une compensation de glissement : il augmente sa fréquence de la fréquence de glissement, qu’il estime à partir du courant. Voici les caractéristiques couple-vitesse du moteur, sans et avec compensation.</p>', fig: figTn,
        fields: [choix('Cause principale de l’écart', 'Le glissement du moteur en charge, négligé par le bureau d’études', ['La rampe d’accélération, trop longue', 'Le réducteur, qui patine', 'L’imprécision du tachymètre'], 'crit'),
          num(`Fréquence f′ pour que le moteur tourne à ${F(ns, 4)} tr/min avec la charge`, fp, 'Hz', 'crit', { tol: 0.01 })],
        corr: `La rampe est la même dans le calcul et dans la mesure : elle n’explique pas l’écart. Le glissement, lui, manque au calcul. À couple constant, en loi U/f, la fréquence de glissement ne change pas avec f : f<sub>g</sub> = f − p n / 60 = ${F(fc)} − 2 × ${F(n, 4)} / 60 = ${F(fg)} Hz. Pour tourner à ${F(ns, 4)} tr/min avec la charge, il faut f′ = ${F(fc)} + ${F(fg)} = <b>${F(fp)} Hz</b> : la caractéristique se décale vers la droite (en vert) et le point de fonctionnement revient à ${F(ns, 4)} tr/min. C’est ce que fait la compensation de glissement.`,
        hint: 'À couple donné, l’écart entre vitesse de synchronisme et vitesse réelle reste le même quand on décale la fréquence.' },
      { t: 'Réduire l’écart, puis la séance', lab: 'Réduire l’écart · transposer en séance', text: '<p>Pour finir : le réglage qui permet de tenir le cahier des charges, et le protocole nouveau que tu donnes aux étudiants de BTS Électrotechnique pendant ta séance.</p>', fig: schemaMonte(),
        fields: [choix('Pour tenir le cahier des charges sans changer de moteur', 'Activer et régler la compensation de glissement du variateur', ['Allonger la rampe de décélération', 'Augmenter le gain de tension à basse vitesse (« boost »)', 'Baisser la fréquence de découpage'], 'crit'),
          choix('Protocole nouveau pour la séance', 'Relever la vitesse à vide, à mi-charge et à pleine charge, sans puis avec compensation de glissement, et tracer n en fonction de la charge', ['Refaire la lecture de la fréquence à l’oscilloscope, comme dans l’expérimentation', 'Mesurer U12 avec une sonde 1/10 ordinaire, pour comparer avec la sonde différentielle', 'Retirer le frein du moteur pour gagner du temps à la montée'], 'seance')],
        corr: 'La compensation de glissement rattrape exactement ce que le calcul avait négligé. Allonger la décélération rallonge le trajet ; le boost agit à basse vitesse, pas sur la vitesse établie ; la fréquence de découpage ne change pas la vitesse. Pour la séance, tracer n en fonction de la charge, avec et sans compensation, fait découvrir le glissement puis son remède : c’est un protocole nouveau. Une sonde ordinaire sur une phase est dangereuse, et retirer le frein d’un appareil de levage est interdit : la charge peut chuter.',
        figC: figNc, legC: 'Ce que donnerait ce protocole (simulation du banc) : sans compensation, la vitesse baisse avec la charge ; avec, elle reste à la vitesse de synchronisme.' },
    ];
    const bilan = [`Charge maximale : n = ${F(n, 4)} tr/min à ${F(fc)} Hz, soit un glissement de ${F(g)} % (n_s = ${F(ns, 4)} tr/min).`,
      `Vitesse de la cabine mesurée : ${F(v)} m/s ; temps de montée mesuré ${F(tm)} s, prévu par le bureau d’études ${F(tmod)} s (glissement négligé) : écart de ${F(ecT)} %.`,
      `Cahier des charges : ${F(Tmax)} s au plus : ${ok ? 'tenu' : 'non tenu'}.`,
      `Cause de l’écart : le glissement en charge. Solution : compensation de glissement, f′ = ${F(fp)} Hz pour retrouver ${F(ns, 4)} tr/min.`];
    return { intro, bilan, prob: `Avec la charge maximale, la cabine monte-t-elle en ${F(Tmax)} s au plus ? Le bureau d’études a calculé avec la vitesse de synchronisme.`, qs: qsL };
  }

  /* =====================================================================
     Banc 3 — qualité de l'énergie : harmoniques et courant de neutre
     Charges linéaires + ordinateurs (redresseur et condensateur : impulsions de courant au sommet de la tension).
     ===================================================================== */
  function schemaHarmo() {
    const Y = { L1: 40, L2: 62, L3: 84, N: 106 };
    let s = '';
    Object.keys(Y).forEach((k) => { s += `<line x1="56" y1="${Y[k]}" x2="620" y2="${Y[k]}" stroke="${k === 'N' ? '#2d6cdf' : '#183047'}" stroke-width="${k === 'N' ? 3.5 : 2.5}"/>` + T(20, Y[k] + 5, k, { fs: 13, w: 700, c: k === 'N' ? '#2d6cdf' : '#183047' }); });
    [['L1', 170, 'phase 1'], ['L2', 340, 'phase 2'], ['L3', 510, 'phase 3']].forEach(([k, x, t]) => {
      s += `<circle cx="${x}" cy="${Y[k]}" r="3.5" fill="#183047"/><line x1="${x}" y1="${Y[k]}" x2="${x}" y2="160" stroke="#183047" stroke-width="2.5"/><circle cx="${x + 40}" cy="${Y.N}" r="3.5" fill="#2d6cdf"/><line x1="${x + 40}" y1="${Y.N}" x2="${x + 40}" y2="160" stroke="#2d6cdf" stroke-width="2.5"/>`;
      s += `<rect x="${x - 40}" y="160" width="120" height="96" rx="8" fill="#f6f9fb" stroke="#8aa0b0" stroke-width="1.5"/><rect x="${x - 26}" y="178" width="34" height="14" fill="#fff" stroke="#8a4513" stroke-width="2"/>` + T(x - 9, 210, 'linéaire', { fs: 11, a: 'middle', c: '#8a4513' });
      s += `<rect x="${x + 22}" y="174" width="40" height="28" rx="3" fill="#dfeaf2" stroke="#12566f" stroke-width="2"/><rect x="${x + 36}" y="202" width="12" height="6" fill="#12566f"/>` + T(x + 42, 222, 'ordinateurs', { fs: 11, a: 'middle', c: '#12566f' }) + T(x + 20, 246, t, { fs: 12, a: 'middle', w: 700 });
    });
    s += `<ellipse cx="170" cy="128" rx="17" ry="9" fill="none" stroke="#c9483b" stroke-width="3"/>` + T(130, 150, 'pince · analyseur', { fs: 12, c: '#c9483b', w: 700, a: 'end' });
    s += `<ellipse cx="590" cy="${Y.N}" rx="9" ry="16" fill="none" stroke="#c9483b" stroke-width="3"/>` + T(596, 140, 'pince sur', { fs: 12, c: '#c9483b', w: 700, a: 'middle' }) + T(596, 154, 'le neutre', { fs: 12, c: '#c9483b', w: 700, a: 'middle' });
    s += T(56, 22, 'Tableau de distribution 3 × 400 V + N', { fs: 12, c: '#587083' });
    return svg(640, 270, s, 'Schéma du tableau, des charges et des points de mesure');
  }
  function genHarmo() {
    const V = dec(al(228, 233), 1), RG = [1, 3, 5, 7, 9, 11, 13];
    const N = 2400, ths = Array.from({ length: N }, (_, k) => 2 * Math.PI * k / N);
    const eff = (f) => Math.sqrt(moy(ths.map((th) => f(th) ** 2)));
    const wrap = (x) => { x = (x + Math.PI) % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return x - Math.PI; };
    for (let essai = 0; essai < 60; essai++) {
      const Ilin = al(0.5, 2.5), Inl = al(1.6, 3.6), dl = al(8, 16) * Math.PI / 180, wp = al(55, 75) * Math.PI / 180, thc = Math.PI / 2 - dl;
      // courant des ordinateurs : une impulsion (cosinus surélevé de largeur wp) un peu avant chaque sommet de la tension, quand le condensateur se recharge
      const imp = (th) => { const u = wrap(th - thc), v = wrap(th - thc - Math.PI); return Math.abs(u) < wp / 2 ? Math.cos(Math.PI * u / wp) ** 2 : Math.abs(v) < wp / 2 ? -(Math.cos(Math.PI * v / wp) ** 2) : 0; };
      const cr = (h) => { let x = 0, y = 0; ths.forEach((th) => { const v = imp(th); x += v * Math.cos(h * th); y += v * Math.sin(h * th); }); return Math.hypot(x, y) * 2 / N / Math.SQRT2; };   // valeur efficace du rang h
      const A = Inl / cr(1);
      // courant d'une phase : charge linéaire (kl) + ordinateurs (kn)
      const iPh = (th, kl, kn) => Math.SQRT2 * kl * Ilin * Math.sin(th) + kn * A * imp(th);
      // ce qu'affiche l'analyseur pour la phase 1
      const I1v = Math.hypot(Ilin + Inl * Math.cos(dl), Inl * Math.sin(dl)), cos1 = (Ilin + Inl * Math.cos(dl)) / I1v;
      const Ih = { 1: sig(I1v, 3) }; RG.slice(1).forEach((h) => { Ih[h] = sig(A * cr(h), 3); });
      const Sh2 = RG.slice(1).reduce((s, h) => s + Ih[h] ** 2, 0), THD = Math.sqrt(Sh2) / Ih[1] * 100;
      const Ieff = sig(eff((th) => iPh(th, 1, 1)), 3), P = Math.round(V * I1v * cos1), dpf = dec(cos1, 3);
      const S = V * Ieff, lam = P / S;
      const Ipk = Math.max(...ths.map((th) => iPh(th, 1, 1))), FC = Ipk / Ieff, Imoy = sig(1.1107 * moy(ths.map((th) => Math.abs(iPh(th, 1, 1)))), 3);
      // les autres phases : presque pareilles, ou nettement plus (ou moins) chargées en ordinateurs
      const dedans = Math.random() < 0.5, sgn = Math.random() < 0.5 ? 1 : -1;
      const kn2 = dedans ? 1 + al(-0.012, 0.012) : 1 + sgn * al(0.08, 0.2), kn3 = dedans ? 1 + al(-0.012, 0.012) : 1 + sgn * al(0.08, 0.2), kl2 = 1 + al(-0.04, 0.04), kl3 = 1 + al(-0.04, 0.04);
      const iN = (th) => iPh(th, 1, 1) + iPh(th - 2 * Math.PI / 3, kl2, kn2) + iPh(th + 2 * Math.PI / 3, kl3, kn3);
      const E3 = essais(eff(iN), (x) => sig(x, 3)), INm = sig(E3.m, 3);
      const INmod = 3 * Math.hypot(Ih[3], Ih[9]), ecN = Math.abs(INm - INmod) / INmod * 100;
      if (dedans ? ecN > E3.disp - 0.4 : ecN < E3.disp + 0.4) continue;
      const rap = INm / Ieff; if (Math.abs(rap - 1) < 0.03) continue;
      const surch = rap > 1;
      const veut = Math.random() < 0.55, cand = [30, 40, 50, 60, 70, 80, 90];
      let Ls = cand.filter((x) => (veut ? x >= THD + 4 : x <= THD - 4)); if (!Ls.length) Ls = cand.filter((x) => Math.abs(x - THD) >= 4);
      if (!Ls.length) continue;
      const seuil = tire(Ls), okT = THD <= seuil;
      // l'oscillogramme du courant de phase
      const Adiv = [0.5, 1, 2, 2.5, 5].find((x) => Ipk / x <= 3.7) || 5, mV = Adiv * 100;
      const figOsc = osc({ tdiv: 0.005, trig: 1, alt: 'Oscillogramme du courant de la phase 1', ch: [{ f: (t) => iPh(2 * Math.PI * 50 * (t - 0.005), 1, 1), div: Adiv, z: 0, c: '#56ccf2', n: 1600, w: 2 }],
        bas: [[`CH1 : ${F(mV)} mV/div · pince 100 mV/A · i1`, '#56ccf2'], ['Base de temps : 5 ms/div', '#dfe8ee']] });
      const figSp = spectre(RG.map((h) => [h, Ih[h]]), { xl: 'Rang de l’harmonique', yl: 'Courant efficace (A)', alt: 'Spectre du courant de la phase 1' });
      // les trois fondamentaux s'annulent, les trois rangs 3 s'additionnent
      const panneau = (x0, titre, h) => {
        const w = 290, H = 170, X = (t) => x0 + 10 + t / (2 * Math.PI) * (w - 20), Yy = (y) => 40 + H / 2 - y * 24;
        const cs = ['#c9483b', '#2f8f4e', '#12566f'];
        let s = `<rect x="${x0}" y="30" width="${w}" height="${H}" fill="#fff" stroke="#9fb3c2"/><line x1="${x0}" y1="${Yy(0)}" x2="${x0 + w}" y2="${Yy(0)}" stroke="#c3d0da"/>` + T(x0 + w / 2, 20, titre, { fs: 14, a: 'middle', w: 700 });
        [0, -2 * Math.PI / 3, 2 * Math.PI / 3].forEach((d, k) => { let p = ''; for (let i = 0; i <= 120; i++) { const t = 2 * Math.PI * i / 120; p += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Yy(Math.sin(h * (t + d))).toFixed(1); } s += `<path d="${p}" fill="none" stroke="${cs[k]}" stroke-width="${h === 3 ? 5 - 1.5 * k : 1.8}" opacity="${h === 3 ? 0.85 : 1}"/>`; });
        let p = ''; for (let i = 0; i <= 120; i++) { const t = 2 * Math.PI * i / 120, y = [0, -2 * Math.PI / 3, 2 * Math.PI / 3].reduce((u, d) => u + Math.sin(h * (t + d)), 0); p += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Yy(y).toFixed(1); }
        return s + `<path d="${p}" fill="none" stroke="#183047" stroke-width="3" stroke-dasharray="${h === 3 ? '0' : '8 5'}"/>`;
      };
      const fig3 = svg(640, 250, panneau(20, 'Fondamentaux des trois phases', 1) + panneau(330, 'Rangs 3 des trois phases', 3) + T(165, 232, 'somme (noir) : nulle', { fs: 13, a: 'middle', w: 700 }) + T(475, 232, 'somme (noir) : trois fois plus grande', { fs: 13, a: 'middle', w: 700 }), 'Les fondamentaux s’annulent dans le neutre, les rangs 3 s’additionnent');
      // simulation du protocole de séance : I_N selon le nombre d'ordinateurs
      const pc = (th, k) => k * A / 2 * imp(th);
      const un = (k) => eff((th) => pc(th, k)), rep = (k) => eff((th) => [0, 1, 2].reduce((s, j) => s + pc(th - 2 * Math.PI * j / 3, Math.floor((k - j + 2) / 3)), 0));
      const ymax = haut(un(6) * 1.1, pasNet(un(6) * 1.1, 6));
      const figK = trace({ x0: 0, x1: 6, dx: 1, y0: 0, y1: ymax, dy: pasNet(ymax, 6) / 2, ymaj: 2, xl: 'Nombre d’ordinateurs en service', yl: 'Courant de neutre I<tspan baseline-shift="sub" font-size="10">N</tspan> (A)', alt: 'Courant de neutre selon le nombre d’ordinateurs',
        curves: [{ pts: [0, 1, 2, 3, 4, 5, 6].map((k) => [k, un(k)]), c: '#c9483b', lab: [3.2, un(3.2) + 0.08 * ymax, 'tous sur la phase 1', 'end'] }, { pts: [0, 1, 2, 3, 4, 5, 6].map((k) => [k, rep(k)]), c: '#2f8f4e', lab: [5.9, Math.min(rep(3), rep(4)) - 0.1 * ymax, 'répartis sur les trois phases', 'end'] }],
        marks: [1, 2, 3, 4, 5, 6].map((k) => [k, un(k), '', '#c9483b']).concat([1, 2, 3, 4, 5, 6].map((k) => [k, rep(k), '', '#2f8f4e'])) });
      // le bilan pour le cahier des charges
      const bil = (() => {
        const W = 640, H = 200, xm = 200, L = 400, imax = Math.max(Ieff, INm) * 1.15, tmax = Math.max(THD, seuil) * 1.2;
        const barre = (y, v, vmax, c, t, u) => { const w = L * v / vmax; return `<rect x="${xm}" y="${y}" width="${w.toFixed(1)}" height="26" fill="${c}"/>` + T(xm - 10, y + 18, t, { fs: 14, a: 'end' }) + (w > 90 ? T(xm + w - 8, y + 18, `${F(v)} ${u}`, { fs: 14, w: 700, a: 'end', c: '#fff' }) : T(xm + w + 8, y + 18, `${F(v)} ${u}`, { fs: 14, w: 700 })); };
        return svg(W, H, T(20, 22, 'Courants efficaces', { fs: 14, w: 700, c: '#12566f' }) + barre(34, Ieff, imax, '#12566f', 'phase 1', 'A') + barre(68, INm, imax, '#2d6cdf', 'neutre (moyenne)', 'A') + T(20, 128, 'Taux de distorsion du courant de phase', { fs: 14, w: 700, c: '#12566f' }) + barre(140, THD, tmax, '#e0a83a', 'THD<tspan baseline-shift="sub" font-size="10">I</tspan>', '%') + `<line x1="${(xm + L * seuil / tmax).toFixed(1)}" y1="132" x2="${(xm + L * seuil / tmax).toFixed(1)}" y2="176" stroke="#c9483b" stroke-width="2.5" stroke-dasharray="6 4"/>` + T(xm + L * seuil / tmax, 192, `limite ${seuil} %`, { fs: 13, a: 'middle', c: '#c9483b', w: 700 }), 'Bilan : courants de phase et de neutre, taux de distorsion');
      })();
      const intro = `<p><b>Le banc.</b> Un tableau triphasé 3 × 400 V + neutre alimente, sur chaque phase, des charges linéaires (radiateurs, éclairage) et des ordinateurs. Les câbles ont un neutre de même section que les phases.</p>
        <p><b>La problématique.</b> Le client a ajouté des ordinateurs. Le neutre risque-t-il de chauffer, et la pollution harmonique reste-t-elle acceptable ?</p>
        <p><b>Le cahier des charges.</b> Le courant du neutre ne doit pas dépasser le courant d’une phase ; le taux de distorsion du courant de phase doit rester sous ${seuil} %.</p>`;
      const qsL = [
        { t: 'L’objectif de la mesure', lab: 'Identifier l’objectif', text: '<p>Le jury attend que tu dises d’abord ce que tu mesures, et pourquoi.</p>', fig: schemaHarmo(),
          fields: [choix('Ce qu’il faut mesurer', 'Le courant du neutre et la distorsion du courant de phase, toutes les charges en service', ['La tension simple de chaque phase, charges coupées', 'La seule puissance active totale', 'La résistance d’isolement du neutre'], 'obj'),
            choix('Pourquoi le neutre est-il en danger ?', 'Les rangs 3 des trois phases s’y additionnent au lieu de s’annuler', ['Il porte toujours le courant le plus faible', 'Il n’est pas protégé, donc il ne chauffe pas', 'Le cahier des charges ne parle que de lui'], 'obj')],
          corr: 'Le courant des ordinateurs est fait d’impulsions, riches en harmoniques. Dans le neutre, les courants des trois phases se retrouvent : les fondamentaux, décalés de 120°, s’annulent quand les phases sont équilibrées ; les rangs 3, décalés de 3 × 120° = 360°, sont en phase : ils s’additionnent. On mesure donc le courant du neutre et la distorsion du courant de phase, toutes charges en service, le cas le plus chargé.',
          hint: 'Que deviennent, dans le neutre, trois courants décalés de 120° ? et leurs rangs 3 ?' },
        { t: 'Quel appareil croire ?', lab: 'Choisir l’appareil · conduire la mesure', text: '<p>La pince d’un multimètre ordinaire (qui mesure la valeur moyenne et l’affiche étalonnée pour un sinus) et l’analyseur (TRMS) mesurent le même courant de la phase 1. L’oscilloscope en montre la forme.</p>',
          fig: figOsc + rangee(afficheur('Pince « valeur moyenne »', F(Imoy), 'A'), afficheur('Analyseur TRMS · I1', F(Ieff), 'A')),
          fields: [choix('La valeur à retenir', 'Celle de l’analyseur TRMS : un appareil à valeur moyenne n’est juste qu’en sinus', ['Celle de la pince : l’écart vient de la précision de l’analyseur', 'La moyenne des deux', 'Aucune : seul l’oscilloscope mesure juste'], 'proto'),
            num('Facteur de crête F<sub>c</sub> = I<sub>max</sub> / I', FC, '', 'mes', { tol: 0.06 })],
          corr: `Un appareil à valeur moyenne mesure la moyenne de |i| et la multiplie par 1,11, le rapport valable pour un sinus. Avec des impulsions, ce rapport est faux : la pince affiche ${F(Imoy)} A au lieu de ${F(Ieff)} A. Facteur de crête : sensibilité ${F(mV)} mV/div pour 100 mV/A, soit ${F(Adiv)} A/div ; crête : ${F(Ipk / Adiv)} divisions, soit ${F(Ipk)} A, donc F<sub>c</sub> = ${F(Ipk)} / ${F(Ieff)} = <b>${F(FC)}</b>, contre √2 ≈ 1,41 pour un sinus.`,
          hint: 'Pour un sinus, valeur efficace = 1,11 × valeur moyenne de |i|. Est-ce un sinus ?' },
        { t: 'Le spectre du courant', lab: 'Exploiter les résultats', text: '<p>L’analyseur décompose le courant de la phase 1 en harmoniques (valeurs efficaces).</p>', fig: figSp,
          fields: [num('Taux de distorsion THD<sub>I</sub> = √(I<sub>3</sub>² + I<sub>5</sub>² + … ) / I<sub>1</sub>', THD, '%', 'exp'), choix('Les rangs qui chargent le neutre', 'Les rangs multiples de 3 : 3 et 9', ['Les rangs 5 et 7, les plus nombreux', 'Le rang 13, le plus élevé', 'Le rang 1, le fondamental'], 'exp')],
          corr: `On additionne les carrés des harmoniques, rangs 3 à 13 : ${F(Sh2)} A² ; la racine vaut ${F(Math.sqrt(Sh2))} A. THD<sub>I</sub> = ${F(Math.sqrt(Sh2))} / ${F(Ih[1])} = <b>${F(THD)} %</b>. Les rangs multiples de 3 (en rouge) sont en phase d’une phase à l’autre : ce sont eux qui s’additionnent dans le neutre.`,
          hint: 'Somme des carrés des barres de rang 3 à 13, racine carrée, divisée par la barre de rang 1.' },
        { t: 'Les puissances', lab: 'Exploiter les résultats', text: '<p>L’analyseur affiche, pour la phase 1 :</p>',
          fig: ecran('Analyseur · phase 1', [['V', F(V, 4), 'V'], ['I (TRMS)', F(Ieff), 'A'], ['P', F(P, 4), 'W'], ['cos φ1', F(dpf), '']]),
          fields: [num('Puissance apparente S = V · I', S, 'VA', 'exp', { tol: 0.02 }), num('Facteur de puissance λ = P / S', lam, '', 'exp', { abs: 0.012 }),
            choix('λ est plus petit que cos φ<sub>1</sub>, parce que', 'Les harmoniques augmentent I sans fournir de puissance active : S² = P² + Q² + D²', ['La tension du réseau est déformée', 'Les charges linéaires consomment de la puissance réactive', 'L’analyseur arrondit ses mesures'], 'exp')],
          corr: `S = ${F(V, 4)} × ${F(Ieff)} = <b>${F(S)} VA</b> ; λ = ${F(P, 4)} / ${F(S)} = <b>${F(lam)}</b>, alors que cos φ<sub>1</sub> = ${F(dpf)}. Le cos φ<sub>1</sub> ne regarde que le fondamental. Les harmoniques gonflent le courant efficace, donc S, les pertes et l’échauffement des câbles, sans apporter de puissance active : c’est la puissance déformante D. On retrouve λ = cos φ<sub>1</sub> × I<sub>1</sub> / I = ${F(dpf)} × ${F(Ih[1])} / ${F(Ieff)} ≈ ${F(dpf * Ih[1] / Ieff)}.`,
          hint: 'S se calcule avec le courant efficace complet, harmoniques compris.' },
        { t: 'Le courant de neutre : modèle et mesure', lab: 'Confronter modèle et mesure', text: `<p>Modèle : si les trois phases portaient la même charge que la phase 1, seuls les rangs 3 et 9 resteraient dans le neutre, multipliés par 3 : I<sub>N</sub> = 3 · √(I<sub>3</sub>² + I<sub>9</sub>²), avec I<sub>3</sub> = ${F(Ih[3])} A et I<sub>9</sub> = ${F(Ih[9])} A. La pince TRMS sur le neutre a donné trois relevés, à quelques minutes d’intervalle.</p>`,
          fig: tableur('Relevés · courant de neutre', ['Relevé', 'I<sub>N</sub> (A)'], [['1', F(E3.L[0])], ['2', F(E3.L[1])], ['3', F(E3.L[2])], ['Moyenne', F(INm)], ['Écart max à la moyenne', `± ${F(E3.disp)} %`]], [3, 4]),
          fields: [num('I<sub>N</sub> prévu par le modèle', INmod, 'A', 'mod', { tol: 0.02 }), num('Écart relatif |I<sub>N,moy</sub> − I<sub>N,mod</sub>| / I<sub>N,mod</sub>', ecN, '%', 'ecart', { tol: 0.04, abs: 0.12 }),
            choix('Conclusion', dedans ? 'L’écart reste dans la dispersion : les essais ne mettent pas le modèle en défaut' : 'L’écart dépasse la dispersion : il est réel, il faut l’expliquer', [dedans ? 'L’écart dépasse la dispersion : il est réel, il faut l’expliquer' : 'L’écart reste dans la dispersion : les essais ne mettent pas le modèle en défaut', 'On ne peut rien conclure sans refaire dix relevés'], 'ecart')],
          corr: `I<sub>N,mod</sub> = 3 × √(${F(Ih[3])}² + ${F(Ih[9])}²) = <b>${F(INmod)} A</b>. Écart = |${F(INm)} − ${F(INmod)}| / ${F(INmod)} = <b>${F(ecN)} %</b>, à comparer à la dispersion des relevés : ± ${F(E3.disp)} %. ${dedans ? 'L’écart est plus petit que la dispersion : les relevés ne mettent pas le modèle en défaut.' : 'L’écart dépasse la dispersion : il est réel, il faut en chercher la cause (question 7).'}`,
          hint: 'Calcule d’abord le modèle, puis l’écart avec la moyenne du tableur, et compare-le au « ± ».' },
        { t: 'Le cahier des charges', lab: 'Quantifier les écarts et conclure', text: `<p>Le neutre a la même section que les phases : son courant ne doit pas dépasser celui d’une phase. Le taux de distorsion du courant de phase doit rester sous ${seuil} %.</p>`, fig: bil,
          fields: [num('Rapport I<sub>N</sub> / I (neutre sur phase)', rap, '', 'ecart', { abs: 0.02 }), choix('Le neutre est-il surchargé ?', surch ? 'Oui : il porte plus que la phase' : 'Non : il porte moins que la phase', [surch ? 'Non : il porte moins que la phase' : 'Oui : il porte plus que la phase'], 'ecart'),
            choix(`Le taux de distorsion (au plus ${seuil} %) est-il tenu ?`, okT ? 'Oui' : 'Non', [okT ? 'Non' : 'Oui'], 'ecart')],
          corr: `I<sub>N</sub> / I = ${F(INm)} / ${F(Ieff)} = <b>${F(rap)}</b>. ${surch ? 'Le neutre porte plus que la phase : à section égale, c’est le conducteur le plus chaud, alors qu’il est souvent sans protection propre. Il faut agir.' : `Le neutre porte moins que la phase${rap > 0.85 ? ', mais la marge est faible : quelques ordinateurs de plus suffiraient à le surcharger' : ''}.`} THD<sub>I</sub> = ${F(THD)} %, ${okT ? 'sous' : 'au-dessus de'} la limite de ${seuil} % : ${okT ? 'tenu' : 'non tenu'}.`,
          hint: 'Lis les deux barres de courant ; compare la barre du THD à la ligne de la limite.' },
        { t: 'L’hypothèse du modèle, et le remède', lab: 'Analyse critique', text: '<p>Le dessin rappelle pourquoi le neutre se charge : les fondamentaux des trois phases s’annulent, leurs rangs 3 s’additionnent.</p>', fig: fig3,
          fields: [choix('L’hypothèse sur laquelle repose le modèle', 'Les trois phases portent exactement les mêmes charges non linéaires', ['La tension du réseau est parfaitement sinusoïdale', 'La pince du neutre est TRMS', 'Les harmoniques de rang pair sont nuls'], 'crit'),
            choix('Pour réduire le courant de neutre', 'Des ordinateurs à alimentation corrigée (PFC), ou un filtre de rang 3 sur le neutre', ['Une batterie de condensateurs pour relever le cos φ', 'Un neutre de section plus petite', 'Brancher tous les ordinateurs sur deux phases seulement'], 'crit')],
          corr: `Le modèle prend la phase 1 et multiplie par 3 : il suppose les trois phases identiques. ${dedans ? 'Ici, les relevés ne le contredisent pas.' : 'Ici, les deux autres phases portent plus ou moins d’ordinateurs que la phase 1 : c’est la cause de l’écart. Il faudrait mesurer le rang 3 de chaque phase.'} Pour réduire le courant de neutre, il faut s’attaquer au rang 3 : alimentations à correction du facteur de puissance (courant presque sinusoïdal), filtre de rang 3 ou transformateur à couplage zigzag. Une batterie de condensateurs ne traite pas le rang 3 et risque d’entrer en résonance avec le réseau ; réduire la section du neutre est l’inverse de ce qu’il faut ; sur deux phases, les fondamentaux ne s’annuleraient plus.`,
          hint: 'Le modèle utilise une seule phase pour en déduire le neutre : que suppose-t-il des deux autres ?' },
        { t: 'La séance', lab: 'Transposer en séance', text: '<p>Pour ta séance de BTS Électrotechnique, il faut un protocole différent de celui de l’expérimentation, et savoir ce que les étudiants devraient observer.</p>', fig: schemaHarmo(),
          fields: [choix('Protocole nouveau', 'Mettre les ordinateurs en service un par un, tous sur la phase 1 puis répartis sur les trois phases, et tracer I<sub>N</sub> et THD<sub>I</sub> en fonction de leur nombre', ['Relire le même spectre que pendant l’expérimentation', 'Mesurer le courant de neutre avec la pince « valeur moyenne »', 'Débrancher le neutre pour observer ce qui se passe'], 'seance'),
            choix('Ce que les étudiants devraient observer', 'I<sub>N</sub> augmente avec le nombre d’ordinateurs, même quand ils sont bien répartis', ['I<sub>N</sub> s’annule dès que les ordinateurs sont répartis sur les trois phases', 'I<sub>N</sub> ne dépend pas du nombre d’ordinateurs', 'I<sub>N</sub> diminue quand on ajoute des ordinateurs'], 'seance')],
          corr: 'Mettre les ordinateurs en service un à un fait voir le phénomène se construire, et comparer « tous sur une phase » à « répartis » montre que la répartition aide sans sauver le neutre : le rang 3 s’additionne quand même. C’est un protocole nouveau, qui fait travailler la démarche. Relire le spectre n’apporte rien de neuf, la pince à valeur moyenne donne une mesure fausse, et ouvrir le neutre en charge est dangereux : les tensions des phases se déséquilibrent et les appareils des phases peu chargées reçoivent une surtension.',
          figC: figK, legC: 'Ce que donnerait ce protocole (simulation du banc) : réparties ou non, les impulsions des ordinateurs chargent le neutre.' },
      ];
      const bilan = [`Phase 1 : I = ${F(Ieff)} A (TRMS), THD_I = ${F(THD)} % (limite ${seuil} % : ${okT ? 'tenue' : 'dépassée'}), facteur de crête ${F(FC)}, λ = ${F(lam)} pour cos φ1 = ${F(dpf)}.`,
        `Neutre : ${F(INm)} A en moyenne (± ${F(E3.disp)} %), soit ${F(rap)} fois le courant de phase : ${surch ? 'neutre surchargé' : 'neutre non surchargé'}.`,
        `Modèle (trois phases identiques, 3 × rang 3 et 9) : ${F(INmod)} A, écart ${F(ecN)} % : ${dedans ? 'dans la dispersion, modèle non mis en défaut' : 'réel, les phases ne portent pas les mêmes charges non linéaires'}.`,
        'Remèdes : alimentations à correction du facteur de puissance, filtre de rang 3 ou transformateur zigzag ; jamais de neutre réduit.'];
      return { intro, bilan, prob: `Après l’ajout d’ordinateurs, le neutre reste-t-il sous le courant de phase, et le THD du courant sous ${seuil} % ?`, qs: qsL };
    }
    throw new Error('tirage impossible');
  }

  const BANCS = {
    pompe: { titre: 'Station de pompage : vanne ou variateur ?', court: 'puissances, analyseur de réseau, modèle et simulation', eye: 'gestion de l’énergie', duree: 30, gen: genPompe },
    monte: { titre: 'Monte-charge : variateur et glissement', court: 'oscilloscope et sondes, variation de vitesse', eye: 'variation de vitesse', duree: 30, gen: genMonte },
    harmo: { titre: 'Qualité de l’énergie : harmoniques et neutre', court: 'appareils TRMS, spectre, puissances, neutre', eye: 'qualité de l’énergie', duree: 30, gen: genHarmo },
  };

  /* ---------- la série jouée ---------- */
  function css() {
    if (document.getElementById('tp-css')) return;
    const s = document.createElement('style'); s.id = 'tp-css';
    s.textContent = `.tp-bar{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:baseline;margin:10px 0 0;font-size:14px}
.tp-ban{margin:12px 0;background:#f4f8fa;border-radius:8px;padding:8px 14px}.tp-ban summary{cursor:pointer;font-weight:700;color:#12566f}.tp-ban p{margin:8px 0}
.tp-lab{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:#2f6f4e;border-radius:999px;padding:3px 10px}
.tp-txt p{margin:6px 0}.tp-fig{display:flex;flex-direction:column;gap:12px}
.tp-aff{display:flex;flex-wrap:wrap;gap:10px}.tp-aff>div{flex:1 1 170px;max-width:230px}
.tp-tab{max-width:100%;overflow-x:auto}.tp-tab table{border-collapse:collapse;font-size:14px;background:#fff}.tp-tab th{background:#e9eef2;color:#587083;font-weight:600;font-size:12px;border:1px solid #c8d3dc;padding:2px 8px}
.tp-tab td{border:1px solid #c8d3dc;padding:5px 10px;text-align:right;font-variant-numeric:tabular-nums}.tp-tab td.n{background:#e9eef2;color:#587083;font-size:12px;text-align:center;padding:2px 6px}.tp-tab td.h{font-weight:700;text-align:left;background:#f6f9fb}.tp-tab td.g{text-align:left}
.tp-tab tr.c td:not(.n){background:#eef6ff;font-weight:700}.tp-tabt{font-size:13px;font-weight:700;color:#12566f;margin:0 0 4px}
.tp-fch{margin:6px 0}.tp-fl{display:block;font-weight:700;margin-bottom:6px}.tp-opts{display:flex;flex-direction:column;gap:6px}
.tp-opt{font:inherit;font-size:15px;text-align:left;border:1px solid #bbccd8;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer;color:inherit}
.tp-opt.on{border-color:#12566f;background:#e8f2f7;box-shadow:inset 0 0 0 1px #12566f}.tp-opt.ok{border-color:#1f7a53;background:#e7f5ee;box-shadow:inset 0 0 0 1px #1f7a53}.tp-opt.ko{border-color:#a8362b;background:#fbeceb}.tp-opt:disabled{cursor:default;color:inherit}
.tp-ver{font-weight:800;margin:14px 0 4px}.tp-ver.ok{color:#1f7a53}.tp-ver.ko{color:#a8362b}.tp-al{color:#a8362b;font-weight:700;margin:6px 0 0}
.tp-lnk{background:none;border:0;padding:0;color:#12566f;text-decoration:underline;cursor:pointer;font:inherit}
.tp-aide{margin:10px 0}.tp-aide summary{cursor:pointer;color:#12566f;font-weight:600}
.tp-big{font-size:40px;font-weight:800}.tp-g{width:100%;border-collapse:collapse;font-size:14px}.tp-g td{border-bottom:1px solid #dfe7ee;padding:7px 8px;vertical-align:top}.tp-g td.n{white-space:nowrap;text-align:right;font-weight:700}
.tp-ok{color:#1f7a53}.tp-ko{color:#a8362b}.tp-q{background:#f4f8fa;border-radius:8px;padding:10px 14px;margin:10px 0;white-space:pre-wrap}.tp-leg{font-size:14px;color:#42596b;margin:6px 0 0}
.tp-carte{list-style:none;padding:0;margin:8px 0 0}.tp-carte li{margin:10px 0;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}`;
    document.head.appendChild(s);
  }

  function vue(id) {
    css();
    const B = BANCS[id], cle = 'tp-' + id;
    if (!B) { location.hash = '#admission'; return; }
    const signature = (o) => { const t = JSON.stringify(o.qs.map((q) => q.fields.map((f) => (f.ch ? f.ch[f.a] : f.a)))); let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; };
    let R = lsGet(cle);
    if (!R || !Array.isArray(R.qs) || !R.qs.length || !Array.isArray(R.ok) || !Array.isArray(R.rep)) {
      // un nouvel essai ne reprend jamais les valeurs du précédent
      const avant = lsGet(cle + '-sig'); let o = null;
      for (let k = 0; k < 8; k++) { try { o = B.gen(); } catch (e) { o = null; } if (o && signature(o) !== avant) break; }
      if (!o) { app().innerHTML = `<a class="back" href="#admission">← Épreuves d’admission</a><div class="card"><p>Le banc n’a pas pu être préparé. Recharge la page.</p></div>`; app().onclick = null; app().onsubmit = null; return; }
      lsSet(cle + '-sig', signature(o));
      R = { intro: o.intro, bilan: o.bilan, prob: o.prob, qs: o.qs, i: 0, rep: [], ok: [], t0: Date.now(), fin: null, note: null, concl: null, brouillon: '' };
      lsSet(cle, R);
    }
    const garder = () => lsSet(cle, R);
    const nF = R.qs.reduce((s, q) => s + q.fields.length, 0);
    const justes = () => R.ok.reduce((s, o) => s + (o ? o.filter(Boolean).length : 0), 0);
    const faites = () => R.ok.reduce((s, o) => s + (o ? o.length : 0), 0);
    const note = () => Math.round(40 * justes() / nF) / 2;
    const minutes = () => Math.max(1, Math.round(((R.fin || Date.now()) - R.t0) / 60000));
    const parComp = () => { const P = {}; R.qs.forEach((q, k) => q.fields.forEach((f, i) => { const c = f.c || 'exp'; if (!P[c]) P[c] = [0, 0]; P[c][1]++; if (R.ok[k] && R.ok[k][i]) P[c][0]++; })); return P; };
    const tete = `<a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">Études expérimentales · ${esc(B.eye)}</div><h1>${esc(B.titre)}</h1>`;
    const valeur = (f) => fmt(f.a, Math.abs(f.a) >= 1000 ? 4 : 3) + (f.u ? ' ' + f.u : '');
    function champs(q, rep, ok) {
      return `<div class="fields">${q.fields.map((f, i) => {
        const r = rep[i], cls = ok ? (ok[i] ? ' good' : ' bad') : '';
        if (f.ch) return `<div class="tp-fch${cls}"><span class="tp-fl">${f.l}</span><div class="tp-opts" role="radiogroup">${f.ch.map((o, j) => `<button type="button" class="tp-opt${r === j ? ' on' : ''}${ok && j === f.a ? ' ok' : ''}${ok && r === j && j !== f.a ? ' ko' : ''}" data-f="${i}" data-o="${j}" role="radio" aria-checked="${r === j}"${ok ? ' disabled' : ''}>${o}</button>`).join('')}</div></div>`;
        return `<div class="fld${cls}"><label for="tpin${i}">${f.l}</label><input id="tpin${i}" data-f="${i}" inputmode="decimal" autocomplete="off" value="${esc(r == null ? '' : r)}"${ok ? ' disabled' : ''}><span class="u">${f.u}</span><span class="fb">${ok ? (ok[i] ? '✓' : 'Attendu : ' + valeur(f)) : ''}</span></div>`;
      }).join('')}</div>`;
    }
    function retour(q, ok) {
      const e = ok.filter((y) => !y).length, der = R.i === R.qs.length - 1;
      return `<div class="tp-ver ${e ? 'ko' : 'ok'}">${e ? `${e} réponse${e > 1 ? 's' : ''} fausse${e > 1 ? 's' : ''} sur ${ok.length}` : 'Tout juste'}</div><div class="corr"><b>Correction</b><p>${q.corr}</p>${q.figC ? `<div class="fig">${q.figC}</div><p class="tp-leg">${q.legC || ''}</p>` : ''}</div><div class="btns" style="margin-top:14px"><button class="b" type="button" data-suiv="1">${der ? 'Voir ma note' : 'Question suivante'}</button></div>`;
    }
    function question() {
      const q = R.qs[R.i], ok = R.ok[R.i] || null, rep = R.rep[R.i] || (R.rep[R.i] = []), f = faites();
      app().innerHTML = `${tete}<div class="tp-bar"><span>Question <b>${R.i + 1}</b> / ${R.qs.length}</span><span>Pour l’instant : <b>${f ? fmt(Math.round(40 * justes() / f) / 2, 3) : '—'}</b> / 20</span><span class="muted">${minutes()} min · environ ${B.duree} min conseillées</span></div><div class="prog"><i style="width:${(100 * (R.i + (ok ? 1 : 0)) / R.qs.length).toFixed(0)}%"></i></div>
        <details class="tp-ban"${R.i === 0 && !ok ? ' open' : ''}><summary>Le banc, la problématique, le cahier des charges</summary>${R.intro}</details>
        <div class="card" id="tpq"><span class="tp-lab">${esc(q.lab)}</span><h2 style="margin:8px 0">${R.i + 1}. ${esc(q.t)}</h2><div class="tp-txt">${q.text}</div>${q.fig ? `<div class="fig tp-fig">${q.fig}</div>` : ''}${q.hint && !ok ? `<details class="tp-aide"><summary>Indice</summary><p>${q.hint}</p></details>` : ''}
        ${ok ? champs(q, rep, ok) : `<form id="tpf" novalidate>${champs(q, rep, null)}<p class="tp-al" hidden></p><div class="btns"><button class="b" type="submit">Valider</button></div></form>`}<div id="tpout">${ok ? retour(q, ok) : ''}</div></div>
        <p class="muted" style="margin-top:18px"><button class="tp-lnk" type="button" data-raz="1">Abandonner cet essai</button> : il ne compte pas, et le suivant aura d’autres valeurs.</p>`;
      if (ok) { const s = document.querySelector('[data-suiv]'); if (s) s.focus({ preventScroll: true }); }
    }
    function blocConclusion() {
      const C = R.concl;
      if (C && C.note != null) return `<h2 style="margin-top:0">Ta conclusion devant le jury</h2><p class="tp-q">${esc(C.texte)}</p><div class="tp-big" style="font-size:30px">${fmt(C.note, 2)} / 4</div><p>${esc(C.commentaire)}</p>${C.manque.length ? `<p style="margin-bottom:4px"><b>Ce qui manque</b></p><ul>${C.manque.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${C.modele ? `<details class="tp-aide" open><summary>Une conclusion qui aurait tout dit</summary><p>${esc(C.modele)}</p></details>` : ''}<p class="muted">Correction par l’IA, à partir des attentes des rapports de jury.</p>`;
      return `<h2 style="margin-top:0">Ta conclusion devant le jury</h2><p class="muted">Le jury attend une conclusion qui répond à la problématique avec des valeurs, quantifie les écarts entre performances voulue, mesurée et simulée, en donne la cause et propose une solution. Écris-la comme tu la dirais, en 4 à 6 phrases. L’IA la note sur 4, à part de la note sur 20.</p>
        <form id="tpc"><textarea id="tpct" rows="6" style="width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px">${esc((C && C.texte) || R.brouillon || '')}</textarea>${C && C.erreur ? `<p class="hint" style="padding:8px 12px">${esc(C.erreur)}</p>` : ''}<p class="tp-al" hidden></p><div class="btns"><button class="b" type="submit">Faire noter ma conclusion</button></div></form>`;
    }
    function fin() {
      const n = note(), PC = parComp();
      if (!R.fin) {
        R.fin = Date.now(); R.note = n; garder();
        if (!st.tp || typeof st.tp !== 'object') st.tp = {};
        const x = st.tp[id] || (st.tp[id] = { essais: [] });
        x.essais = (Array.isArray(x.essais) ? x.essais : []).concat([{ t: R.fin, note: n, min: minutes() }]).slice(-20);
        x.best = Math.max(n, x.best == null ? -1 : x.best); x.last = n; x.comp = PC;
        save();
      }
      const rev = R.qs.map((q, k) => [k, q]).filter(([k]) => R.ok[k] && R.ok[k].some((y) => !y));
      app().innerHTML = `${tete}<div class="card"><div class="tp-big">${fmt(n, 3)} / 20</div><p class="muted">${justes()} réponses justes sur ${nF} · ${minutes()} min (environ ${B.duree} min conseillées). Dans l’épreuve, cette partie pratique compte pour 10 points sur 20.</p>
        <h2>Ce que le jury regarde, et ce que tu as réussi</h2><table class="tp-g"><tbody>${COMP.filter(([k]) => PC[k]).map(([k, l, q]) => { const [j, t] = PC[k]; return `<tr><td><b>${l}</b><br><span class="muted">${q}</span></td><td class="n ${j === t ? 'tp-ok' : 'tp-ko'}">${j} / ${t}</td></tr>`; }).join('')}</tbody></table>
        ${rev.length ? `<p style="margin:14px 0 4px"><b>À revoir</b></p><ul>${rev.map(([k, q]) => `<li>Question ${k + 1} : ${esc(q.t)}</li>`).join('')}</ul>` : '<p class="tp-ok" style="margin-top:14px"><b>Tout juste : refais le banc avec d’autres valeurs, puis passe au suivant.</b></p>'}
        <div class="btns"><button class="b" type="button" data-refaire="1">Refaire ce banc, avec d’autres valeurs</button><a class="b sec" href="#admission">Les autres bancs</a></div></div>
        <div class="card" style="margin-top:16px" id="tpconc">${blocConclusion()}</div>`;
    }
    async function conclure(form) {
      const texte = form.querySelector('#tpct').value.trim(), al0 = form.querySelector('.tp-al');
      if (texte.length < 60) { al0.hidden = false; al0.textContent = 'Écris au moins trois phrases : réponse à la problématique, écarts, cause et solution.'; return; }
      const box = document.getElementById('tpconc');
      box.innerHTML = '<div class="think">Le jury lit ta conclusion… (jusqu’à une minute)</div>';
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { R.concl = { texte, erreur: 'La correction par l’IA n’est pas disponible pour l’instant. Compare ta conclusion aux corrections des dernières questions.' }; garder(); box.innerHTML = blocConclusion(); return; }
      const prompt = `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Pendant la partie pratique d'une épreuve d'admission, le candidat a mené l'étude ci-dessous ; il donne maintenant sa conclusion orale, écrite ici. Évalue-la comme le jury, d'après les rapports 2024 et 2025 : le jury attend une réponse à la problématique avec des valeurs, les écarts entre performances souhaitées, mesurées et simulées quantifiés, une analyse critique des causes (un écart ne se commente comme réel que s'il dépasse la dispersion des essais) et des solutions pour réduire les écarts.

## Le banc
${B.titre}. ${R.prob}

## Les résultats exacts de l'étude
${R.bilan.map((x) => `- ${x}`).join('\n')}

## La conclusion du candidat
${texte.slice(0, 3000)}

## Consignes
1. "note" sur 4, par pas de 0,5 : un point pour chaque élément présent et juste : réponse chiffrée à la problématique ; écarts quantifiés et comparés ; cause argumentée ; solution pour réduire l'écart. Une valeur fausse ou une affirmation non justifiée fait perdre le point concerné.
2. "commentaire" : deux phrases au plus, concrètes.
3. "manque" : les éléments absents ou faux, en phrases courtes (au plus quatre).
4. "modele" : une conclusion modèle de quatre à six phrases, avec les valeurs de l'étude.
5. Tutoie le candidat. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"note": 3, "commentaire": "…", "manque": ["…"], "modele": "…"}`;
      try {
        const r = await s.json(prompt, { cache: false, modelTier: 'complex' });
        if (!r || r.note == null || !isFinite(+r.note)) throw new Error('réponse vide');
        R.concl = { texte, note: Math.max(0, Math.min(4, Math.round(2 * +r.note) / 2)), commentaire: String(r.commentaire || '').trim(), manque: (Array.isArray(r.manque) ? r.manque : []).map(String).slice(0, 4), modele: String(r.modele || '').trim() };
        if (st.tp && st.tp[id]) { st.tp[id].concl = R.concl.note; save(); }
      } catch (e) { R.concl = { texte, erreur: 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.' }; }
      garder(); box.innerHTML = blocConclusion();
    }
    app().onclick = (e) => {
      const o = e.target.closest('.tp-opt');
      if (o && !o.disabled) {
        const i = +o.dataset.f, j = +o.dataset.o, rep = R.rep[R.i] || (R.rep[R.i] = []);
        rep[i] = j; o.parentNode.querySelectorAll('.tp-opt').forEach((b) => { const on = +b.dataset.o === j; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
        garder(); return;
      }
      if (e.target.closest('[data-suiv]')) { R.i++; garder(); if (R.i >= R.qs.length) fin(); else question(); window.scrollTo(0, 0); return; }
      if (e.target.closest('[data-raz]') || e.target.closest('[data-refaire]')) { lsSet(cle, null); vue(id); window.scrollTo(0, 0); }
    };
    app().oninput = (e) => { if (e.target.id === 'tpct') { R.brouillon = e.target.value; garder(); } };
    app().onchange = null;
    app().onsubmit = (e) => {
      e.preventDefault();
      if (e.target.id === 'tpc') { conclure(e.target); return; }
      if (e.target.id !== 'tpf') return;
      const q = R.qs[R.i], rep = R.rep[R.i] || (R.rep[R.i] = []), al0 = e.target.querySelector('.tp-al');
      q.fields.forEach((f, i) => { if (!f.ch) { const x = e.target.querySelector(`input[data-f="${i}"]`); rep[i] = x ? x.value : ''; } });
      garder();
      const vides = q.fields.filter((f, i) => (f.ch ? rep[i] == null : !String(rep[i] == null ? '' : rep[i]).trim())).length;
      if (vides) { al0.hidden = false; al0.textContent = vides > 1 ? `Il manque ${vides} réponses.` : 'Il manque une réponse.'; return; }
      if (q.fields.some((f, i) => !f.ch && !isFinite(parse(rep[i])))) { al0.hidden = false; al0.textContent = 'Écris un nombre (ou un calcul) dans chaque case.'; return; }
      R.ok[R.i] = q.fields.map((f, i) => (f.ch ? rep[i] === f.a : okf(f, parse(rep[i]))));
      garder(); question();
      const out = document.getElementById('tpout'); if (out) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (R.i >= R.qs.length) fin(); else question();
  }

  // la carte de l'accueil des épreuves d'admission
  function carte() {
    css();
    const S = (st && st.tp) || {};
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Les études expérimentales : la partie pratique</h2>
      <p class="muted" style="margin:0 0 6px">Elle compte pour 10 points sur 20 dans chaque épreuve. Sur des bancs simulés, proches de ceux d’un labo d’électrotechnique : identifier l’objectif, choisir et brancher les appareils, mesurer, exploiter, confronter modèle, simulation et mesure, chercher la cause des écarts, puis proposer un protocole nouveau pour la séance. Autres valeurs à chaque essai.</p>
      <ul class="tp-carte">${Object.keys(BANCS).map((id) => { const B = BANCS[id], x = S[id]; return `<li><a class="b" href="#admission-tp-${id}">${esc(B.titre)}</a><span class="muted">${esc(B.court)} · environ ${B.duree} min${x && x.best != null ? ` · meilleure note ${fmt(x.best, 3)} / 20` : ''}</span></li>`; }).join('')}</ul></div>`;
  }

  window.ADMISSION_TP = { route: vue, carte, BANCS, COMP };
})();
