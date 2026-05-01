"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { AdminItem, AdminRole, AdminPermissions, AdminStatus } from "./interfaces";
import { listAdmins, updateAdminPermissions, updateAdminStatus } from "./req-res";

const defaultPermissions: AdminPermissions = {
  canManageFraud: true,
  canManageReports: true,
  canManageUsers: false,
  canViewAnalytics: true,
  canDeleteData: false,
  canManageAdmins: false,
};

export default function ControlAdminsPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>("admin");
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>(defaultPermissions);
  const [editStatus, setEditStatus] = useState<AdminStatus>("active");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const token = useMemo(
    () =>
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("token") ||
      "",
    []
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const rows = await listAdmins(token);
        if (!mounted) return;
        setAdmins(rows);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load admins.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const onEditClick = (admin: AdminItem) => {
    setEditingId(admin._id || admin.id || null);
    setEditRole(admin.role);
    setEditPermissions(admin.permissions);
    setEditStatus(admin.status || "active");
    setUpdateError("");
    setUpdateSuccess("");
  };

  const onRoleChange = (nextRole: AdminRole) => {
    setEditRole(nextRole);

    if (nextRole === "super_admin") {
      setEditPermissions({
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
      setEditPermissions({
        canManageFraud: true,
        canManageReports: true,
        canManageUsers: false,
        canViewAnalytics: true,
        canDeleteData: false,
        canManageAdmins: false,
      });
      return;
    }

    setEditPermissions(defaultPermissions);
  };

  const onTogglePermission = (key: keyof AdminPermissions) => {
    setEditPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSaveChanges = async () => {
    if (!editingId || /*!token ||*/ updating) return;

    try {
      setUpdating(true);
      setUpdateError("");
      setUpdateSuccess("");

      await Promise.all([
        updateAdminPermissions(
          editingId,
          {
            role: editRole,
            permissions: editPermissions,
          },
          token
        ),
        updateAdminStatus(
          editingId,
          {
            status: editStatus,
          },
          token
        ),
      ]);

      setAdmins((prev) =>
        prev.map((a) =>
          (a._id === editingId || a.id === editingId)
            ? {
                ...a,
                role: editRole,
                permissions: editPermissions,
                status: editStatus,
              }
            : a
        )
      );

      setUpdateSuccess("Admin updated successfully.");
      setEditingId(null);
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : "Failed to update admin.");
    } finally {
      setUpdating(false);
    }
  };

  const onCancel = () => {
    setEditingId(null);
    setUpdateError("");
    setUpdateSuccess("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Control Admins</h1>
        <p className={styles.subtitle}>All registered admins</p>
      </div>

      {loading ? <p className={styles.state}>Loading admins...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const key = admin._id || admin.id || `${admin.email}-${admin.role}`;
                  const isEditing = editingId === (admin._id || admin.id);

                  return (
                    <tr key={key}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.role}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles[`badge-${admin.status || "active"}`]}`}
                        >
                          {admin.status || "active"}
                        </span>
                      </td>
                      <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"}</td>
                      <td>
                        {!isEditing ? (
                          <button
                            className={styles.editBtn}
                            onClick={() => onEditClick(admin)}
                            type="button"
                          >
                            Edit
                          </button>
                        ) : (
                          <span className={styles.editing}>Editing...</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Admin</h2>

            <label className={styles.label}>
              Status
              <select
                className={styles.input}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as AdminStatus)}
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="inactive">inactive</option>
              </select>
            </label>

            <label className={styles.label}>
              Role
              <select
                className={styles.input}
                value={editRole}
                onChange={(e) => onRoleChange(e.target.value as AdminRole)}
              >
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
                <option value="super_admin">super_admin</option>
              </select>
            </label>

            <div className={styles.permissionsBox}>
              <p className={styles.permissionsTitle}>Permissions</p>

              {(Object.keys(editPermissions) as (keyof AdminPermissions)[]).map((key) => (
                <label key={key} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={editPermissions[key]}
                    onChange={() => onTogglePermission(key)}
                  />
                  <span>{key}</span>
                </label>
              ))}
            </div>

            {updateError ? <p className={styles.error}>{updateError}</p> : null}
            {updateSuccess ? <p className={styles.success}>{updateSuccess}</p> : null}

            <div className={styles.modalActions}>
              <button
                className={styles.saveBtn}
                onClick={onSaveChanges}
                disabled={updating}
                type="button"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={onCancel}
                disabled={updating}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}