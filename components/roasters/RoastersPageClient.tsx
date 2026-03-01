'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, MapPin, PlusCircle, Stamp } from 'lucide-react';
import type { RoasterPassportCard, Viewer } from '@/lib/domain/types';
import { ReportDialog } from '@/components/ReportDialog';
import { slugify } from '@/lib/utils';

function sortRoastersByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
}

export function RoastersPageClient({
  initialRoasters,
  viewer,
}: {
  initialRoasters: RoasterPassportCard[];
  viewer: Viewer;
}) {
  async function readPayload(response: Response) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return { error: text.startsWith('<!DOCTYPE') ? 'The server returned an unexpected HTML error page.' : text };
  }

  function formatIssues(issues?: { fieldErrors?: Record<string, string[] | undefined> }) {
    const entries = Object.entries(issues?.fieldErrors ?? {}).flatMap(([field, messages]) =>
      (messages ?? []).map((message) => `${field}: ${message}`),
    );
    return entries.length > 0 ? entries.join('\n') : null;
  }

  const [roasters, setRoasters] = useState(initialRoasters);
  const [reportingRoasterId, setReportingRoasterId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [form, setForm] = useState({
    name: '',
    location: '',
    ethos: '',
    equipment: '',
    logo: '📍',
    website: '',
  });

  useEffect(() => {
    setRoasters(sortRoastersByName(initialRoasters));
  }, [initialRoasters]);

  async function submitReport(reason: string, details: string) {
    if (!reportingRoasterId) {
      return;
    }

    setSubmittingReport(true);
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetType: 'roaster',
        targetId: reportingRoasterId,
        reason,
        details,
      }),
    });
    setSubmittingReport(false);

    if (!response.ok) {
      window.alert('Unable to submit that roaster report.');
      return;
    }

    setReportingRoasterId(null);
  }

  async function submitRoaster(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSaving(async () => {
      const response = await fetch('/api/roasters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = await readPayload(response);

      if (!response.ok) {
        const detail = formatIssues(payload.issues);
        window.alert(detail ? `${payload.error ?? 'Unable to add that roaster.'}\n\n${detail}` : payload.error ?? 'Unable to add that roaster.');
        return;
      }

      setRoasters((current) =>
        sortRoastersByName([
          {
            ...payload.roaster,
            communityFavorites: [],
            postCount: 0,
            pinnedByViewer: false,
          },
          ...current,
        ]),
      );
      setShowAddModal(false);
      setForm({
        name: '',
        location: '',
        ethos: '',
        equipment: '',
        logo: '📍',
        website: '',
      });
    });
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-[2.5rem] border border-white/60 bg-white/85 px-6 py-10 shadow-[0_28px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-stone-500">
                Roaster map
              </div>
              <h1 className="mt-3 font-nunito text-4xl font-extrabold text-stone-900 sm:text-5xl">Discover roasters. Add the ones your city is missing.</h1>
              <p className="mt-3 text-sm font-medium leading-6 text-stone-500 sm:text-base">
                Pinned Brews treats the coffee scene like a living passport. The more recipes the community logs, the clearer each roaster&apos;s personality becomes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!viewer?.profile) {
                  window.alert('Sign in to add roasters.');
                  return;
                }

                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              <PlusCircle className="h-4 w-4" />
              Add a roaster
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {roasters.map((roaster, index) => (
            <motion.article
              key={roaster.id}
              id={slugify(roaster.name)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="relative scroll-mt-28 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm"
            >
              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-stone-500">
                <Stamp className="h-3.5 w-3.5" />
                {roaster.pinnedByViewer ? 'Pinned' : 'Open'}
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-stone-100 text-3xl">{roaster.logo}</div>
                <div className="min-w-0 flex-1 pr-12">
                  <div className="flex items-center gap-2">
                    <h2 className="font-nunito text-2xl font-extrabold text-stone-900">{roaster.name}</h2>
                    {roaster.website ? (
                      <a
                        href={roaster.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 transition hover:text-sky-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-stone-500">
                    <MapPin className="h-4 w-4" />
                    {roaster.location}
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium leading-6 text-stone-600">{roaster.ethos}</p>
              <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4 text-sm font-medium text-stone-600">
                <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Equipment</span>
                {roaster.equipment}
              </div>

              {roaster.communityFavorites.length > 0 ? (
                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Community favorites</div>
                  <div className="flex flex-wrap gap-2">
                    {roaster.communityFavorites.map((favorite) => (
                      <span key={favorite} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                        {favorite}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-between border-t border-dashed border-stone-200 pt-4">
                <div className="text-sm font-bold text-stone-500">{roaster.postCount} pinned brews</div>
                <button
                  type="button"
                  onClick={() => {
                    if (!viewer?.profile) {
                      window.alert('Sign in to report roasters.');
                      return;
                    }
                    setReportingRoasterId(roaster.id);
                  }}
                  className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-rose-700 transition hover:bg-rose-100"
                >
                  Report
                </button>
              </div>
            </motion.article>
          ))}
        </section>
      </main>

      {showAddModal ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <form onSubmit={submitRoaster} className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_28px_100px_rgba(15,23,42,0.18)]">
            <h3 className="font-nunito text-2xl font-extrabold text-stone-900">Add a roaster</h3>
            <p className="mt-2 text-sm font-medium text-stone-500">Add the places the community should be pinning next.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Roaster name"
              />
              <input
                required
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Location"
              />
              <input
                required
                value={form.equipment}
                onChange={(event) => setForm((current) => ({ ...current, equipment: event.target.value }))}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white sm:col-span-2"
                placeholder="Equipment"
              />
              <textarea
                required
                rows={4}
                value={form.ethos}
                onChange={(event) => setForm((current) => ({ ...current, ethos: event.target.value }))}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white sm:col-span-2"
                placeholder="What makes this roaster worth pinning?"
              />
              <input
                value={form.logo}
                onChange={(event) => setForm((current) => ({ ...current, logo: event.target.value }))}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Logo emoji"
              />
              <input
                value={form.website}
                onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Website"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save roaster'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ReportDialog
        open={Boolean(reportingRoasterId)}
        targetLabel="roaster"
        isSubmitting={submittingReport}
        onClose={() => setReportingRoasterId(null)}
        onSubmit={submitReport}
      />
    </>
  );
}
