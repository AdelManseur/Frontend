"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createGig } from "./req-res";
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
  questions: [],
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

export default function CreateGigPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateGigMetadata>(initialForm);
  const [tagsInput, setTagsInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [imagesInput, setImagesInput] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
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

  const updateQuestion = (index: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));
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
      const cleanedQuestions = questions.map((x) => x.trim()).filter(Boolean);

      await createGig({
        metadata: {
          ...form,
          tags,
          features,
          images,
          questions: cleanedQuestions,
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
    <div className="mx-auto max-w-5xl">
      <Link
        href="/seller/your-gigs"
        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
      >
        <span>←</span>
        <span>Back to Your Gigs</span>
      </Link>

      <div className="border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Seller</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Create Gig</h1>
        <p className="mt-2 text-sm text-gray-400">
          Fill the details below to publish your new gig.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-10 py-8">
        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Title</FieldLabel>
              <TextInput
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="I will design your modern landing page"
              />
            </div>

            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <TextArea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe what you offer, deliverables, and scope..."
              />
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <TextInput
                type="text"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Web Design"
              />
            </div>

            <div>
              <FieldLabel>Price ($)</FieldLabel>
              <TextInput
                type="number"
                min={5}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              />
            </div>

            <div>
              <FieldLabel>Delivery Time (days)</FieldLabel>
              <TextInput
                type="number"
                min={1}
                value={form.deliveryTime}
                onChange={(e) => setForm((p) => ({ ...p, deliveryTime: Number(e.target.value) }))}
              />
            </div>

            <div>
              <FieldLabel>Revisions</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={form.revisions}
                onChange={(e) => setForm((p) => ({ ...p, revisions: Number(e.target.value) }))}
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Tags & Features</h2>
          <div className="mt-5 grid grid-cols-1 gap-6">
            <div>
              <FieldLabel>Tags (comma separated)</FieldLabel>
              <TextInput
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="logo, ui, figma"
              />
            </div>

            <div>
              <FieldLabel>Features (comma separated)</FieldLabel>
              <TextInput
                type="text"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Responsive design, Source file, Fast delivery"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Buyer Questions</h2>
              <p className="mt-1 text-sm text-gray-400">
                Add the questions buyers should answer before ordering.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              + Add Question
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {questions.map((question, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <FieldLabel>Question {index + 1}</FieldLabel>
                  <TextInput
                    type="text"
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder="Example: What style or color palette do you prefer?"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/10 pb-8">
          <h2 className="text-lg font-semibold text-white">Images</h2>
          <div className="mt-5">
            <FieldLabel>Image URLs (comma separated)</FieldLabel>
            <TextInput
              type="text"
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              placeholder="https://..., https://..."
            />
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/seller/your-gigs")}
            className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create Gig"}
          </button>
        </div>
      </form>
    </div>
  );
}