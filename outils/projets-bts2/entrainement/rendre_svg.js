// rend un SVG en PNG haute définition : node rendre_svg.js entree.svg sortie.png [echelle]
// (seulement quand le synoptique change : le PNG est rangé à côté du SVG, dans src/)
const { chromium } = require("playwright");   // npm : playwright
const fs = require("fs");
(async () => {
  const svg = fs.readFileSync(process.argv[2], "utf8");
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const w = +m[1], h = +m[2], k = +(process.argv[4] || 2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: k });
  await p.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
  await p.screenshot({ path: process.argv[3], clip: { x: 0, y: 0, width: w, height: h } });
  await b.close();
})();
