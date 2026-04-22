import { motion } from 'framer-motion';
import type React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs uppercase text-forge-muted tracking-widest">
          {label}
        </span>
        <span className="font-mono text-xs text-rarity-rare">{`${current} / ${total}`}</span>
      </div>
      <div className="w-full h-2 bg-black border border-t-transparent border-b-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-rarity-legendary to-rarity-gold rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
