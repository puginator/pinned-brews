export type ProfileRole = 'user' | 'admin';
export type ContentStatus = 'active' | 'hidden' | 'removed';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';
export type ReportTarget = 'post' | 'roaster' | 'profile';
export type AchievementCategory = 'milestone' | 'discovery' | 'craft' | 'community' | 'rhythm' | 'flavor';

export type ProfileRecord = {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  role: ProfileRole;
  createdAt: string;
  updatedAt: string;
};

export type Viewer = {
  id: string;
  email: string | null;
  profile: ProfileRecord | null;
} | null;

export type RoasterRecord = {
  id: string;
  name: string;
  location: string;
  ethos: string;
  equipment: string;
  logo: string;
  website: string | null;
  createdBy: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type PostRecord = {
  id: string;
  userId: string;
  coffeeName: string;
  coffeeUrl: string | null;
  roasterId: string;
  brewMethod: string;
  coffeeWeight: number;
  waterWeight: number;
  ratio: string;
  country: string | null;
  varietal: string | null;
  process: string | null;
  tasteNotes: string;
  flavorProfiles: string[];
  rating: number;
  aiAdvice: string | null;
  color: string;
  likesCount: number;
  reportsCount: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type FeedPost = PostRecord & {
  author: Pick<ProfileRecord, 'id' | 'handle' | 'displayName' | 'avatar'>;
  roaster: Pick<RoasterRecord, 'id' | 'name' | 'location' | 'logo' | 'website'>;
  likedByViewer: boolean;
  reportable: boolean;
};

export type PublicProfile = ProfileRecord & {
  stats: UserStats;
  badges: Badge[];
  recentPosts: FeedPost[];
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
};

export type AchievementProgress = Badge & {
  earned: boolean;
  progress: number;
  target: number;
  progressLabel: string;
};

export type UserStats = {
  totalXp: number;
  currentRank: { minXp: number; name: string; icon: string };
  nextRank: { minXp: number; name: string; icon: string } | null;
  xpToNextRank: number;
  progressToNextRank: number;
  streak: number;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
};

export type LeaderboardEntry = {
  profile: Pick<ProfileRecord, 'id' | 'handle' | 'displayName' | 'avatar'>;
  stats: UserStats;
};

export type ModerationQueueItem = {
  id: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: Pick<ProfileRecord, 'id' | 'handle' | 'displayName' | 'avatar'>;
};

export type ReportRecord = {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

export type RoasterPassportCard = RoasterRecord & {
  communityFavorites: string[];
  postCount: number;
  pinnedByViewer: boolean;
};
