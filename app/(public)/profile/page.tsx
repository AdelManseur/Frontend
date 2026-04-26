"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Edit, User, Tag, Briefcase } from "lucide-react";

// Mock interfaces - replace with your actual types
interface UserAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface UserSpecializedProfile {
  aboutMe?: string;
  additionalPhones?: string[];
  additionalEmails?: string[];
  niches?: string[];
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

// Mock function - replace with actual API call
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
            aboutMe: "Passionate freelancer with 5+ years of experience in web development and design. I love creating beautiful, functional websites that help businesses grow.",
            additionalPhones: ["+213 555 987 654"],
            additionalEmails: ["jane.business@example.com"],
            niches: ["SaaS Design", "E-commerce Development", "Brand Identity"],
          },
        },
      });
    }, 1000);
  });
};

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
                  Seller Profile
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
        <div className="space-y-12">
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

          {/* About */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-6">About</h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              {user.specializedProfile?.aboutMe?.trim() || "No personal description added yet."}
            </p>
          </motion.section>

          {/* Fields of Interest & Niches */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fields of Interest */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
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

            {/* Niches */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-3xl border border-neutral-200 bg-white p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100">
                  <Briefcase className="h-5 w-5 text-neutral-900" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Niches</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(user.specializedProfile?.niches ?? []).length > 0 ? (
                  user.specializedProfile?.niches?.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No niches added.</p>
                )}
              </div>
            </motion.section>
          </div>

          {/* Additional Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="rounded-3xl border border-neutral-200 bg-white p-8"
          >
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-6">
              Additional Contact
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-4">Phone Numbers</h3>
                <div className="space-y-3">
                  {(user.specializedProfile?.additionalPhones ?? []).length > 0 ? (
                    user.specializedProfile?.additionalPhones?.map((phone, index) => (
                      <div key={`${phone}-${index}`} className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-neutral-500" />
                        <p className="text-sm text-neutral-700">{phone}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">No additional phone numbers.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-4">Email Addresses</h3>
                <div className="space-y-3">
                  {(user.specializedProfile?.additionalEmails ?? []).length > 0 ? (
                    user.specializedProfile?.additionalEmails?.map((email, index) => (
                      <div key={`${email}-${index}`} className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-neutral-500" />
                        <p className="text-sm text-neutral-700">{email}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">No additional emails.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
