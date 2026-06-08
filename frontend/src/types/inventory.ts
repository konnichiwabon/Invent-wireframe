// ===== Hardware Inventory Types =====

export interface CpuSpec {
  manufacturer: string;
  model: string;
  cores: number;
}

export interface RamSpec {
  serialNumber: string;
  model: string;
  speed: string;
  totalMemory: string;
}

export interface GpuSpec {
  serial: string;
  manufacturer: string;
  model: string;
  ram: string;
}

export interface StorageSpec {
  serialNumber: string;
  type: string;       // e.g. "SSD", "HDD", "NVMe"
  capacity: string;
}

export interface DevicePhoto {
  objectKey?: string;
  url: string;
  uploadData?: string;
}

export interface NetworkSpec {
  hostname: string;
  macAddress: string;
  dhcp: boolean;
  currentIp: string;
  portNumber: string;
}

export interface PeripheralSpec {
  keyboardBrand: string;
  keyboardSerialNumber: string;
  mouseBrand: string;
  mouseSerialNumber: string;
  monitor: string;
  monitorSerialNumber: string;
}

export interface SystemSpec {
  chassisName: string;
  motherboardSn: string;
  biosSerialNumber: string;
  osVersion: string;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  department: string;
  email: string;
  username: string;
  omadaUsername: string;
  idTag?: string;
  profilePictureKey?: string;
  profilePictureUrl?: string;
  profilePictureOriginalUrl?: string;
  profilePictureUploadData?: string;
  avatarColor: string;
  dateAsOf: string;
  cpu: CpuSpec;
  ram: RamSpec[];
  gpu: GpuSpec[];
  storage: StorageSpec[];
  devicePhotos?: DevicePhoto[];
  network: NetworkSpec;
  peripherals: PeripheralSpec;
  system: SystemSpec;
}

export type DepartmentFilter = 'All' | string;
