"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
}) => {
  const baseClasses = "animate-pulse bg-zinc-800";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width ?? "100%",
    height: height ?? (variant === "text" ? "1rem" : "100%"),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Preset skeletons for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={`p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3 ${className}`}
  >
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="rectangular" height={100} />
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Skeleton variant="circular" width={size} height={size} />
);

export default Skeleton;
