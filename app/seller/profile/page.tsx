"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "./req-res";
import type { UserAddress, UserProfile } from "./interfaces";

const emptyAddress: UserAddress = { street: "", city: "", postalCode: "", country: "" };

export default function SellerProfilePage() {
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

  const originalAddress = useMemo(
    () => ({
      street: user?.address?.street ?? "",
      city: user?.address?.city ?? "",
      postalCode: user?.address?.postalCode ?? "",
      country: user?.address?.country ?? "",
    }),
    [user]
  );

  const onImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPfpFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fields = fieldsInput.split(",").map((x) => x.trim()).filter(Boolean);
    const addrChanged =
      address.street !== originalAddress.street ||
      address.city !== originalAddress.city ||
      address.postalCode !== originalAddress.postalCode ||
      address.country !== originalAddress.country;

    const passChanged = !!newPassword.trim();
    const foiChanged = JSON.stringify(fields) !== JSON.stringify(user?.fieldsOfInterest ?? []);
    const imageChanged = !!pfpFile;

    if (!addrChanged && !passChanged && !foiChanged && !imageChanged) {
      setError("No changes requested.");
      return;
    }

    if (addrChanged) {
      if (!address.street || !address.city || !address.postalCode || !address.country) {
        setError("Address requires street, city, postal code, and country.");
        return;
      }
    }

    if (passChanged) {
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
        changeAdd: addrChanged,
        naddress: addrChanged ? address : undefined,

        changePass: passChanged,
        npassword: passChanged ? newPassword : undefined,

        changeFOI: foiChanged,
        nfieldsOfInterest: foiChanged ? fields : undefined,
      };

      const result = await updateMyProfile({
        metadata,
        pfp: pfpFile,
        folder: "users",
      });

      setSuccess(result.message);

      const refreshed = await getMyProfile();
      if (refreshed.logged) {
        setUser(refreshed.user);
        setFieldsInput((refreshed.user.fieldsOfInterest ?? []).join(", "));
        if (refreshed.user.pfp) setPreview(refreshed.user.pfp);
      }

      setNewPassword("");
      setConfirmPassword("");
      setPfpFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[220px] place-items-center">Loading profile...</div>;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-gray-400">Update address, password, fields of interest, and photo.</p>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-4">
          <img
            src={preview || "https://placehold.co/120x120/1f2937/e5e7eb?text=Profile"}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover"
          />
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImagePick} className="hidden" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Name</label>
          <input value={user?.name ?? ""} disabled className="w-full rounded-md bg-white/5 px-3 py-2 opacity-70" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Email</label>
          <input value={user?.email ?? ""} disabled className="w-full rounded-md bg-white/5 px-3 py-2 opacity-70" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Street</label>
          <input value={address.street} onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">City</label>
          <input value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Postal Code</label>
          <input value={address.postalCode} onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Country</label>
          <input value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Fields of Interest (comma separated)</label>
          <input value={fieldsInput} onChange={(e) => setFieldsInput(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
        </div>

        {error && <p className="md:col-span-2 text-sm text-red-400">{error}</p>}
        {success && <p className="md:col-span-2 text-sm text-emerald-400">{success}</p>}

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={isSaving} className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60">
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}