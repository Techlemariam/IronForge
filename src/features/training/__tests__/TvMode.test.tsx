/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TvMode } from "../TvMode";
import { useBluetoothPower } from "@/hooks/useBluetoothPower";
import { useBluetoothHeartRate } from "@/hooks/useBluetoothHeartRate";
import { useTitanReaction } from "@/features/titan/useTitanReaction";
import { useGuildContribution } from "@/hooks/useGuildContribution";
import { useCompanionRelay } from "@/features/companion/useCompanionRelay";
import { useLiveCombat } from "@/hooks/useLiveCombat";

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div {...props} ref={ref}>
        {children}
      </div>
    )),
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

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

vi.mock("@/hooks/useBluetoothPower");
vi.mock("@/hooks/useBluetoothHeartRate");
vi.mock("@/features/titan/useTitanReaction");
vi.mock("@/hooks/useGuildContribution");
vi.mock("@/features/companion/useCompanionRelay");
vi.mock("@/hooks/useLiveCombat", () => ({
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
