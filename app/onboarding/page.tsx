'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PROFILE_AVATARS } from '@/lib/domain/constants';
import { useAuthSession } from '@/components/providers/AuthSessionProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { viewer } = useAuthSession();
  const [isSaving, startSaving] = useTransition();
  const [form, setForm] = useState<{
    handle: string;
    displayName: string;
    avatar: (typeof PROFILE_AVATARS)[number];
    bio: string;
  }>({
    handle: '',
    displayName: '',
    avatar: PROFILE_AVATARS[0],
    bio: '',
  });

  useEffect(() => {
    if (!viewer) {
      router.replace('/');
      return;
    }

    if (viewer.profile) {
      router.replace('/');
    }
  }, [router, viewer]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSaving(async () => {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        window.alert(payload.error ?? 'Unable to finish onboarding.');
        return;
      }

      router.push(`/u/${payload.profile.handle}`);
      router.refresh();
    });
  }

  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-[2.5rem] border border-white/60 bg-white/90 p-8 shadow-[0_28px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-stone-500">
          First login
        </div>
        <h1 className="mt-3 font-nunito text-4xl font-extrabold text-stone-900">Build your Pinned Brews profile</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-stone-500">
          Pick the public identity people will see when you publish recipes, collect likes, and show up on the leaderboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Handle</span>
              <input
                required
                value={form.handle}
                onChange={(event) => setForm((current) => ({ ...current, handle: event.target.value.toLowerCase().replace(/\s+/g, '') }))}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="yourhandle"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-stone-700">Display name</span>
              <input
                required
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                placeholder="Your coffee alias"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-stone-700">Avatar</div>
            <div className="flex flex-wrap gap-2">
              {PROFILE_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, avatar }))}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg transition ${
                    form.avatar === avatar ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-stone-700">Bio</span>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="w-full rounded-[1.75rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="What kind of coffee are you pinning lately?"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center rounded-[1.75rem] bg-stone-950 px-5 py-4 text-base font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Finish setup'}
          </button>
        </form>
      </section>
    </main>
  );
}
