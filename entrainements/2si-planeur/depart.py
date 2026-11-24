"""Planeur de départ des élèves : formes simples (lignes droites), deux extrusions, aile et stabilisateur rectangulaires à plat."""
import numpy as np, math, json, trimesh
from avions import cs, ext, tm, RHO
from manifold3d import CrossSection, Manifold
XA, CA, EA, BA = 88, 45, 0.8, 200          # aile : bord d'attaque, corde, épaisseur, envergure
XSt, CSt, ESt, BSt = 182, 25, 0.6, 80      # stabilisateur
def corps(LN=40, HN=14):
    return [(0, 0), (0, 10), (6, HN), (LN, HN), (LN + 12, 10), (140, 10), (150, 5), (180, 5), (180, 8), (210, 8), (210, 0)]
DERIVE = [(190, 8), (210, 8), (210, 32), (202, 32)]
TROU = (12, 8, 4.2)
def fente(x0, y0, x1, y1, h=1.0):
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L; nx, ny = -uy * h/2, ux * h/2
    return [(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)]
FA = (XA, 7.6, XA + CA + 0.6, 7.6 - (CA + 0.6) * math.tan(math.radians(3)))
FS = (XSt, 4.0, XSt + CSt + 0.6, 4.0)
def fus(LN=40, HN=14):
    f = ext(corps(LN, HN), 5) + ext(DERIVE, 1.0)
    f -= ext(fente(*FA), 9).translate((0, 0, -1)) + ext(fente(*FS, h=0.8), 9).translate((0, 0, -1))
    f -= CrossSection.circle(TROU[2]/2, 40).extrude(9).translate((TROU[0], TROU[1], -1))
    return f
ma = BA * CA * EA * RHO; ms = BSt * CSt * ESt * RHO
lt = (XSt + CSt/4) - (XA + CA/4); Vh = BSt * CSt * lt / (BA * CA * CA); xnp = XA + CA/4 + 0.9 * Vh * 0.75 * 0.6 * CA
def bilan(LN=40, HN=14):
    F = tm(fus(LN, HN)); mf = F.volume * RHO
    xg = (ma * (XA + CA/2) + ms * (XSt + CSt/2) + mf * F.center_mass[0]) / (ma + ms + mf)
    return F, mf, ma + ms + mf, xg
if __name__ == '__main__':
    F, mf, mt, xg = bilan(); cible = XA + 0.27 * CA; lest = mt * (xg - cible) / (cible - TROU[0])
    assert F.is_watertight
    F.export('depart_fuselage.stl'); tm(Manifold.cube((BA, CA, EA))).export('depart_aile.stl'); tm(Manifold.cube((BSt, CSt, ESt))).export('depart_stabilisateur.stl')
    print(f"point neutre {xnp:.1f} ; cible CG {cible:.1f} ; fuselage {mf:.1f} g ; aile {ma:.1f} g ; stab {ms:.1f} g ; total {mt:.1f} g ; CG sans lest {xg:.1f} ; lest au trou {lest:.1f} g ; total lesté {mt+lest:.1f} g ; volumes cm3 fus {mf/1.24:.1f} aile {ma/1.24:.1f} stab {ms/1.24:.1f}")
    json.dump(dict(xnp=xnp, cible=cible, mf=mf, ma=ma, ms=ms, mt=mt, xg=xg, lest=lest), open('depart.json', 'w'))
