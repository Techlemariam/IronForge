export { };

declare global {
  interface Window {
    // Safari/Old Chrome support
    webkitAudioContext: typeof AudioContext;
  }

  // Fallback if @types/web-bluetooth is not installed in the environment
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
    getAvailability(): Promise<boolean>;
  }

  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
    acceptAllDevices?: boolean;
  }

  interface BluetoothLEScanFilter {
    name?: string;
    namePrefix?: string;
    services?: BluetoothServiceUUID[];
  }

  type BluetoothServiceUUID = number | string;

  interface BluetoothDevice extends EventTarget {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    watchAdvertisements(): Promise<void>;
    unwatchAdvertisements(): void;
    readonly watchingAdvertisements: boolean;
    addEventListener(type: string, listener: EventListener): void;
  }

  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice;
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(
      service: BluetoothServiceUUID,
    ): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    uuid: string;
    isPrimary: boolean;
    device: BluetoothDevice;
    getCharacteristic(
      characteristic: BluetoothCharacteristicUUID,
    ): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  type BluetoothCharacteristicUUID = number | string;

  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    uuid: string;
    service: BluetoothRemoteGATTService;
    value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: string, listener: EventListener): void;
  }

  // React Three Fiber Intrinsic Elements (Global JSX)
  // R3F provides its own types via @react-three/fiber - these are fallback declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  namespace JSX {
    interface IntrinsicElements {
      meshStandardMaterial: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      sphereGeometry: any;
      capsuleGeometry: any;
      cylinderGeometry: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      gridHelper: any;
      circleGeometry: any;
      primitive: any;
    }
  }

  // React Three Fiber Intrinsic Elements (React.JSX for React 18+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        meshStandardMaterial: any;
        group: any;
        mesh: any;
        boxGeometry: any;
        sphereGeometry: any;
        capsuleGeometry: any;
        cylinderGeometry: any;
        ambientLight: any;
        spotLight: any;
        pointLight: any;
        gridHelper: any;
        circleGeometry: any;
        primitive: any;
      }
    }
  }
}
