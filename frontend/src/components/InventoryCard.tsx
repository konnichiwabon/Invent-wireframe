import type { Employee } from '../types/inventory';
import { getDeptStyle, getStorageClass } from '../utils/helpers';

interface InventoryCardProps {
  employee: Employee;
  index: number;
  onViewSpecs: (employee: Employee) => void;
  onViewProfilePicture: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export default function InventoryCard({
  employee,
  index,
  onViewSpecs,
  onViewProfilePicture,
  onEdit,
}: InventoryCardProps) {
  const deptStyle = getDeptStyle(employee.department);
  const profilePictureUrl = employee.profilePictureUrl?.trim();
  const idTag = employee.idTag?.trim();
  const classification = employee.classification ?? 'In Use';
  const classificationClass = classification === 'Resigned' ? 'resigned' : 'in-use';
  const totalRam = employee.ram.reduce((sum, r) => {
    const num = parseFloat(r.totalMemory) || 0;
    return sum + num;
  }, 0);
  const primaryGpu = employee.gpu[0];
  const primaryStorage = employee.storage[0];
  const extraStorageCount = Math.max(employee.storage.length - 1, 0);
  const extraStorageSummary = employee.storage
    .slice(1)
    .map((storage) => [storage.capacity, storage.type].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(', ');

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
        <button
          type="button"
          className="avatar-button"
          onClick={() => onViewProfilePicture(employee)}
          aria-label={`View ${employee.name} profile picture`}
        >
          <span className="avatar" style={{ background: employee.avatarColor }}>
            {profilePictureUrl ? (
              <img className="avatar-image" src={profilePictureUrl} alt={`${employee.name} profile`} />
            ) : (
              employee.initials
            )}
          </span>
        </button>
        <div className="card-info">
          <div className="card-title-row">
            <div className="card-name">{employee.name}</div>
            <span
              className={`classification-dot ${classificationClass}`}
              title={classification}
              aria-label={`Classification: ${classification}`}
            />
          </div>
          <div className="card-meta">
            <span
              className="dept-badge"
              style={{ background: deptStyle.bg, color: deptStyle.color }}
            >
              {employee.department}
            </span>
            <span className="id-tag">ID TAG {idTag || '-'}</span>
            <span className="pc-id">{employee.network.hostname}</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 20a8 8 0 0 0-16 0" />
            </svg>
          </span>
          <span>USER</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Email</span>
          <span className="spec-value spec-value-small">{employee.email || '-'}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Username</span>
          <span className="spec-value spec-value-small">{employee.username || '-'}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Omada</span>
          <span className="spec-value">{employee.omadaUsername || '-'}</span>
        </div>
      </div>

      {/* Hardware */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="6" height="6" rx="1" />
              <path d="M4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2" />
            </svg>
          </span>
          <span>HARDWARE</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Case</span>
          <span className="spec-value">{employee.system.chassisName || '-'}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">CPU Make</span>
          <span className="spec-value">{employee.cpu.manufacturer || '-'}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">CPU</span>
          <span className="spec-value">{employee.cpu.model.split(' ').slice(0, 3).join(' ')}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">RAM</span>
          <span className="spec-value">
            {totalRam} GB
            {employee.ram.length > 1 && (
              <span className="count-badge">{employee.ram.length} sticks</span>
            )}
          </span>
        </div>
        <div className="spec-row">
          <span className="spec-label">GPU</span>
          <span className="spec-value">{primaryGpu?.model || '—'}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">VRAM</span>
          <span className="spec-value">{primaryGpu?.ram || '—'}</span>
        </div>
      </div>

      {/* Storage */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
              <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
            </svg>
          </span>
          <span>STORAGE</span>
          {extraStorageCount > 0 && (
            <span
              className="storage-extra-badge"
              title={extraStorageSummary ? `Additional storage: ${extraStorageSummary}` : undefined}
            >
              +{extraStorageCount} drive{extraStorageCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {primaryStorage && (
          <>
            <div className="spec-row">
              <span className="spec-label">Main Storage Type</span>
              <span className={`storage-badge ${getStorageClass(primaryStorage.type)}`}>
                {primaryStorage.type}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Main Storage Capacity</span>
              <span className="storage-badge capacity">{primaryStorage.capacity}</span>
            </div>
          </>
        )}
      </div>

      {/* Network */}
      <div className="spec-section">
        <div className="spec-title">
          <span className="spec-title-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5a10 10 0 0 1 14 0" />
              <path d="M8.5 16a5 5 0 0 1 7 0" />
              <circle cx="12" cy="20" r="1" />
            </svg>
          </span>
          <span>NETWORK</span>
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
