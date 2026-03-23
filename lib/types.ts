export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface UserProjectRole {
  projectId: string;
  projectName: string;
  roleId: string;
  roleName: string;
}

export interface Menu {
  id: string;
  code: string;
  name: string;
  module?: string;
  parentId?: string;
  sortOrder: number;
  children?: Menu[];
  permissions?: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

