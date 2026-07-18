import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, lato, serif } from '../theme';
import { Bike, FadeScene } from '../components';

export const Hook: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const ride = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const bikeX = interpolate(ride, [0, 1], [-260, 0]);

  const titleUp = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const subUp = spring({ frame: frame - 28, fps, config: { damping: 200 } });

  // gentle bob after arrival
  const bob = Math.sin((frame - 40) / 9) * (frame > 40 ? 5 : 0);

  return (
    <FadeScene durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            transform: `translateX(${bikeX}px) translateY(${bob}px)`,
            opacity: ride,
          }}
        >
          <Bike size={230} color={COLORS.blue} />
        </div>

        <div
          style={{
            transform: `translateY(${interpolate(titleUp, [0, 1], [40, 0])}px)`,
            opacity: titleUp,
            fontFamily: serif,
            fontWeight: 300,
            fontSize: 66,
            color: COLORS.blue,
            letterSpacing: -1,
            textAlign: 'center',
            maxWidth: width * 0.8,
            lineHeight: 1.05,
          }}
        >
          Parking the Vélib is the hard part
        </div>

        <div
          style={{
            transform: `translateY(${interpolate(subUp, [0, 1], [30, 0])}px)`,
            opacity: subUp,
            fontFamily: lato,
            fontSize: 30,
            color: COLORS.ink,
            marginTop: 6,
          }}
        >
          A phone compass to the nearest{' '}
          <span style={{ color: COLORS.green, fontWeight: 700 }}>open dock</span> — Paris
        </div>
      </AbsoluteFill>
    </FadeScene>
  );
};
