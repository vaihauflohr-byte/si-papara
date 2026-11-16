"""Planeurs V2 : aile en V imprimée debout sur son bord d'attaque, fuselage profilé, crochet inchangé."""
import numpy as np, trimesh, math, json
from manifold3d import CrossSection, Manifold
RHO = 1.24e-3
def cs(pts):
    a = sum(pts[i][0]*pts[(i+1)%len(pts)][1]-pts[(i+1)%len(pts)][0]*pts[i][1] for i in range(len(pts)))
    return CrossSection([pts if a > 0 else pts[::-1]])
def ext(pts, h): return cs(pts).extrude(h)
def tm(m):
    me = m.to_mesh(); return trimesh.Trimesh(np.array(me.vert_properties)[:, :3], np.array(me.tri_verts))
def cyl(x, y, r, h): return CrossSection.circle(r, 40).extrude(h).translate((x, y, -1))

# ---------- aile ----------
B = 105; C0 = 46; EPA = 0.6; DIEDRE = 8; PLAT = 6        # demi-envergure, corde, épaisseur, dièdre (deg), demi-plat central
EPF = 5.0                                                  # épaisseur du fuselage
def corde(y): return C0 * (1 - 0.5 * (abs(y) / B) ** 2.5)
def aile():
    tg = math.tan(math.radians(DIEDRE)); zc = lambda y: max(0, abs(y) - PLAT) * tg
    ys = [-B, -PLAT, PLAT, B]
    sec = [(y, zc(y)) for y in ys] + [(y, zc(y) + EPA) for y in reversed(ys)]
    m = ext(sec, C0)                                       # (y, z_vol, corde) = orientation d'impression, bord d'attaque sur le plateau
    N = 60; yy = [B * math.sin(math.pi/2 * i / N) for i in range(-N, N + 1)]
    plan = [(y, -1) for y in (-B, B)] + [(y, corde(y)) for y in reversed(yy)]
    m ^= ext(plan, 40).rotate((90, 0, 0)).translate((0, 30, 0))
    m -= Manifold.cube((EPF + 0.3, 10, 4)).translate((-(EPF + 0.3)/2, -2, C0 - 3))   # encoche de centrage au bord de fuite
    return m
def stab():
    b = 42; c = 24; N = 40
    yy = [b * math.sin(math.pi/2 * i / N) for i in range(-N, N + 1)]
    return ext([(-b, 0), (b, 0)] + [(y, c * (1 - 0.45 * (abs(y)/b) ** 2.5)) for y in reversed(yy)], 0.6)

# ---------- fuselage ----------
XW = 95; XS = 180; CS = 24; LT = 208
s = lambda x: 8.0 - (x - XW) * math.tan(math.radians(3))  # ligne d'appui de l'aile (calage 3 deg)
def fuselage(nez=0, T=5, xbloc=46, trous=(10, 20), hnez=14.0):
    n = nez
    pod = [(n, 5), (n + 2.5, 10), (n + 10, hnez), (n + 34, hnez), (n + 48, 9.4), (XW, 8.0), (XW + 43, s(XW + 43)), (XW + 58, 4.6), (XW + 58, 0), (n + 5, 0), (n + 1.5, 2)]
    f = ext(pod, EPF)
    if T > EPF:                                            # bloc de lest : seulement au-dessus de 3,2 mm pour passer entre les parois du rail
        f += (cs(pod) ^ cs([(n - 1, 3.2), (xbloc, 3.2), (xbloc, 30), (n - 1, 30)])).extrude(T)
    doigt = [(XW + 4, s(XW + 4) + 2.0), (XW + 9, s(XW + 9) + 0.7), (XW + 43, s(XW + 43) + 0.85), (XW + 43, s(XW + 43) - 1.5),
             (XW + 58, 2), (XW + 58, 4.6), (XW + 50, 7.6), (XW + 43, s(XW + 43) + 3.2), (XW + 6, s(XW + 6) + 2.9), (XW + 4, s(XW + 4) + 2.3)]
    f += ext(doigt, EPF)
    hx = max(30, n + 8)
    f += ext([(hx, 1), (hx + 9, 1), (hx + 9, 0), (hx + 16, -7), (hx + 11, -7), (hx, 0)], EPF)               # crochet imposé
    f += ext([(XW + 52, 0), (LT, 0), (LT, 3.8), (XW + 52, 4.8)], 1.6)                     # poutre
    f += ext([(175, 0), (LT, 0), (LT, 6.6), (178.5, 6.6), (175, 4.4)], 3.0)                       # appui du stabilisateur
    f += ext([(181, 6.2), (LT, 6.2), (LT, 29), (199, 29)], 0.8)                           # dérive
    f -= ext([(XS - 0.4, 3.6), (XS + CS + 0.4, 3.6), (XS + CS + 0.4, 4.4), (XS - 0.4, 4.4)], 12).translate((0, 0, -1))
    x = max(hx + 22, n + 40)
    while x + 14 < XW + 40:
        h = min(s(max(x, XW)), s(max(x + 14, XW)), 9.0) - 2.0
        if h > 4.2: f -= ext([(x + 1.5, 2.0), (x + 12.5, 2.0), (x + 14, 3.2), (x + 14, h - 1), (x + 12.5, h), (x + 1.5, h), (x, h - 1), (x, 3.2)], 12).translate((0, 0, -1))
        x += 17
    for x in trous:
        if x > n + 6: f -= cyl(x, 8.5, 2.15, 30)
    return f, hx

