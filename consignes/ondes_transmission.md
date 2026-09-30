Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/ondes_transmission.js

Notions (identifiants exacts) :

1. POOLS["phy-ondes"] — « Ondes, son, interférences » (partie sciences physiques de la spécialité SI, Terminale). Contenu attendu :
- ondes mécaniques progressives ; célérité et retard (v = d / Δt) ; période, fréquence, longueur d'onde (λ = v·T) ;
- sons et ultrasons, avec les célérités données (air, eau, acier) ; télémétrie par ultrasons (aller-retour : d = v·Δt / 2) ;
- niveau d'intensité sonore L = 10·log(I / I₀), avec I₀ = 10⁻¹² W/m² ; plusieurs sources (on ajoute les intensités, pas les niveaux) ; atténuation avec la distance (I = P / (4π·r²)) ;
- diffraction (θ ≈ λ / a) ;
- interférences : différence de marche, franges constructives et destructives, interfrange i = λ·D / b ;
- effet Doppler : sens du décalage, calcul simple pour une vitesse petite devant la célérité.
Figures possibles : oscillogramme émission/réception avec décalage, onde le long d'une corde avec λ, schéma d'un télémètre, figure d'interférences.

2. POOLS["info-transmission"] — « Trames, protocoles, réseaux » (SI, communiquer l'information). Contenu attendu :
- liaison série : bits de start et de stop, parité, trame ; débit en bit/s et durée d'un bit ; durée d'une trame ; efficacité (bits utiles / bits transmis) ;
- protocoles : adresse, données, contrôle d'erreur par parité ou somme de contrôle ;
- bus I2C : adresses sur 7 bits, nombre d'esclaves possibles ;
- réseau : adresse IPv4 et masque, adresse du réseau, nombre d'hôtes, même sous-réseau ou non, passerelle ; modèle en couches (qualitatif) ;
- supports de transmission (filaire, Wi-Fi, Bluetooth, LoRa, 4G) : portée, débit, consommation, choix selon une exigence ;
- temps de transfert d'un fichier (taille en octets × 8 / débit), latence.
Figures possibles : chronogramme d'une trame série (niveaux logiques, start, données, parité, stop), schéma de réseau.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : pools_draft/ondes_transmission.js n'existe pas encore ; tes brouillons sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/ondtrm_work/ (p0_head.js : en-tête et outils ; p1_figs_ond.js : figures ; p2_ond_l1.js et p3_ond_l2.js : phy-ondes niveaux 1 et 2 ; t_ond.js, od_dump.js, od_render.js : tests et rendus). Il reste à terminer phy-ondes (niveau 3) et à écrire toute la notion info-transmission, puis à assembler le fichier final.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.