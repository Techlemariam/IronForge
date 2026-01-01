import { useState, useEffect, useRef, useCallback } from "react";

// UUIDs
const RSC_SERVICE_UUID = "00001814-0000-1000-8000-00805f9b34fb";
const RSC_MEASUREMENT_UUID = "00002a53-0000-1000-8000-00805f9b34fb";

const FTMS_SERVICE_UUID = "00001826-0000-1000-8000-00805f9b34fb";
const FTMS_TREADMILL_DATA_UUID = "00002acd-0000-1000-8000-00805f9b34fb";

export interface RunningData {
    speedKph: number;
    cadence: number;
    incline?: number; // Only from FTMS
    source: "RSC" | "FTMS" | null;
}

export const useBluetoothSpeed = () => {
    const [data, setData] = useState<RunningData>({
        speedKph: 0,
        cadence: 0,
        source: null,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);

    // Refs
    const deviceRef = useRef<BluetoothDevice | null>(null);

    const disconnect = useCallback(() => {
        if (deviceRef.current) {
            if (deviceRef.current.gatt?.connected) {
                deviceRef.current.gatt.disconnect();
            }
        }
        setIsConnected(false);
        setDeviceName(null);
        setData({ speedKph: 0, cadence: 0, source: null });
    }, []);

    // RSC Parser (Standard: m/s * 256)
    const handleRSC = (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;

        const flags = value.getUint8(0);
        let offset = 1;

        // Instantaneous Speed (Always present per spec, uint16, 1/256 m/s)
        const speedRaw = value.getUint16(offset, true);
        const speedMps = speedRaw / 256.0;
        const speedKph = speedMps * 3.6;
        offset += 2;

        // Instantaneous Cadence (Always present, uint8, RPM)
        const cadence = value.getUint8(offset);
        offset += 1;

        // Instantaneous Stride Length (Present if Bit 0 is 1)
        if (flags & 0x01) offset += 2;

        // Total Distance (Present if Bit 1 is 1)
        if (flags & 0x02) offset += 4;

        setData({ speedKph, cadence, source: "RSC" });
    };

    // FTMS Treadmill Parser (Standard: 0.01 km/h)
    const handleFTMS = (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;

        // Flags (16 bits)
        const flags = value.getUint16(0, true);
        let offset = 2;

        // Bit 0: More Data (Ignore for now)

        // Bit 1: Average Speed (If 0, Instant Speed is present?)
        // Actually standard says:
        // "Instantaneous Speed is always present" is NOT true for Treadmill Data.
        // Fields are present only if bit is set... wait, checking spec:
        // Treadmill Data 0x2ACD:
        // Flags (2 bytes)
        // Inst Speed (2 bytes, 0.01 km/h) -> Present if Bit 0 is 0 (More Data=0? No.)

        // Correction based on GATT Spec:
        // Flags Bit 0: More Data.
        // Flags Bit 1: Average Speed Present.
        // Flags Bit 2: Total Distance Present.
        // Flags Bit 3: Inclination and Ramp Angle Setting Present.
        // Flags Bit 4: Elevation Gain Present.
        // ...
        // Instantaneous Speed field is ALWAYS present as the first field after Flags.

        const speedRaw = value.getUint16(offset, true);
        const speedKph = speedRaw * 0.01;
        offset += 2;

        // Skip Avg Speed
        if (flags & 0x02) offset += 2;

        // Skip Total Distance (3 bytes uint24)
        if (flags & 0x04) offset += 3;

        let incline = undefined;

        // Incline (Bit 3)
        if (flags & 0x08) {
            // Inclination (Sint16, 0.1%)
            const inclineRaw = value.getInt16(offset, true);
            incline = inclineRaw * 0.1;
            offset += 2;
            // Ramp Angle (Sint16, 0.1 degree) - we skip this
            offset += 2;
        }

        // FTMS Treadmill doesn't usually send cadence in this char
        setData((prev) => ({
            speedKph,
            cadence: prev.cadence, // Keep existing or 0
            incline,
            source: "FTMS"
        }));
    };

    const connect = async () => {
        try {
            setError(null);
            // Scan for BOTH RSC and FTMS
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [RSC_SERVICE_UUID] },
                    { services: [FTMS_SERVICE_UUID] }
                ],
            });

            deviceRef.current = device;
            setDeviceName(device.name || "Unknown Device");
            device.addEventListener("gattserverdisconnected", disconnect);

            const server = await device.gatt?.connect();
            if (!server) throw new Error("Could not connect to GATT Server");

            // Try FTMS First (Preferred for incline)
            try {
                const service = await server.getPrimaryService(FTMS_SERVICE_UUID);
                const char = await service.getCharacteristic(FTMS_TREADMILL_DATA_UUID);
                await char.startNotifications();
                char.addEventListener("characteristicvaluechanged", handleFTMS);
                setIsConnected(true);
                console.log("Connected via FTMS (Treadmill)");
                return;
            } catch (e) {
                console.log("FTMS Treadmill not found, trying RSC...", e);
            }

            // Try RSC Second (Fallback)
            try {
                const service = await server.getPrimaryService(RSC_SERVICE_UUID);
                const char = await service.getCharacteristic(RSC_MEASUREMENT_UUID);
                await char.startNotifications();
                char.addEventListener("characteristicvaluechanged", handleRSC);
                setIsConnected(true);
                console.log("Connected via RSC (Running Speed)");
                return;
            } catch (e) {
                throw new Error("Device does not support Running Speed (RSC) or Treadmill (FTMS)");
            }

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Connection failed");
            disconnect();
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        connect,
        disconnect,
        isConnected,
        deviceName,
        error,
        data,
    };
};
