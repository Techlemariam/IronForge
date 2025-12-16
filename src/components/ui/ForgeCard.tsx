import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ForgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ForgeCard: React.FC<ForgeCardProps> = ({ children, className, ...props }) => {
  const cardClasses = twMerge(
    'bg-obsidian border border-forge-border rounded-lg p-4 md:p-6 shadow-lg',
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default ForgeCard;