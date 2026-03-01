import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';
import type { ModerationQueueItem } from '@/lib/domain/types';

export async function getOpenReports(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      target_type,
      target_id,
      reason,
      details,
      status,
      created_at,
      reporter:profiles!reports_reporter_id_fkey (
        id,
        handle,
        display_name,
        avatar
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
    reporter: {
      id: row.reporter.id,
      handle: row.reporter.handle,
      displayName: row.reporter.display_name,
      avatar: row.reporter.avatar,
    },
  })) as ModerationQueueItem[];
}

