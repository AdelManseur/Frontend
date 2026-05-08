"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Edit, User, Tag, LogOut } from "lucide-react";
import Link from "next/link";
import { getMe, logoutUser } from "../req-res";
import type { UserProfile } from "../interfaces";

function InfoRow({ label, value, icon: Icon, mode }: { label: string; value?: string; icon?: any; mode?: string }) {
  const isSeller = mode === "seller";
  return (
    <div className={`flex items-start gap-4 py-4 border-b last:border-0 ${isSeller ? 'border-white/5' : 'border-neutral-200'}`}>
      {Icon && (
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isSeller ? 'bg-white/5' : 'bg-neutral-100'}`}>
          <Icon className={`h-5 w-5 ${isSeller ? 'text-indigo-400' : 'text-neutral-600'}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium mb-1 ${isSeller ? 'text-white/30' : 'text-neutral-500'}`}>{label}</p>
        <p className={`text-sm ${isSeller ? 'text-white/80' : 'text-neutral-900'}`}>{value?.trim() ? value : "Not provided"}</p>
      </div>
    </div>
  );
}


export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
        if (savedMode) setMode(savedMode);

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
      <div className={`flex items-center justify-center min-h-screen ${mode === 'seller' ? '' : 'bg-white'}`} style={{ background: mode === 'seller' ? "var(--jm-seller-bg)" : undefined }}>
        <div className="text-center">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${mode === 'seller' ? 'border-white border-r-transparent' : 'border-neutral-900 border-r-transparent'}`}></div>
          <p className={`mt-4 text-sm ${mode === 'seller' ? 'text-white/60' : 'text-neutral-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${mode === 'seller' ? '' : 'bg-white'}`} style={{ background: mode === 'seller' ? "var(--jm-seller-bg)" : undefined }}>
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

  const isSellerMode = mode === "seller";

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isSellerMode ? '' : 'bg-white'}`} style={{ background: isSellerMode ? "var(--jm-seller-bg)" : undefined }}>
      {/* Profile Header Card */}
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2.5rem] p-10 border transition-all flex flex-col md:flex-row items-center md:items-start justify-between gap-8 ${
            isSellerMode 
              ? 'bg-white/[0.03] border-white/10 backdrop-blur-3xl shadow-2xl shadow-black/20' 
              : 'bg-white border-neutral-100 shadow-xl shadow-neutral-100/50'
          }`}
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
                className={`h-32 w-32 rounded-full object-cover border-4 shadow-md ring-1 ${
                  isSellerMode ? 'border-white/5 ring-white/10' : 'border-white ring-neutral-100'
                }`}
              />
              <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 rounded-full ${isSellerMode ? 'bg-indigo-500 border-white/10' : 'bg-green-500 border-white'}`}></div>
            </motion.div>

            <div className="pt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  isSellerMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {user.isSeller ? "Elite Seller" : "Standard Buyer"}
                </div>
                {user.idVerified && (
                   <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    isSellerMode ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-green-100 text-green-600'
                  }`}>
                    Verified
                  </div>
                )}
              </div>
              <h1 className={`text-4xl font-black tracking-tighter mb-2 ${isSellerMode ? 'text-white' : 'text-neutral-900'}`}>
                {user.name}
              </h1>
              <p className={`font-medium text-sm ${isSellerMode ? 'text-gray-500' : 'text-neutral-500'}`}>{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[160px]">
            <Link
              href="/profile-details"
              className={`inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                isSellerMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20' 
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-900/10'
              }`}
            >
              <Edit className="h-3.5 w-3.5" />
              Modify Profile
            </Link>

            <button
              onClick={async () => {
                if (confirm("Are you sure you want to log out?")) {
                  await logoutUser();
                }
              }}
              className={`inline-flex items-center justify-center gap-3 rounded-xl border px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                isSellerMode 
                  ? 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10' 
                  : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-3.5 w-3.5" />
              Terminate Session
            </button>
          </div>
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
            className={`rounded-[2.5rem] p-10 border shadow-sm backdrop-blur-xl ${
              isSellerMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-neutral-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-8">
              <h2 className={`text-xs font-black uppercase tracking-widest ${isSellerMode ? 'text-indigo-400' : 'text-neutral-900'}`}>
                Identity Matrix
              </h2>
            </div>
            <div className="space-y-1">
              <InfoRow mode={mode} label="Primary Contact" value={user.email} icon={Mail} />
              <InfoRow mode={mode} label="Direct Line" value={user.phone} icon={Phone} />
              <InfoRow
                mode={mode}
                label="Chronology"
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
              className={`rounded-[2.5rem] p-10 border shadow-sm backdrop-blur-xl ${
                isSellerMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-neutral-100'
              }`}
            >
              <h2 className={`text-xs font-black uppercase tracking-widest mb-8 ${isSellerMode ? 'text-indigo-400' : 'text-neutral-900'}`}>Station Address</h2>
              <InfoRow mode={mode} label="Geographic Location" value={fullAddress} icon={MapPin} />
            </motion.section>

            {/* Interests */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-[2.5rem] p-10 border shadow-sm backdrop-blur-xl ${
                isSellerMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-8">
                <h2 className={`text-xs font-black uppercase tracking-widest ${isSellerMode ? 'text-indigo-400' : 'text-neutral-900'}`}>
                  Specialized Fields
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {(user.fieldsOfInterest ?? []).length > 0 ? (
                  user.fieldsOfInterest?.map((item) => (
                    <span
                      key={item}
                      className={`rounded-xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all cursor-default ${
                        isSellerMode 
                          ? 'bg-white/5 border-white/10 text-white/40 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' 
                          : 'bg-neutral-50 border-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900'
                      }`}
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className={`text-xs font-medium ${isSellerMode ? 'text-gray-700 italic' : 'text-neutral-400'}`}>No interests identified.</p>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}