// Renders index.html (print styles) to pdf/Portfolio-M-Luthfi-Aditya-Putra.pdf.
// Usage: node scripts/build-pdf.js   (needs the `playwright` package)
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'pdf', 'Portfolio-M-Luthfi-Aditya-Putra.pdf');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'networkidle' });
  // load lazy images and web fonts before printing
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    await Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
    await document.fonts.ready;
  });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('wrote', path.relative(root, out));
})().catch(e => { console.error(e); process.exit(1); });
