import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PocketCastsAuth } from "@/features/podcast/components/PocketCastsAuth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SettingsPodcastPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-forge-900 bg-noise flex flex-col items-center justify-center p-6 pb-20">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-2">
                    <Link
                        href="/settings"
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Neural Link: Podcasts</h1>
                </div>

                <PocketCastsAuth onSuccess={() => redirect("/settings")} />

                <p className="text-center text-xs text-forge-muted mt-8">
                    Connected accounts will appear in your training dashboard.
                </p>
            </div>
        </div>
    );
}
