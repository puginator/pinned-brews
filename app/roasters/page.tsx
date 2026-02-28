'use client';

import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { motion } from 'motion/react';
import { MapPin, Coffee, Award, CheckCircle2, ExternalLink, Users, Stamp, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RoastersPage() {
  const { roasters, posts, currentUser, addRoaster } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoaster, setNewRoaster] = useState({
    name: '',
    location: '',
    ethos: '',
    equipment: '',
    website: '',
    logo: '☕'
  });

  const handleAddRoaster = (e: React.FormEvent) => {
    e.preventDefault();
    addRoaster(newRoaster);
    setIsAddModalOpen(false);
    setNewRoaster({ name: '', location: '', ethos: '', equipment: '', website: '', logo: '☕' });
  };

  // Calculate which roasters the user has logged
  const userRoasterIds = new Set(
    posts.filter(p => p.userId === currentUser?.id).map(p => p.roasterId)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <h1 className="font-nunito text-4xl sm:text-5xl font-extrabold text-stone-800 mb-4 tracking-tight flex items-center justify-center gap-3">
              <Stamp className="w-10 h-10 text-teal-500" />
              Roaster Passport
            </h1>
            <p className="text-stone-500 font-medium text-lg max-w-2xl mx-auto">
              Discover local small-batch roasters. Log a brew to collect their stamp!
            </p>
          </motion.div>
          
          <div className="absolute top-0 right-4 text-4xl opacity-20 hidden md:block rotate-[15deg]">☕</div>
        </div>

        {currentUser && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white hover:bg-stone-50 text-stone-700 font-bold py-3 px-6 rounded-full shadow-sm border-2 border-stone-200 flex items-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 text-pink-500" />
              Add a New Roaster
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roasters.map((roaster, index) => {
            const hasStamp = userRoasterIds.has(roaster.id);
            const roasterPosts = posts.filter(p => p.roasterId === roaster.id);
            const uniqueCoffees = Array.from(new Set(roasterPosts.map(p => p.coffeeName)));
            
            return (
              <motion.div
                key={roaster.id}
                id={roaster.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 relative overflow-hidden transition-all duration-300 group ${
                  hasStamp ? 'border-teal-200 hover:border-teal-300' : 'border-stone-100 hover:border-stone-200'
                }`}
              >
                {/* Stamp overlay if collected */}
                {hasStamp && (
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center rotate-12 opacity-80 z-10 border-4 border-teal-200 pointer-events-none">
                    <Stamp className="w-14 h-14 text-teal-500" />
                  </div>
                )}

                <div className="flex items-start gap-4 sm:gap-6 mb-6 relative z-20">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl shadow-sm border-4 shrink-0 group-hover:scale-110 transition-transform ${
                    hasStamp ? 'bg-teal-50 border-white' : 'bg-stone-50 border-white grayscale opacity-70'
                  }`}>
                    {roaster.logo}
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-stone-800 leading-tight flex items-center gap-2 mb-1">
                      {roaster.name}
                      {roaster.website && (
                        <a 
                          href={roaster.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-pink-500 transition-colors"
                          title="Visit Website"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </h2>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(roaster.name + ' ' + roaster.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-stone-500 hover:text-teal-600 text-sm font-bold transition-colors w-fit"
                    >
                      <MapPin className="w-4 h-4" />
                      {roaster.location}
                    </a>
                  </div>
                </div>

                <div className="space-y-4 mb-6 relative z-20">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Ethos</h3>
                    <p className="text-stone-700 font-medium leading-relaxed">
                      &quot;{roaster.ethos}&quot;
                    </p>
                  </div>
                  
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Equipment</h3>
                    <div className="flex items-center gap-2 text-stone-700 font-medium">
                      <Coffee className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>{roaster.equipment}</span>
                    </div>
                  </div>

                  {uniqueCoffees.length > 0 && (
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                      <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Community Favorites
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueCoffees.map(coffee => (
                          <span key={coffee} className="bg-white text-stone-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-pink-100 shadow-sm">
                            {coffee}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-stone-200 border-dashed relative z-20">
                  <div className="flex items-center gap-1.5 text-stone-500 text-sm font-bold">
                    {hasStamp ? (
                      <div className="flex items-center gap-2 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Stamp Collected!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-stone-400 bg-stone-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-stone-300 border-dashed"></div>
                        Not visited yet
                      </div>
                    )}
                  </div>
                  
                  {!hasStamp && currentUser && (
                    <Link 
                      href="/new"
                      className="text-xs bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold px-3 py-1.5 rounded-full transition-colors"
                    >
                      Log a Brew
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Add Roaster Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-xl relative"
          >
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-nunito text-2xl font-extrabold text-stone-800 mb-6 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-pink-500" />
              Add New Roaster
            </h2>
            
            <form onSubmit={handleAddRoaster} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Roaster Name</label>
                <input
                  required
                  type="text"
                  value={newRoaster.name}
                  onChange={e => setNewRoaster({...newRoaster, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                  placeholder="e.g. Little Bear Roasters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Location</label>
                <input
                  required
                  type="text"
                  value={newRoaster.location}
                  onChange={e => setNewRoaster({...newRoaster, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                  placeholder="e.g. Portland, OR"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Website (Optional)</label>
                <input
                  type="url"
                  value={newRoaster.website}
                  onChange={e => setNewRoaster({...newRoaster, website: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Ethos / Vibe</label>
                <textarea
                  required
                  value={newRoaster.ethos}
                  onChange={e => setNewRoaster({...newRoaster, ethos: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium resize-none"
                  placeholder="What makes them special?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Equipment</label>
                <input
                  required
                  type="text"
                  value={newRoaster.equipment}
                  onChange={e => setNewRoaster({...newRoaster, equipment: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                  placeholder="e.g. Loring S15, La Marzocco"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Emoji Logo</label>
                <div className="flex gap-2">
                  {['☕', '🐻', '🦉', '🌸', '✨', '☁️', '🌊', '🌟', '🌲', '🔄'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewRoaster({...newRoaster, logo: emoji})}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        newRoaster.logo === emoji 
                          ? 'bg-pink-100 border-2 border-pink-400 scale-110' 
                          : 'bg-stone-50 border-2 border-stone-100 hover:bg-stone-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg mt-4"
              >
                Add Roaster
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
