/* Projet planeur, Seconde SI : l'atelier d'idées (onglet « Créer »).
   Trois idées dessinées à l'échelle, comparées, puis une idée choisie. Gardé sur l'appareil (localStorage). */
(function () {
  "use strict";
  const racine = document.getElementById("atelier"); if (!racine) return;
  const fr = (x, d = 0) => Number(x).toFixed(d).replace(".", ",");
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CLE = "sip_2si_planeur_atelier", XA = 88, XS = 182, M_FUS = 12.6, LEST = 1.7, P3 = window.Planeur3D;
  const COUL = [["Bleu", "#1d4f9c"], ["Rouge", "#c0392b"], ["Vert", "#2e8b57"], ["Turquoise", "#17a589"], ["Jaune", "#f1c40f"], ["Orange", "#f08c00"], ["Violet", "#7d3c98"], ["Noir", "#2b2b2b"], ["Blanc", "#eef1f4"]];
  const NEZ = { biseau: ["En biseau", "L0 0 L0 10 L6 14 L40 14 L52 10"], rond: ["Arrondi", "L7 0 Q0 0 0 7 Q0 14 9 14 L40 14 L52 10"], pointu: ["Pointu", "L14 0 L0 5 L10 14 L40 14 L52 10"] };
  const DER = { droite: ["Droite", "L190 8 L202 32 L210 32 L210 0"], requin: ["Aileron de requin", "L186 8 Q198 14 204 34 L210 34 Q207 20 210 8 L210 0"], ronde: ["Arrondie", "L190 8 Q192 30 203 30 Q210 30 210 20 L210 0"], basse: ["Longue et basse", "L182 8 L200 24 L210 24 L210 0"] };
  const BASE = { nom: "", devise: "", b: 200, c0: 45, k: 1, fl: 0, rond: 0, sb: 80, sc: 25, sk: 1, nez: "biseau", der: "droite", cf: "#1d4f9c", ca: "#f08c00" };
  const IDEES = [
    ["Le planeur de compétition", "Une aile très longue, un peu plus étroite au bout.", "Il freine peu : c'est la forme qui va le plus loin.", { b: 210, c0: 45, k: 0.65, fl: 6, rond: 0, sk: 0.7 }],
    ["L'albatros", "Des ailes immenses et fines, aux bouts arrondis.", "Très grand allongement. Attention : une aile fine se plie au lancer.", { b: 210, c0: 40, k: 0.6, fl: 4, rond: 1, sb: 70, sc: 22, der: "ronde", nez: "rond" }],
    ["La frégate (ʻōtaha)", "Des ailes longues, pointues, tirées vers l'arrière.", "Belle silhouette, bonne finesse. Le bout pointu est fragile.", { b: 210, c0: 48, k: 0.3, fl: 34, sk: 0.4, sb: 90, der: "requin", nez: "pointu" }],
    ["Le martinet", "Une aile en croissant, tirée vers l'arrière.", "Belle allure. La flèche recule le point d'équilibre : surveille le lest dans l'atelier 3D.", { b: 190, c0: 46, k: 0.4, fl: 27, sk: 0.5, der: "requin", nez: "pointu" }],
    ["La raie manta", "Une aile large en triangle, très solide.", "Elle porte beaucoup et ne se plie pas, mais elle freine : petit allongement.", { b: 170, c0: 50, k: 0.3, fl: 20, sb: 60, sc: 20, der: "basse", nez: "rond" }],
    ["Le poisson volant (mārara)", "Des ailes larges et rondes, comme des nageoires.", "Facile à lancer, vol lent. Moins de finesse qu'une aile étroite.", { b: 180, c0: 50, k: 0.6, fl: 0, rond: 1, sb: 90, sc: 26, sk: 0.6, der: "ronde", nez: "rond" }]
  ];

  const CARTES = ["Et si ton aile n'avait aucun angle droit ?", "Et si ton planeur ressemblait à un animal de chez nous ?", "Et si on le reconnaissait à 20 m, rien qu'à sa forme ?", "Et si tu enlevais tout ce qui ne sert à rien ?", "Et si la dérive était la signature de ton équipe ?", "Et si tu mélangeais deux idées de ton équipe ?", "Et si l'aile était la plus longue possible ?", "Et si l'aile était la plus solide possible ?", "Et si ton planeur portait le nom d'un oiseau, d'un vent ou d'un lieu de Tahiti ?", "Et si tu faisais l'inverse de ta première idée ?", "Et si ton planeur devait plaire à un enfant de 6 ans ?", "Et si chaque membre de l'équipe dessinait une idée, sans regarder les autres ?"];
  let pret = false;
  let A; try { A = JSON.parse(localStorage.getItem(CLE)); } catch (e) { A = null; }
  if (!A || !Array.isArray(A.idees) || A.idees.length !== 3) A = { n: 0, choisi: null, pourquoi: "", idees: [0, 1, 2].map(() => Object.assign({}, BASE)) };
  A.idees = A.idees.map((d) => Object.assign({}, BASE, d));
  const garder = () => { try { localStorage.setItem(CLE, JSON.stringify(A)); } catch (e) { /* sans stockage : on continue */ } if (pret && window.PLANEUR_SYNC) window.PLANEUR_SYNC(); };

  /* ---------- géométrie ---------- */
  function calc(d) {
    const ct = d.c0 * d.k, r = d.rond ? ct / 2 : 0, S = (d.b * (d.c0 + ct) / 2 - 2 * r * r * (2 - Math.PI / 2)) / 100;   // cm²
    const sct = d.sc * d.sk, Ss = d.sb * (d.sc + sct) / 2 / 100, ma = S * 100 * 0.8 * 1.24 / 1000, ms = Ss * 100 * 0.6 * 1.24 / 1000, m = M_FUS + ma + ms;
    const R = { ct, S, Ss, ma, ms, m, lest: LEST, b: d.b, al: d.b * d.b / (S * 100), cm: S * 100 / d.b, rapport: Ss / S * 100, fin: XA + d.fl + ct };
    if (P3) try { const e = P3.etude(d); R.S = e.P.aile.a / 100; R.Ss = e.P.stab.a / 100; R.ma = e.P.aile.m; R.ms = e.P.stab.m; R.m = e.m; R.lest = Math.max(0, e.lest); R.b = e.env; R.al = e.env * e.env / e.P.aile.a; R.cm = e.P.aile.a / e.env; R.rapport = R.Ss / R.S * 100; R.e = e; } catch (x) { /* esquisse impossible : valeurs des curseurs */ }
    return R;
  }
  const chemin = (L, x0) => "M" + L.map((p) => (x0 + p[0]).toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
  const libres = (d, k, x0) => P3.vues(d)[k].map((L) => chemin(L, x0)).join(" ");      // pièce redessinée dans l'atelier 3D
  function aileD(d) {
    if (P3 && d.cao && d.cao.aile) return libres(d, "aile", XA);   // contour de l'aile vue de dessus, en mm (x le long du fuselage, y le long de l'envergure)
    const ct = d.c0 * d.k, h = d.b / 2, x1 = XA + d.fl, r = d.rond ? ct / 2 : 0, yb = h - r;
    const bout = (s) => r ? `L${x1} ${s * yb} A${r} ${r} 0 0 ${s > 0 ? 0 : 1} ${x1 + ct} ${s * yb}` : `L${x1} ${s * h} L${x1 + ct} ${s * h}`;
    return `M${XA} 0 ${bout(-1)} L${XA + d.c0} 0 Z M${XA} 0 ${bout(1)} L${XA + d.c0} 0 Z`;
  }
  function stabD(d) { if (P3 && d.cao && d.cao.stab) return libres(d, "stab", XS); const t = d.sc * d.sk, h = d.sb / 2, x1 = XS + d.sc - t; return `M${XS} 0 L${x1} ${-h} L${XS + d.sc} ${-h} L${XS + d.sc} ${h} L${x1} ${h} Z`; }
  const bord = (c) => (c === "#eef1f4" || c === "#f1c40f" ? "var(--ink-3)" : "none");
  function dessus(d, E, ox, yc) {
    return `<g transform="translate(${ox} ${yc}) scale(${E})"><rect x="0" y="-2.5" width="210" height="5" fill="${d.cf}" stroke="${bord(d.cf)}" stroke-width=".5"/>
      <path d="${aileD(d)}" fill="${d.ca}" fill-opacity=".88" stroke="${bord(d.ca)}" stroke-width=".6"/><path d="${stabD(d)}" fill="${d.ca}" fill-opacity=".88" stroke="${bord(d.ca)}" stroke-width=".6"/>
      <rect x="${d.der === "basse" ? 182 : 190}" y="-.6" width="${d.der === "basse" ? 28 : 20}" height="1.2" fill="${d.cf}" stroke="${bord(d.cf)}" stroke-width=".3"/></g>`;
  }
  function cote(d, F, fx, fy) {
    return `<g transform="translate(${fx} ${fy}) scale(${F} ${-F})"><path d="${P3 && d.cao && d.cao.fus ? libres(d, "fus", 0) : `M52 0 ${NEZ[d.nez][1]} L140 10 L150 5 L180 5 L180 8 ${DER[d.der][1]} Z`}" fill="${d.cf}" stroke="${bord(d.cf)}" stroke-width=".5"/>
      <circle cx="12" cy="8" r="2.1" fill="var(--paper)"/><line x1="${XA}" y1="${5.7 + d.c0 * 0.0523}" x2="${XA + d.c0}" y2="5.7" stroke="${d.ca}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="${XS}" y1="4.4" x2="${XS + d.sc}" y2="4.4" stroke="${d.ca}" stroke-width="1.3" stroke-linecap="round"/></g>`;
  }
  let dessinEtroit = false;
  const estEtroit = () => { const el = document.getElementById("at-dessin"), w = el ? el.clientWidth : 0; return w > 0 && w < 520 && !!window.matchMedia && window.matchMedia("(max-width: 820px)").matches; };          // téléphone (une seule colonne) ; sur ordinateur, le dessin reste en largeur car sa carte reste collée en haut de l'écran
  function dessin(d) {
    const etroit = dessinEtroit = estEtroit();          // écran étroit : la vue de côté passe sous la vue de dessus, et le texte reste lisible
    const E = 1.5, ox = 22, yc = 215, F = 1.55, fx = etroit ? 22 : 372, fy = etroit ? 520 : 300, c = calc(d), xn = etroit ? 190 : fx + 105 * F;
    return `<svg viewBox="0 0 ${etroit ? "380 640" : "720 390"}" role="img" aria-label="Ton planeur vu de dessus et vu de côté : envergure ${d.b} millimètres, aile de ${fr(c.S, 0)} centimètres carrés">
      <defs><pattern id="at-car" width="${10 * E}" height="${10 * E}" patternUnits="userSpaceOnUse" x="${ox}" y="${yc}"><path d="M${10 * E} 0 H0 V${10 * E}" fill="none" stroke="var(--at-grille)" stroke-width="1"/></pattern></defs>
      <rect x="${ox - 15}" y="${yc - 165}" width="${225 * E + 8}" height="330" fill="url(#at-car)"/>
      <text class="at-t" x="${ox - 15}" y="32">VU DE DESSUS · 1 carreau = 1 cm</text><text class="at-t" x="${fx}" y="${fy - 78}">VU DE CÔTÉ</text>
      ${dessus(d, E, ox, yc)}${cote(d, F, fx, fy)}
      <text class="at-nom" x="${xn}" y="${etroit ? fy + 54 : 92}" text-anchor="middle">${esc(d.nom) || "Planeur sans nom"}</text>
      <text class="at-dev" x="${xn}" y="${etroit ? fy + 80 : 118}" text-anchor="middle">${esc(d.devise)}</text>
      <g class="at-cote"><line x1="${ox + (XA + d.fl + c.ct / 2) * E + 26}" y1="${yc - d.b / 2 * E}" x2="${ox + (XA + d.fl + c.ct / 2) * E + 26}" y2="${yc + d.b / 2 * E}"/><text x="${etroit ? 8 : fx}" y="${etroit ? fy + 108 : fy + 44}">envergure ${d.b} mm · corde au centre ${d.c0} mm · au bout ${fr(c.ct, 0)} mm</text></g>
    </svg>`;
  }

  /* ---------- conseils ---------- */
  function conseils(d) {
    const c = calc(d), L = [];
    L.push(c.fin <= 172 ? ["ok", "L'aile laisse la place au stabilisateur."] : ["ko", "Le bout de l'aile recule trop : il touche le stabilisateur. Réduis la flèche."]);
    L.push(c.ct >= 12 ? ["ok", "Le bout de l'aile est assez large pour s'imprimer."] : ["ko", "Le bout de l'aile fait moins de 12 mm : il cassera. Élargis-le."]);
    L.push(c.rapport < 15 ? ["ko", `Stabilisateur trop petit (${fr(c.rapport, 0)} % de l'aile) : le planeur sera instable. Vise 20 à 30 %.`] : c.rapport > 35 ? ["av", `Stabilisateur grand (${fr(c.rapport, 0)} % de l'aile) : stable, mais il alourdit la queue.`] : ["ok", `Stabilisateur à ${fr(c.rapport, 0)} % de la surface de l'aile : bon repère.`]);
    L.push(c.m + c.lest <= 30 ? ["ok", `Masse estimée avec le lest : ${fr(c.m + c.lest, 1)} g, sous les 30 g.`] : ["ko", `Masse estimée avec le lest : ${fr(c.m + c.lest, 1)} g. C'est plus que 30 g : réduis l'aile.`]);
    if (c.e) c.e.L.filter((x) => x[0] === "ko" && /fente|glisser|avant|lest :|épaisseur|volume/.test(x[1])).forEach((x) => L.push(["ko", x[1] + " (voir l'onglet « Atelier 3D »)"]));
    if (c.al < 3) L.push(["av", "Aile courte et large : elle freine. C'est ton choix, mais tu perds de la finesse."]);
    if (d.fl > 25) L.push(["av", "Aile en flèche : le point d'équilibre recule. Prévois plus de lest, et vérifie dans le simulateur."]);
    return L;
  }

  /* ---------- écran ---------- */
  const CURS = [["Aile", [["b", "Envergure", "mm", 100, 210, 5], ["c0", "Corde au centre", "mm", 25, 70, 1], ["k", "Largeur du bout (part de la corde au centre)", "%", 0.2, 1, 0.05], ["fl", "Flèche : recul du bout", "mm", 0, 60, 2]]],
    ["Stabilisateur", [["sb", "Envergure", "mm", 50, 100, 5], ["sc", "Corde", "mm", 15, 26, 1], ["sk", "Largeur du bout", "%", 0.3, 1, 0.05]]]];
  const val = (k, x) => (k === "k" || k === "sk" ? fr(x * 100, 0) : fr(x, 0));
  const puces = (cle, obj, d) => Object.keys(obj).map((k) => `<button type="button" data-ch="${cle}" data-v="${k}" class="${d[cle] === k ? "on" : ""}">${obj[k][0]}</button>`).join("");
  const couleurs = (cle, d) => COUL.map((c) => `<button type="button" class="at-co ${d[cle] === c[1] ? "on" : ""}" data-ch="${cle}" data-v="${c[1]}" style="background:${c[1]}" title="${c[0]}" aria-label="${c[0]}"></button>`).join("");

  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">Ton planeur ne doit ressembler à aucun autre</h2>
      <p>Le planeur de départ est le même pour tout le monde. <b>Le tien doit porter ta marque</b> : une forme, des couleurs, un nom. Les ingénieurs travaillent comme ça :</p>
      <ol class="at-dem"><li><b>Cherche trois idées vraiment différentes.</b> Pas trois fois la même avec 5 mm d'écart.</li><li><b>Compare-les</b> : laquelle va loin, laquelle est solide, laquelle te plaît.</li><li><b>Choisis-en une et explique pourquoi.</b> Puis dessine-la dans l'atelier 3D.</li></ol>
    </div>
    <div class="carte"><h2 style="margin-top:0">Pour trouver des idées : regarde ce qui vole déjà</h2>
      <p class="discret" style="margin-top:0">Touche une carte pour partir de cette forme dans l'idée en cours. Puis transforme-la : une copie exacte n'est pas une création.</p>
      <div class="at-insp">${IDEES.map((x, i) => `<button type="button" data-insp="${i}"><svg viewBox="0 0 230 190" aria-hidden="true">${dessus(Object.assign({}, BASE, x[3]), 1, 10, 95)}</svg><b>${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></button>`).join("")}</div>
    </div>
    <div class="carte"><h2 style="margin-top:0">Une méthode quand on n'a pas d'idée</h2>
      <p><b>Les règles de la recherche d'idées</b>, celles des bureaux d'études : on ne critique aucune idée pendant la recherche, on en cherche beaucoup, on rebondit sur celles des autres. Le tri vient après.</p>
      <div class="at-carte"><div id="at-etsi" aria-live="polite">Bloqué ? Tire une carte.</div><button type="button" class="btn" id="at-tirer">Tirer une carte « Et si… »</button></div>
      <p style="margin-bottom:.2em"><b>Mes deux références</b> : d'où vient ton idée, et ce que tu lui empruntes.</p>
      <p><label>Référence 1<input type="text" id="at-ref1" class="at-champ" placeholder="exemple : la frégate, pour ses ailes longues et pointues"></label></p>
      <p><label>Référence 2<input type="text" id="at-ref2" class="at-champ" placeholder="exemple : un planeur de compétition vu en photo, pour son aile étroite"></label></p>
    </div>
    <div class="at-onglets" role="tablist">${["A", "B", "C"].map((l, i) => `<button type="button" role="tab" data-idee="${i}">Idée ${l}</button>`).join("")}<button type="button" class="at-raz" id="at-raz">Repartir du planeur de départ</button></div>
    <div class="at-duo"><div class="carte at-colle"><div id="at-dessin"></div><div class="at-tuiles" id="at-tuiles"></div></div>
      <div><div class="carte at-bloc"><h3>Son nom</h3><label>Nom du planeur<input type="text" id="at-nom" maxlength="22" placeholder="exemple : Mārara 2"></label><label>Sa devise, ou le nom de l'équipe<input type="text" id="at-devise" maxlength="40" placeholder="exemple : plus loin que le récif"></label></div>
        <div id="at-curs"></div>
        <div class="carte at-bloc"><h3>Formes</h3><p>Bouts de l'aile</p><div class="at-puces" id="at-rond"></div><p>Nez</p><div class="at-puces" id="at-nez"></div><p>Dérive</p><div class="at-puces" id="at-der"></div></div>
        <div class="carte at-bloc"><h3>Couleurs du fil</h3><p>Fuselage</p><div class="at-puces" id="at-cf"></div><p>Aile et stabilisateur</p><div class="at-puces" id="at-ca"></div></div>
      </div></div>
    <div class="carte"><h2 style="margin-top:0">Ce que le dessin te dit</h2><ul class="at-cons" id="at-cons"></ul>
      <p class="discret">Les masses sont des estimations pour une aile de 0,8 mm et un stabilisateur de 0,6 mm, avec le fuselage de départ. La vraie valeur, c'est l'atelier 3D qui la donne (bouton « Propriétés de masse »).</p></div>
    <div class="carte"><h2 style="margin-top:0">Compare tes trois idées, puis choisis</h2><div class="pl-scroll"><table class="pl" id="at-comp"></table></div>
      <p><label>Pourquoi je choisis cette idée :<br><input type="text" id="at-pourquoi" style="width:100%" placeholder="exemple : elle va presque aussi loin que l'idée A, et son aile ne se pliera pas"></label></p>
      <p class="no-print"><button type="button" class="btn" id="at-sim">Tester l'idée en cours dans le simulateur →</button> <button type="button" class="btn sec" id="at-impr">Imprimer la fiche de mon planeur</button></p>
      <p class="astuce"><b>Et après ?</b> Passe à l'onglet « Atelier 3D » : tu y retrouves cette idée, tu dessines son fuselage, tu peux retoucher l'esquisse de l'aile point par point, et tu télécharges les fichiers à imprimer. Le nom se marque au feutre après l'impression.</p></div>`;

  const $ = (id) => document.getElementById(id);
  $("at-curs").innerHTML = CURS.map((g) => `<div class="carte at-bloc"><h3>${g[0]}</h3>${g[1].map((p) => `<label class="at-l"><span>${p[1]}<b data-o="${p[0]}"></b></span><input type="range" min="${p[3]}" max="${p[4]}" step="${p[5]}" data-k="${p[0]}" aria-label="${g[0]} : ${p[1]}"></label>`).join("")}</div>`).join("");

  function maj(tout) {
    const d = A.idees[A.n], c = calc(d);
    $("at-dessin").innerHTML = dessin(d);
    $("at-tuiles").innerHTML = [["Surface de l'aile", fr(c.S, 0) + " cm²"], ["Allongement", fr(c.al, 1)], ["Masse estimée, sans lest", fr(c.m, 1) + " g"], ["Charge alaire, avec lest", fr((c.m + c.lest) / c.S, 2) + " g/cm²"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    $("at-cons").innerHTML = conseils(d).map((x) => `<li class="${x[0]}">${x[1]}</li>`).join("");
    CURS.forEach((g) => g[1].forEach((p) => { racine.querySelector(`[data-o="${p[0]}"]`).textContent = val(p[0], d[p[0]]) + " " + p[2]; if (tout) racine.querySelector(`[data-k="${p[0]}"]`).value = d[p[0]]; }));
    $("at-rond").innerHTML = `<button type="button" data-ch="rond" data-v="0" class="${d.rond ? "" : "on"}">Droits</button><button type="button" data-ch="rond" data-v="1" class="${d.rond ? "on" : ""}">Arrondis</button>`;
    $("at-nez").innerHTML = puces("nez", NEZ, d); $("at-der").innerHTML = puces("der", DER, d); $("at-cf").innerHTML = couleurs("cf", d); $("at-ca").innerHTML = couleurs("ca", d);
    if (tout) { $("at-ref1").value = A.ref1 || ""; $("at-ref2").value = A.ref2 || ""; $("at-nom").value = d.nom; $("at-devise").value = d.devise; $("at-pourquoi").value = A.pourquoi || ""; }
    racine.querySelectorAll("[data-idee]").forEach((b) => { const i = +b.dataset.idee; b.setAttribute("aria-selected", i === A.n); b.textContent = "Idée " + "ABC"[i] + (A.choisi === i ? " ★" : ""); });
    const li = (t, f) => `<tr><td>${t}</td>${A.idees.map((x, i) => `<td class="n">${f(x, calc(x), i)}</td>`).join("")}</tr>`;
    $("at-comp").innerHTML = `<tr><th></th>${A.idees.map((x, i) => `<th class="n">Idée ${"ABC"[i]}${x.nom ? "<br>" + esc(x.nom) : ""}</th>`).join("")}</tr>`
      + `<tr><td>Dessin</td>${A.idees.map((x) => `<td class="n"><svg viewBox="0 0 230 190" style="width:120px;margin:0 auto" aria-hidden="true">${dessus(x, 1, 10, 95)}</svg></td>`).join("")}</tr>`
      + li("Surface de l'aile", (x, k) => fr(k.S, 0) + " cm²") + li("Allongement (plus grand = va plus loin)", (x, k) => fr(k.al, 1)) + li("Masse estimée, sans lest", (x, k) => fr(k.m, 1) + " g")
      + li("Points à corriger", (x) => { const n = conseils(x).filter((y) => y[0] === "ko").length; return n ? `<b style="color:var(--bad)">${n}</b>` : `<b style="color:var(--good)">aucun</b>`; })
      + li("Je choisis", (x, k, i) => `<label class="pl-coche"><input type="radio" name="at-choix" data-choix="${i}" ${A.choisi === i ? "checked" : ""} aria-label="Je choisis l'idée ${"ABC"[i]}"></label>`);
    garder(); if (pret) window.dispatchEvent(new Event("planeur-idee"));
  }
  if (!A.essai || !Array.isArray(A.essai.f)) A.essai = { f: [] };   // pièce d'essai de l'atelier 3D : vide au départ
  window.PlaneurAtelier = { idee: () => A.idees[A.n], titre: () => "l'idée " + "ABC"[A.n] + (A.idees[A.n].nom ? " « " + A.idees[A.n].nom + " »" : ""), lettre: () => "ABC"[A.n], libre: () => A.essai, garder, rafraichir: () => maj(true) };

  racine.addEventListener("input", (ev) => { const t = ev.target, d = A.idees[A.n];
    if (t.dataset.k) { d[t.dataset.k] = parseFloat(t.value); if (d.cao) delete d.cao[t.dataset.k[0] === "s" ? "stab" : "aile"]; maj(); }
    else if (t.id === "at-nom") { d.nom = t.value; maj(); } else if (t.id === "at-devise") { d.devise = t.value; maj(); }
    else if (t.id === "at-pourquoi") { A.pourquoi = t.value; garder(); } else if (t.id === "at-ref1" || t.id === "at-ref2") { A[t.id.slice(3)] = t.value; garder(); } });
  racine.addEventListener("change", (ev) => { if (ev.target.dataset.choix != null) { A.choisi = +ev.target.dataset.choix; maj(); } });
  racine.addEventListener("click", (ev) => { const d = A.idees[A.n];
    const ch = ev.target.closest("[data-ch]"); if (ch) { d[ch.dataset.ch] = ch.dataset.ch === "rond" ? +ch.dataset.v : ch.dataset.v; return maj(); }
    const id = ev.target.closest("[data-idee]"); if (id) { A.n = +id.dataset.idee; return maj(true); }
    const insp = ev.target.closest("[data-insp]"); if (insp) { A.idees[A.n] = Object.assign({}, BASE, { nom: d.nom, devise: d.devise, cf: d.cf, ca: d.ca }, IDEES[+insp.dataset.insp][3]); maj(true); return $("at-dessin").scrollIntoView({ block: "center", behavior: "smooth" }); }
    if (ev.target.id === "at-tirer") { let i; do { i = Math.floor(Math.random() * CARTES.length); } while (CARTES[i] === $("at-etsi").textContent); $("at-etsi").textContent = CARTES[i]; return; }
    if (ev.target.id === "at-raz") { A.idees[A.n] = Object.assign({}, BASE, { nom: d.nom, devise: d.devise, cf: d.cf, ca: d.ca }); return maj(true); }
    if (ev.target.id === "at-impr") { document.body.classList.add("impr-atelier"); window.print(); return setTimeout(() => document.body.classList.remove("impr-atelier"), 500); }
    if (ev.target.id === "at-sim") { const c = calc(d), env = { env: Math.round(c.b / 5) * 5, corde: Math.round(c.cm), envS: d.sb, cordeS: Math.round(d.sc * (1 + d.sk) / 2), m: Math.round((c.m + c.lest) * 10) / 10 };
      Object.keys(env).forEach((k) => { const s = document.querySelector(`#sim-entrees [data-s="${k}"]`); if (s) { s.value = env[k]; s.dispatchEvent(new Event("input", { bubbles: true })); } });
      const b = document.querySelector('.pl-nav [data-s="sim"]'); if (b) b.click(); } });
  maj(true); pret = true;
  if (window.ResizeObserver) new ResizeObserver(() => { if ($("at-dessin").clientWidth && estEtroit() !== dessinEtroit) $("at-dessin").innerHTML = dessin(A.idees[A.n]); }).observe($("at-dessin"));          // l'onglet s'ouvre, ou le téléphone tourne : le dessin change de disposition (sans toucher au reste)
})();
