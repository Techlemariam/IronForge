/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TvMode } from "../TvMode";
import { useBluetoothHeartRate } from "@/features/bio/hooks/useBluetoothHeartRate";
import { useBluetoothPower } from "@/features/bio/hooks/useBluetoothPower";
import { useTitanReaction } from "@/features/titan/useTitanReaction";
import { useGuildContribution } from "@/features/guild/hooks/useGuildContribution";
import { useCompanionRelay } from "@/features/companion/useCompanionRelay";

vi.mock("framer-motion", () => {
  const MockDiv = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ));
  MockDiv.displayName = "MotionDiv";

  return {
    motion: {
      div: MockDiv,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => (key === "session" ? "test-session" : null)),
  })),
}));

// Mock Hooks
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: "test-user" } } }),
      ),
    },
  }),
}));

// Polyfill crypto for node environments without it
if (typeof crypto === "undefined") {
  (global as any).crypto = { randomUUID: () => "test-uuid" };
}

vi.mock("@/features/bio/hooks/useBluetoothPower");
vi.mock("@/features/bio/hooks/useBluetoothHeartRate");
vi.mock("@/features/titan/useTitanReaction");
vi.mock("@/features/guild/hooks/useGuildContribution");
vi.mock("@/features/companion/useCompanionRelay");
vi.mock("@/features/combat/hooks/useLiveCombat", () => ({
  useLiveCombat: vi.fn(() => ({
    boss: { name: "Test Boss", currentHp: 500, maxHp: 1000 },
    lastDamage: 50,
  })),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

// Skip due to React context/hook mock complexity - needs refactoring
describe("TvMode Integration", () => {
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
    totalDamage: 1500,
    pendingDamage: 0,
    bossHp: 670000,
    bossTotalHp: 1000000,
    bossName: "Frost Giant",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));

    (useBluetoothPower as any).mockReturnValue(mockPower);
    (useBluetoothHeartRate as any).mockReturnValue(mockHeartRate);
    (useTitanReaction as any).mockReturnValue(mockTitan);
    (useGuildContribution as any).mockReturnValue(mockGuild);
    (useCompanionRelay as any).mockReturnValue({ lastEvent: null });
  });

  it("renders the connection/setup screen initially if disconnected", () => {
    (useBluetoothPower as any).mockReturnValue({
      isConnected: false,
      data: { watts: 0, cadence: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    });
    (useBluetoothHeartRate as any).mockReturnValue({
      isConnected: false,
      bpm: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<TvMode onExit={vi.fn()} />);

    // Should show default values (0)
    expect(screen.getAllByText(/0/).length).toBeGreaterThan(0);
  });

  it("renders the main HUD when sensors are connected", () => {
    // Mock connected state
    (useBluetoothHeartRate as any).mockReturnValue({
      ...mockHeartRate,
      isConnected: true,
      bpm: 145,
    });
    (useBluetoothPower as any).mockReturnValue({
      ...mockPower,
      isConnected: true,
      data: { watts: 200 },
    });

    render(<TvMode onExit={vi.fn()} />);

    // Check for HUD elements (might appear twice due to mobile/desktop layouts)
    const hrElements = screen.getAllByText(/145/);
    expect(hrElements.length).toBeGreaterThan(0);

    const powerElements = screen.getAllByText(/200/);
    expect(powerElements.length).toBeGreaterThan(0);
  });

  it("displays Titan dialogue correctly", () => {
    render(<TvMode onExit={vi.fn()} />);
    expect(screen.getByText(/Push harder, warrior!/)).toBeDefined();
  });

  it("shows guild contribution stats", () => {
    // Ensure raid is active in mock
    (useGuildContribution as any).mockReturnValue({
      totalDamage: 1500,
      pendingDamage: 0,
      bossHp: 670000,
      bossTotalHp: 1000000,
      bossName: "Frost Giant",
    });

    render(<TvMode onExit={vi.fn()} userId="test-user" />);

    // Check for static labels first to confirm HUD is rendered
    expect(screen.getByText("Solo Target")).toBeDefined();
    expect(screen.getByText("Guild Raid")).toBeDefined();

    expect(screen.getByText("Frost Giant")).toBeDefined();
    expect(screen.getByText(/1.*500/)).toBeDefined();
  });

  // Add more interactive tests if buttons/toggles exist
});

// Test the zone calculation logic directly
describe("getZoneFromHr (Zone Calculation)", () => {
  // Extract the function logic for direct testing
  const getZoneFromHr = (hr: number, maxHr: number = 190) => {
    const pct = (hr / maxHr) * 100;
    if (pct < 60) return 1;
    if (pct < 70) return 2;
    if (pct < 80) return 3;
    if (pct < 90) return 4;
    return 5;
  };

  it("should return Zone 1 for HR below 60% of maxHr", () => {
    expect(getZoneFromHr(100, 190)).toBe(1); // 52.6%
    expect(getZoneFromHr(110, 190)).toBe(1); // 57.9%
  });

  it("should return Zone 2 for HR between 60-70% of maxHr", () => {
    expect(getZoneFromHr(114, 190)).toBe(2); // 60%
    expect(getZoneFromHr(130, 190)).toBe(2); // 68.4%
  });

  it("should return Zone 3 for HR between 70-80% of maxHr", () => {
    expect(getZoneFromHr(133, 190)).toBe(3); // 70%
    expect(getZoneFromHr(150, 190)).toBe(3); // 78.9%
  });

  it("should return Zone 4 for HR between 80-90% of maxHr", () => {
    expect(getZoneFromHr(152, 190)).toBe(4); // 80%
    expect(getZoneFromHr(170, 190)).toBe(4); // 89.5%
  });

  it("should return Zone 5 for HR above 90% of maxHr", () => {
    expect(getZoneFromHr(171, 190)).toBe(5); // 90%
    expect(getZoneFromHr(185, 190)).toBe(5); // 97.4%
  });

  it("should correctly calculate zones with custom maxHr", () => {
    // For maxHr = 170
    expect(getZoneFromHr(100, 170)).toBe(1); // 58.8%
    expect(getZoneFromHr(103, 170)).toBe(2); // 60.6%
    expect(getZoneFromHr(136, 170)).toBe(4); // 80%
    expect(getZoneFromHr(155, 170)).toBe(5); // 91.2%
  });

  it("should handle edge cases at zone boundaries", () => {
    // Exactly at boundary percentages
    const maxHr = 200;
    expect(getZoneFromHr(119, maxHr)).toBe(1); // 59.5% < 60
    expect(getZoneFromHr(120, maxHr)).toBe(2); // 60% exactly
    expect(getZoneFromHr(140, maxHr)).toBe(3); // 70% exactly
    expect(getZoneFromHr(160, maxHr)).toBe(4); // 80% exactly
    expect(getZoneFromHr(180, maxHr)).toBe(5); // 90% exactly
  });
});
