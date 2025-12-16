
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './pages/Dashboard.tsx';
import './index.css';
import SettingsCog from './components/core/SettingsCog';
import ConfigModal from './components/core/ConfigModal';

const AppWrapper = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if API key and URL are set
    const apiKey = localStorage.getItem('hevy_api_key');
    const proxyUrl = localStorage.getItem('hevy_proxy_url');
    if (apiKey && proxyUrl) {
      setIsConfigured(true);
    } else {
      // If not configured, automatically open the modal
      setModalOpen(true);
    }
  }, []);

  return (
    <React.StrictMode>
      <div className="bg-void min-h-screen text-white">
        <div className="scanlines" />
        <SettingsCog onClick={() => setModalOpen(true)} />
        <ConfigModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        {isConfigured ? <Dashboard /> : 
          <div className="w-full h-screen flex items-center justify-center font-mono text-center p-4">
            <div>
              <h2 className="text-xl text-magma uppercase tracking-widest">Configuration Required</h2>
              <p className="text-forge-muted">Please configure your Hevy API key and Proxy URL by clicking the settings cog.</p>
            </div>
          </div>
        }
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWrapper />);
