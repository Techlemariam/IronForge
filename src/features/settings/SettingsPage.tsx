"use client";

import React from "react";
import IntegrationsPanel from "@/features/settings/components/IntegrationsPanel";
import MigrationTool from "@/features/settings/components/MigrationTool";
import { Faction } from "@prisma/client";
import { Sparkles, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { HevyImportWizard } from "@/features/training/components/HevyImportWizard";
import { ArchetypeSelector } from "@/features/settings/components/ArchetypeSelector";
import { Archetype } from "@/types/index";
import { Toggle } from "@/components/ui/Toggle";
import { updateUserPreferencesAction } from "@/actions/user/settings";
import { toast } from "@/components/ui/GameToast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell,
  User as UserIcon,
  Monitor,
  Database,
  Sword,
  Shield
} from "lucide-react";

interface SettingsPageProps {
  userId: string;
  hevyConnected: boolean;
  intervalsConnected: boolean;
  stravaConnected: boolean;
  pocketCastsConnected: boolean;
  garminConnected: boolean;
  initialFaction: Faction;
  initialArchetype: Archetype;
  isDemoMode: boolean;
  initialLiteMode: boolean;
}


export const SettingsPage: React.FC<SettingsPageProps> = ({
  userId,
  hevyConnected,
  intervalsConnected,
  stravaConnected,
  pocketCastsConnected,
  garminConnected,
  initialFaction,
  initialArchetype,
  isDemoMode,
  initialLiteMode,
}) => {
  const [isHevyImportOpen, setIsHevyImportOpen] = React.useState(false);
  const [liteMode, setLiteMode] = React.useState(initialLiteMode);

  const handleLiteModeToggle = async (checked: boolean) => {
    setLiteMode(checked);
    const result = await updateUserPreferencesAction(userId, { liteMode: checked });
    if (result.success) {
      toast.success(checked ? "Lite Mode Enabled" : "RPG Mode Enabled");
    } else {
      setLiteMode(!checked); // Revert
      toast.error("Failed to update preference");
    }
  };

  return (
    <div className="min-h-screen bg-forge-900 bg-noise pb-20">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-white/5 p-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/citadel"
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                Sanctum Settings <Sparkles className="w-5 h-5 text-forge-muted" />
              </h1>
              <p className="text-sm text-forge-muted">
                Configure your neural link to the IronForge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
        <Tabs defaultValue="neural-link" className="space-y-8">
          <TabsList className="w-full bg-zinc-900/50 border border-white/5 h-auto p-1 grid grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger
              value="neural-link"
              className="data-[state=active]:bg-magma data-[state=active]:text-black py-3 flex flex-col items-center gap-1 transition-all"
            >
              <Dumbbell size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Neural Link</span>
            </TabsTrigger>
            <TabsTrigger
              value="identity"
              className="data-[state=active]:bg-magma data-[state=active]:text-black py-3 flex flex-col items-center gap-1 transition-all"
            >
              <UserIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Identity</span>
            </TabsTrigger>
            <TabsTrigger
              value="interface"
              className="data-[state=active]:bg-magma data-[state=active]:text-black py-3 flex flex-col items-center gap-1 transition-all"
            >
              <Monitor size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Interface</span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="data-[state=active]:bg-magma data-[state=active]:text-black py-3 flex flex-col items-center gap-1 transition-all"
            >
              <Database size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* NEURAL LINK TAB */}
          <TabsContent value="neural-link" className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="text-magma w-5 h-5" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Integrations</h2>
              </div>
              <IntegrationsPanel
                userId={userId}
                hevyConnected={hevyConnected}
                intervalsConnected={intervalsConnected}
                stravaConnected={stravaConnected}
                pocketCastsConnected={pocketCastsConnected}
                garminConnected={garminConnected}
                initialFaction={initialFaction}
                checkDemoStatus={true}
                onIntegrationChanged={() => window.location.reload()}
              />
            </div>
          </TabsContent>

          {/* IDENTITY TAB */}
          <TabsContent value="identity" className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="text-magma w-5 h-5" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Titan Identity</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Choose your path and allegiance within the IronForge universe.</p>
              <ArchetypeSelector initialArchetype={initialArchetype} />
            </div>
          </TabsContent>

          {/* INTERFACE TAB */}
          <TabsContent value="interface" className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Monitor className="text-magma w-5 h-5" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">UI Preferences</h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div>
                  <h3 className="text-white font-bold">Lite Mode</h3>
                  <p className="text-xs text-zinc-400">
                    Hide RPG visuals and focus on pure training data. Efficient for weak neural links.
                  </p>
                </div>
                <Toggle checked={liteMode} onCheckedChange={handleLiteModeToggle} />
              </div>
            </div>
          </TabsContent>

          {/* DATA TAB */}
          <TabsContent value="data" className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Database className="text-magma w-5 h-5" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">System Archives</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Neural Migration</h3>
                <MigrationTool />
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Manual Ingestion</h3>
                <button
                  onClick={() => setIsHevyImportOpen(true)}
                  className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-black flex items-center justify-center gap-2 border border-white/5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Upload size={18} /> INITIALIZE IMPORT WIZARD
                </button>
                <HevyImportWizard
                  isOpen={isHevyImportOpen}
                  onClose={() => setIsHevyImportOpen(false)}
                />
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Terminal Identity
                </h3>
                <div className="text-[10px] text-zinc-600 font-mono bg-black/40 p-3 rounded border border-white/5">
                  ID: {userId}
                  <br />
                  NODE_MODE: {isDemoMode ? "SIMULATION" : "LIVE"}
                  <br />
                  CORE_VERSION: v0.16.1 (Unified Soul)
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
