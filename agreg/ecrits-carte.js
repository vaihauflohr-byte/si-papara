/* =====================================================================
   SI Papara — agrégation : la carte des annales 2010-2026 (#ecrits-carte)
   Pour chaque épreuve, une grille sujets × notions (absente, présente, importante, dominante), la fréquence de chaque
   notion, ce qui revient chaque année, et, d’un clic sur une case, le sujet et la notion à travailler.
   Données : agreg/ecrits-carte-data.js (ECRITS_CARTE_DATA, des chiffres seulement) et ECRITS_ANNALES (titres, liens).
   Globales de agreg/index.html : app, NOTIONS.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const NOM = { asserv: 'Asservissement', puiss: 'Puissances et triphasé', fourier: 'Fourier, valeurs moyenne et efficace', elec: 'Électronique', bus: 'Bus, trames et réseaux', machines: 'Machines électriques', conv: 'Convertisseurs', python: 'Algorithmes et programmation', signal: 'Signal, filtres et conversion', meca: 'Mécanique', thermo: 'Thermique et fluides', magn: 'Électromagnétisme', ped: 'Partie pédagogique' };
  const COURT = { asserv: 'Asserv.', puiss: 'Puissances', fourier: 'Fourier', elec: 'Électronique', bus: 'Bus', machines: 'Machines', conv: 'Convertis.', python: 'Algo.', signal: 'Signal', meca: 'Méca.', thermo: 'Thermo.', magn: 'Magnét.', ped: 'Pédago.' };
  const NIV = ['absente', 'présente', 'importante', 'dominante'];
  const VUES = { interne: { nom: 'Interne', t: ['i1', 'i2'] }, externe: { nom: 'Externe', t: ['e1', 'e2', 'e3'] }, ancien: { nom: 'Avant 2013', t: ['ai', 'ae'] } };
  const CLE = 'agreg-carte-vue';
  const lire = () => { try { return localStorage.getItem(CLE); } catch (e) { return null; } };
  const ecrire = (v) => { try { localStorage.setItem(CLE, v); } catch (e) { /* stockage indisponible : la vue n’est pas retenue */ } };
  const D = () => window.ECRITS_CARTE_DATA || { N: [], s: {}, controle: {} };
  const EP = () => (window.ECRITS && ECRITS.EPR) || {};
  const sujets = (t) => (window.ECRITS_ANNALES || []).filter((x) => x.t === t && x.id in D().s).sort((a, b) => b.y - a.y);
  const niveaux = (id) => { const s = D().s[id]; return s == null ? null : [...s].map(Number); };
  const ki = (k) => D().N.indexOf(k);
  const court = (n) => String(n || '').replace(/ option [AB]$/, '').replace('Automatique informatique', 'Automatique');

  function lien(k) {
    if (k === 'ped') return { h: '#ecrits-peda', t: 'La partie pédagogique' };
    const N = typeof NOTIONS !== 'undefined' ? NOTIONS.find((n) => n.id === k) : null;
    if (!N) return null;
    const L = N.levels.find((l) => l.id === 'agreg') || N.levels.find((l) => l.id === 'commune') || N.levels[N.levels.length - 1];
    return { h: `#n-${k}-${L.id}`, t: 'S’entraîner' };
  }
  function css() {
    if ($('#ca-css')) return;
    const s = document.createElement('style'); s.id = 'ca-css';
    s.textContent = `.ca-f{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 16px}.ca-f button{font:inherit;font-size:15px;padding:7px 16px;border-radius:999px;border:1px solid #183047;background:#fff;color:#183047;cursor:pointer}.ca-f button[aria-pressed=true]{background:#183047;color:#fff}
.ca-b{background:#fff;border-radius:12px;padding:14px 14px 12px;margin:0 0 18px;box-shadow:0 1px 3px rgba(24,48,71,.1)}.ca-b h2{margin:0 0 2px;font-size:18px}.ca-b .muted{margin:2px 0 10px}
.ca-t{border-collapse:separate;border-spacing:2px;margin:0 auto 0 0}.ca-t th{font-size:12px;font-weight:600;color:#3d5366;padding:0}.ca-t thead th{height:84px;vertical-align:bottom}.ca-t thead th span{writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;display:inline-block;padding:2px 0}.ca-t tbody th{text-align:right;padding-right:6px;white-space:nowrap;font-variant-numeric:tabular-nums}.ca-t tfoot th,.ca-t tfoot td{font-size:12px;color:#3d5366;text-align:center;padding-top:4px;font-variant-numeric:tabular-nums}.ca-t tfoot th{text-align:right;padding-right:6px}
.ca-c{display:block;width:26px;height:22px;border-radius:4px;border:0;padding:0;margin:0;cursor:pointer;background:#e9eef3}.ca-c.l1{background:#84b9f3}.ca-c.l2{background:#257de0}.ca-c.l3{background:#0f4a96}.ca-c.na{background:repeating-linear-gradient(45deg,#e9eef3 0 3px,#fff 3px 6px);cursor:default}.ca-c:hover,.ca-c:focus-visible{outline:2px solid #183047;outline-offset:1px}.ca-c[aria-expanded=true]{outline:2px solid #c27c0e;outline-offset:1px}
.ca-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:#3d5366;margin:10px 0 0}.ca-lg i{display:inline-block;width:14px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:5px}
.ca-d{border-left:4px solid #c27c0e;background:#fffaf0;border-radius:8px;padding:10px 12px;margin:12px 0 0}.ca-d h3{margin:0 0 4px;font-size:16px}.ca-d p{margin:4px 0}
.ca-tip{position:fixed;z-index:60;pointer-events:none;background:#fff;border:1px solid #c9d6e0;border-radius:8px;box-shadow:0 4px 14px rgba(24,48,71,.18);padding:6px 10px;font-size:13px;line-height:1.35;max-width:260px}.ca-tip b{display:block;font-size:14px;color:#14212d}.ca-tip span{color:#3d5366}
.ca-r{margin:4px 0 0}.ca-rr{display:grid;grid-template-columns:minmax(130px,1.1fr) 2fr minmax(200px,auto);grid-template-areas:'nm tk vl';gap:4px 10px;align-items:center;font-size:14px;padding:4px 0;border-top:1px solid #eef2f6}.ca-rr .nm{grid-area:nm}.ca-rr .ca-trk{grid-area:tk;display:block;height:10px;background:#eef2f6;border-radius:0 4px 4px 0}.ca-rr .ca-bar{display:block;height:10px;background:#257de0;border-radius:0 4px 4px 0}.ca-rr .vl{grid-area:vl}.ca-rr small{color:#3d5366}.ca-rr a{font-size:13px;white-space:nowrap}
.ca-hl{margin:8px 0 0;padding-left:18px}.ca-hl li{margin:3px 0}
.ca-li{margin:6px 0 0;padding:0;list-style:none}.ca-li li{padding:6px 0;border-top:1px solid #e3eaf0;font-size:14px}
@media(max-width:480px){.ca-b{padding:12px 8px}.ca-c{width:19px;height:20px}.ca-t td{padding:0}.ca-t th{font-size:11px}.ca-t tbody th,.ca-t tfoot th{padding-right:3px}.ca-t tfoot th{font-size:10px}.ca-rr{grid-template-columns:1fr;grid-template-areas:'nm' 'tk' 'vl';gap:3px}}`;
    document.head.appendChild(s);
  }

  // fréquence et constance d’une notion dans une épreuve
  function stats(t) {
    const L = sujets(t).filter((x) => niveaux(x.id)), N = D().N;
    return N.map((k) => {
      const i = ki(k), v = L.map((x) => niveaux(x.id)[i]);
      let depuis = null;
      for (let j = 0; j < L.length && v[j] > 0; j++) depuis = L[j].y;
      const run = depuis == null ? 0 : L.filter((x) => x.y >= depuis).length;
      return { k, pres: v.filter((n) => n > 0).length, fort: v.filter((n) => n >= 2).length, tot: L.length, depuis: run >= 4 ? depuis : null };
    });
  }
  function grille(t) {
    const L = sujets(t), N = D().N, S = stats(t), ep = EP()[t] || { court: t, nom: '' }, ancien = t === 'ai' || t === 'ae';
    const toujours = S.filter((s) => s.depuis).sort((a, b) => a.depuis - b.depuis);
    const top = S.filter((s) => s.pres).sort((a, b) => b.pres - a.pres || b.fort - a.fort).slice(0, 4);
    let h = `<section class="ca-b" data-t="${t}"><h2>${E(ep.court)}</h2><p class="muted">${E(ep.nom)} · ${L.length} sujet${L.length > 1 ? 's' : ''}${ancien ? ' (automatique, électronique, électrotechnique)' : ` de ${L[L.length - 1].y} à ${L[0].y}`}.</p>`;
    if (toujours.length && !ancien) h += `<p><b>Tombe chaque année</b> : ${toujours.map((s) => `${E(NOM[s.k].toLowerCase())} (depuis ${s.depuis})`).join(', ')}.</p>`;
    if (top.length) h += `<p><b>Le plus fréquent</b> : ${top.map((s) => `${E(NOM[s.k].toLowerCase())} (${s.pres} sujets sur ${s.tot})`).join(', ')}.</p>`;
    h += `<div class="ec-sc"><table class="ca-t"><caption class="sr-only" style="position:absolute;left:-9999px">${E(ep.court)} : place de chaque notion dans chaque sujet</caption><thead><tr><th></th>${N.map((k) => `<th scope="col" title="${E(NOM[k])}"><span>${E(COURT[k])}</span></th>`).join('')}</tr></thead><tbody>`;
    L.forEach((x) => {
      const v = niveaux(x.id), lab = ancien ? `${x.y} ${court(x.n)}` : x.y;
      h += `<tr><th scope="row">${E(lab)}</th>${N.map((k, i) => v ? `<td><button type="button" class="ca-c l${v[i]}" data-s="${E(x.id)}" data-k="${k}" aria-expanded="false" aria-label="${E(`${x.y}, ${NOM[k]} : ${NIV[v[i]]}`)}"></button></td>` : `<td><span class="ca-c na" role="img" aria-label="${E(`${x.y} : sujet non analysé`)}" title="Sujet non analysé (scanné, trop lourd)"></span></td>`).join('')}</tr>`;
    });
    h += `</tbody><tfoot><tr><th scope="row" title="Nombre de sujets où la notion est présente">Sujets</th>${S.map((s) => `<td title="${E(`${NOM[s.k]} : présente dans ${s.pres} sujets sur ${s.tot}`)}">${s.pres}</td>`).join('')}</tr></tfoot></table></div><div class="ca-dz"></div></section>`;
    return h;
  }
  function resume(v) {
    // toutes les épreuves de la vue : part des sujets où la notion est présente, et sur les cinq dernières sessions
    const T = VUES[v].t, L = T.flatMap(sujets).filter((x) => niveaux(x.id)), N = D().N;
    if (!L.length) return '';
    const ymax = Math.max(...L.map((x) => x.y)), rec = L.filter((x) => x.y > ymax - 5);
    const R = N.map((k) => {
      const i = ki(k), p = L.filter((x) => niveaux(x.id)[i] > 0).length, pr = rec.filter((x) => niveaux(x.id)[i] > 0).length;
      return { k, p, pr, part: p / L.length, partR: rec.length ? pr / rec.length : 0 };
    }).sort((a, b) => b.part - a.part);
    let h = `<section class="ca-b"><h2>Les notions ${v === 'ancien' ? 'avant 2013' : v === 'interne' ? 'à l’interne' : 'à l’externe'}, toutes épreuves confondues</h2><p class="muted">Part des ${L.length} sujets où la notion est au moins présente ; entre parenthèses, les ${rec.length} sujets des cinq dernières sessions (${ymax - 4} à ${ymax}).</p><div class="ca-r">`;
    R.forEach((r) => {
      const l = lien(r.k), tend = r.partR - r.part >= 0.2 ? ', en hausse' : r.part - r.partR >= 0.2 ? ', en baisse' : '';
      h += `<div class="ca-rr"><span class="nm">${E(NOM[r.k])}</span><span class="ca-trk" aria-hidden="true"><span class="ca-bar" style="width:${Math.round(100 * r.part)}%"></span></span><span class="vl"><small>${r.p} / ${L.length} (${r.pr} / ${rec.length}${tend})</small> ${l ? `<a href="${l.h}">${E(l.t)}</a>` : ''}${r.k !== 'ped' ? ` · <a href="#ecrits-reflexes-revue-${r.k}">Réflexes</a>` : ''}</span></div>`;
    });
    return h + '</div></section>';
  }
  function liste(v) {
    const T = VUES[v].t;
    let h = `<section class="ca-b"><h2>La carte en liste</h2><p class="muted">Les mêmes informations, sujet par sujet : les notions dominantes et importantes, puis celles qui sont présentes.</p><ul class="ca-li">`;
    T.forEach((t) => sujets(t).forEach((x) => {
      const n = niveaux(x.id), ep = EP()[t] || { court: t };
      if (!n) { h += `<li><b>${x.y} · ${E(ep.court)}</b> · ${E(x.th)} : non analysé.</li>`; return; }
      const par = (m) => D().N.filter((k, i) => n[i] === m).map((k) => NOM[k].toLowerCase()).join(', ');
      const p3 = par(3), p2 = par(2), p1 = par(1);
      h += `<li><b>${x.y} · ${E(ep.court)}${x.n ? ` · ${E(court(x.n))}` : ''}</b> · <a href="#ecrits-sujet-${E(x.id)}">${E(x.th)}</a><br>${p3 ? `Dominante : ${E(p3)}. ` : ''}${p2 ? `Importante : ${E(p2)}. ` : ''}${p1 ? `Présente : ${E(p1)}.` : ''}</li>`;
    }));
    return h + '</ul></section>';
  }
  function detail(btn) {
    const sec = btn.closest('.ca-b'), dz = $('.ca-dz', sec), id = btn.dataset.s, k = btn.dataset.k;
    const x = (window.ECRITS_ANNALES || []).find((a) => a.id === id), n = niveaux(id);
    if (!x || !n) return;
    const deja = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.ca-c[aria-expanded=true]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('.ca-dz').forEach((z) => { z.innerHTML = ''; });
    if (deja) return;
    btn.setAttribute('aria-expanded', 'true');
    const ep = EP()[x.t] || { court: x.t }, l = lien(k), fort = D().N.filter((c, i) => n[i] >= 2 && c !== k).map((c) => NOM[c].toLowerCase());
    dz.innerHTML = `<div class="ca-d" role="region" aria-label="Détail de la case"><h3>${x.y} · ${E(ep.court)}${x.n ? ` · ${E(court(x.n))}` : ''}</h3><p>${E(x.th)}</p><p><b>${E(NOM[k])}</b> : ${NIV[n[ki(k)]]} dans ce sujet.${fort.length ? ` Les autres notions fortes : ${E(fort.join(', '))}.` : ''}</p><div class="btns"><a class="b" href="#ecrits-sujet-${E(id)}">Ouvrir le sujet</a>${l ? `<a class="b sec" href="${l.h}">${E(l.t)} : ${E(NOM[k].toLowerCase())}</a>` : ''}${k !== 'ped' ? `<a class="b sec" href="#ecrits-reflexes-revue-${k}">Fiches réflexes</a>` : ''}</div></div>`;
  }
  function bulle(btn) {
    let tip = $('#ca-tip');
    if (!btn) { if (tip) tip.hidden = true; return; }
    if (!tip) { tip = document.createElement('div'); tip.id = 'ca-tip'; tip.className = 'ca-tip'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip); }
    const x = (window.ECRITS_ANNALES || []).find((a) => a.id === btn.dataset.s), n = niveaux(btn.dataset.s);
    if (!x || !n) return;
    const b = document.createElement('b'), s = document.createElement('span');
    b.textContent = `${NOM[btn.dataset.k]} : ${NIV[n[ki(btn.dataset.k)]]}`;
    s.textContent = `${x.y} · ${(EP()[x.t] || {}).court || ''} · ${x.th}`;
    tip.replaceChildren(b, s); tip.hidden = false;
    const r = btn.getBoundingClientRect(), w = tip.offsetWidth, hgt = tip.offsetHeight;
    let left = r.left + r.width / 2 - w / 2; left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.top - hgt - 8; if (top < 8) top = r.bottom + 8;
    tip.style.left = `${left}px`; tip.style.top = `${top}px`;
  }
  function page(v) {
    css();
    if (!VUES[v]) v = 'interne';
    ecrire(v);
    const C = D().controle || {}, pc = (a) => (C.cellules ? Math.round((100 * a) / C.cellules) : 0);
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · carte des annales</div><h1>Ce qui tombe : la carte 2010-2026</h1>
      <p class="muted">Chaque ligne est un sujet, chaque colonne une notion : plus la case est foncée, plus la notion pèse dans le sujet. Une case ouvre le sujet et la notion à travailler.</p>
      <div class="ca-f" role="group" aria-label="Concours">${Object.entries(VUES).map(([k, x]) => `<button type="button" data-v="${k}" aria-pressed="${k === v}">${E(x.nom)}</button>`).join('')}</div>`;
    h += VUES[v].t.map(grille).join('');
    h += `<div class="ca-lg" aria-label="Légende">${NIV.map((n, i) => `<span><i style="background:${['#e9eef3', '#84b9f3', '#257de0', '#0f4a96'][i]}"></i>${n}</span>`).join('')}${v === 'interne' ? '<span><i style="background:repeating-linear-gradient(45deg,#e9eef3 0 3px,#fff 3px 6px)"></i>non analysé</span>' : ''}</div>`;
    h += resume(v);
    h += `<details class="ca-b"><summary><b>Voir la carte en liste</b></summary>${liste(v).replace(/^<section class="ca-b">/, '').replace(/<\/section>$/, '')}</details>`;
    h += `<section class="ca-b"><h2>Comment la carte est faite</h2><p>Les ${Object.keys(D().s).length} sujets écrits de l’option ingénierie électrique, de 2010 à 2026, ont été lus page par page (lecture optique pour les sujets scannés). Une notion compte sur une page quand ses mots-clés y reviennent au moins deux fois ; son niveau dépend de la part des pages concernées : présente à partir de 8 %, importante à partir de 15 %, dominante à partir de 28 %.</p>
      <p>Contrôle sur les ${C.sujets || 7} sujets corrigés question par question sur le site : la présence d’une notion est juste dans ${pc(C.presence)} % des cas et le niveau, à un cran près, dans ${pc(C.cran)} %. C’est un repérage, pas une lecture fine : une notion peut peser plus ou moins que sa case. Les documents techniques en annexe comptent comme le reste du sujet.</p>
      <p class="muted">Le sujet interne 2014 de l’épreuve 1 (scanné, trop lourd) n’est pas analysé ; le sujet interne 2010 d’électronique est repéré à la main. Dans les sujets lus, la partie pédagogique se trouve dans l’épreuve 2 interne de 2014 à 2016, puis dans l’épreuve 1 à partir de 2017.</p></section>`;
    app().innerHTML = h;
    const a = app();
    a.onclick = (e) => {
      const f = e.target.closest('.ca-f button'); if (f) { location.hash = `ecrits-carte-${f.dataset.v}`; return; }
      const c = e.target.closest('button.ca-c'); if (c) { bulle(null); detail(c); }
    };
    a.onpointerover = (e) => { const c = e.target.closest && e.target.closest('button.ca-c'); if (c && e.pointerType !== 'touch') bulle(c); };
    a.onpointerout = (e) => { const c = e.target.closest && e.target.closest('button.ca-c'); if (c && !c.contains(e.relatedTarget)) bulle(null); };
    a.onfocusin = (e) => { const c = e.target.closest && e.target.closest('button.ca-c'); if (c) bulle(c); };
    a.onfocusout = () => bulle(null);
    window.addEventListener('scroll', () => bulle(null), { once: true, passive: true });
    window.addEventListener('hashchange', () => { bulle(null); a.onpointerover = a.onpointerout = a.onfocusin = a.onfocusout = null; }, { once: true });
  }
  function carte() {
    const n = Object.keys(D().s).length;
    return `<div class="ec-ep" style="--c:#1b64be"><div class="eyebrow">Interne et externe · 2010 à 2026</div><h3>La carte des annales</h3><p class="muted">Les ${n} sujets lus page par page : quelles notions tombent dans quelle épreuve, lesquelles reviennent chaque année, et ce qui monte ces dernières sessions.</p><div class="btns"><a class="b" href="#ecrits-carte">Voir la carte</a></div></div>`;
  }
  function route(h) {
    const m = h.match(/^ecrits-carte-(interne|externe|ancien)$/);
    return page(m ? m[1] : (lire() || 'interne'));
  }
  window.ECRITS_CARTE = { route, carte, stats, NOM };
})();
