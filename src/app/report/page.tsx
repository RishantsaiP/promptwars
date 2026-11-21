'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Send,
  Loader2,
  Info,
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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      {/* Title & Introductory Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Report a Civic Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Coimbatore Municipal Corporation • Potholes, sanitation, water leakage, streetlights
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload & Camera Section */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>1. Photographic Evidence</span>
            <span className="text-[11px] font-normal text-slate-500">Max 5 MB • Auto-resized</span>
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
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center max-h-72">
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
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:bg-emerald-50/30 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Take Photo or Browse Gallery
              </span>
              <p className="text-[11px] text-slate-500 text-center">
                Gemini will inspect visual features to automatically estimate category and severity
              </p>
            </div>
          )}
        </div>

        {/* Issue Details: Description & Title */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                2. Complaint Description
              </label>

              {/* Voice Dictation (P1) */}
              <div className="flex items-center gap-1.5">
                <select
                  value={speechLanguage}
                  onChange={(e) => setSpeechLanguage(e.target.value as 'en-IN' | 'ta-IN' | 'hi-IN')}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                  title="Voice dictation language"
                >
                  <option value="en-IN">English</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>

                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                  }`}
                  title="Voice to text"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, hazardous, or overflowing. English, Tamil (தமிழ்), or Hindi (हिन्दी) supported..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1">
              Title / Short Summary (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole outside Gandhipuram bus terminal"
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              3. Incident Spot in Coimbatore
            </span>
            <span className="text-[11px] font-mono font-normal text-slate-500">
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Street Address / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 shadow-md disabled:opacity-50 active:scale-95 transition-all"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini Multimodal Triage...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
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
        <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Phone / Email for SMS Status Updates (Optional)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 9842100000 or citizen@gmail.com"
            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none text-xs"
          />
        </div>

        {/* Submit Grievance Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-105 shadow-xl shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
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
          <p className="text-[11px] text-slate-500 text-center mt-2">
            You will receive a permanent tracking code (CR-YYYY-NNNN) to monitor departmental progress.
          </p>
        </div>
      </form>
    </div>
  );
}
