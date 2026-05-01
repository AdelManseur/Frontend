export interface AdminPermissions {
  canManageFraud: boolean;
  canManageReports: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canDeleteData: boolean;
  canManageAdmins: boolean;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "moderator";
    permissions: AdminPermissions;
  };
}