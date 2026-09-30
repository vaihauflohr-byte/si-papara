#!/usr/bin/env python3
"""Calibrage : affiche les questions réelles des sujets de bac SI étiquetées avec une notion (énoncé, tâche, réponse).
Usage : python3 calibrage.py <id-notion> [<id-notion> ...]
À utiliser seulement pour viser le niveau et les formes de questions : ne rien recopier, aucune référence aux sujets."""
import json, sys, pathlib
d = json.load(open(pathlib.Path(__file__).resolve().parent.parent / "bac-si-questions.json", encoding="utf-8"))
for nid in sys.argv[1:]:
    qs = [q for s in d for p in s["parties"] for q in p.get("questions", []) if nid in q.get("notions", [])]
    print(f"\n===== {nid} : {len(qs)} questions")
    for q in qs:
        print(f"- [{q.get('tache')}, niv. {q.get('niveau')}] {q['enonce']}")
        if q.get("reponse"): print(f"    → {q['reponse']}")
