import { getAuthContext } from '@/lib/server/auth';
import { getRoasterCards } from '@/lib/server/roasters';
import { RoastersPageClient } from '@/components/roasters/RoastersPageClient';

export const dynamic = 'force-dynamic';

export default async function RoastersPage() {
  const { supabase, viewer } = await getAuthContext();
  const roasters = await getRoasterCards(supabase, viewer?.id ?? null);

  return <RoastersPageClient initialRoasters={roasters} viewer={viewer} />;
}

