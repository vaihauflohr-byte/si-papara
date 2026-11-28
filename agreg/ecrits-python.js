/* =====================================================================
   SI Papara — agrégation : Python comme aux écrits (#ecrits-python)
   Dix exercices du type des sujets récents (dichotomie, trapèzes, Euler, filtre RIF, valeurs moyenne et efficace,
   trame I²C, cap et arc tangente, perturber et observer, maximum, vitesse d'un codeur). Le code s'écrit dans la page
   et s'exécute dans la page : Python (Pyodide, chargé à la première exécution, environ 10 Mo) tourne dans un
   « worker », arrêté au bout de 8 s si une boucle ne finit pas. Des tests cachés, avec des valeurs tirées au hasard,
   disent ce qui marche ; un corrigé commenté et la relecture du jury IA complètent.
   Progression : st.ec.py (essais datés). Brouillons dans ce navigateur. Globales de agreg/index.html :
   st, save, app, esc, getSample, HOOK, AIERR.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!Array.isArray(st.ec.py)) st.ec.py = []; return st.ec; };
  const lire = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };
  const errIA = (e) => { const c = e && e.code; const m = (typeof HOOK !== 'undefined' && HOOK && HOOK.err && HOOK.err(c)) ?? (typeof AIERR === 'function' ? AIERR(c) : ''); return m || 'L’IA n’a pas répondu. Réessaie dans un moment.'; };
  const BASE = () => window.ECRITS_PY_BASE || 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const DELAI = 8000;

  /* ---------- Python dans un worker ---------- */
  const WSRC = (base) => `let py = null;
self.onmessage = async (e) => {
  const d = e.data;
  if (d.boot) {
    try { importScripts(${JSON.stringify(base)} + 'pyodide.js'); py = await loadPyodide({ indexURL: ${JSON.stringify(base)} }); self.postMessage({ boot: 1, ok: true }); }
    catch (x) { self.postMessage({ boot: 1, ok: false, err: String((x && x.message) || x) }); }
    return;
  }
  const out = [];
  py.setStdout({ batched: (s) => { if (out.length < 400) out.push(s); } });
  py.setStderr({ batched: (s) => { if (out.length < 400) out.push(s); } });
  let err = null, res = null;
  const ns = py.globals.get('dict')();
  try {
    try { await py.loadPackagesFromImports(d.code); } catch (x) { /* paquet introuvable : l'import échouera avec un message clair */ }
    await py.runPythonAsync(d.code, { globals: ns });
  } catch (x) { err = String((x && x.message) || x); }
  if (!err && d.tests) {
    try { res = await py.runPythonAsync(d.tests, { globals: ns }); if (res && res.toJs) res = res.toJs(); }
    catch (x) { err = 'TESTS ' + String((x && x.message) || x); }
  }
  try { ns.destroy(); } catch (x) { /* déjà libéré */ }
  self.postMessage({ id: d.id, ok: !err, out: out.join('\\n'), err, res: typeof res === 'string' ? res : null });
};`;
  let W = null, pret = null, charge = false;
  function demarrer() {
    if (pret) return pret;
    const w = new Worker(URL.createObjectURL(new Blob([WSRC(BASE())], { type: 'text/javascript' })));
    W = w;
    pret = new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('Python ne s’est pas chargé en 90 s : réseau trop lent ?')), 90000);
      w.onmessage = (e) => { if (!e.data.boot) return; clearTimeout(t); if (e.data.ok) { charge = true; res(); } else rej(new Error('Python n’a pas pu se charger : ' + e.data.err)); };
      w.onerror = (e) => { clearTimeout(t); rej(new Error('Python n’a pas pu se charger' + (e && e.message ? ' : ' + e.message : ''))); };
      w.postMessage({ boot: 1 });
    });
    pret.catch(() => { try { w.terminate(); } catch (x) { /* déjà arrêté */ } if (W === w) { W = null; pret = null; charge = false; } });
    return pret;
  }
  async function executer(code, tests) {
    await demarrer();
    const w = W, ms = /^\s*(import|from)\s+(numpy|matplotlib|scipy)/m.test(code) ? 60000 : DELAI;
    return new Promise((res) => {
      const id = Date.now() + Math.random();
      const t = setTimeout(() => { try { w.terminate(); } catch (x) { /* déjà arrêté */ } if (W === w) { W = null; pret = null; charge = false; } res({ ok: false, temps: true, out: '', err: null }); }, ms);
      w.onmessage = (e) => { if (e.data.id !== id) return; clearTimeout(t); res(e.data); };
      w.postMessage({ id, code, tests });
    });
  }

  /* ---------- les tests cachés ---------- */
  const AVANT = (graine, code) => `import json as _json, math as _math, random as _rnd
_CODE = ${JSON.stringify(code)}
_R = []
def _t(_lab, _f):
    try:
        _ok, _det = _f()
        _R.append({'l': _lab, 'ok': bool(_ok), 'd': str(_det)})
    except Exception as _e:
        _R.append({'l': _lab, 'ok': False, 'd': type(_e).__name__ + ' : ' + str(_e)})
def _fn(_nom):
    _g = globals().get(_nom)
    if not callable(_g):
        raise NameError('la fonction ' + _nom + ' n’est pas définie')
    return _g
def _pr(a, b, tol=1e-6):
    return abs(a - b) <= tol * max(1.0, abs(b))
def _fx(x):
    return format(x, '.6g') if isinstance(x, float) else repr(x)
_rnd.seed(${graine})
`;
  const APRES = '\n_json.dumps(_R, ensure_ascii=False)\n';

  /* ---------- les exercices ---------- */
  const EX = [
    { id: 'dicho', titre: 'Recherche d’un zéro par dichotomie', src: 'd’après interne 2025, épreuve 1, question 9', min: 15,
      ctx: 'Le coefficient de perte de charge d’un fluide non newtonien est solution d’une équation implicite (Buckingham-Reiner) : on la résout numériquement par dichotomie.',
      enonce: 'Compléter la fonction <code>dichotomie(f, a, b, eps)</code> : elle renvoie une valeur approchée, à <code>eps</code> près, du zéro de <code>f</code> sur [a, b], <code>f(a)</code> et <code>f(b)</code> étant de signes contraires. La fonction peut être croissante ou décroissante.',
      jury: 'Fonction de dichotomie partiellement complétée, codage très peu traité (interne 2025, épreuve 1).',
      piege: 'Tester le signe de f(a)·f(m), pas celui de f(m) seul : sinon le code ne marche que pour une fonction croissante.',
      depart: `def dichotomie(f, a, b, eps):
    """Zéro de f sur [a, b] à eps près ; f(a) et f(b) sont de signes contraires."""
    while ____:              # tant que l’intervalle est plus large que eps
        m = (a + b) / 2
        if ____:             # le zéro est dans [a, m]
            b = m
        else:
            a = m
    return (a + b) / 2
`,
      sol: `def dichotomie(f, a, b, eps):
    """Zéro de f sur [a, b] à eps près ; f(a) et f(b) sont de signes contraires."""
    fa = f(a)                    # calculé une fois : f peut coûter cher
    while b - a > eps:
        m = (a + b) / 2
        fm = f(m)
        if fa * fm <= 0:         # changement de signe entre a et m
            b = m
        else:                    # sinon il est entre m et b
            a, fa = m, fm
    return (a + b) / 2
`,
      tests: `_d = _fn('dichotomie')
def _c1():
    _n = [0]
    def _f(x):
        _n[0] += 1
        return x**3 - 2*x - 5
    _r = _d(_f, 2, 3, 1e-6)
    return abs(_r - 2.0945514815423265) <= 2e-6 and _n[0] <= 200, 'dichotomie(x³ − 2x − 5, 2, 3, 1e-6) a rendu ' + _fx(_r) + ' en ' + str(_n[0]) + ' appels de f (racine 2.0945515)'
_t('Racine de x³ − 2x − 5 entre 2 et 3', _c1)
def _c2():
    _r = _d(lambda x: _math.cos(x) - x, 0, 1, 1e-8)
    return abs(_r - 0.7390851332151607) <= 2e-8, 'cos(x) − x sur [0, 1] : ' + _fx(_r) + ' (attendu 0.73908513)'
_t('Fonction décroissante : f(a) > 0 et f(b) < 0', _c2)
def _c3():
    _c = round(_rnd.uniform(2, 50), 3)
    _r = _d(lambda x: x*x - _c, 0, _c, 1e-7)
    return abs(_r - _math.sqrt(_c)) <= 2e-7, 'zéro de x² − ' + str(_c) + ' : ' + _fx(_r) + ' (attendu ' + _fx(_math.sqrt(_c)) + ')'
_t('Valeur tirée au hasard', _c3)
def _c4():
    _z = round(_rnd.uniform(1, 9), 2)
    _r = _d(lambda x: x - _z, 0, 10, 0.1)
    return abs(_r - _z) <= 0.1, 'eps = 0.1 sur [0, 10], zéro en ' + str(_z) + ' : ' + _fx(_r)
_t('La précision eps est respectée', _c4)` },
    { id: 'trap', titre: 'Intégrer des mesures par la méthode des trapèzes', src: 'type externe 2026, épreuve 2', min: 10,
      ctx: 'Un enregistreur relève la puissance consommée par une installation à des instants qui ne sont pas régulièrement espacés.',
      enonce: '<code>t</code> et <code>p</code> sont deux listes de même longueur : instants en secondes et puissances en watts. Compléter <code>energie(t, p)</code> qui renvoie l’énergie en joules par la méthode des trapèzes.',
      jury: 'Méthode des trapèzes et programmation : majoritairement mal traitées ; seuls 2/5 des candidats ont abordé l’exploitation des données (externe 2026, épreuve 2).',
      piege: 'Le pas n’est pas constant : chaque trapèze a sa propre largeur t[i + 1] − t[i]. La boucle s’arrête à len(t) − 1.',
      depart: `def energie(t, p):
    """Énergie (J) par la méthode des trapèzes ; t en s (pas quelconque), p en W."""
    E = 0
    for i in range(____):
        E = E + ____
    return E
`,
      sol: `def energie(t, p):
    """Énergie (J) par la méthode des trapèzes ; t en s (pas quelconque), p en W."""
    E = 0
    for i in range(len(t) - 1):                    # n mesures donnent n − 1 trapèzes
        E = E + (p[i] + p[i + 1]) / 2 * (t[i + 1] - t[i])
    return E
`,
      tests: `_e = _fn('energie')
_t('Puissance constante : 100 W pendant 3 s', lambda: (_pr(_e([0, 1, 2, 3], [100, 100, 100, 100]), 300), 'energie([0, 1, 2, 3], [100, 100, 100, 100]) = ' + _fx(_e([0, 1, 2, 3], [100, 100, 100, 100])) + ' (attendu 300)'))
def _c2():
    _tt = sorted(round(_rnd.uniform(0, 10), 3) for _ in range(12))
    _a = _tt[-1]**2 - _tt[0]**2
    _r = _e(_tt, [2*x for x in _tt])
    return _pr(_r, _a, 1e-9), 'instants irréguliers, p = 2t : ' + _fx(_r) + ' (attendu ' + _fx(_a) + ', exact pour des trapèzes)'
_t('Pas variable', _c2)
def _c3():
    _tt = [k*_math.pi/1000 for k in range(1001)]
    _r = _e(_tt, [_math.sin(x) for x in _tt])
    return abs(_r - 2) < 1e-4, 'sin t sur [0, π] : ' + _fx(_r) + ' (attendu 2)'
_t('Sinusoïde sur une demi-période', _c3)
_t('Une seule mesure : énergie nulle', lambda: (_e([0.0], [50.0]) == 0, 'energie([0], [50]) = ' + _fx(_e([0.0], [50.0]))))` },
    { id: 'euler', titre: 'Un filtre du premier ordre par la méthode d’Euler', src: 'type des écrits, sujets récents', min: 10,
      ctx: 'Un capteur est filtré numériquement par un passe-bas du premier ordre τ·dy/dt + y = x, échantillonné à la période Te.',
      enonce: 'Avec la méthode d’Euler explicite (la dérivée à l’instant n − 1 est approchée par (y[n] − y[n − 1])/Te), compléter <code>filtre(x, Te, tau)</code> qui renvoie la liste y, de même longueur que x, en partant de y[0] = 0.',
      jury: 'Écriture et interprétation du code approximatives (externe 2025, épreuve 1).',
      piege: 'Euler explicite : y[n] = y[n − 1] + (Te/τ)·(x[n − 1] − y[n − 1]). Écrire d’abord la récurrence sur la copie, puis la coder.',
      depart: `def filtre(x, Te, tau):
    """Euler explicite pour tau·dy/dt + y = x, avec y[0] = 0."""
    y = [0.0] * len(x)
    for n in range(1, len(x)):
        y[n] = ____
    return y
`,
      sol: `def filtre(x, Te, tau):
    """Euler explicite pour tau·dy/dt + y = x, avec y[0] = 0."""
    y = [0.0] * len(x)
    for n in range(1, len(x)):
        # (y[n] − y[n−1])/Te = (x[n−1] − y[n−1])/tau
        y[n] = y[n - 1] + Te / tau * (x[n - 1] - y[n - 1])
    return y
`,
      tests: `_f = _fn('filtre')
def _ref(x, Te, tau):
    y = [0.0]*len(x)
    for n in range(1, len(x)):
        y[n] = y[n-1] + Te/tau*(x[n-1] - y[n-1])
    return y
def _c1():
    _y = _f([1.0]*50, 1e-3, 0.01)
    return len(_y) == 50 and _y[0] == 0 and abs(_y[10] - (1 - 0.9**10)) < 1e-9, 'échelon, Te = 1 ms, τ = 10 ms : y[10] = ' + (_fx(_y[10]) if len(_y) > 10 else 'absent') + ' (attendu ' + _fx(1 - 0.9**10) + ' : environ 65 % après une constante de temps)'
_t('Réponse à un échelon', _c1)
def _c2():
    _x = [_rnd.uniform(-5, 5) for _ in range(40)]
    _tau = _rnd.choice([1e-3, 2e-3, 5e-3])
    _y, _a = _f(_x, 2e-4, _tau), _ref(_x, 2e-4, _tau)
    _e = max(abs(u - v) for u, v in zip(_y, _a)) if len(_y) == len(_a) else 1
    return _e < 1e-9, 'signal tiré au hasard : écart maximal ' + _fx(_e) + ' avec la récurrence attendue'
_t('Signal quelconque', _c2)
_t('La liste rendue a la longueur de x', lambda: (len(_f([0.0]*7, 1e-3, 1e-2)) == 7, 'longueur ' + str(len(_f([0.0]*7, 1e-3, 1e-2))) + ' pour 7 échantillons'))` },
    { id: 'fir', titre: 'Un filtre numérique non récursif', src: 'type des écrits, sujets récents', min: 10,
      ctx: 'Un microcontrôleur lisse une mesure par un filtre à réponse impulsionnelle finie de coefficients h[0], …, h[M − 1].',
      enonce: 'y[n] = Σ h[k]·x[n − k] pour k de 0 à M − 1, avec x[n − k] = 0 lorsque n − k &lt; 0. Compléter <code>fir(x, h)</code> qui renvoie la liste y.',
      jury: 'Peu de candidats traitent les questions d’algorithmique (externe 2023).',
      piege: 'Au début de l’enregistrement, il manque des échantillons passés : on les compte nuls, sans indice négatif (x[−1] est le dernier élément en Python).',
      depart: `def fir(x, h):
    """y[n] = somme des h[k]·x[n − k], avec x[n − k] = 0 si n − k < 0."""
    y = []
    for n in range(len(x)):
        s = 0
        for k in range(len(h)):
            if ____:
                s = s + ____
        y.append(s)
    return y
`,
      sol: `def fir(x, h):
    """y[n] = somme des h[k]·x[n − k], avec x[n − k] = 0 si n − k < 0."""
    y = []
    for n in range(len(x)):
        s = 0
        for k in range(len(h)):
            if n - k >= 0:           # x[-1] existerait en Python : il faut l’exclure
                s = s + h[k] * x[n - k]
        y.append(s)
    return y
`,
      tests: `_f = _fn('fir')
def _ref(x, h):
    return [sum(h[k]*x[n-k] for k in range(len(h)) if n-k >= 0) for n in range(len(x))]
def _c1():
    _y = _f([1, 0, 0, 0, 0], [0.5, 0.3, 0.2])
    return len(_y) == 5 and all(abs(a - b) < 1e-12 for a, b in zip(_y, [0.5, 0.3, 0.2, 0, 0])), 'impulsion : ' + str(_y) + ' (attendu [0.5, 0.3, 0.2, 0, 0])'
_t('Réponse impulsionnelle', _c1)
def _c2():
    _x = [round(_rnd.uniform(0, 10), 2) for _ in range(20)]
    _y, _a = _f(_x, [1/3]*3), _ref(_x, [1/3]*3)
    _e = max(abs(u - v) for u, v in zip(_y, _a)) if len(_y) == len(_a) else 1
    return _e < 1e-9, 'moyenne glissante sur 3 points : écart maximal ' + _fx(_e)
_t('Moyenne glissante, début compris', _c2)
def _c3():
    _x = [_rnd.uniform(-1, 1) for _ in range(30)]
    _h = [_rnd.uniform(-1, 1) for _ in range(5)]
    _y, _a = _f(_x, _h), _ref(_x, _h)
    _e = max(abs(u - v) for u, v in zip(_y, _a)) if len(_y) == len(_a) else 1
    return _e < 1e-9, 'coefficients tirés au hasard : écart maximal ' + _fx(_e)
_t('Coefficients quelconques', _c3)` },
    { id: 'rms', titre: 'Valeurs moyenne et efficace d’un signal échantillonné', src: 'type des écrits, sujets récents', min: 10,
      ctx: 'Un analyseur échantillonne une tension sur un nombre entier de périodes.',
      enonce: 'Compléter <code>moyenne(x)</code> et <code>efficace(x)</code> avec une boucle (sans <code>sum</code> ni bibliothèque de calcul).',
      jury: 'Pont PD3 : forme d’onde connue, mais calculs de valeur moyenne et efficace non maîtrisés par la plupart (interne 2026, épreuve 2).',
      piege: 'La valeur efficace est la racine de la moyenne des carrés, pas la moyenne des valeurs absolues.',
      depart: `import math

def moyenne(x):
    s = 0
    for v in x:
        s = s + ____
    return ____

def efficace(x):
    s = 0
    for v in x:
        s = s + ____
    return ____
`,
      sol: `import math

def moyenne(x):
    s = 0
    for v in x:
        s = s + v
    return s / len(x)

def efficace(x):
    s = 0
    for v in x:
        s = s + v * v               # moyenne des carrés…
    return math.sqrt(s / len(x))    # …puis la racine
`,
      tests: `_m, _ef = _fn('moyenne'), _fn('efficace')
_A, _o = round(_rnd.uniform(1, 10), 2), round(_rnd.uniform(-3, 3), 2)
_x = [_o + _A*_math.sin(2*_math.pi*10*k/1000) for k in range(1000)]
_t('Moyenne d’une sinusoïde décalée', lambda: (_pr(_m(_x), _o, 1e-9), 'moyenne = ' + _fx(_m(_x)) + ' (attendu ' + _fx(_o) + ')'))
_t('Valeur efficace', lambda: (_pr(_ef(_x), _math.sqrt(_o**2 + _A**2/2), 1e-9), 'efficace = ' + _fx(_ef(_x)) + ' (attendu √((' + _fx(_o) + ')² + ' + _fx(_A) + '²/2) = ' + _fx(_math.sqrt(_o**2 + _A**2/2)) + ')'))
_t('Créneau 0 et 10 V, rapport cyclique 1/4', lambda: (_pr(_m([10, 0, 0, 0]*25), 2.5, 1e-9) and _pr(_ef([10, 0, 0, 0]*25), 5, 1e-9), 'moyenne ' + _fx(_m([10, 0, 0, 0]*25)) + ', efficace ' + _fx(_ef([10, 0, 0, 0]*25)) + ' (attendu 2.5 et 5)'))` },
    { id: 'i2c', titre: 'Décoder la mesure d’un capteur I²C sur 12 bits', src: 'type interne 2026, épreuve 2', min: 10,
      ctx: 'Un capteur de température renvoie sa mesure sur le bus I²C en deux octets, msb puis lsb.',
      enonce: 'La mesure est un entier signé en complément à deux sur 12 bits, cadré à gauche : les 8 bits de msb suivis des 4 bits de poids fort de lsb. Une unité vaut 0,0625 °C. Compléter <code>temperature(msb, lsb)</code>.',
      jury: 'Bus I²C peu connu ; ceux qui ont abordé l’analyse de trame l’ont bien traitée (interne 2026, épreuve 2).',
      piege: 'Sur 12 bits, le bit de signe vaut 0x800 et on retranche 2¹² = 4096 ; lsb doit être décalé de 4 bits vers la droite.',
      depart: `def temperature(msb, lsb):
    """Mesure sur 12 bits en complément à deux, cadrée à gauche ; 1 unité = 0,0625 °C."""
    brut = ____            # les 8 bits de msb suivis des 4 bits de poids fort de lsb
    if ____:               # bit de signe à 1 : valeur négative
        brut = brut - ____
    return brut * 0.0625
`,
      sol: `def temperature(msb, lsb):
    """Mesure sur 12 bits en complément à deux, cadrée à gauche ; 1 unité = 0,0625 °C."""
    brut = (msb << 4) | (lsb >> 4)     # 8 + 4 = 12 bits
    if brut & 0x800:                    # bit 11 : signe
        brut = brut - 4096              # 2 puissance 12
    return brut * 0.0625
`,
      tests: `_f = _fn('temperature')
def _ref(msb, lsb):
    b = (msb << 4) | (lsb >> 4)
    return (b - 4096 if b & 0x800 else b) * 0.0625
for _cas in [(0x19, 0x00, 25.0), (0xFF, 0xF0, -0.0625), (0xE7, 0x00, -25.0), (0x7F, 0xF0, 127.9375)]:
    _t('Octets 0x%02X et 0x%02X' % (_cas[0], _cas[1]), (lambda c: lambda: (abs(_f(c[0], c[1]) - c[2]) < 1e-9, 'temperature(0x%02X, 0x%02X) = ' % (c[0], c[1]) + _fx(_f(c[0], c[1])) + ' (attendu ' + _fx(c[2]) + ' °C)'))(_cas))
def _c5():
    _ok, _bad = 0, ''
    for _ in range(50):
        _a, _b = _rnd.randrange(256), _rnd.randrange(16) << 4
        if abs(_f(_a, _b) - _ref(_a, _b)) < 1e-9:
            _ok += 1
        elif not _bad:
            _bad = ' ; par exemple 0x%02X, 0x%02X donne ' % (_a, _b) + _fx(_f(_a, _b)) + ' au lieu de ' + _fx(_ref(_a, _b))
    return _ok == 50, str(_ok) + ' mesures sur 50 bien décodées' + _bad
_t('50 mesures tirées au hasard', _c5)` },
    { id: 'cap', titre: 'Un cap sans se tromper de quadrant', src: 'piège de l’externe 2025, épreuve 2', min: 5,
      ctx: 'Un magnétomètre donne les composantes bx et by du champ dans le repère d’un robot.',
      enonce: 'Le cap est l’angle du vecteur (bx, by) compté depuis l’axe x dans le sens trigonométrique, en degrés, dans [0, 360[. Compléter <code>cap(bx, by)</code>.',
      jury: 'Aucun candidat n’a tenu compte du signe de l’argument de l’arc tangente (externe 2025, épreuve 2, question 55).',
      piege: 'math.atan(by/bx) se trompe de 180° quand bx &lt; 0 et divise par zéro quand bx = 0 : math.atan2(by, bx) règle les deux.',
      depart: `import math

def cap(bx, by):
    """Angle de (bx, by) depuis l’axe x, sens trigonométrique, en degrés dans [0, 360[."""
    return ____
`,
      sol: `import math

def cap(bx, by):
    """Angle de (bx, by) depuis l’axe x, sens trigonométrique, en degrés dans [0, 360[."""
    a = math.degrees(math.atan2(by, bx))   # entre −180 et 180, bon quadrant
    return a % 360                          # ramené entre 0 et 360
`,
      tests: `_f = _fn('cap')
for _cas in [(1, 0, 0), (0, 2, 90), (-3, 0, 180), (0, -1, 270), (-1, -1, 225), (-1, 1, 135), (1, -1, 315)]:
    _t('bx = ' + str(_cas[0]) + ', by = ' + str(_cas[1]), (lambda c: lambda: (abs(_f(c[0], c[1]) - c[2]) < 1e-9, 'cap = ' + _fx(_f(c[0], c[1])) + ' (attendu ' + str(c[2]) + '°)'))(_cas))
def _c8():
    _bad = ''
    for _ in range(40):
        _th, _r = _rnd.uniform(0, 359.9), _rnd.uniform(0.2, 5)
        _v = _f(_r*_math.cos(_math.radians(_th)), _r*_math.sin(_math.radians(_th)))
        if not (0 <= _v < 360 and abs(_v - _th) < 1e-6):
            _bad = 'pour ' + _fx(_th) + '° : ' + _fx(_v)
            break
    return not _bad, _bad or '40 directions tirées au hasard, toutes justes et entre 0 et 360°'
_t('Directions tirées au hasard', _c8)` },
    { id: 'po', titre: 'Perturber et observer : suivre le maximum de puissance', src: 'type externe 2026, épreuve 1', min: 15,
      ctx: 'Un convertisseur règle la tension d’un panneau photovoltaïque pour en tirer le maximum de puissance.',
      enonce: 'La fonction <code>panneau(v)</code> (fournie par les tests) donne le courant sous la tension v. Compléter <code>mppt(panneau, v0, dv, n)</code> : à chaque pas, mesurer p = v·panneau(v) ; si la puissance a baissé depuis le pas précédent, inverser le sens de variation ; mémoriser la puissance, puis v ← v ± dv. Renvoyer la dernière tension de consigne.',
      jury: 'Mise à jour des paramètres dans une boucle infinie Python mal faite (externe 2026, épreuve 1).',
      piege: 'Oublier de mémoriser la puissance du pas (p_prec = p) : la comparaison se fait alors toujours avec le premier point et la consigne part à la dérive.',
      depart: `def mppt(panneau, v0, dv, n):
    """Perturber et observer : n pas à partir de v0 ; renvoie la dernière tension de consigne.
    panneau(v) renvoie le courant (A) du panneau sous la tension v (V)."""
    v = v0
    p_prec = v * panneau(v)
    sens = 1
    v = v + sens * dv
    for k in range(n):
        p = ____
        if ____:
            sens = ____
        ____                 # mémoriser la puissance de ce pas
        v = v + sens * dv
    return v
`,
      sol: `def mppt(panneau, v0, dv, n):
    """Perturber et observer : n pas à partir de v0 ; renvoie la dernière tension de consigne."""
    v = v0
    p_prec = v * panneau(v)
    sens = 1
    v = v + sens * dv
    for k in range(n):
        p = v * panneau(v)          # une mesure par pas
        if p < p_prec:              # la puissance a baissé : demi-tour
            sens = -sens
        p_prec = p                  # mise à jour, sinon on compare au premier point
        v = v + sens * dv
    return v
`,
      tests: `_f = _fn('mppt')
def _pv(Isc, Voc):
    Vt = Voc/16
    I0 = Isc/(_math.exp(Voc/Vt) - 1)
    return lambda v: max(0.0, Isc - I0*(_math.exp(v/Vt) - 1))
_Isc, _Voc = round(_rnd.uniform(6, 10), 2), round(_rnd.uniform(36, 46), 1)
_pan = _pv(_Isc, _Voc)
_vm = max((_Voc*k/20000 for k in range(20001)), key=lambda v: v*_pan(v))
def _c1():
    _v = _f(_pan, 0.5*_Voc, 0.2, 400)
    return abs(_v - _vm) <= 0.61, 'départ à ' + _fx(0.5*_Voc) + ' V : arrivée à ' + _fx(_v) + ' V, maximum à ' + _fx(_vm) + ' V (écart toléré : 3 pas)'
_t('Départ sous la tension du maximum', _c1)
def _c2():
    _v = _f(_pan, 0.95*_Voc, 0.2, 400)
    return abs(_v - _vm) <= 0.61, 'départ à ' + _fx(0.95*_Voc) + ' V : arrivée à ' + _fx(_v) + ' V, maximum à ' + _fx(_vm) + ' V'
_t('Départ au-dessus : il faut savoir faire demi-tour', _c2)
def _c3():
    _n = [0]
    def _p2(v):
        _n[0] += 1
        return _pan(v)
    _f(_p2, 0.5*_Voc, 0.2, 100)
    return 100 <= _n[0] <= 202, str(_n[0]) + ' mesures pour 100 pas (une par pas attendue)'
_t('Une mesure par pas', _c3)` },
    { id: 'maxi', titre: 'Le maximum et son instant, sans max()', src: 'type des écrits, sujets récents', min: 5,
      ctx: 'On cherche dans un enregistrement l’instant où le courant de démarrage est le plus fort.',
      enonce: 'Compléter <code>maximum(t, x)</code> qui renvoie le couple (instant, valeur) du maximum de x, sans utiliser <code>max</code> ni de tri ; en cas d’égalité, le premier.',
      jury: 'Peu de candidats traitent les questions d’algorithmique (externe 2023).',
      piege: 'Initialiser avec le premier élément, pas avec 0 : si toutes les valeurs sont négatives, 0 n’est jamais dépassé.',
      depart: `def maximum(t, x):
    """(instant, valeur) du maximum de x, sans max() ni tri ; le premier en cas d’égalité."""
    i_max = ____
    for i in range(____):
        if ____:
            i_max = i
    return (t[i_max], x[i_max])
`,
      sol: `def maximum(t, x):
    """(instant, valeur) du maximum de x, sans max() ni tri ; le premier en cas d’égalité."""
    i_max = 0                       # le premier élément, pas la valeur 0
    for i in range(1, len(x)):
        if x[i] > x[i_max]:         # > strict : on garde le premier en cas d’égalité
            i_max = i
    return (t[i_max], x[i_max])
`,
      tests: `_f = _fn('maximum')
def _c1():
    _x = [round(_rnd.uniform(-10, 30), 2) for _ in range(25)]
    _t0 = [round(0.1*k, 1) for k in range(25)]
    _r, _i = _f(_t0, _x), _x.index(max(_x))
    return tuple(_r) == (_t0[_i], _x[_i]), 'renvoie ' + str(_r) + ', attendu ' + str((_t0[_i], _x[_i]))
_t('Liste tirée au hasard', _c1)
def _c2():
    _x = [-round(_rnd.uniform(1, 9), 2) for _ in range(10)]
    _r, _i = _f(list(range(10)), _x), _x.index(max(_x))
    return tuple(_r) == (_i, _x[_i]), 'valeurs toutes négatives : ' + str(_r) + ', attendu ' + str((_i, _x[_i]))
_t('Toutes les valeurs négatives', _c2)
_t('En cas d’égalité, le premier', lambda: (tuple(_f([0, 1, 2, 3], [4, 7, 7, 1])) == (1, 7), 'renvoie ' + str(_f([0, 1, 2, 3], [4, 7, 7, 1])) + ', attendu (1, 7)'))
def _interdit():
    import ast as _ast
    try:
        _tr = _ast.parse(_CODE)
    except Exception:
        return False
    for _n in _ast.walk(_tr):
        if isinstance(_n, _ast.Call):
            _g = _n.func
            if (isinstance(_g, _ast.Name) and _g.id in ('max', 'sorted')) or (isinstance(_g, _ast.Attribute) and _g.attr == 'sort'):
                return True
    return False
_t('Sans max() ni tri', lambda: (not _interdit(), 'ni max() ni tri' if not _interdit() else 'max(), sorted() ou sort() apparaît dans ton code : la question l’interdit'))` },
    { id: 'fronts', titre: 'La vitesse d’un moteur à partir d’un codeur', src: 'type des écrits, sujets récents', min: 10,
      ctx: 'Un codeur incrémental donne n_imp impulsions par tour ; son signal est échantillonné à la période Te.',
      enonce: 'La liste s contient des 0 et des 1. Compléter <code>vitesse(s, Te, n_imp)</code> qui compte les fronts montants (passage de 0 à 1) et renvoie la vitesse moyenne en tr/min sur la durée de l’enregistrement, len(s)·Te.',
      jury: 'Écriture et interprétation du code approximatives (externe 2025, épreuve 1).',
      piege: 'Un front montant se repère sur deux échantillons consécutifs : s[i − 1] == 0 et s[i] == 1. Un niveau haut n’est pas un front.',
      depart: `def vitesse(s, Te, n_imp):
    """Vitesse moyenne (tr/min) : fronts montants comptés sur len(s)·Te secondes."""
    fronts = 0
    for i in range(1, len(s)):
        if ____:
            fronts = fronts + 1
    duree = ____
    return ____
`,
      sol: `def vitesse(s, Te, n_imp):
    """Vitesse moyenne (tr/min) : fronts montants comptés sur len(s)·Te secondes."""
    fronts = 0
    for i in range(1, len(s)):
        if s[i - 1] == 0 and s[i] == 1:     # passage de 0 à 1
            fronts = fronts + 1
    duree = len(s) * Te                       # en secondes
    return fronts / n_imp / duree * 60        # tours par seconde → tr/min
`,
      tests: `_f = _fn('vitesse')
def _sq(f_imp, Te, N):
    return [1 if ((k*Te*f_imp) % 1) < 0.5 else 0 for k in range(N)]
def _ref(s, Te, n):
    c = sum(1 for i in range(1, len(s)) if s[i-1] == 0 and s[i] == 1)
    return c/n/(len(s)*Te)*60
def _c1():
    _n = _rnd.choice([100, 256, 500, 1024])
    _N = _rnd.choice([300, 750, 1200, 1500])
    _fi = _N/60*_n
    _Te = 1/(_fi*_rnd.choice([8, 10, 16]))
    _s = _sq(_fi, _Te, 4000)
    _v, _a = _f(_s, _Te, _n), _ref(_s, _Te, _n)
    return abs(_v - _a) <= 1e-6*max(1, _a), 'codeur de ' + str(_n) + ' impulsions par tour à ' + str(_N) + ' tr/min : ' + _fx(_v) + ' tr/min calculés, ' + _fx(_a) + ' attendus'
_t('Signal de codeur', _c1)
_t('Signal constant : vitesse nulle', lambda: (_f([1]*100, 1e-4, 500) == 0 and _f([0]*100, 1e-4, 500) == 0, 'signal constant : ' + _fx(_f([1]*100, 1e-4, 500))))
_t('Un niveau haut au début n’est pas un front', lambda: (abs(_f([1, 1, 0, 0, 1, 1, 0, 0], 0.01, 1) - 1/0.08*60) < 1e-6, 'renvoie ' + _fx(_f([1, 1, 0, 0, 1, 1, 0, 0], 0.01, 1)) + ' tr/min, attendu ' + _fx(1/0.08*60) + ' (un seul front montant)'))` }
  ];

  /* ---------- erreurs Python expliquées ---------- */
  function nettoyer(err) {
    if (!err) return '';
    const L = String(err).replace(/^TESTS /, '').split('\n');
    let i = L.findIndex((l) => /File "<exec>"/.test(l));
    const garde = i >= 0 ? L.slice(i) : L.filter((l) => !/\/lib\/python|_pyodide|pyodide\.asm|^\s*\^+\s*$/.test(l));
    return garde.join('\n').replace(/File "<exec>", /g, '').replace(/\bline (\d+), in <module>/g, 'ligne $1').replace(/\bline (\d+), in (\w+)/g, 'ligne $1, dans $2').replace(/\bline (\d+)/g, 'ligne $1').trim();
  }
  function conseil(err, temps) {
    if (temps) return 'Une boucle ne s’arrête pas : la condition du while change-t-elle à chaque tour ? Le programme a été arrêté au bout de 8 s.';
    const e = String(err || '');
    if (/name '_{2,}' is not defined/.test(e)) return 'Il reste des ____ à remplacer par ton code.';
    if (/IndentationError|TabError/.test(e)) return 'Indentation : 4 espaces par niveau, après chaque ligne qui finit par deux-points.';
    if (/SyntaxError/.test(e)) return 'Syntaxe : deux-points en fin de ligne (def, if, for, while), parenthèses fermées, = pour affecter et == pour comparer.';
    if (/NameError/.test(e)) return 'Nom inconnu : vérifie l’orthographe, les majuscules, et qu’il est défini avant d’être utilisé (import math pour math.sqrt).';
    if (/IndexError/.test(e)) return 'Indice hors de la liste : les indices vont de 0 à len(x) − 1.';
    if (/ZeroDivisionError/.test(e)) return 'Division par zéro : un dénominateur nul, ou une liste vide ?';
    if (/TypeError/.test(e)) return 'Type : un nombre, une liste ou une fonction n’est pas utilisé comme prévu (appel, indice, opération).';
    if (/RecursionError/.test(e)) return 'Récursion sans fin : la fonction s’appelle elle-même sans condition d’arrêt.';
    return '';
  }

  /* ---------- pages ---------- */
  const essais = (id) => S().py.filter((x) => x.id === id);
  const meilleur = (id) => essais(id).reduce((m, x) => (x.n && (!m || x.ok / x.n > m.ok / m.n) ? x : m), null);
  function css() {
    if ($('#py-css')) return;
    const s = document.createElement('style'); s.id = 'py-css';
    s.textContent = `.py-ed{display:block;width:100%;box-sizing:border-box;min-height:300px;font:13.5px/1.55 ui-monospace,Menlo,Consolas,monospace;tab-size:4;white-space:pre;overflow:auto;padding:12px 14px;border:1px solid #bbccd8;border-radius:10px;background:#fbfdfe;color:#0f1d2b;resize:vertical}
.py-out{background:#0f1d2b;color:#e6edf3;font:12.5px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:10px 14px;border-radius:10px;white-space:pre-wrap;word-break:break-word;max-height:320px;overflow:auto;margin:8px 0}
.py-err{background:#fdf0ee;border-left:4px solid #c9483b;border-radius:8px;padding:10px 14px;margin:8px 0}
.py-err pre{font:12.5px/1.5 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word;margin:6px 0 0}
.py-ts{list-style:none;padding:0;margin:8px 0;display:grid;gap:6px}
.py-ts li{background:#fff;border-radius:8px;padding:8px 12px;border-left:4px solid #c9483b;font-size:14px}
.py-ts li.ok{border-left-color:#2f9e6e}
.py-ts li small{display:block;color:#42596b;margin-top:2px;word-break:break-word}
.py-sol{font:13px/1.55 ui-monospace,Menlo,Consolas,monospace;white-space:pre;overflow:auto;background:#f1f7f3;border-left:4px solid #2f9e6e;border-radius:8px;padding:10px 14px}
.py-st{font-weight:600;color:#12566f}
code{font:.92em ui-monospace,Menlo,Consolas,monospace;background:#eef3f6;border-radius:4px;padding:0 4px}`;
    document.head.appendChild(s);
  }
  function carte() {
    const ok = EX.filter((x) => { const m = meilleur(x.id); return m && m.ok === m.n; }).length;
    return `<div class="ec-ep" style="--c:#2b7a3e"><div class="eyebrow">Interne et externe · toutes les épreuves</div><h3>Python comme aux écrits</h3><p class="muted">Dix fonctions du type des sujets récents à compléter dans la page : dichotomie, trapèzes, Euler, filtre, valeur efficace, trame I²C, arc tangente, perturber et observer. Le code s’exécute ici, des tests cachés disent ce qui marche.${S().py.length ? ` ${ok} / ${EX.length} réussies entièrement.` : ''}</p><div class="btns"><a class="b" href="#ecrits-python">Coder</a></div></div>`;
  }
  function accueil() {
    css();
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · Python</div><h1>Python comme aux écrits</h1>
    <p class="muted">Les sujets demandent de compléter ou d’écrire une fonction Python sur le document réponse, et les rapports disent que le codage est « très peu traité ». Ici, chaque fonction s’écrit dans la page et s’exécute dans la page : des tests cachés, avec des valeurs tirées au hasard, vérifient le résultat, puis le corrigé commenté montre ce qu’un correcteur attend. La première exécution charge Python dans le navigateur (environ 10 Mo, une seule fois).</p><div class="ec-grid">`;
    EX.forEach((x) => {
      const m = meilleur(x.id), n = essais(x.id).length;
      const etat = m ? (m.ok === m.n ? '<span class="ec-tag ok">réussie</span>' : `<span class="ec-tag w">${m.ok} / ${m.n} tests</span>`) : '<span class="ec-tag">à faire</span>';
      h += `<div class="ec-ep" style="--c:#2b7a3e"><div class="eyebrow">${E(x.src)} · ${x.min} min</div><h3>${E(x.titre)}</h3><p class="muted">${E(x.ctx)}</p><p class="muted">${etat}${n ? ` · ${n} essai${n > 1 ? 's' : ''}` : ''}</p><div class="btns"><a class="b" href="#ecrits-python-${x.id}">Coder</a></div></div>`;
    });
    h += `</div><p class="muted" style="margin-top:18px">Pour la méthode et les questions de lecture de code, la notion <a href="#n-python">Python et algorithmes</a>.</p>`;
    app().innerHTML = h;
  }
  function exercice(id) {
    css();
    const X = EX.find((x) => x.id === id); if (!X) return accueil();
    const cle = 'agreg-py-' + id, brouillon = lire(cle);
    app().innerHTML = `<a class="back" href="#ecrits-python">← Python comme aux écrits</a><div class="eyebrow">${E(X.src)} · ${X.min} min</div><h1>${E(X.titre)}</h1>
      <div class="card"><p>${E(X.ctx)}</p><p><b>Question :</b> ${X.enonce}</p></div>
      <div class="jury"><b>Ce que le jury a écrit</b><p>${E(X.jury)}</p></div>
      <h2 class="sec">Ton code</h2>
      <textarea id="py-ed" class="py-ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Code Python">${E(brouillon != null ? brouillon : X.depart)}</textarea>
      <div class="btns" style="margin-top:10px;align-items:center"><button class="b" id="py-go">Exécuter et tester</button><button class="b sec" id="py-run">Exécuter seulement</button><button class="b sec" id="py-raz">Repartir de l’énoncé</button><span class="py-st" id="py-st" role="status"></span></div>
      <div id="py-res"></div>
      <details class="keep" id="py-pg"><summary>Le piège</summary><p>${X.piege}</p></details>
      <details class="keep" id="py-cor"><summary>Un corrigé commenté</summary><pre class="py-sol">${E(X.sol)}</pre><p class="muted">Sur la copie : des noms parlants, un commentaire par étape, l’indentation lisible, et une phrase qui dit ce que renvoie la fonction.</p></details>
      <div class="btns" style="margin-top:10px"><button class="b sec" id="py-ia">Faire relire mon code par le jury IA</button></div><div id="py-iares"></div>`;
    const ed = $('#py-ed');
    ed.oninput = () => ecrire(cle, ed.value.slice(0, 20000));
    ed.onkeydown = (e) => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ed.setRangeText('    ', ed.selectionStart, ed.selectionEnd, 'end'); ecrire(cle, ed.value); }
      else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        const a = ed.selectionStart, ligne = ed.value.slice(0, a).split('\n').pop(), ind = (ligne.match(/^ */) || [''])[0] + (/:\s*(#.*)?$/.test(ligne) ? '    ' : '');
        e.preventDefault(); ed.setRangeText('\n' + ind, a, ed.selectionEnd, 'end'); ecrire(cle, ed.value);
      }
    };
    ed.addEventListener('focus', () => { demarrer().catch(() => { /* signalé à l'exécution */ }); }, { once: true });
    $('#py-raz').onclick = () => { ed.value = X.depart; ecrire(cle, null); $('#py-res').innerHTML = ''; };
    $('#py-go').onclick = () => lancer(X, true);
    $('#py-run').onclick = () => lancer(X, false);
    $('#py-ia').onclick = () => relire(X);
  }
  async function lancer(X, avecTests) {
    const code = $('#py-ed').value, st0 = $('#py-st'), res = $('#py-res'), bt = [$('#py-go'), $('#py-run')];
    bt.forEach((b) => { b.disabled = true; }); res.innerHTML = '';
    st0.textContent = charge ? 'Exécution…' : 'Chargement de Python dans la page (environ 10 Mo la première fois)…';
    let r;
    try {
      const graine = Math.floor(Math.random() * 1e6);
      r = await executer(code, avecTests ? AVANT(graine, code) + X.tests + APRES : null);
    } catch (e) {
      st0.textContent = ''; bt.forEach((b) => { b.disabled = false; });
      res.innerHTML = `<div class="py-err"><b>${E(e.message || 'Python n’a pas pu se charger.')}</b><p class="muted">Il faut le réseau pour la première exécution ; ensuite Python reste en cache sur cet appareil.</p></div>`;
      return;
    }
    if (!$('#py-res')) return;
    st0.textContent = ''; bt.forEach((b) => { b.disabled = false; });
    let h = '';
    if (r.out) h += `<div class="eyebrow">Sortie</div><div class="py-out">${E(r.out.slice(0, 8000))}</div>`;
    if (r.temps || r.err) {
      const c = conseil(r.err, r.temps), tr = nettoyer(r.err);
      h += `<div class="py-err"><b>${r.temps ? 'Arrêté au bout de 8 s' : String(r.err).startsWith('TESTS ') ? 'Erreur pendant les tests' : 'Erreur à l’exécution'}</b>${c ? `<p>${E(c)}</p>` : ''}${tr ? `<pre>${E(tr.slice(0, 3000))}</pre>` : ''}</div>`;
    }
    let T = null;
    try { T = r.res ? JSON.parse(r.res) : null; } catch (e) { T = null; }
    if (avecTests && Array.isArray(T)) {
      const ok = T.filter((t) => t.ok).length;
      h += `<h3>${ok} / ${T.length} test${T.length > 1 ? 's' : ''} réussi${T.length > 1 ? 's' : ''}</h3><ul class="py-ts">${T.map((t) => `<li class="${t.ok ? 'ok' : ''}">${t.ok ? '✓' : '✗'} ${E(t.l)}<small>${E(t.d)}${/name '_{2,}' is not defined/.test(t.d) ? ' : il reste des ____ à remplacer par ton code.' : ''}</small></li>`).join('')}</ul>`;
      if (ok === T.length) h += '<p class="py-st">Tout passe. Compare avec le corrigé : sur la copie, la lisibilité compte aussi.</p>';
      S().py.push({ t: Date.now(), id: X.id, ok, n: T.length });
      if (S().py.length > 300) S().py.splice(0, S().py.length - 300);
      save();
    } else if (avecTests && (r.err || r.temps)) {
      S().py.push({ t: Date.now(), id: X.id, ok: 0, n: 0 }); save();
    } else if (!avecTests && !r.out && !r.err) h += '<p class="muted">Le code s’exécute sans erreur (il ne fait qu’écrire les fonctions : « Exécuter et tester » les appelle).</p>';
    $('#py-res').innerHTML = h;
  }
  async function relire(X) {
    const code = $('#py-ed').value.trim(), out = $('#py-iares'), b = $('#py-ia');
    if (!code || code === X.depart.trim()) { out.innerHTML = '<p class="muted">Écris d’abord ta fonction.</p>'; return; }
    b.disabled = true; out.innerHTML = '<p class="muted">Le jury IA relit ton code…</p>';
    const der = essais(X.id).slice(-1)[0];
    const p = `Tu es correcteur à l'agrégation SII, option ingénierie électrique. Tu relis une fonction Python écrite par un candidat sur le document réponse d'une épreuve écrite.
Question posée : ${X.titre}. ${X.ctx} ${X.enonce.replace(/<[^>]+>/g, '')}
Résultat des tests automatiques : ${der && der.n ? `${der.ok} sur ${der.n} réussis` : 'pas encore exécutés'}.
Code du candidat :
${code.slice(0, 6000)}

Note la réponse sur 4 points comme un correcteur (justesse, cas limites, lisibilité et commentaires, respect de la consigne). Sois exigeant et concret : cite les lignes en cause. Donne une version corrigée qui garde la structure du candidat.
Réponds en français, uniquement en JSON valide, sans retour à la ligne dans les chaînes et sans guillemets doubles dans les remarques (cite entre « ») ; le code corrigé est donné ligne par ligne, indentation comprise : {"note": 0, "justesse": "", "remarques": ["", ""], "corrige": ["def ...", "    ..."]}`;
    try {
      const s = await getSample();
      const r = await s.json(p, { cache: false, modelTier: 'complex' });
      out.innerHTML = `<div class="ainote"><strong>${E(String(r.note ?? '—'))} / 4</strong> selon le jury IA</div><p>${E(r.justesse || '')}</p>${Array.isArray(r.remarques) && r.remarques.length ? `<ul>${r.remarques.map((x) => `<li>${E(x)}</li>`).join('')}</ul>` : ''}${(Array.isArray(r.corrige) ? r.corrige.join('\n') : r.corrige) ? `<pre class="py-sol">${E(Array.isArray(r.corrige) ? r.corrige.join('\n') : r.corrige)}</pre>` : ''}<p class="muted"><small>Relecture produite par une IA : à confronter au corrigé.</small></p>`;
    } catch (e) { out.innerHTML = `<p class="ec-warn">${E(errIA(e))}</p>`; }
    b.disabled = false;
  }
  function route(h) {
    const m = h.match(/^ecrits-python-([a-z0-9]+)$/);
    return m ? exercice(m[1]) : accueil();
  }
  window.ECRITS_PYTHON = { route, carte, EX, executer, demarrer, AVANT, APRES };
})();
