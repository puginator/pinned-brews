import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { requireAdminRole } from '@/lib/server/moderation';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const isAdmin = await requireAdminRole(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    return NextResponse.json({ error: 'Unable to delete post.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

