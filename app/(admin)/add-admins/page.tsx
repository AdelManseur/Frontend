"use client";

import { useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { AdminPermissions, AdminRole, CreateAdminPayload } from "./interfaces";
import { createAdmin } from "./req-res";

const defaultPermissions: AdminPermissions = {
  canManageFraud: true,
  canManageReports: true,
  canManageUsers: false,
  canViewAnalytics: true,
  canDeleteData: false,
  canManageAdmins: false,
};

export default function AddAdminsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password.trim().length >= 8,
    [name, email, password]
  );

  const onTogglePermission = (key: keyof AdminPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onRoleChange = (nextRole: AdminRole) => {
    setRole(nextRole);

    if (nextRole === "super_admin") {
      setPermissions({
        canManageFraud: true,
        canManageReports: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canDeleteData: true,
        canManageAdmins: true,
      });
      return;
    }

    if (nextRole === "moderator") {
      setPermissions({
        canManageFraud: true,
        canManageReports: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canDeleteData: false,
        canManageAdmins: false,
      });
      return;
    }

    // admin
    setPermissions(defaultPermissions);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("token") ||
        "";

      /*if (!token) {
        throw new Error("Missing admin token. Please login again.");
      }*/

      const payload: CreateAdminPayload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        permissions,
      };

      const res = await createAdmin(payload, token);
      setSuccess(res.message || "Admin created successfully.");

      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      setPermissions(defaultPermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add Admin</h1>

      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Admin"
          />
        </label>

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="newadmin@example.com"
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </label>

        <label className={styles.label}>
          Role
          <select
            className={styles.input}
            value={role}
            onChange={(e) => onRoleChange(e.target.value as AdminRole)}
          >
            <option value="admin">admin</option>
            <option value="moderator">moderator</option>
            <option value="super_admin">super_admin</option>
          </select>
        </label>

        <div className={styles.permissionsBox}>
          <p className={styles.permissionsTitle}>Permissions</p>

          {(Object.keys(permissions) as (keyof AdminPermissions)[]).map((key) => (
            <label key={key} className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={permissions[key]}
                onChange={() => onTogglePermission(key)}
              />
              <span>{key}</span>
            </label>
          ))}
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}

        <button className={styles.submit} type="submit" disabled={!canSubmit || loading}>
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}