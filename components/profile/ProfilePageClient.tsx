'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Award, Pencil, Save } from 'lucide-react';
import type { Badge, FeedPost, PublicProfile, Viewer } from '@/lib/domain/types';
import { PROFILE_AVATARS } from '@/lib/domain/constants';
import { PostItNote } from '@/components/PostItNote';
import { ReportDialog } from '@/components/ReportDialog';

export function ProfilePageClient({
  initialProfile,
  viewer,
}: {
  initialProfile: PublicProfile;
  viewer: Viewer;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [posts, setPosts] = useState<FeedPost[]>(initialProfile.recentPosts);
  const [editing, setEditing] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const isOwner = viewer?.profile?.id === profile.id;
  const [form, setForm] = useState({
    displayName: profile.displayName,
    avatar: profile.avatar,
    bio: profile.bio ?? '',
  });

  useEffect(() => {
    setProfile(initialProfile);
    setPosts(initialProfile.recentPosts);
    setForm({
      displayName: initialProfile.displayName,
      avatar: initialProfile.avatar,
      bio: initialProfile.bio ?? '',
    });
  }, [initialProfile]);

  async function likePost(postId: string) {
    if (!viewer?.profile) {
      window.alert('Sign in to like brews.');
      return;
    }

    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      window.alert('Unable to update that like.');
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

    setSubmittingReport(true);
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
    setSubmittingReport(false);

    if (!response.ok) {
      window.alert('Unable to submit that report.');
      return;
    }

    setReportingPostId(null);
  }

  async function saveProfile() {
    startSaving(async () => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        window.alert(payload.error ?? 'Unable to update profile.');
        return;
      }

      setProfile((current) => ({
        ...current,
        ...payload.profile,
        stats: current.stats,
        badges: current.badges,
        recentPosts: current.recentPosts,
      }));
      setEditing(false);
    });
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-[2.5rem] border border-white/60 bg-white/85 px-6 py-10 shadow-[0_28px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-6xl">{editing ? form.avatar : profile.avatar}</div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h1 className="font-nunito text-4xl font-extrabold text-stone-900">{editing ? form.displayName : profile.displayName}</h1>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm font-black text-stone-500">
                  @{profile.handle}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-stone-600 sm:text-base">
                {editing ? form.bio || 'No bio yet.' : profile.bio || 'No bio yet.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
              <StatCard label="XP" value={profile.stats.totalXp.toString()} accent="text-sky-600" />
              <StatCard label="Brews" value={posts.length.toString()} accent="text-rose-600" />
              <StatCard label="Streak" value={`${profile.stats.streak}`} accent="text-amber-600" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-[1.5rem] bg-stone-950 px-4 py-3 text-white">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/50">Current rank</div>
              <div className="mt-1 font-nunito text-2xl font-extrabold">
                {profile.stats.currentRank.icon} {profile.stats.currentRank.name}
              </div>
            </div>

            {isOwner ? (
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-300"
              >
                <Pencil className="h-4 w-4" />
                {editing ? 'Close editor' : 'Edit profile'}
              </button>
            ) : null}
          </div>

          {editing && isOwner ? (
            <div className="mt-6 rounded-[2rem] border border-stone-200 bg-stone-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-stone-700">Display name</span>
                  <input
                    value={form.displayName}
                    onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300"
                  />
                </label>
                <div>
                  <div className="mb-1.5 block text-sm font-bold text-stone-700">Avatar</div>
                  <div className="flex flex-wrap gap-2">
                    {PROFILE_AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, avatar }))}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                          form.avatar === avatar ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-stone-700">Bio</span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    className="w-full rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-sky-300"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void saveProfile()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-stone-500">
              <Award className="h-4 w-4 text-amber-500" />
              Achievements
            </div>
            {profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge: Badge) => (
                  <div key={badge.id} className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
                    {badge.icon} {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-stone-500">No badges unlocked yet. Start logging brews to fill out your board.</p>
            )}
            <div className="mt-4">
              <Link
                href="/achievements"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300"
              >
                <Award className="h-4 w-4 text-amber-500" />
                View all achievements
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostItNote
              key={post.id}
              post={post}
              onLike={likePost}
              onReport={(id) => {
                if (!viewer?.profile) {
                  window.alert('Sign in to report posts.');
                  return;
                }

                setReportingPostId(id);
              }}
            />
          ))}
        </section>
      </main>

      <ReportDialog
        open={Boolean(reportingPostId)}
        targetLabel="post"
        isSubmitting={submittingReport}
        onClose={() => setReportingPostId(null)}
        onSubmit={submitReport}
      />
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">{label}</div>
      <div className={`mt-2 font-nunito text-3xl font-extrabold ${accent}`}>{value}</div>
    </div>
  );
}
