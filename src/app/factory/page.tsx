import { getFactoryStatusAction, getAssemblyLineTasksAction, getFactoryTasksAction, getLatestActiveRunAction } from "@/actions/factory";
import { StatusGrid } from "@/components/factory/StatusGrid";
import { RenderVideoForm } from "@/components/factory/RenderVideoForm";
import { TaskFeed } from "@/components/factory/TaskFeed";
import { CommandCenter } from "@/components/factory/CommandCenter";
import { VoiceCommandControl } from "@/components/factory/VoiceCommandControl";
import { AssemblyLinePresenter } from "@/components/factory/AssemblyLinePresenter";
import { LayoutDashboard, Activity, Mic2, Wrench } from "lucide-react";
import { BacklogBoard } from "@/components/factory/BacklogBoard";
import { FactoryRunConveyor } from "@/components/factory/FactoryRunConveyor";

export const dynamic = 'force-dynamic';

export default async function FactoryPage() {
    const [statusData, tasks, feedTasks, activeRun] = await Promise.all([
        getFactoryStatusAction(),
        getAssemblyLineTasksAction(),
        getFactoryTasksAction(),
        getLatestActiveRunAction()
    ]);

    // stats data processing for statusData since it returns different types now
    const stations = (statusData as any).success ? (statusData as any).stats : [];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
            <div className="container mx-auto py-10 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/60">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-xs font-bold tracking-widest uppercase">Operations Control</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            🏭 Factory Dashboard
                        </h1>
                        <p className="text-slate-400 max-w-2xl">
                            Real-time intelligence and execution monitoring for the IronForge Feature Assembly Line.
                        </p>
                    </div>
                </div>

                {/* Operations Telemetry (Command Center) */}
                <CommandCenter />

                {/* Main Process Tracking */}
                <FactoryRunConveyor activeRun={activeRun} />

                {/* Integration Controls */}
                <div className="grid gap-6 md:grid-cols-2">
                    <VoiceCommandControl />
                    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                Remote Sync Status
                            </h3>
                            <p className="text-xs text-slate-400">n8n & Discord integration active.</p>
                        </div>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">D</div>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-red-500 flex items-center justify-center text-[10px] font-bold">N</div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Left Column: Assembly Line (Main Focus) */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Assembly Line Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                    Feature Assembly Line
                                </h2>
                                <div className="h-px flex-1 mx-4 bg-slate-800" />
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm p-4">
                                <AssemblyLinePresenter tasks={tasks} />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    Station Health Status
                                </h2>
                                <div className="h-px flex-1 mx-4 bg-slate-800" />
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 shadow-2xl shadow-indigo-500/5">
                                <StatusGrid data={stations} />
                            </div>
                        </section>

                        {/* Discord Voice/Task Feed Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Mic2 className="w-5 h-5 text-indigo-400" />
                                    Voice-to-Assembly Feed
                                </h2>
                                <div className="h-px flex-1 mx-4 bg-slate-800" />
                            </div>
                            <TaskFeed tasks={feedTasks} />
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-slate-400" />
                                    Video Production
                                </h2>
                                <div className="h-px flex-1 mx-4 bg-slate-800" />
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6">
                                <RenderVideoForm />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Backlog (The "Fuel" for the factory) */}
                    <div className="space-y-6">
                        <section className="sticky top-10">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl">
                                <BacklogBoard />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
