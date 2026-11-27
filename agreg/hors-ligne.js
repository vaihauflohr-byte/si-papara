/* =====================================================================
   SI Papara — agrégation : travailler sans réseau (labo, Wi-Fi sans Internet)
   - Enregistre le service worker du dossier (agreg/sw.js) : la page et ses scripts sont gardés sur l'appareil.
   - Sans réseau, la page s'ouvre quand même avec la progression de ce navigateur, à trois conditions :
     le professeur s'y est déjà connecté (repère « agreg-acces », 60 jours), sa session est toujours rangée
     dans ce navigateur (il ne s'est pas déconnecté) et une progression y est gardée.
   - Le travail fait hors ligne est marqué (« agreg-a-envoyer ») ; au retour du réseau, il est réuni à la
     progression du compte, sans rien perdre : fusion() garde tout ce qui n'existe que d'un côté, réunit
     les listes datées (essais, épreuves, exposés…) et, pour une même entrée, garde la plus récente.
   Utilisé par agreg/index.html (demarrer, save) ; site.js signale la panne de réseau (AGREG_HOOK.panne).
   ===================================================================== */
(function () {
  'use strict';
  const MARQUE = 'agreg-acces', ENVOI = 'agreg-a-envoyer', SESSION = 'sip_prof_auth', JOURS = 60;
  const lire = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };

  // le service worker du dossier (pas dans les navigateurs pilotés par les tests)
  if ('serviceWorker' in navigator && !navigator.webdriver && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* navigation privée, réglages */ }); });
  }

  const verifie = () => ecrire(MARQUE, String(Date.now()));
  function possible(HOOK, st) {
    const m = +lire(MARQUE) || 0;
    if (!m || Date.now() - m > JOURS * 864e5) return false;
    if (!lire(SESSION)) return false;
    if (!st || !st.t) return false;
    return navigator.onLine === false || !!(HOOK && typeof HOOK.panne === 'function' && HOOK.panne());
  }

  /* ---------- fusion de deux progressions ---------- */
  const objet = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const date = (v) => objet(v) && typeof v.t === 'number';
  function melange(x, y) {           // x l'emporte en cas de conflit
    if (Array.isArray(x) && Array.isArray(y)) {
      if (!(x.length + y.length) || !x.every(date) || !y.every(date)) return x;
      const desc = (x.length > 1 && x[0].t > x[x.length - 1].t) || (x.length < 2 && y.length > 1 && y[0].t > y[y.length - 1].t);
      const M = new Map();
      y.forEach((v) => M.set(v.t, v));
      x.forEach((v) => M.set(v.t, M.has(v.t) ? melange(v, M.get(v.t)) : v));
      return [...M.values()].sort((a, b) => (desc ? b.t - a.t : a.t - b.t));
    }
    if (objet(x) && objet(y)) {
      const o = {};
      new Set([...Object.keys(y), ...Object.keys(x)]).forEach((k) => { o[k] = !(k in x) ? y[k] : !(k in y) ? x[k] : melange(x[k], y[k]); });
      return o;
    }
    return x === undefined ? y : x;
  }
  function fusion(a, b) {
    if (!objet(a)) return b; if (!objet(b)) return a;
    const recent = (a.t || 0) >= (b.t || 0) ? a : b, ancien = recent === a ? b : a;
    const o = melange(recent, ancien);
    // les essais des bancs simulés : meilleure note et dernière note recalculées sur les essais réunis
    if (objet(o.tp)) Object.values(o.tp).forEach((T) => {
      if (!objet(T) || !Array.isArray(T.essais) || !T.essais.length) return;
      const n = T.essais.map((x) => +x.note).filter(isFinite);
      if (n.length) { T.best = Math.max(...n); T.last = +T.essais[T.essais.length - 1].note; }
    });
    o.t = Math.max(a.t || 0, b.t || 0);
    return o;
  }

  /* ---------- le bandeau ---------- */
  const TXT = 'Hors ligne · la progression reste sur cet appareil et repartira sur ton compte au retour du réseau. L’IA et la prépa du mercredi reviennent avec la connexion.';
  function bandeau() {
    if (document.getElementById('hl-bandeau')) return;
    const s = document.createElement('style');
    s.textContent = '#hl-bandeau{position:sticky;top:0;z-index:40;background:#fff6e2;border-bottom:1px solid #e0a83a;color:#5b4210;font-size:14px;line-height:1.4;padding:8px 16px;text-align:center}#hl-bandeau button{font:inherit;font-size:13px;margin-left:8px;padding:3px 12px;border-radius:6px;border:1px solid #5b4210;background:#fff;color:#5b4210;cursor:pointer}@media print{#hl-bandeau{display:none}}';
    document.head.appendChild(s);
    const d = document.createElement('div'); d.id = 'hl-bandeau'; d.setAttribute('role', 'status'); d.textContent = TXT;
    document.body.insertBefore(d, document.body.firstChild);
    window.addEventListener('online', () => { d.innerHTML = 'Le réseau est revenu. <button type="button">Recharger</button> pour envoyer ta progression sur ton compte.'; d.querySelector('button').onclick = () => location.reload(); });
    window.addEventListener('offline', () => { d.textContent = TXT; });
  }

  window.AGREG_HL = { verifie, possible, fusion, bandeau, aEnvoyer: () => lire(ENVOI) === '1', marquer: (v) => ecrire(ENVOI, v ? '1' : null) };
})();
