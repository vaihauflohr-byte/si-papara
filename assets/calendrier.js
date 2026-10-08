/* Applique les corrections de contenu/calendrier.js au planning embarqué (PLAN de la page d'entraînement)
   et aux échéances des notions (SIP.BAC, toutes les pages). Rien à modifier ici : les dates se corrigent dans
   contenu/calendrier.js. */
window.SIP = window.SIP || {};
SIP.calendrier = (function () {
  const C = window.SIP_CALENDRIER || {};
  const D0 = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const jours = (a, b) => Math.round((D0(b) - D0(a)) / 864e5);
  const dsKey = (s) => String(s || "").toUpperCase().replace(/\s+/g, "");       // "ds02", "DS 02" → "DS02"
  const dsForce = {}; Object.entries(C.ds || {}).forEach(([k, v]) => { if (/^\d{4}-\d\d-\d\d$/.test(v)) dsForce[dsKey(k)] = v; });
  const recal = Object.entries(C.recalage || {}).map(([s, d]) => [Number(s), d]).filter(([s, d]) => s > 0 && /^\d{4}-\d\d-\d\d$/.test(d));

  /* semaines : [{s, lundi}] ; vacances : [[début, fin, nom]] → {s: {lundi, delta}} après recalage */
  function decalages(semaines, vacances) {
    const enVac = (d) => (vacances || []).some(([a, b]) => D0(a) <= d && d <= D0(b));
    const out = {}; let prev = null;
    [...semaines].sort((a, b) => a.s - b.s).forEach((w) => {
      const anc = recal.find(([s]) => s === w.s);
      let lundi = w.lundi;
      if (anc) lundi = anc[1];
      else if (prev && prev.decale) { let d = addD(D0(prev.lundi), 7); while (enVac(d)) d = addD(d, 7); lundi = iso(d); }
      out[w.s] = { lundi, delta: jours(w.lundi, lundi), decale: !!(anc || (prev && prev.decale)) };
      prev = out[w.s];
    });
    return out;
  }
  const actif = () => recal.length > 0 || Object.keys(dsForce).length > 0;

  /* le planning de la page d'entraînement : semaines (lundi, ds_date), vacances */
  function appliquerPlan(plan) {
    if (!plan || !plan.semaines || !actif()) return plan;
    const dec = decalages(plan.semaines, plan.vacances);
    plan.semaines.forEach((w) => {
      const d = dec[w.s]; if (!d) return;
      if (w.ds_date && d.delta) w.ds_date = iso(addD(D0(w.ds_date), d.delta));
      w.lundi = d.lundi;
      if (w.ds && dsForce[dsKey(w.ds)]) w.ds_date = dsForce[dsKey(w.ds)];
    });
    plan.recale = true;
    return plan;
  }

  /* les notions du site : ds_date, échéance (6 h du matin le jour du DS, heure de Tahiti), date du cours */
  function appliquerBac(bac) {
    if (!bac || !bac.notions || !bac.semaines || !actif()) return bac;
    const dec = decalages(bac.semaines, bac.vacances);
    const dsDate = {};
    bac.semaines.forEach((w) => {
      const d = dec[w.s] || { delta: 0, lundi: w.lundi };
      if (w.ds) dsDate[dsKey(w.ds)] = dsForce[dsKey(w.ds)] || (w.ds_date && d.delta ? iso(addD(D0(w.ds_date), d.delta)) : w.ds_date);
      w.lundi_initial = w.lundi; w.lundi = d.lundi; w.delta = d.delta;
    });
    bac.notions.forEach((n) => {
      if (n.ds && dsDate[dsKey(n.ds)]) { n.ds_date = dsDate[dsKey(n.ds)]; n.echeance = n.ds_date + "T06:00:00-10:00"; }
      if (n.cours) {                                   // le cours suit sa semaine
        const w = bac.semaines.find((x) => x.lundi_initial <= n.cours && n.cours <= iso(addD(D0(x.lundi_initial), 6)));
        if (w && w.delta) n.cours = iso(addD(D0(n.cours), w.delta));
      }
    });
    bac.recale = true;
    return bac;
  }
  return { appliquerPlan, appliquerBac, decalages, actif };
})();
