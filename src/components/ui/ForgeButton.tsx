
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'magma' | 'rune' | 'default';
}

const ForgeButton: React.FC<ForgeButtonProps> = ({ children, className, variant = 'default', ...props }) => {
  const baseClasses = 'font-heading tracking-widest uppercase px-6 py-3 rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const variantClasses = {
    magma: 'bg-magma text-black shadow-glow-magma hover:shadow-lg hover:shadow-magma/50',
    rune: 'bg-rune text-black shadow-glow-rune hover:shadow-lg hover:shadow-rune/50',
    default: 'bg-obsidian border border-forge-border text-white hover:border-magma',
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
