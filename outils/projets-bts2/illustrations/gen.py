# -*- coding: utf-8 -*-
"""Illustrations des cartes de choix (page Projets BTS 2) : SVG en ligne, dessinés ici à partir de petits blocs.
Couleurs par classes CSS (définies dans entrainements/bts-projets.html) : --c = couleur du domaine, fixée par la page,
encre, papier, eau, jaune, vert : lisibles en thème clair et sombre. Traits d'épaisseur constante (non-scaling-stroke).
Usage, depuis la racine du dépôt : python3 outils/projets-bts2/illustrations/gen.py .  → contenu/illustrations-projets.js"""
import json, math, os, sys

def n(v):
    v = round(v, 1)
    return str(int(v)) if v == int(v) else str(v)

def g(contenu, x=0, y=0, s=1, rot=0):
    t = f"translate({n(x)} {n(y)})" + (f" scale({n(s) if s != int(s) else int(s)})" if s != 1 else "") + (f" rotate({n(rot)})" if rot else "")
    return f'<g transform="{t}">{contenu}</g>'

def svg(w, h, contenu, fond=True):
    f = f'<rect class="fd" width="{w}" height="{h}" rx="8"/>' if fond else ""
    return f'<svg viewBox="0 0 {w} {h}" aria-hidden="true" focusable="false">{f}{contenu}</svg>'

R = lambda cls, x, y, w, h, rx=0: f'<rect class="{cls}" x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}"' + (f' rx="{n(rx)}"' if rx else "") + "/>"
C = lambda cls, cx, cy, r: f'<circle class="{cls}" cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}"/>'
L = lambda cls, x1, y1, x2, y2: f'<line class="{cls}" x1="{n(x1)}" y1="{n(y1)}" x2="{n(x2)}" y2="{n(y2)}"/>'
P = lambda cls, d: f'<path class="{cls}" d="{d}"/>'
def T(cls, x, y, txt, taille=8, ancre="middle"):
    return f'<text class="{cls}" x="{n(x)}" y="{n(y)}" font-size="{taille}" text-anchor="{ancre}">{txt}</text>'

# --------------------------------------------------------------------------------------------- blocs
def eclair(cx, cy, s=1):
    pts = [(1.6, -7), (-3.6, 1.2), (-0.2, 1.2), (-1.6, 7), (3.6, -1.2), (0.2, -1.2)]
    return f'<polygon class="j" points="{" ".join(n(cx + x * s) + "," + n(cy + y * s) for x, y in pts)}"/>'

def armoire(w=28, h=42):   # au sol (0,0) en bas à gauche
    s = R("tf", 0, -h, w, h, 2) + L("t fin", w / 2, -h + 3, w / 2, -3)
    s += C("pl", w / 2 - 2.6, -h * 0.5, 1.1) + C("pl", w / 2 + 2.6, -h * 0.5, 1.1)
    s += eclair(w / 4, -h * 0.66, 0.85)
    for i in range(3):
        s += L("t fin", w / 2 + 3.5, -7 - i * 3, w - 3.5, -7 - i * 3)
    return s

def coffret(w=22, h=26):   # au mur, (0,0) en haut à gauche
    s = R("tf", 0, 0, w, h, 2) + R("tk", 3, 5, w - 6, 8, 1)
    for i in range(4):
        x = 3 + (w - 6) * (i + 0.5) / 4
        s += L("t fin", x, 6.6, x, 11.4)
    s += eclair(w / 2, h - 6.5, 0.55)
    return s

def entrepot(w=70, h=30, faite=12, porte=True):   # au sol
    s = P("tk", f"M0 0 V{-h} L{n(w / 2)} {-h - faite} L{w} {-h} V0 Z")
    if porte:
        pw, ph = w * 0.36, h * 0.72
        x0 = (w - pw) / 2
        s += R("tf", x0, -ph, pw, ph)
        for k in range(1, 4):
            s += L("t fin", x0, -ph + k * ph / 4, x0 + pw, -ph + k * ph / 4)
    return s

def maison(w=40, h=24, toit=10, fenetres=2):   # bâtiment simple à toit plat débordant, au sol
    s = R("tk", 0, -h, w, h) + P("tf", f"M-3 {-h} L{n(w / 2)} {-h - toit} L{w + 3} {-h} Z")
    for i in range(fenetres):
        x = w * (i + 0.5) / fenetres - 4
        s += R("tf", x, -h + 6, 8, 7, 1)
    return s

def palmier(h=34):   # au sol
    t = -h
    s = P("k tronc", f"M0 0 C2 -10 3.5 -22 1.5 {n(t)}")
    for d in (f"M1.5 {n(t)} C-4 {n(t - 5)} -10 {n(t - 4)} -14 {n(t + 3)}", f"M1.5 {n(t)} C7 {n(t - 6)} 13 {n(t - 5)} 16 {n(t + 2)}",
              f"M1.5 {n(t)} C-1 {n(t - 8)} -6 {n(t - 11)} -10 {n(t - 10)}", f"M1.5 {n(t)} C4 {n(t - 9)} 10 {n(t - 11)} 14 {n(t - 9)}",
              f"M1.5 {n(t)} C-5 {n(t + 1)} -8 {n(t + 5)} -8 {n(t + 10)}"):
        s += P("vt", d)
    return s

def soleil(cx, cy, r=6):
    s = C("j", cx, cy, r)
    for i in range(8):
        a = i * math.pi / 4
        s += L("jt", cx + (r + 2.5) * math.cos(a), cy + (r + 2.5) * math.sin(a), cx + (r + 5.5) * math.cos(a), cy + (r + 5.5) * math.sin(a))
    return s

def panneau(w=40, h=13, k=7):   # (0,0) coin bas gauche ; parallélogramme vu de face, incliné
    s = P("tf", f"M0 0 H{w} L{w + k} {-h} H{k} Z")
    for i in range(1, 4):
        x = w * i / 4
        s += L("t fin", x, 0, x + k, -h)
    s += L("t fin", k / 2, -h / 2, w + k / 2, -h / 2)
    return s

