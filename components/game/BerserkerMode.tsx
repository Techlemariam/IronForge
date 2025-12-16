
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

interface BerserkerModeProps {
  isActive: boolean;
  onFinish: () => void;
  targetExercise: string;
}

const BerserkerMode: React.FC<BerserkerModeProps> = ({ isActive, onFinish, targetExercise }) => {
  const [combo, setCombo] = useState(0);

  // Exempel på hur du kan interagera (detta skulle kopplas till set-loggning)
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCombo(prev => prev + 1); // Simulera att reps loggas
      }, 800);
      
      // Avsluta automatiskt efter en tid för demon
      const timeout = setTimeout(() => {
        onFinish();
        setCombo(0);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isActive, onFinish]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8"
        >
          {/* Röd pulserande vinjett */}
          <motion.div 
            className="absolute inset-0 border-[12px] border-red-600/80 rounded-[32px] shadow-[0_0_100px_50px_rgba(220,38,38,0.5)]"
            animate={{
                scale: [1, 1.02, 1],
                opacity: [0.8, 1, 0.8],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
            }}
          />

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase text-red-500 tracking-widest shadow-red-500/50 [text-shadow:_0_0_12px_var(--tw-shadow-color)]">
              BERSERKER RAGE
            </h2>
            <p className="text-lg text-zinc-300 mt-2 font-mono">
              FINISHER: {targetExercise}
            </p>
          </motion.div>

          <div className="my-16 flex items-center gap-4 text-amber-400">
            <Flame className="w-12 h-12" />
            <motion.div
              key={combo}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="text-8xl font-black font-mono [text-shadow:_0_0_20px_#facc15]"
            >
              x{combo}
            </motion.div>
             <span className="text-4xl font-bold text-zinc-500">COMBO</span>
          </div>

           <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: {delay: 1} }}
              className="text-zinc-400 text-sm animate-pulse"
           >
               KEEP THE COMBO ALIVE
           </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BerserkerMode;
