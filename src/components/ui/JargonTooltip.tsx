import React from "react";

export const JARGON_DEFINITIONS: Record<string, string> = {
    RPE: "Rate of Perceived Exertion (1-10). How hard a set felt.",
    "1RM": "One Rep Max. The theoretical maximum weight you can lift for one repetition.",
    MRV: "Maximum Recoverable Volume. The most training you can do while still recovering.",
    Hypertrophy: "Muscle growth. Training explicitly to increase muscle size.",
    Volume: "Total workload, often calculated as Sets x Reps x Weight.",
    "Titan Load": "A proprietary metric combining volume, intensity, and skill multipliers.",
    "Skill Tree": "Your progression system where you unlock new abilities and multipliers.",
    "Power Rating": "A composite score of your strength (Wilks) and cardio fitness.",
    ACWR: "Acute:Chronic Workload Ratio. Measures training load spikes to prevent injury. Optimal is 0.8-1.3.",
    VO2Max: "Maximum oxygen uptake. The gold standard for cardiovascular fitness.",
    TSB: "Training Stress Balance (Form - Fatigue). Positive means you are fresh, negative means you are fatigued.",
    CNS: "Central Nervous System. Heavy lifting taxes this more than your muscles.",
    TSS: "Training Stress Score. A measure of workout intensity and duration.",
    // New terms
    RIR: "Reps In Reserve. How many reps you had left before failure.",
    SFR: "Stimulus to Fatigue Ratio. Muscle growth per unit of recovery cost.",
    CTL: "Chronic Training Load (Fitness). Your long-term training average.",
    ATL: "Acute Training Load (Fatigue). Your short-term training stress.",
    HRV: "Heart Rate Variability. Higher values indicate better recovery state.",
    "Body Battery": "Garmin's recovery metric (0-100). Higher = more energy available.",
    Wilks: "A formula to compare powerlifting strength across weight classes.",
    e1RM: "Estimated One Rep Max. Calculated from submaximal lifts using formulas.",
    Zone: "Heart rate training zone (Z1-Z5). Based on %HRmax or %FTP.",
    FTP: "Functional Threshold Power. The power you can sustain for 1 hour.",
    Deload: "A planned week of reduced training intensity for recovery.",
};

interface JargonTooltipProps {
    term: string;
    children: React.ReactNode;
    className?: string;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({
    term,
    children,
    className = "",
}) => {
    const definition = JARGON_DEFINITIONS[term] || "No definition found.";

    return (
        <div className={`group relative inline-block cursor-help border-b border-dotted border-zinc-500 ${className}`}>
            {children}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-md bg-zinc-900 border border-zinc-700 p-2 text-xs text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50 pointer-events-none">
                <span className="font-bold text-magma block mb-1">{term}</span>
                {definition}
                {/* Triangle pointer */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 h-2 w-2 rotate-45 border-r border-b border-zinc-700 bg-zinc-900" />
            </div>
        </div>
    );
};
