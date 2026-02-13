import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    // Temporarily allowed for hydration

    const territories = [
        {
            name: "Iron Forge",
            region: "Central",
            type: "Industrial",
            coordX: 0,
            coordY: 0,
            bonuses: { xp: 10, gold: 5 },
        },
        {
            name: "Shadow Basin",
            region: "South",
            type: "Darkness",
            coordX: -10,
            coordY: -15,
            bonuses: { xp: 10, kinetic: 5 },
        },
        {
            name: "Azure Peak",
            region: "North",
            type: "Highland",
            coordX: 15,
            coordY: 20,
            bonuses: { xp: 10, recovery: 5 },
        },
    ];

    try {
        for (const t of territories) {
            await prisma.territory.upsert({
                where: { name: t.name },
                update: {},
                create: {
                    name: t.name,
                    region: t.region,
                    type: t.type,
                    coordX: t.coordX,
                    coordY: t.coordY,
                    bonuses: t.bonuses as any,
                },
            });
        }
        return NextResponse.json({ success: true, seeded: territories.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
