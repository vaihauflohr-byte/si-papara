(function(){
const N=NOTIONS.find(n=>n.id=='asserv');
const lg=(c,t)=>`<span class="lg" style="background:${c}"></span>${t}`;
const TA=[1,.25,.05];
/* boucle fermée : correcteur Kp (+ intégrale 1/Ti) devant trois premiers ordres en cascade */
function loop(Kp,Ti,T){const dt=.002,x=[0,0,0],pts=[];let I=0;for(let t=0;t<=T;t+=dt){const e=1-x[2];if(Ti)I+=e*dt/Ti;const u=Kp*(e+I);x[0]+=dt*(u-x[0])/TA[0];x[1]+=dt*(x[0]-x[1])/TA[1];x[2]+=dt*(x[1]-x[2])/TA[2];if(Math.round(t/dt)%10==0)pts.push([t,Math.max(-1,Math.min(3,x[2]))]);}return pts;}
function ord2(xi,w0,T){const dt=.002,pts=[];let y=0,v=0;for(let t=0;t<=T;t+=dt){v+=dt*(w0*w0*(1-y)-2*xi*w0*v);y+=dt*v;if(Math.round(t/dt)%10==0)pts.push([t,y]);}return pts;}
N.cours=[
{t:'Une boucle, c’est comme régler sa douche',p:[
 `Tu veux de l’eau à 38 °C : c’est la <b>consigne</b>. Ta main sent la température : c’est le <b>capteur</b>. Ta tête compare les deux : c’est l’<b>écart</b>. Ta main tourne le robinet : c’est le <b>correcteur</b>.`,
 `Tant que l’eau n’est pas à la bonne température, tu continues à corriger. Un asservissement fait exactement la même chose, sans jamais se lasser.`],
 fig:()=>bd({in:'consigne',c:'Correcteur',mid:'commande',g:'Système',out:'sortie',fb:'Capteur'}),
 keep:[`Écart = consigne − mesure.`,`Le schéma se lit de gauche à droite, puis revient par le capteur : c’est ce retour qui fait la boucle.`],go:[0,1]},
{t:'Avec ou sans retour',p:[
 `<b>Sans retour</b> (boucle ouverte) : tu règles le robinet une fois et tu ne touches plus. Si quelqu’un tire la chasse d’eau, l’eau devient froide et le reste.`,
 `<b>Avec retour</b> (boucle fermée) : tu sens que l’eau refroidit et tu corriges. La perturbation est rattrapée.`],
 fig:()=>plot({x0:0,x1:10,dx:1,xmaj:1,y0:0,y1:1.2,dy:.1,ymaj:2,curves:[{pts:Array.from({length:201},(_,i)=>{const t=i/20;return [t,t<5?1-Math.exp(-t/.6):1-.3*(1-Math.exp(-(t-5)/.5))];}),c:C2},{pts:Array.from({length:201},(_,i)=>{const t=i/20,x=(t-5)/.35;return [t,t<5?1-Math.exp(-t/.6):1-.16*x*Math.exp(1-x)];})}],xl:'Temps (s)',yl:'Sortie',alt:'boucle ouverte et boucle fermée'})+`<small>${lg(C2,'sans retour')}${lg('#12566f','avec retour')} · perturbation à 5 s</small>`,
 keep:[`Une boucle fermée sert à deux choses : suivre la consigne et effacer les perturbations.`]},
{t:'Le premier ordre : la tasse qui refroidit',p:[
 `Beaucoup de systèmes réagissent comme une tasse de café qui refroidit : vite au début, puis de plus en plus lentement.`,
 `Deux nombres suffisent à les décrire. Le <b>gain K</b> dit jusqu’où la sortie va. La <b>constante de temps τ</b> dit en combien de temps. Bouge les curseurs.`],
 sim:{s:[{l:'Gain K',min:.5,max:3,step:.1,v:1.5},{l:'Constante de temps τ',min:.2,max:2,step:.1,v:1,u:'s'}],
  draw:(K,tau)=>plot({x0:0,x1:8,dx:.5,xmaj:2,y0:0,y1:3.2,dy:.2,ymaj:2,curves:[{pts:step1(K,tau,8)},{pts:[[tau,0],[tau,.63*K]],c:C2,dash:1,w:1.6},{pts:[[3*tau,0],[3*tau,.95*K]],c:C2,dash:1,w:1.6}],hl:[{y:K,t:'valeur finale',c:'#587083'}],xl:'Temps (s)',yl:'Sortie (échelon de 1)',alt:'réponse du premier ordre'}),
  out:(K,tau)=>`Valeur finale : <b>${fmt(K)}</b> · à ${V('t')} = τ = ${fmt(tau)} s la sortie a fait <b>63 %</b> du chemin · à 3τ = <b>${fmt(3*tau)} s</b> elle en a fait 95 % : c’est le temps de réponse à 5 %.`},
 keep:[`Fonction de transfert : ${fr('K','1 + τp')}.`,`63 % à τ, 95 % à 3τ.`],go:[1,1]},
{t:'Le second ordre : la balançoire',p:[
 `Certains systèmes dépassent le but puis reviennent, comme une balançoire qu’on lâche. Ce qui change tout, c’est le <b>coefficient d’amortissement ξ</b> : le frein.`,
 `Peu de frein : ça oscille longtemps. Beaucoup de frein : ça n’oscille plus, mais c’est lent.`],
 sim:{s:[{l:'Amortissement ξ',min:.1,max:1.5,step:.05,v:.3}],
  draw:xi=>plot({x0:0,x1:6,dx:.5,xmaj:2,y0:0,y1:1.8,dy:.1,ymaj:2,curves:[{pts:ord2(xi,4,6)}],hl:[{y:1,t:'consigne',c:'#587083'}],xl:'Temps (s)',yl:'Sortie',alt:'réponse du second ordre'}),
  out:xi=>xi<1?`Premier dépassement : <b>${fmt(100*Math.exp(-Math.PI*xi/Math.sqrt(1-xi*xi)),2)} %</b>. ${xi<.4?'Très oscillant.':xi<.75?'Un dépassement, puis ça se calme : c’est souvent le bon réglage (ξ proche de 0,7).':'Presque plus de dépassement.'}`:`Aucun dépassement : la réponse est amortie, mais plus lente.`},
 keep:[`Le dépassement ne dépend que de ξ.`,`ξ ≈ 0,7 : le meilleur compromis entre rapidité et dépassement (environ 5 %).`],go:[1,2]},
{t:'Le gain du correcteur : pousser plus ou moins fort',p:[
 `Le correcteur le plus simple multiplie l’écart par un nombre ${V('K<sub>p</sub>')}. Plus ${V('K<sub>p</sub>')} est grand, plus il pousse fort.`,
 `Pousser fort rend le système rapide et précis… jusqu’à ce qu’il se mette à osciller. Monte le curseur et regarde.`],
 sim:{s:[{l:'Gain Kp',min:.5,max:40,step:.5,v:4}],
  draw:Kp=>plot({x0:0,x1:6,dx:.5,xmaj:2,y0:0,y1:2,dy:.1,ymaj:2,curves:[{pts:loop(Kp,0,6)}],hl:[{y:1,t:'consigne',c:'#587083'}],xl:'Temps (s)',yl:'Sortie',alt:'effet du gain'}),
  out:Kp=>Kp>31.5?`<b>Instable</b> : les oscillations grandissent au lieu de s’éteindre. Le gain limite de ce système est 31,5.`:`Écart statique : <b>${fmt(100/(1+Kp),2)} %</b> de la consigne. ${Kp<3?'Lent et imprécis.':Kp<12?'Plus rapide, plus précis, quelques oscillations.':'Précis, mais de plus en plus oscillant : on approche du gain limite (31,5).'}`},
 keep:[`Augmenter le gain : plus rapide, plus précis, moins stable.`,`Au-delà du gain limite, la boucle est instable.`],go:[1,3]},
{t:'L’intégrale : celui qui n’abandonne jamais',p:[
 `Un correcteur proportionnel pousse en proportion de l’écart. Quand l’écart devient petit, il pousse peu… et s’arrête avant le but. Il reste un <b>écart statique</b>.`,
 `Un correcteur intégral additionne l’écart au fil du temps. Tant qu’il reste un écart, même minuscule, sa commande continue de grandir. Il ne s’arrête que lorsque l’écart est nul.`],
 fig:()=>plot({x0:0,x1:10,dx:1,xmaj:1,y0:0,y1:1.4,dy:.1,ymaj:2,curves:[{pts:loop(4,0,10),c:C2},{pts:loop(2,1.2,10)}],hl:[{y:1,t:'consigne',c:'#587083'}],xl:'Temps (s)',yl:'Sortie',alt:'P et PI'})+`<small>${lg(C2,'proportionnel seul : il reste 20 % d’écart')}${lg('#12566f','proportionnel et intégral : écart nul')}</small>`,
 keep:[`Sans intégration dans la boucle (classe 0) : écart = ${fr('consigne','1 + K')}.`,`Avec une intégration (classe 1) : écart nul pour un échelon.`,`Le prix à payer : l’intégrale retarde le signal, donc réduit la stabilité.`],go:[3,2]},
{t:'Le diagramme de Bode : secouer lentement, puis vite',p:[
 `Pour connaître un système, on lui envoie un sinus, d’abord lent, puis de plus en plus rapide, et on regarde comment la sortie suit.`,
 `<b>Lentement</b>, la sortie suit sans peine : le gain vaut 20 log ${V('K')}. <b>Trop vite</b>, le système n’a plus le temps : la sortie s’écrase (−20 dB chaque fois que la fréquence est multipliée par 10) et prend du retard (la phase descend).`,
 `La frontière entre les deux est la <b>cassure</b>, à ω = ${fr('1','τ')}. Les traits en pointillés sont le tracé asymptotique : c’est lui qu’on demande de dessiner à la main.`],
 fig:()=>{const b=bodePts(10,[.1],0,.1,1000);return plot({W:660,H:260,logx:1,x0:.1,x1:1000,y0:-30,y1:30,dy:5,ymaj:2,curves:[{pts:b.g},{pts:[[.1,20],[10,20],[1000,-20]],c:C2,dash:1,w:1.8}],yl:'Gain (dB)',alt:'Bode gain'})+plot({W:660,H:230,logx:1,x0:.1,x1:1000,y0:-90,y1:0,dy:15,ymaj:3,curves:[{pts:b.p},{pts:[[.1,0],[1,0],[100,-90],[1000,-90]],c:C2,dash:1,w:1.8}],xl:'Pulsation ω (rad/s)',yl:'Phase (°)',alt:'Bode phase'})+`<small>Premier ordre ${V('K')} = 10, τ = 0,1 s · ${lg('#12566f','courbe réelle')}${lg(C2,'tracé asymptotique')}</small>`;},
 keep:[`Palier à 20 log ${V('K')}, cassure à ${fr('1','τ')}, puis −20 dB par décade.`,`À la cassure : −3 dB et −45°.`,`Un intégrateur ${fr('1','p')} : −20 dB par décade partout et −90° partout.`],go:[2,2]},
{t:'Les marges : à quelle distance du précipice ?',p:[
 `Une boucle devient instable quand, à une certaine fréquence, le signal revient avec un demi-tour de retard (−180°) sans avoir été affaibli (0 dB). Il se renforce alors lui-même à chaque tour, comme un micro trop près d’une enceinte.`,
 `Les <b>marges</b> mesurent à quelle distance on est de cette situation. Augmente le gain : la courbe de gain monte, la phase ne bouge pas, et les marges fondent.`],
 sim:{s:[{l:'Gain K',min:1,max:60,step:1,v:6}],
  draw:K=>bodeFig(K,TA,0,.1,100,[-60,40],[-270,0]),
  out:K=>{const mag=w=>K/TA.reduce((p,t)=>p*Math.sqrt(1+(w*t)**2),1),w180=solve(w=>TA.reduce((s,t)=>s+Math.atan(w*t),0)-Math.PI,.01,1e4),MG=-20*Math.log10(mag(w180)),wc=solve(w=>1-mag(w),.001,1e4),Mp=180-deg(TA.reduce((s,t)=>s+Math.atan(wc*t),0));return `Le gain coupe 0 dB à ${fmt(wc,2)} rad/s, où la phase vaut ${fmt(Mp-180,3)}° : <b>marge de phase ${fmt(Mp,2)}°</b>. La phase coupe −180° à ${fmt(w180,2)} rad/s, où le gain vaut ${fmt(-MG,2)} dB : <b>marge de gain ${fmt(MG,2)} dB</b>. ${MG<0?'<b>Instable.</b>':Mp<45?'Stable, mais trop près du bord.':'Stable, avec de la réserve.'}`;}},
 keep:[`Marge de phase : là où le gain coupe 0 dB, distance de la phase à −180°.`,`Marge de gain : là où la phase coupe −180°, distance du gain à 0 dB.`,`On vise en général au moins 45° et 10 dB.`,`Marges négatives : boucle instable.`],go:[3,1]},
{t:'Trois correcteurs à reconnaître',p:[
 `Le jury demande souvent d’associer une réponse à un correcteur. Trois allures suffisent.`],
 fig:()=>plot({x0:0,x1:10,dx:1,xmaj:1,y0:0,y1:1.8,dy:.1,ymaj:2,curves:[{pts:loop(26,0,10),c:'#c9483b',w:1.8},{pts:loop(4,0,10),c:C2},{pts:loop(2,1.2,10)}],hl:[{y:1,t:'consigne',c:'#587083'}],xl:'Temps (s)',yl:'Sortie',alt:'trois correcteurs'})+`<small>${lg('#c9483b','gain trop fort : oscillations qui durent')}${lg(C2,'gain modéré : stable, mais il reste un écart')}${lg('#12566f','avec intégrale : stable et écart nul')}</small>`,
 more:[`<b>Avance de phase</b> : un quatrième correcteur, qui ajoute de la phase autour de la coupure pour regagner de la marge. On l’utilise quand le système contient déjà deux intégrations.`],
 keep:[`Oscillations entretenues : gain au niveau du gain limite.`,`Stable avec écart : proportionnel.`,`Stable sans écart : présence d’une intégrale.`],go:[3,8]},
{t:'La méthode en cinq gestes',p:[
 `Face à une question d’asservissement, toujours dans cet ordre :`,
 `<b>1.</b> Écrire la fonction de transfert en boucle ouverte : le produit de tous les blocs de la boucle.`,
 `<b>2.</b> Repérer sa classe : combien de ${fr('1','p')} ? Elle donne la précision sans calcul.`,
 `<b>3.</b> Stabilité : marges sur le Bode de la boucle ouverte, avec leur signe.`,
 `<b>4.</b> Rapidité : pulsation de coupure à 0 dB, ou constante de temps de la boucle fermée.`,
 `<b>5.</b> Conclure par rapport au cahier des charges, avec les valeurs et les unités.`],
 keep:[`Les jurys 2024, 2025 et 2026 jugent ces points « de base » et constatent qu’ils sont très peu réussis : ce sont des points à prendre.`]}
];
})();
