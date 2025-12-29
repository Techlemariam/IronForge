import { useState, useEffect, useRef, useCallback } from 'react';

// FTMS UUIDs
const FTMS_SERVICE_UUID = '00001826-0000-1000-8000-00805f9b34fb';
const FTMS_CONTROL_POINT_UUID = '00002ad9-0000-1000-8000-00805f9b34fb';
const FTMS_INDOOR_BIKE_DATA_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';

interface PowerData {
    watts: number;
    cadence: number;
    speed: number; // km/h
}

export const useBluetoothPower = () => {
    const [data, setData] = useState<PowerData>({ watts: 0, cadence: 0, speed: 0 });
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const deviceRef = useRef<BluetoothDevice | null>(null);
    const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
    const controlPointRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

    // Helper to write to control point
    const writeControl = useCallback(async (bytes: number[]) => {
        if (!controlPointRef.current) return;
        try {
            await controlPointRef.current.writeValue(new Uint8Array(bytes));
        } catch (e) {
            console.error("FTMS Write Error:", e);
        }
    }, []);

    // Helper: Parse Indoor Bike Data (0x2AD2)
    const handleDataChanged = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (!value) return;

        // Flags (16 bits)
        // Bit 0: More Data
        // Bit 1: Average Speed present
        // Bit 2: Instantaneous Cadence present
        // Bit 3: Average Cadence present
        // Bit 4: Total Distance present
        // Bit 5: Resistance Level present
        // Bit 6: Instantaneous Power present
        // Bit 7: Average Power present
        const flags = value.getUint16(0, true);

        let offset = 2; // Start after flags
        let speed = 0;
        let cadence = 0;
        let watts = 0;

        // Speed (Bit 0 of Flags meant More Data? standard says Bit 0 is Speed Kph in some contexts? 
        // FTMS Standard for Indoor Bike Data:
        // Flags Field (2 bytes)
        // Bit 0: More Data exst -> usually 0
        // Bit 0 (Wait, standard says):
        // Bit 0: 0=Instant Speed present

        // Actually adhering to standard parsing logic:
        // Flag definitions vary. Assuming typical layout:

        // Let's implement robust parsing based on bitmasks
        const hasSpeed = !((flags & 0x01)); // Usually speed is always present, sometimes gated
        // Wait, standard is:
        // Bit 0: More Data (0 = instant speed present? No.)

        // Let's use a simplified parser assuming standard Wahoo/Tacx packet structure
        // Usually: Flags(2), Speed(2, uint16, 0.01km/h), Power(2, sint16), Cadence(2, uint16, 0.5rpm)?

        // RE-READING STANDARD spec for 0x2AD2:
        // Flags (2 bytes)
        // Bit 0: More Data
        // Bit 1: Average Speed Present
        // Bit 2: Instantaneous Cadence Present
        // Bit 3: Average Cadence Present
        // Bit 4: Total Distance Present
        // ...
        // Bit 6: Instantaneous Power Present
        // ...

        // BUT ALSO: First field after flags is usually Instantaneous Speed (Uint16, 0.01km/h) IF Bit 0 is 0.
        // Wait, if Bit 0 is 0, then Instant Speed is present.

        // Let's assume standard implementation seen in open source libs:
        // Speed is almost always first (uint16).
        if ((flags & 0x01) === 0) {
            const speedRaw = value.getUint16(offset, true);
            speed = speedRaw * 0.01;
            offset += 2;
        }

        // Skip Average Speed if present (Bit 1)
        if (flags & 0x02) offset += 2;

        // Instantaneous Cadence (Bit 2)
        if (flags & 0x04) {
            const cadenceRaw = value.getUint16(offset, true);
            cadence = cadenceRaw * 0.5;
            offset += 2;
        }

        // Skip Average Cadence (Bit 3)
        if (flags & 0x08) offset += 2;

        // Skip Total Distance (Bit 4) - Uint24 (3 bytes)?
        if (flags & 0x10) offset += 3;

        // Skip Resistance Level (Bit 5) - Sint16
        if (flags & 0x20) offset += 2;

        // Instantaneous Power (Bit 6)
        if (flags & 0x40) {
            const powerRaw = value.getInt16(offset, true);
            watts = powerRaw;
            offset += 2;
        }

        setData({ watts, cadence, speed });
    };

    const disconnect = useCallback(() => {
        if (deviceRef.current) {
            if (deviceRef.current.gatt?.connected) {
                deviceRef.current.gatt.disconnect();
            }
        }
        setIsConnected(false);
        setData({ watts: 0, cadence: 0, speed: 0 });
    }, []);

    const connect = async () => {
        try {
            setError(null);
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [FTMS_SERVICE_UUID] }]
            });

            deviceRef.current = device;
            device.addEventListener('gattserverdisconnected', disconnect);

            const server = await device.gatt?.connect();
            if (!server) throw new Error("Could not connect to GATT Server");
            serverRef.current = server;

            const service = await server.getPrimaryService(FTMS_SERVICE_UUID);

            // Setup Notifications for Data
            const dataChar = await service.getCharacteristic(FTMS_INDOOR_BIKE_DATA_UUID);
            await dataChar.startNotifications();
            dataChar.addEventListener('characteristicvaluechanged', handleDataChanged);

            // Setup Control Point
            const cpChar = await service.getCharacteristic(FTMS_CONTROL_POINT_UUID);
            controlPointRef.current = cpChar;

            // Request Control (Op Code 0x00)
            await cpChar.writeValue(new Uint8Array([0x00]));

            setIsConnected(true);

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Connection failed");
            disconnect();
        }
    };

    // Control Methods
    const setTargetPower = async (watts: number) => {
        if (!isConnected) return;
        // OpCode 0x05 (Set Target Power) + Sint16 (watts)
        const buffer = new ArrayBuffer(3);
        const view = new DataView(buffer);
        view.setUint8(0, 0x05);
        view.setInt16(1, watts, true);
        await writeControl(Array.from(new Uint8Array(buffer)));
    };

    const setSimGrade = async (grade: number) => {
        if (!isConnected) return;
        // OpCode 0x11 (Set Sim Params)
        // We set wind speed 0, grade X, crr 0, wind coeff 0
        const buffer = new ArrayBuffer(7);
        const view = new DataView(buffer);
        view.setUint8(0, 0x11);
        view.setInt16(1, 0, true); // Wind
        view.setInt16(3, Math.round(grade * 100), true); // Grade (0.01%)
        view.setUint8(5, 0); // CRR
        view.setUint8(6, 0); // Wind Coeff
        await writeControl(Array.from(new Uint8Array(buffer)));
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
        error,
        data, // { watts, cadence, speed }
        setTargetPower,
        setSimGrade
    };
};
