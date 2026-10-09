/* =====================================================================
   SI Papara — l'appli : le site s'installe sur l'écran d'accueil du téléphone
   (icône au logo du lycée, ouverture en plein écran) et s'ouvre même sans réseau.
   - enregistre le service worker (sw.js, à la racine du site) ;
   - garde l'invitation d'installation d'Android (Chrome) ;
   - SIP.appli.bandeau(el) : sur le tableau de bord, propose l'installation
     (bouton « Installer » sur Android, marche à suivre sur iPhone), une seule fois
     tous les 14 jours si l'élève répond « Plus tard ».
   Rien à régler : tout se fait au chargement des pages.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const script = document.currentScript && document.currentScript.src;
  const racine = new URL("../", script || location.href);          // assets/appli.js → racine du site
  const sur = location.protocol === "https:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if ("serviceWorker" in navigator && sur) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("sw.js", racine).href, { scope: racine.pathname }).catch((e) => console.warn("Appli : service worker non enregistré", e));
    });
  }

  let invite = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); invite = e; document.dispatchEvent(new Event("sip-appli")); });
  window.addEventListener("appinstalled", () => { invite = null; memo("installee"); document.dispatchEvent(new Event("sip-appli")); });

  const ua = navigator.userAgent || "";
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const autonome = () => (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;

  const CLE = "sip_appli";
  const lire = () => { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } };
  function memo(k) { try { const o = lire(); o[k] = Date.now(); localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) { /* stockage indisponible */ } }
  const enPause = () => { const o = lire(); return !!o.installee || (o.plusTard && Date.now() - o.plusTard < 14 * 864e5); };

  const PARTAGER = `<svg class="appli-partager" viewBox="0 0 20 24" width="15" height="18" aria-hidden="true" focusable="false"><path d="M10 1v14M5.5 5.5 10 1l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 9.5H3v13h14v-13h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

  function bandeau(el) {
    if (!el) return;
    const dessiner = () => {
      if (!el.isConnected) { document.removeEventListener("sip-appli", dessiner); return; }
      if (autonome() || enPause() || !(ios || android || invite)) { el.innerHTML = ""; return; }
      const icone = new URL("assets/icones/icone-192.png", racine).href;
      if (invite) {
        el.innerHTML = `<div class="appli-b" role="region" aria-label="Installer l'appli">
          <img class="appli-ic" src="${icone}" alt="" width="44" height="44">
          <div class="appli-t"><b>Installe l'appli SI Papara</b><span>Une icône sur ton écran d'accueil ; tes fiches s'ouvrent même sans réseau.</span></div>
          <div class="appli-a"><button class="btn" type="button" data-a="installer">Installer</button><button class="btn-lien" type="button" data-a="tard">Plus tard</button></div></div>`;
      } else if (ios) {
        el.innerHTML = `<div class="appli-b" role="region" aria-label="Installer l'appli">
          <img class="appli-ic" src="${icone}" alt="" width="44" height="44">
          <div class="appli-t"><b>Installe SI Papara sur ton iPhone</b><span>Touche ${PARTAGER} <b>Partager</b>, puis <b>« Sur l'écran d'accueil »</b>. Dans l'appli, tu te reconnectes une seule fois.</span></div>
          <div class="appli-a"><button class="btn-lien" type="button" data-a="tard">Plus tard</button></div></div>`;
      } else {   // Android sans invitation (autre navigateur que Chrome)
        el.innerHTML = `<div class="appli-b" role="region" aria-label="Installer l'appli">
          <img class="appli-ic" src="${icone}" alt="" width="44" height="44">
          <div class="appli-t"><b>Installe SI Papara sur ton téléphone</b><span>Menu <b>⋮</b> du navigateur, puis <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b>.</span></div>
          <div class="appli-a"><button class="btn-lien" type="button" data-a="tard">Plus tard</button></div></div>`;
      }
      const ins = el.querySelector('[data-a="installer"]');
      if (ins) ins.onclick = async () => {
        const i = invite; if (!i) return;
        invite = null;
        try { await i.prompt(); const r = await i.userChoice; if (r && r.outcome === "accepted") memo("installee"); else memo("plusTard"); } catch (e) { /* refus */ }
        dessiner();
      };
      el.querySelector('[data-a="tard"]').onclick = () => { memo("plusTard"); dessiner(); };
    };
    document.addEventListener("sip-appli", dessiner);
    dessiner();
  }

  SIP.appli = { autonome, ios, android, installable: () => !!invite, bandeau };
})(window.SIP);
