'use client';

import Link from 'next/link';
import { useAppStore, getUserBadges, BADGES, getUserStats } from '@/lib/store';
import { Coffee, LogIn, LogOut, PlusCircle, Map, X, Award, Sparkles, Flame, Trophy } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function Navbar() {
  const { currentUser, posts, login, logout } = useAppStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loginName, setLoginName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim()) {
      login(loginName.trim());
      setIsLoginOpen(false);
      setLoginName('');
    }
  };

  const userBadges = currentUser ? getUserBadges(currentUser.id, posts) : [];
  const userStats = currentUser ? getUserStats(currentUser.id, posts) : null;
  const userPosts = currentUser ? posts.filter(p => p.userId === currentUser.id) : [];
  const uniqueRoasters = new Set(userPosts.map(p => p.roasterId)).size;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-pink-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-pink-100 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
              <Coffee className="w-6 h-6 text-pink-500" />
            </div>
            <span className="font-nunito font-bold text-xl text-stone-700 tracking-tight">
              Kawaii Brews
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/roasters" 
              className="flex items-center gap-1.5 text-stone-600 hover:text-pink-500 font-medium transition-colors"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Roasters</span>
            </Link>
            
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-1.5 text-stone-600 hover:text-amber-500 font-medium transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/new" 
                  className="flex items-center gap-1.5 bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Brew</span>
                </Link>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 bg-stone-100 hover:bg-pink-50 px-3 py-1.5 rounded-full border-2 border-stone-200 hover:border-pink-300 transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{currentUser.avatar}</span>
                  <span className="font-bold text-stone-700 text-sm">{currentUser.name}</span>
                  {userStats && userStats.streak > 0 && (
                    <span className="flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                      {userStats.streak} <Flame className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                  {userBadges.length > 0 && (
                    <span className="flex items-center justify-center bg-amber-100 text-amber-600 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                      {userBadges.length} <Award className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Profile & Achievements Modal */}
      <AnimatePresence>
        {isProfileOpen && currentUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#fdfbf7] rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-pink-200 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="text-6xl mb-2 bg-pink-100 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    {currentUser.avatar}
                  </div>
                  <h2 className="font-nunito text-3xl font-extrabold text-stone-800">
                    {currentUser.name}
                  </h2>
                  {userStats && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl">{userStats.currentRank.icon}</span>
                      <p className="text-stone-600 font-bold">{userStats.currentRank.name}</p>
                    </div>
                  )}
                </div>

                {userStats && (
                  <div className="mb-6 bg-white p-4 rounded-2xl border-2 border-stone-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Experience</div>
                        <div className="text-xl font-black text-pink-500">{userStats.totalXp} XP</div>
                      </div>
                      {userStats.nextRank && (
                        <div className="text-right">
                          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Next Rank</div>
                          <div className="text-sm font-bold text-stone-700">{userStats.xpToNextRank} XP to go</div>
                        </div>
                      )}
                    </div>
                    {userStats.nextRank && (
                      <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-pink-400 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${userStats.progressToNextRank}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-pink-500 mb-0.5">{userPosts.length}</div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Brews</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-teal-500 mb-0.5">{uniqueRoasters}</div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Roasters</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-orange-500 mb-0.5 flex items-center justify-center gap-1">
                      {userStats?.streak || 0} <Flame className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Day Streak</div>
                  </div>
                </div>

                {userStats && userStats.radarData.some(d => d.A > 0) && (
                  <div className="mb-6 bg-white p-4 rounded-2xl border-2 border-stone-100 shadow-sm">
                    <h3 className="font-nunito text-lg font-bold text-stone-800 mb-2 text-center">Flavor Profile</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={userStats.radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                          <Radar name="Flavor" dataKey="A" stroke="#f472b6" fill="#fbcfe8" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-nunito text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {BADGES.map(badge => {
                      const isEarned = userBadges.some(b => b.id === badge.id);
                      return (
                        <div 
                          key={badge.id} 
                          className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${
                            isEarned 
                              ? 'bg-white border-amber-200 shadow-sm' 
                              : 'bg-stone-50 border-stone-100 opacity-60 grayscale'
                          }`}
                        >
                          <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${isEarned ? 'bg-amber-100' : 'bg-stone-200'}`}>
                            {badge.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold text-sm ${isEarned ? 'text-stone-800' : 'text-stone-500'}`}>
                              {badge.name}
                            </h4>
                            <p className="text-xs text-stone-500 font-medium">{badge.description}</p>
                          </div>
                          {isEarned && (
                            <div className="text-amber-500">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cute Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-pink-200 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 text-6xl opacity-20 rotate-12">🌸</div>
              <div className="absolute -bottom-4 -left-4 text-6xl opacity-20 -rotate-12">☕</div>
              
              <div className="relative z-10">
                <h2 className="font-nunito text-2xl font-bold text-center text-stone-800 mb-2">
                  Welcome to Kawaii Brews!
                </h2>
                <p className="text-center text-stone-500 mb-6 text-sm">
                  Enter a cute nickname to start logging your coffee journey.
                </p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="e.g. Matcha Mochi"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium text-stone-700"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(false)}
                      className="flex-1 py-3 rounded-2xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl font-bold text-white bg-pink-400 hover:bg-pink-500 shadow-sm hover:shadow-md transition-all"
                    >
                      Let&apos;s Go! ✨
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
