#!/usr/bin/env python3
"""Fabrique entrainements/bac-si-essai.html : la page d'entraînement du site + l'affichage v2 (documents, correction détaillée)
+ les notions réécrites (v2/<notion>.js). Usage : python3 build_essai.py <bac-si.html> <sortie.html>"""
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
# 4. correction détaillée et diagnostic
rep1('<p>${q.expl}</p>${extra}</div>`;', '${corrHTML(q,ok,st.repX)}${extra}</div>`; st.repX=null;')
rep1('feedback(k===q.ok,q.ch[q.ok],q.ch[k]);', 'st.repX={k}; feedback(k===q.ok,q.ch[q.ok],q.ch[k]);')
rep1('  feedback(ok,`${nf(shown,4).replace(/^-/,"−")}', '  st.repX={v}; feedback(ok,`${nf(shown,4).replace(/^-/,"−")}')
rep1('<div class="fb ${x.ok?"ok":"ko"}"><p>${x.q.expl}</p></div>', '<div class="fb ${x.ok?"ok":"ko"}">${corrHTML(x.q,x.ok,null)}</div>')
# 4 bis. rappel des résultats précédents : en court quand la question donne un nom à sa grandeur (champ nom)
rep1('    return `<li>${txt} : <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`; });', '    return p.nom?`<li>${p.nom} = <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`:`<li>${txt} : <b>${nf(a,4)}${p.unit?" "+p.unit:""}</b></li>`; });')
rep1('  return `<div class="rappel"><span class="rp-t">On prendra, d\'après ${items.length>1?"les questions précédentes":"la question précédente"}</span><ul>${items.join("")}</ul></div>`;', '  const court=parts.filter(p=>p.type!=="ch"&&typeof p.ans==="number"&&isFinite(p.ans)).every(p=>p.nom);\n  return `<div class="rappel${court?" court":""}"><span class="rp-t">${court?"Pour la suite, on prendra":"On prendra, d\'après "+(items.length>1?"les questions précédentes":"la question précédente")}</span><ul>${items.join("")}</ul></div>`;')
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
# 7. page d'essai : rien n'est transmis, bandeau
rep1('<script src="../assets/pont-bac.js"></script>', '<script>/* page d\'essai : les résultats ne partent pas dans le suivi */ (function(){ var b=document.getElementById("sip-bandeau"); if(b){ b.hidden=false; b.className="essai-b"; b.innerHTML="<b>Page d\'essai</b> · nouvelle présentation de la notion « Transmetteurs ». Rien n\'est transmis au professeur. <a href=\\"#n=meca-transmission\\">Ouvrir la notion</a>"; document.body.insertBefore(b,document.body.firstChild); } })();</script>')
rep1('<title>Bac SI · entraînement</title>', '<title>Bac SI · page d\'essai</title><meta name="robots" content="noindex">')
if "--debug" in sys.argv:   # copie de test seulement : accès à la question en cours (jamais sur le site)
    rep1('window.BACSI_V2={numOk:(q,v)=>numOk(q,v),corrDiag,corrHTML};', 'window.BACSI_V2={numOk:(q,v)=>numOk(q,v),corrDiag,corrHTML,cur:()=>{ const q=st&&st.qs&&st.qs[st.i]; return q?{type:q.type,ans:q.ans,ok:q.ok,ch:q.ch,diag:(q.diag||[]).map(d=>d.v)}:null; }};')
open(out, "w", encoding="utf-8").write("\n".join(L))
print("écrit", out, len("\n".join(L)) // 1024, "ko")
