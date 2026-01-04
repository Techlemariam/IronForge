"use client";

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { playSound } from "@/utils";
import { Shield, Trophy, AlertTriangle, Info } from "lucide-react";

// Custom wrapper to add sounds and default styles
export const toast = {
  success: (message: string, options?: any) => {
    playSound("ui_click"); // Or a specific success sound if available
    sonnerToast.success(message, {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      className:
        "bg-zinc-900 border-green-900 text-green-100 font-mono tracking-wide",
      ...options,
    });
  },
  error: (message: string, options?: any) => {
    playSound("ui_error");
    sonnerToast.error(message, {
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      className:
        "bg-zinc-950 border-red-900 text-red-100 font-heading tracking-wider",
      ...options,
    });
  },
  info: (message: string, options?: any) => {
    playSound("ui_hover");
    sonnerToast.info(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      className: "bg-zinc-900 border-blue-900 text-blue-100 font-mono",
      ...options,
    });
  },
  warning: (message: string, options?: any) => {
    playSound("ui_error");
    sonnerToast.warning(message, {
      icon: <Shield className="w-5 h-5 text-orange-500" />,
      className: "bg-zinc-900 border-orange-900 text-orange-100 font-mono",
      ...options,
    });
  },
  // P2: Undo Toast with action button
  undo: (message: string, onUndo: () => void, duration = 5000) => {
    playSound("ui_click");
    sonnerToast(message, {
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      className: "bg-zinc-900 border-amber-900 text-amber-100 font-mono",
      duration,
      action: {
        label: "Undo",
        onClick: () => {
          onUndo();
          playSound("ui_click");
        },
      },
    });
  },
  // Pass-through for strict sonner usage
  dismiss: sonnerToast.dismiss,
};

export const GameToaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "toast border-2 shadow-lg",
        style: {
          borderRadius: "0px", // Square corners for RPG feel
        },
      }}
    />
  );
};
