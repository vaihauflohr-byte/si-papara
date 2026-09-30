/* =====================================================================
   SI Papara — connecteur pour tes fichiers HTML d'entraînement existants
   (DS robot sumo, ateliers, simulateurs…), à déposer dans le même site.

   Dans le fichier HTML, avant </body> :
     <script src="../config.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="../assets/backend.js"></script>
     <script src="../assets/connecteur.js"></script>
   (adapte les ../ selon le dossier)

   Puis, à la fin de l'exercice :
     SIP.enregistrerExterne({
       module: "tsi-ds1-adherence",           // identifiant court, stable
       titre: "DS1 — Adhérence et masse",
       score: 7.5, score_max: 10,
       details: [{ q: "Calcul de μ", rep: "0,72", attendu: "0,75", pts: 1 }],
       fiches: ["tsi-ro-adherence"]           // facultatif : fiches proposées à l'élève
     });
   ===================================================================== */
(function (SIP) {
  const racine = ((document.currentScript && document.currentScript.src) || "").replace(/assets\/connecteur\.js.*$/, "") || "/";
  SIP.enregistrerExterne = async function (r) {
    const s = SIP.session.get();
    if (!s) {
      if (confirm("Tu n'es pas connecté(e) au site SI Papara : ton résultat ne sera pas transmis au professeur.\nSe connecter maintenant ?")) window.open(racine + "index.html", "_blank");
      return false;
    }
    const ok = await SIP.ecrire("enregistrer", { module: r.module, titre: r.titre, type: "externe", score: r.score, score_max: r.score_max, duree_s: r.duree_s || null, details: r.details || null });
    if (r.fiches && r.fiches.length) {
      if (confirm(`Résultat ${ok ? "enregistré" : "gardé (hors ligne)"} ✓\nAjouter ${r.fiches.length} mini-fiche(s) à ton programme de mémorisation ?`)) await SIP.ecrire("adopter", r.fiches);
    }
    return ok;
  };
})(window.SIP);
