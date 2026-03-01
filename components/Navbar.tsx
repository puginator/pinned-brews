'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Coffee, LogIn, LogOut, Mail, Map, PencilLine, PlusCircle, Shield, Trophy } from 'lucide-react';
import { APP_NAME } from '@/lib/domain/constants';
import { useAuthSession } from '@/components/providers/AuthSessionProvider';

export function Navbar() {
  const { viewer, signInWithMagicLink, signOut } = useAuthSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleMagicLink(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await signInWithMagicLink(email);
      if (result.error) {
        setAuthNotice(result.error);
        return;
      }

      setAuthNotice('Magic link sent. Check your inbox.');
      setEmail('');
    });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/70 bg-amber-50/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-[1.35rem] bg-stone-950 p-3 text-white shadow-lg transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-stone-400">Pinned coffee social</div>
              <div className="font-nunito text-2xl font-extrabold tracking-tight text-stone-900">{APP_NAME}</div>
            </div>
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/roasters" className="text-sm font-bold text-stone-600 transition hover:text-stone-900">
              Roasters
            </Link>
            <Link href="/leaderboard" className="text-sm font-bold text-stone-600 transition hover:text-stone-900">
              Leaderboard
            </Link>
            <Link href="/achievements" className="text-sm font-bold text-stone-600 transition hover:text-stone-900">
              Achievements
            </Link>
            {viewer?.profile ? (
              <Link href="/new" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800">
                <PlusCircle className="h-4 w-4" />
                Log Brew
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {viewer?.profile ? (
              <>
                <Link
                  href={`/u/${viewer.profile.handle}`}
                  className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300 sm:inline-flex"
                >
                  <span className="text-lg">{viewer.profile.avatar}</span>
                  @{viewer.profile.handle}
                </Link>
                {viewer.profile.role === 'admin' ? (
                  <Link href="/admin" className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-900">
                    <Shield className="inline h-3.5 w-3.5" /> Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : viewer ? (
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-800">
                <PencilLine className="h-4 w-4" />
                Finish setup
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthNotice(null);
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-800"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showAuthModal ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.18)]"
            >
              <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#111827,#334155)] px-5 py-5 text-white">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                  Join Pinned Brews
                </div>
                <h2 className="mt-3 font-nunito text-3xl font-extrabold">Build your brew profile</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-white/70">
                  Use a magic link to publish recipes, like brews, report issues, and keep your coffee identity portable.
                </p>
              </div>

              <form onSubmit={handleMagicLink} className="mt-5 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-stone-700">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-11 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Mail className="h-4 w-4" />
                  Send magic link
                </button>
              </form>

              {authNotice ? <p className="mt-4 text-sm font-medium text-stone-500">{authNotice}</p> : null}

              <div className="mt-5 flex gap-3">
                <Link href="/roasters" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-200">
                  <Map className="h-4 w-4" />
                  Explore roasters
                </Link>
                <Link href="/leaderboard" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-200">
                  <Trophy className="h-4 w-4" />
                  See leaders
                </Link>
                <Link href="/achievements" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-200">
                  <Award className="h-4 w-4" />
                  Badges
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold text-stone-500 transition hover:bg-stone-100"
              >
                Close
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
