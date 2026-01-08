import React from "react";
import { TitanAvatar } from "@/features/titan/TitanAvatar";
import BioStatusWidget from "@/components/dashboard/BioStatusWidget";
import { DashboardState } from "../types";

interface StatsHeaderProps {
    state: DashboardState;
    titanState?: any;
    liteMode?: boolean;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ state, titanState, liteMode }) => {
    return (
        <>
            {!liteMode && (
                <section id="titan-avatar">
                    <TitanAvatar titan={titanState} />
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
