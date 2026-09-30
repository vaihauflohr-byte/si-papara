/* ===================== Terminale SI — Séquence 8 : Énergie et conversion =====================
   Cours du professeur : 8.1 Les énergies (synthèse énergie, sources d'alimentation, puissances en sinusoïdal),
   8.2 Énergétique (apports de connaissances), 8.3 MCC / MAS (apports + fiche synthèse machines). */
(function () {
  const nb = (x, s) => SIP.nb(x, s);
  const R2 = Math.SQRT2, R3 = Math.sqrt(3), PI = Math.PI, g = 9.81;
  const omega = (N) => 2 * PI * N / 60;          // tr/min → rad/s
  const trmin = (w) => 60 * w / (2 * PI);        // rad/s → tr/min
  const cosd = (a) => Math.cos(a * PI / 180);
  const tanAcos = (c) => Math.sqrt(1 - c * c) / c; // tan φ à partir de cos φ
  const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // =====================================================================
  // Module 1 — Sources et grandeurs électriques (8.1)
  // =====================================================================
  SIP.definirModule({
    id: "tsi-s8-sources",
    niveaux: ["TSI"],
    sequence: "S8 · Énergie et conversion",
    titre: "Sources et grandeurs électriques",
    description: "Énergie et sources, batteries (Ah, Wh, autonomie, série/parallèle), signal sinusoïdal, puissances P, Q, S et réseau triphasé.",
    competences: ["A2", "M2", "M3", "M11"],
    nbQuestions: 10,
    questions: [
      // ---------- Énergie, puissance, sources ----------
      { fiche: "tsi-s8-src-energie", gen: (r) => { const P = r.pick([60, 100, 500, 750, 1000, 1500, 2000]), h = r.pick([0.5, 1, 2, 3, 4, 6, 8]), j = r.pick([1, 7, 30]); const Wh = P * h * j;
          return { enonce: `Un appareil de <b>${nb(P)} W</b> fonctionne <b>${nb(h)} h par jour</b> pendant <b>${j} jour${j > 1 ? "s" : ""}</b>. Énergie consommée en kWh ?`, reponse: Wh / 1000, unite: "kWh", explication: `E = P × t = ${nb(P)} W × ${nb(h * j)} h = ${nb(Wh)} Wh = ${nb(Wh / 1000)} kWh.` }; } },
      { fiche: "tsi-s8-src-energie", gen: (r) => { const W = r.pick([5, 10, 12, 15, 18, 20, 40, 60, 100]);
          return { enonce: `Une batterie stocke <b>${W} Wh</b>. Exprime cette énergie en <b>kJ</b>.`, reponse: W * 3.6, unite: "kJ", explication: `1 Wh = 3 600 J, donc E = ${W} × 3 600 = ${nb(W * 3600)} J = ${nb(W * 3.6)} kJ.` }; } },
      { fiche: "tsi-s8-src-energie", gen: (r) => { const E = r.pas(1000, 6000, 500), P = r.pick([250, 400, 500, 800, 1000]);
          return { enonce: `Une STEP (station de transfert d'énergie par pompage) a stocké <b>${nb(E)} MWh</b>. Ses turbines délivrent <b>${nb(P)} MW</b>. Combien d'heures peut-elle produire à pleine puissance ?`, reponse: E / P, unite: "h", explication: `E = P × t ⇒ t = E / P = ${nb(E)} / ${nb(P)} = ${nb(E / P)} h.` }; } },
      { fiche: "tsi-s8-src-energie", gen: (r) => { const P = r.pick([0.5, 1, 1.5, 2, 3]), E = r.pick([0.25, 0.5, 1, 1.5, 2, 3]);
          return { enonce: `Un chauffe-eau de <b>${nb(P)} kW</b> doit fournir <b>${nb(E)} kWh</b>. Durée de chauffe en <b>minutes</b> ?`, reponse: E / P * 60, unite: "min", explication: `t = E / P = ${nb(E)} / ${nb(P)} = ${nb(E / P)} h = ${nb(E / P * 60)} min.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-energie", enonce: "Laquelle de ces énergies est une énergie <b>finale</b> ?", choix: ["L'électricité disponible à la prise", "Le vent qui souffle sur une éolienne", "Le pétrole brut dans son gisement", "Le rayonnement solaire"], bonne: 0, explication: "L'énergie finale est délivrée prête à l'emploi (électricité à la prise, litre d'essence). Les trois autres sont des énergies primaires, disponibles dans la nature avant toute transformation." },
      { fiche: "tsi-s8-src-energie", gen: (r) => { const ren = ["Le soleil", "Le vent", "L'eau d'un barrage", "La biomasse (bois)", "La géothermie", "Les marées"], non = ["Le pétrole", "Le charbon", "Le gaz naturel", "L'uranium"]; const cherche = r.pick([true, false]); const bon = cherche ? r.pick(non) : r.pick(ren); const autres = r.melange(cherche ? ren : non).slice(0, 3);
          return { type: "qcm", enonce: `Parmi ces sources d'énergie, laquelle est ${cherche ? "<b>non renouvelable</b>" : "<b>renouvelable</b>"} ?`, choix: [bon, ...autres], bonne: 0, explication: cherche ? `${bon} : stock limité, constitué en millions d'années. Soleil, vent, eau, biomasse, géothermie se renouvellent en permanence.` : `${bon} se renouvelle en permanence dans la nature. Pétrole, charbon, gaz et uranium ont des stocks limités.` }; } },
      { fiche: "tsi-s8-src-energie", gen: (r) => { const formes = ["Énergie potentielle de pesanteur", "Énergie cinétique", "Énergie chimique", "Énergie de pression (air comprimé)", "Énergie électrique stockée directement"]; const cas = [["une STEP (eau pompée vers un bassin en altitude)", 0], ["un volant d'inertie", 1], ["un accumulateur (batterie)", 2], ["la production d'hydrogène", 2], ["le stockage CAES (compression de gaz)", 3], ["un supercondensateur", 4]]; const [nom, k] = r.pick(cas); const autres = r.melange(formes.filter((f, i) => i !== k)).slice(0, 3);
          return { type: "qcm", enonce: `Stockage de l'électricité : avec <b>${nom}</b>, l'énergie est conservée sous forme…`, choix: [formes[k], ...autres], bonne: 0, explication: `Cours : STEP → potentielle ; volant d'inertie → cinétique ; accumulateurs et hydrogène → chimique ; CAES → air comprimé ; supercondensateurs → stockage direct. Ici : ${formes[k].toLowerCase()}.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-energie", enonce: "Lors d'une conversion d'énergie, la part non souhaitée (les « pertes ») est principalement…", choix: ["De l'énergie thermique (chaleur)", "De l'énergie nucléaire", "De l'énergie chimique", "De l'énergie potentielle"], bonne: 0, explication: "L'énergie ne disparaît pas : la part qui n'est pas convertie en énergie utile part surtout en chaleur (frottements, effet Joule…)." },
      { type: "qcm", fiche: "tsi-s8-src-energie", enonce: "D'après le tableau du cours, la plus grande part de l'électricité produite en France provient…", choix: ["Du nucléaire (≈ 76 %)", "Du charbon", "Du gaz naturel", "De l'hydraulique"], bonne: 0, explication: "France : nucléaire 76,1 %, hydraulique 10,5 %, gaz 3,9 %, charbon 3,9 %. Au niveau mondial, c'est le charbon qui domine (40 %)." },
      { type: "qcm", fiche: "tsi-s8-src-energie", enonce: "Dans la chaîne de puissance, la fonction <b>Alimenter</b>…", choix: ["Fournit l'énergie nécessaire (réseau, batterie, énergie pneumatique…)", "Convertit l'énergie électrique en énergie mécanique", "Transmet le mouvement jusqu'à l'effecteur", "Module l'énergie selon les ordres reçus"], bonne: 0, explication: "Chaîne de puissance : Alimenter → Distribuer (moduler) → Convertir → Transmettre → Agir. Alimenter = fournir l'énergie d'entrée." },

      // ---------- Sources continues et batteries ----------
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const Q = r.pick([2, 2.5, 5, 7, 12, 20, 40, 60]), I = r.pick([0.5, 0.8, 1, 1.5, 2, 2.5, 4]);
          return { enonce: `Une batterie de capacité <b>${nb(Q)} Ah</b> alimente un récepteur qui consomme <b>${nb(I)} A</b>. Autonomie théorique (en h) ?`, reponse: Q / I, unite: "h", explication: `Q = I × t ⇒ t = Q / I = ${nb(Q)} / ${nb(I)} = ${nb(Q / I)} h.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const C = r.pick([800, 1000, 1500, 2000, 2200, 3000, 4000]), I = r.pick([250, 400, 500, 800, 1200, 1500]); const t = C / I * 60;
          return { enonce: `Pack d'accumulateurs de <b>${nb(C)} mAh</b> ; le robot consomme en moyenne <b>${nb(I)} mA</b>. Autonomie en <b>minutes</b> ?`, reponse: t, unite: "min", explication: `t = Q / I = ${nb(C)} mAh / ${nb(I)} mA = ${nb(C / I)} h = ${nb(C / I)} × 60 = ${nb(t)} min.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const U = r.pick([3.7, 7.4, 11.1, 12, 24, 36, 48]), Q = r.pick([2.5, 5, 7, 10, 12, 20]);
          return { enonce: `Batterie <b>${nb(U)} V – ${nb(Q)} Ah</b>. Énergie stockée (Wh) ?`, reponse: U * Q, unite: "Wh", explication: `W = U × Q = ${nb(U)} × ${nb(Q)} = ${nb(U * Q)} Wh.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const [type, u] = r.pick([["NiMH", 1.2], ["lithium-ion", 3.7], ["plomb", 2]]); const n = r.int(3, type === "NiMH" ? 10 : 6); const U = n * u;
          return { enonce: `Combien d'éléments ${type} de <b>${nb(u)} V</b> faut-il associer <b>en série</b> pour obtenir <b>${nb(U)} V</b> ?`, reponse: n, unite: "éléments", tolerance: 1, explication: `En série, les tensions s'ajoutent : n = ${nb(U)} / ${nb(u)} = ${n}. (Robot Sumo : 5 × 1,2 V = 6 V.)` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const s = r.pick([2, 3, 4, 6]); const p = s === 2 ? 3 : s === 3 ? 2 : r.pick([2, 3]); const u = 3.7, q = r.pick([2, 2.5, 3]);
          return { type: "qcm", enonce: `Pack <b>${s}S${p}P</b> (${s} éléments en série, ${p} branches en parallèle) d'éléments lithium-ion <b>3,7 V – ${nb(q)} Ah</b>. Tension et capacité du pack ?`, choix: [`${nb(s * u)} V – ${nb(p * q)} Ah`, `${nb(p * u)} V – ${nb(s * q)} Ah`, `${nb(s * u)} V – ${nb(q)} Ah`, `${nb(s * p * u)} V – ${nb(s * p * q)} Ah`], bonne: 0, explication: `Série : tensions ajoutées → ${s} × 3,7 = ${nb(s * u)} V. Parallèle : capacités ajoutées → ${p} × ${nb(q)} = ${nb(p * q)} Ah.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const s = r.pick([2, 3, 4, 6, 10]), p = r.pick([1, 2, 3, 4]), q = r.pick([2, 2.5, 3]); const W = s * p * 3.7 * q;
          return { enonce: `Pack de <b>${s} éléments en série</b> × <b>${p} branche${p > 1 ? "s" : ""} en parallèle</b>, éléments lithium-ion <b>3,7 V – ${nb(q)} Ah</b>. Énergie du pack (Wh) ?`, reponse: W, unite: "Wh", explication: `U = ${s} × 3,7 = ${nb(s * 3.7)} V ; Q = ${p} × ${nb(q)} = ${nb(p * q)} Ah ; W = U × Q = ${nb(W)} Wh.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const U = r.pick([24, 36, 48]), Q = r.pick([7.5, 10, 12, 15]), P = r.pick([250, 300, 350, 500]); const W = U * Q, t = W / P * 60;
          return { enonce: `Trottinette électrique : batterie <b>${U} V – ${nb(Q)} Ah</b>, puissance moyenne absorbée <b>${P} W</b>. Autonomie théorique en <b>minutes</b> ?`, reponse: t, unite: "min", explication: `W = U × Q = ${U} × ${nb(Q)} = ${nb(W)} Wh ; t = W / P = ${nb(W)} / ${P} = ${nb(W / P)} h = ${nb(t)} min.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { const Q = r.pick([7, 12, 20, 40, 60, 100]), t = r.pick([4, 5, 8, 10, 20]);
          return { enonce: `Une batterie <b>12 V – ${Q} Ah</b> doit alimenter une alarme pendant <b>${t} h</b>. Courant moyen maximal admissible ?`, reponse: Q / t, unite: "A", explication: `I = Q / t = ${Q} / ${t} = ${nb(Q / t)} A.` }; } },
      { fiche: "tsi-s8-src-batterie", gen: (r) => { if (r.pick([true, false])) { const R = r.pick([0.5, 1, 2, 4.7, 10]), I = r.pick([0.5, 1, 2, 3, 5]); return { enonce: `Une résistance <b>R = ${nb(R)} Ω</b> est parcourue par un courant continu <b>I = ${nb(I)} A</b>. Puissance dissipée par effet Joule ?`, reponse: R * I * I, unite: "W", explication: `P = R·I² = ${nb(R)} × ${nb(I)}² = ${nb(R * I * I)} W.` }; }
          const U = r.pick([12, 24, 48]), R = r.pick([2, 4, 6, 8, 12]); return { enonce: `Une résistance chauffante <b>R = ${R} Ω</b> est alimentée sous <b>${U} V</b> continu. Puissance dissipée ?`, reponse: U * U / R, unite: "W", explication: `P = U² / R = ${U}² / ${R} = ${nb(U * U / R)} W.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-batterie", enonce: "Deux batteries identiques <b>12 V – 60 Ah</b> sont branchées <b>en parallèle</b>. On obtient…", choix: ["12 V – 120 Ah", "24 V – 60 Ah", "24 V – 120 Ah", "12 V – 60 Ah"], bonne: 0, explication: "En parallèle, la tension reste celle d'une batterie et les capacités s'ajoutent. (En série : 24 V – 60 Ah.)" },
      { type: "qcm", fiche: "tsi-s8-src-batterie", enonce: "Que représente l'indication « 60 Ah » d'une batterie ?", choix: ["Sa capacité : la quantité d'électricité qu'elle peut débiter", "L'énergie qu'elle stocke", "Sa puissance maximale", "Sa tension à vide"], bonne: 0, explication: "Q = I × t : 60 Ah = 60 A pendant 1 h ou 1 A pendant 60 h. L'énergie s'obtient en multipliant par la tension : W = U × Q (en Wh)." },
      { type: "qcm", fiche: "tsi-s8-src-batterie", enonce: "Pour obtenir une tension continue à partir du secteur (chargeur de téléphone), on utilise successivement…", choix: ["Un transformateur, un redresseur (pont de diodes) puis un lisseur", "Un redresseur, un transformateur puis un onduleur", "Un onduleur puis un transformateur", "Un lisseur puis un pont de diodes"], bonne: 0, explication: "Le transformateur abaisse la tension alternative (12 V, 5 V…), le pont de diodes la redresse, le lisseur (circuit RC) la rend continue." },

      // ---------- Signal sinusoïdal ----------
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const T = r.pick([0.5, 1, 2, 2.5, 4, 5, 10, 20, 25, 40]);
          return { enonce: `Sur l'oscilloscope, la période d'une tension vaut <b>T = ${nb(T)} ms</b>. Fréquence ?`, reponse: 1000 / T, unite: "Hz", explication: `f = 1 / T = 1 / (${nb(T)} × 10<sup>−3</sup> s) = ${nb(1000 / T)} Hz.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const f = r.pick([50, 60, 100, 400, 1000]);
          return { enonce: `Une tension sinusoïdale a pour fréquence <b>f = ${f} Hz</b>. Pulsation ω ?`, reponse: 2 * PI * f, unite: "rad/s", explication: `ω = 2π·f = 2π × ${f} = ${nb(2 * PI * f)} rad/s.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const f = r.pick([50, 60, 100, 200, 500]), Um = r.pick([12, 24, 170, 325, 565]); const w = Math.round(2 * PI * f); const fr = w / (2 * PI);
          if (r.pick([true, false])) return { enonce: `u(t) = ${Um}·cos(${w}·t). Fréquence du signal ?`, reponse: fr, unite: "Hz", explication: `La pulsation est ω = ${w} rad/s ; f = ω / 2π = ${w} / 2π = ${nb(fr)} Hz.` };
          return { enonce: `u(t) = ${Um}·cos(${w}·t). Période du signal (en ms) ?`, reponse: 1000 / fr, unite: "ms", explication: `ω = ${w} rad/s ⇒ f = ω / 2π = ${nb(fr)} Hz ; T = 1 / f = ${nb(1000 / fr)} ms.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const Um = r.pick([5, 10, 12, 15, 24, 100, 170, 311, 325, 400]);
          return { enonce: `Une tension sinusoïdale a une amplitude <b>U<sub>max</sub> = ${Um} V</b>. Valeur efficace ?`, reponse: Um / R2, unite: "V", explication: `U<sub>eff</sub> = U<sub>max</sub> / √2 = ${Um} / √2 = ${nb(Um / R2)} V.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const U = r.pick([12, 24, 48, 110, 127, 230, 400]);
          return { enonce: `Un voltmètre (mode AC) affiche <b>${U} V</b> pour une tension sinusoïdale. Valeur maximale U<sub>max</sub> ?`, reponse: U * R2, unite: "V", explication: `Le voltmètre AC mesure la valeur efficace : U<sub>max</sub> = U<sub>eff</sub> × √2 = ${U} × √2 = ${nb(U * R2)} V.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const T = r.pick([20, 10, 40]); const dt = r.pas(T / 40, 0.45 * T, T / 40); const enDeg = r.pick([true, false]); const phi = enDeg ? dt * 360 / T : dt * 2 * PI / T;
          return { enonce: `Deux signaux de période <b>T = ${T} ms</b> sont décalés de <b>Δt = ${nb(dt)} ms</b>. Déphasage en <b>${enDeg ? "degrés" : "radians"}</b> ?`, reponse: phi, unite: enDeg ? "°" : "rad", explication: enDeg ? `φ = Δt × 360 / T = ${nb(dt)} × 360 / ${T} = ${nb(phi)}°.` : `φ = Δt × 2π / T = ${nb(dt)} × 2π / ${T} = ${nb(phi)} rad.` }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const a = r.int(1, 5), b = r.int(1, 4), t1 = r.int(1, 3), t2 = 4 - t1; const m = (a * t1 - b * t2) / 4;
          return Object.assign({ enonce: `Un signal rectangulaire vaut <b>+${a} V pendant ${t1} ms</b> puis <b>−${b} V pendant ${t2} ms</b> (période T = 4 ms). Valeur moyenne U<sub>moy</sub> ?`, reponse: m, unite: "V", explication: `U<sub>moy</sub> = aire algébrique / T = (${a} × ${t1} − ${b} × ${t2}) / 4 = ${nb(a * t1 - b * t2)} / 4 = ${nb(m)} V.` }, m === 0 ? { absolu: 0.01 } : {}); } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const d = r.int(0, 2); const noms = ["une résistance R", "une inductance (bobine) L", "un condensateur C"];
          return { type: "qcm", enonce: `En régime sinusoïdal, pour ${noms[d]}, le courant i(t) est…`, choix: ["En phase avec la tension", "En retard de 90° sur la tension", "En avance de 90° sur la tension", "En opposition de phase (180°) avec la tension"], bonne: d, explication: "Résistance : u et i en phase. Inductance : i en retard de 90° (π/2) sur u. Condensateur : i en avance de 90° (π/2) sur u." }; } },
      { fiche: "tsi-s8-src-sinus", gen: (r) => { const w = 2 * PI * 50;
          if (r.pick([true, false])) { const L = r.pick([0.1, 0.2, 0.5, 1]), U = r.pick([127, 230]); const I = U / (L * w); return { enonce: `Une inductance <b>L = ${nb(L)} H</b> est alimentée sous <b>${U} V – 50 Hz</b>. Valeur efficace du courant ?`, reponse: I, unite: "A", explication: `U = L·ω·I ⇒ I = U / (L·ω) = ${U} / (${nb(L)} × ${nb(w)}) = ${nb(I)} A (ω = 2π × 50 = ${nb(w)} rad/s).` }; }
          const C = r.pick([2.2, 4.7, 10, 22]), U = 230; const I = U * C * 1e-6 * w; return { enonce: `Un condensateur <b>C = ${nb(C)} µF</b> est alimenté sous <b>230 V – 50 Hz</b>. Valeur efficace du courant ?`, reponse: I, unite: "A", explication: `U = I / (C·ω) ⇒ I = U·C·ω = 230 × ${nb(C)}×10<sup>−6</sup> × ${nb(w)} = ${nb(I)} A.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-sinus", enonce: "Sur une prise de courant, l'indication « 230 V » désigne…", choix: ["La valeur efficace de la tension", "La valeur maximale de la tension", "La valeur moyenne de la tension", "La valeur crête à crête de la tension"], bonne: 0, explication: "C'est la valeur efficace (celle d'une tension continue qui produirait le même effet). U<sub>max</sub> = 230 × √2 ≈ 325 V." },
      { type: "qcm", fiche: "tsi-s8-src-sinus", enonce: "Valeur moyenne de la tension sinusoïdale du secteur (230 V ; 50 Hz) ?", choix: ["0 V", "230 V", "325 V", "163 V"], bonne: 0, explication: "Sur une période, les aires positive et négative se compensent : U<sub>moy</sub> = 0. C'est pour cela qu'on caractérise ce signal par sa valeur efficace." },

      // ---------- Puissances P, Q, S ----------
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const I = r.pas(2, 16, 0.5), c = r.pick([0.7, 0.75, 0.8, 0.85, 0.9, 1]); const P = 230 * I * c;
          return { enonce: `Un récepteur monophasé sous <b>230 V</b> absorbe <b>I = ${nb(I)} A</b> avec <b>cos φ = ${nb(c)}</b>. Puissance active ?`, reponse: P, unite: "W", explication: `P = U·I·cos φ = 230 × ${nb(I)} × ${nb(c)} = ${nb(P)} W.` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const I = r.pas(2, 12, 0.5), c = r.pick([0.6, 0.7, 0.75, 0.8, 0.85]); const s = Math.sqrt(1 - c * c), Q = 230 * I * s;
          return { enonce: `Moteur monophasé : <b>230 V ; ${nb(I)} A ; cos φ = ${nb(c)}</b>. Puissance réactive Q ?`, reponse: Q, unite: "var", explication: `sin φ = √(1 − cos²φ) = √(1 − ${nb(c)}²) = ${nb(s, 3)} ; Q = U·I·sin φ = 230 × ${nb(I)} × ${nb(s, 3)} = ${nb(Q)} var (positive : récepteur inductif).` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const P = r.pas(500, 4000, 100), Q = r.pas(200, 3000, 100); const S = Math.hypot(P, Q);
          return { enonce: `Une installation consomme <b>P = ${nb(P)} W</b> et <b>Q = ${nb(Q)} var</b>. Puissance apparente S ?`, reponse: S, unite: "VA", explication: `S = √(P² + Q²) = √(${nb(P)}² + ${nb(Q)}²) = ${nb(S)} VA.` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const I = r.pas(3, 15, 0.5), c = r.pick([0.65, 0.7, 0.75, 0.8, 0.85, 0.9]); const S = 230 * I, P = Math.round(S * c / 10) * 10;
          return { enonce: `Un wattmètre indique <b>P = ${nb(P)} W</b> ; on mesure <b>U = 230 V</b> et <b>I = ${nb(I)} A</b>. Facteur de puissance k ?`, reponse: P / S, unite: "", explication: `S = U·I = 230 × ${nb(I)} = ${nb(S)} VA ; k = cos φ = P / S = ${nb(P)} / ${nb(S)} = ${nb(P / S, 3)}.` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const P = r.pick([370, 550, 750, 1100, 1500, 2200]), c = r.pick([0.7, 0.75, 0.8, 0.85]); const I = P / (230 * c);
          return { enonce: `Un moteur monophasé absorbe une puissance active <b>P = ${nb(P)} W</b> sous <b>230 V</b>, <b>cos φ = ${nb(c)}</b>. Courant absorbé ?`, reponse: I, unite: "A", explication: `P = U·I·cos φ ⇒ I = P / (U·cos φ) = ${nb(P)} / (230 × ${nb(c)}) = ${nb(I)} A.` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const c1 = r.pick([0.8, 0.85, 0.9]), c2 = r.pick([0.6, 0.65, 0.7]), I1 = r.int(3, 8), I2 = r.int(5, 12); const P1 = 230 * I1 * c1, P2 = 230 * I2 * c2, Q1 = P1 * tanAcos(c1), Q2 = P2 * tanAcos(c2); const P = P1 + P2, Q = Q1 + Q2, S = Math.hypot(P, Q), I = S / 230;
          return { enonce: `Sous 230 V, deux moteurs en parallèle : M1 (<b>${I1} A ; cos φ<sub>1</sub> = ${nb(c1)}</b>) et M2 (<b>${I2} A ; cos φ<sub>2</sub> = ${nb(c2)}</b>). Courant total I (méthode de Boucherot) ?`, reponse: I, unite: "A", explication: `P = ${nb(P1)} + ${nb(P2)} = ${nb(P)} W ; Q = P<sub>1</sub>·tan φ<sub>1</sub> + P<sub>2</sub>·tan φ<sub>2</sub> = ${nb(Q1)} + ${nb(Q2)} = ${nb(Q)} var ; S = √(P² + Q²) = ${nb(S)} VA ; I = S / U = ${nb(I)} A (les courants ne s'additionnent pas directement).` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const Pr = r.pick([1000, 1500, 2000]), Pm = r.pick([750, 1100, 1500, 2200]), cm = r.pick([0.7, 0.75, 0.8]); const Qm = Pm * tanAcos(cm), P = Pr + Pm, S = Math.hypot(P, Qm), k = P / S;
          return { enonce: `Sous 230 V : un radiateur (<b>${nb(Pr)} W</b>, cos φ = 1) et un moteur (<b>${nb(Pm)} W</b>, cos φ = ${nb(cm)}). Facteur de puissance de l'ensemble ?`, reponse: k, unite: "", explication: `Q<sub>moteur</sub> = ${nb(Pm)} × tan φ = ${nb(Qm)} var ; Q<sub>radiateur</sub> = 0 ; P = ${nb(P)} W ; S = √(P² + Q²) = ${nb(S)} VA ; cos φ = P / S = ${nb(k, 3)}.` }; } },
      { fiche: "tsi-s8-src-puissances", gen: (r) => { const Pr = r.pas(1000, 2000, 250), Pm = r.pas(800, 2000, 100), Qm = r.pas(600, 1500, 100), Qc = -r.pas(200, 600, 100); const P = Pr + Pm, Q = Qm + Qc, S = Math.hypot(P, Q); const askI = r.pick([true, false]);
          const tab = `<table><tr><th>Récepteur</th><th>P (W)</th><th>Q (var)</th></tr><tr><td>Radiateur</td><td>${nb(Pr)}</td><td>0</td></tr><tr><td>Moteur</td><td>${nb(Pm)}</td><td>${nb(Qm)}</td></tr><tr><td>Condensateur</td><td>0</td><td>${nb(Qc)}</td></tr></table>`;
          return { enonce: `Bilan d'une installation sous 230 V :${tab}${askI ? "Courant total absorbé ?" : "Puissance apparente totale ?"}`, reponse: askI ? S / 230 : S, unite: askI ? "A" : "VA", explication: `Boucherot : P = ${nb(P)} W ; Q = ${nb(Qm)} − ${nb(-Qc)} = ${nb(Q)} var ; S = √(P² + Q²) = ${nb(S)} VA${askI ? ` ; I = S / U = ${nb(S / 230)} A` : ""}.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-puissances", enonce: "Méthode de Boucherot : pour un groupement de récepteurs, on additionne…", choix: ["Les puissances actives et les puissances réactives", "Les puissances apparentes", "Les courants efficaces", "Les facteurs de puissance"], bonne: 0, explication: "P = ΣP et Q = ΣQ se conservent ; S ne se conserve pas : on la recalcule par S = √(P² + Q²)." },
      { type: "qcm", fiche: "tsi-s8-src-puissances", enonce: "Un récepteur <b>capacitif</b> (φ < 0) a une puissance réactive…", choix: ["Négative", "Positive", "Nulle", "Égale à sa puissance active"], bonne: 0, explication: "Q = U·I·sin φ : récepteur inductif (φ > 0) → Q > 0 ; capacitif (φ < 0) → Q < 0. C'est pour cela qu'on ajoute des condensateurs pour relever le cos φ." },

      // ---------- Triphasé ----------
      { fiche: "tsi-s8-src-tri", gen: (r) => { if (r.pick([true, false])) { const V = r.pick([127, 133, 230, 400]); return { enonce: `Réseau triphasé : tension simple <b>V = ${V} V</b>. Tension composée U ?`, reponse: V * R3, unite: "V", explication: `U = V·√3 = ${V} × √3 = ${nb(V * R3)} V.` }; }
          const U = r.pick([220, 230, 400, 690]); return { enonce: `Réseau triphasé : tension entre phases <b>U = ${U} V</b>. Tension entre une phase et le neutre ?`, reponse: U / R3, unite: "V", explication: `V = U / √3 = ${U} / √3 = ${nb(U / R3)} V.` }; } },
      { fiche: "tsi-s8-src-tri", gen: (r) => { const I = r.pas(4, 40, 1), c = r.pick([0.8, 0.85, 0.9, 1]); const P = R3 * 400 * I * c;
          return { enonce: `${c === 1 ? "Four" : "Atelier"} alimenté en triphasé <b>400 V</b> entre phases : courant de ligne <b>I = ${I} A</b>, <b>cos φ = ${nb(c)}</b>. Puissance active (kW) ?`, reponse: P / 1000, unite: "kW", explication: `P = √3·U·I·cos φ = √3 × 400 × ${I} × ${nb(c)} = ${nb(P)} W = ${nb(P / 1000)} kW.` }; } },
      { fiche: "tsi-s8-src-tri", gen: (r) => { const P = r.pick([3, 5, 7.5, 9, 12, 15, 22]), c = r.pick([0.8, 0.85, 0.9, 1]); const I = P * 1000 / (R3 * 400 * c);
          return { enonce: `${c === 1 ? "Un four triphasé" : "Un atelier"} consomme <b>${nb(P)} kW</b> sur le réseau <b>400 V</b> entre phases, <b>cos φ = ${nb(c)}</b>. Courant en ligne ?`, reponse: I, unite: "A", explication: `P = √3·U·I·cos φ ⇒ I = P / (√3·U·cos φ) = ${nb(P * 1000)} / (√3 × 400 × ${nb(c)}) = ${nb(I)} A.` }; } },
      { fiche: "tsi-s8-src-tri", gen: (r) => { const I = r.pas(10, 100, 5); const S = R3 * 400 * I;
          return { enonce: `Une installation triphasée <b>400 V</b> absorbe <b>${I} A</b> par ligne. Puissance apparente (kVA) ?`, reponse: S / 1000, unite: "kVA", explication: `S = √3·U·I = √3 × 400 × ${I} = ${nb(S)} VA = ${nb(S / 1000)} kVA.` }; } },
      { fiche: "tsi-s8-src-tri", gen: (r) => { if (r.pick([true, false])) { const J = r.pas(2, 20, 0.5); return { enonce: `Récepteur couplé en <b>triangle</b> : chaque enroulement est parcouru par <b>J = ${nb(J)} A</b>. Courant en ligne I ?`, reponse: J * R3, unite: "A", explication: `En triangle : I = J·√3 = ${nb(J)} × √3 = ${nb(J * R3)} A.` }; }
          const I = r.pas(5, 40, 1); return { enonce: `Récepteur couplé en <b>triangle</b> : courant de ligne <b>I = ${I} A</b>. Courant J dans un enroulement ?`, reponse: I / R3, unite: "A", explication: `I = J·√3 ⇒ J = I / √3 = ${I} / √3 = ${nb(I / R3)} A.` }; } },
      { type: "qcm", fiche: "tsi-s8-src-tri", enonce: "Les trois tensions d'un réseau triphasé équilibré sont déphasées entre elles de…", choix: ["120° (1/3 de période)", "90° (1/4 de période)", "180° (1/2 période)", "60° (1/6 de période)"], bonne: 0, explication: "Même fréquence, même valeur efficace, déphasées de 2π/3 = 120°." },
      { type: "qcm", fiche: "tsi-s8-src-tri", enonce: "La tension <b>composée</b> U d'un réseau triphasé est mesurée…", choix: ["Entre deux phases", "Entre une phase et le neutre", "Entre le neutre et la terre", "Entre une phase et la terre"], bonne: 0, explication: "Tension simple V : phase–neutre. Tension composée U : entre deux phases. U = V·√3." },
      { type: "qcm", fiche: "tsi-s8-src-tri", enonce: "Un élève calcule la puissance d'un four triphasé (400 V entre phases ; 10 A ; cos φ = 1) : « P = 400 × 10 = 4 000 W ». Son erreur ?", choix: ["Il manque √3 : P = √3 × 400 × 10 ≈ 6 928 W", "Il fallait prendre 230 V : P = 2 300 W", "Il fallait multiplier par 3 : P = 12 000 W", "Aucune erreur"], bonne: 0, explication: "En triphasé, avec U (entre phases) et I (en ligne) : P = √3·U·I·cos φ." },
      { type: "qcm", fiche: "tsi-s8-src-tri", enonce: "Réseau de distribution français : tension simple, tension composée et fréquence ?", choix: ["230 V ; 400 V ; 50 Hz", "400 V ; 230 V ; 50 Hz", "230 V ; 400 V ; 60 Hz", "230 V ; 325 V ; 50 Hz"], bonne: 0, explication: "V ≈ 230 V (phase–neutre), U ≈ 400 V = 230 × √3 (entre phases), f = 50 Hz." }
    ],
    fiches: [
      { id: "tsi-s8-src-energie", titre: "Énergie, puissance et sources",
        recto: "Quelle relation lie énergie, puissance et durée ? Énergie primaire ou finale, renouvelable ou non ?",
        verso: `<div class="formule">E = P × t &nbsp;·&nbsp; 1 Wh = 3 600 J</div>
          <ul><li><b>Primaire</b> : dans la nature (vent, pétrole…) ; <b>finale</b> : prête à l'emploi (électricité à la prise).</li>
          <li><b>Renouvelables</b> : soleil, vent, eau, biomasse, géothermie. <b>Non renouvelables</b> : pétrole, charbon, gaz, uranium.</li>
          <li>Stockage : STEP, air comprimé, volant d'inertie (mécanique) ; accumulateurs, hydrogène (chimique).</li></ul>
          <p class="astuce">L'énergie ne se crée pas, elle se convertit ; la part non souhaitée = pertes (surtout chaleur).</p>`,
        quiz: [{ enonce: "1 kWh vaut…", choix: ["3,6 MJ", "3 600 J", "1 000 J"], bonne: 0 },
               { enonce: "Le litre d'essence à la pompe est une énergie…", choix: ["finale", "primaire", "renouvelable"], bonne: 0 },
               { enonce: "Un volant d'inertie stocke l'énergie sous forme…", choix: ["cinétique", "chimique", "potentielle de pesanteur"], bonne: 0 }] },
      { id: "tsi-s8-src-batterie", titre: "Sources continues et batteries",
        recto: "Comment calcule-t-on l'énergie et l'autonomie d'une batterie ? Que change une association série ou parallèle ?",
        verso: `<div class="formule">Q (Ah) = I × t &nbsp;·&nbsp; W (Wh) = U × Q &nbsp;·&nbsp; t = Q / I = W / P</div>
          <ul><li><b>Série</b> : les tensions s'ajoutent, la capacité reste celle d'un élément.</li>
          <li><b>Parallèle</b> : les capacités s'ajoutent, la tension reste celle d'un élément.</li>
          <li>En continu : P = U·I ; effet Joule : P = R·I² = U²/R.</li></ul>
          <p class="astuce">1 000 mAh = 1 Ah. Le Ah est une charge, pas une énergie. Robot Sumo : 5 éléments NiMH 1,2 V en série = 6 V.</p>`,
        quiz: [{ enonce: "3 éléments 3,7 V – 2 Ah en série :", choix: ["11,1 V – 2 Ah", "3,7 V – 6 Ah", "11,1 V – 6 Ah"], bonne: 0 },
               { enonce: "Batterie 12 V – 5 Ah : énergie ?", choix: ["60 Wh", "2,4 Wh", "17 Wh"], bonne: 0 },
               { enonce: "10 Ah débités sous 2 A durent…", choix: ["5 h", "20 h", "0,2 h"], bonne: 0 }] },
      { id: "tsi-s8-src-sinus", titre: "Signal sinusoïdal",
        recto: "Quelles relations lient T, f, ω, U<sub>max</sub>, U<sub>eff</sub> et le déphasage ?",
        verso: `<div class="formule">f = 1 / T &nbsp;·&nbsp; ω = 2π·f &nbsp;·&nbsp; U<sub>eff</sub> = U<sub>max</sub> / √2</div>
          <div class="formule">φ = Δt × 360 / T (°) = Δt × 2π / T (rad)</div>
          <ul><li>U<sub>moy</sub> = aire algébrique / T (nulle pour une sinusoïde).</li>
          <li>R : u et i en phase ; L : i en retard de 90° ; C : i en avance de 90°.</li></ul>
          <p class="astuce">« 230 V » est une valeur efficace : U<sub>max</sub> = 230 × √2 ≈ 325 V.</p>`,
        quiz: [{ enonce: "f = 50 Hz ⇒ T = …", choix: ["20 ms", "50 ms", "2 ms"], bonne: 0 },
               { enonce: "Dans une bobine, le courant est…", choix: ["en retard de 90° sur u", "en avance de 90° sur u", "en phase avec u"], bonne: 0 },
               { enonce: "U<sub>max</sub> = 100 V ⇒ U<sub>eff</sub> ≈ …", choix: ["70,7 V", "141 V", "50 V"], bonne: 0 }] },
      { id: "tsi-s8-src-puissances", titre: "Puissances P, Q, S — Boucherot",
        recto: "Comment calcule-t-on P, Q, S et cos φ en monophasé ? Que dit la méthode de Boucherot ?",
        verso: `<div class="formule">P = U·I·cos φ (W) &nbsp;·&nbsp; Q = U·I·sin φ (var) &nbsp;·&nbsp; S = U·I (VA)</div>
          <div class="formule">S² = P² + Q² &nbsp;·&nbsp; k = cos φ = P / S &nbsp;·&nbsp; tan φ = Q / P</div>
          <ul><li><b>Boucherot</b> : P = ΣP<sub>i</sub> et Q = ΣQ<sub>i</sub>, puis S = √(P² + Q²) et I = S / U.</li>
          <li>Inductif (moteur) : Q > 0 ; capacitif : Q < 0.</li></ul>
          <p class="astuce">Les S (et les courants) ne s'additionnent pas : S ≠ S<sub>1</sub> + S<sub>2</sub>.</p>`,
        quiz: [{ enonce: "P = 300 W et Q = 400 var ⇒ S = …", choix: ["500 VA", "700 VA", "100 VA"], bonne: 0 },
               { enonce: "Boucherot : on additionne…", choix: ["les P et les Q", "les S", "les courants efficaces"], bonne: 0 },
               { enonce: "Q < 0 signifie un récepteur…", choix: ["capacitif", "inductif", "résistif"], bonne: 0 }] },
      { id: "tsi-s8-src-tri", titre: "Réseau triphasé",
        recto: "Quelle relation lie tension simple et tension composée ? Comment calcule-t-on la puissance en triphasé ?",
        verso: `<ul><li>3 tensions de même fréquence et même valeur efficace, déphasées de <b>120°</b>.</li>
          <li><b>V</b> : phase–neutre (simple) ; <b>U</b> : entre deux phases (composée).</li></ul>
          <div class="formule">U = V·√3 (230 V / 400 V) &nbsp;·&nbsp; triangle : I = J·√3</div>
          <div class="formule">P = √3·U·I·cos φ &nbsp;·&nbsp; Q = √3·U·I·sin φ &nbsp;·&nbsp; S = √3·U·I</div>
          <p class="astuce">Dans ces formules, U = tension composée et I = courant en ligne : ne pas oublier √3.</p>`,
        quiz: [{ enonce: "V = 230 V ⇒ U = …", choix: ["400 V", "230 V", "325 V"], bonne: 0 },
               { enonce: "Déphasage entre deux phases :", choix: ["120°", "90°", "180°"], bonne: 0 },
               { enonce: "Puissance active en triphasé :", choix: ["√3·U·I·cos φ", "U·I·cos φ", "3·U·I·cos φ"], bonne: 0 }] }
    ]
  });

  // =====================================================================
  // Module 2 — Énergétique (8.2)
  // =====================================================================
  SIP.definirModule({
    id: "tsi-s8-energetique",
    niveaux: ["TSI"],
    sequence: "S8 · Énergie et conversion",
    titre: "Énergétique : travail, énergies et rendement",
    description: "Travail d'une force et d'un couple, puissance, énergies cinétique et potentielle, conservation, rendement global et dimensionnement (ascenseur, treuil, véhicule électrique).",
    competences: ["A2", "M2", "M15"],
    nbQuestions: 10,
    questions: [
      // ---------- Travail et puissance ----------
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const F = r.pas(50, 500, 50), d = r.pick([2, 5, 10, 20]), a = r.pick([0, 0, 30, 45, 60]); const W = F * d * cosd(a);
          return { enonce: `Une force <b>F = ${F} N</b> déplace son point d'application de <b>${d} m</b> ; angle entre la force et le déplacement : <b>α = ${a}°</b>. Travail de la force ?`, reponse: W, unite: "J", explication: `W = F·d·cos α = ${F} × ${d} × cos ${a}° = ${nb(W)} J.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const C = r.pick([2, 5, 10, 20, 50]), n = r.pick([5, 10, 20, 50, 100]); const th = 2 * PI * n, W = C * th;
          return { enonce: `Un arbre soumis à un couple moteur <b>C = ${C} N·m</b> effectue <b>${n} tours</b>. Travail fourni par le couple ?`, reponse: W, unite: "J", explication: `θ = ${n} × 2π = ${nb(th)} rad ; W = C·θ = ${C} × ${nb(th)} = ${nb(W)} J.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const W = r.pick([6, 12, 18, 30, 45, 60, 90]), t = r.pick([10, 15, 20, 30, 60]); const P = W * 1000 / t;
          return { enonce: `Un treuil fournit un travail de <b>${W} kJ</b> en <b>${t} s</b>. Puissance moyenne développée ?`, reponse: P, unite: "W", explication: `P = W / t = ${nb(W * 1000)} J / ${t} s = ${nb(P)} W.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const C = r.pick([0.5, 2, 5, 10, 20, 50]), N = r.pick([500, 750, 1000, 1450, 1500, 2900, 3000]); const w = omega(N), P = C * w;
          return { enonce: `Un arbre transmet un couple <b>C = ${nb(C)} N·m</b> à <b>N = ${nb(N)} tr/min</b>. Puissance transmise ?`, reponse: P, unite: "W", explication: `ω = 2π·N / 60 = ${nb(w)} rad/s ; P = C·ω = ${nb(C)} × ${nb(w)} = ${nb(P)} W.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const P = r.pick([5, 10, 15, 20, 30]), v = r.pick([36, 54, 72, 90]), R = r.pick([0.28, 0.3, 0.32]); const V = v / 3.6, w = V / R, C = P * 1000 / w;
          return { enonce: `Véhicule électrique : puissance à la roue motrice <b>${P} kW</b> à <b>${v} km/h</b>, rayon de roue <b>${nb(R * 100)} cm</b> (sans glissement). Couple sur la roue ?`, reponse: C, unite: "N·m", explication: `V = ${v} / 3,6 = ${nb(V)} m/s ; ω = V / R = ${nb(V)} / ${nb(R)} = ${nb(w)} rad/s ; C = P / ω = ${nb(P * 1000)} / ${nb(w)} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const F = r.pas(200, 1200, 100), v = r.pick([18, 36, 54, 72, 90, 108]); const V = v / 3.6, P = F * V;
          return { enonce: `Un véhicule roule à <b>${v} km/h</b> ; la force de traction vaut <b>${nb(F)} N</b>. Puissance de traction (kW) ?`, reponse: P / 1000, unite: "kW", explication: `V = ${v} / 3,6 = ${nb(V)} m/s ; P = F·V = ${nb(F)} × ${nb(V)} = ${nb(P)} W = ${nb(P / 1000)} kW.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { if (r.pick([true, false])) { const ch = r.pick([5, 10, 50, 90, 110, 150]); return { enonce: `Un moteur thermique est annoncé à <b>${ch} ch</b>. Puissance en kW (1 ch = 736 W) ?`, reponse: ch * 0.736, unite: "kW", explication: `P = ${ch} × 736 = ${nb(ch * 736)} W = ${nb(ch * 0.736)} kW.` }; }
          const kW = r.pick([1.5, 4, 7.5, 15, 55, 100]); return { enonce: `Un moteur électrique de <b>${nb(kW)} kW</b> : puissance en chevaux (1 ch = 736 W) ?`, reponse: kW * 1000 / 736, unite: "ch", explication: `P = ${nb(kW * 1000)} / 736 = ${nb(kW * 1000 / 736)} ch.` }; } },
      { fiche: "tsi-s8-ene-travail", gen: (r) => { const t = [["un travail", "J (joule)"], ["une puissance", "W (watt)"], ["un couple", "N·m"], ["une vitesse angulaire ω", "rad/s"], ["un moment d'inertie J", "kg·m²"], ["une force", "N (newton)"], ["une vitesse linéaire", "m/s"]]; const k = r.int(0, t.length - 1); const autres = r.melange(t.filter((x, i) => i !== k).map((x) => x[1])).slice(0, 3);
          return { type: "qcm", enonce: `Dans quelle unité SI exprime-t-on ${t[k][0]} ?`, choix: [t[k][1], ...autres], bonne: 0, explication: `${maj(t[k][0])} s'exprime en ${t[k][1]}. Rappel : 1 J = 1 N × 1 m ; 1 W = 1 J/s ; P = C·ω avec C en N·m et ω en rad/s.` }; } },
      { type: "qcm", fiche: "tsi-s8-ene-travail", enonce: "Un couple est dit <b>résistant</b> lorsque…", choix: ["C et ω sont de signes opposés (travail négatif)", "C et ω ont le même signe (travail positif)", "La vitesse de rotation est nulle", "Le couple reste constant"], bonne: 0, explication: "Couple moteur : C et ω de même signe, W > 0. Couple résistant (cas d'un frein) : signes opposés, W < 0." },
      { type: "qcm", fiche: "tsi-s8-ene-travail", enonce: "Un chariot roule sur un sol horizontal. Travail de son poids ?", choix: ["Nul : le poids est perpendiculaire au déplacement", "m·g·d", "Négatif", "½·m·V²"], bonne: 0, explication: "W = F·d·cos α avec α = 90° : cos 90° = 0. Le poids ne travaille que lors d'un changement d'altitude (W = m·g·Δh)." },
      { type: "qcm", fiche: "tsi-s8-ene-travail", enonce: "Un élève écrit : « P = C × N = 10 N·m × 1 500 tr/min = 15 000 W ». Quelle est son erreur ?", choix: ["N doit être converti en rad/s : P = 10 × 157 ≈ 1 571 W", "Il fallait diviser : P = C / N", "Il manque le rendement : P = 15 000 × 0,8 W", "Aucune erreur"], bonne: 0, explication: "P = C·ω avec ω en rad/s : ω = 2π × 1 500 / 60 = 157 rad/s, donc P ≈ 1 571 W." },

      // ---------- Énergies cinétique et potentielle ----------
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const m = r.pas(800, 2000, 100), v = r.pick([30, 50, 70, 90, 110, 130]); const V = v / 3.6, E = 0.5 * m * V * V;
          return { enonce: `Véhicule électrique de <b>${nb(m)} kg</b> roulant à <b>${v} km/h</b>. Énergie cinétique (kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `V = ${v} / 3,6 = ${nb(V)} m/s ; E<sub>cin</sub> = ½·m·V² = 0,5 × ${nb(m)} × ${nb(V)}² = ${nb(E)} J = ${nb(E / 1000)} kJ.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const J = r.pick([0.01, 0.02, 0.05, 0.1, 0.5]), N = r.pick([1000, 1500, 3000, 6000]); const w = omega(N), E = 0.5 * J * w * w;
          return { enonce: `Un volant d'inertie (<b>J = ${nb(J)} kg·m²</b>) tourne à <b>${nb(N)} tr/min</b>. Énergie cinétique stockée ?`, reponse: E, unite: "J", explication: `ω = 2π × ${nb(N)} / 60 = ${nb(w)} rad/s ; E<sub>cin</sub> = ½·J·ω² = 0,5 × ${nb(J)} × ${nb(w)}² = ${nb(E)} J.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const m = r.pas(400, 1200, 50), n = r.int(2, 10); const h = 3 * n, E = m * g * h;
          return { enonce: `Un ascenseur (cabine + passagers : <b>${nb(m)} kg</b>) monte de <b>${n} étages de 3 m</b>. Énergie potentielle gagnée (kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `h = ${n} × 3 = ${h} m ; E<sub>p</sub> = m·g·h = ${nb(m)} × 9,81 × ${h} = ${nb(E)} J = ${nb(E / 1000)} kJ.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const m = r.pick([50, 100, 200, 500]), V = r.int(2, 12); const E = 0.5 * m * V * V;
          return { enonce: `Un chariot de <b>${m} kg</b> possède une énergie cinétique de <b>${nb(E)} J</b>. Quelle est sa vitesse ?`, reponse: V, unite: "m/s", explication: `E<sub>cin</sub> = ½·m·V² ⇒ V = √(2·E / m) = √(2 × ${nb(E)} / ${m}) = ${V} m/s.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const k = r.pick([3, 4, 5, 10]);
          return { type: "qcm", enonce: `Si la vitesse d'un véhicule est multipliée par <b>${k}</b>, son énergie cinétique est multipliée par…`, choix: [String(k * k), String(k), String(2 * k), String(k * k * k)], bonne: 0, explication: `E<sub>cin</sub> = ½·m·V² dépend du carré de la vitesse : facteur ${k}² = ${k * k}.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const J = r.pick([0.5, 1, 2, 5]), E = r.pick([10, 20, 50, 100, 200]); const w = Math.sqrt(2 * E * 1000 / J), N = trmin(w);
          return { enonce: `On veut stocker <b>${E} kJ</b> dans un volant d'inertie de moment d'inertie <b>J = ${nb(J)} kg·m²</b>. Vitesse de rotation nécessaire (tr/min) ?`, reponse: N, unite: "tr/min", explication: `ω = √(2·E / J) = √(2 × ${nb(E * 1000)} / ${nb(J)}) = ${nb(w)} rad/s ; N = 60·ω / 2π = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-s8-ene-formes", gen: (r) => { const V = r.pick([0.5, 1, 2, 5, 10]), h = r.pick([100, 200, 300, 500]); const E = 1e9 * V * g * h, MWh = E / 3.6e9;
          return { enonce: `Une STEP a pompé <b>${nb(V)} million${V >= 2 ? "s" : ""} de m³</b> d'eau vers un bassin situé <b>${h} m</b> plus haut (1 m³ d'eau = 1 000 kg). Énergie potentielle stockée (MWh) ?`, reponse: MWh, unite: "MWh", explication: `m = ${nb(V)} × 10<sup>9</sup> kg ; E<sub>p</sub> = m·g·h = ${nb(V)}×10<sup>9</sup> × 9,81 × ${h} = ${nb(E / 1e12)}×10<sup>12</sup> J ; 1 MWh = 3,6×10<sup>9</sup> J ⇒ E<sub>p</sub> = ${nb(MWh)} MWh.` }; } },
      { type: "qcm", fiche: "tsi-s8-ene-formes", enonce: "Ordre de grandeur de l'énergie cinétique d'une voiture de 1 tonne roulant à 50 km/h ?", choix: ["≈ 100 kJ", "≈ 1 kJ", "≈ 10 MJ", "≈ 1 250 kJ"], bonne: 0, explication: "V = 50 / 3,6 ≈ 13,9 m/s ; E<sub>cin</sub> = ½ × 1 000 × 13,9² ≈ 96 kJ. (1 250 kJ : on a oublié de convertir les km/h en m/s.)" },

      // ---------- Théorème de l'énergie cinétique, conservation ----------
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const h = r.pick([1, 2, 5, 10, 20, 45]), m = r.pick([2, 5, 50, 200]); const V = Math.sqrt(2 * g * h);
          return { enonce: `Un objet de <b>${m} kg</b> tombe sans vitesse initiale d'une hauteur de <b>${h} m</b> (frottements négligés). Vitesse juste avant l'impact ?`, reponse: V, unite: "m/s", explication: `Conservation : m·g·h = ½·m·V² ⇒ V = √(2·g·h) = √(2 × 9,81 × ${h}) = ${nb(V)} m/s (la masse n'intervient pas).` }; } },
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const VA = r.int(1, 5), h = r.pick([2, 3, 5, 8, 10, 15]); const VB = Math.sqrt(VA * VA + 2 * g * h);
          return { enonce: `Un wagonnet passe en A à <b>${VA} m/s</b> puis descend de <b>${h} m</b> jusqu'en B (frottements négligés). Vitesse en B ?`, reponse: VB, unite: "m/s", explication: `½·m·V<sub>B</sub>² = ½·m·V<sub>A</sub>² + m·g·h ⇒ V<sub>B</sub> = √(V<sub>A</sub>² + 2·g·h) = √(${VA * VA} + 2 × 9,81 × ${h}) = ${nb(VB)} m/s.` }; } },
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const V = r.int(2, 15); const h = V * V / (2 * g);
          return { enonce: `Une balle est lancée verticalement vers le haut à <b>${V} m/s</b> (frottements négligés). Hauteur maximale atteinte au-dessus du point de lancement ?`, reponse: h, unite: "m", explication: `½·m·V² = m·g·h ⇒ h = V² / (2·g) = ${V * V} / 19,62 = ${nb(h)} m.` }; } },
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const m = r.pas(1000, 1800, 100), v = r.pick([50, 70, 90, 110, 130]); const V = v / 3.6, E = 0.5 * m * V * V;
          return { enonce: `Une voiture de <b>${nb(m)} kg</b> freine de <b>${v} km/h</b> jusqu'à l'arrêt avec des freins classiques. Énergie dissipée en chaleur dans les freins (kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `Théorème de l'énergie cinétique : W<sub>freins</sub> = 0 − ½·m·V² ; énergie dissipée = ½ × ${nb(m)} × ${nb(V)}² = ${nb(E / 1000)} kJ.` }; } },
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const m = r.pick([20, 40, 50, 80, 100, 150]), F = r.pas(50, 300, 25), d = r.pick([2, 3, 4, 5, 8]); const V = Math.sqrt(2 * F * d / m);
          return { enonce: `Un chariot de <b>${m} kg</b>, initialement à l'arrêt, est poussé par une force horizontale constante <b>F = ${F} N</b> sur <b>${d} m</b> (frottements négligés). Vitesse atteinte ?`, reponse: V, unite: "m/s", explication: `Théorème de l'énergie cinétique : F·d = ½·m·V² − 0 ⇒ V = √(2·F·d / m) = √(2 × ${F} × ${d} / ${m}) = ${nb(V)} m/s.` }; } },
      { fiche: "tsi-s8-ene-conservation", gen: (r) => { const m = r.pas(1000, 1600, 100), v = r.pick([50, 70, 90]), F = r.pas(4000, 9000, 500); const V = v / 3.6, d = 0.5 * m * V * V / F;
          return { enonce: `Un véhicule de <b>${nb(m)} kg</b> roule à <b>${v} km/h</b>. Une force de freinage constante de <b>${nb(F)} N</b> l'arrête. Distance de freinage ?`, reponse: d, unite: "m", explication: `−F·d = 0 − ½·m·V² ⇒ d = ½·m·V² / F = 0,5 × ${nb(m)} × ${nb(V)}² / ${nb(F)} = ${nb(d)} m.` }; } },
      { type: "qcm", fiche: "tsi-s8-ene-conservation", enonce: "L'énergie mécanique (E<sub>p</sub> + E<sub>cin</sub>) d'un système reste constante lorsque…", choix: ["Les frottements sont négligeables et il n'échange pas d'énergie avec l'extérieur", "Sa vitesse est constante", "Son altitude est constante", "Il tourne autour d'un axe fixe"], bonne: 0, explication: "Sans pertes (frottements négligés) et sans échange avec l'extérieur, il n'y a que des transferts entre énergie potentielle et cinétique." },
      { type: "qcm", fiche: "tsi-s8-ene-conservation", enonce: "Un palan à moufle permet de lever une charge avec un effort réduit. Pourquoi ?", choix: ["On tire sur une plus grande longueur de corde : l'énergie (effort × déplacement) reste la même", "Les poulies créent de l'énergie", "La charge devient plus légère", "Les frottements aident à lever la charge"], bonne: 0, explication: "Principe de conservation de l'énergie (levier, moufle) : augmenter le déplacement permet de réduire l'effort, à énergie égale." },
      { type: "qcm", fiche: "tsi-s8-ene-conservation", enonce: "Un parachutiste descend à vitesse constante. Que devient l'énergie potentielle qu'il perd ?", choix: ["Elle est convertie en chaleur par les frottements de l'air", "Elle devient de l'énergie cinétique", "Elle disparaît", "Elle devient de l'énergie potentielle élastique"], bonne: 0, explication: "La vitesse est constante, donc E<sub>cin</sub> ne varie pas : le travail du poids (m·g·Δh) est dissipé par les frottements de l'air." },
      { type: "qcm", fiche: "tsi-s8-ene-conservation", enonce: "Le théorème de l'énergie cinétique affirme que, entre deux instants…", choix: ["La somme des travaux des forces extérieures est égale à la variation d'énergie cinétique", "L'énergie cinétique reste toujours constante", "Le travail du poids est toujours nul", "La puissance est égale à l'énergie cinétique"], bonne: 0, explication: "Σ W(forces ext.) = E<sub>cin finale</sub> − E<sub>cin initiale</sub>, pour un solide indéformable." },

      // ---------- Rendement ----------
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const Pa = r.pas(500, 4000, 100), e = r.pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.92]); const Pu = Math.round(Pa * e / 10) * 10, eta = Pu / Pa * 100;
          return { enonce: `Un convertisseur absorbe <b>${nb(Pa)} W</b> et restitue <b>${nb(Pu)} W</b>. Rendement (en %) ?`, reponse: eta, unite: "%", explication: `η = P<sub>u</sub> / P<sub>a</sub> = ${nb(Pu)} / ${nb(Pa)} = ${nb(eta / 100, 3)}, soit ${nb(eta, 3)} %.` }; } },
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const a = r.pick([0.8, 0.85, 0.9]), b = r.pick([0.7, 0.8, 0.9, 0.95]), c = r.pick([0.85, 0.9, 0.95]); const e = a * b * c;
          return { enonce: `Treuil : moteur (<b>η<sub>MOT</sub> = ${nb(a)}</b>), réducteur (<b>η<sub>R</sub> = ${nb(b)}</b>), treuil et poulies (<b>η<sub>T</sub> = ${nb(c)}</b>). Rendement global (en %) ?`, reponse: e * 100, unite: "%", explication: `η<sub>global</sub> = η<sub>MOT</sub> × η<sub>R</sub> × η<sub>T</sub> = ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(e, 3)}, soit ${nb(e * 100, 3)} %.` }; } },
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const Pu = r.pick([1, 1.5, 2, 3, 4, 5]), a = r.pick([0.85, 0.9]), b = r.pick([0.75, 0.8, 0.9]), c = r.pick([0.9, 0.95]); const e = a * b * c, Pa = Pu / e;
          return { enonce: `La charge d'un treuil demande <b>${nb(Pu)} kW</b>. Rendements : moteur ${nb(a)}, réducteur ${nb(b)}, treuil ${nb(c)}. Puissance électrique absorbée par le moteur (kW) ?`, reponse: Pa, unite: "kW", explication: `η<sub>global</sub> = ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(e, 3)} ; P<sub>a</sub> = P<sub>u</sub> / η<sub>global</sub> = ${nb(Pu)} / ${nb(e, 3)} = ${nb(Pa)} kW.` }; } },
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const Pa = r.pick([1.5, 2, 3, 4, 5.5, 7.5, 10]), e = r.pick([0.75, 0.8, 0.85, 0.88, 0.9, 0.92]); const p = Pa * 1000 * (1 - e);
          return { enonce: `Un moteur absorbe <b>${nb(Pa)} kW</b> avec un rendement de <b>${nb(e * 100)} %</b>. Puissance perdue (en W) ?`, reponse: p, unite: "W", explication: `P<sub>u</sub> = η·P<sub>a</sub> = ${nb(e)} × ${nb(Pa * 1000)} = ${nb(e * Pa * 1000)} W ; pertes = P<sub>a</sub> − P<sub>u</sub> = ${nb(p)} W (surtout de la chaleur).` }; } },
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const [a, b, c] = r.melange([0.7, 0.75, 0.8, 0.85, 0.9, 0.95]).slice(0, 3); const prod = a * b * c, moy = (a + b + c) / 3, mini = Math.min(a, b, c), som = a + b + c;
          return { type: "qcm", enonce: `Trois constituants en série ont pour rendements ${nb(a)}, ${nb(b)} et ${nb(c)}. Rendement global ?`, choix: [nb(prod, 3), nb(moy, 3), nb(mini, 3), nb(som, 3)], bonne: 0, explication: `On multiplie : ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(prod, 3)}. La moyenne ou le plus petit rendement surestiment le résultat ; une somme supérieure à 1 est impossible.` }; } },
      { fiche: "tsi-s8-ene-rendement", gen: (r) => { const Pa = r.pas(1000, 3000, 100), e1 = r.pick([0.8, 0.85, 0.9]), e2 = r.pick([0.7, 0.8, 0.9]), e3 = r.pick([0.85, 0.9, 0.95]); const P1 = Math.round(Pa * e1), P2 = Math.round(P1 * e2), P3 = Math.round(P2 * e3); const red = r.pick([true, false]);
          const tab = `<table><tr><th>Constituant</th><th>P entrée (W)</th><th>P sortie (W)</th></tr><tr><td>Moteur</td><td>${nb(Pa)}</td><td>${nb(P1)}</td></tr><tr><td>Réducteur</td><td>${nb(P1)}</td><td>${nb(P2)}</td></tr><tr><td>Treuil</td><td>${nb(P2)}</td><td>${nb(P3)}</td></tr></table>`;
          return red ? { enonce: `Mesures sur un treuil :${tab}Rendement du <b>réducteur</b> (en %) ?`, reponse: P2 / P1 * 100, unite: "%", explication: `η<sub>R</sub> = P<sub>sortie</sub> / P<sub>entrée</sub> = ${nb(P2)} / ${nb(P1)} = ${nb(P2 / P1 * 100, 3)} %.` }
            : { enonce: `Mesures sur un treuil :${tab}Rendement <b>global</b> de la chaîne (en %) ?`, reponse: P3 / Pa * 100, unite: "%", explication: `η<sub>global</sub> = P<sub>utile</sub> / P<sub>absorbée</sub> = ${nb(P3)} / ${nb(Pa)} = ${nb(P3 / Pa * 100, 3)} % (c'est aussi le produit des trois rendements).` }; } },
      { type: "qcm", fiche: "tsi-s8-ene-rendement", enonce: "Un fabricant annonce un réducteur de rendement <b>1,05</b>. Qu'en penses-tu ?", choix: ["Impossible : un rendement est toujours inférieur à 1", "Possible, car un réducteur multiplie le couple", "Possible s'il est bien lubrifié", "Normal pour un réducteur à engrenages"], bonne: 0, explication: "η = P<sub>u</sub> / P<sub>a</sub> < 1 : il y a toujours des pertes. Le réducteur multiplie le couple mais divise la vitesse : la puissance ne peut pas augmenter." },

      // ---------- Dimensionnement ----------
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const m = r.pas(500, 1200, 50), v = r.pick([0.5, 0.63, 1, 1.6]), e = r.pick([0.6, 0.65, 0.7, 0.75, 0.8]); const Pu = m * g * v, Pm = Pu / e;
          return { enonce: `Ascenseur sans contrepoids : masse à lever <b>${nb(m)} kg</b> à <b>${nb(v)} m/s</b>, rendement global de la motorisation <b>${nb(e)}</b>. Puissance électrique absorbée (kW) ?`, reponse: Pm / 1000, unite: "kW", explication: `P<sub>u</sub> = m·g·V = ${nb(m)} × 9,81 × ${nb(v)} = ${nb(Pu)} W ; P<sub>a</sub> = P<sub>u</sub> / η = ${nb(Pu)} / ${nb(e)} = ${nb(Pm)} W = ${nb(Pm / 1000)} kW.` }; } },
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const v = r.pick([0.2, 0.3, 0.4, 0.5, 0.8]), D = r.pick([0.1, 0.16, 0.2, 0.25, 0.3]); const w = v / (D / 2), N = trmin(w);
          return { enonce: `Le câble d'un treuil s'enroule sur un tambour de <b>${nb(D * 1000)} mm</b> de diamètre ; la charge monte à <b>${nb(v)} m/s</b>. Vitesse de rotation du tambour (tr/min) ?`, reponse: N, unite: "tr/min", explication: `ω = V / R = ${nb(v)} / ${nb(D / 2)} = ${nb(w)} rad/s ; N = 60·ω / 2π = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const m = r.pas(100, 500, 50), R = r.pick([0.08, 0.1, 0.125, 0.15]), k = r.pick([10, 20, 25, 30, 40]), e = r.pick([0.8, 0.85, 0.9]); const Ct = m * g * R, Cm = Ct / (k * e);
          return { enonce: `Treuil : charge <b>${m} kg</b>, tambour de rayon <b>${nb(R * 1000)} mm</b>, réducteur de rapport <b>1/${k}</b> et de rendement <b>${nb(e)}</b>. Couple à fournir par le moteur (vitesse constante) ?`, reponse: Cm, unite: "N·m", explication: `C<sub>tambour</sub> = m·g·R = ${m} × 9,81 × ${nb(R)} = ${nb(Ct)} N·m ; C<sub>moteur</sub> = C<sub>tambour</sub> / (k·η<sub>R</sub>) = ${nb(Ct)} / (${k} × ${nb(e)}) = ${nb(Cm)} N·m.` }; } },
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const F = r.pas(300, 900, 50), v = r.pick([50, 70, 90, 110]), e = r.pick([0.8, 0.85, 0.9]); const V = v / 3.6, Pu = F * V, Pb = Pu / e;
          return { enonce: `Véhicule électrique à <b>${v} km/h</b> constants : forces résistantes (roulement + air) <b>${F} N</b>, rendement batterie → roues <b>${nb(e)}</b>. Puissance fournie par la batterie (kW) ?`, reponse: Pb / 1000, unite: "kW", explication: `V = ${nb(V)} m/s ; P<sub>roues</sub> = F·V = ${F} × ${nb(V)} = ${nb(Pu)} W ; P<sub>batterie</sub> = ${nb(Pu)} / ${nb(e)} = ${nb(Pb)} W = ${nb(Pb / 1000)} kW.` }; } },
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const m = r.pas(400, 1000, 50), n = r.int(3, 12), e = r.pick([0.6, 0.7, 0.75, 0.8]); const h = 3 * n, Ep = m * g * h, Wh = Ep / e / 3600;
          return { enonce: `Un ascenseur sans contrepoids (<b>${nb(m)} kg</b> à lever) monte de <b>${n} étages de 3 m</b> ; rendement global <b>${nb(e)}</b>. Énergie électrique consommée (Wh) ?`, reponse: Wh, unite: "Wh", explication: `E<sub>p</sub> = m·g·h = ${nb(m)} × 9,81 × ${h} = ${nb(Ep)} J ; E<sub>élec</sub> = ${nb(Ep)} / ${nb(e)} = ${nb(Ep / e)} J ; ÷ 3 600 = ${nb(Wh)} Wh.` }; } },
      { fiche: "tsi-s8-ene-dimension", gen: (r) => { const m = r.pas(300, 1000, 50), h = r.pick([6, 9, 12, 15, 21, 30]), P = r.pick([3, 4, 5.5, 7.5, 11]); const E = m * g * h, t = E / (P * 1000);
          return { enonce: `Une charge de <b>${nb(m)} kg</b> doit être levée de <b>${h} m</b>. La puissance utile disponible au câble est <b>${nb(P)} kW</b>. Durée minimale de la montée ?`, reponse: t, unite: "s", explication: `E = m·g·h = ${nb(m)} × 9,81 × ${h} = ${nb(E)} J ; t = E / P = ${nb(E)} / ${nb(P * 1000)} = ${nb(t)} s.` }; } },
      { type: "qcm", fiche: "tsi-s8-ene-dimension", enonce: "Levage à vitesse constante : on connaît la masse m et la vitesse de montée V. Quelle relation donne la puissance utile ?", choix: ["P = m·g·V", "P = ½·m·V²", "P = m·g·h", "P = m·V / g"], bonne: 0, explication: "P = F·V avec F = m·g (poids à vaincre à vitesse constante). ½·m·V² et m·g·h sont des énergies, pas des puissances." },
      { type: "qcm", fiche: "tsi-s8-ene-dimension", enonce: "Pourquoi la puissance demandée au démarrage d'un ascenseur est-elle supérieure à m·g·V / η ?", choix: ["Il faut en plus fournir l'énergie cinétique ½·m·V² pour atteindre la vitesse", "Le poids augmente au démarrage", "Le rendement devient supérieur à 1", "L'énergie potentielle diminue au démarrage"], bonne: 0, explication: "Pendant l'accélération, le moteur fournit m·g·V (levage) plus la puissance nécessaire pour augmenter l'énergie cinétique des masses en mouvement." }
    ],
    fiches: [
      { id: "tsi-s8-ene-travail", titre: "Travail et puissance mécaniques",
        recto: "Comment calcule-t-on le travail et la puissance d'une force, puis d'un couple ?",
        verso: `<div class="formule">W = F·d·cos α &nbsp;·&nbsp; W = C·θ (θ en rad)</div>
          <div class="formule">P = W / t &nbsp;·&nbsp; P = F·V·cos α &nbsp;·&nbsp; P = C·ω</div>
          <ul><li>ω = 2π·N / 60 (N en tr/min) ; 1 tour = 2π rad.</li>
          <li>1 J = 1 N × 1 m ; 1 W = 1 J/s ; 1 ch = 736 W.</li></ul>
          <p class="astuce">Couple moteur : C et ω de même signe (W > 0) ; couple résistant (frein) : signes opposés (W < 0).</p>`,
        quiz: [{ enonce: "Dans P = C·ω, ω s'exprime en…", choix: ["rad/s", "tr/min", "Hz"], bonne: 0 },
               { enonce: "Force perpendiculaire au déplacement : travail…", choix: ["nul", "maximal", "négatif"], bonne: 0 },
               { enonce: "Couple de 10 N·m pendant 1 tour :", choix: ["≈ 62,8 J", "10 J", "≈ 3,14 J"], bonne: 0 }] },
      { id: "tsi-s8-ene-formes", titre: "Énergies cinétique et potentielle",
        recto: "Quelles sont les expressions de l'énergie cinétique (translation, rotation) et de l'énergie potentielle de pesanteur ?",
        verso: `<div class="formule">E<sub>cin</sub> = ½·m·V² &nbsp;·&nbsp; E<sub>cin rot</sub> = ½·J·ω² &nbsp;·&nbsp; E<sub>p</sub> = m·g·h</div>
          <ul><li>m en kg, V en m/s, J (moment d'inertie) en kg·m², ω en rad/s, h en m, g = 9,81 m/s².</li>
          <li>E<sub>p</sub> : « réserve » d'énergie (STEP, charge levée) ; E<sub>cin</sub> : masse en mouvement (véhicule, volant d'inertie).</li></ul>
          <p class="astuce">V au carré : doubler la vitesse multiplie E<sub>cin</sub> par 4. Convertir les km/h en m/s (÷ 3,6).</p>`,
        quiz: [{ enonce: "Vitesse × 2 ⇒ E<sub>cin</sub> × …", choix: ["4", "2", "8"], bonne: 0 },
               { enonce: "E<sub>p</sub> de 10 kg soulevés de 2 m :", choix: ["≈ 196 J", "20 J", "≈ 98 J"], bonne: 0 },
               { enonce: "Le moment d'inertie J s'exprime en…", choix: ["kg·m²", "N·m", "kg/m²"], bonne: 0 }] },
      { id: "tsi-s8-ene-conservation", titre: "Énergie cinétique : théorème et conservation",
        recto: "Que dit le théorème de l'énergie cinétique ? Quand l'énergie mécanique se conserve-t-elle ?",
        verso: `<div class="formule">Σ W(forces ext.) = E<sub>cin finale</sub> − E<sub>cin initiale</sub></div>
          <div class="formule">Sans frottements : E<sub>méca</sub> = E<sub>p</sub> + E<sub>cin</sub> = constante</div>
          <ul><li>Chute libre depuis h : m·g·h = ½·m·V² ⇒ V = √(2·g·h).</li>
          <li>Freinage : le travail (négatif) des freins transforme E<sub>cin</sub> en chaleur.</li></ul>
          <p class="astuce">Levier, palan à moufle : on réduit l'effort en allongeant le déplacement, l'énergie reste la même.</p>`,
        quiz: [{ enonce: "Frottements négligés : E<sub>p</sub> + E<sub>cin</sub>…", choix: ["reste constante", "augmente", "s'annule"], bonne: 0 },
               { enonce: "Chute libre de 5 m : V ≈ …", choix: ["9,9 m/s", "49 m/s", "5 m/s"], bonne: 0 }] },
      { id: "tsi-s8-ene-rendement", titre: "Rendement d'une chaîne de puissance",
        recto: "Comment calcule-t-on le rendement d'un constituant, puis d'une chaîne de constituants en série ?",
        verso: `<div class="formule">η = P<sub>utile</sub> / P<sub>absorbée</sub> &lt; 1 &nbsp;·&nbsp; pertes = P<sub>a</sub> − P<sub>u</sub></div>
          <div class="formule">η<sub>global</sub> = η<sub>1</sub> × η<sub>2</sub> × … × η<sub>n</sub></div>
          <ul><li>Pertes : frottements, effet Joule, fuites, vibrations… (surtout chaleur).</li>
          <li>Treuil : η<sub>global</sub> = η<sub>MOT</sub> × η<sub>R</sub> × η<sub>T</sub>.</li></ul>
          <p class="astuce">On multiplie les rendements (ni somme, ni moyenne). En remontant vers la source, on divise par η.</p>`,
        quiz: [{ enonce: "η = 0,9 puis 0,8 en série :", choix: ["0,72", "0,85", "1,7"], bonne: 0 },
               { enonce: "P<sub>a</sub> = 1 000 W, η = 0,8 : pertes ?", choix: ["200 W", "800 W", "1 250 W"], bonne: 0 }] },
      { id: "tsi-s8-ene-dimension", titre: "Dimensionner une motorisation",
        recto: "Quelle puissance faut-il pour lever une masse m à la vitesse V (ascenseur, treuil) ou faire rouler un véhicule ?",
        verso: `<div class="formule">Levage à vitesse constante : P<sub>u</sub> = m·g·V &nbsp;·&nbsp; P<sub>moteur</sub> = P<sub>u</sub> / η</div>
          <ul><li>Treuil : C<sub>tambour</sub> = m·g·R ; V = ω·R ; réducteur 1/k : C<sub>moteur</sub> = C<sub>tambour</sub> / (k·η<sub>R</sub>).</li>
          <li>Véhicule : P = F<sub>résistante</sub> × V.</li>
          <li>Énergie de montée E = m·g·h ; durée t = E / P.</li></ul>
          <p class="astuce">Au démarrage il faut en plus fournir ½·m·V² : la puissance de pointe est plus élevée.</p>`,
        quiz: [{ enonce: "500 kg levés à 1 m/s (η = 1) :", choix: ["≈ 4,9 kW", "500 W", "≈ 49 kW"], bonne: 0 },
               { enonce: "P<sub>u</sub> = 3 kW et η = 0,75 ⇒ P<sub>moteur</sub> = …", choix: ["4 kW", "2,25 kW", "3,75 kW"], bonne: 0 }] }
    ]
  });

  // =====================================================================
  // Module 3 — Machines électriques : MCC et MAS (8.3)
  // =====================================================================
  SIP.definirModule({
    id: "tsi-s8-machines",
    niveaux: ["TSI"],
    sequence: "S8 · Énergie et conversion",
    titre: "Machines électriques : MCC et MAS",
    description: "Équations du moteur à courant continu, bilan de puissances et rendement, moteur asynchrone (vitesse, glissement, couplage), choix d'une machine et réversibilité 4 quadrants.",
    competences: ["A2", "A3", "M3", "M15"],
    nbQuestions: 10,
    questions: [
      // ---------- MCC : équations ----------
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const [U, Rs, Is] = r.pick([[12, [0.5, 1, 1.5], [1, 2, 3]], [24, [0.4, 0.8, 1.2], [2, 3, 5]], [48, [0.5, 1], [3, 4, 6]], [220, [1, 1.5, 2], [5, 8, 10]]]); const R = r.pick(Rs), I = r.pick(Is), E = U - R * I;
          return { enonce: `Un MCC alimenté sous <b>U = ${U} V</b> absorbe <b>I = ${nb(I)} A</b> ; résistance d'induit <b>R = ${nb(R)} Ω</b>. Force électromotrice E ?`, reponse: E, unite: "V", explication: `U = E + R·I ⇒ E = U − R·I = ${U} − ${nb(R)} × ${nb(I)} = ${nb(E)} V.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const K = r.pick([0.02, 0.05, 0.1, 0.2]), W = r.pas(100, 400, 20); const E = +(K * W).toFixed(3), N = trmin(E / K);
          return { enonce: `Un MCC de constante <b>K<sub>e</sub> = ${nb(K)} V·s/rad</b> présente une f.é.m. <b>E = ${nb(E)} V</b>. Fréquence de rotation N (tr/min) ?`, reponse: N, unite: "tr/min", explication: `E = K<sub>e</sub>·Ω ⇒ Ω = E / K<sub>e</sub> = ${nb(E)} / ${nb(K)} = ${nb(E / K)} rad/s ; N = 60·Ω / 2π = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const k = r.pick([0.02, 0.05, 0.1, 0.2, 0.5]), I = r.pas(1, 12, 0.5);
          return { enonce: `Un MCC de constante de couple <b>k<sub>c</sub> = ${nb(k)} N·m/A</b> absorbe <b>${nb(I)} A</b>. Couple moteur ?`, reponse: k * I, unite: "N·m", explication: `C = k<sub>c</sub>·I = ${nb(k)} × ${nb(I)} = ${nb(k * I)} N·m.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const k = r.pick([0.05, 0.1, 0.2, 0.5]), I = r.pas(1, 15, 0.5); const C = +(k * I).toFixed(3);
          return { enonce: `Le couple résistant sur l'arbre d'un MCC vaut <b>${nb(C)} N·m</b> ; constante de couple <b>k<sub>c</sub> = ${nb(k)} N·m/A</b>. Courant absorbé (pertes négligées) ?`, reponse: C / k, unite: "A", explication: `C = k<sub>c</sub>·I ⇒ I = C / k<sub>c</sub> = ${nb(C)} / ${nb(k)} = ${nb(C / k)} A.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const U = r.pick([24, 48]), k = r.pick([0.05, 0.1, 0.2]), R = r.pick([0.5, 0.8, 1]), I = r.int(2, 6); const E = U - R * I, W = E / k, N = trmin(W);
          return { enonce: `MCC : <b>U = ${U} V</b>, <b>R = ${nb(R)} Ω</b>, <b>K<sub>e</sub> = ${nb(k)} V·s/rad</b>, courant absorbé <b>I = ${I} A</b>. Fréquence de rotation (tr/min) ?`, reponse: N, unite: "tr/min", explication: `E = U − R·I = ${U} − ${nb(R)} × ${I} = ${nb(E)} V ; Ω = E / K<sub>e</sub> = ${nb(W)} rad/s ; N = 60·Ω / 2π = ${nb(N)} tr/min.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const U = r.pick([12, 24, 48, 110]), R = r.pick([0.2, 0.4, 0.5, 0.8, 1, 1.5, 2]);
          return { enonce: `Un MCC (<b>U = ${U} V</b>, <b>R = ${nb(R)} Ω</b>) est mis sous tension alors qu'il est à l'arrêt. Courant de démarrage ?`, reponse: U / R, unite: "A", explication: `À l'arrêt Ω = 0 donc E = 0 : U = R·I<sub>d</sub> ⇒ I<sub>d</sub> = ${U} / ${nb(R)} = ${nb(U / R)} A (d'où la nécessité de limiter le courant au démarrage).` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const I = r.pick([0.15, 0.2, 0.25, 0.31, 0.35, 0.4]); const E = 6 - 2.8 * I, W = E / 0.006;
          return { enonce: `Robot Sumo : moteur alimenté par le pack NiMH <b>6,0 V</b>, <b>R = 2,8 Ω</b>, <b>k = 6,0×10<sup>−3</sup> V·s/rad</b>, courant <b>I = ${nb(I)} A</b>. Vitesse angulaire du moteur ω (rad/s) ?`, reponse: W, unite: "rad/s", explication: `E = U − R·I = 6 − 2,8 × ${nb(I)} = ${nb(E)} V ; ω = E / k = ${nb(E)} / 0,006 = ${nb(W)} rad/s (≈ ${nb(trmin(W), 3)} tr/min).` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const N = r.pick([1000, 1500, 2000, 3000]), k = r.pick([0.05, 0.1]), R = r.pick([0.5, 1, 2]), I = r.int(2, 5); const W = omega(N), U = k * W + R * I;
          return { enonce: `On veut qu'un MCC (<b>K<sub>e</sub> = ${nb(k)} V·s/rad</b>, <b>R = ${nb(R)} Ω</b>) tourne à <b>${nb(N)} tr/min</b> en absorbant <b>${I} A</b>. Tension d'alimentation à appliquer ?`, reponse: U, unite: "V", explication: `Ω = 2π × ${nb(N)} / 60 = ${nb(W)} rad/s ; E = K<sub>e</sub>·Ω = ${nb(k * W)} V ; U = E + R·I = ${nb(k * W)} + ${nb(R * I)} = ${nb(U)} V.` }; } },
      { fiche: "tsi-s8-mac-mcc", gen: (r) => { const t = [["le stator (inducteur)", "La partie fixe qui crée le champ magnétique (aimants ou bobines)"], ["le rotor (induit)", "La partie tournante bobinée, parcourue par le courant"], ["l'entrefer", "L'espace étroit entre le rotor et le stator"], ["le collecteur", "L'organe tournant qui inverse le courant dans les spires à chaque demi-tour"], ["les balais", "Les contacts fixes qui frottent sur le collecteur pour amener le courant au rotor"]]; const k = r.int(0, 4); const autres = r.melange(t.filter((x, i) => i !== k).map((x) => x[1])).slice(0, 3);
          return { type: "qcm", enonce: `Dans un moteur à courant continu, que désigne <b>${t[k][0]}</b> ?`, choix: [t[k][1], ...autres], bonne: 0, explication: `${maj(t[k][0])} : ${t[k][1].charAt(0).toLowerCase() + t[k][1].slice(1)}.` }; } },
      { type: "qcm", fiche: "tsi-s8-mac-mcc", enonce: "Pour faire varier la vitesse d'un MCC, on agit en pratique sur…", choix: ["La tension moyenne à ses bornes, grâce à un hacheur (MLI)", "La fréquence du réseau", "Le nombre de paires de pôles", "Le sens de branchement des balais"], bonne: 0, explication: "E = K<sub>e</sub>·Ω ≈ U : la vitesse suit la tension. Le hacheur (MLI/PWM) règle la tension moyenne avec un très bon rendement." },
      { type: "qcm", fiche: "tsi-s8-mac-mcc", enonce: "Un MCC alimenté sous tension constante voit son couple résistant augmenter. Que se passe-t-il ?", choix: ["I augmente (C = k<sub>c</sub>·I) ; E = U − R·I diminue, donc la vitesse baisse un peu", "I diminue et la vitesse augmente", "I reste constant, seule la vitesse baisse", "La tension U augmente pour compenser"], bonne: 0, explication: "Le courant est imposé par le couple résistant : C = k<sub>c</sub>·I. Plus de courant → chute R·I plus grande → E et donc Ω diminuent légèrement." },
      { type: "qcm", fiche: "tsi-s8-mac-mcc", enonce: "Un <b>pont en H</b> sert à…", choix: ["Alimenter le moteur dans les deux sens pour inverser le sens de rotation", "Faire varier la fréquence d'alimentation", "Coupler le moteur en étoile ou en triangle", "Mesurer le courant absorbé"], bonne: 0, explication: "En fermant deux interrupteurs en diagonale, on inverse la polarité de U, donc le sens de rotation du MCC." },

      // ---------- Bilan de puissances et rendement ----------
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const U = r.pick([12, 24, 48]), I = r.pas(2, 8, 0.5), N = r.pick([1500, 2000, 2500, 3000]), e = r.pick([0.65, 0.7, 0.75, 0.8, 0.85]); const Pa = U * I, W = omega(N), C = +(e * Pa / W).toPrecision(3), eta = C * W / Pa * 100;
          return { enonce: `Essai d'un MCC : <b>U = ${U} V</b>, <b>I = ${nb(I)} A</b>, couple utile <b>C = ${nb(C)} N·m</b> à <b>N = ${nb(N)} tr/min</b>. Rendement (en %) ?`, reponse: eta, unite: "%", explication: `P<sub>a</sub> = U·I = ${nb(Pa)} W ; Ω = 2π × ${nb(N)} / 60 = ${nb(W)} rad/s ; P<sub>u</sub> = C·Ω = ${nb(C * W)} W ; η = P<sub>u</sub> / P<sub>a</sub> = ${nb(eta, 3)} %.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const R = r.pick([0.2, 0.3, 0.5, 0.8, 1, 1.5, 2]), I = r.pas(2, 20, 1);
          return { enonce: `Induit d'un MCC : <b>R = ${nb(R)} Ω</b>, courant <b>I = ${I} A</b>. Pertes par effet Joule dans l'induit ?`, reponse: R * I * I, unite: "W", explication: `P<sub>J</sub> = R·I² = ${nb(R)} × ${I}² = ${nb(R * I * I)} W.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const U = r.pick([24, 48]), I = r.int(5, 15), R = r.pick([0.1, 0.2, 0.3, 0.4]), Pc = r.pick([10, 15, 20, 30]); const Pa = U * I, PJ = R * I * I, Pu = Pa - PJ - Pc;
          return { enonce: `MCC à aimants : <b>U = ${U} V</b>, <b>I = ${I} A</b>, <b>R = ${nb(R)} Ω</b>, pertes fer + mécaniques <b>${Pc} W</b>. Puissance utile ?`, reponse: Pu, unite: "W", explication: `P<sub>a</sub> = U·I = ${Pa} W ; P<sub>J</sub> = R·I² = ${nb(PJ)} W ; P<sub>u</sub> = P<sub>a</sub> − P<sub>J</sub> − pertes = ${Pa} − ${nb(PJ)} − ${Pc} = ${nb(Pu)} W.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const I = r.int(8, 20), i = r.pick([0.5, 0.6, 0.8, 1]), N = r.pick([1400, 1500, 1800]), e = r.pick([0.78, 0.8, 0.82, 0.85]); const Pa = 220 * I + 220 * i, W = omega(N), C = +(e * Pa / W).toPrecision(3), eta = C * W / Pa * 100;
          return { enonce: `MCC à inducteur bobiné : induit <b>220 V ; ${I} A</b>, inducteur <b>220 V ; ${nb(i)} A</b>. Couple utile <b>${nb(C)} N·m</b> à <b>${nb(N)} tr/min</b>. Rendement (en %) ?`, reponse: eta, unite: "%", explication: `P<sub>a</sub> = U·I + u·i = ${nb(220 * I)} + ${nb(220 * i)} = ${nb(Pa)} W ; P<sub>u</sub> = C·Ω = ${nb(C)} × ${nb(W)} = ${nb(C * W)} W ; η = P<sub>u</sub> / P<sub>a</sub> = ${nb(eta, 3)} %.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const I = r.pas(3, 30, 0.5), c = r.pick([0.78, 0.8, 0.82, 0.85, 0.87]); const Pa = R3 * 400 * I * c;
          return { enonce: `Moteur asynchrone sur réseau <b>400 V</b> : <b>I = ${nb(I)} A</b>, <b>cos φ = ${nb(c)}</b>. Puissance électrique absorbée (kW) ?`, reponse: Pa / 1000, unite: "kW", explication: `P<sub>a</sub> = √3·U·I·cos φ = √3 × 400 × ${nb(I)} × ${nb(c)} = ${nb(Pa)} W = ${nb(Pa / 1000)} kW.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const Pu = r.pick([1.5, 2.2, 3, 4, 5.5, 7.5]), c = r.pick([0.78, 0.8, 0.82, 0.85]), e = r.pick([0.8, 0.82, 0.85, 0.87, 0.88]); const I = Math.round(Pu * 1000 / (R3 * 400 * c * e) * 10) / 10; const Pa = R3 * 400 * I * c, eta = Pu * 1000 / Pa * 100;
          return { enonce: `Plaque d'un moteur asynchrone : <b>${nb(Pu)} kW ; 400 V ; ${nb(I)} A ; cos φ = ${nb(c)}</b>. Rendement nominal (en %) ?`, reponse: eta, unite: "%", explication: `La puissance de la plaque est la puissance utile. P<sub>a</sub> = √3 × 400 × ${nb(I)} × ${nb(c)} = ${nb(Pa)} W ; η = ${nb(Pu * 1000)} / ${nb(Pa)} = ${nb(eta, 3)} %.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const Pu = r.pick([0.75, 1.5, 2.2, 3, 4, 5.5, 7.5]), N = r.pick([955, 1430, 1440, 1450, 2850, 2900]); const W = omega(N), C = Pu * 1000 / W;
          return { enonce: `Plaque d'un moteur asynchrone : <b>${nb(Pu)} kW – ${nb(N)} tr/min</b>. Couple utile nominal ?`, reponse: C, unite: "N·m", explication: `Ω = 2π × ${nb(N)} / 60 = ${nb(W)} rad/s ; C = P<sub>u</sub> / Ω = ${nb(Pu * 1000)} / ${nb(W)} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s8-mac-bilan", gen: (r) => { const Is = [r.pick([1.5, 2]), r.pick([3, 3.5]), r.pick([4.5, 5])]; const rows = Is.map((I) => ({ I, N: Math.round(trmin((24 - I) / 0.1) / 10) * 10, C: +(0.1 * (I - 0.3)).toFixed(2) })); const k = r.int(0, 2), x = rows[k]; const W = omega(x.N), Pa = 24 * x.I, eta = x.C * W / Pa * 100;
          const tab = `<table><tr><th>Essai</th><th>U (V)</th><th>I (A)</th><th>C (N·m)</th><th>N (tr/min)</th></tr>${rows.map((z, j) => `<tr><td>${j + 1}</td><td>24</td><td>${nb(z.I)}</td><td>${nb(z.C)}</td><td>${nb(z.N)}</td></tr>`).join("")}</table>`;
          return { enonce: `Essais d'un MCC :${tab}Rendement lors de l'essai <b>${k + 1}</b> (en %) ?`, reponse: eta, unite: "%", explication: `P<sub>a</sub> = 24 × ${nb(x.I)} = ${nb(Pa)} W ; Ω = 2π × ${nb(x.N)} / 60 = ${nb(W)} rad/s ; P<sub>u</sub> = ${nb(x.C)} × ${nb(W)} = ${nb(x.C * W)} W ; η = ${nb(eta, 3)} %.` }; } },
      { type: "qcm", fiche: "tsi-s8-mac-bilan", enonce: "Quelles pertes d'un moteur varient comme le <b>carré du courant</b> ?", choix: ["Les pertes par effet Joule (R·I²)", "Les pertes fer", "Les pertes mécaniques (frottements)", "Les pertes par ventilation"], bonne: 0, explication: "P<sub>J</sub> = R·I² dans les bobinages. Les pertes fer et mécaniques dépendent surtout de la tension et de la vitesse." },
      { type: "qcm", fiche: "tsi-s8-mac-bilan", enonce: "Pourquoi le stator et le rotor sont-ils constitués de tôles empilées ?", choix: ["Pour limiter les pertes fer (courants de Foucault et hystérésis)", "Pour réduire les pertes Joule dans le cuivre", "Uniquement pour alléger le moteur", "Pour isoler le moteur de la terre"], bonne: 0, explication: "Fiche synthèse : l'assemblage de tôles limite les pertes par courants de Foucault et par hystérésis (pertes fer)." },

      // ---------- MAS : vitesse, glissement, couplage ----------
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const f = r.pick([50, 50, 60, 25, 40]), p = r.int(1, 4); const Ns = 60 * f / p;
          return { enonce: `Moteur asynchrone à <b>p = ${p}</b> paire${p > 1 ? "s" : ""} de pôles alimenté en <b>${f} Hz</b>. Vitesse de synchronisme N<sub>S</sub> (tr/min) ?`, reponse: Ns, unite: "tr/min", explication: `N<sub>S</sub> = f / p = ${f} / ${p} = ${nb(f / p)} tr/s, soit × 60 = ${nb(Ns)} tr/min.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const p = r.int(1, 3), g0 = r.pick([0.02, 0.03, 0.04, 0.05, 0.06]); const Ns = 3000 / p, NR = Math.round(Ns * (1 - g0) / 5) * 5, gl = (Ns - NR) / Ns * 100;
          return { enonce: `Moteur asynchrone <b>50 Hz</b>, <b>p = ${p}</b>, tournant à <b>N<sub>R</sub> = ${nb(NR)} tr/min</b>. Glissement (en %) ?`, reponse: gl, unite: "%", tolerance: 3, explication: `N<sub>S</sub> = 60 × 50 / ${p} = ${nb(Ns)} tr/min ; g = (N<sub>S</sub> − N<sub>R</sub>) / N<sub>S</sub> = (${nb(Ns)} − ${nb(NR)}) / ${nb(Ns)} = ${nb(gl, 3)} %.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const p = r.int(1, 4), gp = r.pick([2, 3, 4, 5]); const Ns = 3000 / p, NR = Ns * (1 - gp / 100);
          return { enonce: `Moteur asynchrone <b>50 Hz</b> à <b>${2 * p} pôles</b> (p = ${p}), glissement nominal <b>g = ${gp} %</b>. Vitesse du rotor (tr/min) ?`, reponse: NR, unite: "tr/min", tolerance: 0.5, explication: `N<sub>S</sub> = 60 × 50 / ${p} = ${nb(Ns)} tr/min ; N<sub>R</sub> = N<sub>S</sub>·(1 − g) = ${nb(Ns)} × ${nb(1 - gp / 100)} = ${nb(NR)} tr/min.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const p = r.int(1, 4), g0 = r.pick([0.02, 0.03, 0.04, 0.05]); const Ns = 3000 / p, NR = Math.round(Ns * (1 - g0) / 5) * 5;
          return { enonce: `La plaque d'un moteur asynchrone (réseau <b>50 Hz</b>) indique <b>${nb(NR)} tr/min</b>. Nombre de paires de pôles p ?`, reponse: p, unite: "", tolerance: 1, explication: `N<sub>S</sub> est la vitesse de synchronisme juste au-dessus de N<sub>R</sub> (3 000, 1 500, 1 000 ou 750 tr/min) : N<sub>S</sub> = ${nb(Ns)} tr/min ; p = 60·f / N<sub>S</sub> = 3 000 / ${nb(Ns)} = ${p}.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const p = r.int(1, 3), Ns = r.pick([600, 900, 1200, 1800]); const f = p * Ns / 60;
          return { enonce: `Un variateur alimente un moteur asynchrone à <b>p = ${p}</b> paire${p > 1 ? "s" : ""} de pôles. Quelle fréquence régler pour une vitesse de synchronisme de <b>${nb(Ns)} tr/min</b> ?`, reponse: f, unite: "Hz", explication: `N<sub>S</sub> = 60·f / p ⇒ f = p·N<sub>S</sub> / 60 = ${p} × ${nb(Ns)} / 60 = ${nb(f)} Hz.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const cas = [["230 V / 400 V", "230 V / 400 V", 0, "chaque enroulement doit recevoir 230 V, c'est la tension simple V du réseau : étoile"], ["230 V / 400 V", "133 V / 230 V", 1, "chaque enroulement doit recevoir 230 V, c'est la tension composée U du réseau : triangle"], ["400 V / 690 V", "230 V / 400 V", 1, "chaque enroulement doit recevoir 400 V, c'est la tension composée U du réseau : triangle"], ["400 V / 690 V", "400 V / 690 V", 0, "chaque enroulement doit recevoir 400 V, c'est la tension simple V du réseau : étoile"], ["230 V / 400 V", "400 V / 690 V", 2, "les enroulements (230 V) recevraient 400 V en étoile et 690 V en triangle : aucun couplage ne convient"]]; const [pl, res, k, why] = r.pick(cas);
          return { type: "qcm", enonce: `Plaque d'un moteur asynchrone : <b>${pl}</b>. Réseau triphasé : <b>${res}</b>. Couplage à réaliser ?`, choix: ["Étoile", "Triangle", "Aucun couplage ne convient", "Indifférent : étoile ou triangle"], bonne: k, explication: `La première tension de la plaque est la tension nominale d'un enroulement ; ${why}.` }; } },
      { fiche: "tsi-s8-mac-mas", gen: (r) => { const U = r.pick([230, 400, 690]), et = r.pick([true, false]); const V = et ? U / R3 : U;
          return { enonce: `Moteur asynchrone couplé en <b>${et ? "étoile" : "triangle"}</b> sur un réseau de <b>${U} V</b> entre phases. Tension aux bornes d'un enroulement ?`, reponse: V, unite: "V", explication: et ? `En étoile, chaque enroulement est entre une phase et le point neutre : V = U / √3 = ${U} / √3 = ${nb(V)} V.` : `En triangle, chaque enroulement est branché entre deux phases : il reçoit U = ${U} V.` }; } },
      { type: "qcm", fiche: "tsi-s8-mac-mas", enonce: "Comment inverse-t-on le sens de rotation d'un moteur asynchrone triphasé ?", choix: ["En permutant deux phases de l'alimentation", "En permutant circulairement les trois phases", "En passant du couplage étoile au couplage triangle", "En inversant la polarité du neutre"], bonne: 0, explication: "Permuter deux phases inverse le sens du champ tournant, donc celui du rotor." },
      { type: "qcm", fiche: "tsi-s8-mac-mas", enonce: "Pourquoi ce moteur est-il dit « asynchrone » ?", choix: ["Son rotor tourne moins vite que le champ tournant", "Son rotor tourne plus vite que le champ tournant", "Ses trois phases ne sont pas synchronisées", "Il est alimenté en courant continu"], bonne: 0, explication: "Comme le disque de cuivre entraîné par l'aimant, le rotor tourne un peu moins vite que le champ : N<sub>R</sub> &lt; N<sub>S</sub>, d'où le glissement g." },
      { type: "qcm", fiche: "tsi-s8-mac-mas", enonce: "Un moteur asynchrone à <b>4 pôles</b> alimenté en 50 Hz tourne en charge nominale à environ…", choix: ["1 450 tr/min", "1 500 tr/min exactement", "2 900 tr/min", "50 tr/min"], bonne: 0, explication: "4 pôles → p = 2 → N<sub>S</sub> = 60 × 50 / 2 = 1 500 tr/min ; en charge, le glissement de quelques % donne ≈ 1 450 tr/min." },
      { type: "qcm", fiche: "tsi-s8-mac-mas", enonce: "À vide (sans charge), un moteur asynchrone tourne…", choix: ["Presque à la vitesse de synchronisme (g ≈ 0)", "Exactement à la moitié de N<sub>S</sub>", "Plus vite que N<sub>S</sub>", "À vitesse nulle"], bonne: 0, explication: "Cours : f<sub>s</sub> (synchronisme) correspond à la vitesse à vide ; plus la charge augmente, plus le glissement augmente." },

      // ---------- Choisir une machine ----------
      { fiche: "tsi-s8-mac-choix", gen: (r) => { const M = ["Moteur à courant continu", "Moteur asynchrone triphasé", "Moteur synchrone", "Moteur pas à pas", "Moteur universel", "Moteur asynchrone monophasé"]; const cas = [["Déplacer la tête d'une imprimante jet d'encre par pas précis, sans capteur", 3, "il avance d'un pas à chaque impulsion"], ["Aspirateur alimenté en 230 V ~, inducteur branché en série avec l'induit", 4, "moteur à excitation série qui fonctionne aussi en alternatif"], ["Pompe industrielle robuste alimentée directement par le réseau 400 V triphasé", 1, "robuste, peu coûteux, directement sur le réseau triphasé"], ["Petit robot sur batterie (robot Sumo) avec vitesse réglée par un hacheur", 0, "alimenté en continu, vitesse réglée par la tension moyenne"], ["Alternateur d'une centrale, entraîné par une turbine", 2, "entraîné, il produit l'électricité (alternateur)"], ["Ventilateur domestique sur prise 230 V, avec deux bobines et un condensateur", 5, "le condensateur permet de créer le champ tournant en monophasé"], ["Axe de robot sans balais (brushless), piloté par un variateur et un codeur", 2, "rotor à aimants, commuté par le variateur grâce au codeur"]]; const [txt, k, pq] = r.pick(cas); const autres = r.melange(M.filter((x, i) => i !== k)).slice(0, 3);
          return { type: "qcm", enonce: `Quelle machine convient ? <i>${txt}.</i>`, choix: [M[k], ...autres], bonne: 0, explication: `${M[k]} : ${pq}.` }; } },
      { fiche: "tsi-s8-mac-choix", gen: (r) => { const M = ["Moteur à courant continu", "Moteur asynchrone triphasé", "Moteur synchrone", "Moteur pas à pas", "Moteur universel", "Moteur asynchrone monophasé"]; const cas = [["Stator à 3 bobines décalées de 120°, rotor à barres d'aluminium court-circuitées (cage)", 1], ["Aimants au stator (inducteur), induit bobiné au rotor, collecteur et balais", 0], ["Inducteur alimenté en continu au rotor, stator alimenté en alternatif ; ne démarre pas seul", 2], ["Rotor à N pôles aimantés, bobines du stator alimentées l'une après l'autre", 3], ["Moteur « à courant continu » dont l'inducteur est en série avec l'induit, alimenté en 230 V ~", 4], ["Deux bobines et un condensateur créent le champ tournant à partir du 230 V", 5]]; const [txt, k] = r.pick(cas); const autres = r.melange(M.filter((x, i) => i !== k)).slice(0, 3);
          return { type: "qcm", enonce: `Quelle machine correspond à cette description ? <i>${txt}.</i>`, choix: [M[k], ...autres], bonne: 0, explication: `C'est la constitution du ${M[k].charAt(0).toLowerCase() + M[k].slice(1)} (fiche synthèse machines).` }; } },
      { type: "qcm", fiche: "tsi-s8-mac-choix", enonce: "Principal atout du moteur à courant continu selon la fiche synthèse ?", choix: ["Il est facile à piloter en variation de vitesse", "Il n'a aucune pièce d'usure", "Il se branche directement sur le réseau 400 V triphasé", "Il est réservé aux très fortes puissances"], bonne: 0, explication: "MCC : plutôt pour les petites puissances, vitesse ∝ tension, couple ∝ courant : très simple à commander. En revanche, balais et collecteur s'usent." },
      { type: "qcm", fiche: "tsi-s8-mac-choix", enonce: "Quel inconvénient du MCC le moteur <b>brushless</b> supprime-t-il ?", choix: ["L'usure des balais et du collecteur", "La nécessité d'un champ magnétique", "Le besoin d'un courant pour créer un couple", "La possibilité de fonctionner en génératrice"], bonne: 0, explication: "Brushless = « sans balais » : moteur synchrone à aimants dont la commutation est faite électroniquement par le variateur (capteur/codeur)." },
      { type: "qcm", fiche: "tsi-s8-mac-choix", enonce: "Un moteur synchrone branché directement sur le réseau…", choix: ["Ne peut pas démarrer seul", "Démarre toujours plus vite qu'un moteur asynchrone", "Tourne moins vite que le champ tournant", "Fonctionne uniquement en courant continu"], bonne: 0, explication: "Son rotor doit tourner exactement à la vitesse du champ : il faut un variateur (brushless) ou un dispositif de lancement." },

      // ---------- Réversibilité, 4 quadrants ----------
      { fiche: "tsi-s8-mac-quadrants", gen: (r) => { const sc = r.pick([1, -1]), sw = r.pick([1, -1]); const C = sc * r.pick([2, 5, 10, 20]), W = sw * r.pick([50, 100, 150]); const k = sw > 0 ? (sc > 0 ? 0 : 1) : (sc < 0 ? 2 : 3);
          return { type: "qcm", enonce: `Plan couple (axe horizontal) – vitesse (axe vertical). Une machine exerce <b>C = ${nb(C)} N·m</b> et tourne à <b>Ω = ${nb(W)} rad/s</b>. Quadrant et mode de fonctionnement ?`, choix: ["Quadrant 1 : fonctionnement moteur", "Quadrant 2 : fonctionnement génératrice", "Quadrant 3 : fonctionnement moteur", "Quadrant 4 : fonctionnement génératrice"], bonne: k, explication: `C·Ω = ${nb(C * W)} W : ${C * W > 0 ? "positif → moteur" : "négatif → génératrice"} ; Ω ${W > 0 ? "> 0 (sens 1)" : "< 0 (sens 2)"} et C ${C > 0 ? "> 0" : "< 0"} → quadrant ${k + 1}.` }; } },
      { fiche: "tsi-s8-mac-quadrants", gen: (r) => { const su = r.pick([1, -1]), si = r.pick([1, -1]); const U = su * r.pick([12, 24, 48]), I = si * r.pick([2, 3, 5]); const k = su > 0 ? (si > 0 ? 0 : 1) : (si < 0 ? 2 : 3);
          return { type: "qcm", enonce: `MCC (flèches de U et I en convention récepteur) : <b>U = ${nb(U)} V</b> et <b>I = ${nb(I)} A</b>. Fonctionnement ?`, choix: ["Moteur, sens +", "Génératrice, sens +", "Moteur, sens −", "Génératrice, sens −"], bonne: k, explication: `P = U·I = ${nb(U * I)} W : ${U * I > 0 ? "la machine reçoit de l'énergie électrique → moteur" : "elle fournit de l'énergie électrique (elle peut recharger la batterie) → génératrice"} ; le sens de rotation suit le signe de U : sens ${U > 0 ? "+" : "−"}.` }; } },
      { fiche: "tsi-s8-mac-quadrants", gen: (r) => { const cas = [["Le moteur d'un treuil monte la charge", 0], ["La charge d'un treuil entraîne la machine (produit couple × vitesse négatif)", 1], ["Un véhicule électrique freine en rechargeant sa batterie", 1], ["Une trottinette électrique accélère", 0], ["Une voiture électrique descend une longue pente à vitesse constante en récupérant de l'énergie", 1], ["Un véhicule électrique accélère en marche arrière", 0], ["Une petite éolienne entraîne la machine électrique", 1]]; const [txt, k] = r.pick(cas);
          return { type: "qcm", enonce: `${txt}. Comment fonctionne la machine électrique ?`, choix: ["En moteur : énergie électrique → mécanique", "En génératrice : énergie mécanique → électrique", "En transformateur : énergie électrique → électrique", "En frein mécanique : énergie mécanique → chaleur uniquement"], bonne: k, explication: k === 0 ? "La machine reçoit de l'énergie électrique et entraîne la charge : C·Ω > 0, fonctionnement moteur (quadrant 1 ou 3)." : "C'est la mécanique (inertie, charge, vent) qui entraîne la machine : C·Ω < 0, elle fonctionne en génératrice (quadrant 2 ou 4) et renvoie de l'énergie." }; } },
      { fiche: "tsi-s8-mac-quadrants", gen: (r) => { const m = r.pas(1200, 1800, 100), v = r.pick([50, 70, 90, 110]), e = r.pick([0.5, 0.6, 0.7]); const V = v / 3.6, Ec = 0.5 * m * V * V, Wh = e * Ec / 3600;
          return { enonce: `Voiture électrique de <b>${nb(m)} kg</b> à <b>${v} km/h</b>, freinée jusqu'à l'arrêt par sa machine fonctionnant en génératrice. <b>${nb(e * 100)} %</b> de l'énergie cinétique revient à la batterie. Énergie récupérée (Wh) ?`, reponse: Wh, unite: "Wh", explication: `E<sub>cin</sub> = ½ × ${nb(m)} × ${nb(V)}² = ${nb(Ec)} J ; E<sub>récup</sub> = ${nb(e)} × ${nb(Ec)} = ${nb(e * Ec)} J = ${nb(Wh)} Wh (1 Wh = 3 600 J).` }; } },
      { fiche: "tsi-s8-mac-quadrants", gen: (r) => { const m = r.pas(200, 1000, 50), v = r.pick([0.5, 0.8, 1, 1.5]), e = r.pick([0.75, 0.8, 0.85, 0.9]); const Pm = m * g * v, Pe = e * Pm;
          return { enonce: `Une charge de <b>${nb(m)} kg</b> descend à <b>${nb(v)} m/s</b> constante ; la machine du treuil fonctionne en génératrice (rendement global <b>${nb(e)}</b>). Puissance électrique renvoyée au réseau (kW) ?`, reponse: Pe / 1000, unite: "kW", explication: `P<sub>méca</sub> = m·g·V = ${nb(m)} × 9,81 × ${nb(v)} = ${nb(Pm)} W ; en génératrice l'énergie va de la mécanique vers le réseau : P<sub>élec</sub> = η × P<sub>méca</sub> = ${nb(Pe)} W = ${nb(Pe / 1000)} kW.` }; } },
      { type: "qcm", fiche: "tsi-s8-mac-quadrants", enonce: "Phase de récupération : si le variateur ne peut pas renvoyer l'énergie au réseau, elle est…", choix: ["Dissipée en chaleur dans une résistance (freinage rhéostatique)", "Stockée dans les enroulements du moteur", "Transformée en énergie potentielle", "Supprimée par le variateur sans échauffement"], bonne: 0, explication: "Fiche synthèse : l'énergie récupérée est renvoyée au réseau si le variateur le permet, sinon dissipée en chaleur (freinage rhéostatique)." },
      { type: "qcm", fiche: "tsi-s8-mac-quadrants", enonce: "« Ce moteur peut fonctionner dans les quatre quadrants » signifie qu'il…", choix: ["Tourne dans les deux sens, en moteur comme en génératrice", "Possède quatre paires de pôles", "Accepte quatre tensions d'alimentation", "Fonctionne en moteur seulement, dans les deux sens"], bonne: 0, explication: "Deux sens de rotation × deux modes (moteur / génératrice) = 4 quadrants du plan couple–vitesse." }
    ],
    fiches: [
      { id: "tsi-s8-mac-mcc", titre: "MCC : constitution et équations",
        recto: "Quelles sont les trois équations du moteur à courant continu ?",
        verso: `<div class="formule">U = E + R·I &nbsp;·&nbsp; E = K<sub>e</sub>·Ω &nbsp;·&nbsp; C = k<sub>c</sub>·I</div>
          <ul><li>Ω = 2π·N / 60 ; en unités SI, K<sub>e</sub> = k<sub>c</sub> = k.</li>
          <li>Stator = inducteur (aimants), rotor = induit ; collecteur + balais inversent le courant à chaque demi-tour.</li>
          <li>La tension règle la vitesse (hacheur MLI) ; le couple résistant impose le courant.</li></ul>
          <p class="astuce">Au démarrage, Ω = 0 donc E = 0 : I<sub>d</sub> = U / R, très élevé.</p>`,
        quiz: [{ enonce: "E = K<sub>e</sub>·Ω : la f.é.m. est proportionnelle…", choix: ["à la vitesse", "au courant", "au couple"], bonne: 0 },
               { enonce: "Si le couple résistant augmente, le courant…", choix: ["augmente", "diminue", "ne change pas"], bonne: 0 },
               { enonce: "Un pont en H permet…", choix: ["les deux sens de rotation", "de régler la fréquence", "de mesurer la vitesse"], bonne: 0 }] },
      { id: "tsi-s8-mac-bilan", titre: "Bilan de puissances et rendement",
        recto: "Comment se répartit la puissance absorbée par un moteur ? Comment calculer son rendement ?",
        verso: `<div class="formule">η = P<sub>u</sub> / P<sub>a</sub> &nbsp;·&nbsp; P<sub>u</sub> = C·Ω &nbsp;·&nbsp; P<sub>a</sub> = P<sub>u</sub> + pertes</div>
          <ul><li><b>MCC</b> : P<sub>a</sub> = U·I (+ u·i si l'inducteur est bobiné).</li>
          <li><b>MAS</b> : P<sub>a</sub> = √3·U·I·cos φ.</li>
          <li>Pertes : Joule (R·I²), fer (Foucault, hystérésis), mécaniques (frottements, ventilation).</li></ul>
          <p class="astuce">La puissance inscrite sur la plaque est la puissance <b>utile</b> (mécanique).</p>`,
        quiz: [{ enonce: "Pertes proportionnelles à I² :", choix: ["Joule", "fer", "mécaniques"], bonne: 0 },
               { enonce: "MCC 24 V ; 5 A ; P<sub>u</sub> = 96 W ⇒ η = …", choix: ["80 %", "96 %", "125 %"], bonne: 0 }] },
      { id: "tsi-s8-mac-mas", titre: "MAS : vitesse, glissement, couplage",
        recto: "Comment calcule-t-on la vitesse de synchronisme et le glissement d'un moteur asynchrone ? Comment le coupler ?",
        verso: `<div class="formule">N<sub>S</sub> = f / p (tr/s) = 60·f / p (tr/min) &nbsp;·&nbsp; g = (N<sub>S</sub> − N<sub>R</sub>) / N<sub>S</sub></div>
          <ul><li>50 Hz : p = 1 → 3 000 ; p = 2 → 1 500 ; p = 3 → 1 000 tr/min.</li>
          <li>Inverser le sens : permuter 2 phases.</li>
          <li>Plaque « 230/400 V » : 230 V = tension d'un enroulement → <b>étoile</b> sur réseau 400 V, triangle sur réseau 230 V.</li></ul>
          <p class="astuce">Plaque à 1 450 tr/min → N<sub>S</sub> = 1 500 tr/min, p = 2, g ≈ 3,3 %.</p>`,
        quiz: [{ enonce: "p = 2 en 50 Hz : N<sub>S</sub> = …", choix: ["1 500 tr/min", "3 000 tr/min", "750 tr/min"], bonne: 0 },
               { enonce: "Moteur 230/400 V sur réseau 400 V entre phases :", choix: ["étoile", "triangle", "impossible"], bonne: 0 },
               { enonce: "Pour inverser le sens d'un MAS :", choix: ["permuter 2 phases", "permuter les 3 phases", "passer en triangle"], bonne: 0 }] },
      { id: "tsi-s8-mac-choix", titre: "Quelle machine pour quel usage ?",
        recto: "Quels sont les principaux moteurs électriques et leurs usages typiques ?",
        verso: `<ul><li><b>MCC</b> : petites puissances, vitesse facile à varier ; balais à entretenir.</li>
          <li><b>MAS triphasé</b> : industrie, robuste, direct sur réseau 400 V (monophasé : + condensateur).</li>
          <li><b>Synchrone</b> : alternateur ; brushless (aimants + variateur + codeur) ; ne démarre pas seul.</li>
          <li><b>Pas à pas</b> : positionnement par pas (imprimante).</li>
          <li><b>Universel</b> : inducteur en série, 230 V ~ (électroménager).</li></ul>
          <p class="astuce">Presque toute l'électricité est produite par des machines tournantes (alternateurs).</p>`,
        quiz: [{ enonce: "Tête d'imprimante jet d'encre :", choix: ["pas à pas", "asynchrone triphasé", "universel"], bonne: 0 },
               { enonce: "Moteur sans balais piloté par variateur + codeur :", choix: ["synchrone (brushless)", "MCC", "universel"], bonne: 0 }] },
      { id: "tsi-s8-mac-quadrants", titre: "Réversibilité : les 4 quadrants",
        recto: "Quand une machine électrique fonctionne-t-elle en moteur ou en génératrice ? Comment lire les 4 quadrants ?",
        verso: `<div class="formule">C·Ω &gt; 0 → moteur (Q1, Q3) &nbsp;·&nbsp; C·Ω &lt; 0 → génératrice (Q2, Q4)</div>
          <ul><li>Q1 : moteur sens 1 ; Q2 : génératrice sens 1 ; Q3 : moteur sens 2 ; Q4 : génératrice sens 2.</li>
          <li>MCC : U·I &gt; 0 → moteur ; U·I &lt; 0 → génératrice (recharge la batterie).</li>
          <li>Énergie récupérée (inertie, charge qui descend) : renvoyée au réseau ou dissipée (freinage rhéostatique).</li></ul>
          <p class="astuce">Regarde le signe du produit couple × vitesse.</p>`,
        quiz: [{ enonce: "C > 0 et Ω < 0 :", choix: ["génératrice", "moteur", "arrêt"], bonne: 0 },
               { enonce: "Freinage récupératif d'un véhicule électrique :", choix: ["génératrice", "moteur", "transformateur"], bonne: 0 }] }
    ]
  });
})();
