import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { requireAdminRole } from '@/lib/server/moderation';
import { getOpenReports } from '@/lib/server/reports';

export async function GET() {
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const isAdmin = await requireAdminRole(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const reports = await getOpenReports(supabase);
  return NextResponse.json({ reports });
}

