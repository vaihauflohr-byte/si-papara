# Manifold (moteur 3D de l'atelier)

Bibliothèque **manifold-3d 3.5.5** (https://github.com/elalish/manifold), licence Apache 2.0 (fichier `LICENSE`).
Fichiers copiés tels quels depuis le paquet npm : `manifold.js` (module ES) et `manifold.wasm`.

L'atelier 3D (`../cao.js`) ne la charge que quand une pièce en a besoin : révolution, congé ou chanfrein
sur le tour d'une face du dessus. Ailleurs, l'atelier garde son moteur à couches extrudées, sans bibliothèque.
