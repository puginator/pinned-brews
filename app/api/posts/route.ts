import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { getUserBadges } from '@/lib/domain/stats';
import { getFeedPosts, getStatsInputsForUserIds } from '@/lib/server/posts';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';
import { postSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Complete onboarding before posting.' }, { status: 403 });
  }

  const rateLimit = await enforceWriteRateLimit(supabase, 'posts:create', request.headers, user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many posts too quickly.' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = postSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid brew payload.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const previousStatsInputs = await getStatsInputsForUserIds(supabase, [user.id]);
  const previousBadgeIds = new Set(getUserBadges(user.id, previousStatsInputs).map((badge) => badge.id));

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      coffee_name: parsed.data.coffeeName,
      coffee_url: parsed.data.coffeeUrl ?? null,
      roaster_id: parsed.data.roasterId,
      brew_method: parsed.data.brewMethod,
      coffee_weight: parsed.data.coffeeWeight,
      water_weight: parsed.data.waterWeight,
      ratio: parsed.data.ratio,
      country: parsed.data.country ?? null,
      varietal: parsed.data.varietal ?? null,
      process: parsed.data.process ?? null,
      taste_notes: parsed.data.tasteNotes,
      flavor_profiles: parsed.data.flavorProfiles,
      rating: parsed.data.rating,
      ai_advice: parsed.data.aiAdvice ?? null,
      color: parsed.data.color,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to publish this brew.' }, { status: 500 });
  }

  const updatedStatsInputs = await getStatsInputsForUserIds(supabase, [user.id]);
  const updatedBadges = getUserBadges(user.id, updatedStatsInputs);
  const newlyUnlockedBadges = updatedBadges.filter((badge) => !previousBadgeIds.has(badge.id));
  const feed = await getFeedPosts(supabase, user.id);
  const post = feed.find((entry) => entry.id === data.id);

  return NextResponse.json({ post, newlyUnlockedBadges }, { status: 201 });
}
