export type AdminRole = "super_admin" | "admin" | "moderator";

export interface AdminPermissions {
  canManageFraud: boolean;
  canManageReports: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canDeleteData: boolean;
  canManageAdmins: boolean;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: AdminPermissions;
}

export interface CreateAdminResponse {
  message: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermissions;
  };
}