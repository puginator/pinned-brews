'use client';

import { motion } from 'motion/react';
import { Trophy, Heart, Flame, Medal } from 'lucide-react';
import type { FeedPost, LeaderboardEntry } from '@/lib/domain/types';

type LeaderboardPageClientProps = {
  topUsers: LeaderboardEntry[];
  topBrews: FeedPost[];
};

export function LeaderboardPageClient({ topUsers, topBrews }: LeaderboardPageClientProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-12 text-center">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
          <h1 className="mb-4 flex items-center justify-center gap-3 font-nunito text-4xl font-extrabold tracking-tight text-stone-800 sm:text-5xl">
            <Trophy className="h-10 w-10 text-amber-500" />
            Leaderboard
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-stone-500">
            The most consistent brewers and the recipes the community keeps pinning to the top.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[2rem] border border-amber-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <h2 className="mb-6 flex items-center gap-2 font-nunito text-2xl font-bold text-stone-800">
            <Medal className="h-6 w-6 text-amber-500" />
            Top Brewers
          </h2>

          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.profile.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 transition-colors hover:border-amber-200">
                <div className="w-8 text-center text-lg font-black text-stone-400">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                  {user.profile.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-800">{user.profile.displayName}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
                    <span>
                      {user.stats.currentRank.icon} {user.stats.currentRank.name}
                    </span>
                    {user.stats.streak > 0 ? (
                      <span className="flex items-center text-orange-500">
                        • {user.stats.streak} <Flame className="ml-0.5 h-3 w-3" />
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-pink-500">{user.stats.totalXp}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">XP</div>
                </div>
              </div>
            ))}

            {topUsers.length === 0 ? <div className="py-8 text-center text-stone-500">No brewers yet!</div> : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2rem] border border-pink-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <h2 className="mb-6 flex items-center gap-2 font-nunito text-2xl font-bold text-stone-800">
            <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
            Most Loved Brews
          </h2>

          <div className="space-y-4">
            {topBrews.map((post, index) => (
              <div key={post.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 transition-colors hover:border-pink-200">
                <div className="w-8 text-center text-lg font-black text-stone-400">#{index + 1}</div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 text-2xl shadow-sm ${post.color}`}>
                  {post.author.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-stone-800">{post.coffeeName}</h3>
                  <p className="truncate text-sm text-stone-500">
                    by {post.author.displayName} • {post.roaster.name}
                  </p>
                </div>
                <div className="rounded-xl bg-pink-50 px-3 py-2 text-right">
                  <div className="flex items-center gap-1 text-xl font-black text-pink-500">
                    {post.likesCount} <Heart className="h-4 w-4 fill-pink-500" />
                  </div>
                </div>
              </div>
            ))}

            {topBrews.length === 0 ? <div className="py-8 text-center text-stone-500">No brews yet!</div> : null}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
