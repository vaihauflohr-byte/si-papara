"""Catapulte V2 : rail en deux tronçons, chariot qui porte et pousse le planeur, goupille de déclenchement, deux pieds."""
import numpy as np, trimesh, math, json
from manifold3d import CrossSection, Manifold
RHO = 1.24e-3
def cs(pts):
    a = sum(pts[i][0]*pts[(i+1)%len(pts)][1]-pts[(i+1)%len(pts)][0]*pts[i][1] for i in range(len(pts)))
    return CrossSection([pts if a > 0 else pts[::-1]])
def ext(pts, h): return cs(pts).extrude(h)
def box(x0, x1, y0, y1, z0, z1): return Manifold.cube((x1-x0, y1-y0, z1-z0)).translate((x0, y0, z0))
def tm(m):
    me = m.to_mesh(); return trimesh.Trimesh(np.array(me.vert_properties)[:, :3], np.array(me.tri_verts))
def trou_y(x, z, d=3.5): return CrossSection.circle(d/2, 32).extrude(60).rotate((90, 0, 0)).translate((x, 30, z))

CAN = 6.2; EPAR = 3.5; EB = 3.0; LB = 34.0          # canal, parois, semelle
HCH = 12.5; GUIDE = 2.5; HW = HCH + GUIDE           # hauteur du chariot, guidage au-dessus, hauteur des parois
LSEG = 200; L = 2 * LSEG
XBUTEE = 10; ZBUTEE = 2.2                            # goupille avant : accroche de l'élastique + arrêt du chariot
XCRANS = [160, 190, 220, 250, 280, 310, 340, 370]; ZCRAN = 7.0
XPIED = [45, 125, 365]; EPIED = 5.0
LCH = 122; XTROU_CH = 113; XPOUSSE = 29             # chariot : longueur, trou de goupille, face de poussée (en haut)
QUEUES = [(-11.8,), (11.8,)]

def rail_complet():
    r = box(0, L, -LB/2, LB/2, 0, EB)
    for sg in (1, -1):
        y0, y1 = sorted((sg * CAN/2, sg * (CAN/2 + EPAR))); r += box(0, L, y0, y1, EB, EB + HW)
    r -= trou_y(XBUTEE, EB + ZBUTEE)
    for x in XCRANS: r -= trou_y(x, EB + ZCRAN)
    for x in XPIED:
        r -= box(x, x + EPIED + 0.5, LB/2 - 3, LB/2 + 1, -1, EB + 0.01) + box(x, x + EPIED + 0.5, -LB/2 - 1, -LB/2 + 3, -1, EB + 0.01)
    return r
def queue(yc, jeu):   # queue d'aronde dans la semelle, vue de dessus, qui dépasse du tronçon avant vers l'arrière
    return ext([(LSEG - 0.01, yc - 2 - jeu), (LSEG + 7 + jeu, yc - 3.6 - jeu), (LSEG + 7 + jeu, yc + 3.6 + jeu), (LSEG - 0.01, yc + 2 + jeu)], EB)
def troncons():
    r = rail_complet(); avant = r ^ box(-1, LSEG, -50, 50, -5, 50); arriere = r ^ box(LSEG, L + 1, -50, 50, -5, 50)
    for (yc,) in QUEUES:
        avant += queue(yc, 0); arriere -= ext([(LSEG - 1, yc - 2.2), (LSEG + 7.25, yc - 3.85), (LSEG + 7.25, yc + 3.85), (LSEG - 1, yc + 2.2)], EB + 2).translate((0, 0, -1))
    return avant, arriere
def chariot():
    ep = CAN - 0.6
    corps = [(9, 0.3), (LCH, 0.3), (LCH, HCH), (LCH - 4, HCH), (LCH - 5.5, HCH - 1.5), (LCH - 9, HCH - 1.5), (LCH - 10.5, HCH), (XPOUSSE, HCH), (XPOUSSE + 7, HCH - 7), (XPOUSSE + 7, 5.0), (9, 5.0)]
    c = ext(corps, ep) + ext([(0, 0.3), (4, 0.3), (4, 5.0), (0.8, 5.0), (0, 4.2)], ep) + ext([(3.9, 1.5), (9.1, 1.5), (9.1, 3.8), (3.9, 3.8)], 2.6)
    x = 42
    while x + 16 < XTROU_CH - 6:
        c -= ext([(x + 1.5, 2.4), (x + 14.5, 2.4), (x + 16, 3.9), (x + 16, 8.6), (x + 14.5, 10.1), (x + 1.5, 10.1), (x, 8.6), (x, 3.9)], 20).translate((0, 0, -1)); x += 18.5
    c -= CrossSection.circle(1.85, 32).extrude(20).translate((XTROU_CH, ZCRAN, -1))
    return c
def pied(h, larg):   # plaque posée en travers du rail ; h = hauteur du fond du berceau
    w = (LB - 6 + 0.5) / 2; top = h + 9
    p = [(-larg/2, 0), (larg/2, 0), (larg/2, 6), (w + 9, top), (w, top), (w, h), (-w, h), (-w, top), (-w - 9, top), (-larg/2, 6)]
    m = ext(p, EPIED)
    if h > 40:
        k = (larg/2 - w - 9) / (top - 6)
        e = lambda z: larg/2 - (z - 6) * k - 11
        m -= ext([(-e(14), 14), (e(14), 14), (e(h - 12), h - 12), (-e(h - 12), h - 12)], 20).translate((0, 0, -1))
    return m
def eclisse():       # manchon en C glissé sur la semelle, à cheval sur la jonction
    jeu = 0.25; wi = LB/2 + jeu; t = 2.4
    p = [(-wi - t, -t), (wi + t, -t), (wi + t, EB + jeu + t), (wi - 3.2, EB + jeu + t), (wi - 3.2, EB + jeu), (wi, EB + jeu), (wi, 0), (-wi, 0), (-wi, EB + jeu), (-wi + 3.2, EB + jeu), (-wi + 3.2, EB + jeu + t), (-wi - t, EB + jeu + t)]
    return ext(p, 40)

if __name__ == '__main__':
    av, ar = troncons(); ch = chariot()
    DH = (XPIED[2] - XPIED[0]) * math.sin(math.radians(15))
    pieces = {'catapulte_rail_avant': av, 'catapulte_rail_arriere': ar, 'catapulte_chariot': ch, 'catapulte_pied_avant': pied(12 + DH, 150),
              'catapulte_pied_arriere': pied(12, 110), 'catapulte_eclisse': eclisse()}
    for k, m in pieces.items():
        t = tm(m); assert t.is_watertight and len(t.split()) == 1, k
        t.export(k + '.stl'); print(f"{k:26s} {t.extents.round(1)} mm, {t.volume*RHO:5.1f} g")
    print('courses (mm) selon le cran :', [x - XTROU_CH - XBUTEE - 2 for x in XCRANS])
    print('angles : pied avant au cran 1 -> 15 deg ; au cran 2 ->', round(math.degrees(math.asin(DH / (XPIED[2] - XPIED[1]))), 1), 'deg ; hauteur berceau avant', round(12 + DH, 1))
