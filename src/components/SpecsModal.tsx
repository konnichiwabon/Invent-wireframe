import { useEffect, useCallback } from 'react';
import type { Employee } from '../types/inventory';
import { getDeptStyle, formatDate } from '../utils/helpers';

interface SpecsModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function SpecsModal({ employee, onClose }: SpecsModalProps) {
  const deptStyle = getDeptStyle(employee.department);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-avatar" style={{ background: employee.avatarColor }}>
            {employee.initials}
          </div>
          <div>
            <div className="modal-name">{employee.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span
                className="dept-badge"
                style={{ background: deptStyle.bg, color: deptStyle.color }}
              >
                {employee.department}
              </span>
              <span className="modal-pcid">{employee.network.hostname}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* ── User & Identity ── */}
          <div className="modal-section">
            <div className="modal-section-title">👤 User & Identity</div>
            <div className="modal-spec-grid">
              <SpecItem label="Username" value={employee.username} />
              <SpecItem label="Omada Username" value={employee.omadaUsername} />
              <SpecItem label="Department" value={employee.department} />
              <SpecItem label="Date (as of)" value={formatDate(employee.dateAsOf)} />
            </div>
          </div>

          {/* ── System ── */}
          <div className="modal-section">
            <div className="modal-section-title">🔧 System</div>
            <div className="modal-spec-grid">
              <SpecItem label="Motherboard SN" value={employee.system.motherboardSn} mono />
              <SpecItem label="BIOS Serial Number" value={employee.system.biosSerialNumber} mono />
              <SpecItem label="OS Version" value={employee.system.osVersion} wide />
            </div>
          </div>

          {/* ── CPU ── */}
          <div className="modal-section">
            <div className="modal-section-title">⚡ CPU</div>
            <div className="modal-spec-grid">
              <SpecItem label="CPU Model" value={employee.cpu.model} />
              <SpecItem label="CPU Cores" value={String(employee.cpu.cores)} />
            </div>
          </div>

          {/* ── RAM (loop) ── */}
          <div className="modal-section">
            <div className="modal-section-title">🧠 RAM ({employee.ram.length} stick{employee.ram.length !== 1 ? 's' : ''})</div>
            {employee.ram.map((r, i) => (
              <div key={i} className="modal-array-block">
                {employee.ram.length > 1 && <div className="modal-array-label">Stick {i + 1}</div>}
                <div className="modal-spec-grid">
                  <SpecItem label="Serial Number" value={r.serialNumber} mono />
                  <SpecItem label="Model" value={r.model} />
                  <SpecItem label="Speed" value={r.speed} />
                  <SpecItem label="Capacity" value={r.totalMemory} />
                </div>
              </div>
            ))}
          </div>

          {/* ── GPU (loop) ── */}
          <div className="modal-section">
            <div className="modal-section-title">🎮 GPU ({employee.gpu.length} card{employee.gpu.length !== 1 ? 's' : ''})</div>
            {employee.gpu.map((g, i) => (
              <div key={i} className="modal-array-block">
                {employee.gpu.length > 1 && <div className="modal-array-label">Card {i + 1}</div>}
                <div className="modal-spec-grid">
                  <SpecItem label="Serial" value={g.serial} mono />
                  <SpecItem label="Manufacturer" value={g.manufacturer} />
                  <SpecItem label="Model" value={g.model} />
                  <SpecItem label="VRAM" value={g.ram} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Storage (loop) ── */}
          <div className="modal-section">
            <div className="modal-section-title">💾 Storage ({employee.storage.length} drive{employee.storage.length !== 1 ? 's' : ''})</div>
            {employee.storage.map((s, i) => (
              <div key={i} className="modal-array-block">
                {employee.storage.length > 1 && <div className="modal-array-label">Drive {i + 1}</div>}
                <div className="modal-spec-grid">
                  <SpecItem label="Serial Number" value={s.serialNumber} mono />
                  <SpecItem label="Type" value={s.type} />
                  <SpecItem label="Capacity" value={s.capacity} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Network ── */}
          <div className="modal-section">
            <div className="modal-section-title">🌐 Network</div>
            <div className="modal-spec-grid">
              <SpecItem label="Hostname" value={employee.network.hostname} mono />
              <SpecItem label="MAC Address" value={employee.network.macAddress} mono />
              <SpecItem label="DHCP" value={employee.network.dhcp ? 'Yes (DHCP)' : 'No (Static)'} />
              <SpecItem label="Current IP" value={employee.network.currentIp} mono />
              <SpecItem label="Port Number" value={employee.network.portNumber} mono />
            </div>
          </div>

          {/* ── Peripherals ── */}
          <div className="modal-section">
            <div className="modal-section-title">🖱️ Peripherals</div>
            <div className="modal-spec-grid">
              <SpecItem label="Keyboard Brand" value={employee.peripherals.keyboardBrand} />
              <SpecItem label="Mouse Brand" value={employee.peripherals.mouseBrand} />
              <SpecItem label="Monitor" value={employee.peripherals.monitor} wide />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Reusable spec item ── */
function SpecItem({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <div className="modal-spec-item" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <span className="modal-spec-label">{label}</span>
      <span
        className="modal-spec-value"
        style={mono ? { fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace", fontSize: '0.8rem' } : undefined}
      >
        {value || '—'}
      </span>
    </div>
  );
}
