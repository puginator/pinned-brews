import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';
import { onboardingSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const rateLimit = await enforceWriteRateLimit(supabase, 'auth:onboarding', request.headers, user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = onboardingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile data.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const profilePayload = {
    id: user.id,
    handle: parsed.data.handle,
    display_name: parsed.data.displayName,
    avatar: parsed.data.avatar,
    bio: parsed.data.bio ?? null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Unable to save your profile.' }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      id: data.id,
      handle: data.handle,
      displayName: data.display_name,
      avatar: data.avatar,
      bio: data.bio,
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

