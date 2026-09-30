/* =====================================================================
   SI Papara — « Réussir l'écrit » : fiches de méthode pour le bac SI
   (Terminale). Affichées sur la page #/methode du site.
   Format de l'épreuve : note de service du BO n° 19 du 9 mai 2024
   (à partir de la session 2025).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  // fraction écrite en entier : numérateur au-dessus du trait (jamais de signe ÷)
  const fr = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;

  SIP.METHODE = {
    titre: "Réussir l'écrit",
    intro: "Huit fiches pour transformer ce que tu sais en points le jour de l'épreuve. Relis-les avant chaque DS et avant chaque sujet blanc.",
    fiches: [
      {
        id: "epreuve", titre: "L'épreuve en bref",
        html: `
<ul>
  <li><b>Écrit : 3 h 30</b>, en deux parties notées chacune sur 20 :
    <ul>
      <li><b>sciences de l'ingénieur</b>, 2 h 30 environ : elle compte pour <b>la moitié</b> de ta note ;</li>
      <li><b>sciences physiques</b>, 1 h environ : deux exercices indépendants, <b>un quart</b> de ta note.</li>
    </ul></li>
  <li><b>Épreuve pratique : 1 h</b>, notée sur 20, <b>un quart</b> de ta note : tu valides une performance d'un système par des expériences et des simulations.</li>
  <li>Le sujet de SI s'appuie sur <b>un produit innovant</b> (mobilité, territoire intelligent, santé, conception responsable…). Il évalue deux choses : <b>analyser</b> le produit pour comprendre sa complexité, et <b>modéliser</b> pour prévoir ses performances.</li>
  <li><b>Calculatrice autorisée</b> en mode examen.</li>
</ul>
<p class="astuce">Conséquence : la partie SI pèse deux fois plus que la physique. Mais une heure de physique bien préparée rapporte vite des points : ne la sacrifie pas.</p>`
      },
      {
        id: "temps", titre: "Gérer tes 2 h 30 de SI",
        html: `
<ol>
  <li><b>10 minutes pour lire tout le sujet</b>, crayon en main : surligne les exigences chiffrées du cahier des charges, repère les documents techniques (DT) et les documents réponses (DR).</li>
  <li><b>Un point vaut environ 7 min 30</b> (150 minutes pour 20 points). Une question sur 1 point ne mérite pas 20 minutes : passe et reviens.</li>
  <li><b>Les parties sont souvent indépendantes</b>, et un résultat intermédiaire est souvent donné plus loin (« on admet que… »). Bloqué ? Prends la valeur donnée et continue.</li>
  <li><b>Commence par ce que tu maîtrises</b>, mais numérote clairement tes réponses et rends tous les documents réponses.</li>
  <li><b>Garde 10 minutes à la fin</b> pour relire les unités, les conclusions et les documents réponses.</li>
</ol>`
      },
      {
        id: "calcul", titre: "Une question de calcul, en 4 temps",
        html: `
<ol>
  <li><b>La relation littérale</b>, avec le nom des grandeurs.</li>
  <li><b>L'application numérique</b>, avec les valeurs converties en unités SI.</li>
  <li><b>Le résultat</b>, avec son unité et 3 chiffres significatifs.</li>
  <li><b>Une phrase</b> qui répond à la question posée.</li>
</ol>
<p><b>Exemple.</b> Un moteur fournit 150 W à 3 000 tr/min. Quel couple fournit-il ?</p>
<div class="formule">ω = ${fr("2π·N", "60")} = ${fr("2π × 3 000", "60")} = 314 rad/s</div>
<div class="formule">C = ${fr("P", "ω")} = ${fr("150", "314")} = 0,477 N·m</div>
<p>« Le moteur fournit un couple de 0,477 N·m. »</p>
<p class="astuce">La relation et la démarche rapportent des points même si le résultat est faux. Un résultat seul, sans relation, en rapporte peu.</p>
<h3>Les conversions qui reviennent tout le temps</h3>
<ul>
  <li>Vitesse : v (en m/s) = ${fr("v (en km/h)", "3,6")}</li>
  <li>Vitesse de rotation : ω (en rad/s) = ${fr("2π·N", "60")}, avec N en tr/min</li>
  <li>Énergie : 1 Wh = 3 600 J ; 1 kWh = 3,6 × 10<sup>6</sup> J</li>
  <li>Charge : 1 Ah = 1 000 mAh = 3 600 C</li>
  <li>Température : T (en K) = θ (en °C) + 273,15</li>
  <li>Longueurs et surfaces : 1 mm = 10<sup>−3</sup> m ; 1 mm² = 10<sup>−6</sup> m²</li>
</ul>`
      },
      {
        id: "conclure", titre: "Conclure par rapport au cahier des charges",
        html: `
<ul>
  <li><b>Compare toujours à l'exigence chiffrée</b>, et cite-la : « L'exigence 1.3 (autonomie d'au moins 25 km) est satisfaite : 31 km > 25 km. »</li>
  <li><b>Si elle n'est pas satisfaite</b>, dis-le franchement, de combien, et propose une piste si on te la demande.</li>
</ul>
<h3>L'écart relatif</h3>
<div class="formule">écart = ${fr("| valeur − référence |", "référence")} × 100</div>
<ul>
  <li>Il est <b>toujours positif</b> (valeur absolue), en %.</li>
  <li><b>Précise toujours la référence</b> : « par rapport à la mesure », « par rapport au cahier des charges »…</li>
  <li>Exemple : simulation 4,2 m/s, mesure 4,0 m/s, référence = la mesure : écart = ${fr("| 4,2 − 4,0 |", "4,0")} × 100 = 5 %.</li>
</ul>
<h3>Interpréter un écart</h3>
<ul>
  <li>Écart plus petit que la dispersion des essais : <b>les essais ne mettent pas le modèle en défaut</b>.</li>
  <li>Écart important : cherche <b>l'hypothèse du modèle</b> qui l'explique (frottements négligés, rendement supposé constant, masse approchée, capteur imprécis…), puis propose de l'améliorer.</li>
</ul>`
      },
      {
        id: "documents", titre: "Lire les documents",
        html: `
<ul>
  <li><b>Diagramme des exigences</b> : repère les valeurs chiffrées et les relations. <i>satisfy</i> : le bloc qui satisfait l'exigence ; <i>verify</i> : le test qui la vérifie ; <i>deriveReqt</i> : exigence déduite d'une autre ; ⊕ : contenance (une exigence décomposée en sous-exigences).</li>
  <li><b>Chaîne de puissance</b> : alimenter → moduler → convertir → transmettre → agir. <b>Chaîne d'information</b> : acquérir → traiter → communiquer. Précise la nature de chaque flux : énergie électrique, énergie mécanique de rotation ou de translation, information.</li>
  <li><b>Courbes</b> : lis d'abord le nom et l'unité des axes. Repère le régime transitoire et le régime permanent. Relève les points avec leurs unités et trace sur le document réponse si on te le demande.</li>
  <li><b>Documents techniques</b> : surligne seulement les données utiles à la question, avec leurs unités.</li>
  <li><b>Programmes et algorigrammes</b> : fais tourner le programme « à la main » dans un petit tableau (une colonne par variable).</li>
</ul>`
      },
      {
        id: "erreurs", titre: "Les erreurs qui coûtent des points",
        html: `
<ul>
  <li><b>Un résultat sans unité</b>, ou avec la mauvaise unité.</li>
  <li><b>Une conversion oubliée</b> : km/h, tr/min, mAh, Wh, mm, °C.</li>
  <li><b>Arrondir trop tôt</b> : garde les valeurs exactes dans la calculatrice, arrondis seulement le résultat final (3 chiffres significatifs).</li>
  <li><b>Un résultat absurde non signalé</b> : un rendement supérieur à 1, une masse négative, un vélo à 400 m/s. Vérifie l'ordre de grandeur, et si tu ne trouves pas l'erreur, écris que le résultat est incohérent.</li>
  <li><b>Confondre</b> puissance (W) et énergie (J ou Wh), couple (N·m) et force (N), masse (kg) et poids (N).</li>
  <li><b>Conclure sans comparer</b> à l'exigence du cahier des charges.</li>
  <li><b>Un écart relatif négatif</b>, ou sans dire par rapport à quoi.</li>
  <li><b>Laisser une question blanche</b> : écris au moins la relation et la démarche.</li>
</ul>`
      },
      {
        id: "physique", titre: "La partie sciences physiques (1 h)",
        html: `
<ul>
  <li><b>Deux exercices indépendants</b> : si l'un bloque, passe à l'autre. Compte environ 30 minutes par exercice.</li>
  <li>On te demande de <b>modéliser</b> et de <b>résoudre avec prise d'initiative</b> : écris tes hypothèses et ta démarche, même incomplète ; elle est valorisée.</li>
  <li>Les notions qui tombent le plus souvent : 2<sup>e</sup> loi de Newton et mouvements, mesures et incertitudes, ondes et son, thermodynamique, gravitation, énergie mécanique.</li>
  <li><b>Incertitudes</b> : un résultat de mesure s'écrit avec son incertitude et son unité, par exemple g = (9,79 ± 0,05) m/s².</li>
</ul>`
      },
      {
        id: "plan", titre: "Ta routine jusqu'à l'écrit",
        html: `
<ul>
  <li><b>Tous les jours, 5 à 10 minutes</b> : la révision du jour. C'est elle qui ancre les formules et le vocabulaire dans ta mémoire.</li>
  <li><b>Chaque semaine</b> : chaque notion de la semaine jusqu'à <b>16/20</b> avant son DS, et un parcours « Travaille tes faiblesses ».</li>
  <li><b>Toutes les deux semaines</b> : un <b>sujet blanc</b> chronométré. Relis chaque correction ouverte et refais ensuite une série sur les notions en rouge.</li>
  <li><b>Pendant les vacances</b> : un parcours par jour sur les notions déjà vues, et un sujet blanc par semaine.</li>
  <li><b>Les dernières semaines</b> : sujets complets en temps limité, en classe, et relecture des fiches des notions les plus probables.</li>
</ul>
<p class="astuce">Viser 20, c'est surtout ne perdre aucun point facile : unités, conversions, phrase de conclusion, comparaison au cahier des charges. Ces points-là se gagnent à chaque question.</p>`
      }
    ]
  };
})(window.SIP);
