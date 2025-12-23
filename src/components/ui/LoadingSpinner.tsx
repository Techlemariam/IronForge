import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string; // Add className prop for flexible styling
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color, className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={cn(
      "rounded-full animate-spin border-solid border-t-transparent", // Base classes
      sizeClasses[size],
      color ? color : "border-magma-DEFAULT", // Default color if not provided
      className
    )}></div>
  );
};
