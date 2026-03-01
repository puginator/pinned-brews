import { getAuthContext } from '@/lib/server/auth';
import { getActiveRoasters } from '@/lib/server/roasters';
import { NewBrewPageClient } from '@/components/home/NewBrewPageClient';

export const dynamic = 'force-dynamic';

export default async function NewPage() {
  const { supabase, viewer } = await getAuthContext();
  const roasters = await getActiveRoasters(supabase);

  return <NewBrewPageClient viewer={viewer} roasters={roasters} />;
}

