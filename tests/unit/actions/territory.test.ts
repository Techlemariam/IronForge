import { describe, it, expect, vi } from 'vitest';
import { getTerritoryMapAction } from '@/actions/territory';
import { TerritoryControlService } from '@/services/TerritoryControlService';

// Mock the service
vi.mock('@/services/TerritoryControlService', () => ({
    TerritoryControlService: {
        getMapState: vi.fn()
    }
}));

describe('Territory Actions', () => {
    describe('getTerritoryMapAction', () => {
        it('should return success with map data', async () => {
            const mockMapState = {
                territories: [
                    {
                        id: 'territory-1',
                        name: 'Mount Olympus',
                        region: 'iron_peaks',
                        type: 'TRAINING_GROUNDS',
                        coordX: 50,
                        coordY: 20,
                        controlledBy: null,
                        controlledByName: null,
                        influencePoints: 0
                    }
                ]
            };

            vi.mocked(TerritoryControlService.getMapState).mockResolvedValue(mockMapState);

            const result = await getTerritoryMapAction();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockMapState);
        });

        it('should handle errors gracefully', async () => {
            vi.mocked(TerritoryControlService.getMapState).mockRejectedValue(new Error('DB Error'));

            const result = await getTerritoryMapAction();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to load territory map');
        });
    });
});
