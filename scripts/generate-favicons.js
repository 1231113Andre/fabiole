/**
 * Generate favicons from logo.png
 * Creates all standard favicon sizes for web and mobile
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Paths relative to project root (script is in /scripts)
const PROJECT_ROOT = path.join(__dirname, '..');
const SOURCE = path.join(PROJECT_ROOT, 'public/images/logo.png');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public');
const APP_OUTPUT = path.join(PROJECT_ROOT, 'src/app');

// Standard favicon sizes
const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-128x128.png', size: 128 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-256x256.png', size: 256 },
    { name: 'favicon-512x512.png', size: 512 },
    // Apple Touch Icons
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-57x57.png', size: 57 },
    { name: 'apple-touch-icon-60x60.png', size: 60 },
    { name: 'apple-touch-icon-72x72.png', size: 72 },
    { name: 'apple-touch-icon-76x76.png', size: 76 },
    { name: 'apple-touch-icon-114x114.png', size: 114 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-144x144.png', size: 144 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    // Android/Chrome icons
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    // MS Tile
    { name: 'mstile-150x150.png', size: 150 },
];

// Next.js app directory icons
const appIcons = [
    { name: 'icon.png', size: 32 },
    { name: 'apple-icon.png', size: 180 },
];

async function generateFavicons() {
    console.log('🎨 Generating favicons from logo.png...\n');

    if (!fs.existsSync(SOURCE)) {
        console.error('❌ Source logo not found:', SOURCE);
        process.exit(1);
    }

    // Generate public favicons
    for (const { name, size } of sizes) {
        const output = path.join(OUTPUT_DIR, name);
        await sharp(SOURCE)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(output);
        console.log(`✅ ${name} (${size}x${size})`);
    }

    // Generate app directory icons
    for (const { name, size } of appIcons) {
        const output = path.join(APP_OUTPUT, name);
        await sharp(SOURCE)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(output);
        console.log(`✅ src/app/${name} (${size}x${size})`);
    }

    // Generate .ico file (multi-size) - create 16, 32, 48 combined
    // Sharp doesn't support ICO directly, so we'll just create a 32x32 PNG and rename
    // For proper ICO, you'd need a tool like png-to-ico
    const icoPath = path.join(APP_OUTPUT, 'favicon.ico');
    await sharp(SOURCE)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(icoPath.replace('.ico', '.png'));

    // Copy to public as well
    await sharp(SOURCE)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(OUTPUT_DIR, 'favicon.png'));

    console.log(`✅ favicon.png (32x32)`);
    console.log(`✅ src/app/favicon.png (32x32)`);

    console.log('\n🎉 All favicons generated successfully!');
    console.log('\n📋 Don\'t forget to update your layout.tsx with proper meta tags.');
}

generateFavicons().catch(console.error);
