'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Sparkles,
  MapPin,
  Mic,
  MicOff,
  AlertCircle,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';
import { LocationPicker } from '@/components/map/LocationPicker';
import { AiTriageCard } from '@/components/citizen/AiTriageCard';
import { useDeviceId } from '@/hooks/use-device-id';
import { resizeImageClientSide } from '@/lib/image-resize';
import type { Category, TriageResult } from '@/lib/domain/types';
import { CATEGORIES } from '@/lib/domain/types';
import { getDefaultDepartment } from '@/lib/domain/departments';

export default function ReportPage() {
  const router = useRouter();
  const deviceId = useDeviceId();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('auto'); // 'auto' means Let AI Decide
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number>(11.0147); // Coimbatore center
  const [longitude, setLongitude] = useState<number>(76.9557);
  const [address, setAddress] = useState<string>('Gandhipuram Central, Coimbatore 641012');
  const [contact, setContact] = useState('');

  // AI & Submission State
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [finalCategory, setFinalCategory] = useState<Category>('Pothole/Road Damage');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voice Dictation (P1)
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en-IN' | 'ta-IN' | 'hi-IN'>('en-IN');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Web Speech API if supported
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported in this browser. Please type your description.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = speechLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const dataUrl = await resizeImageClientSide(file, 1280);
      setImagePreview(dataUrl);

      // Trigger automatic prompt to analyze if description is empty
      if (!description.trim()) {
        runTriageAnalysis(dataUrl);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing image';
      setErrorMessage(errorMsg);
    }
  };

  const runTriageAnalysis = async (imgOverride?: string) => {
    const targetImage = imgOverride !== undefined ? imgOverride : imagePreview;
    if (!description.trim() && !targetImage) {
      setErrorMessage('Please either provide an issue description or upload a photo first.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          title,
          image: targetImage,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI analysis request failed.');
      }

      const result: TriageResult = data.analysis;
      setTriageResult(result);
      setFinalCategory(result.category);

      // Auto-fill title if empty and AI provided a suggested title
      if (!title.trim() && result.suggested_title) {
        setTitle(result.suggested_title);
      }
      // If citizen had empty description and photo was analyzed, populate description
      if (!description.trim() && result.cleaned_description_en) {
        setDescription(result.cleaned_description_en);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error running AI triage';
      setErrorMessage(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim() && !imagePreview) {
      setErrorMessage('Please enter an issue description or provide a photograph.');
      return;
    }

    setSubmitting(true);

    try {
      // If citizen didn't explicitly trigger "Analyze with AI" before submitting,
      // run triage now so the issue is properly triaged
      let currentTriage = triageResult;
      if (!currentTriage) {
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            title,
            image: imagePreview,
            latitude,
            longitude,
          }),
        });
        const analyzeData = await analyzeRes.json();
        if (analyzeRes.ok) {
          currentTriage = analyzeData.analysis;
        }
      }

      const assignedCategory =
        selectedCategory !== 'auto' ? (selectedCategory as Category) : currentTriage?.category || 'Other';
      const assignedDepartment = currentTriage?.department || getDefaultDepartment(assignedCategory);
      const assignedPriority = currentTriage?.priority || 'Medium';

      const issuePayload = {
        title: title.trim() || currentTriage?.suggested_title || `Civic issue: ${assignedCategory}`,
        description: description.trim() || currentTriage?.cleaned_description_en || 'Citizen report',
        latitude,
        longitude,
        address,
        category: assignedCategory,
        image_url: imagePreview,
        ai_analysis: currentTriage,
        final_category: assignedCategory,
        final_department: assignedDepartment,
        final_priority: assignedPriority,
        device_id: deviceId || null,
        contact: contact.trim() || null,
      };

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issuePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit issue report.');
      }

      const trackingCode = data.issue.tracking_code;
      const isDuplicate = data.is_duplicate;
      const linkedParent = data.linked_parent_code;

      // Navigate to success page
      const queryParams = new URLSearchParams();
      if (isDuplicate && linkedParent) {
        queryParams.set('duplicate', 'true');
        queryParams.set('parent', linkedParent);
      }
      router.push(`/success/${trackingCode}?${queryParams.toString()}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error submitting issue';
      setErrorMessage(errorMsg);
      setSubmitting(false);
    }
  };

  const currentStep = triageResult ? 3 : description.trim() ? 2 : 1;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full animate-fade-in-up">
      {/* Title & Introductory Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b5b]/10 text-[#14213d] dark:text-[#f4ede0] border border-[#ff6b5b]/20 text-[11px] font-semibold tracking-wide uppercase mb-3 mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b5b]" />
          Coimbatore Municipal Corporation
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-[#14213d] dark:text-[#f4ede0] tracking-tight">
          Report a <span className="font-normal italic text-[#ff6b5b]">Civic Grievance</span>
        </h1>
        <p className="text-sm text-[#14213d]/70 dark:text-[#f4ede0]/70 mt-1 max-w-xl">
          Submit photo evidence and details. Google Gemini triages urgency, category, and department dispatch in real time.
        </p>
      </div>

      {/* Visual Step Indicator: 1. Photo & Location -> 2. Description -> 3. AI Triage */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-full bg-[#e6dcce]/50 dark:bg-white/[0.05] border border-[#14213d]/10 dark:border-white/10 mb-8 text-xs font-medium">
        <div
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all text-center ${
            currentStep >= 1
              ? 'bg-[#14213d] text-[#f4ede0] shadow-sm font-semibold'
              : 'text-[#14213d]/60 dark:text-[#f4ede0]/60'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#ff6b5b] text-[#14213d] font-bold text-[10px] flex items-center justify-center shrink-0">
            1
          </span>
          <span className="truncate hidden sm:inline">Photo & Spot</span>
          <span className="sm:hidden truncate">Photo</span>
        </div>

        <div
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all text-center ${
            currentStep >= 2
              ? 'bg-[#14213d] text-[#f4ede0] shadow-sm font-semibold'
              : 'text-[#14213d]/60 dark:text-[#f4ede0]/60'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              currentStep >= 2 ? 'bg-[#ff6b5b] text-[#14213d]' : 'bg-[#14213d]/20 dark:bg-white/20'
            }`}
          >
            2
          </span>
          <span className="truncate hidden sm:inline">Description</span>
          <span className="sm:hidden truncate">Details</span>
        </div>

        <div
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all text-center ${
            currentStep >= 3
              ? 'bg-[#14213d] text-[#f4ede0] shadow-sm font-semibold'
              : 'text-[#14213d]/60 dark:text-[#f4ede0]/60'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              currentStep >= 3 ? 'bg-[#ff6b5b] text-[#14213d]' : 'bg-[#14213d]/20 dark:bg-white/20'
            }`}
          >
            3
          </span>
          <span className="truncate hidden sm:inline">AI Triage</span>
          <span className="sm:hidden truncate">Triage</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-[20px] bg-[#991b1b]/10 border border-[#991b1b]/30 text-[#991b1b] dark:text-[#fca5a5] text-xs flex items-center gap-2.5 mb-6 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#991b1b]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload & Camera Section */}
        <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#ff6b5b]" />
              1. Photographic Evidence
            </span>
            <span className="text-[11px] font-normal text-[#14213d]/60 dark:text-[#f4ede0]/60">
              Max 5 MB • Auto-resized
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageSelected}
          />

          {imagePreview ? (
            <div className="relative rounded-[20px] overflow-hidden border border-[#14213d]/15 dark:border-white/15 bg-[#14213d] flex items-center justify-center max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Civic issue photograph"
                className="w-full h-full object-contain max-h-72"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-[#14213d]/80 hover:bg-[#991b1b] text-white transition-colors shadow-md"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#14213d]/20 dark:border-white/20 hover:border-[#ff6b5b] rounded-[20px] p-8 flex flex-col items-center justify-center cursor-pointer bg-[#f4ede0]/40 dark:bg-white/[0.02] hover:bg-[#ff6b5b]/5 transition-all group min-h-[160px]"
            >
              <div className="w-14 h-14 rounded-full bg-[#e6dcce] dark:bg-white/10 text-[#14213d] dark:text-[#f4ede0] flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-[#ff6b5b] group-hover:text-[#14213d] transition-all">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-[#14213d] dark:text-[#f4ede0] mb-1">
                Take Photo or Browse Gallery
              </span>
              <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 text-center max-w-sm">
                Gemini Multimodal automatically detects category, hazards, and infrastructure tags from your photo
              </p>
            </div>
          )}
        </div>

        {/* Issue Details: Description & Title */}
        <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider">
                2. Complaint Description
              </label>

              {/* Voice Dictation (P1) */}
              <div className="flex items-center gap-2">
                <select
                  value={speechLanguage}
                  onChange={(e) => setSpeechLanguage(e.target.value as 'en-IN' | 'ta-IN' | 'hi-IN')}
                  className="text-xs bg-[#e6dcce]/60 dark:bg-white/10 border border-[#14213d]/15 dark:border-white/15 rounded-full px-2.5 py-1 text-[#14213d] dark:text-[#f4ede0] outline-none"
                  title="Voice dictation language"
                >
                  <option value="en-IN">English</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>

                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isListening
                      ? 'bg-[#991b1b] text-white animate-pulse'
                      : 'bg-[#e6dcce] dark:bg-white/10 text-[#14213d] dark:text-[#f4ede0] hover:bg-[#d8ccbc] dark:hover:bg-white/20'
                  }`}
                  title="Voice to text"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#ff6b5b]" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, hazardous, or overflowing. English, Tamil (தமிழ்), or Hindi (हिन्दी) supported..."
              className="w-full min-h-[100px] p-4 text-sm rounded-[18px] border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d]/70 text-[#14213d] dark:text-[#f4ede0] placeholder:text-[#14213d]/40 dark:placeholder:text-[#f4ede0]/40 focus:ring-2 focus:ring-[#ff6b5b] focus:border-transparent outline-none leading-relaxed transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider mb-1.5">
              Title / Short Summary (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole outside Gandhipuram bus terminal"
              className="w-full min-h-[48px] px-4 py-2.5 text-sm rounded-[16px] border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d]/70 text-[#14213d] dark:text-[#f4ede0] placeholder:text-[#14213d]/40 dark:placeholder:text-[#f4ede0]/40 focus:ring-2 focus:ring-[#ff6b5b] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full min-h-[48px] px-4 py-2.5 text-sm rounded-[16px] border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d]/70 text-[#14213d] dark:text-[#f4ede0] focus:ring-2 focus:ring-[#ff6b5b] focus:border-transparent outline-none transition-all"
            >
              <option value="auto">✨ Let Gemini AI Decide (Recommended)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Picker Section */}
        <div className="p-6 rounded-[24px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff6b5b]" />
              3. Incident Spot in Coimbatore
            </span>
            <span className="text-xs font-mono font-medium text-[#14213d]/60 dark:text-[#f4ede0]/60">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          </label>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={(newLat, newLng, newAddr) => {
              setLatitude(newLat);
              setLongitude(newLng);
              if (newAddr) setAddress(newAddr);
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-[#14213d]/70 dark:text-[#f4ede0]/70 mb-1.5">
              Street Address / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full min-h-[48px] px-4 py-2.5 text-sm rounded-[16px] border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d]/70 text-[#14213d] dark:text-[#f4ede0] focus:ring-2 focus:ring-[#ff6b5b] focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* AI Triage Trigger Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => runTriageAnalysis()}
            disabled={analyzing || (!description.trim() && !imagePreview)}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 min-h-[48px] rounded-full font-bold text-sm text-[#14213d] bg-[#f4ede0] hover:bg-[#e6dcce] dark:bg-white/10 dark:text-[#f4ede0] dark:hover:bg-white/20 border border-[#14213d]/15 dark:border-white/15 shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#ff6b5b]" />
                <span>Running Gemini Multimodal Triage...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#ff6b5b]" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Live AI Triage Card Preview */}
        <AiTriageCard
          triage={triageResult}
          loading={analyzing}
          selectedCategory={finalCategory}
          onCategoryChange={(cat) => setFinalCategory(cat)}
          originalText={description}
        />

        {/* Optional Citizen Contact */}
        <div className="p-5 rounded-[20px] bg-[#fcf9f4] dark:bg-white/[0.04] border border-[#14213d]/10 dark:border-white/10 text-xs space-y-2">
          <label className="block font-semibold text-[#14213d] dark:text-[#f4ede0]">
            Phone / Email for SMS Status Updates (Optional)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 9842100000 or citizen@gmail.com"
            className="w-full min-h-[44px] px-4 py-2 rounded-[14px] border border-[#14213d]/15 dark:border-white/15 bg-white dark:bg-[#14213d]/70 text-[#14213d] dark:text-[#f4ede0] placeholder:text-[#14213d]/40 dark:placeholder:text-[#f4ede0]/40 outline-none text-xs focus:ring-2 focus:ring-[#ff6b5b] transition-all"
          />
        </div>

        {/* Submit Grievance Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-coral w-full inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-full font-bold text-base min-h-[52px] shadow-lg shadow-[#ff6b5b]/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Registering Grievance with Coimbatore Corporation...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Grievance to Municipal Queue</span>
              </>
            )}
          </button>
          <p className="text-xs text-[#14213d]/60 dark:text-[#f4ede0]/60 text-center mt-2.5">
            You will receive a permanent tracking code (<span className="font-mono">CR-YYYY-NNNN</span>) to monitor departmental progress.
          </p>
        </div>
      </form>
    </div>
  );
}
