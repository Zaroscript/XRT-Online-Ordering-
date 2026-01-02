export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  createdBy?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

