
import React, { useEffect } from 'react';
import { Achievement } from '../types';
import { Shield } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
        onClose();
    }, 4000); // Show for 4 seconds
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] animate-toast-slide-down pointer-events-none">
      <div className="relative w-[320px] h-[80px] bg-gradient-to-b from-[#333] to-[#111] border-2 border-[#b8860b] rounded shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>

         {/* Icon Section */}
         <div className="relative z-10 w-20 h-full flex items-center justify-center bg-gradient-to-b from-[#b8860b] to-[#8b6508] border-r-2 border-[#ffd700]">
             <Shield className="w-10 h-10 text-white drop-shadow-md" fill="black" />
         </div>

         {/* Text Section */}
         <div className="relative z-10 flex-1 px-4 flex flex-col justify-center">
             <div className="text-[#ffd700] font-serif text-xs uppercase tracking-widest font-bold mb-1 drop-shadow-sm">
                 Achievement Earned
             </div>
             <div className="text-white font-serif font-bold leading-none mb-1 text-sm">
                 {achievement.title}
             </div>
             <div className="text-zinc-400 text-[10px] font-sans">
                 {achievement.description}
             </div>
         </div>

         {/* Points Badge */}
         <div className="absolute top-2 right-2 bg-black/50 border border-[#b8860b] rounded-full px-2 py-0.5 text-[9px] font-bold text-[#ffd700]">
             {achievement.points}
         </div>
         
         {/* Shine effect */}
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes toastSlideDown {
            0% { transform: translate(-50%, -100%); opacity: 0; }
            10% { transform: translate(-50%, 0); opacity: 1; }
            90% { transform: translate(-50%, 0); opacity: 1; }
            100% { transform: translate(-50%, -100%); opacity: 0; }
        }
        @keyframes shine {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
        }
        .animate-toast-slide-down {
            animation: toastSlideDown 4s ease-in-out forwards;
        }
        .animate-shine {
            animation: shine 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AchievementToast;
