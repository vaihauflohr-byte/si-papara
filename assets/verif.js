/* =====================================================================
   SI Papara — « Vérifie que tu as compris » : questions de compréhension
   insérées dans les fiches de révision (page #/fiche/<id>).
   Après chaque partie de la fiche (L'essentiel, Formules, Méthode, Exemple corrigé,
   Pièges), une ou deux questions ; à la fin, le bilan : note /20, parties à relire.
   La note (premier essai de chaque question) est transmise au professeur quand
   l'élève est connecté : type « externe », module « fiche-<id> » (aucune
   modification de la base). Rien n'est imprimé : la fiche reste sur une page A4.

   Données : contenu/verif-bac.js
     SIP.VERIF_BAC["id-notion"] = [ question, … ];          // 6 à 8 questions
     question = {
       apres: "essentiel" | "formules" | "methode" | "exemple" | "pieges",
       type: "qcm" | "vf" | "num" | "ordre",
       q: "…",                       // énoncé (HTML)
       fig: "<svg …>",               // facultatif : petite figure (currentColor, var(--accent))
       // qcm   : choix: ["bonne réponse", "piège", "piège"], bonne: 0   (mélangés à l'affichage)
       // vf    : vrai: true | false
       // num   : rep: 12.5, unite: "N·m", tol: 2   (écart relatif admis, en %)
       // ordre : items: ["étape 1", "étape 2", …]  (dans le bon ordre ; mélangés à l'affichage)
       expl: "…",                    // correction (HTML), affichée après la réponse
       gen(r) { return { q, rep, expl, … }; },   // facultatif : valeurs tirées au hasard à chaque essai
     };                              //   r.tirer(liste), r.entre(a, b, pas), r.nf3(x), r.fr(n, d)
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const PARTIES = { essentiel: "L'essentiel", formules: "Formules", methode: "Méthode", exemple: "Exemple corrigé", pieges: "Pièges" };
  const norm = (t) => String(t).replace(/<[^>]+>/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const texteNu = (h) => String(h).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const typo = (h) => (SIP.FICHE_OUTILS ? SIP.FICHE_OUTILS.typo(String(h || "")) : String(h || ""));
  const nf3 = (x) => (SIP.ANIM && SIP.ANIM.nf3z ? SIP.ANIM.nf3z(x) : String(x));
  const fr = (n, d) => (SIP.ANIM ? SIP.ANIM.fr(n, d) : `${n} / ${d}`);
  const lireNb = (t) => { const s = String(t).trim().replace(/[    ]/g, "").replace(/−/g, "-").replace(",", ".");
    const x = s.match(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i); return x ? parseFloat(x[0]) : NaN; };
  const melange = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const r = { tirer: (l) => l[Math.floor(Math.random() * l.length)],
    entre: (a, b, pas = 1) => { const n = Math.floor((b - a) / pas + 1e-9); return +(a + pas * Math.floor(Math.random() * (n + 1))).toFixed(10); },
    nf3, fr };
  const el = (tag, attrs, parent) => { const e = document.createElement(tag); for (const k in attrs || {}) { if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } if (parent) parent.appendChild(e); return e; };

  // parties de la fiche : chaque <h3> et ce qui le suit jusqu'au <h3> suivant
  function parties(article) {
    const h = [...article.querySelectorAll(":scope > h3")], P = {};
    h.forEach((t, i) => {
      const n = norm(t.textContent), cles = Object.keys(PARTIES);
      // titre reconnu (« Méthode : … », « Exemple corrigé : … ») ; sinon, la première partie pas encore vue
      // (ex. « Le principe fondamental de la statique » tient lieu de « Formules »)
      let cle = cles.find((k) => !P[k] && (n.startsWith(norm(PARTIES[k]).split(" ")[0]) || n.includes(k)));
      if (!cle) cle = cles.find((k) => !P[k] && !h.slice(i + 1).some((x) => norm(x.textContent).startsWith(norm(PARTIES[k]).split(" ")[0])));
      if (!cle) return;
      let fin = t; while (fin.nextElementSibling && fin.nextElementSibling !== h[i + 1]) fin = fin.nextElementSibling;
      if (!t.id) t.id = "partie-" + cle;
      P[cle] = { titre: t.textContent.trim(), h3: t, fin };
    });
    return P;
  }

  function monter(article, id, o = {}) {
    const L = SIP.VERIF_BAC && SIP.VERIF_BAC[id];
    if (!article || !L || !L.length) return null;
    const P = parties(article);
    const ordre = Object.keys(PARTIES);
    // questions rangées dans l'ordre des parties (celles dont la partie manque vont à la fin)
    const Q = L.map((q, i) => ({ src: q, i })).sort((a, b) => (ordre.indexOf(a.src.apres) + 99 * !P[a.src.apres]) - (ordre.indexOf(b.src.apres) + 99 * !P[b.src.apres]) || a.i - b.i);
    const n = Q.length;
    let essai = null, blocs = [];

    const barre = el("div", { class: "vq-barre no-print", role: "region", "aria-label": "Vérifie que tu as compris" });
    article.insertBefore(barre, article.firstChild);
    const bilan = el("section", { class: "vq-bilan no-print", "aria-live": "polite", "aria-label": "Bilan de la vérification" });
    article.appendChild(bilan);

    function nouvelEssai() {
      blocs.forEach((b) => b.remove()); blocs = [];
      essai = { t0: null, rep: new Array(n).fill(null), envoye: false };
      Q.forEach((x, k) => {
        const q = Object.assign({}, x.src, x.src.gen ? x.src.gen(r) : {});
        const b = bloc(q, k); b._q = q;
        const p = P[q.apres];
        if (p) p.fin.insertAdjacentElement("afterend", b); else article.insertBefore(b, bilan);
        if (p) p.fin = b; // la question suivante de la même partie vient après
        blocs.push(b);
      });
      // remettre les fins de parties sur le contenu de la fiche (pour un prochain essai)
      Object.values(P).forEach((p) => { while (p.fin.classList && p.fin.classList.contains("vq")) p.fin = p.fin.previousElementSibling; });
      majBarre(); majBilan();
    }

    function bloc(q, k) {
      const b = el("section", { class: "vq no-print", "aria-label": `Question de vérification ${k + 1} sur ${n}` });
      const lien = PARTIES[q.apres] && P[q.apres] ? P[q.apres] : null;
      b.innerHTML = `<div class="vq-tete"><span class="vq-eyebrow">Vérifie que tu as compris</span><span class="vq-rang">${k + 1} / ${n}</span></div>
        <div class="vq-q">${typo(q.q)}</div>${q.fig ? `<figure class="vq-fig">${q.fig}</figure>` : ""}<div class="vq-zone"></div>
        <p class="vq-retour" role="status"></p><div class="vq-expl" hidden></div>`;
      const zone = b.querySelector(".vq-zone"), retour = b.querySelector(".vq-retour"), expl = b.querySelector(".vq-expl");
      const fin = (ok, donne, attendu, affiche) => {
        if (essai.rep[k]) return;
        if (!essai.t0) essai.t0 = Date.now();
        essai.rep[k] = { ok, donne, attendu, q: texteNu(q.q).slice(0, 180), apres: q.apres, i: Q[k].i };
        b.classList.add(ok ? "juste" : "faux");
        retour.className = "vq-retour " + (ok ? "ok" : "ko");
        retour.innerHTML = ok ? "<b>Juste !</b>" : `<b>Pas tout à fait.</b> ${affiche || `Réponse attendue : ${attendu}.`}${lien ? ` <a href="#${lien.h3.id}" class="vq-relire">Relis « ${lien.titre} »</a>` : ""}`;
        expl.innerHTML = typo(q.expl || ""); expl.hidden = !q.expl;
        zone.querySelectorAll("button, input").forEach((x) => (x.disabled = true));
        const a = retour.querySelector(".vq-relire");
        if (a) a.onclick = (e) => { e.preventDefault(); lien.h3.scrollIntoView({ behavior: "smooth", block: "start" }); };
        majBarre(); majBilan();
      };
      if (q.type === "qcm" || q.type === "vf") {
        const opts = q.type === "vf" ? [["Vrai", q.vrai === true], ["Faux", q.vrai === false]] : melange(q.choix.map((c, i) => [c, i === q.bonne]));
        const g = el("div", { class: "vq-choix" + (q.type === "vf" ? " vf" : ""), role: "group", "aria-label": "Réponses" }, zone);
        opts.forEach(([txt, bon]) => {
          const bt = el("button", { type: "button", class: "vq-opt", html: typo(txt) }, g);
          bt.onclick = () => {
            g.querySelectorAll(".vq-opt").forEach((x, i) => { if (opts[i][1]) x.classList.add("bonne"); });
            if (!bon) bt.classList.add("choisie-fausse");
            fin(bon, texteNu(txt), texteNu(opts.find((x) => x[1])[0]));
          };
        });
      } else if (q.type === "num") {
        const f = el("form", { class: "vq-num", novalidate: "" }, zone);
        f.innerHTML = `<label>Ta réponse <input name="r" inputmode="decimal" autocomplete="off" spellcheck="false"></label><span class="vq-unite">${q.unite || ""}</span><button class="btn" type="submit">Valider</button>`;
        f.onsubmit = (e) => {
          e.preventDefault();
          const x = lireNb(f.r.value);
          if (!isFinite(x)) { retour.className = "vq-retour ko"; retour.textContent = "Écris un nombre (avec une virgule ou un point)."; return; }
          const ref = +q.rep, tol = q.tol == null ? 2 : q.tol;
          const ok = Math.abs(ref) > 1e-12 ? (Math.abs(x - ref) / Math.abs(ref)) * 100 <= tol : Math.abs(x) < 1e-9;
          fin(ok, `${f.r.value.trim()} ${q.unite || ""}`.trim(), `${nf3(ref)}${q.unite ? " " + q.unite : ""}`);
        };
      } else if (q.type === "ordre") {
        const items = q.items.map((t, i) => ({ t, i })), mel = melange(items);
        if (mel.every((x, i) => x.i === i) && mel.length > 1) mel.push(mel.shift()); // jamais déjà dans l'ordre
        zone.innerHTML = `<p class="vq-aide">Touche les étapes dans le bon ordre.</p><ol class="vq-ordre-res"></ol><div class="vq-ordre"></div><div class="vq-ordre-act"><button class="btn sec" type="button" data-a="eff">Effacer</button><button class="btn" type="button" data-a="ok" disabled>Valider l'ordre</button></div>`;
        const res = zone.querySelector(".vq-ordre-res"), src = zone.querySelector(".vq-ordre"), bok = zone.querySelector('[data-a="ok"]');
        let choisi = [];
        const rendre = () => {
          res.innerHTML = choisi.map((x) => `<li>${typo(x.t)}</li>`).join("");
          src.innerHTML = ""; mel.filter((x) => !choisi.includes(x)).forEach((x) => { const bt = el("button", { type: "button", class: "vq-opt", html: typo(x.t) }, src); bt.onclick = () => { choisi.push(x); rendre(); }; });
          bok.disabled = choisi.length !== mel.length;
        };
        zone.querySelector('[data-a="eff"]').onclick = () => { choisi = []; rendre(); };
        bok.onclick = () => {
          const ok = choisi.every((x, i) => x.i === i);
          res.querySelectorAll("li").forEach((li, i) => li.classList.add(choisi[i].i === i ? "bonne" : "fausse"));
          fin(ok, choisi.map((x) => texteNu(x.t).slice(0, 40)).join(" → "), items.map((x) => texteNu(x.t).slice(0, 40)).join(" → "), "Voici le bon ordre.");
          if (!ok) { expl.innerHTML = `<ol class="vq-ordre-sol">${items.map((x) => `<li>${typo(x.t)}</li>`).join("")}</ol>${typo(q.expl || "")}`; expl.hidden = false; }
        };
        rendre();
      }
      return b;
    }

    const repondues = () => essai.rep.filter(Boolean).length;
    const justes = () => essai.rep.filter((x) => x && x.ok).length;
    function majBarre() {
      const a = repondues(), j = justes();
      barre.innerHTML = `<div><b>Vérifie que tu as compris</b> <span class="discret">· ${n} questions dans la fiche, après chaque partie${o.apercu ? " · aperçu professeur : rien n'est transmis" : o.connecte ? " · ta note est transmise à ton professeur" : ""}</span></div>
        <div class="vq-prog"><span class="vq-t" aria-hidden="true"><i style="width:${(100 * a) / n}%"></i></span><span>${a} / ${n} répondue${a > 1 ? "s" : ""}${a ? ` · ${j} juste${j > 1 ? "s" : ""}` : ""}</span>
        ${a < n ? `<button class="btn sec" type="button">${a ? "Question suivante ↓" : "Commencer ↓"}</button>` : ""}</div>`;
      const bt = barre.querySelector("button");
      if (bt) bt.onclick = () => { const k = essai.rep.findIndex((x) => !x); if (k >= 0) blocs[k].scrollIntoView({ behavior: "smooth", block: "center" }); };
    }
    async function majBilan() {
      const a = repondues();
      if (a < n) { bilan.className = "vq-bilan no-print attente"; bilan.innerHTML = `<p><b>Ai-je compris ?</b> Réponds aux ${n} questions de la fiche pour obtenir ta note${a ? ` (encore ${n - a})` : ""}.</p>`; return; }
      const j = justes(), note = (20 * j) / n;
      const rates = [...new Set(essai.rep.filter((x) => !x.ok).map((x) => x.apres))].filter((p) => P[p]);
      const v = note >= 16 ? { cls: "ok", txt: "Fiche comprise ✓ Passe aux séries d'entraînement de la notion." }
        : note >= 10 ? { cls: "moyen", txt: "Presque : relis les parties ci-dessous, puis refais la vérification." }
        : { cls: "ko", txt: "Relis la fiche en entier, manipule l'animation, puis refais la vérification." };
      bilan.className = "vq-bilan no-print " + v.cls;
      bilan.innerHTML = `<div class="vq-note"><span>Ai-je compris ?</span><b>${SIP.nb ? SIP.nb(note, 3) : note.toFixed(1)}<small> / 20</small></b><span class="discret">${j} réponse${j > 1 ? "s" : ""} juste${j > 1 ? "s" : ""} sur ${n}, au premier essai</span></div>
        <p class="vq-verdict">${v.txt}</p>
        ${rates.length ? `<p>À relire : ${rates.map((p) => `<a href="#${P[p].h3.id}" data-p="${p}">${P[p].titre}</a>`).join(" · ")}</p>` : ""}
        <p class="vq-envoi discret"></p>
        <div class="vq-actions"><button class="btn sec" type="button" data-a="refaire">Refaire la vérification${Q.some((x) => x.src.gen) ? " (autres valeurs)" : ""}</button>${o.lienEntrainement ? `<a class="btn" href="${o.lienEntrainement}">S'entraîner sur la notion →</a>` : ""}</div>`;
      bilan.querySelectorAll("[data-p]").forEach((x) => (x.onclick = (e) => { e.preventDefault(); P[x.dataset.p].h3.scrollIntoView({ behavior: "smooth", block: "start" }); }));
      bilan.querySelector('[data-a="refaire"]').onclick = () => { nouvelEssai(); barre.scrollIntoView({ behavior: "smooth", block: "start" }); };
      const envoi = bilan.querySelector(".vq-envoi");
      if (essai.envoye) { envoi.textContent = essai.envoye; return; }
      if (!(SIP.session && SIP.session.get && SIP.session.get())) { essai.envoye = "Tu n'es pas connecté(e) : ta note n'est pas transmise au professeur."; envoi.textContent = essai.envoye; return; }
      essai.envoye = "Envoi au professeur…"; envoi.textContent = essai.envoye;
      try {
        const ok = await SIP.ecrire("enregistrer", { module: "fiche-" + id, titre: "Fiche : " + (o.titre || id), type: "externe", score: j, score_max: n,
          duree_s: essai.t0 ? Math.round((Date.now() - essai.t0) / 1000) : null,
          details: essai.rep.map((x) => ({ q: x.q, rep: x.donne, attendu: x.attendu, pts: x.ok ? 1 : 0, i: x.i })) }); // i : numéro de la question dans la fiche (évaluation en classe)
        essai.envoye = o.apercu ? "Aperçu : note gardée dans ce navigateur, rien n'est transmis." : ok ? "Note transmise à ton professeur." : "Pas de réseau : ta note sera transmise dès que possible.";
        if (o.apresEnvoi) o.apresEnvoi();
      } catch (e) { essai.envoye = "La note n'a pas pu être transmise (" + e.message + ")."; }
      envoi.textContent = essai.envoye;
    }

    nouvelEssai();
    const ctl = {
      arreter() { blocs.forEach((b) => b.remove()); barre.remove(); bilan.remove(); if (COURANT === ctl) COURANT = null; },
      // pour les tests automatiques
      _t: { n, questions: () => blocs.map((b, k) => ({ k, type: b._q.type, apres: b._q.apres, rep: b._q.rep, ok: essai.rep[k] ? essai.rep[k].ok : null })),
        etat: () => ({ repondues: repondues(), justes: justes(), envoye: essai.envoye }),
        // répond à la question k par l'interface, juste ou faux
        repondre(k, juste) {
          const b = blocs[k], q = b._q, z = b.querySelector(".vq-zone");
          const txt = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); };
          if (q.type === "qcm" || q.type === "vf") {
            const bon = q.type === "vf" ? (q.vrai ? "Vrai" : "Faux") : txt(typo(q.choix[q.bonne]));
            const bt = [...z.querySelectorAll(".vq-opt")].find((x) => (txt(x.innerHTML) === bon) === !!juste);
            bt.click();
          } else if (q.type === "num") { z.querySelector("input").value = String(juste ? q.rep : q.rep * 1.5 + 1).replace(".", ","); z.querySelector("form").requestSubmit(); }
          else if (q.type === "ordre") {
            const ordre = juste ? q.items : q.items.slice().reverse();
            ordre.forEach((t) => { const bt = [...z.querySelectorAll(".vq-ordre .vq-opt")].find((x) => txt(x.innerHTML) === txt(typo(t))); bt.click(); });
            z.querySelector('[data-a="ok"]').click();
          }
        } },
    };
    COURANT = ctl;
    return ctl;
  }
  let COURANT = null;

  SIP.VERIF = { monter, courant: () => COURANT, nb: (id) => (SIP.VERIF_BAC && SIP.VERIF_BAC[id] ? SIP.VERIF_BAC[id].length : 0) };
  SIP.VERIF_BAC = SIP.VERIF_BAC || {};
})(window.SIP);
