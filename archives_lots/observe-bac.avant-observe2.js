/* =====================================================================
   SI Papara — « Observe et réponds » (format : en-tête de assets/observe.js).
   Une série de questions posées sur l'animation de la fiche pendant qu'elle
   bouge : l'élève regarde le mécanisme et nomme ce qu'il voit, comme à
   l'écrit avant tout calcul. Le panneau de réglages est caché ; la série
   règle l'animation avant chaque question.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  SIP.OBSERVE_BAC = SIP.OBSERVE_BAC || {};

  /* ---------------------------------------------------------------- DS 04
     Cinématique : lire un mouvement (animation « Quelle trajectoire pour chaque point ? ») */
  const ROT = { "mouvement de la piece": "rot", "position du point c": 60 };
  const TR = { "mouvement de la piece": "tr", "position du point c": 60 };
  const TC = { "mouvement de la piece": "tc", "position du point c": 60 };
  const PG = { "mouvement de la piece": "pg", "position du point c": 60 };
  const MVT = ["Translation rectiligne", "Translation circulaire", "Rotation autour d'un axe fixe", "Mouvement plan général"];
  const SANS = ["traces", "vitesses"];
  SIP.OBSERVE_BAC["meca-cinematique"] = {
    titre: "Lire un mouvement",
    consigne: "Le mécanisme bouge sous tes yeux, sans ses traces. Regarde la pièce et ses trois points A, B et C, puis réponds.",
    questions: [
      // ---- rotation
      { regler: ROT, boutons: ["lancer", "reprendre"], cacher: SANS,
        q: "Quel est le <b>mouvement de la pièce</b> par rapport au bâti ?", choix: MVT, bonne: 2,
        expl: "La pièce tourne autour de l'axe fixe O : c'est une <b>rotation</b>. Tous ses points décrivent des cercles de centre O." },
      { regler: ROT, cacher: SANS,
        q: "Quelle est la <b>trajectoire du point B</b> ?",
        choix: ["Un segment de droite", "Un cercle de centre O", "Un cercle dont le centre est sur la pièce", "Une courbe quelconque"], bonne: 1,
        expl: "En rotation autour de O, chaque point décrit un <b>cercle de centre O</b>, de rayon sa distance à l'axe : pour B, R = OB = 120 mm." },
      { regler: ROT, cacher: SANS,
        q: "Lequel des trois points va le <b>plus vite</b> ?",
        choix: ["A", "B", "C", "Les trois vont à la même vitesse"], bonne: 1,
        expl: "v = R·ω : la vitesse angulaire ω est la même pour toute la pièce, donc le point le plus loin de l'axe va le plus vite. B est à 120 mm de O, C à 60 mm, A à 41 mm." },
      { regler: ROT, cacher: SANS,
        q: "À chaque instant, le <b>vecteur vitesse</b> de B est…",
        choix: ["Dirigé vers O", "Dirigé vers l'extérieur du cercle", "Tangent au cercle, perpendiculaire à OB", "Toujours horizontal"], bonne: 2,
        expl: "La vitesse est toujours <b>tangente à la trajectoire</b>. Sur un cercle de centre O, elle est perpendiculaire au rayon OB." },
      // ---- translation rectiligne
      { regler: TR, cacher: SANS,
        q: "Quel est le <b>mouvement de la pièce</b> par rapport au bâti ?", choix: MVT, bonne: 0,
        expl: "La pièce monte et descend entre deux glissières <b>sans tourner</b> : elle garde son orientation, ses points décrivent des segments parallèles. C'est une <b>translation rectiligne</b>." },
      { regler: TR, cacher: SANS,
        q: "Quelle est la <b>trajectoire du point A</b> ?",
        choix: ["Un segment de droite vertical", "Un cercle", "Un arc de cercle", "Une courbe quelconque"], bonne: 0,
        expl: "En translation rectiligne, tous les points décrivent des <b>segments parallèles de même longueur</b> : la course de la pièce." },
      { regler: TR, cacher: SANS,
        q: "À un instant donné, les <b>vecteurs vitesse</b> de A, B et C sont…",
        choix: ["Identiques : même direction, même sens, même norme", "De même direction mais de normes différentes", "De directions différentes", "Nuls, sauf celui de B"], bonne: 0,
        expl: "En translation, <b>tous les points ont le même vecteur vitesse</b> à chaque instant : la pièce se déplace « d'un bloc »." },
      // ---- translation circulaire
      { regler: TC, cacher: SANS,
        q: "Quel est le <b>mouvement de la pièce</b> par rapport au bâti ?", choix: MVT, bonne: 1,
        expl: "Piège classique : la pièce est portée par deux manivelles qui tournent, mais elle <b>reste toujours horizontale</b>. Ses points décrivent des cercles : c'est une <b>translation circulaire</b>, pas une rotation." },
      { regler: TC, cacher: SANS,
        q: "Quelle est la <b>trajectoire du point C</b> ?",
        choix: ["Un cercle de rayon égal à la longueur des manivelles", "Un cercle de centre O1", "Un segment de droite", "Une courbe quelconque"], bonne: 0,
        expl: "En translation circulaire, chaque point décrit un <b>cercle de même rayon que les manivelles</b> (45 mm), mais de centre différent : le centre de la trajectoire de C n'est ni O1 ni O2." },
      { regler: TC, cacher: SANS,
        q: "Pendant le mouvement, la <b>pièce</b> elle-même…",
        choix: ["Garde toujours la même orientation", "Tourne d'un tour par tour de manivelle", "Tourne d'un demi-tour", "Change d'orientation puis revient"], bonne: 0,
        expl: "Les deux manivelles sont égales et parallèles : la pièce <b>garde son orientation</b>. C'est ce qui distingue une translation (même circulaire) d'une rotation." },
      // ---- bielle-manivelle
      { regler: PG, cacher: SANS,
        q: "Quel est le <b>mouvement de la pièce</b> (la bielle) par rapport au bâti ?", choix: MVT, bonne: 3,
        expl: "La bielle <b>tourne et se déplace en même temps</b> : un bout suit la manivelle, l'autre le piston. Ni translation, ni rotation : <b>mouvement plan général</b>. Chaque point a sa propre trajectoire." },
      { regler: PG, cacher: SANS,
        q: "Quelle est la <b>trajectoire du point B</b>, lié au piston ?",
        choix: ["Un segment de droite", "Un cercle", "Une ellipse", "Une courbe quelconque"], bonne: 0,
        expl: "B est guidé par le piston dans sa glissière : il va et vient sur un <b>segment de droite</b> horizontal. Sa course vaut deux fois le rayon de la manivelle." },
      { regler: { "mouvement de la piece": "pg", "position du point c": 0 }, cacher: SANS,
        q: "C est placé sur l'axe de la manivelle (à 0 mm). Quelle est sa <b>trajectoire</b> ?",
        choix: ["Un cercle", "Un segment de droite", "Une ellipse", "Une courbe quelconque"], bonne: 0,
        expl: "Ce point est aussi un point de la manivelle, qui est en rotation : il décrit un <b>cercle</b> de rayon 40 mm. Les points de la bielle entre la manivelle et le piston décrivent des courbes fermées, entre le cercle et le segment." },
      { regler: PG, cacher: SANS,
        q: "La <b>vitesse du piston</b> (point B) est nulle quand…",
        choix: ["La manivelle et la bielle sont alignées (points morts)", "La manivelle est perpendiculaire à la bielle", "Jamais : le moteur tourne sans arrêt", "La bielle est horizontale"], bonne: 0,
        expl: "Aux <b>points morts</b>, le piston change de sens : sa vitesse passe par zéro, alors que la manivelle tourne à vitesse constante. C'est pour cela que la vitesse d'un piston n'est pas constante." },
    ],
  };
})(window.SIP);
