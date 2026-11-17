"""Fabrique l'onglet « Missions Onshape » de la page du projet à partir du planeur de départ (depart.py)."""
import json, math, depart as D
J = json.load(open('depart.json'))
fr = lambda x, n=1: (f"{x:.{n}f}").replace('.', ',').rstrip('0').rstrip(',') if n else str(int(round(x)))
S = 3.0; OX = 45
def P(x, y, oy): return OX + S * x, oy - S * y
def poly(pts, oy, **kw):
    a = " ".join(f"{P(x, y, oy)[0]:.1f},{P(x, y, oy)[1]:.1f}" for x, y in pts)
    return f'<polygon points="{a}" ' + " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in kw.items()) + '/>'
def txt(x, y, t, anchor="middle", size=12, w="400", fill="currentColor"):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{w}" fill="{fill}">{t}</text>'
def badge(x, y, t):
    w = 8 + 7.2 * len(t)
    return f'<rect x="{x - w/2:.1f}" y="{y - 11:.1f}" width="{w:.1f}" height="16" rx="3" fill="var(--paper)" stroke="currentColor" stroke-width="1"/>' + txt(x, y + 1.5, t, size=12, w="600")
C = D.corps(); HOOK = [(30, 0), (39, 0), (46, -7), (41, -7)]

# ----- dessin A : le contour coté -----
oy = 105; A = ['<svg viewBox="0 0 720 200" role="img" aria-label="Contour du fuselage de départ avec ses cotes">']
A.append(poly(C, oy, fill="var(--accent-soft)", stroke="currentColor", stroke_width="2.5", stroke_linejoin="round"))
ry = oy + 40
A.append(f'<line x1="{OX}" y1="{ry}" x2="{OX + S*210}" y2="{ry}" stroke="currentColor" stroke-width="1.2"/>')
for x in (0, 6, 40, 52, 140, 150, 180, 210):
    px = OX + S * x; ytop = oy - S * max(y for (xx, y) in C if xx == x)
    A.append(f'<line x1="{px}" y1="{ytop}" x2="{px}" y2="{ry + 6}" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 3"/>')
    dx = -5 if x == 0 else 5 if x == 6 else -4 if x in (40, 140) else 5 if x in (52, 150) else 0
    A.append(txt(px + dx, ry + 21, str(x), size=13, w="600"))
A.append(txt(OX + S * 105, ry + 42, "Nombres du bas : distance depuis le bout du nez, en mm", size=13))
for (x, y, t) in [(3, 15.5, "10"), (23, 17.5, "14"), (96, 13.5, "10"), (165, 8.5, "5"), (195, 11.5, "8")]:
    A.append(badge(*P(x, y, oy), t))
A.append(txt(OX + S * 105, 22, "Nombres encadrés : hauteur au-dessus du dessous du fuselage, en mm", size=13))
A.append('</svg>'); DESSIN_A = "".join(A)

# ----- dessin B : fentes, trou de lest, dérive -----
S = 2.8; OX = 40; oy = 190
B = ['<svg viewBox="0 0 720 262" role="img" aria-label="Fentes, trou de lest et dérive du fuselage de départ">',
     '<defs><marker id="pt" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6"><circle cx="4" cy="4" r="3" fill="var(--bad)"/></marker></defs>']
B.append(poly(C, oy, fill="var(--paper-2)", stroke="currentColor", stroke_width="1.5", stroke_linejoin="round", opacity="0.9"))
B.append(poly(D.DERIVE, oy, fill="var(--accent-soft)", stroke="var(--accent)", stroke_width="2.5", stroke_linejoin="round"))
B.append(poly(D.fente(*D.FA), oy, fill="var(--bad)") + poly(D.fente(*D.FS, h=0.8), oy, fill="var(--bad)"))
cx, cy = P(D.TROU[0], D.TROU[1], oy); B.append(f'<circle cx="{cx}" cy="{cy}" r="{S * D.TROU[2] / 2}" fill="var(--paper)" stroke="var(--bad)" stroke-width="2.5"/>')
def rep(x, y, lx, ly, t, anchor="middle", ax=None):
    px, py = P(x, y, oy); ax = lx if ax is None else ax
    return f'<line x1="{px:.1f}" y1="{py:.1f}" x2="{ax}" y2="{ly + (5 if ly < py else -13)}" stroke="currentColor" stroke-width="0.8" marker-start="url(#pt)"/>' + txt(lx, ly, t, anchor=anchor, size=12.5, w="600")
