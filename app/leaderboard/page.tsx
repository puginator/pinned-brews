import { LeaderboardPageClient } from '@/components/leaderboard/LeaderboardPageClient';
import { getAuthContext } from '@/lib/server/auth';
import { getLeaderboard } from '@/lib/server/leaderboard';
import { getMostLovedPosts } from '@/lib/server/posts';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const { supabase, viewer } = await getAuthContext();
  const [topUsers, topBrews] = await Promise.all([
    getLeaderboard(supabase),
    getMostLovedPosts(supabase, viewer?.id ?? null),
  ]);

  return <LeaderboardPageClient topUsers={topUsers} topBrews={topBrews} />;
}
