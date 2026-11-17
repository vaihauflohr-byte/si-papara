"""Vues 3D de la catapulte V2 (petit moteur de rendu maison : projection orthographique + tampon de profondeur)."""
import numpy as np, math, json
from PIL import Image, ImageDraw, ImageFont
from manifold3d import Manifold, CrossSection
from catapulte import *
import avions as A
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; FN = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
COL = dict(rail=(205, 212, 220), chariot=(214, 60, 40), pied=(95, 105, 115), eclisse=(120, 140, 170), gA=(40, 150, 90), gD=(245, 150, 0),
           elastique=(150, 95, 40), fus=(35, 75, 150), aile=(120, 185, 240), sol=(238, 234, 224))
def arr(m):
    me = m.to_mesh(); return np.array(me.vert_properties)[:, :3].astype(float), np.array(me.tri_verts)
def pose(m, dx, dy, dz): return m.rotate((90, 0, 0)).translate((dx, dy, dz))
def tige(x, z, long=26): return CrossSection.circle(2.0, 24).extrude(long).rotate((90, 0, 0)).translate((x, long/2, z))
def anneau(x, z):    # anneau de la goupille de déclenchement, côté +Y
    return (CrossSection.circle(7, 32) - CrossSection.circle(5, 32)).extrude(1.6).rotate((0, 90, 0)).translate((x - 0.8, -21, z))
def barre(p, q, r=1.0):
    p, q = np.array(p, float), np.array(q, float); d = q - p; L = np.linalg.norm(d)
    m = CrossSection.circle(r, 12).extrude(L); ay = math.degrees(math.atan2(math.hypot(d[0], d[1]), d[2])); az = math.degrees(math.atan2(d[1], d[0]))
    return m.rotate((0, ay, 0)).rotate((0, 0, az)).translate(tuple(p))
def pied_pose(h, larg, x): return pied(h, larg).rotate((90, 0, 90)).translate((x, 0, -h))
DH = (XPIED[2] - XPIED[0]) * math.sin(math.radians(15)); HAV = 12 + DH
def aile_pose(dx):
    v, f = arr(A.aile()); out = np.c_[dx + A.XW + v[:, 2], v[:, 0], EB + HCH + A.s(A.XW) + 0.1 - math.tan(math.radians(3)) * v[:, 2] + v[:, 1]]; return out, f
def stab_pose(dx):
    v, f = arr(A.stab()); out = np.c_[dx + A.XS + v[:, 1], v[:, 0], EB + HCH + 3.7 + v[:, 2]]; return out, f

