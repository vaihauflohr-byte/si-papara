/* Notion « Les questions à 5 % » : les questions que presque aucun candidat ne réussit d'après les rapports de jury
   (externe 2022, 2025, 2026 ; interne 2025, 2026), refaites avec des valeurs tirées au hasard.
   Palier BTS : la base qui manque derrière chaque piège. Palier agrégation : la question telle qu'elle tombe. */
(function(){
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const deg=r=>r*180/Math.PI,kB=1.380649e-23,KS=k=>`${Math.round(k*1e4)} × 10⁻⁴`;
const ohm=r=>r>=1e6?`${fmt(r/1e6)} MΩ`:r>=1e3?`${fmt(r/1e3)} kΩ`:`${fmt(r)} Ω`;
/* figures */
const trigF=(R1,R2)=>K.svg(470,196,K.w('M40 92H98M162 92H230M200 92V30H248M312 30H380V110M300 110H440M230 128H210V160')+K.aop(230,110,false)+K.rh(130,92,R1)+K.rh(280,30,R2)+K.gnd(210,160)+K.dot(200,92)+K.dot(380,110)+K.t(34,96,'Ve',{a:'end'})+K.t(446,114,'Vs',{a:'start'}),'ALI : la sortie revient sur l’entrée +');
const ampF=(R1,R2)=>K.svg(430,262,K.w('M70 62H200M270 80H370M310 80V150H272M208 150H170V98H200M170 150V168M170 232V236')+K.aop(200,80,false)+K.rh(240,150,R2)+K.rv(170,200,R1)+K.gnd(170,236)+K.dot(310,80)+K.dot(170,150)+K.t(64,66,'Ve',{a:'end'})+K.t(376,84,'Vs',{a:'start'}),'ALI : la sortie revient sur l’entrée −');
const rcF=(R,C,E)=>K.svg(430,200,K.w('M60 82V40H158M222 40H300V68M300 132V170H60V118')+K.vs(60,100,E)+K.rh(190,40,R)+K.rv(300,100,C)+K.ar(392,150,392,50,'#c9483b','uC',6,4),'circuit RC');
const skF=(R,C1,C2)=>K.svg(510,215,K.w('M50 82H78M142 82H198M262 82H330M165 82V30H258M322 30H420V100M400 100H450M420 100V165H316V118H330M290 82V118M290 182V186')+K.aop(330,100)+K.rh(110,82,R)+K.rh(230,82,R)+K.rh(290,30,C1)+K.rv(290,150,C2,true)+K.gnd(290,186)+K.dot(165,82)+K.dot(290,82)+K.dot(420,100)+K.t(44,86,'Ve',{a:'end'})+K.t(456,104,'Vs',{a:'start'}),'filtre de Sallen-Key');
const J=(t)=>`<p>${t}</p>`;
const LV=[
{id:'bts',name:'BTS',sub:'La base qui manque derrière chaque piège',fiche:[
 `Devant un ALI, regarder d’abord <b>sur quelle entrée revient la sortie</b> : sur l’entrée −, régime linéaire (${V('ε = 0')}) ; sur l’entrée + ou pas du tout, saturation (comparateur).`,
 `Premier ordre : ${V('τ')}·${V('u′')} + ${V('u')} = ${V('E')} a pour solution ${V('u(t)')} = ${V('E')}·(1 − e<sup>−t/τ</sup>) en partant de 0 ; à ${V('t = τ')}, 63 % de la valeur finale.`,
 `L’argument d’un complexe ${V('a + jb')} n’est arctan(${V('b/a')}) que si ${V('a')} &gt; 0 ; si ${V('a')} &lt; 0, il faut ajouter ou retrancher 180° (atan2).`,
 `Décibels : ${V('G')}<sub>dB</sub> = 20·log|${V('H')}| ; ×10 = +20 dB, ×100 = +40 dB, ÷√2 = −3 dB.`,
 `Énergie stockée : ½·${V('C')}·${V('U')}² dans un condensateur, ½·${V('L')}·${V('I')}² dans une bobine, ½·${V('J')}·${V('ω')}² dans un volant.`,
 `Liaison série 8N1 : un bit de start, 8 bits de données, un bit de stop : 10 bits par octet.`]},
{id:'agreg',name:'Agrégation',sub:'Les questions qui départagent, d’après les rapports',fiche:[
 `<b>Pourquoi cette notion.</b> Les rapports publient des taux de réussite effrayants sur des questions pourtant classiques : ALI amplificateur ou comparateur 3 %, équation du premier ordre 3 %, circuit RL 4 %, Sallen-Key 5 %, signe de l’arc tangente 0, bruit d’une résistance deux candidats, Bode d’un amplificateur sept candidats. Les réussir, c’est prendre des points que les autres laissent.`,
 `<b>Le réflexe.</b> Pour chacune, une méthode courte : écrire le modèle, vérifier les cas limites (continu, fréquence infinie, signe), puis l’application numérique avec l’unité.`,
 `<b>Sallen-Key passe-bas, gain unité, deux résistances R</b> : ${V('ω<sub>0</sub>')} = ${fr('1','R·√(C<sub>1</sub>·C<sub>2</sub>)')} et ${V('m')} = √(${V('C<sub>2</sub>')}/${V('C<sub>1</sub>')}), ${V('C<sub>1</sub>')} étant le condensateur de contre-réaction.`,
 `<b>Bruit thermique</b> : ${V('e<sub>n</sub>')} = √(4·${V('k<sub>B</sub>')}·${V('T')}·${V('R')}·Δ${V('f')}), avec ${V('k<sub>B</sub>')} = 1,38 × 10⁻²³ J/K.`,
 `<b>Théorème de l’énergie cinétique</b> : la puissance des actions extérieures égale la dérivée de l’énergie cinétique : ${V('P')} = ${V('J')}·${V('ω')}·${V('ω̇')}.`]}
];
const Q={
bts:[
 {t:'Où revient la sortie ?',gen:()=>{const R1=pick([1e3,2.2e3,4.7e3,10e3]),R2=pick([10e3,22e3,47e3,100e3]);const G=1+R2/R1;
  return {text:`La sortie de l’ALI revient sur l’entrée − par ${ohm(R2)} ; ${ohm(R1)} relie l’entrée − à la masse. Quel est le régime de fonctionnement, et l’amplification ${V('V<sub>s</sub>/V<sub>e</sub>')} ?`,fig:ampF(ohm(R1),ohm(R2)),fields:[{l:'Amplification',u:'',a:G,tol:.02}],
  hint:`Contre-réaction sur l’entrée − : régime linéaire, ${V('V⁺ = V⁻')}. Puis un pont diviseur sur la sortie.`,
  corr:J(`Contre-réaction négative : régime linéaire, ${V('ε = 0')}. ${V('V⁻')} = ${V('V<sub>s</sub>')}·${fr('R<sub>1</sub>','R<sub>1</sub> + R<sub>2</sub>')} = ${V('V<sub>e</sub>')}, d’où ${V('A')} = 1 + ${fr('R<sub>2</sub>','R<sub>1</sub>')} = <b>${fmt(G)}</b>.`),
  jury:'Avant tout calcul, le jury veut voir justifié le régime de l’ALI (externe 2025).'};}},
 {t:'Solution du premier ordre',gen:()=>{const E=pick([5,10,12,24]),tau=pick([2,5,10,47]),t=pick([1,2,3])*tau;const u=E*(1-Math.exp(-t/tau));
  return {text:`${V('τ·u′ + u = E')} avec ${V('E')} = ${E} V, ${V('τ')} = ${tau} ms et ${V('u(0) = 0')}. Que vaut ${V('u')} à ${V('t')} = ${t} ms ?`,fields:[{l:'u(t)',u:'V',a:u,tol:.02}],
  hint:`${V('u(t) = E·(1 − e<sup>−t/τ</sup>)')}.`,corr:J(`${V('u')} = ${E} × (1 − e<sup>−${t}/${tau}</sup>) = <b>${fmt(u)} V</b>.`),jury:'L’équation du premier ordre n’a été réussie que par 3 % des candidats (externe 2025).'};}},
 {t:'Argument d’un complexe',gen:()=>{const a=-pick([1,2,3,5]),b=pick([1,2,4,6])*pick([1,-1]);const ph=deg(Math.atan2(b,a));
  return {text:`Argument de ${V('z')} = ${fmt(a)} ${b<0?'−':'+'} ${Math.abs(b)}j, en degrés, entre −180° et 180°.`,fields:[{l:'Argument',u:'°',a:ph,abs:.5}],
  hint:`La partie réelle est négative : arctan(${V('b/a')}) donne un angle faux de 180°.`,corr:J(`arctan(${fmt(b)}/${fmt(a)}) = ${fmt(deg(Math.atan(b/a)))}°, mais ${V('z')} est dans le ${b>0?'deuxième':'troisième'} quadrant : on ${b>0?'ajoute':'retranche'} 180°, soit <b>${fmt(ph)}°</b>.`),jury:'Aucun candidat n’a tenu compte du signe de l’argument de l’arc tangente (externe 2025, question 55).'};}},
 {t:'Décibels',gen:()=>{const A=pick([5,20,50,200,517,1000]);const g=20*Math.log10(A);
  return {text:`Une amplification vaut ${A}. Combien de décibels ?`,fields:[{l:'Gain',u:'dB',a:g,abs:.1}],hint:`20·log(${A}).`,corr:J(`20·log(${A}) = <b>${fmt(g)} dB</b>.`),jury:'Les conversions en décibels sont la base des diagrammes de Bode, réussis par sept candidats seulement en 2026.'};}},
 {t:'Énergie d’un condensateur',gen:()=>{const C=pick([47,100,470,1000])*1e-6,U=pick([12,24,48,400]);const W=C*U*U/2;
  return {text:`Énergie stockée dans ${fmt(C*1e6)} µF chargés sous ${U} V.`,fields:[{l:'Énergie',u:'J',a:W,tol:.02}],hint:`½·C·U².`,corr:J(`W = ½ × ${fmt(C)} × ${U}² = <b>${fmt(W)} J</b>.`),jury:'L’énergie stockée dans un condensateur ou un supercondensateur est méconnue de beaucoup (externe 2022).'};}},
 {t:'Durée d’un caractère en 8N1',gen:()=>{const b=pick([9600,19200,115200]);const t=10/b*1e3;
  return {text:`Durée d’un octet transmis en 8N1 à ${b} bit/s.`,fields:[{l:'Durée',u:'ms',a:t,tol:.02}],hint:`10 bits par caractère.`,corr:J(`1 start + 8 données + 1 stop = 10 bits : ${V('t')} = 10/${b} = <b>${fmt(t)} ms</b>.`),jury:'Les protocoles de liaison série sont méconnus de nombreux candidats depuis trois sessions (externe 2025).'};}}
],
agreg:[
 {t:'ALI : amplificateur ou comparateur ?',src:'d’après externe 2025, épreuve 2, question 48',gen:()=>{const V0=pick([12,15]),R1=pick([10e3,22e3,47e3]),R2=pick([100e3,220e3,470e3]);const s=V0*R1/R2;
  return {text:`L’ALI est alimenté en ±${V0} V (saturation à ±${V0} V). ${V('V<sub>e</sub>')} arrive par ${ohm(R1)} sur l’entrée + ; la sortie revient sur l’entrée + par ${ohm(R2)} ; l’entrée − est à la masse. Régime de fonctionnement ? Calculer le seuil de basculement haut ${V('V<sub>H</sub>')}.`,fig:trigF(ohm(R1),ohm(R2)),fields:[{l:'Seuil haut VH',u:'V',a:s,tol:.02}],
  hint:`La sortie revient sur l’entrée + : réaction positive, l’ALI sature. Le basculement a lieu quand ${V('V⁺')} passe par 0 (Millman sur l’entrée +).`,
  corr:J(`Réaction positive : pas de régime linéaire, l’ALI est un <b>comparateur à hystérésis</b> (non inverseur), ${V('V<sub>s</sub>')} = ±${V0} V.`)+J(`Millman sur l’entrée + : ${V('V⁺')} = ${fr('R<sub>2</sub>·V<sub>e</sub> + R<sub>1</sub>·V<sub>s</sub>','R<sub>1</sub> + R<sub>2</sub>')}. Basculement quand ${V('V⁺')} = 0 : ${V('V<sub>e</sub>')} = −${fr('R<sub>1</sub>','R<sub>2</sub>')}·${V('V<sub>s</sub>')}. Avec ${V('V<sub>s</sub>')} = −${V0} V, le seuil haut vaut ${V('V<sub>H</sub>')} = ${V0} × ${fmt(R1/R2)} = <b>${fmt(s)} V</b> ; le seuil bas vaut −${fmt(s)} V.`),
  jury:'Différence amplificateur / comparateur : 3 % des candidats la traitent bien ; le jury la décrit comme très discriminante (externe 2025, question 48).'};}},
 {t:'Équation différentielle du premier ordre',src:'d’après externe 2025, épreuve 2, question 49',gen:()=>{const E=pick([5,10,12]),R=pick([1e3,4.7e3,10e3,22e3]),C=pick([100,220,470,1000])*1e-9;const tau=R*C,t=pick([.5,1,2])*tau,u=E*(1-Math.exp(-t/tau));
  return {text:`Le condensateur, déchargé, est relié à ${V('t = 0')} à la source ${V('E')} = ${E} V par ${ohm(R)} ; ${V('C')} = ${fmt(C*1e9)} nF. Écrire l’équation différentielle vérifiée par ${V('u<sub>C</sub>')}, puis calculer ${V('τ')} et ${V('u<sub>C</sub>')} à ${V('t')} = ${fmt(t*1e3)} ms.`,fig:rcF(ohm(R),`${fmt(C*1e9)} nF`,`${E} V`),fields:[{l:'Constante de temps τ',u:'ms',a:tau*1e3,tol:.02},{l:'uC(t)',u:'V',a:u,tol:.02}],
  hint:`Loi des mailles : ${V('E = R·i + u<sub>C</sub>')} avec ${V('i = C·du<sub>C</sub>/dt')}.`,
  corr:J(`${V('E = R·C·du<sub>C</sub>/dt + u<sub>C</sub>')}, soit ${V('τ·u′ + u = E')} avec ${V('τ = R·C')} = <b>${fmt(tau*1e3)} ms</b>.`)+J(`Solution avec ${V('u(0) = 0')} : ${V('u<sub>C</sub>(t) = E·(1 − e<sup>−t/τ</sup>)')} = <b>${fmt(u)} V</b>.`),
  jury:'Équation différentielle du premier ordre : 3 % de réussite (externe 2025, question 49).'};}},
 {t:'Charge et décharge d’un circuit RL',src:'d’après externe 2025, épreuve 2, question 52',gen:()=>{const E=pick([5,12,24]),R=pick([10,22,47,100]),L=pick([1,2.2,4.7,10])*1e-3;const tau=L/R,Imax=E/R,Is=Imax*pick([.5,.8,.9]);const t=tau*Math.log(Imax/(Imax-Is));
  return {text:`Une bobine ${V('L')} = ${fmt(L*1e3)} mH en série avec ${V('R')} = ${R} Ω est alimentée à ${V('t = 0')} sous ${E} V (courant initial nul). Constante de temps, puis durée pour que le courant atteigne ${fmt(Is*1e3)} mA.`,fields:[{l:'τ',u:'µs',a:tau*1e6,tol:.02},{l:'Durée',u:'µs',a:t*1e6,tol:.03}],
  hint:`${V('i(t) = (E/R)·(1 − e<sup>−t/τ</sup>)')} avec ${V('τ = L/R')}.`,
  corr:J(`${V('τ = L/R')} = <b>${fmt(tau*1e6)} µs</b>, ${V('I<sub>∞</sub> = E/R')} = ${fmt(Imax*1e3)} mA.`)+J(`${V('i(t) = I<sub>∞</sub>·(1 − e<sup>−t/τ</sup>)')} ⇒ ${V('t = τ·ln(I<sub>∞</sub>/(I<sub>∞</sub> − I<sub>s</sub>))')} = <b>${fmt(t*1e6)} µs</b>.`),
  jury:'Périodes de charge et de décharge d’un circuit RL : 4 % de réussite (externe 2025, question 52).'};}},
 {t:'Le signe de l’arc tangente',src:'d’après externe 2025, épreuve 2, question 55',gen:()=>{const m=pick([.2,.3,.5,.7]),x=pick([1.5,2,3,5]);const ph=-deg(Math.atan2(2*m*x,1-x*x));
  return {text:`${V('H(jω)')} = ${fr('1','1 − x² + 2j·m·x')} avec ${V('x = ω/ω<sub>0</sub>')}, ${V('m')} = ${fmt(m)}. Phase de ${V('H')} pour ${V('x')} = ${fmt(x)}, en degrés.`,fields:[{l:'Phase',u:'°',a:ph,abs:.5}],
  hint:`Pour ${V('x')} &gt; 1, la partie réelle du dénominateur est négative.`,
  corr:J(`Le dénominateur vaut ${fmt(1-x*x)} + ${fmt(2*m*x)}j : partie réelle négative, il est dans le deuxième quadrant, son argument vaut 180° − arctan(${fmt(2*m*x)}/${fmt(x*x-1)}) = ${fmt(-ph)}°.`)+J(`La phase de ${V('H')} en est l’opposé : <b>${fmt(ph)}°</b>, entre −90° et −180° comme tout second ordre au-delà de ${V('ω<sub>0</sub>')}. Le calcul direct arctan(${fmt(2*m*x)}/${fmt(1-x*x)}) donnerait ${fmt(-deg(Math.atan(2*m*x/(1-x*x))))}° : faux de 180°.`),
  jury:'Modèle équivalent de l’inductance : aucun candidat n’a tenu compte du signe de l’argument de l’arc tangente (externe 2025, question 55).'};}},
 {t:'Filtre de Sallen-Key',src:'d’après interne 2025, épreuve 2, questions 39 et 40',gen:()=>{const R=pick([10e3,22e3,47e3,100e3]),C2=pick([10,22,47,100])*1e-9,C1=C2*pick([2,4,9]);const w0=1/(R*Math.sqrt(C1*C2)),m=Math.sqrt(C2/C1);
  return {text:`Passe-bas de Sallen-Key à gain unité : deux résistances ${ohm(R)}, ${V('C<sub>1</sub>')} = ${fmt(C1*1e9)} nF (de la sortie au point milieu), ${V('C<sub>2</sub>')} = ${fmt(C2*1e9)} nF (à la masse). Fréquence propre et coefficient d’amortissement.`,fig:skF(ohm(R),`C1 = ${fmt(C1*1e9)} nF`,`C2 = ${fmt(C2*1e9)} nF`),fields:[{l:'f0',u:'Hz',a:w0/(2*Math.PI),tol:.02},{l:'m',u:'',a:m,tol:.02}],
  hint:`Millman au point milieu et sur l’entrée +, ${V('ε = 0')} : ${V('H')} = 1/(1 + 2R·C<sub>2</sub>·p + R²·C<sub>1</sub>·C<sub>2</sub>·p²).`,
  corr:J(`${V('H(p)')} = ${fr('1','1 + 2R·C<sub>2</sub>·p + R²·C<sub>1</sub>·C<sub>2</sub>·p²')} ; identification avec 1/(1 + 2m·p/ω<sub>0</sub> + p²/ω<sub>0</sub>²) :`)+J(`${V('ω<sub>0</sub>')} = ${fr('1','R·√(C<sub>1</sub>·C<sub>2</sub>)')} ⇒ ${V('f<sub>0</sub>')} = <b>${fmt(w0/(2*Math.PI))} Hz</b> ; ${V('m = R·C<sub>2</sub>·ω<sub>0</sub>')} = √(${V('C<sub>2</sub>/C<sub>1</sub>')}) = <b>${fmt(m)}</b>.`),
  jury:'Filtre de Sallen-Key correctement traité par 5 % des candidats (interne 2025).'};}},
 {t:'Bruit thermique d’une résistance',src:'d’après externe 2025, épreuve 2 ; externe 2026, épreuve 2',gen:()=>{const R=pick([1e3,10e3,47e3,100e3,1e6]),T=pick([290,300,313]),df=pick([10e3,100e3,180e3,1e6]);const e=Math.sqrt(4*kB*T*R*df);
  return {text:`Tension efficace de bruit thermique d’une résistance de ${ohm(R)} à ${T} K dans une bande de ${fmt(df/1e3)} kHz.`,fields:[{l:'Bruit efficace',u:'µV',a:e*1e6,tol:.02}],
  hint:`Densité spectrale ${V('4·k<sub>B</sub>·T·R')} en V²/Hz, intégrée sur la bande.`,
  corr:J(`${V('e<sub>n</sub>')} = √(4 × 1,38 × 10⁻²³ × ${T} × ${fmt(R)} × ${fmt(df)}) = <b>${fmt(e*1e6)} µV</b>. Des bruits indépendants s’ajoutent en quadrature : ${V('e')} = √(${V('e<sub>1</sub>')}² + ${V('e<sub>2</sub>')}²).`),
  jury:'Bruit d’une résistance : deux candidats seulement ont donné l’expression correcte (externe 2025) ; aucun n’a mené le calcul de bruit du LNA à terme (externe 2026).'};}},
 {t:'Bode d’un amplificateur passe-bande',src:'d’après externe 2026, épreuve 2, questions 24 à 26',gen:()=>{const Av=pick([100,220,517,1000]),GBW=pick([10e6,50e6,100e6]),fc=pick([100,200,500]);const fC=GBW/Av;
  return {text:`Un amplificateur d’amplification ${Av} est précédé d’un passe-haut du premier ordre de coupure ${fc} Hz ; l’ALI a un produit gain-bande de ${fmt(GBW/1e6)} MHz. Coupure haute et gain de la bande passante.`,fields:[{l:'Coupure haute',u:'kHz',a:fC/1e3,tol:.02},{l:'Gain dans la bande',u:'dB',a:20*Math.log10(Av),abs:.1}],
  hint:`Produit gain-bande constant : ${V('f<sub>C</sub> = GBW/A<sub>v</sub>')}.`,
  corr:J(`${V('f<sub>C</sub>')} = ${fmt(GBW)}/${Av} = <b>${fmt(fC/1e3)} kHz</b> ; gain 20·log ${Av} = <b>${fmt(20*Math.log10(Av))} dB</b>.`)+J(`Asymptotes : +20 dB/décade jusqu’à ${fc} Hz, palier à ${fmt(20*Math.log10(Av))} dB jusqu’à ${fmt(fC/1e3)} kHz, puis −20 dB/décade : un passe-bande.`),
  jury:'Le diagramme de Bode asymptotique n’a été tracé correctement que par 7 candidats (externe 2026, question 26).'};}},
 {t:'Durée d’une trame série',src:'d’après interne 2025, épreuve 2, question 25',gen:()=>{const b=pick([4800,9600,19200,115200]),n=pick([20,40,80,120]),par=pick([0,1]);const bits=10+par,t=n*bits/b;
  return {text:`${n} caractères ASCII sont transmis à ${b} bit/s, format 8 bits de données, ${par?'parité paire':'sans parité'}, un bit de stop. Durée de la transmission.`,fields:[{l:'Durée',u:'ms',a:t*1e3,tol:.02}],
  hint:`Compter les bits par caractère : start, données${par?', parité':''}, stop.`,corr:J(`${bits} bits par caractère : ${V('t')} = ${n} × ${bits}/${b} = <b>${fmt(t*1e3)} ms</b>.`),
  jury:'Protocoles de communication série méconnus de nombreux candidats, question posée depuis au moins trois sessions (externe 2025).'};}},
 {t:'Le théorème de l’énergie cinétique',src:'d’après externe 2026, épreuve 1, et interne 2026, épreuve 1',gen:()=>{const Jt=pick([5e4,1.2e5,3.6e5]),N=pick([10,12,16.6,20]),ta=pick([10,12,20,30]);const w=N*Math.PI/30,wd=w/ta,P=Jt*w*wd;
  return {text:`Un plateau d’inertie ${fmt(Jt)} kg·m² est lancé de 0 à ${fmt(N)} tr/min en ${ta} s, accélération angulaire constante, frottements négligés. Puissance à fournir à la fin de l’accélération.`,fields:[{l:'Puissance',u:'kW',a:P/1e3,tol:.02}],
  hint:`${V('P = dE<sub>c</sub>/dt')} = ${V('J·ω·ω̇')}.`,
  corr:J(`${V('ω')} = ${fmt(N)} × π/30 = ${fmt(w)} rad/s ; ${V('ω̇')} = ${fmt(wd)} rad/s².`)+J(`Théorème de l’énergie cinétique : ${V('P = J·ω·ω̇')} = <b>${fmt(P/1e3)} kW</b>, maximale en fin d’accélération (la puissance croît avec la vitesse).`),
  jury:'Énergie cinétique d’un solide en rotation et puissances très mal traitées ; le théorème de l’énergie cinétique est rarement connu ou écrit (externe 2026, épreuve 1).'};}},
 {t:'Valeurs moyenne et efficace d’un pont PD3',src:'d’après interne 2026, épreuve 2, questions 20 et 23',gen:()=>{const U=pick([208,230,400,690]),I=pick([50,100,250,440]);const Vm=3*Math.SQRT2*U/Math.PI,Ie=I*Math.sqrt(2/3);
  return {text:`Pont PD3 à diodes sur un réseau triphasé de tension composée ${U} V ; il débite un courant continu ${I} A. Valeur moyenne de la tension redressée et valeur efficace du courant de ligne.`,fields:[{l:'Tension moyenne',u:'V',a:Vm,tol:.01},{l:'Courant de ligne efficace',u:'A',a:Ie,tol:.01}],
  hint:`Tension redressée : enveloppe des tensions composées. Courant de ligne : créneaux de ±${I} A pendant 120° sur 180°.`,
  corr:J(`${V('V<sub>moy</sub>')} = ${fr('3√2·U','π')} = <b>${fmt(Vm)} V</b>.`)+J(`Le courant de ligne vaut ±${I} A pendant les deux tiers de la période : ${V('I<sub>eff</sub>')} = ${I}·√(2/3) = <b>${fmt(Ie)} A</b>.`),
  jury:'Le PD3 est un classique dont la forme d’onde est connue, mais la plupart des candidats ne maîtrisent pas les calculs de valeur moyenne et efficace (interne 2026).'};}},
 {t:'Linéariser autour d’un point de fonctionnement',src:'d’après interne 2026, épreuve 2, question 35',gen:()=>{const k=pick([1e-4,2e-4,5e-4]),w0=pick([100,150,200]);const P0=k*w0**3,a=3*k*w0*w0;
  return {text:`La puissance d’un ventilateur suit ${V('P')} = ${KS(k)}·${V('ω')}³ (W, ${V('ω')} en rad/s). Linéariser autour de ${V('ω<sub>0</sub>')} = ${w0} rad/s : ${V('P ≈ P<sub>0</sub> + a·(ω − ω<sub>0</sub>)')}.`,fields:[{l:'P0',u:'W',a:P0,tol:.01},{l:'Pente a',u:'W/(rad/s)',a:a,tol:.01}],
  hint:`La pente de la tangente est la dérivée au point de fonctionnement.`,
  corr:J(`${V('P<sub>0</sub>')} = ${KS(k)} × ${w0}³ = <b>${fmt(P0)} W</b> ; ${V('a = dP/dω')} = 3·${KS(k)}·${w0}² = <b>${fmt(a)} W/(rad/s)</b>. Le modèle n’est valable qu’autour de ${w0} rad/s : à vérifier sur l’écart à la courbe.`),
  jury:'Tous les candidats n’ont pas su linéariser une courbe autour d’un point de fonctionnement (interne 2026).'};}},
 {t:'Chauffer la matière entrante',src:'d’après interne 2025, épreuve 1, question 26',gen:()=>{const qm=pick([.8,1.2,1.96,2.5]),c=pick([3220,3600,4180]),d=pick([1.5,2,5,10]);const P=qm*c*d;
  return {text:`Une matière entre dans un digesteur avec un débit massique de ${fmt(qm)} kg/s, ${fmt(d)} °C sous la température du digesteur ; capacité thermique ${c} J/(kg·K). Flux de chaleur pour la porter à la température du digesteur.`,fields:[{l:'Flux',u:'kW',a:P/1e3,tol:.02}],
  hint:`Une puissance thermique transportée : ${V('Φ = q<sub>m</sub>·c·Δθ')}.`,corr:J(`${V('Φ')} = ${fmt(qm)} × ${c} × ${fmt(d)} = <b>${fmt(P/1e3)} kW</b>.`),
  jury:'Flux pour chauffer la matière : à peine 5 % des candidats l’ont calculé, en une ligne (interne 2025).'};}},
 {t:'Énergie utile d’un supercondensateur',src:'d’après externe 2022',gen:()=>{const C=pick([63,94,165]),Um=pick([48,125,160]),r=pick([.5,.4]);const W=C*(Um*Um-(r*Um)**2)/2;
  return {text:`Un module de supercondensateurs de ${C} F, chargé à ${Um} V, est déchargé jusqu’à ${fmt(r*Um)} V. Énergie restituée et part de l’énergie stockée.`,fields:[{l:'Énergie',u:'kJ',a:W/1e3,tol:.02},{l:'Part utilisée',u:'%',a:100*(1-r*r),abs:.5}],
  hint:`${V('W = ½·C·(U<sub>1</sub>² − U<sub>2</sub>²)')}.`,
  corr:J(`${V('W')} = ½ × ${C} × (${Um}² − ${fmt(r*Um)}²) = <b>${fmt(W/1e3)} kJ</b>, soit 1 − ${fmt(r)}² = <b>${fmt(100*(1-r*r))} %</b> de l’énergie stockée : décharger à moitié de la tension libère les trois quarts de l’énergie.`),
  jury:'Beaucoup de candidats méconnaissent l’expression de l’énergie stockée dans un supercondensateur (externe 2022).'};}},
 {t:'Quantification d’un CAN',src:'d’après externe 2025 et 2019',gen:()=>{const PE=pick([3.3,5,10]),n=pick([10,12,16]);const q=PE/2**n;
  return {text:`CAN unipolaire ${n} bits, pleine échelle ${fmt(PE)} V. Quantum, puis valeur efficace du bruit de quantification.`,fields:[{l:'Quantum',u:'mV',a:q*1e3,tol:.01},{l:'Bruit efficace',u:'mV',a:q/Math.sqrt(12)*1e3,tol:.02}],
  hint:`Erreur uniformément répartie sur ±q/2 : valeur efficace q/√12.`,
  corr:J(`${V('q')} = ${fmt(PE)}/2<sup>${n}</sup> = <b>${fmt(q*1e3)} mV</b> ; bruit ${V('q/√12')} = <b>${fmt(q/Math.sqrt(12)*1e3)} mV</b>. Échantillonner au moins deux fois plus vite que la plus haute fréquence du signal (Shannon).`),
  jury:'Erreur de quantification et fréquence d’échantillonnage : lacunes persistantes (externe 2025 ; déjà relevé en 2019).'};}}
]};
NOTIONS.push({id:'cinq',name:'Les questions à 5 %',desc:'Les questions que presque personne ne réussit d’après les rapports : ALI comparateur, premier ordre, RL, arc tangente, Sallen-Key, bruit, Bode, trames, TEC, PD3.',jury:'Taux publiés : 0 à 5 % de réussite. Chacune rapporte des points que les autres laissent.',levels:LV.map(L=>({id:L.id,name:L.name,sub:L.sub,fiche:L.fiche,qs:Q[L.id]}))});
})();
