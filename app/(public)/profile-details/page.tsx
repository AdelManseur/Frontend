"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Save, X } from "lucide-react";
import { getMe, updateMe } from "../req-res";
import type { UserProfile, UserAddress } from "../interfaces";

const emptyAddress: UserAddress = { street: "", city: "", postalCode: "", country: "" };

export default function ProfileDetailsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [address, setAddress] = useState<UserAddress>(emptyAddress);
  const [fieldsInput, setFieldsInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMe();
        if (!mounted) return;
        if (!me.logged) throw new Error(me.message || "Not logged in.");

        setUser(me.user);
        setAddress({
          street: me.user.address?.street ?? "",
          city: me.user.address?.city ?? "",
          postalCode: me.user.address?.postalCode ?? "",
          country: me.user.address?.country ?? "",
        });
        setFieldsInput((me.user.fieldsOfInterest ?? []).join(", "));
        setPreview(me.user.pfp ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPfpFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fields = fieldsInput
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (newPassword.trim()) {
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Password confirmation does not match.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const metadata: any = {};
      
      // We always send address if they submit, or we could diff it. We'll send it if not empty.
      metadata.changeAdd = true;
      metadata.naddress = address;

      if (newPassword.trim()) {
        metadata.changePass = true;
        metadata.npassword = newPassword.trim();
      }

      metadata.changeFOI = true;
      metadata.nfieldsOfInterest = fields;

      const result = await updateMe({
        metadata,
        pfp: pfpFile,
        folder: "users",
      });

      setSuccess(result.message);
      setNewPassword("");
      setConfirmPassword("");
      setPfpFile(null);

      // Refresh profile
      const refreshed = await getMe();
      if (refreshed.logged) {
        setUser(refreshed.user);
        setPreview(refreshed.user.pfp ?? preview);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-neutral-600">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 mb-4">
              Profile Details
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Manage Your Profile
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Update your photo, address, password, and fields of interest.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Photo Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">Photo</h2>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative">
                <img
                  src={preview || "https://placehold.co/120x120/e5e7eb/1f2937?text=Profile"}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-neutral-100"
                />
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-neutral-900 rounded-full">
                  <UserCircle className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Change photo
                </button>
                {pfpFile && <span className="text-sm text-neutral-600">{pfpFile.name}</span>}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onImagePick}
                className="hidden"
              />
            </div>
          </motion.section>

          {/* Account Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">Account</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Name</label>
                <input
                  value={user?.name ?? ""}
                  disabled
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-neutral-500">Name cannot be changed directly.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Email</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-neutral-500">Email cannot be changed directly.</p>
              </div>
            </div>
          </motion.section>

          {/* Address Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">Address</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-900 mb-2">Street</label>
                <input
                  value={address.street}
                  onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">City</label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Postal Code
                </label>
                <input
                  value={address.postalCode}
                  onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Country</label>
                <input
                  value={address.country}
                  onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>
            </div>
          </motion.section>

          {/* Fields of Interest */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">
              Fields of Interest
            </h2>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Comma separated values
              </label>
              <input
                value={fieldsInput}
                onChange={(e) => setFieldsInput(e.target.value)}
                placeholder="Design, Marketing, Writing..."
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
          </motion.section>

          {/* Password Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">Security</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>
            </div>
          </motion.section>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3"
              >
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3"
              >
                <p className="text-sm text-green-800">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <a
              href="/profile"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </a>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save changes"}
              {!isSaving && <Save className="h-4 w-4" />}
            </motion.button>
          </div>
        </form>
      </div>
    </main>
  );
}