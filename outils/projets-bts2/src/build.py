# -*- coding: utf-8 -*-
"""Assemble les 13 projets, vérifie la cohérence et produit :
   - out/projets.json          (toutes les données, pour les dossiers Word)
   - out/projets-bts2.js       (contenu/projets-bts2.js du site SI Papara)
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from communs import (ETABLISSEMENT, SESSION, EQUIPE, SECTEURS, SUPPORTS, GRILLES, DOSSIERS, DOCS_COMMUNS,
                     JALONS, PERIODES, VACANCES, MES_COMMUNS_DEBUT, RISQUES_COMMUNS, OUTILS_COMMUNS,
                     u61_standard, u62_standard)
from projets_a import PROJETS_A
from projets_b import PROJETS_B
from projets_c import PROJETS_C

ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, "..", "out")
os.makedirs(OUT, exist_ok=True)

PROJETS = PROJETS_A + PROJETS_B + PROJETS_C
erreurs = []

def minuscule(s):
    # première lettre en minuscule, sauf sigle (DDR, EPI, IP…)
    return s[0].lower() + s[1:] if len(s) > 1 and s[1].islower() else s

def total(contrat):
    return sum(t["h"] for g in contrat for t in g["taches"])

CRITERES = {c["id"]: c for u in ("u61", "u62") for comp in GRILLES[u]["competences"] for c in comp["criteres"]}
CHAMPS = ["id", "titre", "court", "client", "lieu", "secteurs", "montant", "financement", "support", "support_detail",
          "materiel", "pitch", "objectif", "contexte", "demande_u61", "demande_u62", "exigences", "donnees", "contraintes",
          "normes", "anglais", "taches", "spec", "plus", "essais", "risques", "offre"]
SPECS = ["simu", "calcul", "schemas", "programme", "parametres", "environnement"]

projets = []
for p in PROJETS:
    for k in CHAMPS:
        if k not in p:
            erreurs.append(f"{p.get('id')}: champ manquant {k}")
    for s in p["secteurs"]:
        if s not in SECTEURS:
            erreurs.append(f"{p['id']}: secteur inconnu {s}")
    if p["support"] not in SUPPORTS:
        erreurs.append(f"{p['id']}: support inconnu {p['support']}")
    for s in SPECS:
        if not p["spec"].get(s):
            erreurs.append(f"{p['id']}: spec.{s} vide")
    q = dict(p)
    q["u61"] = u61_standard(p, p.get("h_u61"))
    q["u62"] = u62_standard(p, p.get("h_u62"))
    for u, n in (("u61", 60), ("u62", 60)):
        t = total(q[u])
        if t != n:
            erreurs.append(f"{p['id']}: total {u} = {t} h (attendu {n})")
    # contenus calculés
    q["spec"] = dict(p["spec"])
    q["spec"]["offre_doc"] = [
        "Proposition : " + p["offre"],
        "Arguments techniques et économiques ; chiffrage en XPF",
        "Réponse du client et ajustements de l'offre",
    ]
    q["spec"]["risques_doc"] = [f"{r['danger']} — {minuscule(r['prevention'])}" for r in p["risques"]]
    ex_ids = {e["id"] for e in p["exigences"]}
    for e in p["essais"]:
        if e.get("ex") and e["ex"] not in ex_ids:
            erreurs.append(f"{p['id']}: essai relié à {e['ex']} inexistant")
    # chaque exigence est vérifiée par au moins un essai (sauf celles vérifiées par le dossier)
    couvertes = {e.get("ex") for e in p["essais"]}
    q["exigences_sans_essai"] = sorted(ex_ids - couvertes)
    q.pop("h_u61", None); q.pop("h_u62", None)
    projets.append(q)

# couverture des critères des grilles par les documents des dossiers
couverts = {c for d in DOCS_COMMUNS for c in d["crit"]}
manquants = sorted(set(CRITERES) - couverts, key=lambda x: (x.split(".")[0], int(x.split(".")[1])))
for c in manquants:
    # C15.1, C15.3, C15.4, C15.6, C15.7, C14.1, C14.7, C14.8, C16.4 sont observés pendant la réalisation (contrat U62)
    pass
for d in DOCS_COMMUNS:
    for c in d["crit"]:
        if c not in CRITERES:
            erreurs.append(f"document {d['id']}: critère inconnu {c}")

# aucun signe ÷
def parcours(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, dict):
        for v in o.values():
            yield from parcours(v)
    elif isinstance(o, list):
        for v in o:
            yield from parcours(v)
for s in parcours(projets):
    if "÷" in s:
        erreurs.append("signe ÷ trouvé : " + s[:80])

# critères observés pendant la réalisation (contrat U62), sans document propre
OBSERVES = {
    "C14.1": "T 6.1 organiser l'espace de travail", "C14.7": "T 6.2 pose et câblage", "C14.8": "T 6.2 raccordement",
    "C15.1": "T 6.3 téléchargement des programmes", "C15.3": "T 7.1 configuration et interconnexion",
    "C15.4": "T 7.1 interopérabilité", "C15.6": "T 7.1 validation de l'interopérabilité", "C15.7": "T 7.2 essais",
    "C16.4": "T 7.2 validation de l'interopérabilité", "C4.7": "réception client", "C4.8": "réception client",
}
reste = [c for c in manquants if c not in OBSERVES]
if reste:
    erreurs.append("critères des grilles non couverts : " + ", ".join(reste))

if erreurs:
    print("ERREURS :")
    for e in erreurs:
        print(" -", e)
    sys.exit(1)

DATA = {
    "version": "2026-10-14",
    "etablissement": ETABLISSEMENT, "session": SESSION, "equipe": EQUIPE,
    "secteurs": SECTEURS, "supports": SUPPORTS, "grilles": GRILLES, "dossiers": DOSSIERS,
    "docs_communs": DOCS_COMMUNS, "observes": OBSERVES, "jalons": JALONS, "periodes": PERIODES, "vacances": VACANCES,
    "mes_communs": MES_COMMUNS_DEBUT, "risques_communs": RISQUES_COMMUNS, "outils_communs": OUTILS_COMMUNS,
    "attribution": {},
    "projets": projets,
}

with open(os.path.join(OUT, "projets.json"), "w", encoding="utf-8") as f:
    json.dump(DATA, f, ensure_ascii=False, indent=1)

ENTETE = """/* =====================================================================
   PROJETS BTS 2 ÉLECTROTECHNIQUE — session %s — données (générées)
   13 projets individuels (U61 conception – étude détaillée, U62 réalisation – mise en service),
   calés sur les grilles CCF U61 et U62 et sur les dossiers 1, 2, 3 du référentiel.
   Utilisé par entrainements/bts-projets.html (page des étudiants) et prof.html (onglet Projets).
   Les dates des revues et l'attribution de secours se règlent dans contenu/projets-reglages.js.
   Ne change jamais l'"id" d'un projet ni d'un document : le travail des étudiants y est rattaché.
   ===================================================================== */
