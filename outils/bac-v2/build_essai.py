#!/usr/bin/env python3
"""Fabrique entrainements/bac-si-essai.html : la page d'entraînement du site + l'affichage v2 (documents, correction détaillée)
+ les notions réécrites (v2/<notion>.js). Usage : python3 build_essai.py <bac-si.html> <sortie.html> [--prod]
Avec --prod : la vraie page des élèves (pont-bac.js gardé, pas de bandeau d'essai). Voir LISEZMOI.md."""
import sys, pathlib, re
src, out = sys.argv[1], sys.argv[2]
V = pathlib.Path(__file__).resolve().parent
L = open(src, encoding="utf-8").read().split("\n")
def find(pred, start=0, what=""):
    for i in range(start, len(L)):
        if pred(L[i]): return i
    raise SystemExit("introuvable : " + what)
def rep1(old, new, count=1):
    global L
    s = "\n".join(L); n = s.count(old)
    if n != count: raise SystemExit(f"remplacement attendu {count} fois, trouvé {n} : {old[:70]}")
    L = s.replace(old, new).split("\n")

# 1. styles
i = find(lambda l: l.strip() == "</style>", what="</style>")
L[i:i] = open(V / "essai.css", encoding="utf-8").read().rstrip("\n").split("\n")
# 2. outils v2, avant le premier réservoir
i = find(lambda l: l.startswith("/* Réservoirs : actions mécaniques (meca-actions)"), what="premier réservoir")
L[i:i] = open(V / "docs.js", encoding="utf-8").read().rstrip("\n").split("\n") + [""]
# 2 bis. correction détaillée et zoom : dans le bloc de l'application (accès à numOk)
i = find(lambda l: l.startswith("/* ===== application ===== */"), what="application")
assert L[i+1].strip() == "(function(){", L[i+1]
L[i+2:i+2] = open(V / "app.js", encoding="utf-8").read().rstrip("\n").split("\n") + [""]
# 3. notion Transmetteurs : à la fin de son bloc (accès aux dessins de mécanismes)
i = find(lambda l: l.startswith('POOLS["meca-transmission"]={'), what="réservoir transmission")
j = find(lambda l: l.strip() == "})();", i, "fin du bloc transmission")
L[j:j] = open(V / "meca-transmission.js", encoding="utf-8").read().rstrip("\n").split("\n") + [""]
# 3 bis. autres notions réécrites : chacune à la fin du bloc qui contient déjà son réservoir et ses dessins
for cle, fichier in (("meca-cinematique", "meca-cinematique.js"), ("phy-newton", "phy-newton.js")):
    if not (V / fichier).exists(): continue
    i = find(lambda l: l.startswith('POOLS["%s"]={' % cle), what="réservoir " + cle)
    j = find(lambda l: l.strip() == "})();", i, "fin du bloc " + cle)
    L[j:j] = open(V / fichier, encoding="utf-8").read().rstrip("\n").split("\n") + [""]
