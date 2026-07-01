import { rollup } from '@rollup/wasm-node';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, 'dist');

function writeHtml() {
  const cssTag = existsSync(join(dist, 'bundle.css')) ? '<link rel="stylesheet" href="/bundle.css" />' : '';
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="React website template" />
    <title>React Website Template</title>
    ${cssTag}
  </head>
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>`;
  writeFileSync(join(dist, 'index.html'), html);
}

export async function buildProject({ dev = false } = {}) {
  if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

  const bundle = await rollup({
    input: 'src/main.tsx',
    plugins: [
      resolve({ extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'] }),
      commonjs(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
      }),
      postcss({ extract: true, minimize: !dev, sourceMap: dev }),
      typescript({ tsconfig: join(__dirname, 'tsconfig.json'), sourceMap: dev }),
    ],
  });

  await bundle.write({
    file: join(dist, 'bundle.js'),
    format: 'iife',
    name: 'ReactWebsiteTemplate',
    sourcemap: dev,
  });

  await bundle.close();

  writeHtml();
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  buildProject({ dev: process.argv.includes('--dev') }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
