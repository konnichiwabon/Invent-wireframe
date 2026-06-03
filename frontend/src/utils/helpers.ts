import type { Employee } from '../types/inventory';

interface DeptStyle {
  color: string;
  bg: string;
}

const deptStyles: Record<string, DeptStyle> = {
  'IT Dept.': { color: 'var(--dept-it)', bg: 'var(--dept-it-bg)' },
  Marketing: { color: 'var(--dept-marketing)', bg: 'var(--dept-marketing-bg)' },
  HR: { color: 'var(--dept-hr)', bg: 'var(--dept-hr-bg)' },
  Finance: { color: 'var(--dept-finance)', bg: 'var(--dept-finance-bg)' },
  Operations: { color: 'var(--dept-operations)', bg: 'var(--dept-operations-bg)' },
  Design: { color: 'var(--dept-design)', bg: 'var(--dept-design-bg)' },
  Security: { color: 'var(--dept-security)', bg: 'var(--dept-security-bg)' },
  Engineering: { color: 'var(--dept-engineering)', bg: 'var(--dept-engineering-bg)' },
  Support: { color: 'var(--dept-support)', bg: 'var(--dept-support-bg)' },
};

export function getDeptStyle(department: string): DeptStyle {
  return deptStyles[department] || { color: '#64748b', bg: '#f1f5f9' };
}

export function getStorageClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('nvme')) return 'nvme';
  if (t.includes('ssd')) return 'ssd';
  if (t.includes('hdd')) return 'hdd';
  return 'ssd';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  '#4CAF50', '#9C27B0', '#FF9800', '#F44336', '#2196F3',
  '#607D8B', '#009688', '#673AB7', '#E91E63', '#00BCD4',
  '#795548', '#3F51B5', '#FF5722', '#8BC34A', '#CDDC39',
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function filterEmployees(
  employees: Employee[],
  searchTerm: string,
  department: string
): Employee[] {
  return employees.filter((emp) => {
    const matchesDept = department === 'All' || emp.department === department;
    if (!matchesDept) return false;
    if (searchTerm === '') return true;

    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.username.toLowerCase().includes(term) ||
      emp.omadaUsername.toLowerCase().includes(term) ||
      emp.network.hostname.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.cpu.model.toLowerCase().includes(term) ||
      emp.network.currentIp.includes(term) ||
      emp.network.macAddress.toLowerCase().includes(term) ||
      emp.system.biosSerialNumber.toLowerCase().includes(term) ||
      emp.system.motherboardSn.toLowerCase().includes(term) ||
      emp.gpu.some((g) => g.model.toLowerCase().includes(term) || g.manufacturer.toLowerCase().includes(term)) ||
      emp.ram.some((r) => r.model.toLowerCase().includes(term) || r.serialNumber.toLowerCase().includes(term)) ||
      emp.storage.some((s) => s.serialNumber.toLowerCase().includes(term) || s.type.toLowerCase().includes(term))
    );
  });
}

export function getDepartments(employees: Employee[]): string[] {
  return ['All', ...new Set(employees.map((e) => e.department))];
}
