import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { requireAdminRole } from '@/lib/server/moderation';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ roasterId: string }> },
) {
  const { roasterId } = await params;
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const isAdmin = await requireAdminRole(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { error } = await supabase.from('roasters').update({ status: 'hidden' }).eq('id', roasterId);

  if (error) {
    return NextResponse.json({ error: 'Unable to hide roaster.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

