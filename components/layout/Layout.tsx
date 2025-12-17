
import React from 'react';
import { Home, Swords, Gem, UserCircle } from 'lucide-react';

type View = 'citadel' | 'war_room' | 'iron_mines' | 'quest_completion';

interface NavLinkProps {
    icon: React.ElementType;
    label: string;
    view: View;
    currentView: View;
    setView: (view: View) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon: Icon, label, view, currentView, setView }) => {
    const isActive = currentView === view;
    return (
        <a
            href="#"
            onClick={() => setView(view)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-sans transition-all duration-200
                ${isActive
                    ? 'bg-forge-700 text-white shadow-inner'
                    : 'text-zinc-400 hover:bg-forge-800 hover:text-white'
                }`
            }
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-warrior-light' : 'text-zinc-500'}`} />
            <span>{label}</span>
        </a>
    );
};


const Sidebar: React.FC<{ currentView: View, setView: (view: View) => void }> = ({ currentView, setView }) => (
    <aside className="w-64 flex-shrink-0 bg-forge-900 border-r border-forge-border flex flex-col">
        <div className="h-16 border-b border-forge-border flex items-center justify-center">
            <h1 className="text-lg font-serif uppercase tracking-widest text-warrior-light">IronForge</h1>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            <NavLink icon={Home} label="Citadel" view="citadel" currentView={currentView} setView={setView} />
            <NavLink icon={Swords} label="War Room" view="war_room" currentView={currentView} setView={setView} />
            <NavLink icon={Gem} label="Iron Mines" view="iron_mines" currentView={currentView} setView={setView} />
        </nav>
        <div className="border-t border-forge-border p-4">
            <div className="flex items-center space-x-3">
                <UserCircle className="w-8 h-8 text-zinc-500" />
                <div>
                    <p className="text-sm font-bold text-white">Guest</p>
                    <a href="#" className="text-xs text-zinc-400 hover:text-warrior-light">View Profile</a>
                </div>
            </div>
        </div>
    </aside>
);

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <main className="flex-1 relative bg-paper bg-repeat overflow-y-auto custom-scrollbar">
        {children}
    </main>
);

const Layout: React.FC<{ children: React.ReactNode, currentView: View, setView: (view: View) => void }> = ({ children, currentView, setView }) => {
    return (
        <div className="h-screen w-screen bg-forge-950 text-zinc-300 font-sans overflow-hidden flex">
            <div className="scanlines"></div>
            <div className="cinematic-overlay"></div>
            <Sidebar currentView={currentView} setView={setView} />
            <MainContent>{children}</MainContent>
        </div>
    );
};

export default Layout;
