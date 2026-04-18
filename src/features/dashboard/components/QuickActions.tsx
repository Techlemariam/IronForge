import { CitadelHub } from '@/features/dashboard/CitadelHub';
import type React from 'react';
import type { DashboardAction } from '../types';

interface QuickActionsProps {
  dispatch: React.Dispatch<DashboardAction>;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ dispatch }) => {
  return (
    <section id="quick-actions">
      <CitadelHub dispatch={dispatch} />
    </section>
  );
};
