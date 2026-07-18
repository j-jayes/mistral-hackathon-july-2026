import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, lato, mono, serif } from '../theme';
import { Bike, FadeScene } from '../components';

export const Outro: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const lockPop = spring({ frame, fps, config: { damping: 12, stiffness: 160 } });
  const titleUp = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const urlUp = spring({ frame: frame - 26, fps, config: { damping: 200 } });

  // bike rolls across near the end
  const roll = interpolate(frame, [40, durationInFrames], [-260, width + 260], {
    extrapolateLeft: 'clamp',
  });

  return (
    <FadeScene durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            transform: `scale(${interpolate(lockPop, [0, 1], [0.4, 1])})`,
            opacity: lockPop,
            fontSize: 64,
          }}
        >
          🔒
        </div>

        <div
          style={{
            fontFamily: serif,
            fontWeight: 300,
            fontSize: 60,
            color: COLORS.blue,
            textAlign: 'center',
            maxWidth: width * 0.82,
            lineHeight: 1.08,
            opacity: titleUp,
            transform: `translateY(${interpolate(titleUp, [0, 1], [30, 0])}px)`,
          }}
        >
          Only the address ever leaves the phone.
        </div>

        <div
          style={{
            fontFamily: lato,
            fontSize: 26,
            color: COLORS.ink,
            marginTop: 10,
            opacity: titleUp,
          }}
        >
          Nearest-dock selection &amp; the compass run{' '}
          <span style={{ color: COLORS.green, fontWeight: 700 }}>client-side</span>.
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: mono,
            fontSize: 26,
            color: '#fff',
            background: COLORS.blue,
            padding: '12px 26px',
            borderRadius: 12,
            opacity: urlUp,
            transform: `translateY(${interpolate(urlUp, [0, 1], [20, 0])}px)`,
          }}
        >
          velib-app…run.app
        </div>

        <div
          style={{
            fontFamily: lato,
            fontSize: 20,
            color: COLORS.muted,
            marginTop: 16,
            opacity: urlUp,
          }}
        >
          FastAPI + React · one container on Cloud Run · Paris 🇫🇷
        </div>
      </AbsoluteFill>

      {/* bike rolls across the bottom */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, transform: `translateX(${roll}px)` }}>
        <Bike size={120} color={COLORS.blue} />
      </div>
    </FadeScene>
  );
};
