import json, re, math, sys
from playwright.sync_api import sync_playwright
B="http://localhost:8765/"; N=int(sys.argv[1]) if len(sys.argv)>1 else 300
JS = r"""
(N) => { const txt=h=>String(h==null?"":h).replace(/<span class="sr">[^<]*<\/span>/g,"/").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const P=POOLS["meca-transmission"], out=[];
  for(const l of [1,2,3]) P[l].forEach((g,i)=>{ for(let t=0;t<N;t++){ let arr; try{ arr=genGroup("meca-transmission",l,i); }catch(e){ out.push({l,i,err:String(e)}); continue; }
    out.push({l,i,qs:arr.map(q=>({q:txt(q.q),don:q.don,type:q.type,ans:q.ans,unit:q.unit,tolR:q.tolR,tolA:q.tolA,ch:q.ch&&q.ch.map(txt),ok:q.ok,why:q.why,
      diag:(q.diag||[]).map(d=>({v:d.v,m:txt(d.m),hit:BACSI_V2.numOk(q,d.v)})),expl:txt(q.expl),fig:txt(q.fig),modele:txt(q.modele),iaPlus:q.iaPlus||"",elements:q.elements||null,phr:q.phr?{txt:txt(q.phr.map(x=>typeof x==="string"?x:x.o[x.ok]).join("")),gaps:q.phr.filter(x=>typeof x!=="string").map(x=>({o:x.o,ok:x.ok,m:x.m||""}))}:null,all2:txt([q.modele,q.iaPlus,(q.elements||[]).map(e=>e.t).join(" "),(q.phr||[]).map(x=>typeof x==="string"?x:x.o.join(" ")+" "+(x.m||"")).join(" ")].join(" ")),all:txt([q.q,q.expl,q.lire,(q.met||[]).join(" "),q.piege,q.ret,(q.diag||[]).map(d=>d.m).join(" "),(q.ch||[]).join(" "),(q.why||[]).join(" "),q.fig].join(" ")),
      self:q.type==="num"?BACSI_V2.numOk(q,Number(Number(q.ans).toPrecision(3))):true,has:{lire:!!q.lire,met:!!(q.met&&q.met.length),piege:!!q.piege,ret:!!q.ret}}))}); } });
  return out; }
"""
num=lambda s: float(s.replace(" ","").replace(" ","").replace(" ","").replace(",","."))
def g(pat, s, k=1):
    m=re.search(pat, s); assert m, (pat, s); return num(m.group(k))
X=r"([\d   ]*\d(?:,\d+)?)"
errs=[]; n=0
def close(a,b,tol=2e-3): return abs(a-b)<=tol*max(1e-9,abs(b))
def chk(c, msg):
    if not c: errs.append(msg)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pe=[]; pg.on("pageerror", lambda e: pe.append(str(e)[:160]))
    pg.goto(B+"entrainements/"+__import__("os").environ.get("PAGE","bac-si-essai.html")+""); pg.wait_for_timeout(1200)
    R=pg.evaluate(JS, N); b.close()
