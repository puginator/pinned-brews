import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';
import { reportSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Complete onboarding before sending reports.' }, { status: 403 });
  }

  const rateLimit = await enforceWriteRateLimit(supabase, 'reports:create', request.headers, user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many reports too quickly.' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = reportSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid report.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to submit report.' }, { status: 500 });
  }

  if (parsed.data.targetType === 'post') {
    await supabase.rpc('increment_post_reports', {
      p_post_id: parsed.data.targetId,
    });
  }

  return NextResponse.json({
    report: {
      id: data.id,
      reporterId: data.reporter_id,
      targetType: data.target_type,
      targetId: data.target_id,
      reason: data.reason,
      details: data.details,
      status: data.status,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by,
    },
  });
}

