
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'magma' | 'rune' | 'default';
}

const ForgeButton: React.FC<ForgeButtonProps> = ({ children, className, variant = 'default', ...props }) => {
  const baseClasses = 'font-heading tracking-widest uppercase px-6 py-3 rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const variantClasses = {
    magma: 'bg-gradient-to-r from-orange-600 to-red-600 text-white border border-red-400/20 shadow-glow-magma hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:brightness-110',
    rune: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/20 shadow-glow-rune hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:brightness-110',
    default: 'bg-forge-800 border border-forge-border text-gray-300 hover:text-white hover:border-gray-500 hover:bg-forge-700',
  };

  const mergedClasses = twMerge(
    baseClasses,
    variantClasses[variant],
    className
  );

  return (
    <button className={mergedClasses} {...props}>
      {children}
    </button>
  );
};

export default ForgeButton;
