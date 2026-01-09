import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  showLore?: boolean;
}

const LORE_MESSAGES = [
  "Consulting the Oracle...",
  "Sharpening the blade...",
  "Communing with the Titans...",
  "Warming up the Forge...",
  "Calculating your destiny...",
  "Summoning ancient power...",
  "Decrypting the Grimoire...",
];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color,
  className,
  showLore = false,
}) => {
  const [loreIndex, setLoreIndex] = useState(0);

  useEffect(() => {
    if (!showLore) return;
    const interval = setInterval(() => {
      setLoreIndex((prev) => (prev + 1) % LORE_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [showLore]);

  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "rounded-full animate-spin border-solid border-t-transparent",
          sizeClasses[size],
          color ? color : "border-magma-DEFAULT",
          className,
        )}
      ></div>
      {showLore && (
        <p className="text-forge-muted text-sm font-mono animate-pulse">
          {LORE_MESSAGES[loreIndex]}
        </p>
      )}
    </div>
  );
};
