/* =====================================================================
   SI Papara — agrégation : la répétition générale aux vraies dates (#ecrits-repetition)
   Les fenêtres officielles de la session 2027, les dates et heures de tes épreuves (à corriger dès la convocation),
   l’heure de Tahiti calculée, une répétition complète aux mêmes jours et mêmes heures (trois semaines avant l’interne,
   deux avant l’externe), la semaine d’allègement, le compte à rebours et l’export vers l’agenda (.ics).
   État : st.ec.rep { m : 'sim' ou 'loc', d : dates, h : heures, f : répétitions faites, b : bilans }.
   Globales de agreg/index.html : st, save, app.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = 36e5, J = 864e5;
  const SOURCE = 'https://www.devenirenseignant.gouv.fr/le-calendrier-des-concours-de-recrutement-d-enseignants-du-second-degre-de-la-session-2027-1562';
  const FEN = { interne: { de: '2027-01-25', a: '2027-01-29', txt: 'du lundi 25 au vendredi 29 janvier 2027' }, externe: { de: '2027-02-17', a: '2027-03-05', txt: 'du mercredi 17 février au vendredi 5 mars 2027' } };
  // hypothèse par défaut pour l’interne : jeudi et vendredi, comme en 2016 ; l’externe est à saisir
  const EPRS = [
    { t: 'i1', lg: 'l’épreuve 1 de l’interne', c: 'interne', nom: 'Interne · épreuve 1', dur: 300, def: '2027-01-28' },
    { t: 'i2', lg: 'l’épreuve 2 de l’interne', c: 'interne', nom: 'Interne · épreuve 2', dur: 240, def: '2027-01-29' },
    { t: 'e1', lg: 'l’épreuve 1 de l’externe', c: 'externe', nom: 'Externe · épreuve 1', dur: 360, def: '' },
    { t: 'e2', lg: 'l’épreuve 2 de l’externe', c: 'externe', nom: 'Externe · épreuve 2', dur: 360, def: '' },
    { t: 'e3', lg: 'l’épreuve 3 de l’externe', c: 'externe', nom: 'Externe · épreuve 3', dur: 360, def: '' }
  ];
  const ZONE = { paris: 1, tahiti: -10 };   // décalages UTC de janvier à mars 2027 (heure d’hiver à Paris jusqu’au 28 mars)
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  const S = () => {
    if (!st.ec || typeof st.ec !== 'object') st.ec = {};
    const r = st.ec.rep && typeof st.ec.rep === 'object' && !Array.isArray(st.ec.rep) ? st.ec.rep : (st.ec.rep = {});
    ['d', 'h', 'f', 'b'].forEach((k) => { if (!r[k] || typeof r[k] !== 'object') r[k] = {}; });
    if (r.m !== 'loc') r.m = 'sim';
    return r;
  };
  const garder = () => { S().t = Date.now(); save(); };
  const dateDe = (e) => (S().d[e.t] !== undefined ? S().d[e.t] : e.def);
  const heureDe = (e) => S().h[e.t] || (S().m === 'sim' ? '09:00' : '08:00');
  // instant UTC d’une date et d’une heure données dans une zone
  function utc(d, h, z) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''), n = /^(\d{1,2}):(\d{2})$/.exec(h || '');
    if (!m || !n) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +n[1], +n[2]) - ZONE[z] * H;
  }
  const debut = (e) => utc(dateDe(e), heureDe(e), S().m === 'sim' ? 'paris' : 'tahiti');
  const tahiti = (u) => new Date(u + ZONE.tahiti * H);   // à lire avec getUTC…
  const hh = (d) => `${d.getUTCHours()} h ${String(d.getUTCMinutes()).padStart(2, '0')}`;
  const jour = (u) => { const d = tahiti(u); return `${JOURS[d.getUTCDay()]} ${d.getUTCDate()}${d.getUTCDate() === 1 ? 'er' : ''} ${MOIS[d.getUTCMonth()]}`; };
  const plage = (u, dur) => { const a = tahiti(u), b = tahiti(u + dur * 6e4), meme = a.getUTCDate() === b.getUTCDate(); return `${jour(u)}, ${hh(a)} → ${meme ? '' : jour(u + dur * 6e4) + ', '}${hh(b)}`; };
  const duree = (m) => `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) : ''}`;
  // sabbat : du vendredi 17 h 30 au samedi 19 h, heure de Tahiti
  function sabbat(u, dur) {
    for (let x = u; x <= u + dur * 6e4; x += 15 * 6e4) {
      const d = tahiti(x), j = d.getUTCDay(), m = d.getUTCHours() * 60 + d.getUTCMinutes();
      if ((j === 5 && m >= 17 * 60 + 30) || (j === 6 && m < 19 * 60)) return true;
    }
    return false;
  }
  // sujet proposé pour une répétition : le plus récent non composé, avec corrigé détaillé de préférence
  function sujetPour(t, sauf) {
    const A = (window.ECRITS_ANNALES || []).filter((x) => x.t === t && !sauf.includes(x.id)).sort((a, b) => b.y - a.y);
    const faits = new Set(((st.ec && st.ec.comp) || []).map((c) => c.id));
    const F = window.ECRITS_FICHES || {};
    return A.find((x) => F[x.id] && !faits.has(x.id)) || A.find((x) => !faits.has(x.id)) || A[0] || null;
  }

  function plan() {
    const P = [], pris = [];
    ['interne', 'externe'].forEach((c) => {
      const L = EPRS.filter((e) => e.c === c).map((e) => ({ e, u: debut(e) })).filter((x) => x.u != null).sort((a, b) => a.u - b.u);
      if (!L.length) return;
      let ecart = c === 'interne' ? 21 : 14;
      const finInterne = P.filter((p) => p.k === 'vrai' && p.c === 'interne').reduce((m, p) => Math.max(m, p.u + p.dur * 6e4), 0);
      if (c === 'externe' && finInterne && L[0].u - ecart * J < finInterne + 4 * J) ecart = 7;
      L.forEach(({ e, u }) => {
        const s = sujetPour(e.t, pris); if (s) pris.push(s.id);
        P.push({ k: 'rep', c, e, u: u - ecart * J, dur: e.dur, s, cle: `${c}-${e.t}`, ecart });
        P.push({ k: 'vrai', c, e, u, dur: e.dur });
      });
      P.push({ k: 'leger', c, u: L[0].u - 7 * J, fin: L[0].u - J });
    });
    return P.sort((a, b) => a.u - b.u);
  }

  function css() {
    if ($('#rp-css')) return;
    const s = document.createElement('style'); s.id = 'rp-css';
    s.textContent = `.rp-cd{background:#183047;color:#fff;border-radius:14px;padding:16px 18px;margin:8px 0 16px}.rp-cd b{font-size:30px;display:block;line-height:1.15;font-variant-numeric:tabular-nums}.rp-cd span{opacity:.85}
.rp-b{background:#fff;border-radius:12px;padding:14px 16px;margin:0 0 16px;box-shadow:0 1px 3px rgba(24,48,71,.1)}.rp-b h2{margin:0 0 6px;font-size:18px}
.rp-e{display:grid;grid-template-columns:minmax(150px,1fr) 150px 100px;gap:8px 10px;align-items:center;padding:8px 0;border-top:1px solid #e3eaf0}.rp-e input{font:inherit;font-size:15px;padding:5px 6px;border:1px solid #b9c7d3;border-radius:6px;width:100%;box-sizing:border-box}.rp-e .q{grid-column:1/-1;font-size:14px;color:#3d5366}
.rp-p{list-style:none;margin:0;padding:0}.rp-p li{padding:10px 0;border-top:1px solid #e3eaf0}.rp-p .k{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-radius:4px;padding:1px 6px;margin-right:6px}.rp-p .k.rep{background:#fff1d6;color:#7a4b00}.rp-p .k.vrai{background:#183047;color:#fff}.rp-p .k.leger{background:#e4f1e9;color:#1f5a3a}.rp-p .w{color:#a8362b;font-weight:600}.rp-p textarea{font:inherit;font-size:14px;width:100%;box-sizing:border-box;min-height:54px;margin-top:6px;border:1px solid #b9c7d3;border-radius:6px;padding:6px}
.rp-m{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 4px}.rp-m label{display:flex;gap:6px;align-items:center;font-size:15px;border:1px solid #b9c7d3;border-radius:8px;padding:6px 10px;cursor:pointer}
.rp-l{margin:6px 0 0;padding-left:20px}.rp-l li{margin:4px 0}
@media(max-width:560px){.rp-e{grid-template-columns:1fr 1fr}.rp-e>b{grid-column:1/-1}}`;
    document.head.appendChild(s);
  }
  function compte() {
    const now = Date.now(), L = EPRS.map((e) => ({ e, u: debut(e) })).filter((x) => x.u != null && x.u + x.e.dur * 6e4 > now).sort((a, b) => a.u - b.u)[0];
    if (!L) return '<b>Session 2027</b><span>Saisis les dates de tes épreuves ci-dessous.</span>';
    const r = L.u - now;
    if (r <= 0) return `<b>En cours</b><span>${E(L.e.nom)} : courage, tu as répété ce moment.</span>`;
    const j = Math.floor(r / J), h = Math.floor((r % J) / H);
    return `<b>J−${j}${j < 3 ? ` et ${h} h` : ''}</b><span>avant ${E(L.e.lg)} : ${E(plage(L.u, L.e.dur))}, heure de Tahiti</span>`;
  }
  function ligne(p) {
    const now = Date.now();
    if (p.k === 'leger') return `<li><span class="k leger">Allègement</span><b>Du ${E(jour(p.u))} au ${E(jour(p.fin))}</b> · ${p.c}<br>Plus de composition complète : chaque jour un quart d’heure de <a href="#ecrits-reflexes-revue">fiches réflexes</a>, une lecture stratégique de quinze minutes, la relecture de tes bilans de répétition et de la check-list. Le rythme de sommeil se cale sur l’heure des épreuves.</li>`;
    if (p.k === 'vrai') return `<li><span class="k vrai">Le jour J</span><b>${E(p.e.nom)}</b> · ${duree(p.dur)}<br>${E(plage(p.u, p.dur))}${sabbat(p.u, p.dur) ? ' · <span class="w">empiète sur le sabbat : vérifie l’horaire de ta convocation</span>' : ''}</li>`;
    const fait = S().f[p.cle], passe = p.u + p.dur * 6e4 < now;
    return `<li><span class="k rep">Répétition</span><b>${E(p.e.nom)}</b> · ${duree(p.dur)}, ${p.ecart === 7 ? 'une' : p.ecart === 14 ? 'deux' : 'trois'} semaines avant, même jour, même heure<br>${E(plage(p.u, p.dur))}${sabbat(p.u, p.dur) ? ' · <span class="w">tombe pendant le sabbat : décale-la au jeudi</span>' : ''}
      ${p.s ? `<br>Sujet proposé : <a href="#ecrits-sujet-${E(p.s.id)}">${E(p.s.y)} · ${E(p.s.th)}</a> · <a href="#ecrits-compo-${E(p.s.id)}">composer au chronomètre</a>` : ''}
      <br><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" data-f="${E(p.cle)}"${fait ? ' checked' : ''}> Répétition faite${fait ? ` le ${new Date(fait).toLocaleDateString('fr-FR')}` : ''}</label>
      ${fait || passe ? `<textarea data-b="${E(p.cle)}" placeholder="Bilan : note estimée, temps par partie, fatigue, ce que je change pour le jour J">${E(S().b[p.cle] || '')}</textarea>` : ''}</li>`;
  }
  function rendre() {
    const r = S(), P = plan(), sim = r.m === 'sim', ext = EPRS.filter((e) => e.c === 'externe').every((e) => !dateDe(e));
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · répétition générale</div><h1>La répétition générale</h1>
      <p class="muted">Le jour J se prépare comme un match : une composition complète aux mêmes jours, aux mêmes heures et pour la même durée que les vraies épreuves, avec le même matériel. Puis une semaine d’allègement.</p>
      <div class="rp-cd" id="rp-cd" role="timer" aria-live="off">${compte()}</div>
      <section class="rp-b"><h2>Les dates officielles</h2><p>Session 2027 : concours interne ${FEN.interne.txt} ; concours externe ${FEN.externe.txt}. Le calendrier détaillé, section par section, n’est pas encore publié : <a href="${SOURCE}" target="_blank" rel="noopener">calendrier de la session 2027</a> (vérifié le 27 novembre 2026). Les dates et l’heure exactes figureront sur ta convocation, dans ton espace Cyclades.</p></section>
      <section class="rp-b"><h2>Tes épreuves</h2>
      <div class="rp-m" role="radiogroup" aria-label="Horaire"><label><input type="radio" name="rp-m" value="sim"${sim ? ' checked' : ''}> En simultané avec Paris</label><label><input type="radio" name="rp-m" value="loc"${sim ? '' : ' checked'}> À l’heure de Tahiti</label></div>
      <p class="muted">${sim ? 'Le sujet est national : comme pour d’autres concours, l’épreuve peut se passer en même temps qu’à Paris, donc de nuit à Tahiti (11 heures de décalage en janvier et février). Saisis l’heure de Paris ; vérifie sur ta convocation.' : 'Saisis l’heure de début indiquée sur ta convocation, en heure de Tahiti.'}</p>`;
    EPRS.forEach((e) => {
      const u = debut(e), d = dateDe(e), f = FEN[e.c];
      const sup = [e.def && d === e.def && S().d[e.t] === undefined ? 'date supposée (jeudi et vendredi, comme en 2016)' : '', S().h[e.t] ? '' : `heure supposée (${sim ? '9 h à Paris' : '8 h'})`].filter(Boolean);
      h += `<div class="rp-e"><b>${E(e.nom)} <small class="muted">(${duree(e.dur)})</small></b><input type="date" data-d="${e.t}" value="${E(d)}" min="${f.de}" max="${f.a}" aria-label="Date, ${E(e.nom)}"><input type="time" data-h="${e.t}" value="${E(heureDe(e))}" aria-label="Heure de début, ${E(e.nom)}"><span class="q">${u != null ? `À Tahiti : ${E(plage(u, e.dur))}${sup.length ? ` · ${sup.join(', ')} : à corriger` : ''}` : 'Date à saisir dès la convocation.'}</span></div>`;
    });
    h += '</section>';
    h += `<section class="rp-b"><h2>Le plan</h2>${ext ? '<p class="muted">L’externe n’a pas encore de dates : sa répétition (les trois épreuves de 6 h, deux semaines avant) s’ajoutera dès que tu les saisis. Elle doit tomber au moins quatre jours après la fin de l’interne.</p>' : ''}<ul class="rp-p">${P.map(ligne).join('')}</ul>
      <div class="btns" style="margin-top:12px"><button class="b" id="rp-ics" type="button"${P.length ? '' : ' disabled'}>Ajouter à mon agenda (.ics)</button></div></section>`;
    h += `<section class="rp-b"><h2>Pendant la répétition</h2><ul class="rp-l">
      <li>Le matériel du jour J : stylos, règle, crayon, gomme, montre, et ta calculatrice (autorisée selon les modalités de la circulaire du 17 juin 2021, rappelées en tête des sujets) ; le téléphone éteint, dans une autre pièce.</li>
      <li>Le quart d’heure de lecture stratégique, puis le budget de temps par partie de la page de composition ; toutes les parties abordées.</li>
      <li>La collation et l’eau prévues pour le jour J, pas d’autre pause que celles du concours.</li>
      <li>À la fin : la note estimée avec le rapport du jury, le temps passé par partie, et une seule chose à changer pour le jour J.</li></ul>
      ${sim ? '<h2 style="margin-top:12px">Composer de nuit</h2><ul class="rp-l"><li>La répétition à l’heure exacte est la seule façon de savoir comment tu tiens de 22 h à 3 ou 4 h : ne la saute pas.</li><li>Les jours d’épreuve, une sieste en fin d’après-midi et un repas léger avant de partir ; une lumière franche sur ta table pendant la composition.</li><li>Entre deux épreuves, dors le matin et garde l’après-midi calme.</li></ul>' : ''}</section>`;
    app().innerHTML = h;
  }
  function ics() {
    const P = plan().filter((p) => p.k !== 'leger'), z = (u) => new Date(u).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SI Papara//Agregation 2027//FR', 'CALSCALE:GREGORIAN'];
    P.forEach((p) => {
      const titre = p.k === 'rep' ? `Répétition générale · ${p.e.nom} (${duree(p.dur)})` : `Agrégation · ${p.e.nom} (${duree(p.dur)})`;
      const desc = p.k === 'rep' ? `Composition complète, même jour et même heure que l'épreuve.${p.s ? ` Sujet proposé : ${p.s.y}, ${p.s.th}.` : ''}` : 'Vérifier l’horaire et le lieu sur la convocation.';
      L.push('BEGIN:VEVENT', `UID:${p.k}-${p.e.t}-${z(p.u)}@si.ka-ilei.com`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(p.u)}`, `DTEND:${z(p.u + p.dur * 6e4)}`, `SUMMARY:${esc(titre)}`, `DESCRIPTION:${esc(desc)}`, 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(titre)}`, 'END:VALARM', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([L.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'agregation-2027-repetitions.ics';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function page() {
    css(); rendre();
    const a = app();
    a.onchange = (e) => {
      const x = e.target;
      if (x.name === 'rp-m') { S().m = x.value; garder(); return rendre(); }
      if (x.dataset.d) { S().d[x.dataset.d] = x.value; garder(); return rendre(); }
      if (x.dataset.h) { S().h[x.dataset.h] = x.value; garder(); return rendre(); }
      if (x.dataset.f) { if (x.checked) S().f[x.dataset.f] = Date.now(); else delete S().f[x.dataset.f]; garder(); return rendre(); }
      if (x.dataset.b) { S().b[x.dataset.b] = x.value.slice(0, 1000); garder(); }
    };
    a.onclick = (e) => { if (e.target.closest('#rp-ics')) ics(); };
    clearInterval(window.__an);
    window.__an = setInterval(() => { const c = $('#rp-cd'); if (c) c.innerHTML = compte(); else clearInterval(window.__an); }, 30000);
  }
  function carte() {
    const u = EPRS.map(debut).filter((x) => x != null && x > Date.now()).sort((a, b) => a - b)[0];
    const j = u ? Math.floor((u - Date.now()) / J) : null;
    return `<div class="ec-ep" style="--c:#183047"><div class="eyebrow">Session 2027 · interne en janvier, externe en février-mars</div><h3>La répétition générale</h3><p class="muted">Une composition complète aux vraies dates et heures, trois semaines avant (de nuit si tu composes en même temps que Paris), puis la semaine d’allègement, avec l’export vers ton agenda.${j != null ? ` J−${j} avant la première épreuve.` : ''}</p><div class="btns"><a class="b" href="#ecrits-repetition">Préparer le jour J</a></div></div>`;
  }
  window.ECRITS_REPETITION = { route: page, carte, plan, debut, plage, EPRS };
})();
