'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, PlusCircle, Send, Sparkles, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BREW_METHODS, FLAVOR_PROFILES, POST_COLORS, getBrewMethodMeta } from '@/lib/domain/constants';
import { BrewMethodIcon } from '@/components/BrewMethodIcon';
import type { Badge, RoasterRecord, Viewer } from '@/lib/domain/types';

export function NewBrewPageClient({
  viewer,
  roasters,
}: {
  viewer: Viewer;
  roasters: RoasterRecord[];
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

  const router = useRouter();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isGeneratingAdvice, startAdvice] = useTransition();
  const [coffeeName, setCoffeeName] = useState('');
  const [coffeeUrl, setCoffeeUrl] = useState('');
  const [roasterId, setRoasterId] = useState(roasters[0]?.id ?? '');
  const [newRoasterName, setNewRoasterName] = useState('');
  const [newRoasterLocation, setNewRoasterLocation] = useState('');
  const [newRoasterWebsite, setNewRoasterWebsite] = useState('');
  const [brewMethod, setBrewMethod] = useState<(typeof BREW_METHODS)[number]>('V60');
  const [customBrewMethod, setCustomBrewMethod] = useState('');
  const [coffeeWeight, setCoffeeWeight] = useState<number | ''>(15);
  const [waterWeight, setWaterWeight] = useState<number | ''>(250);
  const [country, setCountry] = useState('');
  const [varietal, setVarietal] = useState('');
  const [processMethod, setProcessMethod] = useState('');
  const [tasteNotes, setTasteNotes] = useState('');
  const [flavorProfiles, setFlavorProfiles] = useState<string[]>([]);
  const [rating, setRating] = useState(4.5);
  const [color, setColor] = useState<(typeof POST_COLORS)[number]>('bg-rose-100');
  const [aiAdvice, setAiAdvice] = useState('');
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const displayedMethod = brewMethod === 'Other' && customBrewMethod.trim() ? customBrewMethod.trim() : brewMethod;

  const ratio =
    coffeeWeight && waterWeight ? `1:${(Number(waterWeight) / Number(coffeeWeight)).toFixed(1)}` : '---';

  function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  if (!viewer?.profile) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-[2rem] border border-stone-200 bg-white/85 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <h1 className="font-nunito text-3xl font-extrabold text-stone-900">Sign in to log a brew</h1>
          <p className="mt-3 text-sm font-medium text-stone-500">Pinned Brews keeps publishing, likes, and reporting behind real accounts.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-700"
          >
            Back to the feed
          </Link>
        </div>
      </main>
    );
  }

  async function requestAdvice() {
    if (!tasteNotes.trim()) {
      window.alert('Add your taste notes first so Brew Coach has something real to work with.');
      return;
    }

    startAdvice(async () => {
      const response = await fetch('/api/ai/brew-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brewMethod,
          customBrewMethod,
          coffeeWeight: Number(coffeeWeight) || 0,
          waterWeight: Number(waterWeight) || 0,
          ratio,
          country,
          varietal,
          process: processMethod,
          tasteNotes,
        }),
      });

      const payload = await readPayload(response);

      if (!response.ok) {
        window.alert(payload.error ?? 'Unable to get advice right now.');
        return;
      }

      setAiAdvice(payload.advice);
    });
  }

  function toggleFlavor(flavor: string) {
    setFlavorProfiles((current) =>
      current.includes(flavor) ? current.filter((item) => item !== flavor) : [...current, flavor],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmitting(async () => {
      let finalRoasterId = roasterId;

      if (roasterId === 'new') {
        const roasterResponse = await fetch('/api/roasters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newRoasterName,
            location: newRoasterLocation,
            ethos: 'Community-submitted roaster pending its first big write-up.',
            equipment: 'Community submission',
            logo: '📍',
            website: newRoasterWebsite,
          }),
        });

        const roasterPayload = await readPayload(roasterResponse);

        if (!roasterResponse.ok) {
          const detail = formatIssues(roasterPayload.issues);
          window.alert(
            detail
              ? `${roasterPayload.error ?? 'Unable to add that roaster.'}\n\n${detail}`
              : roasterPayload.error ?? 'Unable to add that roaster.',
          );
          return;
        }

        finalRoasterId = roasterPayload.roaster.id;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coffeeName,
          coffeeUrl,
          roasterId: finalRoasterId,
          brewMethod,
          customBrewMethod,
          coffeeWeight: Number(coffeeWeight),
          waterWeight: Number(waterWeight),
          ratio,
          country,
          varietal,
          process: processMethod,
          tasteNotes,
          flavorProfiles,
          rating,
          aiAdvice,
          color,
        }),
      });

      const payload = await readPayload(response);

      if (!response.ok) {
        window.alert(payload.error ?? 'Unable to publish this brew.');
        return;
      }

      if ((payload.newlyUnlockedBadges?.length ?? 0) > 0) {
        setNewlyUnlockedBadges(payload.newlyUnlockedBadges);
        await sleep(1800);
      }

      router.push('/');
      router.refresh();
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/85 p-6 shadow-[0_26px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.26em] text-stone-500">
              New pin
            </div>
            <h1 className="mt-3 font-nunito text-4xl font-extrabold text-stone-900">Publish a brew</h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-stone-500">
              Turn a good cup into a recipe someone else can actually repeat.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-stone-950 px-4 py-3 text-right text-white shadow-lg">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/50">Ratio</div>
            <div className="mt-1 font-nunito text-2xl font-extrabold">{ratio}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {POST_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                className={`h-9 w-9 rounded-full border-2 transition ${option} ${color === option ? 'scale-110 border-stone-900' : 'border-transparent'}`}
                aria-label={`Select ${option}`}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Coffee name</span>
              <input
                required
                value={coffeeName}
                onChange={(event) => setCoffeeName(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Pink Bourbon"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Roaster</span>
              <select
                value={roasterId}
                onChange={(event) => setRoasterId(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              >
                {roasters.map((roaster) => (
                  <option key={roaster.id} value={roaster.id}>
                    {roaster.logo} {roaster.name}
                  </option>
                ))}
                <option value="new">+ Add a new roaster</option>
              </select>
            </label>
          </div>

          {roasterId === 'new' ? (
            <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-700">
                <PlusCircle className="h-4 w-4 text-sky-500" />
                New roaster details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={newRoasterName}
                  onChange={(event) => setNewRoasterName(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300"
                  placeholder="Roaster name"
                />
                <input
                  required
                  value={newRoasterLocation}
                  onChange={(event) => setNewRoasterLocation(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300"
                  placeholder="City, State"
                />
                <input
                  value={newRoasterWebsite}
                  onChange={(event) => setNewRoasterWebsite(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 sm:col-span-2"
                  placeholder="Website URL"
                />
              </div>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-stone-700">Coffee link</span>
            <input
              value={coffeeUrl}
              onChange={(event) => setCoffeeUrl(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="https://roaster.com/coffee"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Method</span>
              <select
                value={brewMethod}
                onChange={(event) => setBrewMethod(event.target.value as (typeof BREW_METHODS)[number])}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              >
                {BREW_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {getBrewMethodMeta(method).icon} {method}
                  </option>
                ))}
              </select>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-stone-600 ring-1 ring-stone-200">
                <BrewMethodIcon method={displayedMethod} size={18} />
                <span>{displayedMethod}</span>
              </div>
            </label>
            {brewMethod === 'Other' ? (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-stone-700">Custom method</span>
                <input
                  required
                  value={customBrewMethod}
                  onChange={(event) => setCustomBrewMethod(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="Origami Air, Switch, Tricolate..."
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Coffee (g)</span>
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                value={coffeeWeight}
                onChange={(event) => setCoffeeWeight(event.target.value ? Number(event.target.value) : '')}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Water (g)</span>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={waterWeight}
                onChange={(event) => setWaterWeight(event.target.value ? Number(event.target.value) : '')}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="Origin"
            />
            <input
              value={varietal}
              onChange={(event) => setVarietal(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="Varietal"
            />
            <input
              value={processMethod}
              onChange={(event) => setProcessMethod(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="Process"
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-stone-700">Flavor profile</div>
            <div className="flex flex-wrap gap-2">
              {FLAVOR_PROFILES.map((flavor) => {
                const isSelected = flavorProfiles.includes(flavor);
                return (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => toggleFlavor(flavor)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] transition ${
                      isSelected ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {flavor}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-stone-700">Taste notes</span>
            <textarea
              required
              rows={4}
              value={tasteNotes}
              onChange={(event) => setTasteNotes(event.target.value)}
              className="w-full rounded-[1.75rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="What actually happened in the cup?"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 text-sm font-bold text-stone-700">Rating</div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="relative h-8 w-8 text-stone-300 transition hover:scale-110"
                  >
                    <Star className="absolute inset-0 h-8 w-8" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: rating >= star ? '100%' : '0%' }}>
                      <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                    </div>
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-stone-500">{rating.toFixed(1)} / 5</span>
              </div>
            </div>

            <button
              type="button"
              onClick={requestAdvice}
              disabled={isGeneratingAdvice}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-5 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingAdvice ? 'Thinking...' : 'Get Brew Coach advice'}
            </button>
          </div>

          {aiAdvice ? (
            <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-stone-700">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">Brew Coach</span>
              {aiAdvice}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.75rem] bg-stone-950 px-5 py-4 text-base font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? 'Publishing...' : 'Publish brew'}
          </button>
        </form>
      </motion.section>

      <AnimatePresence>
        {newlyUnlockedBadges.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-[120] w-[min(92vw,28rem)] overflow-hidden rounded-[2rem] border border-amber-200 bg-[linear-gradient(135deg,#111827,#1f2937_55%,#334155)] p-5 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
              <Award className="h-3.5 w-3.5" />
              Achievement Unlocked
            </div>
            <h2 className="mt-3 font-nunito text-3xl font-extrabold">Fresh badge energy.</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-white/70">
              Your latest brew pushed your profile forward. Sending you back to the feed in a second.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {newlyUnlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-white"
                >
                  {badge.icon} {badge.name}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
