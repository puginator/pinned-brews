'use client';

import { Navbar } from '@/components/Navbar';
import { PostItNote } from '@/components/PostItNote';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { Filter, Search } from 'lucide-react';

export default function Home() {
  const { posts, likePost } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoaster, setFilterRoaster] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const uniqueRoasters = useMemo(() => {
    return Array.from(new Set(posts.map(p => p.roasterName))).sort();
  }, [posts]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(posts.map(p => p.country).filter(Boolean))).sort() as string[];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (filterRoaster !== 'all' && post.roasterName !== filterRoaster) return false;
      if (filterCountry !== 'all' && post.country !== filterCountry) return false;
      
      if (filterDate !== 'all') {
        if (filterDate === 'today' && !isToday(post.createdAt)) return false;
        if (filterDate === 'week' && !isThisWeek(post.createdAt)) return false;
        if (filterDate === 'month' && !isThisMonth(post.createdAt)) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!post.roasterName.toLowerCase().includes(q) && !post.coffeeName.toLowerCase().includes(q)) {
          return false;
        }
      }
      
      return true;
    });
  }, [posts, filterRoaster, filterCountry, filterDate, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="text-center mb-10 relative">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <h1 className="font-nunito text-4xl sm:text-5xl font-extrabold text-stone-800 mb-4 tracking-tight">
              Community Brew Board ☕
            </h1>
            <p className="text-stone-500 font-medium text-lg max-w-2xl mx-auto">
              Discover what others are brewing, steal their recipes, and share your own coffee journey.
            </p>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-4 text-4xl opacity-20 hidden md:block rotate-[-15deg]">✨</div>
          <div className="absolute bottom-0 right-4 text-4xl opacity-20 hidden md:block rotate-[15deg]">🌸</div>
        </div>

        {/* Filters & Search */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-3xl border-2 border-pink-100 shadow-sm flex-wrap">
          <div className="flex-1 min-w-[200px] w-full sm:w-auto relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roasters or coffees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-stone-200 text-stone-700 text-sm rounded-xl pl-10 pr-3 py-2 outline-none focus:border-pink-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-pink-500 font-bold mr-2">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
          
          <select 
            value={filterRoaster}
            onChange={(e) => setFilterRoaster(e.target.value)}
            className="bg-white border-2 border-stone-200 text-stone-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-pink-400 font-medium min-w-[140px]"
          >
            <option value="all">All Roasters</option>
            {uniqueRoasters.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select 
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-white border-2 border-stone-200 text-stone-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-pink-400 font-medium min-w-[140px]"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border-2 border-stone-200 text-stone-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-pink-400 font-medium min-w-[140px]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Masonry-ish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-max">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <PostItNote post={post} onLike={likePost} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredPosts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-4xl mb-4">🥺</div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">No brews found!</h3>
              <p className="text-stone-500">Try adjusting your filters to see more posts.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
