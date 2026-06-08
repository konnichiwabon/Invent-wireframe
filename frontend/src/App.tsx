import { useState, useMemo, useCallback, useEffect } from "react";
import type { Employee } from "./types/inventory";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployee,
  fetchEmployees,
  inventoryApiEnabled,
  updateEmployee,
} from "./api/inventoryApi";
import { defaultEmployees } from "./data/employees";
import { filterEmployees, getDepartments } from "./utils/helpers";
import InventoryCard from "./components/InventoryCard";
import SpecsModal from "./components/SpecsModal";
import ProfilePictureModal from "./components/ProfilePictureModal";
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
  justifyContent: "start",
  alignItems: "start",
  padding: "1rem 0 2rem",
};

function normalizeEmployee(employee: Employee): Employee {
  const legacyEmployee = employee as Employee & { availabilityStatus?: string };

  return {
    ...employee,
    classification:
      employee.classification ?? (legacyEmployee.availabilityStatus === "Resigned" ? "Resigned" : "In Use"),
    email: employee.email ?? "",
    devicePhotos: employee.devicePhotos ?? [],
    cpu: {
      ...employee.cpu,
      manufacturer: employee.cpu.manufacturer ?? "",
    },
    peripherals: {
      ...employee.peripherals,
      keyboardSerialNumber: employee.peripherals.keyboardSerialNumber ?? "",
      mouseSerialNumber: employee.peripherals.mouseSerialNumber ?? "",
      monitorSerialNumber: employee.peripherals.monitorSerialNumber ?? "",
    },
    system: {
      ...employee.system,
      chassisName: employee.system.chassisName ?? "",
    },
  };
}

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
        return [...parsed.map(normalizeEmployee), ...missingDefaults.map(normalizeEmployee)];
      }
      // Old format detected — clear and use defaults
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  return defaultEmployees.map(normalizeEmployee);
}

function saveLocalEmployees(employees: Employee[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(employees.map(stripTransientEmployeeFields)),
  );
}

function stripTransientEmployeeFields(employee: Employee): Employee {
  const persistedEmployee = { ...employee };
  delete persistedEmployee.profilePictureUploadData;
  persistedEmployee.devicePhotos = (employee.devicePhotos ?? []).map((photo) => {
    const persistedPhoto = { ...photo };
    delete persistedPhoto.uploadData;
    return persistedPhoto;
  });
  return persistedEmployee;
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
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<Employee | null>(null);
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
          setEmployees(apiEmployees.map(normalizeEmployee));
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

  const handleSave = useCallback(
    async (emp: Employee) => {
      const existsAtSubmit = employees.some(
        (employee) => employee.id === emp.id,
      );

      try {
        let savedEmployee = emp;

        if (inventoryApiEnabled) {
          savedEmployee = existsAtSubmit
            ? await updateEmployee(emp)
            : await createEmployee(emp);
        } else {
          savedEmployee = stripTransientEmployeeFields(emp);
        }
        savedEmployee = normalizeEmployee(savedEmployee);

        setEmployees((prev) => {
          const existsInLatestState = prev.some(
            (employee) => employee.id === savedEmployee.id,
          );

          if (existsInLatestState) {
            return prev.map((employee) =>
              employee.id === savedEmployee.id ? savedEmployee : employee,
            );
          }

          return [...prev, savedEmployee];
        });
        setLoadError(null);
        setFormMode(null);
      } catch (error) {
        setEmployees((prev) => {
          const existsInLatestState = prev.some(
            (employee) => employee.id === emp.id,
          );

          if (existsInLatestState) {
            return prev.map((employee) =>
              employee.id === emp.id ? stripTransientEmployeeFields(emp) : employee,
            );
          }

          return [...prev, stripTransientEmployeeFields(emp)];
        });
        setFormMode(null);
        setLoadError(
          error instanceof Error
            ? `Saved locally only. Backend sync failed: ${error.message}`
            : "Saved locally only. Backend sync failed.",
        );
      }
    },
    [employees],
  );

  const handleDelete = useCallback(async (emp: Employee) => {
    const confirmed = window.confirm(`Delete ${emp.name}'s asset record?`);
    if (!confirmed) return false;

    try {
      if (inventoryApiEnabled) {
        await deleteEmployee(emp.id);
      }

      setEmployees((prev) => prev.filter((employee) => employee.id !== emp.id));
      setSelectedEmployee((selected) =>
        selected?.id === emp.id ? null : selected,
      );
      setSelectedProfilePicture((selected) =>
        selected?.id === emp.id ? null : selected,
      );
      setLoadError(null);
      return true;
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? `Delete failed. Backend sync failed: ${error.message}`
          : "Delete failed. Backend sync failed.",
      );
      return false;
    }
  }, []);

  const handleViewSpecs = useCallback(async (emp: Employee) => {
    setSelectedEmployee(emp);

    if (!inventoryApiEnabled) return;

    try {
      const freshEmployee = await fetchEmployee(emp.id);
      const normalizedEmployee = normalizeEmployee(freshEmployee);
      setSelectedEmployee((selected) =>
        selected?.id === emp.id ? normalizedEmployee : selected,
      );
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === normalizedEmployee.id ? normalizedEmployee : employee,
        ),
      );
    } catch {
      // Keep showing the card data if the detail refresh fails.
    }
  }, []);

  const handleViewProfilePicture = useCallback(async (emp: Employee) => {
    setSelectedProfilePicture(emp);

    if (!inventoryApiEnabled) return;

    try {
      const freshEmployee = await fetchEmployee(emp.id);
      const normalizedEmployee = normalizeEmployee(freshEmployee);
      setSelectedProfilePicture((selected) =>
        selected?.id === emp.id ? normalizedEmployee : selected,
      );
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === normalizedEmployee.id ? normalizedEmployee : employee,
        ),
      );
    } catch {
      // Keep showing the card image if the full-size refresh fails.
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
                  onViewSpecs={handleViewSpecs}
                  onViewProfilePicture={handleViewProfilePicture}
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

      {selectedProfilePicture && (
        <ProfilePictureModal
          employee={selectedProfilePicture}
          onClose={() => setSelectedProfilePicture(null)}
        />
      )}

      {/* Add / Edit Form */}
      {formMode && (
        <EmployeeForm
          employee={formMode.type === "edit" ? formMode.employee : null}
          onSave={handleSave}
          onDelete={async (employee) => {
            const deleted = await handleDelete(employee);
            if (deleted) {
              setFormMode(null);
            }
            return deleted;
          }}
          onClose={() => setFormMode(null)}
        />
      )}
    </div>
  );
}

export default App;
