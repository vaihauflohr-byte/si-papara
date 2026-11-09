/* =====================================================================
   SI Papara — les flashs de début de séance (questions dans contenu/flashs.js)

   Élève (#/flash/AAAA-MM-JJ) : le jour du flash, il ouvre la page et attend. Quand le prof clique « Lancer » sur la
   page projetée, la base note le début et la fin (supabase/flash.sql) ; la page de l'élève, qui l'interroge toutes
   les 2 s, démarre son chrono réglé sur l'heure du serveur : il finit avec celui du tableau, et la copie est rendue
   toute seule à 0:00. Recharger la page ne change pas le chrono. Une seule copie notée par flash.
   Si flash.sql n'est pas installé dans Supabase : le code du flash s'affiche au tableau au lancement, l'élève le tape.
   Correction : chaque réponse part à l'IA (SIP.ia.corriger → fonction Supabase « corriger ») avec la question,
   le corrigé et les éléments du barème ; verdict par élément (présent 1, en partie ½, absent 0). Sans IA
   (réseau, quota, aperçu) : l'élève coche lui-même avec le corrigé. Note enregistrée : module flash-<date>.
   Prof (#/flash/projeter ; lancer demande d'être connecté à l'espace prof dans ce navigateur) : questions, Lancer,
   chrono, correction (C), plein écran (F).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const esc = SIP.esc;
  const tous = () => SIP.FLASHS || [];
  const flashDe = (date) => tous().find((f) => f.date === date) || null;
  const pour = (niveau) => tous().filter((f) => !f.niveau || f.niveau === niveau);
  const moduleDe = (f) => "flash-" + f.date;
  const jourLong = (d) => new Date(d + "T12:00:00-10:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Pacific/Tahiti" });
  const jourCourt = (d) => new Date(d + "T12:00:00-10:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "Pacific/Tahiti" });
  const mmss = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
  const minutes = (f) => { const m = f.duree_s / 60; return `${SIP.nb ? SIP.nb(m, 2) : m} minute${m > 1 ? "s" : ""}`; };
  const nb = (x) => (SIP.nb ? SIP.nb(x, 3) : String(Math.round(x * 10) / 10).replace(".", ","));
  const POIDS = { present: 1, partiel: 0.5, absent: 0 };
  const PASTILLE = { present: "✓", partiel: "½", absent: "✗" };
  const brut = (h) => String(h ?? "")
    .replace(/<span class="frac"><span class="nu">(.*?)<\/span><span class="sr"> sur <\/span><span class="de">(.*?)<\/span><\/span>/g, "($1)/($2)")
    .replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<sub>(.*?)<\/sub>/g, "$1").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

  // ---------- minuterie et clavier de la vue affichée ----------
  let MINUTERIE = null, CLAVIER = null, VUE = 0;
  let MAJ = null, APRES = null;          // vue de correction affichée : mise à jour d'une question, puis note et envoi
  function arreter() {
    if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null;
    if (CLAVIER) document.removeEventListener("keydown", CLAVIER); CLAVIER = null;
    MAJ = null; APRES = null; VUE++;
  }

  // ---------- copie de l'élève, gardée sur l'appareil ----------
  // (une seule copie en mémoire par flash : une correction en cours continue même si l'élève change de page)
  const cle = (f) => { const s = SIP.session.get() || {}; return `sip_flash_v1:${s.eleve_id || "local"}:${f.date}`; };
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

  const verdict = (st, k, i) => (st.cor && st.cor[k] && st.cor[k].v && st.cor[k].v[i]) || null;
  const qComplete = (f, st, k) => f.questions[k].elements.every((e, i) => !!verdict(st, k, i));
  const complete = (f, st) => f.questions.every((q, k) => qComplete(f, st, k));
  const ptsQ = (f, st, k) => f.questions[k].elements.reduce((a, e, i) => { const v = verdict(st, k, i); return a + (v ? POIDS[v.verdict] * e.p : 0); }, 0);
  const maxQ = (q) => q.elements.reduce((a, e) => a + e.p, 0);
  const total = (f, st) => ({ s: f.questions.reduce((a, q, k) => a + ptsQ(f, st, k), 0), m: f.questions.reduce((a, q) => a + maxQ(q), 0) });
  const sur20 = (s, m) => (m ? (20 * s) / m : 0);
  const classeNote = (n) => (SIP.appreciation ? SIP.appreciation(n).cls : n >= 12 ? "ok" : "alerte");

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

  // ---------- tuile du tableau de bord ----------
  function tuile(niveau, hist) {
    const auj = SIP.aujourdhui(), L = pour(niveau);
    const f = L.find((x) => x.date === auj);
    if (f) {
      const fait = faits(f, hist)[0], st = lire(f);
      if (fait || (st && st.envoye)) {
        const n = fait ? sur20(fait.score, fait.score_max) : sur20(total(f, st).s, total(f, st).m);
        return `<a class="carte fl-tuile fait" href="#/flash/${f.date}"><span class="fl-eclair" aria-hidden="true">⚡</span>
          <div><div class="eyebrow">Flash du jour · rendu</div><div class="fl-tuile-t">${nb(n)}<small>/20</small></div><div class="discret">Revois ta correction et le corrigé.</div></div><span class="btn sec">Ma correction →</span></a>`;
      }
      const enCours = st && st.debut && !st.rendu;
      return `<a class="carte fl-tuile a-faire" href="#/flash/${f.date}"><span class="fl-eclair" aria-hidden="true">⚡</span>
        <div><div class="eyebrow">Flash du jour · noté</div><div class="fl-tuile-t">${f.questions.length} questions · ${minutes(f)}</div>
        <div class="discret">${enCours ? "Ton chrono tourne : reviens vite à ta copie." : st && st.rendu ? "Ta copie est rendue : vois ta correction." : "Ouvre-le et attends : il démarre quand le prof le lance."}</div></div>
        <span class="btn">${enCours ? "Reprendre →" : st && st.rendu ? "Ma correction →" : "Ouvrir →"}</span></a>`;
    }
    const passe = L.filter((x) => x.date < auj).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!passe || SIP.joursEntre(passe.date, auj) > 6) return "";
    const fait = faits(passe, hist)[0];
    return `<p class="fl-dernier"><span aria-hidden="true">⚡</span> Dernier flash (${esc(jourCourt(passe.date))}) : ${fait ? `<b>${nb(sur20(fait.score, fait.score_max))}/20</b>` : "pas fait"} · <a href="#/flash/${passe.date}">${fait ? "revoir ma correction" : "voir le corrigé"}</a> · <a href="#/flash">tous mes flashs</a></p>`;
  }

  // carte de l'accueil, pour le professeur connecté dans ce navigateur
  function carteProf() {
    const auj = SIP.aujourdhui(), f = tous().find((x) => x.date === auj);
    const prochain = tous().filter((x) => x.date > auj).sort((a, b) => a.date.localeCompare(b.date))[0];
    return `<section class="carte fl-prof"><div class="eyebrow">Mode professeur · flash</div>
      ${f ? `<h2>Flash du jour : ${f.questions.length} questions · ${minutes(f)}</h2>
        <p class="discret">Les élèves ouvrent « Flash du jour » et attendent. Projette-le puis clique « Lancer » : leur chrono démarre en même temps que le tien.</p>
        <a class="btn" href="#/flash/${f.date}/projeter">⚡ Projeter le flash du jour</a>`
        : `<h2>Pas de flash prévu aujourd'hui</h2><p class="discret">${prochain ? `Prochain : ${esc(jourLong(prochain.date))}.` : "Aucun flash à venir dans contenu/flashs.js."}</p>
        ${tous().length ? `<a class="btn sec" href="#/flash/projeter">Projeter un flash</a>` : ""}`}</section>`;
  }

  // ---------- liste des flashs de l'élève ----------
  function liste($app, niveau, hist) {
    arreter();
    const auj = SIP.aujourdhui(), L = pour(niveau).filter((f) => f.date <= auj).sort((a, b) => b.date.localeCompare(a.date));
    $app.innerHTML = `<p class="no-print"><a href="#/tableau">← Tableau de bord</a></p><h1>Mes flashs</h1>
      <p class="discret">Le flash du début de séance : quelques questions en quelques minutes, sur ce qu'on a vu la dernière fois et un peu avant. Chaque flash garde ta correction et le corrigé : relis-les avant le DS.</p>
      ${L.length ? `<div class="nb-liste">${L.map((f) => { const fait = faits(f, hist)[0], st = lire(f);
        const n = fait ? sur20(fait.score, fait.score_max) : st && st.envoye ? sur20(total(f, st).s, total(f, st).m) : null;
        return `<a class="nb-row fl-ligne" href="#/flash/${f.date}"><span class="nb-rk">⚡</span>
          <span class="nb-nm"><b>${esc(jourLong(f.date))}</b><span class="discret">${f.questions.map((q) => esc(q.theme || "")).join(" · ")}</span></span>
          ${n !== null ? `<span class="etiquette ${classeNote(n)}">${nb(n)}/20</span>` : f.date === auj ? `<span class="etiquette alerte">à faire</span>` : `<span class="etiquette">pas fait</span>`}<span class="nb-go" aria-hidden="true">→</span></a>`; }).join("")}</div>`
        : `<p class="discret">Pas encore de flash.</p>`}`;
  }

  // ---------- vue élève d'un flash ----------
  function eleve($app, date, ctx) {
    arreter();
    const f = flashDe(date);
    if (!f) { $app.innerHTML = `${retour()}<div class="carte"><p>Ce flash n'existe pas.</p></div>`; return; }
    const st = lire(f), fait = faits(f, ctx.hist), auj = SIP.aujourdhui();
    if (st && st.rendu) return correction($app, f, st, ctx);
    if (st && st.debut) return reste(f, st) > 0 ? repondre($app, f, st, ctx) : rendre($app, f, st, ctx, true);
    if (fait.length) return dejaFait($app, f, fait[0]);
    if (f.date > auj) { $app.innerHTML = `${retour()}<div class="carte"><h1>Flash du ${esc(jourLong(f.date))}</h1><p>Il n'est pas encore ouvert.</p></div>`; return; }
    if (f.date < auj) return revoir($app, f, "Tu n'as pas fait ce flash en classe. Voici les questions et le corrigé : cherche d'abord, puis ouvre le corrigé.");
    intro($app, f, ctx);
  }

  const regles = (f, depart) => `<div class="eyebrow">⚡ Flash · ${esc(jourLong(f.date))} · noté</div>
        <h1>${f.questions.length} questions · ${minutes(f)}</h1>
        <ul class="fl-regles">
          <li>Seul, en silence, calculatrice autorisée.</li>
          <li>${depart} À 0:00, ta copie est rendue toute seule.</li>
          <li>Pour chaque question, écris ton calcul et ton résultat <b>avec l'unité</b>.</li>
          <li>Ensuite, une IA corrige ta copie avec le corrigé du prof. Une seule copie : c'est elle qui est notée.</li>
        </ul>`;
  const commencer = ($app, f, ctx, debut, fin) => {
    const st = { debut, fin, reponses: f.questions.map(() => ""), rendu: null, cor: {} };
    garder(f, st); repondre($app, f, st, ctx);
  };

  // le jour du flash : l'élève attend que le prof le lance (la base est interrogée toutes les 2 s)
  function intro($app, f, ctx) {
    const vue = VUE;
    $app.innerHTML = `${retour()}
      <div class="carte fl-intro">${regles(f, "Le flash démarre <b>quand le prof le lance</b> au tableau : reste sur cette page, ton chrono partira avec le sien.")}
        <div class="fl-attente" id="fl-att" role="status" aria-live="polite"><span class="fl-point" aria-hidden="true"></span><span id="fl-att-t">En attente du lancement par le prof…</span></div>
      </div>`;
    const etat = document.getElementById("fl-att-t"), boite = document.getElementById("fl-att");
    let enVol = false;
    const sonder = async () => {
      if (enVol || vue !== VUE) return;
      enVol = true;
      try {
        const r = await SIP.api.flashEtat();
        if (vue !== VUE) return;
        if (r && r.lance && r.flash === f.date) {
          const decal = Date.now() - Date.parse(r.maintenant), fin = Date.parse(r.fin) + decal, debut = Date.parse(r.debut) + decal;
          if (fin - Date.now() > 1500) { arreter(); commencer($app, f, ctx, debut, fin); return; }
          arreter(); revoir($app, f, "Le flash est terminé et tu ne l'as pas commencé à temps. Voici les questions et le corrigé : cherche d'abord, puis ouvre le corrigé."); return;
        } else { etat.textContent = "En attente du lancement par le prof…"; boite.classList.remove("fini", "ko"); }
      } catch (e) {
        if (vue !== VUE) return;
        if (sqlAbsent(e)) { arreter(); introCode($app, f, ctx); return; }
        if (e.message === "SESSION_EXPIREE") { arreter(); etat.textContent = "Ta session a expiré : reconnecte-toi, puis rouvre le flash."; boite.classList.add("ko"); return; }
        etat.textContent = "Pas de réseau : nouvel essai dans 2 secondes…"; boite.classList.add("ko");
      } finally { enVol = false; }
    };
    MINUTERIE = setInterval(sonder, 2000); sonder();
  }

  // secours, tant que supabase/flash.sql n'est pas installé : le code s'affiche au tableau au lancement
  function introCode($app, f, ctx) {
    $app.innerHTML = `${retour()}
      <div class="carte fl-intro">${regles(f, "Ton chrono démarre quand tu tapes le <b>code affiché au tableau</b> quand le prof lance le flash.")}
        <form id="fl-go" class="fl-code-form" autocomplete="off">
          <label for="fl-code">Code du tableau</label>
          <input id="fl-code" inputmode="numeric" pattern="[0-9]*" maxlength="8" placeholder="····" aria-describedby="fl-msg">
          <button class="btn" type="submit">Commencer</button>
        </form>
        <p id="fl-msg" class="erreur" role="alert" hidden></p>
        ${apercu() ? `<p class="discret">Aperçu professeur : le code est <b>${esc(f.code)}</b>.</p>` : ""}
      </div>`;
    const inp = document.getElementById("fl-code"), msg = document.getElementById("fl-msg");
    document.getElementById("fl-go").onsubmit = (ev) => {
      ev.preventDefault();
      if (inp.value.replace(/\D/g, "") !== String(f.code)) { msg.textContent = "Ce n'est pas le code du tableau. Regarde bien, et retape-le."; msg.hidden = false; inp.select(); return; }
      commencer($app, f, ctx, Date.now(), Date.now() + f.duree_s * 1000);
    };
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
    const t = document.getElementById("fl-t");
    const tic = () => {
      if (vue !== VUE) return;
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
    correction($app, f, st, ctx);
  }

  // ---------- correction ----------
  function correction($app, f, st, ctx) {
    arreter();
    const vue = VUE;
    st.cor = st.cor || {};
    $app.innerHTML = `${retour()}
      <div class="fl-res-tete"><div><div class="eyebrow">⚡ Flash · ${esc(jourLong(f.date))}</div><h1>Ta correction</h1>
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
      if (!complete(f, st) || st.envoye || ENVOIS.has(cle(f))) return;
      ENVOIS.add(cle(f));
      const { s, m } = total(f, st);
      const details = f.questions.map((q, k) => {
        const p = ptsQ(f, st, k), b = maxQ(q), parEleve = q.elements.some((e, i) => (verdict(st, k, i) || {}).par === "eleve");
        return { q: `${q.theme ? q.theme + " — " : ""}${brut(q.enonce)}`, rep: (st.reponses[k] || "").slice(0, 600) + (parEleve ? " [auto-évaluée]" : ""), attendu: brut(q.corrige),
          pts: p, bareme: b, erreurs: p < b ? 1 : 0, par: parEleve ? "eleve" : "ia",
          elements: q.elements.map((e, i) => { const v = verdict(st, k, i) || {}; return { t: e.t, p: e.p, verdict: v.verdict, par: v.par }; }) };
      });
      const fin = document.getElementById("fl-fin");
      try {
        const ok = await ctx.ecrire("enregistrer", { module: moduleDe(f), titre: `Flash du ${jourLong(f.date)}`, type: "externe", score: s, score_max: m,
          duree_s: Math.max(1, Math.round((st.rendu - st.debut) / 1000)), details });
        st.envoye = true; ENVOIS.delete(cle(f)); garder(f, st);
        if (vue === VUE && fin) fin.innerHTML = `<p class="${ok ? "ok-txt" : "discret"}">${ok ? "✓ Note envoyée au prof." : "Note gardée sur ton appareil : elle partira au prof dès que le réseau revient."}</p>`;
      } catch (e) {
        ENVOIS.delete(cle(f));
        if (vue === VUE && fin) fin.innerHTML = `<p class="erreur">La note n'a pas pu partir (${esc(e.message)}). Reconnecte-toi puis rouvre ce flash : elle repartira.</p>`;
      }
    };
    APRES = () => { majNote(); envoyer(); };
    f.questions.forEach((q, k) => maj(k));
    majNote();
    if (st.envoye) { const fin = document.getElementById("fl-fin"); if (fin) fin.innerHTML = `<p class="discret">Note enregistrée.</p>`; }
    else if (complete(f, st)) envoyer();
    else Promise.all(f.questions.map((q, k) => (qComplete(f, st, k) || (st.cor[k] && st.cor[k].etat === "erreur") ? null : corrigerQ(f, st, k))))
      .then(() => { if (APRES) APRES(); });
    const rz = document.getElementById("fl-reset");
    if (rz) rz.onclick = () => { effacer(f); eleve($app, f.date, ctx); };
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

  // copie faite sur un autre appareil : la note du serveur, et le corrigé
  function dejaFait($app, f, h) {
    const n = sur20(h.score, h.score_max);
    revoir($app, f, `Tu as rendu ce flash le ${esc(SIP.fmtDate(h.fait_le, true))} : <b>${nb(n)}/20</b>. Ta copie détaillée est sur l'appareil où tu l'as faite ; voici les questions et le corrigé.`);
  }
  function revoir($app, f, chapeau) {
    $app.innerHTML = `${retour()}<div class="eyebrow">⚡ Flash · ${esc(jourLong(f.date))}</div><h1>Les questions et le corrigé</h1>
      <p>${chapeau}</p>
      ${f.questions.map((q, k) => `<section class="carte fl-q">${teteQ(q, k)}${corpsQ(q)}<details class="fl-corrige"><summary>Le corrigé</summary><div>${q.corrige}</div></details></section>`).join("")}`;
  }

  // ---------- projection (professeur) ----------
  function projeter($app, date) {
    arreter();
    const auj = SIP.aujourdhui();
    const f = date ? flashDe(date) : tous().find((x) => x.date === auj);
    if (!f) {
      const L = tous().slice().sort((a, b) => b.date.localeCompare(a.date));
      $app.innerHTML = `<p><a href="#/">← Accueil</a></p><h1>Projeter un flash</h1><p class="discret">${date ? "Ce flash n'existe pas." : "Pas de flash prévu aujourd'hui."} Choisis-en un :</p>
        <div class="nb-liste">${L.map((x) => `<a class="nb-row fiche-ligne" href="#/flash/${x.date}/projeter"><span class="nb-rk">⚡</span><span class="nb-nm"><b>${esc(jourLong(x.date))}</b><span class="discret">${x.questions.map((q) => esc(q.theme || "")).join(" · ")}</span></span><span class="nb-go" aria-hidden="true">→</span></a>`).join("") || `<p class="discret">Aucun flash dans contenu/flashs.js.</p>`}</div>`;
      return;
    }
    document.body.classList.add("projection");
    const T = f.duree_s, niveau = f.niveau || "TSI", vue = VUE;
    $app.innerHTML = `<div class="proj fl-proj">
      <div class="proj-barre"><span class="proj-titre">Flash · ${esc(jourLong(f.date))}</span>
        <button class="btn" type="button" id="flp-go">Lancer le flash</button>
        <button class="btn sec" type="button" id="flp-cor" aria-pressed="false">Correction</button><button class="btn sec" type="button" id="flp-fs">Plein écran</button>
        <a class="btn sec" href="#/">Quitter</a></div>
      <p class="fl-pz-info" id="flp-info" role="status" aria-live="polite"></p>
      <div class="proj-zone fl-pz">
        <div class="fl-pz-tete">
          <div><h1>Flash · ${esc(jourLong(f.date))}</h1><p class="fl-pz-sous">${minutes(f)} · seul · en silence · calculatrice autorisée<br>Sur le site : ouvre <b>Flash du jour</b> et attends le lancement</p></div>
          <div class="fl-pz-code" id="flp-code" hidden><span>Code</span><b>${esc(f.code)}</b></div>
          <div class="fl-pz-ch"><div class="fl-pz-t" id="flp-t">${mmss(T)}</div><div class="fl-pz-et" id="flp-et">pas lancé</div></div>
        </div>
        <ol class="fl-pz-qs">${f.questions.map((q, k) => `<li class="fl-pz-q"><span class="fl-num">${k + 1}</span><div class="fl-pz-qc">
          <div class="eyebrow">${esc(q.theme || "")}</div><div class="fl-pz-en">${q.enonce}</div>
          <div class="fl-pz-rep" hidden><b>Réponse :</b> ${q.corrige}</div></div>${q.fig ? `<div class="fl-pz-fig">${q.fig}</div>` : ""}</li>`).join("")}</ol>
        <p class="fl-pz-aide">Espace : lancer · C : correction · F : plein écran · Échap : quitter</p>
      </div></div>`;
    const ch = document.getElementById("flp-t"), et = document.getElementById("flp-et"), go = document.getElementById("flp-go"), cor = document.getElementById("flp-cor");
    const info = document.getElementById("flp-info"), code = document.getElementById("flp-code");
    const dire = (t, cls) => { info.innerHTML = t; info.className = "fl-pz-info" + (cls ? " " + cls : ""); };
    let fin = null, enCours = false;
    const aff = () => {
      const r = fin ? Math.max(0, Math.ceil((fin - Date.now()) / 1000)) : T;
      ch.textContent = mmss(r); ch.classList.toggle("fin", !!fin && r <= 0); ch.classList.toggle("urgent", !!fin && r > 0 && r <= 30);
      if (fin && r <= 0 && enCours) { enCours = false; if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null; et.textContent = "temps écoulé : copies rendues"; go.textContent = "Relancer"; go.disabled = false; }
    };
    const tourner = (finLocal, quoi) => {
      fin = finLocal; enCours = true; et.textContent = quoi; go.textContent = "Arrêter"; go.disabled = false;
      if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = setInterval(aff, 200); aff();
    };
    // page rechargée pendant le flash : on reprend le chrono lancé depuis ce navigateur
    try { const L = JSON.parse(localStorage.getItem("sip_flash_lance") || "{}")[niveau]; if (L && L.flash === f.date && Date.parse(L.fin) > Date.now()) tourner(Date.parse(L.fin), "en cours"); } catch (e) { /* rien */ }
    const lancer = async () => {
      if (go.disabled || vue !== VUE) return;
      go.disabled = true;
      if (enCours) {   // arrêter : plus personne ne peut commencer ; les copies commencées gardent leur chrono
        try { await SIP.api.flashLancer(niveau, f.date, 0); } catch (e) { /* le chrono du tableau s'arrête quand même */ }
        if (vue !== VUE) return;
        enCours = false; fin = null; if (MINUTERIE) clearInterval(MINUTERIE); MINUTERIE = null; aff();
        et.textContent = "arrêté"; go.textContent = "Relancer"; go.disabled = false; code.hidden = true;
        dire("Flash arrêté : plus personne ne peut le commencer. Les élèves déjà partis gardent leur chrono.");
        return;
      }
      dire("Lancement…");
      try {
        const r = await SIP.api.flashLancer(niveau, f.date, T);
        if (vue !== VUE) return;
        const decal = Date.now() - Date.parse(r.maintenant);
        code.hidden = true;
        tourner(Date.parse(r.fin) + decal, "en cours");
        dire("✓ Lancé : le chrono des élèves qui attendent sur « Flash du jour » est parti. Ceux qui l'ouvrent maintenant ont le temps qui reste.", "ok");
      } catch (e) {
        if (vue !== VUE) return;
        if (sqlAbsent(e)) {        // flash.sql pas encore installé : le code au tableau, les élèves le tapent
          code.hidden = false; tourner(Date.now() + T * 1000, "en cours");
          dire("La base n'a pas encore le lancement à distance (supabase/flash.sql à installer une fois) : les élèves tapent le code affiché.", "alerte");
          return;
        }
        go.disabled = false;
        if (/NON_AUTORISE|JWT|permission/i.test(e.message || "")) dire(`Pour lancer le flash sur les téléphones, connecte-toi d'abord à <a href="prof.html">l'espace prof</a> dans ce navigateur, puis reviens ici.`, "ko");
        else dire(`Le lancement n'est pas parti (${esc(e.message || "réseau ?")}) : réessaie.`, "ko");
      }
    };
    const corr = () => { const on = cor.getAttribute("aria-pressed") !== "true"; cor.setAttribute("aria-pressed", String(on)); $app.querySelectorAll(".fl-pz-rep").forEach((e) => (e.hidden = !on)); };
    const fs = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
    go.onclick = lancer; cor.onclick = corr; document.getElementById("flp-fs").onclick = fs;
    CLAVIER = (ev) => {
      if (ev.target.closest && ev.target.closest("input,textarea,select,button,a")) { if (ev.key === " ") return; }
      if (ev.key === " ") { ev.preventDefault(); if (!enCours) lancer(); }
      else if (ev.key === "c" || ev.key === "C") corr();
      else if (ev.key === "f" || ev.key === "F") fs();
      else if (ev.key === "Escape" && !document.fullscreenElement) location.hash = "#/";
    };
    document.addEventListener("keydown", CLAVIER);
    if (!enCours) SIP.statutProf().then((st) => { if (vue === VUE && !enCours && st !== "oui") dire(`Pour lancer le flash sur les téléphones des élèves, connecte-toi à <a href="prof.html">l'espace prof</a> dans ce navigateur (une fois), puis reviens ici.`, "alerte"); }).catch(() => {});
    aff();
  }

  SIP.flash = { tuile, carteProf, liste, eleve, projeter, arreter, duJour: (niveau) => pour(niveau).find((f) => f.date === SIP.aujourdhui()) || null };
})(window.SIP);