# un générateur disparu (révision gardée d'une ancienne version) : on en tire un autre du même niveau
rep1('const r=POOLS[key][l][i](), arr=Array.isArray(r)?r:[r];', 'const G=POOLS[key][l], r=(G[i]||G[Math.floor(Math.random()*G.length)])(), arr=Array.isArray(r)?r:[r];')
# 4. correction détaillée et diagnostic
rep1('<p>${q.expl}</p>${extra}</div>`;', '${corrHTML(q,ok,st.repX)}${extra}</div>`; st.repX=null;')
rep1('feedback(k===q.ok,q.ch[q.ok],q.ch[k]);', 'st.repX={k}; feedback(k===q.ok,q.ch[q.ok],q.ch[k]);')
rep1('  feedback(ok,`${nf(shown,4).replace(/^-/,"−")}', '  st.repX={v}; feedback(ok,`${nf(shown,4).replace(/^-/,"−")}')
rep1('<div class="fb ${x.ok?"ok":"ko"}"><p>${x.q.expl}</p></div>', '<div class="fb ${x.ok?"ok":"ko"}">${corrHTML(x.q,x.ok,null)}</div>')
# 4 bis. rappel des résultats précédents : en court quand la question donne un nom à sa grandeur (champ nom)
rep1('    return `<li>${txt} : <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`; });', '    return p.nom?`<li>${p.nom} = <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`:`<li>${txt} : <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`; });')
rep1('  return `<div class="rappel"><span class="rp-t">On prendra, d\'après ${items.length>1?"les questions précédentes":"la question précédente"}</span><ul>${items.join("")}</ul></div>`;', '  const court=parts.filter(p=>p.type!=="ch"&&typeof p.ans==="number"&&isFinite(p.ans)).every(p=>p.nom);\n  return `<div class="rappel${court?" court":""}"><span class="rp-t">${court?"Pour la suite, on prendra":"On prendra, d\'après "+(items.length>1?"les questions précédentes":"la question précédente")}</span><ul>${items.join("")}</ul></div>`;')
# 4 ter. réponses rédigées (types "trous" et "red"), pénalité partielle, en-tête de correction
rep1('function feedback(ok,correctTxt,rep){', 'function feedback(ok,correctTxt,rep,o){ o=o||{};')
rep1('if(!ok) st.note=Math.max(0,st.note-2);', '{ const pen=o.pen!=null?o.pen:(ok?0:2); if(pen) st.note=Math.max(0,st.note-pen); }')
rep1('$("#fb").innerHTML=`<div class="fb ${ok?"ok":"ko"}"><span class="t">${ok?"Exact":"Faux · −2 points"}</span>${ok?"":`<p>Réponse attendue : <b>${correctTxt}</b></p>`}', '$("#fb").innerHTML=`<div class="fb ${o.cls||(ok?"ok":"ko")}"><span class="t">${o.tete||(ok?"Exact":"Faux · −2 points")}</span>${ok||o.sansAttendu?"":`<p>${o.attendu||"Réponse attendue"} : <b>${correctTxt}</b></p>`}${o.avant||""}')
rep1('  else ans=`<div class="num"><input id="ans" type="text" inputmode="decimal" autocomplete="off" aria-label="Ta réponse"${q.unit?"":\' placeholder="ex. 0,35"\'}>${q.unit?`<span class="u">${q.unit}</span>`:""}<button class="btn primary" id="val" type="button">Valider</button></div><div class="warnmsg" id="wm" hidden></div>`;\n  const title=P?', '  else if(q.type==="red"||q.type==="trous") ans=ansV2(q);\n  else ans=`<div class="num"><input id="ans" type="text" inputmode="decimal" autocomplete="off" aria-label="Ta réponse"${q.unit?"":\' placeholder="ex. 0,35"\'}>${q.unit?`<span class="u">${q.unit}</span>`:""}<button class="btn primary" id="val" type="button">Valider</button></div><div class="warnmsg" id="wm" hidden></div>`;\n  const title=P?')
rep1('  else { $("#ans").focus({preventScroll:true}); $("#val").onclick=answerNum; }', '  else if(q.type==="red") $("#val").onclick=answerRed;\n  else if(q.type==="trous") $("#val").onclick=answerTrous;\n  else { $("#ans").focus({preventScroll:true}); $("#val").onclick=answerNum; }')
rep1('<div class="hintk">${q.type==="ch"?"Touches 1 à "+q.ch.length+" pour répondre.":"Donne 3 chiffres significatifs (virgule ou point). Entrée pour valider."}</div>', '<div class="hintk">${q.type==="ch"?"Touches 1 à "+q.ch.length+" pour répondre.":q.type==="red"?"Comme sur une copie : une conclusion sans valeurs ne rapporte pas tous les points.":q.type==="trous"?"Choisis chaque élément de la phrase, puis valide.":"Donne 3 chiffres significatifs (virgule ou point). Entrée pour valider."}</div>')
rep1('rep:txt(r.rep).slice(0,80),attendu:txt(r.correct).slice(0,120)', 'rep:txt(r.rep).slice(0,r.q.type==="red"?500:r.q.type==="trous"?300:80),attendu:txt(r.correct).slice(0,r.q.type==="red"||r.q.type==="trous"?300:120)')
rep1('attendu:q.type==="ch"?txt(q.ch[q.ok]):shownAns(q)', 'attendu:txt(attenduTxt(q))')
# sujet blanc : les rédactions y passent en choix multiple, les phrases à compléter n'y sont pas tirées
rep1('    const arr=genGroup(key,lv,pickGen(key,lv));\n    if(qs.length+arr.length>BL_N+1) continue;', '    const arr=genGroup(key,lv,pickGen(key,lv));\n    arr.forEach(q=>{ if(q.type==="red"&&q.ch) q.type="ch"; }); if(arr.some(q=>q.type==="red"||q.type==="trous")) continue;\n    if(qs.length+arr.length>BL_N+1) continue;')
# 4 quater. difficulté selon le niveau, étude finale après un sans-faute
rep1('function drawFrom(key){\n  const P=POOLS[key], cnt=P.count||{1:4,2:4,3:3}', 'function drawFrom(key,c){\n  const P=POOLS[key], cnt=c||P.count||{1:4,2:4,3:3}')
rep1('se.b=()=>drawFrom(key);', 'se.b=c=>drawFrom(key,c);')
rep1('  st={mode:"s",id,k,r:byId[id],M,S:M.series[k],qs:M.series[k].b(),i:0,note:20,res:[],answered:false,m0:mastery(id),t0:Date.now()};', '  const m0=mastery(id), fort=!!(M.series[k].key&&POOLS[M.series[k].key]&&POOLS[M.series[k].key].v2&&m0!=null&&m0>=.8);\n  st={mode:"s",id,k,r:byId[id],M,S:M.series[k],qs:M.series[k].b(fort?SERIE_FORTE:undefined),i:0,note:20,res:[],answered:false,m0,fort,t0:Date.now()};')
rep1('  else if(st.i>=st.qs.length) return end();\n  draw(); window.scrollTo({top:0,behavior:"smooth"});', '  else if(st.i>=st.qs.length&&!merite()) return end();\n  draw(); window.scrollTo({top:0,behavior:"smooth"});')
rep1('      ${q.ctx0?`<div class="ctx">${q.ctx0}</div>`:""}${q.ctx?`<div class="ctx">${q.ctx}</div>`:""}${rappelPrecedent(st.qs,st.i)}\n      <div class="qlabel">Question <span class="lvq" data-l="${q.lv||1}" title="Niveau ${q.lv||1} sur 3"><i></i><i></i><i></i></span>${LVN[q.lv||1]}${q.retry?', '      ${banniereV2(q)}${q.ctx0?`<div class="ctx">${q.ctx0}</div>`:""}${q.ctx?`<div class="ctx">${q.ctx}</div>`:""}${rappelPrecedent(st.qs,st.i)}\n      <div class="qlabel">Question <span class="lvq" data-l="${q.lv||1}" title="Niveau ${q.lv||1} sur 3"><i></i><i></i><i></i></span>${LVN[q.lv||1]}${q.retry?')
rep1('  $("#nx").hidden=false; $("#next").onclick=next; $("#next").focus({preventScroll:true});\n  const sc=app.querySelector(".note b");', '  $("#nx").hidden=false; $("#next").onclick=next; $("#next").focus({preventScroll:true});\n  if(st.i+1>=st.qs.length&&meriteDispo()) $("#next").textContent="Étude finale : mérite ton 20 →";\n  const sc=app.querySelector(".note b");')
rep1('<div class="verdict ${cls}">${verdict}</div>\n      <p>${st.res.length-errs.length} bonne', '<div class="verdict ${cls}">${verdict}</div>${st.merite?`<p><b>${note===20?"20 mérité : sans-faute, étude finale comprise.":"L\'étude finale a fait la différence : c\'est elle qui sépare un 20 d\'une très bonne note."}</b></p>`:""}\n      <p>${st.res.length-errs.length} bonne', 2)
# 5. documents : cadre sans quadrillage autour des documents
s = "\n".join(L); n = s.count('<div class="figbox">${fig}</div>')
if n < 2: raise SystemExit("figbox : %d" % n)
L = s.replace('<div class="figbox">${fig}</div>', '<div class="figbox${/class="doc"/.test(fig)?" docs":""}">${fig}</div>').split("\n")
# 5 bis. téléphone : une figure à la fois
rep1('  $("#quit").onclick=()=>{ if(P){ st.retries.forEach(saveRev); home(); }', '  d2Tabs(q);\n  $("#quit").onclick=()=>{ if(P){ st.retries.forEach(saveRev); home(); }')
rep1('sigCur=()=>sigData(q,null,"blanc","bac-blanc"); sigFill();', 'sigCur=()=>sigData(q,null,"blanc","bac-blanc"); sigFill(); d2Tabs(q);')
# 6. données des figures dans le suivi du professeur et les signalements
rep1('q:txt((r.q.ctx?r.q.ctx+" · ":"")+r.q.q).slice(0,400)', 'q:txt((r.q.ctx?r.q.ctx+" · ":"")+r.q.q+(r.q.don?" [figures : "+r.q.don+"]":"")).slice(0,400)')
rep1('+(q.data?"\\nDonnées : "+txt(q.data):"")+ch', '+(q.data?"\\nDonnées : "+txt(q.data):"")+(q.don?"\\nDonnées des figures : "+q.don:"")+ch')
# 7. page d'essai : rien n'est transmis, bandeau. Avec --prod (la vraie page des élèves), on garde pont-bac.js, qui envoie les résultats.
if "--prod" not in sys.argv:
    rep1('<script src="../assets/pont-bac.js"></script>', '<script>/* page d\'essai : les résultats ne partent pas dans le suivi */ (function(){ var b=document.getElementById("sip-bandeau"); if(b){ b.hidden=false; b.className="essai-b"; b.innerHTML="<b>Page d\'essai</b> · nouvelle présentation des notions du DS 04. Rien n\'est transmis au professeur. <a href=\\"#n=meca-transmission\\">Transmetteurs</a> · <a href=\\"#n=meca-cinematique\\">Cinématique</a> · <a href=\\"#n=phy-newton\\">2e loi de Newton</a>"; document.body.insertBefore(b,document.body.firstChild); } })();</script>')
    rep1('<title>Bac SI · entraînement</title>', '<title>Bac SI · page d\'essai</title><meta name="robots" content="noindex">')
# barème affiché en bas de page : rédaction et étude finale
rep1('Barème : la note part de 20 et perd 2 points par réponse fausse.', 'Barème : la note part de 20 et perd 2 points par réponse fausse ; une réponse rédigée incomplète perd 1 point. Après un sans-faute sur une notion réécrite, une étude finale s\'ajoute : il faut la réussir pour garder 20.')
if "--debug" in sys.argv:   # copie de test seulement : accès à la question en cours (jamais sur le site)
    rep1('window.BACSI_V2={numOk:(q,v)=>numOk(q,v),corrDiag,corrHTML};', 'window.BACSI_V2={numOk:(q,v)=>numOk(q,v),corrDiag,corrHTML,cur:()=>(st&&st.qs&&st.qs[st.i])||null,etat:()=>st?{note:st.note,i:st.i,n:st.qs.length,fort:!!st.fort,merite:!!st.merite,mode:st.mode}:null};')
open(out, "w", encoding="utf-8").write("\n".join(L))
print("écrit", out, len("\n".join(L)) // 1024, "ko")
