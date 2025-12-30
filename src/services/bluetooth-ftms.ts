/**
 * Bluetooth Fitness Machine Service (FTMS) Integration
 * Controls Smart Trainers (Wahoo, Tacx) via ERG Mode and Sim Mode.
 */

const FTMS_SERVICE_UUID = "00001826-0000-1000-8000-00805f9b34fb";
const FTMS_CONTROL_POINT_UUID = "00002ad9-0000-1000-8000-00805f9b34fb";
// const FTMS_INDOOR_BIKE_DATA_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';

export const FTMSService = {
  device: null as BluetoothDevice | null,
  server: null as BluetoothRemoteGATTServer | null,
  controlPoint: null as BluetoothRemoteGATTCharacteristic | null,

  async connect(): Promise<boolean> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [FTMS_SERVICE_UUID] }],
      });

      this.server = (await this.device.gatt?.connect()) || null;
      if (!this.server) return false;

      const service = await this.server.getPrimaryService(FTMS_SERVICE_UUID);
      this.controlPoint = await service.getCharacteristic(
        FTMS_CONTROL_POINT_UUID,
      );

      // Request Control (Op Code 0x00)
      await this.writeControlPoint([0x00]);

      return true;
    } catch (e) {
      console.error("FTMS Connection Failed", e);
      return false;
    }
  },

  /**
   * Sets target watts (ERG Mode)
   */
  async setTargetPower(watts: number) {
    if (!this.controlPoint) return;

    // OpCode 0x05: Set Target Power
    // Parameter: Sint16 (Little Endian)
    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, 0x05); // OpCode
    view.setInt16(1, watts, true); // Watts

    await this.controlPoint.writeValue(buffer);
    console.log(`FTMS: Target Power set to ${watts}W`);
  },

  /**
   * Sets Simulation Grade (Sim Mode)
   * @param grade Percentage slope (e.g. 5.5 for 5.5%)
   */
  async setSimGrade(grade: number) {
    if (!this.controlPoint) return;

    // OpCode 0x11: Set Simulation Parameters
    // Struct: Wind Speed (Sint16), Grade (Sint16), Crr (Uint8), Wind Coeff (Uint8)
    // We only care about grade here.
    // Note: Grade is typically scale 0.01%, so 500 = 5%

    const scaledGrade = Math.round(grade * 100);

    const buffer = new ArrayBuffer(7);
    const view = new DataView(buffer);

    view.setUint8(0, 0x11); // OpCode
    view.setInt16(1, 0, true); // Wind Speed (0)
    view.setInt16(3, scaledGrade, true); // Grade
    view.setUint8(5, 0); // CRR
    view.setUint8(6, 0); // Wind Coeff

    await this.controlPoint.writeValue(buffer);
    console.log(`FTMS: Grade set to ${grade}%`);
  },

  async resetControl() {
    if (this.controlPoint) {
      // OpCode 0x01: Reset
      await this.writeControlPoint([0x01]);
    }
  },

  async writeControlPoint(bytes: number[]) {
    if (!this.controlPoint) return;
    const buffer = new Uint8Array(bytes);
    await this.controlPoint.writeValue(buffer);
  },
};
