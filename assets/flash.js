/* =====================================================================
   SI Papara — les flashs de début de séance
   Questions : contenu/flashs.js (flashs préparés, un par date) et contenu/flashs-banque.js (banque par notion).

   Le prof choisit le flash (#/flash/projeter) : le flash préparé du jour, 3 questions tirées au hasard dans « ce
   qui est déjà tombé » (questions des flashs passés + banque des notions déjà vues), ou les questions qu'il coche.
   Il le projette et clique « Lancer » : la base note la source, le début et la fin (supabase/flash.sql).
   Élève (#/flash/jour) : il ouvre la page et attend ; la page interroge la base toutes les 2 s, reconstruit les
   mêmes questions à partir de la source, et démarre son chrono réglé sur l'heure du serveur : il finit avec celui
   du tableau, la copie est rendue toute seule à 0:00. Une seule copie notée par jour : module flash-<date du jour>.
   Correction : chaque réponse part à l'IA (SIP.ia.corriger → fonction Supabase « corriger ») avec la question,
   le corrigé et les éléments du barème ; verdict par élément (présent 1, en partie ½, absent 0). La note part au
   prof dès que la copie est corrigée. L'ÉLÈVE VOIT SA NOTE À LA FIN DU CHRONO (pas avant, même s'il a rendu tôt :
   il ne peut pas souffler aux autres que ses réponses sont justes), avec les points de chaque question, mais PAS
   SA CORRECTION le jour même tant que le prof ne l'a pas montrée (bouton « Montrer la correction aux élèves » :
   supabase/flash.sql, flash_montrer) ; elle s'ouvre toute seule le lendemain. Si l'IA n'a pas pu corriger une
   réponse, l'élève la coche lui-même avec le corrigé, une fois la correction montrée : sa note s'affiche alors.
   Durée : 5 minutes (DUREE_FLASH), ou celle donnée par le flash préparé. Pendant le flash, le prof peut ajouter
   une minute (« +1 min » : flash_rallonger) : la fin de chaque copie suit celle du lancement.
   Sources : « AAAA-MM-JJ » (flash préparé), « alea-<graine> » (tirage, le même chez tous), « q:<réf>,<réf>… »
   (questions choisies) ; une réf est « AAAA-MM-JJ~<n° de question> » ou « b~<id de la banque> ».
   Passages : « <source>@<n> » est le n-ième passage du jour, relancé « avec d'autres valeurs » : mêmes questions,
   valeurs tirées au hasard (SIP.FLASH_VARIANTE, les mêmes chez tous), nouvelle copie et nouvelle note pour chaque
   élève (copie et module flash-AAAA-MM-JJ-<n> ; le 1er passage garde flash-AAAA-MM-JJ). Route élève :
   #/flash/AAAA-MM-JJ (le passage en cours ou le dernier fait) ou #/flash/AAAA-MM-JJ-<n> (ce passage-là).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const esc = SIP.esc;
  const tous = () => SIP.FLASHS || [];
  const banque = () => SIP.FLASH_BANQUE || [];
  const flashDe = (date) => tous().find((f) => f.date === date) || null;
  const idDe = (jour, p) => (p > 1 ? `${jour}-${p}` : jour);   // une séance : son jour et son numéro de passage
  const lireId = (id) => { const m = /^(\d{4}-\d{2}-\d{2})(?:-(\d{1,3}))?$/.exec(id || ""); return m ? { jour: m[1], passage: m[2] ? Math.max(1, +m[2]) : 0 } : null; };
  const passageDe = (source) => { const m = /@(\d{1,3})$/.exec(source || ""); return m ? Math.max(1, +m[1]) : 1; };
  const sansPassage = (source) => String(source || "").replace(/@\d{1,3}$/, "");
  const eme = (p) => (p === 1 ? "1er" : `${p}e`);
  const moduleDe = (f) => "flash-" + (f.id || f.date);
  const estDate = (x) => /^\d{4}-\d{2}-\d{2}$/.test(x || "");
  const jourLong = (d) => new Date(d + "T12:00:00-10:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Pacific/Tahiti" });
  const mmss = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
  const minutes = (f) => { const m = f.duree_s / 60; return `${SIP.nb ? SIP.nb(m, 2) : m} minute${m > 1 ? "s" : ""}`; };
  const nb = (x) => (SIP.nb ? SIP.nb(x, 3) : String(Math.round(x * 10) / 10).replace(".", ","));
  const POIDS = { present: 1, partiel: 0.5, absent: 0 };
  const PASTILLE = { present: "✓", partiel: "½", absent: "✗" };
  const DUREE_FLASH = 300, DUREE_Q = 60;   // un flash dure 5 minutes (une minute de plus par question au-delà de 5)
  const brut = (h) => String(h ?? "")
    .replace(/<span class="frac"><span class="nu">(.*?)<\/span><span class="sr"> sur <\/span><span class="de">(.*?)<\/span><\/span>/g, "($1)/($2)")
    .replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<sub>(.*?)<\/sub>/g, "$1").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

  // ---------- les questions d'un flash, d'après sa source ----------
  function qRef(ref) {
    const m = /^(\d{4}-\d{2}-\d{2})~(\d+)$/.exec(ref || "");
    if (m) { const f = flashDe(m[1]); return f ? f.questions[+m[2]] || null : null; }
    const b = /^b~(.+)$/.exec(ref || "");
    return b ? banque().find((q) => q.id === b[1]) || null : null;
  }
  const refsFlash = (f) => f.questions.map((q, k) => f.date + "~" + k);
  const hachage = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  // la question d'un passage : à partir du 2e, d'autres valeurs (les mêmes chez tous : le tirage dépend du jour, du passage et de la question)
  function qVar(ref, jour, p) {
    const q = qRef(ref);
    if (!q || p < 2 || !SIP.FLASH_VARIANTE) return q;
    return SIP.FLASH_VARIANTE(q, hasard(hachage(`${jour}|${p}|${ref}`))) || q;
  }
  const varie = (ref) => { const q = qRef(ref); return !!(q && typeof q.variante === "function"); };
  // une séance : les questions posées un jour donné, à un passage donné (id = jour[-passage] : clé de la copie et du module)
  function seance(jour, refs, duree, passage) {
    const p = passage > 1 ? passage : 1, qs = (refs || []).map((ref) => qVar(ref, jour, p));
    if (!qs.length || qs.some((q) => !q)) return null;
    return { date: jour, passage: p, id: idDe(jour, p), refs, duree_s: duree || Math.max(DUREE_FLASH, qs.length * DUREE_Q), questions: qs };
  }
  // « ce qui est déjà tombé » : les questions des flashs faits avant ce jour, et la banque des notions déjà vues
  function dejaTombe(jour, niveau) {
    const L = [];
    tous().filter((f) => f.date < jour && (!f.niveau || !niveau || f.niveau === niveau)).forEach((f) => L.push(...refsFlash(f)));
    banque().filter((q) => !niveau || (q.niveau || "TSI") === niveau).forEach((q) => L.push("b~" + q.id));   // la banque est celle de la Terminale SI
    return L;
  }
  function hasard(graine) {   // même suite chez le prof et chez chaque élève
    let a = graine >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const notionDe = (ref) => { const q = qRef(ref); return (q && (q.notion || q.theme)) || ref; };
  function tirage(graine, jour, niveau, n = 3) {   // n questions, de notions différentes autant que possible
    const m = dejaTombe(jour, niveau), r = hasard(graine);
    for (let i = m.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [m[i], m[j]] = [m[j], m[i]]; }
    const choix = [], vues = new Set();
    m.forEach((x) => { if (choix.length < n && !vues.has(notionDe(x))) { choix.push(x); vues.add(notionDe(x)); } });
    m.forEach((x) => { if (choix.length < n && !choix.includes(x)) choix.push(x); });
    return choix;
  }
  function seanceDe(source, jour, niveau) {
    const base = sansPassage(source), p = passageDe(source);
    let F = null;
    if (estDate(base)) { const f = flashDe(base); F = f ? seance(jour, refsFlash(f), f.duree_s, p) : null; }
    else if (/^alea-\d{1,9}$/.test(base)) F = seance(jour, tirage(+base.slice(5), jour, niveau), null, p);
    else if (/^q:/.test(base)) F = seance(jour, base.slice(2).split(",").filter(Boolean).slice(0, 8), null, p);
    if (F) F.source = source;
    return F;
  }

  // ---------- minuterie et clavier de la vue affichée ----------
  let MINUTERIE = null, CLAVIER = null, VUE = 0;
  let MAJ = null, APRES = null;          // vue de correction affichée : mise à jour d'une question, puis note et envoi
  function arreter() {
    if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null;
    if (CLAVIER) document.removeEventListener("keydown", CLAVIER); CLAVIER = null;
    MAJ = null; APRES = null; VUE++;
  }

  // ---------- copie de l'élève, gardée sur l'appareil (une par jour et par passage) ----------
  // (une seule copie en mémoire par passage : une correction en cours continue même si l'élève change de page)
  const prefixe = () => { const s = SIP.session.get() || {}; return `sip_flash_v1:${s.eleve_id || "local"}:`; };
  const cle = (f) => prefixe() + (f.id || f.date);
  const MEMO = {}, ENVOL = {}, ENVOIS = new Set();
  const lire = (f) => { const c = cle(f); if (MEMO[c]) return MEMO[c]; try { const v = JSON.parse(localStorage.getItem(c)); if (v) MEMO[c] = v; return v || null; } catch (e) { return null; } };
  const garder = (f, st) => { const c = cle(f); MEMO[c] = st; try { localStorage.setItem(c, JSON.stringify(st)); } catch (e) { /* stockage plein ou interdit */ } };
  const effacer = (f) => { const c = cle(f); delete MEMO[c]; try { localStorage.removeItem(c); } catch (e) { /* rien */ } };
  const notifier = (k) => { if (MAJ) MAJ(k); };
  const finDe = (f, st) => st.fin || st.debut + f.duree_s * 1000;
  const reste = (f, st) => Math.max(0, Math.ceil((finDe(f, st) - Date.now()) / 1000));
  const sqlAbsent = (e) => /flash_(etat|lancer)|schema cache|PGRST202|Could not find the function/i.test((e && e.message) || "");
  const apercu = () => !!(SIP.apercu && SIP.apercu.actif());
  const faits = (f, hist) => (apercu() ? [] : (hist || []).filter((h) => h.module === moduleDe(f)));
  // la séance d'un passage pour cet élève : les questions de sa copie, sinon (1er passage) le flash préparé ce jour-là
  function seanceDeId(id) {
    const x = lireId(id); if (!x) return null;
    const p = x.passage || 1, st = lire({ id: idDe(x.jour, p) });
    if (st && st.refs) { const F = seance(x.jour, st.refs, st.duree_s, p); if (F) return F; }
    const f = p === 1 ? flashDe(x.jour) : null;
    return f ? seance(x.jour, refsFlash(f), f.duree_s, 1) : null;
  }
  // les passages d'un jour que l'élève a faits : copies de l'appareil et notes reçues par le prof
  function passagesDe(jour, hist) {
    const P = new Set(), pre = prefixe() + jour;
    const voir = (c) => { if (c === pre) P.add(1); else if (c && c.startsWith(pre + "-")) { const n = +c.slice(pre.length + 1); if (n > 1) P.add(n); } };
    Object.keys(MEMO).forEach(voir);
    try { for (let i = 0; i < localStorage.length; i++) voir(localStorage.key(i)); } catch (e) { /* rien */ }
    if (!apercu()) (hist || []).forEach((h) => { const m = /^flash-(\d{4}-\d{2}-\d{2})(?:-(\d{1,3}))?$/.exec(h.module || ""); if (m && m[1] === jour) P.add(m[2] ? +m[2] : 1); });
    return [...P].sort((a, b) => a - b);
  }
  // la correction du jour reste cachée à l'élève tant que le prof ne l'a pas montrée ; celles des jours passés sont
  // visibles. CORRIGEES : jours montrés, renvoyés par la base (flash_etat).
  // La note, elle, s'affiche à la fin du chrono : celui de la copie de l'appareil, sinon celui lancé par le prof.
  // LANCE : le dernier lancement lu dans la base { jour, passage, id, source, debut, fin (à l'heure de l'appareil) }
  let CORRIGEES = new Set(), LANCE = null;
  const visible = (jour) => jour < SIP.aujourdhui() || CORRIGEES.has(jour);
  function noterLance(r) {
    if (!(r && r.lance && r.debut && r.fin)) { LANCE = null; return; }
    const jour = SIP.jourTahiti(r.debut), p = passageDe(r.flash);
    LANCE = { jour, passage: p, id: idDe(jour, p), source: r.flash, debut: r.debut, fin: Date.parse(r.fin) + (Date.now() - Date.parse(r.maintenant || r.debut)) };
  }
  async function majCorrigees() {
    try { const r = await SIP.api.flashEtat(); CORRIGEES = new Set((r && r.corrigees) || []); noterLance(r); return r || {}; } catch (e) { return null; }
  }
  // un flash lancé aujourd'hui qu'on peut encore rejoindre (plus d'une seconde et demie de chrono)
  const lanceOuvert = () => (LANCE && LANCE.jour === SIP.aujourdhui() && Date.now() < LANCE.fin - 1500 ? LANCE : null);
  // le prof a ajouté du temps : la fin de la copie suit celle du lancement (même lancement : même source, même début),
  // copie rendue ou non : qui a rendu tôt voit sa note à la nouvelle fin, comme les autres
  function caler(f, st, r) {
    if (!(r && r.lance && r.fin && r.debut && r.flash === st.source)) return false;
    const decal = Date.now() - Date.parse(r.maintenant || r.debut);
    if (st.lanceLe ? st.lanceLe !== r.debut : Math.abs(Date.parse(r.debut) + decal - st.debut) > 5000) return false;
    const fin = Date.parse(r.fin) + decal;
    if (Math.abs(fin - finDe(f, st)) < 1500) return false;
    st.fin = fin; garder(f, st); return true;
  }
  const finCopie = (st) => (st && st.debut ? st.fin || st.debut + (st.duree_s || DUREE_FLASH) * 1000 : 0);
  function chronoFini(id) {
    const x = lireId(id); if (!x) return true;
    if (x.jour < SIP.aujourdhui()) return true;
    const fid = idDe(x.jour, x.passage || 1), st = lire({ id: fid }), L = LANCE && LANCE.id === fid ? LANCE : null;
    // la fin de la copie, ou plus tard si le prof a ajouté du temps à ce même lancement (lu dans la base)
    if (st && st.debut) return Date.now() >= Math.max(finCopie(st), L && st.lanceLe && st.lanceLe === L.debut ? L.fin : 0);
    return !(L && Date.now() < L.fin);
  }
  const noteVisible = (module) => { const m = /^flash-(\d{4}-\d{2}-\d{2})((?:-\d{1,3})?)$/.exec(module || ""); return !m || visible(m[1]) || chronoFini(m[1] + m[2]); };
  const flashsPour = (niveau) => tous().some((f) => (f.niveau || "TSI") === niveau) || banque().some((q) => (q.niveau || "TSI") === niveau);

  const verdict = (st, k, i) => (st.cor && st.cor[k] && st.cor[k].v && st.cor[k].v[i]) || null;
  const qComplete = (f, st, k) => f.questions[k].elements.every((e, i) => !!verdict(st, k, i));
  const complete = (f, st) => f.questions.every((q, k) => qComplete(f, st, k));
  const ptsQ = (f, st, k) => f.questions[k].elements.reduce((a, e, i) => { const v = verdict(st, k, i); return a + (v ? POIDS[v.verdict] * e.p : 0); }, 0);
  const maxQ = (q) => q.elements.reduce((a, e) => a + e.p, 0);
  const total = (f, st) => ({ s: f.questions.reduce((a, q, k) => a + ptsQ(f, st, k), 0), m: f.questions.reduce((a, q) => a + maxQ(q), 0) });
  const sur20 = (s, m) => (m ? (20 * s) / m : 0);
  const classeNote = (n) => (SIP.appreciation ? SIP.appreciation(n).cls : n >= 12 ? "ok" : "alerte");
  // la note d'une copie, si on la connaît : celle reçue par le prof (hist), sinon celle de la copie de l'appareil corrigée en entier
  const noteDe = (F, st, fait) => (fait ? sur20(fait.score, fait.score_max) : F && st && st.rendu && complete(F, st) ? sur20(total(F, st).s, total(F, st).m) : null);

  // ---------- morceaux d'affichage ----------
  const teteQ = (q, k, droite) => `<div class="fl-q-tete"><span class="fl-num">${k + 1}</span><span class="eyebrow">${esc(q.theme || "")}</span>${droite || ""}</div>`;
  const corpsQ = (q) => `<div class="fl-enonce">${q.enonce}</div>${q.fig ? `<div class="fl-figw">${q.fig}</div>` : ""}`;
  const retour = () => `<p class="no-print"><a href="#/tableau">← Tableau de bord</a> · <a href="#/flash">Mes flashs</a></p>`;
  const iaInfo = `<p class="discret fl-ia-info">Ta copie est corrigée par une IA (Claude) à partir du corrigé et du barème du prof. Elle ne reçoit que les questions, le corrigé et tes réponses : ni ton nom, ni ton identifiant. Elle peut se tromper : si tu n'es pas d'accord, montre ta réponse au prof.</p>`;
  function messageIA(code) {
    if (code === "QUOTA") return "Tu as utilisé toutes tes corrections par l'IA pour aujourd'hui : compare ta réponse au corrigé et coche toi-même.";
    if (code === "NON_CONNECTE" || code === "SESSION_EXPIREE") return "Connecte-toi pour que l'IA corrige ta copie. En attendant, compare ta réponse au corrigé et coche toi-même.";
    if (code === "PROF_NON_CONNECTE" || code === "NON_AUTORISE") return "Aperçu : connecte-toi à l'espace prof dans ce navigateur pour voir la correction par l'IA. En attendant, coche avec le corrigé.";
    if (code === "IA_ABSENTE" || code === "CLE_ABSENTE") return "La correction par l'IA n'est pas en service : compare ta réponse au corrigé et coche toi-même.";
    if (code === "IA_PARTIEL") return "L'IA n'a pas jugé tous les points : coche les autres toi-même, avec le corrigé.";
    return "L'IA n'a pas pu corriger (réseau ?) : réessaie, ou compare ta réponse au corrigé et coche toi-même.";
  }

  // ---------- tuile du tableau de bord (toujours là pour une classe qui a des flashs) ----------
  function tuile(niveau, hist) {
    if (!flashsPour(niveau)) return "";
    const auj = SIP.aujourdhui(), L = lanceOuvert();
    // un flash lancé que l'élève n'a pas encore commencé (1er passage ou relance avec d'autres valeurs) : il y va tout de suite
    if (L && !lire({ id: L.id }) && !faits({ id: L.id }, hist).length) {
      return `<a class="carte fl-tuile a-faire" href="#/flash/${auj}"><span class="fl-eclair" aria-hidden="true">⚡</span>
        <div><div class="eyebrow">Flash du jour · noté${L.passage > 1 ? ` · ${eme(L.passage)} passage` : ""}</div><div class="fl-tuile-t">Le flash est lancé !</div>
        <div class="discret">Ouvre-le vite : ton chrono a démarré avec celui du tableau.</div></div><span class="btn">Ouvrir →</span></a>`;
    }
    const P = passagesDe(auj, hist), p = P.length ? P[P.length - 1] : 1, id = idDe(auj, p), base = { id, date: auj };
    const st = lire(base), fait = faits(base, hist)[0], F = seanceDeId(id), pass = p > 1 ? ` · ${eme(p)} passage` : "";
    if ((fait || (st && st.rendu)) && !visible(auj)) {
      const fini = chronoFini(id), n = fini ? noteDe(F, st, fait) : null;
      return `<a class="carte fl-tuile fait" href="#/flash/${auj}"><span class="fl-eclair" aria-hidden="true">⚡</span>
        <div><div class="eyebrow">Flash du jour · rendu${pass}</div><div class="fl-tuile-t">${n !== null ? `${nb(n)}<small>/20</small>` : "Copie rendue ✓"}</div>
        <div class="discret">${n !== null ? "Ta correction s'affichera quand le prof la montrera." : fini ? "Ta note s'affichera dès que ta copie sera corrigée." : "Ta note s'affichera à la fin du chrono."}</div></div><span class="btn sec">Ma copie →</span></a>`;
    }
    if (fait || (st && st.envoye && F)) {
      const n = fait ? sur20(fait.score, fait.score_max) : sur20(total(F, st).s, total(F, st).m);
      return `<a class="carte fl-tuile fait" href="#/flash/${auj}"><span class="fl-eclair" aria-hidden="true">⚡</span>
        <div><div class="eyebrow">Flash du jour · rendu${pass}</div><div class="fl-tuile-t">${nb(n)}<small>/20</small></div><div class="discret">Revois ta correction et le corrigé.</div></div><span class="btn sec">Ma correction →</span></a>`;
    }
    const enCours = st && st.debut && !st.rendu, rendu = st && st.rendu;
    return `<a class="carte fl-tuile ${enCours || rendu || flashDe(auj) ? "a-faire" : "pret"}" href="#/flash/${auj}"><span class="fl-eclair" aria-hidden="true">⚡</span>
      <div><div class="eyebrow">Flash du jour · noté${pass}</div><div class="fl-tuile-t">${enCours ? "Ton chrono tourne" : rendu ? "Copie rendue" : "Quand le prof le lance"}</div>
      <div class="discret">${enCours ? "Reviens vite à ta copie." : rendu ? "Vois ta correction." : "Ouvre-le et attends : il démarre avec le chrono du tableau."}</div></div>
      <span class="btn">${enCours ? "Reprendre →" : rendu ? "Ma correction →" : "Ouvrir →"}</span></a>`;
  }

  // carte de l'accueil, pour le professeur connecté dans ce navigateur
  function carteProf() {
    const auj = SIP.aujourdhui(), f = flashDe(auj), n = dejaTombe(auj, "TSI").length;
    return `<section class="carte fl-prof"><div class="eyebrow">Mode professeur · flash</div>
      <h2>${f ? `Flash préparé aujourd'hui : ${f.questions.length} questions · ${minutes(f)}` : "Flash du jour"}</h2>
      <p class="discret">Choisis le flash ${f ? "(celui préparé, " : "("}3 questions au hasard parmi les ${n} déjà tombées, ou celles que tu coches), projette-le puis clique « Lancer » : le chrono des élèves part avec le tien. À la fin du chrono, ils voient leur note ; leur correction reste cachée jusqu'à ce que tu cliques « Montrer la correction aux élèves ».</p>
      <a class="btn" href="#/flash/projeter">⚡ Choisir et projeter le flash</a></section>`;
  }

  // ---------- liste des flashs de l'élève ----------
  function liste($app, niveau, hist) {
    arreter();
    const auj = SIP.aujourdhui();
    const ids = new Set(tous().filter((f) => f.date <= auj && (!f.niveau || f.niveau === niveau)).map((f) => f.date));
    (hist || []).forEach((h) => { const m = /^flash-(\d{4}-\d{2}-\d{2}(?:-\d{1,3})?)$/.exec(h.module || ""); if (m) ids.add(m[1]); });
    passagesDe(auj, hist).forEach((p) => ids.add(idDe(auj, p)));
    const L = [...ids].map(lireId).filter(Boolean).sort((a, b) => b.jour.localeCompare(a.jour) || (b.passage || 1) - (a.passage || 1));
    $app.innerHTML = `<p class="no-print"><a href="#/tableau">← Tableau de bord</a></p><h1>Mes flashs</h1>
      <p class="discret">Le flash du début de séance : quelques questions en quelques minutes, sur ce qu'on a déjà vu. Chaque flash garde ta correction et le corrigé : relis-les avant le DS.</p>
      ${L.length ? `<div class="nb-liste">${L.map(({ jour, passage }) => { const p = passage || 1, id = idDe(jour, p), base = { id, date: jour }, fait = faits(base, hist)[0], st = lire(base), F = seanceDeId(id);
        const rendu = !!(fait || (st && st.rendu)), fini = chronoFini(id);
        const n = rendu && (fini || visible(jour)) ? noteDe(F, st, fait) : null;
        return `<a class="nb-row fl-ligne" href="#/flash/${jour}-${p}"><span class="nb-rk">⚡</span>
          <span class="nb-nm"><b>${esc(jourLong(jour))}${p > 1 ? ` · ${eme(p)} passage` : ""}</b><span class="discret">${F ? F.questions.map((q) => esc(q.theme || "")).join(" · ") : "copie faite sur un autre appareil"}</span></span>
          ${n !== null ? `<span class="etiquette ${classeNote(n)}">${nb(n)}/20</span>` : rendu ? `<span class="etiquette" title="${fini ? "Ta note s'affichera quand ta copie sera corrigée" : "Ta note s'affichera à la fin du chrono"}">rendu ✓</span>` : jour === auj ? `<span class="etiquette alerte">à faire</span>` : `<span class="etiquette">pas fait</span>`}<span class="nb-go" aria-hidden="true">→</span></a>`; }).join("")}</div>`
        : `<p class="discret">Pas encore de flash.</p>`}`;
  }

  // ---------- vue élève : le flash d'un jour ----------
  // un passage lancé aujourd'hui que l'élève n'a ni commencé ni rendu (sur cet appareil ou un autre)
  const aRejoindre = (ctx, sauf) => { const L = lanceOuvert(); return L && L.id !== sauf && !lire({ id: L.id }) && !faits({ id: L.id }, ctx && ctx.hist).length ? L : null; };
  // sur une page du flash d'aujourd'hui : si le prof lance un nouveau passage, l'élève y part tout seul (vérifié toutes les 5 s)
  function guetter($app, jour, ctx, sauf) {
    if (jour !== SIP.aujourdhui()) return;
    const vue = VUE;
    MINUTERIE = setInterval(async () => { await majCorrigees(); if (vue === VUE && aRejoindre(ctx, sauf)) intro($app, jour, ctx); }, 5000);
  }

  function eleve($app, id, ctx) {
    arreter();
    const auj = SIP.aujourdhui(), x = lireId(id) || { jour: auj, passage: 0 }, jour = x.jour;
    let p = x.passage;
    if (!p) {   // « Flash du jour » : le passage lancé si l'élève ne l'a pas encore fait, sinon le dernier passage fait
      if (jour === auj && aRejoindre(ctx)) return intro($app, jour, ctx);
      const P = passagesDe(jour, ctx.hist);
      p = P.length ? P[P.length - 1] : 1;
    }
    const fid = idDe(jour, p), base = { id: fid, date: jour }, st = lire(base), F = seanceDeId(fid), fait = faits(base, ctx.hist);
    if (st && st.rendu && F) return visible(jour) ? correction($app, F, st, ctx) : copieRendue($app, F, st, ctx);
    if (st && st.debut && F) return reste(F, st) > 0 ? repondre($app, F, st, ctx) : rendre($app, F, st, ctx, true);
    if (fait.length) return dejaFait($app, F, fait[0], fid, ctx);
    if (jour > auj) { $app.innerHTML = `${retour()}<div class="carte"><h1>Flash du ${esc(jourLong(jour))}</h1><p>Il n'est pas encore ouvert.</p></div>`; return; }
    if (jour < auj) {
      if (F) return revoir($app, F, "Tu n'as pas fait ce flash en classe. Voici les questions et le corrigé : cherche d'abord, puis ouvre le corrigé.", ctx);
      $app.innerHTML = `${retour()}<div class="carte"><p>Pas de flash ce jour-là.</p></div>`; return;
    }
    intro($app, jour, ctx);
  }

  const regles = (jour, F) => `<div class="eyebrow">⚡ Flash · ${esc(jourLong(jour))} · noté</div>
        <h1>${F ? `${F.questions.length} questions · ${minutes(F)}` : "Le flash du jour"}</h1>
        <ul class="fl-regles">
          <li>Seul, en silence, calculatrice autorisée.</li>
          <li>Le flash démarre <b>quand le prof le lance</b> au tableau : reste sur cette page, ton chrono partira avec le sien. À 0:00, ta copie est rendue toute seule.</li>
          <li>Pour chaque question, écris ton calcul et ton résultat <b>avec l'unité</b>.</li>
          <li>Une IA corrige ta copie avec le corrigé du prof : tu vois ta note à la fin du chrono, ta correction quand le prof la montre. Une seule copie : c'est elle qui est notée.</li>
        </ul>`;

  // le jour du flash : l'élève attend que le prof le lance (la base est interrogée toutes les 2 s)
  function intro($app, jour, ctx) {
    const vue = VUE, prevu = flashDe(jour), niveau = (SIP.session.get() || {}).niveau;
    $app.innerHTML = `${retour()}
      <div class="carte fl-intro">${regles(jour, prevu ? seance(jour, refsFlash(prevu), prevu.duree_s) : null)}
        <div class="fl-attente" id="fl-att" role="status" aria-live="polite"><span class="fl-point" aria-hidden="true"></span><span id="fl-att-t">En attente du lancement par le prof…</span></div>
      </div>`;
    const etat = document.getElementById("fl-att-t"), boite = document.getElementById("fl-att");
    let enVol = false;
    const sonder = async () => {
      if (enVol || vue !== VUE) return;
      enVol = true;
      try {
        const r = await SIP.api.flashEtat();
        if (r && r.corrigees) CORRIGEES = new Set(r.corrigees);
        noterLance(r);
        if (vue !== VUE) return;
        // un lancement d'un autre jour (resté dans la base) ne compte pas
        if (r && r.lance && SIP.jourTahiti(r.debut) === jour) {
          const F = seanceDe(r.flash, jour, niveau);
          if (!F) { etat.textContent = "Ce flash n'est pas encore sur ton appareil : recharge la page."; boite.classList.add("ko"); return; }
          // ce passage, l'élève l'a déjà commencé ou rendu : on lui montre sa copie (elle guette le passage suivant)
          const deja = lire(F), fait = faits(F, ctx.hist)[0];
          if (deja && deja.debut) { arreter(); return eleve($app, `${F.date}-${F.passage}`, ctx); }
          if (fait) { arreter(); return dejaFait($app, F, fait, F.id, ctx); }
          const decal = Date.now() - Date.parse(r.maintenant), fin = Date.parse(r.fin) + decal, debut = Date.parse(r.debut) + decal;
          if (fin - Date.now() > 1500) {
            arreter();
            const st = { debut, fin, lanceLe: r.debut, source: r.flash, passage: F.passage, refs: F.refs, duree_s: F.duree_s, reponses: F.questions.map(() => ""), rendu: null, cor: {} };
            garder(F, st); repondre($app, F, st, ctx); return;
          }
          arreter(); revoir($app, F, "Le flash est terminé et tu ne l'as pas commencé à temps. Voici les questions et le corrigé : cherche d'abord, puis ouvre le corrigé.", ctx); return;
        }
        etat.textContent = "En attente du lancement par le prof…"; boite.classList.remove("ko");
      } catch (e) {
        if (vue !== VUE) return;
        if (e.message === "SESSION_EXPIREE") { arreter(); etat.textContent = "Ta session a expiré : reconnecte-toi, puis rouvre le flash."; boite.classList.add("ko"); return; }
        etat.textContent = sqlAbsent(e) ? "Le lancement à distance n'est pas installé : préviens le prof." : "Pas de réseau : nouvel essai dans 2 secondes…"; boite.classList.add("ko");
      } finally { enVol = false; }
    };
    MINUTERIE = setInterval(sonder, 2000); sonder();
  }

  function repondre($app, f, st, ctx) {
    arreter();
    const vue = VUE;
    $app.innerHTML = `<div class="fl-barre" role="timer" aria-live="off">
        <span class="fl-barre-t"><span aria-hidden="true">⚡</span> Flash</span>
        <span class="fl-temps" id="fl-t">${mmss(reste(f, st))}</span>
        <button class="btn" type="button" id="fl-rendre">Rendre ma copie</button></div>
      <ol class="fl-qs">${f.questions.map((q, k) => `<li class="carte fl-q">${teteQ(q, k)}${corpsQ(q)}
        <label class="fl-lab" for="fl-r${k}">Ta réponse</label>
        <textarea id="fl-r${k}" data-k="${k}" rows="3" spellcheck="false" placeholder="Ton calcul et ton résultat, avec l'unité">${esc(st.reponses[k] || "")}</textarea></li>`).join("")}</ol>
      <p class="fl-bas"><button class="btn" type="button" id="fl-rendre2">Rendre ma copie</button> <span class="discret">À 0:00, ta copie part toute seule.</span></p>`;
    const zones = [...$app.querySelectorAll("textarea[data-k]")];
    const lireZones = () => zones.forEach((z) => (st.reponses[+z.dataset.k] = z.value.slice(0, 2000)));
    zones.forEach((z) => z.addEventListener("input", () => { lireZones(); garder(f, st); }));
    const t = document.getElementById("fl-t"), lab = $app.querySelector(".fl-barre-t");
    // toutes les 2 s : le prof a-t-il ajouté du temps ? (la fin de la copie suit celle du lancement)
    let n = 0, enVol = false;
    const suivre = async () => {
      if (enVol) return;
      enVol = true;
      try {
        const r = await SIP.api.flashEtat();
        if (vue === VUE && caler(f, st, r) && lab) {
          lab.innerHTML = `<span aria-hidden="true">⏱</span> Temps ajouté`;
          setTimeout(() => { if (vue === VUE) lab.innerHTML = `<span aria-hidden="true">⚡</span> Flash`; }, 6000);
        }
      } catch (e) { /* pas de réseau : le chrono continue */ } finally { enVol = false; }
    };
    const tic = () => {
      if (vue !== VUE) return;
      if (++n % 8 === 0) suivre();
      const r = reste(f, st);
      t.textContent = mmss(r); t.classList.toggle("urgent", r <= 30);
      if (r <= 0) { lireZones(); rendre($app, f, st, ctx, true); }
    };
    MINUTERIE = setInterval(tic, 250); tic();
    let arme = null;
    const demander = (b) => () => {
      if (arme === b) { lireZones(); rendre($app, f, st, ctx, false); return; }
      [document.getElementById("fl-rendre"), document.getElementById("fl-rendre2")].forEach((x) => { x.textContent = "Rendre ma copie"; x.classList.remove("confirmer"); });
      arme = b; b.textContent = "Sûr ? Touche encore pour rendre"; b.classList.add("confirmer");
      setTimeout(() => { if (arme === b && document.body.contains(b)) { arme = null; b.textContent = "Rendre ma copie"; b.classList.remove("confirmer"); } }, 4000);
    };
    ["fl-rendre", "fl-rendre2"].forEach((id) => { const b = document.getElementById(id); b.onclick = demander(b); });
  }

  function rendre($app, f, st, ctx, auto) {
    arreter();
    if (!st.rendu) { st.rendu = Math.min(Date.now(), finDe(f, st) + 15000); st.auto = !!auto; st.cor = st.cor || {}; garder(f, st); }
    if (visible(f.date)) correction($app, f, st, ctx); else copieRendue($app, f, st, ctx);
  }

  // ---------- la note part au prof (dès que toutes les réponses sont corrigées) ----------
  async function envoyerNote(f, st, ctx) {   // → null (pas prête ou déjà partie) | "envoye" | "file" | { erreur }
    if (!complete(f, st) || st.envoye || ENVOIS.has(cle(f))) return null;
    ENVOIS.add(cle(f));
    const { s, m } = total(f, st);
    const details = f.questions.map((q, k) => {
      const p = ptsQ(f, st, k), b = maxQ(q), parEleve = q.elements.some((e, i) => (verdict(st, k, i) || {}).par === "eleve");
      return { q: `${q.theme ? q.theme + " — " : ""}${brut(q.enonce)}`, rep: (st.reponses[k] || "").slice(0, 600) + (parEleve ? " [auto-évaluée]" : ""), attendu: brut(q.corrige),
        pts: p, bareme: b, erreurs: p < b ? 1 : 0, par: parEleve ? "eleve" : "ia",
        elements: q.elements.map((e, i) => { const v = verdict(st, k, i) || {}; return { t: e.t, p: e.p, verdict: v.verdict, par: v.par }; }) };
    });
    try {
      const ok = await ctx.ecrire("enregistrer", { module: moduleDe(f), titre: `Flash du ${jourLong(f.date)}${f.passage > 1 ? ` · ${eme(f.passage)} passage` : ""}`, type: "externe", score: s, score_max: m,
        duree_s: Math.max(1, Math.round((st.rendu - st.debut) / 1000)), details });
      st.envoye = true; ENVOIS.delete(cle(f)); garder(f, st);
      return ok ? "envoye" : "file";
    } catch (e) { ENVOIS.delete(cle(f)); return { erreur: e.message || "erreur" }; }
  }

  // ---------- copie rendue, correction pas encore montrée : la note à la fin du chrono, pas le corrigé ----------
  const SANS_RELANCE = ["QUOTA", "IA_ABSENTE", "CLE_ABSENTE", "NON_CONNECTE", "PROF_NON_CONNECTE", "NON_AUTORISE", "SESSION_EXPIREE"];
  function copieRendue($app, f, st, ctx) {
    arreter();
    const vue = VUE, jour = f.date;
    st.cor = st.cor || {};
    let echec = false;   // l'IA n'a pas pu tout corriger : la note viendra avec la correction (l'élève coche lui-même)
    $app.innerHTML = `${retour()}
      <div class="fl-res-tete"><div><div class="eyebrow">⚡ Flash · ${esc(jourLong(jour))}${f.passage > 1 ? ` · ${eme(f.passage)} passage` : ""}</div><h1>Copie rendue ✓</h1>
        ${st.auto ? `<p class="discret">Temps écoulé : ta copie a été rendue à 0:00.</p>` : ""}</div>
        <div class="fl-note" id="fl-note" aria-live="polite"></div></div>
      <div class="carte fl-cache"><p id="fl-note-info"></p>
        <p><b>Ta correction s'affichera quand le prof la montrera</b> (au plus tard demain, dans « Mes flashs »).</p>
        <p class="discret" id="fl-etat-copie" aria-live="polite">${st.envoye ? "✓ Ta copie est corrigée et envoyée au prof." : "Ta copie est en train d'être corrigée : garde la page ouverte quelques secondes."}</p></div>
      ${iaInfo}
      <h2 class="fl-h2">Ta copie</h2>
      ${f.questions.map((q, k) => { const r = (st.reponses[k] || "").trim(); return `<section class="carte fl-q">${teteQ(q, k, `<span class="fl-pts" id="fl-p${k}" hidden></span>`)}${corpsQ(q)}
        <div class="fl-ta-rep"><div class="eyebrow">Ta réponse</div>${r ? `<p class="fl-rep">${esc(r)}</p>` : `<p class="fl-rep vide">Pas de réponse.</p>`}</div></section>`; }).join("")}
      ${apercu() ? `<p class="discret no-print"><button type="button" class="btn-lien" id="fl-reset">↺ Recommencer ce flash (aperçu seulement)</button></p>` : ""}`;
    const etat = document.getElementById("fl-etat-copie");
    const dire = (t) => { if (vue === VUE && etat) etat.textContent = t; };
    // la note : à la fin du chrono (pas avant, même pour qui a rendu tôt), dès que toute la copie est corrigée
    const majNote = () => {
      const z = document.getElementById("fl-note"), info = document.getElementById("fl-note-info");
      if (vue !== VUE || !z || !info) return;
      const fini = Date.now() >= finDe(f, st), prete = fini && complete(f, st);
      if (prete) { const { s, m } = total(f, st), n = sur20(s, m); z.innerHTML = `<span class="etiquette ${classeNote(n)} fl-note-n">${nb(n)}<small>/20</small></span><span class="discret">${nb(s)} / ${nb(m)} points</span>`; }
      else z.innerHTML = "";
      info.hidden = prete;
      info.innerHTML = prete ? "" : !fini ? `<b>Ta note s'affichera à la fin du chrono</b>, dans ${mmss(reste(f, st))}.`
        : echec ? "<b>Ta note s'affichera avec ta correction</b> : une réponse est à vérifier toi-même avec le corrigé." : "<b>Ta note arrive</b> dès que ta copie est corrigée.";
      f.questions.forEach((q, k) => { const p = document.getElementById("fl-p" + k); if (p) { p.hidden = !prete; p.textContent = prete ? `${nb(ptsQ(f, st, k))} / ${nb(maxQ(q))}` : ""; } });
    };
    MAJ = () => majNote();   // chaque question corrigée par l'IA
    // la correction par l'IA se fait tout de suite, en arrière-plan (une nouvelle tentative si l'IA ne répond pas) ;
    // la note part au prof même si l'élève quitte la page entre-temps
    if (!st.envoye) {
      Promise.all(f.questions.map((q, k) => (qComplete(f, st, k) ? null : corrigerQ(f, st, k))))
        .then(() => {
          const ko = f.questions.map((q, k) => k).filter((k) => !qComplete(f, st, k) && !SANS_RELANCE.includes((st.cor[k] || {}).code));
          return ko.length ? new Promise((ok) => setTimeout(ok, 4000)).then(() => Promise.all(ko.map((k) => corrigerQ(f, st, k)))) : null;
        })
        .then(async () => {
          if (!complete(f, st)) { echec = true; majNote(); dire("Ta copie est rendue. Une réponse n'a pas pu être corrigée par l'IA : tu la vérifieras toi-même avec le corrigé, quand le prof le montrera."); return; }
          majNote();
          const r = await envoyerNote(f, st, ctx);
          if (r === "envoye" || (r === null && st.envoye)) dire("✓ Ta copie est corrigée et envoyée au prof.");
          else if (r === "file") dire("Ta copie est corrigée ; elle partira au prof dès que le réseau revient.");
          else if (r && r.erreur) dire("Ta copie est corrigée ; elle partira au prof quand tu seras reconnecté.");
        });
    }
    // chaque seconde : le compte à rebours de la note ; toutes les 2 s jusqu'à la fin du chrono, puis toutes les 5 s :
    // du temps ajouté par le prof (la note attend la nouvelle fin), un nouveau passage lancé (l'élève y part), la correction montrée ?
    let tic = 0, enVol = false;
    MINUTERIE = setInterval(async () => {
      majNote();
      if (++tic % (Date.now() < finDe(f, st) + 5000 ? 2 : 5) || enVol) return;
      enVol = true;
      try {
        const r = await majCorrigees();
        if (vue !== VUE) return;
        if (r && caler(f, st, r)) majNote();
        if (aRejoindre(ctx, f.id)) return intro($app, jour, ctx);
        if (visible(jour)) correction($app, f, st, ctx);
      } finally { enVol = false; }
    }, 1000);
    majNote();
    const rz = document.getElementById("fl-reset");
    if (rz) rz.onclick = () => { effacer(f); eleve($app, `${f.date}-${f.passage || 1}`, ctx); };
  }

  // ---------- correction ----------
  function correction($app, f, st, ctx) {
    arreter();
    const vue = VUE;
    st.cor = st.cor || {};
    $app.innerHTML = `${retour()}
      <div class="fl-res-tete"><div><div class="eyebrow">⚡ Flash · ${esc(jourLong(f.date))}${f.passage > 1 ? ` · ${eme(f.passage)} passage` : ""}</div><h1>Ta correction</h1>
        ${st.auto ? `<p class="discret">Temps écoulé : ta copie a été rendue à 0:00.</p>` : ""}</div>
        <div class="fl-note" id="fl-note" aria-live="polite"></div></div>
      ${iaInfo}
      <div id="fl-cs">${f.questions.map((q, k) => `<section class="carte fl-q fl-corr" id="fl-c${k}"></section>`).join("")}</div>
      <div id="fl-fin" aria-live="polite"></div>
      ${apercu() ? `<p class="discret no-print"><button type="button" class="btn-lien" id="fl-reset">↺ Recommencer ce flash (aperçu seulement)</button></p>` : ""}`;
    const majNote = () => {
      const z = document.getElementById("fl-note"); if (vue !== VUE || !z) return;
      if (!complete(f, st)) { z.innerHTML = `<span class="discret">Correction en cours…</span>`; return; }
      const { s, m } = total(f, st), n = sur20(s, m);
      z.innerHTML = `<span class="etiquette ${classeNote(n)} fl-note-n">${nb(n)}<small>/20</small></span><span class="discret">${nb(s)} / ${nb(m)} points</span>`;
    };
    const maj = (k) => {
      if (vue !== VUE) return;
      const sec = document.getElementById("fl-c" + k); if (!sec) return;
      sec.innerHTML = questionCorrigee(f, st, k);
      sec.querySelectorAll("[data-v]").forEach((b) => (b.onclick = () => {
        const i = +b.dataset.i; st.cor[k].v = st.cor[k].v || {};
        st.cor[k].v[i] = { verdict: b.dataset.v, raison: "", par: "eleve" };
        if (qComplete(f, st, k)) st.cor[k].etat = "ok";
        garder(f, st); maj(k); if (APRES) APRES();
      }));
      const re = sec.querySelector("[data-reessayer]"); if (re) re.onclick = () => corrigerQ(f, st, k).then(() => { if (APRES) APRES(); });
    };
    MAJ = maj;
    const envoyer = async () => {
      const r = await envoyerNote(f, st, ctx), fin = document.getElementById("fl-fin");
      if (!r || vue !== VUE || !fin) return;
      fin.innerHTML = r.erreur ? `<p class="erreur">La note n'a pas pu partir (${esc(r.erreur)}). Reconnecte-toi puis rouvre ce flash : elle repartira.</p>`
        : `<p class="${r === "envoye" ? "ok-txt" : "discret"}">${r === "envoye" ? "✓ Note envoyée au prof." : "Note gardée sur ton appareil : elle partira au prof dès que le réseau revient."}</p>`;
    };
    APRES = () => { majNote(); envoyer(); };
    f.questions.forEach((q, k) => maj(k));
    majNote();
    if (st.envoye) { const fin = document.getElementById("fl-fin"); if (fin) fin.innerHTML = `<p class="discret">Note enregistrée.</p>`; }
    else if (complete(f, st)) envoyer();
    else Promise.all(f.questions.map((q, k) => (qComplete(f, st, k) || (st.cor[k] && st.cor[k].etat === "erreur") ? null : corrigerQ(f, st, k))))
      .then(() => { if (APRES) APRES(); });
    const rz = document.getElementById("fl-reset");
    if (rz) rz.onclick = () => { effacer(f); eleve($app, `${f.date}-${f.passage || 1}`, ctx); };
    guetter($app, f.date, ctx, f.id);
  }

  function questionCorrigee(f, st, k) {
    const q = f.questions[k], c = st.cor[k] || {}, rep = (st.reponses[k] || "").trim();
    const attente = c.etat === "attente", erreur = c.etat === "erreur";
    const pts = qComplete(f, st, k) ? `<span class="fl-pts">${nb(ptsQ(f, st, k))} / ${nb(maxQ(q))}</span>` : "";
    const elts = q.elements.map((e, i) => {
      const v = verdict(st, k, i);
      if (v) return `<li class="fl-elt ${v.verdict}"><span class="fl-pas" aria-label="${v.verdict === "present" ? "juste" : v.verdict === "partiel" ? "en partie" : "manque ou faux"}">${PASTILLE[v.verdict]}</span>
        <div><b>${esc(e.t)}</b>${v.raison ? `<div class="fl-raison">${esc(v.raison)}</div>` : ""}${v.par === "eleve" ? `<div class="discret">coché par toi</div>` : ""}</div></li>`;
      if (attente) return `<li class="fl-elt attente"><span class="fl-pas" aria-hidden="true">…</span><div><b>${esc(e.t)}</b><div class="discret">L'IA corrige…</div></div></li>`;
      return `<li class="fl-elt a-cocher"><span class="fl-pas" aria-hidden="true">?</span><div><b>${esc(e.t)}</b>
        <div class="fl-auto" role="group" aria-label="Est-ce dans ta réponse ?"><span class="discret">Dans ta réponse ?</span>
          <button type="button" class="btn sec" data-i="${i}" data-v="present">Oui</button><button type="button" class="btn sec" data-i="${i}" data-v="partiel">En partie</button><button type="button" class="btn sec" data-i="${i}" data-v="absent">Non</button></div></div></li>`;
    }).join("");
    const relance = erreur && !["QUOTA", "IA_ABSENTE", "CLE_ABSENTE", "NON_CONNECTE", "PROF_NON_CONNECTE", "NON_AUTORISE", "IA_PARTIEL"].includes(c.code) && rep;
    return `${teteQ(q, k, pts)}${corpsQ(q)}
      <div class="fl-ta-rep"><div class="eyebrow">Ta réponse</div>${rep ? `<p class="fl-rep">${esc(rep)}</p>` : `<p class="fl-rep vide">Pas de réponse.</p>`}</div>
      ${erreur && !qComplete(f, st, k) ? `<p class="fl-alerte">${esc(messageIA(c.code))}${relance ? ` <button type="button" class="btn-lien" data-reessayer>Réessayer avec l'IA</button>` : ""}</p>` : ""}
      <ul class="fl-elts">${elts}</ul>
      ${c.conseil ? `<p class="fl-conseil"><b>Conseil :</b> ${esc(c.conseil)}</p>` : ""}
      <details class="fl-corrige"${attente ? "" : " open"}><summary>Le corrigé</summary><div>${q.corrige}</div></details>`;
  }

  const iaDispo = () => !!(SIP.ia && SIP.ia.actif && SIP.ia.actif() && SIP.session.get());
  // une seule demande à l'IA à la fois par question (une page rechargée la relance)
  function corrigerQ(f, st, k) {
    const c = cle(f) + ":" + k;
    if (!ENVOL[c]) ENVOL[c] = demanderIA(f, st, k).finally(() => { delete ENVOL[c]; });
    return ENVOL[c];
  }
  async function demanderIA(f, st, k) {
    const q = f.questions[k], rep = (st.reponses[k] || "").trim();
    st.cor[k] = st.cor[k] || { v: {} }; st.cor[k].v = st.cor[k].v || {};
    const c = st.cor[k];
    if (!rep) {
      q.elements.forEach((e, i) => (c.v[i] = { verdict: "absent", raison: "Pas de réponse.", par: "vide" }));
      c.etat = "ok"; garder(f, st); notifier(k); return;
    }
    if (!iaDispo()) { c.etat = "erreur"; c.code = SIP.ia && SIP.ia.actif && SIP.ia.actif() ? "NON_CONNECTE" : "IA_ABSENTE"; garder(f, st); notifier(k); return; }
    c.etat = "attente"; garder(f, st); notifier(k);
    try {
      const d = await SIP.ia.corriger({ question: q.ia || brut(q.enonce), corrige: brut(q.corrige),
        elements: q.elements.map((e, i) => ({ i, t: e.t, p: e.p })), reponse: rep.slice(0, 2000) });
      (d.elements || []).forEach((x) => { if (q.elements[x.i] && POIDS[x.verdict] != null) c.v[x.i] = { verdict: x.verdict, raison: x.raison || "", par: "ia" }; });
      c.conseil = d.conseil || "";
      if (qComplete(f, st, k)) { c.etat = "ok"; c.code = null; } else { c.etat = "erreur"; c.code = "IA_PARTIEL"; }
    } catch (e) { c.etat = "erreur"; c.code = e.code || e.message || "IA"; }
    garder(f, st); notifier(k);
  }

  // copie faite sur un autre appareil : la note du serveur, et le corrigé si on sait quelles questions
  function dejaFait($app, F, h, id, ctx) {
    const x = lireId(id) || { jour: SIP.aujourdhui(), passage: 1 }, jour = x.jour, pass = x.passage > 1 ? ` · ${eme(x.passage)} passage` : "";
    if (!visible(jour)) {
      const n = chronoFini(id) ? sur20(h.score, h.score_max) : null;
      $app.innerHTML = `${retour()}<div class="eyebrow">⚡ Flash · ${esc(jourLong(jour))}${pass}</div><h1>Copie rendue ✓</h1><div class="carte fl-cache">
        <p>Tu as rendu ce flash le ${esc(SIP.fmtDate(h.fait_le, true))}${n !== null ? ` : ta note est <b>${nb(n)}/20</b>` : ""}.</p>
        <p>${n !== null ? "" : "Ta note s'affichera à la fin du chrono. "}<b>Ta correction s'affichera quand le prof la montrera</b> (au plus tard demain).</p></div>`;
      return guetter($app, jour, ctx, idDe(jour, x.passage || 1));
    }
    const n = sur20(h.score, h.score_max);
    const chapeau = `Tu as rendu ce flash le ${esc(SIP.fmtDate(h.fait_le, true))} : <b>${nb(n)}/20</b>. Ta copie détaillée est sur l'appareil où tu l'as faite.`;
    if (F) return revoir($app, F, chapeau + " Voici les questions et le corrigé.", ctx);
    $app.innerHTML = `${retour()}<div class="eyebrow">⚡ Flash · ${esc(jourLong(jour))}${pass}</div><h1>Flash rendu</h1><p>${chapeau}</p>`;
    guetter($app, jour, ctx, idDe(jour, x.passage || 1));
  }
  function revoir($app, f, chapeau, ctx) {
    const ok = visible(f.date);
    $app.innerHTML = `${retour()}<div class="eyebrow">⚡ Flash · ${esc(jourLong(f.date))}${f.passage > 1 ? ` · ${eme(f.passage)} passage` : ""}</div><h1>${ok ? "Les questions et le corrigé" : "Les questions"}</h1>
      <p>${ok ? chapeau : "Le corrigé s'affichera quand le prof le montrera (au plus tard demain). En attendant, cherche les questions."}</p>
      ${f.questions.map((q, k) => `<section class="carte fl-q">${teteQ(q, k)}${corpsQ(q)}${ok ? `<details class="fl-corrige"><summary>Le corrigé</summary><div>${q.corrige}</div></details>` : ""}</section>`).join("")}`;
    if (ctx) guetter($app, f.date, ctx, f.id);
  }

  // ---------- professeur : choisir le flash ----------
  const NIVEAU_PROF = "TSI";
  const ligneQ = (ref, coche) => { const q = qRef(ref); if (!q) return ""; const resume = brut(q.enonce);
    return `<label class="fl-choix-q"><input type="checkbox" value="${esc(ref)}"${coche ? " checked" : ""}><span><b>${esc(q.theme || "")}</b><span class="discret">${esc(resume.length > 140 ? resume.slice(0, 137) + "…" : resume)}</span></span></label>`; };
  const apercuQ = (refs) => `<ol class="fl-tire">${refs.map((ref) => { const q = qRef(ref); return q ? `<li><b>${esc(q.theme || "")}</b> <span class="discret">${esc(brut(q.enonce))}</span></li>` : ""; }).join("")}</ol>`;
  const nomNotion = (id) => { const n = SIP.BAC && SIP.BAC.notions ? SIP.BAC.notions.find((x) => x.id === id) : null; return n ? n.lab : id; };
  function choisir($app) {
    const auj = SIP.aujourdhui(), prevu = flashDe(auj), pool = dejaTombe(auj, NIVEAU_PROF);
    let graine = 1 + Math.floor(Math.random() * 999999998);
    const groupes = {};
    pool.forEach((ref) => { const q = qRef(ref), g = (q && (q.notion || q.theme)) || "autres"; (groupes[g] = groupes[g] || []).push(ref); });
    const autres = tous().filter((f) => f.date !== auj).sort((a, b) => b.date.localeCompare(a.date));
    $app.innerHTML = `<p class="no-print"><a href="#/">← Accueil</a></p>
      <h1>Quel flash lancer ?</h1>
      <p class="discret">Les élèves ouvrent « Flash du jour » dans leur session et attendent. Choisis le flash, projette-le, puis clique « Lancer » : leurs chronos partent avec le tien (${DUREE_FLASH / 60} minutes).</p>
      <section class="carte fl-src fl-montrer-carte"><div class="eyebrow">Correction du flash d'aujourd'hui</div>
        <p class="discret" style="margin:4px 0 8px">À 0:00, les élèves voient leur note. Leur correction reste cachée jusqu'à ce que tu la montres (sinon elle s'ouvre le lendemain).</p>
        <button class="btn sec" type="button" id="fl-montrer" disabled>…</button> <span class="discret" id="fl-montrer-etat"></span></section>
      ${prevu ? `<section class="carte fl-src"><div class="eyebrow">Préparé pour aujourd'hui</div><h2>${prevu.questions.length} questions · ${minutes(prevu)}</h2>${apercuQ(refsFlash(prevu))}
        <a class="btn" href="#/flash/projeter/${prevu.date}">Projeter ce flash →</a></section>` : ""}
      <section class="carte fl-src"><div class="eyebrow">Au hasard</div><h2>3 questions sur ce qui est déjà tombé</h2>
        <p class="discret">Tirées parmi ${pool.length} question${pool.length > 1 ? "s" : ""} : les flashs des séances passées et la banque des notions déjà vues (une question par notion si possible). Tous les élèves ont les mêmes.</p>
        ${pool.length ? `<div id="fl-tirage"></div><div class="rang"><button class="btn sec" type="button" id="fl-retirer">↻ Tirer d'autres questions</button><a class="btn" id="fl-proj-alea" href="#">Projeter ce flash →</a></div>` : `<p>Pas encore de questions déjà tombées.</p>`}</section>
      <section class="carte fl-src"><div class="eyebrow">À la carte</div><h2>Je choisis les questions</h2>
        ${pool.length ? `${Object.keys(groupes).map((g) => `<div class="fl-groupe"><div class="eyebrow">${esc(nomNotion(g))}</div>${groupes[g].map((ref) => ligneQ(ref, false)).join("")}</div>`).join("")}
        <p class="rang"><a class="btn" id="fl-proj-carte" href="#" aria-disabled="true">Projeter les questions cochées →</a><span class="discret" id="fl-nb-carte">Coche de 1 à 6 questions.</span></p>` : `<p>Pas encore de questions déjà tombées.</p>`}</section>
      ${autres.length ? `<section class="carte fl-src"><div class="eyebrow">Les flashs préparés</div><div class="nb-liste">${autres.map((x) => `<a class="nb-row fiche-ligne" href="#/flash/projeter/${x.date}"><span class="nb-rk">⚡</span><span class="nb-nm"><b>${esc(jourLong(x.date))}</b><span class="discret">${x.questions.map((q) => esc(q.theme || "")).join(" · ")}</span></span><span class="nb-go" aria-hidden="true">→</span></a>`).join("")}</div></section>` : ""}`;
    const zone = document.getElementById("fl-tirage");
    const montrer = () => { if (!zone) return; zone.innerHTML = apercuQ(tirage(graine, auj, NIVEAU_PROF)); document.getElementById("fl-proj-alea").href = "#/flash/projeter/alea-" + graine; };
    montrer();
    const re = document.getElementById("fl-retirer"); if (re) re.onclick = () => { graine = 1 + Math.floor(Math.random() * 999999998); montrer(); };
    const bouton = document.getElementById("fl-proj-carte"), compte = document.getElementById("fl-nb-carte");
    const majCarte = () => {
      const refs = [...$app.querySelectorAll(".fl-choix-q input:checked")].map((i) => i.value);
      const ok = refs.length >= 1 && refs.length <= 6;
      bouton.setAttribute("aria-disabled", String(!ok)); bouton.classList.toggle("sec", !ok);
      bouton.href = ok ? "#/flash/projeter/q:" + refs.join(",") : "#";
      compte.textContent = refs.length ? `${refs.length} question${refs.length > 1 ? "s" : ""} · ${Math.max(DUREE_FLASH, refs.length * DUREE_Q) / 60} min${refs.length > 6 ? " — 6 au plus" : ""}` : "Coche de 1 à 6 questions.";
    };
    if (bouton) { $app.querySelectorAll(".fl-choix-q input").forEach((i) => (i.onchange = majCarte)); bouton.onclick = (ev) => { if (bouton.getAttribute("aria-disabled") === "true") ev.preventDefault(); }; majCarte(); }
    boutonMontrer(document.getElementById("fl-montrer"), (t) => { const z = document.getElementById("fl-montrer-etat"); if (z) z.textContent = t; });
  }

  // ---------- professeur : montrer (ou cacher) la correction du jour aux élèves ----------
  function boutonMontrer(b, dire) {
    if (!b) return;
    const auj = SIP.aujourdhui(), vue = VUE;
    let montree = null;
    const afficher = () => { b.disabled = montree === null; b.setAttribute("aria-pressed", String(!!montree)); b.textContent = montree ? "✓ Correction montrée · la cacher" : "Montrer la correction aux élèves"; b.classList.toggle("plein", !montree); };
    const erreur = (e) => dire(/NON_AUTORISE|JWT|permission/i.test((e && e.message) || "") ? "Connecte-toi à l'espace prof dans ce navigateur pour montrer la correction." : sqlAbsent(e) || /flash_montrer/i.test((e && e.message) || "") ? "La base n'a pas encore cette fonction (supabase/flash.sql à jour à installer)." : "Pas de réponse de la base : réessaie.");
    SIP.api.flashMontrer(NIVEAU_PROF, auj, null).then((r) => { if (vue !== VUE) return; montree = !!(r && r.montree); afficher(); }).catch((e) => { if (vue !== VUE) return; montree = false; afficher(); erreur(e); });
    // pas pendant le chrono : ceux qui ont rendu tôt verraient la correction pendant que les autres composent
    const chronoTourne = () => { try { const L = JSON.parse(localStorage.getItem("sip_flash_lance") || "{}")[NIVEAU_PROF]; return !!(L && L.flash && Date.parse(L.fin) > Date.now()); } catch (e) { return false; } };
    b.onclick = async () => {
      if (montree === null) return;
      const voulu = !montree;
      if (voulu && chronoTourne()) { dire("Attends la fin du chrono : sinon, ceux qui ont rendu tôt verraient la correction pendant que les autres composent."); return; }
      b.disabled = true;
      try {
        const r = await SIP.api.flashMontrer(NIVEAU_PROF, auj, voulu);
        if (vue !== VUE) return;
        montree = !!(r && r.montree); afficher();
        dire(montree ? "✓ Les élèves voient maintenant leur correction (leur page s'ouvre toute seule)." : "Correction cachée : les élèves ne voient plus que leur note.");
      } catch (e) { if (vue !== VUE) return; afficher(); erreur(e); }
    };
    afficher();
  }

  // ---------- professeur : projeter et lancer ----------
  function projeter($app, source) {
    arreter();
    if (!source) return choisir($app);
    source = decodeURIComponent(source);
    const auj = SIP.aujourdhui(), niveau = NIVEAU_PROF, F = seanceDe(source, auj, niveau);
    if (!F) { $app.innerHTML = `<p><a href="#/flash/projeter">← Choisir un flash</a></p><div class="carte"><p>Ce flash n'existe pas (ou plus).</p></div>`; return; }
    document.body.classList.add("projection");
    const T = F.duree_s, vue = VUE, pass = F.passage > 1 ? ` · ${eme(F.passage)} passage` : "";
    const nVar = F.refs.filter(varie).length, nQ = F.refs.length;   // questions dont les valeurs changent à la relance
    $app.innerHTML = `<div class="proj fl-proj">
      <div class="proj-barre"><span class="proj-titre">Flash · ${esc(jourLong(auj))}${pass}</span>
        <button class="btn" type="button" id="flp-go">Lancer le flash</button>
        <button class="btn sec" type="button" id="flp-plus" hidden title="Une minute de plus au chrono du tableau et à celui de chaque élève">+1 min</button>
        <button class="btn sec" type="button" id="flp-autres"${nVar ? "" : " disabled"} title="${nVar ? "Les mêmes questions avec d'autres valeurs : chaque élève refait le flash, sur une nouvelle copie, avec une nouvelle note" : "Ces questions n'ont pas de valeurs qui changent"}">↻ Nouvelles valeurs</button>
        <button class="btn sec" type="button" id="flp-cor" aria-pressed="false" title="Afficher le corrigé au tableau (les élèves ne le voient pas sur leur page)">Corrigé au tableau</button>
        <button class="btn sec" type="button" id="flp-montrer" disabled>…</button><button class="btn sec" type="button" id="flp-fs">Plein écran</button>
        <a class="btn sec" href="#/flash/projeter">Changer</a><a class="btn sec" href="#/">Quitter</a></div>
      <p class="fl-pz-info" id="flp-info" role="status" aria-live="polite"></p>
      <div class="proj-zone fl-pz">
        <div class="fl-pz-tete">
          <div><h1>Flash · ${esc(jourLong(auj))}${pass}</h1><p class="fl-pz-sous">${minutes(F)} · seul · en silence · calculatrice autorisée<br>Sur le site : ouvre <b>Flash du jour</b> et attends le lancement</p></div>
          <div class="fl-pz-ch"><div class="fl-pz-t" id="flp-t">${mmss(T)}</div><div class="fl-pz-et" id="flp-et">pas lancé</div></div>
        </div>
        <ol class="fl-pz-qs">${F.questions.map((q, k) => `<li class="fl-pz-q"><span class="fl-num">${k + 1}</span><div class="fl-pz-qc">
          <div class="eyebrow">${esc(q.theme || "")}</div><div class="fl-pz-en">${q.enonce}</div>
          <div class="fl-pz-rep" hidden><b>Réponse :</b> ${q.corrige}</div></div>${q.fig ? `<div class="fl-pz-fig">${q.fig}</div>` : ""}</li>`).join("")}</ol>
        <p class="fl-pz-aide">Espace : lancer · + : une minute de plus · C : corrigé au tableau · F : plein écran · Échap : quitter · À 0:00, les élèves voient leur note · « Montrer la correction aux élèves » : leur page affiche alors leur correction · « Nouvelles valeurs » : les mêmes questions avec d'autres nombres, une nouvelle copie et une nouvelle note pour chacun</p>
      </div></div>`;
    const ch = document.getElementById("flp-t"), et = document.getElementById("flp-et"), go = document.getElementById("flp-go"), cor = document.getElementById("flp-cor");
    const bPlus = document.getElementById("flp-plus"), bAutres = document.getElementById("flp-autres");
    const boutons = () => { bPlus.hidden = !enCours; bAutres.hidden = enCours; };
    const info = document.getElementById("flp-info");
    const dire = (t, cls) => { info.innerHTML = t; info.className = "fl-pz-info" + (cls ? " " + cls : ""); };
    let fin = null, enCours = false;
    const aff = () => {
      const r = fin ? Math.max(0, Math.ceil((fin - Date.now()) / 1000)) : T;
      ch.textContent = mmss(r); ch.classList.toggle("fin", !!fin && r <= 0); ch.classList.toggle("urgent", !!fin && r > 0 && r <= 30);
      if (fin && r <= 0 && enCours) { enCours = false; if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null; et.textContent = "temps écoulé : copies rendues"; relancer(); boutons(); }
    };
    const relancer = () => { go.textContent = "Relancer"; go.title = "Mêmes questions, mêmes valeurs : seuls les élèves qui ne l'ont pas encore fait peuvent le faire"; go.disabled = false; };
    const tourner = (finLocal, quoi) => {
      fin = finLocal; enCours = true; et.textContent = quoi; go.textContent = "Arrêter"; go.title = ""; go.disabled = false; boutons();
      if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = setInterval(aff, 200); aff();
    };
    // page rechargée pendant le flash : on reprend le chrono lancé depuis ce navigateur
    try { const L = JSON.parse(localStorage.getItem("sip_flash_lance") || "{}")[niveau]; if (L && L.flash === source && Date.parse(L.fin) > Date.now()) tourner(Date.parse(L.fin), "en cours"); } catch (e) { /* rien */ }
    // le bouton relit l'état dans la base : un lancement cache la correction du jour (flash_lancer)
    const montrer = () => boutonMontrer(document.getElementById("flp-montrer"), (t) => dire(esc(t), /^✓/.test(t) ? "ok" : ""));
    const lancer = async () => {
      if (go.disabled || vue !== VUE) return;
      go.disabled = true;
      if (enCours) {   // arrêter : plus personne ne peut commencer ; les copies commencées gardent leur chrono
        try { await SIP.api.flashLancer(niveau, source, 0); } catch (e) { /* le chrono du tableau s'arrête quand même */ }
        if (vue !== VUE) return;
        enCours = false; fin = null; if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null; aff();
        et.textContent = "arrêté"; relancer(); boutons();
        dire("Flash arrêté : plus personne ne peut le commencer. Les élèves déjà partis gardent leur chrono.");
        return;
      }
      dire("Lancement…");
      try {
        const r = await SIP.api.flashLancer(niveau, source, T);
        if (vue !== VUE) return;
        tourner(Date.parse(r.fin) + (Date.now() - Date.parse(r.maintenant)), "en cours");
        dire("✓ Lancé : le chrono des élèves qui attendent sur « Flash du jour » est parti. Ceux qui l'ouvrent maintenant ont le temps qui reste.", "ok");
        montrer();
      } catch (e) {
        if (vue !== VUE) return;
        go.disabled = false;
        if (sqlAbsent(e)) dire("La base n'a pas le lancement à distance (supabase/flash.sql à installer une fois).", "ko");
        else if (/NON_AUTORISE|JWT|permission/i.test(e.message || "")) dire(`Pour lancer le flash sur les téléphones, connecte-toi d'abord à <a href="prof.html">l'espace prof</a> dans ce navigateur, puis reviens ici.`, "ko");
        else dire(`Le lancement n'est pas parti (${esc(e.message || "réseau ?")}) : réessaie.`, "ko");
      }
    };
    // une minute de plus : pour le tableau et pour chaque élève (leur page relit la fin dans la base toutes les 2 s)
    const plus = async () => {
      if (!enCours || vue !== VUE || bPlus.disabled) return;
      if (fin - Date.now() < 3000) { dire("Trop tard pour ajouter du temps : les copies partent. Relance le flash, ou lance de nouvelles valeurs.", "ko"); return; }
      bPlus.disabled = true;
      try {
        const r = await SIP.api.flashRallonger(niveau, 60);
        if (vue !== VUE) return;
        if (r && r.lance) { tourner(Date.parse(r.fin) + (Date.now() - Date.parse(r.maintenant)), "en cours"); dire("✓ +1 min : le chrono de chaque élève se met à l'heure dans les 2 secondes.", "ok"); }
        else dire("Le flash est déjà fini : on ne peut plus ajouter de temps. Relance-le, ou lance de nouvelles valeurs.", "ko");
      } catch (e) {
        if (vue !== VUE) return;
        dire(/flash_rallonger|PGRST202|Could not find the function|schema cache/i.test(e.message || "") ? "La base n'a pas encore « +1 min » (supabase/flash.sql à jour à installer)."
          : /NON_AUTORISE|JWT|permission/i.test(e.message || "") ? `Connecte-toi à <a href="prof.html">l'espace prof</a> dans ce navigateur pour ajouter du temps.` : "Pas de réponse de la base : réessaie.", "ko");
      } finally { bPlus.disabled = false; }
    };
    // les mêmes questions avec d'autres valeurs : passage suivant (pas encore lancé : le prof voit les nouvelles valeurs, puis « Lancer »)
    const autres = () => { if (enCours || !nVar || vue !== VUE) return; location.hash = "#/flash/projeter/" + encodeURIComponent(`${sansPassage(source)}@${F.passage + 1}`); };
    const corr = () => { const on = cor.getAttribute("aria-pressed") !== "true"; cor.setAttribute("aria-pressed", String(on)); $app.querySelectorAll(".fl-pz-rep").forEach((e) => (e.hidden = !on)); };
    const fs = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
    go.onclick = lancer; cor.onclick = corr; document.getElementById("flp-fs").onclick = fs; bPlus.onclick = plus; bAutres.onclick = autres;
    montrer(); boutons();
    if (F.passage > 1) dire(`${eme(F.passage)} passage : ${nVar === nQ ? "nouvelles valeurs pour toutes les questions" : `nouvelles valeurs pour ${nVar} question${nVar > 1 ? "s" : ""} sur ${nQ} (les autres ne changent pas)`}. Clique « Lancer » : chaque élève refait le flash sur une nouvelle copie, avec une nouvelle note (la précédente reste dans ta grille).`, "ok");
    CLAVIER = (ev) => {
      if (ev.target.closest && ev.target.closest("input,textarea,select,button,a")) { if (ev.key === " ") return; }
      if (ev.key === " ") { ev.preventDefault(); if (!enCours) lancer(); }
      else if (ev.key === "+") plus();
      else if (ev.key === "c" || ev.key === "C") corr();
      else if (ev.key === "f" || ev.key === "F") fs();
      else if (ev.key === "Escape" && !document.fullscreenElement) location.hash = "#/";
    };
    document.addEventListener("keydown", CLAVIER);
    if (!enCours) SIP.statutProf().then((st) => { if (vue === VUE && !enCours && st !== "oui") dire(`Pour lancer le flash sur les téléphones des élèves, connecte-toi à <a href="prof.html">l'espace prof</a> dans ce navigateur (une fois), puis reviens ici.`, "alerte"); }).catch(() => {});
    aff();
  }

  SIP.flash = { tuile, carteProf, liste, eleve, projeter, arreter, seanceDe, tirage, dejaTombe, majCorrigees, noteVisible, concerne: flashsPour };
})(window.SIP);
