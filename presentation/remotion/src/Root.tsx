import React from 'react';
import { Composition } from 'remotion';
import { TOTAL_FRAMES, VelibDemo } from './VelibDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VelibDemo"
      component={VelibDemo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