def fourgon(couleur="tk"):   # au sol, vers la droite, 44 de long
    s = P(couleur, "M0 -5 V-20 Q0 -22 2.5 -22 H28 L35.5 -13 H41.5 Q44 -13 44 -10.5 V-5 Z")
    s += P("tf", "M29 -20 L33.8 -14 H29 Z") + L("t", 3, -12, 26, -12)
    s += C("tk", 10, -5, 4.6) + C("tk", 34, -5, 4.6) + C("pl", 10, -5, 1.3) + C("pl", 34, -5, 1.3)
    s += eclair(15, -16.5, 0.55)
    return s

def voiture():   # au sol, vers la droite, 34 de long
    s = P("tk", "M0 -4 V-9.5 Q0 -12 3 -12 H9 L13 -17.5 H24 L28.5 -12 H31.5 Q34 -12 34 -9.5 V-4 Z")
    s += P("tf", "M14.2 -16 L11 -12 H19 V-16 Z") + P("tf", "M21 -16 V-12 H27 L23.5 -16 Z")
    s += C("tk", 8, -4, 3.6) + C("tk", 26, -4, 3.6)
    return s

def borne():   # au sol
    return R("tf", 0, -26, 10, 26, 2) + R("tk", 2.2, -22, 5.6, 5, 1) + eclair(5, -10, 0.5)

def batterie(w=16, h=22):   # au sol
    s = R("tf", 0, -h, w, h, 2) + R("pl", w / 2 - 3, -h - 3, 6, 3, 1)
    for i in range(3):
        s += R("v", 3, -6 - i * 5.5, w - 6, 3.6, 0.8)
    return s

def pompe():   # au sol, 34 de long ; refoulement en (8,-17)
    s = R("tk", -1, -3, 36, 3, 1) + R("tf", 15, -17, 20, 13, 2)
    for x in (19, 23, 27, 31):
        s += L("t fin", x, -15, x, -6)
    s += C("tf", 8, -10, 7) + C("pl", 8, -10, 1.8) + L("k", 15, -10, 14, -10)
    return s

def tuyau(d):
    return P("et tuy", d)

def cuve(w=26, h=30, niveau=0.55):   # au sol
    eh = (h - 4) * niveau
    s = R("tk", 0, -h, w, h, 3) + R("e", 2, -2 - eh, w - 4, eh, 1)
    vag = f"M2 {n(-2 - eh)}" + "".join(f" q{n((w - 4) / 8)} -2 {n((w - 4) / 4)} 0" for _ in range(4))
    return s + P("et fin", vag)

def goutte(cx, cy, s=1):
    d = f"M{n(cx)} {n(cy - 5 * s)} C{n(cx + 2 * s)} {n(cy - 2 * s)} {n(cx + 3 * s)} {n(cy)} {n(cx + 3 * s)} {n(cy + 1.5 * s)} A{n(3 * s)} {n(3 * s)} 0 0 1 {n(cx - 3 * s)} {n(cy + 1.5 * s)} C{n(cx - 3 * s)} {n(cy)} {n(cx - 2 * s)} {n(cy - 2 * s)} {n(cx)} {n(cy - 5 * s)} Z"
    return P("e et fin", d)

def tete_sprinkler(cx, cy, gouttes=True):
    s = L("k", cx, cy, cx, cy + 4) + P("tf", f"M{n(cx - 4)} {n(cy + 4)} H{n(cx + 4)} L{n(cx + 2)} {n(cy + 7)} H{n(cx - 2)} Z")
    if gouttes:
        for dx, dy in ((-9, 13), (-4, 15), (0, 16), (4, 15), (9, 13)):
            s += L("et fin", cx + dx * 0.45, cy + 8 + dy * 0.2, cx + dx, cy + 8 + dy * 0.75)
    return s

def cloche(cx, cy, s=1):   # cloche d'alarme, (cx,cy) = sommet
    k = lambda v: n(v * s)
    d = f"M{n(cx - 9 * s)} {n(cy + 15 * s)} C{n(cx - 9 * s)} {n(cy + 7 * s)} {n(cx - 6 * s)} {n(cy)} {n(cx)} {n(cy)} C{n(cx + 6 * s)} {n(cy)} {n(cx + 9 * s)} {n(cy + 7 * s)} {n(cx + 9 * s)} {n(cy + 15 * s)} Z"
    out = P("tf", d) + L("t", cx - 11 * s, cy + 15 * s, cx + 11 * s, cy + 15 * s) + C("pl", cx, cy + 18 * s, 2 * s)
    out += P("t fin", f"M{n(cx - 14 * s)} {n(cy + 4 * s)} q{k(-4)} {k(6)} 0 {k(12)}") + P("t fin", f"M{n(cx + 14 * s)} {n(cy + 4 * s)} q{k(4)} {k(6)} 0 {k(12)}")
    out += P("t fin", f"M{n(cx - 19 * s)} {n(cy + 1 * s)} q{k(-6)} {k(9)} 0 {k(18)}") + P("t fin", f"M{n(cx + 19 * s)} {n(cy + 1 * s)} q{k(6)} {k(9)} 0 {k(18)}")
    return out

def ecran(w=30, h=20, contenu="courbe"):   # (0,0) en haut à gauche, pied compris
    s = R("tk", 0, 0, w, h, 2) + P("k", f"M{n(w / 2)} {h} V{h + 4} M{n(w / 2 - 6)} {h + 4} H{n(w / 2 + 6)}")
    if contenu == "courbe":
        s += P("t fin", f"M4 {h - 5} L{n(w * 0.3)} {n(h * 0.5)} L{n(w * 0.45)} {n(h * 0.62)} L{n(w * 0.62)} {n(h * 0.3)} L{n(w * 0.78)} {n(h * 0.42)} L{w - 4} 5")
    elif contenu == "alerte":
        s += R("tf", 4, 4, w - 8, 4, 1) + R("tf", 4, 10, w - 14, 4, 1) + C("r", w - 6, h - 5, 2.4)
    return s

