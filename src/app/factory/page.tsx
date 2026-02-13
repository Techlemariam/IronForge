import { getFactoryStatus } from "@/actions/factory";
import { StatusGrid } from "@/components/factory/StatusGrid";
import { RenderVideoForm } from "@/components/factory/RenderVideoForm";

export const dynamic = 'force-dynamic';

export default async function FactoryPage() {
    const statusData = await getFactoryStatus();

    return (
        <div className="container mx-auto py-10 space-y-12">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    🏭 Factory Dashboard
                </h1>
                <p className="text-slate-400">
                    Real-time status of the Feature Assembly Line and production tools.
                </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Assembly Line Status</h2>
                <StatusGrid data={statusData} />
            </div>

            <div className="space-y-4">
                 <h2 className="text-xl font-semibold text-white">Video Production</h2>
                <RenderVideoForm />
            </div>
        </div>
    );
}
