import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BerserkerOverlayProps {
  isActive: boolean;
}

const BerserkerOverlay: React.FC<BerserkerOverlayProps> = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
        >
          {/* Red Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(220,38,38,0.4)_100%)] animate-pulse"></div>

          {/* Blood Particles / Rage Lines (CSS Animation) */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

          {/* Text Overlay */}
          <div className="absolute bottom-1/4 left-0 right-0 text-center">
            <motion.h2
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-6xl font-black text-red-600 italic uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]"
              style={{ WebkitTextStroke: "2px black" }}
            >
              RAGE ACTIVE
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BerserkerOverlay;
