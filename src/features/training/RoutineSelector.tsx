
import React, { useEffect, useState } from 'react';
import { getHevyRoutines } from '../../services/hevy';
import { HevyRoutine } from '../../types/hevy';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeCard from '../../components/ui/ForgeCard'; // <-- INTEGRATED
import ForgeButton from '../../components/ui/ForgeButton'; // <-- INTEGRATED

// --- Mission Briefing Modal ---
const MissionBriefing: React.FC<{ routine: HevyRoutine; exerciseNameMap: Map<string, string>; onInitiate: (routine: HevyRoutine) => void; onCancel: () => void; }> = ({ routine, exerciseNameMap, onInitiate, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-lg"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <ForgeCard className="shadow-2xl border-magma/50">
          <h2 className="font-heading text-2xl text-magma tracking-widest uppercase mb-2">Mission Briefing</h2>
          <p className="font-mono text-lg text-white mb-6 border-b-2 border-forge-border pb-4">{routine.title}</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-body text-sm uppercase tracking-wider text-forge-muted mb-2">Targeted Encounters</h3>
              <ul className="list-disc list-inside font-mono text-white">
                {routine.exercises?.map((ex, index) => {
                  const name = exerciseNameMap.get(ex.exercise_template_id) || ex.exercise_template?.title || 'Unknown Exercise';
                  return (
                    <li key={`${ex.exercise_template_id || 'unknown'}-${index}`}>
                      {name}
                    </li>
                  );
                })}
              </ul>
            </div>
            {routine.notes && (
              <div>
                <h3 className="font-body text-sm uppercase tracking-wider text-forge-muted mb-2">Intel</h3>
                <p className='font-mono text-sm text-white/80 italic'>&quot;{routine.notes}&quot;</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <ForgeButton variant="default" onClick={onCancel}>
              Cancel
            </ForgeButton>
            <ForgeButton variant="magma" onClick={() => onInitiate(routine)}>
              Initiate Protocol
            </ForgeButton>
          </div>
        </ForgeCard>
      </motion.div>
    </motion.div>
  )
}

// --- Main Component: The War Room ---
const RoutineSelector: React.FC<{ exerciseNameMap: Map<string, string>; onSelectRoutine: (routine: HevyRoutine) => void; }> = ({ exerciseNameMap, onSelectRoutine }) => {
  const [routines, setRoutines] = useState<HevyRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<HevyRoutine | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await getHevyRoutines();
        setRoutines(data.routines || []);
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
  if (error) return <ForgeCard className="text-blood text-center p-10 font-mono m-4 border-blood">{error}</ForgeCard>;

  return (
    <>
      <AnimatePresence>
        {selected &&
          <MissionBriefing
            routine={selected}
            exerciseNameMap={exerciseNameMap}
            onCancel={() => setSelected(null)}
            onInitiate={onSelectRoutine}
          />}
      </AnimatePresence>

      <div className="p-4 md:p-8 animate-fade-in">
        <h1 className="font-heading text-2xl md:text-3xl text-white mb-8 tracking-widest uppercase text-center">
          The War Room
        </h1>

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden" animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {routines.map((routine) => (
            <motion.div
              key={routine.id}
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="w-full"
            >
              <button
                className="w-full text-left"
                onClick={() => setSelected(routine)}
              >
                <ForgeCard
                  className="group relative border-l-4 border-l-magma transition-all duration-300 hover:border-magma hover:shadow-glow-magma transform hover:-translate-y-1"
                >
                  <div>
                    <h3 className="font-heading text-lg text-white group-hover:text-magma mb-2 transition-colors duration-300">
                      {routine.title}
                    </h3>
                    <div className="font-mono text-xs uppercase tracking-wide text-forge-muted">
                      {routine.exercises?.length || 0} Encounters
                    </div>
                  </div>
                </ForgeCard>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {routines.length === 0 && !loading && (
          <ForgeCard className="text-center p-10 font-mono text-forge-muted border-dashed mt-8">
            <h3 className="text-lg font-heading text-white mb-2">No Missions Found</h3>
            <p className="text-sm">The War Room is empty. Create routines in Hevy to plan your incursions.</p>
          </ForgeCard>
        )}
      </div>
    </>
  );
};

export default RoutineSelector;
