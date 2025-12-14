import React from 'react';
import TTB_Radar from './TTB_Radar';
import { TTBIndices, IntervalsWellness } from '../types';
import { LayoutGrid, Map, Swords, User, Settings, Database, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  ttb: TTBIndices | null;
  wellness: IntervalsWellness | null;
  heroName?: string;
  level?: number;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, ttb, wellness, heroName = "Titan", level = 1, onNavigate }) => {
  
  // Calculate TSB for the Radar
  const tsb = wellness?.tsb || 0;

  return (
    <div className="flex h-screen w-screen bg-forge-950 text-zinc-300 font-sans overflow-hidden">
        
        {/* --- FIXED SIDEBAR (HUD) --- */}
        <aside className="w-64 flex-shrink-0 bg-forge-900 border-r border-forge-border flex flex-col z-50 shadow-2xl relative">
            
            {/* Header / Branding */}
            <div className="h-16 flex items-center px-6 border-b border-forge-border bg-forge-950/50">
                <div className="w-8 h-8 bg-magma rounded flex items-center justify-center mr-3 shadow-[0_0_10px_#ff4500]">
                    <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-serif font-black text-white tracking-widest text-sm uppercase">IronForge</h1>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">System Online</span>
                    </div>
                </div>
            </div>

            {/* TTB Radar Widget */}
            <div className="p-4 border-b border-forge-border bg-[#0f1012]">
                <TTB_Radar indices={ttb} tsb={tsb} />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest mb-2 px-2">Command Center</div>
                
                <NavButton icon={<Map />} label="Campaign Map" onClick={() => onNavigate('dashboard')} active />
                <NavButton icon={<Swords />} label="Guild Hall" onClick={() => onNavigate('guild')} />
                <NavButton icon={<Database />} label="Armory" onClick={() => onNavigate('armory')} />
                <NavButton icon={<User />} label="Character" onClick={() => onNavigate('character')} />
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-forge-border bg-forge-950/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{heroName}</div>
                        <div className="text-xs text-magma font-mono">Lvl {level} Titan</div>
                    </div>
                    <button onClick={() => onNavigate('settings')} className="text-zinc-500 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-paper bg-repeat">
            {/* Top Bar (Mobile Only? Or Contextual?) - For now kept simple */}
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </main>

    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group ${active ? 'bg-forge-800 text-white border-l-2 border-magma' : 'text-zinc-500 hover:bg-forge-800 hover:text-zinc-300'}`}
    >
        <span className={`transition-colors ${active ? 'text-magma' : 'group-hover:text-zinc-300'}`}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number | string }>, { size: 18 })}
        </span>
        <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
    </button>
);

export default Layout;