/* ===================== 1re SI — Séquence 2 (cinématique) et Séquence 6 (modélisation mécanique) =====================
   Cours du professeur : « Les bases de la cinématique : mouvements – trajectoires », « Équations de mouvement »
   + « Formulaire : équations de mouvement », « Modélisation d'un système mécanique : le schéma cinématique » + synthèse. */
(function () {
  const nb = (x, s) => SIP.nb(x, s);
  const PI = Math.PI;
  const txt = (h) => String(h).replace(/<[^>]+>/g, "");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // Garde les 4 premiers choix distincts (le premier = la bonne réponse)
  const uniq = (arr, n = 4) => {
    const out = [], vus = new Set();
    for (const c of arr) { const k = txt(c); if (!vus.has(k)) { vus.add(k); out.push(c); } if (out.length === n) break; }
    return out;
  };
  const qcm = (enonce, choix, explication) => ({ type: "qcm", enonce, choix: uniq(choix), bonne: 0, explication });
  const S2 = "S2 · Cinématique", S6 = "S6 · Modélisation mécanique";

  /* =====================================================================
     MODULE 1 — Bases de la cinématique
     ===================================================================== */
  const C = { ref: "1si-s2-cin-ref", mvt: "1si-s2-cin-mvt", vit: "1si-s2-cin-vit", rot: "1si-s2-cin-rot", acc: "1si-s2-cin-acc" };

  const MVTS = ["rotation", "translation rectiligne", "translation circulaire", "translation curviligne", "mouvement plan général"];
  const DEF_MVT = {
    "rotation": "autour d'un axe fixe, les points décrivent des cercles concentriques.",
    "translation rectiligne": "le solide garde son orientation et ses points décrivent des segments de droite parallèles.",
    "translation circulaire": "le solide garde son orientation (toute droite reste parallèle à elle-même) et ses points décrivent des cercles de même rayon, de centres différents.",
    "translation curviligne": "le solide garde son orientation et ses points décrivent des courbes quelconques superposables.",
    "mouvement plan général": "le solide change d'orientation sans tourner autour d'un axe fixe : ce n'est ni une rotation, ni une translation."
  };
  const SITUATIONS = [
    ["la cabine d'un ascenseur d'hôpital", "l'immeuble", 1],
    ["un tiroir de la table de chevet", "la table de chevet", 1],
    ["le cadre d'un vélo roulant en ligne droite", "le sol", 1],
    ["la nacelle d'une grande roue (elle reste horizontale)", "le sol", 2],
    ["la pédale d'un vélo (elle reste horizontale)", "le cadre du vélo", 2],
    ["le balai d'un essuie-glace à parallélogramme de bus (il reste vertical)", "la carrosserie", 2],
    ["la roue avant d'un vélo", "le cadre du vélo", 0],
    ["le dossier d'un lit médicalisé qui se relève", "le sommier du lit", 0],
    ["une porte qu'on ouvre", "le mur", 0],
    ["la grande aiguille d'une horloge", "le cadran", 0],
    ["une cabine de téléphérique (elle reste verticale) le long d'un câble courbe", "le sol", 3],
    ["la roue d'un fauteuil roulant qui avance en ligne droite", "le sol", 4],
    ["la bielle d'un moteur", "le bloc moteur", 4],
    ["une échelle qui glisse le long d'un mur", "le sol", 4]
  ];
  const DESCR = [
    ["tous ses points décrivent des segments de droite parallèles", 1],
    ["ses points décrivent des cercles de même rayon mais de centres différents, et il garde son orientation", 2],
    ["ses points décrivent des cercles concentriques (même centre, rayons différents)", 0],
    ["ses points décrivent des courbes quelconques, toutes superposables, et il garde son orientation", 3],
    ["ses points décrivent des trajectoires non superposables et il change d'orientation sans axe fixe", 4]
  ];
  const FRACS = [[1, 4, "au quart"], [1, 3, "au tiers"], [1, 2, "au milieu"], [2, 3, "aux deux tiers"], [3, 4, "aux trois quarts"]];

  SIP.definirModule({
    id: "1si-s2-cinematique",
    niveaux: ["1SI"],
    sequence: S2,
    titre: "Mouvements, trajectoires et vitesses",
    description: "Référentiel et repère, trajectoires et types de mouvements, vitesse moyenne, vitesse d'un point en rotation (V = ω·R), conversions et accélérations.",
    competences: ["M7", "M13", "M1"],
    nbQuestions: 10,
    questions: [
      // ---------- Référentiel et repère ----------
      { type: "qcm", fiche: C.ref, enonce: "Dans le cours, le mouvement du cycliste 1 par rapport au sol 0 se note…", choix: ["Mvt 1/0", "Mvt 0/1", "T<sub>1/0</sub>", "V<sub>0/1</sub>"], bonne: 0, explication: "On écrit d'abord le solide étudié, puis le référentiel : Mvt 1/0 = mouvement de 1 par rapport à 0. T désigne une trajectoire, V une vitesse." },
      { type: "qcm", fiche: C.ref, enonce: "Une pièce (S) est considérée comme un <b>solide indéformable</b> si…", choix: ["pour tous points A et B de S, la distance AB reste constante au cours du temps", "S reste immobile par rapport au référentiel", "tous les points de S ont la même trajectoire", "la masse de S reste constante"], bonne: 0, explication: "C'est l'hypothèse de base de la cinématique : les distances entre les points du solide ne changent pas (aucune déformation)." },
      { type: "qcm", fiche: C.ref, enonce: "Pour la plupart des études en SI, quel référentiel peut être considéré comme absolu (galiléen) ?", choix: ["La Terre (le sol)", "Le cadre d'un vélo en mouvement", "La roue d'un vélo", "Un bus qui freine"], bonne: 0, explication: "La Terre est assimilée, avec une très bonne approximation, à un référentiel absolu, dit galiléen. Les autres sont des référentiels relatifs (en mouvement)." },
      { type: "qcm", fiche: C.ref, enonce: "Un patient est allongé dans une ambulance qui roule. Par rapport à quoi est-il <b>immobile</b> ?", choix: ["L'ambulance", "La route", "Les arbres au bord de la route", "Le sol"], bonne: 0, explication: "Le mouvement dépend du référentiel : le patient est au repos dans le référentiel (relatif) de l'ambulance, mais en mouvement par rapport au sol (référentiel absolu)." },
      { type: "qcm", fiche: C.ref, enonce: "Le repère d'espace (O, i⃗, j⃗, k⃗) utilisé en cinématique est orthonormé : les vecteurs i⃗, j⃗, k⃗ sont…", choix: ["orthogonaux deux à deux et de norme 1", "parallèles entre eux et de norme 1", "orthogonaux deux à deux et de norme quelconque", "tous dirigés vers le point M étudié"], bonne: 0, explication: "Ortho = perpendiculaires deux à deux ; normé = de norme égale à l'unité (1)." },
      { type: "qcm", fiche: C.ref, enonce: "Un vélo roule en ligne droite. Quelle est la trajectoire de la valve de la roue avant <b>par rapport au sol</b> ?", choix: ["Une courbe en arches (cycloïde)", "Un cercle", "Un segment de droite", "Un point fixe"], bonne: 0, explication: "Par rapport au cadre, la valve décrit un cercle ; par rapport au sol, rotation de la roue + avance du vélo donnent une suite d'arches. Même point, référentiels différents → trajectoires différentes." },
      { fiche: C.ref, gen: (r) => {
        const t1 = r.pas(2, 20, 0.5), m = r.int(1, 2), s = r.int(5, 55), t2 = 60 * m + s, dt = t2 - t1;
        return { enonce: `Un fauteuil roulant électrique passe devant le repère A à <b>t<sub>1</sub> = ${nb(t1)} s</b>, puis devant le repère B à <b>t<sub>2</sub> = ${m} min ${s} s</b> (même chronomètre). Durée Δt du trajet AB ?`, reponse: dt, unite: "s", tolerance: 1,
          explication: `On convertit d'abord : t<sub>2</sub> = ${m} × 60 + ${s} = ${t2} s. Puis Δt = t<sub>2</sub> − t<sub>1</sub> = ${t2} − ${nb(t1)} = ${nb(dt)} s.` }; } },
      { fiche: C.ref, gen: (r) => {
        const x = r.pas(0.5, 4, 0.5), y = r.pas(0.5, 4, 0.5), z = r.pas(0, 3, 0.5), d = Math.sqrt(x * x + y * y + z * z);
        return { enonce: `Dans le repère orthonormé (O, x, y, z), le point M a pour coordonnées <b>x<sub>M</sub> = ${nb(x)} m</b>, <b>y<sub>M</sub> = ${nb(y)} m</b>, <b>z<sub>M</sub> = ${nb(z)} m</b>. Longueur OM ?`, reponse: d, unite: "m",
          explication: `Repère orthonormé → Pythagore : OM = √(x<sub>M</sub>² + y<sub>M</sub>² + z<sub>M</sub>²) = √(${nb(x)}² + ${nb(y)}² + ${nb(z)}²) = ${nb(d)} m.` }; } },

      // ---------- Trajectoires et mouvements ----------
      { fiche: C.mvt, gen: (r) => {
        const [s, ref, k] = r.pick(SITUATIONS), bon = MVTS[k], f = r.melange(MVTS.filter((m) => m !== bon)).slice(0, 3);
        return qcm(`Solide étudié : <b>${s}</b>. Référentiel : <b>${ref}</b>. Quel est son mouvement ?`, [cap(bon), ...f.map(cap)], `${cap(bon)} : ${DEF_MVT[bon]}`); } },
      { fiche: C.mvt, gen: (r) => {
        const [d, k] = r.pick(DESCR), bon = MVTS[k], f = r.melange(MVTS.filter((m) => m !== bon)).slice(0, 3);
        return qcm(`Observé depuis le bâti 0, un solide 1 est tel que <b>${d}</b>. Quel est le mouvement 1/0 ?`, [cap(bon), ...f.map(cap)], `${cap(bon)} : ${DEF_MVT[bon]}`); } },
      { type: "qcm", fiche: C.mvt, enonce: "La notation T<sub>A∈1/0</sub> désigne…", choix: ["la trajectoire du point A appartenant au solide 1, dans son mouvement par rapport au solide 0", "la trajectoire du point A appartenant au solide 0, par rapport au solide 1", "la vitesse du point A de 1 par rapport à 0", "le temps mis par le point A pour aller de 1 à 0"], bonne: 0, explication: "Exemple du cours : T<sub>A∈1/0</sub> = trajectoire de la pointe A du stylo 1 sur la feuille 0 (la trace laissée par le stylo)." },
      { type: "qcm", fiche: C.mvt, enonce: "Un solide est en <b>translation</b> si…", choix: ["toute droite liée au solide reste parallèle à elle-même", "tous ses points décrivent des cercles concentriques", "l'un de ses points reste fixe", "ses points décrivent des trajectoires non superposables"], bonne: 0, explication: "Translation : tout bipoint du solide reste équipollent à lui-même (le solide ne change pas d'orientation). Les cercles concentriques correspondent à une rotation." },
      { type: "qcm", fiche: C.mvt, enonce: "En translation, à un instant donné, tous les points du solide ont…", choix: ["le même vecteur vitesse", "des vitesses proportionnelles à leur distance à un axe", "une vitesse nulle", "des trajectoires concentriques"], bonne: 0, explication: "Les trajectoires sont superposables et parcourues de la même façon : même vitesse pour tous les points. La proportionnalité à la distance à l'axe, c'est la rotation (V = ω·R)." },
      { type: "qcm", fiche: C.mvt, enonce: "Pourquoi, en modélisation des systèmes mécaniques, s'intéresse-t-on surtout à la <b>rotation</b> et à la <b>translation</b> ?", choix: ["Ce sont ces mouvements qui définissent les degrés de liberté d'une liaison", "Ce sont les seuls mouvements qui existent", "Ce sont les seuls mouvements sans accélération", "Ils ne dépendent pas du référentiel choisi"], bonne: 0, explication: "Les degrés de liberté d'une liaison sont des translations (Tx, Ty, Tz) et des rotations (Rx, Ry, Rz) : c'est le lien avec la séquence sur les liaisons." },
      { type: "qcm", fiche: C.mvt, enonce: "La nacelle d'une grande roue reste toujours horizontale. Par rapport au sol, elle est en…", choix: ["Translation circulaire", "Rotation", "Translation rectiligne", "Mouvement plan général"], bonne: 0, explication: "La nacelle ne change pas d'orientation (translation) et ses points décrivent des cercles de même rayon, de centres différents → translation circulaire. C'est le bras de la roue qui est en rotation." },

      // ---------- Vitesse moyenne et conversions ----------
      { fiche: C.vit, gen: (r) => {
        const d = r.pas(10, 40, 2), t = r.int(Math.ceil(d / 1.8), Math.ceil(d / 0.6)), v = d / t;
        return { enonce: `Un fauteuil roulant électrique parcourt <b>${d} m</b> en <b>${t} s</b> dans un couloir. Vitesse moyenne ?`, reponse: v, unite: "m/s",
          explication: `v<sub>moy</sub> = Δx / Δt = ${d} / ${t} = ${nb(v)} m/s.` }; } },
      { fiche: C.vit, gen: (r) => {
        const V = r.pas(30, 130, 5), v = V / 3.6;
        return { enonce: `Une ambulance roule à <b>${V} km/h</b>. Sa vitesse en m/s ?`, reponse: v, unite: "m/s",
          explication: `1 km/h = 1000 m / 3600 s = 1/3,6 m/s → v = ${V} / 3,6 = ${nb(v)} m/s.` }; } },
      { fiche: C.vit, gen: (r) => {
        const v = r.pas(0.4, 1.6, 0.1), V = v * 3.6;
        return { enonce: `Une patiente en rééducation marche avec son déambulateur à <b>${nb(v)} m/s</b>. Sa vitesse en km/h ?`, reponse: V, unite: "km/h",
          explication: `m/s → km/h : on multiplie par 3,6. V = ${nb(v)} × 3,6 = ${nb(V)} km/h.` }; } },
      { fiche: C.vit, gen: (r) => {
        const V = r.pas(2, 8, 0.5), t = r.pas(5, 30, 5), d = V / 3.6 * t * 60;
        return { enonce: `Un tapis de marche de rééducation est réglé à <b>${nb(V)} km/h</b> pendant <b>${t} min</b>. Distance parcourue (en m) ?`, reponse: d, unite: "m",
          explication: `On passe en unités SI : v = ${nb(V)} / 3,6 = ${nb(V / 3.6)} m/s et Δt = ${t} × 60 = ${t * 60} s. d = v·Δt = ${nb(V / 3.6)} × ${t * 60} = ${nb(d)} m.` }; } },
      { fiche: C.vit, gen: (r) => {
        const h = r.pas(3, 24, 3), v = r.pick([0.5, 0.63, 0.8, 1, 1.6]), t = h / v;
        return { enonce: `L'ascenseur d'un hôpital monte de <b>${h} m</b> à la vitesse moyenne de <b>${nb(v)} m/s</b>. Durée du trajet ?`, reponse: t, unite: "s",
          explication: `v = Δx / Δt → Δt = Δx / v = ${h} / ${nb(v)} = ${nb(t)} s.` }; } },
      { fiche: C.vit, gen: (r) => {
        const N = r.pick([750, 1000, 1450, 1500, 2800, 3000, 3600]), w = PI * N / 30;
        return { enonce: `Le moteur d'un lève-personne tourne à <b>N = ${N} tr/min</b>. Vitesse angulaire ω ?`, reponse: w, unite: "rad/s",
          explication: `ω = π·N / 30 = π × ${N} / 30 = ${nb(w)} rad/s (1 tour = 2π rad, 1 min = 60 s).` }; } },
      { fiche: C.vit, gen: (r) => {
        const w = r.pas(5, 150, 5), N = 30 * w / PI;
        return { enonce: `Un arbre tourne à <b>ω = ${w} rad/s</b>. Fréquence de rotation N en tr/min ?`, reponse: N, unite: "tr/min",
          explication: `ω = π·N / 30 → N = 30·ω / π = 30 × ${w} / π = ${nb(N)} tr/min.` }; } },
      { fiche: C.vit, gen: (r) => {
        const a = r.pick([15, 30, 45, 60, 75, 90, 120, 135, 150, 180, 270]), th = a * PI / 180;
        return { enonce: `Le bras d'un robot de rééducation tourne de <b>${a}°</b>. Angle en radians ?`, reponse: th, unite: "rad",
          explication: `360° = 2π rad, donc θ = ${a} × π / 180 = ${nb(th)} rad.` }; } },
      { fiche: C.vit, gen: (r) => {
        const a = r.pick([30, 40, 45, 50, 60, 70]), t = r.int(8, 30), th = a * PI / 180, w = th / t;
        return { enonce: `Le dossier d'un lit médicalisé se relève de <b>0°</b> à <b>${a}°</b> en <b>${t} s</b>. Vitesse angulaire moyenne en rad/s ?`, reponse: w, unite: "rad/s",
          explication: `Δθ = ${a} × π / 180 = ${nb(th)} rad ; ω<sub>moy</sub> = Δθ / Δt = ${nb(th)} / ${t} = ${nb(w)} rad/s.` }; } },
      { fiche: C.vit, gen: (r) => {
        const ts = [0, 2, 4, 6, 8], xs = [0];
        for (let i = 1; i < 5; i++) xs.push(+(xs[i - 1] + 2 * r.pas(0.4, 1.2, 0.1)).toFixed(2));
        const i = r.int(0, 3), j = r.int(i + 1, 4), v = (xs[j] - xs[i]) / (ts[j] - ts[i]);
        const tab = `<table><tr><th>t (s)</th>${ts.map((t) => `<td>${t}</td>`).join("")}</tr><tr><th>x (m)</th>${xs.map((x) => `<td>${nb(x)}</td>`).join("")}</tr></table>`;
        return { enonce: `Un robot de livraison de médicaments avance dans un couloir d'hôpital. Relevé de sa position :${tab}Vitesse moyenne entre <b>t = ${ts[i]} s</b> et <b>t = ${ts[j]} s</b> ?`, reponse: v, unite: "m/s",
          explication: `v<sub>moy</sub> = Δx / Δt = (${nb(xs[j])} − ${nb(xs[i])}) / (${ts[j]} − ${ts[i]}) = ${nb(v)} m/s.` }; } },
      { type: "qcm", fiche: C.vit, enonce: "Ordre de grandeur de la vitesse de marche d'une personne ?", choix: ["1,4 m/s (≈ 5 km/h)", "14 m/s", "0,14 m/s", "5 m/s (≈ 18 km/h)"], bonne: 0, explication: "Un piéton marche à environ 5 km/h, soit 5 / 3,6 ≈ 1,4 m/s. 5 m/s correspond déjà à une course rapide." },
      { fiche: C.vit, gen: (r) => {
        const V = r.pick([18, 36, 45, 54, 72, 90, 108]);
        return qcm(`Quelle est la bonne conversion de <b>${V} km/h</b> en m/s ?`, [`${nb(V / 3.6)} m/s`, `${nb(V * 3.6)} m/s`, `${nb(V / 60)} m/s`, `${nb(V * 1000 / 60)} m/s`, `${nb(V / 36)} m/s`],
          `1 km/h = 1000 m / 3600 s : on divise par 3,6 → ${V} / 3,6 = ${nb(V / 3.6)} m/s. Multiplier par 3,6 ou diviser par 60 sont les erreurs classiques.`); } },

      // ---------- Vitesse d'un point d'un solide en rotation ----------
      { fiche: C.rot, gen: (r) => {
        const D = r.pick([300, 350, 400, 500, 600]), N = r.pas(20, 100, 5), w = PI * N / 30, R = D / 2000, V = w * R;
        return { enonce: `La roue d'un fauteuil roulant (diamètre <b>${D} mm</b>) tourne à <b>${N} tr/min</b> autour de son axe. Vitesse d'un point de sa périphérie par rapport au cadre du fauteuil ?`, reponse: V, unite: "m/s",
          explication: `ω = π·N / 30 = π × ${N} / 30 = ${nb(w)} rad/s ; R = D / 2 = ${nb(R)} m ; V = ω·R = ${nb(w)} × ${nb(R)} = ${nb(V)} m/s.` }; } },
      { fiche: C.rot, gen: (r) => {
        const v = r.pick([3, 4, 5, 6, 8, 10]), D = r.pick([300, 350, 400, 500, 600]), vs = v / 3.6, R = D / 2000, w = vs / R, N = 30 * w / PI;
        return { enonce: `On veut que le fauteuil avance à <b>${v} km/h</b>, avec des roues de <b>${D} mm</b> de diamètre (roulement sans glissement : vitesse de la périphérie = vitesse du fauteuil). Fréquence de rotation N des roues ?`, reponse: N, unite: "tr/min",
          explication: `V = ${v} / 3,6 = ${nb(vs)} m/s ; ω = V / R = ${nb(vs)} / ${nb(R)} = ${nb(w)} rad/s ; N = 30·ω / π = ${nb(N)} tr/min.` }; } },
      { fiche: C.rot, gen: (r) => {
        const OM = r.pas(0.3, 1.2, 0.1), VM = r.pas(0.5, 3, 0.1), [a, b, mot] = r.pick(FRACS), VP = VM * a / b, w = VM / OM;
        return { enonce: `Le bras OM d'un robot tourne autour de O. Le point M (<b>OM = ${nb(OM)} m</b>) a une vitesse <b>V<sub>M</sub> = ${nb(VM)} m/s</b>. Vitesse du point P situé ${mot} du bras en partant de O ?`, reponse: VP, unite: "m/s",
          explication: `Même ω pour tous les points : ω = V<sub>M</sub> / OM = ${nb(w)} rad/s. OP = ${a}/${b} × OM = ${nb(OM * a / b)} m, donc V<sub>P</sub> = ω·OP = ${nb(VP)} m/s (V varie linéairement avec la distance à l'axe).` }; } },
      { type: "qcm", fiche: C.rot, enonce: "Un solide tourne autour de l'axe (O, z). Le vecteur vitesse V⃗<sub>A</sub> d'un point A du solide est…", choix: ["perpendiculaire à OA, tangent à la trajectoire (cercle de centre O)", "porté par OA, dirigé vers O", "porté par OA, dirigé vers l'extérieur", "parallèle à l'axe de rotation"], bonne: 0, explication: "La trajectoire de A est le cercle de centre O et de rayon OA ; la vitesse est tangente à ce cercle, donc perpendiculaire au rayon OA, de norme V<sub>A</sub> = ω·OA." },
      { type: "qcm", fiche: C.rot, enonce: "Pour un solide en rotation autour d'un axe fixe, les points situés <b>sur l'axe</b>…", choix: ["ont une vitesse nulle", "ont la vitesse la plus grande", "décrivent les plus grands cercles", "décrivent des segments de droite"], bonne: 0, explication: "V = ω·R avec R = 0 sur l'axe : ces points restent immobiles. La vitesse augmente linéairement quand on s'éloigne de l'axe." },
      { fiche: C.rot, gen: (r) => {
        const R = r.pick([20, 25, 40, 50, 60, 80, 100]), N = r.pick([300, 600, 750, 1000, 1500]), Rm = R / 1000, w = PI * N / 30, V = Rm * w;
        return qcm(`Une poulie de rayon <b>R = ${R} mm</b> tourne à <b>N = ${N} tr/min</b>. Vitesse linéaire d'un point de sa périphérie ?`,
          [`${nb(V)} m/s`, `${nb(Rm * N)} m/s`, `${nb(2 * V)} m/s`, `${nb(Rm * N / 60)} m/s`, `${nb(R * w)} m/s`],
          `Il faut ω en rad/s et R en m : ω = π·N/30 = ${nb(w)} rad/s ; V = ω·R = ${nb(w)} × ${nb(Rm)} = ${nb(V)} m/s. Pièges : N non converti, diamètre au lieu du rayon, R laissé en mm.`); } },
      { fiche: C.rot, gen: (r) => {
        const V = r.pick([0.8, 1, 1.2, 1.5, 2, 2.5]), N = r.pick([150, 200, 240, 300, 400]), w = PI * N / 30, D = 2 * V / w * 1000;
        return { enonce: `La bande d'un tapis de marche défile à <b>${nb(V)} m/s</b>. Elle est entraînée sans glissement par un rouleau qui tourne à <b>${N} tr/min</b>. Diamètre du rouleau ?`, reponse: D, unite: "mm",
          explication: `ω = π × ${N} / 30 = ${nb(w)} rad/s ; R = V / ω = ${nb(V)} / ${nb(w)} = ${nb(V / w)} m ; D = 2R = ${nb(D)} mm.` }; } },
      { fiche: C.rot, gen: (r) => {
        const D = r.pick([300, 350, 400, 500, 600]), n = r.int(5, 40), d = n * PI * D / 1000;
        return { enonce: `La roue d'un fauteuil roulant (diamètre <b>${D} mm</b>) fait <b>${n} tours</b> sans glisser. Distance parcourue par le fauteuil ?`, reponse: d, unite: "m",
          explication: `À chaque tour, la roue avance de son périmètre π·D = π × ${nb(D / 1000)} = ${nb(PI * D / 1000)} m. d = ${n} × ${nb(PI * D / 1000)} = ${nb(d)} m (c'est aussi θ·R avec θ = 2π × ${n} rad).` }; } },
      { fiche: C.rot, gen: (r) => {
        const r1 = r.pick([2, 3, 4, 5, 10]), k = r.pick([2, 3, 4]), r2 = k * r1;
        return qcm(`Sur un plateau tournant (rotation autour de O), le point A est à <b>${r1} cm</b> de l'axe et le point B à <b>${r2} cm</b>. Quelle affirmation est vraie ?`,
          [`ω<sub>B</sub> = ω<sub>A</sub> et V<sub>B</sub> = ${k} × V<sub>A</sub>`, `ω<sub>B</sub> = ${k} × ω<sub>A</sub> et V<sub>B</sub> = V<sub>A</sub>`, `ω<sub>B</sub> = ω<sub>A</sub> et V<sub>B</sub> = V<sub>A</sub>`, `ω<sub>B</sub> = ω<sub>A</sub> et V<sub>B</sub> = V<sub>A</sub> / ${k}`],
          `Tous les points d'un solide en rotation ont la même vitesse angulaire ω. V = ω·R : B est ${k} fois plus loin de l'axe, il va ${k} fois plus vite.`); } },

      // ---------- Accélérations ----------
      { fiche: C.acc, gen: (r) => {
        const v = r.pick([4, 6, 8, 10]), t = r.pick([1, 1.5, 2, 2.5, 3, 4]), a = v / 3.6 / t;
        return { enonce: `Un fauteuil roulant électrique passe de l'arrêt à <b>${v} km/h</b> en <b>${nb(t)} s</b>. Accélération moyenne ?`, reponse: a, unite: "m/s<sup>2</sup>",
          explication: `Δv = ${v} / 3,6 = ${nb(v / 3.6)} m/s ; a<sub>moy</sub> = Δv / Δt = ${nb(v / 3.6)} / ${nb(t)} = ${nb(a)} m/s².` }; } },
      { fiche: C.acc, gen: (r) => {
        const V1 = r.pick([50, 60, 70, 80, 90]), V2 = r.pick([0, 20, 30]), t = r.int(3, 8), dv = (V2 - V1) / 3.6, a = dv / t;
        return { enonce: `Une ambulance ralentit de <b>${V1} km/h</b> à <b>${V2} km/h</b> en <b>${t} s</b>. Accélération moyenne (avec son signe) ?`, reponse: a, unite: "m/s<sup>2</sup>",
          explication: `Δv = (${V2} − ${V1}) / 3,6 = ${nb(dv)} m/s ; a<sub>moy</sub> = Δv / Δt = ${nb(dv)} / ${t} = ${nb(a)} m/s² (négative : la vitesse diminue).` }; } },
      { fiche: C.acc, gen: (r) => {
        const R = r.pick([8, 10, 12, 15]), N = r.pick([1500, 2000, 2500, 3000, 4000]), w = PI * N / 30, an = w * w * R / 100;
        return { enonce: `Une centrifugeuse de laboratoire tourne à <b>${N} tr/min</b>. Accélération normale d'un tube situé à <b>${R} cm</b> de l'axe ?`, reponse: an, unite: "m/s<sup>2</sup>",
          explication: `ω = π × ${N} / 30 = ${nb(w)} rad/s ; a<sub>n</sub> = ω²·R = ${nb(w)}² × ${nb(R / 100)} = ${nb(an)} m/s², soit environ ${nb(an / 9.81, 3)} fois g.` }; } },
      { fiche: C.acc, gen: (r) => {
        const al = r.pick([2, 4, 5, 8, 10, 12]), R = r.pick([5, 8, 10, 15, 20]), at = al * R / 100;
        return { enonce: `Au démarrage, le plateau d'une centrifugeuse a une accélération angulaire <b>α = ${al} rad/s²</b>. Accélération tangentielle d'un point situé à <b>${R} cm</b> de l'axe ?`, reponse: at, unite: "m/s<sup>2</sup>",
          explication: `a<sub>t</sub> = α·R = ${al} × ${nb(R / 100)} = ${nb(at)} m/s² (R en mètres).` }; } },
      { fiche: C.acc, gen: (r) => {
        const V = r.pas(0.8, 2, 0.1), R = r.pas(1.5, 5, 0.5), an = V * V / R;
        return { enonce: `Un fauteuil roulant prend un virage de rayon <b>${nb(R)} m</b> à vitesse constante <b>${nb(V)} m/s</b>. Accélération normale ?`, reponse: an, unite: "m/s<sup>2</sup>",
          explication: `a<sub>n</sub> = V² / R = ${nb(V)}² / ${nb(R)} = ${nb(an)} m/s², dirigée vers le centre du virage (même à vitesse constante !).` }; } },
      { type: "qcm", fiche: C.acc, enonce: "L'accélération normale a<sub>n</sub> d'un point en mouvement circulaire est dirigée…", choix: ["vers le centre de courbure de la trajectoire", "selon la tangente à la trajectoire", "vers l'extérieur de la courbe", "parallèlement à l'axe de rotation"], bonne: 0, explication: "a⃗<sub>n</sub> est portée par la normale n⃗, orientée vers l'intérieur de la courbure (vers O) ; a⃗<sub>t</sub> est portée par la tangente." },
      { type: "qcm", fiche: C.acc, enonce: "Un point A d'un disque tourne à <b>ω constante</b> (rotation uniforme). Son accélération…", choix: ["est normale, dirigée vers O, et vaut ω²·R (a<sub>t</sub> = 0)", "est nulle car ω est constante", "est tangentielle et vaut α·R", "est dirigée vers l'extérieur du disque"], bonne: 0, explication: "α = 0 donc a<sub>t</sub> = α·R = 0, mais la direction de la vitesse change sans cesse : a<sub>n</sub> = ω²·R = V²/R ≠ 0." }
    ],
    fiches: [
      { id: C.ref, titre: "Référentiel et repère",
        recto: "Qu'est-ce qu'un référentiel, et comment note-t-on le mouvement de 1 par rapport à 0 ?",
        verso: `<div class="formule">Mvt 1/0 &nbsp;·&nbsp; Δt = t<sub>2</sub> − t<sub>1</sub></div><ul><li><b>Référentiel</b> = solide de référence + repère d'espace (O, x, y, z) orthonormé + repère de temps.</li><li><b>Absolu</b> : lié à la Terre (galiléen) ; <b>relatif</b> : lié à un solide en mouvement (cadre du vélo…).</li><li><b>Solide indéformable</b> : la distance AB entre deux points reste constante.</li></ul><p class="astuce">Sans référentiel, « bouger » n'a pas de sens : le patient est immobile dans l'ambulance, pas par rapport à la route.</p>`,
        quiz: [
          { enonce: "Mvt 1/0 signifie…", choix: ["Mouvement de 1 par rapport à 0", "Mouvement de 0 par rapport à 1", "Mouvement de 1 et de 0 par rapport à la Terre"], bonne: 0 },
          { enonce: "Référentiel assimilé à un référentiel galiléen en SI :", choix: ["La Terre", "Le cadre d'un vélo", "Une roue qui tourne"], bonne: 0 }
        ] },
      { id: C.mvt, titre: "Trajectoires et types de mouvements",
        recto: "Quels sont les mouvements plans d'un solide et comment les reconnaître ?",
        verso: `<ul><li><b>Rotation</b> : autour d'un axe fixe ; cercles concentriques.</li><li><b>Translation</b> : toute droite du solide reste parallèle à elle-même — <b>rectiligne</b> (segments parallèles), <b>circulaire</b> (cercles de même rayon, centres différents), <b>curviligne</b> (courbes superposables).</li><li><b>Plan général</b> : ni l'un ni l'autre (roue qui roule).</li></ul><p class="astuce">T<sub>A∈1/0</sub> = trajectoire du point A de 1 par rapport à 0. Nacelle de grande roue : translation circulaire, pas rotation !</p>`,
        quiz: [
          { enonce: "Pédale de vélo (restant horizontale) par rapport au cadre :", choix: ["Translation circulaire", "Rotation", "Translation rectiligne"], bonne: 0 },
          { enonce: "Points décrivant des cercles concentriques :", choix: ["Rotation", "Translation circulaire", "Mouvement plan général"], bonne: 0 }
        ] },
      { id: C.vit, titre: "Vitesse moyenne et conversions",
        recto: "Comment calculer une vitesse moyenne (linéaire et angulaire) et convertir les unités ?",
        verso: `<div class="formule">v<sub>moy</sub> = Δx / Δt &nbsp;·&nbsp; ω<sub>moy</sub> = Δθ / Δt</div><div class="formule">ω = π·N / 30</div><ul><li>km/h → m/s : ÷ 3,6 ; m/s → km/h : × 3,6</li><li>1 tour = 2π rad = 360° ; N en tr/min, ω en rad/s</li></ul><p class="astuce">Toujours passer en unités SI (m, s, rad) avant de calculer.</p>`,
        quiz: [
          { enonce: "72 km/h = …", choix: ["20 m/s", "259,2 m/s", "1,2 m/s"], bonne: 0 },
          { enonce: "N = 300 tr/min → ω ≈ …", choix: ["31,4 rad/s", "5 rad/s", "1885 rad/s"], bonne: 0 },
          { enonce: "90° = …", choix: ["π/2 rad", "π rad", "2π rad"], bonne: 0 }
        ] },
      { id: C.rot, titre: "Vitesse d'un point d'un solide en rotation",
        recto: "Quelle est la vitesse d'un point M situé à la distance R de l'axe d'un solide qui tourne à ω ?",
        verso: `<div class="formule">V<sub>M</sub> = ω · OM = ω · R</div><ul><li>V en m/s, ω en rad/s, R en m.</li><li>V⃗<sub>M</sub> est tangente à la trajectoire (cercle de centre O), perpendiculaire à OM.</li><li>Même ω pour tous les points : V croît linéairement avec R (nulle sur l'axe).</li></ul><p class="astuce">Pièges : le diamètre au lieu du rayon, N en tr/min au lieu de ω en rad/s.</p>`,
        quiz: [
          { enonce: "R = 0,2 m, ω = 10 rad/s : V = …", choix: ["2 m/s", "0,02 m/s", "50 m/s"], bonne: 0 },
          { enonce: "V⃗<sub>M</sub> est…", choix: ["Perpendiculaire à OM", "Portée par OM", "Parallèle à l'axe"], bonne: 0 }
        ] },
      { id: C.acc, titre: "Accélérations",
        recto: "Comment calculer l'accélération moyenne, et les accélérations tangentielle et normale d'un point en rotation ?",
        verso: `<div class="formule">a<sub>moy</sub> = Δv / Δt</div><div class="formule">a<sub>t</sub> = α·R &nbsp;·&nbsp; a<sub>n</sub> = ω²·R = V²/R</div><ul><li>a en m/s², α en rad/s².</li><li>a<sub>n</sub> est dirigée vers le centre de courbure.</li><li>Rotation uniforme (ω constante) : a<sub>t</sub> = 0 mais a<sub>n</sub> ≠ 0.</li></ul><p class="astuce">a &lt; 0 : la vitesse diminue (freinage).</p>`,
        quiz: [
          { enonce: "En rotation uniforme, a<sub>t</sub> = …", choix: ["0", "ω²·R", "V/R"], bonne: 0 },
          { enonce: "a<sub>n</sub> est dirigée…", choix: ["Vers le centre de courbure", "Vers l'extérieur", "Selon la tangente"], bonne: 0 }
        ] }
    ]
  });

  /* =====================================================================
     MODULE 2 — Équations horaires
     ===================================================================== */
  const E = { mru: "1si-s2-eq-mru", mruv: "1si-s2-eq-mruv", frein: "1si-s2-eq-frein", trap: "1si-s2-eq-trap", rot: "1si-s2-eq-rot" };

  const mruTab = (r) => {
    const v0 = r.pas(0.2, 1.5, 0.1), x0 = r.pas(1, 5, 0.5), t1 = r.int(1, 4), t2 = t1 + r.int(2, 6);
    const x1 = v0 * t1 + x0, x2 = v0 * t2 + x0;
    const tab = `<table><tr><th>t (s)</th><td>${t1}</td><td>${t2}</td></tr><tr><th>x (m)</th><td>${nb(x1)}</td><td>${nb(x2)}</td></tr></table>`;
    return { v0, x0, t1, t2, x1, x2, tab };
  };
  const CAS_FORMULE = [
    ["on connaît v<sub>0</sub>, a et la durée t ; on cherche la vitesse v", 0, "v = a·t + v<sub>0</sub> donne directement la vitesse à l'instant t."],
    ["on connaît v<sub>0</sub>, a et la durée t ; on cherche la distance parcourue", 1, "L'équation de position x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> donne la distance x − x<sub>0</sub>."],
    ["on connaît v<sub>0</sub>, v et a, mais pas la durée ; on cherche la distance parcourue", 2, "Sans la durée, la « formule utile » v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>) relie directement vitesses, accélération et distance."],
    ["on connaît v<sub>0</sub>, v et la durée t ; on cherche l'accélération", 3, "De v = a·t + v<sub>0</sub>, on tire a = (v − v<sub>0</sub>) / t."]
  ];
  const FORMULES = ["v = a·t + v<sub>0</sub>", "x − x<sub>0</sub> = ½·a·t² + v<sub>0</sub>·t", "v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>)", "a = (v − v<sub>0</sub>) / t"];

  SIP.definirModule({
    id: "1si-s2-equations",
    niveaux: ["1SI"],
    sequence: S2,
    titre: "Équations horaires des mouvements",
    description: "Écrire et exploiter les équations horaires : MRU, MRUV, freinage, profil de vitesse en trapèze, rotations uniformes et uniformément variées.",
    competences: ["M7", "M13", "E1"],
    nbQuestions: 10,
    questions: [
      // ---------- MRU ----------
      { fiche: E.mru, gen: (r) => {
        const v0 = r.pas(0.1, 0.3, 0.05), x0 = r.pas(0.5, 3, 0.5), t = r.int(4, 20), x = v0 * t + x0;
        return { enonce: `Le chariot d'un lève-personne se déplace sur son rail au plafond en MRU : <b>x<sub>0</sub> = ${nb(x0)} m</b>, <b>v<sub>0</sub> = ${nb(v0)} m/s</b>. Position à <b>t = ${t} s</b> ?`, reponse: x, unite: "m",
          explication: `MRU : x = v<sub>0</sub>·t + x<sub>0</sub> = ${nb(v0)} × ${t} + ${nb(x0)} = ${nb(x)} m.` }; } },
      { fiche: E.mru, gen: (r) => {
        const x0 = r.int(2, 10), v0 = r.pas(0.5, 1.5, 0.1), dx = r.pas(10, 60, 5), x = x0 + dx, t = dx / v0;
        return { enonce: `Un robot de livraison part de <b>x<sub>0</sub> = ${x0} m</b> à la vitesse constante <b>v<sub>0</sub> = ${nb(v0)} m/s</b>. À quel instant atteint-il la chambre située en <b>x = ${x} m</b> ?`, reponse: t, unite: "s",
          explication: `x = v<sub>0</sub>·t + x<sub>0</sub> → t = (x − x<sub>0</sub>) / v<sub>0</sub> = (${x} − ${x0}) / ${nb(v0)} = ${nb(t)} s.` }; } },
      { fiche: E.mru, gen: (r) => {
        const d = mruTab(r);
        return { enonce: `Un brancard motorisé se déplace en MRU. Relevé de position :${d.tab}Vitesse v<sub>0</sub> du brancard ?`, reponse: d.v0, unite: "m/s",
          explication: `En MRU, v = Δx / Δt = (${nb(d.x2)} − ${nb(d.x1)}) / (${d.t2} − ${d.t1}) = ${nb(d.v0)} m/s (pente de la droite x(t)).` }; } },
      { fiche: E.mru, gen: (r) => {
        const d = mruTab(r);
        return { enonce: `Un brancard motorisé se déplace en MRU. Relevé de position :${d.tab}Position initiale x<sub>0</sub> (à t = 0) ?`, reponse: d.x0, unite: "m",
          explication: `v<sub>0</sub> = (${nb(d.x2)} − ${nb(d.x1)}) / (${d.t2} − ${d.t1}) = ${nb(d.v0)} m/s ; x<sub>0</sub> = x − v<sub>0</sub>·t = ${nb(d.x1)} − ${nb(d.v0)} × ${d.t1} = ${nb(d.x0)} m.` }; } },
      { fiche: E.mru, gen: (r) => {
        const V = r.pick([50, 60, 70, 80]), d = r.pas(5, 40, 5), t = d / V * 60;
        return { enonce: `Une ambulance roule à <b>${V} km/h</b> constants sur la route de ceinture. Durée pour parcourir <b>${d} km</b> (en minutes) ?`, reponse: t, unite: "min",
          explication: `MRU : t = d / V = ${d} / ${V} = ${nb(d / V)} h, soit × 60 = ${nb(t)} min.` }; } },
      { type: "qcm", fiche: E.mru, enonce: "En MRU, le graphe de position x(t) est…", choix: ["un segment de droite de pente v<sub>0</sub>", "une portion de parabole", "un segment horizontal", "une droite passant forcément par l'origine"], bonne: 0, explication: "x = v<sub>0</sub>·t + x<sub>0</sub> est une fonction affine : droite de pente v<sub>0</sub> et d'ordonnée à l'origine x<sub>0</sub> (pas forcément nulle). C'est v(t) qui est horizontal." },
      { type: "qcm", fiche: E.mru, enonce: "Un mouvement rectiligne uniforme (MRU) est caractérisé par…", choix: ["a = 0 et v = constante", "a = constante non nulle", "v = 0", "une vitesse qui augmente régulièrement"], bonne: 0, explication: "MRU : trajectoire droite, accélération nulle, vitesse constante v = v<sub>0</sub>." },
      { fiche: E.mru, gen: (r) => {
        let A = r.pas(0.2, 2, 0.1); if (Number.isInteger(A)) A = +(A + 0.1).toFixed(1);
        const B = r.int(1, 10);
        if (r.int(0, 1)) return qcm(`Un mobile a pour équation horaire <b>x(t) = ${nb(A)}·t + ${B}</b> (x en m, t en s). Sa vitesse ?`,
          [`${nb(A)} m/s`, `${B} m/s`, `${nb(A + B)} m/s`, `${nb(A / 2)} m/s`, `${nb(2 * A)} m/s`],
          `Par identification avec x = v<sub>0</sub>·t + x<sub>0</sub> : v<sub>0</sub> = ${nb(A)} m/s et x<sub>0</sub> = ${B} m.`);
        return qcm(`Un mobile a pour équation horaire <b>x(t) = ${nb(A)}·t + ${B}</b> (x en m, t en s). Sa position initiale x<sub>0</sub> ?`,
          [`${B} m`, `${nb(A)} m`, "0 m", `${nb(A + B)} m`, `${nb(B - A)} m`],
          `Par identification avec x = v<sub>0</sub>·t + x<sub>0</sub> : x<sub>0</sub> = ${B} m (valeur de x à t = 0) et v<sub>0</sub> = ${nb(A)} m/s.`); } },

      // ---------- MRUV ----------
      { fiche: E.mruv, gen: (r) => {
        const v0 = r.pas(0.2, 1, 0.1), a = r.pas(0.1, 0.5, 0.05), t = r.int(2, 8), v = a * t + v0;
        return { enonce: `Un chariot de transport de repas roule à <b>v<sub>0</sub> = ${nb(v0)} m/s</b> puis accélère avec <b>a = ${nb(a)} m/s²</b> pendant <b>${t} s</b>. Vitesse atteinte ?`, reponse: v, unite: "m/s",
          explication: `MRUV : v = a·t + v<sub>0</sub> = ${nb(a)} × ${t} + ${nb(v0)} = ${nb(v)} m/s.` }; } },
      { fiche: E.mruv, gen: (r) => {
        const a = r.pas(0.2, 0.5, 0.1), t = r.int(2, 4), x = 0.5 * a * t * t;
        return { enonce: `Un fauteuil roulant électrique démarre (départ arrêté) avec <b>a = ${nb(a)} m/s²</b>. Distance parcourue au bout de <b>${t} s</b> ?`, reponse: x, unite: "m",
          explication: `v<sub>0</sub> = 0 et x<sub>0</sub> = 0 : x = ½·a·t² = 0,5 × ${nb(a)} × ${t}² = ${nb(x)} m.` }; } },
      { fiche: E.mruv, gen: (r) => {
        const x0 = r.int(1, 5), v0 = r.pas(0.5, 3, 0.5), a = r.pas(0.2, 1.5, 0.1), t = r.int(2, 8), x = 0.5 * a * t * t + v0 * t + x0;
        return { enonce: `Une navette électrique : <b>x<sub>0</sub> = ${x0} m</b>, <b>v<sub>0</sub> = ${nb(v0)} m/s</b>, <b>a = ${nb(a)} m/s²</b> (constante). Position à <b>t = ${t} s</b> ?`, reponse: x, unite: "m",
          explication: `x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> = 0,5 × ${nb(a)} × ${t}² + ${nb(v0)} × ${t} + ${x0} = ${nb(0.5 * a * t * t)} + ${nb(v0 * t)} + ${x0} = ${nb(x)} m.` }; } },
      { fiche: E.mruv, gen: (r) => {
        const v0 = r.pas(0, 2, 0.5), v = v0 + r.pas(1, 5, 0.5), a = r.pas(0.5, 2, 0.25), t = (v - v0) / a;
        return { enonce: `Un véhicule passe de <b>${nb(v0)} m/s</b> à <b>${nb(v)} m/s</b> avec une accélération constante <b>a = ${nb(a)} m/s²</b>. Durée de cette phase ?`, reponse: t, unite: "s",
          explication: `v = a·t + v<sub>0</sub> → t = (v − v<sub>0</sub>) / a = (${nb(v)} − ${nb(v0)}) / ${nb(a)} = ${nb(t)} s.` }; } },
      { fiche: E.mruv, gen: (r) => {
        const t = r.pick([8, 9, 10, 11, 12, 14]), a = 100 / 3.6 / t;
        return { enonce: `Une ambulance passe de 0 à <b>100 km/h</b> en <b>${t} s</b>, avec une accélération supposée constante. Valeur de a ?`, reponse: a, unite: "m/s<sup>2</sup>",
          explication: `v = 100 / 3,6 = ${nb(100 / 3.6)} m/s ; a = (v − v<sub>0</sub>) / t = ${nb(100 / 3.6)} / ${t} = ${nb(a)} m/s².` }; } },
      { fiche: E.mruv, gen: (r) => {
        const a = r.pas(0.2, 2, 0.2), ts = [0, 1, 2, 3, 4], xs = ts.map((t) => 0.5 * a * t * t);
        const tab = `<table><tr><th>t (s)</th>${ts.map((t) => `<td>${t}</td>`).join("")}</tr><tr><th>x (m)</th>${xs.map((x) => `<td>${nb(x)}</td>`).join("")}</tr></table>`;
        return { enonce: `Un chariot part du repos (x<sub>0</sub> = 0, v<sub>0</sub> = 0) avec une accélération constante. Relevé :${tab}Accélération a ?`, reponse: a, unite: "m/s<sup>2</sup>",
          explication: `x = ½·a·t² → a = 2·x / t². Avec t = 4 s : a = 2 × ${nb(xs[4])} / 16 = ${nb(a)} m/s² (x est multiplié par 4 quand t double : c'est une parabole).` }; } },
      { type: "qcm", fiche: E.mruv, enonce: "En MRUV, le graphe de vitesse v(t) est…", choix: ["un segment de droite de pente a", "une portion de parabole", "un segment horizontal", "une hyperbole"], bonne: 0, explication: "v = a·t + v<sub>0</sub> est affine : droite de pente a. C'est x(t) qui est une parabole et a(t) qui est horizontal." },
      { type: "qcm", fiche: E.mruv, enonce: "Un mobile a une vitesse <b>v &gt; 0</b> et une accélération <b>a &lt; 0</b>. Il…", choix: ["ralentit (décélération)", "accélère", "recule forcément", "est à l'arrêt"], bonne: 0, explication: "a &lt; 0 alors que v &gt; 0 : la vitesse diminue, c'est une décélération (freinage)." },
      { fiche: E.mruv, gen: (r) => {
        const c = r.pas(0.5, 3, 0.5), v0 = r.int(1, 6), x0 = r.int(2, 9);
        return qcm(`Un mobile a pour équation <b>x(t) = ${nb(c)}·t² + ${v0}·t + ${x0}</b> (unités SI). Son accélération a ?`,
          [`${nb(2 * c)} m/s²`, `${nb(c)} m/s²`, `${v0} m/s²`, `${nb(c / 2)} m/s²`, `${nb(4 * c)} m/s²`],
          `On identifie avec x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> : ½·a = ${nb(c)} → a = ${nb(2 * c)} m/s² (piège : oublier le ½).`); } },
      { fiche: E.mruv, gen: (r) => {
        const [c, k, ex] = r.pick(CAS_FORMULE);
        return qcm(`MRUV : ${c}. Quelle relation utiliser directement ?`, [FORMULES[k], ...FORMULES.filter((_, i) => i !== k)], ex); } },

      // ---------- Formule sans le temps / freinage ----------
      { fiche: E.frein, gen: (r) => {
        const V = r.pick([30, 50, 70, 90, 110, 130]), a = r.pick([5, 6, 7, 8]), v0 = V / 3.6, d = v0 * v0 / (2 * a);
        return { enonce: `Une voiture roule à <b>${V} km/h</b> et freine avec une décélération constante <b>a = −${a} m/s²</b>. Distance de freinage jusqu'à l'arrêt ?`, reponse: d, unite: "m",
          explication: `v<sub>0</sub> = ${V} / 3,6 = ${nb(v0)} m/s. 0 = v<sub>0</sub>² + 2·a·d → d = v<sub>0</sub>² / (2·|a|) = ${nb(v0)}² / ${2 * a} = ${nb(d)} m.` }; } },
      { fiche: E.frein, gen: (r) => {
        const a = r.pas(0.2, 1, 0.1), d = r.pas(1, 10, 0.5), v = Math.sqrt(2 * a * d);
        return { enonce: `Un chariot de brancardage part du repos avec <b>a = ${nb(a)} m/s²</b>. Vitesse atteinte après <b>${nb(d)} m</b> ?`, reponse: v, unite: "m/s",
          explication: `v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>) = 0 + 2 × ${nb(a)} × ${nb(d)} = ${nb(2 * a * d)} → v = ${nb(v)} m/s.` }; } },
      { fiche: E.frein, gen: (r) => {
        const V = r.pick([4, 6, 8, 10]), d = r.pick([0.5, 1, 1.5, 2]), v0 = V / 3.6, a = -v0 * v0 / (2 * d);
        return { enonce: `Un fauteuil roulant électrique roulant à <b>${V} km/h</b> doit s'arrêter sur <b>${nb(d)} m</b>. Accélération constante nécessaire (avec son signe) ?`, reponse: a, unite: "m/s<sup>2</sup>",
          explication: `v<sub>0</sub> = ${nb(v0)} m/s ; 0 = v<sub>0</sub>² + 2·a·d → a = −v<sub>0</sub>² / (2·d) = −${nb(v0 * v0)} / ${nb(2 * d)} = ${nb(a)} m/s².` }; } },
      { fiche: E.frein, gen: (r) => {
        const V = r.pick([30, 50, 70, 90, 110]), a = r.pick([4, 5, 6, 7, 8]), v0 = V / 3.6, t = v0 / a;
        return { enonce: `Une voiture à <b>${V} km/h</b> freine avec <b>a = −${a} m/s²</b> (constante). Durée du freinage jusqu'à l'arrêt ?`, reponse: t, unite: "s",
          explication: `0 = a·t + v<sub>0</sub> → t = v<sub>0</sub> / |a| = ${nb(v0)} / ${a} = ${nb(t)} s.` }; } },
      { fiche: E.frein, gen: (r) => {
        const V = r.pick([50, 70, 90, 110, 130]), tr = r.pick([0.75, 1, 1.5, 2]), a = r.pick([5, 6, 7, 8]), v0 = V / 3.6, dr = v0 * tr, df = v0 * v0 / (2 * a);
        return { enonce: `Un conducteur roule à <b>${V} km/h</b>. Temps de réaction : <b>${nb(tr)} s</b> (MRU), puis freinage à <b>a = −${a} m/s²</b>. Distance d'arrêt totale ?`, reponse: dr + df, unite: "m", tolerance: 3,
          explication: `v<sub>0</sub> = ${nb(v0)} m/s. Réaction : d<sub>r</sub> = v<sub>0</sub>·t<sub>r</sub> = ${nb(dr)} m. Freinage : d<sub>f</sub> = v<sub>0</sub>²/(2|a|) = ${nb(df)} m. Total = ${nb(dr + df)} m.` }; } },
      { type: "qcm", fiche: E.frein, enonce: "La « formule utile » v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>) est particulièrement pratique quand…", choix: ["on ne connaît pas (et ne cherche pas) la durée du mouvement", "le mouvement est uniforme (a = 0)", "on cherche la durée du mouvement", "le mouvement est une rotation"], bonne: 0, explication: "Elle est obtenue en éliminant t entre v = a·t + v<sub>0</sub> et x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> : elle relie vitesses, accélération et distance sans le temps." },
      { fiche: E.frein, gen: (r) => {
        const k = r.pick([2, 3]);
        return qcm(`Sur route sèche (même décélération), un conducteur roule <b>${k === 2 ? "deux" : "trois"} fois plus vite</b>. Sa distance de freinage est…`,
          [`multipliée par ${k * k}`, `multipliée par ${k}`, `multipliée par ${k * k * k}`, `multipliée par ${2 * k}`, "inchangée"],
          `d = v<sub>0</sub>² / (2·|a|) : la distance est proportionnelle au carré de la vitesse → × ${k}² = × ${k * k}.`); } },

      // ---------- Profil de vitesse en trapèze ----------
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), a = r.pick([0.1, 0.2, 0.25, 0.5]), t = V / a;
        return { enonce: `Le plateau d'une table d'examen médicale est déplacé par un axe motorisé. Phase 1 : il accélère de 0 à <b>${nb(V)} m/s</b> avec <b>a = ${nb(a)} m/s²</b>. Durée de la phase d'accélération ?`, reponse: t, unite: "s",
          explication: `MRUV : V = a·t<sub>1</sub> → t<sub>1</sub> = V / a = ${nb(V)} / ${nb(a)} = ${nb(t)} s.` }; } },
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), a = r.pick([0.1, 0.2, 0.25, 0.5]), d = V * V / (2 * a) * 100;
        return { enonce: `Le plateau d'une table d'examen accélère de 0 à <b>${nb(V)} m/s</b> avec <b>a = ${nb(a)} m/s²</b>. Distance parcourue pendant cette phase (en cm) ?`, reponse: d, unite: "cm",
          explication: `d<sub>1</sub> = V² / (2·a) = ${nb(V)}² / (2 × ${nb(a)}) = ${nb(d / 100)} m = ${nb(d)} cm (ou ½·a·t<sub>1</sub>² avec t<sub>1</sub> = ${nb(V / a)} s).` }; } },
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.63, 1, 1.6]), ta = r.pick([1.5, 2, 2.5]), tp = r.int(3, 15), td = r.pick([1.5, 2, 2.5]), d = V * (ta / 2 + tp + td / 2);
        return { enonce: `L'ascenseur d'un hôpital : accélération de 0 à <b>${nb(V)} m/s</b> en <b>${nb(ta)} s</b>, palier à ${nb(V)} m/s pendant <b>${tp} s</b>, puis décélération jusqu'à l'arrêt en <b>${nb(td)} s</b>. Hauteur parcourue ?`, reponse: d, unite: "m",
          explication: `Aire sous v(t) : d = ½·V·t<sub>1</sub> + V·t<sub>2</sub> + ½·V·t<sub>3</sub> = ${nb(0.5 * V * ta)} + ${nb(V * tp)} + ${nb(0.5 * V * td)} = ${nb(d)} m.` }; } },
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.5, 1, 1.5]), a = r.pick([0.5, 1]), D = r.int(5, 30), da = V * V / (2 * a), tp = (D - 2 * da) / V;
        return { enonce: `Un robot de livraison doit parcourir <b>${D} m</b> : accélération <b>a = ${nb(a)} m/s²</b> jusqu'à <b>V = ${nb(V)} m/s</b>, palier, puis décélération symétrique (−${nb(a)} m/s²). Durée du palier ?`, reponse: tp, unite: "s",
          explication: `d<sub>acc</sub> = d<sub>déc</sub> = V²/(2a) = ${nb(da)} m. Palier : d<sub>2</sub> = ${D} − 2 × ${nb(da)} = ${nb(D - 2 * da)} m, à V constante : t<sub>2</sub> = d<sub>2</sub> / V = ${nb(tp)} s.` }; } },
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.5, 1, 1.5]), a = r.pick([0.5, 1]), D = r.int(5, 30), da = V * V / (2 * a), tp = (D - 2 * da) / V, T = 2 * V / a + tp;
        return { enonce: `Un robot de livraison parcourt <b>${D} m</b> avec un profil en trapèze : <b>a = ±${nb(a)} m/s²</b>, vitesse de palier <b>V = ${nb(V)} m/s</b>. Durée totale du déplacement ?`, reponse: T, unite: "s",
          explication: `t<sub>acc</sub> = t<sub>déc</sub> = V/a = ${nb(V / a)} s ; d<sub>acc</sub> = d<sub>déc</sub> = ${nb(da)} m ; t<sub>palier</sub> = (${D} − ${nb(2 * da)}) / ${nb(V)} = ${nb(tp)} s ; T = ${nb(2 * V / a)} + ${nb(tp)} = ${nb(T)} s.` }; } },
      { fiche: E.trap, gen: (r) => {
        const V = r.pick([0.2, 0.25, 0.3]), ta = r.pick([1, 1.5, 2]), tp = r.int(4, 12), td = r.pick([0.5, 1, 1.5]);
        const tab = `<table><tr><th>Phase</th><th>Durée</th><th>Vitesse</th></tr><tr><td>1 · accélération</td><td>${nb(ta)} s</td><td>0 → ${nb(V)} m/s</td></tr><tr><td>2 · palier</td><td>${tp} s</td><td>${nb(V)} m/s</td></tr><tr><td>3 · décélération</td><td>${nb(td)} s</td><td>${nb(V)} → 0 m/s</td></tr></table>`;
        if (r.int(0, 1)) { const d3 = 0.5 * V * td * 100;
          return { enonce: `Déplacement du chariot d'un lève-personne sur son rail :${tab}Distance parcourue pendant la phase 3 (en cm) ?`, reponse: d3, unite: "cm",
            explication: `Phase 3 : MRUV de ${nb(V)} m/s à 0 → d<sub>3</sub> = ½·V·t<sub>3</sub> = 0,5 × ${nb(V)} × ${nb(td)} = ${nb(d3 / 100)} m = ${nb(d3)} cm (aire du triangle sous v(t)).` }; }
        const a3 = -V / td;
        return { enonce: `Déplacement du chariot d'un lève-personne sur son rail :${tab}Accélération pendant la phase 3 (avec son signe) ?`, reponse: a3, unite: "m/s<sup>2</sup>",
          explication: `a<sub>3</sub> = (v − v<sub>0</sub>) / t<sub>3</sub> = (0 − ${nb(V)}) / ${nb(td)} = ${nb(a3)} m/s² (négative : décélération).` }; } },
      { type: "qcm", fiche: E.trap, enonce: "Dans un profil de vitesse en trapèze, pendant quelle phase l'accélération est-elle nulle ?", choix: ["Le palier (vitesse constante, MRU)", "La phase d'accélération", "La phase de décélération", "Aucune : a n'est jamais nulle"], bonne: 0, explication: "Au palier la vitesse est constante : c'est un MRU, a = 0. Les phases 1 et 3 sont des MRUV (a > 0 puis a < 0)." },
      { type: "qcm", fiche: E.trap, enonce: "Sur un graphe v(t), la distance parcourue correspond à…", choix: ["l'aire sous la courbe v(t)", "la pente de la courbe v(t)", "la valeur maximale de v", "la durée totale du mouvement"], bonne: 0, explication: "Distance = aire sous v(t) (rectangle au palier, triangles pour les phases d'accélération et de décélération). La pente de v(t), c'est l'accélération." },
      { type: "qcm", fiche: E.trap, enonce: "Accélération et décélération valent ±a. Si la distance à parcourir est <b>inférieure à V²/a</b>…", choix: ["la vitesse V n'est jamais atteinte : profil triangulaire, sans palier", "le palier dure plus longtemps", "l'accélération devient nulle", "le mouvement devient uniforme"], bonne: 0, explication: "Accélérer jusqu'à V puis freiner demande V²/(2a) + V²/(2a) = V²/a. Si la distance est plus courte, on doit freiner avant d'atteindre V." },

      // ---------- Rotations ----------
      { fiche: E.rot, gen: (r) => {
        const N = r.pick([30, 45, 60, 90, 120]), t = r.int(5, 30), w = PI * N / 30, th = w * t;
        return { enonce: `Le plateau d'un agitateur de laboratoire tourne à <b>${N} tr/min</b> constants. Angle parcouru en <b>${t} s</b> (en rad) ?`, reponse: th, unite: "rad",
          explication: `MCU : θ = ω·t avec ω = π × ${N} / 30 = ${nb(w)} rad/s → θ = ${nb(w)} × ${t} = ${nb(th)} rad (soit ${nb(th / (2 * PI))} tours).` }; } },
      { fiche: E.rot, gen: (r) => {
        const al = r.pick([20, 25, 40, 50]), N = r.pick([1500, 2000, 3000, 4000]), w = PI * N / 30, t = w / al;
        return { enonce: `Une centrifugeuse démarre avec <b>α = ${al} rad/s²</b> (constante). Durée pour atteindre <b>${N} tr/min</b> ?`, reponse: t, unite: "s",
          explication: `ω = π × ${N} / 30 = ${nb(w)} rad/s ; ω = α·t (ω<sub>0</sub> = 0) → t = ω / α = ${nb(w)} / ${al} = ${nb(t)} s.` }; } },
      { fiche: E.rot, gen: (r) => {
        const al = r.pick([10, 20, 25, 40]), t = r.int(2, 8), th = 0.5 * al * t * t, n = th / (2 * PI);
        return { enonce: `Une centrifugeuse démarre de l'arrêt avec <b>α = ${al} rad/s²</b>. Nombre de tours effectués pendant les <b>${t} premières secondes</b> ?`, reponse: n, unite: "tours",
          explication: `MCUV : θ = ½·α·t² = 0,5 × ${al} × ${t}² = ${nb(th)} rad ; nombre de tours = θ / 2π = ${nb(n)} tours.` }; } },
      { fiche: E.rot, gen: (r) => {
        const N = r.pick([1500, 2000, 3000]), n = r.pick([50, 80, 100, 150, 200]), w0 = PI * N / 30, th = 2 * PI * n, al = -w0 * w0 / (2 * th);
        return { enonce: `Une centrifugeuse tournant à <b>${N} tr/min</b> s'arrête en <b>${n} tours</b> (décélération constante). Accélération angulaire α (avec son signe) ?`, reponse: al, unite: "rad/s<sup>2</sup>",
          explication: `ω<sub>0</sub> = ${nb(w0)} rad/s ; θ − θ<sub>0</sub> = 2π × ${n} = ${nb(th)} rad. 0 = ω<sub>0</sub>² + 2·α·(θ − θ<sub>0</sub>) → α = −ω<sub>0</sub>² / (2·Δθ) = ${nb(al)} rad/s².` }; } },
      { fiche: E.rot, gen: (r) => {
        const al = r.pick([2, 4, 5, 8]), n = r.pick([1, 2, 3, 5]), th = 2 * PI * n, w = Math.sqrt(2 * al * th);
        return { enonce: `Un plateau tournant démarre de l'arrêt avec <b>α = ${al} rad/s²</b>. Vitesse angulaire atteinte après <b>${n} tour${n > 1 ? "s" : ""}</b> ?`, reponse: w, unite: "rad/s",
          explication: `Δθ = 2π × ${n} = ${nb(th)} rad ; ω² = ω<sub>0</sub>² + 2·α·Δθ = 2 × ${al} × ${nb(th)} = ${nb(w * w)} → ω = ${nb(w)} rad/s.` }; } },
      { fiche: E.rot, gen: (r) => {
        const N = r.pick([60, 80, 100, 120]), al = r.pick([2, 3, 4, 5]), w0 = PI * N / 30, t = w0 / al;
        return { enonce: `Les roues d'un fauteuil tournent à <b>${N} tr/min</b>. On freine avec <b>α = −${al} rad/s²</b>. Durée jusqu'à l'arrêt ?`, reponse: t, unite: "s",
          explication: `ω<sub>0</sub> = π × ${N} / 30 = ${nb(w0)} rad/s ; 0 = α·t + ω<sub>0</sub> → t = ω<sub>0</sub> / |α| = ${nb(t)} s.` }; } },
      { fiche: E.rot, gen: (r) => {
        const th0 = r.pas(0.2, 1, 0.1), w = r.pas(0.2, 1.5, 0.1), t = r.int(2, 10), th = w * t + th0;
        return { enonce: `Le bras d'un robot part de <b>θ<sub>0</sub> = ${nb(th0)} rad</b> et tourne à <b>ω = ${nb(w)} rad/s</b> constante. Position angulaire à <b>t = ${t} s</b> ?`, reponse: th, unite: "rad",
          explication: `MCU : θ = ω·t + θ<sub>0</sub> = ${nb(w)} × ${t} + ${nb(th0)} = ${nb(th)} rad.` }; } },
      { type: "qcm", fiche: E.rot, enonce: "Équation de la position angulaire θ(t) en rotation uniformément variée (MCUV) :", choix: ["θ = ½·α·t² + ω<sub>0</sub>·t + θ<sub>0</sub>", "θ = α·t + ω<sub>0</sub>", "θ = ω<sub>0</sub>·t + θ<sub>0</sub>", "θ = ½·ω<sub>0</sub>·t² + α·t + θ<sub>0</sub>"], bonne: 0, explication: "Même forme qu'en MRUV (x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub>) en remplaçant x par θ, v par ω et a par α. θ = ω<sub>0</sub>·t + θ<sub>0</sub> est le MCU." },
      { type: "qcm", fiche: E.rot, enonce: "En rotation, les grandeurs qui jouent le rôle de x, v et a (translation) sont…", choix: ["θ, ω, α", "ω, θ, α", "α, ω, θ", "θ, α, ω"], bonne: 0, explication: "Position angulaire θ (rad), vitesse angulaire ω (rad/s), accélération angulaire α (rad/s²)." }
    ],
    fiches: [
      { id: E.mru, titre: "Mouvement rectiligne uniforme (MRU)",
        recto: "Quelles sont les équations horaires d'un MRU et l'allure de ses graphes ?",
        verso: `<div class="formule">a = 0 &nbsp;·&nbsp; v = v<sub>0</sub> = constante &nbsp;·&nbsp; x = v<sub>0</sub>·t + x<sub>0</sub></div><ul><li>x<sub>0</sub> : position à t = 0 ; v<sub>0</sub> : vitesse (conditions initiales).</li><li>x(t) : droite de pente v<sub>0</sub> ; v(t) : droite horizontale.</li><li>Durée : t = (x − x<sub>0</sub>) / v<sub>0</sub>.</li></ul><p class="astuce">Pente de x(t) = vitesse. Penser aux km/h → m/s.</p>`,
        quiz: [
          { enonce: "En MRU, a = …", choix: ["0", "une constante non nulle", "v / t"], bonne: 0 },
          { enonce: "x = 2·t + 5 (SI) : v<sub>0</sub> = …", choix: ["2 m/s", "5 m/s", "7 m/s"], bonne: 0 }
        ] },
      { id: E.mruv, titre: "Mouvement rectiligne uniformément varié (MRUV)",
        recto: "Quelles sont les équations horaires d'un MRUV ?",
        verso: `<div class="formule">a = constante</div><div class="formule">v = a·t + v<sub>0</sub> &nbsp;·&nbsp; x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub></div><ul><li>x(t) : parabole ; v(t) : droite de pente a ; a(t) : horizontale.</li><li>a &gt; 0 : accéléré ; a &lt; 0 : décéléré (freinage).</li></ul><p class="astuce">x = 1,5·t² + … → a = 3 m/s² : ne pas oublier le ½.</p>`,
        quiz: [
          { enonce: "Départ arrêté, a = 2 m/s², t = 3 s : v = …", choix: ["6 m/s", "9 m/s", "3 m/s"], bonne: 0 },
          { enonce: "En MRUV, x(t) est…", choix: ["Une parabole", "Une droite", "Horizontale"], bonne: 0 },
          { enonce: "x = 2·t² (SI) → a = …", choix: ["4 m/s²", "2 m/s²", "1 m/s²"], bonne: 0 }
        ] },
      { id: E.frein, titre: "La formule sans le temps (freinage)",
        recto: "Quelle formule relie v, v0, a et la distance sans passer par le temps ? Comment l'utiliser pour un freinage ?",
        verso: `<div class="formule">v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>)</div><ul><li>Arrêt (v = 0) : distance de freinage d = v<sub>0</sub>² / (2·|a|).</li><li>Durée de freinage : t = v<sub>0</sub> / |a|.</li><li>Distance d'arrêt = v<sub>0</sub>·t<sub>réaction</sub> + distance de freinage.</li></ul><p class="astuce">Vitesse × 2 → distance de freinage × 4. Convertir les km/h en m/s !</p>`,
        quiz: [
          { enonce: "v<sub>0</sub> = 10 m/s, a = −5 m/s² : distance de freinage = …", choix: ["10 m", "20 m", "1 m"], bonne: 0 },
          { enonce: "Vitesse triplée → distance de freinage…", choix: ["× 9", "× 3", "× 6"], bonne: 0 }
        ] },
      { id: E.trap, titre: "Profil de vitesse en trapèze",
        recto: "Comment décrire et calculer un mouvement en trois phases (accélération, palier, décélération) ?",
        verso: `<ul><li><b>Phase 1</b> (MRUV, a &gt; 0) : t<sub>1</sub> = V/a ; d<sub>1</sub> = V²/(2a) = ½·V·t<sub>1</sub></li><li><b>Phase 2</b> (palier, MRU, a = 0) : d<sub>2</sub> = V·t<sub>2</sub></li><li><b>Phase 3</b> (MRUV, a &lt; 0) jusqu'à l'arrêt : d<sub>3</sub> = ½·V·t<sub>3</sub></li></ul><div class="formule">distance totale = aire sous v(t)</div><p class="astuce">Si d &lt; V²/a (phases 1 et 3 symétriques) : pas de palier, profil triangulaire.</p>`,
        quiz: [
          { enonce: "Pendant le palier, a = …", choix: ["0", "V / t", "une constante positive"], bonne: 0 },
          { enonce: "V = 1 m/s, a = 0,5 m/s² : durée d'accélération", choix: ["2 s", "0,5 s", "1,5 s"], bonne: 0 }
        ] },
      { id: E.rot, titre: "Rotation uniforme et uniformément variée",
        recto: "Quelles sont les équations horaires d'une rotation (MCU et MCUV) ?",
        verso: `<div class="formule">MCU : α = 0 · θ = ω<sub>0</sub>·t + θ<sub>0</sub></div><div class="formule">MCUV : ω = α·t + ω<sub>0</sub> · θ = ½·α·t² + ω<sub>0</sub>·t + θ<sub>0</sub></div><div class="formule">ω² = ω<sub>0</sub>² + 2·α·(θ − θ<sub>0</sub>)</div><p>θ en rad, ω en rad/s (ω = π·N/30), α en rad/s² ; nb de tours = θ / 2π.</p><p class="astuce">Mêmes équations qu'en translation : x → θ, v → ω, a → α.</p>`,
        quiz: [
          { enonce: "Départ arrêté, α = 10 rad/s², t = 2 s : ω = …", choix: ["20 rad/s", "40 rad/s", "5 rad/s"], bonne: 0 },
          { enonce: "θ = 4π rad correspond à…", choix: ["2 tours", "4 tours", "1 tour"], bonne: 0 }
        ] }
    ]
  });

  /* =====================================================================
     MODULE 3 — Liaisons mécaniques normalisées et schéma cinématique
     Tableau interne : orientation « canonique » (axe principal x, normale z),
     permutée au hasard pour varier les axes.
     ===================================================================== */
  const L = { ddl: "1si-s6-li-ddl", noms: "1si-s6-li-noms", symb: "1si-s6-li-symb", tors: "1si-s6-li-tors", sch: "1si-s6-li-schema" };

  const LI = [
    { k: "enc", nom: "Encastrement", T: [], R: [], code: "0T + 0R", tc: 3, axe: "",
      surf: null, ex: ["une roue fixée par ses écrous sur le moyeu", "deux pièces soudées entre elles", "le guidon serré sur la potence d'un vélo"],
      symb: "les traits des deux pièces réunis par un petit triangle noirci (pièces soudées)" },
    { k: "piv", nom: "Pivot", T: [], R: ["x"], code: "0T + 1R", tc: 3, axe: "d'axe (O, {a})",
      surf: "cylindre / cylindre, avec deux arrêts axiaux (épaulements)", ex: ["la roue d'un fauteuil roulant sur son axe", "une charnière de porte", "le levier A de la perforatrice sur le bâti B"],
      symb: "vu de côté : un rectangle traversé par l'arbre, avec un petit trait d'arrêt perpendiculaire à l'arbre de chaque côté" },
    { k: "gli", nom: "Glissière", T: ["x"], R: [], code: "1T + 0R", tc: 3, axe: "d'axe (O, {a})",
      surf: "surfaces prismatiques (section non circulaire, par exemple en queue d'aronde)", ex: ["un tiroir dans son meuble", "le coulisseau d'un pied à coulisse sur sa règle"],
      symb: "vu suivant l'axe : un petit carré emboîté dans un carré plus grand (section non circulaire)" },
    { k: "hel", nom: "Hélicoïdale", T: ["x"], R: ["x"], comb: true, code: "1T + 1R combinés", tc: 3, axe: "d'axe (O, {a}) et de pas p",
      surf: "filetage d'une vis dans le taraudage d'un écrou", ex: ["une vis dans son écrou", "la vis de serrage d'un étau", "la vis d'un cric de voiture"],
      symb: "un rectangle traversé par l'arbre, avec un trait en zigzag (le filet) dessiné à l'intérieur" },
    { k: "pg", nom: "Pivot glissant", T: ["x"], R: ["x"], code: "1T + 1R", tc: 3, axe: "d'axe (O, {a})",
      surf: "cylindre / cylindre, sans arrêt axial", ex: ["la tige d'un vérin dans son corps", "le poinçon C de la perforatrice dans le bâti B"],
      symb: "vu de côté : un rectangle traversé par l'arbre, sans aucun trait d'arrêt" },
    { k: "sad", nom: "Sphérique à doigt", T: [], R: ["y", "z"], code: "0T + 2R", tc: 3, axe: "de centre O (rotation autour de {a} bloquée)",
      surf: null, ex: ["le levier de vitesses d'une voiture", "le joystick d'un fauteuil roulant électrique (le manche ne tourne pas sur lui-même)"],
      symb: "le symbole de la rotule, avec en plus un petit doigt engagé dans une rainure" },
    { k: "rot", nom: "Rotule (sphérique)", T: [], R: ["x", "y", "z"], code: "0T + 3R", tc: 3, axe: "de centre O",
      surf: "sphère / sphère (boule dans une cage sphérique)", ex: ["la boule d'attelage d'une remorque", "l'articulation de la hanche (modèle simplifié)"],
      symb: "un cercle (la sphère) enveloppé par un arc de cercle (la cage)" },
    { k: "ap", nom: "Appui plan", T: ["x", "y"], R: ["z"], code: "2T + 1R", tc: 3, axe: "de normale (O, {c})",
      surf: "plan / plan", ex: ["un fer à repasser sur sa planche", "un livre posé à plat sur une table"],
      symb: "deux traits parallèles (deux plaques) accolés l'un à l'autre" },
    { k: "lr", nom: "Linéaire rectiligne", T: ["x", "y"], R: ["x", "z"], code: "2T + 2R", tc: 1, axe: "de ligne de contact (O, {a}) et de normale {c}",
      surf: "cylindre / plan (contact le long d'une ligne droite)", ex: ["un rouleau à pâtisserie posé sur une table", "un crayon rond posé à plat sur un bureau"],
      symb: "un dièdre (triangle) dont l'arête repose sur un trait (le plan)" },
    { k: "la", nom: "Linéaire annulaire", T: ["x"], R: ["x", "y", "z"], code: "1T + 3R", tc: 2, axe: "de centre O et d'axe (O, {a})",
      surf: "sphère / cylindre (sphère dans un alésage)", ex: ["une bille enfermée dans un tube", "une boule en bout de tige coulissant dans un alésage"],
      symb: "un cercle (la sphère) placé entre deux traits parallèles (le cylindre)" },
    { k: "pon", nom: "Ponctuelle", T: ["x", "y"], R: ["x", "y", "z"], code: "2T + 3R", tc: 0, axe: "de normale (O, {c})",
      surf: "sphère / plan", ex: ["une bille posée sur une table", "le levier A appuyant sur la tête du poinçon C de la perforatrice"],
      symb: "une pointe (ou un petit arc de sphère) posée sur un trait (le plan)" }
  ];
  LI.forEach((l) => { l.nT = l.T.length; l.nR = l.R.length; l.ddl = l.comb ? 1 : l.nT + l.nR; l.nomc = l.nom.toLowerCase(); });
  const liaison = (k) => LI.find((l) => l.k === k);
  const XYZ = ["x", "y", "z"];
  const PERMS = [["x", "y", "z"], ["x", "z", "y"], ["y", "x", "z"], ["y", "z", "x"], ["z", "x", "y"], ["z", "y", "x"]];
  const CANON = PERMS[0];
  const mapc = (c, p) => p[XYZ.indexOf(c)];
  const axeDe = (l, p) => l.axe.replace(/\{([abc])\}/g, (m, k) => p["abc".indexOf(k)]);
  const nomAxe = (l, p) => (l.axe ? `${l.nomc} ${axeDe(l, p)}` : l.nomc);
  const Tm = (l, p) => l.T.map((c) => mapc(c, p)).sort();
  const Rm = (l, p) => l.R.map((c) => mapc(c, p)).sort();
  const ddlTexte = (l, p) => {
    if (!l.ddl) return "aucun (0 ddl)";
    const T = Tm(l, p).map((c) => "T" + c), R = Rm(l, p).map((c) => "R" + c);
    if (l.comb) return `${T[0]} et ${R[0]} combinés (liés)`;
    return [...T, ...R].join(", ");
  };
  const torseurTable = (l, p) => {
    const T = Tm(l, p), R = Rm(l, p);
    const lignes = XYZ.map((c) => `<tr><th>${c}</th><td>${R.includes(c) ? `ω<sub>${c}</sub>` : "0"}</td><td>${T.includes(c) ? `V<sub>${c}</sub>` : "0"}</td></tr>`).join("");
    const note = l.comb ? `<p>avec V<sub>${T[0]}</sub> = p·ω<sub>${T[0]}</sub> / 2π (p : pas)</p>` : "";
    return `<table style="width:auto;margin:8px auto"><tr><th></th><th>ω (rotations)</th><th>V (translations)</th></tr>${lignes}</table>${note}`;
  };
  const torseurTexte = (l, p) => {
    const T = Tm(l, p), R = Rm(l, p);
    if (!l.ddl) return "Toutes les composantes nulles";
    if (l.comb) return `Seuls ω<sub>${R[0]}</sub> et V<sub>${T[0]}</sub> non nuls, liés par le pas (V<sub>${T[0]}</sub> = p·ω<sub>${R[0]}</sub>/2π)`;
    return `Non nuls : ${[...R.map((c) => `ω<sub>${c}</sub>`), ...T.map((c) => `V<sub>${c}</sub>`)].join(", ")} ; les autres nuls`;
  };
  const autresL = (r, l, n, filtre) => r.melange(LI.filter((m) => m !== l && (!filtre || filtre(m)))).slice(0, n);
  const plur = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;
  const TYPES_CONTACT = ["ponctuel", "linéique rectiligne", "linéique circulaire", "surfacique"];
  const PROPS = [
    ["n'autorise aucune translation mais au moins une rotation", (l) => l.nT === 0 && l.nR > 0],
    ["n'autorise aucune rotation mais au moins une translation", (l) => l.nR === 0 && l.nT > 0],
    ["autorise les 3 rotations Rx, Ry et Rz", (l) => l.nR === 3],
    ["autorise exactement 2 translations", (l) => l.nT === 2],
    ["possède exactement 1 degré de liberté", (l) => l.ddl === 1],
    ["possède au moins 4 degrés de liberté", (l) => l.ddl >= 4]
  ];
  const SYSTEMES = [
    { nom: "la perforatrice", classes: [["A", [1, 2, 3]], ["B", [4, 5, 9, 10]], ["C", [6, 7]]], ressort: 8,
      liaisons: [["A", "B", "piv", "l'axe 3 (lié au levier A) tourne dans le bâti B : une seule rotation possible"],
        ["B", "C", "pg", "le poinçon C coulisse et peut tourner dans l'alésage cylindrique du bâti B"],
        ["A", "C", "pon", "le levier A appuie en un point sur la tête du poinçon C"]] },
    { nom: "la bride de serrage (fiche de synthèse)", classes: [["0", [1, 3, 4, 5, 6]], ["A", [2, 11]], ["B", [7, 8, 9]]], ressort: 10,
      liaisons: [["0", "A", "pg", "surfaces cylindriques d'axe y : ddl Ty et Ry → pivot glissant d'axe y"],
        ["0", "B", "piv", "la bride B tourne autour d'un axe z fixe : pivot d'axe z"],
        ["A", "B", "pon", "contact en un point entre A et la bride B"]] }
  ];
  const MODES = ["vissées", "soudées", "collées", "goupillées", "rivetées", "emmanchées en force"];

  SIP.definirModule({
    id: "1si-s6-liaisons",
    niveaux: ["1SI"],
    sequence: S6,
    titre: "Liaisons mécaniques et schéma cinématique",
    description: "Degrés de liberté, liaisons normalisées et leurs symboles, forme du torseur cinématique, classes d'équivalence, graphe des liaisons et schéma cinématique.",
    competences: ["M6", "M7", "M1"],
    nbQuestions: 10,
    questions: [
      // ---------- Degrés de liberté et contacts ----------
      { type: "qcm", fiche: L.ddl, enonce: "Combien de mouvements élémentaires possède un solide totalement libre dans l'espace ?", choix: ["6 : 3 translations et 3 rotations", "3 : Tx, Ty et Tz", "4 : 2 translations et 2 rotations", "12 : 6 dans chaque sens"], bonne: 0, explication: "Tx, Ty, Tz (translations le long des axes) et Rx, Ry, Rz (rotations autour des axes). Le sens du mouvement ne compte pas." },
      { type: "qcm", fiche: L.ddl, enonce: "Un <b>degré de liberté</b> (ddl) d'une liaison est…", choix: ["un mouvement élémentaire autorisé entre les deux pièces", "un mouvement interdit par la liaison", "une surface de contact entre les pièces", "une pièce du mécanisme"], bonne: 0, explication: "Le nombre de mouvements autorisés par une liaison est son nombre de degrés de liberté ; il dépend de la nature et du nombre de surfaces en contact." },
      { type: "qcm", fiche: L.ddl, enonce: "Dans le tableau des mobilités d'une liaison, la valeur <b>0</b> en face de Rz signifie…", choix: ["la rotation autour de z est interdite", "la rotation autour de z est autorisée", "la rotation autour de z vaut 0 rad", "la translation selon z est interdite"], bonne: 0, explication: "Convention du cours : 1 = mouvement autorisé (présence d'un ddl), 0 = mouvement interdit (absence de ddl)." },
      { type: "qcm", fiche: L.ddl, enonce: "Une porte ne peut s'ouvrir que de 0 à 110°. Pour sa liaison avec le mur, cette rotation compte comme…", choix: ["un degré de liberté (seule la possibilité du mouvement compte)", "un demi degré de liberté", "aucun degré de liberté car l'angle est limité", "deux degrés de liberté (ouverture et fermeture)"], bonne: 0, explication: "Le sens et l'amplitude du mouvement n'entrent pas en compte : la rotation est physiquement possible, c'est 1 ddl." },
      { fiche: L.ddl, gen: (r) => {
        const l = r.pick(LI), bon = TYPES_CONTACT[l.tc];
        return qcm(`Quelle est la nature du contact d'une liaison <b>${l.nomc}</b> ?`, [cap(bon), ...TYPES_CONTACT.filter((t) => t !== bon).map(cap)],
          `${l.nom} : contact ${bon}${l.surf ? ` — ${l.surf}` : ""}. Ponctuel : sphère/plan ; linéique rectiligne : cylindre/plan ; linéique circulaire : sphère/cylindre ; les autres sont surfaciques.`); } },
      { fiche: L.ddl, gen: (r) => {
        const l = r.pick(LI.filter((m) => m.surf)), f = autresL(r, l, 3);
        return qcm(`Deux pièces sont en contact par <b>${l.surf}</b>. Quelle liaison normalisée ?`, [l.nom, ...f.map((m) => m.nom)],
          `${l.nom} (${l.code}) : ${ddlTexte(l, CANON)} pour une liaison ${nomAxe(l, CANON)}.`); } },
      { fiche: L.ddl, gen: (r) => {
        const l = r.pick(LI);
        return { enonce: `Combien de degrés de liberté possède une liaison <b>${l.nomc}</b> ?`, reponse: l.ddl, absolu: 0.01, unite: "ddl",
          explication: `${l.nom} ${axeDe(l, CANON)} : ${ddlTexte(l, CANON)} → ${l.ddl} ddl (${l.code}).${l.comb ? " Translation et rotation sont liées par le pas : un seul mouvement indépendant." : ""}` }; } },
      { fiche: L.ddl, gen: (r) => {
        const l = r.pick(LI);
        return { enonce: `Combien de mouvements élémentaires une liaison <b>${l.nomc}</b> <b>interdit</b>-elle ?`, reponse: 6 - l.ddl, absolu: 0.01, unite: "",
          explication: `Un solide libre a 6 mouvements élémentaires. ${l.nom} : ${l.ddl} ddl (${l.code}), donc 6 − ${l.ddl} = ${6 - l.ddl} mouvements interdits.` }; } },

      // ---------- Liaisons normalisées ----------
      { fiche: L.noms, gen: (r) => {
        const p = r.pick(PERMS), l = r.pick(LI), f = autresL(r, l, 3);
        const mv = l.ddl ? `les seuls mouvements possibles sont : <b>${ddlTexte(l, p)}</b>` : "<b>aucun mouvement</b> n'est possible";
        return qcm(`Entre deux pièces, ${mv}. Quelle liaison ?`, [l.nom, ...f.map((m) => m.nom)], `Liaison ${nomAxe(l, p)} : ${ddlTexte(l, p)} (${l.code}).`); } },
      { fiche: L.noms, gen: (r) => {
        const p = r.pick(PERMS), l = r.pick(LI.filter((m) => m.ddl > 0)), f = autresL(r, l, 3);
        return qcm(`Quels sont les degrés de liberté d'une liaison <b>${nomAxe(l, p)}</b> ?`, [ddlTexte(l, p), ...f.map((m) => ddlTexte(m, p))],
          `${l.nom} (${l.code}) ${axeDe(l, p)} : ${ddlTexte(l, p)}.`); } },
      { fiche: L.noms, gen: (r) => {
        const l = r.pick(LI.filter((m) => !m.comb)), f = autresL(r, l, 3, (m) => !m.comb);
        return qcm(`Quelle liaison a pour mobilités <b>${l.code}</b>, soit ${plur(l.nT, "translation")} et ${plur(l.nR, "rotation")} indépendantes ?`, [l.nom, ...f.map((m) => m.nom)],
          `${l.nom} : ${l.code}, soit ${l.ddl} ddl.`); } },
      { fiche: L.noms, gen: (r) => {
        const l = r.pick(LI), ex = r.pick(l.ex), f = autresL(r, l, 3);
        return qcm(`<b>${cap(ex)}</b> : quelle liaison modélise ce contact ?`, [l.nom, ...f.map((m) => m.nom)], `${l.nom} (${l.code}) : ${ddlTexte(l, CANON)} pour une liaison ${nomAxe(l, CANON)}.`); } },
      { fiche: L.noms, gen: (r) => {
        const l = r.pick(LI), f = autresL(r, l, 3);
        return qcm(`Quel exemple se modélise par une liaison <b>${l.nomc}</b> ?`, [cap(r.pick(l.ex)), ...f.map((m) => cap(r.pick(m.ex)))],
          `${l.nom} (${l.code}). Les autres exemples : ${f.map((m) => m.nomc).join(", ")}.`); } },
      { fiche: L.noms, gen: (r) => {
        const [prop, test] = r.pick(PROPS), l = r.pick(LI.filter(test)), f = r.melange(LI.filter((m) => !test(m))).slice(0, 3);
        return qcm(`Parmi ces liaisons, laquelle <b>${prop}</b> ?`, [l.nom, ...f.map((m) => m.nom)],
          `${l.nom} : ${l.code}. Les autres : ${f.map((m) => `${m.nomc} (${m.code})`).join(" ; ")}.`); } },
      { fiche: L.noms, gen: (r) => {
        const ls = r.melange(LI).slice(0, 4);
        const faux = (l) => { const d = l.ddl === 0 ? 1 : l.ddl === 5 ? 4 : l.ddl + r.pick([-1, 1]); return `La liaison ${l.nomc} possède ${d} ddl`; };
        return qcm("Une seule de ces affirmations est vraie. Laquelle ?", [`La liaison ${ls[0].nomc} possède ${ls[0].ddl} ddl`, ...ls.slice(1).map(faux)],
          `${ls.map((l) => `${l.nom} : ${l.ddl} ddl (${l.code})`).join(" ; ")}.`); } },
      { type: "qcm", fiche: L.noms, enonce: "Exemple du cours : entre les classes 0 et A, les surfaces de contact sont cylindriques d'axe y et les ddl sont <b>Ty et Ry</b>. Liaison ?", choix: ["Pivot glissant d'axe y", "Pivot d'axe y", "Glissière d'axe y", "Linéaire annulaire d'axe y"], bonne: 0, explication: "Une translation et une rotation indépendantes le long / autour du même axe : pivot glissant d'axe (O, y). Le pivot n'a que Ry, la glissière que Ty." },
      { type: "qcm", fiche: L.noms, enonce: "Degrés de liberté d'une liaison <b>sphérique à doigt</b> ?", choix: ["2 rotations (0T + 2R)", "3 rotations (0T + 3R)", "1 translation et 1 rotation (1T + 1R)", "2 translations (2T + 0R)"], bonne: 0, explication: "C'est une rotule dont le doigt, engagé dans une rainure, bloque une des trois rotations : il en reste 2." },
      { type: "qcm", fiche: L.noms, enonce: "Quelle liaison possède le plus de degrés de liberté (5) ?", choix: ["La ponctuelle (sphère / plan)", "La rotule", "La linéaire annulaire", "L'appui plan"], bonne: 0, explication: "Ponctuelle : 2T + 3R = 5 ddl. Seule la translation selon la normale au plan est interdite. Plus la zone de contact est petite, plus il y a de ddl." },

      // ---------- Symboles ----------
      { fiche: L.symb, gen: (r) => {
        const l = r.pick(LI), f = autresL(r, l, 3);
        return qcm(`Sur un schéma cinématique, on voit <b>${l.symb}</b>. Quelle liaison est représentée ?`, [l.nom, ...f.map((m) => m.nom)], `C'est le symbole normalisé de la liaison ${l.nomc} (${l.code}).`); } },
      { fiche: L.symb, gen: (r) => {
        const l = r.pick(LI), f = autresL(r, l, 3);
        return qcm(`Quel symbole représente une liaison <b>${l.nomc}</b> ?`, [cap(l.symb), ...f.map((m) => cap(m.symb))], `${l.nom} : ${l.symb}.`); } },
      { type: "qcm", fiche: L.symb, enonce: "Sur un schéma cinématique, la pièce de référence (bâti, immobile par rapport à la Terre) est repérée par…", choix: ["des hachures (symbole du bâti)", "une flèche courbe", "un cercle noirci", "un trait en pointillés"], bonne: 0, explication: "La classe de référence (référentiel galiléen, ou à défaut celle qui sert de référence) est repérée par des hachures." },
      { type: "qcm", fiche: L.symb, enonce: "Pourquoi utilise-t-on des couleurs sur un schéma cinématique ?", choix: ["Une couleur par classe d'équivalence : on voit quelles pièces bougent ensemble", "Pour indiquer les matériaux des pièces", "Pour indiquer les dimensions", "Chaque type de liaison a une couleur imposée par la norme"], bonne: 0, explication: "Conseil du cours : colorier chaque classe d'équivalence cinématique facilite l'écriture et la lecture du schéma." },
      { type: "qcm", fiche: L.symb, enonce: "Sur le symbole d'une liaison <b>pivot</b> vue de côté, les deux petits traits de part et d'autre du rectangle représentent…", choix: ["les arrêts axiaux, qui suppriment la translation le long de l'axe", "les roulements", "le sens de rotation", "les vis de fixation"], bonne: 0, explication: "Sans ces arrêts, l'arbre pourrait aussi coulisser : ce serait une liaison pivot glissant (rectangle seul)." },

      // ---------- Torseur cinématique ----------
      { fiche: L.tors, gen: (r) => {
        const p = r.pick(PERMS), l = r.pick(LI), f = autresL(r, l, 3, (m) => !(["pg", "hel"].includes(m.k) && ["pg", "hel"].includes(l.k)));
        return qcm(`Le torseur cinématique d'une liaison, écrit en O dans (x, y, z), a la forme :${torseurTable(l, p)}Quelle liaison ?`, [l.nom, ...f.map((m) => m.nom)],
          `Composante non nulle = mouvement autorisé : ${ddlTexte(l, p)} → liaison ${nomAxe(l, p)}.`); } },
      { fiche: L.tors, gen: (r) => {
        const p = r.pick(PERMS), l = r.pick(LI), f = autresL(r, l, 3);
        return qcm(`Forme du torseur cinématique d'une liaison <b>${nomAxe(l, p)}</b> ?`, [torseurTexte(l, p), ...f.map((m) => torseurTexte(m, p))],
          `ddl : ${ddlTexte(l, p)}. Chaque rotation autorisée donne un ω non nul, chaque translation autorisée un V non nul.`); } },
      { fiche: L.tors, gen: (r) => {
        const p = r.pick(PERMS);
        const comps = (l) => ({ nn: [...Rm(l, p).map((c) => `ω<sub>${c}</sub>`), ...Tm(l, p).map((c) => `V<sub>${c}</sub>`)] });
        const tout = XYZ.map((c) => `ω<sub>${c}</sub>`).concat(XYZ.map((c) => `V<sub>${c}</sub>`));
        if (r.int(0, 1)) {
          const l = r.pick(LI.filter((m) => m.ddl >= 3)), nn = comps(l).nn, nul = tout.filter((c) => !nn.includes(c));
          return qcm(`Dans le torseur cinématique d'une liaison <b>${nomAxe(l, p)}</b>, quelle composante est <b>forcément nulle</b> ?`, [r.pick(nul), ...r.melange(nn).slice(0, 3)],
            `ddl : ${ddlTexte(l, p)}. Les composantes associées à un mouvement interdit sont nulles : ${nul.join(", ")}.`);
        }
        const l = r.pick(LI.filter((m) => m.ddl >= 1 && m.ddl <= 3)), nn = comps(l).nn, nul = tout.filter((c) => !nn.includes(c));
        return qcm(`Dans le torseur cinématique d'une liaison <b>${nomAxe(l, p)}</b>, quelle composante <b>peut être non nulle</b> ?`, [r.pick(nn), ...r.melange(nul).slice(0, 3)],
          `ddl : ${ddlTexte(l, p)}. Seules ${nn.join(", ")} peuvent être non nulles ; les autres sont nulles (mouvements interdits).`); } },
      { type: "qcm", fiche: L.tors, enonce: "Dans un torseur cinématique, une composante <b>ω<sub>y</sub> non nulle</b> signifie…", choix: ["la rotation autour de y est autorisée (Ry = 1)", "la translation selon y est autorisée", "la liaison est un encastrement", "la vitesse selon y est interdite"], bonne: 0, explication: "Colonne de gauche : vitesses de rotation (ω) ; colonne de droite : vitesses de translation (V). ω<sub>y</sub> ≠ 0 ↔ Ry autorisée." },
      { type: "qcm", fiche: L.tors, enonce: "Pour une liaison hélicoïdale d'axe x, ω<sub>x</sub> et V<sub>x</sub> sont non nuls. Pourquoi ne compte-t-on qu'<b>un seul</b> ddl ?", choix: ["Translation et rotation sont liées par le pas : V<sub>x</sub> = p·ω<sub>x</sub>/2π", "Parce que la vis ne peut pas tourner", "Parce que V<sub>x</sub> est toujours nul", "Parce qu'une translation ne compte jamais comme ddl"], bonne: 0, explication: "Quand la vis fait un tour, l'écrou avance d'un pas p : on ne peut pas tourner sans avancer. Un seul mouvement indépendant → 1 ddl." },
      { fiche: L.tors, gen: (r) => {
        const p = r.pick([2, 2.5, 3, 4, 5, 6]), n = r.pas(5, 60, 5), d = n * p;
        return { enonce: `Le vérin électrique d'un lit médicalisé contient une vis de <b>pas p = ${nb(p)} mm</b> (liaison hélicoïdale avec l'écrou). La vis fait <b>${n} tours</b>. Déplacement de l'écrou ?`, reponse: d, unite: "mm",
          explication: `Liaison hélicoïdale : 1 tour de vis → l'écrou avance d'un pas. d = n × p = ${n} × ${nb(p)} = ${nb(d)} mm.` }; } },
      { fiche: L.tors, gen: (r) => {
        const p = r.pick([2, 3, 4, 5]), N = r.pick([300, 600, 900, 1200, 1500]), V = p * N / 60;
        return { enonce: `La vis d'un vérin électrique (pas <b>p = ${p} mm</b>) tourne à <b>${N} tr/min</b>. Vitesse de translation de l'écrou ?`, reponse: V, unite: "mm/s",
          explication: `N = ${N} / 60 = ${nb(N / 60)} tr/s ; à chaque tour l'écrou avance de ${p} mm : V = p × N = ${p} × ${nb(N / 60)} = ${nb(V)} mm/s.` }; } },
      { fiche: L.tors, gen: (r) => {
        const p = r.pick([2, 2.5, 4, 5]), c = r.pas(40, 200, 20), n = c / p;
        return { enonce: `Pour relever le dossier d'un lit médicalisé, l'écrou d'un vérin à vis doit avancer de <b>${c} mm</b>. Pas de la vis : <b>${nb(p)} mm</b>. Nombre de tours de vis ?`, reponse: n, unite: "tours",
          explication: `d = n × p → n = d / p = ${c} / ${nb(p)} = ${nb(n)} tours.` }; } },

      // ---------- Classes d'équivalence, graphe, schéma ----------
      { type: "qcm", fiche: L.sch, enonce: "Une <b>classe d'équivalence cinématique</b> (CEC) est…", choix: ["un ensemble de pièces sans mouvement les unes par rapport aux autres (liées par encastrement)", "l'ensemble des pièces qui tournent", "l'ensemble des pièces faites dans la même matière", "une liaison entre deux pièces"], bonne: 0, explication: "Les pièces d'une même CEC sont rigidement liées : elles se déplacent ensemble. On les note par exemple A = {1 ; 2 ; 3}." },
      { type: "qcm", fiche: L.sch, enonce: "Les ressorts, joints et billes de roulement…", choix: ["n'appartiennent à aucune classe d'équivalence", "forment chacun leur propre classe d'équivalence", "appartiennent toujours à la classe du bâti", "sont des liaisons encastrement"], bonne: 0, explication: "Éléments déformables et éléments roulants ne rentrent dans aucune CEC : ce sont des éléments de jonction entre les classes." },
      { type: "qcm", fiche: L.sch, enonce: "Ordre des étapes pour réaliser un schéma cinématique :", choix: ["Classes d'équivalence → graphe des liaisons → schéma cinématique", "Schéma cinématique → classes d'équivalence → graphe des liaisons", "Graphe des liaisons → classes d'équivalence → schéma cinématique", "Classes d'équivalence → schéma cinématique → graphe des liaisons"], bonne: 0, explication: "Étape 1 : repérer les CEC ; étape 2 : graphe des liaisons (nom, centre, axe) ; étape 3 : schéma cinématique minimal." },
      { type: "qcm", fiche: L.sch, enonce: "Deux classes d'équivalence n'ont <b>aucun contact</b> entre elles. Dans le graphe des liaisons…", choix: ["il n'y a pas de liaison entre elles", "on trace une liaison ponctuelle", "on trace un encastrement", "on trace une liaison pivot"], bonne: 0, explication: "Règle du cours : pas de contact → pas de liaison. Et pour étudier une liaison, on suppose le reste du mécanisme enlevé." },
      { type: "qcm", fiche: L.sch, enonce: "Le schéma cinématique d'un mécanisme…", choix: ["montre le principe de fonctionnement (mouvements), sans les formes ni les dimensions des pièces", "est un dessin à l'échelle de chaque pièce", "donne les matériaux et les solutions technologiques", "remplace le dessin d'ensemble pour la fabrication"], bonne: 0, explication: "C'est une représentation codée des classes d'équivalence et des liaisons ; il ne donne pas les solutions technologiques, mais respecte la géométrie (axes, centres, alignements)." },
      { fiche: L.sch, gen: (r) => {
        const N = r.int(8, 11), ressort = r.int(2, N), k = r.int(3, Math.min(4, Math.floor((N - 1) / 2)));
        const pieces = r.melange(Array.from({ length: N }, (_, i) => i + 1).filter((i) => i !== ressort));
        const tailles = Array(k).fill(2); for (let i = 0; i < pieces.length - 2 * k; i++) tailles[r.int(0, k - 1)]++;
        const groupes = []; let deb = 0; tailles.forEach((t) => { groupes.push(pieces.slice(deb, deb + t)); deb += t; });
        const liens = []; groupes.forEach((g) => { for (let i = 1; i < g.length; i++) liens.push(`${Math.min(g[i - 1], g[i])}–${Math.max(g[i - 1], g[i])} ${r.pick(MODES)}`); });
        return { enonce: `Un mécanisme comporte les pièces 1 à ${N} ; la pièce ${ressort} est un ressort. Assemblages rigides : <b>${r.melange(liens).join(" ; ")}</b>. Tous les autres contacts permettent un mouvement. Combien de classes d'équivalence cinématique ?`, reponse: k, absolu: 0.01, unite: "",
          explication: `On regroupe de proche en proche les pièces encastrées : ${groupes.map((g) => `{${g.slice().sort((a, b) => a - b).join(" ; ")}}`).join(", ")} → ${k} classes. Le ressort ${ressort} (déformable) n'appartient à aucune classe.` }; } },
      { fiche: L.sch, gen: (r) => {
        const s = r.pick(SYSTEMES), toutes = s.classes.flatMap(([, ps]) => ps).concat([s.ressort]), n = r.pick(toutes);
        const cl = s.classes.find(([, ps]) => ps.includes(n)), aucune = "Aucune (pièce déformable)";
        const bon = cl ? `Classe ${cl[0]}` : aucune, choix = s.classes.map(([c]) => `Classe ${c}`).concat([aucune]);
        return qcm(`Dans ${s.nom}, à quelle classe d'équivalence appartient la pièce <b>${n}</b> ?`, [bon, ...choix.filter((c) => c !== bon)],
          `${s.classes.map(([c, ps]) => `${c} = {${ps.join(" ; ")}}`).join(", ")} ; la pièce ${s.ressort} est un ressort (déformable) : aucune classe.`); } },
      { fiche: L.sch, gen: (r) => {
        const s = r.pick(SYSTEMES), [c1, c2, k, why] = r.pick(s.liaisons), l = liaison(k), f = autresL(r, l, 3);
        return qcm(`Dans le graphe des liaisons de ${s.nom}, quelle liaison relie les classes <b>${c1}</b> et <b>${c2}</b> ?`, [l.nom, ...f.map((m) => m.nom)], `${l.nom} : ${why}.`); } }
    ],
    fiches: [
      { id: L.ddl, titre: "Degrés de liberté et contacts",
        recto: "Quels sont les 6 mouvements élémentaires, et qu'appelle-t-on degré de liberté d'une liaison ?",
        verso: `<div class="formule">Tx Ty Tz + Rx Ry Rz = 6 mouvements élémentaires</div><ul><li>ddl = mouvement élémentaire <b>autorisé</b> (1) ; interdit = 0.</li><li>Le sens et l'amplitude ne comptent pas : seule la possibilité du mouvement.</li><li>Contacts : <b>ponctuel</b>, <b>linéique</b> (rectiligne ou circulaire), <b>surfacique</b> (plan, cylindre, sphère, cône, hélice).</li></ul><p class="astuce">Mouvements interdits = 6 − ddl.</p>`,
        quiz: [
          { enonce: "Nombre de mouvements élémentaires d'un solide libre :", choix: ["6", "3", "12"], bonne: 0 },
          { enonce: "Contact sphère / plan :", choix: ["Ponctuel", "Linéique", "Surfacique"], bonne: 0 }
        ] },
      { id: L.noms, titre: "Les liaisons normalisées",
        recto: "Quelles sont les liaisons normalisées et leurs degrés de liberté ?",
        verso: `<ul><li><b>0</b> : encastrement</li><li><b>1</b> : pivot (1R), glissière (1T), hélicoïdale (1T + 1R liés)</li><li><b>2</b> : pivot glissant (1T + 1R), sphérique à doigt (2R)</li><li><b>3</b> : rotule (3R), appui plan (2T + 1R)</li><li><b>4</b> : linéaire rectiligne (2T + 2R), linéaire annulaire (1T + 3R)</li><li><b>5</b> : ponctuelle (2T + 3R)</li></ul><p class="astuce">Plus la zone de contact est petite (surface → ligne → point), plus il y a de ddl.</p>`,
        quiz: [
          { enonce: "Pivot glissant :", choix: ["2 ddl (1T + 1R)", "1 ddl (1R)", "3 ddl (3R)"], bonne: 0 },
          { enonce: "Liaison à 5 ddl :", choix: ["Ponctuelle", "Rotule", "Appui plan"], bonne: 0 },
          { enonce: "Appui plan :", choix: ["2T + 1R", "1T + 2R", "0T + 3R"], bonne: 0 }
        ] },
      { id: L.symb, titre: "Symboles des liaisons",
        recto: "Comment reconnaître les principales liaisons sur un schéma cinématique ?",
        verso: `<ul><li><b>Pivot</b> : rectangle traversé par l'arbre + 2 traits d'arrêt ; <b>pivot glissant</b> : sans arrêts</li><li><b>Glissière</b> : carré dans un carré ; <b>hélicoïdale</b> : zigzag (filet)</li><li><b>Rotule</b> : cercle dans un arc de cercle</li><li><b>Appui plan</b> : deux traits accolés</li><li><b>Linéaire annulaire</b> : cercle entre deux traits ; <b>ponctuelle</b> : pointe sur un plan</li></ul><p class="astuce">Bâti : hachures. Une couleur par classe d'équivalence.</p>`,
        quiz: [
          { enonce: "Cercle dans un arc de cercle :", choix: ["Rotule", "Pivot", "Ponctuelle"], bonne: 0 },
          { enonce: "La pièce de référence est repérée par…", choix: ["Des hachures", "Une flèche", "Un cercle noirci"], bonne: 0 }
        ] },
      { id: L.tors, titre: "Torseur cinématique d'une liaison",
        recto: "Quelle est la forme du torseur cinématique d'une liaison, et comment la relier aux ddl ?",
        verso: `<div class="formule">{V<sub>2/1</sub>}<sub>O</sub> = { ω<sub>x</sub> V<sub>x</sub> ; ω<sub>y</sub> V<sub>y</sub> ; ω<sub>z</sub> V<sub>z</sub> }</div><ul><li>Colonne ω : rotations ; colonne V : translations.</li><li>ddl autorisé → composante <b>non nulle</b> ; mouvement interdit → <b>0</b>.</li><li>Pivot d'axe x : seul ω<sub>x</sub> ≠ 0 ; glissière d'axe x : seul V<sub>x</sub> ≠ 0.</li></ul><p class="astuce">Hélicoïdale de pas p : ω<sub>x</sub> et V<sub>x</sub> liés (V<sub>x</sub> = p·ω<sub>x</sub>/2π) → 1 seul ddl ; 1 tour = avance d'un pas.</p>`,
        quiz: [
          { enonce: "Pivot d'axe x : composante(s) non nulle(s)", choix: ["ω<sub>x</sub> seulement", "V<sub>x</sub> seulement", "ω<sub>x</sub> et V<sub>x</sub>"], bonne: 0 },
          { enonce: "Une composante nulle correspond à…", choix: ["Un mouvement interdit", "Un mouvement autorisé", "Une liaison hélicoïdale"], bonne: 0 },
          { enonce: "Vis de pas 3 mm, 10 tours : l'écrou avance de…", choix: ["30 mm", "3,3 mm", "13 mm"], bonne: 0 }
        ] },
      { id: L.sch, titre: "Classes d'équivalence, graphe et schéma",
        recto: "Quelles sont les 3 étapes pour construire le schéma cinématique d'un mécanisme ?",
        verso: `<ol><li><b>Classes d'équivalence</b> : pièces sans mouvement relatif, notées A = {1 ; 2 ; 3}. Ressorts, joints, billes : aucune classe.</li><li><b>Graphe des liaisons</b> : une bulle par classe, un trait par contact, avec nom, centre et axe de la liaison.</li><li><b>Schéma cinématique</b> : symboles placés aux centres, reliés par classe (couleurs), bâti hachuré.</li></ol><p class="astuce">Pas de contact entre deux classes → pas de liaison.</p>`,
        quiz: [
          { enonce: "Un ressort appartient à…", choix: ["Aucune classe d'équivalence", "La classe du bâti", "Sa propre classe"], bonne: 0 },
          { enonce: "Première étape :", choix: ["Repérer les classes d'équivalence", "Tracer le schéma", "Choisir le point de vue"], bonne: 0 }
        ] }
    ]
  });
})();
