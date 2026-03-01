import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/server/auth';
import { enforceWriteRateLimit } from '@/lib/server/rate-limit';
import { roasterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await getAuthContext();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Complete onboarding before adding roasters.' }, { status: 403 });
    }

    const rateLimit = await enforceWriteRateLimit(supabase, 'roasters:create', request.headers, user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many roasters added too quickly.' }, { status: 429 });
    }

    const payload = await request.json();
    const parsed = roasterSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid roaster payload.', issues: parsed.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('roasters')
      .insert({
        name: parsed.data.name,
        location: parsed.data.location,
        ethos: parsed.data.ethos,
        equipment: parsed.data.equipment,
        logo: parsed.data.logo,
        website: parsed.data.website ?? null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Unable to add roaster.' }, { status: 500 });
    }

    return NextResponse.json({
      roaster: {
        id: data.id,
        name: data.name,
        location: data.location,
        ethos: data.ethos,
        equipment: data.equipment,
        logo: data.logo,
        website: data.website,
        createdBy: data.created_by,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Failed to add roaster', error);
    return NextResponse.json({ error: 'Unable to add roaster.' }, { status: 500 });
  }
}
