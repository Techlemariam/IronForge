
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronsRight, CheckCircle } from 'lucide-react';
import { Exercise } from '../../../types/ironforge';
import SetRow from './SetRow';
import SetInput from './SetInput';
import ForgeCard from '../../../components/ui/ForgeCard';

interface ExerciseViewProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
}

const cardVariants = {
  inactive: { opacity: 0.5, scale: 0.95 },
  active: { opacity: 1, scale: 1 },
  completed: { opacity: 0.35, scale: 0.92 },
};

const ExerciseView: React.FC<ExerciseViewProps> = ({ exercise, isActive, isCompleted, onSetLog }) => {
  const activeSet = exercise.sets.find(s => !s.completed);
  const allSetsCompleted = exercise.sets.every(s => s.completed);

  const getAnimationState = () => {
    if (allSetsCompleted || isCompleted) return "completed";
    if (isActive) return "active";
    return "inactive";
  }

  return (
    <motion.div 
      variants={cardVariants} 
      animate={getAnimationState()}
      initial="inactive"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      layout
    >
      <ForgeCard className={`transition-all duration-500 ${isActive ? 'border-magma/80 shadow-glow-magma/40' : 'border-white/10'}`}>
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-white tracking-wider">{exercise.name}</h3>
            {allSetsCompleted ? (
                <CheckCircle className="text-green-500" />
            ) : isActive ? (
                <ChevronsRight className="text-magma animate-pulse" />
            ) : (
                <ChevronDown className="text-forge-muted" />
            )}
        </div>
        
        <div className="space-y-2 mb-4">
          {exercise.sets.map((set, index) => (
            <SetRow key={set.id} set={set} setNumber={index + 1} />
          ))}
        </div>

        {isActive && activeSet && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
             <SetInput 
                onSetLog={onSetLog} 
                targetReps={activeSet.targetReps || 0}
                targetRPE={activeSet.targetRPE || 8}
             />
          </motion.div>
        )}
      </ForgeCard>
    </motion.div>
  );
};

export default ExerciseView;
