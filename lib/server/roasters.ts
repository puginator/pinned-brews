import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';
import type { RoasterPassportCard, RoasterRecord } from '@/lib/domain/types';

function mapRoaster(row: Database['public']['Tables']['roasters']['Row']): RoasterRecord {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    ethos: row.ethos,
    equipment: row.equipment,
    logo: row.logo,
    website: row.website,
    createdBy: row.created_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveRoasters(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRoaster);
}

export async function getRoasterCards(supabase: SupabaseClient<Database>, viewerId?: string | null) {
  const [roastersResult, postsResult, viewerPostsResult] = await Promise.all([
    supabase.from('roasters').select('*').eq('status', 'active').order('created_at', { ascending: true }),
    supabase
      .from('posts')
      .select('id, roaster_id, coffee_name')
      .eq('status', 'active'),
    viewerId
      ? supabase.from('posts').select('roaster_id').eq('user_id', viewerId).eq('status', 'active')
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (roastersResult.error) {
    throw roastersResult.error;
  }

  if (postsResult.error) {
    throw postsResult.error;
  }

  if (viewerPostsResult.error) {
    throw viewerPostsResult.error;
  }

  const viewerRoasterIds = new Set((viewerPostsResult.data ?? []).map((row) => row.roaster_id));
  const postsByRoaster = new Map<string, string[]>();

  for (const post of postsResult.data ?? []) {
    const existing = postsByRoaster.get(post.roaster_id) ?? [];
    existing.push(post.coffee_name);
    postsByRoaster.set(post.roaster_id, existing);
  }

  return (roastersResult.data ?? []).map((row) => {
    const favorites = Array.from(new Set(postsByRoaster.get(row.id) ?? [])).slice(0, 6);
    return {
      ...mapRoaster(row),
      communityFavorites: favorites,
      postCount: (postsByRoaster.get(row.id) ?? []).length,
      pinnedByViewer: viewerRoasterIds.has(row.id),
    } satisfies RoasterPassportCard;
  });
}

