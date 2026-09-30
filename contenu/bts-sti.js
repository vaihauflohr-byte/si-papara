/* ===================== BTS — option STI =====================
   Conception : étude préliminaire → étude détaillée → réalisation */

// ---------- BTS 1 STI ----------
SIP.definirModule({
  id: "bts1-sti-dimens",
  sequence: "Option STI · Conception",
  niveaux: ["BTS1-STI"],
  titre: "Conception : dimensionner une installation",
  description: "Étapes d'un projet, bilan de puissance, courant d'emploi, protection, chute de tension.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts1-sti-bilan", gen: (r) => { const n = r.pick([2, 3, 4, 5, 6, 8]), Pn = r.pick([2.2, 4, 5.5, 7.5]), Ku = r.pick([0.75, 0.8]); const Ks = n <= 3 ? 0.9 : n <= 5 ? 0.8 : 0.7; const P = n * Pn * Ku * Ks; return { enonce: `Un atelier comporte <b>${n} moteurs de ${SIP.nb(Pn)} kW</b>, coefficient d'utilisation <b>K<sub>u</sub> = ${SIP.nb(Ku)}</b>. Pour ${n} circuits, on prend <b>K<sub>s</sub> = ${SIP.nb(Ks)}</b>. Puissance d'utilisation à prévoir ?`, reponse: P, unite: "kW", explication: `P = n × P<sub>n</sub> × K<sub>u</sub> × K<sub>s</sub> = ${n} × ${SIP.nb(Pn)} × ${SIP.nb(Ku)} × ${SIP.nb(Ks)} = ${SIP.nb(P)} kW.` }; } },
    { fiche: "bts1-sti-bilan", gen: (r) => { const P = r.pick([12, 18, 24, 36, 48]), c = r.pick([0.8, 0.85, 0.9]); return { enonce: `Le bilan de puissance donne <b>P = ${P} kW</b> avec un <b>cos φ global = ${SIP.nb(c)}</b>. Puissance apparente à souscrire (kVA) ?`, reponse: P / c, unite: "kVA", explication: `S = P / cos φ = ${P} / ${SIP.nb(c)} = ${SIP.nb(P / c)} kVA → on retient la valeur normalisée immédiatement supérieure.` }; } },
    { fiche: "bts1-sti-protection", gen: (r) => { const P = r.pick([2000, 2500, 3000, 3500, 4500, 6000]), c = r.pick([0.8, 0.9, 1]); return { enonce: `Circuit monophasé 230 V alimentant <b>${P} W</b>, <b>cos φ = ${SIP.nb(c)}</b>. Courant d'emploi I<sub>b</sub> ?`, reponse: P / (230 * c), unite: "A", explication: `I<sub>b</sub> = P / (U·cos φ) = ${P} / (230 × ${SIP.nb(c)}) = ${SIP.nb(P / (230 * c))} A.` }; } },
    { fiche: "bts1-sti-chute", gen: (r) => { const L = r.pas(20, 60, 5), S = r.pick([1.5, 2.5, 4, 6]), I = r.pick([10, 13, 16, 20, 25]); const dU = 2 * 0.0225 * L * I / S; return { enonce: `Chauffe-eau (cos φ = 1) : <b>I<sub>b</sub> = ${I} A</b>, câble cuivre de <b>${SIP.nb(S)} mm²</b>, longueur <b>${L} m</b>, ρ = 0,0225 Ω·mm²/m, réseau 230 V. Chute de tension en <b>%</b> ?`, reponse: 100 * dU / 230, unite: "%", explication: `ΔU = 2·ρ·L·I<sub>b</sub>/S = 2 × 0,0225 × ${L} × ${I} / ${SIP.nb(S)} = ${SIP.nb(dU)} V, soit ${SIP.nb(100 * dU / 230)} % de 230 V (limite : 5 % hors éclairage).` }; } },
    { fiche: "bts1-sti-chute", gen: (r) => { const L = r.pas(25, 80, 5), I = r.pick([16, 20, 25, 32]); const S = 2 * 0.0225 * L * I / 6.9; return { enonce: `Ligne monophasée 230 V de <b>${L} m</b>, <b>I<sub>b</sub> = ${I} A</b>, cos φ = 1, cuivre (ρ = 0,0225 Ω·mm²/m). Section <b>minimale calculée</b> pour ne pas dépasser <b>3 %</b> de chute de tension ?`, reponse: S, unite: "mm²", explication: `ΔU<sub>max</sub> = 3 % × 230 = 6,9 V ; S = 2·ρ·L·I<sub>b</sub> / ΔU<sub>max</sub> = ${SIP.nb(S)} mm² → on choisit la section normalisée supérieure.` }; } },
    { type: "qcm", fiche: "bts1-sti-protection", enonce: "I<sub>b</sub> = 21 A, le câble admet I<sub>z</sub> = 32 A. Quel calibre de disjoncteur ?", choix: ["25 A", "20 A", "40 A", "16 A"], bonne: 0, explication: "Il faut I<sub>b</sub> ≤ I<sub>n</sub> ≤ I<sub>z</sub> : 21 ≤ 25 ≤ 32. 20 A ne laisse pas passer le courant d'emploi, 40 A ne protège plus le câble." },
    { type: "qcm", fiche: "bts1-sti-projet", enonce: "Dans quel ordre se déroule un projet d'installation ?", choix: ["Étude préliminaire → étude détaillée → réalisation → mise en service", "Étude détaillée → étude préliminaire → réalisation → mise en service", "Réalisation → étude préliminaire → étude détaillée → mise en service", "Étude préliminaire → réalisation → étude détaillée → mise en service"], bonne: 0, explication: "On part du besoin (préliminaire), on dimensionne et on choisit (détaillée), puis on réalise et on met en service." },
    { type: "qcm", fiche: "bts1-sti-projet", enonce: "Le bilan de puissance, le choix de la source d'énergie et du schéma de liaison à la terre relèvent de…", choix: ["L'étude préliminaire", "L'étude détaillée", "La réalisation", "La mise en service"], bonne: 0, explication: "Ce sont des choix structurants faits en amont, sur le schéma de principe." },
    { type: "qcm", fiche: "bts1-sti-projet", enonce: "Le choix des références (calibres, sections, réglages), les schémas développés et la nomenclature relèvent de…", choix: ["L'étude détaillée", "L'étude préliminaire", "La mise en service", "L'analyse du besoin"], bonne: 0, explication: "L'étude détaillée produit le dossier qui permet de commander et de câbler." },
    { type: "qcm", fiche: "bts1-sti-bilan", enonce: "Le coefficient de simultanéité K<sub>s</sub> traduit…", choix: ["Le fait que tous les récepteurs ne fonctionnent pas en même temps", "Le fait qu'un moteur ne tourne pas à pleine charge", "Le rendement des moteurs", "Les pertes dans les câbles"], bonne: 0, explication: "K<sub>u</sub> = pas à pleine charge ; K<sub>s</sub> = pas tous en même temps." },
    { type: "qcm", fiche: "bts1-sti-chute", enonce: "Installation alimentée par le réseau BT public : chute de tension maximale admise sur un circuit d'<b>éclairage</b> ?", choix: ["3 %", "5 %", "8 %", "10 %"], bonne: 0, explication: "NF C 15-100 : 3 % pour l'éclairage, 5 % pour les autres usages (réseau public BT)." }
  ],
  fiches: [
    {
      id: "bts1-sti-projet", titre: "Les étapes d'un projet",
      recto: "Quelles sont les étapes d'un projet d'installation, et que produit chacune ?",
      verso: `<ol><li><b>Étude préliminaire</b> : analyse du besoin, cahier des charges, bilan de puissance, choix énergie / SLT, schéma de principe</li>
        <li><b>Étude détaillée</b> : calculs (I<sub>b</sub>, sections, ΔU, I<sub>cc</sub>), choix des matériels, schémas développés, nomenclature, devis</li>
        <li><b>Réalisation</b> : approvisionnement, câblage, essais</li>
        <li><b>Mise en service</b> : contrôles, réception, PV, dossier technique remis au client</li></ol>`,
      quiz: [{ enonce: "Le schéma de principe est produit pendant…", choix: ["L'étude préliminaire", "La réalisation", "La mise en service"], bonne: 0 }, { enonce: "La nomenclature du matériel appartient à…", choix: ["L'étude détaillée", "L'étude préliminaire", "La réception"], bonne: 0 }]
    },
    {
      id: "bts1-sti-bilan", titre: "Bilan de puissance (K<sub>u</sub>, K<sub>s</sub>)",
      recto: "Comment calcule-t-on la puissance d'utilisation d'une installation ?",
      verso: `<div class="formule">P<sub>u</sub> = Σ(P<sub>n</sub> × K<sub>u</sub>) × K<sub>s</sub> &nbsp;·&nbsp; S = P<sub>u</sub> / cos φ</div>
        <ul><li><b>K<sub>u</sub></b> (utilisation) : un récepteur ne fonctionne pas à pleine charge (moteurs ≈ 0,75)</li>
        <li><b>K<sub>s</sub></b> (simultanéité) : ils ne fonctionnent pas tous ensemble — 2 à 3 circuits : 0,9 ; 4 à 5 : 0,8 ; 6 à 9 : 0,7 ; 10 et plus : 0,6</li></ul>
        <p class="astuce">S sert à choisir le transformateur ou la puissance souscrite.</p>`,
      quiz: [{ enonce: "K<sub>s</sub> traduit…", choix: ["La non-simultanéité", "La charge partielle", "Le rendement"], bonne: 0 }, { enonce: "Pour 5 circuits, K<sub>s</sub> ≈ …", choix: ["0,8", "0,9", "0,6"], bonne: 0 }]
    },
    {
      id: "bts1-sti-protection", titre: "Protection des canalisations",
      recto: "Quelle relation lie courant d'emploi, calibre de la protection et courant admissible du câble ?",
      verso: `<div class="formule">I<sub>b</sub> ≤ I<sub>n</sub> ≤ I<sub>z</sub></div>
        <p>I<sub>b</sub> : courant d'emploi (charge) · I<sub>n</sub> : calibre · I<sub>z</sub> : courant admissible du câble (section, mode de pose, température).</p>
        <p>Démarche : I<sub>b</sub> → I<sub>n</sub> → I<sub>z</sub> → section → vérifier ΔU → vérifier I<sub>cc</sub> et protection des personnes.</p>`,
      quiz: [{ enonce: "I<sub>b</sub> = 14 A, I<sub>z</sub> = 20 A : calibre ?", choix: ["16 A", "10 A", "25 A"], bonne: 0 }, { enonce: "I<sub>z</sub> dépend…", choix: ["De la section et du mode de pose", "Du disjoncteur", "Du cos φ"], bonne: 0 }]
    },
    {
      id: "bts1-sti-chute", titre: "Chute de tension",
      recto: "Formule simplifiée de la chute de tension en monophasé et limites réglementaires ?",
      verso: `<div class="formule">Mono : ΔU = 2·ρ·L·I<sub>b</sub>·cos φ / S</div><div class="formule">Tri (entre phases) : ΔU = √3·ρ·L·I<sub>b</sub>·cos φ / S</div>
        <p>ρ<sub>cuivre</sub> ≈ 0,0225 Ω·mm²/m (réactance négligée pour les petites sections). L en m, S en mm².</p>
        <p class="astuce">Réseau public BT : <b>3 %</b> éclairage, <b>5 %</b> autres usages.</p>`,
      quiz: [{ enonce: "En monophasé, le facteur 2 vient…", choix: ["De l'aller et du retour", "Du cos φ", "De la température"], bonne: 0 }, { enonce: "Limite pour un circuit de prises (réseau public) :", choix: ["5 %", "3 %", "10 %"], bonne: 0 }]
    }
  ]
});

