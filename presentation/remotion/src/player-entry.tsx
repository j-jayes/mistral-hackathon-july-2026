import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Player, PlayerRef } from '@remotion/player';
import { TOTAL_FRAMES, VelibDemo } from './VelibDemo';

type RevealLike = {
  on: (e: string, cb: () => void) => void;
  getCurrentSlide?: () => Element | undefined;
};

// The Remotion composition, embedded live in the reveal.js deck as a looping
// player. It plays only while its slide is on screen, and restarts from the
// top each time you arrive — no native render toolchain required.
const VelibPlayer: React.FC = () => {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const Reveal = (window as unknown as { Reveal?: RevealLike }).Reveal;
    if (!Reveal) {
      // Standalone (no reveal.js): just play.
      ref.current?.play();
      return;
    }
    const sync = () => {
      const player = ref.current;
      if (!player) return;
      const host = document.getElementById('velib-player');
      const slide = host?.closest('section') ?? null;
      const active = !!slide && Reveal.getCurrentSlide?.() === slide;
      if (active) {
        player.seekTo(0);
        player.play();
      } else {
        player.pause();
      }
    };
    Reveal.on('ready', sync);
    Reveal.on('slidechanged', sync);
    sync();
  }, []);

  return (
    <Player
      ref={ref}
      component={VelibDemo}
      durationInFrames={TOTAL_FRAMES}
      compositionWidth={1280}
      compositionHeight={720}
      fps={30}
      loop
      controls
      doubleClickToFullscreen
      clickToPlay
      acknowledgeRemotionLicense
      style={{ width: '100%', height: '100%' }}
    />
  );
};

function mount() {
  const el = document.getElementById('velib-player');
  if (!el || el.getAttribute('data-mounted') === '1') return;
  el.setAttribute('data-mounted', '1');
  createRoot(el).render(<VelibPlayer />);
}

if (document.readyState !== 'loading') mount();
else document.addEventListener('DOMContentLoaded', mount);

const w = window as unknown as { Reveal?: RevealLike };
if (w.Reveal) w.Reveal.on('ready', mount);
