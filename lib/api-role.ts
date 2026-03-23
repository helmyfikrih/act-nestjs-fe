import { apiFetch } from "./api";

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

export async function getRoles(): Promise<Role[]> {
  return apiFetch<Role[]>("/roles");
}

export async function createRole(data: CreateRoleDto): Promise<Role> {
  return apiFetch<Role>("/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
  return apiFetch<Role>(`/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRole(id: string): Promise<void> {
  return apiFetch<void>(`/roles/${id}`, {
    method: "DELETE",
  });
}
