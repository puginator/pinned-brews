'use client';

import { Navbar } from '@/components/Navbar';
import { useAppStore, getUserStats, Post } from '@/lib/store';
import { motion } from 'motion/react';
import { Trophy, Heart, Flame, Medal } from 'lucide-react';
import { useMemo } from 'react';

export default function LeaderboardPage() {
  const { posts } = useAppStore();

  const topUsers = useMemo(() => {
    const userMap = new Map<string, { id: string, name: string, avatar: string, posts: Post[] }>();
    
    posts.forEach(p => {
      if (!userMap.has(p.userId)) {
        userMap.set(p.userId, { id: p.userId, name: p.userName, avatar: p.userAvatar, posts: [] });
      }
      userMap.get(p.userId)!.posts.push(p);
    });

    const usersWithStats = Array.from(userMap.values()).map(u => {
      const stats = getUserStats(u.id, posts);
      return { ...u, stats };
    });

    return usersWithStats.sort((a, b) => b.stats.totalXp - a.stats.totalXp).slice(0, 10);
  }, [posts]);

  const topBrews = useMemo(() => {
    return [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <h1 className="font-nunito text-4xl sm:text-5xl font-extrabold text-stone-800 mb-4 tracking-tight flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-amber-500" />
              Leaderboard
            </h1>
            <p className="text-stone-500 font-medium text-lg max-w-2xl mx-auto">
              The most dedicated brewers and the most loved recipes in the community.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Users */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-100"
          >
            <h2 className="font-nunito text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Medal className="w-6 h-6 text-amber-500" />
              Top Brewers
            </h2>
            
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 transition-colors">
                  <div className="w-8 text-center font-black text-stone-400 text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="text-4xl bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 text-lg">{user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-stone-500 font-medium">
                      <span>{user.stats.currentRank.icon} {user.stats.currentRank.name}</span>
                      {user.stats.streak > 0 && (
                        <span className="flex items-center text-orange-500">
                          • {user.stats.streak} <Flame className="w-3 h-3 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-pink-500 text-xl">{user.stats.totalXp}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">XP</div>
                  </div>
                </div>
              ))}
              
              {topUsers.length === 0 && (
                <div className="text-center py-8 text-stone-500">No brewers yet!</div>
              )}
            </div>
          </motion.div>

          {/* Top Brews */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-pink-100"
          >
            <h2 className="font-nunito text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              Most Loved Brews
            </h2>
            
            <div className="space-y-4">
              {topBrews.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-pink-200 transition-colors">
                  <div className="w-8 text-center font-black text-stone-400 text-lg">
                    #{index + 1}
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${post.color} flex items-center justify-center text-2xl shadow-sm border border-black/5`}>
                    {post.userAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 text-lg truncate">{post.coffeeName}</h3>
                    <p className="text-sm text-stone-500 truncate">by {post.userName} • {post.roasterName}</p>
                  </div>
                  <div className="text-right bg-pink-50 px-3 py-2 rounded-xl">
                    <div className="font-black text-pink-500 text-xl flex items-center gap-1">
                      {post.likes} <Heart className="w-4 h-4 fill-pink-500" />
                    </div>
                  </div>
                </div>
              ))}
              
              {topBrews.length === 0 && (
                <div className="text-center py-8 text-stone-500">No brews yet!</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
