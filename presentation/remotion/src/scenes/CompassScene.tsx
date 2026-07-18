import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, lato, mono, serif } from '../theme';
import { Chip, CompassDial, FadeScene, PhoneFrame } from '../components';
import { cardinal, NEAREST, NEAREST_BEARING, NEAREST_DISTANCE } from '../data';

export const CompassScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const phoneX = interpolate(enter, [0, 1], [-140, 0]);

  const granted = spring({ frame: frame - 44, fps, config: { damping: 18, stiffness: 90 } });
  const tap = spring({ frame: frame - 34, fps, config: { damping: 12, stiffness: 200 }, durationInFrames: 20 });

  // needle: wobbles with no signal, then locks onto the bearing
  const wobble = Math.sin(frame / 4) * 46;
  const jitter = Math.sin(frame / 11) * 1.6;
  const needle = (1 - granted) * wobble + granted * (NEAREST_BEARING + jitter);
  const rose = -needle * 0.14;

  const dist = Math.round(
    interpolate(frame, [96, 188], [NEAREST_DISTANCE, 95], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  const capUp = spring({ frame: frame - 70, fps, config: { damping: 200 } });

  return (
    <FadeScene durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* phone */}
        <div
          style={{
            width: 620,
            display: 'flex',
            justifyContent: 'center',
            transform: `translateX(${phoneX}px)`,
            opacity: enter,
          }}
        >
          <div style={{ position: 'relative' }}>
            <PhoneFrame width={300}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '46px 18px 24px',
                }}
              >
                <div style={{ fontFamily: serif, fontSize: 22, color: COLORS.blue }}>
                  Vélib Parking
                </div>
                <div style={{ fontFamily: lato, fontSize: 12, color: COLORS.muted, marginBottom: 18 }}>
                  nearest open dock
                </div>

                <div style={{ position: 'relative' }}>
                  <CompassDial size={210} needleDeg={needle} roseDeg={rose} />
                  {/* direction pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: COLORS.blue,
                      color: '#fff',
                      fontFamily: mono,
                      fontSize: 14,
                      padding: '3px 12px',
                      borderRadius: 999,
                      opacity: granted,
                    }}
                  >
                    {cardinal(NEAREST_BEARING)} · {Math.round(NEAREST_BEARING)}°
                  </div>
                </div>

                <div style={{ marginTop: 22, textAlign: 'center' }}>
                  <div style={{ fontFamily: mono, fontSize: 44, fontWeight: 700, color: COLORS.blue }}>
                    {dist} m
                  </div>
                  <div style={{ fontFamily: lato, fontWeight: 700, fontSize: 15, color: COLORS.green }}>
                    {NEAREST.name}
                  </div>
                  <div style={{ fontFamily: lato, fontSize: 12, color: COLORS.muted }}>
                    open dock ↗
                  </div>
                </div>

                {/* enable-compass button, fades out once granted */}
                <div style={{ flex: 1 }} />
                <div style={{ position: 'relative', opacity: 1 - granted }}>
                  <div
                    style={{
                      background: COLORS.blue,
                      color: '#fff',
                      fontFamily: lato,
                      fontWeight: 700,
                      fontSize: 15,
                      padding: '11px 20px',
                      borderRadius: 12,
                    }}
                  >
                    🧭 Enable Compass
                  </div>
                  {/* tap ripple */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      margin: 'auto',
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      border: `3px solid ${COLORS.green}`,
                      transform: `scale(${1 + tap * 4})`,
                      opacity: tap * (1 - tap),
                    }}
                  />
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* caption */}
        <div
          style={{
            flex: 1,
            paddingRight: 90,
            transform: `translateY(${interpolate(capUp, [0, 1], [30, 0])}px)`,
            opacity: capUp,
          }}
        >
          <Chip color={COLORS.blue}>iOS</Chip>
          <div
            style={{
              fontFamily: serif,
              fontWeight: 300,
              fontSize: 46,
              color: COLORS.ink,
              margin: '18px 0 26px',
              lineHeight: 1.12,
            }}
          >
            The needle points at the{' '}
            <span style={{ color: COLORS.green }}>free dock</span> — one tap unlocks true north.
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 22,
              color: COLORS.blueDark,
              background: COLORS.light,
              padding: '14px 18px',
              borderRadius: 10,
              display: 'inline-block',
            }}
          >
            needle = bearing − webkitCompassHeading
          </div>
          <div style={{ fontFamily: lato, fontSize: 22, color: COLORS.muted, marginTop: 22 }}>
            🔒 HTTPS · 👆 fired inside a tap · true north, not <code style={{ fontFamily: mono }}>alpha</code>
          </div>
        </div>
      </AbsoluteFill>
    </FadeScene>
  );
};
