"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyProfile } from "./req-res";
import type { UserProfile } from "./interfaces";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="grid gap-1 border-b border-white/10 py-4 md:grid-cols-[180px_1fr]">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-sm text-white">{value?.trim() ? value : "Not provided"}</p>
    </div>
  );
}

export default function SellerProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMyProfile();
        if (!mounted) return;

        if (!me.logged) {
          throw new Error(me.message || "Not logged in.");
        }

        setUser(me.user);
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

  if (isLoading) {
    return <div className="grid min-h-[260px] place-items-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-red-400">{error || "Profile not found."}</div>;
  }

  const fullAddress = [
    user.address?.street,
    user.address?.city,
    user.address?.postalCode,
    user.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-white/10 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-5">
            <img
              src={user.pfp || "https://placehold.co/120x120/1f2937/e5e7eb?text=Profile"}
              alt={user.name}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
            />

            <div className="pt-1">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Seller Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{user.name}</h1>
              <p className="mt-2 text-sm text-gray-300">{user.email}</p>
              {user.phone && <p className="mt-1 text-sm text-gray-400">{user.phone}</p>}
            </div>
          </div>

          <Link
            href="/profile-details"
            className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
          >
            <span>Edit profile details</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <section className="pt-8">
        <h2 className="text-lg font-semibold text-white">Basic Information</h2>
        <div className="mt-4">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow
            label="Birthday"
            value={user.bday ? new Date(user.bday).toLocaleDateString() : ""}
          />
          <InfoRow label="Address" value={fullAddress} />
        </div>
      </section>

      <section className="border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold text-white">About</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300">
          {user.specializedProfile?.aboutMe?.trim() || "No personal description added yet."}
        </p>
      </section>

      <section className="border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold text-white">Fields of Interest</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(user.fieldsOfInterest ?? []).length > 0 ? (
            user.fieldsOfInterest?.map((item) => (
              <span
                key={item}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200"
              >
                {item}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No fields of interest added.</p>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold text-white">Niches</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(user.specializedProfile?.niches ?? []).length > 0 ? (
            user.specializedProfile?.niches?.map((item) => (
              <span
                key={item}
                className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-200"
              >
                {item}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No niches added.</p>
          )}
        </div>
      </section>

      <section className="grid gap-10 border-t border-white/10 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Additional Phone Numbers</h2>
          <div className="mt-4 space-y-3">
            {(user.specializedProfile?.additionalPhones ?? []).length > 0 ? (
              user.specializedProfile?.additionalPhones?.map((phone, index) => (
                <p key={`${phone}-${index}`} className="text-sm text-gray-300">
                  {phone}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-400">No additional phone numbers.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Additional Emails</h2>
          <div className="mt-4 space-y-3">
            {(user.specializedProfile?.additionalEmails ?? []).length > 0 ? (
              user.specializedProfile?.additionalEmails?.map((email, index) => (
                <p key={`${email}-${index}`} className="text-sm text-gray-300">
                  {email}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-400">No additional emails.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}