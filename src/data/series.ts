export interface Episode {
  number: number;
  title: string;
  duration: string;
  videoUrl: string | null;
  isFree: boolean;
  thumbnail?: string;
}

export interface Series {
  id: string;
  title: string;
  genre: string;
  views: string;
  episodes: number;
  isNew?: boolean;
  isPremium?: boolean;
  isDubbed?: boolean;
  isReal?: boolean;
  thumbnail: string;
  poster?: string;
  description: string;
  rating: string;
  episodeList?: Episode[];
}

export const seriesData: Series[] = [
  {
    id: "baby-at-her-door",
    title: "The Baby at Her Door",
    genre: "Romance Drama",
    views: "4.7K",
    episodes: 15,
    isNew: true,
    isReal: true,
    thumbnail: "/images/tbahd-hero.jpg",
    poster: "/images/tbahd-hero.jpg",
    description: "Cynthia, a talented news anchor orphaned young and raised by her aunt, finally finds love with Mario of Morgan Media \u2014 until a mysterious baby left at her door threatens to unravel everything. As her jealous cousin Oceane schemes to tear them apart, Cynthia must fight to protect her love, her career, and a secret that could destroy them all.",
    rating: "4.8",
    episodeList: [
      { number: 1, title: "The Baby at Her Door", duration: "3:40", videoUrl: "/api/video?ep=1", isFree: true, thumbnail: "/images/episodes/tbahd-ep1.jpg" },
      { number: 2, title: "Secrets Unfold", duration: "3:08", videoUrl: "/api/video?ep=2", isFree: true, thumbnail: "/images/episodes/tbahd-ep2.jpg" },
      { number: 3, title: "Rising Tensions", duration: "4:00", videoUrl: "/api/video?ep=3", isFree: true, thumbnail: "/images/episodes/tbahd-ep3.jpg" },
      { number: 4, title: "A Mother's Instinct", duration: "6:29", videoUrl: "/api/video?ep=4", isFree: true, thumbnail: "/images/episodes/tbahd-ep4.jpg" },
      { number: 5, title: "The Truth Emerges", duration: "8:08", videoUrl: "/api/video?ep=5", isFree: true, thumbnail: "/images/episodes/tbahd-ep5.jpg" },
      { number: 6, title: "Betrayal", duration: "8:30", videoUrl: "/api/video?ep=6", isFree: false, thumbnail: "/images/episodes/tbahd-ep6.jpg" },
      { number: 7, title: "Breaking Point", duration: "8:05", videoUrl: "/api/video?ep=7", isFree: false, thumbnail: "/images/episodes/tbahd-ep7.jpg" },
      { number: 8, title: "Hidden Enemies", duration: "8:19", videoUrl: "/api/video?ep=8", isFree: false, thumbnail: "/images/episodes/tbahd-ep8.jpg" },
      { number: 9, title: "Confrontation", duration: "10:00", videoUrl: "/api/video?ep=9", isFree: false, thumbnail: "/images/episodes/tbahd-ep9.jpg" },
      { number: 10, title: "The Reckoning", duration: "10:05", videoUrl: "/api/video?ep=10", isFree: false, thumbnail: "/images/episodes/tbahd-ep10.jpg" },
      { number: 11, title: "No Turning Back", duration: "10:00", videoUrl: "/api/video?ep=11", isFree: false, thumbnail: "/images/episodes/tbahd-ep11.jpg" },
      { number: 12, title: "Revelations", duration: "9:31", videoUrl: "/api/video?ep=12", isFree: false, thumbnail: "/images/episodes/tbahd-ep12.jpg" },
      { number: 13, title: "Finale — Love Prevails", duration: "11:09", videoUrl: "/api/video?ep=13", isFree: false, thumbnail: "/images/episodes/tbahd-ep13.jpg" },
      { number: 14, title: "The Aftermath", duration: "9:16", videoUrl: "/api/video?ep=14", isFree: false, thumbnail: "/images/episodes/tbahd-ep13.jpg" },
      { number: 15, title: "A New Beginning", duration: "10:18", videoUrl: "/api/video?ep=15", isFree: false, thumbnail: "/images/episodes/tbahd-ep13.jpg" },
    ],
  },
  {
    id: "crowned-heart",
    title: "The Crowned Heart",
    genre: "Fantasy",
    views: "64.4K",
    episodes: 8,
    isNew: true,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=1200&fit=crop",
    description: "A young queen must choose between love and duty as dark forces threaten her kingdom.",
    rating: "4.8",
    episodeList: [
      { number: 1, title: "The Coronation", duration: "3:45", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 2, title: "A Crown Divided", duration: "4:10", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 3, title: "The Dark Prophecy", duration: "5:22", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 4, title: "Betrayal at Court", duration: "6:15", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 5, title: "The Queen's Choice", duration: "7:03", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 6, title: "War of Thrones", duration: "8:40", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 7, title: "The Final Stand", duration: "9:12", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
      { number: 8, title: "Crowned Heart", duration: "10:05", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop" },
    ],
  },
  {
    id: "double-life",
    title: "Double Life",
    genre: "Family",
    views: "102.6K",
    episodes: 12,
    isDubbed: true,
    thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop",
    description: "A successful businessman hides a secret family. When both worlds collide, lives are shattered.",
    rating: "4.6",
    episodeList: [
      { number: 1, title: "Two Worlds", duration: "3:30", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 2, title: "The Secret", duration: "4:05", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 3, title: "Collision Course", duration: "4:45", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 4, title: " Lies Uncovered", duration: "5:20", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 5, title: "Family Divided", duration: "5:55", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 6, title: "Truth or Consequences", duration: "6:30", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 7, title: "The Meeting", duration: "7:15", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 8, title: "Confrontation", duration: "7:50", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 9, title: "Broken Trust", duration: "8:25", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 10, title: "Reconciliation", duration: "9:00", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 11, title: "New Beginnings", duration: "9:35", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
      { number: 12, title: "Double Life", duration: "10:20", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop" },
    ],
  },
  {
    id: "love-found-us",
    title: "Love Found Us Again",
    genre: "Elite Families",
    views: "1.5M",
    episodes: 15,
    isPremium: true,
    isDubbed: true,
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1200&fit=crop",
    description: "Two powerful families, one forbidden love. Years later, fate brings them together again.",
    rating: "4.9",
    episodeList: [
      { number: 1, title: "Forbidden Encounter", duration: "3:50", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 2, title: "A Love Remembered", duration: "4:25", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 3, title: "Family Curse", duration: "5:10", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 4, title: "Secrets Unveiled", duration: "5:55", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 5, title: "The ultimatum", duration: "6:40", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 6, title: "Crossed Paths", duration: "7:15", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 7, title: "The Engagement", duration: "7:50", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 8, title: "Hidden Letters", duration: "8:25", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 9, title: "Torn Apart", duration: "9:00", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 10, title: "The Reunion", duration: "9:35", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 11, title: "Fate Intervenes", duration: "10:10", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 12, title: "Love Prevails", duration: "10:45", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 13, title: "Aftermath", duration: "11:20", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 14, title: "New Chapter", duration: "11:55", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
      { number: 15, title: "Love Found Us", duration: "12:30", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop" },
    ],
  },
  {
    id: "stronger-than-yesterday",
    title: "Stronger Than Yesterday",
    genre: "Youth",
    views: "249.5K",
    episodes: 10,
    isDubbed: true,
    thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop",
    description: "A young woman rises from the ashes of a toxic relationship to become who she was meant to be.",
    rating: "4.9",
    episodeList: [
      { number: 1, title: "Breaking Point", duration: "3:25", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 2, title: "Starting Over", duration: "4:00", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 3, title: "New Friends", duration: "4:35", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 4, title: "Dreams Rise", duration: "5:10", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 5, title: "Setbacks", duration: "5:45", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 6, title: "Inner Strength", duration: "6:20", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 7, title: "The Comeback", duration: "6:55", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 8, title: "Redemption", duration: "7:30", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 9, title: "Crowned Soul", duration: "8:05", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
      { number: 10, title: "Stronger Than Yesterday", duration: "8:40", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop" },
    ],
  },
  {
    id: "when-love-kills",
    title: "When Love Kills",
    genre: "Drama",
    views: "127.7K",
    episodes: 9,
    thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop",
    poster: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&h=1200&fit=crop",
    description: "A passionate affair turns deadly when obsession masquerades as love.",
    rating: "4.8",
    episodeList: [
      { number: 1, title: "Fatal Attraction", duration: "3:40", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 2, title: "Obsession", duration: "4:15", videoUrl: null, isFree: true, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 3, title: "Jealous Games", duration: "4:50", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 4, title: "Warning Signs", duration: "5:25", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 5, title: "The Trap", duration: "6:00", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 6, title: "No Escape", duration: "6:35", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 7, title: "Deadly Secret", duration: "7:10", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 8, title: "The Confrontation", duration: "7:45", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
      { number: 9, title: "When Love Kills", duration: "8:20", videoUrl: null, isFree: false, thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop" },
    ],
  },
];

export const getSeriesById = (id: string): Series | undefined => {
  return seriesData.find((s) => s.id === id);
};

export const getEpisode = (seriesId: string, episodeNum: number): Episode | undefined => {
  const s = getSeriesById(seriesId);
  return s?.episodeList?.find((e) => e.number === episodeNum);
};
