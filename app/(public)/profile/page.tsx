"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Edit, User, Tag } from "lucide-react";
import Link from "next/link";
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
      {/* Profile Header Card */}
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-xl shadow-neutral-100/50 flex flex-col md:flex-row items-center md:items-start justify-between gap-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src={user.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"}
                alt={user.name}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-neutral-100"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </motion.div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-4">
                {user.isSeller ? "Seller Profile" : "Buyer Profile"}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">
                {user.name}
              </h1>
              <p className="text-neutral-500 font-medium">{user.email}</p>
            </div>
          </div>

          <Link
            href="/profile-details"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-lg shadow-neutral-900/10"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Link>
        </motion.div>
      </div>

      {/* Info Grid */}
      <div className="mx-auto max-w-5xl px-6 pb-20 mt-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Account Details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                Account Details
              </h2>
            </div>
            <div className="space-y-1">
              <InfoRow label="Email Address" value={user.email} icon={Mail} />
              <InfoRow label="Phone Number" value={user.phone} icon={Phone} />
              <InfoRow
                label="Date of Birth"
                value={user.bday ? new Date(user.bday).toLocaleDateString() : ""}
                icon={User}
              />
            </div>
          </motion.section>

          {/* Location & Tags */}
          <div className="space-y-8">
            {/* Location */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm"
            >
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-6">Location</h2>
              <InfoRow label="Address" value={fullAddress} icon={MapPin} />
            </motion.section>

            {/* Interests */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Interests
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(user.fieldsOfInterest ?? []).length > 0 ? (
                  user.fieldsOfInterest?.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-[13px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-white hover:border-neutral-900 cursor-default"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">No interests selected yet.</p>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}