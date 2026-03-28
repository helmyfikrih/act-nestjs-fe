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


