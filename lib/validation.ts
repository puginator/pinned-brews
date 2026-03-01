import { z } from 'zod';
import { BREW_METHODS, FLAVOR_PROFILES, POST_COLORS, PROFILE_AVATARS, REPORT_REASONS } from '@/lib/domain/constants';

const profanityPattern = /\b(slur|spammy|scam)\b/i;
const urlLikePattern = /^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#].*)?$/i;

const cleanedText = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .refine((value) => !profanityPattern.test(value), 'Please choose a different phrasing.');

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => {
    if (value === '') {
      return '';
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (urlLikePattern.test(value)) {
      return `https://${value}`;
    }

    return value;
  })
  .pipe(z.string().url().or(z.literal('')))
  .transform((value) => (value === '' ? undefined : value));

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

export const onboardingSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,20}$/, 'Use 3-20 lowercase letters, numbers, underscores, or periods.'),
  displayName: cleanedText(40),
  avatar: z.enum(PROFILE_AVATARS),
  bio: optionalText(160),
});

export const profileUpdateSchema = z.object({
  displayName: cleanedText(40),
  avatar: z.enum(PROFILE_AVATARS),
  bio: optionalText(160),
});

export const roasterSchema = z.object({
  name: cleanedText(80),
  location: cleanedText(80),
  ethos: cleanedText(240),
  equipment: cleanedText(120),
  logo: z.string().trim().min(1).max(8),
  website: optionalUrl.optional().transform((value) => value ?? undefined),
});

export const postSchema = z.object({
  coffeeName: cleanedText(80),
  coffeeUrl: optionalUrl.optional().transform((value) => value ?? undefined),
  roasterId: z.string().uuid(),
  brewMethod: z.enum(BREW_METHODS),
  coffeeWeight: z.number().positive().max(999.9),
  waterWeight: z.number().positive().max(9999.9),
  ratio: z.string().trim().min(3).max(24),
  country: optionalText(80),
  varietal: optionalText(80),
  process: optionalText(80),
  tasteNotes: cleanedText(500),
  flavorProfiles: z.array(z.enum(FLAVOR_PROFILES)).max(FLAVOR_PROFILES.length),
  rating: z.number().min(0.5).max(5).refine((value) => Number.isInteger(value * 2), 'Use half-star increments.'),
  aiAdvice: optionalText(280),
  color: z.enum(POST_COLORS),
});

export const brewCoachSchema = z.object({
  brewMethod: z.enum(BREW_METHODS),
  coffeeWeight: z.number().positive().max(999.9),
  waterWeight: z.number().positive().max(9999.9),
  ratio: z.string().trim().min(3).max(24),
  country: optionalText(80),
  varietal: optionalText(80),
  process: optionalText(80),
  tasteNotes: cleanedText(500),
});

export const reportSchema = z.object({
  targetType: z.enum(['post', 'roaster']),
  targetId: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
  details: optionalText(280),
});
