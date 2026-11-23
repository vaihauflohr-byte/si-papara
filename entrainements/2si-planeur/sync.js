/* Projet planeur, Seconde SI : l'avancement de l'élève est gardé sur son compte (et plus seulement sur l'appareil).
   Réutilise projet_mon_etat / projet_enregistrer (supabase/projets.sql) : le travail est rangé dans etat.planeur.
   Sans connexion, ou si la base ne répond pas, tout continue à marcher sur l'appareil. */
(function () {
  "use strict";
  const K1 = "sip_2si_planeur", K2 = "sip_2si_planeur_atelier", KT = "sip_2si_planeur_t";
  const lire = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const el = document.getElementById("sync-etat");
  const MSG = { hors: `Tu n'es pas connecté : ton avancement reste sur cet appareil. <a href="../index.html">Me connecter</a> pour le retrouver partout.`,
    ok: (n) => `✓ Avancement enregistré sur ton compte${n ? " (" + n + ")" : ""} : tu le retrouves sur n'importe quel poste.`,
    attente: "Enregistrement…", erreur: "Enregistrement impossible pour le moment : ton avancement reste sur cet appareil." };
  let nom = "", pret = false, minuterie = 0, distant = {};
  const dire = (k) => { if (el) el.innerHTML = typeof MSG[k] === "function" ? MSG[k](nom) : MSG[k] || ""; };
  const s = window.SIP && SIP.session && SIP.session.get();
  window.PLANEUR_SYNC = () => { try { localStorage.setItem(KT, String(Date.now())); } catch (e) { /* rien */ } if (!pret) return; clearTimeout(minuterie); dire("attente"); minuterie = setTimeout(pousser, 1500); };
  if (!s || s.apercu || !SIP.api || !SIP.api.projetEtat) { dire("hors"); return; }
  if (s.niveau !== "2SI") return;                     // un autre niveau a son propre projet dans la même table : on n'y touche pas
  nom = String(s.nom || "").replace(/[&<>"]/g, "");
  async function pousser() {
    minuterie = 0; const a = lire(K2), r = window.PLANEUR_RESUME ? window.PLANEUR_RESUME() : {};
    if (a && a.idees) { const c = a.idees[a.choisi == null ? a.n || 0 : a.choisi]; r.planeur = c && c.nom ? c.nom : ""; r.choisi = a.choisi != null; }
    try { await SIP.api.projetEnregistrer(Object.assign({}, distant, { planeur: { d: lire(K1) || {}, a, t: +localStorage.getItem(KT) || Date.now(), r } })); dire("ok"); }
    catch (e) { dire(/SESSION_EXPIREE/.test(e.message) ? "hors" : "erreur"); }
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && minuterie) { clearTimeout(minuterie); pousser(); } });
  (async () => {
    try {
      const r = await SIP.api.projetEtat(); distant = (r && r.etat) || {}; const p = distant.planeur, tl = +localStorage.getItem(KT) || 0;
      if (p && p.t > tl) {                              // le compte est plus récent que cet appareil : on reprend le compte
        localStorage.setItem(K1, JSON.stringify(p.d || {})); if (p.a) localStorage.setItem(K2, JSON.stringify(p.a)); else localStorage.removeItem(K2);
        localStorage.setItem(KT, String(p.t)); location.reload(); return;
      }
      pret = true;
      if (tl > (p ? p.t : 0) || (!p && (lire(K1) || lire(K2)))) { if (!tl) localStorage.setItem(KT, String(Date.now())); pousser(); } else dire("ok");
    } catch (e) { dire(/SESSION_EXPIREE/.test(e.message) ? "hors" : "erreur"); }
  })();
})();