window.SIP_PROJETS = {
""" % SESSION

def compact(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":"))

cles = [k for k in DATA if k != "projets"]
lignes = [f' "{k}": {compact(DATA[k])},' for k in cles]
lignes.append(' "projets": [')
lignes.append(",\n".join("  " + compact(q) for q in projets))
lignes.append(" ]")
SITE = os.environ.get("SITE_DIR")
dest = os.path.join(SITE, "contenu") if SITE else OUT
with open(os.path.join(dest, "projets-bts2.js"), "w", encoding="utf-8") as f:
    f.write(ENTETE + "\n".join(lignes) + "\n};\n")

REGLAGES = """/* =====================================================================
   PROJETS BTS 2 — RÉGLAGES, à modifier ICI directement sur GitHub (contenu/projets-reglages.js),
   sans rien regénérer. La page des étudiants et l'espace prof les lisent au chargement.

   1. jalons : les revues de projet. Une revue déplacée = changer sa date (AAAA-MM-JJ, de préférence un lundi :
      la revue est affichée pour la semaine qui commence ce jour-là).
   2. periodes : début et fin de l'étude préliminaire, de U61 et de U62 (servent au planning des étudiants).
   3. attribution : SECOURS seulement, tant que supabase/projets.sql n'est pas passé dans Supabase.
      Identifiant de l'étudiant (celui de sa connexion) → numéro de projet. Exemple :
        attribution: { "teva.m": "P03", "hinano.t": "P11" }
      Avec la base à jour, attribue les projets dans prof.html → onglet « Projets BTS 2 ».
   ===================================================================== */
window.SIP_PROJETS_REGLAGES = {
  jalons: [
%s
  ],
  periodes: [
%s
  ],
  attribution: { }
};
""" % (",\n".join("    " + compact(j) for j in JALONS), ",\n".join("    " + compact(x) for x in PERIODES))
# les réglages se modifient en ligne : on ne les écrase pas (sauf REGLAGES=neufs)
f_reg = os.path.join(dest, "projets-reglages.js")
if not os.path.exists(f_reg) or os.environ.get("REGLAGES") == "neufs":
    with open(f_reg, "w", encoding="utf-8") as f:
        f.write(REGLAGES)
else:
    print("contenu/projets-reglages.js existe déjà : conservé (REGLAGES=neufs pour le refaire)")

for q in projets:
    print(q["id"], q["support"], "U61", total(q["u61"]), "h · U62", total(q["u62"]), "h · exigences sans essai :", q["exigences_sans_essai"] or "—")
print("critères observés pendant la réalisation :", ", ".join(c for c in manquants))
print("OK —", len(projets), "projets ;", os.path.getsize(os.path.join(dest, "projets-bts2.js")), "octets ->", dest)
