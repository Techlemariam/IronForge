import React from 'react';
// import { NavAction, View } from '@/types/navigation'; // Removing unused import
import { Sword, Map, Castle, Mic, Footprints, Bike, Dumbbell, Scroll, Skull, ShoppingBag, Shield, Users, Gavel } from 'lucide-react';
import { DashboardAction } from '@/features/dashboard/DashboardClient';

// Shared NavButton Style
const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon?: React.ReactNode, variant?: 'magma' | 'nature' | 'iron' }> = ({ onClick, children, icon, variant = 'magma' }) => {
    const variants = {
        magma: 'border-red-900/50 bg-gradient-to-br from-red-950 to-orange-950 hover:border-red-500 text-red-200',
        nature: 'border-green-900/50 bg-gradient-to-br from-green-950 to-emerald-950 hover:border-green-500 text-green-200',
        iron: 'border-blue-900/50 bg-gradient-to-br from-slate-950 to-blue-950 hover:border-blue-500 text-blue-200'
    };

    return (
        <button
            onClick={onClick}
            className={`
                relative flex items-center p-3 border rounded-lg shadow-lg transition-all duration-200 group w-full text-left
                ${variants[variant]}
            `}
        >
            {icon && <span className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
            <span className="font-bold uppercase tracking-wide text-xs md:text-sm relative z-10">{children}</span>
        </button>
    );
};

interface DistrictProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

const District: React.FC<DistrictProps> = ({ title, icon, color, children }) => (
    <div className={`p-4 rounded-xl border border-${color}-800/30 bg-black/40 backdrop-blur-sm flex flex-col space-y-4`}>
        <div className={`flex items-center space-x-2 text-${color}-400 border-b border-${color}-900/50 pb-2`}>
            {icon}
            <h3 className="text-lg font-bold uppercase tracking-widest">{title}</h3>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

interface CitadelHubProps {
    dispatch: React.Dispatch<DashboardAction>;
}

export const CitadelHub: React.FC<CitadelHubProps> = ({ dispatch }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-white">

        {/* DISTRICT 1: TRAINING GROUNDS */}
        <District title="Training Grounds" icon={<Dumbbell className="w-6 h-6" />} color="red">
            <NavButton variant="magma" icon={<Scroll className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'war_room' })}>
                New Quest
            </NavButton>
            <NavButton variant="magma" icon={<Map className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'training_center' })}>
                Training Path
            </NavButton>
            <NavButton variant="magma" icon={<Bike className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_CARDIO_MODE', payload: 'cycling' })}>
                Cycling Studio
            </NavButton>
            <NavButton variant="magma" icon={<Footprints className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_CARDIO_MODE', payload: 'running' })}>
                Treadmill
            </NavButton>
        </District>

        {/* DISTRICT 2: THE WILDS */}
        <District title="The Wilds" icon={<Map className="w-6 h-6" />} color="green">
            <NavButton variant="nature" icon={<Map className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'world_map' })}>
                World Map
            </NavButton>
            <NavButton variant="nature" icon={<Skull className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'bestiary' })}>
                Bestiary
            </NavButton>
            <NavButton variant="nature" icon={<Scroll className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'grimoire' })}>
                Grimoire
            </NavButton>
        </District>

        {/* DISTRICT 3: IRON CITY */}
        <District title="Iron City" icon={<Castle className="w-6 h-6" />} color="blue">
            <NavButton variant="iron" icon={<Gavel className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'forge' })}>
                The Forge
            </NavButton>
            <NavButton variant="iron" icon={<Shield className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'armory' })}>
                Armory
            </NavButton>
            <NavButton variant="iron" icon={<ShoppingBag className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'marketplace' })}>
                Marketplace
            </NavButton>
            <NavButton variant="iron" icon={<Sword className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'arena' })}>
                PvP Arena
            </NavButton>
            <NavButton variant="iron" icon={<Users className="w-4 h-4" />} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'guild_hall' })}>
                Guild Hall
            </NavButton>
        </District>

    </div>
);
