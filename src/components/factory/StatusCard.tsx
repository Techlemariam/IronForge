import { FactoryStatusData } from "@/actions/factory";

interface Props {
    status: FactoryStatusData;
}

/**
 * Displays the status, health, and current job of a specific factory station.
 * Uses color-coded indicators (Green, Amber, Red) based on health and busy state.
 * 
 * @param {Props} props - The component props.
 * @param {FactoryStatusData} props.status - The status data for the station.
 */
export function StatusCard({ status }: Props) {
    const isBusy = !!status.current;
    const isError = status.health < 50;
    const clampedHealth = Math.min(100, Math.max(0, status.health || 0));
    const statusLabel = isError ? 'Error' : isBusy ? 'Busy' : 'Available';

    return (
        <div className={`
      relative overflow-hidden rounded-xl border p-6 transition-all
      ${isError ? 'border-red-500/50 bg-red-950/20' :
                isBusy ? 'border-amber-500/50 bg-amber-950/20' :
                    'border-green-500/50 bg-green-950/20'}
    `}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold capitalize text-slate-100">
                    {status.station}
                </h3>
                <div
                    className={`h-3 w-3 rounded-full animate-pulse ${isError ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-green-500'}`}
                    aria-label={`Station status: ${statusLabel}`}
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Health</span>
                    <span className={`font-mono ${isError ? 'text-red-400' : 'text-green-400'}`}>
                        {status.health}%
                    </span>
                </div>

                <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Current Job</span>
                    <p className="font-medium text-slate-200 truncate">
                        {status.current || "IDLE"}
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div
                    className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={clampedHealth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${status.station} station health`}
                >
                    {/* Progress Fill */}
                    <div
                        className={`h-full transition-all duration-500 ${isError ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${clampedHealth}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
