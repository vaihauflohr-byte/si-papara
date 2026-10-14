# -*- coding: utf-8 -*-
"""Parcours d'entraînement BTS 2 : vérifie les données, écrit contenu/projets-entrainement.js (site, sans corrigé)
et out/entrainement.json (dossiers Word, avec le corrigé du professeur).
Usage, depuis la racine du dépôt : SITE_DIR=. python3 outils/projets-bts2/entrainement/src/build.py"""
import json, os, re, shutil, sys
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
for chemin in (os.path.join(ICI, "..", "..", "src"), os.path.join(ICI, "..", "..", "projets", "src")):   # dépôt / brouillon
    if os.path.exists(os.path.join(chemin, "communs.py")):
        sys.path.insert(0, chemin)
from communs import GRILLES, SESSION, EQUIPE, ETABLISSEMENT, NIVEAUX, SECTEURS, DOSSIERS
from parcours import ETAPES, ETAPE1
from cas import CAS
try:   # le corrigé du professeur reste hors du dépôt du site (public) : sans lui, pas de corrigé Word
    from corriges import CORRIGES
except ImportError:
    CORRIGES = {}
for c in CAS:
    if c["id"] in CORRIGES:
        c["corrige"] = CORRIGES[c["id"]]

erreurs = []
CRIT = {}
for u in ("u61", "u62"):
    for c in GRILLES[u]["competences"]:
        for k in c["criteres"]:
            CRIT[k["id"]] = {"txt": k["txt"], "comp": c["id"], "unite": GRILLES[u]["unite"]}

# ---------- vérifications ----------
ids_livrables = set()
for e in ETAPES:
    for k in e["crit"] + e.get("crit_option", []):
        if k not in CRIT:
            erreurs.append(f"étape {e['id']} : critère inconnu {k}")
    for l in e["livrables"]:
        if l["id"] in ids_livrables:
            erreurs.append(f"livrable en double : {l['id']}")
        ids_livrables.add(l["id"])
        if l["dossier"] not in ("d1", "d2", "d3"):
            erreurs.append(f"{l['id']} : dossier inconnu")
        for k in l["crit"]:
            if k not in CRIT:
                erreurs.append(f"{l['id']} : critère inconnu {k}")
            if k not in e["crit"] + e.get("crit_option", []):
                erreurs.append(f"{l['id']} : critère {k} absent des critères de l'étape")
            if k in e.get("crit_option", []) and not l.get("option"):
                erreurs.append(f"{l['id']} : critère facultatif {k} sur un livrable obligatoire")
        if e["ouverte"] and not l.get("contenu"):
            erreurs.append(f"{l['id']} : étape ouverte sans contenu attendu")
for k in ETAPES[0]["crit"]:
    if k not in ETAPE1["descripteurs"] or len(ETAPE1["descripteurs"][k]) != 4:
        erreurs.append(f"étape 1 : descripteurs N1 à N4 manquants pour {k}")

ids_parties = set()
for c in CAS:
    for champ in ("id", "num", "domaine", "court", "titre", "client", "lieu", "interlocuteur", "activite", "horaires", "secteurs", "labo",
                  "demande", "existant", "figure", "tables", "constats", "documents", "entretien", "checklist_plus", "parties"):
        if champ not in c:
            erreurs.append(f"{c.get('id')} : champ manquant {champ}")
    for s in c["secteurs"]:
        if s not in SECTEURS:
            erreurs.append(f"{c['id']} : secteur inconnu {s}")
    if not os.path.exists(os.path.join(ICI, c["figure"]["fichier"])):
        erreurs.append(f"{c['id']} : figure absente {c['figure']['fichier']}")
    vus = [v["id"] for v in c["constats"]]
    if len(set(vus)) != len(vus):
        erreurs.append(f"{c['id']} : constats en double")
    for t in c["tables"] + c["documents"]:
        for l in t["lignes"]:
            if len(l) != len(t["cols"]):
                erreurs.append(f"{c['id']} / {t['titre']} : ligne de {len(l)} cellules pour {len(t['cols'])} colonnes")
    for p in c["parties"]:
        if not re.fullmatch(rf"{c['id']}-\d", p["id"]):
            erreurs.append(f"{c['id']} : identifiant de partie invalide {p['id']}")
        if p["id"] in ids_parties:
            erreurs.append(f"partie en double {p['id']}")
        ids_parties.add(p["id"])
    cor = c.get("corrige")
    if not cor:
        continue
    for x in cor["constats"]:
        for ref in re.findall(r"V\d+", x["v"]):
            if ref not in vus:
                erreurs.append(f"{c['id']} corrigé : {ref} n'est pas un constat")
        for pid in x["parties"]:
            if pid not in [p["id"] for p in c["parties"]]:
                erreurs.append(f"{c['id']} corrigé : partie inconnue {pid}")
        if x["g"] not in (1, 2, 3):
            erreurs.append(f"{c['id']} corrigé : gravité invalide")
    # chaque constat de visite est traité dans le corrigé (comme non-conformité, point conforme ou point clé)
    traites = set(re.findall(r"V\d+", " ".join([x["v"] for x in cor["constats"]] + cor.get("conforme", []) + cor.get("constats_cles", []))))
    for v in vus:
        if v not in traites:
            erreurs.append(f"{c['id']} : le constat {v} n'est pas traité dans le corrigé")
    for p in c["parties"]:
        if not any(p["id"] in x["parties"] for x in cor["constats"]):
            erreurs.append(f"{c['id']} : aucun constat du corrigé pour la partie {p['id']}")

