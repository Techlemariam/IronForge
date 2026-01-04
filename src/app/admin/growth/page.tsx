import { GrowthMetricsService } from "@/services/analytics/GrowthMetricsService";
import { TrendingUp, Users, Target, Smartphone, Tv, Monitor, AlertTriangle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GrowthDashboardPage() {
    const snapshot = await GrowthMetricsService.getGrowthSnapshot();

    const { businessTriggers, funnel } = snapshot;

    // Calculate trigger progress
    const userProgress = Math.min(100, (businessTriggers.recurringUsers.current / businessTriggers.recurringUsers.target) * 100);
    const retentionMet = businessTriggers.retentionRate.current >= businessTriggers.retentionRate.target;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Growth Dashboard</h1>
                        <p className="text-zinc-500 text-sm">Path to Passive Income • Updated {new Date(snapshot.timestamp).toLocaleString()}</p>
                    </div>
                </div>

                {/* Business Triggers */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-300 flex items-center gap-2">
                        <Target className="w-5 h-5" /> Business Triggers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Recurring Users */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="w-6 h-6 text-blue-400" />
                                <span className={`text-xs font-bold px-2 py-1 rounded ${userProgress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {userProgress >= 100 ? '✓ MET' : 'IN PROGRESS'}
                                </span>
                            </div>
                            <div className="text-4xl font-black text-white">
                                {businessTriggers.recurringUsers.current}
                                <span className="text-lg text-zinc-500">/{businessTriggers.recurringUsers.target}</span>
                            </div>
                            <div className="text-sm text-zinc-500 mt-1">Recurring Users (7d)</div>
                            <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                                    style={{ width: `${userProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Retention Rate */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                                <span className={`text-xs font-bold px-2 py-1 rounded ${retentionMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {retentionMet ? '✓ MET' : 'BELOW TARGET'}
                                </span>
                            </div>
                            <div className="text-4xl font-black text-white">
                                {businessTriggers.retentionRate.current}%
                            </div>
                            <div className="text-sm text-zinc-500 mt-1">Week-over-Week Retention</div>
                            <div className="text-xs text-zinc-600 mt-2">Target: ≥{businessTriggers.retentionRate.target}%</div>
                        </div>

                        {/* Demand Signal */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                                <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-400">MANUAL</span>
                            </div>
                            <div className="text-2xl font-bold text-zinc-400">—</div>
                            <div className="text-sm text-zinc-500 mt-1">Demand Signal</div>
                            <div className="text-xs text-zinc-600 mt-2">Check Discord/Support for &quot;Can I pay?&quot;</div>
                        </div>

                        {/* Infrastructure Cost */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Monitor className="w-6 h-6 text-cyan-400" />
                                <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-400">MANUAL</span>
                            </div>
                            <div className="text-2xl font-bold text-zinc-400">—</div>
                            <div className="text-sm text-zinc-500 mt-1">Monthly Cost</div>
                            <div className="text-xs text-zinc-600 mt-2">Target: &gt;500 SEK/mo (Vercel/Supabase)</div>
                        </div>
                    </div>
                </section>

                {/* Funnel Metrics */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-300">📊 Funnel Health</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Onboarding */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="text-3xl font-black text-white">{funnel.onboardingCompletionRate}%</div>
                            <div className="text-sm text-zinc-500">Onboarding Completion</div>
                            <div className={`text-xs mt-2 ${funnel.onboardingCompletionRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {funnel.onboardingCompletionRate >= 50 ? '✓ Healthy' : '⚠️ Below 50%'}
                            </div>
                        </div>

                        {/* Activation */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="text-3xl font-black text-white">{funnel.activationRate}%</div>
                            <div className="text-sm text-zinc-500">24h Activation Rate</div>
                            <div className="text-xs text-zinc-600 mt-2">Users who logged workout within 24h</div>
                        </div>

                        {/* Social */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="text-3xl font-black text-white">{funnel.socialEngagementRate}%</div>
                            <div className="text-sm text-zinc-500">Social Engagement</div>
                            <div className="text-xs text-zinc-600 mt-2">Users with ≥1 friend</div>
                        </div>
                    </div>
                </section>

                {/* Platform Reach */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-300">🌍 Platform Reach</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
                            <Smartphone className="w-8 h-8 text-blue-400" />
                            <div>
                                <div className="font-bold">Mobile PWA</div>
                                <div className="text-sm text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Install Prompt Ready
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
                            <Tv className="w-8 h-8 text-purple-400" />
                            <div>
                                <div className="font-bold">TV Mode</div>
                                <div className="text-sm text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" /> Detection Only
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
                            <Monitor className="w-8 h-8 text-cyan-400" />
                            <div>
                                <div className="font-bold">Desktop</div>
                                <div className="text-sm text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Full Support
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Monetization Status */}
                <section className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Monetization Status: PAUSED</h3>
                            <p className="text-zinc-500 text-sm">
                                Waiting for business triggers. Focus on acquisition and retention.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
