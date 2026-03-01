import { AchievementsPageClient } from '@/components/achievements/AchievementsPageClient';
import { getAchievementProgress } from '@/lib/domain/stats';
import { getAuthContext } from '@/lib/server/auth';
import { getPostStatsInputs } from '@/lib/server/posts';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const { supabase, viewer } = await getAuthContext();
  const statsInputs = viewer?.profile ? await getPostStatsInputs(supabase) : [];
  const achievements = getAchievementProgress(viewer?.profile?.id ?? null, statsInputs);

  return <AchievementsPageClient achievements={achievements} viewer={viewer} />;
}
