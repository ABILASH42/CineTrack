export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  original_language?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  imdb_id?: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTMDBImageUrl(path: string | null, size: 'w92' | 'w185' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getTMDBBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Fallback curated movies when TMDB token is not provided
const MOCK_MOVIES: TMDBMovie[] = [
  {
    id: 550,
    title: 'Fight Club',
    original_title: 'Fight Club',
    original_language: 'en',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQY85NWfDXZ8wXsWlhG45l.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 27500,
    popularity: 85.5,
    genre_ids: [18, 53],
    genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
    runtime: 139,
    tagline: 'Mischief. Mayhem. Soap.',
    imdb_id: 'tt0137523'
  },
  {
    id: 27205,
    title: 'Inception',
    original_title: 'Inception',
    original_language: 'en',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.',
    poster_path: '/oYuLE1sZBOoVx2gYmFBHQWNL8OI.jpg',
    backdrop_path: '/8ZTVqvTZm84aE2Cjqqft0mcjOi3.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 35000,
    popularity: 120.2,
    genre_ids: [28, 878, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    imdb_id: 'tt1375666'
  },
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    original_language: 'en',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsX2f.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 33000,
    popularity: 145.8,
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    imdb_id: 'tt0816692'
  },
  {
    id: 238,
    title: 'The Godfather',
    original_title: 'The Godfather',
    original_language: 'en',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/rSPw7tgCH9c6NqICZefy2aUMwc5.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 19800,
    popularity: 110.4,
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    runtime: 175,
    tagline: "An offer you can't refuse.",
    imdb_id: 'tt0068646'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    original_language: 'en',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMK28FiMGMsOoOoGLFl3wF8vuC.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 31000,
    popularity: 130.6,
    genre_ids: [18, 28, 80, 53],
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }],
    runtime: 152,
    tagline: 'Welcome to a world without rules.',
    imdb_id: 'tt0468569'
  },
  {
    id: 496243,
    title: 'Parasite',
    original_title: '기생충',
    original_language: 'ko',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood.',
    poster_path: '/7IiTpwF9F12A97fW7y3jN7dM2u8.jpg',
    backdrop_path: '/hiKmpZMGZOSnA3fUZMsuwV1evxD.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 17800,
    popularity: 98.4,
    genre_ids: [35, 53, 18],
    genres: [{ id: 35, name: 'Comedy' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    runtime: 132,
    tagline: 'Act like you own the place.',
    imdb_id: 'tt6751668'
  }
];

const GENRES: TMDBGenre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

function getHeaders() {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token) return null;
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export async function getTrendingMovies(): Promise<TMDBMovie[]> {
  const headers = getHeaders();
  if (!headers) return MOCK_MOVIES;

  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?language=en-US`, {
      headers,
      next: { revalidate: 3600 }
    });
    if (!res.ok) return MOCK_MOVIES;
    const data: TMDBSearchResponse = await res.json();
    return data.results || MOCK_MOVIES;
  } catch {
    return MOCK_MOVIES;
  }
}

export async function getPopularMovies(page = 1): Promise<TMDBSearchResponse> {
  const headers = getHeaders();
  if (!headers) {
    return {
      page: 1,
      results: MOCK_MOVIES,
      total_pages: 1,
      total_results: MOCK_MOVIES.length
    };
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`, {
      headers,
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      return { page: 1, results: MOCK_MOVIES, total_pages: 1, total_results: MOCK_MOVIES.length };
    }
    return await res.json();
  } catch {
    return { page: 1, results: MOCK_MOVIES, total_pages: 1, total_results: MOCK_MOVIES.length };
  }
}

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) return getPopularMovies(page);
  const headers = getHeaders();

  if (!headers) {
    const filtered = MOCK_MOVIES.filter(m => 
      m.title.toLowerCase().includes(query.toLowerCase()) || 
      m.overview.toLowerCase().includes(query.toLowerCase())
    );
    return {
      page: 1,
      results: filtered,
      total_pages: 1,
      total_results: filtered.length
    };
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`, {
      headers,
      next: { revalidate: 1800 }
    });
    if (!res.ok) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    return await res.json();
  } catch {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getMovieDetails(tmdbId: number): Promise<TMDBMovie | null> {
  const headers = getHeaders();

  if (!headers) {
    const mock = MOCK_MOVIES.find(m => m.id === tmdbId) || MOCK_MOVIES[0];
    return mock;
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`, {
      headers,
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getGenres(): Promise<TMDBGenre[]> {
  const headers = getHeaders();
  if (!headers) return GENRES;

  try {
    const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list?language=en-US`, {
      headers,
      next: { revalidate: 604800 }
    });
    if (!res.ok) return GENRES;
    const data = await res.json();
    return data.genres || GENRES;
  } catch {
    return GENRES;
  }
}
