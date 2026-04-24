import { toast } from '@/components/ui/GameToast';
import OracleCard from '@/features/oracle/components/OracleCard';
import { OracleVerdict } from '@/features/oracle/components/OracleVerdict';
import { PushSubscriptionToggle } from '@/features/oracle/components/PushSubscriptionToggle';
import type React from 'react';
import type { DashboardAction, DashboardState } from '../types';

interface FeedPanelProps {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  titanState?: any;
}

export const FeedPanel: React.FC<FeedPanelProps> = ({ state, dispatch, titanState }) => {
  return (
    <section
      id="oracle-recommendation"
      className="bg-forge-800 p-6 rounded-lg shadow-xl border border-forge-700"
    >
      <h2 className="text-2xl font-bold text-magma mb-4 uppercase tracking-wider">
        Oracle&apos;s Wisdom
      </h2>
      {titanState?.dailyDecree && (
        <div className="mb-6 space-y-4">
          <OracleVerdict decree={titanState.dailyDecree} />
          <PushSubscriptionToggle />
        </div>
      )}
      {state.oracleRecommendation ? (
        <OracleCard
          recommendation={state.oracleRecommendation}
          onAccept={(rec) => {
            if (rec.generatedSession) {
              dispatch({
                type: 'START_GENERATED_QUEST',
                payload: rec.generatedSession,
              });
            } else if (rec.sessionId) {
              toast.info(`Traveling to Static Quest: ${rec.sessionId}`);
            }
          }}
        />
      ) : (
        <p className="text-forge-300">The Oracle is contemplating the cosmos...</p>
      )}
    </section>
  );
};
