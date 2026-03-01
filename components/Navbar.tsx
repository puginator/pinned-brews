'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Coffee, LogIn, LogOut, Mail, Map, Menu, PencilLine, PlusCircle, Shield, Trophy, X } from 'lucide-react';
import { APP_NAME } from '@/lib/domain/constants';
import { useAuthSession } from '@/components/providers/AuthSessionProvider';

export function Navbar() {
  const { viewer, signInWithMagicLink, signOut } = useAuthSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [email, setEmail] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const primaryLinks = [
    { href: '/roasters', label: 'Roasters' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/achievements', label: 'Achievements' },
  ];

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
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="rounded-[1.35rem] bg-stone-950 p-3 text-white shadow-lg transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
              <Coffee className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-stone-400">Pinned coffee social</div>
              <div className="truncate font-nunito text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">{APP_NAME}</div>
            </div>
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-bold text-stone-600 transition hover:text-stone-900">
                {link.label}
              </Link>
            ))}
            {viewer?.profile ? (
              <Link href="/new" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800">
                <PlusCircle className="h-4 w-4" />
                Log Brew
              </Link>
            ) : null}
          </div>

          <div className="hidden items-center gap-3 md:flex">
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

          <div className="flex items-center gap-2 md:hidden">
            {viewer?.profile ? (
              <Link
                href={`/u/${viewer.profile.handle}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-lg shadow-sm"
                aria-label="Open profile"
              >
                {viewer.profile.avatar}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setShowMobileNav(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-white shadow-lg transition hover:bg-stone-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showMobileNav ? (
          <div className="fixed inset-0 z-[110] md:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileNav(false)}
              className="absolute inset-0 bg-stone-950/45 backdrop-blur-sm"
              aria-label="Close navigation menu"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 flex h-full w-[min(86vw,24rem)] flex-col border-l border-white/70 bg-[linear-gradient(180deg,#fffef7_0%,#ffffff_46%,#f8fafc_100%)] p-5 shadow-[0_30px_120px_rgba(15,23,42,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.28em] text-stone-400">Pinned coffee social</div>
                  <div className="mt-1 font-nunito text-3xl font-extrabold text-stone-900">{APP_NAME}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileNav(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-700"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-[1.8rem] border border-stone-200 bg-white/80 p-4 shadow-sm">
                {viewer?.profile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-2xl text-white shadow-lg">
                      {viewer.profile.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-nunito text-xl font-extrabold text-stone-900">{viewer.profile.displayName}</div>
                      <div className="text-sm font-bold text-stone-500">@{viewer.profile.handle}</div>
                    </div>
                  </div>
                ) : viewer ? (
                  <div>
                    <div className="font-nunito text-2xl font-extrabold text-stone-900">Finish your setup</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-stone-500">Pick your handle and avatar to unlock posting, likes, and profile progress.</p>
                  </div>
                ) : (
                  <div>
                    <div className="font-nunito text-2xl font-extrabold text-stone-900">Join the coffee map</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-stone-500">Sign in with a magic link to log brews, track badges, and build your public profile.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="px-1 text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">Explore</div>
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between rounded-[1.4rem] border border-stone-200 bg-white px-4 py-4 text-base font-bold text-stone-800 shadow-sm transition hover:border-stone-300"
                  >
                    <span>{link.label}</span>
                    <span className="text-stone-300">/</span>
                  </Link>
                ))}
                {viewer?.profile ? (
                  <Link
                    href="/new"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center gap-3 rounded-[1.4rem] bg-stone-950 px-4 py-4 text-base font-bold text-white shadow-lg transition hover:bg-stone-800"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Log Brew
                  </Link>
                ) : null}
              </div>

              <div className="mt-auto space-y-3 pt-6">
                {viewer?.profile ? (
                  <>
                    <Link
                      href={`/u/${viewer.profile.handle}`}
                      onClick={() => setShowMobileNav(false)}
                      className="flex items-center gap-3 rounded-[1.4rem] border border-stone-200 bg-white px-4 py-4 text-base font-bold text-stone-800 shadow-sm"
                    >
                      <Award className="h-5 w-5 text-amber-500" />
                      View Profile
                    </Link>
                    {viewer.profile.role === 'admin' ? (
                      <Link
                        href="/admin"
                        onClick={() => setShowMobileNav(false)}
                        className="flex items-center gap-3 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4 text-base font-bold text-amber-900 shadow-sm"
                      >
                        <Shield className="h-5 w-5" />
                        Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={async () => {
                        setShowMobileNav(false);
                        await signOut();
                      }}
                      className="flex w-full items-center gap-3 rounded-[1.4rem] bg-stone-100 px-4 py-4 text-left text-base font-bold text-stone-700"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </>
                ) : viewer ? (
                  <Link
                    href="/onboarding"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center gap-3 rounded-[1.4rem] bg-stone-950 px-4 py-4 text-base font-bold text-white shadow-lg"
                  >
                    <PencilLine className="h-5 w-5" />
                    Finish setup
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileNav(false);
                      setAuthNotice(null);
                      setShowAuthModal(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-[1.4rem] bg-stone-950 px-4 py-4 text-left text-base font-bold text-white shadow-lg"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign in
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

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
