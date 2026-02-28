'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type Roaster = {
  id: string;
  name: string;
  location: string;
  ethos: string;
  equipment: string;
  logo: string;
  website?: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Post = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  coffeeName: string;
  coffeeUrl?: string;
  roasterId: string;
  roasterName: string;
  brewMethod: string;
  coffeeWeight: number;
  waterWeight: number;
  ratio: string;
  country?: string;
  varietal?: string;
  process?: string;
  tasteNotes: string;
  flavorProfiles?: string[];
  rating: number;
  aiAdvice?: string;
  likes: number;
  color: string; // For the post-it note color
  createdAt: Date;
};

export const FLAVOR_PROFILES = [
  'Fruity',
  'Floral',
  'Chocolatey',
  'Nutty',
  'Sweet',
  'Savory',
  'Spicy',
  'Earthy',
];

export const RANKS = [
  { minXp: 0, name: 'Instant Coffee Drinker', icon: '🥄' },
  { minXp: 100, name: 'Pod Popper', icon: '☕' },
  { minXp: 250, name: 'French Press Fanatic', icon: '🫖' },
  { minXp: 500, name: 'Pour Over Padawan', icon: '💧' },
  { minXp: 1000, name: 'Espresso Master', icon: '⚡' },
  { minXp: 2000, name: 'Coffee Wizard', icon: '🧙‍♂️' },
];

