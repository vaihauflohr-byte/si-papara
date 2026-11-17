"""Toutes les images de la page du projet planeur, calculées à partir des vraies pièces."""
import os, math, numpy as np
from PIL import Image, ImageDraw, ImageFont
from rendu import rendu2, arr, etiquettes, FB, FN, barre
from avions import cs, ext
from manifold3d import Manifold, CrossSection
import depart as D
os.makedirs('img_site', exist_ok=True)
NAVY = (35, 75, 150); ORANGE = (240, 150, 30); GRIS = (200, 207, 215); ROUGE = (214, 60, 40); VERT = (60, 160, 100); PLATEAU = (70, 78, 90)
def P(m, c): v, f = arr(m); return (v, f, c)
def debout(m, dy=2.5): return m.rotate((90, 0, 0)).translate((0, dy, 0))        # profil (x, y) -> (X, épaisseur, Z)
def aile(b=D.BA, c=D.CA, e=D.EA, x=D.XA, plan=None, z0=7.6):
    m = ext(plan, e) if plan else Manifold.cube((c, b, e)).translate((0, -b / 2, 0))
    return m.rotate((0, 3, 0)).translate((x, 0, z0 - 0.45))
def stab(b=D.BSt, c=D.CSt, x=D.XSt): return Manifold.cube((c, b, D.ESt)).translate((x, -b / 2, 4.0 - 0.3))
def planeur(fus=None, aile_=None, stab_=None, dz=0):
    fus = D.fus() if fus is None else fus
    return [P(debout(fus).translate((0, 0, dz)), NAVY), P((aile_ or aile()).translate((0, 0, dz)), ORANGE), P((stab_ or stab()).translate((0, 0, dz)), ORANGE)]
