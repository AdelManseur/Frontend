"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  UploadCloud, 
  Info, 
  X,
  Sparkles,
  Layout,
  DollarSign,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { createGig } from './req-res';
import { getMe } from '../../req-res';

const steps = [
  { id: 'overview', title: 'Overview', icon: Layout },
  { id: 'pricing', title: 'Scope & Pricing', icon: DollarSign },
  { id: 'description', title: 'Description & FAQ', icon: FileText },
  { id: 'requirements', title: 'Requirements & Gallery', icon: ImageIcon },
];

const categories = ['Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Video & Animation', 'Writing & Translation'];
const subcategories = ['Web Development', 'Mobile Apps', 'Game Development', 'AI Services'];

export default function CreateGigPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Main Form State matching the JSON structure exactly
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    price: {
      basic: { title: '', description: '', price: '', deliveryDays: '', revisions: '' },
      standard: { title: '', description: '', price: '', deliveryDays: '', revisions: '' },
      premium: { title: '', description: '', price: '', deliveryDays: '', revisions: '' }
    },
    images: [] as string[],
    faqs: [] as { question: string; answer: string }[],
    requirements: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [faqInput, setFaqInput] = useState({ question: '', answer: '' });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageChange = (pkg: 'basic' | 'standard' | 'premium', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [pkg]: { ...prev.price[pkg], [field]: value }
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddFaq = () => {
    if (faqInput.question.trim() && faqInput.answer.trim()) {
      setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { ...faqInput }] }));
      setFaqInput({ question: '', answer: '' });
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  };

  const handleAddReq = () => {
    if (reqInput.trim()) {
      setFormData(prev => ({ ...prev, requirements: [...prev.requirements, reqInput.trim()] }));
      setReqInput('');
    }
  };

  const handleRemoveReq = (index: number) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (!formData.title.trim()) throw new Error('Please enter a gig title.');
      if (!formData.category) throw new Error('Please select a category.');
      if (!formData.price.basic.price || Number(formData.price.basic.price) < 5)
        throw new Error('Basic package price must be at least 5 DA.');
      if (!formData.images.length) throw new Error('Please add at least one image URL.');

      const mapPackage = (pkg: typeof formData.price.basic) => ({
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
        metadata: {
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
        }
      };

      await createGig(payload);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to publish gig.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-white font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 max-w-md w-full rounded-[2.5rem] p-12 text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-4">Gig is Live!</h2>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">
            Your service "{formData.title}" has been published and is now visible to thousands of buyers.
          </p>
          <Link href="/your-gigs" className="flex items-center justify-center w-full px-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all active:scale-95">
            Return to Inventory
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-transparent backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/your-gigs" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Cancel Creation</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Milestone</span>
               <span className="text-sm font-black text-white">{steps[currentStep].title}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
               <span className="text-base font-black text-indigo-400">{currentStep + 1}</span>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-0.5 bg-white/5 w-full">
          <motion.div 
            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-16 relative">
        {/* Step Navigation Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-col gap-8 absolute -left-64 top-16 w-48">
           {steps.map((step, idx) => {
             const Icon = step.icon;
             const isActive = idx === currentStep;
             const isCompleted = idx < currentStep;

             return (
               <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-2' : 'opacity-30'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-white'}`}>
                     {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>{step.title}</span>
               </div>
             )
           })}
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="p-8 md:p-10 flex-1 overflow-y-auto"
            >
              {/* STEP 1: Overview */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <Sparkles className="w-3 h-3" /> New Gig Identity
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-white mb-2">The First Impression.</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md">Your title and category are the anchors of your service. Make them sharp.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gig Title</label>
                    <textarea
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="I will design a high-end luxury brand identity..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#0A0A0B]">Select Specialty</option>
                        {categories.map(c => <option key={c} value={c} className="bg-[#0A0A0B]">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Market Segment</label>
                      <select 
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#0A0A0B]">Select Sub-Category</option>
                        {subcategories.map(c => <option key={c} value={c} className="bg-[#0A0A0B]">{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Search Tags</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add keywords (e.g. Minimalist, Logo, SVG)"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                      />
                      <button onClick={handleAddTag} className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-bold rounded-lg text-white group">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing */}
              {currentStep === 1 && (
                <div className="space-y-8">
                   <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <DollarSign className="w-3 h-3" /> Service Tiers
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-white mb-2">The Value Map.</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md">Create distinct packages that cater to different buyer needs and budgets.</p>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-4">
                    {(['basic', 'standard', 'premium'] as const).map((pkg) => (
                      <div key={pkg} className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-5 border-b border-white/5 pb-3 group-hover:text-indigo-400 transition-colors">{pkg} Tier</div>
                        
                        <div className="space-y-4 flex-1">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Package Title</label>
                             <input
                               type="text"
                               placeholder="Package Title"
                               value={formData.price[pkg].title}
                               onChange={(e) => handlePackageChange(pkg, 'title', e.target.value)}
                               className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-indigo-500 font-bold text-white text-sm placeholder:text-gray-800"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Description</label>
                             <textarea
                               placeholder="Detailed offering..."
                               value={formData.price[pkg].description}
                               onChange={(e) => handlePackageChange(pkg, 'description', e.target.value)}
                               className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-indigo-500 text-xs font-medium text-gray-400 resize-none h-16 placeholder:text-gray-800"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Price (DA)</label>
                             <div className="flex items-center gap-2 border-b border-white/10 py-2 focus-within:border-indigo-500">
                               <span className="text-gray-600 font-black text-[10px] uppercase">DA</span>
                               <input
                                 type="number"
                                 placeholder="Price"
                                 value={formData.price[pkg].price}
                                 onChange={(e) => handlePackageChange(pkg, 'price', e.target.value)}
                                 className="w-full bg-transparent focus:outline-none font-bold text-sm text-white"
                               />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Delivery (days)</label>
                             <div className="flex items-center gap-2 border-b border-white/10 py-2 focus-within:border-indigo-500">
                               <Clock className="w-3 h-3 text-gray-600" />
                               <input
                                 type="text"
                                 placeholder="e.g. 3"
                                 value={formData.price[pkg].deliveryDays}
                                 onChange={(e) => handlePackageChange(pkg, 'deliveryDays', e.target.value)}
                                 className="w-full bg-transparent focus:outline-none text-sm font-medium text-white"
                               />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Revisions</label>
                             <div className="flex items-center gap-2 border-b border-white/10 py-2 focus-within:border-indigo-500">
                               <Plus className="w-3 h-3 text-gray-600" />
                               <input
                                 type="text"
                                 placeholder="e.g. 2"
                                 value={formData.price[pkg].revisions}
                                 onChange={(e) => handlePackageChange(pkg, 'revisions', e.target.value)}
                                 className="w-full bg-transparent focus:outline-none text-sm font-medium text-white"
                               />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Description & FAQ */}
              {currentStep === 2 && (
                <div className="space-y-8">
                   <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <FileText className="w-3 h-3" /> Detailed Briefing
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-white mb-2">The Narrative.</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md">Tell your story, explain your process, and clear all doubts beforehand.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Showcase your expertise and what makes your gig unique..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none min-h-[200px] leading-relaxed"
                    />
                  </div>

                  <div className="space-y-5 pt-6 border-t border-white/5">
                    <h3 className="text-sm font-black tracking-tight text-white">Frequently Asked Questions</h3>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Question</label>
                         <input
                           type="text"
                           placeholder="e.g. Do you provide source files?"
                           value={faqInput.question}
                           onChange={(e) => setFaqInput(p => ({ ...p, question: e.target.value }))}
                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Answer</label>
                         <textarea
                           placeholder="e.g. Yes, all packages include vector source files."
                           value={faqInput.answer}
                           onChange={(e) => setFaqInput(p => ({ ...p, answer: e.target.value }))}
                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all resize-none h-20"
                         />
                      </div>
                      <button onClick={handleAddFaq} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all ml-auto">
                        <Plus className="w-3 h-3" /> Add FAQ
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] transition-all">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm mb-1">{faq.question}</h4>
                            <p className="text-gray-500 font-medium text-xs leading-relaxed">{faq.answer}</p>
                          </div>
                          <button onClick={() => handleRemoveFaq(index)} className="text-gray-700 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Requirements & Gallery */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <ImageIcon className="w-3 h-3" /> Visual Showcase
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Gallery & Logic.</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md">Set your buyer requirements and build your visual gallery.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Buyer Requirements</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={reqInput}
                        onChange={(e) => setReqInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReq())}
                        placeholder="e.g. Please send your existing brand logo..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                      />
                      <button onClick={handleAddReq} className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-gray-300 font-medium text-sm italic">"{req}"</span>
                          <button onClick={() => handleRemoveReq(index)} className="text-gray-700 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visual Portfolio (URLs)</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                        placeholder="Paste image URL here..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                      />
                      <button onClick={handleAddImage} className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                        Import
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-black border border-white/5 group ring-1 ring-white/5">
                          <img src={img} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button onClick={() => handleRemoveImage(index)} className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {formData.images.length < 5 && (
                        <div className="aspect-video rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-gray-600 p-8 text-center transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/[0.02]">
                          <UploadCloud className="w-10 h-10 mb-4 opacity-30" />
                          <span className="text-xs font-black uppercase tracking-widest leading-relaxed">Add up to 5 project visuals</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="px-8 py-5 bg-white/[0.02] backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-10">
            <button 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className={`flex items-center gap-3 px-8 py-5 font-black uppercase tracking-widest text-xs rounded-2xl transition-all ${currentStep === 0 ? 'text-gray-800 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>

            <div className="flex items-center gap-6">
               {submitError && (
                 <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-xs font-bold uppercase tracking-widest">
                   {submitError}
                 </motion.p>
               )}

              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all active:scale-95 shadow-2xl shadow-indigo-500/20"
                >
                  Save & Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95 shadow-2xl shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Syncing...' : 'Launch Service'} <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
