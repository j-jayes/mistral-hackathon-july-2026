// Bundles the Remotion composition + @remotion/player into a single self-contained
// browser script for the reveal.js deck. Uses esbuild (pure JS API + trusted native
// service) — avoids the native Remotion compositor, which corporate policy blocks.
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(here, '../assets/velib-demo.js');

await esbuild.build({
  entryPoints: [resolve(here, 'src/player-entry.tsx')],
  outfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.REMOTION_APP_TITLE': '""',
  },
  legalComments: 'none',
  logLevel: 'info',
});

console.log('✔ wrote', outfile);
