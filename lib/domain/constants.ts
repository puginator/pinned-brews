export const APP_NAME = 'Pinned Brews';

export const CORE_BREW_METHODS = [
  'V60',
  'Kalita Wave',
  'Aeropress',
  'Clever Dripper',
  'Chemex',
  'Espresso',
  'Hario Switch',
  'Origami',
  'Fellow Stagg X',
  'French Press',
  'Moka Pot',
  'Batch Brew',
] as const;

export const BREW_METHODS = [
  ...CORE_BREW_METHODS,
  'Other',
] as const;

export type BrewMethodMeta = {
  label: string;
  icon: string;
  assetPath?: string;
};

export const BREW_METHOD_META = [
  { label: 'V60', icon: 'V', assetPath: '/brew-methods/v60.svg' },
  { label: 'Kalita Wave', icon: '◌', assetPath: '/brew-methods/kalita-wave.svg' },
  { label: 'Aeropress', icon: 'A', assetPath: '/brew-methods/aeropress.svg' },
  { label: 'Clever Dripper', icon: 'C', assetPath: '/brew-methods/clever.svg' },
  { label: 'Chemex', icon: '⌛', assetPath: '/brew-methods/chemex.svg' },
  { label: 'Espresso', icon: '☕', assetPath: '/brew-methods/espresso.svg' },
  { label: 'Hario Switch', icon: 'S', assetPath: '/brew-methods/hario-switch.svg' },
  { label: 'Origami', icon: '△', assetPath: '/brew-methods/origami.svg' },
  { label: 'Fellow Stagg X', icon: '✦', assetPath: '/brew-methods/stagg.svg' },
  { label: 'French Press', icon: 'F', assetPath: '/brew-methods/french-press.svg' },
  { label: 'Moka Pot', icon: '⬢', assetPath: '/brew-methods/moka-pot.svg' },
  { label: 'Batch Brew', icon: 'B', assetPath: '/brew-methods/batch-brewer.svg' },
  { label: 'Other', icon: '…', assetPath: '/brew-methods/other.svg' },
] as const satisfies readonly BrewMethodMeta[];

export function getBrewMethodMeta(method: string): BrewMethodMeta {
  return BREW_METHOD_META.find((entry) => entry.label === method) ?? { label: method, icon: '…', assetPath: '/brew-methods/other.svg' };
}

export const FLAVOR_PROFILES = [
  'Fruity',
  'Floral',
  'Chocolatey',
  'Nutty',
  'Sweet',
  'Savory',
  'Spicy',
  'Earthy',
] as const;

export const POST_COLORS = [
  'bg-rose-100',
  'bg-amber-100',
  'bg-teal-100',
  'bg-sky-100',
  'bg-lime-100',
  'bg-orange-100',
] as const;

export const PROFILE_AVATARS = [
  '☕',
  '🫖',
  '🌿',
  '🌊',
  '🌙',
  '✨',
  '🍓',
  '🍊',
  '🍒',
  '🍯',
  '🌸',
  '🪴',
  '🧋',
  '🥐',
  '🍩',
  '🧠',
  '🛰️',
  '🎯',
  '🎨',
  '📌',
  '🪩',
  '🔥',
  '⚡',
  '🌞',
  '☁️',
] as const;

export const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate speech',
  'NSFW',
  'Impersonation',
  'Misinformation',
  'Other',
] as const;

export const AI_DAILY_LIMIT = 10;

export const WRITE_RATE_LIMIT = {
  limit: 20,
  windowSeconds: 60,
} as const;

export const RANKS = [
  { minXp: 0, name: 'Curious Sipper', icon: '☕' },
  { minXp: 100, name: 'Pour Over Rookie', icon: '🫖' },
  { minXp: 250, name: 'Origin Hunter', icon: '🧭' },
  { minXp: 500, name: 'Flavor Cartographer', icon: '🗺️' },
  { minXp: 1000, name: 'Pinned Regular', icon: '📌' },
  { minXp: 2000, name: 'Brew Authority', icon: '🏆' },
] as const;

