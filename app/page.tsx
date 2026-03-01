import { getAuthContext } from '@/lib/server/auth';
import { getFeedPosts } from '@/lib/server/posts';
import { HomePageClient } from '@/components/home/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { supabase, viewer } = await getAuthContext();
  const posts = await getFeedPosts(supabase, viewer?.id ?? null);

  return <HomePageClient initialPosts={posts} viewer={viewer} />;
}

