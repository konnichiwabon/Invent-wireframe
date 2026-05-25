import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Employee } from './types/inventory';
import { defaultEmployees } from './data/employees';
import { filterEmployees, getDepartments } from './utils/helpers';
import InventoryCard from './components/InventoryCard';
import SpecsModal from './components/SpecsModal';
import EmployeeForm from './components/EmployeeForm';
import { exportInventoryToPDF } from './utils/pdfExport';
import './index.css';

const STORAGE_KEY = 'hw-inventory-data';

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Employee[];
      // Validate that stored data uses the new array format
      if (parsed.length > 0 && Array.isArray(parsed[0].ram)) {
        return parsed;
      }
      // Old format detected — clear and use defaults
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore */ }
  return defaultEmployees;
}

function saveEmployees(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

type FormMode = { type: 'add' } | { type: 'edit'; employee: Employee } | null;

function App() {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [isFixedSize, setIsFixedSize] = useState(false);

  // Persist to localStorage on change
  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  const departments = useMemo(() => getDepartments(employees), [employees]);

  const filteredEmployees = useMemo(
    () => filterEmployees(employees, searchTerm, activeDept),
    [employees, searchTerm, activeDept]
  );

  const totalDevices = employees.length;
  const deptCount = new Set(employees.map((e) => e.department)).size;

  const handleSave = useCallback((emp: Employee) => {
    setEmployees((prev) => {
      const exists = prev.find((e) => e.id === emp.id);
      if (exists) {
        return prev.map((e) => (e.id === emp.id ? emp : e));
      }
      return [...prev, emp];
    });
    setFormMode(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  }, []);

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">🖥️</div>
            <div>
              <h1 className="header-title">Hardware Inventory</h1>
              <p className="header-subtitle">Employee workstation management</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{totalDevices}</div>
              <div className="stat-label">Devices</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{deptCount}</div>
              <div className="stat-label">Departments</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {employees.filter((e) => e.network.dhcp).length}
              </div>
              <div className="stat-label">DHCP</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {employees.filter((e) => !e.network.dhcp).length}
              </div>
              <div className="stat-label">Static IP</div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-inventory"
            type="text"
            className="search-input"
            placeholder="Search name, hostname, IP, serial, GPU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-right">
          <div className="filter-group">
            {departments.map((dept) => (
              <button
                key={dept}
                id={`filter-${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className={`filter-btn ${activeDept === dept ? 'active' : ''}`}
                onClick={() => setActiveDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
          <button
            className="toggle-size-btn"
            onClick={() => setIsFixedSize(!isFixedSize)}
            title="Toggle between fluid and 350x425px sizes"
          >
            <span className="toggle-size-icon">📐</span>
            {isFixedSize ? 'Fluid Size' : 'Fixed 350x425'}
          </button>
          <button
            className="export-pdf-btn"
            onClick={() => exportInventoryToPDF(filteredEmployees)}
            title="Export filtered results to PDF"
          >
            <span className="export-pdf-icon">📄</span>
            Export PDF
          </button>
          <button
            id="add-device-btn"
            className="add-device-btn"
            onClick={() => setFormMode({ type: 'add' })}
          >
            <span className="add-device-icon">+</span>
            Add Device
          </button>
        </div>
      </div>

      {/* Card Grid */}
      <div className={`card-grid ${isFixedSize ? 'fixed-size-grid' : ''}`}>
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp, i) => (
            <InventoryCard
              key={emp.id}
              employee={emp}
              index={i}
              onViewSpecs={setSelectedEmployee}
              onEdit={(e) => setFormMode({ type: 'edit', employee: e })}
            />
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">No matching devices found</div>
            <div className="no-results-sub">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {/* View Specs Modal */}
      {selectedEmployee && (
        <SpecsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* Add / Edit Form */}
      {formMode && (
        <EmployeeForm
          employee={formMode.type === 'edit' ? formMode.employee : null}
          onSave={handleSave}
          onClose={() => setFormMode(null)}
        />
      )}
    </>
  );
}

export default App;
