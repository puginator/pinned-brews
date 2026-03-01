'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import { Beaker, ExternalLink, Flag, Heart, MapPin, Sparkles, Star } from 'lucide-react';
import type { FeedPost } from '@/lib/domain/types';

export function PostItNote({
  post,
  onLike,
  onReport,
}: {
  post: FeedPost;
  onLike: (id: string) => Promise<void> | void;
  onReport: (id: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = (post.id.charCodeAt(post.id.length - 1) % 7) - 3;

  return (
    <motion.article
      layout
      whileHover={{ y: -4, rotate: 0 }}
      style={{ rotate: rotation, perspective: 1200 }}
      className="relative cursor-pointer"
      onClick={() => setIsFlipped((current) => !current)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 220, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', display: 'grid' }}
        className="relative min-h-[320px]"
      >
        <div
          className={`[grid-area:1/1] ${post.color} relative flex min-h-[320px] flex-col rounded-[2rem] border border-black/5 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="absolute -top-3 left-1/2 h-7 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-white/60 shadow-sm" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{post.author.avatar}</span>
              <div>
                <Link
                  href={`/u/${post.author.handle}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm font-bold text-stone-800 transition hover:text-stone-950"
                >
                  {post.author.displayName}
                </Link>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-500">@{post.author.handle}</div>
              </div>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="mt-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-nunito text-2xl font-extrabold leading-tight text-stone-900">{post.coffeeName}</h3>
              {post.country ? <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-stone-600">{post.country}</span> : null}
              {post.coffeeUrl ? (
                <a
                  href={post.coffeeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="text-stone-500 transition hover:text-stone-900"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            <Link
              href="/roasters"
              onClick={(event) => event.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 transition hover:text-stone-900"
            >
              <MapPin className="h-4 w-4" />
              {post.roaster.name}
            </Link>

            <div className="mt-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative h-4 w-4">
                  <Star className="absolute inset-0 h-4 w-4 text-stone-300" />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: post.rating >= star ? '100%' : post.rating >= star - 0.5 ? '50%' : '0%' }}
                  >
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              ))}
              <span className="ml-1 text-xs font-bold text-stone-500">{post.rating.toFixed(1)}</span>
            </div>

            <p className="mt-4 text-sm font-medium leading-7 text-stone-700">&quot;{post.tasteNotes}&quot;</p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
            <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-stone-600">
              {post.brewMethod}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void onReport(post.id);
                }}
                className="rounded-full bg-white/70 p-2 text-stone-500 transition hover:text-rose-600"
              >
                <Flag className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void onLike(post.id);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${
                  post.likedByViewer ? 'bg-rose-500 text-white' : 'bg-white/70 text-rose-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${post.likedByViewer ? 'fill-white text-white' : ''}`} />
                {post.likesCount}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`[grid-area:1/1] ${post.color} relative flex min-h-[320px] flex-col rounded-[2rem] border border-black/5 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute -top-3 left-1/2 h-7 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-white/60 shadow-sm" />

          <div className="mb-4 flex items-center gap-2 border-b border-black/10 pb-3">
            <Beaker className="h-5 w-5 text-stone-700" />
            <h3 className="font-nunito text-xl font-extrabold text-stone-900">Recipe card</h3>
          </div>

          <div className="space-y-2">
            <DetailRow label="Method" value={post.brewMethod} />
            <DetailRow label="Dose / Yield" value={`${post.coffeeWeight}g / ${post.waterWeight}g`} />
            <DetailRow label="Ratio" value={post.ratio} />
            <DetailRow label="Bean info" value={[post.varietal, post.process].filter(Boolean).join(' • ') || 'Not listed'} />
          </div>

          {post.aiAdvice ? (
            <div className="mt-4 rounded-[1.5rem] border border-white/70 bg-white/65 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="h-4 w-4" />
                Brew Coach
              </div>
              <p className="text-sm font-medium leading-6 text-stone-700">{post.aiAdvice}</p>
            </div>
          ) : null}

          <div className="mt-auto pt-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
            Tap to flip back
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-white/70 px-3 py-2.5">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{label}</span>
      <span className="text-right text-sm font-bold text-stone-800">{value}</span>
    </div>
  );
}

