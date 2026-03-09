"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createGig } from "./res-res";
import type { CreateGigMetadata } from "./interfaces";
import Link from "next/link";

const initialForm: CreateGigMetadata = {
  title: "",
  description: "",
  category: "",
  tags: [],
  price: 5,
  deliveryTime: 1,
  revisions: 0,
  features: [],
  images: [],
};

export default function CreateGigPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateGigMetadata>(initialForm);
  const [tagsInput, setTagsInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [imagesInput, setImagesInput] = useState(""); // comma-separated URLs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category.trim()) return "Category is required.";
    if (!Number.isFinite(form.price) || form.price < 5) return "Price must be >= 5.";
    if (!Number.isFinite(form.deliveryTime) || form.deliveryTime < 1) return "Delivery time must be >= 1.";
    if (!Number.isFinite(form.revisions) || form.revisions < 0) return "Revisions cannot be negative.";
    return null;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const tags = tagsInput.split(",").map((x) => x.trim()).filter(Boolean);
      const features = featuresInput.split(",").map((x) => x.trim()).filter(Boolean);
      const images = imagesInput.split(",").map((x) => x.trim()).filter(Boolean);

      await createGig({
        metadata: {
          ...form,
          tags,
          features,
          images,
        },
      });

      router.push("/seller/your-gigs");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/seller/your-gigs"
        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
      >
        <span>←</span>
        <span>Back to Your Gigs</span>
      </Link>

      <h1 className="text-3xl font-bold">Create Gig</h1>
      <p className="mt-2 text-gray-400">Fill the details below to publish your new gig.</p>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
            placeholder="I will design your modern landing page"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
            placeholder="Describe what you offer, deliverables, and scope..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
            placeholder="Web Design"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Price ($)</label>
          <input
            type="number"
            min={5}
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Delivery Time (days)</label>
          <input
            type="number"
            min={1}
            value={form.deliveryTime}
            onChange={(e) => setForm((p) => ({ ...p, deliveryTime: Number(e.target.value) }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Revisions</label>
          <input
            type="number"
            min={0}
            value={form.revisions}
            onChange={(e) => setForm((p) => ({ ...p, revisions: Number(e.target.value) }))}
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Tags (comma separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="logo, ui, figma"
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Features (comma separated)</label>
          <input
            type="text"
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            placeholder="Responsive design, Source file, Fast delivery"
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-gray-300">Image URLs (comma separated)</label>
          <input
            type="text"
            value={imagesInput}
            onChange={(e) => setImagesInput(e.target.value)}
            placeholder="https://..., https://..."
            className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        {error && <p className="sm:col-span-2 text-sm text-red-400">{error}</p>}

        <div className="sm:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/seller/your-gigs")}
            className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create Gig"}
          </button>
        </div>
      </form>
    </div>
  );
}