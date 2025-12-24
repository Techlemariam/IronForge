'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, CheckCircle, AlertTriangle, X, ArrowRight, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

interface HevyImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'INTRO' | 'UPLOAD' | 'PARSING' | 'CONFIRM' | 'DONE';

export const HevyImportWizard: React.FC<HevyImportWizardProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('INTRO');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStep('PARSING');
            // Simulate parsing
            setTimeout(() => {
                // Mock parsed data
                setParsedData({
                    workouts: 58,
                    exercises: 125,
                    prs: 12
                });
                setStep('CONFIRM');
            }, 1500);
        }
    };

    const handleConfirm = () => {
        // TODO: Call server action to persist
        toast.success("Import complete! Your history has been merged.");
        setStep('DONE');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-orange-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-600 rounded-lg text-white">
                            <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Import from Hevy</h2>
                            <p className="text-xs text-zinc-400">Bring your workout history</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 'INTRO' && (
                            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                                <p className="text-zinc-300">
                                    Transfer your Hevy workout history to IronForge. Your PRs, volume, and exercise data will be merged.
                                </p>
                                <div className="bg-orange-900/10 border border-orange-800/30 p-4 rounded-lg text-left text-sm">
                                    <h4 className="text-orange-400 font-bold mb-2">How to Export from Hevy:</h4>
                                    <ol className="list-decimal list-inside text-zinc-400 space-y-1">
                                        <li>Open Hevy App → Settings</li>
                                        <li>Tap &quot;Account&quot; → &quot;Export Data&quot;</li>
                                        <li>Select JSON format</li>
                                        <li>Download and upload here</li>
                                    </ol>
                                </div>
                                <button onClick={() => setStep('UPLOAD')} className="w-full py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 flex items-center justify-center gap-2">
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 'UPLOAD' && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                                    <Upload className="w-12 h-12 text-zinc-500 mb-3" />
                                    <span className="text-zinc-400">Drop your Hevy export here</span>
                                    <span className="text-xs text-zinc-600 mt-1">Supports .json</span>
                                    <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
                                </label>
                            </motion.div>
                        )}

                        {step === 'PARSING' && (
                            <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-zinc-400">Analyzing your history...</p>
                            </motion.div>
                        )}

                        {step === 'CONFIRM' && parsedData && (
                            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg text-center">
                                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="text-green-300 font-bold">Ready to Import</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-zinc-800 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{parsedData.workouts}</div>
                                        <div className="text-xs text-zinc-500 uppercase">Workouts</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{parsedData.exercises}</div>
                                        <div className="text-xs text-zinc-500 uppercase">Exercises</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-400">{parsedData.prs}</div>
                                        <div className="text-xs text-zinc-500 uppercase">PRs</div>
                                    </div>
                                </div>
                                <button onClick={handleConfirm} className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
                                    Confirm Import
                                </button>
                            </motion.div>
                        )}

                        {step === 'DONE' && (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-green-700">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Import Successful!</h3>
                                <p className="text-zinc-400 text-sm">Your history has been merged. Welcome to IronForge, Titan.</p>
                                <button onClick={onClose} className="mt-4 px-6 py-3 bg-zinc-700 text-white font-bold rounded-lg hover:bg-zinc-600">
                                    Close
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
