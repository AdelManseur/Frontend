"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Edit, User, Tag } from "lucide-react";
import { getMe } from "../req-res";
import type { UserProfile } from "../interfaces";

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-neutral-200 last:border-0">
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
        <p className="text-sm text-neutral-900">{value?.trim() ? value : "Not provided"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMe();
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-900 border-r-transparent"></div>
          <p className="mt-4 text-sm text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-red-600">{error || "Profile not found."}</p>
        </div>
      </div>
    );
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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
          >
            <div className="flex items-start gap-6">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                src={user.pfp || "https://placehold.co/120x120/e5e7eb/1f2937?text=Profile"}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />

              <div className="pt-1">
                <div className="inline-block rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 mb-3">
                  {user.isSeller ? "Seller Profile" : "Buyer Profile"}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                  {user.name}
                </h1>
                <p className="mt-2 text-sm text-neutral-600">{user.email}</p>
                {user.phone && <p className="mt-1 text-sm text-neutral-600">{user.phone}</p>}
              </div>
            </div>

            <motion.a
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              href="/profile-details"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-100"
            >
              <Edit className="h-4 w-4" />
              Edit profile
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Basic Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100">
                <User className="h-5 w-5 text-neutral-900" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Basic Information
              </h2>
            </div>
            <div className="space-y-0">
              <InfoRow label="Email" value={user.email} icon={Mail} />
              <InfoRow label="Phone" value={user.phone} icon={Phone} />
              <InfoRow
                label="Birthday"
                value={user.bday ? new Date(user.bday).toLocaleDateString() : ""}
              />
              <InfoRow label="Address" value={fullAddress} icon={MapPin} />
            </div>
          </motion.section>

          {/* Fields of Interest */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100">
                <Tag className="h-5 w-5 text-neutral-900" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Fields of Interest
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(user.fieldsOfInterest ?? []).length > 0 ? (
                user.fieldsOfInterest?.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-900"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No fields of interest added.</p>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}