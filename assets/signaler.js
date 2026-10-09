/* =====================================================================
   SI Papara — « Signaler une erreur »
   Sous chaque question (séries du bac, Observe et réponds, Vérifie que tu as compris),
   l'élève peut signaler une question qu'il croit fausse. Le signalement part chez le
   professeur (prof.html, onglet « Signalements ») avec la question telle que l'élève
   l'a vue, valeurs tirées au hasard comprises. Sans réseau : file d'attente, comme les
   résultats (assets/backend.js).

   SIP.signaler.bouton(texte?)            → un <button> discret à placer sous la question
   SIP.signaler.ouvrir(donnees, options)  → la fenêtre de signalement
     donnees = { source, notion, module, ref, question, figure, reponse, attendu, correction }
       source : "serie" | "parcours" | "blanc" | "observe" | "verif"
       ref    : de quoi retrouver la question (générateur « clé:niveau:n° », ou « observe:k », « verif:k »)
     options = { lienConnexion, surEnvoi() }
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const MOTIFS = [
    ["juste", "Ma réponse est juste, mais elle a été comptée fausse"],
    ["correction", "La réponse attendue ou la correction est fausse"],
    ["enonce", "L'énoncé n'est pas clair, ou il manque une donnée"],
    ["figure", "La figure ne correspond pas à l'énoncé"],
    ["autre", "Autre chose"],
  ];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let css = false;
  function styles() {
    if (css) return; css = true;
    const st = document.createElement("style");
    st.textContent = `
.sig-lien{appearance:none;background:none;border:0;padding:6px 0 2px;margin:4px 0 0;font:inherit;font-size:.82rem;line-height:1.3;
  color:var(--ink-3,#77838f);cursor:pointer;text-decoration:underline;text-underline-offset:2px;display:inline-flex;gap:5px;align-items:center}
.sig-lien:hover{color:var(--bad,#b42318)}
.sig-lien:disabled{text-decoration:none;cursor:default;color:var(--good,#146c43)}
.sig-fond{position:fixed;inset:0;z-index:1000;background:rgba(10,15,20,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.sig-boite{background:var(--paper,#fff);color:var(--ink,#15202b);border-radius:10px;max-width:520px;width:100%;max-height:92vh;overflow:auto;
  padding:18px 20px 16px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:var(--f-body,system-ui,sans-serif);font-size:15px;line-height:1.45;text-align:left}
.sig-boite h2{margin:0 0 6px;font-family:var(--f-disp,inherit);font-size:1.4rem;line-height:1.15;letter-spacing:.01em}
.sig-aide{margin:0 0 12px;color:var(--ink-2,#44525f);font-size:.9rem}
.sig-boite fieldset{border:0;margin:0 0 10px;padding:0;min-width:0}
.sig-boite legend{font-weight:600;margin-bottom:2px;padding:0}
.sig-m{display:flex;gap:9px;align-items:flex-start;padding:8px 10px;border:1px solid var(--rule,#d5dce3);border-radius:6px;margin:6px 0;cursor:pointer}
.sig-m:has(input:checked){border-color:var(--accent,#1d3f7a);background:var(--accent-soft,#e2e9f5)}
.sig-m input{margin:3px 0 0;accent-color:var(--accent,#1d3f7a);flex:none}
.sig-boite label.sig-c{display:block;font-weight:600;margin:4px 0 4px}
.sig-boite textarea{width:100%;box-sizing:border-box;font:inherit;font-size:.95rem;padding:8px 10px;border:1px solid var(--rule,#d5dce3);border-radius:6px;
  background:var(--paper,#fff);color:inherit;resize:vertical;min-height:4.2em}
.sig-act{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.sig-act button{font:inherit;font-weight:600;padding:9px 18px;border-radius:6px;cursor:pointer;border:1px solid var(--rule,#d5dce3);background:var(--paper,#fff);color:inherit}
.sig-act .sig-ok{background:var(--accent,#1d3f7a);border-color:var(--accent,#1d3f7a);color:var(--accent-ink,#fff)}
.sig-act .sig-ok:disabled{opacity:.45;cursor:default}
.sig-etat{min-height:1.2em;margin:10px 0 0;font-size:.88rem;color:var(--bad,#b42318)}
.sig-merci{font-size:1rem}
@media (max-width:560px){.sig-fond{align-items:flex-end;padding:0}.sig-boite{border-radius:14px 14px 0 0;max-height:90vh;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}}
@media print{.sig-lien,.sig-fond{display:none!important}}`;
    document.head.appendChild(st);
  }

  let ouvert = null, retourFocus = null;
  function clavier(e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fermer(); } }
  function fermer() {
    if (!ouvert) return;
    ouvert.remove(); ouvert = null;
    document.removeEventListener("keydown", clavier, true);
    if (retourFocus && retourFocus.isConnected && retourFocus.focus) retourFocus.focus({ preventScroll: true });
  }

  function ouvrir(d, o = {}) {
    styles(); fermer();
    retourFocus = document.activeElement;
    const connecte = !!(SIP.session && SIP.session.get && SIP.session.get());
    const fond = document.createElement("div");
    fond.className = "sig-fond";
    const boite = document.createElement("div");
    boite.className = "sig-boite";
    boite.setAttribute("role", "dialog"); boite.setAttribute("aria-modal", "true"); boite.setAttribute("aria-labelledby", "sig-titre");
    fond.appendChild(boite);
    fond.addEventListener("click", (e) => { if (e.target === fond) fermer(); });
    document.addEventListener("keydown", clavier, true);
    document.body.appendChild(fond);
    ouvert = fond;

    if (!connecte) {
      boite.innerHTML = `<h2 id="sig-titre">Signaler une erreur</h2>
        <p>Connecte-toi d'abord : sans connexion, ton professeur ne peut pas recevoir ton signalement.</p>
        <div class="sig-act">${o.lienConnexion ? `<a class="sig-ok" href="${esc(o.lienConnexion)}" style="text-decoration:none;padding:9px 18px;border-radius:6px;font-weight:600">Me connecter</a>` : ""}<button type="button" class="sig-annuler">Fermer</button></div>`;
      boite.querySelector(".sig-annuler").onclick = fermer;
      (boite.querySelector("a,button")).focus();
      return;
    }

    const motifs = MOTIFS.filter(([k]) => k !== "juste" || (d.reponse != null && String(d.reponse).trim() !== ""));
    const figure = d.figure && /<svg[\s>]/i.test(d.figure);
    boite.innerHTML = `<h2 id="sig-titre">Signaler une erreur</h2>
      <p class="sig-aide">Ton professeur verra la question telle que tu l'as eue, avec ses valeurs. S'il y a bien une erreur, elle sera corrigée.</p>
      <fieldset><legend>Qu'est-ce qui ne va pas ?</legend>
        ${motifs.filter(([k]) => k !== "figure" || figure).map(([k, t]) => `<label class="sig-m"><input type="radio" name="sig-motif" value="${k}"><span>${esc(t)}</span></label>`).join("")}
      </fieldset>
      <label class="sig-c" for="sig-com">Explique en une phrase <span style="font-weight:400;color:var(--ink-3,#77838f)">(facultatif)</span></label>
      <textarea id="sig-com" maxlength="600" rows="3" placeholder="Par exemple : je trouve 12,5 N avec la formule de la fiche."></textarea>
      <div class="sig-act"><button type="button" class="sig-ok" disabled>Envoyer au professeur</button><button type="button" class="sig-annuler">Annuler</button></div>
      <p class="sig-etat" role="status" aria-live="polite"></p>`;
    const ok = boite.querySelector(".sig-ok"), etat = boite.querySelector(".sig-etat");
    boite.querySelectorAll('input[name="sig-motif"]').forEach((r) => (r.onchange = () => { ok.disabled = false; etat.textContent = ""; }));
    boite.querySelector(".sig-annuler").onclick = fermer;
    boite.querySelector("input").focus({ preventScroll: true });
    ok.onclick = async () => {
      const m = boite.querySelector('input[name="sig-motif"]:checked');
      if (!m) { etat.textContent = "Choisis d'abord ce qui ne va pas."; return; }
      ok.disabled = true; etat.style.color = "var(--ink-2,#44525f)"; etat.textContent = "Envoi…";
      const paquet = Object.assign({}, d, { motif: m.value, commentaire: boite.querySelector("#sig-com").value.trim() });
      try {
        const parti = await SIP.ecrire("signaler", paquet);
        boite.innerHTML = `<h2 id="sig-titre">Merci !</h2>
          <p class="sig-merci">${parti ? "Ton signalement est parti chez ton professeur." : "Pas de réseau : ton signalement partira dès que la connexion revient."}
          Il va vérifier la question ; s'il y a une erreur, elle sera corrigée.</p>
          <div class="sig-act"><button type="button" class="sig-ok">Fermer</button></div>`;
        const f = boite.querySelector(".sig-ok"); f.onclick = fermer; f.focus();
        if (o.surEnvoi) { try { o.surEnvoi(parti); } catch (e) { /* rien */ } }
      } catch (e) {
        etat.style.color = "";
        etat.textContent = e.message === "SESSION_EXPIREE" ? "Ta connexion a expiré : reconnecte-toi, puis signale à nouveau."
          : /TROP_DE_SIGNALEMENTS/.test(e.message) ? "Tu as déjà envoyé beaucoup de signalements aujourd'hui : réessaie demain."
          : "Le signalement n'a pas pu partir (" + e.message + ").";
        ok.disabled = false;
      }
    };
  }

  function bouton(texte) {
    styles();
    const b = document.createElement("button");
    b.type = "button"; b.className = "sig-lien";
    b.innerHTML = `<span aria-hidden="true">⚑</span><span>${esc(texte || "Signaler une erreur")}</span>`;
    return b;
  }
  // le bouton devient « Signalé ✓ » une fois le signalement parti (ou mis en attente)
  function marquer(b) { if (!b) return; b.disabled = true; b.innerHTML = `<span aria-hidden="true">✓</span><span>Signalé</span>`; }

  SIP.signaler = { ouvrir, bouton, marquer, fermer, styles, MOTIFS };
})(window.SIP);
