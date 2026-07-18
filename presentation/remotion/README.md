# Vélib demo — Remotion composition

A ~26s animated explainer for the presentation, built as a [Remotion](https://www.remotion.dev/)
composition. It runs the same story as the deck: the ride is easy → the nearest dock is
full → a haversine sweep over the real 20-station demo set picks the nearest **open** dock →
the compass locks onto it → only the address ever leaves the phone.

Scenes live in [`src/scenes/`](src/scenes/); the station coordinates and the haversine /
bearing math in [`src/data.ts`](src/data.ts) are the exact values used in the deck's live
Leaflet slide, so the video and the slide agree.

## How it's shown in the deck

The corporate Windows image (WDAC/Smart App Control) blocks Remotion's **native compositor
binary** (`remotion.exe`) and its bundled `ffmpeg.exe` — "Access is denied" — so an MP4
**cannot be rendered on this machine**. Instead the composition is shipped as a live
[`@remotion/player`](https://www.remotion.dev/docs/player) that plays in the browser (pure
JS, no native binaries). [`build-player.mjs`](build-player.mjs) bundles
[`src/player-entry.tsx`](src/player-entry.tsx) with esbuild into
`../assets/velib-demo.js`, which the `index.qmd` slide *"The whole idea, in about half a
minute"* loads. The player pauses when its slide is off-screen and restarts on arrival.

```bash
npm install
npm run build:player   # -> ../assets/velib-demo.js  (then re-render the deck: quarto render)
node smoke-test.mjs    # jsdom smoke test: bundle executes + Player mounts, 0 errors
```

## Rendering a real MP4 (on an unrestricted machine / CI)

The composition is a normal Remotion project, so on any box **without** the exe block:

```bash
npm run dev            # open Remotion Studio to scrub/preview
npm run render         # -> out/velib-demo.mp4 (H.264, 1280x720, 30fps)
```

This project's Cloud Build (Linux) would also render it fine — Linux has no such policy.

## Licensing

Remotion is free for individuals and companies of up to 3 people; larger for-profit
companies need a paid Company License. See https://www.remotion.dev/license. The player is
marked with `acknowledgeRemotionLicense` only to silence the console notice — it is **not** a
license. Confirm the company's entitlement before shipping this externally.
