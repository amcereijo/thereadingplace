import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f766e"/>
      <stop offset="100%" style="stop-color:#14b8a6"/>
    </linearGradient>
  </defs>
  <path d="M4 4h24a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="url(#tealGradient)"/>
  <path d="M4 6v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <path d="M6 8h20v16H6z" fill="white" opacity="0.15"/>
  <path d="M22 4v8l4 3-4 3v8" fill="none" stroke="url(#tealGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="10" cy="20" r="2.5" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  <circle cx="16" cy="20" r="2.5" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  <path d="M12.5 20h3.5" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const publicDir = resolve(__dirname, '../public');
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Generate additional sizes for PWA manifest
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const pngBuffer = await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(resolve(publicDir, `favicon-${size}x${size}.png`), pngBuffer);
  console.log(`Created favicon-${size}x${size}.png`);
}

console.log('\nManifest icons generated!');
