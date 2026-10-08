/* =====================================================================
   SI Papara — « Observe et réponds » : une série de questions posées SUR
   l'animation de la fiche, pendant qu'elle bouge (à la manière des exercices
   de cinématique où l'on regarde un mécanisme et l'on nomme les mouvements).

   Le panneau de réglages est caché : la série règle elle-même l'animation
   (mécanisme, curseurs, boutons) avant chaque question, et peut cacher des
   éléments de la figure (traces, vecteurs) qui donneraient la réponse.
   Note : on part de 20, chaque erreur retire 2 points (comme les séries).
   À la fin, la note est transmise au professeur si l'élève est connecté
   (type « externe », module observe-<notion>).

   Données : contenu/observe-bac.js
     SIP.OBSERVE_BAC["id-notion"] = {
       titre: "…", consigne: "…",
       questions: [ {
         regler: { "mouvement de la piece": "pg", "position du point c": 60 },  // facultatif : contrôles (morceau du libellé) → valeur
         boutons: ["lancer"],              // facultatif : boutons à cliquer après les réglages (morceau du libellé)
         cacher: ["traces", "vitesses"],   // facultatif : groupes de la figure (attribut data-role) à cacher
         q: "…", choix: ["…", "…"], bonne: 0, expl: "…",
       }, … ],
     };
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const el = (tag, attrs, parent) => { const e = document.createElement(tag); for (const k in attrs || {}) { if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } if (parent) parent.appendChild(e); return e; };
  const norm = (t) => String(t).replace(/<[^>]+>/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const typo = (t) => (SIP.FICHE_OUTILS ? SIP.FICHE_OUTILS.typo(t) : t);
  const nf = (x) => (SIP.ANIM ? SIP.ANIM.nf(x, 1) : String(x));
  const melanger = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  let COURANT = null;
  function monter(zone, id, o = {}) {
    const D = SIP.OBSERVE_BAC && SIP.OBSERVE_BAC[id], R = zone && zone._registre;
    if (!D || !D.questions || !D.questions.length || !R || !SIP.MISSIONS || !SIP.MISSIONS.contexte) return null;
    const section = zone.closest(".anim") || zone.parentNode;
    const carte = el("div", { class: "obs", role: "region", "aria-label": "Observe et réponds" });
    zone.insertAdjacentElement("afterend", carte);
    zone.classList.add("obs-actif");
    const Q = D.questions;
    const T = { k: 0, note: 20, fautes: 0, rep: [], nettoyages: [], fini: false, t0: Date.now(), envoye: "" };
    const liberer = () => { while (T.nettoyages.length) { try { T.nettoyages.pop()(); } catch (e) { console.error(e); } } zone.removeAttribute("data-cache"); };

    function preparer(q) {
      liberer();
      const m = SIP.MISSIONS.contexte(R, T.nettoyages);
      try {
        for (const nom in q.regler || {}) m.fixer(nom, q.regler[nom]);
        // boutons : reconnus par leur texte ACTUEL (« ▶ Lancer le mouvement » devient « ⏸ Pause » une fois lancé) ; absent = rien à faire
        (q.boutons || []).forEach((nom) => {
          const n = norm(nom), b = R.boutons.filter((x) => x.el && x.el.isConnected).find((x) => norm(x.el.textContent).includes(n));
          if (b) b.el.click();
        });
      } catch (e) { console.error("observe", id, e); }
      if (q.cacher && q.cacher.length) zone.setAttribute("data-cache", q.cacher.join(" "));
    }

    function dessiner() {
      const q = Q[T.k], n = Q.length;
      carte.innerHTML = `<div class="obs-tete"><span class="obs-eyebrow">Observe et réponds</span>
          <span class="obs-prog">question <b>${T.k + 1}</b> / ${n}</span>
          <span class="obs-note" title="On part de 20 ; chaque erreur retire 2 points">note <b>${nf(T.note)}</b> / 20</span></div>
        <p class="obs-consigne">${typo(D.consigne || "Regarde le mécanisme bouger, puis réponds.")}</p>
        <p class="obs-q">${typo(q.q)}</p>
        <div class="obs-choix">${q.ordre.map((i, k) => `<button class="vq-opt" type="button" data-i="${i}" data-k="${k}">${typo(q.choix[i])}</button>`).join("")}</div>
        <p class="obs-retour" role="status"></p>
        <div class="obs-actions"></div>`;
      carte.querySelectorAll(".vq-opt").forEach((b) => (b.onclick = () => repondre(+b.dataset.i)));
    }

    function repondre(i) {
      const q = Q[T.k]; if (T.rep[T.k]) return;
      const ok = i === q.bonne;
      if (!ok) { T.fautes++; T.note = Math.max(0, T.note - 2); }
      T.rep[T.k] = { q: q.q.replace(/<[^>]+>/g, ""), rep: q.choix[i].replace(/<[^>]+>/g, ""), attendu: q.choix[q.bonne].replace(/<[^>]+>/g, ""), pts: ok ? 1 : 0, i: T.k };
      carte.querySelectorAll(".vq-opt").forEach((b) => {
        b.disabled = true;
        if (+b.dataset.i === q.bonne) b.classList.add("bonne");
        else if (+b.dataset.i === i) b.classList.add("choisie-fausse");
      });
      carte.querySelector(".obs-note b").textContent = nf(T.note);
      const r = carte.querySelector(".obs-retour");
      r.className = "obs-retour " + (ok ? "ok" : "ko");
      r.innerHTML = (ok ? '<b class="obs-verdict">Bravo !</b> ' : '<b class="obs-verdict">Non.</b> ') + typo(q.expl || "");
      // la réponse donnée, on peut montrer ce qui était caché (traces, vecteurs)
      zone.removeAttribute("data-cache");
      const act = carte.querySelector(".obs-actions");
      if (T.k + 1 < Q.length) {
        const b = el("button", { class: "btn", type: "button", text: "Question suivante →" }, act);
        b.onclick = () => { T.k++; preparer(Q[T.k]); dessiner(); carte.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
        b.focus();
      } else {
        const b = el("button", { class: "btn", type: "button", text: "Voir ma note" }, act);
        b.onclick = bilan; b.focus();
      }
    }

    async function bilan() {
      T.fini = true; liberer();
      const n = Q.length, justes = T.rep.filter((x) => x.pts).length;
      carte.innerHTML = `<div class="obs-tete"><span class="obs-eyebrow">Observe et réponds</span><span class="obs-prog">${n} questions</span></div>
        <div class="obs-bilan ${T.note >= 16 ? "ok" : T.note >= 12 ? "moyen" : "ko"}">
          <p class="obs-score"><b>${nf(T.note)}</b> / 20 <span class="discret">· ${justes} réponse${justes > 1 ? "s" : ""} juste${justes > 1 ? "s" : ""} sur ${n}</span></p>
          <p>${T.note >= 16 ? "Tu sais lire la figure : c'est ce qu'on te demande à l'écrit avant tout calcul." : T.note >= 12 ? "Relis l'essentiel de la fiche, puis refais la série : ce que montre la figure doit se voir d'un coup d'œil." : "Reprends la fiche depuis le début, passe en mode « Manipuler » pour faire varier chaque réglage toi-même, puis refais la série."}</p>
          ${T.rep.some((x) => !x.pts) ? `<p class="discret">À revoir : ${T.rep.filter((x) => !x.pts).map((x) => `« ${x.q} »`).join(" · ")}</p>` : ""}
          <p class="obs-envoi discret"></p>
          <div class="obs-actions"><button class="btn sec" type="button" data-a="refaire">Refaire (autre ordre)</button>${o.lienEntrainement ? `<a class="btn" href="${o.lienEntrainement}">S'entraîner sur la notion →</a>` : ""}</div>
        </div>`;
      carte.querySelector('[data-a="refaire"]').onclick = () => { demarrer(); };
      const envoi = carte.querySelector(".obs-envoi");
      if (!(SIP.session && SIP.session.get && SIP.session.get())) { T.envoye = "Tu n'es pas connecté(e) : ta note n'est pas transmise au professeur."; envoi.textContent = T.envoye; return; }
      T.envoye = "Envoi au professeur…"; envoi.textContent = T.envoye;
      try {
        const ok = await SIP.ecrire("enregistrer", { module: "observe-" + id, titre: "Observe et réponds : " + (o.titre || id), type: "externe", score: T.note, score_max: 20,
          duree_s: Math.round((Date.now() - T.t0) / 1000), details: T.rep });
        T.envoye = ok ? "Note transmise à ton professeur." : "Pas de réseau : ta note sera transmise dès que possible.";
      } catch (e) { T.envoye = "La note n'a pas pu être transmise (" + e.message + ")."; }
      envoi.textContent = T.envoye;
    }

    function demarrer() {
      Object.assign(T, { k: 0, note: 20, fautes: 0, rep: [], fini: false, t0: Date.now(), envoye: "" });
      Q.forEach((q) => (q.ordre = melanger(q.choix.map((_, i) => i))));   // les choix changent d'ordre à chaque série
      preparer(Q[0]); dessiner();
    }
    demarrer();
    const ctl = {
      arreter() { liberer(); zone.classList.remove("obs-actif"); carte.remove(); if (COURANT === ctl) COURANT = null; },
      // pour les tests automatiques
      _t: { n: Q.length, etat: () => ({ k: T.k, note: T.note, fini: T.fini, envoye: T.envoye }),
        repondre(juste) { const q = Q[T.k]; const i = juste ? q.bonne : q.ordre.find((x) => x !== q.bonne); carte.querySelector(`.vq-opt[data-i="${i}"]`).click(); },
        suivante() { const b = carte.querySelector(".obs-actions .btn"); if (b) b.click(); } },
    };
    COURANT = ctl;
    return ctl;
  }

  SIP.OBSERVE = {
    monter,
    nb: (id) => (SIP.OBSERVE_BAC && SIP.OBSERVE_BAC[id] ? SIP.OBSERVE_BAC[id].questions.length : 0),
    courant: () => COURANT,
  };
  SIP.OBSERVE_BAC = SIP.OBSERVE_BAC || {};
})(window.SIP);
