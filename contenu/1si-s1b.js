/* =====================================================================
   PREMIÈRE SI — Séquence 1 « Les nouvelles mobilités individuelles »
   Chaîne de puissance (2/2) :
     1.3 Lois de Kirchhoff  (APPORTS CONNAISSANCES LOIS DE KIRCHHOFF,
                             SYNTHESE LOIS FONDAMENTALES ELEC)
     1.5 Transmission de puissance mécanique (TRANSMISSIONS APPORTS
                             CONNAISSANCES V2, TRANSMISSIONS SYNTHESE)
   ===================================================================== */
(function () {
  const nb = SIP.nb;
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const serieE12 = (min, max) => { const out = []; for (let d = 1; d <= 1e5; d *= 10) E12.forEach((v) => { const x = v * d; if (x >= min && x <= max) out.push(x); }); return out; };
  const E12_TOUTES = serieE12(1, 1e6);
  const ohm = (R) => (R >= 1000 ? nb(R / 1000) + " kΩ" : nb(R) + " Ω");
  const par = (y) => (y < 0 ? `(${nb(y)})` : nb(y));
  const tab = (lignes) => `<table>${lignes.map((l) => `<tr><th>${l[0]}</th>${l.slice(1).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const w = (N) => Math.PI * N / 30; // tr/min → rad/s

  // DEL du cours (catalogue : V_F et courant nominal)
  const DELS = [{ c: "rouge", vf: 2, i: 10 }, { c: "verte", vf: 2.1, i: 10 }, { c: "jaune", vf: 2.1, i: 10 }, { c: "bleue", vf: 3.6, i: 20 }, { c: "orange", vf: 2, i: 10 }];

  /* ===================================================================
     MODULE 1 — Lois de l'électricité
     =================================================================== */
  const K = { ohm: "1si-s1-kir-ohm", noeuds: "1si-s1-kir-noeuds", mailles: "1si-s1-kir-mailles", assoc: "1si-s1-kir-assoc", puiss: "1si-s1-kir-puiss" };

  SIP.definirModule({
    id: "1si-s1-kirchhoff",
    niveaux: ["1SI"],
    sequence: "S1 · Chaîne de puissance",
    titre: "Lois de l'électricité : Ohm, Kirchhoff, puissance",
    description: "Loi d'Ohm, lois des nœuds et des mailles, associations de résistances, diviseurs de tension et de courant, puissance et conventions générateur/récepteur.",
    competences: ["M11", "A2", "M3", "E1"],
    nbQuestions: 10,
    questions: [
      // ---------- Loi d'Ohm et mesures ----------
      { fiche: K.ohm, gen: (r) => { const R = r.pick(serieE12(100, 1000)), ImA = r.pick([5, 8, 10, 12, 15, 20, 25, 30]), I = ImA / 1000, U = R * I;
          return { enonce: `Une résistance <b>R = ${ohm(R)}</b> est traversée par un courant <b>I = ${ImA} mA</b>. Tension U à ses bornes ?`, reponse: U, unite: "V",
            explication: `Loi d'Ohm : U = R × I = ${nb(R)} × ${nb(I)} = ${nb(U)} V (on convertit d'abord ${ImA} mA = ${nb(I)} A).` }; } },
      { fiche: K.ohm, gen: (r) => { const U = r.pick([3.3, 5, 9, 12, 24, 36]), R = r.pick(serieE12(220, 10000)), I = U / R;
          return { enonce: `On applique <b>U = ${nb(U)} V</b> aux bornes d'une résistance <b>R = ${ohm(R)}</b>. Courant I en <b>mA</b> ?`, reponse: I * 1000, unite: "mA",
            explication: `I = U / R = ${nb(U)} / ${nb(R)} = ${nb(I)} A = ${nb(I * 1000)} mA (R en Ω, pas en kΩ).` }; } },
      { fiche: K.ohm, gen: (r) => { const R = r.pick(serieE12(100, 2200)), ImA = r.pick([2, 4, 5, 8, 10]), U = R * ImA / 1000;
          return { enonce: `Sur une résistance inconnue, le voltmètre indique <b>${nb(U)} V</b> et l'ampèremètre <b>${ImA} mA</b>. Valeur de R (en Ω) ?`, reponse: R, unite: "Ω",
            explication: `R = U / I = ${nb(U)} / ${nb(ImA / 1000)} = ${nb(R)} Ω.` }; } },
      { fiche: K.ohm, gen: (r) => { const R = r.pick([47, 68, 100, 150, 220, 330, 470]), Is = r.pick([[10, 20, 30], [5, 10, 15], [20, 40, 60], [2, 4, 6]]);
          return { enonce: `Relevés sur un dipôle ohmique :${tab([["U (V)", ...Is.map((i) => nb(R * i / 1000))], ["I (mA)", ...Is.map(String)]])}Valeur de sa résistance R ?`, reponse: R, unite: "Ω",
            explication: `U est proportionnelle à I : R = U / I = ${nb(R * Is[1] / 1000)} / ${nb(Is[1] / 1000)} = ${R} Ω (même résultat pour chaque colonne).` }; } },
      { fiche: K.ohm, gen: (r) => { const d = r.pick(DELS), E = r.pick([5, 9, 10, 12]), UR = E - d.vf, R = UR * 1000 / d.i;
          return { enonce: `Feu de trottinette : une DEL ${d.c} (<b>V<sub>F</sub> = ${nb(d.vf)} V</b> ; <b>I = ${d.i} mA</b>) est alimentée sous <b>${E} V</b> à travers une résistance R en série. Valeur de R ?`, reponse: R, unite: "Ω",
            explication: `Loi des mailles : U<sub>R</sub> = ${E} − ${nb(d.vf)} = ${nb(UR)} V. Loi d'Ohm : R = U<sub>R</sub> / I = ${nb(UR)} / ${nb(d.i / 1000)} = ${nb(R)} Ω.` }; } },
      { fiche: K.ohm, gen: (r) => { let d, E, R; do { d = r.pick(DELS); E = r.pick([5, 9, 10, 12]); R = (E - d.vf) * 1000 / d.i; } while (E12_TOUTES.some((v) => Math.abs(v - R) < 1e-6));
          const sup = E12_TOUTES.find((v) => v > R), inf = E12_TOUTES.filter((v) => v < R).pop();
          return { type: "qcm", enonce: `Le calcul de la résistance de protection d'une DEL ${d.c} (I = ${d.i} mA) donne <b>R = ${nb(R)} Ω</b>. Quelle valeur normalisée de la série E12 choisir ?`,
            choix: [ohm(sup), ohm(inf), ohm(sup * 10), ohm(inf / 10)], bonne: 0,
            explication: `On prend la valeur normalisée <b>immédiatement supérieure</b> : ${ohm(sup)}. Le courant sera un peu plus faible (${nb((E - d.vf) / sup * 1000, 3)} mA) et la DEL est protégée ; avec ${ohm(inf)}, il dépasserait ${d.i} mA.` }; } },
      { type: "qcm", fiche: K.ohm, enonce: "Pour mesurer l'intensité du courant qui traverse une lampe, l'ampèremètre se branche…", choix: ["En série avec la lampe", "En parallèle sur la lampe", "En parallèle sur le générateur", "Directement entre la borne + et la borne − du générateur"], bonne: 0, explication: "Le courant à mesurer doit traverser l'appareil : on ouvre la branche et on y insère l'ampèremètre en série. Le voltmètre, lui, se branche en parallèle. Brancher l'ampèremètre directement sur le générateur crée un court-circuit." },
      { type: "qcm", fiche: K.ohm, enonce: "On double la tension appliquée à une résistance de valeur fixe. Le courant qui la traverse…", choix: ["Double", "Est divisé par 2", "Ne change pas", "Est multiplié par 4"], bonne: 0, explication: "I = U / R : R constante ⇒ I proportionnel à U. (C'est la puissance P = U²/R qui est multipliée par 4.)" },

      // ---------- Loi des nœuds ----------
      { fiche: K.noeuds, gen: (r) => { const I1 = r.pas(0.8, 4, 0.1), I2 = r.pas(0.1, I1 - 0.1, 0.1), I3 = I1 - I2;
          return { enonce: `Un nœud reçoit le courant <b>I<sub>1</sub> = ${nb(I1)} A</b>. En repartent <b>I<sub>2</sub> = ${nb(I2)} A</b> et I<sub>3</sub>. Valeur de I<sub>3</sub> ?`, reponse: I3, unite: "A",
            explication: `Loi des nœuds : I<sub>1</sub> = I<sub>2</sub> + I<sub>3</sub> ⇒ I<sub>3</sub> = ${nb(I1)} − ${nb(I2)} = ${nb(I3)} A.` }; } },
      { fiche: K.noeuds, gen: (r) => { let v, k, x;
          do { v = { 1: r.pas(0.2, 3, 0.1), 2: r.pas(0.2, 3, 0.1), 3: r.pas(0.2, 3, 0.1), 4: r.pas(0.2, 3, 0.1) }; k = r.pick([1, 2, 3, 4]);
            x = k === 1 ? v[2] + v[3] - v[4] : k === 4 ? v[2] + v[3] - v[1] : k === 2 ? v[1] + v[4] - v[3] : v[1] + v[4] - v[2]; } while (Math.abs(x) < 0.05);
          const connus = [1, 2, 3, 4].filter((j) => j !== k).map((j) => `i<sub>${j}</sub> = ${nb(v[j])} A`).join(" ; ");
          const calc = k === 1 ? `i<sub>1</sub> = i<sub>2</sub> + i<sub>3</sub> − i<sub>4</sub> = ${nb(v[2])} + ${nb(v[3])} − ${nb(v[4])}`
            : k === 4 ? `i<sub>4</sub> = i<sub>2</sub> + i<sub>3</sub> − i<sub>1</sub> = ${nb(v[2])} + ${nb(v[3])} − ${nb(v[1])}`
            : k === 2 ? `i<sub>2</sub> = i<sub>1</sub> + i<sub>4</sub> − i<sub>3</sub> = ${nb(v[1])} + ${nb(v[4])} − ${nb(v[3])}`
            : `i<sub>3</sub> = i<sub>1</sub> + i<sub>4</sub> − i<sub>2</sub> = ${nb(v[1])} + ${nb(v[4])} − ${nb(v[2])}`;
          return { enonce: `À un nœud, i<sub>1</sub> et i<sub>4</sub> arrivent, i<sub>2</sub> et i<sub>3</sub> repartent (sens des flèches). On connaît : ${connus}. Valeur algébrique de i<sub>${k}</sub> ?`, reponse: x, unite: "A",
            explication: `Loi des nœuds : i<sub>1</sub> + i<sub>4</sub> = i<sub>2</sub> + i<sub>3</sub> ⇒ ${calc} = ${nb(x)} A.${x < 0 ? " Le signe − signifie que ce courant circule en réalité dans le sens opposé à sa flèche." : ""}` }; } },
      { fiche: K.noeuds, gen: (r) => { let a, b, c, x;
          do { a = r.pas(-3, 3, 0.1); b = r.pas(-3, 3, 0.1); c = r.pas(-3, 3, 0.1); x = -(a + b + c); } while (Math.abs(x) < 0.05 || [a, b, c].some((y) => Math.abs(y) < 0.05));
          return { enonce: `Les quatre courants d'un nœud sont tous fléchés <b>vers</b> le nœud : I<sub>1</sub> = ${nb(a)} A ; I<sub>2</sub> = ${nb(b)} A ; I<sub>3</sub> = ${nb(c)} A. Valeur algébrique de I<sub>4</sub> ?`, reponse: x, unite: "A",
            explication: `Tous fléchés vers le nœud : I<sub>1</sub> + I<sub>2</sub> + I<sub>3</sub> + I<sub>4</sub> = 0 ⇒ I<sub>4</sub> = −(${nb(a)} + ${par(b)} + ${par(c)}) = ${nb(x)} A. ${x < 0 ? "Négatif : ce courant sort en réalité du nœud." : "Positif : il entre réellement dans le nœud."}` }; } },
      { fiche: K.noeuds, gen: (r) => { const V = r.pick([5, 9, 10, 12, 24]), R1 = r.pick([5, 10, 20, 22, 47, 100]), R2 = r.pick([10, 15, 30, 33, 50, 68]), I1 = V / R1, I2 = V / R2;
          return { enonce: `Un générateur de <b>${V} V</b> alimente deux résistances en parallèle : <b>R<sub>1</sub> = ${R1} Ω</b> et <b>R<sub>2</sub> = ${R2} Ω</b>. Courant I<sub>3</sub> débité par le générateur ?`, reponse: I1 + I2, unite: "A",
            explication: `Même tension sur chaque branche : I<sub>1</sub> = ${V} / ${R1} = ${nb(I1)} A ; I<sub>2</sub> = ${V} / ${R2} = ${nb(I2)} A. Loi des nœuds : I<sub>3</sub> = I<sub>1</sub> + I<sub>2</sub> = ${nb(I1 + I2)} A.` }; } },
      { fiche: K.noeuds, gen: (r) => { const Ib = r.pas(5, 15, 0.5), Ip = r.pick([0.15, 0.2, 0.25, 0.3, 0.4]), If = r.pick([0.02, 0.05, 0.08, 0.1]), Ic = Ib - Ip - If;
          return { enonce: `Trottinette : la batterie alimente en parallèle le contrôleur du moteur, le phare et le feu arrière. Mesures :${tab([["Branche", "batterie", "phare", "feu arrière"], ["I (A)", nb(Ib), nb(Ip), nb(If)]])}Courant absorbé par le contrôleur ?`, reponse: Ic, unite: "A",
            explication: `Loi des nœuds : I<sub>batterie</sub> = I<sub>contrôleur</sub> + I<sub>phare</sub> + I<sub>feu</sub> ⇒ I<sub>contrôleur</sub> = ${nb(Ib)} − ${nb(Ip)} − ${nb(If)} = ${nb(Ic)} A.` }; } },
      { fiche: K.noeuds, gen: (r) => { const x = r.pas(0.1, 2, 0.1);
          return { type: "qcm", enonce: `En appliquant la loi des nœuds, un élève trouve <b>I<sub>3</sub> = −${nb(x)} A</b>. Que conclure ?`,
            choix: [`Un courant de ${nb(x)} A circule dans le sens opposé à la flèche de I<sub>3</sub>`, "Le calcul est forcément faux : un courant ne peut pas être négatif", "Aucun courant ne circule dans cette branche", "Le dipôle de cette branche a une résistance négative"], bonne: 0,
            explication: `Le sens des flèches est choisi au départ, arbitrairement. Un résultat négatif indique simplement que le courant réel (${nb(x)} A) circule dans l'autre sens.` }; } },
      { type: "qcm", fiche: K.noeuds, enonce: "La loi des nœuds traduit le fait que…", choix: ["Les charges électriques ne s'accumulent pas dans un nœud", "La tension est la même en tout point d'un circuit", "Le courant s'use en traversant les récepteurs", "La somme des tensions d'une maille est nulle"], bonne: 0, explication: "Tout ce qui arrive au nœud en repart : Σ I entrants = Σ I sortants. La dernière proposition, c'est la loi des mailles." },
      { type: "qcm", fiche: K.noeuds, enonce: "Circuit série : pile, lampe, moteur. Le courant mesuré…", choix: ["Est le même en tout point du circuit", "Diminue après chaque récepteur", "Est plus fort près de la borne +", "Est nul entre la lampe et le moteur"], bonne: 0, explication: "Un circuit série n'a pas de nœud : le même courant traverse tous les dipôles. Les récepteurs consomment de l'énergie, pas du courant." },

      // ---------- Loi des mailles ----------
      { fiche: K.mailles, gen: (r) => { const E = r.pick([12, 24, 36]), U1 = r.pas(1, E / 3, 0.5), U2 = r.pas(1, E / 3, 0.5), U3 = E - U1 - U2;
          return { enonce: `Une batterie de <b>${E} V</b> alimente trois récepteurs en série. On mesure <b>U<sub>1</sub> = ${nb(U1)} V</b> et <b>U<sub>2</sub> = ${nb(U2)} V</b>. Tension U<sub>3</sub> ?`, reponse: U3, unite: "V",
            explication: `Loi des mailles : E − U<sub>1</sub> − U<sub>2</sub> − U<sub>3</sub> = 0 ⇒ U<sub>3</sub> = ${E} − ${nb(U1)} − ${nb(U2)} = ${nb(U3)} V.` }; } },
      { fiche: K.mailles, gen: (r) => { let VA, VB; do { VA = r.pas(-5, 12, 0.5); VB = r.pas(-5, 12, 0.5); } while (VA === VB);
          const ab = r.pick([true, false]), x = ab ? VA - VB : VB - VA, n = ab ? "AB" : "BA";
          return { enonce: `Par rapport à la masse, le point A est au potentiel <b>V<sub>A</sub> = ${nb(VA)} V</b> et le point B à <b>V<sub>B</sub> = ${nb(VB)} V</b>. Valeur algébrique de la tension <b>U<sub>${n}</sub></b> ?`, reponse: x, unite: "V",
            explication: `U<sub>${n}</sub> = V<sub>${n[0]}</sub> − V<sub>${n[1]}</sub> = ${nb(ab ? VA : VB)} − ${par(ab ? VB : VA)} = ${nb(x)} V.` }; } },
      { fiche: K.mailles, gen: (r) => { const U3 = r.pick([6, 9, 12, 15, 24]), U1 = r.pas(1, U3 - 1, 0.5), U2 = U3 - U1;
          return { enonce: `Entre deux points A et C, deux branches sont en parallèle : l'une contient R<sub>3</sub> seule, l'autre R<sub>1</sub> et R<sub>2</sub> en série. On mesure <b>U<sub>R3</sub> = ${nb(U3)} V</b> et <b>U<sub>R1</sub> = ${nb(U1)} V</b>. Tension U<sub>R2</sub> ?`, reponse: U2, unite: "V",
            explication: `Maille formée par les deux branches : U<sub>R3</sub> − U<sub>R1</sub> − U<sub>R2</sub> = 0 ⇒ U<sub>R2</sub> = ${nb(U3)} − ${nb(U1)} = ${nb(U2)} V.` }; } },
      { fiche: K.mailles, gen: (r) => { const V = r.pick([12, 15, 24]), V1 = r.pas(1, 4, 0.5), V5 = r.pas(0.5, 3, 0.5), V3 = V - V1 - V5, V2 = r.pas(0.5, V3 - 0.5, 0.5), V4 = V3 - V2;
          return { enonce: `Circuit à deux mailles : générateur V → R<sub>1</sub> → nœud A. Entre A et B : R<sub>3</sub> en parallèle avec la branche R<sub>2</sub> + R<sub>4</sub> (en série). Retour de B au générateur par R<sub>5</sub>.${tab([["Tension", "V", "V<sub>1</sub>", "V<sub>2</sub>", "V<sub>5</sub>"], ["Valeur (V)", nb(V), nb(V1), nb(V2), nb(V5)]])}Tension V<sub>4</sub> aux bornes de R<sub>4</sub> ?`, reponse: V4, unite: "V",
            explication: `Maille 1 : V − V<sub>1</sub> − V<sub>3</sub> − V<sub>5</sub> = 0 ⇒ V<sub>3</sub> = ${nb(V)} − ${nb(V1)} − ${nb(V5)} = ${nb(V3)} V. Maille 2 : V<sub>3</sub> − V<sub>2</sub> − V<sub>4</sub> = 0 ⇒ V<sub>4</sub> = ${nb(V3)} − ${nb(V2)} = ${nb(V4)} V.` }; } },
      { fiche: K.mailles, gen: (r) => { const E = r.pick([9, 12, 15, 24]), Rs = [r.pick([5, 10, 15]), r.pick([10, 22, 33]), r.pick([15, 47, 68])], k = r.int(0, 2), S = Rs[0] + Rs[1] + Rs[2], I = E / S, U = Rs[k] * I;
          return { enonce: `Un générateur de <b>${E} V</b> alimente en série R<sub>1</sub> = ${Rs[0]} Ω, R<sub>2</sub> = ${Rs[1]} Ω et R<sub>3</sub> = ${Rs[2]} Ω. Tension aux bornes de <b>R<sub>${k + 1}</sub></b> ?`, reponse: U, unite: "V",
            explication: `I = E / (R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub>) = ${E} / ${S} = ${nb(I)} A ; U<sub>R${k + 1}</sub> = ${Rs[k]} × ${nb(I)} = ${nb(U)} V. Vérification (loi des mailles) : U<sub>R1</sub> + U<sub>R2</sub> + U<sub>R3</sub> = ${E} V.` }; } },
      { fiche: K.mailles, gen: (r) => { const E = r.pick([9, 12, 24, 36]), U1 = r.pas(1, E - 2, 0.5), bon = E - U1;
          return { type: "qcm", enonce: `Circuit série : générateur <b>E = ${E} V</b> et deux récepteurs. On mesure <b>U<sub>1</sub> = ${nb(U1)} V</b>. Un élève annonce U<sub>2</sub> = ${nb(E + U1)} V. Son résultat est…`,
            choix: [`Faux : U<sub>2</sub> = ${nb(bon)} V`, "Juste", `Faux : U<sub>2</sub> = ${nb(-bon)} V`, `Faux : U<sub>2</sub> = ${nb(E)} V`], bonne: 0,
            explication: `Loi des mailles : E − U<sub>1</sub> − U<sub>2</sub> = 0 ⇒ U<sub>2</sub> = ${E} − ${nb(U1)} = ${nb(bon)} V. L'élève a additionné au lieu de soustraire : en série, les tensions des récepteurs se partagent celle du générateur.` }; } },
      { type: "qcm", fiche: K.mailles, enonce: "Maille : générateur U (fléchée dans le sens du parcours) et deux résistances en série de tensions U<sub>1</sub> et U<sub>2</sub> (fléchées en sens contraire du parcours). Quelle relation est juste ?", choix: ["U − U<sub>1</sub> − U<sub>2</sub> = 0", "U + U<sub>1</sub> + U<sub>2</sub> = 0", "U − U<sub>1</sub> + U<sub>2</sub> = 0", "U = U<sub>1</sub> − U<sub>2</sub>"], bonne: 0, explication: "Dans le sens du parcours : +U ; en sens contraire : −U<sub>1</sub> et −U<sub>2</sub>. Somme nulle : U − U<sub>1</sub> − U<sub>2</sub> = 0, soit U = U<sub>1</sub> + U<sub>2</sub>." },
      { type: "qcm", fiche: K.mailles, enonce: "Deux dipôles branchés en parallèle ont toujours…", choix: ["La même tension à leurs bornes", "Le même courant", "La même puissance", "La même résistance"], bonne: 0, explication: "À eux deux ils forment une maille : U<sub>1</sub> − U<sub>2</sub> = 0, donc U<sub>1</sub> = U<sub>2</sub>. Les courants, eux, dépendent de chaque résistance." },
      { type: "qcm", fiche: K.mailles, enonce: "Le sens de parcours d'une maille…", choix: ["Se choisit arbitrairement : le résultat ne change pas", "Est toujours celui des aiguilles d'une montre", "Est imposé par le sens réel du courant", "Doit partir de la borne − du générateur"], bonne: 0, explication: "Le cours le précise : le sens est choisi arbitrairement. Changer de sens multiplie toute l'équation par −1, ce qui ne change pas la solution." },

      // ---------- Associations de résistances et diviseurs ----------
      { fiche: K.assoc, gen: (r) => { const a = r.pick(serieE12(100, 4700)), b = r.pick(serieE12(100, 4700)), c = r.pick(serieE12(47, 1000)), S = a + b + c;
          return { enonce: `Trois résistances en <b>série</b> : ${ohm(a)}, ${ohm(b)} et ${ohm(c)}. Résistance équivalente (en Ω) ?`, reponse: S, unite: "Ω",
            explication: `En série, on additionne : R<sub>équ</sub> = ${nb(a)} + ${nb(b)} + ${nb(c)} = ${nb(S)} Ω.` }; } },
      { fiche: K.assoc, gen: (r) => { const a = r.pick(serieE12(100, 10000)), b = r.pick(serieE12(100, 10000)), eq = a * b / (a + b);
          return { enonce: `Deux résistances en <b>parallèle</b> : R<sub>1</sub> = ${ohm(a)} et R<sub>2</sub> = ${ohm(b)}. Résistance équivalente (en Ω) ?`, reponse: eq, unite: "Ω",
            explication: `R<sub>équ</sub> = R<sub>1</sub>·R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>) = ${nb(a)} × ${nb(b)} / ${nb(a + b)} = ${nb(eq)} Ω : plus petite que la plus petite des deux.` }; } },
      { fiche: K.assoc, gen: (r) => { const Rs = [r.pick([10, 15, 22]), r.pick([33, 47, 68]), r.pick([100, 150, 220])], inv = Rs.reduce((s, x) => s + 1 / x, 0), eq = 1 / inv;
          return { enonce: `Trois résistances en <b>parallèle</b> : ${Rs.map((x) => x + " Ω").join(", ")}. Résistance équivalente ?`, reponse: eq, unite: "Ω",
            explication: `1/R<sub>équ</sub> = 1/${Rs[0]} + 1/${Rs[1]} + 1/${Rs[2]} = ${nb(inv)} Ω<sup>−1</sup> ⇒ R<sub>équ</sub> = ${nb(eq)} Ω.` }; } },
      { fiche: K.assoc, gen: (r) => { const R1 = r.pick([5, 10, 20, 47, 100]), R2 = r.pick([10, 15, 30, 68, 100]), R3 = r.pick([10, 22, 30, 47]), p = R1 * R2 / (R1 + R2), eq = R3 + p;
          return { enonce: `R<sub>1</sub> = ${R1} Ω et R<sub>2</sub> = ${R2} Ω sont en parallèle ; l'ensemble est en série avec R<sub>3</sub> = ${R3} Ω. Résistance équivalente ?`, reponse: eq, unite: "Ω",
            explication: `R<sub>1</sub>//R<sub>2</sub> = ${R1} × ${R2} / ${R1 + R2} = ${nb(p)} Ω, puis R<sub>équ</sub> = R<sub>3</sub> + R<sub>1</sub>//R<sub>2</sub> = ${R3} + ${nb(p)} = ${nb(eq)} Ω.` }; } },
      { fiche: K.assoc, gen: (r) => { const n = r.pick([2, 3, 4, 5]), Req = r.pick([50, 75, 100, 150, 200, 250]), R = n * Req;
          return { enonce: `${n} résistances <b>identiques</b> montées en parallèle équivalent à <b>${Req} Ω</b>. Valeur de chacune ?`, reponse: R, unite: "Ω",
            explication: `n résistances R identiques en parallèle : R<sub>équ</sub> = R / n ⇒ R = n × R<sub>équ</sub> = ${n} × ${Req} = ${R} Ω.` }; } },
      { fiche: K.assoc, gen: (r) => { const C1 = r.pick([10, 22, 47, 100]), C2 = r.pick([10, 22, 47, 100, 220]), serie = r.pick([true, false]), eq = serie ? C1 * C2 / (C1 + C2) : C1 + C2;
          return { enonce: `Deux condensateurs C<sub>1</sub> = ${C1} µF et C<sub>2</sub> = ${C2} µF sont montés en <b>${serie ? "série" : "parallèle"}</b>. Capacité équivalente ?`, reponse: eq, unite: "µF",
            explication: serie ? `Condensateurs en série : 1/C<sub>équ</sub> = 1/C<sub>1</sub> + 1/C<sub>2</sub> ⇒ C<sub>équ</sub> = ${C1} × ${C2} / ${C1 + C2} = ${nb(eq)} µF (règle inverse de celle des résistances).`
              : `Condensateurs en parallèle : les capacités s'additionnent, C<sub>équ</sub> = ${C1} + ${C2} = ${nb(eq)} µF (règle inverse de celle des résistances).` }; } },
      { type: "qcm", fiche: K.assoc, enonce: "R<sub>1</sub> = 1 kΩ en parallèle avec R<sub>2</sub> = 10 Ω. Sans calculatrice, R<sub>équ</sub> vaut environ…", choix: ["Un peu moins de 10 Ω", "1 010 Ω", "505 Ω", "Un peu plus de 1 kΩ"], bonne: 0, explication: "En parallèle, R<sub>équ</sub> est toujours plus petite que la plus petite résistance : 1 000 × 10 / 1 010 ≈ 9,9 Ω." },
      { type: "qcm", fiche: K.assoc, enonce: "Quelle association se calcule avec 1/X<sub>équ</sub> = 1/X<sub>1</sub> + 1/X<sub>2</sub>, comme des résistances en parallèle ?", choix: ["Des condensateurs en série", "Des condensateurs en parallèle", "Des bobines en série", "Des résistances en série"], bonne: 0, explication: "Bobines : même règle que les résistances. Condensateurs : règle inversée (en série : somme des inverses ; en parallèle : somme)." },
      { fiche: K.assoc, gen: (r) => { let V, R1, R2, V2; do { V = r.pick([24, 36, 42, 48]); R1 = r.pick([22, 33, 47, 68, 100]); R2 = r.pick([2.2, 3.3, 4.7, 6.8, 10]); V2 = V * R2 / (R1 + R2); } while (V2 < 1 || V2 > 5);
          return { enonce: `Pour lire la tension de la batterie d'une trottinette (<b>${V} V</b>) sur une entrée analogique 0–5 V, on utilise un pont diviseur à vide : <b>R<sub>1</sub> = ${nb(R1)} kΩ</b> côté +, <b>R<sub>2</sub> = ${nb(R2)} kΩ</b> côté masse. Tension V<sub>2</sub> aux bornes de R<sub>2</sub> ?`, reponse: V2, unite: "V",
            explication: `Diviseur de tension : V<sub>2</sub> = V × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>) = ${V} × ${nb(R2)} / ${nb(R1 + R2)} = ${nb(V2)} V (inférieure à 5 V : l'entrée est protégée).` }; } },
      { fiche: K.assoc, gen: (r) => { const V = r.pick([12, 24, 36, 48]), V2 = r.pick([2.5, 4, 5]), R1 = 10 * (V - V2) / V2;
          return { enonce: `On veut <b>V<sub>2</sub> = ${nb(V2)} V</b> à partir de <b>${V} V</b> avec un pont diviseur à vide dont <b>R<sub>2</sub> = 10 kΩ</b> (sortie aux bornes de R<sub>2</sub>). Valeur de R<sub>1</sub> (en kΩ) ?`, reponse: R1, unite: "kΩ",
            explication: `V<sub>2</sub> = V·R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>) ⇒ R<sub>1</sub> = R<sub>2</sub> × (V − V<sub>2</sub>) / V<sub>2</sub> = 10 × ${nb(V - V2)} / ${nb(V2)} = ${nb(R1)} kΩ.` }; } },
      { fiche: K.assoc, gen: (r) => { const I = r.pas(0.5, 3, 0.1), R1 = r.pick([10, 15, 22, 33]), R2 = r.pick([47, 68, 100]), k = r.pick([1, 2]), Ik = k === 1 ? I * R2 / (R1 + R2) : I * R1 / (R1 + R2);
          return { enonce: `Un courant <b>I = ${nb(I)} A</b> se partage entre deux résistances en parallèle : <b>R<sub>1</sub> = ${R1} Ω</b> et <b>R<sub>2</sub> = ${R2} Ω</b>. Courant I<sub>${k}</sub> dans R<sub>${k}</sub> ?`, reponse: Ik, unite: "A",
            explication: `Diviseur de courant : I<sub>${k}</sub> = I × R<sub>${k === 1 ? 2 : 1}</sub> / (R<sub>1</sub> + R<sub>2</sub>) = ${nb(I)} × ${k === 1 ? R2 : R1} / ${R1 + R2} = ${nb(Ik)} A. Le plus grand courant passe dans la plus petite résistance.` }; } },
      { fiche: K.assoc, gen: (r) => { const V = r.pick([10, 12, 24]), R3 = r.pick([10, 22, 30]), R1 = r.pick([5, 10, 15]), R2 = r.pick([10, 20, 30]), p = R1 * R2 / (R1 + R2), Req = R3 + p, I3 = V / Req, U12 = p * I3, I1 = U12 / R1;
          return { enonce: `Générateur de <b>${V} V</b> ; R<sub>3</sub> = ${R3} Ω est en série avec l'ensemble R<sub>1</sub> = ${R1} Ω // R<sub>2</sub> = ${R2} Ω. Courant dans <b>R<sub>1</sub></b> ?`, reponse: I1, unite: "A", tolerance: 3,
            explication: `R<sub>équ</sub> = ${R3} + ${nb(p)} = ${nb(Req)} Ω ; I<sub>R3</sub> = ${V} / ${nb(Req)} = ${nb(I3)} A ; U<sub>R1//R2</sub> = ${V} − ${R3} × ${nb(I3)} = ${nb(U12)} V ; I<sub>R1</sub> = ${nb(U12)} / ${R1} = ${nb(I1)} A.` }; } },
      { type: "qcm", fiche: K.assoc, enonce: "Diviseur de courant : I se partage entre R<sub>1</sub> et R<sub>2</sub> en parallèle. Courant I<sub>1</sub> dans R<sub>1</sub> ?", choix: ["I<sub>1</sub> = I × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)", "I<sub>1</sub> = I × R<sub>1</sub> / (R<sub>1</sub> + R<sub>2</sub>)", "I<sub>1</sub> = I × (R<sub>1</sub> + R<sub>2</sub>) / R<sub>2</sub>", "I<sub>1</sub> = I × R<sub>1</sub>·R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)"], bonne: 0, explication: "Le courant passe plus facilement par la plus petite résistance : I<sub>1</sub> est d'autant plus grand que l'<b>autre</b> résistance R<sub>2</sub> est grande. À ne pas confondre avec le diviseur de tension." },
      { type: "qcm", fiche: K.assoc, enonce: "Pont diviseur : V alimente R<sub>1</sub> et R<sub>2</sub> en série (à vide). Tension V<sub>1</sub> aux bornes de R<sub>1</sub> ?", choix: ["V<sub>1</sub> = V × R<sub>1</sub> / (R<sub>1</sub> + R<sub>2</sub>)", "V<sub>1</sub> = V × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)", "V<sub>1</sub> = V × R<sub>1</sub> / R<sub>2</sub>", "V<sub>1</sub> = V × (R<sub>1</sub> + R<sub>2</sub>) / R<sub>1</sub>"], bonne: 0, explication: "Même courant I = V / (R<sub>1</sub> + R<sub>2</sub>) dans les deux résistances, donc V<sub>1</sub> = R<sub>1</sub> × I = V × R<sub>1</sub> / (R<sub>1</sub> + R<sub>2</sub>) : la plus grande résistance prend la plus grande tension." },

      // ---------- Puissance, énergie, conventions ----------
      { fiche: K.puiss, gen: (r) => { const U = r.pick([24, 36, 48]), I = r.pas(2, 15, 0.5), P = U * I;
          return { enonce: `Le moteur d'une trottinette est alimenté sous <b>${U} V</b> et absorbe <b>${nb(I)} A</b>. Puissance électrique reçue ?`, reponse: P, unite: "W",
            explication: `P = U × I = ${U} × ${nb(I)} = ${nb(P)} W.` }; } },
      { fiche: K.puiss, gen: (r) => { const R = r.pick([0.05, 0.1, 0.2, 0.3]), I = r.pick([5, 8, 10, 12, 15, 20]), P = R * I * I;
          return { enonce: `Le bobinage d'un moteur a une résistance <b>R = ${nb(R)} Ω</b> ; il est parcouru par <b>I = ${I} A</b>. Pertes par effet Joule ?`, reponse: P, unite: "W",
            explication: `P<sub>J</sub> = R × I² = ${nb(R)} × ${I}² = ${nb(P)} W.` }; } },
      { fiche: K.puiss, gen: (r) => { const U = r.pick([12, 24]), R = r.pick([4, 6, 8, 12, 24]), P = U * U / R;
          return { enonce: `Une résistance chauffante <b>R = ${R} Ω</b> est alimentée sous <b>U = ${U} V</b> (continu). Puissance dissipée ?`, reponse: P, unite: "W",
            explication: `P = U² / R = ${U}² / ${R} = ${nb(P)} W.` }; } },
      { fiche: K.puiss, gen: (r) => { const R = r.pick(serieE12(47, 1000)), P = r.pick([0.25, 0.5, 1]), I = Math.sqrt(P / R);
          return { enonce: `Une résistance de <b>${ohm(R)}</b> supporte au maximum <b>${nb(P)} W</b>. Courant maximal admissible (en mA) ?`, reponse: I * 1000, unite: "mA",
            explication: `P = R × I² ⇒ I = √(P / R) = √(${nb(P)} / ${nb(R)}) = ${nb(I)} A = ${nb(I * 1000)} mA.` }; } },
      { fiche: K.puiss, gen: (r) => { const P = r.pick([3, 5, 10, 15, 20]), t = r.pick([0.5, 1, 1.5, 2, 3]), enWh = r.pick([true, false]), Wh = P * t, kJ = P * t * 3.6;
          return { enonce: `Un phare de <b>${P} W</b> reste allumé <b>${nb(t)} h</b>. Énergie consommée en <b>${enWh ? "Wh" : "kJ"}</b> ?`, reponse: enWh ? Wh : kJ, unite: enWh ? "Wh" : "kJ",
            explication: enWh ? `W = P × t = ${P} × ${nb(t)} = ${nb(Wh)} Wh (P en W, t en h).` : `W = P × t = ${P} W × ${nb(t * 3600)} s = ${nb(P * t * 3600)} J = ${nb(kJ)} kJ (t en secondes).` }; } },
      { fiche: K.puiss, gen: (r) => { const Q = r.pick([7.8, 10, 10.4, 12.5, 15]), I = r.pas(2, 8, 0.5), t = Q / I;
          return { enonce: `Batterie de trottinette de capacité <b>Q = ${nb(Q)} A·h</b> ; courant moyen absorbé <b>I = ${nb(I)} A</b>. Autonomie théorique (en h) ?`, reponse: t, unite: "h",
            explication: `Q = I × t ⇒ t = Q / I = ${nb(Q)} / ${nb(I)} = ${nb(t)} h.` }; } },
      { fiche: K.puiss, gen: (r) => { const conv = r.pick(["récepteur", "générateur"]), U = r.pick([12, 24, 36]), I = r.pick([1, -1]) * r.pas(0.5, 10, 0.5), P = U * I, recoit = (conv === "récepteur") === (P > 0);
          return { type: "qcm", enonce: `Un dipôle est fléché en <b>convention ${conv}</b> : U = ${U} V et I = ${nb(I)} A. Que peut-on dire ?`,
            choix: [`Il reçoit ${nb(Math.abs(P))} W : il se comporte en récepteur`, `Il fournit ${nb(Math.abs(P))} W : il se comporte en générateur`, "On ne peut pas conclure sans connaître sa résistance", "Impossible : une puissance ne peut pas être négative"], bonne: recoit ? 0 : 1,
            explication: `P = U × I = ${U} × ${par(I)} = ${nb(P)} W. En convention ${conv}, P ${P > 0 ? "&gt; 0" : "&lt; 0"} signifie que le dipôle ${recoit ? "reçoit" : "fournit"} de la puissance.${conv === "récepteur" && !recoit ? " Ex. : moteur de trottinette qui freine en rechargeant la batterie." : ""}` }; } },
      { type: "qcm", fiche: K.puiss, enonce: "En convention générateur, les flèches de la tension U et du courant I sont…", choix: ["Dans le même sens", "En sens inverse", "Toujours orientées vers la borne +", "Perpendiculaires"], bonne: 0, explication: "Générateur : flèches dans le même sens (il fournit la puissance). Récepteur : flèches en sens inverse (il l'absorbe)." },
      { type: "qcm", fiche: K.puiss, enonce: "On double le courant qui traverse une résistance. La puissance dissipée par effet Joule est…", choix: ["Multipliée par 4", "Doublée", "Inchangée", "Divisée par 2"], bonne: 0, explication: "P = R × I² : (2I)² = 4I²." },
      { type: "qcm", fiche: K.puiss, enonce: "1 Wh correspond à…", choix: ["3 600 J", "60 J", "1 000 J", "3,6 J"], bonne: 0, explication: "1 Wh = 1 W pendant 1 h = 1 W × 3 600 s = 3 600 J." }
    ],
    fiches: [
      { id: K.ohm, titre: "Loi d'Ohm et mesures",
        recto: "Quelle relation lie U, R et I pour une résistance ? Comment brancher voltmètre et ampèremètre ?",
        verso: `<div class="formule">U = R × I &nbsp;⇒&nbsp; I = U / R &nbsp;·&nbsp; R = U / I</div><p>U en V, R en Ω, I en A.</p><ul><li>Voltmètre : en <b>parallèle</b> sur le dipôle</li><li>Ampèremètre : en <b>série</b> dans la branche</li></ul><p class="astuce">Convertir d'abord : 20 mA = 0,02 A ; 4,7 kΩ = 4 700 Ω. DEL : R = (E − V<sub>F</sub>) / I, puis valeur E12 immédiatement supérieure.</p>`,
        quiz: [{ enonce: "220 Ω traversée par 50 mA : U = …", choix: ["11 V", "11 000 V", "4,4 V"], bonne: 0 }, { enonce: "L'ampèremètre se branche…", choix: ["En série", "En parallèle", "Aux bornes du générateur"], bonne: 0 }] },
      { id: K.noeuds, titre: "Loi des nœuds",
        recto: "Que dit la loi des nœuds et comment interpréter un courant négatif ?",
        verso: `<div class="formule">Σ I<sub>entrants</sub> = Σ I<sub>sortants</sub></div><p>Pas d'accumulation de charges dans un nœud. Ex. : i<sub>1</sub> et i<sub>4</sub> arrivent, i<sub>2</sub> et i<sub>3</sub> repartent ⇒ i<sub>1</sub> + i<sub>4</sub> = i<sub>2</sub> + i<sub>3</sub>.</p><p>Si tous les courants sont fléchés vers le nœud : leur somme est nulle.</p><p class="astuce">Un résultat négatif n'est pas une erreur : le courant circule dans le sens opposé à sa flèche.</p>`,
        quiz: [{ enonce: "2 A arrivent ; 0,5 A repart par une branche. L'autre branche ?", choix: ["1,5 A", "2,5 A", "0,5 A"], bonne: 0 }, { enonce: "On trouve I = −0,3 A :", choix: ["0,3 A circulent en sens inverse de la flèche", "Le calcul est faux", "Le courant est nul"], bonne: 0 }] },
      { id: K.mailles, titre: "Loi des mailles",
        recto: "Que dit la loi des mailles et comment compter le signe de chaque tension ?",
        verso: `<div class="formule">Maille orientée : Σ des tensions (avec signe) = 0</div><ul><li>Sens de parcours choisi <b>arbitrairement</b></li><li>Tension fléchée dans le sens du parcours : + ; en sens contraire : −</li></ul><div class="formule">U<sub>AB</sub> = V<sub>A</sub> − V<sub>B</sub></div><p class="astuce">Série : E = U<sub>1</sub> + U<sub>2</sub> + … ; branches en parallèle : même tension.</p>`,
        quiz: [{ enonce: "Série : E = 12 V, U<sub>1</sub> = 7 V. U<sub>2</sub> = …", choix: ["5 V", "19 V", "7 V"], bonne: 0 }, { enonce: "V<sub>A</sub> = 5 V, V<sub>B</sub> = 8 V : U<sub>AB</sub> = …", choix: ["−3 V", "3 V", "13 V"], bonne: 0 }] },
      { id: K.assoc, titre: "Associations et diviseurs",
        recto: "Résistance équivalente en série et en parallèle ? Formules des diviseurs de tension et de courant ?",
        verso: `<div class="formule">Série : R<sub>équ</sub> = R<sub>1</sub> + R<sub>2</sub> + … &nbsp;·&nbsp; Parallèle : 1/R<sub>équ</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + …</div><div class="formule">V<sub>2</sub> = V·R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>) &nbsp;·&nbsp; I<sub>1</sub> = I·R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)</div><p>Série : même courant, la tension se partage. Parallèle : même tension, le courant se partage. Bobines : comme R ; condensateurs : l'inverse.</p><p class="astuce">Diviseur de courant : I<sub>1</sub> dépend de l'<b>autre</b> résistance. En parallèle, R<sub>équ</sub> &lt; la plus petite.</p>`,
        quiz: [{ enonce: "100 Ω et 100 Ω en parallèle : R<sub>équ</sub> = …", choix: ["50 Ω", "200 Ω", "100 Ω"], bonne: 0 }, { enonce: "Pont diviseur à vide, 12 V, R<sub>1</sub> = R<sub>2</sub> : V<sub>2</sub> = …", choix: ["6 V", "12 V", "3 V"], bonne: 0 }, { enonce: "10 µF et 10 µF en parallèle : C<sub>équ</sub> = …", choix: ["20 µF", "5 µF", "10 µF"], bonne: 0 }] },
      { id: K.puiss, titre: "Puissance, énergie et conventions",
        recto: "Comment calculer la puissance et l'énergie électriques ? Comment savoir si un dipôle reçoit ou fournit de la puissance ?",
        verso: `<div class="formule">P = U × I = R × I² = U² / R &nbsp;·&nbsp; W = P × t</div><p>W en J (t en s) ou en Wh (t en h) ; 1 Wh = 3 600 J. Charge : Q = I × t (A·h).</p><ul><li>Convention <b>récepteur</b> : U et I fléchés en sens inverse ; P &gt; 0 ⇒ il reçoit</li><li>Convention <b>générateur</b> : même sens ; P &gt; 0 ⇒ il fournit</li></ul><p class="astuce">P &lt; 0 : le dipôle fait l'inverse (moteur qui freine en rechargeant la batterie).</p>`,
        quiz: [{ enonce: "36 V et 10 A : P = …", choix: ["360 W", "3,6 W", "46 W"], bonne: 0 }, { enonce: "En convention générateur, U et I sont fléchés…", choix: ["Dans le même sens", "En sens inverse", "Au choix"], bonne: 0 }, { enonce: "On double I dans une résistance : P est…", choix: ["Multipliée par 4", "Doublée", "Inchangée"], bonne: 0 }] }
    ]
  });

  /* ===================================================================
     MODULE 2 — Transmission de puissance mécanique
     =================================================================== */
  const T = { rapport: "1si-s1-tr-rapport", engr: "1si-s1-tr-engrenage", puis: "1si-s1-tr-puissance", transfo: "1si-s1-tr-transfo", choix: "1si-s1-tr-choix" };

  const SENS = [
    ["un engrenage extérieur (pignon et roue cylindriques)", 1],
    ["deux poulies reliées par une courroie (non croisée)", 0],
    ["un pignon et une roue reliés par une chaîne", 0],
    ["deux engrenages extérieurs successifs (trois arbres parallèles)", 0],
    ["trois engrenages extérieurs successifs (quatre arbres parallèles)", 1],
    ["un pignon et une roue séparés par une roue intermédiaire (roue folle)", 0]
  ];
  const MVTS = ["Rotation → translation continue", "Rotation → translation alternative", "Rotation → rotation discontinue (intermittente)", "Rotation → rotation continue (sans transformation)"];
  const SYS = [["Pignon-crémaillère", 0], ["Système vis-écrou", 0], ["Treuil (tambour + câble)", 0], ["Bielle-manivelle", 1], ["Cadre à coulisse", 1], ["Croix de Malte", 2], ["Engrenage conique", 3], ["Poulies-courroie", 3], ["Roue et vis sans fin", 3]];
  const AXES = [
    ["Arbres parallèles, très proches (faible entraxe)", "Engrenage cylindrique"],
    ["Arbres perpendiculaires dont les axes se coupent (renvoi d'angle)", "Engrenage conique"],
    ["Arbres orthogonaux dont les axes ne se coupent pas, très grande réduction en un étage", "Roue et vis sans fin"],
    ["Arbres éloignés, sans glissement, sens de rotation conservé (vélo)", "Pignons et chaîne"],
    ["Arbres éloignés, fonctionnement silencieux, glissement accepté en cas de surcharge", "Poulies et courroie trapézoïdale"]
  ];
  const FONCTIONS = [
    ["Relier en permanence deux arbres alignés, dans les deux sens, sans jamais les désaccoupler", "Accouplement"],
    ["Transmettre dans un seul sens : sur un vélo, la roue continue de tourner quand on arrête de pédaler", "Roue libre"],
    ["Transmettre temporairement, avec une mise en mouvement progressive", "Embrayage"],
    ["Ralentir ou arrêter un arbre en rotation", "Frein"],
    ["Protéger le mécanisme en patinant au-delà d'un couple maximal", "Limiteur de couple"]
  ];
  const AUTRES_COMPOSANTS = ["Coupleur-convertisseur"];

  SIP.definirModule({
    id: "1si-s1-transmissions",
    niveaux: ["1SI"],
    sequence: "S1 · Chaîne de puissance",
    titre: "Transmission de puissance mécanique",
    description: "Rapports de transmission (engrenages, poulies-courroie, chaîne, roue et vis, pignon-crémaillère, vis-écrou), P = C·ω, couples, rendement et choix d'une solution.",
    competences: ["M2", "M13", "A2", "M3"],
    nbQuestions: 10,
    questions: [
      // ---------- Rapport de transmission ----------
      { fiche: T.rapport, gen: (r) => { const Z1 = r.pick([12, 14, 15, 16, 18, 20, 24]), Z2 = r.pick([30, 36, 40, 45, 48, 52, 60, 72]), N1 = r.pick([750, 1000, 1440, 1500, 2800, 3000]), R = Z1 / Z2, N2 = N1 * R;
          return { enonce: `Un pignon moteur de <b>Z<sub>1</sub> = ${Z1} dents</b> tourne à <b>N<sub>1</sub> = ${N1} tr/min</b> et entraîne une roue de <b>Z<sub>2</sub> = ${Z2} dents</b>. Fréquence de rotation N<sub>2</sub> de la roue ?`, reponse: N2, unite: "tr/min",
            explication: `R = N<sub>2</sub>/N<sub>1</sub> = Z<sub>1</sub>/Z<sub>2</sub> = ${Z1}/${Z2} = ${nb(R, 3)} ; N<sub>2</sub> = R × N<sub>1</sub> = ${nb(N2)} tr/min.` }; } },
      { fiche: T.rapport, gen: (r) => { const Z1 = r.pick([10, 12, 15, 17, 20, 25]), Z2 = r.pick([34, 40, 45, 50, 57, 60, 75]), R = Z1 / Z2;
          return { enonce: `Engrenage : pignon menant de <b>${Z1} dents</b>, roue menée de <b>${Z2} dents</b>. Rapport de transmission R (valeur décimale) ?`, reponse: R, unite: "",
            explication: `R = Z<sub>menant</sub> / Z<sub>mené</sub> = ${Z1} / ${Z2} = ${nb(R, 3)} &lt; 1 : c'est un réducteur.` }; } },
      { fiche: T.rapport, gen: (r) => { const Z1 = r.pick([12, 15, 16, 18, 20]), Z2 = r.pick([36, 40, 45, 48, 54, 60, 64, 72]), N1 = r.pick([1500, 3000]), N2 = N1 * Z1 / Z2;
          return { enonce: `Un moteur tourne à <b>${N1} tr/min</b> avec un pignon de <b>${Z1} dents</b>. On veut que la roue menée tourne à <b>${nb(N2)} tr/min</b>. Nombre de dents Z<sub>2</sub> de la roue ?`, reponse: Z2, unite: "dents",
            explication: `N<sub>2</sub>/N<sub>1</sub> = Z<sub>1</sub>/Z<sub>2</sub> ⇒ Z<sub>2</sub> = Z<sub>1</sub> × N<sub>1</sub> / N<sub>2</sub> = ${Z1} × ${N1} / ${nb(N2)} = ${Z2} dents.` }; } },
      { fiche: T.rapport, gen: (r) => { const d1 = r.pick([20, 25, 30, 32, 40]), d2 = r.pick([60, 64, 72, 80, 90]), N1 = r.pick([3000, 4000, 4500, 5000, 6000]), N2 = N1 * d1 / d2;
          return { enonce: `Skateboard électrique : la poulie du moteur (<b>d<sub>1</sub> = ${d1} mm</b>) tourne à <b>${N1} tr/min</b> ; une courroie entraîne la poulie de la roue (<b>d<sub>2</sub> = ${d2} mm</b>). Fréquence de rotation de la roue ?`, reponse: N2, unite: "tr/min",
            explication: `Poulies-courroie : R = d<sub>1</sub>/d<sub>2</sub> = ${d1}/${d2} = ${nb(d1 / d2, 3)} ; N<sub>2</sub> = N<sub>1</sub> × d<sub>1</sub>/d<sub>2</sub> = ${nb(N2)} tr/min.` }; } },
      { fiche: T.rapport, gen: (r) => { const Z1 = r.pick([34, 38, 42, 44, 48, 50]), Z2 = r.pick([11, 13, 15, 17, 21, 24, 28]), N1 = r.pick([60, 70, 80, 90]), R = Z1 / Z2, N2 = N1 * R;
          return { enonce: `Vélo : plateau de <b>${Z1} dents</b> (pédalier), pignon arrière de <b>${Z2} dents</b>. Le cycliste pédale à <b>${N1} tr/min</b>. Fréquence de rotation de la roue arrière ?`, reponse: N2, unite: "tr/min",
            explication: `Pignon-chaîne : R = Z<sub>plateau</sub>/Z<sub>pignon</sub> = ${Z1}/${Z2} = ${nb(R, 3)} &gt; 1 (multiplicateur) ; N<sub>roue</sub> = ${N1} × ${Z1}/${Z2} = ${nb(N2)} tr/min.` }; } },
      { fiche: T.rapport, gen: (r) => { const Z = [r.pick([12, 15, 17, 20]), r.pick([40, 45, 51, 60]), r.pick([14, 16, 18, 20]), r.pick([42, 48, 54, 56])], NE = r.pick([1500, 2800, 3000]), R = Z[0] * Z[2] / (Z[1] * Z[3]), NS = NE * R;
          return { enonce: `Réducteur à deux étages : la roue 1 (arbre moteur) mène la roue 2 ; la roue 3, sur le même arbre que la roue 2, mène la roue 4 (arbre de sortie).${tab([["Roue", "1", "2", "3", "4"], ["Z", ...Z.map(String)]])}Le moteur tourne à <b>${NE} tr/min</b>. Fréquence de rotation de sortie ?`, reponse: NS, unite: "tr/min",
            explication: `R = (Z<sub>1</sub> × Z<sub>3</sub>) / (Z<sub>2</sub> × Z<sub>4</sub>) = (${Z[0]} × ${Z[2]}) / (${Z[1]} × ${Z[3]}) = ${nb(R, 3)} ; N<sub>S</sub> = ${NE} × ${nb(R, 3)} = ${nb(NS)} tr/min.` }; } },
      { fiche: T.rapport, gen: (r) => { const et = [r.pick([[12, 36], [15, 45], [16, 48], [15, 60], [12, 48]]), r.pick([[13, 39], [16, 40], [18, 54], [20, 60], [14, 56]]), r.pick([[10, 30], [12, 30], [15, 45], [17, 51]])];
          const R = et.reduce((p, e) => p * e[0] / e[1], 1), k = 1 / R;
          return { enonce: `Motoréducteur à trois étages :${tab([["Étage", "1", "2", "3"], ["Z menante", ...et.map((e) => String(e[0]))], ["Z menée", ...et.map((e) => String(e[1]))]])}Par combien la fréquence de rotation est-elle divisée entre l'entrée et la sortie ?`, reponse: k, unite: "",
            explication: `R = ${et.map((e) => `(${e[0]}/${e[1]})`).join(" × ")} = ${nb(R, 3)} ; la vitesse est divisée par 1/R = ${nb(k)}.` }; } },
      { fiche: T.rapport, gen: (r) => { const n = r.pick([1, 2, 3, 4]), Zr = r.pick([20, 25, 30, 40, 50, 60]), N = r.pick([1400, 1500, 2800, 3000]), R = n / Zr, NS = N * R;
          return { enonce: `Treuil : une vis sans fin à <b>${n} filet${n > 1 ? "s" : ""}</b> tourne à <b>${N} tr/min</b> et entraîne une roue de <b>${Zr} dents</b>. Fréquence de rotation de la roue ?`, reponse: NS, unite: "tr/min",
            explication: `Roue et vis sans fin : R = Z<sub>vis</sub>/Z<sub>roue</sub> = ${n}/${Zr} = ${nb(R, 3)} ; N<sub>roue</sub> = ${N} × ${n}/${Zr} = ${nb(NS)} tr/min. Très grande réduction en un seul étage.` }; } },
      { fiche: T.rapport, gen: (r) => { const NE = r.pick([500, 1000, 1500, 3000]), R = r.pick([0.2, 0.25, 0.4, 0.5, 2, 2.5, 4]), NS = NE * R, red = R < 1;
          const c = (t, x) => `${t} : R = ${nb(x, 3)}`;
          return { type: "qcm", enonce: `Un transmetteur reçoit <b>N<sub>E</sub> = ${NE} tr/min</b> et restitue <b>N<sub>S</sub> = ${nb(NS)} tr/min</b>. Conclusion ?`,
            choix: [c(red ? "Réducteur" : "Multiplicateur", R), c(red ? "Multiplicateur" : "Réducteur", R), c(red ? "Réducteur" : "Multiplicateur", 1 / R), c(red ? "Multiplicateur" : "Réducteur", 1 / R)], bonne: 0,
            explication: `R = N<sub>S</sub>/N<sub>E</sub> = ${nb(NS)}/${NE} = ${nb(R, 3)} ${red ? "&lt; 1 : réducteur (la vitesse diminue, le couple augmente)" : "&gt; 1 : multiplicateur (la vitesse augmente, le couple diminue)"}.` }; } },
      { type: "qcm", fiche: T.rapport, enonce: "Vélo : même plateau, même cadence. On passe du pignon arrière de 28 dents à celui de 14 dents. La fréquence de rotation de la roue…", choix: ["Double", "Est divisée par 2", "Ne change pas", "Augmente de 14 tr/min"], bonne: 0, explication: "N<sub>roue</sub> = N<sub>pédalier</sub> × Z<sub>plateau</sub> / Z<sub>pignon</sub> : Z<sub>pignon</sub> divisé par 2 ⇒ N<sub>roue</sub> multipliée par 2 (mais il faut pédaler avec un couple deux fois plus grand)." },
      { fiche: T.rapport, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5]), Z1 = r.pick([12, 14, 16, 18, 20]), Z2 = r.pick([26, 32, 40, 48, 56]), N1 = r.pick([1000, 1500, 3000]), d1 = m * Z1, d2 = m * Z2, N2 = N1 * d1 / d2;
          return { enonce: `Engrenage : diamètres primitifs <b>d<sub>1</sub> = ${nb(d1)} mm</b> (pignon moteur, <b>${N1} tr/min</b>) et <b>d<sub>2</sub> = ${nb(d2)} mm</b> (roue). Fréquence de rotation de la roue ?`, reponse: N2, unite: "tr/min",
            explication: `R = N<sub>2</sub>/N<sub>1</sub> = d<sub>1</sub>/d<sub>2</sub> = ${nb(d1)}/${nb(d2)} = ${nb(d1 / d2, 3)} ; N<sub>2</sub> = ${N1} × ${nb(d1)}/${nb(d2)} = ${nb(N2)} tr/min.` }; } },

      // ---------- Engrenages : géométrie ----------
      { fiche: T.engr, gen: (r) => { const c = r.pick(SENS);
          return { type: "qcm", enonce: `L'arbre d'entrée entraîne l'arbre de sortie par ${c[0]}. Sens de rotation de la sortie ?`,
            choix: ["Même sens que l'entrée", "Sens inverse de l'entrée", "Cela dépend du rapport R", "Alternativement dans un sens puis dans l'autre"], bonne: c[1],
            explication: "Chaque contact extérieur entre deux roues dentées inverse le sens de rotation ; une courroie ou une chaîne le conserve. Nombre pair d'inversions ⇒ même sens." }; } },
      { fiche: T.engr, gen: (r) => { const m = r.pick([1, 1.25, 1.5, 2, 2.5, 3]), Z = r.int(12, 60), d = m * Z;
          return { enonce: `Roue dentée de module <b>m = ${nb(m)} mm</b> et <b>Z = ${Z} dents</b>. Diamètre primitif ?`, reponse: d, unite: "mm",
            explication: `d = m × Z = ${nb(m)} × ${Z} = ${nb(d, 6)} mm.` }; } },
      { fiche: T.engr, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5, 3]), Z1 = r.int(12, 25), Z2 = r.int(30, 80), a = m * (Z1 + Z2) / 2;
          return { enonce: `Engrenage : module <b>${nb(m)} mm</b>, pignon <b>Z<sub>1</sub> = ${Z1}</b>, roue <b>Z<sub>2</sub> = ${Z2}</b>. Entraxe a ?`, reponse: a, unite: "mm",
            explication: `a = r<sub>1</sub> + r<sub>2</sub> = m × (Z<sub>1</sub> + Z<sub>2</sub>) / 2 = ${nb(m)} × ${Z1 + Z2} / 2 = ${nb(a, 6)} mm.` }; } },
      { fiche: T.engr, gen: (r) => { const m = r.pick([1, 1.25, 1.5, 2, 2.5, 3, 4]), Z = r.int(15, 60), d = m * Z;
          return { enonce: `Une roue de <b>${Z} dents</b> a un diamètre primitif <b>d = ${nb(d, 6)} mm</b>. Son module ?`, reponse: m, unite: "mm", tolerance: 1,
            explication: `d = m × Z ⇒ m = d / Z = ${nb(d, 6)} / ${Z} = ${nb(m)} mm.` }; } },
      { fiche: T.engr, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5, 3, 4, 5]), p = Math.PI * m;
          return { enonce: `Pas au primitif d'une roue dentée de module <b>m = ${nb(m)} mm</b> ?`, reponse: p, unite: "mm",
            explication: `p = π × m = π × ${nb(m)} = ${nb(p)} mm (même pas pour les deux roues d'un engrenage).` }; } },
      { fiche: T.engr, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5]), Z1 = r.int(12, 24), Z2 = r.int(30, 70), a = m * (Z1 + Z2) / 2;
          return { enonce: `L'entraxe imposé est <b>a = ${nb(a, 6)} mm</b>. Module <b>${nb(m)} mm</b>, pignon de <b>${Z1} dents</b>. Nombre de dents de la roue ?`, reponse: Z2, unite: "dents", tolerance: 1,
            explication: `a = m × (Z<sub>1</sub> + Z<sub>2</sub>) / 2 ⇒ Z<sub>2</sub> = 2a/m − Z<sub>1</sub> = 2 × ${nb(a, 6)} / ${nb(m)} − ${Z1} = ${Z2} dents.` }; } },
      { type: "qcm", fiche: T.engr, enonce: "Condition pour que deux roues dentées puissent engrener ?", choix: ["Avoir le même module", "Avoir le même nombre de dents", "Avoir le même diamètre primitif", "Tourner à la même vitesse"], bonne: 0, explication: "Les dents doivent avoir la même taille : même pas p = π·m, donc même module." },
      { fiche: T.engr, gen: (r) => { const mods = [1, 1.5, 2, 2.5, 3], m1 = r.pick(mods), meme = r.pick([true, false]), m2 = meme ? m1 : r.pick(mods.filter((x) => x !== m1)), Z1 = r.int(12, 20), Z2 = r.int(30, 60);
          return { type: "qcm", enonce: `Pignon : <b>Z = ${Z1}</b>, <b>d = ${nb(m1 * Z1)} mm</b>. Roue : <b>Z = ${Z2}</b>, <b>d = ${nb(m2 * Z2)} mm</b>. Peuvent-ils engrener ensemble ?`,
            choix: ["Oui : ils ont le même module", "Non : leurs modules sont différents", "Non : leurs nombres de dents sont différents", "Oui : il suffit que la roue soit plus grande que le pignon"], bonne: meme ? 0 : 1,
            explication: `m = d / Z : pignon ${nb(m1 * Z1)}/${Z1} = ${nb(m1)} mm ; roue ${nb(m2 * Z2)}/${Z2} = ${nb(m2)} mm. ${meme ? "Même module, donc même pas : l'engrènement est possible." : "Modules différents : les dents n'ont pas la même taille, l'engrènement est impossible."}` }; } },
      { type: "qcm", fiche: T.engr, enonce: "Dans un engrenage, le « pignon » désigne…", choix: ["La plus petite des deux roues dentées", "La plus grande des deux roues dentées", "L'ensemble des deux roues dentées", "Toujours la roue menée"], bonne: 0, explication: "Vocabulaire du cours : pignon = la plus petite roue, roue = la plus grande, engrenage = l'ensemble des deux." },

      // ---------- Puissance, couple, rendement ----------
      { fiche: T.puis, gen: (r) => { const N = r.pick([300, 750, 1000, 1440, 1500, 2800, 3000]), om = w(N);
          return { enonce: `Convertis <b>N = ${N} tr/min</b> en vitesse angulaire ω (rad/s).`, reponse: om, unite: "rad/s",
            explication: `ω = 2π × N / 60 = π × ${N} / 30 = ${nb(om)} rad/s.` }; } },
      { fiche: T.puis, gen: (r) => { const om = r.pas(10, 300, 5), N = om * 30 / Math.PI;
          return { enonce: `Un arbre tourne à <b>ω = ${om} rad/s</b>. Fréquence de rotation N en tr/min ?`, reponse: N, unite: "tr/min",
            explication: `N = 60 × ω / (2π) = 30 × ${om} / π = ${nb(N)} tr/min.` }; } },
      { fiche: T.puis, gen: (r) => { const C = r.pas(0.5, 20, 0.5), N = r.pick([500, 750, 1000, 1500, 3000]), om = w(N), P = C * om;
          return { enonce: `Un arbre transmet un couple <b>C = ${nb(C)} N·m</b> à <b>N = ${N} tr/min</b>. Puissance transmise ?`, reponse: P, unite: "W",
            explication: `ω = π × ${N} / 30 = ${nb(om)} rad/s ; P = C × ω = ${nb(C)} × ${nb(om)} = ${nb(P)} W.` }; } },
      { fiche: T.puis, gen: (r) => { const P = r.pick([250, 350, 500, 800]), N = r.pick([300, 400, 500, 600]), om = w(N), C = P / om;
          return { enonce: `Le moteur-roue d'une trottinette fournit <b>${P} W</b> à <b>${N} tr/min</b>. Couple sur la roue ?`, reponse: C, unite: "N·m",
            explication: `ω = π × ${N} / 30 = ${nb(om)} rad/s ; C = P / ω = ${P} / ${nb(om)} = ${nb(C)} N·m.` }; } },
      { fiche: T.puis, gen: (r) => { const k = r.pick([4, 5, 10, 20]), eta = r.pick([0.7, 0.75, 0.8, 0.85, 0.9, 0.95]), CE = r.pas(0.5, 4, 0.5), NE = r.pick([1500, 3000]), NS = NE / k, CS = eta * CE * k, PE = CE * w(NE), PS = CS * w(NS);
          return { enonce: `Essai d'un réducteur :${tab([["", "Entrée", "Sortie"], ["Couple (N·m)", nb(CE), nb(CS)], ["N (tr/min)", String(NE), nb(NS)]])}Rendement du réducteur (en %) ?`, reponse: eta * 100, unite: "%",
            explication: `P<sub>E</sub> = C<sub>E</sub>·ω<sub>E</sub> = ${nb(CE)} × ${nb(w(NE))} = ${nb(PE)} W ; P<sub>S</sub> = ${nb(CS)} × ${nb(w(NS))} = ${nb(PS)} W ; η = P<sub>S</sub>/P<sub>E</sub> = ${nb(100 * PS / PE)} %.` }; } },
      { fiche: T.puis, gen: (r) => { const k = r.pick([5, 10, 15, 20, 30]), eta = r.pick([0.8, 0.85, 0.9, 0.95]), CE = r.pas(0.5, 5, 0.5), CS = eta * CE * k;
          return { enonce: `Un réducteur de rapport <b>R = 1/${k}</b> et de rendement <b>η = ${nb(eta)}</b> reçoit un couple moteur <b>C<sub>E</sub> = ${nb(CE)} N·m</b>. Couple de sortie C<sub>S</sub> ?`, reponse: CS, unite: "N·m",
            explication: `P<sub>S</sub> = η·P<sub>E</sub> ⇒ C<sub>S</sub>·ω<sub>S</sub> = η·C<sub>E</sub>·ω<sub>E</sub> ⇒ C<sub>S</sub> = η × C<sub>E</sub> / R = ${nb(eta)} × ${nb(CE)} × ${k} = ${nb(CS)} N·m.` }; } },
      { fiche: T.puis, gen: (r) => { const PE = r.pick([250, 350, 500, 750, 1000, 1500]), eta = r.pick([0.6, 0.7, 0.8, 0.85, 0.9, 0.95]), pertes = PE * (1 - eta);
          return { enonce: `Un réducteur reçoit <b>P<sub>E</sub> = ${PE} W</b> ; son rendement est de <b>${nb(eta * 100)} %</b>. Puissance perdue (dissipée en chaleur) ?`, reponse: pertes, unite: "W",
            explication: `P<sub>S</sub> = η × P<sub>E</sub> = ${nb(eta)} × ${PE} = ${nb(PE * eta)} W ; pertes = P<sub>E</sub> − P<sub>S</sub> = ${nb(pertes)} W.` }; } },
      { fiche: T.puis, gen: (r) => { const e = [r.pick([0.98, 0.99]), r.pick([0.95, 0.96, 0.97]), r.pick([0.97, 0.98]), r.pick([0.94, 0.95, 0.96])], P = r.pick([20, 35, 50, 70]), eta = e.reduce((a, b) => a * b, 1), PR = P * eta;
          return { enonce: `Transmission de moto, moteur de <b>${P} kW</b> :${tab([["Élément", "embrayage", "boîte de vitesses", "cardan", "engrenage conique"], ["η", ...e.map((x) => nb(x))]])}Puissance disponible à la roue ?`, reponse: PR, unite: "kW",
            explication: `η<sub>global</sub> = ${e.map((x) => nb(x)).join(" × ")} = ${nb(eta, 3)} ; P<sub>roue</sub> = ${P} × ${nb(eta, 3)} = ${nb(PR)} kW.` }; } },
      { fiche: T.puis, gen: (r) => { const PE = r.pick([600, 800, 1000, 1200]), NE = r.pick([2400, 3000, 3600]), k = r.pick([12, 16, 20, 24]), eta = r.pick([0.85, 0.9, 0.95]), NS = NE / k, omS = w(NS), CS = eta * PE / omS;
          return { enonce: `Gyropode : un moteur fournit <b>${PE} W</b> à <b>${NE} tr/min</b> ; un réducteur (<b>R = 1/${k}</b>, <b>η = ${nb(eta)}</b>) entraîne la roue. Couple disponible sur la roue ?`, reponse: CS, unite: "N·m", tolerance: 3,
            explication: `N<sub>roue</sub> = ${NE} / ${k} = ${nb(NS)} tr/min ⇒ ω<sub>roue</sub> = ${nb(omS)} rad/s ; P<sub>roue</sub> = ${nb(eta)} × ${PE} = ${nb(eta * PE)} W ; C = P / ω = ${nb(CS)} N·m.` }; } },
      { fiche: T.puis, gen: (r) => { const C = r.pas(1, 10, 0.5), N = r.pick([600, 900, 1200, 1500, 3000]), Pbon = C * w(N), Pfaux = C * N;
          return { type: "qcm", enonce: `C = ${nb(C)} N·m, N = ${N} tr/min. Un élève écrit : « P = C × N = ${nb(Pfaux)} W ». Son résultat est…`,
            choix: [`Faux : il faut ω en rad/s, P = ${nb(Pbon)} W`, "Juste", `Faux : il faut N en tr/s, P = ${nb(C * N / 60)} W`, `Faux : il faut diviser par 2π, P = ${nb(Pfaux / (2 * Math.PI))} W`], bonne: 0,
            explication: `ω = π × ${N} / 30 = ${nb(w(N))} rad/s ; P = C × ω = ${nb(Pbon)} W. Avec N en tr/min, on obtient une valeur ${nb(30 / Math.PI, 3)} fois trop grande.` }; } },
      { type: "qcm", fiche: T.puis, enonce: "Un réducteur divise la vitesse de rotation par 10. En négligeant les pertes, le couple de sortie est…", choix: ["Multiplié par 10", "Divisé par 10", "Inchangé", "Multiplié par 100"], bonne: 0, explication: "Sans pertes P<sub>S</sub> = P<sub>E</sub> : C<sub>S</sub>·ω<sub>S</sub> = C<sub>E</sub>·ω<sub>E</sub>. Si ω est divisée par 10, C est multiplié par 10." },
      { type: "qcm", fiche: T.puis, enonce: "Dans la formule P = C × ω, la vitesse angulaire ω s'exprime en…", choix: ["rad/s", "tr/min", "tr/s", "m/s"], bonne: 0, explication: "Unités SI : P en W, C en N·m, ω en rad/s. On convertit : ω = 2π·N / 60 avec N en tr/min." },
      { type: "qcm", fiche: T.puis, enonce: "Un élève trouve un rendement η = 1,05 pour un réducteur. C'est…", choix: ["Impossible : η &lt; 1, une partie de la puissance est perdue en chaleur", "Possible si c'est un multiplicateur", "Possible car le couple de sortie est plus grand que le couple d'entrée", "Possible si le réducteur est bien lubrifié"], bonne: 0, explication: "η = P<sub>S</sub>/P<sub>E</sub> : la sortie ne peut pas fournir plus de puissance qu'elle n'en reçoit. Un couple plus grand en sortie n'est pas une puissance plus grande (la vitesse baisse)." },

      // ---------- Transformation de mouvement ----------
      { fiche: T.transfo, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5]), Z = r.pick([12, 15, 16, 18, 20, 24, 30]), N = r.pick([30, 60, 100, 120, 200]), rr = m * Z / 2, om = w(N), V = om * rr;
          return { enonce: `Pignon-crémaillère : pignon de module <b>${nb(m)} mm</b> et de <b>${Z} dents</b>, tournant à <b>${N} tr/min</b>. Vitesse de la crémaillère (en mm/s) ?`, reponse: V, unite: "mm/s",
            explication: `r = m × Z / 2 = ${nb(rr)} mm ; ω = π × ${N} / 30 = ${nb(om)} rad/s ; V = ω × r = ${nb(om)} × ${nb(rr)} = ${nb(V)} mm/s.` }; } },
      { fiche: T.transfo, gen: (r) => { const m = r.pick([1, 1.5, 2, 2.5, 3]), Z = r.pick([12, 15, 18, 20, 25]), n = r.pick([2, 3, 5, 10]), L = n * Math.PI * m * Z;
          return { enonce: `Un pignon (<b>m = ${nb(m)} mm</b>, <b>Z = ${Z}</b>) engrène avec une crémaillère et fait <b>${n} tours</b>. Déplacement de la crémaillère ?`, reponse: L, unite: "mm",
            explication: `Un tour = périmètre primitif = π × d = π × ${nb(m * Z)} = ${nb(Math.PI * m * Z)} mm ; pour ${n} tours : ${nb(L)} mm.` }; } },
      { fiche: T.transfo, gen: (r) => { const p = r.pick([1, 1.5, 2, 2.5, 3, 4, 5]), N = r.pick([300, 600, 900, 1200, 1500]), V = p * N / 60;
          return { enonce: `Système vis-écrou : vis de <b>pas ${nb(p)} mm</b> (un filet) tournant à <b>${N} tr/min</b>. Vitesse de translation de l'écrou (mm/s) ?`, reponse: V, unite: "mm/s",
            explication: `L'écrou avance d'un pas par tour : V = p × N / 60 = ${nb(p)} × ${N} / 60 = ${nb(V)} mm/s.` }; } },
      { fiche: T.transfo, gen: (r) => { const p = r.pick([2, 2.5, 4, 5]), N = r.pick([600, 900, 1200, 1500]), L = r.pick([100, 150, 200, 300]), V = p * N / 60, t = L / V;
          return { enonce: `Un vérin électrique à vis (<b>pas ${nb(p)} mm</b>) tourne à <b>${N} tr/min</b>. Durée pour une course de <b>${L} mm</b> ?`, reponse: t, unite: "s",
            explication: `V = p × N / 60 = ${nb(V)} mm/s ; t = course / V = ${L} / ${nb(V)} = ${nb(t)} s.` }; } },
      { fiche: T.transfo, gen: (r) => { const Z1 = r.pick([36, 42, 44]), Z2 = r.pick([14, 16, 18, 21]), N = r.pick([60, 70, 80]), D = r.pick([0.66, 0.7]), NR = N * Z1 / Z2, om = w(NR), V = om * D / 2 * 3.6;
          return { enonce: `Vélo à assistance électrique : plateau <b>${Z1} dents</b>, pignon <b>${Z2} dents</b>, cadence <b>${N} tr/min</b>, roue de <b>${nb(D * 100)} cm</b> de diamètre. Vitesse du vélo (km/h) ?`, reponse: V, unite: "km/h", tolerance: 3,
            explication: `N<sub>roue</sub> = ${N} × ${Z1}/${Z2} = ${nb(NR)} tr/min ⇒ ω = ${nb(om)} rad/s ; V = ω × r = ${nb(om)} × ${nb(D / 2)} = ${nb(om * D / 2)} m/s = ${nb(V)} km/h.` }; } },
      { fiche: T.transfo, gen: (r) => { const F = r.pas(500, 3000, 250), V = r.pick([0.01, 0.02, 0.025, 0.04, 0.05]), eta = r.pick([0.3, 0.4, 0.5, 0.6]), PS = F * V, PE = PS / eta;
          return { enonce: `Un vérin électrique (vis-écrou, rendement <b>η = ${nb(eta)}</b>) pousse avec <b>F = ${F} N</b> à <b>V = ${nb(V * 1000)} mm/s</b>. Puissance mécanique à fournir sur la vis ?`, reponse: PE, unite: "W",
            explication: `P<sub>S</sub> = F × V = ${F} × ${nb(V)} = ${nb(PS)} W (V en m/s) ; P<sub>E</sub> = P<sub>S</sub> / η = ${nb(PS)} / ${nb(eta)} = ${nb(PE)} W.` }; } },
      { type: "qcm", fiche: T.transfo, enonce: "Quel système transforme une rotation continue en translation continue ?", choix: ["Pignon-crémaillère", "Roue et vis sans fin", "Engrenage conique", "Poulies-courroie"], bonne: 0, explication: "Pignon-crémaillère (comme vis-écrou) : rotation → translation. Les trois autres transmettent une rotation en une autre rotation." },
      { fiche: T.transfo, gen: (r) => { const s = r.pick(SYS);
          return { type: "qcm", enonce: `Quelle transformation de mouvement réalise : <b>${s[0]}</b> ?`, choix: MVTS.slice(), bonne: s[1],
            explication: `${s[0]} : ${MVTS[s[1]].toLowerCase()}. Synthèse : translation continue = pignon-crémaillère, vis-écrou, treuil ; translation alternative = bielle-manivelle, cadre à coulisse ; rotation discontinue = croix de Malte.` }; } },
      { type: "qcm", fiche: T.transfo, enonce: "Dans la structure d'une transmission, un pignon-crémaillère est…", choix: ["Un transformateur de mouvement : P<sub>S</sub> = F<sub>S</sub> × V<sub>S</sub>", "Un adaptateur : P<sub>S</sub> = C<sub>S</sub> × ω<sub>S</sub>", "Un transmetteur, comme un embrayage", "Un convertisseur d'énergie, comme un moteur"], bonne: 0, explication: "Adaptateur (engrenages, poulies…) : rotation → rotation, P<sub>S</sub> = C<sub>S</sub>·ω<sub>S</sub>. Transformateur (pignon-crémaillère, vis-écrou) : rotation → translation, P<sub>S</sub> = F<sub>S</sub>·V<sub>S</sub>." },

      // ---------- Choix d'une solution ----------
      { fiche: T.choix, gen: (r) => { const c = r.pick(AXES), autres = r.melange(AXES.filter((x) => x !== c).map((x) => x[1])).slice(0, 3);
          return { type: "qcm", enonce: `${c[0]} : quelle solution de transmission choisir ?`, choix: [c[1], ...autres], bonne: 0,
            explication: "Synthèse : arbres proches → engrenages (cylindriques si parallèles, coniques si concourants, roue et vis si orthogonaux) ; arbres éloignés → poulies-courroie (adhérence) ou chaîne / courroie crantée (obstacle, sans glissement)." }; } },
      { fiche: T.choix, gen: (r) => { const c = r.pick(FONCTIONS), autres = r.melange(FONCTIONS.filter((x) => x !== c).map((x) => x[1]).concat(AUTRES_COMPOSANTS)).slice(0, 3);
          return { type: "qcm", enonce: `Quel composant permet de : <b>${c[0]}</b> ?`, choix: [c[1], ...autres], bonne: 0,
            explication: "Transmission permanente : accouplement (deux sens), roue libre (un seul sens). Transmission temporaire : embrayage (progressive), frein (ralentie), limiteur de couple (couple limité)." }; } },
      { type: "qcm", fiche: T.choix, enonce: "Un système de transmission est dit réversible lorsque…", choix: ["La sortie peut devenir motrice et entraîner l'entrée", "Il peut tourner dans les deux sens", "Son rendement vaut 100 %", "On peut le démonter et le remonter facilement"], bonne: 0, explication: "Réversibilité : l'énergie peut circuler de la sortie vers l'entrée. Un pignon-crémaillère est réversible ; une roue et vis sans fin l'est rarement." },
      { type: "qcm", fiche: T.choix, enonce: "Pour un treuil qui doit rester bloqué quand le moteur s'arrête, quel transmetteur choisir ?", choix: ["Roue et vis sans fin (irréversible)", "Engrenage cylindrique", "Poulies et courroie plate", "Pignons et chaîne"], bonne: 0, explication: "Une roue et vis sans fin à un filet est en général irréversible : la charge ne peut pas faire tourner la vis, le treuil reste bloqué." },
      { type: "qcm", fiche: T.choix, enonce: "Skateboard électrique : pourquoi une courroie crantée plutôt qu'une courroie plate entre le moteur et la roue ?", choix: ["Elle transmet par obstacle : pas de glissement", "Elle inverse le sens de rotation", "Elle permet des arbres perpendiculaires", "Elle ne s'use jamais"], bonne: 0, explication: "Courroie plate ou trapézoïdale : transmission par adhérence (elle peut glisser sous fort couple). Courroie crantée : transmission par obstacle, sans glissement." },
      { type: "qcm", fiche: T.choix, enonce: "Transmission de moto : ordre des éléments, du moteur à la roue ?", choix: ["Moteur → embrayage → boîte de vitesses → cardan → engrenage conique → roue", "Moteur → boîte de vitesses → embrayage → cardan → engrenage conique → roue", "Moteur → cardan → embrayage → boîte de vitesses → engrenage conique → roue", "Moteur → embrayage → engrenage conique → cardan → boîte de vitesses → roue"], bonne: 0, explication: "Exemple de la synthèse : l'embrayage désaccouple le moteur, la boîte adapte la vitesse, le cardan transmet vers l'arrière et l'engrenage conique renvoie le mouvement à 90° vers la roue." },
      { type: "qcm", fiche: T.choix, enonce: "Poulies et courroie plate ou trapézoïdale : la puissance est transmise par…", choix: ["Adhérence (frottement), glissement possible", "Obstacle (dents), sans glissement", "Engrènement direct des deux poulies", "Liaison rigide entre les deux arbres"], bonne: 0, explication: "Adhérence : le couple transmissible est limité par le frottement courroie/poulie ; en cas de surcharge, la courroie patine." }
    ],
    fiches: [
      { id: T.rapport, titre: "Rapport de transmission R",
        recto: "Comment définir le rapport de transmission R, et comment le calculer pour un engrenage, des poulies, une chaîne, une roue et vis, un train ?",
        verso: `<div class="formule">R = N<sub>2</sub> / N<sub>1</sub> = ω<sub>S</sub> / ω<sub>E</sub></div><ul><li>Engrenage : R = Z<sub>1</sub>/Z<sub>2</sub> = d<sub>1</sub>/d<sub>2</sub> (1 = menant)</li><li>Poulies-courroie : R = d<sub>1</sub>/d<sub>2</sub> ; pignon-chaîne : R = Z<sub>1</sub>/Z<sub>2</sub></li><li>Roue et vis sans fin : R = Z<sub>vis</sub> (nb de filets) / Z<sub>roue</sub></li><li>Train : R = R<sub>1</sub> × R<sub>2</sub> × …</li></ul><p class="astuce">R &lt; 1 : réducteur (vitesse ↓, couple ↑). R &gt; 1 : multiplicateur.</p>`,
        quiz: [{ enonce: "Z<sub>1</sub> = 12 (menant), Z<sub>2</sub> = 36 : R = …", choix: ["1/3", "3", "1/12"], bonne: 0 }, { enonce: "R = 0,25 : il s'agit…", choix: ["D'un réducteur", "D'un multiplicateur", "D'un limiteur de couple"], bonne: 0 }, { enonce: "Vis à 1 filet, roue de 40 dents : R = …", choix: ["1/40", "40", "1/41"], bonne: 0 }] },
      { id: T.engr, titre: "Engrenages : module et dimensions",
        recto: "Quelles relations lient le module, le nombre de dents, le diamètre primitif, le pas et l'entraxe d'un engrenage ?",
        verso: `<div class="formule">d = m × Z &nbsp;·&nbsp; p = π × m</div><div class="formule">a = r<sub>1</sub> + r<sub>2</sub> = m × (Z<sub>1</sub> + Z<sub>2</sub>) / 2</div><p>m (module), d, p, a en mm. Pignon = la plus petite roue. Pour engrener, deux roues doivent avoir le <b>même module</b> (donc le même pas).</p><p class="astuce">Contact extérieur entre deux roues : sens de rotation inversé. Courroie ou chaîne : même sens.</p>`,
        quiz: [{ enonce: "m = 2 mm, Z = 30 : d = …", choix: ["60 mm", "15 mm", "32 mm"], bonne: 0 }, { enonce: "Pour engrener, deux roues doivent avoir…", choix: ["Le même module", "Le même nombre de dents", "Le même diamètre"], bonne: 0 }, { enonce: "m = 2 mm, Z<sub>1</sub> = 20, Z<sub>2</sub> = 40 : a = …", choix: ["60 mm", "120 mm", "30 mm"], bonne: 0 }] },
      { id: T.puis, titre: "Puissance, couple et rendement",
        recto: "Comment calculer la puissance d'un arbre en rotation ? Que deviennent puissance et couple à travers un réducteur ?",
        verso: `<div class="formule">P = C × ω &nbsp;·&nbsp; ω = 2π·N / 60</div><div class="formule">η = P<sub>S</sub> / P<sub>E</sub> &nbsp;⇒&nbsp; C<sub>S</sub> = η × C<sub>E</sub> / R</div><p>P en W, C en N·m, ω en rad/s, N en tr/min. Plusieurs éléments : η<sub>global</sub> = η<sub>1</sub> × η<sub>2</sub> × … (toujours &lt; 1).</p><p class="astuce">Jamais N (tr/min) dans P = C·ω : convertir d'abord en rad/s. Vitesse divisée ⇒ couple multiplié (au rendement près).</p>`,
        quiz: [{ enonce: "N = 3 000 tr/min : ω ≈ …", choix: ["314 rad/s", "50 rad/s", "3 000 rad/s"], bonne: 0 }, { enonce: "C = 2 N·m à ω = 100 rad/s : P = …", choix: ["200 W", "50 W", "2 W"], bonne: 0 }, { enonce: "η = 0,8 et P<sub>E</sub> = 500 W : P<sub>S</sub> = …", choix: ["400 W", "625 W", "100 W"], bonne: 0 }] },
      { id: T.transfo, titre: "Transformer une rotation en translation",
        recto: "Comment calculer la vitesse d'une crémaillère ou d'un écrou, et la puissance en translation ?",
        verso: `<div class="formule">Pignon-crémaillère : V = ω × r = ω × m·Z / 2</div><div class="formule">Vis-écrou : V = p × N / 60 (un pas par tour)</div><p>Transformateur de mouvement : P<sub>S</sub> = F<sub>S</sub> × V<sub>S</sub> (N, m/s). Treuil : translation continue ; bielle-manivelle : alternative ; croix de Malte : rotation discontinue.</p><p class="astuce">Unités : r en mm ⇒ V en mm/s. Vis-écrou classique : souvent irréversible.</p>`,
        quiz: [{ enonce: "Vis de pas 2 mm à 600 tr/min : V = …", choix: ["20 mm/s", "1 200 mm/s", "300 mm/s"], bonne: 0 }, { enonce: "Pignon de rayon 20 mm à ω = 10 rad/s : V<sub>crémaillère</sub> = …", choix: ["200 mm/s", "2 mm/s", "20 mm/s"], bonne: 0 }, { enonce: "Bielle-manivelle : rotation → …", choix: ["Translation alternative", "Translation continue", "Rotation discontinue"], bonne: 0 }] },
      { id: T.choix, titre: "Choisir une solution de transmission",
        recto: "Quelle solution de transmission choisir selon la position des arbres et la fonction attendue ?",
        verso: `<ul><li>Arbres proches : engrenage cylindrique (parallèles), conique (concourants), roue et vis sans fin (orthogonaux)</li><li>Arbres éloignés : poulies-courroie (adhérence, glissement possible) ; chaîne ou courroie crantée (obstacle, sans glissement)</li><li>Accouplement (permanent), roue libre (un sens), embrayage (temporaire, progressif), frein, limiteur de couple</li></ul><p class="astuce">Réversible : la sortie peut entraîner l'entrée. Roue et vis : souvent irréversible (le treuil reste bloqué).</p>`,
        quiz: [{ enonce: "Arbres perpendiculaires, axes concourants :", choix: ["Engrenage conique", "Engrenage cylindrique", "Poulies-courroie"], bonne: 0 }, { enonce: "Transmettre dans un seul sens de rotation :", choix: ["Roue libre", "Embrayage", "Accouplement"], bonne: 0 }, { enonce: "Arbres éloignés, sans glissement :", choix: ["Chaîne ou courroie crantée", "Courroie plate", "Engrenage cylindrique"], bonne: 0 }] }
    ]
  });
})();
