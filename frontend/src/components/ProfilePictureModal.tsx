import { useCallback, useEffect } from 'react';
import type { Employee } from '../types/inventory';

interface ProfilePictureModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function ProfilePictureModal({ employee, onClose }: ProfilePictureModalProps) {
  const profilePictureUrl =
    employee.profilePictureOriginalUrl?.trim() || employee.profilePictureUrl?.trim();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
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
    <div className="photo-viewer-overlay" onClick={onClose}>
      <button className="photo-viewer-close" type="button" onClick={onClose} aria-label="Close picture">
        ✕
      </button>
      <div className="photo-viewer-stage" onClick={(e) => e.stopPropagation()}>
        {profilePictureUrl ? (
          <img className="photo-viewer-image" src={profilePictureUrl} alt={`${employee.name} profile`} />
        ) : (
          <div className="photo-viewer-empty" style={{ background: employee.avatarColor }}>
            {employee.initials || '?'}
          </div>
        )}
      </div>
    </div>
  );
}
