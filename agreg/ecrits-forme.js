/* =====================================================================
   SI Papara — agrégation : la forme de la copie (#ecrits-forme)
   Ce que les rapports exigent de la rédaction (expression littérale avant l'application numérique, unités,
   homogénéité, résultats mis en évidence, démarche justifiée, chiffres significatifs, regard critique, ordre et
   notations du sujet, langue) : une relecture à cocher avant de rendre, et la relecture d'une page de copie par le
   jury IA (photo, texte tapé ou transcription d'une composition), critère par critère, avec des exemples tirés de la
   page, une note de forme sur 20 et la réécriture d'un passage.
   Progression : st.ec.forme (relectures datées). Globales de agreg/index.html : st, save, app, getSample, HOOK, AIERR.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 1 : d }));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.forme)) st.ec.forme = []; return st.ec; };
  const lire = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  const errIA = (e) => { const c = e && e.code; const m = (typeof HOOK !== 'undefined' && HOOK && HOOK.err && HOOK.err(c)) ?? (typeof AIERR === 'function' ? AIERR(c) : ''); return m || 'L’IA n’a pas répondu. Réessaie dans un moment.'; };
  const TR = 'agreg-ec-transcriptions', COCHE = 'agreg-forme-coche';

  // les critères, tirés des règles communes aux rapports (voir agreg/jury.js)
  const CRIT = [
    { id: 'litteral', nom: 'Expression littérale avant l’application numérique', w: 3, src: 'interne 2025', aide: 'La relation avec les symboles du sujet, puis les valeurs.' },
    { id: 'an', nom: 'Application numérique menée, avec l’unité', w: 3, src: 'interne 2025', aide: '« Calculer » appelle une valeur et son unité.' },
    { id: 'homog', nom: 'Homogénéité vérifiée', w: 2, src: 'externe 2026, 2019', aide: 'Une ligne de dimensions sur les expressions importantes.' },
    { id: 'encadre', nom: 'Résultats mis en évidence', w: 2, src: 'tous les rapports', aide: 'Résultat final encadré ou souligné, avec son unité.' },
    { id: 'justif', nom: 'Démarche justifiée', w: 3, src: 'externe 2025, 2026', aide: 'Loi ou théorème nommé, système isolé, hypothèses.' },
    { id: 'chiffres', nom: 'Chiffres significatifs, ordres de grandeur', w: 2, src: 'externe 2026, 2019', aide: 'Trois chiffres significatifs ; un ordre de grandeur plausible.' },
    { id: 'critique', nom: 'Regard critique sur les résultats', w: 2, src: 'externe 2026, 2019', aide: 'Comparer au cahier des charges ; signaler un résultat aberrant.' },
    { id: 'ordre', nom: 'Numérotation, ordre et notations du sujet', w: 2, src: 'tous les rapports', aide: 'Numéro de chaque question, ordre et notations du sujet.' },
    { id: 'langue', nom: 'Langue et lisibilité', w: 1, src: 'tous les rapports', aide: 'Phrases de conclusion, orthographe, écriture lisible.' }
  ];
  const VAL = { ok: 1, partiel: 0.5, non: 0 };
  const PICTO = { ok: '<span class="fo-v ok" title="respecté">✓</span>', partiel: '<span class="fo-v mi" title="en partie">~</span>', non: '<span class="fo-v ko" title="absent ou fautif">✗</span>', na: '<span class="fo-v na" title="sans objet">—</span>' };
  const verdict = (v) => (v in VAL || v === 'na' ? v : 'na');

  function css() {
    if ($('#fo-css')) return;
    const s = document.createElement('style'); s.id = 'fo-css';
    s.textContent = `.fo-v{display:inline-flex;width:22px;height:22px;border-radius:50%;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-right:2px}.fo-v.ok{background:#eaf7f1;color:#1f7a53}.fo-v.mi{background:#fff6e2;color:#8a5a00}.fo-v.ko{background:#fdf0ee;color:#a8362b}.fo-v.na{background:#eef3f6;color:#587083}
.fo-ck{list-style:none;padding:0;margin:8px 0;display:grid;gap:6px}.fo-ck label{display:flex;gap:10px;align-items:flex-start;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer}.fo-ck input{margin-top:4px;width:18px;height:18px;flex:none}.fo-ck small{display:block;color:#42596b}
.fo-ex{font-size:13px;color:#42596b}.fo-re{white-space:pre-wrap;background:#f1f7f3;border-left:4px solid #2f9e6e;border-radius:8px;padding:10px 14px;font-size:14px}`;
    document.head.appendChild(s);
  }
  // transcriptions des compositions (agreg/ecrits.js), clés « date:partie »
  function transcriptions() {
    const T = lire(TR) || {}, comp = (S().comp || []), A = window.ECRITS_ANNALES || [];
    return Object.keys(T).filter((k) => (T[k] || []).some((x) => String(x).trim())).map((k) => {
      const [t, pid] = k.split(':'), c = comp.find((x) => String(x.t) === t), a = c && A.find((x) => x.id === c.id);
      return { k, t, pid, pages: T[k].filter((x) => String(x).trim()), lab: `${a ? a.th : (c ? c.id : 'Composition')}, partie ${pid}, ${new Date(+t).toLocaleDateString('fr-FR')}` };
    }).sort((a, b) => b.t - a.t);
  }
  function carte() {
    const n = S().forme.length, d = S().forme.slice(-1)[0];
    return `<div class="ec-ep" style="--c:#8a4f7d"><div class="eyebrow">Toutes les épreuves · règles des rapports</div><h3>La forme de la copie</h3><p class="muted">Expression littérale, unité, homogénéité, résultat encadré, démarche, chiffres significatifs, regard critique : la relecture à cocher avant de rendre, et une page de copie relue par le jury IA, critère par critère.${d ? ` Dernière relecture : ${nf(d.note)}/20 de forme.` : ''}${n > 1 ? ` ${n} relectures.` : ''}</p><div class="btns"><a class="b" href="#ecrits-forme">Relire</a></div></div>`;
  }
  function historique() {
    const L = S().forme.slice(-6).reverse();
    if (!L.length) return '';
    const moy = {}; CRIT.forEach((c) => { const v = S().forme.slice(-3).map((x) => x.c && x.c[c.id]).filter((x) => x != null); if (v.length) moy[c.id] = v.reduce((a, b) => a + b, 0) / v.length; });
    const faible = Object.keys(moy).sort((a, b) => moy[a] - moy[b])[0], cf = CRIT.find((c) => c.id === faible);
    return `<h2 class="sec">Mes dernières relectures</h2>${S().forme.length >= 2 && cf && moy[faible] < 0.8 ? `<p class="ec-warn">À travailler en priorité : ${E(cf.nom.toLowerCase())}. ${E(cf.aide)}</p>` : ''}<div class="ec-sc"><table class="ec-tab"><tr><th>Date</th><th>Pages</th>${CRIT.map((c) => `<th title="${E(c.nom)}">${E(c.id)}</th>`).join('')}<th>Forme</th></tr>${L.map((x) => `<tr><td>${new Date(x.t).toLocaleDateString('fr-FR')}</td><td class="n">${x.n || 1}</td>${CRIT.map((c) => { const v = x.c ? x.c[c.id] : null; return `<td>${v == null ? PICTO.na : v >= 0.9 ? PICTO.ok : v >= 0.4 ? PICTO.partiel : PICTO.non}</td>`; }).join('')}<td class="n">${nf(x.note)} / 20</td></tr>`).join('')}</table></div>`;
  }
  function accueil(pre) {
    css();
    const coche = lire(COCHE) || {}, TRS = transcriptions();
    app().innerHTML = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · la rédaction</div><h1>La forme de la copie</h1>
      <p class="muted">Les rapports le répètent : l’expression littérale d’abord, puis l’application numérique et le résultat encadré avec son unité ; un résultat sans démarche ne rapporte pas ou peu ; l’esprit critique devant un résultat aberrant est valorisé. Ces points se gagnent sans rien savoir de plus.</p>
      <details class="keep" ${pre ? '' : 'open'}><summary>Avant de rendre : la relecture en dix minutes</summary><ul class="fo-ck">${CRIT.map((c) => `<li><label><input type="checkbox" data-ck="${c.id}" ${coche[c.id] ? 'checked' : ''}><span><b>${E(c.nom)}</b><small>${E(c.aide)} (${E(c.src)})</small></span></label></li>`).join('')}</ul><div class="btns"><button class="b sec" id="fo-raz">Tout décocher</button></div></details>
      <h2 class="sec">Faire relire une page par le jury IA</h2>
      <div class="card"><p class="muted">Une photo par page (à plat, lumière du jour), jusqu’à quatre pages ; ou le texte tapé ; ou la transcription d’une partie déjà composée.</p>
      <div class="btns" style="align-items:center"><label class="b sec filebtn">Joindre des photos<input type="file" accept="image/*" multiple hidden id="fo-ph"></label><span class="muted" id="fo-phl"></span></div>
      ${TRS.length ? `<p><label>Ou une transcription : <select id="fo-tr"><option value="">—</option>${TRS.map((x) => `<option value="${E(x.k)}" ${pre === x.k ? 'selected' : ''}>${E(x.lab)} (${x.pages.length} page${x.pages.length > 1 ? 's' : ''})</option>`).join('')}</select></label></p>` : ''}
      <textarea id="fo-txt" rows="8" placeholder="Ou colle ici le texte d’une page de copie."></textarea>
      <div class="btns" style="margin-top:10px"><button class="b" id="fo-go">Faire relire la forme</button></div><div id="fo-res"></div></div>
      ${historique()}`;
    let photos = [];
    app().onchange = (e) => {
      const k = e.target.dataset && e.target.dataset.ck;
      if (k) { const o = lire(COCHE) || {}; o[k] = e.target.checked ? 1 : 0; ecrire(COCHE, o); return; }
      if (e.target.id === 'fo-ph') { photos = [...e.target.files].slice(0, 4); $('#fo-phl').textContent = photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} jointe${photos.length > 1 ? 's' : ''}${e.target.files.length > 4 ? ' (les quatre premières)' : ''}` : ''; }
    };
    $('#fo-raz').onclick = () => { ecrire(COCHE, {}); app().querySelectorAll('[data-ck]').forEach((x) => { x.checked = false; }); };
    $('#fo-go').onclick = () => {
      const tr = $('#fo-tr') && $('#fo-tr').value, txt = $('#fo-txt').value.trim();
      let pages;
      if (photos.length) pages = photos.map((f) => ({ f }));
      else if (tr) pages = (TRS.find((x) => x.k === tr) || { pages: [] }).pages.slice(0, 4).map((t) => ({ t }));
      else if (txt) pages = [{ t: txt }];
      if (!pages || !pages.length) { $('#fo-res').innerHTML = '<p class="ec-warn">Joins une photo, choisis une transcription ou colle un texte.</p>'; return; }
      relire(pages);
    };
    if (pre && TRS.some((x) => x.k === pre)) $('#fo-go').scrollIntoView({ block: 'center' });
  }
  function prompt(page) {
    return `Tu es correcteur à l'agrégation SII, option ingénierie électrique. Tu relis la FORME d'une page de copie d'écrit${page.f ? ' (photo jointe)' : ''} : pas la justesse scientifique en détail, mais ce que les rapports du jury exigent de la rédaction.
${page.f ? 'Lis d’abord la page entière ; si elle est illisible, dis-le avec "lisible": false.' : `Texte de la page :\n${String(page.t).slice(0, 9000)}`}
Pour chaque critère, donne un verdict : "ok" (respecté partout), "partiel" (respecté par endroits), "non" (absent ou fautif), "na" (sans objet sur cette page), et un exemple précis tiré de la page (numéro de question et court extrait) :
${CRIT.map((c) => `- ${c.id} : ${c.nom} (${c.aide})`).join('\n')}
Sois exigeant comme le jury et concret : pas de remarque générale sans exemple de la page.
Réponds en français, uniquement en JSON valide, sans retour à la ligne dans les chaînes et sans guillemets doubles dans les textes (cite entre « ») : {"lisible": true, "questions": ["Q12"], "criteres": [{"id": "litteral", "verdict": "ok", "exemple": ""}], "points_forts": [""], "a_corriger": [{"ou": "", "quoi": "", "comment": ""}], "reecriture": ["", ""]}
où "reecriture" réécrit, ligne par ligne, un passage fautif de la page tel qu'il devrait apparaître sur la copie : expression littérale, application numérique, unité, résultat mis en évidence entre crochets.`;
  }
  async function relire(pages) {
    const out = $('#fo-res'), b = $('#fo-go');
    b.disabled = true;
    const s = await getSample();
    if (!s) { out.innerHTML = `<p class="ec-warn">${HOOK ? 'La relecture par l’IA n’est pas disponible pour l’instant.' : 'La relecture par l’IA fonctionne quand cette page est ouverte dans Claude.'} La liste à cocher ci-dessus reste utilisable.</p>`; b.disabled = false; return; }
    const R = [];
    for (let i = 0; i < pages.length; i++) {
      out.innerHTML = `<div class="think">Le jury relit la page ${i + 1} sur ${pages.length}…</div>`;
      try {
        const r = await s.json(prompt(pages[i]), pages[i].f ? { cache: false, modelTier: 'complex', images: [pages[i].f] } : { cache: false, modelTier: 'complex' });
        R.push(r && typeof r === 'object' ? r : {});
      } catch (e) { out.innerHTML = `<p class="ec-warn">${E(errIA(e))}</p>`; b.disabled = false; return; }
    }
    b.disabled = false;
    afficher(R);
  }
  function afficher(R) {
    const lisibles = R.filter((r) => r.lisible !== false);
    const par = {}; CRIT.forEach((c) => { par[c.id] = R.map((r) => { const x = (Array.isArray(r.criteres) ? r.criteres : []).find((y) => y && y.id === c.id) || {}; return { v: verdict(x.verdict), ex: x.exemple || '' }; }); });
    const sc = {}; let num = 0, den = 0;
    CRIT.forEach((c) => { const v = par[c.id].filter((x) => x.v !== 'na').map((x) => VAL[x.v]); if (v.length) { sc[c.id] = v.reduce((a, b) => a + b, 0) / v.length; num += c.w * sc[c.id]; den += c.w; } });
    const note = den ? 20 * num / den : null;
    let h = '';
    if (!lisibles.length) { $('#fo-res').innerHTML = '<p class="ec-warn">Le jury IA n’a pas pu lire les pages : reprends la photo à plat, en pleine lumière, la page entière dans le cadre.</p>'; return; }
    if (lisibles.length < R.length) h += `<p class="ec-warn">${R.length - lisibles.length} page${R.length - lisibles.length > 1 ? 's' : ''} illisible${R.length - lisibles.length > 1 ? 's' : ''} : non comptée${R.length - lisibles.length > 1 ? 's' : ''}.</p>`;
    h += `<div class="ainote"><strong>${note == null ? '—' : nf(note)} / 20</strong><span>note de forme, d’après le jury IA (${R.length} page${R.length > 1 ? 's' : ''})</span></div>`;
    h += `<div class="ec-sc"><table class="ec-tab"><tr><th>Critère</th><th>Pages</th><th>Exemple relevé</th><th>Points</th></tr>${CRIT.map((c) => { const ex = (par[c.id].find((x) => x.ex && x.v !== 'ok') || par[c.id].find((x) => x.ex) || {}).ex || ''; return `<tr><td><b>${E(c.nom)}</b><br><small class="muted">${E(c.src)}</small></td><td>${par[c.id].map((x) => PICTO[x.v]).join('')}</td><td class="fo-ex">${E(ex)}</td><td class="n">${sc[c.id] == null ? '—' : `${nf(c.w * sc[c.id])} / ${c.w}`}</td></tr>`; }).join('')}</table></div>`;
    const cor = R.flatMap((r) => (Array.isArray(r.a_corriger) ? r.a_corriger : [])).filter((x) => x && (x.quoi || x.comment)).slice(0, 6);
    if (cor.length) h += `<h3>À corriger d’abord</h3><ul>${cor.map((x) => `<li>${x.ou ? `<b>${E(x.ou)}</b> : ` : ''}${E(x.quoi || '')}${x.comment ? ` → ${E(x.comment)}` : ''}</li>`).join('')}</ul>`;
    const pf = R.flatMap((r) => (Array.isArray(r.points_forts) ? r.points_forts : [])).filter(Boolean).slice(0, 4);
    if (pf.length) h += `<h3>Points forts</h3><ul>${pf.map((x) => `<li>${E(x)}</li>`).join('')}</ul>`;
    R.forEach((r, i) => { const re = Array.isArray(r.reecriture) ? r.reecriture.filter(Boolean).join('\n') : r.reecriture; if (re) h += `<h3>Réécriture d’un passage${R.length > 1 ? ` (page ${i + 1})` : ''}</h3><div class="fo-re">${E(re)}</div>`; });
    h += '<p class="muted"><small>Relecture produite par une IA à partir des règles des rapports : à confronter à la liste à cocher.</small></p>';
    $('#fo-res').innerHTML = h;
    if (note != null) {
      S().forme.push({ t: Date.now(), note: Math.round(note * 10) / 10, n: lisibles.length, c: Object.fromEntries(Object.entries(sc).map(([k, v]) => [k, Math.round(v * 100) / 100])) });
      if (S().forme.length > 100) S().forme.splice(0, S().forme.length - 100);
      save();
    }
  }
  function route(h) {
    const m = h.match(/^ecrits-forme-(\d{12,}-[A-Za-z0-9]+)$/);
    return accueil(m ? m[1].replace('-', ':') : null);
  }
  window.ECRITS_FORME = { route, carte, CRIT };
})();
