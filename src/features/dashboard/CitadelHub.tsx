import React, { useState } from "react";
import Link from "next/link";
import {
  Sword,
  Map,
  Castle,
  Mic,
  Footprints,
  Bike,
  Dumbbell,
  Scroll,
  Skull,
  ShoppingBag,
  Shield,
  Users,
  Gavel,
  Trophy,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
} from "lucide-react";
import { DashboardAction } from "./types";
import { playSound } from "@/utils";
import { cn } from "@/lib/utils";

// Shared NavButton Style
const NavButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "magma" | "nature" | "iron" | "void";
  isActive?: boolean;
}> = ({ onClick, children, icon, variant = "magma", isActive }) => {
  const variants = {
    magma:
      "border-red-900/50 bg-gradient-to-br from-red-950/80 to-orange-950/80 hover:border-red-500 text-red-200 focus-visible:ring-2 focus-visible:ring-red-500",
    nature:
      "border-green-900/50 bg-gradient-to-br from-green-950/80 to-emerald-950/80 hover:border-green-500 text-green-200 focus-visible:ring-2 focus-visible:ring-green-500",
    iron: "border-blue-900/50 bg-gradient-to-br from-slate-950/80 to-blue-950/80 hover:border-blue-500 text-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500",
    void: "border-purple-900/50 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 hover:border-purple-500 text-purple-200 focus-visible:ring-2 focus-visible:ring-purple-500",
  };

  return (
    <button
      onClick={() => {
        playSound("ui_click");
        onClick();
      }}
      onMouseEnter={() => playSound("ui_hover")}
      className={`
                relative flex items-center p-3 border rounded-lg shadow-md transition-all duration-200 group w-full text-left focus:outline-none
                ${variants[variant]}
                ${isActive ? "ring-2 ring-offset-2 ring-offset-black" : ""}
            `}
    >
      {icon && (
        <span className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      )}
      <span className="font-bold uppercase tracking-wide text-xs md:text-sm relative z-10">
        {children}
      </span>
    </button>
  );
};

interface CategoryProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Category: React.FC<CategoryProps> = ({
  title,
  icon,
  color,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-xl border border-${color}-800/30 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-300 ${isOpen ? "ring-1 ring-" + color + "-500/30" : ""}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-${color}-400 hover:bg-${color}-950/30 transition-colors`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-bold uppercase tracking-widest">
            {title}
          </h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-2 border-t border-${color}-900/30 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

interface CitadelHubProps {
  dispatch: React.Dispatch<DashboardAction>;
}

export const CitadelHub: React.FC<CitadelHubProps> = ({ dispatch }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in text-white">

    {/* 1. TRAINING OPERATIONS */}
    <Category
      title="Training"
      icon={<Dumbbell className="w-6 h-6" />}
      color="red"
      defaultOpen={true}
    >
      <NavButton
        variant="magma"
        icon={<Scroll className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "war_room" })}
      >
        New Quest
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Dumbbell className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "strength_log" })}
      >
        Strength Log
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Activity className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "cycling" })} // Defaulting to cycling until selection view is ready
      >
        Cardio Suite
      </NavButton>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <NavButton
          variant="magma"
          icon={<Bike className="w-3 h-3" />}
          onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "cycling" })}
        >
          Ride
        </NavButton>
        <NavButton
          variant="magma"
          icon={<Footprints className="w-3 h-3" />}
          onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "running" })}
        >
          Run
        </NavButton>
      </div>
      <NavButton
        variant="magma"
        icon={<Map className="w-4 h-4" />}
        onClick={() =>
          dispatch({ type: "SET_VIEW", payload: "training_center" })
        }
      >
        Training Path
      </NavButton>
    </Category>

    {/* 2. IRON CITY (Economy) */}
    <Category
      title="Iron City"
      icon={<Castle className="w-6 h-6" />}
      color="blue"
      defaultOpen={true}
    >
      <NavButton
        variant="iron"
        icon={<Gavel className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "forge" })}
      >
        The Forge
      </NavButton>
      <NavButton
        variant="iron"
        icon={<ShoppingBag className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "marketplace" })}
      >
        Marketplace
      </NavButton>
      <NavButton
        variant="iron"
        icon={<Shield className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "armory" })}
      >
        Armory
      </NavButton>
      <NavButton
        variant="iron"
        icon={<Scroll className="w-4 h-4" />}
        onClick={() =>
          dispatch({ type: "SET_VIEW", payload: "program_builder" })
        }
      >
        Program Builder
      </NavButton>
    </Category>

    {/* 3. SOCIAL & PVP */}
    <Category
      title="Colosseum"
      icon={<Sword className="w-6 h-6" />}
      color="purple" // Changed to distinguish
      defaultOpen={false}
    >
      <NavButton
        variant="void"
        icon={<Sword className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "arena" })}
      >
        PvP Arena
      </NavButton>
      <NavButton
        variant="void"
        icon={<Users className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "guild_hall" })}
      >
        Guild Hall
      </NavButton>
      <NavButton
        variant="void"
        icon={<Users className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "social_hub" })}
      >
        Social Hub
      </NavButton>
      <NavButton
        variant="void"
        icon={<Trophy className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "trophy_room" })}
      >
        Trophy Room
      </NavButton>
    </Category>

    {/* 4. EXPLORATION */}
    <Category
      title="Exploration"
      icon={<Map className="w-6 h-6" />}
      color="green"
      defaultOpen={false}
    >
      <NavButton
        variant="nature"
        icon={<Map className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "world_map" })}
      >
        World Map
      </NavButton>
      <NavButton
        variant="nature"
        icon={<Skull className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "bestiary" })}
      >
        Bestiary
      </NavButton>
      <NavButton
        variant="nature"
        icon={<Scroll className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "grimoire" })}
      >
        Grimoire
      </NavButton>
      <div className="pt-2 border-t border-green-800/30">
        <Link href="/settings" className="w-full">
          <NavButton
            variant="nature"
            icon={<Shield className="w-4 h-4" />}
            onClick={() => { }}
          >
            Settings
          </NavButton>
        </Link>
      </div>
    </Category>
  </div>
);
