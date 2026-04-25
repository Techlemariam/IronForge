/// <reference types="web-bluetooth" />

export interface BioData {
  heartRate: number;
  rrIntervals?: number[];
  contactDetected?: boolean;
  energyExpended?: number;
}

type BioDataCallback = (data: BioData) => void;

export namespace Bluetooth {
  let device: BluetoothDevice | null = null;
  let server: BluetoothRemoteGATTServer | null = null;
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  let onDataCallback: BioDataCallback | null = null;

  /**
   * Request a Bluetooth device with Heart Rate service
   */
  export async function connect(onData: BioDataCallback): Promise<void> {
    onDataCallback = onData;

    try {
      console.log('Requesting Bluetooth Device...');
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      device.addEventListener('gattserverdisconnected', onDisconnected);

      console.log('Connecting to GATT Server...');
      if (!device.gatt) {
        throw new Error('Device has no GATT server');
      }
      server = await device.gatt.connect();

      console.log('Getting Heart Rate Service...');
      const service = await server.getPrimaryService('heart_rate');

      console.log('Getting Heart Rate Measurement Characteristic...');
      characteristic = await service.getCharacteristic('heart_rate_measurement');

      console.log('Starting Notifications...');
      await characteristic.startNotifications();

      characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);

      console.log('Bluetooth Connected!');
    } catch (error) {
      console.error('Bluetooth Connection Error:', error);
      throw error;
    }
  }

  export function disconnect(): void {
    if (device) {
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
      console.log('Device disconnected manually');
    }
  }

  function onDisconnected(event: Event) {
    const device = event.target as BluetoothDevice;
    console.log(`Device ${device.name} is disconnected.`);
    // Optionally implement auto-reconnect logic here
  }

  /**
   * Parse Heart Rate Measurement Data
   * See: https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/
   */
  function handleHeartRateMeasurement(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    const data = parseHeartRate(value);

    if (onDataCallback) {
      onDataCallback(data);
    }
  }

  function parseHeartRate(value: DataView): BioData {
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
      rrIntervals: rrIntervals.length > 0 ? rrIntervals : undefined,
    };
  }
}
