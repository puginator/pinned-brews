import { requireAdminPage } from '@/lib/server/auth';
import { getFeedPosts } from '@/lib/server/posts';
import { getOpenReports } from '@/lib/server/reports';
import { getActiveRoasters } from '@/lib/server/roasters';
import { AdminQueueClient } from '@/components/admin/AdminQueueClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { supabase, viewer } = await requireAdminPage();
  const [reports, posts, roasters] = await Promise.all([
    getOpenReports(supabase),
    getFeedPosts(supabase, viewer?.id ?? null),
    getActiveRoasters(supabase),
  ]);

  return <AdminQueueClient initialReports={reports} initialPosts={posts.slice(0, 10)} initialRoasters={roasters.slice(0, 12)} />;
}