B.append(rep(D.TROU[0], D.TROU[1] + 2.1, 40, 100, "trou de lest : centre (12 ; 8), diamètre 4,2", "start", 74))
B.append(rep(D.FA[0], D.FA[1], 270, 118, f"({fr(D.FA[0])} ; {fr(D.FA[1])})") + rep(D.FA[2], D.FA[3], 420, 118, f"({fr(D.FA[2])} ; {fr(D.FA[3])})"))
B.append(txt(470, 96, "fente de l'aile : hauteur 1,0", size=12.5, w="600", fill="var(--bad)"))
B.append(rep(D.FS[0], D.FS[1], 500, 232, f"({fr(D.FS[0])} ; 4)") + rep(D.FS[2], D.FS[3], 640, 232, f"({fr(D.FS[2])} ; 4)"))
B.append(txt(570, 252, "fente du stabilisateur : hauteur 0,8", size=12.5, w="600", fill="var(--bad)"))
B.append(rep(190, 8, 520, 150, "(190 ; 8)", "end", 524) + rep(202, 32, 575, 78, "(202 ; 32)", "end", 560) + rep(210, 32, 648, 96, "(210 ; 32)", "start", 646) + rep(210, 8, 648, 160, "(210 ; 8)", "start", 646))
B.append(txt(560, 48, "dérive : extrusion de 1 mm seulement", size=12.5, w="600", fill="var(--accent)"))
B.append(txt(40, 24, "(distance depuis le nez ; hauteur au-dessus du dessous), en mm", anchor="start", size=13))
B.append('</svg>'); DESSIN_B = "".join(B)

def rect_cote(w, h, ep, nom, sc):
    W, H = w * sc, h * sc; x0 = (720 - W) / 2
    return (f'<svg viewBox="0 0 720 {H + 70:.0f}" role="img" aria-label="{nom} : rectangle de {w} par {h} mm"><rect x="{x0:.0f}" y="14" width="{W:.0f}" height="{H:.0f}" fill="var(--accent-soft)" stroke="currentColor" stroke-width="2.5"/>'
            f'<line x1="{x0:.0f}" y1="{H + 30:.0f}" x2="{x0 + W:.0f}" y2="{H + 30:.0f}" stroke="currentColor"/><line x1="{x0:.0f}" y1="{H + 23:.0f}" x2="{x0:.0f}" y2="{H + 37:.0f}" stroke="currentColor"/><line x1="{x0 + W:.0f}" y1="{H + 23:.0f}" x2="{x0 + W:.0f}" y2="{H + 37:.0f}" stroke="currentColor"/>'
            + txt(360, H + 52, f"{w} mm", size=14, w="600") + txt(x0 + W + 12, 14 + H / 2 + 5, f"{h} mm", "start", 14, "600") + txt(360, 14 + H / 2 + 5, f"{nom} · extrusion {fr(ep)} mm", size=13) + '</svg>')
PLAQUE = ('<svg viewBox="0 0 720 150" role="img" aria-label="Plaque de 60 par 20 mm, épaisseur 5 mm"><rect x="120" y="40" width="180" height="60" fill="none" stroke="currentColor" stroke-width="2.5"/>'
          + txt(210, 124, "60", size=14, w="600") + txt(104, 75, "20", size=14, w="600") + txt(210, 28, "1. l'esquisse cotée", size=13)
          + '<path d="M335 70 h50 m-10 -7 l10 7 -10 7" fill="none" stroke="currentColor" stroke-width="2"/><g fill="var(--accent-soft)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M420 55 h180 v60 h-180 z"/><path d="M420 55 l15 -15 h180 l-15 15 z"/><path d="M600 55 l15 -15 v60 l-15 15 z"/></g>'
          + txt(517, 28, "2. la pièce après extrusion de 5", size=13) + '</svg>')
