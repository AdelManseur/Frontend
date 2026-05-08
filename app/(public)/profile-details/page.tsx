"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Save, X } from "lucide-react";
import Link from "next/link";
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
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
        if (savedMode) setMode(savedMode);

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

  const isSeller = mode === "seller";

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isSeller ? "" : "bg-white"}`} style={{ background: isSeller ? "var(--jm-seller-bg)" : undefined }}>
        <div className="text-center">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isSeller ? "border-white border-r-transparent" : "border-neutral-900 border-r-transparent"}`}></div>
          <p className={`mt-4 text-sm ${isSeller ? "text-white/60" : "text-neutral-600"}`}>Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-500 ${isSeller ? "" : "bg-white"}`} style={{ background: isSeller ? "var(--jm-seller-bg)" : undefined }}>
      {/* Header */}
      <div className={`${isSeller ? "border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl" : "border-b border-neutral-200 bg-neutral-50"}`}>
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
              isSeller ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20" : "bg-neutral-200 text-neutral-700"
            }`}>
              Security & Identity
            </div>
            <h1 className={`text-4xl font-black tracking-tighter ${isSeller ? "text-white" : "text-neutral-900"}`}>
              Edit Profile.
            </h1>
            <p className={`mt-2 text-sm font-medium ${isSeller ? "text-gray-500" : "text-neutral-600"}`}>
              Configure your public identity, secure your account, and manage interests.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-5xl px-6 py-12 pb-32">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Photo & Stats */}
          <div className="md:col-span-1 space-y-8">
             <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-[2.5rem] border p-8 flex flex-col items-center text-center ${
                isSeller ? "bg-white/[0.03] border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-sm"
              }`}
            >
              <div className="relative mb-6">
                <img
                  src={preview || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                  alt="Profile"
                  className={`h-32 w-32 rounded-full object-cover border-4 ${
                    isSeller ? "border-white/5 ring-1 ring-white/10" : "border-white shadow-md"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`absolute -bottom-1 -right-1 flex items-center justify-center w-10 h-10 rounded-full shadow-xl transition-all active:scale-90 ${
                    isSeller ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-neutral-900 text-white"
                  }`}
                >
                  <UserCircle className="h-5 w-5" />
                </button>
              </div>

              <h2 className={`text-xl font-black tracking-tight mb-1 ${isSeller ? "text-white" : "text-neutral-900"}`}>
                {user?.name}
              </h2>
              <p className={`text-xs font-medium mb-6 ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>{user?.email}</p>
              
              <div className="w-full pt-6 border-t border-white/5 space-y-4 text-left">
                 <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-500" : "text-neutral-400"}`}>Account Type</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isSeller ? "bg-indigo-500/20 text-indigo-400" : "bg-neutral-100 text-neutral-600"}`}>
                       {user?.isSeller ? "Seller" : "Buyer"}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-500" : "text-neutral-400"}`}>Verified</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${user?.idVerified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                       {user?.idVerified ? "Yes" : "No"}
                    </span>
                 </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onImagePick}
                className="hidden"
              />
            </motion.section>

            {/* Fields of Interest */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-[2.5rem] border p-8 ${
                isSeller ? "bg-white/[0.03] border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-sm"
              }`}
            >
              <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${isSeller ? "text-indigo-400" : "text-neutral-900"}`}>
                Focus Areas
              </h3>
              <div className="space-y-4">
                <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>
                  Interests (Comma Separated)
                </label>
                <textarea
                  value={fieldsInput}
                  onChange={(e) => setFieldsInput(e.target.value)}
                  placeholder="Design, Marketing, Writing..."
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all min-h-[120px] resize-none ${
                    isSeller 
                      ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                      : "bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900 outline-none"
                  }`}
                />
              </div>
            </motion.section>
          </div>

          {/* Right Column: Address & Security */}
          <div className="md:col-span-2 space-y-8">
            {/* Address Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-[2.5rem] border p-10 ${
                isSeller ? "bg-white/[0.03] border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-sm"
              }`}
            >
              <h3 className={`text-xs font-black uppercase tracking-widest mb-8 ${isSeller ? "text-indigo-400" : "text-neutral-900"}`}>
                Location & Mailing
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>Street Address</label>
                  <input
                    value={address.street}
                    onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>City</label>
                  <input
                    value={address.city}
                    onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>Postal Code</label>
                  <input
                    value={address.postalCode}
                    onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>Country</label>
                  <input
                    value={address.country}
                    onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>
              </div>
            </motion.section>

            {/* Password Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-[2.5rem] border p-10 ${
                isSeller ? "bg-white/[0.03] border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-sm"
              }`}
            >
              <h3 className={`text-xs font-black uppercase tracking-widest mb-8 ${isSeller ? "text-indigo-400" : "text-neutral-900"}`}>
                Security Protocol
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none placeholder:text-gray-800" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ${isSeller ? "text-gray-600" : "text-neutral-500"}`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isSeller 
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/40 outline-none placeholder:text-gray-800" 
                        : "bg-white border-neutral-200 text-neutral-900"
                    }`}
                  />
                </div>
              </div>
            </motion.section>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
               <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest">
                        {error}
                      </motion.p>
                    )}
                    {success && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                        {success}
                      </motion.p>
                    )}
                  </AnimatePresence>
               </div>

               <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all ${
                      isSeller ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Discard Changes
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl ${
                      isSeller 
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/40 disabled:bg-gray-800" 
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isSaving ? "Syncing..." : "Update Profile"}
                    {!isSaving && <Save className="h-3.5 w-3.5" />}
                  </motion.button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}