def chaudiere(w=24, h=40):   # au sol
    s = R("tk", w / 2 - 4, -h - 8, 8, 9, 1) + R("tf", 0, -h, w, h, 4)
    s += C("tk", w / 2, -14, 6.2) + P("j", f"M{n(w / 2)} -19 C{n(w / 2 + 4)} -15 {n(w / 2 + 3.5)} -10.5 {n(w / 2)} -10 C{n(w / 2 - 3.5)} -10.5 {n(w / 2 - 4)} -14 {n(w / 2)} -19 Z")
    s += C("tk", w / 2, -30, 5) + L("k", w / 2, -30, w / 2 + 3, -32.5)
    return s

def silo(w=22):   # au sol ; trémie en bas
    s = L("k", 2.5, -20, 2.5, 0) + L("k", w - 2.5, -20, w - 2.5, 0) + L("k", 2.5, -8, w - 2.5, -14)
    s += P("tf", f"M0 -46 L{n(w / 2)} -53 L{w} -46 Z") + R("tf", 0, -46, w, 26, 1) + P("tf", f"M0 -20 L{n(w / 2 - 3)} -11 H{n(w / 2 + 3)} L{w} -20 Z")
    s += L("t fin", 0, -37, w, -37) + L("t fin", 0, -28, w, -28)
    return s

