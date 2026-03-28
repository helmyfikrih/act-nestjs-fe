import { apiFetch } from "./api";

export type RoleGroup = "INTERNAL" | "CUSTOMER" | "EXTERNAL";

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  roleGroup: RoleGroup;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
  roleGroup: RoleGroup;
  isSystemRole?: boolean;
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
