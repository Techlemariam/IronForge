import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ForgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ForgeCard: React.FC<ForgeCardProps> = ({ children, className, ...props }) => {
  const cardClasses = twMerge(
    'bg-forge-900/60 backdrop-blur-md border border-forge-border rounded-lg p-4 md:p-6 shadow-xl hover:border-forge-border/80 transition-colors duration-300',
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default ForgeCard;