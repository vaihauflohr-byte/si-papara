/* =====================================================================
   Atelier schémas — le MOTEUR DE SIMULATION (aucun accès à la page : marche aussi dans Node)
   Principe :
   - chaque borne est un nœud ; les fils et les contacts fermés réunissent des nœuds (union-find) ;
   - les repères de potentiel (L, N, L1…, +24 V, 0 V, PE) et le secondaire d'un transformateur alimenté
     imposent un potentiel à leur nœud ;
   - un récepteur (bobine, voyant, primaire de transformateur) fonctionne quand ses deux bornes sont
     sur la bonne paire de potentiels (230 V entre phase et neutre, 400 V entre deux phases…) ;
   - les contacts dépendent des bobines : on recommence jusqu'à ce que plus rien ne bouge (point fixe),
     un changement d'enclenchement à la fois (les retombées d'abord) ; un état déjà vu = oscillation ;
   - deux potentiels différents réunis sans récepteur entre eux = court-circuit : la protection la plus
     petite sur le chemin déclenche (fusible, disjoncteur) ; sans protection, toute l'alimentation est coupée ;
   - temporisations et échauffement des moteurs en temps simulé (avancer(ms)) : les essais utilisent une
     horloge fictive, la page avance au rythme de l'écran.
   Automate (API) : ses entrées lisent le 24 V continu entre Ix et COM, ses sorties à relais ferment
   Cx-Qx ; après chaque point fixe, l'automate fait ses cycles, et si une sortie change on recommence.
   Variateur : alimenté par L1, L2, L3, il fournit U, V, W (fréquence variable, rampes ACC/DEC, sens
   par l'ordre des phases) ; ses entrées LI1…LI4 lisent son +24 V ; la consigne vient de AI1 (0-10 V),
   de la molette ou des vitesses présélectionnées. Les tensions analogiques (0-10 V) sont calculées à part.
   Prévu pour plus tard : un système animé n'aura qu'à agir sur les appareils (action()) et à lire l'état (etat()).
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;
  const SA = (typeof module === "object" && module.exports) ? require("./automate.js") : g.SchemasAutomate;

  /* ---------- appareils ---------- */
  const PRINCIPAL = { bobine: "contacteur", relais: "relais", tempo_travail: "travail", tempo_repos: "repos", thermique: "thermique",
    sectionneur: "sectionneur", disjoncteur: "disjoncteur", disj_moteur: "disj_moteur", fusible: "fusible",
    bp_no: "bouton", bp_nf: "bouton", arret_urgence: "au", selecteur: "selecteur", interrupteur: "interrupteur",
    fdc_no: "fdc", fdc_nf: "fdc", capteur: "capteur", transfo: "transfo", voyant: "voyant", moteur: "moteur", moteur6: "moteur",
    automate: "automate", variateur: "variateur", potentiometre: "potentiometre", capteur3: "capteur", chariot: "chariot", cuve: "cuve", tapis: "tapis", tri: "tri", electrovanne: "electrovanne",
    barriere: "barriere", montecharge: "montecharge", station: "station" };
  const MULTI = new Set(["bouton", "au", "selecteur", "interrupteur", "fdc", "capteur"]);   // plusieurs contacts pour un même appareil
  const A_BOBINE = new Set(["contacteur", "relais", "travail", "repos"]);
  const NOM_SORTE = { contacteur: "le contacteur", relais: "le relais", travail: "le relais temporisé", repos: "le relais temporisé",
    thermique: "le relais thermique", sectionneur: "le sectionneur", disjoncteur: "le disjoncteur", disj_moteur: "le disjoncteur-moteur",
    fusible: "le fusible", bouton: "le bouton", au: "l'arrêt d'urgence", selecteur: "le sélecteur", interrupteur: "l'interrupteur",
    fdc: "le fin de course", capteur: "le capteur", transfo: "le transformateur", voyant: "le voyant", moteur: "le moteur",
    automate: "l'automate", variateur: "le variateur", potentiometre: "le potentiomètre", chariot: "le chariot", cuve: "la cuve", tapis: "le tapis", tri: "le tapis de tri", electrovanne: "l'électrovanne",
    barriere: "la barrière", montecharge: "le monte-charge", station: "la station de pompage" };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nf1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

  /* ---------- potentiels ---------- */
  const BASE = {
    L1: { chaud: true, net: "R", ph: 0, nom: "L1" }, L2: { chaud: true, net: "R", ph: 1, nom: "L2" }, L3: { chaud: true, net: "R", ph: 2, nom: "L3" },
    N: { chaud: false, net: "R", nom: "N" }, PE: { chaud: false, net: "PE", nom: "PE (terre)" },
    "+24": { chaud: true, net: "DC", nom: "+24 V" }, "0V": { chaud: false, net: "DC", nom: "0 V" } };
  const POT_ALIM = { L: "L1", N: "N", L1: "L1", L2: "L2", L3: "L3", "+24": "+24", "0V": "0V", PE: "PE" };
  function lireTension(t) { const m = /^(\d+)([~=])$/.exec(String(t || "")); return m ? { v: +m[1], ac: m[2] === "~" } : { v: 230, ac: true }; }
  const txtTension = (u) => `${u.v} V${u.ac ? " ~" : " continu"}`;

  class UF {
    constructor(n) { this.p = new Int32Array(n); for (let i = 0; i < n; i++) this.p[i] = i; }
    find(i) { const p = this.p; while (p[i] !== i) { p[i] = p[p[i]]; i = p[i]; } return i; }
    union(a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.p[b] = a; }
  }

  /* options.panne (dépannage) : { fil: id } un fil coupé, { piece: id, i } un contact (ou un pôle i) qui ne conduit plus,
     une bobine ou un voyant coupé. Le dessin ne change pas : seuls les mesures et le fonctionnement le montrent. */
  function simulation(schema, options) {
    const opt = options || {}, panne = opt.panne && (opt.panne.fil || opt.panne.piece) ? opt.panne : null;
    const s = schema, pieces = s.pieces || [], netR = M.netlist(s);   // netR : le schéma tel qu'il est dessiné
    const net = panne && panne.fil ? M.netlist(Object.assign({}, s, { fils: (s.fils || []).filter((f) => f.id !== panne.fil) })) : netR;
    const NB = Math.max(1, net.nb);
    const nd = (pc, b) => { const n = net.borne[pc.id + ":" + b]; return n == null ? -1 : n; };
    const INFO = Object.assign({}, BASE);
    const info = (p) => INFO[p] || null;
    const chaud = (p) => !!(INFO[p] && INFO[p].chaud);
    const nomPot = (p) => (INFO[p] ? INFO[p].nom : p);

    let t = 0, sale = true, defaut = null;
    const journal = [], courts = [];
    const dev = {}, devDe = new Map(), remarques = [];
    let vibrentAvant = new Set();

    /* ----- les appareils du schéma ----- */
    function etatInitial(d) {
      const P = d.principal ? M.parametres(d.principal) : {};
      switch (d.sorte) {
        case "contacteur": case "relais": case "travail": case "repos":
          Object.assign(d, { alim: false, depuis: -1e12, jamais: true, grille: false, delai: Math.max(100, Math.min(600000, Math.round((Number(P.delai) || 3) * 1000))) }); break;
        case "transfo": Object.assign(d, { alim: false, grille: false }); break;
        case "voyant": case "electrovanne": Object.assign(d, { alim: false, grille: false }); break;
        case "thermique": d.declenche = false; break;
        case "sectionneur": Object.assign(d, { ferme: true, fondus: [false, false, false] }); break;
        case "disjoncteur": case "disj_moteur": Object.assign(d, { ferme: true, declenche: false }); break;
        case "fusible": d.fondu = false; break;
        case "bouton": Object.assign(d, { appuye: false, maintenu: false }); break;
        case "moteur": Object.assign(d, { w: 0, sens: 0, etatM: "arret", couplage: null, chauffe: 0, tente: false, grille: false, var: null, bloque: false }); break;
        case "chariot": Object.assign(d, { pos: P.depart === "droite" ? 1 : P.depart === "milieu" ? 0.5 : 0, vit: 0, butee: 0, butees: 0 }); break;
        case "tapis": Object.assign(d, { pos: 0, vit: 0, vues: 0, bac: 0, entrees: 0 }); break;
        case "tri": Object.assign(d, { pos: 0, vit: 0, vues: 0, bac: 0, entrees: 0, r: 0, bac1: 0, bac2: 0, cote: 0, tombees: 0, coince: false }); break;
        case "cuve": Object.assign(d, { niv: clamp((Number(P.niveau) || 0) / 100, 0, 1), conso: clamp((Number(P.conso) || 0) / 100, 0, 1), deborde: false, debords: 0, vide: false, envers: false }); break;
        case "station": Object.assign(d, { niv: clamp((Number(P.niveau) || 0) / 100, 0, 1), conso: clamp((Number(P.conso) || 0) / 100, 0, 1), deborde: false, debords: 0, vide: false, envers: false }); break;
        case "barriere": Object.assign(d, { pos: 0, vit: 0, butee: 0, butees: 0, voitures: [], passees: 0, chocs: 0, surVoiture: false }); break;
        case "montecharge": Object.assign(d, { pos: P.depart === "haut" ? 1 : 0, vit: 0, butee: 0, butees: 0, porte: true, dangers: 0, danger: false, brusques: 0 }); break;
        case "automate": Object.assign(d, { alim: false, grille: false, run: d.run === false ? false : true, actif: false, entrees: new Array(8).fill(false), sorties: new Array(8).fill(false), aq: 0, ko: new Set(), instable: false, api: SA.creerAutomate(d.principal && d.principal.prog), alimTxt: "" }); break;
        case "variateur": Object.assign(d, { alim: false, grille: false, defaut: null, fs: 0, cible: 0, dir: 1, LI: [false, false, false, false], ai1: 0, ordre: 0, deux: false, fRef: 0, origine: "AI1", molette: d.molette == null ? 0.5 : d.molette, aiTrop: false }); break;
        case "potentiometre": d.pos = clamp((Number(P.pos) || 0) / 100, 0, 1); break;
        default: d.actionne = false; if (d.sorte === "capteur") Object.assign(d, { alim: false, grille: false });
      }
    }
    function nouvelAppareil(cle, ref, sorte, pc) {
      const d = { cle, ref, sorte, principal: pc || null, pieces: pc ? [pc] : [] };
      etatInitial(d); dev[cle] = d; if (pc) devDe.set(pc.id, d); return d;
    }
    for (const pc of pieces) {
      const sorte = PRINCIPAL[pc.type]; if (!sorte) continue;
      const ref = (pc.ref || "").trim() || ("?" + pc.id);
      const d = dev[ref];
      if (d && d.principal) {
        if (MULTI.has(sorte) && MULTI.has(d.sorte)) { d.pieces.push(pc); devDe.set(pc.id, d); continue; }
        remarques.push({ niveau: "alerte", texte: `Deux symboles portent le repère ${ref} : renomme l'un des deux.`, refs: [ref] });
        nouvelAppareil(ref + "#" + pc.id, ref, sorte, pc);
        continue;
      }
      nouvelAppareil(ref, ref, sorte, pc);
    }
    for (const pc of pieces) {
      if (M.CONTACTS_LIES.indexOf(pc.type) < 0 && pc.type !== "poles") continue;
      const ref = (pc.ref || "").trim();
      let d = dev[ref];
      if (!d) {
        if (pc.type === "contact_th_nf" || pc.type === "contact_th_no") d = nouvelAppareil(ref || "?" + pc.id, ref, "thermique", null);
        else {
          d = nouvelAppareil(ref || "?" + pc.id, ref, "absent", null);
          remarques.push({ niveau: "alerte", texte: ref ? `Le contact ${ref} n'a pas d'appareil ${ref} : ajoute la bobine ${ref} ou change le repère du contact.` : "Un contact n'a pas de repère : donne-lui le repère de sa bobine (KM1…).", refs: [ref] });
        }
      }
      if ((pc.type === "contact_tno" || pc.type === "contact_tnf") && d.sorte !== "travail" && d.sorte !== "repos" && d.sorte !== "absent" && !d.avertiTempo) {
        d.avertiTempo = true;
        remarques.push({ niveau: "alerte", texte: `Un contact temporisé porte le repère ${ref}, mais ${ref} n'est pas un relais temporisé : il agit sans retard.`, refs: [ref] });
      }
      if ((pc.type === "contact_th_nf" || pc.type === "contact_th_no") && d.sorte !== "thermique" && d.sorte !== "disj_moteur" && !d.avertiTh) {
        d.avertiTh = true;
        remarques.push({ niveau: "alerte", texte: `Le contact 95-96 / 97-98 ${ref} appartient à un relais thermique, mais ${ref} n'en est pas un.`, refs: [ref] });
      }
      if (pc.type === "poles" && !A_BOBINE.has(d.sorte) && d.sorte !== "absent" && !d.avertiPoles) {
        d.avertiPoles = true;
        remarques.push({ niveau: "alerte", texte: `Les pôles ${ref} appartiennent à un contacteur : ${ref} doit être une bobine de contacteur.`, refs: [ref] });
      }
      d.pieces.push(pc); devDe.set(pc.id, d);
    }
    // bornes et bouts de fils reliés à rien (le réseau peut garder N ou PE libres)
    {
      const L = [];
      for (const l of netR.libres) {
        const pc = pieces.find((q) => q.id === l.piece); if (!pc || pc.type === "reseau" || M.libreOk(pc, l.borne)) continue;
        const b = M.bornesLocales(pc).find((q) => q.id === l.borne);
        if (pc.type === "alim") { const P = M.parametres(pc); L.push("repère " + ((M.POTENTIELS.find((x) => x.id === P.pot) || {}).nom || P.pot)); }
        else L.push(((pc.ref || M.TYPES[pc.type].court) + " " + ((b && b.n) || "")).trim());
      }
      if (L.length) remarques.push({ niveau: "info", texte: `${L.length > 1 ? L.length + " bornes ne sont reliées" : "Une borne n'est reliée"} à rien : ${L.slice(0, 5).join(", ")}${L.length > 5 ? "…" : ""}.`, refs: [] });
      if (netR.bouts.length) remarques.push({ niveau: "info", texte: `${netR.bouts.length > 1 ? netR.bouts.length + " bouts de fils ne sont reliés" : "Un bout de fil n'est relié"} à rien.`, refs: [] });
    }
    const appareils = Object.values(dev);
    const bobines = appareils.filter((d) => A_BOBINE.has(d.sorte) || d.sorte === "transfo");
    function actionne(d) {
      switch (d.sorte) {
        case "contacteur": case "relais": case "travail": case "repos": return d.alim;
        case "thermique": return d.declenche;
        case "sectionneur": case "disjoncteur": case "disj_moteur": return d.ferme;
        case "bouton": return d.appuye || d.maintenu;
        case "absent": return false;
        default: return !!d.actionne;
      }
    }
    function actionneRetarde(d) {
      if (d.sorte === "travail") return d.alim && t - d.depuis >= d.delai - 1e-6;
      if (d.sorte === "repos") return d.alim || (!d.jamais && t - d.depuis < d.delai - 1e-6);
      return actionne(d);
    }
    function progression(d) {
      if (d.sorte === "travail") return d.alim ? Math.min(1, (t - d.depuis) / d.delai) : 0;
      if (d.sorte === "repos") return !d.alim && !d.jamais && t - d.depuis < d.delai ? (t - d.depuis) / d.delai : 0;
      return 0;
    }

    /* ----- ce qui conduit (contacts, pôles, protections) ----- */
    const cond = [];
    for (const pc of pieces) {
      const d = devDe.get(pc.id), P = M.parametres(pc), T = pc.type, nat = M.nature(pc);
      if (nat && d) {
        const tempo = T === "contact_tno" || T === "contact_tnf";
        cond.push({ pc, i: 0, n1: nd(pc, "a"), n2: nd(pc, "b"), ferme: () => (nat === "no") === (tempo ? actionneRetarde(d) : actionne(d)) });
      } else if (T === "poles" && d) {
        for (let k = 0; k < 3; k++) cond.push({ pc, i: k, n1: nd(pc, String(2 * k + 1)), n2: nd(pc, String(2 * k + 2)), ferme: () => actionne(d) });
      } else if (T === "sectionneur" && d) {
        for (let k = 0; k < 3; k++) cond.push({ pc, i: k, n1: nd(pc, String(2 * k + 1)), n2: nd(pc, String(2 * k + 2)), ferme: () => d.ferme && !d.fondus[k], prot: { d, cal: Number(P.cal) || 10, sorte: "fusible" } });
      } else if (T === "disjoncteur" && d) {
        const n = Math.max(1, Math.min(3, P.poles | 0));
        for (let k = 0; k < n; k++) cond.push({ pc, i: k, n1: nd(pc, String(2 * k + 1)), n2: nd(pc, String(2 * k + 2)), ferme: () => d.ferme, prot: { d, cal: Number(P.cal) || 10, sorte: "disj" } });
      } else if (T === "disj_moteur" && d) {
        for (let k = 0; k < 3; k++) cond.push({ pc, i: k, n1: nd(pc, String(2 * k + 1)), n2: nd(pc, String(2 * k + 2)), ferme: () => d.ferme, prot: { d, cal: Number(P.cal) || 6, sorte: "disj" }, therm: d });
      } else if (T === "thermique" && d) {
        for (let k = 0; k < 3; k++) cond.push({ pc, i: k, n1: nd(pc, String(2 * k + 1)), n2: nd(pc, String(2 * k + 2)), ferme: () => true, therm: d });
      } else if (T === "fusible" && d) {
        cond.push({ pc, i: 0, n1: nd(pc, "a"), n2: nd(pc, "b"), ferme: () => !d.fondu, prot: { d, cal: Number(P.cal) || 2, sorte: "fusible" } });
      } else if (T === "capteur3" && d) {
        const pnp = P.type !== "NPN", no = P.sortie !== "NC";
        cond.push({ pc, i: 0, n1: nd(pc, pnp ? "BN" : "BU"), n2: nd(pc, "BK"), ferme: () => d.alim && !d.grille && no === !!d.actionne });
      } else if (T === "automate" && d) {
        for (let k = 0; k < 8; k++) cond.push({ pc, i: k, n1: nd(pc, k < 4 ? "C0" : "C1"), n2: nd(pc, "Q" + k), ferme: () => d.actif && d.sorties[k] });
      } else if (T === "variateur" && d) {
        cond.push({ pc, i: 0, n1: nd(pc, "R1A"), n2: nd(pc, "R1C"), ferme: () => d.alim && !d.grille && !d.defaut });
        cond.push({ pc, i: 1, n1: nd(pc, "PE"), n2: nd(pc, "PE2"), ferme: () => true });   // la borne de terre traverse le variateur
      }
    }
    // panne : le contact (ou le pôle) bouge comme d'habitude, mais il ne conduit plus
    if (panne && panne.piece) for (const c of cond) if (c.pc.id === panne.piece && (panne.i == null || panne.i === c.i)) { c.meca = c.ferme; c.ferme = () => false; }
    const condValides = cond.filter((c) => c.n1 >= 0 && c.n2 >= 0);

    /* ----- les sources ----- */
    const sources = [], analog = [];   // analog : sources de tension 0-10 V (sortie AQ0, +10 V, curseur d'un potentiomètre)
    for (const pc of pieces) {
      const P = M.parametres(pc);
      if (pc.type === "alim") sources.push({ n: nd(pc, "a"), pot: POT_ALIM[P.pot] || "L1", actif: () => true });
      else if (pc.type === "reseau") for (const id of ["L1", "L2", "L3", "N", "PE"]) sources.push({ n: nd(pc, id), pot: id, actif: () => true });
      else if (pc.type === "transfo") {
        const d = devDe.get(pc.id), k = "T:" + d.cle, sec = Number(P.sec) || 24;
        INFO[k + "+"] = { chaud: true, net: k, v: sec, nom: `${d.ref} ${sec} V` };
        INFO[k + "-"] = { chaud: false, net: k, v: sec, nom: `${d.ref} 0 V` };
        d.pots = [k + "+", k + "-"];
        sources.push({ n: nd(pc, "s2"), pot: k + "+", actif: () => d.alim && !d.grille }, { n: nd(pc, "s1"), pot: k + "-", actif: () => d.alim && !d.grille });
      } else if (pc.type === "variateur") {
        const d = devDe.get(pc.id), k = "V:" + d.cle;
        ["U", "V", "W"].forEach((b, i) => { INFO[k + ":" + b] = { chaud: true, net: k, ph: i, nom: `${d.ref} ${b}`, var: d }; sources.push({ n: nd(pc, b), pot: k + ":" + b, actif: () => sortieVar(d) }); });
        d.k = k;
        sources.push({ n: nd(pc, "P24"), pot: "+24", actif: () => d.alim && !d.grille }, { n: nd(pc, "COM"), pot: "0V", actif: () => d.alim && !d.grille });
        analog.push({ n: nd(pc, "P10"), valeur: () => 10, actif: () => d.alim && !d.grille });
      } else if (pc.type === "automate") {
        const d = devDe.get(pc.id);
        analog.push({ n: nd(pc, "AQ0"), valeur: () => d.aq, actif: () => d.actif });
      } else if (pc.type === "potentiometre") {
        const d = devDe.get(pc.id), src = { n: nd(pc, "2"), actif: () => true };
        src.valeur = (uf, m, prof) => {   // diviseur de tension : le curseur entre les bornes 1 et 3
          const v1 = vNoeud(uf, m, nd(pc, "1"), src, prof + 1), v3 = vNoeud(uf, m, nd(pc, "3"), src, prof + 1);
          if (v1 == null && v3 == null) return null;
          if (v1 == null) return v3; if (v3 == null) return v1;
          return v3 + d.pos * (v1 - v3);
        };
        analog.push(src);
      }
    }
    const sortieVar = (d) => d.alim && !d.grille && !d.defaut && (Math.abs(d.cible) > 0 || Math.abs(d.fs) > 1e-9);

    /* ----- les récepteurs ----- */
    const charges = [];
    for (const pc of pieces) {
      const d = devDe.get(pc.id), P = M.parametres(pc);
      if (!d) continue;
      if (M.BOBINES.indexOf(pc.type) >= 0) charges.push({ pc, d, n1: nd(pc, "a"), n2: nd(pc, "b"), cote: lireTension(P.tension), sorte: "bobine" });
      else if (pc.type === "voyant") charges.push({ pc, d, n1: nd(pc, "a"), n2: nd(pc, "b"), cote: lireTension(P.tension), sorte: "voyant" });
      else if (pc.type === "electrovanne") charges.push({ pc, d, n1: nd(pc, "a"), n2: nd(pc, "b"), cote: lireTension(P.tension), sorte: "ev" });
      else if (pc.type === "transfo") charges.push({ pc, d, n1: nd(pc, "p1"), n2: nd(pc, "p2"), cote: { v: Number(P.prim) || 400, ac: true }, sorte: "transfo" });
      else if (pc.type === "capteur3") charges.push({ pc, d, n1: nd(pc, "BN"), n2: nd(pc, "BU"), cote: { v: 24, ac: false }, sorte: "capteur3" });
    }
    if (panne && panne.piece) for (const ch of charges) if (ch.pc.id === panne.piece) ch.coupee = true;   // bobine ou voyant coupé
    const moteurs = pieces.filter((pc) => (pc.type === "moteur" || pc.type === "moteur6") && devDe.get(pc.id)).map((pc) => ({ pc, d: devDe.get(pc.id) }));

    /* ----- calcul des nœuds ----- */
    function unir(sauf) { const uf = new UF(NB); for (const c of condValides) if (c !== sauf && c.ferme()) uf.union(c.n1, c.n2); return uf; }
    function potentiels(uf) {
      const m = new Map();
      if (defaut) return m;
      for (const src of sources) {
        if (src.n < 0 || !src.actif()) continue;
        const r = uf.find(src.n); let e = m.get(r); if (!e) { e = new Set(); m.set(r, e); } e.add(src.pot);
      }
      return m;
    }
    function conflits(m) { const L = []; for (const [r, e] of m) if (e.size > 1 && [...e].some(chaud)) L.push({ r, pots: [...e] }); return L; }
    function potDe(uf, m, n) { if (n < 0) return null; const e = m.get(uf.find(n)); return e && e.size === 1 ? e.values().next().value : null; }
    function tension(a, b) {
      if (!a || !b) return { v: 0 };
      if (a === b) return { v: 0, meme: true };
      const A = info(a), B = info(b);
      if (!A || !B) return { inconnu: true };
      if (!A.chaud && !B.chaud) return { v: 0, meme: true };
      if (A.net === "R" && B.net === "R") return { v: A.chaud && B.chaud ? 400 : 230, ac: true };
      if ((A.net === "R" && A.chaud && B.net === "PE") || (B.net === "R" && B.chaud && A.net === "PE")) return { v: 230, ac: true, terre: true };
      if (A.net === "DC" && B.net === "DC") return { v: 24, ac: false };
      if (A.net === B.net && A.net.indexOf("T:") === 0) return { v: A.v, ac: true };
      if (A.net === B.net && A.net.indexOf("V:") === 0) return { v: 400, ac: true, variateur: true };   // entre deux sorties d'un variateur
      return { inconnu: true };
    }
    function juger(ch, u) {
      if (u.inconnu) return { on: false, etat: "sources" };
      if (!u.v) return { on: false, etat: "" };
      const c = ch.cote;
      if (u.ac !== c.ac) return { on: false, etat: "nature", u };
      if (u.v > c.v * 1.25) return { on: false, etat: "forte", u, grille: true };
      if (u.v < c.v * 0.8) return { on: false, etat: "faible", u };
      return { on: true, etat: "ok", u };
    }
    const tensionCharge = (ch, uf, m) => tension(potDe(uf, m, ch.n1), potDe(uf, m, ch.n2));
    function jugerCharge(ch, uf, m) {   // un capteur 3 fils veut le +24 V sur BN (marron) et le 0 V sur BU (bleu)
      const j = juger(ch, tensionCharge(ch, uf, m));
      if (ch.sorte === "capteur3" && j.on && potDe(uf, m, ch.n1) !== "+24") return { on: false, etat: "inverse", u: j.u };
      return j;
    }

    function log(niveau, texte, extra) { journal.push(Object.assign({ t, niveau, texte }, extra || {})); if (journal.length > 200) journal.splice(0, journal.length - 200); }
    function noeudsDe(uf, r) { const L = []; for (let i = 0; i < NB; i++) if (uf.find(i) === r) L.push(i); return L; }
    function separe(c, conf) {
      const uf = unir(c), m = potentiels(uf);
      for (const [, e] of m) { const L = conf.pots.filter((p) => e.has(p)); if (L.length >= 2 && L.some(chaud)) return false; }
      return true;
    }
    function declencher(c) {
      const d = c.prot.d;
      if (c.prot.sorte === "fusible") { if (c.pc.type === "sectionneur") d.fondus[c.i] = true; else d.fondu = true; }
      else { d.ferme = false; d.declenche = true; }
      return d;
    }
    function traiterCourt(conf, uf) {
      const txt = conf.pots.map(nomPot).join(" et ");
      courts.push({ t, noeuds: noeudsDe(uf, conf.r) });
      let cands = condValides.filter((c) => c.prot && c.ferme() && separe(c, conf)), coupe = null;
      if (!cands.length) {   // court-circuit au secondaire d'un transformateur : sa protection au primaire
        const tr = bobines.find((d) => d.sorte === "transfo" && d.pots && conf.pots.some((p) => d.pots.indexOf(p) >= 0));
        if (tr) {
          const ch = charges.find((x) => x.d === tr);
          cands = condValides.filter((c) => { if (!c.prot || !c.ferme()) return false; const u2 = unir(c), m2 = potentiels(u2); return !juger(ch, tensionCharge(ch, u2, m2)).on; });
          if (cands.length) coupe = tr;
        }
      }
      if (cands.length) {
        const min = Math.min(...cands.map((c) => c.prot.cal)), noms = [];
        for (const c of cands.filter((x) => x.prot.cal === min)) { const d = declencher(c); if (noms.indexOf(d.ref) < 0) noms.push(d.ref); }
        if (coupe) { coupe.alim = false; coupe.depuis = t; }   // le transformateur n'est plus alimenté
        const fus = cands.some((c) => c.prot.cal === min && c.prot.sorte === "fusible");
        log("erreur", `Court-circuit entre ${txt} ! ${noms.join(", ")} ${fus ? (noms.length > 1 ? "ont fondu" : "a fondu") : (noms.length > 1 ? "ont déclenché" : "a déclenché")}. Cherche les deux potentiels qui se touchent sans récepteur entre eux.`, { court: true, refs: noms });
      } else {
        defaut = { pots: conf.pots, t };
        log("erreur", `Court-circuit entre ${txt} ! Rien ne protège ce circuit (ni fusible, ni disjoncteur) : toute l'alimentation est coupée.`, { court: true, global: true });
      }
    }
    // tout ce que le point fixe peut mettre sous tension : bobines, transformateurs, capteurs 3 fils
    const sousTension = [...new Set(bobines.concat(charges.filter((ch) => ch.sorte === "capteur3").map((ch) => ch.d)))];
    const signature = () => sousTension.map((d) => (d.alim ? "1" : "0")).join("");

    let dernier = null, vibrent = new Set();
    function pointFixe() {
      const vus = new Map(), histo = [], bloques = new Set();
      vus.set(signature(), 0);
      let uf = null, m = null;
      for (let it = 0; it < 600; it++) {
        uf = unir(null); m = potentiels(uf);
        const cf = conflits(m);
        if (cf.length) { traiterCourt(cf[0], uf); continue; }
        const off = [], on = [];
        for (const ch of charges) {
          if (ch.sorte === "voyant" || ch.sorte === "ev") continue;
          const d = ch.d; if (bloques.has(d)) continue;
          const j = ch.coupee ? { on: false, etat: "" } : jugerCharge(ch, uf, m);
          if (j.grille && !d.grille) {
            d.grille = true;
            log("erreur", `${ch.sorte === "transfo" ? "Le transformateur" : ch.sorte === "capteur3" ? "Le capteur" : "La bobine"} ${d.ref} (${txtTension(ch.cote)}) reçoit ${txtTension(j.u)} : ${ch.sorte === "transfo" ? "il grille" : ch.sorte === "capteur3" ? "il est détruit" : "elle grille"} !`, { refs: [d.ref] });
          }
          const veut = j.on && !d.grille;
          if (veut !== d.alim) (veut ? on : off).push(d);
        }
        if (!on.length && !off.length) break;
        const app = off.length ? off : [on[0]];
        for (const d of app) { d.alim = !d.alim; d.depuis = t; d.jamais = false; }
        histo.push(app);
        const sig = signature();
        if (vus.has(sig)) {
          const L = new Set(); for (let k = vus.get(sig); k < histo.length; k++) for (const d of histo[k]) L.add(d);
          for (const d of L) { if (d.alim) { d.alim = false; d.depuis = t; } bloques.add(d); }
          vus.clear(); vus.set(signature(), histo.length);
          continue;
        }
        vus.set(sig, histo.length);
      }
      for (const d of bloques) vibrent.add(d.cle);
      return { uf, m };
    }
    let oscilleAvant = false;
    function evaluer() {
      sale = false;
      vibrent = new Set();
      let uf = null, m = null, oscille = false;
      const vus = new Set();
      for (let tour = 0; tour < 40; tour++) {
        ({ uf, m } = pointFixe());
        const sig = electronique(uf, m);
        if (sig === null) break;           // rien n'a changé : le schéma est stable
        if (vus.has(sig)) { oscille = true; break; }
        vus.add(sig);
        if (tour === 39) oscille = true;
      }
      if (oscille && !oscilleAvant) log("alerte", "L'automate et le câblage s'entretiennent : une sortie change, ce qui change une entrée, qui rechange la sortie… (le schéma oscille).", {});
      oscilleAvant = oscille;
      // voyants et électrovannes
      for (const ch of charges) {
        if (ch.sorte !== "voyant" && ch.sorte !== "ev") continue;
        const j = ch.coupee ? { on: false, etat: "" } : juger(ch, tensionCharge(ch, uf, m));
        if (j.grille && !ch.d.grille) { ch.d.grille = true; log("erreur", `${ch.sorte === "ev" ? "La bobine de l'électrovanne" : "Le voyant"} ${ch.d.ref} (${txtTension(ch.cote)}) reçoit ${txtTension(j.u)} : ${ch.sorte === "ev" ? "elle grille" : "il grille"} !`, { refs: [ch.d.ref] }); }
        ch.d.alim = j.on && !ch.d.grille;
      }
      // oscillations
      const vib = vibrent;
      for (const k of vib) if (!vibrentAvant.has(k)) log("alerte", `${dev[k].ref} vibre : sa bobine se coupe elle-même (un de ses propres contacts à ouverture est en série avec elle ?).`, { refs: [dev[k].ref] });
      vibrentAvant = vib;
      // moteurs
      for (const mo of moteurs) analyserMoteur(mo, uf, m);
      dernier = { uf, m };
    }

    /* ----- automates et variateurs : mis à jour après chaque point fixe ----- */
    const automates = appareils.filter((d) => d.sorte === "automate" && d.principal);
    const variateurs = appareils.filter((d) => d.sorte === "variateur" && d.principal);
    const NOMB = { P24: "+24V", LI1: "LI1", LI2: "LI2", LI3: "LI3", LI4: "LI4", COM: "COM", P10: "+10V", AI1: "AI1" };
    /* tension 0-10 V d'un nœud, par rapport au 0 V (null : en l'air ; NaN : alternatif ou mélange) */
    function vNoeud(uf, m, n, sauf, prof) {
      if (n < 0 || prof > 4) return null;
      const r = uf.find(n), e = m.get(r);
      if (e && e.size) { if (e.size > 1) return NaN; const p = e.values().next().value; return p === "+24" ? 24 : p === "0V" ? 0 : NaN; }
      for (const a of analog) if (a !== sauf && a.n >= 0 && a.actif() && uf.find(a.n) === r) return a.valeur(uf, m, prof);
      return null;
    }
    function sigElec() {
      let x = "";
      for (const d of automates) { x += (d.actif ? "1" : "0") + (d.grille ? "g" : ""); for (const b of d.sorties) x += b ? "1" : "0"; x += ";"; }
      for (const d of variateurs) x += (d.alim ? "1" : "0") + (d.grille ? "g" : "") + (d.defaut || "") + (sortieVar(d) ? "1" : "0") + ";";
      return x;
    }
    function electronique(uf, m) {
      if (!automates.length && !variateurs.length) return null;
      const avant = sigElec();
      for (const d of automates) majAutomate(d, uf, m);
      for (const d of variateurs) majVariateur(d, uf, m);
      const apres = sigElec();
      return apres === avant ? null : apres;
    }
    function majAutomate(d, uf, m) {
      const pc = d.principal, pb = (b) => potDe(uf, m, nd(pc, b));
      const pp = pb("p24"), u = tension(pp, pb("m0"));
      let alim = false, quoi = "";
      if (u.v && u.ac && u.v >= 100) {
        if (!d.grille) { d.grille = true; log("erreur", `${d.ref} reçoit ${txtTension(u)} sur son alimentation : il est détruit ! Cet automate s'alimente en 24 V continu (bornes +24V et 0V).`, { refs: [d.ref] }); }
      } else if (u.v === 24 && !u.ac) { if (pp === "+24") alim = true; else quoi = "inverse"; }
      else if (u.v) quoi = "nature";
      d.alimTxt = quoi;
      d.alim = alim && !d.grille;
      const actif = d.alim && d.run;
      if (actif && !d.actif) d.api.demarrer(t);   // mise sous tension, ou passage en RUN : démarrage à froid
      d.actif = actif;
      const pcom = pb("COM");
      for (let k = 0; k < 8; k++) {
        const pi = pb("I" + k), i = info(pi);
        if (i && i.chaud && (i.net === "R" || (i.net.indexOf("T:") === 0 && i.v >= 100)) && !d.ko.has(k)) {
          d.ko.add(k);
          log("erreur", `L'entrée %I0.${k} de ${d.ref} reçoit ${nomPot(pi)} (alternatif) : elle est détruite ! Les entrées se câblent en 24 V continu : +24 V → bouton ou capteur → %I0.${k}, et la borne COM au 0 V.`, { refs: [d.ref] });
        }
        const ui = tension(pi, pcom);
        d.entrees[k] = d.alim && !d.ko.has(k) && ui.v === 24 && !ui.ac;
      }
      if (d.actif) { const r = d.api.scan(d.entrees, t); d.sorties = r.Q; d.aq = r.aq; const e = d.api.etat(); d.instable = e.instable; d.fugaces = e.fugaces; }
      else { d.sorties = new Array(8).fill(false); d.aq = 0; d.instable = false; d.fugaces = false; }
    }
    function detruire(d, pourquoi) { d.grille = true; d.alim = false; d.fs = 0; d.cible = 0; log("erreur", `${d.ref} est détruit : ${pourquoi}.`, { refs: [d.ref] }); }
    function majVariateur(d, uf, m) {
      const pc = d.principal, P = M.parametres(pc), pb = (b) => potDe(uf, m, nd(pc, b));
      if (!d.grille) for (const b of ["U", "V", "W"]) {
        const p = pb(b), i = info(p);
        if (i && i.chaud && i.net === "R") { detruire(d, `le réseau (${nomPot(p)}) arrive sur sa borne ${b}. U, V, W sont des sorties : le réseau se branche sur L1, L2, L3`); break; }
      }
      if (!d.grille) for (const b of Object.keys(NOMB)) {
        const p = pb(b), i = info(p);
        if (i && i.chaud && (i.net === "R" || (i.net.indexOf("T:") === 0 && i.v >= 100))) { detruire(d, `sa borne ${NOMB[b]} reçoit ${nomPot(p)}. Les bornes de commande sont en 24 V continu (et 0-10 V pour AI1)`); break; }
      }
      const ph = ["L1", "L2", "L3"].map((b) => { const i = info(pb(b)); return i && i.chaud && i.net === "R" ? i.ph : null; });
      const n = new Set(ph.filter((x) => x !== null)).size;
      const avant = d.alim && !d.defaut && Math.abs(d.fs) > 0.05;
      d.defaut = !d.grille && n > 0 && n < 3 ? "PHF" : null;
      d.alim = n === 3 && !d.grille;
      if (!d.alim || d.defaut) { if (avant) log("alerte", `${d.ref} n'est plus alimenté : le moteur s'arrête en roue libre.`, { refs: [d.ref] }); d.fs = 0; }
      const pcom = pb("COM");
      d.LI = ["LI1", "LI2", "LI3", "LI4"].map((b) => { const u = tension(pb(b), pcom); return d.alim && !d.defaut && u.v === 24 && !u.ac; });
      const av = d.LI[0], ar = d.LI[1];
      d.deux = av && ar;
      d.ordre = av && !ar ? 1 : ar && !av ? -1 : 0;
      const hsp = clamp(Number(P.hsp) || 50, 1, 100), lsp = clamp(Number(P.lsp) || 0, 0, hsp);
      const ps = (d.LI[2] ? 1 : 0) + (d.LI[3] ? 2 : 0);
      const v = vNoeud(uf, m, nd(pc, "AI1"), null, 0);
      d.ai1 = v == null || !Number.isFinite(v) ? 0 : clamp(v, 0, 30);
      d.aiTrop = Number.isFinite(v) && v > 10.5;
      let f;
      if (ps) { f = Number([0, P.sp2, P.sp3, P.sp4][ps]) || 0; d.origine = "SP" + (ps + 1); }
      else if (P.ref === "molette") { f = lsp + (hsp - lsp) * d.molette; d.origine = "molette"; }
      else { f = lsp + (hsp - lsp) * clamp(d.ai1 / 10, 0, 1); d.origine = "AI1"; }
      d.fRef = clamp(f, lsp, hsp);
      d.cible = d.alim && !d.defaut ? d.ordre * d.fRef : 0;
      d.dir = d.fs !== 0 ? Math.sign(d.fs) : d.cible !== 0 ? Math.sign(d.cible) : d.dir;
      INFO[d.k + ":V"].ph = d.dir > 0 ? 1 : 2; INFO[d.k + ":W"].ph = d.dir > 0 ? 2 : 1;   // marche arrière : deux phases croisées
    }
    function taux(d) { const P = M.parametres(d.principal); return { acc: 50 / clamp(Number(P.acc) || 3, 0.1, 600) / 1000, dec: 50 / clamp(Number(P.dec) || 3, 0.1, 600) / 1000 }; }   // Hz par ms
    function rampe(d, dt) {
      if (!d.alim || d.defaut || d.grille) { d.fs = 0; return; }
      const c = d.cible, { acc, dec } = taux(d);
      let f = d.fs, reste = dt;
      for (let k = 0; k < 4 && reste > 1e-9 && f !== c; k++) {
        if (f !== 0 && Math.sign(f) !== Math.sign(c)) { const tz = Math.abs(f) / dec; if (tz <= reste) { f = 0; reste -= tz; } else { f -= Math.sign(f) * dec * reste; reste = 0; } }
        else if (Math.abs(c) > Math.abs(f)) { const tz = (Math.abs(c) - Math.abs(f)) / acc; if (tz <= reste) { f = c; reste -= tz; } else { f += Math.sign(c) * acc * reste; reste = 0; } }
        else { const tz = (Math.abs(f) - Math.abs(c)) / dec; if (tz <= reste) { f = c; reste -= tz; } else { f -= Math.sign(f) * dec * reste; reste = 0; } }
      }
      d.fs = f;
    }
    function finRampe(d) {
      if (!d.alim || d.defaut || d.grille || d.fs === d.cible) return Infinity;
      const { acc, dec } = taux(d), f = d.fs, c = d.cible;
      const dt = f !== 0 && Math.sign(f) !== Math.sign(c) ? Math.abs(f) / dec : Math.abs(c) > Math.abs(f) ? (Math.abs(c) - Math.abs(f)) / acc : (Math.abs(f) - Math.abs(c)) / dec;
      return t + Math.max(dt, 0.001);
    }

    /* ----- partie opérative animée : chariot sur rail, cuve et pompe, tapis et caisses ----- */
    // Elle lit l'état d'un moteur (sens, vitesse) et actionne des fins de course ou des capteurs, par leurs repères.
    const systemes = appareils.filter((d) => /^(chariot|cuve|tapis|tri|barriere|montecharge|station)$/.test(d.sorte) && d.principal);
    const NOM_PO = { chariot: "Le chariot", cuve: "La cuve", tapis: "Le tapis", tri: "Le tapis de tri", barriere: "La barrière", montecharge: "Le monte-charge", station: "La station de pompage" };
    // barrière : la lisse va de 0 (fermée) à 1 (levée) en « duree » secondes. Les voitures roulent sur une voie (x : de −1 à 1,6 ;
    // la lisse en 0 ; x est l'avant de la voiture, longue de 0,4). Une voiture attend au pied de la lisse (avant en −0,06) tant que
    // la lisse n'est pas levée à 90 % ; une fois engagée, elle passe. Sous la lisse (de −0,02 à 0,02), elle l'empêche de descendre
    // plus bas que 60 % (son toit) : c'est un choc. Boucle amont de −0,6 à −0,1, boucle aval de 0,04 à 0,54 : une boucle voit une
    // voiture dès qu'un bout de la voiture est au-dessus.
    const VOIE = { long: 0.4, ecart: 0.1, vit: 0.25 / 1000, arret: -0.06, passe: 0.9, sous: 0.02, garde: 0.6, amont: [-0.6, -0.1], aval: [0.04, 0.54], entree: -1, sortie: 1.66 };
    const BORDS_VOIE = [-0.6, -0.1, -0.06, -0.02, 0.02, 0.04, 0.54, 1.66];
    const surZone = (s, a, b) => s.voitures.some((v) => v.x > a + 1e-9 && v.x - VOIE.long < b - 1e-9);
    function limiteVoiture(s, k) {   // jusqu'où la voiture k peut avancer maintenant
      const v = s.voitures[k];
      let L = Infinity;
      if (v.x <= VOIE.arret + 1e-9 && s.pos < VOIE.passe) L = VOIE.arret;   // elle attend que la lisse se lève
      if (k > 0) L = Math.min(L, s.voitures[k - 1].x - VOIE.long - VOIE.ecart);
      return L;
    }
    function avancerVoitures(s, dt) {
      s.voitures.forEach((v, k) => {
        const L = limiteVoiture(s, k); if (v.x < L) v.x = Math.min(L, v.x + VOIE.vit * dt);
        if (!v.passe && v.x - VOIE.long >= VOIE.sous - 1e-9) { v.passe = true; s.passees++; }   // passée : tout entière au-delà de la lisse
      });
      while (s.voitures.length && s.voitures[0].x - VOIE.long >= VOIE.sortie - 1e-9) s.voitures.shift();
    }
    // monte-charge : la cabine va de 0 (en bas) à 1 (en haut) ; capteurs de niveau à 4 % des bouts, de ralentissement à 15 %
    function arriveeCabine(s, ou) {
      const v = s.mot && s.mot.var, f = v ? Math.abs(v.fs) : 0;
      if (v && f > 15) { s.brusques++; log("alerte", `La cabine du monte-charge ${s.ref} arrive ${ou} à ${nf1(f)} Hz : trop vite. Elle doit passer en petite vitesse dès le capteur de ralentissement.`, { refs: [s.ref] }); }
    }
    // station : P1 (0,75 kW) débite deux fois plus que P2 ou P3 (0,37 kW) ; « duree » : temps pour remplir la bâche vide avec
    // une petite pompe ; la consommation est en % du débit des trois pompes ensemble ; électrodes à 10, 30, 70 et 90 %
    const POIDS_ST = [2, 1, 1], NIV_ST = [0.1, 0.3, 0.7, 0.9];
    const bande = (s) => s.sorte === "tapis" || s.sorte === "tri";   // les deux tapis
    // tapis de tri : la cellule est au bout de la bande (1) ; quand une caisse tombe, le volet décide du bac ;
    // le vérin (distributeur monostable : bobine alimentée → la tige sort) fait sa course en « course » secondes
    const xsT = (s) => (s.sorte === "tri" ? 1 : XS_T), SEUILS_V = [0, 0.02, 0.04, 0.96, 0.98, 1];
    // tapis : longueur 1 ; une caisse (longueur W_T) arrive à gauche chaque fois que le tapis a avancé de « ecart » ;
    // l'avant de la caisse k est à pos − k·ecart ; le capteur regarde le point XS_T ; au bout (1), la caisse tombe dans le bac
    const XS_T = 0.6, W_T = 0.08;
    const geoT = (s) => { const P = M.parametres(s.principal); return { d: clamp((Number(P.ecart) || 30) / 100, 0.12, 1), N: Math.max(0, Math.round(Number(P.caisses) || 0)) }; };
    function caisseDevant(s) {
      const G = geoT(s), u = s.pos - xsT(s); if (u < -1e-9) return false;
      const k = Math.floor((u + 1e-9) / G.d); if (G.N && k >= G.N) return false;
      return u - k * G.d <= W_T + 1e-9;
    }
    function compterT(s) {   // caisses vues par le capteur (leur avant l'a atteint), tombées dans le bac, sorties du magasin
      const G = geoT(s), nb = (u) => (u < -1e-9 ? 0 : Math.min(G.N || Infinity, Math.floor((u + 1e-9) / G.d) + 1));
      s.vues = nb(s.pos - xsT(s)); s.bac = nb(s.pos - 1 - W_T); s.entrees = nb(s.pos);
    }
    // seuils des capteurs, avec un peu d'hystérésis : un fin de course est actionné à 4 % du bout et relâché à 5 % ;
    // le capteur de niveau bas retombe sous 20 % (et remonte à 22 %), le capteur haut monte à 80 % (et retombe sous 78 %)
    const SEUILS_CH = [0, 0.04, 0.05, 0.95, 0.96, 1], SEUILS_CU = [0, 0.2, 0.22, 0.78, 0.8, 1], TAU_CH = 120;
    for (const s of systemes) {
      const P = M.parametres(s.principal), ch = s.sorte === "chariot", cu = s.sorte === "cuve", nom = `${NOM_PO[s.sorte]} ${s.ref}`;
      const lien = (r, quoi) => {
        r = String(r || "").trim(); if (!r) return null;
        const d = dev[r];
        if (!d) remarques.push({ niveau: "alerte", texte: `${nom} : aucun appareil ne porte le repère ${r} (${quoi}).`, refs: [s.ref] });
        return d || null;
      };
      const m = lien(P.moteur, cu ? "sa pompe" : "son moteur");
      s.mot = m && m.sorte === "moteur" ? m : null;
      if (m && !s.mot) remarques.push({ niveau: "alerte", texte: `${nom} : ${m.ref} n'est pas un moteur.`, refs: [s.ref] });
      const capt = (r, quoi) => {
        const d = lien(r, quoi); if (!d) return null;
        if (d.sorte !== "fdc" && d.sorte !== "capteur") { remarques.push({ niveau: "alerte", texte: `${nom} : ${d.ref} n'est ni un fin de course ni un capteur (${quoi}).`, refs: [s.ref] }); return null; }
        if (d.pilote && d.pilote !== s) remarques.push({ niveau: "alerte", texte: `${d.ref} est actionné par deux parties opératives.`, refs: [d.ref] });
        d.pilote = s; d.piloteRef = s.ref;
        return d;
      };
      if (ch) { s.cG = capt(P.gauche, "fin de course gauche"); s.cD = capt(P.droite, "fin de course droite"); }
      else if (cu) { s.cB = capt(P.bas, "niveau bas"); s.cH = capt(P.haut, "niveau haut"); }
      else if (s.sorte === "barriere") { s.cH = capt(P.haut, "barrière ouverte"); s.cB = capt(P.bas, "barrière fermée"); s.cA = capt(P.amont, "boucle amont"); s.cV = capt(P.aval, "boucle aval"); }
      else if (s.sorte === "montecharge") {
        s.cB = capt(P.bas, "cabine en bas"); s.cH = capt(P.haut, "cabine en haut"); s.cRB = capt(P.ralbas, "ralentissement en bas"); s.cRH = capt(P.ralhaut, "ralentissement en haut");
        s.cP = capt(P.porte, "porte fermée");
      } else if (s.sorte === "station") {
        s.mots = [P.pompe1, P.pompe2, P.pompe3].map((r, k) => {
          const d = lien(r, `la pompe P${k + 1}`); if (!d) return null;
          if (d.sorte !== "moteur") { remarques.push({ niveau: "alerte", texte: `${nom} : ${d.ref} n'est pas un moteur (pompe P${k + 1}).`, refs: [s.ref] }); return null; }
          return d;
        });
        s.cN = [capt(P.tbas, "électrode très bas"), capt(P.bas, "électrode bas"), capt(P.haut, "électrode haut"), capt(P.thaut, "électrode très haut")];
      } else {
        s.cC = capt(P.capteur, "capteur des caisses"); compterT(s);
        if (s.sorte === "tri") {
          const v = lien(P.verin, "l'électrovanne du vérin");
          s.ev = v && v.sorte === "electrovanne" ? v : null;
          if (v && !s.ev) remarques.push({ niveau: "alerte", texte: `${nom} : ${v.ref} n'est pas une électrovanne (bobine du distributeur du vérin).`, refs: [s.ref] });
          s.cR = capt(P.rentre, "vérin rentré"); s.cS = capt(P.sorti, "vérin sorti");
          s.tombees = s.bac;
        }
      }
    }
    function appliquerCapteurs() {
      let change = false;
      const poser = (d, v) => { if (d && !!d.actionne !== v) { d.actionne = v; change = true; } };
      const E = 1e-9;
      for (const s of systemes) {
        // au seuil même, le capteur bascule (le temps de l'événement tombe pile dessus)
        if (s.sorte === "chariot") {
          if (s.cG) poser(s.cG, s.cG.actionne ? s.pos < 0.05 - E : s.pos <= 0.04 + E);
          if (s.cD) poser(s.cD, s.cD.actionne ? s.pos > 0.95 + E : s.pos >= 0.96 - E);
        } else if (bande(s)) {
          if (s.cC) poser(s.cC, caisseDevant(s));
          if (s.sorte === "tri") {
            if (s.cR) poser(s.cR, s.cR.actionne ? s.r < 0.04 - E : s.r <= 0.02 + E);
            if (s.cS) poser(s.cS, s.cS.actionne ? s.r > 0.96 + E : s.r >= 0.98 - E);
          }
        } else if (s.sorte === "cuve") {
          if (s.cB) poser(s.cB, s.cB.actionne ? s.niv > 0.2 + E : s.niv >= 0.22 - E);
          if (s.cH) poser(s.cH, s.cH.actionne ? s.niv > 0.78 + E : s.niv >= 0.8 - E);
        } else if (s.sorte === "station") {   // une électrode est dans l'eau à 1 % au-dessus de son niveau, et en sort à 1 % dessous
          s.cN.forEach((c, k) => { if (c) poser(c, c.actionne ? s.niv > NIV_ST[k] - 0.01 + E : s.niv >= NIV_ST[k] + 0.01 - E); });
        } else if (s.sorte === "barriere") {
          if (s.cH) poser(s.cH, s.cH.actionne ? s.pos > 0.95 + E : s.pos >= 0.96 - E);
          if (s.cB) poser(s.cB, s.cB.actionne ? s.pos < 0.05 - E : s.pos <= 0.04 + E);
          if (s.cA) poser(s.cA, surZone(s, VOIE.amont[0], VOIE.amont[1]));
          if (s.cV) poser(s.cV, surZone(s, VOIE.aval[0], VOIE.aval[1]));
        } else if (s.sorte === "montecharge") {
          const hAv = !!(s.cH && s.cH.actionne), bAv = !!(s.cB && s.cB.actionne);
          if (s.cB) poser(s.cB, s.cB.actionne ? s.pos < 0.05 - E : s.pos <= 0.04 + E);
          if (s.cH) poser(s.cH, s.cH.actionne ? s.pos > 0.95 + E : s.pos >= 0.96 - E);
          if (s.cRB) poser(s.cRB, s.cRB.actionne ? s.pos < 0.16 - E : s.pos <= 0.15 + E);
          if (s.cRH) poser(s.cRH, s.cRH.actionne ? s.pos > 0.84 + E : s.pos >= 0.85 - E);
          if (s.cP) poser(s.cP, !!s.porte);
          if (s.cH && !hAv && s.cH.actionne) arriveeCabine(s, "en haut");
          if (s.cB && !bAv && s.cB.actionne) arriveeCabine(s, "en bas");
        }
      }
      return change;
    }
    const tourne = (m) => !!m && !m.grille && (m.etatM === "marche" || m.etatM === "surtension");
    const facteurVit = (m, maxi) => m.niveau * (m.var ? (maxi ? Math.max(Math.abs(m.var.fs), Math.abs(m.var.cible)) : Math.abs(m.var.fs)) / 50 : 1);
    function vitCible(s, maxi) {   // chariot : fraction de la course par ms (+ : vers la droite)
      const m = s.mot; if (!tourne(m)) return 0;
      const P = M.parametres(s.principal), D = clamp(Number(P.duree) || 4, 0.5, 120) * 1000;
      return (String(P.sens) === "2" ? -1 : 1) * (m.sens || 1) * facteurVit(m, maxi) / D;
    }
    const dureeCuve = (s) => clamp(Number(M.parametres(s.principal).duree) || 10, 1, 600) * 1000;
    function debitCuve(s, maxi) {   // cuve : niveau apporté par la pompe en une ms (elle ne pompe que dans le sens 1)
      const m = s.mot; if (!tourne(m) || m.bloque || m.sens !== 1) return 0;
      return facteurVit(m, maxi) / dureeCuve(s);
    }
    const dureeSt = (s) => clamp(Number(M.parametres(s.principal).duree) || 20, 1, 600) * 1000;
    const pompeSt = (m, maxi) => (tourne(m) && !m.bloque && m.sens === 1 ? facteurVit(m, maxi) : 0);
    const debitStation = (s, maxi) => s.mots.reduce((a, m, k) => a + POIDS_ST[k] * pompeSt(m, maxi), 0) / dureeSt(s);
    const consoSt = (s) => (4 * s.conso) / dureeSt(s);
    function integrerSystemes(dt) {
      for (const s of systemes) if (s.mot) s.mot.bloque = false;   // bloqué si au moins un chariot force contre une butée
      for (const s of systemes) {
        if (bande(s)) {   // comme le chariot, sans butée : le tapis (moteur-frein) suit son moteur en 0,12 s
          const vt = vitCible(s, false), e = Math.exp(-dt / TAU_CH);
          s.pos += vt * dt + (s.vit - vt) * TAU_CH * (1 - e);
          s.vit = vt + (s.vit - vt) * e;
          if (s.sorte === "tri") {   // le vérin, puis les caisses qui tombent : le volet décide du bac
            const but = s.ev && s.ev.alim ? 1 : 0, v = 1 / (clamp(Number(M.parametres(s.principal).course) || 0.5, 0.1, 10) * 1000);
            if (!s.coince) s.r = s.r < but ? Math.min(but, s.r + v * dt) : Math.max(but, s.r - v * dt);
          }
          compterT(s);
          if (s.sorte === "tri") {
            for (; s.tombees < s.bac; s.tombees++) {
              if (s.r <= 0.2) s.bac1++;
              else if (s.r >= 0.8) s.bac2++;
              else { s.cote++; log("alerte", `Une caisse tombe à côté des bacs : le volet de ${s.ref} était entre les deux (le vérin bougeait encore).`, { refs: [s.ref] }); }
            }
            if (s.tombees > s.bac) s.tombees = s.bac;   // le tapis a reculé
          }
        } else if (s.sorte === "chariot") {
          const vt = vitCible(s, false), e = Math.exp(-dt / TAU_CH);
          let p = s.pos + vt * dt + (s.vit - vt) * TAU_CH * (1 - e);   // le chariot (moteur-frein) suit son moteur en 0,12 s
          s.vit = vt + (s.vit - vt) * e;
          if (p <= 0) { p = 0; if (s.vit < 0) s.vit = 0; }
          if (p >= 1) { p = 1; if (s.vit > 0) s.vit = 0; }
          s.pos = p;
          const pousse = p <= 1e-9 && vt < -1e-12 ? -1 : p >= 1 - 1e-9 && vt > 1e-12 ? 1 : 0;
          if (pousse && !s.butee) { s.butees++; log("alerte", `Le chariot ${s.ref} arrive en butée ${pousse > 0 ? "à droite" : "à gauche"} et ${s.mot.ref} force : il est bloqué et chauffe.`, { refs: [s.ref, s.mot.ref] }); }
          s.butee = pousse;
          if (s.mot && pousse) s.mot.bloque = true;
        } else if (s.sorte === "barriere") {
          avancerVoitures(s, dt);
          const vt = vitCible(s, false), e = Math.exp(-dt / TAU_CH);
          let p = s.pos + vt * dt + (s.vit - vt) * TAU_CH * (1 - e);   // la lisse suit son moteur (moteur-frein) en 0,12 s
          s.vit = vt + (s.vit - vt) * e;
          if (p <= 0) { p = 0; if (s.vit < 0) s.vit = 0; }
          if (p >= 1) { p = 1; if (s.vit > 0) s.vit = 0; }
          const sous = s.voitures.filter((v) => v.x > -VOIE.sous + 1e-9 && v.x - VOIE.long < VOIE.sous - 1e-9);
          s.surVoiture = false;
          if (sous.length && p <= VOIE.garde + 1e-9) {   // la lisse touche la voiture : elle reste sur son toit
            for (const v of sous) if (!v.choc) { v.choc = true; s.chocs++; log("erreur", `La barrière ${s.ref} touche une voiture ! La lisse ne doit pas descendre tant qu'une voiture est dessous : attends qu'elle ait quitté ${s.cV ? "la boucle aval " + s.cV.ref : "la boucle aval"}.`, { refs: [s.ref] }); }
            p = VOIE.garde; if (s.vit < 0) s.vit = 0; s.surVoiture = vt < -1e-12;
          }
          s.pos = p;
          const pousse = p <= 1e-9 && vt < -1e-12 ? -1 : p >= 1 - 1e-9 && vt > 1e-12 ? 1 : 0;
          if (pousse && !s.butee) { s.butees++; log("alerte", `La lisse de la barrière ${s.ref} arrive en butée ${pousse > 0 ? "en haut" : "en bas"} et ${s.mot.ref} force : il est bloqué et chauffe.`, { refs: [s.ref, s.mot.ref] }); }
          s.butee = pousse;
          if (s.mot && (pousse || s.surVoiture)) s.mot.bloque = true;
        } else if (s.sorte === "montecharge") {
          const vt = vitCible(s, false), e = Math.exp(-dt / TAU_CH);
          let p = s.pos + vt * dt + (s.vit - vt) * TAU_CH * (1 - e);
          s.vit = vt + (s.vit - vt) * e;
          if (p <= 0) { p = 0; if (s.vit < 0) s.vit = 0; }
          if (p >= 1) { p = 1; if (s.vit > 0) s.vit = 0; }
          s.pos = p;
          const pousse = p <= 1e-9 && vt < -1e-12 ? -1 : p >= 1 - 1e-9 && vt > 1e-12 ? 1 : 0;
          if (pousse && !s.butee) { s.butees++; log("alerte", `La cabine du monte-charge ${s.ref} arrive en butée ${pousse > 0 ? "en haut" : "en bas"} et ${s.mot.ref} force : il est bloqué et chauffe.`, { refs: [s.ref, s.mot.ref] }); }
          s.butee = pousse;
          if (s.mot && pousse) s.mot.bloque = true;
          // danger : le moteur reçoit l'ordre de tourner (contacteur fermé, ou ordre LI1/LI2 donné au variateur ; sa rampe de
          // décélération après l'ordre d'arrêt n'en est pas un) alors que la porte est ouverte
          const va = s.mot && s.mot.var, commande = !!s.mot && (va ? va.alim && va.ordre !== 0 : tourne(s.mot));
          if (commande && !s.porte && !s.danger) { s.danger = true; s.dangers++; log("erreur", `Danger : la cabine du monte-charge ${s.ref} bouge alors que la porte est ouverte ! Elle ne doit partir que porte fermée${s.cP ? " (" + s.cP.ref + " actionné)" : ""}.`, { refs: [s.ref] }); }
          if (!commande || s.porte) s.danger = false;
        } else if (s.sorte === "station") {
          const q = debitStation(s, false), c = consoSt(s);
          let n = s.niv + (q - c) * dt;
          if (n >= 1 - 1e-9) { n = 1; if (q > c && !s.deborde) { s.deborde = true; s.debords++; log("erreur", `La bâche de la station ${s.ref} déborde ! Les pompes auraient dû s'arrêter au niveau haut.`, { refs: [s.ref] }); } }
          else if (n < 0.97) s.deborde = false;
          if (n <= 1e-9) { n = 0; if (c > q && !s.vide) { s.vide = true; log("alerte", `La bâche de la station ${s.ref} est vide.`, { refs: [s.ref] }); } }
          else if (n > 0.02) s.vide = false;
          s.niv = n;
          const env = s.mots.filter((m) => tourne(m) && m.sens !== 1).map((m) => m.ref);
          s.envers = env.length ? env : false;
        } else {
          const q = debitCuve(s, false), c = s.conso / dureeCuve(s);
          let n = s.niv + (q - c) * dt;
          if (n >= 1 - 1e-9) { n = 1; if (q > c && !s.deborde) { s.deborde = true; s.debords++; log("erreur", `La cuve ${s.ref} déborde ! La pompe ${s.mot ? s.mot.ref + " " : ""}aurait dû s'arrêter au niveau haut.`, { refs: [s.ref] }); } }
          else if (n < 0.97) s.deborde = false;
          if (n <= 1e-9) { n = 0; if (c > q && !s.vide) { s.vide = true; log("alerte", `La cuve ${s.ref} est vide.`, { refs: [s.ref] }); } }
          else if (n > 0.02) s.vide = false;
          s.niv = n;
          s.envers = tourne(s.mot) && s.mot.sens !== 1;
        }
      }
      if (appliquerCapteurs()) sale = true;
    }
    function prochainSysteme(s) {
      if (bande(s)) {   // le prochain bord de caisse devant le capteur, dans un sens ou dans l'autre ; et la course du vérin
        let te = Infinity;
        const vt = vitCible(s, true), vm = Math.max(Math.abs(s.vit), Math.abs(vt));
        if (vm >= 1e-12) {
          const G = geoT(s), u = s.pos - xsT(s);
          let dist = Infinity;
          if (u < 0) dist = -u;
          else {
            const k = Math.floor(u / G.d), r = u - k * G.d;
            if (!(G.N && k >= G.N)) { const devant = r <= W_T; dist = Math.min(devant ? W_T - r : G.d - r, devant ? r : r - W_T); }
          }
          if (dist < Infinity) te = t + Math.max(dist / vm, 0.5);
        }
        if (s.sorte === "tri" && !s.coince) {
          const but = s.ev && s.ev.alim ? 1 : 0;
          if (Math.abs(but - s.r) > 1e-9) {
            const v = 1 / (clamp(Number(M.parametres(s.principal).course) || 0.5, 0.1, 10) * 1000);
            let d = Infinity; for (const y of SEUILS_V) if ((y - s.r) * (but - s.r) > 0 && Math.abs(y - s.r) > 1e-7) d = Math.min(d, Math.abs(y - s.r));
            if (d < Infinity) te = Math.min(te, t + Math.max(d / v, 0.5));
          }
        }
        return te;
      }
      if (s.sorte === "barriere") return prochainBarriere(s);
      let x, vm, seuils;
      if (s.sorte === "chariot" || s.sorte === "montecharge") {
        x = s.pos; seuils = s.sorte === "chariot" ? SEUILS_CH : SEUILS_MC;
        const vt = vitCible(s, true);
        if (s.butee && Math.sign(vt) === s.butee && Math.abs(s.vit) < 1e-12) return Infinity;   // il pousse contre la butée : il ne bouge plus
        vm = Math.max(Math.abs(s.vit), Math.abs(vt));
      } else {
        const st = s.sorte === "station";
        x = s.niv; seuils = st ? SEUILS_ST : SEUILS_CU;
        const c = st ? consoSt(s) : s.conso / dureeCuve(s), q0 = st ? debitStation(s, false) : debitCuve(s, false), q1 = st ? debitStation(s, true) : debitCuve(s, true);
        if ((x >= 1 - 1e-9 && q1 >= c) || (x <= 1e-9 && c >= q1)) return Infinity;   // pleine qui déborde, ou vide
        vm = Math.max(Math.abs(q0 - c), Math.abs(q1 - c));
      }
      if (vm < 1e-12) return Infinity;
      let d = Infinity;
      for (const y of seuils) { const dd = Math.abs(y - x); if (dd > 1e-7) d = Math.min(d, dd); }
      return d === Infinity ? Infinity : t + Math.max(d / vm, 0.5);
    }
    const SEUILS_MC = [0, 0.04, 0.05, 0.15, 0.16, 0.84, 0.85, 0.95, 0.96, 1], SEUILS_ST = [0, 0.09, 0.11, 0.29, 0.31, 0.69, 0.71, 0.89, 0.91, 1];
    const SEUILS_BA = [0, 0.04, 0.05, VOIE.garde, VOIE.passe, 0.95, 0.96, 1];
    function prochainBarriere(s) {
      let te = Infinity;
      const vt = vitCible(s, true), bloquee = (s.butee && Math.sign(vt) === s.butee) || (s.surVoiture && vt < 0);
      if (!(bloquee && Math.abs(s.vit) < 1e-12)) {   // la lisse : son prochain seuil
        const vm = Math.max(Math.abs(s.vit), Math.abs(vt));
        if (vm >= 1e-12) { let d = Infinity; for (const y of SEUILS_BA) { const dd = Math.abs(y - s.pos); if (dd > 1e-7) d = Math.min(d, dd); } if (d < Infinity) te = t + Math.max(d / vm, 0.5); }
      }
      s.voitures.forEach((v, k) => {   // les voitures qui roulent : le prochain bord de zone (avant ou arrière), ou là où elles s'arrêtent
        const L = limiteVoiture(s, k); if (v.x >= L - 1e-9) return;
        let d = L - v.x;
        for (const b of BORDS_VOIE) { const d1 = b - v.x, d2 = b - (v.x - VOIE.long); if (d1 > 1e-7) d = Math.min(d, d1); if (d2 > 1e-7) d = Math.min(d, d2); }
        if (d < Infinity) te = Math.min(te, t + Math.max(d / VOIE.vit, 0.5));
      });
      return te;
    }
    appliquerCapteurs();

    /* ----- moteurs ----- */
    const phaseDe = (p) => { const i = info(p); return i && i.chaud && (i.net === "R" || i.net.indexOf("V:") === 0) ? i.ph : null; };
    const varDe = (L) => { const V = L.map((p) => (info(p) && info(p).var) || null); return V.every((v) => v && v === V[0]) ? V[0] : V.some(Boolean) ? "mixte" : null; };
    function sensDe(ph) { return (ph[1] - ph[0] + 3) % 3 === 1 ? 1 : -1; }
    function analyserMoteur(mo, uf, m) {
      const pc = mo.pc, d = mo.d, pb = (b) => potDe(uf, m, nd(pc, b));
      let etatM = "arret", sens = 0, couplage = null, niveau = 0, detail = "";
      const avecAutre = (L) => L.some((p) => p && phaseDe(p) === null);
      let vr = null;
      if (pc.type === "moteur") {
        const P = ["U", "V", "W"].map(pb), ph = P.map(phaseDe), n = new Set(ph.filter((x) => x !== null)).size;
        vr = varDe(P);
        if (vr === "mixte") detail = "branchement";
        else if (n === 3) { etatM = "marche"; sens = sensDe(ph); niveau = 1; }
        else if (n === 2) etatM = "2ph";
        if (avecAutre(P) && n > 0) detail = "branchement";
      } else {
        const P = d.principal ? M.parametres(d.principal) : {}, nominal = P.plaque === "230/400" ? 230 : 400;
        const h = ["U1", "V1", "W1"].map(pb), b = ["U2", "V2", "W2"].map(pb), ph1 = h.map(phaseDe);
        const r2 = ["U2", "V2", "W2"].map((x) => uf.find(Math.max(0, nd(pc, x))));
        vr = varDe(h);
        const n1 = new Set(ph1.filter((x) => x !== null)).size;
        const toutes = new Set(h.concat(b).map(phaseDe).filter((x) => x !== null)).size;
        const u = [0, 1, 2].map((k) => tension(h[k], b[k]));
        let vEnr = null;
        if (r2[0] === r2[1] && r2[1] === r2[2] && !m.has(r2[0])) {   // U2, V2, W2 réunies, sans potentiel : point étoile
          if (n1 === 3) { couplage = "etoile"; vEnr = 230; } else if (n1 === 2) etatM = "2ph";
        } else if (u.every((x) => x.v === 400) && n1 === 3) { couplage = "triangle"; vEnr = 400; }
        else if (u.every((x) => x.v === 230) && n1 === 3) { couplage = "etoile"; vEnr = 230; }
        else if (u.some((x) => x.v > 0)) etatM = toutes >= 3 ? "couplage" : "2ph";
        if (vEnr) {
          sens = sensDe(ph1);
          const r = vEnr / nominal;
          if (r > 1.3) { etatM = "surtension"; niveau = 1; }
          else { etatM = "marche"; niveau = r < 0.8 ? 0.72 : 1; }
        }
        if (avecAutre(h) && toutes > 0) detail = "branchement";
      }
      if (vr === "mixte") { etatM = "arret"; niveau = 0; vr = null; }
      if (d.grille) { etatM = "grille"; niveau = 0; sens = 0; }
      d.etatM = etatM; d.couplage = couplage; d.niveau = niveau; d.detail = detail; d.var = vr;
      if (etatM === "marche" || etatM === "surtension") d.sens = sens;
      d.terre = potDe(uf, m, nd(pc, "PE")) === "PE";
    }
    const chauffant = (d) => !d.grille && (d.etatM === "2ph" || d.etatM === "couplage" || d.etatM === "surtension" || (d.bloque && d.etatM === "marche"));
    function integrer(dt) {
      for (const d of variateurs) rampe(d, dt);
      for (const { d } of moteurs) {
        let cible = 0;
        const marche = d.etatM === "marche" || d.etatM === "surtension";
        if (marche) cible = d.bloque ? 0 : d.sens * d.niveau * (d.var ? Math.abs(d.var.fs) / 50 : 1);
        else if (d.etatM === "2ph" && Math.abs(d.w) > 0.25) cible = Math.sign(d.w) * 0.8;   // il tournait : il continue en peinant
        d.w += (cible - d.w) * (1 - Math.exp(-dt / (marche && d.var ? 140 : 700)));   // sur variateur, le moteur suit la rampe
        if (Math.abs(d.w) < 1e-4 && cible === 0) d.w = 0;
        if (chauffant(d)) d.chauffe += dt; else d.chauffe = Math.max(0, d.chauffe - dt / 2);
        if (!chauffant(d) && d.chauffe === 0) d.tente = false;
      }
      integrerSystemes(dt);
    }
    const SEUIL_TH = 4000, SEUIL_GRILLE = 9000;
    function cheminMoteur(mo, c) {
      if (!dernier) return false;
      const u2 = unir(c), m2 = potentiels(u2), bornes = mo.pc.type === "moteur" ? ["U", "V", "W"] : ["U1", "V1", "W1", "U2", "V2", "W2"];
      return bornes.some((b) => potDe(dernier.uf, dernier.m, nd(mo.pc, b)) !== potDe(u2, m2, nd(mo.pc, b)));
    }
    function traiterChauffe() {
      for (const mo of moteurs) {
        const d = mo.d;
        if (!chauffant(d)) continue;
        const pourquoi = d.bloque && d.etatM === "marche" ? "est bloqué (le chariot force contre la butée)" : d.etatM === "2ph" ? "marche sur deux phases" : d.etatM === "surtension" ? "a ses enroulements sous une tension trop forte" : "est mal couplé";
        if (d.chauffe >= SEUIL_TH - 1e-6 && !d.tente) {
          d.tente = true;
          const c = condValides.find((x) => x.therm && x.ferme() && !(x.therm.sorte === "thermique" && x.therm.declenche) && cheminMoteur(mo, x));
          if (c) {
            const th = c.therm;
            if (th.sorte === "thermique") th.declenche = true; else { th.ferme = false; th.declenche = true; }
            log("erreur", `${d.ref} ${pourquoi} et chauffe : ${th.ref} a déclenché.`, { refs: [th.ref, d.ref], thermique: true });
            d.chauffe = 0; sale = true;
          } else log("alerte", `${d.ref} ${pourquoi} et chauffe, et aucun relais thermique ne le protège !`, { refs: [d.ref] });
        }
        if (d.chauffe >= SEUIL_GRILLE - 1e-6 && chauffant(d)) {
          d.grille = true; d.etatM = "grille"; sale = true;
          log("erreur", `${d.ref} a grillé : il ${pourquoi} depuis trop longtemps sans protection.`, { refs: [d.ref] });
        }
      }
    }
    function prochain() {
      let e = Infinity;
      for (const d of bobines) {
        if (d.sorte === "travail" && d.alim && t - d.depuis < d.delai - 1e-6) e = Math.min(e, d.depuis + d.delai);
        if (d.sorte === "repos" && !d.alim && !d.jamais && t - d.depuis < d.delai - 1e-6) e = Math.min(e, d.depuis + d.delai);
      }
      for (const { d } of moteurs) if (chauffant(d)) {
        const seuil = d.tente ? SEUIL_GRILLE : SEUIL_TH;
        if (d.chauffe < seuil - 1e-6) e = Math.min(e, t + (seuil - d.chauffe));
      }
      for (const d of automates) if (d.actif) { const pe = d.api.prochain(); if (pe < Infinity) e = Math.min(e, Math.max(pe, t + 0.001)); }
      for (const d of variateurs) e = Math.min(e, finRampe(d));
      for (const s of systemes) e = Math.min(e, prochainSysteme(s));
      return e;
    }
    function avancer(ms) {
      const fin = t + Math.max(0, Number(ms) || 0);
      for (let garde = 0; garde < 100000; garde++) {
        const e = prochain(), jusqua = Math.min(e, fin);
        if (jusqua > t) { integrer(jusqua - t); t = jusqua; }
        if (e <= fin) { traiterChauffe(); evaluer(); } else break;
      }
      if (sale) evaluer();
      return api;
    }

    /* ----- actions de l'utilisateur (ou, plus tard, d'un automate) ----- */
    function action(ref, quoi, valeur) {
      const d = dev[ref]; if (!d) return false;
      const S = d.sorte;
      if (d.pilote && /^(appuyer|relacher|basculer)$/.test(quoi)) return false;   // c'est le chariot ou l'eau qui l'actionne
      if (quoi === "voiture") {   // barrière : une voiture arrive (5 au plus sur la voie)
        if (S !== "barriere" || d.voitures.length >= 5) return false;
        const der = d.voitures[d.voitures.length - 1];
        d.voitures.push({ x: der ? Math.min(VOIE.entree, der.x - VOIE.long - VOIE.ecart) : VOIE.entree, choc: false });
        appliquerCapteurs(); evaluer(); return true;
      }
      if (S === "montecharge" && (quoi === "ouvrir" || quoi === "fermer" || quoi === "porte")) {   // la porte palière
        const v = quoi === "porte" ? (valeur == null ? !d.porte : !!valeur) : quoi === "fermer";
        if (v !== d.porte) { d.porte = v; log("info", `Porte du monte-charge ${d.ref} ${v ? "fermée" : "ouverte"}.`, { refs: [d.ref] }); }
        appliquerCapteurs(); evaluer(); return true;
      }
      if (quoi === "appuyer") { if (S === "bouton") d.appuye = true; else if (MULTI.has(S)) d.actionne = true; else return false; }
      else if (quoi === "relacher") { if (S === "bouton") d.appuye = false; else if (S !== "au" && MULTI.has(S)) d.actionne = false; else return false; }
      else if (quoi === "maintenir") { if (S !== "bouton") return false; d.maintenu = valeur == null ? !d.maintenu : !!valeur; }
      else if (quoi === "coincer") {   // panne de la partie opérative : la tige du vérin du tapis de tri ne bouge plus
        if (S !== "tri") return false;
        const v = valeur == null ? !d.coince : !!valeur;
        if (v === d.coince) return true;
        d.coince = v;
        log(v ? "alerte" : "info", v ? `Panne : la tige du vérin de ${d.ref} est bloquée.` : `Panne réparée : la tige du vérin de ${d.ref} bouge de nouveau.`, { refs: [d.ref] });
      } else if (quoi === "regler") {   // potentiomètre, ou molette du variateur : valeur de 0 à 1
        const v = clamp(Number(valeur) || 0, 0, 1);
        if (S === "potentiometre") d.pos = v; else if (S === "variateur") d.molette = v; else if (S === "cuve" || S === "station") d.conso = v; else return false;
      } else if (quoi === "run" || quoi === "stop") { if (S !== "automate") return false; d.run = quoi === "run"; }
      else if (quoi === "basculer") {
        if (S === "automate") d.run = !d.run;
        else if (S === "bouton") d.maintenu = !d.maintenu;
        else if (MULTI.has(S)) d.actionne = !d.actionne;
        else if (S === "sectionneur" || S === "disjoncteur" || S === "disj_moteur") { if (d.ferme) d.ferme = false; else { d.ferme = true; d.declenche = false; } }
        else if (S === "thermique") d.declenche = !d.declenche;
        else return false;
      } else if (quoi === "ouvrir") { if (d.ferme === undefined) return false; d.ferme = false; }
      else if (quoi === "fermer") { if (d.ferme === undefined) return false; d.ferme = true; d.declenche = false; }
      else if (quoi === "surcharge") {
        if (S === "thermique") { if (d.declenche) return false; d.declenche = true; }
        else if (S === "disj_moteur") { if (!d.ferme) return false; d.ferme = false; d.declenche = true; }
        else return false;
        log("info", `Surcharge : ${d.ref} a déclenché.`, { refs: [d.ref], surcharge: true });
      } else if (quoi === "rearmer") {
        if (S === "thermique") d.declenche = false;
        else if (S === "disjoncteur" || S === "disj_moteur") { d.ferme = true; d.declenche = false; }
        else if (S === "fusible") d.fondu = false;
        else if (S === "sectionneur") { d.fondus = [false, false, false]; d.ferme = true; }
        else return false;
      } else return false;
      evaluer();
      return true;
    }
    function rearmerAlimentation() { if (!defaut) return false; defaut = null; log("info", "Alimentation remise."); evaluer(); return true; }
    function reinitialiser() {
      for (const d of appareils) etatInitial(d);
      appliquerCapteurs();
      defaut = null; t = 0; journal.length = 0; courts.length = 0; vibrentAvant = new Set(); oscilleAvant = false; evaluer(); return api;
    }

    /* ----- ce que la page (ou un essai) lit ----- */
    function messages() {
      const L = remarques.slice();
      if (!dernier) return L;
      const { uf, m } = dernier;
      if (defaut) L.push({ niveau: "erreur", texte: "Court-circuit : l'alimentation est coupée. Corrige le schéma, puis « Remettre le courant ».", refs: [] });
      for (const ch of charges) {
        const d = ch.d, quoi = ch.sorte === "voyant" ? "Le voyant" : ch.sorte === "transfo" ? "Le primaire du transformateur" : ch.sorte === "capteur3" ? "Le capteur" : ch.sorte === "ev" ? "La bobine de l'électrovanne" : "La bobine";
        if (ch.coupee) continue;
        if (d.grille) { L.push({ niveau: "erreur", texte: ch.sorte === "capteur3" ? `Le capteur ${d.ref} est détruit (mauvaise tension).` : `${quoi} ${d.ref} a grillé (mauvaise tension).`, refs: [d.ref] }); continue; }
        const j = jugerCharge(ch, uf, m);
        if (ch.sorte === "capteur3") {
          if (j.etat === "inverse") L.push({ niveau: "alerte", texte: `Le capteur ${d.ref} est branché à l'envers : BN (marron) va au +24 V, BU (bleu) au 0 V.`, refs: [d.ref] });
          else if (!j.on && (potDe(uf, m, ch.n1) || potDe(uf, m, ch.n2)) && !j.etat) L.push({ niveau: "alerte", texte: `Le capteur ${d.ref} n'est pas alimenté : BN (marron) au +24 V, BU (bleu) au 0 V. Sa sortie BK ne donne rien sans lui.`, refs: [d.ref] });
        }
        if (j.etat === "faible") L.push({ niveau: "alerte", texte: `${quoi} ${d.ref} (${txtTension(ch.cote)}) ne reçoit que ${txtTension(j.u)} : ${ch.sorte === "voyant" ? "il ne s'allume pas" : "rien ne se passe"}.`, refs: [d.ref] });
        else if (j.etat === "nature") L.push({ niveau: "alerte", texte: `${quoi} ${d.ref} est prévu${ch.sorte === "bobine" || ch.sorte === "ev" ? "e" : ""} pour ${txtTension(ch.cote)} et reçoit ${txtTension(j.u)} : ça ne convient pas.`, refs: [d.ref] });
        else if (j.etat === "sources") L.push({ niveau: "alerte", texte: `${quoi} ${d.ref} a ses deux bornes sur deux alimentations différentes : il n'y a pas de tension entre elles.`, refs: [d.ref] });
      }
      for (const { d } of moteurs) {
        if (d.etatM === "2ph") L.push({ niveau: "alerte", texte: `${d.ref} marche sur deux phases : ${Math.abs(d.w) > 0.3 ? "il peine" : "il ronfle sans démarrer"} et chauffe.`, refs: [d.ref] });
        if (d.etatM === "couplage") L.push({ niveau: "alerte", texte: `${d.ref} est mal couplé (ni en étoile, ni en triangle) : il ne démarre pas et chauffe.`, refs: [d.ref] });
        if (d.etatM === "surtension") L.push({ niveau: "alerte", texte: `${d.ref} : en triangle sur 400 V, ses enroulements prévus pour 230 V sont en surtension. Couple-le en étoile.`, refs: [d.ref] });
        if (d.detail === "branchement") L.push({ niveau: "alerte", texte: `${d.ref} : une borne du moteur est reliée au neutre, à la terre ou à une autre source. Le moteur ne se branche que sur L1, L2, L3.`, refs: [d.ref] });
        if (d.grille) L.push({ niveau: "erreur", texte: `${d.ref} a grillé. « Tout remettre à zéro » pour recommencer.`, refs: [d.ref] });
        if ((d.etatM === "marche" || d.etatM === "surtension") && !d.terre) L.push({ niveau: "info", texte: `${d.ref} : sa carcasse n'est pas reliée à la terre (borne PE). Danger en cas de défaut !`, refs: [d.ref] });
      }
      for (const k of vibrentAvant) L.push({ niveau: "alerte", texte: `${dev[k].ref} vibre : sa bobine se coupe elle-même.`, refs: [dev[k].ref] });
      for (const d of automates) {
        const nE = d.api.erreurs.length;
        if (d.grille) L.push({ niveau: "erreur", texte: `${d.ref} est détruit (mauvaise alimentation). Corrige le schéma, puis « Tout remettre à zéro ».`, refs: [d.ref] });
        else if (!d.alim) L.push({ niveau: "alerte", texte: d.alimTxt === "inverse" ? `${d.ref} : son alimentation est inversée (le +24 V arrive sur la borne 0V).` : d.alimTxt === "nature" ? `${d.ref} s'alimente en 24 V continu : il ne marche pas en alternatif.` : `${d.ref} n'est pas alimenté : relie sa borne +24V au +24 V et sa borne 0V au 0 V.`, refs: [d.ref] });
        else if (!d.run) L.push({ niveau: "info", texte: `${d.ref} est en STOP : il n'exécute pas son programme et ses sorties restent ouvertes.`, refs: [d.ref] });
        if (nE) L.push({ niveau: "alerte", texte: `Le programme de ${d.ref} a ${nE > 1 ? nE + " erreurs" : "une erreur"} : ${d.api.erreurs[0].texte}`, refs: [d.ref] });
        if (d.actif && d.instable) L.push({ niveau: "alerte", texte: `Le programme de ${d.ref} ne se stabilise pas : une sortie change à chaque cycle (une bobine se coupe elle-même ?).`, refs: [d.ref] });
        if (d.actif && d.fugaces) L.push({ niveau: "alerte", texte: `Le GRAFCET de ${d.ref} tourne en rond sans s'arrêter : des réceptivités toujours vraies forment une boucle.`, refs: [d.ref] });
        for (const k of d.ko) L.push({ niveau: "erreur", texte: `L'entrée %I0.${k} de ${d.ref} est détruite (« Tout remettre à zéro » après correction).`, refs: [d.ref] });
      }
      for (const s of systemes) {
        if (s.sorte === "chariot" && s.butee) { const c = s.butee > 0 ? s.cD : s.cG; L.push({ niveau: "alerte", texte: `Le chariot ${s.ref} force contre la butée ${s.butee > 0 ? "de droite" : "de gauche"} : ${s.mot.ref} est bloqué et chauffe. Il doit s'arrêter quand le chariot actionne ${c ? c.ref : "le fin de course"}.`, refs: [s.ref] }); }
        if (s.sorte === "tri" && s.coince) L.push({ niveau: "alerte", texte: `Panne : la tige du vérin de ${s.ref} est bloquée${s.ev && s.ev.alim && s.r < 0.98 ? ` : ${s.ev.ref} est alimentée, mais la tige ne sort pas` : !(s.ev && s.ev.alim) && s.r > 0.02 ? " : elle ne rentre pas" : ""}. Clique sur « Débloquer la tige » pour la réparer.`, refs: [s.ref] });
        if (s.sorte === "tri" && s.cote) L.push({ niveau: "alerte", texte: `${s.cote} caisse${s.cote > 1 ? "s sont tombées" : " est tombée"} à côté des bacs : le volet de ${s.ref} doit être en place avant qu'une caisse tombe (le vérin met ${String(M.parametres(s.principal).course).replace(".", ",")} s à faire sa course).`, refs: [s.ref] });
        if ((s.sorte === "barriere" || s.sorte === "montecharge") && s.butee) {
          const c = s.butee > 0 ? s.cH : s.cB, ba = s.sorte === "barriere";
          L.push({ niveau: "alerte", texte: `${ba ? "La lisse de la barrière" : "La cabine du monte-charge"} ${s.ref} force contre la butée ${s.butee > 0 ? "du haut" : "du bas"} : ${s.mot.ref} est bloqué et chauffe. Il doit s'arrêter quand ${c ? c.ref + " est actionné" : "le capteur est actionné"}.`, refs: [s.ref] });
        }
        if (s.sorte === "barriere" && s.surVoiture) L.push({ niveau: "erreur", texte: `La lisse de la barrière ${s.ref} est posée sur une voiture : ${s.mot ? s.mot.ref : "le moteur"} force pour la descendre.`, refs: [s.ref] });
        if (s.sorte === "montecharge" && !s.porte) L.push({ niveau: "info", texte: `La porte du monte-charge ${s.ref} est ouverte${s.cP ? ` (${s.cP.ref} au repos)` : ""} : la cabine ne doit pas bouger.`, refs: [s.ref] });
        if (s.sorte === "station") {
          if (s.deborde) L.push({ niveau: "erreur", texte: `La bâche de la station ${s.ref} déborde ! Les pompes doivent s'arrêter quand l'eau atteint ${s.cN[2] ? s.cN[2].ref + " (électrode haut)" : "le niveau haut"}.`, refs: [s.ref] });
          else if (s.vide) L.push({ niveau: "alerte", texte: `La bâche de la station ${s.ref} est vide.`, refs: [s.ref] });
          if (s.envers) L.push({ niveau: "alerte", texte: `${s.envers.length > 1 ? "Les pompes " + s.envers.join(" et ") + " tournent" : "La pompe " + s.envers[0] + " tourne"} dans le sens 2 : ${s.envers.length > 1 ? "elles ne pompent" : "elle ne pompe"} pas. Croise deux phases.`, refs: [s.ref] });
        }
        if (s.sorte === "cuve") {
          if (s.deborde) L.push({ niveau: "erreur", texte: `La cuve ${s.ref} déborde ! La pompe doit s'arrêter quand l'eau atteint ${s.cH ? s.cH.ref + " (niveau haut)" : "le niveau haut"}.`, refs: [s.ref] });
          else if (s.vide) L.push({ niveau: "alerte", texte: `La cuve ${s.ref} est vide.`, refs: [s.ref] });
          if (s.envers) L.push({ niveau: "alerte", texte: `La pompe ${s.mot.ref} tourne dans le sens 2 : elle ne pompe pas. Croise deux phases.`, refs: [s.ref] });
        }
      }
      for (const d of variateurs) {
        if (d.grille) L.push({ niveau: "erreur", texte: `${d.ref} est détruit. Corrige le schéma, puis « Tout remettre à zéro ».`, refs: [d.ref] });
        else if (d.defaut === "PHF") L.push({ niveau: "alerte", texte: `${d.ref} affiche PHF : il manque une phase sur ses bornes L1, L2, L3.`, refs: [d.ref] });
        else if (d.alim) {
          if (d.deux) L.push({ niveau: "alerte", texte: `${d.ref} reçoit en même temps l'ordre avant (LI1) et l'ordre arrière (LI2) : il ne démarre pas.`, refs: [d.ref] });
          else if (d.ordre && d.fRef < 0.05) L.push({ niveau: "alerte", texte: d.origine === "AI1" ? `${d.ref} a l'ordre de marche, mais sa consigne est 0 Hz : AI1 reçoit 0 V. Branche un potentiomètre (+10V, AI1, COM), la sortie analogique d'un automate, ou une vitesse présélectionnée (LI3, LI4).` : `${d.ref} a l'ordre de marche, mais sa consigne est 0 Hz.`, refs: [d.ref] });
          if (d.aiTrop) L.push({ niveau: "alerte", texte: `L'entrée AI1 de ${d.ref} reçoit plus de 10 V : c'est une entrée 0-10 V (consigne).`, refs: [d.ref] });
        }
      }
      for (const d of appareils) {
        if (d.sorte === "thermique" && d.declenche) L.push({ niveau: "alerte", texte: `${d.ref || "Le relais thermique"} a déclenché : « Réarmer » quand le défaut est réglé.`, refs: [d.ref] });
        if ((d.sorte === "disjoncteur" || d.sorte === "disj_moteur") && d.declenche) L.push({ niveau: "alerte", texte: `${d.ref} a déclenché : « Réarmer » quand le défaut est réglé.`, refs: [d.ref] });
        if (d.sorte === "fusible" && d.fondu) L.push({ niveau: "alerte", texte: `Le fusible ${d.ref} a fondu : « Remplacer » quand le défaut est réglé.`, refs: [d.ref] });
        if (d.sorte === "sectionneur" && d.fondus.some(Boolean)) L.push({ niveau: "alerte", texte: `Des fusibles de ${d.ref} ont fondu : « Remplacer » quand le défaut est réglé.`, refs: [d.ref] });
      }
      return L;
    }
    function etat() {
      const pieceEtat = {};
      const noeuds = new Array(NB).fill(null);
      if (dernier) {
        const { uf, m } = dernier;
        for (let i = 0; i < NB; i++) { const e = m.get(uf.find(i)); noeuds[i] = e ? (e.size === 1 ? e.values().next().value : "!") : null; }
      }
      for (const c of condValides) {
        const o = pieceEtat[c.pc.id] || (pieceEtat[c.pc.id] = {});
        if (!o.fermes) o.fermes = [];
        o.fermes[c.i] = (c.meca || c.ferme)();
        o.ferme = o.fermes[0];
      }
      for (const pc of pieces) {
        const d = devDe.get(pc.id); if (!d) continue;
        const o = pieceEtat[pc.id] || (pieceEtat[pc.id] = {});
        o.actionne = actionne(d);
        if (A_BOBINE.has(d.sorte) && M.BOBINES.indexOf(pc.type) >= 0) { o.alim = d.alim; o.grille = d.grille; o.prog = progression(d); o.vibre = vibrentAvant.has(d.cle); o.tempo = d.sorte === "travail" || d.sorte === "repos"; }
        else if (d.sorte === "voyant" || d.sorte === "transfo" || d.sorte === "electrovanne") { o.alim = d.alim; o.grille = d.grille; }
        else if (d.sorte === "thermique") o.declenche = d.declenche;
        else if (d.sorte === "sectionneur") { o.ouvert = !d.ferme; o.fondus = d.fondus.slice(); }
        else if (d.sorte === "disjoncteur" || d.sorte === "disj_moteur") { o.ouvert = !d.ferme; o.declenche = d.declenche; }
        else if (d.sorte === "fusible") o.fondu = d.fondu;
        else if (d.sorte === "moteur") Object.assign(o, { etatM: d.etatM, w: d.w, sens: d.sens, couplage: d.couplage, chauffe: d.chauffe / SEUIL_TH, grille: d.grille, terre: d.terre });
        if (d.sorte === "bouton") { o.appuye = d.appuye; o.maintenu = d.maintenu; }
        if (d.sorte === "automate") Object.assign(o, { alim: d.alim, actif: d.actif, run: d.run, grille: d.grille, entrees: d.entrees.slice(), sorties: d.sorties.slice(), aq: d.aq, ko: [...d.ko], X: d.actif ? d.api.etat().X : [] });
        if (d.sorte === "variateur") Object.assign(o, { alim: d.alim, grille: d.grille, defaut: d.defaut, f: d.fs, cible: d.cible, LI: d.LI.slice(), ordre: d.ordre });
        if (d.sorte === "potentiometre") o.pos = d.pos;
        // partie opérative : sa position (ou son niveau), et l'état des capteurs qu'elle actionne (null : pas relié)
        const ac = (x) => (x ? !!x.actionne : null);
        if (d.sorte === "chariot") Object.assign(o, { po: 1, pos: d.pos, vit: d.vit, butee: d.butee, cg: ac(d.cG), cd: ac(d.cD), mot: d.mot ? d.mot.ref : null });
        if (d.sorte === "tapis" || d.sorte === "tri") Object.assign(o, { po: 1, pos: d.pos, vit: d.vit, vues: d.vues, bac: d.bac, reste: geoT(d).N ? geoT(d).N - d.entrees : -1, cc: ac(d.cC), mot: d.mot ? d.mot.ref : null });
        if (d.sorte === "tri") Object.assign(o, { r: d.r, bac1: d.bac1, bac2: d.bac2, cote: d.cote, cr: ac(d.cR), cs: ac(d.cS), ev: d.ev ? !!d.ev.alim : null, coince: !!d.coince });
        if (d.sorte === "cuve") Object.assign(o, { po: 1, niv: d.niv, deborde: d.deborde, vide: d.vide, pompe: debitCuve(d, false) > 0, conso: d.conso, cb: ac(d.cB), ch: ac(d.cH), mot: d.mot ? d.mot.ref : null });
        if (d.sorte === "station") Object.assign(o, { po: 1, niv: d.niv, deborde: d.deborde, vide: d.vide, conso: d.conso, pompes: d.mots.map((m) => pompeSt(m, false) > 0), cn: d.cN.map(ac), mots: d.mots.map((m) => (m ? m.ref : null)) });
        if (d.sorte === "barriere") Object.assign(o, { po: 1, pos: d.pos, vit: d.vit, butee: d.butee, ch: ac(d.cH), cb: ac(d.cB), ca: ac(d.cA), cv: ac(d.cV), voitures: d.voitures.map((v) => v.x), chocV: d.voitures.map((v) => !!v.choc),
          nv: d.voitures.length, passees: d.passees, chocs: d.chocs, surVoiture: d.surVoiture, mot: d.mot ? d.mot.ref : null });
        if (d.sorte === "montecharge") Object.assign(o, { po: 1, pos: d.pos, vit: d.vit, butee: d.butee, cb: ac(d.cB), ch: ac(d.cH), crb: ac(d.cRB), crh: ac(d.cRH), cp: ac(d.cP), porte: d.porte,
          danger: d.danger, mot: d.mot ? d.mot.ref : null });
        if (pc.type === "capteur3") Object.assign(o, { alim: d.alim, grille: d.grille });
        if (d.pilote) o.pilote = d.piloteRef;
        if (pc.type === "contact_tno" || pc.type === "contact_tnf") { o.prog = progression(d); o.enCours = o.prog > 0 && o.prog < 1; }
      }
      const appareilsEtat = {};
      for (const d of appareils) {
        if (!d.ref || appareilsEtat[d.ref]) continue;
        const o = { sorte: d.sorte, actionne: actionne(d) };
        for (const k of ["alim", "grille", "declenche", "ferme", "fondu", "fondus", "appuye", "maintenu", "actionne", "etatM", "sens", "couplage", "w", "terre", "delai",
          "run", "actif", "entrees", "sorties", "aq", "fs", "cible", "defaut", "LI", "ai1", "ordre", "fRef", "origine", "pos", "molette", "deux",
          "vit", "butee", "butees", "niv", "conso", "deborde", "debords", "vide", "envers", "piloteRef", "bloque", "vues", "bac", "entrees", "r", "bac1", "bac2", "cote", "coince",
          "passees", "chocs", "surVoiture", "porte", "dangers", "danger", "brusques"]) if (d[k] !== undefined) o[k] = Array.isArray(d[k]) ? d[k].slice() : d[k];
        if (d.sorte === "barriere") o.voitures = d.voitures.length;
        if (d.sorte === "station") o.pompes = d.mots.map((m) => pompeSt(m, false) > 0);
        if (A_BOBINE.has(d.sorte)) o.prog = progression(d);
        if (d.sorte === "automate") { o.api = d.api.etat(); o.erreurs = d.api.erreurs.length; o.ko = [...d.ko]; }
        if (d.sorte === "moteur" && d.var) o.variateur = d.var.ref;
        appareilsEtat[d.ref] = o;
      }
      const recents = new Set();
      for (const c of courts) if (t - c.t < 2500) for (const n of c.noeuds) recents.add(n);
      return { t, defaut: !!defaut, noeuds, court: [...recents], pieces: pieceEtat, appareils: appareilsEtat, messages: messages(), journal: journal.slice() };
    }
    /* ----- le voltmètre (haute impédance) : ce qu'il lit entre deux bornes ----- */
    const voit = [];   // il « voit à travers » les récepteurs, les enroulements des moteurs, les entrées des automates
    for (const ch of charges) if (!ch.coupee) voit.push([ch.n1, ch.n2]);
    for (const { pc } of moteurs) {
      const b = (id) => nd(pc, id);
      if (pc.type === "moteur") voit.push([b("U"), b("V")], [b("V"), b("W")], [b("W"), b("U")]);
      else voit.push([b("U1"), b("U2")], [b("V1"), b("V2")], [b("W1"), b("W2")]);
    }
    for (const pc of pieces) {
      if (pc.type === "automate") { for (let k = 0; k < 8; k++) voit.push([nd(pc, "I" + k), nd(pc, "COM")]); voit.push([nd(pc, "p24"), nd(pc, "m0")]); }
      else if (pc.type === "transfo") voit.push([nd(pc, "s1"), nd(pc, "s2")]);
      else if (pc.type === "variateur") for (const li of ["LI1", "LI2", "LI3", "LI4"]) voit.push([nd(pc, li), nd(pc, "COM")]);
    }
    const voitOk = voit.filter(([x, y]) => x >= 0 && y >= 0);
    function vu(n) {   // le potentiel d'un point, vu par le voltmètre
      if (!dernier || n < 0) return { k: "air" };
      const { uf, m } = dernier, r0 = uf.find(n), e0 = m.get(r0);
      if (e0 && e0.size) return e0.size > 1 ? { k: "court" } : { k: "pot", p: e0.values().next().value };
      const va = vNoeud(uf, m, n, null, 0);
      if (typeof va === "number" && !Number.isNaN(va)) return { k: "dc", v: va };
      const vus = new Set([r0]), file = [r0], pots = new Set();   // point en l'air : on regarde à travers les récepteurs
      while (file.length) {
        const r = file.shift();
        for (const [x, y] of voitOk) {
          const rx = uf.find(x), ry = uf.find(y), autre = rx === r ? ry : ry === r ? rx : -1;
          if (autre < 0 || vus.has(autre)) continue;
          vus.add(autre);
          const e = m.get(autre);
          if (e && e.size) { for (const p of e) pots.add(p); continue; }
          file.push(autre);
        }
      }
      if (pots.size === 1) return { k: "pot", p: [...pots][0], via: true };
      return pots.size ? { k: "mix", pots: [...pots] } : { k: "air" };
    }
    const enDC = (X) => (X.k === "dc" ? X.v : X.k === "pot" && X.p === "+24" ? 24 : X.k === "pot" && X.p === "0V" ? 0 : null);
    // un point « entre deux potentiels » (à travers des récepteurs) : la moyenne des tensions complexes (récepteurs égaux)
    const ANG = { L1: 0, L2: -120, L3: 120 };
    function phasor(p) {
      const i = info(p); if (!i) return null;
      const pol = (m, a) => ({ re: m * Math.cos(a * Math.PI / 180), im: m * Math.sin(a * Math.PI / 180) });
      if (i.net === "R" || i.net === "PE") return Object.assign(i.chaud ? pol(230, ANG[p] || 0) : { re: 0, im: 0 }, { sys: "R" });
      if (i.net === "DC") return { re: p === "+24" ? 24 : 0, im: 0, sys: "DC" };
      if (i.net.indexOf("T:") === 0) return { re: i.chaud ? i.v : 0, im: 0, sys: i.net };
      if (i.net.indexOf("V:") === 0) return Object.assign(pol(230 * clamp(Math.abs((i.var && i.var.fs) || 0) / 50, 0, 1), [0, -120, 120][i.ph]), { sys: i.net });
      return null;
    }
    function phasorDe(X) {
      if (X.k === "dc") return { re: X.v, im: 0, sys: "DC" };
      if (X.k === "pot") return phasor(X.p);
      if (X.k !== "mix") return null;
      const L = X.pots.map(phasor);
      if (L.some((q) => !q || q.sys !== L[0].sys)) return null;
      return { re: L.reduce((a, q) => a + q.re, 0) / L.length, im: L.reduce((a, q) => a + q.im, 0) / L.length, sys: L[0].sys };
    }
    /* a, b : { piece, borne } (pointe rouge, pointe noire). Rend { v, ac, texte } ; v est signé en continu. */
    function mesurer(a, b) {
      const n1 = a ? nd({ id: a.piece }, a.borne) : -1, n2 = b ? nd({ id: b.piece }, b.borne) : -1;
      if (n1 < 0 || n2 < 0) return { v: null, texte: "—" };
      if (n1 === n2 && dernier && dernier.uf.find(n1) === dernier.uf.find(n2)) return { v: 0, ac: false, texte: "0 V" };
      const A = vu(n1), B = vu(n2);
      if (A.k === "court" || B.k === "court") return { v: null, texte: "court-circuit" };
      const zero = { v: 0, ac: false, texte: "0 V" };
      if (A.k === "air" || B.k === "air") return zero;
      if (A.k === "mix" || B.k === "mix") {   // une tension « partielle », à travers des récepteurs
        const pa = phasorDe(A), pb = phasorDe(B);
        if (!pa || !pb || pa.sys !== pb.sys) return zero;
        if (pa.sys === "DC") { const v = Math.round((pa.re - pb.re) * 10) / 10; return { v, ac: false, texte: v ? `${v < 0 ? "−" : ""}${nf1(Math.abs(v))} V continu` : "0 V" }; }
        const v = Math.round(Math.hypot(pa.re - pb.re, pa.im - pb.im));
        return v ? { v, ac: true, texte: `${v} V ~` } : zero;
      }
      const da = enDC(A), db = enDC(B);
      if (da != null && db != null) { const v = Math.round((da - db) * 10) / 10; return { v, ac: false, texte: v ? `${v < 0 ? "−" : ""}${nf1(Math.abs(v))} V continu` : "0 V" }; }
      if (da != null || db != null) return zero;   // continu d'un côté, alternatif de l'autre : deux circuits séparés
      const u = tension(A.p, B.p);
      if (u.inconnu || !u.v) return zero;
      let v = u.v;
      const iv = info(A.p) && info(A.p).var ? info(A.p).var : info(B.p) && info(B.p).var ? info(B.p).var : null;
      if (iv) v = Math.round(400 * clamp(Math.abs(iv.fs || 0) / 50, 0, 1));   // sortie d'un variateur : la tension suit la fréquence
      return { v, ac: true, texte: `${v} V ~` };
    }
    function enChemin(refProt, refMoteur) {   // les pôles de refProt portent-ils le courant de refMoteur ?
      const mo = moteurs.find((x) => x.d.ref === refMoteur); if (!mo) return false;
      return condValides.some((c) => c.pc.ref === refProt && (c.prot || c.therm) && c.ferme() && cheminMoteur(mo, c));
    }

    const api = {
      action, avancer, evaluer: () => { evaluer(); return api; }, etat, reinitialiser, rearmerAlimentation, enChemin,
      appuyer: (r) => action(r, "appuyer"), relacher: (r) => action(r, "relacher"), basculer: (r) => action(r, "basculer"),
      surcharge: (r) => action(r, "surcharge"), rearmer: (r) => action(r, "rearmer"),
      temps: () => t, journal: () => journal.slice(), netlist: netR, mesurer, appareils: () => appareils.map((d) => ({ ref: d.ref, sorte: d.sorte })),
      enMarche: () => moteurs.some(({ d }) => Math.abs(d.w) > 0.002 || d.etatM !== "arret") || bobines.some((d) => (d.sorte === "travail" || d.sorte === "repos") && progression(d) > 0 && progression(d) < 1) || variateurs.some((d) => d.fs !== 0 || d.cible !== 0),
      regler: (r, v) => action(r, "regler", v),
      prochainEvenement: prochain, aDefaut: () => !!defaut
    };
    evaluer();
    return api;
  }

  /* =====================================================================
     Les essais (défis) : on rejoue un scénario sur le schéma de l'élève, en temps fictif.
     étape : { texte, faire: [["appuyer", "S2"], …], attendre: ms, verifier: { KM1: true, H1: false, M1: "sens1", court: false }, si: "explication" }
     ===================================================================== */
  const ATTENDU_MOTEUR = { arret: "à l'arrêt", marche: "en marche", sens1: "en marche dans le sens 1", sens2: "en marche dans le sens 2", etoile: "en marche, couplé en étoile", triangle: "en marche, couplé en triangle" };
  function constat(sim, ref, attendu) {
    const E = sim.etat(), a = E.appareils[ref];
    if (ref === "court") {
      const c = E.journal.filter((e) => e.court);
      return { ok: attendu ? c.length > 0 : c.length === 0, dit: c.length ? c[c.length - 1].texte : "pas de court-circuit" };
    }
    if (!a) return { ok: false, dit: `je ne trouve pas ${ref} dans ton schéma` };
    if (a.sorte === "moteur") {
      const marche = a.etatM === "marche" || a.etatM === "surtension";
      let ok;
      if (attendu === "arret") ok = !marche; else if (attendu === "marche") ok = marche;
      else if (attendu === "sens1") ok = marche && a.sens === 1; else if (attendu === "sens2") ok = marche && a.sens === -1;
      else if (attendu === "etoile") ok = marche && a.couplage === "etoile"; else if (attendu === "triangle") ok = marche && a.couplage === "triangle";
      const dit = a.etatM === "2ph" ? `${ref} ne reçoit que deux phases` : a.etatM === "grille" ? `${ref} a grillé` : marche ? `${ref} tourne dans le sens ${a.sens === 1 ? 1 : 2}${a.couplage ? ", couplé en " + a.couplage : ""}` : `${ref} est à l'arrêt`;
      return { ok, dit, attendu: `${ref} doit être ${ATTENDU_MOTEUR[attendu] || attendu}` };
    }
    if (a.sorte === "thermique") { const ok = !!a.declenche === !!attendu; return { ok, dit: `${ref} ${a.declenche ? "a déclenché" : "n'a pas déclenché"}` }; }
    if (a.sorte === "variateur") {
      const f = a.fs || 0, af = Math.abs(f), dit = a.grille ? `${ref} est détruit` : !a.alim ? `${ref} n'est pas alimenté` : af < 0.05 ? `${ref} est à l'arrêt (0 Hz)` : `${ref} tourne ${f > 0 ? "en avant" : "en arrière"} à ${String(Math.round(af * 10) / 10).replace(".", ",")} Hz`;
      if (attendu === "arret" || attendu === false) return { ok: af < 0.05, dit, attendu: `${ref} doit être à l'arrêt` };
      if (typeof attendu === "number") return { ok: Math.abs(af - attendu) <= Math.max(1, attendu * 0.03), dit, attendu: `${ref} doit tourner à ${attendu} Hz` };
      if (attendu === "avant" || attendu === "arriere") return { ok: attendu === "avant" ? f > 0.05 : f < -0.05, dit, attendu: `${ref} doit tourner ${attendu === "avant" ? "en avant" : "en arrière"}` };
      return { ok: af > 0.05, dit, attendu: `${ref} doit tourner` };
    }
    if (a.sorte === "chariot") {
      const pc = Math.round((a.pos || 0) * 100), ou = a.pos <= 0.05 ? "à gauche" : a.pos >= 0.95 ? "à droite" : `en route (${pc} % de la course)`;
      const dit = `le chariot ${ref} est ${ou}${a.butees ? `, il a forcé ${a.butees > 1 ? a.butees + " fois" : "une fois"} contre une butée` : ""}`;
      if (attendu === "gauche") return { ok: a.pos <= 0.05, dit, attendu: `le chariot ${ref} doit être à gauche` };
      if (attendu === "droite") return { ok: a.pos >= 0.95, dit, attendu: `le chariot ${ref} doit être à droite` };
      if (attendu === "en-route") return { ok: a.pos > 0.05 && a.pos < 0.95, dit, attendu: `le chariot ${ref} doit être en route` };
      return { ok: !a.butees, dit, attendu: `le chariot ${ref} ne doit jamais forcer contre une butée` };
    }
    if (a.sorte === "tri" && Array.isArray(attendu)) {
      const [b1, b2] = attendu, dit = `${a.bac1 || 0} caisse${(a.bac1 || 0) > 1 ? "s" : ""} dans le bac 1, ${a.bac2 || 0} dans le bac 2${a.cote ? `, ${a.cote} tombée${a.cote > 1 ? "s" : ""} à côté` : ""}`;
      return { ok: (a.bac1 || 0) === b1 && (a.bac2 || 0) === b2 && !a.cote, dit, attendu: `il faut ${b1} caisse${b1 > 1 ? "s" : ""} dans le bac 1 et ${b2} dans le bac 2, aucune à côté` };
    }
    if (a.sorte === "tapis" || a.sorte === "tri") {
      const roule = Math.abs(a.vit || 0) * 1000 > 0.02, n = a.vues || 0;
      const dit = `le tapis ${ref} ${roule ? "avance" : "est arrêté"}, ${n} caisse${n > 1 ? "s sont passées" : " est passée"} devant le capteur`;
      if (typeof attendu === "number") return { ok: n === attendu, dit, attendu: `il faut ${attendu} caisse${attendu > 1 ? "s" : ""} passée${attendu > 1 ? "s" : ""} devant le capteur` };
      if (attendu === "arret") return { ok: !roule, dit, attendu: `le tapis ${ref} doit être arrêté` };
      return { ok: roule, dit, attendu: `le tapis ${ref} doit avancer` };
    }
    if (a.sorte === "barriere") {
      const ou = a.pos >= 0.95 ? "levée" : a.pos <= 0.05 ? "baissée" : `à ${Math.round((a.pos || 0) * 100)} % de sa course`, n = a.passees || 0;
      const dit = `la barrière ${ref} est ${ou}, ${n} voiture${n > 1 ? "s sont passées" : " est passée"}${a.chocs ? `, la lisse a touché ${a.chocs > 1 ? a.chocs + " voitures" : "une voiture"}` : ""}${a.butees ? ", elle a forcé contre une butée" : ""}`;
      if (attendu === "levee") return { ok: a.pos >= 0.95, dit, attendu: `la barrière ${ref} doit être levée` };
      if (attendu === "baissee") return { ok: a.pos <= 0.05, dit, attendu: `la barrière ${ref} doit être baissée` };
      if (typeof attendu === "number") return { ok: n === attendu && !a.chocs, dit, attendu: `il faut ${attendu} voiture${attendu > 1 ? "s" : ""} passée${attendu > 1 ? "s" : ""}, sans toucher la lisse` };
      return { ok: !a.chocs && !a.butees, dit, attendu: `la lisse de ${ref} ne doit jamais toucher une voiture ni forcer contre une butée` };
    }
    if (a.sorte === "montecharge") {
      const ou = a.pos >= 0.95 ? "en haut" : a.pos <= 0.05 ? "en bas" : `entre les deux (${Math.round((a.pos || 0) * 100)} %)`;
      const dit = `la cabine ${ref} est ${ou}${a.dangers ? ", elle a bougé porte ouverte" : ""}${a.brusques ? `, elle est arrivée trop vite ${a.brusques > 1 ? a.brusques + " fois" : "une fois"}` : ""}${a.butees ? ", elle a forcé contre une butée" : ""}`;
      if (attendu === "haut") return { ok: a.pos >= 0.95, dit, attendu: `la cabine ${ref} doit être en haut` };
      if (attendu === "bas") return { ok: a.pos <= 0.05, dit, attendu: `la cabine ${ref} doit être en bas` };
      if (attendu === "en-route") return { ok: a.pos > 0.05 && a.pos < 0.95, dit, attendu: `la cabine ${ref} doit être en route` };
      if (attendu === "douce") return { ok: !a.brusques && !a.butees && !a.dangers, dit, attendu: `la cabine ${ref} doit arriver en petite vitesse, sans butée, et jamais bouger porte ouverte` };
      return { ok: !a.dangers && !a.butees, dit, attendu: `la cabine ${ref} ne doit jamais bouger porte ouverte ni forcer contre une butée` };
    }
    if (a.sorte === "station") {
      const P = a.pompes || [], en = P.map((x, k) => (x ? "P" + (k + 1) : "")).filter(Boolean);
      const dit = `la bâche ${ref} est remplie à ${Math.round((a.niv || 0) * 100)} %, ${en.length ? (en.length > 1 ? "les pompes " + en.join(", ") + " pompent" : "la pompe " + en[0] + " pompe") : "aucune pompe ne pompe"}${a.debords ? ", elle a débordé" : ""}`;
      if (typeof attendu === "number") return { ok: Math.abs((a.niv || 0) * 100 - attendu) <= 4, dit, attendu: `la bâche ${ref} doit être remplie à ${attendu} %` };
      if (Array.isArray(attendu)) return { ok: attendu.every((x, k) => !!P[k] === !!x), dit, attendu: `il faut ${attendu.map((x, k) => (x ? "P" + (k + 1) : "")).filter(Boolean).join(", ") || "aucune pompe"} en marche${attendu.some((x) => !x) ? `, ${attendu.map((x, k) => (x ? "" : "P" + (k + 1))).filter(Boolean).join(", ")} à l'arrêt` : ""}` };
      return { ok: !a.debords, dit, attendu: `la bâche ${ref} ne doit jamais déborder` };
    }
    if (a.sorte === "cuve") {
      const dit = `la cuve ${ref} est remplie à ${Math.round((a.niv || 0) * 100)} %${a.debords ? ", elle a débordé" : ""}`;
      if (typeof attendu === "number") return { ok: Math.abs((a.niv || 0) * 100 - attendu) <= 4, dit, attendu: `la cuve ${ref} doit être remplie à ${attendu} %` };
      return { ok: !a.debords, dit, attendu: `la cuve ${ref} ne doit jamais déborder` };
    }
    if (a.sorte === "automate") {
      const m = /^X(\d+)$/.exec(String(attendu));
      if (m) { const X = (a.api && a.api.X) || [], ok = !!a.actif && X.indexOf(+m[1]) >= 0; return { ok, dit: a.actif ? `étapes actives de ${ref} : ${X.map((n) => "X" + n).join(", ") || "aucune"}` : `${ref} n'est pas en marche`, attendu: `l'étape ${m[1]} de ${ref} doit être active` }; }
      return { ok: !!a.actif === !!attendu, dit: a.actif ? `${ref} est en marche (RUN)` : `${ref} n'est pas en marche`, attendu: `${ref} doit être ${attendu ? "en marche" : "arrêté"}` };
    }
    if (a.sorte === "bouton" || a.sorte === "au" || a.sorte === "fdc") return { ok: !!a.actionne === !!attendu, dit: `${ref} ${a.actionne ? "est actionné" : "n'est pas actionné"}` };
    if (a.sorte === "capteur" && a.piloteRef) return { ok: !!a.actionne === !!attendu, dit: `${ref} ${a.actionne ? "détecte" : "ne détecte rien"}`, attendu: `${ref} doit ${attendu ? "détecter" : "ne rien détecter"}` };
    const quoi = a.sorte === "voyant" ? (a.alim ? "est allumé" : "est éteint") : (a.alim ? "est alimenté" : "n'est pas alimenté");
    return { ok: !!a.alim === !!attendu, dit: `${ref} ${quoi}`, attendu: `${ref} doit ${a.sorte === "voyant" ? (attendu ? "être allumé" : "être éteint") : (attendu ? "être alimenté" : "ne pas être alimenté")}` };
  }
  function scenario(schema, etapes, options) {
    const o = options || {};
    const sim = simulation(schema, { panne: o.panne });
    const sortes = {}; for (const a of sim.appareils()) sortes[a.ref] = a.sorte;
    for (const [ref, sorte] of Object.entries(o.exige || {})) {
      if (!sortes[ref]) return { ok: false, etapes: [{ texte: `Le schéma contient ${ref}`, ok: false, detail: `Je ne trouve pas ${ref}. Ne supprime pas et ne renomme pas les appareils du départ.` }], journal: [] };
      if (sorte && sortes[ref] !== sorte) return { ok: false, etapes: [{ texte: `${ref} est bien ${NOM_SORTE[sorte] || sorte}`, ok: false, detail: `${ref} n'est pas ${NOM_SORTE[sorte] || sorte} : remets le bon symbole.` }], journal: [] };
    }
    const out = []; let ok = true;
    for (const e of etapes) {
      for (const [quoi, ref, val] of e.faire || []) sim.action(ref, quoi, val);
      if (e.attendre) sim.avancer(e.attendre);
      const res = []; let bon = true;
      for (const [ref, att] of Object.entries(e.verifier || {})) { const c = constat(sim, ref, att); res.push(c); if (!c.ok) bon = false; }
      for (const [prot, mot] of e.protege || []) { const c = sim.enChemin(prot, mot); res.push({ ok: c, dit: c ? `${prot} protège ${mot}` : `le courant de ${mot} ne passe pas par ${prot}` }); if (!c) bon = false; }
      for (const mot of e.terre || []) { const a = sim.etat().appareils[mot]; const c = !!(a && a.terre); res.push({ ok: c, dit: c ? `la carcasse de ${mot} est à la terre` : `la borne PE de ${mot} n'est pas reliée au PE` }); if (!c) bon = false; }
      if (e.verifier || e.protege || e.terre) {
        const rate = res.filter((r) => !r.ok);
        out.push({ texte: e.texte || "", ok: bon, detail: bon ? "" : (e.si || rate.map((r) => r.attendu || r.dit).join(" ; ")), constat: rate.map((r) => r.dit).join(" ; ") });
        if (!bon) { ok = false; break; }
      }
    }
    if (ok && o.jamaisCourt !== false) {
      const c = sim.journal().filter((x) => x.court);
      if (c.length) { ok = false; out.push({ texte: "Aucun court-circuit pendant l'essai", ok: false, detail: c[0].texte, constat: c[0].texte }); }
    }
    return { ok, etapes: out, journal: sim.journal() };
  }

  /* ---------- dépannage : les pannes qu'on peut cacher dans un schéma ---------- */
  function pannesPossibles(schema) {
    const L = [];
    for (const f of schema.fils || []) L.push({ fil: f.id });
    for (const pc of schema.pieces || []) {
      const t = pc.type;
      if (M.nature(pc) || t === "fusible" || M.BOBINES.indexOf(t) >= 0 || t === "voyant" || t === "electrovanne") L.push({ piece: pc.id });
      else if (t === "poles" || t === "sectionneur" || t === "thermique" || t === "disj_moteur") for (let i = 0; i < 3; i++) L.push({ piece: pc.id, i });
      else if (t === "disjoncteur") { const n = clamp(M.parametres(pc).poles | 0, 1, 3); for (let i = 0; i < n; i++) L.push({ piece: pc.id, i }); }
    }
    return L;
  }
  /* une panne se voit si l'essai (sans les vérifications de câblage : protection, terre) ne passe plus */
  function panneVisible(schema, panne, essai) {
    const E = essai.map((e) => { const c = Object.assign({}, e); delete c.protege; delete c.terre; return c; });
    return !scenario(schema, E, { panne, jamaisCourt: false }).ok;
  }

  const API = { simulation, scenario, lireTension, POT_ALIM, PRINCIPAL, pannesPossibles, panneVisible };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasMoteur = API;
})(typeof window !== "undefined" ? window : globalThis);
