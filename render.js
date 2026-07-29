const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const msedge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlFile = path.join(__dirname, 'render_icon.html');

function renderPng(width, height, targetPath) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const cmd = `"${msedge}" --headless --disable-gpu --hide-scrollbars --window-size=${width},${height} --screenshot="${targetPath}" "${htmlFile}"`;
    console.log(`Rendering ${width}x${height} -> ${targetPath}`);
    execSync(cmd);
}

// Render web app assets
renderPng(180, 180, path.join(__dirname, 'public', 'apple-touch-icon.png'));
renderPng(512, 512, path.join(__dirname, 'public', 'favicon.png'));
renderPng(512, 512, path.join(__dirname, 'public', 'maskable-icon.png'));
renderPng(192, 192, path.join(__dirname, 'public', 'icons', 'icon-192x192.png'));
renderPng(512, 512, path.join(__dirname, 'public', 'icons', 'icon-512x512.png'));

// Render Android native app assets
const androidRes = path.join(__dirname, 'android-app', 'src', 'main', 'res');
renderPng(48, 48, path.join(androidRes, 'mipmap-mdpi', 'ic_launcher.png'));
renderPng(48, 48, path.join(androidRes, 'mipmap-mdpi', 'ic_maskable.png'));
renderPng(72, 72, path.join(androidRes, 'mipmap-hdpi', 'ic_launcher.png'));
renderPng(72, 72, path.join(androidRes, 'mipmap-hdpi', 'ic_maskable.png'));
renderPng(96, 96, path.join(androidRes, 'mipmap-xhdpi', 'ic_launcher.png'));
renderPng(96, 96, path.join(androidRes, 'mipmap-xhdpi', 'ic_maskable.png'));
renderPng(144, 144, path.join(androidRes, 'mipmap-xxhdpi', 'ic_launcher.png'));
renderPng(144, 144, path.join(androidRes, 'mipmap-xxhdpi', 'ic_maskable.png'));
renderPng(192, 192, path.join(androidRes, 'mipmap-xxxhdpi', 'ic_launcher.png'));
renderPng(192, 192, path.join(androidRes, 'mipmap-xxxhdpi', 'ic_maskable.png'));
renderPng(512, 512, path.join(androidRes, 'drawable-xxxhdpi', 'splash.png'));

console.log('ALL DONE SUCCESSFULLY!');
