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
    episodes: 13,
    isNew: true,
    isReal: true,
    thumbnail: "/images/tbahd-hero.jpg",
    poster: "/images/tbahd-hero.jpg",
    description: "Cynthia, a talented news anchor orphaned young and raised by her aunt, finally finds love with Mario of Morgan Media \u2014 until a mysterious baby left at her door threatens to unravel everything. As her jealous cousin Oceane schemes to tear them apart, Cynthia must fight to protect her love, her career, and a secret that could destroy them all.",
    rating: "4.8",
    episodeList: [
      { number: 1, title: "The Baby at Her Door", duration: "3:40", videoUrl: "/api/video?ep=1", isFree: true, thumbnail: "/images/episodes/tbahd-ep1.jpg" },
      { number: 2, title: "Secrets Unfold", duration: "3:08", videoUrl: "/api/video?ep=2", isFree: true, thumbnail: "/images/episodes/tbahd-ep2.jpg" },
      { number: 3, title: "Rising Tensions", duration: "4:00", videoUrl: "/api/video?ep=3", isFree: false, thumbnail: "/images/episodes/tbahd-ep3.jpg" },
      { number: 4, title: "A Mother's Instinct", duration: "6:29", videoUrl: "/api/video?ep=4", isFree: false, thumbnail: "/images/episodes/tbahd-ep4.jpg" },
      { number: 5, title: "The Truth Emerges", duration: "8:08", videoUrl: "/api/video?ep=5", isFree: false, thumbnail: "/images/episodes/tbahd-ep5.jpg" },
      { number: 6, title: "Betrayal", duration: "8:30", videoUrl: "/api/video?ep=6", isFree: false, thumbnail: "/images/episodes/tbahd-ep6.jpg" },
      { number: 7, title: "Breaking Point", duration: "8:05", videoUrl: "/api/video?ep=7", isFree: false, thumbnail: "/images/episodes/tbahd-ep7.jpg" },
      { number: 8, title: "Hidden Enemies", duration: "8:19", videoUrl: "/api/video?ep=8", isFree: false, thumbnail: "/images/episodes/tbahd-ep8.jpg" },
      { number: 9, title: "Confrontation", duration: "10:00", videoUrl: "/api/video?ep=9", isFree: false, thumbnail: "/images/episodes/tbahd-ep9.jpg" },
      { number: 10, title: "The Reckoning", duration: "10:05", videoUrl: "/api/video?ep=10", isFree: false, thumbnail: "/images/episodes/tbahd-ep10.jpg" },
      { number: 11, title: "No Turning Back", duration: "10:00", videoUrl: "/api/video?ep=11", isFree: false, thumbnail: "/images/episodes/tbahd-ep11.jpg" },
      { number: 12, title: "Revelations", duration: "9:31", videoUrl: "/api/video?ep=12", isFree: false, thumbnail: "/images/episodes/tbahd-ep12.jpg" },
      { number: 13, title: "Finale — Love Prevails", duration: "11:09", videoUrl: "/api/video?ep=13", isFree: false, thumbnail: "/images/episodes/tbahd-ep13.jpg" },
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
    description: "A young queen must choose between love and duty as dark forces threaten her kingdom.",
    rating: "4.8",
  },
  {
    id: "double-life",
    title: "Double Life",
    genre: "Family",
    views: "102.6K",
    episodes: 12,
    isDubbed: true,
    thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop",
    description: "A successful businessman hides a secret family. When both worlds collide, lives are shattered.",
    rating: "4.6",
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
    description: "Two powerful families, one forbidden love. Years later, fate brings them together again.",
    rating: "4.9",
  },
  {
    id: "stronger-than-yesterday",
    title: "Stronger Than Yesterday",
    genre: "Youth",
    views: "249.5K",
    episodes: 10,
    isDubbed: true,
    thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
    description: "A young woman rises from the ashes of a toxic relationship to become who she was meant to be.",
    rating: "4.9",
  },
  {
    id: "when-love-kills",
    title: "When Love Kills",
    genre: "Drama",
    views: "127.7K",
    episodes: 9,
    thumbnail: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=600&fit=crop",
    description: "A passionate affair turns deadly when obsession masquerades as love.",
    rating: "4.8",
  },
];

export const getSeriesById = (id: string): Series | undefined => {
  return seriesData.find((s) => s.id === id);
};

export const getEpisode = (seriesId: string, episodeNum: number): Episode | undefined => {
  const s = getSeriesById(seriesId);
  return s?.episodeList?.find((e) => e.number === episodeNum);
};
