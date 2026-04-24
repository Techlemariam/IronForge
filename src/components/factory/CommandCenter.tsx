'use client';

import { getFactoryStatsAction } from '@/actions/factory';
import { useEffect, useState } from 'react';
import { CommandCenterPresenter, type FactoryStats } from './CommandCenterPresenter';

export function CommandCenter() {
  const [stats, setStats] = useState<FactoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getFactoryStatsAction();
      if (res.success && res.stats) {
        setStats(res.stats as any);
      }
      setLoading(false);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const toggleEmergencyStop = () => {
    setIsEmergencyStop(!isEmergencyStop);
  };

  return (
    <CommandCenterPresenter
      stats={stats}
      loading={loading}
      isEmergencyStop={isEmergencyStop}
      onToggleEmergencyStop={toggleEmergencyStop}
    />
  );
}
