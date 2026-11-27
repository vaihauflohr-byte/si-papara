/* =====================================================================
   SI Papara — agrégation : les études expérimentales (partie pratique des épreuves d'admission)
   D'après les rapports de jury 2024 et 2025 (agrégation externe et interne SII, ingénierie électrique) :
   identifier l'objectif de l'activité, élaborer et justifier un protocole, maîtriser les appareils
   (analyseur de réseau, oscilloscope, sondes), exploiter les résultats, corréler simulation et mesure,
   quantifier les écarts entre performances souhaitées, mesurées et simulées, en chercher la cause,
   proposer des solutions pour les réduire, puis un protocole nouveau pour la séance.
   Six bancs simulés, aux systèmes et valeurs inventés. Gestion de l'énergie : station de pompage (vanne ou
   variateur), monte-charge (variateur et glissement), qualité de l'énergie (harmoniques et neutre).
   Systèmes d'information : l'oscilloscope en main (un oscilloscope qu'on règle soi-même : déclenchement,
   couplage, monocoup, sonde, repliement), bus I2C, bus CAN. Valeurs tirées à chaque essai, mesures bruitées.
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
    (o.hls || []).forEach((h) => { const y = y0 + 4 * D - h.y * D; s += `<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x0 + 10 * D}" y2="${y.toFixed(1)}" stroke="${h.c || '#bb6bd9'}" stroke-width="1.5" stroke-dasharray="6 4"/>` + T(x0 + 10 * D - 4, y - 6, h.t || '', { fs: 14, a: 'end', c: h.c || '#d9a6f2', w: 700 }); });
    (o.curs || []).forEach((c, k) => { const x = x0 + c.x * D; s += `<line x1="${x.toFixed(1)}" y1="${y0}" x2="${x.toFixed(1)}" y2="${y0 + 8 * D}" stroke="#eb5757" stroke-width="1.5" stroke-dasharray="5 3"/>` + T(x + 4, y0 + 8 * D - 8 - 18 * k, c.t || 'C' + (k + 1), { fs: 13, c: '#ff8f8f', w: 700 }); });
    if (o.lect) s += `<rect x="${x0 + 10 * D - 210}" y="${y0 + 6}" width="204" height="28" rx="4" fill="#0e2230" stroke="#eb5757"/>` + T(x0 + 10 * D - 108, y0 + 25, o.lect, { fs: 15, a: 'middle', c: '#ffc4c4', w: 700, f: MONO });
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


  /* ---------- l'oscilloscope qu'on règle soi-même ----------
     Champ { k: 'osc', sig: { 1: [...], 2: [...] }, sonde: sondes réellement branchées, init: réglages de départ,
     but: critères du bon réglage, att: le réglage attendu en clair, sol: un réglage juste (pour les essais) }.
     Les signaux sont décrits par morceaux (continu, sinus, créneau, scie, bruit, trame série) : rien que des données.
     500 points par écran : à base de temps trop lente, le repliement apparaît comme sur un oscilloscope numérique. */
  const VDIV = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
  const TDIV = [1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2, 0.1, 0.2];
  const NPTS = 500, MODES = { auto: 'Auto', normal: 'Normal', mono: 'Monocoup' };
  const tnom = (t) => (t >= 1e-3 ? fmt(dec(t * 1e3, 6), 3) + ' ms' : fmt(dec(t * 1e6, 6), 3) + ' µs');
  const vnom = (v) => (v >= 1 ? fmt(v, 3) + ' V' : fmt(dec(v * 1e3, 6), 3) + ' mV');
  const alea = (x) => { const s = Math.sin(x * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  // tension à la pointe de la sonde ; ev : instant où la carte envoie ses trames (null : pas encore)
  function val(L, t, ev) {
    let v = 0;
    for (const c of L) {
      if (c.t === 'dc') v += c.v;
      else if (c.t === 'sin') v += (c.o || 0) + c.a * Math.sin(2 * Math.PI * c.f * t + (c.ph || 0));
      else if (c.t === 'car') { const P = 1 / c.f, u = ((t % P) + P) % P, th = c.dc * P; v += u < th ? c.bas + (c.haut - c.bas) * (1 - Math.exp(-u / c.rc)) : c.haut + (c.bas - c.haut) * (1 - Math.exp(-(u - th) / c.rc)); }
      else if (c.t === 'scie') { const P = 1 / c.f, u = (((t % P) + P) % P) / P; v += u < 0.85 ? c.pp * (0.5 - u / 0.85) : c.pp * (-0.5 + (u - 0.85) / 0.15); }
      else if (c.t === 'bruit') v += c.a * (2 * alea(Math.floor(t * 2e6)) - 1);
      else if (c.t === 'uart') {
        let x = c.vh;
        if (ev != null && t >= ev) { const Tb = 1 / c.baud, Tf = 10 * Tb + c.gap, k = Math.floor((t - ev) / Tf); if (k < c.oct.length) { const b = Math.floor((t - ev - k * Tf) / Tb); if (b === 0) x = 0; else if (b <= 8) x = (c.oct[k] >> (b - 1)) & 1 ? c.vh : 0; } }
        v += x;
      }
    }
    return v;
  }
  const moyL = (L) => L.reduce((s, c) => s + (c.t === 'dc' ? c.v : c.t === 'sin' ? (c.o || 0) : c.t === 'car' ? c.bas + c.dc * (c.haut - c.bas) : c.t === 'uart' ? c.vh : 0), 0);
  const perL = (L) => Math.max(0, ...L.map((c) => (c.f ? 1 / c.f : 0)));
  // ce qu'affiche la voie k, en volts « à la pointe » d'après le réglage de sonde et le couplage
  const affV = (f, s, k, t, ev) => { const L = f.sig[k]; if (!L || s['c' + k] === 'GND') return 0; return (val(L, t, ev) - (s['c' + k] === 'AC' ? moyL(L) : 0)) * s['p' + k] / f.sonde[k]; };
  // instants où la voie source franchit le niveau dans le sens choisi
  function franchit(f, s, a, b, ev, premier) {
    const k = s.src, N = 6000, dt = (b - a) / N, out = [], avant = (v) => (s.pente === '-' ? v > s.niv : v < s.niv);
    let t0 = a, v0 = affV(f, s, k, a, ev);
    for (let i = 1; i <= N; i++) {
      const t1 = a + i * dt, v1 = affV(f, s, k, t1, ev);
      if (avant(v0) && !avant(v1)) {
        let lo = t0, hi = t1;
        for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; if (avant(affV(f, s, k, m, ev))) lo = m; else hi = m; }
        out.push(hi); if (premier) return out;
      }
      t0 = t1; v0 = v1;
    }
    return out;
  }
  // ce que montre l'écran : traces (en divisions), traces fantômes si l'image défile, état, message
  function acquis(f, s) {
    const W = 10 * s.t, ch = [1, 2].filter((k) => f.sig[k]);
    const trace = (deb, ev) => ch.map((k) => ({ k, pts: Array.from({ length: NPTS + 1 }, (_, i) => (s['o' + k] || 0) + affV(f, s, k, deb + W * i / NPTS, ev) / s['v' + k]) }));
    if (f.ev) {
      const m = { pasmono: 'Le bouton Armer sert en mode Monocoup : choisis d’abord ce mode.', vu: 'La trame est passée sans rester à l’écran : en mode Auto, l’oscilloscope rebalaye aussitôt.' };
      if (s.etat === 'capture') return { tr: trace(s.tcap - s.t, 0), etat: 'Stop', msg: s.mode === 'mono' ? 'Trame saisie et figée.' : 'Trame saisie : c’est la dernière qui a déclenché.' };
      if (s.mode === 'auto') return { tr: trace(-W, null), etat: 'Auto', msg: m[s.etat] || 'Ligne au repos : la carte n’envoie rien tant qu’on n’appuie pas sur son bouton.' };
      if (s.mode === 'mono') return { tr: [], etat: s.etat === 'arme' ? 'Armé' : 'Stop', msg: s.etat === 'arme' ? (s.rien ? 'Rien n’a déclenché : vérifie la source, le front et le niveau, puis réarme.' : 'Armé : appuie sur le bouton de la carte.') : 'Monocoup : arme l’oscilloscope, puis appuie sur le bouton de la carte.' };
      return { tr: [], etat: 'Attente', msg: s.rien ? 'Rien n’a déclenché : vérifie la source, le front et le niveau.' : (m[s.etat] || 'Normal : en attente de déclenchement.') };
    }
    const P = perL(f.sig[s.src] || []), a = 0.0123, tt = P ? franchit(f, s, a, a + 2.2 * P, null, true)[0] : undefined;
    if (tt != null) return { tr: trace(tt - s.t, null), etat: 'Déclenché', msg: '' };
    if (s.mode === 'auto') { const L = [0.13, 0.47, 0.81].map((u) => trace(a + u * Math.max(P, W), null)); return { tr: L[0], fant: L.slice(1), etat: 'Auto', msg: 'Non déclenché : l’image défile.' }; }
    return { tr: [], etat: 'Attente', msg: 'En attente de déclenchement : rien ne s’affiche.' };
  }
  // la carte envoie ses trames (bouton) : ce que l'oscilloscope en garde dépend du mode
  function envoyer(f, s) {
    s.rien = 0;
    if (s.mode === 'auto') { s.etat = 'vu'; return; }
    if (s.mode === 'mono' && s.etat !== 'arme') return;
    const u = f.sig[1].find((c) => c.t === 'uart'), Tb = 1 / u.baud, Tf = 10 * Tb + u.gap;
    const X = franchit(f, s, -2 * Tb, u.oct.length * Tf + 2 * Tb, 0, s.mode === 'mono');
    if (!X.length) { s.rien = 1; if (s.mode !== 'mono') s.etat = 'stop'; return; }
    let tc = X[0];
    if (s.mode === 'normal') { let fin = -Infinity; X.forEach((t) => { if (t >= fin) { tc = t; fin = t + 9 * s.t; } }); }
    s.etat = 'capture'; s.tcap = tc; s.cap = Math.min(u.oct.length, Math.floor(Math.max(0, tc) / Tf) + 1);
  }
  // la trace de la voie k tient-elle à l'écran, et sur combien de divisions ?
  function cadre(f, s, k) { const A = acquis(f, s), c = A.tr.find((x) => x.k === k); if (!c || A.fant) return { ok: false, span: 0 }; const mn = Math.min(...c.pts), mx = Math.max(...c.pts); return { ok: mn >= -4 && mx <= 4, span: mx - mn }; }
  function jugeOsc(f, s) {
    if (!s || typeof s !== 'object') return false;
    return f.but.every(([k, op, v]) => {
      if (k === 'cadre') { const r = cadre(f, s, op); return r.ok && r.span >= v; }
      const x = s[k];
      if (op === 'eq') return x === v;
      if (op === 'un') return v.includes(x);
      if (op === 'in') return typeof x === 'number' && x >= v[0] - 1e-12 && x <= v[1] + 1e-12;
      return false;
    });
  }
  function ecranOsc(f, s) {
    const A = acquis(f, s), D = 50, x0 = 18, y0 = 26, W = 10 * D + 2 * x0, ch = [1, 2].filter((k) => f.sig[k]), H = 8 * D + y0 + 34 + 22 * ch.length;
    const col = { 1: '#f2c94c', 2: '#56ccf2' }, Y = (y) => Math.max(y0 + 1, Math.min(y0 + 8 * D - 1, y0 + 4 * D - y * D)).toFixed(1);
    let g = `<rect width="${W}" height="${H}" rx="12" fill="#26323b"/><rect x="${x0}" y="${y0}" width="${10 * D}" height="${8 * D}" fill="#07131b"/>`;
    for (let i = 1; i < 10; i++) g += `<line x1="${x0 + i * D}" y1="${y0}" x2="${x0 + i * D}" y2="${y0 + 8 * D}" stroke="#2e4b5d" stroke-dasharray="2 5"/>`;
    for (let j = 1; j < 8; j++) g += `<line x1="${x0}" y1="${y0 + j * D}" x2="${x0 + 10 * D}" y2="${y0 + j * D}" stroke="#2e4b5d" stroke-dasharray="2 5"/>`;
    g += `<line x1="${x0}" y1="${y0 + 4 * D}" x2="${x0 + 10 * D}" y2="${y0 + 4 * D}" stroke="#4d7489"/><line x1="${x0 + 5 * D}" y1="${y0}" x2="${x0 + 5 * D}" y2="${y0 + 8 * D}" stroke="#4d7489"/>`;
    for (let k = 1; k < 50; k++) g += `<line x1="${x0 + k * D / 5}" y1="${y0 + 4 * D - 3}" x2="${x0 + k * D / 5}" y2="${y0 + 4 * D + 3}" stroke="#4d7489"/>`;
    for (let k = 1; k < 40; k++) g += `<line x1="${x0 + 5 * D - 3}" y1="${y0 + k * D / 5}" x2="${x0 + 5 * D + 3}" y2="${y0 + k * D / 5}" stroke="#4d7489"/>`;
    const chemin = (pts) => pts.map((y, i) => (i ? 'L' : 'M') + (x0 + 10 * D * i / NPTS).toFixed(1) + ' ' + Y(y)).join('');
    (A.fant || []).forEach((L) => L.forEach((c) => { g += `<path d="${chemin(c.pts)}" fill="none" stroke="${col[c.k]}" stroke-width="1.4" opacity="0.45"/>`; }));
    A.tr.forEach((c) => { g += `<path d="${chemin(c.pts)}" fill="none" stroke="${col[c.k]}" stroke-width="1.8" stroke-linejoin="round"/>`; });
    ch.forEach((k) => { const zy = +Y(s['o' + k] || 0); g += `<path d="M${x0 - 16} ${zy - 7}L${x0 - 3} ${zy}L${x0 - 16} ${zy + 7}Z" fill="${col[k]}"/>`; });
    if (f.sig[s.src]) { const ny = y0 + 4 * D - ((s['o' + s.src] || 0) + s.niv / s['v' + s.src]) * D; if (ny > y0 && ny < y0 + 8 * D) g += `<path d="M${x0 + 10 * D + 16} ${(ny - 7).toFixed(1)}L${x0 + 10 * D + 3} ${ny.toFixed(1)}L${x0 + 10 * D + 16} ${(ny + 7).toFixed(1)}Z" fill="#f2994a"/>`; }
    g += `<path d="M${x0 + D - 7} ${y0 - 13}L${x0 + D + 7} ${y0 - 13}L${x0 + D} ${y0 - 3}Z" fill="#f2994a"/>` + T(x0 + 10 * D, y0 - 8, A.etat, { fs: 14, a: 'end', c: A.etat === 'Déclenché' || A.etat === 'Stop' ? '#6fcf97' : '#f2994a', w: 700 });
    ch.forEach((k, j) => { g += T(x0, y0 + 8 * D + 26 + 22 * j, `CH${k} : ${vnom(s['v' + k])}/div · ${s['c' + k]} · sonde ×${s['p' + k]}${f.nom && f.nom[k] ? ' · ' + f.nom[k] : ''}`, { fs: 15, c: col[k], w: 600 }); });
    g += T(x0, y0 + 8 * D + 26 + 22 * ch.length, `${tnom(s.t)}/div · déclenchement CH${s.src} ${s.pente === '-' ? '↓' : '↑'} ${fmt(s.niv, 3)} V · ${MODES[s.mode]}`, { fs: 15, c: '#dfe8ee', w: 600 });
    return { svg: svg(W, H, g, 'Écran de l’oscilloscope'), msg: A.msg };
  }
  // l'écran et ses commandes
  function panneau(f, i, s, fige) {
    const E = ecranOsc(f, s), ch = [1, 2].filter((k) => f.sig[k]);
    const sel = (r, L, lab) => `<label class="tp-oc"><span>${lab}</span><select data-r="${r}">${L.map(([v, t]) => `<option value="${v}"${String(s[r]) === String(v) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
    const voie = (k) => `<fieldset class="tp-ofs"><legend>Voie ${k}${f.nom && f.nom[k] ? ' · ' + esc(f.nom[k]) : ''}</legend>${sel('v' + k, VDIV.map((v) => [v, vnom(v) + '/div']), 'Sensibilité')}${sel('c' + k, [['DC', 'DC'], ['AC', 'AC'], ['GND', 'GND']], 'Couplage')}${sel('o' + k, [4, 3, 2, 1, 0, -1, -2, -3, -4].map((v) => [v, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' div']), 'Position du zéro')}${sel('p' + k, [[1, '×1'], [10, '×10']], 'Sonde')}</fieldset>`;
    const ctl = fige ? '' : `<div class="tp-ctl">${ch.map(voie).join('')}<fieldset class="tp-ofs"><legend>Horizontal</legend>${sel('t', TDIV.map((v) => [v, tnom(v) + '/div']), 'Base de temps')}</fieldset><fieldset class="tp-ofs"><legend>Déclenchement</legend>${sel('src', ch.map((k) => [k, 'CH' + k]), 'Source')}${sel('pente', [['+', 'front montant'], ['-', 'front descendant']], 'Front')}<label class="tp-oc"><span>Niveau (V)</span><input data-r="niv" inputmode="decimal" autocomplete="off" value="${esc(String(s.niv).replace('.', ','))}"></label>${sel('mode', [['auto', 'Auto'], ['normal', 'Normal'], ['mono', 'Monocoup']], 'Mode')}</fieldset>${f.ev ? `<div class="btns"><button type="button" class="b sec" data-arm="${i}">Armer</button><button type="button" class="b" data-ev="${i}">${esc(f.evb || 'Appuyer sur le bouton de la carte')}</button></div>` : ''}</div>`;
    return `<div class="tp-osc" data-f="${i}"><div class="tp-ecr">${E.svg}</div><p class="tp-ost">${esc(E.msg)}</p>${ctl}</div>`;
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
    let Psim = Math.round(Pmoy / (1 + (Math.random() < 0.5 ? 1 : -1) * delta / 100)); if (Math.abs(Pmoy - Psim) < 0.3) Psim += 1;
    const ecS = Math.abs(Pmoy - Psim) / Psim * 100;
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


  /* =====================================================================
     Banc 4 — l'oscilloscope en main : une carte à microcontrôleur
     Rapport de l'interne 2025 : des candidats ne savent pas utiliser la synchronisation, le couplage AC/DC,
     le déclenchement monocoup. On règle soi-même l'oscilloscope, comme au labo.
     ===================================================================== */
  const champOsc = (o) => Object.assign({ k: 'osc', c: 'mes', sonde: { 1: 10, 2: 10 } }, o);
  const bases = (a, b) => TDIV.filter((t) => t >= a * (1 - 1e-9) && t <= b * (1 + 1e-9));
  const lesBases = (L) => L.map(tnom).join(' ou ') + '/div';
  const SUB = (x) => `<tspan baseline-shift="sub" font-size="10">${x}</tspan>`;
  function schemaCarte() {
    let s = `<rect x="16" y="40" width="116" height="62" rx="8" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(74, 66, 'bloc secteur', { a: 'middle', fs: 13 }) + T(74, 86, '5 V', { a: 'middle', fs: 14, w: 700 });
    s += `<path d="M132 71 H176" stroke="#183047" stroke-width="2.5"/><rect x="176" y="20" width="236" height="214" rx="10" fill="#e8f3ec" stroke="#2f6f4e" stroke-width="2"/>` + T(294, 44, 'carte à microcontrôleur', { a: 'middle', w: 700, fs: 14, c: '#2f6f4e' });
    s += `<rect x="196" y="62" width="84" height="74" rx="4" fill="#183047"/>` + T(238, 104, 'µC', { a: 'middle', c: '#fff', w: 700, fs: 17 }) + `<circle cx="214" cy="190" r="11" fill="#c9483b"/>` + T(232, 195, 'bouton', { fs: 13 });
    s += `<rect x="300" y="160" width="84" height="40" rx="5" fill="#fff" stroke="#587083"/>` + T(342, 185, 'filtre RC', { a: 'middle', fs: 12 });
    ['MLI', '+5 V', 'TX série', 'capteur', 'entrée filtre', 'sortie filtre'].forEach((t, k) => { const y = 66 + 28 * k; s += `<line x1="412" y1="${y}" x2="436" y2="${y}" stroke="#183047" stroke-width="2"/><circle cx="440" cy="${y}" r="5" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(452, y + 5, `TP${k + 1} · ${t}`, { fs: 13 }); });
    s += T(16, 258, 'Oscilloscope numérique à deux voies, deux sondes ×10 ; masses des sondes sur la masse de la carte.', { fs: 12, c: '#587083' });
    return svg(640, 268, s, 'La carte, ses points de test et l’oscilloscope');
  }
  function genOscillo() {
    const VH = tire([3.3, 5]);
    // 1. un créneau MLI : déclenchement
    const fP = Math.round(al(700, 2600) / 10) * 10, dcy = tire([0.25, 0.4, 0.6, 0.75]), TP = 1 / fP, b1 = bases(TP / 5, TP / 2), v1 = VH === 5 ? 1 : 0.5;
    const f1 = champOsc({ l: 'L’oscilloscope', nom: { 1: 'TP1 · MLI', 2: 'non branchée' },
      sig: { 1: [{ t: 'car', bas: 0, haut: VH, f: fP, dc: dcy, rc: 1.5e-6 }], 2: [{ t: 'dc', v: 0 }] },
      init: { v1: 5, v2: 1, c1: 'DC', c2: 'DC', o1: 0, o2: -2, p1: 10, p2: 10, t: TDIV.find((x) => x >= 2 * TP), src: 2, pente: '+', niv: 1.5, mode: 'auto', etat: 'stop' },
      but: [['src', 'eq', 1], ['niv', 'in', [0.15 * VH, 0.85 * VH]], ['mode', 'un', ['auto', 'normal']], ['t', 'in', [TP / 5, TP / 2]], ['cadre', 1, 4]],
      att: `déclenchement sur CH1, niveau entre ${F(0.15 * VH)} et ${F(0.85 * VH)} V, mode Auto ou Normal ; ${lesBases(b1)} pour 2 à 5 périodes ; ${vnom(v1)}/div et zéro à −3 div, pour que le créneau tienne en entier sur au moins 4 divisions` });
    f1.sol = Object.assign({}, f1.init, { v1, o1: -3, t: b1[0], src: 1, niv: dec(VH / 2, 2) });
    // 2. l'ondulation du +5 V : couplage AC
    const vR = tire([0.005, 0.01, 0.02]), rip = dec(vR * al(4.4, 6.4), 4), Vdc = dec(al(4.97, 5.06), 3);
    const seuilR = tire([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15].filter((x) => Math.abs(x - rip) / rip >= 0.2)), okR = rip <= seuilR;
    const f2 = champOsc({ l: 'L’oscilloscope', nom: { 1: 'TP2 · +5 V' },
      sig: { 1: [{ t: 'dc', v: Vdc }, { t: 'scie', pp: rip, f: 100 }, { t: 'bruit', a: 0.0004 }] },
      init: { v1: 1, c1: 'DC', o1: -3, p1: 10, t: 5e-3, src: 1, pente: '+', niv: 2.5, mode: 'auto', etat: 'stop' },
      but: [['c1', 'eq', 'AC'], ['src', 'eq', 1], ['niv', 'in', [-0.3 * rip, 0.3 * rip]], ['mode', 'un', ['auto', 'normal']], ['t', 'in', [2e-3, 5e-3]], ['cadre', 1, 4]],
      att: `couplage AC (il retire les ${F(Vdc)} V continus), ${vnom(vR)}/div, zéro au centre ; déclenchement sur CH1 à 0 V (entre ${F(-300 * rip)} et ${F(300 * rip)} mV), Auto ou Normal ; 2 ou 5 ms/div pour voir 2 à 5 périodes de 10 ms` });
    f2.sol = Object.assign({}, f2.init, { v1: vR, c1: 'AC', o1: 0, t: 2e-3, niv: 0 });
    // 3. une trame série unique : monocoup
    const nomB = tire([9600, 19200]), eps = (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.5 ? al(0.3, 0.9) : al(3.2, 4.6)) / 100, baud = nomB * (1 + eps), Tb = 1 / baud;
    const CAR = [...'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'], c1 = tire(CAR), c2 = tire(CAR.filter((x) => x !== c1)), o1c = c1.charCodeAt(0), o2c = c2.charCodeAt(0);
    const b3 = bases(10 * Tb / 9, 10 * Tb / 4);
    const f3 = champOsc({ l: 'L’oscilloscope', nom: { 1: 'TP3 · TX série' }, ev: 1, evb: 'Appuyer sur le bouton de la carte',
      sig: { 1: [{ t: 'uart', vh: VH, baud, oct: [o1c, o2c], gap: al(4, 9) * Tb }] },
      init: { v1: 2, c1: 'DC', o1: -2, p1: 10, t: 1e-3, src: 1, pente: '+', niv: dec(VH / 2, 2), mode: 'auto', etat: 'stop' },
      but: [['mode', 'eq', 'mono'], ['src', 'eq', 1], ['pente', 'eq', '-'], ['niv', 'in', [0.15 * VH, 0.85 * VH]], ['etat', 'eq', 'capture'], ['cap', 'eq', 1], ['t', 'in', [10 * Tb / 9, 10 * Tb / 4]], ['cadre', 1, 2.5]],
      att: `mode Monocoup, source CH1, front descendant (le bit de start fait tomber la ligne de ${F(VH)} V à 0), niveau vers ${F(VH / 2)} V ; ${lesBases(b3)} pour que la trame de 10 bits tienne à l’écran ; armer, puis appuyer sur le bouton : la première trame reste figée` });
    { const s = Object.assign({}, f3.init, { v1: 1, o1: -2, t: b3[0], pente: '-', mode: 'mono', etat: 'arme' }); envoyer(f3, s); f3.sol = s; }
    const bitsL = Array.from({ length: 8 }, (_, j) => (o1c >> j) & 1), bin8 = o1c.toString(2).padStart(8, '0'), hex = o1c.toString(16).toUpperCase();
    // 4. le débit, aux curseurs
    const t4 = b3[0], d9 = sig(9 * Tb * 1e6, 4), baudA = 9 / (d9 * 1e-6), ecB = Math.abs(baudA - nomB) / nomB * 100, okB = ecB <= 2;
    const uart = (t) => val(f3.sig[1], t - t4, 0);
    const fig4 = osc({ tdiv: t4, trig: 1, alt: 'Trame série figée, avec deux curseurs', ch: [{ f: uart, div: 1, z: -2, c: '#f2c94c', marche: 1, n: 6000, w: 2 }],
      curs: [{ x: 1, t: 'C1' }, { x: 1 + 9 * Tb / t4, t: 'C2' }], lect: `Δt = ${fmt(d9, 4)} µs`,
      bas: [[`CH1 : 1 V/div · sonde ×10 · TX série`, '#f2c94c'], [`Base de temps : ${tnom(t4)}/div · monocoup`, '#dfe8ee']] });
    // 5. la sonde ×10
    // la sensibilité d'abord, puis une amplitude qui y tient sur 4,4 à 7,2 divisions
    const vS = tire([0.1, 0.2, 0.5]), aS = dec(vS * al(2.2, 3.6), 2), fs5 = Math.round(al(80, 400)), off = dec(VH / 2, 2), T5 = 1 / fs5, b5 = bases(T5 / 5, T5 / 2);
    let sol5 = null;
    for (const o of [0, -1, -2, -3, -4]) if (!sol5 && o + (off - aS) / vS >= -3.8 && o + (off + aS) / vS <= 3.8) sol5 = { v1: vS, c1: 'DC', o1: o, niv: off };
    if (!sol5) sol5 = { v1: vS, c1: 'AC', o1: 0, niv: 0 };
    const f5 = champOsc({ l: 'L’oscilloscope', nom: { 1: 'TP4 · capteur' },
      sig: { 1: [{ t: 'sin', o: off, a: aS, f: fs5 }] },
      init: { v1: 0.1, c1: 'DC', o1: -2, p1: 1, t: b5[0], src: 1, pente: '+', niv: dec(off / 10, 3), mode: 'auto', etat: 'stop' },
      but: [['p1', 'eq', 10], ['src', 'eq', 1], ['mode', 'un', ['auto', 'normal']], ['t', 'in', [T5 / 5, T5 / 2]], ['cadre', 1, 4]],
      att: `voie réglée sur sonde ×10, puisque c’est une sonde ×10 qui est branchée ; puis ${vnom(sol5.v1)}/div en ${sol5.c1}${sol5.c1 === 'DC' ? ` avec le zéro à ${sol5.o1} div` : ''}, et le niveau de déclenchement repris dans le signal, pour qu’il tienne sur au moins 4 divisions` });
    f5.sol = Object.assign({}, f5.init, sol5, { p1: 10 });
    // 6. le repliement
    const kA = tire([1, 2]), fA = Math.round(kA * NPTS / (10 * 0.02) + al(12, 28)), TA = 1 / fA, b6 = bases(TA / 5, TA / 2), fAl = Math.abs(fA - kA * NPTS / 0.2);
    const f6 = champOsc({ l: 'L’oscilloscope', nom: { 1: 'TP5 · entrée filtre' },
      sig: { 1: [{ t: 'sin', o: 0, a: 1, f: fA }] },
      init: { v1: 0.5, c1: 'DC', o1: 0, p1: 10, t: 0.02, src: 1, pente: '+', niv: 0, mode: 'auto', etat: 'stop' },
      but: [['t', 'in', [TA / 5, TA / 2]], ['src', 'eq', 1], ['niv', 'in', [-0.7, 0.7]], ['mode', 'un', ['auto', 'normal']], ['cadre', 1, 3]],
      att: `${lesBases(b6)}, pour voir 2 à 5 vraies périodes ; le reste pouvait rester tel quel` });
    f6.sol = Object.assign({}, f6.init, { t: b6[0] });
    // 7. le déphasage du filtre RC
    let R7, C7, fcN; do { R7 = tire([1000, 2200, 4700, 10000]); C7 = tire([10e-9, 22e-9, 47e-9, 100e-9]); fcN = 1 / (2 * Math.PI * R7 * C7); } while (fcN < 250 || fcN > 3500);
    const bonC = Math.random() < 0.55, Cr = bonC ? C7 * (1 + al(-0.08, 0.08)) : C7 * tire([2.2, 0.47]), fcR = 1 / (2 * Math.PI * R7 * Cr);
    const f7 = Math.round(fcR * al(0.6, 1.6) / 10) * 10, phi = Math.atan(f7 / fcR), dt7 = phi / (2 * Math.PI * f7);
    const dtA = sig(dt7 * 1e6, 3), phiA = 360 * f7 * dtA * 1e-6, fcM = f7 / Math.tan(phiA * Math.PI / 180), ecF = Math.abs(fcM - fcN) / fcN * 100, okF = ecF <= 10;
    const t7 = bases(1 / (5 * f7), 1 / (2 * f7))[0], G = 1 / Math.hypot(1, f7 / fcR);
    const fig7 = osc({ tdiv: t7, alt: 'Entrée et sortie du filtre, curseurs sur les passages par zéro', ch: [{ f: (t) => Math.sin(2 * Math.PI * f7 * (t - 2 * t7)), div: 0.5, z: 0, c: '#f2c94c', n: 1500, w: 2 }, { f: (t) => G * Math.sin(2 * Math.PI * f7 * (t - 2 * t7 - dt7)), div: 0.5, z: 0, c: '#56ccf2', n: 1500, w: 2 }],
      curs: [{ x: 2, t: 'C1' }, { x: 2 + dt7 / t7, t: 'C2' }], lect: `Δt = ${fmt(dtA, 3)} µs`,
      bas: [['CH1 : 0,5 V/div · entrée du filtre', '#f2c94c'], ['CH2 : 0,5 V/div · sortie du filtre', '#56ccf2'], [`Base de temps : ${tnom(t7)}/div`, '#dfe8ee']] });
    const intro = `<p><b>Le banc.</b> Une carte à microcontrôleur, alimentée par un bloc secteur 5 V, pilote une sortie MLI, lit un capteur à travers un filtre RC et envoie ses mesures par liaison série quand on appuie sur son bouton. Points de test TP1 à TP6 ; oscilloscope numérique à deux voies, deux sondes ×10.</p>
      <p><b>La problématique.</b> La carte envoie parfois des mesures fausses. L’alimentation, la liaison série ou le filtre du capteur sont-ils en cause ?</p>
      <p><b>Le cahier des charges.</b> Ondulation du +5 V au plus ${F(seuilR * 1000)} mV crête à crête ; liaison série à ${F(nomB, 5)} bauds, à ± 2 % ; fréquence de coupure du filtre à ± 10 % de sa valeur nominale.</p>`;
    const qsL = [
      { t: 'Une image stable', lab: 'Conduire la mesure · déclenchement', text: '<p>CH1 est sur la sortie MLI (TP1) ; rien n’est branché sur CH2. L’oscilloscope a été mal réglé : l’image défile. Règle-le pour obtenir une image stable, avec 2 à 5 périodes à l’écran et le créneau entier sur au moins 4 divisions. Puis mesure.</p>', fig: schemaCarte(),
        fields: [f1, num('Fréquence f du signal MLI', fP, 'Hz', 'exp', { tol: 0.04 }), num('Rapport cyclique', dcy * 100, '%', 'exp', { abs: 3 })],
        corr: `L’image défilait parce que l’oscilloscope se déclenchait sur CH2, où rien n’est branché : le niveau de 1,5 V n’y est jamais franchi, et en Auto l’oscilloscope balaye quand même, à des instants quelconques. On déclenche sur le signal qu’on regarde (CH1), à un niveau qu’il franchit (entre 0 et ${F(VH)} V). Une période dure ${F(TP * 1e6)} µs : pour 2 à 5 périodes sur 10 divisions, ${lesBases(b1)}. Mesures : T = ${F(TP * 1e6)} µs, donc f = 1 / T = <b>${F(fP, 4)} Hz</b> ; l’état haut dure ${F(dcy * TP * 1e6)} µs, soit un rapport cyclique de <b>${F(dcy * 100)} %</b>.`,
        hint: 'Sur quelle voie se déclenche l’oscilloscope ? Ce niveau est-il franchi par le signal ?' },
      { t: 'L’ondulation de l’alimentation', lab: 'Conduire la mesure · couplage AC', text: `<p>CH1 est maintenant sur le +5 V (TP2). Le multimètre lit ${F(Vdc)} V. Règle l’oscilloscope pour mesurer l’ondulation : elle doit occuper au moins 4 divisions, sur une image stable.</p>`, fig: rangee(afficheur('Multimètre (continu) sur TP2', F(Vdc), 'V')),
        fields: [Object.assign({}, f2), num('Ondulation crête à crête', rip * 1000, 'mV', 'exp', { tol: 0.1 }), choix(`L’ondulation est-elle sous ${F(seuilR * 1000)} mV ?`, okR ? 'Oui' : 'Non', [okR ? 'Non' : 'Oui'], 'ecart')],
        corr: `En couplage DC, la trace est à ${F(Vdc)} V : à quelques millivolts par division, elle sortirait de l’écran. Le couplage AC retire la composante continue (un condensateur en série dans la voie) : il ne reste que l’ondulation, qu’on grossit à ${vnom(vR)}/div. Elle fait <b>${F(rip * 1000)} mV</b> crête à crête, à 100 Hz : le redressement double alternance du bloc secteur. ${okR ? `C’est sous ${F(seuilR * 1000)} mV : tenu.` : `C’est au-dessus de ${F(seuilR * 1000)} mV : non tenu, l’alimentation peut fausser les conversions du capteur.`} Attention : le couplage AC déforme les signaux très lents ; pour une valeur continue, on revient en DC.`,
        hint: 'Comment voir quelques dizaines de millivolts posés sur 5 V ?' },
      { t: 'Saisir une trame unique', lab: 'Conduire la mesure · monocoup', text: `<p>CH1 est sur la ligne TX de la liaison série (TP3), au repos à ${F(VH)} V. Quand on appuie sur le bouton, la carte envoie deux trames l’une après l’autre, puis plus rien. Saisis la première et décode-la.</p>`, fig: schemaCarte(),
        fields: [f3, num('Octet de la première trame (en décimal, ou en hexadécimal avec 0x)', o1c, '', 'exp', { abs: 0.5 }), num('Durée d’un bit T<sub>b</sub>', Tb * 1e6, 'µs', 'exp', { tol: 0.04 })],
        corr: `En Auto, la trame traverse l’écran et disparaît. En Normal, l’oscilloscope se redéclenche sur la seconde trame et garde la dernière. En Monocoup, il s’arme, attend le premier front descendant (le bit de start fait tomber la ligne à 0) et fige ce qu’il a vu. Lecture : start à 0, puis 8 bits de données, poids faible en premier, puis stop à 1. Bits dans l’ordre d’arrivée : ${bitsL.join(' ')} ; remis poids fort à gauche : ${bin8} = <b>${o1c}</b> = 0x${hex}, le caractère « ${c1} » en ASCII. Du début du start au début du stop, il y a 9 bits : T<sub>b</sub> ≈ <b>${F(Tb * 1e6)} µs</b>.`,
        hint: 'Une trame qui ne passe qu’une fois : quel mode garde l’image ? Et sur quel front commence une trame série ?' },
      { t: 'Le débit de la liaison', lab: 'Exploiter · quantifier l’écart', text: `<p>Les curseurs encadrent le start et les 8 bits de données (du premier front descendant au front montant du stop). La liaison doit tourner à ${F(nomB, 5)} bauds, à ± 2 %.</p>`, fig: fig4,
        fields: [num('Débit réel', baudA, 'bauds', 'exp', { tol: 0.01 }), num('Écart relatif au débit nominal', ecB, '%', 'ecart', { abs: 0.3 }), choix('Le débit est-il conforme ?', okB ? 'Oui' : 'Non', [okB ? 'Non' : 'Oui'], 'ecart')],
        corr: `Δt = ${fmt(d9, 4)} µs pour 9 bits : T<sub>b</sub> = ${F(d9 / 9)} µs, débit = 1 / T<sub>b</sub> = <b>${F(baudA, 4)} bauds</b>. Écart = |${F(baudA, 4)} − ${F(nomB, 5)}| / ${F(nomB, 5)} = <b>${F(ecB, 2)} %</b> : ${okB ? 'dans les ± 2 %, conforme.' : 'au-delà de ± 2 %, non conforme. Le récepteur lit chaque bit de plus en plus loin de son milieu et se trompe sur les derniers : d’où des mesures fausses. Cause probable : l’oscillateur RC interne du microcontrôleur ; un quartz règle le problème.'}`,
        hint: 'Combien de bits entre les deux curseurs ?' },
      { t: 'La sonde ×10', lab: 'Conduire la mesure · sonde', text: `<p>CH1 est sur la sortie du capteur (TP4). Le multimètre lit ${F(off)} V en continu, mais l’oscilloscope affiche un signal autour de ${F(off / 10)} V. Corrige le réglage, puis mesure l’amplitude crête à crête, le signal occupant au moins 4 divisions.</p>`, fig: rangee(afficheur('Multimètre (continu) sur TP4', F(off), 'V')),
        fields: [f5, num('Amplitude crête à crête du signal du capteur', 2 * aS, 'V', 'exp', { tol: 0.07 }), choix('Pourquoi l’écran affichait-il 10 fois moins ?', 'La voie était réglée pour une sonde ×1, alors que la sonde branchée divise par 10', ['La voie était en couplage AC', 'Le capteur était mal alimenté', 'La base de temps était trop lente'], 'crit')],
        corr: `La sonde ×10 divise la tension par 10 avant l’oscilloscope ; si la voie est réglée sur ×1, l’oscilloscope ne remultiplie pas, et tout s’affiche 10 fois trop petit : ${F(off / 10)} V au lieu de ${F(off)} V. Réglée sur ×10, la voie montre le vrai signal : <b>${F(2 * aS)} V</b> crête à crête (${F(aS)} V d’amplitude autour de ${F(off)} V).${sol5.c1 === 'AC' ? ` Pour le grossir, le couplage AC retire les ${F(off)} V continus.` : ''} Réflexe : avant toute mesure, vérifier que la voie connaît la sonde branchée.`,
        hint: 'Compare la valeur du multimètre et celle de l’écran. Quel réglage de voie fait un facteur 10 ?' },
      { t: 'Une fausse sinusoïde', lab: 'Analyse critique · repliement', text: '<p>CH1 est sur l’entrée du filtre (TP5). À cette base de temps, l’écran montre une belle sinusoïde lente. Trop belle ? Règle la base de temps pour voir le vrai signal, et mesure sa fréquence.</p>',
        fields: [f6, num('Fréquence réelle du signal', fA, 'Hz', 'exp', { tol: 0.04 }), choix('Pourquoi l’image de départ était-elle fausse ?', 'À cette base de temps, l’oscilloscope prenait moins de deux points par période : il dessinait une fausse sinusoïde lente (repliement)', ['Le déclenchement était mal réglé', 'La sonde était mal compensée', 'Le signal a changé de fréquence entre-temps'], 'crit')],
        corr: `À 20 ms/div, l’écran couvre 200 ms avec 500 points : un point toutes les 0,4 ms, soit 2 500 points par seconde. Le signal fait ${F(fA, 4)} Hz : moins de deux points par période. L’oscilloscope relie des points pris à des endroits différents de périodes différentes et dessine une fausse sinusoïde de |${F(fA, 4)} − ${F(kA * 2500, 4)}| = ${F(fAl)} Hz : c’est le repliement. À ${lesBases(b6)}, on voit les vraies périodes : T = ${F(TA * 1e6)} µs, f = <b>${F(fA, 4)} Hz</b>. Réflexe : changer de base de temps et vérifier que la fréquence lue ne change pas.`,
        hint: 'Combien de points l’oscilloscope prend-il sur l’écran entier ? Et combien de périodes du signal y a-t-il ?' },
      { t: 'Le filtre du capteur', lab: 'Confronter modèle et mesure', text: `<p>Un sinus de ${F(f7, 4)} Hz entre dans le filtre RC passe-bas (R = ${F(R7 / 1000)} kΩ, C = ${F(C7 * 1e9)} nF, condensateur à ± 10 %). Les curseurs mesurent le retard Δt entre les passages par zéro, en montant, de l’entrée et de la sortie.</p>`, fig: fig7,
        fields: [num('Déphasage |φ| de la sortie sur l’entrée', phiA, '°', 'exp', { tol: 0.03 }), num('Fréquence de coupure mesurée f<sub>c</sub> = f / tan |φ|', fcM, 'Hz', 'mod', { tol: 0.04 }),
          choix(`Comparée à 1 / (2πRC) = ${F(fcN)} Hz`, okF ? 'L’écart reste sous les 10 % de tolérance : le filtre est conforme' : 'L’écart dépasse les 10 % : le condensateur monté n’est pas le bon', [okF ? 'L’écart dépasse les 10 % : le condensateur monté n’est pas le bon' : 'L’écart reste sous les 10 % de tolérance : le filtre est conforme', 'On ne peut pas comparer sans la réponse à un échelon'], 'ecart')],
        corr: `|φ| = 360° × f × Δt = 360 × ${F(f7, 4)} × ${F(dtA)} × 10<sup>−6</sup> = <b>${F(phiA)}°</b>. Pour un passe-bas du premier ordre, tan |φ| = f / f<sub>c</sub>, donc f<sub>c</sub> = ${F(f7, 4)} / tan(${F(phiA)}°) = <b>${F(fcM)} Hz</b>. Écart avec ${F(fcN)} Hz : ${F(ecF, 2)} %. ${okF ? 'Sous les 10 % de tolérance : conforme.' : 'Bien au-delà des 10 % : le condensateur (ou la résistance) monté n’est pas celui du schéma ; le filtre ne coupe pas là où il faut.'}`,
        hint: 'Un retard Δt sur une période T, c’est un déphasage de 360° × Δt / T.' },
      { t: 'La séance', lab: 'Transposer en séance', text: '<p>Pour ta séance (BTS ou BUT), il faut un protocole nouveau, différent de ce que tu viens de faire, et une évaluation qui regarde la démarche autant que le résultat.</p>', fig: schemaCarte(),
        fields: [choix('Protocole nouveau', 'Un signal inconnu à stabiliser, puis une trame à saisir en monocoup, avec une fiche où chaque réglage est justifié : source, front, niveau, mode, base de temps, couplage', ['Relever des valeurs sur un écran déjà réglé par le professeur', 'Laisser la touche Autoset tout régler', 'Retirer la terre de l’oscilloscope pour mesurer plus facilement'], 'seance'),
          choix('Ce que tu évalues', 'La justification de chaque réglage, puis la mesure avec son unité', ['Le temps mis pour obtenir une image', 'Le nombre de réglages essayés', 'La seule valeur finale'], 'seance')],
        corr: 'L’Autoset règle tout sans faire réfléchir, et échoue sur une trame unique. Un écran déjà réglé ne fait travailler que la lecture. Retirer la terre de l’oscilloscope est interdit : sa carcasse pourrait se retrouver sous tension. Un signal inconnu, puis une trame à saisir, avec des réglages à justifier, fait travailler ce que le jury reproche aux candidats eux-mêmes : déclenchement, couplage, monocoup. On évalue la démarche (chaque réglage justifié) autant que la valeur trouvée.' },
    ];
    const bilan = [`MLI : ${F(fP, 4)} Hz, rapport cyclique ${F(dcy * 100)} %.`,
      `Ondulation du +5 V : ${F(rip * 1000)} mV crête à crête, à 100 Hz (limite ${F(seuilR * 1000)} mV : ${okR ? 'tenue' : 'dépassée'}), mesurée en couplage AC.`,
      `Liaison série : premier octet ${o1c} (« ${c1} »), 9 bits en ${fmt(d9, 4)} µs, débit ${F(baudA, 4)} bauds pour ${F(nomB, 5)} nominaux, écart ${F(ecB, 2)} % (± 2 % : ${okB ? 'conforme' : 'non conforme, oscillateur à corriger'}).`,
      `Sonde ×10 mal déclarée : affichage 10 fois trop faible, corrigé ; signal du capteur ${F(2 * aS)} V crête à crête.`,
      `Repliement à 20 ms/div : fausse sinusoïde de ${F(fAl)} Hz ; vraie fréquence ${F(fA, 4)} Hz.`,
      `Filtre RC : f_c mesurée ${F(fcM)} Hz pour ${F(fcN)} Hz nominaux, écart ${F(ecF, 2)} % : ${okF ? 'conforme' : 'mauvais composant'}.`];
    return { intro, bilan, prob: `La carte envoie parfois des mesures fausses : l’alimentation (ondulation ≤ ${F(seuilR * 1000)} mV), la liaison série (${F(nomB, 5)} bauds ± 2 %) ou le filtre du capteur (± 10 %) sont-ils en cause ?`, qs: qsL };
  }

  /* =====================================================================
     Banc 5 — bus I2C : le capteur ne répond plus en mode rapide
     Rapport de l'interne 2025 : connaissances insuffisantes sur les bus I2C et CAN.
     Norme I2C : t_r (30 % → 70 % de V_DD) ≤ 1 000 ns à 100 kHz, ≤ 300 ns à 400 kHz ; 3 mA au plus à l'état bas, V_OL ≤ 0,4 V.
     ===================================================================== */
  function schemaI2C(Rp) {
    const res = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#183047" stroke-width="2"/><rect x="${x - 6}" y="${(y1 + y2) / 2 - 15}" width="12" height="30" fill="#fff" stroke="#183047" stroke-width="2"/>`;
    let s = `<rect x="16" y="86" width="144" height="120" rx="8" fill="#183047"/>` + T(88, 140, 'microcontrôleur', { a: 'middle', c: '#fff', fs: 13, w: 700 }) + T(88, 160, '(maître)', { a: 'middle', c: '#cfe0ea', fs: 12 });
    s += `<rect x="480" y="86" width="144" height="120" rx="8" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(552, 140, 'capteur', { a: 'middle', fs: 13, w: 700 }) + T(552, 160, '(esclave)', { a: 'middle', fs: 12 });
    s += `<path d="M160 120 H480 M160 172 H480" stroke="#183047" stroke-width="2.5"/>` + T(170, 114, 'SCL', { fs: 13, w: 700 }) + T(170, 166, 'SDA', { fs: 13, w: 700 });
    s += `<line x1="196" y1="40" x2="262" y2="40" stroke="#c9483b" stroke-width="2.5"/>` + T(268, 45, `V${SUB('DD')} = 3,3 V`, { fs: 13, c: '#c9483b', w: 700 }) + res(206, 40, 120) + res(246, 40, 172) + `<circle cx="206" cy="120" r="3.5" fill="#183047"/><circle cx="246" cy="172" r="3.5" fill="#183047"/>` + T(194, 76, `R${SUB('p')}`, { fs: 13, w: 700, a: 'end' }) + T(194, 96, `${F(Rp / 1000)} kΩ`, { fs: 12, a: 'end' });
    s += `<rect x="300" y="102" width="130" height="88" rx="6" fill="none" stroke="#8a4513" stroke-dasharray="5 4"/>` + T(365, 210, 'câble rallongé', { a: 'middle', fs: 12, c: '#8a4513' });
    s += `<circle cx="456" cy="120" r="5" fill="#f2c94c" stroke="#183047"/><circle cx="456" cy="172" r="5" fill="#56ccf2" stroke="#183047"/>` + T(440, 236, 'sondes : CH1 sur SCL, CH2 sur SDA', { fs: 12, c: '#587083', a: 'middle' });
    return svg(640, 248, s, 'Le bus I2C du banc');
  }
  function genI2C() {
    const VDD = 3.3, Rp = tire([4700, 10000]), Cb = (Rp === 4700 ? al(95, 215) : al(45, 102)) * 1e-12, tau = Rp * Cb, tr = 0.8473 * tau;
    const addr = tire([0x18, 0x19, 0x40, 0x44, 0x45, 0x48, 0x49, 0x4a, 0x4b, 0x5c, 0x68, 0x76, 0x77]), rw = tire([0, 1]), data = Math.floor(al(16, 240));
    const fSCL = Math.round(al(92, 100)) * 1000, Tb = 1 / fSCL;
    // la trame à 100 kHz : instants des changements de SCL et de SDA (lignes à drain ouvert)
    const bits = []; for (let j = 6; j >= 0; j--) bits.push((addr >> j) & 1); bits.push(rw, 0); for (let j = 7; j >= 0; j--) bits.push((data >> j) & 1); bits.push(rw ? 1 : 0);
    const t0 = 0.8 * Tb, scl = [[0, 1], [t0 + 0.4 * Tb, 0]], sda = [[0, 1], [t0, 0]]; let niv = 0;
    bits.forEach((b, j) => { const tl = t0 + 0.4 * Tb + j * Tb; if (b !== niv) { sda.push([tl + 0.25 * Tb, b]); niv = b; } scl.push([tl + 0.5 * Tb, 1], [tl + Tb, 0]); });
    const ligne = (L) => (t) => { let k = 0; for (let j = 0; j < L.length; j++) if (L[j][0] <= t) k = j; const [ti, n] = L[k], d = t - ti; return k === 0 ? (n ? VDD : 0) : n ? VDD * (1 - Math.exp(-d / tau)) : VDD * Math.exp(-d / 15e-9); };
    const t20 = 2e-5, trame = (o) => osc(Object.assign({ tdiv: t20, trig: t0 / t20, alt: 'Début d’un échange I2C : SCL et SDA', ch: [{ f: ligne(scl), div: 2, z: 0.6, c: '#f2c94c', n: 2400, w: 1.8 }, { f: ligne(sda), div: 2, z: -2.8, c: '#56ccf2', n: 2400, w: 1.8 }],
      bas: [['CH1 : 2 V/div · sonde ×10 · SCL', '#f2c94c'], ['CH2 : 2 V/div · sonde ×10 · SDA', '#56ccf2'], ['Base de temps : 20 µs/div · monocoup sur SDA ↓', '#dfe8ee']] }, o || {}));
    const tR1 = t0 + 0.9 * Tb, d8 = sig(8 * Tb * 1e6, 4);
    const bin = addr.toString(2).padStart(7, '0'), hex = addr.toString(16).toUpperCase();
    // le front montant de SDA, zoomé
    const t2 = 2e-7, fr = (t) => (t < 1.5 * t2 ? 0 : VDD * (1 - Math.exp(-(t - 1.5 * t2) / tau)));
    const figR = osc({ tdiv: t2, alt: 'Front montant de SDA, zoomé', ch: [{ f: fr, div: 0.5, z: -3.3, c: '#56ccf2', n: 1500, w: 2 }],
      hls: [{ y: -3.3 + 0.3 * VDD / 0.5, t: `30 % de V${SUB('DD')}` }, { y: -3.3 + 0.7 * VDD / 0.5, t: `70 % de V${SUB('DD')}` }],
      bas: [['CH2 : 0,5 V/div · sonde ×10 · SDA', '#56ccf2'], ['Base de temps : 200 ns/div · bus à 400 kHz', '#dfe8ee']] });
    const CbP = Cb * 1e12, RpMax = 300e-9 / (0.8473 * Cb), E12 = [1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200];
    const Rbon = E12.filter((r) => r <= 0.9 * RpMax).pop() || 1000, kO = (r) => (r >= 1000 ? `${F(r / 1000)} kΩ` : `${r} Ω`);
    const figRC = svg(640, 210, `<line x1="80" y1="30" x2="200" y2="30" stroke="#c9483b" stroke-width="2.5"/>` + T(206, 35, `V${SUB('DD')} = 3,3 V`, { fs: 13, c: '#c9483b', w: 700 }) + `<line x1="130" y1="30" x2="130" y2="60" stroke="#183047" stroke-width="2"/><rect x="122" y="60" width="16" height="44" fill="#fff" stroke="#183047" stroke-width="2"/>` + T(150, 88, `R${SUB('p')} = ${F(Rp / 1000)} kΩ`, { fs: 13 }) + `<line x1="130" y1="104" x2="130" y2="128" stroke="#183047" stroke-width="2"/><line x1="40" y1="128" x2="330" y2="128" stroke="#183047" stroke-width="2.5"/>` + T(336, 133, 'SDA', { fs: 13, w: 700 }) + `<line x1="250" y1="128" x2="250" y2="150" stroke="#183047" stroke-width="2"/><line x1="232" y1="150" x2="268" y2="150" stroke="#183047" stroke-width="3"/><line x1="232" y1="158" x2="268" y2="158" stroke="#183047" stroke-width="3"/><line x1="250" y1="158" x2="250" y2="180" stroke="#183047" stroke-width="2"/><path d="M238 180 H262 M243 186 H257 M248 192 H252" stroke="#183047" stroke-width="2"/>` + T(276, 160, `C${SUB('b')} : câble, entrées, sondes`, { fs: 13 }) + `<line x1="60" y1="128" x2="60" y2="150" stroke="#183047" stroke-width="2"/><rect x="44" y="150" width="32" height="28" rx="3" fill="#eef5f8" stroke="#12566f"/>` + T(60, 170, 'T', { a: 'middle', fs: 13, w: 700 }) + T(96, 200, 'drain ouvert : T tire à 0, R<tspan baseline-shift="sub" font-size="10">p</tspan> remonte', { fs: 12, c: '#587083' }) + T(470, 60, 'montée : charge de C<tspan baseline-shift="sub" font-size="10">b</tspan> par R<tspan baseline-shift="sub" font-size="10">p</tspan>', { fs: 13, a: 'middle', c: '#12566f', w: 700 }) + T(470, 84, 't<tspan baseline-shift="sub" font-size="10">r</tspan> (30 % → 70 %) = 0,8473 · R<tspan baseline-shift="sub" font-size="10">p</tspan> · C<tspan baseline-shift="sub" font-size="10">b</tspan>', { fs: 14, a: 'middle', w: 700 }), 'Le modèle du front montant : R_p charge C_b');
    const intro = `<p><b>Le banc.</b> Une platine de prototypage : un microcontrôleur (maître) lit un capteur (esclave) sur un bus I2C alimenté en 3,3 V, avec deux résistances de tirage R<sub>p</sub> = ${F(Rp / 1000)} kΩ. Sur la nouvelle carte, le câble vers le capteur est plus long.</p>
      <p><b>La problématique.</b> À 100 kHz, la lecture marche ; à 400 kHz (mode rapide), elle échoue. Pourquoi, et comment corriger ?</p>
      <p><b>Le cahier des charges.</b> Norme I2C : temps de montée (de 30 % à 70 % de V<sub>DD</sub>) au plus 1 000 ns à 100 kHz et 300 ns à 400 kHz ; courant d’un port à l’état bas au plus 3 mA, avec V<sub>OL</sub> ≤ 0,4 V.</p>`;
    const qsL = [
      { t: 'L’objectif de la mesure', lab: 'Identifier l’objectif', text: '<p>Avant de toucher au programme, le jury attend que tu dises ce que tu vas observer.</p>', fig: schemaI2C(Rp),
        fields: [choix('Ce qu’il faut observer', 'Les fronts de SCL et SDA, et la réponse du capteur (ACK), à 100 kHz puis à 400 kHz', ['La tension d’alimentation, au multimètre seulement', 'Le programme du microcontrôleur, ligne par ligne', 'La température mesurée par le capteur'], 'obj'),
          choix('Pourquoi comparer 100 et 400 kHz ?', 'Un défaut de fronts trop lents apparaît d’abord quand les bits raccourcissent', ['Pour vérifier que le capteur supporte la chaleur', 'Parce que l’adresse change avec la vitesse', 'Parce que le mode rapide utilise une autre tension'], 'obj')],
        corr: 'Le programme marche à 100 kHz : le défaut est donc dans les signaux, pas dans le code. On regarde la forme des fronts de SCL et SDA et la réponse du capteur (le bit ACK). À 400 kHz, un bit dure quatre fois moins : un front trop lent, qui passait à 100 kHz, n’a plus le temps d’atteindre le niveau haut.',
        hint: 'Le même programme marche à 100 kHz : qu’est-ce qui change à 400 kHz ?' },
      { t: 'Brancher et déclencher', lab: 'Élaborer le protocole', text: '<p>Deux voies d’oscilloscope pour SCL et SDA. L’échange ne passe qu’une fois quand le microcontrôleur interroge le capteur.</p>', fig: schemaI2C(Rp),
        fields: [choix('Les sondes', 'Deux sondes ×10, de faible capacité, masses sur la masse de la carte', ['Deux sondes ×1, pour plus de sensibilité', 'Une seule sonde, qu’on passe de SDA à SCL', 'Le multimètre en fréquencemètre sur SCL'], 'proto'),
          choix('Le déclenchement', 'Monocoup, sur le front descendant de SDA : bus au repos, c’est la condition START', ['Auto, sur le front montant de SCL', 'Normal, sur le front montant de SDA', 'Aucun : la touche Autoset suffit'], 'proto')],
        corr: 'Une sonde ×1 ajoute environ 100 pF sur la ligne : elle ralentirait elle-même les fronts qu’on veut mesurer. La sonde ×10 n’ajoute que 10 à 15 pF. Il faut deux voies à la fois, pour lire SDA au rythme de SCL. L’échange ne passe qu’une fois : on déclenche en monocoup sur le premier front descendant de SDA, bus au repos (SCL haut) : c’est la condition START, le début de tout échange.',
        hint: 'Que fait la capacité d’une sonde à un front qui monte par une résistance de tirage ?' },
      { t: 'Lire la trame', lab: 'Conduire la mesure · exploiter', text: '<p>Le bus tourne à 100 kHz. Voici le début de l’échange, saisi en monocoup.</p>', fig: trame(),
        fields: [num('Adresse du capteur sur 7 bits (en décimal, ou en hexadécimal avec 0x)', addr, '', 'exp', { abs: 0.5 }), choix('Le 8e bit (R/W)', rw ? '1 : le maître veut lire' : '0 : le maître veut écrire', [rw ? '0 : le maître veut écrire' : '1 : le maître veut lire'], 'exp'),
          choix('Le 9e bit', 'ACK : le capteur tire SDA à 0, il a reconnu son adresse', ['NACK : SDA reste à 1, personne ne répond', 'Le bit de stop', 'Un bit de parité'], 'exp')],
        corr: `START : SDA descend pendant que SCL est haut. Ensuite, on lit SDA à chaque impulsion de SCL (SDA ne change que quand SCL est bas). Les 7 premiers bits, poids fort en premier : ${bin} = <b>${addr}</b> = 0x${hex}. Le 8e bit vaut ${rw} : ${rw ? 'lecture' : 'écriture'}. Au 9e coup d’horloge, le maître relâche SDA et le capteur la tire à 0 : c’est l’ACK, il a reconnu son adresse. Viennent ensuite les 8 bits de la donnée.`,
        hint: 'Repère le START, puis lis SDA à chaque fois que SCL est haut.' },
      { t: 'L’horloge et la règle de lecture', lab: 'Exploiter les résultats', text: '<p>Les curseurs encadrent 8 périodes de SCL (du 1er au 9e front montant).</p>', fig: trame({ curs: [{ x: tR1 / t20, t: 'C1' }, { x: (tR1 + 8 * Tb) / t20, t: 'C2' }], lect: `Δt = ${fmt(d8, 4)} µs` }),
        fields: [num('Fréquence de SCL', 8 / (d8 * 1e-6) / 1000, 'kHz', 'exp', { tol: 0.02 }), choix('La règle de l’I2C', 'SDA ne change que quand SCL est bas ; elle est lue quand SCL est haut (sauf START et STOP)', ['SDA est lue sur chaque front descendant de SDA', 'SCL et SDA changent toujours en même temps', 'SDA est lue quand SCL est bas'], 'exp')],
        corr: `8 périodes en ${fmt(d8, 4)} µs : T = ${F(d8 / 8)} µs, f = <b>${F(8 / d8 * 1000)} kHz</b>, un peu moins que 100 kHz (le maître attend que SCL soit vraiment remontée). La règle : la donnée change pendant que SCL est bas et elle est lue quand SCL est haut. Les seules exceptions sont START (SDA descend, SCL haut) et STOP (SDA monte, SCL haut) : c’est ainsi qu’on les reconnaît.`,
        hint: 'Combien de périodes entre les deux curseurs ?' },
      { t: 'Le front montant à 400 kHz', lab: 'Conduire la mesure · exploiter', text: '<p>Le bus passe à 400 kHz. Zoom sur un front montant de SDA ; les pointillés marquent 30 % et 70 % de V<sub>DD</sub>.</p>', fig: figR,
        fields: [num('Temps de montée t<sub>r</sub> de SDA (de 30 % à 70 % de V<sub>DD</sub>)', tr * 1e9, 'ns', 'exp', { tol: 0.08 }), choix('Conséquence à 400 kHz', 'SDA n’a pas fini de monter quand elle est lue : le capteur ou le maître lisent de faux bits', ['Aucune : seul le niveau bas compte en I2C', 'Le bus repasse de lui-même à 100 kHz', 'Le capteur chauffe et se met en sécurité'], 'crit')],
        corr: `Le front franchit 30 % puis 70 % de V<sub>DD</sub> : t<sub>r</sub> ≈ <b>${F(tr * 1e9)} ns</b>. C’est moins que les 1 000 ns permis à 100 kHz (d’où une lecture qui marche), mais bien plus que les 300 ns du mode rapide. À 400 kHz, SCL reste haut à peine plus d’1 µs : SDA monte encore quand on la lit, et un 1 peut être lu comme un 0.`,
        hint: 'Compte les divisions entre les deux pointillés, à 200 ns/div.' },
      { t: 'La capacité du bus', lab: 'Confronter modèle et mesure', text: '<p>Sur une ligne à drain ouvert, le transistor tire à 0 ; pour remonter, c’est la résistance de tirage qui charge la capacité de la ligne.</p>', fig: figRC,
        fields: [num('Capacité du bus C<sub>b</sub> déduite de t<sub>r</sub>', CbP, 'pF', 'mod', { tol: 0.1 }), choix('D’où vient cette capacité ?', 'Du câble rallongé, des entrées des circuits et des sondes', ['Des résistances de tirage', 'Du quartz du microcontrôleur', 'De l’alimentation 3,3 V'], 'mod')],
        corr: `C<sub>b</sub> = t<sub>r</sub> / (0,8473 · R<sub>p</sub>) = ${F(tr * 1e9)} × 10<sup>−9</sup> / (0,8473 × ${F(Rp, 4)}) = <b>${F(CbP)} pF</b>. Un câble fait typiquement 50 à 100 pF par mètre, et chaque entrée ajoute quelques picofarads : le câble rallongé explique le défaut. La norme limite C<sub>b</sub> à 400 pF, mais à R<sub>p</sub> = ${F(Rp / 1000)} kΩ le mode rapide n’est plus tenu.`,
        hint: 'Isole C<sub>b</sub> dans la formule du dessin.' },
      { t: 'Le remède', lab: 'Réduire l’écart', text: '<p>Il faut un front plus rapide sans dépasser le courant permis à l’état bas.</p>',
        fig: tableur('Contraintes', ['Grandeur', 'Valeur'], [['V<sub>DD</sub>', '3,3 V'], ['V<sub>OL</sub> maximale', '0,4 V'], ['Courant à l’état bas', '3 mA au plus'], ['t<sub>r</sub> en mode rapide', '300 ns au plus'], ['C<sub>b</sub> (question 6)', `${F(CbP)} pF`]]),
        fields: [num('R<sub>p</sub> maximale pour t<sub>r</sub> ≤ 300 ns', RpMax / 1000, 'kΩ', 'crit', { tol: 0.1 }), choix('Résistance de tirage à monter', kO(Rbon), [kO(Rp), '470 Ω', '22 kΩ'], 'crit')],
        corr: `R<sub>p</sub> max = 300 × 10<sup>−9</sup> / (0,8473 × ${F(CbP)} × 10<sup>−12</sup>) = <b>${F(RpMax / 1000)} kΩ</b>. R<sub>p</sub> min = (3,3 − 0,4) / 3 mA ≈ 0,97 kΩ : en dessous, le port ne peut plus tirer la ligne sous 0,4 V. On prend une valeur normalisée entre les deux, avec de la marge : <b>${kO(Rbon)}</b>. ${kO(Rp)} est la cause du défaut, 470 Ω dépasse le courant permis, 22 kΩ ralentirait encore. Autre remède : raccourcir le câble, ou ajouter un circuit tampon pour bus I2C.`,
        hint: 'Le front doit être assez rapide (R<sub>p</sub> petite), mais le courant à l’état bas limité (R<sub>p</sub> pas trop petite).' },
      { t: 'La séance', lab: 'Transposer en séance', text: '<p>Pour ta séance (BTS CIEL ou BUT GEII), un protocole nouveau, et ce que les étudiants devraient observer.</p>', fig: schemaI2C(Rp),
        fields: [choix('Protocole nouveau', 'Mesurer t<sub>r</sub> pour trois résistances de tirage et deux longueurs de câble, tracer t<sub>r</sub> en fonction de R<sub>p</sub> · C<sub>b</sub>, et retrouver la limite du mode rapide', ['Refaire le décodage de la même trame', 'Monter la fréquence jusqu’à la panne, sans mesurer', 'Retirer les résistances de tirage pour voir ce qui se passe'], 'seance'),
          choix('Ce que les étudiants devraient observer', 't<sub>r</sub> est proportionnel au produit R<sub>p</sub> · C<sub>b</sub>', ['t<sub>r</sub> ne dépend que de la fréquence du bus', 't<sub>r</sub> diminue quand R<sub>p</sub> augmente', 't<sub>r</sub> est le même quelle que soit la longueur du câble'], 'seance')],
        corr: 'Faire varier R<sub>p</sub> et la longueur, mesurer t<sub>r</sub> et tracer t<sub>r</sub> = f(R<sub>p</sub> · C<sub>b</sub>) fait découvrir le modèle et la règle de choix des résistances : c’est un protocole nouveau, qui mêle mesure, modèle et choix de composant. Refaire le décodage n’apporte rien de neuf ; monter la fréquence sans mesurer ne montre pas la cause ; sans tirage, les lignes restent à 0 et rien ne marche.' },
    ];
    const bilan = [`Trame à ${F(8 / d8 * 1000)} kHz : adresse ${addr} (0x${hex}), R/W = ${rw}, ACK du capteur.`,
      `Front montant de SDA : t_r ≈ ${F(tr * 1e9)} ns (≤ 1 000 ns à 100 kHz : tenu ; ≤ 300 ns à 400 kHz : non tenu).`,
      `Modèle t_r = 0,8473 R_p C_b : C_b ≈ ${F(CbP)} pF avec R_p = ${F(Rp / 1000)} kΩ, dû au câble rallongé.`,
      `Remède : R_p ≤ ${F(RpMax / 1000)} kΩ et ≥ 0,97 kΩ ; valeur retenue ${kO(Rbon)} (ou câble raccourci, ou tampon I2C).`];
    return { intro, bilan, prob: 'Le capteur répond à 100 kHz mais pas à 400 kHz depuis que le câble est plus long : pourquoi, et comment corriger ?', qs: qsL };
  }

  /* =====================================================================
     Banc 6 — bus CAN : des trames erronées depuis qu'on a modifié le bus
     ISO 11898-2 : 120 Ω à chaque extrémité ; dominant : CAN_H − CAN_L ≈ 2 V (1,5 V au moins à l'émission) ;
     le récepteur lit « dominant » au-dessus de 0,9 V, « récessif » sous 0,5 V.
     ===================================================================== */
  function schemaCAN() {
    let s = `<path d="M60 90 H600 M60 128 H600" stroke="#183047" stroke-width="2.5"/>` + T(30, 95, 'CAN_H', { fs: 12, w: 700, a: 'middle' }) + T(30, 133, 'CAN_L', { fs: 12, w: 700, a: 'middle' });
    s += `<path d="M90 90 q8 19 0 38 M570 90 q8 19 0 38" fill="none" stroke="#587083"/>`;
    [[110, 'capteur'], [330, 'boîtier ajouté'], [550, 'afficheur']].forEach(([x, t]) => { s += `<line x1="${x}" y1="90" x2="${x}" y2="170" stroke="#183047" stroke-width="2"/><line x1="${x + 18}" y1="128" x2="${x + 18}" y2="170" stroke="#183047" stroke-width="2"/><rect x="${x - 40}" y="170" width="98" height="46" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="2"/>` + T(x + 9, 198, t, { a: 'middle', fs: 13, w: 700 }); });
    [[70, '?'], [330 + 70, '?'], [600, '?']].forEach(([x, t], k) => { s += `<rect x="${x - 14}" y="96" width="28" height="26" rx="3" fill="#fff" stroke="#c9483b" stroke-width="2" stroke-dasharray="${k === 1 ? '4 3' : '0'}"/>` + T(x, 114, t, { a: 'middle', fs: 13, c: '#c9483b', w: 700 }); });
    s += T(330, 40, 'paire torsadée rallongée · terminaisons de 120 Ω : où sont-elles ?', { a: 'middle', fs: 13, c: '#587083' });
    return svg(640, 232, s, 'Le bus CAN du banc');
  }
  function genCAN() {
    const deb = tire([125, 250, 500]), Tb = 1e-3 / deb, defaut = Math.random() < 0.6 ? 'manque' : 'trop', Rmes = defaut === 'manque' ? 120 : 40, nT = defaut === 'manque' ? 1 : 3;
    const Vd = dec(defaut === 'manque' ? al(2.2, 2.4) : al(1.4, 1.6), 2), dlc = Math.floor(al(1, 9));
    const brut = (id) => { const b = [0]; for (let j = 10; j >= 0; j--) b.push((id >> j) & 1); b.push(0, 0, 0); for (let j = 3; j >= 0; j--) b.push((dlc >> j) & 1); return b; };
    const bourre = (b) => { const out = [], st = []; let n = 0, der = -1; b.forEach((x) => { out.push(x); st.push(0); n = x === der ? n + 1 : 1; der = x; if (n === 5) { out.push(1 - x); st.push(1); der = 1 - x; n = 1; } }); return { out, st }; };
    let id, B, nId, iso;
    for (;;) {
      id = Math.floor(al(0x40, 0x7f0)); B = bourre(brut(id));
      let bi = -1; nId = 0; for (let j = 0; j < B.out.length; j++) { if (!B.st[j]) { bi++; if (bi === 12) break; } else nId++; }
      iso = -1; for (let j = 3; j < B.out.length - 1; j++) if (B.out[j] !== B.out[j - 1] && B.out[j] !== B.out[j + 1]) { iso = j; break; }
      if (nId >= 1 && B.st.filter(Boolean).length <= 3 && iso >= 0) break;
    }
    const bitsS = B.out, N = bitsS.length, hexId = id.toString(16).toUpperCase(), binId = id.toString(2).padStart(11, '0');
    // CAN_H − CAN_L : SOF à t = 0 ; fronts adoucis ; oscillations amorties quand une terminaison manque, parasite quand l'écart est faible
    const reponse = (u, de, a) => a + (de - a) * Math.exp(-u / (0.04 * Tb)) + (defaut === 'manque' && de !== a ? (a - de) * 0.7 * Math.exp(-u / (0.25 * Tb)) * Math.sin(2 * Math.PI * 3 * u / Tb) : 0);
    const parasite = (t) => (defaut === 'trop' ? 0.1 * (0.6 * Math.sin(2 * Math.PI * 2.3 * t / Tb) + 0.4 * Math.sin(2 * Math.PI * 5.1 * t / Tb + 1)) : 0);
    const niveau = (j) => (j < 0 ? 0 : bitsS[Math.min(N - 1, j)] ? 0 : Vd);
    const diff = (t) => { if (t < 0) return parasite(t); const k = Math.min(N - 1, Math.floor(t / Tb)); return reponse(t - k * Tb, niveau(k - 1), niveau(k)) + parasite(t); };
    const tdN = { 125: 1e-5, 250: 5e-6, 500: 2e-6 }[deb];
    const figN = osc({ tdiv: tdN, trig: 1, alt: 'CAN_H et CAN_L au début d’une trame', ch: [{ f: (t) => 2.5 + diff(t - tdN) / 2, div: 1, z: -3, c: '#f2c94c', n: 2000, w: 1.8 }, { f: (t) => 2.5 - diff(t - tdN) / 2, div: 1, z: -3, c: '#56ccf2', n: 2000, w: 1.8 }],
      bas: [['CH1 : 1 V/div · CAN_H (zéro à −3 div)', '#f2c94c'], ['CH2 : 1 V/div · CAN_L (zéro à −3 div)', '#56ccf2'], [`Base de temps : ${tnom(tdN)}/div`, '#dfe8ee']] });
    const tdZ = Tb / 4, tIso = iso * Tb;
    const figZ = osc({ tdiv: tdZ, alt: 'Un bit isolé, zoomé, entre deux curseurs', ch: [{ f: (t) => diff(t + tIso - 3 * tdZ), div: 1, z: -2, c: '#bb6bd9', n: 1500, w: 2 }],
      curs: [{ x: 3, t: 'C1' }, { x: 7, t: 'C2' }], lect: `Δt = ${fmt(Tb * 1e6, 4)} µs`, bas: [['Voie math : CH1 − CH2 · 1 V/div', '#d9a6f2'], [`Base de temps : ${tnom(tdZ)}/div`, '#dfe8ee']] });
    // le chronogramme du début de trame (voie math)
    const chrono = (() => {
      const W = 640, m = { l: 58, r: 12, t: 36, b: 60 }, wB = (W - m.l - m.r) / N, H = 230, h = 110, Y = (v) => m.t + h - v / (Vd * 1.3) * h;
      let s = `<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${h}" fill="#fff" stroke="#9fb3c2"/>`;
      [0, 1, 2].filter((v) => v <= Vd * 1.3).forEach((v) => { s += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#dde6ec"/>` + T(m.l - 6, Y(v) + 5, `${v} V`, { fs: 13, a: 'end', c: '#42596b' }); });
      for (let j = 0; j <= N; j++) { const x = m.l + j * wB; s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${m.t}" y2="${m.t + h}" stroke="#e3eaf0" stroke-dasharray="3 3"/>`; if (j < N) s += T(x + wB / 2, m.t + h + 18, j + 1, { fs: 12, a: 'middle', c: '#42596b' }); }
      let d = `M${m.l} ${Y(bitsS[0] ? 0 : Vd).toFixed(1)}`; for (let j = 0; j < N; j++) { const y = Y(bitsS[j] ? 0 : Vd).toFixed(1); d += `L${(m.l + j * wB).toFixed(1)} ${y}L${(m.l + (j + 1) * wB).toFixed(1)} ${y}`; }
      s += `<path d="${d}" fill="none" stroke="#8e44ad" stroke-width="2.4" stroke-linejoin="round"/>` + T(m.l + wB / 2, m.t - 8, 'SOF', { fs: 13, a: 'middle', w: 700, c: '#8e44ad' });
      s += T(m.l, H - 14, 'numéro du bit sur la ligne (bits de bourrage compris)', { fs: 13, c: '#42596b' }) + T(W - m.r, m.t - 10, 'voie math : CAN_H − CAN_L', { fs: 13, a: 'end', c: '#42596b' });
      return svg(W, H, s, 'Début de la trame, bit par bit');
    })();
    // l'arbitrage
    const A = Math.floor(al(0x80, 0x7ff)), p = Math.floor(al(3, 10)), bp = 1 << (11 - p), haute = 0x7ff & ~((bp << 1) - 1);
    const Bb = (A & haute) | (~A & bp) | (Math.floor(al(0, bp)) & (bp - 1)), gagneA = (A & bp) === 0, hx = (x) => '0x' + x.toString(16).toUpperCase().padStart(3, '0');
    const nomA = 'capteur', nomBb = 'afficheur', gagnant = gagneA ? nomA : nomBb, perdant = gagneA ? nomBb : nomA;
    // le zoom sur un front récessif : oscillations, ou écart trop faible
    const figF = osc({ tdiv: Tb / 4, alt: 'Retour à l’état récessif, avec les seuils du récepteur', ch: [{ f: (t) => { const u = t - 2 * Tb / 4; return (u < 0 ? Vd : reponse(u, Vd, 0)) + parasite(t); }, div: 0.5, z: -1.5, c: '#bb6bd9', n: 1500, w: 2 }],
      hls: [{ y: -1.5 + 0.9 / 0.5, t: 'seuil dominant 0,9 V', c: '#eb5757' }, { y: -1.5 + 0.5 / 0.5, t: 'seuil récessif 0,5 V', c: '#f2994a' }],
      bas: [['Voie math : CH1 − CH2 · 0,5 V/div', '#d9a6f2'], [`Base de temps : ${tnom(Tb / 4)}/div`, '#dfe8ee']] });
    const intro = `<p><b>Le banc.</b> Un bus CAN didactique : un nœud capteur et un nœud afficheur reliés par une paire torsadée, à ${deb} kbit/s, émetteurs-récepteurs alimentés en 5 V. On vient de rallonger le bus et d’y ajouter un boîtier.</p>
      <p><b>La problématique.</b> Depuis, l’afficheur reçoit des trames erronées. D’où vient le défaut ?</p>
      <p><b>Le cahier des charges.</b> Un bus CAN haute vitesse se termine par une résistance de 120 Ω à chacune de ses deux extrémités. À l’état dominant, CAN_H − CAN_L vaut environ 2 V (au moins 1,5 V) ; le récepteur lit « dominant » au-dessus de 0,9 V et « récessif » sous 0,5 V.</p>`;
    const qsL = [
      { t: 'L’objectif de la mesure', lab: 'Identifier l’objectif', text: '<p>Le jury attend que tu dises ce que tu vérifies, et dans quel ordre.</p>', fig: schemaCAN(),
        fields: [choix('Ce qu’il faut vérifier d’abord', 'Le câblage (terminaisons) et la forme du signal différentiel, avant de lire les trames', ['Le programme des deux nœuds, ligne par ligne', 'La tension d’alimentation au multimètre seulement', 'Le contenu des données, sans regarder le signal'], 'obj'),
          choix('Pourquoi le CAN transmet-il en différentiel ?', 'Un parasite s’ajoute presque pareil sur CAN_H et CAN_L : leur différence n’en garde presque rien', ['Pour doubler le débit', 'Pour alimenter les nœuds par le bus', 'Pour pouvoir se passer de masse'], 'obj')],
        corr: 'Le défaut est apparu quand on a touché au câblage : on commence par le câblage (terminaisons) et par la forme du signal, puis on lit les trames. Le récepteur ne regarde que la différence CAN_H − CAN_L : un parasite qui s’ajoute aux deux fils de la paire torsadée disparaît dans la différence.',
        hint: 'Qu’a-t-on modifié juste avant l’apparition du défaut ?' },
      { t: 'Les terminaisons', lab: 'Élaborer le protocole · mesurer', text: '<p>Bus hors tension, ohmmètre entre CAN_H et CAN_L.</p>', fig: schemaCAN() + rangee(afficheur('Ohmmètre CAN_H – CAN_L', F(Rmes * bruit(1, 0.01), 3), 'Ω')),
        fields: [num('Nombre de résistances de 120 Ω en place', nT, '', 'exp', { abs: 0.4 }), choix('Conclusion', defaut === 'manque' ? 'Il en manque une : on doit lire 60 Ω, deux 120 Ω en parallèle, une à chaque extrémité' : 'Il y en a une de trop : on doit lire 60 Ω, deux 120 Ω seulement, aux deux extrémités', [defaut === 'manque' ? 'Il y en a une de trop : on doit lire 60 Ω, deux 120 Ω seulement, aux deux extrémités' : 'Il en manque une : on doit lire 60 Ω, deux 120 Ω en parallèle, une à chaque extrémité', 'Tout est normal : chaque nœud a sa résistance de 120 Ω'], 'exp')],
        corr: `n résistances de 120 Ω en parallèle font 120 / n : ${Rmes} Ω, donc <b>${nT}</b> ${nT > 1 ? 'résistances' : 'résistance'}. On attend 60 Ω : une terminaison à chaque extrémité, et seulement là. ${defaut === 'manque' ? 'Il en manque une : l’extrémité ouverte renvoie le signal (réflexions).' : 'Le boîtier ajouté au milieu a sa propre terminaison : elle charge le bus et l’écart différentiel baisse.'} La mesure se fait hors tension : un ohmmètre sur un bus alimenté donne n’importe quoi.`,
        hint: 'Que vaut la résistance de n résistances de 120 Ω en parallèle ?' },
      { t: 'Les niveaux du signal', lab: 'Conduire la mesure · exploiter', text: '<p>CAN_H (CH1) et CAN_L (CH2) au début d’une trame, les deux zéros à −3 div.</p>', fig: figN,
        fields: [num('Écart V<sub>H</sub> − V<sub>L</sub> à l’état dominant', Vd, 'V', 'exp', { tol: 0.08 }), choix('L’état dominant code', 'un 0 logique : il l’emporte sur un 1 récessif envoyé en même temps', ['un 1 logique', 'l’absence de message', 'une erreur de transmission'], 'exp')],
        corr: `Au repos (récessif), CAN_H et CAN_L sont tous deux à 2,5 V : écart nul. À l’état dominant, CAN_H monte à ${F(2.5 + Vd / 2)} V et CAN_L descend à ${F(2.5 - Vd / 2)} V : écart <b>${F(Vd)} V</b>. Le dominant code un 0 : si un nœud émet 0 pendant qu’un autre émet 1, le bus est dominant, et c’est le 0 qui l’emporte. ${defaut === 'manque' ? 'Remarque les oscillations après chaque front.' : 'Remarque l’écart plus faible que les 2 V habituels.'}`,
        hint: 'Mesure CAN_H et CAN_L pendant un bit dominant, puis fais la différence.' },
      { t: 'Le débit', lab: 'Exploiter les résultats', text: '<p>Zoom sur un bit isolé (un seul bit entre deux bits contraires), avec deux curseurs sur ses fronts.</p>', fig: figZ,
        fields: [num('Débit binaire', deb, 'kbit/s', 'exp', { tol: 0.02 }), choix('Pourquoi la longueur maximale du bus baisse-t-elle quand le débit monte ?', 'Pendant l’arbitrage, chaque nœud doit voir l’état du bus avant la fin du bit : l’aller-retour du signal doit tenir dans une partie du bit', ['Parce que la paire torsadée chauffe davantage', 'Parce que les terminaisons consomment plus', 'Parce que le CRC est plus long'], 'exp')],
        corr: `Un bit isolé dure exactement un temps de bit : T<sub>b</sub> = ${fmt(Tb * 1e6, 4)} µs, débit = 1 / T<sub>b</sub> = <b>${deb} kbit/s</b>. Pendant l’arbitrage, chaque émetteur compare ce qu’il envoie à ce qu’il lit sur le bus, dans le même bit : le signal doit aller au bout du bus et revenir pendant une partie du bit. Plus le bit est court, plus le bus doit l’être (de l’ordre de 40 m à 1 Mbit/s).`,
        hint: 'Combien de bits entre les curseurs ?' },
      { t: 'Lire l’identifiant', lab: 'Conduire la mesure · exploiter', text: '<p>Le début d’une trame du capteur, bit par bit. Écart d’environ ' + F(Vd) + ' V : bit dominant, 0 ; 0 V : bit récessif, 1. Après le SOF viennent les 11 bits de l’identifiant, poids fort en premier, puis RTR, IDE, r0 et les 4 bits de longueur (DLC). Après 5 bits identiques, l’émetteur insère un bit inverse, que le récepteur retire : c’est le bourrage.</p>', fig: chrono,
        fields: [num('Identifiant (en décimal, ou en hexadécimal avec 0x)', id, '', 'exp', { abs: 0.5 }), num('Nombre de bits de bourrage avant le bit RTR', nId, '', 'exp', { abs: 0.4 })],
        corr: `Lus sur la ligne : ${bitsS.join('')}. On retire ${B.st.filter(Boolean).length > 1 ? 'les bits de bourrage, aux positions' : 'le bit de bourrage, à la position'} ${B.st.map((x, j) => (x ? j + 1 : null)).filter((x) => x).join(', ')} : chacun suit 5 bits identiques. Il reste le SOF (0), puis l’identifiant ${binId} = <b>${id}</b> = 0x${hexId}, puis RTR, IDE, r0 à 0 et DLC = ${dlc}. Bits de bourrage avant le RTR : <b>${nId}</b>. Sans le bourrage, une longue suite de bits identiques ne donnerait plus de fronts pour resynchroniser les horloges des récepteurs.`,
        hint: 'Compte les bits identiques depuis le SOF : le 6e d’une série de 5 identiques est un bit de bourrage, à sauter.' },
      { t: 'L’arbitrage', lab: 'Analyse critique', text: '<p>Le capteur et l’afficheur commencent une trame au même instant, avec ces identifiants :</p>',
        fig: tableur('Identifiants', ['Nœud', 'Identifiant'], [['capteur', hx(A)], ['afficheur', hx(Bb)]]),
        fields: [choix('Qui gagne l’arbitrage ?', `Le ${gagnant} : au premier bit qui diffère, il envoie un 0 dominant`, [`Le ${perdant}`, 'Aucun : les deux trames sont détruites puis réémises', 'Celui qui a démarré en premier'], 'crit'),
          num('Rang du bit d’identifiant où le perdant se tait (1 = poids fort)', p, '', 'crit', { abs: 0.4 })],
        corr: `En binaire, sur 11 bits : ${nomA} ${A.toString(2).padStart(11, '0')}, ${nomBb} ${Bb.toString(2).padStart(11, '0')}. Ils sont identiques jusqu’au bit ${p} (en comptant depuis le poids fort), où le ${gagnant} envoie 0 et le ${perdant} 1. Le bus est dominant : le ${perdant} lit 0 alors qu’il a envoyé 1, il comprend qu’il a perdu et se tait au <b>bit ${p}</b>. Le ${gagnant}, d’identifiant plus petit, continue sans que sa trame soit abîmée : c’est l’arbitrage non destructif, l’identifiant le plus petit est le plus prioritaire.`,
        hint: 'Écris les deux identifiants en binaire, sur 11 bits, et cherche le premier bit qui diffère.' },
      { t: 'La cause et le remède', lab: 'Analyse critique · réduire l’écart', text: '<p>Zoom sur le retour à l’état récessif, voie math, avec les seuils du récepteur.</p>', fig: figF,
        fields: [choix('Cause des trames erronées', defaut === 'manque' ? 'L’extrémité sans terminaison renvoie le signal : il oscille et repasse au-dessus du seuil récessif' : 'Trois terminaisons chargent trop le bus : l’écart dominant baisse et la marge au bruit fond', [defaut === 'manque' ? 'Trois terminaisons chargent trop le bus : l’écart dominant baisse et la marge au bruit fond' : 'L’extrémité sans terminaison renvoie le signal : il oscille et repasse au-dessus du seuil récessif', 'Le débit est trop élevé pour les émetteurs-récepteurs', 'Les identifiants sont trop grands'], 'crit'),
          choix('Remède', defaut === 'manque' ? 'Poser la résistance de 120 Ω qui manque, à l’extrémité du bus' : 'Retirer la terminaison du boîtier ajouté, qui n’est pas en bout de bus', [defaut === 'manque' ? 'Retirer une terminaison' : 'Ajouter une troisième résistance de 120 Ω', 'Mettre une résistance de 120 Ω au milieu du bus', 'Remplacer la paire torsadée par deux fils séparés'], 'crit')],
        corr: defaut === 'manque' ? 'Sans terminaison à un bout, le front se réfléchit sur l’extrémité ouverte et revient : le signal oscille et, après un retour au récessif, repasse au-dessus de 0,5 V. Le récepteur peut lire un bit dominant de trop, et la trame est fausse. Les deux 120 Ω, une à chaque extrémité, absorbent l’onde : on pose celle qui manque, au bout du bus, et on doit relire 60 Ω.' : 'Avec trois 120 Ω (40 Ω au lieu de 60 Ω), les émetteurs fournissent un écart plus faible, ici environ ' + F(Vd) + ' V au lieu de 2 V : il reste peu de marge au-dessus du seuil de 0,9 V, et le moindre parasite fait lire un récessif. On retire la terminaison du boîtier ajouté au milieu du bus : seules les deux extrémités en ont une.' },
      { t: 'La séance', lab: 'Transposer en séance', text: '<p>Pour ta séance (BTS CIEL ou BUT GEII), un protocole nouveau, et ce que les étudiants devraient observer.</p>', fig: schemaCAN(),
        fields: [choix('Protocole nouveau', 'Mesurer la résistance du bus et observer le signal différentiel avec aucune, une, deux puis trois terminaisons, et relier ce qu’on voit aux trames erronées', ['Refaire le décodage de la trame de l’expérimentation', 'Mesurer la résistance du bus sous tension', 'Débrancher un nœud en pleine trame pour voir l’arbitrage'], 'seance'),
          choix('Ce que les étudiants devraient observer', 'Sans terminaison, des oscillations après chaque front ; avec deux, un signal propre ; avec trois, un écart différentiel plus faible', ['Le même signal dans tous les cas', 'Un signal propre seulement sans terminaison', 'Un débit qui change avec le nombre de terminaisons'], 'seance')],
        corr: 'Faire varier le nombre de terminaisons, mesurer la résistance hors tension puis observer le signal relie un câblage à ses effets : c’est un protocole nouveau, qui prépare au diagnostic. Refaire le décodage n’apporte rien de neuf ; un ohmmètre sur un bus alimenté mesure faux ; débrancher un nœud en pleine trame ne montre pas l’arbitrage.' },
    ];
    const bilan = [`Bus à ${deb} kbit/s ; ohmmètre hors tension : ${Rmes} Ω, soit ${nT} terminaison${nT > 1 ? 's' : ''} au lieu de 2 (60 Ω attendus).`,
      `Écart dominant CAN_H − CAN_L : ${F(Vd)} V ; ${defaut === 'manque' ? 'oscillations après les fronts, qui repassent le seuil récessif de 0,5 V' : 'marge réduite au-dessus du seuil dominant de 0,9 V'}.`,
      `Trame du capteur : identifiant ${id} (0x${hexId}), ${nId} bit${nId > 1 ? 's' : ''} de bourrage avant le RTR ; arbitrage gagné par le ${gagnant} (${hx(gagneA ? A : Bb)}) au bit ${p}.`,
      `Remède : ${defaut === 'manque' ? 'poser la terminaison de 120 Ω manquante en bout de bus' : 'retirer la terminaison du boîtier ajouté au milieu du bus'} ; relire 60 Ω.`];
    return { intro, bilan, prob: 'Depuis qu’on a rallongé le bus CAN et ajouté un boîtier, l’afficheur reçoit des trames erronées : d’où vient le défaut ?', qs: qsL };
  }

  const BANCS = {
    pompe: { titre: 'Station de pompage : vanne ou variateur ?', court: 'puissances, analyseur de réseau, modèle et simulation', eye: 'gestion de l’énergie', dom: 'ge', duree: 30, gen: genPompe },
    monte: { titre: 'Monte-charge : variateur et glissement', court: 'oscilloscope et sondes, variation de vitesse', eye: 'variation de vitesse', dom: 'ge', duree: 30, gen: genMonte },
    harmo: { titre: 'Qualité de l’énergie : harmoniques et neutre', court: 'appareils TRMS, spectre, puissances, neutre', eye: 'qualité de l’énergie', dom: 'ge', duree: 30, gen: genHarmo },
    oscillo: { titre: 'L’oscilloscope en main : une carte à microcontrôleur', court: 'oscilloscope à régler soi-même : déclenchement, couplage AC, monocoup, sonde, repliement', eye: 'systèmes d’information', dom: 'si', duree: 35, gen: genOscillo },
    i2c: { titre: 'Bus I2C : le capteur ne répond plus en mode rapide', court: 'trame, adresse et ACK, temps de montée, résistances de tirage', eye: 'systèmes d’information', dom: 'si', duree: 30, gen: genI2C },
    can: { titre: 'Bus CAN : des trames erronées', court: 'terminaisons, niveaux, débit, identifiant et bourrage, arbitrage', eye: 'systèmes d’information', dom: 'si', duree: 30, gen: genCAN },
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
.tp-carte{list-style:none;padding:0;margin:8px 0 0}.tp-carte li{margin:10px 0;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}.tp-dom{margin:14px 0 2px;font-size:15px;color:#12566f}
.tp-oscf{margin:6px 0 14px}.tp-osc{margin:4px 0}.tp-ecr svg{max-width:100%;height:auto;display:block}.tp-ost{font-size:14px;color:#9c5221;font-weight:600;margin:6px 0;min-height:1.2em}
.tp-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;margin-top:6px}.tp-ctl .btns{grid-column:1/-1;margin:2px 0 0}
.tp-ofs{border:1px solid #d3dde5;border-radius:8px;padding:6px 10px 8px;margin:0;display:grid;gap:6px;min-width:0}.tp-ofs legend{font-weight:700;font-size:13px;color:#12566f;padding:0 4px}
.tp-oc{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px}.tp-oc select,.tp-oc input{font:inherit;font-size:14px;padding:5px 6px;border:1px solid #bbccd8;border-radius:6px;background:#fff;color:inherit;max-width:60%}.tp-oc input{width:90px}
.tp-oatt{font-weight:700;margin:6px 0 0}`;
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
    const valeur = (f) => (f.k === 'osc' ? f.att : fmt(f.a, Math.abs(f.a) >= 1000 ? 4 : 3) + (f.u ? ' ' + f.u : ''));
    function champs(q, rep, ok) {
      return `<div class="fields">${q.fields.map((f, i) => {
        const r = rep[i], cls = ok ? (ok[i] ? ' good' : ' bad') : '';
        if (f.k === 'osc') { if (!r || typeof r !== 'object') rep[i] = JSON.parse(JSON.stringify(f.init)); return `<div class="tp-oscf"><span class="tp-fl">${f.l}</span>${panneau(f, i, rep[i], !!ok)}${ok ? `<p class="tp-oatt ${ok[i] ? 'tp-ok' : 'tp-ko'}">${ok[i] ? '✓ Réglage juste.' : 'Réglage attendu : ' + f.att + '.'}</p>` : ''}</div>`; }
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
      garder();
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
      const arm = e.target.closest('[data-arm]'), ev = e.target.closest('[data-ev]');
      if (arm || ev) {
        const i = +(arm ? arm.dataset.arm : ev.dataset.ev), f = R.qs[R.i].fields[i], s = R.rep[R.i][i];
        if (arm) { if (s.mode === 'mono') { s.etat = 'arme'; s.rien = 0; } else s.etat = 'pasmono'; } else envoyer(f, s);
        majOsc(i); garder(); return;
      }
      if (e.target.closest('[data-suiv]')) { R.i++; garder(); if (R.i >= R.qs.length) fin(); else question(); window.scrollTo(0, 0); return; }
      if (e.target.closest('[data-raz]') || e.target.closest('[data-refaire]')) { lsSet(cle, null); vue(id); window.scrollTo(0, 0); }
    };
    // l'oscilloscope : on redessine son écran à chaque réglage, sans toucher au reste de la question
    const majOsc = (i) => { const w = document.querySelector(`.tp-osc[data-f="${i}"]`); if (!w) return; const E = ecranOsc(R.qs[R.i].fields[i], R.rep[R.i][i]); w.querySelector('.tp-ecr').innerHTML = E.svg; w.querySelector('.tp-ost').textContent = E.msg; };
    app().oninput = (e) => { if (e.target.id === 'tpct') { R.brouillon = e.target.value; garder(); } };
    app().onchange = (e) => {
      const w = e.target.closest('.tp-osc'), r = e.target.dataset && e.target.dataset.r;
      if (!w || !r) return;
      const i = +w.dataset.f, s = R.rep[R.i] && R.rep[R.i][i];
      if (!s) return;
      let v = e.target.value;
      if (r === 'niv') { v = parse(v); if (!isFinite(v)) { e.target.value = String(s.niv).replace('.', ','); return; } }
      else if (!['c1', 'c2', 'pente', 'mode'].includes(r)) v = Number(v);
      s[r] = v;
      if (['src', 'pente', 'niv', 'mode'].includes(r)) { s.etat = 'stop'; s.rien = 0; }
      majOsc(i); garder();
    };
    // Entrée dans la case du niveau : on applique le niveau, on ne valide pas la question
    app().onkeydown = (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.r === 'niv') { e.preventDefault(); e.target.blur(); } };
    app().onsubmit = (e) => {
      e.preventDefault();
      if (e.target.id === 'tpc') { conclure(e.target); return; }
      if (e.target.id !== 'tpf') return;
      const q = R.qs[R.i], rep = R.rep[R.i] || (R.rep[R.i] = []), al0 = e.target.querySelector('.tp-al');
      q.fields.forEach((f, i) => { if (!f.ch && !f.k) { const x = e.target.querySelector(`input[data-f="${i}"]`); rep[i] = x ? x.value : ''; } });
      garder();
      const vides = q.fields.filter((f, i) => (f.k ? false : f.ch ? rep[i] == null : !String(rep[i] == null ? '' : rep[i]).trim())).length;
      if (vides) { al0.hidden = false; al0.textContent = vides > 1 ? `Il manque ${vides} réponses.` : 'Il manque une réponse.'; return; }
      if (q.fields.some((f, i) => !f.ch && !f.k && !isFinite(parse(rep[i])))) { al0.hidden = false; al0.textContent = 'Écris un nombre (ou un calcul) dans chaque case.'; return; }
      R.ok[R.i] = q.fields.map((f, i) => (f.k === 'osc' ? jugeOsc(f, rep[i]) : f.ch ? rep[i] === f.a : okf(f, parse(rep[i]))));
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
      <p class="muted" style="margin:0 0 6px">Elle compte pour 10 points sur 20 dans chaque épreuve. Sur des bancs simulés, proches de ceux d’un labo : identifier l’objectif, choisir et brancher les appareils, mesurer, exploiter, confronter modèle, simulation et mesure, chercher la cause des écarts, puis proposer un protocole nouveau pour la séance. Autres valeurs à chaque essai.</p>
      ${[['ge', 'Gestion de l’énergie'], ['si', 'Systèmes d’information : l’oscilloscope et les bus, points faibles relevés par le jury']].map(([d, t]) => `<h3 class="tp-dom">${t}</h3><ul class="tp-carte">${Object.keys(BANCS).filter((id) => BANCS[id].dom === d).map((id) => { const B = BANCS[id], x = S[id]; return `<li><a class="b" href="#admission-tp-${id}">${esc(B.titre)}</a><span class="muted">${esc(B.court)} · environ ${B.duree} min${x && x.best != null ? ` · meilleure note ${fmt(x.best, 3)} / 20` : ''}</span></li>`; }).join('')}</ul>`).join('')}</div>`;
  }

  window.ADMISSION_TP = { route: vue, carte, BANCS, COMP, jugeOsc, envoyer, ecranOsc };
})();
