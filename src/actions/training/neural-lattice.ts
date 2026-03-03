"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { getSkillNodeById } from "@/features/neural-lattice/data";
import { revalidatePath } from "next/cache";

export const unlockSkillNodeAction = authActionClient
    .schema(z.object({ nodeId: z.string() }))
    .action(async ({ parsedInput: { nodeId }, ctx: { userId } }) => {

        // 1. Fetch Node Data
        const node = getSkillNodeById(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found in lattice data.`);
        }

        return await prisma.$transaction(async (tx) => {
            // 2. Fetch User and Titan for currencies
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { titan: true, skills: true }
            });

            if (!user) throw new Error("User not found");
            if (!user.titan) throw new Error("Titan genesis required to access Neural Lattice");

            const kineticShards = user.kineticEnergy;
            const talentPoints = user.titan.talentPoints;

            // 3. Check if already unlocked
            const alreadyUnlocked = user.skills.some(s => s.skillId === nodeId && s.unlocked);
            if (alreadyUnlocked) {
                throw new Error("Node is already unlocked");
            }

            // 4. Validate connections (Adjacency)
            if (node.connections.length > 0) {
                const hasAConnection = user.skills.some(
                    s => s.unlocked && node.connections.includes(s.skillId)
                );
                if (!hasAConnection) {
                    throw new Error("You must unlock an adjacent node first");
                }
            }

            // 5. Validate costs
            if (kineticShards < node.costKS) {
                throw new Error(`Not enough Kinetic Shards. Requires ${node.costKS}, you have ${kineticShards}.`);
            }
            if (talentPoints < node.costTP) {
                throw new Error(`Not enough Talent Points. Requires ${node.costTP}, you have ${talentPoints}.`);
            }

            // 6. Deduct costs
            if (node.costKS > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { kineticEnergy: { decrement: node.costKS } }
                });
            }

            if (node.costTP > 0) {
                await tx.titan.update({
                    where: { id: user.titan.id },
                    data: { talentPoints: { decrement: node.costTP } }
                });
            }

            // 7. Grant the node
            const updatedSkill = await tx.userSkill.upsert({
                where: {
                    userId_skillId: {
                        userId,
                        skillId: nodeId
                    }
                },
                update: {
                    unlocked: true,
                    status: "UNLOCKED"
                },
                create: {
                    userId,
                    skillId: nodeId,
                    unlocked: true,
                    status: "UNLOCKED"
                }
            });

            revalidatePath("/neural-lattice");
            return { success: true, node: updatedSkill };
        });
    });
