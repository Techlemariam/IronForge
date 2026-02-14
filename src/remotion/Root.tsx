import React from 'react';
import { Composition } from 'remotion';
import { ProgressVideo, progressSchema } from './ProgressVideo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ProgressVideo"
      component={ProgressVideo}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
      schema={progressSchema}
      defaultProps={{
        username: 'Valhallan',
        weekNumber: 42,
        strengthGains: 1337,
      }}
    />
  </>
);
