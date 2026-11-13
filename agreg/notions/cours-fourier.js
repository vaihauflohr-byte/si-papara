(function(){
const N=NOTIONS.find(n=>n.id=='fourier');
const lg=(c,t)=>`<span class="lg" style="background:${c}"></span>${t}`;
const PI=Math.PI,PI2=2*PI;
const sq=x=>(x%1<.5?1:-1);
N.cours=[
{t:'Un signal compliqué, c’est une somme de sinus simples',p:[
 `Un accord de guitare est fait de plusieurs notes jouées ensemble. De la même façon, n’importe quel signal qui se répète peut se fabriquer en additionnant des sinus.`,
 `Le premier sinus a la même fréquence que le signal : c’est le <b>fondamental</b>. Les suivants vont 2, 3, 4… fois plus vite : ce sont les <b>harmoniques</b>. Ajoute-les un par un et regarde le créneau apparaître.`],
 sim:{s:[{l:'Nombre de sinus additionnés',min:1,max:15,step:1,v:1}],
  draw:n=>plot({x0:0,x1:2,dx:.125,xmaj:4,y0:-1.5,y1:1.5,dy:.25,ymaj:2,curves:[{pts:Array.from({length:801},(_,i)=>[i/400,sq(i/400)]),c:'#b9c7d2',w:1.6},{pts:Array.from({length:801},(_,i)=>{let s=0;for(let k=0;k<n;k++){const r=2*k+1;s+=4/(r*PI)*Math.sin(PI2*r*i/400);}return [i/400,s];})}],xl:'Temps (périodes)',yl:'Tension (créneau de ±1)',alt:'synthèse d’un créneau'}),
  out:n=>`Rangs additionnés : <b>${Array.from({length:n},(_,k)=>2*k+1).join(', ')}</b>. Le créneau ne contient que des rangs impairs, d’amplitude ${fr('4','nπ')} : le rang 3 est trois fois plus petit que le fondamental, le rang 5 cinq fois.`},
 keep:[`Signal périodique = valeur moyenne + fondamental + harmoniques.`,`Harmonique de rang ${V('n')} : fréquence ${V('n · f')}.`],go:[0,2]},
{t:'Le spectre : la liste des ingrédients',p:[
 `Le spectre est la recette du signal : pour chaque rang, une barre dont la hauteur donne l’amplitude du sinus correspondant.`,
 `Lire un spectre, c’est lire une liste d’ingrédients. Le rang 0 est la valeur moyenne, le rang 1 le fondamental.`],
 fig:()=>bars({items:Array.from({length:10},(_,n)=>({x:String(n),y:n%2?4/(n*PI):0})),y1:1.4,dy:.1,ymaj:2,xl:'Rang',yl:'Amplitude (créneau de ±1)'}),
 keep:[`Créneau symétrique : rangs impairs seulement, pas de valeur moyenne.`,`Dans les sujets, on remonte souvent à une grandeur (tension de bus, courant) à partir de la barre du rang 1.`],go:[3,0]},
{t:'La valeur moyenne : étaler le signal',p:[
 `Imagine le signal comme un tas de sable. La valeur moyenne est la hauteur qu’on obtient en l’étalant bien à plat sur toute la période.`,
 `Pour un signal rectangulaire, c’est immédiat : la hauteur multipliée par la part du temps passée à l’état haut, le <b>rapport cyclique α</b>.`],
 sim:{s:[{l:'Rapport cyclique α',min:5,max:95,step:5,v:30,u:'%'}],
  draw:a=>plot({x0:0,x1:3,dx:.25,xmaj:4,y0:0,y1:15,dy:1,ymaj:3,curves:[{pts:Array.from({length:1201},(_,i)=>[i/400,(i/400)%1<a/100?12:0])}],hl:[{y:12*a/100,t:'valeur moyenne',c:C2},{y:12*Math.sqrt(a/100),t:'valeur efficace',c:'#2f9e6e'}],xl:'Temps (périodes)',yl:'Tension (V)',alt:'tension rectangulaire'}),
  out:a=>`Valeur moyenne : α${V('E')} = <b>${fmt(12*a/100)} V</b> · valeur efficace : ${V('E')}√α = <b>${fmt(12*Math.sqrt(a/100))} V</b>. La valeur efficace est toujours au-dessus de la moyenne.`},
 keep:[`Valeur moyenne = aire sous la courbe sur une période, divisée par la période.`,`C’est ce qu’indique un voltmètre en position continu.`],go:[0,1]},
{t:'La valeur efficace : ce qui chauffe',p:[
 `Branche un radiateur sur une tension qui varie. La <b>valeur efficace</b> est la tension continue qui le ferait chauffer exactement pareil.`,
 `On la calcule en trois étapes : on met le signal au carré, on prend la moyenne, puis la racine. Pour un sinus, cela donne l’amplitude divisée par √2 : le 230 V du réseau monte en réalité jusqu’à 325 V.`],
 fig:()=>plot({x0:0,x1:40,dx:2.5,xmaj:4,y0:-400,y1:400,dy:50,ymaj:2,curves:[{pts:Array.from({length:401},(_,i)=>[i/10,325*Math.sin(PI2*i/200)])}],hl:[{y:230,t:'230 V efficaces',c:'#2f9e6e'},{y:325,t:'325 V : amplitude',c:'#587083'}],xl:'Temps (ms)',yl:'Tension du réseau (V)',alt:'tension du réseau'}),
 keep:[`Sinus : ${fr('amplitude','√2')}. Rectangulaire entre 0 et ${V('E')} : ${V('E')}√α. Triangle : ${fr('amplitude','√3')}.`,`Quand un signal a plusieurs composantes, les carrés des valeurs efficaces s’ajoutent : ${V('I')} = √(${V('I<sub>0</sub>² + I<sub>1</sub>² + I<sub>2</sub>² + …')}).`],go:[1,1]},
{t:'Le THD : mesurer la pureté',p:[
 `Un sinus parfait n’a qu’un fondamental. Dès qu’on ajoute des harmoniques, la forme se déforme. Le <b>taux de distorsion harmonique</b> (THD) compare tout ce qui n’est pas le fondamental au fondamental.`,
 `Ajoute du rang 5 et du rang 7, ceux que produit un variateur de vitesse.`],
 sim:{s:[{l:'Rang 5, en % du fondamental',min:0,max:60,step:5,v:20,u:'%'},{l:'Rang 7, en % du fondamental',min:0,max:40,step:5,v:10,u:'%'}],
  draw:(a,b)=>plot({x0:0,x1:2,dx:.125,xmaj:4,y0:-2,y1:2,dy:.25,ymaj:2,curves:[{pts:Array.from({length:601},(_,i)=>[i/300,Math.sin(PI2*i/300)]),c:'#b9c7d2',w:1.6},{pts:Array.from({length:601},(_,i)=>{const x=PI2*i/300;return [i/300,Math.sin(x)-a/100*Math.sin(5*x)+b/100*Math.sin(7*x)];})}],xl:'Temps (périodes)',yl:'Courant (fondamental = 1)',alt:'courant déformé'}),
  out:(a,b)=>{const t=Math.hypot(a,b)/100;return `THD = ${fr(`√(${a}² + ${b}²)`,100)} = <b>${fmt(100*t,3)} %</b> · valeur efficace totale : ${fmt(100*Math.sqrt(1+t*t),4)} % de celle du fondamental. Les harmoniques s’additionnent au carré, pas directement.`;}},
 keep:[`THD = ${fr('√(I<sub>2</sub>² + I<sub>3</sub>² + …)','I<sub>1</sub>')}.`,`Seul le fondamental du courant transporte de la puissance active quand la tension est sinusoïdale.`],go:[2,2]},
{t:'Le redresseur : toujours la plus haute',p:[
 `Un pont de six diodes (PD3) regarde les tensions entre phases et laisse passer, à chaque instant, <b>la plus grande</b>. La sortie suit donc le sommet des sinusoïdes, en sautant de l’une à l’autre.`,
 `Résultat : une tension presque continue, avec six petites bosses par période du réseau.`],
 fig:()=>{const cs=[];for(let k=0;k<6;k++)cs.push({pts:Array.from({length:361},(_,i)=>[i/180,Math.cos(PI*i/180-k*PI/3)]),c:'#b9c7d2',w:1.3});cs.push({pts:Array.from({length:361},(_,i)=>{let m=-2;for(let k=0;k<6;k++)m=Math.max(m,Math.cos(PI*i/180-k*PI/3));return [i/180,m];}),w:3});return plot({x0:0,x1:2,dx:1/12,xmaj:6,y0:-1.2,y1:1.2,dy:.1,ymaj:2,curves:cs,hl:[{y:3/PI,t:'valeur moyenne : 0,955 × crête',c:C2}],xl:'Temps (périodes du réseau)',yl:'Tension / crête de U',alt:'tension redressée PD3'})+`<small>${lg('#b9c7d2','tensions entre phases')}${lg('#12566f','sortie du pont')}</small>`;},
 keep:[`⟨${V('u')}⟩ = ${fr('3√2 · U','π')} ≈ 1,35 ${V('U')}.`,`L’ondulation est à six fois la fréquence du réseau : 300 Hz en 50 Hz.`,`Côté réseau, chaque phase conduit deux tiers du temps : courant en créneaux, ${V('I<sub>L</sub> = I<sub>bus</sub>')}√(${fr('2','3')}).`],go:[3,3]},
{t:'L’onduleur et le premier harmonique',p:[
 `Un onduleur fabrique de l’alternatif en basculant des interrupteurs : sa tension est un créneau, pas un sinus.`,
 `Mais la charge, elle, a de l’inductance : elle freine les variations rapides. Les harmoniques de courant sont étouffés et le courant ressemble à un sinus. On peut alors faire tous les calculs de puissance avec <b>le seul fondamental</b> de la tension : c’est la méthode du premier harmonique.`],
 fig:()=>plot({x0:0,x1:2,dx:.125,xmaj:4,y0:-1.5,y1:1.5,dy:.25,ymaj:2,curves:[{pts:Array.from({length:801},(_,i)=>[i/400,sq(i/400)])},{pts:Array.from({length:801},(_,i)=>[i/400,4/PI*Math.sin(PI2*i/400)]),c:'#b9c7d2',w:1.6},{pts:Array.from({length:801},(_,i)=>[i/400,.9*Math.sin(PI2*i/400-.66)]),c:C2}],xl:'Temps (périodes)',yl:'Valeurs réduites',alt:'tension et courant d’un onduleur'})+`<small>${lg('#12566f','tension de l’onduleur')}${lg('#b9c7d2','son fondamental')}${lg(C2,'courant dans la charge')}</small>`,
 keep:[`Fondamental d’un créneau ±${V('E')} : amplitude ${fr('4E','π')}, plus grande que ${V('E')}.`,`${V('P')} = ${fr('V<sub>1</sub> · I<sub>1</sub> · cos φ','2')} avec les amplitudes.`,`Toujours justifier la méthode : « le courant est quasi sinusoïdal (THD faible) car la charge filtre les harmoniques ».`],go:[3,1]},
{t:'Filtrer : laisser passer le lent, bloquer le rapide',p:[
 `Un filtre passe-bas est un tamis : il laisse passer ce qui varie lentement (la valeur moyenne) et retient ce qui varie vite (l’ondulation).`,
 `Tout se joue sur la <b>fréquence de coupure</b>. Plus elle est basse par rapport à l’ondulation, plus la sortie est lisse. Avec une bobine et un condensateur, l’ondulation est divisée par 100 quand la coupure est dix fois plus basse.`],
 sim:{s:[{l:'Fréquence de coupure / fréquence de l’ondulation',min:.05,max:.7,step:.05,v:.1}],
  draw:r=>{const g=1/Math.abs(1-1/(r*r));return plot({x0:0,x1:4,dx:.25,xmaj:4,y0:.6,y1:1.4,dy:.05,ymaj:2,curves:[{pts:Array.from({length:401},(_,i)=>[i/100,1+.25*Math.cos(PI2*i/100)]),c:'#b9c7d2',w:1.6},{pts:Array.from({length:401},(_,i)=>[i/100,1-.25*g*Math.cos(PI2*i/100)])}],xl:'Temps (périodes de l’ondulation)',yl:'Tension / valeur moyenne',alt:'effet du filtre'})+`<small>${lg('#b9c7d2','avant le filtre')}${lg('#12566f','après le filtre')}</small>`;},
  out:r=>{const g=1/Math.abs(1-1/(r*r));return `Ondulation multipliée par <b>${fmt(g,2)}</b>, soit <b>${fmt(20*Math.log10(g),3)} dB</b>.${r>.45?' Coupure trop proche de l’ondulation : le filtre ne sert presque à rien.':''}`;}},
 keep:[`Filtre LC : ${V('f<sub>c</sub>')} = ${fr('1','2π√(LC)')}, pente de −40 dB par décade.`,`Derrière un PD3, il faut ${V('f<sub>c</sub>')} très inférieure à 6${V('f')}. Le jury 2026 note que très peu de candidats savent dimensionner ce filtre.`],go:[3,3]},
{t:'La méthode en quatre gestes',p:[
 `<b>1.</b> Dessiner le signal sur une période et repérer ses symétries : symétrique autour de zéro, pas de valeur moyenne ; les deux alternances identiques au signe près, pas de rangs pairs.`,
 `<b>2.</b> Valeur moyenne : une aire divisée par la période. Valeur efficace : la même chose sur le carré, puis la racine.`,
 `<b>3.</b> Pour chaque rang utile : amplitude de la tension, impédance de la charge à cette fréquence, puis courant.`,
 `<b>4.</b> Puissance active : seulement les rangs présents à la fois dans la tension et dans le courant.`],
 keep:[`Les jurys 2023 à 2026 reprochent les séries de Fourier, les valeurs moyenne et efficace et le calcul rigoureux du THD : ce chapitre est l’un des plus rentables.`]}
];
})();
