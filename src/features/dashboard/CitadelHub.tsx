import React, { useState } from "react";
import Link from "next/link";
import {
  Sword,
  Map,
  Castle,
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
  description?: string;
}> = ({ onClick, children, icon, variant = "magma", isActive, description }) => {
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
      title={description}
      aria-label={
        description
          ? `${typeof children === "string" ? children : "Action"}: ${description}`
          : typeof children === "string"
            ? children
            : undefined
      }
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
      <div className="flex flex-col">
        <span className="font-bold uppercase tracking-wide text-xs md:text-sm relative z-10">
          {children}
        </span>
      </div>
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
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} section`}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between p-4 text-${color}-400 hover:bg-${color}-950/30 transition-colors`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-bold uppercase tracking-widest">{title}</h3>
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
        description="Daily generated workout quests based on your level"
      >
        New Quest
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Dumbbell className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "strength_log" })}
        description="Log sets, reps, and RPE for your workout"
      >
        Strength Log
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Activity className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "cycling" })}
        description="Indoor cycling and running modes with virtual elevation"
      >
        Cardio Suite
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Scroll className="w-4 h-4" />}
        onClick={() =>
          dispatch({ type: "SET_VIEW", payload: "program_builder" })
        }
        description="Create custom workout routines"
      >
        Program Builder
      </NavButton>
      <NavButton
        variant="magma"
        icon={<Map className="w-4 h-4" />}
        onClick={() =>
          dispatch({ type: "SET_VIEW", payload: "training_center" })
        }
        description="Upgrade your stats and abilities"
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
        description="Craft and upgrade your equipment"
      >
        The Forge
      </NavButton>
      <NavButton
        variant="iron"
        icon={<ShoppingBag className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "marketplace" })}
        description="Buy potions, loot boxes, and gear"
      >
        Marketplace
      </NavButton>
      <NavButton
        variant="iron"
        icon={<Shield className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "armory" })}
        description="Equip your Titan with gear"
      >
        Armory
      </NavButton>
    </Category>

    {/* 3. SOCIAL & PVP */}
    <Category
      title="Colosseum"
      icon={<Sword className="w-6 h-6" />}
      color="purple"
      defaultOpen={false}
    >
      <NavButton
        variant="void"
        icon={<Sword className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "arena" })}
        description="Battle other players in PvP"
      >
        PvP Arena
      </NavButton>
      <NavButton
        variant="void"
        icon={<Users className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "guild_hall" })}
        description="Manage your faction and guild quests"
      >
        Guild Hall
      </NavButton>
      <NavButton
        variant="void"
        icon={<Users className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "social_hub" })}
        description="Connect with friends and rivals"
      >
        Social Hub
      </NavButton>
      <NavButton
        variant="void"
        icon={<Trophy className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "trophy_room" })}
        description="View your achievements and milestones"
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
        description="Explore the IronForge world"
      >
        World Map
      </NavButton>
      <NavButton
        variant="nature"
        icon={<Skull className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "bestiary" })}
        description="View monsters you have defeated"
      >
        Bestiary
      </NavButton>
      <NavButton
        variant="nature"
        icon={<Scroll className="w-4 h-4" />}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "grimoire" })}
        description="View your unlocked abilities"
      >
        Grimoire
      </NavButton>
    </Category>
  </div>
);
