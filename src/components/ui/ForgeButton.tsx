import React from "react";
import { twMerge } from "tailwind-merge";
import { useSoundProtocol } from "@/hooks/useSoundProtocol";
import { useHaptic } from "@/hooks/useHaptic";

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
  | "plasma"  // Primary Action (Orange)
  | "pulse"   // Intelligence (Blue)
  | "gold"    // Legendary (Yellow)
  | "cyan"    // Pathfinder (Cyan)
  | "venom"   // Success (Green)
  | "beast"   // Brute Force (Red)
  | "ghost";  // Transparent
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  soundType?: "clink" | "thud" | "chirp" | "deploy";
}

const ForgeButton: React.FC<ForgeButtonProps> = ({
  children,
  className,
  variant = "plasma",
  size = "md",
  fullWidth = false,
  soundType,
  onClick,
  ...props
}) => {
  const { play } = useSoundProtocol();
  const { trigger } = useHaptic();

  // Map variant to default sound if not specified
  const effectiveSound = soundType || (
    variant === "plasma" || variant === "gold" ? "clink" :
      variant === "ghost" ? "chirp" : "thud"
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    play(effectiveSound);
    trigger(variant === "gold" ? "heavy" : "light");
    if (onClick) onClick(e);
  };

  const baseClasses =
    "font-heading tracking-widest uppercase rounded-sm transition-all duration-150 ease-bolt-action disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-blue-400";

  const variantClasses = {
    // Primary / Legendary
    plasma: "bg-gradient-to-r from-orange-600 to-orange-500 text-white border border-orange-400/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110",
    gold: "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border border-yellow-400/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:brightness-110",

    // Intelligence / Speed
    pulse: "bg-gradient-to-r from-sky-600 to-sky-500 text-white border border-sky-400/20 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:brightness-110",
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110",

    // Utility / Status
    venom: "bg-gradient-to-r from-green-600 to-green-500 text-white border border-green-400/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:brightness-110",
    beast: "bg-gradient-to-r from-red-900 to-red-800 text-white border border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:border-red-500/50",

    // Ghost
    ghost: "bg-transparent border border-transparent text-forge-muted hover:text-white hover:bg-white/5",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const mergedClasses = twMerge(
    baseClasses,
    variantClasses[variant] || variantClasses.plasma,
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  );

  return (
    <button className={mergedClasses} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export default ForgeButton;