W = tm(aile()); S = tm(stab())
Sw = 2 * sum(corde(y) for y in np.linspace(0, B, 2001)) * B / 2001; St = S.volume / 0.6
mac = 2 * sum(corde(y) ** 2 for y in np.linspace(0, B, 2001)) * B / 2001 / Sw
xacw = XW + 0.25 * mac; xact = XS + 6
Vh = St * (xact - xacw) / (Sw * mac); xnp = xacw + 0.9 * Vh * 0.75 * 0.6 * mac
mw, ms = W.volume * RHO, S.volume * RHO
xw = XW + W.centroid[2]; xs = XS + S.centroid[1]
def bilan(F):
    mf = F.volume * RHO; xg = (mw * xw + ms * xs + mf * F.centroid[0]) / (mw + ms + mf)
    return mf, mw + ms + mf, xg, (xnp - xg) / mac * 100
if __name__ == '__main__':
    # fuselage de référence : on cherche l'épaisseur du bloc de nez qui met le centre de gravité 10 % de corde devant le point neutre
    best = None
    for xb in (46,):
        for T in np.arange(5, 14.01, 0.2):
            F = tm(fuselage(T=float(T), xbloc=xb)[0]); r = bilan(F)
            if r[3] >= 8: best = (float(T), xb); break
        if best: break
    print(f"aile {Sw/100:.1f} cm2, {mw:.1f} g | stab {St/100:.1f} cm2, {ms:.1f} g | corde moyenne {mac:.1f} | Vh {Vh:.2f} | point neutre x={xnp:.1f}")
    cfg = {'reference': dict(T=best[0], xbloc=best[1]),
           'cabre': dict(nez=22, T=5, trous=(), hnez=10.5),
           'pique': dict(T=16, xbloc=52, hnez=16.0)}
    out = {}
    W.export('planeur_aile.stl'); S.export('planeur_stabilisateur.stl')
    for k, v in cfg.items():
        m, hx = fuselage(**v); F = tm(m); assert F.is_watertight and len(F.split()) == 1, k
        F.export(f'planeur_fuselage_{k}.stl'); mf, mt, xg, marge = bilan(F)
        out[k] = dict(v, masse=round(mt, 1), cg=round(xg, 1), cg_pct=round((xg - XW) / mac * 100), marge=round(marge), hx=hx, ext=F.extents.round(1).tolist())
        print(f"{k:10s} {v} -> fuselage {mf:.1f} g, total {mt:.1f} g, CG x={xg:.1f} ({(xg-XW)/mac*100:.0f} % corde), marge {marge:.0f} %, charge {mt/(Sw/1e4):.0f} g/dm2, encombrement {F.extents.round(0)}")
    print('aile encombrement (impression)', W.extents.round(1), 'stab', S.extents.round(1), 'aile étanche', W.is_watertight)
    json.dump(dict(out=out, xnp=xnp, mac=mac, Sw=Sw, XW=XW), open('avions.json', 'w'))
