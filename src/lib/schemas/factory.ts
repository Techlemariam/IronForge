import { z } from 'zod';

/**
 * Represents the health and status of a single factory station.
 */
export const FactoryStatusSchema = z.object({
    id: z.string(),
    station: z.string(),
    health: z.number().min(0).max(100),
    current: z.string().nullable(),
    updatedAt: z.date(),
    metadata: z.any().optional(),
});

export type FactoryStatusData = z.infer<typeof FactoryStatusSchema>;
