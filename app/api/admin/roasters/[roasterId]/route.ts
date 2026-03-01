import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { requireAdminRole } from '@/lib/server/moderation';

export async function DELETE(
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

  const { count, error: countError } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('roaster_id', roasterId);

  if (countError) {
    return NextResponse.json({ error: 'Unable to validate roaster state.' }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Delete the roaster posts first or hide the roaster instead.' }, { status: 409 });
  }

  const { error } = await supabase.from('roasters').delete().eq('id', roasterId);

  if (error) {
    return NextResponse.json({ error: 'Unable to delete roaster.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
