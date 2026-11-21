'use client';

import React from 'react';
import {
  Sparkles,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Languages,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { TriageResult, Category } from '@/lib/domain/types';
import { CATEGORIES } from '@/lib/domain/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

interface AiTriageCardProps {
  triage: TriageResult | null;
  loading: boolean;
  selectedCategory: Category;
  onCategoryChange: (cat: Category) => void;
  originalText?: string;
}

export function AiTriageCard({
  triage,
  loading,
  selectedCategory,
  onCategoryChange,
  originalText,
}: AiTriageCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950/10 via-slate-900/5 to-teal-950/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-lg animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-emerald-500/40 animate-spin" />
          <div className="h-4 w-48 bg-emerald-600/30 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
      </div>
    );
  }

  if (!triage) {
    return null;
  }

  const isFallback = triage.method === 'rule-based-fallback';
  const showTranslation =
    triage.detected_language &&
    !triage.detected_language.toLowerCase().includes('english') &&
    triage.cleaned_description_en &&
    originalText &&
    originalText.trim() !== triage.cleaned_description_en.trim();

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden transition-all">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

      {/* Header with AI or Fallback Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Gemini AI Triage Assessment
            </h3>
            <p className="text-[11px] text-slate-500">Autonomous Municipal Evaluation</p>
          </div>
        </div>

        {isFallback ? (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Rule-based fallback
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" />
            Gemini Live Multimodal
          </span>
        )}
      </div>

      {/* Key Diagnostic Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {/* Priority */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Priority
          </span>
          <div className="mt-1">
            <PriorityBadge priority={triage.priority} urgencyScore={triage.urgency_score} showScore />
          </div>
        </div>

        {/* Suggested SLA */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-600" />
            Target SLA
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {triage.suggested_sla_hours} Hours
          </span>
        </div>

        {/* Confidence */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Confidence
          </span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {Math.round(triage.confidence * 100)}%
          </span>
        </div>

        {/* Image Check */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-amber-600" />
            Photo Check
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize mt-1 truncate">
            {triage.image_check}
          </span>
        </div>
      </div>

      {/* Priority Reasoning */}
      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 mb-4">
        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          AI Triage Reasoning:
        </h4>
        <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
          {triage.priority_reasoning}
        </p>
      </div>

      {/* Recommended Department & Category Override Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 mb-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Assigned Department:
          </label>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white">
            {triage.department}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{triage.department_reasoning}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Category (You may override):
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {selectedCategory !== triage.category && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Custom category selected (AI proposed: {triage.category})
            </p>
          )}
        </div>
      </div>

      {/* Multilingual Translation View */}
      {showTranslation && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs mt-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            Language Detected: {triage.detected_language}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="font-semibold text-slate-500 block">Original Input:</span>
              <span className="text-slate-700 dark:text-slate-300 italic">{originalText}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">English Translation:</span>
              <span className="text-slate-900 dark:text-slate-100">{triage.cleaned_description_en}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
