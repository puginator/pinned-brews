import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { requireAdminRole } from '@/lib/server/moderation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const isAdmin = await requireAdminRole(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({}));
  const status = payload.status === 'dismissed' ? 'dismissed' : 'resolved';

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq('id', reportId);

  if (error) {
    return NextResponse.json({ error: 'Unable to update report.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

