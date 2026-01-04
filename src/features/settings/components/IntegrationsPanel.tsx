"use client";

import React, { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
  Bike,
  Shield,
  Swords,
  TestTube,
  Podcast,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ForgeButton from "@/components/ui/ForgeButton";
import ForgeInput from "@/components/ui/ForgeInput";
import {
  connectHevy,
  disconnectHevy,
  connectIntervals,
  disconnectIntervals,
} from "@/actions/integrations";
import {
  disconnectStravaAction,
  exchangeStravaTokenAction,
  syncStravaActivitiesAction,
  getStravaAuthUrlAction,
} from "@/actions/strava";
import { updateFactionAction } from "@/actions/user";
import { toggleDemoModeAction, getDemoModeStatus } from "@/actions/demo";
import { Faction } from "@prisma/client";

interface IntegrationsPanelProps {
  userId: string;
  hevyConnected: boolean;
  intervalsConnected: boolean;
  stravaConnected: boolean;
  pocketCastsConnected: boolean;
  initialFaction: Faction;
  onIntegrationChanged?: () => void;
  checkDemoStatus?: boolean;
}

type IntegrationType = "HEVY" | "INTERVALS" | "STRAVA" | "FACTION" | "POCKETCASTS";

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({
  userId,
  hevyConnected: initialHevy,
  intervalsConnected: initialIntervals,
  stravaConnected: initialStrava,
  pocketCastsConnected: initialPocketCasts,
  initialFaction,
  onIntegrationChanged,
  checkDemoStatus,
}) => {
  const [hevyConnected, setHevyConnected] = useState(initialHevy);
  const [intervalsConnected, setIntervalsConnected] =
    useState(initialIntervals);
  const [stravaConnected, setStravaConnected] = useState(initialStrava);
  const [pocketCastsConnected, setPocketCastsConnected] = useState(initialPocketCasts);
  const [currentFaction, setCurrentFaction] = useState<Faction>(
    initialFaction || "HORDE",
  );
  const [expanded, setExpanded] = useState<IntegrationType | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();

  // Form States
  const [hevyKey, setHevyKey] = useState("");
  const [intervalsKey, setIntervalsKey] = useState("");
  const [intervalsId, setIntervalsId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // DEMO STATE
  const [isDemoActive, setIsDemoActive] = useState(false);

  useEffect(() => {
    if (checkDemoStatus) {
      getDemoModeStatus().then(setIsDemoActive);
    }
  }, [checkDemoStatus]);

  // Detect Strava Code
  useEffect(() => {
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");

    if (code && !stravaConnected) {
      startTransition(async () => {
        const result = await exchangeStravaTokenAction(code);
        if (result.success) {
          setStravaConnected(true);
          onIntegrationChanged?.();
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete("code");
          newParams.delete("scope");
          newParams.delete("state");
          router.replace(`/settings?${newParams.toString()}`);
        } else {
          setError("Strava Connection Failed: " + result.error);
        }
      });
    }
  }, [searchParams, stravaConnected, router, onIntegrationChanged]);

  const handleToggleDemo = async () => {
    startTransition(async () => {
      const newState = !isDemoActive;
      await toggleDemoModeAction(newState);
      setIsDemoActive(newState);
      window.location.reload();
    });
  };

  const handleConnectHevy = () => {
    setError(null);
    startTransition(async () => {
      const result = await connectHevy(userId, hevyKey);
      if (result.success) {
        setHevyConnected(true);
        setExpanded(null);
        setHevyKey("");
        onIntegrationChanged?.();
      } else {
        setError(result.error || "Failed to connect Hevy");
      }
    });
  };

  const handleDisconnectHevy = () => {
    if (!confirm("Are you sure? This will stop workout syncing.")) return;
    startTransition(async () => {
      const result = await disconnectHevy(userId);
      if (result.success) {
        setHevyConnected(false);
        onIntegrationChanged?.();
      }
    });
  };

  const handleConnectIntervals = () => {
    setError(null);
    startTransition(async () => {
      const result = await connectIntervals(userId, intervalsKey, intervalsId);
      if (result.success) {
        setIntervalsConnected(true);
        setExpanded(null);
        setIntervalsKey("");
        setIntervalsId("");
        onIntegrationChanged?.();
      } else {
        setError(result.error || "Failed to connect Intervals");
      }
    });
  };

  const handleDisconnectIntervals = () => {
    if (!confirm("Disconnect Intervals.icu?")) return;
    startTransition(async () => {
      const result = await disconnectIntervals(userId);
      if (result.success) {
        setIntervalsConnected(false);
        onIntegrationChanged?.();
      }
    });
  };

  const handleConnectStrava = async () => {
    const authUrl = await getStravaAuthUrlAction();
    window.location.href = authUrl;
  };

  const handleDisconnectStrava = () => {
    if (!confirm("Disconnect Strava?")) return;
    startTransition(async () => {
      try {
        const result = await disconnectStravaAction();
        if (result.success) {
          setStravaConnected(false);
          onIntegrationChanged?.();
        } else {
          alert("Failed to disconnect Strava: " + result.error);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred");
      }
    });
  };

  const handleSyncStrava = () => {
    startTransition(async () => {
      try {
        const result = await syncStravaActivitiesAction();
        if (result.success) {
          alert(`Strava Sync Complete: ${result.count} activities synced.`);
          onIntegrationChanged?.();
        } else {
          alert("Strava Sync Failed: " + result.error);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred during sync");
      }
    });
  };

  const handleDisconnectPocketCasts = () => {
    if (!confirm("Disconnect Pocket Casts?")) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/podcast/login", { method: "DELETE" });
        if (res.ok) {
          setPocketCastsConnected(false);
          onIntegrationChanged?.();
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleFactionChange = (faction: Faction) => {
    if (faction === currentFaction) return;

    startTransition(async () => {
      const result = await updateFactionAction(faction);
      if (result.success) {
        setCurrentFaction(faction);
        // We don't close the panel or reload immediately, allowing the user to see the selection change
        onIntegrationChanged?.(); // This might trigger a reload from parent if strict
      } else {
        setError(result.error || "Failed to update faction");
      }
    });
  };

  const renderCard = (
    type: IntegrationType,
    isConnected: boolean,
    title: string,
    icon: React.ReactNode,
    description: string,
  ) => (
    <div
      className={`p - 4 rounded - lg border transition - all ${isConnected ? "bg-emerald-900/20 border-emerald-500/30" : "bg-white/5 border-white/10"} `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p - 2 rounded - full ${isConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-zinc-400"} `}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide text-sm">
              {title}
            </h3>
            <p className="text-xs text-zinc-400">{description}</p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono uppercase tracking-widest">
              <CheckCircle size={12} /> Live
            </span>
            {type === "STRAVA" && (
              <button
                onClick={handleSyncStrava}
                disabled={isPending}
                className="text-zinc-500 hover:text-magma text-xs underline decoration-dotted transition-colors"
              >
                {isPending ? "Syncing..." : "Sync Activities"}
              </button>
            )}
            <button
              disabled={isPending}
              onClick={() => {
                if (type === "HEVY") handleDisconnectHevy();
                else if (type === "INTERVALS") handleDisconnectIntervals();
                else if (type === "STRAVA") handleDisconnectStrava();
                else if (type === "POCKETCASTS") handleDisconnectPocketCasts();
              }}
              className="text-zinc-500 hover:text-red-400 text-xs underline decoration-dotted transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <ForgeButton
            size="sm"
            variant="ghost"
            onClick={() => {
              if (type === "STRAVA") {
                // HACK: Start Auth Flow immediately
                // Ideally we get this from server
                window.location.href = "/api/auth/strava/login"; // Better pattern: API route that redirects.
                // OR:
                // We need to implement the login button logic.
                // I should add `getStravaAuthUrl` to `src / actions / strava.ts`.
                // For now I'll just toggle expand for Hevy/Intervals, but Strava has no form.
              }
              setExpanded(expanded === type ? null : type);
            }}
            className={expanded === type ? "bg-white/10" : ""}
          >
            {expanded === type ? "Cancel" : "Connect"}
          </ForgeButton>
        )}
      </div>

      <AnimatePresence>
        {expanded === type && !isConnected && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3 border-t border-white/10">
              {type === "HEVY" && (
                <>
                  <ForgeInput
                    label="API Key"
                    placeholder="Paste your Hevy API Key"
                    type="password"
                    value={hevyKey}
                    onChange={(e) => setHevyKey(e.target.value)}
                  />
                  <ForgeButton
                    fullWidth
                    variant="magma"
                    onClick={handleConnectHevy}
                    disabled={isPending || !hevyKey}
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                    ) : (
                      "Validate & Connect"
                    )}
                  </ForgeButton>
                </>
              )}

              {type === "INTERVALS" && (
                <>
                  <ForgeInput
                    label="Athlete ID"
                    placeholder="e.g. i12345"
                    value={intervalsId}
                    onChange={(e) => setIntervalsId(e.target.value)}
                  />
                  <ForgeInput
                    label="API Key"
                    placeholder="API_KEY from settings"
                    type="password"
                    value={intervalsKey}
                    onChange={(e) => setIntervalsKey(e.target.value)}
                  />
                  <ForgeButton
                    fullWidth
                    variant="magma"
                    onClick={handleConnectIntervals}
                    disabled={isPending || !intervalsKey || !intervalsId}
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                    ) : (
                      "Validate & Connect"
                    )}
                  </ForgeButton>
                </>
              )}

              {type === "STRAVA" && (
                <div className="text-center py-2">
                  <p className="text-xs text-zinc-400 mb-3">
                    Connect your Strava account to sync runs and rides.
                  </p>
                  {/* We need a Link to the Auth URL. 
                                          Since I cannot access Env vars easily without exposing them, I'll use a server action or API route.
                                          Let's use a server action to get the URL `getStravaAuthUrl`.
                                          But for this edit, I can't call it inside render easily without async.
                                          I'll use a client-side button that calls server action to get URL then redirects.
                                      */}
                  <ForgeButton
                    fullWidth
                    variant="magma"
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          const url = await getStravaAuthUrlAction();
                          if (url) {
                            window.location.href = url;
                          }
                        } catch (e: any) {
                          console.error("Strava Auth Error:", e);
                          alert(
                            "Failed to initiate Strava login: " + e.message,
                          );
                        }
                      });
                    }}
                    disabled={isPending}
                  >
                    <Bike className="w-4 h-4 mr-2" />
                    Launch Strava Login
                  </ForgeButton>
                </div>
              )}

              {type === "POCKETCASTS" && (
                <div className="text-center py-2">
                  <p className="text-xs text-zinc-400 mb-3">
                    Connect your Pocket Casts account to stream podcasts during workouts.
                  </p>
                  <Link href="/settings/podcast" className="block">
                    <ForgeButton fullWidth variant="magma">
                      <Podcast className="w-4 h-4 mr-2" />
                      Go to Podcast Setup
                    </ForgeButton>
                  </Link>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-xs flex items-center gap-2 bg-red-900/20 p-2 rounded">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderFactionCard = () => {
    const isAlliance = currentFaction === "ALLIANCE";
    return (
      <div
        className={`p - 4 rounded - lg border transition - all ${isAlliance ? "bg-blue-900/20 border-blue-500/30" : "bg-red-900/20 border-red-500/30"} `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p - 2 rounded - full ${isAlliance ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"} `}
            >
              {isAlliance ? <Shield size={18} /> : <Swords size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-sm">
                Allegiance
              </h3>
              <p className="text-xs text-zinc-400">
                Current Faction:{" "}
                <span className={isAlliance ? "text-blue-400" : "text-red-400"}>
                  {currentFaction}
                </span>
              </p>
            </div>
          </div>

          <ForgeButton
            size="sm"
            variant="ghost"
            onClick={() =>
              setExpanded(expanded === "FACTION" ? null : "FACTION")
            }
            className={expanded === "FACTION" ? "bg-white/10" : ""}
          >
            {expanded === "FACTION" ? "Close" : "Change"}
          </ForgeButton>
        </div>

        <AnimatePresence>
          {expanded === "FACTION" && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleFactionChange("ALLIANCE")}
                  disabled={isPending}
                  className={`relative p - 4 rounded - lg border - 2 transition - all flex flex - col items - center gap - 2 group ${isAlliance
                    ? "bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50 hover:bg-blue-900/10"
                    } `}
                >
                  <Shield
                    className={`w - 8 h - 8 ${isAlliance ? "text-blue-400" : "text-zinc-500 group-hover:text-blue-400"} `}
                  />
                  <div className="text-center">
                    <div
                      className={`font - bold text - sm ${isAlliance ? "text-blue-400" : "text-zinc-400 group-hover:text-blue-300"} `}
                    >
                      ALLIANCE
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Private → Grand Marshal
                    </div>
                  </div>
                  {isAlliance && (
                    <div className="absolute top-2 right-2 text-blue-400">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleFactionChange("HORDE")}
                  disabled={isPending}
                  className={`relative p - 4 rounded - lg border - 2 transition - all flex flex - col items - center gap - 2 group ${!isAlliance
                    ? "bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "bg-zinc-900/50 border-zinc-700 hover:border-red-500/50 hover:bg-red-900/10"
                    } `}
                >
                  <Swords
                    className={`w - 8 h - 8 ${!isAlliance ? "text-red-400" : "text-zinc-500 group-hover:text-red-400"} `}
                  />
                  <div className="text-center">
                    <div
                      className={`font - bold text - sm ${!isAlliance ? "text-red-400" : "text-zinc-400 group-hover:text-red-300"} `}
                    >
                      HORDE
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Scout → High Warlord
                    </div>
                  </div>
                  {!isAlliance && (
                    <div className="absolute top-2 right-2 text-red-400">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-xs flex items-center gap-2 bg-red-900/20 p-2 rounded mt-3">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xs text-forge-muted uppercase tracking-widest mb-2 px-1">
        Active Uplinks
      </h3>
      {renderCard(
        "HEVY",
        hevyConnected,
        "Hevy Strength",
        <Dumbbell size={18} />,
        "Syncs workouts, sets, and body stats",
      )}
      {renderCard(
        "INTERVALS",
        intervalsConnected,
        "Intervals.icu",
        <Activity size={18} />,
        "Syncs cardio, wellness, and fatigue",
      )}
      {renderCard(
        "STRAVA",
        stravaConnected,
        "Strava",
        <Bike size={18} />,
        "Syncs runs/rides for Kinetic Energy",
      )}
      {renderCard(
        "POCKETCASTS",
        pocketCastsConnected,
        "Pocket Casts",
        <Podcast size={18} />,
        "Stream your podcast queue during training",
      )}

      <div className="border-t border-white/5 my-4"></div>

      <h3 className="font-heading text-xs text-forge-muted uppercase tracking-widest mb-2 px-1">
        PvP Identity
      </h3>
      {renderFactionCard()}

      <div className="border-t border-white/5 my-4"></div>

      <h3 className="font-heading text-xs text-forge-muted uppercase tracking-widest mb-2 px-1">
        System Overrides
      </h3>
      <div
        className={`p - 4 rounded - lg border transition - all ${isDemoActive ? "bg-amber-900/20 border-amber-500/30" : "bg-white/5 border-white/10"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p - 2 rounded - full ${isDemoActive ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-zinc-400"}`}
            >
              <TestTube size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-sm">
                Demo Protocol
              </h3>
              <p className="text-xs text-zinc-400">
                Inject synthetic data for testing
              </p>
            </div>
          </div>
          <ForgeButton
            size="sm"
            variant={isDemoActive ? "magma" : "ghost"}
            onClick={handleToggleDemo}
            disabled={isPending}
          >
            {isDemoActive ? "Disable Demo" : "Enable Demo Data"}
          </ForgeButton>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
