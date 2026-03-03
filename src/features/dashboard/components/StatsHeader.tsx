import React from "react";
import { TitanAvatar } from "@/features/titan/TitanAvatar";
import BioStatusWidget from "@/components/dashboard/BioStatusWidget";
import { DashboardState, DashboardAction } from "../types";
import { EffectiveTitanStats } from "@/services/game/TitanService";
import { StatModifier } from "@/features/neural-lattice/types";

interface StatsHeaderProps {
    state: DashboardState;
    dispatch: React.Dispatch<DashboardAction>;
    titanState?: any;
    liteMode?: boolean;
    effectiveStats?: EffectiveTitanStats;
    activeModifiers?: StatModifier[];
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ state, dispatch, titanState, liteMode, effectiveStats, activeModifiers }) => {
    return (
        <>
            {!liteMode && (
                <section id="titan-avatar" className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => dispatch({ type: "SET_VIEW", payload: "character_sheet" })}>
                    <TitanAvatar titan={titanState} effectiveStats={effectiveStats} activeModifiers={activeModifiers} />
                </section>
            )}

            {state.trainingContext && (
                <section id="bio-status" className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <BioStatusWidget context={state.trainingContext} />
                </section>
            )}
        </>
    );
};
