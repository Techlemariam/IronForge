import React, { useEffect, useState } from 'react';
import { getHevyRoutines } from '../../services/hevy';
import { HevyRoutine } from '../../types/hevy';

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
        setRoutines(data);
      } catch (err) {
        setError('Failed to establish comms with Hevy HQ.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><div>Loading...</div></div>;
  if (error) return <div className="text-blood-DEFAULT text-center p-10 font-mono">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-heading text-magma-DEFAULT mb-6 tracking-widest border-b border-forge-border pb-2">
        MISSION SELECT
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => onSelectRoutine(routine)}
            className="group relative forge-card hover:border-magma-DEFAULT transition-all duration-300 text-left p-6"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-magma-DEFAULT/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h3 className="text-xl font-heading text-white group-hover:text-magma-DEFAULT mb-2">
              {routine.title}
            </h3>
            <div className="text-forge-muted font-mono text-sm">
              {routine.exercises.length} Encounters (Exercises)
            </div>
            {routine.notes && (
              <p className="text-xs text-forge-muted mt-2 italic border-l-2 border-forge-border pl-2">
                "{routine.notes}"
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoutineSelector;
