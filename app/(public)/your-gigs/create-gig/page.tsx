"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, Plus, Trash2, CheckCircle2, UploadCloud, Info, X } from 'lucide-react';
import Link from 'next/link';
import { createGig } from './req-res';
import { getMe } from '../../req-res';

const steps = [
  { id: 'overview', title: 'Overview' },
  { id: 'pricing', title: 'Scope & Pricing' },
  { id: 'description', title: 'Description & FAQ' },
  { id: 'requirements', title: 'Requirements & Gallery' },
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
      // Front-end validation
      const basicDays = Number(formData.price.basic.deliveryDays);
      if (!formData.title.trim()) throw new Error('Please enter a gig title.');
      if (!formData.category) throw new Error('Please select a category.');
      if (!formData.price.basic.price || Number(formData.price.basic.price) < 5)
        throw new Error('Basic package price must be at least $5.');
      if (!basicDays || basicDays < 1 || basicDays > 30)
        throw new Error('Basic package delivery time must be between 1 and 30 days.');
      if (!formData.images.length) throw new Error('Please add at least one image URL.');

      // Helper to map a package from form state to backend shape
      const mapPackage = (pkg: typeof formData.price.basic) => ({
        price: Number(pkg.price) || 0,
        description: pkg.description || pkg.title || '',
        deliveryTime: Math.min(30, Math.max(1, Number(pkg.deliveryDays) || 1)),
        revisions: pkg.revisions === 'unlimited' ? 999 : Math.max(0, Number(pkg.revisions) || 0),
        features: [],
      });

      const basicPkg = mapPackage(formData.price.basic);

      // Only include standard/premium if the user filled in BOTH price AND deliveryDays
      const standardFilled = !!(formData.price.standard.price && formData.price.standard.deliveryDays);
      const premiumFilled = !!(formData.price.premium.price && formData.price.premium.deliveryDays);

      const standardPkg = standardFilled ? mapPackage(formData.price.standard) : undefined;
      const premiumPkg = premiumFilled ? mapPackage(formData.price.premium) : undefined;

      const payload = {
        metadata: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory || 'General',
          tags: formData.tags,
          price: {
            basic: basicPkg,
            ...(standardPkg ? { standard: standardPkg } : {}),
            ...(premiumPkg ? { premium: premiumPkg } : {}),
          },
          images: formData.images,
          faqs: formData.faqs,
          requirements: formData.requirements,
        }
      };

      await createGig(payload);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || 'Failed to publish gig. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-3xl p-10 text-center shadow-xl shadow-neutral-200/50 border border-neutral-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">Gig Published!</h2>
          <p className="text-neutral-500 font-light mb-8">
            Your gig "{formData.title}" is now live on JobMe and ready for buyers.
          </p>
          {/* FIX: Changed 'to' to 'href' for Next.js Link */}
          <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors active:scale-95">
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 20 : -20, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* FIX: Changed 'to' to 'href' for Next.js Link */}
          <Link href="/" className="text-xl font-semibold tracking-tighter text-neutral-900">JobMe.</Link>
          <div className="text-sm font-medium text-neutral-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext} className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition-colors">
            {currentStep === steps.length - 1 ? 'Publish' : 'Save & Continue'}
          </button>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-neutral-100 w-full">
          <div 
            className="h-full bg-neutral-900 transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 hide-scrollbar">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 whitespace-nowrap">
              <div className={`text-sm font-medium transition-colors ${index <= currentStep ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {index + 1}. {step.title}
              </div>
              {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-neutral-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-200/30 overflow-hidden relative min-h-[500px]">
          <AnimatePresence mode="wait" initial={false} custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="p-8 md:p-12 absolute inset-0 overflow-y-auto"
            >
              {/* STEP 1: Overview */}
              {currentStep === 0 && (
                <div className="space-y-8 pb-20">
                  <div className="mb-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">Let's start with the basics.</h2>
                    <p className="text-neutral-500 font-light">Give your gig a catchy title and select the best category.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-900">Gig Title</label>
                    <textarea
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="I will build a custom full-stack web application"
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-neutral-900">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-neutral-900">Subcategory</label>
                      <select 
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-900">Search Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="e.g. react, nodejs, typescript"
                        className="flex-1 px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all"
                      />
                      <button onClick={handleAddTag} className="px-6 py-4 bg-neutral-100 text-neutral-900 rounded-2xl font-medium hover:bg-neutral-200 transition-colors">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-neutral-300">
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing */}
              {currentStep === 1 && (
                <div className="space-y-8 pb-20">
                  <div className="mb-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">Scope & Pricing.</h2>
                    <p className="text-neutral-500 font-light">Define your packages to give buyers clear choices.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {(['basic', 'standard', 'premium'] as const).map((pkg) => (
                      <div key={pkg} className="border border-neutral-200 rounded-[2rem] p-6 space-y-5 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all">
                        <div className="text-xs font-bold tracking-widest uppercase text-neutral-400 border-b border-neutral-200 pb-4">{pkg} Package</div>
                        
                        <input
                          type="text"
                          placeholder="Package Title"
                          value={formData.price[pkg].title}
                          onChange={(e) => handlePackageChange(pkg, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-neutral-200 py-2 focus:outline-none focus:border-neutral-900 font-medium text-neutral-900"
                        />
                        <textarea
                          placeholder="Description (e.g. A simple 3-page web app)"
                          value={formData.price[pkg].description}
                          onChange={(e) => handlePackageChange(pkg, 'description', e.target.value)}
                          className="w-full bg-transparent border-b border-neutral-200 py-2 focus:outline-none focus:border-neutral-900 text-sm text-neutral-600 resize-none h-20"
                        />
                        <div className="flex items-center gap-2 border-b border-neutral-200 py-2 focus-within:border-neutral-900">
                          <span className="text-neutral-500">$</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={formData.price[pkg].price}
                            onChange={(e) => handlePackageChange(pkg, 'price', e.target.value)}
                            className="w-full bg-transparent focus:outline-none font-semibold text-neutral-900"
                          />
                        </div>
                        <div className="flex items-center gap-2 border-b border-neutral-200 py-2 focus-within:border-neutral-900">
                          <input
                            type="text"
                            placeholder="Delivery (Days)"
                            value={formData.price[pkg].deliveryDays}
                            onChange={(e) => handlePackageChange(pkg, 'deliveryDays', e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-sm text-neutral-900"
                          />
                        </div>
                        <div className="flex items-center gap-2 border-b border-neutral-200 py-2 focus-within:border-neutral-900">
                          <input
                            type="text"
                            placeholder="Revisions (e.g. 2 or unlimited)"
                            value={formData.price[pkg].revisions}
                            onChange={(e) => handlePackageChange(pkg, 'revisions', e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-sm text-neutral-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Description & FAQ */}
              {currentStep === 2 && (
                <div className="space-y-10 pb-20">
                  <div className="mb-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">Description & FAQ.</h2>
                    <p className="text-neutral-500 font-light">Describe your service in detail and anticipate common questions.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-900">Gig Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="I have 5 years of experience building scalable web apps..."
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all resize-none h-48"
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-neutral-900">Frequently Asked Questions</label>
                    </div>
                    
                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
                      <input
                        type="text"
                        placeholder="Add a question (e.g. Do you provide hosting?)"
                        value={faqInput.question}
                        onChange={(e) => setFaqInput(p => ({ ...p, question: e.target.value }))}
                        className="w-full px-5 py-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-400 transition-all"
                      />
                      <textarea
                        placeholder="Add an answer"
                        value={faqInput.answer}
                        onChange={(e) => setFaqInput(p => ({ ...p, answer: e.target.value }))}
                        className="w-full px-5 py-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-400 transition-all resize-none h-24"
                      />
                      <button onClick={handleAddFaq} className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors ml-auto">
                        <Plus className="w-4 h-4" /> Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="flex items-start gap-4 p-5 bg-white border border-neutral-200 rounded-2xl group">
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 mb-1">{faq.question}</h4>
                            <p className="text-neutral-500 font-light text-sm">{faq.answer}</p>
                          </div>
                          <button onClick={() => handleRemoveFaq(index)} className="text-neutral-300 hover:text-red-500 transition-colors p-2">
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
                <div className="space-y-10 pb-20">
                  <div className="mb-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">Final touches.</h2>
                    <p className="text-neutral-500 font-light">Tell buyers what you need to start, and upload portfolio images.</p>
                  </div>

                  <div className="space-y-6">
                    <label className="text-sm font-semibold text-neutral-900">Requirements for the buyer</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reqInput}
                        onChange={(e) => setReqInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReq())}
                        placeholder="e.g. Please provide a detailed project brief."
                        className="flex-1 px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all"
                      />
                      <button onClick={handleAddReq} className="px-6 py-4 bg-neutral-100 text-neutral-900 rounded-2xl font-medium hover:bg-neutral-200 transition-colors">
                        Add
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {formData.requirements.map((req, index) => (
                        <li key={index} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl">
                          <span className="text-neutral-700">{req}</span>
                          <button onClick={() => handleRemoveReq(index)} className="text-neutral-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-neutral-100">
                    <label className="text-sm font-semibold text-neutral-900">Gig Gallery (Image URLs)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                        placeholder="https://example.com/images/gig-thumbnail-1.jpg"
                        className="flex-1 px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all"
                      />
                      <button onClick={handleAddImage} className="px-6 py-4 bg-neutral-100 text-neutral-900 rounded-2xl font-medium hover:bg-neutral-200 transition-colors">
                        Add URL
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                          {/* Fallback pattern since we only have urls that might be broken, or valid */}
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 text-center p-2 break-all bg-neutral-50 z-0">
                            {img}
                          </div>
                          <img src={img} alt="Gallery item" className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300" onLoad={(e) => (e.currentTarget.style.opacity = '1')} onError={(e) => (e.currentTarget.style.display = 'none')} />
                          <button onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500 shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {formData.images.length === 0 && (
                        <div className="aspect-video rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 p-6 text-center">
                          <UploadCloud className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium">No images added</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error Banner */}
          {submitError && (
            <div className="absolute bottom-[80px] left-0 right-0 px-6 py-3 bg-red-50 border-t border-red-200 z-10">
              <p className="text-sm text-red-600 font-medium">⚠️ {submitError}</p>
            </div>
          )}

          {/* Navigation Footer Fixed at Bottom of Card */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-100 flex items-center justify-between z-10 rounded-b-[2rem]">
            <button 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-full transition-colors ${currentStep === 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/20"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Gig'} <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
