
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ForgeButton from '../../../components/ui/ForgeButton';
import ForgeCard from '../../../components/ui/ForgeCard';
import { playSound } from '../../../utils';

interface BerserkerModeProps {
  lastExerciseName: string;
  onComplete: (reps: number) => void;
}

const BERSERKER_DURATION = 15; // 15 seconds for intense AMRAP

const BerserkerMode: React.FC<BerserkerModeProps> = ({ lastExerciseName, onComplete }) => {
  const [reps, setReps] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(BERSERKER_DURATION);

  useEffect(() => {
    playSound('loot_epic');
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleComplete = () => {
    const finalReps = parseInt(reps, 10) || 0;
    playSound('achievement');
    onComplete(finalReps);
  };

  const isTimerActive = timeLeft > 0;
  const progressPercentage = (timeLeft / BERSERKER_DURATION) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ForgeCard className="w-full max-w-md text-center border-blood shadow-glow-blood">
        <h2 className="font-heading text-4xl text-blood animate-pulse tracking-widest">BERSERKER MODE</h2>
        <p className="font-mono text-rune mt-2">Final set of {lastExerciseName}.</p>
        <p className="text-white text-lg mt-1">As Many Reps As Possible!</p>

        <div className="my-8">
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle className="text-gray-800" strokeWidth="5" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
              <motion.circle
                className="text-blood"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <span className="font-mono text-5xl text-whitetabular-nums">
              {isTimerActive ? timeLeft : "0"}
            </span>
          </div>
          <p className="font-mono text-sm text-rune mt-2">TIME REMAINING</p>
        </div>


        {isTimerActive ? (
          <div className='h-20'>
            <p className='text-forge-muted animate-pulse'>Finish your set...</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Enter Your Reps"
              className="w-48 text-center bg-black border-2 border-gray-600 rounded-md p-2 text-2xl mb-4 focus:border-blood focus:outline-none"
              autoFocus
            />
            <ForgeButton onClick={handleComplete} variant="magma" className='px-10'>
              Log Fury
            </ForgeButton>
          </motion.div>
        )}
      </ForgeCard>
    </motion.div>
  );
};

export default BerserkerMode;
