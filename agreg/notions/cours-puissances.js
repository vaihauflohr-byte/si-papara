(function(){
const N=NOTIONS.find(n=>n.id=='puiss');
const lg=(c,t)=>`<span class="lg" style="background:${c}"></span>${t}`;
const PI2=2*Math.PI,S3=Math.sqrt(3);
const arrow=(x1,y1,x2,y2,c,t,dx,dy)=>{const a=Math.atan2(y2-y1,x2-x1),h=9;return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.6"/><path d="M${x2} ${y2}L${x2-h*Math.cos(a-.4)} ${y2-h*Math.sin(a-.4)}L${x2-h*Math.cos(a+.4)} ${y2-h*Math.sin(a+.4)}Z" fill="${c}"/><text x="${x2+(dx||8)}" y="${y2+(dy||4)}" font-size="14" fill="${c}">${t}</text>`;};
function triangle(P,Q,lab){const k=24,W=440,H=330,x0=40,y0=H-40,x1=x0+P*k,y1=y0-Q*k;return `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="triangle des puissances"><path d="M${x0} ${y0}H${x1}V${y1}Z" fill="#eef5f8" stroke="#12566f" stroke-width="2"/><text x="${(x0+x1)/2}" y="${y0+22}" font-size="14" text-anchor="middle">P = ${fmt(P)} kW</text><text x="${x1+8}" y="${(y0+y1)/2+4}" font-size="14" fill="${C2}">Q = ${fmt(Q)} kvar</text><text x="${(x0+x1)/2-30}" y="${(y0+y1)/2-10}" font-size="14">S = ${fmt(Math.hypot(P,Q))} kVA</text>${lab||''}</svg>`;}
N.cours=[
{t:'Le verre de soda',p:[
 `Tu commandes un soda. Dans le verre, il y a du <b>liquide</b>, que tu bois, et de la <b>mousse</b>, qui prend de la place mais que tu ne bois pas.`,
 `En alternatif, c’est pareil. La <b>puissance active P</b> (en watts) est le liquide : elle fait tourner le moteur, elle chauffe, elle se paie. La <b>puissance réactive Q</b> (en var) est la mousse : elle va et vient entre le réseau et les bobines, sans rien produire. La <b>puissance apparente S</b> (en VA) est le verre entier : c’est elle qui fixe le courant dans les câbles.`],
 fig:()=>`<svg viewBox="0 0 580 240" width="580" role="img" aria-label="verre de soda"><path d="M60 30L80 215H180L200 30Z" fill="#fff" stroke="#183047" stroke-width="2"/><path d="M68.5 110L80 215H180L191.5 110Z" fill="#12566f"/><path d="M61 40L68.5 110H191.5L199 40Z" fill="#f3d9bd"/><text x="130" y="170" font-size="15" text-anchor="middle" fill="#fff">P : le liquide</text><text x="130" y="80" font-size="15" text-anchor="middle" fill="#7a4a12">Q : la mousse</text><text x="130" y="234" font-size="14" text-anchor="middle">S : le verre entier</text><path d="M290 200H470V95Z" fill="#eef5f8" stroke="#12566f" stroke-width="2"/><text x="380" y="220" font-size="14" text-anchor="middle">P (W)</text><text x="478" y="152" font-size="14" fill="${C2}">Q (var)</text><text x="360" y="135" font-size="14">S (VA)</text><text x="322" y="194" font-size="14">φ</text></svg>`,
 keep:[`${V('S')}² = ${V('P')}² + ${V('Q')}² : les trois forment un triangle rectangle.`,`cos φ = ${fr('P','S')} : la part de liquide dans le verre.`],go:[0,2]},
{t:'Pourquoi de la mousse ? Le courant en retard',p:[
 `Dans une résistance, le courant suit la tension : ils montent et descendent ensemble. Dans une bobine, le courant est <b>en retard</b>. Ce décalage s’appelle le <b>déphasage φ</b>.`,
 `La puissance à chaque instant est le produit ${V('u × i')}. Quand la tension et le courant sont de signes opposés, la puissance est négative : le récepteur rend de l’énergie au réseau. Plus φ est grand, plus il en rend, et moins il en garde. Bouge le curseur.`],
 sim:{s:[{l:'Déphasage φ',min:-80,max:80,step:5,v:40,u:'°'}],
  draw:f=>plot({x0:0,x1:2,dx:.125,xmaj:4,y0:-1.25,y1:1.25,dy:.25,ymaj:2,curves:[{pts:Array.from({length:301},(_,i)=>[i/150,Math.sin(PI2*i/150)])},{pts:Array.from({length:301},(_,i)=>[i/150,Math.sin(PI2*i/150-rad(f))]),c:C2},{pts:Array.from({length:301},(_,i)=>[i/150,Math.sin(PI2*i/150)*Math.sin(PI2*i/150-rad(f))]),c:'#2f9e6e',w:1.6}],hl:[{y:Math.cos(rad(f))/2,t:'puissance moyenne',c:'#2f9e6e'}],xl:'Temps (périodes)',yl:'Valeurs réduites',alt:'tension, courant, puissance'})+`<small>${lg('#12566f','tension')}${lg(C2,'courant')}${lg('#2f9e6e','puissance instantanée')}</small>`,
  out:f=>`cos φ = <b>${fmt(Math.cos(rad(f)),2)}</b> : le récepteur garde ${fmt(100*Math.cos(rad(f)),2)} % de ce qui circule. ${f>0?'Courant en retard : récepteur inductif, il consomme de la puissance réactive.':f<0?'Courant en avance : récepteur capacitif, il fournit de la puissance réactive.':'Courant en phase : récepteur résistif, aucune puissance réactive.'}`},
 keep:[`Monophasé : ${V('P = U · I · cos φ')}, ${V('Q = U · I · sin φ')}, ${V('S = U · I')}.`,`Bobine : courant en retard, ${V('Q')} positif. Condensateur : courant en avance, ${V('Q')} négatif.`],go:[0,0]},
{t:'Le triangle des puissances',p:[
 `Un atelier a besoin de 10 kW pour travailler. Selon son facteur de puissance, le réseau doit lui apporter plus ou moins de puissance apparente, donc plus ou moins de courant.`],
 sim:{s:[{l:'Facteur de puissance cos φ',min:.5,max:1,step:.01,v:.8}],
  draw:c=>triangle(10,10*Math.tan(Math.acos(c))),
  out:c=>`Pour les mêmes 10 kW : ${V('S')} = <b>${fmt(10/c)} kVA</b>, ${V('Q')} = <b>${fmt(10*Math.tan(Math.acos(c)))} kvar</b>, courant en ligne sous 400 V triphasé : <b>${fmt(1e4/(S3*400*c))} A</b>${c<.99?`, soit ${fmt(100*(1/c-1),2)} % de plus qu’avec cos φ = 1`:''}.`},
 keep:[`${V('S')} = ${fr('P','cos φ')} et ${V('Q = P · tan φ')}.`,`Un mauvais cos φ ne change pas la puissance utile, il augmente le courant, donc les pertes et la section des câbles.`],go:[2,0]},
{t:'Trois composants, trois caractères',p:[
 `<b>La résistance</b> freine le courant et chauffe. Tension et courant sont en phase.`,
 `<b>La bobine</b> déteste que le courant change, comme un volant d’inertie déteste changer de vitesse. Sa tension est en avance d’un quart de tour sur le courant. Plus la fréquence est haute, plus elle s’oppose : ${V('X<sub>L</sub> = Lω')}.`,
 `<b>Le condensateur</b> est un petit réservoir qui se remplit et se vide. Sa tension est en retard d’un quart de tour. Plus la fréquence est haute, plus il laisse passer : ${V('X<sub>C</sub>')} = ${fr('1','Cω')}.`],
 fig:()=>`<svg viewBox="0 0 560 250" width="560" role="img" aria-label="diagramme de Fresnel">${arrow(60,125,250,125,'#587083','courant I',-70,24)}${arrow(60,125,200,125,'#12566f','tension de R',-64,-10)}${arrow(330,205,330,45,C2,'tension de L (avance de 90°)',10,6)}${arrow(330,125,330,205,'#2f9e6e','',0,0)}<text x="340" y="212" font-size="14" fill="#2f9e6e">tension de C (retard de 90°)</text>${arrow(330,125,500,125,'#587083','courant I',-70,24)}<text x="60" y="30" font-size="14">Résistance</text><text x="330" y="24" font-size="14">Bobine et condensateur</text></svg>`,
 keep:[`Impédances : ${V('R')} pour la résistance, ${V('jLω')} pour la bobine, ${fr('1','jCω')} pour le condensateur.`,`Le ${V('j')} signifie « un quart de tour ». L’oublier est l’erreur que les jurys citent.`,`En continu (fréquence nulle), une bobine est un fil et un condensateur est un circuit ouvert.`],go:[1,0]},
{t:'Un nombre complexe, c’est une flèche',p:[
 `Un nombre complexe n’a rien de compliqué : c’est une flèche. On peut la décrire de deux façons.`,
 `<b>Par ses deux côtés</b> : ${V('<u>Z</u> = R + jX')}. On avance de ${V('R')} vers la droite, puis on monte de ${V('X')}.`,
 `<b>Par sa longueur et son angle</b> : la longueur ${V('|Z|')} = √(${V('R² + X²')}) est ce que mesure un ohmmètre en alternatif, l’angle φ = arctan ${fr('X','R')} est le déphasage.`],
 fig:()=>`<svg viewBox="0 0 460 280" width="460" role="img" aria-label="impédance dans le plan complexe"><line x1="50" y1="230" x2="430" y2="230" stroke="#9fb3c2"/><line x1="50" y1="230" x2="50" y2="20" stroke="#9fb3c2"/><text x="425" y="250" font-size="13" text-anchor="end">partie réelle</text><text x="56" y="28" font-size="13">partie imaginaire</text>${arrow(50,230,350,230,'#12566f','',0,0)}<text x="200" y="250" font-size="14" fill="#12566f" text-anchor="middle">R = 40 Ω</text>${arrow(350,230,350,70,C2,'',0,0)}<text x="360" y="155" font-size="14" fill="${C2}">X = 30 Ω</text>${arrow(50,230,350,70,'#183047','',0,0)}<text x="150" y="130" font-size="14">|Z| = 50 Ω</text><path d="M120 230A70 70 0 0 0 112 197" fill="none" stroke="#183047"/><text x="128" y="216" font-size="14">φ = 36,9°</text></svg>`,
 more:[`<b>En série</b>, on additionne les impédances. <b>En parallèle</b>, on additionne les admittances ${V('<u>Y</u>')} = ${fr('1','<u>Z</u>')}, puis on inverse à la fin : c’est le moyen le plus sûr dès qu’il y a plus de deux branches.`],
 keep:[`Pour additionner : forme ${V('R + jX')}. Pour multiplier ou diviser : longueur et angle.`,`Loi d’Ohm : ${V('<u>U</u> = <u>Z</u> · <u>I</u>')}. Puissance : ${V('<u>S</u> = <u>U</u> · <u>I</u>*')}.`],go:[3,3]},
{t:'La résonance : pousser la balançoire au bon rythme',p:[
 `Une bobine et un condensateur en série tirent en sens opposés : l’une avance la tension d’un quart de tour, l’autre la retarde. À une fréquence précise, leurs effets s’annulent exactement : c’est la <b>résonance</b>.`,
 `À la résonance, il ne reste que la résistance : le courant est maximal et la puissance aussi. C’est comme pousser une balançoire pile au bon rythme. Déplace la fréquence.`],
 sim:{s:[{l:'Fréquence rapportée à la résonance',min:.5,max:2,step:.01,v:1.2}],
  draw:x=>{const Qf=7.35,I=u=>1/Math.sqrt(1+Qf*Qf*(u-1/u)**2);return plot({x0:.5,x1:2,dx:.05,xmaj:2,y0:0,y1:1.1,dy:.1,ymaj:2,curves:[{pts:Array.from({length:301},(_,i)=>{const u=.5+i/200;return [u,I(u)];})},{pts:[[x,0],[x,I(x)]],c:C2,w:2.4}],xl:'f / f₀',yl:'Courant / courant maximal',alt:'courbe de résonance'});},
  out:x=>{const Qf=7.35,d=Qf*(x-1/x),c=1/Math.sqrt(1+d*d);return `Courant : <b>${fmt(100*c,2)} %</b> du maximum · cos φ = <b>${fmt(c,2)}</b> · puissance : ${fmt(100*c*c,2)} % du maximum. ${Math.abs(x-1)<.011?'Résonance : circuit purement résistif.':x>1?'Au-dessus de la résonance : la bobine l’emporte, circuit <b>inductif</b>.':'En dessous de la résonance : le condensateur l’emporte, circuit <b>capacitif</b>.'}`;}},
 more:[`C’est exactement le montage de la forge à induction de l’interne 2026 : on règle la puissance de chauffe en déplaçant la fréquence de l’onduleur autour de 20 kHz.`],
 keep:[`ω<sub>0</sub> = ${fr('1','√(LC)')}.`,`À la résonance : ${V('I')} = ${fr('V','R')}, ${V('P')} = ${fr('V²','R')}, et les tensions aux bornes de L et de C peuvent dépasser de loin la tension d’alimentation.`],go:[3,0]},
{t:'Le triphasé : trois fois la même chose, décalée',p:[
 `Le réseau fournit trois tensions identiques, décalées d’un tiers de période. Entre une phase et le neutre : la <b>tension simple V</b> (230 V). Entre deux phases : la <b>tension composée U</b> (400 V), qui vaut √3 fois V.`,
 `Si les trois phases sont chargées pareil, on raisonne sur une seule, puis on multiplie par trois.`],
 fig:()=>plot({x0:0,x1:2,dx:.125,xmaj:4,y0:-400,y1:400,dy:50,ymaj:2,curves:[0,1,2].map(k=>({pts:Array.from({length:301},(_,i)=>[i/150,325*Math.sin(PI2*i/150-k*PI2/3)]),c:['#12566f',C2,'#2f9e6e'][k]})),xl:'Temps (périodes)',yl:'Tensions simples (V)',alt:'trois tensions triphasées'})+`<small>${lg('#12566f','phase 1')}${lg(C2,'phase 2')}${lg('#2f9e6e','phase 3')}</small>`,
 keep:[`${V('U')} = √3 · ${V('V')}.`,`${V('P')} = √3 · ${V('U · I · cos φ')}, ${V('Q')} = √3 · ${V('U · I · sin φ')}, ${V('S')} = √3 · ${V('U · I')}, quel que soit le couplage.`,`Étoile : chaque élément voit ${V('V')}. Triangle : chaque élément voit ${V('U')}.`],go:[1,3]},
{t:'Compenser : produire la mousse sur place',p:[
 `La mousse ne sert à rien, mais les moteurs en ont besoin pour créer leur champ magnétique. Plutôt que de la faire venir du réseau par les câbles, on la produit sur place avec des <b>condensateurs</b>.`,
 `L’atelier absorbe 10 kW et 7,5 kvar. Ajoute des condensateurs et regarde le triangle.`],
 sim:{s:[{l:'Puissance des condensateurs',min:0,max:10,step:.5,v:0,u:'kvar'}],
  draw:q=>triangle(10,Math.abs(7.5-q)),
  out:q=>{const Q=7.5-q,S=Math.hypot(10,Q),I=S*1e3/(S3*400),I0=12.5e3/(S3*400);return `Le réseau ne fournit plus que <b>${fmt(Math.abs(Q))} kvar</b>${Q<0?' en sens inverse : l’installation est surcompensée':''}. cos φ = <b>${fmt(10/S,3)}</b>, courant en ligne <b>${fmt(I)} A</b> au lieu de ${fmt(I0)} A, pertes dans les câbles ${Q<0&&I>I0?'augmentées':'réduites de '+fmt(100*(1-(I/I0)**2),2)+' %'}.`;}},
 keep:[`${V('Q<sub>C</sub> = P (tan φ − tan φ′)')}.`,`Boucherot : on additionne les ${V('P')} entre eux et les ${V('Q')} entre eux, jamais les ${V('S')}.`,`Trop de condensateurs : l’installation devient capacitive et le courant remonte.`],go:[2,1]},
{t:'La méthode en quatre gestes',p:[
 `<b>1.</b> Dessiner le schéma d’une phase, avec la tension simple.`,
 `<b>2.</b> Calculer chaque réactance (${V('Lω')} et ${fr('1','Cω')}) séparément, en ohms, avant de les combiner.`,
 `<b>3.</b> Passer par la flèche : module pour le courant, angle pour le cos φ. Tracer le diagramme de Fresnel dès qu’on hésite sur un signe.`,
 `<b>4.</b> Faire le bilan ${V('P')}, ${V('Q')}, ${V('S')} et vérifier que ${V('S')}² = ${V('P')}² + ${V('Q')}².`],
 keep:[`Le jury de l’interne 2026 constate que plus de la moitié des candidats bute sur ces calculs et les range parmi les fondamentaux incontournables.`]}
];
})();
