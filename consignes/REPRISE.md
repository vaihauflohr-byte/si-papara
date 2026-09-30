# Reprise : 21 notions écrites, relecture indépendante à faire

État au 30/09/2026 13 h 45 (Tahiti) :
- 21 notions écrites dans pools_draft/ (8 fichiers, 1 627 générateurs au total avec les notions en ligne) ;
  chaque fichier passe test_pool.js (0 erreur, 0 avertissement) et se charge sans collision.
- PAS ENCORE EN LIGNE : relecture indépendante à faire avant de déplacer les fichiers dans pools/.
- Méthode de relecture : consignes/AUDIT.md (un relecteur par fichier).

Points à traiter pendant la relecture :
- dynamique_gravitation.js : OBLIGATOIRE, passer du rapport k > 1 (ω_moteur = k·ω_sortie) à la convention
  de la classe r = N_sortie / N_entrée < 1 (C_s = η·C_e / r), comme pools/statique_transmission.js.
  Masses d'astres saisies en mantisse (« × 10²³ kg ») : énoncés à vérifier.
- ondes_transmission.js : rétablir « R/W » et « TCP/IP » (le « / » est permis dans les sigles) ;
  tolérance ±0,2 dB ; relations données (√(g·h), 331 + 0,6·θ, θ ≈ λ/a) ; I2C simplifié ; trame Ethernet.
- automatique.js : définition du dépassement (valeur finale ou consigne) précisée dans chaque énoncé ;
  cause de l'erreur statique des asservissements de position ; oscillations entretenues ; Euler en Python.
- liaisons_fluides.js : mobilités et symboles des liaisons ; relations rappelées en phy-fluides ; tolérances élargies.
- circuits_convertisseurs.js : sens des flèches ; MLI α = n / 255 ; relations hors programme données ; notation W / E.
- comportement_logique_optique.js : simulation des diagrammes d'états ; tables de vérité ; f au lieu de ν ;
  saisie en mantisse (× 10⁻¹⁹ J).
- sources_conception_env.js : scores des matrices de décision ; facteurs d'émission donnés ; PRG, effet rebond.
- rdm_thermique.js : Von Mises, concentration de contraintes, « axe de chape → cisaillement » ; R = 1 / (h·S).

Après relecture : mv pools_draft/*.js pools/ ; python3 ../build3.py ; python3 ../si_papara_bac.py ;
tester (Playwright, démo) ; zip des fichiers modifiés (contenu/bac-si.js, entrainements/bac-si.html) sans config.js.
