import React from "react";

interface QuestCompletionProps {
    onSave: (isPrivate: boolean) => void;
    onCancel: () => void;
}

export const QuestCompletion: React.FC<QuestCompletionProps> = ({ onSave, onCancel }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-forge-900 text-white p-4">
        <h2 className="text-4xl font-bold text-magma mb-8 animate-pulse">
            Quest Completed!
        </h2>
        <div className="flex space-x-4">
            <button
                onClick={() => onSave(false)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Save & Share
            </button>
            <button
                onClick={() => onSave(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Save Privately
            </button>
            <button
                onClick={onCancel}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-semibold shadow-lg transition-colors"
            >
                Discard
            </button>
        </div>
    </div>
);
