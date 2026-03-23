import { apiFetch } from "./api";
import { UserProjectRole, Menu } from "./types";

/** Fetch projects assigned to the current user. */
export async function getMyProjects(): Promise<UserProjectRole[]> {
  return apiFetch<UserProjectRole[]>("/projects/my-projects");
}

/** Fetch menus for a specific project that the current user has access to. */
export async function getMyProjectMenus(projectId: string): Promise<Menu[]> {
  return apiFetch<Menu[]>(`/projects/${projectId}/my-menus`);
}
