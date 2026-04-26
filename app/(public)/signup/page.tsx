"use client";

import { UserCircleIcon, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { signupUser } from "./req-res";

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
  fieldsOfInterest: string[];
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
  fieldsOfInterest: [],
};

const AVAILABLE_FIELDS = [
  "Design",
  "Development",
  "Marketing",
  "Translation",
  "Video Editing",
  "Writing",
  "Photography",
  "Music & Audio",
  "Business",
  "Data Analysis",
];

export default function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupMetadata>(initialForm);
  const [pfp, setPfp] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

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

  const toggleFieldOfInterest = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      fieldsOfInterest: prev.fieldsOfInterest.includes(field)
        ? prev.fieldsOfInterest.filter((f) => f !== field)
        : [...prev.fieldsOfInterest, field],
    }));
  };

  const handlePfpChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPfp(file);
  };

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return "Username is required.";
        if (!pfp) return "Please upload a profile photo.";
        return null;
      case 2:
        const email = formData.email.trim();
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (!email) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
        if (phoneDigits.length < 8) return "Phone number must be at least 8 digits.";
        if (!formData.password || formData.password.length < 8) return "Password must be at least 8 characters.";
        return null;
      case 3:
        if (!formData.address.country.trim()) return "Country is required.";
        if (!formData.address.city.trim()) return "City is required.";
        if (!formData.address.street.trim()) return "Street is required.";
        if (!formData.address.postalCode.trim()) return "Postal code is required.";
        return null;
      case 4:
        if (formData.fieldsOfInterest.length === 0) return "Please select at least one field of interest.";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateStep(currentStep);
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
      setSuccess(`${result.message}. Redirecting to verification...`);
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
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
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-white/85 border-neutral-200" : "bg-white border-neutral-200"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="text-xl font-semibold tracking-tight">
              JobMe
            </a>
            <div className="flex gap-3">
              <a
                href="/login"
                className="rounded-full border border-neutral-300 px-5 py-1.5 text-sm text-neutral-900 transition-colors hover:border-neutral-400"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Header */}
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-12">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block rounded-full bg-neutral-100 px-4 py-1.5 text-xs text-neutral-900 font-medium"
          >
            Join the marketplace
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-5xl font-semibold tracking-tight"
          >
            Create your account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-neutral-600"
          >
            Join Algeria's first freelance marketplace
          </motion.p>
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index + 1 === currentStep
                  ? "w-12 bg-neutral-900"
                  : index + 1 < currentStep
                  ? "w-8 bg-neutral-400"
                  : "w-8 bg-neutral-200"
              }`}
            />
          ))}
        </motion.div>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Step {currentStep} of {totalSteps}
        </p>
      </section>

      {/* Form Section */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-10">
          <form onSubmit={handleSubmit} noValidate>
            <AnimatePresence mode="wait">
              {/* Step 1: Profile */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Username */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-900 mb-2">
                        Username
                      </label>
                      <div className="flex items-center rounded-2xl border border-neutral-300 bg-white px-4 transition-all focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/20">
                        <span className="text-sm text-neutral-500 select-none">jobme.dz/</span>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="janesmith"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="block min-w-0 grow bg-transparent py-3 px-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Photo */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        Profile Photo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
                          {pfp ? (
                            <img
                              src={URL.createObjectURL(pfp)}
                              alt="Preview"
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-neutral-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-900 transition-all hover:border-neutral-400 hover:bg-neutral-100"
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
                          <p className="text-xs text-neutral-600">{pfp.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      We need this to verify your account and keep it secure.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-900 mb-2">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>

                    {/* Birth date */}
                    <div>
                      <label htmlFor="bday" className="block text-sm font-medium text-neutral-900 mb-2">
                        Birth date
                      </label>
                      <input
                        id="bday"
                        name="bday"
                        type="date"
                        value={formData.bday}
                        onChange={(e) => updateField("bday", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Address</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      Your location helps us connect you with relevant opportunities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Country */}
                    <div className="sm:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-neutral-900 mb-2">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.address.country}
                        onChange={(e) => updateAddressField("country", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
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
                      <label htmlFor="street" className="block text-sm font-medium text-neutral-900 mb-2">
                        Street address
                      </label>
                      <input
                        id="street"
                        name="street"
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => updateAddressField("street", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-neutral-900 mb-2">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => updateAddressField("city", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-900 mb-2">
                        Postal code
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => updateAddressField("postalCode", e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Fields of Interest */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Fields of Interest</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      Select the categories you're interested in. This helps us recommend relevant sellers and gigs.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {AVAILABLE_FIELDS.map((field) => {
                      const isSelected = formData.fieldsOfInterest.includes(field);
                      return (
                        <motion.button
                          key={field}
                          type="button"
                          onClick={() => toggleFieldOfInterest(field)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{field}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-white"
                              >
                                <Check className="h-3 w-3 text-neutral-900" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {formData.fieldsOfInterest.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-neutral-100 p-4"
                    >
                      <p className="text-sm text-neutral-600">
                        Selected: <span className="font-medium text-neutral-900">{formData.fieldsOfInterest.length} field{formData.fieldsOfInterest.length !== 1 ? 's' : ''}</span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error and Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3"
                >
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 rounded-2xl bg-green-50 border border-green-200 px-4 py-3"
                >
                  <p className="text-sm text-green-800">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                {currentStep > 1 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Cancel
                </button>
                {currentStep < totalSteps ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm text-white transition-all hover:bg-neutral-800"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm text-white transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                    {!isLoading && <Check className="h-4 w-4" />}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <a href="/login" className="text-neutral-900 font-medium transition-colors hover:underline">
            Log in
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm font-semibold">JobMe</div>
            <p className="text-xs text-neutral-500">© 2026 JobMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}