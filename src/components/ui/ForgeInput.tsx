import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ForgeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const ForgeInput: React.FC<ForgeInputProps> = ({ label, className, ...props }) => {

    const inputClasses = twMerge(
        'font-mono bg-transparent w-full text-white placeholder:text-forge-muted focus:outline-none',
        'border-b-2 border-forge-border focus:border-magma transition-colors duration-300 py-2',
        className
    );

    return (
        <div className="w-full">
            {label && <label className="font-body text-sm uppercase tracking-wider text-forge-muted mb-2 block">{label}</label>}
            <input className={inputClasses} {...props} />
        </div>
    );
};

export default ForgeInput;
