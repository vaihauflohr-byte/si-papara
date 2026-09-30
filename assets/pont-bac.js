/* =====================================================================
   SI Papara — pont entre l'entraînement bac SI (entrainements/bac-si.html)
   et le suivi du professeur.
   La page d'entraînement appelle window.BACSI_HOOK à la fin de chaque
   série, parcours ou révision du jour ; le résultat part dans la même
   base que les autres entraînements du site (file d'attente hors ligne).
   L'élève doit être connecté sur le site (même navigateur).
   ===================================================================== */
(function (SIP) {
  if (!SIP || !SIP.session) return;
  const RACINE = "../";
  const css = document.createElement("style");
  css.textContent = `
    .sip-bandeau{position:sticky;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:center;
      padding:7px 14px;font:14px/1.4 Calibri,"Segoe UI",system-ui,sans-serif;border-bottom:1px solid rgba(0,0,0,.08)}
    .sip-bandeau.ok{background:#E7F4EC;color:#0D5A2C}
    .sip-bandeau.ko{background:#FDECEA;color:#8A1C1C}
    .sip-bandeau a{color:inherit;font-weight:700}
    .sip-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);max-width:92vw;z-index:70;
      background:#16181B;color:#fff;padding:10px 16px;border-radius:8px;font:14px/1.4 Calibri,"Segoe UI",system-ui,sans-serif;
      box-shadow:0 6px 18px rgba(0,0,0,.25)}
    @media print{.sip-bandeau,.sip-toast{display:none}}`;
  document.head.appendChild(css);

  const b = document.getElementById("sip-bandeau");
  if (b) document.body.insertBefore(b, document.body.firstChild);   // tout en haut de la page

  function bandeau() {
    if (!b) return;
    const s = SIP.session.get(), demo = SIP.api && SIP.api.mode === "demo" ? " · mode démo" : "";
    b.hidden = false;
    if (s) {
      b.className = "sip-bandeau ok";
      b.innerHTML = `<span>Connecté(e) : <b>${SIP.esc(s.nom)}</b> (${SIP.esc((SIP.niveau(s.niveau) || {}).court || s.niveau)})${demo} · tes séries, parcours et révisions sont transmis au professeur.</span>
        <a href="${RACINE}index.html#/tableau">Mon espace</a>`;
    } else {
      b.className = "sip-bandeau ko";
      b.innerHTML = `<span><b>Tu n'es pas connecté(e)</b> : tes résultats restent sur cet appareil et ne comptent pas.</span>
        <a href="${RACINE}index.html#/connexion/TSI">Me connecter</a>`;
    }
  }
  let tmr = null;
  function toast(msg) {
    let t = document.querySelector(".sip-toast");
    if (!t) { t = document.createElement("div"); t.className = "sip-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(tmr); tmr = setTimeout(() => (t.hidden = true), 5000);
  }

  // séries d'une notion : module « bac-<notion> » (ou « bac-<notion>-s2 » quand la notion a plusieurs séries)
  function versSite(ev) {
    if (ev.type === "serie")
      return { module: "bac-" + ev.notion + (ev.nbSeries > 1 ? "-s" + (ev.serie + 1) : ""), titre: "Bac SI · " + ev.titre, type: "externe",
               score: ev.note, score_max: 20, duree_s: ev.duree_s, details: ev.details };
    if (ev.type === "parcours")
      return { module: "bac-parcours", titre: "Bac SI · " + ev.titre, type: "externe",
               score: ev.note, score_max: 20, duree_s: ev.duree_s, details: ev.details };
    if (ev.type === "revision")
      return { module: "bac-revision", titre: "Bac SI · Révision du jour", type: "revision_jour",
               score: ev.ok, score_max: ev.n, duree_s: ev.duree_s, details: null };
    return null;
  }

  window.BACSI_HOOK = async function (ev) {
    const t = versSite(ev); if (!t) return;
    if (!SIP.session.get()) { toast("Tu n'es pas connecté(e) : ce résultat n'est pas transmis au professeur."); return; }
    try {
      const ok = await SIP.ecrire("enregistrer", t);
      toast(ok ? "Résultat transmis au professeur ✓" : "Hors ligne : résultat gardé, il partira au retour du réseau.");
    } catch (e) {
      if (e.message === "SESSION_EXPIREE") {
        SIP.session.clear(); bandeau();
        toast("Ta connexion a expiré : reconnecte-toi, ce résultat n'a pas été transmis.");
      }
    }
  };

  bandeau();
  // résultats restés en attente (hors ligne) : on les envoie dès l'ouverture
  if (SIP.session.get() && SIP.viderFile)
    SIP.viderFile().then((n) => { if (n) toast(`${n} résultat${n > 1 ? "s" : ""} en attente transmis ✓`); }).catch(() => {});
})(window.SIP);
