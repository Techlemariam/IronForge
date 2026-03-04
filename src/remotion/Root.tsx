import { Composition } from 'remotion';
import { ProgressVideo, progressSchema } from './ProgressVideo';
import { TitanWeeklyRecap, titanRecapSchema } from './TitanWeeklyRecap';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Legacy: Simple progress video */}
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

    {/* Primary: Titan Weekly Recap (shareable) */}
    <Composition
      id="TitanWeeklyRecap"
      component={TitanWeeklyRecap}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
      schema={titanRecapSchema}
      defaultProps={{
        username: 'Valhallan',
        weekNumber: 9,
        strengthGains: 2450,
        xpEarned: 12800,
        workoutsLogged: 5,
        monstersDefeated: 3,
        streakDays: 14,
      }}
    />
  </>
);
