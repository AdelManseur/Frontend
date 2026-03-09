"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { deleteGig, getGigById, updateGig, updateGigStatus } from "./req-res";
import type { SellerGigExpanded, UpdateGigPayload } from "./interfaces";

export default function YourGigExpandedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gigId = searchParams.get("gigId") ?? "";

  const [gig, setGig] = useState<SellerGigExpanded | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(5);
  const [deliveryTime, setDeliveryTime] = useState(1);
  const [revisions, setRevisions] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [imagesInput, setImagesInput] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!gigId) {
        setError("Missing gig id.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getGigById(gigId);
        if (!mounted) return;

        setGig(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setPrice(data.price);
        setDeliveryTime(data.deliveryTime);
        setRevisions(data.revisions);
        setTagsInput((data.tags || []).join(", "));
        setFeaturesInput((data.features || []).join(", "));
        setImagesInput((data.images || []).join(", "));
        setIsActive(data.isActive);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [gigId]);

  const deleteMatchesTitle = useMemo(
    () => deleteConfirmInput.trim() === (gig?.title ?? ""),
    [deleteConfirmInput, gig?.title]
  );

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!gig) return;

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const payload: UpdateGigPayload = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        tags: tagsInput.split(",").map((v) => v.trim()).filter(Boolean),
        price: Number(price),
        deliveryTime: Number(deliveryTime),
        revisions: Number(revisions),
        features: featuresInput.split(",").map((v) => v.trim()).filter(Boolean),
        images: imagesInput.split(",").map((v) => v.trim()).filter(Boolean),
        isActive,
      };

      await updateGig(gig._id, payload);
      setSuccess("Gig updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsSaving(false);
    }
  };

  const onStatusChange = async (nextActive: boolean) => {
    if (!gig) return;
    setError("");
    setSuccess("");

    try {
      await updateGigStatus(gig._id, nextActive);
      setIsActive(nextActive);
      setSuccess(`Status changed to ${nextActive ? "active" : "paused"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    }
  };

  const onDelete = async () => {
    if (!gig || !deleteMatchesTitle) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteGig(gig._id);
      router.push("/seller/your-gigs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[220px] place-items-center">Loading gig...</div>;
  if (!gig) return <div className="text-red-400">{error || "Gig not found."}</div>;

  return (
    <div>
      <Link href="/seller/your-gigs" className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
        <span>←</span>
        <span>Back to Your Gigs</span>
      </Link>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="h-[230px] w-full bg-black/20">
          <img
            src={gig.images?.[0] || "https://placehold.co/1200x500/111827/9ca3af?text=No+Image"}
            alt={gig.title}
            className="h-full w-full object-cover"
          />
        </div>

        <form onSubmit={onSave} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Price</label>
            <input type="number" min={5} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Delivery Time (days)</label>
            <input type="number" min={1} value={deliveryTime} onChange={(e) => setDeliveryTime(Number(e.target.value))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Revisions</label>
            <input type="number" min={0} value={revisions} onChange={(e) => setRevisions(Number(e.target.value))} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Tags (comma separated)</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Features (comma separated)</label>
            <input value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Image URLs (comma separated)</label>
            <input value={imagesInput} onChange={(e) => setImagesInput(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(true)}
                className={`rounded-md px-3 py-2 text-sm ${isActive ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(false)}
                className={`rounded-md px-3 py-2 text-sm ${!isActive ? "bg-yellow-500/30 text-yellow-200" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
              >
                Paused
              </button>
            </div>
          </div>

          <div className="flex items-end justify-end gap-3">
            <button type="submit" disabled={isSaving} className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60">
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="rounded-md bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30">
              Delete gig
            </button>
          </div>

          {error && <p className="md:col-span-2 text-sm text-red-400">{error}</p>}
          {success && <p className="md:col-span-2 text-sm text-emerald-400">{success}</p>}
        </form>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111827] p-5">
            <h3 className="text-lg font-semibold text-red-300">Destructive action</h3>
            <p className="mt-2 text-sm text-gray-300">
              Type exactly: <span className="font-semibold text-white">delete "{gig.title}"</span>
            </p>

            <input
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder={`delete "${gig.title}"`}
              className="mt-3 w-full rounded-md bg-white/5 px-3 py-2 text-sm outline outline-1 outline-white/10 focus:outline-red-400"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteConfirmInput(""); }} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteMatchesTitle || isDeleting}
                onClick={onDelete}
                className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}