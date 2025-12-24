import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Activity, CheckCircle, XCircle, AlertTriangle, Loader2, Link as LinkIcon } from 'lucide-react';
import ForgeButton from '../ui/ForgeButton';
import ForgeInput from '../ui/ForgeInput';
import { connectHevy, disconnectHevy, connectIntervals, disconnectIntervals } from '@/actions/integrations';

interface IntegrationsPanelProps {
    userId: string;
    hevyConnected: boolean;
    intervalsConnected: boolean;
    onIntegrationChanged?: () => void;
}

type IntegrationType = 'HEVY' | 'INTERVALS';

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({
    userId,
    hevyConnected: initialHevy,
    intervalsConnected: initialIntervals,
    onIntegrationChanged
}) => {
    const [hevyConnected, setHevyConnected] = useState(initialHevy);
    const [intervalsConnected, setIntervalsConnected] = useState(initialIntervals);
    const [expanded, setExpanded] = useState<IntegrationType | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form States
    const [hevyKey, setHevyKey] = useState('');
    const [intervalsKey, setIntervalsKey] = useState('');
    const [intervalsId, setIntervalsId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConnectHevy = () => {
        setError(null);
        startTransition(async () => {
            const result = await connectHevy(userId, hevyKey);
            if (result.success) {
                setHevyConnected(true);
                setExpanded(null);
                setHevyKey('');
                onIntegrationChanged?.();
            } else {
                setError(result.error || 'Failed to connect Hevy');
            }
        });
    };

    const handleDisconnectHevy = () => {
        if (!confirm('Are you sure? This will stop workout syncing.')) return;
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
                setIntervalsKey('');
                setIntervalsId('');
                onIntegrationChanged?.();
            } else {
                setError(result.error || 'Failed to connect Intervals.icu');
            }
        });
    };

    const handleDisconnectIntervals = () => {
        if (!confirm('Are you sure? This will stop cardio syncing.')) return;
        startTransition(async () => {
            const result = await disconnectIntervals(userId);
            if (result.success) {
                setIntervalsConnected(false);
                onIntegrationChanged?.();
            }
        });
    };

    const renderCard = (type: IntegrationType, isConnected: boolean, title: string, icon: React.ReactNode, description: string) => (
        <div className={`p-4 rounded-lg border transition-all ${isConnected ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-wide text-sm">{title}</h3>
                        <p className="text-xs text-zinc-400">{description}</p>
                    </div>
                </div>

                {isConnected ? (
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono uppercase tracking-widest">
                            <CheckCircle size={12} /> Live
                        </span>
                        <button
                            disabled={isPending}
                            onClick={type === 'HEVY' ? handleDisconnectHevy : handleDisconnectIntervals}
                            className="text-zinc-500 hover:text-red-400 text-xs underline decoration-dotted transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <ForgeButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpanded(expanded === type ? null : type)}
                        className={expanded === type ? 'bg-white/10' : ''}
                    >
                        {expanded === type ? 'Cancel' : 'Connect'}
                    </ForgeButton>
                )}
            </div>

            <AnimatePresence>
                {expanded === type && !isConnected && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 pt-3 border-t border-white/10">
                            {type === 'HEVY' && (
                                <>
                                    <ForgeInput
                                        label="API Key"
                                        placeholder="Paste your Hevy API Key"
                                        type="password"
                                        value={hevyKey}
                                        onChange={e => setHevyKey(e.target.value)}
                                    />
                                    <ForgeButton
                                        fullWidth
                                        variant="magma"
                                        onClick={handleConnectHevy}
                                        disabled={isPending || !hevyKey}
                                    >
                                        {isPending ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Validate & Connect'}
                                    </ForgeButton>
                                </>
                            )}

                            {type === 'INTERVALS' && (
                                <>
                                    <ForgeInput
                                        label="Athlete ID"
                                        placeholder="e.g. i12345"
                                        value={intervalsId}
                                        onChange={e => setIntervalsId(e.target.value)}
                                    />
                                    <ForgeInput
                                        label="API Key"
                                        placeholder="API_KEY from settings"
                                        type="password"
                                        value={intervalsKey}
                                        onChange={e => setIntervalsKey(e.target.value)}
                                    />
                                    <ForgeButton
                                        fullWidth
                                        variant="magma"
                                        onClick={handleConnectIntervals}
                                        disabled={isPending || !intervalsKey || !intervalsId}
                                    >
                                        {isPending ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Validate & Connect'}
                                    </ForgeButton>
                                </>
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

    return (
        <div className="space-y-4">
            <h3 className="font-heading text-xs text-forge-muted uppercase tracking-widest mb-2 px-1">Active Uplinks</h3>
            {renderCard(
                'HEVY',
                hevyConnected,
                'Hevy Strength',
                <Dumbbell size={18} />,
                'Syncs workouts, sets, and body stats'
            )}
            {renderCard(
                'INTERVALS',
                intervalsConnected,
                'Intervals.icu',
                <Activity size={18} />,
                'Syncs cardio, wellness, and fatigue'
            )}
        </div>
    );
};

export default IntegrationsPanel;
