'use server';

import { prisma } from '@/lib/prisma';

export async function getTerritoriesAction() {
  try {
    const territories = await prisma.territory.findMany({
      include: {
        controlledBy: {
          select: {
            id: true,
            name: true,
            tag: true,
          },
        },
        _count: {
          select: {
            contestEntries: true,
          },
        },
      },
    });

    return { success: true, data: territories };
  } catch (error) {
    console.error('Failed to fetch territories:', error);
    return { success: false, error: 'Failed to load territory map.' };
  }
}

export async function getTerritoryDetailsAction(territoryId: string) {
  try {
    const territory = await prisma.territory.findUnique({
      where: { id: territoryId },
      include: {
        controlledBy: true,
        contestEntries: {
          where: {
            // weekNumber: getISOWeek(new Date()), // We'd need the helper here
            // year: new Date().getFullYear(),
          },
          include: {
            guild: {
              select: {
                name: true,
                tag: true,
              },
            },
          },
          orderBy: {
            xpEarned: 'desc',
          },
        },
      },
    });

    return { success: true, data: territory };
  } catch (error) {
    console.error('Failed to fetch territory details:', error);
    return { success: false, error: 'Failed to load territory details.' };
  }
}
