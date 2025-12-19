import React, { useEffect, useState, useRef } from 'react';
import ForgeButton from '../../../components/ui/ForgeButton';
import ForgeCard from '../../../components/ui/ForgeCard';
import LootDropNotification from '../../../components/game/LootDrop';
import { rollLootTable } from '../../../utils/lootEngine';
import { LT_STANDARD_QUEST } from '../../../data/lootTables';
import { LootDrop } from '../../../types/loot';

interface QuestCompletionProps {
    onSave: (isPrivate: boolean) => void;
    onCancel: () => void;
}

const QuestCompletion: React.FC<QuestCompletionProps> = ({ onSave, onCancel }) => {
    const [drops, setDrops] = useState<LootDrop[]>([]);
    const hasRolled = useRef(false);

    useEffect(() => {
        if (!hasRolled.current) {
            // Roll for loot!
            const rewards = rollLootTable(LT_STANDARD_QUEST);
            setDrops(rewards);
            hasRolled.current = true;
        }
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
            <ForgeCard className="text-center p-8 w-full max-w-2xl">
                <h1 className="font-heading text-3xl md:text-4xl text-white tracking-widest">PROTOCOL COMPLETE</h1>
                <p className="font-mono text-rune mt-2 mb-6">The trial is over. Log the results in the Archive.</p>

                {/* LOOT SECTION */}
                <div className="mb-8 min-h-[150px]">
                    {drops.length > 0 && <LootDropNotification drops={drops} />}
                </div>

                <div className="mb-4 pt-4 border-t border-forge-border">
                    <p className="font-mono text-sm text-forge-muted mb-2">Lås portarna? (Gör loggen privat på Hevy)</p>
                    <div className="flex justify-center space-x-4">
                        <ForgeButton onClick={() => onSave(true)} className="px-8">
                            Ja (Privat)
                        </ForgeButton>
                        <ForgeButton variant="default" onClick={() => onSave(false)} className="px-8">
                            Nej (Offentlig)
                        </ForgeButton>
                    </div>
                </div>

                <ForgeButton variant="default" onClick={onCancel} className="mt-4">
                    Avbryt
                </ForgeButton>
            </ForgeCard>
        </div>
    );
};

export default QuestCompletion;