print("erreurs JS de page :", pe[:3])
stats={}
for r in R:
    key=f"N{r['l']} g{r['i']}"
    if "err" in r: errs.append(f"{key} exception {r['err']}"); continue
    Q=r["qs"]; n+=len(Q); stats[key]=stats.get(key,0)+1; d=Q[0]["don"]
    for k,q in enumerate(Q):
        w=f"{key} q{k}"
        chk(q["has"]["lire"] and q["has"]["met"] and q["has"]["piege"] and q["has"]["ret"], w+" champ de correction manquant")
        q["all"]=q["all"]+" "+q["all2"]
        chk(not re.search(r"undefined|NaN|÷|Infinity|\[object", q["all"]), w+" texte suspect : "+(re.search(r".{30}(undefined|NaN|÷|Infinity|\[object).{20}", q["all"]) or [""])[0] if re.search(r"undefined|NaN|÷|Infinity|\[object", q["all"]) else "")
        chk(bool(q["don"]), w+" don manquant")
        if q["type"]=="num":
            chk(isinstance(q["ans"],(int,float)) and math.isfinite(q["ans"]) and q["ans"]>0, w+f" ans {q['ans']}")
            chk(q["self"], w+" la valeur à 3 chiffres n'est pas acceptée")
            for dg in q["diag"]: chk(not dg["hit"], w+f" diag = bonne réponse ({dg['v']} / {q['ans']})")
            vs=[dg["v"] for dg in q["diag"]]
        elif q["type"]=="trous":
            P=q["phr"]; chk(P and len(P["gaps"])>=2, w+" trous : moins de 2 éléments")
            for gp in (P["gaps"] if P else []):
                chk(len(gp["o"])>=2 and len(set(gp["o"]))==len(gp["o"]) and 0<=gp["ok"]<len(gp["o"]) and gp["m"], w+" trou mal formé")
        if q["type"]=="red":
            E=q["elements"]; chk(E and len(E)>=3 and all(e.get("t") and e.get("p") for e in E), w+" barème de rédaction")
            chk(len(q["modele"])>40 and q["iaPlus"], w+" modèle ou complément IA manquant")
        if q["type"] in ("ch","red"):
            chk(len(set(q["ch"]))==len(q["ch"]), w+" choix en double")
            chk(q["why"][q["ok"]]=="" and all(x for i,x in enumerate(q["why"]) if i!=q["ok"]), w+" why")
    def concl(q, oui, pos, neg, w, mots=None):
        """La phrase-réponse (modèle rédigé ou phrase complétée) dit la même chose que le recalcul."""
        t=q["modele"] if q["type"]=="red" else q["phr"]["txt"]
        chk((pos in t and neg not in t) if oui else (neg in t), w+" conclusion contraire au recalcul : "+t[:120])
        if mots: chk((mots[0] in t and mots[1] not in t) if oui else (mots[1] in t and mots[0] not in t), w+" comparaison contraire au recalcul : "+t[:120])
        if q["type"]=="red": chk((pos in q["elements"][-1]["t"] and neg not in q["elements"][-1]["t"]) if oui else (neg in q["elements"][-1]["t"]), w+" barème contraire au recalcul")
    # recalcul indépendant
    L,i=r["l"],r["i"]; A=[q["ans"] for q in Q]
    try:
        if (L,i)==(1,0): chk(close(A[0], g(r"moteur "+X+" tr/min",d)/g(r"r = 1/(\d+)",d)), key+" recalcul")
        elif (L,i)==(1,1): chk(close(A[0], g(r"Z1 = (\d+)",d)/g(r"Z2 = (\d+)",d)), key+" recalcul")
        elif (L,i)==(1,2): chk(close(A[0], g(r"V max = "+X+" m/s",d)/(g(r"roue (\d+) cm",d)/100/2)), key+" recalcul")
        elif (L,i)==(1,3): chk(close(A[0], g(r"α = (\d+)°",Q[0]["q"])*g(r"r = (\d+) \(mult",d)), key+" recalcul")
        elif (L,i)==(1,4):
            lab=re.search(r"Ligne « ([^»]+) »",Q[0]["expl"]).group(1); m=re.search(re.escape(lab)+r" "+X, Q[0]["fig"]); chk(m and close(A[0], num(m.group(1))), key+" relevé")
        elif (L,i)==(1,5):
            mult="1/" not in d; chk(Q[0]["ch"][Q[0]["ok"]].startswith("Un multiplicateur" if mult else "Un réducteur"), key+" verdict")
        elif (L,i)==(1,6):
            Xl=g(r"exigence 1.1 : "+X,d); val=g(r"valeur calculée "+X,d); oui=val<=Xl; bon=Q[0]["ch"][Q[0]["ok"]]
            chk(abs(val-Xl)/Xl>=0.1, key+" marge"); chk(("est satisfaite" in bon and "n'est pas" not in bon) if oui else ("n'est pas satisfaite" in bon), key+" verdict")
            chk(("inférieur" in bon) if oui else ("supérieur" in bon), key+" comparaison"); chk(sum(1 for c_ in Q[0]["ch"] if ("n'est pas" in c_))==(1 if oui else 3) or True, key)
        elif (L,i)==(2,0):
            w=2*math.pi*g(r"moteur "+X+" tr/min",d)/60/g(r"r = 1/(\d+)",d); chk(close(A[0],w), key+" q0"); vk=w*g(r"roue (\d+) cm",d)/200*3.6; chk(close(A[1], vk), key+" q1")
            Vx=g(r"exigence 1.3 : (\d+) km/h",d); chk(abs(vk-Vx)/Vx>=0.08, key+" marge"); chk(len(Q)==3 and Q[2]["type"]=="trous", key+" 3e question")
            concl(Q[2], vk<=Vx, "est satisfaite", "n'est pas satisfaite", key, ("inférieur","supérieur"))
        elif (L,i)==(2,1):
            Cr=g(r"F = (\d+) N",d)*g(r"roue (\d+) cm",d)/200; chk(close(A[0],Cr), key+" q0"); chk(close(A[1], Cr/(g(r"r = 1/(\d+)",d)*g(r"rendement "+X,d))), key+" q1")
            ap=g(r"environ "+X+" N·m",Q[1]["q"]); chk(abs(ap-A[1])/A[1]<0.06, key+" valeur approchée"); chk(abs(ap-A[1])/A[1]>0.006, key+" approchée trop proche")
            Cn=g(r"couple nominal "+X+" N·m",d); Cd=g(r"couple de démarrage "+X+" N·m",d); chk(abs(A[1]-Cn)/Cn>=0.1 and abs(A[1]-Cd)/Cd>=0.1 and Cd>Cn, key+" marge")
            chk(len(Q)==3 and Q[2]["type"]=="trous", key+" 3e question"); concl(Q[2], A[1]<=Cn, "moteur convient", "ne convient pas", key, ("inférieure","supérieure"))
        elif (L,i)==(2,2): chk(close(A[0], g(r"moteur (\d+) tr/min",d)*g(r"Z1 = (\d+)",d)*g(r"Z3 = (\d+)",d)/(g(r"Z2 = (\d+)",d)*g(r"Z4 = (\d+)",d))), key+" recalcul")
        elif (L,i)==(2,3):
            imp=2*g(r"−(\d+)° à",d)/360*g(r"r = (\d+) \(mult",d)*g(r"codeur (\d+) imp",d); chk(close(A[0],imp), key+" q0")
            bb=next(x for x in range(1,20) if 2**x-1>=imp); chk(A[1]==bb, key+" q1 bits")
        elif (L,i)==(2,4):
            v=math.pi*g(r"diamètre (\d+) mm",d)/1000*(g(r"moteur (\d+) tr/min",d)/g(r"r = 1/(\d+)",d))/60; chk(close(A[0],v), key+" q0"); chk(close(A[1], g(r"course "+X+" m",d)/v), key+" q1")
        elif (L,i)==(2,5): chk(close(A[0], g(r"moteur (\d+) tr/min",d)/g(r"r = 1/(\d+)",d)*g(r"pas (\d+) mm",d)/60), key+" recalcul")
        elif (L,i)==(3,0):
            v=g(r"exigence : (\d+) km/h",d)/3.6; w=v/(g(r"roue (\d+) cm",d)/200); Nm=w*g(r"r = 1/(\d+)",d)*60/(2*math.pi); Nx=g(r"moteur : (\d+) tr/min",d)
            chk(close(A[0],v) and close(A[1],w) and close(A[2],Nm), key+" recalcul"); chk(abs(Nm-Nx)/Nx>=0.08, key+" marge")
            chk(Q[3]["ch"][Q[3]["ok"]].startswith("Oui" if Nm<=Nx else "Non"), key+" verdict"); chk(Q[3]["type"]=="red", key+" rédaction")
            concl(Q[3], Nm<=Nx, "est satisfaite", "n'est pas satisfaite", key, ("inférieur","supérieur"))
        elif (L,i)==(3,1):
            Ct=g(r"exigé (\d+) N",d)*g(r"diamètre (\d+) mm",d)/2000; k_=g(r"r = 1/(\d+)",d); Cm=Ct/(k_*g(r"rendement "+X,d)); Nn=g(r"moteur : (\d+) tr/min",d); Cn=g(r"nominal "+X+" N·m",d)
            vc=2*math.pi*Nn/60/k_*g(r"diamètre (\d+) mm",d)/2000
            chk(close(A[0],Ct) and close(A[1],Cm) and close(A[2],vc), key+" recalcul"); chk(abs(Cm-Cn)/Cn>=0.1, key+" marge")
            chk(Q[3]["ch"][Q[3]["ok"]].startswith("Oui" if Cm<=Cn else "Non"), key+" verdict"); chk(Q[3]["type"]=="red", key+" rédaction")
            concl(Q[3], Cm<=Cn, "moteur convient", "ne convient pas", key, ("inférieur","supérieur"))
        elif (L,i)==(3,2):
            Np=g(r"moteur (\d+) tr/min",d)/g(r"r = 1/(\d+)",d); v=math.pi*g(r"diamètre (\d+) mm",d)/1000*Np/60; t=g(r"course (\d+) m",d)/v; Tx=g(r"moins de (\d+) s",d)
            chk(close(A[0],Np) and close(A[1],v) and close(A[2],t), key+" recalcul"); chk(abs(t-Tx)/Tx>=0.08, key+" marge")
            chk(Q[3]["ch"][Q[3]["ok"]].startswith("L'exigence est satisfaite" if t<=Tx else "L'exigence n'est pas satisfaite"), key+" verdict"); chk(Q[3]["type"]=="red", key+" rédaction")
            concl(Q[3], t<=Tx, "est satisfaite", "n'est pas satisfaite", key, ("inférieur","supérieur"))
        elif (L,i)==(3,3):
            p_=g(r"pas (\d+) mm",d); k_=g(r"r = 1/(\d+)",d); n_=g(r"codeur (\d+) imp",d); av=p_/k_; res=av/n_*1000; imp=g(r"course (\d+) mm",d)*k_*n_/p_; ex=g(r"exigence : (\d+) µm",d)
            chk(close(A[0],av) and close(A[1],res) and close(A[2],imp), key+" recalcul"); chk(abs(res-ex)/ex>=0.12, key+" marge")
            chk(Q[3]["ch"][Q[3]["ok"]].startswith("L'exigence est satisfaite" if res<=ex else "L'exigence n'est pas satisfaite"), key+" verdict"); chk(Q[3]["type"]=="red", key+" rédaction")
            concl(Q[3], res<=ex, "est satisfaite", "n'est pas satisfaite", key, ("inférieur","supérieur"))
        else: errs.append(key+" pas de recalcul prévu")
    except AssertionError as e: errs.append(f"{key} lecture des données : {e}")
print("générateurs :", len(stats), "| tirages :", sum(stats.values()), "| questions :", n)
from collections import Counter
c=Counter(re.sub(r"[\d,\.]+","#",e)[:110] for e in errs)
print("ERREURS :", len(errs)); [print("  ",k,"×",v) for k,v in c.most_common(25)]
if errs: print("exemple :", errs[0][:300])
