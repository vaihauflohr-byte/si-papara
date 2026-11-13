/* Outils de dessin partagés par les notions (schémas, chronogrammes, listings) */
const K={
 svg:(W,H,b,alt)=>`<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${alt||'schéma'}">${b}</svg>`,
 w:(d,c,sw)=>`<path d="${d}" fill="none" stroke="${c||'#183047'}" stroke-width="${sw||1.6}"/>`,
 t:(x,y,s,o)=>{o=o||{};return `<text x="${x}" y="${y}" font-size="${o.fs||13}" text-anchor="${o.a||'middle'}" fill="${o.c||'#183047'}"${o.b?' font-weight="700"':''}>${s}</text>`;},
 /* composant horizontal centré en (x,y) : boîte 64 x 24, étiquette au-dessus */
 rh:(x,y,l)=>`<rect x="${x-32}" y="${y-12}" width="64" height="24" rx="4" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/>${l?K.t(x,y-18,l):''}`,
 /* composant vertical centré en (x,y) : boîte 24 x 64, étiquette à droite (ou à gauche si g) */
 rv:(x,y,l,g)=>`<rect x="${x-12}" y="${y-32}" width="24" height="64" rx="4" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/>${l?K.t(g?x-18:x+18,y+4,l,{a:g?'end':'start'}):''}`,
 box:(x,y,w,h,l,o)=>{o=o||{};return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r==null?6:o.r}" fill="${o.f||'#eef5f8'}" stroke="${o.s||'#12566f'}" stroke-width="1.6"/>${l!=null?K.t(x+w/2,y+h/2+5,l,{fs:o.fs||13,c:o.c}):''}`;},
 dot:(x,y)=>`<circle cx="${x}" cy="${y}" r="3.2" fill="#183047"/>`,
 gnd:(x,y)=>K.w(`M${x} ${y}V${y+8}M${x-12} ${y+8}H${x+12}M${x-7} ${y+13}H${x+7}M${x-3} ${y+18}H${x+3}`),
 /* source de tension continue verticale centrée en (x,y) */
 vs:(x,y,l)=>`<circle cx="${x}" cy="${y}" r="18" fill="#fff" stroke="#183047" stroke-width="1.6"/>${K.t(x,y-3,'+',{fs:14})}${K.t(x,y+13,'−',{fs:14})}${l?K.t(x-26,y+5,l,{a:'end'}):''}`,
 ar:(x1,y1,x2,y2,c,l,dx,dy)=>{c=c||'#c9483b';const a=Math.atan2(y2-y1,x2-x1),h=9;return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.2"/><path d="M${x2} ${y2}L${x2-h*Math.cos(a-.4)} ${y2-h*Math.sin(a-.4)}L${x2-h*Math.cos(a+.4)} ${y2-h*Math.sin(a+.4)}Z" fill="${c}"/>${l?`<text x="${x2+(dx==null?8:dx)}" y="${y2+(dy==null?4:dy)}" font-size="13" fill="${c}">${l}</text>`:''}`;},
 /* amplificateur opérationnel : pointe en (x+70,y), entrées en (x,y-18) et (x,y+18) ; inv=true : entrée − en haut */
 aop:(x,y,inv)=>`<path d="M${x} ${y-36}V${y+36}L${x+70} ${y}Z" fill="#fff" stroke="#183047" stroke-width="1.8"/>${K.t(x+11,y-13,inv?'−':'+',{fs:15})}${K.t(x+11,y+23,inv?'+':'−',{fs:15})}`,
 /* chronogramme logique : bits = tableau de 0/1, largeur w par bit, niveau haut en y, bas en y+h */
 chrono:(bits,x,y,w,h,c)=>{let d=`M${x} ${bits[0]?y:y+h}`;bits.forEach((b,i)=>{const yy=b?y:y+h;d+=`V${yy}H${x+(i+1)*w}`;});return K.w(d,c||'#12566f',2.2);},
 /* cases d'une trame : items = [[texte, largeur, couleur?]...] */
 frame:(items,x,y,h)=>{let s='',xx=x;for(const [l,w,f,sub] of items){s+=K.box(xx,y,w,h||34,l,{f:f||'#eef5f8',r:2,fs:12});if(sub)s+=K.t(xx+w/2,y+(h||34)+15,sub,{fs:11,c:'#42596b'});xx+=w;}return s;},
 code:(lines)=>`<pre class="code">${lines.map((l,i)=>`<span class="ln">${i+1}</span>${l.replace(/&/g,'&amp;').replace(/</g,'&lt;')}`).join('\n')}</pre>`,
 lg:(c,t)=>`<span class="lg" style="background:${c}"></span>${t}`,
 ax:m=>{const p=10**Math.floor(Math.log10(m)),r=m/p,s=(r<=2?.5:r<=5?1:2)*p;return {y1:Math.ceil(m*1.05/s)*s,dy:s/2};},
 hex:(n,d)=>n.toString(16).toUpperCase().padStart(d||2,'0'),
 bin:(n,d)=>n.toString(2).padStart(d||8,'0')
};
const MU0=4e-7*Math.PI;
