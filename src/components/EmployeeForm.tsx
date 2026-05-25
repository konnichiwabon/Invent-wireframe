import { useState, useEffect, useCallback } from 'react';
import type { Employee, RamSpec, GpuSpec, StorageSpec } from '../types/inventory';
import { getInitials, randomAvatarColor } from '../utils/helpers';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (employee: Employee) => void;
  onClose: () => void;
}

/* ── Blank templates ── */
const blankRam: RamSpec = { serialNumber: '', model: '', speed: '', totalMemory: '' };
const blankGpu: GpuSpec = { serial: '', manufacturer: '', model: '', ram: '' };
const blankStorage: StorageSpec = { serialNumber: '', type: '', capacity: '' };

function newEmployee(): Employee {
  return {
    id: crypto.randomUUID(),
    name: '',
    initials: '',
    department: '',
    username: '',
    omadaUsername: '',
    avatarColor: randomAvatarColor(),
    dateAsOf: new Date().toISOString().slice(0, 10),
    cpu: { model: '', cores: 0 },
    ram: [{ ...blankRam }],
    gpu: [{ ...blankGpu }],
    storage: [{ ...blankStorage }],
    network: { hostname: '', macAddress: '', dhcp: true, currentIp: '', portNumber: '' },
    peripherals: { keyboardBrand: '', mouseBrand: '', monitor: '' },
    system: { motherboardSn: '', biosSerialNumber: '', osVersion: '' },
  };
}

