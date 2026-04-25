import fs from 'node:fs';
import path from 'node:path';

export interface ModelQuota {
  model: string;
  used: number;
  limit: number;
  hoursLeft: number;
  progress: number;
}

export interface FactoryStats {
  totalTokensToday: number;
  costSekToday: number;
  activeTasks: number;
  pvsScore: number; // Passive Viability Score
  factoryMode: 'ON' | 'OFF';
  quotas: ModelQuota[];
}

export interface AssemblyLineTask {
  id: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  stage: 'DESIGN' | 'FABRICATION' | 'VERIFICATION' | 'SHIPPING';
  source: string;
  createdAt: Date;
}

export class FactoryService {
  private static readonly USAGE_PATH = path.join(process.cwd(), '.agent/usage.json');
  private static readonly RATE_PER_MILLION_USD = 0.15;
  private static readonly USD_TO_SEK = 10.5;

  public static async getStats(): Promise<FactoryStats> {
    let totalTokensToday = 0;
    const today = new Date().toISOString().split('T')[0];

    if (fs.existsSync(FactoryService.USAGE_PATH)) {
      try {
        const content = fs.readFileSync(FactoryService.USAGE_PATH, 'utf-8').replace(/^\uFEFF/, '');
        const data = JSON.parse(content);
        if (data.history) {
          for (const entry of data.history) {
            if (entry.date === today) {
              totalTokensToday += entry.tokens || 0;
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse usage.json:', e);
      }
    }

    const costSekToday =
      (totalTokensToday / 1000000) *
      FactoryService.RATE_PER_MILLION_USD *
      FactoryService.USD_TO_SEK;

    // Mock Quotas for now as requested (Image reference)
    const quotas: ModelQuota[] = [
      { model: 'Gemini Flash', used: 800000, limit: 1000000, hoursLeft: 3.5, progress: 80 },
      { model: 'Gemini Pro', used: 0, limit: 100000, hoursLeft: 67, progress: 0 },
      { model: 'Claude', used: 0, limit: 100000, hoursLeft: 67, progress: 0 },
    ];

    return {
      totalTokensToday,
      costSekToday: Number(costSekToday.toFixed(4)),
      activeTasks: 0, // Will be filled by action
      pvsScore: 85,
      factoryMode: 'ON',
      quotas,
    };
  }

  public static async getAssemblyLineTasks(): Promise<AssemblyLineTask[]> {
    const { prisma } = await import('@/lib/prisma');
    const tasks = await prisma.factoryTask.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => ({
      id: t.id,
      description: t.description,
      status: t.status as AssemblyLineTask['status'],
      stage: ((t as unknown as { stage?: string }).stage as AssemblyLineTask['stage']) || 'DESIGN',
      source: t.source,
      createdAt: t.createdAt,
    }));
  }
}
