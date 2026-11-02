#!/usr/bin/env node
/* Copies the website into www/ (Capacitor's webDir) without touching the original files.
   - Copies everything at the repo root except build tooling and generated folders.
   - Injects scripts/native-shim.js into the COPY of index.html. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');

const IGNORE = new Set([
  '.git', '.github', '.gitignore', '.DS_Store',
  'node_modules', 'android', 'www', 'scripts', 'resources',
  'package.json', 'package-lock.json', 'capacitor.config.json', 'capacitor.config.ts',
  'README.md', 'ANDROID.md'
]);

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('prepare-web: index.html not found at repo root');
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of fs.readdirSync(root)) {
  if (IGNORE.has(name)) continue;
  fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
}

/* inject the native shim into the copied index.html */
fs.copyFileSync(path.join(__dirname, 'native-shim.js'), path.join(out, 'native-shim.js'));
const indexPath = path.join(out, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const tag = '<script src="native-shim.js"></script>';
if (!html.includes('native-shim.js')) {
  const appTag = /<script[^>]*\ssrc=["']js\/app\.js["'][^>]*><\/script>/i;
  if (appTag.test(html)) html = html.replace(appTag, m => tag + '\n' + m);
  else if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, tag + '\n</body>');
  else html += '\n' + tag + '\n';
  fs.writeFileSync(indexPath, html);
}

const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    fs.statSync(p).isDirectory() ? walk(p) : files.push(path.relative(out, p));
  }
})(out);
console.log('prepare-web: copied ' + files.length + ' files into www/');
files.forEach(f => console.log('  ' + f));
