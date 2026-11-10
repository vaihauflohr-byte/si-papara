"""Vérification d'une notion v2 : champs, textes, diagnostics, et recalcul indépendant des réponses à partir des données (don)."""
import json, re, math, sys
from collections import Counter
from playwright.sync_api import sync_playwright
B="http://localhost:8765/"
JS = r"""
([key,N]) => { const txt=h=>String(h==null?"":h).replace(/<span class="sr">[^<]*<\/span>/g,"/").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const P=POOLS[key], out=[];
  for(const l of [1,2,3]) P[l].forEach((g,i)=>{ for(let t=0;t<N;t++){ let arr; try{ arr=genGroup(key,l,i); }catch(e){ out.push({l,i,err:String(e)}); continue; }
    out.push({l,i,svg:/v-curve/.test(arr[0].fig||"")?arr[0].fig:"",qs:arr.map(q=>({q:txt(q.q),don:q.don||"",type:q.type,ans:q.ans,unit:q.unit,ch:q.ch&&q.ch.map(txt),ok:q.ok,why:q.why||null,
      diag:(q.diag||[]).map(d=>({v:d.v,m:txt(d.m),hit:BACSI_V2.numOk(q,d.v)})),expl:txt(q.expl),fig:txt(q.fig),modele:txt(q.modele),iaPlus:q.iaPlus||"",elements:q.elements||null,
      phr:q.phr?{txt:txt(q.phr.map(x=>typeof x==="string"?x:x.o[x.ok]).join("")),gaps:q.phr.filter(x=>typeof x!=="string").map(x=>({o:x.o,ok:x.ok,m:x.m||""}))}:null,
      all:txt([q.q,q.expl,q.lire,(q.met||[]).join(" "),q.piege,q.ret,(q.diag||[]).map(d=>d.m).join(" "),(q.ch||[]).join(" "),(q.why||[]).join(" "),q.fig,q.modele,q.iaPlus,(q.elements||[]).map(e=>e.t).join(" "),(q.phr||[]).map(x=>typeof x==="string"?x:x.o.join(" ")+" "+(x.m||"")).join(" "),q.ctx0,q.ctx].join(" ")),
      self:q.type==="num"?BACSI_V2.numOk(q,Number(Number(q.ans).toPrecision(3))):true,has:{lire:!!q.lire,met:!!(q.met&&q.met.length),piege:!!q.piege,ret:!!q.ret}}))}); } });
  return out; }
"""
num=lambda s: float(re.sub(r"\s","",str(s)).replace("−","-").replace(",","."))
X=r"(\d[\d\s]*(?:,\d+)?)"
def g(pat, s, k=1):
    m=re.search(pat, s); assert m, (pat, s); return num(m.group(k))
def close(a,b,tol=2e-3): return abs(a-b)<=tol*max(1e-9,abs(b))
def lire_courbe(svg):
    """Relit la courbe comme un élève : graduations des axes -> coordonnées des points du tracé."""
    xt=[(float(x),num(t)) for x,y,t in re.findall(r'<text x="([\d.]+)" y="([\d.]+)" class="v-lab s" text-anchor="middle">([^<]+)</text>', svg)]
    yt=[(float(y)-4.5,num(t)) for x,y,t in re.findall(r'<text x="([\d.]+)" y="([\d.]+)" class="v-lab s" text-anchor="end">([^<]+)</text>', svg)]
    fx=lambda p:(p-xt[0][0])/(xt[-1][0]-xt[0][0])*(xt[-1][1]-xt[0][1])+xt[0][1]; fy=lambda p:(p-yt[0][0])/(yt[-1][0]-yt[0][0])*(yt[-1][1]-yt[0][1])+yt[0][1]
    pl=re.search(r'<polyline points="([^"]+)" class="v-curve"', svg).group(1)
    return [(fx(float(a)),fy(float(b))) for a,b in (p.split(",") for p in pl.split())], xt, yt
