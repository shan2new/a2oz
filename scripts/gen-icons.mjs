// Regenerate all rasterized brand assets from SVG sources.
// Run with: npm run build:icons
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out  = (...p) => resolve(root, 'public', ...p);

const MARK_PATH = 'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z';
const BRAND   = '#863bff';
const MARK_W  = 48;
const MARK_H  = 46;

// Rounded tile (transparent outside corners). Used for favicon.ico / "any" PWA icons.
function tileRoundedSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${BRAND}"/>
  <g transform="translate(8 9)"><path fill="#fff" d="${MARK_PATH}"/></g>
</svg>`);
}

// Full-bleed solid square (no rounding). The OS rounds it (iOS) or masks it (Android).
// `coverage` controls how much of the canvas the mark fills (0–1).
function tileFullBleedSvg(coverage = 0.62) {
  // Mark is MARK_W × MARK_H. Scale so MARK_W maps to coverage * 100.
  const scale = (coverage * 100) / MARK_W;
  const w = MARK_W * scale;
  const h = MARK_H * scale;
  const tx = (100 - w) / 2;
  const ty = (100 - h) / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BRAND}"/>
  <g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(4)})">
    <path fill="#fff" d="${MARK_PATH}"/>
  </g>
</svg>`);
}

// 1200×630 OG card: brand-colored bg, mark left-of-center, wordmark.
function ogSvg() {
  const W = 1200, H = 630;
  const markScale = 5; // 48*5 = 240 px
  const markW = MARK_W * markScale;
  const markH = MARK_H * markScale;
  const markX = 240;
  const markY = (H - markH) / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a463ff"/>
      <stop offset="1" stop-color="#5a14e6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g transform="translate(${markX} ${markY}) scale(${markScale})">
    <path fill="#fff" d="${MARK_PATH}"/>
  </g>
  <text x="540" y="${H/2 + 20}" font-family="Geist, -apple-system, system-ui, sans-serif" font-size="120" font-weight="600" fill="#fff" letter-spacing="-2">a2oz</text>
  <text x="540" y="${H/2 + 80}" font-family="Geist, -apple-system, system-ui, sans-serif" font-size="32" font-weight="400" fill="#fff" opacity="0.75">Reimagined</text>
</svg>`);
}

async function svgToPng(svg, size) {
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  const rounded = tileRoundedSvg();
  const fullBleed = tileFullBleedSvg(0.62);          // safe for maskable / Apple
  const fullBleedTight = tileFullBleedSvg(0.72);     // a touch larger for OG-style standalone

  // PWA "any" — keeps rounded tile, transparent outside corners
  const pngAny192  = await svgToPng(rounded, 192);
  const pngAny512  = await svgToPng(rounded, 512);

  // PWA "maskable" — full-bleed, generous safe zone
  const pngMaskable512 = await svgToPng(fullBleed, 512);

  // Apple touch icon — full-bleed (iOS rounds it)
  const pngApple = await svgToPng(fullBleedTight, 180);

  // ICO sources — rounded tile rasterized at three sizes
  const ico16 = await svgToPng(rounded, 16);
  const ico32 = await svgToPng(rounded, 32);
  const ico48 = await svgToPng(rounded, 48);
  const ico   = await pngToIco([ico16, ico32, ico48]);

  // OG card
  const og = await sharp(ogSvg(), { density: 192 }).png().toBuffer();

  await Promise.all([
    writeFile(out('icon-192.png'),          pngAny192),
    writeFile(out('icon-512.png'),          pngAny512),
    writeFile(out('icon-512-maskable.png'), pngMaskable512),
    writeFile(out('apple-touch-icon.png'),  pngApple),
    writeFile(out('favicon.ico'),           ico),
    writeFile(out('og-image.png'),          og),
  ]);

  console.log('Wrote:');
  for (const f of ['icon-192.png','icon-512.png','icon-512-maskable.png','apple-touch-icon.png','favicon.ico','og-image.png']) {
    console.log('  public/' + f);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