export default function EmployeeForm({ employee, onSave, onClose }: EmployeeFormProps) {
  const isEdit = !!employee;
  const [form, setForm] = useState<Employee>(() => (employee ? { ...employee, ram: employee.ram.map(r => ({ ...r })), gpu: employee.gpu.map(g => ({ ...g })), storage: employee.storage.map(s => ({ ...s })) } : newEmployee()));

  /* Close on Escape */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  /* ── Field updaters ── */
  function set<K extends keyof Employee>(key: K, value: Employee[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name') {
        next.initials = getInitials(value as string);
      }
      return next;
    });
  }

  function setCpu<K extends keyof Employee['cpu']>(key: K, value: Employee['cpu'][K]) {
    setForm((prev) => ({ ...prev, cpu: { ...prev.cpu, [key]: value } }));
  }

  function setNetwork<K extends keyof Employee['network']>(key: K, value: Employee['network'][K]) {
    setForm((prev) => ({ ...prev, network: { ...prev.network, [key]: value } }));
  }

  function setPeripherals<K extends keyof Employee['peripherals']>(key: K, value: Employee['peripherals'][K]) {
    setForm((prev) => ({ ...prev, peripherals: { ...prev.peripherals, [key]: value } }));
  }

  function setSystem<K extends keyof Employee['system']>(key: K, value: Employee['system'][K]) {
    setForm((prev) => ({ ...prev, system: { ...prev.system, [key]: value } }));
  }

  /* ── Array helpers ── */
  function updateRam(index: number, key: keyof RamSpec, value: string) {
    setForm((prev) => {
      const ram = prev.ram.map((r, i) => (i === index ? { ...r, [key]: value } : r));
      return { ...prev, ram };
    });
  }
  function addRam() { setForm((prev) => ({ ...prev, ram: [...prev.ram, { ...blankRam }] })); }
  function removeRam(index: number) { setForm((prev) => ({ ...prev, ram: prev.ram.filter((_, i) => i !== index) })); }

  function updateGpu(index: number, key: keyof GpuSpec, value: string) {
    setForm((prev) => {
      const gpu = prev.gpu.map((g, i) => (i === index ? { ...g, [key]: value } : g));
      return { ...prev, gpu };
    });
  }
  function addGpu() { setForm((prev) => ({ ...prev, gpu: [...prev.gpu, { ...blankGpu }] })); }
  function removeGpu(index: number) { setForm((prev) => ({ ...prev, gpu: prev.gpu.filter((_, i) => i !== index) })); }

  function updateStorage(index: number, key: keyof StorageSpec, value: string) {
    setForm((prev) => {
      const storage = prev.storage.map((s, i) => (i === index ? { ...s, [key]: value } : s));
      return { ...prev, storage };
    });
  }
  function addStorage() { setForm((prev) => ({ ...prev, storage: [...prev.storage, { ...blankStorage }] })); }
  function removeStorage(index: number) { setForm((prev) => ({ ...prev, storage: prev.storage.filter((_, i) => i !== index) })); }

  /* ── Submit ── */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-header">
          <div className="form-header-left">
            <div className="modal-avatar" style={{ background: form.avatarColor }}>
              {form.initials || '?'}
            </div>
            <div>
              <h2 className="form-title">{isEdit ? 'Edit Device' : 'Add New Device'}</h2>
              <p className="form-subtitle">{isEdit ? `Editing ${employee!.name}` : 'Fill in the workstation details'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close form">✕</button>
        </div>

        <form className="form-body" onSubmit={handleSubmit}>

          {/* ── User & Identity ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">👤 User & Identity</legend>
            <div className="form-grid">
              <FormField label="Full Name" value={form.name} onChange={(v) => set('name', v)} required />
              <FormField label="Department" value={form.department} onChange={(v) => set('department', v)} required />
              <FormField label="Username" value={form.username} onChange={(v) => set('username', v)} />
              <FormField label="Omada Username" value={form.omadaUsername} onChange={(v) => set('omadaUsername', v)} />
              <FormField label="Date (as of)" value={form.dateAsOf} onChange={(v) => set('dateAsOf', v)} type="date" />
            </div>
          </fieldset>

          {/* ── System ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">🔧 System</legend>
            <div className="form-grid">
              <FormField label="Motherboard SN" value={form.system.motherboardSn} onChange={(v) => setSystem('motherboardSn', v)} />
              <FormField label="BIOS Serial Number" value={form.system.biosSerialNumber} onChange={(v) => setSystem('biosSerialNumber', v)} />
              <FormField label="OS Version" value={form.system.osVersion} onChange={(v) => setSystem('osVersion', v)} />
            </div>
          </fieldset>

          {/* ── CPU ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">⚡ CPU</legend>
            <div className="form-grid">
              <FormField label="CPU Model" value={form.cpu.model} onChange={(v) => setCpu('model', v)} />
              <FormField label="CPU Cores" value={String(form.cpu.cores || '')} onChange={(v) => setCpu('cores', Number(v) || 0)} type="number" />
            </div>
          </fieldset>

          {/* ── RAM (array) ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">
              🧠 RAM
              <span className="array-count">{form.ram.length} stick{form.ram.length !== 1 ? 's' : ''}</span>
            </legend>
            {form.ram.map((r, i) => (
              <div key={i} className="array-group">
                <div className="array-group-header">
                  <span className="array-group-label">Stick {i + 1}</span>
                  {form.ram.length > 1 && (
                    <button type="button" className="array-remove-btn" onClick={() => removeRam(i)}>✕ Remove</button>
                  )}
                </div>
                <div className="form-grid">
                  <FormField label="Serial Number" value={r.serialNumber} onChange={(v) => updateRam(i, 'serialNumber', v)} />
                  <FormField label="Model" value={r.model} onChange={(v) => updateRam(i, 'model', v)} />
                  <FormField label="Speed" value={r.speed} onChange={(v) => updateRam(i, 'speed', v)} />
                  <FormField label="Capacity" value={r.totalMemory} onChange={(v) => updateRam(i, 'totalMemory', v)} />
                </div>
              </div>
            ))}
            <button type="button" className="array-add-btn" onClick={addRam}>+ Add RAM Stick</button>
          </fieldset>

          {/* ── GPU (array) ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">
              🎮 GPU
              <span className="array-count">{form.gpu.length} card{form.gpu.length !== 1 ? 's' : ''}</span>
            </legend>
            {form.gpu.map((g, i) => (
              <div key={i} className="array-group">
                <div className="array-group-header">
                  <span className="array-group-label">Card {i + 1}</span>
                  {form.gpu.length > 1 && (
                    <button type="button" className="array-remove-btn" onClick={() => removeGpu(i)}>✕ Remove</button>
                  )}
                </div>
                <div className="form-grid">
                  <FormField label="Serial" value={g.serial} onChange={(v) => updateGpu(i, 'serial', v)} />
                  <FormField label="Manufacturer" value={g.manufacturer} onChange={(v) => updateGpu(i, 'manufacturer', v)} />
                  <FormField label="Model" value={g.model} onChange={(v) => updateGpu(i, 'model', v)} />
                  <FormField label="VRAM" value={g.ram} onChange={(v) => updateGpu(i, 'ram', v)} />
                </div>
              </div>
            ))}
            <button type="button" className="array-add-btn" onClick={addGpu}>+ Add GPU Card</button>
          </fieldset>

          {/* ── Storage (array) ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">
              💾 Storage
              <span className="array-count">{form.storage.length} drive{form.storage.length !== 1 ? 's' : ''}</span>
            </legend>
            {form.storage.map((s, i) => (
              <div key={i} className="array-group">
                <div className="array-group-header">
                  <span className="array-group-label">Drive {i + 1}</span>
                  {form.storage.length > 1 && (
                    <button type="button" className="array-remove-btn" onClick={() => removeStorage(i)}>✕ Remove</button>
                  )}
                </div>
                <div className="form-grid">
                  <FormField label="Serial Number" value={s.serialNumber} onChange={(v) => updateStorage(i, 'serialNumber', v)} />
                  <FormField label="Type" value={s.type} onChange={(v) => updateStorage(i, 'type', v)} placeholder="e.g. NVMe SSD, SATA SSD, HDD" />
                  <FormField label="Capacity" value={s.capacity} onChange={(v) => updateStorage(i, 'capacity', v)} placeholder="e.g. 512 GB" />
                </div>
              </div>
            ))}
            <button type="button" className="array-add-btn" onClick={addStorage}>+ Add Storage Drive</button>
          </fieldset>

          {/* ── Network ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">🌐 Network</legend>
            <div className="form-grid">
              <FormField label="Hostname" value={form.network.hostname} onChange={(v) => setNetwork('hostname', v)} />
              <FormField label="MAC Address" value={form.network.macAddress} onChange={(v) => setNetwork('macAddress', v)} />
              <div className="form-field">
                <label className="form-label">DHCP</label>
                <select
                  className="form-input"
                  value={form.network.dhcp ? 'true' : 'false'}
                  onChange={(e) => setNetwork('dhcp', e.target.value === 'true')}
                >
                  <option value="true">Yes (DHCP)</option>
                  <option value="false">No (Static)</option>
                </select>
              </div>
              <FormField label="Current IP" value={form.network.currentIp} onChange={(v) => setNetwork('currentIp', v)} />
              <FormField label="Port Number" value={form.network.portNumber} onChange={(v) => setNetwork('portNumber', v)} />
            </div>
          </fieldset>

          {/* ── Peripherals ── */}
          <fieldset className="form-section">
            <legend className="form-section-title">🖱️ Peripherals</legend>
            <div className="form-grid">
              <FormField label="Keyboard Brand" value={form.peripherals.keyboardBrand} onChange={(v) => setPeripherals('keyboardBrand', v)} />
              <FormField label="Mouse Brand" value={form.peripherals.mouseBrand} onChange={(v) => setPeripherals('mouseBrand', v)} />
              <FormField label="Monitor" value={form.peripherals.monitor} onChange={(v) => setPeripherals('monitor', v)} />
            </div>
          </fieldset>

          {/* ── Actions ── */}
          <div className="form-actions">
            <button type="button" className="form-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="form-save-btn">
              {isEdit ? '💾 Save Changes' : '➕ Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Reusable input field ── */
function FormField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      <input
        className="form-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder || label}
      />
    </div>
  );
}
