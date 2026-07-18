import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, lato, mono, serif } from '../theme';
import { FadeScene } from '../components';
import {
  DEST,
  makeProjector,
  NEAREST,
  NEAREST_BEARING,
  NEAREST_DISTANCE,
  STATIONS,
} from '../data';

const MAP = { x: 56, y: 118, w: 748, h: 566 };
const project = makeProjector(MAP.w, MAP.h, 54);
const px = (s: { x: number; y: number }) => ({ x: s.x + MAP.x, y: s.y + MAP.y });

export const MapMath: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panel = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const dest = px(project(DEST));
  const destDrop = spring({ frame: frame - 44, fps, config: { damping: 14, stiffness: 140 } });

  // spokes draw 62 → 118
  const spoke = interpolate(frame, [62, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // non-winners fade after 122
  const dim = interpolate(frame, [122, 150], [1, 0.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const winner = spring({ frame: frame - 128, fps, config: { damping: 12, stiffness: 160 } });

  const distNow = Math.round(
    interpolate(frame, [124, 168], [0, NEAREST_DISTANCE], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const bearNow = Math.round(
    interpolate(frame, [150, 196], [0, NEAREST_BEARING], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <FadeScene durationInFrames={durationInFrames}>
      {/* title */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          left: MAP.x,
          fontFamily: serif,
          fontWeight: 300,
          fontSize: 40,
          color: COLORS.blue,
          opacity: panel,
        }}
      >
        Nearest open dock to{' '}
        <span style={{ color: COLORS.ink }}>21 rue des Gravilliers</span>
      </div>

      {/* map panel */}
      <div
        style={{
          position: 'absolute',
          left: MAP.x,
          top: MAP.y,
          width: MAP.w,
          height: MAP.h,
          background: '#fff',
          border: `1px solid ${COLORS.line}`,
          borderRadius: 14,
          opacity: panel,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      />

      <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        {/* stylised Seine */}
        <path
          d={`M ${MAP.x + 8} ${MAP.y + 250}
              C ${MAP.x + 200} ${MAP.y + 330}, ${MAP.x + 360} ${MAP.y + 250}, ${MAP.x + 460} ${MAP.y + 320}
              S ${MAP.x + 700} ${MAP.y + 420}, ${MAP.x + MAP.w - 8} ${MAP.y + 360}`}
          fill="none"
          stroke={COLORS.blue}
          strokeOpacity={0.16 * panel}
          strokeWidth={16}
          strokeLinecap="round"
        />

        {/* spokes to every station */}
        {STATIONS.map((s, i) => {
          const p = px(project(s));
          const isWin = s === NEAREST;
          const ex = dest.x + (p.x - dest.x) * spoke;
          const ey = dest.y + (p.y - dest.y) * spoke;
          return (
            <line
              key={`spoke-${i}`}
              x1={dest.x}
              y1={dest.y}
              x2={ex}
              y2={ey}
              stroke={isWin ? COLORS.green : COLORS.blue}
              strokeWidth={isWin ? 3.5 : 1.4}
              strokeOpacity={isWin ? 0.9 : 0.5 * dim}
              strokeDasharray={isWin ? '7 7' : undefined}
            />
          );
        })}

        {/* station dots */}
        {STATIONS.map((s, i) => {
          const p = px(project(s));
          const pop = spring({
            frame: frame - (16 + i * 1.8),
            fps,
            config: { damping: 12, stiffness: 200 },
          });
          const isWin = s === NEAREST;
          const r = (isWin ? 6 + winner * 6 : 6) * pop;
          return (
            <g key={`dot-${i}`} opacity={isWin ? 1 : dim < 1 ? 0.35 + dim * 0.65 : 1}>
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={isWin ? COLORS.green : COLORS.blue}
                fillOpacity={isWin ? 0.95 : 0.6}
                stroke={isWin ? COLORS.green : COLORS.blue}
                strokeWidth={isWin ? 3 : 1}
              />
              {isWin && winner > 0.2 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r + 8 + Math.sin(frame / 5) * 3}
                  fill="none"
                  stroke={COLORS.green}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}

        {/* destination marker */}
        <g
          transform={`translate(${dest.x} ${dest.y - interpolate(destDrop, [0, 1], [40, 0])})`}
          opacity={destDrop}
        >
          <path
            d={`M 0 6 C -22 6 -22 -26 0 -40 C 22 -26 22 6 0 6 Z`}
            fill={COLORS.ink}
          />
          <circle cx={0} cy={-24} r={8} fill="#fff" />
        </g>
      </svg>

      {/* winner label near the dot */}
      {(() => {
        const p = px(project(NEAREST));
        return (
          <div
            style={{
              position: 'absolute',
              left: p.x + 16,
              top: p.y - 14,
              opacity: winner,
              transform: `translateX(${interpolate(winner, [0, 1], [-8, 0])}px)`,
              background: COLORS.green,
              color: '#fff',
              fontFamily: lato,
              fontWeight: 700,
              fontSize: 18,
              padding: '4px 10px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {NEAREST.name} · {NEAREST_DISTANCE} m
          </div>
        );
      })()}

      {/* right-hand live readout */}
      <div
        style={{
          position: 'absolute',
          left: 850,
          top: 150,
          width: 372,
          opacity: panel,
          fontFamily: mono,
          color: COLORS.ink,
        }}
      >
        <div style={{ fontSize: 17, color: COLORS.muted, letterSpacing: 1 }}>
          RUNS ON THE PHONE
        </div>
        <div style={{ height: 1, background: COLORS.line, margin: '14px 0 22px' }} />

        <Row k="scan" v={`${STATIONS.length} stations`} />
        <Row k="method" v="haversine + bearing" />

        <div style={{ height: 22 }} />
        <div style={{ fontSize: 15, color: COLORS.muted, letterSpacing: 1 }}>
          NEAREST OPEN DOCK
        </div>
        <div
          style={{
            fontFamily: lato,
            fontWeight: 700,
            fontSize: 26,
            color: COLORS.green,
            margin: '6px 0 18px',
          }}
        >
          {NEAREST.name}
        </div>

        <Big label="distance" value={`${distNow} m`} />
        <Big label="bearing" value={`${bearNow}°`} />
      </div>
    </FadeScene>
  );
};

const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, margin: '8px 0' }}>
    <span style={{ color: COLORS.muted }}>{k}</span>
    <span style={{ color: COLORS.ink }}>{v}</span>
  </div>
);

const Big: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '10px 0' }}>
    <span style={{ color: COLORS.muted, fontSize: 20 }}>{label}</span>
    <span style={{ color: COLORS.blue, fontSize: 40, fontWeight: 700 }}>{value}</span>
  </div>
);
