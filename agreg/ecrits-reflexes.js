/* =====================================================================
   SI Papara — agrégation : fiches réflexes en répétition espacée (#ecrits-reflexes)
   Une centaine de réflexes, notion par notion (une question au recto, le réflexe au verso, et le piège relevé par
   les rapports quand il y en a un). Révision du jour : les cartes dues puis quelques nouvelles ; « je savais »
   fait monter la carte d'une boîte (1, 3, 7, 14 puis 30 jours), « à revoir » la remet en jeu dans la séance.
   Chaque notion a aussi sa fiche d'une page, imprimable.
   Progression : st.ec.fr (boîte et échéance par carte). Globales de agreg/index.html : st, save, app.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const E = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = () => { if (!st.ec || typeof st.ec !== 'object') st.ec = {}; if (!st.ec.fr || typeof st.ec.fr !== 'object' || Array.isArray(st.ec.fr)) st.ec.fr = {}; return st.ec; };
  const JOUR = 864e5, BOITES = [0, 1, 3, 7, 14, 30], NOUVELLES = 12;
  const NOMS = { asserv: 'Asservissement', puiss: 'Puissances', fourier: 'Fourier et valeurs', elec: 'Électronique', bus: 'Bus et trames', machines: 'Machines', conv: 'Convertisseurs', python: 'Python', signal: 'Signal et acquisition', meca: 'Mécanique', thermo: 'Thermique et fluides', magn: 'Électromagnétisme', ped: 'Partie pédagogique', forme: 'La forme de la copie' };
  // [notion, recto, verso]
  const C = [
    ['asserv', 'Premier ordre K/(1 + τp) : temps de réponse à 5 % ?', 't5% ≈ 3τ ; à t = τ, 63 % de la valeur finale ; tangente à l’origine de pente K·E/τ.'],
    ['asserv', 'Second ordre : quand y a-t-il dépassement, et combien ?', 'Si m &lt; 1 : D% = exp(−πm/√(1 − m²)) ; m = 0,7 donne environ 5 % et le temps de réponse le plus court.'],
    ['asserv', 'Erreur statique pour un échelon, retour unitaire, FTBO de classe 0 et de gain K ?', 'ε∞ = E/(1 + K) ; nulle dès qu’il y a une intégration dans la boucle (classe ≥ 1).'],
    ['asserv', 'Marge de phase : où la lire ?', 'À la pulsation où |FTBO| = 0 dB : Mφ = 180° + arg FTBO(jω<sub>c0</sub>) ; on vise couramment 45°.'],
    ['asserv', 'Marge de gain : où la lire ?', 'À la pulsation où arg FTBO = −180° : MG = −20·log|FTBO| ; on vise 10 à 12 dB.'],
    ['asserv', 'Effet d’un correcteur PI, et où placer 1/T<sub>i</sub> ?', 'Il annule l’erreur statique (intégration) ; 1/T<sub>i</sub> environ une décade sous ω<sub>c0</sub> pour ne pas trop entamer la marge de phase.'],
    ['asserv', 'Linéariser autour d’un point de fonctionnement ?', 'La tangente : y ≈ y<sub>0</sub> + (dy/dx)<sub>x0</sub>·(x − x<sub>0</sub>), valable pour de petites variations (relevé par le jury, interne 2026).'],
    ['asserv', 'Théorème de la valeur finale ?', 'lim<sub>t→∞</sub> s(t) = lim<sub>p→0</sub> p·S(p), à n’appliquer que si le système est stable.'],
    ['puiss', 'Puissances en monophasé sinusoïdal ?', 'P = U·I·cos φ (W), Q = U·I·sin φ (var), S = U·I (VA), S² = P² + Q².'],
    ['puiss', 'Triphasé équilibré : puissance active ?', 'P = √3·U·I·cos φ avec U tension composée et I courant de ligne ; en étoile V = U/√3.'],
    ['puiss', 'Théorème de Boucherot ?', 'Les puissances actives s’additionnent, les réactives aussi (algébriquement), jamais les apparentes.'],
    ['puiss', 'Relever le facteur de puissance de cos φ<sub>1</sub> à cos φ<sub>2</sub> ?', 'Q<sub>C</sub> = P·(tan φ<sub>1</sub> − tan φ<sub>2</sub>) ; en monophasé C = Q<sub>C</sub>/(U²ω) ; en triphasé, condensateurs en triangle : C = Q<sub>C</sub>/(3U²ω).'],
    ['puiss', 'Puissance complexe ?', 'S = V·I* = P + jQ ; une charge inductive consomme Q &gt; 0.'],
    ['puiss', 'Puissance, énergie : les pièges ?', '1 kWh = 3,6 MJ ; ne pas confondre puissance et énergie, valeur moyenne et efficace (plus de 80 % des calculs de puissance faux ou absents, interne 2025).'],
    ['puiss', 'Rendement d’une chaîne de conversion ?', 'Le produit des rendements ; chaque étage absorbe la puissance de l’étage suivant divisée par son propre rendement.'],
    ['puiss', 'Énergie restituée par un supercondensateur de U<sub>1</sub> à U<sub>2</sub> ?', 'W = ½C(U<sub>1</sub>² − U<sub>2</sub>²) ; décharger jusqu’à U/2 libère 75 % de l’énergie (méconnu, externe 2022).'],
    ['fourier', 'Valeur efficace d’un signal périodique avec harmoniques ?', 'Racine de la moyenne du carré : U² = U<sub>0</sub>² + Σ U<sub>k</sub>² (Parseval, valeurs efficaces des harmoniques).'],
    ['fourier', 'Créneau ±E de rapport cyclique ½ : spectre ?', 'Harmoniques impairs seulement, d’amplitude 4E/(kπ) ; fondamental 4E/π.'],
    ['fourier', 'Taux de distorsion harmonique ?', 'THD = √(Σ<sub>k≥2</sub> I<sub>k</sub>²)/I<sub>1</sub>.'],
    ['fourier', 'Valeur moyenne d’un pont PD2, d’un pont PD3 ?', 'PD2 : 2V̂/π ; PD3 : 3√2·U/π ≈ 1,35·U (U composée efficace).'],
    ['fourier', 'Courant de ligne d’un PD3 qui débite I<sub>d</sub> constant ?', 'Créneaux ±I<sub>d</sub> pendant 120° : I<sub>eff</sub> = I<sub>d</sub>·√(2/3) ; fondamental √6·I<sub>d</sub>/π (calculs non maîtrisés par la plupart, interne 2026).'],
    ['fourier', 'Facteur de puissance avec harmoniques ?', 'k = P/S = (I<sub>1</sub>/I)·cos φ<sub>1</sub> : facteur de déformation × facteur de déplacement.'],
    ['fourier', 'Valeur efficace d’un triangle de crête E et de moyenne nulle ?', 'E/√3.'],
    ['fourier', 'Sinus redressé double alternance : moyenne et efficace ?', 'Moyenne 2V̂/π ; efficace V̂/√2, comme la sinusoïde.'],
    ['elec', 'ALI : amplificateur ou comparateur ?', 'Contre-réaction sur l’entrée − : régime linéaire, ε = 0 ; réaction sur + ou pas de réaction : saturation, comparateur (3 % de réussite, externe 2025).'],
    ['elec', 'Théorème de Millman ?', 'V = Σ(V<sub>k</sub>/R<sub>k</sub>)/Σ(1/R<sub>k</sub>) sur les branches reliées au nœud (une source de courant s’ajoute au numérateur).'],
    ['elec', 'Thévenin d’un diviseur E, R<sub>1</sub> en haut, R<sub>2</sub> en bas ?', 'E<sub>th</sub> = E·R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) ; R<sub>th</sub> = R<sub>1</sub>·R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>).'],
    ['elec', 'Charge d’un condensateur sous E à travers R ?', 'u<sub>C</sub> = E(1 − e<sup>−t/RC</sup>), i = (E/R)·e<sup>−t/RC</sup> ; en régime continu, C est un circuit ouvert.'],
    ['elec', 'Bobine : régime continu et continuité ?', 'Court-circuit en continu ; le courant ne peut pas varier brutalement (u<sub>L</sub> = L·di/dt) ; τ = L/R (circuit RL : 4 % de réussite, externe 2025).'],
    ['elec', 'Pont de Wheatstone en quart de pont ?', 'V<sub>d</sub> ≈ (E/4)·ΔR/R pour de petites variations.'],
    ['elec', 'Sallen-Key passe-bas, gain unité, deux résistances R ?', 'ω<sub>0</sub> = 1/(R√(C<sub>1</sub>C<sub>2</sub>)), m = √(C<sub>2</sub>/C<sub>1</sub>), C<sub>1</sub> en contre-réaction (5 % de réussite, interne 2025).'],
    ['elec', 'Bruit thermique d’une résistance ?', 'e<sub>n</sub> = √(4k<sub>B</sub>TRΔf) ; des bruits indépendants s’ajoutent en quadrature.'],
    ['bus', 'Durée d’un caractère en 8N1 ?', '10 bits (start, 8 données, stop) : t = 10/débit.'],
    ['bus', 'Premier octet d’un échange I²C ?', 'Adresse sur 7 bits, poids fort en premier, puis R/W̄ (0 = écriture) ; l’esclave acquitte en tirant SDA à 0.'],
    ['bus', 'SPI : qui fournit l’horloge, et comment circulent les données ?', 'Le maître fournit SCLK ; MOSI et MISO en même temps (full duplex) ; un CS actif bas par esclave ; le mode = (CPOL, CPHA).'],
    ['bus', 'Arbitrage CAN ?', 'Le bit dominant est 0 : l’identifiant le plus petit gagne, sans perte de trame.'],
    ['bus', 'Complément à deux sur n bits ?', 'Valeur = brut − 2<sup>n</sup> si le bit de poids fort vaut 1 ; plage de −2<sup>n−1</sup> à 2<sup>n−1</sup> − 1.'],
    ['bus', 'Charge d’un bus ?', 'Temps occupé sur temps total : Σ(bits par trame × trames par seconde)/débit.'],
    ['bus', 'Résistance de tirage I²C ?', 'R ≥ (V<sub>DD</sub> − V<sub>OL</sub>)/I<sub>OL</sub> (minimum) et R ≤ t<sub>r</sub>/(0,8473·C<sub>b</sub>) (maximum).'],
    ['bus', 'QPSK ?', 'Modulation de phase à 4 états : 2 bits par symbole (peu de candidats le savaient, externe 2026).'],
    ['machines', 'Vitesse de synchronisme et glissement ?', 'n<sub>s</sub> = f/p (tr/s) = 60f/p (tr/min) ; g = (n<sub>s</sub> − n)/n<sub>s</sub>.'],
    ['machines', 'Machine asynchrone : où va la puissance transmise au rotor ?', 'P<sub>tr</sub> = C<sub>em</sub>·Ω<sub>s</sub> ; pertes Joule rotor g·P<sub>tr</sub> ; puissance mécanique (1 − g)·P<sub>tr</sub>.'],
    ['machines', 'Modèle de Behn-Eschenburg ?', 'Par phase, en alternateur (convention générateur) : E = V + R·I + jX<sub>s</sub>·I ; en moteur (convention récepteur) : V = E + R·I + jX<sub>s</sub>·I. E est proportionnelle à la vitesse et, sans saturation, au courant d’excitation.'],
    ['machines', 'Puissance d’un alternateur couplé au réseau ?', 'P = 3·V·E·sin δ/X<sub>s</sub> (R négligée), δ angle interne entre E et V.'],
    ['machines', 'Machine à courant continu ?', 'E = k·Ω, C = k·I, U = E + R·I.'],
    ['machines', 'Choisir un moteur ?', 'Vérifier le couple ET la vitesse (souvent oubliée, externe 2026), puis le couple efficace sur le cycle et le couple crête.'],
    ['machines', 'Inertie ramenée sur l’arbre moteur ?', 'J<sub>éq</sub> = J<sub>m</sub> + J<sub>charge</sub>/r² + m·(v/ω<sub>m</sub>)² pour une masse en translation.'],
    ['machines', 'Diagramme de Fresnel d’un alternateur (R négligée) ?', 'V en référence, I déphasé de φ, puis jX<sub>s</sub>I en avance de 90° sur I, ajouté au bout de V : E = V + jX<sub>s</sub>I ; l’angle interne δ va de V à E.'],
    ['conv', 'Hacheur série : valeur moyenne et ondulation ?', '⟨u⟩ = α·E ; Δi = E·α(1 − α)/(L·f), maximale à α = ½ : E/(4Lf).'],
    ['conv', 'Hacheur élévateur ?', 'V<sub>s</sub> = E/(1 − α) en conduction continue.'],
    ['conv', 'Pertes d’un MOSFET ?', 'Conduction R<sub>DS(on)</sub>·I<sub>eff</sub>² (à la température de jonction) + commutation ≈ ½·U·I·(t<sub>on</sub> + t<sub>off</sub>)·f.'],
    ['conv', 'Température de jonction ?', 'T<sub>j</sub> = T<sub>a</sub> + P·(R<sub>th j-c</sub> + R<sub>th c-r</sub> + R<sub>th r-a</sub>), à comparer à T<sub>j max</sub>.'],
    ['conv', 'Onduleur à commande décalée : valeur efficace ?', 'u = ±E pendant 180° − θ par demi-période, 0 pendant θ : U<sub>eff</sub> = E·√(1 − θ/180°).'],
    ['conv', 'Gradateur sur charge résistive, angle α ?', 'P = P<sub>0</sub>·(1 − α/π + sin 2α/(2π)).'],
    ['conv', 'Rendement d’un convertisseur ?', 'Compter toutes les pertes : semi-conducteurs ET inductance (peu le font, externe 2026).'],
    ['conv', 'Pont PD3 : combien de pulsations, quelle ondulation ?', '6 pulsations par période réseau, soit 300 Hz en sortie pour un réseau à 50 Hz.'],
    ['python', 'Parcourir une liste de n éléments par indice ?', 'for i in range(len(x)) : indices de 0 à n − 1 ; x[-1] est le dernier élément, piège classique.'],
    ['python', 'Trapèzes à pas variable ?', 'Σ (y[i] + y[i+1])/2 · (t[i+1] − t[i]) pour i de 0 à n − 2.'],
    ['python', 'Euler explicite pour τ·y′ + y = x ?', 'y[n] = y[n−1] + (Te/τ)·(x[n−1] − y[n−1]) ; stable si Te &lt; 2τ.'],
    ['python', 'Dichotomie ?', 'Tester f(a)·f(m) ≤ 0 pour garder le zéro dans [a, m] ; boucle tant que b − a &gt; eps ; environ log<sub>2</sub>((b − a)/eps) tours.'],
    ['python', 'Maximum d’une liste sans max() ?', 'Initialiser avec le premier élément, pas avec 0 ; comparer avec &gt; strict pour garder le premier en cas d’égalité.'],
    ['python', 'Angle d’un vecteur (x, y) ?', 'math.atan2(y, x) : bon quadrant et pas de division par zéro ; en degrés math.degrees, puis % 360.'],
    ['python', 'Entier signé sur 12 bits, aligné à gauche dans deux octets ?','brut = (msb &lt;&lt; 4) | (lsb &gt;&gt; 4) ; si brut &amp; 0x800 : brut −= 4096.'],
    ['python', 'Boucle « perturber et observer » ?', 'Mettre à jour les mémoires à chaque tour (p_prec = p, v_prec = v), sinon on compare toujours au premier point : la mise à jour dans la boucle est souvent mal faite (externe 2026).'],
    ['signal', 'Shannon ?', 'f<sub>e</sub> &gt; 2·f<sub>max</sub> ; en pratique, un filtre anti-repliement coupe avant f<sub>e</sub>/2.'],
    ['signal', 'CAN de n bits : quantum, bruit, rapport signal sur bruit ?', 'q = PE/2<sup>n</sup> ; bruit q/√12 ; RSB ≈ 6,02n + 1,76 dB pour un sinus pleine échelle.'],
    ['signal', 'Boucle 4-20 mA ?', 'I = 4 + 16·(x − x<sub>min</sub>)/(x<sub>max</sub> − x<sub>min</sub>) ; le 4 mA, « zéro vivant », révèle un fil coupé.'],
    ['signal', 'Passe-bas du premier ordre à la coupure ?', '−3 dB et −45° à ω<sub>c</sub> ; puis −20 dB/décade.'],
    ['signal', 'Filtre anti-repliement d’ordre n ?', 'Atténuation à f<sub>e</sub>/2 ≈ 20n·log(f<sub>e</sub>/(2f<sub>c</sub>)) dB, à comparer à la dynamique du CAN.'],
    ['signal', 'Moyenne glissante sur N points ?', 'Un filtre à réponse impulsionnelle finie passe-bas ; premier zéro de gain à f<sub>e</sub>/N.'],
    ['signal', 'Débit d’un flux numérique ?', 'f<sub>e</sub> × bits par échantillon × nombre de voies.'],
    ['signal', 'Décibels : tension ou puissance ?', '20·log pour une tension, 10·log pour une puissance ; ×2 en tension = +6 dB ; ÷√2 = −3 dB.'],
    ['meca', 'Théorème de l’énergie cinétique ?', 'dE<sub>c</sub>/dt = somme des puissances ; en rotation P = J·ω·ω̇ (rarement écrit, externe 2026).'],
    ['meca', 'Changer un moment de point ?', 'M<sub>B</sub> = M<sub>A</sub> + BA ∧ R (relation de Varignon) ; la résultante ne change pas.'],
    ['meca', 'PFD sur une pente de p % ?', 'α = arctan(p/100) ; sur la pente : m·a = F − m·g·sin α − f·m·g·cos α, f coefficient de résistance au roulement (mal maîtrisé, externe 2026).'],
    ['meca', 'Inertie d’un cylindre plein, creux, d’un tube mince ?', 'Plein ½mR² ; creux ½m(R<sub>e</sub>² + R<sub>i</sub>²) ; tube mince mR².'],
    ['meca', 'Contrainte de flexion maximale ?', 'σ = M<sub>f</sub>·v/I (v distance à la fibre neutre) ; rectangle I = bh³/12 ; en flexion composée, + N/S.'],
    ['meca', 'Réducteur : vitesse et couple de sortie ?', 'ω<sub>s</sub> = ω<sub>e</sub>/r ; C<sub>s</sub> = C<sub>e</sub>·r·η.'],
    ['meca', 'Accélérations d’un point en rotation ?', 'Normale R·ω², tangentielle R·ω̇.'],
    ['meca', 'Portance et traînée ?', 'F = ½ρSV²C ; la traînée suit le vent apparent, la portance lui est perpendiculaire ; projeter sur l’axe utile.'],
    ['thermo', 'Résistance thermique d’une paroi plane ?', 'R = e/(λS) ; couches en série : on additionne.'],
    ['thermo', 'Paroi cylindrique ?', 'r = ln(D<sub>2</sub>/D<sub>1</sub>)/(2πλh).'],
    ['thermo', 'Chauffer un débit de matière ?', 'Φ = q<sub>m</sub>·c·Δθ : une ligne, réussie par à peine 5 % des candidats (interne 2025).'],
    ['thermo', 'Pertes de charge ?', 'j = Λ·ρv²/(2D) en Pa/m ; singularités ζ·ρv²/2 ; ΔP = jL + Σζ·ρv²/2.'],
    ['thermo', 'Bernoulli généralisé ?', 'P<sub>1</sub> + ρgz<sub>1</sub> + ½ρv<sub>1</sub>² + ΔP<sub>pompe</sub> − ΔP<sub>pertes</sub> = P<sub>2</sub> + ρgz<sub>2</sub> + ½ρv<sub>2</sub>².'],
    ['thermo', 'Puissance d’une pompe ?', 'P<sub>hyd</sub> = q<sub>v</sub>·Δp = ρ·g·q<sub>v</sub>·H<sub>mt</sub> ; puissance absorbée P<sub>hyd</sub>/η.'],
    ['thermo', 'Lois de similitude d’une pompe ?', 'Q ∝ N, H ∝ N², P ∝ N³.'],
    ['thermo', 'Inertie thermique ?', 'Le même modèle qu’un circuit RC : τ = R<sub>th</sub>·C<sub>th</sub> avec C<sub>th</sub> = m·c.'],
    ['magn', 'Théorème d’Ampère dans un circuit magnétique avec entrefer ?', '∮H·dl = N·I ; N·I ≈ B·e/μ<sub>0</sub> + B·l/(μ<sub>0</sub>μ<sub>r</sub>) : l’entrefer domine.'],
    ['magn', 'Réluctance et loi d’Hopkinson ?', 'ℛ = l/(μS) ; N·I = ℛ·Φ, comme une loi d’Ohm magnétique.'],
    ['magn', 'Inductance d’une bobine sur circuit magnétique ?', 'L = N²/ℛ.'],
    ['magn', 'Énergie stockée dans une bobine ?', '½LI², stockée surtout dans l’entrefer ; les formules des énergies stockées sont méconnues (externe 2023).'],
    ['magn', 'Transformateur parfait ?', 'u<sub>2</sub>/u<sub>1</sub> = N<sub>2</sub>/N<sub>1</sub> = m ; i<sub>2</sub>/i<sub>1</sub> = 1/m ; puissance conservée.'],
    ['magn', 'Force électromotrice induite ?', 'e = −N·dΦ/dt ; en sinusoïdal E = 4,44·N·f·B̂·S.'],
    ['magn', 'Force de Laplace ?', 'F = I·L ∧ B ; couple d’un cadre C = N·I·S·B·sin θ.'],
    ['magn', 'Pertes fer ?', 'Hystérésis ∝ f·B̂<sup>n</sup> (n entre 1,6 et 2) ; courants de Foucault ∝ f²·B̂²·e² (e épaisseur des tôles) : d’où les tôles minces et isolées.'],
    ['ped', 'Une hypothèse dans un protocole ?', 'Une relation vérifiable entre grandeurs (« a = R·ω² »), avec les paramètres variables, contrôlés et observés.'],
    ['ped', 'Un indicateur d’évaluation ?', 'Observable et vérifiable (verbe d’action), relié à une compétence, avec des niveaux d’appréciation gradués (interne 2026).'],
    ['ped', 'Un prompt pour une IA ?', 'Rôle, niveau, contenu précis, contraintes de forme, demande de vérification : exploitable tel quel, sans reformuler la question.'],
    ['ped', 'Une séquence pédagogique ?', 'Problématique, compétences du programme, prérequis, séances aux activités variées, synthèse, évaluations formative et sommative.'],
    ['ped', 'Une fiche connaissances ?', 'Une page, au niveau visé, exacte, structurée, avec un exemple chiffré lié au support.'],
    ['ped', 'Un modèle multiphysique ?', 'Paramètres identifiés, recalage sur l’expérience, validation sur un autre essai, puis extrapolation au système réel (moins de 20 % y répondent, interne 2025).'],
    ['ped', 'Une évaluation sommative ?', 'Mise en situation, données suffisantes, questions progressives alignées sur la compétence, barème et durée réalistes.'],
    ['ped', 'Le piège de la partie pédagogique ?', 'Reformuler la question ou recopier une IA : pénalisé (interne 2025). La partie est déterminante : plus de 60 % de réussite chez ceux qui la traitent.'],
    ['forme', 'Une réponse à « calculer » complète ?', 'Expression littérale, application numérique, résultat encadré avec son unité.'],
    ['forme', 'Un résultat aberrant ?', 'Le signaler et le commenter (rendement supérieur à 1, ordre de grandeur) : l’esprit critique est valorisé.'],
    ['forme', 'Combien de chiffres significatifs ?', 'Trois, cohérents avec les données ; jamais dix.'],
    ['forme', 'Gérer le temps d’une épreuve ?', 'Lecture stratégique d’un quart d’heure, budget par partie, questions accessibles d’abord, toutes les parties abordées.'],
    ['forme', 'Homogénéité ?', 'Vérifier les dimensions de l’expression littérale avant l’application numérique.'],
    ['forme', 'La démarche ?', 'Nommer la loi, le système isolé, les hypothèses : un résultat sans justification ne rapporte pas ou peu.'],
    ['forme', 'Un graphe ou un schéma ?', 'Un titre, des axes gradués avec grandeur et unité, une légende ; un schéma propre remplace souvent un long paragraphe.'],
    ['forme', 'Une question qui bloque ?', 'Reprendre le résultat donné par l’énoncé, ou poser une valeur plausible en le signalant, et continuer : les parties sont souvent indépendantes.']
  ];
  // identifiant stable tiré du recto : ajouter une carte ne décale pas la progression des autres
  const hache = (s) => { let x = 2166136261; for (const ch of s) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36); };
  const CARTES = C.map(([n, r, v]) => ({ id: `${n}-${hache(r)}`, n, r, v }));
  const ORDRE = Object.keys(NOMS);
  const etat = (c) => S().fr[c.id] || null;
  const due = (c, now) => { const e = etat(c); return e && e.d <= now; };

  function css() {
    if ($('#rf-css')) return;
    const s = document.createElement('style'); s.id = 'rf-css';
    s.textContent = `.rf-c{background:#fff;border-radius:14px;padding:22px 22px 18px;box-shadow:0 1px 3px rgba(24,48,71,.12);min-height:180px;display:flex;flex-direction:column;gap:12px}.rf-c .rf-n{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#587083}.rf-c .rf-r{font-size:20px;font-weight:700;line-height:1.35}.rf-c .rf-v{font-size:17px;line-height:1.5;border-top:1px dashed #c9d6e0;padding-top:12px}.rf-b{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.rf-b .b{flex:1;min-width:140px;justify-content:center;text-align:center}.rf-ok{background:#2f7a53!important;border-color:#2f7a53!important;color:#fff!important}.rf-ko{background:#fff!important;color:#a8362b!important;border-color:#a8362b!important}.rf-f h2{margin:14px 0 6px;font-size:17px}.rf-f dl{margin:0;display:grid;grid-template-columns:1fr;gap:6px}.rf-f dt{font-weight:700}.rf-f dd{margin:0 0 4px}@media (hover:none){.rf-kb{display:none}}@media print{body *{visibility:hidden}.rf-f,.rf-f *{visibility:visible}.rf-f{position:absolute;left:0;top:0;width:100%;font-size:10.5pt}.rf-f .no-print{display:none}.rf-f dl{gap:2px}.rf-f dd{margin-bottom:2px}}`;
    document.head.appendChild(s);
  }
  function stats(now) {
    const vues = CARTES.filter((c) => etat(c)), sues = vues.filter((c) => etat(c).b >= 3), dues = vues.filter((c) => due(c, now));
    return { vues: vues.length, sues: sues.length, dues: dues.length };
  }
  function carte() {
    const s = stats(Date.now());
    return `<div class="ec-ep" style="--c:#c27c0e"><div class="eyebrow">Toutes les épreuves · un quart d’heure par jour</div><h3>Fiches réflexes</h3><p class="muted">${CARTES.length} réflexes, notion par notion, en répétition espacée : la question, puis le réflexe et le piège relevé par les rapports. Chaque notion a aussi sa fiche d’une page à imprimer.${s.vues ? ` ${s.sues} sues sur ${CARTES.length}, ${s.dues} à revoir aujourd’hui.` : ''}</p><div class="btns"><a class="b" href="#ecrits-reflexes-revue">Réviser</a><a class="b sec" href="#ecrits-reflexes">Les fiches</a></div></div>`;
  }
  function accueil() {
    css();
    const now = Date.now(), s = stats(now);
    let h = `<a class="back" href="#ecrits">← Les écrits</a><div class="eyebrow">Les écrits · réflexes</div><h1>Fiches réflexes</h1>
      <p class="muted">Un réflexe se gagne en le revoyant juste avant de l’oublier. Chaque jour : les cartes dues, puis ${NOUVELLES} nouvelles au plus. « Je savais » fait passer la carte à la boîte suivante (revue dans 1, 3, 7, 14 puis 30 jours) ; « à revoir » la remet dans la séance.</p>
      <div class="btns"><a class="b" href="#ecrits-reflexes-revue">Révision du jour${s.dues ? ` (${s.dues} dues)` : ''}</a></div>
      <p class="muted">${s.vues} carte${s.vues > 1 ? 's' : ''} vue${s.vues > 1 ? 's' : ''} sur ${CARTES.length}, ${s.sues} sue${s.sues > 1 ? 's' : ''} (boîte 3 ou plus).</p>
      <div class="ec-sc"><table class="ec-tab"><tr><th>Notion</th><th>Cartes</th><th>Vues</th><th>Sues</th><th>Dues</th><th></th></tr>`;
    ORDRE.forEach((n) => {
      const L = CARTES.filter((c) => c.n === n), v = L.filter((c) => etat(c)), su = v.filter((c) => etat(c).b >= 3), du = v.filter((c) => due(c, now));
      h += `<tr><td>${E(NOMS[n])}</td><td class="n">${L.length}</td><td class="n">${v.length}</td><td class="n">${su.length}</td><td class="n">${du.length}</td><td><a href="#ecrits-reflexes-revue-${n}">Réviser</a> · <a href="#ecrits-reflexes-fiche-${n}">Fiche</a></td></tr>`;
    });
    h += '</table></div>';
    app().innerHTML = h;
  }
  function fiche(n) {
    css();
    if (!NOMS[n]) return accueil();
    const L = CARTES.filter((c) => c.n === n);
    app().innerHTML = `<div class="rf-f"><a class="back no-print" href="#ecrits-reflexes">← Fiches réflexes</a><div class="eyebrow">Fiche réflexe · une page</div><h1>${E(NOMS[n])}</h1><dl>${L.map((c) => `<dt>${c.r}</dt><dd>${c.v}</dd>`).join('')}</dl><div class="btns no-print" style="margin-top:14px"><button class="b" id="rf-print">Imprimer</button><a class="b sec" href="#ecrits-reflexes-revue-${n}">Réviser ces cartes</a></div></div>`;
    $('#rf-print').onclick = () => window.print();
  }
  function revue(n) {
    css();
    const now = Date.now();
    const pool = CARTES.filter((c) => !n || c.n === n);
    const dues = pool.filter((c) => due(c, now)).sort((a, b) => etat(a).d - etat(b).d);
    // les nouvelles cartes alternent les notions (une de chaque, à tour de rôle)
    const paquets = ORDRE.map((k) => pool.filter((c) => c.n === k && !etat(c))), neuves = [];
    for (let r = 0; neuves.length < NOUVELLES && paquets.some((p) => p.length > r); r++) paquets.forEach((p) => { if (p[r] && neuves.length < NOUVELLES) neuves.push(p[r]); });
    const file = [...dues, ...neuves];
    let i = 0, vu = false, ok = 0, ko = 0;
    const titre = n ? NOMS[n] : 'Toutes les notions';
    if (!file.length) {
      const prochaine = pool.map((c) => etat(c)).filter(Boolean).map((e) => e.d).sort((a, b) => a - b)[0];
      app().innerHTML = `<a class="back" href="#ecrits-reflexes">← Fiches réflexes</a><h1>${E(titre)}</h1><div class="card"><p>Rien à revoir pour l’instant.${prochaine ? ` Prochaine carte le ${new Date(prochaine).toLocaleDateString('fr-FR')}.` : ''}</p><div class="btns"><a class="b" href="#ecrits-reflexes">Retour aux fiches</a></div></div>`;
      return;
    }
    app().innerHTML = `<a class="back" href="#ecrits-reflexes">← Fiches réflexes</a><div class="eyebrow">Révision · ${E(titre)}</div><h1 id="rf-h"></h1><div class="sp-bar" style="height:8px;border-radius:4px;background:#e0e8ef;overflow:hidden;margin:6px 0 14px"><i id="rf-bar" style="display:block;height:100%;background:#c27c0e;width:0"></i></div><div id="rf-z"></div><p class="muted rf-kb" style="margin-top:10px">Clavier : espace pour retourner la carte, 1 pour « à revoir », 2 pour « je savais ».</p>`;
    function montre() {
      if (i >= file.length) return fin();
      const c = file[i];
      $('#rf-h').textContent = `Carte ${Math.min(i + 1, file.length)} sur ${file.length}`;
      $('#rf-bar').style.width = `${100 * i / file.length}%`;
      $('#rf-z').innerHTML = `<div class="rf-c" id="rf-c"><span class="rf-n">${E(NOMS[c.n])}${etat(c) ? ` · boîte ${etat(c).b}` : ' · nouvelle'}</span><div class="rf-r">${c.r}</div>${vu ? `<div class="rf-v">${c.v}</div>` : ''}</div>
        <div class="rf-b">${vu ? '<button class="b rf-ko" data-r="0">À revoir</button><button class="b rf-ok" data-r="1">Je savais</button>' : '<button class="b" data-r="v">Retourner</button>'}</div>`;
    }
    function repondre(r) {
      const c = file[i];
      if (r === 'v') { vu = true; return montre(); }
      const e = Object.assign({ b: 0, d: 0, n: 0 }, etat(c));
      e.n++; e.t = Date.now();
      if (r === '1') { e.b = Math.min(5, e.b + 1); e.d = Date.now() + BOITES[e.b] * JOUR; ok++; }
      else { e.b = 0; e.d = Date.now(); ko++; file.push(c); }
      S().fr[c.id] = e; save();
      i++; vu = false; montre();
    }
    function fin() {
      $('#rf-h').textContent = 'Séance terminée'; $('#rf-bar').style.width = '100%';
      $('#rf-z').innerHTML = `<div class="card"><p>${ok} carte${ok > 1 ? 's' : ''} sue${ok > 1 ? 's' : ''}${ko ? `, ${ko} reprise${ko > 1 ? 's' : ''} dans la séance` : ''}. Reviens demain : les cartes reviennent quand il faut.</p><div class="btns"><a class="b" href="#ecrits-reflexes">Retour aux fiches</a></div></div>`;
      lacher();
    }
    $('#rf-z').onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) repondre(b.dataset.r); };
    lacher();
    clavier = (e) => {
      if (!$('#rf-c') || (e.target.closest && e.target.closest('input,textarea,select')) || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.key === ' ' || e.key === 'Enter') && !vu) { e.preventDefault(); repondre('v'); }
      else if (vu && (e.key === '1' || e.key === '2')) { e.preventDefault(); repondre(e.key === '2' ? '1' : '0'); }
    };
    document.addEventListener('keydown', clavier);
    window.addEventListener('hashchange', lacher, { once: true });
    montre();
  }
  let clavier = null;
  function lacher() { if (clavier) document.removeEventListener('keydown', clavier); clavier = null; }
  function route(h) {
    let m = h.match(/^ecrits-reflexes-fiche-([a-z]+)$/); if (m) return fiche(m[1]);
    m = h.match(/^ecrits-reflexes-revue(?:-([a-z]+))?$/); if (m) return revue(m[1] && NOMS[m[1]] ? m[1] : null);
    return accueil();
  }
  window.ECRITS_REFLEXES = { route, carte, CARTES, NOMS };
})();
