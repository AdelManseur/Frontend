"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMyGigs, updateGig } from "../req-res";
import { getMe } from "@/app/(public)/req-res";
import type { SellerGig } from "../interfaces";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Edit3, 
  Eye, 
  Star, 
  Clock, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Globe,
  Tag,
  Package,
  MessageSquare,
  HelpCircle,
  Image as ImageIcon,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";

// --- Edit Form Component (Extracted logic from create-gig) ---
function EditGigForm({ gig, onCancel, onSaved }: { gig: SellerGig, onCancel: () => void, onSaved: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const steps = [
    { id: 'overview', title: 'Overview' },
    { id: 'pricing', title: 'Pricing' },
    { id: 'description', title: 'Details' },
    { id: 'requirements', title: 'Gallery' },
  ];

  const categories = ['Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Video & Animation', 'Writing & Translation'];
  
  const [formData, setFormData] = useState({
    title: gig.title,
    description: gig.description,
    category: gig.category,
    subcategory: gig.subcategory || "",
    tags: gig.tags || [],
    price: {
      basic: { 
        title: (gig.price.basic as any).title || "", 
        description: gig.price.basic.description || "", 
        price: gig.price.basic.price.toString(), 
        deliveryDays: gig.price.basic.deliveryTime.toString(), 
        revisions: gig.price.basic.revisions.toString() 
      },
      standard: { 
        title: (gig.price.standard as any)?.title || "", 
        description: gig.price.standard?.description || "", 
        price: gig.price.standard?.price?.toString() || "", 
        deliveryDays: gig.price.standard?.deliveryTime?.toString() || "", 
        revisions: gig.price.standard?.revisions?.toString() || "" 
      },
      premium: { 
        title: (gig.price.premium as any)?.title || "", 
        description: gig.price.premium?.description || "", 
        price: gig.price.premium?.price?.toString() || "", 
        deliveryDays: gig.price.premium?.deliveryTime?.toString() || "", 
        revisions: gig.price.premium?.revisions?.toString() || "" 
      }
    },
    images: gig.images || [],
    faqs: gig.faqs || [],
    requirements: gig.requirements || []
  });

  const [tagInput, setTagInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [faqInput, setFaqInput] = useState({ question: '', answer: '' });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handlePackageChange = (pkg: 'basic' | 'standard' | 'premium', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [pkg]: { ...prev.price[pkg], [field]: value }
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const mapPackage = (pkg: any) => ({
        price: Number(pkg.price) || 0,
        description: pkg.description || pkg.title || '',
        deliveryTime: Math.min(30, Math.max(1, Number(pkg.deliveryDays) || 1)),
        revisions: pkg.revisions === 'unlimited' ? 999 : Math.max(0, Number(pkg.revisions) || 0),
        features: [],
      });

      const basicPkg = mapPackage(formData.price.basic);
      const standardFilled = !!(formData.price.standard.price && formData.price.standard.deliveryDays);
      const premiumFilled = !!(formData.price.premium.price && formData.price.premium.deliveryDays);

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || 'General',
        tags: formData.tags,
        price: {
          basic: basicPkg,
          ...(standardFilled ? { standard: mapPackage(formData.price.standard) } : {}),
          ...(premiumFilled ? { premium: mapPackage(formData.price.premium) } : {}),
        },
        images: formData.images,
        faqs: formData.faqs,
        requirements: formData.requirements,
      };

      await updateGig(gig._id, payload);
      onSaved();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to update gig.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Edit Service</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Update your marketplace presence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {steps.map((step, idx) => (
             <div key={step.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-black transition-all ${idx === currentStep ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                   {idx + 1}
                </div>
                {idx < steps.length - 1 && <div className="w-4 h-[1px] bg-white/5" />}
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 min-h-[500px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Service Title</label>
                  <textarea 
                    value={formData.title} 
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-3xl text-lg font-bold text-white focus:outline-none focus:border-indigo-500/40 transition-all resize-none h-32"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Specialty</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/40"
                    >
                      {categories.map(c => <option key={c} value={c} className="bg-[#0A0A0B]">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Marketplace Tags</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={tagInput} 
                         onChange={(e) => setTagInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setFormData(p => ({ ...p, tags: [...p.tags, tagInput.trim()] })), setTagInput(''))}
                         className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-indigo-500/40"
                         placeholder="Press enter to add..."
                       />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                       {formData.tags.map(t => (
                         <span key={t} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-black rounded-xl flex items-center gap-2">
                           {t} <button onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter(tg => tg !== t) }))} className="hover:text-white transition-colors">×</button>
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
               <div className="grid lg:grid-cols-3 gap-6">
                 {(['basic', 'standard', 'premium'] as const).map((pkg) => (
                   <div key={pkg} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600 border-b border-white/5 pb-4">{pkg} Tier</span>
                      <input 
                        type="text" 
                        placeholder="Tier Label"
                        value={formData.price[pkg].title} 
                        onChange={(e) => handlePackageChange(pkg, 'title', e.target.value)}
                        className="bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-indigo-500 text-white font-black"
                      />
                      <textarea 
                        placeholder="Features description"
                        value={formData.price[pkg].description} 
                        onChange={(e) => handlePackageChange(pkg, 'description', e.target.value)}
                        className="bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-indigo-500 text-gray-400 text-sm h-24 resize-none"
                      />
                      <div className="flex items-center gap-2 border-b border-white/10 py-2">
                         <span className="text-[10px] font-black text-gray-600">DA</span>
                         <input 
                           type="number" 
                           value={formData.price[pkg].price} 
                           onChange={(e) => handlePackageChange(pkg, 'price', e.target.value)}
                           className="bg-transparent focus:outline-none text-white font-black flex-1"
                         />
                      </div>
                      <div className="flex items-center gap-2 border-b border-white/10 py-2">
                         <Clock className="w-4 h-4 text-gray-600" />
                         <input 
                           type="text" 
                           placeholder="Days"
                           value={formData.price[pkg].deliveryDays} 
                           onChange={(e) => handlePackageChange(pkg, 'deliveryDays', e.target.value)}
                           className="bg-transparent focus:outline-none text-white font-black text-xs uppercase tracking-widest flex-1"
                         />
                      </div>
                   </div>
                 ))}
               </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Service Story</label>
                   <textarea 
                     value={formData.description} 
                     onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                     className="w-full px-8 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-base font-medium text-white focus:outline-none focus:border-indigo-500/40 transition-all resize-none min-h-[300px]"
                   />
                </div>
              </div>
            )}

            {currentStep === 3 && (
               <div className="space-y-12">
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Visual Gallery (URLs)</label>
                     <div className="flex gap-4">
                        <input 
                          type="url" 
                          value={imageInput} 
                          onChange={(e) => setImageInput(e.target.value)}
                          className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none"
                          placeholder="Paste new image URL..."
                        />
                        <button onClick={() => { if(imageInput) { setFormData(p => ({ ...p, images: [...p.images, imageInput] })); setImageInput(''); } }} className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px]">Add</button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group border border-white/5">
                             <img src={img} className="w-full h-full object-cover" alt="Gig visual" />
                             <button onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black">Remove</button>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
           <button onClick={handleBack} disabled={currentStep === 0} className={`px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all ${currentStep === 0 ? 'opacity-20 grayscale' : 'bg-white/5 text-gray-400 hover:text-white'}`}>Back</button>
           
           <div className="flex items-center gap-4">
              {submitError && <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">{submitError}</span>}
              {currentStep < steps.length - 1 ? (
                <button onClick={handleNext} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all">Continue</button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Sync Changes'}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function YourGigExpandedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gigId = searchParams.get("gigId") ?? "";

  const [gig, setGig] = useState<SellerGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchGig = async () => {
    setIsLoading(true);
    try {
      if (!gigId) throw new Error("Missing gig id.");
      const me = await getMe();
      if (!me.logged) { router.push("/login"); return; }
      const gigs = await getMyGigs(me.user._id);
      const found = gigs.find((g) => g._id === gigId) ?? null;
      if (!found) throw new Error("Gig not found.");
      setGig(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGig();
  }, [gigId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Synthesizing Details...</p>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
           <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Sync Lost</h2>
        <p className="text-gray-500 font-medium mb-10">{error || "The requested gig data is unreachable."}</p>
        <Link href="/your-gigs" className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10">Return to Catalog</Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-5xl font-sans text-white">
         <EditGigForm 
           gig={gig} 
           onCancel={() => setIsEditing(false)} 
           onSaved={async () => {
             setIsEditing(false);
             await fetchGig();
           }} 
         />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl font-sans text-white pb-32">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/your-gigs" className="flex items-center gap-3 text-gray-500 hover:text-white transition-all group">
           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ChevronLeft className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to catalog</span>
        </Link>

        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-3 px-10 py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <Edit3 className="w-4 h-4" /> Manage Service
        </button>
      </div>

      {/* Gig Summary Hero */}
      <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 lg:p-16 mb-12">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
           {/* Primary Visual */}
           <div className="w-full lg:w-[45%] flex-shrink-0">
              <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
                 <img src={gig.images?.[0] || ""} className="w-full h-full object-cover" alt={gig.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <div className="px-4 py-2 bg-indigo-500/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest">
                       {gig.category}
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                 {(gig.images || []).slice(1, 5).map((img, i) => (
                   <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/5 bg-white/5">
                      <img src={img} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                   </div>
                 ))}
              </div>
           </div>

           {/* Core Info */}
           <div className="flex-1 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Published & Active</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-[1.1] text-white">{gig.title}</h1>
              </div>

              <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                 <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Client Rating</span>
                    <div className="flex items-center gap-2">
                       <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                       <span className="text-xl font-black">{typeof (gig.rating as any) === 'number' ? (gig.rating as any).toFixed(1) : (gig.rating as any)?.average?.toFixed(1) || "5.0"}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Avg. Delivery</span>
                    <div className="flex items-center gap-2 text-indigo-300">
                       <Clock className="w-4 h-4" />
                       <span className="text-xl font-black">{gig.price.basic.deliveryTime}d</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Tier Starting</span>
                    <div className="flex items-center gap-2 text-white">
                       <span className="text-xl font-black">{gig.price.basic.price.toLocaleString()} DA</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-3">
                 {(gig.tags || []).map(tag => (
                   <span key={tag} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-default">
                     # {tag}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Detailed Content Grid */}
      <div className="grid lg:grid-cols-3 gap-12 items-start">
         {/* Left Col: Narrative & FAQ */}
         <div className="lg:col-span-2 space-y-16">
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-2xl font-black tracking-tight">Gig Description</h2>
               </div>
               <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-10 leading-relaxed text-gray-400 font-medium text-lg whitespace-pre-wrap">
                  {gig.description}
               </div>
            </section>

            <section className="space-y-8">
               <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-2xl font-black tracking-tight">Pre-Sales Support (FAQ)</h2>
               </div>
               <div className="grid gap-4">
                  {gig.faqs?.length ? gig.faqs.map((faq, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-4 hover:bg-white/[0.03] transition-all">
                       <h4 className="text-white font-black flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                          {faq.question}
                       </h4>
                       <p className="text-gray-500 text-sm leading-relaxed font-medium pl-7">{faq.answer}</p>
                    </div>
                  )) : (
                    <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 text-gray-700">
                       <span className="text-[11px] font-black uppercase tracking-widest">No FAQ entries provided for this service.</span>
                    </div>
                  )}
               </div>
            </section>
         </div>

         {/* Right Col: Packages & Metrics */}
         <div className="space-y-8">
            <section className="space-y-6">
               <div className="flex items-center gap-3 px-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-black tracking-tight">Tier Comparison</h2>
               </div>
               
               <div className="space-y-4">
                  {(['basic', 'standard', 'premium'] as const).map(tier => {
                    const data = gig.price[tier];
                    if (!data) return null;
                    return (
                      <div key={tier} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-indigo-400 transition-colors">{tier} Plan</span>
                            <span className="text-lg font-black text-white">{data.price.toLocaleString()} DA</span>
                         </div>
                         <h3 className="text-white font-bold mb-3">{(data as any).title || `${tier} Package`}</h3>
                         <p className="text-gray-500 text-[13px] leading-relaxed mb-6 line-clamp-3">{data.description}</p>
                         <div className="flex items-center gap-6 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <div className="flex items-center gap-2">
                               <Clock className="w-3.5 h-3.5" /> {data.deliveryTime} Days
                            </div>
                            <div className="flex items-center gap-2">
                               <Zap className="w-3.5 h-3.5" /> {data.revisions} Revisions
                            </div>
                         </div>
                      </div>
                    )
                  })}
               </div>
            </section>

            <section className="p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 space-y-6">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-black text-white">Service Requirements</h2>
               </div>
               <p className="text-xs text-gray-400 font-medium leading-relaxed">The following items are requested from the buyer upon order placement:</p>
               <ul className="space-y-3">
                  {gig.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-white/80 font-bold bg-white/5 p-4 rounded-xl">
                       <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                       {req}
                    </li>
                  ))}
               </ul>
            </section>
         </div>
      </div>
    </div>
  );
}