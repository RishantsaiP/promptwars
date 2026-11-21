'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Layers,
  ShieldAlert,
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
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600" />
          Supervisor Actions & Triage Overrides
        </h3>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <Check className="w-3.5 h-3.5" /> Saved!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Status Update Section */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Workflow Redressal Status:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                status === s
                  ? s === 'Resolved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : s === 'In Progress'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Status History Note */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Supervisor Action Note:
        </label>
        <input
          type="text"
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="e.g. Ward 12 crew deployed with asphalt roller; repair verified."
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 2. Reassign Department */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          Reassign Municipal Department:
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value as Department)}
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Priority & Category Override */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            Priority Override:
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Category Override:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
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
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
          ⚠️ Human supervisor override active (differs from initial AI triage recommendation).
        </div>
      )}

      {/* 4. Mark Spam Flag */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isSpam}
            onChange={(e) => setIsSpam(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Flag complaint as invalid / spam</span>
        </label>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-98 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>Save Status & Supervisor Changes</span>
      </button>
    </form>
  );
}