// ---------- BTS 2 STI ----------
SIP.definirModule({
  id: "bts2-sti-levage",
  sequence: "Option STI · Conception",
  niveaux: ["BTS2-STI"],
  titre: "Conception : motoriser un monte-charge",
  description: "Puissance de levage, tambour et réducteur, choix et protection du moteur, freinage.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts2-sti-levage", gen: (r) => { const m = r.pas(150, 600, 50), v = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), eta = r.pick([0.7, 0.75, 0.8]); const P = m * 9.81 * v / eta; return { enonce: `Monte-charge : masse levée (cabine + charge) <b>${m} kg</b>, vitesse <b>${SIP.nb(v)} m/s</b>, rendement de la transmission <b>${SIP.nb(eta * 100)} %</b>. Puissance utile nécessaire sur l'arbre moteur (kW) ?`, reponse: P / 1000, unite: "kW", explication: `P = m·g·v / η = ${m} × 9,81 × ${SIP.nb(v)} / ${SIP.nb(eta)} = ${SIP.nb(P)} W = ${SIP.nb(P / 1000)} kW.` }; } },
    { fiche: "bts2-sti-reducteur", gen: (r) => { const v = r.pick([0.2, 0.3, 0.4, 0.5]), D = r.pick([0.15, 0.2, 0.25, 0.3]); const n = 60 * v / (Math.PI * D); return { enonce: `Le câble s'enroule sur un tambour de <b>${SIP.nb(D * 1000)} mm</b> de diamètre ; la cabine monte à <b>${SIP.nb(v)} m/s</b>. Vitesse de rotation du tambour ?`, reponse: n, unite: "tr/min", explication: `n = 60·v / (π·D) = 60 × ${SIP.nb(v)} / (π × ${SIP.nb(D)}) = ${SIP.nb(n)} tr/min.` }; } },
    { fiche: "bts2-sti-reducteur", gen: (r) => { const nm = r.pick([1440, 1455, 1740]), nt = r.pick([24, 30, 32, 38, 48]); return { enonce: `Moteur à <b>${nm} tr/min</b>, tambour à <b>${nt} tr/min</b>. Rapport de réduction k à prévoir ?`, reponse: nm / nt, unite: "", explication: `k = n<sub>moteur</sub> / n<sub>tambour</sub> = ${nm} / ${nt} = ${SIP.nb(nm / nt, 3)}.` }; } },
    { fiche: "bts2-sti-levage", gen: (r) => { const m = r.pas(150, 600, 50), D = r.pick([0.15, 0.2, 0.25, 0.3]); const C = m * 9.81 * D / 2; return { enonce: `Masse levée <b>${m} kg</b>, tambour de <b>${SIP.nb(D * 1000)} mm</b> de diamètre. Couple à fournir sur l'arbre du tambour (régime établi) ?`, reponse: C, unite: "N·m", explication: `C = m·g·r = ${m} × 9,81 × ${SIP.nb(D / 2)} = ${SIP.nb(C)} N·m.` }; } },
    { fiche: "bts2-sti-levage", gen: (r) => { const m = r.pas(200, 600, 50), h = r.pick([3, 4, 6, 8, 10, 12]); const E = m * 9.81 * h; return { enonce: `Énergie potentielle gagnée par une masse de <b>${m} kg</b> montée de <b>${h} m</b> (en kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `E = m·g·h = ${m} × 9,81 × ${h} = ${SIP.nb(E)} J = ${SIP.nb(E / 1000)} kJ.` }; } },
    { type: "qcm", fiche: "bts2-sti-levage", enonce: "Le calcul donne <b>2,6 kW</b> sur l'arbre moteur. Quelle puissance normalisée retenir ?", choix: ["3 kW", "2,2 kW", "2,6 kW (moteur sur mesure)", "7,5 kW"], bonne: 0, explication: "On retient la puissance normalisée immédiatement supérieure : … 2,2 – 3 – 4 kW …" },
    { type: "qcm", fiche: "bts2-sti-depart", enonce: "Plaque moteur : <b>I<sub>n</sub> = 6,2 A</b> sous 400 V. Réglage de la protection thermique du disjoncteur-moteur ?", choix: ["6,2 A", "7,4 A (I<sub>n</sub> + 20 %)", "12,4 A", "3,6 A"], bonne: 0, explication: "Le thermique se règle sur le courant nominal de la plaque (courant réel du moteur couplé)." },
    { type: "qcm", fiche: "bts2-sti-depart", enonce: "Catégorie d'emploi d'un contacteur commandant un moteur asynchrone à cage (démarrage, coupure moteur lancé) ?", choix: ["AC-3", "AC-1", "DC-1", "AC-15"], bonne: 0, explication: "AC-1 : charges peu inductives ; AC-3 : moteurs à cage ; AC-4 : marche par à-coups / inversion." },
    { type: "qcm", fiche: "bts2-sti-depart", enonce: "À la descente, la charge entraîne le moteur (fonctionnement en génératrice). Le variateur doit être équipé…", choix: ["D'une résistance de freinage (ou d'un module de renvoi au réseau)", "D'un filtre CEM seulement", "D'un condensateur de relèvement", "De rien de particulier"], bonne: 0, explication: "Sinon l'énergie renvoyée fait monter la tension du bus continu et le variateur se met en défaut." }
  ],
  fiches: [
    {
      id: "bts2-sti-levage", titre: "Puissance et couple d'un levage",
      recto: "Puissance à fournir pour lever une masse m à la vitesse v ? Couple au tambour ?",
      verso: `<div class="formule">P = m·g·v / η &nbsp;·&nbsp; C<sub>tambour</sub> = m·g·r &nbsp;·&nbsp; E = m·g·h</div>
        <p>On retient la puissance <b>normalisée immédiatement supérieure</b> : 0,75 · 1,1 · 1,5 · 2,2 · 3 · 4 · 5,5 · 7,5 kW…</p>
        <p class="astuce">Vérifier aussi le couple au démarrage (accélération) et la classe de service.</p>`,
      quiz: [{ enonce: "100 kg levés à 1 m/s, η = 1 : P ≈ …", choix: ["981 W", "100 W", "9,81 W"], bonne: 0 }, { enonce: "Calcul : 4,3 kW → on choisit…", choix: ["5,5 kW", "4 kW", "4,3 kW"], bonne: 0 }]
    },
    {
      id: "bts2-sti-reducteur", titre: "Tambour et réducteur",
      recto: "Vitesse de rotation d'un tambour et rapport de réduction à prévoir ?",
      verso: `<div class="formule">n<sub>tambour</sub> = 60·v / (π·D)</div><div class="formule">k = n<sub>moteur</sub> / n<sub>tambour</sub> &nbsp;·&nbsp; C<sub>moteur</sub> = C<sub>tambour</sub> / (k·η<sub>réd</sub>)</div>
        <p>v en m/s, D en m, n en tr/min.</p>`,
      quiz: [{ enonce: "k = …", choix: ["n<sub>moteur</sub> / n<sub>tambour</sub>", "n<sub>tambour</sub> / n<sub>moteur</sub>", "C<sub>moteur</sub> / C<sub>tambour</sub>"], bonne: 0 }, { enonce: "Un réducteur de rapport 30 multiplie le couple par…", choix: ["30 × η", "30 / η", "1/30"], bonne: 0 }]
    },
    {
      id: "bts2-sti-depart", titre: "Départ moteur d'un levage",
      recto: "Quels sont les éléments d'un départ moteur et comment régler la protection ?",
      verso: `<ul><li><b>Sectionnement</b> (coupure pleinement apparente, cadenassable)</li>
        <li><b>Protection court-circuit</b> (magnétique) + <b>surcharge</b> (thermique réglé à <b>I<sub>n</sub> plaque</b>)</li>
        <li><b>Commutation</b> : contacteur <b>AC-3</b> ou variateur</li></ul>
        <p class="astuce">Levage : charge entraînante → <b>résistance de freinage</b> sur le variateur + frein à manque de courant.</p>`,
      quiz: [{ enonce: "Le relais thermique se règle sur…", choix: ["I<sub>n</sub> de la plaque", "2 × I<sub>n</sub>", "Le calibre du fusible"], bonne: 0 }, { enonce: "Contacteur pour moteur à cage :", choix: ["AC-3", "AC-1", "DC-1"], bonne: 0 }]
    }
  ]
});
