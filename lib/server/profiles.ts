import 'server-only';

import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';
import type { ProfileRecord, Viewer } from '@/lib/domain/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function mapProfile(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    avatar: row.avatar,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapViewer(user: User | null, profile: ProfileRow | null): Viewer {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ? mapProfile(profile) : null,
  };
}

