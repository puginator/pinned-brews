import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';
import { WRITE_RATE_LIMIT } from '@/lib/domain/constants';

function getRequestIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return headers.get('x-real-ip') ?? 'unknown';
}

export async function enforceWriteRateLimit(
  supabase: SupabaseClient<Database>,
  routeKey: string,
  requestHeaders: Headers,
  userId: string,
) {
  const identifiers = [`user:${userId}`, `ip:${getRequestIp(requestHeaders)}`];

  for (const identifier of identifiers) {
    const { data, error } = await supabase.rpc('consume_rate_limit', {
      p_identifier: identifier,
      p_route_key: routeKey,
      p_limit: WRITE_RATE_LIMIT.limit,
      p_window_seconds: WRITE_RATE_LIMIT.windowSeconds,
    });

    if (error) {
      throw error;
    }

    const state = data?.[0];
    if (!state?.allowed) {
      return {
        allowed: false,
        retryAt: state?.reset_at ?? null,
      };
    }
  }

  return {
    allowed: true,
    retryAt: null,
  };
}

