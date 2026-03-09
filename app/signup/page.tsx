"use client";

import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupUser } from "./req-res";
import type { SignupMetadata } from "./interfaces";
import styles from "./styles.module.css";

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

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupMetadata>(initialForm);
  const [pfp, setPfp] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
              Join JobMe
            </p>
            <h1 className="mt-3 text-3xl font-extrabold">Create your account</h1>
            <p className="mt-1 text-sm text-gray-400">
              Same form, now aligned with platform visual identity.
            </p>
          </div>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
              Log in
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-12">
              <div className="border-b border-white/10 pb-12">
                <h2 className="text-base/7 font-semibold text-white">Profile</h2>
                <p className="mt-1 text-sm/6 text-gray-400">
                  This information will be displayed publicly so be careful what you share.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm/6 font-medium text-white">
                      Username
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                        <div className="shrink-0 text-base text-gray-400 select-none sm:text-sm/6">workcation.com/</div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="janesmith"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="pfp-upload" className="block text-sm/6 font-medium text-white">
                      Photo
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                      <UserCircleIcon aria-hidden="true" className="size-12 text-gray-500" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20"
                      >
                        Change
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

                      {pfp && <p className="text-xs text-gray-400">Selected: {pfp.name}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10 pb-12">
                <h2 className="text-base/7 font-semibold text-white">Personal Information</h2>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm/6 font-medium text-white">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="bday" className="block text-sm/6 font-medium text-white">
                      Birth date
                    </label>
                    <input
                      id="bday"
                      name="bday"
                      type="date"
                      value={formData.bday}
                      onChange={(e) => updateField("bday", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm/6 font-medium text-white">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="country" className="block text-sm/6 font-medium text-white">
                      Country
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <select
                        id="country"
                        name="country"
                        value={formData.address.country}
                        onChange={(e) => updateAddressField("country", e.target.value)}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-white outline-1 outline-white/10"
                      >
                        <option value="">Select country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="street" className="block text-sm/6 font-medium text-white">
                      Street
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => updateAddressField("street", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="city" className="block text-sm/6 font-medium text-white">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateAddressField("city", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="postalCode" className="block text-sm/6 font-medium text-white">
                      ZIP / Postal code
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => updateAddressField("postalCode", e.target.value)}
                      className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button type="button" onClick={handleCancel} className="text-sm/6 font-semibold text-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}