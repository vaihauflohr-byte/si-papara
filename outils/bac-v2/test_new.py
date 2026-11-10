import sys, re, math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from v2test import *
G0=9.81
def recalc(L,i,Q,d,A,chk,concl,k,svg):
    S=("est satisfaite","n'est pas satisfaite"); M=("inférieur","supérieur"); pi=math.pi
    FR=lambda: (g(r"F = (\d+) N vers l'avant",d), g(r"R = (\d+) N vers l'arrière",d))
    if (L,i)==(1,8): Fm,R=FR(); chk(close(A[0],Fm-R),k+" recalcul"); chk(f"F = {int(Fm)} N" in Q[0]["fig"] and f"R = {int(R)} N" in Q[0]["fig"], k+" valeurs absentes du schéma")
    elif (L,i)==(1,9): chk(close(A[0],(g(r"vide (\d+) kg",d)+g(r"charge (\d+) kg",d))*G0),k+" recalcul")
    elif (L,i)==(1,10):
        Fm,R=FR(); bon=Q[0]["ch"][Q[0]["ok"]]; chk(("accélère" in bon) if Fm>R else ("ralentit" in bon) if Fm<R else ("vitesse constante" in bon), k+" nature du mouvement"); chk(f"F = {int(Fm)} N" in Q[0]["fig"] and f"R = {int(R)} N" in Q[0]["fig"], k+" valeurs absentes du schéma")
    elif (L,i)==(1,11): chk(close(A[0],g(r"masse (\d+) kg",d)*g(r"accélération "+X,d)),k+" recalcul")
    elif (L,i)==(1,12):
        Xl=g(r"exigence 1.1 : "+X,d); val=g(r"valeur calculée "+X,d); oui=val<=Xl; bon=Q[0]["ch"][Q[0]["ok"]]; chk(abs(val-Xl)/Xl>=0.1,k+" marge")
        chk((S[0] in bon and S[1] not in bon) if oui else (S[1] in bon),k+" verdict"); chk((M[0] in bon) if oui else (M[1] in bon),k+" comparaison")
    elif (L,i)==(2,0): Fm,R=FR(); m=g(r"masse (\d+) kg",d); chk(close(A[0],Fm-R) and close(A[1],(Fm-R)/m),k+" recalcul")
    elif (L,i)==(2,1):
        a=g(r"accélération "+X,d); m=g(r"masse (\d+) kg",d); R=g(r"R = (\d+) N",d); Fx=g(r"maximale (\d+) N",d); Fn=m*a+R
        chk(close(A[0],m*a) and close(A[1],Fn),k+" recalcul"); chk(abs(Fn-Fx)/Fx>=0.1,k+" marge"); concl(Q[2],Fn<=Fx,S[0],S[1],k,M)
    elif (L,i)==(2,2):
        al=g(r"α = (\d+)°",d); m=g(r"masse (\d+) kg",d); R=g(r"R = (\d+) N",d); Px=m*G0*math.sin(al*pi/180); chk(close(A[0],Px) and close(A[1],Px+R),k+" recalcul"); chk(f"α = {int(al)}°" in Q[0]["fig"],k+" angle absent du schéma")
    elif (L,i)==(2,3):
        V=g(r"; "+X+r" m/s à",d); t1=g(r"m/s à (\d+) s",d); t2=g(r"jusqu'à (\d+) s",d); m=g(r"masse (\d+) kg",d)
        pts,xt,yt=lire_courbe(svg); att=[(0,0),(t1,V),(t2,V)]; chk(len(pts)==3 and all(abs(a[0]-b[0])<0.03 and abs(a[1]-b[1])<0.02*max(0.2,b[1]) for a,b in zip(pts,att)), k+f" courbe {pts} ≠ {att}")
        py=yt[1][1]-yt[0][1]; chk(abs(V/abs(py)-round(V/abs(py)))<1e-6, k+" palier hors graduation")
        chk(close(A[0],V/t1) and close(A[1],m*V/t1),k+" recalcul"); chk(Q[2]["ch"][Q[2]["ok"]].startswith("Elle est nulle"),k+" q2")
    elif (L,i)==(2,4):
        t=g(r"arrêt en "+X+" s",d); v=g(r"depuis (\d+) km/h",d)/3.6; m=g(r"masse (\d+) kg",d); chk(close(A[0],v/t) and close(A[1],m*v/t),k+" recalcul")
    elif (L,i)==(2,5): m=g(r"masse (\d+) kg",d); a=g(r"accélération "+X,d); chk(close(A[0],m*G0) and close(A[1],m*(G0+a)),k+" recalcul")
    elif (L,i)==(3,0):
        p=g(r"pente de (\d+) %",d); m=g(r"masse (\d+) kg",d); R=g(r"R = (\d+) N",d); Fx=g(r"maximale (\d+) N",d); al=math.atan(p/100); Px=m*G0*math.sin(al); Fn=Px+R
        chk(close(A[0],al*180/pi) and close(A[1],Px) and close(A[2],Fn),k+" recalcul"); chk(abs(Fn-Fx)/Fx>=0.08,k+" marge"); concl(Q[3],Fn<=Fx,S[0],S[1],k,M)
    elif (L,i)==(3,1):
        Fm,R=FR(); m=g(r"masse (\d+) kg",d); V=g(r"exigence 1.1 : "+X+" m/s",d); Tx=g(r"moins de "+X+" s",d); a=(Fm-R)/m; t=V/a
        chk(close(A[0],Fm-R) and close(A[1],a) and close(A[2],t),k+" recalcul"); chk(abs(t-Tx)/Tx>=0.08,k+" marge"); concl(Q[3],t<=Tx,S[0],S[1],k,M)
    elif (L,i)==(3,2):
        Dx=g(r"moins de (\d+) m",d); v=g(r"vitesse (\d+) km/h",d)/3.6; m=g(r"masse (\d+) kg",d); Ff=g(r"freinage (\d+) N",d); a=Ff/m; dd=v*v/(2*a)
        chk(close(A[0],v) and close(A[1],a) and close(A[2],dd),k+" recalcul"); chk(abs(dd-Dx)/Dx>=0.08,k+" marge"); concl(Q[3],dd<=Dx,S[0],S[1],k,M)
    elif (L,i)==(3,3):
        a=g(r"accélération "+X,d); Tx=g(r"tension (\d+) N",d); m=g(r"masse (\d+) kg",d); T=m*(G0+a)
        chk(close(A[0],m*G0) and close(A[1],m*a) and close(A[2],T),k+" recalcul"); chk(abs(T-Tx)/Tx>=0.08,k+" marge"); concl(Q[3],T<=Tx,S[0],S[1],k,M)
    else: chk(False,k+" pas de recalcul prévu")
if __name__=="__main__":
    run("phy-newton", recalc, int(sys.argv[1]) if len(sys.argv)>1 else 200, lambda L,i: not (L==1 and i<8))
