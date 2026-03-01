'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import type { FeedPost, Viewer } from '@/lib/domain/types';
import { PostItNote } from '@/components/PostItNote';
import { ReportDialog } from '@/components/ReportDialog';

export function HomePageClient({
  initialPosts,
  viewer,
}: {
  initialPosts: FeedPost[];
  viewer: Viewer;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [roasterFilter, setRoasterFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const roasterOptions = useMemo(
    () => Array.from(new Set(posts.map((post) => post.roaster.name))).sort(),
    [posts],
  );
  const countryOptions = useMemo(
    () => Array.from(new Set(posts.map((post) => post.country).filter(Boolean))).sort() as string[],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (roasterFilter !== 'all' && post.roaster.name !== roasterFilter) {
        return false;
      }

      if (countryFilter !== 'all' && post.country !== countryFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        post.coffeeName.toLowerCase().includes(normalizedQuery) ||
        post.roaster.name.toLowerCase().includes(normalizedQuery) ||
        post.author.handle.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [countryFilter, deferredQuery, posts, roasterFilter]);

  async function handleLike(postId: string) {
    if (!viewer?.profile) {
      window.alert('Sign in to like brews.');
      return;
    }

    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      window.alert('Unable to update that like right now.');
      return;
    }

    const payload = await response.json();

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, likedByViewer: payload.liked, likesCount: payload.likes } : post,
      ),
    );
  }

  async function submitReport(reason: string, details: string) {
    if (!reportingPostId) {
      return;
    }

    setIsSubmittingReport(true);

    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetType: 'post',
        targetId: reportingPostId,
        reason,
        details,
      }),
    });

    setIsSubmittingReport(false);

    if (!response.ok) {
      window.alert('Unable to submit that report.');
      return;
    }

    setReportingPostId(null);
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-10 shadow-[0_28px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_34%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/85 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-stone-500">
              Public Brew Journal
            </div>
            <h1 className="font-nunito text-4xl font-extrabold tracking-tight text-stone-900 sm:text-6xl">
              Pin your best brews. Discover what coffee people are actually making.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-stone-600 sm:text-lg">
              Pinned Brews turns personal recipes into a shared coffee map. Save your dial-ins, scout new roasters, and watch the leaderboard move in real time.
            </p>

            {!viewer?.profile ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                <ShieldAlert className="h-4 w-4" />
                Sign in to post, like, and build your brew profile.
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-[2rem] border border-stone-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <label className="relative flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-11 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
              placeholder="Search coffee, roaster, or handle..."
            />
          </label>

          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-stone-500">
            <Filter className="h-4 w-4" />
            Filter
          </div>

          <select
            value={roasterFilter}
            onChange={(event) => setRoasterFilter(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
          >
            <option value="all">All roasters</option>
            {roasterOptions.map((roaster) => (
              <option key={roaster} value={roaster}>
                {roaster}
              </option>
            ))}
          </select>

          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300 focus:bg-white"
          >
            <option value="all">All origins</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div key={post.id} layout>
                <PostItNote
                  post={post}
                  onLike={handleLike}
                  onReport={(id) => {
                    if (!viewer?.profile) {
                      window.alert('Sign in to report posts.');
                      return;
                    }

                    setReportingPostId(id);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {filteredPosts.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-stone-300 bg-white/60 px-8 py-12 text-center">
            <div className="text-4xl">☕</div>
            <h2 className="mt-4 font-nunito text-2xl font-bold text-stone-800">Nothing matched this brew hunt.</h2>
            <p className="mt-2 text-sm font-medium text-stone-500">Try loosening the filters or searching for another roaster.</p>
          </div>
        ) : null}
      </main>

      <ReportDialog
        open={Boolean(reportingPostId)}
        targetLabel="post"
        isSubmitting={isSubmittingReport}
        onClose={() => setReportingPostId(null)}
        onSubmit={submitReport}
      />
    </>
  );
}

