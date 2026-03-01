import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';
import { profileUpdateSchema } from '@/lib/validation';

export async function PATCH(request: Request) {
  const { supabase, user, profile } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Complete onboarding first.' }, { status: 403 });
  }

  const rateLimit = await enforceWriteRateLimit(supabase, 'profile:update', request.headers, user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = profileUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile update.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.displayName,
      avatar: parsed.data.avatar,
      bio: parsed.data.bio ?? null,
    })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
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

