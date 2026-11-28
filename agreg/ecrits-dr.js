/* =====================================================================
   SI Papara — agrégation : documents réponses interactifs (#ecrits-dr)
   Les tracés que les sujets demandent sur un document réponse, faits à la souris ou au doigt et vérifiés aussitôt :
   - diagrammes de Bode asymptotiques (gain) : on pose les points de la courbe sur un papier semi-logarithmique ;
   - chronogrammes : trames UART et I²C, hacheur série, onduleur à commande décalée, bascule D, compteur 2 bits.
   Chaque tracé est comparé à la réponse attendue (écarts montrés en rouge, tracé attendu en vert), avec une
   question chiffrée liée. Valeurs tirées par graine : un nouveau tirage, un nouveau document.
   Progression : st.ec.dr (tracés datés). Globales de agreg/index.html : st, save, app, fmt.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 2 : d }).replace('-', '−'));
  const F = (x) => (typeof fmt === 'function' ? fmt(x) : nf(x, 3));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.dr)) st.ec.dr = []; return st.ec; };
  const v = (s) => `<i class="v">${s}</i>`;
  const alea = (g) => { let a = (g >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const nombre = (s) => { const t = String(s || '').trim().replace(/\s| | /g, '').replace(/−/g, '-').replace(',', '.'); if (!t) return null; const x = parseFloat(t); return isFinite(x) ? x : null; };
  const lg = Math.log10, NS = 'http://www.w3.org/2000/svg';
  const omega = (x) => { const w = 10 ** x; return w >= 1e3 ? `${nf(w / 1e3, 2)} × 10³` : nf(w, 2); };

  /* =================== Bode asymptotique =================== */
  // termes : ['z', w] zéro, ['p', w] pôle, ['p2', w] pôle double, ['i'] intégrateur, ['d', w] dérivateur p/w
  const gas = (B, x) => B.T.reduce((g, t) => g + (t[0] === 'z' ? 20 * Math.max(0, x - lg(t[1])) : t[0] === 'p' ? -20 * Math.max(0, x - lg(t[1])) : t[0] === 'p2' ? -40 * Math.max(0, x - lg(t[1])) : t[0] === 'i' ? -20 * x : 20 * (x - lg(t[1]))), 20 * lg(B.K));
  const BODE = {
    pb1: { nom: 'Premier ordre passe-bas', tex: (b) => `${fmtK(b.K)}/(1 + ${v('p')}/${b.w[0]})`, gen: (r) => { const w0 = pk(r, [10, 20, 50, 100, 200, 500, 1000]); return { K: pk(r, [0.5, 2, 5, 10, 20]), T: [['p', w0]], w: [w0] }; } },
    int1: { nom: 'Intégrateur et premier ordre', tex: (b) => `${fmtK(b.K)}/(${v('p')}·(1 + ${v('p')}/${b.w[0]}))`, gen: (r) => { const w1 = pk(r, [10, 20, 50, 100]); return { K: pk(r, [5, 10, 50, 100, 200]), T: [['i'], ['p', w1]], w: [w1] }; } },
    avance: { nom: 'Correcteur à avance de phase', tex: (b) => `${kx(b.K)}(1 + ${v('p')}/${b.w[0]})/(1 + ${v('p')}/${b.w[1]})`, gen: (r) => { const w1 = pk(r, [10, 20, 50, 100]), k = pk(r, [5, 10, 20]); return { K: pk(r, [0.5, 1, 2, 5]), T: [['z', w1], ['p', w1 * k]], w: [w1, w1 * k] }; } },
    pb2: { nom: 'Deuxième ordre (asymptotes)', tex: (b) => `${fmtK(b.K)}/(1 + 2·${nf(b.m)}·${v('p')}/${b.w[0]} + ${v('p')}²/${b.w[0]}²)`, gen: (r) => { const w0 = pk(r, [20, 50, 100, 200, 500]); return { K: pk(r, [1, 2, 5, 10]), m: pk(r, [0.2, 0.5, 0.7]), T: [['p2', w0]], w: [w0] }; } },
    bande: { nom: 'Passe-bande', tex: (b) => `${kx(b.K)}(${v('p')}/${b.w[0]})/((1 + ${v('p')}/${b.w[0]})·(1 + ${v('p')}/${b.w[1]}))`, gen: (r) => { const w1 = pk(r, [10, 20, 50]), k = pk(r, [20, 50, 100]); return { K: pk(r, [1, 2, 10, 50]), T: [['d', w1], ['p', w1], ['p', w1 * k]], w: [w1, w1 * k] }; } },
    pi: { nom: 'Correcteur PI', tex: (b) => `${kx(b.Kaff)}(1 + 1/(${nf(1 / b.w[0], 4)}·${v('p')}))`, gen: (r) => { const wi = pk(r, [2, 5, 10, 20, 50]), K = pk(r, [0.5, 1, 2, 10]); return { K, Kaff: K, T: [['i'], ['z', wi]], w: [wi] }; } }
  };
  function pk(r, a) { return a[Math.floor(r() * a.length)]; }
  function fmtK(K) { return nf(K, 3); }
  function kx(K) { return K === 1 ? '' : `${fmtK(K)}·`; }
  function bodePrep(type, g) {
    const D = BODE[type], r = alea(g), B = D.gen(r);
    if (type === 'pi') B.K = B.Kaff * B.w[0];       // K·(1 + wi/p) = K·wi·(1/p)·(1 + p/wi) : constante K·wi devant les termes
    const xs = B.w.map(lg), xa = Math.floor(Math.min(...xs)) - 1, xb = Math.max(xa + 4, Math.ceil(Math.max(...xs)) + 1);
    let mn = Infinity, mx = -Infinity; for (let x = xa; x <= xb + 1e-9; x += 0.05) { const y = gas(B, x); mn = Math.min(mn, y); mx = Math.max(mx, y); }
    B.xa = xa; B.xb = xb; B.ya = Math.floor((mn - 10) / 20) * 20; B.yb = Math.ceil((mx + 10) / 20) * 20;
    if (B.yb - B.ya < 60) B.yb = B.ya + 60;
    // question chiffrée : pulsation où le gain asymptotique vaut 0 dB, sinon gain à une pulsation donnée
    let x0 = null; for (let x = xa; x < xb; x += 0.001) { const g1 = gas(B, x), g2 = gas(B, x + 0.001); if ((g1 > 0 && g2 < 0) || (g1 < 0 && g2 > 0)) { x0 = x + 0.0005; break; } }
    B.q = x0 != null ? { l: 'Pulsation où le gain asymptotique vaut 0 dB', u: 'rad/s', a: 10 ** x0, tol: 0.06 } : (() => { const xq = (xa + xb) / 2; return { l: `Gain asymptotique à ${v('ω')} = ${omega(xq)} rad/s`, u: 'dB', a: gas(B, xq), abs: 1.5 }; })();
    return B;
  }
  const BW = 640, BH = 380, ML = 54, MR = 14, MT = 14, MB = 40;
  function bodeSvg(B, P, att, faux) {
    const X = (x) => ML + (x - B.xa) / (B.xb - B.xa) * (BW - ML - MR), Y = (y) => MT + (B.yb - y) / (B.yb - B.ya) * (BH - MT - MB);
    let s = `<rect x="${ML}" y="${MT}" width="${BW - ML - MR}" height="${BH - MT - MB}" fill="#fff" stroke="#9aa9b4"/>`;
    for (let d = B.xa; d <= B.xb; d++) { for (let k = 1; k < 10 && d + lg(k) <= B.xb + 1e-9; k++) { const xx = X(d + lg(k)); s += `<line x1="${xx}" y1="${MT}" x2="${xx}" y2="${BH - MB}" stroke="${k === 1 ? '#9aa9b4' : '#e3e9ee'}" stroke-width="1"/>`; } s += `<text x="${X(d)}" y="${BH - MB + 16}" font-size="12" text-anchor="middle" fill="#42596b">10${d < 0 ? '⁻' : ''}<tspan dy="-5" font-size="9">${Math.abs(d)}</tspan></text>`; }
    for (let y = B.ya; y <= B.yb; y += 10) s += `<line x1="${ML}" y1="${Y(y)}" x2="${BW - MR}" y2="${Y(y)}" stroke="${y % 20 === 0 ? (y === 0 ? '#587083' : '#d0dae2') : '#eef2f5'}" stroke-width="${y === 0 ? 1.4 : 1}"/>` + (y % 20 === 0 ? `<text x="${ML - 6}" y="${Y(y) + 4}" font-size="12" text-anchor="end" fill="#42596b">${y}</text>` : '');
    s += `<text x="${BW - MR}" y="${BH - 6}" font-size="12" text-anchor="end" fill="#42596b">${'ω'} (rad/s)</text><text x="14" y="${MT + 10}" font-size="12" fill="#42596b">dB</text>`;
    if (faux) faux.forEach(([a, b]) => { s += `<rect x="${X(a)}" y="${MT}" width="${Math.max(2, X(b) - X(a))}" height="${BH - MT - MB}" fill="#c9483b" opacity=".08"/>`; });
    if (P.length) { s += `<path d="${P.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join('')}" fill="none" stroke="#12566f" stroke-width="2.6"/>`; P.forEach((p, i) => { s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="7" fill="#fff" stroke="#12566f" stroke-width="2.2" data-i="${i}"/>`; }); }
    if (att) { let d = ''; for (let x = B.xa; x <= B.xb + 1e-9; x += 0.05) d += `${d ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(gas(B, x)).toFixed(1)}`; s += `<path d="${d}" fill="none" stroke="#2f9e6e" stroke-width="3" stroke-dasharray="7 5" opacity=".85"/>`; }
    return { s, X, Y };
  }
  function bodeVerif(B, P) {
    const faux = []; let n = 0, ok = 0, a = null;
    const U = (x) => { for (let i = 0; i < P.length - 1; i++) if (x >= P[i].x - 1e-9 && x <= P[i + 1].x + 1e-9) return P[i].y + (P[i + 1].y - P[i].y) * (x - P[i].x) / ((P[i + 1].x - P[i].x) || 1); return null; };
    const det = [];
    for (let x = B.xa; x <= B.xb + 1e-9; x += 0.05) {
      n++; const u = U(x), gx = gas(B, x), bon = u != null && Math.abs(u - gx) <= 2.5;
      if (bon) { ok++; if (a != null) { faux.push([a, x - 0.05]); a = null; } } else { if (a == null) a = x; if (det.length < 4 && (!det.length || x - det[det.length - 1].x > 0.5)) det.push({ x, u, gx }); }
    }
    if (a != null) faux.push([a, B.xb]);
    return { n, ok, faux, det };
  }

  /* =================== chronogrammes =================== */
  // ligne : { nom, niv: [valeurs du bas vers le haut], lab: [étiquettes], fixe, val: [...], horloge: indice de début des impulsions }
  const CHRONO = {
    uart: { nom: 'Trame UART 8N1', gen: (r) => { const c = 33 + Math.floor(r() * 94), b = [...Array(8)].map((_, i) => (c >> i) & 1), bd = pk(r, [9600, 19200, 115200]);
      return { txt: `Tracer la ligne TX quand le caractère « ${E(String.fromCharCode(c))} » (0x${c.toString(16).toUpperCase()}) est émis en 8N1, bit de poids faible en premier ; la ligne est au repos à 1.`, cols: ['repos', 'start', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'stop', 'repos'],
        rows: [{ nom: 'TX', niv: [0, 1], lab: ['0', '1'], val: [1, 0, ...b, 1, 1] }], q: { l: `Durée de la trame (start à stop) à ${bd} bit/s`, u: 'ms', a: 10 / bd * 1e3, tol: 0.02 } }; } },
    uartp: { nom: 'Trame UART 8E1 (parité paire)', gen: (r) => { const c = 33 + Math.floor(r() * 94), b = [...Array(8)].map((_, i) => (c >> i) & 1), p = b.reduce((a, x) => a ^ x, 0);
      return { txt: `Tracer la ligne TX pour l’octet 0x${c.toString(16).toUpperCase()} en 8E1 : 8 bits de données (poids faible en premier), un bit de parité paire, un bit de stop ; repos à 1.`, cols: ['repos', 'start', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'parité', 'stop', 'repos'],
        rows: [{ nom: 'TX', niv: [0, 1], lab: ['0', '1'], val: [1, 0, ...b, p, 1, 1] }], q: { l: 'Nombre de bits à 1 parmi les 8 données et la parité', u: '', a: b.reduce((a, x) => a + x, 0) + p, abs: 0.1 } }; } },
    i2c: { nom: 'Premier octet I²C', gen: (r) => { const ad = 8 + Math.floor(r() * 112), rw = r() < 0.5 ? 0 : 1, b = [...Array(7)].map((_, i) => (ad >> (6 - i)) & 1);
      return { txt: `Le maître démarre un échange vers l’esclave d’adresse 0x${ad.toString(16).toUpperCase()} (7 bits) en ${rw ? 'lecture' : 'écriture'}. Tracer SDA : repos, condition de départ, les 7 bits d’adresse poids fort en premier, le bit R/W̄, puis l’acquittement de l’esclave. SCL est donnée.`, cols: ['repos', 'S', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1', 'a0', 'R/W̄', 'ACK'],
        rows: [{ nom: 'SCL', niv: [0, 1], lab: ['0', '1'], fixe: 1, horloge: 2, val: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, { nom: 'SDA', niv: [0, 1], lab: ['0', '1'], val: [1, 0, ...b, rw, 0] }], q: { l: 'Valeur décimale du premier octet transmis (adresse et R/W̄)', u: '', a: (ad << 1) | rw, abs: 0.1 } }; } },
    hach: { nom: 'Hacheur série', gen: (r) => { const a = pk(r, [2, 3, 4, 6, 7, 8]), E0 = pk(r, [24, 48, 100, 300]), H = [...Array(20)].map((_, i) => (i % 10 < a ? 1 : 0));
      return { txt: `Hacheur série sous ${E0} V, conduction continue, rapport cyclique ${nf(a / 10)}. La commande de l’interrupteur K est donnée (deux périodes). Tracer la tension ${v('u')} aux bornes de la charge et la tension ${v('v<sub>K</sub>')} aux bornes de K.`, cols: [...Array(20)].map((_, i) => (i % 10 === 0 ? (i ? 'T' : '0') : '')), bornes: 1,
        rows: [{ nom: 'commande K', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: H }, { nom: 'u', niv: [0, E0], lab: ['0', `${E0} V`], val: H.map((h) => (h ? E0 : 0)) }, { nom: 'vK', niv: [0, E0], lab: ['0', `${E0} V`], val: H.map((h) => (h ? 0 : E0)) }], q: { l: `Valeur moyenne de ${v('u')}`, u: 'V', a: a / 10 * E0, tol: 0.01 } }; } },
    ond: { nom: 'Onduleur à commande décalée', gen: (r) => { const k = pk(r, [1, 2, 3, 4]), E0 = pk(r, [48, 100, 230, 400]), K1 = [...Array(12)].map((_, i) => (i < 6 ? 1 : 0)), K3 = [...Array(12)].map((_, i) => ((i - k + 12) % 12 >= 6 ? 1 : 0));
      return { txt: `Pont complet sous ${E0} V : bras A (K1 en haut, K2 en bas, complémentaires), bras B (K3 en haut, K4 en bas). ${v('u')} = ${v('v<sub>A</sub>')} − ${v('v<sub>B</sub>')}. Les commandes de K1 et K3 sont données sur une période (pas de 30°). Tracer ${v('u')}.`, cols: [...Array(12)].map((_, i) => `${i * 30}°`), bornes: 1,
        rows: [{ nom: 'K1', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: K1 }, { nom: 'K3', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: K3 }, { nom: 'u', niv: [-E0, 0, E0], lab: [`−${E0}`, '0', `${E0}`], val: K1.map((x, i) => E0 * (x - K3[i])) }], q: { l: `Valeur efficace de ${v('u')}`, u: 'V', a: E0 * Math.sqrt((6 - k) / 6), tol: 0.02 } }; } },
    bascd: { nom: 'Bascule D sur front montant', gen: (r) => { const d = [...Array(8)].map(() => (r() < 0.5 ? 0 : 1)), D = d.flatMap((x) => [x, x]), Q = [...Array(16)].map((_, s) => (s === 0 ? 0 : d[Math.floor((s - 1) / 2)]));
      return { txt: 'Bascule D active sur front montant de l’horloge, Q = 0 au départ. L’horloge et l’entrée D sont données. Tracer Q.', cols: [...Array(16)].map((_, i) => (i % 2 ? '↑' : '')), bornes: 1,
        rows: [{ nom: 'H', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: [...Array(16)].map((_, s) => s % 2) }, { nom: 'D', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: D }, { nom: 'Q', niv: [0, 1], lab: ['0', '1'], val: Q }], q: { l: 'Nombre de fronts montants de Q sur le chronogramme', u: '', a: Q.reduce((a, x, i) => a + (i && !Q[i - 1] && x ? 1 : 0), 0), abs: 0.1 } }; } },
    cpt: { nom: 'Compteur 2 bits synchrone', gen: (r) => { const f = pk(r, [1, 2, 8, 50]), c = [...Array(16)].map((_, s) => Math.floor((s + 1) / 2) % 4);
      return { txt: `Compteur 2 bits (Q1 poids fort, Q0 poids faible) qui s’incrémente sur chaque front montant de l’horloge, à 0 au départ. Tracer Q0 et Q1.`, cols: [...Array(16)].map((_, i) => (i % 2 ? '↑' : '')), bornes: 1,
        rows: [{ nom: 'H', niv: [0, 1], lab: ['0', '1'], fixe: 1, val: [...Array(16)].map((_, s) => s % 2) }, { nom: 'Q0', niv: [0, 1], lab: ['0', '1'], val: c.map((x) => x & 1) }, { nom: 'Q1', niv: [0, 1], lab: ['0', '1'], val: c.map((x) => (x >> 1) & 1) }], q: { l: `Fréquence de Q1 pour une horloge à ${f} kHz`, u: 'kHz', a: f / 4, tol: 0.01 } }; } }
  };
  const CW = 40, RH = 54, LW = 96;
  function rangSvg(C, R, cur, att, faux, mobile) {
    const n = C.cols.length, W = LW + n * CW + 10, yv = (val) => { const k = R.niv.indexOf(val); return k < 0 ? null : RH - 10 - k * (RH - 20) / (R.niv.length - 1); };
    let s = `<text x="8" y="${RH / 2 + 5}" font-size="14" font-weight="700" fill="#183047">${E(R.nom)}</text>`;
    R.lab.forEach((l, k) => { s += `<text x="${LW - 6}" y="${RH - 10 - k * (RH - 20) / (R.niv.length - 1) + 4}" font-size="10" text-anchor="end" fill="#587083">${E(l)}</text>`; });
    for (let i = 0; i < n; i++) s += `<rect x="${LW + i * CW}" y="2" width="${CW}" height="${RH - 4}" fill="${faux && faux[i] ? '#fdecea' : R.fixe ? '#f6f8fa' : '#fff'}" stroke="#e3e9ee"/>`;
    const trace = (vals, coul, dash, w) => { let d = '', py = null; vals.forEach((val, i) => { const y = val == null ? null : yv(val); if (y == null) { py = null; return; } const x0 = LW + i * CW, x1 = x0 + CW; d += py == null ? `M${x0} ${y}` : `L${x0} ${py}L${x0} ${y}`; d += `L${x1} ${y}`; py = y; }); return d ? `<path d="${d}" fill="none" stroke="${coul}" stroke-width="${w}"${dash ? ' stroke-dasharray="6 4"' : ''}/>` : ''; };
    if (R.horloge != null) { let d = `M${LW} ${yv(1)}L${LW + R.horloge * CW} ${yv(1)}`; for (let i = R.horloge; i < n; i++) { const x0 = LW + i * CW; d += `L${x0} ${yv(1)}L${x0 + CW * 0.25} ${yv(1)}L${x0 + CW * 0.25} ${yv(0)}L${x0 + CW * 0.5} ${yv(0)}L${x0 + CW * 0.5} ${yv(1)}L${x0 + CW} ${yv(1)}`; } s += `<path d="${d}" fill="none" stroke="#42596b" stroke-width="2"/>`; }
    else s += trace(cur, R.fixe ? '#42596b' : '#12566f', false, R.fixe ? 2 : 2.6);
    if (!R.fixe) cur.forEach((val, i) => { if (val == null) s += `<line x1="${LW + i * CW + 6}" y1="${RH / 2}" x2="${LW + (i + 1) * CW - 6}" y2="${RH / 2}" stroke="#bbccd8" stroke-dasharray="3 3"/>`; });
    if (att) s += trace(R.val, '#2f9e6e', true, 2.4);
    return mobile ? s : `<svg viewBox="0 0 ${W} ${RH}" width="${W}" height="${RH}" class="dr-row${R.fixe ? '' : ' ed'}" style="min-width:${W}px">${s}</svg>`;
  }
  function entete(C) {
    const n = C.cols.length, W = LW + n * CW + 10;
    return `<svg viewBox="0 0 ${W} 22" width="${W}" height="22" style="min-width:${W}px">${C.cols.map((c, i) => `<text x="${C.bornes ? LW + i * CW : LW + i * CW + CW / 2}" y="15" font-size="10.5" text-anchor="middle" fill="#587083">${E(c)}</text>`).join('')}</svg>`;
  }

  /* =================== pages =================== */
  function css() {
    if ($('#dr-css')) return;
    const s = document.createElement('style'); s.id = 'dr-css';
    s.textContent = `.dr-plot{width:100%;max-width:${BW}px;height:auto;display:block;touch-action:none;user-select:none;-webkit-user-select:none;cursor:crosshair;background:#fbfdfe;border-radius:8px}.dr-ch{overflow-x:auto;-webkit-overflow-scrolling:touch;background:#fff;border-radius:10px;padding:8px 6px}.dr-ch svg{display:block}.dr-row.ed{touch-action:none;cursor:pointer;user-select:none;-webkit-user-select:none}.dr-q{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}.dr-q input{font:inherit;width:130px;padding:6px 8px;border:1px solid #bbccd8;border-radius:6px}.dr-q input.ok{border-color:#2f9e6e;background:#eef8f2}.dr-q input.ko{border-color:#c9483b;background:#fdf0ee}.dr-tf{font-family:ui-serif,Georgia,serif;font-size:17px;background:#fff;border-radius:8px;padding:8px 12px;display:inline-block;margin:6px 0}`;
    document.head.appendChild(s);
  }
  const TITRES = Object.assign({}, ...Object.entries(BODE).map(([k, x]) => ({ ['bode-' + k]: 'Bode · ' + x.nom })), ...Object.entries(CHRONO).map(([k, x]) => ({ ['ch-' + k]: x.nom })));
  function carte() {
    const n = S().dr.length, j = S().dr.filter((x) => x.juste).length;
    return `<div class="ec-ep" style="--c:#4a5fa8"><div class="eyebrow">Épreuves de spécialité · documents réponses</div><h3>Documents réponses interactifs</h3><p class="muted">Tracer à la souris ou au doigt, puis vérifier : diagrammes de Bode asymptotiques, trames UART et I²C, hacheur, onduleur à commande décalée, bascule D, compteur. Écarts en rouge, tracé attendu en vert.${n ? ` ${j} tracé${j > 1 ? 's' : ''} juste${j > 1 ? 's' : ''} sur ${n}.` : ''}</p><div class="btns"><a class="b" href="#ecrits-dr">Tracer</a></div></div>`;
  }
  function accueil() {
    css();
    const fait = (id) => { const L = S().dr.filter((x) => x.type === id); return L.length ? (L.some((x) => x.juste) ? '<span class="ec-tag ok">juste</span>' : `<span class="ec-tag w">${L.length} essai${L.length > 1 ? 's' : ''}</span>`) : ''; };
    const g = () => 1 + Math.floor(Math.random() * 99999);
    app().innerHTML = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · documents réponses</div><h1>Documents réponses interactifs</h1>
      <p class="muted">Le diagramme de Bode asymptotique n’a été tracé correctement que par sept candidats en 2026 (externe, épreuve 2) ; les trames série et I²C reviennent chaque année. Ici, le tracé se fait sur le document et se vérifie tout de suite. Un nouveau tirage donne d’autres valeurs.</p>
      <h2 class="sec">Diagrammes de Bode asymptotiques</h2><ul class="ec-list">${Object.entries(BODE).map(([k, x]) => `<li><a href="#ecrits-dr-bode-${k}-${g()}"><b>Bode</b><span>${E(x.nom)}</span>${fait('bode-' + k)}</a></li>`).join('')}</ul>
      <h2 class="sec">Chronogrammes</h2><ul class="ec-list">${Object.entries(CHRONO).map(([k, x]) => `<li><a href="#ecrits-dr-ch-${k}-${g()}"><b>Chrono</b><span>${E(x.nom)}</span>${fait('ch-' + k)}</a></li>`).join('')}</ul>`;
  }
  function enregistrer(type, ok, n, juste) { S().dr.push({ t: Date.now(), type, ok, n, juste: juste ? 1 : 0 }); if (S().dr.length > 300) S().dr.splice(0, S().dr.length - 300); save(); }
  function question(q) { return `<div class="dr-q"><label>${q.l} <input id="dr-qx" inputmode="decimal" autocomplete="off"></label><span>${E(q.u)}</span></div>`; }
  function corrigerQ(q) { const inp = $('#dr-qx'), x = nombre(inp.value), ok = x != null && Math.abs(x - q.a) <= Math.max((q.tol || 0) * Math.abs(q.a), q.abs || 0) + 1e-9; inp.classList.add(ok ? 'ok' : 'ko'); inp.disabled = true; if (!ok) inp.insertAdjacentHTML('afterend', ` <small>attendu ${F(q.a)}</small>`); return ok; }

  function pageBode(type, g) {
    css();
    const D = BODE[type]; if (!D) return accueil();
    const B = bodePrep(type, g); let P = [], fini = false, att = false, faux = null, drag = -1, bouge = false, rendu = null, tape = null;
    const ajouts = [];
    window.__drB = { B, P: () => P };   // pour les tests
    app().innerHTML = `<a class="back" href="#ecrits-dr">← Documents réponses</a><div class="eyebrow">Bode asymptotique · tirage ${g}</div><h1>${E(D.nom)}</h1>
      <div class="card"><p>Tracer le diagramme asymptotique du gain de</p><div class="dr-tf">${v('H')}(${v('p')}) = ${D.tex(B)}</div><p class="muted">Touche ou clique pour poser un point (accroché tous les 1/20 de décade et tous les 1 dB), fais glisser un point pour le déplacer, touche-le deux fois pour l’enlever. Trace d’un bord à l’autre ; les pulsations sont en rad/s.</p></div>
      <svg class="dr-plot" id="dr-sv" viewBox="0 0 ${BW} ${BH}" xmlns="${NS}"></svg><div class="btns" style="margin-top:8px"><button class="b sec" id="dr-annule">Retirer le dernier point posé</button><button class="b sec" id="dr-raz">Tout effacer</button></div>
      ${question(B.q)}<div class="btns"><button class="b" id="dr-verif">Vérifier</button><a class="b sec" href="#ecrits-dr-bode-${type}-${g + 1}">Nouveau tirage</a></div><div id="dr-res"></div>`;
    const sv = $('#dr-sv');
    const dessiner = () => { rendu = bodeSvg(B, P, att, faux); sv.innerHTML = rendu.s; };
    const coord = (e) => { const r = sv.getBoundingClientRect(); return { px: (e.clientX - r.left) * BW / r.width, py: (e.clientY - r.top) * BH / r.height }; };
    const verse = ({ px, py }) => { let x = B.xa + (px - ML) / (BW - ML - MR) * (B.xb - B.xa), y = B.yb - (py - MT) / (BH - MT - MB) * (B.yb - B.ya); x = Math.round(x * 20) / 20; y = Math.round(y); if (x - B.xa < 0.15) x = B.xa; if (B.xb - x < 0.15) x = B.xb; return { x: Math.max(B.xa, Math.min(B.xb, x)), y: Math.max(B.ya, Math.min(B.yb, y)) }; };
    const trier = () => { P.sort((a, b) => a.x - b.x); };
    sv.onpointerdown = (e) => {
      if (fini) return; e.preventDefault(); const c = coord(e);
      drag = P.findIndex((p) => Math.hypot(rendu.X(p.x) - c.px, rendu.Y(p.y) - c.py) < 14); bouge = false;
      if (drag < 0) { const q = verse(c), k = P.findIndex((p) => Math.abs(p.x - q.x) < 1e-9); if (k >= 0) P.splice(k, 1); P.push(q); ajouts.push(q); trier(); drag = P.indexOf(q); bouge = true; dessiner(); }
      try { sv.setPointerCapture(e.pointerId); } catch (x) { /* ancien navigateur */ }
    };
    sv.onpointermove = (e) => {
      if (drag < 0 || fini || !P[drag]) return;
      const q = verse(coord(e)), o = P[drag]; if (o.x === q.x && o.y === q.y) return;
      o.x = q.x; o.y = q.y; bouge = true;
      const k = P.findIndex((p) => p !== o && Math.abs(p.x - o.x) < 1e-9); if (k >= 0) P.splice(k, 1);
      trier(); drag = P.indexOf(o); dessiner();
    };
    sv.onpointerup = sv.onpointercancel = () => {
      if (drag >= 0 && !bouge && P[drag]) { const o = P[drag], t = Date.now(); if (tape && tape.o === o && t - tape.t < 450) { P.splice(drag, 1); tape = null; dessiner(); } else tape = { o, t }; }
      drag = -1;
    };
    dessiner();
    $('#dr-annule').onclick = () => { if (fini) return; while (ajouts.length) { const o = ajouts.pop(), k = P.indexOf(o); if (k >= 0) { P.splice(k, 1); break; } } dessiner(); };
    $('#dr-raz').onclick = () => { if (fini) return; P = []; ajouts.length = 0; dessiner(); };
    $('#dr-verif').onclick = () => {
      if (fini) return;
      if (P.length < 2) { $('#dr-res').innerHTML = '<p class="ec-warn">Pose au moins deux points, d’un bord à l’autre.</p>'; return; }
      fini = true; const R = bodeVerif(B, P); att = true; faux = R.faux; dessiner();
      const okq = corrigerQ(B.q), juste = R.ok === R.n;
      const coupes = B.w.map((w) => `${nf(w)} rad/s`).join(' et ');
      $('#dr-res').innerHTML = `<div class="card"><h3 style="margin-top:0">${juste ? 'Tracé juste' : `Tracé juste sur ${Math.round(100 * R.ok / R.n)} % de la plage`}${okq ? ' · question juste' : ''}</h3>
        ${R.det.length ? `<ul>${R.det.map((d) => `<li>Vers ${v('ω')} = ${omega(d.x)} rad/s : ${d.u == null ? 'pas de tracé (il faut aller d’un bord à l’autre)' : `ton tracé est à ${nf(d.u, 1)} dB, l’asymptote à ${nf(d.gx, 1)} dB`}.</li>`).join('')}</ul>` : ''}
        <p>Méthode : ${B.T.some((t) => t[0] === 'i') ? `à basse fréquence, une droite de −20 dB/décade qui passe par ${nf(20 * lg(B.K), 1)} dB à ${v('ω')} = 1 rad/s` : B.T.some((t) => t[0] === 'd') ? `à basse fréquence, +20 dB/décade jusqu’à ${nf(B.w[0])} rad/s où le gain vaut ${nf(20 * lg(B.K), 1)} dB` : `à basse fréquence, ${nf(20 * lg(B.K), 1)} dB (20·log ${fmtK(B.K)})`} ; puis la pente change à chaque pulsation de cassure (${coupes}) : +20 dB/décade pour un zéro, −20 pour un pôle, −40 pour un pôle double. En vert, le tracé attendu ; en rouge, les zones où ton tracé s’en écarte de plus de 2,5 dB.</p></div>`;
      enregistrer('bode-' + type, R.ok + (okq ? 1 : 0), R.n + 1, juste && okq);
    };
  }
  function pageChrono(type, g) {
    css();
    const D = CHRONO[type]; if (!D) return accueil();
    const C = D.gen(alea(g)), cur = C.rows.map((R) => (R.fixe ? R.val.slice() : R.val.map(() => null)));
    let fini = false, faux = null, peint = null;
    window.__dr = { C, cur };   // pour les tests
    app().innerHTML = `<a class="back" href="#ecrits-dr">← Documents réponses</a><div class="eyebrow">Chronogramme · tirage ${g}</div><h1>${E(D.nom)}</h1>
      <div class="card"><p>${C.txt}</p><p class="muted">Touche une case pour choisir son niveau (chaque touche passe au niveau suivant), ou fais glisser pour recopier le même niveau sur plusieurs cases.</p></div>
      <div class="dr-ch" id="dr-ch">${entete(C)}${C.rows.map((R, k) => rangSvg(C, R, cur[k], false, null)).join('')}</div>${question(C.q)}<div class="btns"><button class="b" id="dr-verif">Vérifier</button><button class="b sec" id="dr-raz">Tout effacer</button><a class="b sec" href="#ecrits-dr-ch-${type}-${g + 1}">Nouveau tirage</a></div><div id="dr-res"></div>`;
    const SV = [...$('#dr-ch').querySelectorAll('svg.dr-row')];
    const redessiner = (k) => { SV[k].innerHTML = rangSvg(C, C.rows[k], cur[k], fini, faux && faux[k], true); };
    const idx = (sv, e) => { const r = sv.getBoundingClientRect(), x = (e.clientX - r.left) * sv.viewBox.baseVal.width / r.width, i = Math.floor((x - LW) / CW); return i >= 0 && i < C.cols.length ? i : -1; };
    SV.forEach((sv, k) => {
      const R = C.rows[k]; if (R.fixe) return;
      sv.onpointerdown = (e) => { if (fini) return; e.preventDefault(); const i = idx(sv, e); if (i < 0) return; const a = cur[k][i], j = R.niv.indexOf(a); peint = a == null ? R.niv[R.niv.length - 1] : R.niv[(j - 1 + R.niv.length) % R.niv.length]; cur[k][i] = peint; try { sv.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } redessiner(k); };
      sv.onpointermove = (e) => { if (fini || peint == null) return; const i = idx(sv, e); if (i >= 0 && cur[k][i] !== peint) { cur[k][i] = peint; redessiner(k); } };
      sv.onpointerup = sv.onpointercancel = () => { peint = null; };
    });
    $('#dr-raz').onclick = () => { if (fini) return; C.rows.forEach((R, k) => { if (!R.fixe) { cur[k] = R.val.map(() => null); redessiner(k); } }); };
    $('#dr-verif').onclick = () => {
      if (fini) return;
      fini = true; faux = C.rows.map((R, k) => (R.fixe ? null : R.val.map((x, i) => cur[k][i] !== x)));
      const n = C.rows.reduce((a, R) => a + (R.fixe ? 0 : R.val.length), 0), bad = faux.reduce((a, f) => a + (f ? f.filter(Boolean).length : 0), 0);
      C.rows.forEach((R, k) => { if (!R.fixe) redessiner(k); }); const okq = corrigerQ(C.q);
      $('#dr-res').innerHTML = `<div class="card"><h3 style="margin-top:0">${bad ? `${n - bad} cases justes sur ${n}` : 'Chronogramme juste'}${okq ? ' · question juste' : ''}</h3><p>${bad ? 'Les cases fausses sont en rouge ; le tracé attendu est en pointillés verts.' : 'Toutes les cases sont justes.'}</p></div>`;
      enregistrer('ch-' + type, n - bad + (okq ? 1 : 0), n + 1, !bad && okq);
    };
  }
  function route(h) {
    let m = h.match(/^ecrits-dr-bode-([a-z0-9]+)-(\d+)$/); if (m) return pageBode(m[1], +m[2]);
    m = h.match(/^ecrits-dr-ch-([a-z0-9]+)-(\d+)$/); if (m) return pageChrono(m[1], +m[2]);
    return accueil();
  }
  window.ECRITS_DR = { route, carte, BODE, CHRONO, bodePrep, gas, bodeVerif, alea, TITRES };
})();
