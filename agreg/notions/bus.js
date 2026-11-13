(function(){
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const sup=k=>`2<tspan dy="-5" font-size="9">${k}</tspan>`;
const dash=(x,y1,y2)=>`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#c3d0da" stroke-dasharray="3 3"/>`;
/* ----- figures ----- */
const bitsF=(n,nb,sub)=>K.svg(40+nb*46,96,K.frame(K.bin(n,nb).split('').map((b,i)=>[b,46,b=='1'?'#cfe6ef':'#fff',sub===false?'':sup(nb-1-i)]),20,20,36),'mot binaire');
const hexF=(bytes,labs)=>K.svg(40+bytes.length*(labs&&labs[0].length>3?120:84),96,K.frame(bytes.map((b,i)=>[typeof b=='number'?'0x'+K.hex(b):b,labs&&labs[0].length>3?120:84,'#eef5f8',labs?labs[i]:'']),20,20,36),'octets');
function uartF(byte,tb){const bits=[1,1,0];for(let i=0;i<8;i++)bits.push(byte>>i&1);bits.push(1,1,1);const w=42,x=30,labs=['repos','repos','start','b0','b1','b2','b3','b4','b5','b6','b7','stop','repos'];
 let s=K.chrono(bits,x,30,w,50);labs.forEach((l,i)=>{s+=K.t(x+i*w+w/2,106,l,{fs:11,c:'#42596b'})+dash(x+i*w,22,90);});
 if(tb)s+=K.ar(x+2*w,16,x+3*w,16,'#c9483b','',0,0)+K.ar(x+3*w,16,x+2*w,16,'#c9483b','',0,0)+K.t(x+2.5*w,10,tb,{fs:11,c:'#c9483b'});
 return K.svg(2*x+13*w,118,s+K.t(x-4,36,'1',{a:'end',fs:11})+K.t(x-4,84,'0',{a:'end',fs:11}),'trame série asynchrone');}
function i2cF(bits){const w=50,x0=100,yh=25,yl=55,ch=85,cl=115,labs=['A6','A5','A4','A3','A2','A1','A0','R/W','ACK'];
 let sda=`M50 ${yh}H${x0-25}V${yl}H${x0}`,scl=`M50 ${ch}H${x0-8}V${cl}`,s='';
 bits.forEach((b,i)=>{sda+=`V${b?yh:yl}H${x0+(i+1)*w}`;scl+=`H${x0+i*w+w*.3}V${ch}H${x0+i*w+w*.7}V${cl}`;s+=K.t(x0+i*w+w/2,140,labs[i],{fs:11,c:'#42596b'})+dash(x0+i*w,18,122);});
 scl+=`H${x0+9*w+10}`;
 return K.svg(x0+9*w+30,150,K.w(sda,'#12566f',2.2)+K.w(scl,'#587083',2)+s+K.t(14,yh+4,'SDA',{a:'start',fs:11})+K.t(14,ch+4,'SCL',{a:'start',fs:11})+K.t(x0-18,140,'S',{fs:11,c:'#c9483b',b:1}),'début d’un échange I2C');}
const idBits=id=>K.bin(id,11).split('').map(Number);
function arbF(ids,noms){const w=40,x=100;let s='';const bus=idBits(ids.reduce((a,b)=>a&b));
 ids.forEach((id,k)=>{s+=K.t(x-10,24+k*46+20,noms[k],{a:'end'})+K.chrono(idBits(id),x,24+k*46,w,26);});
 s+=K.t(x-10,24+ids.length*46+20,'Bus',{a:'end',b:1})+K.chrono(bus,x,24+ids.length*46,w,26,'#c9483b');
 for(let i=0;i<=11;i++)s+=dash(x+i*w,14,50+ids.length*46+8);for(let i=0;i<11;i++)s+=K.t(x+i*w+w/2,12,i+1,{fs:11,c:'#42596b'});
 return K.svg(x+11*w+20,70+ids.length*46,s,'arbitrage sur le bus CAN');}
const canF=n=>K.svg(700,90,K.frame([['SOF',44,'#fff','1'],['Identifiant',90,'#cfe6ef','11'],['RTR',40,'#fff','1'],['IDE',40,'#fff','1'],['r0',34,'#fff','1'],['DLC',46,'#f3d9bd','4'],['Données',110,'#cfe6ef',`8 × ${n}`],['CRC',60,'#f3d9bd','15'],['dél.',40,'#fff','1'],['ACK',46,'#fff','2'],['EOF',50,'#fff','7'],['inter',60,'#eee','3']],20,16,36),'trame CAN standard');
const pullF=(Vdd,Cb)=>K.svg(560,190,K.w('M150 25H290M170 25V38M270 25V38M170 102V120M270 102V150M70 120H500M70 150H500')+K.rv(170,70,'Rp')+K.rv(270,70,'Rp')+K.t(220,18,`Vdd = ${Vdd} V`)+K.box(20,105,60,60,'maître')+K.box(490,105,60,60,'esclave')+K.dot(170,120)+K.dot(270,150)+K.t(385,114,'SDA',{fs:12})+K.t(385,144,'SCL',{fs:12})+K.t(385,182,`capacité du bus : ${Cb} pF`,{fs:12,c:'#42596b'}),'résistances de tirage');
const LV=[
{id:'pro',name:'Bac pro',sub:'Compter en binaire et en hexadécimal',fiche:[
 `Chaque bit pèse le double de son voisin de droite : 1, 2, 4, 8, 16, 32, 64, 128.`,
 `Un chiffre hexadécimal vaut 4 bits : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.`,
 `Avec ${V('n')} bits on code 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1.`,
 `Durée d’un bit = ${fr('1','débit en bit/s')}.`]},
{id:'si',name:'Bac SI',sub:'Liaison série, conversion, nombres signés',fiche:[
 `Liaison série asynchrone : repos à 1, un bit de start à 0, les bits de données <b>en commençant par le poids faible</b>, un bit de stop à 1. En 8N1, un octet occupe 10 bits.`,
 `Convertisseur ${V('n')} bits : quantum ${V('q')} = ${fr('V<sub>ref</sub>','2<sup>n</sup>')} ; code = partie entière de ${fr('V','q')}.`,
 `Complément à deux sur 8 bits : si le bit de poids fort vaut 1, valeur = code − 256.`]},
{id:'bts',name:'BTS',sub:'I2C, SPI, Modbus, CAN',fiche:[
 `<b>I2C</b> : deux fils (SDA, SCL), tirés au niveau haut par des résistances. Premier octet = adresse sur 7 bits puis bit R/W (0 : écriture, 1 : lecture), suivi d’un acquittement.`,
 `<b>SPI</b> : quatre fils (SCLK, MOSI, MISO, CS), pas d’adresse, un fil CS par esclave, poids fort en premier.`,
 `<b>Modbus RTU</b> : 11 bits par caractère, trames séparées par un silence de 3,5 caractères.`,
 `<b>CAN</b> : trame standard de 44 bits + 8 par octet de données, plus 3 bits entre trames. Charge du bus = durée d’une trame × nombre de trames par seconde.`,
 `Tirage I2C : ${V('R<sub>p min</sub>')} = ${fr('V<sub>dd</sub> − 0,4','3 mA')} ; ${V('R<sub>p max</sub>')} = ${fr('t<sub>r</sub>','0,8473 · C<sub>b</sub>')}.`]},
{id:'agreg',name:'Agrégation',sub:'D’après annales et rapports de jury',fiche:[
 `<b>CRC</b> : on ajoute au message autant de zéros que le degré du polynôme générateur, on divise par OU exclusifs successifs ; le reste est le CRC.`,
 `<b>Bourrage CAN</b> : après 5 bits identiques, l’émetteur insère un bit de valeur opposée. Le bit inséré compte dans la série suivante.`,
 `<b>Arbitrage CAN</b> : 0 est dominant. Le nœud qui émet 1 et relit 0 se retire. L’identifiant le plus petit gagne.`,
 `Bit CAN = (1 + ${V('T<sub>seg1</sub> + T<sub>seg2</sub>')}) quanta ; point d’échantillonnage = ${fr('1 + T<sub>seg1</sub>','total')}.`,
 `Lecture I2C d’un registre : adresse + écriture, registre, redémarrage, adresse + lecture, puis les octets. Chaque octet coûte 9 périodes d’horloge.`,
 `<b>Constat des jurys</b> (interne 2024 à 2026, externe 2024 à 2026) : I2C méconnu, SPI mal exploité alors qu’il est documenté dans le sujet, CRC et complément à deux non maîtrisés. Externe 2023 : ne jamais inventer une réponse sur un protocole inconnu.`]}
];
const Q={pro:[],si:[],bts:[],agreg:[]};
/* ----- Bac pro ----- */
Q.pro.push({t:'Du binaire au décimal',gen(){const n=ri(18,250);
 return {text:`Quelle est la valeur décimale de cet octet ?`,fig:bitsF(n,8),fields:[{l:'Valeur décimale',u:'',a:n,abs:.1}],hint:`Additionner les poids des bits à 1.`,
 corr:`<div class="eq">${K.bin(n).split('').map((b,i)=>b=='1'?2**(7-i):null).filter(x=>x).join(' + ')} = <b>${n}</b></div>`};}});
Q.pro.push({t:'De l’hexadécimal au décimal',gen(){const h=pick([10,11,12,13,14,15]),l=ri(0,15),n=h*16+l;
 return {text:`Un automate affiche l’octet <b>0x${K.hex(n)}</b>. Quelle est sa valeur décimale ?`,fig:hexF([n]),fields:[{l:'Valeur décimale',u:'',a:n,abs:.1}],hint:`Le chiffre de gauche vaut 16 fois sa valeur.`,
 corr:`<div class="eq">${K.hex(n)[0]} = ${h} ; ${K.hex(n)[1]} = ${l} ; ${h} × 16 + ${l} = <b>${n}</b></div><p>En binaire : ${K.bin(n).slice(0,4)} ${K.bin(n).slice(4)}.</p>`};}});
Q.pro.push({t:'Durée d’un bit',gen(){const b=pick([9600,19200,57600,115200]);
 return {text:`Une liaison série fonctionne à ${fmt(b,6)} bit/s. Combien de temps dure un bit ? Combien de temps dure un octet transmis sur 10 bits ?`,fig:uartF(pick([0x55,0x4B,0xA3])),fields:[{l:'Durée d’un bit',u:'µs',a:1e6/b,tol:.02},{l:'Durée d’un octet (10 bits)',u:'µs',a:1e7/b,tol:.02}],hint:`La durée d’un bit est l’inverse du débit.`,
 corr:`<div class="eq">${V('T<sub>bit</sub>')} = ${fr(1,fmt(b,6))} = <b>${fmt(1e6/b)} µs</b> ; 10 bits : <b>${fmt(1e7/b)} µs</b></div>`};}});
Q.pro.push({t:'Combien de valeurs ?',gen(){const n=pick([8,10,12,16]);
 return {text:`Un capteur numérique code sa mesure sur ${n} bits. Combien de valeurs différentes peut-il fournir, et quelle est la plus grande ?`,fig:bitsF(2**n-1,n,false),fields:[{l:'Nombre de valeurs',u:'',a:2**n,abs:.1},{l:'Plus grande valeur',u:'',a:2**n-1,abs:.1}],hint:`Chaque bit supplémentaire double le nombre de valeurs.`,
 corr:`<div class="eq">2<sup>${n}</sup> = <b>${2**n}</b> valeurs, de 0 à <b>${2**n-1}</b></div>`};}});
/* ----- Bac SI ----- */
Q.si.push({t:'Lire une trame série',gen(){const n=ri(33,230),b=pick([9600,19200,38400,115200]);
 return {text:`Relevé à l’oscilloscope d’une liaison série 8N1. Quel octet est transmis, et à quel débit ?`,fig:uartF(n,`${fmt(1e6/b)} µs`),fields:[{l:'Valeur décimale de l’octet',u:'',a:n,abs:.1},{l:'Débit',u:'bit/s',a:b,tol:.03}],hint:`Le premier bit après le start est le bit de poids faible.`,
 corr:`<p>Bits lus dans l’ordre d’arrivée, b0 en premier : ${K.bin(n).split('').reverse().join(' ')}. On les remet dans l’ordre des poids : <b>${K.bin(n)}</b> = 0x${K.hex(n)} = <b>${n}</b>.</p><div class="eq">Débit = ${fr(1,`${fmt(1e6/b)} × 10⁻⁶`)} = <b>${fmt(b,6)} bit/s</b></div>`,
 jury:`La liaison série asynchrone fait partie des protocoles cités comme mal connus dans les rapports de l’interne et de l’externe. L’erreur classique est de lire l’octet à l’endroit, poids fort en premier.`};}});
Q.si.push({t:'Durée d’une transmission',gen(){const N=pick([64,256,1024,4096]),b=pick([9600,115200]);
 return {text:`On envoie un fichier de ${N} octets par une liaison série 8N1 à ${fmt(b,6)} bit/s. Combien de temps dure l’envoi ?`,fig:uartF(0x41),fields:[{l:'Durée',u:'ms',a:N*1e4/b,tol:.02}],hint:`En 8N1, chaque octet coûte 10 bits.`,
 corr:`<div class="eq">${N} × 10 bits = ${N*10} bits ; ${V('t')} = ${fr(N*10,fmt(b,6))} = <b>${fmt(N*1e4/b)} ms</b></div>`};}});
Q.si.push({t:'Quantum et code d’un convertisseur',gen(){const n=pick([8,10,12]),Vr=pick([3.3,5]),q=Vr/2**n,code=ri(Math.floor(2**n*.1),Math.floor(2**n*.9)),Vx=Math.round((code+.5)*q*1e4)/1e4;
 return {text:`Un convertisseur analogique-numérique ${n} bits a une pleine échelle de ${fmt(Vr)} V. On lui applique ${fmt(Vx,5)} V.`,fig:plot({W:560,H:230,x0:0,x1:8,dx:1,y0:0,y1:8,dy:1,curves:[{pts:Array.from({length:17},(_,i)=>[Math.ceil(i/2),Math.floor(i/2)])},{pts:[[0,0],[8,8]],c:C2,dash:1,w:1.4}],xl:'Tension, en quantums',yl:'Code',alt:'caractéristique en escalier'}),fields:[{l:'Quantum',u:'mV',a:q*1e3,tol:.02},{l:'Code de sortie',u:'',a:code,abs:1}],hint:`q = Vref / 2ⁿ, puis code = partie entière de V / q.`,
 corr:`<div class="eq">${V('q')} = ${fr(fmt(Vr),`2<sup>${n}</sup>`)} = ${fr(fmt(Vr),2**n)} = <b>${fmt(q*1e3)} mV</b></div><div class="eq">${fr(fmt(Vx,5),fmt(q,4))} = ${fmt(Vx/q,5)}, donc code = <b>${code}</b></div>`};}});
Q.si.push({t:'Complément à deux',gen(){const n=ri(129,254);
 return {text:`Un capteur de température renvoie l’octet signé <b>0x${K.hex(n)}</b>, codé en complément à deux, en degrés Celsius. Quelle température mesure-t-il ?`,fig:bitsF(n,8),fields:[{l:'Température',u:'°C',a:n-256,abs:.1}],hint:`Le bit de poids fort vaut 1 : le nombre est négatif.`,
 corr:`<p>0x${K.hex(n)} = ${n} en non signé. Le bit de poids fort est à 1, donc :</p><div class="eq">valeur = ${n} − 256 = <b>${fmt(n-256,4)} °C</b></div><p>Autre méthode : inverser tous les bits et ajouter 1 donne ${256-n}, la valeur absolue.</p>`,
 jury:`Le complément à deux est cité nommément parmi les notions non maîtrisées dans les rapports de l’interne 2024 à 2026.`};}});
/* ----- BTS ----- */
Q.bts.push({t:'Premier octet d’un échange I2C',gen(){const a=ri(9,119),rw=pick([0,1]),bits=K.bin(a,7).split('').map(Number).concat([rw,0]);
 return {text:`Relevé du début d’un échange I2C. Quelle est l’adresse de l’esclave, et le maître veut-il écrire ou lire ?`,fig:i2cF(bits),fields:[{l:'Adresse de l’esclave (décimal)',u:'',a:a,abs:.1},{l:'Bit R/W (0 ou 1)',u:'',a:rw,abs:.1}],hint:`SDA se lit pendant que SCL est à l’état haut. L’adresse tient sur les 7 premiers bits, poids fort en premier.`,
 corr:`<p>Bits lus sur les fronts hauts de SCL : <b>${K.bin(a,7)}</b> puis ${rw}.</p><div class="eq">Adresse = 0x${K.hex(a)} = <b>${a}</b> ; R/W = <b>${rw}</b> : ${rw?'lecture':'écriture'}</div><p>Le neuvième bit à 0 est l’acquittement : c’est l’esclave qui tire SDA au niveau bas. L’octet complet émis par le maître vaut 0x${K.hex(a*2+rw)}.</p>`,
 jury:`Les rapports de l’interne 2024 à 2026 et de l’externe relèvent que le bus I2C est méconnu des candidats, alors qu’il équipe la plupart des capteurs des sujets.`};}});
Q.bts.push({t:'Trame Modbus RTU',gen(){const b=pick([9600,19200,38400]),n=8;
 return {text:`Un automate interroge un variateur en Modbus RTU à ${fmt(b,6)} bit/s. Chaque caractère occupe 11 bits. La requête compte ${n} octets.`,fig:hexF(['esclave','fonction','adr. H','adr. L','nb H','nb L','CRC L','CRC H'].map(x=>x),['1','1','1','1','1','1','1','1']),fields:[{l:'Durée de la requête',u:'ms',a:n*11e3/b,tol:.02},{l:'Silence minimal entre deux trames',u:'ms',a:3.5*11e3/b,tol:.02}],hint:`Le silence vaut 3,5 caractères.`,
 corr:`<div class="eq">${n} × 11 = ${n*11} bits ; ${fr(n*11,fmt(b,6))} = <b>${fmt(n*11e3/b)} ms</b></div><div class="eq">Silence : 3,5 × 11 = 38,5 bits ; ${fr('38,5',fmt(b,6))} = <b>${fmt(3.5*11e3/b)} ms</b></div>`};}});
Q.bts.push({t:'Charge d’un bus CAN',gen(){const n=pick([1,2,4,8]),b=pick([125,250,500]),N=pick([100,200,400]),bits=47+8*n,d=bits/b;
 return {text:`Sur un bus CAN à ${b} kbit/s circulent ${N} trames par seconde, chacune avec ${n} octet${n>1?'s':''} de données. On néglige les bits de bourrage.`,fig:canF(n),fields:[{l:'Bits par trame, intervalle compris',u:'bits',a:bits,abs:.1},{l:'Durée d’une trame',u:'µs',a:d*1e3,tol:.02},{l:'Charge du bus',u:'%',a:N*d/10,tol:.03}],hint:`Additionner les champs de la figure.`,
 corr:`<div class="eq">1 + 11 + 1 + 1 + 1 + 4 + ${8*n} + 15 + 1 + 2 + 7 + 3 = <b>${bits} bits</b></div><div class="eq">${V('T')} = ${fr(bits,`${b} × 10³`)} = <b>${fmt(d*1e3)} µs</b> ; charge = ${N} × ${fmt(d*1e3)} × 10⁻⁶ = <b>${fmt(N*d/10)} %</b></div>`};}});
Q.bts.push({t:'Lecture SPI d’un capteur de température',gen(){const c=pick([ri(-640,-16),ri(160,1600)]),raw=(c&0xFFF)<<4,hi=raw>>8,lo=raw&0xFF;
 return {text:`Un capteur lu en SPI renvoie deux octets, poids fort en premier. La température est codée sur les 12 bits de gauche, en complément à deux, avec une résolution de 0,0625 °C. Les 4 bits de droite sont inutilisés.`,fig:hexF([hi,lo],['premier octet reçu','second octet reçu']),fields:[{l:'Valeur signée sur 12 bits',u:'',a:c,abs:.1},{l:'Température',u:'°C',a:c*.0625,abs:.07}],hint:`Assembler les 16 bits, décaler de 4 bits vers la droite, puis traiter le signe.`,
 corr:`<p>Mot de 16 bits : 0x${K.hex(raw,4)}. On retire les 4 bits de droite : 0x${K.hex(c&0xFFF,3)} = ${c&0xFFF}.</p><div class="eq">${c<0?`Bit de poids fort à 1 : ${c&0xFFF} − 4096 = <b>${fmt(c,5)}</b>`:`Bit de poids fort à 0 : valeur positive, <b>${c}</b>`}</div><div class="eq">θ = ${fmt(c,5)} × 0,0625 = <b>${fmt(c*.0625,4)} °C</b></div>`,
 jury:`Les jurys notent que le bus SPI est mal exploité alors même que le sujet en fournit la documentation. La réponse se construit en lisant la documentation fournie : ordre des octets, justification des bits, résolution.`};}});
Q.bts.push({t:'Résistances de tirage I2C',gen(){const Vdd=pick([3.3,5]),Cb=pick([50,100,200,400]),m=pick([[1000,'standard, 100 kbit/s'],[300,'rapide, 400 kbit/s']]),Rmin=(Vdd-.4)/3,Rmax=m[0]*1e-9/(.8473*Cb*1e-12)/1e3;
 return {text:`Bus I2C en mode ${m[1]} : temps de montée maximal ${m[0]} ns. Un circuit peut absorber 3 mA en maintenant le niveau bas à 0,4 V. Entre quelles valeurs choisir les résistances de tirage ?`,fig:pullF(fmt(Vdd),Cb),fields:[{l:'Résistance minimale',u:'kΩ',a:Rmin,tol:.03},{l:'Résistance maximale',u:'kΩ',a:Rmax,tol:.03}],hint:`Minimum : ne pas dépasser 3 mA au niveau bas. Maximum : charger la capacité du bus assez vite (tr = 0,8473 · Rp · Cb).`,
 corr:`<div class="eq">${V('R<sub>p min</sub>')} = ${fr('V<sub>dd</sub> − 0,4','3 × 10⁻³')} = ${fr(fmt(Vdd-.4),'3 × 10⁻³')} = <b>${fmt(Rmin)} kΩ</b></div><div class="eq">${V('R<sub>p max</sub>')} = ${fr('t<sub>r</sub>','0,8473 · C<sub>b</sub>')} = ${fr(`${m[0]} × 10⁻⁹`,`0,8473 × ${Cb} × 10⁻¹²`)} = <b>${fmt(Rmax)} kΩ</b></div><p>${Rmax<Rmin?'La borne maximale est inférieure à la borne minimale : ce bus est trop capacitif pour ce débit. Il faut réduire la longueur ou le débit.':'Le coefficient 0,8473 vient de la charge exponentielle entre 30 % et 70 % de la tension : ln(0,7 / 0,3).'}</p>`};}});
/* ----- Agrégation ----- */
Q.agreg.push({t:'Calcul d’un CRC',src:'Notion citée par les jurys de l’interne et de l’externe',gen(){const m=ri(129,254),g=[1,0,1,1],d=K.bin(m).split('').map(Number).concat([0,0,0]),st=[];
 for(let i=0;i<8;i++)if(d[i]){for(let k=0;k<4;k++)d[i+k]^=g[k];st.push(' '.repeat(i)+'1011  →  '+d.join(''));}
 const crc=d[8]*4+d[9]*2+d[10];
 return {text:`Un octet est protégé par un CRC de polynôme générateur ${V('x')}³ + ${V('x')} + 1, soit 1011. Calculer le CRC à transmettre après l’octet.`,fig:K.svg(40+11*46,96,K.frame(K.bin(m).split('').map(b=>[b,46,b=='1'?'#cfe6ef':'#fff','']).concat([['?',46,'#f3d9bd',''],['?',46,'#f3d9bd',''],['?',46,'#f3d9bd','']]),20,20,36)+K.t(20+4*46,78,'message',{fs:12,c:'#42596b'})+K.t(20+9.5*46,78,'CRC',{fs:12,c:'#42596b'}),'message et CRC'),fields:[{l:'CRC (valeur décimale des 3 bits)',u:'',a:crc,abs:.1}],hint:`Ajouter trois zéros au message, puis soustraire 1011 par OU exclusif sous chaque 1 de tête.`,
 corr:`<p>Le générateur est de degré 3 : on ajoute trois zéros, ${K.bin(m)} 000, puis on divise. Sous chaque 1 de tête, on applique un OU exclusif avec 1011 :</p><pre class="code">${st.join('\n')}</pre><p>Reste sur les trois derniers bits : <b>${K.bin(crc,3)}</b>, soit <b>${crc}</b>. Trame émise : ${K.bin(m)} ${K.bin(crc,3)}. Le récepteur refait la division sur les 11 bits : un reste nul indique une trame sans erreur détectée.</p>`,
 jury:`Le CRC fait partie des notions de transmission numérique relevées comme non maîtrisées (interne 2024 à 2026, externe 2024 à 2026). La division se pose à la main, sans retenue : c’est une suite de OU exclusifs.`};}});
Q.agreg.push({t:'Bits de bourrage d’une trame CAN',src:'Bus CAN : thème des épreuves de spécialité',gen(){let bits=[],v=pick([0,1]);const runs=[pick([5,6,7]),ri(1,3),pick([5,10,11]),ri(1,4),ri(2,4)].sort(()=>Math.random()-.5);for(const r of runs){for(let i=0;i<r;i++)bits.push(v);v^=1;}
 let n=0,cnt=0,last=-1;const out=[];for(const b of bits){if(b===last)cnt++;else{cnt=1;last=b;}out.push(b);if(cnt==5){out.push(1-b);n++;last=1-b;cnt=1;}}
 const w=Math.min(26,620/bits.length);
 return {text:`Voici une suite de ${bits.length} bits qu’un nœud CAN doit émettre. Combien de bits de bourrage l’émetteur insère-t-il, et combien de bits circulent sur le bus ?`,fig:K.svg(40+bits.length*w,96,K.chrono(bits,20,20,w,36)+bits.map((b,i)=>K.t(20+i*w+w/2,76,b,{fs:11,c:'#42596b'})+dash(20+i*w,14,62)).join(''),'suite de bits'),fields:[{l:'Bits de bourrage',u:'',a:n,abs:.1},{l:'Bits sur le bus',u:'',a:bits.length+n,abs:.1}],hint:`Après 5 bits identiques, un bit opposé est inséré, et il compte comme premier bit de la série suivante.`,
 corr:`<p>Suite à émettre : ${bits.join('')}</p><p>Suite sur le bus : ${out.join('')}</p><div class="eq"><b>${n}</b> bit${n>1?'s':''} de bourrage ; ${bits.length} + ${n} = <b>${bits.length+n} bits</b></div><p>Le bourrage garantit des fronts réguliers pour resynchroniser les horloges des nœuds. Piège : le bit inséré peut lui-même lancer une nouvelle série de 5.</p>`};}});
Q.agreg.push({t:'Débit et point d’échantillonnage CAN',src:'Configuration d’un contrôleur CAN',gen(){const tq=pick([125,250,500]),s=pick([[13,2],[11,4],[5,2],[12,3],[6,1]]),tot=1+s[0]+s[1];
 return {text:`Un contrôleur CAN est réglé avec un quantum de temps de ${tq} ns. Le bit comprend 1 quantum de synchronisation, ${s[0]} quanta avant le point d’échantillonnage (segment 1) et ${s[1]} après (segment 2).`,fig:K.svg(680,90,K.frame([['synchro',60,'#fff','1'],['segment 1',Math.round(560*s[0]/(s[0]+s[1])),'#cfe6ef',`${s[0]} quanta`],['segment 2',Math.round(560*s[1]/(s[0]+s[1])),'#f3d9bd',`${s[1]} quanta`]],20,16,36)+K.ar(80+Math.round(560*s[0]/(s[0]+s[1])),86,80+Math.round(560*s[0]/(s[0]+s[1])),56,'#c9483b','',0,0),'découpage du bit'),fields:[{l:'Débit',u:'kbit/s',a:1e6/(tot*tq),tol:.02},{l:'Position du point d’échantillonnage',u:'%',a:100*(1+s[0])/tot,abs:.6}],hint:`Durée du bit = nombre total de quanta × durée d’un quantum.`,
 corr:`<div class="eq">${V('T<sub>bit</sub>')} = (1 + ${s[0]} + ${s[1]}) × ${tq} ns = ${tot*tq} ns ; débit = ${fr(1,`${tot*tq} × 10⁻⁹`)} = <b>${fmt(1e6/(tot*tq))} kbit/s</b></div><div class="eq">Point d’échantillonnage : ${fr(`1 + ${s[0]}`,tot)} = <b>${fmt(100*(1+s[0])/tot)} %</b> du bit</div><p>Un point d’échantillonnage tardif (vers 87,5 %) laisse le temps au signal de se propager sur un bus long.</p>`};}});
Q.agreg.push({t:'Arbitrage sur un bus CAN',src:'Bus CAN : accès au support',gen(){let ids;do{const base=ri(1,15)<<7;ids=[base|ri(0,127),base|ri(0,127),ri(256,2040)];}while(new Set(ids).size<3);ids.sort(()=>Math.random()-.5);const win=Math.min(...ids),lose=Math.max(...ids),bus=ids.reduce((a,b)=>a&b);let pos=0;
 /* le bus à chaque bit = ET des nœuds encore en lice */
 let alive=ids.slice();const out=[];for(let i=10;i>=0;i--){const lvl=alive.reduce((a,x)=>a&(x>>i&1),1);for(const x of alive.slice())if((x>>i&1)!=lvl){alive=alive.filter(y=>y!=x);out.push([x,11-i]);}}
 const noms=['Nœud A','Nœud B','Nœud C'];pos=out.find(o=>o[0]==lose)[1];
 return {text:`Trois nœuds commencent à émettre en même temps. La figure montre l’identifiant sur 11 bits que chacun veut émettre (niveau bas = 0 = dominant). Quel identifiant passe, et à quel bit le nœud d’identifiant le plus élevé se retire-t-il ?`,fig:arbF(ids,noms).replace(/<text[^>]*>Bus<\/text><path[^>]*\/>/,''),fields:[{l:'Identifiant qui gagne (décimal)',u:'',a:win,abs:.1},{l:'Rang du bit où le nœud le moins prioritaire se retire',u:'',a:pos,abs:.1}],hint:`Un nœud se retire dès qu’il émet un 1 alors qu’un autre émet un 0.`,
 corr:`<p>Identifiants : ${ids.map((x,k)=>`${noms[k]} = ${K.bin(x,11)} (${x})`).join(' ; ')}.</p><p>Le bus porte à chaque bit le niveau dominant parmi les nœuds encore en lice. ${out.map(o=>`${noms[ids.indexOf(o[0])]} se retire au bit ${o[1]}`).join(' ; ')}.</p><div class="eq">Gagnant : identifiant <b>${win}</b> (0x${K.hex(win,3)}), le plus petit. Le nœud d’identifiant ${lose} se retire au bit <b>${pos}</b>.</div><p>L’arbitrage ne détruit aucune trame : le gagnant n’a rien perdu, les autres réémettront.</p>`};}});
Q.agreg.push({t:'Durée d’une lecture I2C',src:'I2C : protocole que les jurys jugent méconnu',gen(){const N=pick([1,2,6]),f=pick([100,400]),ck=9*(3+N);
 return {text:`Un microcontrôleur lit ${N} octet${N>1?'s':''} dans un registre d’un capteur I2C, à ${f} kHz. Combien de périodes d’horloge faut-il, et combien de temps dure l’échange (conditions de départ et d’arrêt négligées) ?`,fig:K.svg(700,90,K.frame([['S',26,'#f3d9bd',''],['adresse + W',104,'#cfe6ef','8 + 1'],['registre',84,'#cfe6ef','8 + 1'],['Sr',30,'#f3d9bd',''],['adresse + R',104,'#cfe6ef','8 + 1'],[`${N} octet${N>1?'s':''} lu${N>1?'s':''}`,150,'#eef5f8',`${N} × (8 + 1)`],['P',26,'#f3d9bd','']],20,16,36),'lecture d’un registre'),fields:[{l:'Périodes d’horloge',u:'',a:ck,abs:.1},{l:'Durée de l’échange',u:'µs',a:ck*1e3/f,tol:.02}],hint:`Chaque octet est suivi d’un bit d’acquittement.`,
 corr:`<p>Il faut d’abord écrire le numéro du registre, puis redémarrer en lecture :</p><div class="eq">(1 + 1 + 1 + ${N}) octets × 9 bits = <b>${ck} périodes</b></div><div class="eq">${V('t')} = ${fr(ck,`${f} × 10³`)} = <b>${fmt(ck*1e3/f)} µs</b></div><p>Le maître acquitte chaque octet lu sauf le dernier, puis émet la condition d’arrêt.</p>`,
 jury:`Rapports de l’interne 2024 à 2026 : le bus I2C est méconnu. La séquence écriture du registre, redémarrage, lecture est le schéma à savoir restituer.`};}});
Q.agreg.push({open:true,t:'Rédaction : choisir un bus',src:'Attendus des rapports : justifier un choix par des critères',gen(){const c=pick([['une carte électronique où un microcontrôleur lit six capteurs de température placés à quelques centimètres','I2C'],['un véhicule où dix calculateurs échangent des consignes sur 20 m de câble, dans un environnement très parasité','CAN'],['une carte où un microcontrôleur doit lire un convertisseur analogique-numérique à 1 million d’échantillons par seconde','SPI']]);
 return {text:`On doit relier les éléments suivants : ${c[0]}. <b>Parmi I2C, SPI et CAN, quel bus choisir ? Justifier par au moins trois critères, et dire pourquoi les deux autres conviennent moins bien.</b>`,fig:K.svg(600,150,K.frame([['',90,'#fff'],['I2C',160,'#cfe6ef'],['SPI',160,'#cfe6ef'],['CAN',160,'#cfe6ef']],15,10,30)+K.frame([['fils',90,'#fff'],['2',160,'#fff'],['3 + 1 par esclave',160,'#fff'],['1 paire différentielle',160,'#fff']],15,40,30)+K.frame([['débit',90,'#fff'],['0,1 à 3,4 Mbit/s',160,'#fff'],['dizaines de Mbit/s',160,'#fff'],['jusqu’à 1 Mbit/s',160,'#fff']],15,70,30)+K.frame([['portée',90,'#fff'],['une carte',160,'#fff'],['une carte',160,'#fff'],['dizaines de mètres',160,'#fff']],15,100,30),'comparaison des bus'),fields:[],hint:'',
 corr:`<p><b>Choix : ${c[1]}.</b></p>${c[1]=='I2C'?`<p>Critères : deux fils seulement pour tous les capteurs, chacun repéré par son adresse ; distance courte, compatible avec la capacité maximale du bus ; débit de 100 ou 400 kbit/s largement suffisant pour une température, grandeur lente.</p><p>SPI demanderait un fil de sélection par capteur, soit six fils de plus, pour un débit inutile ici. CAN impose un émetteur-récepteur par nœud et vise les longues distances : surdimensionné sur une carte.</p>`:c[1]=='CAN'?`<p>Critères : transmission différentielle, donc robuste aux parasites ; portée de plusieurs dizaines de mètres ; plusieurs maîtres avec arbitrage sans collision destructive et priorité par identifiant ; détection d’erreur par CRC et acquittement.</p><p>I2C et SPI sont des bus de carte : niveaux non différentiels, portée limitée par la capacité des fils, un seul maître en pratique, aucune détection d’erreur intégrée.</p>`:`<p>Critères : débit de plusieurs dizaines de Mbit/s, nécessaire ici (12 à 16 bits par échantillon, soit plus de 12 Mbit/s) ; liaison synchrone simple, sans adresse ni acquittement, donc sans temps perdu ; un seul esclave, donc un seul fil de sélection.</p><p>I2C plafonne à 3,4 Mbit/s et perd du temps en adresse et acquittements. CAN est limité à 1 Mbit/s.</p>`}`,
 jury:`Externe 2023 : il ne faut jamais inventer une réponse sur un protocole inconnu. Les rapports attendent un choix justifié par des critères techniques (débit, distance, nombre de fils, robustesse), pas une affirmation.`};}});
NOTIONS.push({id:'bus',name:'Bus et trames',desc:'Binaire, hexadécimal, complément à deux, liaison série, I2C, SPI, Modbus, CAN, CRC.',jury:'Cité dans 6 rapports : I2C méconnu, CRC et complément à deux non maîtrisés. La partie informatique n’est abordée que par 40 % des candidats (interne 2024).',levels:LV.map(L=>({id:L.id,name:L.name,sub:L.sub,fiche:L.fiche,qs:Q[L.id]}))});

/* ================= COURS ================= */
const N=NOTIONS.find(n=>n.id=='bus');
N.cours=[
{t:'Compter avec des interrupteurs',p:[
 `Un fil ne sait dire que deux choses : tension présente (1) ou absente (0). Pour transmettre un nombre, on aligne plusieurs fils, ou plusieurs instants. Chaque position vaut le double de la précédente, comme les billets : 1, 2, 4, 8, 16…`,
 `L’hexadécimal n’est qu’un raccourci d’écriture : on regroupe les bits par quatre et on donne un seul caractère à chaque paquet.`],
 sim:{s:[{l:'Nombre',min:0,max:255,step:1,v:172}],draw:n=>bitsF(n,8),
  out:n=>`${n} = ${K.bin(n).split('').map((b,i)=>b=='1'?2**(7-i):null).filter(x=>x).join(' + ')||0} = <b>${K.bin(n).slice(0,4)} ${K.bin(n).slice(4)}</b> en binaire = <b>0x${K.hex(n)}</b> en hexadécimal.`},
 keep:[`${V('n')} bits : 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1.`,`Un caractère hexadécimal = 4 bits. Un octet = 2 caractères.`],go:[0,0]},
{t:'Les nombres négatifs : le compteur qui repasse par zéro',p:[
 `Un compteur kilométrique à trois chiffres qui recule d’un cran depuis 000 affiche 999. On décide alors que 999 veut dire −1. Le complément à deux fait la même chose en binaire : sur 8 bits, 1111 1111 veut dire −1.`,
 `Conséquence pratique : si le bit de gauche vaut 1, le nombre est négatif et il suffit de retirer 256 (ou 4096 sur 12 bits, 65 536 sur 16 bits).`],
 sim:{s:[{l:'Valeur signée',min:-128,max:127,step:1,v:-20}],draw:n=>bitsF(n&255,8),
  out:n=>`${fmt(n,4)} s’écrit <b>${K.bin(n&255)}</b>, soit 0x${K.hex(n&255)}. Lu sans signe, cet octet vaut ${n&255}${n<0?` ; ${n&255} − 256 = ${fmt(n,4)}`:' : bit de gauche à 0, le nombre est positif'}.`},
 keep:[`Bit de poids fort à 1 : valeur = code − 2<sup>n</sup>.`,`Sur 8 bits : de −128 à +127.`],go:[1,3]},
{t:'La liaison série : parler à cadence fixe',p:[
 `Deux appareils se mettent d’accord sur une cadence, par exemple 9600 bits par seconde. Au repos la ligne est à 1. Pour annoncer un octet, l’émetteur met la ligne à 0 pendant un bit : c’est le <b>start</b>. Il envoie ensuite les 8 bits, <b>le plus petit poids en premier</b>, puis remet la ligne à 1 : c’est le <b>stop</b>.`],
 sim:{s:[{l:'Octet envoyé',min:0,max:255,step:1,v:75}],draw:n=>uartF(n),
  out:n=>`Octet ${n} = 0x${K.hex(n)} = ${K.bin(n)}. Sur la ligne, dans l’ordre du temps : 0 (start), ${K.bin(n).split('').reverse().join(' ')}, 1 (stop).`},
 keep:[`8N1 : 1 start + 8 données + 1 stop = 10 bits par octet.`,`Le premier bit après le start est le bit de poids faible.`],go:[1,0]},
{t:'I2C : deux fils et des adresses',p:[
 `Sur un bus I2C, tous les circuits sont branchés sur les deux mêmes fils : SDA pour les données, SCL pour l’horloge. Le maître commence par appeler un esclave par son <b>adresse</b> sur 7 bits, suivie d’un bit qui dit s’il veut écrire (0) ou lire (1). L’esclave concerné répond en tirant SDA à 0 : c’est l’acquittement.`,
 `Personne ne pousse la ligne à 1 : ce sont des résistances de tirage qui la remontent. Trop grandes, le signal remonte trop lentement ; trop petites, les circuits n’arrivent plus à tirer la ligne à 0.`],
 fig:()=>i2cF([1,0,0,1,0,0,0,1,0]),
 keep:[`SDA se lit quand SCL est à 1.`,`Chaque octet coûte 9 périodes d’horloge : 8 bits + l’acquittement.`,`Lire un registre : adresse + écriture, numéro du registre, redémarrage, adresse + lecture, données.`],go:[2,0]},
{t:'SPI, I2C, CAN : qui pour quoi ?',p:[
 `Trois bus, trois métiers. <b>SPI</b> : le plus rapide, pour une carte, avec un fil de sélection par esclave. <b>I2C</b> : le plus économe en fils, pour beaucoup de petits capteurs lents sur une carte. <b>CAN</b> : le plus robuste, pour relier des calculateurs éloignés dans un environnement parasité.`],
 fig:()=>K.svg(600,150,K.frame([['',90,'#fff'],['I2C',160,'#cfe6ef'],['SPI',160,'#cfe6ef'],['CAN',160,'#cfe6ef']],15,10,30)+K.frame([['fils',90,'#fff'],['2',160,'#fff'],['3 + 1 par esclave',160,'#fff'],['1 paire différentielle',160,'#fff']],15,40,30)+K.frame([['débit',90,'#fff'],['0,1 à 3,4 Mbit/s',160,'#fff'],['dizaines de Mbit/s',160,'#fff'],['jusqu’à 1 Mbit/s',160,'#fff']],15,70,30)+K.frame([['repérage',90,'#fff'],['adresse sur 7 bits',160,'#fff'],['fil de sélection',160,'#fff'],['identifiant du message',160,'#fff']],15,100,30),'comparaison des bus'),
 keep:[`Devant un protocole inconnu, lire la documentation fournie dans le sujet et ne rien inventer (externe 2023).`],go:[2,3]},
{t:'CAN : celui qui dit 0 gagne',p:[
 `Sur un bus CAN, plusieurs nœuds peuvent se mettre à parler en même temps. Chacun écoute ce qu’il émet. Le niveau 0 est <b>dominant</b> : si un nœud émet 0 pendant qu’un autre émet 1, le bus est à 0. Celui qui a émis 1 voit qu’il ne s’est pas fait entendre et se tait.`,
 `Résultat : le message dont l’identifiant est le plus petit passe toujours, sans que rien ne soit détruit.`],
 sim:{s:[{l:'Identifiant du nœud A',min:1,max:2047,step:1,v:805},{l:'Identifiant du nœud B',min:1,max:2047,step:1,v:789}],draw:(a,b)=>arbF([a,b],['Nœud A','Nœud B']),
  out:(a,b)=>{if(a==b)return 'Deux nœuds ne doivent jamais émettre le même identifiant.';let i=10;while((a>>i&1)==(b>>i&1))i--;return `Les deux identifiants sont identiques jusqu’au bit ${10-i}. Au bit <b>${11-i}</b>, le ${a<b?'nœud B':'nœud A'} émet 1 et relit 0 : il se retire. Le message <b>${Math.min(a,b)}</b> passe.`;}},
 keep:[`Identifiant le plus petit = priorité la plus haute.`,`Après 5 bits identiques, un bit opposé est inséré pour garder des fronts : c’est le bourrage.`],go:[3,3]},
{t:'Le CRC : la preuve par neuf du numérique',p:[
 `Pour vérifier une addition, on faisait la preuve par neuf : un petit calcul sur le résultat, qui trahit la plupart des erreurs. Le CRC est le même principe. L’émetteur divise le message par un nombre convenu et envoie le <b>reste</b> à la suite du message. Le récepteur refait la division : si le reste ne colle pas, la trame est jetée.`,
 `La division se fait sans retenue : chaque soustraction est un simple OU exclusif, bit à bit.`,
 `Exemple : message 1101, générateur 1011. On ajoute trois zéros : 1101000. 1101 ⊕ 1011 = 0110 ; on descend : 1100 ⊕ 1011 = 0111 ; 1110 ⊕ 1011 = 0101 ; 1010 ⊕ 1011 = 001. Reste : 001. Trame émise : 1101 001.`],
 keep:[`Nombre de bits du CRC = degré du polynôme générateur.`,`Les jurys citent le CRC, le complément à deux et I2C parmi les notions non maîtrisées : la partie informatique n’est abordée que par 40 % des candidats à l’interne 2024, c’est un réservoir de points.`],go:[3,0]}
];
})();
