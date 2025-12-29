/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TvMode } from '../TvMode';
import { useBluetoothPower } from '@/hooks/useBluetoothPower';
import { useBluetoothHeartRate } from '@/hooks/useBluetoothHeartRate';
import { useTitanReaction } from '@/features/titan/useTitanReaction';
import { useGuildContribution } from '@/hooks/useGuildContribution';
import { useCompanionRelay } from '@/features/companion/useCompanionRelay';

// Mock Hooks
vi.mock('@/hooks/useBluetoothPower');
vi.mock('@/hooks/useBluetoothHeartRate');
vi.mock('@/features/titan/useTitanReaction');
vi.mock('@/hooks/useGuildContribution');
vi.mock('@/features/companion/useCompanionRelay');

vi.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('TvMode Integration', () => {
    const mockPower = {
        data: {
            watts: 200,
            cadence: 85,
        },
        isConnected: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
    };

    const mockHeartRate = {
        bpm: 145,
        isConnected: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
    };

    const mockTitan = {
        thought: "Push harder, warrior!",
        mood: "FOCUSED",
    };

    const mockGuild = {
        raidState: {
            active: true,
            bossName: "Frost Giant",
            totalHp: 1000000,
            currentHp: 670000,
            mySessionDamage: 1500
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useBluetoothPower as any).mockReturnValue(mockPower);
        (useBluetoothHeartRate as any).mockReturnValue(mockHeartRate);
        (useTitanReaction as any).mockReturnValue(mockTitan);
        (useGuildContribution as any).mockReturnValue(mockGuild);
        (useCompanionRelay as any).mockReturnValue({ lastEvent: null });
    });

    it('renders the connection/setup screen initially if disconnected', () => {
        (useBluetoothPower as any).mockReturnValue({
            isConnected: false,
            data: { watts: 0, cadence: 0 },
            connect: vi.fn(),
            disconnect: vi.fn()
        });
        (useBluetoothHeartRate as any).mockReturnValue({
            isConnected: false,
            bpm: 0,
            connect: vi.fn(),
            disconnect: vi.fn()
        });

        render(<TvMode onExit={vi.fn()} />);

        // Should show default values (0)
        expect(screen.getAllByText(/0/).length).toBeGreaterThan(0);
    });

    it('renders the main HUD when sensors are connected', () => {
        // Mock connected state
        (useBluetoothHeartRate as any).mockReturnValue({ ...mockHeartRate, isConnected: true, bpm: 145 });
        (useBluetoothPower as any).mockReturnValue({ ...mockPower, isConnected: true, data: { watts: 200 } });

        render(<TvMode onExit={vi.fn()} />);

        // Check for HUD elements (might appear twice due to mobile/desktop layouts)
        const hrElements = screen.getAllByText(/145/);
        expect(hrElements.length).toBeGreaterThan(0);

        const powerElements = screen.getAllByText(/200/);
        expect(powerElements.length).toBeGreaterThan(0);
    });

    it('displays Titan dialogue correctly', () => {
        render(<TvMode onExit={vi.fn()} />);
        expect(screen.getByText(/Push harder, warrior!/)).toBeDefined();
    });

    it('shows guild contribution stats', () => {
        // Ensure raid is active in mock
        (useGuildContribution as any).mockReturnValue({
            raidState: {
                active: true,
                bossName: "Frost Giant",
                totalHp: 1000000,
                currentHp: 670000,
                mySessionDamage: 1500
            }
        });

        render(<TvMode onExit={vi.fn()} />);
        // use flexible regex for formatted numbers
        expect(screen.getByText(/1.*500/)).toBeDefined();
    });

    // Add more interactive tests if buttons/toggles exist
});
