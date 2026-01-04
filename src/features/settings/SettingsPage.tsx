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
import { updateUserPreferencesAction } from "@/actions/settings";
import { toast } from "@/components/ui/GameToast";

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
                Settings <Sparkles className="w-5 h-5 text-forge-muted" />
              </h1>
              <p className="text-sm text-forge-muted">
                Configure your neural link to the IronForge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Integrations Section */}
        <section>
          <h2 className="text-lg font-bold text-magma mb-4 uppercase tracking-wider">
            Integrations
          </h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
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
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-lg font-bold text-magma mb-4 uppercase tracking-wider">
            Preferences
          </h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Lite Mode</h3>
                <p className="text-sm text-zinc-400">
                  Hide RPG visuals and focus on training data.
                </p>
              </div>
              <Toggle checked={liteMode} onCheckedChange={handleLiteModeToggle} />
            </div>
          </div>
        </section>

        {/* Archetype & Faction */}
        <section>
          <h2 className="text-lg font-bold text-zinc-500 mb-4 uppercase tracking-wider">
            Titan Identity
          </h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl space-y-8">
            <ArchetypeSelector initialArchetype={initialArchetype} />
          </div>
        </section>

        {/* Advanced / Migration Section */}
        <section>
          <h2 className="text-lg font-bold text-zinc-500 mb-4 uppercase tracking-wider">
            Data Management
          </h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
            <MigrationTool />
            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-sm font-bold text-zinc-400 mb-4">
                Import History
              </h3>
              <button
                onClick={() => setIsHevyImportOpen(true)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-white/5 transition-colors"
              >
                <Upload size={16} /> Open Import Wizard
              </button>
              <HevyImportWizard
                isOpen={isHevyImportOpen}
                onClose={() => setIsHevyImportOpen(false)}
              />
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-sm font-bold text-zinc-400 mb-2">
                Account Status
              </h3>
              <div className="text-xs text-zinc-600 font-mono">
                User ID: {userId}
                <br />
                Mode: {isDemoMode ? "SIMULATION" : "LIVE"}
                <br />
                Version: v0.16.0 (Unified Soul)
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