BISEAU = ('<svg viewBox="0 0 720 150" role="img" aria-label="Plaque de 60 par 20 mm avec le coin en haut à gauche coupé en biseau"><path d="M246 40 H390 V100 H210 V64 Z" fill="var(--accent-soft)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>'
          '<path d="M210 40 H246 M210 40 V64" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/><path d="M210 64 L246 40" stroke="var(--bad)" stroke-width="3.5"/>'
          + txt(228, 30, "12", size=14, w="600", fill="var(--bad)") + txt(194, 57, "8", size=14, w="600", fill="var(--bad)") + txt(300, 124, "60", size=14, w="600") + txt(408, 75, "20", size=14, w="600")
          + txt(540, 60, "le trait rouge remplace", "middle", 13) + txt(540, 78, "le coin en pointillés", "middle", 13) + '</svg>')
m = lambda n, t, but: f'<div class="carte"><div class="eyebrow">Mission {n}</div><h2 style="margin-top:.1em">{t}</h2><p class="discret" style="margin-top:0">{but}</p>'
fig = lambda nom, alt, leg="Ce que tu dois obtenir": f'<figure class="pl-fig"><img class="pl-img" src="2si-planeur/img/{nom}.png" alt="{alt}" loading="lazy"><figcaption>{leg}</figcaption></figure>'
ok = lambda t: f'<p class="astuce"><b>Mission réussie si</b> {t}</p></div>'
vf, va, vs = J['mf'] / 1.24, J['ma'] / 1.24, J['ms'] / 1.24
SECTION = f'''
  <div class="carte">
    <h2 style="margin-top:0">Comment ça marche</h2>
    <p>Tu ne pars pas d'une page blanche. Les missions 1 à 6 te font construire, cote par cote, un <b>planeur de départ</b> qui vole. La mission 7 est la tienne : tu le transformes pour qu'il aille plus loin que celui des autres équipes.</p>
    <p>Onshape marche <b>dans le navigateur</b>, au lycée comme à la maison, et il est gratuit pour les élèves.</p>
    <ol class="pl-pas">
      <li>Va sur <a href="https://www.onshape.com/fr/education/sign-up" target="_blank" rel="noopener">onshape.com → Éducation → créer un compte</a>. Choisis « Étudiant », avec ton adresse e-mail. Note ton mot de passe dans ton cahier.</li>
      <li>Ouvre <a href="https://cad.onshape.com" target="_blank" rel="noopener">cad.onshape.com</a>, connecte-toi, puis <b>Créer → Document</b>. Nomme-le <code>Planeur – équipe …</code>.</li>
      <li>Clique sur <b>Partager</b> (en haut à droite) et ajoute l'adresse e-mail de tes coéquipiers et de ton professeur.</li>
    </ol>
    <p class="astuce">Si un bouton est en anglais : Sketch = Esquisse, Line = Ligne, Dimension = Cote, Extrude = Extruder, Trim = Ajuster, Slot = Rainure, Export = Exporter.</p>
  </div>

  {m(1, "Ma première pièce : une plaque", "Tu apprends les trois gestes de base : esquisse, cote, extrusion.")}
    {PLAQUE}
    <ol class="pl-pas">
      <li>Dans la liste à gauche, clique sur le plan <b>Face</b>, puis sur <b>Esquisse</b>.</li>
      <li>Choisis l'outil <b>Rectangle</b> et trace un rectangle en partant du point central (l'origine).</li>
      <li>Choisis l'outil <b>Cote</b> (touche <kbd>D</kbd>). Clique sur le côté du bas, tape <b>60</b>. Clique sur le côté gauche, tape <b>20</b>.</li>
      <li>Regarde les traits : ils sont passés du <b>bleu</b> au <b>noir</b>. Noir veut dire « dimension fixée ».</li>
      <li>Clique sur la coche verte, puis sur <b>Extruder</b> (<kbd>Maj</kbd> + <kbd>E</kbd>). Profondeur : <b>5 mm</b>. Valide.</li>
    </ol>
    {fig("m1", "Plaque bleue de 60 par 20 mm, épaisse de 5 mm, vue en 3D")}
  {ok("tu fais tourner à la souris une plaque de 60 × 20 × 5 mm, et si son esquisse a tous ses traits noirs.")}

  {m(2, "Un nez en biseau", "Tu apprends à tracer un trait incliné avec l'outil Ligne, et à modifier une pièce déjà faite.")}
    {BISEAU}
    <ol class="pl-pas">
      <li>Double-clique sur <b>Esquisse 1</b> dans la liste à gauche : tu rouvres le dessin de ta plaque.</li>
      <li>Avec l'outil <b>Ligne</b> (touche <kbd>L</kbd>), trace un trait incliné qui coupe le coin en haut à gauche de la plaque.</li>
      <li>Avec l'outil <b>Ajuster</b> (Trim, touche <kbd>M</kbd>), clique sur les deux petits bouts du coin pour les effacer.</li>
      <li>Mets les 2 cotes du biseau : <b>12</b> sur le côté du haut, <b>8</b> sur le côté gauche.</li>
      <li>Valide l'esquisse. La pièce se met à jour toute seule.</li>
    </ol>
    {fig("m2", "La même plaque avec un coin coupé en biseau, vue en 3D")}
  {ok("le coin de ta plaque est coupé, si tous les traits sont noirs, et si la pièce a changé sans que tu refasses l'extrusion.")}

  {m(3, "Le fuselage de départ : le contour", "Tu dessines le vrai fuselage, vu de côté, en un seul contour fermé.")}
    {DESSIN_A}
    <ol class="pl-pas">
      <li>En bas de l'écran, clique sur <b>+</b> puis <b>Créer un atelier de pièces</b>. Nomme-le <code>Fuselage</code>.</li>
      <li>Plan <b>Face</b> → <b>Esquisse</b>. Avec l'outil <b>Ligne</b>, pars de l'origine (c'est le bout du nez, en bas) et trace le contour <b>à peu près</b>, dans l'ordre du dessin, jusqu'à revenir à l'origine. Les traits inclinés se tracent comme le biseau de la mission 2. Ne cherche pas la précision : ce sont les cotes qui la donneront.</li>
      <li>Outil <b>Cote</b> : pour chaque coin, clique sur l'origine puis sur le coin, et tape la distance du dessin. Tire la souris vers le bas pour une distance depuis le nez, vers la gauche pour une hauteur.</li>
      <li>Quand tous les traits sont noirs, valide, puis <b>Extruder</b> de <b>5 mm</b>.</li>
    </ol>
    {fig("m3", "Fuselage de départ après extrusion : une longue barre avec un nez plus haut et une queue relevée")}
  {ok("ton fuselage mesure 210 mm de long, 14 mm de haut au nez, et si son dessous est plat.")}

  {m(4, "Les fentes, le trou de lest et la dérive", "Tu apprends à enlever de la matière, et à extruder une zone avec une autre épaisseur.")}
    {DESSIN_B}
    <ol class="pl-pas">
      <li>Clique sur la grande face plate du fuselage, puis sur <b>Esquisse</b>.</li>
      <li><b>Fente de l'aile</b> : trace une ligne entre les deux points du dessin, puis transforme-la avec l'outil <b>Rainure</b> (Slot), largeur <b>1,0</b>. Elle penche : son avant est 2,4 mm plus haut que son arrière, c'est voulu.</li>
      <li><b>Fente du stabilisateur</b> : même méthode, ligne horizontale, largeur <b>0,8</b>.</li>
      <li><b>Trou de lest</b> : outil <b>Cercle</b>, centre aux coordonnées du dessin, diamètre <b>4,2</b>.</li>
      <li>Valide. <b>Extruder</b> → choisis <b>Enlever</b> et <b>À travers tout</b>, puis clique sur les deux fentes et le cercle.</li>
      <li><b>Dérive</b> : nouvelle esquisse sur la même face, trace les 4 points du dessin. <b>Extruder</b> → <b>Ajouter</b>, profondeur <b>1 mm</b>.</li>
    </ol>
    {fig("m4", "Fuselage terminé avec le trou de lest, la fente de l'aile, la fente du stabilisateur et la dérive")}
  {ok("tu vois le jour à travers les deux fentes et le trou, et si la dérive est bien plus fine que le reste.")}

  {m(5, "L'aile et le stabilisateur de départ", "Deux plaques fines, chacune dans son atelier de pièces.")}
    {rect_cote(200, 45, 0.8, "aile", 2.6)}
    {rect_cote(80, 25, 0.6, "stabilisateur", 2.6)}
    <ol class="pl-pas">
      <li>Crée un atelier de pièces <code>Aile</code>. Plan <b>Dessus</b> → <b>Esquisse</b> → rectangle de <b>200 × 45</b> → <b>Extruder</b> de <b>0,8 mm</b> (4 couches d'impression).</li>
      <li>Crée un atelier de pièces <code>Stabilisateur</code>. Rectangle de <b>80 × 25</b> → <b>Extruder</b> de <b>0,6 mm</b> (3 couches).</li>
    </ol>
    {fig("m5", "L'aile et le stabilisateur : deux plaques fines orange")}
  {ok("tu as trois ateliers de pièces : Fuselage, Aile, Stabilisateur.")}

  {m(6, "Vérifier que mon modèle est juste", "Avant d'aller plus loin, tu compares ton modèle aux valeurs attendues.")}
    <ol class="pl-pas">
      <li>Dans chaque atelier, clique sur la pièce dans la liste, puis sur l'icône de la balance en bas à droite (« Propriétés de masse »). Relève le <b>volume</b> en cm³.</li>
      <li>Compare avec ce tableau. Un écart de plus de 0,3 cm³ veut dire qu'une cote est fausse : retourne dans l'esquisse.</li>
    </ol>
    <div class="pl-scroll"><table class="pl">
      <tr><th>Pièce</th><th class="n">Volume attendu</th><th class="n">Masse en PLA (× 1,24)</th></tr>
      <tr><td>Fuselage</td><td class="n">{fr(vf)} cm³</td><td class="n">{fr(J['mf'])} g</td></tr>
      <tr><td>Aile</td><td class="n">{fr(va)} cm³</td><td class="n">{fr(J['ma'])} g</td></tr>
      <tr><td>Stabilisateur</td><td class="n">{fr(vs)} cm³</td><td class="n">{fr(J['ms'])} g</td></tr>
      <tr><th>Planeur de départ, sans lest</th><th class="n"></th><th class="n">{fr(J['mt'])} g</th></tr>
    </table></div>
    <p>Ce planeur a la queue trop lourde : sans lest, son point d'équilibre est à <b>{fr(J['xg'], 0)} mm</b> du nez, trop en arrière. Il lui faut environ <b>{fr(J['lest'])} g</b> dans le trou du nez (une vis M4 avec son écrou, ou de la pâte à fixe) pour le ramener vers <b>{fr(J['cible'], 0)} mm</b>. Total : environ <b>{fr(J['mt'] + J['lest'], 0)} g</b>.</p>
    {fig("m6", "Planeur de départ monté, posé en équilibre sur une cale placée sous l'aile", f"Le planeur de départ monté : il doit tenir en équilibre sur une cale placée à {fr(J['cible'], 0)} mm du nez")}
  {ok("tes trois volumes sont ceux du tableau.")}

  {m(7, "À toi : rends-le meilleur", "Le planeur de départ vole, mais il est lourd : plus léger, il volera plus lentement et pardonnera mieux le lancer. Voici ce que tu peux changer, et les notions de l'onglet « Comprendre » t'expliquent pourquoi.")}
    <div class="pl-scroll"><table class="pl">
      <tr><th>Ce que je change</th><th>Ce que j'y gagne</th><th>Le risque</th></tr>
      <tr><td>Aile plus fine : 0,6 mm au lieu de 0,8</td><td>2 g de moins</td><td>L'aile se plie au lancer</td></tr>
      <tr><td>Bouts d'aile effilés ou arrondis</td><td>Moins de masse, et c'est plus beau</td><td>Moins de surface : il porte un peu moins</td></tr>
      <tr><td>Arrière allégé : poutre moins haute, dérive plus petite</td><td>Moins de lest à mettre devant, donc planeur plus léger</td><td>Queue fragile, planeur qui part de travers</td></tr>
      <tr><td>Nez plus long ou plus haut</td><td>Le nez fait le lest tout seul</td><td>Dépasser 210 mm de long</td></tr>
      <tr><td>Aile avancée ou reculée</td><td>Le point d'équilibre change de place</td><td>Planeur qui cabre ou qui pique</td></tr>
      <tr><td>Stabilisateur plus grand</td><td>Vol plus stable</td><td>Queue plus lourde</td></tr>
      <tr><td>Forme du fuselage, nom de l'équipe gravé</td><td>Des points d'esthétique</td><td>Aucun, tant que les deux fentes gardent leur taille</td></tr>
    </table></div>
    <div class="pl-trio">
      {fig("m7a", "Planeur avec une aile aux bouts effilés", "Idée 1 : des bouts d'aile effilés")}
      {fig("m7b", "Planeur avec une poutre plus fine et une dérive plus petite", "Idée 2 : un arrière allégé")}
      {fig("m7c", "Planeur avec un nez plus haut et une aile effilée", "Idée 3 : un nez plus haut, qui fait le lest")}
    </div>
    <ol class="pl-pas">
      <li>Fais d'abord une copie : clic droit sur l'onglet de l'atelier → <b>Dupliquer</b>. Tu gardes le planeur de départ intact.</li>
      <li>Change <b>une cote à la fois</b> (double-clic sur la cote dans l'esquisse), et regarde la pièce se mettre à jour.</li>
      <li>Après chaque changement, relève le nouveau volume et recalcule la masse.</li>
      <li>Garde l'épaisseur de 5 mm du fuselage et la largeur des deux fentes : sinon l'aile et le stabilisateur ne tiennent plus.</li>
    </ol>
    <p class="astuce"><b>La règle d'or</b> : le point d'équilibre du planeur fini doit tomber sous l'aile, vers son premier tiers en partant de l'avant. Si tu déplaces l'aile, le point d'équilibre à viser se déplace avec elle.</p>
  {ok("ton planeur est plus léger que le planeur de départ, respecte le cahier des charges, et si tu sais expliquer chaque changement.")}

  {m(8, "Exporter pour l'imprimante", "Trois fichiers, un par pièce.")}
    <ol class="pl-pas">
      <li>Remplis la <b>fiche de conformité</b> de l'onglet « Les étapes » : toutes les lignes doivent être vertes.</li>
      <li>Clic droit sur la pièce dans la liste → <b>Exporter</b>. Format <b>STL</b>, unité <b>millimètre</b>. Nomme le fichier <code>equipe_piece_v1.stl</code>.</li>
      <li>Envoie les trois fichiers STL à ton professeur.</li>
    </ol>
    {fig("m8", "Les trois pièces posées à plat sur le plateau de l'imprimante", "Sur le plateau de l'imprimante")}
  {ok("le professeur a reçu tes trois fichiers et qu'ils s'ouvrent dans le logiciel de l'imprimante.")}
'''
open('section_missions.html', 'w').write(SECTION)
print(len(SECTION), 'caractères')
