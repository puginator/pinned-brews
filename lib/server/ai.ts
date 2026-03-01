import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { AI_DAILY_LIMIT } from '@/lib/domain/constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/server/database.types';

export async function consumeAiQuota(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc('consume_ai_quota', {
    p_limit: AI_DAILY_LIMIT,
  });

  if (error) {
    throw error;
  }

  return data?.[0] ?? { allowed: false, request_count: AI_DAILY_LIMIT, remaining: 0 };
}

export async function generateBrewAdvice(input: {
  brewMethod: string;
  coffeeWeight: number;
  waterWeight: number;
  ratio: string;
  country?: string;
  varietal?: string;
  process?: string;
  tasteNotes: string;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are a concise coffee coach for a public coffee community.
Reply with 1 or 2 sentences.
Be friendly, practical, and specific.
Do not mention safety policies or disclaimers.

Recent brew:
- Method: ${input.brewMethod}
- Coffee: ${input.coffeeWeight}g
- Water: ${input.waterWeight}g
- Ratio: ${input.ratio}
- Bean Info: ${input.country ?? 'Unknown origin'}, ${input.varietal ?? 'Unknown varietal'}, ${input.process ?? 'Unknown process'}
- Taste Notes: "${input.tasteNotes}"

Give one concrete next-step adjustment.
`.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text?.trim() ?? 'Try one variable at a time on the next brew, starting with a slightly finer grind for more sweetness.';
}