export function getUserStats(userId: string, posts: Post[]) {
  const userPosts = posts.filter(p => p.userId === userId);
  
  // XP Calculation: 50 per post, 10 per like received
  const xpFromPosts = userPosts.length * 50;
  const xpFromLikes = userPosts.reduce((acc, p) => acc + p.likes * 10, 0);
  const totalXp = xpFromPosts + xpFromLikes;

  // Rank Calculation
  const currentRank = [...RANKS].reverse().find(r => totalXp >= r.minXp) || RANKS[0];
  const nextRank = RANKS.find(r => r.minXp > totalXp);
  const xpToNextRank = nextRank ? nextRank.minXp - totalXp : 0;
  const progressToNextRank = nextRank ? ((totalXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100 : 100;

  // Streak Calculation
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique dates of posts (ignoring time)
  const postDates = Array.from(new Set(userPosts.map(p => {
    const d = new Date(p.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))).sort((a, b) => b - a); // Descending

  if (postDates.length > 0) {
    const mostRecent = postDates[0];
    const diffDays = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) { // Posted today or yesterday
      streak = 1;
      for (let i = 1; i < postDates.length; i++) {
        const prevDate = postDates[i - 1];
        const currDate = postDates[i];
        const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Flavor Profile Radar Data
  const flavorCounts: Record<string, number> = {};
  FLAVOR_PROFILES.forEach(f => flavorCounts[f] = 0);
  
  userPosts.forEach(p => {
    if (p.flavorProfiles) {
      p.flavorProfiles.forEach(f => {
        if (flavorCounts[f] !== undefined) flavorCounts[f]++;
      });
    }
  });

  const radarData = Object.keys(flavorCounts).map(flavor => ({
    subject: flavor,
    A: flavorCounts[flavor],
    fullMark: Math.max(...Object.values(flavorCounts), 5) // Dynamic scale, min 5
  }));

  return {
    totalXp,
    currentRank,
    nextRank,
    xpToNextRank,
    progressToNextRank,
    streak,
    radarData
  };
}

type AppState = {
  currentUser: User | null;
  posts: Post[];
  roasters: Roaster[];
  login: (name: string) => void;
  logout: () => void;
  addPost: (post: Omit<Post, 'id' | 'userId' | 'userName' | 'userAvatar' | 'likes' | 'createdAt'>) => void;
  likePost: (postId: string) => void;
  addRoaster: (roaster: Omit<Roaster, 'id'>) => string;
};

export const BADGES: Badge[] = [
  { id: 'first', icon: '🌱', name: 'Sprout', description: 'Logged your first brew' },
  { id: 'explorer', icon: '🗺️', name: 'Explorer', description: 'Tried 3 different roasters' },
  { id: 'scientist', icon: '🔬', name: 'Mad Scientist', description: 'Used 3 different brew methods' },
  { id: 'critic', icon: '⭐', name: 'Golden Palate', description: 'Rated a brew 5 stars' },
  { id: 'addict', icon: '🔥', name: 'On Fire', description: 'Logged 5 total brews' },
];

export function getUserBadges(userId: string, posts: Post[]): Badge[] {
  const userPosts = posts.filter(p => p.userId === userId);
  const earned: Badge[] = [];

  if (userPosts.length >= 1) earned.push(BADGES.find(b => b.id === 'first')!);
  
  const uniqueRoasters = new Set(userPosts.map(p => p.roasterId)).size;
  if (uniqueRoasters >= 3) earned.push(BADGES.find(b => b.id === 'explorer')!);

  const uniqueMethods = new Set(userPosts.map(p => p.brewMethod)).size;
  if (uniqueMethods >= 3) earned.push(BADGES.find(b => b.id === 'scientist')!);

  const has5Star = userPosts.some(p => p.rating === 5);
  if (has5Star) earned.push(BADGES.find(b => b.id === 'critic')!);

  if (userPosts.length >= 5) earned.push(BADGES.find(b => b.id === 'addict')!);

  return earned;
}

const MOCK_ROASTERS: Roaster[] = [
  {
    id: 'r1',
    name: 'Onyx Coffee Lab',
    location: 'Rogers, AR',
    ethos: 'Never Settle for Good Enough. We travel to find the absolute best coffees, maintaining high standards for quality and transparency.',
    equipment: 'Loring Smart Roasters, Victoria Arduino Espresso',
    logo: '☕',
    website: 'https://onyxcoffeelab.com',
  },
  {
    id: 'r2',
    name: 'Verve Coffee Roasters',
    location: 'Santa Cruz, CA',
    ethos: 'Coffee is our craft, our ritual, our passion. We source and roast the most unique coffees from around the world.',
    equipment: 'Probat Roasters, Kees van der Westen',
    logo: '🌊',
    website: 'https://vervecoffee.com',
  },
  {
    id: 'r3',
    name: 'Intelligentsia Coffee',
    location: 'Chicago, IL',
    ethos: 'Pioneers of direct trade. We believe in illuminating the journey from seed to cup.',
    equipment: 'Gothot Roasters, La Marzocco',
    logo: '🌟',
    website: 'https://intelligentsia.com',
  },
  {
    id: 'r4',
    name: 'Stumptown Coffee Roasters',
    location: 'Portland, OR',
    ethos: 'Good coffee is a right, not a privilege. We are committed to sourcing, roasting, and brewing the best coffees.',
    equipment: 'Probat Roasters, La Marzocco',
    logo: '🌲',
    website: 'https://stumptowncoffee.com',
  },
  {
    id: 'r5',
    name: 'Counter Culture Coffee',
    location: 'Durham, NC',
    ethos: 'Dedicated to finding and bringing to market the most exciting and authentic coffees in the world.',
    equipment: 'Loring Smart Roasters',
    logo: '🔄',
    website: 'https://counterculturecoffee.com',
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    userName: 'Matcha Mochi',
    userAvatar: '🍡',
    coffeeName: 'Southern Weather',
    coffeeUrl: 'https://onyxcoffeelab.com/products/southern-weather',
    roasterId: 'r1',
    roasterName: 'Onyx Coffee Lab',
    brewMethod: 'V60',
    coffeeWeight: 15,
    waterWeight: 240,
    ratio: '1:16.0',
    country: 'Colombia & Ethiopia',
    varietal: 'Blend',
    process: 'Washed',
    tasteNotes: 'Milk chocolate, plum, and candied walnuts. Super balanced and sweet!',
    flavorProfiles: ['Chocolatey', 'Sweet', 'Fruity'],
    rating: 4.5,
    aiAdvice: 'Try grinding slightly finer or pouring a bit slower to extract more sweetness and balance out that acidity!',
    likes: 12,
    color: 'bg-pink-100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 'p2',
    userId: 'u3',
    userName: 'Boba Bear',
    userAvatar: '🧋',
    coffeeName: 'Sermon',
    coffeeUrl: 'https://vervecoffee.com/products/sermon',
    roasterId: 'r2',
    roasterName: 'Verve Coffee Roasters',
    brewMethod: 'Aeropress',
    coffeeWeight: 18,
    waterWeight: 250,
    ratio: '1:13.9',
    country: 'Blend',
    process: 'Washed & Natural',
    tasteNotes: 'Blueberry pie, cocoa, and heavy body. Perfect for a rainy morning.',
    flavorProfiles: ['Chocolatey', 'Sweet', 'Fruity'],
    rating: 5,
    likes: 8,
    color: 'bg-amber-100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 'p3',
    userId: 'u4',
    userName: 'Star Catcher',
    userAvatar: '🌟',
    coffeeName: 'Hair Bender',
    coffeeUrl: 'https://stumptowncoffee.com/products/hair-bender',
    roasterId: 'r4',
    roasterName: 'Stumptown Coffee Roasters',
    brewMethod: 'Chemex',
    coffeeWeight: 30,
    waterWeight: 450,
    ratio: '1:15.0',
    country: 'Latin America, Africa & Indonesia',
    varietal: 'Blend',
    process: 'Washed',
    tasteNotes: 'Citrus and dark chocolate notes! A little weak, maybe I poured too fast.',
    flavorProfiles: ['Chocolatey', 'Fruity'],
    rating: 3,
    aiAdvice: 'With Chemex, a slower pour helps. Try breaking your pour into 3-4 distinct phases to increase contact time and body.',
    likes: 24,
    color: 'bg-teal-100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

const AppContext = createContext<AppState | undefined>(undefined);

const AVATARS = ['🌸', '🍡', '🍓', '🧸', '🎀', '☁️', '✨', '🍑'];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [roasters, setRoasters] = useState<Roaster[]>(MOCK_ROASTERS);

  const login = (name: string) => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setCurrentUser({
      id: 'u1', // Mock ID for current user
      name,
      avatar: randomAvatar,
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addRoaster = (roasterData: Omit<Roaster, 'id'>) => {
    const newId = `r${Date.now()}`;
    const newRoaster: Roaster = {
      ...roasterData,
      id: newId,
    };
    setRoasters([...roasters, newRoaster]);
    return newId;
  };

  const addPost = (postData: Omit<Post, 'id' | 'userId' | 'userName' | 'userAvatar' | 'likes' | 'createdAt'>) => {
    if (!currentUser) return;
    
    const newPost: Post = {
      ...postData,
      id: `p${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      likes: 0,
      createdAt: new Date(),
    };
    
    setPosts([newPost, ...posts]);
  };

  const likePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <AppContext.Provider value={{ currentUser, posts, roasters, login, logout, addPost, likePost, addRoaster }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
