'use client';

import { useEffect, useState } from 'react';
import type { FeedPost, ModerationQueueItem, RoasterRecord } from '@/lib/domain/types';

export function AdminQueueClient({
  initialReports,
  initialPosts,
  initialRoasters,
}: {
  initialReports: ModerationQueueItem[];
  initialPosts: FeedPost[];
  initialRoasters: RoasterRecord[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [posts, setPosts] = useState(initialPosts);
  const [roasters, setRoasters] = useState(initialRoasters);

  useEffect(() => setReports(initialReports), [initialReports]);
  useEffect(() => setPosts(initialPosts), [initialPosts]);
  useEffect(() => setRoasters(initialRoasters), [initialRoasters]);

  async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
    const response = await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      window.alert('Unable to update that report.');
      return;
    }

    setReports((current) => current.filter((report) => report.id !== reportId));
  }

  async function hidePost(postId: string) {
    const response = await fetch(`/api/admin/posts/${postId}/hide`, {
      method: 'POST',
    });

    if (!response.ok) {
      window.alert('Unable to hide that post.');
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  async function deletePost(postId: string) {
    const response = await fetch(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      window.alert('Unable to delete that post.');
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  async function hideRoaster(roasterId: string) {
    const response = await fetch(`/api/admin/roasters/${roasterId}/hide`, {
      method: 'POST',
    });

    if (!response.ok) {
      window.alert('Unable to hide that roaster.');
      return;
    }

    setRoasters((current) => current.filter((roaster) => roaster.id !== roasterId));
  }

  async function deleteRoaster(roasterId: string) {
    const response = await fetch(`/api/admin/roasters/${roasterId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to delete that roaster.');
      return;
    }

    setRoasters((current) => current.filter((roaster) => roaster.id !== roasterId));
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="rounded-[2.5rem] border border-white/60 bg-white/85 px-6 py-10 shadow-[0_28px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
        <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-stone-500">
          Hidden admin tools
        </div>
        <h1 className="mt-3 font-nunito text-4xl font-extrabold text-stone-900">Moderation queue</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-stone-500">
          This is the minimum live-ops surface for Pinned Brews: resolve reports, hide problem content, and clear out bad roasters before they spread through the feed.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Open reports">
          {reports.length === 0 ? <EmptyLine text="No open reports." /> : null}
          {reports.map((report) => (
            <div key={report.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-stone-400">{report.targetType}</div>
                  <div className="mt-1 text-sm font-bold text-stone-900">{report.reason}</div>
                </div>
                <div className="text-xs font-bold text-stone-400">@{report.reporter.handle}</div>
              </div>
              {report.details ? <p className="mt-3 text-sm font-medium leading-6 text-stone-600">{report.details}</p> : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void resolveReport(report.id, 'resolved')}
                  className="rounded-full bg-stone-950 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => void resolveReport(report.id, 'dismissed')}
                  className="rounded-full bg-stone-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-stone-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel title="Recent posts">
          {posts.length === 0 ? <EmptyLine text="No recent posts." /> : null}
          {posts.map((post) => (
            <div key={post.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-stone-900">{post.coffeeName}</div>
                  <div className="mt-1 text-xs font-bold text-stone-400">@{post.author.handle}</div>
                </div>
                <div className="text-xs font-bold text-rose-500">{post.reportsCount} reports</div>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-stone-600">{post.tasteNotes}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void hidePost(post.id)}
                  className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-900"
                >
                  Hide
                </button>
                <button
                  type="button"
                  onClick={() => void deletePost(post.id)}
                  className="rounded-full bg-rose-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel title="Roasters">
          {roasters.length === 0 ? <EmptyLine text="No active roasters." /> : null}
          {roasters.slice(0, 12).map((roaster) => (
            <div key={roaster.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-stone-900">{roaster.name}</div>
                  <div className="mt-1 text-xs font-bold text-stone-400">{roaster.location}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void hideRoaster(roaster.id)}
                  className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-900"
                >
                  Hide
                </button>
                <button
                  type="button"
                  onClick={() => void deleteRoaster(roaster.id)}
                  className="rounded-full bg-rose-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </AdminPanel>
      </section>
    </main>
  );
}

function AdminPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-sm">
      <h2 className="font-nunito text-2xl font-extrabold text-stone-900">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm font-medium text-stone-500">{text}</div>;
}
