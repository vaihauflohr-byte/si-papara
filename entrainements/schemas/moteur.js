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
   Prévu pour plus tard : un automate ou un système animé n'aura qu'à agir sur les appareils (action())
   et à lire l'état (etat()).
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;

  /* ---------- appareils ---------- */
  const PRINCIPAL = { bobine: "contacteur", relais: "relais", tempo_travail: "travail", tempo_repos: "repos", thermique: "thermique",
    sectionneur: "sectionneur", disjoncteur: "disjoncteur", disj_moteur: "disj_moteur", fusible: "fusible",
    bp_no: "bouton", bp_nf: "bouton", arret_urgence: "au", selecteur: "selecteur", interrupteur: "interrupteur",
    fdc_no: "fdc", fdc_nf: "fdc", capteur: "capteur", transfo: "transfo", voyant: "voyant", moteur: "moteur", moteur6: "moteur" };
  const MULTI = new Set(["bouton", "au", "selecteur", "interrupteur", "fdc", "capteur"]);   // plusieurs contacts pour un même appareil
  const A_BOBINE = new Set(["contacteur", "relais", "travail", "repos"]);
  const NOM_SORTE = { contacteur: "le contacteur", relais: "le relais", travail: "le relais temporisé", repos: "le relais temporisé",
    thermique: "le relais thermique", sectionneur: "le sectionneur", disjoncteur: "le disjoncteur", disj_moteur: "le disjoncteur-moteur",
    fusible: "le fusible", bouton: "le bouton", au: "l'arrêt d'urgence", selecteur: "le sélecteur", interrupteur: "l'interrupteur",
    fdc: "le fin de course", capteur: "le capteur", transfo: "le transformateur", voyant: "le voyant", moteur: "le moteur" };

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

  function simulation(schema) {
    const s = schema, net = M.netlist(s), pieces = s.pieces || [];
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
        case "voyant": Object.assign(d, { alim: false, grille: false }); break;
        case "thermique": d.declenche = false; break;
        case "sectionneur": Object.assign(d, { ferme: true, fondus: [false, false, false] }); break;
        case "disjoncteur": case "disj_moteur": Object.assign(d, { ferme: true, declenche: false }); break;
        case "fusible": d.fondu = false; break;
        case "bouton": Object.assign(d, { appuye: false, maintenu: false }); break;
        case "moteur": Object.assign(d, { w: 0, sens: 0, etatM: "arret", couplage: null, chauffe: 0, tente: false, grille: false }); break;
        default: d.actionne = false;
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
      }
    }
    const condValides = cond.filter((c) => c.n1 >= 0 && c.n2 >= 0);

    /* ----- les sources ----- */
    const sources = [];
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
      }
    }

    /* ----- les récepteurs ----- */
    const charges = [];
    for (const pc of pieces) {
      const d = devDe.get(pc.id), P = M.parametres(pc);
      if (!d) continue;
      if (M.BOBINES.indexOf(pc.type) >= 0) charges.push({ pc, d, n1: nd(pc, "a"), n2: nd(pc, "b"), cote: lireTension(P.tension), sorte: "bobine" });
      else if (pc.type === "voyant") charges.push({ pc, d, n1: nd(pc, "a"), n2: nd(pc, "b"), cote: lireTension(P.tension), sorte: "voyant" });
      else if (pc.type === "transfo") charges.push({ pc, d, n1: nd(pc, "p1"), n2: nd(pc, "p2"), cote: { v: Number(P.prim) || 400, ac: true }, sorte: "transfo" });
    }
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
    const signature = () => bobines.map((d) => (d.alim ? "1" : "0")).join("");

    let dernier = null;
    function evaluer() {
      sale = false;
      const vus = new Map(), histo = [], bloques = new Set();
      vus.set(signature(), 0);
      let uf = null, m = null;
      for (let it = 0; it < 600; it++) {
        uf = unir(null); m = potentiels(uf);
        const cf = conflits(m);
        if (cf.length) { traiterCourt(cf[0], uf); continue; }
        const off = [], on = [];
        for (const ch of charges) {
          if (ch.sorte === "voyant") continue;
          const d = ch.d; if (bloques.has(d)) continue;
          const j = juger(ch, tensionCharge(ch, uf, m));
          if (j.grille && !d.grille) {
            d.grille = true;
            log("erreur", `${ch.sorte === "transfo" ? "Le transformateur" : "La bobine"} ${d.ref} (${txtTension(ch.cote)}) reçoit ${txtTension(j.u)} : ${ch.sorte === "transfo" ? "il grille" : "elle grille"} !`, { refs: [d.ref] });
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
      // voyants
      for (const ch of charges) {
        if (ch.sorte !== "voyant") continue;
        const j = juger(ch, tensionCharge(ch, uf, m));
        if (j.grille && !ch.d.grille) { ch.d.grille = true; log("erreur", `Le voyant ${ch.d.ref} (${txtTension(ch.cote)}) reçoit ${txtTension(j.u)} : il grille !`, { refs: [ch.d.ref] }); }
        ch.d.alim = j.on && !ch.d.grille;
      }
      // oscillations
      const vib = new Set([...bloques].map((d) => d.cle));
      for (const k of vib) if (!vibrentAvant.has(k)) log("alerte", `${dev[k].ref} vibre : sa bobine se coupe elle-même (un de ses propres contacts à ouverture est en série avec elle ?).`, { refs: [dev[k].ref] });
      vibrentAvant = vib;
      // moteurs
      for (const mo of moteurs) analyserMoteur(mo, uf, m);
      dernier = { uf, m };
    }

    /* ----- moteurs ----- */
    const phaseDe = (p) => { const i = info(p); return i && i.net === "R" && i.chaud ? i.ph : null; };
    function sensDe(ph) { return (ph[1] - ph[0] + 3) % 3 === 1 ? 1 : -1; }
    function analyserMoteur(mo, uf, m) {
      const pc = mo.pc, d = mo.d, pb = (b) => potDe(uf, m, nd(pc, b));
      let etatM = "arret", sens = 0, couplage = null, niveau = 0, detail = "";
      const avecAutre = (L) => L.some((p) => p && phaseDe(p) === null);
      if (pc.type === "moteur") {
        const P = ["U", "V", "W"].map(pb), ph = P.map(phaseDe), n = new Set(ph.filter((x) => x !== null)).size;
        if (n === 3) { etatM = "marche"; sens = sensDe(ph); niveau = 1; }
        else if (n === 2) etatM = "2ph";
        if (avecAutre(P) && n > 0) detail = "branchement";
      } else {
        const P = d.principal ? M.parametres(d.principal) : {}, nominal = P.plaque === "230/400" ? 230 : 400;
        const h = ["U1", "V1", "W1"].map(pb), b = ["U2", "V2", "W2"].map(pb), ph1 = h.map(phaseDe);
        const r2 = ["U2", "V2", "W2"].map((x) => uf.find(Math.max(0, nd(pc, x))));
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
      if (d.grille) { etatM = "grille"; niveau = 0; sens = 0; }
      d.etatM = etatM; d.couplage = couplage; d.niveau = niveau; d.detail = detail;
      if (etatM === "marche" || etatM === "surtension") d.sens = sens;
      d.terre = potDe(uf, m, nd(pc, "PE")) === "PE";
    }
    const chauffant = (d) => !d.grille && (d.etatM === "2ph" || d.etatM === "couplage" || d.etatM === "surtension");
    function integrer(dt) {
      for (const { d } of moteurs) {
        let cible = 0;
        if (d.etatM === "marche" || d.etatM === "surtension") cible = d.sens * d.niveau;
        else if (d.etatM === "2ph" && Math.abs(d.w) > 0.25) cible = Math.sign(d.w) * 0.8;   // il tournait : il continue en peinant
        d.w += (cible - d.w) * (1 - Math.exp(-dt / 700));
        if (Math.abs(d.w) < 1e-4 && cible === 0) d.w = 0;
        if (chauffant(d)) d.chauffe += dt; else d.chauffe = Math.max(0, d.chauffe - dt / 2);
        if (!chauffant(d) && d.chauffe === 0) d.tente = false;
      }
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
        const pourquoi = d.etatM === "2ph" ? "marche sur deux phases" : d.etatM === "surtension" ? "a ses enroulements sous une tension trop forte" : "est mal couplé";
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
      if (quoi === "appuyer") { if (S === "bouton") d.appuye = true; else if (MULTI.has(S)) d.actionne = true; else return false; }
      else if (quoi === "relacher") { if (S === "bouton") d.appuye = false; else if (S !== "au" && MULTI.has(S)) d.actionne = false; else return false; }
      else if (quoi === "maintenir") { if (S !== "bouton") return false; d.maintenu = valeur == null ? !d.maintenu : !!valeur; }
      else if (quoi === "basculer") {
        if (S === "bouton") d.maintenu = !d.maintenu;
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
      defaut = null; t = 0; journal.length = 0; courts.length = 0; vibrentAvant = new Set(); evaluer(); return api;
    }

    /* ----- ce que la page (ou un essai) lit ----- */
    function messages() {
      const L = remarques.slice();
      if (!dernier) return L;
      const { uf, m } = dernier;
      if (defaut) L.push({ niveau: "erreur", texte: "Court-circuit : l'alimentation est coupée. Corrige le schéma, puis « Remettre le courant ».", refs: [] });
      for (const ch of charges) {
        const d = ch.d, quoi = ch.sorte === "voyant" ? "Le voyant" : ch.sorte === "transfo" ? "Le primaire du transformateur" : "La bobine";
        if (d.grille) { L.push({ niveau: "erreur", texte: `${quoi} ${d.ref} a grillé (mauvaise tension).`, refs: [d.ref] }); continue; }
        const j = juger(ch, tensionCharge(ch, uf, m));
        if (j.etat === "faible") L.push({ niveau: "alerte", texte: `${quoi} ${d.ref} (${txtTension(ch.cote)}) ne reçoit que ${txtTension(j.u)} : ${ch.sorte === "voyant" ? "il ne s'allume pas" : "rien ne se passe"}.`, refs: [d.ref] });
        else if (j.etat === "nature") L.push({ niveau: "alerte", texte: `${quoi} ${d.ref} est prévu${ch.sorte === "bobine" ? "e" : ""} pour ${txtTension(ch.cote)} et reçoit ${txtTension(j.u)} : ça ne convient pas.`, refs: [d.ref] });
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
        o.fermes[c.i] = c.ferme();
        o.ferme = o.fermes[0];
      }
      for (const pc of pieces) {
        const d = devDe.get(pc.id); if (!d) continue;
        const o = pieceEtat[pc.id] || (pieceEtat[pc.id] = {});
        o.actionne = actionne(d);
        if (A_BOBINE.has(d.sorte) && M.BOBINES.indexOf(pc.type) >= 0) { o.alim = d.alim; o.grille = d.grille; o.prog = progression(d); o.vibre = vibrentAvant.has(d.cle); o.tempo = d.sorte === "travail" || d.sorte === "repos"; }
        else if (d.sorte === "voyant" || d.sorte === "transfo") { o.alim = d.alim; o.grille = d.grille; }
        else if (d.sorte === "thermique") o.declenche = d.declenche;
        else if (d.sorte === "sectionneur") { o.ouvert = !d.ferme; o.fondus = d.fondus.slice(); }
        else if (d.sorte === "disjoncteur" || d.sorte === "disj_moteur") { o.ouvert = !d.ferme; o.declenche = d.declenche; }
        else if (d.sorte === "fusible") o.fondu = d.fondu;
        else if (d.sorte === "moteur") Object.assign(o, { etatM: d.etatM, w: d.w, sens: d.sens, couplage: d.couplage, chauffe: d.chauffe / SEUIL_TH, grille: d.grille, terre: d.terre });
        if (d.sorte === "bouton") { o.appuye = d.appuye; o.maintenu = d.maintenu; }
        if (pc.type === "contact_tno" || pc.type === "contact_tnf") { o.prog = progression(d); o.enCours = o.prog > 0 && o.prog < 1; }
      }
      const appareilsEtat = {};
      for (const d of appareils) {
        if (!d.ref || appareilsEtat[d.ref]) continue;
        const o = { sorte: d.sorte, actionne: actionne(d) };
        for (const k of ["alim", "grille", "declenche", "ferme", "fondu", "fondus", "appuye", "maintenu", "actionne", "etatM", "sens", "couplage", "w", "terre", "delai"]) if (d[k] !== undefined) o[k] = Array.isArray(d[k]) ? d[k].slice() : d[k];
        if (A_BOBINE.has(d.sorte)) o.prog = progression(d);
        appareilsEtat[d.ref] = o;
      }
      const recents = new Set();
      for (const c of courts) if (t - c.t < 2500) for (const n of c.noeuds) recents.add(n);
      return { t, defaut: !!defaut, noeuds, court: [...recents], pieces: pieceEtat, appareils: appareilsEtat, messages: messages(), journal: journal.slice() };
    }
    function enChemin(refProt, refMoteur) {   // les pôles de refProt portent-ils le courant de refMoteur ?
      const mo = moteurs.find((x) => x.d.ref === refMoteur); if (!mo) return false;
      return condValides.some((c) => c.pc.ref === refProt && (c.prot || c.therm) && c.ferme() && cheminMoteur(mo, c));
    }

    const api = {
      action, avancer, evaluer: () => { evaluer(); return api; }, etat, reinitialiser, rearmerAlimentation, enChemin,
      appuyer: (r) => action(r, "appuyer"), relacher: (r) => action(r, "relacher"), basculer: (r) => action(r, "basculer"),
      surcharge: (r) => action(r, "surcharge"), rearmer: (r) => action(r, "rearmer"),
      temps: () => t, journal: () => journal.slice(), netlist: net, appareils: () => appareils.map((d) => ({ ref: d.ref, sorte: d.sorte })),
      enMarche: () => moteurs.some(({ d }) => Math.abs(d.w) > 0.002 || d.etatM !== "arret") || bobines.some((d) => (d.sorte === "travail" || d.sorte === "repos") && progression(d) > 0 && progression(d) < 1),
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
    if (a.sorte === "bouton" || a.sorte === "au" || a.sorte === "fdc") return { ok: !!a.actionne === !!attendu, dit: `${ref} ${a.actionne ? "est actionné" : "n'est pas actionné"}` };
    const quoi = a.sorte === "voyant" ? (a.alim ? "est allumé" : "est éteint") : (a.alim ? "est alimenté" : "n'est pas alimenté");
    return { ok: !!a.alim === !!attendu, dit: `${ref} ${quoi}`, attendu: `${ref} doit ${a.sorte === "voyant" ? (attendu ? "être allumé" : "être éteint") : (attendu ? "être alimenté" : "ne pas être alimenté")}` };
  }
  function scenario(schema, etapes, options) {
    const o = options || {};
    const sim = simulation(schema);
    const sortes = {}; for (const a of sim.appareils()) sortes[a.ref] = a.sorte;
    for (const [ref, sorte] of Object.entries(o.exige || {})) {
      if (!sortes[ref]) return { ok: false, etapes: [{ texte: `Le schéma contient ${ref}`, ok: false, detail: `Je ne trouve pas ${ref}. Ne supprime pas et ne renomme pas les appareils du départ.` }], journal: [] };
      if (sorte && sortes[ref] !== sorte) return { ok: false, etapes: [{ texte: `${ref} est bien ${NOM_SORTE[sorte] || sorte}`, ok: false, detail: `${ref} n'est pas ${NOM_SORTE[sorte] || sorte} : remets le bon symbole.` }], journal: [] };
    }
    const out = []; let ok = true;
    for (const e of etapes) {
      for (const [quoi, ref] of e.faire || []) sim.action(ref, quoi);
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

  const API = { simulation, scenario, lireTension, POT_ALIM, PRINCIPAL };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasMoteur = API;
})(typeof window !== "undefined" ? window : globalThis);
