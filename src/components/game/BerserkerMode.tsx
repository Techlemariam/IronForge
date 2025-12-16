
import React from 'react';

interface BerserkerModeProps {
  isActive: boolean;
  onFinish: () => void;
  targetExercise: string;

}

const BerserkerMode: React.FC<BerserkerModeProps> = ({ isActive, onFinish, targetExercise }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <h2 className="text-4xl font-bold text-red-500 animate-pulse">BERSERKER MODE</h2>
      <p className="text-white text-lg mt-4">Finish {targetExercise}!</p>
      <button onClick={onFinish} className="mt-8 px-6 py-2 bg-red-600 text-white font-bold rounded-lg">FINISH</button>
    </div>
  );
};

export default BerserkerMode;
