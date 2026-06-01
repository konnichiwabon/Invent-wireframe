import { useState, useMemo, useCallback, useEffect } from "react";
import type { Employee } from "./types/inventory";
import { defaultEmployees } from "./data/employees";
import { filterEmployees, getDepartments } from "./utils/helpers";
import InventoryCard from "./components/InventoryCard";
import SpecsModal from "./components/SpecsModal";
import EmployeeForm from "./components/EmployeeForm";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import "./index.css";

const STORAGE_KEY = "hw-inventory-data";

const pageStyle = {
  minHeight: "100vh",
  paddingLeft: "clamp(86px, 6.25vw, 120px)",
};

const contentStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "0 clamp(20px, 2.1vw, 40px)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 315px))",
  gap: "1rem",
  justifyContent: "center",
  alignItems: "start",
  padding: "1rem 0 2rem",
};

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Employee[];
      // Validate that stored data uses the new array format
      if (parsed.length > 0 && Array.isArray(parsed[0].ram)) {
        const existingIds = new Set(parsed.map((employee) => employee.id));
        const missingDefaults = defaultEmployees.filter(
          (employee) => !existingIds.has(employee.id),
        );
        return [...parsed, ...missingDefaults];
      }
      // Old format detected — clear and use defaults
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  return defaultEmployees;
}

function saveEmployees(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

type FormMode = { type: "add" } | { type: "edit"; employee: Employee } | null;

function App() {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [formMode, setFormMode] = useState<FormMode>(null);

  // Persist to localStorage on change
  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  const departments = useMemo(() => getDepartments(employees), [employees]);

  const filteredEmployees = useMemo(
    () => filterEmployees(employees, searchTerm, activeDept),
    [employees, searchTerm, activeDept],
  );

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

  return (
    <div style={pageStyle}>
      <Sidebar />
      <main className="min-w-0">
        <div style={contentStyle}>
          {/* Top Bar */}
          <TopBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            departments={departments}
            activeDept={activeDept}
            onDepartmentChange={setActiveDept}
            onAddAsset={() => setFormMode({ type: "add" })}
          />

        {/* Card Grid */}
          <div style={gridStyle}>
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp, i) => (
            <InventoryCard
              key={emp.id}
              employee={emp}
              index={i}
              onViewSpecs={setSelectedEmployee}
              onEdit={(e) => setFormMode({ type: "edit", employee: e })}
            />
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">No matching devices found</div>
            <div className="no-results-sub">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

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
          employee={formMode.type === "edit" ? formMode.employee : null}
          onSave={handleSave}
          onClose={() => setFormMode(null)}
        />
      )}
    </div>
  );
}

export default App;
