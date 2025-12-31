import QuickLogSession from "@/components/logger/QuickLogSession";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Iron Logger | IronForge",
    description: "Quickly log your workouts.",
};

export default async function LoggerPage() {
    return (
        <div className="min-h-screen bg-black/90 pb-20">
            {/* Simple Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center">
                <Link
                    href="/dashboard"
                    className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <span className="ml-2 font-bold text-sm text-zinc-500 uppercase tracking-widest">
                    Training Operations
                </span>
            </header>

            <main className="container max-w-lg mx-auto p-4 pt-8">
                <QuickLogSession />
            </main>
        </div>
    );
}
