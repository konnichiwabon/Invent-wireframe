from pydantic import BaseModel, ConfigDict, Field


class CpuSpec(BaseModel):
    model: str = ""
    cores: int = 0


class RamSpec(BaseModel):
    serialNumber: str = ""
    model: str = ""
    speed: str = ""
    totalMemory: str = ""


class GpuSpec(BaseModel):
    serial: str = ""
    manufacturer: str = ""
    model: str = ""
    ram: str = ""


class StorageSpec(BaseModel):
    serialNumber: str = ""
    type: str = ""
    capacity: str = ""


class NetworkSpec(BaseModel):
    hostname: str = ""
    macAddress: str = ""
    dhcp: bool = True
    currentIp: str = ""
    portNumber: str = ""


class PeripheralSpec(BaseModel):
    keyboardBrand: str = ""
    mouseBrand: str = ""
    monitor: str = ""


class SystemSpec(BaseModel):
    motherboardSn: str = ""
    biosSerialNumber: str = ""
    osVersion: str = ""


class AssetBase(BaseModel):
    name: str = Field(min_length=1)
    initials: str = ""
    department: str = Field(min_length=1)
    username: str = ""
    omadaUsername: str = ""
    avatarColor: str = "#64748b"
    dateAsOf: str = ""
    cpu: CpuSpec = Field(default_factory=CpuSpec)
    ram: list[RamSpec] = Field(default_factory=list)
    gpu: list[GpuSpec] = Field(default_factory=list)
    storage: list[StorageSpec] = Field(default_factory=list)
    network: NetworkSpec = Field(default_factory=NetworkSpec)
    peripherals: PeripheralSpec = Field(default_factory=PeripheralSpec)
    system: SystemSpec = Field(default_factory=SystemSpec)


class AssetCreate(AssetBase):
    id: str


class AssetUpdate(AssetBase):
    id: str


class AssetRead(AssetBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
