import sys, re, math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from v2test import *
def trapeze(d): return g(r"; "+X+r" m/s de",d), g(r"m/s de (\d+) s",d), g(r" à (\d+) s ; arrêt",d), g(r"arrêt à (\d+) s",d)
def courbe_ok(svg, attendu, chk, k):
    pts,xt,yt=lire_courbe(svg); chk(len(pts)==len(attendu) and all(abs(a[0]-b[0])<0.02*max(1,abs(b[0])) and abs(a[1]-b[1])<0.02*max(0.2,abs(b[1])) for a,b in zip(pts,attendu)), k+f" courbe tracée {[(round(a,2),round(b,2)) for a,b in pts]} ≠ données {attendu}")
    for t,v in attendu:   # chaque point à lire tombe sur un trait du quadrillage vertical (graduation ou demi-graduation) et sur une graduation horizontale
        pas=xt[1][1]-xt[0][1]; chk(abs(t/(pas/2)-round(t/(pas/2)))<1e-6, k+f" instant {t} hors quadrillage")
        py=yt[1][1]-yt[0][1] if len(yt)>1 else 1; chk(abs(v/abs(py)-round(v/abs(py)))<1e-6, k+f" valeur {v} hors graduation")
    chk(max(a for a,b in xt)>=attendu[-1][0] and max(b for a,b in yt)>=max(v for t,v in attendu), k+" courbe hors des axes")
def recalc(L,i,Q,d,A,chk,concl,k,svg):
    S=("est satisfaite","n'est pas satisfaite"); M=("inférieur","supérieur"); pi=math.pi
    if L==1 and i in (9,10,11) or (L,i) in ((2,0),(2,1),(3,1)):
        V,t1,t2,t3=trapeze(d); courbe_ok(svg,[(0,0),(t1,V),(t2,V),(t3,0)],chk,k)
    if (L,i)==(1,9): chk(close(A[0],V),k+" recalcul")
    elif (L,i)==(1,10):
        q=Q[0]["q"]; att=t1 if "accélération" in q else t2-t1 if "vitesse constante" in q else t3-t2; chk("freinage" in q or "accélération" in q or "vitesse constante" in q, k+" phase"); chk(close(A[0],att),k+" recalcul")
    elif (L,i)==(1,11):
        a,b=g(r"Entre (\d+) s",Q[0]["q"]),g(r"et (\d+) s",Q[0]["q"]); att={(0,t1):"Uniformément accéléré",(t1,t2):"Uniforme :",(t2,t3):"Uniformément décéléré"}.get((a,b)); chk(att and Q[0]["ch"][Q[0]["ok"]].startswith(att), k+" nature du mouvement")
    elif (L,i)==(1,12): chk(close(A[0],g(r"exigence 1.1 : (\d+) km/h",d)/3.6),k+" recalcul")
    elif (L,i)==(1,13): chk(close(A[0],2*pi*g(r"moteur : (\d+) tr/min",d)/60),k+" recalcul")
    elif (L,i)==(1,14):
        Xl=g(r"exigence 1.1 : "+X,d); val=g(r"valeur calculée "+X,d); oui=val<=Xl; bon=Q[0]["ch"][Q[0]["ok"]]; chk(abs(val-Xl)/Xl>=0.1,k+" marge")
        chk((S[0] in bon and S[1] not in bon) if oui else (S[1] in bon),k+" verdict"); chk((M[0] in bon) if oui else (M[1] in bon),k+" comparaison")
    elif (L,i)==(2,0):
        a=V/t1; Ax=g(r"exigence 1.2 : "+X,d); chk(close(A[0],a),k+" q0"); chk(abs(a-Ax)/Ax>=0.1,k+" marge"); concl(Q[1],a<=Ax,S[0],S[1],k,M)
    elif (L,i)==(2,1): chk(close(A[0],V*t1/2),k+" q0"); chk(close(A[1],V*t1/2+V*(t2-t1)+V*(t3-t2)/2),k+" q1")
    elif (L,i)==(2,2):
        w=g(r"exigence 1.1 : (\d+) km/h",d)/3.6/(g(r"diamètre (\d+) mm",d)/2000); chk(close(A[0],w),k+" q0"); chk(close(A[1],w*60/(2*pi)),k+" q1")
    elif (L,i)==(2,3):
        Xm=g(r"jusqu'à "+X+" m",d); T=g(r"jusqu.à [\d,]+ m à (\d+) s",d); courbe_ok(svg,[(0,0),(T,Xm)],chk,k); v=Xm/T; chk(close(A[0],v),k+" q0"); chk(close(A[1],g(r"longueur (\d+) m",d)/v),k+" q1")
    elif (L,i)==(2,4):
        v=g(r"croisière (\d+) km/h",d)/3.6; a=g(r"accélération "+X,d); chk(close(A[0],v/a),k+" q0"); chk(close(A[1],v*v/(2*a)),k+" q1")
    elif (L,i)==(2,5):
        w=g(r"balayé (\d+)°",d)*pi/180/g(r"aller "+X+" s",d); chk(close(A[0],w),k+" q0"); chk(close(A[1],w*g(r"longueur (\d+) cm",d)/100),k+" q1")
    elif (L,i)==(3,0):
        Tx=g(r"moins de (\d+) s",d); H=g(r"course (\d+) m",d); V=g(r"nominale "+X+" m/s",d); a=g(r"accélération "+X,d); t1=V/a; d1=V*t1/2; T=2*t1+(H-2*d1)/V
        chk(close(A[0],t1) and close(A[1],d1) and close(A[2],T),k+" recalcul"); chk(H-2*d1>0 and abs(T-Tx)/Tx>=0.08,k+" marge"); concl(Q[3],T<=Tx,S[0],S[1],k,M)
    elif (L,i)==(3,1):
        Ax=g(r"exigence 1.1 : "+X,d); ad=V/(t3-t2); chk(close(A[0],V) and close(A[1],V*t1/2+V*(t2-t1)+V*(t3-t2)/2) and close(A[2],ad),k+" recalcul"); chk(abs(ad-Ax)/Ax>=0.1,k+" marge"); concl(Q[3],ad<=Ax,S[0],S[1],k,M)
    elif (L,i)==(3,2):
        Tx=g(r"moins de (\d+) s",d); w=2*pi*g(r"lisse : "+X+" tr/min",d)/60; Lg=g(r"longueur (\d+) m",d); t=(pi/2)/w
        chk(close(A[0],w) and close(A[1],w*Lg) and close(A[2],t),k+" recalcul"); chk(abs(t-Tx)/Tx>=0.08,k+" marge"); concl(Q[3],t<=Tx,S[0],S[1],k,M)
    elif (L,i)==(3,3):
        Dx=g(r"moins de (\d+) m",d); v=g(r"vitesse (\d+) km/h",d)/3.6; tr=g(r"réaction "+X+" s",d); a=g(r"décélération (\d+)",d); d1=v*tr; D=d1+v*v/(2*a)
        chk(close(A[0],v) and close(A[1],d1) and close(A[2],D),k+" recalcul"); chk(abs(D-Dx)/Dx>=0.08,k+" marge"); concl(Q[3],D<=Dx,S[0],S[1],k,M)
    else: chk(False,k+" pas de recalcul prévu")
if __name__=="__main__":
    run("meca-cinematique", recalc, int(sys.argv[1]) if len(sys.argv)>1 else 200, lambda L,i: not ((L==1 and i<9) or (L==2 and i==6)))
