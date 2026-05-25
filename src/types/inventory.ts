// ===== Hardware Inventory Types =====

export interface CpuSpec {
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

export interface NetworkSpec {
  hostname: string;
  macAddress: string;
  dhcp: boolean;
  currentIp: string;
  portNumber: string;
}

export interface PeripheralSpec {
  keyboardBrand: string;
  mouseBrand: string;
  monitor: string;
}

export interface SystemSpec {
  motherboardSn: string;
  biosSerialNumber: string;
  osVersion: string;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  department: string;
  username: string;
  omadaUsername: string;
  avatarColor: string;
  dateAsOf: string;
  cpu: CpuSpec;
  ram: RamSpec[];
  gpu: GpuSpec[];
  storage: StorageSpec[];
  network: NetworkSpec;
  peripherals: PeripheralSpec;
  system: SystemSpec;
}

export type DepartmentFilter = 'All' | string;
