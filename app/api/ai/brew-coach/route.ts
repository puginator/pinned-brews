import { NextResponse } from 'next/server';
import { generateBrewAdvice, consumeAiQuota } from '@/lib/server/ai';
import { getAuthContext } from '@/lib/server/auth';
import { brewCoachSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Complete onboarding before using Brew Coach.' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = brewCoachSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid brew coach payload.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const quota = await consumeAiQuota(supabase);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'You have used your Brew Coach requests for today.' }, { status: 429 });
  }

  try {
    const advice = await generateBrewAdvice(parsed.data);
    return NextResponse.json({
      advice,
      remainingToday: quota.remaining,
    });
  } catch {
    return NextResponse.json({ error: 'Brew Coach is taking a break right now.' }, { status: 502 });
  }
}