if erreurs:
    print("\n".join("✗ " + e for e in erreurs))
    sys.exit(1)

# ---------- données publiques (site) : jamais le corrigé ----------
def svg(c):
    return open(os.path.join(ICI, c["figure"]["fichier"]), encoding="utf-8").read()

PUBLIC_CAS = ("id", "num", "domaine", "court", "titre", "client", "lieu", "interlocuteur", "activite", "horaires", "secteurs", "labo",
              "demande", "existant", "tables", "constats", "documents", "entretien", "checklist_plus")
cas_site = []
roles = []
for c in CAS:
    d = {k: c[k] for k in PUBLIC_CAS}
    d["figure"] = {"titre": c["figure"]["titre"], "svg": svg(c)}
    d["parties"] = [{k: p[k] for k in ("id", "n", "titre", "prepare", "focus")} for p in c["parties"]]
    cas_site.append(d)
    for p in c["parties"]:
        roles.append({"id": p["id"], "type": "entrainement", "cas": c["id"], "num": c["num"], "n": p["n"], "partie": p["titre"], "prepare": p["prepare"],
                      "court": c["court"], "titre": c["titre"], "client": c["client"], "lieu": c["lieu"], "secteurs": c["secteurs"], "domaine": c["domaine"]})

parcours_site = {"etapes": ETAPES, "etape1": ETAPE1}
SITE = os.environ.get("SITE_DIR")
if SITE:
    dest = os.path.join(SITE, "contenu", "projets-entrainement.js")
    js = ("/* Parcours d'entraînement BTS 2 (octobre-décembre) — fichier généré par outils/projets-bts2/entrainement/src/build.py : ne pas modifier à la main.\n"
          "   Le vrai projet découpé en étapes ; cinq cas fictifs (un par domaine), une partie par étudiant (E1-1, E1-2…).\n"
          "   Chargé après contenu/projets-bts2.js. Le corrigé du professeur n'est jamais dans ce fichier (il est public). */\n"
          "(function (P) {\n  if (!P) return;\n"
          f"  P.parcours = {json.dumps(parcours_site, ensure_ascii=False)};\n"
          f"  P.cas = {json.dumps(cas_site, ensure_ascii=False)};\n"
          f"  P.projets = {json.dumps(roles, ensure_ascii=False)}.concat(P.projets || []);\n"
          "})(window.SIP_PROJETS);\n")
    open(dest, "w", encoding="utf-8").write(js)
    taille = len(js.encode("utf-8"))
else:
    taille = 0

# ---------- données des documents Word (avec le corrigé) ----------
os.makedirs(os.path.join(ICI, "..", "out"), exist_ok=True)
for c in CAS:
    png = os.path.join(ICI, c["figure"]["fichier"].replace(".svg", ".png"))
    if os.path.exists(png):
        shutil.copy(png, os.path.join(ICI, "..", "out"))
    else:
        print(f"! {c['id']} : image {os.path.basename(png)} absente (node rendre_svg.js) — le Word sera sans figure")
with open(os.path.join(ICI, "..", "out", "entrainement.json"), "w", encoding="utf-8") as f:
    json.dump({"session": SESSION, "etablissement": ETABLISSEMENT, "equipe": EQUIPE, "niveaux": NIVEAUX, "dossiers": DOSSIERS,
               "crit": CRIT, "etapes": ETAPES, "etape1": ETAPE1, "cas": CAS}, f, ensure_ascii=False, indent=1)
print(f"OK — {len(CAS)} cas, {len(ids_parties)} parties, {len(ETAPES)} étapes (ouvertes : {', '.join(e['id'] for e in ETAPES if e['ouverte'])})"
      + ("" if all("corrige" in c for c in CAS) else " ; corriges.py absent : pas de corrigé Word")
      + (f" ; {taille} octets -> {SITE}/contenu" if SITE else ""))
