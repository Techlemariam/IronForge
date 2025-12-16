
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeCard from '../ui/ForgeCard';
import ForgeInput from '../ui/ForgeInput';
import ForgeButton from '../ui/ForgeButton';
import { X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');

  useEffect(() => {
    // Load saved settings from localStorage
    const savedApiKey = localStorage.getItem('hevy_api_key');
    const savedProxyUrl = localStorage.getItem('hevy_proxy_url');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProxyUrl) setProxyUrl(savedProxyUrl);
  }, []);

  const handleSave = () => {
    localStorage.setItem('hevy_api_key', apiKey);
    localStorage.setItem('hevy_proxy_url', proxyUrl);
    onClose();
    // Optional: Add a success message or trigger a re-fetch of data
    alert('Configuration saved. The page will now reload to apply changes.');
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <ForgeCard 
            as={motion.div} 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="w-full max-w-md relative border-magma/50 shadow-glow-magma/50"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-forge-muted hover:text-white transition-colors">
                <X size={20} />
            </button>

            <h2 className="font-heading text-xl text-magma tracking-widest uppercase mb-4">System Configuration</h2>
            
            <div className="space-y-4">
                <p className='font-mono text-sm text-forge-muted'>
                    Provide your Hevy API credentials to establish the data uplink. This information is stored locally on your device.
                </p>
                <ForgeInput
                    label="Hevy API Key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Enter your API Key"
                />
                <ForgeInput
                    label="CORS Proxy URL"
                    value={proxyUrl}
                    onChange={e => setProxyUrl(e.target.value)}
                    placeholder="Enter your proxy URL"
                />
            </div>

            <div className="mt-6 flex justify-end">
              <ForgeButton variant="magma" onClick={handleSave}>
                Save & Reload
              </ForgeButton>
            </div>
          </ForgeCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfigModal;
