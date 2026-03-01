import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getUserStats } from '@/lib/domain/stats';
import type { Database } from '@/lib/server/database.types';
import type { LeaderboardEntry } from '@/lib/domain/types';

export async function getLeaderboard(supabase: SupabaseClient<Database>) {
  const [profilesResult, postsResult] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase
      .from('posts')
      .select('id, user_id, roaster_id, brew_method, flavor_profiles, rating, likes_count, country, process, created_at')
      .eq('status', 'active'),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (postsResult.error) {
    throw postsResult.error;
  }

  const profiles = profilesResult.data ?? [];
  const posts = (postsResult.data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    roasterId: row.roaster_id,
    brewMethod: row.brew_method,
    flavorProfiles: row.flavor_profiles ?? [],
    rating: Number(row.rating),
    likesCount: row.likes_count,
    country: row.country,
    process: row.process,
    createdAt: row.created_at,
  }));

  return profiles
    .map((profile) => ({
      profile: {
        id: profile.id,
        handle: profile.handle,
        displayName: profile.display_name,
        avatar: profile.avatar,
      },
      stats: getUserStats(profile.id, posts),
    }))
    .sort((left, right) => right.stats.totalXp - left.stats.totalXp)
    .slice(0, 10) as LeaderboardEntry[];
}
