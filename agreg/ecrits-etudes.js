/* =====================================================================
   SI Papara — agrégation : études de systèmes récents (#ecrits-etudes)
   Quatre études enchaînées sur les systèmes des sujets 2025 (centrale hydroélectrique, borne de recharge rapide,
   méthanisation, dirigeable), rédigées pour le site avec des données tirées au hasard (une graine par tirage) :
   chaque question se vérifie, donne la correction et la valeur à retenir pour la suite, comme dans un vrai sujet.
   Progression : st.ec.et (études terminées, datées) ; l'étude en cours est gardée dans ce navigateur.
   Globales de agreg/index.html : st, save, app, fmt.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 2 : d }).replace('-', '−'));
  const F = (x) => (typeof fmt === 'function' ? fmt(x) : nf(x, 3));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.et)) st.ec.et = []; return st.ec; };
  const lire = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  const CLE = 'agreg-etude-encours', g0 = 9.81;
  const v = (s) => `<i class="v">${s}</i>`;
  // tirage reproductible : la même graine redonne les mêmes données
  const alea = (g) => { let a = (g >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pk = (r, a) => a[Math.floor(r() * a.length)];
  const tab = (L) => `<div class="ec-sc"><table class="ec-tab">${L.map(([a, b]) => `<tr><td>${a}</td><td class="n">${b}</td></tr>`).join('')}</table></div>`;

  const ETUDES = [
    { id: 'hydro', titre: 'Centrale hydroélectrique au fil de l’eau', sys: 'Système de l’externe 2025, épreuve 1', min: 40, c: '#1f6f8b',
      data: (r) => { const D = { Q: pk(r, [150, 200, 250, 300]), H: pk(r, [7, 8, 9, 10, 11]), et: pk(r, [0.9, 0.92, 0.93]), p: pk(r, [32, 36, 40]), ea: 0.97, U: pk(r, [6.3, 10.5]), cp: pk(r, [0.9, 0.95]), J: pk(r, [2.5e6, 3.5e6, 5e6]), fc: pk(r, [0.45, 0.55, 0.62]) };
        D.Ph = 1000 * g0 * D.Q * D.H; D.Pm = D.et * D.Ph; D.N = 3000 / D.p; D.w = D.N * Math.PI / 30; D.C = D.Pm / D.w; D.Pe = D.ea * D.Pm; D.I = D.Pe / (Math.sqrt(3) * D.U * 1e3 * D.cp); D.Qr = D.Pe * Math.tan(Math.acos(D.cp));
        D.E = D.Pe * D.fc * 8760; D.foy = D.E / 4.5e6; D.td = D.J * D.w * D.w * (1.21 - 1) / (2 * D.Pm); D.Pe2 = D.ea * (D.et - 0.03) * 1000 * g0 * 0.8 * D.Q * (D.H + 0.5); return D; },
      intro: (D) => `<p>Un groupe bulbe d’une centrale au fil de l’eau : une turbine Kaplan à pales orientables entraîne directement un alternateur synchrone couplé au réseau à 50 Hz.</p>${tab([['Débit turbiné', `${nf(D.Q)} m³/s`], ['Hauteur de chute nette', `${nf(D.H)} m`], ['Rendement de la turbine', nf(D.et)], ['Paires de pôles de l’alternateur', D.p], ['Rendement de l’alternateur', nf(D.ea)], ['Tension composée de l’alternateur', `${nf(D.U)} kV`], ['Facteur de puissance', nf(D.cp)], ['Inertie des masses tournantes', `${nf(D.J / 1e6)} × 10⁶ kg·m²`], ['Facteur de charge annuel', nf(D.fc)], ['Consommation d’un foyer', '4,5 MWh par an']])}`,
      q: [
        { t: 'Puissance hydraulique', q: () => `Exprimer puis calculer la puissance hydraulique ${v('P<sub>h</sub>')} disponible.`, f: (D) => [{ l: 'Ph', u: 'MW', a: D.Ph / 1e6 }],
          c: (D) => `${v('P<sub>h</sub>')} = ${v('ρ')}·${v('g')}·${v('Q')}·${v('H')} = 1 000 × 9,81 × ${nf(D.Q)} × ${nf(D.H)} = <b>${F(D.Ph / 1e6)} MW</b>.`, r: (D) => `${v('P<sub>h</sub>')} = ${F(D.Ph / 1e6)} MW` },
        { t: 'Arbre de la turbine', q: () => `Puissance mécanique sur l’arbre, vitesse de rotation imposée par le réseau et couple.`, f: (D) => [{ l: 'Pm', u: 'MW', a: D.Pm / 1e6 }, { l: 'Vitesse', u: 'tr/min', a: D.N, tol: 0.01 }, { l: 'Couple', u: 'MN·m', a: D.C / 1e6 }],
          c: (D) => `${v('P<sub>m</sub>')} = ${nf(D.et)} × ${F(D.Ph / 1e6)} = <b>${F(D.Pm / 1e6)} MW</b> ; alternateur synchrone : ${v('N')} = 60·${v('f')}/${v('p')} = 3 000/${D.p} = <b>${F(D.N)} tr/min</b>, soit ${v('ω')} = ${F(D.w)} rad/s ; ${v('C')} = ${v('P<sub>m</sub>')}/${v('ω')} = <b>${F(D.C / 1e6)} MN·m</b>. Basse chute et gros débit : une machine lente à très fort couple.`, r: (D) => `${v('P<sub>m</sub>')} = ${F(D.Pm / 1e6)} MW, ${v('ω')} = ${F(D.w)} rad/s` },
        { t: 'Côté électrique', q: () => `Puissance active fournie au réseau, courant de ligne de l’alternateur et puissance réactive.`, f: (D) => [{ l: 'Pe', u: 'MW', a: D.Pe / 1e6 }, { l: 'Courant de ligne', u: 'kA', a: D.I / 1e3 }, { l: 'Puissance réactive', u: 'Mvar', a: D.Qr / 1e6 }],
          c: (D) => `${v('P<sub>e</sub>')} = ${nf(D.ea)} × ${F(D.Pm / 1e6)} = <b>${F(D.Pe / 1e6)} MW</b> ; ${v('I')} = ${v('P<sub>e</sub>')}/(√3·${v('U')}·cos ${v('φ')}) = <b>${F(D.I / 1e3)} kA</b> ; ${v('Q')} = ${v('P<sub>e</sub>')}·tan ${v('φ')} = <b>${F(D.Qr / 1e6)} Mvar</b> (tan ${v('φ')} = ${F(Math.tan(Math.acos(D.cp)))}).`, r: (D) => `${v('P<sub>e</sub>')} = ${F(D.Pe / 1e6)} MW` },
        { t: 'Production annuelle', q: () => `Énergie produite sur une année avec le facteur de charge donné, et nombre de foyers dont elle couvre la consommation.`, f: (D) => [{ l: 'Énergie', u: 'GWh', a: D.E / 1e9 }, { l: 'Foyers', u: '', a: D.foy }],
          c: (D) => `${v('E')} = ${v('P<sub>e</sub>')} × ${nf(D.fc)} × 8 760 h = <b>${F(D.E / 1e9)} GWh</b> ; ${F(D.E / 1e9)} GWh/4,5 MWh = <b>${F(D.foy)} foyers</b>.` },
        { t: 'Perte brutale de la charge', q: () => `Le disjoncteur s’ouvre : la turbine, encore ouverte, accélère les masses tournantes avec toute sa puissance mécanique ${v('P<sub>m</sub>')}. Au bout de combien de temps la vitesse atteint-elle 110 % de la vitesse nominale ?`, f: (D) => [{ l: 'Durée', u: 's', a: D.td }],
          c: (D) => `Théorème de l’énergie cinétique : ${v('P<sub>m</sub>')}·${v('t')} = ½·${v('J')}·(1,1² − 1)·${v('ω<sub>0</sub>')}², d’où ${v('t')} = ${v('J')}·${v('ω<sub>0</sub>')}²·0,21/(2·${v('P<sub>m</sub>')}) = <b>${F(D.td)} s</b>. C’est l’ordre de grandeur qui fixe la rapidité de fermeture du distributeur et le réglage des protections de survitesse.` },
        { t: 'Étiage', q: () => `En été, le débit baisse de 20 % ; la chute nette gagne 0,5 m et le rendement de la turbine perd 3 points grâce à ses pales orientables. Nouvelle puissance électrique.`, f: (D) => [{ l: 'Pe en étiage', u: 'MW', a: D.Pe2 / 1e6 }],
          c: (D) => `${v('P<sub>e</sub>')}′ = ${nf(D.ea)} × ${nf(D.et - 0.03)} × 1 000 × 9,81 × ${F(0.8 * D.Q)} × ${nf(D.H + 0.5)} = <b>${F(D.Pe2 / 1e6)} MW</b>, soit ${F(100 * (D.Pe2 / D.Pe - 1))} % : la Kaplan garde un bon rendement quand le débit varie, d’où son choix au fil de l’eau.` }
      ] },
    { id: 'borne', titre: 'Borne de recharge rapide', sys: 'Système de l’externe 2025, épreuve 3', min: 40, c: '#6a4c93',
      data: (r) => { const D = { Eb: pk(r, [52, 64, 77, 82]), Ub: pk(r, [355, 370, 400]), Pb: pk(r, [50, 100, 150]), s0: pk(r, [10, 20, 30]), eta: pk(r, [0.94, 0.95, 0.96]), l: pk(r, [4, 5, 6]), Sc: pk(r, [50, 70, 95]), fd: pk(r, [20, 30, 50]), Udc: 750, prix: 0.2 };
        D.E = D.Eb * (80 - D.s0) / 100; D.t = D.E / D.Pb * 60; D.Ib = D.Pb * 1e3 / D.Ub; D.Pr = D.Pb / D.eta; D.Il = D.Pr * 1e3 / (Math.sqrt(3) * 400 * 0.99);
        D.R = 1.72e-8 * 2 * D.l / (D.Sc * 1e-6); D.PJ = D.R * D.Ib * D.Ib; D.al = D.Ub / D.Udc; D.L = D.Udc * D.al * (1 - D.al) / (D.fd * 1e3 * 0.1 * D.Ib); D.Er = D.E / D.eta; D.cout = D.Er * D.prix; return D; },
      intro: (D) => `<p>Une borne rapide convertit le réseau triphasé 400 V en courant continu : un redresseur à absorption sinusoïdale (facteur de puissance 0,99) fixe un bus continu de 750 V, puis un hacheur série règle le courant de charge de la batterie du véhicule.</p>${tab([['Capacité utile de la batterie', `${D.Eb} kWh`], ['Tension nominale de la batterie', `${D.Ub} V`], ['État de charge à l’arrivée', `${D.s0} %`], ['Charge jusqu’à', '80 %'], ['Puissance de sortie de la borne', `${D.Pb} kW`], ['Rendement de la borne', nf(D.eta)], ['Câble de sortie (cuivre, ρ = 1,72 × 10⁻⁸ Ω·m)', `${D.l} m, ${D.Sc} mm²`], ['Fréquence de découpage du hacheur', `${D.fd} kHz`], ['Prix de l’énergie pour l’exploitant', '0,20 €/kWh']])}`,
      q: [
        { t: 'Énergie et durée', q: () => `Énergie à stocker pour atteindre 80 % et durée de la recharge à puissance constante.`, f: (D) => [{ l: 'Énergie', u: 'kWh', a: D.E }, { l: 'Durée', u: 'min', a: D.t }],
          c: (D) => `${v('E')} = ${D.Eb} × (0,80 − ${nf(D.s0 / 100)}) = <b>${F(D.E)} kWh</b> ; ${v('t')} = ${v('E')}/${v('P')} = ${F(D.E)}/${D.Pb} h = <b>${F(D.t)} min</b>. Au-delà de 80 %, le courant est réduit : c’est pourquoi les bornes s’arrêtent là.`, r: (D) => `${v('E')} = ${F(D.E)} kWh` },
        { t: 'Courant dans la batterie', q: () => `Courant de charge à la tension nominale de la batterie.`, f: (D) => [{ l: 'Courant', u: 'A', a: D.Ib }],
          c: (D) => `${v('I')} = ${v('P')}/${v('U')} = ${D.Pb * 1e3}/${D.Ub} = <b>${F(D.Ib)} A</b>.`, r: (D) => `${v('I<sub>b</sub>')} = ${F(D.Ib)} A` },
        { t: 'Côté réseau', q: () => `Puissance prélevée sur le réseau et courant de ligne.`, f: (D) => [{ l: 'Puissance réseau', u: 'kW', a: D.Pr }, { l: 'Courant de ligne', u: 'A', a: D.Il }],
          c: (D) => `${v('P<sub>r</sub>')} = ${D.Pb}/${nf(D.eta)} = <b>${F(D.Pr)} kW</b> ; ${v('I')} = ${v('P<sub>r</sub>')}/(√3 × 400 × 0,99) = <b>${F(D.Il)} A</b>.` },
        { t: 'Le câble de sortie', q: () => `Résistance du câble (aller et retour), pertes Joule à pleine puissance et part de la puissance de sortie.`, f: (D) => [{ l: 'Résistance', u: 'mΩ', a: D.R * 1e3 }, { l: 'Pertes', u: 'W', a: D.PJ }, { l: 'Part', u: '%', a: 100 * D.PJ / (D.Pb * 1e3), abs: 0.01 }],
          c: (D) => `${v('R')} = ${v('ρ')}·2${v('ℓ')}/${v('S')} = 1,72 × 10⁻⁸ × ${2 * D.l}/(${D.Sc} × 10⁻⁶) = <b>${F(D.R * 1e3)} mΩ</b> ; ${v('P<sub>J</sub>')} = ${v('R')}·${v('I')}² = <b>${F(D.PJ)} W</b>, soit <b>${F(100 * D.PJ / (D.Pb * 1e3))} %</b>. Faible en puissance, mais ces watts chauffent un câble manipulé à la main : au-delà de 200 A, les câbles sont refroidis.` },
        { t: 'Le hacheur série', q: () => `Rapport cyclique du hacheur alimenté par le bus de 750 V, puis inductance minimale pour une ondulation crête à crête du courant inférieure à 10 % du courant de charge.`, f: (D) => [{ l: 'Rapport cyclique', u: '', a: D.al }, { l: 'Inductance', u: 'µH', a: D.L * 1e6 }],
          c: (D) => `${v('α')} = ${v('U<sub>b</sub>')}/${v('U<sub>dc</sub>')} = ${D.Ub}/750 = <b>${F(D.al)}</b> ; Δ${v('i')} = ${v('U<sub>dc</sub>')}·${v('α')}·(1 − ${v('α')})/(${v('L')}·${v('f')}) ≤ 0,1·${v('I<sub>b</sub>')} ⇒ ${v('L')} ≥ 750 × ${F(D.al)} × ${F(1 - D.al)}/(${D.fd} × 10³ × ${F(0.1 * D.Ib)}) = <b>${F(D.L * 1e6)} µH</b>. L’ondulation est maximale pour ${v('α')} = 0,5, tout près d’ici.` },
        { t: 'Ce que paie l’exploitant', q: () => `Énergie prélevée sur le réseau pour cette recharge et son coût.`, f: (D) => [{ l: 'Énergie réseau', u: 'kWh', a: D.Er }, { l: 'Coût', u: '€', a: D.cout }],
          c: (D) => `${v('E<sub>r</sub>')} = ${F(D.E)}/${nf(D.eta)} = <b>${F(D.Er)} kWh</b> ; coût ${F(D.Er)} × 0,20 = <b>${F(D.cout)} €</b>.` }
      ] },
    { id: 'metha', titre: 'Unité de méthanisation', sys: 'Système de l’interne 2025, épreuve 1', min: 45, c: '#7a5c1e',
      data: (r) => { const D = { D: pk(r, [18, 20, 22, 24]), h: pk(r, [5, 6, 7]), eb: pk(r, [0.15, 0.2]), er: pk(r, [0.06, 0.08, 0.1]), Ts: pk(r, [8, 10]), e1: pk(r, [0.2, 0.23, 0.25]), e2: pk(r, [0.08, 0.1]), Tm: pk(r, [10, 11, 12]), qm: pk(r, [1.5, 1.96, 2.4]), Ti: pk(r, [36, 37.5, 38.5]), Pa: pk(r, [2.2e6, 2.7e6, 3.1e6]) };
        const rc = (Da, Db, l) => Math.log(Db / Da) / (2 * Math.PI * l * D.h);
        D.Sr = Math.PI * D.D * D.D / 4; D.Pr = (40 - D.Ts) * D.Sr / (D.eb / 1.4 + D.er / 0.035);
        D.D2 = D.D + 2 * D.e1; D.D3 = D.D2 + 2 * D.e2; D.Rp = rc(D.D, D.D2, 1.4) + rc(D.D2, D.D3, 0.035); D.Pp = 55 / D.Rp;
        D.Pm = D.qm * 3220 * (40 - D.Ti); D.k = (40 - D.Tm) / 55; D.E = (D.Pr + D.Pp * D.k + D.Pm) * 8760; D.V = D.E / 1e3 / (5.5 * 0.85);
        D.D4 = D.D3 + 0.06; D.Rp2 = D.Rp + rc(D.D3, D.D4, 0.035); D.Pp2 = 55 / D.Rp2; D.dV = (D.Pp - D.Pp2) * D.k * 8760 / 1e3 / (5.5 * 0.85); return D; },
      intro: (D) => `<p>Un digesteur cylindrique est maintenu à 40 °C pour la digestion ; une chaudière brûle une partie du biogaz produit (rendement global 85 %, ${v('PCI')} = 5,5 kWh/Nm³). On néglige les échanges convectifs sur les parois.</p>${tab([['Diamètre intérieur', `${D.D} m`], ['Hauteur des voiles', `${D.h} m`], ['Radier : béton (λ = 1,4 W/(m·K))', `${nf(D.eb * 100)} cm`], ['Radier : isolant (λ = 0,035 W/(m·K))', `${nf(D.er * 100)} cm`], ['Température du sol', `${D.Ts} °C`], ['Voiles : béton (λ = 1,4)', `${nf(D.e1 * 100)} cm`], ['Voiles : isolant (λ = 0,035)', `${nf(D.e2 * 100)} cm`], ['Température extérieure de base', '−15 °C'], ['Température extérieure moyenne sur l’année', `${D.Tm} °C`], ['Matière entrante', `${nf(D.qm)} kg/s à ${nf(D.Ti)} °C, c = 3 220 J/(kg·K)`], ['Production annuelle de biogaz', `${nf(D.Pa)} Nm³`]])}`,
      q: [
        { t: 'Le radier', q: () => `Flux de chaleur perdu vers le sol à travers le radier.`, f: (D) => [{ l: 'Flux radier', u: 'kW', a: D.Pr / 1e3 }],
          c: (D) => `${v('S')} = π·${v('D')}²/4 = ${F(D.Sr)} m² ; ${v('Φ')} = (40 − ${D.Ts})·${v('S')}/(${nf(D.eb)}/1,4 + ${nf(D.er)}/0,035) = <b>${F(D.Pr / 1e3)} kW</b>.`, r: (D) => `${v('Φ<sub>radier</sub>')} = ${F(D.Pr / 1e3)} kW` },
        { t: 'Les voiles', q: () => `Flux perdu par les voiles cylindriques par la température extérieure de base.`, f: (D) => [{ l: 'Flux voiles', u: 'kW', a: D.Pp / 1e3 }],
          c: (D) => `Par couche ${v('r')} = ln(${v('D<sub>ext</sub>')}/${v('D<sub>int</sub>')})/(2π·${v('λ')}·${v('h')}) : diamètres ${D.D} m, ${F(D.D2)} m et ${F(D.D3)} m, résistance totale ${F(D.Rp * 1e3)} × 10⁻³ K/W ; ${v('Φ')} = 55/${v('R')} = <b>${F(D.Pp / 1e3)} kW</b>.`, r: (D) => `${v('Φ<sub>voiles</sub>')} = ${F(D.Pp / 1e3)} kW à −15 °C` },
        { t: 'La matière', q: () => `Flux pour porter la matière entrante à 40 °C.`, f: (D) => [{ l: 'Flux matière', u: 'kW', a: D.Pm / 1e3 }],
          c: (D) => `${v('Φ')} = ${v('q<sub>m</sub>')}·${v('c')}·Δ${v('θ')} = ${nf(D.qm)} × 3 220 × ${nf(40 - D.Ti)} = <b>${F(D.Pm / 1e3)} kW</b>. Une ligne, et pourtant à peine 5 % des candidats l’ont faite en 2025.`, r: (D) => `${v('Φ<sub>matière</sub>')} = ${F(D.Pm / 1e3)} kW` },
        { t: 'Sur une année', q: () => `Énergie de chauffage sur l’année : radier et matière constants, voiles proportionnels à l’écart entre 40 °C et la température extérieure moyenne.`, f: (D) => [{ l: 'Énergie', u: 'MWh', a: D.E / 1e6 }],
          c: (D) => `Voiles en moyenne : ${F(D.Pp / 1e3)} × (40 − ${D.Tm})/55 = ${F(D.Pp * D.k / 1e3)} kW ; ${v('E')} = (${F(D.Pr / 1e3)} + ${F(D.Pp * D.k / 1e3)} + ${F(D.Pm / 1e3)}) kW × 8 760 h = <b>${F(D.E / 1e6)} MWh</b>.`, r: (D) => `${v('E')} = ${F(D.E / 1e6)} MWh` },
        { t: 'Le biogaz autoconsommé', q: () => `Volume de biogaz brûlé par la chaudière sur l’année et part de la production.`, f: (D) => [{ l: 'Biogaz', u: 'Nm³', a: D.V }, { l: 'Part', u: '%', a: 100 * D.V / D.Pa, abs: 0.05 }],
          c: (D) => `${v('V')} = ${v('E')}/(${v('PCI')}·${v('η')}) = ${F(D.E / 1e3)} kWh/(5,5 × 0,85) = <b>${F(D.V)} Nm³</b>, soit <b>${F(100 * D.V / D.Pa)} %</b> de la production.` },
        { t: 'Trois centimètres d’isolant', q: () => `On ajoute 3 cm d’isolant (λ = 0,035) sur les voiles. Économie de biogaz sur l’année.`, f: (D) => [{ l: 'Économie', u: 'Nm³/an', a: D.dV }],
          c: (D) => `Nouvelle couche de ${F(D.D3)} à ${F(D.D4)} m : résistance totale ${F(D.Rp2 * 1e3)} × 10⁻³ K/W, ${v('Φ<sub>voiles</sub>')} = ${F(D.Pp2 / 1e3)} kW à −15 °C. Économie : (${F(D.Pp / 1e3)} − ${F(D.Pp2 / 1e3)}) × ${F(D.k)} × 8 760/(5,5 × 0,85) = <b>${F(D.dV)} Nm³/an</b>. L’isolant déjà en place porte presque toute la résistance : chaque centimètre de plus rapporte de moins en moins.` }
      ] },
    { id: 'dirig', titre: 'Dirigeable de transport de charges lourdes', sys: 'Système de l’interne 2025, épreuve 2', min: 40, c: '#3d6b4f',
      data: (r) => { const D = { Vd: pk(r, [240000, 266000, 290000]), ms: pk(r, [100, 110, 120]), mc: pk(r, [50, 60]), mk: pk(r, [8, 10, 12]), Cx: pk(r, [0.03, 0.035, 0.04]), vk: pk(r, [90, 100, 110]), etg: pk(r, [0.28, 0.3, 0.32]), k: 0.138 };
        D.Vr = Math.round(0.9 * D.Vd / 1000) * 1000; D.M = (D.ms + D.mc + D.mk) * 1e3; D.mHe = D.k * D.M / (1 - D.k); D.VHe = D.M / ((1 - D.k) * 0.909);
        D.S = Math.pow(D.Vd, 2 / 3); D.vs = D.vk / 3.6; D.F = 0.5 * 1.112 * D.Cx * D.S * D.vs * D.vs; D.P = D.F * D.vs; D.ch = 0.8 * 0.97 * 0.95 * 0.97; D.Pe = D.P / D.ch;
        D.Ed = D.mk * 1e3 * 12 * D.etg; D.th = D.Ed * 1e3 / D.Pe; D.dk = D.vk * D.th; return D; },
      intro: (D) => `<p>Un dirigeable rigide gonflé à l’hélium transporte des charges lourdes ; douze propulseurs électriques {onduleur, moteur, réducteur, hélice} sont alimentés par des turbo-générateurs qui brûlent un carburant d’aviation durable.</p>${tab([['Volume d’air déplacé', `${nf(D.Vd)} m³`], ['Volume réservé à l’hélium', `${nf(D.Vr)} m³`], ['Structure, charge utile, carburant', `${D.ms} t, ${D.mc} t, ${D.mk} t`], ['Masse volumique de l’hélium', '0,138 × celle de l’air'], ['Air à 1 000 m ; à 3 000 m', '1,112 kg/m³ ; 0,909 kg/m³'], ['Coefficient de traînée', `${nf(D.Cx)} (surface de référence V<sup>2/3</sup>)`], ['Vitesse par rapport à l’air', `${D.vk} km/h`], ['Rendements : hélice, réducteur, moteur, onduleur', '0,80 ; 0,97 ; 0,95 ; 0,97'], ['Carburant : PCI ; rendement des turbo-générateurs', `12 kWh/kg ; ${nf(D.etg)}`]])}`,
      q: [
        { t: 'La masse d’hélium', q: () => `Le poids apparent est nul : la poussée d’Archimède compense le poids total (structure, charge, carburant, hélium et air embarqué, ce dernier occupant le reste du volume). Masse d’hélium nécessaire.`, f: (D) => [{ l: 'Masse d’hélium', u: 't', a: D.mHe / 1e3, tol: 0.01 }],
          c: (D) => `${v('ρ<sub>air</sub>')}·${v('V<sub>d</sub>')} = ${v('M')} + ${v('k')}·${v('ρ<sub>air</sub>')}·${v('V<sub>He</sub>')} + ${v('ρ<sub>air</sub>')}·(${v('V<sub>d</sub>')} − ${v('V<sub>He</sub>')}) ⇒ ${v('V<sub>He</sub>')} = ${v('M')}/((1 − ${v('k')})·${v('ρ<sub>air</sub>')}) et ${v('m<sub>He</sub>')} = ${v('k')}·${v('M')}/(1 − ${v('k')}) = 0,138 × ${F(D.M / 1e3)}/0,862 = <b>${F(D.mHe / 1e3)} t</b>, quelle que soit l’altitude.`, r: (D) => `${v('m<sub>He</sub>')} = ${F(D.mHe / 1e3)} t` },
        { t: 'À 3 000 m', q: () => `Volume occupé par l’hélium à 3 000 m et part du volume réservé.`, f: (D) => [{ l: 'Volume', u: 'm³', a: D.VHe, tol: 0.01 }, { l: 'Part', u: '%', a: 100 * D.VHe / D.Vr, abs: 0.5 }],
          c: (D) => `${v('V<sub>He</sub>')} = ${F(D.M)}/(0,862 × 0,909) = <b>${F(D.VHe)} m³</b>, soit <b>${F(100 * D.VHe / D.Vr)} %</b> des ${nf(D.Vr)} m³ : ${D.VHe <= D.Vr ? 'les cellules suffisent.' : 'les cellules ne suffisent pas : il faudrait réduire la charge ou l’altitude.'}` },
        { t: 'La traînée', q: () => `Surface de référence et traînée à 1 000 m, à la vitesse de croisière.`, f: (D) => [{ l: 'Surface', u: 'm²', a: D.S }, { l: 'Traînée', u: 'kN', a: D.F / 1e3 }],
          c: (D) => `${v('S')} = ${v('V<sub>d</sub>')}<sup>2/3</sup> = <b>${F(D.S)} m²</b> ; ${v('v')} = ${D.vk}/3,6 = ${F(D.vs)} m/s ; ${v('F')} = ½ × 1,112 × ${nf(D.Cx)} × ${F(D.S)} × ${F(D.vs)}² = <b>${F(D.F / 1e3)} kN</b>.`, r: (D) => `${v('F')} = ${F(D.F / 1e3)} kN` },
        { t: 'La propulsion', q: () => `Puissance propulsive, puis puissance électrique absorbée par chacun des douze propulseurs.`, f: (D) => [{ l: 'Puissance propulsive', u: 'MW', a: D.P / 1e6 }, { l: 'Par propulseur', u: 'kW', a: D.Pe / 12e3 }],
          c: (D) => `${v('P')} = ${v('F')}·${v('v')} = <b>${F(D.P / 1e6)} MW</b> ; rendement de la chaîne 0,80 × 0,97 × 0,95 × 0,97 = ${F(D.ch)} ; puissance électrique ${F(D.Pe / 1e6)} MW, soit <b>${F(D.Pe / 12e3)} kW</b> par propulseur.`, r: (D) => `${v('P<sub>élec</sub>')} = ${F(D.Pe / 1e6)} MW` },
        { t: 'L’autonomie', q: () => `Énergie électrique tirée du carburant embarqué, durée de vol et distance parcourue à vitesse constante (air calme, autres consommations négligées).`, f: (D) => [{ l: 'Durée', u: 'h', a: D.th }, { l: 'Distance', u: 'km', a: D.dk }],
          c: (D) => `${v('E')} = ${D.mk * 1e3} kg × 12 kWh/kg × ${nf(D.etg)} = ${F(D.Ed / 1e3)} MWh ; ${v('t')} = ${v('E')}/${v('P<sub>élec</sub>')} = <b>${F(D.th)} h</b> ; ${v('d')} = ${D.vk} × ${F(D.th)} = <b>${F(D.dk)} km</b>. ${D.dk >= 1000 ? 'Au-delà des 1 000 km annoncés : la marge couvre le vent, la stabilisation et les auxiliaires.' : 'En deçà des 1 000 km annoncés : il faudrait plus de carburant ou une vitesse plus faible (la puissance varie comme v³).'}` }
      ] }
  ];

  /* ---------- lecture des réponses ---------- */
  const nombre = (s) => { const t = String(s || '').trim().replace(/\s| | /g, '').replace(/−/g, '-').replace(',', '.').replace(/[×x]10\^?/i, 'e').replace(/\*10\^?/, 'e'); if (!t) return null; const x = parseFloat(t); return isFinite(x) ? x : null; };
  const juste = (f, x) => x != null && Math.abs(x - f.a) <= Math.max((f.tol == null ? 0.02 : f.tol) * Math.abs(f.a), f.abs || 0) + 1e-12;

  function css() {
    if ($('#et-css')) return;
    const s = document.createElement('style'); s.id = 'et-css';
    s.textContent = `.et-f{display:flex;flex-wrap:wrap;gap:8px 14px;margin:8px 0}.et-f label{display:flex;gap:6px;align-items:center;font-size:14px}.et-f input{font:inherit;width:120px;padding:6px 8px;border:1px solid #bbccd8;border-radius:6px;background:#fff;color:inherit}.et-f input.ok{border-color:#2f9e6e;background:#eef8f2}.et-f input.ko{border-color:#c9483b;background:#fdf0ee}.et-f small{color:#42596b}.et-ret{background:#eef3f6;border-radius:8px;padding:6px 12px;margin-top:6px;font-size:14px}.et-c{margin-top:6px}`;
    document.head.appendChild(s);
  }
  const dernier = (id) => S().et.filter((x) => x.id === id).slice(-1)[0];
  function carte() {
    const n = S().et.length;
    return `<div class="ec-ep" style="--c:#1f6f8b"><div class="eyebrow">Systèmes des sujets 2025</div><h3>Études de systèmes récents</h3><p class="muted">Quatre études enchaînées, refaites avec des valeurs tirées au hasard : centrale hydroélectrique, borne de recharge rapide, méthanisation, dirigeable. Chaque réponse se vérifie et donne la valeur à retenir pour la suite.${n ? ` ${n} étude${n > 1 ? 's' : ''} terminée${n > 1 ? 's' : ''}.` : ''}</p><div class="btns"><a class="b" href="#ecrits-etudes">Choisir une étude</a></div></div>`;
  }
  function accueil() {
    css();
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · études de systèmes</div><h1>Études de systèmes récents</h1><p class="muted">Les sujets enchaînent des calculs sur un même système : une erreur au début coûte toute la suite, d’où les valeurs « à retenir » que donnent les énoncés. Ces quatre études reprennent les systèmes des sujets 2025 avec des données tirées au hasard : un nouveau tirage, de nouvelles valeurs.</p><div class="ec-grid">`;
    ETUDES.forEach((X) => {
      const d = dernier(X.id);
      h += `<div class="ec-ep" style="--c:${X.c}"><div class="eyebrow">${E(X.sys)} · ${X.min} min</div><h3>${E(X.titre)}</h3><p class="muted">${X.q.length} questions, ${X.q.reduce((a, q) => a + q.f(X.data(alea(1))).length, 0)} résultats à trouver.${d ? ` Dernière : ${nf(20 * d.pts / d.tot, 1)}/20.` : ''}</p><div class="btns"><a class="b" href="#ecrits-etudes-${X.id}-${1 + Math.floor(Math.random() * 99999)}">Commencer</a></div></div>`;
    });
    h += '</div>';
    const L = S().et.slice(-8).reverse();
    if (L.length) h += `<h2 class="sec">Mes dernières études</h2><div class="ec-sc"><table class="ec-tab"><tr><th>Date</th><th>Étude</th><th>Résultats justes</th><th>Note</th></tr>${L.map((x) => { const X = ETUDES.find((y) => y.id === x.id); return `<tr><td>${new Date(x.t).toLocaleDateString('fr-FR')}</td><td>${E(X ? X.titre : x.id)}</td><td class="n">${x.pts} / ${x.tot}</td><td class="n">${nf(20 * x.pts / x.tot, 1)} / 20</td></tr>`; }).join('')}</table></div>`;
    app().innerHTML = h;
  }
  function etude(id, graine) {
    css();
    const X = ETUDES.find((x) => x.id === id); if (!X) return accueil();
    const g = Math.max(1, Math.abs(Math.floor(+graine || 1))), D = X.data(alea(g));
    const enc = lire(CLE), etat = enc && enc.id === id && enc.g === g ? enc : { id, g, rep: {}, vu: {}, fini: 0 };
    const sauver = () => ecrire(CLE, etat);
    const total = X.q.reduce((a, q) => a + q.f(D).length, 0);
    let h = `<a class="back" href="#ecrits-etudes">← Études de systèmes</a><div class="eyebrow">${E(X.sys)} · ${X.min} min · tirage ${g}</div><h1>${E(X.titre)}</h1><div class="card">${X.intro(D)}</div>
      <p class="muted">Réponds dans l’ordre, avec l’unité demandée ; une virgule ou un point pour les décimales. Tolérance : 2 % sauf mention. Chaque vérification est définitive : comme sur la copie, le premier essai compte.</p>`;
    X.q.forEach((q, i) => {
      h += `<div class="ec-q" id="et-q${i}"><h4><span>${i + 1}. ${E(q.t)}</span></h4><p>${q.q(D)}</p><div class="et-f">${q.f(D).map((f, j) => `<label>${E(f.l)} <input data-k="${i}-${j}" inputmode="decimal" autocomplete="off" value="${E(etat.rep[`${i}-${j}`] || '')}"> <small>${E(f.u)}</small></label>`).join('')}<button class="b sec" data-v="${i}">Vérifier</button></div><div class="et-c" id="et-c${i}"></div></div>`;
    });
    h += `<div id="et-fin"></div><div class="btns" style="margin-top:14px"><a class="b sec" href="#ecrits-etudes-${id}-${g + 1}">Nouveau tirage</a></div>`;
    app().innerHTML = h;
    function montrer(i) {
      const q = X.q[i], fs = q.f(D), bloc = $('#et-q' + i);
      let bon = 0;
      fs.forEach((f, j) => {
        const inp = bloc.querySelector(`[data-k="${i}-${j}"]`), x = nombre(inp.value), ok = juste(f, x);
        if (ok) bon++;
        inp.classList.add(ok ? 'ok' : 'ko'); inp.disabled = true;
        if (!ok) inp.insertAdjacentHTML('afterend', ` <small>attendu ${F(f.a)}</small>`);
      });
      bloc.querySelector('[data-v]').remove();
      bloc.classList.add(bon === fs.length ? 'ok' : bon ? 'mi' : 'ko');
      bloc.querySelector('h4').insertAdjacentHTML('beforeend', `<small>${bon} / ${fs.length}</small>`);
      $('#et-c' + i).innerHTML = `<div class="modele">${q.c(D)}</div>${q.r ? `<div class="et-ret">Pour la suite, on retient : ${q.r(D)}.</div>` : ''}`;
      return bon;
    }
    function bilan() {
      let pts = 0;
      X.q.forEach((q, i) => { const fs = q.f(D); fs.forEach((f, j) => { if (juste(f, nombre(etat.rep[`${i}-${j}`]))) pts++; }); });
      if (!etat.fini) { etat.fini = Date.now(); sauver(); S().et.push({ t: etat.fini, id, g, pts, tot: total }); if (S().et.length > 200) S().et.splice(0, S().et.length - 200); save(); }
      $('#et-fin').innerHTML = `<div class="card"><h2 style="margin-top:0">${pts} / ${total} résultats justes · ${nf(20 * pts / total, 1)} / 20</h2><p class="muted">${pts === total ? 'Sans faute. Un nouveau tirage pour confirmer, puis une étude d’un autre système.' : 'Reprends les questions ratées avec la correction, puis un nouveau tirage : les mêmes calculs reviennent avec d’autres valeurs.'}</p></div>`;
    }
    X.q.forEach((q, i) => { if (etat.vu[i]) montrer(i); });
    if (etat.fini || X.q.every((q, i) => etat.vu[i])) bilan();
    app().oninput = (e) => { const k = e.target.dataset && e.target.dataset.k; if (k == null) return; etat.rep[k] = e.target.value.slice(0, 40); sauver(); };
    app().onclick = (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      const i = +b.dataset.v;
      app().querySelectorAll(`[data-k^="${i}-"]`).forEach((inp) => { etat.rep[inp.dataset.k] = inp.value.slice(0, 40); });
      etat.vu[i] = 1; sauver(); montrer(i);
      if (X.q.every((q, j) => etat.vu[j])) bilan();
      else { const n = $('#et-q' + (i + 1)); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };
  }
  function route(h) {
    const m = h.match(/^ecrits-etudes-([a-z]+)-(\d+)$/);
    return m ? etude(m[1], m[2]) : accueil();
  }
  window.ECRITS_ETUDES = { route, carte, ETUDES, alea };
})();
