"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Save, X, Plus, Trash2 } from "lucide-react";

// Mock interfaces - replace with your actual types
interface UserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface UserSpecializedProfile {
  aboutMe: string;
  additionalPhones: string[];
  additionalEmails: string[];
  niches: string[];
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  bday?: string;
  pfp?: string;
  address?: UserAddress;
  fieldsOfInterest?: string[];
  specializedProfile?: UserSpecializedProfile;
}

const emptyAddress: UserAddress = { street: "", city: "", postalCode: "", country: "" };

const emptySpecializedProfile: UserSpecializedProfile = {
  aboutMe: "",
  additionalPhones: [],
  additionalEmails: [],
  niches: [],
};

// Mock functions - replace with actual API calls
const getMyProfile = async () => {
  return new Promise<{ logged: boolean; message?: string; user: UserProfile }>((resolve) => {
    setTimeout(() => {
      resolve({
        logged: true,
        user: {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+213 555 123 456",
          bday: "1995-06-15",
          pfp: "https://placehold.co/200x200/e5e7eb/1f2937?text=JS",
          address: {
            street: "123 Main Street",
            city: "Algiers",
            postalCode: "16000",
            country: "Algeria",
          },
          fieldsOfInterest: ["Design", "Development", "Marketing"],
          specializedProfile: {
            aboutMe: "Passionate freelancer with 5+ years of experience.",
            additionalPhones: ["+213 555 987 654"],
            additionalEmails: ["jane.business@example.com"],
            niches: ["SaaS Design", "E-commerce Development"],
          },
        },
      });
    }, 1000);
  });
};

const updateMyProfile = async (data: any) => {
  return new Promise<{ message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ message: "Profile updated successfully!" });
    }, 1000);
  });
};

export default function SellerProfileDetails() {
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

  const [additionalPhones, setAdditionalPhones] = useState<string[]>([""]);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([""]);
  const [niches, setNiches] = useState<string[]>([""]);
  const [aboutMe, setAboutMe] = useState("");

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMyProfile();
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

        setAboutMe(me.user.specializedProfile?.aboutMe ?? "");
        setAdditionalPhones(
          me.user.specializedProfile?.additionalPhones?.length
            ? me.user.specializedProfile.additionalPhones
            : [""]
        );
        setAdditionalEmails(
          me.user.specializedProfile?.additionalEmails?.length
            ? me.user.specializedProfile.additionalEmails
            : [""]
        );
        setNiches(
          me.user.specializedProfile?.niches?.length ? me.user.specializedProfile.niches : [""]
        );
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

    const specializedProfile: UserSpecializedProfile = {
      aboutMe: aboutMe.trim(),
      additionalPhones: additionalPhones.map((x) => x.trim()).filter(Boolean),
      additionalEmails: additionalEmails.map((x) => x.trim()).filter(Boolean),
      niches: niches.map((x) => x.trim()).filter(Boolean),
    };

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
      const metadata = {
        changeAdd: true,
        naddress: address,
        changePass: !!newPassword.trim(),
        npassword: newPassword.trim() || undefined,
        changeFOI: true,
        nfieldsOfInterest: fields,
        changeSpecialized: true,
        nspecializedProfile: specializedProfile,
      };

      const result = await updateMyProfile({
        metadata,
        pfp: pfpFile,
        folder: "users",
      });

      setSuccess(result.message);
      setNewPassword("");
      setConfirmPassword("");
      setPfpFile(null);

      // Refresh profile
      const refreshed = await getMyProfile();
      if (refreshed.logged) {
        setUser(refreshed.user);
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
          <p className="mt-4 text-sm text-neutral-600">Loading profile...</p>
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
              Update your photo, address, password, interests, and specialized information.
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
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Email</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                />
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
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-6">Password</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Specialized Profile */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-2">
              Specialized Profile
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Add optional contact methods, a short introduction, and your niches.
            </p>

            <div className="space-y-8">
              {/* About Me */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">About Me</label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={4}
                  placeholder="Tell buyers about your background, strengths, and work style..."
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
                />
              </div>

              {/* Additional Phones */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-4">
                  Additional Phone Numbers
                </label>
                <div className="space-y-3">
                  {additionalPhones.map((phone, i) => (
                    <div key={`phone-${i}`} className="flex gap-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updateListItem(setAdditionalPhones, i, e.target.value)}
                        placeholder="+213 555 123 4567"
                        className="flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                      {additionalPhones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem(setAdditionalPhones, i)}
                          className="flex items-center justify-center w-11 h-11 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(setAdditionalPhones)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add phone
                  </button>
                </div>
              </div>

              {/* Additional Emails */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-4">
                  Additional Emails
                </label>
                <div className="space-y-3">
                  {additionalEmails.map((email, i) => (
                    <div key={`email-${i}`} className="flex gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateListItem(setAdditionalEmails, i, e.target.value)}
                        placeholder="alt-email@example.com"
                        className="flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                      {additionalEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem(setAdditionalEmails, i)}
                          className="flex items-center justify-center w-11 h-11 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(setAdditionalEmails)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add email
                  </button>
                </div>
              </div>

              {/* Niches */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-4">Niches</label>
                <div className="space-y-3">
                  {niches.map((niche, i) => (
                    <div key={`niche-${i}`} className="flex gap-3">
                      <input
                        type="text"
                        value={niche}
                        onChange={(e) => updateListItem(setNiches, i, e.target.value)}
                        placeholder="e.g. SaaS Copywriting, Fitness Coaching..."
                        className="flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                      {niches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem(setNiches, i)}
                          className="flex items-center justify-center w-11 h-11 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(setNiches)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add niche
                  </button>
                </div>
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