def sauve(im, nom, items=None, pr=None, taille=28):
    if items:
        im.resize((im.width // 3, im.height // 3), Image.LANCZOS).save(f'img_site/{nom}_nu.png', optimize=True)
        etiquettes(im, pr, items, None, taille)
    im.save(f'img_site/{nom}.png', optimize=True); print(nom, im.size, os.path.getsize(f'img_site/{nom}.png') // 1024, 'ko')

# 1. bandeau : le planeur de départ en vol
im, pr = rendu2(planeur(), az=215, el=18, echelle=5.2, taille=(1500, 620), incl=-6, pivot=(100, 0, 0)); sauve(im, 'hero')

# 2. les trois pièces, écartées
objs = [P(debout(D.fus()), NAVY), P(aile().translate((0, 0, 45)), ORANGE), P(stab().translate((0, 0, 32)), ORANGE)]
im, pr = rendu2(objs, az=228, el=24, echelle=5.0, taille=(1600, 900), incl=0)
sauve(im, 'pieces', [("AILE\nelle porte le planeur", (110, -60, 52), (60, 60)), ("STABILISATEUR\nil garde le nez à plat", (195, 25, 36), (1180, 150)),
                     ("DÉRIVE\nelle garde l'axe", (206, 2, 25), (1260, 430)), ("FUSELAGE\nil relie tout", (120, 0, 6), (820, 760)),
                     ("NEZ\nil porte le lest", (14, 0, 8), (60, 640)), ("FENTE\nl'aile s'y glisse", (110, 0, 7), (420, 330))], pr)

# 3. le cahier des charges en image : vue de dessus avec les deux cotes
cadre = [P(Manifold.cube((0.2, 0.2, 0.2)).translate(p), NAVY) for p in ((-45, -150, 0), (225, -150, 0), (-45, 120, 0), (225, 120, 0))]
im, pr = rendu2(planeur() + cadre, az=250, el=62, echelle=3.6, taille=(1500, 1000), incl=0)
d = ImageDraw.Draw(im); f = ImageFont.truetype(FB, 34); RC = (180, 40, 30)
def cote(p, q, txt, cote_txt):
    a, b = pr(np.array([p]))[0], pr(np.array([q]))[0]
    d.line([tuple(a), tuple(b)], fill=RC, width=5)
    for e in (a, b): d.ellipse([e[0] - 10, e[1] - 10, e[0] + 10, e[1] + 10], fill=RC)
    m = (a + b) / 2 + np.array(cote_txt); bb = d.textbbox((0, 0), txt, font=f); w, h = bb[2] - bb[0], bb[3] - bb[1]
    d.rounded_rectangle([m[0] - w / 2 - 12, m[1] - h / 2 - 12, m[0] + w / 2 + 12, m[1] + h / 2 + 16], 10, fill=(255, 255, 255), outline=RC, width=3); d.text((m[0] - w / 2, m[1] - h / 2 - 6), txt, font=f, fill=RC)
cote((-22, -105, 8), (-22, 105, 8), "envergure ≤ 210 mm", (10, -170)); cote((0, -122, 0), (210, -122, 0), "longueur ≤ 210 mm", (0, 0))
sauve(im, 'cotes_max')

# 4. résultats attendus des missions
plaque = ext([(0, 0), (60, 0), (60, 20), (0, 20)], 5); biseau = ext([(0, 0), (60, 0), (60, 20), (12, 20), (0, 12)], 5)
im, pr = rendu2([P(debout(plaque), NAVY)], az=235, el=22, echelle=14, taille=(900, 520), incl=0); sauve(im, 'm1')
im, pr = rendu2([P(debout(biseau), NAVY)], az=235, el=22, echelle=14, taille=(900, 520), incl=0); sauve(im, 'm2')
contour = ext(D.corps(), 5)
im, pr = rendu2([P(debout(contour), NAVY)], az=235, el=20, echelle=6.6, taille=(1500, 460), incl=0); sauve(im, 'm3')
im, pr = rendu2([P(debout(D.fus()), NAVY)], az=235, el=20, echelle=6.6, taille=(1500, 560), incl=0)
sauve(im, 'm4', [("trou de lest", (12, -3, 8), (60, 400)), ("fente de l'aile", (110, -3, 6.4), (520, 60)), ("fente du\nstabilisateur", (195, -3, 4), (900, 400)), ("dérive, fine", (205, -1, 22), (1150, 60))], pr, 30)
im, pr = rendu2([P(Manifold.cube((D.CA, D.BA, D.EA)).translate((0, -100, 0)), ORANGE), P(Manifold.cube((D.CSt, D.BSt, D.ESt)).translate((75, -40, 0)), ORANGE)], az=215, el=32, echelle=6.0, taille=(1500, 620), incl=0)
sauve(im, 'm5', [("aile : 200 × 45 × 0,8", (22, -40, 1), (80, 470)), ("stabilisateur : 80 × 25 × 0,6", (88, 20, 1), (860, 90))], pr, 30)
# mission 6 : le planeur monté, en équilibre sur une cale
cale = ext([(-9, 0), (9, 0), (0, 16)], 30).rotate((90, 0, 0)).translate((104, 15, -16.3))
im, pr = rendu2(planeur() + [P(cale, ROUGE)], az=235, el=16, echelle=5.6, taille=(1600, 760), incl=0)
sauve(im, 'm6', [("POINT D'ÉQUILIBRE\nà viser : 104 mm du nez", (104, -15, -8), (140, 560)), ("LEST dans le trou du nez", (12, -3, 8), (60, 250))], pr, 30)
# mission 7 : trois idées de transformation
def plan_effile(b=100, c=45, ct=24): return [(0, -b), (0, b), (ct, b), (c, b * 0.45), (c, -b * 0.45), (ct, -b)]
def corps_var(LN=40, HN=14, hp=5, ht=8):
    return [(0, 0), (0, 10), (6, HN), (LN, HN), (LN + 12, 10), (140, 10), (150, hp), (180, hp), (180, ht), (210, ht), (210, 0)]
def fus_var(pts, derive):
    f = ext(pts, 5) + ext(derive, 1.0); f -= ext(D.fente(*D.FA), 9).translate((0, 0, -1)) + ext(D.fente(*D.FS, h=0.8), 9).translate((0, 0, -1))
    return f - CrossSection.circle(2.1, 40).extrude(9).translate((12, 8, -1))
v1 = planeur(aile_=aile(plan=plan_effile()))
v2 = planeur(fus=fus_var(corps_var(hp=3.6, ht=7), [(196, 7), (210, 7), (210, 24), (205, 24)]))
v3 = planeur(fus=fus_var([(0, 0), (2, 9), (10, 16), (48, 16), (60, 10), (140, 10), (150, 5), (180, 5), (180, 8), (210, 8), (210, 0)], D.DERIVE), aile_=aile(plan=plan_effile(ct=30)))
for nom, o in (('m7a', v1), ('m7b', v2), ('m7c', v3)):
    im, pr = rendu2(o, az=220, el=24, echelle=4.3, taille=(1000, 560), incl=0); sauve(im, nom)
# mission 8 : les trois pièces à plat sur le plateau
plateau = Manifold.cube((235, 235, 3)).translate((-12, -118, -3.2))
objs = [P(plateau, PLATEAU), P(D.fus().translate((0, 60, 0)), NAVY), P(Manifold.cube((D.CA, D.BA, D.EA)).rotate((0, 0, 90)).translate((205, -20, 0)), ORANGE), P(Manifold.cube((D.CSt, D.BSt, D.ESt)).rotate((0, 0, 90)).translate((90, -80, 0)), ORANGE)]
im, pr = rendu2(objs, az=238, el=38, echelle=4.4, taille=(1500, 820), incl=0)
sauve(im, 'm8', [("Chaque pièce est posée à plat :\nrien dans le vide, pas de support", (100, -8, 1), (60, 40))], pr, 30)

# le geste du lancer
fl = barre((-18, 0, 9), (-70, 0, 9), 1.6); pointe = ext([(0, -7), (0, 7), (-16, 0)], 3).translate((-70, 0, 7.5))
doigts = [P(Manifold.sphere(7, 24).scale((1, 0.55, 1)).translate((104, s * 6.5, 3)), (235, 190, 150)) for s in (1, -1)]
im, pr = rendu2(planeur() + doigts + [P(fl + pointe, ROUGE)], az=225, el=16, echelle=5.0, taille=(1600, 700), incl=4, pivot=(100, 0, 0))
sauve(im, 'lancer', [("Pouce et index ici,\nsous l'aile, au point d'équilibre", (104, -7, 2), (760, 520)), ("Pousse droit devant,\nplaneur à plat", (-60, 0, 9), (60, 60))], pr, 30)
# la mesure : trois lancers depuis la ligne
W, H = 1500, 520; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype(FB, 30); fn = ImageFont.truetype(FN, 28)
sol = 400; d.line([(40, sol), (W - 40, sol)], fill=(60, 70, 85), width=6); d.line([(180, sol - 190), (180, sol + 30)], fill=(60, 70, 85), width=8)
d.text((60, sol - 240), "ligne de départ", font=f, fill=(30, 40, 60))
for k, (xf, c) in enumerate([(1010, (120, 150, 200)), (1190, NAVY), (1320, (120, 150, 200))]):
    pts = [(180 + (xf - 180) * t, sol - 170 + 170 * t * t - 60 * math.sin(math.pi * t) * (1 - t)) for t in np.linspace(0, 1, 60)]
    for i in range(0, 58, 3): d.line([pts[i], pts[i + 1]], fill=c, width=5)
    d.ellipse([xf - 13, sol - 13, xf + 13, sol + 13], fill=ROUGE); d.text((xf - 10, sol + 24), str(k + 1), font=f, fill=ROUGE)
d.line([(180, sol + 95), (1190, sol + 95)], fill=ROUGE, width=5); d.polygon([(1190, sol + 95), (1170, sol + 83), (1170, sol + 107)], fill=ROUGE); d.polygon([(180, sol + 95), (200, sol + 83), (200, sol + 107)], fill=ROUGE)
d.text((470, sol + 50), "distance du lancer 2", font=fn, fill=ROUGE); d.text((560, 40), "3 lancers → on garde la moyenne", font=f, fill=(30, 40, 60))
sauve(im, 'mesure')
