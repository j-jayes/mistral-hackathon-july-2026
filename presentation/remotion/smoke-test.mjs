// Pure-JS smoke test: executes the built browser bundle inside jsdom, mounts the
// Remotion Player, ticks a few animation frames, and reports any runtime error.
// Verifies the bundle is valid without needing the (policy-blocked) native toolchain.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const code = readFileSync(new URL('../assets/velib-demo.js', import.meta.url), 'utf8');

const dom = new JSDOM(
  `<!doctype html><html><body><div id="velib-player"></div></body></html>`,
  { pretendToBeVisual: true, url: 'https://example.test/' },
);
const { window } = dom;

// Browser APIs jsdom doesn't implement but Remotion Player touches.
class RO { observe() {} unobserve() {} disconnect() {} }
window.ResizeObserver = RO;
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
if (!window.matchMedia)
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
window.devicePixelRatio = 2;
window.scrollTo = () => {};
if (!window.HTMLMediaElement.prototype.play)
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();

let rafId = 0;
const rafCbs = new Map();
window.requestAnimationFrame = (cb) => { const id = ++rafId; rafCbs.set(id, cb); return id; };
window.cancelAnimationFrame = (id) => rafCbs.delete(id);

const errors = [];
window.addEventListener('error', (e) => errors.push('error: ' + (e.error?.stack || e.message)));
window.addEventListener('unhandledrejection', (e) => errors.push('reject: ' + (e.reason?.stack || e.reason)));

// Run the IIFE bundle with jsdom globals in scope.
const g = window;
try {
  const fn = new Function(
    'window', 'document', 'navigator', 'self', 'globalThis', 'location', 'requestAnimationFrame', 'cancelAnimationFrame',
    code,
  );
  fn(g, g.document, g.navigator, g, g, g.location, g.requestAnimationFrame, g.cancelAnimationFrame);
} catch (e) {
  errors.push('eval: ' + (e.stack || e.message));
}

// Let React effects + a few animation frames run.
async function tick(times) {
  for (let i = 0; i < times; i++) {
    await new Promise((r) => setTimeout(r, 16));
    const cbs = [...rafCbs.values()];
    rafCbs.clear();
    cbs.forEach((cb) => { try { cb(performance.now()); } catch (e) { errors.push('raf: ' + (e.stack || e.message)); } });
  }
}

await tick(20);

const mount = dom.window.document.getElementById('velib-player');
const html = mount ? mount.innerHTML : '';
const mountedNodes = mount ? mount.querySelectorAll('*').length : 0;
const hasSvg = /<svg/i.test(html);
const hasText = /Vélib|Gravilliers|leaves the phone|dock/i.test(html);

console.log('--- smoke test ---');
console.log('mounted DOM nodes :', mountedNodes);
console.log('contains <svg>    :', hasSvg);
console.log('contains scene text:', hasText);
console.log('runtime errors    :', errors.length);
if (errors.length) {
  console.log(errors.slice(0, 6).join('\n\n'));
  process.exit(1);
}
if (mountedNodes < 10 || !hasSvg) {
  console.log('FAIL: player did not mount meaningful content');
  process.exit(2);
}
console.log('PASS: bundle executes and Player mounts the composition');
