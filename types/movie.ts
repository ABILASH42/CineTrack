export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
}

export type WatchStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped';

export interface UserMovieLog {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  overview?: string | null;
  poster_path: string | null;
  release_date: string;
  runtime: number;
  status: WatchStatus;
  vote_average?: number | null;
  rating: number | null; // 1-10 rating scale
  review?: string | null;
  favorite?: boolean;
  watched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  item_count?: number;
  posters?: string[];
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  added_at: string;
}
