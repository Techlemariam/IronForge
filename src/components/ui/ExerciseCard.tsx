
import React from 'react';
import { Exercise } from '../../types/ironforge';

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  index: number;
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  activeRef: React.RefObject<HTMLDivElement> | null;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isActive }) => {
  return (
    <div className={`p-4 ${isActive ? 'border-magma-DEFAULT' : 'border-transparent'} border-2 rounded-lg`}>
      <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
    </div>
  );
};

export default ExerciseCard;
