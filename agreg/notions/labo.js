/* Laboratoire : simulateurs interactifs associés aux parties d’annales. Chaque entrée : {id,n,t,sub,p[],s[],draw,out,defis[[q,r]],anim?} */
(function(){
const PI=Math.PI,L10=Math.log10,INK='#183047',RED='#c9483b',BLU='#1f4fbf';
/* ===== 1. asservissement : correcteur P ou PI sur le modèle de la pile ===== */
const PO=[1,1.4,2,6.2];
function rep(K,Ti,T){const dt=.01,N=Math.round(T/dt);let x=[0,0,0,0,0];const pts=[[0,0]];
 const f=x=>{const e=1-x[3],u=K*(e+(Ti?x[4]/Ti:0));return [PO[0]*(u-x[0]),PO[1]*(x[0]-x[1]),PO[2]*(x[1]-x[2]),PO[3]*(x[2]-x[3]),e];};
 for(let i=1;i<=N;i++){const k1=f(x),k2=f(x.map((v,j)=>v+dt/2*k1[j])),k3=f(x.map((v,j)=>v+dt/2*k2[j])),k4=f(x.map((v,j)=>v+dt*k3[j]));x=x.map((v,j)=>v+dt/6*(k1[j]+2*k2[j]+2*k3[j]+k4[j]));if(Math.abs(x[3])>50)break;if(i%5==0)pts.push([i*dt,x[3]]);}return pts;}
const bo=(K,Ti,w)=>{let m=K,ph=0;if(Ti){m*=Math.hypot(1,1/(w*Ti));ph-=deg(Math.atan(1/(w*Ti)));}for(const a of PO){m/=Math.hypot(1,w/a);ph-=deg(Math.atan(w/a));}return [m,ph];};
function marges(K,Ti){const bis=(g,a,b)=>{for(let i=0;i<50;i++){const m=Math.sqrt(a*b);if(g(m)>0)a=m;else b=m;}return a;};let w180=null,wc=null,pm=bo(K,Ti,.01),wp=.01;
 for(let i=1;i<=400;i++){const w=.01*10**(i/100),r=bo(K,Ti,w);if(w180==null&&pm[1]>-180&&r[1]<=-180)w180=bis(x=>bo(K,Ti,x)[1]+180,wp,w);if(wc==null&&pm[0]>1&&r[0]<=1)wc=bis(x=>bo(K,Ti,x)[0]-1,wp,w);pm=r;wp=w;}
 return {Mg:w180?-20*L10(bo(K,Ti,w180)[0]):null,Mp:wc?180+bo(K,Ti,wc)[1]:null};}
const Klim=(()=>{let a=1,b=20;for(let i=0;i<50;i++){const m=(a+b)/2;if(marges(m,0).Mg>0)a=m;else b=m;}return a;})();
LABS.push({id:'pi',n:'asserv',t:'Régler le correcteur de la pile à combustible',sub:'Interne 2024 · régulation de température',
 p:[`Le modèle est celui de la partie d’annale : quatre constantes de temps, gain statique 1. La consigne est un échelon unité. Règle le gain ${V('K')} et la constante de temps d’intégration ${V('T<sub>i</sub>')} du correcteur ${V('K')}(1 + ${fr(1,'T<sub>i</sub> p')}). Avec ${V('T<sub>i</sub>')} = 0, il n’y a pas d’action intégrale.`],
 s:[{l:'Gain K',min:.2,max:8,step:.1,v:1},{l:'Ti (0 = sans intégrale)',min:0,max:10,step:.2,v:0,u:'s'}],
 draw:(K_,Ti)=>plot({W:680,H:300,x0:0,x1:40,dx:2.5,xmaj:2,y0:0,y1:2,dy:.1,ymaj:2,curves:[{pts:rep(K_,Ti,40)}],hl:[{y:1,t:'consigne'},{y:1.05,t:'',c:'#9fb3c2'},{y:.95,t:'± 5 %',c:'#9fb3c2'}],xl:'Temps (s)',yl:'Sortie',alt:'réponse indicielle'}),
 out:(K_,Ti)=>{const m=marges(K_,Ti),p=rep(K_,Ti,40),fin=Ti?1:K_/(1+K_),mx=Math.max(...p.map(q=>q[1])),ok=(m.Mg==null||m.Mg>0)&&(m.Mp==null||m.Mp>0);let t5=null;for(let i=p.length-1;i>=0;i--){if(Math.abs(p[i][1]-fin)>.05*Math.abs(fin)){t5=p[Math.min(i+1,p.length-1)][0];break;}}
  return `Marge de gain : <b>${m.Mg==null?'infinie':fmt(m.Mg)+' dB'}</b> · marge de phase : <b>${m.Mp==null?'—':fmt(m.Mp)+'°'}</b> · ${ok?`valeur finale <b>${fmt(fin)}</b> (erreur statique ${(100*Math.abs(1-fin)).toFixed(1).replace('.',',')} %) · dépassement <b>${fmt(Math.max(0,100*(mx-fin)/fin),2)} %</b> · temps de réponse à 5 % ≈ <b>${t5==null?'—':fmt(t5,2)+' s'}</b>`:'<b style="color:#c9483b">boucle instable</b> : la sortie diverge'}`;},
 defis:[[`Sans action intégrale, à partir de quel gain la boucle devient-elle instable ?`,`Vers ${V('K')} = ${fmt(Klim)} : la marge de gain passe par 0 dB. C’est le gain limite de la partie d’annale. À démontrer par le critère du revers sur le diagramme de Bode.`],
  [`Pourquoi l’erreur statique ne s’annule-t-elle jamais avec ${V('K')} seul ?`,`La boucle ouverte est de classe 0 : l’erreur vaut ${fr(1,'1 + K')}. Pour ${V('K')} = 1 la sortie s’arrête à 0,5. Augmenter ${V('K')} réduit l’erreur mais mange la marge de phase.`],
  [`Avec ${V('K')} = 1, cherche le ${V('T<sub>i</sub>')} qui donne la réponse la plus rapide sans dépassement gênant.`,`Vers ${V('T<sub>i</sub>')} = 2 s : dépassement d’environ 4 %, temps de réponse proche de 7,5 s, marge de phase de 65°. À 1 s l’intégrale agit trop tôt : la marge de phase tombe à 31° et le dépassement atteint 42 %. À 4 s l’erreur s’annule lentement. Repère : ${V('T<sub>i</sub>')} de l’ordre de la somme des constantes de temps du procédé (2,4 s ici).`]]});
/* ===== 2. machine asynchrone : caractéristique mécanique à fréquence variable ===== */
const Rr=.032,X0=.152,pm=4,Vof=f=>230*Math.min(f,700)/700;
const Cm=(f,N)=>{const ns=60*f/pm,g=(ns-N)/ns,X=X0*f/700;if(Math.abs(g)<1e-9)return 0;return 3*pm*Vof(f)**2/(2*PI*f)*Rr/(Rr*Rr/g+g*X*X);};
const crv=f=>{const p=[];for(let N=0;N<=15000;N+=25)p.push([N,Cm(f,N)]);return p;};
const fdem=(()=>{let a=null,b=null;for(let f=10;f<=700;f+=1){if(Cm(f,0)>=451){if(a==null)a=f;b=f;}}return [a,b];})();
LABS.push({id:'mas',n:'machines',t:'Démarrer le bus en côte : V/f constant',sub:'Interne 2024 · moteur de l’essieu',
 p:[`Machine de la partie d’annale (${V('R')} = 0,032 Ω, ${V('X')} = 0,152 Ω à 700 Hz, 4 paires de pôles). L’onduleur garde ${fr('V','f')} constant jusqu’à 700 Hz, puis la tension reste à 230 V. En pointillés : la caractéristique nominale à 700 Hz.`],
 s:[{l:'Fréquence f',min:20,max:1000,step:10,v:700,u:'Hz'},{l:'Couple résistant',min:0,max:500,step:1,v:451,u:'N·m'}],
 draw:(f,Cr)=>plot({W:680,H:320,x0:0,x1:15000,dx:500,xmaj:4,y0:0,y1:600,dy:25,ymaj:4,curves:[{pts:crv(700),dash:1,c:'#9fb3c2',w:1.6},{pts:crv(f)}],hl:[{y:Cr,t:'couple résistant'}],xl:'Fréquence de rotation (tr/min)',yl:'Couple (N·m)',alt:'caractéristique mécanique'}),
 out:(f,Cr)=>{const X=X0*f/700,cmax=3*pm*Vof(f)**2/(2*PI*f)/(2*X),cd=Cm(f,0);return `Tension simple <b>${fmt(Vof(f),3)} V</b> · synchronisme <b>${fmt(60*f/pm,4)} tr/min</b> · couple de démarrage <b>${fmt(cd,3)} N·m</b> · couple maximal <b>${fmt(cmax,3)} N·m</b> · ${cd>=Cr?'<b>le moteur démarre</b>':'<b style="color:#c9483b">le moteur ne démarre pas</b>'}`;},
 defis:[[`À 700 Hz, le moteur démarre-t-il avec 451 N·m ? Et à quelles fréquences démarre-t-il ?`,`À 700 Hz le couple de démarrage n’est que de 191 N·m : non. Il démarre pour une fréquence comprise entre ${fdem[0]} et ${fdem[1]} Hz environ : le maximum de couple est à l’arrêt quand ${V('f')} = ${fr('R','X')} × 700 ≈ 147 Hz.`],
  [`Que devient le couple maximal quand on baisse la fréquence ? Et au-dessus de 700 Hz ?`,`En dessous de 700 Hz il reste à 475 N·m : il est proportionnel à (${fr('V','f')})², constant. Au-dessus, ${V('V')} est bloquée à 230 V : le couple maximal chute comme ${fr(1,'f²')} (défluxage).`],
  [`Pourquoi les courbes à différentes fréquences sont-elles parallèles dans leur partie utile ?`,`À ${fr('V','f')} constant, le couple ne dépend que de l’écart de vitesse au synchronisme (la fréquence des courants du rotor). La caractéristique se translate sans se déformer.`]]});
/* ===== 3. Fourier : onduleur à paliers nuls ===== */
const U0=490,An=(n,a)=>Math.abs(4*U0/(PI*n*Math.SQRT2)*Math.sin(n*PI/2)*Math.cos(n*a/2));
const thdU=a=>{const ue=U0*Math.sqrt(1-a/PI),a1=An(1,a);return Math.sqrt(Math.max(0,ue*ue-a1*a1))/a1;};
const aopt=(()=>{let b=0,m=9;for(let d=0;d<=90;d+=.1){const t=thdU(d*PI/180);if(t<m){m=t;b=d;}}return [b,m];})();
LABS.push({id:'ond',n:'fourier',t:'Onduleur : largeur du palier nul et spectre',sub:'Interne 2024 · onduleur de l’essieu',
 p:[`Tension entre phases de la partie d’annale : créneaux de ± 490 V séparés par des paliers nuls de largeur α. Le spectre est en valeurs efficaces.`],
 s:[{l:'Largeur du palier α',min:0,max:90,step:1,v:60,u:'°'}],
 draw:d=>{const a=d*PI/180,D=x=>x*180/PI,h1=(180-d)/2,h2=(180+d)/2;return plot({W:680,H:220,x0:-180,x1:180,dx:30,xmaj:2,y0:-600,y1:600,dy:100,ymaj:2,curves:[{pts:[[-180,-U0],[-h2,-U0],[-h2,0],[-h1,0],[-h1,U0],[h1,U0],[h1,0],[h2,0],[h2,-U0],[180,-U0]]}],xl:'θ (degrés)',yl:'u12 (V)',alt:'tension entre phases'})+bars({W:680,H:240,items:[1,3,5,7,9,11,13].map(n=>({x:''+n,y:An(n,a)})),y1:500,dy:50,ymaj:2,xl:'Rang',yl:'Valeur efficace (V)'});},
 out:d=>{const a=d*PI/180,nul=[3,5,7,9,11,13].filter(n=>An(n,a)<.5);return `Fondamental <b>${fmt(An(1,a),4)} V</b> · valeur efficace totale <b>${fmt(U0*Math.sqrt(1-a/PI),4)} V</b> · taux de distorsion <b>${fmt(100*thdU(a),3)} %</b> · rangs annulés : <b>${nul.length?nul.join(', '):'aucun'}</b>`;},
 defis:[[`Quelle valeur de α annule le rang 3 ? Et le rang 5 ?`,`Le rang ${V('n')} disparaît quand cos(${fr('n α',2)}) = 0, soit α = ${fr('180°','n')} : 60° pour le rang 3 (et 9, 15…), 36° pour le rang 5.`],
  [`Quelle valeur de α donne le plus faible taux de distorsion ?`,`Vers α = ${fmt(aopt[0],3)}°, avec ${fmt(100*aopt[1],3)} %. À 60° il vaut ${fmt(100*thdU(PI/3),3)} % : presque aussi bien, et les harmoniques qui restent (5, 7, 11…) sont de rang plus élevé que le 3, donc mieux filtrés par l’inductance de la machine. En triphasé, α = 60° est de toute façon la forme de la tension entre phases en commande pleine onde.`],
  [`Que paie-t-on en élargissant le palier ?`,`Le fondamental baisse comme cos(${fr('α',2)}) : de 441 V à α = 0 à 382 V à α = 60°. On échange de l’amplitude contre de la qualité.`]]});
/* ===== 4. signal : modulateur sigma-delta ===== */
function sd(ve,ord,n){let u1=0,u2=0,y=1;const b=[];for(let i=0;i<n;i++){if(ord==1){u1+=ve-y;y=u1>=0?1:-1;}else{u1+=ve-y;u2+=u1-y;y=u2>=0?1:-1;}b.push(y);}return b;}
LABS.push({id:'sd',n:'signal',t:'Modulateur sigma-delta : du train de bits à la mesure',sub:'Externe 2025 · convertisseur de l’accéléromètre',
 p:[`Entrée constante ${V('V<sub>e</sub>')} comprise entre −1 et +1 ; le comparateur sort +1 ou −1. En haut : les 64 premiers bits. En bas : la moyenne glissante sur ${V('D')} bits, c’est-à-dire la sortie du filtre décimateur divisée par ${V('D')}.`],
 s:[{l:'Entrée Ve',min:-.9,max:.9,step:.05,v:.3},{l:'Ordre du modulateur',min:1,max:2,step:1,v:1},{l:'Moyenne sur D bits',min:4,max:256,step:4,v:32}],
 draw:(ve,ord,D)=>{const n=768,b=sd(ve,ord,n),pts=[];let s=0;for(let i=0;i<n;i++){s+=b[i];if(i>=D)s-=b[i-D];if(i>=D-1)pts.push([i+1,s/D]);}
  return K.svg(680,80,K.chrono(b.slice(0,64).map(x=>x>0?1:0),30,18,9.6,36)+K.t(30,74,'64 premiers bits : niveau haut = +1, niveau bas = −1',{a:'start',fs:12,c:'#42596b'}),'train de bits')+plot({W:680,H:260,x0:0,x1:768,dx:32,xmaj:4,y0:-1,y1:1,dy:.25,ymaj:2,curves:[{pts,w:1.6}],hl:[{y:ve,t:'Ve'}],xl:'Numéro d’échantillon',yl:'Moyenne glissante',alt:'moyenne glissante du train de bits'});},
 out:(ve,ord,D)=>{const n=768,b=sd(ve,ord,n);let mx=0,s=0;for(let i=0;i<n;i++){s+=b[i];if(i>=D)s-=b[i-D];if(i>=4*D)mx=Math.max(mx,Math.abs(s/D-ve));}const un=b.filter(x=>x>0).length/n;
  return `Proportion de bits à +1 : <b>${fmt(100*un,3)} %</b> (attendu ${fmt(50*(1+ve),3)} %) · écart maximal entre la moyenne glissante et ${V('V<sub>e</sub>')} : <b>${fmt(mx,2)}</b> · un bit pèse ${fr(2,'D')} = ${fmt(2/D,2)}`;},
 defis:[[`Pour ${V('V<sub>e</sub>')} = 0,5 à l’ordre 1, quelle est la proportion de bits à +1 ? Pourquoi ?`,`75 % : la moyenne du train de bits doit égaler ${V('V<sub>e</sub>')}, donc ${V('x')} − (1 − ${V('x')}) = 0,5. C’est la question 35 : l’intégrateur annule l’erreur moyenne.`],
  [`Double ${V('D')} : de combien l’écart diminue-t-il à l’ordre 1 ? Et à l’ordre 2 ?`,`L’écart reste de l’ordre du poids d’un bit, ${fr(2,'D')}, aux deux ordres : il est à peu près divisé par 2. Une moyenne simple ne profite donc pas de la mise en forme du bruit. Le gain en OSR<sup>2M+1</sup> de la question 37 suppose un filtre décimateur plus sélectif : c’est l’objet de la question 42 du sujet.`],
  [`Que se passe-t-il pour ${V('V<sub>e</sub>')} = 0 à l’ordre 1 ?`,`Le train de bits est exactement périodique (+1, −1, +1, −1…) : le bruit de quantification n’est pas blanc mais concentré sur une raie. Ces motifs périodiques sont un défaut connu de l’ordre 1, atténué à l’ordre 2.`]]});
/* ===== 5. magnétisme : champ tournant et couple de la machine à aimants ===== */
const cx=215,cy=215,Pp=(r,a)=>[(cx+r*Math.sin(a*PI/180)).toFixed(1),(cy-r*Math.cos(a*PI/180)).toFixed(1)],arc=(r,a1,a2,c,w,o)=>`<path d="M${Pp(r,a1)}A${r} ${r} 0 0 1 ${Pp(r,a2)}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o||1}"/>`;
const LB=['2−','1+','3−','2+','1−','3+'];
function mach(wt,psi){let s=`<circle cx="${cx}" cy="${cy}" r="170" fill="#eef2f5" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="112" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="96" fill="#eef2f5" stroke="${INK}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="36" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
 const ph=(wt-psi)*PI/180;
 for(let k=0;k<18;k++){const a=10+20*k,l=LB[k%6],i=Math.sin(ph-2*PI*(+l[0]-1)/3)*(l[1]=='+'?1:-1),q=Pp(128,a);s+=`<path d="M${Pp(113,a-3.5)}L${Pp(145,a-4.5)}L${Pp(145,a+4.5)}L${Pp(113,a+3.5)}Z" fill="#fff" stroke="${INK}" stroke-width="1.1"/>`;
  if(Math.abs(i)>.08)s+=`<text x="${q[0]}" y="${+q[1]+5}" font-size="${(9+9*Math.abs(i)).toFixed(0)}" font-weight="700" text-anchor="middle" fill="${INK}">${i>0?'×':'•'}</text>`;const t=Pp(186,a);s+=`<text x="${t[0]}" y="${+t[1]+4}" font-size="11" text-anchor="middle" fill="#587083">${l}</text>`;}
 for(let m=0;m<6;m++){const c=30+(wt-psi)/3+60*m;s+=arc(105,c-22,c+22,m%2?BLU:RED,7,.75);const q=Pp(105,c);s+=`<text x="${q[0]}" y="${+q[1]+4}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${m%2?'S':'N'}</text>`;}
 for(let m=0;m<6;m++){const c=wt/3+60*m;s+=arc(90,c-24,c+24,m%2?'#e58a7f':'#7f9fe5',11);const q=Pp(90,c);s+=`<text x="${q[0]}" y="${+q[1]+4}" font-size="10" font-weight="700" text-anchor="middle" fill="${INK}">${m%2?'N':'S'}</text>`;}
 const a1=Pp(40,wt/3),a2=Pp(78,wt/3);s+=`<line x1="${a1[0]}" y1="${a1[1]}" x2="${a2[0]}" y2="${a2[1]}" stroke="${INK}" stroke-width="2"/>`;
 return K.svg(430,430,s,'machine synchrone, champ tournant');}
LABS.push({id:'champ',n:'magn',t:'Champ tournant et couple de la machine à aimants',sub:'Externe 2026 · moteur du train à hydrogène',anim:0,
 p:[`Coupe de la machine de la partie d’annale : 18 encoches, 3 paires de pôles. Les croix et les points donnent le sens et l’intensité des courants à l’instant choisi. Anneau extérieur de l’entrefer : pôles créés par le stator. Anneau intérieur : faces des aimants du rotor, qui tourne au synchronisme. Sens de rotation et polarités choisis ici pour un fonctionnement en moteur.`],
 s:[{l:'Instant ωt',min:0,max:360,step:5,v:0,u:'°'},{l:'Angle ψ entre courant et force électromotrice',min:-90,max:90,step:5,v:0,u:'°'}],
 draw:(wt,psi)=>mach(wt,psi),
 out:(wt,psi)=>{const c=Math.cos(psi*PI/180);return `Courants : ${[0,1,2].map(k=>`${V('i<sub>'+(k+1)+'</sub>')} = ${fmt(Math.sin((wt-psi)*PI/180-2*PI*k/3),2)}`).join(' · ')} (en fraction de la crête) · rotor à <b>${fmt(wt/3,3)}°</b> · couple = cos ψ × couple maximal = <b>${fmt(100*c,3)} %</b>${Math.abs(psi)<1?' : pôles du stator à mi-chemin entre les aimants, en quadrature':Math.abs(psi)>89?' : pôles du stator en face des aimants, aucun couple':''}`;},
 defis:[[`De quel angle tourne le champ quand ωt avance de 360° ?`,`De 120° mécaniques : un tiers de tour, soit ${fr('360°','p')} avec ${V('p')} = 3. D’où Ω = ${fr('ω','p')}.`],
  [`Pourquoi le couple est-il maximal pour ψ = 0 ?`,`Chaque pôle nord du stator est alors à mi-chemin entre deux aimants : il attire la face sud qui le suit et repousse la face nord qui le précède, les deux efforts poussent dans le sens de rotation. C’est le pilotage à courant ${V('i<sub>d</sub>')} nul.`],
  [`Que se passe-t-il pour ψ = +90° et pour ψ = −90° ?`,`Les pôles du stator sont en face des aimants : aucun couple. Dans un cas le champ du stator renforce celui des aimants, dans l’autre il s’y oppose : c’est le défluxage, utilisé pour dépasser la vitesse de base.`],
  [`À ωt = 0 et ψ = 0, quelles encoches ne portent aucun courant ?`,`Celles de la phase 1 : ${V('i<sub>1</sub>')} = sin 0 = 0. C’est exactement la situation de la question 52.`]]});
/* lien vers le simulateur dans la fiche de chaque partie d’annale */
[['asserv','pi'],['machines','mas'],['fourier','ond'],['signal','sd'],['magn','champ']].forEach(([n,id])=>{const N=NOTIONS.find(x=>x.id==n),L=N&&N.levels.find(l=>l.id=='annale');if(L)L.fiche.push(`<a href="#labo-${id}"><b>Ouvrir le simulateur de cette partie</b></a> : à manipuler après avoir traité les questions, pour vérifier tes résultats et voir l’effet de chaque paramètre.`);});
})();
