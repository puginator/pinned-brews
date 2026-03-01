import 'server-only';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getDb } from '@/lib/server/db';
import { mapProfile } from '@/lib/server/profiles';
import type { ProfileRecord, Viewer } from '@/lib/domain/types';

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof getDb>>;
  user: User | null;
  profile: ProfileRecord | null;
  viewer: Viewer;
};

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await getDb();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = data ? mapProfile(data) : null;
  }

  return {
    supabase,
    user,
    profile,
    viewer: user
      ? {
          id: user.id,
          email: user.email ?? null,
          profile,
        }
      : null,
  };
}

export async function getViewer() {
  const { viewer } = await getAuthContext();
  return viewer;
}

export async function requireAuthedPage() {
  const context = await getAuthContext();

  if (!context.user) {
    redirect('/');
  }

  return context;
}

export async function requireCompleteProfilePage() {
  const context = await requireAuthedPage();

  if (!context.profile) {
    redirect('/onboarding');
  }

  return context;
}

export async function requireAdminPage() {
  const context = await requireCompleteProfilePage();

  if (context.profile?.role !== 'admin') {
    redirect('/');
  }

  return context;
}
