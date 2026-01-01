/// <reference types="web-bluetooth" />

export interface BioData {
    heartRate: number;
    rrIntervals?: number[];
    contactDetected?: boolean;
    energyExpended?: number;
}

type BioDataCallback = (data: BioData) => void;

export class BluetoothService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private onDataCallback: BioDataCallback | null = null;

    /**
     * Request a Bluetooth device with Heart Rate service
     */
    async connect(onData: BioDataCallback): Promise<void> {
        this.onDataCallback = onData;

        try {
            console.log('Requesting Bluetooth Device...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

            console.log('Connecting to GATT Server...');
            if (!this.device.gatt) {
                throw new Error('Device has no GATT server');
            }
            this.server = await this.device.gatt.connect();

            console.log('Getting Heart Rate Service...');
            const service = await this.server.getPrimaryService('heart_rate');

            console.log('Getting Heart Rate Measurement Characteristic...');
            this.characteristic = await service.getCharacteristic('heart_rate_measurement');

            console.log('Starting Notifications...');
            await this.characteristic.startNotifications();

            this.characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateMeasurement);

            console.log('Bluetooth Connected!');
        } catch (error) {
            console.error('Bluetooth Connection Error:', error);
            throw error;
        }
    }

    disconnect(): void {
        if (this.device) {
            if (this.device.gatt?.connected) {
                this.device.gatt.disconnect();
            }
            console.log('Device disconnected manually');
        }
    }

    private onDisconnected = (event: Event) => {
        const device = event.target as BluetoothDevice;
        console.log(`Device ${device.name} is disconnected.`);
        // Optionally implement auto-reconnect logic here
    };

    /**
     * Parse Heart Rate Measurement Data
     * See: https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/
     */
    private handleHeartRateMeasurement = (event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        const value = characteristic.value;
        if (!value) return;

        const data = this.parseHeartRate(value);

        if (this.onDataCallback) {
            this.onDataCallback(data);
        }
    };

    private parseHeartRate(value: DataView): BioData {
        const flags = value.getUint8(0);

        // Bit 0: Heart Rate Format (0 = UINT8, 1 = UINT16)
        const rate16Bits = (flags & 0x1) !== 0;

        // Bit 1-2: Sensor Contact Status
        const contactDetected = (flags & 0x6) === 0x6; // 110b -> Contact detected

        // Bit 3: Energy Expended Status
        const energyExpendedPresent = (flags & 0x8) !== 0;

        // Bit 4: RR-Interval Present
        const rrIntervalPresent = (flags & 0x10) !== 0;

        let index = 1;
        let heartRate = 0;

        if (rate16Bits) {
            heartRate = value.getUint16(index, true); // Little Endian
            index += 2;
        } else {
            heartRate = value.getUint8(index);
            index += 1;
        }

        let energyExpended: number | undefined;
        if (energyExpendedPresent) {
            energyExpended = value.getUint16(index, true);
            index += 2;
        }

        const rrIntervals: number[] = [];
        if (rrIntervalPresent) {
            while (index + 2 <= value.byteLength) {
                const rrInterval = value.getUint16(index, true);
                // RR values are in 1/1024 seconds resolution
                rrIntervals.push(rrInterval);
                index += 2;
            }
        }

        return {
            heartRate,
            contactDetected,
            energyExpended,
            rrIntervals: rrIntervals.length > 0 ? rrIntervals : undefined
        };
    }
}

export const bluetoothService = new BluetoothService();
