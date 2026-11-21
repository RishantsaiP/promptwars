'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Building2,
  AlertTriangle,
  Layers,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import type { Issue, Status, Priority, Department, Category } from '@/lib/domain/types';
import { STATUSES, PRIORITIES, DEPARTMENTS, CATEGORIES } from '@/lib/domain/types';

export function IssueActionPanel({ issue }: { issue: Issue }) {
  const router = useRouter();

  const [status, setStatus] = useState<Status>(issue.status);
  const [statusNote, setStatusNote] = useState('');
  const [department, setDepartment] = useState<Department>(issue.final_department);
  const [priority, setPriority] = useState<Priority>(issue.final_priority);
  const [category, setCategory] = useState<Category>(issue.final_category);
  const [isSpam, setIsSpam] = useState(issue.is_spam);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          status_note: statusNote.trim() || undefined,
          final_department: department,
          final_priority: priority,
          final_category: category,
          is_spam: isSpam,
          actor: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update issue');
      }

      setSavedSuccess(true);
      setStatusNote('');
      setTimeout(() => setSavedSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving updates';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const isOverride =
    priority !== issue.ai_analysis?.priority ||
    category !== issue.ai_analysis?.category ||
    department !== issue.ai_analysis?.department;

  return (
    <form
      onSubmit={handleSave}
      className="p-6 rounded-[24px] bg-white dark:bg-[#14213d] border border-[#14213d]/15 dark:border-white/15 shadow-md space-y-5"
    >
      <div className="flex items-center justify-between border-b border-[#14213d]/10 dark:border-white/10 pb-3">
        <h3 className="font-bold text-xs text-[#14213d] dark:text-[#f4ede0] uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#ff6b5b]" />
          Supervisor Actions & Triage Overrides
        </h3>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] bg-[#166534]/10 px-2.5 py-0.5 rounded-full border border-[#166534]/30">
            <Check className="w-3.5 h-3.5" /> Saved!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-full bg-[#991b1b]/10 text-[#991b1b] dark:text-[#fca5a5] text-xs flex items-center gap-2 border border-[#991b1b]/30">
          <AlertTriangle className="w-4 h-4 text-[#991b1b]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Status Update Section */}
      <div>
        <label className="block text-xs font-bold text-[#14213d]/80 dark:text-[#f4ede0]/80 mb-2">
          Workflow Redressal Status:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 px-3 rounded-full text-xs font-bold border text-center transition-all ${
                status === s
                  ? s === 'Resolved'
                    ? 'bg-[#166534] text-white border-[#166534] shadow-sm'
                    : s === 'In Progress'
                    ? 'bg-[#ff6b5b] text-[#14213d] border-[#ff6b5b] shadow-sm'
                    : 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                  : 'bg-[#f4ede0]/40 dark:bg-white/5 text-[#14213d] dark:text-[#f4ede0] border-[#14213d]/15 dark:border-white/15 hover:border-[#ff6b5b]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Status History Note */}
      <div>
        <label className="block text-xs font-bold text-[#14213d]/80 dark:text-[#f4ede0]/80 mb-1.5">
          Supervisor Action Note:
        </label>
        <input
          type="text"
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="e.g. Ward 12 crew deployed with asphalt roller; repair verified."
          className="w-full p-2.5 px-3.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-[#f4ede0]/30 dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] outline-none focus:ring-2 focus:ring-[#ff6b5b]"
        />
      </div>

      {/* 2. Reassign Department */}
      <div>
        <label className="block text-xs font-bold text-[#14213d]/80 dark:text-[#f4ede0]/80 mb-1.5 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-[#ff6b5b]" />
          Reassign Municipal Department:
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value as Department)}
          className="w-full p-2.5 px-3.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-[#f4ede0]/30 dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] outline-none"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Priority & Category Override */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#14213d]/10 dark:border-white/10">
        <div>
          <label className="block text-xs font-bold text-[#14213d]/80 dark:text-[#f4ede0]/80 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ff6b5b]" />
            Priority Override:
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full p-2.5 px-3.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-[#f4ede0]/30 dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14213d]/80 dark:text-[#f4ede0]/80 mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#ff6b5b]" />
            Category Override:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full p-2.5 px-3.5 text-xs rounded-full border border-[#14213d]/15 dark:border-white/15 bg-[#f4ede0]/30 dark:bg-black/30 text-[#14213d] dark:text-[#f4ede0] outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isOverride && (
        <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
          ⚠️ Human supervisor override active (differs from initial AI triage recommendation).
        </div>
      )}

      {/* 4. Mark Spam Flag */}
      <div className="flex items-center justify-between pt-2 border-t border-[#14213d]/10 dark:border-white/10 text-xs">
        <label className="font-semibold text-[#14213d]/80 dark:text-[#f4ede0]/80 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSpam}
            onChange={(e) => setIsSpam(e.target.checked)}
            className="rounded text-[#ff6b5b] focus:ring-[#ff6b5b]"
          />
          <span>Flag complaint as invalid / spam</span>
        </label>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving}
        className="btn-coral w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-xs min-h-[46px] shadow-md shadow-[#ff6b5b]/20 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>Save Status & Supervisor Changes</span>
      </button>
    </form>
  );
}
