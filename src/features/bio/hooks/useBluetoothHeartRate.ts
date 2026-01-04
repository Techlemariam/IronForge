import { useState, useEffect, useRef, useCallback } from "react";

export const useBluetoothHeartRate = () => {
  const [bpm, setBpm] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to handle event listeners without re-binding
  const deviceRef = useRef<any>(null);
  const disconnectHandlerRef = useRef<EventListener | null>(null);

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        console.log("Cleaning up Bluetooth Connection...");
        // Remove listener to prevent leaks
        if (disconnectHandlerRef.current) {
          deviceRef.current.removeEventListener(
            "gattserverdisconnected",
            disconnectHandlerRef.current,
          );
        }
        // Disconnect GATT
        if (deviceRef.current.gatt && deviceRef.current.gatt.connected) {
          deviceRef.current.gatt.disconnect();
        }
      }
    };
  }, []);

  const connectToDevice = async () => {
    try {
      setError(null);
      // Request device with Heart Rate service
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
      });

      deviceRef.current = device;

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService("heart_rate");
      const characteristic = await service?.getCharacteristic(
        "heart_rate_measurement",
      );

      await characteristic?.startNotifications();
      characteristic?.addEventListener(
        "characteristicvaluechanged",
        handleHeartRateChanged,
      );

      setIsConnected(true);

      // Define handler and store in ref for cleanup
      const handleDisconnect = () => {
        setIsConnected(false);
        setBpm(null);
      };
      disconnectHandlerRef.current = handleDisconnect;

      device.addEventListener("gattserverdisconnected", handleDisconnect);
    } catch (e: any) {
      console.error(e);
      setError("Connection failed or cancelled.");
    }
  };

  const handleHeartRateChanged = (event: any) => {
    const value = event.target.value;
    const flags = value.getUint8(0);
    let hr = 0;

    // Check format (uint8 vs uint16) based on flags
    if (flags & 0x01) {
      hr = value.getUint16(1, true); // 16-bit
    } else {
      hr = value.getUint8(1); // 8-bit
    }
    setBpm(hr);
  };

  // Z2 Trigger Logic: Play sound when dropping into Zone 2
  // We use a ref to track previous BPM to detect the *crossing* of the threshold
  const prevBpmRef = useRef<number | null>(null);

  const playTacticalPing = useCallback(() => {
    // Simple Web Audio API beep
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  useEffect(() => {
    if (bpm && prevBpmRef.current) {
      // If we were above 120, and now we are 120 or below
      if (prevBpmRef.current > 120 && bpm <= 120) {
        playTacticalPing();
      }
    }
    prevBpmRef.current = bpm;
  }, [bpm, playTacticalPing]);

  // Simulation for testing without device
  const toggleSimulation = () => {
    if (bpm && bpm > 120)
      setBpm(115); // Drop to Z2
    else setBpm(155); // Spike up
  };

  const disconnect = () => {
    if (deviceRef.current) {
      if (deviceRef.current.gatt && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
      }
    }
    setIsConnected(false);
    setBpm(null);
  };

  return {
    bpm,
    isConnected,
    error,
    connect: connectToDevice,
    connectToDevice, // Keep for backward compatibility
    disconnect,
    toggleSimulation,
  };
};
