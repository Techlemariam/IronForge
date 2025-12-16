
import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsCogProps {
  onClick: () => void;
}

const SettingsCog: React.FC<SettingsCogProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="absolute top-6 right-6 text-forge-muted hover:text-white transition-colors z-50 p-2"
      whileHover={{ rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      title="System Configuration"
    >
      <Settings size={24} />
    </motion.button>
  );
};

export default SettingsCog;
