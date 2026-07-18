import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { COLORS } from './theme';
import { Hook } from './scenes/Hook';
import { Problem } from './scenes/Problem';
import { MapMath } from './scenes/MapMath';
import { CompassScene } from './scenes/CompassScene';
import { Outro } from './scenes/Outro';

export const SCENES = [
  { Comp: Hook, frames: 78 },
  { Comp: Problem, frames: 108 },
  { Comp: MapMath, frames: 258 },
  { Comp: CompassScene, frames: 216 },
  { Comp: Outro, frames: 126 },
] as const;

export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0);

export const VelibDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Series>
        {SCENES.map(({ Comp, frames }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Comp durationInFrames={frames} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
