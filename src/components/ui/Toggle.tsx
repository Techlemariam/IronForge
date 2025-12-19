
import React from 'react';

// Simplified toggle from standard UI lib
interface ToggleProps {
    className?: string;
    // other props... we might not need them for now if we use a different structure in armory
    // Wait, the Armory usage is: just import. 
    // Actually, looking at Armory code, I didn't use the Toggle component in the render!
    // I built a custom toggle div in lines 71-76:
    // <div onClick={toggleHyperProMode} ...

    // So the import "import { Toggle } from '../../components/ui/Toggle';" is likely unused or I planned to use it.
    // I should remove the unused import OR implement it if I want to refactor.
    // Given I implemented a custom one inline, I should probably just remove the import to fix the build error.
    // However, for consistency, creating a reusable Toggle is better. Let's create it.
}

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export const Toggle: React.FC<SwitchProps> = ({ checked, onCheckedChange, className = '' }) => {
    return (
        <div
            onClick={() => onCheckedChange(!checked)}
            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-rarity-epic' : 'bg-gray-700'} ${className}`}
        >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-7' : ''}`}></div>
        </div>
    );
};
