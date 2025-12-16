import React, { useEffect, useState } from 'react';
import { getHevyRoutines } from '../../services/hevy';
import { HevyRoutine } from '../../types/hevy';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface RoutineSelectorProps {
  onSelectRoutine: (routine: HevyRoutine) => void;
}

const RoutineSelector: React.FC<RoutineSelectorProps> = ({ onSelectRoutine }) => {
  const [routines, setRoutines] = useState<HevyRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await getHevyRoutines();
        console.log('--- INSPECTING HEVY RESPONSE ---', data); // Let's see what we got!
        setRoutines(data.routines || []); // VICTORY! The correct property is 'routines'
      } catch (err) {
        console.error(err);
        setError('Hevy Uplink Failed. Check API Key & Proxy.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  if (loading) return <div className="p-10 flex justify-center h-64 items-center"><LoadingSpinner /></div>;
  if (error) return <div className="text-blood-DEFAULT text-center p-10 font-mono border border-blood-DEFAULT bg-blood-DEFAULT/10 m-4">{error}</div>;

  if (routines.length === 0 && !loading) {
    return (
        <div className="text-center p-10 font-mono text-forge-muted">
            <h3 className="text-lg font-heading text-white mb-2">No Missions Found</h3>
            <p className="text-sm">Could not find any routines in your Hevy account.</p>
            <p className="text-xs mt-4">Make sure you have at least one saved routine on Hevy.</p>
        </div>
    );
}

  return (
    <div className="p-4 animate-fade-in">
      <h2 className="text-2xl font-heading text-magma-DEFAULT mb-6 tracking-widest border-b border-forge-border pb-2 uppercase">
        Select Mission
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => onSelectRoutine(routine)}
            className="group relative forge-card hover:border-magma-DEFAULT transition-all duration-300 text-left p-6 flex flex-col justify-between min-h-[160px]"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-magma-DEFAULT/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div>
              <h3 className="text-lg font-heading text-white group-hover:text-magma-DEFAULT mb-2 transition-colors">
                {routine.title}
              </h3>
              <div className="text-forge-muted font-mono text-xs uppercase tracking-wide">
                {routine.exercises.length} Encounters
              </div>
            </div>

            {routine.notes && (
              <p className="text-xs text-forge-muted mt-4 italic border-l-2 border-forge-border pl-2 line-clamp-2">
                "{routine.notes}"
              </p>
            )}
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-magma-DEFAULT text-xs font-mono">
              [INITIATE]
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoutineSelector;
