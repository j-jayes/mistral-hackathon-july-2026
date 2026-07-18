import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { COLORS, lato, mono } from './theme';

// ---------------------------------------------------------------------------
// Scene wrapper: fades in over the first `fade` frames and out over the last.
// ---------------------------------------------------------------------------
export const FadeScene: React.FC<{
  durationInFrames: number;
  fade?: number;
  background?: string;
  children: React.ReactNode;
}> = ({ durationInFrames, fade = 12, background = COLORS.bg, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <AbsoluteFill style={{ backgroundColor: background, opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.blue,
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '6px 18px',
      borderRadius: 999,
      background: COLORS.light,
      color: COLORS.blueDark,
      fontFamily: lato,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: 1,
      borderBottom: `2px solid ${color}`,
    }}
  >
    {children}
  </span>
);

// A tidy line-art bicycle.
export const Bike: React.FC<{ size?: number; color?: string; stroke?: number }> = ({
  size = 200,
  color = COLORS.blue,
  stroke = 6,
}) => (
  <svg width={size} height={(size * 0.62) | 0} viewBox="0 0 200 124" fill="none">
    <g stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="42" cy="86" r="30" />
      <circle cx="158" cy="86" r="30" />
      <path d="M42 86 L86 40 L132 86 L100 40 L86 40" />
      <path d="M132 86 L146 44 L162 44" />
      <path d="M74 40 L98 40" />
      <path d="M42 86 L86 40" />
      <circle cx="86" cy="86" r="3" fill={color} />
    </g>
  </svg>
);

// iPhone-ish bezel.
export const PhoneFrame: React.FC<{
  width: number;
  children: React.ReactNode;
}> = ({ width, children }) => {
  const height = width * (19.5 / 9);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.14,
        background: '#111',
        padding: width * 0.035,
        boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: width * 0.11,
          overflow: 'hidden',
          background: COLORS.bg,
          position: 'relative',
        }}
      >
        {children}
      </div>
      {/* notch */}
      <div
        style={{
          position: 'absolute',
          top: width * 0.035,
          left: '50%',
          transform: 'translateX(-50%)',
          width: width * 0.34,
          height: width * 0.05,
          background: '#111',
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
        }}
      />
    </div>
  );
};

// Compass dial mirroring the app's Compass.tsx (rose rotates, needle points).
export const CompassDial: React.FC<{
  size: number;
  needleDeg: number; // absolute bearing the needle should point to
  roseDeg?: number; // rotation applied to the N/S/E/W rose
}> = ({ size, needleDeg, roseDeg = 0 }) => {
  const c = size / 2;
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 3} fill="#fff" stroke={COLORS.line} strokeWidth={2} />
      <circle cx={c} cy={c} r={c - 10} fill="none" stroke={COLORS.light} strokeWidth={8} />

      {/* rotating rose */}
      <g transform={`rotate(${roseDeg} ${c} ${c})`}>
        {ticks.map((d) => (
          <line
            key={d}
            x1={c}
            y1={18}
            x2={c}
            y2={30}
            stroke={COLORS.blue}
            strokeOpacity={0.35}
            strokeWidth={3}
            transform={`rotate(${d} ${c} ${c})`}
          />
        ))}
        <text x={c} y={40} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={size * 0.09} fill={COLORS.blue}>N</text>
        <text x={c} y={size - 24} textAnchor="middle" fontFamily={mono} fontSize={size * 0.08} fill={COLORS.muted}>S</text>
        <text x={26} y={c + size * 0.03} textAnchor="middle" fontFamily={mono} fontSize={size * 0.08} fill={COLORS.muted}>W</text>
        <text x={size - 26} y={c + size * 0.03} textAnchor="middle" fontFamily={mono} fontSize={size * 0.08} fill={COLORS.muted}>E</text>
      </g>

      {/* needle */}
      <g transform={`rotate(${needleDeg} ${c} ${c})`}>
        <line x1={c} y1={c} x2={c} y2={c - (c - 34)} stroke={COLORS.blue} strokeWidth={size * 0.03} strokeLinecap="round" />
        <polygon
          points={`${c},${34} ${c - size * 0.045},${34 + size * 0.075} ${c + size * 0.045},${34 + size * 0.075}`}
          fill={COLORS.blue}
        />
        <line x1={c} y1={c} x2={c} y2={c + (c - 60)} stroke={COLORS.blue} strokeOpacity={0.25} strokeWidth={size * 0.02} strokeLinecap="round" />
      </g>

      <circle cx={c} cy={c} r={size * 0.055} fill="#fff" stroke={COLORS.blue} strokeWidth={4} />
      <circle cx={c} cy={c} r={size * 0.022} fill={COLORS.blue} />
    </svg>
  );
};
