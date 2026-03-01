import { notFound } from 'next/navigation';
import { getAuthContext } from '@/lib/server/auth';
import { getFeaturedBadges, getUserBadges, getUserStats } from '@/lib/domain/stats';
import { getPostsForUserId, getPostStatsInputs } from '@/lib/server/posts';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { supabase, viewer } = await getAuthContext();
  const { data: profileRow, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle.toLowerCase())
    .maybeSingle();

  if (error || !profileRow) {
    notFound();
  }

  const [recentPosts, statsInputs] = await Promise.all([
    getPostsForUserId(supabase, profileRow.id, viewer?.id ?? null),
    getPostStatsInputs(supabase),
  ]);

  const publicProfile = {
    id: profileRow.id,
    handle: profileRow.handle,
    displayName: profileRow.display_name,
    avatar: profileRow.avatar,
    bio: profileRow.bio,
    role: profileRow.role,
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
    stats: getUserStats(profileRow.id, statsInputs),
    badges: getUserBadges(profileRow.id, statsInputs),
    featuredBadges: getFeaturedBadges(profileRow.id, statsInputs, 3),
    recentPosts,
  };

  return <ProfilePageClient initialProfile={publicProfile} viewer={viewer} />;
}
