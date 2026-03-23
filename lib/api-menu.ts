import { apiFetch } from "./api";

export interface Menu {
  id: string;
  code: string;
  name: string;
  module?: string;
  parentId?: string;
  sortOrder: number;
  children?: Menu[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuDto {
  code: string;
  name: string;
  module?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export async function getMenusTree(): Promise<Menu[]> {
  return apiFetch<Menu[]>("/menus/tree");
}

export async function getMenus(): Promise<Menu[]> {
  return apiFetch<Menu[]>("/menus");
}

export async function createMenu(data: CreateMenuDto): Promise<Menu> {
  return apiFetch<Menu>("/menus", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMenu(id: string, data: UpdateMenuDto): Promise<Menu> {
  return apiFetch<Menu>(`/menus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMenu(id: string): Promise<void> {
  return apiFetch<void>(`/menus/${id}`, {
    method: "DELETE",
  });
}
