import React, { useState } from "react";
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
  ChevronLeft,
  Bike,
  Footprints,
} from "lucide-react";
import { DashboardAction } from "./types";
import { playSound } from "@/utils";

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

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  itemCount: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon,
  color,
  description,
  itemCount,
  onClick,
}) => {
  return (
    <button
      onClick={() => {
        playSound("ui_click");
        onClick();
      }}
      onMouseEnter={() => playSound("ui_hover")}
      aria-label={`${title}: ${description}`}
      className={`
        relative group flex flex-col items-center justify-center p-6 h-48
        rounded-xl border border-${color}-800/30 bg-black/40 backdrop-blur-sm
        hover:bg-${color}-950/30 hover:border-${color}-500/50 hover:scale-[1.02]
        transition-all duration-300
      `}
    >
      <div className={`
        p-4 rounded-full bg-${color}-950/50 text-${color}-400 mb-4
        group-hover:text-${color}-200 group-hover:scale-110 transition-all
      `}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}
      </div>

      <h3 className={`text-xl font-bold uppercase tracking-widest text-${color}-100 mb-2`}>
        {title}
      </h3>

      <p className="text-xs text-gray-400 text-center max-w-[80%] mb-4">
        {description}
      </p>

      <div className={`
        px-3 py-1 rounded-full text-[10px] font-mono tracking-wider
        bg-${color}-900/20 text-${color}-400 border border-${color}-900/30
      `}>
        {itemCount} ACTIONS
      </div>
    </button>
  );
};

interface CitadelHubProps {
  dispatch: React.Dispatch<DashboardAction>;
}

type CategoryType = "TRAINING" | "CITY" | "COLOSSEUM" | "EXPLORATION" | null;
type TrainingSubType = "STRENGTH" | "CARDIO" | null;

export const CitadelHub: React.FC<CitadelHubProps> = ({ dispatch }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [trainingSubCategory, setTrainingSubCategory] = useState<TrainingSubType>(null);

  const renderContent = () => {
    console.log('[CitadelHub] Rendering content. SelectedCategory:', selectedCategory, 'TrainingSub:', trainingSubCategory);
    switch (selectedCategory) {
      case "TRAINING":
        // Sub-category selection for Training
        if (!trainingSubCategory) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => {
                  playSound("ui_click");
                  setTrainingSubCategory("STRENGTH");
                }}
                onMouseEnter={() => playSound("ui_hover")}
                className="relative group flex flex-col items-center justify-center p-6 h-40
                  rounded-xl border border-red-800/30 bg-black/40 backdrop-blur-sm
                  hover:bg-red-950/30 hover:border-red-500/50 hover:scale-[1.02]
                  transition-all duration-300"
              >
                <div className="p-4 rounded-full bg-red-950/50 text-red-400 mb-3
                  group-hover:text-red-200 group-hover:scale-110 transition-all">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-red-100 mb-1">
                  Strength Focus
                </h3>
                <p className="text-xs text-gray-400 text-center">
                  Log sets, build programs, level up
                </p>
                <div className="mt-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider
                  bg-red-900/20 text-red-400 border border-red-900/30">
                  3 ACTIONS
                </div>
              </button>
              <button
                onClick={() => {
                  playSound("ui_click");
                  setTrainingSubCategory("CARDIO");
                }}
                onMouseEnter={() => playSound("ui_hover")}
                className="relative group flex flex-col items-center justify-center p-6 h-40
                  rounded-xl border border-orange-800/30 bg-black/40 backdrop-blur-sm
                  hover:bg-orange-950/30 hover:border-orange-500/50 hover:scale-[1.02]
                  transition-all duration-300"
              >
                <div className="p-4 rounded-full bg-orange-950/50 text-orange-400 mb-3
                  group-hover:text-orange-200 group-hover:scale-110 transition-all">
                  <Bike className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-orange-100 mb-1">
                  Cardio Focus
                </h3>
                <p className="text-xs text-gray-400 text-center">
                  Cycling, running, and cardio quests
                </p>
                <div className="mt-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider
                  bg-orange-900/20 text-orange-400 border border-orange-900/30">
                  3 ACTIONS
                </div>
              </button>
            </div>
          );
        }

        // Render sub-category items
        return trainingSubCategory === "STRENGTH" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-4 duration-300">
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
              icon={<Scroll className="w-4 h-4" />}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "program_builder" })}
              description="Create custom workout routines"
            >
              Program Builder
            </NavButton>
            <NavButton
              variant="magma"
              icon={<Map className="w-4 h-4" />}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "training_center" })}
              description="View workout library and stats"
            >
              Training Codex
            </NavButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-right-4 duration-300">
            <NavButton
              variant="magma"
              icon={<Bike className="w-4 h-4" />}
              onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "cycling" })}
              description="Epic indoor cycling quests"
            >
              Ride
            </NavButton>
            <NavButton
              variant="magma"
              icon={<Footprints className="w-4 h-4" />}
              onClick={() => dispatch({ type: "SET_CARDIO_MODE", payload: "running" })}
              description="High-intensity treadmill missions"
            >
              Run
            </NavButton>
            <NavButton
              variant="magma"
              icon={<Map className="w-4 h-4" />}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "training_center" })}
              description="Upgrade your stats and abilities"
            >
              Training Path
            </NavButton>
          </div>
        );

      case "CITY":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-4 duration-300">
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
          </div>
        );

      case "COLOSSEUM":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-4 duration-300">
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
          </div>
        );

      case "EXPLORATION":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-4 duration-300">
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
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <CategoryCard
              title="Training Operations"
              icon={<Dumbbell />}
              color="red"
              description="Workout quests, logging, and program builder"
              itemCount={6}
              onClick={() => {
                console.log('[CitadelHub] Clicked TRAINING');
                setSelectedCategory("TRAINING");
              }}
            />
            <CategoryCard
              title="Iron City"
              icon={<Castle />}
              color="blue"
              description="Economy, Marketplace, and The Forge"
              itemCount={3}
              onClick={() => setSelectedCategory("CITY")}
            />
            <CategoryCard
              title="Colosseum"
              icon={<Sword />}
              color="purple"
              description="PvP Arena, Guilds, and Social Hub"
              itemCount={4}
              onClick={() => setSelectedCategory("COLOSSEUM")}
            />
            <CategoryCard
              title="Exploration"
              icon={<Map />}
              color="green"
              description="World Map, Bestiary, and Lore"
              itemCount={3}
              onClick={() => setSelectedCategory("EXPLORATION")}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {(selectedCategory || trainingSubCategory) && (
        <div className="flex items-center space-x-2 animate-in slide-in-from-left-4 duration-300">
          <button
            onClick={() => {
              playSound("ui_click");
              // Handle nested navigation for Training
              if (selectedCategory === "TRAINING" && trainingSubCategory) {
                setTrainingSubCategory(null);
              } else {
                setSelectedCategory(null);
                setTrainingSubCategory(null);
              }
            }}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Back"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">
            {selectedCategory === "TRAINING" && trainingSubCategory
              ? `Training / ${trainingSubCategory === "STRENGTH" ? "Strength" : "Cardio"}`
              : selectedCategory === "CITY"
                ? "Iron City"
                : selectedCategory}
          </h2>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

