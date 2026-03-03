import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NeuralLatticeClient } from "@/features/neural-lattice/components/NeuralLatticeClient";

export const metadata = {
    title: "Neural Lattice | IronForge",
    description: "Shape your destiny through the Neural Lattice.",
};

export default async function NeuralLatticePage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            titan: true,
            skills: true,
        },
    });

    if (!dbUser || !dbUser.titan) {
        redirect("/dashboard");
    }

    const currentKS = dbUser.kineticEnergy;
    const currentTP = dbUser.titan.talentPoints;
    const unlockedSkillIds = dbUser.skills.filter(s => s.unlocked).map(s => s.skillId);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest uppercase">
                        Neural Lattice
                    </h1>
                    <p className="text-steel max-w-2xl mt-1">
                        Allocate Talent Points (TP) earned from athletic volume and Kinetic Shards (KS) accumulated from recovery. Choose your path wisely, as Keystones demand physical sacrifice in exchange for power.
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full relative min-h-0 bg-black rounded-lg overflow-hidden border border-steel shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <NeuralLatticeClient
                    currentKS={currentKS}
                    currentTP={currentTP}
                    unlockedSkillIds={unlockedSkillIds}
                />
            </div>
        </div>
    );
}
