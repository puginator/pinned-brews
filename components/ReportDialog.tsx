'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X } from 'lucide-react';
import { REPORT_REASONS } from '@/lib/domain/constants';

export function ReportDialog({
  open,
  targetLabel,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  targetLabel: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void> | void;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>('Spam');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('Spam');
      setDetails('');
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_30px_120px_rgba(17,24,39,0.18)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-nunito text-2xl font-extrabold text-stone-900">Report {targetLabel}</h3>
                <p className="text-sm text-stone-500">This goes to the moderation queue.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-stone-700">Reason</span>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value as (typeof REPORT_REASONS)[number])}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-rose-300 focus:bg-white"
                >
                  {REPORT_REASONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-stone-700">Details</span>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-rose-300 focus:bg-white"
                  placeholder="Optional extra context for the admin queue."
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    void onSubmit(reason, details);
                  }}
                  className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending...' : 'Send report'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
