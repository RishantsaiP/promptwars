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
      <div className="rounded-[28px] p-6 sm:p-7 bg-[#14213d] text-white border border-white/15 shadow-2xl relative overflow-hidden space-y-4">
        {/* Coral progress hairline animation */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-[#ff6b5b] to-transparent animate-pulse w-full" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff6b5b]/20 flex items-center justify-center text-[#ff6b5b] animate-spin">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Gemini Multimodal Triage in Progress...</h4>
            <p className="text-[11px] text-slate-300">Inspecting visual features & municipal safety risks</p>
          </div>
        </div>

        {/* Staged Skeleton Reveal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-20 bg-white/[0.06] rounded-2xl animate-pulse" />
          <div className="h-20 bg-white/[0.06] rounded-2xl animate-pulse" />
          <div className="h-20 bg-white/[0.06] rounded-2xl animate-pulse" />
        </div>
        <div className="h-16 bg-white/[0.06] rounded-2xl animate-pulse" />
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
    <div className="rounded-[28px] p-6 sm:p-7 bg-[#14213d] text-white border-2 border-[#ff6b5b]/40 shadow-2xl relative overflow-hidden transition-all">
      {/* Decorative subtle coral top hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff6b5b] to-transparent" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#ff6b5b] text-[#14213d] flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2 font-sans">
              Gemini AI Triage Assessment
            </h3>
            <p className="text-[11px] text-slate-300 font-mono">
              Municipal SLA & Urgency Diagnostic
            </p>
          </div>
        </div>

        {isFallback ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ffedd5] text-[#9a3412] border border-[#fdba74] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Rule-based fallback
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff6b5b]/20 text-[#ff6b5b] border border-[#ff6b5b]/40 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5" />
            Gemini Multimodal
          </span>
        )}
      </div>

      {/* Stage 1: Priority, SLA, Confidence & Photo Match */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Priority & Urgency Score */}
        <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Priority Rank
          </span>
          <div className="mt-1">
            <PriorityBadge priority={triage.priority} urgencyScore={triage.urgency_score} showScore />
          </div>
        </div>

        {/* Target SLA */}
        <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#ff6b5b]" />
            Target SLA
          </span>
          <span className="text-sm font-bold text-white mt-1 font-mono">
            {triage.suggested_sla_hours} Hours
          </span>
        </div>

        {/* Confidence */}
        <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#86efac]" />
            Confidence
          </span>
          <span className="text-sm font-bold text-[#86efac] mt-1 font-mono">
            {Math.round(triage.confidence * 100)}%
          </span>
        </div>

        {/* Photo Check */}
        <div className="p-3.5 rounded-2xl bg-white/[0.07] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-[#fb923c]" />
            Photo Check
          </span>
          <span className="text-xs font-bold text-slate-200 capitalize mt-1 truncate">
            {triage.image_check}
          </span>
        </div>
      </div>

      {/* Stage 2: Priority Justification Reasoning */}
      <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 mb-4">
        <h4 className="text-xs font-bold text-[#ff6b5b] mb-1 flex items-center gap-1.5 font-mono uppercase tracking-wide">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI Triage Reasoning:
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-light">
          {triage.priority_reasoning}
        </p>
      </div>

      {/* Stage 3: Department Recommendation & Category Override */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 mb-2">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1 font-mono">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Assigned Department:
          </label>
          <div className="p-3 rounded-xl bg-white/[0.08] text-xs font-bold text-white border border-white/10">
            {triage.department}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-light">{triage.department_reasoning}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Category (You may override):
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
            className="w-full p-3 rounded-xl border border-white/20 bg-[#0c1322] text-xs font-semibold text-white focus:ring-2 focus:ring-[#ff6b5b] outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {selectedCategory !== triage.category && (
            <p className="text-[11px] text-[#ff6b5b] font-medium mt-1">
              Custom override: {selectedCategory} (AI proposed: {triage.category})
            </p>
          )}
        </div>
      </div>

      {/* Multilingual Translation View */}
      {showTranslation && (
        <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 text-xs mt-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1 font-mono">
            <Languages className="w-3.5 h-3.5 text-[#ff6b5b]" />
            Detected Language: {triage.detected_language}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="font-semibold text-slate-400 block">Original Input:</span>
              <span className="text-slate-300 italic">{originalText}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 block">Cleaned English Translation:</span>
              <span className="text-white">{triage.cleaned_description_en}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
