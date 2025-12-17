
import React, { useState } from 'react';
import Dashboard from './src/pages/Dashboard';
import Layout from './components/layout/Layout';

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('citadel');

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      <Dashboard currentView={currentView} setCurrentView={setCurrentView} />
    </Layout>
  );
};

export default App;
