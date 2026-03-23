export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface UserProjectRole {
  id: string;
  userId: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    description?: string;
    code: string;
  };
  roleId: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
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

