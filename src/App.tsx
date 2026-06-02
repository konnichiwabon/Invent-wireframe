import { useState, useMemo, useCallback, useEffect } from "react";
import type { Employee } from "./types/inventory";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  inventoryApiEnabled,
  updateEmployee,
} from "./api/inventoryApi";
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

function loadLocalEmployees(): Employee[] {
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

function saveLocalEmployees(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

type FormMode = { type: "add" } | { type: "edit"; employee: Employee } | null;

function App() {
  const [employees, setEmployees] = useState<Employee[]>(loadLocalEmployees);
  const [isLoading, setIsLoading] = useState(inventoryApiEnabled);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [formMode, setFormMode] = useState<FormMode>(null);

useEffect(() => {
    if (!inventoryApiEnabled) return;

    let cancelled = false;

    async function loadEmployeesFromApi() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const apiEmployees = await fetchEmployees();
        if (!cancelled) {
          setEmployees(apiEmployees);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? `Using local cache because the backend is unavailable: ${error.message}`
              : "Using local cache because the backend is unavailable",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadEmployeesFromApi();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveLocalEmployees(employees);
  }, [employees]);

  const departments = useMemo(() => getDepartments(employees), [employees]);

  const filteredEmployees = useMemo(
    () => filterEmployees(employees, searchTerm, activeDept),
    [employees, searchTerm, activeDept],
  );

  const handleSave = useCallback(async (emp: Employee) => {
    try {
      const exists = employees.some((employee) => employee.id === emp.id);
      let savedEmployee = emp;

      if (inventoryApiEnabled) {
        savedEmployee = exists ? await updateEmployee(emp) : await createEmployee(emp);
      }

      setEmployees((prev) => {
        if (exists) {
          return prev.map((employee) =>
            employee.id === savedEmployee.id ? savedEmployee : employee,
          );
        }
        return [...prev, savedEmployee];
      });
      setLoadError(null);
      setFormMode(null);
    } catch (error) {
      const exists = employees.some((employee) => employee.id === emp.id);
      setEmployees((prev) => {
        if (exists) {
          return prev.map((employee) =>
            employee.id === emp.id ? emp : employee,
          );
        }
        return [...prev, emp];
      });
      setFormMode(null);
      setLoadError(
        error instanceof Error
          ? `Saved locally only. Backend sync failed: ${error.message}`
          : "Saved locally only. Backend sync failed.",
      );
    }
  }, [employees]);

  const handleDelete = useCallback(async (emp: Employee) => {
    const confirmed = window.confirm(`Delete ${emp.name}'s asset record?`);
    if (!confirmed) return;

    try {
      if (inventoryApiEnabled) {
        await deleteEmployee(emp.id);
      }

      setEmployees((prev) => prev.filter((employee) => employee.id !== emp.id));
      setSelectedEmployee((selected) => selected?.id === emp.id ? null : selected);
      setLoadError(null);
    } catch (error) {
      setEmployees((prev) => prev.filter((employee) => employee.id !== emp.id));
      setSelectedEmployee((selected) => selected?.id === emp.id ? null : selected);
      setLoadError(
        error instanceof Error
          ? `Deleted locally only. Backend sync failed: ${error.message}`
          : "Deleted locally only. Backend sync failed.",
      );
    }
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
          {loadError && (
            <div className="no-results">
              <div className="no-results-text">Local cache fallback active</div>
              <div className="no-results-sub">{loadError}</div>
            </div>
          )}
          <div style={gridStyle}>
        {isLoading ? (
          <div className="no-results">
            <div className="no-results-text">Loading assets...</div>
          </div>
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp, i) => (
            <InventoryCard
              key={emp.id}
              employee={emp}
              index={i}
              onViewSpecs={setSelectedEmployee}
              onEdit={(e) => setFormMode({ type: "edit", employee: e })}
              onDelete={handleDelete}
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
