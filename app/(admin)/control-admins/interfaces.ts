export type AdminRole = "super_admin" | "admin" | "moderator";

export type AdminStatus = "active" | "suspended" | "inactive";

export interface AdminPermissions {
  canManageFraud: boolean;
  canManageReports: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canDeleteData: boolean;
  canManageAdmins: boolean;
}

export interface AdminItem {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: AdminRole;
  status?: AdminStatus;
  permissions: AdminPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListAdminsResponse {
  message?: string;
  admins?: AdminItem[];
  data?: AdminItem[];
}

export interface UpdateAdminPermissionsPayload {
  role: AdminRole;
  permissions: AdminPermissions;
}

export interface UpdateAdminPermissionsResponse {
  message: string;
  admin?: AdminItem;
}

export interface UpdateAdminStatusPayload {
  status: AdminStatus;
}

export interface UpdateAdminStatusResponse {
  message: string;
  admin?: AdminItem;
}