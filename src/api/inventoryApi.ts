import type { Employee } from "../types/inventory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const inventoryApiEnabled = API_BASE_URL.length > 0;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function fetchEmployees(): Promise<Employee[]> {
  return request<Employee[]>("/assets");
}

export function createEmployee(employee: Employee): Promise<Employee> {
  return request<Employee>("/assets", {
    method: "POST",
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(employee: Employee): Promise<Employee> {
  return request<Employee>(`/assets/${employee.id}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

export function deleteEmployee(id: string): Promise<void> {
  return request<void>(`/assets/${id}`, {
    method: "DELETE",
  });
}
