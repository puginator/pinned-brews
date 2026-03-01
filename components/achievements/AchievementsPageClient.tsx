'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import type { AchievementProgress, Viewer } from '@/lib/domain/types';

type AchievementsPageClientProps = {
  achievements: AchievementProgress[];
  viewer: Viewer;
};

const CATEGORY_META = {
  milestone: {
    label: 'Milestones',
    eyebrow: 'Build the habit',
    card: 'border-amber-200 bg-amber-50/70',
    pill: 'bg-amber-100 text-amber-900',
    bar: 'from-amber-400 to-orange-400',
  },
  discovery: {
    label: 'Discovery',
    eyebrow: 'Go broader',
    card: 'border-sky-200 bg-sky-50/70',
    pill: 'bg-sky-100 text-sky-900',
    bar: 'from-sky-400 to-cyan-400',
  },
  craft: {
    label: 'Craft',
    eyebrow: 'Sharpen technique',
    card: 'border-stone-200 bg-white/90',
    pill: 'bg-stone-900 text-white',
    bar: 'from-stone-700 to-stone-900',
  },
  community: {
    label: 'Community',
    eyebrow: 'Earn attention',
    card: 'border-rose-200 bg-rose-50/70',
    pill: 'bg-rose-100 text-rose-900',
    bar: 'from-rose-400 to-pink-400',
  },
  rhythm: {
    label: 'Rhythm',
    eyebrow: 'Stay consistent',
    card: 'border-lime-200 bg-lime-50/70',
    pill: 'bg-lime-100 text-lime-900',
    bar: 'from-lime-400 to-emerald-400',
  },
  flavor: {
    label: 'Flavor',
    eyebrow: 'Develop taste',
    card: 'border-fuchsia-200 bg-fuchsia-50/70',
    pill: 'bg-fuchsia-100 text-fuchsia-900',
    bar: 'from-fuchsia-400 to-violet-400',
  },
} as const;

const CATEGORY_ORDER = ['milestone', 'discovery', 'craft', 'community', 'rhythm', 'flavor'] as const;

export function AchievementsPageClient({ achievements, viewer }: AchievementsPageClientProps) {
  const earnedCount = achievements.filter((achievement) => achievement.earned).length;
  const completion = achievements.length > 0 ? Math.round((earnedCount / achievements.length) * 100) : 0;
  const nextUp = achievements
    .filter((achievement) => !achievement.earned)
    .sort((left, right) => right.progress / right.target - left.progress / left.target)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-[2.6rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.18),_transparent_30%),linear-gradient(135deg,#111827,#1f2937_55%,#374151)] px-6 py-8 text-white shadow-[0_40px_120px_rgba(17,24,39,0.24)] sm:px-10 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-white/70">
            <Award className="h-3.5 w-3.5" />
            Achievement Almanac
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="font-nunito text-4xl font-extrabold tracking-tight sm:text-5xl">Every badge you can earn on Pinned Brews.</h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                Build streaks, explore roasters, sharpen your palate, and earn social proof. This is the full badge catalog plus your live progress.
              </p>
              {!viewer?.profile ? (
                <div className="mt-6 inline-flex items-center gap-3 rounded-[1.6rem] border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white/80">
                  <Lock className="h-4 w-4" />
                  Sign in to track your badge progress across the full board.
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Unlocked" value={`${earnedCount}/${achievements.length}`} accent="text-amber-200" />
              <MetricCard label="Completion" value={`${completion}%`} accent="text-rose-200" />
              <MetricCard label="Next Up" value={nextUp[0]?.icon ?? '—'} accent="text-sky-200" />
            </div>
          </div>
        </motion.div>
      </section>

      {viewer?.profile && nextUp.length > 0 ? (
        <section className="mt-8 rounded-[2.2rem] border border-stone-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-stone-500">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Closest Unlocks
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {nextUp.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[1.8rem] border border-stone-200 bg-stone-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-3xl">{achievement.icon}</div>
                    <h2 className="mt-3 font-nunito text-2xl font-extrabold text-stone-900">{achievement.name}</h2>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-stone-500">
                    {Math.round((achievement.progress / achievement.target) * 100)}%
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-stone-600">{achievement.description}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#111827,#f59e0b)] transition-all"
                    style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-3 text-sm font-bold text-stone-500">{achievement.progressLabel}</div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 space-y-8">
        {CATEGORY_ORDER.map((category, sectionIndex) => {
          const meta = CATEGORY_META[category];
          const items = achievements.filter((achievement) => achievement.category === category);

          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
              className="rounded-[2.2rem] border border-white/70 bg-white/82 p-6 shadow-sm backdrop-blur-xl sm:p-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] ${meta.pill}`}>
                    {meta.eyebrow}
                  </div>
                  <h2 className="mt-3 font-nunito text-3xl font-extrabold text-stone-900">{meta.label}</h2>
                </div>
                <div className="text-sm font-bold text-stone-500">
                  {items.filter((item) => item.earned).length}/{items.length} unlocked
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((achievement) => {
                  const percent = Math.min((achievement.progress / achievement.target) * 100, 100);

                  return (
                    <article
                      key={achievement.id}
                      className={`relative overflow-hidden rounded-[1.85rem] border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 ${meta.card} ${
                        achievement.earned ? '' : 'opacity-85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-black/5 bg-white text-3xl shadow-sm">
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className="font-nunito text-2xl font-extrabold text-stone-900">{achievement.name}</h3>
                            <p className="mt-1 text-sm font-medium leading-6 text-stone-600">{achievement.description}</p>
                          </div>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${
                            achievement.earned ? 'bg-stone-950 text-white' : 'bg-white text-stone-500'
                          }`}
                        >
                          {achievement.earned ? 'Unlocked' : 'Locked'}
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                          <span>Progress</span>
                          <span>{Math.round(percent)}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-white/75">
                          <div className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`} style={{ width: `${percent}%` }} />
                        </div>
                        <div className="mt-3 text-sm font-bold text-stone-600">{achievement.progressLabel}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </section>

      {!viewer?.profile ? (
        <section className="mt-8 rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-6 py-8 text-center shadow-sm">
          <div className="mx-auto max-w-2xl">
            <div className="font-nunito text-3xl font-extrabold text-stone-900">Sign in to start filling this board.</div>
            <p className="mt-3 text-sm font-medium leading-7 text-stone-600">
              Magic link login is enough. Once you log brews, your live progress and unlocked badges will show up automatically.
            </p>
            <div className="mt-5">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800">
                <Trophy className="h-4 w-4" />
                Back to feed
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/50">{label}</div>
      <div className={`mt-2 font-nunito text-3xl font-extrabold ${accent}`}>{value}</div>
    </div>
  );
}
