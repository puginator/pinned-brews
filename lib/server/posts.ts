import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';
import type { FeedPost } from '@/lib/domain/types';

const POST_SELECT = `
  id,
  user_id,
  coffee_name,
  coffee_url,
  roaster_id,
  brew_method,
  coffee_weight,
  water_weight,
  ratio,
  country,
  varietal,
  process,
  taste_notes,
  flavor_profiles,
  rating,
  ai_advice,
  color,
  likes_count,
  reports_count,
  status,
  created_at,
  updated_at,
  author:profiles!posts_user_id_fkey (
    id,
    handle,
    display_name,
    avatar,
    bio,
    role,
    created_at,
    updated_at
  ),
  roaster:roasters!posts_roaster_id_fkey (
    id,
    name,
    location,
    ethos,
    equipment,
    logo,
    website,
    created_by,
    status,
    created_at,
    updated_at
  )
`;

type PostRow = {
  id: string;
  user_id: string;
  coffee_name: string;
  coffee_url: string | null;
  roaster_id: string;
  brew_method: string;
  coffee_weight: number;
  water_weight: number;
  ratio: string;
  country: string | null;
  varietal: string | null;
  process: string | null;
  taste_notes: string;
  flavor_profiles: string[];
  rating: number;
  ai_advice: string | null;
  color: string;
  likes_count: number;
  reports_count: number;
  status: 'active' | 'hidden' | 'removed';
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    handle: string;
    display_name: string;
    avatar: string;
  } | null;
  roaster: {
    id: string;
    name: string;
    location: string;
    logo: string;
    website: string | null;
    status: 'active' | 'hidden' | 'removed';
  } | null;
};

function mapFeedPost(row: PostRow, likedPostIds: Set<string>, viewerId?: string | null): FeedPost | null {
  if (!row.author || !row.roaster || row.roaster.status !== 'active' || row.status !== 'active') {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    coffeeName: row.coffee_name,
    coffeeUrl: row.coffee_url,
    roasterId: row.roaster_id,
    brewMethod: row.brew_method,
    coffeeWeight: Number(row.coffee_weight),
    waterWeight: Number(row.water_weight),
    ratio: row.ratio,
    country: row.country,
    varietal: row.varietal,
    process: row.process,
    tasteNotes: row.taste_notes,
    flavorProfiles: row.flavor_profiles ?? [],
    rating: Number(row.rating),
    aiAdvice: row.ai_advice,
    color: row.color,
    likesCount: row.likes_count,
    reportsCount: row.reports_count,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      id: row.author.id,
      handle: row.author.handle,
      displayName: row.author.display_name,
      avatar: row.author.avatar,
    },
    roaster: {
      id: row.roaster.id,
      name: row.roaster.name,
      location: row.roaster.location,
      logo: row.roaster.logo,
      website: row.roaster.website,
    },
    likedByViewer: likedPostIds.has(row.id),
    reportable: viewerId ? row.user_id !== viewerId : false,
  };
}

async function getLikedPostIds(supabase: SupabaseClient<Database>, viewerId: string, postIds: string[]) {
  if (postIds.length === 0) {
    return new Set<string>();
  }

  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', viewerId)
    .in('post_id', postIds);

  return new Set((data ?? []).map((row) => row.post_id));
}

export async function getFeedPosts(supabase: SupabaseClient<Database>, viewerId?: string | null) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as PostRow[];
  const likedPostIds = viewerId ? await getLikedPostIds(supabase, viewerId, rows.map((row) => row.id)) : new Set<string>();

  return rows
    .map((row) => mapFeedPost(row, likedPostIds, viewerId))
    .filter((row): row is FeedPost => row !== null);
}

export async function getPostsForUserId(supabase: SupabaseClient<Database>, userId: string, viewerId?: string | null) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as PostRow[];
  const likedPostIds = viewerId ? await getLikedPostIds(supabase, viewerId, rows.map((row) => row.id)) : new Set<string>();

  return rows
    .map((row) => mapFeedPost(row, likedPostIds, viewerId))
    .filter((row): row is FeedPost => row !== null);
}

export async function getPostStatsInputs(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, user_id, roaster_id, brew_method, flavor_profiles, rating, likes_count, country, process, created_at')
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
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
}

export async function getMostLovedPosts(supabase: SupabaseClient<Database>, viewerId?: string | null) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'active')
    .order('likes_count', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as PostRow[];
  const likedPostIds = viewerId ? await getLikedPostIds(supabase, viewerId, rows.map((row) => row.id)) : new Set<string>();

  return rows
    .map((row) => mapFeedPost(row, likedPostIds, viewerId))
    .filter((row): row is FeedPost => row !== null);
}
