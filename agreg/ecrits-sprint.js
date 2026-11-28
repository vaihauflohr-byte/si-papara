/* =====================================================================
   SI Papara — agrégation : sprints de calcul (#ecrits-sprint)
   Dix calculs courts chronométrés, valeurs tirées au hasard : conversions, électricité, mécanique, fluides et
   thermique, réflexes numériques. Réponse validée par Entrée, correction immédiate, bilan avec les erreurs
   corrigées, meilleur temps par thème. Les écrits durent 4 à 6 h : la vitesse et la fiabilité des applications
   numériques libèrent du temps pour les parties qu'on ne traite jamais.
   Progression : st.ec.sprint (sprints datés). Globales de agreg/index.html : st, save, app, fmt.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 2 : d }).replace('-', '−'));
  const F = (x) => (typeof fmt === 'function' ? fmt(x) : nf(x, 3));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.sprint)) st.ec.sprint = []; return st.ec; };
  const pk = (a) => a[Math.floor(Math.random() * a.length)];
  const v = (s) => `<i class="v">${s}</i>`;
  const PI = Math.PI, R3 = Math.sqrt(3), g = 9.81;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

  // générateurs : { q, a, u, tol (relative) ou abs, c (correction) }
  const G = {
    conv: { nom: 'Conversions', c: '#1f6f8b', L: [
      () => { const N = pk([750, 1450, 1500, 2900, 3000, 16.6]); return { q: `${nf(N)} tr/min en rad/s`, a: N * PI / 30, u: 'rad/s', c: `${v('ω')} = ${v('N')}·π/30 = ${F(N * PI / 30)} rad/s` }; },
      () => { const x = pk([36, 50, 90, 110, 130]); return { q: `${x} km/h en m/s`, a: x / 3.6, u: 'm/s', c: `÷ 3,6 : ${F(x / 3.6)} m/s` }; },
      () => { const x = pk([1, 2.5, 12, 60, 85]); return { q: `${nf(x)} kWh en mégajoules`, a: x * 3.6, u: 'MJ', c: `1 kWh = 3,6 MJ : ${F(x * 3.6)} MJ` }; },
      () => { const x = pk([18, 90, 250, 720]); return { q: `${x} MJ en kWh`, a: x / 3.6, u: 'kWh', c: `÷ 3,6 : ${F(x / 3.6)} kWh` }; },
      () => { const x = pk([0.5, 2.8, 6, 10]); return { q: `${nf(x)} bar en kilopascals`, a: x * 100, u: 'kPa', c: `1 bar = 10⁵ Pa = 100 kPa : ${F(x * 100)} kPa` }; },
      () => { const x = pk([2000, 3400, 5000, 100000]); return { q: `${nf(x)} mAh en coulombs`, a: x * 3.6, u: 'C', c: `1 mAh = 3,6 C : ${F(x * 3.6)} C` }; },
      () => { const x = pk([15, 30, 45, 120, 200]); return { q: `${x}° en radians`, a: x * PI / 180, u: 'rad', c: `× π/180 : ${F(x * PI / 180)} rad` }; },
      () => { const f = pk([50, 60, 400, 1000]); return { q: `${f} Hz : pulsation`, a: 2 * PI * f, u: 'rad/s', c: `${v('ω')} = 2π·${v('f')} = ${F(2 * PI * f)} rad/s` }; },
      () => { const x = pk([1.2, 3, 7.5, 40]); return { q: `${nf(x)} m³/h en litres par seconde`, a: x / 3.6, u: 'L/s', c: `1 m³/h = 1 000 L/3 600 s : ${F(x / 3.6)} L/s` }; },
      () => { const x = pk([2.2, 15, 75, 250]); return { q: `${nf(x)} kW·h par jour : puissance moyenne`, a: x / 24 * 1000, u: 'W', c: `${nf(x)} kWh/24 h = ${F(x / 24 * 1000)} W` }; }
    ] },
    elec: { nom: 'Électricité', c: '#6a4c93', L: [
      () => { const I = pk([10, 16, 32, 63]), c = pk([0.8, 0.85, 0.9]); const P = R3 * 400 * I * c; return { q: `Triphasé 400 V, ${I} A, cos ${v('φ')} = ${nf(c)} : puissance active`, a: P / 1e3, u: 'kW', c: `√3·${v('U')}·${v('I')}·cos ${v('φ')} = ${F(P / 1e3)} kW` }; },
      () => { const A = pk([10, 12, 325, 565]); return { q: `Sinusoïde d’amplitude ${A} V : valeur efficace`, a: A / Math.SQRT2, u: 'V', c: `Û/√2 = ${F(A / Math.SQRT2)} V` }; },
      () => { const R = pk([0.05, 2.2, 10, 47]), I = pk([2, 5, 12, 30]); return { q: `${nf(R)} Ω parcourus par ${I} A : puissance dissipée`, a: R * I * I, u: 'W', c: `${v('R')}·${v('I')}² = ${F(R * I * I)} W` }; },
      () => { const L = pk([10, 47, 100, 330]); return { q: `Réactance d’une bobine de ${L} mH à 50 Hz`, a: L * 1e-3 * 100 * PI, u: 'Ω', c: `${v('L')}·${v('ω')} = ${L} × 10⁻³ × 100π = ${F(L * 1e-3 * 100 * PI)} Ω` }; },
      () => { const C = pk([10, 47, 100, 470]); return { q: `Réactance d’un condensateur de ${C} µF à 50 Hz`, a: 1 / (C * 1e-6 * 100 * PI), u: 'Ω', c: `1/(${v('C')}·${v('ω')}) = ${F(1 / (C * 1e-6 * 100 * PI))} Ω` }; },
      () => { const C = pk([470, 1000, 2200, 4700]), U = pk([12, 24, 48, 400]); return { q: `Énergie de ${C} µF chargés sous ${U} V`, a: C * 1e-6 * U * U / 2, u: 'J', c: `½·${v('C')}·${v('U')}² = ${F(C * 1e-6 * U * U / 2)} J` }; },
      () => { const A = pk([2, 10, 50, 300, 1000]); return { q: `Amplification ${A} : gain en décibels`, a: 20 * Math.log10(A), u: 'dB', abs: 0.1, c: `20·log ${A} = ${F(20 * Math.log10(A))} dB` }; },
      () => { const R1 = pk([1, 4.7, 10]), R2 = pk([2.2, 10, 22]), E0 = pk([5, 12, 24]); return { q: `Diviseur ${R1} kΩ (haut), ${R2} kΩ (bas), sous ${E0} V : tension de sortie`, a: E0 * R2 / (R1 + R2), u: 'V', c: `${v('E')}·${v('R<sub>2</sub>')}/(${v('R<sub>1</sub>')} + ${v('R<sub>2</sub>')}) = ${F(E0 * R2 / (R1 + R2))} V` }; },
      () => { const R = pk([1, 4.7, 10, 22]), C = pk([100, 220, 470]); return { q: `Constante de temps de ${R} kΩ et ${C} nF`, a: R * C * 1e-3, u: 'ms', c: `${v('R')}·${v('C')} = ${F(R * C * 1e-3)} ms` }; },
      () => { const P = pk([5, 12, 40, 75]), c = pk([0.8, 0.85, 0.9]); return { q: `${P} kW sous cos ${v('φ')} = ${nf(c)} : puissance réactive`, a: P * Math.tan(Math.acos(c)), u: 'kvar', c: `${v('P')}·tan ${v('φ')} = ${F(P * Math.tan(Math.acos(c)))} kvar` }; }
    ] },
    meca: { nom: 'Mécanique', c: '#5b6b2e', L: [
      () => { const C = pk([5, 12, 40, 150]), N = pk([750, 1450, 3000]); return { q: `Couple ${C} N·m à ${N} tr/min : puissance`, a: C * N * PI / 30 / 1e3, u: 'kW', c: `${v('C')}·${v('ω')} = ${C} × ${F(N * PI / 30)} = ${F(C * N * PI / 30 / 1e3)} kW` }; },
      () => { const m = pk([800, 1500, 12000]), x = pk([30, 50, 90]); return { q: `${nf(m)} kg à ${x} km/h : énergie cinétique`, a: m * (x / 3.6) ** 2 / 2 / 1e3, u: 'kJ', c: `½·${v('m')}·${v('v')}² = ${F(m * (x / 3.6) ** 2 / 2 / 1e3)} kJ` }; },
      () => { const P = pk([0.75, 1.5, 4, 11]), N = pk([1450, 2900, 960]); return { q: `${nf(P)} kW à ${N} tr/min : couple`, a: P * 1e3 / (N * PI / 30), u: 'N·m', c: `${v('P')}/${v('ω')} = ${F(P * 1e3 / (N * PI / 30))} N·m` }; },
      () => { const J = pk([0.01, 0.5, 2, 36500]), N = pk([16.6, 300, 1500]); return { q: `${nf(J)} kg·m² à ${nf(N)} tr/min : énergie cinétique`, a: J * (N * PI / 30) ** 2 / 2, u: 'J', c: `½·${v('J')}·${v('ω')}² = ${F(J * (N * PI / 30) ** 2 / 2)} J` }; },
      () => { const N = pk([1450, 2900]), r = pk([5, 12.88, 25, 40]); return { q: `Réducteur de rapport ${nf(r)} entraîné à ${N} tr/min : vitesse de sortie`, a: N / r, u: 'tr/min', c: `${N}/${nf(r)} = ${F(N / r)} tr/min` }; },
      () => { const C = pk([2, 5, 10]), r = pk([10, 20, 40]), e = pk([0.9, 0.95, 0.975]); return { q: `Couple moteur ${C} N·m, réducteur de rapport ${r}, rendement ${nf(e)} : couple de sortie`, a: C * r * e, u: 'N·m', c: `${v('C')}·${v('r')}·${v('η')} = ${F(C * r * e)} N·m` }; },
      () => { const m = pk([200, 1200, 5000]), h = pk([3, 12, 40]); return { q: `Monter ${nf(m)} kg de ${h} m : énergie potentielle`, a: m * g * h / 1e3, u: 'kJ', c: `${v('m')}·${v('g')}·${v('h')} = ${F(m * g * h / 1e3)} kJ` }; },
      () => { const m = pk([60, 750, 1500]), a = pk([0.5, 1.2, 2.5]); return { q: `${nf(m)} kg accélérés à ${nf(a)} m/s² : force`, a: m * a, u: 'N', c: `${v('m')}·${v('a')} = ${F(m * a)} N` }; },
      () => { const R = pk([0.25, 0.5, 6.8]), N = pk([16.6, 60, 300]); return { q: `Point à ${nf(R)} m de l’axe, ${nf(N)} tr/min : accélération normale`, a: R * (N * PI / 30) ** 2, u: 'm/s²', c: `${v('R')}·${v('ω')}² = ${F(R * (N * PI / 30) ** 2)} m/s²` }; },
      () => { const F0 = pk([50, 120, 800]), d = pk([0.2, 0.35, 1.5]); return { q: `${F0} N au bout d’un bras de ${nf(d)} m : moment`, a: F0 * d, u: 'N·m', c: `${v('F')}·${v('d')} = ${F(F0 * d)} N·m` }; }
    ] },
    flu: { nom: 'Fluides et thermique', c: '#7a5c1e', L: [
      () => { const m = pk([1, 50, 200]), d = pk([10, 25, 45]); return { q: `Chauffer ${m} L d’eau de ${d} °C : énergie`, a: m * 4180 * d / 3.6e6, u: 'kWh', c: `${v('m')}·${v('c')}·Δ${v('θ')} = ${m} × 4 180 × ${d} J = ${F(m * 4180 * d / 3.6e6)} kWh` }; },
      () => { const Q = pk([0.01, 0.05, 2, 150]), H = pk([8, 25, 60]); return { q: `${nf(Q)} m³/s sous ${H} m : puissance hydraulique`, a: 1000 * g * Q * H / 1e3, u: 'kW', c: `${v('ρ')}·${v('g')}·${v('Q')}·${v('H')} = ${F(1000 * g * Q * H / 1e3)} kW` }; },
      () => { const h = pk([2, 10, 35, 100]); return { q: `Pression sous ${h} m d’eau`, a: 1000 * g * h / 1e5, u: 'bar', c: `${v('ρ')}·${v('g')}·${v('h')} = ${F(1000 * g * h)} Pa = ${F(1000 * g * h / 1e5)} bar` }; },
      () => { const D = pk([50, 100, 200]), x = pk([0.5, 1, 2]); return { q: `Eau à ${nf(x)} m/s dans un tube de ${D} mm : débit`, a: x * PI * (D / 1e3) ** 2 / 4 * 3600, u: 'm³/h', c: `${v('v')}·π·${v('D')}²/4 = ${F(x * PI * (D / 1e3) ** 2 / 4)} m³/s = ${F(x * PI * (D / 1e3) ** 2 / 4 * 3600)} m³/h` }; },
      () => { const e = pk([0.1, 0.2, 0.3]), l = pk([0.035, 0.04, 1.4]), S0 = pk([10, 25, 100]); return { q: `Paroi de ${nf(e)} m, ${v('λ')} = ${nf(l, 3)} W/(m·K), ${S0} m² : résistance thermique`, a: e / (l * S0), u: 'K/W', c: `${v('e')}/(${v('λ')}·${v('S')}) = ${F(e / (l * S0))} K/W` }; },
      () => { const R = pk([0.002, 0.01, 0.05]), d = pk([20, 32, 55]); return { q: `Résistance thermique ${nf(R, 3)} K/W, écart ${d} K : flux`, a: d / R, u: 'W', c: `Δ${v('T')}/${v('R')} = ${F(d / R)} W` }; },
      () => { const a = pk([0.95, 0.97]), b = pk([0.9, 0.93]), c = pk([0.8, 0.85]); return { q: `Rendements en chaîne ${nf(a)}, ${nf(b)} et ${nf(c)} : rendement global`, a: a * b * c, u: '', c: `Produit : ${F(a * b * c)}` }; },
      () => { const q = pk([0.5, 1.96, 3]), d = pk([1.5, 5, 20]); return { q: `${nf(q)} kg/s d’eau réchauffés de ${nf(d)} K : puissance`, a: q * 4180 * d / 1e3, u: 'kW', c: `${v('q<sub>m</sub>')}·${v('c')}·Δ${v('θ')} = ${F(q * 4180 * d / 1e3)} kW` }; },
      () => { const qv = pk([10, 39, 120]), dp = pk([1.5, 2.8, 6]), e = pk([0.6, 0.7]); return { q: `Pompe : ${qv} m³/h, ${nf(dp)} bar, rendement ${nf(e)} : puissance absorbée`, a: qv / 3600 * dp * 1e5 / e / 1e3, u: 'kW', c: `${v('q<sub>v</sub>')}·Δ${v('p')}/${v('η')} = ${F(qv / 3600 * dp * 1e5 / e / 1e3)} kW` }; },
      () => { const h = pk([1, 2, 5]); return { q: `Vidange sous ${h} m de hauteur : vitesse de Torricelli`, a: Math.sqrt(2 * g * h), u: 'm/s', c: `√(2·${v('g')}·${v('h')}) = ${F(Math.sqrt(2 * g * h))} m/s` }; }
    ] },
    ref: { nom: 'Réflexes numériques', c: '#a8362b', L: [
      () => ({ q: `1 − e<sup>−1</sup> (réponse d’un premier ordre à ${v('t')} = ${v('τ')}), en %`, a: 63.2, u: '%', abs: 0.5, c: '63 % : à τ, 63 % de la valeur finale' }),
      () => ({ q: `Temps pour atteindre 95 % de la valeur finale, en nombre de constantes de temps`, a: 3, u: 'τ', abs: 0.1, c: '3τ (1 − e⁻³ = 95 %) ; 5τ pour 99 %' }),
      () => ({ q: `Nombre de secondes dans une année`, a: 3.1536e7, u: 's', tol: 0.02, c: '365 × 24 × 3 600 = 3,15 × 10⁷ s' }),
      () => ({ q: `ln 2`, a: Math.LN2, u: '', tol: 0.01, c: '0,693 : temps de doublement ou de demi-vie = τ·ln 2' }),
      () => { const a = pk([2, 3, 4, 5, 6, 8]), b = pk([-3, -2, 4, 5]), c = pk([3, 5, 7]), d = pk([-2, -1, 2, 3]); return { q: `${a} × 10<sup>${b}</sup> × ${c} × 10<sup>${d}</sup>`, a: a * c * 10 ** (b + d), u: '', tol: 0.005, c: `${a * c} × 10<sup>${b + d}</sup>` }; },
      () => ({ q: `Pulsation de coupure à −3 dB d’un RC : expression ${v('ω')}${'<sub>c</sub>'} = 1/(${v('R')}·${v('C')}) ; pour ${v('R')} = 1 kΩ et ${v('C')} = 1 µF`, a: 1000, u: 'rad/s', c: '1/(10³ × 10⁻⁶) = 1 000 rad/s, soit 159 Hz' }),
      () => { const x = pk([2, 3]); return { q: `√${x}`, a: Math.sqrt(x), u: '', tol: 0.005, c: `${F(Math.sqrt(x))}` }; },
      () => ({ q: `Gain en dB d’une division par √2 de l’amplitude`, a: -3.01, u: 'dB', abs: 0.1, c: '20·log(1/√2) = −3 dB' }),
      () => ({ q: `Pente d’un deuxième ordre au-delà de la pulsation propre`, a: -40, u: 'dB/décade', abs: 0.5, c: '−40 dB/décade (−20 par pôle)' }),
      () => { const n = pk([8, 10, 12, 16]); return { q: `Nombre de valeurs d’un convertisseur ${n} bits`, a: 2 ** n, u: '', abs: 0.5, c: `2<sup>${n}</sup> = ${nf(2 ** n, 0)}` }; }
    ] }
  };
  const ORDRE = ['conv', 'elec', 'meca', 'flu', 'ref'];
  function tirer(cat) {
    const cats = cat === 'mix' ? ORDRE : [cat], out = [], vus = new Set();
    for (let k = 0; out.length < 10 && k < 400; k++) {
      const c = cats[k % cats.length], L = G[c].L, i = Math.floor(Math.random() * L.length), cle = c + i;
      if (vus.has(cle) && vus.size < cats.reduce((a, x) => a + G[x].L.length, 0)) continue;
      vus.add(cle); out.push(Object.assign({ cat: c }, L[i]()));
    }
    return out;
  }
  const nombre = (s) => { const t = String(s || '').trim().replace(/\s| | /g, '').replace(/−/g, '-').replace(',', '.').replace(/[×x]10\^?/i, 'e'); if (!t) return null; const x = parseFloat(t); return isFinite(x) ? x : null; };
  const juste = (q, x) => x != null && Math.abs(x - q.a) <= Math.max((q.tol == null ? 0.01 : q.tol) * Math.abs(q.a), q.abs || 0) + 1e-12;
  const records = (cat) => S().sprint.filter((x) => x.cat === cat && x.ok >= 9).sort((a, b) => a.s - b.s)[0];

  function css() {
    if ($('#sp-css')) return;
    const s = document.createElement('style'); s.id = 'sp-css';
    s.textContent = `.sp-q{font-size:20px;margin:14px 0 10px}.sp-in{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.sp-in input{font:inherit;font-size:20px;width:170px;padding:8px 10px;border:2px solid #bbccd8;border-radius:8px}.sp-fb{min-height:28px;margin-top:8px;font-weight:600}.sp-fb.ok{color:#1f7a53}.sp-fb.ko{color:#a8362b}.sp-bar{height:8px;border-radius:4px;background:#e0e8ef;overflow:hidden;margin:10px 0}.sp-bar i{display:block;height:100%;background:#12566f}`;
    document.head.appendChild(s);
  }
  function carte() {
    const n = S().sprint.length, d = S().sprint.slice(-1)[0];
    return `<div class="ec-ep" style="--c:#12566f"><div class="eyebrow">Toutes les épreuves · vitesse</div><h3>Sprints de calcul</h3><p class="muted">Dix applications numériques chronométrées : conversions, électricité, mécanique, fluides et thermique, réflexes. Correction immédiate, meilleur temps par thème.${d ? ` Dernier sprint : ${d.ok}/10 en ${mmss(d.s)}.` : ''}${n > 1 ? ` ${n} sprints.` : ''}</p><div class="btns"><a class="b" href="#ecrits-sprint">Sprinter</a></div></div>`;
  }
  function accueil() {
    css();
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · vitesse et fiabilité</div><h1>Sprints de calcul</h1><p class="muted">Dix calculs courts, chronométrés, avec la calculatrice comme le jour de l’épreuve. Réponds avec l’unité indiquée, valide avec Entrée : la correction s’affiche aussitôt. Objectif : dix sur dix en moins de quatre minutes.</p><div class="ec-grid">`;
    [...ORDRE, 'mix'].forEach((c) => {
      const T = c === 'mix' ? { nom: 'Tout mélangé', c: '#183047' } : G[c], r = records(c), n = S().sprint.filter((x) => x.cat === c).length;
      h += `<div class="ec-ep" style="--c:${T.c}"><h3>${E(T.nom)}</h3><p class="muted">${r ? `Record : ${r.ok}/10 en ${mmss(r.s)}` : 'Pas encore de record (9/10 au moins).'}${n ? ` · ${n} sprint${n > 1 ? 's' : ''}` : ''}</p><div class="btns"><a class="b" href="#ecrits-sprint-${c}">Partir</a></div></div>`;
    });
    h += '</div>';
    const L = S().sprint.slice(-8).reverse();
    if (L.length) h += `<h2 class="sec">Mes derniers sprints</h2><div class="ec-sc"><table class="ec-tab"><tr><th>Date</th><th>Thème</th><th>Justes</th><th>Temps</th></tr>${L.map((x) => `<tr><td>${new Date(x.t).toLocaleDateString('fr-FR')}</td><td>${E(x.cat === 'mix' ? 'Tout mélangé' : (G[x.cat] || {}).nom || x.cat)}</td><td class="n">${x.ok} / ${x.n}</td><td class="n">${mmss(x.s)}</td></tr>`).join('')}</table></div>`;
    app().innerHTML = h;
  }
  function sprint(cat) {
    css();
    if (cat !== 'mix' && !G[cat]) return accueil();
    const Q = tirer(cat), rep = [], t0 = Date.now();
    window.__spQ = Q;   // pour les tests
    let i = 0, attente = false, tm = 0;
    app().innerHTML = `<a class="back" href="#ecrits-sprint">← Sprints de calcul</a><div class="eyebrow">${E(cat === 'mix' ? 'Tout mélangé' : G[cat].nom)} · 10 calculs</div><h1 id="sp-h">Calcul 1 sur 10</h1><div class="sp-bar"><i id="sp-bar" style="width:0%"></i></div><div class="btns" style="align-items:center"><span class="ec-clock" id="sp-cl" style="font-size:28px;padding:8px 14px">0:00</span></div><div class="card" id="sp-card"></div><div id="sp-fin"></div>`;
    const tic = () => { const el = $('#sp-cl'); if (!el) { clearInterval(tm); return; } el.textContent = mmss((Date.now() - t0) / 1000); };
    tm = setInterval(tic, 500); window.__an = tm;
    function montre() {
      const q = Q[i];
      $('#sp-h').textContent = `Calcul ${i + 1} sur ${Q.length}`; $('#sp-bar').style.width = `${100 * i / Q.length}%`;
      $('#sp-card').innerHTML = `<div class="sp-q">${q.q}</div><form class="sp-in" id="sp-f" autocomplete="off"><input id="sp-x" inputmode="decimal" aria-label="Réponse" autocomplete="off"><span>${E(q.u)}</span><button class="b" type="submit">Valider</button></form><div class="sp-fb" id="sp-fb" role="status"></div>`;
      const x = $('#sp-x'); x.focus();
      $('#sp-f').onsubmit = (e) => {
        e.preventDefault();
        if (attente) { suivant(); return; }
        const val = nombre(x.value); if (val == null && x.value.trim() === '') return;
        const ok = juste(q, val); rep.push({ q, x: x.value, ok });
        x.disabled = true; attente = true;
        const fb = $('#sp-fb'); fb.className = 'sp-fb ' + (ok ? 'ok' : 'ko');
        fb.innerHTML = ok ? '✓ Juste' : `✗ Attendu ${F(q.a)} ${E(q.u)} — ${q.c}`;
        setTimeout(() => { if (attente && Q[i] === q) suivant(); }, ok ? 500 : 2200);
      };
    }
    function suivant() {
      attente = false; i++;
      if (i < Q.length) return montre();
      clearInterval(tm);
      const s = (Date.now() - t0) / 1000, ok = rep.filter((r) => r.ok).length;
      S().sprint.push({ t: Date.now(), cat, ok, n: Q.length, s: Math.round(s) }); if (S().sprint.length > 300) S().sprint.splice(0, S().sprint.length - 300); save();
      const r = records(cat);
      $('#sp-h').textContent = `${ok} / ${Q.length} en ${mmss(s)}`; $('#sp-bar').style.width = '100%'; $('#sp-card').remove();
      const faux = rep.filter((x) => !x.ok);
      $('#sp-fin').innerHTML = `<div class="card"><p>${ok === Q.length ? 'Dix sur dix.' : `${Q.length - ok} erreur${Q.length - ok > 1 ? 's' : ''} : relis les corrections, puis recommence.`} ${r && Math.round(s) === r.s && ok >= 9 ? '<b>Nouveau record pour ce thème.</b>' : r ? `Record du thème : ${mmss(r.s)}.` : ''}</p>${faux.length ? `<ul>${faux.map((x) => `<li>${x.q.q} : tu as écrit « ${E(x.x)} », attendu <b>${F(x.q.a)} ${E(x.q.u)}</b>. ${x.q.c}</li>`).join('')}</ul>` : ''}<div class="btns"><a class="b" href="#ecrits-sprint-${cat}-${Date.now() % 100000}">Recommencer</a><a class="b sec" href="#ecrits-sprint">Autre thème</a></div></div>`;
    }
    montre();
  }
  function route(h) {
    const m = h.match(/^ecrits-sprint-([a-z]+)(?:-\d+)?$/);
    return m ? sprint(m[1]) : accueil();
  }
  window.ECRITS_SPRINT = { route, carte, G, tirer, juste };
})();
