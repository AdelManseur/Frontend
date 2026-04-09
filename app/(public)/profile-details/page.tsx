"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "./req-res";
import type { UserAddress, UserProfile, UserSpecializedProfile } from "./interfaces";

const emptyAddress: UserAddress = { street: "", city: "", postalCode: "", country: "" };

const emptySpecializedProfile: UserSpecializedProfile = {
  aboutMe: "",
  additionalPhones: [],
  additionalEmails: [],
  niches: [],
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm text-gray-400">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

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
          me.user.specializedProfile?.niches?.length
            ? me.user.specializedProfile.niches
            : [""]
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

  const originalAddress = useMemo(
    () => ({
      street: user?.address?.street ?? "",
      city: user?.address?.city ?? "",
      postalCode: user?.address?.postalCode ?? "",
      country: user?.address?.country ?? "",
    }),
    [user]
  );

  const originalSpecialized = useMemo<UserSpecializedProfile>(
    () => ({
      aboutMe: user?.specializedProfile?.aboutMe ?? "",
      additionalPhones: user?.specializedProfile?.additionalPhones ?? [],
      additionalEmails: user?.specializedProfile?.additionalEmails ?? [],
      niches: user?.specializedProfile?.niches ?? [],
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

    const specializedProfile: UserSpecializedProfile = {
      aboutMe: aboutMe.trim(),
      additionalPhones: additionalPhones.map((x) => x.trim()).filter(Boolean),
      additionalEmails: additionalEmails.map((x) => x.trim()).filter(Boolean),
      niches: niches.map((x) => x.trim()).filter(Boolean),
    };

    const addrChanged =
      address.street !== originalAddress.street ||
      address.city !== originalAddress.city ||
      address.postalCode !== originalAddress.postalCode ||
      address.country !== originalAddress.country;

    const passChanged = !!newPassword.trim();
    const foiChanged = JSON.stringify(fields) !== JSON.stringify(user?.fieldsOfInterest ?? []);
    const imageChanged = !!pfpFile;
    const specializedChanged =
      JSON.stringify(specializedProfile) !==
      JSON.stringify({
        aboutMe: originalSpecialized.aboutMe,
        additionalPhones: originalSpecialized.additionalPhones,
        additionalEmails: originalSpecialized.additionalEmails,
        niches: originalSpecialized.niches,
      });

    if (!addrChanged && !passChanged && !foiChanged && !imageChanged && !specializedChanged) {
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
        changeSpecialized: specializedChanged,
        nspecializedProfile: specializedChanged ? specializedProfile : undefined,
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

        setAboutMe(refreshed.user.specializedProfile?.aboutMe ?? "");
        setAdditionalPhones(
          refreshed.user.specializedProfile?.additionalPhones?.length
            ? refreshed.user.specializedProfile.additionalPhones
            : [""]
        );
        setAdditionalEmails(
          refreshed.user.specializedProfile?.additionalEmails?.length
            ? refreshed.user.specializedProfile.additionalEmails
            : [""]
        );
        setNiches(
          refreshed.user.specializedProfile?.niches?.length
            ? refreshed.user.specializedProfile.niches
            : [""]
        );
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
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Profile Details</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Manage Your Profile</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update your photo, address, password, interests, and specialized information.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-10 py-8">
        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Photo</h2>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={preview || "https://placehold.co/120x120/1f2937/e5e7eb?text=Profile"}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
              >
                Change photo
              </button>
              {pfpFile && <span className="text-sm text-gray-400">{pfpFile.name}</span>}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onImagePick}
              className="hidden"
            />
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={user?.name ?? ""} disabled />
            </div>

            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput value={user?.email ?? ""} disabled />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Address</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel>Street</FieldLabel>
              <TextInput
                value={address.street}
                onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel>City</FieldLabel>
              <TextInput
                value={address.city}
                onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel>Postal Code</FieldLabel>
              <TextInput
                value={address.postalCode}
                onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel>Country</FieldLabel>
              <TextInput
                value={address.country}
                onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Fields of Interest</h2>
          <div className="mt-5">
            <FieldLabel>Comma separated values</FieldLabel>
            <TextInput
              value={fieldsInput}
              onChange={(e) => setFieldsInput(e.target.value)}
              placeholder="Design, Marketing, Writing..."
            />
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Password</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel>New Password</FieldLabel>
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <FieldLabel>Confirm New Password</FieldLabel>
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Specialized Profile Details</h2>
          <p className="mt-2 text-sm text-gray-400">
            Add optional contact methods, a short introduction, and your niches.
          </p>

          <div className="mt-6 space-y-8">
            <div>
              <FieldLabel>About Me</FieldLabel>
              <TextArea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={4}
                placeholder="Tell buyers about your background, strengths, and work style..."
              />
            </div>

            <div>
              <FieldLabel>Additional Phone Numbers</FieldLabel>
              <div className="space-y-4">
                {additionalPhones.map((phone, i) => (
                  <div key={`phone-${i}`} className="flex gap-3">
                    <TextInput
                      type="tel"
                      value={phone}
                      onChange={(e) => updateListItem(setAdditionalPhones, i, e.target.value)}
                      placeholder="+1 555 123 4567"
                    />
                    {additionalPhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setAdditionalPhones, i)}
                        className="shrink-0 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(setAdditionalPhones)}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                  + Add phone
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>Additional Emails</FieldLabel>
              <div className="space-y-4">
                {additionalEmails.map((email, i) => (
                  <div key={`email-${i}`} className="flex gap-3">
                    <TextInput
                      type="email"
                      value={email}
                      onChange={(e) => updateListItem(setAdditionalEmails, i, e.target.value)}
                      placeholder="alt-email@example.com"
                    />
                    {additionalEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setAdditionalEmails, i)}
                        className="shrink-0 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(setAdditionalEmails)}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                  + Add email
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>Niches</FieldLabel>
              <div className="space-y-4">
                {niches.map((niche, i) => (
                  <div key={`niche-${i}`} className="flex gap-3">
                    <TextInput
                      type="text"
                      value={niche}
                      onChange={(e) => updateListItem(setNiches, i, e.target.value)}
                      placeholder="e.g. SaaS Copywriting, Fitness Coaching..."
                    />
                    {niches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setNiches, i)}
                        className="shrink-0 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(setNiches)}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                  + Add niche
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}