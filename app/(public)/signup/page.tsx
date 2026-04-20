"use client";

import { UserCircleIcon } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupMetadata {
  name: string;
  email: string;
  phone: string;
  bday: string;
  password: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const initialForm: SignupMetadata = {
  name: "",
  email: "",
  phone: "",
  bday: "",
  password: "",
  address: {
    street: "",
    city: "",
    postalCode: "",
    country: "",
  },
};

// Mock function - replace with actual API call
const signupUser = async (data: { metadata: SignupMetadata; pfp: File | null; folder: string }) => {
  return new Promise<{ message: string; redirect: string }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        message: "Account created successfully", 
        redirect: "/verify-otp" 
      });
    }, 1000);
  });
};

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupMetadata>(initialForm);
  const [pfp, setPfp] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateField = (key: keyof SignupMetadata, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddressField = (key: keyof SignupMetadata["address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  const handlePfpChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPfp(file);
  };

  const validateForm = (data: SignupMetadata): string | null => {
    const email = data.email.trim();
    const phoneDigits = data.phone.replace(/\D/g, "");

    if (!data.name.trim()) return "Name is required.";
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (phoneDigits.length < 8) return "Phone number must be at least 8 digits.";
    if (!data.password || data.password.length < 8) return "Password must be at least 8 characters.";
    if (!data.address.country.trim()) return "Country is required.";
    if (!data.address.city.trim()) return "City is required.";
    if (!data.address.street.trim()) return "Street is required.";
    if (!data.address.postalCode.trim()) return "Postal code is required.";

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupUser({
        metadata: formData,
        pfp,
        folder: "users",
      });
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      setSuccess(`${result.message}. Continue at: ${result.redirect}`);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setPfp(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Navbar */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-white/85 border-[#1d1d1f]/10" : "bg-white border-[#1d1d1f]/10"
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-[980px] border border-[#1a6b3c]/25 px-5 py-1.5 text-sm text-[#1a6b3c] transition-colors hover:border-[#1a6b3c]/40 hover:text-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-12">
        <div className="text-center">
          <div className="inline-block rounded-[980px] bg-[#1a6b3c] px-4 py-1.5 text-xs text-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
            Join the marketplace
          </div>
          <h1 className="mt-6 text-5xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p className="mt-4 text-lg text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
            Join Algeria's first freelance marketplace with face verification
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-[18px] border border-[#1d1d1f]/10 bg-[#f5f5f7] p-8 sm:p-10">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-12">
              {/* Profile Section */}
              <div className="border-b border-[#1d1d1f]/10 pb-10">
                <h2 className="text-xl text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Profile
                </h2>
                <p className="mt-2 text-sm text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  This information will be displayed publicly so be careful what you share.
                </p>

                <div className="mt-8 space-y-6">
                  {/* Username */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Username
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 transition-all focus-within:border-[#1a6b3c] focus-within:ring-2 focus-within:ring-[#1a6b3c]/20">
                        <span className="text-sm text-[#6e6e73] select-none" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          jobme.dz/
                        </span>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="janesmith"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="block min-w-0 grow bg-transparent py-2.5 px-2 text-[#1d1d1f] placeholder:text-[#6e6e73]/50 focus:outline-none"
                          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Photo
                    </label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1d1d1f]/5">
                        <UserCircleIcon className="h-8 w-8 text-[#6e6e73]" />
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-[980px] border border-[#1a6b3c]/25 px-5 py-2 text-sm text-[#1a6b3c] transition-all hover:border-[#1a6b3c]/40 hover:text-[#1e7d46]"
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                      >
                        Upload photo
                      </button>
                      <input
                        ref={fileInputRef}
                        id="pfp-upload"
                        name="pfp"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePfpChange}
                      />
                      {pfp && (
                        <p className="text-xs text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {pfp.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="border-b border-[#1d1d1f]/10 pb-10">
                <h2 className="text-xl text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Personal Information
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* Birth date */}
                  <div>
                    <label htmlFor="bday" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Birth date
                    </label>
                    <input
                      id="bday"
                      name="bday"
                      type="date"
                      value={formData.bday}
                      onChange={(e) => updateField("bday", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h2 className="text-xl text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Address
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  {/* Country */}
                  <div className="sm:col-span-2">
                    <label htmlFor="country" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.address.country}
                      onChange={(e) => updateAddressField("country", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    >
                      <option value="">Select country</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Egypt">Egypt</option>
                    </select>
                  </div>

                  {/* Street */}
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Street address
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => updateAddressField("street", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateAddressField("city", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      Postal code
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => updateAddressField("postalCode", e.target.value)}
                      className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mt-6 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  {error}
                </p>
              </div>
            )}
            {success && (
              <div className="mt-6 rounded-[8px] bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  {success}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="text-sm text-[#1d1d1f] transition-colors hover:text-[#1a6b3c]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-[980px] bg-[#1a6b3c] px-6 py-2.5 text-sm text-white transition-all hover:bg-[#1e7d46] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
          Already have an account?{" "}
          <Link href="/login" className="text-[#1a6b3c] transition-colors hover:text-[#1e7d46]">
            Log in
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#1d1d1f]/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </div>
            <p className="text-xs text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              © 2024 JobMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}