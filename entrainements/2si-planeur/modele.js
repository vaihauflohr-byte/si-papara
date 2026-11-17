/* Modèle de vol du planeur (2D, vu de côté) : un corps rigide qui avance, monte, descend et bascule autour de son centre de gravité.
   Forces : poids, portance et traînée de l'aile, portance du stabilisateur. Coefficients : ordres de grandeur d'une plaque plane à petite vitesse. */
(function (racine) {
  const RHO = 1.2, G = 9.81;
  const COEF = { clmax: 0.75, cd0: 0.055, e: 0.7, rayon: 0.27 };   // portance maxi, traînée de forme, efficacité de l'aile, rayon de giration (en longueurs de fuselage)
  // Portance d'une plaque : proportionnelle à l'angle, puis décrochage progressif
  function cl(alpha, pente, clmax) {
    const as = clmax / pente, s = Math.sign(alpha), a = Math.abs(alpha);
    if (a <= as) return pente * alpha;
    const t = Math.min(1, (a - as) / 0.105);
    return s * ((1 - t) * clmax + t * 0.55 * Math.sin(2 * a));
  }
  function derive(p) {
    const S = p.env * p.corde, AR = p.env / p.corde, St = p.envS * p.cordeS, ARt = p.envS / p.cordeS;
    const aw = 2 * Math.PI * AR / (AR + 2), at = 2 * Math.PI * ARt / (ARt + 2);
    const xw = p.xAile + 0.25 * p.corde, xt = p.xStab + 0.25 * p.cordeS;
    const deda = Math.min(0.6, 2 * aw / (Math.PI * AR));
    const Vh = St * (xt - xw) / (S * p.corde);
    const xnp = xw + 0.9 * Vh * (at / aw) * (1 - deda) * p.corde;
    const vmin = Math.sqrt(2 * p.m * G / (RHO * S * COEF.clmax));
    return { S, AR, St, ARt, aw, at, xw, xt, deda, xnp, vmin, marge: (xnp - p.xG) / p.corde, pctG: (p.xG - p.xAile) / p.corde, charge: p.m * 1000 / (S * 1e4), I: p.m * Math.pow(COEF.rayon * p.L, 2) };
  }
  // p : tout en unités SI (kg, m, rad). Renvoie la trajectoire et les grandeurs du vol.
  function simuler(p) {
    const d = derive(p), dt = 0.002;
    let s = [0, p.h0, p.v0 * Math.cos(p.g0), p.v0 * Math.sin(p.g0), p.g0, 0];   // x, z, vx, vz, theta, q
    const f = (s) => {
      const vx = s[2], vz = s[3], th = s[4], q = s[5], V = Math.max(0.3, Math.hypot(vx, vz)), gam = Math.atan2(vz, vx), ab = th - gam;
      const aW = ab + p.calage, clw = cl(aW, d.aw, COEF.clmax);
      const aT = ab - d.deda * aW + q * (d.xt - p.xG) / V, clt = cl(aT, d.at, 0.7);
      const pd = 0.5 * RHO * V * V, Lw = pd * d.S * clw, Lt = pd * d.St * clt;
      const dec = Math.min(1, Math.max(0, (Math.abs(aW) - COEF.clmax / d.aw) / 0.105));
      const D = pd * d.S * (COEF.cd0 + clw * clw / (Math.PI * COEF.e * d.AR) + dec * 1.2 * Math.pow(Math.sin(aW), 2)) + pd * d.St * (clt * clt / (Math.PI * COEF.e * d.ARt) + 1.2 * Math.pow(Math.sin(Math.min(1.2, Math.abs(aT))), 2) * (Math.abs(aT) > 0.2 ? 1 : 0));
      const L = Lw + Lt, cg = Math.cos(gam), sg = Math.sin(gam);
      const M = (Lw * (p.xG - d.xw) - Lt * (d.xt - p.xG)) * Math.cos(ab) - 0.5 * RHO * V * d.S * p.corde * p.corde * 0.6 * q;
      return [vx, vz, (-L * sg - D * cg) / p.m, (L * cg - D * sg) / p.m - G, q, M / d.I, aW];
    };
    const pts = []; let t = 0, hmax = p.h0, tDec = 0, tours = 0;
    while (t < 12 && s[1] > 0) {
      const k1 = f(s), k2 = f(s.map((v, i) => v + dt / 2 * k1[i])), k3 = f(s.map((v, i) => v + dt / 2 * k2[i])), k4 = f(s.map((v, i) => v + dt * k3[i]));
      if (Math.round(t / dt) % 10 === 0) pts.push([s[0], s[1], s[4], t]);
      if (Math.abs(k1[6]) > COEF.clmax / d.aw + 0.035) tDec += dt;
      s = s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); t += dt;
      hmax = Math.max(hmax, s[1]); if (Math.abs(s[4]) > 2.5) tours = 1;
      if (s[0] < -3 || s[0] > 80) break;
    }
    pts.push([s[0], Math.max(0, s[1]), s[4], t]);
    return Object.assign({ pts, distance: s[0], duree: t, hmax, tDecroche: tDec, culbute: !!tours }, d);
  }
  racine.PlaneurModele = { simuler, derive, COEF };
})(typeof window !== "undefined" ? window : globalThis);