def run(key, recalc, N, neuf=lambda L,i: True):
    errs=[]; n=0; stats={}
    def chk(c, msg):
        if not c: errs.append(msg)
    def concl(q, oui, pos, neg, w, mots=None):
        t=q["modele"] if q["type"]=="red" else q["phr"]["txt"]
        chk((pos in t and neg not in t) if oui else (neg in t), w+" conclusion contraire au recalcul : "+t[:120])
        if mots: chk((mots[0] in t and mots[1] not in t) if oui else (mots[1] in t and mots[0] not in t), w+" comparaison contraire au recalcul : "+t[:120])
        if q["type"]=="red":
            e=q["elements"][-1]["t"]; chk((pos in e and neg not in e) if oui else (neg in e), w+" barème contraire au recalcul")
            c=q["ch"][q["ok"]]; chk((pos in c and neg not in c) if oui else (neg in c), w+" choix de repli contraire au recalcul")
    with sync_playwright() as p:
        b=p.chromium.launch(); pg=b.new_page(); pe=[]; pg.on("pageerror", lambda e: pe.append(str(e)[:160]))
        pg.goto(B+"entrainements/"+__import__("os").environ.get("PAGE","bac-si-essai.html")+""); pg.wait_for_timeout(1200); R=pg.evaluate(JS, [key,N]); b.close()
    print("erreurs JS de page :", pe[:3])
    for r in R:
        L,i=r["l"],r["i"]; k=f"N{L} g{i}"
        if "err" in r: errs.append(f"{k} exception {r['err']}"); continue
        Q=r["qs"]; n+=len(Q); stats[k]=stats.get(k,0)+1; v2=neuf(L,i)
        for j,q in enumerate(Q):
            w=f"{k} q{j}"; m=re.search(r".{0,30}(undefined|NaN|÷|Infinity|\[object).{0,20}", q["all"]); chk(not m, w+" texte suspect : "+(m.group(0) if m else ""))
            if v2:
                chk(all(q["has"].values()), w+" champ de correction manquant"); chk(bool(q["don"]), w+" don manquant")
            if q["type"]=="num":
                chk(isinstance(q["ans"],(int,float)) and math.isfinite(q["ans"]) and q["ans"]>0, w+f" ans {q['ans']}"); chk(q["self"], w+" la valeur à 3 chiffres n'est pas acceptée")
                for dg in q["diag"]: chk(not dg["hit"], w+f" diag = bonne réponse ({dg['v']} / {q['ans']})")
                if v2: chk(len(q["diag"])>=1, w+" aucun diagnostic")
            elif q["type"]=="trous":
                P=q["phr"]; chk(P and len(P["gaps"])>=2, w+" trous : moins de 2 éléments")
                for gp in (P["gaps"] if P else []): chk(len(gp["o"])>=2 and len(set(gp["o"]))==len(gp["o"]) and 0<=gp["ok"]<len(gp["o"]) and gp["m"], w+" trou mal formé")
            if q["type"]=="red":
                E=q["elements"]; chk(E and len(E)>=3 and all(e.get("t") and e.get("p") for e in E), w+" barème de rédaction"); chk(len(q["modele"])>40 and q["iaPlus"], w+" modèle ou complément IA manquant")
            if q["type"] in ("ch","red"):
                chk(len(set(q["ch"]))==len(q["ch"]), w+" choix en double"); chk(0<=q["ok"]<len(q["ch"]), w+" indice de la bonne réponse")
                if v2: chk(q["why"] and q["why"][q["ok"]]=="" and all(x for t,x in enumerate(q["why"]) if t!=q["ok"]), w+" why")
        if v2:
            try: recalc(L,i,Q,Q[0]["don"],[q["ans"] for q in Q],chk,concl,k,r["svg"])
            except AssertionError as e: errs.append(f"{k} lecture des données : {e}")
    print("générateurs :", len(stats), "| tirages :", sum(stats.values()), "| questions :", n)
    c=Counter(re.sub(r"[\d,\.]+","#",e)[:120] for e in errs); print("ERREURS :", len(errs)); [print("  ",a,"×",b) for a,b in c.most_common(25)]
    if errs: print("exemple :", errs[0][:400])
    return errs
