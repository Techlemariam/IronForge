
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeCard from '../ui/ForgeCard';
import ForgeInput from '../ui/ForgeInput';
import ForgeButton from '../ui/ForgeButton';
import IntegrationsPanel from '../settings/IntegrationsPanel';
import MigrationTool from '../settings/MigrationTool';
import { X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hevyConnected: boolean;
  intervalsConnected: boolean;
  stravaConnected: boolean;
  initialFaction: any;
  checkDemoStatus?: boolean;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, userId, hevyConnected, intervalsConnected, stravaConnected, initialFaction, checkDemoStatus }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="w-full max-w-md relative"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <ForgeCard className="w-full shadow-[0_0_50px_rgba(255,87,34,0.15)] border-magma/30 bg-[#0a0a0a]">
              <button onClick={onClose} className="absolute top-3 right-3 text-forge-muted hover:text-white transition-colors z-10">
                <X size={20} />
              </button>

              <h2 className="font-heading text-xl text-magma tracking-widest uppercase mb-6 flex items-center gap-2">
                System Configuration
              </h2>

              <div className="space-y-6">
                <IntegrationsPanel
                  userId={userId}
                  hevyConnected={hevyConnected}
                  intervalsConnected={intervalsConnected}
                  stravaConnected={stravaConnected}
                  checkDemoStatus={checkDemoStatus}
                  initialFaction={initialFaction}
                  onIntegrationChanged={() => {
                    // Optional: Trigger full page reload if deep state needs refresh
                    // window.location.reload(); 
                    // For now, let's just close to let the user see the UI update if we had optimistic UI, 
                    // but since we rely on page props for 'Connected' status in generic UI, a refresh is safer.
                    window.location.reload();
                  }}
                />

                <div className="border-t border-white/5 pt-4 mt-6">
                  <MigrationTool />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <ForgeButton variant="ghost" size="sm" onClick={onClose}>
                  Done
                </ForgeButton>
              </div>
            </ForgeCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfigModal;