def vis(x1, y1, x2, y2, e=3.2):   # convoyeur à vis incliné, en coordonnées absolues
    dx, dy = x2 - x1, y2 - y1
    L_ = math.hypot(dx, dy); ux, uy = dx / L_, dy / L_; px, py = -uy * e, ux * e
    s = P("tf", f"M{n(x1 + px)} {n(y1 + py)} L{n(x2 + px)} {n(y2 + py)} L{n(x2 - px)} {n(y2 - py)} L{n(x1 - px)} {n(y1 - py)} Z")
    k = int(L_ // 5)
    pts = []
    for i in range(k + 1):
        t = i / k; sgn = 1 if i % 2 else -1
        pts.append(f"{n(x1 + dx * t + px * 0.75 * sgn)} {n(y1 + dy * t + py * 0.75 * sgn)}")
    return s + P("t fin", "M" + " L".join(pts))

def barriere(long=58, fermee=True):   # au sol ; pivot en (4,-15)
    s = R("tf", 0, -22, 9, 22, 1.5)
    bras = R("tk", 6, -17.5, long, 4.6, 2.3) + "".join(R("r", 6 + long * f, -17.5, long * 0.09, 4.6) for f in (0.18, 0.42, 0.66, 0.88))
    s += bras if fermee else g(bras, 4.5, -15, 1, -55).replace('x="6"', 'x="1.5"')
    return s + C("pl", 4.5, -15.2, 1.6)

def boucle(x, y, w=26):   # boucle magnétique au sol (pointillés)
    return f'<rect class="t fin pointille" x="{n(x)}" y="{n(y)}" width="{n(w)}" height="4" rx="1"/>'

def feu():   # feu tricolore, au sol
    return L("k", 5, 0, 5, -14) + R("tk", 0, -38, 10, 24, 3) + C("r", 5, -32.5, 2.6) + C("j", 5, -26, 2.6) + C("v", 5, -19.5, 2.6)

def flamme(cx, cy, s=1):
    return P("j", f"M{n(cx)} {n(cy - 7 * s)} C{n(cx + 5 * s)} {n(cy - 2 * s)} {n(cx + 5 * s)} {n(cy + 4 * s)} {n(cx)} {n(cy + 5 * s)} C{n(cx - 5 * s)} {n(cy + 4 * s)} {n(cx - 5 * s)} {n(cy - 2 * s)} {n(cx - 1.5 * s)} {n(cy - 4 * s)} C{n(cx - 1 * s)} {n(cy - 1 * s)} {n(cx + 1 * s)} {n(cy - 1 * s)} {n(cx)} {n(cy - 7 * s)} Z")

def interdit_flamme(cx, cy, r=8):
    return C("interdit", cx, cy, r) + flamme(cx, cy + 0.5, 0.75) + L("interdit-barre", cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7)

def vapeurs(x, y, nb=3, ecart=7):
    return "".join(P("t fin", f"M{n(x + i * ecart)} {n(y)} q-2.5 -3 0 -6 t0 -6") for i in range(nb))

def enceinte(w=30, h=20):   # sur établi ; (0,0) au sol
    s = L("k", -5, -12, w + 5, -12) + L("k", -2, -12, -2, 0) + L("k", w + 2, -12, w + 2, 0)
    s += R("tk", 0, -12 - h, w, h, 2) + R("e", 4, -12 - h + 4, w - 8, h - 9, 1) + R("tf", w / 2 - 4, -12 - 9, 8, 5, 1)
    return s

def bassin(w=80, h=16):   # (0,0) bord haut gauche
    s = P("e", f"M0 0 H{w} L{w - 6} {h} H6 Z") + P("et fin", f"M0 0 H{w}")
    for i in range(3):
        y = 5 + i * 4
        s += P("et fin", f"M{n(8 + i * 3)} {y}" + "".join(f" q3 -1.6 6 0" for _ in range(int((w - 20) / 6) - i)))
    return s

def bulles(x, y, nb=5):
    pos = [(0, 0, 1.6), (4, -5, 1.2), (-2, -9, 1.9), (3, -14, 1.3), (-1, -19, 1)]
    return "".join(C("bulle", x + dx, y + dy, r) for dx, dy, r in pos[:nb])

def poisson(s=1):   # centré en (0,0), vers la droite
    k = lambda v: n(v * s)
    return P("tf", f"M{k(-9)} 0 C{k(-5)} {k(-5)} {k(3)} {k(-5)} {k(7)} 0 C{k(3)} {k(5)} {k(-5)} {k(5)} {k(-9)} 0 Z M{k(-9)} 0 L{k(-14)} {k(-4)} V{k(4)} Z") + C("pl", 3.5 * s, -1 * s, 0.9 * s)

def compteur():   # compteur d'eau sur tuyau, centre (0,0)
    s = tuyau("M-16 0 H16") + C("tk", 0, -1, 8) + R("tf", -4.5, -6, 9, 3.4, 0.8) + L("k", 0, -1, 3.5, 1.5) + C("pl", 0, -1, 1.2)
    return s

def impulsions(x, y, nb=3, w=4, h=5):
    d = f"M{n(x)} {n(y)}" + "".join(f" h{w} v{-h} h{w} v{h}" for _ in range(nb)) + f" h{w}"
    return P("t fin", d)

def ventilateur(r=11):   # centre (0,0)
    s = C("tk", 0, 0, r)
    pale = "M0 0 C2.5 -2.5 6.5 -6.5 2 -9.5 C-1 -9 -1.5 -4 0 0 Z"
    for a in (0, 120, 240):
        s += g(P("tf", pale), 0, 0, r / 11, a)
    return s + C("pl", 0, 0, 2)

def serveur(w=18, h=40):   # au sol
    s = R("tk", 0, -h, w, h, 2)
    for i in range(4):
        y = -h + 4 + i * (h - 6) / 4
        s += R("tf", 3, y, w - 6, (h - 6) / 4 - 3, 1) + C("v", w - 5.5, y + ((h - 6) / 4 - 3) / 2, 1)
    return s

def onde(x, y, w, a=8, distordue=True):
    pts = []
    for i in range(61):
        t = i / 60 * 4 * math.pi
        v = math.sin(t) + ((0.32 * math.sin(3 * t) + 0.2 * math.sin(5 * t)) if distordue else 0)
        pts.append(f"{n(x + w * i / 60)} {n(y - a * v / 1.25)}")
    return P("t", "M" + " L".join(pts))

def condensateurs(nb=3):   # au sol
    s = ""
    for i in range(nb):
        x = i * 11
        s += R("tf", x, -20, 9, 20, 2) + L("k", x + 3, -20, x + 3, -24) + L("k", x + 6, -20, x + 6, -24)
    return s + P("k", f"M3 -24 H{n((nb - 1) * 11 + 6)}")

def ascenseur(w=26, h=56, cabine=0.45):   # gaine au sol
    cy = -h * cabine - 16
    s = R("tk", 0, -h, w, h) + C("tk", w / 2, -h, 3.2) + L("k", w / 2, -h + 3, w / 2, cy) + R("tf", 4, cy, w - 8, 16, 1.5)
    s += f'<polygon class="pl" points="{n(w + 6)},{n(-h * 0.62)} {n(w + 10)},{n(-h * 0.62 + 5)} {n(w + 2)},{n(-h * 0.62 + 5)}"/>'
    s += f'<polygon class="pl" points="{n(w + 6)},{n(-h * 0.42 + 5)} {n(w + 10)},{n(-h * 0.42)} {n(w + 2)},{n(-h * 0.42)}"/>'
    return s

def cloche_plat(cx, cy, s=1):   # (cx,cy) = milieu du plateau
    k = lambda v: n(v * s)
    return L("k", cx - 12 * s, cy, cx + 12 * s, cy) + P("tk", f"M{n(cx - 10 * s)} {n(cy)} A{k(10)} {k(9)} 0 0 1 {n(cx + 10 * s)} {n(cy)} Z") + C("pl", cx, cy - 10 * s, 1.6 * s)

def caisse(x, y, w=14, h=12):   # (x,y) au sol
    return R("tf", x, y - h, w, h, 1) + P("t fin", f"M{n(x)} {n(y - h)} L{n(x + w)} {n(y)} M{n(x + w)} {n(y - h)} L{n(x)} {n(y)}")

def ecole(w=60, h=28):   # au sol, avec drapeau
    s = R("tk", 0, -h, w, h) + P("tf", f"M-3 {-h} H{w + 3} V{-h - 4} H-3 Z")
    for r in range(2):
        for c in range(5):
            if r == 1 and c == 2:
                continue
            s += R("tf", 4 + c * 11.2, -h + 4 + r * 11, 7, 6.5, 1)
    s += R("tk", w / 2 - 4, -11, 8, 11) + L("k", w + 8, 0, w + 8, -h - 14) + P("pl", f"M{w + 8} {-h - 14} h11 l-2.5 3.5 2.5 3.5 h-11 Z")
    return s

def clim():   # unité de climatisation (0,0) en haut à gauche
    s = R("tk", 0, 0, 20, 12, 1.5) + C("t fin", 6, 6, 3.6)
    for x in (12, 14.5, 17):
        s += L("t fin", x, 3, x, 9)
    return s

def flocon(cx, cy, r=4):
    s = ""
    for a in (0, 60, 120):
        ra = math.radians(a)
        s += L("et fin", cx - r * math.cos(ra), cy - r * math.sin(ra), cx + r * math.cos(ra), cy + r * math.sin(ra))
    return s

def scene_theatre(w=64, h=38):   # (0,0) en haut à gauche
    s = P("lum", f"M{n(w / 2 - 3)} 4 L{n(w / 2 - 12)} {h - 6} H{n(w / 2 + 12)} L{n(w / 2 + 3)} 4 Z")
    s += R("tk", 0, h - 6, w, 6)
    s += P("tf", f"M0 0 H15 C12 9 15 19 11 {h - 6} H0 Z") + P("tf", f"M{w} 0 H{w - 15} C{w - 12} 9 {w - 15} 19 {w - 11} {h - 6} H{w} Z")
    s += P("tf", f"M0 0 H{w} V5" + "".join(f" Q{n(w - (i + 0.5) * w / 6)} 9.5 {n(w - (i + 1) * w / 6)} 5" for i in range(6)) + " Z")
    return s

def nuage(cx, cy, txt="CO₂"):
    d = f"M{n(cx - 13)} {n(cy + 5)} a6 6 0 0 1 1 -11 a8.5 8.5 0 0 1 15.5 -3 a6.5 6.5 0 0 1 9 8 a5 5 0 0 1 -1.5 6 Z"
    return P("tk", d) + T("pl txt", cx, cy + 2.5, txt, 7.5)

def ampoule(cx, cy):
    s = C("tk", cx, cy, 5) + R("k", cx - 2.5, cy + 5, 5, 3, 0.8)
    for a in (-150, -90, -30):
        ra = math.radians(a)
        s += L("jt", cx + 7.5 * math.cos(ra), cy + 7.5 * math.sin(ra), cx + 10.5 * math.cos(ra), cy + 10.5 * math.sin(ra))
    return s

def groupe(w=30):   # groupe électrogène, au sol
    return L("k", -1, 0, w + 1, 0) + R("tf", 0, -17, w, 15, 2) + R("tk", w - 8, -23, 4, 6, 1) + R("tk", 3, -14, 9, 7, 1) + eclair(w / 2 + 3, -9.5, 0.6)

def plante(x, y, s=1):
    k = lambda v: n(v * s)
    return P("vt", f"M{n(x)} {n(y)} V{n(y - 9 * s)} M{n(x)} {n(y - 4 * s)} q{k(-5)} {k(-1)} {k(-6)} {k(-6)} M{n(x)} {n(y - 6 * s)} q{k(5)} {k(-1)} {k(6)} {k(-6)}")

def montagnes(x, y, w, h=34):
    pts = [(0, 0), (0.12, -0.45), (0.2, -0.3), (0.34, -1), (0.45, -0.55), (0.58, -0.8), (0.72, -0.35), (0.85, -0.6), (1, 0)]
    return P("mt", "M" + " L".join(f"{n(x + w * a)} {n(y + h * b)}" for a, b in pts) + " Z")

def collines(x, y, w, h=16):
    return P("mt", f"M{n(x)} {n(y)} Q{n(x + w * 0.25)} {n(y - h)} {n(x + w * 0.5)} {n(y - h * 0.5)} T{n(x + w)} {n(y - h * 0.4)} V{n(y)} Z")

def lagon(x, y, w, h=10):
    s = R("e", x, y, w, h)
    s += P("et fin", f"M{n(x + 4)} {n(y + 4)}" + "".join(" q3 -1.6 6 0" for _ in range(int((w - 8) / 6))))
    return s

def fare(w=40):   # faré sur pilotis : (0,0) = niveau de l'eau, à gauche
    s = "".join(L("k", x, 0, x, -9) for x in (4, w / 2, w - 4)) + L("k", -2, -9, w + 2, -9)
    s += R("tk", 3, -25, w - 6, 16) + R("tf", w / 2 - 4, -21, 8, 12, 1)
    s += P("tf", f"M-5 -25 L{n(w / 2)} -40 L{w + 5} -25 Z")
    for i in range(1, 5):
        s += L("t fin", w / 2 - (w / 2 + 5) * i / 5 * 0.95, -25 - 15 * (1 - i / 5) * 0.95, w / 2, -38)
    return s

def caserne(w=52, h=30):   # au sol
    s = R("tk", 0, -h, w, h) + R("r", -2, -h - 5, w + 4, 5, 1) + P("r", f"M{n(w / 2 - 4)} {-h - 5} a4 4 0 0 1 8 0 Z")
    for x0 in (5, w / 2 + 3):
        s += R("tf", x0, -20, w / 2 - 8, 20)
        for k in range(1, 4):
            s += L("t fin", x0, -20 + k * 5, x0 + w / 2 - 8, -20 + k * 5)
    return s

def panneau_p(x, y):   # panneau « P » sur poteau, (x,y) au sol
    return L("k", x + 6, y, x + 6, y - 22) + R("pl", x, y - 34, 12, 12, 2) + T("tw txt", x + 6, y - 24.5, "P", 9)

def afficheur(x, y, txt="128"):
    return L("k", x + 11, y, x + 11, y - 18) + R("tk", x, y - 30, 22, 12, 2) + T("pl txt mono", x + 11, y - 21.3, txt, 8)

def graphe(x, y, w=28, h=18):   # (x,y) en haut à gauche ; barres
    s = R("tk", x, y, w, h, 2)
    for i, v in enumerate((0.45, 0.7, 0.55, 0.9, 0.35)):
        bh = (h - 6) * v
        s += R("tf", x + 3 + i * (w - 6) / 5, y + h - 3 - bh, (w - 6) / 5 - 1.5, bh, 0.6)
    return s

def usine(w=56, h=22):   # toit en dents de scie + cheminée, au sol
    d = f"M0 0 V{-h}"
    for i in range(3):
        d += f" L{n(i * 12 + 12)} {-h - 9} V{-h}"
    d += f" H{w - 14} V{-h - 16} H{w - 8} V{-h} H{w} V0 Z"
    s = P("tk", d)
    for i in range(4):
        s += R("tf", 4 + i * 9, -h + 7, 6, 6, 1)
    return s

def cle(x, y, s=1, rot=-40):   # clé plate : manche et tête à mâchoire ouverte ; (x,y) = centre de la tête
    d = ("M-26 -2.6 L-6.5 -2.6 A7 7 0 0 1 6.5 -2.6 L1.5 -2.6 A2.6 2.6 0 0 0 1.5 2.6 L6.5 2.6 "
         "A7 7 0 0 1 -6.5 2.6 L-26 2.6 A2.6 2.6 0 0 1 -26 -2.6 Z")
    return g(P("tf", d), x, y, s, rot)

def etageres(w=28, h=32):   # au sol
    s = L("k", 1, 0, 1, -h) + L("k", w - 1, 0, w - 1, -h)
    for y in (-2, -h / 3 - 1, -2 * h / 3 - 1):
        s += L("k", 1, y, w - 1, y)
    s += R("tf", 4, -h / 3 - 9, 9, 8, 1) + R("tf", 15, -h / 3 - 7, 8, 6, 1) + R("tf", 5, -2 * h / 3 - 8, 7, 7, 1) + R("tf", 14, -2 * h / 3 - 10, 10, 9, 1)
    return s

def variateur(x, y):   # (x,y) en haut à gauche
    return R("tf", x, y, 16, 22, 2) + R("tk", x + 3, y + 3, 10, 6, 1) + T("pl txt mono", x + 8, y + 8, "Hz", 4.6) + C("tk", x + 8, y + 15, 2.6)

def antenne(x, y):   # (x,y) au sol
    s = L("k", x, y, x, y - 18) + C("pl", x, y - 19, 1.6)
    s += P("t fin", f"M{n(x - 4)} {n(y - 23)} a5 5 0 0 1 8 0") + P("t fin", f"M{n(x - 7)} {n(y - 26)} a9 9 0 0 1 14 0")
    return s

def table_conf(x, y, w=44):   # table, une chaise à chaque bout, (x,y) au sol
    s = R("tf", x, y - 15, w, 4, 1.5) + L("k", x + 5, y - 11, x + 5, y) + L("k", x + w - 5, y - 11, x + w - 5, y)
    s += P("tf", f"M{n(x - 14)} {n(y - 9)} H{n(x - 4)} V{n(y - 6)} H{n(x - 14)} Z") + L("k", x - 14, y - 6, x - 14, y) + L("k", x - 5, y - 6, x - 5, y) + L("t", x - 14, y - 9, x - 16, y - 24)
    s += P("tf", f"M{n(x + w + 4)} {n(y - 9)} H{n(x + w + 14)} V{n(y - 6)} H{n(x + w + 4)} Z") + L("k", x + w + 5, y - 6, x + w + 5, y) + L("k", x + w + 14, y - 6, x + w + 14, y) + L("t", x + w + 14, y - 9, x + w + 16, y - 24)
    return s

def store_rayures(x, y, w=40):   # store de restaurant
    s = ""
    for i in range(6):
        cls = "pl" if i % 2 == 0 else "tk"
        s += P(cls, f"M{n(x + i * w / 6)} {n(y)} h{n(w / 6)} l-1.5 7 h{n(-w / 6)} Z")
    return s

def sol(w, y):
    return L("sl", 4, y, w - 4, y)

# --------------------------------------------------------------------------------------------- compositions
SC_W, SC_H, SC_SOL = 240, 92, 82      # scènes des cas
PJ_W, PJ_H, PJ_SOL = 240, 104, 94     # illustrations des projets
PI_W, PI_H, PI_SOL = 120, 64, 57      # pictogrammes des parties

def scene_cas():
    S = {}
    # E1 Pacific Matériaux : dépôt, TGBT, coffrets, cocotier
    s = montagnes(0, SC_SOL, 150, 40) + sol(SC_W, SC_SOL)
    s += g(entrepot(86, 34, 12), 26, SC_SOL) + g(armoire(22, 34), 122, SC_SOL)
    s += g(coffret(16, 19), 150, 40) + g(coffret(16, 19), 172, 40) + P("t fin", "M133 48 V30 H158 V40 M158 30 H180 V40")
    s += caisse(196, SC_SOL) + caisse(208, SC_SOL, 12, 10) + caisse(200, SC_SOL - 12, 12, 10) + g(palmier(40), 18, SC_SOL)
    S["E1"] = svg(SC_W, SC_H, s)
    # E2 Te Ara Livraisons : ombrière solaire, fourgonnettes, borne
    s = sol(SC_W, SC_SOL) + soleil(214, 18, 7)
    s += g(maison(44, 30, 9, 2), 10, SC_SOL)
    s += L("k", 74, SC_SOL, 74, 42) + L("k", 196, SC_SOL, 196, 42) + L("k", 135, SC_SOL, 135, 42)
    s += g(panneau(62, 10, 6), 68, 42) + g(panneau(62, 10, 6), 130, 42)
    s += g(fourgon(), 82, SC_SOL) + g(fourgon(), 142, SC_SOL) + g(borne(), 59, SC_SOL) + P("t fin", "M69 70 C74 74 78 66 86 70")
    S["E2"] = svg(SC_W, SC_H, s)
    # E3 Entrepôts Mahana : entrepôt et réseau sprinkler, local pompe, réserve d'eau, cloche
    s = sol(SC_W, SC_SOL)
    s += g(entrepot(110, 40, 12, porte=False), 10, SC_SOL) + tuyau("M16 48 H114")
    for x in (30, 54, 78, 102):
        s += tete_sprinkler(x, 48, gouttes=(x == 54))
    s += R("tk", 70, SC_SOL - 20, 24, 20)
    s += g(cuve(30, 46, 0.7), 196, SC_SOL) + g(maison(42, 26, 8, 0), 138, SC_SOL) + g(pompe(), 142, SC_SOL - 3) + tuyau("M150 62 V54 H120") + tuyau("M196 76 H178")
    s += cloche(30, 60, 0.5)
    S["E3"] = svg(SC_W, SC_H, s)
    # E4 Brasserie du Plateau : brasserie, chaudière, silo à drêche et vis, barrière
    s = collines(0, SC_SOL, 240, 18) + sol(SC_W, SC_SOL)
    s += g(maison(62, 34, 10, 3), 10, SC_SOL) + R("tf", 82, SC_SOL - 40, 16, 40, 6) + R("tf", 102, SC_SOL - 34, 14, 34, 5)
    s += g(silo(20), 148, SC_SOL) + vis(122, SC_SOL - 4, 150, SC_SOL - 46, 2.8)
    s += g(barriere(46), 184, SC_SOL) + P("vapeur t fin", "M28 40 q-3 -4 0 -8 t0 -8")
    S["E4"] = svg(SC_W, SC_H, s)
    # E5 Aquaculture Taiarapu : bassins aérés, local des surpresseurs, pompe dans le lagon
    s = lagon(0, SC_SOL - 2, 40, 12) + L("sl", 40, SC_SOL, 236, SC_SOL)
    s += g(bassin(58, 14), 52, SC_SOL - 14) + g(bassin(58, 14), 158, SC_SOL - 14)
    s += g(maison(34, 26, 8, 0), 118, SC_SOL) + g(ventilateur(7), 135, SC_SOL - 13)
    s += tuyau("M118 62 H90 V76") + tuyau("M152 62 H184 V76")
    s += bulles(90, SC_SOL - 2, 4) + bulles(74, SC_SOL - 3, 3) + bulles(184, SC_SOL - 2, 4) + bulles(200, SC_SOL - 3, 3)
    s += g(pompe(), 6, SC_SOL - 14, 0.75) + tuyau("M12 54 H38 V70 H56")
    s += g(palmier(38), 226, SC_SOL) + g(poisson(0.7), 66, SC_SOL - 6) + g(poisson(0.6), 214, SC_SOL - 6)
    S["E5"] = svg(SC_W, SC_H, s)
    return S

def pictos_parties():
    S, Y = {}, PI_SOL
    b = sol(PI_W, Y)
    S["E1-1"] = svg(PI_W, PI_H, b + g(armoire(34, 46), 43, Y) + P("t fin", "M50 11 V6 M60 11 V4 M70 11 V6"))
    S["E1-2"] = svg(PI_W, PI_H, b + g(coffret(24, 28), 22, 10) + L("k", 52, 40, 108, 40) + L("k", 58, 40, 58, Y) + L("k", 102, 40, 102, Y) + cle(92, 18, 1.1, -35) + P("t fin", "M34 38 V48 H60"))
    S["E1-3"] = svg(PI_W, PI_H, b + g(coffret(24, 28), 18, 10) + g(etageres(34, 40), 68, Y) + ampoule(100, 10))
    S["E1-4"] = svg(PI_W, PI_H, b + g(coffret(24, 28), 16, 10) + g(cuve(30, 36, 0.6), 72, Y) + goutte(87, 9, 1.2) + P("t fin", "M40 24 H58 V40 H72"))
    S["E2-1"] = svg(PI_W, PI_H, b + soleil(18, 14, 5.5) + L("k", 40, Y, 40, 42) + L("k", 62, Y, 62, 34) + g(panneau(42, 14, 9), 26, 42) + g(batterie(18, 24), 90, Y) + P("t fin", "M66 46 H82 V40 H99"))
    S["E2-2"] = svg(PI_W, PI_H, b + g(borne(), 16, Y) + g(fourgon(), 56, Y) + P("t", "M26 40 C36 46 42 36 54 42"))
    S["E3-1"] = svg(PI_W, PI_H, b + g(pompe(), 10, Y) + tuyau("M18 40 V10 H112") + tete_sprinkler(62, 10) + tete_sprinkler(92, 10, False))
    S["E3-2"] = svg(PI_W, PI_H, b + cloche(34, 10, 1.05) + g(ecran(36, 24, "alerte"), 70, 14) + L("t fin pointille", 50, 30, 68, 30))
    S["E4-1"] = svg(PI_W, PI_H, b + g(chaudiere(26, 40), 18, Y) + g(ecran(38, 24), 68, 12) + L("t fin pointille", 46, 34, 66, 34))
    S["E4-2"] = svg(PI_W, PI_H, b + g(silo(24), 82, Y) + vis(20, Y - 3, 84, 12, 3.2) + R("tk", 10, Y - 10, 18, 8, 1))
    S["E4-3"] = svg(PI_W, PI_H, b + g(barriere(78), 12, Y) + boucle(52, Y + 1.5, 30))
    S["E4-4"] = svg(PI_W, PI_H, b + g(enceinte(36, 22), 18, Y) + vapeurs(28, 22, 3, 8) + interdit_flamme(92, 24, 10))
    S["E5-1"] = svg(PI_W, PI_H, b + g(pompe(), 8, Y) + g(ventilateur(6), 16, Y - 10) + g(variateur(0, 0), 52, 8) + tuyau("M16 40 V30 H92 V46") + g(bassin(40, 10), 76, Y - 10) + bulles(92, Y - 12, 4))
    S["E5-2"] = svg(PI_W, PI_H, b + g(pompe(), 8, Y) + tuyau("M16 40 V30 H54") + g(compteur(), 70, 30) + impulsions(88, 18, 3, 3.5, 5) + tuyau("M86 30 H112"))
    return S

def illus_projets():
    S, Y = {}, PJ_SOL
    b = sol(PJ_W, Y)
    S["P01"] = svg(PJ_W, PJ_H, montagnes(90, Y, 150, 50) + b + g(cuve(40, 30, 0.7), 176, Y - 26) + g(maison(56, 28, 9, 0), 22, Y) + g(pompe(), 28, Y) + g(pompe(), 60, Y, 0.8)
                   + tuyau("M36 77 V64 H96 L176 46") + antenne(110, Y))
    S["P02"] = svg(PJ_W, PJ_H, lagon(0, Y - 6, 120, 16) + L("sl", 120, Y, 236, Y) + g(fare(46), 30, Y - 6) + g(palmier(44), 136, Y)
                   + R("tk", 168, Y - 2, 36, 12) + R("e", 170, Y + 3, 32, 6) + g(pompe(), 176, Y + 7, 0.55) + tuyau("M181 95 V64 H236")
                   + L("k", 214, Y, 214, 58) + g(coffret(18, 20), 205, 38) + cloche(214, 16, 0.5))
    s = collines(0, Y, 240, 26) + b
    for row in range(3):
        for i in range(9):
            s += plante(96 + i * 15 + row * 4, Y - row * 2 - 2, 0.9 - row * 0.12)
    s += g(pompe(), 16, Y) + tuyau("M24 77 V62 H92") + g(variateur(0, 0), 46, 42) + goutte(112, 46, 1.2) + goutte(150, 40, 1) + goutte(190, 46, 1.1)
    S["P03"] = svg(PJ_W, PJ_H, s)
    S["P04"] = svg(PJ_W, PJ_H, b + g(maison(110, 52, 0, 0), 20, Y) + store_rayures(26, 44, 60) + R("tf", 30, Y - 22, 14, 22, 1) + R("tf", 54, Y - 26, 26, 14, 1)
                   + g(ascenseur(30, 66, 0.5), 150, Y) + cloche_plat(165, 50, 0.75) + L("k", 136, 40, 150, 40) + cloche_plat(212, 60, 0.9))
    s = lagon(184, Y - 4, 56, 14) + L("sl", 4, Y, 184, Y) + g(entrepot(120, 44, 12, porte=False), 10, Y) + g(ascenseur(30, 54, 0.3), 30, Y)
    s += caisse(78, Y) + caisse(94, Y) + caisse(86, Y - 12) + caisse(110, Y, 12, 10) + caisse(146, Y) + caisse(160, Y)
    s += P("tk", "M188 82 H238 L232 92 H194 Z") + R("pl", 198, 72, 10, 10, 1) + R("tf", 209, 72, 10, 10, 1) + R("pl", 220, 72, 10, 10, 1) + R("tf", 209, 63, 10, 9, 1) + L("k", 230, 82, 230, 60)
    S["P05"] = svg(PJ_W, PJ_H, s)
    S["P06"] = svg(PJ_W, PJ_H, b + panneau_p(14, Y) + afficheur(36, Y) + g(barriere(70), 70, Y) + g(voiture(), 152, Y) + g(voiture(), 196, Y)
                   + boucle(110, Y + 2, 32))
    S["P07"] = svg(PJ_W, PJ_H, b + g(caserne(76, 40), 10, Y) + g(barriere(60), 106, Y) + g(feu(), 196, Y) + L("t fin pointille", 100, Y + 5, 236, Y + 5))
    S["P08"] = svg(PJ_W, PJ_H, b + g(scene_theatre(120, 64), 20, 24) + g(ventilateur(13), 182, 40) + R("pl", 168, 64, 28, 16, 3) + T("tw txt mono", 182, 75.3, "IT", 9))
    S["P09"] = svg(PJ_W, PJ_H, b + L("k", 10, 12, 230, 12) + ampoule(98, 22) + ampoule(140, 22) + R("tk", 18, 24, 50, 32, 2) + P("t fin", "M24 50 L34 40 L42 44 L52 32 L62 36") + L("k", 43, 56, 43, 62)
                   + table_conf(84, Y, 76) + nuage(196, 40) + g(ventilateur(11), 210, 74))
    S["P10"] = svg(PJ_W, PJ_H, b + g(serveur(22, 52), 22, Y) + g(serveur(22, 52), 50, Y) + g(serveur(22, 52), 78, Y) + onde(116, 52, 110, 14)
                   + L("t fin pointille", 116, 52, 226, 52))
    S["P11"] = svg(PJ_W, PJ_H, b + g(usine(96, 34), 12, Y) + g(condensateurs(4), 128, Y) + g(poisson(1.5), 206, 44) + flocon(206, 70, 6) + P("t fin", "M108 70 H128"))
    s = lagon(0, Y - 4, 240, 14) + P("sable", f"M30 {Y - 4} Q120 {Y - 14} 210 {Y - 4} Z") + g(palmier(48), 186, Y - 8) + g(fare(42), 34, Y - 8)
    s += L("k", 100, Y - 10, 100, 62) + L("k", 128, Y - 10, 128, 56) + g(panneau(34, 12, 8), 92, 62) + g(batterie(14, 18), 140, Y - 8) + g(groupe(26), 158, Y - 8) + soleil(220, 18, 7)
    S["P12"] = svg(PJ_W, PJ_H, s)
    S["P13"] = svg(PJ_W, PJ_H, b + g(ecole(100, 44), 14, Y) + g(clim(), 120, 40) + g(clim(), 120, 62) + flocon(150, 46, 4) + g(graphe(0, 0, 44, 30), 172, 30) + L("k", 194, 60, 194, Y))
    return S

def icones_etapes():   # icônes de trait 24×24 (currentColor)
    I = {
        "s1": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><circle cx="11" cy="12" r="3"/><path d="M13.2 14.2 16 17"/>',
        "s2": '<path d="M4 20V4M4 20h16"/><path d="M7 16l4-5 3 3 5-7"/>',
        "s3": '<path d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M8 12h8M8 15h5"/>',
        "s4": '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M8 3v4M16 3v4M7 13h5M10 16h6"/>',
        "s5": '<path d="M14.5 5.5a4 4 0 0 0-5.3 5.3L4 16v4h4l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
        "s6": '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
        "lieu": '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    }
    return {k: f'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="ico">{v}</svg>' for k, v in I.items()}

DOMAINES = {"E1": "bt", "E2": "pv", "E3": "ssi", "E4": "auto", "E5": "mot"}
SUPPORTS = {"SPBE": "mot", "MC": "mc", "BAR": "pv", "CINE": "cine", "HARM": "bt", "ATELIER": "atel"}

if __name__ == "__main__":
    site = sys.argv[1] if len(sys.argv) > 1 else "."
    data = {"cas": scene_cas(), "parties": pictos_parties(), "projets": illus_projets(), "icones": icones_etapes(),
            "couleurs": {"cas": DOMAINES, "supports": SUPPORTS}}
    js = ("/* Illustrations des cartes de choix (page Projets BTS 2) — fichier généré par outils/projets-bts2/illustrations/gen.py :\n"
          "   ne pas modifier à la main. SVG en ligne, couleurs par classes CSS (voir entrainements/bts-projets.html). */\n"
          f"window.SIP_ILLUS = {json.dumps(data, ensure_ascii=False)};\n")
    os.makedirs(os.path.join(site, "contenu"), exist_ok=True)
    open(os.path.join(site, "contenu", "illustrations-projets.js"), "w", encoding="utf-8").write(js)
    print(f"OK — {len(data['cas'])} scènes, {len(data['parties'])} parties, {len(data['projets'])} projets, {len(js.encode('utf-8'))} octets")
