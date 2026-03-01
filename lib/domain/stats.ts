import { BADGES, FLAVOR_PROFILES, RANKS } from '@/lib/domain/constants';
import type { AchievementProgress, Badge, UserStats } from '@/lib/domain/types';

export type StatsPostInput = {
  id: string;
  userId: string;
  roasterId: string;
  brewMethod: string;
  flavorProfiles: string[];
  rating: number;
  likesCount: number;
  country: string | null;
  process: string | null;
  createdAt: string;
};

export function getUserStats(userId: string, posts: StatsPostInput[]): UserStats {
  const userPosts = posts.filter((post) => post.userId === userId);
  const xpFromPosts = userPosts.length * 50;
  const xpFromLikes = userPosts.reduce((sum, post) => sum + post.likesCount * 10, 0);
  const totalXp = xpFromPosts + xpFromLikes;

  const currentRank = [...RANKS].reverse().find((rank) => totalXp >= rank.minXp) ?? RANKS[0];
  const nextRank = RANKS.find((rank) => rank.minXp > totalXp) ?? null;
  const xpToNextRank = nextRank ? nextRank.minXp - totalXp : 0;
  const progressToNextRank = nextRank
    ? ((totalXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100
    : 100;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const postDates = Array.from(
    new Set(
      userPosts.map((post) => {
        const date = new Date(post.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    ),
  ).sort((a, b) => b - a);

  if (postDates.length > 0) {
    const latest = postDates[0];
    const diffDays = Math.floor((today.getTime() - latest) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak = 1;

      for (let index = 1; index < postDates.length; index += 1) {
        const prev = postDates[index - 1];
        const current = postDates[index];
        const dayDiff = Math.floor((prev - current) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          streak += 1;
        } else {
          break;
        }
      }
    }
  }

  const flavorCounts = Object.fromEntries(FLAVOR_PROFILES.map((flavor) => [flavor, 0])) as Record<
    string,
    number
  >;

  for (const post of userPosts) {
    for (const flavor of post.flavorProfiles) {
      if (flavor in flavorCounts) {
        flavorCounts[flavor] += 1;
      }
    }
  }

  const radarData = Object.entries(flavorCounts).map(([flavor, count]) => ({
    subject: flavor,
    A: count,
    fullMark: Math.max(...Object.values(flavorCounts), 5),
  }));

  return {
    totalXp,
    currentRank,
    nextRank,
    xpToNextRank,
    progressToNextRank,
    streak,
    radarData,
  };
}

export function getUserBadges(userId: string, posts: StatsPostInput[]): Badge[] {
  return getAchievementProgress(userId, posts)
    .filter((achievement) => achievement.earned)
    .map(({ progress, target, earned, progressLabel, ...badge }) => badge);
}

export function getAchievementProgress(userId: string | null, posts: StatsPostInput[]): AchievementProgress[] {
  if (!userId) {
    return BADGES.map((badge) => ({
      ...badge,
      earned: false,
      progress: 0,
      target: 1,
      progressLabel: 'Sign in to start earning this achievement.',
    }));
  }

  const userPosts = posts
    .filter((post) => post.userId === userId)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  const streak = getUserStats(userId, posts).streak;
  const totalPosts = userPosts.length;
  const uniqueRoasters = new Set(userPosts.map((post) => post.roasterId)).size;
  const uniqueMethods = new Set(userPosts.map((post) => post.brewMethod)).size;
  const uniqueCountries = new Set(
    userPosts
      .map((post) => post.country?.trim())
      .filter((country): country is string => Boolean(country) && country!.toLowerCase() !== 'blend'),
  ).size;
  const uniqueProcesses = new Set(
    userPosts.map((post) => post.process?.trim()).filter((process): process is string => Boolean(process)),
  ).size;
  const distinctFlavors = new Set(userPosts.flatMap((post) => post.flavorProfiles)).size;
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likesCount, 0);
  const maxLikes = userPosts.reduce((max, post) => Math.max(max, post.likesCount), 0);
  const highRatings = userPosts.filter((post) => post.rating >= 4.5).length;
  const fiveStars = userPosts.some((post) => post.rating === 5);
  const weekendPosts = userPosts.filter((post) => {
    const day = new Date(post.createdAt).getDay();
    return day === 0 || day === 6;
  }).length;
  const fruityPosts = userPosts.filter((post) => post.flavorProfiles.includes('Fruity')).length;
  const floralPosts = userPosts.filter((post) => post.flavorProfiles.includes('Floral')).length;
  const chocolateyPosts = userPosts.filter((post) => post.flavorProfiles.includes('Chocolatey')).length;
  const sweetPosts = userPosts.filter((post) => post.flavorProfiles.includes('Sweet')).length;
  const coreMethods = new Set(['V60', 'Aeropress', 'Chemex', 'Espresso', 'French Press', 'Batch Brew']);
  const usedCoreMethods = new Set(userPosts.map((post) => post.brewMethod).filter((method) => coreMethods.has(method))).size;

  const methodCounts = new Map<string, number>();
  const roasterCounts = new Map<string, number>();
  for (const post of userPosts) {
    methodCounts.set(post.brewMethod, (methodCounts.get(post.brewMethod) ?? 0) + 1);
    roasterCounts.set(post.roasterId, (roasterCounts.get(post.roasterId) ?? 0) + 1);
  }
  const maxMethodCount = Math.max(0, ...methodCounts.values());
  const maxRoasterCount = Math.max(0, ...roasterCounts.values());

  let bestRatingsRun = 0;
  let currentRatingsRun = 0;
  for (const post of userPosts) {
    if (post.rating >= 4) {
      currentRatingsRun += 1;
      bestRatingsRun = Math.max(bestRatingsRun, currentRatingsRun);
    } else {
      currentRatingsRun = 0;
    }
  }

  const firstThreeLikes = userPosts.slice(0, 3).reduce((sum, post) => sum + post.likesCount, 0);
  const brewsAtTenLikes = userPosts.filter((post) => post.likesCount >= 10).length;

  const topFivePostIds = new Set(
    [...posts]
      .sort((left, right) => right.likesCount - left.likesCount || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5)
      .map((post) => post.id),
  );
  const hasPinnedBrew = userPosts.some((post) => topFivePostIds.has(post.id) && post.likesCount > 0);

  const earliestPostByRoaster = new Map<string, StatsPostInput>();
  for (const post of posts) {
    const current = earliestPostByRoaster.get(post.roasterId);
    if (!current || new Date(post.createdAt).getTime() < new Date(current.createdAt).getTime()) {
      earliestPostByRoaster.set(post.roasterId, post);
    }
  }
  const scoutCount = Array.from(earliestPostByRoaster.values()).filter((post) => post.userId === userId).length;

  const progressById: Record<string, Omit<AchievementProgress, 'id' | 'name' | 'description' | 'icon' | 'category'>> = {
    first: {
      earned: totalPosts >= 1,
      progress: totalPosts,
      target: 1,
      progressLabel: `${Math.min(totalPosts, 1)}/1 brew logged`,
    },
    addict: {
      earned: totalPosts >= 5,
      progress: totalPosts,
      target: 5,
      progressLabel: `${Math.min(totalPosts, 5)}/5 brews`,
    },
    'heavy-rotation': {
      earned: totalPosts >= 10,
      progress: totalPosts,
      target: 10,
      progressLabel: `${Math.min(totalPosts, 10)}/10 brews`,
    },
    'top-shelf': {
      earned: totalPosts >= 25,
      progress: totalPosts,
      target: 25,
      progressLabel: `${Math.min(totalPosts, 25)}/25 brews`,
    },
    explorer: {
      earned: uniqueRoasters >= 3,
      progress: uniqueRoasters,
      target: 3,
      progressLabel: `${Math.min(uniqueRoasters, 3)}/3 roasters`,
    },
    'origin-hunter': {
      earned: uniqueCountries >= 5,
      progress: uniqueCountries,
      target: 5,
      progressLabel: `${Math.min(uniqueCountries, 5)}/5 countries`,
    },
    'process-nerd': {
      earned: uniqueProcesses >= 3,
      progress: uniqueProcesses,
      target: 3,
      progressLabel: `${Math.min(uniqueProcesses, 3)}/3 processes`,
    },
    scientist: {
      earned: uniqueMethods >= 3,
      progress: uniqueMethods,
      target: 3,
      progressLabel: `${Math.min(uniqueMethods, 3)}/3 methods`,
    },
    'across-menu': {
      earned: usedCoreMethods >= coreMethods.size,
      progress: usedCoreMethods,
      target: coreMethods.size,
      progressLabel: `${Math.min(usedCoreMethods, coreMethods.size)}/${coreMethods.size} core methods`,
    },
    'loyal-pour': {
      earned: maxMethodCount >= 5,
      progress: maxMethodCount,
      target: 5,
      progressLabel: `${Math.min(maxMethodCount, 5)}/5 brews with one method`,
    },
    'roaster-devotee': {
      earned: maxRoasterCount >= 3,
      progress: maxRoasterCount,
      target: 3,
      progressLabel: `${Math.min(maxRoasterCount, 3)}/3 brews from one roaster`,
    },
    critic: {
      earned: fiveStars,
      progress: fiveStars ? 1 : 0,
      target: 1,
      progressLabel: fiveStars ? '5-star brew logged' : '0/1 five-star brew',
    },
    'dialed-in': {
      earned: highRatings >= 3,
      progress: highRatings,
      target: 3,
      progressLabel: `${Math.min(highRatings, 3)}/3 high-rated brews`,
    },
    'consistent-palate': {
      earned: bestRatingsRun >= 5,
      progress: bestRatingsRun,
      target: 5,
      progressLabel: `${Math.min(bestRatingsRun, 5)}/5 in a row`,
    },
    'community-favorite': {
      earned: totalLikes >= 10,
      progress: totalLikes,
      target: 10,
      progressLabel: `${Math.min(totalLikes, 10)}/10 total likes`,
    },
    'crowd-pleaser': {
      earned: totalLikes >= 25,
      progress: totalLikes,
      target: 25,
      progressLabel: `${Math.min(totalLikes, 25)}/25 total likes`,
    },
    'viral-cup': {
      earned: maxLikes >= 15,
      progress: maxLikes,
      target: 15,
      progressLabel: `${Math.min(maxLikes, 15)}/15 likes on one brew`,
    },
    'breakout-brewer': {
      earned: firstThreeLikes >= 5,
      progress: firstThreeLikes,
      target: 5,
      progressLabel: `${Math.min(firstThreeLikes, 5)}/5 likes across first 3 brews`,
    },
    pinned: {
      earned: hasPinnedBrew,
      progress: hasPinnedBrew ? 1 : 0,
      target: 1,
      progressLabel: hasPinnedBrew ? 'A brew is pinned in the top 5' : '0/1 top-5 brew',
    },
    'taste-maker': {
      earned: brewsAtTenLikes >= 3,
      progress: brewsAtTenLikes,
      target: 3,
      progressLabel: `${Math.min(brewsAtTenLikes, 3)}/3 brews at 10 likes`,
    },
    'roaster-scout': {
      earned: scoutCount >= 1,
      progress: scoutCount,
      target: 1,
      progressLabel: scoutCount > 0 ? `${scoutCount} first-to-log roaster${scoutCount === 1 ? '' : 's'}` : '0/1 first-to-log roaster',
    },
    'weekend-warrior': {
      earned: weekendPosts >= 3,
      progress: weekendPosts,
      target: 3,
      progressLabel: `${Math.min(weekendPosts, 3)}/3 weekend brews`,
    },
    'streak-starter': {
      earned: streak >= 3,
      progress: streak,
      target: 3,
      progressLabel: `${Math.min(streak, 3)}/3 streak days`,
    },
    'on-a-roll': {
      earned: streak >= 7,
      progress: streak,
      target: 7,
      progressLabel: `${Math.min(streak, 7)}/7 streak days`,
    },
    'flavor-chaser': {
      earned: distinctFlavors >= 5,
      progress: distinctFlavors,
      target: 5,
      progressLabel: `${Math.min(distinctFlavors, 5)}/5 flavor tags`,
    },
    'fruit-bomb': {
      earned: fruityPosts >= 5,
      progress: fruityPosts,
      target: 5,
      progressLabel: `${Math.min(fruityPosts, 5)}/5 fruity brews`,
    },
    'floral-focus': {
      earned: floralPosts >= 5,
      progress: floralPosts,
      target: 5,
      progressLabel: `${Math.min(floralPosts, 5)}/5 floral brews`,
    },
    'chocolate-route': {
      earned: chocolateyPosts >= 5,
      progress: chocolateyPosts,
      target: 5,
      progressLabel: `${Math.min(chocolateyPosts, 5)}/5 chocolatey brews`,
    },
    'sweet-tooth': {
      earned: sweetPosts >= 5,
      progress: sweetPosts,
      target: 5,
      progressLabel: `${Math.min(sweetPosts, 5)}/5 sweet brews`,
    },
  };

  return BADGES.map((badge) => ({
    ...badge,
    ...progressById[badge.id],
  }));
}
