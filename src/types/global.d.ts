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
  // We use ThreeElement from @react-three/fiber to provide actual type safety
  // instead of 'any', reducing technical debt in 3D components.
  namespace JSX {
    import { ThreeElement } from "@react-three/fiber";
    interface IntrinsicElements {
      meshStandardMaterial: ThreeElement<typeof import("three").MeshStandardMaterial>;
      group: ThreeElement<typeof import("three").Group>;
      mesh: ThreeElement<typeof import("three").Mesh>;
      boxGeometry: ThreeElement<typeof import("three").BoxGeometry>;
      sphereGeometry: ThreeElement<typeof import("three").SphereGeometry>;
      capsuleGeometry: ThreeElement<typeof import("three").CapsuleGeometry>;
      cylinderGeometry: ThreeElement<typeof import("three").CylinderGeometry>;
      ambientLight: ThreeElement<typeof import("three").AmbientLight>;
      spotLight: ThreeElement<typeof import("three").SpotLight>;
      pointLight: ThreeElement<typeof import("three").PointLight>;
      gridHelper: ThreeElement<typeof import("three").GridHelper>;
      circleGeometry: ThreeElement<typeof import("three").CircleGeometry>;
      primitive: ThreeElement<any>; // Primitives can be anything
    }
  }

  // React Three Fiber Intrinsic Elements (React.JSX for React 18+)
  namespace React {
    namespace JSX {
      import { ThreeElement } from "@react-three/fiber";
      interface IntrinsicElements {
        meshStandardMaterial: ThreeElement<typeof import("three").MeshStandardMaterial>;
        group: ThreeElement<typeof import("three").Group>;
        mesh: ThreeElement<typeof import("three").Mesh>;
        boxGeometry: ThreeElement<typeof import("three").BoxGeometry>;
        sphereGeometry: ThreeElement<typeof import("three").SphereGeometry>;
        capsuleGeometry: ThreeElement<typeof import("three").CapsuleGeometry>;
        cylinderGeometry: ThreeElement<typeof import("three").CylinderGeometry>;
        ambientLight: ThreeElement<typeof import("three").AmbientLight>;
        spotLight: ThreeElement<typeof import("three").SpotLight>;
        pointLight: ThreeElement<typeof import("three").PointLight>;
        gridHelper: ThreeElement<typeof import("three").GridHelper>;
        circleGeometry: ThreeElement<typeof import("three").CircleGeometry>;
        primitive: ThreeElement<any>;
      }
    }
  }
}
