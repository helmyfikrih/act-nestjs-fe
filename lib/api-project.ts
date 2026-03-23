import { apiFetch } from "./api";

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export async function getMyProjects(): Promise<any[]> {
  return apiFetch<any[]>("/projects/my-projects");
}

export async function getProject(id: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`);
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, {
    method: "DELETE",
  });
}

export async function assignProjectMenus(projectId: string, menuIds: string[]): Promise<void> {
  const menus = menuIds.map(id => ({ menuId: id, isActive: true }))
  return apiFetch<void>(`/projects/${projectId}/menus`, {
    method: "POST",
    body: JSON.stringify({ menus }),
  });
}

export async function removeProjectMenu(projectId: string, menuId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/menus/${menuId}`, {
    method: "DELETE",
  });
}

export async function assignUserRole(projectId: string, userId: string, roleId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/users`, {
    method: "POST",
    body: JSON.stringify({ userId, roleId }),
  });
}

export async function removeUserRole(projectId: string, userId: string, roleId?: string): Promise<void> {
  const url = roleId 
    ? `/projects/${projectId}/users/${userId}?roleId=${roleId}`
    : `/projects/${projectId}/users/${userId}`;
  return apiFetch<void>(url, {
    method: "DELETE",
  });
}

export interface AssignPermissionDto {
  roleId: string;
  menuId: string;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export async function assignProjectPermissions(projectId: string, permissions: AssignPermissionDto[]): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/permissions`, {
    method: "POST",
    body: JSON.stringify(permissions),
  });
}

export async function getProjectPermissions(projectId: string): Promise<any[]> {
  return apiFetch<any[]>(`/projects/${projectId}/permissions`);
}

export async function removeProjectPermission(projectId: string, roleId: string, menuId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/permissions/${roleId}/${menuId}`, {
    method: "DELETE",
  });
}
