import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const { supabase, user, profile } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Complete onboarding before liking posts.' }, { status: 403 });
  }

  const rateLimit = await enforceWriteRateLimit(supabase, 'posts:like', request.headers, user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many like actions too quickly.' }, { status: 429 });
  }

  const { data, error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
  });

  if (error) {
    return NextResponse.json({ error: 'Unable to update like right now.' }, { status: 500 });
  }

  const result = data?.[0];
  return NextResponse.json({
    liked: result?.liked ?? false,
    likes: result?.likes_count ?? 0,
  });
}

