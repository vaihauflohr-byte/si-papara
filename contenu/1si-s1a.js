/* ===================== 1re SI — Séquence 1 (partie A) =====================
   Les nouvelles mobilités individuelles :
   1.1 Analyse du besoin / SysML · 1.2 Chaîne de puissance · 1.4 Énergies et puissances
   Systèmes du cours : Segway, radio-réveil, agrafeuse électrique, voiture radiocommandée,
   vélo d'entraînement, skateboard électrique, chaudières / poêle à granulés. */
(function () {
  const nb = SIP.nb;
  const g = 9.81;
  const PI = Math.PI;
  const brut = (h) => String(h).replace(/<[^>]+>/g, "");

  // QCM : bonne réponse + distracteurs obligatoires + distracteurs tirés dans un réservoir (sans doublon)
  const qcm = (r, enonce, bonne, reservoir, explication, obligatoires) => {
    const vus = new Set([brut(bonne)]);
    const autres = [];
    const ajoute = (c) => { const k = brut(c); if (autres.length < 3 && !vus.has(k)) { vus.add(k); autres.push(c); } };
    (obligatoires || []).forEach(ajoute);
    r.melange(reservoir).forEach(ajoute);
    return { type: "qcm", enonce, choix: [bonne].concat(autres), bonne: 0, explication };
  };

  /* =====================================================================
     MODULE 1 — Analyse du besoin et SysML
     ===================================================================== */
  const D = {
    REQ: "Diagramme des exigences (REQ)",
    UC: "Diagramme des cas d'utilisation (UC)",
    SD: "Diagramme de séquence (SD)",
    STM: "Diagramme d'états (STM)",
    BDD: "Diagramme de définition de blocs (BDD)",
    IBD: "Diagramme de bloc interne (IBD)"
  };
  const D_ROLE = {
    REQ: "Le diagramme des exigences (REQ) regroupe ce que le système doit faire ou respecter (« Le système doit… ») et les blocs qui satisfont chaque exigence.",
    UC: "Le diagramme des cas d'utilisation (UC) énumère les services rendus par le système et les acteurs qui interagissent avec lui.",
    SD: "Le diagramme de séquence (SD) montre, pour un cas d'utilisation, les messages échangés entre l'acteur et le système, dans l'ordre chronologique (de haut en bas).",
    STM: "Le diagramme d'états (STM) montre les états du système et les événements (avec conditions) qui déclenchent les transitions.",
    BDD: "Le diagramme de définition de blocs (BDD) décompose le système en blocs, sous forme arborescente, avec un nom unique pour chaque partie.",
    IBD: "Le diagramme de bloc interne (IBD) montre les parties d'un bloc, leurs ports et les flux (matière, énergie, information) qui circulent entre elles."
  };
  const CAS_DIAG = [
    ["lister les services rendus par une trottinette électrique et les acteurs concernés", "UC"],
    ["traduire le cahier des charges : « la trottinette doit avoir une autonomie d'au moins 25 km »", "REQ"],
    ["montrer dans l'ordre les messages échangés entre l'usager et une trottinette en libre-service lors du déverrouillage", "SD"],
    ["décrire les modes « Veille », « Roulage » et « Charge » d'une trottinette et ce qui fait passer de l'un à l'autre", "STM"],
    ["représenter que le Segway est composé de batteries, d'un calculateur, d'un gyromètre et d'un groupe propulseur", "BDD"],
    ["montrer que la batterie envoie l'énergie électrique au variateur par un port, puis le variateur au moteur", "IBD"],
    ["indiquer que le bloc « Batteries » satisfait l'exigence « Stocker et restituer l'énergie »", "REQ"],
    ["décrire le passage de « Radio OFF » à « Radio ON » du radio-réveil quand l'événement power_ON survient", "STM"],
    ["montrer que l'utilisateur envoie radio_AUTO() au radio-réveil, qui répond « affichage alarme ON »", "SD"],
    ["montrer que l'utilisateur et le voleur interagissent avec le Segway", "UC"],
    ["donner un nom unique à chaque partie du radio-réveil (Réveil, Radio, Pile, Afficheur…)", "BDD"],
    ["montrer que l'horloge transmet l'horodatage à l'afficheur et au projecteur du radio-réveil", "IBD"],
    ["remplacer le cahier des charges fonctionnel par un modèle graphique", "REQ"],
    ["décrire le fonctionnement séquentiel d'un système sous forme d'un programme graphique", "STM"],
    ["préciser que le service « Être sécurisé » est inclus dans « Déplacer sans effort »", "UC"]
  ];
  const SIGLES = [
    ["diagramme des exigences", "REQ"], ["diagramme des cas d'utilisation", "UC"], ["diagramme de séquence", "SD"],
    ["diagramme d'états", "STM"], ["diagramme de définition de blocs", "BDD"], ["diagramme de bloc interne", "IBD"]
  ];
  const ACT = {
    P: "Un acteur principal (à gauche du cadre)",
    S: "Un acteur secondaire (à droite du cadre)",
    B: "Pas un acteur : une partie (bloc) du système",
    C: "Pas un acteur : un cas d'utilisation"
  };
  const ACT_EXPL = {
    P: "Il bénéficie du service rendu : c'est un acteur principal, placé à gauche du cadre.",
    S: "Il est extérieur au système et intervient sans en être le bénéficiaire : acteur secondaire, placé à droite (rectangle s'il n'est pas humain).",
    B: "C'est un constituant interne du système : il apparaît dans le BDD ou l'IBD, pas comme acteur.",
    C: "C'est un service rendu (verbe à l'infinitif dans une ellipse) : un cas d'utilisation, pas un acteur."
  };
  const CAS_ACT = [
    ["du Segway", "l'utilisateur", "P"], ["du Segway", "la route", "S"], ["du Segway", "le voleur", "S"],
    ["du Segway", "le gyromètre", "B"], ["du Segway", "« Recharger le système »", "C"],
    ["du radio-réveil", "le dormeur qui veut être réveillé", "P"], ["du radio-réveil", "la station de radio FM", "S"],
    ["du radio-réveil", "l'afficheur", "B"], ["du radio-réveil", "« Régler l'heure d'alarme »", "C"],
    ["de la trottinette électrique", "l'usager", "P"], ["de la trottinette électrique", "la prise de courant du réseau", "S"],
    ["de la trottinette électrique", "le moteur-roue", "B"], ["de la trottinette électrique", "« Se déplacer en ville »", "C"]
  ];
  const REL_UC = {
    INC: "Relation «include» (toujours réalisé avec)",
    EXT: "Relation «extend» (ajout facultatif, sous condition)",
    GEN: "Généralisation (cas particulier de…)",
    ASSO: "Association (simple trait acteur – cas)"
  };
  const REL_UC_EXPL = {
    INC: "«include» : le cas inclus est réalisé à chaque fois que le cas de base l'est.",
    EXT: "«extend» : le cas d'extension ne s'ajoute que dans certaines conditions.",
    GEN: "Généralisation : un acteur (ou un cas) est un cas particulier d'un autre ; flèche à triangle creux.",
    ASSO: "Association : un simple trait indique qu'un acteur participe à un cas d'utilisation."
  };
  const CAS_REL_UC = [
    ["« Être sécurisé » est réalisé à chaque fois que « Déplacer sans effort » l'est (Segway).", "INC"],
    ["« Utilisateur administrateur » est un cas particulier d'« Utilisateur » (Segway).", "GEN"],
    ["L'utilisateur participe au cas « Recharger le système ».", "ASSO"],
    ["« Allumer l'éclairage » s'ajoute à « Se déplacer » uniquement la nuit.", "EXT"],
    ["« Payer la location » fait obligatoirement partie de « Louer une trottinette ».", "INC"],
    ["« Cycliste » et « Livreur » sont deux sortes d'« Usager ».", "GEN"],
    ["« Signaler une batterie faible » ne se produit que si la charge passe sous 10 % pendant « Se déplacer ».", "EXT"],
    ["Le voleur est relié au cas « Être sécurisé ».", "ASSO"]
  ];
  const REL_REQ = {
    SAT: "«satisfy» (un bloc satisfait l'exigence)",
    CONT: "Contenance ⊕ (décomposition en sous-exigences)",
    VER: "«verify» (un test vérifie l'exigence)",
    DER: "«deriveReqt» (exigence déduite d'une autre)",
    REF: "«refine» (l'exigence est précisée)"
  };
  const REL_REQ_EXPL = {
    SAT: "Un bloc (composant) qui réalise une exigence y est relié par «satisfy».",
    CONT: "Le symbole ⊕ (contenance) décompose une exigence en sous-exigences (1 → 1.1, 1.2, 1.3).",
    VER: "Un essai ou un test qui contrôle une exigence y est relié par «verify».",
    DER: "Une exigence qui découle d'une autre (conséquence technique) est reliée par «deriveReqt».",
    REF: "Une formulation plus précise (chiffrée) d'une exigence y est reliée par «refine»."
  };
  const CAS_REL_REQ = [
    ["Le bloc « Batteries » réalise l'exigence « Stocker et restituer l'énergie ».", "SAT"],
    ["Le gyromètre et le calculateur réalisent l'exigence « Auto-équilibre ».", "SAT"],
    ["L'exigence 1 « Déplacer sans effort » est découpée en 1.1 « Consigne vitesse », 1.2 « Consigne direction » et 1.3 « Auto-équilibre ».", "CONT"],
    ["L'exigence 1.4 « Réglage sensibilité » fait partie de l'exigence 1 « Déplacer sans effort ».", "CONT"],
    ["Un essai sur piste contrôle que la vitesse ne dépasse pas 20 km/h.", "VER"],
    ["Un test de roulage mesure l'autonomie réelle pour la comparer à l'exigence.", "VER"],
    ["L'exigence « Être transportable à la main » entraîne une nouvelle exigence « Masse inférieure à 12 kg ».", "DER"],
    ["L'exigence « Autonomie élevée » est précisée en « Autonomie ≥ 25 km à 20 km/h ».", "REF"]
  ];
  const NAT = {
    EX: "Une exigence (diagramme REQ)",
    CU: "Un cas d'utilisation (diagramme UC)",
    ET: "Un état (diagramme STM)",
    BL: "Un bloc (diagramme BDD)"
  };
  const NAT_EXPL = {
    EX: "C'est une capacité ou une contrainte à respecter, souvent chiffrée (« Le système doit… ») : une exigence.",
    CU: "C'est un service rendu, exprimé par un verbe à l'infinitif : un cas d'utilisation.",
    ET: "C'est une situation dans laquelle le système se trouve pendant un moment : un état.",
    BL: "C'est une partie matérielle du système : un bloc."
  };
  const CAS_NAT = [
    ["« La vitesse maximale ne doit pas dépasser 25 km/h »", "EX"],
    ["« Se déplacer sans effort »", "CU"],
    ["« L'autonomie doit être d'au moins 20 km »", "EX"],
    ["« Recharger le système »", "CU"],
    ["« Le Segway doit rester équilibré »", "EX"],
    ["« Régler les paramètres »", "CU"],
    ["« La masse doit être inférieure à 15 kg »", "EX"],
    ["« Écouter la radio »", "CU"],
    ["« Radio ON »", "ET"],
    ["« Veille » (trottinette immobile, écran éteint)", "ET"],
    ["« Gyromètre »", "BL"],
    ["« Groupe propulseur »", "BL"],
    ["« Le réveil doit sonner à l'heure d'alarme à 1 minute près »", "EX"]
  ];
  const REL_BDD = {
    COMP: "Composition (losange plein)",
    AGR: "Agrégation (losange vide)",
    GEN: "Généralisation (flèche à triangle creux)",
    SAT: "Relation «satisfy»"
  };
  const REL_BDD_EXPL = {
    COMP: "Composition (losange plein) : la partie fait partie intégrante du tout et n'existe pas sans lui.",
    AGR: "Agrégation (losange vide) : la partie appartient au tout mais peut exister ou être utilisée séparément.",
    GEN: "Généralisation : « est une sorte de » ; flèche à triangle creux vers le bloc général.",
    SAT: "«satisfy» relie un bloc à une exigence, pas deux blocs entre eux."
  };
  const CAS_BDD = [
    ["Le radio-réveil contient une Radio qui n'a pas d'existence en dehors de lui.", "COMP"],
    ["La pile du radio-réveil peut être retirée et utilisée dans un autre appareil.", "AGR"],
    ["« Moteur brushless » et « Moteur à courant continu » sont des sortes de « Moteur ».", "GEN"],
    ["Le Réveil est constitué d'un Afficheur, d'une Horloge et d'un Projecteur intégrés.", "COMP"],
    ["La batterie amovible d'une trottinette peut être rechargée à part, hors de la trottinette.", "AGR"],
    ["Le cadre fait partie intégrante de la trottinette.", "COMP"],
    ["« Vérin simple effet » et « Vérin double effet » sont deux types de « Vérin ».", "GEN"]
  ];
  const FLUX = { MAT: "Matière", EL: "Énergie électrique", ME: "Énergie mécanique", TH: "Énergie thermique", INFO: "Information" };
  const CAS_FLUX = [
    ["le courant fourni par la batterie au variateur du Segway", "EL"],
    ["la consigne de vitesse envoyée par le calculateur au variateur", "INFO"],
    ["la mesure d'inclinaison envoyée par le gyromètre au calculateur", "INFO"],
    ["le couple transmis par le réducteur à la roue", "ME"],
    ["les granulés de bois amenés vers le foyer d'un poêle", "MAT"],
    ["la chaleur rejetée par le poêle à granulés dans la pièce", "TH"],
    ["le signal HF reçu par l'antenne du radio-réveil", "INFO"],
    ["l'horodatage transmis par l'horloge à l'afficheur", "INFO"],
    ["les feuilles de papier introduites dans l'agrafeuse", "MAT"],
    ["la rotation de l'arbre moteur vers le train d'engrenages de l'agrafeuse", "ME"],
    ["la tension de 5 V fournie par les piles à la carte électronique de l'agrafeuse", "EL"],
    ["l'eau aspirée par la pompe de filtration d'une piscine", "MAT"],
    ["l'ordre « marche » donné par l'appui sur un bouton", "INFO"]
  ];
  const STM = { ETAT: "Un état", EVT: "Un événement", COND: "Une condition (garde)", ACT: "Une action (do / …)", TRANS: "Une transition" };
  const STM_EXPL = {
    ETAT: "Un état est une situation durable du système (rectangle arrondi).",
    EVT: "Un événement est ce qui se produit et déclenche une transition (ex. appui sur un bouton).",
    COND: "Une condition, écrite entre crochets [ ], doit être vraie pour que la transition soit franchie.",
    ACT: "« do / … » décrit l'action exécutée tant que le système est dans l'état.",
    TRANS: "Une transition est la flèche qui fait passer d'un état à un autre."
  };
  const CAS_STM = [
    ["« Radio ON »", "ETAT"], ["« Radio AUTO »", "ETAT"], ["« power_ON »", "EVT"], ["« power_OFF »", "EVT"],
    ["« do / émettre son » dans l'état Radio ON", "ACT"], ["« [Hcourante = Halarme] »", "COND"],
    ["la flèche qui va de « Radio OFF » à « Radio ON »", "TRANS"],
    ["« Roulage » (trottinette)", "ETAT"], ["« appui long sur le bouton ON » (trottinette)", "EVT"],
    ["« [batterie > 10 %] » (trottinette)", "COND"], ["« do / allumer le feu arrière » (trottinette)", "ACT"]
  ];
  const SCEN = [
    ["réveil programmé du radio-réveil", ["L'utilisateur envoie radio_AUTO()", "Le radio-réveil affiche « alarme ON »", "Le radio-réveil détecte Hcourante = Halarme", "Le radio-réveil émet le son de la radio"]],
    ["location d'une trottinette en libre-service", ["L'usager scanne le QR code", "Le système vérifie le compte de l'usager", "Le système déverrouille la trottinette", "L'usager démarre et roule"]],
    ["démarrage du Segway", ["L'utilisateur allume le Segway", "Le Segway se met en équilibre", "L'utilisateur se penche vers l'avant", "Le Segway avance"]],
    ["recharge de la trottinette", ["L'usager branche le chargeur", "La trottinette affiche « charge en cours »", "La batterie atteint 100 %", "La trottinette affiche « charge terminée »"]]
  ];
  const BAC = {
    QUI: "À qui rend-il service ?",
    QUOI: "Sur quoi agit-il ?",
    BUT: "Dans quel but ?",
    COMM: "Comment fonctionne-t-il ?"
  };
  const CAS_BAC = [
    ["d'une agrafeuse électrique", "l'utilisateur (employé de bureau)", "QUI"],
    ["d'une agrafeuse électrique", "les feuilles de papier", "QUOI"],
    ["d'une agrafeuse électrique", "assembler des feuilles avec une agrafe", "BUT"],
    ["d'un poêle à granulés", "les occupants de la maison", "QUI"],
    ["d'un poêle à granulés", "l'air de la pièce", "QUOI"],
    ["d'un poêle à granulés", "chauffer la pièce", "BUT"],
    ["d'un lave-linge", "le linge", "QUOI"],
    ["d'un lave-linge", "laver le linge", "BUT"],
    ["d'une pompe de piscine", "le propriétaire de la piscine", "QUI"],
    ["d'une pompe de piscine", "l'eau de la piscine", "QUOI"],
    ["d'un Segway", "se déplacer sans effort", "BUT"],
    ["d'une imprimante 3D", "le filament de plastique", "QUOI"]
  ];
  const SATISF = [
    ["du Segway", ["Batteries", "Gyromètre", "Codeurs incrémentaux", "Groupe propulseur", "Calculateur"],
      [["Stocker et restituer l'énergie", 0], ["Mesurer l'inclinaison de la plateforme", 1], ["Mesurer la rotation des roues", 2], ["Mettre les roues en mouvement", 3], ["Régler la sensibilité selon la compétence de l'utilisateur", 4]]],
    ["du radio-réveil", ["Afficheur", "Horloge", "Projecteur", "Radio", "Pile"],
      [["Afficher l'heure courante", 0], ["Compter le temps (horodatage)", 1], ["Projeter l'heure au plafond", 2], ["Recevoir les stations FM", 3], ["Conserver l'heure pendant une coupure de courant", 4]]]
  ];

  SIP.definirModule({
    id: "1si-s1-sysml",
    niveaux: ["1SI"],
    sequence: "S1 · Chaîne de puissance",
    titre: "Analyse du besoin et SysML",
    description: "Choisir et lire les diagrammes SysML (exigences, cas d'utilisation, séquence, états, blocs) pour décrire un système.",
    competences: ["A1", "M4", "M6", "C3"],
    nbQuestions: 10,
    questions: [
      // ---- Les 6 diagrammes ----
      { fiche: "1si-s1-sysml-diag", gen: (r) => { const [t, k] = r.pick(CAS_DIAG); return qcm(r, `Quel diagramme SysML faut-il utiliser pour <b>${t}</b> ?`, D[k], Object.values(D), D_ROLE[k]); } },
      { fiche: "1si-s1-sysml-diag", gen: (r) => { const [nom, s] = r.pick(SIGLES); return { type: "texte", enonce: `Donne le sigle SysML (2 ou 3 lettres) du <b>${nom}</b>.`, reponses: [s], explication: `${D[s]}. ${D_ROLE[s]}` }; } },
      { fiche: "1si-s1-sysml-diag", gen: (r) => {
          const struct = r.int(0, 1) === 1;
          const k = r.pick(struct ? ["BDD", "IBD"] : ["UC", "SD", "STM"]);
          const faux = (struct ? ["UC", "SD", "STM", "REQ"] : ["BDD", "IBD", "REQ"]).map((x) => D[x]);
          return qcm(r, `Lequel de ces diagrammes est un diagramme <b>${struct ? "structurel" : "comportemental"}</b> ?`, D[k], faux, "Structurels : BDD et IBD (de quoi le système est fait). Comportementaux : UC, SD et STM (ce qu'il fait, comment il réagit). Le diagramme des exigences (REQ) est à part."); } },
      { type: "qcm", fiche: "1si-s1-sysml-diag", enonce: "Pourquoi utilise-t-on le langage SysML ?", choix: ["Pour décrire un système pluritechnique avec un langage graphique compris par tous les métiers", "Pour programmer le microcontrôleur du système", "Pour calculer les puissances de la chaîne d'énergie", "Pour dessiner les pièces en 3D avant fabrication"], bonne: 0, explication: "SysML est un langage de modélisation graphique : mécaniciens, électroniciens, informaticiens, SAV… partagent la même description du système." },
      { type: "qcm", fiche: "1si-s1-sysml-diag", enonce: "Laquelle de ces affirmations est <b>vraie</b> ?", choix: ["Un cas d'utilisation décrit un service rendu, pas la façon d'utiliser le système", "Le BDD montre l'ordre chronologique des échanges", "Le diagramme d'états montre les flux de matière entre les blocs", "Le diagramme de séquence décompose le système en blocs"], bonne: 0, explication: "Les cas d'utilisation, écrits à l'affirmatif, ne décrivent pas la façon d'utiliser le système. L'ordre chronologique, c'est le SD ; les flux, l'IBD ; la décomposition, le BDD." },
      // ---- Besoin et cas d'utilisation ----
      { fiche: "1si-s1-sysml-besoin", gen: (r) => { const [s, el, k] = r.pick(CAS_ACT); return qcm(r, `Dans le diagramme des cas d'utilisation ${s}, <b>${el}</b> est…`, ACT[k], Object.values(ACT), ACT_EXPL[k]); } },
      { fiche: "1si-s1-sysml-besoin", gen: (r) => { const [t, k] = r.pick(CAS_REL_UC); return qcm(r, `Diagramme des cas d'utilisation : ${t} Quelle relation utiliser ?`, REL_UC[k], Object.values(REL_UC), REL_UC_EXPL[k]); } },
      { fiche: "1si-s1-sysml-besoin", gen: (r) => { const [s, el, k] = r.pick(CAS_BAC); return qcm(r, `Bête à cornes ${s} : « <b>${el}</b> » répond à la question…`, BAC[k], Object.values(BAC), "Bête à cornes : À qui rend-il service ? (l'utilisateur) — Sur quoi agit-il ? (la matière d'œuvre) — Dans quel but ? (le besoin). Elle ne dit jamais comment il fonctionne."); } },
      { type: "qcm", fiche: "1si-s1-sysml-besoin", enonce: "Dans un diagramme des cas d'utilisation, un cas d'utilisation s'écrit…", choix: ["Dans une ellipse, avec un verbe à l'infinitif (+ complément)", "Dans un rectangle, avec un nom commun", "Sous la forme « Le système doit… »", "Avec une valeur chiffrée et son unité"], bonne: 0, explication: "Ellipse + verbe à l'infinitif (ex. « Déplacer sans effort »). « Le système doit… » et les valeurs chiffrées, ce sont des exigences." },
      { type: "qcm", fiche: "1si-s1-sysml-besoin", enonce: "Dans un diagramme des cas d'utilisation, où place-t-on les acteurs principaux ?", choix: ["À gauche du cadre du système", "À droite du cadre du système", "À l'intérieur du cadre", "Sous le cadre, reliés par des ports"], bonne: 0, explication: "Acteurs principaux à gauche, acteurs secondaires à droite, services (ellipses) dans le cadre." },
      { type: "qcm", fiche: "1si-s1-sysml-besoin", enonce: "Dans le diagramme des cas d'utilisation du Segway, la route (acteur non humain) est représentée par…", choix: ["Un rectangle", "Un bonhomme", "Une ellipse", "Un losange"], bonne: 0, explication: "Un acteur humain est un bonhomme ; un acteur non humain est représenté par un rectangle." },
      { type: "qcm", fiche: "1si-s1-sysml-besoin", enonce: "La bête à cornes pose trois questions. Laquelle n'en fait <b>pas</b> partie ?", choix: ["Comment fonctionne-t-il ?", "À qui rend-il service ?", "Sur quoi agit-il ?", "Dans quel but ?"], bonne: 0, explication: "L'analyse du besoin ne s'intéresse pas aux solutions techniques : on cherche à qui, sur quoi et dans quel but." },
      { type: "qcm", fiche: "1si-s1-sysml-besoin", enonce: "Le diagramme de contexte d'un système permet de…", choix: ["Repérer tous les éléments extérieurs (acteurs, milieu) en relation avec le système", "Décrire les états successifs du système", "Décomposer le système en sous-ensembles", "Donner l'ordre chronologique des messages"], bonne: 0, explication: "Le contexte place le système au centre et liste son environnement : utilisateurs, autres systèmes, milieu (route, air, eau…)." },
      // ---- Exigences ----
      { fiche: "1si-s1-sysml-req", gen: (r) => {
          const [t, k] = r.pick(CAS_REL_REQ);
          const quatrieme = k === "DER" || k === "REF" ? k : r.pick(["DER", "REF"]);
          const ch = ["SAT", "CONT", "VER", quatrieme].filter((x) => x !== k).map((x) => REL_REQ[x]);
          return qcm(r, `Diagramme des exigences : ${t} Quelle relation SysML utiliser ?`, REL_REQ[k], ch, REL_REQ_EXPL[k]); } },
      { fiche: "1si-s1-sysml-req", gen: (r) => { const [t, k] = r.pick(CAS_NAT); return qcm(r, `Dans un modèle SysML, ${t} est plutôt…`, NAT[k], Object.values(NAT), NAT_EXPL[k]); } },
      { fiche: "1si-s1-sysml-req", gen: (r) => {
          const [s, blocs, ex] = r.pick(SATISF); const [e, i] = r.pick(ex);
          return qcm(r, `Diagramme des exigences ${s} : quel bloc est relié par «satisfy» à l'exigence <b>« ${e} »</b> ?`, blocs[i], blocs, `C'est le bloc « ${blocs[i]} » qui réalise cette exigence : il la satisfait.`); } },
      { type: "qcm", fiche: "1si-s1-sysml-req", enonce: "Le texte d'une exigence commence en général par…", choix: ["« Le système doit… »", "Un verbe à l'infinitif seul", "« Si… alors… »", "« L'utilisateur aimerait… »"], bonne: 0, explication: "Une exigence exprime une capacité ou une contrainte : « Le système doit… ». Le verbe à l'infinitif seul, c'est un cas d'utilisation." },
      { type: "qcm", fiche: "1si-s1-sysml-req", enonce: "Le diagramme des exigences se substitue…", choix: ["Au cahier des charges fonctionnel", "Au dossier de fabrication", "À la notice d'utilisation", "Au schéma électrique"], bonne: 0, explication: "Il décrit les exigences du cahier des charges fonctionnel : il le remplace." },
      { type: "qcm", fiche: "1si-s1-sysml-req", enonce: "Dans un bloc «requirement», on trouve…", choix: ["Un identifiant (Id) et un texte", "Des ports et des flux", "Des états et des transitions", "Des lignes de vie et des messages"], bonne: 0, explication: "Ex. Segway : Id = \"1.3\", Text = \"Le SegWay doit rester équilibré\"." },
      { type: "qcm", fiche: "1si-s1-sysml-req", enonce: "Dans le diagramme des exigences du Segway, l'exigence d'Id 1.2 « Consigne direction » est…", choix: ["Une sous-exigence de l'exigence 1 « Déplacer sans effort »", "Un cas d'utilisation du Segway", "Un bloc qui satisfait l'exigence 1", "Le test qui vérifie l'exigence 1"], bonne: 0, explication: "La numérotation 1.1, 1.2, 1.3 et le symbole ⊕ (contenance) indiquent la décomposition de l'exigence 1." },
      // ---- BDD / IBD ----
      { fiche: "1si-s1-sysml-bloc", gen: (r) => { const [t, k] = r.pick(CAS_BDD); return qcm(r, `Diagramme de définition de blocs : ${t} Quelle relation utiliser ?`, REL_BDD[k], Object.values(REL_BDD), REL_BDD_EXPL[k]); } },
      { fiche: "1si-s1-sysml-bloc", gen: (r) => { const [t, k] = r.pick(CAS_FLUX); return qcm(r, `Dans un diagramme de bloc interne, quelle est la nature du flux : <b>${t}</b> ?`, FLUX[k], Object.values(FLUX), `Un port laisse passer de la matière, de l'énergie ou de l'information (MEI). Ici : ${FLUX[k].toLowerCase()}.`); } },
      { type: "qcm", fiche: "1si-s1-sysml-bloc", enonce: "Dans un IBD, un port (petit carré sur le bord d'un bloc) représente…", choix: ["Ce qui entre ou sort du bloc : matière, énergie ou information", "Une exigence satisfaite par le bloc", "Un état du bloc", "Une sous-partie du bloc"], bonne: 0, explication: "Le port représente ce qui peut circuler en entrée et/ou en sortie d'un bloc (Matière, Énergie, Information)." },
      { type: "qcm", fiche: "1si-s1-sysml-bloc", enonce: "Le diagramme de définition de blocs (BDD) décrit l'architecture du système sous forme…", choix: ["Arborescente (le tout et ses parties)", "Chronologique (de haut en bas)", "D'états et de transitions", "De liste d'exigences"], bonne: 0, explication: "Le BDD donne un nom unique à chaque partie et la range dans une arborescence de blocs." },
      { type: "qcm", fiche: "1si-s1-sysml-bloc", enonce: "Le diagramme de bloc interne (IBD) décrit la structure interne d'un bloc en termes de…", choix: ["Parties, ports et connecteurs", "Acteurs et cas d'utilisation", "États, événements et conditions", "Exigences et identifiants"], bonne: 0, explication: "IBD : les parties du bloc, leurs ports et les connecteurs qui les relient (flux MEI)." },
      // ---- SD / STM ----
      { fiche: "1si-s1-sysml-comport", gen: (r) => { const [t, k] = r.pick(CAS_STM); return qcm(r, `Dans un diagramme d'états, ${t} est…`, STM[k], Object.values(STM), STM_EXPL[k]); } },
      { fiche: "1si-s1-sysml-comport", gen: (r) => {
          const [nom, m] = r.pick(SCEN); const mode = r.int(0, 2);
          let q, bonne;
          if (mode === 0) { q = "tout en haut (premier message)"; bonne = m[0]; }
          else if (mode === 1) { q = "tout en bas (dernier message)"; bonne = m[3]; }
          else { const i = r.int(0, 2); q = `juste sous « ${m[i]} »`; bonne = m[i + 1]; }
          return { type: "qcm", enonce: `Diagramme de séquence « ${nom} ». Quel message est placé <b>${q}</b> ?`, choix: [bonne].concat(m.filter((x) => x !== bonne)), bonne: 0, explication: `Dans un SD, le temps s'écoule de haut en bas : ${m.map((x, j) => (j + 1) + ") " + x).join(" ; ")}.` }; } },
      { type: "qcm", fiche: "1si-s1-sysml-comport", enonce: "Dans un diagramme de séquence « système », le système est vu comme…", choix: ["Une boîte noire", "Un ensemble de blocs internes détaillés", "Un acteur secondaire", "Un état"], bonne: 0, explication: "Le SD système montre les actions de l'acteur principal et les réponses du système, sans regarder à l'intérieur (boîte noire)." },
      { type: "qcm", fiche: "1si-s1-sysml-comport", enonce: "Dans un diagramme d'états, une transition est franchie quand…", choix: ["L'événement arrive et la condition associée est vraie", "L'événement arrive, même si la condition est fausse", "La condition est fausse", "Le diagramme de séquence est terminé"], bonne: 0, explication: "Une condition est une expression booléenne qui doit être vraie lorsque l'événement arrive pour que la transition soit déclenchée." },
      { type: "qcm", fiche: "1si-s1-sysml-comport", enonce: "Dans un diagramme de séquence, l'ordre chronologique se lit…", choix: ["De haut en bas", "De bas en haut", "De gauche à droite", "De droite à gauche"], bonne: 0, explication: "Les lignes de vie sont verticales et le temps s'écoule vers le bas." },
      { type: "qcm", fiche: "1si-s1-sysml-comport", enonce: "Dans l'état « Radio ON » du radio-réveil, l'inscription « do / émettre son » signifie…", choix: ["Tant que le système est dans cet état, il émet le son", "Le son est émis seulement en quittant l'état", "C'est l'événement qui fait entrer dans l'état", "C'est une exigence du cahier des charges"], bonne: 0, explication: "« do / » introduit l'action exécutée pendant toute la durée de l'état." }
    ],
    fiches: [
      { id: "1si-s1-sysml-diag", titre: "Les 6 diagrammes SysML",
        recto: "Quels sont les 6 diagrammes SysML du cours, leur sigle et leur famille ?",
        verso: `<div class="formule">REQ · UC · SD · STM · BDD · IBD</div><ul><li><b>Exigences</b> : REQ — ce que le système doit faire (remplace le cahier des charges)</li><li><b>Comportementaux</b> : UC (services rendus), SD (messages dans l'ordre chronologique), STM (états et transitions)</li><li><b>Structurels</b> : BDD (arborescence des blocs), IBD (parties, ports, flux)</li></ul><p class="astuce">Structure = de quoi il est fait ; comportement = ce qu'il fait et comment il réagit.</p>`,
        quiz: [
          { enonce: "Le diagramme qui montre les états du système :", choix: ["STM", "SD", "IBD"], bonne: 0 },
          { enonce: "Le BDD est un diagramme…", choix: ["structurel", "comportemental", "d'exigences"], bonne: 0 },
          { enonce: "SysML sert à…", choix: ["décrire un système avec un langage graphique commun", "programmer un microcontrôleur", "calculer une puissance"], bonne: 0 }
        ] },
      { id: "1si-s1-sysml-besoin", titre: "Besoin et cas d'utilisation",
        recto: "Comment exprimer le besoin et lire un diagramme des cas d'utilisation ?",
        verso: `<div class="formule">Bête à cornes : À qui ? · Sur quoi ? · Dans quel but ?</div><ul><li><b>Contexte</b> : le système et tout son environnement</li><li><b>UC</b> : cadre = système ; ellipse = service, <b>verbe à l'infinitif</b></li><li>Acteurs <b>principaux à gauche</b>, <b>secondaires à droite</b> ; non humain = rectangle</li><li>«include» (toujours), «extend» (parfois), généralisation (cas particulier)</li></ul><p class="astuce">Un cas d'utilisation dit QUEL service est rendu, jamais COMMENT.</p>`,
        quiz: [
          { enonce: "Un cas d'utilisation s'écrit avec…", choix: ["un verbe à l'infinitif dans une ellipse", "« Le système doit… »", "un nom dans un rectangle"], bonne: 0 },
          { enonce: "Pour le Segway, la route est un acteur…", choix: ["secondaire", "principal", "interne"], bonne: 0 },
          { enonce: "« Sur quoi agit-il ? » désigne…", choix: ["la matière d'œuvre", "l'utilisateur", "le but"], bonne: 0 }
        ] },
      { id: "1si-s1-sysml-req", titre: "Diagramme des exigences (REQ)",
        recto: "Qu'est-ce qu'une exigence et quelles relations trouve-t-on dans un diagramme REQ ?",
        verso: `<div class="formule">«requirement» : Id + Text « Le système doit… »</div><ul><li>Exigence = <b>capacité</b> ou <b>contrainte</b> ; le REQ remplace le cahier des charges</li><li><b>⊕ contenance</b> : décompose (1 → 1.1, 1.2…)</li><li><b>«satisfy»</b> : un bloc la réalise ; <b>«verify»</b> : un test la contrôle</li><li><b>«refine»</b> : la précise ; <b>«deriveReqt»</b> : exigence déduite</li></ul><p class="astuce">Exigence = souvent chiffrée (≤ 25 km/h) ; cas d'utilisation = un service.</p>`,
        quiz: [
          { enonce: "« Batteries » est relié à « Stocker l'énergie » par…", choix: ["«satisfy»", "«verify»", "⊕"], bonne: 0 },
          { enonce: "Le diagramme des exigences remplace…", choix: ["le cahier des charges", "la notice", "le schéma électrique"], bonne: 0 },
          { enonce: "« La masse doit être inférieure à 12 kg » est…", choix: ["une exigence", "un cas d'utilisation", "un état"], bonne: 0 }
        ] },
      { id: "1si-s1-sysml-bloc", titre: "BDD et IBD : la structure",
        recto: "Que montrent le BDD et l'IBD, et que circule-t-il par un port ?",
        verso: `<ul><li><b>BDD</b> : arborescence des blocs, un nom unique par partie. <b>Composition</b> (losange plein) : partie intégrée ; <b>agrégation</b> (losange vide) : partie amovible (pile)</li><li><b>IBD</b> : parties d'un bloc, <b>ports</b> (petits carrés) et <b>connecteurs</b></li></ul><div class="formule">Port : Matière · Énergie · Information (MEI)</div><p class="astuce">BDD = « de quoi c'est fait » ; IBD = « qui échange quoi avec qui ».</p>`,
        quiz: [
          { enonce: "Un losange vide (agrégation) signifie…", choix: ["la partie peut exister hors du tout", "la partie est intégrée au tout", "la partie est un cas particulier"], bonne: 0 },
          { enonce: "Par un port circule…", choix: ["matière, énergie ou information", "un état", "une exigence"], bonne: 0 }
        ] },
      { id: "1si-s1-sysml-comport", titre: "Séquence (SD) et états (STM)",
        recto: "Que décrivent le diagramme de séquence et le diagramme d'états ?",
        verso: `<ul><li><b>SD</b> : pour un cas d'utilisation, messages entre l'acteur principal et le système (<b>boîte noire</b>) ; le temps s'écoule <b>vers le bas</b></li><li><b>STM</b> : <b>états</b> (Radio OFF, Radio ON…) reliés par des <b>transitions</b></li></ul><div class="formule">transition : événement [condition]</div><p class="astuce">Franchie si l'événement arrive ET la condition est vraie. « do / … » = action pendant l'état.</p>`,
        quiz: [
          { enonce: "Dans un SD, le temps s'écoule…", choix: ["de haut en bas", "de gauche à droite", "de bas en haut"], bonne: 0 },
          { enonce: "« power_ON » est…", choix: ["un événement", "un état", "une condition"], bonne: 0 },
          { enonce: "Dans un SD système, le système est vu comme…", choix: ["une boîte noire", "un ensemble de blocs détaillés", "un acteur secondaire"], bonne: 0 }
        ] }
    ]
  });

  /* =====================================================================
     MODULE 2 — Chaîne de puissance : effort, flux, rendement
     ===================================================================== */
  const FCT = { A: "Alimenter", D: "Distribuer (moduler)", C: "Convertir", T: "Transmettre (adapter)" };
  const FCT_EXPL = {
    A: "Alimenter : c'est la source d'énergie à l'entrée de la chaîne (piles, batterie, réseau, air comprimé).",
    D: "Distribuer (moduler) : c'est le pré-actionneur, qui laisse passer l'énergie vers l'actionneur sur ordre de la chaîne d'information.",
    C: "Convertir : c'est l'actionneur, qui transforme l'énergie reçue en énergie mécanique (moteur, vérin).",
    T: "Transmettre (adapter) : l'énergie mécanique est adaptée (vitesse, couple, type de mouvement) avant d'arriver à l'effecteur."
  };
  const CAS_FCT = [
    ["les 4 piles AA de l'agrafeuse électrique", "A"],
    ["la carte électronique de l'agrafeuse électrique", "D"],
    ["le moteur électrique de l'agrafeuse", "C"],
    ["le train d'engrenages de l'agrafeuse", "T"],
    ["l'excentrique et le coulisseau de l'agrafeuse (rotation → translation)", "T"],
    ["la batterie de la voiture radiocommandée", "A"],
    ["la carte électronique variateur de la voiture radiocommandée", "D"],
    ["le réducteur-différentiel de la voiture radiocommandée", "T"],
    ["le variateur du skateboard électrique", "D"],
    ["le moteur du skateboard électrique", "C"],
    ["les poulies et la courroie du skateboard électrique", "T"],
    ["le contacteur qui commande le moteur d'un tapis roulant", "D"],
    ["le distributeur pneumatique qui commande un vérin", "D"],
    ["le vérin pneumatique qui ouvre une porte de bus", "C"],
    ["le réseau d'air comprimé (compresseur) d'un atelier", "A"],
    ["le hacheur qui fait varier la vitesse d'un moteur à courant continu", "D"],
    ["le réseau électrique 230 V qui alimente une machine", "A"],
    ["le système pignon-crémaillère qui déplace un portail", "T"]
  ];
  const DOM = [
    { nom: "électrique", effort: "La tension U (V)", flux: "L'intensité I (A)" },
    { nom: "mécanique de translation", effort: "La force F (N)", flux: "La vitesse linéaire V (m/s)" },
    { nom: "mécanique de rotation", effort: "Le couple C (N·m)", flux: "La vitesse angulaire ω (rad/s)" },
    { nom: "hydraulique", effort: "La pression p (Pa)", flux: "Le débit volumique Q<sub>v</sub> (m³/s)" },
    { nom: "pneumatique", effort: "La pression p (Pa)", flux: "Le débit volumique Q<sub>v</sub> (m³/s)" },
    { nom: "thermique", effort: "La température T (K)", flux: "Le flux d'entropie (W/K)" }
  ];
  const TOUTES_GRANDEURS = DOM.reduce((a, d) => a.concat(d.nom === "thermique" ? [d.effort] : [d.effort, d.flux]), []);
  const GRAND = [
    ["la tension U (V)", "Effort – électrique", "Flux – électrique"],
    ["l'intensité I (A)", "Flux – électrique", "Effort – électrique"],
    ["la force F (N)", "Effort – mécanique de translation", "Flux – mécanique de translation"],
    ["la vitesse V (m/s)", "Flux – mécanique de translation", "Effort – mécanique de translation"],
    ["le couple C (N·m)", "Effort – mécanique de rotation", "Flux – mécanique de rotation"],
    ["la vitesse angulaire ω (rad/s)", "Flux – mécanique de rotation", "Effort – mécanique de rotation"],
    ["la pression p (Pa) dans un vérin", "Effort – hydraulique ou pneumatique", "Flux – hydraulique ou pneumatique"],
    ["le débit Q<sub>v</sub> (m³/s) d'air comprimé", "Flux – hydraulique ou pneumatique", "Effort – hydraulique ou pneumatique"]
  ];
  const TOUTES_NATURES = GRAND.map((x) => x[1]);
  const SKATE = [
    [1, "entre la batterie et le variateur", "EL"],
    [2, "entre le variateur et le moteur", "EL"],
    [3, "entre le moteur et les poulies/courroie", "ROT"],
    [4, "entre les poulies/courroie et la roue", "ROT"],
    [5, "en sortie de la roue (contact avec le sol)", "TR"]
  ];
  const EF = { EL: "Flux : I (A) — effort : U (V)", ROT: "Flux : ω (rad/s) — effort : C (N·m)", TR: "Flux : V (m/s) — effort : F (N)" };
  const EF_INV = { EL: "Flux : U (V) — effort : I (A)", ROT: "Flux : C (N·m) — effort : ω (rad/s)", TR: "Flux : F (N) — effort : V (m/s)" };
  const EF_NOM = { EL: "électrique", ROT: "mécanique de rotation", TR: "mécanique de translation" };
  const EN = { EL: "Électrique", ROT: "Mécanique de rotation", TR: "Mécanique de translation", TH: "Thermique (calorifique)", PN: "Pneumatique" };
  const CAS_EN = [
    ["en sortie des piles de l'agrafeuse", "EL"],
    ["en sortie du moteur de l'agrafeuse", "ROT"],
    ["en sortie du train d'engrenages de l'agrafeuse", "ROT"],
    ["en sortie de l'excentrique et du coulisseau de l'agrafeuse", "TR"],
    ["en sortie de la carte variateur de la voiture radiocommandée", "EL"],
    ["en sortie des roues de la voiture radiocommandée (déplacement)", "TR"],
    ["en sortie du pédalier du vélo d'entraînement", "ROT"],
    ["en sortie du frein à courant de Foucault du vélo d'entraînement", "TH"],
    ["en sortie de la dynamo du vélo d'entraînement", "EL"],
    ["en sortie du compresseur d'un atelier", "PN"],
    ["en sortie de la tige d'un vérin pneumatique", "TR"],
    ["en sortie d'un distributeur pneumatique", "PN"]
  ];
  const SYST_REND = [
    { txt: (a, b) => `Une lampe à incandescence absorbe <b>${a} W</b> et produit <b>${b} W</b> de lumière.`, u: "W", Pe: [40, 60, 75, 100], eta: [0.05, 0.15], dec: 0 },
    { txt: (a, b) => `Un moteur électrique absorbe <b>${a} W</b> et fournit <b>${b} W</b> de puissance mécanique.`, u: "W", Pe: [10, 50, 100, 250, 400], eta: [0.7, 0.92], dec: 1 },
    { txt: (a, b) => `Un poêle à granulés reçoit <b>${a} kW</b> (énergie des granulés) et fournit <b>${b} kW</b> de chaleur utile.`, u: "kW", Pe: [8, 9, 10, 11, 12], eta: [0.85, 0.93], dec: 2 },
    { txt: (a, b) => `Un réducteur à engrenages reçoit <b>${a} kW</b> et restitue <b>${b} kW</b> sur son arbre de sortie.`, u: "kW", Pe: [1, 1.5, 2, 3, 4], eta: [0.8, 0.97], dec: 2 },
    { txt: (a, b) => `Une chaudière à pellets reçoit <b>${a} kW</b> (biomasse) et fournit <b>${b} kW</b> au circuit de chauffage.`, u: "kW", Pe: [11.5, 15, 20, 27], eta: [0.85, 0.94], dec: 2 }
  ];

  SIP.definirModule({
    id: "1si-s1-puissance",
    niveaux: ["1SI"],
    sequence: "S1 · Chaîne de puissance",
    titre: "Chaîne de puissance : effort, flux et rendement",
    description: "Fonctions de la chaîne de puissance, grandeurs effort / flux, P = effort × flux, pertes et rendement global.",
    competences: ["A2", "M2", "M3"],
    nbQuestions: 10,
    questions: [
      // ---- Fonctions de la chaîne de puissance ----
      { fiche: "1si-s1-puis-fonctions", gen: (r) => { const [t, k] = r.pick(CAS_FCT); return qcm(r, `Dans la chaîne de puissance, quelle fonction réalise <b>${t}</b> ?`, FCT[k], Object.values(FCT), FCT_EXPL[k]); } },
      { fiche: "1si-s1-puis-fonctions", gen: (r) => { const Ue = r.pick([12, 24, 36, 48]), a = r.pas(0.1, 0.95, 0.05); return { enonce: `Un hacheur alimenté sous <b>U<sub>e</sub> = ${Ue} V</b> fonctionne avec un rapport cyclique <b>α = ${nb(a)}</b>. Tension moyenne U<sub>s</sub> appliquée au moteur ?`, reponse: a * Ue, unite: "V", explication: `U<sub>s</sub> = α·U<sub>e</sub> = ${nb(a)} × ${Ue} = ${nb(a * Ue)} V.` }; } },
      { fiche: "1si-s1-puis-fonctions", gen: (r) => { const Ue = r.pick([12, 24, 36, 48]), a = r.pas(0.1, 0.95, 0.05); const Us = a * Ue; return { enonce: `Un hacheur alimenté sous <b>U<sub>e</sub> = ${Ue} V</b> délivre au moteur une tension moyenne <b>U<sub>s</sub> = ${nb(Us)} V</b>. Rapport cyclique α (nombre entre 0 et 1) ?`, reponse: a, unite: "", explication: `U<sub>s</sub> = α·U<sub>e</sub> donc α = U<sub>s</sub> / U<sub>e</sub> = ${nb(Us)} / ${Ue} = ${nb(a)}.` }; } },
      { fiche: "1si-s1-puis-fonctions", gen: (r) => { const N0 = r.pick([1500, 2000, 3000, 3600, 4500]), Ue = r.pick([12, 24]), a = r.pas(0.2, 0.9, 0.05); return { enonce: `Un moteur à courant continu tourne à <b>${N0} tr/min</b> sous <b>${Ue} V</b>. Le hacheur passe à <b>α = ${nb(a)}</b>. Nouvelle vitesse de rotation (la vitesse est proportionnelle à la tension) ?`, reponse: a * N0, unite: "tr/min", explication: `U<sub>s</sub> = α·U<sub>e</sub> = ${nb(a * Ue)} V ; la vitesse suit la tension : N = α × ${N0} = ${nb(a * N0)} tr/min.` }; } },
      { type: "qcm", fiche: "1si-s1-puis-fonctions", enonce: "Le pré-actionneur réalise la fonction…", choix: ["Distribuer (moduler) l'énergie sur ordre de la chaîne d'information", "Convertir l'énergie électrique en énergie mécanique", "Alimenter le système en énergie", "Transmettre le mouvement à l'effecteur"], bonne: 0, explication: "Le pré-actionneur (contacteur, distributeur, variateur, hacheur) module l'énergie envoyée à l'actionneur selon les ordres reçus." },
      { type: "qcm", fiche: "1si-s1-puis-fonctions", enonce: "Quel pré-actionneur est associé à un vérin pneumatique ?", choix: ["Un distributeur", "Un contacteur", "Un hacheur", "Un réducteur"], bonne: 0, explication: "Actionneur pneumatique ou hydraulique → distributeur ; actionneur électrique → relais, contacteur ou variateur." },
      { type: "qcm", fiche: "1si-s1-puis-fonctions", enonce: "Pour faire varier la vitesse d'un moteur à courant continu, on utilise…", choix: ["Un hacheur, qui modifie la tension moyenne aux bornes du moteur", "Un contacteur tout ou rien", "Un distributeur pneumatique", "Un réducteur à engrenages"], bonne: 0, explication: "La vitesse d'un moteur à courant continu est proportionnelle à sa tension : le hacheur règle U<sub>s</sub> = α·U<sub>e</sub>." },
      { type: "qcm", fiche: "1si-s1-puis-fonctions", enonce: "Site isolé avec panneau solaire et batterie : la fonction « Produire localement » est assurée par…", choix: ["Le panneau solaire", "La batterie", "Le variateur", "Le moteur"], bonne: 0, explication: "Le panneau produit l'énergie sur place ; la batterie, elle, réalise la fonction « Stocker »." },
      { type: "qcm", fiche: "1si-s1-puis-fonctions", enonce: "Dans le vélo d'entraînement, le volant d'inertie réalise la fonction…", choix: ["Stocker", "Convertir", "Alimenter", "Distribuer"], bonne: 0, explication: "Le volant d'inertie accumule de l'énergie cinétique de rotation et la restitue : il stocke." },
      // ---- Effort / flux ----
      { fiche: "1si-s1-puis-ef", gen: (r) => {
          const d = r.pick(DOM); const k = d.nom === "thermique" ? "effort" : r.pick(["effort", "flux"]); const autre = k === "effort" ? "flux" : "effort";
          return qcm(r, `En énergie <b>${d.nom}</b>, quelle est la grandeur <b>${k}</b> ?`, d[k], TOUTES_GRANDEURS, `En ${d.nom} : effort = ${d.effort.toLowerCase()} ; flux = ${d.flux.toLowerCase()}. Leur produit est la puissance.`, d.nom === "thermique" ? [] : [d[autre]]); } },
      { fiche: "1si-s1-puis-ef", gen: (r) => { const [x, bonne, inv] = r.pick(GRAND); return qcm(r, `Dans une chaîne de puissance, <b>${x}</b> est une grandeur…`, bonne, TOUTES_NATURES, `${x.charAt(0).toUpperCase() + x.slice(1)} : ${bonne.toLowerCase()}. Le flux « circule » (courant, vitesse, débit) ; l'effort « pousse » (tension, force, couple, pression).`, [inv]); } },
      { fiche: "1si-s1-puis-ef", gen: (r) => {
          const [n, pos, k] = r.pick(SKATE); const autres = Object.keys(EF).filter((x) => x !== k).map((x) => EF[x]);
          return qcm(r, `Skateboard électrique : batterie → variateur → moteur → poulies/courroie → roue. Au repère <b>${n}</b> (${pos}), quelles sont les grandeurs flux et effort ?`, EF[k], autres, `Au repère ${n}, l'énergie est ${EF_NOM[k]} : ${EF[k]}.`, [EF_INV[k]]); } },
      { fiche: "1si-s1-puis-ef", gen: (r) => { const [t, k] = r.pick(CAS_EN); return qcm(r, `Quelle est la nature de l'énergie <b>${t}</b> ?`, EN[k], Object.values(EN), `${t.charAt(0).toUpperCase() + t.slice(1)}, l'énergie est : ${EN[k].toLowerCase()}.`); } },
      { type: "qcm", fiche: "1si-s1-puis-ef", enonce: "Un moteur électrique (fonction Convertir) reçoit puis fournit de l'énergie…", choix: ["Électrique (U, I) puis mécanique de rotation (C, ω)", "Mécanique de rotation puis électrique", "Électrique (U, I) puis mécanique de translation (F, V)", "Électrique en entrée comme en sortie"], bonne: 0, explication: "Le moteur convertit l'énergie électrique (effort U, flux I) en énergie mécanique de rotation (effort C, flux ω)." },
      { type: "qcm", fiche: "1si-s1-puis-ef", enonce: "Un vérin pneumatique reçoit de l'énergie pneumatique (p, Q<sub>v</sub>) et fournit…", choix: ["Une force F et une vitesse V de translation", "Un couple C et une vitesse angulaire ω", "Une tension U et un courant I", "Une pression p et un débit Q<sub>v</sub>"], bonne: 0, explication: "La tige du vérin sort en translation : énergie mécanique de translation (effort F, flux V)." },
      // ---- P = effort × flux ----
      { fiche: "1si-s1-puis-p", gen: (r) => { const [s, U] = r.pick([["La batterie d'une trottinette électrique", 36], ["La batterie d'un skateboard électrique", 24], ["La batterie d'une voiture radiocommandée", 12], ["La batterie d'un vélo à assistance électrique", 36], ["La batterie d'un gyropode", 48]]); const I = r.pas(2, 15, 0.5); return { enonce: `${s} délivre <b>U = ${U} V</b> et <b>I = ${nb(I)} A</b>. Puissance électrique fournie ?`, reponse: U * I, unite: "W", explication: `Électrique : P = U·I = ${U} × ${nb(I)} = ${nb(U * I)} W.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const F = r.pas(20, 120, 5), V = r.pas(2, 8, 0.5); return { enonce: `La roue motrice d'une trottinette pousse sur le sol avec une force <b>F = ${F} N</b> ; la trottinette roule à <b>V = ${nb(V)} m/s</b>. Puissance mécanique transmise ?`, reponse: F * V, unite: "W", explication: `Translation : P = F·V = ${F} × ${nb(V)} = ${nb(F * V)} W.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const C = r.pas(2, 20, 0.5), w = r.pas(10, 40, 2); return { enonce: `Le moteur-roue d'un gyropode fournit un couple <b>C = ${nb(C)} N·m</b> à <b>ω = ${w} rad/s</b>. Puissance mécanique ?`, reponse: C * w, unite: "W", explication: `Rotation : P = C·ω = ${nb(C)} × ${w} = ${nb(C * w)} W.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const C = r.pick([0.2, 0.5, 0.8, 1, 1.5, 2, 3, 5]), N = r.pick([600, 900, 1200, 1500, 1800, 2400, 3000]); const w = N * 2 * PI / 60; return { enonce: `Un moteur électrique tourne à <b>N = ${N} tr/min</b> en fournissant un couple <b>C = ${nb(C)} N·m</b>. Puissance mécanique utile ?`, reponse: C * w, unite: "W", tolerance: 3, explication: `ω = N × 2π / 60 = ${N} × 2π / 60 = ${nb(w)} rad/s ; P = C·ω = ${nb(C)} × ${nb(w)} = ${nb(C * w)} W.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const hyd = r.int(0, 1) === 1; const p = hyd ? r.pick([50, 80, 100, 150, 200]) : r.pick([4, 5, 6, 7, 8]); const Q = hyd ? r.pas(0.1, 1, 0.05) : r.pas(0.2, 2, 0.1); const P = p * 1e5 * Q * 1e-3; const nom = hyd ? "hydraulique" : "pneumatique"; return { enonce: `Un vérin ${nom} est alimenté sous <b>p = ${p} bar</b> avec un débit <b>Q<sub>v</sub> = ${nb(Q)} L/s</b>. Puissance ${nom} reçue ?`, reponse: P, unite: "W", explication: `En unités SI : ${p} bar = ${nb(p * 1e5)} Pa et ${nb(Q)} L/s = ${nb(Q * 1e-3)} m³/s ; P = p·Q<sub>v</sub> = ${nb(p * 1e5)} × ${nb(Q * 1e-3)} = ${nb(P)} W.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const P = r.pick([250, 300, 350, 500, 750, 1000]), U = r.pick([24, 36, 48]); return { enonce: `Le moteur d'une trottinette absorbe <b>P = ${P} W</b> sous <b>U = ${U} V</b>. Intensité du courant absorbé ?`, reponse: P / U, unite: "A", explication: `P = U·I donc I = P / U = ${P} / ${U} = ${nb(P / U)} A.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const P = r.pick([100, 250, 350, 500, 750]), N = r.pick([300, 600, 900, 1200, 1500]); const w = N * 2 * PI / 60; return { enonce: `Un moteur fournit <b>P = ${P} W</b> à <b>N = ${N} tr/min</b>. Couple sur l'arbre moteur ?`, reponse: P / w, unite: "N·m", tolerance: 3, explication: `ω = ${N} × 2π / 60 = ${nb(w)} rad/s ; C = P / ω = ${P} / ${nb(w)} = ${nb(P / w)} N·m.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const P = r.pas(100, 300, 25), Vk = r.pick([18, 20, 25, 27, 30, 36]); const V = Vk / 3.6; return { enonce: `Un cycliste développe <b>P = ${P} W</b> et roule à <b>${Vk} km/h</b>. Force de propulsion au contact roue-sol ?`, reponse: P / V, unite: "N", explication: `V = ${Vk} / 3,6 = ${nb(V)} m/s ; P = F·V donc F = P / V = ${P} / ${nb(V)} = ${nb(P / V)} N.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => {
          if (r.int(0, 1)) { const N = r.pick([60, 300, 750, 1000, 1440, 1500, 2800, 3000]); const w = N * 2 * PI / 60; return { enonce: `Convertis <b>N = ${N} tr/min</b> en vitesse angulaire ω.`, reponse: w, unite: "rad/s", explication: `ω = N × 2π / 60 = ${N} × 2π / 60 = ${nb(w)} rad/s.` }; }
          const w = r.pas(10, 400, 10); const N = w * 60 / (2 * PI); return { enonce: `Un arbre tourne à <b>ω = ${w} rad/s</b>. Fréquence de rotation N en tr/min ?`, reponse: N, unite: "tr/min", explication: `N = ω × 60 / (2π) = ${w} × 60 / (2π) = ${nb(N)} tr/min.` }; } },
      { fiche: "1si-s1-puis-p", gen: (r) => { const mot = r.int(0, 1) === 1; const C = mot ? r.pas(0.4, 0.8, 0.02) : r.pas(60, 100, 1); const w = mot ? r.pas(1000, 1500, 10) : r.pas(4, 8, 0.5); const P = C * 1e-3 * w; return { enonce: `Agrafeuse électrique : ${mot ? "le moteur" : "le train d'engrenages"} fournit un couple <b>C = ${nb(C)} N·mm</b> à <b>ω = ${nb(w)} rad/s</b>. Puissance mécanique (en W) ?`, reponse: P, unite: "W", explication: `C = ${nb(C)} N·mm = ${nb(C * 1e-3)} N·m ; P = C·ω = ${nb(C * 1e-3)} × ${nb(w)} = ${nb(P)} W.` }; } },
      { type: "qcm", fiche: "1si-s1-puis-p", enonce: "Parmi ces produits, lequel n'est <b>pas</b> une puissance ?", choix: ["F × d (force × distance)", "U × I", "C × ω", "p × Q<sub>v</sub>"], bonne: 0, explication: "F × d est un travail (une énergie, en J). Une puissance est toujours effort × flux : U·I, C·ω, p·Q<sub>v</sub>, F·V." },
      { type: "qcm", fiche: "1si-s1-puis-p", enonce: "Un élève calcule la puissance d'un moteur : C = 2 N·m, N = 1500 tr/min, « P = C × N = 3000 W ». Quelle est son erreur ?", choix: ["N doit être converti en rad/s : ω ≈ 157 rad/s, donc P ≈ 314 W", "Il fallait diviser : P = C / N", "Le couple doit être exprimé en N·mm", "Aucune, le résultat est juste"], bonne: 0, explication: "P = C·ω avec ω en rad/s : ω = 1500 × 2π / 60 ≈ 157 rad/s, P ≈ 2 × 157 ≈ 314 W." },
      // ---- Pertes et rendement ----
      { fiche: "1si-s1-puis-rend", gen: (r) => { const S = r.pick(SYST_REND); const Pe = r.pick(S.Pe), eta = r.pas(S.eta[0], S.eta[1], 0.01); const Ps = +(Pe * eta).toFixed(S.dec) || 1; const e = Ps / Pe; return { enonce: `${S.txt(nb(Pe), nb(Ps))} Rendement (en %) ?`, reponse: 100 * e, unite: "%", explication: `η = P<sub>sortie</sub> / P<sub>entrée</sub> = ${nb(Ps)} / ${nb(Pe)} = ${nb(e, 3)}, soit ${nb(100 * e, 3)} %.` }; } },
      { fiche: "1si-s1-puis-rend", gen: (r) => { const Pe = r.pas(200, 800, 10), eta = r.pick([0.75, 0.8, 0.82, 0.85, 0.88, 0.9]); const Ps = Pe * eta; return { enonce: `Le moteur d'une trottinette absorbe <b>${Pe} W</b> et fournit <b>${nb(Ps)} W</b> sur son arbre. Puissance perdue ?`, reponse: Pe - Ps, unite: "W", explication: `P<sub>pertes</sub> = P<sub>e</sub> − P<sub>s</sub> = ${Pe} − ${nb(Ps)} = ${nb(Pe - Ps)} W, dissipés surtout en chaleur (effet Joule, frottements).` }; } },
      { fiche: "1si-s1-puis-rend", gen: (r) => { const Pe = r.pas(1, 5, 0.5), eta = r.pick([0.8, 0.85, 0.9, 0.95, 0.97]); return { enonce: `Un réducteur à engrenages de rendement <b>η = ${nb(eta)}</b> reçoit <b>${nb(Pe)} kW</b>. Puissance disponible en sortie ?`, reponse: Pe * eta, unite: "kW", explication: `P<sub>s</sub> = η·P<sub>e</sub> = ${nb(eta)} × ${nb(Pe)} = ${nb(Pe * eta)} kW.` }; } },
      { fiche: "1si-s1-puis-rend", gen: (r) => { const Ps = r.pick([150, 200, 250, 300, 350, 400]), eta = r.pick([0.75, 0.8, 0.85, 0.9]); return { enonce: `Le moteur d'un vélo à assistance électrique doit fournir <b>${Ps} W</b> sur son arbre ; son rendement est <b>η = ${nb(eta)}</b>. Puissance électrique absorbée ?`, reponse: Ps / eta, unite: "W", explication: `η = P<sub>s</sub> / P<sub>e</sub> donc P<sub>e</sub> = P<sub>s</sub> / η = ${Ps} / ${nb(eta)} = ${nb(Ps / eta)} W.` }; } },
      { fiche: "1si-s1-puis-rend", gen: (r) => { const Pe = r.pas(200, 600, 50), eta = r.pick([0.75, 0.8, 0.85, 0.9]), t = r.pick([5, 10, 15, 20, 30]); const Pp = Pe * (1 - eta), E = Pp * t * 60; return { enonce: `Le moteur d'une trottinette absorbe <b>${Pe} W</b> avec un rendement <b>η = ${nb(eta)}</b> pendant <b>${t} min</b>. Énergie perdue en chaleur (en kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `P<sub>pertes</sub> = P<sub>e</sub> × (1 − η) = ${Pe} × ${nb(1 - eta)} = ${nb(Pp)} W ; E = P·Δt = ${nb(Pp)} × ${t * 60} s = ${nb(E, 7)} J = ${nb(E / 1000, 6)} kJ.` }; } },
      { fiche: "1si-s1-puis-rend", gen: (r) => {
          let Pa, Pb, Sa, Sb, ea, eb;
          do { Pa = r.pas(15, 30, 0.5); Pb = r.pas(8, 14, 0.5); Sa = +(Pa * r.pas(0.8, 0.95, 0.01)).toFixed(1); Sb = +(Pb * r.pas(0.8, 0.95, 0.01)).toFixed(1); ea = Sa / Pa; eb = Sb / Pb; } while (Math.abs(ea - eb) < 0.03);
          const best = ea > eb ? "A" : "B";
          return { type: "qcm", enonce: `Chaudière A : <b>${nb(Pa)} kW</b> reçus (granulés) → <b>${nb(Sa)} kW</b> de chaleur. Chaudière B : <b>${nb(Pb)} kW</b> reçus → <b>${nb(Sb)} kW</b>. Laquelle est la plus efficace ?`, choix: [`La chaudière ${best}`, `La chaudière ${best === "A" ? "B" : "A"}`, "Les deux ont le même rendement", "On ne peut pas conclure sans la durée de fonctionnement"], bonne: 0, explication: `η<sub>A</sub> = ${nb(Sa)} / ${nb(Pa)} = ${nb(ea, 3)} ; η<sub>B</sub> = ${nb(Sb)} / ${nb(Pb)} = ${nb(eb, 3)}. On compare les rendements, pas les puissances fournies.` }; } },
      { type: "qcm", fiche: "1si-s1-puis-rend", enonce: "Où va principalement l'énergie « perdue » dans une chaîne de puissance ?", choix: ["Elle est dissipée, le plus souvent sous forme de chaleur", "Elle disparaît définitivement", "Elle retourne dans la batterie", "Elle est stockée dans l'effecteur"], bonne: 0, explication: "Rien ne se perd : l'énergie non utile est transformée, surtout en chaleur (effet Joule, frottements), parfois en bruit ou vibrations." },
      { type: "qcm", fiche: "1si-s1-puis-rend", enonce: "Un vendeur annonce un moteur de rendement η = 1,05. C'est…", choix: ["Impossible : un rendement est toujours inférieur à 1", "Possible pour un moteur de très bonne qualité", "Possible si le moteur est neuf", "Normal pour un moteur électrique"], bonne: 0, explication: "η = P<sub>s</sub> / P<sub>e</sub> < 1 : un système ne fournit jamais plus d'énergie qu'il n'en reçoit. η = 1 serait un système parfait (théorique)." },
      // ---- Rendement global ----
      { fiche: "1si-s1-puis-global", gen: (r) => { const a = r.pas(0.9, 0.98, 0.01), b = r.pas(0.75, 0.9, 0.01), c = r.pas(0.85, 0.95, 0.01); const e = a * b * c; return { enonce: `Skateboard : variateur <b>η<sub>1</sub> = ${nb(a)}</b>, moteur <b>η<sub>2</sub> = ${nb(b)}</b>, poulies-courroie <b>η<sub>3</sub> = ${nb(c)}</b>. Rendement global (en %) ?`, reponse: 100 * e, unite: "%", explication: `η<sub>g</sub> = η<sub>1</sub> × η<sub>2</sub> × η<sub>3</sub> = ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(e, 3)}, soit ${nb(100 * e, 3)} %.` }; } },
      { fiche: "1si-s1-puis-global", gen: (r) => { const Pb = r.pick([60, 72, 80, 90]), a = r.pick([0.9, 0.91, 0.93, 0.95]), b = r.pick([0.8, 0.85, 0.9]), c = r.pick([0.8, 0.84, 0.88]); const P = Pb * a * b * c; return { enonce: `Voiture radiocommandée : batterie <b>${Pb} W</b> → carte variateur (η = ${nb(a)}) → moteur (η = ${nb(b)}) → réducteur-différentiel (η = ${nb(c)}). Puissance en sortie du différentiel ?`, reponse: P, unite: "W", explication: `P = ${Pb} × ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(P)} W (η<sub>g</sub> = ${nb(a * b * c, 3)}).` }; } },
      { fiche: "1si-s1-puis-global", gen: (r) => { const a = r.pick([0.9, 0.92, 0.95]), b = r.pick([0.8, 0.85, 0.88, 0.9]), c = r.pick([0.7, 0.75, 0.8, 0.85, 0.9]); const eg = +(a * b * c).toFixed(3); const x = eg / (a * b); return { enonce: `Chaîne : variateur (η<sub>1</sub> = ${nb(a)}), moteur (η<sub>2</sub> = ${nb(b)}), réducteur de rendement inconnu. On mesure <b>η<sub>g</sub> = ${nb(eg)}</b>. Rendement du réducteur (nombre sans unité) ?`, reponse: x, unite: "", explication: `η<sub>g</sub> = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub> donc η<sub>3</sub> = ${nb(eg)} / (${nb(a)} × ${nb(b)}) = ${nb(x, 3)}.` }; } },
      { fiche: "1si-s1-puis-global", gen: (r) => {
          const P0 = r.pas(100, 300, 10), e1 = r.pas(0.9, 0.97, 0.01), e2 = r.pas(0.7, 0.88, 0.01), e3 = r.pas(0.8, 0.95, 0.01);
          const P1 = +(P0 * e1).toFixed(1), P2 = +(P1 * e2).toFixed(1), P3 = +(P2 * e3).toFixed(1);
          const L = [["Carte de commande", P0, P1], ["Moteur", P1, P2], ["Réducteur", P2, P3]];
          const tab = `<table><tr><th>Constituant</th><th>P entrée (W)</th><th>P sortie (W)</th></tr>${L.map((l) => `<tr><td>${l[0]}</td><td>${nb(l[1])}</td><td>${nb(l[2])}</td></tr>`).join("")}</table>`;
          const mode = r.int(0, 3);
          if (mode === 3) return { enonce: `Mesures sur la chaîne de puissance d'un portail automatique : ${tab} Rendement global de la chaîne (en %) ?`, reponse: 100 * P3 / P0, unite: "%", explication: `η<sub>g</sub> = P<sub>sortie finale</sub> / P<sub>entrée</sub> = ${nb(P3)} / ${nb(P0)} = ${nb(P3 / P0, 3)}, soit ${nb(100 * P3 / P0, 3)} %.` };
          const l = L[mode];
          return { enonce: `Mesures sur la chaîne de puissance d'un portail automatique : ${tab} Rendement du constituant « ${l[0]} » (en %) ?`, reponse: 100 * l[2] / l[1], unite: "%", explication: `η = P<sub>s</sub> / P<sub>e</sub> = ${nb(l[2])} / ${nb(l[1])} = ${nb(l[2] / l[1], 3)}, soit ${nb(100 * l[2] / l[1], 3)} %.` }; } },
      { fiche: "1si-s1-puis-global", gen: (r) => { const Ps = r.pick([200, 250, 300, 350, 400]), a = r.pick([0.95, 0.97]), b = r.pick([0.8, 0.85, 0.88]), c = r.pick([0.9, 0.92, 0.95]); const e = a * b * c; return { enonce: `Une trottinette doit recevoir <b>${Ps} W</b> à la roue. Chaîne : variateur (η = ${nb(a)}), moteur (η = ${nb(b)}), transmission (η = ${nb(c)}). Puissance à prélever sur la batterie ?`, reponse: Ps / e, unite: "W", explication: `η<sub>g</sub> = ${nb(a)} × ${nb(b)} × ${nb(c)} = ${nb(e, 3)} ; P<sub>batterie</sub> = P<sub>roue</sub> / η<sub>g</sub> = ${Ps} / ${nb(e, 3)} = ${nb(Ps / e)} W.` }; } },
      { type: "qcm", fiche: "1si-s1-puis-global", enonce: "Le rendement global d'une chaîne de puissance est toujours…", choix: ["Inférieur au plus petit des rendements de la chaîne", "Égal à la somme des rendements", "Égal à la moyenne des rendements", "Supérieur au plus grand des rendements"], bonne: 0, explication: "On multiplie des nombres inférieurs à 1 : le produit est plus petit que chacun d'eux." },
      { type: "qcm", fiche: "1si-s1-puis-global", enonce: "Chaîne de l'agrafeuse : 0,76 W à l'entrée (piles), 0,3 W en sortie (coulisseau). Rendement global ?", choix: ["≈ 0,39", "≈ 2,53", "≈ 0,61", "≈ 0,46"], bonne: 0, explication: "η<sub>g</sub> = 0,3 / 0,76 ≈ 0,39. (0,46 W, ce sont les pertes ; 0,61 est la part perdue ; 2,53 est le rapport inversé.)" }
    ],
    fiches: [
      { id: "1si-s1-puis-fonctions", titre: "Les fonctions de la chaîne de puissance",
        recto: "Quelles sont les fonctions de la chaîne de puissance et quels composants les réalisent ?",
        verso: `<div class="formule">Alimenter → Distribuer → Convertir → Transmettre</div><ul><li><b>Alimenter</b> : piles, batterie, réseau 230 V, air comprimé</li><li><b>Distribuer</b> (moduler) : pré-actionneur — contacteur, distributeur (TOR) ; variateur, hacheur</li><li><b>Convertir</b> : actionneur — moteur, vérin</li><li><b>Transmettre</b> (adapter) : réducteur, poulies-courroie</li></ul><p class="astuce">Hacheur : U<sub>s</sub> = α·U<sub>e</sub>. Parfois aussi : Produire localement, Stocker.</p>`,
        quiz: [
          { enonce: "Un vérin pneumatique réalise la fonction…", choix: ["Convertir", "Distribuer", "Alimenter"], bonne: 0 },
          { enonce: "Le pré-actionneur d'un vérin est…", choix: ["un distributeur", "un contacteur", "un réducteur"], bonne: 0 },
          { enonce: "Hacheur : U<sub>e</sub> = 24 V, α = 0,5 → U<sub>s</sub> = …", choix: ["12 V", "48 V", "24 V"], bonne: 0 }
        ] },
      { id: "1si-s1-puis-ef", titre: "Grandeurs effort et flux",
        recto: "Quelles sont les grandeurs effort et flux dans chaque domaine d'énergie ?",
        verso: `<table><tr><th>Domaine</th><th>Effort</th><th>Flux</th></tr><tr><td>Électrique</td><td>U (V)</td><td>I (A)</td></tr><tr><td>Translation</td><td>F (N)</td><td>V (m/s)</td></tr><tr><td>Rotation</td><td>C (N·m)</td><td>ω (rad/s)</td></tr><tr><td>Hydraulique, pneumatique</td><td>p (Pa)</td><td>Q<sub>v</sub> (m³/s)</td></tr><tr><td>Thermique</td><td>T (K)</td><td>flux d'entropie</td></tr></table><p class="astuce">Le flux « circule » (courant, vitesse, débit) ; l'effort « pousse » (tension, force, couple, pression).</p>`,
        quiz: [
          { enonce: "En rotation, l'effort est…", choix: ["le couple C", "la vitesse angulaire ω", "la force F"], bonne: 0 },
          { enonce: "En électricité, le flux est…", choix: ["l'intensité I", "la tension U", "la puissance P"], bonne: 0 },
          { enonce: "En hydraulique, l'effort est…", choix: ["la pression p", "le débit Q<sub>v</sub>", "la température"], bonne: 0 }
        ] },
      { id: "1si-s1-puis-p", titre: "Puissance = effort × flux",
        recto: "Comment calcule-t-on la puissance transmise dans chaque domaine ?",
        verso: `<div class="formule">P = effort × flux (W)</div><ul><li>P = U·I · P = F·V · P = C·ω · P = p·Q<sub>v</sub></li><li>ω (rad/s) = N (tr/min) × 2π / 60</li><li>Énergie transmise pendant Δt : W = P·Δt (J)</li></ul><p class="astuce">Unités SI obligatoires : N·mm → × 10⁻³ N·m ; bar → × 10⁵ Pa ; L/s → × 10⁻³ m³/s.</p>`,
        quiz: [
          { enonce: "C = 2 N·m, ω = 100 rad/s → P = …", choix: ["200 W", "50 W", "0,02 W"], bonne: 0 },
          { enonce: "1500 tr/min ≈ …", choix: ["157 rad/s", "1500 rad/s", "25 rad/s"], bonne: 0 },
          { enonce: "12 V et 5 A → P = …", choix: ["60 W", "2,4 W", "17 W"], bonne: 0 }
        ] },
      { id: "1si-s1-puis-rend", titre: "Pertes et rendement",
        recto: "Comment définir le rendement et les pertes d'un constituant ?",
        verso: `<div class="formule">η = P<sub>sortie</sub> / P<sub>entrée</sub> = E<sub>u</sub> / E<sub>a</sub></div><ul><li>Pertes : P<sub>e</sub> − P<sub>s</sub>, surtout en <b>chaleur</b> (effet Joule, frottements)</li><li>η sans unité, toujours <b>&lt; 1</b> (1 = système parfait, théorique)</li><li>Ex. lampe : 70 W absorbés → 10 W de lumière</li></ul><p class="astuce">Noté η ou μ. Plus de puissance en sortie ≠ meilleur rendement : on compare les rapports.</p>`,
        quiz: [
          { enonce: "Moteur : 10 W absorbés, 8 W utiles → η = …", choix: ["0,8", "1,25", "2 W"], bonne: 0 },
          { enonce: "Les pertes sont surtout…", choix: ["de la chaleur", "de la lumière", "de l'énergie utile"], bonne: 0 }
        ] },
      { id: "1si-s1-puis-global", titre: "Rendement global d'une chaîne",
        recto: "Comment calcule-t-on le rendement global d'une chaîne de puissance ?",
        verso: `<div class="formule">η<sub>g</sub> = η<sub>1</sub> × η<sub>2</sub> × … × η<sub>n</sub></div><div class="formule">P<sub>sortie</sub> = P<sub>entrée</sub> × η<sub>g</sub></div><ul><li>Ex. voiture RC : 72 W × 0,91 × 0,90 × 0,84 ≈ 49,5 W au différentiel</li><li>Aussi : η<sub>g</sub> = P<sub>sortie finale</sub> / P<sub>entrée</sub></li></ul><p class="astuce">On multiplie, on n'additionne pas : η<sub>g</sub> est plus petit que le plus petit des η.</p>`,
        quiz: [
          { enonce: "η<sub>1</sub> = 0,9 et η<sub>2</sub> = 0,8 → η<sub>g</sub> = …", choix: ["0,72", "1,7", "0,85"], bonne: 0 },
          { enonce: "η<sub>g</sub> est toujours…", choix: ["inférieur au plus petit η", "égal à la somme des η", "supérieur au plus grand η"], bonne: 0 }
        ] }
    ]
  });

  /* =====================================================================
     MODULE 3 — Énergies et puissances
     ===================================================================== */
  const FORM_MECA = ["E = ½·m·V²", "E = ½·J·ω²", "E = m·g·h", "E = ½·k·x²", "E = ½·k·α²"];
  const FORM_TOUT = FORM_MECA.concat(["E = m·V²", "E = ½·m·V", "E = m·g", "E = ½·C·U²", "E = Q·U", "E = m·c·Δθ"]);
  const CAS_FORM_MECA = [
    ["un véhicule en translation", 0], ["un volant d'inertie en rotation", 1], ["un solide soulevé à une certaine hauteur", 2],
    ["un ressort de traction-compression", 3], ["un ressort de torsion", 4]
  ];
  const FORM_ELEC = ["E = ½·C·U²", "E = ½·L·I²", "E = Q·U", "E = U·I", "E = C·U", "E = L·I", "E = ½·m·V²"];
  const CAS_FORM_ELEC = [
    ["un condensateur", "E = ½·C·U²"], ["le supercondensateur d'un bus électrique", "E = ½·C·U²"],
    ["une bobine (inductance)", "E = ½·L·I²"], ["la batterie d'une trottinette", "E = Q·U"], ["une pile AA", "E = Q·U"]
  ];
  const UM = [
    ["J, le moment d'inertie d'un volant", "kg·m²"], ["k, la raideur d'un ressort de traction", "N/m"],
    ["k, la raideur d'un ressort de torsion", "N·m/rad"], ["ω, la vitesse angulaire", "rad/s"],
    ["V, la vitesse dans E<sub>c</sub> = ½·m·V²", "m/s"], ["g, l'accélération de la pesanteur", "m/s²"],
    ["x, la variation de longueur d'un ressort dans E = ½·k·x²", "m"]
  ];
  const UM_POOL = ["kg·m²", "N/m", "N·m/rad", "rad/s", "m/s", "m/s²", "m", "kg", "N·m", "km/h", "tr/min", "J"];
  const UE = [
    ["C, la capacité d'un condensateur", "F (farad)", []], ["L, l'inductance d'une bobine", "H (henry)", []],
    ["Q, la capacité d'une batterie dans E = Q·U", "Ah (ampère-heure)", ["C (coulomb)"]],
    ["Q, la charge électrique dans Q = I·t (t en secondes)", "C (coulomb)", ["Ah (ampère-heure)"]],
    ["E dans E = Q·U, avec Q en Ah et U en V", "Wh (wattheure)", ["J (joule)"]]
  ];
  const UE_POOL = ["F (farad)", "H (henry)", "Ah (ampère-heure)", "C (coulomb)", "Wh (wattheure)", "W (watt)", "V (volt)", "A (ampère)", "Ω (ohm)", "J (joule)"];
  const TRANSF = [
    ["électrique", "mécanique", "Un moteur électrique"], ["mécanique", "électrique", "Un générateur (dynamo, alternateur)"],
    ["chimique", "électrique", "Une pile ou un accumulateur"], ["électrique", "chimique", "L'électrolyse (charge d'un accumulateur)"],
    ["électrique", "thermique", "L'effet Joule (radiateur, bouilloire)"], ["thermique", "électrique", "L'effet thermoélectrique"],
    ["chimique", "thermique", "La combustion"], ["thermique", "chimique", "Une réaction endothermique"],
    ["mécanique", "thermique", "Les frottements"], ["thermique", "mécanique", "Un moteur thermique"]
  ];
  const PROP = [
    ["E<sub>c</sub> = ½·m·V²", "la vitesse V", 2], ["E<sub>c</sub> = ½·m·V²", "la masse m", 1], ["E<sub>p</sub> = m·g·h", "la hauteur h", 1],
    ["E = ½·k·x²", "la compression x du ressort", 2], ["E<sub>c</sub> = ½·J·ω²", "la vitesse angulaire ω", 2], ["E<sub>c</sub> = ½·J·ω²", "le moment d'inertie J", 1]
  ];

  SIP.definirModule({
    id: "1si-s1-energie",
    niveaux: ["1SI"],
    sequence: "S1 · Chaîne de puissance",
    titre: "Énergies et puissances",
    description: "Calculer les énergies cinétique, potentielle, électrique et thermique, le travail d'une force et la puissance moyenne ; convertir J, Wh et kcal.",
    competences: ["A2", "M3", "E1"],
    nbQuestions: 10,
    questions: [
      // ---- Formes, unités, conservation ----
      { fiche: "1si-s1-ener-unites", gen: (r) => {
          if (r.int(0, 1)) { const x = r.pick([5, 12, 50, 100, 360, 500, 750]); return { enonce: `Convertis <b>${x} Wh</b> en kilojoules.`, reponse: x * 3.6, unite: "kJ", explication: `1 Wh = 3600 J → ${x} Wh = ${x} × 3600 = ${nb(x * 3600)} J = ${nb(x * 3.6)} kJ.` }; }
          const x = r.pick([0.5, 1.5, 2, 5, 10, 25]); return { enonce: `Convertis <b>${nb(x)} kWh</b> en mégajoules (MJ).`, reponse: x * 3.6, unite: "MJ", explication: `1 kWh = 1000 × 3600 J = 3,6 MJ → ${nb(x)} kWh = ${nb(x * 3.6)} MJ.` }; } },
      { fiche: "1si-s1-ener-unites", gen: (r) => { const Wh = r.pick([2, 5, 10, 15, 40, 60, 150]); const kJ = Wh * 3.6; return { enonce: `Un appareil a consommé <b>${nb(kJ)} kJ</b>. Combien cela fait-il en wattheures ?`, reponse: Wh, unite: "Wh", explication: `1 Wh = 3,6 kJ → ${nb(kJ)} / 3,6 = ${Wh} Wh.` }; } },
      { fiche: "1si-s1-ener-unites", gen: (r) => { const kcal = r.pas(100, 500, 10); return { enonce: `Une barre de céréales apporte <b>${kcal} kcal</b>. Énergie en kJ ? (1 Ca = 4,185 J)`, reponse: kcal * 4.185, unite: "kJ", explication: `${kcal} kcal = ${kcal} × 1000 × 4,185 J = ${nb(kcal * 4185, 7)} J = ${nb(kcal * 4.185, 6)} kJ.` }; } },
      { fiche: "1si-s1-ener-unites", gen: (r) => { const P = r.pas(100, 250, 25), t = r.pick([15, 30, 45, 60, 90]); const E = P * t * 60; return { enonce: `Un cycliste développe <b>${P} W</b> pendant <b>${t} min</b> sur un vélo d'entraînement. Énergie mécanique fournie, en kcal ? (1 Ca = 4,185 J)`, reponse: E / 4185, unite: "kcal", explication: `E = P·Δt = ${P} × ${t * 60} = ${nb(E)} J ; ${nb(E)} / 4185 = ${nb(E / 4185)} kcal.` }; } },
      { fiche: "1si-s1-ener-unites", gen: (r) => { const S = r.pick([["Une lampe à incandescence", "de lumière", 0.03, 0.1], ["Une lampe à LED", "de lumière", 0.25, 0.4], ["Un moteur électrique", "d'énergie mécanique", 0.7, 0.9], ["Un chargeur de téléphone", "d'énergie électrique à la batterie", 0.75, 0.9]]); const Ea = r.pas(100, 1000, 50), Eu = Math.round(Ea * r.pas(S[2], S[3], 0.01)); return { enonce: `${S[0]} reçoit <b>E<sub>a</sub> = ${Ea} J</b> et fournit <b>${Eu} J</b> ${S[1]}. Énergie perdue (chaleur) ?`, reponse: Ea - Eu, unite: "J", explication: `Conservation de l'énergie : E<sub>a</sub> = E<sub>u</sub> + E<sub>p</sub> → E<sub>p</sub> = ${Ea} − ${Eu} = ${Ea - Eu} J.` }; } },
      { fiche: "1si-s1-ener-unites", gen: (r) => { const [a, b, c] = r.pick(TRANSF); return qcm(r, `Quel convertisseur (ou phénomène) transforme l'énergie <b>${a}</b> en énergie <b>${b}</b> ?`, c, TRANSF.map((x) => x[2]), `${c} : énergie ${a} → énergie ${b}.`); } },
      { type: "qcm", fiche: "1si-s1-ener-unites", enonce: "Quelle est l'unité d'énergie du Système international ?", choix: ["Le joule (J)", "Le watt (W)", "Le wattheure (Wh)", "La calorie (Ca)"], bonne: 0, explication: "Le joule est l'unité SI. Le Wh et la calorie mesurent aussi une énergie mais ne sont pas SI ; le watt est une unité de puissance." },
      { type: "qcm", fiche: "1si-s1-ener-unites", enonce: "« Rien ne se perd, rien ne se crée, tout se transforme » signifie que…", choix: ["La somme des énergies entrantes est égale à la somme des énergies sortantes (utile + pertes)", "L'énergie utile est égale à l'énergie absorbée", "Un système peut fournir plus d'énergie qu'il n'en reçoit", "L'énergie perdue disparaît"], bonne: 0, explication: "Principe de conservation : ΣE<sub>entrantes</sub> = ΣE<sub>sortantes</sub>. Les pertes ne disparaissent pas : elles sont transformées (souvent en chaleur)." },
      { type: "qcm", fiche: "1si-s1-ener-unites", enonce: "Le wattheure (Wh) est une unité de…", choix: ["Énergie", "Puissance", "Charge électrique", "Durée"], bonne: 0, explication: "Wh = watt × heure : une puissance multipliée par une durée, donc une énergie (1 Wh = 3600 J)." },
      // ---- Énergies mécaniques ----
      { fiche: "1si-s1-ener-meca", gen: (r) => { const [s, m0, m1, v0, v1] = r.pick([["Une trottinette électrique et son usager", 80, 110, 3, 7], ["Un Segway et son utilisateur", 90, 130, 2, 5.5], ["Un skateboard électrique et son rider", 60, 95, 4, 8], ["Un vélo à assistance électrique et son cycliste", 85, 120, 4, 7]]); const m = r.pas(m0, m1, 5), V = r.pas(v0, v1, 0.5); const E = 0.5 * m * V * V; return { enonce: `${s} (masse totale <b>m = ${m} kg</b>) roule à <b>V = ${nb(V)} m/s</b>. Énergie cinétique ?`, reponse: E, unite: "J", explication: `E<sub>c</sub> = ½·m·V² = 0,5 × ${m} × ${nb(V)}² = ${nb(E, 6)} J.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const [s, m0, m1, pas, vs] = r.pick([["Une voiture citadine", 900, 1400, 50, [30, 50, 70, 90]], ["Un scooter électrique avec son conducteur", 150, 220, 10, [25, 36, 45]], ["Un bus électrique", 12000, 18000, 500, [30, 36, 50]]]); const m = r.pas(m0, m1, pas), Vk = r.pick(vs), V = Vk / 3.6; const E = 0.5 * m * V * V; return { enonce: `${s} de masse <b>${m} kg</b> roule à <b>${Vk} km/h</b>. Énergie cinétique en <b>kJ</b> ?`, reponse: E / 1000, unite: "kJ", explication: `V = ${Vk} / 3,6 = ${nb(V)} m/s ; E<sub>c</sub> = ½·m·V² = 0,5 × ${m} × ${nb(V)}² = ${nb(E)} J = ${nb(E / 1000)} kJ.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const m = r.pas(70, 120, 5), V = r.pas(2, 8, 0.5); const E = Math.round(0.5 * m * V * V); const Vr = Math.sqrt(2 * E / m); return { enonce: `Une trottinette et son usager (<b>m = ${m} kg</b>) possèdent une énergie cinétique <b>E<sub>c</sub> = ${nb(E)} J</b>. Vitesse ?`, reponse: Vr, unite: "m/s", explication: `V = √(2·E<sub>c</sub> / m) = √(2 × ${nb(E)} / ${m}) = ${nb(Vr)} m/s (soit ${nb(Vr * 3.6, 3)} km/h).` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const m = r.pas(60, 100, 5), h = r.pas(10, 150, 10); const E = m * g * h; return { enonce: `Un cycliste et son vélo (<b>m = ${m} kg</b>) gravissent une côte de dénivelé <b>h = ${h} m</b>. Énergie potentielle gagnée (en kJ) ? (g = 9,81 m/s²)`, reponse: E / 1000, unite: "kJ", explication: `E<sub>p</sub> = m·g·h = ${m} × 9,81 × ${h} = ${nb(E, 7)} J = ${nb(E / 1000, 6)} kJ.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const m = r.pas(100, 800, 50), h = r.pas(2, 20, 0.5); const Ek = Number((m * g * h / 1000).toPrecision(3)); const hr = Ek * 1000 / (m * g); return { enonce: `Une grue soulève une charge de <b>${m} kg</b> et lui fournit <b>E<sub>p</sub> = ${nb(Ek)} kJ</b>. De quelle hauteur l'a-t-elle levée ? (g = 9,81 m/s²)`, reponse: hr, unite: "m", explication: `h = E<sub>p</sub> / (m·g) = ${nb(Ek * 1000)} / (${m} × 9,81) = ${nb(hr)} m.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const J = r.pick([0.02, 0.05, 0.1, 0.2, 0.5]), N = r.pick([300, 600, 1000, 1500, 2000, 3000]); const w = N * 2 * PI / 60, E = 0.5 * J * w * w; return { enonce: `Le volant d'inertie d'un vélo d'entraînement (<b>J = ${nb(J)} kg·m²</b>) tourne à <b>N = ${N} tr/min</b>. Énergie cinétique stockée ?`, reponse: E, unite: "J", tolerance: 3, explication: `ω = ${N} × 2π / 60 = ${nb(w)} rad/s ; E<sub>c</sub> = ½·J·ω² = 0,5 × ${nb(J)} × ${nb(w)}² = ${nb(E)} J.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const k = r.pick([200, 500, 800, 1000, 2000, 5000]), x = r.pas(10, 80, 5); const E = 0.5 * k * (x / 1000) ** 2; return { enonce: `Un ressort de raideur <b>k = ${k} N/m</b> est comprimé de <b>x = ${x} mm</b>. Énergie potentielle élastique stockée ?`, reponse: E, unite: "J", explication: `x = ${x} mm = ${nb(x / 1000)} m ; E = ½·k·x² = 0,5 × ${k} × ${nb(x / 1000)}² = ${nb(E)} J.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const h = r.pas(2, 40, 1); const V = Math.sqrt(2 * g * h); return { enonce: `Un wagonnet de montagnes russes part sans vitesse d'une hauteur <b>h = ${h} m</b>. Frottements négligés, quelle est sa vitesse en bas ? (g = 9,81 m/s²)`, reponse: V, unite: "m/s", explication: `Conservation : m·g·h = ½·m·V² → V = √(2·g·h) = √(2 × 9,81 × ${h}) = ${nb(V)} m/s.` }; } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const [t, i] = r.pick(CAS_FORM_MECA); return qcm(r, `Quelle formule donne l'énergie stockée dans <b>${t}</b> ?`, FORM_MECA[i], FORM_TOUT, `D'après le tableau des énergies : ${t} → ${FORM_MECA[i]}.`); } },
      { fiche: "1si-s1-ener-meca", gen: (r) => { const [x, u] = r.pick(UM); return qcm(r, `Quelle est l'unité de <b>${x}</b> ?`, u, UM_POOL, `${x.charAt(0)} s'exprime en ${u}.`); } },
      { fiche: "1si-s1-ener-meca", gen: (r) => {
          const [f, gr, ex] = r.pick(PROP); const k = r.pick([3, 4, 5, 10]);
          const ch = [`× ${k * k}`, `× ${k}`, `÷ ${k}`, `× ${2 * k}`]; const b = ex === 2 ? 0 : 1;
          return { type: "qcm", enonce: `Avec ${f}, si l'on multiplie <b>${gr} par ${k}</b> (le reste inchangé), l'énergie est multipliée par…`, choix: [ch[b]].concat(ch.filter((_, j) => j !== b)), bonne: 0, explication: ex === 2 ? `${gr.charAt(0).toUpperCase() + gr.slice(1)} est au carré : l'énergie est multipliée par ${k}² = ${k * k}.` : `L'énergie est proportionnelle à ${gr} : elle est multipliée par ${k}.` }; } },
      { type: "qcm", fiche: "1si-s1-ener-meca", enonce: "Dans E<sub>c</sub> = ½·m·V², la vitesse V doit être exprimée en…", choix: ["m/s", "km/h", "rad/s", "tr/min"], bonne: 0, explication: "Unités SI : m en kg et V en m/s donnent E en joules. Une vitesse en km/h se divise par 3,6." },
      { type: "qcm", fiche: "1si-s1-ener-meca", enonce: "Un élève calcule l'énergie cinétique d'une voiture de 1000 kg à 36 km/h : ½ × 1000 × 36² = 648 000 J. Quelle est son erreur ?", choix: ["Il n'a pas converti 36 km/h en 10 m/s (E<sub>c</sub> = 50 000 J)", "Il fallait utiliser g = 9,81", "Il a oublié le ½", "Aucune, le résultat est juste"], bonne: 0, explication: "V = 36 / 3,6 = 10 m/s ; E<sub>c</sub> = 0,5 × 1000 × 10² = 50 000 J." },
      // ---- Énergies électriques ----
      { fiche: "1si-s1-ener-elec", gen: (r) => { const [s, U, Qs] = r.pick([["d'une trottinette électrique", 36, [7.5, 10, 12.5, 15]], ["d'un vélo à assistance électrique", 36, [10, 11.6, 13, 14]], ["d'un skateboard électrique", 24, [4, 5, 6, 8]], ["d'un gyropode", 48, [5, 8, 10]], ["d'une voiture radiocommandée", 7.2, [3, 4, 5]]]); const Q = r.pick(Qs); return { enonce: `La batterie ${s} a une tension <b>U = ${nb(U)} V</b> et une capacité <b>Q = ${nb(Q)} Ah</b>. Énergie stockée (en Wh) ?`, reponse: Q * U, unite: "Wh", explication: `E = Q·U = ${nb(Q)} × ${nb(U)} = ${nb(Q * U)} Wh.` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const U = r.pick([12, 24, 36, 48]), Q = r.pick([2, 5, 7, 10, 12, 20]); const Wh = Q * U; return { enonce: `Une batterie <b>${U} V – ${Q} Ah</b> est complètement chargée. Énergie stockée en <b>kJ</b> ?`, reponse: Wh * 3.6, unite: "kJ", explication: `E = Q·U = ${Q} × ${U} = ${Wh} Wh ; 1 Wh = 3600 J → E = ${Wh} × 3600 = ${nb(Wh * 3600, 7)} J = ${nb(Wh * 3.6, 6)} kJ.` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const I = r.pas(0.5, 5, 0.5);
          if (r.int(0, 1)) { const t = r.pas(0.5, 6, 0.5); return { enonce: `Un chargeur fournit un courant constant <b>I = ${nb(I)} A</b> pendant <b>${nb(t)} h</b>. Charge électrique apportée à la batterie (en Ah) ?`, reponse: I * t, unite: "Ah", explication: `Q = I·t = ${nb(I)} × ${nb(t)} = ${nb(I * t)} Ah.` }; }
          const t = r.pick([30, 60, 90, 120, 300]); return { enonce: `Un courant <b>I = ${nb(I)} A</b> circule pendant <b>${t} s</b>. Charge électrique transportée (en coulombs) ?`, reponse: I * t, unite: "C", explication: `Q = I·t = ${nb(I)} × ${t} = ${nb(I * t)} C (t en secondes).` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const Q = r.pick([7.5, 10, 12.5, 15]), P = r.pick([150, 200, 250, 300, 350]); const E = Q * 36, t = E / P; return { enonce: `Trottinette : batterie <b>36 V – ${nb(Q)} Ah</b>, puissance moyenne consommée <b>${P} W</b>. Autonomie (en heures) ?`, reponse: t, unite: "h", explication: `E = Q·U = ${nb(Q)} × 36 = ${nb(E)} Wh ; t = E / P = ${nb(E)} / ${P} = ${nb(t)} h (≈ ${nb(t * 60, 3)} min).` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const C = r.pick([100, 350, 500, 1000, 3000]), U = r.pick([2.5, 2.7, 3]); const E = 0.5 * C * U * U; return { enonce: `Un supercondensateur de capacité <b>C = ${C} F</b> est chargé sous <b>U = ${nb(U)} V</b>. Énergie stockée ?`, reponse: E, unite: "J", explication: `E = ½·C·U² = 0,5 × ${C} × ${nb(U)}² = ${nb(E)} J.` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const L = r.pick([1, 2, 5, 10, 20, 50]), I = r.pas(1, 10, 0.5); const E = 0.5 * L * 1e-3 * I * I; return { enonce: `Une bobine d'inductance <b>L = ${L} mH</b> est parcourue par <b>I = ${nb(I)} A</b>. Énergie stockée (en mJ) ?`, reponse: E * 1000, unite: "mJ", explication: `E = ½·L·I² = 0,5 × ${nb(L * 1e-3)} × ${nb(I)}² = ${nb(E)} J = ${nb(E * 1000)} mJ.` }; } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const [t, f] = r.pick(CAS_FORM_ELEC); return qcm(r, `Quelle formule donne l'énergie stockée dans <b>${t}</b> ?`, f, FORM_ELEC, `${t.charAt(0).toUpperCase() + t.slice(1)} : ${f}. Attention, U·I est une puissance, pas une énergie.`); } },
      { fiche: "1si-s1-ener-elec", gen: (r) => { const [x, u, excl] = r.pick(UE); return qcm(r, `Quelle est l'unité de <b>${x}</b> ?`, u, UE_POOL.filter((p) => excl.indexOf(p) < 0), `${x.split(",")[0]} s'exprime en ${u}.`); } },
      { type: "qcm", fiche: "1si-s1-ener-elec", enonce: "Dans E = Q·U, avec Q en Ah et U en V, l'énergie E est obtenue en…", choix: ["Wh", "J", "W", "Ah"], bonne: 0, explication: "Ah × V = Wh. Pour l'avoir en joules, on multiplie par 3600." },
      { type: "qcm", fiche: "1si-s1-ener-elec", enonce: "Ordre de grandeur de l'énergie stockée dans une batterie de trottinette (36 V, 10 Ah) ?", choix: ["≈ 0,4 kWh", "≈ 4 kWh", "≈ 40 Wh", "≈ 4 Wh"], bonne: 0, explication: "E = 10 × 36 = 360 Wh ≈ 0,4 kWh (environ 1,3 MJ)." },
      // ---- Énergie thermique ----
      { fiche: "1si-s1-ener-therm", gen: (r) => { const V = r.pick([100, 150, 200, 300]), T1 = r.pick([18, 20, 22, 25]), T2 = r.pick([45, 50, 55, 60]); const E = V * 4185 * (T2 - T1); return { enonce: `Un chauffe-eau solaire chauffe <b>${V} L</b> d'eau de <b>${T1} °C à ${T2} °C</b> (c = 4185 J/(kg·K), 1 L ≈ 1 kg). Énergie reçue par l'eau (en kWh) ?`, reponse: E / 3.6e6, unite: "kWh", explication: `ΔE = m·c·(T<sub>2</sub> − T<sub>1</sub>) = ${V} × 4185 × ${T2 - T1} = ${nb(E, 8)} J ; ÷ 3 600 000 → ${nb(E / 3.6e6)} kWh.` }; } },
      { fiche: "1si-s1-ener-therm", gen: (r) => { const m = r.pick([0.5, 1, 1.5, 2]), d0 = r.pas(10, 70, 1); const E = Math.round(m * 4185 * d0 / 1e4) * 10; const dT = E * 1000 / (m * 4185); return { enonce: `On fournit <b>${E} kJ</b> à <b>${nb(m)} kg</b> d'eau (c = 4185 J/(kg·K)), sans pertes. Élévation de température (en °C) ?`, reponse: dT, unite: "°C", explication: `ΔT = ΔE / (m·c) = ${nb(E * 1000)} / (${nb(m)} × 4185) = ${nb(dT)} °C (un écart de ${nb(dT)} K).` }; } },
      { fiche: "1si-s1-ener-therm", gen: (r) => { const m = r.pas(4, 10, 0.5), dT = r.pas(30, 200, 10); const E = m * 460 * dT; return { enonce: `Lors d'un freinage, un disque de frein en acier (<b>m = ${nb(m)} kg</b>, c = 460 J/(kg·K)) s'échauffe de <b>${dT} °C</b>. Énergie thermique absorbée (en kJ) ?`, reponse: E / 1000, unite: "kJ", explication: `ΔE = m·c·ΔT = ${nb(m)} × 460 × ${dT} = ${nb(E, 7)} J = ${nb(E / 1000, 6)} kJ (issus de l'énergie cinétique du véhicule).` }; } },
      { fiche: "1si-s1-ener-therm", gen: (r) => {
          const P = r.pick([1800, 2000, 2200, 2400]), m = r.pick([0.5, 1, 1.5]), T1 = r.pick([20, 22, 25, 28]), T2 = r.pick([80, 90, 100]);
          const Eu = m * 4185 * (T2 - T1); const t = Math.round(Eu / (P * r.pas(0.8, 0.92, 0.01)) / 5) * 5; const eta = Eu / (P * t);
          return { enonce: `Essai d'une bouilloire (eau : c = 4185 J/(kg·K)) : <table><tr><td>Puissance électrique</td><td>${P} W</td></tr><tr><td>Masse d'eau</td><td>${nb(m)} kg</td></tr><tr><td>Température initiale</td><td>${T1} °C</td></tr><tr><td>Température finale</td><td>${T2} °C</td></tr><tr><td>Durée de chauffe</td><td>${t} s</td></tr></table> Rendement de la bouilloire (en %) ?`, reponse: 100 * eta, unite: "%", explication: `E<sub>u</sub> = m·c·ΔT = ${nb(m)} × 4185 × ${T2 - T1} = ${nb(Eu, 7)} J ; E<sub>a</sub> = P·Δt = ${P} × ${t} = ${nb(P * t, 7)} J ; η = E<sub>u</sub> / E<sub>a</sub> = ${nb(100 * eta, 3)} %.` }; } },
      { type: "qcm", fiche: "1si-s1-ener-therm", enonce: "Quelle formule donne l'énergie reçue par l'eau d'un chauffe-eau solaire ?", choix: ["ΔE = m·c·(T<sub>2</sub> − T<sub>1</sub>)", "ΔE = ½·m·V²", "ΔE = m·g·h", "ΔE = c·(T<sub>2</sub> − T<sub>1</sub>)"], bonne: 0, explication: "Énergie thermique (chaleur sensible) : masse × capacité thermique massique × variation de température." },
      { type: "qcm", fiche: "1si-s1-ener-therm", enonce: "Dans ΔE = m·c·(T<sub>2</sub> − T<sub>1</sub>), c est…", choix: ["La capacité thermique massique, en J/(kg·K)", "La vitesse de la lumière", "La capacité de la batterie, en Ah", "La chaleur perdue, en W"], bonne: 0, explication: "c indique l'énergie à fournir pour élever de 1 K la température de 1 kg du corps (eau : ≈ 4185 J/(kg·K))." },
      { type: "qcm", fiche: "1si-s1-ener-therm", enonce: "L'eau passe de 20 °C à 50 °C. La variation de température T<sub>2</sub> − T<sub>1</sub> vaut…", choix: ["30 K", "303 K", "243 K", "0,3 K"], bonne: 0, explication: "Un écart de 1 °C est égal à un écart de 1 K : ΔT = 30 °C = 30 K. On n'ajoute 273 qu'à une température, jamais à une différence." },
      // ---- Puissance moyenne et travail ----
      { fiche: "1si-s1-ener-puis", gen: (r) => { const W = r.pas(2, 60, 1), t = r.pick([10, 20, 30, 45, 60, 120]); return { enonce: `Le moteur d'un treuil fournit un travail de <b>${W} kJ</b> en <b>${t} s</b>. Puissance moyenne ?`, reponse: W * 1000 / t, unite: "W", explication: `P = W / Δt = ${W * 1000} / ${t} = ${nb(W * 1000 / t)} W.` }; } },
      { fiche: "1si-s1-ener-puis", gen: (r) => { const S = r.pick([["Un climatiseur", [800, 1000, 1200, 1500]], ["Un chauffe-eau électrique", [1500, 2000, 2400, 3000]], ["Un réfrigérateur", [100, 150, 200]], ["Une pompe de piscine", [500, 750, 1100]]]); const P = r.pick(S[1]), t = r.pas(0.5, 8, 0.5); return { enonce: `${S[0]} de <b>${P} W</b> fonctionne pendant <b>${nb(t)} h</b>. Énergie consommée (en kWh) ?`, reponse: P * t / 1000, unite: "kWh", explication: `W = P·Δt = ${P} × ${nb(t)} = ${nb(P * t)} Wh = ${nb(P * t / 1000)} kWh.` }; } },
      { fiche: "1si-s1-ener-puis", gen: (r) => { const F = r.pas(20, 200, 10), d = r.pas(5, 100, 5), a = r.pick([0, 15, 20, 30, 45, 60]); const ca = Math.cos(a * PI / 180), W = F * d * ca; return { enonce: `On tire une remorque de vélo avec une force <b>F = ${F} N</b> inclinée de <b>α = ${a}°</b> par rapport au déplacement, sur <b>d = ${d} m</b>. Travail de la force ?`, reponse: W, unite: "J", explication: `W = F·d·cos α = ${F} × ${d} × cos ${a}° = ${F} × ${d} × ${nb(ca, 3)} = ${nb(W)} J.` }; } },
      { fiche: "1si-s1-ener-puis", gen: (r) => { const C = r.pas(0.5, 20, 0.5), n = r.pick([2, 5, 10, 20, 50, 100]); const th = 2 * PI * n, W = C * th; return { enonce: `Un moteur exerce un couple constant <b>C = ${nb(C)} N·m</b> pendant <b>${n} tours</b>. Travail fourni ?`, reponse: W, unite: "J", explication: `θ = ${n} × 2π = ${nb(th)} rad ; W = C·θ = ${nb(C)} × ${nb(th)} = ${nb(W)} J.` }; } },
      { fiche: "1si-s1-ener-puis", gen: (r) => {
          if (r.int(0, 1)) { const ch = r.pick([4, 8, 50, 75, 90, 110, 150]); return { enonce: `Un moteur a une puissance de <b>${ch} ch</b>. Puissance en kW ? (1 Ch = 736 W)`, reponse: ch * 0.736, unite: "kW", explication: `P = ${ch} × 736 = ${nb(ch * 736)} W = ${nb(ch * 0.736)} kW.` }; }
          const kW = r.pick([3, 5.5, 11, 45, 66, 100]); return { enonce: `Un moteur électrique de <b>${nb(kW)} kW</b> : combien de chevaux (ch) ? (1 Ch = 736 W)`, reponse: kW * 1000 / 736, unite: "ch", explication: `P = ${nb(kW * 1000)} / 736 = ${nb(kW * 1000 / 736)} ch.` }; } },
      { fiche: "1si-s1-ener-puis", gen: (r) => { const m = r.pas(65, 100, 5), h = r.pas(20, 100, 10), t = r.pick([4, 5, 6, 8, 10, 12]); const E = m * g * h, P = E / (t * 60); return { enonce: `Un cycliste et son vélo (<b>${m} kg</b>) gravissent <b>${h} m</b> de dénivelé en <b>${t} min</b>. Puissance moyenne nécessaire pour cette montée (frottements négligés, g = 9,81 m/s²) ?`, reponse: P, unite: "W", explication: `E<sub>p</sub> = m·g·h = ${m} × 9,81 × ${h} = ${nb(E, 7)} J ; P = E<sub>p</sub> / Δt = ${nb(E, 7)} / ${t * 60} = ${nb(P)} W.` }; } },
      { type: "qcm", fiche: "1si-s1-ener-puis", enonce: "On effectue le même travail deux fois plus vite. La puissance moyenne…", choix: ["Double", "Est divisée par 2", "Ne change pas", "Est multipliée par 4"], bonne: 0, explication: "P = W / Δt : même W, Δt divisé par 2 → P multipliée par 2." },
      { type: "qcm", fiche: "1si-s1-ener-puis", enonce: "Le travail d'une force perpendiculaire au déplacement est…", choix: ["Nul", "Maximal", "Égal à F × d", "Égal à F / d"], bonne: 0, explication: "W = F·d·cos α avec α = 90° : cos 90° = 0, donc W = 0 J." },
      { type: "qcm", fiche: "1si-s1-ener-puis", enonce: "Un appareil de 1 kW fonctionne pendant 1 h. Il consomme…", choix: ["1 kWh, soit 3,6 MJ", "1 kW", "3600 J", "1000 J"], bonne: 0, explication: "W = P·Δt = 1000 W × 3600 s = 3 600 000 J = 1 kWh. Le kW est une puissance, pas une énergie." }
    ],
    fiches: [
      { id: "1si-s1-ener-unites", titre: "Unités d'énergie et conservation",
        recto: "Quelles unités d'énergie faut-il connaître et que dit le principe de conservation ?",
        verso: `<div class="formule">1 Wh = 3600 J · 1 kWh = 3,6 MJ · 1 Ca = 4,185 J</div><ul><li>Unité SI : le <b>joule</b> (J)</li><li>Conservation : ΣE<sub>entrantes</sub> = ΣE<sub>sortantes</sub> (« rien ne se perd, rien ne se crée, tout se transforme »)</li><li>E<sub>a</sub> = E<sub>u</sub> + E<sub>p</sub> ; ex. lampe : 100 J → 3 J de lumière + 97 J de chaleur</li><li>Moteur : élec → méca ; effet Joule : élec → thermique</li></ul><p class="astuce">Wh = watt × heure : 1 W pendant 3600 s.</p>`,
        quiz: [
          { enonce: "1 Wh = …", choix: ["3600 J", "1000 J", "60 J"], bonne: 0 },
          { enonce: "Lampe : 100 J absorbés, 3 J de lumière. Chaleur ?", choix: ["97 J", "103 J", "3 J"], bonne: 0 },
          { enonce: "Unité SI de l'énergie :", choix: ["le joule", "le watt", "le wattheure"], bonne: 0 }
        ] },
      { id: "1si-s1-ener-meca", titre: "Énergies mécaniques",
        recto: "Quelles formules donnent les énergies cinétique, potentielle et élastique ?",
        verso: `<div class="formule">E<sub>c</sub> = ½·m·V² · E<sub>c</sub> = ½·J·ω²</div><div class="formule">E<sub>p</sub> = m·g·h · E = ½·k·x² (ressort)</div><ul><li>m (kg), V (m/s), J (kg·m²), ω (rad/s), g = 9,81 m/s², h (m), k (N/m), x (m)</li><li>Ressort de torsion : E = ½·k·α² (α en rad)</li></ul><p class="astuce">V au carré : vitesse × 2 → énergie × 4. km/h ÷ 3,6 → m/s.</p>`,
        quiz: [
          { enonce: "Vitesse doublée → E<sub>c</sub>…", choix: ["× 4", "× 2", "inchangée"], bonne: 0 },
          { enonce: "E<sub>p</sub> de 10 kg à 2 m (g ≈ 10 m/s²) :", choix: ["200 J", "20 J", "100 J"], bonne: 0 },
          { enonce: "36 km/h = …", choix: ["10 m/s", "129,6 m/s", "3,6 m/s"], bonne: 0 }
        ] },
      { id: "1si-s1-ener-elec", titre: "Énergies électriques stockées",
        recto: "Comment calcule-t-on l'énergie d'une batterie, d'un condensateur, d'une bobine ?",
        verso: `<div class="formule">Batterie : E = Q·U · Q = I·t</div><div class="formule">Condensateur : E = ½·C·U² · Bobine : E = ½·L·I²</div><ul><li>Q en Ah et U en V → E en <b>Wh</b> (× 3600 → J)</li><li>Q en C (A·s) → E en J ; C en F ; L en H</li><li>Ex. 36 V × 10 Ah = 360 Wh</li></ul><p class="astuce">Autonomie ≈ E (Wh) / P (W), en heures.</p>`,
        quiz: [
          { enonce: "Batterie 12 V, 5 Ah : E = …", choix: ["60 Wh", "2,4 Wh", "17 Wh"], bonne: 0 },
          { enonce: "2 A pendant 3 h → Q = …", choix: ["6 Ah", "1,5 Ah", "5 Ah"], bonne: 0 },
          { enonce: "Énergie d'un condensateur :", choix: ["½·C·U²", "C·U", "½·L·I²"], bonne: 0 }
        ] },
      { id: "1si-s1-ener-therm", titre: "Énergie thermique",
        recto: "Quelle énergie faut-il pour faire varier la température d'un corps ?",
        verso: `<div class="formule">ΔE<sub>th</sub> = m·c·(T<sub>2</sub> − T<sub>1</sub>)</div><ul><li>m (kg) ; c : capacité thermique massique (J/(kg·K))</li><li>T en K ou en °C : seule la <b>différence</b> compte</li><li>Eau : c ≈ 4185 J/(kg·K) ; 1 L d'eau ≈ 1 kg</li><li>Ex. chauffe-eau solaire, bouilloire, disque de frein</li></ul><p class="astuce">Un écart de 30 °C = un écart de 30 K : on n'ajoute pas 273 à une différence.</p>`,
        quiz: [
          { enonce: "Un écart de 10 °C vaut…", choix: ["10 K", "283 K", "263 K"], bonne: 0 },
          { enonce: "Chauffer 1 kg d'eau de 1 °C demande environ…", choix: ["4185 J", "1 J", "4,185 J"], bonne: 0 }
        ] },
      { id: "1si-s1-ener-puis", titre: "Puissance moyenne et travail",
        recto: "Comment relier puissance, énergie (travail) et durée ?",
        verso: `<div class="formule">P = W / Δt · W = P·Δt</div><div class="formule">W = F·d·cos α · W = C·θ</div><ul><li>P (W), W (J), Δt (s) ; d (m), θ (rad) ; 1 tour = 2π rad</li><li>P = F·V · P = C·ω · 1 Ch = 736 W</li></ul><p class="astuce">Force perpendiculaire au déplacement : cos 90° = 0 → travail nul.</p>`,
        quiz: [
          { enonce: "600 J en 10 s → P = …", choix: ["60 W", "6000 W", "0,017 W"], bonne: 0 },
          { enonce: "F = 100 N sur 5 m, α = 0° → W = …", choix: ["500 J", "20 J", "0 J"], bonne: 0 },
          { enonce: "1 Ch = …", choix: ["736 W", "1000 W", "3600 W"], bonne: 0 }
        ] }
    ]
  });
})();
