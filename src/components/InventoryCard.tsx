import type { Employee } from '../types/inventory';
import { getDeptStyle, getStorageClass } from '../utils/helpers';

interface InventoryCardProps {
  employee: Employee;
  index: number;
  onViewSpecs: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export default function InventoryCard({ employee, index, onViewSpecs, onEdit }: InventoryCardProps) {
  const deptStyle = getDeptStyle(employee.department);
  const totalRam = employee.ram.reduce((sum, r) => {
    const num = parseFloat(r.totalMemory) || 0;
    return sum + num;
  }, 0);
  const primaryGpu = employee.gpu[0];
  const primaryStorage = employee.storage[0];

  return (
    <div
      className="inventory-card card-animate"
      style={
        {
          '--card-accent': deptStyle.color,
          animationDelay: `${index * 0.06}s`,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="card-header">
        <div className="avatar" style={{ background: employee.avatarColor }}>
          {employee.initials}
        </div>
        <div className="card-info">
          <div className="card-name">{employee.name}</div>
          <span
            className="dept-badge"
            style={{ background: deptStyle.bg, color: deptStyle.color }}
          >
            {employee.department}
          </span>
          <span className="pc-id">{employee.network.hostname}</span>
        </div>
      </div>

      {/* User Info */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon">👤</span> User
        </div>
        <div className="spec-row">
          <span className="spec-label">Username</span>
          <span className="spec-value">{employee.username}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Omada</span>
          <span className="spec-value spec-value-small">{employee.omadaUsername}</span>
        </div>
      </div>

      {/* Hardware */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon">🖥️</span> Hardware
        </div>
        <div className="spec-row">
          <span className="spec-label">CPU</span>
          <span className="spec-value">{employee.cpu.model.split(' ').slice(0, 3).join(' ')}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Cores</span>
          <span className="spec-value">{employee.cpu.cores}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">RAM</span>
          <span className="spec-value">
            {totalRam} GB
            {employee.ram.length > 1 && <span className="count-badge">{employee.ram.length} sticks</span>}
          </span>
        </div>
        <div className="spec-row">
          <span className="spec-label">GPU</span>
          <span className="spec-value">
            {primaryGpu?.model || '—'}
            {employee.gpu.length > 1 && <span className="count-badge">{employee.gpu.length} cards</span>}
          </span>
        </div>
      </div>

      {/* Storage */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon">💾</span> Storage
          {employee.storage.length > 1 && <span className="count-badge">{employee.storage.length} drives</span>}
        </div>
        {primaryStorage && (
          <>
            <div className="spec-row">
              <span className="spec-label">Type</span>
              <span className={`storage-badge ${getStorageClass(primaryStorage.type)}`}>
                {primaryStorage.type}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Capacity</span>
              <span className="spec-value">{primaryStorage.capacity}</span>
            </div>
          </>
        )}
      </div>

      {/* Network */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon">🌐</span> Network
        </div>
        <div className="spec-row">
          <span className="spec-label">IP</span>
          <span className="spec-value spec-value-mono">{employee.network.currentIp}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">DHCP</span>
          <span className={`dhcp-badge ${employee.network.dhcp ? 'yes' : 'no'}`}>
            {employee.network.dhcp ? 'Yes' : 'Static'}
          </span>
        </div>
      </div>

      <div className="card-divider" />

      {/* Action Buttons */}
      <div className="card-actions">
        <button className="view-specs-btn" onClick={() => onViewSpecs(employee)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          View Full Specs
        </button>
        <button className="edit-btn" onClick={() => onEdit(employee)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
}
