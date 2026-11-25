/* Projet planeur, Seconde SI : l'avancement de l'élève est gardé sur son compte (et plus seulement sur l'appareil).
   Réutilise projet_mon_etat / projet_enregistrer (supabase/projets.sql) : le travail est rangé dans etat.planeur.
   Sans connexion, ou si la base ne répond pas, tout continue à marcher sur l'appareil, et l'envoi est retenté
   tout seul : au retour du réseau, quand la page revient au premier plan, puis toutes les 10 s, 20 s, 40 s… (2 min au plus). */
(function () {
  "use strict";
  const K1 = "sip_2si_planeur", K2 = "sip_2si_planeur_atelier", KT = "sip_2si_planeur_t";
  const lire = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const el = document.getElementById("sync-etat");
  const MSG = { hors: `Tu n'es pas connecté : ton avancement reste sur cet appareil. <a href="../index.html">Me connecter</a> pour le retrouver partout.`,
    ok: (n) => `✓ Avancement enregistré sur ton compte${n ? " (" + n + ")" : ""} : tu le retrouves sur n'importe quel poste.`,
    prof: "Tu es connecté en professeur : ce travail reste sur cet appareil. Pour vérifier l'enregistrement, connecte-toi avec un compte d'élève de Seconde SI.", apercu: "Aperçu professeur : le travail reste dans ce navigateur, rien n'est transmis.",
    attente: "Enregistrement…", erreur: "Pas de connexion avec ton compte pour le moment : ton avancement reste sur cet appareil, et il partira tout seul dès que le réseau revient." };
  let nom = "", pret = false, minuterie = 0, distant = {}, sale = false, enVol = false, encore = false, demarrage = false, arret = false, nEssais = 0, relance = 0;
  const dire = (k) => { if (el) el.innerHTML = typeof MSG[k] === "function" ? MSG[k](nom) : MSG[k] || ""; window.PLANEUR_SYNC_ETAT = k; try { document.dispatchEvent(new CustomEvent("planeur-sync", { detail: k })); } catch (e) { /* rien */ } };          // l'atelier 3D affiche le même état dans son bandeau
  const s = window.SIP && SIP.session && SIP.session.get();
  window.PLANEUR_SYNC = () => { try { localStorage.setItem(KT, String(Date.now())); } catch (e) { /* rien */ } sale = true; if (!pret || arret) return; clearTimeout(minuterie); dire("attente"); minuterie = setTimeout(pousser, 1500); };
  if (!s || s.apercu || !SIP.api || !SIP.api.projetEtat) {
    dire(s && s.apercu ? "apercu" : "hors");
    if (!s && window.SIP && SIP.api && SIP.api.profSession) Promise.resolve().then(() => SIP.api.profSession()).then((p) => { if (p) dire("prof"); }, () => {});          // le professeur, connecté en professeur, n'est pas « non connecté »
    return; }
  if (s.niveau !== "2SI") return;                     // un autre niveau a son propre projet dans la même table : on n'y touche pas
  nom = String(s.nom || "").replace(/[&<>"]/g, "");
  const expiree = (e) => /SESSION_EXPIREE/.test(String((e && e.message) || e));
  const plusTard = (f) => { clearTimeout(relance); nEssais++; relance = setTimeout(() => { relance = 0; f(); }, Math.min(120000, 10000 * 2 ** Math.min(4, nEssais - 1))); };          // 10 s, 20 s, 40 s, 80 s, puis toutes les 2 min
  async function pousser() {
    clearTimeout(minuterie); minuterie = 0; clearTimeout(relance); relance = 0;
    if (enVol) { encore = true; return; }                // un envoi à la fois : le suivant part juste après, avec le travail le plus récent
    enVol = true; sale = false; const a = lire(K2), r = window.PLANEUR_RESUME ? window.PLANEUR_RESUME() : {};
    if (a && a.idees) { const c = a.idees[a.choisi == null ? a.n || 0 : a.choisi]; r.planeur = c && c.nom ? c.nom : ""; r.choisi = a.choisi != null; }
    try { await SIP.api.projetEnregistrer(Object.assign({}, distant, { planeur: { d: lire(K1) || {}, a, t: +localStorage.getItem(KT) || Date.now(), r } })); nEssais = 0; if (!sale) dire("ok"); }
    catch (e) { sale = true; if (expiree(e)) { arret = true; dire("hors"); } else { dire("erreur"); plusTard(pousser); } }
    finally { enVol = false; if (encore) { encore = false; if (!arret) pousser(); } }
  }
  async function demarrer() {
    if (demarrage || pret || arret) return; demarrage = true; clearTimeout(relance); relance = 0;
    try {
      const r = await SIP.api.projetEtat(); distant = (r && r.etat) || {}; const p = distant.planeur, tl = +localStorage.getItem(KT) || 0;
      if (p && p.t > tl) {                              // le compte est plus récent que cet appareil : on reprend le compte
        localStorage.setItem(K1, JSON.stringify(p.d || {})); if (p.a) localStorage.setItem(K2, JSON.stringify(p.a)); else localStorage.removeItem(K2);
        localStorage.setItem(KT, String(p.t)); location.reload(); return;
      }
      pret = true; nEssais = 0;
      if (tl > (p ? p.t : 0) || (!p && (lire(K1) || lire(K2)))) { if (!tl) localStorage.setItem(KT, String(Date.now())); pousser(); } else dire("ok");
    } catch (e) { if (expiree(e)) { arret = true; dire("hors"); } else { dire("erreur"); plusTard(demarrer); } }
    finally { demarrage = false; }
  }
  const reprendre = () => { if (arret || navigator.onLine === false) return; if (!pret) demarrer(); else if (sale) pousser(); };          // le réseau revient, ou la page revient au premier plan
  window.addEventListener("online", reprendre);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) return reprendre(); if (minuterie || (pret && sale && !arret)) pousser(); });          // la page passe derrière (autre appli, écran éteint) : on envoie tout de suite
  demarrer();
})();
