
import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCategory } from '../types';
import { StorageService } from '../services/storage';
import { X, Dumbbell, Shield, Plus, Trash2, Box, PackagePlus, Hammer, Bike, Check } from 'lucide-react';
import { playSound } from '../utils';

interface EquipmentArmoryProps {
    onClose: () => void;
}

const PRESETS: Partial<Equipment>[] = [
    { name: 'Power Rack', category: 'Rack' },
    { name: 'Olympic Barbell', category: 'Barbell' },
    { name: 'Bumper Plates', category: 'Weights' },
    { name: 'Iron Plates', category: 'Weights' },
    { name: 'Adjustable Bench', category: 'Accessory' },
    { name: 'Dumbbells (Adjustable)', category: 'Weights' },
    { name: 'Kettlebells', category: 'Weights' },
    { name: 'Air Bike', category: 'Cardio' },
    { name: 'Rower', category: 'Cardio' },
    { name: 'Treadmill', category: 'Cardio' },
    { name: 'Cable Pulley', category: 'Machine' },
    { name: 'Leg Extension/Curl', category: 'Machine' },
    { name: 'GHD', category: 'Accessory' },
];

const EquipmentArmory: React.FC<EquipmentArmoryProps> = ({ onClose }) => {
    const [inventory, setInventory] = useState<Equipment[]>([]);
    const [activeTab, setActiveTab] = useState<'INVENTORY' | 'REQUISITION'>('INVENTORY');
    
    // Custom Add State
    const [customName, setCustomName] = useState('');
    const [customCategory, setCustomCategory] = useState<EquipmentCategory>('Accessory');

    useEffect(() => {
        const load = async () => {
            const data = await StorageService.getState<Equipment[]>('equipment');
            if (data) setInventory(data);
        };
        load();
    }, []);

    const saveInventory = async (newInventory: Equipment[]) => {
        setInventory(newInventory);
        await StorageService.saveState('equipment', newInventory);
    };

    const addEquipment = (item: Partial<Equipment>) => {
        const newEq: Equipment = {
            id: `eq_${Date.now()}_${Math.random()}`,
            name: item.name || 'Unknown Item',
            category: item.category || 'Accessory',
            isOwned: true
        };
        const updated = [...inventory, newEq];
        saveInventory(updated);
        playSound('ding');
    };

    const removeEquipment = (id: string) => {
        const updated = inventory.filter(i => i.id !== id);
        saveInventory(updated);
    };

    const handleCustomAdd = () => {
        if (!customName) return;
        addEquipment({ name: customName, category: customCategory });
        setCustomName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in font-serif">
            <div className="w-full max-w-4xl bg-[#111] border-2 border-zinc-700 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-zinc-800 border border-zinc-600 rounded">
                            <Box className="w-6 h-6 text-zinc-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-zinc-200 tracking-tighter">The Armory</h2>
                            <p className="text-xs text-zinc-500 font-sans tracking-widest">Home Gym Logistics & Supply</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-[#0a0a0a]">
                    <button 
                        onClick={() => setActiveTab('INVENTORY')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'INVENTORY' ? 'bg-[#111] text-[#c79c6e] border-t-2 border-[#c79c6e]' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Current Inventory ({inventory.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('REQUISITION')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'REQUISITION' ? 'bg-[#111] text-[#c79c6e] border-t-2 border-[#c79c6e]' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Requisition (Add New)
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                    
                    {/* INVENTORY TAB */}
                    {activeTab === 'INVENTORY' && (
                        <div className="space-y-4">
                            {inventory.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <Box className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                                    <h3 className="text-zinc-500 font-bold uppercase">Armory Empty</h3>
                                    <p className="text-zinc-600 text-sm mt-2">Go to Requisition to stock your gym.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {inventory.map(item => (
                                        <div key={item.id} className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded group hover:border-[#c79c6e] transition-colors relative">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-zinc-900 rounded text-zinc-500">
                                                        {item.category === 'Barbell' && <Hammer className="w-5 h-5" />}
                                                        {item.category === 'Weights' && <Dumbbell className="w-5 h-5" />}
                                                        {item.category === 'Cardio' && <Bike className="w-5 h-5" />}
                                                        {item.category === 'Rack' && <Shield className="w-5 h-5" />}
                                                        {(item.category === 'Accessory' || item.category === 'Machine') && <Box className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-200">{item.name}</div>
                                                        <div className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider">{item.category}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeEquipment(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all"
                                                    title="Scrap Item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REQUISITION TAB */}
                    {activeTab === 'REQUISITION' && (
                        <div className="space-y-8">
                            {/* Standard Issue */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                                    <PackagePlus className="w-4 h-4" /> Standard Issue Gear
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {PRESETS.map((preset, idx) => {
                                        const isOwned = inventory.some(i => i.name === preset.name);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => !isOwned && addEquipment(preset)}
                                                disabled={isOwned}
                                                className={`p-3 rounded border text-left flex items-center justify-between transition-all ${
                                                    isOwned 
                                                    ? 'bg-zinc-900 border-zinc-800 opacity-50 cursor-default' 
                                                    : 'bg-[#1a1a1a] border-zinc-700 hover:border-[#c79c6e] hover:bg-zinc-800'
                                                }`}
                                            >
                                                <span className={`text-sm font-bold ${isOwned ? 'text-zinc-600' : 'text-zinc-300'}`}>{preset.name}</span>
                                                {isOwned ? <Check className="w-4 h-4 text-green-800" /> : <Plus className="w-4 h-4 text-zinc-500" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Custom Order */}
                            <div className="bg-[#1a1a1a] border border-zinc-800 p-6 rounded-lg">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Hammer className="w-4 h-4" /> Custom Fabrication
                                </h3>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 space-y-1 w-full">
                                        <label className="text-[10px] uppercase font-bold text-zinc-600">Item Name</label>
                                        <input 
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            placeholder="e.g. Reverse Hyper"
                                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-200 focus:border-[#c79c6e] focus:outline-none"
                                        />
                                    </div>
                                    <div className="w-full md:w-48 space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-zinc-600">Category</label>
                                        <select 
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value as EquipmentCategory)}
                                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-200 focus:border-[#c79c6e] focus:outline-none"
                                        >
                                            <option value="Barbell">Barbell</option>
                                            <option value="Weights">Weights</option>
                                            <option value="Machine">Machine</option>
                                            <option value="Cardio">Cardio</option>
                                            <option value="Rack">Rack</option>
                                            <option value="Accessory">Accessory</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleCustomAdd}
                                        disabled={!customName}
                                        className="w-full md:w-auto px-6 py-3 bg-[#c79c6e] hover:bg-[#d4a87a] text-[#46321d] font-bold uppercase tracking-widest rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Fabricate
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentArmory;