def rendu(objs, az, el, echelle, taille, incl=15, pivot=(XPIED[2], 0, -12)):
    """objs : liste (sommets, triangles, couleur). Renvoie image + fonction de projection."""
    a = math.radians(incl); Ry = np.array([[math.cos(a), 0, -math.sin(a)], [0, 1, 0], [math.sin(a), 0, math.cos(a)]])   # avant (x petit) relevé
    piv = np.array(pivot, float)
    monde = lambda v: (np.asarray(v, float) - piv) @ Ry.T
    az_, el_ = math.radians(az), math.radians(el)
    d = np.array([math.cos(el_) * math.cos(az_), math.cos(el_) * math.sin(az_), math.sin(el_)])          # vers l'observateur
    dr = np.cross([0, 0, 1], d); dr /= np.linalg.norm(dr); up = np.cross(d, dr)
    W, H = taille; cam = lambda v: np.c_[monde(v) @ dr, monde(v) @ up, monde(v) @ d]
    tous = np.vstack([cam(v) for v, f, c in objs if c is not None]); cx, cy = (tous[:, 0].min() + tous[:, 0].max()) / 2, (tous[:, 1].min() + tous[:, 1].max()) / 2
    proj = lambda v: np.c_[W / 2 + (cam(v)[:, 0] - cx) * echelle, H / 2 - (cam(v)[:, 1] - cy) * echelle]
    zb = np.full((H, W), -1e9); img = np.full((H, W, 3), 255, np.uint8); ido = np.zeros((H, W), np.int32)
    L = np.array([0.35, -0.45, 0.82]); L /= np.linalg.norm(L)
    for k, (v, f, c) in enumerate(objs, 1):
        cv = cam(v); px = W / 2 + (cv[:, 0] - cx) * echelle; py = H / 2 - (cv[:, 1] - cy) * echelle; mv = monde(v)
        for t in f:
            x, y, z = px[t], py[t], cv[t, 2]
            x0, x1 = max(int(x.min()), 0), min(int(x.max()) + 1, W - 1); y0, y1 = max(int(y.min()), 0), min(int(y.max()) + 1, H - 1)
            if x0 > x1 or y0 > y1: continue
            den = (y[1] - y[2]) * (x[0] - x[2]) + (x[2] - x[1]) * (y[0] - y[2])
            if abs(den) < 1e-9: continue
            gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
            w0 = ((y[1] - y[2]) * (gx - x[2]) + (x[2] - x[1]) * (gy - y[2])) / den; w1 = ((y[2] - y[0]) * (gx - x[2]) + (x[0] - x[2]) * (gy - y[2])) / den; w2 = 1 - w0 - w1
            m = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6); zz = w0 * z[0] + w1 * z[1] + w2 * z[2]
            sub = zb[y0:y1 + 1, x0:x1 + 1]; m &= zz > sub
            if not m.any(): continue
            n = np.cross(mv[t[1]] - mv[t[0]], mv[t[2]] - mv[t[0]]); nn = np.linalg.norm(n)
            if nn < 1e-12: continue
            n /= nn
            if n @ d < 0: n = -n
            lum = 0.42 + 0.58 * max(0.0, n @ L)
            sub[m] = zz[m]; img[y0:y1 + 1, x0:x1 + 1][m] = np.clip(np.array(c) * lum, 0, 255); ido[y0:y1 + 1, x0:x1 + 1][m] = k
    # contours : rupture d'objet ou de profondeur
    e = np.zeros((H, W), bool)
    e[:-1, :] |= (ido[:-1, :] != ido[1:, :]) | (np.abs(zb[:-1, :] - zb[1:, :]) > 2.5)
    e[:, :-1] |= (ido[:, :-1] != ido[:, 1:]) | (np.abs(zb[:, :-1] - zb[:, 1:]) > 2.5)
    plein = zb > -1e8; e &= plein | np.roll(plein, -1, 0) | np.roll(plein, -1, 1)
    img[e] = (img[e] * 0.25).astype(np.uint8)
    rendu.masque = plein | e
    return Image.fromarray(img), proj

def etiquettes(im, proj, items, titre=None, taille=30):
    d = ImageDraw.Draw(im); f = ImageFont.truetype(FB, taille); ft = ImageFont.truetype(FB, int(taille * 1.5))
    if titre: d.text((30, 22), titre, font=ft, fill=(20, 30, 50))
    for txt, p3, (tx, ty) in items:
        x, y = proj(np.array([p3]))[0]; bb = d.multiline_textbbox((tx, ty), txt, font=f, spacing=6); pad = 10
        bx0, by0, bx1, by1 = bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad
        ax_, ay_ = min(max(x, bx0), bx1), min(max(y, by0), by1)
        d.line([(ax_, ay_), (x, y)], fill=(0, 0, 0), width=4); d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(0, 0, 0))
        d.rounded_rectangle([bx0, by0, bx1, by1], radius=10, fill=(255, 255, 255), outline=(0, 0, 0), width=3)
        d.multiline_text((tx, ty), txt, font=f, fill=(0, 0, 0), spacing=6)
    return im

def rendu2(objs, az, el, echelle, taille, ss=2, **kw):
    """Même rendu, lissé (calcul en grand puis réduction) et sur fond transparent."""
    im, pr = rendu(objs, az, el, echelle * ss, (taille[0] * ss, taille[1] * ss), **kw)
    a = Image.fromarray((rendu.masque * 255).astype(np.uint8)); im = im.convert("RGBA"); im.putalpha(a)
    return im.resize(taille, Image.LANCZOS), (lambda v: pr(v) / ss)
