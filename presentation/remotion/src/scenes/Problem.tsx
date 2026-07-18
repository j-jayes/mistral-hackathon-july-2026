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

export const Problem: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = 640;
  const cy = 400;
  const rx = 210;
  const ry = 130;

  // bike orbits ~1.6 laps over the scene
  const laps = interpolate(frame, [10, durationInFrames], [0, 1.6], {
    extrapolateLeft: 'clamp',
  });
  const ang = laps * Math.PI * 2 - Math.PI / 2;
  const bx = cx + rx * Math.cos(ang);
  const by = cy + ry * Math.sin(ang);
  const tangent = (Math.atan2(ry * Math.cos(ang), -rx * Math.sin(ang)) * 180) / Math.PI;

  const titleIn = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const fullPop = spring({ frame: frame - 24, fps, config: { damping: 12, stiffness: 180 } });

  return (
    <FadeScene durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ alignItems: 'center' }}>
        <div
          style={{
            marginTop: 70,
            fontFamily: serif,
            fontWeight: 300,
            fontSize: 52,
            color: COLORS.ink,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
          }}
        >
          The closest dock is often{' '}
          <span style={{ color: COLORS.full, fontWeight: 700 }}>full</span>.
        </div>

        {/* the block being circled */}
        <svg width={1280} height={520} style={{ position: 'absolute', top: 150 }}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={3}
            strokeDasharray="10 12"
          />
          {/* destination pin at centre */}
          <circle cx={cx} cy={cy} r={9} fill={COLORS.full} />
          <path
            d={`M ${cx} ${cy - 40} C ${cx - 26} ${cy - 40} ${cx - 26} ${cy - 6} ${cx} ${cy - 4} C ${cx + 26} ${cy - 6} ${cx + 26} ${cy - 40} ${cx} ${cy - 40} Z`}
            fill={COLORS.full}
          />
          <circle cx={cx} cy={cy - 26} r={7} fill="#fff" />
        </svg>

        {/* orbiting bike */}
        <div
          style={{
            position: 'absolute',
            top: 150,
            left: 0,
            width: 1280,
            height: 520,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: bx,
              top: by,
              transform: `translate(-50%,-50%) rotate(${tangent}deg)`,
            }}
          >
            <Bike size={92} color={COLORS.ink} stroke={5} />
          </div>
        </div>

        {/* FULL badge */}
        <div
          style={{
            position: 'absolute',
            top: 560,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transform: `scale(${interpolate(fullPop, [0, 1], [0.6, 1])})`,
            opacity: fullPop,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 30,
              color: '#fff',
              background: COLORS.full,
              padding: '8px 22px',
              borderRadius: 10,
              letterSpacing: 2,
            }}
          >
            0 / 24 DOCKS · FULL
          </span>
          <span style={{ fontFamily: lato, fontSize: 26, color: COLORS.muted }}>
            …so you circle the block. Again.
          </span>
        </div>
      </AbsoluteFill>
    </FadeScene>
  );
};
