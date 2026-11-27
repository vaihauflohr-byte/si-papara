/* =====================================================================
   SI Papara — agrégation : les documents de la séance
   À partir de la séance écrite dans la leçon (brouillon), dans la fiche d'un banc du labo, ou librement :
   - le plan de tableau et quatre ou cinq diapositives pour l'exposé (à présenter en plein écran ou à imprimer) ;
   - la fiche élève à distribuer, en Word (.docx fabriqué dans le navigateur, au logo du lycée) ;
   - la grille d'évaluation par compétences, avec les intitulés officiels du référentiel du niveau.
   Routes #admission-seance (choix de la séance) et #admission-seance-<lecon|reel-<banc>|libre>.
   Données dans st.seances[source] (suivent d'un appareil à l'autre). Aucune donnée d'élève : la fiche
   porte des lignes vides « Nom, prénom, classe » à remplir sur papier.
   Chargé après le moteur (agreg/index.html) et avant admission.js : st, save, app, esc, fmt, getSample ;
   référentiels lus dans ADMISSION.NIV au moment de l'affichage.
   ===================================================================== */
(function () {
  'use strict';
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const liste = (x, n) => (Array.isArray(x) ? x : []).map((y) => String(y == null ? '' : y).trim()).filter(Boolean).slice(0, n);
  const txt = (x, n) => String(x == null ? '' : x).trim().slice(0, n);
  const date = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const erreurIA = (e) => (window.AGREG_HOOK && AGREG_HOOK.err && AGREG_HOOK.err(e && e.code)) || 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.';
  const NIVX = () => (window.ADMISSION && ADMISSION.NIV) || {};
  const ORDRE = ['btsET', 'ciel', 'but', 'cpge', 'sti2d', 'si'];
  const LYCEE = 'Lycée polyvalent Tuianu Le Gayic · Papara';

  /* ---------- les séances disponibles ---------- */
  function sources() {
    const L = [], R = lsGet('adm-brouillon');
    if (R && R.champs && window.ADMISSION && NIVX()[R.niv]) {
      const S = (ADMISSION.SUP || [])[R.sup];
      L.push({ id: 'lecon', titre: 'Ta leçon en cours', sous: `${NIVX()[R.niv].nom}${S ? ' · ' + S.nom : ''}`, vide: !String(R.champs.seance || '').trim() });
    }
    const B = (window.ADMISSION_REEL && ADMISSION_REEL.BANCS) || {}, RE = (typeof st === 'object' && st && st.reel) || {};
    Object.keys(B).forEach((id) => { const x = RE[id]; if (x && x.txt) L.push({ id: 'reel-' + id, titre: B[id].titre, sous: 'fiche de ton banc du labo', vide: !String(x.txt.seance || '').trim() }); });
    L.push({ id: 'libre', titre: 'Une séance libre', sous: 'tu écris ou colles ta séance', vide: false });
    return L;
  }
  // la séance d'une source : niveau, compétences cochées, texte de la séance, contexte pour l'IA
  function charger(src) {
    if (src === 'lecon') {
      const R = lsGet('adm-brouillon'), N = R && NIVX()[R.niv]; if (!N || !window.ADMISSION) return null;
      const S = ADMISSION.SUP[R.sup] || { nom: '', prob: '', mes: [] }, refs = N.ref.filter((r) => !(R.ep === 'e1' && r[2]));
      const ch = (k) => String((R.champs || {})[k] || '').trim(), seq = (R.seqs || [])[R.seq == null ? 0 : R.seq] || '';
      return {
        niv: R.niv, comp: (R.comp || []).map((i) => refs[i] && refs[i][0]).filter(Boolean), titre: seq || 'La séance de ta leçon',
        texte: [ch('seance'), ch('proto') && 'Protocole : ' + ch('proto'), ch('eval') && 'Évaluation : ' + ch('eval')].filter(Boolean).join('\n\n'),
        ctx: `Support : ${S.nom}. ${S.prob}\nSéquence imposée : « ${seq} »\nProblématique de la séquence : ${ch('prob') || '—'}\nPlace dans la progression : ${ch('prog') || '—'}\nObjectifs : ${ch('obj') || '—'}\nDémarche : ${ch('dem') || '—'}\nRésultats des études : ${(S.mes || []).join(' ')}`,
      };
    }
    const m = /^reel-([a-z0-9]+)$/.exec(src);
    if (m && window.ADMISSION_REEL) {
      const B = ADMISSION_REEL.BANCS[m[1]], R = st.reel && st.reel[m[1]]; if (!B || !R || !R.txt) return null;
      return { niv: NIVX()[R.niv] ? R.niv : 'btsET', comp: Array.isArray(R.comp) ? R.comp.slice() : [], titre: B.titre, texte: String(R.txt.seance || ''), ctx: ADMISSION_REEL.resume ? ADMISSION_REEL.resume(m[1]) : '' };
    }
    if (src === 'libre') return { niv: 'btsET', comp: [], titre: 'Une séance libre', texte: '', ctx: '' };
    return null;
  }
  const SE = () => { if (!st.seances || typeof st.seances !== 'object') st.seances = {}; return st.seances; };

  /* ---------- le .docx, fabriqué dans le navigateur (archive ZIP « stockée », sans compression) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u) => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cent = []; let off = 0;
    const d = new Date(), dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    for (const f of files) {
      const nm = enc.encode(f.name), u = typeof f.data === 'string' ? enc.encode(f.data) : f.data, c = crc32(u);
      const h = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, tm, 2], [12, dt, 2], [14, c, 4], [18, u.length, 4], [22, u.length, 4], [26, nm.length, 2], [28, 0, 2]].forEach(([o, v, n]) => (n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true)));
      parts.push(new Uint8Array(h.buffer), nm, u);
      const e = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, tm, 2], [14, dt, 2], [16, c, 4], [20, u.length, 4], [24, u.length, 4], [28, nm.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, n]) => (n === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true)));
      cent.push(new Uint8Array(e.buffer), nm);
      off += 30 + nm.length + u.length;
    }
    const cs = cent.reduce((s, x) => s + x.length, 0), z = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, cs, 4], [16, off, 4], [20, 0, 2]].forEach(([o, v, n]) => (n === 4 ? z.setUint32(o, v, true) : z.setUint16(o, v, true)));
    return new Blob([...parts, ...cent, new Uint8Array(z.buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  const X = (s) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  const run = (t, o) => { o = o || {}; const p = []; if (o.b) p.push('<w:b/>'); if (o.i) p.push('<w:i/>'); if (o.c) p.push(`<w:color w:val="${o.c}"/>`); if (o.sz) p.push(`<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`); return `<w:r>${p.length ? `<w:rPr>${p.join('')}</w:rPr>` : ''}<w:t xml:space="preserve">${X(t)}</w:t></w:r>`; };
  function para(runs, o) {
    o = o || {}; const p = [];
    if (o.st) p.push(`<w:pStyle w:val="${o.st}"/>`);
    if (o.keep) p.push('<w:keepNext/>');
    if (o.num) p.push(`<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${o.num}"/></w:numPr>`);
    if (o.cadre) p.push(`<w:pBdr>${['top', 'left', 'bottom', 'right'].map((s) => `<w:${s} w:val="single" w:sz="8" w:space="4" w:color="${o.cadre}"/>`).join('')}</w:pBdr>`);
    if (o.fond) p.push(`<w:shd w:val="clear" w:color="auto" w:fill="${o.fond}"/>`);
    if (o.ap != null) p.push(`<w:spacing w:before="${o.av || 0}" w:after="${o.ap}"/>`);
    if (o.al) p.push(`<w:jc w:val="${o.al}"/>`);
    return `<w:p>${p.length ? `<w:pPr>${p.join('')}</w:pPr>` : ''}${Array.isArray(runs) ? runs.join('') : runs || ''}</w:p>`;
  }
  const BORD = (v, c) => ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((s) => `<w:${s} w:val="${(v[s] || v.x)}" w:sz="4" w:space="0" w:color="${c || '9FB3C2'}"/>`).join('');
  function table(W, rows, o) {
    o = o || {};
    const brd = o.sans ? BORD({ x: 'nil' }) : o.lignes ? BORD({ x: 'nil', bottom: 'dotted', insideH: 'dotted' }) : BORD({ x: 'single' });
    return `<w:tbl><w:tblPr><w:tblW w:w="${W.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>${brd}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="50" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${W.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`
      + rows.map((r) => `<w:tr><w:trPr><w:cantSplit/>${r.h ? `<w:trHeight w:val="${r.h}"/>` : ''}${r.tete ? '<w:tblHeader/>' : ''}</w:trPr>${r.c.map((c, j) => `<w:tc><w:tcPr><w:tcW w:w="${W[j]}" w:type="dxa"/>${r.tete || r.fond ? `<w:shd w:val="clear" w:color="auto" w:fill="${r.fond || 'E9EEF2'}"/>` : ''}${o.centre ? '<w:vAlign w:val="center"/>' : ''}</w:tcPr>${c || '<w:p/>'}</w:tc>`).join('')}</w:tr>`).join('') + '</w:tbl>';
  }
  const logoXml = (cx, cy) => `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="Logo du lycée"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:color w:val="12566F"/><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:color w:val="12566F"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="60"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:color w:val="183047"/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="40"/><w:ind w:left="720"/></w:pPr></w:style>'
    + '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>';
  const NUMS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="400" w:hanging="260"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/></w:rPr></w:lvl></w:abstractNum>'
    + '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="Q%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="560" w:hanging="560"/></w:pPr><w:rPr><w:b/><w:color w:val="12566F"/></w:rPr></w:lvl></w:abstractNum>'
    + '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>';
  let LOGO;   // le logo du lycée, lu une fois
  async function logo() {
    if (LOGO !== undefined) return LOGO;
    try { const r = await fetch('../assets/logo-papara.png'); LOGO = r.ok ? new Uint8Array(await r.arrayBuffer()) : null; } catch (e) { LOGO = null; }
    return LOGO;
  }
  async function docx(titre, corps) {
    const L = await logo(), avecLogo = !!L && corps.includes('rIdLogo');
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${avecLogo ? corps : corps.replace(/<w:r><w:drawing>[\s\S]*?<\/w:drawing><\/w:r>/g, '')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1021" w:right="1134" w:bottom="1021" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const rel = (id, type, cible) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${cible}"/>`;
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
      { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
      { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${X(titre)}</dc:title><dc:creator>SI Papara</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created></cp:coreProperties>` },
      { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel('rIdStyles', 'styles', 'styles.xml')}${rel('rIdNum', 'numbering', 'numbering.xml')}${avecLogo ? rel('rIdLogo', 'image', 'media/logo.png') : ''}</Relationships>` },
      { name: 'word/document.xml', data: doc },
      { name: 'word/styles.xml', data: STYLES },
      { name: 'word/numbering.xml', data: NUMS },
    ];
    if (avecLogo) files.push({ name: 'word/media/logo.png', data: L });
    return zip(files);
  }
  const slug = (s) => String(s || 'seance').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'seance';
  function telecharger(blob, nom) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* ---------- le contenu des documents ---------- */
  const W = 9638;   // largeur utile d'une page A4 à marges de 2 cm, en vingtièmes de point
  const titreGrille = ['Insuffisant', 'Fragile', 'Satisfaisant', 'Très bonne maîtrise'];
  function grilleXml(G, N) {
    if (!G || !G.length) return '';
    const w = [1900, 2338, 1350, 1350, 1350, 1350], c = (t, o) => para(run(t, Object.assign({ sz: 17 }, o || {})), { ap: 0 });
    return para(run('Grille d’évaluation par compétences'), { st: 'Heading1' }) + para(run(`${N.nom}. Une croix par ligne, au niveau observé pendant la séance.`, { sz: 19, c: '587083' }))
      + table(w, [{ tete: 1, c: ['Compétence', 'Indicateurs observés'].concat(titreGrille).map((t) => c(t, { b: 1 })) }].concat(G.map((g) => ({ c: [c(g.code, { b: 1 }) + c(g.intitule), g.indicateurs.map((i) => c('• ' + i)).join(''), ...g.niveaux.map((n) => c(n))] }))));
  }
  function ficheXml(F, N, comps, G) {
    const h1 = (t) => para(run(t), { st: 'Heading1' }), puces = (L) => L.map((x) => para(run(x), { st: 'ListParagraph', num: 1 })).join('');
    let x = table([1500, W - 1500], [{ c: [para(logoXml(756000, 604800), { ap: 0 }), para(run(LYCEE, { b: 1, sz: 20, c: '183047' }), { ap: 20 }) + para(run(`Sciences de l’ingénieur · ${N.nom}`, { sz: 18, c: '587083' }), { ap: 20 }) + para(run([F.duree && `Durée : ${F.duree}`, F.organisation && `Organisation : ${F.organisation}`].filter(Boolean).join(' · '), { sz: 18, c: '587083' }), { ap: 0 })] }], { sans: 1, centre: 1 });
    x += para(run(F.titre || 'La séance'), { st: 'Title' });
    x += para(run('Nom : ………………………   Prénom : ………………………   Classe : ………   Date : ………………', { sz: 19, c: '42596B' }), { ap: 160 });
    if (F.situation) x += h1('La situation') + para(run(F.situation), { fond: 'EEF4F8', ap: 120 });
    if (F.objectifs.length) x += h1('À la fin de la séance, vous saurez') + puces(F.objectifs);
    if (comps.length) x += h1('Les compétences travaillées') + table([1300, W - 1300], comps.map(([k, l]) => ({ c: [para(run(k, { b: 1, sz: 19 }), { ap: 0 }), para(run(l, { sz: 19 }), { ap: 0 })] })));
    if (F.materiel.length) x += h1('Le matériel') + puces(F.materiel);
    if (F.securite.length) x += h1('La sécurité') + F.securite.map((s) => para([run('⚠ ', { b: 1, c: 'C26A1B' }), run(s)], { cadre: 'C26A1B', fond: 'FFF8E6', ap: 0 })).join('') + para('', { ap: 60 });
    F.activites.forEach((A, k) => {
      x += h1(`Activité ${k + 1} · ${A.titre}${A.duree ? ` (${A.duree})` : ''}`) + puces(A.consignes);
      A.questions.forEach((q) => { x += para(run(q), { num: 2, keep: 1, ap: 40 }) + table([W], [{ c: [''], h: 420 }, { c: [''], h: 420 }], { lignes: 1 }); });
    });
    if (F.tableau && F.tableau.colonnes.length) {
      const n = F.tableau.colonnes.length, w = Array.from({ length: n }, (_, j) => (j < n - 1 ? Math.floor(W / n) : W - Math.floor(W / n) * (n - 1)));
      x += h1(F.tableau.titre || 'Vos relevés') + table(w, [{ tete: 1, c: F.tableau.colonnes.map((t) => para(run(t, { b: 1, sz: 19 }), { ap: 0, al: 'center' })) }].concat(Array.from({ length: F.tableau.lignes }, () => ({ c: F.tableau.colonnes.map(() => ''), h: 400 }))));
    }
    if (F.coups.length) x += h1('Coups de pouce') + F.coups.map((s, i) => para([run(`Coup de pouce ${i + 1} : `, { b: 1 }), run(s)], { fond: 'EAF7F1', ap: 60 })).join('');
    if (F.synthese) x += h1('La synthèse') + para(run(F.synthese), { cadre: '12566F', ap: 120 });
    if (F.criteres.length) x += h1('Vous avez réussi si…') + F.criteres.map((c) => para([run('☐  ', { c: '12566F' }), run(c)], { ap: 40 })).join('');
    if (G && G.length) x += para('<w:r><w:br w:type="page"/></w:r>') + grilleXml(G, N);
    return x;
  }

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('se-css')) return;
    const s = document.createElement('style'); s.id = 'se-css';
    s.textContent = `.se-src{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 2px}.se-src a{font-size:13px;border:1px solid #bbccd8;border-radius:999px;padding:5px 11px;text-decoration:none;color:inherit;background:#fff}.se-src a.on{border-color:#12566f;background:#e8f2f7;font-weight:700}
.se-comp{display:grid;gap:5px;margin:6px 0 10px}.se-comp label{display:flex;gap:8px;align-items:flex-start;font-size:14px;font-weight:400}.se-comp input{margin-top:3px}
.se-niv{width:100%;max-width:640px;box-sizing:border-box}.se-c textarea{width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px}.se-c select{font:inherit;padding:8px 10px;border:1px solid #bbccd8;border-radius:6px;background:#fff;max-width:100%}
.se-tab{display:grid;grid-template-columns:repeat(3,1fr);gap:0;background:#21412f;border:10px solid #8b6a45;border-radius:8px;color:#f4f4ee;font-family:'Comic Sans MS','Chalkboard SE','Segoe Print',cursive;margin:10px 0}.se-tab>div{padding:12px 14px;border-left:1px dashed #6d8b76;min-width:0}.se-tab>div:first-child{border-left:0}.se-tab b{display:block;color:#ffe9a8;margin-bottom:6px}.se-tab p{margin:0 0 6px;font-size:15px;line-height:1.35}
.se-dias{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin:10px 0}.se-dia{display:flex;flex-direction:column;gap:6px}
.se-slide{aspect-ratio:16/9;background:#fff;border:1px solid #c8d3dc;border-radius:8px;box-shadow:0 1px 3px rgba(24,48,71,.12);padding:6% 7%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;container-type:inline-size}.se-slide h3{margin:0 0 4%;color:#12566f;font-size:6.2cqw;line-height:1.15}.se-slide ul{margin:0;padding-left:5%;font-size:4.3cqw;line-height:1.35}.se-slide li{margin:0 0 2%}.se-slide .se-n{margin-top:auto;font-size:3cqw;color:#9fb3c2;text-align:right}
.se-notes{font-size:13px;color:#42596b;margin:0}
.se-show{position:fixed;inset:0;background:#0d1b28;z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2vh 2vw;cursor:pointer}.se-show .se-slide{width:min(96vw,calc(88vh*16/9));border:0;border-radius:4px}.se-ctl{color:#9fb3c2;font-size:14px;margin-top:10px;cursor:pointer}
.se-fiche{border:1px solid #c8d3dc;border-radius:10px;padding:18px 22px;background:#fff;margin:10px 0}.se-fiche h4{color:#12566f;margin:14px 0 4px}.se-fiche .se-sec{border:2px solid #c26a1b;background:#fff8e6;border-radius:6px;padding:6px 12px}.se-fiche .se-pouce{background:#eaf7f1;border-radius:6px;padding:6px 12px;margin:4px 0}.se-fiche .se-syn{border:2px solid #12566f;border-radius:6px;padding:8px 12px}
.se-ent{display:flex;gap:14px;align-items:center;border-bottom:2px solid #12566f;padding-bottom:8px;margin-bottom:8px}.se-ent img{width:64px;height:auto}.se-ent small{color:#587083;display:block}
.se-g{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}.se-g th,.se-g td{border:1px solid #c8d3dc;padding:6px 7px;vertical-align:top}.se-g th{background:#e9eef2;font-size:12px}.se-g td:first-child{min-width:150px}
.se-mes{border-collapse:collapse;margin:6px 0}.se-mes th,.se-mes td{border:1px solid #9fb3c2;min-width:70px;height:24px;padding:2px 8px;font-size:13px}.se-mes th{background:#e9eef2}
.se-wrap{max-width:100%;overflow-x:auto}
@media(max-width:640px){.se-tab{grid-template-columns:1fr}.se-tab>div{border-left:0;border-top:1px dashed #6d8b76}.se-tab>div:first-child{border-top:0}.se-fiche{padding:14px}}
@media print{body.se-p #app>*:not(.se-p-cible){display:none!important}.se-p-cache{display:none!important}.se-p-cible{box-shadow:none!important;border:0!important;padding:0!important}.se-slide{break-inside:avoid;page-break-inside:avoid;box-shadow:none}.se-dias{display:block}.se-dia{margin-bottom:12mm;break-inside:avoid}.se-g{font-size:9pt}.se-tab{break-inside:avoid}}`;
    document.head.appendChild(s);
  }
  // imprimer seulement le contenu produit d'une carte (le tableau et les diapositives, la fiche, la grille)
  function imprimer(carte) {
    const c = document.getElementById(carte); if (!c) return;
    const G = [...c.querySelectorAll('.se-p-garde')];
    const cache = [...c.querySelectorAll('*')].filter((el) => !G.some((g) => g === el || g.contains(el) || el.contains(g)));
    cache.forEach((el) => el.classList.add('se-p-cache'));
    document.body.classList.add('se-p'); c.classList.add('se-p-cible');
    let fini = false;
    const fin = () => { if (fini) return; fini = true; window.removeEventListener('afterprint', fin); document.body.classList.remove('se-p'); c.classList.remove('se-p-cible'); cache.forEach((el) => el.classList.remove('se-p-cache')); };
    window.addEventListener('afterprint', fin); window.print(); setTimeout(fin, 60000);
  }

  /* ---------- la page d'une séance ---------- */
  function page(src) {
    css();
    const D = charger(src);
    if (!D) { location.hash = '#admission-seance'; return; }
    const A = SE();
    if (!A[src] || typeof A[src] !== 'object') A[src] = { niv: D.niv, comp: D.comp, texte: D.texte, t: Date.now() };
    const S = A[src];
    if (!NIVX()[S.niv]) S.niv = D.niv;
    if (!Array.isArray(S.comp)) S.comp = [];
    const N = () => NIVX()[S.niv] || { nom: '', cadre: '', ref: [] };
    const refs = () => N().ref;
    const comps = () => S.comp.map((k) => refs().find((r) => r[0] === k)).filter(Boolean);
    const garder = () => { S.t = Date.now(); save(); };
    const put = (i, h) => { const el = document.getElementById(i); if (el) el.innerHTML = h; };
    const contexte = () => `## Le niveau\n${N().nom} ; ${N().cadre}.\n\n## Les compétences visées (intitulés officiels)\n${comps().map((r) => `- ${r[0]} : ${r[1]}`).join('\n') || '- aucune cochée : choisis-les dans la liste ci-dessous'}\n\n## La liste des compétences du référentiel\n${refs().map((r) => `- ${r[0]} : ${r[1]}`).join('\n')}\n\n## Le contexte\n${String(D.ctx || '—').slice(0, 3500)}\n\n## La séance écrite par le candidat\n${String(S.texte || '').trim().slice(0, 6000) || '(vide)'}`;
    const compHtml = () => `<div class="se-comp">${refs().map((r) => `<label><input type="checkbox" data-comp="${esc(r[0])}"${S.comp.includes(r[0]) ? ' checked' : ''}><span><b>${esc(r[0])}</b> · ${esc(r[1])}</span></label>`).join('')}</div>`;
    const autres = sources().map((x) => `<a href="#admission-seance-${x.id}"${x.id === src ? ' class="on"' : ''}>${esc(x.titre)}</a>`).join('');

    /* le plan de tableau et les diapositives */
    const diaHtml = (d, k, n) => `<div class="se-slide"><h3>${esc(d.titre)}</h3><ul>${d.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul><div class="se-n">${k + 1} / ${n}</div></div>`;
    function tabHtml() {
      const T = S.tab; if (!T) return '';
      return `<p class="muted">Le tableau de ton exposé, en trois colonnes ; préparé le ${date(T.t)}.</p><div class="se-tab se-p-garde">${T.colonnes.map((c) => `<div><b>${esc(c.titre)}</b>${c.lignes.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`).join('')}</div>
        <div class="se-dias se-p-garde">${T.diapos.map((d, k) => `<div class="se-dia">${diaHtml(d, k, T.diapos.length)}<p class="se-notes"><b>À dire :</b> ${esc(d.notes)}</p></div>`).join('')}</div>
        <div class="btns"><button class="b" type="button" data-se-show="0">Présenter en plein écran</button><button class="b sec" type="button" data-se-print="se-c1">Imprimer le tableau et les diapositives</button></div>`;
    }
    /* la fiche élève */
    function ficheHtml() {
      const F = S.fiche; if (!F) return '';
      const ul = (L) => `<ul>${L.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      let q = 0;
      return `<div class="se-fiche se-p-garde"><div class="se-ent"><img src="../assets/logo-papara.png" alt=""><div><b>${esc(LYCEE)}</b><small>Sciences de l’ingénieur · ${esc(N().nom)}${F.duree ? ` · durée : ${esc(F.duree)}` : ''}${F.organisation ? ` · ${esc(F.organisation)}` : ''}</small></div></div>
        <h3 style="margin:6px 0">${esc(F.titre)}</h3><p class="muted">Nom : ……………… Prénom : ……………… Classe : …… Date : ……</p>
        ${F.situation ? `<h4>La situation</h4><p>${esc(F.situation)}</p>` : ''}${F.objectifs.length ? `<h4>À la fin de la séance, vous saurez</h4>${ul(F.objectifs)}` : ''}
        ${comps().length ? `<h4>Les compétences travaillées</h4>${ul(comps().map((r) => `${r[0]} · ${r[1]}`))}` : ''}${F.materiel.length ? `<h4>Le matériel</h4>${ul(F.materiel)}` : ''}
        ${F.securite.length ? `<h4>La sécurité</h4><div class="se-sec">${ul(F.securite)}</div>` : ''}
        ${F.activites.map((A, k) => `<h4>Activité ${k + 1} · ${esc(A.titre)}${A.duree ? ` (${esc(A.duree)})` : ''}</h4>${A.consignes.length ? ul(A.consignes) : ''}${A.questions.map((x) => `<p><b>Q${++q}.</b> ${esc(x)}</p>`).join('')}`).join('')}
        ${F.tableau && F.tableau.colonnes.length ? `<h4>${esc(F.tableau.titre || 'Vos relevés')}</h4><div class="se-wrap"><table class="se-mes"><thead><tr>${F.tableau.colonnes.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: F.tableau.lignes }, () => '<tr>' + F.tableau.colonnes.map(() => '<td></td>').join('') + '</tr>').join('')}</tbody></table></div>` : ''}
        ${F.coups.length ? `<h4>Coups de pouce</h4>${F.coups.map((c, i) => `<p class="se-pouce"><b>Coup de pouce ${i + 1} :</b> ${esc(c)}</p>`).join('')}` : ''}
        ${F.synthese ? `<h4>La synthèse</h4><p class="se-syn">${esc(F.synthese)}</p>` : ''}${F.criteres.length ? `<h4>Vous avez réussi si…</h4>${F.criteres.map((c) => `<p style="margin:3px 0">☐ ${esc(c)}</p>`).join('')}` : ''}</div>
        <p class="muted">Rédigée par l’IA le ${date(F.t)} à partir de ta séance : relis-la et adapte-la à tes élèves avant de la distribuer.${S.grille && S.grille.length ? ' Le fichier Word contient aussi la grille d’évaluation, en deuxième page.' : ''}</p>
        <div class="btns"><button class="b" type="button" data-se-docx="fiche">Télécharger la fiche élève (Word)</button><button class="b sec" type="button" data-se-print="se-c2">Imprimer</button></div>`;
    }
    /* la grille d'évaluation */
    function grilleHtml() {
      const G = S.grille; if (!G || !G.length) return '';
      return `<div class="se-wrap se-p-garde"><table class="se-g"><thead><tr><th>Compétence</th><th>Indicateurs observés</th>${titreGrille.map((t) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${G.map((g) => `<tr><td><b>${esc(g.code)}</b><br>${esc(g.intitule)}</td><td>${g.indicateurs.map((i) => `• ${esc(i)}`).join('<br>')}</td>${g.niveaux.map((n) => `<td>${esc(n)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        ${S.grilleConseil ? `<p class="se-p-garde">${esc(S.grilleConseil)}</p>` : ''}<p class="muted">Construite par l’IA avec les intitulés officiels du référentiel ${esc(N().nom)}.</p>
        <div class="btns"><button class="b" type="button" data-se-docx="grille">Télécharger la grille (Word)</button><button class="b sec" type="button" data-se-print="se-c3">Imprimer</button></div>`;
    }

    app().innerHTML = `<a class="back" href="#admission-seance">← Les documents de la séance</a><div class="eyebrow">Agrégation SII · la séance</div><h1>${esc(D.titre)}</h1>
      <p>De ta séance écrite, le jury IA tire le plan de tableau et les diapositives de ton exposé, la fiche élève à distribuer (en Word, au logo du lycée) et la grille d’évaluation par compétences, avec les intitulés officiels du référentiel.</p>
      <nav class="se-src" aria-label="Autres séances">${autres}</nav>
      <div class="card se-c" style="margin-top:14px"><h2 style="margin:0 0 6px">Ta séance</h2>
        ${src !== 'libre' ? `<p class="muted" style="margin:0 0 8px">Reprise de ${src === 'lecon' ? 'ta leçon en cours' : 'la fiche de ton banc'} ; tu peux la retoucher ici sans changer l’original. <button class="b sec" type="button" data-se-reprendre="1">Reprendre le texte d’origine</button></p>` : ''}
        <label for="se-niv" style="font-weight:700;display:block;margin:4px 0">Niveau</label><select id="se-niv" class="se-niv" data-se-niv="1">${ORDRE.filter((k) => NIVX()[k]).map((k) => `<option value="${k}"${S.niv === k ? ' selected' : ''}>${esc(NIVX()[k].nom)}</option>`).join('')}</select>
        <p class="rl-l" style="font-weight:700;margin:12px 0 2px">Les compétences visées</p><p class="muted" style="margin:0">Le référentiel du niveau, intitulés officiels. Coche celles de la séance (deux à quatre).</p><div id="se-comp">${compHtml()}</div>
        <label for="se-texte" style="font-weight:700;display:block;margin:12px 0 4px">La séance</label><textarea id="se-texte" data-se-texte="1" rows="9" maxlength="8000" placeholder="Niveau, durée, organisation, activités des élèves minute par minute, protocole, évaluation…">${esc(S.texte || '')}</textarea>
        ${D.ctx ? `<details class="rl-dos" style="background:#f4f8fa;border-radius:8px;padding:8px 14px;margin:10px 0"><summary style="cursor:pointer;font-weight:700;color:#12566f">Ce que le jury IA sait aussi de ton travail</summary><p style="white-space:pre-wrap;font-size:14px">${esc(D.ctx)}</p></details>` : ''}</div>
      <div class="card se-c" id="se-c1" style="margin-top:16px"><h2 style="margin:0 0 6px">Le plan de tableau et les diapositives</h2><p class="muted" style="margin:0">Ce que tu écris au tableau pendant l’exposé, et quatre ou cinq diapositives avec ce que tu dis sur chacune.</p><div class="btns"><button class="b" type="button" data-se-go="tab">${S.tab ? 'Refaire le plan et les diapositives' : 'Préparer le plan et les diapositives'}</button></div><div id="se-r1" aria-live="polite">${tabHtml()}</div></div>
      <div class="card se-c" id="se-c3" style="margin-top:16px"><h2 style="margin:0 0 6px">La grille d’évaluation</h2><p class="muted" style="margin:0">Pour chaque compétence cochée : des indicateurs observables dans cette séance et quatre niveaux de maîtrise.</p><div class="btns"><button class="b" type="button" data-se-go="grille">${S.grille ? 'Refaire la grille' : 'Construire la grille'}</button></div><div id="se-r3" aria-live="polite">${grilleHtml()}</div></div>
      <div class="card se-c" id="se-c2" style="margin-top:16px"><h2 style="margin:0 0 6px">La fiche élève</h2><p class="muted" style="margin:0">Le document distribué aux élèves : situation, consignes, sécurité, questions avec des lignes pour répondre, tableau de relevés, coups de pouce, synthèse et critères de réussite. Elle reprend la grille si tu l’as construite.</p><div class="btns"><button class="b" type="button" data-se-go="fiche">${S.fiche ? 'Refaire la fiche élève' : 'Rédiger la fiche élève'}</button></div><div id="se-r2" aria-live="polite">${ficheHtml()}</div></div>`;
    if (window.ADMISSION_ORAL) ADMISSION_ORAL.micros(document.getElementById('se-texte').parentNode);

    const PROMPTS = {
      tab: () => `Tu es formateur pour l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Le candidat va présenter au jury la séance ci-dessous pendant son exposé (30 minutes en tout, dont une dizaine pour la séance). Prépare son plan de tableau et ses diapositives.

${contexte()}

## Consignes
1. "tableau" : trois colonnes. À gauche le cadre (niveau, place dans la séquence, problématique, compétences avec leur code) ; au centre le déroulé de la séance (phases, durées, organisation, activités des élèves) ; à droite l'évaluation, la différenciation et la synthèse attendue. Au plus sept lignes courtes par colonne, des mots-clés plutôt que des phrases.
2. "diapos" : quatre ou cinq diapositives pour exposer la séance, dans l'ordre. Chacune : "titre" (court), "points" (trois à cinq points courts), "notes" (ce que le candidat dit, deux phrases au plus, avec la durée conseillée).
3. Reste fidèle à sa séance ; s'il manque un élément attendu par le jury (critères de réussite, sécurité, protocole différent de celui de l'étude), ajoute-le et signale-le dans les notes. N'écris aucun nom d'élève. Français simple. Pas de Markdown.

Réponds en JSON : {"tableau": {"colonnes": [{"titre": "…", "lignes": ["…"]}]}, "diapos": [{"titre": "…", "points": ["…"], "notes": "…"}]}`,
      fiche: () => `Tu es professeur de sciences et techniques industrielles. Rédige la fiche élève de la séance ci-dessous : le document distribué aux élèves en début de séance.

${contexte()}

## Consignes
1. Écris pour les élèves du niveau indiqué, en vouvoyant, avec des phrases courtes ; n'écris aucun nom d'élève.
2. "titre" ; "duree" (par exemple « 2 h ») ; "organisation" (par exemple « en binômes ») ; "situation" : le problème posé aux élèves, en trois phrases au plus, concret et motivant ; "objectifs" : deux à quatre phrases qui commencent par un verbe.
3. "materiel" : la liste du matériel ; "securite" : deux à cinq consignes de sécurité précises (consignation, cordons de sécurité, mesures hors tension, catégorie des appareils…).
4. "activites" : trois à cinq activités dans l'ordre de la séance ; chacune : "titre", "duree", "consignes" (deux à quatre), "questions" (une à quatre questions précises, dont des questions de calcul ou d'interprétation).
5. "tableau" : le tableau de relevés que les élèves remplissent, {"titre": "…", "colonnes": ["grandeur (unité)", …] (deux à six), "lignes": nombre de lignes vides (trois à huit)} ; null s'il n'y a pas de mesure.
6. "coups_de_pouce" : deux ou trois aides graduées pour l'élève en difficulté ; "synthese" : la synthèse de la séance, une phrase ou deux, avec des pointillés « …… » à compléter ; "criteres" : trois à cinq critères de réussite que l'élève peut vérifier lui-même.
7. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"titre": "…", "duree": "…", "organisation": "…", "situation": "…", "objectifs": ["…"], "materiel": ["…"], "securite": ["…"], "activites": [{"titre": "…", "duree": "…", "consignes": ["…"], "questions": ["…"]}], "tableau": {"titre": "…", "colonnes": ["…"], "lignes": 5}, "coups_de_pouce": ["…"], "synthese": "…", "criteres": ["…"]}`,
      grille: () => `Tu es formateur pour l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Construis la grille d'évaluation par compétences de la séance ci-dessous.

${contexte()}

## Consignes
1. ${comps().length ? 'Une ligne par compétence cochée, avec son code exact.' : 'Aucune compétence n’est cochée : choisis deux ou trois compétences de la liste du référentiel, les plus pertinentes pour cette séance, avec leur code exact.'}
2. Pour chaque compétence : "indicateurs" : deux ou trois comportements ou productions observables dans CETTE séance ; "niveaux" : quatre descriptions courtes, dans l'ordre insuffisant, fragile, satisfaisant, très bonne maîtrise, une phrase chacune, concrètes et propres à la séance.
3. "conseil" : une phrase sur l'usage de la grille pendant la séance (formative, autoévaluation, évaluation entre pairs…).
4. Ne recopie pas l'intitulé de la compétence. Français simple. Pas de Markdown.

Réponds en JSON : {"grille": [{"code": "…", "indicateurs": ["…"], "niveaux": ["…", "…", "…", "…"]}], "conseil": "…"}`,
    };
    const LIRE = {
      tab: (r) => {
        const cols = (Array.isArray(r && r.tableau && r.tableau.colonnes) ? r.tableau.colonnes : []).slice(0, 3).map((c) => ({ titre: txt(c && c.titre, 80), lignes: liste(c && c.lignes, 7) })).filter((c) => c.titre || c.lignes.length);
        const dias = (Array.isArray(r && r.diapos) ? r.diapos : []).slice(0, 5).map((d) => ({ titre: txt(d && d.titre, 90), points: liste(d && d.points, 5), notes: txt(d && d.notes, 400) })).filter((d) => d.titre && d.points.length);
        if (!cols.length && !dias.length) throw new Error('réponse vide');
        S.tab = { t: Date.now(), colonnes: cols, diapos: dias };
      },
      fiche: (r) => {
        const A = (Array.isArray(r && r.activites) ? r.activites : []).slice(0, 5).map((a) => ({ titre: txt(a && a.titre, 100), duree: txt(a && a.duree, 30), consignes: liste(a && a.consignes, 5), questions: liste(a && a.questions, 4) })).filter((a) => a.titre);
        const T = r && r.tableau && Array.isArray(r.tableau.colonnes) ? { titre: txt(r.tableau.titre, 100), colonnes: liste(r.tableau.colonnes, 6).map((c) => c.slice(0, 40)), lignes: Math.max(3, Math.min(10, Math.round(+r.tableau.lignes) || 5)) } : null;
        const F = { t: Date.now(), titre: txt(r && r.titre, 120) || D.titre, duree: txt(r && r.duree, 30), organisation: txt(r && r.organisation, 80), situation: txt(r && r.situation, 900), objectifs: liste(r && r.objectifs, 4), materiel: liste(r && r.materiel, 10), securite: liste(r && r.securite, 5), activites: A, tableau: T && T.colonnes.length >= 2 ? T : null, coups: liste(r && r.coups_de_pouce, 3), synthese: txt(r && r.synthese, 600), criteres: liste(r && r.criteres, 5) };
        if (!A.length) throw new Error('réponse vide');
        S.fiche = F;
      },
      grille: (r) => {
        const R0 = refs(), G = (Array.isArray(r && r.grille) ? r.grille : []).map((g) => { const ref = R0.find((x) => String(x[0]).toLowerCase() === String(g && g.code || '').trim().toLowerCase()); return ref ? { code: ref[0], intitule: ref[1], indicateurs: liste(g.indicateurs, 3), niveaux: liste(g.niveaux, 4) } : null; }).filter((g) => g && g.niveaux.length === 4).slice(0, 5);
        if (!G.length) throw new Error('réponse vide');
        S.grille = G; S.grilleConseil = txt(r && r.conseil, 300);
      },
    };
    const OU = { tab: ['se-r1', tabHtml, 'Le jury prépare ton tableau et tes diapositives…'], fiche: ['se-r2', ficheHtml, 'Le jury rédige la fiche élève… (jusqu’à une minute)'], grille: ['se-r3', grilleHtml, 'Le jury construit la grille…'] };
    async function produire(k, bouton) {
      const [zone, html, msg] = OU[k];
      if (String(S.texte || '').trim().length < 40) { put(zone, '<p class="hint">Écris d’abord ta séance (quelques lignes au moins) dans le cadre « Ta séance ».</p>' + html()); return; }
      put(zone, `<div class="think">${msg}</div>`);
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { put(zone, '<p class="hint">L’IA n’est pas disponible pour l’instant.</p>' + html()); return; }
      try {
        const r = await s.json(PROMPTS[k]().slice(0, 39000), { cache: false, modelTier: 'complex' });
        LIRE[k](r); garder(); put(zone, html());
        if (bouton) bouton.textContent = { tab: 'Refaire le plan et les diapositives', fiche: 'Refaire la fiche élève', grille: 'Refaire la grille' }[k];
      } catch (e) { put(zone, `<p class="hint">${esc(erreurIA(e))}</p>` + html()); }
    }
    function presenter(i) {
      const L = (S.tab && S.tab.diapos) || []; if (!L.length) return;
      let k = i || 0;
      const ov = document.createElement('div'); ov.className = 'se-show'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Diapositives en plein écran');
      document.body.appendChild(ov);
      const voir = () => { ov.innerHTML = `${diaHtml(L[k], k, L.length)}<div class="se-ctl">${k + 1} / ${L.length} · clic ou → pour avancer, ← pour revenir · <u data-se-fin="1">quitter (Échap)</u></div>`; };
      const touche = (e) => { if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { k = Math.min(L.length - 1, k + 1); voir(); e.preventDefault(); } else if (['ArrowLeft', 'PageUp'].includes(e.key)) { k = Math.max(0, k - 1); voir(); e.preventDefault(); } else if (e.key === 'Escape') fin(); };
      function fin() { document.removeEventListener('keydown', touche); window.removeEventListener('hashchange', fin); ov.remove(); if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); }
      ov.onclick = (e) => { if (e.target.closest('[data-se-fin]')) { fin(); return; } if (k < L.length - 1) { k++; voir(); } else fin(); };
      document.addEventListener('keydown', touche); window.addEventListener('hashchange', fin);
      voir(); if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {});
    }
    async function word(quoi) {
      const N0 = N();
      if (quoi === 'grille') { const b = await docx('Grille d’évaluation', table([1500, W - 1500], [{ c: [para(logoXml(756000, 604800), { ap: 0 }), para(run(LYCEE, { b: 1, sz: 20, c: '183047' }), { ap: 20 }) + para(run(D.titre, { sz: 18, c: '587083' }), { ap: 0 })] }], { sans: 1, centre: 1 }) + grilleXml(S.grille, N0)); telecharger(b, `grille-${slug(D.titre)}.docx`); return; }
      const F = S.fiche; if (!F) return;
      const b = await docx(F.titre, ficheXml(F, N0, comps(), S.grille)); telecharger(b, `fiche-eleve-${slug(F.titre)}.docx`);
    }
    function reprendre() {
      const D2 = charger(src); if (!D2) return;
      S.texte = D2.texte; S.niv = D2.niv; S.comp = D2.comp; garder();
      const t = document.getElementById('se-texte'); if (t) t.value = S.texte;
      const n = document.getElementById('se-niv'); if (n) n.value = S.niv;
      put('se-comp', compHtml());
    }

    let tS = 0;
    app().oninput = (e) => { if (e.target.dataset.seTexte) { S.texte = e.target.value; clearTimeout(tS); tS = setTimeout(garder, 600); } };
    app().onchange = (e) => {
      const d = e.target.dataset || {};
      if (d.seNiv) { S.niv = e.target.value; S.comp = S.comp.filter((k) => refs().some((r) => r[0] === k)); garder(); put('se-comp', compHtml()); return; }
      if (d.comp) { const k = d.comp; S.comp = S.comp.filter((x) => x !== k); if (e.target.checked) S.comp.push(k); S.comp = refs().map((r) => r[0]).filter((x) => S.comp.includes(x)); garder(); return; }
      if (d.seTexte) { S.texte = e.target.value; garder(); }
    };
    app().onsubmit = (e) => e.preventDefault();
    app().onclick = (e) => {
      let b;
      if ((b = e.target.closest('[data-se-go]'))) { produire(b.dataset.seGo, b); return; }
      if ((b = e.target.closest('[data-se-show]'))) { presenter(+b.dataset.seShow); return; }
      if ((b = e.target.closest('[data-se-print]'))) { imprimer(b.dataset.sePrint); return; }
      if ((b = e.target.closest('[data-se-docx]'))) { word(b.dataset.seDocx); return; }
      if (e.target.closest('[data-se-reprendre]')) reprendre();
    };
  }

  /* ---------- le choix de la séance ---------- */
  function choix() {
    css();
    const L = sources();
    app().innerHTML = `<a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">Agrégation SII · la séance</div><h1>Les documents de la séance</h1>
      <p>Choisis la séance : celle de ta leçon en cours, celle d’une fiche de tes bancs du labo, ou une séance que tu écris ici. Le jury IA en tire le plan de tableau et les diapositives de ton exposé, la fiche élève (Word, au logo du lycée) et la grille d’évaluation par compétences.</p>
      <div class="or-tuiles" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:14px 0">${L.map((x) => `<a class="or-t" href="#admission-seance-${x.id}" style="display:block;text-decoration:none;color:inherit;border:1px solid #c8d3dc;border-radius:10px;padding:12px 14px;background:#fff"><b style="color:#12566f;display:block">${esc(x.titre)}</b><small style="color:#587083">${esc(x.sous)}${x.vide ? ' · séance pas encore écrite' : ''}</small></a>`).join('')}</div>`;
    app().onclick = null; app().oninput = null; app().onchange = null;
  }
  function carte() {
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Les documents de la séance</h2><p class="muted" style="margin:0 0 8px">De la séance que tu as écrite (leçon ou banc du labo) : le plan de tableau et les diapositives de l’exposé, la fiche élève en Word au logo du lycée, la grille d’évaluation tirée du référentiel.</p><div class="btns"><a class="b" href="#admission-seance">Préparer les documents d’une séance</a></div></div>`;
  }
  const gere = (h) => /^admission-seance(-.+)?$/.test(h);
  function route(h) {
    const m = /^admission-seance-(.+)$/.exec(h);
    if (m) return page(m[1]);
    choix();
  }
  window.ADMISSION_SEANCE = { route, gere, carte, docx, zip, crc32, ficheXml, grilleXml };
})();
