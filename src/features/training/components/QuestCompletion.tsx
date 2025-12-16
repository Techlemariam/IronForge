
import React from 'react';
import ForgeButton from '../../../components/ui/ForgeButton';
import ForgeCard from '../../../components/ui/ForgeCard';

interface QuestCompletionProps {
    onSave: (isPrivate: boolean) => void;
    onCancel: () => void;
}

const QuestCompletion: React.FC<QuestCompletionProps> = ({ onSave, onCancel }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
            <ForgeCard className="text-center p-8">
                <h1 className="font-heading text-3xl md:text-4xl text-white tracking-widest">PROTOCOL COMPLETE</h1>
                <p className="font-mono text-rune mt-2 mb-6">The trial is over. Log the results in the Archive.</p>
                
                <div className="mb-4">
                    <p className="font-mono text-sm text-forge-muted mb-2">Lås portarna? (Gör loggen privat på Hevy)</p>
                    <div className="flex justify-center space-x-4">
                        <ForgeButton onClick={() => onSave(true)} className="px-8">
                            Ja (Privat)
                        </ForgeButton>
                        <ForgeButton variant="secondary" onClick={() => onSave(false)} className="px-8">
                            Nej (Offentlig)
                        </ForgeButton>
                    </div>
                </div>

                <ForgeButton variant="ghost" onClick={onCancel} className="mt-4">
                    Avbryt
                </ForgeButton>
            </ForgeCard>
        </div>
    );
};

export default QuestCompletion;
