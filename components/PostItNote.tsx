'use client';

import { Post } from '@/lib/store';
import { motion } from 'motion/react';
import { Heart, Coffee, Beaker, MapPin, Sparkles, ExternalLink, Star } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function PostItNote({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Deterministic random rotation based on post ID
  const randomRotation = (post.id.charCodeAt(post.id.length - 1) % 7) - 3; // -3 to 3 degrees

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
      style={{ rotate: randomRotation, perspective: 1000 }}
      className="relative w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full grid"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', gridTemplateAreas: "'stack'" }}
      >
        {/* Front Side */}
        <div 
          className={`[grid-area:stack] ${post.color} rounded-2xl p-5 shadow-sm border-2 border-black/5 flex flex-col`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Tape graphic */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm rotate-[-2deg] shadow-sm rounded-sm z-10"></div>
          
          <div className="flex flex-col h-full min-h-[200px]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{post.userAvatar}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-stone-800 text-sm">{post.userName}</span>
                  <span className="text-xs text-stone-500 font-medium">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-nunito font-extrabold text-xl text-stone-800 leading-tight mb-1 flex items-center gap-2">
                {post.coffeeName}
                {post.country && (
                  <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {post.country}
                  </span>
                )}
                {post.coffeeUrl && (
                  <a 
                    href={post.coffeeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-pink-500 hover:text-pink-600 transition-colors"
                    title="View Coffee"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </h3>
              <div className="flex items-center gap-1 text-stone-600 text-sm font-medium mb-3">
                <MapPin className="w-3 h-3" />
                <Link 
                  href={`/roasters#${post.roasterId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-pink-500 hover:underline transition-colors"
                >
                  {post.roasterName}
                </Link>
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="relative w-4 h-4">
                    <Star className="w-4 h-4 text-stone-300 absolute inset-0" />
                    <div 
                      className="absolute inset-0 overflow-hidden" 
                      style={{ width: post.rating >= star ? '100%' : post.rating >= star - 0.5 ? '50%' : '0%' }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                ))}
                <span className="text-xs font-bold text-stone-500 ml-1">{post.rating}</span>
              </div>
              
              <p className="text-stone-700 text-sm font-medium leading-relaxed italic">
                &quot;{post.tasteNotes}&quot;
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
              <div className="flex items-center gap-1.5 text-stone-600 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold">
                <Coffee className="w-3 h-3" />
                {post.brewMethod}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(post.id);
                }}
                className="flex items-center gap-1.5 text-pink-500 hover:bg-pink-100/50 px-2 py-1 rounded-lg transition-colors group"
              >
                <Heart className="w-4 h-4 group-hover:fill-pink-500 transition-all" />
                <span className="font-bold text-sm">{post.likes}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Side (Recipe Details) */}
        <div 
          className={`[grid-area:stack] ${post.color} rounded-2xl p-5 shadow-sm border-2 border-black/5 flex flex-col`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Tape graphic */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm rotate-[-2deg] shadow-sm rounded-sm z-10"></div>

          <div className="flex flex-col h-full min-h-[200px]">
            <div className="flex items-center gap-2 mb-4 border-b border-black/10 pb-2">
              <Beaker className="w-5 h-5 text-stone-700" />
              <h3 className="font-nunito font-bold text-lg text-stone-800">The Recipe</h3>
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl">
                <span className="text-stone-600 font-medium text-xs">Method</span>
                <span className="font-bold text-stone-800 text-sm">{post.brewMethod}</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl">
                <span className="text-stone-600 font-medium text-xs">Dose / Yield</span>
                <span className="font-bold text-stone-800 text-sm">{post.coffeeWeight}g / {post.waterWeight}g</span>
              </div>
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl">
                <span className="text-stone-600 font-medium text-xs">Ratio</span>
                <span className="font-bold text-stone-800 text-sm">{post.ratio}</span>
              </div>
              {(post.varietal || post.process) && (
                <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl">
                  <span className="text-stone-600 font-medium text-xs">Bean Info</span>
                  <span className="font-bold text-stone-800 text-sm text-right">
                    {[post.varietal, post.process].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
            </div>

            {post.aiAdvice && (
              <div className="mt-4 bg-white/60 p-3 rounded-xl border border-white/80 shadow-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-3xl opacity-20">✨</div>
                <div className="flex items-start gap-2 relative z-10">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-700 font-medium leading-relaxed">
                    <span className="font-bold text-stone-800 block mb-0.5">Brew Coach:</span>
                    {post.aiAdvice}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-center text-xs text-stone-500 font-medium">
              Click to flip back ↺
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
