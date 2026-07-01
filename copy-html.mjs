import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, 'dist');

if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

let html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Algorithm Visualizer and Performance Analyzer - An educational tool for understanding algorithms visually and analytically." />
  <title>Algorithm Visualizer &amp; Performance Analyzer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#f6f8fa;--surface:#fff;--text:#1f2328;--text-secondary:#656d76;--border:#d0d7de;--accent:#0969da;--accent-alpha:rgba(9,105,218,0.15);--font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    [data-theme='dark']{--bg:#0d1117;--surface:#161b22;--text:#e6edf3;--text-secondary:#8b949e;--border:#30363d;--accent:#58a6ff;--accent-alpha:rgba(88,166,255,0.15)}
    html{font-size:16px;-webkit-font-smoothing:antialiased}
    body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.5;min-height:100vh}
    h1,h2,h3,h4{line-height:1.3;font-weight:600}
    a{color:var(--accent);text-decoration:none}
    a:hover{text-decoration:underline}
    button{font-family:var(--font)}
    input,select{font-family:var(--font);font-size:.9rem}
    input[type=range]{-webkit-appearance:none;appearance:none;height:6px;background:var(--border);border-radius:3px;outline:none;cursor:pointer}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid var(--surface)}
    input[type=number]{padding:.375rem .5rem;border:1px solid var(--border);border-radius:.375rem;background:var(--surface);color:var(--text)}
    ::selection{background:var(--accent);color:#fff}
    :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    .spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="bundle.js"></script>
</body>
</html>`;

const fs = await import('fs');
fs.writeFileSync(join(dist, 'index.html'), html);
console.log('Copied index.html to dist/');