export const BADGES = [
  { id: 'first', icon: '🌱', name: 'First Pin', description: 'Log your first brew', category: 'milestone' },
  { id: 'addict', icon: '🔥', name: 'Daily Ritual', description: 'Log 5 total brews', category: 'milestone' },
  { id: 'heavy-rotation', icon: '🎛️', name: 'Heavy Rotation', description: 'Log 10 total brews', category: 'milestone' },
  { id: 'top-shelf', icon: '🏁', name: 'Top Shelf', description: 'Log 25 total brews', category: 'milestone' },
  { id: 'explorer', icon: '🗺️', name: 'Explorer', description: 'Try 3 different roasters', category: 'discovery' },
  { id: 'origin-hunter', icon: '🧭', name: 'Origin Hunter', description: 'Log coffees from 5 countries', category: 'discovery' },
  { id: 'process-nerd', icon: '🧪', name: 'Process Nerd', description: 'Log 3 different processes', category: 'discovery' },
  { id: 'scientist', icon: '🔬', name: 'Mad Scientist', description: 'Use 3 different brew methods', category: 'craft' },
  { id: 'across-menu', icon: '🗂️', name: 'Across the Menu', description: 'Use every core brew method', category: 'craft' },
  { id: 'loyal-pour', icon: '🫖', name: 'Loyal to the Pour', description: 'Log 5 brews with the same method', category: 'craft' },
  { id: 'roaster-devotee', icon: '📍', name: 'Roaster Devotee', description: 'Log 3 brews from the same roaster', category: 'craft' },
  { id: 'critic', icon: '⭐', name: 'Golden Palate', description: 'Rate a brew 5 stars', category: 'craft' },
  { id: 'dialed-in', icon: '🎯', name: 'Dialed In', description: 'Post 3 brews rated 4.5 or higher', category: 'craft' },
  { id: 'consistent-palate', icon: '📐', name: 'Consistent Palate', description: 'Post 5 brews in a row rated 4.0 or higher', category: 'craft' },
  { id: 'community-favorite', icon: '💗', name: 'Community Favorite', description: 'Earn 10 total likes', category: 'community' },
  { id: 'crowd-pleaser', icon: '🎉', name: 'Crowd Pleaser', description: 'Earn 25 total likes', category: 'community' },
  { id: 'viral-cup', icon: '🚀', name: 'Viral Cup', description: 'Get 15 likes on one brew', category: 'community' },
  { id: 'breakout-brewer', icon: '📈', name: 'Breakout Brewer', description: 'Earn 5 likes across your first 3 brews', category: 'community' },
  { id: 'pinned', icon: '📌', name: 'Pinned', description: 'Place one brew in the global top 5 by likes', category: 'community' },
  { id: 'taste-maker', icon: '🌟', name: 'Taste Maker', description: 'Have 3 brews reach 10 likes', category: 'community' },
  { id: 'roaster-scout', icon: '🛰️', name: 'Roaster Scout', description: 'Be the first to log a brew for a roaster', category: 'community' },
  { id: 'weekend-warrior', icon: '📅', name: 'Weekend Warrior', description: 'Log 3 weekend brews', category: 'rhythm' },
  { id: 'streak-starter', icon: '⚡', name: 'Streak Starter', description: 'Reach a 3-day streak', category: 'rhythm' },
  { id: 'on-a-roll', icon: '🔥', name: 'On a Roll', description: 'Reach a 7-day streak', category: 'rhythm' },
  { id: 'flavor-chaser', icon: '🎨', name: 'Flavor Chaser', description: 'Use 5 different flavor tags', category: 'flavor' },
  { id: 'fruit-bomb', icon: '🍓', name: 'Fruit Bomb', description: 'Log 5 fruity brews', category: 'flavor' },
  { id: 'floral-focus', icon: '🌸', name: 'Floral Focus', description: 'Log 5 floral brews', category: 'flavor' },
  { id: 'chocolate-route', icon: '🍫', name: 'Chocolate Route', description: 'Log 5 chocolatey brews', category: 'flavor' },
  { id: 'sweet-tooth', icon: '🍯', name: 'Sweet Tooth', description: 'Log 5 sweet brews', category: 'flavor' },
] as const;
