import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';

export async function requireAdminRole(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();

  if (error) {
    throw error;
  }

  return data.role === 'admin';
}

